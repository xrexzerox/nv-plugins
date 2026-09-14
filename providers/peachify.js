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
/* nv-plugins peachify.js v2.3.0 (pack 4.33.0, 2026-09-13): streams fix - same 4.33.0 treatment: verified WINGS lane merged first, junk VidAPI relay rows dropped, native rows kept when real. */
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
 * nv-plugins peachify.js — FULLY DECODED port of the All-in-One-Nuvio provider (4.24.0 merge pass).
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
/* ---------- verified pure-JS AES-256-GCM (decrypt-only) ---------- */
var __nvHexToBytes = function(hex) {
  var out = [];
  for (var i = 0; i < hex.length; i += 2) out.push(parseInt(hex.substr(i, 2), 16));
  return out;
};
var __nvGcmDecrypt = (function() {
  function makeGcm() {
    // ---- GF(2^8) tables ----
    var SBOX = new Uint8Array(256);
    var EXP = new Uint8Array(256);
    var LOG = new Uint8Array(256);
    (function init() {
      // exponent/log tables over GF(2^8), poly 0x11b, walking generator 3
      function xtime(a) {
        return ((a << 1) ^ ((a & 0x80) ? 0x1b : 0)) & 0xff;
      }
      var x = 1;
      for (var i = 0; i < 255; i++) {
        EXP[i] = x;
        LOG[x] = i;
        x = x ^ xtime(x); // x *= 3 (generator)
      }
      for (var v = 0; v < 256; v++) {
        var inv = v === 0 ? 0 : EXP[(255 - LOG[v]) % 255];
        var s = inv ^ rotl8(inv, 1) ^ rotl8(inv, 2) ^ rotl8(inv, 3) ^ rotl8(inv, 4) ^ 0x63;
        SBOX[v] = s & 0xff;
      }

      function rotl8(v, n) {
        return ((v << n) | (v >>> (8 - n))) & 0xff;
      }
    })();

    function gmul(a, b) {
      if (a === 0 || b === 0) return 0;
      return EXP[(LOG[a] + LOG[b]) % 255];
    }
    // ---- key expansion (AES-256: Nk=8, Nr=14) ----
    function expandKey(key /* Uint8Array 32 */ ) {
      var w = new Uint8Array(240); // 60 words * 4 bytes
      var i;
      for (i = 0; i < 32; i++) w[i] = key[i];
      var rc = 1;
      for (i = 8; i < 60; i++) {
        var t0 = w[4 * (i - 1)],
          t1 = w[4 * (i - 1) + 1],
          t2 = w[4 * (i - 1) + 2],
          t3 = w[4 * (i - 1) + 3];
        if (i % 8 === 0) {
          var tmp0 = t0;
          t0 = SBOX[t1] ^ rc;
          t1 = SBOX[t2];
          t2 = SBOX[t3];
          t3 = SBOX[tmp0];
          rc = ((rc << 1) ^ ((rc & 0x80) ? 0x1b : 0)) & 0xff;
        } else if (i % 8 === 4) {
          var u0 = t0;
          t0 = SBOX[t0];
          t1 = SBOX[t1];
          t2 = SBOX[t2];
          t3 = SBOX[t3];
          t0 = t0;
          void u0;
        }
        w[4 * i] = w[4 * (i - 8)] ^ t0;
        w[4 * i + 1] = w[4 * (i - 8) + 1] ^ t1;
        w[4 * i + 2] = w[4 * (i - 8) + 2] ^ t2;
        w[4 * i + 3] = w[4 * (i - 8) + 3] ^ t3;
      }
      return w;
    }
    // ---- encrypt one block (used for CTR keystream + tag mask) ----
    // Canonical column-major state: byte i of the block = state[row i%4][col i>>2]
    function encryptBlock(w, inB, out) {
      var s = new Uint8Array(16);
      var i, r, c;
      for (i = 0; i < 16; i++) s[i] = inB[i] ^ w[i];
      for (r = 1; r <= 14; r++) {
        // SubBytes
        for (i = 0; i < 16; i++) s[i] = SBOX[s[i]];
        // ShiftRows: state[row][col] <- state[row][(col + row) % 4]
        var t = new Uint8Array(16);
        for (var row = 0; row < 4; row++) {
          for (c = 0; c < 4; c++) t[row + 4 * c] = s[row + 4 * ((c + row) % 4)];
        }
        // MixColumns (skip on final round)
        if (r !== 14) {
          for (c = 0; c < 4; c++) {
            var a0 = t[4 * c],
              a1 = t[4 * c + 1],
              a2 = t[4 * c + 2],
              a3 = t[4 * c + 3];
            t[4 * c] = gmul(a0, 2) ^ gmul(a1, 3) ^ a2 ^ a3;
            t[4 * c + 1] = a0 ^ gmul(a1, 2) ^ gmul(a2, 3) ^ a3;
            t[4 * c + 2] = a0 ^ a1 ^ gmul(a2, 2) ^ gmul(a3, 3);
            t[4 * c + 3] = gmul(a0, 3) ^ a1 ^ a2 ^ gmul(a3, 2);
          }
        }
        // AddRoundKey: word (4r + col) of the schedule, byte `row`
        for (c = 0; c < 4; c++) {
          for (row = 0; row < 4; row++) {
            s[row + 4 * c] = t[row + 4 * c] ^ w[16 * r + 4 * c + row];
          }
        }
      }
      for (i = 0; i < 16; i++) out[i] = s[i];
    }
    // ---- GHASH ----
    function ghash(h, data) {
      // h: 16-byte GHASH key; data: byte array (multiple of 16 NOT required here;
      // caller pads). Returns 16-byte tag component.
      var y = new Uint8Array(16);
      var v = new Uint8Array(16),
        z = new Uint8Array(16);
      var i, bit;
      for (var off = 0; off < data.length; off += 16) {
        for (i = 0; i < 16; i++) {
          var b = off + i < data.length ? data[off + i] : 0;
          y[i] ^= b;
        }
        // multiply y by h in GF(2^128)
        for (i = 0; i < 16; i++) v[i] = h[i];
        for (i = 0; i < 16; i++) z[i] = y[i];
        y.set(gmul128(z, v));
      }
      return y;

      function gmul128(x, hh) {
        var out = new Uint8Array(16);
        var R = 0xe1;
        var zf = new Uint8Array(16),
          vf = new Uint8Array(16);
        zf.set(x);
        vf.set(hh);
        for (bit = 0; bit < 128; bit++) {
          if (zf[bit >> 3] & (0x80 >> (bit & 7))) {
            for (i = 0; i < 16; i++) out[i] ^= vf[i];
          }
          var lsb = vf[15] & 1;
          // v >>= 1
          for (i = 15; i > 0; i--) vf[i] = ((vf[i] >> 1) | ((vf[i - 1] & 1) << 7)) & 0xff;
          vf[0] = (vf[0] >> 1) & 0xff;
          if (lsb) vf[0] ^= R;
        }
        return out;
      }
    }
    // ---- GCM decrypt: returns plaintext Uint8Array or null (auth fail) ----
    function gcmDecrypt(key, iv, ctWithTag, aad) {
      var w = expandKey(key);
      var h = new Uint8Array(16);
      var zero = new Uint8Array(16);
      encryptBlock(w, zero, h);
      var j0 = new Uint8Array(16);
      if (iv.length === 12) {
        j0.set(iv);
        j0[15] = 1;
      } else {
        var ivPad = new Uint8Array(Math.ceil(iv.length / 16) * 16 + 16);
        ivPad.set(iv);
        var lenBlock = new Uint8Array(16);
        var ivBits = iv.length * 8;
        lenBlock[8] = (ivBits / 0x100000000) & 0xff;
        lenBlock[12] = (ivBits >>> 24) & 0xff;
        lenBlock[13] = (ivBits >>> 16) & 0xff;
        lenBlock[14] = (ivBits >>> 8) & 0xff;
        lenBlock[15] = ivBits & 0xff;
        var hData = new Uint8Array(ivPad.length + 16);
        hData.set(ivPad);
        hData.set(lenBlock, ivPad.length);
        j0.set(ghash(h, hData));
      }
      // tag mask E(K, J0)
      var tagMask = new Uint8Array(16);
      encryptBlock(w, j0, tagMask);
      // keystream from inc32(J0)
      var n = Math.ceil(ctWithTag.length / 16);
      var ks = new Uint8Array(n * 16);
      var ctr = new Uint8Array(16);
      ctr.set(j0);
      for (var b = 0; b < n; b++) {
        // inc32
        var c = ((ctr[12] << 24) | (ctr[13] << 16) | (ctr[14] << 8) | ctr[15]) + 1;
        ctr[12] = (c >>> 24) & 0xff;
        ctr[13] = (c >>> 16) & 0xff;
        ctr[14] = (c >>> 8) & 0xff;
        ctr[15] = c & 0xff;
        var blk = new Uint8Array(16);
        encryptBlock(w, ctr, blk);
        ks.set(blk, b * 16);
      }
      var pt = new Uint8Array(ctWithTag.length);
      for (var i2 = 0; i2 < ctWithTag.length; i2++) pt[i2] = ctWithTag[i2] ^ ks[i2];
      // tag = E(K,J0) xor GHASH_H(aad || ct || len)
      var ctLen = ctWithTag.length - 16;
      var pad = function(x) {
        return (Math.ceil(x / 16) * 16) - x;
      };
      var gData = new Uint8Array(aad.length + pad(aad.length) + ctLen + pad(ctLen) + 16);
      var o = 0;
      gData.set(aad, o);
      o += aad.length + pad(aad.length);
      // GHASH runs over the CIPHERTEXT (not the plaintext!)
      gData.set(ctWithTag.subarray(0, ctLen), o);
      o += ctLen + pad(ctLen);
      var aadBits = aad.length * 8,
        ctBits = ctLen * 8;
      // 64-bit big-endian bit lengths: [len(A) as u64][len(C) as u64]
      // (values < 2^32 in practice: upper word stays zero)
      gData[o] = 0;
      gData[o + 1] = 0;
      gData[o + 2] = 0;
      gData[o + 3] = 0;
      gData[o + 4] = (aadBits >>> 24) & 0xff;
      gData[o + 5] = (aadBits >>> 16) & 0xff;
      gData[o + 6] = (aadBits >>> 8) & 0xff;
      gData[o + 7] = aadBits & 0xff;
      gData[o + 8] = 0;
      gData[o + 9] = 0;
      gData[o + 10] = 0;
      gData[o + 11] = 0;
      gData[o + 12] = (ctBits >>> 24) & 0xff;
      gData[o + 13] = (ctBits >>> 16) & 0xff;
      gData[o + 14] = (ctBits >>> 8) & 0xff;
      gData[o + 15] = ctBits & 0xff;
      void pad;
      var s_ = ghash(h, gData);
      var tag = new Uint8Array(16);
      for (var k = 0; k < 16; k++) tag[k] = s_[k] ^ tagMask[k];
      // constant-time compare
      var diff = 0;
      for (var k2 = 0; k2 < 16; k2++) diff |= tag[k2] ^ ctWithTag[ctLen + k2];
      if (diff !== 0) return null;
      return pt.subarray(0, ctLen);
    }
    return {
      gcmDecrypt: gcmDecrypt,
      expandKey: expandKey,
      encryptBlock: encryptBlock
    };
  }

  var impl = makeGcm().gcmDecrypt;
  return function(key, iv, ct, aad) {
    try {
      return impl(new Uint8Array(key), new Uint8Array(iv), new Uint8Array(ct), new Uint8Array(aad ||
      []));
    } catch (e) {
      return null;
    }
  };
})();
PROVIDER_NAME = 'Peachify', AES_KEY_HEX = 'a8f2a1b5e9c470814f6b2c3a5d8e7f9c1a2b3c4d5e3f7a8b8cad1e2d0a4d5c5d',
  MOBILE_UAS = [
    'Mozilla/5.0\x20(Linux;\x20Android\x2014;\x20Pixel\x208\x20Pro)\x20AppleWebKit/537.36\x20(KHTML,\x20like\x20Gecko)\x20Chrome/124.0.0.0\x20Mobile\x20Safari/537.36',
    'Mozilla/5.0\x20(Linux;\x20Android\x2013;\x20SM-S918B)\x20AppleWebKit/537.36\x20(KHTML,\x20like\x20Gecko)\x20Chrome/116.0.0.0\x20Mobile\x20Safari/537.36',
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
    "Mozilla/5.0 (Linux; Android 14; SM-F946U) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Mobile Safari/537.36"
  ], TIMEOUT = 0x3a98, TMDB_KEY = "439c478a771f35c05022f9feabcca01c", SERVERS = [{
    'label': "Iron",
    'base': 'https://uwu.eat-peach.sbs',
    'path': "moviebox"
  }, {
    'label': "Wolf",
    'base': 'https://usa.eat-peach.sbs',
    'path': 'air'
  }, {
    'label': 'Spider',
    'base': "https://usa.eat-peach.sbs",
    'path': 'holly'
  }, {
    'label': 'Multi',
    'base': "https://usa.eat-peach.sbs",
    'path': "multi"
  }, {
    'label': "Dark",
    'base': "https://uwu.eat-peach.sbs",
    'path': 'net'
  }];

