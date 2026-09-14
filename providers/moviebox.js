/* nv-plugins moviebox.js v1.3.0 (pack 4.33.0, 2026-09-13): streams fix - same 4.33.0 treatment: verified WINGS lane merged first, junk VidAPI relay rows dropped, native rows kept when real. */
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
          .then(function (r) { return r.ok ? r.json() : null; })
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
              var t = setTimeout(function () { if (!done) { done = true; resolve(results); } }, Math.max(6000, timeoutMs - 2500));
              if (t && typeof t.unref === 'function') t.unref();
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
/*
 * nv-plugins moviebox.js — FULLY DECODED port of the All-in-One-Nuvio provider (4.24.0 merge pass).
 * Decoded from the obfuscated AIO build: string tables resolved, decoder machinery stripped,
 * every network call capped by an 8s deadline, node-core requires fail-soft, nvio post-filter
 * attached (en/tl audio gate, >=720p quality gate, cross-provider dedupe). Endpoints/keys/headers
 * identical to the AIO original.
 */
/* nv-plugins best-settings pass 4.24.0: hard 8s deadline on every network call */
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
/* fail-soft require: node-core modules (net/http/assert/...) never crash the provider */
var __nvRequire = (function () {
  var _rq = null;
  try { _rq = (typeof require === "function") ? require : null; } catch (e) { _rq = null; }
  return function (name) {
    if (_rq) { try { return _rq(name); } catch (e) { } }
    return {};
  };
})();
/* QuickJS-safe global aliases: embedded polyfills (forge/uuid/whatwg) reference
   window/self/document unguarded - in Nuvio's QuickJS those would throw
   ReferenceError at module load and kill the provider. */
var window = (typeof window !== "undefined" && window) ? window
  : (typeof globalThis !== "undefined" ? globalThis : (typeof global !== "undefined" ? global : {}));
