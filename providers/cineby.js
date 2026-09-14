/* nv-plugins pack 4.37.0 (2026-09-14): device-fidelity fix. The Nuvio QuickJS realm ships NO timers - every unguarded setTimeout race in 4.33.0-4.36.0 (wings _race, wings partial collector, merge-wrapper cap(), native lanes, light deadline wrappers) threw ReferenceError on device and returned 0 rows on every call. All sites are guarded now and the merge wrapper is a fetch-count-bounded waterfall (verified WINGS text lane first/fallback + native lane, fail-soft, URL-deduped). Pure-JS polyfills for atob/URLSearchParams attached.
 */
/* ===== nv-plugins device polyfills v1.0.0 (pack 4.37.0, 2026-09-14) ============
   The Nuvio QuickJS plugin runtime (quickjs-kt 1.0.5-nuvio AAR) is a bare
   ES2020 realm: no atob/btoa, no URLSearchParams, no TextDecoder, no timers.
   These polyfills are define-only-if-missing, so node/desktop runtimes are
   completely unaffected. ==================================================== */
(function() {
  var G = typeof globalThis !== 'undefined' ? globalThis : (typeof global !== 'undefined' ? global : this);
  if (typeof G.atob !== 'function') {
    var _CH = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    G.atob = function(s) {
      s = String(s).replace(/[^A-Za-z0-9+\/]/g, '');
      var out = '',
        bits = 0,
        acc = 0,
        i;
      for (i = 0; i < s.length; i++) {
        acc = (acc << 6) | _CH.indexOf(s.charAt(i));
        bits += 6;
        if (bits >= 8) {
          bits -= 8;
          out += String.fromCharCode((acc >> bits) & 0xff);
        }
      }
      return out;
    };
  }
  if (typeof G.btoa !== 'function') {
    var _CH2 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    G.btoa = function(s) {
      s = String(s);
      var out = '',
        i;
      for (i = 0; i < s.length; i += 3) {
        var b0 = s.charCodeAt(i),
          b1 = s.charCodeAt(i + 1),
          b2 = s.charCodeAt(i + 2);
        var has1 = !(i + 1 >= s.length || isNaN(b1)),
          has2 = !(i + 2 >= s.length || isNaN(b2));
        out += _CH2.charAt(b0 >> 2);
        out += _CH2.charAt(((b0 & 3) << 4) | (has1 ? b1 >> 4 : 0));
        out += has1 ? _CH2.charAt(((b1 & 15) << 2) | (has2 ? b2 >> 6 : 0)) : '=';
        out += has2 ? _CH2.charAt(b2 & 63) : '=';
      }
      return out;
    };
  }
  if (typeof G.URLSearchParams !== 'function') {
    var USP = function(init) {
      this._m = {};
      if (init && typeof init === 'object') {
        for (var k in init)
          if (Object.prototype.hasOwnProperty.call(init, k)) this._m[k] = [String(init[k])];
      }
    };
    USP.prototype.append = function(k, v) {
      (this._m[k] = this._m[k] || []).push(String(v));
    };
    USP.prototype.set = function(k, v) {
      this._m[k] = [String(v)];
    };
    USP.prototype.get = function(k) {
      var a = this._m[k];
      return a && a.length ? a[0] : null;
    };
    USP.prototype.has = function(k) {
      return Object.prototype.hasOwnProperty.call(this._m, k);
    };
    USP.prototype.toString = function() {
      var out = [];
      for (var k in this._m) {
        if (!Object.prototype.hasOwnProperty.call(this._m, k)) continue;
        var vs = this._m[k];
        for (var i = 0; i < vs.length; i++)
          out.push(encodeURIComponent(k).replace(/%20/g, '+') + '=' + encodeURIComponent(vs[i]).replace(
            /%20/g, '+'));
      }
      return out.join('&');
    };
    G.URLSearchParams = USP;
  }
})();
/* nv-plugins cineby.js v2.5.0 (pack 4.33.0, 2026-09-13): speed fix - estimateHlsSize (1 master fetch + 5 segment HEADs per stream) removed: on device it pushed every call past the 8s tail cap, which is why cineby showed no streams on device while working on fast networks. Size now reported as Variable. */
/*
 * nv-plugins cineby.js — FULLY DECODED port of the All-in-One-Nuvio provider (4.23.0 best-settings pass).
 * Decoded from the obfuscated AIO build: string tables resolved, decoder machinery stripped,
 * every network call capped by an 8s deadline, nvio post-filter attached (en/tl audio gate,
 * >=720p quality gate, cross-provider dedupe). Behavior/endpoints identical to the AIO original.
 */
