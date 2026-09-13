/*
 * nv-plugins animepahe.js — rebased on the CURRENT All-in-One-Nuvio upstream file (4.26.0 sync pass).
 * Upstream version: 1.0.1. Decoded + identifier-normalized, zero obfuscator remnants.
 * nv tail re-attached: fail-open quality gate (4.26.0), en/tl language gate, cross-provider dedupe.
 */
var __create = Object.create;
var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __getProtoOf = Object.getPrototypeOf;
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
var __objRest = (v9, v10) => {
  var v11 = {};
  for (var v12 in v9) {
    if (__hasOwnProp.call(v9, v12) && v10.indexOf(v12) < 0) {
      v11[v12] = v9[v12];
    }
  }
  if (v9 != null && __getOwnPropSymbols) {
    for (var v12 of __getOwnPropSymbols(v9)) {
      if (v10.indexOf(v12) < 0 && __propIsEnum.call(v9, v12)) {
        v11[v12] = v9[v12];
      }
    }
  }
  return v11;
};
var __copyProps = (v13, v14, v15, v16) => {
  if (v14 && typeof v14 === "object" || typeof v14 === "function") {
    for (let v17 of __getOwnPropNames(v14)) {
      if (!__hasOwnProp.call(v13, v17) && v17 !== v15) {
        __defProp(v13, v17, {
          get: () => v14[v17],
          enumerable: !(v16 = __getOwnPropDesc(v14, v17)) || v16.enumerable
        });
      }
    }
  }
  return v13;
};
var __toESM = (v18, v19, v20) => {
  v20 = v18 != null ? __create(__getProtoOf(v18)) : {};
  return __copyProps(v19 || !v18 || !v18.__esModule ? __defProp(v20, "default", {
    value: v18,
    enumerable: true
  }) : v20, v18);
};
var __async = (v21, v22, v23) => {
  return new Promise((v24, v25) => {
    var v26 = v27 => {
      try {
        v28(v23.next(v27));
      } catch (v29) {
        v25(v29);
      }
    };
    var v30 = v31 => {
      try {
        v28(v23.throw(v31));
      } catch (v32) {
        v25(v32);
      }
    };
    var v28 = v33 => v33.done ? v24(v33.value) : Promise.resolve(v33.value).then(v26, v30);
    v28((v23 = v23.apply(v21, v22)).next());
  });
};
var import_cheerio_without_node_native = __toESM(require("cheerio-without-node-native"));
var MAIN_URL = "https://animepahe.com";
var PROXY_URL = "https://animepaheproxy.phisheranimepahe.workers.dev/?url=";
var HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36",
  Cookie: "__ddg2_=1234567890",
  Referer: "https://animepahe.com/"
};
function fetchText(v34) {
  return __async(this, arguments, function* (v35, v36 = {}) {
    const v37 = v36;
    const {
      useProxy = true
    } = v37;
    const v38 = __objRest(v37, ["useProxy"]);
    const v39 = v35.startsWith("http") ? v35 : "" + MAIN_URL + v35;
    const v40 = useProxy ? "" + PROXY_URL + encodeURIComponent(v39) : v39;
    const v41 = yield fetch(v40, __spreadValues({
      headers: HEADERS
    }, v38));
    if (!v41.ok) {
      throw new Error("HTTP " + v41.status + " on " + v39);
    }
    return yield v41.text();
  });
}
function fetchJson(v42) {
  return __async(this, arguments, function* (v43, v44 = {}) {
    const v45 = yield fetchText(v43, v44);
    return JSON.parse(v45);
  });
}
function getImdbId(v46, v47) {
  return __async(this, null, function* () {
    try {
      const v48 = "https://api.themoviedb.org/3/" + (v47 === "tv" ? "tv" : "movie") + "/" + v46 + "/external_ids?api_key=1865f43a0549ca50d341dd9ab8b29f49";
      const v49 = yield fetch(v48);
      const v50 = yield v49.json();
      return v50.imdb_id;
    } catch (v51) {
      return null;
    }
  });
}
function resolveMapping(v52, v53, v54) {
  return __async(this, null, function* () {
    try {
      const v55 = "https://id-mapping-api-malid.hf.space/api/resolve?id=" + v52 + "&s=" + v53 + "&e=" + v54;
      const v56 = yield fetch(v55);
      if (!v56.ok) {
        return null;
      }
      return yield v56.json();
    } catch (v57) {
      return null;
    }
  });
}
function getMalTitle(v58) {
  return __async(this, null, function* () {
    try {
      const v59 = yield fetch("https://api.jikan.moe/v4/anime/" + v58);
      if (!v59.ok) {
        return null;
      }
      const v60 = yield v59.json();
      return v60.data.title;
    } catch (v61) {
      return null;
    }
  });
}
function searchAnime(v62) {
  return __async(this, null, function* () {
    const v63 = "/api?m=search&l=8&q=" + encodeURIComponent(v62);
    return yield fetchJson(v63);
  });
}
function extractQuality(v64) {
  const v65 = v64.match(/(\d{3,4}p)/);
  if (v65) {
    return v65[1];
  } else {
    return "720p";
  }
}
function unpack(v66) {
  try {
    const v67 = v66.match(/}\((['"])([\s\S]*?)\1,\s*(\d+),\s*(\d+),\s*(['"])([\s\S]*?)\5\.split\((['"])\|\7\)/);
    if (v67) {
      let [v68, v69, v70, v71, v72, v73, v74] = v67;
      v70 = v70.replace(/\\'/g, "'").replace(/\\"/g, "\"").replace(/\\\\/g, "\\");
      v71 = parseInt(v71);
      v72 = parseInt(v72);
      const v75 = v74.split("|");
      const v76 = v77 => (v77 < v71 ? "" : v76(parseInt(v77 / v71))) + ((v77 = v77 % v71) > 35 ? String.fromCharCode(v77 + 29) : v77.toString(36));
      const v78 = {};
      while (v72--) {
        v78[v76(v72)] = v75[v72] || v76(v72);
      }
      return v70.replace(/\b\w+\b/g, v79 => v78[v79]);
    }
  } catch (v80) {
    console.error("[AnimePahe] Unpack error:", v80.message);
  }
  return v66;
}
function extractKwik(v81) {
  return __async(this, null, function* () {
    try {
      const v82 = globalThis.SCRAPER_SETTINGS || {};
      const v83 = v82.domain || "https://animepahe.com";
      const v84 = yield fetchText(v81, {
        headers: __spreadProps(__spreadValues({}, HEADERS), {
          Referer: v83 + "/",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }),
        useProxy: false
      });
      const v85 = v84.match(/<script.*?>([\s\S]*?)<\/script>/g) || [];
      const v86 = [];
      for (const v87 of v85) {
        if (v87.includes("eval(function(p,a,c,k,e,d)")) {
          let v88 = 0;
          while (true) {
            const v89 = v87.indexOf("eval(function(p,a,c,k,e,d)", v88);
            if (v89 === -1) {
              break;
            }
            const v90 = v87.indexOf(".split('|')", v89);
            if (v90 === -1) {
              break;
            }
            const v91 = v87.indexOf("))", v90);
            if (v91 === -1) {
              break;
            }
            v86.push(v87.substring(v89, v91 + 2));
            v88 = v91 + 2;
          }
        }
      }
      for (const v92 of v86) {
        const v93 = unpack(v92);
        const v94 = v93.match(/source\s*=\s*'([^']+m3u8[^']*)'/) || v93.match(/source\s*=\s*"([^"]+m3u8[^"]*)"/);
        if (v94) {
          return {
            url: v94[1],
            headers: {
              Referer: "https://kwik.cx/",
              Origin: "https://kwik.cx",
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            }
          };
        }
      }
    } catch (v95) {
      console.error("[AnimePahe] Kwik extraction failed:", v95.message);
    }
    return null;
  });
}
function getStreams(v96, v97, v98, v99) {
  return __async(this, null, function* () {
    try {
      let v100 = null;
      let v101 = "";
      let v102 = v99;
      let v103 = null;
      if (v97 === "tv") {
        const v104 = yield getImdbId(v96, v97);
        if (!v104) {
          return [];
        }
        const v105 = yield resolveMapping(v104, v98, v99);
        if (!v105 || !v105.mal_id) {
          return [];
        }
        v103 = v105.mal_id;
        v102 = v105.mal_episode || v99;
        v101 = yield getMalTitle(v103);
        if (!v101) {
          return [];
        }
        const v106 = yield searchAnime(v101);
        if (v106.data && v106.data.length > 0) {
          for (let v107 = 0; v107 < Math.min(v106.data.length, 3); v107++) {
            const v108 = v106.data[v107];
            const v109 = yield fetchText("/anime/" + v108.session);
            if (v109.includes("myanimelist.net/anime/" + v103)) {
              v100 = v108.session;
              break;
            }
          }
        }
      } else {
        const v110 = "https://api.themoviedb.org/3/movie/" + v96 + "?api_key=1865f43a0549ca50d341dd9ab8b29f49";
        const v111 = yield fetch(v110);
        const v112 = yield v111.json();
        v101 = v112.title || v112.original_title;
        v102 = 1;
        if (!v101) {
          return [];
        }
        const v113 = yield searchAnime(v101);
        if (v113.data && v113.data.length > 0) {
          const v114 = v113.data[0];
          if (v114.title.toLowerCase() === v101.toLowerCase()) {
            v100 = v114.session;
          }
        }
      }
      if (!v100) {
        return [];
      }
      const v115 = "/api?m=release&id=" + v100 + "&sort=episode_asc&page=1";
      const v116 = yield fetchJson(v115);
      if (!v116.data || v116.data.length === 0) {
        return [];
      }
      const v117 = Math.floor(v116.data[0].episode);
      const v118 = v116.per_page || 30;
      const v119 = v117 - 1 + v102;
      const v120 = Math.ceil(v102 / v118) || 1;
      const v121 = "/api?m=release&id=" + v100 + "&sort=episode_asc&page=" + v120;
      const v122 = yield fetchJson(v121);
      let v123 = null;
      if (v122 && v122.data) {
        const v124 = v122.data.find(v125 => Math.floor(v125.episode) == v119);
        if (v124) {
          v123 = v124.session;
        }
      }
      if (!v123 && v120 !== 1) {
        const v126 = v116.data.find(v127 => Math.floor(v127.episode) == v119);
        if (v126) {
          v123 = v126.session;
        }
      }
      if (!v123) {
        return [];
      }
      const v128 = "/play/" + v100 + "/" + v123;
      const v129 = yield fetchText(v128);
      const v130 = import_cheerio_without_node_native.default.load(v129);
      const v131 = [];
      const v132 = [];
      v130("#resolutionMenu button").each((v133, v134) => {
        const v135 = v130(v134);
        const v136 = v135.attr("data-src");
        const v137 = v135.text();
        const v138 = extractQuality(v137);
        const v139 = v137.toLowerCase().includes("eng") ? "Dub" : "Sub";
        if (v136 && v136.includes("kwik")) {
          v132.push(extractKwik(v136).then(v140 => {
            if (v140) {
              v131.push({
                name: "AnimePahe (" + v138 + " " + v139 + ")",
                title: v101 + " - Episode " + v102,
                url: v140.url,
                quality: v138,
                headers: v140.headers
              });
            }
          }));
        }
      });
      yield Promise.all(v132);
      const v141 = {
        "1080p": 3,
        "720p": 2,
        "360p": 1
      };
      return v131.sort((v142, v143) => (v141[v143.quality] || 0) - (v141[v142.quality] || 0));
    } catch (v144) {
      return [];
    }
  });
}
function onSettings() {
  return __async(this, null, function* () {
    return [{
      type: "header",
      label: "Domain Selection"
    }, {
      type: "select",
      key: "domain",
      label: "Preferred Domain",
      description: "AnimePahe frequently rotates domains. Choose the one currently working for you.",
      options: [{
        label: "animepahe.com",
        value: "https://animepahe.com"
      }, {
        label: "animepahe.org",
        value: "https://animepahe.org"
      }, {
        label: "animepahe.pw",
        value: "https://animepahe.pw"
      }],
      defaultValue: "https://animepahe.com"
    }];
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
/*
 * nv-plugins animepahe.js — FULLY DECODED port of the All-in-One-Nuvio provider (4.24.0 merge pass).
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
var __create = Object.create;
var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __getProtoOf = Object.getPrototypeOf;
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
var __objRest = (v12, v13) => {
  const v14 = v2;
  var v15 = {};
  for (var v16 in v12) {
    if (__hasOwnProp.call(v12, v16) && v13.indexOf(v16) < 0) {
      v15[v16] = v12[v16];
    }
  }
  if (v12 != null && __getOwnPropSymbols) {
    for (var v16 of __getOwnPropSymbols(v12)) {
      if (v13.indexOf(v16) < 0 && __propIsEnum.call(v12, v16)) {
        v15[v16] = v12[v16];
      }
    }
  }
  return v15;
};
var __copyProps = (v17, v18, v19, v20) => {
  const v21 = v2;
  if (v18 && typeof v18 === "object" || typeof v18 === "function") {
    for (let v22 of __getOwnPropNames(v18)) {
      if (!__hasOwnProp.call(v17, v22) && v22 !== v19) {
        __defProp(v17, v22, {
          get: () => v18[v22],
          enumerable: !(v20 = __getOwnPropDesc(v18, v22)) || v20.enumerable
        });
      }
    }
  }
  return v17;
};
var __toESM = (v23, v24, v25) => {
  v25 = v23 != null ? __create(__getProtoOf(v23)) : {};
  return __copyProps(v24 || !v23 || !v23.__esModule ? __defProp(v25, "default", {
    value: v23,
    enumerable: true
  }) : v25, v23);
};
var __async = (v26, v27, v28) => {
  return new Promise((v29, v30) => {
    const v31 = v1;
    var v32 = v33 => {
      const v34 = v1;
      try {
        v35(v28.next(v33));
      } catch (v36) {
        v30(v36);
      }
    };
    var v37 = v38 => {
      try {
        v35(v28.throw(v38));
      } catch (v39) {
        v30(v39);
      }
    };
    var v35 = v40 => v40.done ? v29(v40.value) : Promise.resolve(v40.value).then(v32, v37);
    v35((v28 = v28.apply(v26, v27)).next());
  });
};
var import_cheerio_without_node_native = __toESM(__nvRequire("cheerio-without-node-native"));
var MAIN_URL = "https://animepahe.com";
var PROXY_URL = "https://animepaheproxy.phisheranimepahe.workers.dev/?url=";
var HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36",
  Cookie: "__ddg2_=1234567890",
  Referer: "https://animepahe.com/"
};
function fetchText(v41) {
  return __async(this, arguments, function* (v42, v43 = {}) {
    const v44 = v1;
    const v45 = v43;
    const {
      useProxy = true
    } = v45;
    const v46 = __objRest(v45, ["useProxy"]);
    const v47 = v42.startsWith("http") ? v42 : "" + MAIN_URL + v42;
    const v48 = useProxy ? "" + PROXY_URL + encodeURIComponent(v47) : v47;
    const v49 = yield __nvFetch(v48, __spreadValues({
      headers: HEADERS
    }, v46));
    if (!v49.ok) {
      throw new Error("HTTP " + v49.status + " on " + v47);
    }
    return yield v49.text();
  });
}
function fetchJson(v50) {
  return __async(this, arguments, function* (v51, v52 = {}) {
    const v53 = v1;
    const v54 = yield fetchText(v51, v52);
    return JSON.parse(v54);
  });
}
function getImdbId(v55, v56) {
  return __async(this, null, function* () {
    const v57 = v1;
    try {
      const v58 = "https://api.themoviedb.org/3/" + (v56 === "tv" ? "tv" : "movie") + "/" + v55 + "/external_ids?api_key=1865f43a0549ca50d341dd9ab8b29f49";
      const v59 = yield __nvFetch(v58);
      const v60 = yield v59.json();
      return v60.imdb_id;
    } catch (v61) {
      return null;
    }
  });
}
function resolveMapping(v62, v63, v64) {
  return __async(this, null, function* () {
    const v65 = v1;
    try {
      const v66 = "https://id-mapping-api-malid.hf.space/api/resolve?id=" + v62 + "&s=" + v63 + "&e=" + v64;
      const v67 = yield __nvFetch(v66);
      if (!v67.ok) {
        return null;
      }
      return yield v67.json();
    } catch (v68) {
      return null;
    }
  });
}
function getMalTitle(v69) {
  return __async(this, null, function* () {
    const v70 = v1;
    try {
      const v71 = yield __nvFetch("https://api.jikan.moe/v4/anime/" + v69);
      if (!v71.ok) {
        return null;
      }
      const v72 = yield v71.json();
      return v72.data.title;
    } catch (v73) {
      return null;
    }
  });
}
function searchAnime(v74) {
  return __async(this, null, function* () {
    const v75 = "/api?m=search&l=8&q=" + encodeURIComponent(v74);
    return yield fetchJson(v75);
  });
} /*string-table removed*/ /*decoder removed*/
function extractQuality(v76) {
  const v77 = v2;
  const v78 = v76.match(/(\d{3,4}p)/);
  if (v78) {
    return v78[1];
  } else {
    return "720p";
  }
}
function unpack(v79) {
  const v80 = v2;
  try {
    const v81 = v79.match(/}\((['"])([\s\S]*?)\1,\s*(\d+),\s*(\d+),\s*(['"])([\s\S]*?)\5\.split\((['"])\|\7\)/);
    if (v81) {
      let [v82, v83, v84, v85, v86, v87, v88] = v81;
      v84 = v84.replace(/\\'/g, "'").replace(/\\"/g, "\"").replace(/\\\\/g, "\\");
      v85 = parseInt(v85);
      v86 = parseInt(v86);
      const v89 = v88.split("|");
      const v90 = v91 => (v91 < v85 ? "" : v90(parseInt(v91 / v85))) + ((v91 = v91 % v85) > 35 ? String.fromCharCode(v91 + 29) : v91.toString(36));
      const v92 = {};
      while (v86--) {
        v92[v90(v86)] = v89[v86] || v90(v86);
      }
      return v84.replace(/\b\w+\b/g, v93 => v92[v93]);
    }
  } catch (v94) {
    console.error("[AnimePahe] Unpack error:", v94.message);
  }
  return v79;
}
function extractKwik(v95) {
  return __async(this, null, function* () {
    const v96 = v1;
    try {
      const v97 = globalThis.SCRAPER_SETTINGS || {};
      const v98 = v97.domain || "https://animepahe.com";
      const v99 = yield fetchText(v95, {
        headers: __spreadProps(__spreadValues({}, HEADERS), {
          Referer: v98 + "/",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }),
        useProxy: false
      });
      const v100 = v99.match(/<script.*?>([\s\S]*?)<\/script>/g) || [];
      const v101 = [];
      for (const v102 of v100) {
        if (v102.includes("eval(function(p,a,c,k,e,d)")) {
          let v103 = 0;
          while (true) {
            const v104 = v102.indexOf("eval(function(p,a,c,k,e,d)", v103);
            if (v104 === -1) {
              break;
            }
            const v105 = v102.indexOf(".split('|')", v104);
            if (v105 === -1) {
              break;
            }
            const v106 = v102.indexOf("))", v105);
            if (v106 === -1) {
              break;
            }
            v101.push(v102.substring(v104, v106 + 2));
            v103 = v106 + 2;
          }
        }
      }
      for (const v107 of v101) {
        const v108 = unpack(v107);
        const v109 = v108.match(/source\s*=\s*'([^']+m3u8[^']*)'/) || v108.match(/source\s*=\s*"([^"]+m3u8[^"]*)"/);
        if (v109) {
          return {
            url: v109[1],
            headers: {
              Referer: "https://kwik.cx/",
              Origin: "https://kwik.cx",
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            }
          };
        }
      }
    } catch (v110) {
      console.error("[AnimePahe] Kwik extraction failed:", v110.message);
    }
    return null;
  });
}
function getStreams(v111, v112, v113, v114) {
  return __async(this, null, function* () {
    const v115 = v1;
    try {
      let v116 = null;
      let v117 = "";
      let v118 = v114;
      let v119 = null;
      if (v112 === "tv") {
        const v120 = yield getImdbId(v111, v112);
        if (!v120) {
          return [];
        }
        const v121 = yield resolveMapping(v120, v113, v114);
        if (!v121 || !v121.mal_id) {
          return [];
        }
        v119 = v121.mal_id;
        v118 = v121.mal_episode || v114;
        v117 = yield getMalTitle(v119);
        if (!v117) {
          return [];
        }
        const v122 = yield searchAnime(v117);
        if (v122.data && v122.data.length > 0) {
          for (let v123 = 0; v123 < Math.min(v122.data.length, 3); v123++) {
            const v124 = v122.data[v123];
            const v125 = yield fetchText("/anime/" + v124.session);
            if (v125.includes("myanimelist.net/anime/" + v119)) {
              v116 = v124.session;
              break;
            }
          }
        }
      } else {
        const v126 = "https://api.themoviedb.org/3/movie/" + v111 + "?api_key=1865f43a0549ca50d341dd9ab8b29f49";
        const v127 = yield __nvFetch(v126);
        const v128 = yield v127.json();
        v117 = v128.title || v128.original_title;
        v118 = 1;
        if (!v117) {
          return [];
        }
        const v129 = yield searchAnime(v117);
        if (v129.data && v129.data.length > 0) {
          const v130 = v129.data[0];
          if (v130.title.toLowerCase() === v117.toLowerCase()) {
            v116 = v130.session;
          }
        }
      }
      if (!v116) {
        return [];
      }
      const v131 = "/api?m=release&id=" + v116 + "&sort=episode_asc&page=1";
      const v132 = yield fetchJson(v131);
      if (!v132.data || v132.data.length === 0) {
        return [];
      }
      const v133 = Math.floor(v132.data[0].episode);
      const v134 = v132.per_page || 30;
      const v135 = v133 - 1 + v118;
      const v136 = Math.ceil(v118 / v134) || 1;
      const v137 = "/api?m=release&id=" + v116 + "&sort=episode_asc&page=" + v136;
      const v138 = yield fetchJson(v137);
      let v139 = null;
      if (v138 && v138.data) {
        const v140 = v138.data.find(v141 => Math.floor(v141.episode) == v135);
        if (v140) {
          v139 = v140.session;
        }
      }
      if (!v139 && v136 !== 1) {
        const v142 = v132.data.find(v143 => Math.floor(v143.episode) == v135);
        if (v142) {
          v139 = v142.session;
        }
      }
      if (!v139) {
        return [];
      }
      const v144 = "/play/" + v116 + "/" + v139;
      const v145 = yield fetchText(v144);
      const v146 = import_cheerio_without_node_native.default.load(v145);
      const v147 = [];
      const v148 = [];
      v146("#resolutionMenu button").each((v149, v150) => {
        const v151 = v115;
        const v152 = v146(v150);
        const v153 = v152.attr("data-src");
        const v154 = v152.text();
        const v155 = extractQuality(v154);
        const v156 = v154.toLowerCase().includes("eng") ? "Dub" : "Sub";
        if (v153 && v153.includes("kwik")) {
          v148.push(extractKwik(v153).then(v157 => {
            const v158 = v151;
            if (v157) {
              v147.push({
                name: "AnimePahe (" + v155 + " " + v156 + ")",
                title: v117 + " - Episode " + v118,
                url: v157.url,
                quality: v155,
                headers: v157.headers
              });
            }
          }));
        }
      });
      yield Promise.all(v148);
      const v159 = {
        "1080p": 3,
        "720p": 2,
        "360p": 1
      };
      return v147.sort((v160, v161) => (v159[v161.quality] || 0) - (v159[v160.quality] || 0));
    } catch (v162) {
      return [];
    }
  });
}
function onSettings() {
  return __async(this, null, function* () {
    const v163 = v1;
    return [{
      type: "header",
      label: "Domain Selection"
    }, {
      type: "select",
      key: "domain",
      label: "Preferred Domain",
      description: "AnimePahe frequently rotates domains. Choose the one currently working for you.",
      options: [{
        label: "animepahe.com",
        value: "https://animepahe.com"
      }, {
        label: "animepahe.org",
        value: "https://animepahe.org"
      }, {
        label: "animepahe.pw",
        value: "https://animepahe.pw"
      }],
      defaultValue: "https://animepahe.com"
    }];
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
  var PROVIDER = "animepahe";
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