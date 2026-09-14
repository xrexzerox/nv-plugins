/**
 * NetMirror - Nuvio provider (v15.0.0) - soryn-style readable rebuild.
 *
 * Reference: providers/soryn.js from eclipsia/nuvio-plugin (Codeberg) - the
 * user pointed at it as "more readable" for netmirror. v15.0.0 keeps every
 * device-validated lane of v14 but presents them in the same small, flat,
 * top-to-bottom structure soryn uses, and drops the relay-dependent lane:
 *
 *   1. Alpha lane      netmirror.center search2 -> detail -> watchpvr.php
 *                      (signed with pure-JS HMAC-SHA256). Alpha source rows
 *                      ONLY - the user-validated primary ("leave alpha").
 *   2. net27 lane      GET net27.cc/api/embed-tmdb/{id} - signed mp4s +
 *                      English captions (same lane soryn ships).
 *   3. NewTV lane      24-domain checknewtv probe (first hit wins, 3s cap,
 *                      memoized) -> search/post/player chain (soryn parity,
 *                      but bounded).
 *
 * Dropped in v15.0.0: the VidSpark (moviesapi.to) relay lane. Its rows played
 * through cdn-proxy workers - the same relay class the user already rejected
 * on device ("remove not working stream just leave alpha") - and soryn.js
 * carries no relay lane either.
 *
 * Standing rules kept: English-only (captions + Alpha labels), every fetch
 * capped, every lane fail-soft, no raw timers (guarded by hasTimers()).
 * The nvio post-filter tail (auto-injected) still enforces the language gate
 * and the >=720p floor on every row that leaves this file.
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

// ============================================================ id parsing

// ============================================================ id parsing v7

var TMDB_API_KEY = "439c478a771f35c05022f9feabcca01c";

var COMMON_HEADERS = {
  "Accept": "application/json, text/plain, */*",
  "Accept-Language": "en-US,en;q=0.9",
  "User-Agent": "Mozilla/5.0 (Linux; Android 13; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0 Mobile Safari/537.36"
};

function settings() {
  return typeof globalThis !== "undefined" && globalThis.SCRAPER_SETTINGS
    ? globalThis.SCRAPER_SETTINGS
    : (typeof global !== "undefined" && global.SCRAPER_SETTINGS ? global.SCRAPER_SETTINGS : {});
}

function merge(a, b) {
  var out = {}, k;
  for (k in (a || {})) out[k] = a[k];
  for (k in (b || {})) out[k] = b[k];
  return out;
}

function hasTimers() {
  return typeof setTimeout === "function";
}

function fetchText(url, headers, timeoutMs) {
  var opts = {
    method: "GET",
    redirect: "follow",
    headers: merge(COMMON_HEADERS, headers || {})
  };
  function fail(res) {
    return res.text().then(function () { throw new Error("HTTP " + res.status); });
  }
  if (!hasTimers()) return fetch(url, opts).then(function (res) {
    if (!res.ok) return fail(res);
    return res.text();
  });
  return new Promise(function (resolve, reject) {
    var timer = setTimeout(function () { reject(new Error("fetch timeout")); }, timeoutMs || 8000);
    fetch(url, opts).then(function (res) {
      clearTimeout(timer);
      if (!res.ok) fail(res).then(function (e) { reject(e); }, function (e) { reject(e); });
      else res.text().then(function (t) { resolve(t); }, function (e) { reject(e); });
    }).catch(function (e) { clearTimeout(timer); reject(e); });
  });
}

function fetchJson(url, headers, timeoutMs) {
  return fetchText(url, headers, timeoutMs).then(function (t) {
    try { return JSON.parse(t); } catch (e) { return null; }
  });
}

// ------------------------------------------------------------------- state

var CACHE_TTL = 8 * 60 * 1000;   // signed mp4 urls live ~1h; keep a safety margin
var _G = typeof globalThis !== "undefined" ? globalThis : typeof global !== "undefined" ? global : this;
var _nmState = _G.__NETMIRROR_STATE__ || (_G.__NETMIRROR_STATE__ = {
  cache: {},          // key -> { ts, streams }
  inflight: {},       // key -> Promise
  nmIdCache: {}       // tmdbKey -> { ts, cands }  (title->netmirror id mapping)
});

function cacheKey(tmdbId, mediaType, season, episode) {
  return (mediaType === "tv" ? "tv" : "movie") + ":" + tmdbId + ":" + (season || 1) + ":" + (episode || 1);
}

// ------------------------------------------------------------- TMDB helpers

function tmdbMeta(tmdbId, mediaType) {
  var endpoint = mediaType === "tv" ? "tv" : "movie";
  var url = "https://api.themoviedb.org/3/" + endpoint + "/" + tmdbId + "?api_key=" + TMDB_API_KEY;
  return fetchJson(url, null, 10000).then(function (data) {
    if (!data) return { title: "", year: "" };
    return {
      title: (mediaType === "tv" ? (data.name || data.original_name) : (data.title || data.original_title)) || "",
      originalTitle: data.original_title || data.original_name || "",
      year: data.first_air_date ? String(data.first_air_date).split("-")[0] : (data.release_date ? String(data.release_date).split("-")[0] : "")
    };
  }).catch(function () { return { title: "", year: "" }; });
}

function tmdbFindImdb(imdbId, mediaType) {
  var endpoint = mediaType === "tv" ? "tv" : "movie";
  var url = "https://api.themoviedb.org/3/find/" + encodeURIComponent(imdbId) +
    "?api_key=" + TMDB_API_KEY + "&external_source=imdb_id";
  return fetchJson(url, null, 10000).then(function (data) {
    var bucket = data && (data[endpoint + "_results"] || data.movie_results || data.tv_results);
    if (bucket && bucket.length && bucket[0].id) return String(bucket[0].id);
    return "";
  }).catch(function () { return ""; });
}

function tmdbSearchByTitle(title, year, mediaType) {
  var endpoint = mediaType === "tv" ? "tv" : "movie";
  var url = "https://api.themoviedb.org/3/search/" + endpoint + "?api_key=" + TMDB_API_KEY +
    "&query=" + encodeURIComponent(title) + (year ? "&year=" + encodeURIComponent(year) : "");
  if (mediaType === "tv") url = url.replace("&year=", "&first_air_date_year=");
  return fetchJson(url, null, 10000).then(function (data) {
    var rs = (data && data.results) || [];
    if (!rs.length) return "";
    if (year) {
      for (var i = 0; i < rs.length; i++) {
        var d = String(rs[i].release_date || rs[i].first_air_date || "");
        if (d.indexOf(year) === 0) return String(rs[i].id);
      }
    }
    return String(rs[0].id);
  }).catch(function () { return ""; });
}

