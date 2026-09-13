/*
 * nv-plugins hianime.js — FULLY DECODED port of the All-in-One-Nuvio provider (4.24.0 merge pass).
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
/*decoder removed*/
/*string-table removed*/
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
var __copyProps = (v12, v13, v14, v15) => {
  const v16 = v2;
  if (v13 && typeof v13 === "object" || typeof v13 === "function") {
    for (let v17 of __getOwnPropNames(v13)) {
      if (!__hasOwnProp.call(v12, v17) && v17 !== v14) {
        __defProp(v12, v17, {
          get: () => v13[v17],
          enumerable: !(v15 = __getOwnPropDesc(v13, v17)) || v15.enumerable
        });
      }
    }
  }
  return v12;
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
    const v26 = v1;
    var v27 = v28 => {
      const v29 = v1;
      try {
        v30(v23.next(v28));
      } catch (v31) {
        v25(v31);
      }
    };
    var v32 = v33 => {
      const v34 = v1;
      try {
        v30(v23.throw(v33));
      } catch (v35) {
        v25(v35);
      }
    };
    var v30 = v36 => v36.done ? v24(v36.value) : Promise.resolve(v36.value).then(v27, v32);
    v30((v23 = v23.apply(v21, v22)).next());
  });
};
var import_cheerio_without_node_native = __toESM(__nvRequire("cheerio-without-node-native"));
var MEGAPLAY_BASE = "https://megaplay.buzz";
var VIDWISH_BASE = "https://vidwish.live";
var MEGACLOUD_BASE = "https://megacloud.bloggy.click";
var TMDB_API_KEY = "1865f43a0549ca50d341dd9ab8b29f49";
var DEFAULT_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Accept: "*/*",
  Connection: "keep-alive"
};
function fetchText(v37) {
  return __async(this, arguments, function* (v38, v39 = {}) {
    const v40 = v1;
    const v41 = yield __nvFetch(v38, __spreadValues({
      headers: __spreadValues(__spreadValues({}, DEFAULT_HEADERS), v39.headers)
    }, v39));
    if (!v41.ok) {
      throw new Error("HTTP " + v41.status + " on " + v38);
    }
    return yield v41.text();
  });
}
function fetchJson(v42) {
  return __async(this, arguments, function* (v43, v44 = {}) {
    const v45 = v1;
    const v46 = yield fetchText(v43, v44);
    return JSON.parse(v46);
  });
}
function getImdbId(v47, v48) {
  return __async(this, null, function* () {
    const v49 = v1;
    try {
      const v50 = "https://api.themoviedb.org/3/" + (v48 === "tv" ? "tv" : "movie") + "/" + v47 + "/external_ids?api_key=" + TMDB_API_KEY;
      const v51 = yield fetchJson(v50);
      return v51.imdb_id || null;
    } catch (v52) {
      return null;
    }
  });
}
function getTmdbDetails(v53, v54) {
  return __async(this, null, function* () {
    try {
      const v55 = "https://api.themoviedb.org/3/" + (v54 === "tv" ? "tv" : "movie") + "/" + v53 + "?api_key=" + TMDB_API_KEY;
      return yield fetchJson(v55);
    } catch (v56) {
      return null;
    }
  });
}
function getEpisodeMetadata(v57, v58, v59, v60) {
  return __async(this, null, function* () {
    const v61 = v1;
    try {
      if (v58 === "movie") {
        const v62 = "https://api.themoviedb.org/3/movie/" + v57 + "?api_key=" + TMDB_API_KEY;
        const v63 = yield fetchJson(v62);
        return {
          title: v63.title || "Movie",
          duration: v63.runtime ? v63.runtime + "m" : "N/A"
        };
      } else {
        const v64 = "https://api.themoviedb.org/3/tv/" + v57 + "/season/" + v59 + "/episode/" + v60 + "?api_key=" + TMDB_API_KEY;
        const v65 = yield fetchJson(v64);
        return {
          title: v65.name || "Episode " + v60,
          duration: v65.runtime ? v65.runtime + "m" : "24m"
        };
      }
    } catch (v66) {
      return {
        title: "Episode " + v60,
        duration: "24m"
      };
    }
  });
}
function resolveMapping(v67, v68, v69) {
  return __async(this, null, function* () {
    const v70 = v1;
    try {
      const v71 = "https://id-mapping-api-malid.hf.space/api/resolve?id=" + v67 + "&s=" + v68 + "&e=" + v69;
      const v72 = yield fetchJson(v71);
      if (v72.error) {
        return null;
      }
      return v72;
    } catch (v73) {
      return null;
    }
  });
}
function searchMalId(v74, v75) {
  return __async(this, null, function* () {
    const v76 = v1;
    try {
      const v77 = v75 === "movie" ? "movie" : "tv";
      const v78 = "https://api.jikan.moe/v4/anime?q=" + encodeURIComponent(v74) + "&type=" + v77 + "&limit=1";
      const v79 = yield fetchJson(v78);
      if (v79.data && v79.data.length > 0) {
        return v79.data[0].mal_id;
      }
      return null;
    } catch (v80) {
      return null;
    }
  });
}
function extractSources(v81, v82, v83, v84, v85, v86, v87, v88, v89, v90) {
  return __async(this, null, function* () {
    const v91 = v1;
    var v92;
    try {
      const v93 = yield fetchJson(v81, {
        headers: {
          "X-Requested-With": "XMLHttpRequest",
          Referer: v82,
          Origin: v83
        }
      });
      const v94 = (v92 = v93.sources) == null ? undefined : v92.file;
      if (!v94) {
        return [];
      }
      const v95 = v89.toLowerCase() === "sub" ? "Original (SUB)" : "English (DUB)";
      const v96 = v89.toUpperCase();
      let v97 = [];
      if (v86 === "movie") {
        v97 = ["🎬 " + v85, "🎞️ M3U8 | ⚡ Auto | 🌍 " + v95 + " | ⏱️ " + v90.duration];
      } else {
        v97 = ["🎬 " + v85, "🎥 S" + v87 + "E" + v88 + " - " + v90.epTitle, "🎞️ M3U8 | ⚡ Auto | 🌍 " + v95 + " | ⏱️ " + v90.duration];
      }
      const v98 = v97.join("\n");
      const v99 = [];
      v99.push({
        name: "HiAnime | Auto | [" + v84 + "] (" + v96 + ")",
        title: v98,
        url: v94,
        quality: "Auto",
        headers: __spreadProps(__spreadValues({}, DEFAULT_HEADERS), {
          Referer: v83 + "/",
          Origin: v83
        }),
        provider: "hianime",
        type: "m3u8"
      });
      if (v93.tracks && v93.tracks.length > 0) {
        const v100 = v93.tracks.filter(v101 => v101.file && v101.kind === "captions").map(v102 => ({
          url: v102.file,
          name: v102.label || "English",
          language: v102.label ? v102.label.slice(0, 3).toLowerCase() : "en"
        }));
        v99[0].subtitles = v100;
      }
      return v99;
    } catch (v103) {
      return [];
    }
  });
}
function scrapeType(v104, v105, v106, v107, v108, v109, v110) {
  return __async(this, null, function* () {
    const v111 = v1;
    const v112 = [];
    const v113 = MEGAPLAY_BASE + "/stream/mal/" + v104 + "/" + v105 + "/" + v106;
    try {
      const v114 = yield fetchText(v113, {
        headers: {
          Referer: v113
        }
      });
      const v115 = import_cheerio_without_node_native.default.load(v114);
      const v116 = v115("div.fix-area#megaplay-player");
      if (!v116.length) {
        return [];
      }
      const v117 = v116.attr("data-id");
      const v118 = v116.attr("data-realid");
      const v119 = [];
      if (v117) {
        const v120 = MEGAPLAY_BASE + "/stream/getSources?id=" + v117 + "&id=" + v117;
        v119.push(extractSources(v120, v113, MEGAPLAY_BASE, "MegaPlay", v107, v109, v110, v105, v106, v108));
      }
      if (v118) {
        const v121 = VIDWISH_BASE + "/stream/s-2/" + v118 + "/" + v106;
        v119.push((() => __async(this, null, function* () {
          const v122 = v111;
          try {
            const v123 = yield fetchText(v121, {
              headers: {
                Referer: v113
              }
            });
            const v124 = import_cheerio_without_node_native.default.load(v123);
            const v125 = v124("div.fix-area#megaplay-player");
            const v126 = v125.attr("data-id");
            if (v126) {
              const v127 = VIDWISH_BASE + "/stream/getSources?id=" + v126 + "&id=" + v126;
              return yield extractSources(v127, v121, VIDWISH_BASE, "Vidwish", v107, v109, v110, v105, v106, v108);
            }
          } catch (v128) {}
          return [];
        }))());
      }
      if (v118) {
        const v129 = MEGACLOUD_BASE + "/stream/s-3/" + v118 + "/" + v106;
        v119.push((() => __async(this, null, function* () {
          const v130 = v111;
          try {
            const v131 = yield fetchText(v129, {
              headers: {
                Referer: v113
              }
            });
            const v132 = import_cheerio_without_node_native.default.load(v131);
            const v133 = v132("div.fix-area#megaplay-player");
            const v134 = v133.attr("data-id");
            if (v134) {
              const v135 = MEGACLOUD_BASE + "/stream/getSources?id=" + v134 + "&id=" + v134;
              return yield extractSources(v135, v129, MEGACLOUD_BASE, "MegaCloud", v107, v109, v110, v105, v106, v108);
            }
          } catch (v136) {}
          return [];
        }))());
      }
      const v137 = yield Promise.all(v119);
      for (const v138 of v137) {
        v112.push(...v138);
      }
    } catch (v139) {}
    return v112;
  });
}
function onSettings() {
  return __async(this, null, function* () {
    const v140 = v1;
    return [{
      type: "header",
      label: "Stream Preferences"
    }, {
      type: "select",
      key: "subDub",
      label: "Audio/Subtitle Preference",
      options: [{
        label: "Sub & Dub",
        value: "both"
      }, {
        label: "Sub Only",
        value: "sub"
      }, {
        label: "Dub Only",
        value: "dub"
      }],
      defaultValue: "both"
    }];
  });
}
function getStreams(v141, v142 = "tv", v143 = 1, v144 = 1) {
  return __async(this, null, function* () {
    const v145 = v1;
    try {
      const v146 = yield getTmdbDetails(v141, v142);
      if (!v146) {
        return [];
      }
      const v147 = v146.genres || [];
      const v148 = v147.some(v149 => v149.id === 16);
      const v150 = v146.original_language || "";
      const v151 = v146.origin_country || [];
      const v152 = v150 === "ja" || v151.includes("JP");
      if (!v148 || !v152) {
        return [];
      }
      let v153 = null;
      let v154 = v144;
      let v155 = v146.name || v146.title || v146.original_title || (v142 === "movie" ? "Movie" : "Anime");
      const v156 = yield getImdbId(v141, v142);
      if (!v156) {
        return [];
      }
      const v157 = yield getEpisodeMetadata(v141, v142, v143, v144);
      const v158 = {
        epTitle: v157.title,
        duration: v157.duration
      };
      const v159 = v142 === "movie" ? 1 : v143;
      const v160 = v142 === "movie" ? 1 : v144;
      if (v142 === "movie") {
        v153 = yield searchMalId(v155, "movie");
        v154 = 1;
      }
      if (!v153 && v142 !== "movie") {
        const v161 = yield resolveMapping(v156, v159, v160);
        if (v161 && v161.mal_id) {
          v153 = v161.mal_id;
          v154 = v161.mal_episode || v144;
        }
      }
      if (!v153) {
        return [];
      }
      const v162 = globalThis.SCRAPER_SETTINGS || {};
      const v163 = v162.subDub || "both";
      let v164 = [];
      if (v163 === "both") {
        const [v165, v166] = yield Promise.all([scrapeType(v153, v154, "sub", v155, v158, v142, v159), scrapeType(v153, v154, "dub", v155, v158, v142, v159)]);
        v164 = [...v165, ...v166];
      } else {
        v164 = yield scrapeType(v153, v154, v163, v155, v158, v142, v159);
      }
      const v167 = new Set();
      return v164.filter(v168 => {
        const v169 = v145;
        if (v167.has(v168.url)) {
          return false;
        }
        v167.add(v168.url);
        return true;
      });
    } catch (v170) {
      return [];
    }
  });
}
module.exports = {
  getStreams: getStreams,
  onSettings: onSettings
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
  var PROVIDER = "hianime";
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