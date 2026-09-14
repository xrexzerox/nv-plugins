/* nv-plugins movieblast.js v5.0.0 (pack 4.40.0 "all providers readable, no device killer")
 * Clean readable port of Eclipsia (codeberg eclipsia/nuvio-plugin) "Jyniq." = MovieBlast,
 * replacing the machine v-named 4.39 build. Endpoint: https://app.cloud-mb.xyz (identical in
 * Eclipsia and the device-verified 4.39 file) — /api/search/{q}/{token}, /api/media/detail/
 * {id}/{token}, /api/series/show/{id}/{token}; stream links signed with ?verify={ts}-{b64}.
 * Values kept from the device-verified 4.39 file: TOKEN jdvhhjv255vghhghdhv... (Eclipsia's
 * variant differs by one transposed char: ...gdhv...), okhttp/5.0.0-alpha.6 UA + x-request-x,
 * search headers hash256/packagename (Eclipsia's extra certificate-signature header NOT taken),
 * Jaccard title matching with year bonus and >0.4 threshold. TMDB key 439c478a771f35c05022f9fe
 * abcca01c (pack key, not Eclipsia's 307b...).
 * Device fixes: require("crypto-js") removed — HMAC-SHA256 is the pack's pure-JS implementation
 * (netmirror K256/rotr/sha256Bytes port) + bytesToB64 helper for the Base64 digest, parity-
 * checked against node:crypto; no URL/TextDecoder/timers/require; every fetch response.ok
 * checked, fail-soft try/catch everywhere; rows below 720p (and unknown-quality rows) dropped
 * per Eclipsia's resWeight>=2 gate. nvio post-filter appended after module.exports
 * (PROVIDER=movieblast; the asset's wings waterfall lane is inert here — no __nvWingsStreams —
 * and kept only for asset verbatim-ness, matching 4.39's post-filter tail).
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


/* ===== native lane: clean Eclipsia "Jyniq." port (MovieBlast android app) ==================
 * app.cloud-mb.xyz API with HMAC-SHA256-signed stream links. The device realm has no CryptoJS
 * and no require(), so SHA-256/HMAC use the pack's pure-JS implementation (ported from
 * netmirror.js: K256 table, rotr, sha256Bytes) + a bytesToB64 helper for the Base64 digest.
 * Parity-checked against node:crypto (crypto.createHmac('sha256', key).update(msg).digest('base64')).
 * Key and message are UTF-8 encoded manually (charCodeAt path); no TextDecoder, no timers. ==== */

var BASE_URL = "https://app.cloud-mb.xyz";
/* 4.39 device-verified token; Eclipsia jyniq has "...vghhgdhv..." (transposed chars). */
var TOKEN = "jdvhhjv255vghhghdhvfch2565656jhdcghfdf";
var APP_ID = "com.movieblast";
var HEADERS = {
  "user-agent": "okhttp/5.0.0-alpha.6",
  "x-request-x": APP_ID
};
var SEARCH_HEADERS = {
  "user-agent": "okhttp/5.0.0-alpha.6",
  "x-request-x": APP_ID,
  "hash256": "86dc03244adddb3cbedbf0ae36074a736ee293a64774b18e82a6244eafd0df30",
  "packagename": APP_ID
};
var SIGN_SECRET = "GJ8reydarI7Jqat9rvbAJKNQ9gY4DoEQF2H5nfuI1gi";
var TMDB_BASE_URL = "https://api.themoviedb.org/3";
var TMDB_API_KEY = "439c478a771f35c05022f9feabcca01c"; /* pack key (4.39), not Eclipsia's 307b... */

var B64_CH = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

/** Byte array -> standard Base64 (same alphabet as the preamble atob/btoa polyfills). */
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

/** UTF-8 encoding of a JS string (charCodeAt walk, surrogate pairs handled). */
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

/* ===== pure-JS SHA-256 / HMAC (pack house crypto, ported from netmirror.js) ===== */

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
  var bitLenHi = Math.floor(len / 536870912);            /* len*8 / 2^32 high */
  var bitLenLo = (len << 3) >>> 0;                       /* low 32 bits (fine for our sizes) */
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