/**
 * v7 (kept): tolerant catalog-id parser -> { tmdbId, season, episode } or null.
 * Accepts: bare digits, "109445:1:9" integer tails, tmdb:/movie:/series:/show:
 * prefixes (also "tmdb-"), asian-catalog fallback ids ("asian:pen-<slug>",
 * "pen:<slug>", "asian:pmh-/kh-/ks-/va-/ka-/an-...", bare slugs) resolved by
 * TMDB title search, and raw tt ids resolved by TMDB find. All lanes fail-soft
 * to null (caller returns []).
 */
function parseTmdbId(rawId, mediaType, season, episode) {
  var raw = String(rawId == null ? "" : rawId).trim();
  if (!raw) return Promise.resolve(null);
  try { raw = decodeURIComponent(raw); } catch (e0) {}
  raw = raw.split("#")[0].split("?")[0].replace(/\.json$/i, "").trim();

  var s = (season != null && season !== "" ? parseInt(season, 10) || null : null);
  var e = (episode != null && episode !== "" ? parseInt(episode, 10) || null : null);

  // strip source prefixes (loop handles chained shapes like "tmdb:movie:...")
  var prev = null;
  while (prev !== raw) {
    prev = raw;
    raw = raw.replace(/^(tmdb|movie|series|show|asian|pen|pmh|kh|ks|va|ka|an|kisskh|kissasian|viewasian|animotv|anikoto|pencuri)[:/]/i, "");
  }
  raw = raw.replace(/^tmdb-/i, "");

  // strip ":s:e" / "/s/e" tails (pure-integer last two parts). The tail is
  // ALWAYS removed from the core id (it is id syntax, not title text); the
  // numbers only ADOPT season/episode when the caller passed none.
  var parts = raw.split(/[:/]/);
  if (parts.length > 2) {
    var t1 = parts[parts.length - 2], t2 = parts[parts.length - 1];
    var n1 = parseInt(t1, 10), n2 = parseInt(t2, 10);
    if (n1 > 0 && n2 > 0 && String(n1) === t1 && String(n2) === t2) {
      s = s || n1;
      e = e || n2;
      parts = parts.slice(0, -2);
    }
  }
  var core = parts.join(":").trim();
  if (!core) return Promise.resolve(null);

  // lane 1: digits (fast path)
  if (/^\d+$/.test(core)) {
    return Promise.resolve({ tmdbId: core, season: s, episode: e });
  }

  // lane 2: tt imdb id
  if (/^tt\d+$/i.test(core)) {
    return tmdbFindImdb(core, mediaType).then(function (id) {
      return id ? { tmdbId: id, season: s, episode: e } : null;
    });
  }

  // lane 3: slug -> title + year -> TMDB search
  var srcPrefix = core.match(/^(pen|pmh|kh|ks|va|ka|an)-(?=[a-z0-9])/i);
  if (srcPrefix) core = core.slice(srcPrefix[0].length);
  var title = core.replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim();
  if (!title) return Promise.resolve(null);
  var year = "";
  var ym = title.match(/[\s]((?:19|20)\d{2})$/);
  if (ym) {
    year = ym[1];
    title = title.slice(0, ym.index).trim();
  }
  if (!title) return Promise.resolve(null);
  return tmdbSearchByTitle(title, year, mediaType).then(function (id) {
    return id ? { tmdbId: id, season: s, episode: e } : null;
  });
}

// ================================================== pure-JS SHA-256 / HMAC
// The plugin runtime has no CryptoJS; key and message are both pure ASCII
// ("net###@@sss", "<digits>:<digits>"), so byte arrays are charCodeAt-safe.

var K256 = [
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
];

function rotr(x, n) { return (x >>> n) | (x << (32 - n)); }

function sha256Bytes(msg /* number[] */) {
  var H = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];
  var len = msg.length;
  var bitLenHi = Math.floor(len / 536870912);            // len*8 / 2^32 high
  var bitLenLo = (len << 3) >>> 0;                       // low 32 bits (len << 3 overflows only past 2^29 bytes - fine here)
  var padded = msg.slice();
  padded.push(0x80);
  while (padded.length % 64 !== 56) padded.push(0);
  padded.push((bitLenHi >>> 24) & 255, (bitLenHi >>> 16) & 255, (bitLenHi >>> 8) & 255, bitLenHi & 255);
  padded.push((bitLenLo >>> 24) & 255, (bitLenLo >>> 16) & 255, (bitLenLo >>> 8) & 255, bitLenLo & 255);

  var w = new Array(64);
  for (var b = 0; b < padded.length; b += 64) {
    var i, t;
    for (i = 0; i < 16; i++) {
      var o = b + i * 4;
      w[i] = ((padded[o] << 24) | (padded[o + 1] << 16) | (padded[o + 2] << 8) | padded[o + 3]) >>> 0;
    }
    for (i = 16; i < 64; i++) {
      var s0 = rotr(w[i - 15], 7) ^ rotr(w[i - 15], 18) ^ (w[i - 15] >>> 3);
      var s1 = rotr(w[i - 2], 17) ^ rotr(w[i - 2], 19) ^ (w[i - 2] >>> 10);
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) >>> 0;
    }
    var a = H[0], bb = H[1], c = H[2], d = H[3], e = H[4], f = H[5], g = H[6], h = H[7];
    for (i = 0; i < 64; i++) {
      var S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
      var ch = (e & f) ^ (~e & g);
      t = (h + S1 + ch + K256[i] + w[i]) >>> 0;
      var S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
      var maj = (a & bb) ^ (a & c) ^ (bb & c);
      h = g; g = f; f = e;
      e = (d + t) >>> 0;
      d = c; c = bb; bb = a;
      a = (t + S0 + maj) >>> 0;
    }
    H[0] = (H[0] + a) >>> 0; H[1] = (H[1] + bb) >>> 0; H[2] = (H[2] + c) >>> 0; H[3] = (H[3] + d) >>> 0;
    H[4] = (H[4] + e) >>> 0; H[5] = (H[5] + f) >>> 0; H[6] = (H[6] + g) >>> 0; H[7] = (H[7] + h) >>> 0;
  }
  var out = new Array(32);
  for (var j = 0; j < 8; j++) {
    out[j * 4] = (H[j] >>> 24) & 255;
    out[j * 4 + 1] = (H[j] >>> 16) & 255;
    out[j * 4 + 2] = (H[j] >>> 8) & 255;
    out[j * 4 + 3] = H[j] & 255;
  }
  return out;
}

/** HMAC-SHA256 over ASCII strings -> lowercase hex. */
function hmacSha256Hex(keyStr, msgStr) {
  var key = [], msg = [], i;
  for (i = 0; i < keyStr.length; i++) key.push(keyStr.charCodeAt(i) & 255);
  for (i = 0; i < msgStr.length; i++) msg.push(msgStr.charCodeAt(i) & 255);
  if (key.length > 64) key = sha256Bytes(key);
  var ipad = new Array(64), opad = new Array(64);
  for (i = 0; i < 64; i++) {
    var kb = i < key.length ? key[i] : 0;
    ipad[i] = kb ^ 0x36;
    opad[i] = kb ^ 0x5c;
  }
  var inner = sha256Bytes(ipad.concat(msg));
  var outer = sha256Bytes(opad.concat(inner));
  var hex = "";
  for (i = 0; i < 32; i++) hex += (outer[i] < 16 ? "0" : "") + outer[i].toString(16);
  return hex;
}

