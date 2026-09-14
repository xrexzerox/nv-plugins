/* nv-plugins moviebox.js v6.0.0 (pack 4.40.0 "all providers readable, no device killer")
 * Clean readable port of Eclipsia (codeberg eclipsia/nuvio-plugin) "Mavonyx." = MovieBox,
 * replacing the 4.39 _0x cinescrape blob. Native lane: api4.aoneroom.com /wefeed-mobile-bff
 * (android app com.community.mbox.in) — x-client-token "<ts>,<md5(reversed ts)>", x-tr-signature
 * "<ts>|2|<b64 hmac-md5(secret, canonical)>" over METHOD\nACCEPT\nCONTENT-TYPE\nBODY-LEN\nTS\n
 * MD5(body)\n<sorted path?query>; bearer token cached from the x-user response header; dub walk
 * search/v2 -> subject get (dubs) -> play-info -> streams / resourceDetectors (+captions).
 * Endpoints: WINGS lane (api.speedracelight.com, device-verified in 4.39) kept FIRST via the
 * waterfall merge; Eclipsia's aoneroom lane replaces the 4.39 pengu.uk cinescrape blob lane.
 * TMDB key 439c478a771f35c05022f9feabcca01c (pack key, not Eclipsia's 307b...).
 * Device fixes: CryptoJS replaced by pure-JS MD5/HMAC-MD5/Base64 (parity-checked vs node:crypto);
 * 403/429 retry sleep() timer-guarded with attempts capped at 2 (Eclipsia called setTimeout
 * directly -> ReferenceError killed the lane); no URL class (manual canonical query sort); JWT
 * expiry via preamble atob; onSettings kept from 4.39 (Audio Preferences langEnglish/langHindi)
 * and mapped onto the dub gate (English lane follows langEnglish, Hindi dub follows langHindi).
 * Structure: header -> preamble -> __nvFetch 8s deadline -> WINGS lane verbatim -> Mavonyx port
 * -> module.exports {getStreams, onSettings} -> nvio post-filter + waterfall merge (as 4.39).
 * Deviations: zero-width inverted-sort tags dropped (4.39 had none, post-filter re-sorts).
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

/* nv-plugins best-settings pass 4.23.0 (kept from 4.39): hard 8s deadline on every
   network call. Exposed as __nvFetch so the WINGS lane and the nvio post-filter
   probe reuse the same bounded fetch. Timer-guarded: the device QuickJS realm
   ships no setTimeout, in which case the plain fetch promise is returned. */
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


/* ===== native lane: clean Eclipsia "Mavonyx." port (MovieBox android app) ==================
 * Pure-JS crypto: the device realm has no CryptoJS and no require(). MD5/HMAC-MD5/Base64 are
 * implemented below (RFC 1321 / RFC 2104) and parity-checked against node:crypto (empty input,
 * "abc", unicode, >64-byte keys). Strings are UTF-8 encoded manually; base64 uses the same
 * alphabet as the preamble polyfills. No TextDecoder, no timers, no URL class. ============ */

var API_BASE = "https://api4.aoneroom.com";
var TMDB_API_URL = "https://api.themoviedb.org/3";
var TMDB_API_KEY = "439c478a771f35c05022f9feabcca01c"; /* pack key (4.39), not Eclipsia's 307b... */
var PACKAGE_INFO = {
  package_name: "com.community.mbox.in",
  version_name: "3.0.03.0529.03",
  version_code: 50020042
};
var BRAND_MODELS = {
  Samsung: ["SM-S918B", "SM-A528B", "SM-M336B"],
  Xiaomi: ["2201117TI", "M2012K11AI"],
  Google: ["Pixel 7", "Pixel 8"]
};
var deviceId = "";
var selectedBrand = "";
var selectedModel = "";
var bearerToken = "";

/* Eclipsia shipped this HMAC-MD5 secret base64-wrapped twice and decoded it with CryptoJS at
 * runtime (KEY_B64_DEFAULT == KEY_B64_ALT == "NzZpUmwwN3MweFNOOWpxbUVXQXQ3OUVCSlp1bElRSXNWNjRGWnIyTw==").
 * Pre-decoded to plain ASCII here (byte-identical value, no base64 needed on device). */
var SECRET_KEY_DEFAULT = "76iRl07s0xSN9jqmEWAt79EBJZulIQIsV64FZr2O";
var SECRET_KEY_ALT = "76iRl07s0xSN9jqmEWAt79EBJZulIQIsV64FZr2O";

