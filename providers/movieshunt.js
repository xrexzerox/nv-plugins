/* nv-plugins movieshunt.js v6.0.0 (pack 4.40.0 "all providers readable, no device killer")
 * Clean readable port of Eclipsia (codeberg eclipsia/nuvio-plugin) "Kryxalia." = MoviesHunt,
 * replacing the machine-renamed (v-name) 4.39 build. Endpoints kept from the device-verified
 * 4.39 file: https://movieshunt.run (WordPress ?s= search -> post pages) -> https://abhilinks.site
 * (.life accepted) quality/episode archives -> hubcloud.cx / vcloud.zip (href.li bypass) ->
 * FSL hosts (cdn.fsl-buckets.life, r2.cloudflarestorage, r2.dev, hub.latent|whistle, *.workers.dev).
 * TMDB api.themoviedb.org/3 key 439c478a771f35c05022f9feabcca01c (pack key). Row naming kept
 * from 4.39 ("MoviesHunt | <quality> | <audio>" + emoji dropdown title).
 * Lanes: proven WINGS text lane (api.speedracelight.com / vidking) FIRST, native scraper fallback.
 * Device notes: preamble polyfills (atob/btoa/URLSearchParams), no require/cheerio/TextDecoder,
 *   no unguarded timers, 8s fetch deadline, hard caps on queries/matches/options/episodes,
 *   nvio post-filter (>=720p, en/tl gate, dedupe) + waterfall merge appended below.
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
/* ===== nv-plugins movieshunt native lane v6.0.0 (readable Eclipsia "Kryxalia." port) =====
   Flow (kryxalia.js): TMDB info -> site search (?s=, capped query variants, batch of 3,
   first hit wins) -> scored post match -> abhilinks archive -> hubcloud/vcloud resolvers
   -> FSL host links. 4.39 device behavior kept: sequential match walk with early exit,
   rows >=720p only, "MoviesHunt | quality | audio" names + emoji dropdown titles. */
'use strict';

var PROVIDER_NAME = 'MoviesHunt';
var TMDB_API_URL = 'https://api.themoviedb.org/3';
var TMDB_API_KEY = '439c478a771f35c05022f9feabcca01c'; /* pack key (4.39 device-verified) */
var MOVIESHUNT_BASE = 'https://movieshunt.run';
var ABHILINKS_BASE = 'https://abhilinks.site';

/* hard caps: the device bridge serializes fetches, so every fan-out is bounded */
var MAX_SEARCH_QUERIES = 9; /* query variants sent to the site search */
var MAX_MATCHES = 5; /* scored post candidates (walked sequentially, first hit returns) */
var MAX_QUALITY_OPTIONS = 4; /* hubcloud/vcloud resolvers per movie post */
var MAX_EPISODES = 3; /* TV: episodes resolved when no episode filter is given */
var MAX_LINKS_PER_EPISODE = 4; /* hubcloud/vcloud links resolved per episode */

var UAS = [
  'Mozilla/5.0 (Linux; Android 14; Pixel 8 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36',
  'Mozilla/5.0 (Linux; Android 13; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36',
  'Mozilla/5.0 (Linux; Android 12; Pixel 6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Mobile Safari/537.36',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
];
var currentUA = UAS[0];

function log(msg) {
  try { console.log('[MoviesHunt] ' + msg); } catch (e) { /* console may be absent */ }
}

function hdrs(extra) {
  return Object.assign({}, {
    'User-Agent': currentUA,
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
  }, extra || {});
}

/* every fetch: response.ok check + fail-soft (null on any error, 8s deadline via __nvFetch) */
function fetchText(url, options) {
  return __nvFetch(url, options || {}).then(function (res) {
    return res && res.ok ? res.text() : null;
  }, function () { return null; });
}

function fetchJson(url, options) {
  return __nvFetch(url, options || {}).then(function (res) {
    return res && res.ok ? res.json() : null;
  }, function () { return null; });
}

function getTMDBInfo(tmdbId, mediaType) {
  var type = mediaType === 'tv' ? 'tv' : 'movie';
  var url = TMDB_API_URL + '/' + type + '/' + tmdbId + '?api_key=' + TMDB_API_KEY + '&language=en-US';
  return fetchJson(url, { headers: { 'User-Agent': currentUA } });
}