// pure-JS base64 (Hermes-worst-case safe; no btoa dependency)
var B64_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
function b64Utf8(text) {
  // UTF-8 encode first
  var bytes = [], s = String(text == null ? "" : text);
  for (var i = 0; i < s.length; i++) {
    var c = s.charCodeAt(i);
    if (c < 128) bytes.push(c);
    else if (c < 2048) { bytes.push(192 | (c >> 6), 128 | (c & 63)); }
    else { bytes.push(224 | (c >> 12), 128 | ((c >> 6) & 63), 128 | (c & 63)); }
  }
  var out = "";
  for (var j = 0; j < bytes.length; j += 3) {
    var b1 = bytes[j], b2 = j + 1 < bytes.length ? bytes[j + 1] : -1, b3 = j + 2 < bytes.length ? bytes[j + 2] : -1;
    out += B64_CHARS.charAt(b1 >> 2);
    out += B64_CHARS.charAt(((b1 & 3) << 4) | (b2 >= 0 ? b2 >> 4 : 0));
    out += b2 >= 0 ? B64_CHARS.charAt(((b2 & 15) << 2) | (b3 >= 0 ? b3 >> 6 : 0)) : "=";
    out += b3 >= 0 ? B64_CHARS.charAt(b3 & 63) : "=";
  }
  return out;
}

function formEncode(params) {
  var parts = [];
  for (var k in params) {
    if (!Object.prototype.hasOwnProperty.call(params, k)) continue;
    parts.push(encodeURIComponent(k) + "=" + encodeURIComponent(params[k]));
  }
  return parts.join("&");
}

// =============================================== netmirror.center core v8

var NM_PAGE_BASE = "https://netmirror.center";        // referer origin
var NM_DETAIL_API = "https://api2.imdb3.shop/api";    // detail: /{movie|tv}/{nmId}
var NM_SEARCH_API = "https://api2.imdb4.shop/api/search2";
var NM_SIGN_KEY = "net###@@sss";
// v9: the site's "Multi-Lang Server" (p==7) - a second delivery stack whose
// HLS/DASH sources are fully proxied through cinemaos-relay workers (no
// bcdnxw contact -> immune to the video CDN's 429 rate limiting). v10: the
// ONLY netmirror.center lane kept - and only its Alpha sources (user report:
// every other source row fails to play on the device).
var NM_PVR_URL = "https://play.watch21.shop/play/watchpvr.php";
// watchpvr source labels: v10 emits ONLY "Alpha ..." rows (user instruction:
// "remove not working stream just leave alpha"); PVR_BLOCK_RE stays as a
// second safety net for dubbed/unlabeled Alpha variants.
var PVR_BLOCK_RE = new RegExp(
  "\\b(hindi|arabic|russian|kurdish|french|spanish|portuguese|indonesian|bahasa|" +
  "tamil|telugu|malayalam|kannada|korean|japanese|chinese|mandarin|cantonese|" +
  "german|deutsch|turkish|thai|vietnamese|urdu|bangla|bengali|punjabi|malay|" +
  "multi[\\s\\-]*audio)\\b", "i");

// search-result title labels: [English] preferred; dubbed variants skipped
// (standing rule: netmirror is English-only)
var NM_EN_RE = /\b(english|eng)\b/i;
var NM_DUB_RE = /\b(hindi|tamil|telugu|malayalam|punjabi|bengali|bangla|indonesian|bahasa|malay|chinese|mandarin|cantonese|korean|japanese|spanish|espanol|arabic|french|german|russian|portuguese|thai|vietnamese|urdu|turkish|filipino|tagalog|dubbed)\b/i;

function nmTitleNorm(t) {
  var s = String(t || "").toLowerCase();
  s = s.replace(/\[[^\]]*\]/g, " ");                 // [English] / [Hindi] labels
  s = s.replace(/\([^)]*\)/g, " ");
  s = s.replace(/\bs\d+(?:\s*[-–]\s*s?\d+)?\b/g, " "); // "S1-S5" / "S1" suffixes
  s = s.replace(/\bseason\s*\d+\b/g, " ");
  s = s.replace(/[^a-z0-9]+/g, " ").trim();
  return s;
}

function nmYearOf(text) {
  var m = String(text || "").match(/(19|20)\d{2}/);
  return m ? m[0] : "";
}

/** search2 path built with the site's own query conventions. */
function nmSearchPath(title) {
  var q = encodeURIComponent(String(title).trim()).replace(/%20/g, "+").replace(/%2F/g, "--slash--");
  return NM_SEARCH_API + "/" + q + "?page=0";
}

/**
 * Map a TMDB title to up to 3 netmirror ids, best first.
 * Ranking: [English] label > bare title; year exact > +-1 > other.
 * Dubbed variants are dropped entirely (English-only rule).
 */
function nmCandidates(meta, mediaType) {
  var type = mediaType === "tv" ? "tv" : "movie";
  var titles = [];
  var t1 = String(meta.title || "").trim();
  if (t1) titles.push(t1);
  var t2 = String(meta.originalTitle || "").trim();
  if (t2 && nmTitleNorm(t2) !== nmTitleNorm(t1)) titles.push(t2);
  if (!titles.length) return Promise.resolve([]);

  var ckey = type + ":" + nmTitleNorm(t1) + ":" + (meta.year || "");
  var hit = _nmState.nmIdCache[ckey];
  if (hit && Date.now() - hit.ts < 30 * 60 * 1000) return Promise.resolve(hit.cands);

  function searchOne(title) {
    return fetchJson(nmSearchPath(title), { Referer: NM_PAGE_BASE + "/" }, 12000).then(function (j) {
      var rs = (j && j.results) || [];
      var scored = [];
      rs.forEach(function (r) {
        if (!r || r.id == null) return;
        var mt = String(r.media_type || "").toLowerCase();
        if (mt !== type) return;                       // strict type match
        var label = String(r.title || "").trim();
        var bracket = (label.match(/\[([^\]]*)\]/) || [])[1] || "";
        var rank;
        if (NM_EN_RE.test(bracket)) rank = 0;
        else if (NM_DUB_RE.test(bracket)) return;      // dubbed audio - skip
        else rank = 1;                                 // bare / unknown label
        var yr = nmYearOf(r.release_date);
        var my = parseInt(meta.year || "0", 10) || 0;
        var ny = parseInt(yr || "0", 10) || 0;
        var yrank = (!my || !ny) ? 1 : (ny === my ? 0 : (Math.abs(ny - my) <= 1 ? 1 : 2));
        scored.push({ id: String(r.id), rank: rank * 10 + yrank });
      });
      scored.sort(function (a, b) { return a.rank - b.rank; });
      var cands = [];
      scored.forEach(function (x) {
        if (cands.indexOf(x.id) === -1 && cands.length < 3) cands.push(x.id);
      });
      return cands;
    }).catch(function () { return []; });
  }

  return searchOne(titles[0]).then(function (cands) {
    if (cands.length || titles.length < 2) return cands;
    return searchOne(titles[1]);
  }).then(function (cands) {
    if (cands.length) _nmState.nmIdCache[ckey] = { ts: Date.now(), cands: cands };
    return cands;
  });
}

