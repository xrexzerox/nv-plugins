/*
 * nv-plugins kurage.js — FULLY DECODED port of the All-in-One-Nuvio provider (4.24.0 merge pass).
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
const v2 = v1; /*decoder removed*/ /*rotation removed*/
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
var __async = (v12, v13, v14) => {
  const v15 = {
    dh1: 296
  };
  return new Promise((v16, v17) => {
    const v18 = {
      dh2: 289
    };
    const v19 = v1;
    var v20 = v21 => {
      const v22 = v1;
      try {
        v23(v14.next(v21));
      } catch (v24) {
        v17(v24);
      }
    };
    var v25 = v26 => {
      const v27 = v1;
      try {
        v23(v14.throw(v26));
      } catch (v28) {
        v17(v28);
      }
    };
    var v23 = v29 => v29.done ? v16(v29.value) : Promise.resolve(v29.value).then(v20, v25);
    v23((v14 = v14.apply(v12, v13)).next());
  });
};
var KURAGE_BASE = "https://kurage.live";
var TMDB_API_KEY = "439c478a771f35c05022f9feabcca01c";
var ANILIST_URL = "https://graphql.anilist.co";
var ARM_BASE = "https://arm.haglund.dev/api/v2";
var CINEMETA_URL = "https://v3-cinemeta.strem.io/meta";
var DEFAULT_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Accept: "application/json, text/plain, */*",
  "Accept-Language": "en-US,en;q=0.9",
  Origin: KURAGE_BASE,
  Referer: KURAGE_BASE + "/"
};
function fetchText(v30) {
  return __async(this, arguments, function* (v31, v32 = {}) {
    const v33 = v1;
    const v34 = yield __nvFetch(v31, __spreadProps(__spreadValues({}, v32), {
      headers: __spreadValues(__spreadValues({}, DEFAULT_HEADERS), v32.headers || {})
    }));
    if (!v34.ok) {
      throw new Error("HTTP " + v34.status + ": " + v31);
    }
    return yield v34.text();
  });
}
function fetchJson(v35) {
  return __async(this, arguments, function* (v36, v37 = {}) {
    const v38 = yield fetchText(v36, v37);
    return JSON.parse(v38);
  });
}
function getSyncInfo(v39, v40, v41, v42) {
  const v43 = {
    dh3: 360,
    dh4: 325,
    dh5: 292,
    dh6: 320,
    dh7: 304
  };
  return __async(this, null, function* () {
    const v44 = {
      dh8: 316,
      dh9: 288,
      dh10: 320,
      dh11: 317,
      dh12: 353,
      dh13: 361,
      dh14: 290
    };
    const v45 = v1;
    const v46 = v47 => __async(this, null, function* () {
      const v48 = v1;
      const v49 = v40 === "movie" ? "movie" : "series";
      const v50 = CINEMETA_URL + "/" + v49 + "/" + v47 + ".json";
      try {
        const v51 = yield fetchJson(v50);
        const v52 = v51.meta;
        if (!v52) {
          throw new Error("No Cinemata metadata");
        }
        if (v40 === "movie") {
          return {
            date: v52.released ? v52.released.split("T")[0] : null,
            title: v52.name,
            dayIndex: 1,
            runtime: v52.runtime || "N/A"
          };
        }
        const v53 = v52.videos || [];
        const v54 = v53.find(v55 => v55.season == v41 && v55.episode == v42);
        if (!v54 || !v54.released) {
          return {
            date: null,
            title: null,
            dayIndex: 1,
            runtime: "24m"
          };
        }
        const v56 = v54.released.split("T")[0];
        const v57 = v53.filter(v58 => v58.season == v41 && v58.released && v58.released.split("T")[0] === v56 && parseInt(v58.episode) < parseInt(v42)).length + 1;
        return {
          date: v56,
          title: v54.name || null,
          dayIndex: v57,
          runtime: v52.runtime || "24m"
        };
      } catch (v59) {
        return {
          date: null,
          title: null,
          dayIndex: 1,
          runtime: "24m"
        };
      }
    });
    const v60 = "https://api.themoviedb.org/3/" + (v40 === "movie" ? "movie" : "tv") + "/" + v39;
    const [v61, v62] = yield Promise.all([fetchJson(v60 + (v40 === "movie" ? "" : "/external_ids") + ("?api_key=" + TMDB_API_KEY)), fetchJson(v60 + ("?api_key=" + TMDB_API_KEY))]);
    let v63 = v61.imdb_id || null;
    const v64 = v62.name || v62.title || null;
    if (!v63) {
      try {
        const v65 = yield fetchJson(ARM_BASE + "/themoviedb?id=" + v39);
        v63 = Array.isArray(v65) && v65.length > 0 ? v65[0].imdb : null;
      } catch (v66) {}
    }
    if (!v63) {
      throw new Error("No IMDb ID found for TMDB " + v39);
    }
    const v67 = yield v46(v63);
    let v68 = v67.date;
    if (v40 === "movie" && v62.release_date) {
      v68 = v62.release_date;
    }
    if (!v68) {
      throw new Error("Could not find release date for ID " + v63);
    }
    const v69 = v62.runtime ? v62.runtime + "m" : v67.runtime ? v67.runtime.toString().includes("m") ? v67.runtime : v67.runtime + "m" : "24m";
    return {
      imdbId: v63,
      tmdbId: v39,
      releaseDate: v68,
      title: v64,
      episodeTitle: v67.title,
      dayIndex: v67.dayIndex,
      episode: v42,
      duration: v69
    };
  });
}
function resolveAnilistId(v70) {
  const v71 = {
    dh15: 333,
    dh16: 344,
    dh17: 319,
    dh18: 327,
    dh19: 354,
    dh20: 294,
    dh21: 321,
    dh22: 278,
    dh23: 313,
    dh24: 363,
    dh25: 321,
    dh26: 278,
    dh27: 286,
    dh28: 353,
    dh29: 336
  };
  return __async(this, null, function* () {
    const v72 = v1;
    var v73;
    var v74;
    const {
      releaseDate: v75,
      title: v76,
      episode: v77,
      episodeTitle: v78,
      dayIndex: v79
    } = v70;
    if (!v75 || !/^\d{4}-\d{2}-\d{2}/.test(v75)) {
      return null;
    }
    const v80 = "query($search:String){Page(perPage:20){media(search:$search,type:ANIME){id type format title{romaji english}startDate{year month day}endDate{year month day}episodes streamingEpisodes{title}}}}";
    try {
      const v81 = yield fetchJson(ANILIST_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          query: v80,
          variables: {
            search: v76
          }
        })
      });
      const v82 = ((v74 = (v73 = v81.data) == null ? undefined : v73.Page) == null ? undefined : v74.media) || [];
      if (v82.length === 0) {
        return null;
      }
      const v83 = new Date(v75);
      for (const v84 of v82) {
        const v85 = v84.startDate;
        const v86 = v85.year && v85.month && v85.day ? v85.year + "-" + String(v85.month).padStart(2, "0") + "-" + String(v85.day).padStart(2, "0") : null;
        if (!v86) {
          continue;
        }
        const v87 = new Date(v86);
        const v88 = Math.ceil(Math.abs(v83.getTime() - v87.getTime()) / 86400000);
        let v89 = false;
        if (v84.format === "MOVIE" || v84.format === "SPECIAL" || v84.episodes === 1) {
          if (v88 <= 2) {
            v89 = true;
          }
        } else {
          const v90 = new Date(v87);
          v90.setDate(v90.getDate() - 2);
          if (v83 >= v90) {
            if (v84.endDate && v84.endDate.year) {
              const v91 = new Date(v84.endDate.year, (v84.endDate.month || 12) - 1, v84.endDate.day || 31);
              v91.setDate(v91.getDate() + 2);
              if (v83 <= v91) {
                v89 = true;
              }
            } else {
              v89 = true;
            }
          }
        }
        if (v89) {
          const v92 = v84.format !== "MOVIE" && v84.format !== "SPECIAL" && v84.episodes !== 1;
          let v93 = v92 && v77 ? v77 : v79 || 1;
          const v94 = v84.streamingEpisodes || [];
          if (v94.length > 1 && v78) {
            const v95 = v78.toLowerCase().replace(/[^a-z0-9]/g, "");
            for (let v96 = 0; v96 < v94.length; v96++) {
              const v97 = (v94[v96].title || "").toLowerCase().replace(/[^a-z0-9]/g, "");
              if (v97 && (v97.indexOf(v95) !== -1 || v95.indexOf(v97) !== -1)) {
                v93 = v96 + 1;
                break;
              }
            }
          }
          return {
            alId: v84.id,
            episode: v93
          };
        }
      }
    } catch (v98) {}
    return null;
  });
}
function getStreams(v99, v100, v101, v102) {
  const v103 = {
    dh30: 339,
    dh31: 348,
    dh32: 300,
    dh33: 279,
    dh34: 281,
    dh35: 344,
    dh36: 350
  };
  return __async(this, null, function* () {
    const v104 = {
      dh37: 332
    };
    const v105 = {
      dh38: 318,
      dh39: 311,
      dh40: 303,
      dh41: 314,
      dh42: 322,
      dh43: 283,
      dh44: 330,
      dh45: 362
    };
    const v106 = v1;
    try {
      const v107 = yield getSyncInfo(v99, v100, v101, v102);
      const v108 = yield resolveAnilistId(v107);
      if (!v108 || !v108.alId) {
        console.log("[Kurage] Could not resolve AniList ID for TMDB " + v99);
        return [];
      }
      const {
        alId: v109,
        episode: v110
      } = v108;
      console.log("[Kurage] Resolved to AniList ID: " + v109 + ", Episode: " + v110);
      const v111 = {
        "0": {
          json: {
            id: v109
          }
        },
        "1": {
          json: {
            animeId: v109,
            episode: v110,
            language: "sub"
          }
        },
        "2": {
          json: {
            animeId: v109,
            episode: v110,
            language: "dub"
          }
        }
      };
      const v112 = KURAGE_BASE + "/api/trpc/catalog.anilistInfo,episodes.source,episodes.source?batch=1&input=" + encodeURIComponent(JSON.stringify(v111));
      const v113 = yield fetchJson(v112, {
        headers: {
          "trpc-accept": "application/json",
          "x-trpc-source": "nextjs-react"
        }
      });
      const v114 = [];
      v113.forEach(v115 => {
        const v116 = v106;
        var v117;
        var v118;
        var v119;
        const v120 = ((v119 = (v118 = (v117 = v115.result) == null ? undefined : v117.data) == null ? undefined : v118.json) == null ? undefined : v119.servers) || [];
        v120.forEach(v121 => {
          const v122 = v116;
          const v123 = v121.url.startsWith("/") ? "" + KURAGE_BASE + v121.url : v121.url;
          let v124 = {};
          try {
            const v125 = new URL(v123);
            const v126 = v125.searchParams.get("headers");
            if (v126) {
              v124 = JSON.parse(atob(v126));
            }
          } catch (v127) {}
          const v128 = (v121.language || "sub").toUpperCase();
          const v129 = v128 === "SUB" ? "Original (SUB)" : "English (DUB)";
          let v130 = [];
          if (v100 === "movie") {
            v130 = ["🎬 " + v107.title, "🎞️ MP4 | ⚡ Auto | 🌍 " + v129 + " | ⏱️ " + v107.duration];
          } else {
            v130 = ["🎬 " + v107.title, "🎥 S" + v101 + "E" + v102 + " - " + (v107.episodeTitle || "Episode " + v110), "🎞️ MP4 | ⚡ Auto | 🌍 " + v129 + " | ⏱️ " + v107.duration];
          }
          const v131 = v130.join("\n");
          v114.push({
            name: "Kurage | Auto | [" + v121.label + "] (" + v128 + ")",
            title: v131,
            url: v123,
            quality: "Auto",
            headers: __spreadValues(__spreadValues({}, DEFAULT_HEADERS), v124),
            provider: "kurage",
            type: v121.sourceType || "mp4"
          });
        });
      });
      return v114;
    } catch (v132) {
      console.error("[Kurage] Error: " + v132.message);
      return [];
    }
  });
}
module.exports = {
  getStreams: getStreams
}; /*string-table removed*/

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
  var PROVIDER = "kurage";
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