function resWeight(quality) {
  var q = String(quality || '').toLowerCase();
  if (q.indexOf('2160') !== -1 || q.indexOf('4k') !== -1) return 5;
  if (q.indexOf('1440') !== -1) return 4;
  if (q.indexOf('1080') !== -1) return 3;
  if (q.indexOf('720') !== -1) return 2;
  return 0;
}

/* ---------- site search ---------- */

function parseSearchResults(html) {
  var results = [];
  var headingRegex = /<h\d[^>]*class="[^"]*entry-title[^"]*"[^>]*>([\s\S]*?)<\/h\d>/gi;
  var match;
  while ((match = headingRegex.exec(html)) !== null) {
    var linkMatch = match[1].match(/<a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/i);
    if (!linkMatch) continue;
    var url = linkMatch[1];
    if (url.indexOf('http') !== 0) url = MOVIESHUNT_BASE + (url.indexOf('/') === 0 ? '' : '/') + url;
    var title = linkMatch[2].replace(/<[^>]+>/g, '').trim();
    if (title.length > 5) results.push({ title: title, url: url });
  }
  return results;
}

/* resolves with the first non-empty result; rejects only when every promise is empty */
function firstSuccess(promises, isEmpty) {
  return new Promise(function (resolve, reject) {
    var pending = promises.length;
    if (!pending) { reject(null); return; }
    for (var i = 0; i < promises.length; i++) {
      Promise.resolve(promises[i]).then(function (val) {
        if (!isEmpty(val)) resolve(val);
        else if (--pending === 0) reject(null);
      }, function () {
        if (--pending === 0) reject(null);
      });
    }
  });
}