function nmDetail(nmId, type) {
  var url = NM_DETAIL_API + "/" + type + "/" + encodeURIComponent(nmId);
  return fetchJson(url, { Referer: NM_PAGE_BASE + "/", "Content-Type": "application/json" }, 12000)
    .then(function (j) {
      var r = j && j.results && j.results[0];
      if (!r || !r.subjectid || !r.dp) return null;
      return {
        id: String(r.id || nmId),
        subjectid: String(r.subjectid),
        dp: String(r.dp),
        title: String(r.title || "").trim(),
        release: String(r.release_date || "")
      };
    }).catch(function () { return null; });
}

function nmSign(nmId) {
  var ts = Math.floor(Date.now() / 1000);
  return { ts: ts, sig: hmacSha256Hex(NM_SIGN_KEY, nmId + ":" + ts) };
}

function qRank(txt) {
  var q = qualityLabel(txt);
  if (q === "4K") return 5;
  if (q === "1440p") return 4;
  if (q === "1080p") return 3;
  if (q === "720p") return 2;
  if (q === "Auto") return 1;
  return 0;
}

function qualityLabel(txt) {
  var m = String(txt || "").toLowerCase().match(/(\d{3,4})\s*p/);
  if (!m) return "Auto";
  var n = parseInt(m[1], 10);
  if (n >= 2100) return "4K";
  if (n >= 1300) return "1440p";
  if (n >= 1000) return "1080p";
  if (n >= 640) return "720p";
  return n + "p";
}

// ================================================== net27.cc embed lane (v14)
// FULLY DECODED from the All-in-One-Nuvio provider (string tables resolved,
// decoder machinery stripped) and LIVE-VERIFIED on 2026-09-13:
//   * GET https://net27.cc/api/embed-tmdb/{tmdbId} (movie) or
//         https://net27.cc/api/embed-tmdb/{tmdbId}?type=tv&s={se}&e={ep}
//     with {Accept: application/json..., Referer: https://net27.cc/, UA Chrome/147}
//     answers {ok:true, streams:[{url,resolution}], mp4, captions:[{url,lang,name}]}
//   * The signed mp4 CDNs (bcdnxw.hakunaymatata.com family) serve
//     HTTP 206 @ 8MB/s with Referer https://videodownloader.site/ but answer
//     429 with the net27 referer or no referer - the videodownloader referer
//     is REQUIRED on the stream rows (this is the exact AIO device behaviour).
//   * Captions come RELATIVE (/api/proxy/video?url=...) and must be prefixed
//     with https://net27.cc - the proxy 302s to the signed CloudFront SRT.
//   * The endpoint burst-limits (2 rapid calls then 502 "error code: 502"):
//     ONE call per getStreams run, 502 -> empty lane (other lanes cover), 8min
//     response cache via the module cache. No probing, no verification.
var N27_API = "https://net27.cc/api/embed-tmdb/";
var N27_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36";
var N27_STREAM_HEADERS = { Referer: "https://videodownloader.site/", "User-Agent": N27_UA };

function nmN27Quality(res) {
  var n = parseInt(res, 10);
  if (!n || n <= 0) return "Auto";
  return n + "p";
}

var qRankN27 = { "2160p": 0, "1440p": 1, "1080p": 2, "720p": 3, "480p": 4, "360p": 5, "Auto": 6 };

function nmN27Rows(d, mediaTitle) {
  var rows = [];
  var seen = {};
  var subs = [];
  (d.captions || []).forEach(function (c) {
    if (!c || !c.url) return;
    // standing rule: netmirror is English-only (cinemacity covers Tagalog)
    var lang = String(c.lang || "en").toLowerCase();
    if (lang !== "en" && lang !== "english") return;
    var url = String(c.url);
    if (url.charAt(0) === "/") url = "https://net27.cc" + url;
    subs.push({ url: url, language: "en", name: String(c.name || "English") });
  });
  var push = function (url, quality) {
    if (!url) return;
    var prev = seen[url];
    if (prev) {
      // same file advertised at several resolutions (480p/720p share one URL):
      // keep the HIGHEST label so the post-filter's >=720p floor keeps the row
      var pr = qRankN27[prev], nr = qRankN27[quality];
      if (nr != null && (pr == null || nr < pr)) seen[url] = quality;
      return;
    }
    seen[url] = quality;
  };
  (d.streams || []).forEach(function (s) {
    if (s && s.url) push(String(s.url), nmN27Quality(s.resolution));
  });
  if (!Object.keys(seen).length && d.mp4) push(String(d.mp4), "Auto");
  // rebuild rows keeping the best quality per url, highest first
  var qRank = qRankN27;
  var best = {};
  Object.keys(seen).forEach(function (u) {
    var q = seen[u];
    var cur = best[u];
    if (!cur || (qRank[q] != null && qRank[cur] != null && qRank[q] < qRank[cur])) best[u] = q;
  });
  var list = Object.keys(best).map(function (u) {
    var q = best[u];
    return {
      name: "NetMirror (Netflix) - " + q,
      title: (mediaTitle ? mediaTitle : "NetMirror") + " | " + q + " | NetMirror",
      url: u,
      quality: q,
      headers: N27_STREAM_HEADERS,
      behaviorHints: { notWebReady: false },
      subtitles: subs.length ? subs : undefined
    };
  });
  list.sort(function (a, b) {
    var ra = qRank[a.quality] != null ? qRank[a.quality] : 99;
    var rb = qRank[b.quality] != null ? qRank[b.quality] : 99;
    return ra - rb;
  });
  return { rows: list, subs: subs };
}

