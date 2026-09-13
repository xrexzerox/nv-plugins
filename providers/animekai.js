/*
 * nv-plugins animekai.js — FULLY DECODED port of the All-in-One-Nuvio provider (4.24.0 merge pass).
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
  return new Promise((v6, v7) => {
    const v8 = {
      dh1: 413
    };
    const v9 = v1;
    var v10 = v11 => {
      try {
        v12(v5.next(v11));
      } catch (v13) {
        v7(v13);
      }
    };
    var v14 = v15 => {
      const v16 = v1;
      try {
        v12(v5.throw(v15));
      } catch (v17) {
        v7(v17);
      }
    };
    var v12 = v18 => v18.done ? v6(v18.value) : Promise.resolve(v18.value).then(v10, v14);
    v12((v5 = v5.apply(v3, v4)).next());
  });
};
var TMDB_API_KEY = "1865f43a0549ca50d341dd9ab8b29f49";
var TMDB_BASE = "https://api.themoviedb.org/3";
var ANIKAI_BASE = "https://www3.anikai.cc";
var UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36";
function getResolutionEmoji(v19) {
  const v20 = {
    dh2: 423,
    dh3: 440,
    dh4: 385,
    dh5: 378,
    dh6: 397,
    dh7: 418,
    dh8: 447
  };
  const v21 = v2;
  const v22 = String(v19 || "").toLowerCase();
  if (v22.includes("2160") || v22.includes("4k") || v22.includes("uhd")) {
    return "🌟 4K";
  }
  if (v22.includes("1080") || v22.includes("fhd")) {
    return "🔥 1080p";
  }
  if (v22.includes("720") || v22.includes("hd")) {
    return "💎 720p";
  }
  if (v22.includes("480") || v22.includes("sd")) {
    return "📱 480p";
  }
  return "📺 " + (v19 || "1080p");
}
function qualityRank(v23) {
  const v24 = {
    dh9: 381
  };
  const v25 = v2;
  if (/2160p|4k/i.test(v23)) {
    return 4;
  }
  if (/1080p/i.test(v23)) {
    return 3;
  }
  if (/720p/i.test(v23)) {
    return 2;
  }
  if (/480p/i.test(v23)) {
    return 1;
  }
  return 0;
}
function getInvertedSortTag(v26, v27 = 999999) {
  const v28 = v2;
  const v29 = Math.max(0, parseInt(v26, 10) || 0);
  const v30 = Math.max(0, v27 - v29);
  const v31 = v30.toString(2).padStart(20, "0");
  return v31.split("").map(v32 => v32 === "1" ? "﻿" : "​").join("");
}
function getSimilarity(v33, v34) {
  const v35 = {
    dh10: 449
  };
  const v36 = {
    dh11: 412
  };
  const v37 = v2;
  if (!v33 || !v34) {
    return 0;
  }
  const v38 = v33.toLowerCase().replace(/[^a-z0-9]/g, "");
  const v39 = v34.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (v38 === v39) {
    return 1;
  }
  if (v38.length < 2 || v39.length < 2) {
    return 0;
  }
  const v40 = v41 => {
    const v42 = v37;
    const v43 = new Set();
    for (let v44 = 0; v44 < v41.length - 1; v44++) {
      v43.add(v41.substring(v44, v44 + 2));
    }
    return v43;
  };
  const v45 = v40(v38);
  const v46 = v40(v39);
  let v47 = 0;
  for (const v48 of v45) {
    if (v46.has(v48)) {
      v47++;
    }
  }
  return v47 * 2 / (v45.size + v46.size);
}
function toRoman(v49) {
  const v50 = [[10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"]];
  let v51 = "";
  for (const [v52, v53] of v50) {
    while (v49 >= v52) {
      v51 += v53;
      v49 -= v52;
    }
  }
  return v51;
}
function isMovieOrSpecial(v54, v55) {
  const v56 = {
    dh12: 440,
    dh13: 439,
    dh14: 371,
    dh15: 438,
    dh16: 399
  };
  const v57 = v2;
  const v58 = v54.toLowerCase();
  if (v58.includes("movie") || v58.includes("film") || v58.includes("compilation") || v58.includes("special") || v58.includes("ova") || v58.includes("ona") || v58.includes("recap") || v58.includes("summary") || v58.includes("mini") || v58.includes("reigen") || v58.includes("spinoff") || v58.includes("side-story") || v58.includes("-sp-") || v58.endsWith("-sp") || v58.endsWith("-ova") || v58.endsWith("-ona") || v58.endsWith("-special") || v58.endsWith("-movie") || v58.endsWith("-film")) {
    return true;
  }
  if (v55 && (v55 === "movie" || v55 === "ova" || v55 === "music" || v55 === "tvshort")) {
    return true;
  }
  return false;
}
function imdbToTmdb(v59) {
  const v60 = {
    dh17: 468,
    dh18: 427
  };
  return __async(this, null, function* () {
    const v61 = v1;
    try {
      const v62 = TMDB_BASE + "/find/" + v59 + "?api_key=" + TMDB_API_KEY + "&external_source=imdb_id";
      const v63 = yield __nvFetch(v62, {
        headers: {
          "User-Agent": UA
        }
      });
      if (!v63.ok) {
        return null;
      }
      const v64 = yield v63.json();
      if (v64.tv_results && v64.tv_results.length > 0) {
        return v64.tv_results[0];
      }
      if (v64.movie_results && v64.movie_results.length > 0) {
        return v64.movie_results[0];
      }
      return null;
    } catch (v65) {
      return null;
    }
  });
}
function getTmdbMeta(v66, v67) {
  const v68 = {
    dh19: 455
  };
  return __async(this, null, function* () {
    const v69 = v1;
    try {
      const v70 = v67 === "movie" ? TMDB_BASE + "/movie/" + v66 + "?api_key=" + TMDB_API_KEY : TMDB_BASE + "/tv/" + v66 + "?api_key=" + TMDB_API_KEY;
      const v71 = yield __nvFetch(v70, {
        headers: {
          "User-Agent": UA
        }
      });
      if (!v71.ok) {
        return null;
      }
      return yield v71.json();
    } catch (v72) {
      return null;
    }
  });
}
function getSeasonDetails(v73, v74) {
  const v75 = {
    dh20: 375
  };
  return __async(this, null, function* () {
    const v76 = v1;
    try {
      const v77 = TMDB_BASE + "/tv/" + v73 + "/season/" + v74 + "?api_key=" + TMDB_API_KEY;
      const v78 = yield __nvFetch(v77, {
        headers: {
          "User-Agent": UA
        }
      });
      if (!v78.ok) {
        return null;
      }
      return yield v78.json();
    } catch (v79) {
      return null;
    }
  });
} /*string-table removed*/
function searchAnikai(v80) {
  const v81 = {
    dh21: 452,
    dh22: 388,
    dh23: 449
  };
  return __async(this, null, function* () {
    const v82 = v1;
    try {
      const v83 = ANIKAI_BASE + "/browser?keyword=" + encodeURIComponent(v80);
      const v84 = yield __nvFetch(v83, {
        headers: {
          "User-Agent": UA
        }
      });
      if (!v84.ok) {
        return [];
      }
      const v85 = yield v84.text();
      const v86 = [];
      const v87 = v85.split("class=\"aitem\"");
      for (let v88 = 1; v88 < v87.length; v88++) {
        const v89 = v87[v88].substring(0, 2500);
        const v90 = v89.match(/href="([^"]*\/watch\/[^"]*)"/);
        if (!v90) {
          continue;
        }
        let v91 = v90[1];
        if (!v91.startsWith("http")) {
          v91 = ANIKAI_BASE + v91;
        }
        const v92 = v89.match(/class="title[^"]*"[^>]*>([^<]*)/);
        const v93 = v92 ? v92[1].trim() : "";
        const v94 = [...v89.matchAll(/<span>\s*<b>\s*([^<]+?)\s*<\/b>\s*<\/span>/g)];
        const v95 = v94.length > 0 ? v94[v94.length - 1][1].trim().toLowerCase() : "";
        v86.push({
          url: v91,
          title: v93,
          type: v95
        });
      }
      return v86;
    } catch (v96) {
      return [];
    }
  });
}
function getEpisodeCount(v97) {
  const v98 = {
    dh24: 388,
    dh25: 369,
    dh26: 386
  };
  return __async(this, null, function* () {
    const v99 = v1;
    try {
      const v100 = yield __nvFetch(v97 + "/ep-1", {
        headers: {
          "User-Agent": UA
        }
      });
      if (!v100.ok) {
        return 0;
      }
      const v101 = yield v100.text();
      const v102 = v97.split("/watch/")[1];
      const v103 = new RegExp("/watch/" + v102 + "/ep-(\\d+)", "g");
      let v104;
      let v105 = 0;
      while ((v104 = v103.exec(v101)) !== null) {
        const v106 = parseInt(v104[1]);
        if (v106 > v105) {
          v105 = v106;
        }
      }
      return v105;
    } catch (v107) {
      return 0;
    }
  });
}
function unpackPacked(v108) {
  const v109 = {
    dh27: 444,
    dh28: 461,
    dh29: 449,
    dh30: 449,
    dh31: 412
  };
  const v110 = v2;
  try {
    const v111 = v108.indexOf("eval(function(p,a,c,k,e,d)");
    if (v111 === -1) {
      return null;
    }
    const v112 = v108.indexOf("{", v111);
    let v113 = 1;
    let v114 = v112 + 1;
    while (v114 < v108.length && v113 > 0) {
      if (v108[v114] === "{") {
        v113++;
      } else if (v108[v114] === "}") {
        v113--;
      }
      v114++;
    }
    const v115 = v108.indexOf("(", v114 - 1);
    if (v115 === -1) {
      return null;
    }
    let v116 = 1;
    let v117 = v115 + 1;
    while (v117 < v108.length && v116 > 0) {
      if (v108[v117] === "(") {
        v116++;
      } else if (v108[v117] === ")") {
        v116--;
      }
      v117++;
    }
    const v118 = v108.substring(v115 + 1, v117 - 1).trim();
    const v119 = v118[0];
    let v120 = "";
    let v121 = 1;
    while (v121 < v118.length) {
      if (v118[v121] === v119) {
        let v122 = 0;
        let v123 = v121 - 1;
        while (v123 >= 0 && v118[v123] === "\\") {
          v122++;
          v123--;
        }
        if (v122 % 2 === 0) {
          break;
        }
      }
      v120 += v118[v121];
      v121++;
    }
    v120 = v120.replace(new RegExp("\\\\" + v119, "g"), v119).replace(/\\\\/g, "\\");
    const v124 = v118.substring(v121 + 1).trim();
    const v125 = v124.match(/^,?\s*(\d+)\s*,\s*(\d+)/);
    if (!v125) {
      return null;
    }
    const v126 = parseInt(v125[1]);
    const v127 = parseInt(v125[2]);
    const v128 = v124.match(/['"]([^'"]*\|[^'"]*)['"]/);
    if (!v128) {
      return null;
    }
    const v129 = v128[1].split("|");
    const v130 = "0123456789abcdefghijklmnopqrstuvwxyz";
    let v131 = v120;
    for (let v132 = v127 - 1; v132 >= 0; v132--) {
      if (v132 < v129.length && v129[v132]) {
        let v133 = "";
        if (v132 === 0) {
          v133 = "0";
        } else {
          let v134 = v132;
          while (v134 > 0) {
            v133 = v130[v134 % v126] + v133;
            v134 = Math.floor(v134 / v126);
          }
        }
        v131 = v131.replace(new RegExp("\\b" + v133 + "\\b", "g"), v129[v132]);
      }
    }
    return v131;
  } catch (v135) {
    return null;
  }
} /*decoder removed*/
function extractFromEmbed(v136) {
  const v137 = {
    dh32: 389,
    dh33: 440,
    dh34: 397,
    dh35: 392,
    dh36: 402,
    dh37: 386
  };
  return __async(this, null, function* () {
    const v138 = v1;
    try {
      const v139 = yield __nvFetch(v136, {
        headers: {
          "User-Agent": UA,
          Referer: ANIKAI_BASE + "/"
        }
      });
      if (!v139.ok) {
        return [];
      }
      const v140 = yield v139.text();
      const v141 = [];
      const v142 = /(https?:\/\/[^\s"'\\]+\.m3u8[^\s"'\\]*)/g;
      let v143;
      while ((v143 = v142.exec(v140)) !== null) {
        let v144 = "1080p";
        if (v143[1].includes("2160") || v143[1].includes("4k")) {
          v144 = "2160p";
        } else if (v143[1].includes("1080")) {
          v144 = "1080p";
        } else if (v143[1].includes("720")) {
          v144 = "720p";
        } else if (v143[1].includes("480")) {
          v144 = "480p";
        } else if (v143[1].includes("360")) {
          v144 = "360p";
        }
        v141.push({
          url: v143[1],
          quality: v144,
          headers: {
            Referer: v136,
            "User-Agent": UA
          }
        });
      }
      if (v141.length === 0 && v140.includes("eval(function(p,a,c,k,e,d)")) {
        const v145 = unpackPacked(v140);
        if (v145) {
          while ((v143 = v142.exec(v145)) !== null) {
            v141.push({
              url: v143[1],
              quality: "1080p",
              headers: {
                Referer: v136,
                "User-Agent": UA
              }
            });
          }
        }
      }
      return v141;
    } catch (v146) {
      return [];
    }
  });
}
function getStreamsFromWatchPage(v147) {
  const v148 = {
    dh38: 404,
    dh39: 430,
    dh40: 386,
    dh41: 400,
    dh42: 460,
    dh43: 387,
    dh44: 367,
    dh45: 406
  };
  return __async(this, arguments, function* (v149, v150 = {}) {
    const v151 = {
      dh46: 447,
      dh47: 429,
      dh48: 410,
      dh49: 424,
      dh50: 419,
      dh51: 422,
      dh52: 443
    };
    const v152 = v1;
    try {
      const v153 = yield __nvFetch(v149, {
        headers: {
          "User-Agent": UA
        }
      });
      if (!v153.ok) {
        return [];
      }
      const v154 = yield v153.text();
      const v155 = [];
      const v156 = new Set();
      const v157 = /class="server-items[^"]*"[^>]*data-id="([^"]*)"[\s\S]*?<\/div>/g;
      let v158;
      while ((v158 = v157.exec(v154)) !== null) {
        const v159 = v158[1];
        if (!["hsub", "sub", "dub"].includes(v159)) {
          continue;
        }
        const v160 = v159 === "dub";
        const v161 = v160 ? "English [DUB]" : "Japanese [SUB]";
        const v162 = v160 ? "English 🇺🇸 - [DUB]" : "Japanese 🇯🇵 - [SUB]";
        const v163 = /data-video="([^"]*)"/g;
        let v164;
        let v165 = 0;
        while ((v164 = v163.exec(v158[0])) !== null) {
          const v166 = v164[1];
          v165++;
          const v167 = v160 ? "🗂️ Server " + v165 + " • 🔉 English Dubbed" : "🗂️ Server " + v165 + " • 📑 English Subtitles";
          const v168 = yield extractFromEmbed(v166);
          for (const v169 of v168) {
            if (v156.has(v169.url)) {
              continue;
            }
            v156.add(v169.url);
            v155.push({
              url: v169.url,
              quality: v169.quality,
              audioHeaderTag: v161,
              audioSubLine: v162,
              serverSubLine: v167,
              headers: v169.headers
            });
          }
        }
      }
      return v155.map((v170, v171) => {
        const v172 = v152;
        const v173 = v170.quality || "1080p";
        const v174 = getResolutionEmoji(v173);
        const v175 = qualityRank(v173);
        const v176 = getInvertedSortTag(v175 * 100000 + (100 - v171), 999999);
        const v177 = v176 + "AnimeKai • " + v173 + " • " + v170.audioHeaderTag;
        const v178 = "📺 " + v150.title + (v150.year ? " - (" + v150.year + ")" : "");
        let v179 = null;
        if (v150.type === "tv") {
          v179 = "📋 S" + v150.season + " E" + v150.episode + (v150.episodeTitle ? " - " + v150.episodeTitle : "");
        }
        const v180 = v174 + " | 🗣️ " + v170.audioSubLine;
        const v181 = "🔗 AniKai | ⌛ " + (v150.duration || "24m") + " | ⚡ H.264";
        const v182 = v170.serverSubLine;
        const v183 = [v178, v179, v180, v181, v182].filter(Boolean).join("\n");
        return {
          name: v177,
          title: v183,
          size: v183,
          description: v183,
          url: v170.url,
          behaviorHints: {
            notWebReady: true,
            proxyHeaders: {
              request: v170.headers
            }
          }
        };
      });
    } catch (v184) {
      return [];
    }
  });
}
function findBestAnikaiEntry(v185, v186, v187) {
  const v188 = {
    dh53: 449,
    dh54: 423,
    dh55: 391,
    dh56: 451
  };
  const v189 = {
    dh57: 387,
    dh58: 388,
    dh59: 423,
    dh60: 433
  };
  return __async(this, null, function* () {
    const v190 = v1;
    if (!v185 || v185.length === 0) {
      return null;
    }
    if (v187 === 0) {
      const v191 = v185.filter(v192 => isMovieOrSpecial(v192.url, v192.type));
      if (v191.length > 0) {
        let v193 = null;
        let v194 = -1;
        for (const v195 of v191) {
          const v196 = getSimilarity(v195.title, v186);
          if (v196 > v194) {
            v194 = v196;
            v193 = v195;
          }
        }
        return v193 || v191[0];
      }
      return v185[0];
    }
    const v197 = v185.filter(v198 => !isMovieOrSpecial(v198.url, v198.type));
    if (v197.length === 0) {
      return v185[0];
    }
    const v199 = (v186 || "").toLowerCase().trim();
    if (!v187 || v187 === 1) {
      const v200 = v197.find(v201 => (v201.title || "").toLowerCase().trim() === v199);
      if (v200) {
        return v200;
      }
      const v202 = v197.find(v203 => {
        const v204 = v190;
        const v205 = v203.url.split("/watch/")[1] || "";
        return !v205.match(/-(ii|iii|iv|v|vi|vii|viii|ix|x)$/i);
      });
      if (v202) {
        return v202;
      }
    }
    if (v187 && v187 > 1) {
      const v206 = toRoman(v187).toLowerCase();
      const v207 = v197.find(v208 => {
        const v209 = v190;
        const v210 = v208.url.split("/watch/")[1] || "";
        return v210.toLowerCase().endsWith("-" + v206) || v210.toLowerCase().includes("-" + v206 + "-") || v210.toLowerCase().includes("season-" + v187) || v210.toLowerCase().includes("s" + v187);
      });
      if (v207) {
        return v207;
      }
    }
    let v211 = null;
    let v212 = 0;
    for (const v213 of v197) {
      const v214 = getSimilarity(v213.title, v186);
      if (v214 > v212) {
        v212 = v214;
        v211 = v213;
      }
    }
    return v211 || v197[0];
  });
}
function getStreams(v215, v216 = "tv", v217 = null, v218 = null) {
  const v219 = {
    dh61: 451,
    dh62: 384,
    dh63: 398,
    dh64: 407,
    dh65: 426,
    dh66: 373,
    dh67: 391,
    dh68: 445,
    dh69: 393,
    dh70: 367,
    dh71: 387,
    dh72: 434
  };
  return __async(this, null, function* () {
    const v220 = v1;
    try {
      let v221 = v215;
      if (typeof v215 === "string" && v215.startsWith("tt")) {
        const v222 = yield imdbToTmdb(v215);
        if (v222) {
          v221 = v222.id;
        } else {
          return [];
        }
      }
      const v223 = yield getTmdbMeta(v221, v216);
      if (!v223) {
        return [];
      }
      const v224 = v223.name || v223.title || "Unknown";
      const v225 = (v223.first_air_date || v223.release_date || "").slice(0, 4);
      let v226 = "";
      let v227 = "24m";
      if (v216 === "movie") {
        v227 = v223.runtime ? v223.runtime + "m" : "N/A";
        const v228 = {
          title: v224,
          year: v225,
          type: v216,
          duration: v227
        };
        const v229 = yield searchAnikai(v224);
        if (v229.length === 0) {
          return [];
        }
        const v230 = v229.find(v231 => isMovieOrSpecial(v231.url, v231.type));
        const v232 = v230 || v229[0];
        return yield getStreamsFromWatchPage(v232.url + "/ep-1", v228);
      }
      const v233 = v217 === null || v217 === undefined ? 1 : v217;
      const v234 = v218 || 1;
      const v235 = yield getSeasonDetails(v221, v233);
      if (v235 && v235.episodes) {
        const v236 = v235.episodes.find(v237 => v237.episode_number === v234);
        if (v236) {
          v226 = v236.name || "";
          if (v236.runtime) {
            v227 = v236.runtime + "m";
          }
        }
      }
      if (v227 === "24m" && v223.episode_run_time && v223.episode_run_time.length > 0) {
        v227 = v223.episode_run_time[0] + "m";
      }
      const v238 = {
        title: v224,
        year: v225,
        type: v216,
        season: v233,
        episode: v234,
        episodeTitle: v226,
        duration: v227
      };
      const v239 = v223.seasons || [];
      const v240 = v239.find(v241 => v241.season_number === v233);
      const v242 = v240 ? v240.episode_count : 0;
      const v243 = yield searchAnikai(v224);
      if (v243.length === 0) {
        const v244 = yield searchAnikai(v223.original_name || v224);
        if (v244.length === 0) {
          return [];
        }
        v243.push(...v244);
      }
      const v245 = yield findBestAnikaiEntry(v243, v224, v233);
      if (!v245) {
        return [];
      }
      const v246 = yield getEpisodeCount(v245.url);
      let v247;
      if (v246 > v242 && v233 > 1) {
        let v248 = v234;
        for (const v249 of v239) {
          if (v249.season_number < v233 && v249.season_number > 0) {
            v248 += v249.episode_count;
          }
        }
        v247 = v248;
      } else {
        v247 = v234;
      }
      return yield getStreamsFromWatchPage(v245.url + "/ep-" + v247, v238);
    } catch (v250) {
      console.error("[AniKai] getStreams error:", v250.message);
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
  var PROVIDER = "animekai";
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
        }, 2000);
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
        var s = row.s;
        var tq = normQ(s.quality) || normQ(String(s.title || "").split("\n")[0]) || qFromText((s.name || "") + " " + (s.title || ""));
        // nv best-settings 4.26.0: FAIL-OPEN quality gate (AIO parity)
        // - a successful HLS probe result wins
        // - otherwise the title-derived quality is kept, else "Auto"
        // - unknown-resolution rows are NO LONGER dropped; only rows whose
        //   title explicitly tags CAM/telesync/sub-720p are removed
        var q = qs[k] || tq || "Auto";
        if (q === "CAM") return; // explicit cam / sd / sub-720 tag -> removed
        s.quality = q;
        ranked.push({ s: s, i: row.i, q: q });
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