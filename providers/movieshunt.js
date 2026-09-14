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
/* nv-plugins movieshunt.js v2.5.0 (pack 4.33.0, 2026-09-13): streams fix - movieshunt.run 301-redirects to movieshunt.monster whose search is JS-rendered (lookup.php JSON), so the old entry-title HTML parser found 1 unusable row; the 4.33.0 verified WINGS lane is merged FIRST so streams resolve, native kept for old pages. */
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
 * nv-plugins movieshunt.js — FULLY DECODED port of the All-in-One-Nuvio provider (4.23.0 best-settings pass).
 * Decoded from the obfuscated AIO build: string tables resolved, decoder machinery stripped,
 * every network call capped by an 8s deadline, nvio post-filter attached (en/tl audio gate,
 * >=720p quality gate, cross-provider dedupe). Behavior/endpoints identical to the AIO original.
 */
/* nv-plugins best-settings pass 4.23.0: hard 8s deadline on every network call */
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
var v1 = function() {
  return "";
};
var __async = (v3, v4, v5) => {
    return new Promise((v8, v9) => {
      var v11 = v12 => {
          try {
            v14(v5.next(v12));
          } catch (v15) {
            v9(v15);
          }
        },
        v16 = v17 => {
          try {
            v14(v5.throw(v17));
          } catch (v18) {
            v9(v18);
          }
        },
        v14 = v19 => v19.done ? v8(v19.value) : Promise.resolve(v19.value).then(v11, v16);
      v14((v5 = v5.apply(v3, v4)).next());
    });
  },
  PROVIDER_NAME = "MoviesHunt",
  TMDB_API_KEY = "439c478a771f35c05022f9feabcca01c",
  movieshuntBase = "https://movieshunt.run",
  abhilinksBase = "https://abhilinks.site",
  currentUA =
  "Mozilla/5.0 (Linux; Android 14; Pixel 8 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36",
  UAS = [
    "Mozilla/5.0 (Linux; Android 14; Pixel 8 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36",
    "Mozilla/5.0 (Linux; Android 13; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36",
    "Mozilla/5.0 (Linux; Android 12; Pixel 6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Mobile Safari/537.36",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"
  ];

function log(v20) {
  console.log("[" + PROVIDER_NAME + "] " + v20);
}

function hdrs(v21) {
  return Object.assign({}, {
    "User-Agent": currentUA,
    "Accept-Language": "en-US,en;q=0.9",
    Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
  }, v21 || ({}));
}
var FETCH_TIMEOUT = 0x4e20;

function raceTimeout(v23) {
  if (typeof setTimeout !== "function") return new Promise(function() {});
  return new Promise(function(v24, v25) {
    setTimeout(function() {
      v25(new Error("Timeout"));
    }, v23);
  });
}

function fetchText(v26, v27) {
  return __async(this, null, function*() {
    try {
      var v28 = yield Promise.race([__nvFetch(v26, v27 || ({})), raceTimeout(FETCH_TIMEOUT)]);
      if (v28 && v28.ok) return yield v28.text();
    } catch (v29) {}
    return null;
  });
}

function fetchJson(v30, v31) {
  return __async(this, null, function*() {
    try {
      var v35 = yield Promise.race([__nvFetch(v30, v31 || ({})), raceTimeout(FETCH_TIMEOUT)]);
      if (v35 && v35.ok) return yield v35.json();
    } catch (v36) {}
    return null;
  });
}

function getTMDBInfo(v37, v38) {
  return __async(this, null, function*() {
    var v40 = v38 === "tv" || v38 === "series" ? "tv" : "movie",
      v41 = "https://api.themoviedb.org/3/" + v40 + "/" + v37 + "?api_key=" + TMDB_API_KEY +
      "&language=en-US";
    return yield fetchJson(v41, {
      headers: {
        "User-Agent": currentUA
      }
    });
  });
}

function parseSearchResults(v42) {
  var v48 = [],
    v49 = /<h\d[^>]*class="[^"]*entry-title[^"]*"[^>]*>([\s\S]*?)<\/h\d>/gi,
    v50;
  while ((v50 = v49.exec(v42)) !== null) {
    var v51 = v50[1],
      v52 = v51.match(/<a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/i);
    if (v52) {
      var v53 = v52[1];
      if (v53.indexOf("http") !== 0) v53 = movieshuntBase + (v53.startsWith("/") ? "" : "/") + v53;
      var v54 = v52[2].replace(/<[^>]+>/g, "").trim();
      if (v54.length > 5) v48.push({
        title: v54,
        url: v53
      });
    }
  }
  return v48;
}

