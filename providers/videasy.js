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
/* nv-plugins videasy.js v2.2.0 (pack 4.33.0, 2026-09-13): device-timeout fix - the 10-server race widened 6.8s -> 9s and the hard tail cap 12s -> 20s: on mobile networks TMDB+seed+servers exceeded 12s, the tail returned [], and the sheet showed nothing. */
/* ============================================================
 * AIO-EXACT DECODE (2026-09-13) - fully deobfuscated from
 * All-in-One-Nuvio upstream, all string-table references resolved
 * to literals, syntax-checked, live-verified against upstream.
 * Replaces the previous port whose extraction returned 0 rows.
 * ============================================================ */
var __async = (v1, v2, v3) => {
    return new Promise((v4, v5) => {
      var v8 = v9 => {
          try {
            v11(v3.next(v9));
          } catch (v12) {
            v5(v12);
          }
        },
        v13 = v14 => {
          try {
            v11(v3.throw(v14));
          } catch (v15) {
            v5(v15);
          }
        },
        v11 = v16 => v16.done ? v4(v16.value) : Promise.resolve(v16.value).then(v8, v13);
      v11((v3 = v3.apply(v1, v2)).next());
    });
  },
  TMDB_API_KEY = "439c478a771f35c05022f9feabcca01c",
  TMDB_BASE_URL = "https://api.themoviedb.org/3",
  WINGS_API_BASE = "https://api.speedracelight.com",
  USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  REQUEST_HEADERS = {
    "User-Agent": USER_AGENT,
    Accept: "*/*",
    Origin: "https://www.vidking.net",
    Referer: "https://www.vidking.net/",
    "Cache-Control": "no-cache, no-store, must-revalidate",
    Pragma: "no-cache",
    Expires: "0"
  },
  SERVERS = {
    Hydrogen: {
      path: "cdn/sources-with-title"
    },
    Titanium: {
      path: "tejo/sources-with-title"
    },
    Oxygen: {
      path: "neon2/sources-with-title"
    },
    Lithium: {
      path: "downloader2/sources-with-title"
    },
    Krypton: {
      path: "ym/sources-with-title"
    },
    Carbon: {
      path: "mb-flix/sources-with-title"
    },
    Aluminium: {
      path: "lamovie/sources-with-title"
    },
    Nitrogen: {
      path: "m4uhd/sources-with-title"
    },
    Neon: {
      path: "superflix/sources-with-title"
    },
    Helium: {
      path: "1movies/sources-with-title"
    }
  },
  jl = [1116352408, 1899447441, 3049323471, 3921009573, 961987163, 1508970993, 2453635748, 2870763221,
    3624381080, 310598401, 607225278, 1426881987, 1925078388, 2162078206, 2614888103, 3248222580
  ],
  Tf = [1732584193, 4023233417, 2562383102, 271733878],
  Js = 61,
  _f = 8,
  ms = 2654435769,
  Ys = [109, 118, 109, 49],
  Sf = v17 => (v17 * (v17 + 1) & 1) === 0,
  bf = v18 => (v18 * (v18 + 1) & 1) === 1;

function ui(v19) {
  return (v19 >>>= 0, v19 ^= v19 >>> 16, v19 = Math.imul(v19, 2246822507) >>> 0, v19 ^= v19 >>> 13, v19 = Math
    .imul(v19, 3266489909) >>> 0, v19 ^= v19 >>> 16, v19 >>> 0);
}

function ps(v20, v21) {
  return (v20 >>>= 0, v21 &= 31, v21 === 0 ? v20 >>> 0 : (v20 << v21 | v20 >>> 32 - v21) >>> 0);
}

function If(v22) {
  let v26 = Tf[0] >>> 0;
  for (let v27 = 0; v27 < v22.length; v27++) {
    v26 = ps((v26 ^ Math.imul(v22.charCodeAt(v27), jl[v27 & 15])) >>> 0, 5);
  }
  return ui(v26);
}

function Af(v28) {
  const v29 = new Array(256);
  for (let v30 = 0; v30 < 256; v30++) v29[v30] = v30;
  let v31 = 0;
  for (let v32 = 0; v32 < 256; v32++) {
    v31 = v31 + v29[v32] + v28.charCodeAt(v32 % v28.length) & 255;
    const v33 = v29[v32];
    (v29[v32] = v29[v31], v29[v31] = v33);
  }
  return v29;
}

function wf(v34) {
  let v37 = 2166136261;
  for (let v38 = 0; v38 < v34.length; v38++) {
    v37 = Math.imul(v37 ^ v34.charCodeAt(v38), 16777619) >>> 0;
  }
  return ui(v37);
}

