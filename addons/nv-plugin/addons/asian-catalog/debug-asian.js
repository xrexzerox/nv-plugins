#!/usr/bin/env node
/**
 * debug-asian.js — Asian catalog + plugin CLI debugger (zero dependencies, Node >= 18)
 *
 * ONE tool that tests the WHOLE asian pipeline on your own machine with real
 * network, exactly the way Nuvio runs it:
 *
 *   [1] asian-catalog addon (core.js engine — same code the CF worker runs)
 *         health / catalogs / rows / ids
 *   [2] the plugins (providers/asianhub.js + providers/pinoyhub.js)
 *         getStreams() through every lane (KissAsian Byse PoW chain,
 *         ViewAsian 3-hop embeds, KissKH keygen, Pinoymovieshub)
 *   [3] END-TO-END: every catalog row -> paired plugin -> stream link
 *         ("all" = the full 100%-streamable audit)
 *   [4] stream URL liveness (m3u8 / mp4 probe)
 *   [5] deployed-worker check (catches the "forgot to redeploy 3.2.0" trap)
 *
 * USAGE (cmd.exe / PowerShell / bash — plain ASCII output):
 *   node debug-asian.js help
 *   node debug-asian.js all                          FULL end-to-end audit (flagship)
 *   node debug-asian.js all --catalog asian-series   one catalog only
 *   node debug-asian.js all --full                   every row of every catalog (SLOW)
 *   node debug-asian.js health                       4 source probes, actual errors shown
 *   node debug-asian.js catalog series asian-series search=queen of tears
 *   node debug-asian.js catalog movie pinoy-movies
 *   node debug-asian.js stream series asian:ks-<kissasian-slug> 1 1
 *         (source-scoped ids: ks-=kissasian, va-=viewasian, pmh-=pinoymovieshub;
 *          legacy generic asian:<slug> still accepted)
 *   node debug-asian.js stream movie tmdb:496243 --plugin both
 *   node debug-asian.js verify "https://.../index.m3u8"
 *   node debug-asian.js plugins                      plugin audit (version/export/sandbox lint)
 *   node debug-asian.js sites                        reachability matrix (catalog + plugin lanes)
 *   node debug-asian.js remote https://your-worker.workers.dev
 *   node debug-asian.js get /manifest.json
 *   node debug-asian.js probe https://kissasian.cam/
 *
 * Options:
 *   --sample N     rows per catalog for `all` (default 3)
 *   --full         audit EVERY row of every catalog (slow: 10-20 min)
 *   --catalog <id> limit `all` to one catalog id
 *   --type <t>     limit `all` to movie|series
 *   --plugin <p>   auto (default) | asianhub | pinoyhub | both
 *   --verify       after a plugin hit, probe the stream URL too
 *   --trace        log EVERY outbound HTTP call (both engine and plugin)
 *   --json         machine-readable output where supported
 *   --timeout N    per-request timeout ms (default 20000)
 *   --repo <path>  repo root if you run this file from elsewhere
 *                  (expects <repo>/providers/asianhub.js + <repo>/addons/asian-catalog/core.js)
 *
 * Env overrides (same as the worker):
 *   TMDB_API_KEY / PINOY_SITE / KISSASIAN_SITE / VIEWASIAN_SITE
 *
 * Exit codes: 0 = everything passed, 1 = failures, 2 = usage error.
 * (Supersedes debug-catalog.js, which tests only the catalog side.)
 */

'use strict';

var path = require('path');
var fs = require('fs');

// ---------- node version guard ----------
var nodeMajor = parseInt(process.versions.node.split('.')[0], 10);
if (nodeMajor < 18) {
  console.error('[FAIL] Node >= 18 required (found ' + process.versions.node + ').');
  console.error('       Download: https://nodejs.org  (LTS is fine)');
  process.exit(2);
}

// ---------- arg parsing ----------
var argv = process.argv.slice(2);
var flags = {
  trace: false, json: false, timeout: 20000, verify: false,
  sample: 3, full: false, catalog: null, type: null, plugin: 'auto', repo: null
};
var positional = [];
for (var i = 0; i < argv.length; i++) {
  var a = argv[i];
  if (a === '--trace') flags.trace = true;
  else if (a === '--json') flags.json = true;
  else if (a === '--verify') flags.verify = true;
  else if (a === '--full') { flags.full = true; }
  else if (a === '--sample') { flags.sample = parseInt(argv[++i], 10) || 3; }
  else if (a === '--catalog') { flags.catalog = argv[++i]; }
  else if (a === '--type') { flags.type = argv[++i]; }
  else if (a === '--plugin') { flags.plugin = (argv[++i] || 'auto').toLowerCase(); }
  else if (a === '--timeout') { flags.timeout = parseInt(argv[++i], 10) || 20000; }
  else if (a === '--repo') { flags.repo = argv[++i]; }
  else if (a === '-h' || a === '--help' || a === 'help') { positional = ['help']; }
  else positional.push(a);
}
var command = positional.shift() || 'help';