var B64_CH = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

function bytesToB64(bytes) {
  var out = "", i;
  for (i = 0; i < bytes.length; i += 3) {
    var b0 = bytes[i], b1 = bytes[i + 1], b2 = bytes[i + 2];
    var has1 = i + 1 < bytes.length, has2 = i + 2 < bytes.length;
    out += B64_CH.charAt(b0 >> 2);
    out += B64_CH.charAt(((b0 & 3) << 4) | (has1 ? b1 >> 4 : 0));
    out += has1 ? B64_CH.charAt(((b1 & 15) << 2) | (has2 ? b2 >> 6 : 0)) : "=";
    out += has2 ? B64_CH.charAt(b2 & 63) : "=";
  }
  return out;
}

function utf8Bytes(str) {
  var out = [], i, c;
  str = String(str);
  for (i = 0; i < str.length; i++) {
    c = str.charCodeAt(i);
    if (c < 0x80) out.push(c);
    else if (c < 0x800) out.push(0xc0 | (c >> 6), 0x80 | (c & 63));
    else if (c >= 0xd800 && c <= 0xdbff && i + 1 < str.length &&
      str.charCodeAt(i + 1) >= 0xdc00 && str.charCodeAt(i + 1) <= 0xdfff) {
      c = 0x10000 + ((c - 0xd800) << 10) + (str.charCodeAt(i + 1) - 0xdc00);
      out.push(0xf0 | (c >> 18), 0x80 | ((c >> 12) & 63), 0x80 | ((c >> 6) & 63), 0x80 | (c & 63));
      i++;
    } else out.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 63), 0x80 | (c & 63));
  }
  return out;
}

var MD5_S = [
  7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22,
  5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20,
  4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23,
  6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21
];
var MD5_K = [
  0xd76aa478, 0xe8c7b756, 0x242070db, 0xc1bdceee, 0xf57c0faf, 0x4787c62a, 0xa8304613, 0xfd469501,
  0x698098d8, 0x8b44f7af, 0xffff5bb1, 0x895cd7be, 0x6b901122, 0xfd987193, 0xa679438e, 0x49b40821,
  0xf61e2562, 0xc040b340, 0x265e5a51, 0xe9b6c7aa, 0xd62f105d, 0x02441453, 0xd8a1e681, 0xe7d3fbc8,
  0x21e1cde6, 0xc33707d6, 0xf4d50d87, 0x455a14ed, 0xa9e3e905, 0xfcefa3f8, 0x676f02d9, 0x8d2a4c8a,
  0xfffa3942, 0x8771f681, 0x6d9d6122, 0xfde5380c, 0xa4beea44, 0x4bdecfa9, 0xf6bb4b60, 0xbebfbc70,
  0x289b7ec6, 0xeaa127fa, 0xd4ef3085, 0x04881d05, 0xd9d4d039, 0xe6db99e5, 0x1fa27cf8, 0xc4ac5665,
  0xf4292244, 0x432aff97, 0xab9423a7, 0xfc93a039, 0x655b59c3, 0x8f0ccc92, 0xffeff47d, 0x85845dd1,
  0x6fa87e4f, 0xfe2ce6e0, 0xa3014314, 0x4e0811a1, 0xf7537e82, 0xbd3af235, 0x2ad7d2bb, 0xeb86d391
];

