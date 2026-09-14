/* ===== nv-plugins cinefreak.js v6.0.0 (pack 4.40.0) =========================
   Clean readable port of Eclipsia "Novus." (codeberg eclipsia/nuvio-plugin
   readable sources), device-safe for the bare Nuvio QuickJS realm.
   Flow: TMDB lookup -> {BASE}/search-api.php?q=<title>[ Season N]&pg=1
         -> {BASE}/<slug>/ page (movie: dlbtn-container blocks, tv: ep-card
         blocks; both carry /generate.php?id=<b64> links)
         -> atob(id), strip "newgo32" -> cinecloud /f/|/x/ page
         -> direct FSL/R2 urls (id="fsl" | r2.dev | workers.dev | .buzz |
         cloudflarestorage | .mkv/.mp4 | pub- | fast-cloud/resumable anchors).
   Endpoint diffs vs the 4.39 obfuscated build (live-probed 2026-09):
   - BASE_URL "https://cinefreak.nl" KEPT from the current pack file
     (device-verified domain; Eclipsia's cinefreak.net answers the same API).
   - The 4.39 native search (/wp-json/wp/v2/search) is DEAD upstream (404 on
     both domains) -> replaced by Eclipsia's live search-api.php flow.
   - CINECLOUD_BASE new5.cinecloud.site kept (matches decoded targets today).
   - TMDB key 439c478a771f35c05022f9feabcca01c kept from the current pack.
   - Row naming kept from the current pack file ("CineFreak | <q> | audio" +
     4-line emoji title block); 720p links now resolve too (Eclipsia gated
     at 1080p; pack post-filter floor is 720p).
   Device notes: no timers (every race guarded), no require/cheerio
   (cheerio-lite loader per pack spec; extraction is regex house style - all
   Eclipsia selectors are class/attr/.next() forms outside the lite subset),
   no URL constructor, atob via preamble, sequential probes capped at 6 links
   with early-exit at 6 rows, response.ok + try/catch fail-soft everywhere.
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

/* ===== cinefreak native lane (clean port of Eclipsia "Novus." + verified
   4.39 extraction regexes; row naming kept from the current pack file) ==== */

var PROVIDER_NAME = "CineFreak";
var BASE_URL = "https://cinefreak.nl";
var CINECLOUD_BASE = "https://new5.cinecloud.site";
var TMDB_API = "https://api.themoviedb.org/3";
var TMDB_API_KEY = "439c478a771f35c05022f9feabcca01c";
var MAX_LINKS = 6;    /* device cap: never resolve more links per call */
var MAX_STREAMS = 6;  /* device cap: early-exit once this many rows are in */

var MOBILE_UAS = [
  "Mozilla/5.0 (Linux; Android 14; Pixel 8 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36",
  "Mozilla/5.0 (Linux; Android 13; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36",
  "Mozilla/5.0 (Linux; Android 12; Pixel 6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Mobile Safari/537.36",
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"
];
var SITE_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36",
  "Cookie": "xla=s4t"
};

function pickUa() {
  return MOBILE_UAS[Math.floor(Math.random() * MOBILE_UAS.length)];
}

/* every network call is raced against a guarded deadline; on the device
   realm (no timers) the fail-soft catch + __nvFetch still apply */
function fetchText(url, headers, timeoutMs) {
  var p = __nvFetch(url, { headers: headers || SITE_HEADERS })
    .then(function (r) { return (r && r.ok) ? r.text() : null; });
  var raced = p;
  if (typeof setTimeout === "function") {
    raced = Promise.race([p, new Promise(function (res) {
      var t = setTimeout(function () { res(null); }, timeoutMs || 6000);
      if (t && typeof t.unref === "function") t.unref();
    })]);
  }
  return raced.then(function (v) { return v || null; }, function () { return null; });
}

