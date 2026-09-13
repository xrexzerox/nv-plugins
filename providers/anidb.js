/*
 * nv-plugins anidb.js — FULLY DECODED port of the All-in-One-Nuvio provider (4.24.0 merge pass).
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
      try {
        v11(v5.next(v10));
      } catch (v12) {
        v7(v12);
      }
    };
    var v13 = v14 => {
      try {
        v11(v5.throw(v14));
      } catch (v15) {
        v7(v15);
      }
    };
    var v11 = v16 => v16.done ? v6(v16.value) : Promise.resolve(v16.value).then(v9, v13);
    v11((v5 = v5.apply(v3, v4)).next());
  });
};
var cheerio = __nvRequire("cheerio-without-node-native");
var TMDB_API_KEY = "1865f43a0549ca50d341dd9ab8b29f49";
var BASE_URL = "https://anidb.app";
var USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
function getTmdbInfo(v17, v18, v19, v20) {
  const v21 = {
    dh1: 203,
    dh2: 203,
    dh3: 240,
    dh4: 190,
    dh5: 234,
    dh6: 179,
    dh7: 202
  };
  return __async(this, null, function* () {
    const v22 = v1;
    const v23 = v18 === "tv" ? "tv" : "movie";
    const v24 = Number.isInteger(v19) ? v19 : 1;
    const v25 = Number.isInteger(v20) ? v20 : 1;
    try {
      if (v18 === "tv") {
        const v26 = "https://api.themoviedb.org/3/tv/" + v17 + "?api_key=" + TMDB_API_KEY;
        const v27 = yield __nvFetch(v26, {
          headers: {
            "User-Agent": USER_AGENT,
            Accept: "application/json"
          }
        });
        if (!v27.ok) {
          return {
            title: "",
            year: null,
            runtime: 0
          };
        }
        const v28 = yield v27.json();
        const v29 = v28.name || "";
        const v30 = v28.first_air_date ? parseInt(v28.first_air_date.slice(0, 4), 10) : null;
        const v31 = "https://api.themoviedb.org/3/tv/" + v17 + "/season/" + v24 + "/episode/" + v25 + "?api_key=" + TMDB_API_KEY;
        const v32 = yield __nvFetch(v31, {
          headers: {
            "User-Agent": USER_AGENT,
            Accept: "application/json"
          }
        });
        let v33 = v28.episode_run_time ? v28.episode_run_time[0] : 0;
        if (v32.ok) {
          const v34 = yield v32.json();
          if (v34.runtime) {
            v33 = v34.runtime;
          }
        }
        return {
          title: v29,
          year: v30,
          runtime: v33
        };
      } else {
        const v35 = "https://api.themoviedb.org/3/movie/" + v17 + "?api_key=" + TMDB_API_KEY;
        const v36 = yield __nvFetch(v35, {
          headers: {
            "User-Agent": USER_AGENT,
            Accept: "application/json"
          }
        });
        if (!v36.ok) {
          return {
            title: "",
            year: null,
            runtime: 0
          };
        }
        const v37 = yield v36.json();
        const v38 = v37.release_date ? parseInt(v37.release_date.slice(0, 4), 10) : null;
        return {
          title: v37.title || "",
          year: v38,
          runtime: v37.runtime || 0
        };
      }
    } catch (v39) {
      return {
        title: "",
        year: null,
        runtime: 0
      };
    }
  });
}
function normalize(v40) {
  const v41 = {
    dh8: 189,
    dh9: 194
  };
  const v42 = v2;
  return String(v40 || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}
function rankResults(v43, v44) {
  const v45 = {
    dh10: 176,
    dh11: 176,
    dh12: 218
  };
  const v46 = v2;
  const v47 = normalize(v44);
  const v48 = [];
  const v49 = [];
  for (let v50 = 0; v50 < v43.length; v50++) {
    const v51 = normalize(v43[v50].title);
    if (v51 === v47) {
      v48.push(v43[v50]);
    } else if (v51.indexOf(v47) !== -1 || v47.indexOf(v51) !== -1) {
      v49.push(v43[v50]);
    }
  }
  return v48.concat(v49);
}
function absolutize(v52) {
  const v53 = {
    dh13: 174,
    dh14: 243
  };
  const v54 = v2;
  if (!v52) {
    return "";
  }
  if (v52.indexOf("http") === 0) {
    return v52;
  }
  if (v52.indexOf("//") === 0) {
    return "https:" + v52;
  }
  if (v52.charAt(0) === "/") {
    return BASE_URL + v52;
  }
  return BASE_URL + "/" + v52;
}
function searchSite(v55) {
  const v56 = {
    dh15: 241
  };
  const v57 = {
    dh16: 219,
    dh17: 170,
    dh18: 242,
    dh19: 194
  };
  return __async(this, null, function* () {
    const v58 = v1;
    const v59 = [];
    const v60 = {};
    let v61;
    try {
      const v62 = yield __nvFetch(BASE_URL + "/browse?q=" + encodeURIComponent(v55), {
        headers: {
          "User-Agent": USER_AGENT,
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9"
        }
      });
      v61 = yield v62.text();
    } catch (v63) {
      return v59;
    }
    const v64 = cheerio.load(v61);
    v64("a.anime-card").each(function (v65, v66) {
      const v67 = v58;
      const v68 = absolutize(v64(v66).attr("href") || "");
      const v69 = (v64(v66).attr("title") || v64(v66).find("img").attr("alt") || "").trim();
      if (v68 && v69 && !v60[v68]) {
        v60[v68] = true;
        v59.push({
          url: v68,
          title: v69
        });
      }
    });
    return v59;
  });
}
function getEpisodes(v70) {
  const v71 = {
    dh20: 204,
    dh21: 201
  };
  return __async(this, null, function* () {
    const v72 = v1;
    const v73 = yield __nvFetch(BASE_URL + "/api/frontend/anime/" + v70 + "/episodes", {
      headers: {
        "User-Agent": USER_AGENT,
        "X-Requested-With": "XMLHttpRequest"
      }
    });
    const v74 = yield v73.json();
    if (v74 && v74.episodes) {
      return v74.episodes;
    } else {
      return [];
    }
  });
} /*string-table removed*/
function getLanguages(v75, v76) {
  const v77 = {
    dh22: 186,
    dh23: 216
  };
  return __async(this, null, function* () {
    const v78 = v1;
    const v79 = yield __nvFetch(BASE_URL + "/api/frontend/episode/" + v75 + "/languages", {
      headers: {
        "User-Agent": USER_AGENT,
        "X-Requested-With": "XMLHttpRequest",
        Referer: BASE_URL + "/anime/" + v76
      }
    });
    const v80 = yield v79.json();
    if (v80 && v80.languages) {
      return v80.languages;
    } else {
      return [];
    }
  });
}
var HLS_REGEXES = [/file\s*:\s*["'](https?:\/\/[^"']+\.m3u8[^"']*)["']/i, /sources\s*:\s*\[\s*\{[^}]*file\s*:\s*["'](https?:\/\/[^"']+\.m3u8[^"']*)["']/i, /["'](https?:\/\/[^"']+\/master\.m3u8[^"']*)["']/i, /["'](https?:\/\/[^"']+\.m3u8[^"']*)["']/i];
function extractEmbed(v81) {
  const v82 = {
    dh24: 182
  };
  return __async(this, null, function* () {
    const v83 = v1;
    try {
      const v84 = yield __nvFetch(v81, {
        headers: {
          "User-Agent": USER_AGENT,
          Referer: BASE_URL + "/"
        }
      });
      const v85 = yield v84.text();
      for (let v86 = 0; v86 < HLS_REGEXES.length; v86++) {
        const v87 = v85.match(HLS_REGEXES[v86]);
        if (v87 && v87[1]) {
          return v87[1];
        }
      }
    } catch (v88) {}
    return null;
  });
}
function getStreams(v89, v90, v91, v92) {
  const v93 = {
    dh25: 191,
    dh26: 197,
    dh27: 250,
    dh28: 236,
    dh29: 230,
    dh30: 206,
    dh31: 235,
    dh32: 171,
    dh33: 223,
    dh34: 220,
    dh35: 227,
    dh36: 193,
    dh37: 193,
    dh38: 229,
    dh39: 187,
    dh40: 233,
    dh41: 205,
    dh42: 215,
    dh43: 176,
    dh44: 238,
    dh45: 178,
    dh46: 199,
    dh47: 213
  };
  return __async(this, null, function* () {
    const v94 = v1;
    try {
      const v95 = yield getTmdbInfo(v89, v90, v91, v92);
      if (!v95.title) {
        return [];
      }
      console.log("[AniDB] " + v90 + " \"" + v95.title + "\" S" + v91 + "E" + v92);
      const v96 = rankResults(yield searchSite(v95.title), v95.title);
      const v97 = v90 === "tv" ? v92 || 1 : 1;
      for (let v98 = 0; v98 < Math.min(3, v96.length); v98++) {
        const v99 = v96[v98];
        const v100 = v99.url.split("/").filter(Boolean).pop() || "";
        const v101 = v100.split("-").pop();
        const v102 = parseInt(v101, 10);
        if (!v102) {
          continue;
        }
        let v103 = [];
        try {
          v103 = yield getEpisodes(v102);
        } catch (v104) {
          continue;
        }
        if (!v103.length) {
          continue;
        }
        let v105 = null;
        for (let v106 = 0; v106 < v103.length; v106++) {
          if (v103[v106].number === v97) {
            v105 = v103[v106];
            break;
          }
        }
        if (!v105) {
          v105 = v103[v97 - 1] || v103[0];
        }
        if (!v105 || v105.id == null) {
          continue;
        }
        let v107 = [];
        try {
          v107 = yield getLanguages(v105.id, v100);
        } catch (v108) {
          continue;
        }
        const v109 = [];
        for (let v110 = 0; v110 < v107.length; v110++) {
          const v111 = v107[v110].embed_url;
          if (v111) {
            v109.push({
              url: v111,
              name: v107[v110].name || v107[v110].code || ""
            });
          }
        }
        if (!v109.length) {
          continue;
        }
        const v112 = yield Promise.all(v109.map(function (v113) {
          const v114 = v94;
          return extractEmbed(v113.url);
        }));
        const v115 = [];
        const v116 = {};
        for (let v117 = 0; v117 < v112.length; v117++) {
          const v118 = v112[v117];
          if (!v118 || v116[v118]) {
            continue;
          }
          v116[v118] = true;
          const v119 = String(v109[v117].name || "").toLowerCase();
          let v120 = v109[v117].name ? v109[v117].name : "RAW / SUB";
          let v121 = "🗣️";
          let v122 = "Subbed / Dubbed";
          if (v119.includes("japanese") || v119.includes("jp") || v119.includes("jap")) {
            v121 = "🇯🇵";
            v122 = "Japanese Audio";
          } else if (v119.includes("english") || v119.includes("eng") || v119.includes("en")) {
            v121 = "🇺🇸";
            v122 = "English Audio";
          } else if (v119.includes("korean") || v119.includes("kor") || v119.includes("kr")) {
            v121 = "🇰🇷";
            v122 = "Korean Audio";
          }
          const v123 = v95.year ? " (" + v95.year + ")" : "";
          let v124 = "N/A";
          if (v95.runtime && Number.isInteger(v95.runtime) && v95.runtime > 0) {
            v124 = v95.runtime + " min";
          }
          var v125 = "🎋 " + v95.title + v123;
          var v126 = "🏷️ Auto | " + v121 + " " + v120 + " | 🔊 Native";
          var v127 = "⚡ HLS | ⏱️ " + v124 + " | 📌 AniDB Stream";
          var v128 = v125 + "\n" + v126 + "\n" + v127;
          v115.push({
            name: "AniDB | Auto | " + v122,
            title: v128,
            url: v118,
            quality: "Auto",
            description: v128,
            headers: {
              Referer: BASE_URL + "/"
            }
          });
        }
        if (v115.length) {
          console.log("[AniDB] found " + v115.length + " streams");
          return v115;
        }
      }
      console.log("[AniDB] no streams found");
      return [];
    } catch (v129) {
      console.error("[AniDB] Fatal: " + (v129 && v129.message));
      return [];
    }
  });
} /*decoder removed*/
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
  var PROVIDER = "anidb";
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