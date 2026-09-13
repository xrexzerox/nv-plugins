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