var self = (typeof self !== "undefined" && self) ? self : window;
var document = (typeof document !== "undefined" && document) ? document : { createElement: function () { return { style: {}, setAttribute: function () { }, getElementsByTagName: function () { return []; } }; }, getElementsByTagName: function () { return []; }, addEventListener: function () { } };
var navigator = (typeof navigator !== "undefined" && navigator) ? navigator : { userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36" };
var _0x1301=function(){return "";};'use strict';const _0x5df61e=_0x1301;/*decoder removed*//*rotation removed*/;var __defProp=Object['defineProperty'],__defProps=Object['defineProperties'],__getOwnPropDescs=Object['getOwnPropertyDescriptors'],__getOwnPropSymbols=Object['getOwnPropertySymbols'],__hasOwnProp=Object['prototype']['hasOwnProperty'],__propIsEnum=Object["prototype"]["propertyIsEnumerable"],__defNormalProp=(_0x40bf53,_0x6486c7,_0x5874a7)=>_0x6486c7 in _0x40bf53?__defProp(_0x40bf53,_0x6486c7,{'enumerable':!![],'configurable':!![],'writable':!![],'value':_0x5874a7}):_0x40bf53[_0x6486c7]=_0x5874a7,__spreadValues=(_0x4168ea,_0x2a9b98)=>{const _0x51bb8f=_0x5df61e;for(var _0x5882ca in _0x2a9b98||(_0x2a9b98={}))if(__hasOwnProp['call'](_0x2a9b98,_0x5882ca))__defNormalProp(_0x4168ea,_0x5882ca,_0x2a9b98[_0x5882ca]);if(__getOwnPropSymbols)for(var _0x5882ca of __getOwnPropSymbols(_0x2a9b98)){if(__propIsEnum["call"](_0x2a9b98,_0x5882ca))__defNormalProp(_0x4168ea,_0x5882ca,_0x2a9b98[_0x5882ca]);}return _0x4168ea;},__spreadProps=(_0x451df1,_0x2b5730)=>__defProps(_0x451df1,__getOwnPropDescs(_0x2b5730)),__async=(_0x14d30f,_0x6a36a5,_0x4cc304)=>{const _0x2d60b2={_0x1f2408:0xf2};return new Promise((_0x565c41,_0x2dfc0b)=>{const _0x2c160d={_0x5c1f27:0xe7},_0x293180=_0x1301;var _0x2aeac6=_0x300863=>{const _0x49c7d1=_0x1301;try{_0x34f38a(_0x4cc304["next"](_0x300863));}catch(_0x9546d7){_0x2dfc0b(_0x9546d7);}},_0x301a54=_0x5a164e=>{const _0x51b13f=_0x1301;try{_0x34f38a(_0x4cc304["throw"](_0x5a164e));}catch(_0x199ef4){_0x2dfc0b(_0x199ef4);}},_0x34f38a=_0x4ba69b=>_0x4ba69b['done']?_0x565c41(_0x4ba69b["value"]):Promise['resolve'](_0x4ba69b["value"])['then'](_0x2aeac6,_0x301a54);_0x34f38a((_0x4cc304=_0x4cc304["apply"](_0x14d30f,_0x6a36a5))["next"]());});};function onSettings(){const _0xd81328={_0x50e1b2:0xfe,_0xb098b:0xe5,_0x8a736d:0xe1};return __async(this,null,function*(){const _0x2e9c9c=_0x1301;return[{'type':"header",'label':"Audio Preferences"},{'type':"toggle",'key':'langEnglish','label':"Enable English 🇺🇸",'defaultValue':!![]},{'type':'toggle','key':"langHindi",'label':'Enable\x20Hindi\x20🇮🇳','defaultValue':!![]}];});}var PROVIDER_NAME="MovieBox",CINESCRAPE_BASE='https://pengu.uk/%7B%22source_moviebox%22%3A%22on%22%2C%22res_1080%22%3A%22on%22%2C%22disable_direct%22%3A%22on%22%2C%22auth_token%22%3A%22XwZg2rLkLlbjXBeDVCyxgfHXjxN1ijLMkUuToW8KaKc%22%7D',TMDB_API_KEY="439c478a771f35c05022f9feabcca01c";function getStreams(_0x5a32a7,_0x2fe227,_0x328cc2,_0x2733e2){const _0x11a400={_0x5d2410:0xe4,_0x277c11:0xfb,_0x19fe37:0xd6,_0x4a3bd8:0xde,_0x4dbb50:0xee,_0x56fb4e:0xff,_0x4eae8d:0xd1,_0x21c047:0xcf,_0x53d823:0xd4};return __async(this,null,function*(){const _0x39b341={_0x3e3e69:0xd8},_0xb642cf=_0x1301;var _0xd04b39;const _0x700f53=_0x2fe227==='tv'||_0x2fe227==="series",_0x59c3c7="https://api.themoviedb.org/3/"+(_0x700f53?'tv':'movie')+'/'+_0x5a32a7+"?api_key="+TMDB_API_KEY+"&append_to_response=external_ids";try{const _0x3699f4=globalThis['SCRAPER_SETTINGS']||{},_0x51ddfd=_0x3699f4['langEnglish']!==![],_0x2601af=_0x3699f4['langHindi']!==![],_0x11cd2f=yield __nvFetch(_0x59c3c7)['then'](_0x8d9829=>_0x8d9829['json']()),_0x30b102=((_0xd04b39=_0x11cd2f==null?void 0x0:_0x11cd2f['external_ids'])==null?void 0x0:_0xd04b39['imdb_id'])||(_0x11cd2f==null?void 0x0:_0x11cd2f['imdb_id']);if(!_0x30b102)return[];const _0x3a0392=_0x11cd2f["title"]||_0x11cd2f["name"]||'Movie/Show',_0x1469d4=_0x11cd2f['release_date']?_0x11cd2f["release_date"]['split']('-')[0x0]:_0x11cd2f['first_air_date']?_0x11cd2f["first_air_date"]["split"]('-')[0x0]:"2026",_0x492ce4=_0x700f53?CINESCRAPE_BASE+'/stream/series/'+_0x30b102+':'+(_0x328cc2||0x1)+':'+(_0x2733e2||0x1)+'.json':CINESCRAPE_BASE+'/stream/movie/'+_0x30b102+".json",_0xcdbdaf=yield __nvFetch(_0x492ce4)["then"](_0x547ac8=>_0x547ac8['json']());if(!(_0xcdbdaf==null?void 0x0:_0xcdbdaf['streams'])||_0xcdbdaf["streams"]["length"]===0x0)return[];const _0x146ec8=[];_0xcdbdaf["streams"]["forEach"](_0x2e3ff7=>{const _0x3175c2=_0xb642cf;if(_0x2e3ff7["url"]&&_0x2e3ff7["url"]['includes']('bcdnxw.hakunaymatata.com'))return;const _0x121347=(_0x2e3ff7['title']||_0x2e3ff7['description']||'')['toLowerCase']();let _0x549c7c="English 🇺🇲",_0x2e7cfb=![];if(/hindi|hin|dual/["test"](_0x121347))_0x549c7c='Hindi\x20🇮🇳',_0x2e7cfb=!![];else/multi|🌐/['test'](_0x121347)&&(_0x549c7c='Multi\x20🌐');if(_0x2e7cfb&&!_0x2601af)return;if(!_0x2e7cfb&&!_0x51ddfd)return;_0x146ec8['push'](__spreadProps(__spreadValues({},_0x2e3ff7),{'lang':_0x549c7c}));});const _0x1ab62a=[],_0x56398f={};return _0x146ec8['forEach'](_0x7a7a8b=>{const _0xdd8916=_0xb642cf,_0x553cb6=(_0x7a7a8b['title']||'')['toLowerCase'](),_0x1341b5=/2160|4k/["test"](_0x553cb6)?'2160p':/1080/["test"](_0x553cb6)?'1080p':/720/["test"](_0x553cb6)?'720p':/480/["test"](_0x553cb6)?'480p':'1080p',_0x16e4d5=_0x1341b5+'-'+_0x7a7a8b['lang'];if(!_0x56398f[_0x16e4d5])_0x56398f[_0x16e4d5]=[];_0x56398f[_0x16e4d5]['push'](_0x7a7a8b);}),Object["entries"](_0x56398f)["forEach"](([_0x2fa5ea,_0x1b7ef0])=>{const _0x13db6d={_0x193491:0xe2,_0xbabefb:0xde,_0x4b3c1b:0xdc,_0x36878c:0xf7,_0x5166ea:0xd2,_0x2b66e9:0xe0},[_0x394e6f,_0xcee24c]=_0x2fa5ea['split']('-');_0x1b7ef0['forEach'](_0x5016c1=>{const _0x1a42be=_0x1301,_0x475b1c=(_0x5016c1['title']||_0x5016c1["description"]||'')["toLowerCase"](),_0x2bd5e6=_0x5016c1["title"]?_0x5016c1['title']["match"](/(\d+(?:\.\d+)?\s*(?:GB|MB))/i):null,_0x158b6d=_0x2bd5e6?_0x2bd5e6[0x1]:'1.99\x20GB',_0xc55352=/\b(mp4|avi|m4v)\b/["test"](_0x475b1c)?'MP4':"MKV",_0x5bd01c=_0xcee24c["replace"](/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD00-\uDFFF]/g,'')['trim'](),_0x50ae5a='🎬\x20'+_0x3a0392+'\x20-\x20('+_0x1469d4+')\x0a💎\x20'+_0x394e6f+" | 🔊 "+_0x5bd01c+'\x20|\x20💾\x20'+_0x158b6d+"\n🎞️ "+_0xc55352+" | ⛓️‍💥 MovieBox";_0x1ab62a["push"]({'name':PROVIDER_NAME+" | "+_0x394e6f+" | "+_0xcee24c,'title':_0x50ae5a,'size':_0x50ae5a,'description':_0x50ae5a,'url':_0x5016c1['url'],'behaviorHints':{'proxyHeaders':{'request':{'Referer':'https://stremio-moviebox-1.onrender.com/'}}}});});}),_0x1ab62a;}catch(_0x373340){return console['error']('Global\x20processing\x20failure\x20context:',_0x373340),[];}});}typeof module!=='undefined'&&module['exports']?module['exports']={'getStreams':getStreams,'onSettings':onSettings}:(global['getStreams']=getStreams,global["onSettings"]=onSettings);/*string-table removed*/