function vf(v39, v40, v41) {
  return ((v39 ^ v40) >>> 0 | (v39 & v40 & v41) >>> 0) >>> 0;
}

function Nf(v42, v43) {
  if (bf(v42.length)) return {
    S: Af(v42),
    acc: If(v42)
  };
  const v44 = new Array(Js);
  let v45 = ui(wf(v42) ^ ui(v43 >>> 0 ^ ms)) >>> 0;
  for (let v46 = 0; v46 < _f; v46++) {
    if (Sf(v46)) {
      const v47 = v45 % Js;
      (v45 = ps(v45 + ms >>> 0, 7 + (v46 & 7)), v44[v47] = (v45 ^ ui(v45)) >>> 0, v45 = ui(v45 + v47 >>> 0));
    } else v44[v46] = jl[v46 & 15];
  }
  return {
    S: v44,
    acc: ui(v45 ^ 2779096485) >>> 0
  };
}

function Rf(v48, v49) {
  const v52 = v48.S;
  let v53 = v48.acc;
  const v54 = v53 % Js,
    v55 = 0 - +((v54 in v52)),
    v56 = v52[v54] >>> 0,
    v57 = Math.imul(ms, v49 + 1) >>> 0;
  let v58 = vf(v53, (v56 ^ v57) >>> 0, v55);
  return (v58 = (ps(v58 + v53 >>> 0, v54 & 31) ^ ps(v53, Math.imul(v54, 7) & 31)) >>> 0, v53 = ui(v58 + ms >>>
    0), v52[v54] = v53 >>> 0, v48.acc = v53, v53 >>> 0);
}

function Cf(v59, v60, v61) {
  const v62 = Nf(v59, v60),
    v63 = new Uint8Array(v61);
  let v64 = 0;
  for (let v65 = 0; v65 < v61;) {
    const v66 = Rf(v62, v64++);
    (v63[v65++] = v66 & 255, v65 < v61 && (v63[v65++] = v66 >>> 8 & 255), v65 < v61 && (v63[v65++] = v66 >>>
      16 & 255), v65 < v61 && (v63[v65++] = v66 >>> 24 & 255));
  }
  return v63;
}

function decodeBase64(v67) {
  const v71 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",
    v72 = v67.replace(/-/g, "+").replace(/_/g, "/").replace(/=+$/, ""),
    v73 = v72.length,
    v74 = new Uint8Array(Math.floor(v73 * 0.75));
  let v75 = 0;
  for (let v76 = 0; v76 < v73; v76 += 4) {
    const v77 = v71.indexOf(v72[v76]),
      v78 = v71.indexOf(v72[v76 + 1] || "A"),
      v79 = v71.indexOf(v72[v76 + 2] || "A"),
      v80 = v71.indexOf(v72[v76 + 3] || "A");
    v74[v75++] = v77 << 2 | v78 >> 4;
    if (v76 + 2 < v73) v74[v75++] = (v78 & 15) << 4 | v79 >> 2;
    if (v76 + 3 < v73) v74[v75++] = (v79 & 3) << 6 | v80;
  }
  return v74;
}

function xf(v81) {
  return decodeBase64(v81);
}

function decryptWingsDatabase(v82, v83, v84) {
  const v88 = xf(v82),
    v89 = Cf(v83, v84, v88.length);
  for (let v90 = 0; v90 < v88.length; v90++) v88[v90] ^= v89[v90];
  for (let v91 = 0; v91 < Ys.length; v91++) {
    if (v88[v91] !== Ys[v91]) throw new Error("decrypt failed: bad seed or tampered payload");
  }
  let v92 = "";
  const v93 = v88.subarray(Ys.length);
  for (let v94 = 0; v94 < v93.length;) {
    const v95 = v93[v94++];
    if (v95 < 128) v92 += String.fromCharCode(v95);
    else {
      if (v95 > 191 && v95 < 224) v92 += String.fromCharCode((v95 & 31) << 6 | v93[v94++] & 63);
      else v95 > 223 && v95 < 240 ? v92 += String.fromCharCode((v95 & 15) << 12 | (v93[v94++] & 63) << 6 |
        v93[v94++] & 63) : v92 += String.fromCharCode((v95 & 7) << 18 | (v93[v94++] & 63) << 12 | (v93[
        v94++] & 63) << 6 | v93[v94++] & 63);
    }
  }
  return v92;
}

