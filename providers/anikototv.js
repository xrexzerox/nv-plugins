/*
 * nv-plugins anikototv.js — rebased on the CURRENT All-in-One-Nuvio upstream file (4.26.0 sync pass).
 * Upstream version: 1.0.5. Decoded + identifier-normalized, zero obfuscator remnants.
 * nv tail re-attached: fail-open quality gate (4.26.0), en/tl language gate, cross-provider dedupe.
 */
var __async = (v1, v2, v3) => {
  return new Promise((v4, v5) => {
    var v6 = v7 => {
      try {
        v8(v3.next(v7));
      } catch (v9) {
        v5(v9);
      }
    };
    var v10 = v11 => {
      try {
        v8(v3.throw(v11));
      } catch (v12) {
        v5(v12);
      }
    };
    var v8 = v13 => v13.done ? v4(v13.value) : Promise.resolve(v13.value).then(v6, v10);
    v8((v3 = v3.apply(v1, v2)).next());
  });
};
var PROVIDER_NAME = "AnikotoTV";
var TMDB_API_KEY = "439c478a771f35c05022f9feabcca01c";
var TVDB_API_KEY = "777140fb-de92-440a-aec2-95eb51e2d7ab";
var MOBILE_UAS = ["Mozilla/5.0 (Linux; Android 14; Pixel 8 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36", "Mozilla/5.0 (Linux; Android 13; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36", "Mozilla/5.0 (Linux; Android 12; Pixel 6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Mobile Safari/537.36", "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"];
function getHeaders(v14) {
  var v15 = MOBILE_UAS[Math.floor(Math.random() * MOBILE_UAS.length)];
  var v16 = {
    "User-Agent": v15,
    "Accept-Language": "en-US,en;q=0.9"
  };
  if (v14) {
    for (var v17 in v14) {
      v16[v17] = v14[v17];
    }
  }
  return v16;
}
var _tvdbToken = null;
function getTvdbToken() {
  return __async(this, null, function* () {
    if (_tvdbToken) {
      return _tvdbToken;
    }
    try {
      var v18 = yield fetch("https://api4.thetvdb.com/v4/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          apikey: TVDB_API_KEY
        })
      });
      if (v18.ok) {
        var v19 = yield v18.json();
        if (v19 && v19.data && v19.data.token) {
          _tvdbToken = v19.data.token;
        }
      }
    } catch (v20) {}
    return _tvdbToken;
  });
}
function getTMDBDetails(v21, v22, v23, v24) {
  return __async(this, null, function* () {
    var v25;
    var v26;
    const v27 = v22 === "tv" || v22 === "series" ? "tv" : "movie";
    let v28 = "https://api.themoviedb.org/3/" + v27 + "/" + v21 + "?api_key=" + TMDB_API_KEY + "&append_to_response=external_ids";
    if (String(v21).startsWith("tt")) {
      v28 = "https://api.themoviedb.org/3/find/" + v21 + "?external_source=imdb_id&api_key=" + TMDB_API_KEY;
    }
    try {
      const v29 = yield fetch(v28, {
        headers: getHeaders()
      });
      if (!v29.ok) {
        return {
          title: "Anime Title",
          year: "2026",
          epTitle: "Episode " + v24,
          duration: "24 min"
        };
      }
      const v30 = yield v29.json();
      let v31 = v30;
      if (String(v21).startsWith("tt")) {
        v31 = v27 === "tv" ? (v25 = v30.tv_results) == null ? undefined : v25[0] : (v26 = v30.movie_results) == null ? undefined : v26[0];
      }
      if (!v31) {
        return {
          title: "Anime Title",
          year: "2026",
          epTitle: "Episode " + v24,
          duration: "24 min"
        };
      }
      const v32 = v27 === "tv" ? v31.name : v31.title;
      const v33 = v31.release_date || v31.first_air_date || "";
      const v34 = v33 ? v33.split("-")[0] : "2026";
      let v35 = "Episode " + v24;
      let v36 = "24 min";
      if (v27 === "tv" && v31.id && v23 && v24) {
        try {
          const v37 = "https://api.themoviedb.org/3/tv/" + v31.id + "/season/" + v23 + "/episode/" + v24 + "?api_key=" + TMDB_API_KEY;
          const v38 = yield fetch(v37, {
            headers: getHeaders()
          });
          if (v38.ok) {
            const v39 = yield v38.json();
            if (v39.name) {
              v35 = v39.name;
            }
            if (v39.runtime) {
              v36 = v39.runtime + " min";
            }
          }
        } catch (v40) {}
      } else if (v27 === "movie" && v31.runtime) {
        v36 = v31.runtime + " min";
      }
      return {
        title: v32,
        year: v34,
        epTitle: v35,
        duration: v36
      };
    } catch (v41) {
      return {
        title: "Anime Title",
        year: "2026",
        epTitle: "Episode " + v24,
        duration: "24 min"
      };
    }
  });
}
function getTMDBTitle(v42, v43) {
  return __async(this, null, function* () {
    const v44 = yield getTMDBDetails(v42, v43);
    return {
      title: v44.title,
      numericId: v42
    };
  });
}
function getTMDBSeasonName(v45, v46) {
  return __async(this, null, function* () {
    const v47 = "https://api.themoviedb.org/3/tv/" + v45 + "/season/" + v46 + "?api_key=" + TMDB_API_KEY;
    try {
      const v48 = yield fetch(v47);
      if (v48.ok) {
        const v49 = yield v48.json();
        return v49.name;
      }
    } catch (v50) {}
    return null;
  });
}
function aniListBridge(v51) {
  return __async(this, null, function* () {
    const v52 = " query ($search: String) { Media (search: $search, type: ANIME) { id idMal } } ";
    try {
      const v53 = yield fetch("https://graphql.anilist.co", {
        method: "POST",
        headers: Object.assign(getHeaders(), {
          "Content-Type": "application/json",
          Accept: "application/json"
        }),
        body: JSON.stringify({
          query: v52,
          variables: {
            search: v51
          }
        })
      });
      const v54 = yield v53.json();
      if (v54 && v54.data && v54.data.Media) {
        return {
          malId: v54.data.Media.idMal,
          aniId: v54.data.Media.id,
          absEp: null
        };
      }
    } catch (v55) {}
    return null;
  });
}
function getMalId(v56, v57, v58, v59) {
  return __async(this, null, function* () {
    try {
      let v60 = "https://arm.haglund.dev/api/v2/tmdb?id=" + v56;
      if (v57 === "tv" || v57 === "series") {
        v60 += "&s=" + v58 + "&e=" + v59;
      }
      const v61 = yield fetch(v60);
      if (v61.ok) {
        const v62 = yield v61.json();
        if (v62.mal || v62.mal_id || v62.anilist || v62.ani_id) {
          return {
            malId: v62.mal || v62.mal_id,
            aniId: v62.anilist || v62.ani_id,
            absEp: v62.episode || v59
          };
        }
      }
    } catch (v63) {}
    const v64 = yield getTMDBTitle(v56, v57);
    let v65 = v64.title;
    const v66 = v64.numericId;
    if (v65) {
      let v67 = v65;
      if ((v57 === "tv" || v57 === "series") && v58 > 1 && v66) {
        const v68 = yield getTMDBSeasonName(v66, v58);
        if (v68) {
          if (v68.toLowerCase().includes(v65.toLowerCase())) {
            v65 = v68;
          } else {
            v65 = v65 + " " + v68;
          }
        } else {
          v65 = v65 + " Season " + v58;
        }
      }
      let v69 = yield aniListBridge(v65);
      let v70 = false;
      if ((!v69 || v69 && !v69.malId) && v65 !== v67) {
        v69 = yield aniListBridge(v67);
        v70 = true;
      }
      if (v69) {
        v69.absEp = v59;
        v69.usedFallback = v70;
        v69.name = v64.title;
        return v69;
      }
    }
    return null;
  });
}
function extractHLS(v71, v72) {
  return __async(this, null, function* () {
    try {
      const v73 = Object.assign(getHeaders(), {
        Referer: "https://" + v72 + "/"
      });
      const v74 = yield fetch(v71, {
        headers: v73
      });
      if (!v74.ok) {
        return null;
      }
      const v75 = yield v74.text();
      let v76 = v75.match(/data-id="(\d+)"/);
      if (!v76) {
        const v77 = v75.match(/<iframe[^>]*src="([^"]+)"/);
        if (v77) {
          const v78 = v77[1].startsWith("http") ? v77[1] : "https://" + v72 + v77[1];
          const v79 = yield fetch(v78, {
            headers: v73
          });
          if (v79.ok) {
            const v80 = yield v79.text();
            v76 = v80.match(/data-id="(\d+)"/);
          }
        }
      }
      if (!v76) {
        return null;
      }
      const v81 = v76[1];
      const v82 = "https://" + v72 + "/stream/getSources?id=" + v81;
      const v83 = yield fetch(v82, {
        headers: Object.assign(getHeaders(), {
          "X-Requested-With": "XMLHttpRequest",
          Referer: v71
        })
      });
      if (!v83.ok) {
        return null;
      }
      const v84 = yield v83.json();
      if (v84.sources && v84.sources.file) {
        const v85 = [];
        if (v84.tracks) {
          for (const v86 of v84.tracks) {
            if (v86.kind === "captions" || v86.kind === "subtitles") {
              v85.push({
                id: v86.label || v86.file || "Unknown",
                url: v86.file,
                language: "eng"
              });
            }
          }
        }
        var v87 = "1080p";
        try {
          const v88 = yield fetch(v84.sources.file, {
            headers: {
              Referer: "https://" + v72 + "/"
            }
          });
          if (v88.ok) {
            const v89 = yield v88.text();
            var v90 = v89.match(/RESOLUTION=\d+x(\d+)/);
            if (v90) {
              v87 = v90[1] + "p";
            }
          }
        } catch (v91) {}
        return {
          url: v84.sources.file,
          quality: v87,
          subtitles: v85,
          headers: {
            Referer: "https://" + v72 + "/",
            Origin: "https://" + v72
          }
        };
      }
    } catch (v92) {}
    return null;
  });
}
function fetchJson(v93) {
  return __async(this, arguments, function* (v94, v95 = {}) {
    const v96 = yield fetch(v94, v95);
    if (!v96.ok) {
      return null;
    }
    return yield v96.json();
  });
}
function getAbsoluteEpisode(v97, v98, v99, v100, v101) {
  return __async(this, null, function* () {
    if (v98 === "movie") {
      return 1;
    }
    let v102 = v100;
    let v103 = null;
    let v104 = null;
    try {
      const v105 = yield fetchJson("https://api.themoviedb.org/3/tv/" + v97 + "/external_ids?api_key=" + TMDB_API_KEY);
      if (v105) {
        v103 = v105.imdb_id;
        v104 = v105.tvdb_id;
      }
    } catch (v106) {}
    if (!v104 && v101) {
      try {
        const v107 = yield getTvdbToken();
        if (v107) {
          const v108 = yield fetchJson("https://api4.thetvdb.com/v4/search?query=" + encodeURIComponent(v101), {
            headers: {
              Authorization: "Bearer " + v107
            }
          });
          if (v108 && v108.data) {
            const v109 = v108.data.find(v110 => v110.type === "series");
            if (v109) {
              const v111 = v109.id || v109.tvdb_id;
              if (v111) {
                v104 = parseInt(String(v111).replace(/^series-/, ""), 10);
              }
            }
          }
        }
      } catch (v112) {}
    }
    if (v104) {
      try {
        const v113 = yield getTvdbToken();
        if (v113) {
          const v114 = yield fetchJson("https://api4.thetvdb.com/v4/series/" + v104 + "/episodes/default?season=" + v99, {
            headers: {
              Authorization: "Bearer " + v113
            }
          });
          if (v114 && v114.data && v114.data.episodes) {
            const v115 = v114.data.episodes.find(v116 => v116.seasonNumber == v99 && v116.number == v100);
            if (v115 && v115.absoluteNumber) {
              return v115.absoluteNumber;
            }
          }
        }
      } catch (v117) {}
    }
    if (v103) {
      try {
        const v118 = "https://aiometadata.elfhosted.com/stremio/80d082c4-6e99-4c97-a67d-3d9e242685ce/meta/series/" + v103 + ".json";
        const v119 = yield fetch(v118);
        if (v119.ok) {
          const v120 = yield v119.text();
          let v121 = 0;
          let v122 = false;
          const v123 = /"season"\s*:\s*(\d+)/g;
          let v124;
          while ((v124 = v123.exec(v120)) !== null) {
            v122 = true;
            const v125 = parseInt(v124[1]);
            if (v125 > 0 && v125 < v99) {
              v121++;
            }
          }
          if (v122) {
            return v121 + v100;
          }
        }
      } catch (v126) {}
    }
    try {
      const v127 = "https://api.themoviedb.org/3/tv/" + v97 + "?api_key=" + TMDB_API_KEY;
      const v128 = yield fetchJson(v127, {});
      if (v128 && v128.seasons) {
        let v129 = 0;
        const v130 = v128.seasons.filter(v131 => v131.season_number > 0 && v131.season_number < v99);
        for (let v132 of v130) {
          v129 += v132.episode_count;
        }
        v129 += v100;
        return v129;
      }
    } catch (v133) {}
    return v102;
  });
}
function getStreams(v134, v135, v136, v137) {
  return __async(this, null, function* () {
    try {
      const v138 = yield getMalId(v134, v135, v136, v137);
      if (!v138 || !v138.malId && !v138.aniId) {
        return [];
      }
      const v139 = !!v138.malId;
      const v140 = v139 ? v138.malId : v138.aniId;
      const v141 = v139 ? "mal" : "ani";
      let v142 = v135 === "movie" ? 1 : v138.absEp;
      if (v135 !== "movie" && v138.usedFallback && v136 > 1) {
        v142 = yield getAbsoluteEpisode(v134, v135, v136, v137, v138.name);
      }
      const v143 = yield getTMDBDetails(v134, v135, v136, v137);
      const v144 = [];
      const v145 = [{
        id: "Vidstream",
        domain: "megaplay.buzz"
      }];
      for (const v146 of v145) {
        const v147 = ["sub", "dub"];
        for (const v148 of v147) {
          const v149 = "https://" + v146.domain + "/stream/" + v141 + "/" + v140 + "/" + v142 + "/" + v148;
          const v150 = yield extractHLS(v149, v146.domain);
          if (v150) {
            const v151 = (v150.quality || "1080p").toLowerCase();
            const v152 = v148 === "sub" ? "🇯🇵 Japanese" : "🇺🇲 English";
            const v153 = v148 === "sub" ? "SUB" : "DUB";
            const v154 = v148 === "sub" ? "Japanese (SUB)" : "English (DUB)";
            const v155 = v150.url.includes(".m3u8") ? "HLS" : "M3U8";
            const v156 = PROVIDER_NAME + " | " + v151 + " | " + v154;
            const v157 = "🎦 " + v143.title + " - (" + v143.year + ")";
            const v158 = v135 === "movie" ? "🎬 Movie Presentation" : "🎬 S" + (v136 || 1) + "E" + (v137 || 1) + " - " + v143.epTitle;
            const v159 = "✨ " + v151 + " | " + v152 + " • 🗣️ " + v153;
            const v160 = "🔗 " + v146.id + " | ⏳ " + v143.duration + " | ⚡ " + v155;
            const v161 = v157 + "\n" + v158 + "\n" + v159 + "\n" + v160;
            v144.push({
              name: v156,
              title: v161,
              size: v161,
              description: v161,
              url: v150.url,
              subtitles: v150.subtitles,
              headers: v150.headers
            });
          }
        }
      }
      return v144;
    } catch (v162) {
      return [];
    }
  });
}
function search(v163) {
  return __async(this, null, function* () {
    return [];
  });
}
function getCatalog(v164) {
  return __async(this, null, function* () {
    return [];
  });
}
function getItemDetails(v165) {
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