/** HMAC-SHA256(keyBytes, msgBytes) -> 32 bytes (RFC 2104, 64-byte block). */
function hmacSha256Bytes(keyBytes, msgBytes) {
  var key = keyBytes, i;
  if (key.length > 64) key = sha256Bytes(key);
  var ipad = new Array(64), opad = new Array(64);
  for (i = 0; i < 64; i++) {
    var kb = i < key.length ? key[i] : 0;
    ipad[i] = kb ^ 0x36;
    opad[i] = kb ^ 0x5c;
  }
  var inner = sha256Bytes(ipad.concat(msgBytes));
  return sha256Bytes(opad.concat(inner));
}

/* ---------- helpers ---------- */

function httpsify(url) {
  var s = String(url || "");
  return s && s.indexOf("http") !== 0 ? "https://" + s : s;
}

/* Eclipsia jyniq generateSignedUrl: HMAC-SHA256(path + unixTs) -> Base64 -> ?verify=ts-sig.
 * Fail-soft: on any error the unsigned link is returned (some seasons still serve it). */
function generateSignedUrl(url) {
  try {
    var path = String(url).replace(/^https?:\/\/[^/]+/, "");
    var timestamp = String(Math.floor(Date.now() / 1000));
    var sig = bytesToB64(hmacSha256Bytes(utf8Bytes(SIGN_SECRET), utf8Bytes(path + timestamp)));
    return url + "?verify=" + timestamp + "-" + encodeURIComponent(sig);
  } catch (e) {
    return String(url || "");
  }
}

function resWeight(q) {
  var s = String(q || "").toUpperCase();
  if (s === "4K" || s === "2160P") return 5;
  if (s === "1440P") return 4;
  if (s === "1080P") return 3;
  if (s === "720P") return 2;
  if (s === "480P") return 1;
  return 0;
}

function matchQuality(str) {
  var v = String(str || "").toLowerCase();
  if (v.indexOf("2160") !== -1 || v.indexOf("4k") !== -1) return "4K";
  if (v.indexOf("1440") !== -1) return "1440p";
  if (v.indexOf("1080") !== -1) return "1080p";
  if (v.indexOf("720") !== -1) return "720p";
  if (v.indexOf("480") !== -1) return "480p";
  if (v.indexOf("360") !== -1) return "360p";
  return "";
}