/** RFC 1321 MD5 over a byte array -> 16 bytes. */
function md5Bytes(msg) {
  function rotl(x, n) { return ((x << n) | (x >>> (32 - n))) >>> 0; }
  var len = msg.length;
  var padded = msg.slice();
  padded.push(0x80);
  while (padded.length % 64 !== 56) padded.push(0);
  var bitLen = len * 8;
  padded.push(bitLen & 255, (bitLen >>> 8) & 255, (bitLen >>> 16) & 255, (bitLen >>> 24) & 255, 0, 0, 0, 0);
  var a0 = 0x67452301, b0 = 0xefcdab89, c0 = 0x98badcfe, d0 = 0x10325476;
  var M = new Array(16);
  for (var off = 0; off < padded.length; off += 64) {
    for (var j = 0; j < 16; j++) {
      var o = off + j * 4;
      M[j] = (padded[o] | (padded[o + 1] << 8) | (padded[o + 2] << 16) | (padded[o + 3] << 24)) >>> 0;
    }
    var A = a0, B = b0, C = c0, D = d0, F, g, i;
    for (i = 0; i < 64; i++) {
      if (i < 16) { F = (B & C) | (~B & D); g = i; }
      else if (i < 32) { F = (D & B) | (~D & C); g = (5 * i + 1) % 16; }
      else if (i < 48) { F = B ^ C ^ D; g = (3 * i + 5) % 16; }
      else { F = C ^ (B | ~D); g = (7 * i) % 16; }
      F = (F + A + MD5_K[i] + M[g]) >>> 0;
      A = D; D = C; C = B;
      B = (B + rotl(F, MD5_S[i])) >>> 0;
    }
    a0 = (a0 + A) >>> 0; b0 = (b0 + B) >>> 0; c0 = (c0 + C) >>> 0; d0 = (d0 + D) >>> 0;
  }
  var out = [], words = [a0, b0, c0, d0], k;
  for (k = 0; k < 4; k++) out.push(words[k] & 255, (words[k] >>> 8) & 255, (words[k] >>> 16) & 255, (words[k] >>> 24) & 255);
  return out;
}

function md5Hex(str) {
  var b = md5Bytes(utf8Bytes(str)), h = "", i;
  for (i = 0; i < b.length; i++) h += (b[i] < 16 ? "0" : "") + b[i].toString(16);
  return h;
}

/** RFC 2104 HMAC-MD5 over UTF-8 strings -> standard Base64 (CryptoJS HmacMD5(...).toString(enc.Base64)). */
function hmacMd5B64(keyStr, msgStr) {
  var key = utf8Bytes(keyStr), msg = utf8Bytes(msgStr), i;
  if (key.length > 64) key = md5Bytes(key);
  var ipad = new Array(64), opad = new Array(64);
  for (i = 0; i < 64; i++) {
    var kb = i < key.length ? key[i] : 0;
    ipad[i] = kb ^ 0x36;
    opad[i] = kb ^ 0x5c;
  }
  var inner = md5Bytes(ipad.concat(msg));
  var outer = md5Bytes(opad.concat(inner));
  return bytesToB64(outer);
}

/* ---------- generic helpers ---------- */

function ensureHttps(url) {
  if (typeof url !== "string") return null;
  if (url.indexOf("http://") === 0) return url.replace("http://", "https://");
  if (url.indexOf("https://") !== 0) return null;
  return url;
}

function settingsObj() {
  try {
    return (typeof SCRAPER_SETTINGS !== "undefined" && SCRAPER_SETTINGS) ? SCRAPER_SETTINGS : {};
  } catch (e) { return {}; }
}

function settingBool(val, dflt) {
  if (val === undefined || val === null) return dflt;
  return val === true || val === "true";
}

/* Eclipsia dub keys (dubHindi/dubTamil/...) kept; the 4.39 pack settings
 * (langEnglish/langHindi from onSettings) are mapped onto them so the shipped
 * Audio Preferences toggles keep working. */
var DUB_LANG_KEYS = {
  "Hindi": "dubHindi",
  "Tamil": "dubTamil",
  "Telugu": "dubTelugu",
  "Arabic": "dubArabic",
  "French": "dubFrench",
  "Español [Latino]": "dubEsLA",
  "Português [Brasil]": "dubPtBR",
  "Español": "dubEs",
  "Português": "dubPt",
  "Turkish": "dubTurkish",
  "Deutsch": "dubDeutsch",
  "Italiano": "dubItaliano",
  "Russian": "dubRussian",
  "Indonesian": "dubIndonesian",
  "Malay": "dubMalay",
  "Bengali": "dubBengali"
};

function isDubEnabled(lang) {
  if (lang === "Original Audio") return true;
  if (lang === "English") return settingBool(settingsObj().langEnglish, true);
  var key = DUB_LANG_KEYS[lang];
  if (!key) return false;
  if (key === "dubHindi") {
    return settingBool(settingsObj().dubHindi, settingBool(settingsObj().langHindi, true));
  }
  return settingBool(settingsObj()[key], false);
}

function resWeight(qualityNum) {
  var q = parseInt(qualityNum, 10) || 0;
  if (q >= 2160) return 5;
  if (q >= 1440) return 4;
  if (q >= 1080) return 3;
  if (q >= 720) return 2;
  if (q >= 480) return 1;
  return 0;
}