/* ===== nv-plugins 4.32.0 fallback lane: api.vidlove.cc multi-server API =====
   The provider's own upstream died; the live vidlove player's JSON API still
   serves the same family of backends. Server subset per provider keeps rows
   distinct across the pack (no cross-provider duplicate claims). */
var _VLAPI_BASE = 'https://api.vidlove.cc';
var _VLAPI_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
var _VLAPI_SOURCES = ['moviebox2'];
var _VLAPI_LABEL = 'MovieBox';

function _vlTimeout(p, ms) {
  if (typeof setTimeout !== 'function') return p;
  return Promise.race([p, new Promise(function (res) {
    var t = setTimeout(function () { res(null); }, ms);
    if (t && typeof t.unref === 'function') t.unref();
  })]);
}
function _vlFetchServer(src, id, isTv, season, episode) {
  try {
    var params = 'id=' + encodeURIComponent(String(id)) + '&mode=json' + (src ? '&sources=' + encodeURIComponent(src) : '');
    if (isTv && season != null && episode != null) params += '&season=' + encodeURIComponent(season) + '&episode=' + encodeURIComponent(episode);
    var url = _VLAPI_BASE + '/' + (isTv ? 'tv' : 'movie') + '?' + params;
    return _vlTimeout(fetch(url, { headers: { 'User-Agent': _VLAPI_UA, 'Accept': 'application/json', 'Referer': 'https://player.vidlove.cc/' } }), 6500)
      .then(function (r) { if (!r || !r.ok) return []; return r.json(); })
      .then(function (j) {
        var s = j && j.source;
        if (!s || !s.url) return [];
        var subs = (j.subtitles || []).slice(0, 6).map(function (st) {
          return { id: st.label || 'sub', url: st.file, language: 'en' };
        });
        return [{
          name: _VLAPI_LABEL + ' | ' + (s.label || src),
          title: '🎬 ' + _VLAPI_LABEL + ' | ' + (s.label || src) + '\n📺 quality resolves at playback',
          url: String(s.url),
          quality: '',
          type: 'm3u8',
          subtitles: subs,
          headers: { 'Referer': 'https://player.vidlove.cc/', 'User-Agent': _VLAPI_UA }
        }];
      })
      .catch(function () { return []; });
  } catch (e) { return Promise.resolve([]); }
}
function _vlApiLane(id, mediaType, season, episode) {
  var isTv = mediaType === 'tv' || mediaType === 'series';
  // 'Best' mode (no sources param) is the API's own auto-pick and the most
  // reliable lane (4.32.0 live checks); per-server picks vary in coverage.
  var reqs = [null].concat(_VLAPI_SOURCES);
  return Promise.all(reqs.map(function (src) {
    return _vlFetchServer(src, id, isTv, season, episode);
  })).then(function (lists) {
    var out = [];
    lists.forEach(function (l) { out = out.concat(l); });
    return out;
  }).catch(function () { return []; });
}