function fetchJson(url, headers, timeoutMs) {
  return fetchText(url, headers, timeoutMs).then(function (t) {
    if (!t) return null;
    try { return JSON.parse(t); } catch (e) { return null; }
  });
}

function decodeEntities(s) {
  if (!s) return "";
  return String(s)
    .replace(/&(nbsp|amp|quot|lt|gt|#038);/g, function (m, n) {
      return ({ nbsp: " ", amp: "&", quot: "\"", lt: "<", gt: ">", "#038": "&" })[n];
    })
    .replace(/&#(\d+);/g, function (m, d) { return String.fromCharCode(parseInt(d, 10)); });
}

function pad2(n) {
  n = parseInt(n, 10);
  return (n >= 0 && n < 10) ? "0" + n : String(n);
}

/* quality label: current-pack parity (2160p/1080p/720p/480p, else HD) */
function parseQuality(raw) {
  var s = String(raw || "").toLowerCase();
  if (s.indexOf("2160") !== -1 || s.indexOf("4k") !== -1 || s.indexOf("uhd") !== -1) return "2160p";
  if (s.indexOf("1080") !== -1) return "1080p";
  if (s.indexOf("720") !== -1) return "720p";
  if (s.indexOf("480") !== -1) return "480p";
  return "HD";
}

/* generate.php?id= payloads are base64 (often url-safe) ending in "newgo32" */
function decodeGenerateId(id) {
  try {
    var bin = atob(String(id || "").replace(/-/g, "+").replace(/_/g, "/").replace(/\s/g, ""));
    var cut = bin.indexOf("newgo32");
    if (cut > 0) bin = bin.slice(0, cut);
    return bin.replace(/newgo32\s*$/i, "").trim();
  } catch (e) { return ""; }
}

function tmdbLookup(tmdbId, mediaType, ua) {
  var type = mediaType === "tv" ? "tv" : "movie";
  return fetchJson(TMDB_API + "/" + type + "/" + tmdbId + "?api_key=" + TMDB_API_KEY,
    { "User-Agent": ua, "Accept": "application/json" }, 8000).then(function (data) {
      if (!data) return null;
      var title = (mediaType === "tv" ? data.name : data.title) || "";
      var date = mediaType === "tv" ? data.first_air_date : data.release_date;
      return { title: title, year: String(date || "").slice(0, 4), isTv: mediaType === "tv" };
    });
}

function searchCinefreak(query) {
  if (!query) return Promise.resolve([]);
  return fetchJson(BASE_URL + "/search-api.php?q=" + encodeURIComponent(query) + "&pg=1",
    { "User-Agent": SITE_HEADERS["User-Agent"], "Cookie": SITE_HEADERS["Cookie"], "Accept": "application/json" }, 8000)
    .then(function (data) {
      var results = (data && data.results) || [];
      var out = [];
      for (var i = 0; i < results.length && out.length < 10; i++) {
        var r = results[i];
        if (r && r.t && r.l) out.push({ title: String(r.t).replace(/Download\s*/gi, "").trim(), slug: r.l });
      }
      return out;
    }, function () { return []; });
}

function titleStartsWith(hay, needle) {
  hay = String(hay || "").toLowerCase().trim();
  needle = String(needle || "").toLowerCase().trim();
  return hay.indexOf(needle) === 0;
}

function wordMatchScore(needle, hay) {
  var words = String(needle || "").toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter(function (w) {
    return w.length >= 3;
  });
  if (!words.length) return 0;
  var hits = 0;
  for (var i = 0; i < words.length; i++) {
    if (new RegExp("\\b" + words[i].replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\b", "i").test(hay)) hits++;
  }
  return hits / words.length;
}

/* best-scoring result; an explicit "Season N" in the title wins for tv
   (picks the Silo 2023 "Season 1 & 2" page over the Season 3 upload) */
function selectResult(results, meta, seasonNum) {
  var norm = String(meta.title || "").toLowerCase().trim();
  var best = null, bestScore = -1;
  for (var i = 0; i < results.length; i++) {
    var r = results[i];
    var t = String(r.title || ""), lt = t.toLowerCase();
    var score = 0;
    if (titleStartsWith(lt, norm)) score += 10;
    score += wordMatchScore(norm, t);
    if (meta.year && lt.indexOf(meta.year) !== -1) score += 3;
    if (seasonNum != null) {
      var sre = new RegExp("(?:season|s)\\s*0*" + seasonNum + "\\b", "i");
      if (sre.test(t)) score += 10;
    }
    if (score > bestScore) { bestScore = score; best = r; }
  }
  return bestScore >= 3 ? best : null;
}

function pageUrlFromSlug(slug) {
  var s = String(slug || "");
  if (s.indexOf("http") === 0) return s;
  return BASE_URL + "/" + String(s).replace(/^\//, "") + "/";
}

/* movie page: dlbtn-container blocks, each holding /generate.php?id=<b64>;
   quality label taken from the preceding block (span label / h4 heading) */
function extractMovieLinks(html) {
  var out = [], seen = {};
  var blocks = String(html || "").split("dlbtn-container");
  for (var i = 1; i < blocks.length; i++) {
    var idm = blocks[i].match(/href="(?:https?:\/\/[^"]*?)?\/generate\.php\?id=([a-zA-Z0-9+\/=]+)"/);
    if (!idm) continue;
    var decoded = decodeGenerateId(idm[1]);
    if (!decoded || (decoded.indexOf("/f/") === -1 && decoded.indexOf("/x/") === -1)) continue;
    if (seen[decoded]) continue;
    seen[decoded] = 1;

    var prev = blocks[i - 1], label = "";
    var lm = prev.match(/<\/span>\s*([^<]*?(?:2160|1080|720|480|4K)[^<]*?\[[^\]]+\])/i) ||
      prev.match(/<\/span>\s*([^<]*?(?:2160|1080|720|480|4K)[^<]*?)\s*\[/i);
    if (lm) label = lm[1].trim();
    if (!label || label.indexOf("[") === -1) {
      var hm = prev.match(/<h4[^>]*>([\s\S]*?)<\/h4>/i);
      if (hm) label = (label + " " + hm[1].replace(/<[^>]*>/g, "")).trim();
    }
    if (!label) {
      var qm = prev.match(/\b(?:4K\s*2160p|UHD|2160p|1080p|720p|480p)\b/i) || prev.match(/\b(?:SD|HD)\b/i);
      if (qm) label = qm[0];
    }
    if (!label) label = decoded;
    out.push({ decoded: decoded, label: label, quality: parseQuality(label) });
  }
  return out;
}

/* tv page: ep-card blocks; the card whose badge matches the episode holds
   its own /generate.php?id= links (indexOf scan also catches unwrapped ids) */
function extractEpisodeLinks(html, episode) {
  if (!html) return [];
  var cards = String(html).split('<div class="ep-card"');
  var EP_PATTERNS = [
    /episode-badge[^>]*>\s*(?:Episode\s*)?(\d+)/i,
    /ep-num[^>]*>\s*(\d+)\s*</i,
    /data-episode="(\d+)"/i,
    /\bEpisode\s+(\d+)\b/i
  ];
  for (var i = 1; i < cards.length; i++) {
    for (var k = 0; k < EP_PATTERNS.length; k++) {
      var m = cards[i].match(EP_PATTERNS[k]);
      if (!m || parseInt(m[1], 10) !== episode) continue;
      var card = cards[i], out = [], seen = {};
      var pos = 0, NEEDLE = "/generate.php?id=";
      while (out.length < 12) {
        var at = card.indexOf(NEEDLE, pos);
        if (at === -1) break;
        var quote = card.indexOf('"', at);
        var aOpen = card.lastIndexOf("<a ", at);
        var aClose = card.indexOf("</a>", at);
        var idm = card.slice(at, quote === -1 ? at + 200 : quote).match(/id=([a-zA-Z0-9+\/=]+)/);
        pos = aClose !== -1 ? aClose + 4 : at + NEEDLE.length;
        if (!idm) continue;
        var decoded = decodeGenerateId(idm[1]);
        if (!decoded || (decoded.indexOf("/f/") === -1 && decoded.indexOf("/x/") === -1)) continue;
        if (seen[decoded]) continue;
        seen[decoded] = 1;
        var label = "";
        if (aOpen !== -1 && aClose !== -1 && aClose > at) {
          var gt = card.indexOf(">", at);
          if (gt !== -1 && gt < aClose) label = card.slice(gt + 1, aClose).replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
        }
        if (!label) {
          var qm = card.match(/\b(?:4K\s*2160p|UHD|2160p|1080p|720p|480p)\b/i);
          label = qm ? qm[0] : "";
        }
        out.push({ decoded: decoded, label: label, quality: parseQuality(label || decoded) });
      }
      return out;
    }
  }
  return [];
}

function filterQualities(links) {
  var ORDER = { "2160p": 0, "1080p": 1, "720p": 2, "HD": 3 };
  var kept = (links || []).filter(function (l) {
    return l.quality !== "480p" && l.quality !== "SD";
  });
  kept.sort(function (a, b) {
    var ra = ORDER[a.quality] !== undefined ? ORDER[a.quality] : 99;
    var rb = ORDER[b.quality] !== undefined ? ORDER[b.quality] : 99;
    return ra - rb;
  });
  return kept.slice(0, MAX_LINKS);
}

function extractHashSuffix(decoded) {
  var f = decoded.indexOf("/f/"), x = decoded.indexOf("/x/");
  var at = f >= 0 ? f + 3 : (x >= 0 ? x + 3 : -1);
  return at < 0 ? "" : decoded.slice(at);
}

function absoluteUrl(href, base) {
  var h = String(href || "").trim().replace(/&amp;/g, "&");
  if (!h) return "";
  if (h.indexOf("http") === 0) return h;
  if (h.indexOf("/") === 0) return base + h;
  return base + "/" + h;
}

/* cinecloud page -> direct download urls. Pass 1 = verified 4.39 regexes,
   pass 2 = Eclipsia anchor-text scan, pass 3 = one resumable-page hop. */
function resolveCineCloud(decoded, ua) {
  var hash = extractHashSuffix(decoded);
  var pageUrl = (decoded.indexOf("cinecloud") !== -1) ? decoded : CINECLOUD_BASE + "/f/" + hash;
  var origin = pageUrl;
  var om = pageUrl.match(/^https?:\/\/[^\/]+/);
  if (om) origin = om[0];
  return fetchText(pageUrl, { "User-Agent": ua, "Cookie": "xla=s4t", "Referer": BASE_URL + "/" }, 8000)
    .then(function (html) {
      if (!html) return [];
      var rows = [], seen = {};
      function push(url) {
        var u = String(url || "").replace(/&amp;/g, "&").trim();
        if (!u || u.indexOf("http") !== 0 || u.indexOf(".zip") !== -1 || seen[u]) return;
        seen[u] = 1;
        rows.push(u);
      }

      /* pass 1: direct href patterns (id="fsl", storage hosts, media files) */
      var re = /href="([^"]+)"[^>]*id="fsl"|href="([^"]+(?:\.workers\.dev|\.r2\.dev|\.buzz|\.cloudflarestorage\.com)\/[^"]+)"|href="(https?:\/\/[^"]+\.(?:mkv|mp4)[^"]*)"|href="(https:\/\/pub-[^"]+)"/ig;
      var m;
      while ((m = re.exec(html)) !== null) {
        var u = m[1] || m[2] || m[3] || m[4];
        if (u) push(u);
      }
      if (!rows.length) {
        /* 4.39 fallback: substring scan after a pub- anchor */
        var at = html.indexOf('href="https://pub-');
        if (at !== -1) {
          var start = at + 6, end = html.indexOf('"', start);
          if (end !== -1) push(html.slice(start, end));
        }
      }

      /* pass 2 + 3: Eclipsia anchor scan (fast cloud / [fsl] / resumable) */
      var anchors = [], resumeJobs = [];
      var are = /<a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi, am;
      while ((am = are.exec(html)) !== null) {
        var text = am[2].replace(/<[^>]*>/g, " ");
        if (/fast\s+cloud|\[fsl\]/i.test(text)) anchors.push(am[1]);
        else if (/cloud\s*\[resumable\]/i.test(text) && resumeJobs.length < 1) resumeJobs.push(am[1]);
      }
      for (var i = 0; i < anchors.length && rows.length < MAX_STREAMS; i++) push(absoluteUrl(anchors[i], origin));

      var tail = resumeJobs.length
        ? fetchText(absoluteUrl(resumeJobs[0], origin), { "User-Agent": ua, "Cookie": "xla=s4t", "Referer": pageUrl }, 8000)
          .then(function (sub) {
            if (!sub) return [];
            var links = [], sm;
            var sre = /<a[^>]+class="[^"]*download-now[^"]*"[^>]*href="([^"]+)"/gi;
            while ((sm = sre.exec(sub)) !== null) links.push(sm[1]);
            var sre2 = /<a[^>]+href="([^"]+)"[^>]*class="[^"]*download-now[^"]*"/gi;
            while ((sm = sre2.exec(sub)) !== null) links.push(sm[1]);
            return links;
          }, function () { return []; })
        : Promise.resolve([]);

      return tail.then(function (links) {
        for (var j = 0; j < links.length && rows.length < MAX_STREAMS; j++) push(links[j]);
        return rows.map(function (u) {
          return { url: u, headers: { "Referer": CINECLOUD_BASE + "/", "User-Agent": ua } };
        });
      });
    }, function () { return []; });
}