function buildSearchQueries(title) {
  var queries = [String(title).replace(/'/g, '').trim()];
  var cleaned = String(title).replace(/[^a-zA-Z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
  if (cleaned && queries.indexOf(cleaned) === -1) queries.push(cleaned);
  var noYear = cleaned.replace(/\s*\d{4}\s*/g, ' ').trim();
  if (noYear && queries.indexOf(noYear) === -1) queries.push(noYear);
  var words = cleaned.split(' ').filter(function (w) { return w.length > 2; });
  var copy = words.slice();
  while (copy.length > 1) { /* shrink: full title, then progressively shorter prefixes */
    copy.pop();
    var partial = copy.join(' ');
    if (partial.length > 3 && queries.indexOf(partial) === -1) queries.push(partial);
  }
  if (cleaned) {
    var parts = cleaned.split(' ');
    if (parts.length > 1) {
      var lastTwo = parts.slice(-Math.min(2, parts.length)).join(' ');
      if (lastTwo.length > 3 && queries.indexOf(lastTwo) === -1) queries.push(lastTwo);
      var lastWord = parts[parts.length - 1];
      if (lastWord.length > 3 && /[a-zA-Z]/.test(lastWord) && queries.indexOf(lastWord) === -1)
        queries.push(lastWord);
    }
  }
  return queries.filter(function (q) { return q.length >= 3; }).slice(0, MAX_SEARCH_QUERIES);
}

async function searchSite(title) {
  var queries = buildSearchQueries(title);
  var BATCH = 3;
  for (var i = 0; i < queries.length; i += BATCH) {
    var batch = queries.slice(i, i + BATCH);
    try {
      var results = await firstSuccess(batch.map(function (q) {
        return fetchText(MOVIESHUNT_BASE + '/?s=' + encodeURIComponent(q), { headers: hdrs() })
          .then(function (html) { return html ? parseSearchResults(html) : []; });
      }), function (val) { return !val || !val.length; });
      if (results && results.length) {
        log("search '" + batch.join("'/") + "' -> " + results.length + ' results');
        return results;
      }
    } catch (e) { /* batch empty -> next batch */ }
  }
  return [];
}

/* ---------- post matching (kryxalia scoring) ---------- */

function matchHits(results, tmdbInfo, isSeries) {
  var tmdbTitle = (isSeries ? tmdbInfo.name : tmdbInfo.title) || '';
  var tmdbYear = isSeries
    ? (tmdbInfo.first_air_date || '').split('-')[0]
    : (tmdbInfo.release_date || '').split('-')[0];

  var titleLower = tmdbTitle.toLowerCase().replace(/[\u2018\u2019\u201A\u201B\u2032\u2035]/g, "'");
  var stopWords = /\b(and|&|the|a|an)\b/g;
  var titleNoStops = titleLower.replace(stopWords, '').replace(/\s+/g, ' ').trim();
  var titleWords = titleLower.split(/\s+/).filter(function (w) { return w.length > 1; });

  var scored = [];
  var seen = {};
  for (var i = 0; i < results.length; i++) {
    var result = results[i];
    if (seen[result.url]) continue;
    seen[result.url] = true;

    var resultLower = String(result.title || '').toLowerCase()
      .replace(/[\u2018\u2019\u201A\u201B\u2032\u2035]/g, "'");
    var score = 0;
    if (resultLower === titleLower) score += 100;
    else if (resultLower.indexOf(titleLower) !== -1 || titleLower.indexOf(resultLower) !== -1) score += 50;
    else {
      var resultNoStops = resultLower.replace(stopWords, '').replace(/\s+/g, ' ').trim();
      if (resultNoStops.indexOf(titleNoStops) !== -1 || titleNoStops.indexOf(resultNoStops) !== -1) score += 50;
      else if (resultNoStops.replace(/[^a-z0-9\s]/g, '').trim() === titleNoStops.replace(/[^a-z0-9\s]/g, '').trim()) score += 60;
    }
    if (score === 0 && titleWords.length > 1) { /* word-prefix overlap fallback */
      var resultWords = resultLower.split(/\s+/).filter(function (w) { return w.length > 1; });
      var matches = 0;
      for (var tw = 0; tw < titleWords.length; tw++) {
        for (var rw = 0; rw < resultWords.length; rw++) {
          if (titleWords[tw] === resultWords[rw] ||
            resultWords[rw].indexOf(titleWords[tw]) === 0 ||
            titleWords[tw].indexOf(resultWords[rw]) === 0) { matches++; break; }
        }
      }
      if (matches >= Math.min(titleWords.length, 3)) score += 50;
    }
    if (score >= 50 && tmdbYear && result.title.indexOf(tmdbYear) !== -1) score += 10;
    if (score >= 50) scored.push({ doc: result, score: score });
  }

  scored.sort(function (a, b) { return b.score - a.score; });
  return scored.slice(0, MAX_MATCHES).map(function (s) { return s.doc; });
}

/* ---------- abhilinks archive parsing ---------- */

function extractAbhilinksUrl(html) {
  var btn = html.match(/<a[^>]*href="(https:\/\/abhilinks\.(?:life|site)\/[^"]+)"[^>]*class="btn"[^>]*>/i);
  if (btn) return btn[1];
  var any = html.match(/<a[^>]*href="(https:\/\/abhilinks\.(?:life|site)\/[^"]+)"[^>]*>/i);
  return any ? any[1] : null;
}

function extractQualityOptions(html) {
  var options = [];
  var qualityRegex = /(2160|1080|720|480)[pP](?:\s+\w{1,15})?\s*\[([^\]]+)\]/g;
  var match;
  while ((match = qualityRegex.exec(html)) !== null) {
    var quality = match[1].toLowerCase() + 'p';
    if (quality === '480p') continue; /* never emit sub-720p */
    var context = html.substring(Math.max(0, match.index - 200), match.index + 600);
    var hubcloud = context.match(/href="(https:\/\/hubcloud\.cx\/(?:drive|video)\/[^"]+)"/i);
    var vcloud = context.match(/href="(https:\/\/href\.li\/\?https:\/\/vcloud\.zip\/[^"]+)"/i);
    if (hubcloud) options.push({ quality: quality, size: match[2], type: 'hubcloud', url: hubcloud[1] });
    else if (vcloud) options.push({ quality: quality, size: match[2], type: 'vcloud', url: vcloud[1] });
  }
  return options;
}

