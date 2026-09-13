/*
 * nv-plugins castle.js — FULLY DECODED port of the All-in-One-Nuvio provider (4.23.0 best-settings pass).
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
"use strict";
const v2 = v1; /*rotation removed*/
; /*decoder removed*/
var __defProp = Object.defineProperty;
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
  const v8 = v2;
  for (var v9 in v7 ||= {}) {
    if (__hasOwnProp.call(v7, v9)) {
      __defNormalProp(v6, v9, v7[v9]);
    }
  }
  if (__getOwnPropSymbols) {
    for (var v9 of __getOwnPropSymbols(v7)) {
      if (__propIsEnum.call(v7, v9)) {
        __defNormalProp(v6, v9, v7[v9]);
      }
    }
  }
  return v6;
};
var __async = (v10, v11, v12) => {
  return new Promise((v13, v14) => {
    const v15 = v1;
    var v16 = v17 => {
      const v18 = v1;
      try {
        v19(v12.next(v17));
      } catch (v20) {
        v14(v20);
      }
    };
    var v21 = v22 => {
      const v23 = v1;
      try {
        v19(v12.throw(v22));
      } catch (v24) {
        v14(v24);
      }
    };
    var v19 = v25 => v25.done ? v13(v25.value) : Promise.resolve(v25.value).then(v16, v21);
    v19((v12 = v12.apply(v10, v11)).next());
  });
};
var TMDB_API_KEY = "439c478a771f35c05022f9feabcca01c";
var TMDB_BASE_URL = "https://api.themoviedb.org/3";
var CASTLE_BASE = "https://api.hlowb.com";
var PKG = "com.external.castle";
var CHANNEL = "IndiaA";
var CLIENT = "1";
var LANG = "en-US";
var API_HEADERS = {
  "User-Agent": "okhttp/4.9.3",
  Accept: "application/json",
  "Accept-Language": "en-US,en;q=0.9",
  Connection: "Keep-Alive",
  Referer: CASTLE_BASE
};
var PLAYBACK_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36",
  Accept: "video/webm,video/ogg,video/*;q=0.9,application/ogg;q=0.7,audio/*;q=0.6,*/*;q=0.5",
  "Accept-Language": "en-US,en;q=0.9",
  "Accept-Encoding": "identity",
  Connection: "keep-alive",
  "Sec-Fetch-Dest": "video",
  "Sec-Fetch-Mode": "no-cors",
  "Sec-Fetch-Site": "cross-site",
  DNT: "1"
};
function makeRequest(v26) {
  return __async(this, arguments, function* (v27, v28 = {}) {
    const v29 = v1;
    try {
      const v30 = yield __nvFetch(v27, {
        method: v28.method || "GET",
        headers: __spreadValues(__spreadValues({}, API_HEADERS), v28.headers),
        body: v28.body
      });
      if (!v30.ok) {
        throw new Error("HTTP " + v30.status + ": " + v30.statusText);
      }
      return v30;
    } catch (v31) {
      console.error("[Castle] Request failed for " + v27 + ": " + v31.message);
      throw v31;
    }
  });
}
function extractCipherFromResponse(v32) {
  return __async(this, null, function* () {
    const v33 = v1;
    const v34 = yield v32.text();
    const v35 = v34.trim();
    if (!v35) {
      throw new Error("Empty response");
    }
    try {
      const v36 = JSON.parse(v35);
      if (v36 && v36.data && typeof v36.data === "string") {
        return v36.data.trim();
      }
    } catch (v37) {}
    return v35;
  });
}
function extractDataBlock(v38) {
  const v39 = v2;
  if (v38 && v38.data && typeof v38.data === "object") {
    return v38.data;
  }
  return v38 || {};
}
function getTMDBDetails(v40, v41) {
  return __async(this, null, function* () {
    const v42 = v1;
    const v43 = v41 === "tv" ? "tv" : "movie";
    const v44 = TMDB_BASE_URL + "/" + v43 + "/" + v40 + "?api_key=" + TMDB_API_KEY + "&append_to_response=external_ids";
    const v45 = yield makeRequest(v44);
    const v46 = yield v45.json();
    const v47 = v41 === "tv" ? v46.name : v46.title;
    const v48 = v41 === "tv" ? v46.first_air_date : v46.release_date;
    const v49 = v48 ? parseInt(v48.split("-")[0]) : null;
    return {
      title: v47,
      year: v49,
      tmdbId: v40
    };
  });
}
function decryptCastle(v50, v51) {
  return __async(this, null, function* () {
    const v52 = v1;
    console.log("[Castle] Starting local AES-CBC decryption...");
    try {
      const v53 = require("crypto-js");
      if (typeof __crypto_aes_decrypt_raw !== "undefined") {
        const v54 = v53.AES.decrypt;
        v53.AES.decrypt = function (v55, v56, v57) {
          const v58 = v52;
          try {
            const v59 = v60 => {
              const v61 = v1;
              const v62 = new Uint8Array(v60.sigBytes);
              for (let v63 = 0; v63 < v60.sigBytes; v63++) {
                v62[v63] = v60.words[v63 >>> 2] >>> 24 - v63 % 4 * 8 & 255;
              }
              return v62;
            };
            const v64 = v65 => {
              const v66 = v1;
              if (v65 instanceof Uint8Array) {
                return v65;
              }
              if (v65 instanceof ArrayBuffer) {
                return new Uint8Array(v65);
              }
              if (v65 && typeof v65.length === "number") {
                return new Uint8Array(Array.prototype.slice.call(v65));
              }
              return new Uint8Array(0);
            };
            const v67 = typeof v55 === "string" ? new Uint8Array(Array.from(atob(v55), v68 => v68.charCodeAt(0))) : v55.ciphertext ? v59(v55.ciphertext) : v64(v55);
            const v69 = v59(v56);
            const v70 = v57 && v57.iv ? v59(v57.iv) : new Uint8Array(0);
            const v71 = v57 && v57.mode || "AES-CBC";
            const v72 = typeof Int8Array !== "undefined" ? new Int8Array(v69.buffer) : v69;
            const v73 = typeof Int8Array !== "undefined" ? new Int8Array(v70.buffer) : v70;
            const v74 = typeof Int8Array !== "undefined" ? new Int8Array(v67.buffer) : v67;
            const v75 = __crypto_aes_decrypt_raw(v71, v72, v73, v74);
            const v76 = new TextDecoder().decode(v75);
            return {
              toString: function () {
                return v76;
              }
            };
          } catch (v77) {
            console.error("[Castle JNI Patch] Decrypt failed, falling back:", v77);
            return v54.call(v53.AES, v55, v56, v57);
          }
        };
      }
      const v78 = "T!BgJB";
      const v79 = v53.enc.Base64.parse(v51);
      const v80 = v53.enc.Utf8.parse(v78);
      const v81 = v79.concat(v80);
      let v82;
      if (v81.sigBytes < 16) {
        const v83 = v53.lib.WordArray.create(new Array(16 - v81.sigBytes).fill(0));
        v82 = v81.concat(v83);
      } else if (v81.sigBytes > 16) {
        v82 = v53.lib.WordArray.create(v81.words.slice(0, 4), 16);
      } else {
        v82 = v81;
      }
      const v84 = v82;
      const v85 = v53.AES.decrypt(v50, v82, {
        iv: v84,
        mode: v53.mode.CBC,
        padding: v53.pad.Pkcs7
      });
      const v86 = v85.toString(v53.enc.Utf8);
      if (!v86) {
        throw new Error("Decryption resulted in empty string (possible key/IV mismatch)");
      }
      console.log("[Castle] Local decryption successful");
      return v86;
    } catch (v87) {
      console.error("[Castle] Local decryption failed: " + v87.message);
      throw v87;
    }
  });
}
function getSecurityKey() {
  return __async(this, null, function* () {
    const v88 = v1;
    console.log("[Castle] Fetching security key...");
    const v89 = CASTLE_BASE + "/v0.1/system/getSecurityKey/1?channel=" + CHANNEL + "&clientType=" + CLIENT + "&lang=" + LANG;
    const v90 = yield makeRequest(v89);
    const v91 = yield v90.json();
    if (v91.code !== 200 || !v91.data) {
      throw new Error("Security key API error: " + JSON.stringify(v91));
    }
    console.log("[Castle] Security key obtained");
    return v91.data;
  });
}
function searchCastle(v92, v93, v94 = 1, v95 = 30) {
  return __async(this, null, function* () {
    const v96 = v1;
    console.log("[Castle] Searching for: " + v93);
    const v97 = new URLSearchParams({
      channel: CHANNEL,
      clientType: CLIENT,
      keyword: v93,
      lang: LANG,
      mode: "1",
      packageName: PKG,
      page: v94.toString(),
      size: v95.toString()
    });
    const v98 = CASTLE_BASE + "/film-api/v1.1.0/movie/searchByKeyword?" + v97.toString();
    const v99 = yield makeRequest(v98);
    const v100 = yield extractCipherFromResponse(v99);
    const v101 = yield decryptCastle(v100, v92);
    return JSON.parse(v101);
  });
}
function getDetails(v102, v103) {
  return __async(this, null, function* () {
    const v104 = v1;
    console.log("[Castle] Fetching details for movieId: " + v103);
    const v105 = CASTLE_BASE + "/film-api/v1.9.9/movie?channel=" + CHANNEL + "&clientType=" + CLIENT + "&lang=" + LANG + "&movieId=" + v103 + "&packageName=" + PKG;
    const v106 = yield makeRequest(v105);
    const v107 = yield extractCipherFromResponse(v106);
    const v108 = yield decryptCastle(v107, v102);
    return JSON.parse(v108);
  });
}
function getVideoV1(v109, v110, v111, v112, v113 = 2) {
  return __async(this, null, function* () {
    const v114 = v1;
    console.log("[Castle] Fetching video (v1) for movieId: " + v110 + ", languageId: " + v112);
    const v115 = CASTLE_BASE + "/film-api/v2.0.1/movie/getVideo2?clientType=" + CLIENT + "&packageName=" + PKG + "&channel=" + CHANNEL + "&lang=" + LANG;
    const v116 = {
      mode: "1",
      appMarket: "GuanWang",
      clientType: CLIENT,
      woolUser: "false",
      apkSignKey: "ED0955EB04E67A1D9F3305B95454FED485261475",
      androidVersion: "13",
      movieId: v110.toString(),
      episodeId: v111.toString(),
      languageId: v112.toString(),
      isNewUser: "true",
      resolution: v113.toString(),
      packageName: PKG
    };
    const v117 = yield makeRequest(v115, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(v116)
    });
    const v118 = yield extractCipherFromResponse(v117);
    const v119 = yield decryptCastle(v118, v109);
    return JSON.parse(v119);
  });
}
function getVideo2(v120, v121, v122, v123 = 2) {
  return __async(this, null, function* () {
    const v124 = v1;
    console.log("[Castle] Fetching video (v2) for movieId: " + v121 + ", episodeId: " + v122);
    const v125 = CASTLE_BASE + "/film-api/v2.0.1/movie/getVideo2?clientType=" + CLIENT + "&packageName=" + PKG + "&channel=" + CHANNEL + "&lang=" + LANG;
    const v126 = {
      mode: "1",
      appMarket: "GuanWang",
      clientType: CLIENT,
      woolUser: "false",
      apkSignKey: "ED0955EB04E67A1D9F3305B95454FED485261475",
      androidVersion: "13",
      movieId: v121.toString(),
      episodeId: v122.toString(),
      isNewUser: "true",
      resolution: v123.toString(),
      packageName: PKG
    };
    const v127 = yield makeRequest(v125, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(v126)
    });
    const v128 = yield extractCipherFromResponse(v127);
    const v129 = yield decryptCastle(v128, v120);
    return JSON.parse(v129);
  });
}
function findCastleMovieId(v130, v131) {
  return __async(this, null, function* () {
    const v132 = v1;
    const v133 = v131.year ? v131.title + " " + v131.year : v131.title;
    const v134 = yield searchCastle(v130, v133);
    const v135 = extractDataBlock(v134);
    const v136 = v135.rows || [];
    if (v136.length === 0) {
      throw new Error("No search results found");
    }
    for (const v137 of v136) {
      const v138 = (v137.title || v137.name || "").toLowerCase();
      const v139 = v131.title.toLowerCase();
      if (v138.includes(v139) || v139.includes(v138)) {
        const v140 = v137.id || v137.redirectId || v137.redirectIdStr;
        if (v140) {
          console.log("[Castle] Found match: " + (v137.title || v137.name) + " (id: " + v140 + ")");
          return v140.toString();
        }
      }
    }
    const v141 = v136[0];
    const v142 = v141.id || v141.redirectId || v141.redirectIdStr;
    if (v142) {
      console.log("[Castle] Using first result: " + (v141.title || v141.name) + " (id: " + v142 + ")");
      return v142.toString();
    }
    throw new Error("Could not extract movie ID from search results");
  });
} /*string-table removed*/
function getQualityValue(v143) {
  const v144 = v2;
  if (!v143) {
    return 0;
  }
  const v145 = v143.toString().toLowerCase().replace(/^(sd|hd|fhd|uhd|4k)\s*/i, "").replace(/p$/, "").trim();
  const v146 = {
    "4k": 2160,
    "2160": 2160,
    "1440": 1440,
    "1080": 1080,
    "720": 720,
    "480": 480,
    "360": 360,
    "240": 240
  };
  if (v146[v145]) {
    return v146[v145];
  }
  const v147 = parseInt(v145);
  if (!isNaN(v147) && v147 > 0) {
    return v147;
  }
  return 0;
}
function formatSize(v148) {
  const v149 = v2;
  if (typeof v148 !== "number" || v148 <= 0) {
    return "Unknown";
  }
  if (v148 > 1000000000) {
    return (v148 / 1000000000).toFixed(2) + " GB";
  }
  return (v148 / 1000000).toFixed(0) + " MB";
}
function resolutionToQuality(v150) {
  const v151 = v2;
  const v152 = {
    1: "480p",
    2: "720p",
    3: "1080p"
  };
  return v152[v150] || v150 + "p";
}
function processVideoResponse(v153, v154, v155, v156, v157, v158) {
  const v159 = v2;
  const v160 = [];
  const v161 = extractDataBlock(v153);
  const v162 = v161.videoUrl;
  if (!v162) {
    console.log("[Castle] No videoUrl found in response");
    return v160;
  }
  const v163 = [];
  if (v161.subtitles && Array.isArray(v161.subtitles)) {
    v161.subtitles.forEach(v164 => {
      const v165 = v159;
      if (v164.url) {
        v163.push({
          url: v164.url,
          language: v164.abbreviate || "Unknown",
          name: v164.title || v164.abbreviate || "Unknown",
          headers: PLAYBACK_HEADERS
        });
      }
    });
  }
  let v166 = v154.title || "Unknown";
  if (v154.year) {
    v166 += " (" + v154.year + ")";
  }
  if (v155 && v156) {
    v166 = v154.title + " S" + String(v155).padStart(2, "0") + "E" + String(v156).padStart(2, "0");
  }
  const v167 = resolutionToQuality(v157);
  if (v161.videos && Array.isArray(v161.videos)) {
    for (const v168 of v161.videos) {
      let v169 = v168.resolutionDescription || v168.resolution || v167;
      v169 = v169.replace(/^(SD|HD|FHD)\s+/i, "");
      const v170 = v158 ? "Castle " + v158 + " - " + v169 : "Castle - " + v169;
      v160.push({
        name: v170,
        title: v166,
        url: v168.url || v162,
        quality: v169,
        size: formatSize(v168.size),
        headers: PLAYBACK_HEADERS,
        provider: "castle",
        subtitles: v163
      });
    }
  } else {
    const v171 = v158 ? "Castle " + v158 + " - " + v167 : "Castle - " + v167;
    v160.push({
      name: v171,
      title: v166,
      url: v162,
      quality: v167,
      size: formatSize(v161.size),
      headers: PLAYBACK_HEADERS,
      provider: "castle",
      subtitles: v163
    });
  }
  return v160;
}
function getStreams(v172, v173, v174, v175) {
  return __async(this, null, function* () {
    const v176 = v1;
    console.log("[Castle] Starting extraction for TMDB ID: " + v172 + ", Type: " + v173 + (v173 === "tv" ? ", S:" + v174 + "E:" + v175 : ""));
    try {
      const v177 = yield getTMDBDetails(v172, v173);
      console.log("[Castle] TMDB Info: \"" + v177.title + "\" (" + (v177.year || "N/A") + ")");
      const v178 = yield getSecurityKey();
      const v179 = yield findCastleMovieId(v178, v177);
      let v180 = yield getDetails(v178, v179);
      let v181 = v179;
      if (v173 === "tv" && v174 && v175) {
        const v182 = extractDataBlock(v180);
        const v183 = v182.seasons || [];
        const v184 = v183.find(v185 => v185.number === v174);
        if (v184 && v184.movieId && v184.movieId !== v179) {
          console.log("[Castle] Fetching season " + v174 + " details...");
          v180 = yield getDetails(v178, v184.movieId.toString());
          v181 = v184.movieId.toString();
        }
      }
      const v186 = extractDataBlock(v180);
      const v187 = v186.episodes || [];
      let v188 = null;
      if (v173 === "tv" && v174 && v175) {
        const v189 = v187.find(v190 => v190.number === v175);
        if (v189 && v189.id) {
          v188 = v189.id.toString();
        }
      } else if (v187.length > 0) {
        v188 = v187[0].id.toString();
      }
      if (!v188) {
        throw new Error("Could not find episode ID");
      }
      const v191 = v187.find(v192 => v192.id.toString() === v188);
      const v193 = v191 && v191.tracks || [];
      const v194 = 2;
      const v195 = [];
      for (const v196 of v193) {
        const v197 = v196.languageName || v196.abbreviate || "Unknown";
        if (v196.existIndividualVideo && v196.languageId) {
          try {
            console.log("[Castle] Fetching " + v197 + " (languageId: " + v196.languageId + ")");
            const v198 = yield getVideoV1(v178, v181, v188, v196.languageId, v194);
            const v199 = processVideoResponse(v198, v177, v174, v175, v194, "[" + v197 + "]");
            if (v199.length > 0) {
              console.log("[Castle] ✅ " + v197 + ": Found " + v199.length + " streams");
              v195.push(...v199);
            }
          } catch (v200) {
            console.log("[Castle] ⚠️ " + v197 + ": Failed - " + v200.message);
          }
        }
      }
      if (v195.length === 0) {
        console.log("[Castle] Falling back to shared stream (v2)");
        const v201 = yield getVideo2(v178, v181, v188, v194);
        const v202 = processVideoResponse(v201, v177, v174, v175, v194, "[Shared]");
        v195.push(...v202);
      }
      v195.sort((v203, v204) => getQualityValue(v204.quality) - getQualityValue(v203.quality));
      console.log("[Castle] Total streams found: " + v195.length);
      return v195;
    } catch (v205) {
      console.error("[Castle] Error: " + v205.message);
      return [];
    }
  });
}
module.exports = {
  getStreams: getStreams
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
  var PROVIDER = "castle";
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