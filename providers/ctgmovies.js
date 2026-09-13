/*
 * nv-plugins ctgmovies.js — FULLY DECODED port of the All-in-One-Nuvio provider (4.24.0 merge pass).
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
const v2 = v1; /*decoder removed*/ /*rotation removed*/
;
var TMDB_API_KEY = "439c478a771f35c05022f9feabcca01c";
var TMDB_BASE_URL = "https://api.themoviedb.org/3";
var MAIN_URL = "https://ctgmovies.com";
var DEFAULT_API_BASE = "https://cockpit.103.109.92.178.nip.io/api/v1";
var UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36";
var AUTH_CONFIG = {
  token: "",
  cookie: ""
};
var WEB_HEADERS = {
  "User-Agent": UA,
  Accept: "application/json",
  "Accept-Language": "en",
  Referer: MAIN_URL + "/",
  Origin: MAIN_URL
};
var STREAM_HEADERS = {
  "User-Agent": UA,
  Accept: "video/webm,video/ogg,video/*;q=0.9,application/ogg;q=0.7,audio/*;q=0.6,*/*;q=0.5",
  "Accept-Language": "en-US,en;q=0.9",
  "Accept-Encoding": "identity",
  Referer: MAIN_URL + "/",
  "Sec-Fetch-Dest": "video",
  "Sec-Fetch-Mode": "no-cors",
  "Sec-Fetch-Site": "cross-site",
  DNT: "1"
};
function encodeUrl(v3) {
  return encodeURIComponent(v3 || "");
}
function yearFromDate(v4) {
  const v5 = v2;
  if (!v4) {
    return null;
  }
  const v6 = v4.match(/\d{4}/);
  if (v6) {
    return parseInt(v6[0], 10);
  } else {
    return null;
  }
}
function cleanDisplayTitle(v7) {
  const v8 = {
    dh1: 476
  };
  const v9 = v2;
  if (!v7) {
    return "";
  }
  return v7.replace(/\b(1080p|720p|480p|2160p|4k|web[- ]?dl|webrip|bluray|hdrip|x264|x265|hevc|10bit|dual[- ]?audio|hindi[- ]?dubbed|dubbed|esub)\b/gi, " ").replace(/\[[^\]]*\]/g, " ").replace(/\s+/g, " ").trim();
}
function normalizedTitle(v10) {
  return cleanDisplayTitle(v10).toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}
