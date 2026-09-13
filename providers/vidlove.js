/*
 * nv-plugins vidlove.js — FULLY DECODED port of the All-in-One-Nuvio provider (4.24.0 merge pass).
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
"use strict";
const v2 = v1; /*rotation removed*/
;
var __async = (v3, v4, v5) => {
  const v6 = {
    dh1: 466
  };
  return new Promise((v7, v8) => {
    const v9 = {
      dh2: 462
    };
    const v10 = v1;
    var v11 = v12 => {
      const v13 = v1;
      try {
        v14(v5.next(v12));
      } catch (v15) {
        v8(v15);
      }
    };
    var v16 = v17 => {
      try {
        v14(v5.throw(v17));
      } catch (v18) {
        v8(v18);
      }
    };
    var v14 = v19 => v19.done ? v7(v19.value) : Promise.resolve(v19.value).then(v11, v16);
    v14((v5 = v5.apply(v3, v4)).next());
  });
};
var BASE_URL = "https://ballerinacappuccinalovestungtungtungsahur.com";
var REFERER = "https://player.vidlove.cc/";
var TMDB_BASE = "https://api.themoviedb.org/3";
var TMDB_KEY = "307b7b8ef035c6aa336900aef4e203bd";
var MIN_QUALITY = 1080;
var DEFAULT_QUALITY = "1080p";
var USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";
var PROVIDERS = ["moviebox", "ipcloud", "tcloud", "vidapi", "vixsrc", "1embed", "xpass", "vidrift", "lookmovie", "vidnest"];
var DEFAULT_HEADERS = {
  accept: "application/json",
  "accept-language": "nl-NL,nl;q=0.9,en-US;q=0.8,en;q=0.7",
  "sec-ch-ua": "\"Not;A=Brand\";v=\"8\", \"Chromium\";v=\"150\", \"Google Chrome\";v=\"150\"",
  Referer: REFERER,
  "User-Agent": USER_AGENT
};
function getInvertedSortTag(v20, v21 = 999999) {
  const v22 = {
    dh3: 452,
    dh4: 427
  };
  const v23 = v2;
  const v24 = Math.max(0, parseInt(v20, 10) || 0);
  const v25 = Math.max(0, v21 - v24);
  const v26 = v25.toString(2).padStart(20, "0");
  return v26.split("").map(v27 => v27 === "1" ? "﻿" : "​").join("");
} /*string-table removed*/
function getResolutionEmoji(v28) {
  const v29 = {
    dh5: 450,
    dh6: 437,
    dh7: 459,
    dh8: 429,
    dh9: 437,
    dh10: 438,
    dh11: 414,
    dh12: 413,
    dh13: 437,
    dh14: 408,
    dh15: 443
  };
  const v30 = v2;
  const v31 = String(v28 || "").toLowerCase();
  if (v31.includes("2160") || v31.includes("4k") || v31.includes("uhd")) {
    return "🌟 4K";
  }
  if (v31.includes("1080") || v31.includes("fhd")) {
    return "🔥 1080p";
  }
  if (v31.includes("720") || v31.includes("hd")) {
    return "💎 720p";
  }
  if (v31.includes("480") || v31.includes("sd")) {
    return "📱 480p";
  }
  return "📺 " + (v28 || "1080p");
}
function qualityRank(v32) {
  const v33 = {
    dh16: 440
  };
  const v34 = v2;
  if (/2160p|4k/i.test(v32)) {
    return 4;
  }
  if (/1080p/i.test(v32)) {
    return 3;
  }
  if (/720p/i.test(v32)) {
    return 2;
  }
  if (/480p/i.test(v32)) {
    return 1;
  }
  return 0;
} /*decoder removed*/
var parseQuality = v35 => {
  const v36 = String(v35 || "").match(/(\d+)/);
  if (v36) {
    return parseInt(v36[1], 10);
  } else {
    return 0;
  }
};
var normalizeQuality = v37 => {
  const v38 = String(v37 || "").trim();
  if (v38) {
    return v38;
  } else {
    return DEFAULT_QUALITY;
  }
};
var isQualityAcceptable = v39 => {
  return parseQuality(normalizeQuality(v39)) >= MIN_QUALITY;
};
function fetchTmdbMeta(v40, v41, v42 = null, v43 = null) {
  const v44 = {
    dh17: 447,
    dh18: 436,
    dh19: 467,
    dh20: 428,
    dh21: 460,
    dh22: 465,
    dh23: 445,
    dh24: 447,
    dh25: 442
  };
  return __async(this, null, function* () {
    const v45 = v1;
    try {
      const v46 = v41 === "tv" ? "tv" : "movie";
      const v47 = yield __nvFetch(TMDB_BASE + "/" + v46 + "/" + encodeURIComponent(v40) + "?api_key=" + TMDB_KEY, {
        headers: {
          Accept: "application/json",
          "User-Agent": USER_AGENT
        }
      });
      if (!v47.ok) {
        return {
          title: "Unknown",
          year: null,
          episodeTitle: ""
        };
      }
      const v48 = yield v47.json();
      const v49 = v48.title || v48.name || v48.original_title || v48.original_name || "Unknown";
      const v50 = v48.release_date || v48.first_air_date || "";
      const v51 = v50 ? parseInt(v50.slice(0, 4)) : null;
      let v52 = "";
      if (v41 === "tv" && v42 && v43) {
        try {
          const v53 = yield __nvFetch(TMDB_BASE + "/tv/" + encodeURIComponent(v40) + "/season/" + v42 + "?api_key=" + TMDB_KEY, {
            headers: {
              Accept: "application/json",
              "User-Agent": USER_AGENT
            }
          });
          if (v53.ok) {
            const v54 = yield v53.json();
            if (v54 && Array.isArray(v54.episodes)) {
              const v55 = parseInt(v43);
              const v56 = v54.episodes.find(v57 => v57.episode_number === v55);
              if (v56 && v56.name) {
                v52 = v56.name;
              }
            }
          }
        } catch (v58) {}
      }
      return {
        title: v49,
        year: v51,
        episodeTitle: v52
      };
    } catch (v59) {
      return {
        title: "Unknown",
        year: null,
        episodeTitle: ""
      };
    }
  });
}
var buildEndpointUrl = (v60, v61, v62, v63, v64) => {
  const v65 = {
    dh26: 434,
    dh27: 455
  };
  const v66 = v2;
  const v67 = new URLSearchParams({
    id: v61,
    mode: "json",
    sources: v62,
    hevc: "1"
  });
  if (v63 != null) {
    v67.set("season", v63);
  }
  if (v64 != null) {
    v67.set("episode", v64);
  }
  return BASE_URL + "/" + v60 + "?" + v67;
};
var mapQualityToStream = (v68, v69, v70, v71) => {
  const v72 = {
    dh28: 461,
    dh29: 472,
    dh30: 474,
    dh31: 454,
    dh32: 419,
    dh33: 454,
    dh34: 456
  };
  const v73 = v2;
  const v74 = normalizeQuality(v68.quality);
  const v75 = getResolutionEmoji(v74);
  const v76 = qualityRank(v74);
  const v77 = getInvertedSortTag(v76 * 100000 + (100 - v70), 999999);
  const v78 = v77 + "Vidlove • " + v74 + " • " + v69;
  const v79 = "🎬 " + v71.title + (v71.year ? " (" + v71.year + ")" : "");
  let v80 = null;
  if (v71.mediaType === "tv" && v71.season && v71.episode) {
    v80 = "📋 S" + v71.season + " E" + v71.episode + (v71.episodeTitle ? " - " + v71.episodeTitle : "");
  }
  const v81 = v75 + " | 🗣️ Multi-Audio";
  const v82 = "🎞️ MKV | ⚡ HEVC | 🎧 AAC";
  const v83 = "🔗 Vidlove | 🌐 " + v69 + " | 📥 WEB-DL";
  const v84 = [v79, v80, v81, v82, v83].filter(Boolean).join("\n");
  const v85 = {
    Referer: REFERER,
    Origin: "https://player.vidlove.cc",
    "User-Agent": USER_AGENT
  };
  return {
    name: v78,
    title: v84,
    size: v84,
    description: v84,
    url: v68.url,
    quality: v74,
    headers: v85,
    behaviorHints: {
      notWebReady: true,
      proxyHeaders: {
        request: v85
      }
    }
  };
};
function fetchProviderStreams(v86, v87, v88, v89, v90, v91) {
  const v92 = {
    dh35: 444,
    dh36: 451,
    dh37: 469,
    dh38: 426
  };
  return __async(this, null, function* () {
    const v93 = v1;
    try {
      const v94 = yield __nvFetch(buildEndpointUrl(v88, v87, v86, v89, v90), {
        method: "GET",
        headers: DEFAULT_HEADERS
      });
      if (!v94.ok) {
        return [];
      }
      const {
        source: v95
      } = yield v94.json();
      if (!v95) {
        return [];
      }
      const v96 = Array.isArray(v95.qualities) ? v95.qualities : [];
      const v97 = v95.label ?? v86;
      if (v96.length > 0) {
        return v96.filter(v98 => (v98 == null ? undefined : v98.url) && isQualityAcceptable(v98.quality)).map((v99, v100) => mapQualityToStream(v99, v97, v100, v91));
      }
      if (v95.url && isQualityAcceptable(v95.quality)) {
        return [mapQualityToStream({
          url: v95.url,
          quality: v95.quality
        }, v97, 0, v91)];
      }
      return [];
    } catch (v101) {
      return [];
    }
  });
}
function getStreams(v102, v103, v104, v105) {
  const v106 = {
    dh39: 412,
    dh40: 406,
    dh41: 454
  };
  return __async(this, null, function* () {
    const v107 = v1;
    try {
      const v108 = String(v103 || "").toLowerCase().trim();
      const v109 = v108 === "series" || v108 === "show" || v108 === "tvshow" || v108 === "tv" ? "tv" : "movie";
      if (v109 === "tv" && (v104 == null || v105 == null)) {
        return [];
      }
      const v110 = yield fetchTmdbMeta(v102, v109, v104, v105);
      v110.mediaType = v109;
      v110.season = v104;
      v110.episode = v105;
      const v111 = yield Promise.all(PROVIDERS.map(v112 => fetchProviderStreams(v112, v102, v109, v104, v105, v110)));
      const v113 = new Set();
      return v111.flat().filter(v114 => v114.url && !v113.has(v114.url) && v113.add(v114.url));
    } catch (v115) {
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
  var PROVIDER = "vidlove";
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