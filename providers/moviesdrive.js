/* ===== nv-plugins moviesdrive.js v6.0.0 (pack 4.40.0) =======================
   Clean readable port of Eclipsia "Vornix." (codeberg eclipsia/nuvio-plugin
   readable sources), device-safe for the bare Nuvio QuickJS realm.
   Flow: TMDB lookup (+imdb) -> host-follow -> {MAIN}/search.php?q=<imdb|title>
         -> match hit (imdb exact, or strict title+year; tv must show the
         season) -> page -> mdrive.lol/archive/<id> links (season-sliced,
         480p dropped) -> hubcloud.<tld>/drive/<id> hosts (ep-window check)
         -> hubcloud page (Cookie xla=s4t) -> var url / a#download hop
         -> fsl.gigabytes.icu (FSLv2) | pub-*.r2.dev / *.buzz (FSL, +"1"+min)
         | ?token= fallback | "Download File"-style anchor scan.
   Endpoint diffs vs Eclipsia "Vornix." (live-probed 2026-09):
   - MAIN_URL "https://new1.moviesdrive.christmas" KEPT from the current pack
     file (device-verified; Eclipsia's new3 host answers identically today,
     new1 + new3 serve the same Typesense index).
   - TMDB key 439c478a771f35c05022f9feabcca01c kept from the current pack
     (Eclipsia uses a different key); /find/ tt-id branch kept.
   - Row naming kept from the current pack file ("<title> - MoviesDrive",
     "(FSLv2) [size]", FSLv2-first sort, >=1080p native filter).
   Device notes: no timers (every race guarded), no require/cheerio
   (cheerio-lite loader per pack spec; extraction is regex house style - all
   Eclipsia selectors are id/class/attr/.next()/.filter() forms outside the
   lite subset), no URL constructor (regex origin parse for the host-follow),
   atob via preamble, sequential probes with hard caps (6 archives, 6 hosts,
   early-exit at 6 rows), response.ok + try/catch fail-soft everywhere.
   Verified WINGS lane (pack 4.33.0, vidking/speedracelight backend) is kept
   as the first lane; native below is the fallback.
============================================================================ */
/* ===== nv-plugins device polyfills v1.0.0 (pack 4.37.0, 2026-09-14) ============
   The Nuvio QuickJS plugin runtime (quickjs-kt 1.0.5-nuvio AAR) is a bare
   ES2020 realm: no atob/btoa, no URLSearchParams, no TextDecoder, no timers.
   These polyfills are define-only-if-missing, so node/desktop runtimes are
   completely unaffected. ==================================================== */
