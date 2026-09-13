/*
 * nv-plugins moviesdrive.js — FULLY DECODED port of the All-in-One-Nuvio provider (4.24.0 merge pass).
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
  var v8 = {
    dh1: 395
  };
  var v9 = v2;
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
  var v16 = {
    dh2: 379
  };
  return new Promise((v17, v18) => {
    var v19 = v1;
    var v20 = v21 => {
      try {
        v22(v15.next(v21));
      } catch (v23) {
        v18(v23);
      }
    };
    var v24 = v25 => {
      try {
        v22(v15.throw(v25));
      } catch (v26) {
        v18(v26);
      }
    };
    var v22 = v27 => v27.done ? v17(v27.value) : Promise.resolve(v27.value).then(v20, v24);
    v22((v15 = v15.apply(v13, v14)).next());
  });
};
var PROVIDER_NAME = "MoviesDrive";
var MAIN_URL = "https://new1.moviesdrive.christmas";
var ARCHIVE_DOMAIN = "https://mdrive.lol";
var TMDB_KEY = "439c478a771f35c05022f9feabcca01c";
var MOBILE_UAS = ["Mozilla/5.0 (Linux; Android 14; Pixel 8 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36", "Mozilla/5.0 (Linux; Android 13; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36", "Mozilla/5.0 (Linux; Android 12; Pixel 6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Mobile Safari/537.36", "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1", "Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"];
function getHeaders(v28) {
  var v29 = {
    dh3: 432,
    dh4: 399,
    dh5: 419
  };
  var v30 = v2;
  var v31 = MOBILE_UAS[Math.floor(Math.random() * MOBILE_UAS.length)];
  var v32 = {
    "User-Agent": v31,
    "Accept-Language": "en-US,en;q=0.9"
  };
  if (v28) {
    for (var v33 in v28) {
      v32[v33] = v28[v33];
    }
  }
  return v32;
} /*string-table removed*/
function log(v34) {
  var v35 = {
    dh6: 365
  };
  var v36 = v2;
  console.log("[" + PROVIDER_NAME + "] " + v34);
}
function err(v37) {
  console.error("[" + PROVIDER_NAME + "] " + v37);
}
function fetchText(v38, v39, v40) {
  var v41 = {
    dh7: 411,
    dh8: 451,
    dh9: 413
  };
  return __async(this, null, function* () {
    var v42 = v1;
    v40 = v40 || 12000;
    try {
      var v43 = null;
      if (typeof AbortSignal !== "undefined" && AbortSignal.timeout) {
        v43 = AbortSignal.timeout(v40);
      }
      var v44 = getHeaders(v39 && v39.headers ? null : null);
      if (v39 && v39.headers) {
        for (var v45 in v39.headers) {
          v44[v45] = v39.headers[v45];
        }
      }
      var v46 = __spreadProps(__spreadValues({}, v39 || {}), {
        headers: v44
      });
      if (v43) {
        v46.signal = v43;
      }
      var v47 = __nvFetch(v38, v46);
      var v48 = new Promise(function (v49, v50) {
        setTimeout(function () {
          var v51 = v1;
          v50(new Error("Timeout " + v40 + "ms"));
        }, v40);
      });
      var v52 = yield Promise.race([v47, v48]);
      if (v52.ok) {
        return yield v52.text();
      }
      return null;
    } catch (v53) {
      err("fetch: " + v38.substring(0, 80) + " -> " + (v53.message || ""));
      return null;
    }
  });
}
function fetchJson(v54, v55, v56) {
  return __async(this, null, function* () {
    var v57 = yield fetchText(v54, v55, v56);
    if (!v57) {
      return null;
    }
    try {
      return JSON.parse(v57);
    } catch (v58) {
      return null;
    }
  });
}
function parseQuality(v59) {
  var v60 = v2;
  var v61 = String(v59 || "");
  var v62 = v61.match(/(2160|1080|720|480)\s*P/i);
  if (v62) {
    return v62[1] + "p";
  }
  if (/4K|UHD/i.test(v61)) {
    return "2160p";
  }
  if (/1440|2K/i.test(v61)) {
    return "1440p";
  }
  return "HD";
}
function extractSiteTitle(v63) {
  var v64 = {
    dh10: 435,
    dh11: 435
  };
  var v65 = v2;
  var v66 = v63.match(/<title>(.*?)<\/title>/i);
  if (!v66) {
    return "";
  }
  var v67 = v66[1];
  var v68 = v67.match(/Download\s+(.+?)\s+(?:In HD Free|Free Download)/i);
  if (v68) {
    return v68[1].trim();
  }
  var v69 = v67.replace(/^(?:Download\s+)?/, "");
  v69 = v69.replace(/\s+(?:\d{3,4}p\b|4K\b|WEB-DL\b|BluRay\b|HDTV\b|x26[45]\b|HEVC\b|SDR\b|HDR\b|DD\d|DDP\d|Hindi|English|Dual\s*Audio|ESubs?)\b.*$/i, "");
  v69 = v69.replace(/\s*[-–|]\s*\w*\s*$/i, "").trim();
  v69 = v69.replace(/&#8211;/g, "–");
  return v69 || v67;
}
function isStrictMatch(v70, v71, v72, v73) {
  var v74 = {
    dh12: 435,
    dh13: 438,
    dh14: 415
  };
  var v75 = v2;
  if (!v70 || !v72) {
    return false;
  }
  var v76 = v70.toLowerCase().replace(/[^a-z0-9\s]/g, " ").trim().replace(/\s+/g, " ");
  var v77 = v72.toLowerCase().replace(/download\s*/g, "").replace(/[^a-z0-9\s]/g, " ").trim().replace(/\s+/g, " ");
  if (v77 !== v76 && v77.indexOf(v76 + " ") !== 0 && v77.indexOf(" " + v76 + " ") === -1 && v77.indexOf(" " + v76) !== v77.length - v76.length - 1) {
    return false;
  }
  if (v71 && v73) {
    var v78 = parseInt(v71);
    var v79 = parseInt(v73);
    if (!isNaN(v78) && !isNaN(v79) && Math.abs(v78 - v79) > 1) {
      return false;
    }
  }
  return true;
}
function extractSeasonHtml(v80, v81) {
  var v82 = {
    dh15: 419,
    dh16: 412,
    dh17: 456,
    dh18: 456,
    dh19: 394
  };
  var v83 = v2;
  if (!v80 || v81 == null) {
    return v80;
  }
  var v84 = new RegExp("(<h[1-6][^>]*>|<strong[^>]*>|<span[^>]*>)[\\s\\S]{0,100}?(?:Season|Saison|Staffel)\\s*0*(\\d+)\\b(?!\\s*[-–+&])", "gi");
  var v85;
  var v86 = [];
  while ((v85 = v84.exec(v80)) !== null) {
    v86.push({
      index: v85.index,
      season: parseInt(v85[2])
    });
  }
  var v87 = -1;
  var v88 = -1;
  for (var v89 = 0; v89 < v86.length; v89++) {
    if (v86[v89].season === v81) {
      if (v87 === -1) {
        v87 = v89;
      }
    } else {
      v88 = v89;
    }
  }
  if (v87 === -1) {
    var v90 = new RegExp("(<h[1-6][^>]*>|<strong[^>]*>).*?(?:Season|Saison|Staffel)\\s*0*(\\d+)\\s*[-–]\\s*0*(\\d+)", "gi");
    var v91;
    var v92 = -1;
    while ((v91 = v90.exec(v80)) !== null) {
      if (v81 >= parseInt(v91[2]) && v81 <= parseInt(v91[3])) {
        v92 = v91.index;
        break;
      }
    }
    if (v92 !== -1) {
      return v80.substring(v92);
    }
    return null;
  }
  var v93 = v86[v87].index;
  if (v88 > v87) {
    for (var v94 = 0; v94 < v86.length; v94++) {
      if (v86[v94].season === v81 && v94 > v88) {
        v93 = v86[v94].index;
        break;
      }
    }
  }
  var v95 = v80.length;
  for (var v94 = 0; v94 < v86.length; v94++) {
    if (v86[v94].index > v93 && v86[v94].season !== v81) {
      v95 = v86[v94].index;
      break;
    }
  }
  return v80.substring(v93, v95);
}
function getMedia(v96, v97) {
  var v98 = {
    dh20: 400,
    dh21: 419,
    dh22: 452,
    dh23: 367,
    dh24: 388,
    dh25: 367,
    dh26: 458,
    dh27: 437
  };
  return __async(this, null, function* () {
    var v99 = v1;
    var v100 = String(v96 || "").trim();
    var v101 = v100.indexOf("tt") === 0;
    var v102 = v97 === "tv" || v97 === "series" ? "tv" : "movie";
    try {
      if (v101) {
        var v103 = yield fetchJson("https://api.themoviedb.org/3/find/" + v100 + "?api_key=" + TMDB_KEY + "&external_source=imdb_id", {}, 10000);
        var v104 = v103 ? v102 === "tv" ? v103.tv_results : v103.movie_results : null;
        if (v104 && v104.length > 0) {
          var v105 = v104[0];
          return {
            title: v102 === "tv" ? v105.name : v105.title,
            year: (v105.first_air_date || v105.release_date || "").split("-")[0],
            imdb: v100
          };
        }
      } else {
        var v103 = yield fetchJson("https://api.themoviedb.org/3/" + v102 + "/" + v100 + "?api_key=" + TMDB_KEY + "&append_to_response=external_ids", {}, 10000);
        if (v103) {
          return {
            title: v102 === "tv" ? v103.name : v103.title,
            year: (v103.first_air_date || v103.release_date || "").split("-")[0],
            imdb: v103.imdb_id || v103.external_ids && v103.external_ids.imdb_id || null
          };
        }
      }
    } catch (v106) {
      err("tmdb: " + v106.message);
    }
    return {
      title: v100,
      year: null,
      imdb: null
    };
  });
}
function searchSite(v107) {
  var v108 = {
    dh28: 380,
    dh29: 419,
    dh30: 431,
    dh31: 385,
    dh32: 440,
    dh33: 462,
    dh34: 440,
    dh35: 458,
    dh36: 447
  };
  return __async(this, null, function* () {
    var v109 = v1;
    var v110 = encodeURIComponent(v107);
    var v111 = MAIN_URL + "/search.php?q=" + v110 + "&per_page=10";
    var v112 = yield fetchJson(v111, {
      headers: {
        Referer: MAIN_URL + "/"
      }
    }, 10000);
    if (!v112 || !v112.hits || v112.hits.length === 0) {
      log("search zero: " + v107);
      return [];
    }
    var v113 = [];
    for (var v114 = 0; v114 < v112.hits.length; v114++) {
      var v115 = v112.hits[v114].document;
      if (v115 && v115.permalink && v115.post_title) {
        var v116 = v115.post_title.match(/\((\d{4})\)/);
        v113.push({
          title: v115.post_title,
          href: v115.permalink,
          year: v116 ? parseInt(v116[1]) : null,
          imdb: v115.imdb_id || null
        });
      }
    }
    log("search found " + v113.length + " for: " + v107);
    return v113;
  });
}
function parsePage(v117, v118, v119) {
  var v120 = {
    dh37: 377,
    dh38: 419,
    dh39: 448
  };
  return __async(this, null, function* () {
    var v121 = v1;
    if (!v119) {
      v119 = yield fetchText(v117, {
        headers: {
          Referer: MAIN_URL + "/"
        }
      }, 12000);
    }
    if (!v119) {
      return [];
    }
    var v122 = v118 != null;
    var v123 = v122 ? extractSeasonHtml(v119, v118) : v119;
    if (!v123) {
      log("season " + v118 + " not found");
      return [];
    }
    var v124 = [];
    var v125 = /href="(https?:\/\/mdrive\.lol\/archive\/(\d+)[^"]*)"[^>]*>([\s\S]*?)<\/a>/gi;
    var v126;
    while ((v126 = v125.exec(v123)) !== null) {
      var v127 = v126[3].replace(/<[^>]+>/g, "").trim();
      if (v122 && /zip/i.test(v127)) {
        continue;
      }
      var v128 = parseQuality(v127);
      if (v128 === "480p") {
        continue;
      }
      var v129 = v127.match(/\[([\d.]+)\s*(MB|GB|TB)\]/i);
      var v130 = v129 ? v129[0] : "";
      v124.push({
        id: v126[2],
        url: v126[1],
        label: v127,
        q: v128,
        size: v130
      });
    }
    log("archive links: " + v124.length + (v122 ? " (season " + v118 + ")" : ""));
    return v124;
  });
}
function parseArchive(v131, v132) {
  var v133 = {
    dh40: 369,
    dh41: 405,
    dh42: 419,
    dh43: 446
  };
  return __async(this, null, function* () {
    var v134 = v1;
    var v135 = yield fetchText(v131, {
      headers: {
        Referer: MAIN_URL + "/"
      }
    }, 12000);
    if (!v135) {
      return [];
    }
    var v136 = [];
    var v137 = /https?:\/\/hubcloud\.[a-z]+\/drive\/([a-z0-9_]+)/gi;
    var v138;
    while ((v138 = v137.exec(v135)) !== null) {
      var v139 = v138[0];
      var v140 = v132 != null;
      if (v140) {
        var v141 = Math.max(0, v138.index - 300);
        var v142 = v135.substring(v141, v138.index);
        var v143 = /(?:EP|Episode|E)\D*0*(\d+)/gi;
        var v144;
        var v145 = -1;
        while ((v144 = v143.exec(v142)) !== null) {
          v145 = parseInt(v144[1]);
        }
        if (v145 === -1 || v145 !== v132) {
          continue;
        }
      }
      v136.push({
        url: v139,
        id: v138[1]
      });
    }
    log("archive hosts: " + v136.length + (v140 ? " (ep " + v132 + ")" : ""));
    return v136;
  });
}
function minutes() {
  var v146 = v2;
  return String(new Date().getMinutes());
}
function decodeBase64(v147) {
  var v148 = {
    dh44: 383,
    dh45: 450
  };
  var v149 = v2;
  if (typeof atob === "function") {
    return atob(v147);
  }
  var v150 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
  var v151 = "";
  v147 = String(v147).replace(/=+$/, "");
  for (var v152 = 0, v153, v154, v155 = 0; v154 = v147.charAt(v155++); ~v154 && (v153 = v152 % 4 ? v153 * 64 + v154 : v154, v152++ % 4) ? v151 += String.fromCharCode(v153 >> (v152 * -2 & 6) & 255) : 0) {
    v154 = v150.indexOf(v154);
  }
  return v151;
}
function resolveHubcloud(v156, v157, v158) {
  var v159 = {
    dh46: 368,
    dh47: 397,
    dh48: 393,
    dh49: 462,
    dh50: 402,
    dh51: 419,
    dh52: 462
  };
  return __async(this, null, function* () {
    var v160 = v1;
    var v161 = yield fetchText(v156, {
      headers: {
        Cookie: "xla=s4t",
        Referer: ARCHIVE_DOMAIN + "/"
      }
    }, 12000);
    if (!v161) {
      return [];
    }
    var v162 = null;
    var v163 = v161.match(/var\s+url\s*=\s*'([^']+)'/);
    if (v163) {
      v162 = v163[1];
    }
    if (!v162) {
      var v164 = v161.match(/<a\s+id="download"\s+(?:x-href|href)="([^"]+)"/);
      if (v164) {
        v162 = v164[1];
        if (!v162.startsWith("http")) {
          try {
            v162 = decodeBase64(v162);
          } catch (v165) {}
        }
      }
    }
    if (!v162) {
      return [];
    }
    var v166 = yield fetchText(v162, {
      headers: {
        Cookie: "xla=s4t",
        Referer: v156
      }
    }, 15000);
    if (!v166) {
      return [];
    }
    var v167 = [];
    var v168;
    var v169 = /href="(https?:\/\/fsl\.gigabytes\.icu[^"]+)"/gi;
    while ((v168 = v169.exec(v166)) !== null) {
      v167.push({
        type: "FSLv2",
        url: v168[1],
        quality: v157,
        size: v158 || ""
      });
    }
    var v170 = /href="(https?:\/\/(?:pub-[a-z0-9]+\.r2\.dev|[a-z0-9.]+\.buzz)[^"]+)"/gi;
    while ((v168 = v170.exec(v166)) !== null) {
      v167.push({
        type: "FSL",
        url: v168[1] + "1" + minutes(),
        quality: v157,
        size: v158 || ""
      });
    }
    if (v167.length === 0) {
      var v171 = v166.match(/https?:\/\/[^\s"'<>]+\?token=\d+/);
      if (v171) {
        var v172 = v171[0].replace(/["'].*$/, "").replace(/[<>].*$/, "");
        v167.push({
          type: "FSL",
          url: v172 + "1" + minutes(),
          quality: v157,
          size: v158 || ""
        });
      }
    }
    return v167;
  });
}
function dedupe(v173) {
  var v174 = v2;
  var v175 = {};
  return (v173 || []).filter(function (v176) {
    var v177 = v174;
    if (!v176 || !v176.url || v175[v176.url]) {
      return false;
    }
    v175[v176.url] = true;
    return true;
  });
}
function pad2(v178) {
  if (v178 != null && v178 < 10) {
    return "0" + v178;
  } else {
    return String(v178);
  }
} /*decoder removed*/
function getStreams(v179, v180, v181, v182) {
  var v183 = {
    dh53: 425,
    dh54: 366,
    dh55: 378,
    dh56: 372,
    dh57: 370,
    dh58: 370,
    dh59: 438,
    dh60: 408,
    dh61: 360,
    dh62: 371,
    dh63: 390,
    dh64: 419,
    dh65: 457,
    dh66: 442,
    dh67: 361,
    dh68: 407,
    dh69: 419,
    dh70: 426,
    dh71: 407,
    dh72: 396,
    dh73: 443
  };
  var v184 = {
    dh74: 424
  };
  return __async(this, null, function* () {
    var v185 = {
      dh75: 384,
      dh76: 462,
      dh77: 376
    };
    var v186 = v1;
    try {
      log("request: id=" + v179 + " type=" + v180 + " s=" + v181 + " e=" + v182);
      var v187 = yield getMedia(v179, v180);
      if (!v187 || !v187.title) {
        return [];
      }
      var v188 = v180 === "tv" || v180 === "series";
      var v189 = v181 != null ? Number(v181) : null;
      var v190 = v182 != null ? Number(v182) : null;
      log("resolved: \"" + v187.title + "\" (" + (v187.year || "?") + ")");
      var v191;
      var v192;
      var v193 = null;
      var v194 = null;
      if (v187.imdb && v187.imdb.indexOf("tt") === 0) {
        v191 = yield searchSite(v187.imdb);
        if (v188 && v189 != null) {
          for (v192 = 0; v192 < v191.length; v192++) {
            if (v191[v192].imdb !== v187.imdb) {
              continue;
            }
            var v195 = v191[v192].href.indexOf("http") === 0 ? v191[v192].href : MAIN_URL + v191[v192].href;
            var v196 = yield fetchText(v195, {
              headers: {
                Referer: MAIN_URL + "/"
              }
            }, 12000);
            if (v196 && extractSeasonHtml(v196, v189) !== null) {
              v193 = v191[v192];
              v194 = v196;
              log("imdb season match: " + v193.title);
              break;
            }
          }
        } else {
          for (v192 = 0; v192 < v191.length; v192++) {
            if (v191[v192].imdb === v187.imdb) {
              v193 = v191[v192];
              log("imdb exact match: " + v193.title);
              break;
            }
          }
        }
      }
      if (!v193) {
        v191 = yield searchSite(v187.title);
        for (v192 = 0; v192 < v191.length; v192++) {
          if (isStrictMatch(v187.title, v187.year, v191[v192].title, v191[v192].year)) {
            var v195 = v191[v192].href.indexOf("http") === 0 ? v191[v192].href : MAIN_URL + v191[v192].href;
            var v196 = yield fetchText(v195, {
              headers: {
                Referer: MAIN_URL + "/"
              }
            }, 12000);
            if (!v188 || extractSeasonHtml(v196, v189) !== null) {
              v193 = v191[v192];
              v194 = v196;
              log("title match: " + v193.title);
              break;
            }
          }
        }
      }
      if (!v193) {
        log("no match");
        return [];
      }
      if (!v194) {
        var v197 = v193.href.indexOf("http") === 0 ? v193.href : MAIN_URL + v193.href;
        v194 = yield fetchText(v197, {
          headers: {
            Referer: MAIN_URL + "/"
          }
        }, 12000);
        if (!v194) {
          return [];
        }
      }
      var v198 = extractSiteTitle(v194);
      var v199 = "";
      if (v188) {
        v199 = (v198 || v187.title) + " [S" + pad2(v189) + "E" + pad2(v190) + "]";
      }
      var v200 = yield parsePage(v193.href.indexOf("http") === 0 ? v193.href : MAIN_URL + v193.href, v189, v194);
      v200 = v200.filter(function (v201) {
        var v202 = v186;
        return v201.q !== "480p";
      });
      if (v200.length === 0) {
        log("no 720p/1080p/4k archives");
        return [];
      }
      log("processing " + v200.length + " archive links");
      var v203 = [];
      for (var v204 = 0; v204 < v200.length; v204++) {
        var v205 = v200[v204];
        try {
          var v206 = yield parseArchive(v205.url, v190);
          v206.forEach(function (v207) {
            var v208 = v186;
            v203.push({
              url: v207.url,
              q: v205.q,
              size: v205.size
            });
          });
        } catch (v209) {}
      }
      if (v203.length === 0) {
        log("no hubcloud hosts");
        return [];
      }
      log("resolving " + v203.length + " hubcloud links");
      var v210 = [];
      for (var v204 = 0; v204 < v203.length; v204++) {
        var v211 = v203[v204];
        try {
          var v212 = yield resolveHubcloud(v211.url, v211.q, v211.size);
          v210.push(v212);
        } catch (v213) {}
      }
      var v214 = [];
      v210.forEach(function (v215) {
        var v216 = {
          dh78: 462
        };
        v215.forEach(function (v217) {
          var v218 = v1;
          v214.push(v217);
        });
      });
      if (v214.length === 0) {
        log("no FSL streams resolved");
        return [];
      }
      var v219 = v188 && v199 ? v199 : v198;
      var v220 = [];
      v214.forEach(function (v221) {
        var v222 = v186;
        var v223 = v221.size ? " " + v221.size : "";
        var v224 = v219 + " - " + PROVIDER_NAME;
        v220.push({
          name: v224,
          title: "Auto",
          url: v221.url,
          quality: v221.quality,
          size: "(" + v221.type + ")" + v223,
          behaviorHints: {
            notWebReady: true,
            proxyHeaders: {
              request: {
                Referer: ARCHIVE_DOMAIN + "/"
              }
            }
          }
        });
      });
      v220 = dedupe(v220);
      var v225 = {
        "2160p": 4,
        "1080p": 3,
        "720p": 2,
        HD: 1
      };
      v220.sort(function (v226, v227) {
        var v228 = v186;
        function v229(v230) {
          var v231 = v1;
          if (v230.indexOf("(FSLv2)") !== -1) {
            return 1;
          } else {
            return 0;
          }
        }
        var v232 = v229(v226.name);
        var v233 = v229(v227.name);
        if (v232 !== v233) {
          return v233 - v232;
        }
        return (v225[v227.quality] || 0) - (v225[v226.quality] || 0);
      });
      log("returning " + v220.length + " streams");
      return v220;
    } catch (v234) {
      err("fatal: " + v234.message);
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
  var PROVIDER = "moviesdrive";
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