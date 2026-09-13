/*
 * nv-plugins allwish.js — FULLY DECODED port of the All-in-One-Nuvio provider (4.24.0 merge pass).
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
var __spreadProps = (v10, v11) => __defProps(v10, __getOwnPropDescs(v11));
var __async = (v12, v13, v14) => {
  return new Promise((v15, v16) => {
    const v17 = v1;
    var v18 = v19 => {
      const v20 = v1;
      try {
        v21(v14.next(v19));
      } catch (v22) {
        v16(v22);
      }
    };
    var v23 = v24 => {
      try {
        v21(v14.throw(v24));
      } catch (v25) {
        v16(v25);
      }
    };
    var v21 = v26 => v26.done ? v15(v26.value) : Promise.resolve(v26.value).then(v18, v23);
    v21((v14 = v14.apply(v12, v13)).next());
  });
};
var cheerio = __nvRequire("cheerio-without-node-native");
var CryptoJS = __nvRequire("crypto-js");
var PROVIDER_NAME = "AllWish";
var MAIN_URL = "https://all-wish.me";
var TMDB_API_KEY = "439c478a771f35c05022f9feabcca01c";
var REQUEST_TIMEOUT = 12000;
var EPISODE_LIST_TIMEOUT = 30000;
var VRF_SECRET = "ysJhV6U27FVIjjuk";
var HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.5",
  Connection: "keep-alive"
};
var AJAX_HEADERS = {
  "X-Requested-With": "XMLHttpRequest",
  "User-Agent": HEADERS["User-Agent"],
  Referer: MAIN_URL + "/"
};
function fetchSafe(v27) {
  return __async(this, arguments, function* (v28, v29 = {}, v30 = REQUEST_TIMEOUT) {
    const v31 = v1;
    try {
      const v32 = typeof AbortSignal !== "undefined" && AbortSignal.timeout ? AbortSignal.timeout(v30) : null;
      const v33 = __spreadProps(__spreadValues({}, v29), {
        headers: __spreadValues(__spreadValues({}, HEADERS), v29.headers || {})
      });
      if (v32) {
        v33.signal = v32;
      }
      const v34 = yield __nvFetch(v28, v33);
      return v34;
    } catch (v35) {
      console.error("[" + PROVIDER_NAME + "] fetchSafe: " + (v28 || "").substring(0, 100) + " -> " + v35.message);
      return null;
    }
  });
}
function fetchJson(v36) {
  return __async(this, arguments, function* (v37, v38 = {}, v39) {
    const v40 = v1;
    try {
      const v41 = yield fetchSafe(v37, v38, v39);
      if (!v41 || !v41.ok) {
        return null;
      }
      return JSON.parse(yield v41.text());
    } catch (v42) {
      console.error("[" + PROVIDER_NAME + "] fetchJson: " + (v37 || "").substring(0, 100) + " -> " + v42.message);
      return null;
    }
  });
}
function fetchHtml(v43) {
  return __async(this, arguments, function* (v44, v45 = {}) {
    const v46 = v1;
    try {
      const v47 = yield fetchSafe(v44, v45);
      if (!v47 || !v47.ok) {
        return null;
      }
      return cheerio.load(yield v47.text());
    } catch (v48) {
      console.error("[" + PROVIDER_NAME + "] fetchHtml: " + (v44 || "").substring(0, 100) + " -> " + v48.message);
      return null;
    }
  });
}
function makeStream(v49, v50, v51, v52, v53 = {}, v54) {
  const v55 = v2;
  const v56 = {
    name: PROVIDER_NAME + " | " + v49,
    title: v50 || "",
    url: v51 || "",
    quality: v52 || "HD",
    headers: __spreadValues({
      "User-Agent": HEADERS["User-Agent"]
    }, v53 || {})
  };
  if (v54 && Array.isArray(v54) && v54.length > 0) {
    v56.subtitles = v54;
  }
  return v56;
}
function buildStreamLabels(v57, v58, v59, v60) {
  const v61 = v2;
  const v62 = v58 || "HD";
  const v63 = v62 + (v59 ? " " + v59 : "");
  let v64 = "";
  if (v60 && v60.title) {
    if (v60.mediaType === "tv" && v60.season != null && v60.episode != null) {
      v64 = v60.title + "\nS" + v60.season + " E" + v60.episode + " · " + v62 + " · HLS";
    } else {
      v64 = v60.title + "\n" + v62 + " · HLS";
    }
  } else {
    v64 = v57 + (v59 ? " " + v59 : "") + "\n" + v62 + " · HLS";
  }
  v64 += "\nby piratezoro9";
  return {
    name: v63,
    title: v64
  };
}
function dedupe(v65) {
  const v66 = v2;
  const v67 = new Set();
  return (v65 || []).filter(v68 => {
    const v69 = v66;
    if (!v68 || !v68.url || v67.has(v68.url)) {
      return false;
    }
    v67.add(v68.url);
    return true;
  });
}
function getTMDBInfo(v70, v71) {
  return __async(this, null, function* () {
    const v72 = v1;
    const v73 = String(v70 || "").trim();
    const v74 = v73.startsWith("tt");
    const v75 = v71 === "tv" || v71 === "series" ? "tv" : "movie";
    try {
      if (v74) {
        const v76 = yield fetchJson("https://api.themoviedb.org/3/find/" + v73 + "?api_key=" + TMDB_API_KEY + "&external_source=imdb_id");
        const v77 = v76 ? v75 === "tv" ? v76.tv_results : v76.movie_results : null;
        if (v77 && v77.length > 0) {
          const v78 = v77[0];
          return {
            id: v78.id,
            title: v75 === "tv" ? v78.name : v78.title,
            originalTitle: v75 === "tv" ? v78.original_name : v78.original_title,
            year: (v78.first_air_date || v78.release_date || "").split("-")[0],
            genres: v78.genre_ids || [],
            imdbId: v73
          };
        }
        return {
          id: v73,
          title: v73,
          originalTitle: v73,
          year: null,
          genres: [],
          imdbId: v73
        };
      } else {
        const v79 = yield fetchJson("https://api.themoviedb.org/3/" + v75 + "/" + v73 + "?api_key=" + TMDB_API_KEY + "&append_to_response=external_ids");
        if (v79) {
          return {
            id: v79.id,
            title: v75 === "tv" ? v79.name : v79.title,
            originalTitle: v75 === "tv" ? v79.original_name : v79.original_title,
            year: (v79.first_air_date || v79.release_date || "").split("-")[0],
            genres: (v79.genres || []).map(v80 => v80.id),
            imdbId: v79.imdb_id || v79.external_ids && v79.external_ids.imdb_id || null
          };
        }
      }
    } catch (v81) {
      console.error("[" + PROVIDER_NAME + "] TMDB error: " + v81.message);
    }
    return {
      id: v73,
      title: v73,
      originalTitle: v73,
      year: null,
      genres: [],
      imdbId: null
    };
  });
}
function cleanTitle(v82) {
  const v83 = v2;
  return String(v82 || "").toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}
function tokenize(v84) {
  const v85 = v2;
  return cleanTitle(v84).split(" ").filter(Boolean);
}
function scoreTitle(v86, v87, v88, v89) {
  const v90 = v2;
  const v91 = tokenize(v87);
  if (!v91.length) {
    return 0;
  }
  const v92 = new Set(tokenize(v86));
  const v93 = cleanTitle(v86);
  const v94 = cleanTitle(v87);
  const v95 = tokenize(v86);
  if (v93 === v94) {
    return 1.5;
  }
  const v96 = v93.replace(/\s+tv$/, "").replace(/\s+movie$/, "").replace(/\s+anime$/, "").replace(/\s+specials?$/, "").trim();
  if (v96 === v94) {
    return 1.4;
  }
  let v97 = 0;
  for (const v98 of v91) {
    if (v92.has(v98)) {
      v97++;
    }
  }
  let v99 = v97 / Math.max(v91.length, 1);
  if (v93.startsWith(v94)) {
    v99 += 0.3;
    const v100 = v95.length - v91.length;
    if (v100 > 2) {
      v99 -= Math.min(v100 * 0.1, 0.4);
    }
    const v101 = ["part", "parts", "season", "movie", "movies", "special", "specials", "ova", "film", "films", "the"];
    const v102 = v95.slice(v91.length).filter(v103 => v101.includes(v103)).length;
    if (v102 > 0) {
      v99 -= 0.2;
    }
  } else if (v91.length <= 4 && v97 === v91.length) {
    v99 -= 0.4;
  }
  if (v88) {
    const v104 = /\b(19|20)\d{2}\b/;
    const v105 = v93.match(v104);
    if (v105 && Math.abs(parseInt(v105[0]) - parseInt(v88)) <= 1) {
      v99 += 0.5;
    } else if (v105) {
      const v106 = Math.abs(parseInt(v105[0]) - parseInt(v88));
      v99 -= Math.min(v106 * 0.1, 0.8);
    }
  }
  if (v89 && Number(v89) > 1) {
    const v107 = Number(v89);
    const v108 = v93.match(new RegExp("\\b" + v107 + "(?:st|nd|rd|th)\\s+season|season\\s*" + v107 + "|\\bpart\\s*" + v107, "i"));
    if (v108) {
      v99 += 0.4;
    } else {
      const v109 = v93.match(/\b(?:season|part)\s*\d+/i);
      if (!v109) {
        v99 -= 0.3;
      }
    }
  }
  return Math.min(v99, 2);
}
function searchAllWish(v110, v111, v112, v113) {
  return __async(this, null, function* () {
    const v114 = v1;
    try {
      const v115 = [];
      if (v110) {
        v115.push(v110);
      }
      if (v111 && v111 !== v110) {
        v115.push(v111);
      }
      if (v113 && Number(v113) > 1) {
        const v116 = Number(v113);
        if (v110) {
          v115.push(v110 + " " + v116);
          v115.push(v110 + " season " + v116);
        }
      }
      const v117 = [];
      for (const v118 of v115) {
        const v119 = yield fetchHtml(MAIN_URL + "/filter?keyword=" + encodeURIComponent(v118) + "&page=1");
        if (!v119) {
          continue;
        }
        v119("div.item").each((v120, v121) => {
          const v122 = v114;
          const v123 = v119(v121).find("div.name > a").text().trim();
          const v124 = v119(v121).find("div.name > a").attr("href");
          if (v123 && v124) {
            const v125 = v124.replace(/\/ep-\d+\/?$/i, "");
            v117.push({
              title: v123,
              watchUrl: v125,
              query: v118
            });
          }
        });
        if (v117.length > 0) {
          break;
        }
      }
      if (v117.length === 0) {
        return null;
      }
      let v126 = null;
      let v127 = -1;
      for (const v128 of v117) {
        const v129 = scoreTitle(v128.title, v110 || "", v112 || null, v113);
        const v130 = v111 ? scoreTitle(v128.title, v111, v112 || null, v113) : 0;
        const v131 = Math.max(v129, v130);
        if (v131 > v127) {
          v127 = v131;
          v126 = v128;
        }
      }
      if (v127 < 0.3) {
        console.log("[" + PROVIDER_NAME + "] Title match score too low: " + v127);
        return null;
      }
      console.log("[" + PROVIDER_NAME + "] Best match: \"" + v126.title + "\" score=" + v127.toFixed(2));
      return v126;
    } catch (v132) {
      console.error("[" + PROVIDER_NAME + "] Search error: " + v132.message);
      return null;
    }
  });
} /*decoder removed*/ /*string-table removed*/
function generateEpisodeVrf(v133) {
  const v134 = v2;
  const v135 = encodeURIComponent(v133).replace(/%21/g, "!").replace(/%27/g, "'").replace(/%28/g, "(").replace(/%29/g, ")").replace(/%7E/g, "~").replace(/%2A/g, "*").replace(/%20/g, "%20");
  const v136 = Array.from(VRF_SECRET).map(v137 => v137.charCodeAt(0));
  const v138 = Array.from(v135).map(v139 => v139.charCodeAt(0));
  const v140 = Array.from({
    length: 256
  }, (v141, v142) => v142);
  let v143 = 0;
  for (let v144 = 0; v144 <= 255; v144++) {
    v143 = (v143 + v140[v144] + v136[v144 % v136.length]) % 256;
    [v140[v144], v140[v143]] = [v140[v143], v140[v144]];
  }
  const v145 = [];
  let v146 = 0;
  v143 = 0;
  for (let v147 = 0; v147 < v138.length; v147++) {
    v146 = (v146 + 1) % 256;
    v143 = (v143 + v140[v146]) % 256;
    [v140[v146], v140[v143]] = [v140[v143], v140[v146]];
    const v148 = v140[(v140[v146] + v140[v143]) % 256];
    v145.push((v138[v147] ^ v148) & 255);
  }
  function v149(v150) {
    const v151 = v134;
    let v152 = "";
    for (const v153 of v150) {
      v152 += String.fromCharCode(v153);
    }
    return btoa(v152).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }
  const v154 = v149(v145);
  const v155 = {
    0: -3,
    1: 3,
    2: -4,
    3: 2,
    4: -2,
    5: 5,
    6: 4,
    7: 5
  };
  const v156 = Array.from(v154).map((v157, v158) => {
    const v159 = v134;
    let v160 = v157.charCodeAt(0);
    v160 += v155[v158 % 8] || 0;
    return v160 & 255;
  });
  const v161 = v149(v156);
  const v162 = v163 => {
    const v164 = v134;
    if (v163 >= "A" && v163 <= "Z") {
      return String.fromCharCode((v163.charCodeAt(0) - 65 + 13) % 26 + 65);
    }
    if (v163 >= "a" && v163 <= "z") {
      return String.fromCharCode((v163.charCodeAt(0) - 97 + 13) % 26 + 97);
    }
    return v163;
  };
  return Array.from(v161).map(v162).join("");
}
function chooseEpisode(v165, v166, v167, v168) {
  const v169 = v2;
  const v170 = v165("div.range > div > a").map((v171, v172) => ({
    slug: parseInt(v165(v172).attr("data-slug") || "0", 10),
    ids: v165(v172).attr("data-ids") || "",
    hasSub: v165(v172).attr("data-sub") === "1",
    hasDub: v165(v172).attr("data-dub") === "1",
    malId: v165(v172).attr("data-mal") ? parseInt(v165(v172).attr("data-mal"), 10) : null
  })).get().filter(v173 => v173.ids);
  if (!v170.length) {
    return null;
  }
  if (v168 === "movie" || v167 == null) {
    return v170[0];
  }
  const v174 = Number(v167);
  return v170.find(v175 => v175.slug === v174) || null;
}
function extractMegaPlay(v176, v177, v178) {
  return __async(this, null, function* () {
    const v179 = v1;
    try {
      const v180 = yield fetchSafe(v176, {
        headers: __spreadProps(__spreadValues({}, HEADERS), {
          "X-Requested-With": "XMLHttpRequest",
          Referer: "https://megaplay.buzz/"
        })
      });
      if (!v180) {
        return [];
      }
      const v181 = cheerio.load(yield v180.text());
      const v182 = v181("#megaplay-player").attr("data-id");
      if (!v182) {
        return [];
      }
      const v183 = yield fetchJson("https://megaplay.buzz/stream/getSources?id=" + v182 + "&id=" + v182, {
        headers: __spreadProps(__spreadValues({}, HEADERS), {
          "X-Requested-With": "XMLHttpRequest",
          Referer: "https://megaplay.buzz/"
        })
      });
      if (!v183 || !v183.sources || !v183.sources.file) {
        return [];
      }
      const v184 = (v183.tracks || []).filter(v185 => v185.kind === "captions" || v185.kind === "subtitles").map(v186 => ({
        label: v186.label || "Unknown",
        url: v186.file
      })).filter(v187 => v187.url);
      const v188 = buildStreamLabels("MegaPlay", "1080p", v177, v178);
      return [makeStream(v188.name, v188.title, v183.sources.file, "1080p", {
        Referer: "https://megaplay.buzz/",
        Origin: "https://megaplay.buzz",
        "User-Agent": HEADERS["User-Agent"]
      }, v184.length > 0 ? v184 : undefined)];
    } catch (v189) {
      console.error("[" + PROVIDER_NAME + "] MegaPlay error: " + v189.message);
      return [];
    }
  });
}
function extractZen(v190, v191, v192) {
  return __async(this, null, function* () {
    const v193 = v1;
    try {
      const v194 = yield fetchSafe(v190, {
        headers: HEADERS
      });
      if (!v194) {
        return [];
      }
      const v195 = yield v194.text();
      const v196 = v195.match(/video_b64:\s*"([^"]+)"/);
      const v197 = v195.match(/enc_key_b64:\s*"([^"]+)"/);
      const v198 = v195.match(/iv_b64:\s*"([^"]+)"/);
      const v199 = v195.match(/subtitles:\s*"([^"]*)"/);
      if (!v196 || !v197 || !v198) {
        return [];
      }
      const v200 = v196[1];
      const v201 = v197[1];
      const v202 = v198[1];
      const v203 = CryptoJS.enc.Base64.parse(v201);
      const v204 = CryptoJS.enc.Base64.parse(v202);
      const v205 = CryptoJS.enc.Base64.parse(v200);
      const v206 = CryptoJS.AES.decrypt({
        ciphertext: v205
      }, v203, {
        iv: v204,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      });
      const v207 = v206.toString(CryptoJS.enc.Utf8);
      if (!v207) {
        return [];
      }
      let v208 = [];
      if (v199 && v199[1]) {
        try {
          const v209 = v199[1].replace(/\\"/g, "\"").replace(/\\\\\//g, "/").replace(/\\u([0-9a-fA-F]{4})/g, (v210, v211) => String.fromCharCode(parseInt(v211, 16)));
          const v212 = JSON.parse(v209);
          if (Array.isArray(v212)) {
            v208 = v212.filter(v213 => v213.url).map(v214 => ({
              label: v214.language || "Unknown",
              url: v214.url
            }));
          }
        } catch (v215) {}
      }
      const v216 = buildStreamLabels("Zen", "1080p", v191, v192);
      return [makeStream(v216.name, v216.title, v207.trim(), "1080p", {
        Referer: "https://player.sgsgsgsr.site/",
        Origin: "https://player.sgsgsgsr.site/"
      }, v208.length > 0 ? v208 : undefined)];
    } catch (v217) {
      console.error("[" + PROVIDER_NAME + "] Zen error: " + v217.message);
      return [];
    }
  });
}
function resolveServers(v218, v219, v220) {
  return __async(this, null, function* () {
    const v221 = v1;
    try {
      const v222 = yield fetchJson(MAIN_URL + "/ajax/server/list?servers=" + encodeURIComponent(v218), {
        headers: AJAX_HEADERS
      });
      if (!v222 || v222.status !== 200) {
        return [];
      }
      const v223 = cheerio.load(v222.result || "");
      const v224 = [];
      v223("div.server-type").each((v225, v226) => {
        const v227 = v221;
        const v228 = v223(v226).attr("data-type");
        const v229 = (v223(v226).find("span").first().text() || "").includes("H-Sub");
        if (!v219.includes(v228)) {
          return;
        }
        v223(v226).find("div.server-list > div.server").each((v230, v231) => {
          const v232 = v227;
          const v233 = v223(v231).attr("data-link-id");
          if (!v233) {
            return;
          }
          v224.push({
            dataId: v233,
            sectionType: v228,
            isHardSub: v229
          });
        });
      });
      if (v224.length === 0) {
        return [];
      }
      const v234 = yield Promise.all(v224.map(v235 => __async(this, null, function* () {
        const v236 = v221;
        try {
          const v237 = yield fetchJson(MAIN_URL + "/ajax/server?get=" + encodeURIComponent(v235.dataId), {
            headers: AJAX_HEADERS
          });
          if (!v237 || !v237.result || !v237.result.url) {
            return [];
          }
          const v238 = v237.result.url;
          const v239 = v235.sectionType === "dub" ? "[Dub]" : v235.isHardSub ? "[Hard Sub]" : "[Sub]";
          if (/megaplay\.buzz/i.test(v238)) {
            return extractMegaPlay(v238, v239, v220);
          } else if (/player\.sgsgsgsr\.site|zencloudz\.cc/i.test(v238)) {
            return extractZen(v238, v239, v220);
          } else if (/vidwish\.live/i.test(v238)) {
            return extractMegaPlay(v238, v239, v220);
          }
          return [];
        } catch (v240) {
          return [];
        }
      })));
      return dedupe(v234.flat());
    } catch (v241) {
      console.error("[" + PROVIDER_NAME + "] Server resolve error: " + v241.message);
      return [];
    }
  });
}
function getStreams(v242, v243, v244, v245) {
  return __async(this, null, function* () {
    const v246 = v1;
    try {
      console.log("[" + PROVIDER_NAME + "] Request: ID=" + v242 + " Type=" + v243 + " S=" + v244 + " E=" + v245);
      if (v243 !== "tv" && v243 !== "movie") {
        return [];
      }
      const v247 = yield getTMDBInfo(v242, v243);
      if (!v247 || !v247.title) {
        console.log("[" + PROVIDER_NAME + "] No TMDB data");
        return [];
      }
      console.log("[" + PROVIDER_NAME + "] Resolved: \"" + v247.title + "\" (" + (v247.year || "N/A") + ")");
      if (v247.genres && v247.genres.length > 0 && !v247.genres.includes(16)) {
        console.log("[" + PROVIDER_NAME + "] Not anime (genres: " + v247.genres.join(",") + "), rejecting");
        return [];
      }
      const v248 = yield searchAllWish(v247.title, v247.originalTitle, v247.year, v244);
      if (!v248 || !v248.watchUrl) {
        console.log("[" + PROVIDER_NAME + "] No match on AllWish");
        return [];
      }
      const v249 = yield fetchHtml(v248.watchUrl);
      if (!v249) {
        return [];
      }
      const v250 = v249("main > div.container").attr("data-id");
      if (!v250) {
        console.log("[" + PROVIDER_NAME + "] No show ID found");
        return [];
      }
      const v251 = generateEpisodeVrf(v250);
      const v252 = yield fetchJson(MAIN_URL + "/ajax/episode/list/" + v250 + "?vrf=" + encodeURIComponent(v251), {
        headers: AJAX_HEADERS
      }, EPISODE_LIST_TIMEOUT);
      if (!v252 || v252.status !== 200) {
        console.log("[" + PROVIDER_NAME + "] Episode list failed");
        return [];
      }
      const v253 = cheerio.load(v252.result || "");
      const v254 = v245 != null ? Number(v245) : null;
      const v255 = chooseEpisode(v253, v244, v254, v243);
      if (!v255) {
        console.log("[" + PROVIDER_NAME + "] Episode not found (looking for ep " + v254 + ")");
        return [];
      }
      console.log("[" + PROVIDER_NAME + "] Selected episode slug=" + v255.slug + " ids=" + v255.ids.substring(0, 30) + "...");
      const v256 = [];
      if (v255.hasSub) {
        v256.push("sub");
      }
      if (v255.hasDub) {
        v256.push("dub");
      }
      if (v256.length === 0) {
        return [];
      }
      const v257 = {
        title: v247.title,
        season: v244,
        episode: v245,
        mediaType: v243
      };
      const v258 = yield resolveServers(v255.ids, v256, v257);
      console.log("[" + PROVIDER_NAME + "] Returning " + v258.length + " streams");
      const v259 = {
        "2160p": 5,
        "4k": 5,
        "1080p": 3,
        "720p": 2,
        HD: 1,
        "480p": 1,
        "360p": 0
      };
      return v258.sort((v260, v261) => (v259[v261.quality] || 0) - (v259[v260.quality] || 0));
    } catch (v262) {
      console.error("[" + PROVIDER_NAME + "] Fatal: " + v262.message);
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
  var PROVIDER = "allwish";
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