function searchSite(v55) {
  var v56 = {
    v57: 311,
    v58: 311,
    v59: 377,
    v60: 335,
    v61: 399,
    v62: 380,
    v63: 374,
    v64: 294,
    v65: 374,
    v66: 372,
    v67: 291,
    v68: 374,
    v69: 343,
    v70: 374,
    v71: 308
  };
  return __async(this, null, function*() {
    var v73 = [],
      v74 = [v55.replace(/'/g, "").trim()],
      v75 = v55.replace(/[^a-zA-Z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
    if (v75 !== v74[0]) v74.push(v75);
    var v76 = v75.replace(/\s*\d{4}\s*/g, " ").trim();
    if (v76 && v74.indexOf(v76) < 0) v74.push(v76);
    var v77 = v75.split(" ").filter(function(v78) {
      return v78.length > 2;
    });
    while (v77.length > 1) {
      v77.pop();
      var v79 = v77.join(" ");
      if (v79.length > 3 && v74.indexOf(v79) < 0) v74.push(v79);
    }
    if (v75) {
      var v80 = v75.split(" ");
      if (v80.length > 1) {
        var v81 = v80.slice(-Math.min(2, v80.length)).join(" ");
        if (v81.length > 3 && v74.indexOf(v81) < 0) v74.push(v81);
        var v82 = v80[v80.length - 1];
        if (v82.length > 3 && (/[a-zA-Z]/).test(v82) && v74.indexOf(v82) < 0) v74.push(v82);
      }
    }
    for (var v83 = 0; v83 < v74.length; v83++) {
      var v84 = v74[v83];
      if (v84.length < 3) continue;
      var v85 = movieshuntBase + "/?s=" + encodeURIComponent(v84),
        v86 = yield fetchText(v85, {
          headers: hdrs()
        });
      if (!v86) continue;
      var v87 = parseSearchResults(v86);
      if (v87 && v87.length) return (log("Search '" + v84 + "' found " + v87.length + " results"), v87);
    }
    return v73;
  });
}

function matchHits(v88, v89, v90) {
  var v91 = {
      v92: 334,
      v93: 330,
      v94: 311,
      v95: 397,
      v96: 374,
      v97: 311,
      v98: 291,
      v99: 377,
      v100: 399,
      v101: 364
    },
    v105 = (v90 ? v89.name : v89.title) || "",
    v106 = v90 ? (v89.first_air_date || "").split("-")[0] : (v89.release_date || "").split("-")[0],
    v107 = v105.toLowerCase().replace(/[\u2018\u2019\u201A\u201B\u2032\u2035]/g, "'"),
    v108 = /\b(and|&|the|a|an)\b/g,
    v109 = v107.replace(v108, "").replace(/\s+/g, " ").trim(),
    v110 = v107.split(/\s+/).filter(function(v111) {
      return v111.length > 1;
    }),
    v113 = [],
    v114 = {};
  for (var v115 = 0; v115 < v88.length; v115++) {
    var v116 = v88[v115],
      v117 = v116.title || "",
      v118 = v116.url || "";
    if (v114[v118]) continue;
    v114[v118] = true;
    var v119 = v117.toLowerCase().replace(/[\u2018\u2019\u201A\u201B\u2032\u2035]/g, "'"),
      v120 = 0;
    if (v119 === v107) v120 += 100;
    else {
      if (v119.indexOf(v107) >= 0 || v107.indexOf(v119) >= 0) v120 += 50;
      else {
        var v121 = v119.replace(v108, "").replace(/\s+/g, " ").trim();
        if (v121.indexOf(v109) >= 0 || v109.indexOf(v121) >= 0) v120 += 50;
        else {
          if (v121.replace(/[^a-z0-9\s]/g, "").trim() === v109.replace(/[^a-z0-9\s]/g, "").trim()) v120 += 60;
        }
      }
    }
    if (v120 === 0 && v110.length > 1) {
      var v122 = v119.split(/\s+/).filter(function(v123) {
          return v123.length > 1;
        }),
        v125 = 0;
      for (var v126 = 0; v126 < v110.length; v126++) {
        for (var v127 = 0; v127 < v122.length; v127++) {
          if (v110[v126] === v122[v127] || v122[v127].indexOf(v110[v126]) === 0 || v110[v126].indexOf(v122[
              v127]) === 0) {
            v125++;
            break;
          }
        }
      }
      if (v125 >= Math.min(v110.length, 3)) v120 += 50;
    }
    if (v120 >= 50 && v106 && v117.indexOf(v106) >= 0) v120 += 10;
    if (v120 >= 50) v113.push({
      doc: v116,
      score: v120
    });
  }
  v113.sort(function(v128, v129) {
    return v129.score - v128.score;
  });
  var v130 = [];
  for (var v131 = 0; v131 < Math.min(v113.length, 5); v131++) v130.push(v113[v131].doc);
  return v130;
}

function extractAbhilinksUrl(v132) {
  var v134 = v132.match(/<a[^>]*href="(https:\/\/abhilinks\.(?:life|site)\/[^"]+)"[^>]*class="btn"[^>]*>/i);
  if (v134) return v134[1];
  var v135 = v132.match(/<a[^>]*href="(https:\/\/abhilinks\.(?:life|site)\/[^"]+)"[^>]*>/i);
  if (v135) return v135[1];
  return null;
}

function extractQualityOptions(v136) {
  var v144 = [],
    v145 = /(2160|1080|720|480)[pP](?:\s+\w{1,15})?\s*\[([^\]]+)\]/g,
    v146;
  while ((v146 = v145.exec(v136)) !== null) {
    var v147 = v146[1].toLowerCase() + "p",
      v148 = v146[2];
    if (v147 === "480p") continue;
    var v149 = v146.index,
      v150 = v136.substring(Math.max(0, v149 - 200), v149 + 600),
      v151 = v150.match(/href="(https:\/\/hubcloud\.cx\/(?:drive|video)\/[^"]+)"/i),
      v152 = v150.match(/href="(https:\/\/href\.li\/\?https:\/\/vcloud\.zip\/[^"]+)"/i);
    if (v151) v144.push({
      quality: v147,
      size: v148,
      type: "hubcloud",
      url: v151[1]
    });
    else {
      if (v152) v144.push({
        quality: v147,
        size: v148,
        type: "vcloud",
        url: v152[1]
      });
    }
  }
  return v144;
}