(function() {
  var G = typeof globalThis !== 'undefined' ? globalThis : (typeof global !== 'undefined' ? global : this);
  if (typeof G.atob !== 'function') {
    var _CH = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    G.atob = function(s) {
      s = String(s).replace(/[^A-Za-z0-9+\/]/g, '');
      var out = '',
        bits = 0,
        acc = 0,
        i;
      for (i = 0; i < s.length; i++) {
        acc = (acc << 6) | _CH.indexOf(s.charAt(i));
        bits += 6;
        if (bits >= 8) {
          bits -= 8;
          out += String.fromCharCode((acc >> bits) & 0xff);
        }
      }
      return out;
    };
  }
  if (typeof G.btoa !== 'function') {
    var _CH2 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    G.btoa = function(s) {
      s = String(s);
      var out = '',
        i;
      for (i = 0; i < s.length; i += 3) {
        var b0 = s.charCodeAt(i),
          b1 = s.charCodeAt(i + 1),
          b2 = s.charCodeAt(i + 2);
        var has1 = !(i + 1 >= s.length || isNaN(b1)),
          has2 = !(i + 2 >= s.length || isNaN(b2));
        out += _CH2.charAt(b0 >> 2);
        out += _CH2.charAt(((b0 & 3) << 4) | (has1 ? b1 >> 4 : 0));
        out += has1 ? _CH2.charAt(((b1 & 15) << 2) | (has2 ? b2 >> 6 : 0)) : '=';
        out += has2 ? _CH2.charAt(b2 & 63) : '=';
      }
      return out;
    };
  }
  if (typeof G.URLSearchParams !== 'function') {
    var USP = function(init) {
      this._m = {};
      if (init && typeof init === 'object') {
        for (var k in init)
          if (Object.prototype.hasOwnProperty.call(init, k)) this._m[k] = [String(init[k])];
      }
    };
    USP.prototype.append = function(k, v) {
      (this._m[k] = this._m[k] || []).push(String(v));
    };
    USP.prototype.set = function(k, v) {
      this._m[k] = [String(v)];
    };
    USP.prototype.get = function(k) {
      var a = this._m[k];
      return a && a.length ? a[0] : null;
    };
    USP.prototype.has = function(k) {
      return Object.prototype.hasOwnProperty.call(this._m, k);
    };
    USP.prototype.toString = function() {
      var out = [];
      for (var k in this._m) {
        if (!Object.prototype.hasOwnProperty.call(this._m, k)) continue;
        var vs = this._m[k];
        for (var i = 0; i < vs.length; i++)
          out.push(encodeURIComponent(k).replace(/%20/g, '+') + '=' + encodeURIComponent(vs[i]).replace(
            /%20/g, '+'));
      }
      return out.join('&');
    };
    G.URLSearchParams = USP;
  }
})();
var __nvCheerioLite = (function () {
  var VOID = { br:1, img:1, input:1, meta:1, link:1, hr:1, source:1, area:1, base:1, col:1, embed:1, track:1, wbr:1 };
  function parseHtml(html) {
    var src = String(html || "")
      .replace(/<!--[\s\S]*?-->/g, "")
      .replace(/<(script|style)\b[\s\S]*?<\/\1>/gi, "");
    var root = { tag: "#root", attrs: {}, children: [], parent: null };
    var stack = [root];
    var re = /<([a-zA-Z][a-zA-Z0-9]*)((?:\s+[^<>]*?)?)(\/?)>|<\/([a-zA-Z][a-zA-Z0-9]*)\s*>|([^<]+)/g;
    var m;
    while ((m = re.exec(src)) !== null) {
      if (m[1]) {
        var tag = m[1].toLowerCase();
        var node = { tag: tag, attrs: {}, children: [], parent: stack[stack.length - 1] };
        var are = /([a-zA-Z_:][a-zA-Z0-9_:.\-]*)\s*(?:=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g, am;
        while ((am = are.exec(m[2] || "")) !== null) {
          node.attrs[am[1].toLowerCase()] = am[2] !== undefined ? am[2] : (am[3] !== undefined ? am[3] : (am[4] !== undefined ? am[4] : ""));
        }
        node.parent.children.push(node);
        if (!m[3] && !VOID[tag]) stack.push(node);
      } else if (m[4]) {
        var ct = m[4].toLowerCase();
        for (var k = stack.length - 1; k > 0; k--) {
          if (stack[k].tag === ct) { stack.length = k; break; }
        }
      } else if (m[5]) {
        if (/\S/.test(m[5])) {
          var tp = stack[stack.length - 1];
          tp.children.push({ tag: "#text", attrs: {}, children: [], parent: tp, text: m[5] });
        }
      }
    }
    return root;
  }
  function chainMatch(el, chain) {
    if (el.tag !== chain[chain.length - 1]) return false;
    var i = chain.length - 2, p = el.parent;
    while (i >= 0 && p) {
      if (p.tag === chain[i]) i--;
      p = p.parent;
    }
    return i < 0;
  }
  function select(root, selector) {
    var chain = String(selector || "").trim().toLowerCase().split(/\s+/);
    var out = [];
    if (!chain.length || !chain[0]) return out;
    (function walk(node) {
      for (var i = 0; i < node.children.length; i++) {
        var c = node.children[i];
        if (c.tag === "#text") continue;
        if (chainMatch(c, chain)) out.push(c);
        walk(c);
      }
    })(root);
    return out;
  }
  function collectText(el) {
    var out = "";
    for (var i = 0; i < el.children.length; i++) {
      var c = el.children[i];
      out += (c.tag === "#text") ? c.text : collectText(c);
    }
    return out;
  }
  function wrap(el) {
    return {
      attr: function (name) {
        var v = el.attrs[String(name || "").toLowerCase()];
        return v === undefined ? undefined : String(v);
      },
      find: function (sel) { return makeColl(select(el, sel)); },
      text: function () { return collectText(el); }
    };
  }
  function makeColl(els) {
    var coll = {
      length: els.length,
      each: function (fn) {
        for (var i = 0; i < els.length; i++) fn(i, els[i]);
        return coll;
      },
      attr: function (name) { return els.length ? wrap(els[0]).attr(name) : undefined; },
      find: function (sel) {
        var all = [];
        for (var i = 0; i < els.length; i++) all = all.concat(select(els[i], sel));
        return makeColl(all);
      },
      text: function () {
        var out = "";
        for (var i = 0; i < els.length; i++) out += collectText(els[i]);
        return out;
      }
    };
    return coll;
  }
  return {
    load: function (html) {
      var root = parseHtml(html);
      var $ = function (selOrEl, ctx) {
        if (selOrEl && selOrEl.tag) return makeColl([selOrEl]);
        return makeColl(select(ctx || root, selOrEl));
      };
      return $;
    }
  };
})();

/* ===== guarded cheerio binding (pack 4.40.0 spec) ==========================
   The device QuickJS realm ships no require capability, so the pack's
   pure-JS cheerio-lite above is always the active implementation in this
   file. (topcartoons.js keeps a real-cheerio load branch for node; here
   that branch is intentionally gone: after the regex rewrite these
   providers carry zero cheerio call sites - every Eclipsia selector was a
   class/id/[attr]/.next()/.filter() form outside the lite subset - and the
   pack verify gate requires module files with zero module loads.)
========================================================================== */
var cheerio = __nvCheerioLite;
var __nvFetch = (function () {
  var _f = null;
  try { _f = (typeof fetch === "function") ? fetch : null; } catch (e) { _f = null; }
  if (!_f) return function () { return Promise.reject(new Error("no fetch")); };
  var hasT = typeof setTimeout === "function";
  return function (input, init) {
    var p;
    try { p = _f.apply(this, arguments); } catch (e) { return Promise.reject(e); }
    if (!hasT || !p || typeof p.then !== "function") return p;
    return Promise.race([p, new Promise(function (_res, rej) {
      var t = setTimeout(function () { rej(new Error("nv deadline 8s")); }, 8000);
      if (t && typeof t.unref === "function") t.unref();
    })]);
  };
})();
/* ============================================================
 * nv-plugins WINGS lane v1.0.0 (pack 4.33.0, 2026-09-13)
 * ------------------------------------------------------------
 * Self-contained extraction lane for the vidking/speedracelight
 * backend (same backend the VidEasy/Cineby providers use), ported
 * from the verified cineby.js decryptor and videasy.js request
 * shapes. Live-verified 2026-09-13: Fight Club (movie) 3 rows,
 * Breaking Bad S1E1 (tv) rows, m3u8 payloads return 200 real HLS.
 *
 * Exposes one function: __nvWingsStreams(opts)
 *   opts = { tmdbId, mediaType, season, episode, label, timeoutMs }
 * Returns a Promise<rows[]>; NEVER rejects, NEVER throws.
 * Uses __nvFetch when present, else global fetch.
 * Pure JS: no URLSearchParams, no AbortController, no node APIs.
 * ============================================================ */
(function () {
  'use strict';

  var WINGS_BASE = 'https://api.speedracelight.com';
  var TMDB_KEY = '439c478a771f35c05022f9feabcca01c';
  var WINGS_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';
  var WINGS_HEADERS = {
    'User-Agent': WINGS_UA,
    'Accept': '*/*',
    'Origin': 'https://www.vidking.net',
    'Referer': 'https://www.vidking.net/',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  };
  var WINGS_SERVERS = ['cdn/sources-with-title', 'm4uhd/sources-with-title', 'lamovie/sources-with-title'];
  var MAGIC = [0x6d, 0x76, 0x6d, 0x31]; /* "mvm1" */
  var SHA_C = [0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
               0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174];

  function _f(x) {
    x = x >>> 0;
    x ^= x >>> 16; x = Math.imul(x, 0x85ebca6b) >>> 0;
    x ^= x >>> 13; x = Math.imul(x, 0xc2b2ae35) >>> 0;
    x = (x ^ (x >>> 16)) >>> 0;
    return x;
  }
  function _rotl(x, n) {
    x = x >>> 0; n = n & 31;
    if (n === 0) return x >>> 0;
    return ((x << n) | (x >>> (32 - n))) >>> 0;
  }
  function _branch(n) { return ((n * (n + 1)) & 1) === 0; }
  function _fnv(s) {
    var h = 0x811c9dc5;
    for (var i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 0x1000193) >>> 0;
    return _f(h);
  }
  function _makeState(seed, mediaId) {
    var slots = new Array(61);
    var s = _f(_fnv(seed) ^ _f(((mediaId >>> 0) ^ 0x9e3779b9) >>> 0)) >>> 0;
    for (var i = 0; i < 8; i++) {
      if (_branch(i)) {
        var idx = s % 61;
        s = _rotl((s + 0x9e3779b9) >>> 0, 7 + (i & 7));
        slots[idx] = (s ^ _f(s)) >>> 0;
        s = _f((s + idx) >>> 0);
      } else {
        slots[i] = SHA_C[i & 15];
      }
    }
    return { slots: slots, acc: _f((0xa5a5a5a5 ^ s) >>> 0) >>> 0 };
  }
  function _next(state, counter) {
    var slots = state.slots, acc = state.acc;
    var idx = acc % 61;
    var missing = (idx in slots) ? -1 : 0;
    var v = slots[idx] >>> 0;
    var t = ((v ^ Math.imul(0x9e3779b9, counter + 1)) >>> 0) >>> 0;
    var w = (((acc ^ t) >>> 0 | ((acc & t & missing) >>> 0)) >>> 0) >>> 0;
    var u = (_rotl((w + acc) >>> 0, idx & 31) ^ _rotl(acc, Math.imul(idx, 7) & 31)) >>> 0;
    var r = _f((u + 0x9e3779b9) >>> 0);
    slots[idx] = r >>> 0;
    state.acc = r;
    return r >>> 0;
  }
  function _keystream(seed, mediaId, len) {
    var st = _makeState(seed, mediaId);
    var out = new Uint8Array(len);
    var i = 0;
    var wc = 0;
    while (i < len) {
      var w = _next(st, wc++);
      out[i++] = w & 0xff;
      if (i < len) out[i++] = (w >>> 8) & 0xff;
      if (i < len) out[i++] = (w >>> 16) & 0xff;
      if (i < len) out[i++] = (w >>> 24) & 0xff;
    }
    return out;
  }
  function _b64urlToBytes(s) {
    s = String(s).replace(/-/g, '+').replace(/_/g, '/');
    while (s.length % 4 !== 0) s += '=';
    var bin;
    if (typeof atob === 'function') {
      bin = atob(s);
    } else {
      var CH = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
      var clean = '';
      for (var q = 0; q < s.length; q++) { var c = s.charAt(q); if (c !== '=' && CH.indexOf(c) !== -1) clean += c; }
      bin = '';
      for (var w = 0; w < clean.length; w += 4) {
        var a = CH.indexOf(clean.charAt(w)), b = CH.indexOf(clean.charAt(w + 1));
        var c2 = w + 2 < clean.length ? CH.indexOf(clean.charAt(w + 2)) : -1;
        var d2 = w + 3 < clean.length ? CH.indexOf(clean.charAt(w + 3)) : -1;
        bin += String.fromCharCode((a << 2) | (b >> 4));
        if (c2 !== -1) bin += String.fromCharCode(((b & 15) << 4) | (c2 >> 2));
        if (d2 !== -1) bin += String.fromCharCode(((c2 & 15) << 6) | d2);
      }
    }
    var out = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i) & 0xff;
    return out;
  }
  function _utf8(bytes, start) {
    var s = '';
    var i = start || 0;
    while (i < bytes.length) {
      var b = bytes[i++];
      if (b < 0x80) s += String.fromCharCode(b);
      else if ((b & 0xe0) === 0xc0) s += String.fromCharCode(((b & 0x1f) << 6) | (bytes[i++] & 0x3f));
      else if ((b & 0xf0) === 0xe0) s += String.fromCharCode(((b & 0x0f) << 12) | ((bytes[i++] & 0x3f) << 6) | (bytes[i++] & 0x3f));
      else if ((b & 0xf8) === 0xf0) {
        var cp = ((b & 0x07) << 18) | ((bytes[i++] & 0x3f) << 12) | ((bytes[i++] & 0x3f) << 6) | (bytes[i++] & 0x3f);
        cp -= 0x10000;
        s += String.fromCharCode(0xd800 + (cp >> 10), 0xdc00 + (cp & 0x3ff));
      } else s += String.fromCharCode(b);
    }
    return s;
  }
  function wingsDecrypt(payloadB64, seed, mediaId) {
    var bytes = _b64urlToBytes(payloadB64);
    var ks = _keystream(seed, mediaId, bytes.length);
    for (var i = 0; i < bytes.length; i++) bytes[i] = (bytes[i] ^ ks[i]) & 0xff;
    for (var m = 0; m < MAGIC.length; m++) {
      if (bytes[m] !== MAGIC[m]) throw new Error('wings decrypt failed: bad magic');
    }
    return _utf8(bytes, MAGIC.length);
  }

  function _fetchX(url, opts) {
    var f = (typeof __nvFetch === 'function') ? __nvFetch : (typeof fetch === 'function' ? fetch : null);
    if (!f) return Promise.reject(new Error('no fetch'));
    return f(url, opts);
  }
  function _race(p, ms, fallback) {
    if (typeof setTimeout !== 'function') {
      /* device QuickJS ships no timers - the timer leg must never throw */
      return Promise.resolve(p).then(function (v) { return v; }, function () { return fallback; });
    }
    return new Promise(function (resolve) {
      var done = false;
      var t = setTimeout(function () { if (!done) { done = true; resolve(fallback); } }, ms);
      if (t && typeof t.unref === 'function') t.unref();
      Promise.resolve(p).then(function (v) { if (!done) { done = true; clearTimeout(t); resolve(v); } },
                              function () { if (!done) { done = true; clearTimeout(t); resolve(fallback); } });
    });
  }
  function _jsonText(resp) {
    return Promise.resolve(resp.text()).catch(function () { return ''; });
  }

  function wingsTmdbMeta(tmdbId, mediaType) {
    var url = 'https://api.themoviedb.org/3/' + (mediaType === 'tv' ? 'tv' : 'movie') + '/' +
      parseInt(tmdbId, 10) + '?api_key=' + TMDB_KEY + '&append_to_response=external_ids';
    return _race(
      _fetchX(url, { headers: { 'User-Agent': WINGS_UA, 'Accept': 'application/json' } })
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (j) {
          if (!j) return null;
          return {
            title: mediaType === 'tv' ? j.name : j.title,
            year: ((mediaType === 'tv' ? j.first_air_date : j.release_date) || '').substring(0, 4),
            imdbId: (j.external_ids && j.external_ids.imdb_id) || j.imdb_id || ''
          };
        }),
      6000, null);
  }

  function wingsQueryServer(serverPath, seed, meta, mediaType, season, episode, tmdbId) {
    var params = 'title=' + encodeURIComponent(meta.title || '') +
      '&mediaType=' + (mediaType === 'tv' ? 'tv' : 'movie') +
      '&year=' + encodeURIComponent(String(meta.year || '')) +
      '&episodeId=' + String(mediaType === 'tv' ? (episode || 1) : 1) +
      '&seasonId=' + String(mediaType === 'tv' ? (season || 1) : 1) +
      '&tmdbId=' + String(tmdbId) +
      '&imdbId=' + encodeURIComponent(meta.imdbId || '') +
      '&enc=2&seed=' + encodeURIComponent(seed);
    return _fetchX(WINGS_BASE + '/' + serverPath + '?' + params, { headers: WINGS_HEADERS })
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.text(); })
      .then(function (txt) {
        if (!txt || !txt.length) throw new Error('empty');
        var json = wingsDecrypt(txt, seed, parseInt(tmdbId, 10));
        var obj = JSON.parse(json);
        return obj;
      });
  }

  function wingsNormQuality(q) {
    var s = String(q || '').toLowerCase();
    if (s.indexOf('2160') !== -1 || s.indexOf('4k') !== -1) return '4K';
    if (s.indexOf('1440') !== -1) return '1440p';
    if (s.indexOf('1080') !== -1) return '1080p';
    if (s.indexOf('720') !== -1) return '720p';
    if (s.indexOf('480') !== -1) return '480p';
    return 'Auto';
  }

  /**
   * __nvWingsStreams(opts) -> Promise<rows[]>
   */
  function __nvWingsStreams(opts) {
    opts = opts || {};
    var label = opts.label || 'Wings';
    var timeoutMs = opts.timeoutMs || 20000;
    try {
      var tmdbId = parseInt(String(opts.tmdbId || '').replace(/\D/g, ''), 10);
      if (!tmdbId) return Promise.resolve([]);
      var mediaType = opts.mediaType === 'tv' || opts.mediaType === 'series' ? 'tv' : 'movie';
      return wingsTmdbMeta(tmdbId, mediaType).then(function (meta) {
        if (!meta || !meta.title) return [];
        return _fetchX(WINGS_BASE + '/seed?mediaId=' + tmdbId, { headers: WINGS_HEADERS })
          .then(function (r) {
            if (r.ok) return r.json();
            if (r.status === 429 || r.status === 503) {
              /* seed endpoint rate-limits bursts; on the serialized device bridge
                 the immediate retry lands past the burst window */
              return _fetchX(WINGS_BASE + '/seed?mediaId=' + tmdbId, { headers: WINGS_HEADERS })
                .then(function (r2) { return r2.ok ? r2.json() : null; }, function () { return null; });
            }
            return null;
          })
          .then(function (j) {
            if (!j || !j.seed) throw new Error('no seed');
            var seed = j.seed;
            var jobs = WINGS_SERVERS.map(function (sp) {
              return wingsQueryServer(sp, seed, meta, mediaType, opts.season, opts.episode, tmdbId)
                .then(function (o) { return o; }, function () { return null; });
            });
            /* collect PARTIAL results: never gate on the slowest server.
             * undefined = still pending, null = failed, object = success. */
            return new Promise(function (resolve) {
              var results = new Array(jobs.length);
              var done = false;
              var t = null;
              if (typeof setTimeout === 'function') {
                /* device QuickJS ships no timers - guard every timer use */
                t = setTimeout(function () { if (!done) { done = true; resolve(results); } }, Math.max(6000, timeoutMs - 2500));
                if (t && typeof t.unref === 'function') t.unref();
              }
              var pending = jobs.length;
              var settle = function () {
                if (!done) { done = true; if (t) clearTimeout(t); resolve(results); }
              };
              jobs.forEach(function (jp, idx) {
                Promise.resolve(jp).then(function (obj) {
                  results[idx] = obj; pending--; if (pending <= 0) settle();
                }, function () {
                  results[idx] = null; pending--; if (pending <= 0) settle();
                });
              });
            }).then(function (results) {
              results = results || [];
              var seen = {};
              var rows = [];
              for (var i = 0; i < results.length; i++) {
                var obj = results[i];
                if (!obj) continue;
                var subs = (obj.subtitles || []).filter(function (s) { return s && s.url; })
                  .map(function (s) {
                    return { url: s.url, language: s.lang || s.language || 'en', name: s.language || s.lang || 'English' };
                  });
                var srcs = obj.sources || [];
                for (var k = 0; k < srcs.length; k++) {
                  var src = srcs[k];
                  if (!src || !src.url) continue;
                  if (seen[src.url]) continue;
                  seen[src.url] = true;
                  var q = wingsNormQuality(src.quality);
                  rows.push({
                    name: label + ' | ' + q,
                    title: label + ' ' + q + (mediaType === 'tv' ? ' S' + (opts.season || 1) + 'E' + (opts.episode || 1) : ''),
                    url: src.url,
                    quality: q,
                    headers: {
                      'User-Agent': WINGS_UA,
                      'Referer': 'https://www.vidking.net/',
                      'Origin': 'https://www.vidking.net'
                    },
                    subtitles: subs
                  });
                }
              }
              rows.sort(function (a, b) {
                var order = { '4K': 4, '1440p': 3, '1080p': 2, '720p': 1 };
                return (order[b.quality] || 0) - (order[a.quality] || 0);
              });
              return rows;
            });
          });
      }).catch(function () { return []; });
    } catch (e) { return Promise.resolve([]); }
  }

  if (typeof globalThis !== 'undefined') globalThis.__nvWingsStreams = __nvWingsStreams;
})();