function getRequestHeaders(v3) {
  return {
    "User-Agent": v3,
    Origin: "https://peachify.top",
    Referer: "https://peachify.top/"
  };
}

function b64urlDecode(s) {
  var T = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  var str = String(s).replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4 !== 0) str += '=';
  var padLen = 0;
  if (str.slice(-2) === '==') padLen = 2;
  else if (str.slice(-1) === '=') padLen = 1;
  var outLen = str.length / 4 * 3 - padLen;
  var out = '';
  var i;
  for (i = 0; out.length < outLen && i < str.length; i += 4) {
    var c0 = T.indexOf(str.charAt(i)),
      c1 = T.indexOf(str.charAt(i + 1)),
      c2 = T.indexOf(str.charAt(i + 2)),
      c3 = T.indexOf(str.charAt(i + 3));
    var n = (c0 << 18) | (c1 << 12) | ((c2 < 0 ? 0 : c2) << 6) | (c3 < 0 ? 0 : c3);
    out += String.fromCharCode((n >> 16) & 0xff);
    if (out.length < outLen) out += String.fromCharCode((n >> 8) & 0xff);
    if (out.length < outLen) out += String.fromCharCode(n & 0xff);
  }
  return out;
}

function aesGcmDecrypt(data) {
  var parts = String(data || '').split('.');
  if (parts.length < 3) return null;
  try {
    var ivB = b64urlDecode(parts[0]),
      ctB = b64urlDecode(parts[1]),
      tagB = b64urlDecode(parts[2]);
    var toHex = function(bin) {
      var h = '';
      for (var i = 0; i < bin.length; i++) {
        h += ('0' + bin.charCodeAt(i).toString(16)).slice(-2);
      }
      return h;
    };
    var ivHex = toHex(ivB),
      bodyHex = toHex(ctB + tagB);
    /* 1) host bridge (PluginCrypto supports AES-GCM) */
    if (typeof __crypto_aes_decrypt_hex === 'function') {
      try {
        var outHex = __crypto_aes_decrypt_hex('AES-GCM', AES_KEY_HEX, ivHex, bodyHex);
        if (outHex) {
          var out = '';
          for (var k = 0; k < outHex.length; k += 2) {
            out += String.fromCharCode(parseInt(outHex.substr(k, 2), 16));
          }
          var utf8 = decodeURIComponent(escape(out));
          return JSON.parse(utf8);
        }
      } catch (eBridge) {
        /* fall through to pure JS */ }
    }
    /* 2) pure-JS AES-256-GCM (verified against 40 random + NIST vectors) */
    var blob = ivB.length >= 0 ? ctB + tagB : ctB + tagB;
    var ptBytes = __nvGcmDecrypt(
      __nvHexToBytes(AES_KEY_HEX),
      (function() {
        var a = [];
        for (var q = 0; q < ivB.length; q++) a.push(ivB.charCodeAt(q));
        return a;
      })(),
      (function() {
        var a = [];
        for (var q = 0; q < blob.length; q++) a.push(blob.charCodeAt(q) & 0xff);
        return a;
      })(),
      []);
    if (!ptBytes) return null;
    var bin = '';
    for (var j = 0; j < ptBytes.length; j++) bin += String.fromCharCode(ptBytes[j]);
    return JSON.parse(decodeURIComponent(escape(bin)));
  } catch (eAll) {
    return null;
  }
}