function normalizeLang(raw) {
  var s = String(raw || "").trim();
  var key = s.toLowerCase().replace(/\b(dub|dubbed)\b/g, "").replace(/[\s_\-]+/g, "");
  var map = {
    "esla": "Español [Latino]", "espanollatin": "Español [Latino]", "es-la": "Español [Latino]",
    "ptbr": "Português [Brasil]", "portuguesbrasil": "Português [Brasil]", "pt-br": "Português [Brasil]",
    "original": "Original Audio", "en": "English", "english": "English", "hindi": "Hindi", "hi": "Hindi",
    "tamil": "Tamil", "ta": "Tamil", "telugu": "Telugu", "te": "Telugu", "arabic": "Arabic", "ar": "Arabic",
    "french": "French", "fr": "French", "spanish": "Español", "es": "Español", "portuguese": "Português",
    "pt": "Português", "turkish": "Turkish", "tr": "Turkish", "german": "Deutsch", "de": "Deutsch",
    "italian": "Italiano", "it": "Italiano", "russian": "Russian", "ru": "Russian",
    "indonesian": "Indonesian", "id": "Indonesian", "malay": "Malay", "ms": "Malay",
    "bengali": "Bengali", "bn": "Bengali"
  };
  return map[key] || s;
}

function normalizeTitle(s) {
  if (!s) return "";
  return s
    .replace(/\[.*?\]/g, " ")
    .replace(/\(.*?\)/g, " ")
    .replace(/\b(dub|dubbed|hd|4k|hindi|tamil|telugu|dual audio)\b/gi, " ")
    .trim()
    .toLowerCase()
    .replace(/:/g, " ")
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ");
}

function parseQualityNumber(value) {
  var match = String(value || "").match(/(\d{3,4})/);
  return match ? parseInt(match[1], 10) : 0;
}

function getFormatType(url) {
  var u = String(url || "").toLowerCase();
  if (u.indexOf(".mpd") !== -1) return "DASH";
  if (u.indexOf(".m3u8") !== -1) return "HLS";
  if (u.indexOf(".mp4") !== -1) return "MP4";
  if (u.indexOf(".mkv") !== -1) return "MKV";
  return "VIDEO";
}

/* Update-notice / version-gate videos are app maintenance payloads, not content. */
function isUpdateVideo(url) {
  if (!url) return false;
  var u = String(url).toLowerCase();
  var tokens = ["update", "upgrade", "notice", "force_up", "forceup", "version_limit", "ver_limit",
    "low_version", "lowversion", "outdated", "please_update", "pleaseupdae", "app_update",
    "newversion", "new_version", "version_check", "vercheck", "updateapp", "update_app",
    "versiongate", "ver_gate", "ver-gate", "upgrade_notice", "needupgrade", "need_upgrade",
    "needupdate", "need_update"];
  for (var i = 0; i < tokens.length; i++) {
    if (u.indexOf(tokens[i]) !== -1) return true;
  }
  return false;
}

var UPDATE_CODES = {
  "VERSION_TOO_LOW": 1, "NEED_UPDATE": 1, "FORCE_UPDATE": 1, "LOW_VERSION": 1,
  "APP_UPDATE_REQUIRED": 1, "CLIENT_OUTDATED": 1, "UPGRADE_REQUIRED": 1,
  "VERSION_EXPIRED": 1, "OUTDATED_VERSION": 1
};
var UPDATE_MSG_RE = /update|upgrade|version.*low|outdated|force.*update|please.*update/i;

function isVersionGatedResponse(responseData) {
  if (!responseData || typeof responseData !== "object") return false;
  var code = responseData.code;
  if (code !== undefined) {
    if (UPDATE_CODES[String(code).toUpperCase()]) return true;
    if (typeof code === "number" && (code === 4031 || code === 4032 || code === 4033)) return true;
  }
  var keys = ["message", "msg", "reason", "error", "err", "errorMsg", "errMsg"];
  for (var i = 0; i < keys.length; i++) {
    var val = responseData[keys[i]];
    if (typeof val === "string" && UPDATE_MSG_RE.test(val)) return true;
  }
  return false;
}

/* ---------- signing / auth ---------- */

