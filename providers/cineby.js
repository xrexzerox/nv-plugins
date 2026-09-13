/*
 * nv-plugins cineby.js — FULLY DECODED port of the All-in-One-Nuvio provider (4.23.0 best-settings pass).
 * Decoded from the obfuscated AIO build: string tables resolved, decoder machinery stripped,
 * every network call capped by an 8s deadline, nvio post-filter attached (en/tl audio gate,
 * >=720p quality gate, cross-provider dedupe). Behavior/endpoints identical to the AIO original.
 */
/* nv-plugins best-settings pass 4.23.0: hard 8s deadline on every network call */
var __nvFetch = function () {
  var _f = null;
  try {
    _f = typeof fetch === "function" ? fetch : null;
  } catch (e) {
    _f = null;
  }
  if (!_f) {
    return function () {
      return Promise.reject(new Error("no fetch"));
    };
  }
  var hasT = typeof setTimeout === "function";
  return function (input, init) {
    var p;
    try {
      p = _f.apply(this, arguments);
    } catch (e) {
      return Promise.reject(e);
    }
    if (!hasT || !p || typeof p.then !== "function") {
      return p;
    }
    return Promise.race([p, new Promise(function (_res, rej) {
      var t = setTimeout(function () {
        rej(new Error("nv deadline 8s"));
      }, 8000);
      if (t && typeof t.unref === "function") {
        t.unref();
      }
    })]);
  };
}();
function v1() {
  return "";
}
const v2 = v1; /*rotation removed*/
;
var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (v3, v4, v5) => v4 in v3 ? __defProp(v3, v4, {
  enumerable: true,
  configurable: true,
  writable: true,
  value: v5
}) : v3[v4] = v5;
var __spreadValues = (v6, v7) => {
  const v8 = {
    dh1: 123
  };
  const v9 = v2;
  for (var v10 in v7 ||= {}) {
    if (__hasOwnProp.call(v7, v10)) {
      __defNormalProp(v6, v10, v7[v10]);
    }
  }
  if (__getOwnPropSymbols) {
    for (var v10 of __getOwnPropSymbols(v7)) {
      if (__propIsEnum.call(v7, v10)) {
        __defNormalProp(v6, v10, v7[v10]);
      }
    }
  }
  return v6;
};
var __spreadProps = (v11, v12) => __defProps(v11, __getOwnPropDescs(v12));
var __async = (v13, v14, v15) => {
  const v16 = {
    dh2: 134
  };
  const v17 = {
    dh3: 134
  };
  return new Promise((v18, v19) => {
    const v20 = v1;
    var v21 = v22 => {
      const v23 = v1;
      try {
        v24(v15.next(v22));
      } catch (v25) {
        v19(v25);
      }
    };
    var v26 = v27 => {
      try {
        v24(v15.throw(v27));
      } catch (v28) {
        v19(v28);
      }
    };
    var v24 = v29 => v29.done ? v18(v29.value) : Promise.resolve(v29.value).then(v21, v26);
    v24((v15 = v15.apply(v13, v14)).next());
  });
};
var DOMAINS_URL = "https://raw.githubusercontent.com/sapariyaneel/nuvio-plugin/refs/heads/main/domains.json";
var FALLBACK_API_HOST = "https://api.speedracelight.com";
var TMDB_API_KEY = "1865f43a0549ca50d341dd9ab8b29f49";
var HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  Referer: "https://www.cineby.at/",
  Origin: "https://www.cineby.at"
};
var cachedDomains = null;
function getDomains() {
  return __async(this, null, function* () {
    if (cachedDomains) {
      return cachedDomains;
    }
    try {
      const v30 = yield __nvFetch(DOMAINS_URL, {
        skipSizeCheck: true
      });
      cachedDomains = yield v30.json();
    } catch (v31) {
      cachedDomains = {};
    }
    return cachedDomains;
  });
}
function getApiHost() {
  const v32 = {
    dh4: 132
  };
  return __async(this, null, function* () {
    const v33 = v1;
    const v34 = yield getDomains();
    return (v34.speedracelight || v34["api.speedracelight.com"] || FALLBACK_API_HOST).replace(/\/+$/, "");
  });
}
var SHA256_CONSTANTS = [1116352408, 1899447441, 3049323471, 3921009573, 961987163, 1508970993, 2453635748, 2870763221, 3624381080, 310598401, 607225278, 1426881987, 1925078388, 2162078206, 2614888103, 3248222580];
var MAGIC_BYTES = [109, 118, 109, 49];
function isCustomBranch(v35) {
  return (v35 * (v35 + 1) & 1) === 0;
}
function fmix32(v36) {
  const v37 = {
    dh5: 122
  };
  const v38 = v2;
  v36 = v36 >>> 0;
  v36 ^= v36 >>> 16;
  v36 = Math.imul(v36, 2246822507) >>> 0;
  v36 ^= v36 >>> 13;
  v36 = Math.imul(v36, 3266489909) >>> 0;
  v36 = (v36 ^ v36 >>> 16) >>> 0;
  return v36;
}
function rotl32(v39, v40) {
  v39 = v39 >>> 0;
  v40 &= 31;
  if (v40 === 0) {
    return v39 >>> 0;
  }
  return (v39 << v40 | v39 >>> 32 - v40) >>> 0;
}
var BASE64_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
function pureBase64Decode(v41) {
  const v42 = {
    dh6: 136,
    dh7: 141,
    dh8: 175
  };
  const v43 = v2;
  let v44 = "";
  for (let v45 = 0; v45 < v41.length; v45++) {
    const v46 = v41.charAt(v45);
    if (v46 !== "=" && BASE64_CHARS.indexOf(v46) !== -1) {
      v44 += v46;
    }
  }
  let v47 = "";
  for (let v48 = 0; v48 < v44.length; v48 += 4) {
    const v49 = BASE64_CHARS.indexOf(v44.charAt(v48));
    const v50 = BASE64_CHARS.indexOf(v44.charAt(v48 + 1));
    const v51 = v48 + 2 < v44.length ? BASE64_CHARS.indexOf(v44.charAt(v48 + 2)) : -1;
    const v52 = v48 + 3 < v44.length ? BASE64_CHARS.indexOf(v44.charAt(v48 + 3)) : -1;
    v47 += String.fromCharCode(v49 << 2 | v50 >> 4);
    if (v51 !== -1) {
      v47 += String.fromCharCode((v50 & 15) << 4 | v51 >> 2);
    }
    if (v52 !== -1) {
      v47 += String.fromCharCode((v51 & 3) << 6 | v52);
    }
  }
  return v47;
} /*decoder removed*/
function base64UrlToBytes(v53) {
  const v54 = v2;
  const v55 = v53.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(v53.length / 4) * 4, "=");
  const v56 = typeof atob === "function" ? atob(v55) : pureBase64Decode(v55);
  const v57 = new Uint8Array(v56.length);
  for (let v58 = 0; v58 < v56.length; v58++) {
    v57[v58] = v56.charCodeAt(v58);
  }
  return v57;
}
function fnv1a32(v59) {
  const v60 = {
    dh9: 122,
    dh10: 155
  };
  const v61 = v2;
  let v62 = 2166136261;
  for (let v63 = 0; v63 < v59.length; v63++) {
    v62 = Math.imul(v62 ^ v59.charCodeAt(v63), 16777619) >>> 0;
  }
  return fmix32(v62);
}
function makeKeystreamState(v64, v65) {
  const v66 = new Array(61);
  let v67 = fmix32(fnv1a32(v64) ^ fmix32(v65 >>> 0 ^ -1640531527)) >>> 0;
  for (let v68 = 0; v68 < 8; v68++) {
    if (isCustomBranch(v68)) {
      const v69 = v67 % 61;
      v67 = rotl32(v67 + 2654435769 >>> 0, 7 + (v68 & 7));
      v66[v69] = (v67 ^ fmix32(v67)) >>> 0;
      v67 = fmix32(v67 + v69 >>> 0);
    } else {
      v66[v68] = SHA256_CONSTANTS[v68 & 15];
    }
  }
  return {
    slots: v66,
    acc: fmix32(v67 ^ -1515870811) >>> 0
  };
} /*string-table removed*/
function nextKeystreamWord(v70, v71) {
  const v72 = {
    dh11: 122
  };
  const v73 = v2;
  const v74 = v70.slots;
  const v75 = v70.acc;
  const v76 = v75 % 61;
  const v77 = v76 in v74 ? -1 : 0;
  const v78 = v74[v76] >>> 0;
  const v79 = (v78 ^ Math.imul(2654435769, v71 + 1) >>> 0) >>> 0;
  const v80 = ((v75 ^ v79) >>> 0 | (v75 & v79 & v77) >>> 0) >>> 0;
  const v81 = (rotl32(v80 + v75 >>> 0, v76 & 31) ^ rotl32(v75, Math.imul(v76, 7) & 31)) >>> 0;
  const v82 = fmix32(v81 + 2654435769 >>> 0);
  v74[v76] = v82 >>> 0;
  v70.acc = v82;
  return v82 >>> 0;
}
function generateKeystream(v83, v84, v85) {
  const v86 = makeKeystreamState(v83, v84);
  const v87 = new Uint8Array(v85);
  let v88 = 0;
  let v89 = 0;
  while (v88 < v85) {
    const v90 = nextKeystreamWord(v86, v89++);
    v87[v88++] = v90 & 255;
    if (v88 < v85) {
      v87[v88++] = v90 >>> 8 & 255;
    }
    if (v88 < v85) {
      v87[v88++] = v90 >>> 16 & 255;
    }
    if (v88 < v85) {
      v87[v88++] = v90 >>> 24 & 255;
    }
  }
  return v87;
}
function utf8BytesToString(v91) {
  const v92 = {
    dh12: 163
  };
  const v93 = v2;
  let v94 = "";
  let v95 = 0;
  while (v95 < v91.length) {
    const v96 = v91[v95++];
    if (v96 < 128) {
      v94 += String.fromCharCode(v96);
    } else if ((v96 & 224) === 192) {
      const v97 = v91[v95++];
      v94 += String.fromCharCode((v96 & 31) << 6 | v97 & 63);
    } else if ((v96 & 240) === 224) {
      const v98 = v91[v95++];
      const v99 = v91[v95++];
      v94 += String.fromCharCode((v96 & 15) << 12 | (v98 & 63) << 6 | v99 & 63);
    } else if ((v96 & 248) === 240) {
      const v100 = v91[v95++];
      const v101 = v91[v95++];
      const v102 = v91[v95++];
      let v103 = (v96 & 7) << 18 | (v100 & 63) << 12 | (v101 & 63) << 6 | v102 & 63;
      v103 -= 65536;
      v94 += String.fromCharCode(55296 + (v103 >> 10), 56320 + (v103 & 1023));
    } else {
      v94 += String.fromCharCode(v96);
    }
  }
  return v94;
}
function decryptSourcesPayload(v104, v105, v106) {
  const v107 = {
    dh13: 138
  };
  const v108 = v2;
  const v109 = base64UrlToBytes(v104);
  const v110 = generateKeystream(v105, v106, v109.length);
  const v111 = new Uint8Array(v109.length);
  for (let v112 = 0; v112 < v109.length; v112++) {
    v111[v112] = v109[v112] ^ v110[v112];
  }
  for (let v113 = 0; v113 < MAGIC_BYTES.length; v113++) {
    if (v111[v113] !== MAGIC_BYTES[v113]) {
      throw new Error("decrypt failed: bad seed or tampered payload");
    }
  }
  const v114 = v111.subarray(MAGIC_BYTES.length);
  return utf8BytesToString(v114);
}
function getTmdbMeta(v115, v116) {
  const v117 = {
    dh14: 133,
    dh15: 116,
    dh16: 165,
    dh17: 145,
    dh18: 160,
    dh19: 186
  };
  return __async(this, null, function* () {
    const v118 = v1;
    const v119 = v116 === "tv" ? "tv" : "movie";
    const v120 = "https://api.themoviedb.org/3/" + v119 + "/" + v115 + "?api_key=" + TMDB_API_KEY + "&append_to_response=external_ids";
    const v121 = yield __nvFetch(v120, {
      skipSizeCheck: true
    });
    if (!v121.ok) {
      return null;
    }
    const v122 = yield v121.json();
    const v123 = v119 === "tv" ? v122.name : v122.title;
    const v124 = v119 === "tv" ? v122.first_air_date : v122.release_date;
    const v125 = v124 ? v124.slice(0, 4) : "";
    const v126 = v122.external_ids && v122.external_ids.imdb_id || v122.imdb_id || "";
    return {
      title: v123,
      year: v125,
      imdbId: v126
    };
  });
}
function qualityRank(v127) {
  const v128 = v2;
  if (!v127) {
    return 0;
  }
  if (/4k/i.test(v127)) {
    return 2160;
  }
  const v129 = parseInt(v127, 10);
  if (Number.isFinite(v129)) {
    return v129;
  } else {
    return 0;
  }
}
function formatBytes(v130) {
  const v131 = {
    dh20: 162,
    dh21: 151,
    dh22: 184,
    dh23: 146,
    dh24: 142
  };
  const v132 = v2;
  if (!v130) {
    return "Unknown";
  }
  const v133 = 1024;
  const v134 = ["Bytes", "KB", "MB", "GB", "TB"];
  const v135 = Math.floor(Math.log(v130) / Math.log(v133));
  return parseFloat((v130 / Math.pow(v133, v135)).toFixed(2)) + " " + v134[v135];
}
var SEGMENT_SAMPLE_SIZE = 5;
function getRealSegmentSize(v136) {
  const v137 = {
    dh25: 129,
    dh26: 139
  };
  return __async(this, null, function* () {
    const v138 = v1;
    try {
      const v139 = yield __nvFetch(v136, {
        method: "HEAD",
        headers: HEADERS,
        skipSizeCheck: true
      });
      const v140 = v139.headers.get("content-length");
      if (v140) {
        return parseInt(v140, 10);
      }
    } catch (v141) {}
    try {
      const v142 = yield __nvFetch(v136, {
        headers: __spreadProps(__spreadValues({}, HEADERS), {
          Range: "bytes=0-1"
        }),
        skipSizeCheck: true
      });
      const v143 = v142.headers.get("content-range");
      const v144 = v143 && v143.match(/\/(\d+)$/);
      if (v144) {
        return parseInt(v144[1], 10);
      }
    } catch (v145) {}
    return null;
  });
}
function estimateHlsSize(v146) {
  const v147 = {
    dh27: 167,
    dh28: 156,
    dh29: 183,
    dh30: 144,
    dh31: 175
  };
  return __async(this, null, function* () {
    const v148 = v1;
    try {
      const v149 = yield __nvFetch(v146, {
        headers: HEADERS,
        skipSizeCheck: true
      });
      if (!v149.ok) {
        return "Unknown";
      }
      const v150 = yield v149.text();
      const v151 = v150.split("\n").map(v152 => v152.trim()).filter(v153 => v153.startsWith("http"));
      if (!v151.length) {
        return "Unknown";
      }
      const v154 = v151.filter((v155, v156) => v156 % Math.ceil(v151.length / SEGMENT_SAMPLE_SIZE) === 0).slice(0, SEGMENT_SAMPLE_SIZE);
      const v157 = yield Promise.all(v154.map(getRealSegmentSize));
      const v158 = v157.filter(v159 => v159 && v159 > 0);
      if (!v158.length) {
        return "Unknown";
      }
      const v160 = v158.reduce((v161, v162) => v161 + v162, 0) / v158.length;
      const v163 = v160 * v151.length;
      return formatBytes(v163);
    } catch (v164) {
      return "Unknown";
    }
  });
}
function getStreams(v165, v166, v167, v168) {
  const v169 = {
    dh32: 140,
    dh33: 124,
    dh34: 175,
    dh35: 179,
    dh36: 154,
    dh37: 181,
    dh38: 154,
    dh39: 157,
    dh40: 125,
    dh41: 172
  };
  return __async(this, null, function* () {
    const v170 = {
      dh42: 135,
      dh43: 126,
      dh44: 162
    };
    const v171 = v1;
    try {
      let v172 = v165;
      if (typeof v165 === "string" && v165.trim().toLowerCase().startsWith("tt")) {
        const v173 = "https://api.themoviedb.org/3/find/" + v165 + "?api_key=" + TMDB_API_KEY + "&external_source=imdb_id";
        const v174 = yield (yield __nvFetch(v173, {
          skipSizeCheck: true
        })).json();
        const v175 = v166 === "tv" ? v174.tv_results : v174.movie_results;
        v172 = v175 && v175.length ? v175[0].id : null;
        if (!v172) {
          return [];
        }
      }
      v172 = parseInt(v172, 10);
      if (!v172) {
        return [];
      }
      const v176 = yield getTmdbMeta(v172, v166);
      if (!v176 || !v176.title) {
        return [];
      }
      const v177 = yield getApiHost();
      const v178 = v166 === "tv";
      const v179 = yield __nvFetch(v177 + "/seed?mediaId=" + v172, {
        headers: HEADERS,
        skipSizeCheck: true
      });
      if (!v179.ok) {
        return [];
      }
      const v180 = yield v179.json().catch(() => null);
      if (!v180 || !v180.seed) {
        return [];
      }
      const v181 = new URLSearchParams({
        title: v176.title,
        mediaType: v178 ? "tv" : "movie",
        year: v176.year || "",
        episodeId: String(v178 ? v168 || 1 : 1),
        seasonId: String(v178 ? v167 || 1 : 1),
        tmdbId: String(v172),
        imdbId: v176.imdbId || "",
        enc: "2",
        seed: v180.seed
      });
      const v182 = yield __nvFetch(v177 + "/cdn/sources-with-title?" + v181.toString(), {
        headers: HEADERS,
        skipSizeCheck: true
      });
      if (!v182.ok) {
        return [];
      }
      const v183 = yield v182.text();
      let v184;
      try {
        const v185 = decryptSourcesPayload(v183, v180.seed, v172);
        v184 = JSON.parse(v185);
      } catch (v186) {
        console.error("[Cineby] decrypt failed:", v186.message);
        return [];
      }
      const v187 = v184 && v184.sources || [];
      if (!v187.length) {
        return [];
      }
      const v188 = (v184 && v184.subtitles || []).filter(v189 => v189 && v189.url).map(v190 => ({
        url: v190.url,
        lang: v190.lang || v190.language || "Unknown"
      }));
      const v191 = yield Promise.all(v187.filter(v192 => v192 && v192.url).map(v193 => __async(this, null, function* () {
        const v194 = v171;
        const v195 = yield estimateHlsSize(v193.url);
        return {
          url: v193.url,
          quality: v193.quality || "Unknown",
          title: "Cineby " + (v193.quality || "Unknown"),
          name: "Cineby",
          size: v195,
          headers: HEADERS,
          subtitles: v188
        };
      })));
      v191.sort((v196, v197) => qualityRank(v197.quality) - qualityRank(v196.quality));
      return v191;
    } catch (v198) {
      console.error("[Cineby]", v198);
      return [];
    }
  });
}
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    getStreams: getStreams
  };
} else {
  global.getStreams = getStreams;
}
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
  var PROVIDER = "cineby";
  var G = typeof globalThis !== "undefined" ? globalThis : typeof global !== "undefined" ? global : this;
  function settings() {
    try {
      return G && G.SCRAPER_SETTINGS || {};
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
    if (!s) {
      return "";
    }
    if (/8k/.test(s)) {
      return "4K";
    }
    if (/2160|4k|uhd/.test(s)) {
      return "4K";
    }
    if (/1440/.test(s)) {
      return "1440p";
    }
    if (/1080|fhd/.test(s)) {
      return "1080p";
    }
    if (/720/.test(s)) {
      return "720p";
    }
    if (/480|360|240|\bsd\b/.test(s)) {
      return "CAM";
    }
    if (/cam|telesync|telecine|\bts\b|\btc\b|screener|dvdscr/.test(s)) {
      return "CAM";
    }
    return "";
  }
  function qFromText(text) {
    var s = String(text || "");
    var m = s.match(/(\d{3,4})\s*p/i);
    if (m) {
      var n = parseInt(m[1], 10);
      if (n >= 2100) {
        return "4K";
      }
      if (n >= 1300) {
        return "1440p";
      }
      if (n >= 1000) {
        return "1080p";
      }
      if (n >= 640) {
        return "720p";
      }
      return "CAM";
    }
    if (/\b8k\b/i.test(s) || /2160|4k|uhd/i.test(s)) {
      return "4K";
    }
    if (/1440p/i.test(s)) {
      return "1440p";
    }
    if (/cam|telesync|telecine|\bts\b|\btc\b|screener|dvdscr/i.test(s)) {
      return "CAM";
    }
    if (/480p|360p|240p|\bsd\b|\bdvdrip\b/i.test(s)) {
      return "CAM";
    }
    if (/\bhd\b/i.test(s)) {
      return "720p";
    }
    return "";
  }
  var qualCache = G.__NV_QUAL_CACHE__ ||= {};
  function probeM3u8(url, headers) {
    var now = Date.now();
    var c = qualCache[url];
    if (c && now - c.t < (c.q ? 900000 : 180000)) {
      return Promise.resolve(c.q);
    }
    var opts = {
      headers: Object.assign({}, headers || {})
    };
    var p = fetch(url, opts).then(function (r) {
      if (r.ok) {
        return r.text();
      } else {
        return "";
      }
    }).then(function (t) {
      var q = "";
      if (t && t.indexOf("#EXTM3U") !== -1) {
        var best = 0;
        var re = /RESOLUTION=(\d+)x(\d+)/gi;
        var m;
        while ((m = re.exec(t)) !== null) {
          var h = parseInt(m[2], 10);
          if (h > best) {
            best = h;
          }
        }
        if (best >= 2100) {
          q = "4K";
        } else if (best >= 1300) {
          q = "1440p";
        } else if (best >= 1000) {
          q = "1080p";
        } else if (best >= 640) {
          q = "720p";
        } else if (best > 0) {
          q = "CAM";
        }
      }
      qualCache[url] = {
        t: now,
        q: q
      };
      return q;
    }).catch(function () {
      qualCache[url] = {
        t: now,
        q: ""
      };
      return "";
    });
    if (hasTimers()) {
      p = Promise.race([p, new Promise(function (res) {
        var timer = setTimeout(function () {
          res("");
        }, 6000);
        if (typeof timer === "object" && typeof timer.unref === "function") {
          timer.unref();
        }
      })]);
    }
    return p;
  }

  /* ---------- language gate ---------- */
  var BLOCK_RE = new RegExp("\\b(hindi|hin|tamil|telugu|malayalam|mallu|kannada|bengali|bangla|punjabi|marathi|bhojpuri|gujarati|odia|assamese|nepali|urdu|sinhala|arabic|ara|farsi|persian|turkish|turkce|espanol|spanish|latino|castellano|french|vostfr|german|deutsch|russian|korean|kor|japanese|jpn|chinese|mandarin|cantonese|thai|vietnamese|indonesian|bahasa|portuguese|brasileiro|italian|polish|ukrainian|hebrew|hungarian|romanian|dutch|flemish|greek|czech|swedish|danish|norwegian|finnish|org)\\b", "i");
  var ALLOW_RE = /\b(english|eng|tagalog|filipino)\b/i;
  var SUB_RE = /\b[a-z0-9]{0,12}subs?\b/gi;
  // NOTE: gate runs on the stream TITLE only (release names / labels).
  // Provider names (e.g. "MallumV") must not trigger the language gate.
  function langAllowed(titleText) {
    var t = String(titleText || "").replace(SUB_RE, " ");
    if (BLOCK_RE.test(t)) {
      return ALLOW_RE.test(t);
    }
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
  var SEEN = G.__NV_SEEN_URLS__ ||= {};
  // SEEN[nu] = { exp: <ts>, owner: <provider> }
  // - same URL from a DIFFERENT provider within TTL -> dropped (cross-provider dup)
  // - same provider re-querying its own URL -> allowed (repeat opens must still
  //   return rows) and its claim is refreshed
  function claim(nu, now, owner) {
    if (!nu) {
      return true;
    }
    var e = SEEN[nu];
    if (e && e.exp > now && e.owner !== owner) {
      return false;
    }
    SEEN[nu] = {
      exp: now + 120000,
      owner: owner
    };
    return true;
  }

  /* ---------- main ---------- */
  function rank(q) {
    if (q === "4K") {
      return 4;
    }
    if (q === "1440p") {
      return 3.5;
    }
    if (q === "1080p") {
      return 3;
    }
    if (q === "720p") {
      return 2;
    }
    return 0;
  }
  function postProcess(list) {
    var now = Date.now();
    var kept = [];
    var probes = [];
    var rows = [];
    (list || []).forEach(function (s, i) {
      if (!s || !s.url) {
        return;
      }
      if (!langAllowed(s.title)) {
        return;
      }
      var text = (s.name || "") + " " + (s.title || "");
      var isMagnet = /^magnet:/i.test(String(s.url));
      var q = normQ(s.quality) || normQ(String(s.title || "").split("\n")[0]) || qFromText(text);
      var isHlsLike = /m3u8/i.test(String(s.url)) || !/\.(mp4|mkv|avi|mov|webm|ts|flv|m4v|mp3|aac)(\?|$)/i.test(String(s.url.split("?")[0])) && /^https?:/i.test(String(s.url));
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
    return Promise.all(probes).then(function (qs) {
      var ranked = [];
      rows.forEach(function (row, k) {
        var q = qs[k];
        if (!q) {
          return;
        } // unknown resolution -> removed
        if (q === "CAM") {
          return;
        } // cam / sd / sub-720 -> removed
        row.s.quality = q;
        ranked.push({
          s: row.s,
          i: row.i,
          q: q
        });
      });
      // best first so dedupe keeps the strongest duplicate (stable)
      ranked.sort(function (a, b) {
        var r = rank(b.q) - rank(a.q);
        if (r !== 0) {
          return r;
        }
        return a.i - b.i;
      });
      var seenLocal = {};
      var out = [];
      ranked.forEach(function (row) {
        var s = row.s;
        var nu = normUrl(s.url);
        if (seenLocal[nu]) {
          return;
        }
        if (!claim(nu, now, PROVIDER)) {
          return;
        } // already reported by a different provider
        seenLocal[nu] = 1;
        out.push(s);
      });
      return out.slice(0, 40);
    }).catch(function () {
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
    module.exports.getStreams = function () {
      var args = Array.prototype.slice.call(arguments);
      var self = this;
      function finish(v) {
        if (settings().postFilter === false) {
          return v;
        }
        try {
          return postProcess(Array.isArray(v) ? v : []);
        } catch (e) {
          if (Array.isArray(v)) {
            return v;
          } else {
            return [];
          }
        }
      }
      try {
        var r = __orig.apply(self, args);
        if (r && typeof r.then === "function") {
          if (typeof setTimeout === "function") {
            // nv best-settings 4.23.0: hard 8s cap on the whole provider run
            r = Promise.race([r, new Promise(function (res) {
              var dl = setTimeout(function () {
                res([]);
              }, 8000);
              if (dl && typeof dl.unref === "function") {
                dl.unref();
              }
            })]);
          }
          return r.then(function (v) {
            return finish(v);
          }, function () {
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