/*
 * nv-plugins anikototv.js — FULLY DECODED port of the All-in-One-Nuvio provider (4.24.0 merge pass).
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
  return new Promise((v6, v7) => {
    const v8 = {
      dh1: 354
    };
    const v9 = v1;
    var v10 = v11 => {
      const v12 = v1;
      try {
        v13(v5.next(v11));
      } catch (v14) {
        v7(v14);
      }
    };
    var v15 = v16 => {
      const v17 = v1;
      try {
        v13(v5.throw(v16));
      } catch (v18) {
        v7(v18);
      }
    };
    var v13 = v19 => v19.done ? v6(v19.value) : Promise.resolve(v19.value).then(v10, v15);
    v13((v5 = v5.apply(v3, v4)).next());
  });
};
var PROVIDER_NAME = "AnikotoTV";
var TMDB_API_KEY = "439c478a771f35c05022f9feabcca01c";
var TVDB_API_KEY = "777140fb-de92-440a-aec2-95eb51e2d7ab";
var MOBILE_UAS = ["Mozilla/5.0 (Linux; Android 14; Pixel 8 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36", "Mozilla/5.0 (Linux; Android 13; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36", "Mozilla/5.0 (Linux; Android 12; Pixel 6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Mobile Safari/537.36", "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"];
/*string-table removed*/
function getHeaders(v20) {
  const v21 = v2;
  var v22 = MOBILE_UAS[Math.floor(Math.random() * MOBILE_UAS.length)];
  var v23 = {
    "User-Agent": v22,
    "Accept-Language": "en-US,en;q=0.9"
  };
  if (v20) {
    for (var v24 in v20) {
      v23[v24] = v20[v24];
    }
  }
  return v23;
}
var _tvdbToken = null;
function getTvdbToken() {
  const v25 = {
    dh2: 339,
    dh3: 342,
    dh4: 324
  };
  return __async(this, null, function* () {
    const v26 = v1;
    if (_tvdbToken) {
      return _tvdbToken;
    }
    try {
      var v27 = yield __nvFetch("https://api4.thetvdb.com/v4/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          apikey: TVDB_API_KEY
        })
      });
      if (v27.ok) {
        var v28 = yield v27.json();
        if (v28 && v28.data && v28.data.token) {
          _tvdbToken = v28.data.token;
        }
      }
    } catch (v29) {}
    return _tvdbToken;
  });
}
function getTMDBDetails(v30, v31, v32, v33) {
  const v34 = {
    dh5: 391,
    dh6: 359,
    dh7: 376,
    dh8: 314,
    dh9: 399,
    dh10: 398,
    dh11: 340,
    dh12: 328,
    dh13: 399,
    dh14: 326,
    dh15: 411,
    dh16: 405
  };
  return __async(this, null, function* () {
    const v35 = v1;
    var v36;
    var v37;
    const v38 = v31 === "tv" || v31 === "series" ? "tv" : "movie";
    let v39 = "https://api.themoviedb.org/3/" + v38 + "/" + v30 + "?api_key=" + TMDB_API_KEY + "&append_to_response=external_ids";
    if (String(v30).startsWith("tt")) {
      v39 = "https://api.themoviedb.org/3/find/" + v30 + "?external_source=imdb_id&api_key=" + TMDB_API_KEY;
    }
    try {
      const v40 = yield __nvFetch(v39, {
        headers: getHeaders()
      });
      if (!v40.ok) {
        return {
          title: "Anime Title",
          year: "2026",
          epTitle: "Episode " + v33,
          duration: "24 min"
        };
      }
      const v41 = yield v40.json();
      let v42 = v41;
      if (String(v30).startsWith("tt")) {
        v42 = v38 === "tv" ? (v36 = v41.tv_results) == null ? undefined : v36[0] : (v37 = v41.movie_results) == null ? undefined : v37[0];
      }
      if (!v42) {
        return {
          title: "Anime Title",
          year: "2026",
          epTitle: "Episode " + v33,
          duration: "24 min"
        };
      }
      const v43 = v38 === "tv" ? v42.name : v42.title;
      const v44 = v42.release_date || v42.first_air_date || "";
      const v45 = v44 ? v44.split("-")[0] : "2026";
      let v46 = "Episode " + v33;
      let v47 = "24 min";
      if (v38 === "tv" && v42.id && v32 && v33) {
        try {
          const v48 = "https://api.themoviedb.org/3/tv/" + v42.id + "/season/" + v32 + "/episode/" + v33 + "?api_key=" + TMDB_API_KEY;
          const v49 = yield __nvFetch(v48, {
            headers: getHeaders()
          });
          if (v49.ok) {
            const v50 = yield v49.json();
            if (v50.name) {
              v46 = v50.name;
            }
            if (v50.runtime) {
              v47 = v50.runtime + " min";
            }
          }
        } catch (v51) {}
      } else if (v38 === "movie" && v42.runtime) {
        v47 = v42.runtime + " min";
      }
      return {
        title: v43,
        year: v45,
        epTitle: v46,
        duration: v47
      };
    } catch (v52) {
      return {
        title: "Anime Title",
        year: "2026",
        epTitle: "Episode " + v33,
        duration: "24 min"
      };
    }
  });
}
function getTMDBTitle(v53, v54) {
  return __async(this, null, function* () {
    const v55 = yield getTMDBDetails(v53, v54);
    return {
      title: v55.title,
      numericId: v53
    };
  });
}
function getTMDBSeasonName(v56, v57) {
  const v58 = {
    dh17: 326,
    dh18: 359
  };
  return __async(this, null, function* () {
    const v59 = v1;
    const v60 = "https://api.themoviedb.org/3/tv/" + v56 + "/season/" + v57 + "?api_key=" + TMDB_API_KEY;
    try {
      const v61 = yield __nvFetch(v60);
      if (v61.ok) {
        const v62 = yield v61.json();
        return v62.name;
      }
    } catch (v63) {}
    return null;
  });
}
function aniListBridge(v64) {
  const v65 = {
    dh19: 327
  };
  return __async(this, null, function* () {
    const v66 = v1;
    const v67 = " query ($search: String) { Media (search: $search, type: ANIME) { id idMal } } ";
    try {
      const v68 = yield __nvFetch("https://graphql.anilist.co", {
        method: "POST",
        headers: Object.assign(getHeaders(), {
          "Content-Type": "application/json",
          Accept: "application/json"
        }),
        body: JSON.stringify({
          query: v67,
          variables: {
            search: v64
          }
        })
      });
      const v69 = yield v68.json();
      if (v69 && v69.data && v69.data.Media) {
        return {
          malId: v69.data.Media.idMal,
          aniId: v69.data.Media.id,
          absEp: null
        };
      }
    } catch (v70) {}
    return null;
  });
}
function getMalId(v71, v72, v73, v74) {
  const v75 = {
    dh20: 397,
    dh21: 360,
    dh22: 412
  };
  return __async(this, null, function* () {
    const v76 = v1;
    try {
      let v77 = "https://arm.haglund.dev/api/v2/tmdb?id=" + v71;
      if (v72 === "tv" || v72 === "series") {
        v77 += "&s=" + v73 + "&e=" + v74;
      }
      const v78 = yield __nvFetch(v77);
      if (v78.ok) {
        const v79 = yield v78.json();
        if (v79.mal || v79.mal_id || v79.anilist || v79.ani_id) {
          return {
            malId: v79.mal || v79.mal_id,
            aniId: v79.anilist || v79.ani_id,
            absEp: v79.episode || v74
          };
        }
      }
    } catch (v80) {}
    const v81 = yield getTMDBTitle(v71, v72);
    let v82 = v81.title;
    const v83 = v81.numericId;
    if (v82) {
      let v84 = v82;
      if ((v72 === "tv" || v72 === "series") && v73 > 1 && v83) {
        const v85 = yield getTMDBSeasonName(v83, v73);
        if (v85) {
          if (v85.toLowerCase().includes(v82.toLowerCase())) {
            v82 = v85;
          } else {
            v82 = v82 + " " + v85;
          }
        } else {
          v82 = v82 + " Season " + v73;
        }
      }
      let v86 = yield aniListBridge(v82);
      let v87 = false;
      if ((!v86 || v86 && !v86.malId) && v82 !== v84) {
        v86 = yield aniListBridge(v84);
        v87 = true;
      }
      if (v86) {
        v86.absEp = v74;
        v86.usedFallback = v87;
        v86.name = v81.title;
        return v86;
      }
    }
    return null;
  });
}
function extractHLS(v88, v89) {
  const v90 = {
    dh23: 374,
    dh24: 349,
    dh25: 345,
    dh26: 401,
    dh27: 390
  };
  return __async(this, null, function* () {
    const v91 = v1;
    try {
      const v92 = Object.assign(getHeaders(), {
        Referer: "https://" + v89 + "/"
      });
      const v93 = yield __nvFetch(v88, {
        headers: v92
      });
      if (!v93.ok) {
        return null;
      }
      const v94 = yield v93.text();
      let v95 = v94.match(/data-id="(\d+)"/);
      if (!v95) {
        const v96 = v94.match(/<iframe[^>]*src="([^"]+)"/);
        if (v96) {
          const v97 = v96[1].startsWith("http") ? v96[1] : "https://" + v89 + v96[1];
          const v98 = yield __nvFetch(v97, {
            headers: v92
          });
          if (v98.ok) {
            const v99 = yield v98.text();
            v95 = v99.match(/data-id="(\d+)"/);
          }
        }
      }
      if (!v95) {
        return null;
      }
      const v100 = v95[1];
      const v101 = "https://" + v89 + "/stream/getSources?id=" + v100;
      const v102 = yield __nvFetch(v101, {
        headers: Object.assign(getHeaders(), {
          "X-Requested-With": "XMLHttpRequest",
          Referer: v88
        })
      });
      if (!v102.ok) {
        return null;
      }
      const v103 = yield v102.json();
      if (v103.sources && v103.sources.file) {
        const v104 = [];
        if (v103.tracks) {
          for (const v105 of v103.tracks) {
            if (v105.kind === "captions" || v105.kind === "subtitles") {
              v104.push({
                id: v105.label || v105.file || "Unknown",
                url: v105.file,
                language: "eng"
              });
            }
          }
        }
        var v106 = "1080p";
        try {
          const v107 = yield __nvFetch(v103.sources.file, {
            headers: {
              Referer: "https://" + v89 + "/"
            }
          });
          if (v107.ok) {
            const v108 = yield v107.text();
            var v109 = v108.match(/RESOLUTION=\d+x(\d+)/);
            if (v109) {
              v106 = v109[1] + "p";
            }
          }
        } catch (v110) {}
        return {
          url: v103.sources.file,
          quality: v106,
          subtitles: v104,
          headers: {
            Referer: "https://" + v89 + "/",
            Origin: "https://" + v89
          }
        };
      }
    } catch (v111) {}
    return null;
  });
}
function fetchJson(v112) {
  return __async(this, arguments, function* (v113, v114 = {}) {
    const v115 = yield __nvFetch(v113, v114);
    if (!v115.ok) {
      return null;
    }
    return yield v115.json();
  });
}
function getAbsoluteEpisode(v116, v117, v118, v119, v120) {
  const v121 = {
    dh28: 411,
    dh29: 324,
    dh30: 324,
    dh31: 394,
    dh32: 384,
    dh33: 382
  };
  return __async(this, null, function* () {
    const v122 = v1;
    if (v117 === "movie") {
      return 1;
    }
    let v123 = v119;
    let v124 = null;
    let v125 = null;
    try {
      const v126 = yield fetchJson("https://api.themoviedb.org/3/tv/" + v116 + "/external_ids?api_key=" + TMDB_API_KEY);
      if (v126) {
        v124 = v126.imdb_id;
        v125 = v126.tvdb_id;
      }
    } catch (v127) {}
    if (!v125 && v120) {
      try {
        const v128 = yield getTvdbToken();
        if (v128) {
          const v129 = yield fetchJson("https://api4.thetvdb.com/v4/search?query=" + encodeURIComponent(v120), {
            headers: {
              Authorization: "Bearer " + v128
            }
          });
          if (v129 && v129.data) {
            const v130 = v129.data.find(v131 => v131.type === "series");
            if (v130) {
              const v132 = v130.id || v130.tvdb_id;
              if (v132) {
                v125 = parseInt(String(v132).replace(/^series-/, ""), 10);
              }
            }
          }
        }
      } catch (v133) {}
    }
    if (v125) {
      try {
        const v134 = yield getTvdbToken();
        if (v134) {
          const v135 = yield fetchJson("https://api4.thetvdb.com/v4/series/" + v125 + "/episodes/default?season=" + v118, {
            headers: {
              Authorization: "Bearer " + v134
            }
          });
          if (v135 && v135.data && v135.data.episodes) {
            const v136 = v135.data.episodes.find(v137 => v137.seasonNumber == v118 && v137.number == v119);
            if (v136 && v136.absoluteNumber) {
              return v136.absoluteNumber;
            }
          }
        }
      } catch (v138) {}
    }
    if (v124) {
      try {
        const v139 = "https://aiometadata.elfhosted.com/stremio/80d082c4-6e99-4c97-a67d-3d9e242685ce/meta/series/" + v124 + ".json";
        const v140 = yield __nvFetch(v139);
        if (v140.ok) {
          const v141 = yield v140.text();
          let v142 = 0;
          let v143 = false;
          const v144 = /"season"\s*:\s*(\d+)/g;
          let v145;
          while ((v145 = v144.exec(v141)) !== null) {
            v143 = true;
            const v146 = parseInt(v145[1]);
            if (v146 > 0 && v146 < v118) {
              v142++;
            }
          }
          if (v143) {
            return v142 + v119;
          }
        }
      } catch (v147) {}
    }
    try {
      const v148 = "https://api.themoviedb.org/3/tv/" + v116 + "?api_key=" + TMDB_API_KEY;
      const v149 = yield fetchJson(v148, {});
      if (v149 && v149.seasons) {
        let v150 = 0;
        const v151 = v149.seasons.filter(v152 => v152.season_number > 0 && v152.season_number < v118);
        for (let v153 of v151) {
          v150 += v153.episode_count;
        }
        v150 += v119;
        return v150;
      }
    } catch (v154) {}
    return v123;
  });
}
function getStreams(v155, v156, v157, v158) {
  const v159 = {
    dh34: 338,
    dh35: 387,
    dh36: 335,
    dh37: 325,
    dh38: 334,
    dh39: 413,
    dh40: 369,
    dh41: 364,
    dh42: 332,
    dh43: 357,
    dh44: 378,
    dh45: 367,
    dh46: 364
  };
  return __async(this, null, function* () {
    const v160 = v1;
    try {
      const v161 = yield getMalId(v155, v156, v157, v158);
      if (!v161 || !v161.malId && !v161.aniId) {
        return [];
      }
      const v162 = !!v161.malId;
      const v163 = v162 ? v161.malId : v161.aniId;
      const v164 = v162 ? "mal" : "ani";
      let v165 = v156 === "movie" ? 1 : v161.absEp;
      if (v156 !== "movie" && v161.usedFallback && v157 > 1) {
        v165 = yield getAbsoluteEpisode(v155, v156, v157, v158, v161.name);
      }
      const v166 = yield getTMDBDetails(v155, v156, v157, v158);
      const v167 = [];
      const v168 = [{
        id: "Vidstream",
        domain: "megaplay.buzz"
      }];
      for (const v169 of v168) {
        const v170 = ["sub", "dub"];
        for (const v171 of v170) {
          const v172 = "https://" + v169.domain + "/stream/" + v164 + "/" + v163 + "/" + v165 + "/" + v171;
          const v173 = yield extractHLS(v172, v169.domain);
          if (v173) {
            const v174 = (v173.quality || "1080p").toLowerCase();
            const v175 = v171 === "sub" ? "🇯🇵 Japanese" : "🇺🇲 English";
            const v176 = v171 === "sub" ? "SUB" : "DUB";
            const v177 = v171 === "sub" ? "Japanese (SUB)" : "English (DUB)";
            const v178 = v173.url.includes(".m3u8") ? "HLS" : "M3U8";
            const v179 = PROVIDER_NAME + " | " + v174 + " | " + v177;
            const v180 = "🎦 " + v166.title + " - (" + v166.year + ")";
            const v181 = v156 === "movie" ? "🎬 Movie Presentation" : "🎬 S" + (v157 || 1) + "E" + (v158 || 1) + " - " + v166.epTitle;
            const v182 = "✨ " + v174 + " | " + v175 + " • 🗣️ " + v176;
            const v183 = "🔗 " + v169.id + " | ⏳ " + v166.duration + " | ⚡ " + v178;
            const v184 = v180 + "\n" + v181 + "\n" + v182 + "\n" + v183;
            v167.push({
              name: v179,
              title: v184,
              size: v184,
              description: v184,
              url: v173.url,
              subtitles: v173.subtitles,
              headers: v173.headers
            });
          }
        }
      }
      return v167;
    } catch (v185) {
      return [];
    }
  });
}
function search(v186) {
  return __async(this, null, function* () {
    return [];
  });
} /*decoder removed*/
function getCatalog(v187) {
  return __async(this, null, function* () {
    return [];
  });
}
function getItemDetails(v188) {
  return __async(this, null, function* () {
    return [];
  });
}
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    getStreams: getStreams,
    search: search,
    getCatalog: getCatalog,
    getItemDetails: getItemDetails
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
  var PROVIDER = "anikototv";
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