function decodeJwtExpiry(token) {
  try {
    var parts = String(token).split(".");
    if (parts.length < 2) return 0;
    var b64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    while (b64.length % 4) b64 += "=";
    var bin = atob(b64); /* preamble polyfill */
    var json = JSON.parse(bin);
    return json.exp || 0;
  } catch (e) {
    return 0;
  }
}

function isTokenValid(token) {
  if (!token) return false;
  return decodeJwtExpiry(token) > Date.now() / 1000 + 3600;
}

function initializeSession() {
  if (!deviceId) {
    var chars = "0123456789abcdef";
    for (var i = 0; i < 32; i++) deviceId += chars.charAt(Math.floor(Math.random() * 16));
    var brands = Object.keys(BRAND_MODELS);
    selectedBrand = brands[Math.floor(Math.random() * brands.length)];
    selectedModel = BRAND_MODELS[selectedBrand][Math.floor(Math.random() * BRAND_MODELS[selectedBrand].length)];
  }
}

function generateXClientToken(timestamp) {
  var ts = String(timestamp || Date.now());
  var reversed = ts.split("").reverse().join("");
  return ts + "," + md5Hex(reversed);
}

/* Canonical request string. Eclipsia used the URL class inside try/catch; the device realm
 * has no URL, so the manual parse below is the single code path on node AND device
 * (pathname + query pairs sorted by key, per-key value order preserved). */
function buildCanonicalString(method, accept, contentType, url, body, timestamp) {
  var path = String(url || "").replace(/^https?:\/\/[^\/]+/, "");
  var query = "";
  var qi = path.indexOf("?");
  if (qi >= 0) {
    query = path.substring(qi + 1);
    path = path.substring(0, qi);
    var keys = [], byKey = {};
    String(query).split("&").forEach(function (pair) {
      if (!pair) return;
      var k = pair.split("=")[0];
      if (!byKey[k]) { byKey[k] = []; keys.push(k); }
      byKey[k].push(pair);
    });
    keys.sort();
    query = keys.map(function (k) { return byKey[k].join("&"); }).join("&");
  }
  var bodyHash = body ? md5Hex(String(body)) : "";
  var bodyLength = body ? String(utf8Bytes(String(body)).length) : "";
  var canonicalUrl = query ? path + "?" + query : path;
  return [
    String(method).toUpperCase(),
    accept || "",
    contentType || "",
    bodyLength,
    String(timestamp),
    bodyHash,
    canonicalUrl
  ].join("\n");
}

function generateXTrSignature(method, accept, contentType, url, body, useAltKey, customTimestamp) {
  var timestamp = customTimestamp || Date.now();
  var canonical = buildCanonicalString(method, accept, contentType, url, body, timestamp);
  return timestamp + "|2|" + hmacMd5B64(useAltKey ? SECRET_KEY_ALT : SECRET_KEY_DEFAULT, canonical);
}

/* Device fix: Eclipsia awaited `new Promise(r => setTimeout(r, 1000))` on 403/429 but the
 * QuickJS realm has no setTimeout -> ReferenceError killed the lane. Timer-guarded sleep
 * retries immediately when no timers exist. */
function sleep(ms) {
  return typeof setTimeout === "function"
    ? new Promise(function (r) {
      var t = setTimeout(r, ms);
      if (t && typeof t.unref === "function") t.unref();
    })
    : Promise.resolve();
}

function captureToken(headers) {
  try {
    if (!headers || typeof headers.get !== "function") return;
    var xUser = headers.get("x-user");
    if (!xUser) return;
    var parsed = JSON.parse(xUser);
    if (parsed && parsed.token && isTokenValid(parsed.token)) bearerToken = parsed.token;
  } catch (e) { }
}