function fetchMediaDetails(v96, v97, v98, v99) {
  const v100 = {
    v101: 527,
    v102: 546,
    v103: 456,
    v104: 504,
    v105: 518,
    v106: 472,
    v107: 471,
    v108: 514,
    v109: 482
  };
  return __async(this, null, function*() {
    var v110;
    let v111 = v97 === "tv" ? "45 min" : "90 min";
    try {
      const v112 = v97 === "tv" ? "tv" : "movie",
        v113 = String(v96).replace(/\D/g, ""),
        v114 = TMDB_BASE_URL + "/" + v112 + "/" + v113 + "?api_key=" + TMDB_API_KEY +
        "&append_to_response=external_ids",
        v115 = yield fetch(v114, {
          headers: {
            "User-Agent": REQUEST_HEADERS["User-Agent"],
            Accept: "application/json"
          }
        });
      if (!v115.ok) throw new Error("TMDB HTTP " + v115.status);
      const v116 = yield v115.json();
      let v117 = v111;
      if (v97 === "movie" && v116.runtime) v117 = v116.runtime + " min";
      else {
        if (v97 === "tv" && v98 != null && v99 != null) {
          const v118 = TMDB_BASE_URL + "/tv/" + v113 + "/season/" + v98 + "/episode/" + v99 +
            "?api_key=" + TMDB_API_KEY,
            v119 = yield fetch(v118);
          if (v119.ok) {
            const v120 = yield v119.json();
            if (v120 && v120.runtime) v117 = v120.runtime + " min";
            else v116.episode_run_time && v116.episode_run_time.length > 0 && (v117 = v116
              .episode_run_time[0] + " min");
          }
        }
      }
      return {
        title: v97 === "tv" ? v116.name : v116.title,
        year: (v97 === "tv" ? v116.first_air_date : v116.release_date || "").substring(0, 4),
        imdbId: ((v110 = v116.external_ids) == null ? void 0 : v110.imdb_id) || null,
        mediaType: v97,
        duration: v117
      };
    } catch (v121) {
      return (console.error("[VidEasy] TMDB details fetch error: " + v121.message), {
        title: v97 === "tv" ? "Unknown TV Show" : "Unknown Movie",
        year: "N/A",
        imdbId: null,
        mediaType: v97,
        duration: v111
      });
    }
  });
}

function getLangCode(v122) {
  if (!v122) return "en";
  const v125 = {
    english: "en",
    spanish: "es",
    french: "fr",
    german: "de",
    italian: "it",
    portuguese: "pt",
    "portuguese (br)": "pt-br",
    arabic: "ar",
    japanese: "ja",
    korean: "ko",
    tamil: "ta",
    telugu: "te",
    malayalam: "ml",
    kannada: "kn",
    hindi: "hi",
    polish: "pl",
    greek: "el",
    croatian: "hr",
    ukrainian: "uk",
    lithuanian: "lt",
    thai: "th",
    estonian: "et",
    czech: "cs",
    "zh-tw": "zh-tw",
    "bokmål": "no",
    dutch: "nl",
    indonesian: "id",
    sinhala: "si",
    swedish: "sv",
    romanian: "ro",
    malay: "ms",
    persian: "fa",
    slovak: "sk",
    bulgarian: "bg",
    turkish: "tr",
    danish: "da",
    hebrew: "he",
    serbian: "sr",
    vietnamese: "vi",
    hungarian: "hu",
    icelandic: "is",
    albanian: "sq",
    bosnian: "bs",
    slovenian: "sl",
    bengali: "bn",
    macedonian: "mk"
  };
  return v125[v122.toLowerCase().trim()] || "en";
}