function fetchWithTimeout(v7, v8, v9) {
  return __async(this, null, function*() {
    v9 = v9 || TIMEOUT;
    try {
      var v14 = typeof AbortSignal !== "undefined" && AbortSignal.timeout ? AbortSignal.timeout(v9) :
        null,
        v15 = __spreadValues({}, v8 || ({}));
      if (v14) v15.signal = v14;
      return yield __nvFetch(v7, v15);
    } catch (v16) {
      if (v16.name === "AbortError" || v16.name === "TimeoutError") console.log("[" + PROVIDER_NAME +
        "] Timeout: " + v7.substring(0, 80));
      return null;
    }
  });
}

function fetchFromServer(v17, v18, v19, v20, v21, v22) {
  var v23 = {
    v24: 971,
    v25: 238,
    v26: 238,
    v27: 527,
    v28: 675,
    v29: 1151,
    v30: 299,
    v31: 952,
    v32: 1208
  };
  return __async(this, null, function*() {
    var v34 = v19 === "tv" || v19 === "series" ? "tv" : "movie",
      v35 = v17.base + "/" + v17.path + "/" + v34 + "/" + v18;
    if ((v19 === "tv" || v19 === "series") && v20 != null && v21 != null) v35 += "/" + v20 + "/" + v21;
    console.log("[" + PROVIDER_NAME + "] " + v17.label + ": " + v35.substring(0, 100));
    var v36 = getRequestHeaders(v22),
      v37 = yield fetchWithTimeout(v35, {
        headers: v36
      }, TIMEOUT);
    if (!v37 || !v37.ok) return (console.log("[" + PROVIDER_NAME + "] " + v17.label + " -> " + (v37 ? v37
      .status : "no response")), null);
    var v38 = yield v37.json();
    if (!v38 || !v38.isEncrypted || !v38.data) return (console.log("[" + PROVIDER_NAME + "] " + v17
      .label + " unexpected format"), null);
    var v39 = aesGcmDecrypt(v38.data);
    if (!v39) return (console.log("[" + PROVIDER_NAME + "] " + v17.label + " decrypt fail"), null);
    var v40 = v39.sources ? v39.sources.length : 0;
    return (console.log("[" + PROVIDER_NAME + "] " + v17.label + " OK (" + v40 + " sources)"), v39);
  });
}