function mavonyxRequest(method, url, body, customHeaders, isTokenFetch) {
  customHeaders = customHeaders || {};
  try { initializeSession(); } catch (e) { }
  var validatedUrl = ensureHttps(url);
  if (!validatedUrl) return Promise.resolve(null);
  var timestamp = Date.now();
  var headerContentType = customHeaders["Content-Type"] || (body ? "application/json; charset=utf-8" : "application/json");
  var accept = customHeaders["Accept"] || "application/json";
  var xClientInfo = JSON.stringify({
    package_name: PACKAGE_INFO.package_name,
    version_name: PACKAGE_INFO.version_name,
    version_code: PACKAGE_INFO.version_code,
    os: "android",
    os_version: "15",
    device_id: deviceId,
    install_store: "ps",
    gaid: "d7578036d13336cc",
    brand: selectedBrand.toLowerCase(),
    model: selectedModel,
    system_language: "en",
    net: "NETWORK_WIFI",
    region: "IN",
    timezone: "Asia/Calcutta",
    sp_code: ""
  });
  var headers = {
    "Accept": accept,
    "Content-Type": headerContentType,
    "x-client-token": generateXClientToken(timestamp),
    "x-tr-signature": generateXTrSignature(method, accept, headerContentType, validatedUrl, body, false, timestamp),
    "User-Agent": PACKAGE_INFO.package_name + "/" + PACKAGE_INFO.version_code +
      " (Linux; U; Android 15; en_IN; " + selectedModel + "; Build/AP3A.240905.015; Cronet/133.0.6876.3)",
    "x-client-info": xClientInfo,
    "x-client-status": "1"
  };
  var pre;
  if (isTokenFetch) {
    pre = Promise.resolve("");
  } else {
    pre = getCachedToken().catch(function () { return ""; });
  }
  return pre.then(function (token) {
    if (token) headers["Authorization"] = "Bearer " + token;
    var options = { method: method, headers: headers };
    if (body) options.body = body;
    var attempts = 2; /* hard cap: 1 immediate retry on 403/429 or network error */
    function attempt() {
      return __nvFetch(validatedUrl, options).then(function (res) {
        if (!res || !res.ok) {
          var status = res ? res.status : 0;
          if (status === 403 || status === 429) {
            attempts--;
            if (attempts <= 0) return null;
            return sleep(1000).then(attempt);
          }
          return null;
        }
        return res.text().then(function (text) {
          var parsed;
          try { parsed = JSON.parse(text); } catch (e) { parsed = text; }
          captureToken(res.headers);
          return { data: parsed, headers: res.headers };
        }, function () { return null; });
      }, function () {
        attempts--;
        if (attempts <= 0) return null;
        return attempt();
      });
    }
    return attempt();
  }, function () { return null; });
}

function getCachedToken() {
  if (isTokenValid(bearerToken)) return Promise.resolve(bearerToken);
  var url = API_BASE + "/wefeed-mobile-bff/tab/ranking-list?tabId=0&categoryType=4516404531735022304&page=1&perPage=1";
  return mavonyxRequest("GET", url, null, {}, true).then(function (res) {
    if (res && res.headers) captureToken(res.headers);
    return bearerToken || "";
  });
}

/* ---------- TMDB ---------- */

function fetchTmdbDetails(tmdbId, mediaType) {
  var endpoint = mediaType === "tv" ? "tv" : "movie";
  var url = TMDB_API_URL + "/" + endpoint + "/" + tmdbId + "?api_key=" + TMDB_API_KEY + "&append_to_response=external_ids";
  return __nvFetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36",
      "Accept": "application/json"
    }
  }).then(function (res) {
    if (!res || !res.ok) return null;
    return res.json();
  }).then(function (data) {
    if (!data) return null;
    return {
      title: mediaType === "movie" ? (data.title || data.original_title) : (data.name || data.original_name),
      year: String(data.release_date || data.first_air_date || "").substring(0, 4),
      originalTitle: data.original_title || data.original_name || null
    };
  }).catch(function () { return null; });
}

/* ---------- MovieBox lanes ---------- */

function searchMavonyx(query) {
  var url = API_BASE + "/wefeed-mobile-bff/subject-api/search/v2";
  var body = JSON.stringify({ page: 1, perPage: 20, keyword: query });
  return mavonyxRequest("POST", url, body).then(function (response) {
    var out = [];
    try {
      var groups = response && response.data && response.data.data && response.data.data.results;
      if (Array.isArray(groups)) {
        groups.forEach(function (group) {
          if (group && Array.isArray(group.subjects)) out = out.concat(group.subjects);
        });
      }
    } catch (e) { }
    return out;
  }, function () { return []; });
}

