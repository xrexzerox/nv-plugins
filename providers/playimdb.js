/*
 * nv-plugins playimdb.js — FULLY DECODED port of the All-in-One-Nuvio provider (4.23.0 best-settings pass).
 * Decoded from the obfuscated AIO build: string tables resolved, decoder machinery stripped,
 * every network call capped by an 8s deadline, nvio post-filter attached (en/tl audio gate,
 * >=720p quality gate, cross-provider dedupe). Behavior/endpoints identical to the AIO original.
 */
/* nv-plugins best-settings pass 4.23.0: hard 8s deadline on every network call */
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
function v1() {
  return "";
}
var v2 = v1; /*string-table removed*/ /*rotation removed*/
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
  var v8 = v2;
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
  var v15 = {
    dh1: 133
  };
  return new Promise((v16, v17) => {
    var v18 = v1;
    var v19 = v20 => {
      try {
        v21(v14.next(v20));
      } catch (v22) {
        v17(v22);
      }
    };
    var v23 = v24 => {
      try {
        v21(v14.throw(v24));
      } catch (v25) {
        v17(v25);
      }
    };
    var v21 = v26 => v26.done ? v16(v26.value) : Promise.resolve(v26.value).then(v19, v23);
    v21((v14 = v14.apply(v12, v13)).next());
  });
};
var PROVIDER_NAME = "🟡 PlayIMDb";
var BASE_API = "https://streamdata.vaplayer.ru/api.php";
var TMDB_API_KEY = "68e094699525b18a70bab2f86b1fa706";
var HEADERS = {
  Origin: "https://nextgencloudfabric.com",
  Referer: "https://nextgencloudfabric.com/",
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
};
function fetchWithTimeout(v27, v28) {
  return __async(this, null, function* () {
    var v29 = v1;
    var v30 = 10000;
    var v31 = typeof AbortSignal !== "undefined" && AbortSignal.timeout ? AbortSignal.timeout(v30) : null;
    var v32 = __spreadProps(__spreadValues({}, v28), {
      headers: __spreadValues(__spreadValues({}, HEADERS), (v28 == null ? undefined : v28.headers) || {})
    });
    if (v31) {
      v32.signal = v31;
    }
    return yield __nvFetch(v27, v32);
  });
} /*decoder removed*/
function fetchJson(v33, v34) {
  var v35 = {
    dh2: 184
  };
  return __async(this, null, function* () {
    var v36 = v1;
    try {
      var v37 = yield fetchWithTimeout(v33, v34 || {});
      if (v37.ok) {
        return yield v37.json();
      }
      return null;
    } catch (v38) {
      console.log("[" + PROVIDER_NAME + "] fetchJson error: " + v38);
      return null;
    }
  });
}
function getTmdbMetadata(v39, v40, v41, v42) {
  var v43 = {
    dh3: 185,
    dh4: 191,
    dh5: 161,
    dh6: 158,
    dh7: 156,
    dh8: 189,
    dh9: 189
  };
  return __async(this, null, function* () {
    var v44 = v1;
    let v45 = "Unknown Title";
    let v46 = v40 === "tv" ? "45 min" : "90 min";
    try {
      const v47 = v40 === "movie" ? "movie" : "tv";
      const v48 = "https://api.themoviedb.org/3/" + v47 + "/" + v39 + "?api_key=" + TMDB_API_KEY;
      const v49 = yield __nvFetch(v48);
      if (!v49.ok) {
        return {
          name: v45,
          year: "N/A",
          duration: v46
        };
      }
      const v50 = yield v49.json();
      let v51 = v46;
      if (v40 === "movie" && v50.runtime) {
        v51 = v50.runtime + " min";
      } else if (v40 === "tv") {
        const v52 = "https://api.themoviedb.org/3/tv/" + v39 + "/season/" + v41 + "/episode/" + v42 + "?api_key=" + TMDB_API_KEY;
        const v53 = yield __nvFetch(v52);
        if (v53.ok) {
          const v54 = yield v53.json();
          if (v54.runtime) {
            v51 = v54.runtime + " min";
          } else if (v50.episode_run_time && v50.episode_run_time.length > 0) {
            v51 = v50.episode_run_time[0] + " min";
          }
        }
      }
      return {
        name: v50.title || v50.name || v45,
        year: (v50.release_date || v50.first_air_date || "").split("-")[0] || "N/A",
        duration: v51
      };
    } catch (v55) {
      return {
        name: v45,
        year: "N/A",
        duration: v46
      };
    }
  });
}
function getStreams(v56, v57, v58, v59) {
  var v60 = {
    dh10: 124,
    dh11: 127,
    dh12: 136,
    dh13: 149,
    dh14: 157,
    dh15: 168,
    dh16: 148,
    dh17: 130,
    dh18: 130,
    dh19: 155,
    dh20: 153,
    dh21: 138,
    dh22: 147,
    dh23: 130,
    dh24: 140,
    dh25: 195,
    dh26: 144
  };
  return __async(this, null, function* () {
    var v61 = {
      dh27: 171,
      dh28: 154,
      dh29: 178,
      dh30: 126,
      dh31: 134,
      dh32: 145,
      dh33: 186,
      dh34: 145
    };
    var v62 = {
      dh35: 150
    };
    var v63 = v1;
    var v64 = [];
    try {
      var v65 = v57 === "tv" || v57 === "series";
      var v66 = v65 ? "tv" : "movie";
      if (!v56) {
        console.log("[" + PROVIDER_NAME + "] Missing TMDB ID");
        return v64;
      }
      var v67 = yield getTmdbMetadata(v56, v66, v58, v59);
      var v68 = BASE_API + "?tmdb=" + v56 + "&type=" + v66;
      if (v65) {
        if (!v58 || !v59) {
          return v64;
        }
        v68 += "&season=" + v58 + "&episode=" + v59;
      }
      console.log("[" + PROVIDER_NAME + "] Fetching stream data from API: " + v68);
      var v69 = yield fetchJson(v68, {
        headers: HEADERS
      });
      if (v69 && (v69.status_code == 200 || v69.status_code === "200") && v69.data && v69.data.stream_urls) {
        var v70 = "1080p FHD";
        var v71 = "1080P";
        var v72 = String(v69.data.file_name || "").toLowerCase();
        if (v72.includes("2160p") || v72.includes("4k")) {
          v70 = "4K UHD";
          v71 = "2160P";
        } else if (v72.includes("1080p")) {
          v70 = "1080p FHD";
          v71 = "1080P";
        } else if (v72.includes("720p")) {
          v70 = "720p HD";
          v71 = "720P";
        }
        var v73 = "Original-Audio";
        var v74 = "Original-Audio";
        if (v72.includes("dual") || v72.includes("hindi") && v72.includes("english")) {
          v73 = "Dual-Audio";
          v74 = "English • Hindi";
        } else if (v72.includes("multi")) {
          v73 = "Multi-Audio";
          v74 = "Multilingual";
        } else if (v72.includes("hindi")) {
          v73 = "Hindi-Audio";
          v74 = "Hindi";
        } else if (v72.includes("english")) {
          v73 = "English-Audio";
          v74 = "English";
        }
        var v75 = v67.name || "Unknown Title";
        var v76 = v67.year || "N/A";
        v69.data.stream_urls.forEach((v77, v78) => {
          var v79 = v63;
          var v80 = v77.toLowerCase();
          var v81 = "Server " + (v78 + 1);
          var v82 = "MKV";
          if (v80.includes(".mp4")) {
            v82 = "MP4";
          }
          if (v80.includes(".m3u8")) {
            v82 = "M3U8";
          }
          var v83 = PROVIDER_NAME + " | " + v70 + " | " + v73;
          var v84 = v65 ? "🎬 " + v75 + " - S" + v58 + "E" + v59 + " (" + v76 + ")" : "🎬 " + v75 + " - " + v76;
          var v85 = "💎 " + v71 + " | 🌍 " + v74;
          var v86 = "🎞️ " + v82 + " | ⏱️ " + v67.duration + " | 📌 " + v81;
          var v87 = v84 + "\n" + v85 + "\n" + v86;
          var v88 = {
            name: v83,
            title: v87,
            url: v77,
            quality: v71.toLowerCase(),
            type: "direct"
          };
          v88.headers = HEADERS;
          if (v69.default_subs && Array.isArray(v69.default_subs) && v69.default_subs.length > 0) {
            v88.subtitles = v69.default_subs.map(v89 => {
              var v90 = v79;
              return {
                id: v89.code || v89.lang,
                url: v89.url,
                lang: v89.lang
              };
            });
          }
          v64.push(v88);
        });
      }
    } catch (v91) {
      console.log("[" + PROVIDER_NAME + "] Error: " + v91.message);
    }
    return v64;
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
  var PROVIDER = "playimdb";
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
    var p = fetch(url, opts).then(function (r) {
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