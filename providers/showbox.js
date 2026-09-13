/*
 * nv-plugins showbox.js — FULLY DECODED port of the All-in-One-Nuvio provider (4.24.0 merge pass).
 * Decoded from the obfuscated AIO build: string tables resolved, decoder machinery stripped,
 * every network call capped by an 8s deadline, node-core requires fail-soft, nvio post-filter
 * attached (en/tl audio gate, >=720p quality gate, cross-provider dedupe). Endpoints/keys/headers
 * identical to the AIO original.
 */
/* nv-plugins best-settings pass 4.24.0: hard 8s deadline on every network call */
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
/* fail-soft require: node-core modules (net/http/assert/...) never crash the provider */
var __nvRequire = function () {
  var _rq = null;
  try {
    _rq = typeof require === "function" ? require : null;
  } catch (e) {
    _rq = null;
  }
  return function (name) {
    if (_rq) {
      try {
        return _rq(name);
      } catch (e) {}
    }
    return {};
  };
}();
/* QuickJS-safe global aliases: embedded polyfills (forge/uuid/whatwg) reference
   window/self/document unguarded - in Nuvio's QuickJS those would throw
   ReferenceError at module load and kill the provider. */
var window = typeof window !== "undefined" && window ? window : typeof globalThis !== "undefined" ? globalThis : typeof global !== "undefined" ? global : {};
var self = typeof self !== "undefined" && self ? self : window;
var document = typeof document !== "undefined" && document ? document : {
  createElement: function () {
    return {
      style: {},
      setAttribute: function () {},
      getElementsByTagName: function () {
        return [];
      }
    };
  },
  getElementsByTagName: function () {
    return [];
  },
  addEventListener: function () {}
};
var navigator = typeof navigator !== "undefined" && navigator ? navigator : {
  userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36"
};
function v1() {
  return "";
}
const v2 = v1; /*rotation removed*/
;
var __async = (v3, v4, v5) => {
  const v6 = {
    dh1: 451
  };
  return new Promise((v7, v8) => {
    const v9 = v1;
    var v10 = v11 => {
      const v12 = v1;
      try {
        v13(v5.next(v11));
      } catch (v14) {
        v8(v14);
      }
    };
    var v15 = v16 => {
      const v17 = v1;
      try {
        v13(v5.throw(v16));
      } catch (v18) {
        v8(v18);
      }
    };
    var v13 = v19 => v19.done ? v7(v19.value) : Promise.resolve(v19.value).then(v10, v15);
    v13((v5 = v5.apply(v3, v4)).next());
  });
};
var cheerio = __nvRequire("cheerio-without-node-native");
var CryptoJS = __nvRequire("crypto-js");
var TMDB_API_KEY = "439c478a771f35c05022f9feabcca01c";
var TMDB_BASE_URL = "https://api.themoviedb.org/3";
var DEFAULT_API_BASE = "https://id-mapping-api-showbox-proxy.hf.space/api/media";
var WORKING_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Accept: "application/json",
  "Accept-Language": "en-US,en;q=0.9",
  "Content-Type": "application/json"
};
function getQualityEmoji(v20) {
  const v21 = {
    dh2: 443,
    dh3: 447
  };
  const v22 = v2;
  switch (v20) {
    case "Original":
      return "✨";
    case "4K":
      return "🌟";
    case "1440p":
      return "⚡";
    case "1080p":
      return "🔥";
    case "720p":
      return "💎";
    case "480p":
      return "🗜️";
    default:
      return "📼";
  }
} /*string-table removed*/
function getSubheadingQualityLabel(v23, v24) {
  const v25 = v2;
  if (v23 === "Original" && v24) {
    const v26 = v24.match(/(\d{3,4})[pP]/);
    if (v26) {
      return "✨ " + v26[1] + "p";
    }
    return "✨ Original";
  }
  const v27 = getQualityEmoji(v23);
  return v27 + " " + v23;
}
function getFileContainerFormat(v28) {
  const v29 = {
    dh4: 566,
    dh5: 480,
    dh6: 540,
    dh7: 483
  };
  const v30 = v2;
  if (!v28) {
    return "📦 MKV";
  }
  const v31 = v28.toUpperCase();
  if (v31.includes(".MP4") || v31.includes("MP4")) {
    return "📦 MP4";
  }
  if (v31.includes(".AVI") || v31.includes("AVI")) {
    return "📦 AVI";
  }
  if (v31.includes(".TS") || v31.includes("M2TS")) {
    return "📦 TS";
  }
  return "📦 MKV";
} /*decoder removed*/
function parseFilenameMetadata(v32) {
  const v33 = {
    dh8: 506,
    dh9: 540,
    dh10: 578,
    dh11: 535,
    dh12: 540,
    dh13: 497,
    dh14: 543,
    dh15: 458,
    dh16: 439,
    dh17: 540,
    dh18: 553,
    dh19: 540,
    dh20: 465,
    dh21: 484,
    dh22: 459,
    dh23: 540,
    dh24: 540,
    dh25: 450,
    dh26: 562,
    dh27: 432
  };
  const v34 = v2;
  if (!v32) {
    return {
      line3: "🎞️ H.264 | 📺 SDR | 🎧 Stereo",
      source: "📥 WEB-DL"
    };
  }
  const v35 = v32.toUpperCase();
  let v36 = "";
  if (v35.includes("HEVC") || v35.includes("H265") || v35.includes("H.265") || v35.includes("X265")) {
    v36 = "🎞️ HEVC";
  } else if (v35.includes("AVC") || v35.includes("H264") || v35.includes("H.264") || v35.includes("X264")) {
    v36 = "🎞️ H.264";
  } else if (v35.includes("AV1")) {
    v36 = "🎞️ AV1";
  }
  let v37 = "";
  if (v35.includes("DV") || v35.includes("DOLBY VISION") || v35.includes("DOLBYVISION")) {
    v37 = "🌈 DV";
  } else if (v35.includes("HDR10+")) {
    v37 = "✨ HDR10+";
  } else if (v35.includes("HDR10")) {
    v37 = "✨ HDR10";
  } else if (v35.includes("HDR")) {
    v37 = "✨ HDR";
  } else if (v35.includes("SDR")) {
    v37 = "📺 SDR";
  }
  let v38 = "";
  if (v35.includes("ATMOS")) {
    v38 = "🔊 Atmos";
  } else if (v35.includes("DDP5.1") || v35.includes("DD+5.1") || v35.includes("EAC3 5.1")) {
    v38 = "🎧 DDP 5.1";
  } else if (v35.includes("DDP7.1") || v35.includes("DD+7.1") || v35.includes("EAC3 7.1")) {
    v38 = "🎧 DDP 7.1";
  } else if (v35.includes("DD5.1") || v35.includes("AC3 5.1") || v35.includes("5.1")) {
    v38 = "🎧 DD 5.1";
  } else if (v35.includes("AAC")) {
    v38 = "🎧 AAC";
  } else if (v35.includes("DTS")) {
    v38 = "🎧 DTS";
  }
  const v39 = [v36, v37, v38].filter(Boolean);
  const v40 = v39.length > 0 ? v39.join(" | ") : "🎞️ H.264 | 📺 SDR | 🎧 Stereo";
  let v41 = "📥 WEB-DL";
  if (v35.includes("BLURAY") || v35.includes("BLU-RAY") || v35.includes("BDREMUX")) {
    v41 = "💿 BluRay";
  } else if (v35.includes("WEBRIP") || v35.includes("WEB-RIP")) {
    v41 = "🌐 WEB-Rip";
  } else if (v35.includes("TELESYNC") || v35.includes("TS") || v35.includes("CAM")) {
    v41 = "📺 TELESYNC";
  } else if (v35.includes("HDTV")) {
    v41 = "📺 HDTV";
  } else if (v35.includes("WEBDL") || v35.includes("WEB-DL")) {
    v41 = "📥 WEB-DL";
  }
  return {
    line3: v40,
    source: v41
  };
}
function parseSingleToken(v42) {
  const v43 = {
    dh28: 464,
    dh29: 476,
    dh30: 523,
    dh31: 456,
    dh32: 474,
    dh33: 461,
    dh34: 524
  };
  const v44 = v2;
  if (!v42) {
    return "";
  }
  if (v42.startsWith("eyJ")) {
    console.log("[ShowBox] Base64 JWT/JSON token detected. Attempting automatic decryption...");
    try {
      const v45 = CryptoJS.enc.Base64.parse(v42);
      const v46 = v45.toString(CryptoJS.enc.Utf8);
      const v47 = JSON.parse(v46);
      if (v47 && v47.encrypt_data) {
        const v48 = "wEiphTn!";
        const v49 = "123d6cedf626dy54233aa1w6";
        const v50 = CryptoJS.enc.Utf8.parse(v49);
        const v51 = CryptoJS.enc.Utf8.parse(v48);
        const v52 = CryptoJS.TripleDES.decrypt(v47.encrypt_data, v50, {
          iv: v51,
          mode: CryptoJS.mode.CBC,
          padding: CryptoJS.pad.Pkcs7
        });
        const v53 = v52.toString(CryptoJS.enc.Utf8);
        const v54 = JSON.parse(v53);
        if (v54 && v54.uid) {
          return String(v54.uid);
        }
      }
    } catch (v55) {
      console.error("[ShowBox] Failed to decrypt base64 uiToken:", v55.message);
    }
  }
  return v42;
}
function getAllUiTokens() {
  const v56 = {
    dh35: 457,
    dh36: 437
  };
  const v57 = v2;
  try {
    let v58 = "";
    if (typeof global !== "undefined" && global.SCRAPER_SETTINGS && global.SCRAPER_SETTINGS.uiToken) {
      v58 = String(global.SCRAPER_SETTINGS.uiToken).trim();
    } else if (typeof window !== "undefined" && window.SCRAPER_SETTINGS && window.SCRAPER_SETTINGS.uiToken) {
      v58 = String(window.SCRAPER_SETTINGS.uiToken).trim();
    }
    if (!v58) {
      return [];
    }
    return v58.split(",").map(v59 => v59.trim()).filter(Boolean);
  } catch (v60) {
    return [];
  }
}
function getOssGroup() {
  const v61 = {
    dh37: 437
  };
  const v62 = v2;
  try {
    if (typeof global !== "undefined" && global.SCRAPER_SETTINGS && global.SCRAPER_SETTINGS.ossGroup) {
      return String(global.SCRAPER_SETTINGS.ossGroup);
    }
    if (typeof window !== "undefined" && window.SCRAPER_SETTINGS && window.SCRAPER_SETTINGS.ossGroup) {
      return String(window.SCRAPER_SETTINGS.ossGroup);
    }
  } catch (v63) {}
  return null;
}
function getApiBase() {
  const v64 = {
    dh38: 437,
    dh39: 567
  };
  const v65 = v2;
  try {
    if (typeof global !== "undefined" && global.SCRAPER_SETTINGS && global.SCRAPER_SETTINGS.apiBase) {
      return String(global.SCRAPER_SETTINGS.apiBase);
    }
    if (typeof window !== "undefined" && window.SCRAPER_SETTINGS && window.SCRAPER_SETTINGS.apiBase) {
      return String(window.SCRAPER_SETTINGS.apiBase);
    }
  } catch (v66) {}
  return DEFAULT_API_BASE;
}
function getQualityFromName(v67) {
  const v68 = {
    dh40: 506,
    dh41: 473,
    dh42: 565,
    dh43: 503,
    dh44: 429,
    dh45: 513,
    dh46: 463,
    dh47: 492
  };
  const v69 = v2;
  if (!v67) {
    return "Unknown";
  }
  const v70 = v67.toUpperCase();
  if (v70 === "ORG" || v70 === "ORIGINAL") {
    return "Original";
  }
  if (v70 === "4K" || v70 === "2160P") {
    return "4K";
  }
  if (v70 === "1440P" || v70 === "2K") {
    return "1440p";
  }
  if (v70 === "1080P" || v70 === "FHD") {
    return "1080p";
  }
  if (v70 === "720P" || v70 === "HD") {
    return "720p";
  }
  if (v70 === "480P" || v70 === "SD") {
    return "480p";
  }
  if (v70 === "360P") {
    return "360p";
  }
  if (v70 === "240P") {
    return "240p";
  }
  const v71 = v67.match(/(\d{3,4})[pP]?/);
  if (v71) {
    const v72 = parseInt(v71[1]);
    if (v72 >= 2160) {
      return "4K";
    }
    if (v72 >= 1440) {
      return "1440p";
    }
    if (v72 >= 1080) {
      return "1080p";
    }
    if (v72 >= 720) {
      return "720p";
    }
    if (v72 >= 480) {
      return "480p";
    }
    if (v72 >= 360) {
      return "360p";
    }
    return "240p";
  }
  return "Unknown";
}
function formatFileSize(v73) {
  const v74 = v2;
  if (!v73) {
    return "Unknown Size";
  }
  if (typeof v73 === "string" && (v73.includes("GB") || v73.includes("MB") || v73.includes("KB"))) {
    return v73;
  }
  if (typeof v73 === "number") {
    const v75 = v73 / 1073741824;
    if (v75 >= 1) {
      return v75.toFixed(2) + " GB";
    }
    const v76 = v73 / 1048576;
    return v76.toFixed(2) + " MB";
  }
  return v73;
}
function getTMDBDetails(v77, v78) {
  const v79 = {
    dh48: 522,
    dh49: 428,
    dh50: 452,
    dh51: 455
  };
  return __async(this, null, function* () {
    const v80 = v1;
    const v81 = v78 === "tv" ? "tv" : "movie";
    const v82 = TMDB_BASE_URL + "/" + v81 + "/" + v77 + "?api_key=" + TMDB_API_KEY;
    try {
      const v83 = yield __nvFetch(v82);
      if (!v83.ok) {
        throw new Error("HTTP " + v83.status);
      }
      const v84 = yield v83.json();
      const v85 = v78 === "tv" ? v84.name : v84.title;
      const v86 = v78 === "tv" ? v84.first_air_date : v84.release_date;
      const v87 = v86 ? parseInt(v86.split("-")[0]) : null;
      return {
        title: v85,
        year: v87
      };
    } catch (v88) {
      console.log("[ShowBox] TMDB details query failed: " + v88.message);
      return {
        title: "TMDB ID " + v77,
        year: null
      };
    }
  });
}
function extractFebBoxShare(v89, v90, v91, v92, v93, v94, v95) {
  const v96 = {
    dh52: 438,
    dh53: 472,
    dh54: 558,
    dh55: 564,
    dh56: 582,
    dh57: 573,
    dh58: 449,
    dh59: 547,
    dh60: 472,
    dh61: 472,
    dh62: 485,
    dh63: 586,
    dh64: 464,
    dh65: 519,
    dh66: 568,
    dh67: 512,
    dh68: 421
  };
  return __async(this, null, function* () {
    const v97 = {
      dh69: 431,
      dh70: 509,
      dh71: 548,
      dh72: 569,
      dh73: 504,
      dh74: 579,
      dh75: 515,
      dh76: 454
    };
    const v98 = v1;
    const v99 = [];
    try {
      const v100 = v90 === "tv" ? 2 : 1;
      const v101 = "https://www.febbox.com/mbp/to_share_page?box_type=" + v100 + "&mid=" + v89 + "&json=1";
      const v102 = yield __nvFetch(v101).then(v103 => v103.json());
      if (!v102 || v102.code !== 1 || !v102.data) {
        return [];
      }
      const v104 = v102.data.share_link || v102.data.shareLink;
      if (!v104) {
        return [];
      }
      const v105 = v104.split("/").pop();
      const v106 = "https://www.febbox.com/file/file_share_list?share_key=" + v105;
      const v107 = yield __nvFetch(v106, {
        headers: {
          "Accept-Language": "en"
        }
      }).then(v108 => v108.json());
      if (!v107 || v107.code !== 1 || !v107.data || !v107.data.file_list) {
        return [];
      }
      let v109 = [];
      if (v90 === "movie") {
        v109 = v107.data.file_list;
      } else {
        const v110 = "season " + v91;
        const v111 = v107.data.file_list.find(v112 => v112.file_name && v112.file_name.toLowerCase() === v110);
        if (!v111) {
          return [];
        }
        const v113 = "https://www.febbox.com/file/file_share_list?share_key=" + v105 + "&parent_id=" + v111.fid + "&page=1";
        const v114 = yield __nvFetch(v113, {
          headers: {
            "Accept-Language": "en"
          }
        }).then(v115 => v115.json());
        if (!v114 || v114.code !== 1 || !v114.data || !v114.data.file_list) {
          return [];
        }
        const v116 = String(v91).padStart(2, "0");
        const v117 = String(v92).padStart(2, "0");
        v109 = v114.data.file_list.filter(v118 => v118.file_name && (v118.file_name.toLowerCase().includes("s" + v116 + "e" + v117) || v118.file_name.toLowerCase().includes("s" + v91 + "e" + v92)));
      }
      const v119 = {
        Accept: "*/*",
        "Accept-Language": "en-US,en;q=0.8",
        Connection: "keep-alive",
        Range: "bytes=0-",
        Referer: "https://www.febbox.com/",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      };
      const v120 = v93.startsWith("ui=") ? v93 : "ui=" + v93;
      for (const v121 of v109) {
        const v122 = "https://www.febbox.com/console/video_quality_list?fid=" + v121.fid + "&share_key=" + v105;
        const v123 = yield __nvFetch(v122, {
          headers: {
            Cookie: v120
          }
        }).then(v124 => v124.json()).catch(() => null);
        if (!v123 || !v123.html) {
          continue;
        }
        const v125 = cheerio.load(v123.html);
        v125("div.file_quality").each((v126, v127) => {
          const v128 = v98;
          const v129 = v125(v127);
          const v130 = v129.attr("data-url");
          const v131 = v129.attr("data-quality");
          const v132 = v129.find(".size").text().trim();
          if (v130) {
            const v133 = getQualityFromName(v131);
            const v134 = getSubheadingQualityLabel(v133, v121.file_name || v130);
            const v135 = formatFileSize(v132 || v121.file_size);
            const v136 = getFileContainerFormat(v121.file_name || v130);
            const v137 = parseFilenameMetadata(v121.file_name || v130);
            const v138 = "ShowBox | " + v133 + " | Cookie " + v94;
            const v139 = v90 === "tv" ? "🎬 " + (v95.title || "Unknown") + " - (" + (v95.year || "") + ") | S" + String(v91).padStart(2, "0") + " E" + String(v92).padStart(2, "0") : "🍿 " + (v95.title || "Unknown") + " - (" + (v95.year || "") + ")";
            const v140 = v134 + " | 💾 " + v135 + " | " + v136;
            const v141 = v137.line3;
            const v142 = v137.source + " | 🍪 Cookie #" + v94;
            const v143 = v139 + "\n" + v140 + "\n" + v141 + "\n" + v142;
            v99.push({
              name: v138,
              title: v143,
              size: v143,
              description: v143,
              url: v130,
              quality: "",
              language: "",
              headers: v119
            });
          }
        });
      }
    } catch (v144) {
      console.error("[ShowBox] FebBox share extraction error: " + v144.message);
    }
    return v99;
  });
}
function processShowBoxResponse(v145, v146, v147, v148, v149, v150) {
  const v151 = {
    dh77: 518,
    dh78: 427
  };
  const v152 = {
    dh79: 532,
    dh80: 487
  };
  const v153 = v2;
  const v154 = [];
  try {
    if (!v145 || !v145.success || !v145.versions || !Array.isArray(v145.versions)) {
      return v154;
    }
    v145.versions.forEach(function (v155, v156) {
      const v157 = {
        dh81: 539,
        dh82: 515,
        dh83: 514,
        dh84: 454,
        dh85: 563,
        dh86: 452,
        dh87: 493,
        dh88: 442
      };
      const v158 = v153;
      const v159 = v155.size || "Unknown";
      if (v155.links && Array.isArray(v155.links)) {
        v155.links.forEach(function (v160) {
          const v161 = v158;
          if (!v160.url) {
            return;
          }
          const v162 = getQualityFromName(v160.quality || "Unknown");
          const v163 = getSubheadingQualityLabel(v162, v160.url);
          const v164 = v160.size || v159;
          const v165 = formatFileSize(v164);
          const v166 = getFileContainerFormat(v160.url);
          const v167 = parseFilenameMetadata(v160.url);
          let v168 = "ShowBox";
          if (v145.versions.length > 1) {
            v168 += " V" + (v156 + 1);
          }
          const v169 = v168 + " | " + v162 + " | Cookie " + v150;
          const v170 = v147 === "tv" ? "🎬 " + (v146.title || "Unknown") + " - (" + (v146.year || "") + ") | S" + String(v148).padStart(2, "0") + " E" + String(v149).padStart(2, "0") : "🍿 " + (v146.title || "Unknown") + " - (" + (v146.year || "") + ")";
          const v171 = v163 + " | 💾 " + v165 + " | " + v166;
          const v172 = v167.line3;
          const v173 = v167.source + " | 🍪 Cookie #" + v150;
          const v174 = v170 + "\n" + v171 + "\n" + v172 + "\n" + v173;
          v154.push({
            name: v169,
            title: v174,
            size: v174,
            description: v174,
            url: v160.url,
            quality: "",
            language: ""
          });
        });
      }
    });
  } catch (v175) {
    console.error("[ShowBox] Error processing response: " + v175.message);
  }
  return v154;
}
function getStreams(v176, v177 = "movie", v178 = null, v179 = null) {
  const v180 = {
    dh89: 435,
    dh90: 520,
    dh91: 517,
    dh92: 462,
    dh93: 534,
    dh94: 472,
    dh95: 420
  };
  return __async(this, null, function* () {
    const v181 = v1;
    console.log("[ShowBox] Fetching streams for TMDB ID: " + v176 + ", Type: " + v177);
    const v182 = getAllUiTokens();
    const v183 = getOssGroup();
    const v184 = getApiBase();
    if (v182.length === 0) {
      console.error("[ShowBox] No UI token (cookie) found in settings.");
      return [];
    }
    let v185 = [];
    try {
      const v186 = yield getTMDBDetails(v176, v177);
      for (let v187 = 0; v187 < v182.length; v187++) {
        const v188 = v187 + 1;
        const v189 = v182[v187];
        const v190 = parseSingleToken(v189);
        if (!v190) {
          continue;
        }
        console.log("\n--- Processing Cookie " + v188 + " ---");
        let v191 = [];
        let v192;
        if (v177 === "tv" && v178 && v179) {
          if (v183) {
            v192 = v184 + "/tv/" + v176 + "/oss=" + v183 + "/" + v178 + "/" + v179 + "?cookie=" + encodeURIComponent(v190);
          } else {
            v192 = v184 + "/tv/" + v176 + "/" + v178 + "/" + v179 + "?cookie=" + encodeURIComponent(v190);
          }
        } else {
          v192 = v184 + "/movie/" + v176 + "?cookie=" + encodeURIComponent(v190);
        }
        let v193 = null;
        try {
          const v194 = yield __nvFetch(v192, {
            headers: WORKING_HEADERS
          });
          if (v194.ok) {
            const v195 = yield v194.json();
            v191 = processShowBoxResponse(v195, v186, v177, v178, v179, v188);
            if (v195.id || v195.mid) {
              v193 = v195.id || v195.mid;
            } else if (v195.data && (v195.data.id || v195.data.mid)) {
              v193 = v195.data.id || v195.data.mid;
            }
          }
        } catch (v196) {
          console.log("[ShowBox] Proxy server lookup failed for Cookie " + v188 + ": " + v196.message);
        }
        if (v193) {
          const v197 = yield extractFebBoxShare(v193, v177, v178, v179, v190, v188, v186);
          if (v197.length > 0) {
            v191 = v191.concat(v197);
          }
        }
        console.log("[ShowBox] Found " + v191.length + " links for Cookie " + v188);
        v185 = v185.concat(v191);
      }
      return v185;
    } catch (v198) {
      console.error("[ShowBox] Scraper execution failure: " + v198.message);
      return [];
    }
  });
}
function onSettings() {
  const v199 = {
    dh96: 574,
    dh97: 531
  };
  return __async(this, null, function* () {
    const v200 = v1;
    return [{
      type: "header",
      label: "ShowBox Configuration"
    }, {
      type: "text",
      isPassword: true,
      key: "uiToken",
      label: "FebBox UI Tokens (Separated by commas)",
      placeholder: "ui=token1, ui=token2",
      description: "Add multiple tokens separated by commas. Links will display grouped by cookie indicator."
    }, {
      type: "text",
      key: "ossGroup",
      label: "FebBox OSS Group (Optional)",
      placeholder: "",
      description: "Optional OSS group parameter."
    }];
  });
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
  var PROVIDER = "showbox";
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
    var p = __nvFetch(url, opts).then(function (r) {
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