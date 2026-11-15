/* nv-plugins vidlove.js v7.0.0 (pack 4.40.0 "all providers readable")
 * Full clean rebuild; machine names removed, flow = device-verified 4.39.
 * Fixed: 4.39's undefined apQualityToStream() silently killed single-url
 * sources; URLSearchParams use made deterministic.
 * Lanes: WINGS text lane first (waterfall), native api.vidlove.cc 5-source
 * parallel fan (6.2s partial collect) fallback. Post-filter tail appended.
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
  /* v7.1.1 (pack 4.49.0): gateway-down cooldown — api.speedracelight.com
   * 502s hard since 2026-10; bench this lane 10 min after a 5xx instead of
   * re-paying the outage on every call (device log showed 502 storms +
   * app-level circuit spam). Primary api.vidlove.cc lane unaffected. */
  var __nvSeedDownUntil = 0;
  var __nvSeedCooling = function () { return Date.now() < __nvSeedDownUntil; };
  var __nvMarkSeedDown = function () { __nvSeedDownUntil = Date.now() + 10 * 60 * 1000; };
  var TMDB_KEY = '6dc830f9624b43261325bed3bf7d0dfa';
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
    var timeoutMs = opts.timeoutMs || 12000;
    try {
      var tmdbId = parseInt(String(opts.tmdbId || '').replace(/\D/g, ''), 10);
      if (!tmdbId) return Promise.resolve([]);
      var mediaType = opts.mediaType === 'tv' || opts.mediaType === 'series' ? 'tv' : 'movie';
      if (typeof __nvSeedCooling === 'function' && __nvSeedCooling()) return Promise.resolve([]);
      return wingsTmdbMeta(tmdbId, mediaType).then(function(meta) {
        if (!meta || !meta.title) return [];
        return _fetchX(WINGS_BASE + '/seed?mediaId=' + tmdbId, {
            headers: WINGS_HEADERS
          })
          .then(function(r) {
            if (r.ok) return r.json();
            if (typeof __nvMarkSeedDown === 'function' && r.status >= 500) __nvMarkSeedDown();
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

/* ============================================================
 * nv-plugins vidlove.js v7.1.0 (pack 4.48.0 "languages + subtitles")
 * ------------------------------------------------------------
 * v7.1.0 rebuild of the VidLove native lane against the CURRENT
 * player.vidlove.cc bundle (re-verified live 2026-09-29):
 *   GET api.vidlove.cc/{movie|tv}?id={tmdbId}&mode=json&source={src}
 *     [&season=&episode=]  for src in vidapi/moviebox2/megaknight/
 *     warden/cinefreak/ipc, all six in parallel with a 6.2s partial
 *     collect. Response is {meta, subtitles, source:{url,manifest,label}}
 *     where source.url is a DIRECT mp4 and source.manifest an HLS master.
 * Subtitles: GET api.vidlove.cc/subtitles/{movie}/{id} (or
 *   /subtitles/tv/{id}/{s}/{e}) -> [{label, file(vtt)}] with English,
 *   Filipino, Indonesian, Malay, Chinese, Korean, Japanese, Thai tracks
 *   when available; label->ISO-639-1 mapped and attached to every row.
 *   (4.40's /{src}?sources=...&hevc=1 shape now 404s - that was the
 *   whole provider outage.)
 * Also fixed: the waterfall junk-filter regex /api\?d=/ dropped the new
 *   direct a2.whysosigmabro.cfd/api?d=... links; it now only targets the
 *   genuinely dead tungtungtungsahur.cfd host.
 * ============================================================ */

var BASE_URL = "https://api.vidlove.cc";
var REFERER = "https://player.vidlove.cc/";
var TMDB_BASE = "https://api.themoviedb.org/3";
var TMDB_KEY = "6dc830f9624b43261325bed3bf7d0dfa";
var MIN_QUALITY = 1080;
var DEFAULT_QUALITY = "1080p";
var USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";
var PROVIDERS = ["vidapi", "moviebox2", "megaknight", "warden", "cinefreak", "ipc"];

/* label -> ISO-639-1 (subtitle language). Numeric suffixes stripped. */
var SUB_LANG_MAP = {
  english: "en", tagalog: "tl", filipino: "fil", korean: "ko", japanese: "ja",
  indonesian: "id", malay: "ms", malaysian: "ms", chinese: "zh", "chinese (traditional)": "zh-TW",
  thai: "th", arabic: "ar", bengali: "bn", hindi: "hi", urdu: "ur", portuguese: "pt",
  brazilian: "pt-BR", "portuguese (br)": "pt-BR", spanish: "es", french: "fr",
  german: "de", italian: "it", russian: "ru", turkish: "tr", danish: "da", swedish: "sv",
  norwegian: "no", finnish: "fi", czech: "cs", greek: "el", hebrew: "he", croatian: "hr",
  slovenian: "sl", romanian: "ro", hungarian: "hu", polish: "pl", dutch: "nl",
  vietnamese: "vi", ukrainian: "uk", persian: "fa", farsi: "fa"
};

function subLangFromLabel(label) {
  var s = String(label || "").toLowerCase().replace(/\s*\d+\s*$/, "").trim();
  if (SUB_LANG_MAP[s]) return SUB_LANG_MAP[s];
  var first = s.split(/[^a-z]+/)[0];
  return SUB_LANG_MAP[first] || "";
}

/* Fetch the pack's subtitle tracks for this title (parallel to streams). */
function fetchVidloveSubtitles(tmdbId, type, season, episode) {
  var url = type === "tv"
    ? BASE_URL + "/subtitles/tv/" + encodeURIComponent(tmdbId) + "/" + parseInt(season, 10) + "/" + parseInt(episode, 10)
    : BASE_URL + "/subtitles/movie/" + encodeURIComponent(tmdbId);
  return __nvFetch(url, { headers: { "Accept": "application/json", "Referer": REFERER, "User-Agent": USER_AGENT } })
    .then(function (res) {
      if (!res.ok) return [];
      return res.json().then(function (data) {
        var list = Array.isArray(data) ? data : [];
        var seen = {};
        var out = [];
        for (var i = 0; i < list.length; i++) {
          var t = list[i];
          if (!t || !t.file) continue;
          var code = subLangFromLabel(t.label);
          var key = code + "|" + t.file;
          if (seen[key]) continue;
          seen[key] = 1;
          out.push({ url: t.file, lang: code || "und", language: code || "und", name: String(t.label || "Subtitle") });
        }
        return out;
      }).catch(function () { return []; });
    })
    .catch(function () { return []; });
}
var DEFAULT_HEADERS = {
  "accept": "application/json",
  "accept-language": "nl-NL,nl;q=0.9,en-US;q=0.8,en;q=0.7",
  "sec-ch-ua": "\"Not;A=Brand\";v=\"8\", \"Chromium\";v=\"150\", \"Google Chrome\";v=\"150\"",
  "Referer": REFERER,
  "User-Agent": USER_AGENT
};

/** Zero-width inverted sort tag (4.39 parity): higher quality sorts first. */
function getInvertedSortTag(rank, max) {
  if (max === undefined) max = 999999;
  var value = Math.max(0, parseInt(rank, 10) || 0);
  var inverted = Math.max(0, max - value);
  var bits = inverted.toString(2);
  while (bits.length < 20) bits = "0" + bits;
  var tag = "";
  for (var i = 0; i < bits.length; i++) tag += bits.charAt(i) === "1" ? "\uFEFF" : "\u200B";
  return tag;
}

function getResolutionEmoji(quality) {
  var s = String(quality || "").toLowerCase();
  if (s.indexOf("2160") !== -1 || s.indexOf("4k") !== -1 || s.indexOf("uhd") !== -1) return "🌟 4K";
  if (s.indexOf("1080") !== -1 || s.indexOf("fhd") !== -1) return "🔥 1080p";
  if (s.indexOf("720") !== -1 || s.indexOf("hd") !== -1) return "💎 720p";
  if (s.indexOf("480") !== -1 || s.indexOf("sd") !== -1) return "📱 480p";
  return "📺 " + (quality || "1080p");
}

function qualityRank(q) {
  if (/2160p|4k/i.test(String(q))) return 4;
  if (/1080p/i.test(String(q))) return 3;
  if (/720p/i.test(String(q))) return 2;
  if (/480p/i.test(String(q))) return 1;
  return 0;
}

function parseQualityNumber(q) {
  var m = String(q || "").match(/(\d+)/);
  return m ? parseInt(m[1], 10) : 0;
}

function normalizeQuality(q) {
  var s = String(q || "").trim();
  return s ? s : DEFAULT_QUALITY;
}

function isQualityAcceptable(q) {
  return parseQualityNumber(normalizeQuality(q)) >= MIN_QUALITY;
}

function fetchTmdbMeta(tmdbId, type, season, episode) {
  var url = TMDB_BASE + "/" + (type === "tv" ? "tv" : "movie") + "/" + encodeURIComponent(tmdbId) +
    "?api_key=" + TMDB_KEY;
  return __nvFetch(url, { headers: { "Accept": "application/json", "User-Agent": USER_AGENT } })
    .then(function (res) {
      if (!res.ok) throw new Error("meta http " + res.status);
      return res.json();
    })
    .then(function (data) {
      var title = data.name || data.title || "Unknown";
      var date = data.first_air_date || data.release_date || "";
      var year = date ? date.split("-")[0] : null;

      var episodeTitleP = Promise.resolve("");
      if (type === "tv" && season && episode) {
        episodeTitleP = __nvFetch(TMDB_BASE + "/tv/" + encodeURIComponent(tmdbId) + "/season/" +
          parseInt(season, 10) + "?api_key=" + TMDB_KEY, {
            headers: { "Accept": "application/json", "User-Agent": USER_AGENT }
          }).then(function (r) {
            if (!r.ok) return "";
            return r.json().then(function (sd) {
              var want = parseInt(episode, 10);
              var ep = (sd && sd.episodes && sd.episodes.filter(function (e) { return e.episode_number === want; })[0]) || null;
              return (ep && ep.name) || "";
            }).catch(function () { return ""; });
          }).catch(function () { return ""; });
      }

      return episodeTitleP.then(function (episodeTitle) {
        return { title: title, year: year, episodeTitle: episodeTitle };
      });
    })
    .catch(function () { return { title: "Unknown", year: null, episodeTitle: "" }; });
}

function buildEndpointUrl(sourceKey, tmdbId, type, season, episode) {
  var pairs = [
    ["id", tmdbId], ["mode", "json"], ["source", sourceKey]
  ];
  if (type === "tv") {
    if (season != null) pairs.push(["season", season]);
    if (episode != null) pairs.push(["episode", episode]);
  }
  var query = [];
  for (var i = 0; i < pairs.length; i++) {
    query.push(encodeURIComponent(pairs[i][0]) + "=" + encodeURIComponent(pairs[i][1]));
  }
  return BASE_URL + "/" + (type === "tv" ? "tv" : "movie") + "?" + query.join("&");
}

function mapQualityToStream(entry, sourceLabel, index, ctx) {
  var quality = normalizeQuality(entry.quality);
  var emoji = getResolutionEmoji(quality);
  var rank = qualityRank(quality);
  var sortTag = getInvertedSortTag(rank * 100000 + (100 - index), 999999);
  var name = sortTag + "Vidlove • " + quality + " • " + sourceLabel;

  var line1 = "🎬 " + ctx.title + (ctx.year ? " (" + ctx.year + ")" : "");
  var line2 = null;
  if (ctx.mediaType === "tv" && ctx.season && ctx.episode) {
    line2 = "📋 S" + ctx.season + " E" + ctx.episode + (ctx.episodeTitle ? " - " + ctx.episodeTitle : "");
  }
  var line3 = emoji + " | 🗣️ Multi-Audio";
  var line4 = "🎞️ MKV | ⚡ HEVC | 🎧 AAC";
  var line5 = "🔗 Vidlove | 🌐 " + sourceLabel + " | 📥 WEB-DL";

  var parts = [line1, line2, line3, line4, line5].filter(Boolean).join("\n");
  var headers = {
    "Referer": REFERER,
    "Origin": "https://player.vidlove.cc",
    "User-Agent": USER_AGENT
  };
  return {
    name: name,
    title: parts,
    size: parts,
    description: parts,
    url: entry.url,
    quality: quality,
    headers: headers,
    behaviorHints: { notWebReady: true, proxyHeaders: { request: headers } }
  };
}

function fetchProviderStreams(sourceKey, tmdbId, type, season, episode, ctx, subs) {
  return __nvFetch(buildEndpointUrl(sourceKey, tmdbId, type, season, episode), {
    method: "GET",
    headers: DEFAULT_HEADERS
  }).then(function (res) {
    if (!res.ok) return [];
    return res.json().then(function (data) {
      var source = data && data.source;
      if (!source || !source.url) return [];
      var label = source.label != null ? source.label : sourceKey;
      var quality = source.quality || "1080p";
      var row = mapQualityToStream({ url: source.url, quality: quality }, label, 0, ctx);
      if (subs && subs.length) row.subtitles = subs;
      var rows = [row];
      /* secondary HLS lane only when manifest is a real URL
         (the API sometimes inlines #EXTM3U playlist text here) */
      var mani = String(source.manifest || "");
      if (mani.slice(0, 4) === "http" && mani !== source.url) {
        var h = mapQualityToStream({ url: mani, quality: quality }, label + " HLS", 1, ctx);
        if (subs && subs.length) h.subtitles = subs;
        rows.push(h);
      }
      return rows;
    }).catch(function () { return []; });
  }).catch(function () { return []; });
}

function getStreams(tmdbId, mediaType, season, episode) {
  var raw = String(mediaType || "").toLowerCase().trim();
  var type = (raw === "series" || raw === "show" || raw === "tvshow" || raw === "tv") ? "tv" : "movie";
  if (type === "tv" && (season == null || episode == null)) return Promise.resolve([]);

  return fetchTmdbMeta(tmdbId, type, season, episode).then(function (meta) {
    meta.mediaType = type;
    meta.season = season;
    meta.episode = episode;

    /* subtitle lane runs in parallel; 6s cap via the same partial collect */
    var subsP = fetchVidloveSubtitles(tmdbId, type, season, episode)
      .catch(function () { return []; });

    var lanes = [];
    for (var i = 0; i < PROVIDERS.length; i++) {
      (function (srcKey, laneIdx) {
      lanes.push(
        subsP.then(function (subs) {
          return fetchProviderStreams(srcKey, tmdbId, type, season, episode, meta, subs);
        }).catch(function () { return []; })
      );
      if (laneIdx === 0) {
        /* keep lanes array aligned: subs lane itself is not a stream lane */
      }
    })(PROVIDERS[i], i);
    }

    // 6.2s partial collect: take whatever resolved by then, never hang
    var collected = [];
    var push = function (rows) { if (Array.isArray(rows)) collected = collected.concat(rows); };
    lanes.forEach(function (p) { p.then(push).catch(function () {}); });

    var settled = typeof setTimeout === "function"
      ? Promise.race([
          Promise.all(lanes),
          new Promise(function (res) {
            var t = setTimeout(function () { res(1); }, 6200);
            if (t && typeof t.unref === "function") t.unref();
          })
        ])
      : Promise.all(lanes);

    return settled.then(function () {
      var seen = {}, out = [];
      for (var i = 0; i < collected.length; i++) {
        var r = collected[i];
        if (r && r.url && !seen[r.url]) { seen[r.url] = 1; out.push(r); }
      }
      return out;
    });
  }).catch(function () { return []; });
}

module.exports = { getStreams: getStreams };

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
  var __LABEL = 'VidLove';
  var __WINGS_FIRST = true;
  var __ALT_NAME = '__nvWingsStreams';
  function __junk(u) { return /tungtungtungsahur\.cfd/i.test(String(u || '')); }
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
  var PROVIDER = "vidlove";
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


/* ===== nv universal subtitle lane v1.0.0 (pack 4.48.0) =====================
   Every scraper's stream rows now carry multi-language sidecar subtitles:
   English, Tagalog/Filipino, Korean, Japanese, Indonesian, Malay, Chinese,
   Thai + all other tracks the source offers.

   Source: Stremio's official keyless OpenSubtitles-v3 addon
     GET https://opensubtitles-v3.strem.io/subtitles/{movie|series}/{imdbId}[:s:e].json
     -> { subtitles: [{ url, lang(ISO-639-3), ... }] }
   The subs5.strem.io URLs serve UTF-8 SRT; NuvioTV's player converts SRT to
   WebVTT transparently (playerScreenMethods-42.createSubtitleObjectUrl), and
   the player merges stream.sidecar `subtitles` rows (lang/url/headers) into
   the subtitle rail - the same path the Pencuri English lane uses.

   Design: ES2020-safe, zero-dependency, fail-soft. The IMDb id is resolved
   once per title via TMDB external_ids (cached), the subtitle JSON once per
   (imdb, s, e) (cached 6h). The wrapper runs in PARALLEL with the provider's
   own lane and only fills rows that have no subtitles of their own, so
   provider-specific tracks (vidlove/anikoto/megaplay vtt, pencuri en) always
   win. Never throws; never delays the stream lane by more than the host's
   own 8s deadline.
=========================================================================== */
(function () {
  var G = typeof globalThis !== "undefined" ? globalThis : this;
  if (G.__nvOsv3Subs) return;

  var OSV3_BASE = "https://opensubtitles-v3.strem.io/subtitles/";
  var TMDB_KEY = (typeof TMDB_API_KEY === "string" && TMDB_API_KEY) || "6dc830f9624b43261325bed3bf7d0dfa";
  var TTL_MS = 6 * 60 * 60 * 1000;
  var DEADLINE_MS = 8000;

  /* ISO-639-3 -> ISO-639-1 (+ display names) for the pack's languages */
  var CODE_MAP = {
    eng: "en", tgl: "tl", fil: "fil", ko: "ko", kor: "ko", jpn: "ja",
    ind: "id", may: "ms", zho: "zh", zhe: "zh", zht: "zh-TW", tha: "th",
    hin: "hi", ben: "bn", tam: "ta", tel: "te", spa: "es", por: "pt",
    pob: "pt-BR", fre: "fr", ger: "de", ita: "it", rus: "ru", ara: "ar",
    tur: "tr", vie: "vi", pol: "pl", nld: "nl", ukr: "uk", pes: "fa",
    per: "fa", swe: "sv", nor: "no", dan: "da", fin: "fi", ell: "el",
    heb: "he", hun: "hu", ces: "cs", cze: "cs", ron: "ro", rum: "ro",
    hrv: "hr", srp: "sr", bul: "bg", slo: "sk", slv: "sl", bos: "bs",
    mac: "mk", mkd: "mk", est: "et", lav: "lv", lit: "lt", ind2: "id"
  };
  var NAME_MAP = {
    en: "English", tl: "Tagalog", fil: "Filipino", ko: "Korean", ja: "Japanese",
    id: "Indonesian", ms: "Malay", zh: "Chinese", "zh-TW": "Chinese (Traditional)",
    th: "Thai", hi: "Hindi", bn: "Bengali", ta: "Tamil", te: "Telugu",
    es: "Spanish", pt: "Portuguese", "pt-BR": "Portuguese (BR)", fr: "French",
    de: "German", it: "Italian", ru: "Russian", ar: "Arabic", tr: "Turkish",
    vi: "Vietnamese", pl: "Polish", nl: "Dutch", uk: "Ukrainian", fa: "Persian",
    sv: "Swedish", no: "Norwegian", da: "Danish", fi: "Finnish", el: "Greek",
    he: "Hebrew", hu: "Hungarian", cs: "Czech", sk: "Slovak", ro: "Romanian",
    hr: "Croatian", sr: "Serbian", bg: "Bulgarian", sl: "Slovenian",
    bs: "Bosnian", mk: "Macedonian", et: "Estonian", lv: "Latvian", lt: "Lithuanian"
  };

  var _cache = {};   /* key -> { t: ms, rows: [...] } */
  var _imdbCache = {}; /* tmdbKey -> { t: ms, imdb } */
  var _inflight = {};  /* key -> Promise */

  function _hasTimers() {
    return typeof setTimeout === "function" && typeof Promise !== "undefined" && Promise.race;
  }
  function _withDeadline(p) {
    if (!_hasTimers()) return p;
    return Promise.race([p, new Promise(function (res) {
      var t = setTimeout(function () { res(null); }, DEADLINE_MS);
      if (t && typeof t.unref === "function") t.unref();
    })]);
  }
  function _normType(mediaType) {
    var t = String(mediaType || "").toLowerCase();
    return (t === "series" || t === "show" || t === "tvshow" || t === "tv") ? "series" : "movie";
  }
  function _fetchJson(url) {
    return _withDeadline(
      (typeof fetch === "function" ? fetch(url) : Promise.reject(new Error("no fetch")))
        .then(function (res) {
          if (!res || !res.ok) return null;
          return res.json().catch(function () { return null; });
        })
        .catch(function () { return null; })
    );
  }
  function _resolveImdb(tmdbId, mediaType) {
    var key = _normType(mediaType) + ":" + String(tmdbId);
    var now = Date.now();
    if (_imdbCache[key] && now - _imdbCache[key].t < TTL_MS) {
      return Promise.resolve(_imdbCache[key].imdb);
    }
    if (_inflight["imdb:" + key]) return _inflight["imdb:" + key];
    var kind = _normType(mediaType) === "series" ? "tv" : "movie";
    var url = "https://api.themoviedb.org/3/" + kind + "/" + encodeURIComponent(String(tmdbId)) +
      "/external_ids?api_key=" + TMDB_KEY;
    _inflight["imdb:" + key] = _fetchJson(url).then(function (data) {
      var imdb = data && data.imdb_id && /^tt\d+$/.test(String(data.imdb_id)) ? String(data.imdb_id) : null;
      _imdbCache[key] = { t: now, imdb: imdb };
      delete _inflight["imdb:" + key];
      return imdb;
    });
    return _inflight["imdb:" + key];
  }
  function _osv3Rows(imdbId, mediaType, season, episode) {
    var isSeries = _normType(mediaType) === "series";
    var path = isSeries
      ? "series/" + encodeURIComponent(imdbId) + ":" + (parseInt(season, 10) || 1) + ":" + (parseInt(episode, 10) || 1) + ".json"
      : "movie/" + encodeURIComponent(imdbId) + ".json";
    var key = path;
    var now = Date.now();
    if (_cache[key] && now - _cache[key].t < TTL_MS) return Promise.resolve(_cache[key].rows);
    if (_inflight[key]) return _inflight[key];
    _inflight[key] = _fetchJson(OSV3_BASE + path).then(function (data) {
      var list = (data && Array.isArray(data.subtitles)) ? data.subtitles : [];
      var seen = {};
      var rows = [];
      for (var i = 0; i < list.length; i++) {
        var t = list[i];
        if (!t || !t.url) continue;
        var code = CODE_MAP[String(t.lang || "").toLowerCase()] || String(t.lang || "").toLowerCase();
        if (!code) continue;
        var dedupeKey = code + "|" + (t.id || t.url);
        if (seen[dedupeKey]) continue;
        seen[dedupeKey] = 1;
        rows.push({
          url: String(t.url),
          lang: code,
          language: code,
          name: NAME_MAP[code] || (String(t.lang || "subtitle").charAt(0).toUpperCase() + String(t.lang || "subtitle").slice(1))
        });
        if (rows.length >= 60) break;
      }
      _cache[key] = { t: now, rows: rows };
      delete _inflight[key];
      return rows;
    });
    return _inflight[key];
  }

  G.__nvOsv3Subs = {
    get: function (tmdbId, mediaType, season, episode) {
      try {
        return _resolveImdb(tmdbId, mediaType).then(function (imdb) {
          if (!imdb) return [];
          return _osv3Rows(imdb, mediaType, season, episode);
        }).catch(function () { return []; });
      } catch (e) { return Promise.resolve([]); }
    }
  };
})();

/* ===== nv universal subtitle wrapper v1.0.0 (pack 4.48.0) ==================
   Re-wraps module.exports.getStreams: runs the provider lane and the OSv3
   subtitle lane concurrently, then attaches the language tracks to every
   row that has no subtitles of its own. Provider-specific tracks always
   win; rows keep their originals untouched. Fail-soft end to end.
=========================================================================== */
(function () {
  var G = typeof globalThis !== "undefined" ? globalThis : this;
  var lane = G.__nvOsv3Subs;
  var orig = null;
  try { orig = module.exports && module.exports.getStreams; } catch (e) { orig = null; }
  if (!lane || typeof orig !== "function") return;
  module.exports.getStreams = function (tmdbId, mediaType, season, episode) {
    var rowsP;
    try {
      rowsP = Promise.resolve(orig.apply(this, arguments));
    } catch (e) {
      rowsP = Promise.resolve([]);
    }
    var subsP = lane.get(tmdbId, mediaType, season, episode).catch(function () { return []; });
    return Promise.all([rowsP.catch(function () { return []; }), subsP]).then(function (arr) {
      var rows = Array.isArray(arr[0]) ? arr[0] : [];
      var subs = Array.isArray(arr[1]) ? arr[1] : [];
      if (!rows.length || !subs.length) return rows;
      for (var i = 0; i < rows.length; i++) {
        var r = rows[i];
        if (r && (!r.subtitles || !r.subtitles.length)) r.subtitles = subs;
      }
      return rows;
    });
  };
})();

// v4.54.3 pack deadline guard (appended): this provider was among the slowest
// lanes of the pack results screen on mobile networks. The app renders the
// whole pack together, so every provider must answer even when a fetch chain
// hangs; the app budget kills the pack at 60s which reads as "very slow".
(function () {
  var DEADLINE_MS = 18000;
  var prev = module.exports.getStreams;
  if (typeof prev !== "function") return;
  module.exports.getStreams = function () {
    var args = arguments;
    var timer;
    return Promise.race([
      Promise.resolve().then(function () { return prev.apply(null, args); })
        .then(function (v) { clearTimeout(timer); return v; })
        .catch(function () { clearTimeout(timer); return []; }),
      new Promise(function (resolve) {
        timer = setTimeout(function () { resolve([]); }, DEADLINE_MS);
      })
    ]);
  };
})();

/* BEGIN NV_NON_ANIME_PROVIDER_BOUNDARY */
(function () {
  var G = typeof globalThis !== 'undefined' ? globalThis : this;
  var original = null;
  try { original = module.exports && module.exports.getStreams; } catch (e) { original = null; }
  if (typeof original !== 'function') return;
  var PROVIDER_ID = "vidlove";
  var MAX_MS = 22000;

  function number(raw) {
    return raw != null && /^\d+$/.test(String(raw).trim()) ? Number(raw) : null;
  }
  function clean(raw) {
    var id = String(raw == null ? '' : raw).trim();
    try { id = decodeURIComponent(id); } catch (e) {}
    id = id.replace(/[?#].*$/, '').replace(/\.json$/i, '').replace(/\/+$/, '');
    return id;
  }
  function normalize(input, mediaType, season, episode, argCount) {
    var id = clean(input);
    var mt = String(mediaType == null ? '' : mediaType).trim().toLowerCase();
    if (number(mediaType) != null && argCount === 3) {
      episode = season; season = mediaType; mt = 'tv';
    }
    var match = id.match(/^tmdb:(\d+)(?::(\d+)(?::(\d+))?)?$/i);
    if (match) {
      id = match[1];
      if (season == null && match[2] != null) season = Number(match[2]);
      if (episode == null && match[3] != null) episode = Number(match[3]);
    } else {
      match = id.match(/^(asian:[a-z0-9-]+|(?:mal|anilist|kitsu|anikoto):\d+)(?::(\d+)(?::(\d+))?)?$/i);
      if (match) {
        id = match[1];
        if (season == null && match[3] != null) season = Number(match[2]);
        if (episode == null && match[3] != null) episode = Number(match[3]);
        if (episode == null && match[2] != null && match[3] == null) episode = Number(match[2]);
        var owner = /^asian:pmh-/i.test(id) ? 'pinoymovieshub' :
          /^asian:pen-/i.test(id) ? 'pencuri' :
          /^asian:(?:ks|va|kh)-/i.test(id) ? 'asianhub' :
          /^asian:hd4u-/i.test(id) ? 'hdhub4u' :
          /^(mal|anilist|kitsu|anikoto):/i.test(id) ? 'miruro' : '';
        if (!owner || owner !== PROVIDER_ID) return null;
      } else if (!/^\d+$/.test(id) && !/^tt\d+$/i.test(id)) {
        return null;
      }
    }
    if (/^(series|show|tvshow|tv_show|tv|other)$/.test(mt)) mt = 'tv';
    else if (mt !== 'movie') mt = number(episode) != null ? 'tv' : 'movie';
    season = number(season); episode = number(episode);
    if (mt === 'tv' && (season == null || episode == null || episode < 1)) return null;
    return { id: id, mediaType: mt, season: season, episode: episode };
  }
  function cleanRows(raw) {
    if (!Array.isArray(raw)) return [];
    var out = [], seen = {};
    for (var i = 0; i < raw.length && out.length < 40; i++) {
      var row = raw[i];
      if (!row || typeof row !== 'object') continue;
      var url = String(row.url || row.playlist || '').trim();
      if (!/^https?:\/\//i.test(url) || /^https?:\/\/[^/]+\/$/i.test(url)) continue;
      if (/^(?:javascript|data):/i.test(url) || /(?:^|[?&])(?:error|message)=/i.test(url)) continue;
      if (seen[url]) continue;
      seen[url] = 1;
      var copy = {};
      for (var k in row) if (Object.prototype.hasOwnProperty.call(row, k)) copy[k] = row[k];
      copy.url = url;
      out.push(copy);
    }
    return out;
  }
  function tmdbKey() {
    var key = '';
    try {
      if (typeof G.__NV_TMDB_API_KEY === 'string') key = G.__NV_TMDB_API_KEY;
      if (!key && typeof TMDB_API_KEY === 'string') key = TMDB_API_KEY;
      if (!key && typeof TMDB_KEY === 'string') key = TMDB_KEY;
    } catch (e) {}
    return key;
  }
  function resolveImdb(id, mediaType) {
    if (!/^tt\d+$/i.test(id) || PROVIDER_ID === 'torrents' || PROVIDER_ID === 'tagalogtorrents') {
      return Promise.resolve(id);
    }
    var key = tmdbKey();
    if (!key || typeof fetch !== 'function') return Promise.resolve(null);
    var kind = mediaType === 'tv' ? 'tv_results' : 'movie_results';
    var request = Promise.resolve().then(function () {
      return fetch('https://api.themoviedb.org/3/find/' + encodeURIComponent(id) +
        '?external_source=imdb_id&api_key=' + encodeURIComponent(key));
    }).then(function (res) {
      if (!res || !res.ok) return null;
      return res.json();
    }).then(function (data) {
      var list = data && Array.isArray(data[kind]) ? data[kind] : [];
      return list.length && /^\d+$/.test(String(list[0].id)) ? String(list[0].id) : null;
    }).catch(function () { return null; });
    if (typeof setTimeout !== 'function' || typeof clearTimeout !== 'function') return request;
    var timer = null;
    var timeout = new Promise(function (resolve) {
      timer = setTimeout(function () { resolve(null); }, 6000);
      if (timer && typeof timer.unref === 'function') timer.unref();
    });
    return Promise.race([request, timeout]).then(function (result) {
      if (timer != null) clearTimeout(timer);
      return result;
    }).catch(function () {
      if (timer != null) clearTimeout(timer);
      return null;
    });
  }
  function invoke(args, normalized) {
    args[0] = normalized.id;
    args[1] = normalized.mediaType;
    args[2] = normalized.season;
    args[3] = normalized.episode;
    var pending;
    try { pending = Promise.resolve(original.apply(this, args)); }
    catch (e) { return Promise.resolve([]); }
    if (typeof setTimeout !== 'function' || typeof clearTimeout !== 'function') {
      return pending.then(cleanRows).catch(function () { return []; });
    }
    var timer = null;
    var timeout = new Promise(function (resolve) {
      timer = setTimeout(function () { resolve([]); }, MAX_MS);
      if (timer && typeof timer.unref === 'function') timer.unref();
    });
    return Promise.race([pending, timeout]).then(function (rows) {
      if (timer != null) clearTimeout(timer);
      return cleanRows(rows);
    }).catch(function () {
      if (timer != null) clearTimeout(timer);
      return [];
    });
  }
  module.exports.getStreams = function () {
    var args = Array.prototype.slice.call(arguments);
    var normalized = normalize(args[0], args[1], args[2], args[3], args.length);
    if (!normalized) return Promise.resolve([]);
    var self = this;
    return resolveImdb(normalized.id, normalized.mediaType).then(function (resolvedId) {
      if (!resolvedId) return [];
      normalized.id = resolvedId;
      return invoke.call(self, args, normalized);
    }).catch(function () { return []; });
  };
})();
/* END NV_NON_ANIME_PROVIDER_BOUNDARY */
