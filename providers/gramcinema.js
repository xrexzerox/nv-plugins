/*
 * nv-plugins gramcinema.js — FULLY DECODED port of the All-in-One-Nuvio provider (4.24.0 merge pass).
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
; /*decoder removed*/
function getToken() {
  var v3 = {
    dh1: 357,
    dh2: 331
  };
  return new Promise(function (v4) {
    var v5 = v1;
    try {
      if (typeof global !== "undefined" && global.SCRAPER_SETTINGS && global.SCRAPER_SETTINGS.cinemaTvToken) {
        console.log("[CinemaTV] Using token from global.SCRAPER_SETTINGS");
        return v4(String(global.SCRAPER_SETTINGS.cinemaTvToken).trim());
      }
      if (typeof window !== "undefined" && window.SCRAPER_SETTINGS && window.SCRAPER_SETTINGS.cinemaTvToken) {
        console.log("[CinemaTV] Using token from window.SCRAPER_SETTINGS");
        return v4(String(window.SCRAPER_SETTINGS.cinemaTvToken).trim());
      }
    } catch (v6) {
      console.error("[CinemaTV] Error checking settings panel:", v6.message);
    }
    console.error("[CinemaTV] No token found in settings! Please configure GramCinema settings.");
    v4("");
  });
}
function formatBytes(v7) {
  var v8 = {
    dh3: 292,
    dh4: 346,
    dh5: 335
  };
  var v9 = v1;
  if (!v7 || v7 == 0) {
    return "Unknown";
  }
  var v10 = 1024;
  var v11 = ["Bytes", "KB", "MB", "GB", "TB"];
  var v12 = Math.floor(Math.log(v7) / Math.log(v10));
  return parseFloat((v7 / Math.pow(v10, v12)).toFixed(2)) + " " + v11[v12];
} /*string-table removed*/
function fetchJson(v13, v14) {
  var v15 = {
    dh6: 373
  };
  var v16 = {
    dh7: 352
  };
  var v17 = v1;
  console.log("[CinemaTV] Fetching: " + v13);
  return __nvFetch(v13, v14 || {}).then(function (v18) {
    var v19 = v1;
    if (!v18.ok) {
      throw new Error("HTTP " + v18.status);
    }
    return v18.json();
  }).catch(function (v20) {
    var v21 = v17;
    console.error("[CinemaTV] Fetch Failed: " + v20.message);
    throw v20;
  });
}
function makeStream(v22, v23, v24, v25) {
  var v26 = {
    dh8: 333,
    dh9: 303,
    dh10: 314,
    dh11: 342,
    dh12: 311,
    dh13: 300,
    dh14: 347,
    dh15: 297,
    dh16: 316,
    dh17: 344,
    dh18: 319,
    dh19: 364,
    dh20: 318,
    dh21: 313,
    dh22: 318,
    dh23: 362,
    dh24: 304,
    dh25: 325,
    dh26: 297,
    dh27: 297,
    dh28: 325,
    dh29: 307,
    dh30: 294,
    dh31: 327
  };
  var v27 = {
    dh32: 288
  };
  var v28 = v1;
  var v29 = "";
  try {
    v29 = decodeURIComponent(v23) + " " + v22;
  } catch (v30) {
    v29 = v23 + " " + v22;
  }
  var v31 = v29.toLowerCase();
  var v32 = /[\s\.\-\+\[\]_\(\)\|]+/g;
  var v33 = v31.replace(v32, "");
  var v34 = "1080P";
  if (/2160p|4k|uhd/i.test(v31)) {
    v34 = "2160P";
  } else if (/1080p/i.test(v31)) {
    v34 = "1080P";
  } else if (/720p/i.test(v31)) {
    v34 = "720P";
  } else if (/480p/i.test(v31)) {
    v34 = "480P";
  }
  var v35 = "Dual-Audio";
  var v36 = /hindi/i.test(v31);
  var v37 = /(english|eng)/i.test(v31);
  var v38 = /tamil/i.test(v31);
  var v39 = /telugu/i.test(v31);
  var v40 = 0;
  if (v36) {
    v40++;
  }
  if (v37) {
    v40++;
  }
  if (v38) {
    v40++;
  }
  if (v39) {
    v40++;
  }
  if (/(multi|multi\-audio|multi\.audio)/i.test(v31) || v40 >= 3) {
    v35 = "Multi-Audio";
  } else if (/(dual|dual\-audio|dual\.audio|dubbed)/i.test(v31) || v40 === 2) {
    v35 = "Dual-Audio";
  } else if (v40 === 1) {
    if (v36) {
      v35 = "Hindi";
    } else if (v38) {
      v35 = "Tamil";
    } else if (v39) {
      v35 = "Telugu";
    } else if (v37) {
      v35 = "English";
    }
  }
  var v41 = v22.replace(/\.(mkv|mp4|avi)$/i, "").replace(/\./g, " ");
  var v42 = "";
  var v43 = v41.match(/\b(S\d{1,2}\s*E\d{1,2})\b/i);
  if (v43) {
    v42 = " | " + v43[1].toUpperCase().replace(/\s+/g, "");
    var v44 = v41.toLowerCase().indexOf(v43[0].toLowerCase());
    if (v44 > 0) {
      v41 = v41.substring(0, v44);
    }
  }
  var v45 = "";
  var v46 = v41.match(/\b(19|20)\d{2}\b/);
  if (v46) {
    v45 = v46[0];
    var v47 = v41.indexOf(v45);
    if (v47 > 0) {
      v41 = v41.substring(0, v47);
    }
  }
  v41 = v41.replace(/AMZN|WEB\-DL|WEB|DL|AVC|x264|x265|HEVC|STAN|WEBRip|SDR|10bit|iTunes|HQ|HDRip|BluRay|6CH|Dual|Audio|Hindi|English|Tamil|Telugu|720p|1080p|2160p|4k/gi, "").replace(/[-_()\[\]|]/g, " ").replace(/\s+/g, " ").trim();
  v41 = v41.replace(/\b\w/g, function (v48) {
    var v49 = v28;
    return v48.toUpperCase();
  });
  var v50 = v34 === "2160P" ? "🌟" : "💎";
  var v51 = v50 + " " + v34 + " | 🌍 " + v35 + " | 💾 " + (v25 || "N/A");
  var v52 = "";
  var v53 = false;
  if (/hdr10\+|hdr10p/i.test(v31)) {
    v52 = "HDR10+";
    v53 = true;
  } else if (/hdr10/i.test(v31)) {
    v52 = "HDR10";
    v53 = true;
  } else if (/hdr(?!ip)/i.test(v31)) {
    v52 = "HDR";
    v53 = true;
  }
  var v54 = /10bit/i.test(v31) ? "🔆 10Bit" : "";
  var v55 = /(dv|dolby\s*vision|dolbyvision)/i.test(v31) ? "🕵️‍♀️ DV" : "";
  var v56 = /bluray/i.test(v31);
  var v57 = "x264";
  if (/(hevc|x265|265|h265)/i.test(v31)) {
    v57 = "HEVC x265";
  } else if (/(x264|264|h264)/i.test(v31)) {
    v57 = "x264";
  } else if (v34 === "2160P") {
    v57 = "HEVC x265";
  }
  var v58 = [];
  if (v52) {
    v58.push(v52);
  }
  if (v54) {
    v58.push(v54);
  }
  if (v56) {
    v58.push("📀 BluRay");
  }
  if (v55) {
    v58.push(v55);
  }
  var v59 = "";
  if (v58.length > 0) {
    var v60 = v53 ? "⚡ " : "";
    v59 = v60 + v58.join(" • ") + " | 🎥 " + v57;
  } else {
    v59 = "🎥 " + v57;
  }
  var v61 = "🎞️ MKV";
  if (/\bmp4\b/i.test(v31)) {
    v61 = "🎞️ MP4";
  }
  var v62 = "AAC 5.1";
  var v63 = /atmos/i.test(v31);
  if (v33.indexOf("ddp51") !== -1 || v33.indexOf("eac351") !== -1 || v33.indexOf("dd51") !== -1) {
    v62 = "DDP 5.1";
  } else if (v33.indexOf("truehd71") !== -1) {
    v62 = "TrueHD 7.1";
  } else if (v33.indexOf("aac71") !== -1) {
    v62 = "AAC 7.1";
  } else if (v33.indexOf("aac20") !== -1 || v33.indexOf("aac") !== -1) {
    v62 = /aac\s*5\.1/i.test(v31) ? "AAC 5.1" : "AAC 2.0";
  }
  if (/ddp\s*5\s*1/i.test(v31) || /ddp5\.1/i.test(v31)) {
    v62 = "DDP 5.1";
  }
  var v64 = v63 ? " • 🔊 Atmos" : "";
  var v65 = v61 + " | 🎧 " + v62 + v64 + " |";
  var v66 = "WEB-DL";
  if (v56) {
    v66 = "BluRay";
  } else if (/hdrip/i.test(v31)) {
    v66 = "HDRip";
  } else if (/webrip/i.test(v31)) {
    v66 = "WEB-Rip";
  } else if (/(webdl|web\-dl|itunes|amzn)/i.test(v31)) {
    v66 = "WEB-DL";
  }
  var v67 = "CDN1";
  var v68 = v23.match(/cdn(\d+)/i);
  if (v68) {
    v67 = "CDN" + v68[1];
  } else if (v23.indexOf("tga-hd") !== -1) {
    v67 = "TGA-CDN";
  }
  var v69 = /imax/i.test(v31) ? " | 👁️ iMAX" : "";
  var v70 = "🔗 GramCinema • " + v67 + " | ☁️ " + v66 + v69;
  var v71 = "GramCinema | " + v34 + " | " + v35;
  var v72 = "🎬 " + v41 + (v45 ? " - (" + v45 + ")" : "") + v42 + "\n" + v51 + "\n" + v59 + "\n" + v65 + "\n" + v70;
  return {
    name: v71,
    title: v72,
    size: v72,
    url: v23.replace(/ /g, "%20"),
    behaviorHints: {
      notWebReady: true,
      proxyHeaders: {
        request: {
          Referer: v24 || "https://bollywood.eu.org/"
        }
      }
    }
  };
}
function getStreams(v73, v74, v75, v76) {
  var v77 = {
    dh33: 348
  };
  var v78 = {
    dh34: 371,
    dh35: 353
  };
  var v79 = {
    dh36: 299,
    dh37: 312
  };
  var v80 = {
    dh38: 332
  };
  var v81 = v1;
  console.log("[Hashhackers] getStreams: " + v73 + " | Type: " + v74);
  if (v74 !== "movie" && v74 !== "tv" && v74 !== "series") {
    return Promise.resolve([]);
  }
  return getToken().then(function (v82) {
    var v83 = v81;
    if (!v82) {
      console.error("[CinemaTV] No token available, aborting getStreams");
      return [];
    }
    var v84 = v74 === "tv" || v74 === "series";
    var v85 = String(v73).indexOf("tt") === 0;
    var v86 = v85 ? "https://api.themoviedb.org/3/find/" + v73 + "?api_key=d131017ccc6e5462a81c9304d21476de&external_source=imdb_id&language=en-US" : "https://api.themoviedb.org/3/" + (v84 ? "tv" : "movie") + "/" + v73 + "?api_key=d131017ccc6e5462a81c9304d21476de&language=en-US";
    return fetchJson(v86).then(function (v87) {
      var v88 = {
        dh39: 372,
        dh40: 360,
        dh41: 295
      };
      var v89 = {
        dh42: 326
      };
      var v90 = {
        dh43: 336
      };
      var v91 = v83;
      var v92;
      if (v85) {
        v92 = v84 ? v87.tv_results && v87.tv_results[0] : v87.movie_results && v87.movie_results[0];
      } else {
        v92 = v87;
      }
      if (!v92) {
        return [];
      }
      var v93 = v84 ? v92.name : v92.title;
      var v94 = v84 ? v92.first_air_date : v92.release_date;
      var v95 = v94 ? v94.split("-")[0] : "";
      var v96 = v93 + " " + v95;
      if (v84 && v75 !== undefined && v76 !== undefined) {
        var v97 = v75 < 10 ? "0" + v75 : "" + v75;
        var v98 = v76 < 10 ? "0" + v76 : "" + v76;
        v96 += " S" + v97 + "E" + v98;
      }
      var v99 = encodeURIComponent(v96.trim());
      var v100 = {
        "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0.1 Mobile/15E148 Safari/604.1",
        Accept: "*/*",
        Authorization: "Bearer " + v82,
        Origin: "https://bollywood.eu.org",
        Referer: "https://bollywood.eu.org/"
      };
      var v101 = "https://tga-hd.api.hashhackers.com/mix_media_files/search?q=" + v99 + "&page=1";
      return fetchJson(v101, {
        headers: v100
      }).then(function (v102) {
        var v103 = {
          dh44: 349
        };
        var v104 = {
          dh45: 349
        };
        var v105 = {
          dh46: 321,
          dh47: 349
        };
        var v106 = v91;
        var v107 = v102.files || [];
        var v108 = v107.filter(function (v109) {
          var v110 = v1;
          var v111 = v109.file_name.toLowerCase().trim();
          return /\.(mkv|mp4)$/.test(v111);
        });
        if (v108.length === 0) {
          return [];
        }
        var v112 = v108.slice(0, 6);
        var v113 = v112.map(function (v114) {
          var v115 = {
            dh48: 334
          };
          var v116 = v106;
          return fetchJson("https://tga-hd.api.hashhackers.com/genLink?type=mix_media&id=" + v114.id, {
            headers: v100
          }).then(function (v117) {
            var v118 = v116;
            if (v117.success && v117.url) {
              var v119 = formatBytes(parseInt(v114.file_size));
              return makeStream(v114.file_name, v117.url, "https://bollywood.eu.org/", v119);
            }
            return null;
          }).catch(function () {
            return null;
          });
        });
        return Promise.all(v113).then(function (v120) {
          var v121 = v106;
          var v122 = v120.filter(function (v123) {
            return v123 !== null;
          });
          v122.forEach(function (v124) {
            var v125 = v121;
            var v126 = (v124.title || "").toLowerCase();
            if (v126.indexOf("2160p") !== -1 || v126.indexOf("4k") !== -1) {
              v124._resWeight = 4;
            } else if (v126.indexOf("1080p") !== -1) {
              v124._resWeight = 3;
            } else if (v126.indexOf("720p") !== -1) {
              v124._resWeight = 2;
            } else {
              v124._resWeight = 1;
            }
          });
          v122.sort(function (v127, v128) {
            var v129 = v121;
            return v128._resWeight - v127._resWeight;
          });
          v122.forEach(function (v130) {
            var v131 = v121;
            delete v130._resWeight;
          });
          return v122;
        });
      });
    }).catch(function (v132) {
      var v133 = v83;
      console.error("[CinemaTV] Error: " + v132.message);
      return [];
    });
  });
}
function onSettings() {
  var v134 = {
    dh49: 343,
    dh50: 320
  };
  var v135 = v1;
  return Promise.resolve([{
    type: "header",
    label: "GramCinema Configuration"
  }, {
    type: "text",
    isPassword: true,
    key: "cinemaTvToken",
    label: "CinemaTV Token",
    placeholder: "Enter token here...",
    description: "Provide the authorization token required to access CinemaTV links."
  }]);
}
module.exports = {
  getStreams: getStreams,
  onSettings: onSettings
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
  var PROVIDER = "gramcinema";
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