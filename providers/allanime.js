/*
 * nv-plugins allanime.js — FULLY DECODED port of the All-in-One-Nuvio provider (4.24.0 merge pass).
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
    const v8 = v1;
    var v9 = v10 => {
      const v11 = v1;
      try {
        v12(v5.next(v10));
      } catch (v13) {
        v7(v13);
      }
    };
    var v14 = v15 => {
      const v16 = v1;
      try {
        v12(v5.throw(v15));
      } catch (v17) {
        v7(v17);
      }
    };
    var v12 = v18 => v18.done ? v6(v18.value) : Promise.resolve(v18.value).then(v9, v14);
    v12((v5 = v5.apply(v3, v4)).next());
  });
};
var CryptoJS = __nvRequire("crypto-js");
var AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36";
var ALLANIME_BASE = "https://allanime.day";
var ALLANIME_API = "https://api.allanime.day/api";
function getSimilarity(v19, v20) {
  const v21 = v2;
  if (!v19 || !v20) {
    return 0;
  }
  const v22 = v19.toLowerCase().replace(/[^a-z0-9]/g, "");
  const v23 = v20.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (v22 === v23) {
    return 1;
  }
  if (v22.length < 2 || v23.length < 2) {
    return 0;
  }
  const v24 = v25 => {
    const v26 = v21;
    const v27 = new Set();
    for (let v28 = 0; v28 < v25.length - 1; v28++) {
      v27.add(v25.substring(v28, v28 + 2));
    }
    return v27;
  };
  const v29 = v24(v22);
  const v30 = v24(v23);
  let v31 = 0;
  for (const v32 of v29) {
    if (v30.has(v32)) {
      v31++;
    }
  }
  return v31 * 2 / (v29.size + v30.size);
}
function decryptProviderId(v33) {
  const v34 = v2;
  const v35 = {
    "79": "A",
    "7a": "B",
    "7b": "C",
    "7c": "D",
    "7d": "E",
    "7e": "F",
    "7f": "G",
    "70": "H",
    "71": "I",
    "72": "J",
    "73": "K",
    "74": "L",
    "75": "M",
    "76": "N",
    "77": "O",
    "68": "P",
    "69": "Q",
    "6a": "R",
    "6b": "S",
    "6c": "T",
    "6d": "U",
    "6e": "V",
    "6f": "W",
    "60": "X",
    "61": "Y",
    "62": "Z",
    "59": "a",
    "5a": "b",
    "5b": "c",
    "5c": "d",
    "5d": "e",
    "5e": "f",
    "5f": "g",
    "50": "h",
    "51": "i",
    "52": "j",
    "53": "k",
    "54": "l",
    "55": "m",
    "56": "n",
    "57": "o",
    "48": "p",
    "49": "q",
    "4a": "r",
    "4b": "s",
    "4c": "t",
    "4d": "u",
    "4e": "v",
    "4f": "w",
    "40": "x",
    "41": "y",
    "42": "z",
    "08": "0",
    "09": "1",
    "0a": "2",
    "0b": "3",
    "0c": "4",
    "0d": "5",
    "0e": "6",
    "0f": "7",
    "00": "8",
    "01": "9",
    "15": "-",
    "16": ".",
    "67": "_",
    "46": "~",
    "02": ":",
    "17": "/",
    "07": "?",
    "1b": "#",
    "63": "[",
    "65": "]",
    "78": "@",
    "19": "!",
    "1c": "$",
    "1e": "&",
    "10": "(",
    "11": ")",
    "12": "*",
    "13": "+",
    "14": ",",
    "03": ";",
    "05": "=",
    "1d": "%"
  };
  let v36 = "";
  for (let v37 = 0; v37 < v33.length; v37 += 2) {
    const v38 = v33.substring(v37, v37 + 2);
    v36 += v35[v38] || v38;
  }
  return v36.replace(/([^:])\/\//g, "$1/").replace("/clock", "/clock.json");
}
var AES_KEY = CryptoJS.SHA256("Xot36i3lK3:v1");
function decryptToBeParsed(v39) {
  const v40 = v2;
  const v41 = CryptoJS.enc.Base64.parse(v39);
  const v42 = v41.toString(CryptoJS.enc.Hex);
  const v43 = v42.substring(2, 26);
  const v44 = v42.substring(26, v42.length - 32);
  if (!v44 || v44.length === 0) {
    return null;
  }
  const v45 = v43 + "00000002";
  const v46 = CryptoJS.enc.Hex.parse(v45);
  const v47 = CryptoJS.enc.Hex.parse(v44);
  const v48 = CryptoJS.lib.CipherParams.create({
    ciphertext: v47
  });
  const v49 = CryptoJS.AES.decrypt(v48, AES_KEY, {
    iv: v46,
    mode: CryptoJS.mode.CTR,
    padding: CryptoJS.pad.NoPadding
  });
  return v49.toString(CryptoJS.enc.Utf8);
} /*string-table removed*/
function searchAnime(v50, v51) {
  return __async(this, null, function* () {
    const v52 = v1;
    var v53;
    var v54;
    const v55 = v51 === "dub" ? "dub" : "sub";
    const v56 = "query( $search: SearchInput $limit: Int $page: Int $translationType: VaildTranslationTypeEnumType $countryOrigin: VaildCountryOriginEnumType ) { shows( search: $search limit: $limit page: $page translationType: $translationType countryOrigin: $countryOrigin ) { edges { _id name availableEpisodes __typename } }}";
    const v57 = JSON.stringify({
      variables: {
        search: {
          allowAdult: false,
          allowUnknown: false,
          query: v50
        },
        limit: 40,
        page: 1,
        translationType: v55,
        countryOrigin: "ALL"
      },
      query: v56
    });
    const v58 = {
      "User-Agent": AGENT,
      "Content-Type": "application/json",
      Referer: "https://allmanga.to",
      Origin: "https://allmanga.to"
    };
    try {
      const v59 = yield __nvFetch(ALLANIME_API, {
        method: "POST",
        headers: v58,
        body: v57
      });
      if (!v59.ok) {
        return [];
      }
      const v60 = yield v59.json();
      const v61 = ((v54 = (v53 = v60 == null ? undefined : v60.data) == null ? undefined : v53.shows) == null ? undefined : v54.edges) || [];
      return v61.map(v62 => ({
        id: v62._id,
        name: v62.name,
        episodes: v62.availableEpisodes && v62.availableEpisodes[v55] || 0
      }));
    } catch (v63) {
      console.error("AllAnime Search Error:", v63);
      return [];
    }
  });
}
function getRawStreamSources(v64, v65, v66) {
  return __async(this, null, function* () {
    const v67 = v1;
    var v68;
    var v69;
    var v70;
    var v71;
    const v72 = v66 === "dub" ? "dub" : "sub";
    const v73 = {
      showId: v64,
      translationType: v72,
      episodeString: String(v65)
    };
    const v74 = "d405d0edd690624b66baba3068e0edc3ac90f1597d898a1ec8db4e5c43c00fec";
    const v75 = ALLANIME_API + "?variables=" + encodeURIComponent(JSON.stringify(v73)) + "&extensions=" + encodeURIComponent(JSON.stringify({
      persistedQuery: {
        version: 1,
        sha256Hash: v74
      }
    }));
    const v76 = {
      "User-Agent": AGENT,
      Accept: "*/*",
      Referer: "https://youtu-chan.com",
      Origin: ALLANIME_BASE
    };
    try {
      const v77 = yield __nvFetch(v75, {
        headers: v76
      });
      if (!v77.ok) {
        console.error("getRawStreamSources HTTP", v77.status);
        return [];
      }
      const v78 = yield v77.json();
      if ((v68 = v78 == null ? undefined : v78.data) == null ? undefined : v68.tobeparsed) {
        const v79 = decryptToBeParsed(v78.data.tobeparsed);
        if (v79) {
          try {
            const v80 = JSON.parse(v79);
            if ((v69 = v80 == null ? undefined : v80.episode) == null ? undefined : v69.sourceUrls) {
              return v80.episode.sourceUrls;
            }
          } catch (v81) {
            console.error("tobeparsed JSON parse error:", v81, v79.substring(0, 100));
          }
        }
        return [];
      }
      return ((v71 = (v70 = v78 == null ? undefined : v78.data) == null ? undefined : v70.episode) == null ? undefined : v71.sourceUrls) || [];
    } catch (v82) {
      console.error("AllAnime Raw Stream Error:", v82);
      return [];
    }
  });
}
function fetchLinksFromProvider(v83) {
  return __async(this, null, function* () {
    const v84 = v1;
    try {
      const v85 = v83.startsWith("http") ? v83 : ALLANIME_BASE + v83;
      const v86 = yield __nvFetch(v85, {
        headers: {
          "User-Agent": AGENT,
          Referer: ALLANIME_BASE + "/"
        }
      });
      if (!v86.ok) {
        return [];
      }
      const v87 = yield v86.json();
      const v88 = [];
      if (v87.links && Array.isArray(v87.links)) {
        v88.push(...v87.links.map(v89 => ({
          url: v89.link,
          quality: v89.resolutionStr || "Unknown",
          headers: {
            "User-Agent": AGENT
          }
        })));
      } else if (v87.data) {
        const v90 = decryptToBeParsed(v87.data);
        try {
          const v91 = JSON.parse(v90);
          const v92 = Array.isArray(v91) ? v91 : v91.links || [];
          v88.push(...v92.map(v93 => ({
            url: v93.link,
            quality: v93.resolutionStr || "Unknown",
            headers: {
              "User-Agent": AGENT
            }
          })));
        } catch (v94) {
          console.error("Failed to parse decrypted tobeparsed:", v94);
        }
      }
      return v88;
    } catch (v95) {
      console.error("Fetch provider links error:", v95);
      return [];
    }
  });
} /*decoder removed*/
function getAnilistId(v96, v97) {
  return __async(this, null, function* () {
    const v98 = v1;
    try {
      const v99 = "https://arm.haglund.dev/api/v2/themoviedb?id=" + v96;
      const v100 = yield __nvFetch(v99);
      if (v100.ok) {
        const v101 = yield v100.json();
        if (Array.isArray(v101) && v101.length > 0 && v101[0].anilist) {
          return v101[0].anilist;
        }
      }
    } catch (v102) {
      console.error("Mapping Error:", v102);
    }
    return null;
  });
}
function getAnilistMeta(v103) {
  return __async(this, null, function* () {
    const v104 = v1;
    var v105;
    const v106 = "\n        query ($id: Int) {\n            Media (id: $id) {\n                id\n                format\n                episodes\n                title { romaji english native }\n                relations {\n                    edges { relationType }\n                    nodes { id format episodes type }\n                }\n            }\n        }\n    ";
    try {
      const v107 = yield __nvFetch("https://graphql.anilist.co", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify({
          query: v106,
          variables: {
            id: parseInt(v103)
          }
        })
      });
      if (v107.ok) {
        const v108 = yield v107.json();
        if ((v105 = v108.data) == null) {
          return undefined;
        } else {
          return v105.Media;
        }
      }
    } catch (v109) {}
    return null;
  });
}
function resolveAnilistEpisode(v110, v111, v112, v113) {
  return __async(this, null, function* () {
    const v114 = v1;
    const v115 = yield getAnilistMeta(v110);
    if (!v115) {
      return {
        title: null,
        ep: v112
      };
    }
    const v116 = v115.title.romaji || v115.title.english || "";
    return {
      title: v116,
      ep: v112
    };
  });
}
function getStreams(v117, v118, v119, v120) {
  return __async(this, null, function* () {
    const v121 = v1;
    const v122 = v117;
    const v123 = yield getAnilistId(v122, v118);
    console.log("Anilist ID:", v123);
    let v124 = "Anime";
    let v125 = String(v120);
    let v126 = String(v120);
    if (v123) {
      const v127 = yield resolveAnilistEpisode(v123, v119, v120, v118);
      console.log("Resolved:", v127);
      v124 = v127.title || v124;
      v125 = String(v127.ep);
      v126 = String(v127.ep);
    } else {
      try {
        const v128 = yield __nvFetch("https://api.themoviedb.org/3/" + (v118 === "movie" ? "movie" : "tv") + "/" + v122 + "?api_key=94fc7b2a9e6af14b1c78465d64e9e0d1");
        if (v128.ok) {
          const v129 = yield v128.json();
          v124 = v129.name || v129.title || v124;
        }
      } catch (v130) {}
    }
    console.log("Search title:", v124);
    const v131 = [v124];
    const [v132, v133] = yield Promise.all([searchAnime(v131[0], "sub").catch(() => []), searchAnime(v131[0], "dub").catch(() => [])]);
    console.log("Sub results: " + v132.length + ", Dub results: " + v133.length);
    const v134 = (v135, v136) => {
      const v137 = v121;
      if (!v135 || v135.length === 0) {
        return null;
      }
      let v138 = 0;
      let v139 = null;
      for (const v140 of v135) {
        const v141 = getSimilarity(v140.name, v136);
        if (v141 > v138) {
          v138 = v141;
          v139 = v140;
        }
      }
      if (v139 && v138 > 0.4) {
        return v139;
      }
      return v135[0];
    };
    let v142 = v134(v132, v124);
    let v143 = v134(v133, v124);
    const v144 = [];
    const v145 = (v146, v147, v148) => __async(this, null, function* () {
      const v149 = v121;
      if (!v146) {
        return;
      }
      const v150 = yield getRawStreamSources(v146.id, v148, v147.toLowerCase());
      console.log("[" + v147 + "] Got " + v150.length + " raw sources");
      const v151 = ["Yt-mp4", "Default", "S-mp4", "Uv-mp4", "Luf-Mp4", "Sl-mp4"];
      for (const v152 of v150) {
        const v153 = v152.sourceName || "";
        let v154 = v152.sourceUrl;
        if (v154.startsWith("--")) {
          v154 = decryptProviderId(v154.substring(2));
          if (!v154) {
            console.log("[" + v147 + "] Failed to decrypt " + v153);
            continue;
          }
        }
        console.log("[" + v147 + "] " + v153 + ": " + v154.substring(0, 80));
        if (v154.includes("fast4speed")) {
          v144.push({
            url: v154,
            quality: "1080p",
            provider: "AllAnime " + v153 + " (" + v147 + ")",
            headers: {
              Referer: "https://allanime.day",
              "User-Agent": AGENT
            }
          });
          continue;
        }
        if (v154.includes("/clock.json") || v154.includes("/apivtwo/")) {
          const v155 = v154.startsWith("http") ? v154 : ALLANIME_BASE + v154;
          const v156 = yield fetchLinksFromProvider(v155);
          for (const v157 of v156) {
            const v158 = v157.url || "";
            if (!v158) {
              continue;
            }
            const v159 = v158.match(/repackager\.wixmp\.com\/([^,]+)\/((?:,[^,]+)+,?)\/mp4\/file\.mp4/);
            if (v159) {
              const v160 = v159[1];
              const v161 = v159[2].split(",").filter(v162 => v162.length > 0);
              for (const v163 of v161) {
                v144.push({
                  url: "https://" + v160 + "/" + v163 + "/mp4/file.mp4",
                  quality: v163,
                  provider: "AllAnime " + v153 + " (" + v147 + ")",
                  headers: {
                    "User-Agent": AGENT
                  }
                });
              }
            } else {
              v144.push({
                url: v158,
                quality: v157.quality || v157.resolutionStr || "Auto",
                provider: "AllAnime " + v153 + " (" + v147 + ")",
                headers: Object.assign({
                  Referer: "https://allanime.day"
                }, v157.headers || {})
              });
            }
          }
          continue;
        }
        if (v152.type === "iframe") {
          console.log("[" + v147 + "] Skipping iframe: " + v153);
          continue;
        }
      }
    });
    yield Promise.all([v145(v142, "Sub", v125), v145(v143, "Dub", v126)]);
    return v144.map(v164 => {
      const v165 = v121;
      let v166 = "Unknown";
      if (v164.quality) {
        const v167 = v164.quality.match(/\d+p/i);
        if (v167) {
          v166 = v167[0];
        } else if (v164.quality.toLowerCase() === "best") {
          v166 = "1080p";
        }
      }
      return {
        name: v164.provider,
        title: v164.provider + " | " + v164.quality,
        url: v164.url,
        quality: v166,
        headers: v164.headers
      };
    });
  });
}
module.exports = {
  name: "AllAnime",
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
  var PROVIDER = "allanime";
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