function extractVcloudUrl(raw) {
  var match = String(raw || '').match(/href\.li\/\?https:\/\/vcloud\.zip\/([^"&?]+)/i);
  return match ? 'https://vcloud.zip/' + match[1] : null;
}

function extractEpisodes(html) {
  var episodes = [];
  var markers = [];
  var markerRegex = /-:\s*Episodes?\s*:\s*(\d+)\s*:-/gi;
  var match;
  while ((match = markerRegex.exec(html)) !== null)
    markers.push({ num: parseInt(match[1], 10), idx: match.index });
  if (!markers.length) { /* fallback layout: ">Episode 3<" */
    var fallback = />\s*Episode\s*(\d+)\s*</gi;
    while ((match = fallback.exec(html)) !== null)
      markers.push({ num: parseInt(match[1], 10), idx: match.index });
  }
  for (var i = 0; i < markers.length; i++) {
    var start = markers[i].idx;
    var end = i + 1 < markers.length ? markers[i + 1].idx : html.length;
    var segment = html.substring(start, end);
    var links = [];
    var hubcloudRegex = /href="(https:\/\/hubcloud\.cx\/(?:drive|video)\/[^"]+)"/gi;
    while ((match = hubcloudRegex.exec(segment)) !== null)
      links.push({ type: 'hubcloud', url: match[1] });
    var vcloudRegex = /href="(https:\/\/href\.li\/\?https:\/\/vcloud\.zip\/[^"]+)"/gi;
    while ((match = vcloudRegex.exec(segment)) !== null) {
      var vUrl = extractVcloudUrl(match[1]);
      if (vUrl) links.push({ type: 'vcloud', url: vUrl });
    }
    if (links.length) episodes.push({ number: markers[i].num, links: links });
  }
  return episodes;
}

function extractSeasonLinks(html) {
  var seasons = {};
  var h4Regex = /<h4[^>]*>([\s\S]*?)<\/h4>/gi;
  var headings = [];
  var match;
  while ((match = h4Regex.exec(html)) !== null)
    headings.push({ inner: match[1], start: match.index, end: match.index + match[0].length });
  for (var i = 0; i < headings.length; i++) {
    var seasonMatch = headings[i].inner.match(/Season\s+(\d+)/i);
    var qualityMatch = headings[i].inner.match(/(\d+p)/i);
    if (!seasonMatch || !qualityMatch) continue;
    var seasonNum = parseInt(seasonMatch[1], 10);
    var quality = qualityMatch[1].toLowerCase();
    var sectionStart = headings[i].end;
    var sectionEnd = i + 1 < headings.length ? headings[i + 1].start : html.length;
    var segment = html.substring(sectionStart, sectionEnd);
    var abhiMatch = segment.match(/href="(https:\/\/abhilinks\.(?:life|site)\/archives\/\d+)\/?"/i);
    if (abhiMatch) {
      if (!seasons[seasonNum]) seasons[seasonNum] = {};
      if (!seasons[seasonNum][quality]) seasons[seasonNum][quality] = abhiMatch[1];
    }
  }
  return seasons;
}

/* ---------- hubcloud / vcloud -> FSL host links ---------- */

function extractFSLLinks(html) {
  var links = [];
  var anchors = html.match(/<a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi);
  if (!anchors) return links;
  for (var i = 0; i < anchors.length; i++) {
    var hrefMatch = anchors[i].match(/href="([^"]+)"/i);
    var textMatch = anchors[i].match(/>([\s\S]*?)<\/a>/i);
    if (!hrefMatch) continue;
    var url = hrefMatch[1].replace(/&amp;/g, '&');
    var text = textMatch ? textMatch[1].replace(/<[^>]+>/g, '').trim() : '';
    if (!url || url.indexOf('javascript:') === 0) continue;
    if (/telegram/i.test(text) || /tg\//i.test(url) || /pixeldrain/i.test(url)) continue;
    if (/hubcloud\.cx|gpdl2/i.test(url)) continue;
    var type = '';
    if (/cdn\.fsl-buckets\.life|r2\.cloudflarestorage|r2\.dev/i.test(url)) type = 'FSLv2';
    else if (/hub\.(latent|whistle)/i.test(url)) type = 'FSL';
    else if (/workers\.dev/i.test(url)) type = 'Worker';
    else continue;
    var qualityMatch = text.match(/(2160|1080|720|480)\s*[pP]/i);
    var quality = qualityMatch ? qualityMatch[1].toLowerCase() + 'p' : '';
    links.push({ url: url, type: type, quality: quality, rawText: text });
  }
  return links;
}

