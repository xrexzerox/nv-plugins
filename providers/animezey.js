/*
 * nv-plugins animezey.js — FULLY DECODED port of the All-in-One-Nuvio provider (4.23.0 best-settings pass).
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
var v2 = v1; /*rotation removed*/
;
var __async = (v3, v4, v5) => {
  return new Promise((v6, v7) => {
    var v8 = v1;
    var v9 = v10 => {
      var v11 = v1;
      try {
        v12(v5.next(v10));
      } catch (v13) {
        v7(v13);
      }
    };
    var v14 = v15 => {
      try {
        v12(v5.throw(v15));
      } catch (v16) {
        v7(v16);
      }
    };
    var v12 = v17 => v17.done ? v6(v17.value) : Promise.resolve(v17.value).then(v9, v14);
    v12((v5 = v5.apply(v3, v4)).next());
  });
};
var PROVIDER_NAME = "AnimeZeY";
var TMDB_API_KEY = "439c478a771f35c05022f9feabcca01c";
var TMDB_BASE = "https://api.themoviedb.org/3";
var MAX_RESULTS_MOVIE = 5;
var MAX_RESULTS_EPISODE = 2;
var WORKER_DOMAINS = ["1.animezey23112022.workers.dev", "1.animezeydl.workers.dev"];
var MOBILE_UAS = ["Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36", "Mozilla/5.0 (Linux; Android 14; Pixel 8 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36", "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"];
function getInvertedSortTag(v18, v19) {
  var v20 = {
    dh1: 395,
    dh2: 401
  };
  var v21 = v2;
  if (v19 === undefined) {
    v19 = 999999;
  }
  var v22 = Math.max(0, parseInt(v18, 10) || 0);
  var v23 = Math.max(0, v19 - v22);
  var v24 = v23.toString(2).padStart(20, "0");
  return v24.split("").map(function (v25) {
    if (v25 === "1") {
      return "﻿";
    } else {
      return "​";
    }
  }).join("");
}
function resolveSettings(v26) {
  var v27 = {
    dh3: 356,
    dh4: 501,
    dh5: 439,
    dh6: 446,
    dh7: 515
  };
  var v28 = v2;
  var v29 = {
    sortBy: "quality"
  };
  try {
    var v30 = v26;
    if (!v30 && typeof globalThis !== "undefined") {
      v30 = globalThis.SCRAPER_SETTINGS || globalThis.SETTINGS || globalThis.settings;
    }
    if (!v30 && typeof global !== "undefined") {
      v30 = global.SCRAPER_SETTINGS || global.SETTINGS || global.settings;
    }
    if (!v30 && typeof window !== "undefined") {
      v30 = window.SCRAPER_SETTINGS || window.SETTINGS || window.settings;
    }
    if (v30) {
      var v31 = v30.sortBy || v30.sort_by || v30.sort || "";
      if (typeof v31 === "object" && v31 !== null) {
        v31 = v31.value || v31.label || "";
      }
      var v32 = String(v31).toLowerCase();
      if (v32.includes("size") || v32.includes("largest")) {
        v29.sortBy = "size";
      } else {
        v29.sortBy = "quality";
      }
    }
  } catch (v33) {
    console.error("[" + PROVIDER_NAME + "] Error parsing settings:", v33);
  }
  return v29;
}
function onSettings() {
  var v34 = {
    dh8: 448
  };
  var v35 = v2;
  return [{
    type: "select",
    key: "sortBy",
    name: "sort_by",
    label: "Sort By",
    options: [{
      label: "Quality Score",
      value: "quality"
    }, {
      label: "Largest Size",
      value: "size"
    }],
    default: "quality"
  }];
} /*decoder removed*/
function getQualityRank(v36) {
  var v37 = {
    dh9: 458,
    dh10: 421,
    dh11: 446
  };
  var v38 = v2;
  var v39 = String(v36).toLowerCase();
  if (v39.includes("2160") || v39.includes("4k") || v39.includes("uhd")) {
    return 4;
  }
  if (v39.includes("1080") || v39.includes("fullhd") || v39.includes("fhd")) {
    return 3;
  }
  if (v39.includes("720") || v39.includes("hd")) {
    return 2;
  }
  if (v39.includes("480") || v39.includes("sd") || v39.includes("dvdrip")) {
    return 1;
  }
  return 0;
}
function removeAccents(v40) {
  return (v40 || "").normalize("NFKD").replace(/[\u0300-\u036f]/g, "");
}
function normalizeForCompare(v41) {
  if (!v41) {
    return "";
  }
  var v42 = removeAccents(String(v41)).toLowerCase();
  return v42.replace(/[^a-z0-9]/g, "");
}
function parseQuality(v43) {
  var v44 = {
    dh12: 421,
    dh13: 446,
    dh14: 372,
    dh15: 363,
    dh16: 446,
    dh17: 493,
    dh18: 372
  };
  var v45 = v2;
  var v46 = String(v43 || "").toLowerCase();
  if (v46.includes("2160p") || v46.includes("4k") || v46.includes("uhd")) {
    return "2160p";
  }
  if (v46.includes("1080p") || v46.includes("fullhd") || v46.includes("full hd")) {
    return "1080p";
  }
  if (v46.includes("720p")) {
    return "720p";
  }
  if (["dvdrip", "sd", "480p", "tvrip"].some(function (v47) {
    var v48 = v45;
    return v46.includes(v47);
  })) {
    return "480p";
  }
  return "1080p";
}
function formatSize(v49) {
  var v50 = {
    dh19: 359,
    dh20: 359
  };
  var v51 = v2;
  try {
    var v52 = Number(v49);
    if (!v52 || isNaN(v52)) {
      return "N/A";
    }
    if (v52 < 1024) {
      return v52 + " B";
    }
    if (v52 < 1048576) {
      return (v52 / 1024).toFixed(2) + " KB";
    }
    if (v52 < 1073741824) {
      return (v52 / 1048576).toFixed(2) + " MB";
    }
    return (v52 / 1073741824).toFixed(2) + " GB";
  } catch (v53) {
    return "N/A";
  }
}
function escapeRegExp(v54) {
  return v54.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function pad(v55, v56) {
  var v57 = {
    dh21: 482
  };
  var v58 = v2;
  return String(v55).padStart(v56, "0");
}
function decodeEntities(v59) {
  var v60 = {
    dh22: 491
  };
  var v61 = v2;
  if (!v59) {
    return "";
  }
  var v62 = /&(nbsp|amp|quot|lt|gt|#038);/g;
  var v63 = {
    nbsp: " ",
    amp: "&",
    quot: "\"",
    lt: "<",
    gt: ">",
    "#038": "&"
  };
  return v59.replace(v62, function (v64, v65) {
    return v63[v65];
  }).replace(/&#(\d+);/g, function (v66, v67) {
    var v68 = v61;
    return String.fromCharCode(v67);
  });
}
function getAnimeSearchPatterns(v69, v70) {
  var v71 = {
    dh23: 506
  };
  var v72 = {};
  var v73 = [];
  function v74(v75, v76) {
    var v77 = v1;
    var v78 = v75 + ":" + v76;
    if (!v72[v78]) {
      v72[v78] = true;
      v73.push([v75, v76]);
    }
  }
  v74(v69, v70);
  if (v69 === 1 && v70 > 11) {
    [12, 13].forEach(function (v79) {
      if (v70 > v79) {
        v74(2, v70 - v79);
      }
    });
  }
  return v73;
}
function getAnimeSearchCodes(v80, v81) {
  var v82 = {
    dh24: 506
  };
  var v83 = getAnimeSearchPatterns(v80, v81);
  var v84 = {};
  var v85 = [];
  function v86(v87) {
    var v88 = v1;
    if (!v84[v87]) {
      v84[v87] = true;
      v85.push(v87);
    }
  }
  v83.forEach(function (v89) {
    var v90 = v89[0];
    var v91 = v89[1];
    v86("S" + pad(v90, 2) + "E" + pad(v91, 2));
    v86(pad(v90, 2) + "x" + pad(v91, 2));
    v86(v90 + "." + pad(v91, 2));
    if (v90 === 1 && v91 !== 1) {
      v86(pad(v91, 2));
      v86(pad(v91, 3));
      v86("ep" + pad(v91, 2));
      v86("e" + pad(v91, 2));
    }
  });
  return v85;
}
var TITLE_END_RE = new RegExp("^(?:s\\d{1,2}e\\d{1,2}|\\[?\\d{3,4}p\\]?|(?:19|20)\\d{2}|ep?\\s*\\d+|episode\\s*\\d+|\\[(?:dual|dub|leg|sub|pt[\\-.]br|bluray|bdrip|webrip|web[\\-.]dl|hdtv|x264|x265|hevc|aac|mkv|mp4|avi|wmv|mov)\\]|(?:dual|dub|leg|sub|pt[\\-.]br|bluray|bdrip|webrip|web[\\-.]dl|hdtv|x264|x265|hevc|aac|mkv|mp4|avi|wmv|mov)|\\[\\d+|\\s-\\s\\d+)", "i");
var IGNORABLE_PREFIX_WORDS = {
  the: 1,
  a: 1,
  an: 1,
  o: 1,
  os: 1,
  as: 1,
  de: 1,
  do: 1,
  da: 1,
  dos: 1,
  das: 1,
  em: 1,
  no: 1,
  na: 1,
  nos: 1,
  nas: 1,
  um: 1,
  uma: 1
};
var NOISE_WORD_RE = new RegExp("^(?:\\d{4}|[a-z0-9]+(?:p|k)|bluray|bdrip|webrip|web|hdtv|x264|x265|hevc|aac|mkv|mp4|avi|wmv|mov|hdr|sdr|remux|dual|dub|dublado|leg|legendado|sub|pt[\\-.]?br|nf|netflix|hbo|max|hbomax|disney|disneyplus|amazon|prime|paramount|peacock|hulu|apple|appletv|star|globoplay|telecine|crunchyroll|funimation|youtube|vix|pluto|copia|copy|sample|extras?)$", "i");
function fetchPlain(v92, v93) {
  return __async(this, null, function* () {
    return __nvFetch(v92, v93 || {});
  });
}
function fetchJson(v94, v95) {
  return __async(this, null, function* () {
    try {
      var v96 = yield fetchPlain(v94, {
        headers: {
          "User-Agent": v95
        }
      });
      if (!v96.ok) {
        return null;
      }
      return yield v96.json();
    } catch (v97) {
      return null;
    }
  });
}
function fetchTmdbDetails(v98, v99, v100) {
  return __async(this, null, function* () {
    var v101 = v1;
    var v102 = v99 === "movie" ? "/movie/" + v98 : "/tv/" + v98;
    var v103 = TMDB_BASE + v102 + "?api_key=" + TMDB_API_KEY + "&language=en-US";
    return yield fetchJson(v103, v100);
  });
}
function computeAbsoluteEpisode(v104, v105, v106) {
  var v107 = {
    dh25: 479
  };
  var v108 = v2;
  if (!Array.isArray(v104)) {
    return null;
  }
  var v109 = v106;
  for (var v110 = 0; v110 < v104.length; v110++) {
    var v111 = v104[v110];
    if (v111.season_number > 0 && v111.season_number < v105) {
      v109 += v111.episode_count || 0;
    }
  }
  return v109;
} /*string-table removed*/
function makeStream(v112, v113, v114, v115, v116, v117, v118, v119, v120, v121, v122) {
  var v123 = {
    dh26: 418,
    dh27: 474,
    dh28: 459,
    dh29: 446,
    dh30: 445,
    dh31: 368,
    dh32: 382,
    dh33: 434,
    dh34: 368,
    dh35: 440,
    dh36: 420,
    dh37: 368,
    dh38: 446,
    dh39: 498,
    dh40: 384,
    dh41: 481,
    dh42: 455,
    dh43: 385,
    dh44: 517,
    dh45: 389,
    dh46: 477,
    dh47: 509
  };
  var v124 = v2;
  var v125 = decodeEntities(v112 || "").replace(/[\n\t]+/g, "").trim();
  var v126 = v125.toLowerCase();
  var v127 = (v113 || "").toLowerCase();
  var v128 = v114 || "N/A";
  var v129 = 0;
  if (v121 && !isNaN(Number(v121)) && Number(v121) > 0) {
    v129 = Math.floor(Number(v121) / 1048576);
  } else if (v128 !== "N/A") {
    var v130 = v128.match(/([\d.]+)\s*(GB|MB|KB)/i);
    if (v130) {
      var v131 = parseFloat(v130[1]);
      var v132 = v130[2].toUpperCase();
      if (v132.includes("GB")) {
        v129 = Math.floor(v131 * 1024);
      } else if (v132.includes("MB")) {
        v129 = Math.floor(v131);
      }
    }
  }
  var v133 = v113 && v127.split("?")[0].endsWith(".mp4") ? "MP4" : "MKV";
  var v134 = parseQuality(v125);
  var v135 = getQualityRank(v134);
  var v136 = v134 === "2160p" || v126.includes("4k");
  var v137 = v136 ? "🌟" : "🔥";
  var v138 = "WEB-DL";
  if (/\b(bluray|blu\-ray|bdrip)\b/i.test(v126)) {
    v138 = "BluRay";
  } else if (/\b(hdrip|webrip)\b/i.test(v126)) {
    v138 = "WEBRip";
  }
  var v139 = "H.264";
  if (/\b(x265|h265)\b/i.test(v126) || v127.includes("x265")) {
    v139 = "H.265";
  } else if (/\bhevc\b/i.test(v126) || v127.includes("hevc") || v136) {
    v139 = "HEVC";
  }
  var v140 = "";
  if (/\bhdr10plus\b/i.test(v126)) {
    v140 = "HDR10+";
  } else if (/\bhdr10\b/i.test(v126)) {
    v140 = "HDR10";
  } else if (/\bhdr\b/i.test(v126)) {
    v140 = "HDR";
  } else if (/\b(10bit|10\-bit)\b/i.test(v126)) {
    v140 = "10Bit";
  }
  var v141 = v140 ? "🌈 " + v140 + " | " : "";
  var v142 = /\b(dolby\s*vision|dovi|dv)\b/i.test(v126) || v127.includes("dovi");
  var v143 = v142 ? " | 👁️ DV" : "";
  var v144 = "DD5.1";
  if (/\bddp5\.1\b/i.test(v126)) {
    v144 = "DDP5.1";
  } else if (v128 !== "N/A" && v129 < 1300) {
    v144 = "Stereo";
  }
  if (/\batmos\b/i.test(v126) || v127.includes("atmos")) {
    if (v144 === "DDP5.1") {
      v144 = "DDP5.1 • 🔊 Atmos";
    } else {
      v144 = "DD5.1 • 🔊 Atmos";
    }
  }
  var v145 = /\b(dual|multi|dubbed|legendado|dublado)\b/i.test(v126) || v127.includes("dual");
  var v146 = v145 ? "Dual-Audio" : "Single Audio";
  var v147 = v145 ? v119 ? "Portuguese 🇧🇷 • Japanese 🇯🇵" : "English 🇺🇸 • Portuguese 🇧🇷" : "Portuguese 🇧🇷";
  var v148 = v117 || "Unknown Title";
  var v149 = v118 || "2026";
  var v150 = v116 ? "🍿 " + v148 + " - " + v149 + " | " + v116 : "🍿 " + v148 + " - " + v149;
  var v151 = v137 + " " + v134 + " | 💾 " + v128 + " | 🎞️ " + v133;
  var v152 = v141 + "⚡ " + v139 + " | ";
  var v153 = "🌍 " + v146 + " | 🎧 " + v144 + v143;
  var v154 = "🗣️ " + v147 + " | ";
  var v155 = "🔗 AnimeZeY Server | 🕸️ " + v138;
  var v156 = v150 + "\n" + v151 + "\n" + v152 + "\n" + v153 + "\n" + v154 + "\n" + v155;
  var v157 = "";
  if (v120 === "size") {
    v157 = getInvertedSortTag(v129, 999999);
  } else {
    v157 = getInvertedSortTag(v135 * 100000 + v129, 999999);
  }
  var v158 = v157 + PROVIDER_NAME + " | " + v134 + " | " + v146;
  var v159 = v122 ? "https://" + v122 + "/" : "https://1.animezey23112022.workers.dev/";
  return {
    qualityRank: v135,
    sizeInMB: v129,
    data: {
      name: v158,
      title: v156,
      size: v156,
      url: v113 || "",
      behaviorHints: {
        notWebReady: true,
        proxyHeaders: {
          request: {
            "User-Agent": v115,
            Referer: v159
          }
        }
      }
    }
  };
}
function AnimeZeyScraper(v160, v161, v162, v163) {
  var v164 = {
    dh48: 386,
    dh49: 418,
    dh50: 362,
    dh51: 475,
    dh52: 424,
    dh53: 352,
    dh54: 378,
    dh55: 354,
    dh56: 357
  };
  var v165 = v2;
  this.providerUrl = v160;
  this.sessionUA = v162;
  this.sortBy = v163 || "quality";
  this.tmdbId = v161.tmdb_id;
  this.title = (v161.title || "").trim();
  this.originalTitle = (v161.original_title || "").trim();
  this.romajiTitle = (v161.romaji_title || "").trim();
  this.mediaType = (v161.media_type || "").toLowerCase();
  var v166 = parseInt(v161.year, 10);
  this.year = Number.isFinite(v166) ? v166 : null;
  if (this.mediaType === "tvshow") {
    var v167 = parseInt(v161.season, 10);
    var v168 = parseInt(v161.episode, 10);
    this.season = Number.isFinite(v167) ? v167 : 1;
    this.episode = Number.isFinite(v168) ? v168 : 1;
    var v169 = v161.absolute_episode;
    var v170 = parseInt(v169, 10);
    this.absEp = v169 !== undefined && v169 !== null && Number.isFinite(v170) ? v170 : null;
  } else {
    this.season = null;
    this.episode = null;
    this.absEp = null;
  }
  this._setupDomains();
}
AnimeZeyScraper.prototype._setupDomains = function () {
  var v171 = {
    dh57: 398
  };
  var v172 = v2;
  this.baseDomains = WORKER_DOMAINS.slice();
  this.currentDomainIndex = 0;
  this.downloadDomain = "animezey16082023.animezey16082023.workers.dev";
};
AnimeZeyScraper.prototype._getCurrentDomain = function () {
  var v173 = {
    dh58: 457
  };
  var v174 = v2;
  return this.baseDomains[this.currentDomainIndex];
};
AnimeZeyScraper.prototype._rotateWorkerDomain = function () {
  var v175 = {
    dh59: 431,
    dh60: 479,
    dh61: 351
  };
  var v176 = v2;
  this.currentDomainIndex = (this.currentDomainIndex + 1) % this.baseDomains.length;
  console.warn("[" + PROVIDER_NAME + "] Switched active worker domain to: " + this._getCurrentDomain());
};
AnimeZeyScraper.prototype._postSearch = function (v177) {
  var v178 = {
    dh62: 351,
    dh63: 449,
    dh64: 387,
    dh65: 400,
    dh66: 388,
    dh67: 435,
    dh68: 508
  };
  return __async(this, null, function* () {
    var v179 = v1;
    var v180 = this.baseDomains.length;
    for (var v181 = 0; v181 < v180; v181++) {
      var v182 = this._getCurrentDomain();
      var v183 = "https://" + v182 + "/1:search";
      try {
        var v184 = yield fetchPlain(v183, {
          method: "POST",
          headers: {
            accept: "*/*",
            "accept-language": "en-US,en;q=0.9",
            "content-type": "application/json",
            Referer: v183,
            "User-Agent": this.sessionUA
          },
          body: JSON.stringify(v177)
        });
        if (v184.status === 429 || v184.status >= 500) {
          console.warn("[" + PROVIDER_NAME + "] Worker " + v182 + " rate-limited (" + v184.status + "). Rotating...");
          this._rotateWorkerDomain();
          continue;
        }
        if (!v184.ok) {
          this._rotateWorkerDomain();
          continue;
        }
        return yield v184.json();
      } catch (v185) {
        console.warn("[" + PROVIDER_NAME + "] Failed search request to " + v182 + ":", v185);
        this._rotateWorkerDomain();
      }
    }
    return null;
  });
};
AnimeZeyScraper.prototype._isAnime = function () {
  var v186 = {
    dh69: 489,
    dh70: 415
  };
  var v187 = {
    dh71: 368
  };
  var v188 = v2;
  if (this.romajiTitle && this.romajiTitle !== this.originalTitle) {
    return true;
  }
  var v189 = /[\u3040-\u30ff\u4e00-\u9fff]/;
  return [this.romajiTitle, this.originalTitle, this.title].some(function (v190) {
    var v191 = v188;
    return v190 && v189.test(v190);
  });
};
AnimeZeyScraper.prototype._isFlatSeries = function () {
  var v192 = v2;
  return !this._isAnime() && this.mediaType === "tvshow" && this.season === 1;
};
AnimeZeyScraper.prototype.scrape = function () {
  var v193 = {
    dh72: 427
  };
  return __async(this, null, function* () {
    var v194 = v1;
    if (this.mediaType === "movie") {
      return yield this._searchMovies();
    }
    if (this.mediaType === "tvshow") {
      return yield this._searchEpisodes();
    }
    return [];
  });
};
AnimeZeyScraper.prototype._searchEpisodes = function () {
  var v195 = {
    dh73: 479,
    dh74: 371,
    dh75: 436,
    dh76: 371,
    dh77: 436
  };
  return __async(this, null, function* () {
    var v196 = v1;
    var v197 = this;
    var v198 = {};
    var v199 = [];
    var v200 = this._generateEpisodeQueries().slice(0, 10);
    if (!v200.length) {
      return [];
    }
    for (var v201 = 0; v201 < v200.length; v201++) {
      if (v199.length >= MAX_RESULTS_EPISODE) {
        break;
      }
      var v202 = yield v197._postSearch({
        q: v200[v201],
        page_token: null,
        page_index: 0
      });
      var v203 = v202 && v202.data && v202.data.files ? v202.data.files : [];
      for (var v204 = 0; v204 < v203.length; v204++) {
        if (v199.length >= MAX_RESULTS_EPISODE) {
          break;
        }
        var v205 = v203[v204];
        if (v198[v205.id]) {
          continue;
        }
        v198[v205.id] = true;
        if (!v197._isVideoFile(v205)) {
          continue;
        }
        if (v197._isCorrectEpisode(v205.name || "")) {
          v199.push(v205);
        }
      }
    }
    return yield v197._processResults(v199);
  });
};
AnimeZeyScraper.prototype._generateEpisodeQueries = function () {
  var v206 = {
    dh78: 512,
    dh79: 494,
    dh80: 354,
    dh81: 354,
    dh82: 424,
    dh83: 424,
    dh84: 510
  };
  var v207 = {
    dh85: 418
  };
  var v208 = {
    dh86: 354,
    dh87: 506,
    dh88: 424,
    dh89: 477
  };
  var v209 = {
    dh90: 506
  };
  var v210 = {
    dh91: 360
  };
  var v211 = {
    dh92: 367
  };
  var v212 = {
    dh93: 368
  };
  var v213 = {
    dh94: 512,
    dh95: 506
  };
  var v214 = {
    dh96: 367,
    dh97: 477,
    dh98: 506,
    dh99: 512
  };
  var v215 = {
    dh100: 367,
    dh101: 486
  };
  var v216 = {
    dh102: 367,
    dh103: 512
  };
  var v217 = {
    dh104: 506,
    dh105: 367
  };
  var v218 = {
    dh106: 491,
    dh107: 491
  };
  var v219 = v2;
  var v220 = [];
  var v221 = this._getBaseNames().slice(0, 4);
  if (!v221.length) {
    return [];
  }
  var v222 = getAnimeSearchCodes(this.season, this.episode);
  var v223 = this._isAnime();
  var v224 = this;
  function v225(v226) {
    var v227 = v219;
    var v228 = removeAccents(v226.replace(/['".:]/g, ""));
    v228 = v228.replace(/\s*-\s*/g, " ").trim();
    var v229 = v228.replace(/ /g, ".");
    var v230 = v226.replace(/['".:]/g, "");
    v230 = v230.replace(/\s*-\s*/g, " ").trim();
    var v231 = v230.replace(/ /g, ".");
    return {
      clean: v228,
      dots: v229,
      raw: v230,
      dotsRaw: v231
    };
  }
  var v232 = "S" + pad(this.season, 2) + "E" + pad(this.episode, 2);
  v221.forEach(function (v233) {
    var v234 = v219;
    var v235 = v225(v233);
    v220.push(v235.dotsRaw + "." + v232);
    v220.push(v235.dots + "." + v232);
    v220.push(v235.raw + " " + v232);
    v220.push(v235.clean + " " + v232);
  });
  if (this._isFlatSeries()) {
    v221.forEach(function (v236) {
      var v237 = v219;
      var v238 = v225(v236);
      v220.push(v238.clean + " - " + pad(v224.episode, 3));
      v220.push(v238.clean + " - " + pad(v224.episode, 2));
      v220.push(v238.dots + "." + pad(v224.episode, 3));
      v220.push(v238.dots + "." + pad(v224.episode, 2));
      v220.push(v238.clean + " " + pad(v224.episode, 3));
    });
  }
  var v239 = v223 && this.absEp !== null && this.absEp !== this.episode;
  if (v239) {
    v221.forEach(function (v240) {
      var v241 = v219;
      var v242 = v225(v240);
      v220.push(v242.clean + " - " + pad(v224.absEp, 2));
      v220.push(v242.clean + " - " + pad(v224.absEp, 3));
      v220.push(v242.dots + "." + pad(v224.absEp, 2));
      v220.push(v242.dots + "." + pad(v224.absEp, 3));
    });
  }
  if (v223 && this.season > 1 && this.absEp === null) {
    v221.forEach(function (v243) {
      var v244 = v219;
      var v245 = v225(v243);
      v220.push(v245.clean + " - " + pad(v224.episode, 3));
      v220.push(v245.clean + " - " + pad(v224.episode, 2));
      v220.push(v245.dots + "." + pad(v224.episode, 3));
      v220.push(v245.dots + "." + pad(v224.episode, 2));
    });
  }
  if (v223 && this.season === 1) {
    v221.forEach(function (v246) {
      var v247 = v219;
      var v248 = v225(v246);
      v220.push(v248.clean + " - " + pad(v224.episode, 2));
      v220.push(v248.clean + " - " + pad(v224.episode, 3));
      v220.push(v248.dots + " - " + pad(v224.episode, 2));
      v220.push(v248.dots + "-" + pad(v224.episode, 2));
    });
  }
  v221.forEach(function (v249) {
    var v250 = v219;
    var v251 = v225(v249);
    var v252 = v223 && v224.season === 1 ? v222.filter(function (v253) {
      var v254 = v250;
      return /^\d+$/.test(v253);
    }) : v222.slice(0, 4);
    v252.forEach(function (v255) {
      var v256 = v250;
      v220.push(v251.dots + "." + v255);
      if (v255.toUpperCase().charAt(0) !== "S") {
        v220.push(v251.clean + " " + v255);
      }
    });
  });
  if (this.year && this.year > 1900) {
    v221.slice(0, 2).forEach(function (v257) {
      var v258 = v219;
      var v259 = v225(v257);
      v222.slice(0, 2).forEach(function (v260) {
        var v261 = v1;
        v220.push(v259.dots + "." + v224.year + "." + v260);
      });
      if (v223 && v224.season === 1) {
        v220.push(v259.clean + " " + v224.year + " - " + pad(v224.episode, 2));
      }
    });
  }
  var v262 = {};
  return v220.filter(function (v263) {
    var v264 = v219;
    v263 = v263.trim();
    if (!v263 || v262[v263]) {
      return false;
    }
    v262[v263] = true;
    return true;
  });
};
AnimeZeyScraper.prototype._isCorrectEpisode = function (v265) {
  var v266 = {
    dh108: 404,
    dh109: 354,
    dh110: 512,
    dh111: 408,
    dh112: 466,
    dh113: 477,
    dh114: 486,
    dh115: 494
  };
  var v267 = {
    dh116: 368
  };
  var v268 = v2;
  var v269 = v265.toLowerCase();
  var v270 = removeAccents(v269);
  if (!this._matchesSeriesInFilename(v269)) {
    return false;
  }
  var v271 = /s\d{2}e\d{2}|\d+x\d{2}/.test(v270);
  var v272 = ["s" + pad(this.season, 2) + "e" + pad(this.episode, 2), this.season + "x" + pad(this.episode, 2)];
  for (var v273 = 0; v273 < v272.length; v273++) {
    if (v270.includes(v272[v273])) {
      return true;
    }
  }
  if (v271) {
    return false;
  }
  var v274 = getAnimeSearchCodes(this.season, this.episode);
  for (var v275 = 0; v275 < v274.length; v275++) {
    var v276 = new RegExp("(?<!\\d)" + escapeRegExp(v274[v275].toLowerCase()) + "(?!\\d)");
    if (v276.test(v270)) {
      return true;
    }
  }
  if (this._isAnime() && this.season > 1 && this.absEp === null) {
    var v277 = [" - " + pad(this.episode, 2), " - " + pad(this.episode, 3), "- " + pad(this.episode, 2), "- " + pad(this.episode, 3), " " + pad(this.episode, 3) + ".", " " + pad(this.episode, 3) + " ", "[" + pad(this.episode, 3) + "]"];
    if (v277.some(function (v278) {
      return v270.includes(v278);
    })) {
      return true;
    }
  }
  if (this._isAnime() && this.absEp !== null) {
    var v279 = [" - " + pad(this.absEp, 2) + "(?!\\d)", " - " + pad(this.absEp, 3) + "(?!\\d)", "- " + pad(this.absEp, 2) + "(?!\\d)", "- " + pad(this.absEp, 3) + "(?!\\d)", " " + pad(this.absEp, 2) + " ", " " + pad(this.absEp, 3) + " ", " " + pad(this.absEp, 2) + "\\.", " " + pad(this.absEp, 3) + "\\.", "\\[" + pad(this.absEp, 2) + "\\]", "\\[" + pad(this.absEp, 3) + "\\]"];
    if (v279.some(function (v280) {
      return new RegExp(v280).test(v270);
    })) {
      return true;
    }
  }
  if (this._isFlatSeries()) {
    var v281 = [" - " + pad(this.episode, 3) + "(?!\\d)", " - " + pad(this.episode, 2) + "(?!\\d)", "- " + pad(this.episode, 3) + "(?!\\d)", "- " + pad(this.episode, 2) + "(?!\\d)", "\\" + pad(this.episode, 3) + "\\]", "\\[" + pad(this.episode, 2) + "\\]", " " + pad(this.episode, 3) + "\\.", " " + pad(this.episode, 2) + "\\.", " " + pad(this.episode, 3) + " ", " " + pad(this.episode, 2) + " "];
    if (v281.some(function (v282) {
      var v283 = v268;
      return new RegExp(v282).test(v270);
    })) {
      return true;
    }
  }
  return false;
};
AnimeZeyScraper.prototype._normalizeFn = function (v284) {
  var v285 = {
    dh117: 491
  };
  var v286 = v2;
  var v287 = removeAccents((v284 || "").toLowerCase());
  v287 = v287.replace(/[.\-_+,:]/g, " ");
  v287 = v287.replace(/[[\](){}]/g, " ");
  return v287.replace(/\s+/g, " ").trim();
};
AnimeZeyScraper.prototype._titleMatch = function (v288, v289) {
  var v290 = {
    dh118: 497,
    dh119: 368,
    dh120: 445,
    dh121: 479
  };
  var v291 = v2;
  var v292 = this._normalizeFn(v288);
  var v293 = this._normalizeFn(v289);
  if (!v292) {
    return false;
  }
  var v294 = /s\d{2}e\d{2}|\d+x\d{2}/.test(v293);
  var v295 = new RegExp("(?<![a-z0-9])" + escapeRegExp(v292) + "(?=[^a-z0-9]|$)", "g");
  var v296;
  while ((v296 = v295.exec(v293)) !== null) {
    var v297 = v293.slice(v296.index + v292.length).trim();
    var v298 = !v297 || TITLE_END_RE.test(v297) || /^[\-\u2013\u2014]?\s*\d/.test(v297);
    if (!v298 && v294) {
      var v299 = v297.match(/s\d{2}e\d{2}|\d+x\d{2}/);
      if (v299) {
        var v300 = v297.slice(0, v299.index);
        var v301 = v300.split(/\s+/).filter(Boolean).filter(function (v302) {
          var v303 = v291;
          return !NOISE_WORD_RE.test(v302);
        });
        v298 = v301.length === 0;
      }
    }
    if (!v298) {
      continue;
    }
    var v304 = v293.slice(0, v296.index).trim();
    if (!v304) {
      return true;
    }
    var v305 = v304.split(/\s+/).filter(Boolean).filter(function (v306) {
      return !NOISE_WORD_RE.test(v306) && !IGNORABLE_PREFIX_WORDS[v306];
    });
    if (!v305.length) {
      return true;
    }
  }
  return false;
};
AnimeZeyScraper.prototype._matchesSeriesInFilename = function (v307) {
  var v308 = {
    dh122: 446
  };
  var v309 = {
    dh123: 479
  };
  var v310 = v2;
  var v311 = this._getBaseNames().slice(0, 8);
  var v312 = normalizeForCompare(removeAccents(v307));
  var v313 = this;
  for (var v314 = 0; v314 < v311.length; v314++) {
    var v315 = v311[v314];
    var v316 = removeAccents(v315);
    var v317 = normalizeForCompare(v316);
    if (v316.includes(":")) {
      var v318 = v316.split(":").map(function (v319) {
        return v319.trim();
      });
      var v320 = v318.every(function (v321) {
        var v322 = v310;
        return v321.length <= 2 || v313._titleMatch(v321, v307) || v313._titleMatch(normalizeForCompare(v321), v312);
      });
      if (v320) {
        return true;
      }
    } else if (v313._titleMatch(v316, v307) || v313._titleMatch(v317, v312)) {
      return true;
    }
  }
  return false;
};
AnimeZeyScraper.prototype._getBaseNames = function () {
  var v323 = {
    dh124: 415,
    dh125: 510,
    dh126: 383
  };
  var v324 = {
    dh127: 506,
    dh128: 370
  };
  var v325 = {
    dh129: 506
  };
  var v326 = v2;
  var v327 = [];
  var v328 = this._isAnime() ? [this.romajiTitle, this.originalTitle, this.title] : [this.title, this.originalTitle, this.romajiTitle];
  v328.forEach(function (v329) {
    var v330 = v326;
    if (!v329) {
      return;
    }
    var v331 = v329.trim();
    if (v327.indexOf(v331) === -1) {
      v327.push(v331);
    }
    if (v331.includes(":")) {
      var v332 = v331.split(":")[0].trim();
      if (v327.indexOf(v332) === -1) {
        v327.push(v332);
      }
    }
  });
  if (!v327.length) {
    return [];
  }
  var v333 = [];
  v327.forEach(function (v334) {
    var v335 = v326;
    v333.push(v334);
    if (v334.includes("'")) {
      v333.push(v334.replace(/'/g, ""));
    }
    if (!v334.includes(":")) {
      var v336 = v334.toLowerCase();
      var v337 = ["the ", "a ", "an ", "o ", "os ", "as "];
      for (var v338 = 0; v338 < v337.length; v338++) {
        if (v336.startsWith(v337[v338])) {
          var v339 = v334.slice(v337[v338].length);
          if (v333.indexOf(v339) === -1) {
            v333.push(v339);
          }
          break;
        }
      }
    }
  });
  var v340 = {};
  return v333.filter(function (v341) {
    if (!v341 || v340[v341]) {
      return false;
    }
    v340[v341] = true;
    return true;
  });
};
AnimeZeyScraper.prototype._searchMovies = function () {
  var v342 = {
    dh130: 412,
    dh131: 394
  };
  return __async(this, null, function* () {
    var v343 = v1;
    var v344 = this;
    var v345 = {};
    var v346 = [];
    var v347 = this._generateMovieQueries().slice(0, 8);
    for (var v348 = 0; v348 < v347.length; v348++) {
      if (v346.length >= MAX_RESULTS_MOVIE) {
        break;
      }
      var v349 = yield v344._postSearch({
        q: v347[v348]
      });
      var v350 = v349 && v349.data && v349.data.files ? v349.data.files : [];
      for (var v351 = 0; v351 < v350.length; v351++) {
        if (v346.length >= MAX_RESULTS_MOVIE) {
          break;
        }
        var v352 = v350[v351];
        if (v345[v352.id]) {
          continue;
        }
        v345[v352.id] = true;
        if (v344._isVideoFile(v352) && v344._isCorrectMovie(v352.name || "")) {
          v346.push(v352);
        }
      }
    }
    return yield v344._processResults(v346);
  });
};
AnimeZeyScraper.prototype._generateMovieQueries = function () {
  var v353 = {
    dh132: 360,
    dh133: 415,
    dh134: 383
  };
  var v354 = {
    dh135: 491,
    dh136: 506,
    dh137: 424,
    dh138: 506
  };
  var v355 = v2;
  var v356 = [];
  var v357 = this._getBaseNames().slice(0, 5);
  var v358 = this;
  v357.forEach(function (v359) {
    var v360 = v355;
    var v361 = removeAccents(v359.replace(/['".:]/g, ""));
    v361 = v361.replace(/\s*-\s*/g, " ").trim();
    var v362 = v361.replace(/ /g, ".");
    if (v358.year) {
      v356.push(v362 + "." + v358.year);
      v356.push(v361 + " " + v358.year);
    }
    v356.push(v362);
    v356.push(v361);
  });
  if (this.originalTitle) {
    var v363 = this.originalTitle.replace(/['".\-]/g, "").trim();
    if (this.year) {
      v356.push(v363 + " " + this.year);
    }
    v356.push(v363);
  }
  var v364 = {};
  return v356.filter(function (v365) {
    if (!v365 || v364[v365]) {
      return false;
    }
    v364[v365] = true;
    return true;
  });
};
AnimeZeyScraper.prototype._isCorrectMovie = function (v366) {
  var v367 = {
    dh139: 487,
    dh140: 424
  };
  var v368 = v2;
  var v369 = this._getBaseNames();
  var v370 = v366.toLowerCase();
  var v371 = normalizeForCompare(removeAccents(v370));
  var v372 = this;
  for (var v373 = 0; v373 < v369.length; v373++) {
    var v374 = v369[v373];
    var v375 = removeAccents(v374);
    var v376 = normalizeForCompare(v375);
    var v377 = v372._titleMatch(v375, v370) || v372._titleMatch(v376, v371);
    if (v377) {
      if (v372.year) {
        return v370.includes(String(v372.year));
      } else {
        return true;
      }
    }
  }
  return false;
};
AnimeZeyScraper.prototype._isVideoFile = function (v378) {
  var v379 = {
    dh141: 511
  };
  var v380 = v2;
  var v381 = (v378.name || "").toLowerCase();
  var v382 = v378.mimeType || "";
  return v382.includes("video") || /\.(mp4|mkv|avi|mov|wmv|flv|webm)$/.test(v381);
};
AnimeZeyScraper.prototype._processResults = function (v383) {
  var v384 = {
    dh142: 354,
    dh143: 479,
    dh144: 470,
    dh145: 472,
    dh146: 351,
    dh147: 490
  };
  var v385 = {
    dh148: 464,
    dh149: 380
  };
  return __async(this, null, function* () {
    var v386 = v1;
    var v387 = this;
    var v388 = [];
    var v389 = {};
    var v390 = v387.mediaType === "tvshow" ? "S" + pad(v387.season, 2) + "E" + pad(v387.episode, 2) : "";
    for (var v391 = 0; v391 < v383.length; v391++) {
      var v392 = v383[v391];
      var v393 = yield v387._extractPlayerUrl(v392);
      if (!v393 || v389[v393]) {
        continue;
      }
      v389[v393] = true;
      var v394 = formatSize(v392.size || 0);
      var v395 = makeStream(v392.name || "AnimeZeY Stream", v393, v394, v387.sessionUA, v390, v387.title, v387.year, v387._isAnime(), v387.sortBy, v392.size, v387._getCurrentDomain());
      v388.push(v395);
    }
    v388.sort(function (v396, v397) {
      var v398 = v386;
      if (v387.sortBy === "size") {
        return v397.sizeInMB - v396.sizeInMB;
      } else {
        if (v397.qualityRank !== v396.qualityRank) {
          return v397.qualityRank - v396.qualityRank;
        }
        return v397.sizeInMB - v396.sizeInMB;
      }
    });
    return v388.map(function (v399) {
      var v400 = v386;
      return v399.data;
    });
  });
};
AnimeZeyScraper.prototype._extractPlayerUrl = function (v401) {
  var v402 = {
    dh150: 457,
    dh151: 479,
    dh152: 351,
    dh153: 469,
    dh154: 446,
    dh155: 349,
    dh156: 435,
    dh157: 435,
    dh158: 502,
    dh159: 459,
    dh160: 516,
    dh161: 409
  };
  return __async(this, null, function* () {
    var v403 = v1;
    var v404 = v401.link || "";
    if (!v404) {
      return null;
    }
    if (v404.includes("/download.aspx")) {
      return this._buildDownloadLink(v404);
    }
    var v405 = this.baseDomains.length;
    for (var v406 = 0; v406 < v405; v406++) {
      var v407 = this._getCurrentDomain();
      var v408 = "https://" + v407 + v404;
      if (!v408.includes("a=view")) {
        v408 += v408.includes("?") ? "&a=view" : "?a=view";
      }
      try {
        var v409 = yield fetchPlain(v408, {
          headers: {
            "User-Agent": this.sessionUA,
            Accept: "text/html,application/xhtml+xml",
            "Accept-Language": "en-US,en;q=0.9",
            Referer: "https://" + v407 + "/"
          }
        });
        if (v409.status === 429 || v409.status >= 500) {
          console.warn("[" + PROVIDER_NAME + "] Extract Player URL rate-limited (" + v409.status + ") on " + v407 + ". Rotating worker...");
          this._rotateWorkerDomain();
          continue;
        }
        if (!v409.ok) {
          this._rotateWorkerDomain();
          continue;
        }
        var v410 = yield v409.text();
        var v411 = v410.match(/<source[^>]+src=["']([^"']+)["']/i);
        if (v411) {
          return v411[1];
        }
        break;
      } catch (v412) {
        this._rotateWorkerDomain();
      }
    }
    return this._buildDownloadLink(v404);
  });
};
AnimeZeyScraper.prototype._buildDownloadLink = function (v413) {
  var v414 = {
    dh162: 370,
    dh163: 360,
    dh164: 364,
    dh165: 405
  };
  var v415 = {
    dh166: 392
  };
  var v416 = v2;
  if (!v413 || v413.charAt(0) !== "/") {
    return null;
  }
  try {
    var v417 = v413.indexOf("?");
    var v418 = v417 === -1 ? v413 : v413.slice(0, v417);
    var v419 = v417 === -1 ? "" : v413.slice(v417 + 1);
    var v420 = new URLSearchParams(v419);
    var v421 = v420.get("file");
    if (!v421) {
      return null;
    }
    var v422 = new URLSearchParams({
      file: v421
    });
    ["expiry", "mac"].forEach(function (v423) {
      var v424 = v416;
      var v425 = v420.get(v423);
      if (v425) {
        v422.set(v423, v425);
      }
    });
    return "https://" + this.downloadDomain + v418 + "?" + v422.toString();
  } catch (v426) {
    return null;
  }
};
function getStreams(v427, v428, v429, v430, v431) {
  var v432 = {
    dh167: 474,
    dh168: 350,
    dh169: 479,
    dh170: 376,
    dh171: 472,
    dh172: 360,
    dh173: 352
  };
  return __async(this, null, function* () {
    var v433 = v1;
    try {
      var v434 = resolveSettings(v431);
      var v435 = MOBILE_UAS[Math.floor(Math.random() * MOBILE_UAS.length)];
      var v436 = v428 === "movie";
      var v437 = v428 === "tv" || v428 === "series" || v428 === "tvshow";
      if (!v436 && !v437) {
        return [];
      }
      var v438 = yield fetchTmdbDetails(v427, v436 ? "movie" : "tv", v435);
      if (!v438) {
        return [];
      }
      var v439 = v436 ? v438.title : v438.name;
      var v440 = v436 ? v438.original_title : v438.original_name;
      var v441 = v438.release_date || v438.first_air_date || "";
      var v442 = v441 ? parseInt(v441.slice(0, 4), 10) : null;
      var v443 = {
        tmdb_id: v427,
        title: v439,
        original_title: v440,
        romaji_title: "",
        media_type: v436 ? "movie" : "tvshow",
        year: v442,
        season: v429,
        episode: v430,
        absolute_episode: !v436 && v438.seasons ? computeAbsoluteEpisode(v438.seasons, v429, v430) : null
      };
      var v444 = new AnimeZeyScraper(WORKER_DOMAINS, v443, v435, v434.sortBy);
      return yield v444.scrape();
    } catch (v445) {
      return [];
    }
  });
}
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    getStreams: getStreams,
    onSettings: onSettings
  };
} else {
  global.getStreams = getStreams;
  global.onSettings = onSettings;
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
  var PROVIDER = "animezey";
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