function makeStream(matchTitle, label, url, quality, ua, sepTag) {
  var t = decodeEntities(matchTitle || "").replace(/[\n\t]+/g, " ").trim();
  var yearM = t.match(/\b(19|20)\d{2}\b/);
  var year = yearM ? yearM[0] : "2026";
  var cleanTitle = t.split(" - ")[0].trim()
    .replace(/\(\d{4}\).*$/gi, "")
    .replace(/\d{3,4}p.*$/gi, "")
    .trim();
  var lb = String(label || "").toLowerCase();
  var sizeM = String(label || "").match(/\[\s*(\d+(?:\.\d+)?\s*[MG]B)\s*\]/i) || String(label || "").match(/(\d+(?:\.\d+)?\s*[MG]B)/i);
  var sizeLabel = sizeM ? sizeM[1].toUpperCase().replace(/\s+/g, "") : "N/A";

  var is4k = quality === "2160p" || lb.indexOf("2160p") !== -1 || lb.indexOf("4k") !== -1;
  var codec = /\b(hevc|x265|h265)\b/i.test(lb) ? "HEVC" : "H.264";
  var hdr = /\b(dolby\s*vision|dovi|dv)\b/i.test(lb) ? "Dolby Vision"
    : /\bhdr10\b/i.test(lb) ? "HDR10"
      : /\bhdr\b/i.test(lb) ? "HDR"
        : (/\b(10bit|10-bit)\b/i.test(lb) ? "10Bit" : "");
  var source = /\b(bluray|blu-ray)\b/i.test(lb) ? "BluRay"
    : /\b(hdrip|webrip)\b/i.test(lb) ? "WEBRip" : "WEB-DL";
  var audio = is4k ? "DDP5.1 • 🔊 Atmos"
    : (sizeM && sizeM[1].toUpperCase().indexOf("GB") !== -1 && parseFloat(sizeM[1]) < 1.3) ? "Stereo"
      : (lb.indexOf("hq") !== -1) ? "DDP5.1 • 🔊 Atmos" : "DD5.1";
  var dual = /\b(dual|multi|dubbed|hindi)\b/i.test(lb);
  var audioKind = dual ? "Dual-Audio" : "Single Audio";
  var audioLangs = dual ? "English 🇺🇸 • Hindi 🇮🇳" : "English 🇺🇸";

  var line1 = sepTag
    ? "🎦 " + cleanTitle + " (" + year + ") - " + sepTag
    : "🎦 " + cleanTitle + " - (" + year + ")";
  var line2 = "💎 " + quality + " | 🗣️ " + audioLangs + " | 💾 " + sizeLabel;
  var line3 = "🎞️ " + (/\.mp4(\?|$)/i.test(String(url)) ? "MP4" : "MKV") +
    " | 🎧 " + audio +
    (hdr ? " | 🔆 " + hdr + " • ⚡ " + codec : " | ⚡ " + codec);
  var line4 = "🔗 FSL Server | ☁️ " + source;
  var fullTitle = line1 + "\n" + line2 + "\n" + line3 + "\n" + line4;

  var resWeight = is4k ? 9000000 : (quality === "1080p" ? 6000000 : 3000000);
  return {
    name: PROVIDER_NAME + " | " + quality + " | " + audioKind,
    title: fullTitle,
    size: fullTitle,
    url: url,
    quality: quality,
    headers: { "Referer": CINECLOUD_BASE + "/", "User-Agent": ua },
    behaviorHints: {
      notWebReady: true,
      proxyHeaders: { request: { "Referer": CINECLOUD_BASE + "/", "User-Agent": ua } }
    },
    _sortWeight: resWeight
  };
}

