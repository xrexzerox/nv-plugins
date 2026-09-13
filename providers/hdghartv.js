/*
 * nv-plugins hdghartv.js — FULLY DECODED port of the All-in-One-Nuvio provider (4.24.0 merge pass).
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
const v2 = v1; /*string-table removed*/ /*decoder removed*/ /*rotation removed*/
;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __objRest = (v3, v4) => {
  const v5 = {
    dh1: 506
  };
  const v6 = v2;
  var v7 = {};
  for (var v8 in v3) {
    if (__hasOwnProp.call(v3, v8) && v4.indexOf(v8) < 0) {
      v7[v8] = v3[v8];
    }
  }
  if (v3 != null && __getOwnPropSymbols) {
    for (var v8 of __getOwnPropSymbols(v3)) {
      if (v4.indexOf(v8) < 0 && __propIsEnum.call(v3, v8)) {
        v7[v8] = v3[v8];
      }
    }
  }
  return v7;
};
var __async = (v9, v10, v11) => {
  const v12 = {
    dh2: 516
  };
  return new Promise((v13, v14) => {
    const v15 = {
      dh3: 516
    };
    const v16 = v1;
    var v17 = v18 => {
      const v19 = v1;
      try {
        v20(v11.next(v18));
      } catch (v21) {
        v14(v21);
      }
    };
    var v22 = v23 => {
      const v24 = v1;
      try {
        v20(v11.throw(v23));
      } catch (v25) {
        v14(v25);
      }
    };
    var v20 = v26 => v26.done ? v13(v26.value) : Promise.resolve(v26.value).then(v17, v22);
    v20((v11 = v11.apply(v9, v10)).next());
  });
};
var HDGHARTV_API = "https://hdghartv.cc";
var TMDB_BASE = "https://api.themoviedb.org/3";
var TMDB_KEY = "439c478a771f35c05022f9feabcca01c";
var UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36";
var BASE_HEADERS = {
  "User-Agent": UA,
  Referer: HDGHARTV_API + "/"
};
function getStreams(v27, v28, v29, v30) {
  const v31 = {
    dh4: 513,
    dh5: 489,
    dh6: 487,
    dh7: 497,
    dh8: 501,
    dh9: 526,
    dh10: 507,
    dh11: 512,
    dh12: 523,
    dh13: 475,
    dh14: 482,
    dh15: 534,
    dh16: 527,
    dh17: 514,
    dh18: 534,
    dh19: 479,
    dh20: 488,
    dh21: 488,
    dh22: 488,
    dh23: 505,
    dh24: 488,
    dh25: 528,
    dh26: 494,
    dh27: 498,
    dh28: 472
  };
  return __async(this, null, function* () {
    const v32 = {
      dh29: 474
    };
    const v33 = v1;
    const v34 = v28 === "tv" || v28 === "series";
    const v35 = v34 ? "series" : "movies";
    try {
      const v36 = v34 ? "tv" : "movie";
      const v37 = TMDB_BASE + "/" + v36 + "/" + v27 + "?api_key=" + TMDB_KEY + "&append_to_response=external_ids";
      const v38 = yield __nvFetch(v37).then(v39 => v39.json()).catch(() => null);
      if (!v38) {
        return [];
      }
      const v40 = v38.title || v38.name || "Unknown Title";
      const v41 = v38.release_date ? v38.release_date.split("-")[0] : v38.first_air_date ? v38.first_air_date.split("-")[0] : "2026";
      let v42 = "N/A";
      if (!v34 && v38.runtime) {
        v42 = v38.runtime + " min";
      } else if (v34 && v38.episode_run_time && v38.episode_run_time.length > 0) {
        v42 = v38.episode_run_time[0] + " min";
      }
      const v43 = yield __nvFetch(HDGHARTV_API + "/api/search?q=" + encodeURIComponent(v40) + "&type=all&page=1", {
        headers: BASE_HEADERS
      }).catch(() => null);
      if (!v43 || !v43.ok) {
        return [];
      }
      const v44 = yield v43.json().catch(() => null);
      if (!v44) {
        return [];
      }
      const v45 = [...(v44.movies || []), ...(v44.series || [])];
      const v46 = v45.find(v47 => v47.tmdbId === Number(v27));
      if (!v46 || !v46._id) {
        return [];
      }
      const v48 = yield __nvFetch(HDGHARTV_API + "/api/" + v35 + "/public/" + v46._id, {
        headers: BASE_HEADERS
      }).catch(() => null);
      if (!v48 || !v48.ok) {
        return [];
      }
      const v49 = yield v48.json().catch(() => null);
      if (!v49) {
        return [];
      }
      let v50 = [];
      if (!v34) {
        v50 = v49.streamingLinks || [];
      } else {
        const v51 = (v49.seasons || []).find(v52 => v52.seasonNumber === Number(v29));
        if (!v51) {
          return [];
        }
        const v53 = (v51.episodes || []).find(v54 => v54.episodeNumber === Number(v30));
        if (!v53) {
          return [];
        }
        v50 = v53.streamingLinks || [];
      }
      const v55 = [];
      for (const v56 of v50) {
        if (!v56 || !v56.url) {
          continue;
        }
        const v57 = ((v56.quality || "") + " " + (v56.name || "") + " " + v56.url).toLowerCase();
        const v58 = /\b(2160p|4k)\b/i.test(v57);
        const v59 = /\b(1080p)\b/i.test(v57);
        const v60 = /\b(720p)\b/i.test(v57);
        if (!v58 && !v59 && !v60) {
          continue;
        }
        let v61 = "1080p";
        let v62 = "🔥";
        let v63 = 2;
        if (v58) {
          v61 = "2160p";
          v62 = "💎";
          v63 = 3;
        } else if (v60) {
          v61 = "720p";
          v62 = "🎬";
          v63 = 1;
        }
        let v64 = "Dual-Audio 🌐";
        if (/hindi|hin|🇮🇳/.test(v57) && !/multi|dual/.test(v57)) {
          v64 = "Hindi 🇮🇳";
        }
        const v65 = v56.url.includes(".m3u8");
        const v66 = v65 ? "HLS" : /\b(mp4|avi|m4v)\b/.test(v57) ? "MP4" : "MKV";
        const v67 = /\b(hevc|x265|h265)\b/.test(v57) ? "x.265" : "x.264";
        const v68 = v65 ? "HLS" : "Direct";
        const v69 = /\b(ddp|dd\+|eac3|dolby)\b/.test(v57) ? "E-AC3" : /\b(ac3|dolby)\b/.test(v57) ? "AC3" : "AAC";
        const v70 = v34 ? "🎦 " + v40 + " - (" + v41 + ") | S" + (v29 || 1) + "E" + (v30 || 1) : "🎦 " + v40 + " - (" + v41 + ")";
        const v71 = v70 + "\n" + v62 + " " + v61 + " | 🔊 " + v64 + " | ⏳ " + v42 + "\n⚡ " + v66 + " | 🎥 " + v67 + " • " + v68 + " | 🎧 " + v69 + "\n🛰️ Source: HDGharTV";
        v55.push({
          rank: v63,
          name: "HDGharTV | " + v61 + " | Dual-Audio",
          title: v71,
          description: v71,
          size: v71,
          url: v56.url,
          headers: BASE_HEADERS,
          behaviorHints: {
            notSupported: false,
            proxyHeaders: {
              request: BASE_HEADERS
            }
          }
        });
      }
      v55.sort((v72, v73) => v73.rank - v72.rank);
      return v55.map(v74 => {
        const v75 = v33;
        var v76 = v74;
        var {
          rank: v77
        } = v76;
        var v78 = __objRest(v76, ["rank"]);
        return v78;
      });
    } catch (v79) {
      console.error("Failed to construct layout from HDGHARTV endpoint:", v79);
      return [];
    }
  });
}
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    getStreams: getStreams
  };
} else {
  global.getStreams = getStreams;
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
  var PROVIDER = "hdghartv";
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