function formatStreamsForNuvio(v126, v127, v128, v129, v130) {
  const v134 = {
    v135: 538,
    v136: 546,
    v137: 528,
    v138: 553,
    v139: 512,
    v140: 468,
    v141: 474,
    v142: 532,
    v143: 537,
    v144: 479,
    v145: 521,
    v146: 512,
    v147: 519,
    v148: 512,
    v149: 494,
    v150: 534,
    v151: 508,
    v152: 454,
    v153: 450,
    v154: 523
  };
  try {
    const v155 = JSON.parse(v126);
    if (!v155 || typeof v155 !== "object") return [];
    const v156 = {
        Referer: "https://www.vidking.net/",
        Origin: "https://www.vidking.net",
        "User-Agent": USER_AGENT
      },
      v157 = (v155.subtitles || []).map(v158 => ({
        url: v158.url,
        language: getLangCode(v158.language || v158.lang),
        name: v158.language || v158.lang || "English",
        headers: v156
      })),
      v159 = {
        Carbon: "💎",
        Helium: "🎈",
        Lithium: "🔋",
        Oxygen: "💨",
        Krypton: "🦸",
        Titanium: "🛡️",
        Hydrogen: "💧",
        Nitrogen: "🌿",
        Neon: "💡",
        Aluminium: "💿"
      },
      v160 = v159[v127] || "🎬",
      v161 = {
        Hydrogen: "CDN",
        Titanium: "Tejo",
        Oxygen: "Neon2",
        Lithium: "Downloader2",
        Krypton: "YM",
        Carbon: "MB-Flix",
        Aluminium: "LaMovie",
        Nitrogen: "M4UHD",
        Neon: "SuperFlix",
        Helium: "1Movies"
      },
      v162 = v161[v127] || v127,
      v163 = [];
    return ((v155.sources || []).forEach(v164 => {
      if (!v164.url) return;
      let v165 = v164.quality || "1080p",
        v166 = v165.replace(/\s*server\s*2\s*$/gi, "").trim();
      v127 === "Oxygen" && (v166 = "Auto");
      let v167 = v166.toLowerCase(),
        v168 = "⚡ " + v166;
      if (v167.includes("2160") || v167.includes("4k")) v168 = "🌟 2160p";
      else {
        if (v167.includes("1080")) v168 = "🔥 1080p";
        else {
          if (v167.includes("720")) v168 = "⚡ 720p";
          else v167 === "auto" && (v168 = "⚡ Auto");
        }
      }
      let v169 = "Original Audio",
        v170 = "🌍 Original Audio";
      if (v127 === "Hydrogen" || v127 === "Krypton")(v169 = "Original Audio", v170 =
        "🌍 Original Audio");
      else {
        if (v127 === "Oxygen")(v169 = "Multi-Audio", v170 = "🌍 Multi-Audio");
        else {
          if (v127 === "Aluminium")(v169 = "Dual-Audio", v170 = "🌍 Dual-Audio");
          else {
            if (v127 === "Magnesium") {
              const v171 = (v164.title || "").toLowerCase();
              v171.includes("bengali") || v171.includes("bangla") ? (v169 = "Bengali", v170 =
                "🇧🇩 Bengali") : (v169 = "Normal Hindi", v170 = "🇮🇳 Hindi");
            }
          }
        }
      }
      const v172 = v164.url.includes(".m3u8") ? "M3U8" : v164.url.includes(".mp4") ? "MP4" : "MKV",
        v173 = v128.title + (v128.mediaType === "tv" ? " S" + v129 + "E" + v130 : "");
      let v174 = v127;
      v174 === "Krypton" && (v174 = v174.replace(/\s*(1080p\s+)?server\s*2\s*$/gi, "").trim());
      const v175 = "🎬 " + v173 + " - (" + v128.year + ")\n" + v168 + " | " + v170 + " | 🎧 AAC\n🎞️ " +
        v172 + " | ⏱️ " + v128.duration + "\n" + v160 + " " + v174 + " | 🔗 Provider: " + v162;
      v163.push({
        name: "VidEasy | " + v166 + " | " + v169,
        title: v175,
        size: v175,
        description: v175,
        url: v164.url,
        quality: "",
        language: "",
        headers: v156,
        subtitles: v157,
        provider: "videasy",
        _is4k: v167.includes("2160") || v167.includes("4k"),
        _serverName: v127
      });
    }), v163);
  } catch (v176) {
    return (console.error("[VidEasy] Formatting error: " + v176.message), []);
  }
}

function fetchFromWingsServer(v177, v178, v179, v180, v181, v182, v183, v184) {
  return __async(this, null, function*() {
    const v190 = {
        title: v181.title,
        mediaType: v179,
        year: String(v181.year),
        episodeId: String(v184 || 1),
        seasonId: String(v183 || 1),
        tmdbId: String(v180),
        imdbId: v181.imdbId || "",
        enc: "2",
        seed: v182
      },
      v191 = Object.keys(v190).map(v192 => encodeURIComponent(v192) + "=" + encodeURIComponent(v190[
        v192])).join("&"),
      v193 = WINGS_API_BASE + "/" + v178.path + "?" + v191;
    console.log("[VidEasy] Querying server " + v177 + ": " + v193);
    try {
      const v194 = yield fetch(v193, {
        headers: REQUEST_HEADERS
      });
      if (!v194.ok) throw new Error("HTTP " + v194.status);
      const v195 = yield v194.text();
      if (!v195 || v195.trim() === "") throw new Error("Empty response");
      const v196 = decryptWingsDatabase(v195, v182, Number(v180));
      if (!v196) return [];
      const v197 = formatStreamsForNuvio(v196, v177, v181, v183, v184);
      return (console.log("[VidEasy] ✅ Found " + v197.length + " stream(s) from " + v177), v197);
    } catch (v198) {
      return (console.warn("[VidEasy] ❌ Error from " + v177 + ": " + v198.message), []);
    }
  });
}