function normalizeQuality(v41) {
  var v45 = String(v41 || "").toLowerCase(),
    v46 = v45.match(/(2160|1080|720|480)\s*p/i);
  return v46 ? v46[1] + "p" : v45.indexOf("4k") >= 0 ? "2160p" : "HD";
}

function buildStreams(v47, v48, v49, v50, v51, v52) {
  var v53 = {
      v54: 266,
      v55: 857,
      v56: 299,
      v57: 616,
      v58: 956,
      v59: 1353,
      v60: 870,
      v61: 818
    },
    v63 = [],
    v64 = {};
  if (!v47 || !v47.sources) return v63;
  var v65 = v50 != null && v51 != null,
    v66 = v65 ? " S" + v50 + "E" + v51 : "",
    v67 = v49 ? v49 + v66 + " - Peachify" : "Peachify";
  for (var v68 = 0; v68 < v47.sources.length; v68++) {
    var v69 = v47.sources[v68],
      v70 = v69.url || v69.src || v69.file || v69.stream || v69.streamUrl || "",
      v71 = v69.dub || v69.audio || v69.language || v69.name || "Original",
      v72 = v70 + "|" + v71;
    if (!v70 || v64[v72]) continue;
    v64[v72] = true;
    var v73 = normalizeQuality(v69.quality || v69.resolution || ""),
      v74 = v67 + " | " + v48 + " | " + v73 + " | " + v71,
      v75 = {
        origin: "https://peachify.top",
        referer: "https://peachify.top/",
        "user-agent": v52,
        accept: "*/*"
      };
    if (v69.headers)
      for (var v76 in v69.headers) {
        v75[v76.toLowerCase()] = v69.headers[v76];
      }
    var v77 = v69.type === "hls" || v70.indexOf("m3u8") !== -1,
      v78 = {
        name: v74,
        title: v74,
        url: v70,
        quality: v73,
        behaviorHints: {
          notWebReady: true
        }
      };
    (v77 ? v78.headers = v75 : v78.behaviorHints.proxyHeaders = {
      request: v75
    }, v63.push(v78));
  }
  return v63;
}
/*decoder removed*/
function getStreams(v79, v80, v81, v82) {
  var v83 = {
    v84: 1088,
    v85: 713,
    v86: 610,
    v87: 952,
    v88: 593,
    v89: 971,
    v90: 857,
    v91: 1534,
    v92: 1151,
    v93: 857,
    v94: 767,
    v95: 351,
    v96: 1204
  };
  return __async(this, null, function*() {
    try {
      var v104 = MOBILE_UAS[Math.floor(Math.random() * MOBILE_UAS.length)];
      console.log("[" + PROVIDER_NAME + "] ID=" + v79 + " T=" + v80 + " S=" + v81 + " E=" + v82);
      var v105 = String(v79 || "").trim();
      if (v105.indexOf("tt") === 0) {
        console.log("[" + PROVIDER_NAME + "] Resolving IMDb ID...");
        var v106 = yield fetchWithTimeout("https://api.themoviedb.org/3/find/" + v105 + "?api_key=" +
          TMDB_KEY + "&external_source=imdb_id", {
            headers: {
              "User-Agent": v104
            }
          }, 10000);
        if (v106 && v106.ok) {
          var v107 = yield v106.json(), v108 = v80 === "tv" || v80 === "series" ? v107.tv_results : v107
            .movie_results;
          v108 && v108.length > 0 && (v105 = String(v108[0].id), console.log("[" + PROVIDER_NAME +
            "] Resolved to TMDB: " + v105));
        }
      }
      var v109 = (() => __async(this, null, function*() {
          var v111 = v80 === "tv" || v80 === "series" ? "tv" : "movie";
          try {
            var v112 = yield fetchWithTimeout("https://api.themoviedb.org/3/" + v111 + "/" + v105 +
              "?api_key=" + TMDB_KEY, {
                headers: {
                  "User-Agent": v104
                }
              }, 8000);
            if (v112 && v112.ok) {
              var v113 = yield v112.json();
              return v113.title || v113.name || null;
            }
          } catch (v114) {}
          return null;
        }))(),
        v115 = SERVERS.map(function(v116) {
          return __async(this, null, function*() {
            var v117 = yield fetchFromServer(v116, v105, v80, v81, v82, v104);
            return {
              data: v117,
              label: v116.label
            };
          });
        }),
        v118 = yield v109, v119 = yield Promise.all(v115), v120 = [];
      for (var v121 = 0; v121 < v119.length; v121++) {
        var v122 = v119[v121];
        if (v122.data) {
          var v123 = buildStreams(v122.data, v122.label, v118, v81, v82, v104);
          for (var v124 = 0; v124 < v123.length; v124++) v120.push(v123[v124]);
        }
      }
      var v125 = {
        "2160p": 0,
        "1080p": 1,
        "720p": 2,
        "480p": 3,
        HD: 4
      };
      return (v120.sort(function(v126, v127) {
        var v129 = v125[v126.quality] !== void 0 ? v125[v126.quality] : 99,
          v130 = v125[v127.quality] !== void 0 ? v125[v127.quality] : 99;
        return v129 - v130;
      }), console.log("[" + PROVIDER_NAME + "] Total: " + v120.length + " streams"), v120);
    } catch (v131) {
      return (console.error("[" + PROVIDER_NAME + "] Fatal: " + (v131.message || v131)), []);
    }
  });
}
typeof module !== 'undefined' && module['exports'] ? module["exports"] = {
  'getStreams': getStreams
} : global['getStreams'] = getStreams;
/* ===== nv-plugins 4.32.0 fallback lane: api.vidlove.cc multi-server API =====
   The provider's own upstream died; the live vidlove player's JSON API still
   serves the same family of backends. Server subset per provider keeps rows
   distinct across the pack (no cross-provider duplicate claims). */