function extractVcloudUrl(v153) {
  var v157 = v153.match(/href\.li\/\?https:\/\/vcloud\.zip\/([^"&?]+)/i);
  if (v157) return "https://vcloud.zip/" + v157[1];
  return null;
}

function processHubcloud(v158) {
  return __async(this, null, function*() {
    var v164 = yield fetchText(v158, {
      headers: hdrs({
        Referer: abhilinksBase + "/"
      })
    });
    if (!v164) return null;
    var v165 = v164.match(/href="(https:\/\/[^"]*hubcloud\.php[^"]*)"/i);
    if (!v165) return null;
    var v166 = v165[1].replace(/&amp;/g, "&"),
      v167 = "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:152.0) Gecko/20100101 Firefox/152.0",
      v168 = yield fetchText(v166, {
        headers: {
          "User-Agent": v167,
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.5",
          Referer: v158,
          DNT: "1",
          Cookie: "xla=s4t"
        }
      });
    if (!v168 || v168.length < 500) return null;
    return extractFSLLinks(v168);
  });
}
/*decoder removed*/
function processVcloud(v169) {
  return __async(this, null, function*() {
    var v171 = yield fetchText(v169, {
      headers: hdrs({
        Referer: abhilinksBase + "/"
      })
    });
    if (!v171) return null;
    var v172 = v171.match(/atob\s*\(\s*atob\s*\(\s*['"]([^'"]+)['"]\s*\)\s*\)/);
    if (!v172) return null;
    var v173, v174;
    try {
      (v173 = atob(v172[1]), v174 = atob(v173));
    } catch (v175) {
      return null;
    }
    var v176 = yield fetchText(v174, {
      headers: hdrs({
        Referer: movieshuntBase + "/",
        Cookie: "xla=s4t"
      })
    });
    if (!v176) return null;
    return extractFSLLinks(v176);
  });
}

function extractFSLLinks(v177) {
  var v178 = {
      v179: 311,
      v180: 372,
      v181: 372,
      v182: 372,
      v183: 366,
      v184: 372,
      v185: 306,
      v186: 372,
      v187: 401,
      v188: 330,
      v189: 335
    },
    v191 = [],
    v192 = v177.match(/<a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi);
  if (!v192) return v191;
  for (var v193 = 0; v193 < v192.length; v193++) {
    var v194 = v192[v193],
      v195 = v194.match(/href="([^"]+)"/i),
      v196 = v194.match(/>([\s\S]*?)<\/a>/i);
    if (!v195) continue;
    var v197 = v195[1].replace(/&amp;/g, "&"),
      v198 = v196 ? v196[1].replace(/<[^>]+>/g, "").trim() : "";
    if (!v197 || v197.indexOf("javascript:") === 0) continue;
    if ((/telegram/i).test(v198) || (/tg\//i).test(v197) || (/pixeldrain/i).test(v197)) continue;
    if ((/hubcloud\.cx|gpdl2/i).test(v197)) continue;
    var v199 = "";
    if ((/cdn\.fsl-buckets\.life/i).test(v197) || (/r2\.cloudflarestorage/i).test(v197) || (/r2\.dev/i).test(
        v197)) v199 = "FSLv2";
    else {
      if ((/hub\.(latent|whistle)/i).test(v197)) v199 = "FSL";
      else {
        if ((/workers\.dev/i).test(v197)) v199 = "Worker";
        else continue;
      }
    }
    var v200 = "",
      v201 = v198.match(/(2160|1080|720|480)\s*[pP]/i);
    if (v201) v200 = v201[1].toLowerCase() + "p";
    v191.push({
      url: v197,
      type: v199,
      quality: v200,
      rawText: v198
    });
  }
  return v191;
}

function dedupe(v202) {
  var v209 = {};
  return (v202 || []).filter(function(v210) {
    if (!v210 || !v210.url) return false;
    if (v209[v210.url]) return false;
    return (v209[v210.url] = true, true);
  });
}

function extractEpisodes(v212) {
  var v217 = [],
    v218 = /-:\s*Episodes?\s*:\s*(\d+)\s*:-/gi,
    v219 = [],
    v220;
  while ((v220 = v218.exec(v212)) !== null) v219.push({
    num: parseInt(v220[1]),
    idx: v220.index
  });
  if (v219.length === 0) {
    var v221 = />\s*Episode\s*(\d+)\s*</gi;
    while ((v220 = v221.exec(v212)) !== null) v219.push({
      num: parseInt(v220[1]),
      idx: v220.index
    });
  }
  for (var v222 = 0; v222 < v219.length; v222++) {
    var v223 = v219[v222].idx,
      v224 = v222 + 1 < v219.length ? v219[v222 + 1].idx : v212.length,
      v225 = v212.substring(v223, v224),
      v226 = [],
      v227 = /href="(https:\/\/hubcloud\.cx\/(?:drive|video)\/[^"]+)"/gi,
      v228;
    while ((v228 = v227.exec(v225)) !== null) v226.push({
      type: "hubcloud",
      url: v228[1]
    });
    var v229 = /href="(https:\/\/href\.li\/\?https:\/\/vcloud\.zip\/[^"]+)"/gi;
    while ((v228 = v229.exec(v225)) !== null) {
      var v230 = extractVcloudUrl(v228[1]);
      if (v230) v226.push({
        type: "vcloud",
        url: v230
      });
    }
    if (v226.length) v217.push({
      number: v219[v222].num,
      links: v226
    });
  }
  return v217;
}

