/*
 * nv-plugins hdhub4u.js — rebased on the CURRENT All-in-One-Nuvio upstream file (4.26.0 sync pass).
 * Upstream version: 1.0.1. Decoded + identifier-normalized, zero obfuscator remnants.
 * nv tail re-attached: fail-open quality gate (4.26.0), en/tl language gate, cross-provider dedupe.
 */
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
var __copyProps = (v9, v10, v11, v12) => {
  if (v10 && typeof v10 === "object" || typeof v10 === "function") {
    for (let v13 of __getOwnPropNames(v10)) {
      if (!__hasOwnProp.call(v9, v13) && v13 !== v11) {
        __defProp(v9, v13, {
          get: () => v10[v13],
          enumerable: !(v12 = __getOwnPropDesc(v10, v13)) || v12.enumerable
        });
      }
    }
  }
  return v9;
};
var __toESM = (v14, v15, v16) => {
  v16 = v14 != null ? __create(__getProtoOf(v14)) : {};
  return __copyProps(v15 || !v14 || !v14.__esModule ? __defProp(v16, "default", {
    value: v14,
    enumerable: true
  }) : v16, v14);
};
var __async = (v17, v18, v19) => {
  return new Promise((v20, v21) => {
    var v22 = v23 => {
      try {
        v24(v19.next(v23));
      } catch (v25) {
        v21(v25);
      }
    };
    var v26 = v27 => {
      try {
        v24(v19.throw(v27));
      } catch (v28) {
        v21(v28);
      }
    };
    var v24 = v29 => v29.done ? v20(v29.value) : Promise.resolve(v29.value).then(v22, v26);
    v24((v19 = v19.apply(v17, v18)).next());
  });
};
var import_cheerio_without_node_native2 = __toESM(require("cheerio-without-node-native"));
var TMDB_API_KEY = "439c478a771f35c05022f9feabcca01c";
var TMDB_BASE_URL = "https://api.themoviedb.org/3";
var MAIN_URL = "https://new1.hdhub4u.cl";
var DOMAINS_URL = "https://raw.githubusercontent.com/phisher98/TVVVV/refs/heads/main/domains.json";
var DOMAIN_CACHE_TTL = 14400000;
var HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 Edg/131.0.0.0",
  Cookie: "xla=s4t",
  Referer: MAIN_URL + "/"
};
function updateMainUrl(v30) {
  MAIN_URL = v30;
  HEADERS.Referer = v30 + "/";
}
var domainCacheTimestamp = 0;
function formatBytes(v31) {
  if (!v31 || v31 === 0) {
    return "Unknown";
  }
  const v32 = 1024;
  const v33 = ["Bytes", "KB", "MB", "GB", "TB"];
  const v34 = Math.floor(Math.log(v31) / Math.log(v32));
  return parseFloat((v31 / Math.pow(v32, v34)).toFixed(1)) + " " + v33[v34];
}
function extractServerName(v35) {
  if (!v35) {
    return "Unknown";
  }
  if (v35.startsWith("HubCloud")) {
    const v36 = v35.match(/HubCloud(?:\s*-\s*([^[\]]+))?/);
    if (v36) {
      return v36[1] || "Download";
    } else {
      return "HubCloud";
    }
  }
  if (v35.startsWith("Pixeldrain")) {
    return "Pixeldrain";
  }
  if (v35.startsWith("StreamTape")) {
    return "StreamTape";
  }
  if (v35.startsWith("HubCdn")) {
    return "HubCdn";
  }
  if (v35.startsWith("HbLinks")) {
    return "HbLinks";
  }
  if (v35.startsWith("Hubstream")) {
    return "Hubstream";
  }
  return v35.replace(/^www\./, "").split(".")[0];
}
function rot13(v37) {
  return v37.replace(/[a-zA-Z]/g, function (v38) {
    return String.fromCharCode((v38 <= "Z" ? 90 : 122) >= (v38 = v38.charCodeAt(0) + 13) ? v38 : v38 - 26);
  });
}
var BASE64_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
function atob(v39) {
  if (!v39) {
    return "";
  }
  let v40 = String(v39).replace(/=+$/, "");
  let v41 = "";
  let v42 = 0;
  let v43;
  let v44;
  let v45 = 0;
  while (v44 = v40.charAt(v45++)) {
    v44 = BASE64_CHARS.indexOf(v44);
    if (~v44) {
      v43 = v42 % 4 ? v43 * 64 + v44 : v44;
      if (v42++ % 4) {
        v41 += String.fromCharCode(v43 >> (v42 * -2 & 6) & 255);
      }
    }
  }
  return v41;
}
function cleanTitle(v46) {
  let v47 = v46.replace(/\.[a-zA-Z0-9]{2,4}$/, "");
  const v48 = v47.replace(/WEB[-_. ]?DL/gi, "WEB-DL").replace(/WEB[-_. ]?RIP/gi, "WEBRIP").replace(/H[ .]?265/gi, "H265").replace(/H[ .]?264/gi, "H264").replace(/DDP[ .]?([0-9]\.[0-9])/gi, "DDP$1");
  const v49 = v48.split(/[\s_.]/);
  const v50 = new Set(["WEB-DL", "WEBRIP", "BLURAY", "HDRIP", "DVDRIP", "HDTV", "CAM", "TS", "BRRIP", "BDRIP"]);
  const v51 = new Set(["H264", "H265", "X264", "X265", "HEVC", "AVC"]);
  const v52 = ["AAC", "AC3", "DTS", "MP3", "FLAC", "DD", "DDP", "EAC3"];
  const v53 = new Set(["ATMOS"]);
  const v54 = new Set(["SDR", "HDR", "HDR10", "HDR10+", "DV", "DOLBYVISION"]);
  const v55 = v49.map(v56 => {
    const v57 = v56.toUpperCase();
    if (v50.has(v57)) {
      return v57;
    }
    if (v51.has(v57)) {
      return v57;
    }
    if (v52.some(v58 => v57.startsWith(v58))) {
      return v57;
    }
    if (v53.has(v57)) {
      return v57;
    }
    if (v54.has(v57)) {
      if (v57 === "DOLBYVISION" || v57 === "DV") {
        return "DOLBYVISION";
      } else {
        return v57;
      }
    }
    if (v57 === "NF" || v57 === "CR") {
      return v57;
    }
    return null;
  }).filter(Boolean);
  return [...new Set(v55)].join(" ");
}
function fetchAndUpdateDomain() {
  return __async(this, null, function* () {
    const v59 = Date.now();
    if (v59 - domainCacheTimestamp < DOMAIN_CACHE_TTL) {
      return;
    }
    console.log("[HDHub4u] Fetching latest domain...");
    try {
      const v60 = yield fetch(DOMAINS_URL, {
        method: "GET",
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        }
      });
      if (v60.ok) {
        const v61 = yield v60.json();
        if (v61 && v61.HDHUB4u) {
          const v62 = v61.HDHUB4u;
          if (v62 !== MAIN_URL) {
            console.log("[HDHub4u] Updating domain from " + MAIN_URL + " to " + v62);
            updateMainUrl(v62);
            domainCacheTimestamp = v59;
          }
        }
      }
    } catch (v63) {
      console.error("[HDHub4u] Failed to fetch latest domains: " + v63.message);
    }
  });
}
function getCurrentDomain() {
  return __async(this, null, function* () {
    yield fetchAndUpdateDomain();
    return MAIN_URL;
  });
}
function normalizeTitle(v64) {
  if (!v64) {
    return "";
  }
  return v64.toLowerCase().replace(/\b(the|a|an)\b/g, "").replace(/[:\-_]/g, " ").replace(/\s+/g, " ").replace(/[^\w\s]/g, "").trim();
}
function calculateTitleSimilarity(v65, v66) {
  const v67 = normalizeTitle(v65);
  const v68 = normalizeTitle(v66);
  if (v67 === v68) {
    return 1;
  }
  const v69 = v67.split(/\s+/).filter(v70 => v70.length > 0);
  const v71 = v68.split(/\s+/).filter(v72 => v72.length > 0);
  if (v69.length === 0 || v71.length === 0) {
    return 0;
  }
  const v73 = new Set(v69);
  const v74 = new Set(v71);
  const v75 = v69.filter(v76 => v74.has(v76));
  const v77 = new Set([...v69, ...v71]);
  const v78 = v75.length / v77.size;
  const v79 = v71.filter(v80 => !v73.has(v80)).length;
  let v81 = v78 - v79 * 0.05;
  if (v69.length > 0 && v69.every(v82 => v74.has(v82))) {
    v81 += 0.2;
  }
  return v81;
}
function findBestTitleMatch(v83, v84, v85, v86) {
  if (!v84 || v84.length === 0) {
    return null;
  }
  let v87 = null;
  let v88 = 0;
  for (const v89 of v84) {
    let v90 = calculateTitleSimilarity(v83.title, v89.title);
    if (v83.year && v89.year) {
      const v91 = Math.abs(v83.year - v89.year);
      if (v91 === 0) {
        v90 += 0.2;
      } else if (v91 <= 1) {
        v90 += 0.1;
      } else if (v91 > 5) {
        v90 -= 0.3;
      }
    }
    if (v85 === "tv" && v86) {
      const v92 = v89.title.toLowerCase();
      const v93 = ["season " + v86, "s" + v86, "season " + v86.toString().padStart(2, "0"), "s" + v86.toString().padStart(2, "0")];
      const v94 = v93.some(v95 => v92.includes(v95));
      const v96 = v92.match(/season\s*(\d+)|s(\d+)/i);
      if (v96) {
        const v97 = parseInt(v96[1] || v96[2]);
        if (v97 !== v86) {
          v90 -= 0.8;
        }
      }
      if (v94) {
        v90 += 0.5;
      } else {
        v90 -= 0.3;
      }
    }
    if (v89.title.toLowerCase().includes("2160p") || v89.title.toLowerCase().includes("4k")) {
      v90 += 0.05;
    }
    if (v90 > v88 && v90 > 0.3) {
      v88 = v90;
      v87 = v89;
    }
  }
  if (v87) {
    console.log("[HDHub4u] Best title match: \"" + v87.title + "\" (score: " + v88.toFixed(2) + ")");
  }
  return v87;
}
function getTMDBDetails(v98, v99) {
  return __async(this, null, function* () {
    var v100;
    const v101 = v99 === "tv" ? "tv" : "movie";
    const v102 = TMDB_BASE_URL + "/" + v101 + "/" + v98 + "?api_key=" + TMDB_API_KEY + "&append_to_response=external_ids";
    const v103 = yield fetch(v102, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "User-Agent": "Mozilla/5.0"
      }
    });
    if (!v103.ok) {
      throw new Error("TMDB API error: " + v103.status);
    }
    const v104 = yield v103.json();
    const v105 = v99 === "tv" ? v104.name : v104.title;
    const v106 = v99 === "tv" ? v104.first_air_date : v104.release_date;
    const v107 = v106 ? parseInt(v106.split("-")[0]) : null;
    return {
      title: v105,
      year: v107,
      imdbId: ((v100 = v104.external_ids) == null ? undefined : v100.imdb_id) || null
    };
  });
}
var import_cheerio_without_node_native = __toESM(require("cheerio-without-node-native"));
var import_crypto_js = __toESM(require("crypto-js"));
function getRedirectLinks(v108) {
  return __async(this, null, function* () {
    try {
      const v109 = yield fetch(v108, {
        headers: HEADERS
      });
      if (!v109.ok) {
        throw new Error("HTTP " + v109.status + ": " + v109.statusText);
      }
      const v110 = yield v109.text();
      const v111 = /s\s*\(\s*['"]o['"]\s*,\s*['"]([A-Za-z0-9+/=]+)['"]|ck\s*\(\s*['"]_wp_http_\d+['"]\s*,\s*['"]([^'"]+)['"]/g;
      let v112 = "";
      let v113;
      while ((v113 = v111.exec(v110)) !== null) {
        const v114 = v113[1] || v113[2];
        if (v114) {
          v112 += v114;
        }
      }
      if (!v112) {
        const v115 = v110.match(/window\.location\.href\s*=\s*['"]([^'"]+)['"]/);
        if (v115 && v115[1]) {
          const v116 = v115[1];
          if (v116 !== v108 && !v116.includes(v108)) {
            return yield getRedirectLinks(v116);
          }
        }
        return null;
      }
      const v117 = atob(rot13(atob(atob(v112))));
      const v118 = JSON.parse(v117);
      const v119 = atob(v118.o || "").trim();
      if (v119) {
        return v119;
      }
      const v120 = atob(v118.data || "").trim();
      const v121 = (v118.blog_url || "").trim();
      if (v121 && v120) {
        const v122 = yield fetch(v121 + "?re=" + v120, {
          headers: HEADERS
        });
        const v123 = yield v122.text();
        const v124 = import_cheerio_without_node_native.default.load(v123);
        return (v124("body").text() || v123).trim();
      }
      return null;
    } catch (v125) {
      return null;
    }
  });
}
function vidStackExtractor(v126) {
  return __async(this, null, function* () {
    var v127;
    var v128;
    var v129;
    try {
      const v130 = v126.split("#").pop().split("/").pop();
      const v131 = new URL(v126).origin;
      const v132 = v131 + "/api/v1/video?id=" + v130;
      const v133 = yield fetch(v132, {
        headers: __spreadProps(__spreadValues({}, HEADERS), {
          Referer: v126
        })
      });
      const v134 = (yield v133.text()).trim();
      const v135 = import_crypto_js.default.enc.Utf8.parse("kiemtienmua911ca");
      const v136 = ["1234567890oiuytr", "0123456789abcdef"];
      for (const v137 of v136) {
        try {
          const v138 = import_crypto_js.default.enc.Utf8.parse(v137);
          const v139 = import_crypto_js.default.AES.decrypt({
            ciphertext: import_crypto_js.default.enc.Hex.parse(v134)
          }, v135, {
            iv: v138,
            mode: import_crypto_js.default.mode.CBC,
            padding: import_crypto_js.default.pad.Pkcs7
          });
          const v140 = v139.toString(import_crypto_js.default.enc.Utf8);
          if (v140 && v140.includes("source")) {
            const v141 = (v128 = (v127 = v140.match(/"source":"(.*?)"/)) == null ? undefined : v127[1]) == null ? undefined : v128.replace(/\\/g, "");
            const v142 = [];
            const v143 = (v129 = v140.match(/"subtitle":\{(.*?)\}/)) == null ? undefined : v129[1];
            if (v143) {
              const v144 = /"([^"]+)":\s*"([^"]+)"/g;
              let v145;
              while ((v145 = v144.exec(v143)) !== null) {
                const v146 = v145[1];
                const v147 = v145[2].split("#")[0].replace(/\\/g, "");
                if (v147) {
                  v142.push({
                    language: v146,
                    url: v147.startsWith("http") ? v147 : "" + v131 + v147
                  });
                }
              }
            }
            if (v141) {
              return [{
                source: "Vidstack Hubstream",
                quality: "M3U8",
                url: v141.replace("https:", "http:"),
                headers: {
                  Referer: v126,
                  Origin: v126.split("/").pop()
                },
                subtitles: v142
              }];
            }
          }
        } catch (v148) {}
      }
      return [];
    } catch (v149) {
      return [];
    }
  });
}
function hbLinksExtractor(v150) {
  return __async(this, null, function* () {
    try {
      const v151 = yield fetch(v150, {
        headers: __spreadProps(__spreadValues({}, HEADERS), {
          Referer: v150
        })
      });
      const v152 = yield v151.text();
      const v153 = import_cheerio_without_node_native.default.load(v152);
      const v154 = v153("h3 a, h5 a, div.entry-content p a").map((v155, v156) => v153(v156).attr("href")).get();
      const v157 = yield Promise.all(v154.map(v158 => loadExtractor(v158, v150)));
      return v157.flat().map(v159 => __spreadProps(__spreadValues({}, v159), {
        source: v159.source + " Hblinks"
      }));
    } catch (v160) {
      return [];
    }
  });
}
function pixelDrainExtractor(v161) {
  return __async(this, null, function* () {
    var v162;
    try {
      const v163 = new URL(v161);
      const v164 = v163.protocol + "//" + v163.hostname;
      const v165 = ((v162 = v161.match(/(?:file|u)\/([A-Za-z0-9]+)/)) == null ? undefined : v162[1]) || v161.split("/").pop();
      if (!v165) {
        return [{
          source: "Pixeldrain",
          quality: 0,
          url: v161
        }];
      }
      const v166 = v161.includes("?download") ? v161 : v164 + "/api/file/" + v165 + "?download";
      return [{
        source: "Pixeldrain",
        quality: 0,
        url: v166
      }];
    } catch (v167) {
      return [{
        source: "Pixeldrain",
        quality: 0,
        url: v161
      }];
    }
  });
}
function streamTapeExtractor(v168) {
  return __async(this, null, function* () {
    var v169;
    var v170;
    var v171;
    var v172;
    try {
      const v173 = new URL(v168);
      v173.hostname = "streamtape.com";
      const v174 = yield fetch(v173.toString(), {
        headers: HEADERS
      });
      const v175 = yield v174.text();
      let v176 = (v171 = (v170 = (v169 = v175.match(/document\.getElementById\('videolink'\)\.innerHTML = (.*?);/)) == null ? undefined : v169[1]) == null ? undefined : v170.match(/'(\/\/streamtape\.com\/get_video[^']+)'/)) == null ? undefined : v171[1];
      if (!v176) {
        v176 = (v172 = v175.match(/'(\/\/streamtape\.com\/get_video[^']+)'/)) == null ? undefined : v172[1];
      }
      if (v176) {
        return [{
          source: "StreamTape",
          quality: 720,
          url: "https:" + v176
        }];
      } else {
        return [];
      }
    } catch (v177) {
      return [];
    }
  });
}
function hubCloudExtractor(v178, v179) {
  return __async(this, null, function* () {
    var v180;
    try {
      let v181 = v178.replace("hubcloud.ink", "hubcloud.dad");
      const v182 = yield fetch(v181, {
        headers: __spreadProps(__spreadValues({}, HEADERS), {
          Referer: v179
        })
      });
      let v183 = yield v182.text();
      let v184 = v181;
      if (!v181.includes("hubcloud.php")) {
        let v185 = "";
        const v186 = import_cheerio_without_node_native.default.load(v183);
        const v187 = v186("#download");
        if (v187.length) {
          v185 = v187.attr("href");
        } else {
          const v188 = v183.match(/var url = '([^']*)'/);
          if (v188) {
            v185 = v188[1];
          }
        }
        if (v185) {
          if (!v185.startsWith("http")) {
            const v189 = new URL(v181);
            v185 = v189.protocol + "//" + v189.hostname + "/" + v185.replace(/^\//, "");
          }
          v184 = v185;
          const v190 = yield fetch(v184, {
            headers: __spreadProps(__spreadValues({}, HEADERS), {
              Referer: v181
            })
          });
          v183 = yield v190.text();
        }
      }
      const v191 = import_cheerio_without_node_native.default.load(v183);
      const v192 = v191("i#size").text().trim();
      const v193 = v191("div.card-header").text().trim();
      const v194 = (v180 = v193.match(/(\d{3,4})[pP]/)) == null ? undefined : v180[1];
      const v195 = v194 ? parseInt(v194) : 1080;
      const v196 = cleanTitle(v193);
      const v197 = (v196 ? "[" + v196 + "]" : "") + (v192 ? "[" + v192 + "]" : "");
      const v198 = (() => {
        const v199 = v192.match(/([\d.]+)\s*(GB|MB|KB)/i);
        if (!v199) {
          return 0;
        }
        const v200 = {
          GB: 1073741824,
          MB: 1048576,
          KB: 1024
        };
        return parseFloat(v199[1]) * (v200[v199[2].toUpperCase()] || 0);
      })();
      const v201 = [];
      const v202 = v191("a.btn").get();
      for (const v203 of v202) {
        const v204 = v191(v203).attr("href");
        const v205 = v191(v203).text().toLowerCase();
        const v206 = v193 || v196 || "Unknown";
        if (v205.includes("download file") || v205.includes("fsl server") || v205.includes("s3 server") || v205.includes("fslv2") || v205.includes("mega server") || v204 && v204.includes("r2.dev")) {
          let v207 = "HubCloud";
          if (v204 && v204.includes("r2.dev")) {
            v207 = "Direct R2";
          } else if (v204 && v204.includes("workers.dev")) {
            v207 = "ZipDisk Server";
          } else if (v205.includes("fsl server")) {
            v207 = "HubCloud - FSL";
          } else if (v205.includes("s3 server")) {
            v207 = "HubCloud - S3";
          } else if (v205.includes("fslv2")) {
            v207 = "HubCloud - FSLv2";
          } else if (v205.includes("mega server")) {
            v207 = "HubCloud - Mega";
          }
          v201.push({
            source: v207 + " " + v197,
            quality: v195,
            url: v204,
            size: v198,
            fileName: v206
          });
        } else if (v205.includes("buzzserver")) {
          try {
            const v208 = yield fetch(v204 + "/download", {
              method: "GET",
              headers: __spreadProps(__spreadValues({}, HEADERS), {
                Referer: v204
              }),
              redirect: "manual"
            });
            let v209 = v208.headers.get("hx-redirect") || v208.headers.get("HX-Redirect");
            if (!v209 && v208.url && v208.url !== v204 + "/download") {
              v209 = v208.url;
            }
            if (v209) {
              v201.push({
                source: "HubCloud - BuzzServer " + v197,
                quality: v195,
                url: v209,
                size: v198,
                fileName: v206
              });
            }
          } catch (v210) {}
        } else if (v205.includes("10gbps") || v204 && v204.includes("hubcloud.cx")) {
          let v211 = v204;
          if (v204 && !v204.includes("hubcloud.cx")) {
            try {
              const v212 = yield fetch(v204, {
                method: "GET",
                redirect: "manual"
              });
              const v213 = v212.headers.get("location");
              if (v213 && v213.includes("link=")) {
                v211 = v213.substring(v213.indexOf("link=") + 5);
              }
            } catch (v214) {}
          }
          v201.push({
            source: "HubCloud - 10Gbps " + v197,
            quality: v195,
            url: v211,
            size: v198,
            fileName: v206
          });
        } else if (v205.includes("zipdisk") || v204 && v204.includes("workers.dev")) {
          v201.push({
            source: "ZipDisk Server " + v197,
            quality: v195,
            url: v204,
            size: v198,
            fileName: v206
          });
        } else if (v204 && v204.includes("pixeldra")) {
          const v215 = yield pixelDrainExtractor(v204);
          v201.push(...v215.map(v216 => __spreadProps(__spreadValues({}, v216), {
            source: v216.source + " " + v197,
            size: v198,
            fileName: v206
          })));
        } else if (v204 && !v204.includes("magnet:") && v204.startsWith("http")) {
          const v217 = yield loadExtractor(v204, v184);
          v201.push(...v217.map(v218 => __spreadProps(__spreadValues({}, v218), {
            quality: v218.quality || v195
          })));
        }
      }
      return v201;
    } catch (v219) {
      return [];
    }
  });
}
function hubCdnExtractor(v220, v221) {
  return __async(this, null, function* () {
    try {
      const v222 = yield fetch(v220, {
        headers: __spreadProps(__spreadValues({}, HEADERS), {
          Referer: v221
        })
      });
      const v223 = yield v222.text();
      const v224 = import_cheerio_without_node_native.default.load(v223);
      let v225 = "";
      v224("script").each((v226, v227) => {
        const v228 = v224(v227).html();
        if (v228 && v228.includes("reurl")) {
          v225 = v228;
        }
      });
      if (v225) {
        const v229 = v225.match(/reurl\s*=\s*["']([^"']+)["']/);
        if (v229 && v229[1]) {
          const v230 = v229[1];
          if (v230.includes("?r=")) {
            const v231 = v230.split("?r=").pop();
            try {
              const v232 = atob(v231);
              const v233 = v232.substring(v232.lastIndexOf("link=") + 5);
              if (v233 && v233.startsWith("http")) {
                return [{
                  source: "HubCdn",
                  quality: 1080,
                  url: v233
                }];
              }
            } catch (v234) {}
          } else if (v230.includes("link=")) {
            const v235 = v230.split("link=").pop();
            if (v235 && v235.startsWith("http")) {
              return [{
                source: "HubCdn",
                quality: 1080,
                url: v235
              }];
            }
          } else if (v230.startsWith("http")) {
            return [{
              source: "HubCdn",
              quality: 1080,
              url: v230
            }];
          }
        }
      }
      const v236 = v223.match(/r=([A-Za-z0-9+/=]+)/);
      if (v236 && v236[1]) {
        try {
          const v237 = atob(v236[1]);
          const v238 = v237.substring(v237.lastIndexOf("link=") + 5);
          if (v238 && v238.startsWith("http")) {
            return [{
              source: "HubCdn",
              quality: 1080,
              url: v238
            }];
          }
        } catch (v239) {}
      }
      return [];
    } catch (v240) {
      return [];
    }
  });
}
function loadExtractor(v241) {
  return __async(this, arguments, function* (v242, v243 = MAIN_URL) {
    try {
      const v244 = new URL(v242).hostname;
      const v245 = v242.includes("?id=") || v244.includes("techyboy4u") || v244.includes("gadgetsweb.xyz") || v244.includes("cryptoinsights.site") || v244.includes("bloggingvector") || v244.includes("ampproject.org");
      if (v245) {
        const v246 = yield getRedirectLinks(v242);
        if (v246 && v246 !== v242) {
          return yield loadExtractor(v246, v242);
        }
        return [];
      }
      if (v244.includes("hubcloud")) {
        return yield hubCloudExtractor(v242, v243);
      }
      if (v244.includes("hubcdn")) {
        return yield hubCdnExtractor(v242, v243);
      }
      if (v244.includes("hblinks") || v244.includes("hubstream.dad")) {
        return yield hbLinksExtractor(v242);
      }
      if (v244.includes("hubstream") || v244.includes("vidstack")) {
        return yield vidStackExtractor(v242);
      }
      if (v244.includes("pixeldrain")) {
        return yield pixelDrainExtractor(v242);
      }
      if (v244.includes("streamtape")) {
        return yield streamTapeExtractor(v242);
      }
      if (v244.includes("hdstream4u")) {
        return [{
          source: "HdStream4u",
          quality: 1080,
          url: v242
        }];
      }
      if (v244.includes("hubdrive")) {
        const v247 = yield fetch(v242, {
          headers: __spreadProps(__spreadValues({}, HEADERS), {
            Referer: v243
          })
        });
        const v248 = yield v247.text();
        const v249 = import_cheerio_without_node_native.default.load(v248)(".btn.btn-primary.btn-user.btn-success1.m-1").attr("href");
        if (v249) {
          return yield loadExtractor(v249, v242);
        }
      }
      return [];
    } catch (v250) {
      return [];
    }
  });
}
function search(v251) {
  return __async(this, null, function* () {
    const v252 = new Date().toISOString().split("T")[0];
    const v253 = "https://search.pingora.fyi/collections/post/documents/search?q=" + encodeURIComponent(v251) + "&query_by=post_title,category&query_by_weights=4,2&sort_by=sort_by_date:desc&limit=15&highlight_fields=none&use_cache=true&page=1&analytics_tag=" + v252;
    const v254 = yield fetch(v253, {
      headers: HEADERS
    });
    const v255 = yield v254.json();
    if (!v255 || !v255.hits) {
      return [];
    }
    return v255.hits.map(v256 => {
      const v257 = v256.document;
      const v258 = v257.post_title;
      const v259 = v258.match(/\((\d{4})\)|\b(\d{4})\b/);
      const v260 = v259 ? parseInt(v259[1] || v259[2]) : null;
      let v261 = v257.permalink;
      if (v261 && v261.startsWith("/")) {
        v261 = "" + MAIN_URL + v261;
      }
      return {
        title: v258,
        url: v261,
        poster: v257.post_thumbnail,
        year: v260
      };
    });
  });
}
function getDownloadLinks(v262) {
  return __async(this, null, function* () {
    const v263 = yield getCurrentDomain();
    if (v262.includes("hdhub4u.")) {
      try {
        const v264 = new URL(v262);
        const v265 = new URL(v263);
        v264.hostname = v265.hostname;
        v262 = v264.toString();
      } catch (v266) {}
    }
    const v267 = yield fetch(v262, {
      headers: __spreadProps(__spreadValues({}, HEADERS), {
        Referer: v263 + "/"
      })
    });
    const v268 = yield v267.text();
    const v269 = import_cheerio_without_node_native2.default.load(v268);
    const v270 = v269("h1.page-title span").text();
    const v271 = v270.toLowerCase().includes("movie");
    if (v271) {
      const v272 = v269("h3 a, h4 a").filter((v273, v274) => v269(v274).text().match(/480|720|1080|2160|4K/i));
      const v275 = v269(".page-body > div a").filter((v276, v277) => {
        const v278 = v269(v277).attr("href");
        return v278 && (v278.includes("hdstream4u") || v278.includes("hubstream"));
      });
      const v279 = [...new Set([...v272.map((v280, v281) => v269(v281).attr("href")).get(), ...v275.map((v282, v283) => v269(v283).attr("href")).get()])];
      const v284 = yield Promise.all(v279.map(v285 => loadExtractor(v285, v262)));
      const v286 = v284.flat();
      const v287 = new Set();
      const v288 = v286.filter(v289 => {
        var v290;
        if (!v289.url || v289.url.includes(".zip") || ((v290 = v289.name) == null ? undefined : v290.toLowerCase().includes(".zip"))) {
          return false;
        }
        if (v287.has(v289.url)) {
          return false;
        }
        v287.add(v289.url);
        return true;
      });
      return {
        finalLinks: v288,
        isMovie: v271
      };
    } else {
      const v291 = new Map();
      const v292 = [];
      v269("h3, h4").each((v293, v294) => {
        const v295 = v269(v294);
        const v296 = v295.text();
        const v297 = v295.find("a");
        const v298 = v297.map((v299, v300) => v269(v300).attr("href")).get();
        const v301 = v297.get().some(v302 => v269(v302).text().match(/1080|720|4K|2160/i));
        if (v301) {
          v292.push(...v298);
          return;
        }
        const v303 = v296.match(/(?:EPiSODE\s*(\d+)|E(\d+))/i);
        if (v303) {
          const v304 = parseInt(v303[1] || v303[2]);
          if (!v291.has(v304)) {
            v291.set(v304, []);
          }
          v291.get(v304).push(...v298);
          let v305 = v295.next();
          while (v305.length && v305.get(0).tagName !== "hr") {
            const v306 = v305.find("a[href]").map((v307, v308) => v269(v308).attr("href")).get();
            v291.get(v304).push(...v306);
            v305 = v305.next();
          }
        }
      });
      if (v292.length > 0) {
        yield Promise.all(v292.map(v309 => __async(this, null, function* () {
          try {
            const v310 = yield getRedirectLinks(v309);
            if (!v310) {
              return;
            }
            const v311 = yield fetch(v310, {
              headers: HEADERS
            });
            const v312 = yield v311.text();
            const v313 = import_cheerio_without_node_native2.default.load(v312);
            v313("h5 a, h4 a, h3 a").each((v314, v315) => {
              const v316 = v313(v315).text();
              const v317 = v313(v315).attr("href");
              const v318 = v316.match(/Episode\s*(\d+)/i);
              if (v318 && v317) {
                const v319 = parseInt(v318[1]);
                if (!v291.has(v319)) {
                  v291.set(v319, []);
                }
                v291.get(v319).push(v317);
              }
            });
          } catch (v320) {}
        })));
      }
      const v321 = [];
      v291.forEach((v322, v323) => {
        const v324 = [...new Set(v322)];
        v321.push(...v324.map(v325 => ({
          url: v325,
          episode: v323
        })));
      });
      const v326 = yield Promise.all(v321.map(v327 => __async(this, null, function* () {
        try {
          const v328 = yield loadExtractor(v327.url, v262);
          return v328.map(v329 => __spreadProps(__spreadValues({}, v329), {
            episode: v327.episode
          }));
        } catch (v330) {
          return [];
        }
      })));
      const v331 = v326.flat();
      const v332 = new Set();
      const v333 = v331.filter(v334 => {
        if (!v334.url || v334.url.includes(".zip")) {
          return false;
        }
        if (v332.has(v334.url)) {
          return false;
        }
        v332.add(v334.url);
        return true;
      });
      return {
        finalLinks: v333,
        isMovie: v271
      };
    }
  });
}
function getStreams(v335, v336 = "movie", v337 = null, v338 = null) {
  return __async(this, null, function* () {
    console.log("[HDHub4u] Fetching streams for TMDB ID: " + v335 + ", Type: " + v336);
    try {
      const v339 = yield getTMDBDetails(v335, v336);
      console.log("[HDHub4u] TMDB Info: \"" + v339.title + "\" (" + (v339.year || "N/A") + ")");
      const v340 = v336 === "tv" && v337 ? v339.title + " Season " + v337 : v339.title;
      const v341 = yield search(v340);
      if (v341.length === 0) {
        return [];
      }
      const v342 = findBestTitleMatch(v339, v341, v336, v337);
      const v343 = v342 || v341[0];
      console.log("[HDHub4u] Selected: \"" + v343.title + "\" (" + v343.url + ")");
      const v344 = yield getDownloadLinks(v343.url);
      const v345 = v344.finalLinks;
      let v346 = v345;
      if (v336 === "tv" && v338 !== null) {
        v346 = v345.filter(v347 => v347.episode === v338);
      }
      const v348 = v346.map(v349 => {
        let v350 = v349.fileName && v349.fileName !== "Unknown" ? v349.fileName : v339.title;
        if (v336 === "tv" && v337 && v338) {
          v350 = v339.title + " S" + String(v337).padStart(2, "0") + "E" + String(v338).padStart(2, "0");
        }
        const v351 = extractServerName(v349.source);
        let v352 = "Unknown";
        if (typeof v349.quality === "number" && v349.quality > 0) {
          if (v349.quality >= 2160) {
            v352 = "4K";
          } else if (v349.quality >= 1080) {
            v352 = "1080p";
          } else if (v349.quality >= 720) {
            v352 = "720p";
          } else if (v349.quality >= 480) {
            v352 = "480p";
          }
        } else if (typeof v349.quality === "string") {
          v352 = v349.quality;
        }
        return {
          name: "HDHub4u " + v351,
          title: v350,
          url: v349.url,
          quality: v352,
          size: formatBytes(v349.size),
          headers: v349.headers || undefined,
          provider: "hdhub4u"
        };
      });
      const v353 = {
        "4K": 4,
        "1080p": 2,
        "720p": 1,
        "480p": 0,
        Unknown: -2
      };
      return v348.sort((v354, v355) => (v353[v355.quality] || -3) - (v353[v354.quality] || -3));
    } catch (v356) {
      console.error("[HDHub4u] Scraping error: " + v356.message);
      return [];
    }
  });
}
module.exports = {
  getStreams: getStreams
};
/*
 * nv-plugins hdhub4u.js — FULLY DECODED port of the All-in-One-Nuvio provider (4.24.0 merge pass).
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
/*string-table removed*/
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
  const v16 = {
    dh1: 294,
    dh2: 325
  };
  const v17 = v2;
  if (v13 && typeof v13 === "object" || typeof v13 === "function") {
    for (let v18 of __getOwnPropNames(v13)) {
      if (!__hasOwnProp.call(v12, v18) && v18 !== v14) {
        __defProp(v12, v18, {
          get: () => v13[v18],
          enumerable: !(v15 = __getOwnPropDesc(v13, v18)) || v15.enumerable
        });
      }
    }
  }
  return v12;
};
var __toESM = (v19, v20, v21) => {
  v21 = v19 != null ? __create(__getProtoOf(v19)) : {};
  return __copyProps(v20 || !v19 || !v19.__esModule ? __defProp(v21, "default", {
    value: v19,
    enumerable: true
  }) : v21, v19);
};
var __async = (v22, v23, v24) => {
  return new Promise((v25, v26) => {
    const v27 = {
      dh3: 259
    };
    const v28 = v1;
    var v29 = v30 => {
      const v31 = v1;
      try {
        v32(v24.next(v30));
      } catch (v33) {
        v26(v33);
      }
    };
    var v34 = v35 => {
      const v36 = v1;
      try {
        v32(v24.throw(v35));
      } catch (v37) {
        v26(v37);
      }
    };
    var v32 = v38 => v38.done ? v25(v38.value) : Promise.resolve(v38.value).then(v29, v34);
    v32((v24 = v24.apply(v22, v23)).next());
  });
};
var import_cheerio_without_node_native2 = __toESM(__nvRequire("cheerio-without-node-native"));
var TMDB_API_KEY = "439c478a771f35c05022f9feabcca01c";
var TMDB_BASE_URL = "https://api.themoviedb.org/3";
var MAIN_URL = "https://new1.hdhub4u.cl";
var DOMAINS_URL = "https://raw.githubusercontent.com/phisher98/TVVVV/refs/heads/main/domains.json";
var DOMAIN_CACHE_TTL = 14400000;
var HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 Edg/131.0.0.0",
  Cookie: "xla=s4t",
  Referer: MAIN_URL + "/"
};
function updateMainUrl(v39) {
  const v40 = v2;
  MAIN_URL = v39;
  HEADERS.Referer = v39 + "/";
}
var domainCacheTimestamp = 0;
function formatBytes(v41) {
  const v42 = {
    dh4: 197,
    dh5: 169
  };
  const v43 = v2;
  if (!v41 || v41 === 0) {
    return "Unknown";
  }
  const v44 = 1024;
  const v45 = ["Bytes", "KB", "MB", "GB", "TB"];
  const v46 = Math.floor(Math.log(v41) / Math.log(v44));
  return parseFloat((v41 / Math.pow(v44, v46)).toFixed(1)) + " " + v45[v46];
}
function extractServerName(v47) {
  const v48 = {
    dh6: 214,
    dh7: 264,
    dh8: 282,
    dh9: 171,
    dh10: 215
  };
  const v49 = v2;
  if (!v47) {
    return "Unknown";
  }
  if (v47.startsWith("HubCloud")) {
    const v50 = v47.match(/HubCloud(?:\s*-\s*([^[\]]+))?/);
    if (v50) {
      return v50[1] || "Download";
    } else {
      return "HubCloud";
    }
  }
  if (v47.startsWith("Pixeldrain")) {
    return "Pixeldrain";
  }
  if (v47.startsWith("StreamTape")) {
    return "StreamTape";
  }
  if (v47.startsWith("HubCdn")) {
    return "HubCdn";
  }
  if (v47.startsWith("HbLinks")) {
    return "HbLinks";
  }
  if (v47.startsWith("Hubstream")) {
    return "Hubstream";
  }
  return v47.replace(/^www\./, "").split(".")[0];
}
function rot13(v51) {
  const v52 = {
    dh11: 274
  };
  const v53 = v2;
  return v51.replace(/[a-zA-Z]/g, function (v54) {
    const v55 = v53;
    return String.fromCharCode((v54 <= "Z" ? 90 : 122) >= (v54 = v54.charCodeAt(0) + 13) ? v54 : v54 - 26);
  });
}
var BASE64_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
function atob(v56) {
  const v57 = {
    dh12: 181
  };
  const v58 = v2;
  if (!v56) {
    return "";
  }
  let v59 = String(v56).replace(/=+$/, "");
  let v60 = "";
  let v61 = 0;
  let v62;
  let v63;
  let v64 = 0;
  while (v63 = v59.charAt(v64++)) {
    v63 = BASE64_CHARS.indexOf(v63);
    if (~v63) {
      v62 = v61 % 4 ? v62 * 64 + v63 : v63;
      if (v61++ % 4) {
        v60 += String.fromCharCode(v62 >> (v61 * -2 & 6) & 255);
      }
    }
  }
  return v60;
}
function cleanTitle(v65) {
  const v66 = {
    dh13: 249,
    dh14: 274,
    dh15: 236,
    dh16: 348,
    dh17: 221,
    dh18: 307,
    dh19: 209
  };
  const v67 = {
    dh20: 350,
    dh21: 287,
    dh22: 250
  };
  const v68 = v2;
  let v69 = v65.replace(/\.[a-zA-Z0-9]{2,4}$/, "");
  const v70 = v69.replace(/WEB[-_. ]?DL/gi, "WEB-DL").replace(/WEB[-_. ]?RIP/gi, "WEBRIP").replace(/H[ .]?265/gi, "H265").replace(/H[ .]?264/gi, "H264").replace(/DDP[ .]?([0-9]\.[0-9])/gi, "DDP$1");
  const v71 = v70.split(/[\s_.]/);
  const v72 = new Set(["WEB-DL", "WEBRIP", "BLURAY", "HDRIP", "DVDRIP", "HDTV", "CAM", "TS", "BRRIP", "BDRIP"]);
  const v73 = new Set(["H264", "H265", "X264", "X265", "HEVC", "AVC"]);
  const v74 = ["AAC", "AC3", "DTS", "MP3", "FLAC", "DD", "DDP", "EAC3"];
  const v75 = new Set(["ATMOS"]);
  const v76 = new Set(["SDR", "HDR", "HDR10", "HDR10+", "DV", "DOLBYVISION"]);
  const v77 = v71.map(v78 => {
    const v79 = v68;
    const v80 = v78.toUpperCase();
    if (v72.has(v80)) {
      return v80;
    }
    if (v73.has(v80)) {
      return v80;
    }
    if (v74.some(v81 => v80.startsWith(v81))) {
      return v80;
    }
    if (v75.has(v80)) {
      return v80;
    }
    if (v76.has(v80)) {
      if (v80 === "DOLBYVISION" || v80 === "DV") {
        return "DOLBYVISION";
      } else {
        return v80;
      }
    }
    if (v80 === "NF" || v80 === "CR") {
      return v80;
    }
    return null;
  }).filter(Boolean);
  return [...new Set(v77)].join(" ");
}
function fetchAndUpdateDomain() {
  const v82 = {
    dh23: 333
  };
  return __async(this, null, function* () {
    const v83 = v1;
    const v84 = Date.now();
    if (v84 - domainCacheTimestamp < DOMAIN_CACHE_TTL) {
      return;
    }
    console.log("[HDHub4u] Fetching latest domain...");
    try {
      const v85 = yield __nvFetch(DOMAINS_URL, {
        method: "GET",
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        }
      });
      if (v85.ok) {
        const v86 = yield v85.json();
        if (v86 && v86.HDHUB4u) {
          const v87 = v86.HDHUB4u;
          if (v87 !== MAIN_URL) {
            console.log("[HDHub4u] Updating domain from " + MAIN_URL + " to " + v87);
            updateMainUrl(v87);
            domainCacheTimestamp = v84;
          }
        }
      }
    } catch (v88) {
      console.error("[HDHub4u] Failed to fetch latest domains: " + v88.message);
    }
  });
}
function getCurrentDomain() {
  return __async(this, null, function* () {
    yield fetchAndUpdateDomain();
    return MAIN_URL;
  });
}
function normalizeTitle(v89) {
  const v90 = {
    dh24: 275,
    dh25: 274,
    dh26: 274,
    dh27: 274,
    dh28: 247
  };
  const v91 = v2;
  if (!v89) {
    return "";
  }
  return v89.toLowerCase().replace(/\b(the|a|an)\b/g, "").replace(/[:\-_]/g, " ").replace(/\s+/g, " ").replace(/[^\w\s]/g, "").trim();
}
function calculateTitleSimilarity(v92, v93) {
  const v94 = {
    dh29: 320,
    dh30: 353,
    dh31: 329
  };
  const v95 = v2;
  const v96 = normalizeTitle(v92);
  const v97 = normalizeTitle(v93);
  if (v96 === v97) {
    return 1;
  }
  const v98 = v96.split(/\s+/).filter(v99 => v99.length > 0);
  const v100 = v97.split(/\s+/).filter(v101 => v101.length > 0);
  if (v98.length === 0 || v100.length === 0) {
    return 0;
  }
  const v102 = new Set(v98);
  const v103 = new Set(v100);
  const v104 = v98.filter(v105 => v103.has(v105));
  const v106 = new Set([...v98, ...v100]);
  const v107 = v104.length / v106.size;
  const v108 = v100.filter(v109 => !v102.has(v109)).length;
  let v110 = v107 - v108 * 0.05;
  if (v98.length > 0 && v98.every(v111 => v103.has(v111))) {
    v110 += 0.2;
  }
  return v110;
}
function findBestTitleMatch(v112, v113, v114, v115) {
  const v116 = {
    dh32: 329,
    dh33: 343,
    dh34: 275,
    dh35: 303,
    dh36: 239,
    dh37: 179,
    dh38: 314
  };
  const v117 = v2;
  if (!v113 || v113.length === 0) {
    return null;
  }
  let v118 = null;
  let v119 = 0;
  for (const v120 of v113) {
    let v121 = calculateTitleSimilarity(v112.title, v120.title);
    if (v112.year && v120.year) {
      const v122 = Math.abs(v112.year - v120.year);
      if (v122 === 0) {
        v121 += 0.2;
      } else if (v122 <= 1) {
        v121 += 0.1;
      } else if (v122 > 5) {
        v121 -= 0.3;
      }
    }
    if (v114 === "tv" && v115) {
      const v123 = v120.title.toLowerCase();
      const v124 = ["season " + v115, "s" + v115, "season " + v115.toString().padStart(2, "0"), "s" + v115.toString().padStart(2, "0")];
      const v125 = v124.some(v126 => v123.includes(v126));
      const v127 = v123.match(/season\s*(\d+)|s(\d+)/i);
      if (v127) {
        const v128 = parseInt(v127[1] || v127[2]);
        if (v128 !== v115) {
          v121 -= 0.8;
        }
      }
      if (v125) {
        v121 += 0.5;
      } else {
        v121 -= 0.3;
      }
    }
    if (v120.title.toLowerCase().includes("2160p") || v120.title.toLowerCase().includes("4k")) {
      v121 += 0.05;
    }
    if (v121 > v119 && v121 > 0.3) {
      v119 = v121;
      v118 = v120;
    }
  }
  if (v118) {
    console.log("[HDHub4u] Best title match: \"" + v118.title + "\" (score: " + v119.toFixed(2) + ")");
  }
  return v118;
}
function getTMDBDetails(v129, v130) {
  const v131 = {
    dh39: 359,
    dh40: 360,
    dh41: 342,
    dh42: 319,
    dh43: 363
  };
  return __async(this, null, function* () {
    const v132 = v1;
    var v133;
    const v134 = v130 === "tv" ? "tv" : "movie";
    const v135 = TMDB_BASE_URL + "/" + v134 + "/" + v129 + "?api_key=" + TMDB_API_KEY + "&append_to_response=external_ids";
    const v136 = yield __nvFetch(v135, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "User-Agent": "Mozilla/5.0"
      }
    });
    if (!v136.ok) {
      throw new Error("TMDB API error: " + v136.status);
    }
    const v137 = yield v136.json();
    const v138 = v130 === "tv" ? v137.name : v137.title;
    const v139 = v130 === "tv" ? v137.first_air_date : v137.release_date;
    const v140 = v139 ? parseInt(v139.split("-")[0]) : null;
    return {
      title: v138,
      year: v140,
      imdbId: ((v133 = v137.external_ids) == null ? undefined : v133.imdb_id) || null
    };
  });
}
var import_cheerio_without_node_native = __toESM(__nvRequire("cheerio-without-node-native"));
var import_crypto_js = __toESM(__nvRequire("crypto-js"));
/*decoder removed*/
function getRedirectLinks(v141) {
  const v142 = {
    dh44: 301,
    dh45: 201,
    dh46: 340,
    dh47: 247,
    dh48: 313,
    dh49: 185
  };
  return __async(this, null, function* () {
    const v143 = v1;
    try {
      const v144 = yield __nvFetch(v141, {
        headers: HEADERS
      });
      if (!v144.ok) {
        throw new Error("HTTP " + v144.status + ": " + v144.statusText);
      }
      const v145 = yield v144.text();
      const v146 = /s\s*\(\s*['"]o['"]\s*,\s*['"]([A-Za-z0-9+/=]+)['"]|ck\s*\(\s*['"]_wp_http_\d+['"]\s*,\s*['"]([^'"]+)['"]/g;
      let v147 = "";
      let v148;
      while ((v148 = v146.exec(v145)) !== null) {
        const v149 = v148[1] || v148[2];
        if (v149) {
          v147 += v149;
        }
      }
      if (!v147) {
        const v150 = v145.match(/window\.location\.href\s*=\s*['"]([^'"]+)['"]/);
        if (v150 && v150[1]) {
          const v151 = v150[1];
          if (v151 !== v141 && !v151.includes(v141)) {
            return yield getRedirectLinks(v151);
          }
        }
        return null;
      }
      const v152 = atob(rot13(atob(atob(v147))));
      const v153 = JSON.parse(v152);
      const v154 = atob(v153.o || "").trim();
      if (v154) {
        return v154;
      }
      const v155 = atob(v153.data || "").trim();
      const v156 = (v153.blog_url || "").trim();
      if (v156 && v155) {
        const v157 = yield __nvFetch(v156 + "?re=" + v155, {
          headers: HEADERS
        });
        const v158 = yield v157.text();
        const v159 = import_cheerio_without_node_native.default.load(v158);
        return (v159("body").text() || v158).trim();
      }
      return null;
    } catch (v160) {
      return null;
    }
  });
}
function vidStackExtractor(v161) {
  const v162 = {
    dh50: 322,
    dh51: 247,
    dh52: 285,
    dh53: 316,
    dh54: 212,
    dh55: 343,
    dh56: 223
  };
  return __async(this, null, function* () {
    const v163 = v1;
    var v164;
    var v165;
    var v166;
    try {
      const v167 = v161.split("#").pop().split("/").pop();
      const v168 = new URL(v161).origin;
      const v169 = v168 + "/api/v1/video?id=" + v167;
      const v170 = yield __nvFetch(v169, {
        headers: __spreadProps(__spreadValues({}, HEADERS), {
          Referer: v161
        })
      });
      const v171 = (yield v170.text()).trim();
      const v172 = import_crypto_js.default.enc.Utf8.parse("kiemtienmua911ca");
      const v173 = ["1234567890oiuytr", "0123456789abcdef"];
      for (const v174 of v173) {
        try {
          const v175 = import_crypto_js.default.enc.Utf8.parse(v174);
          const v176 = import_crypto_js.default.AES.decrypt({
            ciphertext: import_crypto_js.default.enc.Hex.parse(v171)
          }, v172, {
            iv: v175,
            mode: import_crypto_js.default.mode.CBC,
            padding: import_crypto_js.default.pad.Pkcs7
          });
          const v177 = v176.toString(import_crypto_js.default.enc.Utf8);
          if (v177 && v177.includes("source")) {
            const v178 = (v165 = (v164 = v177.match(/"source":"(.*?)"/)) == null ? undefined : v164[1]) == null ? undefined : v165.replace(/\\/g, "");
            const v179 = [];
            const v180 = (v166 = v177.match(/"subtitle":\{(.*?)\}/)) == null ? undefined : v166[1];
            if (v180) {
              const v181 = /"([^"]+)":\s*"([^"]+)"/g;
              let v182;
              while ((v182 = v181.exec(v180)) !== null) {
                const v183 = v182[1];
                const v184 = v182[2].split("#")[0].replace(/\\/g, "");
                if (v184) {
                  v179.push({
                    language: v183,
                    url: v184.startsWith("http") ? v184 : "" + v168 + v184
                  });
                }
              }
            }
            if (v178) {
              return [{
                source: "Vidstack Hubstream",
                quality: "M3U8",
                url: v178.replace("https:", "http:"),
                headers: {
                  Referer: v161,
                  Origin: v161.split("/").pop()
                },
                subtitles: v179
              }];
            }
          }
        } catch (v185) {}
      }
      return [];
    } catch (v186) {
      return [];
    }
  });
}
function hbLinksExtractor(v187) {
  const v188 = {
    dh57: 296,
    dh58: 233
  };
  return __async(this, null, function* () {
    const v189 = v1;
    try {
      const v190 = yield __nvFetch(v187, {
        headers: __spreadProps(__spreadValues({}, HEADERS), {
          Referer: v187
        })
      });
      const v191 = yield v190.text();
      const v192 = import_cheerio_without_node_native.default.load(v191);
      const v193 = v192("h3 a, h5 a, div.entry-content p a").map((v194, v195) => v192(v195).attr("href")).get();
      const v196 = yield Promise.all(v193.map(v197 => loadExtractor(v197, v187)));
      return v196.flat().map(v198 => __spreadProps(__spreadValues({}, v198), {
        source: v198.source + " Hblinks"
      }));
    } catch (v199) {
      return [];
    }
  });
}
function pixelDrainExtractor(v200) {
  const v201 = {
    dh59: 210,
    dh60: 215
  };
  return __async(this, null, function* () {
    const v202 = v1;
    var v203;
    try {
      const v204 = new URL(v200);
      const v205 = v204.protocol + "//" + v204.hostname;
      const v206 = ((v203 = v200.match(/(?:file|u)\/([A-Za-z0-9]+)/)) == null ? undefined : v203[1]) || v200.split("/").pop();
      if (!v206) {
        return [{
          source: "Pixeldrain",
          quality: 0,
          url: v200
        }];
      }
      const v207 = v200.includes("?download") ? v200 : v205 + "/api/file/" + v206 + "?download";
      return [{
        source: "Pixeldrain",
        quality: 0,
        url: v207
      }];
    } catch (v208) {
      return [{
        source: "Pixeldrain",
        quality: 0,
        url: v200
      }];
    }
  });
}
function streamTapeExtractor(v209) {
  const v210 = {
    dh61: 324,
    dh62: 280
  };
  return __async(this, null, function* () {
    const v211 = v1;
    var v212;
    var v213;
    var v214;
    var v215;
    try {
      const v216 = new URL(v209);
      v216.hostname = "streamtape.com";
      const v217 = yield __nvFetch(v216.toString(), {
        headers: HEADERS
      });
      const v218 = yield v217.text();
      let v219 = (v214 = (v213 = (v212 = v218.match(/document\.getElementById\('videolink'\)\.innerHTML = (.*?);/)) == null ? undefined : v212[1]) == null ? undefined : v213.match(/'(\/\/streamtape\.com\/get_video[^']+)'/)) == null ? undefined : v214[1];
      if (!v219) {
        v219 = (v215 = v218.match(/'(\/\/streamtape\.com\/get_video[^']+)'/)) == null ? undefined : v215[1];
      }
      if (v219) {
        return [{
          source: "StreamTape",
          quality: 720,
          url: "https:" + v219
        }];
      } else {
        return [];
      }
    } catch (v220) {
      return [];
    }
  });
}
function hubCloudExtractor(v221, v222) {
  const v223 = {
    dh63: 303,
    dh64: 199,
    dh65: 329,
    dh66: 330,
    dh67: 280,
    dh68: 201,
    dh69: 357,
    dh70: 306,
    dh71: 247,
    dh72: 201,
    dh73: 308,
    dh74: 303,
    dh75: 188,
    dh76: 328,
    dh77: 303,
    dh78: 252,
    dh79: 349,
    dh80: 361,
    dh81: 233,
    dh82: 193,
    dh83: 172,
    dh84: 257,
    dh85: 260,
    dh86: 231,
    dh87: 182
  };
  return __async(this, null, function* () {
    const v224 = v1;
    var v225;
    try {
      let v226 = v221.replace("hubcloud.ink", "hubcloud.dad");
      const v227 = yield __nvFetch(v226, {
        headers: __spreadProps(__spreadValues({}, HEADERS), {
          Referer: v222
        })
      });
      let v228 = yield v227.text();
      let v229 = v226;
      if (!v226.includes("hubcloud.php")) {
        let v230 = "";
        const v231 = import_cheerio_without_node_native.default.load(v228);
        const v232 = v231("#download");
        if (v232.length) {
          v230 = v232.attr("href");
        } else {
          const v233 = v228.match(/var url = '([^']*)'/);
          if (v233) {
            v230 = v233[1];
          }
        }
        if (v230) {
          if (!v230.startsWith("http")) {
            const v234 = new URL(v226);
            v230 = v234.protocol + "//" + v234.hostname + "/" + v230.replace(/^\//, "");
          }
          v229 = v230;
          const v235 = yield __nvFetch(v229, {
            headers: __spreadProps(__spreadValues({}, HEADERS), {
              Referer: v226
            })
          });
          v228 = yield v235.text();
        }
      }
      const v236 = import_cheerio_without_node_native.default.load(v228);
      const v237 = v236("i#size").text().trim();
      const v238 = v236("div.card-header").text().trim();
      const v239 = (v225 = v238.match(/(\d{3,4})[pP]/)) == null ? undefined : v225[1];
      const v240 = v239 ? parseInt(v239) : 1080;
      const v241 = cleanTitle(v238);
      const v242 = (v241 ? "[" + v241 + "]" : "") + (v237 ? "[" + v237 + "]" : "");
      const v243 = (() => {
        const v244 = v237.match(/([\d.]+)\s*(GB|MB|KB)/i);
        if (!v244) {
          return 0;
        }
        const v245 = {
          GB: 1073741824,
          MB: 1048576,
          KB: 1024
        };
        return parseFloat(v244[1]) * (v245[v244[2].toUpperCase()] || 0);
      })();
      const v246 = [];
      const v247 = v236("a.btn").get();
      for (const v248 of v247) {
        const v249 = v236(v248).attr("href");
        const v250 = v236(v248).text().toLowerCase();
        const v251 = v238 || v241 || "Unknown";
        if (v250.includes("download file") || v250.includes("fsl server") || v250.includes("s3 server") || v250.includes("fslv2") || v250.includes("mega server") || v249 && v249.includes("r2.dev")) {
          let v252 = "HubCloud";
          if (v249 && v249.includes("r2.dev")) {
            v252 = "Direct R2";
          } else if (v249 && v249.includes("workers.dev")) {
            v252 = "ZipDisk Server";
          } else if (v250.includes("fsl server")) {
            v252 = "HubCloud - FSL";
          } else if (v250.includes("s3 server")) {
            v252 = "HubCloud - S3";
          } else if (v250.includes("fslv2")) {
            v252 = "HubCloud - FSLv2";
          } else if (v250.includes("mega server")) {
            v252 = "HubCloud - Mega";
          }
          v246.push({
            source: v252 + " " + v242,
            quality: v240,
            url: v249,
            size: v243,
            fileName: v251
          });
        } else if (v250.includes("buzzserver")) {
          try {
            const v253 = yield __nvFetch(v249 + "/download", {
              method: "GET",
              headers: __spreadProps(__spreadValues({}, HEADERS), {
                Referer: v249
              }),
              redirect: "manual"
            });
            let v254 = v253.headers.get("hx-redirect") || v253.headers.get("HX-Redirect");
            if (!v254 && v253.url && v253.url !== v249 + "/download") {
              v254 = v253.url;
            }
            if (v254) {
              v246.push({
                source: "HubCloud - BuzzServer " + v242,
                quality: v240,
                url: v254,
                size: v243,
                fileName: v251
              });
            }
          } catch (v255) {}
        } else if (v250.includes("10gbps") || v249 && v249.includes("hubcloud.cx")) {
          let v256 = v249;
          if (v249 && !v249.includes("hubcloud.cx")) {
            try {
              const v257 = yield __nvFetch(v249, {
                method: "GET",
                redirect: "manual"
              });
              const v258 = v257.headers.get("location");
              if (v258 && v258.includes("link=")) {
                v256 = v258.substring(v258.indexOf("link=") + 5);
              }
            } catch (v259) {}
          }
          v246.push({
            source: "HubCloud - 10Gbps " + v242,
            quality: v240,
            url: v256,
            size: v243,
            fileName: v251
          });
        } else if (v250.includes("zipdisk") || v249 && v249.includes("workers.dev")) {
          v246.push({
            source: "ZipDisk Server " + v242,
            quality: v240,
            url: v249,
            size: v243,
            fileName: v251
          });
        } else if (v249 && v249.includes("pixeldra")) {
          const v260 = yield pixelDrainExtractor(v249);
          v246.push(...v260.map(v261 => __spreadProps(__spreadValues({}, v261), {
            source: v261.source + " " + v242,
            size: v243,
            fileName: v251
          })));
        } else if (v249 && !v249.includes("magnet:") && v249.startsWith("http")) {
          const v262 = yield loadExtractor(v249, v229);
          v246.push(...v262.map(v263 => __spreadProps(__spreadValues({}, v263), {
            quality: v263.quality || v240
          })));
        }
      }
      return v246;
    } catch (v264) {
      return [];
    }
  });
}
function hubCdnExtractor(v265, v266) {
  const v267 = {
    dh88: 290,
    dh89: 260,
    dh90: 230,
    dh91: 215,
    dh92: 214,
    dh93: 280,
    dh94: 214
  };
  const v268 = {
    dh95: 317,
    dh96: 303,
    dh97: 305
  };
  return __async(this, null, function* () {
    const v269 = v1;
    try {
      const v270 = yield __nvFetch(v265, {
        headers: __spreadProps(__spreadValues({}, HEADERS), {
          Referer: v266
        })
      });
      const v271 = yield v270.text();
      const v272 = import_cheerio_without_node_native.default.load(v271);
      let v273 = "";
      v272("script").each((v274, v275) => {
        const v276 = v269;
        const v277 = v272(v275).html();
        if (v277 && v277.includes("reurl")) {
          v273 = v277;
        }
      });
      if (v273) {
        const v278 = v273.match(/reurl\s*=\s*["']([^"']+)["']/);
        if (v278 && v278[1]) {
          const v279 = v278[1];
          if (v279.includes("?r=")) {
            const v280 = v279.split("?r=").pop();
            try {
              const v281 = atob(v280);
              const v282 = v281.substring(v281.lastIndexOf("link=") + 5);
              if (v282 && v282.startsWith("http")) {
                return [{
                  source: "HubCdn",
                  quality: 1080,
                  url: v282
                }];
              }
            } catch (v283) {}
          } else if (v279.includes("link=")) {
            const v284 = v279.split("link=").pop();
            if (v284 && v284.startsWith("http")) {
              return [{
                source: "HubCdn",
                quality: 1080,
                url: v284
              }];
            }
          } else if (v279.startsWith("http")) {
            return [{
              source: "HubCdn",
              quality: 1080,
              url: v279
            }];
          }
        }
      }
      const v285 = v271.match(/r=([A-Za-z0-9+/=]+)/);
      if (v285 && v285[1]) {
        try {
          const v286 = atob(v285[1]);
          const v287 = v286.substring(v286.lastIndexOf("link=") + 5);
          if (v287 && v287.startsWith("http")) {
            return [{
              source: "HubCdn",
              quality: 1080,
              url: v287
            }];
          }
        } catch (v288) {}
      }
      return [];
    } catch (v289) {
      return [];
    }
  });
}
function loadExtractor(v290) {
  const v291 = {
    dh98: 187,
    dh99: 321,
    dh100: 341,
    dh101: 232,
    dh102: 303,
    dh103: 346,
    dh104: 303,
    dh105: 220,
    dh106: 303,
    dh107: 357
  };
  return __async(this, arguments, function* (v292, v293 = MAIN_URL) {
    const v294 = v1;
    try {
      const v295 = new URL(v292).hostname;
      const v296 = v292.includes("?id=") || v295.includes("techyboy4u") || v295.includes("gadgetsweb.xyz") || v295.includes("cryptoinsights.site") || v295.includes("bloggingvector") || v295.includes("ampproject.org");
      if (v296) {
        const v297 = yield getRedirectLinks(v292);
        if (v297 && v297 !== v292) {
          return yield loadExtractor(v297, v292);
        }
        return [];
      }
      if (v295.includes("hubcloud")) {
        return yield hubCloudExtractor(v292, v293);
      }
      if (v295.includes("hubcdn")) {
        return yield hubCdnExtractor(v292, v293);
      }
      if (v295.includes("hblinks") || v295.includes("hubstream.dad")) {
        return yield hbLinksExtractor(v292);
      }
      if (v295.includes("hubstream") || v295.includes("vidstack")) {
        return yield vidStackExtractor(v292);
      }
      if (v295.includes("pixeldrain")) {
        return yield pixelDrainExtractor(v292);
      }
      if (v295.includes("streamtape")) {
        return yield streamTapeExtractor(v292);
      }
      if (v295.includes("hdstream4u")) {
        return [{
          source: "HdStream4u",
          quality: 1080,
          url: v292
        }];
      }
      if (v295.includes("hubdrive")) {
        const v298 = yield __nvFetch(v292, {
          headers: __spreadProps(__spreadValues({}, HEADERS), {
            Referer: v293
          })
        });
        const v299 = yield v298.text();
        const v300 = import_cheerio_without_node_native.default.load(v299)(".btn.btn-primary.btn-user.btn-success1.m-1").attr("href");
        if (v300) {
          return yield loadExtractor(v300, v292);
        }
      }
      return [];
    } catch (v301) {
      return [];
    }
  });
}
function search(v302) {
  const v303 = {
    dh108: 215,
    dh109: 227,
    dh110: 248
  };
  return __async(this, null, function* () {
    const v304 = {
      dh111: 263,
      dh112: 213,
      dh113: 214,
      dh114: 176
    };
    const v305 = v1;
    const v306 = new Date().toISOString().split("T")[0];
    const v307 = "https://search.pingora.fyi/collections/post/documents/search?q=" + encodeURIComponent(v302) + "&query_by=post_title,category&query_by_weights=4,2&sort_by=sort_by_date:desc&limit=15&highlight_fields=none&use_cache=true&page=1&analytics_tag=" + v306;
    const v308 = yield __nvFetch(v307, {
      headers: HEADERS
    });
    const v309 = yield v308.json();
    if (!v309 || !v309.hits) {
      return [];
    }
    return v309.hits.map(v310 => {
      const v311 = v305;
      const v312 = v310.document;
      const v313 = v312.post_title;
      const v314 = v313.match(/\((\d{4})\)|\b(\d{4})\b/);
      const v315 = v314 ? parseInt(v314[1] || v314[2]) : null;
      let v316 = v312.permalink;
      if (v316 && v316.startsWith("/")) {
        v316 = "" + MAIN_URL + v316;
      }
      return {
        title: v313,
        url: v316,
        poster: v312.post_thumbnail,
        year: v315
      };
    });
  });
}
function getDownloadLinks(v317) {
  const v318 = {
    dh115: 345,
    dh116: 357,
    dh117: 304,
    dh118: 303,
    dh119: 339,
    dh120: 248,
    dh121: 233,
    dh122: 207,
    dh123: 329,
    dh124: 253
  };
  const v319 = {
    dh125: 193,
    dh126: 303,
    dh127: 202
  };
  const v320 = {
    dh128: 182
  };
  const v321 = {
    dh129: 191,
    dh130: 248,
    dh131: 182,
    dh132: 233
  };
  const v322 = {
    dh133: 275,
    dh134: 303
  };
  const v323 = {
    dh135: 330,
    dh136: 220,
    dh137: 303
  };
  return __async(this, null, function* () {
    const v324 = {
      dh138: 193
    };
    const v325 = {
      dh139: 211,
      dh140: 189
    };
    const v326 = v1;
    const v327 = yield getCurrentDomain();
    if (v317.includes("hdhub4u.")) {
      try {
        const v328 = new URL(v317);
        const v329 = new URL(v327);
        v328.hostname = v329.hostname;
        v317 = v328.toString();
      } catch (v330) {}
    }
    const v331 = yield __nvFetch(v317, {
      headers: __spreadProps(__spreadValues({}, HEADERS), {
        Referer: v327 + "/"
      })
    });
    const v332 = yield v331.text();
    const v333 = import_cheerio_without_node_native2.default.load(v332);
    const v334 = v333("h1.page-title span").text();
    const v335 = v334.toLowerCase().includes("movie");
    if (v335) {
      const v336 = v333("h3 a, h4 a").filter((v337, v338) => v333(v338).text().match(/480|720|1080|2160|4K/i));
      const v339 = v333(".page-body > div a").filter((v340, v341) => {
        const v342 = v326;
        const v343 = v333(v341).attr("href");
        return v343 && (v343.includes("hdstream4u") || v343.includes("hubstream"));
      });
      const v344 = [...new Set([...v336.map((v345, v346) => v333(v346).attr("href")).get(), ...v339.map((v347, v348) => v333(v348).attr("href")).get()])];
      const v349 = yield Promise.all(v344.map(v350 => loadExtractor(v350, v317)));
      const v351 = v349.flat();
      const v352 = new Set();
      const v353 = v351.filter(v354 => {
        const v355 = v326;
        var v356;
        if (!v354.url || v354.url.includes(".zip") || ((v356 = v354.name) == null ? undefined : v356.toLowerCase().includes(".zip"))) {
          return false;
        }
        if (v352.has(v354.url)) {
          return false;
        }
        v352.add(v354.url);
        return true;
      });
      return {
        finalLinks: v353,
        isMovie: v335
      };
    } else {
      const v357 = new Map();
      const v358 = [];
      v333("h3, h4").each((v359, v360) => {
        const v361 = v326;
        const v362 = v333(v360);
        const v363 = v362.text();
        const v364 = v362.find("a");
        const v365 = v364.map((v366, v367) => v333(v367).attr("href")).get();
        const v368 = v364.get().some(v369 => v333(v369).text().match(/1080|720|4K|2160/i));
        if (v368) {
          v358.push(...v365);
          return;
        }
        const v370 = v363.match(/(?:EPiSODE\s*(\d+)|E(\d+))/i);
        if (v370) {
          const v371 = parseInt(v370[1] || v370[2]);
          if (!v357.has(v371)) {
            v357.set(v371, []);
          }
          v357.get(v371).push(...v365);
          let v372 = v362.next();
          while (v372.length && v372.get(0).tagName !== "hr") {
            const v373 = v372.find("a[href]").map((v374, v375) => v333(v375).attr("href")).get();
            v357.get(v371).push(...v373);
            v372 = v372.next();
          }
        }
      });
      if (v358.length > 0) {
        yield Promise.all(v358.map(v376 => __async(this, null, function* () {
          const v377 = {
            dh141: 327,
            dh142: 330,
            dh143: 182
          };
          const v378 = v326;
          try {
            const v379 = yield getRedirectLinks(v376);
            if (!v379) {
              return;
            }
            const v380 = yield __nvFetch(v379, {
              headers: HEADERS
            });
            const v381 = yield v380.text();
            const v382 = import_cheerio_without_node_native2.default.load(v381);
            v382("h5 a, h4 a, h3 a").each((v383, v384) => {
              const v385 = v378;
              const v386 = v382(v384).text();
              const v387 = v382(v384).attr("href");
              const v388 = v386.match(/Episode\s*(\d+)/i);
              if (v388 && v387) {
                const v389 = parseInt(v388[1]);
                if (!v357.has(v389)) {
                  v357.set(v389, []);
                }
                v357.get(v389).push(v387);
              }
            });
          } catch (v390) {}
        })));
      }
      const v391 = [];
      v357.forEach((v392, v393) => {
        const v394 = v326;
        const v395 = [...new Set(v392)];
        v391.push(...v395.map(v396 => ({
          url: v396,
          episode: v393
        })));
      });
      const v397 = yield Promise.all(v391.map(v398 => __async(this, null, function* () {
        const v399 = v326;
        try {
          const v400 = yield loadExtractor(v398.url, v317);
          return v400.map(v401 => __spreadProps(__spreadValues({}, v401), {
            episode: v398.episode
          }));
        } catch (v402) {
          return [];
        }
      })));
      const v403 = v397.flat();
      const v404 = new Set();
      const v405 = v403.filter(v406 => {
        const v407 = v326;
        if (!v406.url || v406.url.includes(".zip")) {
          return false;
        }
        if (v404.has(v406.url)) {
          return false;
        }
        v404.add(v406.url);
        return true;
      });
      return {
        finalLinks: v405,
        isMovie: v335
      };
    }
  });
}
function getStreams(v408, v409 = "movie", v410 = null, v411 = null) {
  const v412 = {
    dh144: 288,
    dh145: 205,
    dh146: 311,
    dh147: 193
  };
  const v413 = {
    dh148: 224,
    dh149: 208,
    dh150: 179,
    dh151: 170,
    dh152: 170,
    dh153: 312,
    dh154: 318,
    dh155: 271,
    dh156: 204,
    dh157: 361,
    dh158: 347
  };
  return __async(this, null, function* () {
    const v414 = v1;
    console.log("[HDHub4u] Fetching streams for TMDB ID: " + v408 + ", Type: " + v409);
    try {
      const v415 = yield getTMDBDetails(v408, v409);
      console.log("[HDHub4u] TMDB Info: \"" + v415.title + "\" (" + (v415.year || "N/A") + ")");
      const v416 = v409 === "tv" && v410 ? v415.title + " Season " + v410 : v415.title;
      const v417 = yield search(v416);
      if (v417.length === 0) {
        return [];
      }
      const v418 = findBestTitleMatch(v415, v417, v409, v410);
      const v419 = v418 || v417[0];
      console.log("[HDHub4u] Selected: \"" + v419.title + "\" (" + v419.url + ")");
      const v420 = yield getDownloadLinks(v419.url);
      const v421 = v420.finalLinks;
      let v422 = v421;
      if (v409 === "tv" && v411 !== null) {
        v422 = v421.filter(v423 => v423.episode === v411);
      }
      const v424 = v422.map(v425 => {
        const v426 = v414;
        let v427 = v425.fileName && v425.fileName !== "Unknown" ? v425.fileName : v415.title;
        if (v409 === "tv" && v410 && v411) {
          v427 = v415.title + " S" + String(v410).padStart(2, "0") + "E" + String(v411).padStart(2, "0");
        }
        const v428 = extractServerName(v425.source);
        let v429 = "Unknown";
        if (typeof v425.quality === "number" && v425.quality > 0) {
          if (v425.quality >= 2160) {
            v429 = "4K";
          } else if (v425.quality >= 1080) {
            v429 = "1080p";
          } else if (v425.quality >= 720) {
            v429 = "720p";
          } else if (v425.quality >= 480) {
            v429 = "480p";
          }
        } else if (typeof v425.quality === "string") {
          v429 = v425.quality;
        }
        return {
          name: "HDHub4u " + v428,
          title: v427,
          url: v425.url,
          quality: v429,
          size: formatBytes(v425.size),
          headers: v425.headers || undefined,
          provider: "hdhub4u"
        };
      });
      const v430 = {
        "4K": 4,
        "1080p": 2,
        "720p": 1,
        "480p": 0,
        Unknown: -2
      };
      return v424.sort((v431, v432) => (v430[v432.quality] || -3) - (v430[v431.quality] || -3));
    } catch (v433) {
      console.error("[HDHub4u] Scraping error: " + v433.message);
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
  var PROVIDER = "hdhub4u";
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