/*
 * nv-plugins fibwatch.js — FULLY DECODED port of the All-in-One-Nuvio provider (4.24.0 merge pass).
 * Decoded from the obfuscated AIO build: string tables resolved, decoder machinery stripped,
 * every network call capped by an 8s deadline, node-core requires fail-soft, nvio post-filter
 * attached (en/tl audio gate, >=720p quality gate, cross-provider dedupe). Endpoints/keys/headers
 * identical to the AIO original.
 */
/* nv-plugins best-settings pass 4.24.0: hard 8s deadline on every network call */
var __nvFetch = (function() {
  var _f = null;
  try {
    _f = (typeof fetch === "function") ? fetch : null;
  } catch (e) {
    _f = null;
  }
  if (!_f) return function() {
    return Promise.reject(new Error("no fetch"));
  };
  var hasT = typeof setTimeout === "function";
  return function(input, init) {
    var p;
    try {
      p = _f.apply(this, arguments);
    } catch (e) {
      return Promise.reject(e);
    }
    if (!hasT || !p || typeof p.then !== "function") return p;
    return Promise.race([p, new Promise(function(_res, rej) {
      var t = setTimeout(function() {
        rej(new Error("nv deadline 8s"));
      }, 8000);
      if (t && typeof t.unref === "function") t.unref();
    })]);
  };
})();
/* fail-soft require: node-core modules (net/http/assert/...) never crash the provider */
var __nvRequire = (function() {
  var _rq = null;
  try {
    _rq = (typeof require === "function") ? require : null;
  } catch (e) {
    _rq = null;
  }
  return function(name) {
    if (_rq) {
      try {
        return _rq(name);
      } catch (e) {}
    }
    return {};
  };
})();
/* QuickJS-safe global aliases: embedded polyfills (forge/uuid/whatwg) reference
   window/self/document unguarded - in Nuvio's QuickJS those would throw
   ReferenceError at module load and kill the provider. */
var window = (typeof window !== "undefined" && window) ? window :
  (typeof globalThis !== "undefined" ? globalThis : (typeof global !== "undefined" ? global : {}));
var self = (typeof self !== "undefined" && self) ? self : window;
var document = (typeof document !== "undefined" && document) ? document : {
  createElement: function() {
    return {
      style: {},
      setAttribute: function() {},
      getElementsByTagName: function() {
        return [];
      }
    };
  },
  getElementsByTagName: function() {
    return [];
  },
  addEventListener: function() {}
};
var navigator = (typeof navigator !== "undefined" && navigator) ? navigator : {
  userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36"
};
var v1 = function() {
  return "";
};
var __async = (v3, v4, v5) => {
    return new Promise((v6, v7) => {
      var v9 = v10 => {
          try {
            v11(v5.next(v10));
          } catch (v12) {
            v7(v12);
          }
        },
        v13 = v14 => {
          try {
            v11(v5.throw(v14));
          } catch (v15) {
            v7(v15);
          }
        },
        v11 = v16 => v16.done ? v6(v16.value) : Promise.resolve(v16.value).then(v9, v13);
      v11((v5 = v5.apply(v3, v4)).next());
    });
  },
  cheerio = __nvRequire("cheerio-without-node-native"),
  BASE_URL = "https://fibwatch.art",
  TMDB_API_KEY = "1865f43a0549ca50d341dd9ab8b29f49",
  BROWSER_UA =
  "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36",
  HEADERS = {
    "User-Agent": BROWSER_UA,
    Referer: BASE_URL + "/"
  },
  PLAYBACK_HEADERS = {
    "User-Agent": BROWSER_UA,
    Referer: "https://urlshortlink.top/",
    Origin: "https://urlshortlink.top"
  };

function extractQuality(v17) {
  const v26 = (v17 || "").toLowerCase();
  if (v26.includes("2160") || v26.includes("4k")) return "4K";
  if (v26.includes("1080")) return "1080p";
  if (v26.includes("720")) return "720p";
  if (v26.includes("480")) return "480p";
  if (v26.includes("360")) return "360p";
  return "Unknown";
}