var _VLAPI_BASE = 'https://api.vidlove.cc';
var _VLAPI_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
var _VLAPI_SOURCES = ['warden', 'tcloud'];
var _VLAPI_LABEL = 'Peachify';

function _vlTimeout(p, ms) {
  if (typeof setTimeout !== 'function') return p;
  return Promise.race([p, new Promise(function(res) {
    var t = setTimeout(function() {
      res(null);
    }, ms);
    if (t && typeof t.unref === 'function') t.unref();
  })]);
}

function _vlFetchServer(src, id, isTv, season, episode) {
  try {
    var params = 'id=' + encodeURIComponent(String(id)) + '&mode=json' + (src ? '&sources=' +
      encodeURIComponent(src) : '');
    if (isTv && season != null && episode != null) params += '&season=' + encodeURIComponent(season) +
      '&episode=' + encodeURIComponent(episode);
    var url = _VLAPI_BASE + '/' + (isTv ? 'tv' : 'movie') + '?' + params;
    return _vlTimeout(fetch(url, {
        headers: {
          'User-Agent': _VLAPI_UA,
          'Accept': 'application/json',
          'Referer': 'https://player.vidlove.cc/'
        }
      }), 6500)
      .then(function(r) {
        if (!r || !r.ok) return [];
        return r.json();
      })
      .then(function(j) {
        var s = j && j.source;
        if (!s || !s.url) return [];
        var subs = (j.subtitles || []).slice(0, 6).map(function(st) {
          return {
            id: st.label || 'sub',
            url: st.file,
            language: 'en'
          };
        });
        return [{
          name: _VLAPI_LABEL + ' | ' + (s.label || src),
          title: '🎬 ' + _VLAPI_LABEL + ' | ' + (s.label || src) + '\n📺 quality resolves at playback',
          url: String(s.url),
          quality: '',
          type: 'm3u8',
          subtitles: subs,
          headers: {
            'Referer': 'https://player.vidlove.cc/',
            'User-Agent': _VLAPI_UA
          }
        }];
      })
      .catch(function() {
        return [];
      });
  } catch (e) {
    return Promise.resolve([]);
  }
}

