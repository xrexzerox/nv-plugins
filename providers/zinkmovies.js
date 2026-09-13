/*
 * nv-plugins zinkmovies.js — FULLY DECODED port of the All-in-One-Nuvio provider (4.24.0 merge pass).
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
var __defProp = Object.defineProperty;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (v3, v4, v5) => v4 in v3 ? __defProp(v3, v4, {
  enumerable: true,
  configurable: true,
  writable: true,
  value: v5
}) : v3[v4] = v5;
var __spreadValues = (v6, v7) => {
  for (var v8 in v7 ||= {}) {
    if (__hasOwnProp.call(v7, v8)) {
      __defNormalProp(v6, v8, v7[v8]);
    }
  }
  if (__getOwnPropSymbols) {
    for (var v8 of __getOwnPropSymbols(v7)) {
      if (__propIsEnum.call(v7, v8)) {
        __defNormalProp(v6, v8, v7[v8]);
      }
    }
  }
  return v6;
};
var __async = (v9, v10, v11) => {
  const v12 = {
    dh1: 130
  };
  return new Promise((v13, v14) => {
    const v15 = {
      dh2: 130
    };
    const v16 = v1;
    var v17 = v18 => {
      const v19 = v1;
      try {
        v20(v11.next(v18));
      } catch (v21) {
        v14(v21);
      }
    };
    var v22 = v23 => {
      try {
        v20(v11.throw(v23));
      } catch (v24) {
        v14(v24);
      }
    };
    var v20 = v25 => v25.done ? v13(v25.value) : Promise.resolve(v25.value).then(v17, v22);
    v20((v11 = v11.apply(v9, v10)).next());
  });
};
var PROVIDER_NAME = "ZinkMovies";
var TMDB_API_KEY = "439c478a771f35c05022f9feabcca01c";
var MAIN_URL = "https://zinkmovies.wtf";
var DOMAINS_JSON_URL = "https://raw.githubusercontent.com/PirateZoro9/asura-providers/main/urls.json";
var baseUrl = MAIN_URL;
var cachedDomains = null;
var domainCacheTime = 0;
var DOMAIN_CACHE_TTL = 14400000;
var currentUA = "Mozilla/5.0 (Linux; Android 14; Pixel 8 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36";
var UAS = ["Mozilla/5.0 (Linux; Android 14; Pixel 8 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36", "Mozilla/5.0 (Linux; Android 13; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36", "Mozilla/5.0 (Linux; Android 12; Pixel 6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Mobile Safari/537.36", "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"];
function refreshDomains() {
  return __async(this, null, function* () {
    const v26 = v1;
    if (cachedDomains && Date.now() - domainCacheTime < DOMAIN_CACHE_TTL) {
      return;
    }
    try {
      const v27 = yield __nvFetch(DOMAINS_JSON_URL, {
        headers: {
          "User-Agent": "Mozilla/5.0"
        }
      });
      if (v27 == null ? undefined : v27.ok) {
        const v28 = JSON.parse(yield v27.text());
        if (v28 == null ? undefined : v28.zinkmovies) {
          cachedDomains = v28;
          domainCacheTime = Date.now();
          baseUrl = v28.zinkmovies;
        }
      }
    } catch (v29) {}
  });
}
function hdrs(v30 = {}) {
  const v31 = {
    dh3: 151
  };
  const v32 = v2;
  return __spreadValues({
    "User-Agent": currentUA,
    "Accept-Language": "en-US,en;q=0.9"
  }, v30);
}
var FETCH_TIMEOUT = 12000;
function raceTimeout(v33) {
  const v34 = v2;
  return new Promise((v35, v36) => setTimeout(() => v36(new Error("Timeout")), v33));
} /*string-table removed*/
function fetchText(v37, v38) {
  return __async(this, null, function* () {
    const v39 = v1;
    try {
      const v40 = yield Promise.race([__nvFetch(v37, v38 || {}), raceTimeout(FETCH_TIMEOUT)]);
      if (v40.ok) {
        return yield v40.text();
      }
    } catch (v41) {}
    return null;
  });
}
function fetchJson(v42, v43) {
  const v44 = {
    dh4: 193
  };
  return __async(this, null, function* () {
    const v45 = v1;
    try {
      const v46 = yield Promise.race([__nvFetch(v42, v43 || {}), raceTimeout(FETCH_TIMEOUT)]);
      if (v46.ok) {
        return yield v46.json();
      }
    } catch (v47) {}
    return null;
  });
} /*decoder removed*/
function parseQuality(v48) {
  const v49 = {
    dh5: 228
  };
  const v50 = v2;
  const v51 = v48.match(/(2160|1080|720|480)\s*P/i);
  if (v51) {
    return v51[1] + "p";
  }
  if (/4K|UHD/i.test(v48)) {
    return "2160p";
  }
  return "HD";
}
function parseSize(v52) {
  const v53 = v2;
  if (!v52) {
    return "Unknown Size";
  }
  const v54 = v52.match(/(\d+(?:\.\d+)?\s*(?:GB|MB|gb|mb))/);
  if (v54) {
    return v54[1].toUpperCase();
  } else {
    return "Unknown Size";
  }
}
function cleanHubTitle(v55) {
  const v56 = {
    dh6: 177,
    dh7: 213,
    dh8: 177,
    dh9: 213
  };
  const v57 = v2;
  let v58 = v55.replace(/\.(mkv|mp4|avi)$/i, "").trim();
  v58 = v58.replace(/\s*[-–—]\s*ZINKMOVIES.*/i, "").trim();
  v58 = v58.replace(/\s*[-–—]\s*JiTU.*/i, "").trim();
  v58 = v58.replace(/\s+(IMAX\s+)?(2160|1080|720|480)\s*[pP].*/i, "").trim();
  v58 = v58.replace(/\s+4K\s+.*/i, "").trim();
  return v58.trim() || v55;
}
function buildDropdownMetadata(v59, v60, v61, v62, v63, v64, v65, v66) {
  const v67 = {
    dh10: 217,
    dh11: 185,
    dh12: 147,
    dh13: 202,
    dh14: 155,
    dh15: 187,
    dh16: 155,
    dh17: 156,
    dh18: 142,
    dh19: 122,
    dh20: 135,
    dh21: 146,
    dh22: 169,
    dh23: 125,
    dh24: 215,
    dh25: 192,
    dh26: 197,
    dh27: 120,
    dh28: 206,
    dh29: 155,
    dh30: 175,
    dh31: 155,
    dh32: 114,
    dh33: 114,
    dh34: 181,
    dh35: 155
  };
  const v68 = v2;
  const v69 = (v61 ? v59.name : v59.title) || "Unknown Title";
  const v70 = v61 ? (v59.first_air_date || "").split("-")[0] : (v59.release_date || "").split("-")[0];
  const v71 = v70 ? " (" + v70 + ")" : "";
  let v72 = "";
  try {
    if (v66) {
      v72 = decodeURIComponent(v66);
    }
  } catch (v73) {
    v72 = v66 || "";
  }
  const v74 = (String(v65) + " " + v72).toLowerCase();
  let v75 = "🎬 " + v69 + " - " + v71;
  if (v61 && v62 && v63) {
    v75 += " | S" + String(v62).padStart(2, "0") + "E" + String(v63).padStart(2, "0");
  }
  let v76 = String(v60).toLowerCase().replace(/p/g, "") + "p";
  if (v74.includes("2160p") || v74.includes("4k") || v74.includes("uhd")) {
    v76 = "2160p";
  } else if (v74.includes("1080p")) {
    v76 = "1080p";
  } else if (v74.includes("720p")) {
    v76 = "720p";
  }
  let v77 = "💎";
  if (v76.includes("2160") || v76.includes("4k")) {
    v77 = "🌟";
  } else if (v76.includes("1080")) {
    v77 = "🔥";
  }
  let v78 = "Original-Audio";
  const v79 = ["multi", "dual", "hindi", "tamil", "telugu", "bengali", "malayalam", "kannada", "marathi", "punjabi"];
  if (v79.some(v80 => v74.includes(v80))) {
    v78 = "Multi-Audio";
  }
  const v81 = parseSize(v65);
  const v82 = v77 + " " + v76 + " | 🌍 " + v78 + " | 💾 " + v81;
  const v83 = v66.includes(".mp4") ? "MP4" : "MKV";
  let v84 = "🎥 H.264";
  if (v74.includes("hevc") || v74.includes("x265") || v74.includes("h265")) {
    v84 = v74.includes("hevc") ? "⚡ HEVC" : "🎥 H.265";
  } else if (v74.includes("x264")) {
    v84 = "🎥 H.264";
  }
  let v85 = "";
  if (v74.includes("hdr10+")) {
    v85 = " | 🌈 HDR10+";
  } else if (v74.includes("hdr")) {
    v85 = " | 🌈 HDR";
  } else if (v74.includes("sdr")) {
    v85 = " | 🌈 SDR";
  }
  let v86 = "";
  if (v74.includes("web-dl") || v74.includes("webdl")) {
    v86 = " | 📥 WEB-DL";
  } else if (v74.includes("web-rip") || v74.includes("webrip")) {
    v86 = " | 🌐 WEB-Rip";
  } else if (v74.includes("hd-rip") || v74.includes("hdrip")) {
    v86 = " | 📺 HD-Rip";
  } else if (v74.includes("bluray")) {
    v86 = " | 💿 BluRay";
  }
  const v87 = "🎞️ " + v83 + v85 + " | " + v84 + v86;
  let v88 = "🎵 AAC";
  if (v74.includes("ddp5.1") || v74.includes("ddp 5.1") || v74.includes("atmos")) {
    v88 = "🎵 DDP 5.1";
  } else if (v74.includes("truehd")) {
    v88 = "🎵 TrueHD";
  }
  let v89 = "";
  if (v74.includes("atmos")) {
    v89 = " | 🔊 Dolby Atmos";
  } else if (v74.includes("dv") || v74.includes("dolby vision")) {
    v89 = " | ♾ Dolby Vision";
  }
  const v90 = v88 + v89;
  const v91 = "🔗 " + v64;
  return v75 + "\n" + v82 + "\n" + v87 + "\n" + v90 + "\n" + v91;
}
function makeStream(v92, v93, v94, v95, v96, v97, v98, v99) {
  const v100 = {
    dh36: 202,
    dh37: 172,
    dh38: 123,
    dh39: 146,
    dh40: 175
  };
  const v101 = v2;
  const v102 = v94.toLowerCase();
  const v103 = buildDropdownMetadata(v92, v102, v97, v98, v99, v95, v93, v96);
  let v104 = "Original-Audio";
  const v105 = (v93 + " " + v96).toLowerCase();
  const v106 = ["multi", "dual", "hindi", "tamil", "telugu", "bengali", "malayalam", "kannada", "marathi", "punjabi"];
  if (v106.some(v107 => v105.includes(v107))) {
    v104 = "Multi-Audio";
  }
  return {
    name: PROVIDER_NAME + " | " + v102 + " | " + v104,
    title: v103,
    size: v103,
    description: v103,
    url: v96,
    quality: "",
    language: ""
  };
}
function resolveTpiLink(v108) {
  const v109 = {
    dh41: 220,
    dh42: 158
  };
  return __async(this, null, function* () {
    const v110 = v1;
    try {
      const v111 = yield fetchText(v108, {
        headers: hdrs({
          Referer: baseUrl + "/"
        })
      });
      if (!v111) {
        return null;
      }
      const v112 = v111.match(/<input\s+type="hidden"\s+name="token"\s+value="([^"]+)"/i);
      if (!v112) {
        return null;
      }
      const v113 = v112[1].indexOf("aHR0c");
      if (v113 < 0) {
        return null;
      }
      const v114 = atob(v112[1].substring(v113));
      if (v114.startsWith("http")) {
        return v114;
      } else {
        return null;
      }
    } catch (v115) {}
    return null;
  });
}
function serverHandler(v116, v117) {
  const v118 = {
    dh43: 116,
    dh44: 132,
    dh45: 182,
    dh46: 201
  };
  return __async(this, null, function* () {
    const v119 = v1;
    try {
      const v120 = yield Promise.race([__nvFetch("https://new4.zinkcloud.net/server-handler.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest",
          "User-Agent": currentUA
        },
        body: JSON.stringify({
          server: v117,
          random_id: v116
        })
      }), raceTimeout(FETCH_TIMEOUT)]);
      const v121 = yield v120.json();
      if ((v121 == null ? undefined : v121.success) && v121.url) {
        return v121.url;
      }
    } catch (v122) {}
    return null;
  });
}
function processFile(v123, v124, v125, v126, v127, v128, v129) {
  const v130 = {
    dh47: 157,
    dh48: 228,
    dh49: 128,
    dh50: 213,
    dh51: 154,
    dh52: 150
  };
  return __async(this, null, function* () {
    const v131 = v1;
    const v132 = v126 || parseQuality(v125);
    const v133 = [];
    if (v132.toUpperCase() === "480P") {
      return v133;
    }
    const [v134, v135] = yield Promise.all([serverHandler(v124, "hubcloud"), serverHandler(v124, "worker")]);
    let v136 = v125;
    if (v134) {
      const v137 = yield fetchText(v134, {
        headers: hdrs()
      });
      if (v137) {
        const v138 = (v137.match(/<title>(.*?)<\/title>/i) || [])[1] || "";
        const v139 = cleanHubTitle(v138);
        v136 = v139 ? v139 + " " + parseSize(v125) : v125;
        const v140 = v137.match(/href="(https:\/\/gamerxyt\.com[^"]+)"/i);
        if (v140) {
          const v141 = v140[1].replace(/&amp;/g, "&");
          const v142 = yield fetchText(v141, {
            headers: {
              "User-Agent": "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:152.0) Gecko/20100101 Firefox/152.0",
              Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
              "Accept-Language": "en-US,en;q=0.5",
              Referer: v134,
              DNT: "1",
              Cookie: "xla=s4t"
            }
          });
          if (v142 && v142.length > 500) {
            const v143 = [];
            const v144 = /<a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
            let v145;
            while ((v145 = v144.exec(v142)) !== null) {
              const v146 = v145[1].replace(/&amp;/g, "&");
              const v147 = v145[2].replace(/<[^>]+>/g, "").trim();
              if (!v146 || v146.includes("javascript:") || /telegram|tg\/|pixeldrain|hubcloud\.cx|gpdl2/i.test(v146)) {
                continue;
              }
              if (!/cdn\.fsl-buckets\.life|r2\.cloudflarestorage|r2\.dev|workers\.dev|hub\.(latent|whistle)/i.test(v146)) {
                continue;
              }
              const v148 = /workers\.dev/i.test(v146) ? "Worker" : "FSLv2";
              const v149 = v147.match(/(2160|1080|720|480)\s*[pP]/i);
              v143.push({
                url: v146,
                type: v148,
                quality: v149 ? v149[1] + "p" : ""
              });
            }
            for (const v150 of v143) {
              v133.push(makeStream(v123, v136, v150.quality || v132, v150.type, v150.url, v127, v128, v129));
            }
          }
        }
      }
    }
    if (v135) {
      v133.push(makeStream(v123, v136, v132, "Worker", v135, v127, v128, v129));
    }
    return v133;
  });
}
function extractConfig(v151) {
  try {
    const v152 = v151.match(/new HDVBPlayer\((\{[\s\S]*?\})\)/);
    if (v152) {
      return JSON.parse(v152[1]);
    }
    const v153 = v151.match(/(?:let|var|const)\s+\w+\s*=\s*(\{[\s\S]*?"file":[\s\S]*?\});/);
    if (v153) {
      return JSON.parse(v153[1]);
    }
  } catch (v154) {}
  return null;
}
function getGemmaStreams(v155, v156, v157, v158, v159, v160) {
  const v161 = {
    dh53: 189,
    dh54: 155,
    dh55: 203,
    dh56: 117,
    dh57: 189,
    dh58: 189,
    dh59: 200,
    dh60: 189,
    dh61: 158,
    dh62: 223,
    dh63: 152,
    dh64: 191,
    dh65: 143,
    dh66: 180,
    dh67: 113
  };
  return __async(this, null, function* () {
    const v162 = v1;
    const v163 = [];
    try {
      const v164 = "https://gemma416okl.com/play/" + v156;
      const v165 = yield fetchText(v164, {
        headers: hdrs({
          Referer: baseUrl + "/"
        })
      });
      if (!v165) {
        return v163;
      }
      const v166 = extractConfig(v165);
      if (!(v166 == null ? undefined : v166.file) || !(v166 == null ? undefined : v166.key)) {
        return v163;
      }
      let v167 = v166.file;
      if (!v167.includes("://")) {
        v167 = "https://gemma416okl.com" + v167;
      }
      const v168 = v166.key;
      const v169 = yield fetchJson(v167, {
        method: "POST",
        headers: {
          "X-CSRF-TOKEN": v168,
          "Content-Type": "application/x-www-form-urlencoded",
          Origin: "https://gemma416okl.com",
          Referer: v164
        }
      });
      if (!v169) {
        return v163;
      }
      const v170 = v167.substring(0, v167.lastIndexOf("/") + 1);
      let v171 = [];
      if (v157) {
        for (const v172 of v169) {
          if (v171.length) {
            break;
          }
          if (v172.id == v158 || v172.title && v172.title.includes(String(v158))) {
            if (!v172.folder) {
              continue;
            }
            for (const v173 of v172.folder) {
              if (v173.episode == v159 || v173.id == v158 + "-" + v159) {
                if (!v173.folder) {
                  continue;
                }
                for (const v174 of v173.folder) {
                  if (v174.file && v174.file.startsWith("~")) {
                    v171.push(v174);
                  }
                }
              }
            }
          }
        }
      } else {
        for (const v175 of v169) {
          if (v175.file && v175.file.startsWith("~")) {
            v171.push(v175);
          }
        }
      }
      for (const v176 of v171) {
        const v177 = "" + v170 + v176.file.substring(1) + ".txt";
        const v178 = yield fetchText(v177, {
          method: "POST",
          headers: {
            "X-CSRF-TOKEN": v168,
            "Content-Type": "application/x-www-form-urlencoded",
            Origin: "https://gemma416okl.com",
            Referer: v164
          }
        });
        if (v178 && v178.includes(".m3u8")) {
          const v179 = buildDropdownMetadata(v155, "HD", v157, v158, v159, "Embed", v176.title || "Gemma", v178);
          const v180 = v176.title ? " | " + v176.title : "";
          v163.push({
            name: PROVIDER_NAME + " | hd | Gemma" + v180,
            title: v179,
            size: v179,
            description: v179,
            url: v178.trim(),
            quality: "",
            language: "",
            headers: {
              origin: "https://i-arch-400.keymi417exx.com",
              referer: "https://i-arch-400.keymi417exx.com/"
            }
          });
        }
      }
    } catch (v181) {}
    return v163;
  });
}
function scrapeZinkCloud(v182, v183, v184, v185, v186, v187) {
  const v188 = {
    dh68: 155,
    dh69: 228,
    dh70: 177,
    dh71: 218,
    dh72: 213,
    dh73: 143,
    dh74: 173
  };
  return __async(this, null, function* () {
    const v189 = {
      dh75: 228
    };
    const v190 = v1;
    const v191 = [];
    try {
      const v192 = yield fetchText(baseUrl + "/?s=" + encodeURIComponent(v183));
      if (!v192) {
        return v191;
      }
      const v193 = v185 ? "tvshows" : "movies";
      const v194 = new RegExp("href=\"(https?:\\/\\/[^\\/]+\\/" + v193 + "\\/([^\"]+))\"", "ig");
      let v195;
      let v196;
      while ((v196 = v194.exec(v192)) !== null) {
        if (!v184 || v196[1].includes(v184)) {
          v195 = v196[1];
          break;
        }
      }
      if (!v195) {
        return v191;
      }
      const v197 = yield fetchText(v195);
      if (!v197) {
        return v191;
      }
      if (v185) {
        let v198 = null;
        let v199 = "";
        let v200 = "";
        const v201 = v197.split("<div class=\"seriecontainer\">");
        for (let v202 = 1; v202 < v201.length; v202++) {
          const v203 = v201[v202].indexOf("<div class=\"seriecontainer\">");
          const v204 = v203 >= 0 ? v201[v202].substring(0, v203) : v201[v202];
          const v205 = v204.match(/<p>([\s\S]*?)<\/p>/i);
          if (!v205) {
            continue;
          }
          const v206 = v205[1].match(/Season\s*0?(\d+)/i);
          if (!v206 || parseInt(v206[1]) !== v186) {
            continue;
          }
          const v207 = [];
          const v208 = /href="(https:\/\/tpi\.li\/[^"]+)"[^>]*>[\s\S]*?<span>([\s\S]*?)<\/span>/ig;
          let v209;
          while ((v209 = v208.exec(v204)) !== null) {
            const v210 = v209[2].replace(/<[^>]+>/g, "").trim();
            const v211 = parseQuality(v210);
            if (v211.toUpperCase() !== "480P") {
              v207.push({
                tpiUrl: v209[1],
                quality: v211,
                label: v210
              });
            }
          }
          v207.sort((v212, v213) => (parseInt(v213.quality) || 0) - (parseInt(v212.quality) || 0));
          if (v207.length) {
            v198 = v207[0].tpiUrl;
            v199 = v207[0].quality;
            v200 = v207[0].label;
          }
          break;
        }
        if (v198) {
          const v214 = yield resolveTpiLink(v198);
          if (v214) {
            const v215 = yield fetchText(v214, {
              headers: hdrs()
            });
            if (v215) {
              const v216 = [];
              const v217 = /href="(https:\/\/new3\.zinkcloud\.net\/file\/([^"]+))"[^>]*>\s*<span[^>]*>(.*?)<\/span>/ig;
              while ((v196 = v217.exec(v215)) !== null) {
                const v218 = v196[3].replace(/<[^>]+>/g, "").trim();
                if (v218.toLowerCase().includes("all episodes")) {
                  continue;
                }
                const v219 = v218.match(/(?:EPISODE|EP|E)\s*[-_]?\s*0?(\d+)/i);
                if (v219 && parseInt(v219[1]) === v187) {
                  v216.push({
                    id: v196[2],
                    label: v218 + " " + v200,
                    quality: v199
                  });
                }
              }
              const v220 = yield Promise.all(v216.map(v221 => processFile(v182, v221.id, v221.label, v221.quality, true, v186, v187)));
              for (const v222 of v220.flat()) {
                v191.push(v222);
              }
            }
          }
        }
      } else {
        const v223 = [];
        const v224 = /href="(https:\/\/tpi\.li\/[^"]+)"[^>]*>[\s\S]*?<span>([\s\S]*?)<\/span>/ig;
        while ((v196 = v224.exec(v197)) !== null) {
          v223.push({
            tpiUrl: v196[1],
            label: v196[2].replace(/<[^>]+>/g, "").trim()
          });
        }
        if (v223.length) {
          const v225 = yield Promise.all(v223.map(v226 => __async(this, null, function* () {
            const v227 = v190;
            const v228 = yield resolveTpiLink(v226.tpiUrl);
            if (!v228) {
              return null;
            }
            const v229 = v228.match(/\/file\/([^\/]+)$/);
            if (v229) {
              return {
                id: v229[1],
                label: v226.label
              };
            } else {
              return null;
            }
          })));
          const v230 = v225.filter(Boolean);
          const v231 = yield Promise.all(v230.map(v232 => processFile(v182, v232.id, v232.label, null, false, 0, 0)));
          for (const v233 of v231.flat()) {
            v191.push(v233);
          }
        }
      }
    } catch (v234) {}
    return v191;
  });
}
function getStreams(v235, v236, v237, v238) {
  const v239 = {
    dh76: 159,
    dh77: 129,
    dh78: 186,
    dh79: 160,
    dh80: 191,
    dh81: 126,
    dh82: 147,
    dh83: 216,
    dh84: 143
  };
  return __async(this, null, function* () {
    const v240 = {
      dh85: 187,
      dh86: 166
    };
    const v241 = v1;
    yield refreshDomains();
    currentUA = UAS[Math.floor(Math.random() * UAS.length)];
    const v242 = v236 === "series" || v236 === "tv";
    const v243 = [];
    let v244 = "";
    let v245 = null;
    try {
      v245 = yield fetchJson("https://api.themoviedb.org/3/" + (v242 ? "tv" : "movie") + "/" + v235 + "?api_key=" + TMDB_API_KEY);
      if (v245) {
        const v246 = v242 ? v245.name : v245.title;
        const v247 = v242 ? (v245.first_air_date || "").split("-")[0] : (v245.release_date || "").split("-")[0];
        v244 = v242 ? v246 + " S" + String(v237).padStart(2, "0") + "E" + String(v238).padStart(2, "0") : "" + v246 + (v247 ? " (" + v247 + ")" : "");
        const v248 = yield scrapeZinkCloud(v245, v246, v247, v242, v237, v238);
        for (const v249 of v248) {
          v243.push(v249);
        }
      }
    } catch (v250) {}
    if (v245) {
      try {
        const v251 = yield fetchJson("https://api.themoviedb.org/3/" + (v242 ? "tv" : "movie") + "/" + v235 + "/external_ids?api_key=" + TMDB_API_KEY);
        if (v251 == null ? undefined : v251.imdb_id) {
          const v252 = yield getGemmaStreams(v245, v251.imdb_id, v242, v237, v238, v244);
          for (const v253 of v252) {
            v243.push(v253);
          }
        }
      } catch (v254) {}
    }
    function v255(v256) {
      const v257 = v241;
      const v258 = v256.toLowerCase();
      if (v258.includes("2160p") || v258.includes("4k")) {
        return 2160;
      }
      if (v258.includes("1080p")) {
        return 1080;
      }
      if (v258.includes("720p")) {
        return 720;
      }
      return 0;
    }
    return v243.sort((v259, v260) => {
      const v261 = v241;
      return v255(v260.name) - v255(v259.name);
    });
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
  var PROVIDER = "zinkmovies";
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