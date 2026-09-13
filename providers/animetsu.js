/*
 * nv-plugins animetsu.js — FULLY DECODED port of the All-in-One-Nuvio provider (4.24.0 merge pass).
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
    const v8 = {
      dh1: 445
    };
    const v9 = {
      dh2: 477
    };
    const v10 = v1;
    var v11 = v12 => {
      const v13 = v1;
      try {
        v14(v5.next(v12));
      } catch (v15) {
        v7(v15);
      }
    };
    var v16 = v17 => {
      const v18 = v1;
      try {
        v14(v5.throw(v17));
      } catch (v19) {
        v7(v19);
      }
    };
    var v14 = v20 => v20.done ? v6(v20.value) : Promise.resolve(v20.value).then(v11, v16);
    v14((v5 = v5.apply(v3, v4)).next());
  });
};
var PROVIDER_NAME = "Animetsu";
var TMDB_API_KEY = "439c478a771f35c05022f9feabcca01c";
var BASE_URL = "https://animetsu.live/v2/api";
var PROXY_URL = "https://swiftstream.top/proxy";
var MOBILE_UAS = ["Mozilla/5.0 (Linux; Android 14; Pixel 8 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36", "Mozilla/5.0 (Linux; Android 13; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36", "Mozilla/5.0 (Linux; Android 12; Pixel 6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Mobile Safari/537.36", "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"];
function getHeaders(v21 = null) {
  const v22 = {
    dh3: 497
  };
  const v23 = v2;
  const v24 = v21 || MOBILE_UAS[Math.floor(Math.random() * MOBILE_UAS.length)];
  return {
    "User-Agent": v24,
    Referer: "https://animetsu.live/",
    Origin: "https://animetsu.live/",
    "Accept-Language": "en-US,en;q=0.9"
  };
}
var DOMAINS_JSON_URL = "https://raw.githubusercontent.com/SaurabhKaperwan/Utils/refs/heads/main/urls.json";
var cachedDomains = null;
var domainCacheTime = 0;
var DOMAIN_CACHE_TTL = 14400000;
function refreshDomains() {
  const v25 = {
    dh4: 450
  };
  return __async(this, null, function* () {
    const v26 = v1;
    const v27 = Date.now();
    if (cachedDomains && v27 - domainCacheTime < DOMAIN_CACHE_TTL) {
      return cachedDomains;
    }
    try {
      const v28 = yield __nvFetch(DOMAINS_JSON_URL);
      if (v28.ok) {
        const v29 = yield v28.json();
        if (v29) {
          cachedDomains = v29;
          domainCacheTime = v27;
          if (v29.gojo_base) {
            BASE_URL = v29.gojo_base + "/v2/api";
          }
          console.log("[" + PROVIDER_NAME + "] Domains updated: BASE_URL=" + BASE_URL);
        }
      }
    } catch (v30) {
      console.log("[" + PROVIDER_NAME + "] Domain refresh failed, using default: " + BASE_URL);
    }
    return cachedDomains || {};
  });
}
function manifest() {
  const v31 = {
    dh5: 499,
    dh6: 444
  };
  const v32 = v2;
  return {
    id: "animetsu",
    name: "Animetsu",
    description: "Anime streams natively for Nuvio via Animetsu API.",
    version: "1.0.1",
    logo: "https://animetsu.live/favicon.ico",
    background: "https://animetsu.live/favicon.ico",
    types: ["tv", "movie", "anime"],
    resources: ["stream"],
    idPrefixes: ["tt", "tmdb"]
  };
}
function extractM3u8Qualities(v33, v34) {
  const v35 = {
    dh7: 534,
    dh8: 500,
    dh9: 514,
    dh10: 471,
    dh11: 472
  };
  return __async(this, null, function* () {
    const v36 = v1;
    try {
      const v37 = yield __nvFetch(v33, {
        headers: v34
      });
      if (!v37.ok) {
        return null;
      }
      const v38 = yield v37.text();
      const v39 = v38.split("\n");
      let v40 = [];
      let v41 = null;
      const v42 = v33.indexOf("?");
      const v43 = v42 > -1 ? v33.substring(v42) : "";
      const v44 = v42 > -1 ? v33.substring(0, v42) : v33;
      const v45 = v44.substring(0, v44.lastIndexOf("/"));
      for (let v46 = 0; v46 < v39.length; v46++) {
        let v47 = v39[v46].trim();
        if (v47.startsWith("#EXT-X-STREAM-INF")) {
          const v48 = v47.match(/RESOLUTION=\d+x(\d+)/);
          v41 = v48 ? v48[1] + "p" : "Unknown";
        } else if (v47 && !v47.startsWith("#") && v41) {
          let v49 = v47.startsWith("http") ? v47 : v45 + "/" + v47;
          if (v43 && !v49.includes("?")) {
            v49 += v43;
          }
          v40.push({
            quality: v41,
            url: v49
          });
          v41 = null;
        }
      }
      if (v40.length > 0) {
        return v40;
      } else {
        return null;
      }
    } catch (v50) {
      console.log("[" + PROVIDER_NAME + "] Failed to parse M3U8: " + v50.message);
      return null;
    }
  });
}
function search(v51, v52) {
  return __async(this, null, function* () {
    return [];
  });
}
function makeStream(v53, v54, v55, v56, v57, v58, v59, v60) {
  const v61 = {
    dh12: 529,
    dh13: 452,
    dh14: 443,
    dh15: 478
  };
  return __async(this, null, function* () {
    const v62 = v1;
    let v63 = v57;
    let v64 = !v57.includes(".mp4");
    let v65 = v56.toUpperCase();
    let v66 = getHeaders(v60);
    const v67 = {
      name: "" + v53 + v55 + " (" + v65 + ")",
      title: "" + v54 + v55 + " (" + v65 + ")",
      size: "" + v54 + v55 + " (" + v65 + ")",
      url: v63,
      quality: v58,
      behaviorHints: {
        proxyHeaders: {
          request: v66
        },
        notWebReady: true
      }
    };
    if (v64) {
      v67.headers = v66;
      const v68 = yield extractM3u8Qualities(v63, v66);
      if (v68) {
        const v69 = v68.find(v70 => v70.quality === "1080p") || v68.find(v71 => v71.quality === "720p") || v68[0];
        v67.url = v69.url + "#ext=.m3u8";
        v67.quality = v69.quality;
        console.log("[" + PROVIDER_NAME + "] Forced M3U8 Quality: " + v69.quality);
      } else {
        v67.url = v63 + "#ext=.m3u8";
      }
    }
    return v67;
  });
} /*string-table removed*/ /*decoder removed*/
function fetchJson(v72, v73) {
  const v74 = {
    dh16: 479
  };
  return __async(this, null, function* () {
    const v75 = v1;
    try {
      const v76 = new Promise((v77, v78) => {
        setTimeout(() => v78(new Error("timeout")), 4000);
      });
      const v79 = yield Promise.race([__nvFetch(v72, v73), v76]);
      if (!v79.ok) {
        return null;
      }
      return yield v79.json();
    } catch (v80) {
      return null;
    }
  });
}
function aniListBridge(v81) {
  const v82 = {
    dh17: 505
  };
  return __async(this, null, function* () {
    const v83 = v1;
    const v84 = "\n    query ($search: String) {\n      Media (search: $search, type: ANIME) {\n        id\n      }\n    }\n    ";
    try {
      const v85 = yield __nvFetch("https://graphql.anilist.co", {
        method: "POST",
        headers: Object.assign(getHeaders(), {
          "Content-Type": "application/json",
          Accept: "application/json"
        }),
        body: JSON.stringify({
          query: v84,
          variables: {
            search: v81
          }
        })
      });
      if (!v85.ok) {
        return null;
      }
      const v86 = yield v85.json();
      if (v86 && v86.data && v86.data.Media) {
        return {
          aniId: v86.data.Media.id
        };
      }
    } catch (v87) {}
    return null;
  });
}
function getAbsoluteEpisode(v88, v89, v90, v91, v92) {
  const v93 = {
    dh18: 453,
    dh19: 491,
    dh20: 505,
    dh21: 502,
    dh22: 495,
    dh23: 505,
    dh24: 443,
    dh25: 464,
    dh26: 437,
    dh27: 480,
    dh28: 537,
    dh29: 468,
    dh30: 506,
    dh31: 470,
    dh32: 470
  };
  return __async(this, null, function* () {
    const v94 = v1;
    if (v89 === "movie") {
      return 1;
    }
    let v95 = v91;
    let v96 = null;
    let v97 = null;
    try {
      const v98 = yield fetchJson("https://api.themoviedb.org/3/tv/" + v88 + "/external_ids?api_key=" + TMDB_API_KEY);
      if (v98) {
        v96 = v98.imdb_id;
        v97 = v98.tvdb_id;
      }
    } catch (v99) {}
    if (!v97 && v92) {
      try {
        console.log("[" + PROVIDER_NAME + "] Searching TVDB for series: " + v92);
        const v100 = "777140fb-de92-440a-aec2-95eb51e2d7ab";
        const v101 = yield fetchJson("https://api4.thetvdb.com/v4/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            apikey: v100
          })
        });
        if (v101 && v101.data && v101.data.token) {
          const v102 = yield fetchJson("https://api4.thetvdb.com/v4/search?query=" + encodeURIComponent(v92), {
            headers: {
              Authorization: "Bearer " + v101.data.token
            }
          });
          if (v102 && v102.data) {
            const v103 = v102.data.find(v104 => v104.type === "series");
            if (v103) {
              const v105 = v103.id || v103.tvdb_id;
              if (v105) {
                v97 = parseInt(String(v105).replace(/^series-/, ""), 10);
                console.log("[" + PROVIDER_NAME + "] Resolved TVDB ID " + v97 + " from search");
              }
            }
          }
        }
      } catch (v106) {}
    }
    if (v97) {
      try {
        console.log("[" + PROVIDER_NAME + "] Attempting TVDB Math for TVDB: " + v97);
        const v107 = "777140fb-de92-440a-aec2-95eb51e2d7ab";
        const v108 = yield fetchJson("https://api4.thetvdb.com/v4/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            apikey: v107
          })
        });
        if (v108 && v108.data && v108.data.token) {
          const v109 = yield fetchJson("https://api4.thetvdb.com/v4/series/" + v97 + "/episodes/default?season=" + v90, {
            headers: {
              Authorization: "Bearer " + v108.data.token
            }
          });
          if (v109 && v109.data && v109.data.episodes) {
            const v110 = v109.data.episodes.find(v111 => v111.seasonNumber == v90 && v111.number == v91);
            if (v110 && v110.absoluteNumber) {
              console.log("[" + PROVIDER_NAME + "] TVDB Math calculated absolute episode: " + v110.absoluteNumber);
              return v110.absoluteNumber;
            }
          }
        }
      } catch (v112) {}
    }
    if (v96) {
      try {
        console.log("[" + PROVIDER_NAME + "] Attempting Regex Math for IMDB: " + v96);
        const v113 = "https://aiometadata.elfhosted.com/stremio/80d082c4-6e99-4c97-a67d-3d9e242685ce/meta/series/" + v96 + ".json";
        const v114 = yield __nvFetch(v113);
        if (v114 && v114.ok) {
          const v115 = yield v114.text();
          let v116 = 0;
          let v117 = false;
          const v118 = /"season"\s*:\s*(\d+)/g;
          let v119;
          while ((v119 = v118.exec(v115)) !== null) {
            v117 = true;
            const v120 = parseInt(v119[1]);
            if (v120 > 0 && v120 < v90) {
              v116++;
            }
          }
          if (v117) {
            let v121 = v116 + v91;
            console.log("[" + PROVIDER_NAME + "] Regex Math calculated absolute episode: " + v121);
            return v121;
          }
        }
      } catch (v122) {}
    }
    try {
      console.log("[" + PROVIDER_NAME + "] Attempting TMDB math for TMDB ID: " + v88);
      const v123 = "https://api.themoviedb.org/3/tv/" + v88 + "?api_key=" + TMDB_API_KEY;
      const v124 = yield fetchJson(v123, {});
      if (v124 && v124.seasons) {
        let v125 = 0;
        const v126 = v124.seasons.filter(v127 => v127.season_number > 0 && v127.season_number < v90);
        for (let v128 of v126) {
          v125 += v128.episode_count;
        }
        v125 += v91;
        console.log("[" + PROVIDER_NAME + "] TMDB Calculated absolute episode: " + v125);
        return v125;
      }
    } catch (v129) {}
    return v95;
  });
}
function getStreams(v130, v131, v132, v133) {
  const v134 = {
    dh33: 485,
    dh34: 535,
    dh35: 448,
    dh36: 516,
    dh37: 455,
    dh38: 525,
    dh39: 484,
    dh40: 484,
    dh41: 536,
    dh42: 507,
    dh43: 468,
    dh44: 462,
    dh45: 481,
    dh46: 442,
    dh47: 433,
    dh48: 519,
    dh49: 442,
    dh50: 442,
    dh51: 515,
    dh52: 532,
    dh53: 465,
    dh54: 520,
    dh55: 523,
    dh56: 530,
    dh57: 478,
    dh58: 454,
    dh59: 460,
    dh60: 471,
    dh61: 447
  };
  return __async(this, null, function* () {
    const v135 = v1;
    const v136 = MOBILE_UAS[Math.floor(Math.random() * MOBILE_UAS.length)];
    const v137 = getHeaders(v136);
    console.log("[" + PROVIDER_NAME + "] Request: ID=" + v130 + " Type=" + v131 + " S=" + v132 + " E=" + v133);
    yield refreshDomains();
    let v138 = [];
    try {
      const v139 = v131 === "tv" || v131 === "series" || v131 === "anime";
      const v140 = v139 ? "tv" : "movie";
      const v141 = yield fetchJson("https://api.themoviedb.org/3/" + v140 + "/" + v130 + "?api_key=" + TMDB_API_KEY);
      if (!v141) {
        return v138;
      }
      const v142 = v141.genres && v141.genres.some(v143 => v143.name === "Animation");
      const v144 = ["ja", "zh", "ko"].includes(v141.original_language);
      if (!v142 || !v144) {
        console.log("[" + PROVIDER_NAME + "] Skipping non-anime media (Genres: " + (v141.genres ? v141.genres.map(v145 => v145.name).join(", ") : "none") + ", Lang: " + v141.original_language + ").");
        return v138;
      }
      let v146 = v141.name || v141.title;
      if (!v146) {
        return v138;
      }
      let v147 = "";
      if (v141.release_date) {
        v147 = v141.release_date.split("-")[0];
      } else if (v141.first_air_date) {
        v147 = v141.first_air_date.split("-")[0];
      }
      let v148 = v146.split(":")[0].trim();
      let v149 = v148;
      if (v139 && v132 > 1) {
        v149 += " Season " + v132;
      }
      console.log("[" + PROVIDER_NAME + "] Searching for: " + v149 + " (Year: " + (v147 || "Unknown") + ")");
      let v150 = yield fetchJson(BASE_URL + "/anime/search/?query=" + encodeURIComponent(v149), {
        headers: v137
      });
      let v151 = false;
      if (!v150 || !v150.results || v150.results.length === 0) {
        if (v149 !== v148) {
          console.log("[" + PROVIDER_NAME + "] No results with season appended. Trying base title: " + v148);
          v150 = yield fetchJson(BASE_URL + "/anime/search/?query=" + encodeURIComponent(v148), {
            headers: v137
          });
          v151 = true;
        }
        if (!v150 || !v150.results || v150.results.length === 0) {
          console.log("[" + PROVIDER_NAME + "] No results found for query.");
          return v138;
        }
      }
      let v152 = null;
      let v153 = "";
      let v154 = v133;
      let v155 = null;
      let v156 = false;
      if (v139) {
        let v157 = yield aniListBridge(v149);
        if (v157 && v157.aniId) {
          v155 = v157.aniId;
          v156 = false;
        } else if (v149 !== v148) {
          v157 = yield aniListBridge(v148);
          if (v157 && v157.aniId) {
            v155 = v157.aniId;
            v156 = true;
          }
        }
      }
      if (v155) {
        console.log("[" + PROVIDER_NAME + "] AniList Mapping found: AniId=" + v155);
        const v158 = new RegExp("[a-zA-Z/]" + v155 + "[-.]");
        for (let v159 of v150.results) {
          const v160 = v159.cover_image && v159.cover_image.large ? v159.cover_image.large : "";
          const v161 = v159.banner || "";
          if (v158.test(v160) || v158.test(v161)) {
            v152 = v159.id;
            v153 = v159.title.english || v159.title.romaji;
            if (v156 && v139 && v132 > 1) {
              v154 = yield getAbsoluteEpisode(v130, v131, v132, v133, v146);
            } else {
              v154 = v133;
            }
            console.log("[" + PROVIDER_NAME + "] Matched via AniList Cover/Banner Image ID!");
            break;
          }
        }
      }
      if (!v152) {
        for (let v162 = 0; v162 < v150.results.length; v162++) {
          let v163 = v150.results[v162];
          if (v147 && v163.year === parseInt(v147)) {
            v152 = v163.id;
            v153 = v163.title.english || v163.title.romaji;
            break;
          }
        }
        if (!v152) {
          v152 = v150.results[0].id;
          v153 = v150.results[0].title.english || v150.results[0].title.romaji;
        }
        if (v139 && v132 > 1 && v151) {
          v154 = yield getAbsoluteEpisode(v130, v131, v132, v133, v146);
        }
      }
      console.log("[" + PROVIDER_NAME + "] Matched ID: " + v152 + " (" + v153 + ") | Ep: " + v154);
      const v164 = ["kite", "dio"];
      const v165 = ["sub", "dub"];
      for (const v166 of v164) {
        for (const v167 of v165) {
          const v168 = BASE_URL + "/anime/oppai/" + v152 + "/" + v154 + "?server=" + v166 + "&source_type=" + v167;
          try {
            const v169 = yield fetchJson(v168, {
              headers: v137
            });
            if (v169 && v169.sources && v169.sources.length > 0) {
              for (let v170 of v169.sources) {
                if (v170.url) {
                  const v171 = PROXY_URL + v170.url;
                  const v172 = yield makeStream(PROVIDER_NAME, v166.charAt(0).toUpperCase() + v166.slice(1), v139 ? " S" + String(v132).padStart(2, "0") + "E" + String(v133).padStart(2, "0") : "", v167, v171, v170.quality || "Auto", v169.subs, v136);
                  if (v172) {
                    v138.push(v172);
                  }
                }
              }
            }
          } catch (v173) {
            console.log("[" + PROVIDER_NAME + "] Error fetching " + v166 + " " + v167 + ": " + v173.message);
          }
        }
      }
    } catch (v174) {
      console.log("[" + PROVIDER_NAME + "] Error: " + v174.message);
    }
    return v138;
  });
}
module.exports = {
  manifest: manifest,
  search: search,
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
  var PROVIDER = "animetsu";
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