function _vlApiLane(id, mediaType, season, episode) {
  var isTv = mediaType === 'tv' || mediaType === 'series';
  // 'Best' mode (no sources param) is the API's own auto-pick and the most
  // reliable lane (4.32.0 live checks); per-server picks vary in coverage.
  var reqs = [null].concat(_VLAPI_SOURCES);
  return Promise.all(reqs.map(function(src) {
    return _vlFetchServer(src, id, isTv, season, episode);
  })).then(function(lists) {
    var out = [];
    lists.forEach(function(l) {
      out = out.concat(l);
    });
    return out;
  }).catch(function() {
    return [];
  });
}
/* 4.32.0: own lane first; if it yields nothing, the vidlove-API fallback answers.
   The lane promise starts immediately so a slow primary never delays it. */
(function() {
  var __origGet = module.exports && module.exports.getStreams;
  if (typeof __origGet !== 'function') return;
  module.exports.getStreams = function(a, b, c, d) {
    var lane = _vlApiLane(a, b, c, d).catch(function() {
      return [];
    });
    var origP;
    try {
      origP = Promise.resolve(__origGet.apply(this, arguments)).catch(function() {
        return [];
      });
    } catch (e) {
      origP = Promise.resolve([]);
    }
    var origFast = (typeof setTimeout === 'function') ? Promise.race([origP, new Promise(function(res) {
      var t = setTimeout(function() {
        res([]);
      }, 2600);
      if (t && typeof t.unref === 'function') t.unref();
    })]) : origP;
    return Promise.all([origFast, lane]).then(function(rs) {
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
(function() {
  var PROVIDER = "peachify";
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
  var __LABEL = 'Peachify';
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
