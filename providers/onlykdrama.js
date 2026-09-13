/*
 * nv-plugins onlykdrama.js — FULLY DECODED port of the All-in-One-Nuvio provider (4.24.0 merge pass).
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
var v2 = v1; /*rotation removed*/
;
var PROVIDER_NAME = "OnlyKDrama";
var SITE_URL = "https://onlykdrama.shop";
var TMDB_URL = "https://www.themoviedb.org";
var FILEPRESS_ORIGIN = "https://new5.filepress.wiki";
var DEFAULT_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36",
  "Accept-Language": "en-US,en;q=0.9"
};
var STOP_WORDS = {
  a: true,
  an: true,
  and: true,
  at: true,
  by: true,
  for: true,
  from: true,
  in: true,
  of: true,
  on: true,
  the: true,
  to: true,
  tv: true
};
function mergeHeaders(v3, v4) {
  var v5 = v2;
  var v6 = {};
  var v7;
  for (v7 in v3) {
    if (Object.prototype.hasOwnProperty.call(v3, v7)) {
      v6[v7] = v3[v7];
    }
  }
  if (!v4) {
    return v6;
  }
  for (v7 in v4) {
    if (Object.prototype.hasOwnProperty.call(v4, v7)) {
      v6[v7] = v4[v7];
    }
  }
  return v6;
}
function fetchText(v8, v9) {
  var v10 = v2;
  var v11 = v9 || {};
  v11.headers = mergeHeaders(DEFAULT_HEADERS, v11.headers || {});
  return __nvFetch(v8, v11).then(function (v12) {
    var v13 = v10;
    if (!v12.ok) {
      throw new Error("HTTP " + v12.status + " for " + v8);
    }
    return v12.text();
  });
}
function fetchJson(v14, v15) {
  var v16 = v2;
  var v17 = v15 || {};
  v17.headers = mergeHeaders(DEFAULT_HEADERS, v17.headers || {});
  return __nvFetch(v14, v17).then(function (v18) {
    var v19 = v16;
    if (!v18.ok) {
      throw new Error("HTTP " + v18.status + " for " + v14);
    }
    return v18.json();
  });
}
function decodeHtml(v20) {
  var v21 = v2;
  if (!v20) {
    return "";
  }
  return v20.replace(/&#(\d+);/g, function (v22, v23) {
    var v24 = v1;
    return String.fromCharCode(parseInt(v23, 10));
  }).replace(/&amp;/g, "&").replace(/&quot;/g, "\"").replace(/&#39;/g, "'").replace(/&apos;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
}
function safeDecode(v25) {
  if (!v25) {
    return "";
  }
  try {
    return decodeURIComponent(v25);
  } catch (v26) {
    return v25;
  }
}
function safeEncodeUrl(v27) {
  var v28 = v2;
  if (!v27) {
    return "";
  }
  return String(v27).replace(/ /g, "%20").replace(/\[/g, "%5B").replace(/\]/g, "%5D");
}
function stripTags(v29) {
  var v30 = v2;
  return decodeHtml((v29 || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
}
function normalizeText(v31) {
  var v32 = v2;
  return decodeHtml(v31 || "").toLowerCase().replace(/&#8212;/g, " ").replace(/[\u2019'`]/g, "").replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " ").trim();
}
function uniqueTokens(v33) {
  var v34 = v2;
  var v35 = normalizeText(v33).split(" ");
  var v36 = {};
  var v37 = [];
  var v38;
  var v39;
  for (v38 = 0; v38 < v35.length; v38 += 1) {
    v39 = v35[v38];
    if (!v39 || v39.length < 2 || STOP_WORDS[v39] || v36[v39]) {
      continue;
    }
    v36[v39] = true;
    v37.push(v39);
  }
  return v37;
}
function escapeRegex(v40) {
  var v41 = v2;
  return String(v40 || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function extractQuality(v42) {
  var v43 = v2;
  var v44 = String(v42 || "").match(/\b(2160p|1440p|1080p|720p|540p|480p|360p)\b/i);
  if (v44) {
    return v44[1].toUpperCase();
  } else {
    return "HD";
  }
}
function getFirstMatch(v45, v46) {
  var v47 = v2;
  var v48;
  var v49;
  for (v48 = 0; v48 < v46.length; v48 += 1) {
    v49 = v45.match(v46[v48]);
    if (v49 && v49[1]) {
      return stripTags(v49[1]);
    }
  }
  return "";
}
function getTmdbInfo(v50, v51) {
  var v52 = v2;
  var v53 = v51 === "movie" ? "movie" : "tv";
  var v54 = TMDB_URL + "/" + v53 + "/" + encodeURIComponent(String(v50)) + "?language=en-US";
  return fetchText(v54).then(function (v55) {
    var v56 = v52;
    var v57 = getFirstMatch(v55, [/<meta property="og:title" content="([^"]+)"/i, /<title>([\s\S]*?)<\/title>/i, /"name":"([^"]+)"/i]);
    var v58 = v55.match(/<title>[\s\S]*?\b((?:19|20)\d{2})\b[\s\S]*?<\/title>/i) || v55.match(/\b((?:19|20)\d{2})\b/);
    return {
      title: v57.replace(/\s+\(TV Series.*$/i, "").replace(/\s+\(\d{4}\).*$/i, "").trim(),
      year: v58 ? v58[1] : ""
    };
  });
}
function buildSearchQueries(v59, v60) {
  var v61 = v2;
  var v62 = [];
  var v63 = decodeHtml(v59 || "").replace(/[:\-]/g, " ").replace(/\s+/g, " ").trim();
  var v64 = {};
  function v65(v66) {
    var v67 = v61;
    var v68 = normalizeText(v66);
    if (!v68 || v64[v68]) {
      return;
    }
    v64[v68] = true;
    v62.push(v66);
  }
  v65(v59);
  v65(v63);
  if (v60) {
    v65(v59 + " " + v60);
    v65(v63 + " " + v60);
  }
  return v62;
} /*string-table removed*/
function extractCandidateUrls(v69, v70) {
  var v71 = v2;
  var v72 = v70 === "movie" ? "/movies/" : "/drama/";
  var v73 = /href=["'](https?:\/\/onlykdrama\.shop\/[^"'#?]+)["']/gi;
  var v74 = [];
  var v75 = {};
  var v76;
  while (v76 = v73.exec(v69)) {
    if (v76[1].indexOf(v72) === -1 || v75[v76[1]]) {
      continue;
    }
    v75[v76[1]] = true;
    v74.push(v76[1]);
  }
  return v74;
}
function scoreCandidateUrl(v77, v78, v79, v80) {
  var v81 = v2;
  var v82 = v80 === "movie" ? v77.indexOf("/movies/") !== -1 ? 10 : 0 : v77.indexOf("/drama/") !== -1 ? 10 : 0;
  var v83 = uniqueTokens(v78);
  var v84 = normalizeText(v77);
  var v85;
  for (v85 = 0; v85 < v83.length; v85 += 1) {
    if (v84.indexOf(v83[v85]) !== -1) {
      v82 += 12;
    }
  }
  if (v79 && v84.indexOf(String(v79)) !== -1) {
    v82 += 15;
  }
  return v82;
}
function collectCandidatePages(v86, v87, v88, v89, v90) {
  var v91 = v2;
  if (v89 >= v86.length) {
    return Promise.resolve(rankCandidatePages(v90, v88, v87));
  }
  return fetchText(SITE_URL + "/?s=" + encodeURIComponent(v86[v89])).then(function (v92) {
    var v93 = v91;
    return collectCandidatePages(v86, v87, v88, v89 + 1, v90.concat(extractCandidateUrls(v92, v87)));
  }).catch(function () {
    return collectCandidatePages(v86, v87, v88, v89 + 1, v90);
  });
}
function rankCandidatePages(v94, v95, v96) {
  var v97 = v2;
  var v98 = {};
  var v99 = [];
  var v100;
  for (v100 = 0; v100 < v94.length; v100 += 1) {
    if (v98[v94[v100]]) {
      continue;
    }
    v98[v94[v100]] = true;
    v99.push({
      url: v94[v100],
      score: scoreCandidateUrl(v94[v100], v95.title, v95.year, v96),
      index: v100
    });
  }
  v99.sort(function (v101, v102) {
    var v103 = v97;
    if (v102.score !== v101.score) {
      return v102.score - v101.score;
    }
    return v101.index - v102.index;
  });
  return v99.slice(0, 8).map(function (v104) {
    var v105 = v97;
    return v104.url;
  });
}
function getOnlyKDramaTitle(v106) {
  return getFirstMatch(v106, [/<div class="data">\s*<h1>([\s\S]*?)<\/h1>/i, /<h1[^>]*>([\s\S]*?)<\/h1>/i, /<meta property="og:title" content="([^"]+)"/i]);
}
function titleLooksRelevant(v107, v108, v109) {
  var v110 = v2;
  var v111 = uniqueTokens(v107);
  var v112 = uniqueTokens(v108);
  var v113 = 0;
  var v114;
  var v115 = {};
  var v116 = String(v107 || "").match(/\b((?:19|20)\d{2})\b/);
  var v117 = v116 ? v116[1] : "";
  for (v114 = 0; v114 < v111.length; v114 += 1) {
    v115[v111[v114]] = true;
  }
  for (v114 = 0; v114 < v112.length; v114 += 1) {
    if (v115[v112[v114]]) {
      v113 += 1;
    }
  }
  if (v109 && v117 && v117 !== String(v109)) {
    return false;
  }
  if (v112.length <= 2) {
    return v113 >= 1;
  }
  return v113 >= 2;
}
function extractAttr(v118, v119) {
  var v120 = v2;
  var v121 = v118.match(new RegExp(v119 + "=['\"]([^'\"]+)['\"]", "i"));
  if (v121) {
    return v121[1];
  } else {
    return "";
  }
}
function extractMovieOptions(v122) {
  var v123 = v2;
  var v124 = /<li[^>]*class=['"][^'"]*dooplay_player_option[^'"]*['"][^>]*>[\s\S]*?<\/li>/gi;
  var v125 = [];
  var v126;
  while (v126 = v124.exec(v122)) {
    v125.push({
      label: stripTags(v126[0]),
      post: extractAttr(v126[0], "data-post"),
      type: extractAttr(v126[0], "data-type"),
      nume: extractAttr(v126[0], "data-nume")
    });
  }
  return v125;
}
function extractDirectMovieUrl(v127) {
  var v128 = v2;
  if (!v127) {
    return "";
  }
  try {
    var v129 = new URL(v127);
    var v130 = v129.searchParams.get("source");
    if (v130) {
      return v130;
    }
  } catch (v131) {
    return v127;
  }
  return v127;
}
function buildStream(v132, v133, v134) {
  return {
    name: PROVIDER_NAME,
    title: v132,
    url: safeEncodeUrl(v133),
    quality: v134 || "HD"
  };
}
function resolveMoviePage(v135, v136) {
  var v137 = v2;
  var v138 = extractMovieOptions(v136);
  var v139 = null;
  var v140;
  for (v140 = 0; v140 < v138.length; v140 += 1) {
    if (/fast stream/i.test(v138[v140].label) && v138[v140].post && v138[v140].nume) {
      v139 = v138[v140];
      break;
    }
  }
  if (!v139) {
    return Promise.resolve([]);
  }
  return fetchJson(SITE_URL + "/wp-admin/admin-ajax.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      "X-Requested-With": "XMLHttpRequest",
      Referer: v135
    },
    body: new URLSearchParams({
      action: "doo_player_ajax",
      post: v139.post,
      nume: v139.nume,
      type: v139.type || "movie"
    }).toString()
  }).then(function (v141) {
    var v142 = v137;
    var v143 = extractDirectMovieUrl(v141 && v141.embed_url);
    if (!v143) {
      return [];
    }
    return [buildStream("Fast Stream", v143, extractQuality(safeDecode(v143)))];
  });
}
function extractEpisodeAnchors(v144) {
  var v145 = v2;
  var v146 = /<a[^>]+href=["'](https:\/\/new5\.filepress\.wiki\/file\/([A-Za-z0-9]+))["'][^>]*>([\s\S]*?)<\/a>/gi;
  var v147 = [];
  var v148 = {};
  var v149;
  while (v149 = v146.exec(v144)) {
    if (v148[v149[2]]) {
      continue;
    }
    v148[v149[2]] = true;
    v147.push({
      url: v149[1],
      fileId: v149[2],
      text: stripTags(v149[3])
    });
  }
  return v147;
}
function episodeMatches(v150, v151, v152, v153) {
  var v154 = v2;
  var v155 = escapeRegex(String(v152));
  var v156 = new RegExp("(?:^|[^A-Z0-9])S0*" + escapeRegex(String(v151)) + "E0*" + v155 + "(?:[^A-Z0-9]|$)", "i");
  var v157 = new RegExp("(?:^|[^A-Z0-9])E0*" + v155 + "(?:[^A-Z0-9]|$)", "i");
  var v158 = new RegExp("Episode\\s*0*" + v155 + "(?:[^0-9]|$)", "i");
  if (v156.test(v150)) {
    return true;
  }
  if (v153) {
    return false;
  }
  if (v151 > 1) {
    return false;
  }
  return v157.test(v150) || v158.test(v150);
}
function pickEpisodeAnchor(v159, v160, v161) {
  var v162 = v2;
  var v163 = v159.some(function (v164) {
    var v165 = v1;
    return /S\d{1,2}E\d{1,2}/i.test(v164.text);
  });
  var v166;
  for (v166 = 0; v166 < v159.length; v166 += 1) {
    if (episodeMatches(v159[v166].text, v160, v161, v163)) {
      return v159[v166];
    }
  }
  return null;
} /*decoder removed*/
function filePressHeaders(v167) {
  var v168 = v2;
  return {
    Accept: "application/json, text/plain, */*",
    "Content-Type": "application/json",
    Origin: FILEPRESS_ORIGIN,
    Referer: FILEPRESS_ORIGIN + "/file/" + v167,
    "Sec-Fetch-Dest": "empty",
    "Sec-Fetch-Mode": "cors",
    "Sec-Fetch-Site": "same-origin"
  };
}
function extractFilePressUrl(v169, v170) {
  var v171 = v2;
  if (v170 === "indexDownlaod" || v170 === "cloudDownlaod" || v170 === "cloudR2Downlaod") {
    if (Array.isArray(v169) && v169[0]) {
      return v169[0];
    } else {
      return "";
    }
  }
  if (v170 === "publicDownlaod" || v170 === "publicUserDownlaod") {
    if (v169) {
      return "https://drive.google.com/uc?id=" + v169;
    } else {
      return "";
    }
  }
  return "";
}
function resolveFilePressWithMethod(v172, v173, v174) {
  var v175 = v2;
  if (v174 >= v173.length) {
    return Promise.resolve("");
  }
  var v176 = v173[v174];
  var v177 = filePressHeaders(v172);
  return fetchJson(FILEPRESS_ORIGIN + "/api/file/downlaod/", {
    method: "POST",
    headers: v177,
    body: JSON.stringify({
      id: v172,
      method: v176,
      captchaValue: ""
    })
  }).then(function (v178) {
    var v179 = v175;
    if (!v178 || !v178.status || !v178.data) {
      return resolveFilePressWithMethod(v172, v173, v174 + 1);
    }
    return fetchJson(FILEPRESS_ORIGIN + "/api/file/downlaod2/", {
      method: "POST",
      headers: v177,
      body: JSON.stringify({
        id: v178.data,
        method: v176,
        captchaValue: ""
      })
    }).then(function (v180) {
      var v181 = v179;
      var v182 = v180 && v180.status ? extractFilePressUrl(v180.data, v176) : "";
      if (v182) {
        return v182;
      }
      return resolveFilePressWithMethod(v172, v173, v174 + 1);
    });
  }).catch(function () {
    return resolveFilePressWithMethod(v172, v173, v174 + 1);
  });
}
function resolveEpisodePage(v183, v184, v185) {
  var v186 = v2;
  var v187 = pickEpisodeAnchor(extractEpisodeAnchors(v183), v184, v185);
  if (!v187) {
    return Promise.resolve([]);
  }
  return resolveFilePressWithMethod(v187.fileId, ["indexDownlaod", "publicDownlaod", "publicUserDownlaod"], 0).then(function (v188) {
    var v189 = v186;
    if (!v188) {
      return [];
    }
    return [buildStream(v187.text || "Episode " + v185, v188, extractQuality(v187.text))];
  });
}
function tryCandidatePages(v190, v191, v192, v193, v194, v195) {
  var v196 = v2;
  if (v191 >= v190.length) {
    return Promise.resolve([]);
  }
  return fetchText(v190[v191]).then(function (v197) {
    var v198 = v196;
    var v199 = getOnlyKDramaTitle(v197);
    if (!titleLooksRelevant(v199, v193.title, v193.year)) {
      return tryCandidatePages(v190, v191 + 1, v192, v193, v194, v195);
    }
    return (v192 === "movie" ? resolveMoviePage(v190[v191], v197) : resolveEpisodePage(v197, v194, v195)).then(function (v200) {
      var v201 = v198;
      if (v200 && v200.length) {
        return v200;
      }
      return tryCandidatePages(v190, v191 + 1, v192, v193, v194, v195);
    }).catch(function () {
      return tryCandidatePages(v190, v191 + 1, v192, v193, v194, v195);
    });
  }).catch(function () {
    return tryCandidatePages(v190, v191 + 1, v192, v193, v194, v195);
  });
}
function getStreams(v202, v203, v204, v205) {
  var v206 = v2;
  var v207 = v203 === "movie" ? "movie" : "tv";
  var v208 = Number(v204) || 1;
  var v209 = Number(v205) || 1;
  return getTmdbInfo(v202, v207).then(function (v210) {
    var v211 = v206;
    if (!v210 || !v210.title) {
      return [];
    }
    return collectCandidatePages(buildSearchQueries(v210.title, v210.year), v207, v210, 0, []).then(function (v212) {
      return tryCandidatePages(v212, 0, v207, v210, v208, v209);
    });
  }).catch(function (v213) {
    var v214 = v206;
    console.log("[" + PROVIDER_NAME + "] " + v213.message);
    return [];
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
  var PROVIDER = "onlykdrama";
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