function nmNet27(type, tmdbId, se, ep, mediaTitle) {
  var ckey = "n27:" + tmdbId + ":" + type + ":" + se + ":" + ep;
  var hit = _nmState.cache[ckey];
  if (hit && Date.now() - hit.ts < CACHE_TTL) return Promise.resolve(hit.data);
  var url = N27_API + encodeURIComponent(tmdbId);
  if (type === "tv") url += "?type=tv&s=" + parseInt(se, 10) + "&e=" + parseInt(ep, 10);
  return fetchJson(url, {
    "Accept": "application/json, text/plain, */*",
    "Referer": "https://net27.cc/",
    "User-Agent": N27_UA
  }, 8000).then(function (d) {
    if (!d || d.ok !== true) throw new Error(d && d.error ? "net27: " + d.error : "net27: not ok");
    var out = nmN27Rows(d, mediaTitle);
    if (!out.rows.length) throw new Error("net27: no sources (mode " + (d.mode || "?") + ")");
    console.log("[NetMirror] net27 lane: " + out.rows.length + " row(s) + " + out.subs.length + " en caption(s)");
    _nmState.cache[ckey] = { ts: Date.now(), data: out };
    return out;
  }).catch(function (e) {
    console.log("[NetMirror] net27 lane: " + (e && e.message ? e.message : e));
    return { rows: [], subs: [] };
  });
}

// ================================================== watchpvr (Multi-Lang) lane

/** Parse the `const qualities = [...]` JSON array out of a watchpvr page. */
function parsePvr(html) {
  var m = String(html || "").match(/(const|let|var)\s+qualities\s*=\s*(\[[\s\S]*?\])\s*;/);
  if (!m) return [];
  try {
    var arr = JSON.parse(m[2].replace(/,\s*([}\]])/g, "$1"));
    return Array.isArray(arr) ? arr : [];
  } catch (e0) { return []; }
}

/** Parse the watchpvr page's subtitle array (Alpha-row caption fallback). */
function parsePvrSubs(html) {
  var m = String(html || "").match(/(const|let|var)\s+subtitles\s*=\s*(\[[\s\S]*?\])\s*;/);
  if (!m) return [];
  try {
    var arr = JSON.parse(m[2].replace(/,\s*([}\]])/g, "$1"));
    if (!Array.isArray(arr)) return [];
    var out = [];
    arr.forEach(function (s) {
      if (s && s.url) out.push({ label: s.name || s.html || s.lang || "", url: s.url });
    });
    return out;
  } catch (e0) { return []; }
}

/** watchpvr source entries carry explicit quality fields ("720p"/"FHD"). */
function pvrEntryQuality(entry) {
  var q = qualityLabel(entry && entry.quality);
  if (q === "Auto") {
    var f = String((entry && entry.quality) || "").toLowerCase();
    if (f === "fhd") return "1080p";
    if (f === "hd") return "720p";
    q = qualityLabel(entry && entry.html);
    if (q === "Auto") {
      var h = String((entry && entry.html) || "").toLowerCase();
      if (/\bfhd\b/.test(h)) q = "1080p";
      else if (/\bhd\b/.test(h)) q = "720p";
    }
  }
  return q;
}

function pvrKind(entry) {
  var t = String((entry && entry.type) || "").toLowerCase();
  var u = String((entry && entry.url) || "");
  if (/\.mpd(\?|$)/i.test(u)) return "DASH";
  if (t === "dash" || /\.mpd/i.test(u)) return "DASH";
  if (t === "m3u8" || /\.m3u8/i.test(u)) return "HLS";
  if (t === "mp4" || /\.mp4/i.test(u)) return "MP4";
  return "HLS";
}

/** watchpvr player URL (same signing scheme as watchbox, + tm_id). */
function nmPvrUrl(d, se, ep, tmdbId) {
  var s = nmSign(d.id);
  var year = nmYearOf(d.release.split(",")[1] ? d.release : "");
  var commaYear = "";
  if (d.release.indexOf(",") !== -1) commaYear = d.release.split(",")[1] || "";
  year = commaYear || year;
  return NM_PVR_URL + "?" + formEncode({
    id: d.subjectid,
    se: se || 0,
    ep: ep || 0,
    dp: d.dp,
    na: b64Utf8(d.title),
    year: year,
    tm_id: tmdbId == null ? "" : String(tmdbId),
    ts: s.ts,
    sig: s.sig,
    nid: d.id,
    exten: "",
    tv: "",
    token: ""
  });
}

/**
 * v9: the "Multi-Lang Server" lane. watchpvr.php renders a `const qualities`
 * JSON array of sources carried through cinemaos-relay workers (fully proxied
 * - the video CDN's 429 rate limiting never applies). The page is served by
 * load-balanced backends and SOMETIMES lacks the array, so retry up to 3x
 * with a fresh signature. Rows are ordered HLS -> DASH -> MP4 and labeled
 * with the site's own source name ("Eos - 1080p", ...).
 * Returns { rows, subs } - subs = raw SRT entries (also fed to watchbox rows).
 */
function nmPvrResolve(d, se, ep, tmdbId, attempts) {
  var n = attempts || 3;
  function attempt(i) {
    return fetchText(nmPvrUrl(d, se, ep, tmdbId), { Referer: NM_PAGE_BASE + "/" }, 12000)
      .then(function (html) {
        var entries = parsePvr(html);
        if (!entries.length) throw new Error("no qualities array");
        return { html: html, entries: entries };
      }).catch(function () {
        if (i + 1 < n) {
          return (hasTimers() ? new Promise(function (res) { setTimeout(res, 300); }) : Promise.resolve())
            .then(function () { return attempt(i + 1); });
        }
        return { html: "", entries: [] };
      });
  }
  return attempt(0).then(function (r) {
    var rows = [], seen = {};
    var order = { HLS: 0, DASH: 1, MP4: 2 };
    var kept = [];
    (r.entries || []).forEach(function (entry) {
      if (!entry || !entry.url) return;
      var label = String(entry.html || entry.label || "").trim();
      if (!label) return;
      // v10: ONLY "Alpha" sources (user: "remove not working stream just
      // leave alpha" - every other Multi-Lang source fails on the device)
      if (!/^alpha\b/i.test(label)) return;
      if (PVR_BLOCK_RE.test(label)) return;          // dubbed/subbed safety net
      var kind = pvrKind(entry);
      var q = pvrEntryQuality(entry);
      if (!q || q === "Auto") return;                // unlabelable -> skip
      if (seen[entry.url]) return;
      seen[entry.url] = 1;
      kept.push({ entry: entry, label: label, kind: kind, q: q });
    });
    kept.sort(function (a, b) {
      var d1 = (order[a.kind] || 9) - (order[b.kind] || 9);
      if (d1 !== 0) return d1;
      return qRank(b.q) - qRank(a.q);
    });
    kept.forEach(function (k) {
      var quality = qualityLabel(k.q);
      if (quality === "Auto") quality = k.q;
      rows.push({
        name: "NetMirror | " + k.label,
        title: k.label + " | " + quality + " | NetMirror " + k.kind + " relay",
        url: k.entry.url,
        quality: quality,
        headers: { Referer: NM_PAGE_BASE + "/" }
      });
    });
    return { rows: rows, subs: parsePvrSubs(r.html) };
  });
}