function findBestMatch(subjects, tmdbTitle, tmdbYear, mediaType) {
  var normTmdbTitle = normalizeTitle(tmdbTitle);
  var targetType = mediaType === "movie" ? 1 : 2;
  var bestMatch = null;
  var bestScore = 0;
  if (!Array.isArray(subjects)) return null;
  subjects.forEach(function (subject) {
    if (!subject || subject.subjectType !== targetType) return;
    var normTitle = normalizeTitle(subject.title);
    var year = subject.year || (subject.releaseDate ? String(subject.releaseDate).substring(0, 4) : null);
    var score = 0;
    if (normTitle === normTmdbTitle) score += 50;
    else if (normTitle.indexOf(normTmdbTitle) !== -1 || normTmdbTitle.indexOf(normTitle) !== -1) score += 15;
    if (tmdbYear && year && tmdbYear == year) score += 35;
    if (score > bestScore) {
      bestScore = score;
      bestMatch = subject;
    }
  });
  return bestScore >= 40 ? bestMatch : null;
}

function fetchSubtitles(subjectId, streamId, langLabel) {
  var subtitles = [];
  function collect(url) {
    return mavonyxRequest("GET", url, null).then(function (res) {
      try {
        var caps = res && res.data && res.data.data && res.data.data.extCaptions;
        if (Array.isArray(caps)) {
          caps.slice(0, 12).forEach(function (cap) { /* hard cap */
            if (!cap || !cap.url) return;
            var secureUrl = ensureHttps(cap.url);
            if (!secureUrl) return;
            subtitles.push({
              url: secureUrl,
              language: cap.lan || cap.lanName || cap.language || "en",
              name: (cap.lanName || cap.lan || cap.language || "Subtitle") + " (" + langLabel + ")",
              headers: { "Referer": API_BASE }
            });
          });
        }
      } catch (e) { }
    }, function () { });
  }
  var capUrl = API_BASE + "/wefeed-mobile-bff/subject-api/get-stream-captions?subjectId=" + subjectId + "&streamId=" + streamId;
  var extUrl = API_BASE + "/wefeed-mobile-bff/subject-api/get-ext-captions?subjectId=" + subjectId + "&resourceId=" + streamId + "&episode=0";
  return collect(capUrl)
    .then(function () { return collect(extUrl); })
    .then(function () { return subtitles; }, function () { return subtitles; });
}

function buildMavonyxRow(streamUrl, formatType, qualNum, lang, signCookie, subjectId, streamId) {
  var quality = qualNum ? qualNum + "p • " + formatType : "Auto • " + formatType;
  var streamTitle = "MovieBox • " + lang;
  var row = {
    name: streamTitle,
    title: streamTitle,
    url: streamUrl,
    quality: quality,
    headers: formatType === "MP4"
      ? (signCookie ? { "Cookie": signCookie } : {})
      : {
        "Referer": API_BASE,
        "User-Agent": PACKAGE_INFO.package_name + "/" + PACKAGE_INFO.version_code +
          " (Linux; U; Android 15; en_IN; MovieBox; Build/AP3A.240905.015; Cronet/133.0.6876.3)"
      }
  };
  if (!streamId) return Promise.resolve(row);
  return fetchSubtitles(subjectId, streamId, lang).then(function (subs) {
    row.subtitles = subs;
    return row;
  }, function () { return row; });
}

function playInfoRows(item, season, episode) {
  var playUrl = API_BASE + "/wefeed-mobile-bff/subject-api/play-info?subjectId=" + item.id + "&se=" + (season || 0) + "&ep=" + (episode || 0);
  return mavonyxRequest("GET", playUrl, null).then(function (playRes) {
    if (!playRes || !playRes.data) return [];
    if (isVersionGatedResponse(playRes.data)) return [];
    var playData = playRes.data.data;
    if (!playData) return [];
    if (playData.needUpdate === true || playData.forceUpdate === true || isVersionGatedResponse(playData)) return [];
    var rows = [];
    var pending = [];
    var streamsList = Array.isArray(playData.streams) ? playData.streams : null;
    if (streamsList) {
      streamsList.slice(0, 12).forEach(function (stream) { /* hard cap */
        if (!stream || !stream.url) return;
        var secureUrl = ensureHttps(stream.url);
        if (!secureUrl || isUpdateVideo(secureUrl)) return;
        var formatType = getFormatType(secureUrl);
        var qualNum = parseQualityNumber(stream.resolutions || stream.quality || "");
        if (qualNum > 0 && qualNum < 720) return; /* no rows below 720p */
        var streamId = stream.id || (item.id + "|" + season + "|" + episode);
        pending.push(buildMavonyxRow(secureUrl, formatType, qualNum, item.lang, stream.signCookie, item.id, streamId));
      });
    } else if (Array.isArray(playData.resourceDetectors)) {
      playData.resourceDetectors.forEach(function (detector) {
        if (!detector || !Array.isArray(detector.resolutionList)) return;
        detector.resolutionList.slice(0, 12).forEach(function (video) { /* hard cap */
          if (!video || !video.resourceLink) return;
          var secureUrl = ensureHttps(video.resourceLink);
          if (!secureUrl || isUpdateVideo(secureUrl)) return;
          var formatType = getFormatType(secureUrl);
          var qualNum = parseQualityNumber(video.resolution);
          if (qualNum > 0 && qualNum < 720) return; /* no rows below 720p */
          rows.push(buildMavonyxRow(secureUrl, formatType, qualNum, item.lang, null, null, null));
        });
      });
    }
    return Promise.all(pending).then(function (resolved) {
      return rows.concat(resolved);
    }, function () { return rows; });
  }, function () { return []; });
}