async function processHubcloud(url) {
  var html = await fetchText(url, { headers: hdrs({ 'Referer': ABHILINKS_BASE + '/' }) });
  if (!html) return null;
  var phpMatch = html.match(/href="(https:\/\/[^"]*hubcloud\.php[^"]*)"/i);
  if (!phpMatch) return null;
  var phpUrl = phpMatch[1].replace(/&amp;/g, '&');
  var ffUA = 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:152.0) Gecko/20100101 Firefox/152.0';
  var phpHtml = await fetchText(phpUrl, {
    headers: {
      'User-Agent': ffUA,
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Referer': url,
      'DNT': '1',
      'Cookie': 'xla=s4t'
    }
  });
  if (!phpHtml || phpHtml.length < 500) return null;
  return extractFSLLinks(phpHtml);
}

async function processVcloud(url) {
  var html = await fetchText(url, { headers: hdrs({ 'Referer': ABHILINKS_BASE + '/' }) });
  if (!html) return null;
  var atobMatch = html.match(/atob\s*\(\s*atob\s*\(\s*['"]([^'"]+)['"]\s*\)\s*\)/);
  if (!atobMatch) return null;
  var inner; /* double-atob redirect target (atob comes from the device preamble) */
  try { inner = atob(atob(atobMatch[1])); } catch (e) { return null; }
  var innerHtml = await fetchText(inner, {
    headers: hdrs({ 'Referer': MOVIESHUNT_BASE + '/', 'Cookie': 'xla=s4t' })
  });
  if (!innerHtml) return null;
  return extractFSLLinks(innerHtml);
}

/* ---------- row naming (kept from 4.39) ---------- */

function parseLanguage(text) {
  var s = String(text || '').toLowerCase();
  var southIndian = ['tamil', 'telugu', 'bengali', 'malayalam', 'kannada', 'marathi', 'punjabi'];
  var hits = 0;
  for (var i = 0; i < southIndian.length; i++)
    if (s.indexOf(southIndian[i]) !== -1) hits++;
  if (hits >= 1 || s.indexOf('multi') !== -1) return 'Multi-Audio';
  return 'Dual-Audio';
}

function buildDropdownMetadata(tmdbInfo, quality, size, sourceType, isSeries, seasonNum, episodeNum, releaseText, streamUrl) {
  var rawTitle = (isSeries ? tmdbInfo.name : tmdbInfo.title) || 'Unknown Title';
  var dateSrc = isSeries ? (tmdbInfo.first_air_date || '') : (tmdbInfo.release_date || '');
  var year = dateSrc.split('-')[0];
  var line1 = (isSeries ? '🎬 ' : '🍿 ') + rawTitle + (year ? ' (' + year + ')' : '');
  if (isSeries && seasonNum != null && episodeNum != null)
    line1 += ' | S' + String(seasonNum).padStart(2, '0') + ' E' + String(episodeNum).padStart(2, '0');

  var text = (String(releaseText || '') + ' ' + String(streamUrl || '')).toLowerCase();
  var q = String(quality || '').toLowerCase();
  var badge = '💎';
  if (q.indexOf('2160') !== -1 || q.indexOf('4k') !== -1) badge = '🌟';
  else if (q.indexOf('1080') !== -1) badge = '🔥';

  var sizeMatch = text.match(/(\d+(?:\.\d+)?\s*(?:gb|mb))/i);
  var sizeLabel = sizeMatch ? sizeMatch[1].toUpperCase() : (size || 'Variable Size');
  var line2 = badge + ' ' + quality + ' | 💾 ' + sizeLabel;

  var dynHdr = 'SDR';
  if (text.indexOf('hdr10+') !== -1) dynHdr = 'HDR10+';
  else if (text.indexOf('hdr10') !== -1) dynHdr = 'HDR10';
  else if (text.indexOf('hdr') !== -1) dynHdr = 'HDR';
  var bit10 = (text.indexOf('10bit') !== -1 || text.indexOf('10-bit') !== -1) ? ' • 10Bit' : '';
  var codec = '🎥 x264';
  if (text.indexOf('hevc') !== -1) codec = '⚡ HEVC';
  else if (text.indexOf('x265') !== -1 || text.indexOf('h265') !== -1) codec = '🎥 x265';
  var container = String(streamUrl || '').indexOf('.mp4') !== -1 ? 'MP4' : 'MKV';
  var line3 = '🌈 ' + dynHdr + bit10 + ' | ' + codec + ' | 📦 ' + container;

  var audio = [];
  if (text.indexOf('ddp5.1') !== -1 || text.indexOf('ddp 5.1') !== -1) audio.push('DDP5.1');
  if (text.indexOf('truehd') !== -1) audio.push('TrueHD');
  if ((text.indexOf('dd5.1') !== -1 || text.indexOf('5.1') !== -1) && audio.indexOf('DDP5.1') === -1)
    audio.push('DD 5.1');
  if (!audio.length) audio.push('AAC');
  var atmos = text.indexOf('atmos') !== -1 ? ' | 🔊 Atmos' : '';
  var line4 = '🔈 ' + parseLanguage(text) + ' | 🎧 ' + audio.join(' • ') + atmos;

  var source = '📥 WEB-DL';
  if (text.indexOf('web-rip') !== -1 || text.indexOf('webrip') !== -1) source = '🌐 WEB-RIP';
  else if (text.indexOf('bluray') !== -1) source = '💿 Blu-Ray';
  var line5 = '🔗 ' + (sourceType || 'FSL') + ' | ' + source;

  return line1 + '\n' + line2 + '\n' + line3 + '\n' + line4 + '\n' + line5;
}

