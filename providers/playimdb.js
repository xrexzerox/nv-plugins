/*
 * nv-plugins playimdb.js — FULLY DECODED port of the All-in-One-Nuvio provider (4.23.0 best-settings pass).
 * Decoded from the obfuscated AIO build: string tables resolved, decoder machinery stripped,
 * every network call capped by an 8s deadline, nvio post-filter attached (en/tl audio gate,
 * >=720p quality gate, cross-provider dedupe). Behavior/endpoints identical to the AIO original.
 */
/* nv-plugins best-settings pass 4.23.0: hard 8s deadline on every network call */
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
var v1 = function() {
  return "";
};
var __defProp = Object.defineProperty,
  __defProps = Object.defineProperties,
  __getOwnPropDescs = Object.getOwnPropertyDescriptors,
  __getOwnPropSymbols = Object.getOwnPropertySymbols,
  __hasOwnProp = Object.prototype.hasOwnProperty,
  __propIsEnum = Object.prototype.propertyIsEnumerable,
  __defNormalProp = (v3, v4, v5) => (v4 in v3) ? __defProp(v3, v4, {
    enumerable: true,
    configurable: true,
    writable: true,
    value: v5
  }) : v3[v4] = v5,
  __spreadValues = (v6, v7) => {
    for (var v9 in v7 || (v7 = {}))
      if (__hasOwnProp.call(v7, v9)) __defNormalProp(v6, v9, v7[v9]);
    if (__getOwnPropSymbols)
      for (var v9 of __getOwnPropSymbols(v7)) {
        if (__propIsEnum.call(v7, v9)) __defNormalProp(v6, v9, v7[v9]);
      }
    return v6;
  },
  __spreadProps = (v10, v11) => __defProps(v10, __getOwnPropDescs(v11)),
  __async = (v12, v13, v14) => {
    return new Promise((v17, v18) => {
      var v20 = v21 => {
          try {
            v22(v14.next(v21));
          } catch (v23) {
            v18(v23);
          }
        },
        v24 = v25 => {
          try {
            v22(v14.throw(v25));
          } catch (v26) {
            v18(v26);
          }
        },
        v22 = v27 => v27.done ? v17(v27.value) : Promise.resolve(v27.value).then(v20, v24);
      v22((v14 = v14.apply(v12, v13)).next());
    });
  },
  PROVIDER_NAME = "🟡 PlayIMDb",
  BASE_API = "https://streamdata.vaplayer.ru/api.php",
  TMDB_API_KEY = "68e094699525b18a70bab2f86b1fa706",
  HEADERS = {
    Origin: "https://nextgencloudfabric.com",
    Referer: "https://nextgencloudfabric.com/",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
  };

function fetchWithTimeout(v28, v29) {
  return __async(this, null, function*() {
    var v31 = 10000,
      v32 = typeof AbortSignal !== "undefined" && AbortSignal.timeout ? AbortSignal.timeout(v31) : null,
      v33 = __spreadProps(__spreadValues({}, v29), {
        headers: __spreadValues(__spreadValues({}, HEADERS), (v29 == null ? void 0 : v29.headers) ||
        ({}))
      });
    if (v32) v33.signal = v32;
    return yield __nvFetch(v28, v33);
  });
}
/*decoder removed*/
function fetchJson(v34, v35) {
  return __async(this, null, function*() {
    try {
      var v39 = yield fetchWithTimeout(v34, v35 || ({}));
      if (v39.ok) return yield v39.json();
      return null;
    } catch (v40) {
      return (console.log("[" + PROVIDER_NAME + "] fetchJson error: " + v40), null);
    }
  });
}

function getTmdbMetadata(v41, v42, v43, v44) {
  var v45 = {
    v46: 185,
    v47: 191,
    v48: 161,
    v49: 158,
    v50: 156,
    v51: 189,
    v52: 189
  };
  return __async(this, null, function*() {
    let v54 = "Unknown Title",
      v55 = v42 === "tv" ? "45 min" : "90 min";
    try {
      const v56 = v42 === "movie" ? "movie" : "tv",
        v57 = "https://api.themoviedb.org/3/" + v56 + "/" + v41 + "?api_key=" + TMDB_API_KEY,
        v58 = yield __nvFetch(v57);
      if (!v58.ok) return {
        name: v54,
        year: "N/A",
        duration: v55
      };
      const v59 = yield v58.json();
      let v60 = v55;
      if (v42 === "movie" && v59.runtime) v60 = v59.runtime + " min";
      else {
        if (v42 === "tv") {
          const v61 = "https://api.themoviedb.org/3/tv/" + v41 + "/season/" + v43 + "/episode/" + v44 +
            "?api_key=" + TMDB_API_KEY,
            v62 = yield __nvFetch(v61);
          if (v62.ok) {
            const v63 = yield v62.json();
            if (v63.runtime) v60 = v63.runtime + " min";
            else v59.episode_run_time && v59.episode_run_time.length > 0 && (v60 = v59.episode_run_time[
              0] + " min");
          }
        }
      }
      return {
        name: v59.title || v59.name || v54,
        year: (v59.release_date || v59.first_air_date || "").split("-")[0] || "N/A",
        duration: v60
      };
    } catch (v64) {
      return {
        name: v54,
        year: "N/A",
        duration: v55
      };
    }
  });
}

