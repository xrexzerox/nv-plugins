/*
 * nv-plugins videasy.js — FULLY DECODED port of the All-in-One-Nuvio provider (4.24.0 merge pass).
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
var TMDB_API_KEY = "439c478a771f35c05022f9feabcca01c";
var TMDB_BASE_URL = "https://api.themoviedb.org/3";
var WINGS_API_BASE = "https://api.speedracelight.com";
var USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";
var REQUEST_HEADERS = {
  "User-Agent": USER_AGENT,
  Accept: "*/*",
  Origin: "https://www.vidking.net",
  Referer: "https://www.vidking.net/",
  "Cache-Control": "no-cache, no-store, must-revalidate",
  Pragma: "no-cache",
  Expires: "0"
};
var SERVERS = {
  Hydrogen: {
    path: "cdn/sources-with-title"
  },
  Titanium: {
    path: "tejo/sources-with-title"
  },
  Oxygen: {
    path: "neon2/sources-with-title"
  },
  Lithium: {
    path: "downloader2/sources-with-title"
  },
  Krypton: {
    path: "ym/sources-with-title"
  },
  Carbon: {
    path: "mb-flix/sources-with-title"
  },
  Aluminium: {
    path: "lamovie/sources-with-title"
  },
  Nitrogen: {
    path: "m4uhd/sources-with-title"
  },
  Neon: {
    path: "superflix/sources-with-title"
  },
  Helium: {
    path: "1movies/sources-with-title"
  }
};
var jl = [1116352408, 1899447441, 3049323471, 3921009573, 961987163, 1508970993, 2453635748, 2870763221, 3624381080, 310598401, 607225278, 1426881987, 1925078388, 2162078206, 2614888103, 3248222580];
var Tf = [1732584193, 4023233417, 2562383102, 271733878];
var Js = 61;
var _f = 8;
var ms = 2654435769;
var Ys = [109, 118, 109, 49];
var Sf = v18 => (v18 * (v18 + 1) & 1) === 0;
var bf = v19 => (v19 * (v19 + 1) & 1) === 1;
function ui(v20) {
  const v21 = v2;
  v20 >>>= 0;
  v20 ^= v20 >>> 16;
  v20 = Math.imul(v20, 2246822507) >>> 0;
  v20 ^= v20 >>> 13;
  v20 = Math.imul(v20, 3266489909) >>> 0;
  v20 ^= v20 >>> 16;
  return v20 >>> 0;
}
function ps(v22, v23) {
  v22 >>>= 0;
  v23 &= 31;
  if (v23 === 0) {
    return v22 >>> 0;
  } else {
    return (v22 << v23 | v22 >>> 32 - v23) >>> 0;
  }
}
function If(v24) {
  const v25 = {
    dh1: 545,
    dh2: 510
  };
  const v26 = v2;
  let v27 = Tf[0] >>> 0;
  for (let v28 = 0; v28 < v24.length; v28++) {
    v27 = ps((v27 ^ Math.imul(v24.charCodeAt(v28), jl[v28 & 15])) >>> 0, 5);
  }
  return ui(v27);
}
function Af(v29) {
  const v30 = v2;
  const v31 = new Array(256);
  for (let v32 = 0; v32 < 256; v32++) {
    v31[v32] = v32;
  }
  let v33 = 0;
  for (let v34 = 0; v34 < 256; v34++) {
    v33 = v33 + v31[v34] + v29.charCodeAt(v34 % v29.length) & 255;
    const v35 = v31[v34];
    v31[v34] = v31[v33];
    v31[v33] = v35;
  }
  return v31;
}
function wf(v36) {
  const v37 = {
    dh3: 545
  };
  const v38 = v2;
  let v39 = 2166136261;
  for (let v40 = 0; v40 < v36.length; v40++) {
    v39 = Math.imul(v39 ^ v36.charCodeAt(v40), 16777619) >>> 0;
  }
  return ui(v39);
}
function vf(v41, v42, v43) {
  return ((v41 ^ v42) >>> 0 | (v41 & v42 & v43) >>> 0) >>> 0;
}
function Nf(v44, v45) {
  if (bf(v44.length)) {
    return {
      S: Af(v44),
      acc: If(v44)
    };
  }
  const v46 = new Array(Js);
  let v47 = ui(wf(v44) ^ ui(v45 >>> 0 ^ ms)) >>> 0;
  for (let v48 = 0; v48 < _f; v48++) {
    if (Sf(v48)) {
      const v49 = v47 % Js;
      v47 = ps(v47 + ms >>> 0, 7 + (v48 & 7));
      v46[v49] = (v47 ^ ui(v47)) >>> 0;
      v47 = ui(v47 + v49 >>> 0);
    } else {
      v46[v48] = jl[v48 & 15];
    }
  }
  return {
    S: v46,
    acc: ui(v47 ^ -1515870811) >>> 0
  };
}
function Rf(v50, v51) {
  const v52 = {
    dh4: 515
  };
  const v53 = v2;
  const v54 = v50.S;
  let v55 = v50.acc;
  const v56 = v55 % Js;
  const v57 = 0 - +(v56 in v54);
  const v58 = v54[v56] >>> 0;
  const v59 = Math.imul(ms, v51 + 1) >>> 0;
  let v60 = vf(v55, (v58 ^ v59) >>> 0, v57);
  v60 = (ps(v60 + v55 >>> 0, v56 & 31) ^ ps(v55, Math.imul(v56, 7) & 31)) >>> 0;
  v55 = ui(v60 + ms >>> 0);
  v54[v56] = v55 >>> 0;
  v50.acc = v55;
  return v55 >>> 0;
}
function Cf(v61, v62, v63) {
  const v64 = Nf(v61, v62);
  const v65 = new Uint8Array(v63);
  let v66 = 0;
  for (let v67 = 0; v67 < v63;) {
    const v68 = Rf(v64, v66++);
    v65[v67++] = v68 & 255;
    if (v67 < v63) {
      v65[v67++] = v68 >>> 8 & 255;
    }
    if (v67 < v63) {
      v65[v67++] = v68 >>> 16 & 255;
    }
    if (v67 < v63) {
      v65[v67++] = v68 >>> 24 & 255;
    }
  }
  return v65;
}
function decodeBase64(v69) {
  const v70 = {
    dh5: 546,
    dh6: 551
  };
  const v71 = v2;
  const v72 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  const v73 = v69.replace(/-/g, "+").replace(/_/g, "/").replace(/=+$/, "");
  const v74 = v73.length;
  const v75 = new Uint8Array(Math.floor(v74 * 0.75));
  let v76 = 0;
  for (let v77 = 0; v77 < v74; v77 += 4) {
    const v78 = v72.indexOf(v73[v77]);
    const v79 = v72.indexOf(v73[v77 + 1] || "A");
    const v80 = v72.indexOf(v73[v77 + 2] || "A");
    const v81 = v72.indexOf(v73[v77 + 3] || "A");
    v75[v76++] = v78 << 2 | v79 >> 4;
    if (v77 + 2 < v74) {
      v75[v76++] = (v79 & 15) << 4 | v80 >> 2;
    }
    if (v77 + 3 < v74) {
      v75[v76++] = (v80 & 3) << 6 | v81;
    }
  }
  return v75;
}
function xf(v82) {
  return decodeBase64(v82);
}
function decryptWingsDatabase(v83, v84, v85) {
  const v86 = {
    dh7: 447,
    dh8: 488
  };
  const v87 = v2;
  const v88 = xf(v83);
  const v89 = Cf(v84, v85, v88.length);
  for (let v90 = 0; v90 < v88.length; v90++) {
    v88[v90] ^= v89[v90];
  }
  for (let v91 = 0; v91 < Ys.length; v91++) {
    if (v88[v91] !== Ys[v91]) {
      throw new Error("decrypt failed: bad seed or tampered payload");
    }
  }
  let v92 = "";
  const v93 = v88.subarray(Ys.length);
  for (let v94 = 0; v94 < v93.length;) {
    const v95 = v93[v94++];
    if (v95 < 128) {
      v92 += String.fromCharCode(v95);
    } else if (v95 > 191 && v95 < 224) {
      v92 += String.fromCharCode((v95 & 31) << 6 | v93[v94++] & 63);
    } else if (v95 > 223 && v95 < 240) {
      v92 += String.fromCharCode((v95 & 15) << 12 | (v93[v94++] & 63) << 6 | v93[v94++] & 63);
    } else {
      v92 += String.fromCharCode((v95 & 7) << 18 | (v93[v94++] & 63) << 12 | (v93[v94++] & 63) << 6 | v93[v94++] & 63);
    }
  }
  return v92;
}
function fetchMediaDetails(v96, v97, v98, v99) {
  const v100 = {
    dh9: 527,
    dh10: 546,
    dh11: 456,
    dh12: 504,
    dh13: 518,
    dh14: 472,
    dh15: 471,
    dh16: 514,
    dh17: 482
  };
  return __async(this, null, function* () {
    const v101 = v1;
    var v102;
    let v103 = v97 === "tv" ? "45 min" : "90 min";
    try {
      const v104 = v97 === "tv" ? "tv" : "movie";
      const v105 = String(v96).replace(/\D/g, "");
      const v106 = TMDB_BASE_URL + "/" + v104 + "/" + v105 + "?api_key=" + TMDB_API_KEY + "&append_to_response=external_ids";
      const v107 = yield __nvFetch(v106, {
        headers: {
          "User-Agent": REQUEST_HEADERS["User-Agent"],
          Accept: "application/json"
        }
      });
      if (!v107.ok) {
        throw new Error("TMDB HTTP " + v107.status);
      }
      const v108 = yield v107.json();
      let v109 = v103;
      if (v97 === "movie" && v108.runtime) {
        v109 = v108.runtime + " min";
      } else if (v97 === "tv" && v98 != null && v99 != null) {
        const v110 = TMDB_BASE_URL + "/tv/" + v105 + "/season/" + v98 + "/episode/" + v99 + "?api_key=" + TMDB_API_KEY;
        const v111 = yield __nvFetch(v110);
        if (v111.ok) {
          const v112 = yield v111.json();
          if (v112 && v112.runtime) {
            v109 = v112.runtime + " min";
          } else if (v108.episode_run_time && v108.episode_run_time.length > 0) {
            v109 = v108.episode_run_time[0] + " min";
          }
        }
      }
      return {
        title: v97 === "tv" ? v108.name : v108.title,
        year: (v97 === "tv" ? v108.first_air_date : v108.release_date || "").substring(0, 4),
        imdbId: ((v102 = v108.external_ids) == null ? undefined : v102.imdb_id) || null,
        mediaType: v97,
        duration: v109
      };
    } catch (v113) {
      console.error("[VidEasy] TMDB details fetch error: " + v113.message);
      return {
        title: v97 === "tv" ? "Unknown TV Show" : "Unknown Movie",
        year: "N/A",
        imdbId: null,
        mediaType: v97,
        duration: v103
      };
    }
  });
} /*decoder removed*/
function getLangCode(v114) {
  const v115 = {
    dh18: 489
  };
  const v116 = v2;
  if (!v114) {
    return "en";
  }
  const v117 = {
    english: "en",
    spanish: "es",
    french: "fr",
    german: "de",
    italian: "it",
    portuguese: "pt",
    "portuguese (br)": "pt-br",
    arabic: "ar",
    japanese: "ja",
    korean: "ko",
    tamil: "ta",
    telugu: "te",
    malayalam: "ml",
    kannada: "kn",
    hindi: "hi",
    polish: "pl",
    greek: "el",
    croatian: "hr",
    ukrainian: "uk",
    lithuanian: "lt",
    thai: "th",
    estonian: "et",
    czech: "cs",
    "zh-tw": "zh-tw",
    bokmål: "no",
    dutch: "nl",
    indonesian: "id",
    sinhala: "si",
    swedish: "sv",
    romanian: "ro",
    malay: "ms",
    persian: "fa",
    slovak: "sk",
    bulgarian: "bg",
    turkish: "tr",
    danish: "da",
    hebrew: "he",
    serbian: "sr",
    vietnamese: "vi",
    hungarian: "hu",
    icelandic: "is",
    albanian: "sq",
    bosnian: "bs",
    slovenian: "sl",
    bengali: "bn",
    macedonian: "mk"
  };
  return v117[v114.toLowerCase().trim()] || "en";
}
function formatStreamsForNuvio(v118, v119, v120, v121, v122) {
  const v123 = {
    dh19: 476,
    dh20: 475
  };
  const v124 = {
    dh21: 538,
    dh22: 546,
    dh23: 528,
    dh24: 553,
    dh25: 512,
    dh26: 468,
    dh27: 474,
    dh28: 532,
    dh29: 537,
    dh30: 479,
    dh31: 521,
    dh32: 512,
    dh33: 519,
    dh34: 512,
    dh35: 494,
    dh36: 534,
    dh37: 508,
    dh38: 454,
    dh39: 450,
    dh40: 523
  };
  const v125 = v2;
  try {
    const v126 = JSON.parse(v118);
    if (!v126 || typeof v126 !== "object") {
      return [];
    }
    const v127 = {
      Referer: "https://www.vidking.net/",
      Origin: "https://www.vidking.net",
      "User-Agent": USER_AGENT
    };
    const v128 = (v126.subtitles || []).map(v129 => ({
      url: v129.url,
      language: getLangCode(v129.language || v129.lang),
      name: v129.language || v129.lang || "English",
      headers: v127
    }));
    const v130 = {
      Carbon: "💎",
      Helium: "🎈",
      Lithium: "🔋",
      Oxygen: "💨",
      Krypton: "🦸",
      Titanium: "🛡️",
      Hydrogen: "💧",
      Nitrogen: "🌿",
      Neon: "💡",
      Aluminium: "💿"
    };
    const v131 = v130[v119] || "🎬";
    const v132 = {
      Hydrogen: "CDN",
      Titanium: "Tejo",
      Oxygen: "Neon2",
      Lithium: "Downloader2",
      Krypton: "YM",
      Carbon: "MB-Flix",
      Aluminium: "LaMovie",
      Nitrogen: "M4UHD",
      Neon: "SuperFlix",
      Helium: "1Movies"
    };
    const v133 = v132[v119] || v119;
    const v134 = [];
    (v126.sources || []).forEach(v135 => {
      const v136 = v125;
      if (!v135.url) {
        return;
      }
      let v137 = v135.quality || "1080p";
      let v138 = v137.replace(/\s*server\s*2\s*$/gi, "").trim();
      if (v119 === "Oxygen") {
        v138 = "Auto";
      }
      let v139 = v138.toLowerCase();
      let v140 = "⚡ " + v138;
      if (v139.includes("2160") || v139.includes("4k")) {
        v140 = "🌟 2160p";
      } else if (v139.includes("1080")) {
        v140 = "🔥 1080p";
      } else if (v139.includes("720")) {
        v140 = "⚡ 720p";
      } else if (v139 === "auto") {
        v140 = "⚡ Auto";
      }
      let v141 = "Original Audio";
      let v142 = "🌍 Original Audio";
      if (v119 === "Hydrogen" || v119 === "Krypton") {
        v141 = "Original Audio";
        v142 = "🌍 Original Audio";
      } else if (v119 === "Oxygen") {
        v141 = "Multi-Audio";
        v142 = "🌍 Multi-Audio";
      } else if (v119 === "Aluminium") {
        v141 = "Dual-Audio";
        v142 = "🌍 Dual-Audio";
      } else if (v119 === "Magnesium") {
        const v143 = (v135.title || "").toLowerCase();
        if (v143.includes("bengali") || v143.includes("bangla")) {
          v141 = "Bengali";
          v142 = "🇧🇩 Bengali";
        } else {
          v141 = "Normal Hindi";
          v142 = "🇮🇳 Hindi";
        }
      }
      const v144 = v135.url.includes(".m3u8") ? "M3U8" : v135.url.includes(".mp4") ? "MP4" : "MKV";
      const v145 = v120.title + (v120.mediaType === "tv" ? " S" + v121 + "E" + v122 : "");
      let v146 = v119;
      if (v146 === "Krypton") {
        v146 = v146.replace(/\s*(1080p\s+)?server\s*2\s*$/gi, "").trim();
      }
      const v147 = "🎬 " + v145 + " - (" + v120.year + ")\n" + v140 + " | " + v142 + " | 🎧 AAC\n🎞️ " + v144 + " | ⏱️ " + v120.duration + "\n" + v131 + " " + v146 + " | 🔗 Provider: " + v133;
      v134.push({
        name: "VidEasy | " + v138 + " | " + v141,
        title: v147,
        size: v147,
        description: v147,
        url: v135.url,
        quality: "",
        language: "",
        headers: v127,
        subtitles: v128,
        provider: "videasy",
        _is4k: v139.includes("2160") || v139.includes("4k"),
        _serverName: v119
      });
    });
    return v134;
  } catch (v148) {
    console.error("[VidEasy] Formatting error: " + v148.message);
    return [];
  }
}
function fetchFromWingsServer(v149, v150, v151, v152, v153, v154, v155, v156) {
  const v157 = {
    dh41: 461,
    dh42: 480,
    dh43: 524,
    dh44: 463
  };
  return __async(this, null, function* () {
    const v158 = v1;
    const v159 = {
      title: v153.title,
      mediaType: v151,
      year: String(v153.year),
      episodeId: String(v156 || 1),
      seasonId: String(v155 || 1),
      tmdbId: String(v152),
      imdbId: v153.imdbId || "",
      enc: "2",
      seed: v154
    };
    const v160 = Object.keys(v159).map(v161 => encodeURIComponent(v161) + "=" + encodeURIComponent(v159[v161])).join("&");
    const v162 = WINGS_API_BASE + "/" + v150.path + "?" + v160;
    console.log("[VidEasy] Querying server " + v149 + ": " + v162);
    try {
      const v163 = yield __nvFetch(v162, {
        headers: REQUEST_HEADERS
      });
      if (!v163.ok) {
        throw new Error("HTTP " + v163.status);
      }
      const v164 = yield v163.text();
      if (!v164 || v164.trim() === "") {
        throw new Error("Empty response");
      }
      const v165 = decryptWingsDatabase(v164, v154, Number(v152));
      if (!v165) {
        return [];
      }
      const v166 = formatStreamsForNuvio(v165, v149, v153, v155, v156);
      console.log("[VidEasy] ✅ Found " + v166.length + " stream(s) from " + v149);
      return v166;
    } catch (v167) {
      console.warn("[VidEasy] ❌ Error from " + v149 + ": " + v167.message);
      return [];
    }
  });
} /*string-table removed*/
function getStreams(v168, v169, v170 = null, v171 = null) {
  const v172 = {
    dh45: 476,
    dh46: 465,
    dh47: 542,
    dh48: 461,
    dh49: 490,
    dh50: 475
  };
  const v173 = {
    dh51: 507,
    dh52: 492,
    dh53: 551
  };
  return __async(this, null, function* () {
    const v174 = {
      dh54: 534,
      dh55: 458
    };
    const v175 = v1;
    console.log("[VidEasy] Starting extraction for TMDB ID: " + v168 + ", Type: " + v169 + (v169 === "tv" ? ", S:" + v170 + "E:" + v171 : ""));
    try {
      const v176 = yield fetchMediaDetails(v168, v169, v170, v171);
      if (!v176) {
        console.error("[VidEasy] Failed to fetch media details from TMDB.");
        return [];
      }
      console.log("[VidEasy] Media Details: \"" + v176.title + "\" (" + v176.year + ") | Duration: " + v176.duration);
      const v177 = WINGS_API_BASE + "/seed?mediaId=" + v168;
      console.log("[VidEasy] Fetching seed from: " + v177);
      const v178 = yield __nvFetch(v177, {
        headers: REQUEST_HEADERS
      });
      if (!v178.ok) {
        throw new Error("Seed HTTP " + v178.status);
      }
      const v179 = yield v178.json();
      const v180 = v179.seed;
      if (!v180) {
        throw new Error("No seed returned from API");
      }
      console.log("[VidEasy] Seed successfully retrieved: " + v180);
      const v181 = Object.keys(SERVERS).map(v182 => {
        const v183 = SERVERS[v182];
        return fetchFromWingsServer(v182, v183, v169, v168, v176, v180, v170, v171);
      });
      const v184 = yield Promise.all(v181);
      const v185 = [];
      v184.forEach(v186 => {
        const v187 = v175;
        v185.push(...v186);
      });
      const v188 = [];
      const v189 = new Set();
      v185.forEach(v190 => {
        const v191 = v175;
        if (!v189.has(v190.url)) {
          v189.add(v190.url);
          v188.push(v190);
        }
      });
      const v192 = Object.keys(SERVERS);
      v188.sort((v193, v194) => {
        const v195 = v175;
        if (v193._is4k && !v194._is4k) {
          return -1;
        }
        if (!v193._is4k && v194._is4k) {
          return 1;
        }
        const v196 = v192.indexOf(v193._serverName);
        const v197 = v192.indexOf(v194._serverName);
        return v196 - v197;
      });
      console.log("[VidEasy] Total unique streams found: " + v188.length);
      return v188;
    } catch (v198) {
      console.error("[VidEasy] Error in getStreams: " + v198.message);
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
  var PROVIDER = "videasy";
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