// subtitle track labels seen in watchbox pages -> Nuvio language fields
// (labels arrive in native scripts - Arabic/Cyrillic/Devanagari/... - so the
// map matches script ranges too; anything unmatched stays "unk" and never
// masquerades as English)
var SUB_LANG_MAP = [
  [/english|eng/i, "en", "English"],
  [/filipino|tagalog|pilipino|\bfil\b/i, "fil", "Tagalog / Filipino"],
  [/espanol|spanish/i, "es", "Spanish"],
  [/fran/i, "fr", "French"],
  [/kiswahili|swahili/i, "sw", "Swahili"],
  [/[\u0400-\u04FF]/, "ru", "Russian"],
  [/[\u0600-\u06FF]/, "ar", "Arabic"],
  [/[\u0900-\u097F]/, "hi", "Hindi"],
  [/[\u0980-\u09FF]/, "bn", "Bengali"],
  [/[\u0A00-\u0A7F]/, "pa", "Punjabi"],
  [/[\u4E00-\u9FFF]/, "zh", "Chinese"],
  [/indon|bahasa/i, "id", "Indonesian"],
  [/malay/i, "ms", "Malay"],
  [/portug|brasileiro/i, "pt", "Portuguese"],
  [/arab/i, "ar", "Arabic"],
  [/bangla|bengali/i, "bn", "Bengali"],
  [/punjabi/i, "pa", "Punjabi"],
  [/urdu/i, "ur", "Urdu"],
  [/chinese|mandarin|cantonese/i, "zh", "Chinese"]
];

function subsFor(subEntries) {
  var mode = settings().captionLang || "en+fil";
  var prio = [];
  subEntries.forEach(function (s) {
    if (!s || !s.url) return;
    // unmatched labels stay "unk" - they must never masquerade as English
    var lang = "unk", name = s.label || "Subtitles";
    for (var i = 0; i < SUB_LANG_MAP.length; i++) {
      if (SUB_LANG_MAP[i][0].test(s.label || "")) {
        lang = SUB_LANG_MAP[i][1];
        name = SUB_LANG_MAP[i][2];
        break;
      }
    }
    if (mode === "en" && lang !== "en") return;
    if (mode === "en+fil" && !(lang === "en" || lang === "fil")) return;
    var p = lang === "en" ? 0 : (lang === "fil" ? 1 : 2);
    prio.push({ url: s.url, language: lang, name: name, p: p });
  });
  prio.sort(function (a, b) { return a.p - b.p; });
  return prio.slice(0, 8).map(function (x) {
    return { url: x.url, language: x.language, name: x.name };
  });
}

/**
 * One netmirror candidate (v10): detail -> watchpvr lane (ALPHA SOURCES ONLY)
 * -> stream rows. The watchbox mp4 fan-out is GONE (its bcdn*.hakunaymatata
 * rows were the "not working" streams the user asked to remove.
 */
function nmResolveCandidate(nmId, type, se, ep, meta, tmdbId) {
  return nmDetail(nmId, type).then(function (d) {
    if (!d) return [];
    return nmPvrResolve(d, se, ep, tmdbId, 3).then(function (pvr) {
      var subs = subsFor((pvr && pvr.subs) || []);
      var rows = [];
      ((pvr && pvr.rows) || []).forEach(function (r) {
        r.headers = { Referer: NM_PAGE_BASE + "/" };
        if (subs.length) r.subtitles = subs;
        rows.push(r);
      });
      return rows;
    });
  }).catch(function () { return []; });
}

/**
 * v12: NewTV lane - the decoded AIO netmirror's REAL device path (1:1 port).
 * 1. resolveNtvApi(): GET {base}/checknewtv.php across the 24 mobiledetect/
 *    mobidetect domains (X-Requested-With: NetmirrorNewTV v1.0, GatuNewTV user agent)
 *    -> {token_hash: base64} -> decode = live API base (memoized module-wide;
 *    verified 2026-09: mobiledetects.com -> tv.imgcdn.kim; the API itself is
 *    IP-gated - 403 "Page Not Found" from datacenter, works on retail IPs).
 * 2. GET {api}/newtv/search.php?s={title} -> searchResult[0].id
 * 3. GET {api}/newtv/post.php?id= (Lastep/Usertoken headers) -> type,
 *    episodes[{id,ep|epNum,sNum}], main_id, season[], nextPageShow
 * 4. tv: match season/episode (incl. pagination via /newtv/episodes.php?id=
 *    &page=N while nextPageShow==1); movie: main_id (skip when type==="t")
 * 5. GET {api}/newtv/player.php?id={id} -> {status:"ok",video_link,referer}
 *    -> one Auto row, Referer = resp.referer || api base.
 * Fail-soft everywhere; resolution memoized across calls; platforms tried in
 * AIO order (netflix -> primevideo -> hotstar) until one yields a stream.
 */
var NM_NTV_DOMAINS = [
  "aHR0cHM6Ly9tb2JpbGVkZXRlY3RzLmNvbQ==", "aHR0cHM6Ly9tb2JpbGVkZXRlY3QuYXBw", "aHR0cHM6Ly9tb2JpZGV0ZWN0LmFydA==",
  "aHR0cHM6Ly9tb2JpZGV0ZWN0LmNj", "aHR0cHM6Ly9tb2JpZGV0ZWN0LmNsaWNr", "aHR0cHM6Ly9tb2JpZGV0ZWN0Lmluaw==",
  "aHR0cHM6Ly9tb2JpZGV0ZWN0LmxpdmU=", "aHR0cHM6Ly9tb2JpZGV0ZWN0LnBybw==", "aHR0cHM6Ly9tb2JpZGV0ZWN0LnNob3A=",
  "aHR0cHM6Ly9tb2JpZGV0ZWN0LnNpdGU=", "aHR0cHM6Ly9tb2JpZGV0ZWN0LnNwYWNl", "aHR0cHM6Ly9tb2JpZGV0ZWN0LnN0b3Jl",
  "aHR0cHM6Ly9tb2JpZGV0ZWN0LnZpcA==", "aHR0cHM6Ly9tb2JpZGV0ZWN0Lndpa2k=", "aHR0cHM6Ly9tb2JpZGV0ZWN0Lnh5eg==",
  "aHR0cHM6Ly9tb2JpZGV0ZWN0cy5hcnQ=", "aHR0cHM6Ly9tb2JpZGV0ZWN0cy5jYw==", "aHR0cHM6Ly9tb2JpZGV0ZWN0cy5pbmZv",
  "aHR0cHM6Ly9tb2JpZGV0ZWN0cy5pbms=", "aHR0cHM6Ly9tb2JpZGV0ZWN0cy5saXZl", "aHR0cHM6Ly9tb2JpZGV0ZWN0cy5wcm8=",
  "aHR0cHM6Ly9tb2JpZGV0ZWN0cy5zdG9yZQ==", "aHR0cHM6Ly9tb2JpZGV0ZWN0cy50b3A=", "aHR0cHM6Ly9tb2JpZGV0ZWN0cy54eXo="
];
var NM_NTV_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:136.0) Gecko/20100101 Firefox/136.0 /OS.GatuNewTV v1.0";