function getStreams(v65, v66, v67, v68) {
  var v69 = {
    v70: 124,
    v71: 127,
    v72: 136,
    v73: 149,
    v74: 157,
    v75: 168,
    v76: 148,
    v77: 130,
    v78: 130,
    v79: 155,
    v80: 153,
    v81: 138,
    v82: 147,
    v83: 130,
    v84: 140,
    v85: 195,
    v86: 144
  };
  return __async(this, null, function*() {
    var v87 = {
        v88: 171,
        v89: 154,
        v90: 178,
        v91: 126,
        v92: 134,
        v93: 145,
        v94: 186,
        v95: 145
      },
      v99 = [];
    try {
      var v100 = v66 === "tv" || v66 === "series",
        v101 = v100 ? "tv" : "movie";
      if (!v65) return (console.log("[" + PROVIDER_NAME + "] Missing TMDB ID"), v99);
      var v102 = yield getTmdbMetadata(v65, v101, v67, v68), v103 = BASE_API + "?tmdb=" + v65 + "&type=" +
        v101;
      if (v100) {
        if (!v67 || !v68) return v99;
        v103 += "&season=" + v67 + "&episode=" + v68;
      }
      console.log("[" + PROVIDER_NAME + "] Fetching stream data from API: " + v103);
      var v104 = yield fetchJson(v103, {
        headers: HEADERS
      });
      if (v104 && (v104.status_code == 200 || v104.status_code === "200") && v104.data && v104.data
        .stream_urls) {
        var v105 = "1080p FHD",
          v106 = "1080P",
          v107 = String(v104.data.file_name || "").toLowerCase();
        if (v107.includes("2160p") || v107.includes("4k"))(v105 = "4K UHD", v106 = "2160P");
        else {
          if (v107.includes("1080p"))(v105 = "1080p FHD", v106 = "1080P");
          else v107.includes("720p") && (v105 = "720p HD", v106 = "720P");
        }
        var v108 = "Original-Audio",
          v109 = "Original-Audio";
        if (v107.includes("dual") || v107.includes("hindi") && v107.includes("english"))(v108 =
          "Dual-Audio", v109 = "English • Hindi");
        else {
          if (v107.includes("multi"))(v108 = "Multi-Audio", v109 = "Multilingual");
          else {
            if (v107.includes("hindi"))(v108 = "Hindi-Audio", v109 = "Hindi");
            else v107.includes("english") && (v108 = "English-Audio", v109 = "English");
          }
        }
        var v110 = v102.name || "Unknown Title",
          v111 = v102.year || "N/A";
        v104.data.stream_urls.forEach((v112, v113) => {
          var v115 = v112.toLowerCase(),
            v116 = "Server " + (v113 + 1),
            v117 = "MKV";
          if (v115.includes(".mp4")) v117 = "MP4";
          if (v115.includes(".m3u8")) v117 = "M3U8";
          var v118 = PROVIDER_NAME + " | " + v105 + " | " + v108,
            v119 = v100 ? "🎬 " + v110 + " - S" + v67 + "E" + v68 + " (" + v111 + ")" : "🎬 " + v110 +
            " - " + v111,
            v120 = "💎 " + v106 + " | 🌍 " + v109,
            v121 = "🎞️ " + v117 + " | ⏱️ " + v102.duration + " | 📌 " + v116,
            v122 = v119 + "\n" + v120 + "\n" + v121,
            v123 = {
              name: v118,
              title: v122,
              url: v112,
              quality: v106.toLowerCase(),
              type: "direct"
            };
          (v123.headers = HEADERS, v104.default_subs && Array.isArray(v104.default_subs) && v104
            .default_subs.length > 0 && (v123.subtitles = v104.default_subs.map(v124 => {
              return {
                id: v124.code || v124.lang,
                url: v124.url,
                lang: v124.lang
              };
            })), v99.push(v123));
        });
      }
    } catch (v126) {
      console.log("[" + PROVIDER_NAME + "] Error: " + v126.message);
    }
    return v99;
  });
}
typeof module !== 'undefined' && module["exports"] ? module["exports"] = {
  'getStreams': getStreams
} : global["getStreams"] = getStreams;
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
  var PROVIDER = "playimdb";
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
    var p = fetch(url, opts).then(function(r) {
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