function normalizeTitle(title) {
  if (!title) return "";
  return String(title).toLowerCase()
    .replace(/\b(the|a|an)\b/g, "")
    .replace(/[:\-_]/g, " ")
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/* Jaccard word overlap (kept from the device-verified 4.39 build). */
function calculateTitleSimilarity(a, b) {
  var na = normalizeTitle(a), nb = normalizeTitle(b);
  if (na === nb) return 1;
  var wa = na.split(/\s+/).filter(function (w) { return w.length > 0; });
  var wb = nb.split(/\s+/).filter(function (w) { return w.length > 0; });
  if (wa.length === 0 || wb.length === 0) return 0;
  var setB = {}, union = {}, inter = 0, i;
  for (i = 0; i < wb.length; i++) setB[wb[i]] = 1;
  for (i = 0; i < wa.length; i++) {
    union[wa[i]] = 1;
    if (setB[wa[i]]) inter++;
  }
  for (i = 0; i < wb.length; i++) union[wb[i]] = 1;
  var unionSize = 0;
  for (var k in union) if (Object.prototype.hasOwnProperty.call(union, k)) unionSize++;
  return unionSize ? inter / unionSize : 0;
}

function findBestMatch(want, results) {
  if (!Array.isArray(results) || results.length === 0) return null;
  var best = null, bestScore = 0;
  for (var i = 0; i < results.length; i++) {
    var item = results[i];
    if (!item || !item.name) continue;
    var score = calculateTitleSimilarity(want.title, item.name);
    if (want.year && item.release_date) {
      var y = parseInt(String(item.release_date).split("-")[0], 10);
      if (want.year === y) score += 0.2;
    }
    if (score > bestScore && score > 0.4) {
      bestScore = score;
      best = item;
    }
  }
  return best;
}

/* ---------- lanes ---------- */

function getTMDBDetails(tmdbId, mediaType) {
  var type = mediaType === "tv" ? "tv" : "movie";
  var url = TMDB_BASE_URL + "/" + type + "/" + tmdbId + "?api_key=" + TMDB_API_KEY;
  return __nvFetch(url, {
    method: "GET",
    headers: { "Accept": "application/json", "User-Agent": "Mozilla/5.0" }
  }).then(function (res) {
    if (!res || !res.ok) throw new Error("TMDB API error: " + (res ? res.status : "no response"));
    return res.json();
  }).then(function (data) {
    if (!data) return null;
    var date = mediaType === "tv" ? data.first_air_date : data.release_date;
    return {
      title: (mediaType === "tv" ? data.name : data.title) || data.original_name || data.original_title || "",
      year: date ? parseInt(String(date).split("-")[0], 10) : null
    };
  }).catch(function () { return null; });
}

function searchMedia(query) {
  var url = BASE_URL + "/api/search/" + encodeURIComponent(String(query || "").trim()) + "/" + TOKEN;
  return __nvFetch(url, { headers: SEARCH_HEADERS }).then(function (res) {
    if (!res || !res.ok) return [];
    return res.json();
  }).then(function (json) {
    return json && Array.isArray(json.search) ? json.search : [];
  }).catch(function () { return []; });
}

function loadDetail(id, isSeries) {
  var path = isSeries ? "series/show" : "media/detail";
  var url = BASE_URL + "/api/" + path + "/" + id + "/" + TOKEN;
  return __nvFetch(url, { headers: HEADERS }).then(function (res) {
    if (!res || !res.ok) return null;
    return res.json();
  }).catch(function () { return null; });
}

function toStream(video) {
  if (!video || !video.link) return null;
  var quality = matchQuality(video.server);
  if (resWeight(quality) < 2) return null; /* only 720p/1080p/1440p/4K (no rows below 720p) */
  var link = httpsify(String(video.link));
  if (!link) return null;
  var title = "MovieBlast - " + (video.server || "stream") + " (" + (video.lang || "EN") + ")";
  return {
    name: "MovieBlast • " + quality,
    title: title,
    url: generateSignedUrl(link),
    quality: quality,
    headers: {
      "User-Agent": "MovieBlast",
      "Referer": "MovieBlast",
      "x-request-x": APP_ID
    }
  };
}

function getStreams(tmdbId, mediaType, season, episode) {
  try {
    if (mediaType !== "tv" && mediaType !== "movie") mediaType = "movie";
    if (mediaType === "tv" && (season == null || episode == null)) return Promise.resolve([]);
    return getTMDBDetails(tmdbId, mediaType).then(function (info) {
      if (!info || !info.title) return [];
      return searchMedia(info.title).then(function (results) {
        var match = findBestMatch(info, results);
        if (!match) return [];
        var isSeries = (String(match.type || "").toLowerCase().indexOf("serie") !== -1) || mediaType === "tv";
        return loadDetail(match.id, isSeries).then(function (detail) {
          if (!detail) return [];
          var videos = [];
          if (isSeries) {
            var seasons = Array.isArray(detail.seasons) ? detail.seasons : [];
            var seasonObj = null;
            for (var i = 0; i < seasons.length; i++) {
              if (seasons[i] && (seasons[i].season_number || 0) == Number(season)) { seasonObj = seasons[i]; break; }
            }
            if (!seasonObj) return [];
            var episodes = Array.isArray(seasonObj.episodes) ? seasonObj.episodes : [];
            var episodeObj = null;
            for (var j = 0; j < episodes.length; j++) {
              if (episodes[j] && (episodes[j].episode_number || 0) == Number(episode)) { episodeObj = episodes[j]; break; }
            }
            if (!episodeObj) return [];
            videos = Array.isArray(episodeObj.videos) ? episodeObj.videos : [];
          } else {
            videos = Array.isArray(detail.videos) ? detail.videos : [];
          }
          var seen = {}, out = [];
          var pool = videos.slice(0, 24); /* hard cap */
          for (var k = 0; k < pool.length; k++) {
            var row = toStream(pool[k]);
            if (!row || seen[row.url]) continue;
            seen[row.url] = 1;
            out.push(row);
          }
          out.sort(function (a, b) { return resWeight(b.quality) - resWeight(a.quality); });
          return out;
        });
      });
    });
  } catch (e) {
    return Promise.resolve([]);
  }
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
  var PROVIDER = "movieblast";
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
  var __LABEL = 'MovieBlast';
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