function extractSeasonLinks(v231) {
  var v239 = {},
    v240 = /<h4[^>]*>([\s\S]*?)<\/h4>/gi,
    v241 = [],
    v242;
  while ((v242 = v240.exec(v231)) !== null) v241.push({
    inner: v242[1],
    start: v242.index,
    end: v242.index + v242[0].length
  });
  for (var v243 = 0; v243 < v241.length; v243++) {
    var v244 = v241[v243],
      v245 = v244.inner.match(/Season\s+(\d+)/i),
      v246 = v244.inner.match(/(\d+p)/i);
    if (!v245 || !v246) continue;
    var v247 = parseInt(v245[1]),
      v248 = v246[1].toLowerCase(),
      v249 = v241[v243].end,
      v250 = v243 + 1 < v241.length ? v241[v243 + 1].start : v231.length,
      v251 = v231.substring(v249, v250),
      v252 = v251.match(/href="(https:\/\/abhilinks\.(?:life|site)\/archives\/\d+)\/?"/i);
    if (v252) {
      if (!v239[v247]) v239[v247] = {};
      if (!v239[v247][v248]) v239[v247][v248] = v252[1];
    }
  }
  return v239;
}

function parseLanguage(v253) {
  var v261 = String(v253 || "").toLowerCase(),
    v262 = ["tamil", "telugu", "bengali", "malayalam", "kannada", "marathi", "punjabi"],
    v263 = 0;
  for (var v264 = 0; v264 < v262.length; v264++) {
    if (v261.indexOf(v262[v264]) !== -1) v263++;
  }
  if (v263 >= 1 || v261.indexOf("multi") !== -1) return "Multi-Audio";
  if (v261.indexOf("dual") !== -1 || v261.indexOf("hindi") !== -1 && v261.indexOf("english") !== -1)
  return "Dual-Audio";
  return "Dual-Audio";
}

