/*
 * nv-plugins movieblast.js — FULLY DECODED port of the All-in-One-Nuvio provider (4.23.0 best-settings pass).
 * Decoded from the obfuscated AIO build: string tables resolved, decoder machinery stripped,
 * every network call capped by an 8s deadline, nvio post-filter attached (en/tl audio gate,
 * >=720p quality gate, cross-provider dedupe). Behavior/endpoints identical to the AIO original.
 */
/* nv-plugins best-settings pass 4.23.0: hard 8s deadline on every network call */
/* nv-plugins 4.38.0 device fix: guarded crypto-js loader + pure-JS HMAC-SHA256 fallback.
   The device realm has no `require`, so the raw require("crypto-js") at top level
   crashed the provider BEFORE any network work. The fallback below implements
   HMAC-SHA256 + Base64 in pure ES2020 (validated against node:crypto: RFC-4231
   vectors, >64-byte keys, unicode). Node/PC runtimes keep using the real crypto-js. */
var __nvMovieBlastCrypto = (function () {
  function _sha256(bytes) {
    var K = [0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
      0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
      0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
      0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
      0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
      0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
      0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
      0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2];
    var l = bytes.length;
    var hi = Math.floor(l / 0x20000000), lo = (l << 3) >>> 0;
    var buf = bytes.concat([0x80]);
    var total = Math.ceil((buf.length + 8) / 64) * 64;
    while (buf.length < total) buf.push(0);
    var off = buf.length - 8;
    buf[off] = (hi >>> 24) & 255; buf[off + 1] = (hi >>> 16) & 255; buf[off + 2] = (hi >>> 8) & 255; buf[off + 3] = hi & 255;
    buf[off + 4] = (lo >>> 24) & 255; buf[off + 5] = (lo >>> 16) & 255; buf[off + 6] = (lo >>> 8) & 255; buf[off + 7] = lo & 255;
    function rotr(x, n) { return ((x >>> n) | (x << (32 - n))) >>> 0; }
    var h0 = 0x6a09e667, h1 = 0xbb67ae85, h2 = 0x3c6ef372, h3 = 0xa54ff53a,
        h4 = 0x510e527f, h5 = 0x9b05688c, h6 = 0x1f83d9ab, h7 = 0x5be0cd19;
    var w = new Array(64);
    for (var i = 0; i < buf.length; i += 64) {
      for (var t = 0; t < 16; t++) {
        w[t] = ((buf[i + 4 * t] << 24) | (buf[i + 4 * t + 1] << 16) | (buf[i + 4 * t + 2] << 8) | buf[i + 4 * t + 3]) >>> 0;
      }
      for (var t2 = 16; t2 < 64; t2++) {
        var s0 = rotr(w[t2 - 15], 7) ^ rotr(w[t2 - 15], 18) ^ (w[t2 - 15] >>> 3);
        var s1 = rotr(w[t2 - 2], 17) ^ rotr(w[t2 - 2], 19) ^ (w[t2 - 2] >>> 10);
        w[t2] = (w[t2 - 16] + s0 + w[t2 - 7] + s1) >>> 0;
      }
      var a = h0, b = h1, c = h2, d = h3, e = h4, f = h5, g = h6, h = h7;
      for (var k = 0; k < 64; k++) {
        var S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
        var ch = (e & f) ^ (~e & g);
        var t1 = (h + S1 + ch + K[k] + w[k]) >>> 0;
        var S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
        var maj = (a & b) ^ (a & c) ^ (b & c);
        var t2b = (S0 + maj) >>> 0;
        h = g; g = f; f = e; e = (d + t1) >>> 0; d = c; c = b; b = a; a = (t1 + t2b) >>> 0;
      }
      h0 = (h0 + a) >>> 0; h1 = (h1 + b) >>> 0; h2 = (h2 + c) >>> 0; h3 = (h3 + d) >>> 0;
      h4 = (h4 + e) >>> 0; h5 = (h5 + f) >>> 0; h6 = (h6 + g) >>> 0; h7 = (h7 + h) >>> 0;
    }
    var out = [];
    [h0, h1, h2, h3, h4, h5, h6, h7].forEach(function (hh) {
      out.push((hh >>> 24) & 255, (hh >>> 16) & 255, (hh >>> 8) & 255, hh & 255);
    });
    return out;
  }
  function _utf8(s) {
    var out = [];
    for (var i = 0; i < s.length; i++) {
      var c = s.codePointAt(i);
      if (c > 0xffff) i++;
      if (c < 0x80) out.push(c);
      else if (c < 0x800) out.push(0xc0 | (c >> 6), 0x80 | (c & 63));
      else if (c < 0x10000) out.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 63), 0x80 | (c & 63));
      else out.push(0xf0 | (c >> 18), 0x80 | ((c >> 12) & 63), 0x80 | ((c >> 6) & 63), 0x80 | (c & 63));
    }
    return out;
  }
  function _b64(bytes) {
    var T = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    var out = "";
    for (var i = 0; i < bytes.length; i += 3) {
      var b0 = bytes[i], b1 = bytes[i + 1], b2 = bytes[i + 2];
      out += T[b0 >> 2];
      out += T[((b0 & 3) << 4) | ((b1 === undefined ? 0 : b1) >> 4)];
      out += b1 === undefined ? "=" : T[((b1 & 15) << 2) | ((b2 === undefined ? 0 : b2) >> 6)];
      out += b2 === undefined ? "=" : T[b2 & 63];
    }
    return out;
  }
  function hmacSha256(msgStr, keyStr) {
    var key = _utf8(String(keyStr)), msg = _utf8(String(msgStr));
    if (key.length > 64) key = _sha256(key);
    var ipad = [], opad = [];
    for (var i = 0; i < 64; i++) { ipad.push(0x36); opad.push(0x5c); }
    for (var j = 0; j < 64; j++) {
      ipad[j] ^= (j < key.length ? key[j] : 0);
      opad[j] ^= (j < key.length ? key[j] : 0);
    }
    var inner = _sha256(ipad.concat(msg));
    return _sha256(opad.concat(inner));
  }
  return {
    HmacSHA256: function (message, secret) {
      var mac = hmacSha256(message, secret);
      var b = _b64(mac);
      return { _b64: b, toString: function () { return b; } };
    },
    enc: {
      Base64: { stringify: function (w) { return w && w._b64 !== undefined ? w._b64 : String(w); } },
    },
  };
})();
/* URL-pathname helper with string-ops fallback (device realm has no URL constructor) */
function __nvUrlPath(u) {
  try {
    if (typeof URL === "function") return new URL(u).pathname;
  } catch (e) {}
  var m = String(u).match(/^https?:\/\/[^\/#?]+(\/[^#?]*)/i);
  return m ? m[1] : "/";
};

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
var __create = Object.create,
  __defProp = Object.defineProperty,
  __defProps = Object.defineProperties,
  __getOwnPropDesc = Object.getOwnPropertyDescriptor,
  __getOwnPropDescs = Object.getOwnPropertyDescriptors,
  __getOwnPropNames = Object.getOwnPropertyNames,
  __getOwnPropSymbols = Object.getOwnPropertySymbols,
  __getProtoOf = Object.getPrototypeOf,
  __hasOwnProp = Object.prototype.hasOwnProperty,
  __propIsEnum = Object.prototype.propertyIsEnumerable,
  __defNormalProp = (v3, v4, v5) => (v4 in v3) ? __defProp(v3, v4, {
    enumerable: true,
    configurable: true,
    writable: true,
    value: v5
  }) : v3[v4] = v5,
  __spreadValues = (v6, v7) => {
    for (var v9 in v7 || (v7 = {}))
      if (__hasOwnProp.call(v7, v9)) __defNormalProp(v6, v9, v7[v9]);
    if (__getOwnPropSymbols)
      for (var v9 of __getOwnPropSymbols(v7)) {
        if (__propIsEnum.call(v7, v9)) __defNormalProp(v6, v9, v7[v9]);
      }
    return v6;
  },
  __spreadProps = (v10, v11) => __defProps(v10, __getOwnPropDescs(v11)),
  __copyProps = (v12, v13, v14, v15) => {
    if (v13 && typeof v13 === "object" || typeof v13 === "function") {
      for (let v17 of __getOwnPropNames(v13))
        if (!__hasOwnProp.call(v12, v17) && v17 !== v14) __defProp(v12, v17, {
          get: () => v13[v17],
          enumerable: !(v15 = __getOwnPropDesc(v13, v17)) || v15.enumerable
        });
    }
    return v12;
  },
  __toESM = (v18, v19, v20) => (v20 = v18 != null ? __create(__getProtoOf(v18)) : {}, __copyProps(v19 || !
    v18 || !v18.__esModule ? __defProp(v20, "default", {
      value: v18,
      enumerable: true
    }) : v20, v18)),
  __async = (v21, v22, v23) => {
    return new Promise((v24, v25) => {
      var v27 = v28 => {
          try {
            v30(v23.next(v28));
          } catch (v31) {
            v25(v31);
          }
        },
        v32 = v33 => {
          try {
            v30(v23.throw(v33));
          } catch (v35) {
            v25(v35);
          }
        },
        v30 = v36 => v36.done ? v24(v36.value) : Promise.resolve(v36.value).then(v27, v32);
      v30((v23 = v23.apply(v21, v22)).next());
    });
  },
  BASE_URL = "https://app.cloud-mb.xyz",
  TOKEN = "jdvhhjv255vghhghdhvfch2565656jhdcghfdf",
  APP_ID = "com.movieblast",
  HEADERS = {
    "user-agent": "okhttp/5.0.0-alpha.6",
    "x-request-x": APP_ID
  },
  SEARCH_HEADERS = __spreadProps(__spreadValues({}, HEADERS), {
    hash256: "86dc03244adddb3cbedbf0ae36074a736ee293a64774b18e82a6244eafd0df30",
    packagename: APP_ID
  }),
  SIGN_SECRET = "GJ8reydarI7Jqat9rvbAJKNQ9gY4DoEQF2H5nfuI1gi",
  TMDB_API_KEY = "439c478a771f35c05022f9feabcca01c",
  TMDB_BASE_URL = "https://api.themoviedb.org/3",
  import_crypto_js = __toESM((function () {
  try {
    if (typeof require === "function") {
      var _m = require("crypto-js");
      if (_m) return _m;
    }
  } catch (_nvE) {}
  return __nvMovieBlastCrypto;
})());

function generateSignedUrl(v37) {
  try {
    const v40 = __nvUrlPath(v37),
      v41 = Math.floor(Date.now() / 1000).toString(),
      v42 = import_crypto_js.default.HmacSHA256(v40 + v41, SIGN_SECRET),
      v43 = import_crypto_js.default.enc.Base64.stringify(v42),
      v44 = encodeURIComponent(v43);
    return v37 + "?verify=" + v41 + "-" + v44;
  } catch (v45) {
    return (console.error("[MovieBlast] Error generating signed URL:", v45.message), v37);
  }
}

function matchQuality(v46) {
  if (!v46) return "Unknown";
  const v48 = v46.toLowerCase();
  if (v48.includes("2160") || v48.includes("4k")) return "4K";
  if (v48.includes("1440")) return "2K";
  if (v48.includes("1080")) return "1080p";
  if (v48.includes("720")) return "720p";
  if (v48.includes("480")) return "480p";
  if (v48.includes("360")) return "360p";
  return "Unknown";
}

function normalizeTitle(v49) {
  if (!v49) return "";
  return v49.toLowerCase().replace(/\b(the|a|an)\b/g, "").replace(/[:\-_]/g, " ").replace(/\s+/g, " ")
    .replace(/[^\w\s]/g, "").trim();
}

function getTMDBDetails(v51, v52) {
  return __async(this, null, function*() {
    const v54 = v52 === "tv" ? "tv" : "movie",
      v55 = TMDB_BASE_URL + "/" + v54 + "/" + v51 + "?api_key=" + TMDB_API_KEY,
      v56 = yield __nvFetch(v55, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "User-Agent": "Mozilla/5.0"
        }
      });
    if (!v56.ok) throw new Error("TMDB API error: " + v56.status);
    const v57 = yield v56.json(), v58 = v52 === "tv" ? v57.name : v57.title, v59 = v52 === "tv" ? v57
      .first_air_date : v57.release_date, v60 = v59 ? parseInt(v59.split("-")[0]) : null;
    return {
      title: v58,
      year: v60
    };
  });
}