/* ===== moviesdrive native lane (clean port of Eclipsia "Vornix." + the
   verified 4.39 flow; row naming kept from the current pack file) ========== */

var PROVIDER_NAME = "MoviesDrive";
var MAIN_URL = "https://new1.moviesdrive.christmas";
var ARCHIVE_DOMAIN = "https://mdrive.lol";
var TMDB_API = "https://api.themoviedb.org/3";
var TMDB_KEY = "439c478a771f35c05022f9feabcca01c";
var MAX_ARCHIVES = 6;  /* device cap: archive pages fetched per call */
var MAX_HOSTS = 6;     /* device cap: hubcloud hosts resolved per call */
var MAX_STREAMS = 6;   /* device cap: early-exit once this many rows are in */

var MOBILE_UAS = [
  "Mozilla/5.0 (Linux; Android 14; Pixel 8 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36",
  "Mozilla/5.0 (Linux; Android 13; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36",
  "Mozilla/5.0 (Linux; Android 12; Pixel 6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Mobile Safari/537.36",
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
  "Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"
];
var DESKTOP_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

var HUBCLOUD_SERVER_LABELS = [
  ["r2.dev", "Direct R2"],
  ["workers.dev", "ZipDisk"],
  ["fsl server", "FSL"],
  ["s3 server", "S3"],
  ["fslv2", "FSLv2"],
  ["mega server", "Mega"]
];

