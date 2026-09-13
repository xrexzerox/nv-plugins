/*
 * nv-plugins fibwatch.js — FULLY DECODED port of the All-in-One-Nuvio provider (4.24.0 merge pass).
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
var BASE_URL = "https://fibwatch.art";
var TMDB_API_KEY = "1865f43a0549ca50d341dd9ab8b29f49";
var BROWSER_UA = "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36";
var HEADERS = {
  "User-Agent": BROWSER_UA,
  Referer: BASE_URL + "/"
};
var PLAYBACK_HEADERS = {
  "User-Agent": BROWSER_UA,
  Referer: "https://urlshortlink.top/",
  Origin: "https://urlshortlink.top"
};
/*string-table removed*/
function extractQuality(v17) {
  const v18 = {
    dh1: 521,
    dh2: 521,
    dh3: 464,
    dh4: 505,
    dh5: 535,
    dh6: 536
  };
  const v19 = v2;
  const v20 = (v17 || "").toLowerCase();
  if (v20.includes("2160") || v20.includes("4k")) {
    return "4K";
  }
  if (v20.includes("1080")) {
    return "1080p";
  }
  if (v20.includes("720")) {
    return "720p";
  }
  if (v20.includes("480")) {
    return "480p";
  }
  if (v20.includes("360")) {
    return "360p";
  }
  return "Unknown";
}
function parseStreamFromShortenerHtml(v21) {
  const v22 = {
    dh7: 491
  };
  const v23 = {
    dh8: 512
  };
  const v24 = v2;
  if (!v21) {
    return null;
  }
  const v25 = cheerio.load(v21);
  let v26 = v25("a.hidden-button.buttonDownloadnew").attr("href");
  if (!v26) {
    v25("a").each((v27, v28) => {
      const v29 = v24;
      const v30 = v25(v28).attr("href") || "";
      if (v30.includes("url=http")) {
        v26 = v30;
        return false;
      }
    });
  }
  if (!v26) {
    const v31 = /https?:\/\/[^\s"'`<>]+?\.b-cdn\.net\/[^\s"'`<>]+\.(?:mkv|mp4|m3u8)/i;
    const v32 = v21.match(v31);
    if (v32) {
      return v32[0];
    }
  }
  if (v26) {
    let v33 = v26.replace(/.*url=/, "").trim();
    return decodeURIComponent(v33);
  }
  return null;
} /*decoder removed*/
function generateStreamLayout(v34, v35, v36, v37, v38, v39, v40) {
  const v41 = {
    dh9: 498,
    dh10: 490,
    dh11: 496,
    dh12: 523,
    dh13: 493,
    dh14: 521,
    dh15: 508,
    dh16: 486,
    dh17: 527,
    dh18: 519,
    dh19: 511,
    dh20: 533,
    dh21: 488,
    dh22: 474
  };
  const v42 = v2;
  var v43;
  const v44 = v37.title || v37.name || "Unknown Title";
  const v45 = v37.release_date || v37.first_air_date || "";
  const v46 = v45 ? v45.split("-")[0] : "N/A";
  const v47 = v34.toLowerCase();
  let v48 = "Single-Audio";
  let v49 = "Hindi";
  if (v47.includes("dual") || v47.includes("hindi") && v47.includes("english")) {
    v48 = "Dual-Audio";
    v49 = "English • Hindi";
  } else if (v47.includes("multi")) {
    v48 = "Multi-Audio";
    v49 = "Multilingual";
  } else if (v47.includes("bangla")) {
    v49 = "Bangla";
  } else if (v47.includes("tamil")) {
    v49 = "Tamil";
  } else if (v47.includes("telugu")) {
    v49 = "Telugu";
  } else if (v47.includes("english")) {
    v48 = "Single-Audio";
    v49 = "English";
  }
  let v50 = "MKV";
  if (v47.includes(".mp4")) {
    v50 = "MP4";
  }
  if (v47.includes(".m3u8")) {
    v50 = "M3U8 / HLS";
  }
  let v51 = "N/A";
  if (v38) {
    v51 = ((v43 = v37.episode_run_time) == null ? undefined : v43[0]) ? v37.episode_run_time[0] + " min" : "45 min";
  } else {
    v51 = v37.runtime ? v37.runtime + " min" : "N/A";
  }
  const v52 = v36.includes("4K") || v36.includes("2160") ? "🌟" : "💎";
  const v53 = "⚫ FibWatch | " + v36 + " | " + v48;
  const v54 = v38 ? "🎬 " + v44 + " - S" + v39 + "E" + v40 + " (" + v46 + ")" : "🎬 " + v44 + " - " + v46;
  const v55 = v52 + " " + v36 + " | 🌍 " + v49;
  const v56 = "🎞️ " + v50 + " | ⏱️ " + v51 + " | 📌 WEB-DL";
  const v57 = v54 + "\n" + v55 + "\n" + v56;
  return {
    name: v53,
    title: v57,
    url: v34,
    quality: v36,
    behaviorHints: {
      notWebReady: false
    },
    headers: PLAYBACK_HEADERS
  };
}
function getStreams(v58, v59, v60, v61) {
  const v62 = {
    dh23: 479,
    dh24: 518,
    dh25: 520,
    dh26: 531,
    dh27: 462,
    dh28: 492,
    dh29: 526,
    dh30: 489,
    dh31: 506,
    dh32: 520,
    dh33: 500,
    dh34: 462,
    dh35: 495,
    dh36: 462,
    dh37: 528,
    dh38: 468,
    dh39: 480
  };
  const v63 = {
    dh40: 475,
    dh41: 506,
    dh42: 522
  };
  const v64 = {
    dh43: 477,
    dh44: 461
  };
  return __async(this, null, function* () {
    const v65 = v1;
    try {
      const v66 = "https://api.themoviedb.org/3/" + v59 + "/" + v58 + "?api_key=" + TMDB_API_KEY;
      const v67 = yield (yield __nvFetch(v66)).json();
      const v68 = v67.title || v67.name;
      if (!v68) {
        return [];
      }
      const v69 = BASE_URL + "/search?keyword=" + encodeURIComponent(v68) + "&page_id=1";
      const v70 = yield (yield __nvFetch(v69, {
        headers: HEADERS
      })).text();
      const v71 = cheerio.load(v70);
      const v72 = [];
      v71("div.video-thumb").each((v73, v74) => {
        const v75 = v65;
        const v76 = v71("a", v74).attr("href");
        const v77 = v71("p.hptag", v74).text().trim() || v71("div.video-thumb img", v74).attr("alt") || "";
        if (v76) {
          v72.push({
            title: v77,
            url: v76
          });
        }
      });
      if (!v72.length) {
        return [];
      }
      const v78 = v59 === "tv";
      const v79 = v68.toLowerCase();
      let v80 = v72.find(v81 => v81.title.toLowerCase().includes(v79));
      if (!v80) {
        v80 = v72[0];
      }
      const v82 = v80.url.startsWith("http") ? v80.url : "" + BASE_URL + v80.url;
      const v83 = yield (yield __nvFetch(v82, {
        headers: HEADERS
      })).text();
      const v84 = cheerio.load(v83);
      const v85 = v84("input#video-id").attr("value");
      if (!v85) {
        return [];
      }
      const v86 = [];
      const v87 = v88 => __async(this, null, function* () {
        const v89 = v65;
        for (const v90 of v88) {
          let v91 = (v90.url || "").trim();
          if (!v91) {
            continue;
          }
          if (!v91.startsWith("http")) {
            v91 = "" + BASE_URL + v91;
          }
          const v92 = extractQuality(v90.res || v91);
          if (v91.match(/\.(mp4|mkv|m3u8)/i)) {
            v86.push({
              url: v91,
              quality: v92
            });
          } else {
            try {
              const v93 = yield (yield __nvFetch(v91, {
                headers: HEADERS
              })).text();
              const v94 = parseStreamFromShortenerHtml(v93);
              if (v94 && v94.startsWith("http")) {
                const v95 = extractQuality(v94) !== "Unknown" ? extractQuality(v94) : v92;
                v86.push({
                  url: v94,
                  quality: v95
                });
              }
            } catch (v96) {}
          }
        }
      });
      if (v78) {
        const v97 = BASE_URL + "/ajax/episodes.php?video_id=" + v85;
        const v98 = yield (yield __nvFetch(v97, {
          headers: HEADERS
        })).json();
        const v99 = v98.episodes || [];
        if (!v99.length) {
          return [];
        }
        let v100 = "";
        for (const v101 of v99) {
          const v102 = (v101.title || "").toLowerCase();
          const v103 = v102.match(/s(\d{1,2})e(\d{1,3})/);
          if (v103) {
            const v104 = parseInt(v103[1]);
            const v105 = parseInt(v103[2]);
            if (v104 === v60 && v105 === v61) {
              v100 = v101.url ? v101.url.startsWith("http") ? v101.url : "" + BASE_URL + v101.url : "";
              break;
            }
          }
        }
        if (!v100 && v99.length > 0) {
          v100 = v99[0].url ? v99[0].url.startsWith("http") ? v99[0].url : "" + BASE_URL + v99[0].url : "";
        }
        if (!v100) {
          return [];
        }
        const v106 = yield (yield __nvFetch(v100, {
          headers: HEADERS
        })).text();
        const v107 = cheerio.load(v106);
        const v108 = v107("input#video-id").attr("value");
        if (v108) {
          const v109 = BASE_URL + "/ajax/resolution_switcher.php?video_id=" + v108;
          const v110 = yield (yield __nvFetch(v109, {
            headers: HEADERS
          })).json();
          const v111 = [...(v110.current || []), ...(v110.popup || [])];
          yield v87(v111);
        }
      } else {
        const v112 = BASE_URL + "/ajax/resolution_switcher.php?video_id=" + v85;
        const v113 = yield (yield __nvFetch(v112, {
          headers: HEADERS
        })).json();
        const v114 = [...(v113.current || []), ...(v113.popup || [])];
        yield v87(v114);
      }
      const v115 = [];
      const v116 = new Set();
      for (const v117 of v86) {
        if (!v116.has(v117.url)) {
          v116.add(v117.url);
          const v118 = generateStreamLayout(v117.url, v68, v117.quality, v67, v78, v60, v61);
          v115.push(v118);
        }
      }
      const v119 = {
        "4K": 5,
        "1080p": 4,
        "720p": 3,
        "480p": 2,
        "360p": 1,
        Unknown: 0
      };
      v115.sort((v120, v121) => {
        const v122 = v119[v120.quality] || 0;
        const v123 = v119[v121.quality] || 0;
        return v123 - v122;
      });
      return v115;
    } catch (v124) {
      console.error("[FibWatch]", v124);
      return [];
    }
  });
}
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    getStreams: getStreams
  };
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
  var PROVIDER = "fibwatch";
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