/* nv-plugins best-settings pass 4.23.0: hard 8s deadline on every network call */
var __nvFetch = (function() {
  var _f = null;
  try {
    _f = (typeof fetch === "function") ? fetch : null;
  } catch (e) {
    _f = null;
  }
  if (!_f) return function() {
    return Promise.reject(new Error("no fetch"));
  };
  var hasT = typeof setTimeout === "function";
  return function(input, init) {
    var p;
    try {
      p = _f.apply(this, arguments);
    } catch (e) {
      return Promise.reject(e);
    }
    if (!hasT || !p || typeof p.then !== "function") return p;
    return Promise.race([p, new Promise(function(_res, rej) {
      var t = setTimeout(function() {
        rej(new Error("nv deadline 8s"));
      }, 8000);
      if (t && typeof t.unref === "function") t.unref();
    })]);
  };
})();
var v1 = function() {
  return "";
};
var __defProp = Object.defineProperty,
  __defProps = Object.defineProperties,
  __getOwnPropDescs = Object.getOwnPropertyDescriptors,
  __getOwnPropSymbols = Object.getOwnPropertySymbols,
  __hasOwnProp = Object.prototype.hasOwnProperty,
  __propIsEnum = Object.prototype.propertyIsEnumerable,
  __defNormalProp = (v3, v4, v5) => (v4 in v3) ? __defProp(v3, v4, {
    enumerable: true,
    configurable: true,
    writable: true,
    value: v5
  }) : v3[v4] = v5,
  __spreadValues = (v6, v7) => {
    for (var v11 in v7 || (v7 = {}))
      if (__hasOwnProp.call(v7, v11)) __defNormalProp(v6, v11, v7[v11]);
    if (__getOwnPropSymbols)
      for (var v11 of __getOwnPropSymbols(v7)) {
        if (__propIsEnum.call(v7, v11)) __defNormalProp(v6, v11, v7[v11]);
      }
    return v6;
  },
  __spreadProps = (v12, v13) => __defProps(v12, __getOwnPropDescs(v13)),
  __async = (v14, v15, v16) => {
    return new Promise((v21, v22) => {
      var v24 = v25 => {
          try {
            v27(v16.next(v25));
          } catch (v28) {
            v22(v28);
          }
        },
        v29 = v30 => {
          try {
            v27(v16.throw(v30));
          } catch (v31) {
            v22(v31);
          }
        },
        v27 = v32 => v32.done ? v21(v32.value) : Promise.resolve(v32.value).then(v24, v29);
      v27((v16 = v16.apply(v14, v15)).next());
    });
  },
  DOMAINS_URL = "https://raw.githubusercontent.com/sapariyaneel/nuvio-plugin/refs/heads/main/domains.json",
  FALLBACK_API_HOST = "https://api.speedracelight.com",
  TMDB_API_KEY = "1865f43a0549ca50d341dd9ab8b29f49",
  HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    Referer: "https://www.cineby.at/",
    Origin: "https://www.cineby.at"
  },
  cachedDomains = null;

function getDomains() {
  return __async(this, null, function*() {
    if (cachedDomains) return cachedDomains;
    try {
      const v33 = yield __nvFetch(DOMAINS_URL, {
        skipSizeCheck: true
      });
      cachedDomains = yield v33.json();
    } catch (v34) {
      cachedDomains = {};
    }
    return cachedDomains;
  });
}

function getApiHost() {
  return __async(this, null, function*() {
    const v38 = yield getDomains();
    return (v38.speedracelight || v38["api.speedracelight.com"] || FALLBACK_API_HOST).replace(/\/+$/, "");
  });
}
var SHA256_CONSTANTS = [0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4,
    0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174
  ],
  MAGIC_BYTES = [0x6d, 0x76, 0x6d, 0x31];

function isCustomBranch(v39) {
  return (v39 * (v39 + 1) & 1) === 0;
}

function fmix32(v40) {
  return (v40 = v40 >>> 0, v40 ^= v40 >>> 16, v40 = Math.imul(v40, 2246822507) >>> 0, v40 ^= v40 >>> 13, v40 =
    Math.imul(v40, 3266489909) >>> 0, v40 = (v40 ^ v40 >>> 16) >>> 0, v40);
}

function rotl32(v44, v45) {
  (v44 = v44 >>> 0, v45 &= 31);
  if (v45 === 0) return v44 >>> 0;
  return (v44 << v45 | v44 >>> 32 - v45) >>> 0;
}
var BASE64_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

function pureBase64Decode(v46) {
  let v52 = "";
  for (let v53 = 0; v53 < v46.length; v53++) {
    const v54 = v46.charAt(v53);
    if (v54 !== "=" && BASE64_CHARS.indexOf(v54) !== -1) v52 += v54;
  }
  let v55 = "";
  for (let v56 = 0; v56 < v52.length; v56 += 4) {
    const v57 = BASE64_CHARS.indexOf(v52.charAt(v56)),
      v58 = BASE64_CHARS.indexOf(v52.charAt(v56 + 1)),
      v59 = v56 + 2 < v52.length ? BASE64_CHARS.indexOf(v52.charAt(v56 + 2)) : -1,
      v60 = v56 + 3 < v52.length ? BASE64_CHARS.indexOf(v52.charAt(v56 + 3)) : -1;
    v55 += String.fromCharCode(v57 << 2 | v58 >> 4);
    if (v59 !== -1) v55 += String.fromCharCode((v58 & 15) << 4 | v59 >> 2);
    if (v60 !== -1) v55 += String.fromCharCode((v59 & 3) << 6 | v60);
  }
  return v55;
}
/*decoder removed*/
function base64UrlToBytes(v61) {
  const v63 = v61.replace(/-/g, "+").replace(/_/g, "/").padEnd(4 * Math.ceil(v61.length / 4), "="),
    v64 = typeof atob === "function" ? atob(v63) : pureBase64Decode(v63),
    v65 = new Uint8Array(v64.length);
  for (let v66 = 0; v66 < v64.length; v66++) v65[v66] = v64.charCodeAt(v66);
  return v65;
}

function fnv1a32(v67) {
  let v72 = 2166136261;
  for (let v73 = 0; v73 < v67.length; v73++) v72 = Math.imul(v72 ^ v67.charCodeAt(v73), 16777619) >>> 0;
  return fmix32(v72);
}

function makeKeystreamState(v74, v75) {
  const v76 = new Array(61);
  let v77 = fmix32(fnv1a32(v74) ^ fmix32(v75 >>> 0 ^ 2654435769)) >>> 0;
  for (let v78 = 0; v78 < 8; v78++) {
    if (isCustomBranch(v78)) {
      const v79 = v77 % 61;
      (v77 = rotl32(v77 + 2654435769 >>> 0, 7 + (7 & v78)), v76[v79] = (v77 ^ fmix32(v77)) >>> 0, v77 =
        fmix32(v77 + v79 >>> 0));
    } else v76[v78] = SHA256_CONSTANTS[15 & v78];
  }
  return {
    slots: v76,
    acc: fmix32(2779096485 ^ v77) >>> 0
  };
}