function pickUa() {
  return MOBILE_UAS[Math.floor(Math.random() * MOBILE_UAS.length)];
}

function baseHeaders(extra) {
  var h = { "User-Agent": pickUa(), "Accept-Language": "en-US,en;q=0.9", "Referer": MAIN_URL + "/" };
  if (extra) for (var k in extra) h[k] = extra[k];
  return h;
}

/* every network call is raced against a guarded deadline; on the device
   realm (no timers) the fail-soft catch + __nvFetch still apply */
function fetchText(url, extraHeaders, timeoutMs) {
  var p = __nvFetch(url, { headers: baseHeaders(extraHeaders) })
    .then(function (r) { return (r && r.ok) ? r.text() : null; });
  var raced = p;
  if (typeof setTimeout === "function") {
    raced = Promise.race([p, new Promise(function (res) {
      var t = setTimeout(function () { res(null); }, timeoutMs || 10000);
      if (t && typeof t.unref === "function") t.unref();
    })]);
  }
  return raced.then(function (v) { return v || null; }, function () { return null; });
}

function fetchJson(url, extraHeaders, timeoutMs) {
  return fetchText(url, extraHeaders, timeoutMs).then(function (t) {
    if (!t) return null;
    try { return JSON.parse(t); } catch (e) { return null; }
  });
}

function pad2(n) {
  n = parseInt(n, 10);
  return (n >= 0 && n < 10) ? "0" + n : String(n);
}

function minutes() {
  try { return String(new Date().getMinutes()); } catch (e) { return "0"; }
}

/* quality label: current-pack parity (2160p/1080p/720p/480p, 1440p, else HD) */
function parseQuality(raw) {
  var s = String(raw || "");
  var m = s.match(/(2160|1080|720|480)\s*P/i);
  if (m) return m[1] + "p";
  if (/4K|UHD/i.test(s)) return "2160p";
  if (/1440|2K/i.test(s)) return "1440p";
  return "HD";
}

/* MAIN_URL 302s to the current generation host and the Cloudflare redirect
   drops the query string; resolve the effective origin once per native call
   and re-point MAIN_URL (4.32.0 host-follow fix, now without `new URL`,
   which the bare QuickJS realm does not have) */
function hostFollow() {
  return __nvFetch(MAIN_URL, { headers: { "User-Agent": DESKTOP_UA } })
    .then(function (r) {
      var finalUrl = r && r.url;
      if (finalUrl && typeof finalUrl === "string") {
        var om = finalUrl.match(/^https?:\/\/[^\/]+/);
        if (om && om[0] && om[0] !== MAIN_URL && /moviesdrive|mdrive/i.test(om[0])) {
          MAIN_URL = om[0];
        }
      }
      return null;
    }, function () { return null; });
}

