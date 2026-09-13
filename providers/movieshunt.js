/*
 * nv-plugins movieshunt.js — FULLY DECODED port of the All-in-One-Nuvio provider (4.23.0 best-settings pass).
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
  var v6 = {
    dh1: 356
  };
  return new Promise((v7, v8) => {
    var v9 = v1;
    var v10 = v11 => {
      var v12 = v1;
      try {
        v13(v5.next(v11));
      } catch (v14) {
        v8(v14);
      }
    };
    var v15 = v16 => {
      try {
        v13(v5.throw(v16));
      } catch (v17) {
        v8(v17);
      }
    };
    var v13 = v18 => v18.done ? v7(v18.value) : Promise.resolve(v18.value).then(v10, v15);
    v13((v5 = v5.apply(v3, v4)).next());
  });
};
var PROVIDER_NAME = "MoviesHunt";
var TMDB_API_KEY = "439c478a771f35c05022f9feabcca01c";
var movieshuntBase = "https://movieshunt.run";
var abhilinksBase = "https://abhilinks.site";
var currentUA = "Mozilla/5.0 (Linux; Android 14; Pixel 8 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36";
var UAS = ["Mozilla/5.0 (Linux; Android 14; Pixel 8 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36", "Mozilla/5.0 (Linux; Android 13; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36", "Mozilla/5.0 (Linux; Android 12; Pixel 6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Mobile Safari/537.36", "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"];
function log(v19) {
  console.log("[" + PROVIDER_NAME + "] " + v19);
}
function hdrs(v20) {
  var v21 = v2;
  return Object.assign({}, {
    "User-Agent": currentUA,
    "Accept-Language": "en-US,en;q=0.9",
    Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
  }, v20 || {});
}
var FETCH_TIMEOUT = 20000;
function raceTimeout(v22) {
  return new Promise(function (v23, v24) {
    setTimeout(function () {
      v24(new Error("Timeout"));
    }, v22);
  });
}
function fetchText(v25, v26) {
  return __async(this, null, function* () {
    try {
      var v27 = yield Promise.race([__nvFetch(v25, v26 || {}), raceTimeout(FETCH_TIMEOUT)]);
      if (v27 && v27.ok) {
        return yield v27.text();
      }
    } catch (v28) {}
    return null;
  });
} /*string-table removed*/
function fetchJson(v29, v30) {
  var v31 = {
    dh2: 346
  };
  return __async(this, null, function* () {
    var v32 = v1;
    try {
      var v33 = yield Promise.race([__nvFetch(v29, v30 || {}), raceTimeout(FETCH_TIMEOUT)]);
      if (v33 && v33.ok) {
        return yield v33.json();
      }
    } catch (v34) {}
    return null;
  });
}
function getTMDBInfo(v35, v36) {
  return __async(this, null, function* () {
    var v37 = v1;
    var v38 = v36 === "tv" || v36 === "series" ? "tv" : "movie";
    var v39 = "https://api.themoviedb.org/3/" + v38 + "/" + v35 + "?api_key=" + TMDB_API_KEY + "&language=en-US";
    return yield fetchJson(v39, {
      headers: {
        "User-Agent": currentUA
      }
    });
  });
}
function parseSearchResults(v40) {
  var v41 = {
    dh3: 315,
    dh4: 301,
    dh5: 335
  };
  var v42 = v2;
  var v43 = [];
  var v44 = /<h\d[^>]*class="[^"]*entry-title[^"]*"[^>]*>([\s\S]*?)<\/h\d>/gi;
  var v45;
  while ((v45 = v44.exec(v40)) !== null) {
    var v46 = v45[1];
    var v47 = v46.match(/<a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/i);
    if (v47) {
      var v48 = v47[1];
      if (v48.indexOf("http") !== 0) {
        v48 = movieshuntBase + (v48.startsWith("/") ? "" : "/") + v48;
      }
      var v49 = v47[2].replace(/<[^>]+>/g, "").trim();
      if (v49.length > 5) {
        v43.push({
          title: v49,
          url: v48
        });
      }
    }
  }
  return v43;
}
function searchSite(v50) {
  var v51 = {
    dh6: 311,
    dh7: 311,
    dh8: 377,
    dh9: 335,
    dh10: 399,
    dh11: 380,
    dh12: 374,
    dh13: 294,
    dh14: 374,
    dh15: 372,
    dh16: 291,
    dh17: 374,
    dh18: 343,
    dh19: 374,
    dh20: 308
  };
  return __async(this, null, function* () {
    var v52 = v1;
    var v53 = [];
    var v54 = [v50.replace(/'/g, "").trim()];
    var v55 = v50.replace(/[^a-zA-Z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
    if (v55 !== v54[0]) {
      v54.push(v55);
    }
    var v56 = v55.replace(/\s*\d{4}\s*/g, " ").trim();
    if (v56 && v54.indexOf(v56) < 0) {
      v54.push(v56);
    }
    var v57 = v55.split(" ").filter(function (v58) {
      return v58.length > 2;
    });
    while (v57.length > 1) {
      v57.pop();
      var v59 = v57.join(" ");
      if (v59.length > 3 && v54.indexOf(v59) < 0) {
        v54.push(v59);
      }
    }
    if (v55) {
      var v60 = v55.split(" ");
      if (v60.length > 1) {
        var v61 = v60.slice(-Math.min(2, v60.length)).join(" ");
        if (v61.length > 3 && v54.indexOf(v61) < 0) {
          v54.push(v61);
        }
        var v62 = v60[v60.length - 1];
        if (v62.length > 3 && /[a-zA-Z]/.test(v62) && v54.indexOf(v62) < 0) {
          v54.push(v62);
        }
      }
    }
    for (var v63 = 0; v63 < v54.length; v63++) {
      var v64 = v54[v63];
      if (v64.length < 3) {
        continue;
      }
      var v65 = movieshuntBase + "/?s=" + encodeURIComponent(v64);
      var v66 = yield fetchText(v65, {
        headers: hdrs()
      });
      if (!v66) {
        continue;
      }
      var v67 = parseSearchResults(v66);
      if (v67 && v67.length) {
        log("Search '" + v64 + "' found " + v67.length + " results");
        return v67;
      }
    }
    return v53;
  });
}
function matchHits(v68, v69, v70) {
  var v71 = {
    dh21: 334,
    dh22: 330,
    dh23: 311,
    dh24: 397,
    dh25: 374,
    dh26: 311,
    dh27: 291,
    dh28: 377,
    dh29: 399,
    dh30: 364
  };
  var v72 = {
    dh31: 374
  };
  var v73 = v2;
  var v74 = (v70 ? v69.name : v69.title) || "";
  var v75 = v70 ? (v69.first_air_date || "").split("-")[0] : (v69.release_date || "").split("-")[0];
  var v76 = v74.toLowerCase().replace(/[\u2018\u2019\u201A\u201B\u2032\u2035]/g, "'");
  var v77 = /\b(and|&|the|a|an)\b/g;
  var v78 = v76.replace(v77, "").replace(/\s+/g, " ").trim();
  var v79 = v76.split(/\s+/).filter(function (v80) {
    var v81 = v73;
    return v80.length > 1;
  });
  var v82 = [];
  var v83 = {};
  for (var v84 = 0; v84 < v68.length; v84++) {
    var v85 = v68[v84];
    var v86 = v85.title || "";
    var v87 = v85.url || "";
    if (v83[v87]) {
      continue;
    }
    v83[v87] = true;
    var v88 = v86.toLowerCase().replace(/[\u2018\u2019\u201A\u201B\u2032\u2035]/g, "'");
    var v89 = 0;
    if (v88 === v76) {
      v89 += 100;
    } else if (v88.indexOf(v76) >= 0 || v76.indexOf(v88) >= 0) {
      v89 += 50;
    } else {
      var v90 = v88.replace(v77, "").replace(/\s+/g, " ").trim();
      if (v90.indexOf(v78) >= 0 || v78.indexOf(v90) >= 0) {
        v89 += 50;
      } else if (v90.replace(/[^a-z0-9\s]/g, "").trim() === v78.replace(/[^a-z0-9\s]/g, "").trim()) {
        v89 += 60;
      }
    }
    if (v89 === 0 && v79.length > 1) {
      var v91 = v88.split(/\s+/).filter(function (v92) {
        var v93 = v73;
        return v92.length > 1;
      });
      var v94 = 0;
      for (var v95 = 0; v95 < v79.length; v95++) {
        for (var v96 = 0; v96 < v91.length; v96++) {
          if (v79[v95] === v91[v96] || v91[v96].indexOf(v79[v95]) === 0 || v79[v95].indexOf(v91[v96]) === 0) {
            v94++;
            break;
          }
        }
      }
      if (v94 >= Math.min(v79.length, 3)) {
        v89 += 50;
      }
    }
    if (v89 >= 50 && v75 && v86.indexOf(v75) >= 0) {
      v89 += 10;
    }
    if (v89 >= 50) {
      v82.push({
        doc: v85,
        score: v89
      });
    }
  }
  v82.sort(function (v97, v98) {
    return v98.score - v97.score;
  });
  var v99 = [];
  for (var v100 = 0; v100 < Math.min(v82.length, 5); v100++) {
    v99.push(v82[v100].doc);
  }
  return v99;
}
function extractAbhilinksUrl(v101) {
  var v102 = v2;
  var v103 = v101.match(/<a[^>]*href="(https:\/\/abhilinks\.(?:life|site)\/[^"]+)"[^>]*class="btn"[^>]*>/i);
  if (v103) {
    return v103[1];
  }
  var v104 = v101.match(/<a[^>]*href="(https:\/\/abhilinks\.(?:life|site)\/[^"]+)"[^>]*>/i);
  if (v104) {
    return v104[1];
  }
  return null;
}
function extractQualityOptions(v105) {
  var v106 = {
    dh32: 315,
    dh33: 330,
    dh34: 375,
    dh35: 389,
    dh36: 312
  };
  var v107 = v2;
  var v108 = [];
  var v109 = /(2160|1080|720|480)[pP](?:\s+\w{1,15})?\s*\[([^\]]+)\]/g;
  var v110;
  while ((v110 = v109.exec(v105)) !== null) {
    var v111 = v110[1].toLowerCase() + "p";
    var v112 = v110[2];
    if (v111 === "480p") {
      continue;
    }
    var v113 = v110.index;
    var v114 = v105.substring(Math.max(0, v113 - 200), v113 + 600);
    var v115 = v114.match(/href="(https:\/\/hubcloud\.cx\/(?:drive|video)\/[^"]+)"/i);
    var v116 = v114.match(/href="(https:\/\/href\.li\/\?https:\/\/vcloud\.zip\/[^"]+)"/i);
    if (v115) {
      v108.push({
        quality: v111,
        size: v112,
        type: "hubcloud",
        url: v115[1]
      });
    } else if (v116) {
      v108.push({
        quality: v111,
        size: v112,
        type: "vcloud",
        url: v116[1]
      });
    }
  }
  return v108;
}
function extractVcloudUrl(v117) {
  var v118 = {
    dh37: 381
  };
  var v119 = v2;
  var v120 = v117.match(/href\.li\/\?https:\/\/vcloud\.zip\/([^"&?]+)/i);
  if (v120) {
    return "https://vcloud.zip/" + v120[1];
  }
  return null;
}
function processHubcloud(v121) {
  var v122 = {
    dh38: 400,
    dh39: 369,
    dh40: 374
  };
  return __async(this, null, function* () {
    var v123 = v1;
    var v124 = yield fetchText(v121, {
      headers: hdrs({
        Referer: abhilinksBase + "/"
      })
    });
    if (!v124) {
      return null;
    }
    var v125 = v124.match(/href="(https:\/\/[^"]*hubcloud\.php[^"]*)"/i);
    if (!v125) {
      return null;
    }
    var v126 = v125[1].replace(/&amp;/g, "&");
    var v127 = "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:152.0) Gecko/20100101 Firefox/152.0";
    var v128 = yield fetchText(v126, {
      headers: {
        "User-Agent": v127,
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        Referer: v121,
        DNT: "1",
        Cookie: "xla=s4t"
      }
    });
    if (!v128 || v128.length < 500) {
      return null;
    }
    return extractFSLLinks(v128);
  });
} /*decoder removed*/
function processVcloud(v129) {
  return __async(this, null, function* () {
    var v130 = v1;
    var v131 = yield fetchText(v129, {
      headers: hdrs({
        Referer: abhilinksBase + "/"
      })
    });
    if (!v131) {
      return null;
    }
    var v132 = v131.match(/atob\s*\(\s*atob\s*\(\s*['"]([^'"]+)['"]\s*\)\s*\)/);
    if (!v132) {
      return null;
    }
    var v133;
    var v134;
    try {
      v133 = atob(v132[1]);
      v134 = atob(v133);
    } catch (v135) {
      return null;
    }
    var v136 = yield fetchText(v134, {
      headers: hdrs({
        Referer: movieshuntBase + "/",
        Cookie: "xla=s4t"
      })
    });
    if (!v136) {
      return null;
    }
    return extractFSLLinks(v136);
  });
}
function extractFSLLinks(v137) {
  var v138 = {
    dh41: 311,
    dh42: 372,
    dh43: 372,
    dh44: 372,
    dh45: 366,
    dh46: 372,
    dh47: 306,
    dh48: 372,
    dh49: 401,
    dh50: 330,
    dh51: 335
  };
  var v139 = v2;
  var v140 = [];
  var v141 = v137.match(/<a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi);
  if (!v141) {
    return v140;
  }
  for (var v142 = 0; v142 < v141.length; v142++) {
    var v143 = v141[v142];
    var v144 = v143.match(/href="([^"]+)"/i);
    var v145 = v143.match(/>([\s\S]*?)<\/a>/i);
    if (!v144) {
      continue;
    }
    var v146 = v144[1].replace(/&amp;/g, "&");
    var v147 = v145 ? v145[1].replace(/<[^>]+>/g, "").trim() : "";
    if (!v146 || v146.indexOf("javascript:") === 0) {
      continue;
    }
    if (/telegram/i.test(v147) || /tg\//i.test(v146) || /pixeldrain/i.test(v146)) {
      continue;
    }
    if (/hubcloud\.cx|gpdl2/i.test(v146)) {
      continue;
    }
    var v148 = "";
    if (/cdn\.fsl-buckets\.life/i.test(v146) || /r2\.cloudflarestorage/i.test(v146) || /r2\.dev/i.test(v146)) {
      v148 = "FSLv2";
    } else if (/hub\.(latent|whistle)/i.test(v146)) {
      v148 = "FSL";
    } else if (/workers\.dev/i.test(v146)) {
      v148 = "Worker";
    } else {
      continue;
    }
    var v149 = "";
    var v150 = v147.match(/(2160|1080|720|480)\s*[pP]/i);
    if (v150) {
      v149 = v150[1].toLowerCase() + "p";
    }
    v140.push({
      url: v146,
      type: v148,
      quality: v149,
      rawText: v147
    });
  }
  return v140;
}
function dedupe(v151) {
  var v152 = {
    dh52: 399
  };
  var v153 = {
    dh53: 321,
    dh54: 321
  };
  var v154 = v2;
  var v155 = {};
  return (v151 || []).filter(function (v156) {
    var v157 = v154;
    if (!v156 || !v156.url) {
      return false;
    }
    if (v155[v156.url]) {
      return false;
    }
    v155[v156.url] = true;
    return true;
  });
}
function extractEpisodes(v158) {
  var v159 = {
    dh55: 335,
    dh56: 315
  };
  var v160 = v2;
  var v161 = [];
  var v162 = /-:\s*Episodes?\s*:\s*(\d+)\s*:-/gi;
  var v163 = [];
  var v164;
  while ((v164 = v162.exec(v158)) !== null) {
    v163.push({
      num: parseInt(v164[1]),
      idx: v164.index
    });
  }
  if (v163.length === 0) {
    var v165 = />\s*Episode\s*(\d+)\s*</gi;
    while ((v164 = v165.exec(v158)) !== null) {
      v163.push({
        num: parseInt(v164[1]),
        idx: v164.index
      });
    }
  }
  for (var v166 = 0; v166 < v163.length; v166++) {
    var v167 = v163[v166].idx;
    var v168 = v166 + 1 < v163.length ? v163[v166 + 1].idx : v158.length;
    var v169 = v158.substring(v167, v168);
    var v170 = [];
    var v171 = /href="(https:\/\/hubcloud\.cx\/(?:drive|video)\/[^"]+)"/gi;
    var v172;
    while ((v172 = v171.exec(v169)) !== null) {
      v170.push({
        type: "hubcloud",
        url: v172[1]
      });
    }
    var v173 = /href="(https:\/\/href\.li\/\?https:\/\/vcloud\.zip\/[^"]+)"/gi;
    while ((v172 = v173.exec(v169)) !== null) {
      var v174 = extractVcloudUrl(v172[1]);
      if (v174) {
        v170.push({
          type: "vcloud",
          url: v174
        });
      }
    }
    if (v170.length) {
      v161.push({
        number: v163[v166].num,
        links: v170
      });
    }
  }
  return v161;
}
function extractSeasonLinks(v175) {
  var v176 = {
    dh57: 375,
    dh58: 374,
    dh59: 381,
    dh60: 314,
    dh61: 381
  };
  var v177 = v2;
  var v178 = {};
  var v179 = /<h4[^>]*>([\s\S]*?)<\/h4>/gi;
  var v180 = [];
  var v181;
  while ((v181 = v179.exec(v175)) !== null) {
    v180.push({
      inner: v181[1],
      start: v181.index,
      end: v181.index + v181[0].length
    });
  }
  for (var v182 = 0; v182 < v180.length; v182++) {
    var v183 = v180[v182];
    var v184 = v183.inner.match(/Season\s+(\d+)/i);
    var v185 = v183.inner.match(/(\d+p)/i);
    if (!v184 || !v185) {
      continue;
    }
    var v186 = parseInt(v184[1]);
    var v187 = v185[1].toLowerCase();
    var v188 = v180[v182].end;
    var v189 = v182 + 1 < v180.length ? v180[v182 + 1].start : v175.length;
    var v190 = v175.substring(v188, v189);
    var v191 = v190.match(/href="(https:\/\/abhilinks\.(?:life|site)\/archives\/\d+)\/?"/i);
    if (v191) {
      if (!v178[v186]) {
        v178[v186] = {};
      }
      if (!v178[v186][v187]) {
        v178[v186][v187] = v191[1];
      }
    }
  }
  return v178;
}
function parseLanguage(v192) {
  var v193 = {
    dh62: 351,
    dh63: 342,
    dh64: 338,
    dh65: 291,
    dh66: 391
  };
  var v194 = v2;
  var v195 = String(v192 || "").toLowerCase();
  var v196 = ["tamil", "telugu", "bengali", "malayalam", "kannada", "marathi", "punjabi"];
  var v197 = 0;
  for (var v198 = 0; v198 < v196.length; v198++) {
    if (v195.indexOf(v196[v198]) !== -1) {
      v197++;
    }
  }
  if (v197 >= 1 || v195.indexOf("multi") !== -1) {
    return "Multi-Audio";
  }
  if (v195.indexOf("dual") !== -1 || v195.indexOf("hindi") !== -1 && v195.indexOf("english") !== -1) {
    return "Dual-Audio";
  }
  return "Dual-Audio";
}
function buildDropdownMetadata(v199, v200, v201, v202, v203, v204, v205, v206, v207) {
  var v208 = {
    dh67: 304,
    dh68: 334,
    dh69: 378,
    dh70: 302,
    dh71: 291,
    dh72: 324,
    dh73: 383,
    dh74: 291,
    dh75: 292,
    dh76: 409,
    dh77: 344,
    dh78: 291,
    dh79: 291,
    dh80: 360,
    dh81: 386,
    dh82: 335,
    dh83: 352,
    dh84: 359,
    dh85: 305,
    dh86: 291,
    dh87: 339,
    dh88: 332,
    dh89: 370,
    dh90: 300,
    dh91: 392,
    dh92: 403
  };
  var v209 = v2;
  var v210 = (v203 ? v199.name : v199.title) || "Unknown Title";
  var v211 = v203 ? (v199.first_air_date || "").split("-")[0] : (v199.release_date || "").split("-")[0];
  var v212 = v211 ? " (" + v211 + ")" : "";
  var v213 = (String(v206) + " " + String(v207)).toLowerCase();
  var v214 = v203 ? "🎬 " : "🍿 ";
  var v215 = v214 + v210 + v212;
  if (v203 && v204 != null && v205 != null) {
    v215 += " | S" + String(v204).padStart(2, "0") + " E" + String(v205).padStart(2, "0");
  }
  var v216 = "💎";
  if (v200.indexOf("2160") !== -1 || v200.indexOf("4k") !== -1) {
    v216 = "🌟";
  } else if (v200.indexOf("1080") !== -1) {
    v216 = "🔥";
  }
  var v217 = v213.match(/(\d+(?:\.\d+)?\s*(?:gb|mb))/i);
  var v218 = v217 ? v217[1].toUpperCase() : v201 || "Variable Size";
  var v219 = v216 + " " + v200 + " | 💾 " + v218;
  var v220 = "SDR";
  if (v213.indexOf("hdr10+") !== -1) {
    v220 = "HDR10+";
  } else if (v213.indexOf("hdr10") !== -1) {
    v220 = "HDR10";
  } else if (v213.indexOf("hdr") !== -1) {
    v220 = "HDR";
  }
  var v221 = "";
  if (v213.indexOf("10bit") !== -1 || v213.indexOf("10-bit") !== -1) {
    v221 = " • 10Bit";
  }
  var v222 = "🎥 x264";
  if (v213.indexOf("hevc") !== -1) {
    v222 = "⚡ HEVC";
  } else if (v213.indexOf("x265") !== -1 || v213.indexOf("h265") !== -1) {
    v222 = "🎥 x265";
  }
  var v223 = v207.indexOf(".mp4") !== -1 ? "MP4" : "MKV";
  var v224 = "🌈 " + v220 + v221 + " | " + v222 + " | 📦 " + v223;
  var v225 = parseLanguage(v213);
  var v226 = [];
  if (v213.indexOf("ddp5.1") !== -1 || v213.indexOf("ddp 5.1") !== -1) {
    v226.push("DDP5.1");
  }
  if (v213.indexOf("truehd") !== -1) {
    v226.push("TrueHD");
  }
  if (v213.indexOf("dd5.1") !== -1 || v213.indexOf("5.1") !== -1) {
    if (v226.indexOf("DDP5.1") === -1) {
      v226.push("DD 5.1");
    }
  }
  if (v226.length === 0) {
    v226.push("AAC");
  }
  var v227 = v226.join(" • ");
  var v228 = v213.indexOf("atmos") !== -1 ? " | 🔊 Atmos" : "";
  var v229 = "🔈 " + v225 + " | 🎧 " + v227 + v228;
  var v230 = "📥 WEB-DL";
  if (v213.indexOf("web-rip") !== -1 || v213.indexOf("webrip") !== -1) {
    v230 = "🌐 WEB-RIP";
  } else if (v213.indexOf("bluray") !== -1) {
    v230 = "💿 Blu-Ray";
  }
  var v231 = "🔗 " + (v202 || "FSL") + " | " + v230;
  return v215 + "\n" + v219 + "\n" + v224 + "\n" + v229 + "\n" + v231;
}
function getStreams(v232, v233, v234, v235) {
  var v236 = {
    dh93: 345,
    dh94: 404,
    dh95: 387,
    dh96: 374,
    dh97: 398,
    dh98: 407,
    dh99: 373,
    dh100: 364,
    dh101: 374,
    dh102: 402,
    dh103: 374,
    dh104: 384,
    dh105: 321,
    dh106: 371,
    dh107: 396,
    dh108: 333,
    dh109: 331,
    dh110: 321,
    dh111: 335,
    dh112: 364,
    dh113: 355,
    dh114: 297
  };
  return __async(this, null, function* () {
    var v237 = {
      dh115: 330,
      dh116: 365
    };
    var v238 = v1;
    currentUA = UAS[Math.floor(Math.random() * UAS.length)];
    log("getStreams(" + v232 + ", " + v233 + ", " + v234 + ", " + v235 + ")");
    var v239 = v233 === "tv" || v233 === "series";
    var v240 = yield getTMDBInfo(v232, v233);
    if (!v240) {
      log("TMDB fetch failed");
      return [];
    }
    var v241 = v239 ? v240.name : v240.title;
    if (!v241) {
      log("No title from TMDB");
      return [];
    }
    log("Title: " + v241);
    var v242 = yield searchSite(v241);
    if (!v242 || !v242.length) {
      log("Search failed");
      return [];
    }
    log("Search results: " + v242.length);
    var v243 = matchHits(v242, v240, v239);
    if (!v243.length) {
      log("No match found");
      return [];
    }
    log("Matches: " + v243.length);
    for (var v244 = 0; v244 < v243.length; v244++) {
      let v245 = function (v246) {
        var v247 = v238;
        var v248 = v246.toLowerCase();
        if (v248.indexOf("2160p") !== -1 || v248.indexOf("4k") !== -1) {
          return 2160;
        }
        if (v248.indexOf("1080p") !== -1) {
          return 1080;
        }
        if (v248.indexOf("720p") !== -1) {
          return 720;
        }
        if (v248.indexOf("480p") !== -1) {
          return 480;
        }
        return 0;
      };
      var v249 = v245;
      var v250 = v243[v244];
      var v251 = v250.url;
      log("Trying post: " + v251);
      var v252 = yield fetchText(v251, {
        headers: hdrs()
      });
      if (!v252) {
        continue;
      }
      var v253 = [];
      if (v239) {
        var v254 = v234 !== undefined && v234 !== null && v234 !== "undefined" ? parseInt(v234) : null;
        var v255 = v235 !== undefined && v235 !== null && v235 !== "undefined" ? parseInt(v235) : null;
        var v256 = [];
        if (v254) {
          var v257 = extractSeasonLinks(v252);
          if (v257[v254]) {
            var v258 = Object.keys(v257[v254]).sort(function (v259, v260) {
              return parseInt(v260) - parseInt(v259);
            });
            v258.forEach(function (v261) {
              var v262 = v238;
              v256.push({
                quality: v261,
                url: v257[v254][v261]
              });
            });
            log("S" + v254 + " qualities: " + v258.join(", "));
          }
        }
        if (!v256.length) {
          var v263 = extractAbhilinksUrl(v252);
          if (v263) {
            v256.push({
              quality: "",
              url: v263
            });
          }
        }
        if (!v256.length) {
          log("No abhilinks URLs, trying next match");
          continue;
        }
        var v264 = [];
        for (var v265 = 0; v265 < v256.length; v265++) {
          var v266 = v256[v265];
          log("Fetching " + (v266.quality || "default") + ": " + v266.url);
          var v267 = yield fetchText(v266.url, {
            headers: hdrs()
          });
          if (!v267) {
            log("  fetch failed");
            continue;
          }
          var v268 = extractEpisodes(v267);
          if (!v268.length) {
            log("  no episodes");
            continue;
          }
          var v269 = v268;
          if (v255) {
            v269 = v268.filter(function (v270) {
              return v270.number === v255;
            });
            if (!v269.length) {
              log("  episode " + v255 + " not found");
              continue;
            }
          }
          for (var v271 = 0; v271 < v269.length; v271++) {
            var v272 = v269[v271];
            for (var v273 = 0; v273 < v272.links.length; v273++) {
              var v274 = v272.links[v273];
              v264.push(function (v275, v276, v277) {
                var v278 = {
                  dh117: 371
                };
                return function () {
                  var v279 = {
                    dh118: 331
                  };
                  return __async(this, null, function* () {
                    var v280 = v1;
                    var v281 = null;
                    if (v276.type === "hubcloud") {
                      v281 = yield processHubcloud(v276.url);
                    } else if (v276.type === "vcloud") {
                      v281 = yield processVcloud(v276.url);
                    }
                    if (v281) {
                      v281.forEach(function (v282) {
                        var v283 = v280;
                        v282.episode = v275;
                        v282.quality = v282.quality || v277;
                      });
                    }
                    return v281;
                  });
                };
              }(v272.number, v274, v266.quality));
            }
          }
        }
        if (!v264.length) {
          log("No hubcloud/vcloud tasks");
          continue;
        }
        log("Processing " + v264.length + " hubcloud/vcloud links...");
        var v284 = yield Promise.all(v264.map(function (v285) {
          return v285();
        }));
        for (var v286 = 0; v286 < v284.length; v286++) {
          if (!v284[v286]) {
            continue;
          }
          for (var v287 = 0; v287 < v284[v286].length; v287++) {
            var v288 = v284[v286][v287];
            var v289 = (v288.quality || "").toLowerCase();
            if (v289 === "480p" || v289 === "hd") {
              continue;
            }
            var v290 = v289 || "1080p";
            var v291 = (v288.rawText || "") + " " + v288.url;
            var v292 = parseLanguage(v291);
            var v293 = buildDropdownMetadata(v240, v290, "", v288.type, true, v254, v288.episode, v291, v288.url);
            v253.push({
              name: PROVIDER_NAME + " | " + v290 + " | " + v292,
              title: v293,
              size: v293,
              description: v293,
              url: v288.url,
              quality: "",
              language: "",
              headers: {
                Referer: movieshuntBase + "/",
                "User-Agent": currentUA
              }
            });
          }
        }
      } else {
        var v294 = extractAbhilinksUrl(v252);
        if (!v294) {
          log("No abhilinks URL, trying next match");
          continue;
        }
        log("Abhilinks: " + v294);
        var v267 = yield fetchText(v294, {
          headers: hdrs()
        });
        if (!v267) {
          log("Abhilinks fetch failed");
          continue;
        }
        var v295 = extractQualityOptions(v267);
        if (!v295.length) {
          log("No quality options found");
          continue;
        }
        log("Quality options: " + v295.length);
        var v296 = [];
        for (var v297 = 0; v297 < v295.length; v297++) {
          var v298 = v295[v297];
          v296.push(function (v299) {
            var v300 = {
              dh119: 321
            };
            return function () {
              return __async(this, null, function* () {
                var v301 = v1;
                if (v299.type === "hubcloud") {
                  return yield processHubcloud(v299.url);
                } else if (v299.type === "vcloud") {
                  var v302 = extractVcloudUrl(v299.url);
                  if (!v302) {
                    return null;
                  }
                  return yield processVcloud(v302);
                }
                return null;
              });
            };
          }(v298));
        }
        var v303 = yield Promise.all(v296.map(function (v304) {
          return v304();
        }));
        for (var v305 = 0; v305 < v303.length; v305++) {
          if (!v303[v305]) {
            continue;
          }
          var v306 = v295[v305];
          for (var v307 = 0; v307 < v303[v305].length; v307++) {
            var v308 = v303[v305][v307];
            var v309 = (v308.quality || v306.quality || "").toLowerCase();
            if (v309 === "480p" || v309 === "hd") {
              continue;
            }
            var v290 = v309 || "1080p";
            var v310 = v306.size || "";
            var v291 = (v308.rawText || "") + " " + v308.url + " " + v310;
            var v292 = parseLanguage(v291);
            var v293 = buildDropdownMetadata(v240, v290, v310, v308.type, false, null, null, v291, v308.url);
            v253.push({
              name: "🏹 " + PROVIDER_NAME + " | " + v290 + " | " + v292,
              title: v293,
              size: v293,
              description: v293,
              url: v308.url,
              quality: "",
              language: "",
              headers: {
                Referer: movieshuntBase + "/",
                "User-Agent": currentUA
              }
            });
          }
        }
      }
      v253 = dedupe(v253);
      v253.sort(function (v311, v312) {
        var v313 = v238;
        return v245(v312.name) - v245(v311.name);
      });
      if (v253.length > 0) {
        log("Returning " + v253.length + " streams from " + v251);
        return v253;
      }
      log("No streams from this post, trying next match");
    }
    log("No streams from any match");
    return [];
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
  var PROVIDER = "movieshunt";
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