function nmNtvHeaders(ott, extra) {
  var h = {
    "Cache-Control": "no-cache, no-store, must-revalidate",
    "Pragma": "no-cache",
    "Expires": "0",
    "X-Requested-With": "NetmirrorNewTV v1.0",
    "User-Agent": NM_NTV_UA,
    "Accept": "application/json, text/plain, */*",
    "Ott": ott || "nf"
  };
  return merge(h, extra || {});
}

function nmB64Decode(s) {
  try {
    if (typeof atob === "function") return atob(s);
  } catch (e0) { }
  try {
    if (typeof Buffer !== "undefined" && Buffer.from) return Buffer.from(s, "base64").toString("binary");
  } catch (e1) { }
  var B64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=", out = "", bits = 0, acc = 0;
  for (var i = 0; i < s.length; i++) {
    var c = B64.indexOf(s.charAt(i));
    if (c < 0 || c === 64) continue;
    acc = (acc << 6) | c; bits += 6;
    if (bits >= 8) { bits -= 8; out += String.fromCharCode((acc >> bits) & 0xff); }
  }
  return out;
}

function nmNtvResolve() {
  if (_nmState.ntvApi) return Promise.resolve(_nmState.ntvApi);
  if (_nmState.ntvResolving) return _nmState.ntvResolving;
  var resolved = null;
  var tryOne = function (i) {
    if (resolved || i >= NM_NTV_DOMAINS.length) return Promise.resolve();
    var base = nmB64Decode(NM_NTV_DOMAINS[i]).replace(/\/$/, "");
    return fetchJson(base + "/checknewtv.php", null, 3000).then(function (j) {
      if (j && j.token_hash) {
        var api = nmB64Decode(j.token_hash).replace(/\/$/, "");
        if (api) {
          resolved = api;
          _nmState.ntvApi = api;
          console.log("[NetMirror] NewTV api resolved: " + api);
          return;
        }
      }
      return tryOne(i + 1);
    }).catch(function () { return tryOne(i + 1); });
  };
  _nmState.ntvResolving = tryOne(0).then(function () {
    _nmState.ntvResolving = null;
    return resolved;
  }).catch(function () {
    _nmState.ntvResolving = null;
    return null;
  });
  return _nmState.ntvResolving;
}

function nmNtvEpFromEntry(e) {
  if (!e) return null;
  var ep = null;
  if (e.ep != null && e.ep !== "") ep = parseInt(e.ep, 10);
  else if (e.epNum) ep = parseInt(String(e.epNum).replace("E", ""), 10);
  var s = null;
  if (e.sNum) s = parseInt(String(e.sNum).replace("S", ""), 10);
  return { id: e.id, s: s, ep: ep };
}

function nmNtvRows(title, type, se, ep) {
  return nmNtvResolve().then(function (api) {
    if (!api || !title) return { rows: [] };
    // platform order mirrors AIO: netflix -> primevideo -> hotstar
    var platforms = ["nf", "pv", "hs"];
    var names = { nf: "Netflix", pv: "Prime Video", hs: "Hotstar" };
    var chain = Promise.resolve({ rows: [] });
    platforms.forEach(function (ott) {
      chain = chain.then(function (acc) {
        if (acc && acc.rows && acc.rows.length) return acc;
        return nmNtvPlatform(api, ott, names[ott] || ott, title, type, se, ep).catch(function () { return { rows: [] }; });
      });
    });
    return chain;
  }).catch(function () { return { rows: [] }; });
}

function nmNtvPlatform(api, ott, label, title, type, se, ep) {
  var H = nmNtvHeaders(ott);
  return fetchJson(api + "/newtv/search.php?s=" + encodeURIComponent(title), H, 5000).then(function (sr) {
    var list = sr && sr.searchResult;
    if (!list || !list.length) return { rows: [] };
    var showId = list[0].id;
    return fetchJson(api + "/newtv/post.php?id=" + showId, merge(H, { Lastep: "", Usertoken: "" }), 5000).then(function (post) {
      if (!post) return { rows: [] };
      var pid = showId;
      if (type === "tv") {
        var eps = (post.episodes || []).filter(function (x) { return !!x; }).map(nmNtvEpFromEntry);
        var found = null;
        for (var i = 0; i < eps.length; i++) {
          if (eps[i] && eps[i].s === (parseInt(se, 10) || 1) && eps[i].ep === (parseInt(ep, 10) || 1)) { found = eps[i]; break; }
        }
        if (!found) {
          var seasonId = null;
          if (post.season && post.season.length) {
            for (var k = 0; k < post.season.length; k++) {
              if (post.season[k] && post.season[k].id) { seasonId = post.season[k].id; break; }
            }
          } else if (post.nextPageSeason) seasonId = post.nextPageSeason;
          if (seasonId && post.nextPageShow === 1) {
            return nmNtvEpisodesPage(api, H, seasonId, 2, parseInt(se, 10) || 1, parseInt(ep, 10) || 1);
          }
          return { rows: [] };
        }
        pid = found.id;
      } else {
        if (post.type === "t") return { rows: [] }; // it is a tv show, not a movie
        pid = post.main_id || showId;
      }
      return fetchJson(api + "/newtv/player.php?id=" + pid, merge(H, { Usertoken: "" }), 5000).then(function (pl) {
        if (!pl || pl.status !== "ok" || !pl.video_link) return { rows: [] };
        return {
          rows: [{
            name: "NetMirror | " + label,
            title: label + " | NetMirror NewTV",
            url: pl.video_link,
            quality: "Auto",
            headers: { Referer: pl.referer || api }
          }]
        };
      });
    });
  });
}

function nmNtvEpisodesPage(api, H, seasonId, page, se, ep) {
  return fetchJson(api + "/newtv/episodes.php?id=" + seasonId + "&page=" + page, H, 5000).then(function (p) {
    var eps = (p && p.episodes ? p.episodes : []).filter(function (x) { return !!x; }).map(nmNtvEpFromEntry);
    for (var i = 0; i < eps.length; i++) {
      if (eps[i] && (eps[i].s == null || eps[i].s === se) && eps[i].ep === ep) {
        return fetchJson(api + "/newtv/player.php?id=" + eps[i].id, merge(H, { Usertoken: "" }), 5000).then(function (pl) {
          if (!pl || pl.status !== "ok" || !pl.video_link) return { rows: [] };
          return { rows: [{ name: "NetMirror | NewTV", title: "NetMirror NewTV", url: pl.video_link, quality: "Auto", headers: { Referer: pl.referer || api } }] };
        });
      }
    }
    if (p && p.nextPageShow === 1 && page < 6) return nmNtvEpisodesPage(api, H, seasonId, page + 1, se, ep);
    return { rows: [] };
  });
}