function getMedia(tmdbId, mediaType) {
  var id = String(tmdbId || "").trim();
  var isTv = mediaType === "tv" || mediaType === "series";
  var type = isTv ? "tv" : "movie";
  if (id.indexOf("tt") === 0) {
    return fetchJson(TMDB_API + "/find/" + id + "?api_key=" + TMDB_KEY + "&external_source=imdb_id",
      { "Accept": "application/json" }, 10000).then(function (data) {
        var hit = data ? (isTv ? data.tv_results : data.movie_results) : null;
        if (hit && hit.length) {
          return {
            title: isTv ? hit[0].name : hit[0].title,
            year: String(hit[0].first_air_date || hit[0].release_date || "").split("-")[0],
            imdb: id
          };
        }
        return { title: id, year: null, imdb: null };
      }, function () { return { title: id, year: null, imdb: null }; });
  }
  return fetchJson(TMDB_API + "/" + type + "/" + id + "?api_key=" + TMDB_KEY + "&append_to_response=external_ids",
    { "Accept": "application/json" }, 10000).then(function (data) {
      if (!data) return { title: id, year: null, imdb: null };
      return {
        title: isTv ? data.name : data.title,
        year: String(data.first_air_date || data.release_date || "").split("-")[0],
        imdb: (data.imdb_id || (data.external_ids && data.external_ids.imdb_id)) || null
      };
    }, function () { return { title: id, year: null, imdb: null }; });
}

/* Typesense-backed search: {hits:[{document:{post_title, permalink, imdb_id}}} */
function searchSite(query) {
  if (!query) return Promise.resolve([]);
  return fetchJson(MAIN_URL + "/search.php?q=" + encodeURIComponent(query) + "&per_page=10",
    { "Accept": "application/json" }, 10000).then(function (data) {
      var hits = (data && data.hits) || [];
      var out = [];
      for (var i = 0; i < hits.length && out.length < 10; i++) {
        var d = hits[i] && hits[i].document;
        if (d && d.permalink && d.post_title) {
          var ym = d.post_title.match(/\((\d{4})\)/);
          out.push({
            title: d.post_title,
            href: d.permalink,
            year: ym ? parseInt(ym[1], 10) : null,
            imdb: d.imdb_id || null
          });
        }
      }
      return out;
    }, function () { return []; });
}

function pageUrl(href) {
  var s = String(href || "");
  if (s.indexOf("http") === 0) return s;
  return MAIN_URL + s;
}

/* strict title match (whole words, +-1 year tolerance) - current parity */
function isStrictMatch(wantTitle, wantYear, gotTitle, gotYear) {
  if (!wantTitle || !gotTitle) return false;
  var a = String(wantTitle).toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
  var b = String(gotTitle).toLowerCase().replace(/download\s*/g, "").replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
  if (b !== a && b.indexOf(a + " ") !== 0 && b.indexOf(" " + a + " ") === -1 &&
    b.indexOf(" " + a) !== b.length - a.length - 1) return false;
  if (wantYear && gotYear) {
    var y1 = parseInt(wantYear, 10), y2 = parseInt(gotYear, 10);
    if (!isNaN(y1) && !isNaN(y2) && Math.abs(y1 - y2) > 1) return false;
  }
  return true;
}

/* slice the page html down to the wanted season block (current parity) */
function extractSeasonHtml(html, season) {
  if (!html || season == null) return html;
  var marks = [], m;
  var re = "(<h[1-6][^>]*>|<strong[^>]*>|<span[^>]*>)[\\s\\S]{0,100}?(?:Season|Saison|Staffel)\\s*0*(\\d+)\\b(?!\\s*[-\u2013+&])";
  var r1 = new RegExp(re, "gi");
  while ((m = r1.exec(html)) !== null) marks.push({ index: m.index, season: parseInt(m[2], 10) });
  var firstIdx = -1, lastOther = -1;
  for (var i = 0; i < marks.length; i++) {
    if (marks[i].season === season) { if (firstIdx === -1) firstIdx = i; }
    else lastOther = i;
  }
  if (firstIdx === -1) {
    /* fall back to "Season 2-4" range headings */
    var r2 = new RegExp("(<h[1-6][^>]*>|<strong[^>]*>).*?(?:Season|Saison|Staffel)\\s*0*(\\d+)\\s*[-\u2013]\\s*0*(\\d+)", "gi");
    while ((m = r2.exec(html)) !== null) {
      if (season >= parseInt(m[2], 10) && season <= parseInt(m[3], 10)) return html.slice(m.index);
    }
    return null;
  }
  var start = marks[firstIdx].index;
  if (lastOther > firstIdx) {
    for (var j = 0; j < marks.length; j++) {
      if (marks[j].season === season && j > lastOther) { start = marks[j].index; break; }
    }
  }
  var end = html.length;
  for (var k = 0; k < marks.length; k++) {
    if (marks[k].index > start && marks[k].season !== season) { end = marks[k].index; break; }
  }
  return html.slice(start, end);
}

function extractSiteTitle(html) {
  var m = String(html || "").match(/<title>(.*?)<\/title>/i);
  if (!m) return "";
  var t = m[1];
  var dm = t.match(/Download\s+(.+?)\s+(?:In HD Free|Free Download)/i);
  if (dm) return dm[1].trim();
  var s = t.replace(/^(?:Download\s+)?/, "")
    .replace(/\s+(?:\d{3,4}p\b|4K\b|WEB-DL\b|BluRay\b|HDTV\b|x26[45]\b|HEVC\b|SDR\b|HDR\b|DD\d|DDP\d|Hindi|English|Dual\s*Audio|ESubs?)\b.*$/i, "")
    .replace(/\s*[-\u2013|]\s*\w*\s*$/i, "")
    .replace(/&#8211;/g, "\u2013");
  return s || t;
}

/* page -> mdrive.lol/archive links with [size] labels; 480p + tv zips out */
function parsePage(pageUrlArg, season, html) {
  var fetch = html
    ? Promise.resolve(html)
    : fetchText(pageUrlArg, null, 12000);
  return fetch.then(function (src) {
    if (!src) return [];
    var slice = season != null ? extractSeasonHtml(src, season) : src;
    if (!slice) return [];
    var out = [], m;
    var re = /href="(https?:\/\/mdrive\.lol\/archive\/(\d+)[^"]*)"[^>]*>([\s\S]*?)<\/a>/gi;
    while ((m = re.exec(slice)) !== null) {
      var label = m[3].replace(/<[^>]+>/g, "").trim();
      if (season != null && /zip/i.test(label)) continue;
      var q = parseQuality(label);
      if (q === "480p") continue;
      var sm = label.match(/\[([\d.]+)\s*(MB|GB|TB)\]/i);
      out.push({ id: m[2], url: m[1], label: label, q: q, size: sm ? sm[0] : "" });
    }
    return out;
  }, function () { return []; });
}

/* archive page -> hubcloud.<tld>/drive hosts; for tv the 300 chars before
   each host must carry the wanted episode number (current parity) */