function optString(v11, v12) {
  const v13 = {
    dh2: 488
  };
  const v14 = v2;
  if (!v11 || v11[v12] == null) {
    return null;
  }
  let v15 = v11[v12];
  if (typeof v15 !== "string") {
    v15 = String(v15);
  }
  v15 = v15.trim();
  if (!v15 || v15 === "null") {
    return null;
  }
  return v15;
}
function optInt(v16, v17) {
  if (!v16 || v16[v17] == null) {
    return null;
  }
  const v18 = v16[v17];
  if (typeof v18 === "number") {
    return v18;
  }
  const v19 = parseInt(String(v18), 10);
  if (isNaN(v19)) {
    return null;
  } else {
    return v19;
  }
}
function resolveMediaUrl(v20) {
  const v21 = {
    dh3: 480
  };
  const v22 = v2;
  if (!v20) {
    return "";
  }
  if (v20.startsWith("//")) {
    return "https:" + v20;
  }
  if (/^https?:\/\//i.test(v20)) {
    return v20;
  }
  if (v20.startsWith("/")) {
    return MAIN_URL + v20;
  }
  return v20;
}
function resolveSubtitleUrl(v23) {
  const v24 = {
    dh4: 391,
    dh5: 466
  };
  const v25 = v2;
  if (!v23) {
    return "";
  }
  if (v23.startsWith("//")) {
    return "https:" + v23;
  }
  if (/^https?:\/\//i.test(v23)) {
    return v23;
  }
  if (v23.startsWith("/")) {
    return MAIN_URL + v23;
  }
  return MAIN_URL + "/" + v23;
}
function qualityFromUrl(v26) {
  const v27 = {
    dh6: 381,
    dh7: 435,
    dh8: 441
  };
  const v28 = v2;
  if (!v26) {
    return "Unknown";
  }
  const v29 = v26.match(/(2160p|1440p|1080p|720p|576p|540p|480p|360p|4k|uhd)/i);
  if (v29) {
    const v30 = v29[1].toLowerCase();
    if (v30 === "4k" || v30 === "uhd") {
      return "2160p";
    }
    return v30;
  }
  return "Unknown";
}
function cleanSourceName(v31) {
  const v32 = {
    dh9: 448
  };
  const v33 = v2;
  if (!v31) {
    return "";
  }
  let v34 = v31.replace("auto:", "").replace(/:/g, " ").replace(/-/g, " ").trim();
  if (/^server\s*[a-z]$/i.test(v34)) {
    v34 = v34.replace(/server\s*([a-z])/i, function (v35, v36) {
      const v37 = v33;
      return "Server " + v36.toUpperCase();
    });
  }
  return v34;
}
function subtitleLabelFromUrl(v38) {
  const v39 = {
    dh10: 481,
    dh11: 381,
    dh12: 426,
    dh13: 452,
    dh14: 406
  };
  const v40 = v2;
  if (!v38) {
    return "Subtitle";
  }
  const v41 = v38.split("?")[0].split("/").pop().replace(/%20/g, " ");
  const v42 = v41.toLowerCase();
  if (v42.includes("bangla") || v42.includes("bengali") || v42.includes("ben")) {
    return "Bangla";
  }
  if (v42.includes("english") || v42.includes("eng")) {
    return "English";
  }
  if (v42.includes("hindi") || v42.includes("hin")) {
    return "Hindi";
  }
  return "Subtitle";
}
function formatBytes(v43) {
  const v44 = {
    dh15: 409,
    dh16: 374,
    dh17: 374,
    dh18: 500
  };
  const v45 = v2;
  if (!v43 || v43 === 0) {
    return "Unknown";
  }
  const v46 = 1024;
  const v47 = ["Bytes", "KB", "MB", "GB", "TB"];
  const v48 = Math.floor(Math.log(v43) / Math.log(v46));
  return parseFloat((v43 / Math.pow(v46, v48)).toFixed(1)) + " " + v47[v48];
}
function getTMDBDetails(v49, v50) {
  const v51 = {
    dh19: 407
  };
  const v52 = {
    dh20: 450
  };
  const v53 = {
    dh21: 372
  };
  const v54 = v2;
  const v55 = v50 === "tv" ? "tv" : "movie";
  const v56 = TMDB_BASE_URL + "/" + v55 + "/" + v49 + "?api_key=" + TMDB_API_KEY + "&append_to_response=external_ids";
  return __nvFetch(v56, {
    headers: {
      Accept: "application/json"
    },
    skipSizeCheck: true
  }).then(v57 => {
    if (!v57.ok) {
      throw new Error("TMDB HTTP " + v57.status);
    }
    return v57.json();
  }).then(v58 => {
    const v59 = v54;
    const v60 = v50 === "tv" ? v58.name : v58.title;
    const v61 = v50 === "tv" ? v58.first_air_date : v58.release_date;
    return {
      title: v60,
      year: v61 ? parseInt(v61.split("-")[0], 10) : null,
      imdbId: v58.external_ids && v58.external_ids.imdb_id || null
    };
  }).catch(v62 => {
    const v63 = v54;
    console.error("[CTGMovies] TMDB fetch failed:", v62.message);
    return null;
  });
}
function queryString(v64) {
  const v65 = {
    dh22: 468,
    dh23: 411
  };
  const v66 = v2;
  v64 = v64 || {};
  const v67 = Object.keys(v64).filter(v68 => v64[v68] != null).map(v69 => encodeUrl(v69) + "=" + encodeUrl(String(v64[v69])));
  if (v67.length) {
    return "?" + v67.join("&");
  } else {
    return "";
  }
}
function buildApiUrl(v70, v71) {
  const v72 = {
    dh24: 391
  };
  const v73 = v2;
  const v74 = v70.startsWith("/") ? v70 : "/" + v70;
  return DEFAULT_API_BASE + v74 + queryString(v71);
}
function buildSameOriginUrl(v75, v76) {
  const v77 = {
    dh25: 391
  };
  const v78 = v2;
  const v79 = v75.startsWith("/") ? v75 : "/" + v75;
  return MAIN_URL + "/api/v1" + v79 + queryString(v76);
}
function getDetail(v80) {
  const v81 = {
    dh26: 402,
    dh27: 379,
    dh28: 407
  };
  const v82 = v2;
  let v83 = v80.kind || "movies";
  if (v83 === "movie") {
    v83 = "movies";
  }
  return apiGet("/" + v83 + "/" + v80.id).then(v84 => {
    if (!v84) {
      return null;
    }
    try {
      return JSON.parse(v84);
    } catch (v85) {
      return null;
    }
  });
}
function apiHeaders() {
  const v86 = {
    dh29: 421,
    dh30: 434,
    dh31: 445,
    dh32: 494
  };
  const v87 = v2;
  const v88 = Object.assign({}, WEB_HEADERS);
  if (AUTH_CONFIG.token && AUTH_CONFIG.token.trim()) {
    const v89 = AUTH_CONFIG.token.trim().replace(/^Bearer\s+/i, "");
    v88.Authorization = "Bearer " + v89;
    v88["x-auth-token"] = v89;
  }
  if (AUTH_CONFIG.cookie && AUTH_CONFIG.cookie.trim()) {
    v88.Cookie = AUTH_CONFIG.cookie.trim();
  }
  return v88;
}
function apiGet(v90, v91) {
  const v92 = {
    dh33: 450
  };
  const v93 = {
    dh34: 407,
    dh35: 460,
    dh36: 438
  };
  const v94 = v2;
  const v95 = buildApiUrl(v90, v91);
  const v96 = buildSameOriginUrl(v90, v91);
  const v97 = apiHeaders();
  function v98(v99, v100) {
    v100 = v100 || 0;
    return __nvFetch(v99, {
      headers: v97,
      skipSizeCheck: true
    }).then(v101 => {
      const v102 = v1;
      if (v101.status >= 500 && v101.status < 600 && v100 < 1) {
        return new Promise(v103 => setTimeout(v103, 300)).then(() => v98(v99, v100 + 1));
      }
      if (!v101.ok) {
        throw new Error("HTTP " + v101.status);
      }
      return v101.text();
    });
  }
  return v98(v95).catch(() => v98(v96)).catch(v104 => {
    const v105 = v94;
    console.error("[CTGMovies] apiGet " + v90 + " failed:", v104.message);
    return null;
  });
}
function toSearchItem(v106, v107) {
  const v108 = {
    dh37: 453,
    dh38: 400,
    dh39: 415,
    dh40: 375,
    dh41: 403
  };
  const v109 = v2;
  const v110 = v107 === "movies";
  const v111 = v107 === "anime" || v106.is_anime === true && v107 !== "tv";
  const v112 = optString(v106, "title") || optString(v106, "name") || optString(v106, "english_title");
  if (!v112) {
    return null;
  }
  const v113 = optString(v106, "slug") || optString(v106, "id") || optString(v106, "_id");
  if (!v113) {
    return null;
  }
  const v114 = optString(v106, "poster_url") || optString(v106, "cover_url");
  const v115 = optInt(v106, "year") || yearFromDate(optString(v106, "release_date")) || yearFromDate(optString(v106, "first_air_date"));
  let v116 = v110 ? "movie" : v111 ? "anime" : "tv";
  let v117 = MAIN_URL + "/" + (v110 ? "movies" : v111 ? "anime" : "tv") + "/" + v113;
  return {
    title: cleanDisplayTitle(v112),
    url: v117,
    kind: v107,
    id: v113,
    type: v116,
    poster: v114,
    year: v115
  };
}
function parseSearchItems(v118, v119) {
  const v120 = {
    dh42: 379
  };
  const v121 = v2;
  if (!v118) {
    return [];
  }
  let v122 = v118.trim();
  let v123;
  try {
    const v124 = JSON.parse(v122);
    if (Array.isArray(v124)) {
      v123 = v124;
    } else if (v124 && typeof v124 === "object") {
      v123 = v124.movies || v124.results || v124.data || [];
    } else {
      v123 = [];
    }
  } catch (v125) {
    return [];
  }
  const v126 = [];
  for (const v127 of v123) {
    const v128 = toSearchItem(v127, v119);
    if (v128) {
      v126.push(v128);
    }
  }
  return v126;
}
function searchCtg(v129) {
  const v130 = {
    dh43: 412,
    dh44: 407,
    dh45: 392,
    dh46: 432
  };
  const v131 = v2;
  const v132 = {
    search: v129
  };
  const v133 = apiGet("/movies", v132).then(v134 => parseSearchItems(v134, "movies")).catch(() => []);
  const v135 = apiGet("/tv", v132).then(v136 => parseSearchItems(v136, "tv")).catch(() => []);
  const v137 = apiGet("/anime", v132).then(v138 => parseSearchItems(v138, "anime")).catch(() => []);
  return Promise.all([v133, v135, v137]).then(([v139, v140, v141]) => v139.concat(v140).concat(v141));
}
function findBestMatch(v142, v143, v144) {
  const v145 = {
    dh47: 375,
    dh48: 400,
    dh49: 406,
    dh50: 496
  };
  const v146 = v2;
  if (!v143.length) {
    return null;
  }
  const v147 = normalizedTitle(v142.title);
  const v148 = v142.year;
  let v149 = null;
  let v150 = -1;
  for (const v151 of v143) {
    const v152 = normalizedTitle(v151.title);
    let v153 = -1;
    if (v152 === v147) {
      v153 = 100;
      if (v148 && v151.year === v148) {
        v153 += 50;
      }
    } else if (v152.includes(v147) && v147.length >= 4) {
      v153 = 60;
      if (v148 && v151.year === v148) {
        v153 += 30;
      }
    } else if (v147.includes(v152) && v152.length >= 4) {
      v153 = 40;
    }
    if (v144 === "tv" && (v151.type === "tv" || v151.type === "anime")) {
      v153 += 10;
    }
    if (v144 === "movie" && (v151.type === "movie" || v151.type === "anime")) {
      v153 += 10;
    }
    if (v153 > v150) {
      v150 = v153;
      v149 = v151;
    }
  }
  if (v150 >= 30) {
    return v149;
  } else {
    return null;
  }
}
function buildStreams(v154, v155) {
  const v156 = {
    dh51: 495,
    dh52: 425,
    dh53: 454,
    dh54: 487,
    dh55: 381,
    dh56: 429,
    dh57: 406,
    dh58: 406,
    dh59: 452,
    dh60: 433,
    dh61: 465,
    dh62: 406,
    dh63: 478,
    dh64: 406,
    dh65: 428,
    dh66: 406,
    dh67: 446,
    dh68: 477,
    dh69: 382,
    dh70: 416,
    dh71: 424,
    dh72: 395,
    dh73: 430,
    dh74: 464,
    dh75: 475,
    dh76: 390,
    dh77: 420,
    dh78: 404,
    dh79: 457,
    dh80: 385,
    dh81: 413
  };
  const v157 = new Set();
  const v158 = [];
  v154.forEach((v159, v160) => {
    const v161 = v1;
    if (!v159 || v159.broken === true) {
      return;
    }
    const v162 = optString(v159, "url") || optString(v159, "file") || optString(v159, "src") || optString(v159, "link");
    if (!v162) {
      return;
    }
    const v163 = resolveMediaUrl(v162);
    if (!v163 || v157.has(v163)) {
      return;
    }
    v157.add(v163);
    let v164 = qualityFromUrl(v163);
    const v165 = optString(v159, "quality") || "";
    if (v164 === "Unknown") {
      const v166 = v165.match(/(2160|1440|1080|720|576|540|480|360)p?/i);
      if (v166) {
        const v167 = parseInt(v166[1], 10);
        v164 = v167 >= 2160 ? "2160p" : v167 >= 1440 ? "1440p" : v167 >= 1080 ? "1080p" : v167 >= 720 ? "720p" : v167 >= 576 ? "576p" : v167 >= 480 ? "480p" : v167 >= 360 ? "360p" : "Unknown";
      }
    }
    const v168 = v164 !== "Unknown" ? v164.toLowerCase() : "1080p";
    const v169 = (optString(v159, "language") || "en").toLowerCase();
    let v170 = "English";
    let v171 = "🌍";
    if (v169.includes("hin") || v165.toLowerCase().includes("hindi")) {
      v170 = "Hindi";
      v171 = "🇮🇳";
    } else if (v169.includes("ben") || v169.includes("bangla")) {
      v170 = "Bangla";
      v171 = "🇧🇩";
    } else if (v169.includes("eng") || v169 === "en") {
      v170 = "English";
      v171 = "🇺🇸";
    }
    const v172 = (v163 + " " + v165 + " " + (v159.group_source || "") + " " + (v159.source_display || "")).toLowerCase();
    let v173 = "x264";
    if (v172.includes("x265") || v172.includes("h265")) {
      v173 = "x265";
    } else if (v172.includes("hevc")) {
      v173 = "HEVC";
    }
    let v174 = "WEB-DL";
    if (v172.includes("webrip") || v172.includes("web-rip")) {
      v174 = "WEB-Rip";
    } else if (v172.includes("bluray") || v172.includes("blu-ray") || v172.includes("brrip")) {
      v174 = "BluRay";
    } else if (v172.includes("hdrip")) {
      v174 = "HDRip";
    }
    let v175 = "MKV";
    if (v163.includes(".mp4")) {
      v175 = "MP4";
    } else if (v163.includes(".m3u8")) {
      v175 = "M3U8";
    }
    const v176 = optInt(v159, "size_bytes") ? formatBytes(optInt(v159, "size_bytes")) : "Unknown";
    let v177 = "5.1 Surround";
    let v178 = optString(v159, "group_source") || optString(v159, "source_display") || "Server " + (v160 + 1);
    const v179 = cleanSourceName(v178);
    const v180 = "CTGMovies | " + v168 + " | " + v170;
    const v181 = "🍿 " + v155.title + " - (" + (v155.year || "2026") + ")";
    const v182 = "⭐ " + v168 + " | " + v171 + " " + v170 + " | 💾 " + v176;
    const v183 = "🔖 " + v175 + " | 🎥 " + v173 + " | 🎧 " + v177;
    const v184 = "⛓️‍💥 " + v179 + " | ☁️ " + v174;
    const v185 = v181 + "\n" + v182 + "\n" + v183 + "\n" + v184;
    const v186 = [];
    const v187 = ["subtitle_tracks", "subtitles", "captions", "tracks"];
    for (const v188 of v187) {
      const v189 = v159[v188];
      if (Array.isArray(v189)) {
        for (const v190 of v189) {
          const v191 = optString(v190, "url") || optString(v190, "file") || optString(v190, "src");
          if (!v191) {
            continue;
          }
          const v192 = resolveSubtitleUrl(v191);
          if (!v192 || v186.some(v193 => v193.url === v192)) {
            continue;
          }
          const v194 = optString(v190, "label") || optString(v190, "language") || subtitleLabelFromUrl(v192);
          v186.push({
            url: v192,
            lang: v194
          });
        }
      }
    }
    v158.push({
      name: v180,
      title: v185,
      size: v185,
      description: v185,
      url: v163,
      quality: "",
      language: "",
      provider: "CTGMovies",
      headers: STREAM_HEADERS,
      subtitles: v186.length ? v186 : undefined
    });
  });
  return v158;
}
function getMovieStreams(v195, v196) {
  const v197 = {
    dh82: 432
  };
  const v198 = v2;
  return getDetail(v195).then(v199 => {
    const v200 = v198;
    if (!v199 || !v199.links) {
      return [];
    }
    return buildStreams(v199.links, v196);
  }).catch(() => []);
} /*string-table removed*/
function getEpisodeStreams(v201, v202, v203, v204) {
  const v205 = {
    dh83: 384,
    dh84: 393,
    dh85: 451
  };
  return getDetail(v201).then(v206 => {
    const v207 = v1;
    if (!v206 || !v206.episodes) {
      return [];
    }
    const v208 = [];
    for (const v209 of v206.episodes) {
      const v210 = optInt(v209, "episode_number") || optInt(v209, "absolute_number");
      const v211 = optInt(v209, "season_number") || 1;
      if (v211 !== v203 || v210 !== v204) {
        continue;
      }
      const v212 = v209.links || [];
      for (const v213 of v212) {
        if (v213 && v213.broken !== true) {
          v208.push(v213);
        }
      }
    }
    return buildStreams(v208, v202);
  }).catch(() => []);
}
function scrape(v214) {
  const v215 = {
    dh86: 400,
    dh87: 496,
    dh88: 427
  };
  const v216 = {
    dh89: 411
  };
  const v217 = v2;
  const v218 = v214 && v214.title;
  const v219 = v214 && v214.type || "movie";
  const v220 = v214 && v214.season;
  const v221 = v214 && v214.episode;
  const v222 = v214 && v214.year;
  if (!v218) {
    return Promise.resolve([]);
  }
  const v223 = {
    title: v218,
    year: v222 || null,
    imdbId: v214 && v214.imdbId || null
  };
  return searchCtg(v218).then(v224 => {
    const v225 = v217;
    if (!v224.length) {
      return [];
    }
    const v226 = findBestMatch(v223, v224, v219);
    if (!v226) {
      return [];
    }
    if (v219 === "tv" && v220 && v221) {
      v223.title = v223.title + " S" + String(v220).padStart(2, "0") + "E" + String(v221).padStart(2, "0");
      return getEpisodeStreams(v226, v223, v220, v221);
    }
    return getMovieStreams(v226, v223);
  }).catch(() => []);
}
function getStreams(v227, v228 = "movie", v229 = null, v230 = null) {
  const v231 = v2;
  return getTMDBDetails(v227, v228).then(v232 => {
    const v233 = v231;
    if (!v232 || !v232.title) {
      return [];
    }
    return scrape({
      title: v232.title,
      year: v232.year,
      type: v228,
      season: v229,
      episode: v230,
      imdbId: v232.imdbId
    });
  }).catch(() => []);
}
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    getStreams: getStreams,
    scrape: scrape
  };
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
  var PROVIDER = "ctgmovies";
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