function nextKeystreamWord(v80, v81) {
  const v85 = v80.slots,
    v86 = v80.acc,
    v87 = v86 % 61,
    v88 = (v87 in v85) ? -1 : 0,
    v89 = v85[v87] >>> 0,
    v90 = (v89 ^ Math.imul(2654435769, v81 + 1) >>> 0) >>> 0,
    v91 = ((v86 ^ v90) >>> 0 | (v86 & v90 & v88) >>> 0) >>> 0,
    v92 = (rotl32(v91 + v86 >>> 0, 31 & v87) ^ rotl32(v86, 31 & Math.imul(v87, 7))) >>> 0,
    v93 = fmix32(v92 + 2654435769 >>> 0);
  return (v85[v87] = v93 >>> 0, v80.acc = v93, v93 >>> 0);
}

function generateKeystream(v94, v95, v96) {
  const v97 = makeKeystreamState(v94, v95),
    v98 = new Uint8Array(v96);
  let v99 = 0,
    v100 = 0;
  while (v99 < v96) {
    const v101 = nextKeystreamWord(v97, v100++);
    v98[v99++] = 255 & v101;
    if (v99 < v96) v98[v99++] = v101 >>> 8 & 255;
    if (v99 < v96) v98[v99++] = v101 >>> 16 & 255;
    if (v99 < v96) v98[v99++] = v101 >>> 24 & 255;
  }
  return v98;
}

function utf8BytesToString(v102) {
  let v106 = "",
    v107 = 0;
  while (v107 < v102.length) {
    const v108 = v102[v107++];
    if (v108 < 128) v106 += String.fromCharCode(v108);
    else {
      if ((v108 & 224) === 192) {
        const v109 = v102[v107++];
        v106 += String.fromCharCode((v108 & 31) << 6 | v109 & 63);
      } else {
        if ((v108 & 240) === 224) {
          const v110 = v102[v107++],
            v111 = v102[v107++];
          v106 += String.fromCharCode((v108 & 15) << 12 | (v110 & 63) << 6 | v111 & 63);
        } else {
          if ((v108 & 248) === 240) {
            const v112 = v102[v107++],
              v113 = v102[v107++],
              v114 = v102[v107++];
            let v115 = (v108 & 7) << 18 | (v112 & 63) << 12 | (v113 & 63) << 6 | v114 & 63;
            (v115 -= 65536, v106 += String.fromCharCode(55296 + (v115 >> 10), 56320 + (v115 & 1023)));
          } else v106 += String.fromCharCode(v108);
        }
      }
    }
  }
  return v106;
}

function decryptSourcesPayload(v116, v117, v118) {
  const v122 = base64UrlToBytes(v116),
    v123 = generateKeystream(v117, v118, v122.length),
    v124 = new Uint8Array(v122.length);
  for (let v125 = 0; v125 < v122.length; v125++) v124[v125] = v122[v125] ^ v123[v125];
  for (let v126 = 0; v126 < MAGIC_BYTES.length; v126++) {
    if (v124[v126] !== MAGIC_BYTES[v126]) throw new Error("decrypt failed: bad seed or tampered payload");
  }
  const v127 = v124.subarray(MAGIC_BYTES.length);
  return utf8BytesToString(v127);
}

function getTmdbMeta(v128, v129) {
  return __async(this, null, function*() {
    const v138 = v129 === "tv" ? "tv" : "movie",
      v139 = "https://api.themoviedb.org/3/" + v138 + "/" + v128 + "?api_key=" + TMDB_API_KEY +
      "&append_to_response=external_ids",
      v140 = yield __nvFetch(v139, {
        skipSizeCheck: true
      });
    if (!v140.ok) return null;
    const v141 = yield v140.json(), v142 = v138 === "tv" ? v141.name : v141.title, v143 = v138 === "tv" ?
      v141.first_air_date : v141.release_date, v144 = v143 ? v143.slice(0, 4) : "", v145 = v141
      .external_ids && v141.external_ids.imdb_id || v141.imdb_id || "";
    return {
      title: v142,
      year: v144,
      imdbId: v145
    };
  });
}

function qualityRank(v146) {
  if (!v146) return 0;
  if ((/4k/i).test(v146)) return 2160;
  const v148 = parseInt(v146, 10);
  return Number.isFinite(v148) ? v148 : 0;
}

function formatBytes(v149) {
  if (!v149) return "Unknown";
  const v157 = 1024,
    v158 = ["Bytes", "KB", "MB", "GB", "TB"],
    v159 = Math.floor(Math.log(v149) / Math.log(v157));
  return parseFloat((v149 / Math.pow(v157, v159)).toFixed(2)) + " " + v158[v159];
}
var SEGMENT_SAMPLE_SIZE = 0x5;

function getRealSegmentSize(v160) {
  return __async(this, null, function*() {
    try {
      const v165 = yield __nvFetch(v160, {
        method: "HEAD",
        headers: HEADERS,
        skipSizeCheck: true
      }), v166 = v165.headers.get("content-length");
      if (v166) return parseInt(v166, 10);
    } catch (v167) {}
    try {
      const v168 = yield __nvFetch(v160, {
        headers: __spreadProps(__spreadValues({}, HEADERS), {
          Range: "bytes=0-1"
        }),
        skipSizeCheck: true
      }), v169 = v168.headers.get("content-range"), v170 = v169 && v169.match(/\/(\d+)$/);
      if (v170) return parseInt(v170[1], 10);
    } catch (v171) {}
    return null;
  });
}

function estimateHlsSize(v172) {
  return Promise.resolve("Variable");
}