function parseArchive(archiveUrl, episode) {
  return fetchText(archiveUrl, null, 12000).then(function (html) {
    if (!html) return [];
    var out = [], m;
    var re = /https?:\/\/hubcloud\.[a-z]+\/drive\/([a-z0-9_]+)/gi;
    while ((m = re.exec(html)) !== null) {
      if (episode != null) {
        var window = html.slice(Math.max(0, m.index - 300), m.index);
        var em, last = -1, ere = /(?:EP|Episode|E)\D*0*(\d+)/gi;
        while ((em = ere.exec(window)) !== null) last = parseInt(em[1], 10);
        if (last === -1 || last !== episode) continue;
      }
      out.push({ url: m[0], id: m[1] });
    }
    return out;
  }, function () { return []; });
}

function decodeB64Field(v) {
  try {
    var s = atob(String(v || ""));
    return s || null;
  } catch (e) { return null; }
}

/* hubcloud host -> 1-2 hops -> direct FSL/FSLv2 urls (current parity + the
   Eclipsia "Download File" anchor scan as an extra pass) */
function resolveHubcloud(url, quality, size) {
  return fetchText(url, { "Cookie": "xla=s4t", "Referer": ARCHIVE_DOMAIN + "/" }, 12000)
    .then(function (html) {
      if (!html) return [];
      var next = null, m;
      m = html.match(/var\s+url\s*=\s*'([^']+)'/);
      if (m) next = m[1];
      if (!next) {
        m = html.match(/<a\s+id="download"\s+(?:x-href|href)="([^"]+)"/);
        if (m) {
          next = m[1];
          if (next.indexOf("http") !== 0) next = decodeB64Field(next) || next;
        }
      }
      if (!next) return [];
      return fetchText(next, { "Cookie": "xla=s4t", "Referer": url }, 15000).then(function (finalHtml) {
        if (!finalHtml) return [];
        var rows = [];
        var fm, fre = /href="(https?:\/\/fsl\.gigabytes\.icu[^"]+)"/gi;
        while ((fm = fre.exec(finalHtml)) !== null) {
          rows.push({ type: "FSLv2", url: fm[1] });
        }
        var rre = /href="(https?:\/\/(?:pub-[a-z0-9]+\.r2\.dev|[a-z0-9.]+\.buzz)[^"]+)"/gi;
        while ((fm = rre.exec(finalHtml)) !== null) {
          rows.push({ type: "FSL", url: fm[1] + "1" + minutes() });
        }
        if (rows.length === 0) {
          var tm = finalHtml.match(/https?:\/\/[^\s"'<>]+\?token=\d+/);
          if (tm) rows.push({ type: "FSL", url: tm[0].replace(/["'].*$/, "").replace(/[<>].*$/, "") + "1" + minutes() });
        }
        if (rows.length === 0) {
          /* Eclipsia pass: "Download File" / server-label buttons */
          var are = /<a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi, am;
          while ((am = are.exec(finalHtml)) !== null) {
            var text = am[2].replace(/<[^>]*>/g, " ").toLowerCase();
            var href = am[1];
            if (!/https?:\/\//i.test(href)) continue;
            var label = null;
            if (/download\s*file|r2\.dev/i.test(text) || /r2\.dev/i.test(href)) label = "Direct R2";
            if (!label) {
              for (var i = 0; i < HUBCLOUD_SERVER_LABELS.length; i++) {
                var pair = HUBCLOUD_SERVER_LABELS[i];
                if (href.indexOf(pair[0]) !== -1 || text.indexOf(pair[0]) !== -1) { label = pair[1]; break; }
              }
            }
            if (label) rows.push({ type: label, url: href });
          }
        }
        return rows.map(function (r) {
          return { type: r.type, url: r.url, quality: quality, size: size || "" };
        });
      }, function () { return []; });
    }, function () { return []; });
}

function dedupeBy_url(rows) {
  var seen = {}, out = [];
  (rows || []).forEach(function (r) {
    if (!r || !r.url || seen[r.url]) return;
    seen[r.url] = 1;
    out.push(r);
  });
  return out;
}

function buildStreamEntry(stream, displayTitle) {
  var sizeTxt = stream.size ? " " + stream.size : "";
  return {
    name: displayTitle + " - " + PROVIDER_NAME,
    title: "Auto",
    url: stream.url,
    quality: stream.quality,
    size: "(" + stream.type + ")" + sizeTxt,
    headers: { "Referer": ARCHIVE_DOMAIN + "/", "User-Agent": pickUa() },
    behaviorHints: {
      notWebReady: true,
      proxyHeaders: { request: { "Referer": ARCHIVE_DOMAIN + "/" } }
    }
  };
}

function parseSizeBytes(sizeStr) {
  var m = String(sizeStr || "").match(/([\d.]+)\s*(GB|MB|KB|TB)/i);
  if (!m) return 0;
  var val = parseFloat(m[1]), unit = m[2].toUpperCase();
  if (unit === "TB") return val * 1099511627776;
  if (unit === "GB") return val * 1073741824;
  if (unit === "MB") return val * 1048576;
  if (unit === "KB") return val * 1024;
  return 0;
}

/* current parity: dedupe, keep >=1080p, FSLv2 first, quality+size ranking */
function applyStreamLimits(streams) {
  var deduped = dedupeBy_url((streams || []).filter(function (s) {
    return s.url && (s.quality === "2160p" || s.quality === "1440p" || s.quality === "1080p");
  }));
  var order = { "2160p": 4, "1440p": 3.5, "1080p": 3, "720p": 2, "HD": 1 };
  var fslv2First = function (s) { return s.size && s.size.indexOf("(FSLv2)") !== -1 ? 1 : 0; };
  deduped.sort(function (a, b) {
    var d = fslv2First(b) - fslv2First(a);
    if (d !== 0) return d;
    return (order[b.quality] || 0) - (order[a.quality] || 0);
  });
  var above1080 = deduped.filter(function (s) { return s.quality !== "1080p"; }).slice(0, 3);
  var at1080 = deduped.filter(function (s) { return s.quality === "1080p"; }).slice(0, 2);
  return above1080.concat(at1080);
}

function getStreams(tmdbId, mediaType, season, episode) {
  try {
    if (mediaType === "tv" && season == null) return Promise.resolve([]);
    var isTv = mediaType === "tv" || mediaType === "series";
    var seasonNum = isTv && season != null ? Number(season) : null;
    var episodeNum = isTv && episode != null ? Number(episode) : null;

    return getMedia(tmdbId, isTv ? "tv" : "movie").then(function (meta) {
      if (!meta || !meta.title) return [];
      return hostFollow().then(function () {
        var find = function (query, wantImdb) {
          return searchSite(query).then(function (hits) {
            var match = null;
            for (var i = 0; i < hits.length; i++) {
              if (wantImdb && hits[i].imdb !== wantImdb) continue;
              if (!wantImdb && !isStrictMatch(meta.title, isTv ? null : meta.year, hits[i].title, hits[i].year)) continue;
              match = hits[i];
              break;
            }
            return match;
          });
        };
        /* tv: the hit must actually contain the wanted season block */
        var pick = function (match) {
          if (!match) return Promise.resolve(null);
          return fetchText(pageUrl(match.href), null, 12000).then(function (html) {
            if (!html) return null;
            if (isTv && seasonNum != null && extractSeasonHtml(html, seasonNum) === null) return null;
            return { hit: match, html: html };
          }, function () { return null; });
        };
        var probeImdb = meta.imdb && meta.imdb.indexOf("tt") === 0
          ? find(meta.imdb, meta.imdb).then(pick)
          : Promise.resolve(null);
        return probeImdb.then(function (viaImdb) {
          if (viaImdb) return viaImdb;
          return find(meta.title, null).then(pick);
        }).then(function (found) {
          if (!found) return [];
          var siteTitle = extractSiteTitle(found.html) || meta.title;
          var displayTitle = isTv && seasonNum != null
            ? siteTitle + " [S" + pad2(seasonNum) + "E" + pad2(episodeNum) + "]"
            : siteTitle;
          return parsePage(pageUrl(found.hit.href), seasonNum, found.html).then(function (archives) {
            archives = archives.filter(function (a) { return a.q !== "480p"; }).slice(0, MAX_ARCHIVES);
            if (!archives.length) return [];
            var hosts = [];
            var chain = Promise.resolve();
            archives.forEach(function (a) {
              chain = chain.then(function () {
                if (hosts.length >= MAX_HOSTS) return null;
                return parseArchive(a.url, episodeNum).then(function (found2) {
                  for (var i = 0; i < found2.length && hosts.length < MAX_HOSTS; i++) {
                    hosts.push({ url: found2[i].url, q: a.q, size: a.size });
                  }
                  return null;
                });
              });
            });
            return chain.then(function () {
              var rows = [];
              var chain2 = Promise.resolve();
              hosts.forEach(function (h) {
                chain2 = chain2.then(function () {
                  if (rows.length >= MAX_STREAMS) return null;
                  return resolveHubcloud(h.url, h.q, h.size).then(function (streams) {
                    for (var i = 0; i < streams.length && rows.length < MAX_STREAMS; i++) {
                      rows.push(buildStreamEntry(streams[i], displayTitle));
                    }
                    return null;
                  });
                });
              });
              return chain2.then(function () {
                return applyStreamLimits(rows);
              });
            });
          });
        });
      });
    }).catch(function () { return []; });
  } catch (e) { return Promise.resolve([]); }
}

module.exports = { getStreams: getStreams };

/* ===== nvio post-filter v1.0 (auto-injected) ============================
   Rules (per user request 2026-09):
   1. Language gate: only English / Tagalog (Filipino) audio lanes are kept.
      Streams explicitly tagged with another audio language (hindi, tamil,
      spanish, arabic, korean, ...) are dropped unless an allowed language
      is also present (dual/multi audio) or no language is tagged at all.
      Subtitle-only tokens (ESub, HindiSub, ...) are ignored by the gate.
   2. Quality gate: unknown/"Auto" resolutions are probed from the HLS
      master playlist; everything below 720p, CAM/telesync, and still-
      unknown rows are dropped. Survivors are labeled 720p/1080p/1440p/4K.
   3. Dedupe: exact URL, then normalized URL (query stripped, torrent
      info-hash), then identical name+quality rows. A short-TTL global
      registry also removes the same URL reported by two different
      providers (cross-provider duplicates).
   Opt-out: set SCRAPER_SETTINGS.postFilter = false.
======================================================================== */
(function () {
  var PROVIDER = "moviesdrive";
  var G = typeof globalThis !== "undefined" ? globalThis : typeof global !== "undefined" ? global : this;
  function settings() {
    try { return (G && G.SCRAPER_SETTINGS) || {}; } catch (e) { return {}; }
  }
  function hasTimers() { return typeof setTimeout === "function" && typeof clearTimeout === "function"; }

  /* ---------- quality ---------- */
  function normQ(q) {
    var s = String(q == null ? "" : q).toLowerCase();
    if (!s) return "";
    if (/8k/.test(s)) return "4K";
    if (/2160|4k|uhd/.test(s)) return "4K";
    if (/1440/.test(s)) return "1440p";
    if (/1080|fhd/.test(s)) return "1080p";
    if (/720/.test(s)) return "720p";
    if (/480|360|240|\bsd\b/.test(s)) return "CAM";
    if (/cam|telesync|telecine|\bts\b|\btc\b|screener|dvdscr/.test(s)) return "CAM";
    return "";
  }
  function qFromText(text) {
    var s = String(text || "");
    var m = s.match(/(\d{3,4})\s*p/i);
    if (m) {
      var n = parseInt(m[1], 10);
      if (n >= 2100) return "4K";
      if (n >= 1300) return "1440p";
      if (n >= 1000) return "1080p";
      if (n >= 640) return "720p";
      return "CAM";
    }
    if (/\b8k\b/i.test(s) || /2160|4k|uhd/i.test(s)) return "4K";
    if (/1440p/i.test(s)) return "1440p";
    if (/cam|telesync|telecine|\bts\b|\btc\b|screener|dvdscr/i.test(s)) return "CAM";
    if (/480p|360p|240p|\bsd\b|\bdvdrip\b/i.test(s)) return "CAM";
    if (/\bhd\b/i.test(s)) return "720p";
    return "";
  }
  var qualCache = G.__NV_QUAL_CACHE__ || (G.__NV_QUAL_CACHE__ = {});
  function probeM3u8(url, headers) {
    var now = Date.now();
    var c = qualCache[url];
    if (c && now - c.t < (c.q ? 15 * 60 * 1000 : 3 * 60 * 1000)) {
      return Promise.resolve(c.q);
    }
    var opts = { headers: Object.assign({}, headers || {}) };
    var p = __nvFetch(url, opts).then(function (r) {
      return r.ok ? r.text() : "";
    }).then(function (t) {
      var q = "";
      if (t && t.indexOf("#EXTM3U") !== -1) {
        var best = 0, re = /RESOLUTION=(\d+)x(\d+)/gi, m;
        while ((m = re.exec(t)) !== null) {
          var h = parseInt(m[2], 10);
          if (h > best) best = h;
        }
        if (best >= 2100) q = "4K";
        else if (best >= 1300) q = "1440p";
        else if (best >= 1000) q = "1080p";
        else if (best >= 640) q = "720p";
        else if (best > 0) q = "CAM";
      }
      qualCache[url] = { t: now, q: q };
      return q;
    }).catch(function () { qualCache[url] = { t: now, q: "" }; return ""; });
    if (hasTimers()) {
      p = Promise.race([p, new Promise(function (res) {
        var timer = setTimeout(function () { res(""); }, 6000);
        if (typeof timer === "object" && typeof timer.unref === "function") timer.unref();
      })]);
    }
    return p;
  }

  /* ---------- language gate ---------- */
  var BLOCK_RE = new RegExp(
    "\\b(hindi|hin|tamil|telugu|malayalam|mallu|kannada|bengali|bangla|punjabi|marathi|bhojpuri|gujarati|" +
    "odia|assamese|nepali|urdu|sinhala|arabic|ara|farsi|persian|turkish|turkce|espanol|spanish|latino|" +
    "castellano|french|vostfr|german|deutsch|russian|korean|kor|japanese|jpn|chinese|mandarin|cantonese|" +
    "thai|vietnamese|indonesian|bahasa|portuguese|brasileiro|italian|polish|ukrainian|hebrew|" +
    "hungarian|romanian|dutch|flemish|greek|czech|swedish|danish|norwegian|finnish|org)\\b", "i");
  var ALLOW_RE = /\b(english|eng|tagalog|filipino)\b/i;
  var SUB_RE = /\b[a-z0-9]{0,12}subs?\b/gi;
  // NOTE: gate runs on the stream TITLE only (release names / labels).
  // Provider names (e.g. "MallumV") must not trigger the language gate.
  function langAllowed(titleText) {
    var t = String(titleText || "").replace(SUB_RE, " ");
    if (BLOCK_RE.test(t)) return ALLOW_RE.test(t);
    return true;
  }

  /* ---------- dedupe ---------- */
  function normUrl(u) {
    var s = String(u || "");
    if (/^magnet:/i.test(s)) {
      var m = s.match(/btih:([a-z0-9]+)/i);
      return "m:" + (m ? m[1].toLowerCase() : s.slice(0, 80));
    }
    return s.replace(/[#?].*$/, "").replace(/\/+$/, "");
  }
  var SEEN = G.__NV_SEEN_URLS__ || (G.__NV_SEEN_URLS__ = {});
  // SEEN[nu] = { exp: <ts>, owner: <provider> }
  // - same URL from a DIFFERENT provider within TTL -> dropped (cross-provider dup)
  // - same provider re-querying its own URL -> allowed (repeat opens must still
  //   return rows) and its claim is refreshed
  function claim(nu, now, owner) {
    if (!nu) return true;
    var e = SEEN[nu];
    if (e && e.exp > now && e.owner !== owner) return false;
    SEEN[nu] = { exp: now + 120000, owner: owner };
    return true;
  }

  /* ---------- main ---------- */
  function rank(q) {
    if (q === "4K") return 4;
    if (q === "1440p") return 3.5;
    if (q === "1080p") return 3;
    if (q === "720p") return 2;
    return 0;
  }
  function postProcess(list) {
    var now = Date.now();
    var kept = [];
    var probes = [];
    var rows = [];
    (list || []).forEach(function (s, i) {
      if (!s || !s.url) return;
      if (!langAllowed(s.title)) return;
      var text = (s.name || "") + " " + (s.title || "");
      var isMagnet = /^magnet:/i.test(String(s.url));
      var q = normQ(s.quality) || normQ(String(s.title || "").split("\n")[0]) || qFromText(text);
      var isHlsLike = /m3u8/i.test(String(s.url)) ||
        (!/\.(mp4|mkv|avi|mov|webm|ts|flv|m4v|mp3|aac)(\?|$)/i.test(String(s.url.split("?")[0])) && /^https?:/i.test(String(s.url)));
      if (!q && !isMagnet && isHlsLike) {
        rows.push({ s: s, i: i });
        probes.push(probeM3u8(String(s.url), s.headers));
      } else {
        rows.push({ s: s, i: i });
        probes.push(Promise.resolve(q));
      }
    });
    return Promise.all(probes).then(function (qs) {
      var ranked = [];
      rows.forEach(function (row, k) {
        var q = qs[k];
        if (!q) return; // unknown resolution -> removed
        if (q === "CAM") return; // cam / sd / sub-720 -> removed
        row.s.quality = q;
        ranked.push({ s: row.s, i: row.i, q: q });
      });
      // best first so dedupe keeps the strongest duplicate (stable)
      ranked.sort(function (a, b) {
        var r = rank(b.q) - rank(a.q);
        if (r !== 0) return r;
        return a.i - b.i;
      });
      var seenLocal = {}, out = [];
      ranked.forEach(function (row) {
        var s = row.s;
        var nu = normUrl(s.url);
        if (seenLocal[nu]) return;
        if (!claim(nu, now, PROVIDER)) return; // already reported by a different provider
        seenLocal[nu] = 1;
        out.push(s);
      });
      return out.slice(0, 40);
    }).catch(function () { return (list || []).slice(0, 40); });
  }

  var __orig = null;
  try { __orig = module.exports && module.exports.getStreams; } catch (e) { __orig = null; }
  if (typeof __orig === "function") {
    module.exports.getStreams = function () {
      var args = Array.prototype.slice.call(arguments), self = this;
      function finish(v) {
        if (settings().postFilter === false) return v;
        try { return postProcess(Array.isArray(v) ? v : []); }
        catch (e) { return Array.isArray(v) ? v : []; }
      }
      try {
        var r = __orig.apply(self, args);
        if (r && typeof r.then === "function") {
          if (typeof setTimeout === "function") {
            // nv best-settings 4.23.0: hard 8s cap on the whole provider run
            r = Promise.race([r, new Promise(function (res) {
              var dl = setTimeout(function () { res([]); }, 8000);
              if (dl && typeof dl.unref === "function") dl.unref();
            })]);
          }
          return r.then(function (v) { return finish(v); }, function () { return []; });
        }
        return finish(r);
      } catch (e) { return Promise.resolve([]); }
    };
  }
})();


/* ===== nv-plugins device waterfall merge v2.0.0 (pack 4.37.0, 2026-09-14) ======
   Device truth (NuvioMobile PluginRuntime.kt + quickjs-kt 1.0.5-nuvio AAR):
   no timers in the realm (every Promise.race cap was inert or threw
   ReferenceError), each fetch is one BLOCKING host call (lanes run
   sequentially regardless of Promise.all), app kills the call at 60s. The
   old 4.33.0 merge ran BOTH lanes on every call and its cap() called
   setTimeout DIRECTLY -> the whole provider rejected -> 0 rows.
   v2.0.0: sequential waterfall bounded by fetch count, fail-soft both lanes.
     __WINGS_FIRST = true  : WINGS lane first, native only when empty
   ========================================================================== */
(function () {
  'use strict';
  var __LABEL = 'MoviesDrive';
  var __WINGS_FIRST = true;
  var __ALT_NAME = '__nvWingsStreams';
  function __junk(u) { return /tungtungtungsahur\.cfd|\/api\?d=/i.test(String(u || '')); }
  var __orig = null;
  try { __orig = module.exports && module.exports.getStreams; } catch (e) { __orig = null; }
  if (typeof __orig !== 'function') return;
  function runAlt(args, self) {
    var f = null;
    try { f = (typeof globalThis !== 'undefined' && globalThis) ? globalThis[__ALT_NAME] : null; } catch (e) { f = null; }
    if (typeof f !== 'function') return Promise.resolve([]);
    try {
      var r = f({ tmdbId: args[0], mediaType: args[1], season: args[2], episode: args[3], label: __LABEL });
      return Promise.resolve(r).then(function (v) { return Array.isArray(v) ? v : []; }, function () { return []; });
    } catch (e) { return Promise.resolve([]); }
  }
  function runNative(args, self) {
    try {
      var r = __orig.apply(self, args);
      return Promise.resolve(r).then(function (v) { return Array.isArray(v) ? v : []; }, function () { return []; });
    } catch (e) { return Promise.resolve([]); }
  }
  module.exports.getStreams = function () {
    var args = Array.prototype.slice.call(arguments), self = this;
    function clean(v) {
      var seen = {}, out = [];
      (v || []).forEach(function (r) {
        if (!r || !r.url || __junk(r.url)) return;
        var k = String(r.url);
        if (seen[k]) return;
        seen[k] = 1; out.push(r);
      });
      return out;
    }
    function laneA() { return __WINGS_FIRST ? runAlt(args, self) : runNative(args, self); }
    function laneB() { return __WINGS_FIRST ? runNative(args, self) : runAlt(args, self); }
    return Promise.resolve().then(laneA).then(function (rows) {
      rows = clean(rows);
      if (rows.length) return rows;
      return Promise.resolve().then(laneB).then(function (rows2) { return clean(rows2); });
    });
  };
})();