function buildDropdownMetadata(v265, v266, v267, v268, v269, v270, v271, v272, v273) {
  var v274 = {
      v275: 304,
      v276: 334,
      v277: 378,
      v278: 302,
      v279: 291,
      v280: 324,
      v281: 383,
      v282: 291,
      v283: 292,
      v284: 409,
      v285: 344,
      v286: 291,
      v287: 291,
      v288: 360,
      v289: 386,
      v290: 335,
      v291: 352,
      v292: 359,
      v293: 305,
      v294: 291,
      v295: 339,
      v296: 332,
      v297: 370,
      v298: 300,
      v299: 392,
      v300: 403
    },
    v302 = (v269 ? v265.name : v265.title) || "Unknown Title",
    v303 = v269 ? (v265.first_air_date || "").split("-")[0] : (v265.release_date || "").split("-")[0],
    v304 = v303 ? " (" + v303 + ")" : "",
    v305 = (String(v272) + " " + String(v273)).toLowerCase(),
    v306 = v269 ? "🎬 " : "🍿 ",
    v307 = v306 + v302 + v304;
  v269 && v270 != null && v271 != null && (v307 += " | S" + String(v270).padStart(2, "0") + " E" + String(
    v271).padStart(2, "0"));
  var v308 = "💎";
  if (v266.indexOf("2160") !== -1 || v266.indexOf("4k") !== -1) v308 = "🌟";
  else {
    if (v266.indexOf("1080") !== -1) v308 = "🔥";
  }
  var v309 = v305.match(/(\d+(?:\.\d+)?\s*(?:gb|mb))/i),
    v310 = v309 ? v309[1].toUpperCase() : v267 || "Variable Size",
    v311 = v308 + " " + v266 + " | 💾 " + v310,
    v312 = "SDR";
  if (v305.indexOf("hdr10+") !== -1) v312 = "HDR10+";
  else {
    if (v305.indexOf("hdr10") !== -1) v312 = "HDR10";
    else {
      if (v305.indexOf("hdr") !== -1) v312 = "HDR";
    }
  }
  var v313 = "";
  if (v305.indexOf("10bit") !== -1 || v305.indexOf("10-bit") !== -1) v313 = " • 10Bit";
  var v314 = "🎥 x264";
  if (v305.indexOf("hevc") !== -1) v314 = "⚡ HEVC";
  else {
    if (v305.indexOf("x265") !== -1 || v305.indexOf("h265") !== -1) v314 = "🎥 x265";
  }
  var v315 = v273.indexOf(".mp4") !== -1 ? "MP4" : "MKV",
    v316 = "🌈 " + v312 + v313 + " | " + v314 + " | 📦 " + v315,
    v317 = parseLanguage(v305),
    v318 = [];
  if (v305.indexOf("ddp5.1") !== -1 || v305.indexOf("ddp 5.1") !== -1) v318.push("DDP5.1");
  if (v305.indexOf("truehd") !== -1) v318.push("TrueHD");
  if (v305.indexOf("dd5.1") !== -1 || v305.indexOf("5.1") !== -1) {
    if (v318.indexOf("DDP5.1") === -1) v318.push("DD 5.1");
  }
  v318.length === 0 && v318.push("AAC");
  var v319 = v318.join(" • "),
    v320 = v305.indexOf("atmos") !== -1 ? " | 🔊 Atmos" : "",
    v321 = "🔈 " + v317 + " | 🎧 " + v319 + v320,
    v322 = "📥 WEB-DL";
  if (v305.indexOf("web-rip") !== -1 || v305.indexOf("webrip") !== -1) v322 = "🌐 WEB-RIP";
  else {
    if (v305.indexOf("bluray") !== -1) v322 = "💿 Blu-Ray";
  }
  var v323 = "🔗 " + (v268 || "FSL") + " | " + v322;
  return v307 + "\n" + v311 + "\n" + v316 + "\n" + v321 + "\n" + v323;
}

