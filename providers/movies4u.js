/*
 * nv-plugins movies4u.js — rebased on the CURRENT All-in-One-Nuvio upstream file (4.26.0 sync pass).
 * Upstream version: 1.0.2. Decoded + identifier-normalized, zero obfuscator remnants.
 * nv tail re-attached: fail-open quality gate (4.26.0), en/tl language gate, cross-provider dedupe.
 */
var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (v1, v2, v3) => v2 in v1 ? __defProp(v1, v2, {
  enumerable: true,
  configurable: true,
  writable: true,
  value: v3
}) : v1[v2] = v3;
var __spreadValues = (v4, v5) => {
  for (var v6 in v5 ||= {}) {
    if (__hasOwnProp.call(v5, v6)) {
      __defNormalProp(v4, v6, v5[v6]);
    }
  }
  if (__getOwnPropSymbols) {
    for (var v6 of __getOwnPropSymbols(v5)) {
      if (__propIsEnum.call(v5, v6)) {
        __defNormalProp(v4, v6, v5[v6]);
      }
    }
  }
  return v4;
};
var __spreadProps = (v7, v8) => __defProps(v7, __getOwnPropDescs(v8));
var __async = (v9, v10, v11) => {
  return new Promise((v12, v13) => {
    var v14 = v15 => {
      try {
        v16(v11.next(v15));
      } catch (v17) {
        v13(v17);
      }
    };
    var v18 = v19 => {
      try {
        v16(v11.throw(v19));
      } catch (v20) {
        v13(v20);
      }
    };
    var v16 = v21 => v21.done ? v12(v21.value) : Promise.resolve(v21.value).then(v14, v18);
    v16((v11 = v11.apply(v9, v10)).next());
  });
};
var DOMAINS_URL = "https://raw.githubusercontent.com/phisher98/TVVVV/refs/heads/main/domains.json";
var FALLBACK_URL = "https://new2.movies4u.clinic";
var WORKER_PROXY = "https://lucky-star-3059.salman-sohail93.workers.dev";
var TMDB_API_KEY = "1865f43a0549ca50d341dd9ab8b29f49";
var HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  Referer: FALLBACK_URL,
  Cookie: "xla=s4t"
};
var cachedBaseUrl = null;
function getBaseUrl() {
  return __async(this, null, function* () {
    if (cachedBaseUrl) {
      return cachedBaseUrl;
    }
    try {
      const v22 = yield fetch(DOMAINS_URL, {
        skipSizeCheck: true
      });
      const v23 = yield v22.json();
      cachedBaseUrl = v23.movies4u || v23.movies4uhd || FALLBACK_URL;
    } catch (v24) {
      cachedBaseUrl = FALLBACK_URL;
    }
    return cachedBaseUrl;
  });
}
function getInvertedSortTag(v25, v26 = 999999) {
  const v27 = Math.max(0, parseInt(v25, 10) || 0);
  const v28 = Math.max(0, v26 - v27);
  const v29 = v28.toString(2).padStart(20, "0");
  return v29.split("").map(v30 => v30 === "1" ? "﻿" : "​").join("");
}
function getQualityRank(v31) {
  const v32 = String(v31 || "").toLowerCase();
  if (v32.includes("2160") || v32.includes("4k") || v32.includes("uhd")) {
    return 4;
  }
  if (v32.includes("1080") || v32.includes("fhd") || v32.includes("fullhd")) {
    return 3;
  }
  if (v32.includes("720") || v32.includes("hd")) {
    return 2;
  }
  if (v32.includes("480") || v32.includes("sd") || v32.includes("360")) {
    return 1;
  }
  return 0;
}
function parseSizeToMB(v33) {
  if (!v33 || v33 === "N/A") {
    return 0;
  }
  const v34 = String(v33).match(/([\d.]+)\s*(GB|MB)/i);
  if (!v34) {
    return 0;
  }
  const v35 = parseFloat(v34[1]);
  const v36 = v34[2].toUpperCase();
  if (v36 === "GB") {
    return Math.floor(v35 * 1024);
  }
  if (v36 === "MB") {
    return Math.floor(v35);
  }
  return 0;
}
function getResolutionEmoji(v37) {
  const v38 = String(v37 || "").toLowerCase();
  if (v38.includes("2160") || v38.includes("4k") || v38.includes("uhd")) {
    return "🌟 4K";
  }
  if (v38.includes("1080") || v38.includes("fhd")) {
    return "🔥 1080p";
  }
  if (v38.includes("720") || v38.includes("hd")) {
    return "💎 720p";
  }
  if (v38.includes("480") || v38.includes("sd")) {
    return "📱 480p";
  }
  return "📺 " + (v37 || "1080p");
}
function extractQuality(v39) {
  const v40 = (v39 || "").toLowerCase();
  if (/\b(2160p|4k|uhd)\b/.test(v40)) {
    return "4K";
  }
  if (/\b(1080p|1080)(?!(?:\s*gb|\s*mb|\s*b))\b/.test(v40)) {
    return "1080p";
  }
  if (/\b(720p|720)(?!(?:\s*gb|\s*mb|\s*b))\b/.test(v40)) {
    return "720p";
  }
  if (/\b(480p|480)(?!(?:\s*gb|\s*mb|\s*b))\b/.test(v40)) {
    return "480p";
  }
  if (/\b(360p|360)(?!(?:\s*gb|\s*mb|\s*b))\b/.test(v40)) {
    return "360p";
  }
  return "Unknown";
}
function parseExtraMetadata(v41, v42 = "") {
  const v43 = (v41 + " " + v42).toUpperCase();
  let v44 = "Multi-Audio";
  if (v43.includes("DUAL")) {
    v44 = "Multi Audio";
  }
  if (v43.includes("ENGLISH") && !v43.includes("HINDI")) {
    v44 = "English";
  }
  const v45 = v43.match(/(\d+(?:\.\d+)?\s*[MGB]B)/i);
  let v46 = v45 ? v45[0].replace(/\s+/g, "") : "N/A";
  if (v46 === "N/A") {
    const v47 = v43.match(/(\d+\.\d+)\s?G/);
    if (v47) {
      v46 = v47[1] + "GB";
    }
  }
  let v48 = "MKV";
  if (v43.includes("MP4")) {
    v48 = "MP4";
  }
  let v49 = "✨ H.264";
  if (v43.includes("HDR") || v43.includes("DV") || v43.includes("VISION")) {
    v49 = "🌈 HDR";
  } else if (v43.includes("HEVC") || v43.includes("X265") || v43.includes("H265") || v43.includes("H.265")) {
    v49 = "✨ HEVC";
  } else if (v43.includes("X264") || v43.includes("H264") || v43.includes("H.264")) {
    v49 = "✨ H.264";
  }
  let v50 = "🎧 DDP5.1";
  if (v43.includes("ATMOS")) {
    v50 = "🎧 Dolby Atmos";
  } else if (v43.includes("DD5") || v43.includes("DDP5") || v43.includes("5.1")) {
    v50 = "🎧 DDP5.1";
  } else if (v43.includes("AAC")) {
    v50 = "🎧 AAC";
  }
  const v51 = v43.includes("IMAX") ? "👁️ IMAX" : null;
  return {
    language: v44,
    size: v46,
    format: v48,
    codecTag: v49,
    audioCodec: v50,
    isImax: v51
  };
}
function safeUrl(v52) {
  if (!v52) {
    return null;
  }
  try {
    const v53 = new URL(v52);
    v53.pathname = v53.pathname.split("/").map(v54 => {
      try {
        return encodeURIComponent(decodeURIComponent(v54));
      } catch (v55) {
        return encodeURIComponent(v54);
      }
    }).join("/");
    return v53.toString();
  } catch (v56) {
    return v52;
  }
}
function wrapFslMkvUrl(v57) {
  try {
    const v58 = new URL(v57);
    const v59 = v58.hostname.toLowerCase();
    if (v59 !== "r2.cloudflarestorage.com" && !v59.endsWith(".r2.cloudflarestorage.com")) {
      return v57;
    }
    return WORKER_PROXY + "/media/file.mkv?url=" + encodeURIComponent(v57);
  } catch (v60) {
    return v57;
  }
}
function hubCloudServer(v61, v62) {
  const v63 = ((v61 || "") + " " + (v62 || "")).toLowerCase();
  if (/gpdl\.|server\s*:\s*10gbps/.test(v63)) {
    return "HubCloud Pixel 10Gbps";
  }
  if (/fslv2/.test(v63)) {
    return "HubCloud FSLv2";
  }
  if (/fsl/.test(v63)) {
    return "HubCloud FSL";
  }
  if (/s3 server/.test(v63)) {
    return "HubCloud S3";
  }
  if (/mega server/.test(v63)) {
    return "HubCloud Mega";
  }
  if (/pdl server/.test(v63)) {
    return "HubCloud PDL";
  }
  if (/buzzserver/.test(v63)) {
    return "HubCloud BuzzServer";
  }
  if (/pixeldrain/.test(v63)) {
    return "HubCloud Pixeldrain";
  }
  if (/pixel\.|pixelserver/.test(v63)) {
    return "HubCloud Pixel";
  }
  if (/workers\.dev|download file/.test(v63)) {
    return "HubCloud Direct";
  }
  return "HubCloud";
}
function detectFileSize(v64) {
  return __async(this, arguments, function* (v65, v66 = {}) {
    try {
      const v67 = yield fetch(v65, {
        method: "HEAD",
        headers: v66,
        skipSizeCheck: true,
        redirect: "follow"
      });
      const v68 = v67.headers.get("content-length");
      if (!v68) {
        return null;
      }
      const v69 = parseInt(v68);
      let v70 = v69 >= 1073741824 ? (v69 / 1073741824).toFixed(1) + "GB" : Math.round(v69 / 1048576) + "MB";
      return {
        bytes: v69,
        string: v70
      };
    } catch (v71) {}
    return null;
  });
}
function detectDynamicQuality(v72) {
  return __async(this, arguments, function* (v73, v74 = {}, v75 = "", v76 = 120) {
    try {
      if (!v73) {
        return "1080p";
      }
      const v77 = decodeURIComponent(v73).toLowerCase();
      let v78 = extractQuality(v77);
      if (v78 !== "Unknown") {
        return v78;
      }
      if (v75) {
        v78 = extractQuality(v75.toLowerCase());
        if (v78 !== "Unknown") {
          return v78;
        }
      }
      const v79 = yield detectFileSize(v73, v74);
      if (v79 && v79.bytes) {
        const v80 = v79.bytes / 1073741824;
        const v81 = (parseInt(v76) || 120) / 60;
        const v82 = v80 / v81;
        if (v82 >= 6.5) {
          return "4K";
        }
        if (v82 >= 0.95) {
          return "1080p";
        }
        if (v82 >= 0.35) {
          return "720p";
        }
        return "480p";
      }
    } catch (v83) {}
    return "1080p";
  });
}
function makeStream(v84, v85, v86, v87, v88, v89, v90, v91) {
  const v92 = getQualityRank(v86);
  const v93 = parseSizeToMB(v87);
  const v94 = getInvertedSortTag(v92 * 100000 + v93, 999999);
  const v95 = getResolutionEmoji(v86);
  const v96 = (v89 || "").replace(/[^a-zA-Z0-9]/g, ".");
  const v97 = v96 + "." + (v90 || "2026") + "." + (v91.isImax ? "IMAX." : "") + v86 + ".AMZN.WEB-DL." + v91.language.replace(/\s+/g, ".") + "." + v91.audioCodec.replace(/[^\w.]/g, "") + "." + v91.format + ".MSubs";
  const v98 = "🎬 " + v89 + (v90 ? " (" + v90 + ")" : "");
  const v99 = v95 + " | 🗣️ " + v91.language + " | 💾 " + v87;
  const v100 = "🎞️ " + v91.format + " | " + v91.codecTag + " | " + v91.audioCodec;
  const v101 = v91.isImax ? "👁️ IMAX | 🌐 Movies4u | 📦 " + v88 : "🌐 Movies4u | 📦 " + v88;
  const v102 = v97;
  const v103 = v94 + "Movies4u • " + v86 + " • " + v88;
  const v104 = [v98, v99, v100, v101, v102].join("\n");
  return {
    qualityRank: v92,
    sizeInMB: v93,
    data: {
      name: v103,
      title: v104,
      size: v104,
      description: v104,
      url: v84,
      behaviorHints: {
        notWebReady: true,
        proxyHeaders: {
          request: v85
        }
      }
    }
  };
}
function unpackJS(v105, v106, v107, v108) {
  while (v107--) {
    if (v108[v107]) {
      v105 = v105.replace(new RegExp("\\b" + v107.toString(v106) + "\\b", "g"), v108[v107]);
    }
  }
  return v105;
}
function extractDirectM3u8(v109) {
  return __async(this, null, function* () {
    var v110;
    var v111;
    var v112;
    var v113;
    var v114;
    var v115;
    try {
      const v116 = yield fetch(v109, {
        headers: __spreadProps(__spreadValues({}, HEADERS), {
          Referer: "https://m4uplay.store/"
        }),
        skipSizeCheck: true
      });
      const v117 = yield v116.text();
      let v118 = ((v110 = v117.match(/https?:\/\/[^\s"'<>]+\.m3u8[^\s"'<>]*/i)) == null ? undefined : v110[0]) || ((v111 = v117.match(/https?:\/\/[^\s"'<>]+master\.txt[^\s"'<>]*/i)) == null ? undefined : v111[0]);
      if (!v118) {
        const v119 = (v112 = v117.match(/\/(?:3o|stream)\/[^\s"'<>]+(?:m3u8|txt)/i)) == null ? undefined : v112[0];
        if (v119) {
          v118 = "https://m4uplay.store" + v119;
        }
      }
      if (!v118) {
        const v120 = v117.match(new RegExp("eval\\(function\\(p,a,c,k,e,d\\).*?\\}\\('(.*)',(\\d+),(\\d+),'(.*)'\\.split\\('\\|'\\)", "s"));
        if (v120) {
          const v121 = unpackJS(v120[1], parseInt(v120[2]), parseInt(v120[3]), v120[4].split("|"));
          v118 = ((v113 = v121.match(/https?:\/\/[^\s"'<>]+\.m3u8[^\s"'<>]*/i)) == null ? undefined : v113[0]) || ((v114 = v121.match(/https?:\/\/[^\s"'<>]+master\.txt[^\s"'<>]*/i)) == null ? undefined : v114[0]);
          if (!v118) {
            const v122 = (v115 = v121.match(/\/(?:3o|stream)\/[^\s"'<>]+(?:m3u8|txt)/i)) == null ? undefined : v115[0];
            if (v122) {
              v118 = "https://m4uplay.store" + v122;
            }
          }
        }
      }
      if (v118) {
        return v118.replace("master.txt", "master.m3u8");
      }
    } catch (v123) {
      console.error("[Movies4u] Player direct parsing failed:", v123);
    }
    return null;
  });
}
function extractHubCloud(v124, v125) {
  return __async(this, null, function* () {
    var v126;
    var v127;
    var v128;
    var v129;
    var v130;
    var v131;
    var v132;
    try {
      let v133 = v124.replace("hubcloud.foo", "hubcloud.cx").replace("hubcloud.ink", "hubcloud.dad");
      let v134 = yield fetch(v133, {
        headers: __spreadProps(__spreadValues({}, HEADERS), {
          Referer: v125
        }),
        skipSizeCheck: true
      });
      let v135 = yield v134.text();
      let v136 = v134.url || v133;
      const v137 = ((v126 = v135.match(/<a[^>]+href="([^"]*hubcloud\.php[^"]*)"/i)) == null ? undefined : v126[1]) || ((v127 = v135.match(/id="download"[^>]+href="([^"]+)"/i)) == null ? undefined : v127[1]) || ((v128 = v135.match(/var url = '([^']+)'/)) == null ? undefined : v128[1]);
      if (v137) {
        const v138 = new URL(v137, v136).href;
        v134 = yield fetch(v138, {
          headers: __spreadProps(__spreadValues({}, HEADERS), {
            Referer: v136
          }),
          skipSizeCheck: true
        });
        v135 = yield v134.text();
        v136 = v134.url || v138;
      }
      const v139 = ((v129 = v135.match(/class="card-header">([^<]+)</i)) == null ? undefined : v129[1]) || ((v130 = v135.match(/<title>([^<]+)<\/title>/i)) == null ? undefined : v130[1]) || "";
      const v140 = ((v131 = v135.match(/id="size">([^<]+)</i)) == null ? undefined : v131[1]) || ((v132 = v135.match(/([\d.]+\s*(?:GB|MB))/i)) == null ? undefined : v132[1]);
      const v141 = v140 ? v140.trim() : undefined;
      const v142 = extractQuality(v139);
      const v143 = [...v135.matchAll(/<a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi)];
      const v144 = [];
      for (const v145 of v143) {
        const v146 = v145[1];
        const v147 = v145[2].replace(/<[^>]+>/g, " ").toLowerCase();
        if (!v146 || !/(download file|download\s*\[server|fsl|buzzserver|pixeldra|pixelserver|pixel server|s3 server|mega server|pdl server)/i.test(v147)) {
          continue;
        }
        if (/workers\.dev/i.test(v146) && /download file/i.test(v147)) {
          continue;
        }
        v144.push({
          link: new URL(v146, v136).href,
          text: v147
        });
      }
      const v148 = yield Promise.all(v144.map(v149 => __async(this, null, function* () {
        let v150 = v149.link;
        if (/pixeldra|pixelserver|pixel server/i.test(v149.text)) {
          return null;
        } else if (/gpdl\.|download\s*\[server\s*:\s*10gbps/i.test(v149.link + " " + v149.text)) {
          try {
            const v151 = yield fetch(v150, {
              redirect: "manual",
              headers: __spreadProps(__spreadValues({}, HEADERS), {
                Referer: v136
              }),
              skipSizeCheck: true
            });
            const v152 = v151.headers.get("location");
            if (!v152) {
              return null;
            }
            const v153 = yield fetch(new URL(v152, v150).href, {
              redirect: "manual",
              headers: __spreadProps(__spreadValues({}, HEADERS), {
                Referer: v150
              }),
              skipSizeCheck: true
            });
            const v154 = v153.headers.get("location");
            if (!v154) {
              return null;
            }
            v150 = new URL(v154).searchParams.get("link");
            if (!v150) {
              return null;
            }
          } catch (v155) {
            return null;
          }
        } else if (/buzzserver/i.test(v149.text)) {
          try {
            const v156 = yield fetch(v150, {
              redirect: "manual",
              headers: __spreadProps(__spreadValues({}, HEADERS), {
                Referer: v136
              }),
              skipSizeCheck: true
            });
            v150 = v156.headers.get("hx-redirect") || v156.headers.get("location");
            if (!v150) {
              return null;
            }
            v150 = new URL(v150, v149.link).href;
          } catch (v157) {
            return null;
          }
        }
        const v158 = hubCloudServer(v149.text, v149.link);
        if (/HubCloud FSL/i.test(v158)) {
          v150 = wrapFslMkvUrl(v150);
        }
        return {
          source: v158,
          url: safeUrl(v150),
          quality: v142,
          size: v141,
          headers: __spreadProps(__spreadValues({}, HEADERS), {
            Referer: v136
          })
        };
      })));
      return v148.filter(Boolean);
    } catch (v159) {
      return [];
    }
  });
}
function getStreams(v160, v161, v162 = 1, v163 = 1) {
  return __async(this, null, function* () {
    const v164 = yield getBaseUrl();
    const v165 = v160.toString().replace("tmdb:", "");
    let v166 = "";
    let v167 = "";
    try {
      const v168 = v161 === "tv" ? "tv" : "movie";
      const v169 = yield fetch("https://api.themoviedb.org/3/" + v168 + "/" + v165 + "?api_key=" + TMDB_API_KEY, {
        skipSizeCheck: true
      });
      const v170 = yield v169.json();
      v166 = v168 === "tv" ? v170.name : v170.title;
      const v171 = v168 === "tv" ? v170.first_air_date : v170.release_date;
      if (v171) {
        v167 = v171.split("-")[0];
      }
    } catch (v172) {}
    if (!v166) {
      return [];
    }
    let v173 = null;
    try {
      const v174 = yield fetch(v164 + "/?s=" + encodeURIComponent(v166), {
        headers: HEADERS,
        skipSizeCheck: true
      });
      const v175 = yield v174.text();
      const v176 = [...v175.matchAll(/<article[\s\S]*?<a href="([^"]+)"[^>]*rel="bookmark">([^<]+)<\/a>/gi)];
      for (const v177 of v176) {
        const v178 = v177[1];
        const v179 = v177[2].toLowerCase();
        const v180 = v166.toLowerCase();
        if (v179.includes(v180) && (!v167 || v179.includes(v167))) {
          if (v161 === "tv" && !/season|series/i.test(v179)) {
            continue;
          }
          v173 = v178;
          break;
        }
      }
    } catch (v181) {}
    if (!v173) {
      return [];
    }
    let v182 = "";
    try {
      const v183 = yield fetch(v173, {
        headers: HEADERS,
        skipSizeCheck: true
      });
      v182 = yield v183.text();
    } catch (v184) {
      return [];
    }
    const v185 = [];
    const v186 = [...v182.matchAll(/<a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi)];
    for (const v187 of v186) {
      const v188 = v187[1];
      const v189 = v187[2].replace(/<[^>]+>/g, " ").trim();
      if (v188.includes("m4uplay.store")) {
        const v190 = yield extractDirectM3u8(v188);
        if (v190) {
          const v191 = __spreadProps(__spreadValues({}, HEADERS), {
            Referer: "https://m4uplay.store/",
            Origin: "https://m4uplay.store"
          });
          const v192 = parseExtraMetadata(v189, v188);
          const v193 = yield detectDynamicQuality(v190, v191, v189);
          const v194 = yield detectFileSize(v190, v191);
          const v195 = v194 && v194.string ? v194.string : v192.size !== "N/A" ? v192.size : "Unknown";
          v185.push(makeStream(v190, v191, v193, v195, "M4U Player Direct", v166, v167, v192));
        }
      }
    }
    const v196 = [];
    const v197 = [...v182.matchAll(/<h4[^>]*>([\s\S]*?)<\/h4>([\s\S]*?)(?=<h4|$)/gi)];
    for (const v198 of v197) {
      const v199 = v198[1].replace(/<[^>]+>/g, " ").trim();
      const v200 = v198[2];
      if (v161 === "tv" && !new RegExp("season\\s*0?" + v162 + "(?:\\D|$)", "i").test(v199)) {
        continue;
      }
      const v201 = extractQuality(v199);
      const v202 = v199.match(/\b\d+(?:\.\d+)?\s*(?:GB|MB)(?:\/E)?\b/i);
      const v203 = v202 ? v202[0] : undefined;
      const v204 = [...v200.matchAll(/<a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi)];
      for (const v205 of v204) {
        const v206 = v205[1];
        const v207 = v205[2].replace(/<[^>]+>/g, "").trim();
        if (/m4ulinks\./i.test(v206)) {
          v196.push({
            url: v206,
            quality: v201,
            size: v203,
            label: v199,
            anchorText: v207
          });
        }
      }
    }
    for (const v208 of v196) {
      try {
        const v209 = yield fetch(v208.url, {
          headers: __spreadProps(__spreadValues({}, HEADERS), {
            Referer: v173
          }),
          skipSizeCheck: true
        });
        const v210 = yield v209.text();
        const v211 = [];
        const v212 = [...v210.matchAll(/<h[45][^>]*>([\s\S]*?)<\/h[45]>([\s\S]*?)(?=<h[45]|$)/gi)];
        for (const v213 of v212) {
          const v214 = v213[1].replace(/<[^>]+>/g, "").trim();
          const v215 = v213[2];
          if (v161 === "tv") {
            const v216 = v214.match(/episodes?\s*:\s*0*(\d+)/i);
            if (!v216 || parseInt(v216[1]) !== parseInt(v163)) {
              continue;
            }
          }
          const v217 = [...v215.matchAll(/<a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi)];
          for (const v218 of v217) {
            v211.push({
              url: v218[1],
              label: v218[2].replace(/<[^>]+>/g, "").trim()
            });
          }
        }
        for (const v219 of v211) {
          const v220 = (v219.label + " " + v219.url).toLowerCase();
          if (v220.includes("hubcloud")) {
            const v221 = yield extractHubCloud(v219.url, v208.url);
            for (const v222 of v221) {
              const v223 = parseExtraMetadata(v208.label + " " + (v208.size || ""), v219.label);
              const v224 = yield detectDynamicQuality(v222.url, v222.headers, v208.quality);
              const v225 = v222.size || v223.size;
              v185.push(makeStream(v222.url, v222.headers, v224, v225, v222.source, v166, v167, v223));
            }
          } else if (v219.url.includes("m4uplay.store") || v220.includes("m4uplay")) {
            const v226 = yield extractDirectM3u8(v219.url);
            if (v226) {
              const v227 = parseExtraMetadata(v208.label + " " + (v208.size || ""), v219.label);
              const v228 = __spreadProps(__spreadValues({}, HEADERS), {
                Referer: "https://m4uplay.store/",
                Origin: "https://m4uplay.store"
              });
              const v229 = yield detectDynamicQuality(v226, v228, v208.quality);
              const v230 = yield detectFileSize(v226, v228);
              const v231 = v230 && v230.string ? v230.string : v227.size !== "N/A" ? v227.size : "Unknown";
              v185.push(makeStream(v226, v228, v229, v231, "M4U Player Direct", v166, v167, v227));
            }
          }
        }
      } catch (v232) {}
    }
    const v233 = new Set();
    const v234 = v185.filter(v235 => {
      if (!v235.data.url || v233.has(v235.data.url)) {
        return false;
      }
      v233.add(v235.data.url);
      return true;
    });
    v234.sort((v236, v237) => {
      if (v237.qualityRank !== v236.qualityRank) {
        return v237.qualityRank - v236.qualityRank;
      }
      return v237.sizeInMB - v236.sizeInMB;
    });
    return v234.map(v238 => v238.data);
  });
}
module.exports = {
  getStreams: getStreams
};
/*
 * nv-plugins movies4u.js — FULLY DECODED port of the All-in-One-Nuvio provider (4.24.0 merge pass).
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
; /*decoder removed*/ /*string-table removed*/
var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
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
var __spreadProps = (v9, v10) => __defProps(v9, __getOwnPropDescs(v10));
var __async = (v11, v12, v13) => {
  const v14 = {
    dh1: 358
  };
  return new Promise((v15, v16) => {
    const v17 = v1;
    var v18 = v19 => {
      const v20 = v1;
      try {
        v21(v13.next(v19));
      } catch (v22) {
        v16(v22);
      }
    };
    var v23 = v24 => {
      try {
        v21(v13.throw(v24));
      } catch (v25) {
        v16(v25);
      }
    };
    var v21 = v26 => v26.done ? v15(v26.value) : Promise.resolve(v26.value).then(v18, v23);
    v21((v13 = v13.apply(v11, v12)).next());
  });
};
var DOMAINS_URL = "https://raw.githubusercontent.com/phisher98/TVVVV/refs/heads/main/domains.json";
var FALLBACK_URL = "https://new2.movies4u.clinic";
var WORKER_PROXY = "https://lucky-star-3059.salman-sohail93.workers.dev";
var TMDB_API_KEY = "1865f43a0549ca50d341dd9ab8b29f49";
var HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  Referer: FALLBACK_URL,
  Cookie: "xla=s4t"
};
var cachedBaseUrl = null;
function getBaseUrl() {
  const v27 = {
    dh2: 321
  };
  return __async(this, null, function* () {
    const v28 = v1;
    if (cachedBaseUrl) {
      return cachedBaseUrl;
    }
    try {
      const v29 = yield __nvFetch(DOMAINS_URL, {
        skipSizeCheck: true
      });
      const v30 = yield v29.json();
      cachedBaseUrl = v30.movies4u || v30.movies4uhd || FALLBACK_URL;
    } catch (v31) {
      cachedBaseUrl = FALLBACK_URL;
    }
    return cachedBaseUrl;
  });
}
function getInvertedSortTag(v32, v33 = 999999) {
  const v34 = {
    dh3: 360
  };
  const v35 = v2;
  const v36 = Math.max(0, parseInt(v32, 10) || 0);
  const v37 = Math.max(0, v33 - v36);
  const v38 = v37.toString(2).padStart(20, "0");
  return v38.split("").map(v39 => v39 === "1" ? "﻿" : "​").join("");
}
function getQualityRank(v40) {
  const v41 = {
    dh4: 405,
    dh5: 398,
    dh6: 405,
    dh7: 322,
    dh8: 318,
    dh9: 402
  };
  const v42 = v2;
  const v43 = String(v40 || "").toLowerCase();
  if (v43.includes("2160") || v43.includes("4k") || v43.includes("uhd")) {
    return 4;
  }
  if (v43.includes("1080") || v43.includes("fhd") || v43.includes("fullhd")) {
    return 3;
  }
  if (v43.includes("720") || v43.includes("hd")) {
    return 2;
  }
  if (v43.includes("480") || v43.includes("sd") || v43.includes("360")) {
    return 1;
  }
  return 0;
}
function parseSizeToMB(v44) {
  const v45 = {
    dh10: 409
  };
  const v46 = v2;
  if (!v44 || v44 === "N/A") {
    return 0;
  }
  const v47 = String(v44).match(/([\d.]+)\s*(GB|MB)/i);
  if (!v47) {
    return 0;
  }
  const v48 = parseFloat(v47[1]);
  const v49 = v47[2].toUpperCase();
  if (v49 === "GB") {
    return Math.floor(v48 * 1024);
  }
  if (v49 === "MB") {
    return Math.floor(v48);
  }
  return 0;
}
function getResolutionEmoji(v50) {
  const v51 = {
    dh11: 403,
    dh12: 405,
    dh13: 412,
    dh14: 389,
    dh15: 398,
    dh16: 374,
    dh17: 345
  };
  const v52 = v2;
  const v53 = String(v50 || "").toLowerCase();
  if (v53.includes("2160") || v53.includes("4k") || v53.includes("uhd")) {
    return "🌟 4K";
  }
  if (v53.includes("1080") || v53.includes("fhd")) {
    return "🔥 1080p";
  }
  if (v53.includes("720") || v53.includes("hd")) {
    return "💎 720p";
  }
  if (v53.includes("480") || v53.includes("sd")) {
    return "📱 480p";
  }
  return "📺 " + (v50 || "1080p");
}
function extractQuality(v54) {
  const v55 = {
    dh18: 403,
    dh19: 326,
    dh20: 311
  };
  const v56 = v2;
  const v57 = (v54 || "").toLowerCase();
  if (/\b(2160p|4k|uhd)\b/.test(v57)) {
    return "4K";
  }
  if (/\b(1080p|1080)(?!(?:\s*gb|\s*mb|\s*b))\b/.test(v57)) {
    return "1080p";
  }
  if (/\b(720p|720)(?!(?:\s*gb|\s*mb|\s*b))\b/.test(v57)) {
    return "720p";
  }
  if (/\b(480p|480)(?!(?:\s*gb|\s*mb|\s*b))\b/.test(v57)) {
    return "480p";
  }
  if (/\b(360p|360)(?!(?:\s*gb|\s*mb|\s*b))\b/.test(v57)) {
    return "360p";
  }
  return "Unknown";
}
function parseExtraMetadata(v58, v59 = "") {
  const v60 = {
    dh21: 362,
    dh22: 317,
    dh23: 411,
    dh24: 343,
    dh25: 334,
    dh26: 361,
    dh27: 386,
    dh28: 405,
    dh29: 405,
    dh30: 323,
    dh31: 307,
    dh32: 336,
    dh33: 315,
    dh34: 405,
    dh35: 381,
    dh36: 405,
    dh37: 405,
    dh38: 382,
    dh39: 314
  };
  const v61 = v2;
  const v62 = (v58 + " " + v59).toUpperCase();
  let v63 = "Multi-Audio";
  if (v62.includes("DUAL")) {
    v63 = "Multi Audio";
  }
  if (v62.includes("ENGLISH") && !v62.includes("HINDI")) {
    v63 = "English";
  }
  const v64 = v62.match(/(\d+(?:\.\d+)?\s*[MGB]B)/i);
  let v65 = v64 ? v64[0].replace(/\s+/g, "") : "N/A";
  if (v65 === "N/A") {
    const v66 = v62.match(/(\d+\.\d+)\s?G/);
    if (v66) {
      v65 = v66[1] + "GB";
    }
  }
  let v67 = "MKV";
  if (v62.includes("MP4")) {
    v67 = "MP4";
  }
  let v68 = "✨ H.264";
  if (v62.includes("HDR") || v62.includes("DV") || v62.includes("VISION")) {
    v68 = "🌈 HDR";
  } else if (v62.includes("HEVC") || v62.includes("X265") || v62.includes("H265") || v62.includes("H.265")) {
    v68 = "✨ HEVC";
  } else if (v62.includes("X264") || v62.includes("H264") || v62.includes("H.264")) {
    v68 = "✨ H.264";
  }
  let v69 = "🎧 DDP5.1";
  if (v62.includes("ATMOS")) {
    v69 = "🎧 Dolby Atmos";
  } else if (v62.includes("DD5") || v62.includes("DDP5") || v62.includes("5.1")) {
    v69 = "🎧 DDP5.1";
  } else if (v62.includes("AAC")) {
    v69 = "🎧 AAC";
  }
  const v70 = v62.includes("IMAX") ? "👁️ IMAX" : null;
  return {
    language: v63,
    size: v65,
    format: v67,
    codecTag: v68,
    audioCodec: v69,
    isImax: v70
  };
}
function safeUrl(v71) {
  const v72 = {
    dh40: 351,
    dh41: 360
  };
  const v73 = v2;
  if (!v71) {
    return null;
  }
  try {
    const v74 = new URL(v71);
    v74.pathname = v74.pathname.split("/").map(v75 => {
      try {
        return encodeURIComponent(decodeURIComponent(v75));
      } catch (v76) {
        return encodeURIComponent(v75);
      }
    }).join("/");
    return v74.toString();
  } catch (v77) {
    return v71;
  }
}
function wrapFslMkvUrl(v78) {
  const v79 = {
    dh42: 403
  };
  const v80 = v2;
  try {
    const v81 = new URL(v78);
    const v82 = v81.hostname.toLowerCase();
    if (v82 !== "r2.cloudflarestorage.com" && !v82.endsWith(".r2.cloudflarestorage.com")) {
      return v78;
    }
    return WORKER_PROXY + "/media/file.mkv?url=" + encodeURIComponent(v78);
  } catch (v83) {
    return v78;
  }
}
function hubCloudServer(v84, v85) {
  const v86 = {
    dh43: 347,
    dh44: 347,
    dh45: 376,
    dh46: 366
  };
  const v87 = v2;
  const v88 = ((v84 || "") + " " + (v85 || "")).toLowerCase();
  if (/gpdl\.|server\s*:\s*10gbps/.test(v88)) {
    return "HubCloud Pixel 10Gbps";
  }
  if (/fslv2/.test(v88)) {
    return "HubCloud FSLv2";
  }
  if (/fsl/.test(v88)) {
    return "HubCloud FSL";
  }
  if (/s3 server/.test(v88)) {
    return "HubCloud S3";
  }
  if (/mega server/.test(v88)) {
    return "HubCloud Mega";
  }
  if (/pdl server/.test(v88)) {
    return "HubCloud PDL";
  }
  if (/buzzserver/.test(v88)) {
    return "HubCloud BuzzServer";
  }
  if (/pixeldrain/.test(v88)) {
    return "HubCloud Pixeldrain";
  }
  if (/pixel\.|pixelserver/.test(v88)) {
    return "HubCloud Pixel";
  }
  if (/workers\.dev|download file/.test(v88)) {
    return "HubCloud Direct";
  }
  return "HubCloud";
}
function detectFileSize(v89) {
  const v90 = {
    dh47: 400
  };
  return __async(this, arguments, function* (v91, v92 = {}) {
    const v93 = v1;
    try {
      const v94 = yield __nvFetch(v91, {
        method: "HEAD",
        headers: v92,
        skipSizeCheck: true,
        redirect: "follow"
      });
      const v95 = v94.headers.get("content-length");
      if (!v95) {
        return null;
      }
      const v96 = parseInt(v95);
      let v97 = v96 >= 1073741824 ? (v96 / 1073741824).toFixed(1) + "GB" : Math.round(v96 / 1048576) + "MB";
      return {
        bytes: v96,
        string: v97
      };
    } catch (v98) {}
    return null;
  });
}
function detectDynamicQuality(v99) {
  const v100 = {
    dh48: 305,
    dh49: 403,
    dh50: 345
  };
  return __async(this, arguments, function* (v101, v102 = {}, v103 = "", v104 = 120) {
    const v105 = v1;
    try {
      if (!v101) {
        return "1080p";
      }
      const v106 = decodeURIComponent(v101).toLowerCase();
      let v107 = extractQuality(v106);
      if (v107 !== "Unknown") {
        return v107;
      }
      if (v103) {
        v107 = extractQuality(v103.toLowerCase());
        if (v107 !== "Unknown") {
          return v107;
        }
      }
      const v108 = yield detectFileSize(v101, v102);
      if (v108 && v108.bytes) {
        const v109 = v108.bytes / 1073741824;
        const v110 = (parseInt(v104) || 120) / 60;
        const v111 = v109 / v110;
        if (v111 >= 6.5) {
          return "4K";
        }
        if (v111 >= 0.95) {
          return "1080p";
        }
        if (v111 >= 0.35) {
          return "720p";
        }
        return "480p";
      }
    } catch (v112) {}
    return "1080p";
  });
}
function makeStream(v113, v114, v115, v116, v117, v118, v119, v120) {
  const v121 = {
    dh51: 302,
    dh52: 371,
    dh53: 308,
    dh54: 316,
    dh55: 380
  };
  const v122 = v2;
  const v123 = getQualityRank(v115);
  const v124 = parseSizeToMB(v116);
  const v125 = getInvertedSortTag(v123 * 100000 + v124, 999999);
  const v126 = getResolutionEmoji(v115);
  const v127 = (v118 || "").replace(/[^a-zA-Z0-9]/g, ".");
  const v128 = v127 + "." + (v119 || "2026") + "." + (v120.isImax ? "IMAX." : "") + v115 + ".AMZN.WEB-DL." + v120.language.replace(/\s+/g, ".") + "." + v120.audioCodec.replace(/[^\w.]/g, "") + "." + v120.format + ".MSubs";
  const v129 = "🎬 " + v118 + (v119 ? " (" + v119 + ")" : "");
  const v130 = v126 + " | 🗣️ " + v120.language + " | 💾 " + v116;
  const v131 = "🎞️ " + v120.format + " | " + v120.codecTag + " | " + v120.audioCodec;
  const v132 = v120.isImax ? "👁️ IMAX | 🌐 Movies4u | 📦 " + v117 : "🌐 Movies4u | 📦 " + v117;
  const v133 = v128;
  const v134 = v125 + "Movies4u • " + v115 + " • " + v117;
  const v135 = [v129, v130, v131, v132, v133].join("\n");
  return {
    qualityRank: v123,
    sizeInMB: v124,
    data: {
      name: v134,
      title: v135,
      size: v135,
      description: v135,
      url: v113,
      behaviorHints: {
        notWebReady: true,
        proxyHeaders: {
          request: v114
        }
      }
    }
  };
}
function unpackJS(v136, v137, v138, v139) {
  while (v138--) {
    if (v139[v138]) {
      v136 = v136.replace(new RegExp("\\b" + v138.toString(v137) + "\\b", "g"), v139[v138]);
    }
  }
  return v136;
}
function extractDirectM3u8(v140) {
  const v141 = {
    dh56: 409,
    dh57: 409,
    dh58: 302,
    dh59: 407
  };
  return __async(this, null, function* () {
    const v142 = v1;
    var v143;
    var v144;
    var v145;
    var v146;
    var v147;
    var v148;
    try {
      const v149 = yield __nvFetch(v140, {
        headers: __spreadProps(__spreadValues({}, HEADERS), {
          Referer: "https://m4uplay.store/"
        }),
        skipSizeCheck: true
      });
      const v150 = yield v149.text();
      let v151 = ((v143 = v150.match(/https?:\/\/[^\s"'<>]+\.m3u8[^\s"'<>]*/i)) == null ? undefined : v143[0]) || ((v144 = v150.match(/https?:\/\/[^\s"'<>]+master\.txt[^\s"'<>]*/i)) == null ? undefined : v144[0]);
      if (!v151) {
        const v152 = (v145 = v150.match(/\/(?:3o|stream)\/[^\s"'<>]+(?:m3u8|txt)/i)) == null ? undefined : v145[0];
        if (v152) {
          v151 = "https://m4uplay.store" + v152;
        }
      }
      if (!v151) {
        const v153 = v150.match(new RegExp("eval\\(function\\(p,a,c,k,e,d\\).*?\\}\\('(.*)',(\\d+),(\\d+),'(.*)'\\.split\\('\\|'\\)", "s"));
        if (v153) {
          const v154 = unpackJS(v153[1], parseInt(v153[2]), parseInt(v153[3]), v153[4].split("|"));
          v151 = ((v146 = v154.match(/https?:\/\/[^\s"'<>]+\.m3u8[^\s"'<>]*/i)) == null ? undefined : v146[0]) || ((v147 = v154.match(/https?:\/\/[^\s"'<>]+master\.txt[^\s"'<>]*/i)) == null ? undefined : v147[0]);
          if (!v151) {
            const v155 = (v148 = v154.match(/\/(?:3o|stream)\/[^\s"'<>]+(?:m3u8|txt)/i)) == null ? undefined : v148[0];
            if (v155) {
              v151 = "https://m4uplay.store" + v155;
            }
          }
        }
      }
      if (v151) {
        return v151.replace("master.txt", "master.m3u8");
      }
    } catch (v156) {
      console.error("[Movies4u] Player direct parsing failed:", v156);
    }
    return null;
  });
}
function extractHubCloud(v157, v158) {
  const v159 = {
    dh60: 302,
    dh61: 347,
    dh62: 370
  };
  const v160 = {
    dh63: 338,
    dh64: 333,
    dh65: 332,
    dh66: 369,
    dh67: 332,
    dh68: 333,
    dh69: 359,
    dh70: 333,
    dh71: 347
  };
  return __async(this, null, function* () {
    const v161 = v1;
    var v162;
    var v163;
    var v164;
    var v165;
    var v166;
    var v167;
    var v168;
    try {
      let v169 = v157.replace("hubcloud.foo", "hubcloud.cx").replace("hubcloud.ink", "hubcloud.dad");
      let v170 = yield __nvFetch(v169, {
        headers: __spreadProps(__spreadValues({}, HEADERS), {
          Referer: v158
        }),
        skipSizeCheck: true
      });
      let v171 = yield v170.text();
      let v172 = v170.url || v169;
      const v173 = ((v162 = v171.match(/<a[^>]+href="([^"]*hubcloud\.php[^"]*)"/i)) == null ? undefined : v162[1]) || ((v163 = v171.match(/id="download"[^>]+href="([^"]+)"/i)) == null ? undefined : v163[1]) || ((v164 = v171.match(/var url = '([^']+)'/)) == null ? undefined : v164[1]);
      if (v173) {
        const v174 = new URL(v173, v172).href;
        v170 = yield __nvFetch(v174, {
          headers: __spreadProps(__spreadValues({}, HEADERS), {
            Referer: v172
          }),
          skipSizeCheck: true
        });
        v171 = yield v170.text();
        v172 = v170.url || v174;
      }
      const v175 = ((v165 = v171.match(/class="card-header">([^<]+)</i)) == null ? undefined : v165[1]) || ((v166 = v171.match(/<title>([^<]+)<\/title>/i)) == null ? undefined : v166[1]) || "";
      const v176 = ((v167 = v171.match(/id="size">([^<]+)</i)) == null ? undefined : v167[1]) || ((v168 = v171.match(/([\d.]+\s*(?:GB|MB))/i)) == null ? undefined : v168[1]);
      const v177 = v176 ? v176.trim() : undefined;
      const v178 = extractQuality(v175);
      const v179 = [...v171.matchAll(/<a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi)];
      const v180 = [];
      for (const v181 of v179) {
        const v182 = v181[1];
        const v183 = v181[2].replace(/<[^>]+>/g, " ").toLowerCase();
        if (!v182 || !/(download file|download\s*\[server|fsl|buzzserver|pixeldra|pixelserver|pixel server|s3 server|mega server|pdl server)/i.test(v183)) {
          continue;
        }
        if (/workers\.dev/i.test(v182) && /download file/i.test(v183)) {
          continue;
        }
        v180.push({
          link: new URL(v182, v172).href,
          text: v183
        });
      }
      const v184 = yield Promise.all(v180.map(v185 => __async(this, null, function* () {
        const v186 = v161;
        let v187 = v185.link;
        if (/pixeldra|pixelserver|pixel server/i.test(v185.text)) {
          return null;
        } else if (/gpdl\.|download\s*\[server\s*:\s*10gbps/i.test(v185.link + " " + v185.text)) {
          try {
            const v188 = yield __nvFetch(v187, {
              redirect: "manual",
              headers: __spreadProps(__spreadValues({}, HEADERS), {
                Referer: v172
              }),
              skipSizeCheck: true
            });
            const v189 = v188.headers.get("location");
            if (!v189) {
              return null;
            }
            const v190 = yield __nvFetch(new URL(v189, v187).href, {
              redirect: "manual",
              headers: __spreadProps(__spreadValues({}, HEADERS), {
                Referer: v187
              }),
              skipSizeCheck: true
            });
            const v191 = v190.headers.get("location");
            if (!v191) {
              return null;
            }
            v187 = new URL(v191).searchParams.get("link");
            if (!v187) {
              return null;
            }
          } catch (v192) {
            return null;
          }
        } else if (/buzzserver/i.test(v185.text)) {
          try {
            const v193 = yield __nvFetch(v187, {
              redirect: "manual",
              headers: __spreadProps(__spreadValues({}, HEADERS), {
                Referer: v172
              }),
              skipSizeCheck: true
            });
            v187 = v193.headers.get("hx-redirect") || v193.headers.get("location");
            if (!v187) {
              return null;
            }
            v187 = new URL(v187, v185.link).href;
          } catch (v194) {
            return null;
          }
        }
        const v195 = hubCloudServer(v185.text, v185.link);
        if (/HubCloud FSL/i.test(v195)) {
          v187 = wrapFslMkvUrl(v187);
        }
        return {
          source: v195,
          url: safeUrl(v187),
          quality: v178,
          size: v177,
          headers: __spreadProps(__spreadValues({}, HEADERS), {
            Referer: v172
          })
        };
      })));
      return v184.filter(Boolean);
    } catch (v196) {
      return [];
    }
  });
}
function getStreams(v197, v198, v199 = 1, v200 = 1) {
  const v201 = {
    dh72: 406,
    dh73: 342,
    dh74: 405,
    dh75: 310,
    dh76: 305,
    dh77: 409,
    dh78: 327,
    dh79: 353,
    dh80: 414,
    dh81: 353,
    dh82: 375,
    dh83: 397,
    dh84: 405,
    dh85: 375,
    dh86: 348,
    dh87: 375,
    dh88: 370,
    dh89: 304
  };
  const v202 = {
    dh90: 320,
    dh91: 320,
    dh92: 355
  };
  return __async(this, null, function* () {
    const v203 = v1;
    const v204 = yield getBaseUrl();
    const v205 = v197.toString().replace("tmdb:", "");
    let v206 = "";
    let v207 = "";
    try {
      const v208 = v198 === "tv" ? "tv" : "movie";
      const v209 = yield __nvFetch("https://api.themoviedb.org/3/" + v208 + "/" + v205 + "?api_key=" + TMDB_API_KEY, {
        skipSizeCheck: true
      });
      const v210 = yield v209.json();
      v206 = v208 === "tv" ? v210.name : v210.title;
      const v211 = v208 === "tv" ? v210.first_air_date : v210.release_date;
      if (v211) {
        v207 = v211.split("-")[0];
      }
    } catch (v212) {}
    if (!v206) {
      return [];
    }
    let v213 = null;
    try {
      const v214 = yield __nvFetch(v204 + "/?s=" + encodeURIComponent(v206), {
        headers: HEADERS,
        skipSizeCheck: true
      });
      const v215 = yield v214.text();
      const v216 = [...v215.matchAll(/<article[\s\S]*?<a href="([^"]+)"[^>]*rel="bookmark">([^<]+)<\/a>/gi)];
      for (const v217 of v216) {
        const v218 = v217[1];
        const v219 = v217[2].toLowerCase();
        const v220 = v206.toLowerCase();
        if (v219.includes(v220) && (!v207 || v219.includes(v207))) {
          if (v198 === "tv" && !/season|series/i.test(v219)) {
            continue;
          }
          v213 = v218;
          break;
        }
      }
    } catch (v221) {}
    if (!v213) {
      return [];
    }
    let v222 = "";
    try {
      const v223 = yield __nvFetch(v213, {
        headers: HEADERS,
        skipSizeCheck: true
      });
      v222 = yield v223.text();
    } catch (v224) {
      return [];
    }
    const v225 = [];
    const v226 = [...v222.matchAll(/<a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi)];
    for (const v227 of v226) {
      const v228 = v227[1];
      const v229 = v227[2].replace(/<[^>]+>/g, " ").trim();
      if (v228.includes("m4uplay.store")) {
        const v230 = yield extractDirectM3u8(v228);
        if (v230) {
          const v231 = __spreadProps(__spreadValues({}, HEADERS), {
            Referer: "https://m4uplay.store/",
            Origin: "https://m4uplay.store"
          });
          const v232 = parseExtraMetadata(v229, v228);
          const v233 = yield detectDynamicQuality(v230, v231, v229);
          const v234 = yield detectFileSize(v230, v231);
          const v235 = v234 && v234.string ? v234.string : v232.size !== "N/A" ? v232.size : "Unknown";
          v225.push(makeStream(v230, v231, v233, v235, "M4U Player Direct", v206, v207, v232));
        }
      }
    }
    const v236 = [];
    const v237 = [...v222.matchAll(/<h4[^>]*>([\s\S]*?)<\/h4>([\s\S]*?)(?=<h4|$)/gi)];
    for (const v238 of v237) {
      const v239 = v238[1].replace(/<[^>]+>/g, " ").trim();
      const v240 = v238[2];
      if (v198 === "tv" && !new RegExp("season\\s*0?" + v199 + "(?:\\D|$)", "i").test(v239)) {
        continue;
      }
      const v241 = extractQuality(v239);
      const v242 = v239.match(/\b\d+(?:\.\d+)?\s*(?:GB|MB)(?:\/E)?\b/i);
      const v243 = v242 ? v242[0] : undefined;
      const v244 = [...v240.matchAll(/<a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi)];
      for (const v245 of v244) {
        const v246 = v245[1];
        const v247 = v245[2].replace(/<[^>]+>/g, "").trim();
        if (/m4ulinks\./i.test(v246)) {
          v236.push({
            url: v246,
            quality: v241,
            size: v243,
            label: v239,
            anchorText: v247
          });
        }
      }
    }
    for (const v248 of v236) {
      try {
        const v249 = yield __nvFetch(v248.url, {
          headers: __spreadProps(__spreadValues({}, HEADERS), {
            Referer: v213
          }),
          skipSizeCheck: true
        });
        const v250 = yield v249.text();
        const v251 = [];
        const v252 = [...v250.matchAll(/<h[45][^>]*>([\s\S]*?)<\/h[45]>([\s\S]*?)(?=<h[45]|$)/gi)];
        for (const v253 of v252) {
          const v254 = v253[1].replace(/<[^>]+>/g, "").trim();
          const v255 = v253[2];
          if (v198 === "tv") {
            const v256 = v254.match(/episodes?\s*:\s*0*(\d+)/i);
            if (!v256 || parseInt(v256[1]) !== parseInt(v200)) {
              continue;
            }
          }
          const v257 = [...v255.matchAll(/<a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi)];
          for (const v258 of v257) {
            v251.push({
              url: v258[1],
              label: v258[2].replace(/<[^>]+>/g, "").trim()
            });
          }
        }
        for (const v259 of v251) {
          const v260 = (v259.label + " " + v259.url).toLowerCase();
          if (v260.includes("hubcloud")) {
            const v261 = yield extractHubCloud(v259.url, v248.url);
            for (const v262 of v261) {
              const v263 = parseExtraMetadata(v248.label + " " + (v248.size || ""), v259.label);
              const v264 = yield detectDynamicQuality(v262.url, v262.headers, v248.quality);
              const v265 = v262.size || v263.size;
              v225.push(makeStream(v262.url, v262.headers, v264, v265, v262.source, v206, v207, v263));
            }
          } else if (v259.url.includes("m4uplay.store") || v260.includes("m4uplay")) {
            const v266 = yield extractDirectM3u8(v259.url);
            if (v266) {
              const v267 = parseExtraMetadata(v248.label + " " + (v248.size || ""), v259.label);
              const v268 = __spreadProps(__spreadValues({}, HEADERS), {
                Referer: "https://m4uplay.store/",
                Origin: "https://m4uplay.store"
              });
              const v269 = yield detectDynamicQuality(v266, v268, v248.quality);
              const v270 = yield detectFileSize(v266, v268);
              const v271 = v270 && v270.string ? v270.string : v267.size !== "N/A" ? v267.size : "Unknown";
              v225.push(makeStream(v266, v268, v269, v271, "M4U Player Direct", v206, v207, v267));
            }
          }
        }
      } catch (v272) {}
    }
    const v273 = new Set();
    const v274 = v225.filter(v275 => {
      const v276 = v203;
      if (!v275.data.url || v273.has(v275.data.url)) {
        return false;
      }
      v273.add(v275.data.url);
      return true;
    });
    v274.sort((v277, v278) => {
      if (v278.qualityRank !== v277.qualityRank) {
        return v278.qualityRank - v277.qualityRank;
      }
      return v278.sizeInMB - v277.sizeInMB;
    });
    return v274.map(v279 => v279.data);
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
  var PROVIDER = "movies4u";
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