// ============================================================== getStreams
// soryn-style flat flow: parse id -> fetch meta -> run the three lanes in
// parallel -> URL-dedup merge (Alpha first) -> cache + late-cache.

function getStreams(tmdbId, mediaType, season, episode) {
  var rawId = "";
  try { rawId = String(tmdbId == null ? "" : tmdbId); } catch (e0) { rawId = ""; }
  if (!rawId) return Promise.resolve([]);

  var key = cacheKey(rawId, mediaType, season, episode);
  var hit = _nmState.cache[key];
  if (hit && Date.now() - hit.ts < CACHE_TTL) return Promise.resolve(hit.streams);
  if (_nmState.inflight[key]) return _nmState.inflight[key];

  console.log("[NetMirror] v15 start " + mediaType + " " + rawId + " S" + season + "E" + episode);
  var type = (mediaType === "tv" || mediaType === "series") ? "tv" : "movie";

  var run = parseTmdbId(rawId, mediaType, season, episode).then(function (p) {
    if (!p) { console.log("[NetMirror] id unresolvable: " + rawId); return []; }
    var se, ep;
    if (type === "tv") {
      se = (season != null && season !== "") ? parseInt(season, 10) || 1 : (p.season || 1);
      ep = (episode != null && episode !== "") ? parseInt(episode, 10) || 1 : (p.episode || 1);
    } else {
      // the watchpvr endpoint treats a movie like an episode-less show;
      // se=1&ep=1 would serve an empty player page - keep 0/0 there.
      se = 0; ep = 0;
    }

    // one shared TMDB meta fetch feeds the Alpha and NewTV lanes
    var metaP = tmdbMeta(p.tmdbId, type).catch(function () { return null; });

    // net27 lane: TMDB id direct, one fetch, real signed mp4s + en captions
    var n27P = metaP.then(function (meta) {
      return nmNet27(type, p.tmdbId, se, ep, meta && meta.title);
    }).catch(function () { return { rows: [], subs: [] }; });

    // Alpha lane: title mapping -> detail -> watchpvr (Alpha rows only)
    var alphaP = metaP.then(function (meta) {
      if (!meta || !meta.title) return [];
      return nmCandidates(meta, type).then(function (cands) {
        if (!cands.length) return [];
        // candidates resolve IN PARALLEL - first set with rows wins
        return Promise.all(cands.slice(0, 3).map(function (nmId) {
          return nmResolveCandidate(nmId, type, se, ep, meta, p.tmdbId)
            .catch(function () { return []; });
        })).then(function (sets) {
          for (var i = 0; i < sets.length; i++) {
            if (sets[i] && sets[i].length) return sets[i];
          }
          return [];
        });
      });
    }).catch(function () { return []; });

    // NewTV lane: 6s lane cap (bootstrap + API answer in <1s when alive)
    var ntP = metaP.then(function (meta) {
      var runLane = nmNtvRows(meta && meta.title, type, se, ep);
      return hasTimers()
        ? Promise.race([runLane, new Promise(function (res) {
            var t = setTimeout(function () { res({ rows: [] }); }, 6000);
            if (t && typeof t.unref === "function") t.unref();
          })])
        : runLane;
    }).catch(function () { return { rows: [] }; });

    function combine(alphaRows, nt, n27) {
      var rows = [], seenUrl = {};
      function add(r) {
        if (!r || !r.url) return;
        var k = String(r.url).split("#")[0];
        if (seenUrl[k]) return;
        seenUrl[k] = 1;
        rows.push(r);
      }
      (alphaRows || []).forEach(add);            // user-validated lane first
      ((n27 && n27.rows) || []).forEach(add);
      ((nt && nt.rows) || []).forEach(add);
      return rows;
    }

    // Alpha relay answers in ~2-4s on device; 9s cap so the sheet never waits
    var alphaCapP = hasTimers()
      ? Promise.race([alphaP, new Promise(function (res) {
          var t = setTimeout(function () { res([]); }, 9000);
          if (t && typeof t.unref === "function") t.unref();
        })])
      : alphaP;

    return Promise.all([
      alphaCapP.catch(function () { return []; }),
      ntP.catch(function () { return { rows: [] }; }),
      n27P.catch(function () { return { rows: [], subs: [] }; })
    ]).then(function (res) {
      var rows = combine(res[0], res[1], res[2]);
      console.log("[NetMirror] serving " + rows.length + " stream(s) (alpha " +
        (res[0] || []).length + ", net27 " + ((res[2] && res[2].rows) || []).length +
        ", newtv " + ((res[1] && res[1].rows) || []).length + ")");
      if (rows.length) _nmState.cache[key] = { ts: Date.now(), streams: rows };
      return rows;
    }).then(function (rows) {
      // late-cache: when the uncapped Alpha result lands after the serve and
      // holds MORE rows, store the full set for the next open of the sheet
      return Promise.all([
        alphaP.catch(function () { return []; }),
        ntP.catch(function () { return { rows: [] }; }),
        n27P.catch(function () { return { rows: [], subs: [] }; })
      ]).then(function (res) {
        var full = combine(res[0], res[1], res[2]);
        var cur = _nmState.cache[key];
        if (full.length && (!cur || ((cur.streams || []).length < full.length))) {
          console.log("[NetMirror] late alpha result cached (" + full.length + " rows)");
          _nmState.cache[key] = { ts: Date.now(), streams: full };
        }
        return rows;
      });
    });
  }).catch(function (error) {
    console.log("[NetMirror] failed: " + (error && error.message ? error.message : error));
    return [];
  }).then(function (streams) {
    delete _nmState.inflight[key];
    var cur = _nmState.cache[key];
    if (streams && streams.length && (!cur || ((cur.streams || []).length <= streams.length))) {
      _nmState.cache[key] = { ts: Date.now(), streams: streams };
    }
    return streams || [];
  });
  _nmState.inflight[key] = run;
  return run;
}

function onSettings() {
  return Promise.resolve([
    {
      key: "captionLang",
      title: "Subtitle language",
      label: "Subtitle language",
      type: "select",
      default: "en+fil",
      options: [
        { value: "all", label: "All languages" },
        { value: "en+fil", label: "English + Tagalog / Filipino" },
        { value: "en", label: "English only" }
      ],
      description: "English and Tagalog (fil) tracks are always listed first. This filter hides the rest."
    }
  ]);
}

module.exports = {
  getStreams: getStreams,
  onSettings: onSettings
};

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
  var PROVIDER = "netmirror";
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
    var p = fetch(url, opts).then(function (r) {
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
            // nv best-settings: 10s overall cap - the Alpha lane serves at 9s,
            // NewTV at 6s, and the full late
            // result is late-cached for the next open of the sheet.
            r = Promise.race([r, new Promise(function (res) {
              var dl = setTimeout(function () { res([]); }, 10000);
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