function calculateTitleSimilarity(v61, v62) {
  const v64 = normalizeTitle(v61),
    v65 = normalizeTitle(v62);
  if (v64 === v65) return 1;
  const v66 = v64.split(/\s+/).filter(v67 => v67.length > 0),
    v68 = v65.split(/\s+/).filter(v69 => v69.length > 0);
  if (v66.length === 0 || v68.length === 0) return 0;
  const v70 = new Set(v66),
    v71 = new Set(v68),
    v72 = v66.filter(v73 => v71.has(v73)),
    v74 = new Set([...v66, ...v68]);
  return v72.length / v74.size;
}

function findBestMatch(v75, v76) {
  if (!v76 || v76.length === 0) return null;
  let v78 = null,
    v79 = 0;
  for (const v80 of v76) {
    let v81 = calculateTitleSimilarity(v75.title, v80.name);
    if (v75.year && v80.release_date) {
      const v82 = parseInt(v80.release_date.split("-")[0]);
      if (v75.year === v82) v81 += 0.2;
    }
    v81 > v79 && v81 > 0.4 && (v79 = v81, v78 = v80);
  }
  return v78;
}
/*decoder removed*/
function getStreams(v83, v84 = "movie", v85 = null, v86 = null) {
  return __async(this, null, function*() {
    console.log("[MovieBlast] Fetching streams for TMDB ID: " + v83 + ", Type: " + v84);
    try {
      const v88 = yield getTMDBDetails(v83, v84);
      console.log("[MovieBlast] Searching for: \"" + v88.title + "\" (" + v88.year + ")");
      const v89 = encodeURIComponent(v88.title),
        v90 = BASE_URL + "/api/search/" + v89 + "/" + TOKEN,
        v91 = yield __nvFetch(v90, {
          headers: SEARCH_HEADERS
        });
      if (!v91.ok) return (console.error("[MovieBlast] Search failed with status: " + v91.status), []);
      const v92 = yield v91.json(), v93 = v92.search || [], v94 = findBestMatch(v88, v93);
      if (!v94) return (console.log("[MovieBlast] No confident matches found in MovieBlast."), []);
      const v95 = v94.id,
        v96 = v94.type.toLowerCase().includes("serie") || v84 === "tv";
      console.log("[MovieBlast] Match Found: \"" + v94.name + "\" (ID: " + v95 + ")");
      const v97 = v96 ? "series/show" : "media/detail",
        v98 = BASE_URL + "/api/" + v97 + "/" + v95 + "/" + TOKEN,
        v99 = yield __nvFetch(v98, {
          headers: HEADERS
        });
      if (!v99.ok) return (console.error("[MovieBlast] Detail fetch failed: " + v99.status), []);
      const v100 = yield v99.json();
      let v101 = [];
      if (v96) {
        const v102 = v100.seasons || [],
          v103 = v102.find(v104 => v104.season_number == v85);
        if (v103) {
          const v105 = (v103.episodes || []).find(v106 => v106.episode_number == v86);
          v105 ? v101 = v105.videos || [] : console.log("[MovieBlast] Episode " + v86 +
            " not found in Season " + v85 + ".");
        } else console.log("[MovieBlast] Season " + v85 + " not found.");
      } else v101 = v100.videos || [];
      if (v101.length === 0) return (console.log("[MovieBlast] No video links found in details."), []);
      const v107 = v101.map(v108 => {
        const v110 = v108.link;
        if (!v110) return null;
        const v111 = v110.startsWith("http") ? v110 : "https://" + v110,
          v112 = generateSignedUrl(v111);
        return {
          name: "MovieBlast",
          title: "MovieBlast - " + v108.server + " (" + (v108.lang || "EN") + ")",
          url: v112,
          quality: matchQuality(v108.server),
          headers: {
            "User-Agent": "MovieBlast",
            Referer: "MovieBlast",
            "x-request-x": "com.movieblast"
          },
          provider: "movieblast"
        };
      }).filter(v113 => v113 !== null);
      return (console.log("[MovieBlast] Successfully found " + v107.length + " streams."), v107);
    } catch (v114) {
      return (console.error("[MovieBlast] Error: " + v114.message), []);
    }
  });
}
module['exports'] = {
  'getStreams': getStreams
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
(function() {
  var PROVIDER = "movieblast";
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
