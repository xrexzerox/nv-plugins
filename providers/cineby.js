/*
 * nv-plugins cineby.js — rebased on the CURRENT All-in-One-Nuvio upstream file (4.26.0 sync pass).
 * Upstream version: 2.5.0. Decoded + identifier-normalized, zero obfuscator remnants.
 * nv tail re-attached: fail-open quality gate (4.26.0), en/tl language gate, cross-provider dedupe.
 */
var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (v1, v2, v3) => v2 in v1 ? __defProp(v1, v2, {
  enumerable: true,
  configurable: true,
  writable: true,
  value: v3
}) : v1[v2] = v3;
var __spreadValues = (v4, v5) => {
  for (var v6 in v5 ||= {}) {
    if (__hasOwnProp.call(v5, v6)) {
      __defNormalProp(v4, v6, v5[v6]);
    }
  }
  if (__getOwnPropSymbols) {
    for (var v6 of __getOwnPropSymbols(v5)) {
      if (__propIsEnum.call(v5, v6)) {
        __defNormalProp(v4, v6, v5[v6]);
      }
    }
  }
  return v4;
};
var __spreadProps = (v7, v8) => __defProps(v7, __getOwnPropDescs(v8));
var __async = (v9, v10, v11) => {
  return new Promise((v12, v13) => {
    var v14 = v15 => {
      try {
        v16(v11.next(v15));
      } catch (v17) {
        v13(v17);
      }
    };
    var v18 = v19 => {
      try {
        v16(v11.throw(v19));
      } catch (v20) {
        v13(v20);
      }
    };
    var v16 = v21 => v21.done ? v12(v21.value) : Promise.resolve(v21.value).then(v14, v18);
    v16((v11 = v11.apply(v9, v10)).next());
  });
};
var DOMAINS_URL = "https://raw.githubusercontent.com/sapariyaneel/nuvio-plugin/refs/heads/main/domains.json";
var FALLBACK_API_HOST = "https://api.speedracelight.com";
var TMDB_API_KEY = "1865f43a0549ca50d341dd9ab8b29f49";
var HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  Referer: "https://www.cineby.at/",
  Origin: "https://www.cineby.at"
};
var cachedDomains = null;
function getDomains() {
  return __async(this, null, function* () {
    if (cachedDomains) {
      return cachedDomains;
    }
    try {
      const v22 = yield fetch(DOMAINS_URL, {
        skipSizeCheck: true
      });
      cachedDomains = yield v22.json();
    } catch (v23) {
      cachedDomains = {};
    }
    return cachedDomains;
  });
}
function getApiHost() {
  return __async(this, null, function* () {
    const v24 = yield getDomains();
    return (v24.speedracelight || v24["api.speedracelight.com"] || FALLBACK_API_HOST).replace(/\/+$/, "");
  });
}
var SHA256_CONSTANTS = [1116352408, 1899447441, 3049323471, 3921009573, 961987163, 1508970993, 2453635748, 2870763221, 3624381080, 310598401, 607225278, 1426881987, 1925078388, 2162078206, 2614888103, 3248222580];
var MAGIC_BYTES = [109, 118, 109, 49];
function isCustomBranch(v25) {
  return (v25 * (v25 + 1) & 1) === 0;
}
function fmix32(v26) {
  v26 = v26 >>> 0;
  v26 ^= v26 >>> 16;
  v26 = Math.imul(v26, 2246822507) >>> 0;
  v26 ^= v26 >>> 13;
  v26 = Math.imul(v26, 3266489909) >>> 0;
  v26 = (v26 ^ v26 >>> 16) >>> 0;
  return v26;
}
function rotl32(v27, v28) {
  v27 = v27 >>> 0;
  v28 &= 31;
  if (v28 === 0) {
    return v27 >>> 0;
  }
  return (v27 << v28 | v27 >>> 32 - v28) >>> 0;
}
var BASE64_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
function pureBase64Decode(v29) {
  let v30 = "";
  for (let v31 = 0; v31 < v29.length; v31++) {
    const v32 = v29.charAt(v31);
    if (v32 !== "=" && BASE64_CHARS.indexOf(v32) !== -1) {
      v30 += v32;
    }
  }
  let v33 = "";
  for (let v34 = 0; v34 < v30.length; v34 += 4) {
    const v35 = BASE64_CHARS.indexOf(v30.charAt(v34));
    const v36 = BASE64_CHARS.indexOf(v30.charAt(v34 + 1));
    const v37 = v34 + 2 < v30.length ? BASE64_CHARS.indexOf(v30.charAt(v34 + 2)) : -1;
    const v38 = v34 + 3 < v30.length ? BASE64_CHARS.indexOf(v30.charAt(v34 + 3)) : -1;
    v33 += String.fromCharCode(v35 << 2 | v36 >> 4);
    if (v37 !== -1) {
      v33 += String.fromCharCode((v36 & 15) << 4 | v37 >> 2);
    }
    if (v38 !== -1) {
      v33 += String.fromCharCode((v37 & 3) << 6 | v38);
    }
  }
  return v33;
}
function base64UrlToBytes(v39) {
  const v40 = v39.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(v39.length / 4) * 4, "=");
  const v41 = typeof atob === "function" ? atob(v40) : pureBase64Decode(v40);
  const v42 = new Uint8Array(v41.length);
  for (let v43 = 0; v43 < v41.length; v43++) {
    v42[v43] = v41.charCodeAt(v43);
  }
  return v42;
}
function fnv1a32(v44) {
  let v45 = 2166136261;
  for (let v46 = 0; v46 < v44.length; v46++) {
    v45 = Math.imul(v45 ^ v44.charCodeAt(v46), 16777619) >>> 0;
  }
  return fmix32(v45);
}
function makeKeystreamState(v47, v48) {
  const v49 = new Array(61);
  let v50 = fmix32(fnv1a32(v47) ^ fmix32(v48 >>> 0 ^ -1640531527)) >>> 0;
  for (let v51 = 0; v51 < 8; v51++) {
    if (isCustomBranch(v51)) {
      const v52 = v50 % 61;
      v50 = rotl32(v50 + 2654435769 >>> 0, 7 + (v51 & 7));
      v49[v52] = (v50 ^ fmix32(v50)) >>> 0;
      v50 = fmix32(v50 + v52 >>> 0);
    } else {
      v49[v51] = SHA256_CONSTANTS[v51 & 15];
    }
  }
  return {
    slots: v49,
    acc: fmix32(v50 ^ -1515870811) >>> 0
  };
}
function nextKeystreamWord(v53, v54) {
  const v55 = v53.slots;
  const v56 = v53.acc;
  const v57 = v56 % 61;
  const v58 = v57 in v55 ? -1 : 0;
  const v59 = v55[v57] >>> 0;
  const v60 = (v59 ^ Math.imul(2654435769, v54 + 1) >>> 0) >>> 0;
  const v61 = ((v56 ^ v60) >>> 0 | (v56 & v60 & v58) >>> 0) >>> 0;
  const v62 = (rotl32(v61 + v56 >>> 0, v57 & 31) ^ rotl32(v56, Math.imul(v57, 7) & 31)) >>> 0;
  const v63 = fmix32(v62 + 2654435769 >>> 0);
  v55[v57] = v63 >>> 0;
  v53.acc = v63;
  return v63 >>> 0;
}
function generateKeystream(v64, v65, v66) {
  const v67 = makeKeystreamState(v64, v65);
  const v68 = new Uint8Array(v66);
  let v69 = 0;
  let v70 = 0;
  while (v69 < v66) {
    const v71 = nextKeystreamWord(v67, v70++);
    v68[v69++] = v71 & 255;
    if (v69 < v66) {
      v68[v69++] = v71 >>> 8 & 255;
    }
    if (v69 < v66) {
      v68[v69++] = v71 >>> 16 & 255;
    }
    if (v69 < v66) {
      v68[v69++] = v71 >>> 24 & 255;
    }
  }
  return v68;
}
function utf8BytesToString(v72) {
  let v73 = "";
  let v74 = 0;
  while (v74 < v72.length) {
    const v75 = v72[v74++];
    if (v75 < 128) {
      v73 += String.fromCharCode(v75);
    } else if ((v75 & 224) === 192) {
      const v76 = v72[v74++];
      v73 += String.fromCharCode((v75 & 31) << 6 | v76 & 63);
    } else if ((v75 & 240) === 224) {
      const v77 = v72[v74++];
      const v78 = v72[v74++];
      v73 += String.fromCharCode((v75 & 15) << 12 | (v77 & 63) << 6 | v78 & 63);
    } else if ((v75 & 248) === 240) {
      const v79 = v72[v74++];
      const v80 = v72[v74++];
      const v81 = v72[v74++];
      let v82 = (v75 & 7) << 18 | (v79 & 63) << 12 | (v80 & 63) << 6 | v81 & 63;
      v82 -= 65536;
      v73 += String.fromCharCode(55296 + (v82 >> 10), 56320 + (v82 & 1023));
    } else {
      v73 += String.fromCharCode(v75);
    }
  }
  return v73;
}
function decryptSourcesPayload(v83, v84, v85) {
  const v86 = base64UrlToBytes(v83);
  const v87 = generateKeystream(v84, v85, v86.length);
  const v88 = new Uint8Array(v86.length);
  for (let v89 = 0; v89 < v86.length; v89++) {
    v88[v89] = v86[v89] ^ v87[v89];
  }
  for (let v90 = 0; v90 < MAGIC_BYTES.length; v90++) {
    if (v88[v90] !== MAGIC_BYTES[v90]) {
      throw new Error("decrypt failed: bad seed or tampered payload");
    }
  }
  const v91 = v88.subarray(MAGIC_BYTES.length);
  return utf8BytesToString(v91);
}
function getTmdbMeta(v92, v93) {
  return __async(this, null, function* () {
    const v94 = v93 === "tv" ? "tv" : "movie";
    const v95 = "https://api.themoviedb.org/3/" + v94 + "/" + v92 + "?api_key=" + TMDB_API_KEY + "&append_to_response=external_ids";
    const v96 = yield fetch(v95, {
      skipSizeCheck: true
    });
    if (!v96.ok) {
      return null;
    }
    const v97 = yield v96.json();
    const v98 = v94 === "tv" ? v97.name : v97.title;
    const v99 = v94 === "tv" ? v97.first_air_date : v97.release_date;
    const v100 = v99 ? v99.slice(0, 4) : "";
    const v101 = v97.external_ids && v97.external_ids.imdb_id || v97.imdb_id || "";
    return {
      title: v98,
      year: v100,
      imdbId: v101
    };
  });
}
function qualityRank(v102) {
  if (!v102) {
    return 0;
  }
  if (/4k/i.test(v102)) {
    return 2160;
  }
  const v103 = parseInt(v102, 10);
  if (Number.isFinite(v103)) {
    return v103;
  } else {
    return 0;
  }
}
function formatBytes(v104) {
  if (!v104) {
    return "Unknown";
  }
  const v105 = 1024;
  const v106 = ["Bytes", "KB", "MB", "GB", "TB"];
  const v107 = Math.floor(Math.log(v104) / Math.log(v105));
  return parseFloat((v104 / Math.pow(v105, v107)).toFixed(2)) + " " + v106[v107];
}
var SEGMENT_SAMPLE_SIZE = 5;
function getRealSegmentSize(v108) {
  return __async(this, null, function* () {
    try {
      const v109 = yield fetch(v108, {
        method: "HEAD",
        headers: HEADERS,
        skipSizeCheck: true
      });
      const v110 = v109.headers.get("content-length");
      if (v110) {
        return parseInt(v110, 10);
      }
    } catch (v111) {}
    try {
      const v112 = yield fetch(v108, {
        headers: __spreadProps(__spreadValues({}, HEADERS), {
          Range: "bytes=0-1"
        }),
        skipSizeCheck: true
      });
      const v113 = v112.headers.get("content-range");
      const v114 = v113 && v113.match(/\/(\d+)$/);
      if (v114) {
        return parseInt(v114[1], 10);
      }
    } catch (v115) {}
    return null;
  });
}
function estimateHlsSize(v116) {
  return __async(this, null, function* () {
    try {
      const v117 = yield fetch(v116, {
        headers: HEADERS,
        skipSizeCheck: true
      });
      if (!v117.ok) {
        return "Unknown";
      }
      const v118 = yield v117.text();
      const v119 = v118.split("\n").map(v120 => v120.trim()).filter(v121 => v121.startsWith("http"));
      if (!v119.length) {
        return "Unknown";
      }
      const v122 = v119.filter((v123, v124) => v124 % Math.ceil(v119.length / SEGMENT_SAMPLE_SIZE) === 0).slice(0, SEGMENT_SAMPLE_SIZE);
      const v125 = yield Promise.all(v122.map(getRealSegmentSize));
      const v126 = v125.filter(v127 => v127 && v127 > 0);
      if (!v126.length) {
        return "Unknown";
      }
      const v128 = v126.reduce((v129, v130) => v129 + v130, 0) / v126.length;
      const v131 = v128 * v119.length;
      return formatBytes(v131);
    } catch (v132) {
      return "Unknown";
    }
  });
}
function getStreams(v133, v134, v135, v136) {
  return __async(this, null, function* () {
    try {
      let v137 = v133;
      if (typeof v133 === "string" && v133.trim().toLowerCase().startsWith("tt")) {
        const v138 = "https://api.themoviedb.org/3/find/" + v133 + "?api_key=" + TMDB_API_KEY + "&external_source=imdb_id";
        const v139 = yield (yield fetch(v138, {
          skipSizeCheck: true
        })).json();
        const v140 = v134 === "tv" ? v139.tv_results : v139.movie_results;
        v137 = v140 && v140.length ? v140[0].id : null;
        if (!v137) {
          return [];
        }
      }
      v137 = parseInt(v137, 10);
      if (!v137) {
        return [];
      }
      const v141 = yield getTmdbMeta(v137, v134);
      if (!v141 || !v141.title) {
        return [];
      }
      const v142 = yield getApiHost();
      const v143 = v134 === "tv";
      const v144 = yield fetch(v142 + "/seed?mediaId=" + v137, {
        headers: HEADERS,
        skipSizeCheck: true
      });
      if (!v144.ok) {
        return [];
      }
      const v145 = yield v144.json().catch(() => null);
      if (!v145 || !v145.seed) {
        return [];
      }
      const v146 = new URLSearchParams({
        title: v141.title,
        mediaType: v143 ? "tv" : "movie",
        year: v141.year || "",
        episodeId: String(v143 ? v136 || 1 : 1),
        seasonId: String(v143 ? v135 || 1 : 1),
        tmdbId: String(v137),
        imdbId: v141.imdbId || "",
        enc: "2",
        seed: v145.seed
      });
      const v147 = yield fetch(v142 + "/cdn/sources-with-title?" + v146.toString(), {
        headers: HEADERS,
        skipSizeCheck: true
      });
      if (!v147.ok) {
        return [];
      }
      const v148 = yield v147.text();
      let v149;
      try {
        const v150 = decryptSourcesPayload(v148, v145.seed, v137);
        v149 = JSON.parse(v150);
      } catch (v151) {
        console.error("[Cineby] decrypt failed:", v151.message);
        return [];
      }
      const v152 = v149 && v149.sources || [];
      if (!v152.length) {
        return [];
      }
      const v153 = (v149 && v149.subtitles || []).filter(v154 => v154 && v154.url).map(v155 => ({
        url: v155.url,
        lang: v155.lang || v155.language || "Unknown"
      }));
      const v156 = yield Promise.all(v152.filter(v157 => v157 && v157.url).map(v158 => __async(this, null, function* () {
        const v159 = yield estimateHlsSize(v158.url);
        return {
          url: v158.url,
          quality: v158.quality || "Unknown",
          title: "Cineby " + (v158.quality || "Unknown"),
          name: "Cineby",
          size: v159,
          headers: HEADERS,
          subtitles: v153
        };
      })));
      v156.sort((v160, v161) => qualityRank(v161.quality) - qualityRank(v160.quality));
      return v156;
    } catch (v162) {
      console.error("[Cineby]", v162);
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
/*
 * nv-plugins cineby.js — FULLY DECODED port of the All-in-One-Nuvio provider (4.23.0 best-settings pass).
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
  const v8 = {
    dh1: 123
  };
  const v9 = v2;
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
  const v16 = {
    dh2: 134
  };
  const v17 = {
    dh3: 134
  };
  return new Promise((v18, v19) => {
    const v20 = v1;
    var v21 = v22 => {
      const v23 = v1;
      try {
        v24(v15.next(v22));
      } catch (v25) {
        v19(v25);
      }
    };
    var v26 = v27 => {
      try {
        v24(v15.throw(v27));
      } catch (v28) {
        v19(v28);
      }
    };
    var v24 = v29 => v29.done ? v18(v29.value) : Promise.resolve(v29.value).then(v21, v26);
    v24((v15 = v15.apply(v13, v14)).next());
  });
};
var DOMAINS_URL = "https://raw.githubusercontent.com/sapariyaneel/nuvio-plugin/refs/heads/main/domains.json";
var FALLBACK_API_HOST = "https://api.speedracelight.com";
var TMDB_API_KEY = "1865f43a0549ca50d341dd9ab8b29f49";
var HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  Referer: "https://www.cineby.at/",
  Origin: "https://www.cineby.at"
};
var cachedDomains = null;
function getDomains() {
  return __async(this, null, function* () {
    if (cachedDomains) {
      return cachedDomains;
    }
    try {
      const v30 = yield __nvFetch(DOMAINS_URL, {
        skipSizeCheck: true
      });
      cachedDomains = yield v30.json();
    } catch (v31) {
      cachedDomains = {};
    }
    return cachedDomains;
  });
}
function getApiHost() {
  const v32 = {
    dh4: 132
  };
  return __async(this, null, function* () {
    const v33 = v1;
    const v34 = yield getDomains();
    return (v34.speedracelight || v34["api.speedracelight.com"] || FALLBACK_API_HOST).replace(/\/+$/, "");
  });
}
var SHA256_CONSTANTS = [1116352408, 1899447441, 3049323471, 3921009573, 961987163, 1508970993, 2453635748, 2870763221, 3624381080, 310598401, 607225278, 1426881987, 1925078388, 2162078206, 2614888103, 3248222580];
var MAGIC_BYTES = [109, 118, 109, 49];
function isCustomBranch(v35) {
  return (v35 * (v35 + 1) & 1) === 0;
}
function fmix32(v36) {
  const v37 = {
    dh5: 122
  };
  const v38 = v2;
  v36 = v36 >>> 0;
  v36 ^= v36 >>> 16;
  v36 = Math.imul(v36, 2246822507) >>> 0;
  v36 ^= v36 >>> 13;
  v36 = Math.imul(v36, 3266489909) >>> 0;
  v36 = (v36 ^ v36 >>> 16) >>> 0;
  return v36;
}
function rotl32(v39, v40) {
  v39 = v39 >>> 0;
  v40 &= 31;
  if (v40 === 0) {
    return v39 >>> 0;
  }
  return (v39 << v40 | v39 >>> 32 - v40) >>> 0;
}
var BASE64_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
function pureBase64Decode(v41) {
  const v42 = {
    dh6: 136,
    dh7: 141,
    dh8: 175
  };
  const v43 = v2;
  let v44 = "";
  for (let v45 = 0; v45 < v41.length; v45++) {
    const v46 = v41.charAt(v45);
    if (v46 !== "=" && BASE64_CHARS.indexOf(v46) !== -1) {
      v44 += v46;
    }
  }
  let v47 = "";
  for (let v48 = 0; v48 < v44.length; v48 += 4) {
    const v49 = BASE64_CHARS.indexOf(v44.charAt(v48));
    const v50 = BASE64_CHARS.indexOf(v44.charAt(v48 + 1));
    const v51 = v48 + 2 < v44.length ? BASE64_CHARS.indexOf(v44.charAt(v48 + 2)) : -1;
    const v52 = v48 + 3 < v44.length ? BASE64_CHARS.indexOf(v44.charAt(v48 + 3)) : -1;
    v47 += String.fromCharCode(v49 << 2 | v50 >> 4);
    if (v51 !== -1) {
      v47 += String.fromCharCode((v50 & 15) << 4 | v51 >> 2);
    }
    if (v52 !== -1) {
      v47 += String.fromCharCode((v51 & 3) << 6 | v52);
    }
  }
  return v47;
} /*decoder removed*/
function base64UrlToBytes(v53) {
  const v54 = v2;
  const v55 = v53.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(v53.length / 4) * 4, "=");
  const v56 = typeof atob === "function" ? atob(v55) : pureBase64Decode(v55);
  const v57 = new Uint8Array(v56.length);
  for (let v58 = 0; v58 < v56.length; v58++) {
    v57[v58] = v56.charCodeAt(v58);
  }
  return v57;
}
function fnv1a32(v59) {
  const v60 = {
    dh9: 122,
    dh10: 155
  };
  const v61 = v2;
  let v62 = 2166136261;
  for (let v63 = 0; v63 < v59.length; v63++) {
    v62 = Math.imul(v62 ^ v59.charCodeAt(v63), 16777619) >>> 0;
  }
  return fmix32(v62);
}
function makeKeystreamState(v64, v65) {
  const v66 = new Array(61);
  let v67 = fmix32(fnv1a32(v64) ^ fmix32(v65 >>> 0 ^ -1640531527)) >>> 0;
  for (let v68 = 0; v68 < 8; v68++) {
    if (isCustomBranch(v68)) {
      const v69 = v67 % 61;
      v67 = rotl32(v67 + 2654435769 >>> 0, 7 + (v68 & 7));
      v66[v69] = (v67 ^ fmix32(v67)) >>> 0;
      v67 = fmix32(v67 + v69 >>> 0);
    } else {
      v66[v68] = SHA256_CONSTANTS[v68 & 15];
    }
  }
  return {
    slots: v66,
    acc: fmix32(v67 ^ -1515870811) >>> 0
  };
} /*string-table removed*/
function nextKeystreamWord(v70, v71) {
  const v72 = {
    dh11: 122
  };
  const v73 = v2;
  const v74 = v70.slots;
  const v75 = v70.acc;
  const v76 = v75 % 61;
  const v77 = v76 in v74 ? -1 : 0;
  const v78 = v74[v76] >>> 0;
  const v79 = (v78 ^ Math.imul(2654435769, v71 + 1) >>> 0) >>> 0;
  const v80 = ((v75 ^ v79) >>> 0 | (v75 & v79 & v77) >>> 0) >>> 0;
  const v81 = (rotl32(v80 + v75 >>> 0, v76 & 31) ^ rotl32(v75, Math.imul(v76, 7) & 31)) >>> 0;
  const v82 = fmix32(v81 + 2654435769 >>> 0);
  v74[v76] = v82 >>> 0;
  v70.acc = v82;
  return v82 >>> 0;
}
function generateKeystream(v83, v84, v85) {
  const v86 = makeKeystreamState(v83, v84);
  const v87 = new Uint8Array(v85);
  let v88 = 0;
  let v89 = 0;
  while (v88 < v85) {
    const v90 = nextKeystreamWord(v86, v89++);
    v87[v88++] = v90 & 255;
    if (v88 < v85) {
      v87[v88++] = v90 >>> 8 & 255;
    }
    if (v88 < v85) {
      v87[v88++] = v90 >>> 16 & 255;
    }
    if (v88 < v85) {
      v87[v88++] = v90 >>> 24 & 255;
    }
  }
  return v87;
}
function utf8BytesToString(v91) {
  const v92 = {
    dh12: 163
  };
  const v93 = v2;
  let v94 = "";
  let v95 = 0;
  while (v95 < v91.length) {
    const v96 = v91[v95++];
    if (v96 < 128) {
      v94 += String.fromCharCode(v96);
    } else if ((v96 & 224) === 192) {
      const v97 = v91[v95++];
      v94 += String.fromCharCode((v96 & 31) << 6 | v97 & 63);
    } else if ((v96 & 240) === 224) {
      const v98 = v91[v95++];
      const v99 = v91[v95++];
      v94 += String.fromCharCode((v96 & 15) << 12 | (v98 & 63) << 6 | v99 & 63);
    } else if ((v96 & 248) === 240) {
      const v100 = v91[v95++];
      const v101 = v91[v95++];
      const v102 = v91[v95++];
      let v103 = (v96 & 7) << 18 | (v100 & 63) << 12 | (v101 & 63) << 6 | v102 & 63;
      v103 -= 65536;
      v94 += String.fromCharCode(55296 + (v103 >> 10), 56320 + (v103 & 1023));
    } else {
      v94 += String.fromCharCode(v96);
    }
  }
  return v94;
}
function decryptSourcesPayload(v104, v105, v106) {
  const v107 = {
    dh13: 138
  };
  const v108 = v2;
  const v109 = base64UrlToBytes(v104);
  const v110 = generateKeystream(v105, v106, v109.length);
  const v111 = new Uint8Array(v109.length);
  for (let v112 = 0; v112 < v109.length; v112++) {
    v111[v112] = v109[v112] ^ v110[v112];
  }
  for (let v113 = 0; v113 < MAGIC_BYTES.length; v113++) {
    if (v111[v113] !== MAGIC_BYTES[v113]) {
      throw new Error("decrypt failed: bad seed or tampered payload");
    }
  }
  const v114 = v111.subarray(MAGIC_BYTES.length);
  return utf8BytesToString(v114);
}
function getTmdbMeta(v115, v116) {
  const v117 = {
    dh14: 133,
    dh15: 116,
    dh16: 165,
    dh17: 145,
    dh18: 160,
    dh19: 186
  };
  return __async(this, null, function* () {
    const v118 = v1;
    const v119 = v116 === "tv" ? "tv" : "movie";
    const v120 = "https://api.themoviedb.org/3/" + v119 + "/" + v115 + "?api_key=" + TMDB_API_KEY + "&append_to_response=external_ids";
    const v121 = yield __nvFetch(v120, {
      skipSizeCheck: true
    });
    if (!v121.ok) {
      return null;
    }
    const v122 = yield v121.json();
    const v123 = v119 === "tv" ? v122.name : v122.title;
    const v124 = v119 === "tv" ? v122.first_air_date : v122.release_date;
    const v125 = v124 ? v124.slice(0, 4) : "";
    const v126 = v122.external_ids && v122.external_ids.imdb_id || v122.imdb_id || "";
    return {
      title: v123,
      year: v125,
      imdbId: v126
    };
  });
}
function qualityRank(v127) {
  const v128 = v2;
  if (!v127) {
    return 0;
  }
  if (/4k/i.test(v127)) {
    return 2160;
  }
  const v129 = parseInt(v127, 10);
  if (Number.isFinite(v129)) {
    return v129;
  } else {
    return 0;
  }
}
function formatBytes(v130) {
  const v131 = {
    dh20: 162,
    dh21: 151,
    dh22: 184,
    dh23: 146,
    dh24: 142
  };
  const v132 = v2;
  if (!v130) {
    return "Unknown";
  }
  const v133 = 1024;
  const v134 = ["Bytes", "KB", "MB", "GB", "TB"];
  const v135 = Math.floor(Math.log(v130) / Math.log(v133));
  return parseFloat((v130 / Math.pow(v133, v135)).toFixed(2)) + " " + v134[v135];
}
var SEGMENT_SAMPLE_SIZE = 5;
function getRealSegmentSize(v136) {
  const v137 = {
    dh25: 129,
    dh26: 139
  };
  return __async(this, null, function* () {
    const v138 = v1;
    try {
      const v139 = yield __nvFetch(v136, {
        method: "HEAD",
        headers: HEADERS,
        skipSizeCheck: true
      });
      const v140 = v139.headers.get("content-length");
      if (v140) {
        return parseInt(v140, 10);
      }
    } catch (v141) {}
    try {
      const v142 = yield __nvFetch(v136, {
        headers: __spreadProps(__spreadValues({}, HEADERS), {
          Range: "bytes=0-1"
        }),
        skipSizeCheck: true
      });
      const v143 = v142.headers.get("content-range");
      const v144 = v143 && v143.match(/\/(\d+)$/);
      if (v144) {
        return parseInt(v144[1], 10);
      }
    } catch (v145) {}
    return null;
  });
}
function estimateHlsSize(v146) {
  const v147 = {
    dh27: 167,
    dh28: 156,
    dh29: 183,
    dh30: 144,
    dh31: 175
  };
  return __async(this, null, function* () {
    const v148 = v1;
    try {
      const v149 = yield __nvFetch(v146, {
        headers: HEADERS,
        skipSizeCheck: true
      });
      if (!v149.ok) {
        return "Unknown";
      }
      const v150 = yield v149.text();
      const v151 = v150.split("\n").map(v152 => v152.trim()).filter(v153 => v153.startsWith("http"));
      if (!v151.length) {
        return "Unknown";
      }
      const v154 = v151.filter((v155, v156) => v156 % Math.ceil(v151.length / SEGMENT_SAMPLE_SIZE) === 0).slice(0, SEGMENT_SAMPLE_SIZE);
      const v157 = yield Promise.all(v154.map(getRealSegmentSize));
      const v158 = v157.filter(v159 => v159 && v159 > 0);
      if (!v158.length) {
        return "Unknown";
      }
      const v160 = v158.reduce((v161, v162) => v161 + v162, 0) / v158.length;
      const v163 = v160 * v151.length;
      return formatBytes(v163);
    } catch (v164) {
      return "Unknown";
    }
  });
}
function getStreams(v165, v166, v167, v168) {
  const v169 = {
    dh32: 140,
    dh33: 124,
    dh34: 175,
    dh35: 179,
    dh36: 154,
    dh37: 181,
    dh38: 154,
    dh39: 157,
    dh40: 125,
    dh41: 172
  };
  return __async(this, null, function* () {
    const v170 = {
      dh42: 135,
      dh43: 126,
      dh44: 162
    };
    const v171 = v1;
    try {
      let v172 = v165;
      if (typeof v165 === "string" && v165.trim().toLowerCase().startsWith("tt")) {
        const v173 = "https://api.themoviedb.org/3/find/" + v165 + "?api_key=" + TMDB_API_KEY + "&external_source=imdb_id";
        const v174 = yield (yield __nvFetch(v173, {
          skipSizeCheck: true
        })).json();
        const v175 = v166 === "tv" ? v174.tv_results : v174.movie_results;
        v172 = v175 && v175.length ? v175[0].id : null;
        if (!v172) {
          return [];
        }
      }
      v172 = parseInt(v172, 10);
      if (!v172) {
        return [];
      }
      const v176 = yield getTmdbMeta(v172, v166);
      if (!v176 || !v176.title) {
        return [];
      }
      const v177 = yield getApiHost();
      const v178 = v166 === "tv";
      const v179 = yield __nvFetch(v177 + "/seed?mediaId=" + v172, {
        headers: HEADERS,
        skipSizeCheck: true
      });
      if (!v179.ok) {
        return [];
      }
      const v180 = yield v179.json().catch(() => null);
      if (!v180 || !v180.seed) {
        return [];
      }
      const v181 = new URLSearchParams({
        title: v176.title,
        mediaType: v178 ? "tv" : "movie",
        year: v176.year || "",
        episodeId: String(v178 ? v168 || 1 : 1),
        seasonId: String(v178 ? v167 || 1 : 1),
        tmdbId: String(v172),
        imdbId: v176.imdbId || "",
        enc: "2",
        seed: v180.seed
      });
      const v182 = yield __nvFetch(v177 + "/cdn/sources-with-title?" + v181.toString(), {
        headers: HEADERS,
        skipSizeCheck: true
      });
      if (!v182.ok) {
        return [];
      }
      const v183 = yield v182.text();
      let v184;
      try {
        const v185 = decryptSourcesPayload(v183, v180.seed, v172);
        v184 = JSON.parse(v185);
      } catch (v186) {
        console.error("[Cineby] decrypt failed:", v186.message);
        return [];
      }
      const v187 = v184 && v184.sources || [];
      if (!v187.length) {
        return [];
      }
      const v188 = (v184 && v184.subtitles || []).filter(v189 => v189 && v189.url).map(v190 => ({
        url: v190.url,
        lang: v190.lang || v190.language || "Unknown"
      }));
      const v191 = yield Promise.all(v187.filter(v192 => v192 && v192.url).map(v193 => __async(this, null, function* () {
        const v194 = v171;
        const v195 = yield estimateHlsSize(v193.url);
        return {
          url: v193.url,
          quality: v193.quality || "Unknown",
          title: "Cineby " + (v193.quality || "Unknown"),
          name: "Cineby",
          size: v195,
          headers: HEADERS,
          subtitles: v188
        };
      })));
      v191.sort((v196, v197) => qualityRank(v197.quality) - qualityRank(v196.quality));
      return v191;
    } catch (v198) {
      console.error("[Cineby]", v198);
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
  var PROVIDER = "cineby";
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