function getStreamLinks(subjectId, season, episode) {
  var subjectUrl = API_BASE + "/wefeed-mobile-bff/subject-api/get?subjectId=" + subjectId;
  return mavonyxRequest("GET", subjectUrl, null).then(function (detailRes) {
    if (!detailRes || !detailRes.data || !detailRes.data.data) return [];
    var data = detailRes.data.data;
    var subjectIds = [];
    var originalLang = "Original";
    var dubs = data.dubs;
    if (Array.isArray(dubs)) {
      dubs.forEach(function (dub) {
        if (!dub) return;
        if (dub.subjectId == subjectId) originalLang = dub.lanName || "Original";
        else subjectIds.push({ id: dub.subjectId, lang: normalizeLang(dub.lanName || "Unknown") });
      });
    }
    subjectIds.unshift({ id: subjectId, lang: normalizeLang(originalLang) });
    var filtered = subjectIds.filter(function (item) {
      var lang = String(item.lang || "").toLowerCase();
      return lang.indexOf("sub") === -1 && isDubEnabled(item.lang);
    }).slice(0, 8); /* hard cap: at most 8 audio lanes per call */
    var chain = Promise.resolve([]);
    filtered.forEach(function (item) {
      chain = chain.then(function (all) {
        return playInfoRows(item, season, episode).then(function (rows) {
          return all.concat(rows);
        }, function () { return all; });
      });
    });
    return chain.then(function (allStreams) {
      var seen = {}, out = [];
      allStreams.forEach(function (s) {
        if (!s || !s.url || seen[s.url]) return;
        seen[s.url] = 1;
        out.push({
          name: s.name,
          title: s.title,
          url: s.url,
          quality: s.quality,
          headers: s.headers,
          subtitles: s.subtitles
        });
      });
      out.sort(function (a, b) { return resWeight(parseQualityNumber(b.quality)) - resWeight(parseQualityNumber(a.quality)); });
      return out;
    });
  }, function () { return []; });
}

function getStreams(tmdbId, mediaType, season, episode) {
  try {
    if (mediaType === "tv" && (season == null || episode == null)) return Promise.resolve([]);
    var s = mediaType === "tv" ? season : 0;
    var e = mediaType === "tv" ? episode : 0;
    return fetchTmdbDetails(tmdbId, mediaType).then(function (details) {
      if (!details || !details.title) return [];
      return searchMavonyx(details.title).then(function (subjects) {
        var best = findBestMatch(subjects, details.title, details.year, mediaType);
        if (best) return getStreamLinks(best.subjectId, s, e);
        if (details.originalTitle && details.originalTitle !== details.title) {
          return searchMavonyx(details.originalTitle).then(function (subjects2) {
            var best2 = findBestMatch(subjects2, details.originalTitle, details.year, mediaType);
            return best2 ? getStreamLinks(best2.subjectId, s, e) : [];
          });
        }
        return [];
      });
    });
  } catch (e) {
    return Promise.resolve([]);
  }
}

/* onSettings kept byte-for-byte from the 4.39 build (Audio Preferences). */
async function onSettings() {
  return [
    { type: "header", label: "Audio Preferences" },
    { type: "toggle", key: "langEnglish", label: "Enable English 🇺🇸", defaultValue: true },
    { type: "toggle", key: "langHindi", label: "Enable Hindi 🇮🇳", defaultValue: true }
  ];
}

module.exports = { getStreams: getStreams, onSettings: onSettings };


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
  var __LABEL = 'MovieBox';
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