/* 4.32.0: own lane first; if it yields nothing, the vidlove-API fallback answers.
   The lane promise starts immediately so a slow primary never delays it. */
(function () {
  var __origGet = module.exports && module.exports.getStreams;
  if (typeof __origGet !== 'function') return;
  module.exports.getStreams = function (a, b, c, d) {
    var lane = _vlApiLane(a, b, c, d).catch(function () { return []; });
    var origP;
    try { origP = Promise.resolve(__origGet.apply(this, arguments)).catch(function () { return []; }); }
    catch (e) { origP = Promise.resolve([]); }
    var origFast = Promise.race([origP, new Promise(function (res) {
      var t = setTimeout(function () { res([]); }, 2600);
      if (t && typeof t.unref === 'function') t.unref();
    })]);
    return Promise.all([origFast, lane]).then(function (rs) {
      return (rs[0] || []).concat(rs[1] || []);
    });
  };
})();

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
  var PROVIDER = "moviebox";
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

/* ===== nv 4.33.0 verified-lane merge (auto-injected) ==================
   Adds an independent, live-verified extraction lane beside the native one.
   Policy: WINGS rows first, native rows (junk filtered) after
   - Junk VidAPI relay rows (tungtungtungsahur.cfd YT-rip lane) are dropped.
   - Never rejects; every lane is capped; QuickJS-safe (no AbortController). */