function makeRow(tmdbInfo, quality, size, sourceType, isSeries, seasonNum, episodeNum, releaseText, item, withBow) {
  var audio = parseLanguage(releaseText + ' ' + quality);
  var name = (withBow ? '🏹 ' : '') + PROVIDER_NAME + ' | ' + quality + ' | ' + audio;
  return {
    name: name,
    title: buildDropdownMetadata(tmdbInfo, quality, size, sourceType, isSeries, seasonNum, episodeNum, releaseText, item.url),
    url: item.url,
    quality: quality,
    headers: { 'Referer': MOVIESHUNT_BASE + '/', 'User-Agent': currentUA }
  };
}

/* ---------- per-post resolution ---------- */

async function resolvePost(postUrl, tmdbInfo, isSeries, seasonNum, episodeNum) {
  var postHtml = await fetchText(postUrl, { headers: hdrs() });
  if (!postHtml) return [];

  var rows = [];
  if (isSeries) {
    var entries = [];
    if (seasonNum) { /* prefer per-season quality archive links */
      var seasonLinks = extractSeasonLinks(postHtml);
      if (seasonLinks[seasonNum]) {
        Object.keys(seasonLinks[seasonNum])
          .sort(function (a, b) { return parseInt(b, 10) - parseInt(a, 10); })
          .forEach(function (q) { entries.push({ quality: q, url: seasonLinks[seasonNum][q] }); });
      }
    }
    if (!entries.length) { /* fall back to the post's main abhilinks link */
      var abhiUrl = extractAbhilinksUrl(postHtml);
      if (abhiUrl) entries.push({ quality: '', url: abhiUrl });
    }
    if (!entries.length) return [];

    for (var e = 0; e < entries.length; e++) {
      var entry = entries[e];
      var abhiHtml = await fetchText(entry.url, { headers: hdrs() });
      if (!abhiHtml) continue;
      var allEpisodes = extractEpisodes(abhiHtml);
      if (!allEpisodes.length) continue;
      var wanted = episodeNum
        ? allEpisodes.filter(function (ep) { return ep.number === episodeNum; })
        : allEpisodes.slice(0, MAX_EPISODES);
      for (var w = 0; w < wanted.length; w++) {
        var ep = wanted[w];
        var links = ep.links.slice(0, MAX_LINKS_PER_EPISODE);
        for (var l = 0; l < links.length; l++) {
          var link = links[l];
          var fsl = null;
          if (link.type === 'hubcloud') fsl = await processHubcloud(link.url);
          else if (link.type === 'vcloud') fsl = await processVcloud(link.url);
          if (!fsl || !fsl.length) continue;
          for (var f = 0; f < fsl.length; f++) {
            var item = fsl[f];
            var qText = String(item.quality || entry.quality || '').toLowerCase();
            if (qText === '480p' || qText === 'hd') continue; /* post-filter gate: >=720p only */
            var quality = qText || '1080p';
            var releaseText = (item.rawText || '') + ' ' + item.url;
            rows.push(makeRow(tmdbInfo, quality, '', item.type, true, seasonNum, ep.number, releaseText, item, false));
          }
        }
      }
    }
  } else {
    var movieAbhiUrl = extractAbhilinksUrl(postHtml);
    if (!movieAbhiUrl) return [];
    var movieAbhiHtml = await fetchText(movieAbhiUrl, { headers: hdrs() });
    if (!movieAbhiHtml) return [];
    var options = extractQualityOptions(movieAbhiHtml).slice(0, MAX_QUALITY_OPTIONS);
    if (!options.length) return [];

    for (var o = 0; o < options.length; o++) {
      var opt = options[o];
      var fslLinks = null;
      if (opt.type === 'hubcloud') fslLinks = await processHubcloud(opt.url);
      else if (opt.type === 'vcloud') {
        var vUrl = extractVcloudUrl(opt.url);
        fslLinks = vUrl ? await processVcloud(vUrl) : null;
      }
      if (!fslLinks || !fslLinks.length) continue;
      for (var k = 0; k < fslLinks.length; k++) {
        var movieItem = fslLinks[k];
        var movieQ = String(movieItem.quality || opt.quality || '').toLowerCase();
        if (movieQ === '480p' || movieQ === 'hd') continue;
        var movieQuality = movieQ || '1080p';
        var movieRelease = (movieItem.rawText || '') + ' ' + movieItem.url + ' ' + (opt.size || '');
        rows.push(makeRow(tmdbInfo, movieQuality, opt.size || '', movieItem.type, false, null, null, movieRelease, movieItem, true));
      }
    }
  }

  /* dedupe by URL, best quality first */
  var seen = {};
  rows = rows.filter(function (r) {
    if (!r || !r.url || seen[r.url]) return false;
    seen[r.url] = true;
    return true;
  });
  rows.sort(function (a, b) { return resWeight(b.quality) - resWeight(a.quality); });
  return rows;
}

