/*
 * nv-plugins vidsrc.js — FULLY DECODED port of the All-in-One-Nuvio provider (4.24.0 merge pass).
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
    dh1: 302
  };
  var v7 = {
    dh2: 314
  };
  return new Promise((v8, v9) => {
    var v10 = v1;
    var v11 = v12 => {
      var v13 = v1;
      try {
        v14(v5.next(v12));
      } catch (v15) {
        v9(v15);
      }
    };
    var v16 = v17 => {
      var v18 = v1;
      try {
        v14(v5.throw(v17));
      } catch (v19) {
        v9(v19);
      }
    };
    var v14 = v20 => v20.done ? v8(v20.value) : Promise.resolve(v20.value).then(v11, v16);
    v14((v5 = v5.apply(v3, v4)).next());
  });
};
var BASEDOM = "https://whisperingauroras.com";
var UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36";
var TMDB_API_KEY = "439c478a771f35c05022f9feabcca01c";
function safeFetch(v21, v22, v23) {
  var v24 = {
    dh3: 312,
    dh4: 266
  };
  var v25 = {
    dh5: 338
  };
  var v26 = v2;
  v23 = v23 || 8000;
  var v27;
  var v28;
  try {
    v27 = new AbortController();
    v28 = setTimeout(function () {
      var v29 = v1;
      v27.abort();
    }, v23);
  } catch (v30) {
    v27 = null;
  }
  var v31 = Object.assign({
    method: "GET"
  }, v22 || {});
  if (v27) {
    v31.signal = v27.signal;
  }
  return __nvFetch(v21, v31).then(function (v32) {
    if (v28) {
      clearTimeout(v28);
    }
    return v32;
  }).catch(function (v33) {
    if (v28) {
      clearTimeout(v28);
    }
    throw v33;
  });
}
function bMGyx71TzQLfdonN(v34) {
  var v35 = {
    dh6: 345,
    dh7: 280
  };
  var v36 = v2;
  var v37 = 3;
  var v38 = [];
  if (typeof v34 !== "string") {
    return "";
  }
  for (var v39 = 0; v39 < v34.length; v39 += v37) {
    v38.push(v34.slice(v39, v39 + v37));
  }
  return v38.reverse().join("");
}
function Iry9MQXnLs(v40) {
  var v41 = {
    dh8: 313,
    dh9: 321,
    dh10: 268,
    dh11: 268
  };
  var v42 = v2;
  var v43 = "pWB9V)[*4I`nJpp?ozyB~dbr9yt!_n4u";
  var v44 = v40.match(/.{1,2}/g).map(function (v45) {
    return String.fromCharCode(parseInt(v45, 16));
  }).join("");
  var v46 = "";
  for (var v47 = 0; v47 < v44.length; v47++) {
    v46 += String.fromCharCode(v44.charCodeAt(v47) ^ v43.charCodeAt(v47 % v43.length));
  }
  var v48 = "";
  for (var v49 = 0; v49 < v46.length; v49++) {
    v48 += String.fromCharCode(v46.charCodeAt(v49) - 3);
  }
  try {
    return atob(v48);
  } catch (v50) {
    return "";
  }
}
function IGLImMhWrI(v51) {
  var v52 = {
    dh12: 321,
    dh13: 299,
    dh14: 321
  };
  var v53 = v2;
  var v54 = v51.split("").reverse().join("");
  var v55 = v54.replace(/[a-zA-Z]/g, function (v56) {
    return String.fromCharCode(v56.charCodeAt(0) + (v56.toLowerCase() < "n" ? 13 : -13));
  });
  var v57 = v55.split("").reverse().join("");
  try {
    return atob(v57);
  } catch (v58) {
    return "";
  }
}
function GTAxQyTyBx(v59) {
  var v60 = {
    dh15: 299
  };
  var v61 = v2;
  var v62 = v59.split("").reverse().join("");
  var v63 = "";
  for (var v64 = 0; v64 < v62.length; v64 += 2) {
    v63 += v62[v64];
  }
  try {
    return atob(v63);
  } catch (v65) {
    return "";
  }
}
function C66jPHx8qu(v66) {
  var v67 = {
    dh16: 337
  };
  var v68 = {
    dh17: 303
  };
  var v69 = v2;
  var v70 = v66.split("").reverse().join("");
  var v71 = "X9a(O;FMV2-7VO5x;Ao :dN1NoFs?j,";
  var v72 = v70.match(/.{1,2}/g).map(function (v73) {
    var v74 = v69;
    return String.fromCharCode(parseInt(v73, 16));
  }).join("");
  var v75 = "";
  for (var v76 = 0; v76 < v72.length; v76++) {
    v75 += String.fromCharCode(v72.charCodeAt(v76) ^ v71.charCodeAt(v76 % v71.length));
  }
  return v75;
}
function MyL1IRSfHe(v77) {
  var v78 = v2;
  var v79 = v77.split("").reverse().join("");
  var v80 = "";
  for (var v81 = 0; v81 < v79.length; v81++) {
    v80 += String.fromCharCode(v79.charCodeAt(v81) - 1);
  }
  var v82 = "";
  for (var v83 = 0; v83 < v80.length; v83 += 2) {
    v82 += String.fromCharCode(parseInt(v80.substr(v83, 2), 16));
  }
  return v82;
}
function detdj7JHiK(v84) {
  var v85 = {
    dh18: 277
  };
  var v86 = v2;
  var v87 = v84.slice(10, -16);
  var v88 = "3SAY~#%Y(V%>5d/Yg\"$G[Lh1rK4a;7ok";
  var v89 = "";
  try {
    v89 = atob(v87);
  } catch (v90) {
    return "";
  }
  var v91 = v88.repeat(Math.ceil(v89.length / v88.length)).substring(0, v89.length);
  var v92 = "";
  for (var v93 = 0; v93 < v89.length; v93++) {
    v92 += String.fromCharCode(v89.charCodeAt(v93) ^ v91.charCodeAt(v93));
  }
  return v92;
}
function nZlUnj2VSo(v94) {
  var v95 = v2;
  var v96 = {
    x: "a",
    y: "b",
    z: "c",
    a: "d",
    b: "e",
    c: "f",
    d: "g",
    e: "h",
    f: "i",
    g: "j",
    h: "k",
    i: "l",
    j: "m",
    k: "n",
    l: "o",
    m: "p",
    n: "q",
    o: "r",
    p: "s",
    q: "t",
    r: "u",
    s: "v",
    t: "w",
    u: "x",
    v: "y",
    w: "z",
    X: "A",
    Y: "B",
    Z: "C",
    A: "D",
    B: "E",
    C: "F",
    D: "G",
    E: "H",
    F: "I",
    G: "J",
    H: "K",
    I: "L",
    J: "M",
    K: "N",
    L: "O",
    M: "P",
    N: "Q",
    O: "R",
    P: "S",
    Q: "T",
    R: "U",
    S: "V",
    T: "W",
    U: "X",
    V: "Y",
    W: "Z"
  };
  return v94.replace(/[xyzabcdefghijklmnopqrstuvwXYZABCDEFGHIJKLMNOPQRSTUVW]/g, function (v97) {
    return v96[v97] || v97;
  });
}
function laM1dAi3vO(v98) {
  var v99 = {
    dh19: 321,
    dh20: 303
  };
  var v100 = v2;
  var v101 = v98.split("").reverse().join("");
  var v102 = v101.replace(/-/g, "+").replace(/_/g, "/");
  var v103 = "";
  try {
    v103 = atob(v102);
  } catch (v104) {
    return "";
  }
  var v105 = "";
  for (var v106 = 0; v106 < v103.length; v106++) {
    v105 += String.fromCharCode(v103.charCodeAt(v106) - 5);
  }
  return v105;
} /*string-table removed*/
function GuxKGDsA2T(v107) {
  var v108 = {
    dh21: 320
  };
  var v109 = v2;
  var v110 = v107.split("").reverse().join("");
  var v111 = v110.replace(/-/g, "+").replace(/_/g, "/");
  var v112 = "";
  try {
    v112 = atob(v111);
  } catch (v113) {
    return "";
  }
  var v114 = "";
  for (var v115 = 0; v115 < v112.length; v115++) {
    v114 += String.fromCharCode(v112.charCodeAt(v115) - 7);
  }
  return v114;
}
function LXVUMCoAHJ(v116) {
  var v117 = {
    dh22: 321,
    dh23: 329,
    dh24: 320,
    dh25: 303
  };
  var v118 = v2;
  var v119 = v116.split("").reverse().join("");
  var v120 = v119.replace(/-/g, "+").replace(/_/g, "/");
  var v121 = "";
  try {
    v121 = atob(v120);
  } catch (v122) {
    return "";
  }
  var v123 = "";
  for (var v124 = 0; v124 < v121.length; v124++) {
    v123 += String.fromCharCode(v121.charCodeAt(v124) - 3);
  }
  return v123;
}
function decrypt(v125, v126) {
  var v127 = {
    dh26: 258,
    dh27: 267
  };
  var v128 = v2;
  switch (v126) {
    case "LXVUMCoAHJ":
      return LXVUMCoAHJ(v125);
    case "GuxKGDsA2T":
      return GuxKGDsA2T(v125);
    case "laM1dAi3vO":
      return laM1dAi3vO(v125);
    case "nZlUnj2VSo":
      return nZlUnj2VSo(v125);
    case "Iry9MQXnLs":
      return Iry9MQXnLs(v125);
    case "IGLImMhWrI":
      return IGLImMhWrI(v125);
    case "GTAxQyTyBx":
      return GTAxQyTyBx(v125);
    case "C66jPHx8qu":
      return C66jPHx8qu(v125);
    case "MyL1IRSfHe":
      return MyL1IRSfHe(v125);
    case "detdj7JHiK":
      return detdj7JHiK(v125);
    case "bMGyx71TzQLfdonN":
      return bMGyx71TzQLfdonN(v125);
    default:
      return null;
  }
}
function serversLoad(v129) {
  var v130 = {
    dh28: 313
  };
  var v131 = v2;
  var v132 = [];
  var v133 = v129.match(/<title>([^<]*)<\/title>/i);
  var v134 = v133 ? v133[1] : "";
  var v135 = v129.match(/<iframe\s+[^>]*src="([^"]*)"/i);
  var v136 = v135 ? v135[1] : "";
  if (v136) {
    BASEDOM = new URL(v136.startsWith("//") ? "https:" + v136 : v136).origin;
  }
  var v137 = /class="[^"]*server[^"]*"[^>]*data-hash="([^"]*)"[^>]*>([^<]*)/g;
  var v138;
  while ((v138 = v137.exec(v129)) !== null) {
    v132.push({
      name: v138[2].trim(),
      dataHash: v138[1]
    });
  }
  return {
    servers: v132,
    title: v134
  };
}
function PRORCPhandler(v139) {
  var v140 = {
    dh29: 329,
    dh30: 329,
    dh31: 325,
    dh32: 325,
    dh33: 305
  };
  return __async(this, null, function* () {
    var v141 = v1;
    try {
      var v142 = yield safeFetch(BASEDOM + "/prorcp/" + v139, {
        headers: {
          Referer: "https://vidsrc.me/",
          "User-Agent": UA
        }
      }, 5000);
      var v143 = yield v142.text();
      var v144 = v143.match(/<script\s+src="\/([^"]*\.js)\?\_=([^"]*)"><\/script>/gm);
      if (!v144) {
        return null;
      }
      var v145 = v144[v144.length - 1].includes("cpt.js") ? v144[v144.length - 2].replace(/.*src="\/([^"]*\.js)\?\_=([^"]*)".*/, "$1?_=$2") : v144[v144.length - 1].replace(/.*src="\/([^"]*\.js)\?\_=([^"]*)".*/, "$1?_=$2");
      var v146 = yield safeFetch(BASEDOM + "/" + v145, {}, 5000);
      var v147 = yield v146.text();
      var v148 = /{}\}window\[([^"]+)\("([^"]+)"\)/;
      var v149 = v147.match(v148);
      if (!v149 || v149.length < 3) {
        return null;
      }
      var v150 = v149[1].toString().trim();
      var v151 = v149[2].toString().trim();
      var v152 = decrypt(v151, v150);
      if (!v152) {
        return null;
      }
      var v153 = new RegExp("id=\"" + v152 + "\"[^>]*>([^<]*)", "i");
      var v154 = v143.match(v153);
      if (!v154) {
        return null;
      }
      var v155 = v154[1].trim();
      var v156 = decrypt(v155, v151);
      return v156;
    } catch (v157) {
      console.log("[VidSrc.me] PRORCPhandler error: " + v157.message);
      return null;
    }
  });
}
function rcpGrabber(v158) {
  var v159 = v2;
  var v160 = /src:\s*'([^']*)'/;
  var v161 = v158.match(v160);
  if (!v161) {
    return null;
  }
  return v161[1];
} /*decoder removed*/
function cleanTitleString(v162) {
  var v163 = v2;
  if (!v162) {
    return {
      title: "VidSrc Media",
      year: "2026"
    };
  }
  var v164 = v162.replace(/\s*-\s*VidSrc\.me$/i, "").trim();
  var v165 = v164.match(/\s*\((\d{4})\)$/);
  var v166 = "2026";
  if (v165) {
    v166 = v165[1];
    v164 = v164.replace(/\s*\(\d{4}\)$/, "").trim();
  }
  return {
    title: v164,
    year: v166
  };
}
function fetchTMDBDuration(v167, v168, v169, v170) {
  var v171 = {
    dh34: 298,
    dh35: 310,
    dh36: 289,
    dh37: 300,
    dh38: 270,
    dh39: 324,
    dh40: 320
  };
  return __async(this, null, function* () {
    var v172 = v1;
    let v173 = v168 === "tv" ? "45 min" : "90 min";
    try {
      const v174 = v168 === "tv" ? "tv" : "movie";
      const v175 = String(v167).replace(/\D/g, "");
      const v176 = "https://api.themoviedb.org/3/" + v174 + "/" + v175 + "?api_key=" + TMDB_API_KEY + "&append_to_response=external_ids";
      const v177 = yield __nvFetch(v176);
      if (!v177.ok) {
        return v173;
      }
      const v178 = yield v177.json();
      let v179 = v173;
      if (v168 === "movie" && v178.runtime) {
        v179 = v178.runtime + " min";
      } else if (v168 === "tv" && v169 != null && v170 != null) {
        const v180 = "https://api.themoviedb.org/3/tv/" + v175 + "/season/" + v169 + "/episode/" + v170 + "?api_key=" + TMDB_API_KEY;
        const v181 = yield __nvFetch(v180);
        if (v181.ok) {
          const v182 = yield v181.json();
          if (v182.runtime) {
            v179 = v182.runtime + " min";
          } else if (v178.episode_run_time && v178.episode_run_time.length > 0) {
            v179 = v178.episode_run_time[0] + " min";
          }
        }
      }
      return v179;
    } catch (v183) {
      return v173;
    }
  });
}
function getStreams(v184, v185, v186, v187) {
  var v188 = {
    dh41: 294,
    dh42: 330,
    dh43: 282,
    dh44: 262,
    dh45: 288,
    dh46: 322,
    dh47: 326,
    dh48: 293,
    dh49: 319,
    dh50: 323,
    dh51: 320,
    dh52: 325,
    dh53: 309,
    dh54: 271,
    dh55: 318,
    dh56: 316,
    dh57: 275,
    dh58: 327,
    dh59: 273
  };
  return __async(this, null, function* () {
    var v189 = v1;
    try {
      var v190 = v185 === "movie";
      var v191 = v190 ? "https://vidsrc.me/embed/" + v184 : "https://vidsrc.me/embed/" + v184 + "/" + (v186 || 1) + "-" + (v187 || 1);
      console.log("[VidSrc.me] Fetching embed page: " + v191);
      var v192 = safeFetch(v191, {}, 8000);
      var v193 = fetchTMDBDuration(v184, v185, v186, v187);
      var v194 = yield v192;
      var v195 = yield v194.text();
      var v196 = yield v193;
      var v197 = serversLoad(v195);
      var v198 = v197.servers;
      var v199 = cleanTitleString(v197.title);
      var v200 = v199.title;
      var v201 = v199.year;
      console.log("[VidSrc.me] Parsed servers: " + v198.length);
      var v202 = [];
      for (var v203 = 0; v203 < v198.length; v203++) {
        var v204 = v198[v203];
        try {
          console.log("[VidSrc.me] Fetching RCP for server: " + v204.name);
          var v205 = yield safeFetch(BASEDOM + "/rcp/" + v204.dataHash, {}, 5000);
          var v206 = yield v205.text();
          var v207 = rcpGrabber(v206);
          if (v207 && v207.substring(0, 8) === "/prorcp/") {
            console.log("[VidSrc.me] Resolving server prorcp: " + v204.name);
            var v208 = yield PRORCPhandler(v207.replace("/prorcp/", ""));
            if (v208) {
              var v209 = v208;
              if (v209.includes("__TOKEN__") || v209.includes("__TOKENPG__")) {
                try {
                  var v210 = new URL(v209.split(" or ")[0]);
                  var v211 = v210.hostname;
                  console.log("[VidSrc.me] Generating token for host: " + v211);
                  var v212 = yield safeFetch("https://" + v211 + "/generate.php", {
                    headers: {
                      Referer: "https://vidsrc.me/",
                      "User-Agent": UA
                    }
                  }, 4000);
                  var v213 = yield v212.text();
                  var v214 = v213.trim();
                  if (v214 && v214.length > 10) {
                    v209 = v209.replace(/__TOKEN__/g, v214).replace(/__TOKENPG__/g, v214);
                    console.log("[VidSrc.me] Token successfully generated & injected");
                  }
                } catch (v215) {
                  console.log("[VidSrc.me] Token generation failed: " + v215.message);
                }
              }
              var v216 = v209.split(" or ");
              for (var v217 = 0; v217 < v216.length; v217++) {
                var v218 = v216[v217].trim();
                if (!v218) {
                  continue;
                }
                var v219 = "1080p";
                if (v218.includes("/720/") || v218.includes("720p") || v218.includes("/7e39f")) {
                  v219 = "720p";
                } else if (v218.includes("/360/") || v218.includes("360p") || v218.includes("/7a67b")) {
                  v219 = "360p";
                } else if (v218.includes("/1080/") || v218.includes("1080p")) {
                  v219 = "1080p";
                }
                var v220 = v219.toLowerCase();
                var v221 = v204.name.replace(/\D+/g, "");
                var v222 = v221 ? "Server " + v221 : "Server " + (v203 + 1);
                if (v216.length > 1) {
                  v222 += " (Variant " + (v217 + 1) + ")";
                }
                var v223 = "MKV";
                if (v218.includes(".m3u8")) {
                  v223 = "M3U8";
                } else if (v218.includes(".mp4")) {
                  v223 = "MP4";
                }
                var v224 = "VidSrc | " + v220 + " | Original-Audio";
                var v225 = !v190 && v186 && v187 ? " S" + String(v186).padStart(2, "0") + "E" + String(v187).padStart(2, "0") : "";
                var v226 = "📽️ " + v200 + v225 + " - (" + v201 + ")";
                var v227 = "⭐ " + v220 + " | 🌍 Original-Audio | 🎧 AAC";
                var v228 = "🎞️ " + v223 + " | 🎥 x264 | ⏳ " + v196;
                var v229 = "📎 " + v222;
                var v230 = v226 + "\n" + v227 + "\n" + v228 + "\n" + v229;
                v202.push({
                  name: v224,
                  title: v230,
                  size: v230,
                  description: v230,
                  url: v218,
                  quality: "",
                  language: "",
                  headers: {},
                  subtitles: [],
                  provider: "vidsrcme"
                });
              }
            }
          }
        } catch (v231) {
          console.log("[VidSrc.me] Server " + v204.name + " error: " + v231.message);
        }
      }
      console.log("[VidSrc.me] Scraped streams: " + v202.length);
      return v202;
    } catch (v232) {
      console.log("[VidSrc.me] Scraper error: " + v232.message);
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
  var PROVIDER = "vidsrc";
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