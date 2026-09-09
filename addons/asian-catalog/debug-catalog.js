#!/usr/bin/env node
/**
 * Asian Catalog — CLI debugger (zero dependencies, Node >= 18)
 *
 * Runs the EXACT same engine the Cloudflare worker runs (core.js) on your own
 * machine with real network access, so every failure shows its ACTUAL error
 * (DNS, TLS, HTTP status, bot-page, timeout, empty parse...).
 *
 * USAGE (from cmd / PowerShell / bash):
 *   node debug-catalog.js help
 *   node debug-catalog.js health                       4 source probes, live
 *   node debug-catalog.js catalog series asian-series search=queen of tears
 *   node debug-catalog.js catalog movie pinoy-movies --trace
 *   node debug-catalog.js get /manifest.json
 *   node debug-catalog.js probe https://pinoymovieshub.win/movies/
 *   node debug-catalog.js sites                        reachability matrix
 *   node debug-catalog.js remote https://your-worker.workers.dev
 *
 * Options:
 *   --trace        log every outbound HTTP request (url, status, ms, bytes)
 *   --json         machine-readable JSON output (health / sites / remote)
 *   --timeout N    per-request timeout in ms (default 20000)
 *   --core PATH    path to core.js (default: core.js next to this script)
 *
 * Env overrides (same as the worker):
 *   set TMDB_API_KEY=...        & node debug-catalog.js health
 *   set PINOY_SITE=https://...  & node debug-catalog.js health
 *   set KISSASIAN_SITE=https://... & node debug-catalog.js health
 *
 * Exit codes: 0 = all probes healthy, 1 = at least one failure, 2 = usage error.
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
var flags = { trace: false, json: false, timeout: 20000, core: null };
var positional = [];
for (var i = 0; i < argv.length; i++) {
  var a = argv[i];
  if (a === '--trace') flags.trace = true;
  else if (a === '--json') flags.json = true;
  else if (a === '--timeout') { flags.timeout = parseInt(argv[++i], 10) || 20000; }
  else if (a === '--core') { flags.core = argv[++i]; }
  else if (a === '-h' || a === '--help' || a === 'help') { positional = ['help']; }
  else positional.push(a);
}

var command = positional.shift() || 'help';

// ---------- pretty helpers (cmd.exe-safe: plain ASCII, no ANSI colors) ----------
var OUT = [];
function log(s) { OUT.push(s); if (!flags.json) console.log(s); }
function line(ch) { log(new Array(73).join(ch || '-')); }
function fmtBytes(n) {
  if (!isFinite(n)) return '?';
  if (n < 1024) return n + ' B';
  if (n < 1024 * 1024) return (n / 1024).toFixed(1) + ' KB';
  return (n / 1024 / 1024).toFixed(2) + ' MB';
}
function maskKey(u) { return String(u).replace(/([?&]api_key=)[0-9a-fA-F]+/g, '$1***'); }
function pad(s, n) { s = String(s == null ? '' : s); return s.length >= n ? s : s + new Array(n - s.length + 1).join(' '); }
function padL(s, n) { s = String(s == null ? '' : s); return s.length >= n ? s : new Array(n - s.length + 1).join(' ') + s; }

// ---------- core.js loader ----------
function loadCore() {
  var corePath = flags.core || path.join(__dirname, 'core.js');
  if (!fs.existsSync(corePath)) {
    console.error('[FAIL] core.js not found at: ' + corePath);
    console.error('       Run this script from the addons/asian-catalog folder, or pass --core <path>.');
    process.exit(2);
  }
  require(path.resolve(corePath));
  var Core = globalThis.AsianCatalogCore;
  if (!Core) {
    console.error('[FAIL] core.js loaded but globalThis.AsianCatalogCore missing (wrong file?).');
    process.exit(2);
  }
  return Core;
}

// ---------- traced / timeouted fetch ----------
var FETCH_LOG = [];   // for --json output

function fetchWithTimeout(url, opts, timeoutMs) {
  var ctl = new AbortController();
  var timer = setTimeout(function () { ctl.abort(new Error('timeout after ' + timeoutMs + 'ms')); }, timeoutMs);
  opts = opts || {};
  opts.signal = ctl.signal;
  return fetch(url, opts).then(
    function (res) { clearTimeout(timer); return res; },
    function (err) {
      clearTimeout(timer);
      if (err && err.name === 'AbortError') {
        var e = new Error('timeout after ' + timeoutMs + 'ms: ' + maskKey(url));
        throw e;
      }
      throw err;
    }
  );
}

function makeTracedFetch(timeoutMs) {
  return function tracedFetch(url, opts) {
    var t0 = Date.now();
    var disp = maskKey(url);
    log('  --> GET ' + disp);
    return fetchWithTimeout(url, opts, timeoutMs).then(
      function (res) {
        var clone = res.clone();
        return clone.text().catch(function () { return ''; }).then(function (body) {
          var ms = Date.now() - t0;
          var rec = { url: disp, status: res.status, ms: ms, bytes: body.length, error: null };
          FETCH_LOG.push(rec);
          log('  <-- ' + res.status + ' ' + padL(ms, 5) + 'ms ' + padL(fmtBytes(body.length), 8) + '  ' + shortUrl(disp));
          return res;
        });
      },
      function (err) {
        var ms = Date.now() - t0;
        var msg = String((err && err.message) || err);
        FETCH_LOG.push({ url: disp, status: null, ms: ms, bytes: 0, error: msg });
        log('  [!!] ' + padL(ms, 5) + 'ms  ' + disp);
        log('       ERROR: ' + msg);
        throw err;
      }
    );
  };
}

function shortUrl(u) { return String(u).replace(/^https?:\/\/[^/]+/, function (m) { return m; }).slice(0, 100); }

// ---------- bot / challenge page detection ----------
var BOT_MARKERS = [
  ['Just a moment...', 'Cloudflare JS challenge'],
  ['__cf_chl', 'Cloudflare challenge payload'],
  ['cf-challenge', 'Cloudflare challenge payload'],
  ['challenge-platform', 'Cloudflare challenge payload'],
  ['Attention Required', 'Cloudflare block page'],
  ['Access denied', 'access-denied page'],
  [' Press & Hold', 'DDoS-Guard press-and-hold'],
  ['ddos-guard', 'DDoS-Guard interstitial'],
  ['captcha', 'CAPTCHA gate'],
  ['Checking your browser', 'anti-bot interstitial'],
  ['enable javascript', 'JS-required shell']
];
function detectBotPage(bodyText) {
  var head = String(bodyText || '').slice(0, 4000).toLowerCase();
  for (var i = 0; i < BOT_MARKERS.length; i++) {
    if (head.indexOf(BOT_MARKERS[i][0].toLowerCase()) !== -1) return BOT_MARKERS[i][1];
  }
  return null;
}

var BROWSER_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,application/json;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9'
};

// ---------- effective config summary ----------
function configSummary(Core) {
  var cfg = Core.makeConfig(process.env);
  return {
    pinoySite: cfg.pinoySite,
    kissasianSite: cfg.kissasianSite,
    viewasianSite: cfg.viewasianSite,
    tmdbKey: String(cfg.tmdbKey).slice(0, 4) + '***' + String(cfg.tmdbKey).slice(-4),
    pageLimit: cfg.pageLimit,
    maxSitePages: cfg.maxSitePages,
    keepUnmatched: cfg.keepUnmatched,
    catalogs: Core.catalogDefinitions().length,
    version: Core.VERSION
  };
}

function printConfig(Core, where) {
  var c = configSummary(Core);
  log('Engine : core.js v' + c.version + ' (' + where + ')');
  log('Node   : ' + process.versions.node + ' | ' + process.platform);
  log('Pinoy  : ' + c.pinoySite);
  log('KissAsian: ' + c.kissasianSite);
  log('ViewAsian: ' + c.viewasianSite);
  log('TMDB   : ' + c.tmdbKey + ' | catalogs: ' + c.catalogs + ' | pageLimit: ' + c.pageLimit);
  var envKeys = ['TMDB_API_KEY', 'PINOY_SITE', 'KISSASIAN_SITE', 'VIEWASIAN_SITE', 'ASIAN_PAGE_LIMIT', 'ASIAN_MAX_PAGES', 'ASIAN_KEEP_UNMATCHED'];
  var active = envKeys.filter(function (k) { return process.env[k] != null && process.env[k] !== ''; });
  log('Env    : ' + (active.length ? active.join(', ') + ' (custom)' : 'defaults'));
}

// =====================================================================
// COMMANDS
// =====================================================================

function cmdHelp() {
  log('Asian Catalog debugger - commands:');
  log('');
  log('  node debug-catalog.js health');
  log('      Run the 4 /health source probes LOCALLY with real network.');
  log('      Shows the actual error for every failing source.');
  log('');
  log('  node debug-catalog.js catalog <type> <id> [extras...] [--trace]');
  log('      Fetch one catalog through the real engine. Extras joined by &,');
  log('      e.g.:  catalog series asian-series search=queen of tears');
  log('             catalog movie pinoy-movies');
  log('             catalog series asian-series-viewasian');
  log('             catalog series asian-series-genre genre=Romance');
  log('             catalog series asian-series-viewasian-genre genre=Korean');
  log('      --trace logs every outbound HTTP call made while resolving.');
  log('');
  log('  node debug-catalog.js get <path>');
  log('      Raw request through the engine, e.g.: get /manifest.json');
  log('');
  log('  node debug-catalog.js probe <url>');
  log('      Raw HTTP probe of ANY url (status, redirects, size, bot-page check).');
  log('');
  log('  node debug-catalog.js sites');
  log('      Reachability matrix of every upstream the ecosystem uses');
  log('      (catalog sources + asianhub lanes + animepahe).');
  log('');
  log('  node debug-catalog.js remote <worker-url> [path]');
  log('      Query your DEPLOYED Cloudflare worker. Compares its version');
  log('      against local core.js -> catches "forgot to redeploy".');
  log('      e.g.: remote https://asian-catalog.yourname.workers.dev /health');
  log('');
  log('Options: --trace  --json  --timeout <ms>  --core <path>');
  log('Exit codes: 0 healthy, 1 failures, 2 usage error.');
}

// ---------- health ----------
function cmdHealth(Core) {
  var env = Object.assign({}, process.env);
  if (flags.trace) env.__fetchFn = makeTracedFetch(flags.timeout);
  if (flags.json) env.__fetchFn = silentTracedFetch(flags.timeout);

  var t0 = Date.now();
  // healthReport(cfg) takes a CONFIG (makeConfig output), same as handle() builds internally
  return Core.healthReport(Core.makeConfig(env)).then(function (report) {
    if (flags.json) {
      log(JSON.stringify({ report: report, fetchLog: FETCH_LOG, totalMs: Date.now() - t0 }, null, 2));
      return failCount(report);
    }
    log('ASIAN CATALOG HEALTH (local run, real network)');
    line('=');
    printConfig(Core, 'local');
    line('=');
    var names = Object.keys(report.sources);
    for (var i = 0; i < names.length; i++) {
      var s = report.sources[names[i]];
      var tag = s.ok ? '[ OK ]' : '[FAIL]';
      log(pad(tag + ' ' + pad(names[i], 16), 26) + padL(s.ms, 6) + 'ms  items=' + padL(s.items, 3) + (s.error ? '  | ' + s.error : ''));
    }
    line('=');
    log('status: ' + report.status.toUpperCase() + '  (' + report.version + ')  total ' + (Date.now() - t0) + 'ms');
    if (report.hints && report.hints.length) {
      log('hints:');
      report.hints.forEach(function (h) { log('  * ' + h); });
    }
    return failCount(report);
  }).catch(function (err) {
    log('[FAIL] healthReport crashed: ' + String((err && err.stack) || err));
    return 1;
  });
}

function failCount(report) {
  var n = 0;
  Object.keys(report.sources).forEach(function (k) { if (!report.sources[k].ok) n++; });
  return n > 0 ? 1 : 0;
}

// ---------- catalog ----------
function cmdCatalog(Core, args) {
  var type = args.shift();
  var id = args.shift();
  if (!type || !id) {
    log('[FAIL] usage: node debug-catalog.js catalog <movie|series> <catalogId> [extras...]');
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

  var env = Object.assign({}, process.env);
  // always instrument: counts outbound calls; verbose lines only with --trace
  env.__fetchFn = flags.trace ? makeTracedFetch(flags.timeout) : silentTracedFetch(flags.timeout);

  printConfig(Core, 'local');
  line('=');
  log('GET ' + url + (extraPairs.length ? '   (path-segment extras, same as NuvioMobile/NuvioTVSmart)' : ''));

  var t0 = Date.now();
  return Core.handle(url, env).then(function (res) {
    return res.text().then(function (bodyText) {
      var ms = Date.now() - t0;
      var data = null;
      try { data = JSON.parse(bodyText); } catch (e) { /* not json */ }
      line('=');
      log('HTTP ' + res.status + ' in ' + ms + 'ms, body ' + fmtBytes(bodyText.length) + ', outbound calls: ' + FETCH_LOG.length);
      if (!data) {
        log('[FAIL] non-JSON response (first 400 chars):');
        log(bodyText.slice(0, 400));
        return 1;
      }
      if (data.error) {
        log('[FAIL] engine returned error: ' + data.error);
        return 1;
      }
      var metas = data.metas || [];
      var tmdbRows = metas.filter(function (m) { return /^tmdb:/.test(m.id); });
      var asianRows = metas.filter(function (m) { return /^asian:/.test(m.id); });
      log('[ OK ] metas: ' + metas.length + '  (tmdb matched: ' + tmdbRows.length + ', asian: fallback rows: ' + asianRows.length + ')');
      log('first rows:');
      metas.slice(0, 8).forEach(function (m, idx) {
        var yr = m.releaseInfo || '';
        log('  ' + padL(idx + 1, 2) + '. ' + pad(String(m.name).slice(0, 44), 46) + pad(yr, 12) + m.id + (m.poster ? '' : '  [no poster]'));
      });
      if (asianRows.length > 2) {
        log('');
        log('[WARN] ' + asianRows.length + ' rows could NOT be matched to TMDB (shown as asian: fallback).');
        log('       That reads as "not fetching properly" in Nuvio (no metadata/playback).');
        log('       Cause: title spelling/year mismatch between the site and TMDB.');
      }
      if (metas.length === 0) {
        log('[FAIL] 0 metas. Re-run with --trace to see which upstream call failed or returned 0 items.');
        return 1;
      }
      return 0;
    });
  }).catch(function (err) {
    log('[FAIL] handle() threw: ' + String((err && err.stack) || err));
    return 1;
  });
}