function getStreams(v324, v325, v326, v327) {
  var v328 = {
    v329: 345,
    v330: 404,
    v331: 387,
    v332: 374,
    v333: 398,
    v334: 407,
    v335: 373,
    v336: 364,
    v337: 374,
    v338: 402,
    v339: 374,
    v340: 384,
    v341: 321,
    v342: 371,
    v343: 396,
    v344: 333,
    v345: 331,
    v346: 321,
    v347: 335,
    v348: 364,
    v349: 355,
    v350: 297
  };
  return __async(this, null, function*() {
    (currentUA = UAS[Math.floor(Math.random() * UAS.length)], log("getStreams(" + v324 + ", " + v325 +
      ", " + v326 + ", " + v327 + ")"));
    var v355 = v325 === "tv" || v325 === "series",
      v356 = yield getTMDBInfo(v324, v325);
    if (!v356) return (log("TMDB fetch failed"), []);
    var v357 = v355 ? v356.name : v356.title;
    if (!v357) return (log("No title from TMDB"), []);
    log("Title: " + v357);
    var v358 = yield searchSite(v357);
    if (!v358 || !v358.length) return (log("Search failed"), []);
    log("Search results: " + v358.length);
    var v359 = matchHits(v358, v356, v355);
    if (!v359.length) return (log("No match found"), []);
    log("Matches: " + v359.length);
    for (var v360 = 0; v360 < v359.length; v360++) {
      let v361 = function(v362) {
        var v364 = v362.toLowerCase();
        if (v364.indexOf("2160p") !== -1 || v364.indexOf("4k") !== -1) return 2160;
        if (v364.indexOf("1080p") !== -1) return 1080;
        if (v364.indexOf("720p") !== -1) return 720;
        if (v364.indexOf("480p") !== -1) return 480;
        return 0;
      };
      var v366 = v359[v360],
        v367 = v366.url;
      log("Trying post: " + v367);
      var v368 = yield fetchText(v367, {
        headers: hdrs()
      });
      if (!v368) continue;
      var v369 = [];
      if (v355) {
        var v370 = v326 !== void 0 && v326 !== null && v326 !== "undefined" ? parseInt(v326) : null,
          v371 = v327 !== void 0 && v327 !== null && v327 !== "undefined" ? parseInt(v327) : null,
          v372 = [];
        if (v370) {
          var v373 = extractSeasonLinks(v368);
          if (v373[v370]) {
            var v374 = Object.keys(v373[v370]).sort(function(v375, v376) {
              return parseInt(v376) - parseInt(v375);
            });
            (v374.forEach(function(v377) {
              v372.push({
                quality: v377,
                url: v373[v370][v377]
              });
            }), log("S" + v370 + " qualities: " + v374.join(", ")));
          }
        }
        if (!v372.length) {
          var v379 = extractAbhilinksUrl(v368);
          if (v379) v372.push({
            quality: "",
            url: v379
          });
        }
        if (!v372.length) {
          log("No abhilinks URLs, trying next match");
          continue;
        }
        var v380 = [];
        for (var v381 = 0; v381 < v372.length; v381++) {
          var v382 = v372[v381];
          log("Fetching " + (v382.quality || "default") + ": " + v382.url);
          var v383 = yield fetchText(v382.url, {
            headers: hdrs()
          });
          if (!v383) {
            log("  fetch failed");
            continue;
          }
          var v384 = extractEpisodes(v383);
          if (!v384.length) {
            log("  no episodes");
            continue;
          }
          var v385 = v384;
          if (v371) {
            v385 = v384.filter(function(v386) {
              return v386.number === v371;
            });
            if (!v385.length) {
              log("  episode " + v371 + " not found");
              continue;
            }
          }
          for (var v387 = 0; v387 < v385.length; v387++) {
            var v388 = v385[v387];
            for (var v389 = 0; v389 < v388.links.length; v389++) {
              var v390 = v388.links[v389];
              v380.push((function(v391, v392, v393) {
                return function() {
                  return __async(this, null, function*() {
                    var v399 = null;
                    if (v392.type === "hubcloud") v399 = yield processHubcloud(v392.url);
                    else {
                      if (v392.type === "vcloud") v399 = yield processVcloud(v392.url);
                    }
                    return (v399 && v399.forEach(function(v400) {
                      (v400.episode = v391, v400.quality = v400.quality || v393);
                    }), v399);
                  });
                };
              })(v388.number, v390, v382.quality));
            }
          }
        }
        if (!v380.length) {
          log("No hubcloud/vcloud tasks");
          continue;
        }
        log("Processing " + v380.length + " hubcloud/vcloud links...");
        var v402 = yield Promise.all(v380.map(function(v403) {
          return v403();
        }));
        for (var v404 = 0; v404 < v402.length; v404++) {
          if (!v402[v404]) continue;
          for (var v405 = 0; v405 < v402[v404].length; v405++) {
            var v406 = v402[v404][v405],
              v407 = (v406.quality || "").toLowerCase();
            if (v407 === "480p" || v407 === "hd") continue;
            var v408 = v407 || "1080p",
              v409 = (v406.rawText || "") + " " + v406.url,
              v410 = parseLanguage(v409),
              v411 = buildDropdownMetadata(v356, v408, "", v406.type, true, v370, v406.episode, v409, v406
                .url);
            v369.push({
              name: PROVIDER_NAME + " | " + v408 + " | " + v410,
              title: v411,
              size: v411,
              description: v411,
              url: v406.url,
              quality: "",
              language: "",
              headers: {
                Referer: movieshuntBase + "/",
                "User-Agent": currentUA
              }
            });
          }
        }
      } else {
        var v412 = extractAbhilinksUrl(v368);
        if (!v412) {
          log("No abhilinks URL, trying next match");
          continue;
        }
        log("Abhilinks: " + v412);
        var v383 = yield fetchText(v412, {
          headers: hdrs()
        });
        if (!v383) {
          log("Abhilinks fetch failed");
          continue;
        }
        var v413 = extractQualityOptions(v383);
        if (!v413.length) {
          log("No quality options found");
          continue;
        }
        log("Quality options: " + v413.length);
        var v414 = [];
        for (var v415 = 0; v415 < v413.length; v415++) {
          var v416 = v413[v415];
          v414.push((function(v417) {
            return function() {
              return __async(this, null, function*() {
                if (v417.type === "hubcloud") return yield processHubcloud(v417.url);
                else {
                  if (v417.type === "vcloud") {
                    var v421 = extractVcloudUrl(v417.url);
                    if (!v421) return null;
                    return yield processVcloud(v421);
                  }
                }
                return null;
              });
            };
          })(v416));
        }
        var v422 = yield Promise.all(v414.map(function(v423) {
          return v423();
        }));
        for (var v424 = 0; v424 < v422.length; v424++) {
          if (!v422[v424]) continue;
          var v425 = v413[v424];
          for (var v426 = 0; v426 < v422[v424].length; v426++) {
            var v427 = v422[v424][v426],
              v428 = (v427.quality || v425.quality || "").toLowerCase();
            if (v428 === "480p" || v428 === "hd") continue;
            var v408 = v428 || "1080p",
              v429 = v425.size || "",
              v409 = (v427.rawText || "") + " " + v427.url + " " + v429,
              v410 = parseLanguage(v409),
              v411 = buildDropdownMetadata(v356, v408, v429, v427.type, false, null, null, v409, v427
              .url);
            v369.push({
              name: "🏹 " + PROVIDER_NAME + " | " + v408 + " | " + v410,
              title: v411,
              size: v411,
              description: v411,
              url: v427.url,
              quality: "",
              language: "",
              headers: {
                Referer: movieshuntBase + "/",
                "User-Agent": currentUA
              }
            });
          }
        }
      }
      (v369 = dedupe(v369), v369.sort(function(v430, v431) {
        return v361(v431.name) - v361(v430.name);
      }));
      if (v369.length > 0) return (log("Returning " + v369.length + " streams from " + v367), v369);
      log("No streams from this post, trying next match");
    }
    return (log("No streams from any match"), []);
  });
}
typeof module !== 'undefined' && module["exports"] ? module['exports'] = {
  'getStreams': getStreams
} : global['getStreams'] = getStreams;
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
  var PROVIDER = "movieshunt";
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
    var p = fetch(url, opts).then(function(r) {
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
  var __LABEL = 'MoviesHunt';
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