function getStreams(v173, v174, v175, v176) {
  const v177 = {
    v178: 140,
    v179: 124,
    v180: 175,
    v181: 179,
    v182: 154,
    v183: 181,
    v184: 154,
    v185: 157,
    v186: 125,
    v187: 172
  };
  return __async(this, null, function*() {
    try {
      let v193 = v173;
      if (typeof v173 === "string" && v173.trim().toLowerCase().startsWith("tt")) {
        const v194 = "https://api.themoviedb.org/3/find/" + v173 + "?api_key=" + TMDB_API_KEY +
          "&external_source=imdb_id",
          v195 = yield(yield __nvFetch(v194, {
            skipSizeCheck: true
          })).json(), v196 = v174 === "tv" ? v195.tv_results : v195.movie_results;
        v193 = v196 && v196.length ? v196[0].id : null;
        if (!v193) return [];
      }
      v193 = parseInt(v193, 10);
      if (!v193) return [];
      const v197 = yield getTmdbMeta(v193, v174);
      if (!v197 || !v197.title) return [];
      const v198 = yield getApiHost(), v199 = v174 === "tv", v200 = yield __nvFetch(v198 +
        "/seed?mediaId=" + v193, {
          headers: HEADERS,
          skipSizeCheck: true
        });
      if (!v200.ok) return [];
      const v201 = yield v200.json().catch(() => null);
      if (!v201 || !v201.seed) return [];
      const v202 = new URLSearchParams({
          title: v197.title,
          mediaType: v199 ? "tv" : "movie",
          year: v197.year || "",
          episodeId: String(v199 ? v176 || 1 : 1),
          seasonId: String(v199 ? v175 || 1 : 1),
          tmdbId: String(v193),
          imdbId: v197.imdbId || "",
          enc: "2",
          seed: v201.seed
        }),
        v203 = yield __nvFetch(v198 + "/cdn/sources-with-title?" + v202.toString(), {
          headers: HEADERS,
          skipSizeCheck: true
        });
      if (!v203.ok) return [];
      const v204 = yield v203.text();
      let v205;
      try {
        const v206 = decryptSourcesPayload(v204, v201.seed, v193);
        v205 = JSON.parse(v206);
      } catch (v207) {
        return (console.error("[Cineby] decrypt failed:", v207.message), []);
      }
      const v208 = v205 && v205.sources || [];
      if (!v208.length) return [];
      const v209 = (v205 && v205.subtitles || []).filter(v210 => v210 && v210.url).map(v211 => ({
          url: v211.url,
          lang: v211.lang || v211.language || "Unknown"
        })),
        v212 = yield Promise.all(v208.filter(v213 => v213 && v213.url).map(v214 => __async(this, null,
          function*() {
            const v216 = yield estimateHlsSize(v214.url);
            return {
              url: v214.url,
              quality: v214.quality || "Unknown",
              title: "Cineby " + (v214.quality || "Unknown"),
              name: "Cineby",
              size: v216,
              headers: HEADERS,
              subtitles: v209
            };
          })));
      return (v212.sort((v217, v218) => qualityRank(v218.quality) - qualityRank(v217.quality)), v212);
    } catch (v219) {
      return (console.error("[Cineby]", v219), []);
    }
  });
}
typeof module !== "undefined" && module['exports'] ? module["exports"] = {
  'getStreams': getStreams
} : global['getStreams'] = getStreams;
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
(function() {
  var PROVIDER = "cineby";
  var G = typeof globalThis !== "undefined" ? globalThis : typeof global !== "undefined" ? global : this;

  function settings() {
    try {
      return (G && G.SCRAPER_SETTINGS) || {};
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
    if (!s) return "";
    if (/8k/.test(s)) return "4K";
    if (/2160|4k|uhd/.test(s)) return "4K";
    if (/1440/.test(s)) return "1440p";
    if (/1080|fhd/.test(s)) return "1080p";
    if (/720/.test(s)) return "720p";
    if (/480|360|240|\bsd\b/.test(s)) return "CAM";
    if (/cam|telesync|telecine|\bts\b|\btc\b|screener|dvdscr/.test(s)) return "CAM";
    return "";
  }

  function qFromText(text) {
    var s = String(text || "");
    var m = s.match(/(\d{3,4})\s*p/i);
    if (m) {
      var n = parseInt(m[1], 10);
      if (n >= 2100) return "4K";
      if (n >= 1300) return "1440p";
      if (n >= 1000) return "1080p";
      if (n >= 640) return "720p";
      return "CAM";
    }
    if (/\b8k\b/i.test(s) || /2160|4k|uhd/i.test(s)) return "4K";
    if (/1440p/i.test(s)) return "1440p";
    if (/cam|telesync|telecine|\bts\b|\btc\b|screener|dvdscr/i.test(s)) return "CAM";
    if (/480p|360p|240p|\bsd\b|\bdvdrip\b/i.test(s)) return "CAM";
    if (/\bhd\b/i.test(s)) return "720p";
    return "";
  }
  var qualCache = G.__NV_QUAL_CACHE__ || (G.__NV_QUAL_CACHE__ = {});

  function probeM3u8(url, headers) {
    var now = Date.now();
    var c = qualCache[url];
    if (c && now - c.t < (c.q ? 15 * 60 * 1000 : 3 * 60 * 1000)) {
      return Promise.resolve(c.q);
    }
    var opts = {
      headers: Object.assign({}, headers || {})
    };
    var p = fetch(url, opts).then(function(r) {
      return r.ok ? r.text() : "";
    }).then(function(t) {
      var q = "";
      if (t && t.indexOf("#EXTM3U") !== -1) {
        var best = 0,
          re = /RESOLUTION=(\d+)x(\d+)/gi,
          m;
        while ((m = re.exec(t)) !== null) {
          var h = parseInt(m[2], 10);
          if (h > best) best = h;
        }
        if (best >= 2100) q = "4K";
        else if (best >= 1300) q = "1440p";
        else if (best >= 1000) q = "1080p";
        else if (best >= 640) q = "720p";
        else if (best > 0) q = "CAM";
      }
      qualCache[url] = {
        t: now,
        q: q
      };
      return q;
    }).catch(function() {
      qualCache[url] = {
        t: now,
        q: ""
      };
      return "";
    });
    if (hasTimers()) {
      p = Promise.race([p, new Promise(function(res) {
        var timer = setTimeout(function() {
          res("");
        }, 6000);
        if (typeof timer === "object" && typeof timer.unref === "function") timer.unref();
      })]);
    }
    return p;
  }

  /* ---------- language gate ---------- */
  var BLOCK_RE = new RegExp(
    "\\b(hindi|hin|tamil|telugu|malayalam|mallu|kannada|bengali|bangla|punjabi|marathi|bhojpuri|gujarati|" +
    "odia|assamese|nepali|urdu|sinhala|arabic|ara|farsi|persian|turkish|turkce|espanol|spanish|latino|" +
    "castellano|french|vostfr|german|deutsch|russian|korean|kor|japanese|jpn|chinese|mandarin|cantonese|" +
    "thai|vietnamese|indonesian|bahasa|portuguese|brasileiro|italian|polish|ukrainian|hebrew|" +
    "hungarian|romanian|dutch|flemish|greek|czech|swedish|danish|norwegian|finnish|org)\\b", "i");
  var ALLOW_RE = /\b(english|eng|tagalog|filipino)\b/i;
  var SUB_RE = /\b[a-z0-9]{0,12}subs?\b/gi;
  // NOTE: gate runs on the stream TITLE only (release names / labels).
  // Provider names (e.g. "MallumV") must not trigger the language gate.
  function langAllowed(titleText) {
    var t = String(titleText || "").replace(SUB_RE, " ");
    if (BLOCK_RE.test(t)) return ALLOW_RE.test(t);
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
  var SEEN = G.__NV_SEEN_URLS__ || (G.__NV_SEEN_URLS__ = {});
  // SEEN[nu] = { exp: <ts>, owner: <provider> }
  // - same URL from a DIFFERENT provider within TTL -> dropped (cross-provider dup)
  // - same provider re-querying its own URL -> allowed (repeat opens must still
  //   return rows) and its claim is refreshed
  function claim(nu, now, owner) {
    if (!nu) return true;
    var e = SEEN[nu];
    if (e && e.exp > now && e.owner !== owner) return false;
    SEEN[nu] = {
      exp: now + 120000,
      owner: owner
    };
    return true;
  }

  /* ---------- main ---------- */
  function rank(q) {
    if (q === "4K") return 4;
    if (q === "1440p") return 3.5;
    if (q === "1080p") return 3;
    if (q === "720p") return 2;
    return 0;
  }

  function postProcess(list) {
    var now = Date.now();
    var kept = [];
    var probes = [];
    var rows = [];
    (list || []).forEach(function(s, i) {
      if (!s || !s.url) return;
      if (!langAllowed(s.title)) return;
      var text = (s.name || "") + " " + (s.title || "");
      var isMagnet = /^magnet:/i.test(String(s.url));
      var q = normQ(s.quality) || normQ(String(s.title || "").split("\n")[0]) || qFromText(text);
      var isHlsLike = /m3u8/i.test(String(s.url)) ||
        (!/\.(mp4|mkv|avi|mov|webm|ts|flv|m4v|mp3|aac)(\?|$)/i.test(String(s.url.split("?")[0])) &&
          /^https?:/i.test(String(s.url)));
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
    return Promise.all(probes).then(function(qs) {
      var ranked = [];
      rows.forEach(function(row, k) {
        var q = qs[k];
        if (!q) return; // unknown resolution -> removed
        if (q === "CAM") return; // cam / sd / sub-720 -> removed
        row.s.quality = q;
        ranked.push({
          s: row.s,
          i: row.i,
          q: q
        });
      });
      // best first so dedupe keeps the strongest duplicate (stable)
      ranked.sort(function(a, b) {
        var r = rank(b.q) - rank(a.q);
        if (r !== 0) return r;
        return a.i - b.i;
      });
      var seenLocal = {},
        out = [];
      ranked.forEach(function(row) {
        var s = row.s;
        var nu = normUrl(s.url);
        if (seenLocal[nu]) return;
        if (!claim(nu, now, PROVIDER)) return; // already reported by a different provider
        seenLocal[nu] = 1;
        out.push(s);
      });
      return out.slice(0, 40);
    }).catch(function() {
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
    module.exports.getStreams = function() {
      var args = Array.prototype.slice.call(arguments),
        self = this;

      function finish(v) {
        if (settings().postFilter === false) return v;
        try {
          return postProcess(Array.isArray(v) ? v : []);
        } catch (e) {
          return Array.isArray(v) ? v : [];
        }
      }
      try {
        var r = __orig.apply(self, args);
        if (r && typeof r.then === "function") {
          if (typeof setTimeout === "function") {
            // nv best-settings 4.23.0: hard 8s cap on the whole provider run
            r = Promise.race([r, new Promise(function(res) {
              var dl = setTimeout(function() {
                res([]);
              }, 8000);
              if (dl && typeof dl.unref === "function") dl.unref();
            })]);
          }
          return r.then(function(v) {
            return finish(v);
          }, function() {
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
/* ============================================================
 * nv-plugins WINGS lane v1.0.0 (pack 4.33.0, 2026-09-13)
 * ------------------------------------------------------------
 * Self-contained extraction lane for the vidking/speedracelight
 * backend (same backend the VidEasy/Cineby providers use), ported
 * from the verified cineby.js decryptor and videasy.js request
 * shapes. Live-verified 2026-09-13: Fight Club (movie) 3 rows,
 * Breaking Bad S1E1 (tv) rows, m3u8 payloads return 200 real HLS.
 *
 * Exposes one function: __nvWingsStreams(opts)
 *   opts = { tmdbId, mediaType, season, episode, label, timeoutMs }
 * Returns a Promise<rows[]>; NEVER rejects, NEVER throws.
 * Uses __nvFetch when present, else global fetch.
 * Pure JS: no URLSearchParams, no AbortController, no node APIs.
 * ============================================================ */
(function() {
  'use strict';

  var WINGS_BASE = 'https://api.speedracelight.com';
  var TMDB_KEY = '439c478a771f35c05022f9feabcca01c';
  var WINGS_UA =
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';
  var WINGS_HEADERS = {
    'User-Agent': WINGS_UA,
    'Accept': '*/*',
    'Origin': 'https://www.vidking.net',
    'Referer': 'https://www.vidking.net/',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  };
  var WINGS_SERVERS = ['cdn/sources-with-title', 'm4uhd/sources-with-title', 'lamovie/sources-with-title'];
  var MAGIC = [0x6d, 0x76, 0x6d, 0x31]; /* "mvm1" */
  var SHA_C = [0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4,
    0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174
  ];

  function _f(x) {
    x = x >>> 0;
    x ^= x >>> 16;
    x = Math.imul(x, 0x85ebca6b) >>> 0;
    x ^= x >>> 13;
    x = Math.imul(x, 0xc2b2ae35) >>> 0;
    x = (x ^ (x >>> 16)) >>> 0;
    return x;
  }

  function _rotl(x, n) {
    x = x >>> 0;
    n = n & 31;
    if (n === 0) return x >>> 0;
    return ((x << n) | (x >>> (32 - n))) >>> 0;
  }

  function _branch(n) {
    return ((n * (n + 1)) & 1) === 0;
  }

  function _fnv(s) {
    var h = 0x811c9dc5;
    for (var i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 0x1000193) >>> 0;
    return _f(h);
  }

  function _makeState(seed, mediaId) {
    var slots = new Array(61);
    var s = _f(_fnv(seed) ^ _f(((mediaId >>> 0) ^ 0x9e3779b9) >>> 0)) >>> 0;
    for (var i = 0; i < 8; i++) {
      if (_branch(i)) {
        var idx = s % 61;
        s = _rotl((s + 0x9e3779b9) >>> 0, 7 + (i & 7));
        slots[idx] = (s ^ _f(s)) >>> 0;
        s = _f((s + idx) >>> 0);
      } else {
        slots[i] = SHA_C[i & 15];
      }
    }
    return {
      slots: slots,
      acc: _f((0xa5a5a5a5 ^ s) >>> 0) >>> 0
    };
  }

  function _next(state, counter) {
    var slots = state.slots,
      acc = state.acc;
    var idx = acc % 61;
    var missing = (idx in slots) ? -1 : 0;
    var v = slots[idx] >>> 0;
    var t = ((v ^ Math.imul(0x9e3779b9, counter + 1)) >>> 0) >>> 0;
    var w = (((acc ^ t) >>> 0 | ((acc & t & missing) >>> 0)) >>> 0) >>> 0;
    var u = (_rotl((w + acc) >>> 0, idx & 31) ^ _rotl(acc, Math.imul(idx, 7) & 31)) >>> 0;
    var r = _f((u + 0x9e3779b9) >>> 0);
    slots[idx] = r >>> 0;
    state.acc = r;
    return r >>> 0;
  }

  function _keystream(seed, mediaId, len) {
    var st = _makeState(seed, mediaId);
    var out = new Uint8Array(len);
    var i = 0;
    var wc = 0;
    while (i < len) {
      var w = _next(st, wc++);
      out[i++] = w & 0xff;
      if (i < len) out[i++] = (w >>> 8) & 0xff;
      if (i < len) out[i++] = (w >>> 16) & 0xff;
      if (i < len) out[i++] = (w >>> 24) & 0xff;
    }
    return out;
  }

  function _b64urlToBytes(s) {
    s = String(s).replace(/-/g, '+').replace(/_/g, '/');
    while (s.length % 4 !== 0) s += '=';
    var bin;
    if (typeof atob === 'function') {
      bin = atob(s);
    } else {
      var CH = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
      var clean = '';
      for (var q = 0; q < s.length; q++) {
        var c = s.charAt(q);
        if (c !== '=' && CH.indexOf(c) !== -1) clean += c;
      }
      bin = '';
      for (var w = 0; w < clean.length; w += 4) {
        var a = CH.indexOf(clean.charAt(w)),
          b = CH.indexOf(clean.charAt(w + 1));
        var c2 = w + 2 < clean.length ? CH.indexOf(clean.charAt(w + 2)) : -1;
        var d2 = w + 3 < clean.length ? CH.indexOf(clean.charAt(w + 3)) : -1;
        bin += String.fromCharCode((a << 2) | (b >> 4));
        if (c2 !== -1) bin += String.fromCharCode(((b & 15) << 4) | (c2 >> 2));
        if (d2 !== -1) bin += String.fromCharCode(((c2 & 15) << 6) | d2);
      }
    }
    var out = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i) & 0xff;
    return out;
  }

  function _utf8(bytes, start) {
    var s = '';
    var i = start || 0;
    while (i < bytes.length) {
      var b = bytes[i++];
      if (b < 0x80) s += String.fromCharCode(b);
      else if ((b & 0xe0) === 0xc0) s += String.fromCharCode(((b & 0x1f) << 6) | (bytes[i++] & 0x3f));
      else if ((b & 0xf0) === 0xe0) s += String.fromCharCode(((b & 0x0f) << 12) | ((bytes[i++] & 0x3f) <<
        6) | (bytes[i++] & 0x3f));
      else if ((b & 0xf8) === 0xf0) {
        var cp = ((b & 0x07) << 18) | ((bytes[i++] & 0x3f) << 12) | ((bytes[i++] & 0x3f) << 6) | (bytes[
          i++] & 0x3f);
        cp -= 0x10000;
        s += String.fromCharCode(0xd800 + (cp >> 10), 0xdc00 + (cp & 0x3ff));
      } else s += String.fromCharCode(b);
    }
    return s;
  }

  function wingsDecrypt(payloadB64, seed, mediaId) {
    var bytes = _b64urlToBytes(payloadB64);
    var ks = _keystream(seed, mediaId, bytes.length);
    for (var i = 0; i < bytes.length; i++) bytes[i] = (bytes[i] ^ ks[i]) & 0xff;
    for (var m = 0; m < MAGIC.length; m++) {
      if (bytes[m] !== MAGIC[m]) throw new Error('wings decrypt failed: bad magic');
    }
    return _utf8(bytes, MAGIC.length);
  }

  function _fetchX(url, opts) {
    var f = (typeof __nvFetch === 'function') ? __nvFetch : (typeof fetch === 'function' ? fetch : null);
    if (!f) return Promise.reject(new Error('no fetch'));
    return f(url, opts);
  }

  function _race(p, ms, fallback) {
    if (typeof setTimeout !== 'function') {
      /* device QuickJS ships no timers - the timer leg must never throw */
      return Promise.resolve(p).then(function(v) {
        return v;
      }, function() {
        return fallback;
      });
    }
    return new Promise(function(resolve) {
      var done = false;
      var t = setTimeout(function() {
        if (!done) {
          done = true;
          resolve(fallback);
        }
      }, ms);
      if (t && typeof t.unref === 'function') t.unref();
      Promise.resolve(p).then(function(v) {
          if (!done) {
            done = true;
            clearTimeout(t);
            resolve(v);
          }
        },
        function() {
          if (!done) {
            done = true;
            clearTimeout(t);
            resolve(fallback);
          }
        });
    });
  }

  function _jsonText(resp) {
    return Promise.resolve(resp.text()).catch(function() {
      return '';
    });
  }

  function wingsTmdbMeta(tmdbId, mediaType) {
    var url = 'https://api.themoviedb.org/3/' + (mediaType === 'tv' ? 'tv' : 'movie') + '/' +
      parseInt(tmdbId, 10) + '?api_key=' + TMDB_KEY + '&append_to_response=external_ids';
    return _race(
      _fetchX(url, {
        headers: {
          'User-Agent': WINGS_UA,
          'Accept': 'application/json'
        }
      })
      .then(function(r) {
        return r.ok ? r.json() : null;
      })
      .then(function(j) {
        if (!j) return null;
        return {
          title: mediaType === 'tv' ? j.name : j.title,
          year: ((mediaType === 'tv' ? j.first_air_date : j.release_date) || '').substring(0, 4),
          imdbId: (j.external_ids && j.external_ids.imdb_id) || j.imdb_id || ''
        };
      }),
      6000, null);
  }

  function wingsQueryServer(serverPath, seed, meta, mediaType, season, episode, tmdbId) {
    var params = 'title=' + encodeURIComponent(meta.title || '') +
      '&mediaType=' + (mediaType === 'tv' ? 'tv' : 'movie') +
      '&year=' + encodeURIComponent(String(meta.year || '')) +
      '&episodeId=' + String(mediaType === 'tv' ? (episode || 1) : 1) +
      '&seasonId=' + String(mediaType === 'tv' ? (season || 1) : 1) +
      '&tmdbId=' + String(tmdbId) +
      '&imdbId=' + encodeURIComponent(meta.imdbId || '') +
      '&enc=2&seed=' + encodeURIComponent(seed);
    return _fetchX(WINGS_BASE + '/' + serverPath + '?' + params, {
        headers: WINGS_HEADERS
      })
      .then(function(r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.text();
      })
      .then(function(txt) {
        if (!txt || !txt.length) throw new Error('empty');
        var json = wingsDecrypt(txt, seed, parseInt(tmdbId, 10));
        var obj = JSON.parse(json);
        return obj;
      });
  }

  function wingsNormQuality(q) {
    var s = String(q || '').toLowerCase();
    if (s.indexOf('2160') !== -1 || s.indexOf('4k') !== -1) return '4K';
    if (s.indexOf('1440') !== -1) return '1440p';
    if (s.indexOf('1080') !== -1) return '1080p';
    if (s.indexOf('720') !== -1) return '720p';
    if (s.indexOf('480') !== -1) return '480p';
    return 'Auto';
  }

  /**
   * __nvWingsStreams(opts) -> Promise<rows[]>
   */
  function __nvWingsStreams(opts) {
    opts = opts || {};
    var label = opts.label || 'Wings';
    var timeoutMs = opts.timeoutMs || 20000;
    try {
      var tmdbId = parseInt(String(opts.tmdbId || '').replace(/\D/g, ''), 10);
      if (!tmdbId) return Promise.resolve([]);
      var mediaType = opts.mediaType === 'tv' || opts.mediaType === 'series' ? 'tv' : 'movie';
      return wingsTmdbMeta(tmdbId, mediaType).then(function(meta) {
        if (!meta || !meta.title) return [];
        return _fetchX(WINGS_BASE + '/seed?mediaId=' + tmdbId, {
            headers: WINGS_HEADERS
          })
          .then(function(r) {
            if (r.ok) return r.json();
            if (r.status === 429 || r.status === 503) {
              /* seed endpoint rate-limits bursts; on the serialized device bridge
                 the immediate retry lands past the burst window */
              return _fetchX(WINGS_BASE + '/seed?mediaId=' + tmdbId, {
                  headers: WINGS_HEADERS
                })
                .then(function(r2) {
                  return r2.ok ? r2.json() : null;
                }, function() {
                  return null;
                });
            }
            return null;
          })
          .then(function(j) {
            if (!j || !j.seed) throw new Error('no seed');
            var seed = j.seed;
            var jobs = WINGS_SERVERS.map(function(sp) {
              return wingsQueryServer(sp, seed, meta, mediaType, opts.season, opts.episode,
                  tmdbId)
                .then(function(o) {
                  return o;
                }, function() {
                  return null;
                });
            });
            /* collect PARTIAL results: never gate on the slowest server.
             * undefined = still pending, null = failed, object = success. */
            return new Promise(function(resolve) {
              var results = new Array(jobs.length);
              var done = false;
              var t = null;
              if (typeof setTimeout === 'function') {
                /* device QuickJS ships no timers - guard every timer use */
                t = setTimeout(function() {
                  if (!done) {
                    done = true;
                    resolve(results);
                  }
                }, Math.max(6000, timeoutMs - 2500));
                if (t && typeof t.unref === 'function') t.unref();
              }
              var pending = jobs.length;
              var settle = function() {
                if (!done) {
                  done = true;
                  if (t) clearTimeout(t);
                  resolve(results);
                }
              };
              jobs.forEach(function(jp, idx) {
                Promise.resolve(jp).then(function(obj) {
                  results[idx] = obj;
                  pending--;
                  if (pending <= 0) settle();
                }, function() {
                  results[idx] = null;
                  pending--;
                  if (pending <= 0) settle();
                });
              });
            }).then(function(results) {
              results = results || [];
              var seen = {};
              var rows = [];
              for (var i = 0; i < results.length; i++) {
                var obj = results[i];
                if (!obj) continue;
                var subs = (obj.subtitles || []).filter(function(s) {
                    return s && s.url;
                  })
                  .map(function(s) {
                    return {
                      url: s.url,
                      language: s.lang || s.language || 'en',
                      name: s.language || s.lang || 'English'
                    };
                  });
                var srcs = obj.sources || [];
                for (var k = 0; k < srcs.length; k++) {
                  var src = srcs[k];
                  if (!src || !src.url) continue;
                  if (seen[src.url]) continue;
                  seen[src.url] = true;
                  var q = wingsNormQuality(src.quality);
                  rows.push({
                    name: label + ' | ' + q,
                    title: label + ' ' + q + (mediaType === 'tv' ? ' S' + (opts.season || 1) +
                      'E' + (opts.episode || 1) : ''),
                    url: src.url,
                    quality: q,
                    headers: {
                      'User-Agent': WINGS_UA,
                      'Referer': 'https://www.vidking.net/',
                      'Origin': 'https://www.vidking.net'
                    },
                    subtitles: subs
                  });
                }
              }
              rows.sort(function(a, b) {
                var order = {
                  '4K': 4,
                  '1440p': 3,
                  '1080p': 2,
                  '720p': 1
                };
                return (order[b.quality] || 0) - (order[a.quality] || 0);
              });
              return rows;
            });
          });
      }).catch(function() {
        return [];
      });
    } catch (e) {
      return Promise.resolve([]);
    }
  }

  if (typeof globalThis !== 'undefined') globalThis.__nvWingsStreams = __nvWingsStreams;
})();
/* ===== nv-plugins device waterfall merge v2.0.0 (pack 4.37.0, 2026-09-14) ======
   Device truth (NuvioMobile PluginRuntime.kt + quickjs-kt 1.0.5-nuvio AAR):
   no timers in the realm (every Promise.race cap was inert or threw
   ReferenceError), each fetch is one BLOCKING host call (lanes run
   sequentially regardless of Promise.all), app kills the call at 60s. The
   old 4.33.0 merge ran BOTH lanes on every call and its cap() called
   setTimeout DIRECTLY -> the whole provider rejected -> 0 rows.
   v2.0.0: sequential waterfall bounded by fetch count, fail-soft both lanes.
     __WINGS_FIRST = false : native first, WINGS lane as fallback
   ========================================================================== */
(function() {
  'use strict';
  var __LABEL = 'Cineby';
  var __WINGS_FIRST = false;
  var __ALT_NAME = '__nvWingsStreams';

  function __junk(u) {
    return /tungtungtungsahur\.cfd|\/api\?d=/i.test(String(u || ''));
  }
  var __orig = null;
  try {
    __orig = module.exports && module.exports.getStreams;
  } catch (e) {
    __orig = null;
  }
  if (typeof __orig !== 'function') return;

  function runAlt(args, self) {
    var f = null;
    try {
      f = (typeof globalThis !== 'undefined' && globalThis) ? globalThis[__ALT_NAME] : null;
    } catch (e) {
      f = null;
    }
    if (typeof f !== 'function') return Promise.resolve([]);
    try {
      var r = f({
        tmdbId: args[0],
        mediaType: args[1],
        season: args[2],
        episode: args[3],
        label: __LABEL
      });
      return Promise.resolve(r).then(function(v) {
        return Array.isArray(v) ? v : [];
      }, function() {
        return [];
      });
    } catch (e) {
      return Promise.resolve([]);
    }
  }

  function runNative(args, self) {
    try {
      var r = __orig.apply(self, args);
      return Promise.resolve(r).then(function(v) {
        return Array.isArray(v) ? v : [];
      }, function() {
        return [];
      });
    } catch (e) {
      return Promise.resolve([]);
    }
  }
  module.exports.getStreams = function() {
    var args = Array.prototype.slice.call(arguments),
      self = this;

    function clean(v) {
      var seen = {},
        out = [];
      (v || []).forEach(function(r) {
        if (!r || !r.url || __junk(r.url)) return;
        var k = String(r.url);
        if (seen[k]) return;
        seen[k] = 1;
        out.push(r);
      });
      return out;
    }

    function laneA() {
      return __WINGS_FIRST ? runAlt(args, self) : runNative(args, self);
    }

    function laneB() {
      return __WINGS_FIRST ? runNative(args, self) : runAlt(args, self);
    }
    return Promise.resolve().then(laneA).then(function(rows) {
      rows = clean(rows);
      if (rows.length) return rows;
      return Promise.resolve().then(laneB).then(function(rows2) {
        return clean(rows2);
      });
    });
  };
})();