function parseStreamFromShortenerHtml(v27) {
  if (!v27) return null;
  const v33 = cheerio.load(v27);
  let v34 = v33("a.hidden-button.buttonDownloadnew").attr("href");
  !v34 && v33("a").each((v35, v36) => {
    const v38 = v33(v36).attr("href") || "";
    if (v38.includes("url=http")) return (v34 = v38, false);
  });
  if (!v34) {
    const v39 = /https?:\/\/[^\s"'`<>]+?\.b-cdn\.net\/[^\s"'`<>]+\.(?:mkv|mp4|m3u8)/i,
      v40 = v27.match(v39);
    if (v40) return v40[0];
  }
  if (v34) {
    let v41 = v34.replace(/.*url=/, "").trim();
    return decodeURIComponent(v41);
  }
  return null;
}
/*decoder removed*/
function generateStreamLayout(v42, v43, v44, v45, v46, v47, v48) {
  const v49 = {
    v50: 498,
    v51: 490,
    v52: 496,
    v53: 523,
    v54: 493,
    v55: 521,
    v56: 508,
    v57: 486,
    v58: 527,
    v59: 519,
    v60: 511,
    v61: 533,
    v62: 488,
    v63: 474
  };
  var v65;
  const v66 = v45.title || v45.name || "Unknown Title",
    v67 = v45.release_date || v45.first_air_date || "",
    v68 = v67 ? v67.split("-")[0] : "N/A",
    v69 = v42.toLowerCase();
  let v70 = "Single-Audio",
    v71 = "Hindi";
  if (v69.includes("dual") || v69.includes("hindi") && v69.includes("english"))(v70 = "Dual-Audio", v71 =
    "English • Hindi");
  else {
    if (v69.includes("multi"))(v70 = "Multi-Audio", v71 = "Multilingual");
    else {
      if (v69.includes("bangla")) v71 = "Bangla";
      else {
        if (v69.includes("tamil")) v71 = "Tamil";
        else {
          if (v69.includes("telugu")) v71 = "Telugu";
          else v69.includes("english") && (v70 = "Single-Audio", v71 = "English");
        }
      }
    }
  }
  let v72 = "MKV";
  if (v69.includes(".mp4")) v72 = "MP4";
  if (v69.includes(".m3u8")) v72 = "M3U8 / HLS";
  let v73 = "N/A";
  v46 ? v73 = ((v65 = v45.episode_run_time) == null ? void 0 : v65[0]) ? v45.episode_run_time[0] + " min" :
    "45 min" : v73 = v45.runtime ? v45.runtime + " min" : "N/A";
  const v74 = v44.includes("4K") || v44.includes("2160") ? "🌟" : "💎",
    v75 = "⚫ FibWatch | " + v44 + " | " + v70,
    v76 = v46 ? "🎬 " + v66 + " - S" + v47 + "E" + v48 + " (" + v68 + ")" : "🎬 " + v66 + " - " + v68,
    v77 = v74 + " " + v44 + " | 🌍 " + v71,
    v78 = "🎞️ " + v72 + " | ⏱️ " + v73 + " | 📌 WEB-DL",
    v79 = v76 + "\n" + v77 + "\n" + v78;
  return {
    name: v75,
    title: v79,
    url: v42,
    quality: v44,
    behaviorHints: {
      notWebReady: false
    },
    headers: PLAYBACK_HEADERS
  };
}

function getStreams(v80, v81, v82, v83) {
  const v84 = {
    v85: 479,
    v86: 518,
    v87: 520,
    v88: 531,
    v89: 462,
    v90: 492,
    v91: 526,
    v92: 489,
    v93: 506,
    v94: 520,
    v95: 500,
    v96: 462,
    v97: 495,
    v98: 462,
    v99: 528,
    v100: 468,
    v101: 480
  };
  return __async(this, null, function*() {
    try {
      const v110 = "https://api.themoviedb.org/3/" + v81 + "/" + v80 + "?api_key=" + TMDB_API_KEY,
        v111 = yield(yield __nvFetch(v110)).json(), v112 = v111.title || v111.name;
      if (!v112) return [];
      const v113 = BASE_URL + "/search?keyword=" + encodeURIComponent(v112) + "&page_id=1",
        v114 = yield(yield __nvFetch(v113, {
          headers: HEADERS
        })).text(), v115 = cheerio.load(v114), v116 = [];
      v115("div.video-thumb").each((v117, v118) => {
        const v120 = v115("a", v118).attr("href"),
          v121 = v115("p.hptag", v118).text().trim() || v115("div.video-thumb img", v118).attr(
          "alt") || "";
        if (v120) v116.push({
          title: v121,
          url: v120
        });
      });
      if (!v116.length) return [];
      const v122 = v81 === "tv",
        v123 = v112.toLowerCase();
      let v124 = v116.find(v125 => v125.title.toLowerCase().includes(v123));
      if (!v124) v124 = v116[0];
      const v126 = v124.url.startsWith("http") ? v124.url : "" + BASE_URL + v124.url,
        v127 = yield(yield __nvFetch(v126, {
          headers: HEADERS
        })).text(), v128 = cheerio.load(v127), v129 = v128("input#video-id").attr("value");
      if (!v129) return [];
      const v130 = [],
        v131 = v132 => __async(this, null, function*() {
          for (const v134 of v132) {
            let v135 = (v134.url || "").trim();
            if (!v135) continue;
            !v135.startsWith("http") && (v135 = "" + BASE_URL + v135);
            const v136 = extractQuality(v134.res || v135);
            if (v135.match(/\.(mp4|mkv|m3u8)/i)) v130.push({
              url: v135,
              quality: v136
            });
            else try {
              const v137 = yield(yield __nvFetch(v135, {
                headers: HEADERS
              })).text(), v138 = parseStreamFromShortenerHtml(v137);
              if (v138 && v138.startsWith("http")) {
                const v139 = extractQuality(v138) !== "Unknown" ? extractQuality(v138) : v136;
                v130.push({
                  url: v138,
                  quality: v139
                });
              }
            } catch (v140) {}
          }
        });
      if (v122) {
        const v141 = BASE_URL + "/ajax/episodes.php?video_id=" + v129,
          v142 = yield(yield __nvFetch(v141, {
            headers: HEADERS
          })).json(), v143 = v142.episodes || [];
        if (!v143.length) return [];
        let v144 = "";
        for (const v145 of v143) {
          const v146 = (v145.title || "").toLowerCase(),
            v147 = v146.match(/s(\d{1,2})e(\d{1,3})/);
          if (v147) {
            const v148 = parseInt(v147[1]),
              v149 = parseInt(v147[2]);
            if (v148 === v82 && v149 === v83) {
              v144 = v145.url ? v145.url.startsWith("http") ? v145.url : "" + BASE_URL + v145.url : "";
              break;
            }
          }
        }!v144 && v143.length > 0 && (v144 = v143[0].url ? v143[0].url.startsWith("http") ? v143[0].url :
          "" + BASE_URL + v143[0].url : "");
        if (!v144) return [];
        const v150 = yield(yield __nvFetch(v144, {
          headers: HEADERS
        })).text(), v151 = cheerio.load(v150), v152 = v151("input#video-id").attr("value");
        if (v152) {
          const v153 = BASE_URL + "/ajax/resolution_switcher.php?video_id=" + v152,
            v154 = yield(yield __nvFetch(v153, {
              headers: HEADERS
            })).json(), v155 = [...v154.current || [], ...v154.popup || []];
          yield v131(v155);
        }
      } else {
        const v156 = BASE_URL + "/ajax/resolution_switcher.php?video_id=" + v129,
          v157 = yield(yield __nvFetch(v156, {
            headers: HEADERS
          })).json(), v158 = [...v157.current || [], ...v157.popup || []];
        yield v131(v158);
      }
      const v159 = [],
        v160 = new Set();
      for (const v161 of v130) {
        if (!v160.has(v161.url)) {
          v160.add(v161.url);
          const v162 = generateStreamLayout(v161.url, v112, v161.quality, v111, v122, v82, v83);
          v159.push(v162);
        }
      }
      const v163 = {
        "4K": 5,
        "1080p": 4,
        "720p": 3,
        "480p": 2,
        "360p": 1,
        Unknown: 0
      };
      return (v159.sort((v164, v165) => {
        const v166 = v163[v164.quality] || 0,
          v167 = v163[v165.quality] || 0;
        return v167 - v166;
      }), v159);
    } catch (v168) {
      return (console.error("[FibWatch]", v168), []);
    }
  });
}
typeof module !== "undefined" && module["exports"] && (module["exports"] = {
  'getStreams': getStreams
});
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
(function() {
  var PROVIDER = "fibwatch";
  var G = typeof globalThis !== "undefined" ? globalThis : typeof global !== "undefined" ? global : this;

  function settings() {
    try {
      return (G && G.SCRAPER_SETTINGS) || {};
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
    if (!s) return "";
    if (/8k/.test(s)) return "4K";
    if (/2160|4k|uhd/.test(s)) return "4K";
    if (/1440/.test(s)) return "1440p";
    if (/1080|fhd/.test(s)) return "1080p";
    if (/720/.test(s)) return "720p";
    if (/480|360|240|\bsd\b/.test(s)) return "CAM";
    if (/cam|telesync|telecine|\bts\b|\btc\b|screener|dvdscr/.test(s)) return "CAM";
    return "";
  }

  function qFromText(text) {
    var s = String(text || "");
    var m = s.match(/(\d{3,4})\s*p/i);
    if (m) {
      var n = parseInt(m[1], 10);
      if (n >= 2100) return "4K";
      if (n >= 1300) return "1440p";
      if (n >= 1000) return "1080p";
      if (n >= 640) return "720p";
      return "CAM";
    }
    if (/\b8k\b/i.test(s) || /2160|4k|uhd/i.test(s)) return "4K";
    if (/1440p/i.test(s)) return "1440p";
    if (/cam|telesync|telecine|\bts\b|\btc\b|screener|dvdscr/i.test(s)) return "CAM";
    if (/480p|360p|240p|\bsd\b|\bdvdrip\b/i.test(s)) return "CAM";
    if (/\bhd\b/i.test(s)) return "720p";
    return "";
  }
  var qualCache = G.__NV_QUAL_CACHE__ || (G.__NV_QUAL_CACHE__ = {});

  function probeM3u8(url, headers) {
    var now = Date.now();
    var c = qualCache[url];
    if (c && now - c.t < (c.q ? 15 * 60 * 1000 : 3 * 60 * 1000)) {
      return Promise.resolve(c.q);
    }
    var opts = {
      headers: Object.assign({}, headers || {})
    };
    var p = __nvFetch(url, opts).then(function(r) {
      return r.ok ? r.text() : "";
    }).then(function(t) {
      var q = "";
      if (t && t.indexOf("#EXTM3U") !== -1) {
        var best = 0,
          re = /RESOLUTION=(\d+)x(\d+)/gi,
          m;
        while ((m = re.exec(t)) !== null) {
          var h = parseInt(m[2], 10);
          if (h > best) best = h;
        }
        if (best >= 2100) q = "4K";
        else if (best >= 1300) q = "1440p";
        else if (best >= 1000) q = "1080p";
        else if (best >= 640) q = "720p";
        else if (best > 0) q = "CAM";
      }
      qualCache[url] = {
        t: now,
        q: q
      };
      return q;
    }).catch(function() {
      qualCache[url] = {
        t: now,
        q: ""
      };
      return "";
    });
    if (hasTimers()) {
      p = Promise.race([p, new Promise(function(res) {
        var timer = setTimeout(function() {
          res("");
        }, 6000);
        if (typeof timer === "object" && typeof timer.unref === "function") timer.unref();
      })]);
    }
    return p;
  }

  /* ---------- language gate ---------- */
  var BLOCK_RE = new RegExp(
    "\\b(hindi|hin|tamil|telugu|malayalam|mallu|kannada|bengali|bangla|punjabi|marathi|bhojpuri|gujarati|" +
    "odia|assamese|nepali|urdu|sinhala|arabic|ara|farsi|persian|turkish|turkce|espanol|spanish|latino|" +
    "castellano|french|vostfr|german|deutsch|russian|korean|kor|japanese|jpn|chinese|mandarin|cantonese|" +
    "thai|vietnamese|indonesian|bahasa|portuguese|brasileiro|italian|polish|ukrainian|hebrew|" +
    "hungarian|romanian|dutch|flemish|greek|czech|swedish|danish|norwegian|finnish|org)\\b", "i");
  var ALLOW_RE = /\b(english|eng|tagalog|filipino)\b/i;
  var SUB_RE = /\b[a-z0-9]{0,12}subs?\b/gi;
  // NOTE: gate runs on the stream TITLE only (release names / labels).
  // Provider names (e.g. "MallumV") must not trigger the language gate.
  function langAllowed(titleText) {
    var t = String(titleText || "").replace(SUB_RE, " ");
    if (BLOCK_RE.test(t)) return ALLOW_RE.test(t);
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
  var SEEN = G.__NV_SEEN_URLS__ || (G.__NV_SEEN_URLS__ = {});
  // SEEN[nu] = { exp: <ts>, owner: <provider> }
  // - same URL from a DIFFERENT provider within TTL -> dropped (cross-provider dup)
  // - same provider re-querying its own URL -> allowed (repeat opens must still
  //   return rows) and its claim is refreshed
  function claim(nu, now, owner) {
    if (!nu) return true;
    var e = SEEN[nu];
    if (e && e.exp > now && e.owner !== owner) return false;
    SEEN[nu] = {
      exp: now + 120000,
      owner: owner
    };
    return true;
  }

  /* ---------- main ---------- */
  function rank(q) {
    if (q === "4K") return 4;
    if (q === "1440p") return 3.5;
    if (q === "1080p") return 3;
    if (q === "720p") return 2;
    return 0;
  }

  function postProcess(list) {
    var now = Date.now();
    var kept = [];
    var probes = [];
    var rows = [];
    (list || []).forEach(function(s, i) {
      if (!s || !s.url) return;
      if (!langAllowed(s.title)) return;
      var text = (s.name || "") + " " + (s.title || "");
      var isMagnet = /^magnet:/i.test(String(s.url));
      var q = normQ(s.quality) || normQ(String(s.title || "").split("\n")[0]) || qFromText(text);
      var isHlsLike = /m3u8/i.test(String(s.url)) ||
        (!/\.(mp4|mkv|avi|mov|webm|ts|flv|m4v|mp3|aac)(\?|$)/i.test(String(s.url.split("?")[0])) &&
          /^https?:/i.test(String(s.url)));
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
    return Promise.all(probes).then(function(qs) {
      var ranked = [];
      rows.forEach(function(row, k) {
        var q = qs[k];
        if (!q) return; // unknown resolution -> removed
        if (q === "CAM") return; // cam / sd / sub-720 -> removed
        row.s.quality = q;
        ranked.push({
          s: row.s,
          i: row.i,
          q: q
        });
      });
      // best first so dedupe keeps the strongest duplicate (stable)
      ranked.sort(function(a, b) {
        var r = rank(b.q) - rank(a.q);
        if (r !== 0) return r;
        return a.i - b.i;
      });
      var seenLocal = {},
        out = [];
      ranked.forEach(function(row) {
        var s = row.s;
        var nu = normUrl(s.url);
        if (seenLocal[nu]) return;
        if (!claim(nu, now, PROVIDER)) return; // already reported by a different provider
        seenLocal[nu] = 1;
        out.push(s);
      });
      return out.slice(0, 40);
    }).catch(function() {
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
    module.exports.getStreams = function() {
      var args = Array.prototype.slice.call(arguments),
        self = this;

      function finish(v) {
        if (settings().postFilter === false) return v;
        try {
          return postProcess(Array.isArray(v) ? v : []);
        } catch (e) {
          return Array.isArray(v) ? v : [];
        }
      }
      try {
        var r = __orig.apply(self, args);
        if (r && typeof r.then === "function") {
          if (typeof setTimeout === "function") {
            // nv best-settings 4.23.0: hard 8s cap on the whole provider run
            r = Promise.race([r, new Promise(function(res) {
              var dl = setTimeout(function() {
                res([]);
              }, 8000);
              if (dl && typeof dl.unref === "function") dl.unref();
            })]);
          }
          return r.then(function(v) {
            return finish(v);
          }, function() {
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
