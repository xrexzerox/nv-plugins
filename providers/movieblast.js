/*
 * nv-plugins movieblast.js — FULLY DECODED port of the All-in-One-Nuvio provider (4.23.0 best-settings pass).
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
const v2 = v1; /*rotation removed*/
;
var __create = Object.create;
var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (v3, v4, v5) => v4 in v3 ? __defProp(v3, v4, {
  enumerable: true,
  configurable: true,
  writable: true,
  value: v5
}) : v3[v4] = v5;
var __spreadValues = (v6, v7) => {
  const v8 = v2;
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
var __copyProps = (v12, v13, v14, v15) => {
  const v16 = v2;
  if (v13 && typeof v13 === "object" || typeof v13 === "function") {
    for (let v17 of __getOwnPropNames(v13)) {
      if (!__hasOwnProp.call(v12, v17) && v17 !== v14) {
        __defProp(v12, v17, {
          get: () => v13[v17],
          enumerable: !(v15 = __getOwnPropDesc(v13, v17)) || v15.enumerable
        });
      }
    }
  }
  return v12;
};
var __toESM = (v18, v19, v20) => {
  v20 = v18 != null ? __create(__getProtoOf(v18)) : {};
  return __copyProps(v19 || !v18 || !v18.__esModule ? __defProp(v20, "default", {
    value: v18,
    enumerable: true
  }) : v20, v18);
};
var __async = (v21, v22, v23) => {
  return new Promise((v24, v25) => {
    const v26 = v1;
    var v27 = v28 => {
      const v29 = v1;
      try {
        v30(v23.next(v28));
      } catch (v31) {
        v25(v31);
      }
    };
    var v32 = v33 => {
      const v34 = v1;
      try {
        v30(v23.throw(v33));
      } catch (v35) {
        v25(v35);
      }
    };
    var v30 = v36 => v36.done ? v24(v36.value) : Promise.resolve(v36.value).then(v27, v32);
    v30((v23 = v23.apply(v21, v22)).next());
  });
};
var BASE_URL = "https://app.cloud-mb.xyz";
var TOKEN = "jdvhhjv255vghhghdhvfch2565656jhdcghfdf";
var APP_ID = "com.movieblast";
var HEADERS = {
  "user-agent": "okhttp/5.0.0-alpha.6",
  "x-request-x": APP_ID
};
var SEARCH_HEADERS = __spreadProps(__spreadValues({}, HEADERS), {
  hash256: "86dc03244adddb3cbedbf0ae36074a736ee293a64774b18e82a6244eafd0df30",
  packagename: APP_ID
});
var SIGN_SECRET = "GJ8reydarI7Jqat9rvbAJKNQ9gY4DoEQF2H5nfuI1gi";
var TMDB_API_KEY = "439c478a771f35c05022f9feabcca01c";
var TMDB_BASE_URL = "https://api.themoviedb.org/3";
var import_crypto_js = __toESM(require("crypto-js"));
function generateSignedUrl(v37) {
  const v38 = v2;
  try {
    const v39 = new URL(v37);
    const v40 = v39.pathname;
    const v41 = Math.floor(Date.now() / 1000).toString();
    const v42 = import_crypto_js.default.HmacSHA256(v40 + v41, SIGN_SECRET);
    const v43 = import_crypto_js.default.enc.Base64.stringify(v42);
    const v44 = encodeURIComponent(v43);
    return v37 + "?verify=" + v41 + "-" + v44;
  } catch (v45) {
    console.error("[MovieBlast] Error generating signed URL:", v45.message);
    return v37;
  }
}
function matchQuality(v46) {
  const v47 = v2;
  if (!v46) {
    return "Unknown";
  }
  const v48 = v46.toLowerCase();
  if (v48.includes("2160") || v48.includes("4k")) {
    return "4K";
  }
  if (v48.includes("1440")) {
    return "2K";
  }
  if (v48.includes("1080")) {
    return "1080p";
  }
  if (v48.includes("720")) {
    return "720p";
  }
  if (v48.includes("480")) {
    return "480p";
  }
  if (v48.includes("360")) {
    return "360p";
  }
  return "Unknown";
}
function normalizeTitle(v49) {
  const v50 = v2;
  if (!v49) {
    return "";
  }
  return v49.toLowerCase().replace(/\b(the|a|an)\b/g, "").replace(/[:\-_]/g, " ").replace(/\s+/g, " ").replace(/[^\w\s]/g, "").trim();
}
function getTMDBDetails(v51, v52) {
  return __async(this, null, function* () {
    const v53 = v1;
    const v54 = v52 === "tv" ? "tv" : "movie";
    const v55 = TMDB_BASE_URL + "/" + v54 + "/" + v51 + "?api_key=" + TMDB_API_KEY;
    const v56 = yield __nvFetch(v55, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "User-Agent": "Mozilla/5.0"
      }
    });
    if (!v56.ok) {
      throw new Error("TMDB API error: " + v56.status);
    }
    const v57 = yield v56.json();
    const v58 = v52 === "tv" ? v57.name : v57.title;
    const v59 = v52 === "tv" ? v57.first_air_date : v57.release_date;
    const v60 = v59 ? parseInt(v59.split("-")[0]) : null;
    return {
      title: v58,
      year: v60
    };
  });
}
function calculateTitleSimilarity(v61, v62) {
  const v63 = v2;
  const v64 = normalizeTitle(v61);
  const v65 = normalizeTitle(v62);
  if (v64 === v65) {
    return 1;
  }
  const v66 = v64.split(/\s+/).filter(v67 => v67.length > 0);
  const v68 = v65.split(/\s+/).filter(v69 => v69.length > 0);
  if (v66.length === 0 || v68.length === 0) {
    return 0;
  }
  const v70 = new Set(v66);
  const v71 = new Set(v68);
  const v72 = v66.filter(v73 => v71.has(v73));
  const v74 = new Set([...v66, ...v68]);
  return v72.length / v74.size;
} /*string-table removed*/
function findBestMatch(v75, v76) {
  const v77 = v2;
  if (!v76 || v76.length === 0) {
    return null;
  }
  let v78 = null;
  let v79 = 0;
  for (const v80 of v76) {
    let v81 = calculateTitleSimilarity(v75.title, v80.name);
    if (v75.year && v80.release_date) {
      const v82 = parseInt(v80.release_date.split("-")[0]);
      if (v75.year === v82) {
        v81 += 0.2;
      }
    }
    if (v81 > v79 && v81 > 0.4) {
      v79 = v81;
      v78 = v80;
    }
  }
  return v78;
} /*decoder removed*/
function getStreams(v83, v84 = "movie", v85 = null, v86 = null) {
  return __async(this, null, function* () {
    const v87 = v1;
    console.log("[MovieBlast] Fetching streams for TMDB ID: " + v83 + ", Type: " + v84);
    try {
      const v88 = yield getTMDBDetails(v83, v84);
      console.log("[MovieBlast] Searching for: \"" + v88.title + "\" (" + v88.year + ")");
      const v89 = encodeURIComponent(v88.title);
      const v90 = BASE_URL + "/api/search/" + v89 + "/" + TOKEN;
      const v91 = yield __nvFetch(v90, {
        headers: SEARCH_HEADERS
      });
      if (!v91.ok) {
        console.error("[MovieBlast] Search failed with status: " + v91.status);
        return [];
      }
      const v92 = yield v91.json();
      const v93 = v92.search || [];
      const v94 = findBestMatch(v88, v93);
      if (!v94) {
        console.log("[MovieBlast] No confident matches found in MovieBlast.");
        return [];
      }
      const v95 = v94.id;
      const v96 = v94.type.toLowerCase().includes("serie") || v84 === "tv";
      console.log("[MovieBlast] Match Found: \"" + v94.name + "\" (ID: " + v95 + ")");
      const v97 = v96 ? "series/show" : "media/detail";
      const v98 = BASE_URL + "/api/" + v97 + "/" + v95 + "/" + TOKEN;
      const v99 = yield __nvFetch(v98, {
        headers: HEADERS
      });
      if (!v99.ok) {
        console.error("[MovieBlast] Detail fetch failed: " + v99.status);
        return [];
      }
      const v100 = yield v99.json();
      let v101 = [];
      if (v96) {
        const v102 = v100.seasons || [];
        const v103 = v102.find(v104 => v104.season_number == v85);
        if (v103) {
          const v105 = (v103.episodes || []).find(v106 => v106.episode_number == v86);
          if (v105) {
            v101 = v105.videos || [];
          } else {
            console.log("[MovieBlast] Episode " + v86 + " not found in Season " + v85 + ".");
          }
        } else {
          console.log("[MovieBlast] Season " + v85 + " not found.");
        }
      } else {
        v101 = v100.videos || [];
      }
      if (v101.length === 0) {
        console.log("[MovieBlast] No video links found in details.");
        return [];
      }
      const v107 = v101.map(v108 => {
        const v109 = v87;
        const v110 = v108.link;
        if (!v110) {
          return null;
        }
        const v111 = v110.startsWith("http") ? v110 : "https://" + v110;
        const v112 = generateSignedUrl(v111);
        return {
          name: "MovieBlast",
          title: "MovieBlast - " + v108.server + " (" + (v108.lang || "EN") + ")",
          url: v112,
          quality: matchQuality(v108.server),
          headers: {
            "User-Agent": "MovieBlast",
            Referer: "MovieBlast",
            "x-request-x": "com.movieblast"
          },
          provider: "movieblast"
        };
      }).filter(v113 => v113 !== null);
      console.log("[MovieBlast] Successfully found " + v107.length + " streams.");
      return v107;
    } catch (v114) {
      console.error("[MovieBlast] Error: " + v114.message);
      return [];
    }
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
  var PROVIDER = "movieblast";
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