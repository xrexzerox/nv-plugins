/*
 * nv-plugins moonflix.js — FULLY DECODED port of the All-in-One-Nuvio provider (4.24.0 merge pass).
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
"use strict"; /*string-table removed*/
var v2 = v1; /*rotation removed*/
; /*decoder removed*/
var M_PLAYER = "https://player.moonflix.website";
var M_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36";
var M_PLAYER_HEADERS = {
  "User-Agent": M_UA,
  Referer: M_PLAYER + "/",
  Origin: M_PLAYER
};
var M_APIS = [["CH", "https://confident-harmony-production-0578.up.railway.app"], ["HV", "https://hvhyu-production.up.railway.app"]];
var TMDB_KEY = "439c478a771f35c05022f9feabcca01c";
function getInvertedSortTag(v3, v4) {
  var v5 = {
    dh1: 360
  };
  var v6 = v2;
  if (!v4) {
    v4 = 999999;
  }
  var v7 = Math.max(0, parseInt(v3, 10) || 0);
  var v8 = Math.max(0, v4 - v7);
  var v9 = v8.toString(2);
  while (v9.length < 20) {
    v9 = "0" + v9;
  }
  return v9.split("").map(function (v10) {
    if (v10 === "1") {
      return "﻿";
    } else {
      return "​";
    }
  }).join("");
}
function getResolutionEmoji(v11) {
  var v12 = {
    dh2: 337,
    dh3: 343
  };
  var v13 = v2;
  var v14 = String(v11 || "").toLowerCase();
  if (v14.includes("2160") || v14.includes("4k") || v14.includes("uhd")) {
    return "🔥 4K";
  }
  if (v14.includes("1080") || v14.includes("fhd")) {
    return "🚀 1080p";
  }
  if (v14.includes("720") || v14.includes("hd")) {
    return "✨ 720p";
  }
  if (v14.includes("480") || v14.includes("sd")) {
    return "💎 480p";
  }
  return "📺 " + (v11 || "1080p");
}
function qualityRank(v15) {
  var v16 = {
    dh4: 355
  };
  var v17 = v2;
  if (/2160p|4k/i.test(v15)) {
    return 4;
  }
  if (/1080p/i.test(v15)) {
    return 3;
  }
  if (/720p/i.test(v15)) {
    return 2;
  }
  if (/480p/i.test(v15)) {
    return 1;
  }
  return 0;
}
function fetchTmdbMeta(v18, v19, v20, v21) {
  var v22 = {
    dh5: 364,
    dh6: 352,
    dh7: 342,
    dh8: 380,
    dh9: 331
  };
  var v23 = {
    dh10: 375,
    dh11: 342
  };
  var v24 = v2;
  if (!v18) {
    return Promise.resolve({
      title: "Unknown",
      year: null,
      episodeTitle: ""
    });
  }
  var v25 = v19 === "tv";
  var v26 = v25 ? "https://api.themoviedb.org/3/tv/" + v18 + "?api_key=" + TMDB_KEY : "https://api.themoviedb.org/3/movie/" + v18 + "?api_key=" + TMDB_KEY;
  return __nvFetch(v26).then(function (v27) {
    return v27.json();
  }).then(function (v28) {
    var v29 = {
      dh12: 358,
      dh13: 369,
      dh14: 328
    };
    var v30 = v24;
    var v31 = v28.title || v28.name || "Unknown";
    var v32 = v28.release_date || v28.first_air_date || "";
    var v33 = v32 ? parseInt(v32.split("-")[0]) : null;
    var v34 = {
      title: v31,
      year: v33,
      episodeTitle: ""
    };
    if (v25 && v20 && v21) {
      var v35 = "https://api.themoviedb.org/3/tv/" + v18 + "/season/" + v20 + "?api_key=" + TMDB_KEY;
      return __nvFetch(v35).then(function (v36) {
        var v37 = v30;
        return v36.json();
      }).then(function (v38) {
        var v39 = v30;
        if (v38 && Array.isArray(v38.episodes)) {
          var v40 = parseInt(v21);
          for (var v41 = 0; v41 < v38.episodes.length; v41++) {
            if (v38.episodes[v41].episode_number === v40) {
              v34.episodeTitle = v38.episodes[v41].name || "";
              break;
            }
          }
        }
        return v34;
      }).catch(function () {
        return v34;
      });
    }
    return v34;
  }).catch(function () {
    return {
      title: "Unknown",
      year: null,
      episodeTitle: ""
    };
  });
}
function formatMoonflixStream(v42, v43, v44, v45) {
  var v46 = {
    dh15: 374,
    dh16: 371,
    dh17: 349
  };
  var v47 = v2;
  var v48 = v42.q || "1080p";
  var v49 = getResolutionEmoji(v48);
  var v50 = qualityRank(v48);
  var v51 = getInvertedSortTag(v50 * 100000 + (100 - v44), 999999);
  var v52 = v51 + "🌙 Moonflix • " + v48 + " • Dual-Audio";
  var v53 = "🎬 " + v45.title + (v45.year ? " (" + v45.year + ")" : "");
  var v54 = null;
  if (v45.isTv && v45.season && v45.episode) {
    v54 = "📋 S" + v45.season + " E" + v45.episode + (v45.episodeTitle ? " - " + v45.episodeTitle : "");
  }
  var v55 = v49 + " | 🗣️ Dual-Audio";
  var v56 = "🛰️ HLS | ⚡ H.264 | 🎧 AAC";
  var v57 = "🌔 Moonflix | 🌐 " + v43 + " | 📥 WEB-DL";
  var v58 = [v53, v54, v55, v56, v57].filter(Boolean).join("\n");
  var v59 = {
    "User-Agent": M_UA,
    Referer: M_PLAYER + "/",
    Origin: M_PLAYER
  };
  return {
    name: v52,
    title: v58,
    size: v58,
    description: v58,
    url: v42.url,
    headers: v59,
    behaviorHints: {
      notWebReady: true,
      proxyHeaders: {
        request: v59
      }
    }
  };
}
function mFetch(v60, v61) {
  var v62 = {
    dh18: 370,
    dh19: 368
  };
  var v63 = v2;
  v61 = v61 || {};
  return __nvFetch(v60, {
    method: v61.method || "GET",
    headers: Object.assign({
      "User-Agent": M_UA
    }, v61.headers || {}),
    body: v61.body
  }).then(function (v64) {
    var v65 = v63;
    return v64.text().then(function (v66) {
      return {
        code: v64.status,
        text: v66
      };
    });
  }).catch(function () {
    return null;
  });
}
function mProbe(v67, v68) {
  var v69 = {
    dh20: 338,
    dh21: 359
  };
  var v70 = v2;
  return mFetch(v67, {
    headers: Object.assign({
      Range: "bytes=0-16384"
    }, v68 || {})
  }).then(function (v71) {
    var v72 = v1;
    if (!v71) {
      return false;
    }
    if (v71.code !== 200 && v71.code !== 206) {
      return false;
    }
    var v73 = v71.text;
    return v73.indexOf("#EXTM3U") === 0 || v73.indexOf("{") !== 0;
  }).catch(function () {
    return false;
  });
}
function mParseStreams(v74, v75) {
  var v76 = {
    dh22: 381,
    dh23: 367,
    dh24: 354,
    dh25: 366,
    dh26: 330
  };
  var v77 = v2;
  var v78 = [];
  var v79 = v74 && Array.isArray(v74.streams) ? v74.streams : [];
  for (var v80 = 0; v80 < v79.length; v80++) {
    var v81 = v79[v80] || {};
    var v82 = v81.url ? String(v81.url) : "";
    if (!v82 || v82.indexOf("http") !== 0) {
      continue;
    }
    var v83 = v81.quality || "Auto";
    v78.push({
      url: v82,
      q: v83,
      extra: v81
    });
  }
  return v78;
}
function mGetStreams(v84, v85, v86, v87) {
  var v88 = {
    dh27: 380
  };
  var v89 = {
    dh28: 333,
    dh29: 376
  };
  var v90 = v2;
  if (!v84) {
    return Promise.resolve([]);
  }
  var v91 = v85 === "tv";
  var v92 = v86 || 1;
  var v93 = v87 || 1;
  var v94 = v91 ? "tv/" + v84 + "/" + v92 + "/" + v93 : "movie/" + v84;
  return fetchTmdbMeta(v84, v85, v92, v93).then(function (v95) {
    var v96 = v90;
    v95.isTv = v91;
    v95.season = v92;
    v95.episode = v93;
    var v97 = Promise.resolve([]);
    M_APIS.forEach(function (v98) {
      var v99 = v96;
      v97 = v97.then(function (v100) {
        var v101 = v99;
        if (v100.length) {
          return v100;
        }
        return mFetch(v98[1] + "/" + v94, {
          headers: M_PLAYER_HEADERS
        }).then(function (v102) {
          var v103 = v101;
          if (!v102 || v102.code !== 200) {
            return v100;
          }
          var v104;
          try {
            v104 = JSON.parse(v102.text);
          } catch (v105) {
            return v100;
          }
          var v106 = mParseStreams(v104, v98[0]);
          var v107 = [];
          var v108 = Promise.resolve();
          v106.forEach(function (v109, v110) {
            var v111 = v103;
            v108 = v108.then(function () {
              return mProbe(v109.url, M_PLAYER_HEADERS).then(function (v112) {
                if (!v112) {
                  return;
                }
                v107.push(formatMoonflixStream(v109, v98[0], v110, v95));
              });
            });
          });
          return v108.then(function () {
            return v100.concat(v107);
          });
        });
      });
    });
    if (v91) {
      v97 = v97.then(function (v113) {
        var v114 = {
          dh30: 380
        };
        var v115 = v96;
        if (v113.length) {
          return v113;
        }
        return mFetch("https://series-production-5c1c.up.railway.app/tv/" + v84 + "/" + v92 + "/" + v93, {
          headers: M_PLAYER_HEADERS
        }).then(function (v116) {
          var v117 = {
            dh31: 330
          };
          var v118 = v115;
          if (!v116 || v116.code !== 200) {
            return v113;
          }
          var v119;
          try {
            v119 = JSON.parse(v116.text);
          } catch (v120) {
            return v113;
          }
          var v121 = v119.sources || [];
          var v122 = [];
          var v123 = Promise.resolve();
          for (var v124 = 0; v124 < v121.length; v124++) {
            (function (v125, v126) {
              var v127 = v118;
              v123 = v123.then(function () {
                var v128 = {
                  dh32: 378
                };
                var v129 = v127;
                var v130 = v125.proxy_url || v125.url || "";
                if (!v130 || v130.indexOf("http") !== 0) {
                  return;
                }
                return mProbe(v130, M_PLAYER_HEADERS).then(function (v131) {
                  var v132 = v129;
                  if (!v131) {
                    return;
                  }
                  var v133 = {
                    url: v130,
                    q: v125.quality || "Auto"
                  };
                  v122.push(formatMoonflixStream(v133, "SE", v126, v95));
                });
              });
            })(v121[v124], v124);
          }
          return v123.then(function () {
            var v134 = v118;
            return v113.concat(v122);
          });
        });
      });
    }
    return v97;
  });
}
function mOnSettings() {
  return [];
}
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    getStreams: mGetStreams,
    scrape: mGetStreams,
    onSettings: mOnSettings
  };
} else if (typeof global !== "undefined") {
  global.getStreams = mGetStreams;
  global.onSettings = mOnSettings;
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
  var PROVIDER = "moonflix";
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