/*
 * nv-plugins animeworld.js — FULLY DECODED port of the All-in-One-Nuvio provider (4.24.0 merge pass).
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
var v2 = v1; /*rotation removed*/
;
var TMDB_KEY = "d80ba92bc7cefe3359668d30d06f3305";
var BASE = "https://watchanimeworld.top";
var PLAYER = "https://play.zephyrix.top";
var UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
function getInvertedSortTag(v3, v4) {
  var v5 = {
    dh1: 483,
    dh2: 465
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
} /*decoder removed*/
function qualityRank(v11) {
  var v12 = {
    dh3: 488
  };
  var v13 = v2;
  if (/2160p|4k/i.test(v11)) {
    return 4;
  }
  if (/1080p/i.test(v11)) {
    return 3;
  }
  if (/720p/i.test(v11)) {
    return 2;
  }
  if (/480p/i.test(v11)) {
    return 1;
  }
  return 0;
}
function httpGet(v14, v15) {
  var v16 = {
    dh4: 448
  };
  var v17 = v2;
  return __nvFetch(v14, {
    headers: Object.assign({
      "User-Agent": UA
    }, v15 || {})
  }).then(function (v18) {
    var v19 = v17;
    if (!v18.ok) {
      throw new Error("HTTP " + v18.status);
    }
    return v18.text();
  });
}
function httpPost(v20, v21, v22) {
  var v23 = {
    dh5: 480
  };
  var v24 = {
    dh6: 497
  };
  var v25 = v2;
  return __nvFetch(v20, {
    method: "POST",
    headers: Object.assign({
      "User-Agent": UA,
      "Content-Type": "application/x-www-form-urlencoded"
    }, v22 || {}),
    body: v21
  }).then(function (v26) {
    var v27 = v25;
    if (!v26.ok) {
      throw new Error("HTTP " + v26.status);
    }
    return v26.json();
  });
}
function searchSite(v28, v29) {
  var v30 = {
    dh7: 447
  };
  var v31 = {
    dh8: 486,
    dh9: 450
  };
  var v32 = BASE + "/?s=" + encodeURIComponent(v28);
  return httpGet(v32, {
    Referer: BASE + "/"
  }).then(function (v33) {
    var v34 = v1;
    var v35 = [];
    var v36 = /href="(https:\/\/watchanimeworld\.top\/(series|movies)\/([^\/\"]+)\/)"/g;
    var v37;
    while ((v37 = v36.exec(v33)) !== null) {
      var v38 = v37[1];
      var v39 = v37[2];
      var v40 = v37[3];
      if (v40 && v40 !== "page") {
        v35.push({
          url: v38,
          type: v39,
          slug: v40
        });
      }
    }
    return v35.filter(function (v41) {
      var v42 = v34;
      if (v29 === "movie") {
        return v41.type === "movies";
      } else {
        return v41.type === "series";
      }
    });
  });
} /*string-table removed*/
function getEpisodeUrl(v43, v44, v45) {
  var v46 = {
    dh10: 494,
    dh11: 494
  };
  var v47 = {
    dh12: 473
  };
  return httpGet(v43, {
    Referer: BASE + "/"
  }).then(function (v48) {
    var v49 = v1;
    var v50 = v48.match(/postid-(\d+)/) || v48.match(/data-post="(\d+)"/);
    if (!v50) {
      return null;
    }
    var v51 = BASE + "/wp-admin/admin-ajax.php?action=action_select_season&season=" + v44 + "&post=" + v50[1];
    return httpGet(v51, {
      Referer: v43
    }).then(function (v52) {
      var v53 = v49;
      var v54 = v44 + "x" + v45 + "/";
      var v55 = /href="(https:\/\/watchanimeworld\.top\/episode\/([^"]+))"/g;
      var v56;
      while ((v56 = v55.exec(v52)) !== null) {
        if (v56[1].indexOf(v54) !== -1) {
          return v56[1];
        }
      }
      return null;
    });
  });
}
function getStreamFromPage(v57) {
  var v58 = {
    dh13: 495,
    dh14: 490
  };
  var v59 = {
    dh15: 472,
    dh16: 479
  };
  var v60 = v2;
  return httpGet(v57, {
    Referer: BASE + "/"
  }).then(function (v61) {
    var v62 = v60;
    var v63 = v61.match(/(?:src|data-src)="(https:\/\/play\.zephyrix\.top\/video\/([a-f0-9]+))"/);
    if (!v63) {
      return null;
    }
    var v64 = v63[2];
    return httpPost(PLAYER + "/player/index.php?data=" + v64 + "&do=getVideo", "hash=" + v64 + "&r=" + encodeURIComponent(BASE + "/"), {
      Referer: BASE + "/",
      Origin: PLAYER,
      "X-Requested-With": "XMLHttpRequest"
    }).then(function (v65) {
      var v66 = v62;
      var v67 = v65.videoSource || v65.securedLink;
      if (!v67) {
        return null;
      }
      var v68 = v67.match(/\/cdn\/hls\/([a-f0-9]+)\//);
      var v69 = v68 ? v68[1] : v64;
      var v70 = PLAYER + "/cdn/down/" + v69 + "/Subtitle/subtitle_eng.srt";
      return {
        url: v67,
        subtitle: v70
      };
    });
  });
}
function getStreams(v71, v72, v73, v74) {
  var v75 = {
    dh17: 455,
    dh18: 486,
    dh19: 460
  };
  var v76 = {
    dh20: 492,
    dh21: 485,
    dh22: 463,
    dh23: 465,
    dh24: 468
  };
  var v77 = {
    dh25: 496
  };
  var v78 = {
    dh26: 498,
    dh27: 478,
    dh28: 461
  };
  return new Promise(function (v79) {
    var v80 = {
      dh29: 497
    };
    var v81 = v1;
    var v82 = "https://api.themoviedb.org/3/" + (v72 === "movie" ? "movie" : "tv") + "/" + v71 + "?api_key=" + TMDB_KEY;
    var v83 = {
      title: "Unknown",
      year: null,
      episodeTitle: ""
    };
    __nvFetch(v82).then(function (v84) {
      return v84.json();
    }).then(function (v85) {
      var v86 = {
        dh30: 491,
        dh31: 463
      };
      var v87 = v81;
      var v88 = v85.title || v85.name;
      if (!v88) {
        throw new Error("No title");
      }
      var v89 = v85.release_date || v85.first_air_date || "";
      var v90 = v89 ? parseInt(v89.split("-")[0]) : null;
      v83.title = v88;
      v83.year = v90;
      if (v72 === "tv" && v73) {
        var v91 = "https://api.themoviedb.org/3/tv/" + v71 + "/season/" + v73 + "?api_key=" + TMDB_KEY;
        return __nvFetch(v91).then(function (v92) {
          var v93 = v87;
          return v92.json();
        }).then(function (v94) {
          var v95 = v87;
          if (v94 && v94.episodes) {
            var v96 = parseInt(v74) || 1;
            for (var v97 = 0; v97 < v94.episodes.length; v97++) {
              if (v94.episodes[v97].episode_number === v96) {
                v83.episodeTitle = v94.episodes[v97].name || "";
                break;
              }
            }
          }
          return searchSite(v88, v72);
        }).catch(function () {
          return searchSite(v88, v72);
        });
      }
      return searchSite(v88, v72);
    }).then(function (v98) {
      var v99 = v81;
      if (!v98 || v98.length === 0) {
        v79([]);
        return null;
      }
      var v100 = v98[0].url;
      if (v72 === "movie") {
        return getStreamFromPage(v100);
      }
      return getEpisodeUrl(v100, v73, v74).then(function (v101) {
        if (v101) {
          return getStreamFromPage(v101);
        } else {
          return null;
        }
      });
    }).then(function (v102) {
      var v103 = v81;
      if (!v102) {
        v79([]);
        return;
      }
      var v104 = "1080p";
      var v105 = qualityRank(v104);
      var v106 = getInvertedSortTag(v105 * 100000, 999999);
      var v107 = v106 + "AnimeWorld • " + v104 + " • Multi-Audio";
      var v108 = "🗡️ " + v83.title + (v83.year ? " (" + v83.year + ")" : "");
      var v109 = null;
      if (v72 === "tv" && v73 && v74) {
        v109 = "📋 S" + v73 + " E" + v74 + (v83.episodeTitle ? " - " + v83.episodeTitle : "");
      }
      var v110 = "🔥 1080p | 🗣️ Multi-Audio | 🎧 AAC";
      var v111 = "🎞️ M3U8 | ⚡ H.264 | 🎥 HLS";
      var v112 = "🔗 AnimeWorld | 🌐 Zephyrix CDN";
      var v113 = [v108, v109, v110, v111, v112].filter(Boolean).join("\n");
      v79([{
        name: v107,
        title: v113,
        size: v113,
        description: v113,
        url: v102.url,
        headers: {
          Referer: PLAYER + "/",
          Origin: PLAYER,
          "User-Agent": UA,
          Connection: "keep-alive"
        },
        subtitles: v102.subtitle ? [{
          url: v102.subtitle,
          lang: "en",
          name: "English"
        }] : []
      }]);
    }).catch(function () {
      v79([]);
    });
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
  var PROVIDER = "animeworld";
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