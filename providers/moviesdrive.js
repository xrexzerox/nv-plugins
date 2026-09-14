/* nv-plugins pack 4.37.0 (2026-09-14): device-fidelity fix. The Nuvio QuickJS realm ships NO timers - every unguarded setTimeout race in 4.33.0-4.36.0 (wings _race, wings partial collector, merge-wrapper cap(), native lanes, light deadline wrappers) threw ReferenceError on device and returned 0 rows on every call. All sites are guarded now and the merge wrapper is a fetch-count-bounded waterfall (verified WINGS text lane first/fallback + native lane, fail-soft, URL-deduped). Pure-JS polyfills for atob/URLSearchParams attached.
 */
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
/* nv-plugins moviesdrive.js v5.2.0 (pack 4.33.0, 2026-09-13): streams fix - the site migrated to a JS-rendered search (search.html + Typesense search.php) and hubcloud search-recover pages, which the old HTML parsers cannot read (verified live: their new search no longer even carries tt0137523); the 4.33.0 verified WINGS lane is merged FIRST so streams resolve, native kept for old-format pages. */
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
(function() {
  'use strict';

  var WINGS_BASE = 'https://api.speedracelight.com';
  var TMDB_KEY = '439c478a771f35c05022f9feabcca01c';
  var WINGS_UA =
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';
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
  var SHA_C = [0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4,
    0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174
  ];

  function _f(x) {
    x = x >>> 0;
    x ^= x >>> 16;
    x = Math.imul(x, 0x85ebca6b) >>> 0;
    x ^= x >>> 13;
    x = Math.imul(x, 0xc2b2ae35) >>> 0;
    x = (x ^ (x >>> 16)) >>> 0;
    return x;
  }

  function _rotl(x, n) {
    x = x >>> 0;
    n = n & 31;
    if (n === 0) return x >>> 0;
    return ((x << n) | (x >>> (32 - n))) >>> 0;
  }

  function _branch(n) {
    return ((n * (n + 1)) & 1) === 0;
  }

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
    return {
      slots: slots,
      acc: _f((0xa5a5a5a5 ^ s) >>> 0) >>> 0
    };
  }

  function _next(state, counter) {
    var slots = state.slots,
      acc = state.acc;
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
      for (var q = 0; q < s.length; q++) {
        var c = s.charAt(q);
        if (c !== '=' && CH.indexOf(c) !== -1) clean += c;
      }
      bin = '';
      for (var w = 0; w < clean.length; w += 4) {
        var a = CH.indexOf(clean.charAt(w)),
          b = CH.indexOf(clean.charAt(w + 1));
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
      else if ((b & 0xf0) === 0xe0) s += String.fromCharCode(((b & 0x0f) << 12) | ((bytes[i++] & 0x3f) <<
        6) | (bytes[i++] & 0x3f));
      else if ((b & 0xf8) === 0xf0) {
        var cp = ((b & 0x07) << 18) | ((bytes[i++] & 0x3f) << 12) | ((bytes[i++] & 0x3f) << 6) | (bytes[
          i++] & 0x3f);
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
      return Promise.resolve(p).then(function(v) {
        return v;
      }, function() {
        return fallback;
      });
    }
    return new Promise(function(resolve) {
      var done = false;
      var t = setTimeout(function() {
        if (!done) {
          done = true;
          resolve(fallback);
        }
      }, ms);
      if (t && typeof t.unref === 'function') t.unref();
      Promise.resolve(p).then(function(v) {
          if (!done) {
            done = true;
            clearTimeout(t);
            resolve(v);
          }
        },
        function() {
          if (!done) {
            done = true;
            clearTimeout(t);
            resolve(fallback);
          }
        });
    });
  }

  function _jsonText(resp) {
    return Promise.resolve(resp.text()).catch(function() {
      return '';
    });
  }

  function wingsTmdbMeta(tmdbId, mediaType) {
    var url = 'https://api.themoviedb.org/3/' + (mediaType === 'tv' ? 'tv' : 'movie') + '/' +
      parseInt(tmdbId, 10) + '?api_key=' + TMDB_KEY + '&append_to_response=external_ids';
    return _race(
      _fetchX(url, {
        headers: {
          'User-Agent': WINGS_UA,
          'Accept': 'application/json'
        }
      })
      .then(function(r) {
        return r.ok ? r.json() : null;
      })
      .then(function(j) {
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
    return _fetchX(WINGS_BASE + '/' + serverPath + '?' + params, {
        headers: WINGS_HEADERS
      })
      .then(function(r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.text();
      })
      .then(function(txt) {
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
      return wingsTmdbMeta(tmdbId, mediaType).then(function(meta) {
        if (!meta || !meta.title) return [];
        return _fetchX(WINGS_BASE + '/seed?mediaId=' + tmdbId, {
            headers: WINGS_HEADERS
          })
          .then(function(r) {
            if (r.ok) return r.json();
            if (r.status === 429 || r.status === 503) {
              /* seed endpoint rate-limits bursts; on the serialized device bridge
                 the immediate retry lands past the burst window */
              return _fetchX(WINGS_BASE + '/seed?mediaId=' + tmdbId, {
                  headers: WINGS_HEADERS
                })
                .then(function(r2) {
                  return r2.ok ? r2.json() : null;
                }, function() {
                  return null;
                });
            }
            return null;
          })
          .then(function(j) {
            if (!j || !j.seed) throw new Error('no seed');
            var seed = j.seed;
            var jobs = WINGS_SERVERS.map(function(sp) {
              return wingsQueryServer(sp, seed, meta, mediaType, opts.season, opts.episode,
                  tmdbId)
                .then(function(o) {
                  return o;
                }, function() {
                  return null;
                });
            });
            /* collect PARTIAL results: never gate on the slowest server.
             * undefined = still pending, null = failed, object = success. */
            return new Promise(function(resolve) {
              var results = new Array(jobs.length);
              var done = false;
              var t = null;
              if (typeof setTimeout === 'function') {
                /* device QuickJS ships no timers - guard every timer use */
                t = setTimeout(function() {
                  if (!done) {
                    done = true;
                    resolve(results);
                  }
                }, Math.max(6000, timeoutMs - 2500));
                if (t && typeof t.unref === 'function') t.unref();
              }
              var pending = jobs.length;
              var settle = function() {
                if (!done) {
                  done = true;
                  if (t) clearTimeout(t);
                  resolve(results);
                }
              };
              jobs.forEach(function(jp, idx) {
                Promise.resolve(jp).then(function(obj) {
                  results[idx] = obj;
                  pending--;
                  if (pending <= 0) settle();
                }, function() {
                  results[idx] = null;
                  pending--;
                  if (pending <= 0) settle();
                });
              });
            }).then(function(results) {
              results = results || [];
              var seen = {};
              var rows = [];
              for (var i = 0; i < results.length; i++) {
                var obj = results[i];
                if (!obj) continue;
                var subs = (obj.subtitles || []).filter(function(s) {
                    return s && s.url;
                  })
                  .map(function(s) {
                    return {
                      url: s.url,
                      language: s.lang || s.language || 'en',
                      name: s.language || s.lang || 'English'
                    };
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
                    title: label + ' ' + q + (mediaType === 'tv' ? ' S' + (opts.season || 1) +
                      'E' + (opts.episode || 1) : ''),
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
              rows.sort(function(a, b) {
                var order = {
                  '4K': 4,
                  '1440p': 3,
                  '1080p': 2,
                  '720p': 1
                };
                return (order[b.quality] || 0) - (order[a.quality] || 0);
              });
              return rows;
            });
          });
      }).catch(function() {
        return [];
      });
    } catch (e) {
      return Promise.resolve([]);
    }
  }

  if (typeof globalThis !== 'undefined') globalThis.__nvWingsStreams = __nvWingsStreams;
})();
/*
 * nv-plugins moviesdrive.js — FULLY DECODED port of the All-in-One-Nuvio provider (4.24.0 merge pass).
 * Decoded from the obfuscated AIO build: string tables resolved, decoder machinery stripped,
 * every network call capped by an 8s deadline, node-core requires fail-soft, nvio post-filter
 * attached (en/tl audio gate, >=720p quality gate, cross-provider dedupe). Endpoints/keys/headers
 * identical to the AIO original.
 */
/* nv-plugins best-settings pass 4.24.0: hard 8s deadline on every network call */
var __nvFetch = (function() {
  var _f = null;
  try {
    _f = (typeof fetch === "function") ? fetch : null;
  } catch (e) {
    _f = null;
  }
  if (!_f) return function() {
    return Promise.reject(new Error("no fetch"));
  };
  var hasT = typeof setTimeout === "function";
  return function(input, init) {
    var p;
    try {
      p = _f.apply(this, arguments);
    } catch (e) {
      return Promise.reject(e);
    }
    if (!hasT || !p || typeof p.then !== "function") return p;
    return Promise.race([p, new Promise(function(_res, rej) {
      var t = setTimeout(function() {
        rej(new Error("nv deadline 8s"));
      }, 8000);
      if (t && typeof t.unref === "function") t.unref();
    })]);
  };
})();
/* fail-soft require: node-core modules (net/http/assert/...) never crash the provider */
var __nvRequire = (function() {
  var _rq = null;
  try {
    _rq = (typeof require === "function") ? require : null;
  } catch (e) {
    _rq = null;
  }
  return function(name) {
    if (_rq) {
      try {
        return _rq(name);
      } catch (e) {}
    }
    return {};
  };
})();
/* QuickJS-safe global aliases: embedded polyfills (forge/uuid/whatwg) reference
   window/self/document unguarded - in Nuvio's QuickJS those would throw
   ReferenceError at module load and kill the provider. */
var window = (typeof window !== "undefined" && window) ? window :
  (typeof globalThis !== "undefined" ? globalThis : (typeof global !== "undefined" ? global : {}));
var self = (typeof self !== "undefined" && self) ? self : window;
var document = (typeof document !== "undefined" && document) ? document : {
  createElement: function() {
    return {
      style: {},
      setAttribute: function() {},
      getElementsByTagName: function() {
        return [];
      }
    };
  },
  getElementsByTagName: function() {
    return [];
  },
  addEventListener: function() {}
};
var navigator = (typeof navigator !== "undefined" && navigator) ? navigator : {
  userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36"
};
var v1 = function() {
  return "";
};
var __defProp = Object.defineProperty,
  __defProps = Object.defineProperties,
  __getOwnPropDescs = Object.getOwnPropertyDescriptors,
  __getOwnPropSymbols = Object.getOwnPropertySymbols,
  __hasOwnProp = Object.prototype.hasOwnProperty,
  __propIsEnum = Object.prototype.propertyIsEnumerable,
  __defNormalProp = (v3, v4, v5) => (v4 in v3) ? __defProp(v3, v4, {
    enumerable: true,
    configurable: true,
    writable: true,
    value: v5
  }) : v3[v4] = v5,
  __spreadValues = (v6, v7) => {
    for (var v11 in v7 || (v7 = {}))
      if (__hasOwnProp.call(v7, v11)) __defNormalProp(v6, v11, v7[v11]);
    if (__getOwnPropSymbols)
      for (var v11 of __getOwnPropSymbols(v7)) {
        if (__propIsEnum.call(v7, v11)) __defNormalProp(v6, v11, v7[v11]);
      }
    return v6;
  },
  __spreadProps = (v12, v13) => __defProps(v12, __getOwnPropDescs(v13)),
  __async = (v14, v15, v16) => {
    return new Promise((v19, v20) => {
      var v22 = v23 => {
          try {
            v24(v16.next(v23));
          } catch (v25) {
            v20(v25);
          }
        },
        v26 = v27 => {
          try {
            v24(v16.throw(v27));
          } catch (v28) {
            v20(v28);
          }
        },
        v24 = v29 => v29.done ? v19(v29.value) : Promise.resolve(v29.value).then(v22, v26);
      v24((v16 = v16.apply(v14, v15)).next());
    });
  },
  PROVIDER_NAME = "MoviesDrive",
  MAIN_URL = "https://new1.moviesdrive.christmas",
  ARCHIVE_DOMAIN = "https://mdrive.lol",
  TMDB_KEY = "439c478a771f35c05022f9feabcca01c",
  MOBILE_UAS = [
    "Mozilla/5.0 (Linux; Android 14; Pixel 8 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36",
    "Mozilla/5.0 (Linux; Android 13; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36",
    "Mozilla/5.0 (Linux; Android 12; Pixel 6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Mobile Safari/537.36",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
    "Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"
  ];

function getHeaders(v30) {
  var v36 = MOBILE_UAS[Math.floor(Math.random() * MOBILE_UAS.length)],
    v37 = {
      "User-Agent": v36,
      "Accept-Language": "en-US,en;q=0.9"
    };
  if (v30)
    for (var v38 in v30) {
      v37[v38] = v30[v38];
    }
  return v37;
}

function log(v39) {
  console.log("[" + PROVIDER_NAME + "] " + v39);
}

function err(v43) {
  console.error("[" + PROVIDER_NAME + "] " + v43);
}

function fetchText(v44, v45, v46) {
  return __async(this, null, function*() {
    v46 = v46 || 12000;
    try {
      var v52 = null;
      if (typeof AbortSignal !== "undefined" && AbortSignal.timeout) v52 = AbortSignal.timeout(v46);
      var v53 = getHeaders(v45 && v45.headers ? null : null);
      if (v45 && v45.headers)
        for (var v54 in v45.headers) {
          v53[v54] = v45.headers[v54];
        }
      var v55 = __spreadProps(__spreadValues({}, v45 || ({})), {
        headers: v53
      });
      if (v52) v55.signal = v52;
      var v56 = __nvFetch(v44, v55),
        v58 = yield typeof setTimeout === "function" ? Promise.race([v56, new Promise(function(v59, v60) {
          setTimeout(function() {
            v60(new Error("Timeout " + v46 + "ms"));
          }, v46);
        })]) : v56;
      if (v58.ok) return yield v58.text();
      return null;
    } catch (v62) {
      return (err("fetch: " + v44.substring(0, 80) + " -> " + (v62.message || "")), null);
    }
  });
}

function fetchJson(v63, v64, v65) {
  return __async(this, null, function*() {
    var v66 = yield fetchText(v63, v64, v65);
    if (!v66) return null;
    try {
      return JSON.parse(v66);
    } catch (v67) {
      return null;
    }
  });
}

function parseQuality(v68) {
  var v70 = String(v68 || ""),
    v71 = v70.match(/(2160|1080|720|480)\s*P/i);
  if (v71) return v71[1] + "p";
  if ((/4K|UHD/i).test(v70)) return "2160p";
  if ((/1440|2K/i).test(v70)) return "1440p";
  return "HD";
}

function extractSiteTitle(v72) {
  var v77 = v72.match(/<title>(.*?)<\/title>/i);
  if (!v77) return "";
  var v78 = v77[1],
    v79 = v78.match(/Download\s+(.+?)\s+(?:In HD Free|Free Download)/i);
  if (v79) return v79[1].trim();
  var v80 = v78.replace(/^(?:Download\s+)?/, "");
  return (v80 = v80.replace(
      /\s+(?:\d{3,4}p\b|4K\b|WEB-DL\b|BluRay\b|HDTV\b|x26[45]\b|HEVC\b|SDR\b|HDR\b|DD\d|DDP\d|Hindi|English|Dual\s*Audio|ESubs?)\b.*$/i,
      ""), v80 = v80.replace(/\s*[-–|]\s*\w*\s*$/i, "").trim(), v80 = v80.replace(/&#8211;/g, "–"), v80 ||
    v78);
}

function isStrictMatch(v81, v82, v83, v84) {
  if (!v81 || !v83) return false;
  var v90 = v81.toLowerCase().replace(/[^a-z0-9\s]/g, " ").trim().replace(/\s+/g, " "),
    v91 = v83.toLowerCase().replace(/download\s*/g, "").replace(/[^a-z0-9\s]/g, " ").trim().replace(/\s+/g,
      " ");
  if (v91 !== v90 && v91.indexOf(v90 + " ") !== 0 && v91.indexOf(" " + v90 + " ") === -1 && v91.indexOf(" " +
      v90) !== v91.length - v90.length - 1) return false;
  if (v82 && v84) {
    var v92 = parseInt(v82),
      v93 = parseInt(v84);
    if (!isNaN(v92) && !isNaN(v93) && Math.abs(v92 - v93) > 1) return false;
  }
  return true;
}

function extractSeasonHtml(v94, v95) {
  if (!v94 || v95 == null) return v94;
  var v103 = new RegExp(
      "(<h[1-6][^>]*>|<strong[^>]*>|<span[^>]*>)[\\s\\S]{0,100}?(?:Season|Saison|Staffel)\\s*0*(\\d+)\\b(?!\\s*[-–+&])",
      "gi"),
    v104, v105 = [];
  while ((v104 = v103.exec(v94)) !== null) {
    v105.push({
      index: v104.index,
      season: parseInt(v104[2])
    });
  }
  var v106 = -1,
    v107 = -1;
  for (var v108 = 0; v108 < v105.length; v108++) {
    if (v105[v108].season === v95) {
      if (v106 === -1) v106 = v108;
    } else v107 = v108;
  }
  if (v106 === -1) {
    var v109 = new RegExp(
        "(<h[1-6][^>]*>|<strong[^>]*>).*?(?:Season|Saison|Staffel)\\s*0*(\\d+)\\s*[-–]\\s*0*(\\d+)", "gi"),
      v110, v111 = -1;
    while ((v110 = v109.exec(v94)) !== null) {
      if (v95 >= parseInt(v110[2]) && v95 <= parseInt(v110[3])) {
        v111 = v110.index;
        break;
      }
    }
    if (v111 !== -1) return v94.substring(v111);
    return null;
  }
  var v112 = v105[v106].index;
  if (v107 > v106)
    for (var v113 = 0; v113 < v105.length; v113++) {
      if (v105[v113].season === v95 && v113 > v107) {
        v112 = v105[v113].index;
        break;
      }
    }
  var v114 = v94.length;
  for (var v113 = 0; v113 < v105.length; v113++) {
    if (v105[v113].index > v112 && v105[v113].season !== v95) {
      v114 = v105[v113].index;
      break;
    }
  }
  return v94.substring(v112, v114);
}

function getMedia(v115, v116) {
  var v117 = {
    v118: 400,
    v119: 419,
    v120: 452,
    v121: 367,
    v122: 388,
    v123: 367,
    v124: 458,
    v125: 437
  };
  return __async(this, null, function*() {
    var v127 = String(v115 || "").trim(),
      v128 = v127.indexOf("tt") === 0,
      v129 = v116 === "tv" || v116 === "series" ? "tv" : "movie";
    try {
      if (v128) {
        var v130 = yield fetchJson("https://api.themoviedb.org/3/find/" + v127 + "?api_key=" + TMDB_KEY +
            "&external_source=imdb_id", {}, 10000), v131 = v130 ? v129 === "tv" ? v130.tv_results : v130
          .movie_results : null;
        if (v131 && v131.length > 0) {
          var v132 = v131[0];
          return {
            title: v129 === "tv" ? v132.name : v132.title,
            year: (v132.first_air_date || v132.release_date || "").split("-")[0],
            imdb: v127
          };
        }
      } else {
        var v130 = yield fetchJson("https://api.themoviedb.org/3/" + v129 + "/" + v127 + "?api_key=" +
          TMDB_KEY + "&append_to_response=external_ids", {}, 10000);
        if (v130) return {
          title: v129 === "tv" ? v130.name : v130.title,
          year: (v130.first_air_date || v130.release_date || "").split("-")[0],
          imdb: v130.imdb_id || v130.external_ids && v130.external_ids.imdb_id || null
        };
      }
    } catch (v133) {
      err("tmdb: " + v133.message);
    }
    return {
      title: v127,
      year: null,
      imdb: null
    };
  });
}

function searchSite(v134) {
  var v135 = {
    v136: 380,
    v137: 419,
    v138: 431,
    v139: 385,
    v140: 440,
    v141: 462,
    v142: 440,
    v143: 458,
    v144: 447
  };
  return __async(this, null, function*() {
    var v146 = encodeURIComponent(v134),
      v147 = MAIN_URL + "/search.php?q=" + v146 + "&per_page=10",
      v148 = yield fetchJson(v147, {
        headers: {
          Referer: MAIN_URL + "/"
        }
      }, 10000);
    if (!v148 || !v148.hits || v148.hits.length === 0) return (log("search zero: " + v134), []);
    var v149 = [];
    for (var v150 = 0; v150 < v148.hits.length; v150++) {
      var v151 = v148.hits[v150].document;
      if (v151 && v151.permalink && v151.post_title) {
        var v152 = v151.post_title.match(/\((\d{4})\)/);
        v149.push({
          title: v151.post_title,
          href: v151.permalink,
          year: v152 ? parseInt(v152[1]) : null,
          imdb: v151.imdb_id || null
        });
      }
    }
    return (log("search found " + v149.length + " for: " + v134), v149);
  });
}

function parsePage(v153, v154, v155) {
  return __async(this, null, function*() {
    if (!v155) v155 = yield fetchText(v153, {
      headers: {
        Referer: MAIN_URL + "/"
      }
    }, 12000);
    if (!v155) return [];
    var v161 = v154 != null,
      v162 = v161 ? extractSeasonHtml(v155, v154) : v155;
    if (!v162) return (log("season " + v154 + " not found"), []);
    var v163 = [],
      v164 = /href="(https?:\/\/mdrive\.lol\/archive\/(\d+)[^"]*)"[^>]*>([\s\S]*?)<\/a>/gi,
      v165;
    while ((v165 = v164.exec(v162)) !== null) {
      var v166 = v165[3].replace(/<[^>]+>/g, "").trim();
      if (v161 && (/zip/i).test(v166)) continue;
      var v167 = parseQuality(v166);
      if (v167 === "480p") continue;
      var v168 = v166.match(/\[([\d.]+)\s*(MB|GB|TB)\]/i),
        v169 = v168 ? v168[0] : "";
      v163.push({
        id: v165[2],
        url: v165[1],
        label: v166,
        q: v167,
        size: v169
      });
    }
    return (log("archive links: " + v163.length + (v161 ? " (season " + v154 + ")" : "")), v163);
  });
}

function parseArchive(v170, v171) {
  return __async(this, null, function*() {
    var v178 = yield fetchText(v170, {
      headers: {
        Referer: MAIN_URL + "/"
      }
    }, 12000);
    if (!v178) return [];
    var v179 = [],
      v180 = /https?:\/\/hubcloud\.[a-z]+\/drive\/([a-z0-9_]+)/gi,
      v181;
    while ((v181 = v180.exec(v178)) !== null) {
      var v182 = v181[0],
        v183 = v171 != null;
      if (v183) {
        var v184 = Math.max(0, v181.index - 300),
          v185 = v178.substring(v184, v181.index),
          v186 = /(?:EP|Episode|E)\D*0*(\d+)/gi,
          v187, v188 = -1;
        while ((v187 = v186.exec(v185)) !== null) {
          v188 = parseInt(v187[1]);
        }
        if (v188 === -1 || v188 !== v171) continue;
      }
      v179.push({
        url: v182,
        id: v181[1]
      });
    }
    return (log("archive hosts: " + v179.length + (v183 ? " (ep " + v171 + ")" : "")), v179);
  });
}

function minutes() {
  return String(new Date().getMinutes());
}

function decodeBase64(v190) {
  if (typeof atob === "function") return atob(v190);
  var v195 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
    v196 = "";
  v190 = String(v190).replace(/=+$/, "");
  for (var v197 = 0, v198, v199, v200 = 0; v199 = v190.charAt(v200++); ~v199 && (v198 = v197 % 4 ? v198 * 64 +
      v199 : v199, v197++ % 4) ? v196 += String.fromCharCode(255 & v198 >> (-2 * v197 & 6)) : 0) {
    v199 = v195.indexOf(v199);
  }
  return v196;
}

function resolveHubcloud(v201, v202, v203) {
  var v204 = {
    v205: 368,
    v206: 397,
    v207: 393,
    v208: 462,
    v209: 402,
    v210: 419,
    v211: 462
  };
  return __async(this, null, function*() {
    var v213 = yield fetchText(v201, {
      headers: {
        Cookie: "xla=s4t",
        Referer: ARCHIVE_DOMAIN + "/"
      }
    }, 12000);
    if (!v213) return [];
    var v214 = null,
      v215 = v213.match(/var\s+url\s*=\s*'([^']+)'/);
    if (v215) v214 = v215[1];
    if (!v214) {
      var v216 = v213.match(/<a\s+id="download"\s+(?:x-href|href)="([^"]+)"/);
      if (v216) {
        v214 = v216[1];
        if (!v214.startsWith("http")) try {
          v214 = decodeBase64(v214);
        } catch (v217) {}
      }
    }
    if (!v214) return [];
    var v218 = yield fetchText(v214, {
      headers: {
        Cookie: "xla=s4t",
        Referer: v201
      }
    }, 15000);
    if (!v218) return [];
    var v219 = [],
      v220, v221 = /href="(https?:\/\/fsl\.gigabytes\.icu[^"]+)"/gi;
    while ((v220 = v221.exec(v218)) !== null) {
      v219.push({
        type: "FSLv2",
        url: v220[1],
        quality: v202,
        size: v203 || ""
      });
    }
    var v222 = /href="(https?:\/\/(?:pub-[a-z0-9]+\.r2\.dev|[a-z0-9.]+\.buzz)[^"]+)"/gi;
    while ((v220 = v222.exec(v218)) !== null) {
      v219.push({
        type: "FSL",
        url: v220[1] + "1" + minutes(),
        quality: v202,
        size: v203 || ""
      });
    }
    if (v219.length === 0) {
      var v223 = v218.match(/https?:\/\/[^\s"'<>]+\?token=\d+/);
      if (v223) {
        var v224 = v223[0].replace(/["'].*$/, "").replace(/[<>].*$/, "");
        v219.push({
          type: "FSL",
          url: v224 + "1" + minutes(),
          quality: v202,
          size: v203 || ""
        });
      }
    }
    return v219;
  });
}

function dedupe(v225) {
  var v227 = {};
  return (v225 || []).filter(function(v228) {
    if (!v228 || !v228.url || v227[v228.url]) return false;
    return (v227[v228.url] = true, true);
  });
}

function pad2(v230) {
  return v230 != null && v230 < 10 ? "0" + v230 : String(v230);
}
/*decoder removed*/
function getStreams(v231, v232, v233, v234) {
  var v235 = {
    v236: 425,
    v237: 366,
    v238: 378,
    v239: 372,
    v240: 370,
    v241: 370,
    v242: 438,
    v243: 408,
    v244: 360,
    v245: 371,
    v246: 390,
    v247: 419,
    v248: 457,
    v249: 442,
    v250: 361,
    v251: 407,
    v252: 419,
    v253: 426,
    v254: 407,
    v255: 396,
    v256: 443
  };
  return __async(this, null, function*() {
    try {
      log("request: id=" + v231 + " type=" + v232 + " s=" + v233 + " e=" + v234);
      var v264 = yield getMedia(v231, v232);
      if (!v264 || !v264.title) return [];
      var v265 = v232 === "tv" || v232 === "series",
        v266 = v233 != null ? Number(v233) : null,
        v267 = v234 != null ? Number(v234) : null;
      log("resolved: \"" + v264.title + "\" (" + (v264.year || "?") + ")");
      var v268, v269, v270 = null,
        v271 = null;
      if (v264.imdb && v264.imdb.indexOf("tt") === 0) {
        v268 = yield searchSite(v264.imdb);
        if (v265 && v266 != null)
          for (v269 = 0; v269 < v268.length; v269++) {
            if (v268[v269].imdb !== v264.imdb) continue;
            var v272 = v268[v269].href.indexOf("http") === 0 ? v268[v269].href : MAIN_URL + v268[v269]
              .href,
              v273 = yield fetchText(v272, {
                headers: {
                  Referer: MAIN_URL + "/"
                }
              }, 12000);
            if (v273 && extractSeasonHtml(v273, v266) !== null) {
              (v270 = v268[v269], v271 = v273, log("imdb season match: " + v270.title));
              break;
            }
          } else
            for (v269 = 0; v269 < v268.length; v269++) {
              if (v268[v269].imdb === v264.imdb) {
                (v270 = v268[v269], log("imdb exact match: " + v270.title));
                break;
              }
            }
      }
      if (!v270) {
        v268 = yield searchSite(v264.title);
        for (v269 = 0; v269 < v268.length; v269++) {
          if (isStrictMatch(v264.title, v265 ? null : v264.year, v268[v269].title, v268[v269].year)) {
            var v272 = v268[v269].href.indexOf("http") === 0 ? v268[v269].href : MAIN_URL + v268[v269]
              .href,
              v273 = yield fetchText(v272, {
                headers: {
                  Referer: MAIN_URL + "/"
                }
              }, 12000);
            if (!v265 || extractSeasonHtml(v273, v266) !== null) {
              (v270 = v268[v269], v271 = v273, log("title match: " + v270.title));
              break;
            }
          }
        }
      }
      if (!v270) return (log("no match"), []);
      if (!v271) {
        var v274 = v270.href.indexOf("http") === 0 ? v270.href : MAIN_URL + v270.href;
        v271 = yield fetchText(v274, {
          headers: {
            Referer: MAIN_URL + "/"
          }
        }, 12000);
        if (!v271) return [];
      }
      var v275 = extractSiteTitle(v271),
        v276 = "";
      v265 && (v276 = (v275 || v264.title) + " [S" + pad2(v266) + "E" + pad2(v267) + "]");
      var v277 = yield parsePage(v270.href.indexOf("http") === 0 ? v270.href : MAIN_URL + v270.href, v266,
        v271);
      v277 = v277.filter(function(v278) {
        return v278.q !== "480p";
      });
      if (v277.length === 0) return (log("no 720p/1080p/4k archives"), []);
      log("processing " + v277.length + " archive links");
      var v280 = [];
      var _0xmdArch = yield Promise.all(v277.map(function(v281) {
        return parseArchive(v281.url, v267).catch(function() {
          return [];
        });
      }));
      _0xmdArch.forEach(function(v282, v283) {
        var v281 = v277[v283];
        (v282 || []).forEach(function(v284) {
          v280.push({
            url: v284.url,
            q: v281.q,
            size: v281.size
          });
        });
      });
      if (v280.length === 0) return (log("no hubcloud hosts"), []);
      log("resolving " + v280.length + " hubcloud links");
      var v285 = yield Promise.all(v280.map(function(v286) {
        return resolveHubcloud(v286.url, v286.q, v286.size).catch(function() {
          return [];
        });
      }));
      var v287 = [];
      v285.forEach(function(v288) {
        v288.forEach(function(v291) {
          v287.push(v291);
        });
      });
      if (v287.length === 0) return (log("no FSL streams resolved"), []);
      var v293 = v265 && v276 ? v276 : v275,
        v294 = [];
      (v287.forEach(function(v295) {
        var v297 = v295.size ? " " + v295.size : "",
          v298 = v293 + " - " + PROVIDER_NAME;
        v294.push({
          name: v298,
          title: "Auto",
          url: v295.url,
          quality: v295.quality,
          size: "(" + v295.type + ")" + v297,
          behaviorHints: {
            notWebReady: true,
            proxyHeaders: {
              request: {
                Referer: ARCHIVE_DOMAIN + "/"
              }
            }
          }
        });
      }), v294 = dedupe(v294));
      var v299 = {
        "2160p": 4,
        "1080p": 3,
        "720p": 2,
        HD: 1
      };
      return (v294.sort(function(v300, v301) {
        var v303 = function(v304) {
            return v304.indexOf("(FSLv2)") !== -1 ? 1 : 0;
          },
          v306 = v303(v300.name),
          v307 = v303(v301.name);
        if (v306 !== v307) return v307 - v306;
        return (v299[v301.quality] || 0) - (v299[v300.quality] || 0);
      }), log("returning " + v294.length + " streams"), v294);
    } catch (v308) {
      return (err("fatal: " + v308.message), []);
    }
  });
}
typeof module !== "undefined" && module['exports'] ? module['exports'] = {
  'getStreams': getStreams
} : global['getStreams'] = getStreams;
/* ===== nv-plugins 4.32.0 host-follow fix =====
   MAIN_URL (new1) 302s to the current generation host and the Cloudflare
   redirect DROPS the query string - every search.php call then returns the
   latest uploads instead of the searched title, so every lookup degenerated
   to "no match". Resolve the effective origin once per call and re-point
   MAIN_URL before the core runs. */
(function() {
  var __origGet = module.exports && module.exports.getStreams;
  if (typeof __origGet !== 'function') return;

  function _mdResolveHost() {
    try {
      return fetch(MAIN_URL, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
          }
        })
        .then(function(r) {
          try {
            if (r && r.url) {
              var o = new URL(r.url).origin;
              if (o && o !== MAIN_URL && /moviesdrive|mdrive/.test(o)) {
                MAIN_URL = o;
                console.log('[MoviesDrive] host follow -> ' + o);
              }
            }
          } catch (e) {}
          return [];
        }).catch(function() {
          return [];
        });
    } catch (e) {
      return Promise.resolve([]);
    }
  }
  module.exports.getStreams = function() {
    var args = arguments,
      self = this;
    return _mdResolveHost().then(function() {
      return __origGet.apply(self, args);
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
(function() {
  var PROVIDER = "moviesdrive";
  var G = typeof globalThis !== "undefined" ? globalThis : typeof global !== "undefined" ? global : this;

  function settings() {
    try {
      return (G && G.SCRAPER_SETTINGS) || {};
    } catch (e) {
      return {};
    }
  }

  function hasTimers() {
    return typeof setTimeout === "function" && typeof clearTimeout === "function";
  }

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
    var opts = {
      headers: Object.assign({}, headers || {})
    };
    var p = __nvFetch(url, opts).then(function(r) {
      return r.ok ? r.text() : "";
    }).then(function(t) {
      var q = "";
      if (t && t.indexOf("#EXTM3U") !== -1) {
        var best = 0,
          re = /RESOLUTION=(\d+)x(\d+)/gi,
          m;
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
      qualCache[url] = {
        t: now,
        q: q
      };
      return q;
    }).catch(function() {
      qualCache[url] = {
        t: now,
        q: ""
      };
      return "";
    });
    if (hasTimers()) {
      p = Promise.race([p, new Promise(function(res) {
        var timer = setTimeout(function() {
          res("");
        }, 6000);
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
    SEEN[nu] = {
      exp: now + 120000,
      owner: owner
    };
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
    (list || []).forEach(function(s, i) {
      if (!s || !s.url) return;
      if (!langAllowed(s.title)) return;
      var text = (s.name || "") + " " + (s.title || "");
      var isMagnet = /^magnet:/i.test(String(s.url));
      var q = normQ(s.quality) || normQ(String(s.title || "").split("\n")[0]) || qFromText(text);
      var isHlsLike = /m3u8/i.test(String(s.url)) ||
        (!/\.(mp4|mkv|avi|mov|webm|ts|flv|m4v|mp3|aac)(\?|$)/i.test(String(s.url.split("?")[0])) &&
          /^https?:/i.test(String(s.url)));
      if (!q && !isMagnet && isHlsLike) {
        rows.push({
          s: s,
          i: i
        });
        probes.push(probeM3u8(String(s.url), s.headers));
      } else {
        rows.push({
          s: s,
          i: i
        });
        probes.push(Promise.resolve(q));
      }
    });
    return Promise.all(probes).then(function(qs) {
      var ranked = [];
      rows.forEach(function(row, k) {
        var q = qs[k];
        if (!q) return; // unknown resolution -> removed
        if (q === "CAM") return; // cam / sd / sub-720 -> removed
        row.s.quality = q;
        ranked.push({
          s: row.s,
          i: row.i,
          q: q
        });
      });
      // best first so dedupe keeps the strongest duplicate (stable)
      ranked.sort(function(a, b) {
        var r = rank(b.q) - rank(a.q);
        if (r !== 0) return r;
        return a.i - b.i;
      });
      var seenLocal = {},
        out = [];
      ranked.forEach(function(row) {
        var s = row.s;
        var nu = normUrl(s.url);
        if (seenLocal[nu]) return;
        if (!claim(nu, now, PROVIDER)) return; // already reported by a different provider
        seenLocal[nu] = 1;
        out.push(s);
      });
      return out.slice(0, 40);
    }).catch(function() {
      return (list || []).slice(0, 40);
    });
  }

  var __orig = null;
  try {
    __orig = module.exports && module.exports.getStreams;
  } catch (e) {
    __orig = null;
  }
  if (typeof __orig === "function") {
    module.exports.getStreams = function() {
      var args = Array.prototype.slice.call(arguments),
        self = this;

      function finish(v) {
        if (settings().postFilter === false) return v;
        try {
          return postProcess(Array.isArray(v) ? v : []);
        } catch (e) {
          return Array.isArray(v) ? v : [];
        }
      }
      try {
        var r = __orig.apply(self, args);
        if (r && typeof r.then === "function") {
          if (typeof setTimeout === "function") {
            // nv best-settings 4.23.0: hard 8s cap on the whole provider run
            r = Promise.race([r, new Promise(function(res) {
              var dl = setTimeout(function() {
                res([]);
              }, 8000);
              if (dl && typeof dl.unref === "function") dl.unref();
            })]);
          }
          return r.then(function(v) {
            return finish(v);
          }, function() {
            return [];
          });
        }
        return finish(r);
      } catch (e) {
        return Promise.resolve([]);
      }
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
(function() {
  'use strict';
  var __LABEL = 'MoviesDrive';
  var __WINGS_FIRST = true;
  var __ALT_NAME = '__nvWingsStreams';

  function __junk(u) {
    return /tungtungtungsahur\.cfd|\/api\?d=/i.test(String(u || ''));
  }
  var __orig = null;
  try {
    __orig = module.exports && module.exports.getStreams;
  } catch (e) {
    __orig = null;
  }
  if (typeof __orig !== 'function') return;

  function runAlt(args, self) {
    var f = null;
    try {
      f = (typeof globalThis !== 'undefined' && globalThis) ? globalThis[__ALT_NAME] : null;
    } catch (e) {
      f = null;
    }
    if (typeof f !== 'function') return Promise.resolve([]);
    try {
      var r = f({
        tmdbId: args[0],
        mediaType: args[1],
        season: args[2],
        episode: args[3],
        label: __LABEL
      });
      return Promise.resolve(r).then(function(v) {
        return Array.isArray(v) ? v : [];
      }, function() {
        return [];
      });
    } catch (e) {
      return Promise.resolve([]);
    }
  }

  function runNative(args, self) {
    try {
      var r = __orig.apply(self, args);
      return Promise.resolve(r).then(function(v) {
        return Array.isArray(v) ? v : [];
      }, function() {
        return [];
      });
    } catch (e) {
      return Promise.resolve([]);
    }
  }
  module.exports.getStreams = function() {
    var args = Array.prototype.slice.call(arguments),
      self = this;

    function clean(v) {
      var seen = {},
        out = [];
      (v || []).forEach(function(r) {
        if (!r || !r.url || __junk(r.url)) return;
        var k = String(r.url);
        if (seen[k]) return;
        seen[k] = 1;
        out.push(r);
      });
      return out;
    }

    function laneA() {
      return __WINGS_FIRST ? runAlt(args, self) : runNative(args, self);
    }

    function laneB() {
      return __WINGS_FIRST ? runNative(args, self) : runAlt(args, self);
    }
    return Promise.resolve().then(laneA).then(function(rows) {
      rows = clean(rows);
      if (rows.length) return rows;
      return Promise.resolve().then(laneB).then(function(rows2) {
        return clean(rows2);
      });
    });
  };
})();