(function () {
  'use strict';
  var __LABEL = 'MovieBox';
  var __ALT_FIRST = true;
  var __DROP_JUNK = true;
  var __ALT_NAME = '__nvWingsStreams';
  var __ALT_CAP = 20000;
  var __NATIVE_CAP = 20000;
  function __junk(u) { return /tungtungtungsahur\.cfd|\/api\?d=/i.test(String(u || '')); }
  var __orig = null;
  try { __orig = module.exports && module.exports.getStreams; } catch (e) { __orig = null; }
  if (typeof __orig !== 'function') return;
  module.exports.getStreams = function () {
    var args = Array.prototype.slice.call(arguments), self = this;
    function cap(p, ms) {
      return new Promise(function (res) {
        var done = false;
        var t = setTimeout(function () { if (!done) { done = true; res([]); } }, ms);
        if (t && typeof t.unref === 'function') t.unref();
        Promise.resolve(p).then(function (v) {
          if (!done) { done = true; if (t) clearTimeout(t); res(Array.isArray(v) ? v : []); }
        }, function () {
          if (!done) { done = true; if (t) clearTimeout(t); res([]); }
        });
      });
    }
    function runNative() {
      try {
        var r = __orig.apply(self, args);
        return Promise.resolve(r).then(function (v) { return Array.isArray(v) ? v : []; }, function () { return []; });
      } catch (e) { return Promise.resolve([]); }
    }
    function runAlt() {
      var f = null;
      try { f = (typeof globalThis !== 'undefined' && globalThis) ? globalThis[__ALT_NAME] : null; } catch (e) { f = null; }
      if (typeof f !== 'function') return Promise.resolve([]);
      try {
        var r = (__ALT_NAME === '__nvWingsStreams')
          ? f({ tmdbId: args[0], mediaType: args[1], season: args[2], episode: args[3], label: __LABEL })
          : f(args[0], args[1], args[2], args[3]);
        return Promise.resolve(r).then(function (v) { return Array.isArray(v) ? v : []; }, function () { return []; });
      } catch (e) { return Promise.resolve([]); }
    }
    var natP = cap(runNative(), __NATIVE_CAP);
    var altP = cap(runAlt(), __ALT_CAP);
    return Promise.all([natP, altP]).then(function (rs) {
      var nat = rs[0] || [], alt = rs[1] || [];
      if (__DROP_JUNK) nat = nat.filter(function (r) { return r && r.url && !__junk(r.url); });
      alt = alt.filter(function (r) { return r && r.url && !__junk(r.url); });
      var seen = {}, out = [];
      var order = __ALT_FIRST ? [alt, nat] : [nat, alt];
      for (var i = 0; i < order.length; i++) {
        for (var k = 0; k < order[i].length; k++) {
          var r = order[i][k];
          if (!r || !r.url || seen[r.url]) continue;
          seen[r.url] = 1; out.push(r);
        }
      }
      return out;
    });
  };
})();

