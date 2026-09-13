/*
 * nv-plugins movix.js — FULLY DECODED port of the All-in-One-Nuvio provider (4.23.0 best-settings pass).
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
var v2 = v1; /*rotation removed*/
;
var TMDB_KEY = "f3d757824f08ea2cff45eb8f47ca3a1e";
var DOMAINS_URL = "https://raw.githubusercontent.com/wooodyhood/nuvio-repo/main/domains.json";
var MOVIX_FALLBACK = "cash";
var _cachedEndpoint = null;
/*string-table removed*/
function getTmdbMetadata(v3, v4) {
  var v5 = {
    dh1: 143,
    dh2: 158
  };
  var v6 = {
    dh3: 184,
    dh4: 169
  };
  var v7 = v2;
  var v8 = "https://api.themoviedb.org/3/" + (v4 === "tv" ? "tv" : "movie") + "/" + v3 + "?api_key=" + TMDB_KEY + "&language=en-US";
  return __nvFetch(v8).then(function (v9) {
    var v10 = v7;
    return v9.json();
  }).then(function (v11) {
    var v12 = v7;
    var v13 = v11.release_date || v11.first_air_date || "";
    return {
      name: v11.title || v11.name || "Movix",
      year: v13 ? v13.split("-")[0] : "",
      duration: v4 === "movie" && v11.runtime ? v11.runtime + " min" : v4 === "tv" && v11.episode_run_time && v11.episode_run_time.length > 0 ? v11.episode_run_time[0] + " min" : ""
    };
  }).catch(function () {
    var v14 = v7;
    return {
      name: "Movix",
      year: "",
      duration: ""
    };
  });
}
function getEpisodeInfo(v15, v16, v17) {
  var v18 = v2;
  if (!v15 || !v16 || !v17) {
    return Promise.resolve(null);
  }
  var v19 = "https://api.themoviedb.org/3/tv/" + v15 + "/season/" + v16 + "/episode/" + v17 + "?api_key=" + TMDB_KEY + "&language=en-US";
  return __nvFetch(v19).then(function (v20) {
    return v20.json();
  }).then(function (v21) {
    return {
      name: v21.name || null,
      duration: v21.runtime ? v21.runtime + " min" : null
    };
  }).catch(function () {
    return null;
  });
}
function buildTitle(v22, v23, v24, v25, v26, v27, v28, v29, v30) {
  var v31 = {
    dh5: 142,
    dh6: 146,
    dh7: 153,
    dh8: 151,
    dh9: 159,
    dh10: 187,
    dh11: 159,
    dh12: 194,
    dh13: 188,
    dh14: 171,
    dh15: 171,
    dh16: 171
  };
  var v32 = v2;
  var v33 = v23.toLowerCase().replace(/p/g, "") + "p";
  var v34 = "⚡";
  var v35 = "VF";
  var v36 = "🇫🇷";
  var v37 = (String(v24) + " " + String(v23) + " " + String(v27)).toUpperCase();
  if (v37.indexOf("MULTI") !== -1 || v37.indexOf("DUAL") !== -1) {
    v35 = "Dual-Audio";
    v36 = "🇺🇸 • 🇫🇷";
  } else if (v37.indexOf("VOST") !== -1) {
    v35 = "VOSTFR";
    v36 = "🇺🇸 • 🇫🇷";
  }
  var v38 = "🍿 ";
  if (v28 && v29) {
    v38 += "S" + v28 + " E" + v29 + (v30 && v30.name ? " - " + v30.name : "") + " | " + v22.name;
  } else {
    v38 += v22.name + (v22.year ? " - " + v22.year : "");
  }
  var v39 = v34 + " " + v33 + " | 💬 " + v35 + " | 🎵 " + v36;
  var v40 = (v25 || "M3U8").toUpperCase();
  var v41 = "H.264";
  if (v37.indexOf("HEVC") !== -1 || v37.indexOf("X265") !== -1 || v37.indexOf("H265") !== -1) {
    v41 = "H.265";
  }
  var v42 = v30 && v30.duration ? v30.duration : v22.duration;
  var v43 = v42 ? " | " + v42 : "";
  var v44 = "💿 " + v40 + " • " + v41 + " | 🎧 AAC" + v43;
  return v38 + "\n" + v39 + "\n" + v44;
} /*decoder removed*/
function detectApi() {
  var v45 = {
    dh17: 168
  };
  if (_cachedEndpoint) {
    return Promise.resolve(_cachedEndpoint);
  }
  return __nvFetch(DOMAINS_URL).then(function (v46) {
    if (v46.ok) {
      return v46.json();
    } else {
      return Promise.reject();
    }
  }).then(function (v47) {
    var v48 = v1;
    var v49 = v47.movix || MOVIX_FALLBACK;
    _cachedEndpoint = {
      api: "https://api.movix." + v49,
      referer: "https://movix." + v49 + "/"
    };
    return _cachedEndpoint;
  }).catch(function () {
    _cachedEndpoint = {
      api: "https://api.movix." + MOVIX_FALLBACK,
      referer: "https://movix." + MOVIX_FALLBACK + "/"
    };
    return _cachedEndpoint;
  });
}
function resolveRedirect(v50, v51) {
  var v52 = {
    dh18: 154
  };
  var v53 = {
    dh19: 138
  };
  var v54 = v2;
  return __nvFetch(v50, {
    method: "GET",
    redirect: "follow",
    headers: {
      "User-Agent": "Mozilla/5.0",
      Referer: v51
    }
  }).then(function (v55) {
    var v56 = v54;
    return v55.url || v50;
  }).catch(function () {
    return v50;
  });
}
function resolveEmbed(v57, v58) {
  var v59 = {
    dh20: 161
  };
  var v60 = v2;
  return __nvFetch(v57, {
    method: "GET",
    redirect: "follow",
    headers: {
      "User-Agent": "Mozilla/5.0",
      Referer: v58
    }
  }).then(function (v61) {
    return v61.text();
  }).then(function (v62) {
    var v63 = v60;
    var v64 = [/file\s*:\s*["']([^"']+\.m3u8[^"']*)["']/i, /source\s+src=["']([^"']+\.m3u8[^"']*)["']/i, /["']([^"']*\.m3u8(?:\?[^"']*)?)["']/i];
    for (var v65 = 0; v65 < v64.length; v65++) {
      var v66 = v62.match(v64[v65]);
      if (v66) {
        if (v66[1].startsWith("//")) {
          return "https:" + v66[1];
        } else {
          return v66[1];
        }
      }
    }
    return null;
  }).catch(function () {
    return null;
  });
}
function fetchPurstream(v67, v68, v69, v70, v71, v72) {
  var v73 = {
    dh21: 175,
    dh22: 137
  };
  var v74 = v2;
  var v75 = v70 === "tv" ? v67 + "/api/purstream/tv/" + v69 + "/stream?season=" + (v71 || 1) + "&episode=" + (v72 || 1) : v67 + "/api/purstream/movie/" + v69 + "/stream";
  return __nvFetch(v75, {
    headers: {
      Referer: v68
    }
  }).then(function (v76) {
    return v76.json();
  }).then(function (v77) {
    var v78 = v74;
    return v77.sources || [];
  });
}
function fetchCpasmal(v79, v80, v81, v82, v83, v84) {
  var v85 = {
    dh23: 152,
    dh24: 161
  };
  var v86 = {
    dh25: 192
  };
  var v87 = v2;
  var v88 = v82 === "tv" ? v79 + "/api/cpasmal/tv/" + v81 + "/" + (v83 || 1) + "/" + (v84 || 1) : v79 + "/api/cpasmal/movie/" + v81;
  return __nvFetch(v88, {
    headers: {
      Referer: v80
    }
  }).then(function (v89) {
    var v90 = v87;
    return v89.json();
  }).then(function (v91) {
    var v92 = v87;
    var v93 = [];
    ["vf", "vostfr"].forEach(function (v94) {
      var v95 = {
        dh26: 186,
        dh27: 179
      };
      var v96 = v92;
      if (v91.links && v91.links[v94]) {
        v91.links[v94].forEach(function (v97) {
          var v98 = v96;
          v93.push({
            url: v97.url,
            name: "Movix",
            player: v97.server,
            lang: v94
          });
        });
      }
    });
    return v93;
  });
}
function tryFetchAll(v99, v100, v101, v102, v103, v104, v105, v106) {
  var v107 = {
    dh28: 130
  };
  var v108 = v2;
  return fetchPurstream(v99, v100, v101, v102, v103, v104).then(function (v109) {
    var v110 = {
      dh29: 159
    };
    var v111 = v108;
    return Promise.all(v109.map(function (v112) {
      var v113 = v111;
      return resolveRedirect(v112.url, v100).then(function (v114) {
        var v115 = v113;
        var v116 = (v112.name || "").indexOf("1080") !== -1 ? "1080p" : "720p";
        var v117 = (v112.name || "").indexOf("VOST") !== -1 ? "VOSTFR" : (v112.name || "").indexOf("VF") !== -1 ? "VF" : "Dual-Audio";
        var v118 = buildTitle(v105, v116, v117, v112.format || "m3u8", null, null, v103, v104, v106);
        return {
          name: "Movix | " + v116.toLowerCase() + " | " + v117,
          title: v118,
          size: v118,
          description: v118,
          url: v114,
          quality: "",
          language: "",
          format: v112.format || "m3u8",
          headers: {
            "User-Agent": "Mozilla/5.0"
          }
        };
      });
    }));
  }).catch(function () {
    var v119 = {
      dh30: 161
    };
    return fetchCpasmal(v99, v100, v101, v102, v103, v104).then(function (v120) {
      var v121 = {
        dh31: 177
      };
      var v122 = {
        dh32: 128,
        dh33: 182,
        dh34: 185
      };
      var v123 = v1;
      return Promise.all(v120.slice(0, 5).map(function (v124) {
        return resolveEmbed(v124.url, v100).then(function (v125) {
          var v126 = v1;
          if (!v125) {
            return null;
          }
          var v127 = v124.lang && v124.lang.toUpperCase() === "VOSTFR" ? "VOSTFR" : "VF";
          var v128 = buildTitle(v105, "HD", v127, "m3u8", "", v124.player, v103, v104, v106);
          return {
            name: "Movix | hd | " + v127,
            title: v128,
            size: v128,
            description: v128,
            url: v125,
            quality: "",
            language: "",
            format: "m3u8",
            headers: {
              Referer: v100
            }
          };
        });
      })).then(function (v129) {
        var v130 = v123;
        return v129.filter(function (v131) {
          return v131 !== null;
        });
      });
    });
  });
}
function getStreams(v132, v133, v134, v135) {
  var v136 = {
    dh35: 172,
    dh36: 144
  };
  var v137 = v2;
  return Promise.all([getTmdbMetadata(v132, v133), v133 === "tv" ? getEpisodeInfo(v132, v134, v135) : Promise.resolve(null), detectApi()]).then(function (v138) {
    var v139 = v137;
    var v140 = v138[0];
    var v141 = v138[1];
    var v142 = v138[2];
    return tryFetchAll(v142.api, v142.referer, v132, v133, v134, v135, v140, v141);
  }).catch(function () {
    return [];
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
  var PROVIDER = "movix";
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