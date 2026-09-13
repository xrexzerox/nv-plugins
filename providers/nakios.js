/*
 * nv-plugins nakios.js — rebased on the CURRENT All-in-One-Nuvio upstream file (4.26.0 sync pass).
 * Upstream version: 3.8.2. Decoded + identifier-normalized, zero obfuscator remnants.
 * nv tail re-attached: fail-open quality gate (4.26.0), en/tl language gate, cross-provider dedupe.
 */
var TMDB_KEY = "f3d757824f08ea2cff45eb8f47ca3a1e";
var NAKIOS_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
var DOMAINS_URL = "https://raw.githubusercontent.com/wooodyhood/nuvio-repo/main/domains.json";
var NAKIOS_FALLBACK = "click";
var _cachedEndpoint = null;
function getTmdbMetadata(v1, v2) {
  var v3 = "https://api.themoviedb.org/3/" + (v2 === "tv" ? "tv" : "movie") + "/" + v1 + "?api_key=" + TMDB_KEY + "&language=en-US";
  return fetch(v3).then(function (v4) {
    return v4.json();
  }).then(function (v5) {
    var v6 = v5.title || v5.name || "Nakios";
    var v7 = v5.release_date || v5.first_air_date || "";
    var v8 = v7 ? v7.split("-")[0] : "";
    var v9 = "";
    if (v2 === "movie" && v5.runtime) {
      v9 = v5.runtime + " min";
    } else if (v2 === "tv" && v5.episode_run_time && v5.episode_run_time.length > 0) {
      v9 = v5.episode_run_time[0] + " min";
    }
    return {
      name: v6,
      year: v8,
      duration: v9
    };
  }).catch(function () {
    return {
      name: "Nakios",
      year: "",
      duration: ""
    };
  });
}
function getEpisodeInfo(v10, v11, v12) {
  if (!v10 || !v11 || !v12) {
    return Promise.resolve(null);
  }
  var v13 = "https://api.themoviedb.org/3/tv/" + v10 + "/season/" + v11 + "/episode/" + v12 + "?api_key=" + TMDB_KEY + "&language=en-US";
  return fetch(v13).then(function (v14) {
    return v14.json();
  }).then(function (v15) {
    return {
      name: v15.name || null,
      duration: v15.runtime ? v15.runtime + " min" : null
    };
  }).catch(function () {
    return null;
  });
}
function buildEndpoint(v16) {
  var v17 = v16.includes("nakios") ? v16 : "nakios." + v16;
  return {
    base: "https://" + v17,
    api: "https://api." + v17 + "/api",
    referer: "https://" + v17 + "/"
  };
}
function detectEndpoint() {
  if (_cachedEndpoint) {
    return Promise.resolve(_cachedEndpoint);
  }
  return fetch(DOMAINS_URL).then(function (v18) {
    if (v18.ok) {
      return v18.json();
    } else {
      return Promise.reject();
    }
  }).then(function (v19) {
    _cachedEndpoint = buildEndpoint(v19.nakios || NAKIOS_FALLBACK);
    return _cachedEndpoint;
  }).catch(function () {
    _cachedEndpoint = buildEndpoint(NAKIOS_FALLBACK);
    return _cachedEndpoint;
  });
}
function extractOrigin(v20) {
  var v21 = v20.match(/^(https?:\/\/[^\/]+)/);
  if (v21) {
    return v21[1];
  } else {
    return null;
  }
}
function resolveSource(v22, v23) {
  var v24 = v22.url || "";
  if (v24.startsWith("http")) {
    return {
      url: v24,
      format: v22.isM3U8 || v24.indexOf(".m3u8") !== -1 ? "m3u8" : "mp4",
      referer: v23.referer,
      origin: v23.base
    };
  }
  if (v24.charAt(0) === "/") {
    var v25 = v24.match(/[?&]url=([^&]+)/);
    if (!v25) {
      return null;
    }
    var v26;
    try {
      v26 = decodeURIComponent(v25[1]);
    } catch (v27) {
      return null;
    }
    var v28 = extractOrigin(v26);
    return {
      url: v26,
      format: "m3u8",
      referer: v28 ? v28 + "/" : v23.referer,
      origin: v28 || v23.base
    };
  }
  return null;
}
function normalizeSources(v29, v30, v31, v32, v33, v34) {
  var v35 = [];
  for (var v36 = 0; v36 < v29.length; v36++) {
    var v37 = v29[v36];
    if (v37.isEmbed) {
      continue;
    }
    var v38 = resolveSource(v37, v30);
    if (!v38) {
      continue;
    }
    var v39 = v37.quality || "HD";
    var v40 = (v37.lang || "MULTI").toUpperCase();
    var v41 = v38.format.toUpperCase();
    var v42 = "🇫🇷";
    var v43 = "VF";
    if (v40.indexOf("MULTI") !== -1 || v37.name && v37.name.toUpperCase().indexOf("MULTI") !== -1) {
      v42 = "🌍";
      v43 = "MULTI";
    } else if (v40.indexOf("VOST") !== -1) {
      v42 = "🔡";
      v43 = "VOSTFR";
    }
    var v44 = "🎬 ";
    if (v32 && v33) {
      var v45 = v34 && v34.name ? " - " + v34.name : "";
      v44 += "S" + v32 + " E" + v33 + v45 + " | " + v31.name;
    } else {
      v44 += v31.name + (v31.year ? " - " + v31.year : "");
    }
    var v46 = ["📺 " + v39, v42 + " " + v43, "🎞️ " + v41];
    if (v37.size) {
      v46.push("💾 " + v37.size);
    }
    var v47 = v34 && v34.duration ? v34.duration : v31.duration;
    if (v47) {
      v46.push("⏱️ " + v47);
    }
    v35.push({
      name: "Nakios - " + v39,
      title: v44 + "\n" + v46.join(" | "),
      url: v38.url,
      quality: v39,
      format: v38.format,
      headers: {
        "User-Agent": NAKIOS_UA,
        Referer: v38.referer,
        Origin: v38.origin
      }
    });
  }
  return v35;
}
function getStreams(v48, v49, v50, v51) {
  return Promise.all([getTmdbMetadata(v48, v49), v49 === "tv" ? getEpisodeInfo(v48, v50, v51) : Promise.resolve(null), detectEndpoint()]).then(function (v52) {
    var v53 = v52[0];
    var v54 = v52[1];
    var v55 = v52[2];
    var v56 = v49 === "tv" ? v55.api + "/sources/tv/" + v48 + "/" + (v50 || 1) + "/" + (v51 || 1) : v55.api + "/sources/movie/" + v48;
    return fetch(v56, {
      headers: {
        "User-Agent": NAKIOS_UA,
        Referer: v55.referer
      }
    }).then(function (v57) {
      return v57.json();
    }).then(function (v58) {
      if (!v58.success || !v58.sources) {
        return [];
      }
      var v59 = v49 === "tv" ? v50 : null;
      var v60 = v49 === "tv" ? v51 : null;
      return normalizeSources(v58.sources, v55, v53, v59, v60, v54);
    });
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
/*
 * nv-plugins nakios.js — FULLY DECODED port of the All-in-One-Nuvio provider (4.24.0 merge pass).
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
var v2 = v1; /*rotation removed*/
;
var TMDB_KEY = "f3d757824f08ea2cff45eb8f47ca3a1e";
var NAKIOS_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
var DOMAINS_URL = "https://raw.githubusercontent.com/wooodyhood/nuvio-repo/main/domains.json";
var NAKIOS_FALLBACK = "click";
var _cachedEndpoint = null;
function getTmdbMetadata(v3, v4) {
  var v5 = {
    dh1: 191
  };
  var v6 = {
    dh2: 196,
    dh3: 163,
    dh4: 163,
    dh5: 166,
    dh6: 190
  };
  var v7 = v1;
  var v8 = "https://api.themoviedb.org/3/" + (v4 === "tv" ? "tv" : "movie") + "/" + v3 + "?api_key=" + TMDB_KEY + "&language=en-US";
  return __nvFetch(v8).then(function (v9) {
    var v10 = v1;
    return v9.json();
  }).then(function (v11) {
    var v12 = v7;
    var v13 = v11.title || v11.name || "Nakios";
    var v14 = v11.release_date || v11.first_air_date || "";
    var v15 = v14 ? v14.split("-")[0] : "";
    var v16 = "";
    if (v4 === "movie" && v11.runtime) {
      v16 = v11.runtime + " min";
    } else if (v4 === "tv" && v11.episode_run_time && v11.episode_run_time.length > 0) {
      v16 = v11.episode_run_time[0] + " min";
    }
    return {
      name: v13,
      year: v15,
      duration: v16
    };
  }).catch(function () {
    var v17 = v7;
    return {
      name: "Nakios",
      year: "",
      duration: ""
    };
  });
} /*string-table removed*/
function getEpisodeInfo(v18, v19, v20) {
  var v21 = {
    dh7: 153
  };
  var v22 = {
    dh8: 163
  };
  var v23 = v1;
  if (!v18 || !v19 || !v20) {
    return Promise.resolve(null);
  }
  var v24 = "https://api.themoviedb.org/3/tv/" + v18 + "/season/" + v19 + "/episode/" + v20 + "?api_key=" + TMDB_KEY + "&language=en-US";
  return __nvFetch(v24).then(function (v25) {
    return v25.json();
  }).then(function (v26) {
    var v27 = v23;
    return {
      name: v26.name || null,
      duration: v26.runtime ? v26.runtime + " min" : null
    };
  }).catch(function () {
    return null;
  });
}
function buildEndpoint(v28) {
  var v29 = v1;
  var v30 = v28.includes("nakios") ? v28 : "nakios." + v28;
  return {
    base: "https://" + v30,
    api: "https://api." + v30 + "/api",
    referer: "https://" + v30 + "/"
  };
}
function detectEndpoint() {
  var v31 = v1;
  if (_cachedEndpoint) {
    return Promise.resolve(_cachedEndpoint);
  }
  return __nvFetch(DOMAINS_URL).then(function (v32) {
    if (v32.ok) {
      return v32.json();
    } else {
      return Promise.reject();
    }
  }).then(function (v33) {
    _cachedEndpoint = buildEndpoint(v33.nakios || NAKIOS_FALLBACK);
    return _cachedEndpoint;
  }).catch(function () {
    _cachedEndpoint = buildEndpoint(NAKIOS_FALLBACK);
    return _cachedEndpoint;
  });
}
function extractOrigin(v34) {
  var v35 = v1;
  var v36 = v34.match(/^(https?:\/\/[^\/]+)/);
  if (v36) {
    return v36[1];
  } else {
    return null;
  }
}
function resolveSource(v37, v38) {
  var v39 = {
    dh9: 158,
    dh10: 171,
    dh11: 185,
    dh12: 202,
    dh13: 182
  };
  var v40 = v1;
  var v41 = v37.url || "";
  if (v41.startsWith("http")) {
    return {
      url: v41,
      format: v37.isM3U8 || v41.indexOf(".m3u8") !== -1 ? "m3u8" : "mp4",
      referer: v38.referer,
      origin: v38.base
    };
  }
  if (v41.charAt(0) === "/") {
    var v42 = v41.match(/[?&]url=([^&]+)/);
    if (!v42) {
      return null;
    }
    var v43;
    try {
      v43 = decodeURIComponent(v42[1]);
    } catch (v44) {
      return null;
    }
    var v45 = extractOrigin(v43);
    return {
      url: v43,
      format: "m3u8",
      referer: v45 ? v45 + "/" : v38.referer,
      origin: v45 || v38.base
    };
  }
  return null;
}
function normalizeSources(v46, v47, v48, v49, v50, v51) {
  var v52 = {
    dh14: 190,
    dh15: 167,
    dh16: 168,
    dh17: 206,
    dh18: 184,
    dh19: 201,
    dh20: 169,
    dh21: 176,
    dh22: 194
  };
  var v53 = v1;
  var v54 = [];
  for (var v55 = 0; v55 < v46.length; v55++) {
    var v56 = v46[v55];
    if (v56.isEmbed) {
      continue;
    }
    var v57 = resolveSource(v56, v47);
    if (!v57) {
      continue;
    }
    var v58 = v56.quality || "HD";
    var v59 = (v56.lang || "MULTI").toUpperCase();
    var v60 = v57.format.toUpperCase();
    var v61 = "🇫🇷";
    var v62 = "VF";
    if (v59.indexOf("MULTI") !== -1 || v56.name && v56.name.toUpperCase().indexOf("MULTI") !== -1) {
      v61 = "🌍";
      v62 = "MULTI";
    } else if (v59.indexOf("VOST") !== -1) {
      v61 = "🔡";
      v62 = "VOSTFR";
    }
    var v63 = "🎬 ";
    if (v49 && v50) {
      var v64 = v51 && v51.name ? " - " + v51.name : "";
      v63 += "S" + v49 + " E" + v50 + v64 + " | " + v48.name;
    } else {
      v63 += v48.name + (v48.year ? " - " + v48.year : "");
    }
    var v65 = ["📺 " + v58, v61 + " " + v62, "🎞️ " + v60];
    if (v56.size) {
      v65.push("💾 " + v56.size);
    }
    var v66 = v51 && v51.duration ? v51.duration : v48.duration;
    if (v66) {
      v65.push("⏱️ " + v66);
    }
    v54.push({
      name: "Nakios - " + v58,
      title: v63 + "\n" + v65.join(" | "),
      url: v57.url,
      quality: v58,
      format: v57.format,
      headers: {
        "User-Agent": NAKIOS_UA,
        Referer: v57.referer,
        Origin: v57.origin
      }
    });
  }
  return v54;
} /*decoder removed*/
function getStreams(v67, v68, v69, v70) {
  var v71 = {
    dh23: 197
  };
  var v72 = {
    dh24: 177,
    dh25: 178
  };
  var v73 = v1;
  return Promise.all([getTmdbMetadata(v67, v68), v68 === "tv" ? getEpisodeInfo(v67, v69, v70) : Promise.resolve(null), detectEndpoint()]).then(function (v74) {
    var v75 = v1;
    var v76 = v74[0];
    var v77 = v74[1];
    var v78 = v74[2];
    var v79 = v68 === "tv" ? v78.api + "/sources/tv/" + v67 + "/" + (v69 || 1) + "/" + (v70 || 1) : v78.api + "/sources/movie/" + v67;
    return __nvFetch(v79, {
      headers: {
        "User-Agent": NAKIOS_UA,
        Referer: v78.referer
      }
    }).then(function (v80) {
      var v81 = v75;
      return v80.json();
    }).then(function (v82) {
      var v83 = v75;
      if (!v82.success || !v82.sources) {
        return [];
      }
      var v84 = v68 === "tv" ? v69 : null;
      var v85 = v68 === "tv" ? v70 : null;
      return normalizeSources(v82.sources, v78, v76, v84, v85, v77);
    });
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
  var PROVIDER = "nakios";
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