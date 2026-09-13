/*
 * nv-plugins cinefreak.js — FULLY DECODED port of the All-in-One-Nuvio provider (4.24.0 merge pass).
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
var v2 = v1; /*rotation removed*/
;
var __async = (v3, v4, v5) => {
  var v6 = {
    dh1: 167
  };
  return new Promise((v7, v8) => {
    var v9 = {
      dh2: 155
    };
    var v10 = v1;
    var v11 = v12 => {
      var v13 = v1;
      try {
        v14(v5.next(v12));
      } catch (v15) {
        v8(v15);
      }
    };
    var v16 = v17 => {
      var v18 = v1;
      try {
        v14(v5.throw(v17));
      } catch (v19) {
        v8(v19);
      }
    };
    var v14 = v20 => v20.done ? v7(v20.value) : Promise.resolve(v20.value).then(v11, v16);
    v14((v5 = v5.apply(v3, v4)).next());
  });
};
var PROVIDER_NAME = "CineFreak";
var BASE_URL = "https://cinefreak.nl";
var CINECLOUD_BASE = "https://new5.cinecloud.site";
var TMDB_API_KEY = "439c478a771f35c05022f9feabcca01c";
var MOBILE_UAS = ["Mozilla/5.0 (Linux; Android 14; Pixel 8 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36", "Mozilla/5.0 (Linux; Android 13; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36", "Mozilla/5.0 (Linux; Android 12; Pixel 6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Mobile Safari/537.36", "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"];
function getHeaders(v21) {
  return {
    "User-Agent": v21,
    Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.5"
  };
} /*decoder removed*/
function fetchText(v22, v23) {
  return __async(this, null, function* () {
    try {
      var v24 = {
        headers: getHeaders(v23 || MOBILE_UAS[0])
      };
      const v25 = new Promise(function (v26, v27) {
        setTimeout(function () {
          v27(new Error("timeout"));
        }, 4000);
      });
      const v28 = yield Promise.race([__nvFetch(v22, v24), v25]);
      if (!v28.ok) {
        return null;
      }
      return yield v28.text();
    } catch (v29) {
      return null;
    }
  });
}
function fetchJson(v30, v31) {
  var v32 = {
    dh3: 236
  };
  return __async(this, null, function* () {
    var v33 = v1;
    try {
      var v34 = yield fetchText(v30, v31);
      if (!v34) {
        return null;
      }
      return JSON.parse(v34);
    } catch (v35) {
      return null;
    }
  });
}
function parseQuality(v36) {
  var v37 = {
    dh4: 237,
    dh5: 189
  };
  var v38 = v2;
  var v39 = String(v36 || "").toLowerCase();
  if (v39.indexOf("2160") >= 0 || v39.indexOf("4k") >= 0) {
    return "2160p";
  }
  if (v39.indexOf("1080") >= 0) {
    return "1080p";
  }
  if (v39.indexOf("720") >= 0) {
    return "720p";
  }
  if (v39.indexOf("480") >= 0) {
    return "480p";
  }
  return "HD";
}
function extractFslUrl(v40) {
  var v41 = {
    dh6: 191,
    dh7: 237,
    dh8: 260
  };
  var v42 = v2;
  var v43 = /href="([^"]+)"[^>]*id="fsl"|href="([^"]+(?:\.workers\.dev|\.r2\.dev|\.buzz|\.cloudflarestorage\.com)\/[^"]+)"|href="(https?:\/\/[^"]+\.(?:mkv|mp4)[^"]*)"|href="(https:\/\/pub-[^"]+)"/ig;
  var v44;
  while ((v44 = v43.exec(v40)) !== null) {
    var v45 = v44[1] || v44[2] || v44[3] || v44[4];
    if (v45 && !v45.includes(".zip")) {
      return v45.replace(/&amp;/g, "&");
    }
  }
  var v46 = "href=\"https://pub-";
  var v47 = v40.indexOf(v46);
  if (v47 === -1) {
    return null;
  }
  var v48 = v47 + 6;
  var v49 = v40.indexOf("\"", v48);
  if (v49 === -1) {
    return null;
  }
  var v50 = v40.substring(v48, v49);
  v50 = v50.replace(/&amp;/g, "&");
  return v50;
}
function decodeGenerateUrl(v51) {
  try {
    var v52 = atob(v51);
    v52 = v52.replace(/newgo32$/, "");
    return v52;
  } catch (v53) {
    return null;
  }
}
function encodeUri(v54) {
  try {
    return encodeURIComponent(v54);
  } catch (v55) {
    return v54;
  }
}
function manifest() {
  var v56 = {
    dh9: 170
  };
  var v57 = v2;
  return {
    id: "cinefreak",
    name: "CineFreak",
    description: "Direct MKV/MP4 streams from cinefreak.nl",
    version: "1.0.0",
    logo: "https://cinefreak.nl/wp-content/uploads/2024/08/cropped-cgk-192x192.png",
    background: "https://cinefreak.nl/wp-content/uploads/2024/08/cropped-cgk-192x192.png",
    types: ["movie", "tv"],
    resources: ["stream"],
    idPrefixes: ["tt", "tmdb"]
  };
}
function search(v58, v59) {
  var v60 = {
    dh10: 192,
    dh11: 258,
    dh12: 164,
    dh13: 186,
    dh14: 256
  };
  return __async(this, null, function* () {
    var v61 = v1;
    if (!v58) {
      return [];
    }
    var v62 = BASE_URL + "/wp-json/wp/v2/search?search=" + encodeUri(v58) + "&per_page=10";
    var v63 = yield fetchJson(v62);
    if (!v63 || !v63.length) {
      return [];
    }
    var v64 = [];
    for (var v65 = 0; v65 < v63.length; v65++) {
      var v66 = v63[v65];
      if (!v66 || !v66.title || !v66.url) {
        continue;
      }
      var v67 = String(v66.title).replace(/Download\s*/gi, "").trim();
      if (!v67) {
        continue;
      }
      v64.push({
        id: v66.url,
        title: v67,
        url: v66.url
      });
    }
    return v64;
  });
}
function getTMDBInfo(v68, v69, v70) {
  var v71 = {
    dh15: 260,
    dh16: 162,
    dh17: 260
  };
  return __async(this, null, function* () {
    var v72 = v1;
    var v73 = v69 === "tv" || v69 === "series";
    var v74 = v73 ? "https://api.themoviedb.org/3/tv/" + v68 + "?api_key=" + TMDB_API_KEY : "https://api.themoviedb.org/3/movie/" + v68 + "?api_key=" + TMDB_API_KEY;
    var v75 = yield fetchJson(v74, v70);
    if (!v75) {
      return null;
    }
    return {
      title: v73 ? v75.name : v75.title,
      year: v73 ? (v75.first_air_date || "").substring(0, 4) : (v75.release_date || "").substring(0, 4),
      isTv: v73
    };
  });
}
function wordMatchScore(v76, v77) {
  var v78 = {
    dh18: 161,
    dh19: 164,
    dh20: 164,
    dh21: 191
  };
  var v79 = v2;
  var v80 = String(v76 || "").toLowerCase().trim();
  var v81 = String(v77 || "").toLowerCase();
  var v82 = v80.replace(/[^a-z0-9\s]/g, " ").split(/\s+/);
  var v83 = 0;
  var v84 = 0;
  for (var v85 = 0; v85 < v82.length; v85++) {
    var v86 = v82[v85];
    if (v86.length < 3) {
      continue;
    }
    v84++;
    var v87 = new RegExp("\\b" + v86.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\b", "i");
    if (v87.test(v77)) {
      v83++;
    }
  }
  if (v84 === 0) {
    return 0;
  }
  return v83 / v84;
}
function titleStartsWith(v88, v89) {
  var v90 = {
    dh22: 161,
    dh23: 237
  };
  var v91 = v2;
  var v92 = String(v88 || "").toLowerCase().trim();
  var v93 = String(v89 || "").toLowerCase().trim();
  return v92.indexOf(v93) === 0 || v92.indexOf(v93 + " ") === 0 || v92.indexOf("(" + v93 + ")") === 0;
}
function urlContains(v94, v95) {
  var v96 = {
    dh24: 161,
    dh25: 164
  };
  var v97 = v2;
  var v98 = String(v94 || "").toLowerCase();
  var v99 = String(v95 || "").toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-");
  var v100 = v99.split("-").filter(function (v101) {
    return v101.length > 2;
  });
  var v102 = 0;
  for (var v103 = 0; v103 < v100.length; v103++) {
    if (v98.indexOf(v100[v103]) >= 0) {
      v102++;
    }
  }
  if (v100.length > 0) {
    return v102 / v100.length;
  } else {
    return 0;
  }
}
function matchByTitleYear(v104, v105, v106, v107) {
  var v108 = {
    dh26: 172,
    dh27: 164,
    dh28: 164,
    dh29: 195
  };
  var v109 = v2;
  if (!v106 || !v106.length) {
    return null;
  }
  var v110 = String(v104 || "").toLowerCase().trim();
  var v111 = String(v105 || "");
  function v112(v113) {
    var v114 = v109;
    if (!v113) {
      return 0;
    }
    var v115 = 0;
    if (titleStartsWith(v113.title, v104)) {
      v115 += 10;
    }
    v115 += urlContains(v113.url, v104) * 5;
    v115 += wordMatchScore(v104, v113.title);
    if (v111 && String(v113.title).toLowerCase().indexOf(v111) >= 0) {
      v115 += 3;
    }
    return v115;
  }
  if (v107) {
    var v116 = "(?:season|s)\\s*" + v107 + "\\b";
    var v117 = new RegExp(v116, "i");
    var v118 = null;
    var v119 = -1;
    for (var v120 = 0; v120 < v106.length; v120++) {
      var v121 = v106[v120];
      if (!v121 || !v121.title) {
        continue;
      }
      if (v117.test(v121.title)) {
        var v122 = v112(v121) + 10;
        if (v122 > v119) {
          v119 = v122;
          v118 = v121;
        }
      }
    }
    if (v118) {
      return v118;
    }
  }
  var v118 = null;
  var v119 = -1;
  for (var v120 = 0; v120 < v106.length; v120++) {
    var v121 = v106[v120];
    if (!v121 || !v121.title) {
      continue;
    }
    var v122 = v112(v121);
    if (v122 > v119) {
      v119 = v122;
      v118 = v121;
    }
  }
  if (v118 && v119 >= 3) {
    return v118;
  }
  return null;
}
function searchCinefreak(v123, v124, v125) {
  var v126 = {
    dh30: 164,
    dh31: 186
  };
  return __async(this, null, function* () {
    var v127 = v1;
    if (!v123) {
      return [];
    }
    var v128 = BASE_URL + "/wp-json/wp/v2/search?search=" + encodeUri(v123) + "&per_page=10";
    var v129 = yield fetchJson(v128, v125);
    if (!v129 || !v129.length) {
      return [];
    }
    var v130 = [];
    for (var v131 = 0; v131 < v129.length; v131++) {
      var v132 = v129[v131];
      if (!v132 || !v132.title || !v132.url) {
        continue;
      }
      v130.push({
        id: v132.id,
        title: String(v132.title).replace(/Download\s*/gi, "").trim(),
        url: v132.url
      });
    }
    return v130;
  });
}
function fetchPostPage(v133, v134) {
  var v135 = {
    dh32: 237
  };
  return __async(this, null, function* () {
    var v136 = v1;
    if (!v133) {
      return null;
    }
    var v137 = v133;
    if (v133.indexOf("http") !== 0) {
      if (v133.indexOf("/") === 0) {
        v137 = BASE_URL + v133;
      } else {
        v137 = BASE_URL + "/" + v133;
      }
    }
    return yield fetchText(v137, v134);
  });
}
function extractAllGenerateLinks(v138) {
  var v139 = {
    dh33: 237,
    dh34: 245,
    dh35: 232,
    dh36: 260,
    dh37: 256
  };
  var v140 = v2;
  if (!v138) {
    return [];
  }
  var v141 = [];
  var v142 = 0;
  var v143 = "/generate.php?id=";
  while (true) {
    var v144 = v138.indexOf(v143, v142);
    if (v144 === -1) {
      break;
    }
    var v145 = v138.lastIndexOf("<a ", v144);
    if (v145 === -1 || v145 < v142) {
      v142 = v144 + 1;
      continue;
    }
    var v146 = v138.indexOf("</a>", v144);
    if (v146 === -1) {
      v142 = v144 + 1;
      continue;
    }
    var v147 = v138.indexOf(">", v144);
    if (v147 === -1 || v147 > v146) {
      v142 = v146 + 4;
      continue;
    }
    var v148 = v138.substring(v147 + 1, v146).trim();
    var v149 = v138.indexOf("\"", v144);
    if (v149 === -1) {
      v142 = v146 + 4;
      continue;
    }
    var v150 = v138.substring(v144, v149);
    var v151 = v150.match(/id=([a-zA-Z0-9+/=]+)/);
    if (!v151) {
      v142 = v146 + 4;
      continue;
    }
    var v152 = v151[1];
    var v153 = decodeGenerateUrl(v152);
    v141.push({
      encodedId: v152,
      decodedUrl: v153 || "",
      label: v148,
      fullTag: v138.substring(v145, v146 + 4)
    });
    v142 = v146 + 4;
  }
  return v141;
}
function extractMovieQualities(v154) {
  var v155 = v2;
  if (!v154) {
    return [];
  }
  var v156 = [];
  var v157 = v154.split("dlbtn-container");
  for (var v158 = 1; v158 < v157.length; v158++) {
    var v159 = v157[v158];
    var v160 = v157[v158 - 1];
    var v161 = v159.match(/href="(?:https?:\/\/[^"]*?)?\/generate\.php\?id=([a-zA-Z0-9+/=]+)"/);
    if (!v161) {
      continue;
    }
    var v162 = v161[1];
    var v163 = decodeGenerateUrl(v162);
    if (!v163 || v163.indexOf("/f/") === -1) {
      continue;
    }
    var v164 = "";
    var v165 = v160.match(/<\/span>\s*([^<]*?(?:2160|1080|720|480|4K)[^<]*?\[[^\]]+\])/i);
    if (!v165) {
      v165 = v160.match(/<\/span>\s*([^<]*?(?:2160|1080|720|480|4K)[^<]*?)\s*\[/i);
    }
    if (v165) {
      v164 = v165[1].trim();
    }
    if (!v164 || !v164.includes("[")) {
      var v166 = v160.match(/<h4[^>]*>([\s\S]*?)<\/h4>/i);
      if (v166) {
        v164 = (v164 + " " + v166[1].replace(/<[^>]*>/g, "")).trim();
      }
    }
    if (!v164) {
      v165 = v160.match(/\b(?:4K\s*2160p|UHD|2160p|1080p|720p|480p)\b/i);
      if (!v165) {
        v165 = v160.match(/\b(?:SD|HD)\b/i);
      }
      if (v165) {
        v164 = v165[0];
      }
    }
    if (!v164) {
      v164 = v163;
    }
    var v167 = parseQuality(v164);
    var v168 = false;
    for (var v169 = 0; v169 < v156.length; v169++) {
      if (v156[v169].decodedUrl === v163) {
        v168 = true;
        break;
      }
    }
    if (v168) {
      continue;
    }
    v156.push({
      encodedId: v162,
      decodedUrl: v163,
      label: v164 || v167,
      quality: v167
    });
  }
  return v156;
}
function extractEpisodeQualities(v170, v171) {
  var v172 = {
    dh38: 259,
    dh39: 163,
    dh40: 259,
    dh41: 256,
    dh42: 240
  };
  var v173 = v2;
  if (!v170) {
    return [];
  }
  var v174 = v170.split("<div class=\"ep-card\"");
  var v175 = null;
  for (var v176 = 1; v176 < v174.length; v176++) {
    var v177 = v174[v176];
    var v178 = v177.match(/episode-badge[^>]*>Episode\s*(\d+)/i);
    if (!v178) {
      continue;
    }
    var v179 = parseInt(v178[1], 10);
    if (v179 === v171) {
      v175 = v177;
      break;
    }
  }
  if (!v175) {
    return [];
  }
  var v180 = extractAllGenerateLinks(v175);
  var v181 = [];
  for (var v182 = 0; v182 < v180.length; v182++) {
    var v183 = v180[v182];
    if (!v183.decodedUrl || v183.decodedUrl.indexOf("/f/") === -1) {
      continue;
    }
    var v184 = v183.label;
    var v185 = parseQuality(v184 || v183.decodedUrl);
    var v186 = false;
    for (var v187 = 0; v187 < v181.length; v187++) {
      if (v181[v187].decodedUrl === v183.decodedUrl) {
        v186 = true;
        break;
      }
    }
    if (v186) {
      continue;
    }
    v181.push({
      encodedId: v183.encodedId,
      decodedUrl: v183.decodedUrl,
      label: v184 || v185,
      quality: v185
    });
  }
  return v181;
}
function filterQualities(v188) {
  var v189 = {
    dh43: 164,
    dh44: 234,
    dh45: 234,
    dh46: 256
  };
  var v190 = {
    dh47: 234
  };
  var v191 = v2;
  if (!v188 || !v188.length) {
    return [];
  }
  var v192 = [];
  for (var v193 = 0; v193 < v188.length; v193++) {
    var v194 = v188[v193];
    if (v194.quality === "480p" || v194.quality === "SD") {
      continue;
    }
    v192.push(v194);
  }
  var v195 = {
    "2160p": 0,
    "1080p": 1,
    "720p": 2,
    HD: 3
  };
  v192.sort(function (v196, v197) {
    var v198 = v191;
    var v199 = v195[v196.quality] !== undefined ? v195[v196.quality] : 99;
    var v200 = v195[v197.quality] !== undefined ? v195[v197.quality] : 99;
    return v199 - v200;
  });
  return v192;
}
function extractHash(v201) {
  var v202 = {
    dh48: 237,
    dh49: 260
  };
  var v203 = v2;
  if (!v201) {
    return "";
  }
  var v204 = v201.indexOf("/f/");
  var v205 = v201.indexOf("/x/");
  var v206 = v204 >= 0 ? v204 + 3 : v205 >= 0 ? v205 + 3 : -1;
  if (v206 < 0) {
    return "";
  }
  return v201.substring(v206);
}
function resolveFslUrl(v207, v208) {
  var v209 = {
    dh50: 187
  };
  return __async(this, null, function* () {
    var v210 = v1;
    if (!v207) {
      return null;
    }
    var v211 = extractHash(v207);
    if (!v211) {
      return null;
    }
    var v212 = CINECLOUD_BASE + "/f/" + v211;
    var v213 = yield fetchText(v212, v208);
    if (!v213) {
      return null;
    }
    return extractFslUrl(v213);
  });
}
function decodeEntities(v214) {
  var v215 = v2;
  if (!v214) {
    return "";
  }
  var v216 = /&(nbsp|amp|quot|lt|gt|#038);/g;
  var v217 = {
    nbsp: " ",
    amp: "&",
    quot: "\"",
    lt: "<",
    gt: ">",
    "#038": "&"
  };
  return v214.replace(v216, function (v218, v219) {
    return v217[v219];
  }).replace(/&#(\d+);/g, function (v220, v221) {
    return String.fromCharCode(v221);
  });
}
function makeStream(v222, v223, v224, v225, v226, v227) {
  var v228 = {
    dh51: 250,
    dh52: 168,
    dh53: 191,
    dh54: 161,
    dh55: 205,
    dh56: 156,
    dh57: 243,
    dh58: 222,
    dh59: 175,
    dh60: 206,
    dh61: 243,
    dh62: 242,
    dh63: 243,
    dh64: 197,
    dh65: 178,
    dh66: 184,
    dh67: 193,
    dh68: 196,
    dh69: 244,
    dh70: 210,
    dh71: 248,
    dh72: 177,
    dh73: 181,
    dh74: 218,
    dh75: 202,
    dh76: 189
  };
  var v229 = v2;
  var v230 = decodeEntities(v222 || "").replace(/[\n\t]+/g, "").trim();
  var v231 = decodeEntities(v223 || "").replace(/[\n\t]+/g, " ").replace(/\s{2,}/g, " ").trim();
  if (v230.indexOf(" - ") > 0) {
    v230 = v230.split(" - ")[0].trim();
  }
  v230 = v230.replace(/\(\d{4}\).*$/gi, "").replace(/\d{3,4}p.*$/gi, "").trim();
  var v232 = v231.toLowerCase();
  var v233 = (v224 || "").toLowerCase();
  var v234 = "N/A";
  var v235 = v231.match(/\[\s*(\d+(?:\.\d+)?\s*[MG]B)\s*\]/i) || v231.match(/(\d+(?:\.\d+)?\s*[MG]B)/i);
  if (v235) {
    v234 = v235[1].toUpperCase().replace(/\s+/g, "");
  }
  var v236 = 0;
  var v237 = 0;
  if (v235) {
    var v238 = parseFloat(v235[1]);
    var v239 = v235[1].toUpperCase();
    v236 = v239.includes("GB") ? v238 * 1024 : v238;
    v237 = v239.includes("GB") ? v238 : v238 / 1024;
  }
  var v240 = "MKV";
  if (v224 && v233.split("?")[0].endsWith(".mp4")) {
    v240 = "MP4";
  }
  var v241 = "WEB-DL";
  if (/\b(bluray|blu\-ray)\b/i.test(v232)) {
    v241 = "BluRay";
  } else if (/\b(hdrip|webrip)\b/i.test(v232)) {
    v241 = "WEBRip";
  }
  var v242 = v225.includes("2160") || v225.toLowerCase().includes("4k") || v232.includes("2160p");
  var v243 = "H.264";
  if (/\b(hevc|x265|h265)\b/i.test(v232) || v233.includes("hevc") || v233.includes("x265") || v242) {
    v243 = "HEVC";
  }
  var v244 = "";
  var v245 = "";
  if (/\b(dolby\s*vision|dovi|dv)\b/i.test(v232) || v233.includes("dovi") || v233.includes("dolby.vision")) {
    v245 = "Dolby Vision";
  } else if (/\bhdr10\b/i.test(v232) || v233.includes("hdr10")) {
    v245 = "HDR10";
  } else if (/\bhdr\b/i.test(v232) || v233.includes("hdr")) {
    v245 = "HDR";
  } else if (/\b(10bit|10\-bit)\b/i.test(v232) || v233.includes("10bit")) {
    v245 = "10Bit";
  }
  if (v245) {
    v244 = " | 🔆 " + v245 + " • ⚡ " + v243;
  } else {
    v244 = " | ⚡ " + v243;
  }
  var v246 = "DD5.1";
  if (v242) {
    v246 = "DDP5.1 • 🔊 Atmos";
  } else if (v235 && v237 < 1.3) {
    v246 = "Stereo";
  } else if (v233.includes("hq")) {
    v246 = "DDP5.1 • 🔊 Atmos";
  } else if (v243 === "HEVC") {
    v246 = "DD5.1";
  }
  var v247 = /\b(dual|multi|dubbed|hindi)\b/i.test(v232) || decodeEntities(v222 || "").toLowerCase().includes("dual audio") || v233.includes("dual");
  var v248 = v247 ? "Dual-Audio" : "Single Audio";
  var v249 = v247 ? "English 🇺🇸 • Hindi 🇮🇳" : "English 🇺🇸";
  var v250 = v225 || "1080p";
  var v251 = PROVIDER_NAME + " | " + v250 + " | " + v248;
  var v252 = decodeEntities(v222 || "").match(/\b(19|20)\d{2}\b/);
  var v253 = v252 ? v252[0] : "2026";
  var v254 = "";
  if (v227 && (v227.startsWith("S") || v227.includes("E"))) {
    v254 = "🎦 " + v230 + " (" + v253 + ") - " + v227.replace(/E0*(\d+)/i, "E$1").replace(/S0*(\d+)/i, "S$1");
  } else {
    v254 = "🎦 " + v230 + " - (" + v253 + ")";
  }
  var v255 = "💎 " + v250 + " | 🗣️ " + v249 + " | 💾 " + v234;
  var v256 = "🎞️ " + v240 + " | 🎧 " + v246 + v244;
  var v257 = "🔗 FSL Server | ☁️ " + v241;
  var v258 = v254 + "\n" + v255 + "\n" + v256 + "\n" + v257;
  var v259 = v242 ? 9000000 : v250.includes("1080") ? 6000000 : 3000000;
  var v260 = v259 + v236;
  return {
    name: v251,
    title: v258,
    size: v258,
    url: v224 || "",
    _resWeight: v259,
    _sortWeight: v260,
    behaviorHints: {
      notWebReady: true,
      proxyHeaders: {
        request: v226 || {
          Referer: CINECLOUD_BASE + "/"
        }
      }
    }
  };
}
function getStreams(v261, v262, v263, v264) {
  var v265 = {
    dh77: 164,
    dh78: 219,
    dh79: 204,
    dh80: 195,
    dh81: 179,
    dh82: 195,
    dh83: 186,
    dh84: 165,
    dh85: 259,
    dh86: 195,
    dh87: 163,
    dh88: 234,
    dh89: 250,
    dh90: 239,
    dh91: 229,
    dh92: 166,
    dh93: 255
  };
  var v266 = {
    dh94: 234
  };
  return __async(this, null, function* () {
    var v267 = v1;
    try {
      var v268 = v262 === "tv" || v262 === "series";
      console.log("[" + PROVIDER_NAME + "] Request: tmdbId=" + v261 + " type=" + v262 + " S=" + v263 + " E=" + v264);
      var v269 = MOBILE_UAS[Math.floor(Math.random() * MOBILE_UAS.length)];
      var v270 = yield getTMDBInfo(v261, v262, v269);
      if (!v270 || !v270.title) {
        console.log("[" + PROVIDER_NAME + "] TMDB info not found for " + v261);
        return [];
      }
      console.log("[" + PROVIDER_NAME + "] TMDB: " + v270.title + " (" + v270.year + ")");
      var v271 = v268 ? parseInt(v263, 10) || 1 : null;
      var v272 = yield searchCinefreak(v270.title, null, v269);
      if (!v272 || v272.length < 3) {
        var v273 = yield searchCinefreak(v270.title + " " + v270.year, null, v269);
        if (v273 && v273.length) {
          v272 = v273;
        }
      }
      if (!v272 || !v272.length) {
        console.log("[" + PROVIDER_NAME + "] No search results for " + v270.title);
        return [];
      }
      var v274 = matchByTitleYear(v270.title, v270.year, v272, v271);
      if (!v274) {
        console.log("[" + PROVIDER_NAME + "] No match found for " + v270.title);
        return [];
      }
      console.log("[" + PROVIDER_NAME + "] Matched: " + v274.title);
      var v275 = yield fetchPostPage(v274.url, v269);
      if (!v275) {
        console.log("[" + PROVIDER_NAME + "] Failed to fetch post page");
        return [];
      }
      var v276;
      if (v268) {
        var v277 = parseInt(v264, 10) || 1;
        v276 = extractEpisodeQualities(v275, v277);
      } else {
        v276 = extractMovieQualities(v275);
      }
      if (!v276 || !v276.length) {
        console.log("[" + PROVIDER_NAME + "] No quality links found");
        return [];
      }
      var v278 = filterQualities(v276);
      if (!v278.length) {
        console.log("[" + PROVIDER_NAME + "] No usable qualities after filtering");
        return [];
      }
      console.log("[" + PROVIDER_NAME + "] Qualities: " + v278.map(function (v279) {
        var v280 = v267;
        return v279.quality;
      }).join(", "));
      var v281 = "";
      if (v268) {
        var v282 = parseInt(v263, 10) || 1;
        var v283 = parseInt(v264, 10) || 1;
        v281 = "S" + (v282 < 10 ? "0" : "") + v282 + "E" + (v283 < 10 ? "0" : "") + v283 + " ";
      }
      var v284 = [];
      for (var v285 = 0; v285 < v278.length; v285++) {
        var v286 = v278[v285];
        var v287 = yield resolveFslUrl(v286.decodedUrl, v269);
        if (v287) {
          var v288 = makeStream(v274.title, v286.label, v287, v286.quality, {
            Referer: CINECLOUD_BASE + "/",
            "User-Agent": v269
          }, v281.trim());
          v284.push(v288);
        }
      }
      var v289 = v284.sort(function (v290, v291) {
        var v292 = v267;
        return (v291._sortWeight || 0) - (v290._sortWeight || 0);
      });
      console.log("[" + PROVIDER_NAME + "] Returning " + v289.length + " stream(s)");
      return v289;
    } catch (v293) {
      console.log("[" + PROVIDER_NAME + "] Fatal error: " + (v293.message || v293));
      return [];
    }
  });
} /*string-table removed*/
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    manifest: manifest,
    search: search,
    getStreams: getStreams
  };
} else {
  global.manifest = manifest;
  global.search = search;
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
  var PROVIDER = "cinefreak";
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