function getStreams(tmdbId, mediaType, season, episode) {
  try {
    if (mediaType === "tv" && (season == null || episode == null)) return Promise.resolve([]);
    var ua = pickUa();
    var isTv = mediaType === "tv" || mediaType === "series";
    var seasonNum = isTv ? (parseInt(season, 10) || 1) : null;
    var episodeNum = isTv ? (parseInt(episode, 10) || 1) : null;

    return tmdbLookup(tmdbId, isTv ? "tv" : "movie", ua).then(function (meta) {
      if (!meta || !meta.title) return [];
      var primary = isTv ? meta.title + " Season " + seasonNum : meta.title;
      return searchCinefreak(primary).then(function (results) {
        return selectResult(results, meta, seasonNum)
          ? results
          : searchCinefreak(meta.title + " " + meta.year);
      }).then(function (results) {
        var match = selectResult(results, meta, seasonNum);
        if (!match) return [];
        return fetchText(pageUrlFromSlug(match.slug)).then(function (html) {
          if (!html) return [];
          var links = filterQualities(isTv
            ? extractEpisodeLinks(html, episodeNum)
            : extractMovieLinks(html));
          if (!links.length) return [];
          var sepTag = isTv ? "S" + pad2(seasonNum) + "E" + pad2(episodeNum) : "";
          var rows = [];
          var chain = Promise.resolve();
          links.forEach(function (link) {
            chain = chain.then(function () {
              if (rows.length >= MAX_STREAMS) return null;
              return resolveCineCloud(link.decoded, ua).then(function (hits) {
                for (var i = 0; i < hits.length && rows.length < MAX_STREAMS; i++) {
                  rows.push(makeStream(match.title, link.label, hits[i].url, link.quality, ua, sepTag));
                }
                return null;
              });
            });
          });
          return chain.then(function () {
            rows.sort(function (a, b) { return (b._sortWeight || 0) - (a._sortWeight || 0); });
            rows.forEach(function (r) { delete r._sortWeight; });
            return rows;
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
  var PROVIDER = "cinefreak";
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
  var __LABEL = 'CineFreak';
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
