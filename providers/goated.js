/*
 * nv-plugins goated.js — FULLY DECODED port of the All-in-One-Nuvio provider (4.24.0 merge pass).
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
    const v8 = v1;
    var v9 = v10 => {
      const v11 = v1;
      try {
        v12(v5.next(v10));
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
    var v12 = v18 => v18.done ? v6(v18.value) : Promise.resolve(v18.value).then(v9, v14);
    v12((v5 = v5.apply(v3, v4)).next());
  });
};
var TMDB_API_KEY = "1865f43a0549ca50d341dd9ab8b29f49";
var DOMAINS_URL = "https://raw.githubusercontent.com/sapariyaneel/nuvio-plugin/refs/heads/main/domains.json";
var FALLBACK_API_HOST = "https://api.reallyfast.xyz";
var HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  Referer: "https://goated.cx/",
  Origin: "https://goated.cx"
};
var cachedDomains = null;
function getDomains() {
  return __async(this, null, function* () {
    if (cachedDomains) {
      return cachedDomains;
    }
    try {
      const v19 = yield __nvFetch(DOMAINS_URL, {
        skipSizeCheck: true
      });
      cachedDomains = yield v19.json();
    } catch (v20) {
      cachedDomains = {};
    }
    return cachedDomains;
  });
} /*string-table removed*/ /*decoder removed*/
function getApiHost() {
  const v21 = {
    dh1: 202
  };
  return __async(this, null, function* () {
    const v22 = v1;
    const v23 = yield getDomains();
    return (v23.reallyfast || v23["api.reallyfast.xyz"] || FALLBACK_API_HOST).replace(/\/+$/, "");
  });
}
function getInvertedSortTag(v24, v25 = 999999) {
  const v26 = {
    dh2: 218,
    dh3: 212
  };
  const v27 = v1;
  const v28 = Math.max(0, parseInt(v24, 10) || 0);
  const v29 = Math.max(0, v25 - v28);
  const v30 = v29.toString(2).padStart(20, "0");
  return v30.split("").map(v31 => v31 === "1" ? "﻿" : "​").join("");
}
function getQualityRank(v32) {
  const v33 = {
    dh4: 221,
    dh5: 244
  };
  const v34 = v1;
  const v35 = String(v32 || "").toLowerCase();
  if (v35.includes("2160") || v35.includes("4k") || v35.includes("uhd")) {
    return 4;
  }
  if (v35.includes("1080") || v35.includes("fhd") || v35.includes("fullhd")) {
    return 3;
  }
  if (v35.includes("720") || v35.includes("hd")) {
    return 2;
  }
  if (v35.includes("480") || v35.includes("sd") || v35.includes("360")) {
    return 1;
  }
  return 0;
}
function parseSizeToMB(v36) {
  const v37 = v1;
  if (!v36 || v36 === "N/A" || v36 === "Unknown") {
    return 0;
  }
  const v38 = String(v36).match(/([\d.]+)\s*(GB|MB)/i);
  if (!v38) {
    return 0;
  }
  const v39 = parseFloat(v38[1]);
  const v40 = v38[2].toUpperCase();
  if (v40 === "GB") {
    return Math.floor(v39 * 1024);
  }
  if (v40 === "MB") {
    return Math.floor(v39);
  }
  return 0;
}
function getResolutionEmoji(v41) {
  const v42 = {
    dh6: 198,
    dh7: 221,
    dh8: 236,
    dh9: 251
  };
  const v43 = v1;
  const v44 = String(v41 || "").toLowerCase();
  if (v44.includes("2160") || v44.includes("4k") || v44.includes("uhd")) {
    return "🌟 4K";
  }
  if (v44.includes("1080") || v44.includes("fhd")) {
    return "🔥 1080p";
  }
  if (v44.includes("720") || v44.includes("hd")) {
    return "💎 720p";
  }
  if (v44.includes("480") || v44.includes("sd")) {
    return "📱 480p";
  }
  return "📺 " + (v41 || "1080p");
}
var SHA256_K = [1116352408, 1899447441, 3049323471, 3921009573, 961987163, 1508970993, 2453635748, 2870763221, 3624381080, 310598401, 607225278, 1426881987, 1925078388, 2162078206, 2614888103, 3248222580, 3835390401, 4022224774, 264347078, 604807628, 770255983, 1249150122, 1555081692, 1996064986, 2554220882, 2821834349, 2952996808, 3210313671, 3336571891, 3584528711, 113926993, 338241895, 666307205, 773529912, 1294757372, 1396182291, 1695183700, 1986661051, 2177026350, 2456956037, 2730485921, 2820302411, 3259730800, 3345764771, 3516065817, 3600352804, 4094571909, 275423344, 430227734, 506948616, 659060556, 883997877, 958139571, 1322822218, 1537002063, 1747873779, 1955562222, 2024104815, 2227730452, 2361852424, 2428436474, 2756734187, 3204031479, 3329325298];
function utf8Bytes(v45) {
  const v46 = {
    dh10: 207,
    dh11: 263,
    dh12: 263
  };
  const v47 = v1;
  const v48 = [];
  for (let v49 = 0; v49 < v45.length; v49++) {
    const v50 = v45.charCodeAt(v49);
    if (v50 < 128) {
      v48.push(v50);
    } else if (v50 < 2048) {
      v48.push(v50 >> 6 | 192, v50 & 63 | 128);
    } else if (v50 >= 55296 && v50 <= 56319 && v49 + 1 < v45.length) {
      const v51 = v45.charCodeAt(v49 + 1);
      if (v51 >= 56320 && v51 <= 57343) {
        const v52 = 65536 + (v50 - 55296 << 10) + (v51 - 56320);
        v48.push(v52 >> 18 | 240, v52 >> 12 & 63 | 128, v52 >> 6 & 63 | 128, v52 & 63 | 128);
        v49++;
      } else {
        v48.push(v50 >> 12 | 224, v50 >> 6 & 63 | 128, v50 & 63 | 128);
      }
    } else {
      v48.push(v50 >> 12 | 224, v50 >> 6 & 63 | 128, v50 & 63 | 128);
    }
  }
  return v48;
}
function sha256Hex(v53) {
  const v54 = {
    dh13: 237,
    dh14: 263,
    dh15: 240
  };
  const v55 = v1;
  const v56 = utf8Bytes(v53);
  const v57 = v56.length * 8;
  v56.push(128);
  while (v56.length % 64 !== 56) {
    v56.push(0);
  }
  const v58 = Math.floor(v57 / 4294967296);
  v56.push(v58 >>> 24 & 255, v58 >>> 16 & 255, v58 >>> 8 & 255, v58 & 255);
  v56.push(v57 >>> 24 & 255, v57 >>> 16 & 255, v57 >>> 8 & 255, v57 & 255);
  let v59 = 1779033703;
  let v60 = 3144134277;
  let v61 = 1013904242;
  let v62 = 2773480762;
  let v63 = 1359893119;
  let v64 = 2600822924;
  let v65 = 528734635;
  let v66 = 1541459225;
  const v67 = new Array(64);
  for (let v68 = 0; v68 < v56.length; v68 += 64) {
    for (let v69 = 0; v69 < 16; v69++) {
      const v70 = v68 + v69 * 4;
      v67[v69] = (v56[v70] << 24 | v56[v70 + 1] << 16 | v56[v70 + 2] << 8 | v56[v70 + 3]) >>> 0;
    }
    for (let v71 = 16; v71 < 64; v71++) {
      const v72 = v67[v71 - 15];
      const v73 = v67[v71 - 2];
      const v74 = ((v72 >>> 7 | v72 << 25) ^ (v72 >>> 18 | v72 << 14) ^ v72 >>> 3) >>> 0;
      const v75 = ((v73 >>> 17 | v73 << 15) ^ (v73 >>> 19 | v73 << 13) ^ v73 >>> 10) >>> 0;
      v67[v71] = (v67[v71 - 16] + v74 >>> 0) + (v67[v71 - 7] + v75 >>> 0) >>> 0;
    }
    let v76 = v59;
    let v77 = v60;
    let v78 = v61;
    let v79 = v62;
    let v80 = v63;
    let v81 = v64;
    let v82 = v65;
    let v83 = v66;
    for (let v84 = 0; v84 < 64; v84++) {
      const v85 = ((v80 >>> 6 | v80 << 26) ^ (v80 >>> 11 | v80 << 21) ^ (v80 >>> 25 | v80 << 7)) >>> 0;
      const v86 = (v80 & v81 ^ ~v80 & v82) >>> 0;
      const v87 = ((v83 + v85 >>> 0) + v86 >>> 0) + (SHA256_K[v84] + v67[v84] >>> 0) >>> 0;
      const v88 = ((v76 >>> 2 | v76 << 30) ^ (v76 >>> 13 | v76 << 19) ^ (v76 >>> 22 | v76 << 10)) >>> 0;
      const v89 = (v76 & v77 ^ v76 & v78 ^ v77 & v78) >>> 0;
      const v90 = v88 + v89 >>> 0;
      v83 = v82;
      v82 = v81;
      v81 = v80;
      v80 = v79 + v87 >>> 0;
      v79 = v78;
      v78 = v77;
      v77 = v76;
      v76 = v87 + v90 >>> 0;
    }
    v59 = v59 + v76 >>> 0;
    v60 = v60 + v77 >>> 0;
    v61 = v61 + v78 >>> 0;
    v62 = v62 + v79 >>> 0;
    v63 = v63 + v80 >>> 0;
    v64 = v64 + v81 >>> 0;
    v65 = v65 + v82 >>> 0;
    v66 = v66 + v83 >>> 0;
  }
  const v91 = [v59, v60, v61, v62, v63, v64, v65, v66];
  let v92 = "";
  for (const v93 of v91) {
    v92 += ("00000000" + v93.toString(16)).slice(-8);
  }
  return v92;
}
function solveProofOfWork(v94) {
  const v95 = {
    dh16: 246,
    dh17: 223
  };
  return __async(this, null, function* () {
    const v96 = v1;
    const v97 = yield __nvFetch(v94 + "/api/challenge", {
      skipSizeCheck: true
    });
    if (!v97.ok) {
      throw new Error("failed to fetch PoW challenge");
    }
    const {
      challenge: v98,
      difficulty: v99
    } = yield v97.json();
    const v100 = "0".repeat(v99);
    for (let v101 = 0; v101 < 5000000; v101++) {
      const v102 = sha256Hex(v98 + v101);
      if (v102.startsWith(v100)) {
        return {
          challenge: v98,
          nonce: String(v101)
        };
      }
    }
    throw new Error("PoW solve timed out");
  });
}
function getTmdbRuntimeSeconds(v103, v104, v105, v106) {
  const v107 = {
    dh18: 262
  };
  return __async(this, null, function* () {
    const v108 = v1;
    var v109;
    try {
      const v110 = v104 === "tv" ? "https://api.themoviedb.org/3/tv/" + v103 + "/season/" + (v105 || 1) + "/episode/" + (v106 || 1) + "?api_key=" + TMDB_API_KEY : "https://api.themoviedb.org/3/movie/" + v103 + "?api_key=" + TMDB_API_KEY;
      const v111 = yield __nvFetch(v110, {
        skipSizeCheck: true
      });
      if (!v111.ok) {
        return null;
      }
      const v112 = yield v111.json();
      const v113 = v112.runtime || ((v109 = v112.episode_run_time) == null ? undefined : v109[0]);
      if (v113) {
        return v113 * 60;
      } else {
        return null;
      }
    } catch (v114) {
      return null;
    }
  });
}
function getTmdbMetadata(v115, v116) {
  const v117 = {
    dh19: 245
  };
  return __async(this, null, function* () {
    const v118 = v1;
    try {
      const v119 = v116 === "tv" ? "tv" : "movie";
      const v120 = yield __nvFetch("https://api.themoviedb.org/3/" + v119 + "/" + v115 + "?api_key=" + TMDB_API_KEY, {
        skipSizeCheck: true
      });
      const v121 = yield v120.json();
      const v122 = v119 === "tv" ? v121.name : v121.title;
      const v123 = v119 === "tv" ? v121.first_air_date : v121.release_date;
      const v124 = v123 ? v123.split("-")[0] : "";
      return {
        title: v122,
        year: v124
      };
    } catch (v125) {
      return {
        title: "",
        year: ""
      };
    }
  });
}
function formatBytes(v126) {
  const v127 = {
    dh20: 240
  };
  const v128 = v1;
  if (!v126) {
    return "Unknown";
  }
  const v129 = 1024;
  const v130 = ["Bytes", "KB", "MB", "GB", "TB"];
  const v131 = Math.floor(Math.log(v126) / Math.log(v129));
  return parseFloat((v126 / Math.pow(v129, v131)).toFixed(2)) + " " + v130[v131];
}
function resolveUrl(v132, v133) {
  try {
    return new URL(v132, v133).toString();
  } catch (v134) {
    return v132;
  }
}
function parseMasterPlaylist(v135, v136) {
  const v137 = {
    dh21: 212,
    dh22: 237,
    dh23: 223,
    dh24: 197,
    dh25: 223,
    dh26: 208
  };
  const v138 = v1;
  const v139 = v135.split("\n").map(v140 => v140.trim());
  const v141 = [];
  let v142 = null;
  for (let v143 = 0; v143 < v139.length; v143++) {
    if (v139[v143].startsWith("#EXT-X-MEDIA") && v139[v143].includes("TYPE=AUDIO") && !v142) {
      const v144 = v139[v143].match(/URI="([^"]+)"/);
      const v145 = /DEFAULT=YES/.test(v139[v143]);
      if (v144 && (v145 || !v142)) {
        v142 = resolveUrl(v144[1], v136);
      }
      continue;
    }
    if (!v139[v143].startsWith("#EXT-X-STREAM-INF")) {
      continue;
    }
    const v146 = v139[v143];
    const v147 = v139[v143 + 1];
    if (!v147 || v147.startsWith("#")) {
      continue;
    }
    const v148 = v146.match(/BANDWIDTH=(\d+)/);
    const v149 = v146.match(/RESOLUTION=(\d+)x(\d+)/);
    const v150 = v148 ? parseInt(v148[1], 10) : 0;
    const v151 = v149 ? parseInt(v149[2], 10) : 0;
    v141.push({
      url: resolveUrl(v147, v136),
      bandwidth: v150,
      height: v151
    });
  }
  return {
    variants: v141,
    defaultAudioUrl: v142
  };
}
function getAudioBitrateBps(v152) {
  return __async(this, null, function* () {
    const v153 = v1;
    if (!v152) {
      return 0;
    }
    try {
      const v154 = yield (yield __nvFetch(v152, {
        skipSizeCheck: true
      })).text();
      const v155 = v154.match(/#EXT-X-BITRATE:(\d+)/);
      if (v155) {
        return parseInt(v155[1], 10) * 1000;
      } else {
        return 0;
      }
    } catch (v156) {
      return 0;
    }
  });
}
function qualityLabelFromHeight(v157) {
  const v158 = {
    dh27: 216
  };
  const v159 = v1;
  if (v157 >= 2000) {
    return "4K";
  }
  if (v157 <= 0) {
    return "Unknown";
  }
  return v157 + "p";
}
function makeStream(v160, v161, v162, v163, v164, v165, v166, v167, v168) {
  const v169 = {
    dh28: 226,
    dh29: 256,
    dh30: 238
  };
  const v170 = v1;
  const v171 = getQualityRank(v161);
  const v172 = parseSizeToMB(v162);
  const v173 = getInvertedSortTag(v171 * 100000 + v172, 999999);
  const v174 = getResolutionEmoji(v161);
  const v175 = (v163 || "").replace(/[^a-zA-Z0-9]/g, ".");
  const v176 = v165 === "tv";
  const v177 = v166 || 1;
  const v178 = v167 || 1;
  const v179 = v176 ? v175 + ".S" + String(v177).padStart(2, "0") + "E" + String(v178).padStart(2, "0") + "." + v161 + ".WEB-DL.Multi-Audio.HEVC.AAC.MKV.MSubs" : v175 + "." + (v164 || "2026") + "." + v161 + ".WEB-DL.Multi-Audio.HEVC.AAC.MKV.MSubs";
  const v180 = v176 ? "🎬 " + v163 + (v164 ? " (" + v164 + ")" : "") + " | S" + v177 + "E" + v178 : "🎬 " + v163 + (v164 ? " (" + v164 + ")" : "");
  const v181 = v174 + " | 🗣️ Multi-Audio | 💾 " + v162;
  const v182 = "🎞️ MKV | ✨ HEVC | 🎧 AAC";
  const v183 = "🌐 Goated | 📥 WEB-DL";
  const v184 = v179;
  const v185 = v173 + "Goated • " + v161 + " • Multi-Audio";
  const v186 = [v180, v181, v182, v183, v184].join("\n");
  return {
    qualityRank: v171,
    sizeInMB: v172,
    data: {
      name: v185,
      title: v186,
      size: v186,
      description: v186,
      url: v160,
      headers: HEADERS,
      subtitles: v168,
      behaviorHints: {
        notWebReady: true,
        proxyHeaders: {
          request: HEADERS
        }
      }
    }
  };
}
function getStreams(v187, v188, v189, v190) {
  const v191 = {
    dh31: 204,
    dh32: 262,
    dh33: 217,
    dh34: 231,
    dh35: 219,
    dh36: 196,
    dh37: 246,
    dh38: 193
  };
  return __async(this, null, function* () {
    const v192 = v1;
    try {
      let v193 = v187;
      if (typeof v187 === "string" && v187.trim().toLowerCase().startsWith("tt")) {
        const v194 = "https://api.themoviedb.org/3/find/" + v187 + "?api_key=" + TMDB_API_KEY + "&external_source=imdb_id";
        const v195 = yield (yield __nvFetch(v194, {
          skipSizeCheck: true
        })).json();
        const v196 = v188 === "tv" ? v195.tv_results : v195.movie_results;
        v193 = v196 && v196.length ? v196[0].id : null;
        if (!v193) {
          return [];
        }
      }
      v193 = parseInt(v193, 10);
      if (!v193) {
        return [];
      }
      const {
        title: v197,
        year: v198
      } = yield getTmdbMetadata(v193, v188);
      const v199 = yield getApiHost();
      const v200 = v188 === "tv";
      const v201 = yield solveProofOfWork(v199);
      const v202 = {
        mediaType: v200 ? "tv" : "movie",
        id: String(v193),
        challenge: v201.challenge,
        nonce: v201.nonce
      };
      if (v200) {
        v202.season = v189 || 1;
        v202.episode = v190 || 1;
      }
      const v203 = yield __nvFetch(v199 + "/api/resolve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(v202),
        skipSizeCheck: true
      });
      if (!v203.ok) {
        return [];
      }
      const v204 = yield v203.json().catch(() => null);
      if (!v204 || !v204.url) {
        return [];
      }
      const v205 = yield __nvFetch(v204.url, {
        skipSizeCheck: true
      });
      if (!v205.ok) {
        return [];
      }
      const v206 = yield v205.text();
      const {
        variants: v207,
        defaultAudioUrl: v208
      } = parseMasterPlaylist(v206, v204.url);
      if (!v207.length) {
        return [];
      }
      const v209 = v207.slice().sort((v210, v211) => v211.height - v210.height)[0];
      const [v212, v213] = yield Promise.all([getTmdbRuntimeSeconds(v193, v188, v189, v190), getAudioBitrateBps(v208)]);
      let v214 = [];
      try {
        const v215 = yield solveProofOfWork(v199);
        const v216 = {
          mediaType: v200 ? "tv" : "movie",
          id: String(v193),
          challenge: v215.challenge,
          nonce: v215.nonce
        };
        if (v200) {
          v216.season = v189 || 1;
          v216.episode = v190 || 1;
        }
        const v217 = yield __nvFetch(v199 + "/api/subtitles", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(v216),
          skipSizeCheck: true
        });
        if (v217.ok) {
          const v218 = yield v217.json().catch(() => null);
          v214 = (v218 && v218.subtitles || []).filter(v219 => v219 && v219.url).map(v220 => ({
            url: v220.url,
            lang: v220.label || v220.language || "Unknown"
          }));
        }
      } catch (v221) {}
      const v222 = v209.bandwidth + v213;
      const v223 = qualityLabelFromHeight(v209.height);
      const v224 = v212 ? formatBytes(v222 * v212 / 8) : "Unknown";
      const v225 = makeStream(v204.url, v223, v224, v197 || "Unknown Title", v198 || "2026", v188, v189, v190, v214);
      return [v225.data];
    } catch (v226) {
      console.error("[Goated]", v226);
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
  var PROVIDER = "goated";
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