function getStreams(v199, v200, v201 = null, v202 = null) {
  return __async(this, null, function*() {
    console.log("[VidEasy] Starting extraction for TMDB ID: " + v199 + ", Type: " + v200 + (v200 ===
      "tv" ? ", S:" + v201 + "E:" + v202 : ""));
    try {
      const v217 = yield fetchMediaDetails(v199, v200, v201, v202);
      if (!v217) return (console.error("[VidEasy] Failed to fetch media details from TMDB."), []);
      console.log("[VidEasy] Media Details: \"" + v217.title + "\" (" + v217.year + ") | Duration: " +
        v217.duration);
      const v218 = WINGS_API_BASE + "/seed?mediaId=" + v199;
      console.log("[VidEasy] Fetching seed from: " + v218);
      var v219 = yield fetch(v218, {
        headers: REQUEST_HEADERS
      });
      if (!v219.ok && (v219.status === 429 || v219.status === 503)) {
        v219 = yield fetch(v218, {
          headers: REQUEST_HEADERS
        });
      }
      if (!v219.ok) throw new Error("Seed HTTP " + v219.status);
      const v220 = yield v219.json(), v221 = v220.seed;
      if (!v221) throw new Error("No seed returned from API");
      console.log("[VidEasy] Seed successfully retrieved: " + v221);
      const v222 = Object.keys(SERVERS).map(v223 => {
          const v224 = SERVERS[v223];
          return fetchFromWingsServer(v223, v224, v200, v199, v217, v221, v201, v202).catch(() => []);
        }),
        v225 = [];
      var _0xpushPartial = v226 => {
        if (Array.isArray(v226)) v225.push.apply(v225, v226);
      };
      v222.forEach(v226 => {
        v226.then(_0xpushPartial).catch(() => {});
      });
      yield typeof setTimeout === "function" ? Promise.race([Promise.all(v222), new Promise(_0xdlRes => {
        var _0xdlT = setTimeout(() => _0xdlRes(1), 9000);
        if (_0xdlT && typeof _0xdlT.unref === "function") _0xdlT.unref();
      })]) : Promise.all(v222);
      const v227 = [],
        v228 = new Set();
      v225.forEach(v229 => {
        !v228.has(v229.url) && (v228.add(v229.url), v227.push(v229));
      });
      const v230 = Object.keys(SERVERS);
      return (v227.sort((v231, v232) => {
        if (v231._is4k && !v232._is4k) return -1;
        if (!v231._is4k && v232._is4k) return 1;
        const v233 = v230.indexOf(v231._serverName),
          v234 = v230.indexOf(v232._serverName);
        return v233 - v234;
      }), console.log("[VidEasy] Total unique streams found: " + v227.length), v227);
    } catch (v235) {
      return (console.error("[VidEasy] Error in getStreams: " + v235.message), []);
    }
  });
}
module["exports"] = {
  'getStreams': getStreams
};
/* ===== nvio light deadline wrapper (12s) =================================
   Bounds the provider's total runtime so the stream sheet is never held
   past ~9s (AIO parity). No filtering: rows pass through unchanged.
   Opt-out: set SCRAPER_SETTINGS.postFilter = false. ==================== */
(function() {
  var G = typeof globalThis !== "undefined" ? globalThis : this;
  try {
    var __orig = module.exports && module.exports.getStreams;
    if (typeof __orig !== "function") return;
    module.exports.getStreams = function() {
      var args = arguments,
        self = this;

      function timed() {
        var base = Promise.resolve(__orig.apply(self, args))
          .then(function(rows) {
            return Array.isArray(rows) ? rows : [];
          })
          .catch(function() {
            return [];
          });
        if (typeof setTimeout !== "function") return base; /* device: no timers */
        return Promise.race([
          base,
          new Promise(function(res) {
            var t = setTimeout(function() {
              res([]);
            }, 20000);
            if (typeof t === "object" && typeof t.unref === "function") t.unref();
          })
        ]).catch(function() {
          return [];
        });
      }
      try {
        var pf = G.SCRAPER_SETTINGS && G.SCRAPER_SETTINGS.postFilter;
        if (pf === false) return Promise.resolve(__orig.apply(self, args)).catch(function() {
          return [];
        });
      } catch (e) {}
      return timed();
    };
  } catch (e) {}
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
  var __LABEL = 'VidEasy';
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