function silentTracedFetch(timeoutMs) {
  return function (url, opts) {
    var t0 = Date.now();
    return fetchWithTimeout(url, opts, timeoutMs).then(
      function (res) { FETCH_LOG.push({ url: maskKey(url), status: res.status, ms: Date.now() - t0 }); return res; },
      function (err) { FETCH_LOG.push({ url: maskKey(url), status: null, ms: Date.now() - t0, error: String((err && err.message) || err) }); throw err; }
    );
  };
}

// ---------- raw get ----------
function cmdGet(Core, args) {
  var p = args.join('') || '/';
  var env = Object.assign({}, process.env);
  if (flags.trace) env.__fetchFn = makeTracedFetch(flags.timeout);
  var t0 = Date.now();
  return Core.handle(p, env).then(function (res) {
    return res.text().then(function (body) {
      var ms = Date.now() - t0;
      log('GET ' + p + '  ->  HTTP ' + res.status + ' in ' + ms + 'ms, ' + fmtBytes(body.length));
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

// ---------- probe ----------
function cmdProbe(args) {
  var url = args[0];
  if (!url) {
    log('[FAIL] usage: node debug-catalog.js probe <url>');
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
      log('server: ' + (res.headers.get('server') || '?') + ' | cf-ray: ' + (res.headers.get('cf-ray') || '-'));
      if (bot) {
        log('[WARN] BOT PAGE DETECTED -> ' + bot);
        log('       This is why the worker gets 0 items even though the site works in your browser.');
        log('       (Worker IPs are datacenter IPs; browsers pass the JS challenge, servers do not.)');
      } else if (res.status >= 200 && res.status < 400 && body.length > 500) {
        log('[ OK ] reachable, real content, no bot gate.');
      } else if (res.status >= 400) {
        log('[FAIL] HTTP ' + res.status + ' ' + res.statusText);
      } else {
        log('[WARN] tiny body (' + fmtBytes(body.length) + ') - JS-only shell or empty response?');
      }
      line('=');
      log('body head (first 500 chars):');
      log(body.slice(0, 500).replace(/\s+/g, ' '));
      return (bot || res.status >= 400) ? 1 : 0;
    });
  }, function (err) {
    var ms = Date.now() - t0;
    log('[FAIL] request failed after ' + ms + 'ms: ' + String((err && err.message) || err));
    if (err && err.cause) log('       cause: ' + String(err.cause));
    log('       (ENOTFOUND = DNS dead / ECONNREFUSED = server down / CERT errors = TLS / timeout = slow or blocked)');
    return 1;
  });
}

// ---------- sites matrix ----------
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
  ['asianhub lane: KissKH fallback', 'https://kisskh.ovh/api/DramaList/Search?q=test&type=0']
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
        var bot = detectBotPage(body);
        var rec = { label: label, url: url, status: res.status, ms: Date.now() - st, bytes: body.length, bot: bot, error: null, finalUrl: res.url };
        results.push(rec);
      });
    }, function (err) {
      results.push({ label: label, url: url, status: null, ms: Date.now() - st, bytes: 0, bot: null, error: String((err && err.message) || err), finalUrl: null });
    });
  });
  return Promise.all(jobs).then(function () {
    results.sort(function (a, b) { return SITE_MATRIX.findIndex(function (e) { return e[0] === a.label; }) - SITE_MATRIX.findIndex(function (e) { return e[0] === b.label; }); });
    var fails = 0;
    results.forEach(function (r) {
      var verdict, tag;
      if (r.error) { tag = '[FAIL]'; verdict = r.error; fails++; }
      else if (r.bot) { tag = '[GATE]'; verdict = r.status + ' but ' + r.bot + ' -> server-side scraping gets 0 items'; fails++; }
      else if (r.status >= 400) { tag = '[FAIL]'; verdict = 'HTTP ' + r.status; fails++; }
      else { tag = '[ OK ]'; verdict = 'HTTP ' + r.status; }
      log(pad(tag + ' ' + pad(r.label, 32), 42) + padL(r.ms, 6) + 'ms ' + padL(fmtBytes(r.bytes), 9) + '  ' + verdict);
    });
    line('=');
    log('total ' + (Date.now() - t0) + 'ms | ' + (results.length - fails) + '/' + results.length + ' reachable');
    var gated = results.filter(function (r) { return r.bot; });
    if (gated.length) {
      log('');
      log('bot-gated hosts (' + gated.map(function (r) { return r.label.split(':')[0].trim(); }).join(', ') + ') fail from DATACENTER IPs');
      log('(Cloudflare Workers, GitHub Actions) but usually work from home/residential IPs.');
    }
    if (flags.json) log(JSON.stringify({ sites: results }, null, 2));
    return fails > 0 ? 1 : 0;
  });
}

