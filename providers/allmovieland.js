/*
 * nv-plugins allmovieland.js — FULLY DECODED port of the All-in-One-Nuvio provider (4.24.0 merge pass).
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
var import_cheerio_without_node_native = __toESM(__nvRequire("cheerio-without-node-native"));
var TMDB_API_KEY = "439c478a771f35c05022f9feabcca01c";
var TMDB_BASE_URL = "https://api.themoviedb.org/3";
var MAIN_URL = "https://allmovieland.you";
var HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.5"
};
/*string-table removed*/
function getTMDBDetails(v37, v38) {
  return __async(this, null, function* () {
    const v39 = v1;
    var v40;
    const v41 = v38 === "tv" ? "tv" : "movie";
    const v42 = TMDB_BASE_URL + "/" + v41 + "/" + v37 + "?api_key=" + TMDB_API_KEY + "&append_to_response=external_ids";
    const v43 = yield __nvFetch(v42, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "User-Agent": "Mozilla/5.0"
      }
    });
    if (!v43.ok) {
      throw new Error("TMDB API error: " + v43.status);
    }
    const v44 = yield v43.json();
    const v45 = v38 === "tv" ? v44.name : v44.title;
    const v46 = v38 === "tv" ? v44.first_air_date : v44.release_date;
    const v47 = v46 ? parseInt(v46.split("-")[0]) : null;
    return {
      title: v45,
      year: v47,
      imdbId: ((v40 = v44.external_ids) == null ? undefined : v40.imdb_id) || null,
      data: v44
    };
  });
}
function normalizeTitle(v48) {
  const v49 = v2;
  if (!v48) {
    return "";
  }
  return v48.toLowerCase().replace(/\b(the|a|an)\b/g, "").replace(/[:\-_]/g, " ").replace(/\s+/g, " ").replace(/[^\w\s]/g, "").trim();
}
function calculateTitleSimilarity(v50, v51) {
  const v52 = v2;
  const v53 = normalizeTitle(v50);
  const v54 = normalizeTitle(v51);
  if (v53 === v54) {
    return 1;
  }
  const v55 = v53.split(/\s+/).filter(v56 => v56.length > 0);
  const v57 = v54.split(/\s+/).filter(v58 => v58.length > 0);
  if (v55.length === 0 || v57.length === 0) {
    return 0;
  }
  const v59 = new Set(v55);
  const v60 = new Set(v57);
  const v61 = v55.filter(v62 => v60.has(v62));
  const v63 = new Set([...v55, ...v57]);
  const v64 = v61.length / v63.size;
  const v65 = v57.filter(v66 => !v59.has(v66)).length;
  let v67 = v64 - v65 * 0.05;
  if (v55.length > 0 && v55.every(v68 => v60.has(v68))) {
    v67 += 0.2;
  }
  return v67;
}
function findBestTitleMatch(v69, v70) {
  const v71 = v2;
  if (!v70 || v70.length === 0) {
    return null;
  }
  let v72 = null;
  let v73 = 0;
  for (const v74 of v70) {
    let v75 = calculateTitleSimilarity(v69.title, v74.title);
    if (v69.year && v74.year) {
      const v76 = Math.abs(v69.year - v74.year);
      if (v76 === 0) {
        v75 += 0.2;
      } else if (v76 <= 1) {
        v75 += 0.1;
      } else if (v76 > 5) {
        v75 -= 0.3;
      }
    }
    if (v75 > v73 && v75 > 0.3) {
      v73 = v75;
      v72 = v74;
    }
  }
  return v72;
} /*decoder removed*/
function getStreams(v77, v78 = "movie", v79 = null, v80 = null) {
  return __async(this, null, function* () {
    const v81 = v1;
    console.log("[AllMovieLand] Fetching streams for TMDB ID: " + v77 + ", Type: " + v78);
    try {
      const v82 = yield getTMDBDetails(v77, v78);
      console.log("[AllMovieLand] TMDB Info: \"" + v82.title + "\" (" + (v82.year || "N/A") + ")");
      const v83 = v82.title;
      const v84 = MAIN_URL + "/index.php?story=" + encodeURIComponent(v83) + "&do=search&subaction=search";
      const v85 = yield __nvFetch(v84, {
        headers: HEADERS
      });
      const v86 = yield v85.text();
      const v87 = import_cheerio_without_node_native.default.load(v86);
      const v88 = [];
      v87("article.short-mid").each((v89, v90) => {
        const v91 = v81;
        const v92 = v87(v90).find("a > h3").text().trim();
        const v93 = v87(v90).find("a").attr("href");
        const v94 = v92.match(new RegExp("(?<=\\()[\\d(\\]]+(?=\\))"));
        const v95 = v94 ? parseInt(v94[0]) : null;
        v88.push({
          title: v92,
          href: v93,
          year: v95
        });
      });
      if (v88.length === 0) {
        console.log("[AllMovieLand] No search results found.");
        return [];
      }
      const v96 = findBestTitleMatch(v82, v88);
      const v97 = v96 || v88[0];
      console.log("[AllMovieLand] Selected: \"" + v97.title + "\" (" + v97.href + ")");
      const v98 = yield __nvFetch(v97.href, {
        headers: HEADERS
      });
      const v99 = yield v98.text();
      const v100 = import_cheerio_without_node_native.default.load(v99);
      const v101 = v100("div.tabs__content script").html() || "";
      const v102 = v101.match(/const AwsIndStreamDomain\s*=\s*'([^']+)'/);
      const v103 = v102 ? v102[1].replace(/\/$/, "") : null;
      const v104 = v101.match(/src:\s*'([^']+)'/);
      const v105 = v104 ? v104[1] : null;
      if (!v103 || !v105) {
        console.log("[AllMovieLand] Could not find player domain or ID.");
        return [];
      }
      const v106 = v103 + "/play/" + v105;
      const v107 = yield __nvFetch(v106, {
        headers: __spreadProps(__spreadValues({}, HEADERS), {
          Referer: v97.href
        })
      });
      const v108 = yield v107.text();
      const v109 = import_cheerio_without_node_native.default.load(v108);
      const v110 = v109("body > script").last().html() || "";
      const v111 = v110.match(/let\s+p3\s*=\s*(\{.*\});/);
      if (!v111) {
        console.log("[AllMovieLand] No p3 JSON found in embed.");
        return [];
      }
      const v112 = JSON.parse(v111[1]);
      let v113 = v112.file.replace(/\\\//g, "/");
      if (!v113.startsWith("http")) {
        v113 = "" + v103 + v113;
      }
      const v114 = yield __nvFetch(v113, {
        method: "POST",
        headers: __spreadProps(__spreadValues({}, HEADERS), {
          "X-CSRF-TOKEN": v112.key,
          Referer: v106
        })
      });
      const v115 = yield v114.text();
      let v116 = [];
      const v117 = JSON.parse(v115.replace(/,\]/g, "]"));
      if (v78 === "movie") {
        v116 = v117.filter(v118 => v118 && v118.file);
      } else if (v78 === "tv") {
        const v119 = v117.find(v120 => v120.id == v79);
        if (v119 && v119.folder) {
          const v121 = v119.folder.find(v122 => v122.episode == v80);
          if (v121 && v121.folder) {
            v116 = v121.folder.filter(v123 => v123 && v123.file);
          }
        }
      }
      if (v116.length === 0) {
        console.log("[AllMovieLand] No streams found for the requested media.");
        return [];
      }
      const v124 = [];
      yield Promise.all(v116.map(v125 => __async(this, null, function* () {
        const v126 = v81;
        try {
          const v127 = v125.file.replace(/^~/, "");
          const v128 = v103 + "/playlist/" + v127 + ".txt";
          const v129 = yield __nvFetch(v128, {
            method: "POST",
            headers: __spreadProps(__spreadValues({}, HEADERS), {
              "X-CSRF-TOKEN": v112.key,
              Referer: v106
            })
          });
          const v130 = (yield v129.text()).trim();
          if (v130 && v130.startsWith("http")) {
            const v131 = v125.title || "Unknown";
            v124.push({
              name: "AllMovieLand",
              title: "AllMovieLand - " + v131,
              url: v130,
              quality: v131,
              headers: {
                Referer: v103 + "/",
                Origin: v103,
                "User-Agent": HEADERS["User-Agent"]
              },
              provider: "allmovieland"
            });
          }
        } catch (v132) {
          console.error("[AllMovieLand] Failed to extract stream: " + v132.message);
        }
      })));
      return v124;
    } catch (v133) {
      console.error("[AllMovieLand] Error: " + v133.message);
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
  var PROVIDER = "allmovieland";
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