/*
 * nv-plugins vegamovies.js — FULLY DECODED port of the All-in-One-Nuvio provider (4.23.0 best-settings pass).
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
  for (var v8 in v7 ||= {}) {
    if (__hasOwnProp.call(v7, v8)) {
      __defNormalProp(v6, v8, v7[v8]);
    }
  }
  if (__getOwnPropSymbols) {
    for (var v8 of __getOwnPropSymbols(v7)) {
      if (__propIsEnum.call(v7, v8)) {
        __defNormalProp(v6, v8, v7[v8]);
      }
    }
  }
  return v6;
};
var __spreadProps = (v9, v10) => __defProps(v9, __getOwnPropDescs(v10));
var __async = (v11, v12, v13) => {
  const v14 = {
    dh1: 292
  };
  const v15 = {
    dh2: 276
  };
  const v16 = {
    dh3: 263
  };
  return new Promise((v17, v18) => {
    const v19 = v1;
    var v20 = v21 => {
      const v22 = v1;
      try {
        v23(v13.next(v21));
      } catch (v24) {
        v18(v24);
      }
    };
    var v25 = v26 => {
      const v27 = v1;
      try {
        v23(v13.throw(v26));
      } catch (v28) {
        v18(v28);
      }
    };
    var v23 = v29 => v29.done ? v17(v29.value) : Promise.resolve(v29.value).then(v20, v25);
    v23((v13 = v13.apply(v11, v12)).next());
  });
};
var cheerio = require("cheerio-without-node-native");
var PROVIDER_NAME = "VegaMovies";
var BASE_URL = "https://vegamovies.mq";
var TMDB_API_KEY = "439c478a771f35c05022f9feabcca01c";
var DOMAINS_JSON_URL = "https://raw.githubusercontent.com/SaurabhKaperwan/Utils/refs/heads/main/urls.json";
var REQUEST_TIMEOUT = 12000;
var HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.5"
};
var MOBILE_UAS = ["Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1", "Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1", "Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1", "Mozilla/5.0 (Linux; Android 13; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36", "Mozilla/5.0 (Linux; Android 12; Pixel 6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Mobile Safari/537.36", "Mozilla/5.0 (Linux; Android 14; Pixel 8 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Mobile Safari/537.36"];
function getMobileHeaders() {
  const v30 = v2;
  const v31 = MOBILE_UAS[Math.floor(Math.random() * MOBILE_UAS.length)];
  return {
    "User-Agent": v31,
    Accept: "application/json, text/plain, */*",
    "Accept-Language": "en-US,en;q=0.9",
    Referer: BASE_URL + "/"
  };
}
var EXCLUDED_BUTTONS = ["filepress", "gdtot", "dropgalaxy", "gdflix", "gdlink"];
function fetchSafe(v32) {
  const v33 = {
    dh4: 286
  };
  return __async(this, arguments, function* (v34, v35 = {}, v36 = REQUEST_TIMEOUT) {
    const v37 = v1;
    try {
      const v38 = __spreadProps(__spreadValues({}, v35), {
        headers: __spreadProps(__spreadValues(__spreadValues({}, HEADERS), v35.headers || {}), {
          "Accept-Encoding": "identity"
        })
      });
      const v39 = __nvFetch(v34, v38);
      const v40 = new Promise((v41, v42) => setTimeout(() => v42(new Error("timeout")), v36));
      return yield Promise.race([v39, v40]);
    } catch (v43) {
      if (v43.message === "timeout") {
        console.error("[" + PROVIDER_NAME + "] Timeout: " + v34.substring(0, 100));
      } else {
        console.error("[" + PROVIDER_NAME + "] fetchSafe: " + v34.substring(0, 100) + " -> " + v43.message);
      }
      return null;
    }
  });
}
function fetchJson(v44) {
  return __async(this, arguments, function* (v45, v46 = {}) {
    const v47 = v1;
    try {
      const v48 = yield fetchSafe(v45, v46);
      if (!v48 || !v48.ok) {
        return null;
      }
      const v49 = yield v48.text();
      return JSON.parse(v49);
    } catch (v50) {
      return null;
    }
  });
}
function fetchHtml(v51) {
  const v52 = {
    dh5: 267
  };
  return __async(this, arguments, function* (v53, v54 = {}) {
    const v55 = v1;
    try {
      const v56 = yield fetchSafe(v53, v54);
      if (!v56 || !v56.ok) {
        return null;
      }
      return cheerio.load(yield v56.text());
    } catch (v57) {
      return null;
    }
  });
}
function getOrigin(v58) {
  const v59 = {
    dh6: 238
  };
  const v60 = v2;
  try {
    const v61 = v58.split("//");
    if (v61.length < 2) {
      return v58;
    }
    return v61[0] + "//" + v61[1].split("/")[0];
  } catch (v62) {
    return v58;
  }
}
function fixUrl(v63) {
  const v64 = {
    dh7: 355,
    dh8: 239,
    dh9: 355
  };
  const v65 = v2;
  if (!v63) {
    return "";
  }
  if (v63.startsWith("http://") || v63.startsWith("https://")) {
    return v63;
  }
  if (v63.startsWith("//")) {
    return "https:" + v63;
  }
  if (v63.startsWith("/")) {
    return baseUrl + v63;
  }
  return baseUrl + "/" + v63;
}
function parseQuality(v66) {
  const v67 = {
    dh10: 244,
    dh11: 245
  };
  const v68 = v2;
  const v69 = String(v66 || "");
  const v70 = v69.match(/(2160|1080|720|480)\s*P/i);
  if (v70) {
    return v70[1].toLowerCase() + "p";
  }
  if (/4K|UHD/i.test(v69)) {
    return "2160p";
  }
  if (/1440|2K/i.test(v69)) {
    return "1440p";
  }
  return "HD";
}
function decodeEntities(v71) {
  const v72 = {
    dh12: 320
  };
  const v73 = v2;
  if (!v71) {
    return "";
  }
  return v71.replace(/&#8211;/g, "-").replace(/&#8212;/g, "-").replace(/&#038;/g, "&").replace(/&#8217;/g, "'").replace(/&amp;/g, "&").replace(/&ndash;/g, "-").replace(/&mdash;/g, "-").replace(/&quot;/g, "\"");
}
function makeStream(v74, v75, v76, v77, v78, v79) {
  const v80 = {
    dh13: 320,
    dh14: 339,
    dh15: 203,
    dh16: 320,
    dh17: 269,
    dh18: 212,
    dh19: 356,
    dh20: 245,
    dh21: 210,
    dh22: 316,
    dh23: 277,
    dh24: 349,
    dh25: 305,
    dh26: 339,
    dh27: 320,
    dh28: 337,
    dh29: 194,
    dh30: 330,
    dh31: 365,
    dh32: 307,
    dh33: 307,
    dh34: 352,
    dh35: 311,
    dh36: 281
  };
  const v81 = v2;
  const v82 = decodeEntities(v74).replace(/[\n\t]+/g, "").trim();
  let v83 = decodeEntities(v75 || "").replace(/[\n\t]+/g, " ").replace(/\s{2,}/g, " ").trim();
  let v84 = "";
  const v85 = v83.match(/\[\s*([^\]]+\.(?:mkv|mp4|avi|zip|rar|ts))\s*\]/i);
  if (v85) {
    v84 = v85[1].trim();
    v83 = v83.replace(v85[0], "").trim();
  }
  let v86 = "N/A";
  const v87 = v75.match(/\[\s*(\d+(?:\.\d+)?\s*[MG]B)\s*\]/i);
  if (v87) {
    v86 = v87[1].trim();
  }
  let v88 = "MKV";
  if (v84 && v84.toLowerCase().endsWith(".mp4")) {
    v88 = "MP4";
  }
  let v89 = "WEB-DL";
  if (/bluray|blu\-ray|bdrip/i.test(v75)) {
    v89 = "BluRay";
  } else if (/hdrip|webrip/i.test(v75)) {
    v89 = "WEBRip";
  }
  let v90 = "";
  if (/imax/i.test(v75)) {
    v90 = " | 👁️ iMAX";
  }
  let v91 = "";
  let v92 = "";
  if (/dolby\s*vision|dovi/i.test(v75.toLowerCase())) {
    v92 = "Dolby Vision";
  } else if (/hdr10/i.test(v75)) {
    v92 = "HDR10";
  } else if (/hdr/i.test(v75)) {
    v92 = "HDR";
  } else if (/10bit|10\-bit/i.test(v75)) {
    v92 = "10Bit";
  } else if (/sdr/i.test(v75.toLowerCase())) {
    v92 = "SDR";
  }
  let v93 = "H.264";
  if (/hevc/i.test(v75)) {
    v93 = "HEVC";
  } else if (/x265|h265/i.test(v75)) {
    v93 = "H.265";
  } else if (/x264|h264/i.test(v75)) {
    v93 = "H.264";
  }
  if (v92) {
    v91 = " | 🔆 " + v92 + " • ⚡ " + v93;
  } else {
    v91 = " | ⚡ " + v93;
  }
  let v94 = "";
  const v95 = v75.match(/(TrueHD\s*7\.1|DDP\s*7\.1|DDP\s*5\.1|DD\s*5\.1|5\.1|AAC)/i);
  if (v95) {
    let v96 = v95[1].toUpperCase().replace(/\s+/g, "");
    if (v96 === "5.1") {
      v96 = "DDP5.1";
    }
    if (v96.includes("TRUEHD")) {
      v96 = "TrueHD 7.1";
    }
    v94 = v96;
  } else if (/dolby\s*digital|dd/i.test(v75)) {
    v94 = "Dolby Digital";
  } else if (/dolby/i.test(v75)) {
    v94 = "Dolby";
  }
  if (/atmos/i.test(v75)) {
    v94 = v94 ? v94 + " • 🔊 Atmos" : "🔊 Atmos";
  }
  if (!v94) {
    v94 = "Auto";
  }
  let v97 = [];
  const v98 = v75.toLowerCase();
  const v99 = /dual|hindi\-eng|eng\-hin/i.test(v75 || "");
  if (v99) {
    v97.push("English 🇺🇸 • Hindi 🇮🇳");
  } else {
    if (/hindi|hin/i.test(v98)) {
      v97.push("Hindi 🇮🇳");
    }
    if (/english|eng/i.test(v98)) {
      v97.push("English 🇺🇸");
    }
    if (v97.length === 0) {
      v97.push("English 🇺🇸");
    }
  }
  const v100 = v97.join(" • ");
  let v101 = "";
  const v102 = v75.match(/\b(19\d{2}|20\d{2})\b/);
  const v103 = v102 ? "(" + v102[1] + ")" : "";
  const v104 = v84 || v83;
  const v105 = v104.match(/[sS](\d+)\s*[eE](\d+)/);
  if (v105) {
    let v106 = v104.split(/[sS]\d+/i)[0].replace(/[\.\-_]/g, " ").replace(/[\{\[\(].*$/g, "").trim();
    let v107 = parseInt(v105[1], 10);
    let v108 = parseInt(v105[2], 10);
    v101 = v106 + " - S" + v107 + " E" + v108;
  } else {
    let v109 = v83.split(/[\.\-_]\d{3,4}p/i)[0].replace(/[\.\-_]/g, " ").replace(/\d{3,4}p.*/i, "").replace(/[\{\[\(].*$/g, "").trim();
    v101 = v109 + (v103 ? " - " + v103 : "");
  }
  v101 = v101.replace(/\s+/g, " ").replace(/\s+-\s+-\s+/g, " - ").replace(/-\s*$/, "").trim();
  const v110 = v77 || "1080p";
  const v111 = v99 ? "Dual-Audio" : "Single Audio";
  const v112 = PROVIDER_NAME + " | " + v110 + " | " + v111;
  let v113 = "Play Stream";
  const v114 = (v76 || "").toLowerCase();
  if (v114.includes("/hub2/") || v114.includes("hubcloud") || v114.includes("homelander.buzz") || v114.includes("whistle.lat") || v114.includes("mandalorian.buzz")) {
    v113 = "HubCloud";
  } else if (v114.includes(".r2.dev") || v114.includes("vcloud")) {
    v113 = "vCloud";
  }
  const v115 = "🎬 " + v101;
  const v116 = "💎 " + v110 + " | 🗣️ " + v100 + " | 💾 " + v86;
  const v117 = "🎞️ " + v88 + " | 🎧 " + v94 + v91;
  const v118 = "🔗 " + v113 + " | ☁️ " + v89 + v90;
  v83 = v115 + "\n" + v116 + "\n" + v117 + "\n" + v118;
  return {
    name: v112,
    title: v83,
    size: v83,
    url: v76 || "",
    _resWeight: v110.includes("2160") || v110.toLowerCase().includes("4k") ? 3 : v110.includes("1080") ? 2 : 1,
    _sizeWeight: v87 ? parseFloat(v87[1]) * (v87[1].toUpperCase().includes("GB") ? 1024 : 1) : 0,
    behaviorHints: {
      notWebReady: true,
      proxyHeaders: {
        request: v78 || {
          Referer: baseUrl + "/"
        }
      }
    }
  };
}
function dedupe(v119) {
  const v120 = {
    dh37: 186
  };
  const v121 = {
    dh38: 206,
    dh39: 206,
    dh40: 231
  };
  const v122 = v2;
  const v123 = new Set();
  return (v119 || []).filter(v124 => {
    const v125 = v122;
    if (!v124 || !v124.url || v123.has(v124.url)) {
      return false;
    }
    v123.add(v124.url);
    return true;
  });
}
function isStrictMatch(v126, v127, v128, v129, v130 = []) {
  const v131 = {
    dh41: 320,
    dh42: 307,
    dh43: 355
  };
  const v132 = v2;
  if (!v128) {
    return false;
  }
  const v133 = v128.toLowerCase().replace(/download\s*/gi, "").replace(/[^a-z0-9\s]/g, " ").trim().replace(/\s+/g, " ");
  let v134 = [v126, ...v130].filter(v135 => v135);
  let v136 = false;
  for (let v137 of v134) {
    const v138 = v137.toLowerCase().replace(/[^a-z0-9\s]/g, " ").trim().replace(/\s+/g, " ");
    if (v138.length > 0 && (v133.includes(v138) || v133.startsWith(v138))) {
      v136 = true;
      break;
    }
  }
  if (!v136) {
    return false;
  }
  if (v127 && v129) {
    const v139 = parseInt(v127);
    const v140 = parseInt(v129);
    if (!isNaN(v139) && !isNaN(v140)) {
      if (Math.abs(v139 - v140) > 1) {
        return false;
      }
    }
  }
  return true;
}
var cachedDomains = null;
var domainCacheTime = 0;
var DOMAIN_CACHE_TTL = 14400000;
var baseUrl = BASE_URL;
var cachedHubDomain = "https://hubcloud.foo";
var cachedVcDomain = "https://vcloud.zip";
function refreshDomains() {
  const v141 = {
    dh44: 308,
    dh45: 351
  };
  return __async(this, null, function* () {
    const v142 = v1;
    const v143 = Date.now();
    if (cachedDomains && v143 - domainCacheTime < DOMAIN_CACHE_TTL) {
      return cachedDomains;
    }
    try {
      const v144 = yield fetchJson(DOMAINS_JSON_URL, {}, 8000);
      if (v144) {
        cachedDomains = v144;
        domainCacheTime = v143;
        if (v144.vegamovies) {
          baseUrl = v144.vegamovies;
        }
        if (v144.hubcloud) {
          cachedHubDomain = v144.hubcloud;
        }
        if (v144.vcloud) {
          cachedVcDomain = v144.vcloud;
        }
        console.log("[" + PROVIDER_NAME + "] Domains updated: site=" + baseUrl + " hub=" + cachedHubDomain + " vc=" + cachedVcDomain);
      }
    } catch (v145) {
      console.log("[" + PROVIDER_NAME + "] Domain refresh failed, using defaults");
    }
    return cachedDomains || {};
  });
}
function getLatestHubDomain() {
  return cachedHubDomain;
} /*string-table removed*/
function getLatestVcDomain() {
  return cachedVcDomain;
}
function getTMDBInfo(v146, v147) {
  const v148 = {
    dh46: 355,
    dh47: 265,
    dh48: 218,
    dh49: 190,
    dh50: 220,
    dh51: 272,
    dh52: 205,
    dh53: 296,
    dh54: 268,
    dh55: 205,
    dh56: 240,
    dh57: 343,
    dh58: 227,
    dh59: 361,
    dh60: 314,
    dh61: 348
  };
  return __async(this, null, function* () {
    const v149 = v1;
    const v150 = String(v146 || "").trim();
    const v151 = v150.startsWith("tt");
    const v152 = v147 === "tv" || v147 === "series" ? "tv" : "movie";
    try {
      if (v151) {
        const v153 = yield fetchJson("https://api.themoviedb.org/3/find/" + v150 + "?api_key=" + TMDB_API_KEY + "&external_source=imdb_id", {
          headers: {
            "Accept-Encoding": "identity"
          }
        });
        const v154 = v153 ? v152 === "tv" ? v153.tv_results : v153.movie_results : null;
        if (v154 && v154.length > 0) {
          const v155 = v154[0];
          return {
            title: v152 === "tv" ? v155.name : v155.title,
            year: (v155.first_air_date || v155.release_date || "").split("-")[0],
            imdbId: v150,
            tmdbId: v155.id
          };
        }
        return {
          title: v150,
          year: null,
          imdbId: v150,
          tmdbId: null
        };
      } else {
        const v156 = yield fetchJson("https://api.themoviedb.org/3/" + v152 + "/" + v150 + "?api_key=" + TMDB_API_KEY + "&append_to_response=external_ids,alternative_titles", {
          headers: {
            "Accept-Encoding": "identity"
          }
        });
        if (v156) {
          let v157 = [];
          if (v156.alternative_titles && v156.alternative_titles.titles) {
            v157 = v156.alternative_titles.titles.map(v158 => String(v158.title || ""));
          } else if (v156.alternative_titles && v156.alternative_titles.results) {
            v157 = v156.alternative_titles.results.map(v159 => String(v159.title || ""));
          }
          return {
            title: v152 === "tv" ? v156.name : v156.title,
            year: (v156.first_air_date || v156.release_date || "").split("-")[0],
            imdbId: v156.imdb_id || v156.external_ids && v156.external_ids.imdb_id || null,
            tmdbId: v156.id,
            altTitles: v157
          };
        }
      }
    } catch (v160) {
      console.error("[" + PROVIDER_NAME + "] TMDB error: " + v160.message);
    }
    return {
      title: v150,
      year: null,
      imdbId: null,
      tmdbId: null
    };
  });
}
function searchByTitle(v161, v162) {
  const v163 = {
    dh62: 282,
    dh63: 254,
    dh64: 351,
    dh65: 223,
    dh66: 232,
    dh67: 238
  };
  const v164 = {
    dh68: 301,
    dh69: 320,
    dh70: 339
  };
  return __async(this, null, function* () {
    const v165 = v1;
    if (!v161) {
      return [];
    }
    const v166 = encodeURIComponent(v161 + (v162 ? " " + v162 : ""));
    const v167 = baseUrl + "/search.php?q=" + v166 + "&page=1&per_page=15";
    console.log("[" + PROVIDER_NAME + "] Search: \"" + v161.substring(0, 60) + "\" -> " + v167.substring(0, 120));
    const v168 = yield fetchJson(v167, {
      headers: __spreadProps(__spreadValues({}, getMobileHeaders()), {
        "Accept-Encoding": "identity"
      })
    });
    if (!v168 || !v168.hits || v168.hits.length === 0) {
      console.log("[" + PROVIDER_NAME + "] Search: no results");
      return [];
    }
    console.log("[" + PROVIDER_NAME + "] Search: " + v168.hits.length + " results");
    return v168.hits.map(v169 => {
      const v170 = v165;
      const v171 = v169.document || {};
      return {
        postId: String(v171.id || ""),
        title: (v171.post_title || "").replace(/Download\s*/gi, "").trim(),
        permalink: v171.permalink || "",
        imdbId: v171.imdb_id || "",
        year: v171.category && Array.isArray(v171.category) ? v171.category.find(v172 => /^(19|20)\d{2}$/.test(String(v172).trim())) || ((v171.post_title || "").match(/\b(19|20)\d{2}\b/) || [null])[0] : ((v171.post_title || "").match(/\b(19|20)\d{2}\b/) || [null])[0]
      };
    });
  });
}
function fetchPostContent(v173, v174) {
  const v175 = {
    dh71: 302,
    dh72: 215,
    dh73: 240,
    dh74: 320,
    dh75: 351,
    dh76: 225,
    dh77: 340,
    dh78: 339,
    dh79: 348,
    dh80: 216,
    dh81: 251
  };
  return __async(this, null, function* () {
    const v176 = v1;
    if (!v173) {
      return null;
    }
    const v177 = baseUrl + "/wp-json/wp/v2/posts/" + v173;
    console.log("[" + PROVIDER_NAME + "] Fetching post content " + v173);
    try {
      const v178 = yield fetchSafe(v177, {
        headers: getMobileHeaders()
      }, 15000);
      if (v178 && v178.ok) {
        const v179 = yield v178.text();
        try {
          const v180 = JSON.parse(v179);
          if (v180 && v180.content && v180.content.rendered) {
            const v181 = v180.content.rendered;
            if (!/nexdrive|vcloud|hubcloud|fastdl|genxfm/i.test(v181)) {
              throw new Error("WP-JSON payload is a stale cache missing download links");
            }
            return {
              title: (v180.title && v180.title.rendered || "").replace(/Download\s*/gi, "").trim(),
              html: v181
            };
          }
        } catch (v182) {
          console.log("[" + PROVIDER_NAME + "] WP-JSON parse failed (likely 256KB truncation). Falling back to raw HTML.");
        }
      }
    } catch (v183) {
      console.error("[" + PROVIDER_NAME + "] WP-JSON fetch error: " + v183.message);
    }
    try {
      const v184 = v174 ? fixUrl(v174) : baseUrl + "/?p=" + v173;
      console.log("[" + PROVIDER_NAME + "] HTML Fallback fetching: " + v184);
      const v185 = yield fetchHtml(v184, {
        headers: getMobileHeaders()
      });
      if (v185) {
        const v186 = v185(".entry-content").html() || v185(".post-content").html();
        if (v186) {
          return {
            title: v185("title").text().replace(/Download\s*/gi, "").trim(),
            html: v186
          };
        }
      }
    } catch (v187) {
      console.error("[" + PROVIDER_NAME + "] HTML fallback error: " + v187.message);
    }
    return null;
  });
} /*decoder removed*/
function extractNexdriveLinks(v188) {
  const v189 = {
    dh82: 267,
    dh83: 257
  };
  const v190 = {
    dh84: 285,
    dh85: 329,
    dh86: 254,
    dh87: 203,
    dh88: 238,
    dh89: 320,
    dh90: 214
  };
  const v191 = v2;
  if (!v188) {
    return [];
  }
  const v192 = [];
  const v193 = cheerio.load(v188);
  const v194 = new Set();
  v193("a[href*=\"nexdrive\"], a[href*=\"genxfm\"], a[href*=\"fastdl\"], a[href*=\"vcloud\"], a[href*=\"hubcloud\"]").each((v195, v196) => {
    const v197 = v191;
    try {
      const v198 = v193(v196).attr("href");
      if (!v198) {
        return;
      }
      const v199 = (v193(v196).text() || "").trim();
      if (EXCLUDED_BUTTONS.some(v200 => v199.toLowerCase().includes(v200))) {
        return;
      }
      if (v194.has(v198)) {
        return;
      }
      v194.add(v198);
      let v201 = "HD";
      let v202 = v199 || "Download";
      const v203 = v188.indexOf(v198);
      if (v203 > 0) {
        const v204 = v188.substring(Math.max(0, v203 - 3000), v203);
        const v205 = v204.match(/<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/gi);
        if (v205 && v205.length > 0) {
          const v206 = v205[v205.length - 1].replace(/<[^>]*>/g, "").trim().replace(/Download/ig, "");
          if (v206.length > 5) {
            v202 = v206;
          }
        }
        const v207 = /(?:^|>|\s)(\d{3,4}p|4K|UHD|HDR)(?:<|\s|$)/gi;
        let v208;
        let v209 = null;
        let v210 = -1;
        while ((v208 = v207.exec(v204)) !== null) {
          if (v208.index > v210) {
            v210 = v208.index;
            v209 = v208[1];
          }
        }
        if (v209) {
          v201 = parseQuality(v209);
        }
        if (!v201 || v201 === "HD") {
          const v211 = v204.match(/<(?:h[1-6]|strong|b)[^>]*>[^<]*?(\d{3,4}p|4K|UHD)[^<]*?<\//i);
          if (v211) {
            v201 = parseQuality(v211[1]);
          }
        }
      }
      if (v201 === "480p") {
        return;
      }
      v192.push({
        href: fixUrl(v198),
        quality: v201 || "HD",
        label: v202
      });
    } catch (v212) {}
  });
  return v192;
}
function capLinksForEfficiency(v213, v214 = 15) {
  if (!v213 || v213.length <= v214) {
    return v213;
  }
  return v213.slice(0, v214);
}
function extractSeasonFromContent(v215, v216) {
  const v217 = {
    dh91: 238,
    dh92: 214,
    dh93: 214,
    dh94: 307,
    dh95: 207,
    dh96: 326
  };
  const v218 = v2;
  if (!v215 || v216 == null) {
    return v215;
  }
  let v219 = v215.split("id=\"comments\"")[0];
  if (v219.length === v215.length) {
    v219 = v215.split("class=\"comments-area\"")[0];
  }
  const v220 = /(?:Season|Saison|Staffel)\s+0*(\d+)\b(?!\s*(?:-|–|to|and|&|&#))/gi;
  let v221;
  let v222 = [];
  while ((v221 = v220.exec(v219)) !== null) {
    let v223 = v219.lastIndexOf("<h", v221.index);
    let v224 = v219.lastIndexOf("<strong", v221.index);
    let v225 = Math.max(v223, v224);
    if (v225 < 0 || v221.index - v225 > 500) {
      v225 = v221.index;
    }
    let v226 = v219.substring(v225, v221.index + 50);
    if (v226.toLowerCase().includes("download") || v226.toLowerCase().includes("episode")) {
      continue;
    }
    v222.push({
      season: parseInt(v221[1]),
      index: v225
    });
  }
  if (v222.length === 0) {
    return v219;
  }
  let v227 = v222.filter(v228 => v228.season === v216);
  let v229 = v227[0];
  if (!v229) {
    return v219;
  }
  let v230 = v229.index;
  let v231 = v222.find(v232 => v232.index > v230 && v232.season !== v216);
  let v233 = v231 ? v231.index : v219.length;
  return v219.substring(v230, v233);
}
function extractSingleVc(v234, v235, v236, v237, v238, v239, v240) {
  const v241 = {
    dh97: 307,
    dh98: 293,
    dh99: 320,
    dh100: 222,
    dh101: 254,
    dh102: 312,
    dh103: 351,
    dh104: 289,
    dh105: 203,
    dh106: 285,
    dh107: 307,
    dh108: 198,
    dh109: 238,
    dh110: 279,
    dh111: 186,
    dh112: 306,
    dh113: 355,
    dh114: 294,
    dh115: 318,
    dh116: 333,
    dh117: 326,
    dh118: 238,
    dh119: 333
  };
  const v242 = {
    dh120: 229
  };
  return __async(this, null, function* () {
    const v243 = {
      dh121: 259,
      dh122: 294,
      dh123: 307,
      dh124: 364,
      dh125: 307,
      dh126: 322,
      dh127: 307,
      dh128: 333,
      dh129: 318
    };
    const v244 = {
      dh130: 326
    };
    const v245 = {
      dh131: 294
    };
    const v246 = {
      dh132: 307
    };
    const v247 = {
      dh133: 259,
      dh134: 212,
      dh135: 307,
      dh136: 364,
      dh137: 318,
      dh138: 326,
      dh139: 321
    };
    const v248 = {
      dh140: 229
    };
    const v249 = v1;
    const v250 = [];
    const v251 = v234.toLowerCase();
    if (v251.includes("vcloud") || v251.includes("hubcloud") || v251.includes("nexdrive") || v251.includes("fastdl")) {
      const v252 = v251.includes("hubcloud");
      const v253 = v252 ? getLatestHubDomain() : getLatestVcDomain();
      const v254 = getOrigin(v234);
      let v255 = v234;
      if (v254 !== v253 && (v234.includes("vcloud") || v234.includes("hubcloud"))) {
        v255 = v234.replace(v254, v253);
      }
      const v256 = yield fetchHtml(v255, {
        headers: __spreadProps(__spreadValues({}, getMobileHeaders()), {
          Referer: v235 || baseUrl + "/",
          Cookie: "xla=s4t"
        }),
        redirect: "manual"
      });
      if (!v256) {
        return v250;
      }
      const v257 = v256.html();
      const v258 = v256("title").text() || "";
      if (v236 != null || v237 != null) {
        const v259 = v258.match(/[.\s_\-](?:S|Season)\s*0*(\d{1,2})[.\s_\-]*(?:E|Ep|Episode)\s*0*(\d{1,2})[.\s_\-]/i);
        if (v259) {
          const v260 = parseInt(v259[1]);
          const v261 = parseInt(v259[2]);
          if (v236 != null && v260 !== v236) {
            console.log("[" + PROVIDER_NAME + "] V-Cloud title mismatch: Title=" + v258.substring(0, 40) + " Target=S" + v236);
            return v250;
          }
          if (v237 != null && v261 !== v237) {
            console.log("[" + PROVIDER_NAME + "] V-Cloud title mismatch: Title=" + v258.substring(0, 40) + " Target=E" + v237);
            return v250;
          }
        } else {
          const v262 = v258.match(/[.\s_\-](?:S|Season)\s*0*(\d{1,2})[.\s_\-]/i);
          if (v262 && v236 != null) {
            const v263 = parseInt(v262[1]);
            if (v263 !== v236) {
              console.log("[" + PROVIDER_NAME + "] V-Cloud pack mismatch: Title=" + v258.substring(0, 40) + " Target=S" + v236);
              return v250;
            }
          }
        }
      }
      let v264 = "";
      const v265 = v257.match(/var\s+url\s*=\s*['"]([^'"]+)['"]/);
      const v266 = v257.match(/var\s+url\s*=\s*atob\(atob\('([^']+)'\)\)/);
      if (v266) {
        try {
          v264 = atob(atob(v266[1]));
        } catch (v267) {
          v264 = v266[1];
        }
      } else if (v265) {
        v264 = v265[1];
      }
      const v268 = [];
      const v269 = v256("div.card-header").text() || "";
      let v270 = parseQuality(v269) || v239 || "HD";
      if (v264 && v264.includes(".workers.dev")) {
        const v271 = v264 + "?s=" + (1 + new Date().getMinutes());
        v268.push(() => {
          const v272 = v249;
          v250.push(makeStream("Worker | " + v270, (v238 || "Worker Server") + " [" + v269 + "]", v271, v270, {
            Referer: v255
          }, v240));
        });
        v264 = "";
      }
      v256("a.btn, a").each((v273, v274) => {
        const v275 = {
          dh141: 288
        };
        const v276 = v249;
        try {
          let v277 = v256(v274).attr("href") || "";
          let v278 = (v256(v274).text() || "").trim();
          let v279 = v278.toLowerCase();
          if (!v277 || v277 === "#") {
            return;
          }
          if (v277.toLowerCase().includes(".zip")) {
            return;
          }
          if (v279.includes("10gbps") || v279.includes("gdflix") || v279.includes("dropgalaxy") || v279.includes("telegram")) {
            return;
          }
          if (v279.includes("fslv2")) {
            v268.push(() => {
              const v280 = v276;
              v250.push(makeStream("FSLv2 (Fast) | " + v270, (v238 || v278) + " [" + v269 + "]", v277, v270, {
                Referer: v255
              }, v240));
            });
          } else if (v279.includes("fsl")) {
            const v281 = v277.includes("?") ? v277 + "&s=" + (1 + new Date().getMinutes()) : v277 + "?s=" + (1 + new Date().getMinutes());
            v268.push(() => {
              const v282 = v276;
              v250.push(makeStream("FSL | " + v270, (v238 || v278) + " [" + v269 + "]", v281, v270, {
                Referer: v255
              }, v240));
            });
          } else if (v279.includes("worker")) {
            const v283 = v277.includes("?") ? v277 + "&s=" + (1 + new Date().getMinutes()) : v277 + "?s=" + (1 + new Date().getMinutes());
            v268.push(() => {
              const v284 = v276;
              v250.push(makeStream("Worker | " + v270, (v238 || v278) + " [" + v269 + "]", v283, v270, {
                Referer: v255
              }, v240));
            });
          }
        } catch (v285) {}
      });
      if (v268.length > 0) {
        v268.forEach(v286 => v286());
        return v250;
      }
      if (!v264) {
        const v287 = v256("#download").attr("href") || v256("a").filter((v288, v289) => {
          const v290 = v249;
          const v291 = v256(v289).attr("href") || "";
          return v291.includes("hubcloud.php") || v291.includes("token") || v291.includes("dl");
        }).first().attr("href");
        if (v287) {
          v264 = v287.startsWith("http") ? v287 : getOrigin(v255) + "/" + v287.replace(/^\//, "");
        }
      }
      if (!v264) {
        const v292 = v256("a[href*=\"vcloud.zip\"]").filter((v293, v294) => {
          const v295 = v249;
          const v296 = v256(v294).attr("href") || "";
          return !v296.includes("/api/") && v296 !== v255;
        }).first().attr("href");
        if (v292) {
          return yield extractSingleVc(v292, v235, v236, v237, v238, v239, v240);
        }
      }
      if (!v264) {
        return v250;
      }
      if (v264.indexOf("://") < 0) {
        v264 = getOrigin(v255) + v264;
      }
      const v297 = yield fetchHtml(v264, {
        headers: __spreadProps(__spreadValues({}, getMobileHeaders()), {
          Referer: v255,
          Cookie: "xla=s4t"
        })
      });
      if (!v297) {
        return v250;
      }
      const v298 = v297.html();
      const v299 = v297("div.card-header").text() || "";
      const v300 = parseQuality(v299) || v270;
      const v301 = v298.match(/var\s+url\s*=\s*['"]([^'"]+)['"]/);
      if (v301) {
        const v302 = v301[1];
        if (v302.includes(".workers.dev")) {
          const v303 = v302 + "?s=" + (1 + new Date().getMinutes());
          v268.push(() => {
            v250.push(makeStream("Worker | " + v300, (v238 || "Worker Server") + " [" + v299 + "]", v303, v300, {
              Referer: v264
            }, v240));
          });
        }
      }
      v297("a.btn, a").each((v304, v305) => {
        const v306 = v249;
        try {
          let v307 = v297(v305).attr("href") || "";
          let v308 = (v297(v305).text() || "").trim();
          let v309 = v308.toLowerCase();
          if (!v307 || v307 === "#") {
            return;
          }
          if (v307.toLowerCase().includes(".zip")) {
            return;
          }
          if (v309.includes("10gbps") || v309.includes("gdflix") || v309.includes("dropgalaxy") || v309.includes("telegram")) {
            return;
          }
          if (v309.includes("fslv2")) {
            v268.push(() => {
              const v310 = v306;
              v250.push(makeStream("FSLv2 (Fast) | " + (v239 || quality), (v238 || v308) + " [" + v269 + "]", v307, v239 || quality, {
                Referer: v264
              }, v240));
            });
          } else if (v309.includes("fsl")) {
            const v311 = v307.includes("?") ? v307 + "&s=" + (1 + new Date().getMinutes()) : v307 + "?s=" + (1 + new Date().getMinutes());
            v268.push(() => {
              const v312 = v306;
              v250.push(makeStream("FSL | " + (v239 || quality), (v238 || v308) + " [" + v269 + "]", v311, v239 || quality, {
                Referer: v264
              }, v240));
            });
          }
        } catch (v313) {}
      });
      if (v268.length === 0) {
        const v314 = v297("#fsl").attr("href");
        if (v314) {
          const v315 = v314 + "?s=" + (1 + new Date().getMinutes());
          v268.push(() => {
            const v316 = v249;
            v250.push(makeStream("FSL | " + (v239 || quality), (v238 || "FSL Server") + " [" + v269 + "]", v315, v239 || quality, {
              Referer: v264
            }, v240));
          });
        }
      }
      v268.forEach(v317 => v317());
    }
    return v250;
  });
}
function loadStreamsFromUrl(v318, v319, v320, v321, v322, v323, v324) {
  const v325 = {
    dh142: 307,
    dh143: 290,
    dh144: 279,
    dh145: 238
  };
  const v326 = {
    dh146: 238
  };
  const v327 = {
    dh147: 206,
    dh148: 326
  };
  return __async(this, null, function* () {
    const v328 = {
      dh149: 326
    };
    const v329 = {
      dh150: 294
    };
    const v330 = v1;
    const v331 = v318.toLowerCase();
    if (v331.includes("vcloud") || v331.includes("hubcloud")) {
      return yield extractSingleVc(v318, v321 || v318, v322, v323, v319, v320, v324);
    }
    if (v331.includes("nexdrive") || v331.includes("genxfm") || v331.includes("fastdl")) {
      const v332 = yield fetchHtml(v318, {
        headers: __spreadProps(__spreadValues({}, getMobileHeaders()), {
          Referer: v321 || baseUrl + "/"
        }),
        redirect: "manual"
      });
      if (!v332) {
        return [];
      }
      const v333 = [];
      const v334 = [];
      v332("a[href*=\"vcloud\"], a[href*=\"hubcloud\"]").each((v335, v336) => {
        const v337 = v330;
        let v338 = v332(v336).attr("href");
        if (v338) {
          if (v338.startsWith("/")) {
            v338 = curBase + v338;
          }
          if (v338.includes("/api/index.php?link=")) {
            v334.push(() => __async(this, null, function* () {
              const v339 = v337;
              const v340 = yield fetchHtml(v338, {
                headers: __spreadProps(__spreadValues({}, getMobileHeaders()), {
                  Referer: v318
                }),
                redirect: "manual"
              });
              if (!v340) {
                return [];
              }
              let v341 = v340("a.btn-success, a.btn").attr("href");
              if (v341) {
                if (v341.startsWith("/")) {
                  v341 = getOrigin(v338) + v341;
                }
                return yield extractSingleVc(v341, v338, v322, v323, v319, v320, v324);
              }
              return [];
            }));
            return;
          }
          v334.push(() => __async(this, null, function* () {
            return yield extractSingleVc(v338, v318, v322, v323, v319, v320, v324);
          }));
        }
      });
      if (v323 != null) {
        let v342 = false;
        const v343 = v323 - 1;
        if (v343 >= 0 && v343 < v334.length) {
          try {
            const v344 = yield v334[v343]();
            if (Array.isArray(v344) && v344.length > 0) {
              v344.forEach(v345 => {
                const v346 = v330;
                if (v345 && v345.url) {
                  v333.push(v345);
                }
              });
              v342 = true;
            }
          } catch (v347) {}
        }
        if (!v342) {
          const v348 = v334.filter((v349, v350) => v350 !== v343);
          for (let v351 = 0; v351 < v348.length; v351 += 5) {
            const v352 = v348.slice(v351, v351 + 5);
            const v353 = yield Promise.all(v352.map(v354 => (() => __async(this, null, function* () {
              try {
                return yield v354();
              } catch (v355) {
                return [];
              }
            }))()));
            let v356 = false;
            v353.forEach(v357 => {
              const v358 = {
                dh151: 206
              };
              const v359 = v330;
              if (Array.isArray(v357) && v357.length > 0) {
                v357.forEach(v360 => {
                  const v361 = v359;
                  if (v360 && v360.url) {
                    v333.push(v360);
                  }
                });
                v356 = true;
              }
            });
            if (v356) {
              break;
            }
          }
        }
      } else {
        for (let v362 = 0; v362 < v334.length; v362 += 5) {
          const v363 = v334.slice(v362, v362 + 5);
          const v364 = yield Promise.all(v363.map(v365 => (() => __async(this, null, function* () {
            try {
              return yield v365();
            } catch (v366) {
              return [];
            }
          }))()));
          v364.forEach(v367 => {
            const v368 = v330;
            if (Array.isArray(v367)) {
              v367.forEach(v369 => {
                const v370 = v368;
                if (v369 && v369.url) {
                  v333.push(v369);
                }
              });
            }
          });
        }
      }
      return v333;
    }
    return [];
  });
}
function extractFromPost(v371, v372, v373, v374, v375, v376) {
  const v377 = {
    dh152: 262,
    dh153: 339,
    dh154: 342,
    dh155: 326
  };
  return __async(this, null, function* () {
    const v378 = v1;
    try {
      let v379 = v371.html;
      let v380 = "";
      if (v373 && v374 != null) {
        const v381 = extractSeasonFromContent(v379, v374);
        if (v381) {
          v379 = v381;
        }
        v380 = " S" + v374;
        if (v375) {
          v380 += "E" + v375;
        }
      }
      const v382 = (v380.trim() || v376 || "").trim();
      const v383 = extractNexdriveLinks(v379);
      const v384 = capLinksForEfficiency(v383);
      if (v384.length === 0) {
        return [];
      }
      const v385 = [];
      const v386 = [];
      for (const v387 of v384) {
        const v388 = v387.quality || "HD";
        const v389 = v387.label || v380 + " [" + v388 + "]";
        v386.push(() => loadStreamsFromUrl(v387.href, v389, v388, baseUrl + "/", v374, v375, v382));
      }
      console.log("[" + PROVIDER_NAME + "] Resolving " + v386.length + " nexdrive links for post...");
      const v390 = yield Promise.all(v386.map(v391 => (() => __async(this, null, function* () {
        try {
          return yield v391();
        } catch (v392) {
          return [];
        }
      }))()));
      v390.forEach(v393 => {
        const v394 = v378;
        if (Array.isArray(v393)) {
          v393.forEach(v395 => {
            if (v395 && v395.url) {
              v385.push(v395);
            }
          });
        }
      });
      return v385;
    } catch (v396) {
      console.error("[" + PROVIDER_NAME + "] extractPost Fatal: " + v396.message);
      return [];
    }
  });
}
function getStreams(v397, v398, v399, v400) {
  const v401 = {
    dh156: 266,
    dh157: 265,
    dh158: 351,
    dh159: 192,
    dh160: 248,
    dh161: 246,
    dh162: 240,
    dh163: 334,
    dh164: 247,
    dh165: 273
  };
  const v402 = {
    dh166: 253,
    dh167: 253
  };
  return __async(this, null, function* () {
    const v403 = v1;
    try {
      console.log("[" + PROVIDER_NAME + "] Request: ID=" + v397 + " Type=" + v398 + " S=" + v399 + " E=" + v400);
      yield refreshDomains();
      const v404 = v398 === "tv" || v398 === "series";
      const v405 = yield getTMDBInfo(v397, v398);
      let v406 = v405.imdbId;
      let v407 = v405.title;
      let v408 = v405.year;
      if ((!v406 || !v406.startsWith("tt")) && String(v397).startsWith("tt")) {
        v406 = String(v397);
      }
      let v409 = [];
      if (v406 && v406.startsWith("tt")) {
        console.log("[" + PROVIDER_NAME + "] Searching by exact IMDb ID: " + v406);
        v409 = yield searchByTitle(v406, null);
      }
      const v410 = v409.some(v411 => v411.imdbId === v406);
      if (v409.length === 0 || !v410) {
        let v412 = v407;
        if (v404 && v399 != null) {
          v412 += " season " + Number(v399);
        } else if (v408) {
          v412 += " " + v408;
        }
        console.log("[" + PROVIDER_NAME + "] Falling back to title search: " + v412);
        v409 = yield searchByTitle(v412, v408);
        if (v409.length === 0 && v404 && v399 != null) {
          v409 = yield searchByTitle(v407, v408);
        }
      }
      if (v409.length === 0) {
        return [];
      }
      let v413 = null;
      const v414 = v406 && v406.startsWith("tt") ? v406 : null;
      for (const v415 of v409) {
        if (v414 && v415.imdbId === v414) {
          if (!v404 || !v399) {
            v413 = v415;
            break;
          }
          const v416 = /(?:s|season|staffel|saison)\s*0*(\d+)\s*(?:-|–|to|and|&|&#)\s*0*(\d+)\b/i.exec(v415.title);
          let v417 = false;
          if (v416) {
            const v418 = parseInt(v416[1]);
            const v419 = parseInt(v416[2]);
            const v420 = parseInt(v399);
            if (v420 >= v418 && v420 <= v419) {
              v417 = true;
            }
          }
          if (!v417) {
            v417 = new RegExp("(?:s|season|staffel|saison)\\s*0*" + Number(v399) + "\\b", "i").test(v415.title);
          }
          if (v417) {
            v413 = v415;
            break;
          }
        }
        if (!v413) {
          if (isStrictMatch(v407, v408, v415.title, v415.year, v405.altTitles)) {
            v413 = v415;
          }
        }
      }
      if (!v413 || !v413.postId) {
        console.log("[" + PROVIDER_NAME + "] No strict match found. Rejecting to prevent serving wrong media.");
        return [];
      }
      console.log("[" + PROVIDER_NAME + "] Matched: \"" + v413.title + "\"");
      const v421 = yield fetchPostContent(v413.postId, v413.permalink);
      if (!v421) {
        return [];
      }
      const v422 = v421.title || v413.title;
      const v423 = yield extractFromPost(v421, v422, v404, v399 != null ? Number(v399) : null, v400 != null ? Number(v400) : null, v408);
      const v424 = dedupe(v423).sort((v425, v426) => {
        const v427 = v403;
        if (v426._resWeight !== v425._resWeight) {
          return v426._resWeight - v425._resWeight;
        }
        return v426._sizeWeight - v425._sizeWeight;
      });
      return v424;
    } catch (v428) {
      console.error("[" + PROVIDER_NAME + "] Fatal: " + v428.message);
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
  var PROVIDER = "vegamovies";
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