// ---------- remote (deployed worker) ----------
function cmdRemote(Core, args) {
  var base = args.shift();
  var extraPath = args.join('') || '/health';
  if (!base) {
    log('[FAIL] usage: node debug-catalog.js remote https://your-worker.workers.dev [/health]');
    return Promise.resolve(2);
  }
  base = base.replace(/\/+$/, '');
  if (!/^https?:\/\//i.test(base)) base = 'https://' + base;
  var url = base + (extraPath.charAt(0) === '/' ? extraPath : '/' + extraPath);

  log('REMOTE CHECK  ' + base);
  line('=');
  printConfig(Core, 'local reference');
  line('=');

  var t0 = Date.now();
  return fetchWithTimeout(url, { headers: BROWSER_HEADERS }, flags.timeout).then(function (res) {
    return res.text().then(function (body) {
      var ms = Date.now() - t0;
      log('GET ' + extraPath + '  ->  HTTP ' + res.status + ' in ' + ms + 'ms, ' + fmtBytes(body.length));
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
          log(pad((s.ok ? '[ OK ] ' : '[FAIL] ') + names[i], 24) + padL(s.ms, 6) + 'ms items=' + padL(s.items, 3) + (s.error ? '  | ' + s.error : ''));
        }
        log('remote status: ' + String(report.status).toUpperCase() + '  version: ' + report.version);
        (report.hints || []).forEach(function (h) { log('  hint: ' + h); });
        var localV = Core.VERSION;
        if (flags.json) {
          log(JSON.stringify({ base: base, path: extraPath, report: report, deployedVersion: report.version, localVersion: localV, versionMatch: String(report.version) === localV }, null, 2));
        }
        if (String(report.version) !== localV) {
          log('');
          log('[WARN] VERSION MISMATCH: deployed=' + report.version + '  local core.js=' + localV);
          log('       Your Cloudflare worker is running OLD code.');
          log('       FIX: Cloudflare dashboard -> Workers -> your worker -> Edit ->');
          log('       paste the full content of addons/asian-catalog/worker-bundle.js -> Deploy.');
          log('       Then re-run: node debug-catalog.js remote ' + base + ' /health');
          return 1;
        }
        return failCount(report);
      }
      // non-health path: just show body
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
  console.error('[FAIL] unhandled rejection: ' + String((err && err.stack) || err));
  process.exit(1);
});

function main() {
  var Core = null;
  if (command !== 'help') Core = loadCore();

  var p;
  switch (command) {
    case 'help': cmdHelp(); p = Promise.resolve(0); break;
    case 'health': p = cmdHealth(Core); break;
    case 'catalog': p = cmdCatalog(Core, positional); break;
    case 'get': p = cmdGet(Core, positional); break;
    case 'probe': p = cmdProbe(positional); break;
    case 'sites': p = cmdSites(); break;
    case 'remote': p = cmdRemote(Core, positional); break;
    default:
      log('[FAIL] unknown command: ' + command + '   (try: node debug-catalog.js help)');
      p = Promise.resolve(2);
  }

  p.then(function (code) {
    if (flags.trace && FETCH_LOG.length) {
      log('');
      log('--- fetch log: ' + FETCH_LOG.length + ' outbound call(s) ---');
    }
    process.exit(typeof code === 'number' ? code : 0);
  }, function (err) {
    console.error('[FAIL] ' + String((err && err.stack) || err));
    process.exit(1);
  });
}

main();