// ---------- pretty helpers (cmd.exe-safe: plain ASCII, no ANSI colors) ----------
var OUT = [];
function log(s) { OUT.push(s == null ? '' : s); if (!flags.json) console.log(s == null ? '' : s); }
function line(ch) { log(new Array(78).join(ch || '-')); }
function fmtBytes(n) {
  if (!isFinite(n)) return '?';
  if (n < 1024) return n + ' B';
  if (n < 1024 * 1024) return (n / 1024).toFixed(1) + ' KB';
  return (n / 1024 / 1024).toFixed(2) + ' MB';
}
function maskKey(u) { return String(u).replace(/([?&]api_key=)[0-9a-fA-F]+/g, '$1***'); }
function pad(s, n) { s = String(s == null ? '' : s); return s.length >= n ? s : s + new Array(n - s.length + 1).join(' '); }
function padL(s, n) { s = String(s == null ? '' : s); return s.length >= n ? s : new Array(n - s.length + 1).join(' ') + s; }
function shortUrl(u) { return String(u).replace(/^https?:\/\//, '').slice(0, 80); }
function secs(ms) { return (ms / 1000).toFixed(1) + 's'; }

// ---------- bot / challenge page detection ----------
var BOT_MARKERS = [
  ['just a moment', 'Cloudflare JS challenge'],
  ['__cf_chl', 'Cloudflare challenge payload'],
  ['cf-challenge', 'Cloudflare challenge payload'],
  ['challenge-platform', 'Cloudflare challenge payload'],
  ['attention required', 'Cloudflare block page'],
  ['access denied', 'access-denied page'],
  [' press & hold', 'DDoS-Guard press-and-hold'],
  ['ddos-guard', 'DDoS-Guard interstitial'],
  ['captcha', 'CAPTCHA gate'],
  ['checking your browser', 'anti-bot interstitial'],
  ['enable javascript', 'JS-required shell']
];
function detectBotPage(bodyText) {
  var head = String(bodyText || '').slice(0, 4000).toLowerCase();
  for (var i = 0; i < BOT_MARKERS.length; i++) {
    if (head.indexOf(BOT_MARKERS[i][0]) !== -1) return BOT_MARKERS[i][1];
  }
  return null;
}

var BROWSER_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,application/json;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9'
};

// =====================================================================
// FETCH MACHINERY — records every outbound call made by BOTH layers:
//   * core.js engine   via env.__fetchFn (its official hook)
//   * plugins          via a temporary globalThis.fetch patch
// =====================================================================

var FETCH_LOG = [];   // {url, status, ms, bytes, bot, error}
var origFetch = null;
// The REAL Node fetch, captured once at load. The plugin patch swaps
// globalThis.fetch; anything inside THIS file must use RAW_FETCH, otherwise
// bare `fetch` resolves to the patched wrapper -> infinite recursion
// ("Maximum call stack size exceeded" / lanes silently returning []).
var RAW_FETCH = globalThis.fetch;

function fetchWithTimeout(url, opts, timeoutMs) {
  var ctl = new AbortController();
  var timer = setTimeout(function () { ctl.abort(); }, timeoutMs);
  opts = opts || {};
  opts.signal = ctl.signal;
  return RAW_FETCH.call(globalThis, url, opts).then(
    function (res) { clearTimeout(timer); return res; },
    function (err) {
      clearTimeout(timer);
      if (err && (err.name === 'AbortError' || String(err.message || '').indexOf('abort') !== -1)) {
        throw new Error('timeout after ' + timeoutMs + 'ms: ' + maskKey(url));
      }
      throw err;
    }
  );
}

// The one recorder used for both __fetchFn and the global patch.
function makeRecordingFetch(timeoutMs, verbose) {
  return function recFetch(url, opts) {
    var t0 = Date.now();
    var disp = maskKey(url);
    var method = (opts && opts.method) || 'GET';
    if (verbose) log('  --> ' + method + ' ' + disp);
    return fetchWithTimeout(url, opts, timeoutMs).then(
      function (res) {
        var clone = res.clone();
        return clone.text().catch(function () { return ''; }).then(function (body) {
          var ms = Date.now() - t0;
          FETCH_LOG.push({ url: disp, status: res.status, ms: ms, bytes: body.length, bot: detectBotPage(body), error: null });
          if (verbose) log('  <-- ' + res.status + ' ' + padL(ms, 5) + 'ms ' + padL(fmtBytes(body.length), 8) + '  ' + shortUrl(disp));
          return res;
        });
      },
      function (err) {
        var ms = Date.now() - t0;
        var msg = String((err && err.message) || err);
        FETCH_LOG.push({ url: disp, status: null, ms: ms, bytes: 0, bot: null, error: msg });
        if (verbose) { log('  [!!] ' + padL(ms, 5) + 'ms  ' + disp); log('       ERROR: ' + msg); }
        throw err;
      }
    );
  };
}

// --- global patch for plugin calls (plugins call global fetch directly) ---
function patchGlobalFetch() {
  origFetch = globalThis.fetch;
  var recorder = makeRecordingFetch(flags.timeout, flags.trace);
  globalThis.fetch = function (url, opts) { return recorder(url, opts); };
}
function unpatchGlobalFetch() {
  if (origFetch) { globalThis.fetch = origFetch; origFetch = null; }
}

// --- console capture so plugin's own [AsianHub]/[PinoyMoviesHub] lines can be shown on failure ---
var PLUGIN_LOGS = [];
var origConsoleLog = null, origConsoleError = null;
function capturePluginConsole() {
  PLUGIN_LOGS = [];
  origConsoleLog = console.log;
  origConsoleError = console.error;
  console.log = function () {
    var parts = []; for (var i = 0; i < arguments.length; i++) parts.push(String(arguments[i]));
    PLUGIN_LOGS.push(parts.join(' '));
  };
  console.error = function () {
    var parts = []; for (var i = 0; i < arguments.length; i++) parts.push(String(arguments[i]));
    PLUGIN_LOGS.push('[err] ' + parts.join(' '));
  };
}
function restorePluginConsole() {
  if (origConsoleLog) { console.log = origConsoleLog; console.error = origConsoleError; origConsoleLog = null; origConsoleError = null; }
}

// =====================================================================
// LOADERS — core.js engine + the two plugins
// =====================================================================

function repoRoot() {
  // this file lives at <repo>/addons/asian-catalog/debug-asian.js
  var here = path.resolve(__dirname);
  var guess = path.resolve(here, '..', '..');
  if (flags.repo) guess = path.resolve(flags.repo);
  if (fs.existsSync(path.join(guess, 'providers', 'asianhub.js'))) return guess;
  // fallback: run from an extracted zip folder named anything
  var alt = path.resolve(here, '..');
  if (fs.existsSync(path.join(alt, 'providers', 'asianhub.js'))) return alt;
  console.error('[FAIL] repo root not found (looked for providers/asianhub.js next to ' + here + ')');
  console.error('       Run from <repo>/addons/asian-catalog or pass --repo <path>.');
  process.exit(2);
}

var _Core = null, _asianhub = null, _pinoyhub = null;

function loadCore() {
  if (_Core) return _Core;
  var corePath = path.join(repoRoot(), 'addons', 'asian-catalog', 'core.js');
  if (!fs.existsSync(corePath)) corePath = path.join(__dirname, 'core.js');
  if (!fs.existsSync(corePath)) {
    console.error('[FAIL] core.js not found at ' + corePath);
    process.exit(2);
  }
  require(path.resolve(corePath));
  _Core = globalThis.AsianCatalogCore;
  if (!_Core) {
    console.error('[FAIL] core.js loaded but globalThis.AsianCatalogCore missing (wrong file?).');
    process.exit(2);
  }
  return _Core;
}

function loadPlugins() {
  if (_asianhub && _pinoyhub) return { asianhub: _asianhub, pinoyhub: _pinoyhub };
  var root = repoRoot();
  var ahPath = path.join(root, 'providers', 'asianhub.js');
  var phPath = path.join(root, 'providers', 'pinoyhub.js');
  if (!fs.existsSync(ahPath) || !fs.existsSync(phPath)) {
    console.error('[FAIL] plugins not found:\n       ' + ahPath + '\n       ' + phPath);
    process.exit(2);
  }
  try { _asianhub = require(ahPath); } catch (e) {
    console.error('[FAIL] asianhub.js crashed on load: ' + String((e && e.stack) || e));
    process.exit(1);
  }
  try { _pinoyhub = require(phPath); } catch (e) {
    console.error('[FAIL] pinoyhub.js crashed on load: ' + String((e && e.stack) || e));
    process.exit(1);
  }
  if (!_asianhub || typeof _asianhub.getStreams !== 'function') {
    console.error('[FAIL] asianhub.js does not export getStreams()');
    process.exit(1);
  }
  if (!_pinoyhub || typeof _pinoyhub.getStreams !== 'function') {
    console.error('[FAIL] pinoyhub.js does not export getStreams()');
    process.exit(1);
  }
  return { asianhub: _asianhub, pinoyhub: _pinoyhub };
}

// ---------- pairing: which plugin serves which catalog/id ----------
function pluginForCatalogSource(source) {
  return source === 'pinoy' ? 'pinoyhub' : 'asianhub';
}

function idShape(id) {
  var s = String(id || '');
  if (/^tmdb:\d+$/.test(s)) return 'tmdb';
  if (/^asian:[a-z0-9][a-z0-9-]*$/.test(s)) return 'asian';
  return 'BAD';
}

// v3.2.0 source-scoped ids: asian:ks- / asian:va- / asian:pmh-<slug>.
// Returns 'ks' | 'va' | 'pmh' | '' (legacy generic).
function scopedSourceOf(id) {
  var m = String(id || '').match(/^asian:(ks|va|pmh)-[a-z0-9][a-z0-9-]*$/);
  return m ? m[1] : '';
}

// Decide which plugins to try for a standalone `stream` command.
// auto: tmdb: -> asianhub; asian:ks-/va- -> asianhub first; asian:pmh- ->
// pinoyhub first (the other plugin now skips foreign sources fast); legacy
// generic asian:<slug> -> BOTH (the slug may belong to either site)
function pluginsForId(id) {
  if (flags.plugin === 'asianhub') return ['asianhub'];
  if (flags.plugin === 'pinoyhub') return ['pinoyhub'];
  if (flags.plugin === 'both') return ['asianhub', 'pinoyhub'];
  // auto
  if (String(id).indexOf('asian:') === 0) {
    var sc = scopedSourceOf(id);
    if (sc === 'ks' || sc === 'va') return ['asianhub', 'pinoyhub'];
    if (sc === 'pmh') return ['pinoyhub', 'asianhub'];
    return ['asianhub', 'pinoyhub'];
  }
  return ['asianhub'];
}

function getPluginByName(name) {
  var p = loadPlugins();
  return name === 'pinoyhub' ? p.pinoyhub : p.asianhub;
}

// ---------- run ONE plugin getStreams with full instrumentation ----------
// Returns {streams, ms, logs, fetches, error}
function runPluginCall(pluginName, id, mediaType, season, episode) {
  var plugin = getPluginByName(pluginName);
  var fetchMark = FETCH_LOG.length;
  patchGlobalFetch();
  capturePluginConsole();
  var t0 = Date.now();
  return Promise.resolve()
    .then(function () { return plugin.getStreams(id, mediaType, season, episode); })
    .then(function (streams) {
      restorePluginConsole(); unpatchGlobalFetch();
      var rows = (streams || []).filter(function (s) { return s && s.url; });
      return {
        plugin: pluginName, streams: rows, ms: Date.now() - t0,
        logs: PLUGIN_LOGS.slice(), fetches: FETCH_LOG.slice(fetchMark), error: null
      };
    }, function (err) {
      restorePluginConsole(); unpatchGlobalFetch();
      return {
        plugin: pluginName, streams: [], ms: Date.now() - t0,
        logs: PLUGIN_LOGS.slice(), fetches: FETCH_LOG.slice(fetchMark),
        error: String((err && err.message) || err)
      };
    });
}

// ---------- classify WHY a row produced no stream (miss diagnosis) ----------
function diagnoseMiss(shape, result) {
  var reasons = [];
  if (shape === 'BAD') {
    reasons.push('BAD ID SHAPE: id does not match ^tmdb:<digits>$ or ^asian:<slug>$ — plugins can never parse it (catalog bug)');
    return reasons;
  }
  var f = result.fetches || [];
  if (!f.length) {
    var lastLog = (result.logs && result.logs[result.logs.length - 1]) || '';
    if (/handled by (AsianHub|PinoyMoviesHub) plugin, skipping/.test(lastLog)) {
      reasons.push('intentional fast-skip: the id is scoped to the OTHER plugin (asian:ks-/va- -> AsianHub, asian:pmh- -> PinoyMoviesHub) — routing working as designed');
      return reasons;
    }
    reasons.push('plugin made NO network calls — it exited early (media/season detection failed, or id rejected)');
    if (result.logs.length) reasons.push('plugin said: ' + result.logs[result.logs.length - 1]);
    return reasons;
  }
  var botHosts = {}, errHosts = {}, status403 = {}, status500 = {};
  for (var i = 0; i < f.length; i++) {
    var host = (String(f[i].url).split('/')[2] || '?');
    if (f[i].bot) botHosts[host] = f[i].bot;
    if (f[i].status === 403 || f[i].status === 503) status403[host] = f[i].status;
    if (f[i].status === 500) status500[host] = f[i].status;
    if (f[i].error) errHosts[host] = f[i].error;
  }
  Object.keys(botHosts).forEach(function (h) {
    reasons.push('BOT GATE on ' + h + ' (' + botHosts[h] + ') — datacenter IPs get challenged; device/residential IPs usually pass');
  });
  Object.keys(status403).forEach(function (h) {
    reasons.push('HTTP ' + status403[h] + ' from ' + h + ' — site down or IP blocked (datacenter egress?)');
  });
  Object.keys(status500).forEach(function (h) {
    reasons.push('HTTP 500 from ' + h + ' — the requested episode/page does NOT exist server-side (viewasian keeps only the newest ~14 episodes online; older ones are gone)');
  });
  Object.keys(errHosts).forEach(function (h) {
    reasons.push('network error on ' + h + ': ' + errHosts[h]);
  });
  if (!reasons.length) {
    reasons.push('lane(s) reached the sites but extraction returned 0 playable URLs (player markup changed? see logs below)');
  }
  return reasons;
}

function printFetchSummary(fetches) {
  if (!fetches || !fetches.length) { log('   fetch log: (none)'); return; }
  var parts = [];
  var max = flags.trace ? 99 : 5;
  for (var i = 0; i < fetches.length && i < max; i++) {
    var f = fetches[i];
    var host = (String(f.url).split('/')[2] || '?');
    parts.push(f.error ? ('ERR:' + host) : (f.status + ' ' + host + (f.bot ? ' [BOT]' : '') + ' ' + secs(f.ms)));
  }
  log('   fetch log: ' + fetches.length + ' call(s) -> ' + parts.join(' | ') + (fetches.length > max ? ' ...' : ''));
}

// =====================================================================
// ENGINE CONFIG / VERSION BANNER
// =====================================================================

function coreConfigSummary(Core) {
  var cfg = Core.makeConfig(process.env);
  return {
    pinoySite: cfg.pinoySite,
    kissasianSite: cfg.kissasianSite,
    viewasianSite: cfg.viewasianSite,
    tmdbKey: String(cfg.tmdbKey).slice(0, 4) + '***' + String(cfg.tmdbKey).slice(-4),
    pageLimit: cfg.pageLimit,
    catalogs: Core.catalogDefinitions().length,
    version: Core.VERSION
  };
}

function pluginVersionFromSource(absPath) {
  try {
    var src = fs.readFileSync(absPath, 'utf8').slice(0, 2000);
    var m = src.match(/Version:\s*([0-9][0-9.]*)/);
    return m ? m[1] : '?';
  } catch (e) { return '?'; }
}

function printBanner(Core, title) {
  var c = coreConfigSummary(Core);
  var root = repoRoot();
  var ahV = pluginVersionFromSource(path.join(root, 'providers', 'asianhub.js'));
  var phV = pluginVersionFromSource(path.join(root, 'providers', 'pinoyhub.js'));
  log(title || 'ASIAN DEBUGGER (local run, real network)');
  line('=');
  log('Engine : core.js v' + c.version + ' | catalogs: ' + c.catalogs);
  log('Plugins: asianhub.js v' + ahV + ' | pinoyhub.js v' + phV);
  log('Node   : ' + process.versions.node + ' | ' + process.platform);
  log('Pinoy  : ' + c.pinoySite);
  log('KissAsian: ' + c.kissasianSite);
  log('ViewAsian: ' + c.viewasianSite);
  log('TMDB   : ' + c.tmdbKey);
  var envKeys = ['TMDB_API_KEY', 'PINOY_SITE', 'KISSASIAN_SITE', 'VIEWASIAN_SITE', 'ASIAN_PAGE_LIMIT', 'ASIAN_MAX_PAGES', 'ASIAN_KEEP_UNMATCHED'];
  var active = envKeys.filter(function (k) { return process.env[k] != null && process.env[k] !== ''; });
  log('Env    : ' + (active.length ? active.join(', ') + ' (custom)' : 'defaults'));
  line('=');
}

// =====================================================================
// COMMANDS — plugin side
// =====================================================================

// Comment stripper that UNDERSTANDS string literals (a naive regex strip
// mangles "https://host" inside strings, since // looks like a line comment).
// Keeps newlines so reported line numbers stay accurate.
function stripJsComments(src) {
  var out = [];
  var n = src.length;
  var i = 0;
  var mode = 'code'; // code | sq | dq | line | block
  while (i < n) {
    var ch = src.charAt(i);
    var next = i + 1 < n ? src.charAt(i + 1) : '';
    if (mode === 'code') {
      if (ch === '/' && next === '/') { mode = 'line'; i += 2; continue; }
      if (ch === '/' && next === '*') { mode = 'block'; i += 2; continue; }
      if (ch === '"') { mode = 'dq'; out.push(ch); i++; continue; }
      if (ch === "'") { mode = 'sq'; out.push(ch); i++; continue; }
      out.push(ch); i++; continue;
    }
    if (mode === 'sq') {
      out.push(ch);
      if (ch === '\\' && next) { out.push(next); i += 2; continue; }
      if (ch === "'") mode = 'code';
      i++; continue;
    }
    if (mode === 'dq') {
      out.push(ch);
      if (ch === '\\' && next) { out.push(next); i += 2; continue; }
      if (ch === '"') mode = 'code';
      i++; continue;
    }
    if (mode === 'line') {
      if (ch === '\n') { mode = 'code'; out.push(ch); }
      i++; continue;
    }
    // block comment
    if (ch === '*' && next === '/') { mode = 'code'; i += 2; continue; }
    if (ch === '\n') out.push(ch);
    i++; continue;
  }
  return out.join('');
}

// HARD bans: these throw/never-resolve inside the Nuvio QuickJS (mobile) or
// worker (TV) sandboxes. SOFT warns: only unsafe if NOT guarded - plugins are
// allowed guarded uses (e.g. pinoyhub's try/catch hostOf() around new URL(),
// TVSmart ships a custom URL class).
var SANDBOX_HARD_BANS = [
  ['require()', /\brequire\s*\(/],
  ['async/await', /\basync\s+function\b|\bawait\s+/],
  ['axios', /axios/],
  ['cheerio', /cheerio/],
  ['TextDecoder/TextEncoder', /TextDecoder|TextEncoder/],
  ['Buffer.', /Buffer\./],
  ['padStart/padEnd', /\.padStart\s*\(|\.padEnd\s*\(/],
  ['Object.entries', /Object\.entries/],
  ['Array .flat(', /\.flat\s*\(/],
  ['localStorage', /localStorage/]
];
var SANDBOX_SOFT_BANS = [
  ['new URL()', /new\s+URL\s*\(/],
  ['AbortController', /AbortController/]
];

function cmdPlugins() {
  var root = repoRoot();
  var files = [
    { name: 'asianhub.js', abs: path.join(root, 'providers', 'asianhub.js') },
    { name: 'pinoyhub.js', abs: path.join(root, 'providers', 'pinoyhub.js') }
  ];
  log('PLUGIN AUDIT');
  line('=');
  var fails = 0;
  files.forEach(function (f) {
    var src = '';
    try { src = fs.readFileSync(f.abs, 'utf8'); } catch (e) {
      log('[FAIL] ' + f.name + ': cannot read: ' + String(e.message || e));
      fails++; return;
    }
    var ver = '?';
    var vm = src.slice(0, 2000).match(/Version:\s*([0-9][0-9.]*)/);
    if (vm) ver = vm[1];
    var stripped = stripJsComments(src);
    log(f.name + ' v' + ver + '  (' + fmtBytes(src.length) + ')');
    // export check
    try {
      var mod = require(f.abs);
      if (mod && typeof mod.getStreams === 'function') log('  [ OK ] exports getStreams()');
      else { log('  [FAIL] module.exports.getStreams missing - Nuvio cannot call this plugin'); fails++; }
    } catch (e) {
      log('  [FAIL] crashed on load: ' + String((e && e.message) || e));
      fails++; return;
    }
    // sandbox lint (comments already stripped; strings preserved)
    var banned = [];
    SANDBOX_HARD_BANS.forEach(function (ban) {
      var m = stripped.match(ban[1]);
      if (m) {
        var idx = stripped.indexOf(m[0]);
        var ln = idx >= 0 ? stripped.slice(0, idx).split('\n').length : 0;
        banned.push(ban[0] + ' (line ~' + ln + ')');
      }
    });
    var soft = [];
    SANDBOX_SOFT_BANS.forEach(function (ban) {
      if (ban[1].test(stripped)) soft.push(ban[0]);
    });
    if (banned.length) {
      log('  [FAIL] sandbox-unsafe code found (would throw in QuickJS/worker): ' + banned.join(', '));
      fails++;
    } else {
      log('  [ OK ] sandbox-hard-bans: none (no require/async/axios/cheerio/Buffer/...)');
    }
    if (soft.length) {
      log('  [WARN] guarded APIs in use (ok if try/catch-wrapped, TVSmart ships URL class): ' + soft.join(', '));
    }
    // lane constants (what sites this build talks to)
    var lanes = [];
    var laneRe = /var\s+(KISSASIAN_BASE|VIEWASIAN_BASE|JUSTPLAY_BASE|KISSKH_BASES|BASE_URL)\s*=\s*([^;\n]+)/g;
    var lm;
    while ((lm = laneRe.exec(stripped)) !== null) {
      lanes.push(lm[1] + ' = ' + lm[2].trim().slice(0, 90));
    }
    if (lanes.length) {
      log('  lanes:');
      lanes.forEach(function (l) { log('    ' + l); });
    }
  });
  line('=');
  log('verdict: ' + (fails ? fails + ' problem(s) found' : 'both plugins load, export getStreams, sandbox-safe'));
  if (!fails) {
    log('next:  node debug-asian.js stream series asian:ks-<slug> 1 1 --trace');
    log('       node debug-asian.js all');
  }
  return Promise.resolve(fails ? 1 : 0);
}

// ---------- stream: ONE meta id through the plugin lane(s) ----------
function cmdStream(Core, args) {
  var type = args.shift();
  var id = args.shift();
  if (!type || !id) {
    log('[FAIL] usage: node debug-asian.js stream <movie|series> <id> [season episode]');
    log('       examples: stream series asian:ks-<kissasian-slug> 1 1');
    log('                 stream series asian:va-<viewasian-slug> 1 1');
    log('                 stream series asian:pmh-<pinoymovieshub-slug> 1 10');
    log('                 stream movie tmdb:496243');
    return Promise.resolve(2);
  }
  if (type === 'tv' || type === 'show') type = 'series';
  if (type !== 'movie' && type !== 'series') {
    log('[FAIL] type must be movie or series (got: ' + type + ')');
    return Promise.resolve(2);
  }
  var season = null, episode = null;
  if (type === 'series') {
    season = parseInt(args.shift(), 10);
    episode = parseInt(args.shift(), 10);
    if (!season || !episode) {
      log('[FAIL] series needs season + episode: stream series ' + id + ' 1 1');
      return Promise.resolve(2);
    }
  }
  // convenience: bare slug -> asian:<slug>
  if (id.indexOf(':') === -1) id = 'asian:' + id;

  loadPlugins();
  printBanner(Core, null);
  var shape = idShape(id);
  var names = pluginsForId(id);
  log('STREAM TEST  ' + type + ' ' + id + (type === 'series' ? '  S' + season + 'E' + episode : ''));
  line('=');
  log('id shape : ' + (shape === 'BAD'
    ? 'BAD - matches NEITHER plugin contract ^tmdb:<digits>$ / ^asian:<slug>$ (this row can never stream)'
    : shape + (shape === 'asian'
        ? (scopedSourceOf(String(id))
          ? ' (source-scoped id -> plugin navigates the site\'s own pages DIRECTLY: ks- kissasian /series/{slug}/ -> /{slug}-episode-{n}/ -> player servers v1..v3; va- viewasian /drama/{slug}/ -> episode page; pmh- pinoymovieshub /movies|series/{slug}/ -> real /episodes/ slug)'
          : ' (legacy catalog fallback id -> de-slug -> lane search)')
        : ' (tmdb matched id)')));
  log('plugins  : ' + names.join(' then ') + (flags.plugin === 'auto' ? '  (auto)' : '  (forced)'));
  log('mediaType: "' + type + '" passed verbatim (TVSmart local-path contract; plugins normalize)');
  line('=');

  var anyHit = false;
  var chain = Promise.resolve();
  names.forEach(function (name) {
    chain = chain.then(function () {
      log('running ' + name + '.getStreams("' + id + '", "' + type + '"' + (type === 'series' ? ', ' + season + ', ' + episode : '') + ') ...');
      return runPluginCall(name, id, type, season, episode).then(function (r) {
        var verdict = r.streams.length ? '[HIT ]' : (r.error ? '[CRASH]' : '[MISS]');
        log(pad(verdict + ' ' + r.plugin, 20) + r.streams.length + ' stream(s) in ' + secs(r.ms) + (r.error ? '  | ' + r.error : ''));
        if (r.streams.length) {
          anyHit = true;
          r.streams.forEach(function (s, idx) {
            var u = String(s.url);
            log('       ' + padL(idx + 1, 2) + '. ' + pad(String(s.name || '').slice(0, 30), 32) + pad(String(s.title || '').slice(0, 26), 28) + u.slice(0, 84) + (u.length > 84 ? '...' : ''));
          });
          if (flags.verify) {
            var vchain = Promise.resolve(0);
            r.streams.slice(0, 3).forEach(function (s) {
              vchain = vchain.then(function (acc) {
                return verifyStreamUrl(s.url).then(function (v) {
                  log('       verify: ' + (v.ok ? '[ OK ] ' : '[FAIL] ') + v.summary);
                  return acc + (v.ok ? 0 : 1);
                });
              });
            });
            return vchain;
          }
        } else {
          var tail = r.logs.slice(-8);
          if (tail.length) {
            log('   plugin logs (last ' + tail.length + '):');
            tail.forEach(function (l) { log('     | ' + l); });
          }
          diagnoseMiss(shape, r).forEach(function (d) { log('   [DIAG] ' + d); });
          printFetchSummary(r.fetches);
        }
        return 0;
      });
    });
  });

  return chain.then(function () {
    line('=');
    if (anyHit) {
      log('[ OK ] stream link obtained - this catalog row is PLAYABLE.');
      return 0;
    }
    log('[FAIL] no plugin produced a stream link for this id.');
    log('       fixes: --trace for per-request detail | try --plugin both |');
    log('       check sites: node debug-asian.js sites | health: node debug-asian.js health');
    return 1;
  });
}

// ---------- verify: probe a stream URL for liveness ----------
function verifyStreamUrl(url) {
  // Range request keeps media downloads tiny; playlists get a full re-read.
  var t0 = Date.now();
  return fetchWithTimeout(url, { headers: BROWSER_HEADERS, redirect: 'follow' }, Math.min(flags.timeout, 15000)).then(function (res) {
    var ms = Date.now() - t0;
    var ct = res.headers.get('content-type') || '';
    return res.text().then(function (head) {
      var isPlaylist = /mpegurl|vnd\.apple/i.test(ct) || /^\s*#EXTM3U/.test(head) || /\.m3u8($|\?)/i.test(url);
      if (isPlaylist) {
        // playlists are small: read fully (redirected final url keeps auth)
        var finalUrl = res.url || url;
        return fetchWithTimeout(finalUrl, { headers: BROWSER_HEADERS }, Math.min(flags.timeout, 15000)).then(function (res2) {
          return res2.text().then(function (body) {
            var lines = body.split('\n');
            var isMaster = body.indexOf('#EXT-X-STREAM-INF') !== -1;
            var variants = [], k;
            if (isMaster) {
              for (k = 0; k < lines.length; k++) {
                if (lines[k].indexOf('#EXT-X-STREAM-INF') === 0) {
                  var next = '';
                  for (var j = k + 1; j < lines.length && next === ''; j++) if (lines[j].trim()) next = lines[j].trim();
                  variants.push(next);
                }
              }
            } else {
              for (k = 0; k < lines.length; k++) if (lines[k].indexOf('#EXTINF') === 0) variants.push('#' + (k + 1));
            }
            var summary = 'HTTP ' + res2.status + ' in ' + ms + 'ms | ' + fmtBytes(body.length) + ' | HLS ' + (isMaster ? 'MASTER' : 'MEDIA') + ' playlist, ' + variants.length + ' ' + (isMaster ? 'variant(s)' : 'segment(s)');
            if (res2.status === 200 && (isMaster ? variants.length > 0 : variants.length > 0)) return { ok: true, summary: summary + '  [playable]' };
            return { ok: false, summary: summary + '  (empty playlist?)' };
          });
        }).catch(function (err) {
          return { ok: false, summary: 'playlist re-read failed: ' + String((err && err.message) || err) };
        });
      }
      // non-playlist: range GET answered with real bytes
      var len = res.headers.get('content-length') || res.headers.get('content-range') || '?';
      if (res.status === 200 || res.status === 206) {
        return { ok: true, summary: 'HTTP ' + res.status + ' in ' + ms + 'ms | ' + ct + ' | length: ' + len + '  [media bytes served]' };
      }
      return { ok: false, summary: 'HTTP ' + res.status + ' | ' + ct + (res.status === 403 ? '  (signature expired or IP blocked?)' : '') };
    });
  }, function (err) {
    return Promise.resolve({ ok: false, summary: 'request failed after ' + (Date.now() - t0) + 'ms: ' + String((err && err.message) || err) });
  });
}

function cmdVerify(args) {
  var url = args[0];
  if (!url) {
    log('[FAIL] usage: node debug-asian.js verify "<stream-url>"');
    return Promise.resolve(2);
  }
  log('VERIFY ' + maskKey(url));
  line('=');
  return verifyStreamUrl(url).then(function (v) {
    log((v.ok ? '[ OK ] ' : '[FAIL] ') + v.summary);
    return v.ok ? 0 : 1;
  });
}

function cmdHelp() {
  log('debug-asian.js - asian catalog + plugin debugger - commands:');
  log('');
  log('  END-TO-END (catalog row -> plugin -> stream link):');
  log('    node debug-asian.js all');
  log('        FULL audit: health -> every catalog -> sampled rows -> paired');
  log('        plugin getStreams() -> per-row PASS/FAIL + miss diagnosis.');
  log('        Options: --sample N (default 3), --full (every row), --catalog <id>,');
  log('                 --type movie|series, --verify (probe stream urls), --plugin <p>');
  log('    node debug-asian.js stream <movie|series> <id> [season episode]');
  log('        One meta id through the plugin lane(s) with full tracing.');
  log('        examples:');
  log('          stream series asian:queen-of-tears 1 1');
  log('          stream movie tmdb:496243');
  log('        --plugin asianhub|pinoyhub|both   force which plugin(s) to try');
  log('        --verify                          probe the returned stream URL');
  log('    node debug-asian.js verify "<stream-url>"');
  log('        Probe a stream URL: m3u8 playlist check / mp4 byte check.');
  log('');
  log('  CATALOG SIDE:');
  log('    node debug-asian.js health              4 source probes, actual errors');
  log('    node debug-asian.js catalog <type> <id> [extras...]');
  log('        e.g. catalog series asian-series search=queen of tears');
  log('             catalog series asian-series-genre genre=Romance');
  log('             catalog movie pinoy-movies');
  log('    node debug-asian.js get /manifest.json');
  log('    node debug-asian.js remote <worker-url> [/health]');
  log('        Compares deployed worker version vs local core.js ->');
  log('        catches the "forgot to redeploy" stale-addon trap.');
  log('');
  log('  PLUGIN SIDE:');
  log('    node debug-asian.js plugins            version/export/sandbox-lint audit');
  log('    node debug-asian.js sites              reachability matrix (catalog + lanes)');
  log('    node debug-asian.js probe <url>        raw HTTP probe of any URL');
  log('');
  log('  Options: --trace  --json  --verify  --sample N  --full  --catalog <id>');
  log('           --type <t>  --plugin <p>  --timeout <ms>  --repo <path>');
  log('  Exit codes: 0 all pass, 1 failures, 2 usage error.');
  log('  (Supersedes debug-catalog.js, which only tested the catalog side.)');
}

// ---------- health ----------
function cmdHealth(Core) {
  var env = Object.assign({}, process.env);
  env.__fetchFn = flags.trace ? makeRecordingFetch(flags.timeout, true) : makeRecordingFetch(flags.timeout, false);
  var t0 = Date.now();
  return Core.healthReport(Core.makeConfig(env)).then(function (report) {
    if (flags.json) {
      log(JSON.stringify({ report: report, totalMs: Date.now() - t0 }, null, 2));
      return failCount(report);
    }
    log('ASIAN CATALOG HEALTH (local run, real network)');
    line('=');
    printBanner(Core, null);
    var names = Object.keys(report.sources);
    for (var i = 0; i < names.length; i++) {
      var s = report.sources[names[i]];
      log(pad((s.ok ? '[ OK ] ' : '[FAIL] ') + names[i], 28) + padL(s.ms, 6) + 'ms  items=' + padL(s.items, 3) + (s.error ? '  | ' + s.error : ''));
    }
    line('=');
    log('status: ' + String(report.status).toUpperCase() + '  (engine ' + report.version + ')  total ' + (Date.now() - t0) + 'ms');
    (report.hints || []).forEach(function (h) { log('  hint: ' + h); });
    if (String(report.version) !== Core.VERSION) {
      log('[WARN] healthReport version ' + report.version + ' != core.js ' + Core.VERSION + ' (mixed files?)');
    }
    return failCount(report);
  }).catch(function (err) {
    log('[FAIL] healthReport crashed: ' + String((err && err.stack) || err));
    return 1;
  });
}

function failCount(report) {
  var n = 0;
  Object.keys(report.sources || {}).forEach(function (k) { if (!report.sources[k].ok) n++; });
  return n > 0 ? 1 : 0;
}

// ---------- catalog ----------
function cmdCatalog(Core, args) {
  var type = args.shift();
  var id = args.shift();
  if (!type || !id) {
    log('[FAIL] usage: node debug-asian.js catalog <movie|series> <catalogId> [extras...]');
    log('       example: catalog series asian-series search=queen of tears');
    return Promise.resolve(2);
  }
  var extraPairs = args.join(' ').split('&').filter(Boolean).map(function (p) {
    var eq = p.indexOf('=');
    if (eq === -1) return p;
    return p.slice(0, eq) + '=' + encodeURIComponent(p.slice(eq + 1));
  });
  var extraPath = extraPairs.length ? '/' + extraPairs.join('&') : '';
  var url = '/catalog/' + type + '/' + id + extraPath + '.json';

  // find the catalog def to know its paired plugin
  var defs = Core.catalogDefinitions();
  var def = null;
  for (var i = 0; i < defs.length; i++) if (defs[i].id === id) { def = defs[i]; break; }

  var env = Object.assign({}, process.env);
  env.__fetchFn = makeRecordingFetch(flags.timeout, flags.trace);

  printBanner(Core, null);
  log('GET ' + url);
  if (def) log('paired plugin: ' + pluginForCatalogSource(def.source) + '  (source: ' + def.source + ')');
  else log('[WARN] unknown catalog id (not in catalogDefinitions) - engine will 404 it');
  line('=');

  var t0 = Date.now();
  return Core.handle(url, env).then(function (res) {
    return res.text().then(function (bodyText) {
      var ms = Date.now() - t0;
      var data = null;
      try { data = JSON.parse(bodyText); } catch (e) { /* below */ }
      log('HTTP ' + res.status + ' in ' + ms + 'ms, body ' + fmtBytes(bodyText.length) + ', outbound calls: ' + FETCH_LOG.length);
      if (!data) {
        log('[FAIL] non-JSON response (first 400 chars):');
        log(bodyText.slice(0, 400));
        return 1;
      }
      if (data.error) {
        log('[FAIL] engine returned error: ' + data.error);
        printFetchSummary(FETCH_LOG);
        return 1;
      }
      var metas = data.metas || [];
      var tmdbRows = metas.filter(function (m) { return /^tmdb:/.test(m.id); });
      var asianRows = metas.filter(function (m) { return /^asian:/.test(m.id); });
      var badRows = metas.filter(function (m) { return idShape(m.id) === 'BAD'; });
      log('[ OK ] metas: ' + metas.length + '  (tmdb: ' + tmdbRows.length + ', asian: fallback: ' + asianRows.length + ', BAD shape: ' + badRows.length + ')');
      log('first rows (id -> plugin pairing):');
      metas.slice(0, 10).forEach(function (m, idx) {
        log('  ' + padL(idx + 1, 2) + '. ' + pad(String(m.name).slice(0, 40), 42) + pad(m.releaseInfo || '', 6) + ' ' + pad(m.id, 40) + ' -> ' + (def ? pluginForCatalogSource(def.source) : 'asianhub?'));
      });
      if (badRows.length) {
        log('[FAIL] ' + badRows.length + ' row(s) have ids that match NEITHER plugin contract - those rows can NEVER stream.');
        log('       offending ids: ' + badRows.slice(0, 5).map(function (m) { return m.id; }).join(', '));
        return 1;
      }
      if (metas.length === 0) {
        log('[FAIL] 0 metas. Re-run with --trace to see which upstream call failed or returned 0 items.');
        printFetchSummary(FETCH_LOG);
        return 1;
      }
      log('');
      log('next: test a row end-to-end ->  node debug-asian.js stream ' + type + ' ' + metas[0].id + (type === 'series' ? ' 1 1' : ''));
      return 0;
    });
  }).catch(function (err) {
    log('[FAIL] handle() threw: ' + String((err && err.stack) || err));
    return 1;
  });
}

// ---------- raw get ----------
function cmdGet(Core, args) {
  var p = args.join('') || '/';
  var env = Object.assign({}, process.env);
  if (flags.trace) env.__fetchFn = makeRecordingFetch(flags.timeout, true);
  var t0 = Date.now();
  return Core.handle(p, env).then(function (res) {
    return res.text().then(function (body) {
      log('GET ' + p + '  ->  HTTP ' + res.status + ' in ' + (Date.now() - t0) + 'ms, ' + fmtBytes(body.length));
      line('=');
      if (body.length > 3000 && !flags.json) log(body.slice(0, 3000) + '\n... (truncated, ' + fmtBytes(body.length) + ' total)');
      else log(body);
      return res.status >= 400 ? 1 : 0;
    });
  }).catch(function (err) {
    log('[FAIL] ' + String((err && err.stack) || err));
    return 1;
  });
}

// ---------- raw url probe ----------
function cmdProbe(args) {
  var url = args[0];
  if (!url) {
    log('[FAIL] usage: node debug-asian.js probe <url>');
    return Promise.resolve(2);
  }
  if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
  log('PROBE ' + maskKey(url));
  line('=');
  var t0 = Date.now();
  return fetchWithTimeout(url, { headers: BROWSER_HEADERS, redirect: 'follow' }, flags.timeout).then(function (res) {
    return res.text().then(function (body) {
      var ms = Date.now() - t0;
      var bot = detectBotPage(body);
      log('HTTP ' + res.status + ' in ' + ms + 'ms | ' + fmtBytes(body.length) + ' | ' + (res.headers.get('content-type') || 'no content-type'));
      if (res.url && res.url !== url) log('redirected to: ' + res.url);
      if (bot) {
        log('[WARN] BOT PAGE DETECTED -> ' + bot);
        log('       Worker/browserless scrapers get 0 items even though the site works in a browser.');
      } else if (res.status >= 200 && res.status < 400 && body.length > 500) {
        log('[ OK ] reachable, real content, no bot gate.');
      } else if (res.status >= 400) {
        log('[FAIL] HTTP ' + res.status + ' ' + res.statusText);
      } else {
        log('[WARN] tiny body (' + fmtBytes(body.length) + ') - JS-only shell or empty response?');
      }
      log('body head: ' + body.slice(0, 400).replace(/\s+/g, ' '));
      return (bot || res.status >= 400) ? 1 : 0;
    });
  }, function (err) {
    log('[FAIL] request failed after ' + (Date.now() - t0) + 'ms: ' + String((err && err.message) || err));
    if (err && err.cause) log('       cause: ' + String(err.cause));
    log('       (ENOTFOUND = DNS dead / ECONNREFUSED = server down / timeout = slow or blocked)');
    return 1;
  });
}

// =====================================================================
// COMMAND — all: the FULL end-to-end audit
//   catalog row -> paired plugin getStreams() -> stream link
// =====================================================================

function auditOneCatalog(Core, def, results) {
  Core.resetCaches();
  FETCH_LOG = [];
  var env = Object.assign({}, process.env);
  env.__fetchFn = makeRecordingFetch(flags.timeout, flags.trace);
  var url = '/catalog/' + def.type + '/' + def.id + '.json';
  var t0 = Date.now();
  return Core.handle(url, env).then(function (res) {
    return res.text().then(function (bodyText) {
      var data = null;
      try { data = JSON.parse(bodyText); } catch (e) { /* below */ }
      var metas = (data && data.metas) || [];
      var rows = flags.full ? metas : metas.slice(0, Math.max(1, flags.sample));
      var paired = pluginForCatalogSource(def.source);
      log('');
      log('== ' + def.id + ' (' + def.type + ', source ' + def.source + ') -> ' + paired + ' : ' + metas.length + ' row(s), auditing ' + rows.length + (flags.full ? '' : '  (use --full for every row)'));
      if (!metas.length) {
        log('   [FAIL] catalog returned 0 rows' + (data && data.error ? ' (engine error: ' + data.error + ')' : '') + '  fetches: ' + FETCH_LOG.length);
        printFetchSummary(FETCH_LOG);
        results.push({ catalog: def.id, id: '(catalog)', name: '(catalog empty)', plugin: paired, hit: false, streams: 0, ms: Date.now() - t0, catalogFail: true });
        return null;
      }
      var chain = Promise.resolve();
      rows.forEach(function (m) {
        chain = chain.then(function () {
          var shape = idShape(m.id);
          var season = def.type === 'series' ? 1 : null;
          var episode = def.type === 'series' ? 1 : null;
          var names;
          if (flags.plugin === 'both') names = ['asianhub', 'pinoyhub'];
          else if (flags.plugin === 'asianhub' || flags.plugin === 'pinoyhub') names = [flags.plugin];
          else names = [paired];
          var rowHit = false, hitPlugin = null, totalStreams = 0, rowMs = 0;
          var firstResult = null, lastResult = null;
          var runChain = Promise.resolve();
          names.forEach(function (nm) {
            runChain = runChain.then(function () {
              return runPluginCall(nm, m.id, def.type, season, episode).then(function (r) {
                rowMs += r.ms;
                if (!firstResult) firstResult = r;
                lastResult = r;
                if (r.streams.length) { rowHit = true; hitPlugin = nm; totalStreams += r.streams.length; }
                return null;
              });
            });
          });
          return runChain.then(function () {
            var r = lastResult || firstResult || { fetches: [], logs: [] };
            log('  ' + (rowHit ? 'HIT ' : 'MISS') + ' ' + pad(m.id, 42) + ' "' + String(m.name).slice(0, 32) + '"  ' + padL(totalStreams, 2) + ' strm  ' + padL(secs(rowMs), 6) + '  [' + (hitPlugin || names.join('+')) + ']' + (shape === 'BAD' ? '  [BAD ID]' : ''));
            var finish = function (verifyOk) {
              results.push({ catalog: def.id, id: m.id, name: m.name, plugin: hitPlugin, hit: rowHit, streams: totalStreams, ms: rowMs, verifyOk: verifyOk === undefined ? null : verifyOk });
              return null;
            };
            if (!rowHit) {
              (r.logs || []).slice(-4).forEach(function (l) { log('       | ' + l); });
              diagnoseMiss(shape, r).forEach(function (d) { log('       [DIAG] ' + d); });
              printFetchSummary(r.fetches);
              return finish(null);
            }
            if (flags.verify && r.streams && r.streams.length) {
              return verifyStreamUrl(r.streams[0].url).then(function (v) {
                log('       verify: ' + (v.ok ? '[ OK ] ' : '[FAIL] ') + v.summary);
                return finish(v.ok);
              });
            }
            return finish(null);
          });
        });
      });
      return chain;
    });
  }).catch(function (err) {
    log('');
    log('== ' + def.id + ' (' + def.type + ') -> CRASH: ' + String((err && err.stack) || err).split('\n')[0]);
    results.push({ catalog: def.id, id: '(crash)', name: '(crash)', plugin: pluginForCatalogSource(def.source), hit: false, streams: 0, ms: Date.now() - t0, catalogFail: true });
    return null;
  });
}

function printAllSummary(results, healthFails, totalMs) {
  var hits = results.filter(function (r) { return r.hit; });
  var misses = results.filter(function (r) { return !r.hit; });
  var verifiedOk = results.filter(function (r) { return r.verifyOk === true; }).length;
  var verifyFails = results.filter(function (r) { return r.verifyOk === false; }).length;
  var byCat = {};
  results.forEach(function (r) {
    if (!byCat[r.catalog]) byCat[r.catalog] = { rows: 0, hits: 0 };
    byCat[r.catalog].rows++;
    if (r.hit) byCat[r.catalog].hits++;
  });
  log('');
  line('=');
  log('END-TO-END SUMMARY  (' + secs(totalMs) + ')');
  line('=');
  Object.keys(byCat).forEach(function (c) {
    var b = byCat[c];
    log('  ' + pad(c, 38) + b.hits + '/' + b.rows + ' rows streamable' + (b.hits === b.rows ? '' : '   <-- fix needed'));
  });
  log('');
  log('TOTAL: ' + hits.length + '/' + results.length + ' rows produced a stream link (' + (results.length ? Math.round(hits.length / results.length * 100) : 0) + '%)' + (flags.verify ? '  | live-verified: ' + verifiedOk + ' ok, ' + verifyFails + ' dead' : ''));
  log('source health failures: ' + healthFails);
  if (misses.length) {
    log('');
    log('ROWS WITHOUT A STREAM (' + misses.length + '):');
    misses.forEach(function (r) { log('  - ' + pad(r.catalog, 30) + pad(r.id, 42) + '"' + String(r.name).slice(0, 30) + '"  ' + r.plugin); });
    log('  deep-dive a single row with full lane tracing:');
    log('    node debug-asian.js stream series <id> 1 1 --trace');
  }
  if (flags.json) {
    log(JSON.stringify({
      totals: { rows: results.length, hits: hits.length, misses: misses.length, healthFails: healthFails, verifiedOk: verifiedOk, verifyFails: verifyFails },
      byCatalog: byCat,
      misses: misses,
      results: results
    }, null, 2));
  }
  log('');
  log('stale-deploy check (your live addon may be an OLD version):');
  log('  node debug-asian.js remote https://<your-worker>.workers.dev');
  return (misses.length || healthFails) ? 1 : 0;
}

function cmdAll(Core) {
  loadPlugins();
  printBanner(Core, 'ASIAN END-TO-END AUDIT  (catalog rows -> plugin -> stream link)');
  var t0 = Date.now();
  var env = Object.assign({}, process.env);
  env.__fetchFn = makeRecordingFetch(flags.timeout, false);
  log('STEP 1 - source health');
  return Core.healthReport(Core.makeConfig(env)).then(function (report) {
    var names = Object.keys(report.sources || {});
    names.forEach(function (n) {
      var s = report.sources[n];
      log('  ' + pad((s.ok ? '[ OK ] ' : '[FAIL] ') + n, 28) + padL(s.ms, 6) + 'ms items=' + padL(s.items, 3) + (s.error ? '  | ' + s.error : ''));
    });
    var healthFails = failCount(report);
    (report.hints || []).forEach(function (h) { log('  hint: ' + h); });
    var defs = Core.catalogDefinitions();
    if (flags.catalog) {
      defs = defs.filter(function (d) { return d.id === flags.catalog; });
      if (!defs.length) {
        log('[FAIL] --catalog ' + flags.catalog + ' not found (see: node debug-asian.js get /manifest.json)');
        return Promise.resolve(2);
      }
    }
    if (flags.type) defs = defs.filter(function (d) { return d.type === flags.type; });
    log('');
    log('STEP 2 - row audit  (sample=' + (flags.full ? 'ALL rows' : flags.sample) + ', plugin=' + flags.plugin + ', verify=' + (flags.verify ? 'on' : 'off') + ')');
    var results = [];
    var chain = Promise.resolve();
    defs.forEach(function (def) {
      chain = chain.then(function () { return auditOneCatalog(Core, def, results); });
    });
    return chain.then(function () {
      return printAllSummary(results, healthFails, Date.now() - t0);
    });
  }).catch(function (err) {
    log('[FAIL] audit crashed: ' + String((err && err.stack) || err));
    return 1;
  });
}

// =====================================================================
// COMMAND — sites: reachability matrix (catalog sources + plugin lanes)
// =====================================================================

var SITE_MATRIX = [
  ['catalog: pinoy movies+series', 'https://pinoymovieshub.win/movies/'],
  ['catalog: kissasian.cam', 'https://kissasian.cam/page/2/'],
  ['catalog: viewasian.lol', 'https://viewasian.lol/page/2/'],
  ['catalog: TMDB (all TMDB dirs)', 'https://api.themoviedb.org/3/configuration?api_key=439c478a771f35c05022f9feabcca01c'],
  ['asianhub lane: KissAsian site', 'https://kissasian.cam/'],
  ['asianhub lane: Byse player (justplay)', 'https://justplay.cam/'],
  ['asianhub lane: ViewAsian site', 'https://viewasian.lol/'],
  ['asianhub lane: viewasian player hop', 'https://kisskh.space/'],
  ['asianhub lane: vidmoly embed host', 'https://vidmoly.biz/'],
  ['asianhub lane: KissKH API (device-side)', 'https://kisskh.co/api/DramaList/Search?q=test&type=0'],
  ['asianhub lane: KissKH fallback', 'https://kisskh.ovh/api/DramaList/Search?q=test&type=0'],
  ['pinoyhub lane: Dooplay search', 'https://pinoymovieshub.win/']
];

function cmdSites() {
  log('UPSTREAM REACHABILITY MATRIX (real network from THIS machine)');
  line('=');
  var results = [];
  var t0 = Date.now();
  var jobs = SITE_MATRIX.map(function (entry) {
    var label = entry[0], url = entry[1];
    var st = Date.now();
    return fetchWithTimeout(url, { headers: BROWSER_HEADERS, redirect: 'follow' }, flags.timeout).then(function (res) {
      return res.text().catch(function () { return ''; }).then(function (body) {
        results.push({ label: label, url: url, status: res.status, ms: Date.now() - st, bytes: body.length, bot: detectBotPage(body), error: null });
      });
    }, function (err) {
      results.push({ label: label, url: url, status: null, ms: Date.now() - st, bytes: 0, bot: null, error: String((err && err.message) || err) });
    });
  });
  return Promise.all(jobs).then(function () {
    results.sort(function (a, b) {
      return SITE_MATRIX.findIndex(function (e) { return e[0] === a.label; }) - SITE_MATRIX.findIndex(function (e) { return e[0] === b.label; });
    });
    var fails = 0;
    results.forEach(function (r) {
      var verdict, tag;
      if (r.error) { tag = '[FAIL]'; verdict = r.error; fails++; }
      else if (r.bot) { tag = '[GATE]'; verdict = r.status + ' but ' + r.bot + ' -> server-side scraping gets 0 items'; fails++; }
      else if (r.status >= 400) { tag = '[FAIL]'; verdict = 'HTTP ' + r.status; fails++; }
      else { tag = '[ OK ]'; verdict = 'HTTP ' + r.status; }
      log(pad(tag + ' ' + pad(r.label, 34), 44) + padL(r.ms, 6) + 'ms ' + padL(fmtBytes(r.bytes), 9) + '  ' + verdict);
    });
    line('=');
    log('total ' + (Date.now() - t0) + 'ms | ' + (results.length - fails) + '/' + results.length + ' reachable');
    var gated = results.filter(function (r) { return r.bot; });
    if (gated.length) {
      log('');
      log('bot-gated hosts fail from DATACENTER IPs (CF Workers, servers) but usually');
      log('pass from home/residential IPs (phones, webOS TVs).');
    }
    log('next: pick a lane host that failed and run: node debug-asian.js stream ... --trace');
    return fails > 0 ? 1 : 0;
  });
}

// =====================================================================
// COMMAND — remote: deployed worker check (stale-addon detector)
// =====================================================================

function cmdRemote(Core, args) {
  var base = args.shift();
  var extraPath = args.join('') || '/health';
  if (!base) {
    log('[FAIL] usage: node debug-asian.js remote https://your-worker.workers.dev [/health]');
    return Promise.resolve(2);
  }
  base = base.replace(/\/+$/, '');
  if (!/^https?:\/\//i.test(base)) base = 'https://' + base;
  var url = base + (extraPath.charAt(0) === '/' ? extraPath : '/' + extraPath);

  log('REMOTE CHECK  ' + base);
  line('=');
  printBanner(Core, null);
  line('=');
  var t0 = Date.now();
  return fetchWithTimeout(url, { headers: BROWSER_HEADERS }, flags.timeout).then(function (res) {
    return res.text().then(function (body) {
      log('GET ' + extraPath + '  ->  HTTP ' + res.status + ' in ' + (Date.now() - t0) + 'ms, ' + fmtBytes(body.length));
      if (extraPath.indexOf('/health') === 0) {
        var report = null;
        try { report = JSON.parse(body); } catch (e) { /* below */ }
        if (!report) {
          log('[FAIL] /health did not return JSON. First 400 chars:');
          log(body.slice(0, 400));
          return 1;
        }
        var names = Object.keys(report.sources || {});
        for (var i = 0; i < names.length; i++) {
          var s = report.sources[names[i]];
          log(pad((s.ok ? '[ OK ] ' : '[FAIL] ') + names[i], 26) + padL(s.ms, 6) + 'ms items=' + padL(s.items, 3) + (s.error ? '  | ' + s.error : ''));
        }
        log('remote status: ' + String(report.status).toUpperCase() + '  deployed version: ' + report.version);
        (report.hints || []).forEach(function (h) { log('  hint: ' + h); });
        if (flags.json) {
          log(JSON.stringify({ base: base, report: report, deployedVersion: report.version, localVersion: Core.VERSION, versionMatch: String(report.version) === Core.VERSION }, null, 2));
        }
        if (String(report.version) !== Core.VERSION) {
          log('');
          log('[WARN] VERSION MISMATCH: deployed=' + report.version + '  local core.js=' + Core.VERSION);
          log('       Your Cloudflare worker is running OLD code - its catalogs are NOT');
          log('       the ones your current plugins expect (the classic "catalog doesnt');
          log('       match with our plugin" symptom).');
          log('       FIX: Cloudflare dashboard -> Workers -> your worker -> Edit ->');
          log('       paste the FULL content of addons/asian-catalog/worker-bundle.js -> Deploy.');
          log('       Then re-run: node debug-asian.js remote ' + base + ' /health');
          return 1;
        }
        return failCount(report);
      }
      line('=');
      log(body.length > 2000 ? body.slice(0, 2000) + '\n... (truncated)' : body);
      return res.status >= 400 ? 1 : 0;
    });
  }, function (err) {
    log('[FAIL] cannot reach worker: ' + String((err && err.message) || err));
    log('       Check the URL and that the worker is deployed/enabled.');
    return 1;
  });
}

// =====================================================================
// main
// =====================================================================

process.on('unhandledRejection', function (err) {
  restorePluginConsole();
  unpatchGlobalFetch();
  console.error('[FAIL] unhandled rejection: ' + String((err && err.stack) || err));
  process.exit(1);
});

function main() {
  var needsCore = ['health', 'catalog', 'get', 'remote', 'stream', 'all'].indexOf(command) !== -1;
  var Core = null;
  if (needsCore) Core = loadCore();

  var p;
  switch (command) {
    case 'help': cmdHelp(); p = Promise.resolve(0); break;
    case 'all': p = cmdAll(Core); break;
    case 'health': p = cmdHealth(Core); break;
    case 'catalog': p = cmdCatalog(Core, positional); break;
    case 'stream': p = cmdStream(Core, positional); break;
    case 'verify': p = cmdVerify(positional); break;
    case 'plugins': p = cmdPlugins(); break;
    case 'sites': p = cmdSites(); break;
    case 'remote': p = cmdRemote(Core, positional); break;
    case 'get': p = cmdGet(Core, positional); break;
    case 'probe': p = cmdProbe(positional); break;
    default:
      log('[FAIL] unknown command: ' + command + '   (try: node debug-asian.js help)');
      p = Promise.resolve(2);
  }

  p.then(function (code) {
    process.exit(typeof code === 'number' ? code : 0);
  }, function (err) {
    restorePluginConsole();
    unpatchGlobalFetch();
    console.error('[FAIL] ' + String((err && err.stack) || err));
    process.exit(1);
  });
}

main();