/* ---------- entry point ---------- */

async function getStreams(tmdbId, mediaType, season, episode) {
  try {
    currentUA = UAS[Math.floor(Math.random() * UAS.length)];
    var isSeries = mediaType === 'tv' || mediaType === 'series';
    if (isSeries && (season == null || episode == null)) return [];
    var seasonNum = isSeries && season != null ? parseInt(season, 10) : null;
    var episodeNum = isSeries && episode != null ? parseInt(episode, 10) : null;

    var tmdbInfo = await getTMDBInfo(tmdbId, isSeries ? 'tv' : 'movie');
    if (!tmdbInfo) return log('TMDB fetch failed') || [];
    var title = isSeries ? tmdbInfo.name : tmdbInfo.title;
    if (!title) return log('no title from TMDB') || [];

    var results = await searchSite(title);
    if (!results.length) return log("search '" + title + "' empty") || [];
    var matches = matchHits(results, tmdbInfo, isSeries);
    if (!matches.length) return log('no scored match') || [];

    for (var i = 0; i < matches.length; i++) { /* sequential walk, first post that yields wins */
      try {
        var rows = await resolvePost(matches[i].url, tmdbInfo, isSeries, seasonNum, episodeNum);
        if (rows.length) {
          log('returning ' + rows.length + ' streams from ' + matches[i].url);
          return rows;
        }
      } catch (e) { /* fail-soft: try next match */ }
    }
    return [];
  } catch (e) {
    return [];
  }
}

if (typeof module !== 'undefined' && module.exports) module.exports = { getStreams: getStreams };
else if (typeof globalThis !== 'undefined') globalThis.getStreams = getStreams;

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
  var PROVIDER = "movieshunt";
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
  var __LABEL = 'MoviesHunt';
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
