/*
 * nv-plugins 1shows.js — FULLY DECODED port of the All-in-One-Nuvio provider (4.24.0 merge pass).
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
var __async = (v3, v4, v5) => {
  return new Promise((v6, v7) => {
    const v8 = {
      dh1: 503
    };
    const v9 = v1;
    var v10 = v11 => {
      const v12 = v1;
      try {
        v13(v5.next(v11));
      } catch (v14) {
        v7(v14);
      }
    };
    var v15 = v16 => {
      const v17 = v1;
      try {
        v13(v5.throw(v16));
      } catch (v18) {
        v7(v18);
      }
    };
    var v13 = v19 => v19.done ? v6(v19.value) : Promise.resolve(v19.value).then(v10, v15);
    v13((v5 = v5.apply(v3, v4)).next());
  });
};
function safeUtf8Decode(v20) {
  const v21 = {
    dh2: 612,
    dh3: 521
  };
  const v22 = v1;
  if (typeof TextDecoder !== "undefined") {
    try {
      return new TextDecoder().decode(v20);
    } catch (v23) {}
  }
  let v24 = "";
  for (let v25 = 0; v25 < v20.length; v25++) {
    v24 += String.fromCharCode(v20[v25]);
  }
  try {
    return decodeURIComponent(escape(v24));
  } catch (v26) {
    return v24;
  }
}
var SITE_URL = "https://www.1shows.org";
var API_URL = "https://api.viduki.net";
var TMDB_URL = "https://api.themoviedb.org/3";
var TMDB_API_KEY = "439c478a771f35c05022f9feabcca01c";
var USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131.0.0.0 Safari/537.36";
var API_HEADERS = {
  Accept: "application/json",
  Origin: SITE_URL,
  Referer: SITE_URL + "/",
  "User-Agent": USER_AGENT
};
var PAGE_HEADERS = {
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
  Referer: SITE_URL + "/",
  "User-Agent": USER_AGENT
};
var DOWNLOAD_KEY_HEX = "7a03086357a2147dab4d757e8ed2ff8b5dc8707ee3d473afcb80d97727afa191";
function getInvertedSortTag(v27, v28 = 999999) {
  const v29 = {
    dh4: 469
  };
  const v30 = v2;
  const v31 = Math.max(0, parseInt(v27, 10) || 0);
  const v32 = Math.max(0, v28 - v31);
  const v33 = v32.toString(2).padStart(20, "0");
  return v33.split("").map(v34 => v34 === "1" ? "﻿" : "​").join("");
}
function parseSizeToMB(v35) {
  const v36 = {
    dh5: 553,
    dh6: 531,
    dh7: 631
  };
  const v37 = v2;
  if (!v35 || v35 === "N/A" || v35 === "Unknown" || v35 === "Unknown Size") {
    return 0;
  }
  const v38 = String(v35).match(/([\d.]+)\s*(GB|MB)/i);
  if (!v38) {
    return 0;
  }
  const v39 = parseFloat(v38[1]);
  const v40 = v38[2].toUpperCase();
  if (v40 === "GB") {
    return Math.floor(v39 * 1024);
  }
  if (v40 === "MB") {
    return Math.floor(v39);
  }
  return 0;
}
function getResolutionEmoji(v41) {
  const v42 = {
    dh8: 592,
    dh9: 524,
    dh10: 471,
    dh11: 462,
    dh12: 462,
    dh13: 462,
    dh14: 577,
    dh15: 593
  };
  const v43 = v2;
  const v44 = String(v41 || "").toLowerCase();
  if (v44.includes("2160") || v44.includes("4k") || v44.includes("uhd")) {
    return "🌟 2160p";
  }
  if (v44.includes("1080") || v44.includes("fhd")) {
    return "🔥 1080p";
  }
  if (v44.includes("720") || v44.includes("hd")) {
    return "💎 720p";
  }
  if (v44.includes("480") || v44.includes("sd")) {
    return "📱 480p";
  }
  return "📺 " + (v41 || "1080p");
}
function fetchJson(v45, v46) {
  const v47 = {
    dh16: 523,
    dh17: 572
  };
  return __async(this, null, function* () {
    const v48 = v1;
    const v49 = yield __nvFetch(v45, v46);
    if (!v49.ok) {
      throw new Error("HTTP " + v49.status + ": " + v45);
    }
    return v49.json();
  });
}
function fetchText(v50, v51) {
  const v52 = {
    dh18: 571,
    dh19: 634,
    dh20: 460,
    dh21: 607
  };
  return __async(this, null, function* () {
    const v53 = v1;
    const v54 = Object.assign({}, v51 || {}, {
      skipSizeCheck: true,
      cfKiller: true
    });
    let v55 = yield __nvFetch(v50, v54);
    if ((v55.status === 403 || v55.status === 503) && typeof globalThis.Cloudflare !== "undefined" && globalThis.Cloudflare.solve) {
      const v56 = yield globalThis.Cloudflare.solve(v50);
      v55 = yield __nvFetch(v50, Object.assign({}, v54, {
        headers: Object.assign({}, v54.headers || {}, v56 || {})
      }));
    }
    if (!v55.ok) {
      throw new Error("HTTP " + v55.status + ": " + v50);
    }
    return {
      html: yield v55.text(),
      url: v55.url || v50
    };
  });
}
function absoluteUrl(v57, v58) {
  const v59 = v2;
  if (!v57) {
    return "";
  }
  try {
    return new URL(v57, v58).toString();
  } catch (v60) {
    return "";
  }
}
function decodeHtml(v61) {
  const v62 = v2;
  return String(v61 || "").replace(/&amp;/gi, "&").replace(/&#0*39;|&apos;/gi, "'").replace(/&quot;/gi, "\"").replace(/&lt;/gi, "<").replace(/&gt;/gi, ">");
}
function stripTags(v63) {
  const v64 = {
    dh22: 504
  };
  const v65 = v2;
  return decodeHtml(String(v63 || "").replace(/<[^>]*>/g, " ")).replace(/\s+/g, " ").trim();
}
function attribute(v66, v67) {
  const v68 = v2;
  const v69 = String(v66 || "").match(new RegExp("\\b" + v67 + "\\s*=\\s*([\"'])([\\s\\S]*?)\\1", "i"));
  if (v69) {
    return decodeHtml(v69[2]);
  } else {
    return "";
  }
}
function anchors(v70, v71) {
  const v72 = v2;
  const v73 = [];
  const v74 = /<a\b[^>]*>[\s\S]*?<\/a>/gi;
  let v75;
  while (v75 = v74.exec(String(v70 || ""))) {
    const v76 = absoluteUrl(attribute(v75[0], "href"), v71);
    if (v76) {
      v73.push({
        href: v76,
        text: stripTags(v75[0])
      });
    }
  }
  return v73;
}
function hexToBytes(v77) {
  const v78 = {
    dh23: 521,
    dh24: 521
  };
  const v79 = v2;
  const v80 = String(v77 || "").trim();
  if (!v80 || v80.length % 2) {
    throw new Error("Invalid encrypted payload");
  }
  const v81 = new Uint8Array(v80.length / 2);
  for (let v82 = 0; v82 < v81.length; v82 += 1) {
    const v83 = parseInt(v80.slice(v82 * 2, v82 * 2 + 2), 16);
    if (Number.isNaN(v83)) {
      throw new Error("Invalid encrypted payload");
    }
    v81[v82] = v83;
  }
  return v81;
}
function writeBytes(v84, v85, v86, v87) {
  const v88 = {
    dh25: 466,
    dh26: 521
  };
  const v89 = v2;
  const v90 = v84[v85](v87.length);
  if (!v90) {
    throw new Error("1Shows decryptor allocation failed");
  }
  if (v84.memory) {
    new Uint8Array(v84.memory.buffer, v90, v87.length).set(v87);
  } else {
    for (let v91 = 0; v91 < v87.length; v91 += 1) {
      v84[v86](v90 + v91, v87[v91]);
    }
  }
  return v90;
}
function readBytes(v92, v93, v94, v95) {
  const v96 = {
    dh27: 528
  };
  const v97 = v2;
  if (v92.memory) {
    return new Uint8Array(v92.memory.buffer.slice(v94, v94 + v95));
  }
  const v98 = new Uint8Array(v95);
  for (let v99 = 0; v99 < v95; v99 += 1) {
    v98[v99] = v92[v93](v94 + v99);
  }
  return v98;
}
function joinBytes(v100, v101) {
  const v102 = {
    dh28: 521
  };
  const v103 = v2;
  const v104 = new Uint8Array(v100.length + v101.length);
  v104.set(v100, 0);
  v104.set(v101, v100.length);
  return v104;
}
var AES_SBOX = new Uint8Array([99, 124, 119, 123, 242, 107, 111, 197, 48, 1, 103, 43, 254, 215, 171, 118, 202, 130, 201, 125, 250, 89, 71, 240, 173, 212, 162, 175, 156, 164, 114, 192, 183, 253, 147, 38, 54, 63, 247, 204, 52, 165, 229, 241, 113, 216, 49, 21, 4, 199, 35, 195, 24, 150, 5, 154, 7, 18, 128, 226, 235, 39, 178, 117, 9, 131, 44, 26, 27, 110, 90, 160, 82, 59, 214, 179, 41, 227, 47, 132, 83, 209, 0, 237, 32, 252, 177, 91, 106, 203, 190, 57, 74, 76, 88, 207, 208, 239, 170, 251, 67, 77, 51, 133, 69, 249, 2, 127, 80, 60, 159, 168, 81, 163, 64, 143, 146, 157, 56, 245, 188, 182, 218, 33, 16, 255, 243, 210, 205, 12, 19, 236, 95, 151, 68, 23, 196, 167, 126, 61, 100, 93, 25, 115, 96, 129, 79, 220, 34, 42, 144, 136, 70, 238, 184, 20, 222, 94, 11, 219, 224, 50, 58, 10, 73, 6, 36, 92, 194, 211, 172, 98, 145, 149, 228, 121, 231, 200, 55, 109, 141, 213, 78, 169, 108, 86, 244, 234, 101, 122, 174, 8, 186, 120, 37, 46, 28, 166, 180, 198, 232, 221, 116, 31, 75, 189, 139, 138, 112, 62, 181, 102, 72, 3, 246, 14, 97, 53, 87, 185, 134, 193, 29, 158, 225, 248, 152, 17, 105, 217, 142, 148, 155, 30, 135, 233, 206, 85, 40, 223, 140, 161, 137, 13, 191, 230, 66, 104, 65, 153, 45, 15, 176, 84, 187, 22]);
var AES_RCON = new Uint8Array([0, 1, 2, 4, 8, 16, 32, 64, 128, 27, 54]);
function expandAes256Key(v105) {
  const v106 = {
    dh29: 521
  };
  const v107 = v2;
  if (v105.length !== 32) {
    throw new Error("Invalid AES-256 key");
  }
  const v108 = new Uint8Array(240);
  v108.set(v105);
  let v109 = 32;
  let v110 = 1;
  const v111 = new Uint8Array(4);
  while (v109 < v108.length) {
    for (let v112 = 0; v112 < 4; v112 += 1) {
      v111[v112] = v108[v109 - 4 + v112];
    }
    if (v109 % 32 === 0) {
      const v113 = v111[0];
      v111[0] = AES_SBOX[v111[1]] ^ AES_RCON[v110++];
      v111[1] = AES_SBOX[v111[2]];
      v111[2] = AES_SBOX[v111[3]];
      v111[3] = AES_SBOX[v113];
    } else if (v109 % 32 === 16) {
      for (let v114 = 0; v114 < 4; v114 += 1) {
        v111[v114] = AES_SBOX[v111[v114]];
      }
    }
    for (let v115 = 0; v115 < 4 && v109 < v108.length; v115 += 1) {
      v108[v109] = v108[v109 - 32] ^ v111[v115];
      v109 += 1;
    }
  }
  return v108;
}
function aesXtime(v116) {
  return (v116 << 1 ^ (v116 & 128 ? 27 : 0)) & 255;
}
function aesEncryptBlock(v117, v118) {
  const v119 = new Uint8Array(v117);
  for (let v120 = 0; v120 < 16; v120 += 1) {
    v119[v120] ^= v118[v120];
  }
  for (let v121 = 1; v121 <= 14; v121 += 1) {
    for (let v122 = 0; v122 < 16; v122 += 1) {
      v119[v122] = AES_SBOX[v119[v122]];
    }
    const v123 = new Uint8Array(16);
    for (let v124 = 0; v124 < 4; v124 += 1) {
      for (let v125 = 0; v125 < 4; v125 += 1) {
        v123[v124 + v125 * 4] = v119[v124 + (v125 + v124 & 3) * 4];
      }
    }
    v119.set(v123);
    if (v121 < 14) {
      for (let v126 = 0; v126 < 4; v126 += 1) {
        const v127 = v126 * 4;
        const v128 = v119[v127];
        const v129 = v119[v127 + 1];
        const v130 = v119[v127 + 2];
        const v131 = v119[v127 + 3];
        const v132 = v128 ^ v129 ^ v130 ^ v131;
        v119[v127] ^= v132 ^ aesXtime(v128 ^ v129);
        v119[v127 + 1] ^= v132 ^ aesXtime(v129 ^ v130);
        v119[v127 + 2] ^= v132 ^ aesXtime(v130 ^ v131);
        v119[v127 + 3] ^= v132 ^ aesXtime(v131 ^ v128);
      }
    }
    const v133 = v121 * 16;
    for (let v134 = 0; v134 < 16; v134 += 1) {
      v119[v134] ^= v118[v133 + v134];
    }
  }
  return v119;
}
function xorBlock(v135, v136) {
  for (let v137 = 0; v137 < 16; v137 += 1) {
    v135[v137] ^= v136[v137];
  }
}
function ghashMultiply(v138, v139) {
  const v140 = new Uint8Array(16);
  const v141 = new Uint8Array(v139);
  for (let v142 = 0; v142 < 128; v142 += 1) {
    if (v138[v142 >> 3] >> 7 - (v142 & 7) & 1) {
      xorBlock(v140, v141);
    }
    const v143 = v141[15] & 1;
    for (let v144 = 15; v144 > 0; v144 -= 1) {
      v141[v144] = v141[v144] >>> 1 | (v141[v144 - 1] & 1) << 7;
    }
    v141[0] >>>= 1;
    if (v143) {
      v141[0] ^= 225;
    }
  }
  return v140;
}
function ghashUpdate(v145, v146, v147) {
  const v148 = {
    dh30: 570,
    dh31: 610
  };
  const v149 = v2;
  for (let v150 = 0; v150 < v147.length; v150 += 16) {
    const v151 = new Uint8Array(16);
    v151.set(v147.subarray(v150, Math.min(v150 + 16, v147.length)));
    xorBlock(v145, v151);
    v145.set(ghashMultiply(v145, v146));
  }
}
function writeBitLength(v152, v153, v154) {
  const v155 = v2;
  let v156 = v154 * 8;
  for (let v157 = 7; v157 >= 0; v157 -= 1) {
    v152[v153 + v157] = v156 & 255;
    v156 = Math.floor(v156 / 256);
  }
}
function incrementCounter(v158) {
  for (let v159 = 15; v159 >= 12; v159 -= 1) {
    v158[v159] = v158[v159] + 1 & 255;
    if (v158[v159]) {
      break;
    }
  }
}
function constantTimeEqual(v160, v161) {
  const v162 = {
    dh32: 521
  };
  const v163 = v2;
  if (v160.length !== v161.length) {
    return false;
  }
  let v164 = 0;
  for (let v165 = 0; v165 < v160.length; v165 += 1) {
    v164 |= v160[v165] ^ v161[v165];
  }
  return v164 === 0;
}
function decryptDownloadPureJs(v166, v167) {
  const v168 = {
    dh33: 521
  };
  const v169 = v2;
  const v170 = hexToBytes(DOWNLOAD_KEY_HEX);
  const v171 = hexToBytes(v166.iv);
  const v172 = hexToBytes(v166.ct);
  const v173 = hexToBytes(v166.tag);
  const v174 = hexToBytes(v167);
  if (v171.length !== 12 || v173.length !== 16) {
    throw new Error("Unsupported 1Shows AES-GCM payload");
  }
  const v175 = expandAes256Key(v170);
  const v176 = aesEncryptBlock(new Uint8Array(16), v175);
  const v177 = new Uint8Array(16);
  ghashUpdate(v177, v176, v174);
  ghashUpdate(v177, v176, v172);
  const v178 = new Uint8Array(16);
  writeBitLength(v178, 0, v174.length);
  writeBitLength(v178, 8, v172.length);
  xorBlock(v177, v178);
  v177.set(ghashMultiply(v177, v176));
  const v179 = new Uint8Array(16);
  v179.set(v171);
  v179[15] = 1;
  const v180 = aesEncryptBlock(v179, v175);
  xorBlock(v180, v177);
  if (!constantTimeEqual(v180, v173)) {
    throw new Error("1Shows authentication failed");
  }
  const v181 = new Uint8Array(v179);
  const v182 = new Uint8Array(v172.length);
  for (let v183 = 0; v183 < v172.length; v183 += 16) {
    incrementCounter(v181);
    const v184 = aesEncryptBlock(v181, v175);
    const v185 = Math.min(16, v172.length - v183);
    for (let v186 = 0; v186 < v185; v186 += 1) {
      v182[v183 + v186] = v172[v183 + v186] ^ v184[v186];
    }
  }
  return JSON.parse(safeUtf8Decode(v182));
}
function decryptDownloadWithWebCrypto(v187, v188) {
  const v189 = {
    dh34: 632,
    dh35: 499
  };
  return __async(this, null, function* () {
    const v190 = v1;
    const v191 = globalThis.crypto;
    if (!v191 || !v191.subtle) {
      throw new Error("Web Crypto is unavailable");
    }
    const v192 = hexToBytes(DOWNLOAD_KEY_HEX);
    const v193 = hexToBytes(v188);
    const v194 = hexToBytes(v187.iv);
    const v195 = joinBytes(hexToBytes(v187.ct), hexToBytes(v187.tag));
    const v196 = yield v191.subtle.importKey("raw", v192, {
      name: "AES-GCM"
    }, false, ["decrypt"]);
    const v197 = yield v191.subtle.decrypt({
      name: "AES-GCM",
      iv: v194,
      additionalData: v193,
      tagLength: 128
    }, v196, v195);
    return JSON.parse(safeUtf8Decode(new Uint8Array(v197)));
  });
}
function decryptDownloadWithWasm(v198, v199) {
  const v200 = {
    dh36: 500,
    dh37: 507,
    dh38: 567,
    dh39: 461,
    dh40: 495,
    dh41: 533,
    dh42: 495,
    dh43: 521
  };
  return __async(this, null, function* () {
    const v201 = v1;
    if (typeof WebAssembly === "undefined" || !WebAssembly.instantiate) {
      throw new Error("WebAssembly is unavailable");
    }
    const v202 = yield fetchJson(SITE_URL + "/makimaDL-manifest.json", {
      headers: API_HEADERS
    });
    const v203 = absoluteUrl(v202.url, SITE_URL);
    if (!v203 || !v202.exports) {
      throw new Error("Invalid decryptor manifest");
    }
    const v204 = yield __nvFetch(v203, {
      headers: PAGE_HEADERS
    });
    if (!v204.ok) {
      throw new Error("Decryptor HTTP " + v204.status);
    }
    const v205 = yield WebAssembly.instantiate(yield v204.arrayBuffer(), {
      env: {
        abort() {
          throw new Error("1Shows decryptor aborted");
        }
      }
    });
    const v206 = (v205.instance || v205).exports;
    const v207 = v202.exports;
    const v208 = hexToBytes(v199);
    const v209 = hexToBytes(v198.iv);
    const v210 = hexToBytes(v198.ct);
    const v211 = hexToBytes(v198.tag);
    try {
      const v212 = writeBytes(v206, v207.alloc, v207.writeByte, v208);
      const v213 = writeBytes(v206, v207.alloc, v207.writeByte, v209);
      const v214 = writeBytes(v206, v207.alloc, v207.writeByte, v210);
      const v215 = writeBytes(v206, v207.alloc, v207.writeByte, v211);
      const v216 = v206[v207.alloc](v210.length);
      const v217 = v206[v207.decryptDownload](v212, v208.length, v213, v209.length, v214, v210.length, v215, v211.length, v216);
      if (v217 <= 0 || v217 > v210.length) {
        throw new Error("1Shows download decryption failed");
      }
      const v218 = readBytes(v206, v207.readByte, v216, v217);
      return JSON.parse(safeUtf8Decode(v218));
    } finally {
      if (v206[v207.reset]) {
        v206[v207.reset]();
      }
    }
  });
}
function decryptDownload(v219, v220) {
  return __async(this, null, function* () {
    try {
      return decryptDownloadPureJs(v219, v220);
    } catch (v221) {
      try {
        return yield decryptDownloadWithWebCrypto(v219, v220);
      } catch (v222) {
        return decryptDownloadWithWasm(v219, v220);
      }
    }
  });
}
function fetchDownloadSources(v223, v224, v225, v226) {
  const v227 = {
    dh44: 578,
    dh45: 506
  };
  return __async(this, null, function* () {
    const v228 = v1;
    const v229 = yield fetchJson(API_URL + "/download-token", {
      headers: API_HEADERS
    });
    if (!v229.token) {
      throw new Error("1Shows returned no download token");
    }
    const v230 = v224 === "tv" ? "/download/tv/" + encodeURIComponent(v223) + "/" + encodeURIComponent(v225) + "/" + encodeURIComponent(v226) : "/download/movie/" + encodeURIComponent(v223);
    const v231 = yield fetchJson("" + API_URL + v230, {
      headers: Object.assign({}, API_HEADERS, {
        "x-download-token": v229.token
      })
    });
    const v232 = yield decryptDownload(v231, v229.token);
    if (Array.isArray(v232.sources)) {
      return v232.sources;
    } else {
      return [];
    }
  });
}
function fetchMediaDetails(v233, v234) {
  const v235 = {
    dh46: 556,
    dh47: 579,
    dh48: 611,
    dh49: 539,
    dh50: 490
  };
  return __async(this, null, function* () {
    const v236 = v1;
    try {
      const v237 = v234 === "tv" ? "tv" : "movie";
      const v238 = yield fetchJson(TMDB_URL + "/" + v237 + "/" + encodeURIComponent(v233) + "?api_key=" + TMDB_API_KEY, {
        headers: {
          Accept: "application/json",
          "User-Agent": USER_AGENT
        }
      });
      const v239 = v238.title || v238.name || v238.original_title || v238.original_name || "Unknown";
      const v240 = v238.release_date || v238.first_air_date || "";
      const v241 = Number(v240.slice(0, 4)) || null;
      return {
        title: v239,
        year: v241
      };
    } catch (v242) {
      return {
        title: "Unknown",
        year: null
      };
    }
  });
}
function hasWrongYear(v243, v244) {
  const v245 = v2;
  if (!v244) {
    return false;
  }
  const v246 = String(v243 || "").match(/\b(?:19|20)\d{2}\b/g) || [];
  return v246.some(v247 => Math.abs(Number(v247) - v244) > 1);
}
function isDirectMedia(v248) {
  const v249 = {
    dh51: 482,
    dh52: 596
  };
  const v250 = v2;
  if (/\.(?:m3u8|mpd|mp4|mkv|webm)(?:$|[?#])/i.test(v248)) {
    return true;
  }
  try {
    const v251 = new URL(v248);
    const v252 = v251.hostname.toLowerCase();
    return v252 === "fffast.filesdl.in" || v252 === "video-downloads.googleusercontent.com" || v252.endsWith(".workers.dev") || v252.endsWith(".r2.cloudflarestorage.com") || v252.includes("pixeldrain") || v252.includes("iwebp.store") || v252 === "fuckingfast.net";
  } catch (v253) {
    return false;
  }
}
function isKnownUnplayableHost(v254) {
  const v255 = {
    dh53: 475,
    dh54: 482,
    dh55: 600
  };
  const v256 = v2;
  try {
    const v257 = new URL(v254).hostname.toLowerCase();
    return v257 === "moondl.com" || v257.endsWith(".moondl.com") || v257 === "takefile.link" || v257.endsWith(".takefile.link") || v257 === "pixel.hubcloud.cx";
  } catch (v258) {
    return false;
  }
}
function normalizeDirectUrl(v259) {
  const v260 = {
    dh56: 555,
    dh57: 487
  };
  const v261 = v2;
  const v262 = String(v259 || "").replace(/ /g, "%20");
  try {
    const v263 = new URL(v262);
    const v264 = v263.hostname.toLowerCase();
    if (v264 === "pixeldrain.com" || v264 === "www.pixeldrain.com" || v264 === "pixeldrain.dev" || v264 === "www.pixeldrain.dev" || v264.endsWith(".iwebp.store")) {
      const v265 = v263.pathname.match(/^\/(?:u|l)\/([^/?#]+)/i);
      if (v265) {
        return "https://pixeldrain.com/api/file/" + v265[1];
      }
    }
  } catch (v266) {}
  return v262;
}
function preferredDownloadLink(v267) {
  const v268 = v2;
  const v269 = v267.filter(v270 => v270 && v270.href && !isKnownUnplayableHost(v270.href));
  const v271 = [/(?:direct download|instant dl)/i, /(?:pixeldrain|buzzheavier)/i, /(?:fast cloud|zipdisk)/i];
  for (const v272 of v271) {
    const v273 = v269.find(v274 => v272.test(v274.text));
    if (v273) {
      return v273;
    }
  }
  const v275 = v269.find(v276 => isDirectMedia(v276.href));
  return v275 || null;
}
function routeName(v277, v278) {
  const v279 = {
    dh58: 573,
    dh59: 552,
    dh60: 468,
    dh61: 482,
    dh62: 596,
    dh63: 486
  };
  const v280 = v2;
  const v281 = String(v277 || "");
  if (/fast cloud|zipdisk/i.test(v281)) {
    return "Fast Cloud";
  }
  if (/cloud direct/i.test(v281)) {
    return "Cloud Direct";
  }
  if (/pixeldrain/i.test(v281)) {
    return "Pixeldrain";
  }
  if (/hubcloud/i.test(v281)) {
    return "HubCloud";
  }
  if (/gd\s*index|gdflix/i.test(v281)) {
    return "GD Index";
  }
  if (/streamtape/i.test(v281)) {
    return "Streamtape";
  }
  if (/instant dl/i.test(v281)) {
    return "Instant DL";
  }
  if (/direct download/i.test(v281)) {
    return "Direct";
  }
  try {
    const v282 = new URL(v278 || v277).hostname.toLowerCase();
    if (v282.includes("pixeldrain")) {
      return "Pixeldrain";
    }
    if (v282.includes("streamtape")) {
      return "Streamtape";
    }
    if (v282.includes("hubcloud")) {
      return "HubCloud";
    }
    if (v282.endsWith(".r2.cloudflarestorage.com")) {
      return "Fast Cloud";
    }
  } catch (v283) {}
  return "Direct";
}
function resolveStreamTape(v284, v285) {
  const v286 = {
    dh64: 522,
    dh65: 509
  };
  return __async(this, null, function* () {
    const v287 = v1;
    const v288 = yield fetchText(v284, {
      headers: Object.assign({}, PAGE_HEADERS, {
        Referer: v285
      })
    });
    if (/video not found/i.test(v288.html)) {
      return "";
    }
    const v289 = v288.html.match(/innerHTML\s*=\s*["']([^"']+)["']\s*\+\s*\(\s*["']([^"']+)["']\s*\)\.substring\((\d+)\)(?:\.substring\((\d+)\))?/i);
    if (v289) {
      let v290 = v289[2].substring(Number(v289[3]));
      if (v289[4] !== undefined) {
        v290 = v290.substring(Number(v289[4]));
      }
      const v291 = ("" + v289[1] + v290).replace(/&amp;/gi, "&");
      return normalizeDirectUrl(v291.startsWith("//") ? "https:" + v291 : v291);
    }
    return "";
  });
}
function resolveKmhdPlayer(v292) {
  const v293 = {
    dh66: 460,
    dh67: 531,
    dh68: 500
  };
  return __async(this, null, function* () {
    const v294 = v1;
    var v295;
    const v296 = yield fetchText(v292, {
      headers: Object.assign({}, PAGE_HEADERS, {
        Referer: SITE_URL + "/"
      })
    });
    const v297 = (v295 = v296.html.match(/streamtape_res\s*:\s*["']([^"']+)["']/i)) == null ? undefined : v295[1];
    if (!v297) {
      return "";
    }
    return resolveStreamTape("https://streamtape.com/e/" + encodeURIComponent(v297), v296.url);
  });
}
function fetchKmhdFilePage(v298) {
  const v299 = {
    dh69: 521,
    dh70: 537,
    dh71: 521,
    dh72: 521,
    dh73: 546,
    dh74: 460,
    dh75: 530
  };
  return __async(this, null, function* () {
    const v300 = v1;
    const v301 = new URL(v298);
    const v302 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    let v303 = "";
    for (let v304 = 0; v304 < v301.pathname.length; v304 += 3) {
      const v305 = v301.pathname.charCodeAt(v304);
      const v306 = v304 + 1 < v301.pathname.length;
      const v307 = v304 + 2 < v301.pathname.length;
      const v308 = v306 ? v301.pathname.charCodeAt(v304 + 1) : 0;
      const v309 = v307 ? v301.pathname.charCodeAt(v304 + 2) : 0;
      v303 += v302[v305 >> 2];
      v303 += v302[(v305 & 3) << 4 | v308 >> 4];
      v303 += v306 ? v302[(v308 & 15) << 2 | v309 >> 6] : "=";
      v303 += v307 ? v302[v309 & 63] : "=";
    }
    try {
      yield __nvFetch(v301.origin + "/locked?/unlock&redirect=" + encodeURIComponent(v303), {
        method: "POST",
        headers: Object.assign({}, PAGE_HEADERS, {
          "Content-Type": "application/x-www-form-urlencoded",
          Origin: v301.origin,
          Referer: v301.origin + "/locked?redirect=" + encodeURIComponent(v303)
        }),
        skipSizeCheck: true
      });
    } catch (v310) {}
    return fetchText(v298, {
      headers: Object.assign({}, PAGE_HEADERS, {
        Cookie: "unlocked=true",
        Referer: SITE_URL + "/"
      })
    });
  });
}
function resolveGdIndexUrls(v311, v312) {
  const v313 = {
    dh76: 460,
    dh77: 630,
    dh78: 637,
    dh79: 500,
    dh80: 624
  };
  return __async(this, null, function* () {
    const v314 = v1;
    var v315;
    try {
      const v316 = yield fetchText(v311, {
        headers: Object.assign({}, PAGE_HEADERS, {
          Referer: v312
        })
      });
      const v317 = new URL(v316.url);
      const v318 = (v315 = v317.pathname.match(/\/file\/([^/?#]+)/i)) == null ? undefined : v315[1];
      if (!v318) {
        return [];
      }
      const v319 = v317.origin + "/wfile/" + v318;
      const v320 = yield fetchText(v319, {
        headers: Object.assign({}, PAGE_HEADERS, {
          Referer: v316.url
        })
      });
      return anchors(v320.html, v320.url).filter(v321 => /download/i.test(v321.text) && isDirectMedia(v321.href)).map(v322 => normalizeDirectUrl(v322.href));
    } catch (v323) {
      return [];
    }
  });
} /*decoder removed*/
function resolveKatMoviesUrls(v324) {
  const v325 = {
    dh81: 500
  };
  return __async(this, null, function* () {
    const v326 = v1;
    var v327;
    const v328 = absoluteUrl(v324.url, SITE_URL);
    if (!v328 || /\/play(?:\?|$)/i.test(v328)) {
      return [];
    }
    let v329 = v328;
    if (/^https?:\/\/links\.kmhd\.eu\/file\//i.test(v328)) {
      try {
        const v330 = yield fetchKmhdFilePage(v328);
        const v331 = (v327 = v330.html.match(/gdflix_res:\s*["']([^"']+)["']/i)) == null ? undefined : v327[1];
        if (!v331 || /^none$/i.test(v331)) {
          return [];
        }
        v329 = "https://gd.kmhd.eu/file/" + encodeURIComponent(v331);
      } catch (v332) {
        return [];
      }
    }
    if (!/(?:gdflix|gd\.kmhd)\./i.test(v329)) {
      return [];
    }
    return resolveGdIndexUrls(v329, v328);
  });
}
function resolveFilmyFlyUrls(v333) {
  const v334 = {
    dh82: 500
  };
  return __async(this, null, function* () {
    const v335 = {
      dh83: 590,
      dh84: 470,
      dh85: 500,
      dh86: 510,
      dh87: 607,
      dh88: 590
    };
    const v336 = v1;
    try {
      const v337 = yield fetchText(v333.url, {
        headers: Object.assign({}, PAGE_HEADERS, {
          Referer: SITE_URL + "/"
        })
      });
      const v338 = anchors(v337.html, v337.url).filter(v339 => /cloud direct|pixeldrain|hubcloud/i.test(v339.text));
      const v340 = yield Promise.all(v338.map(v341 => __async(this, null, function* () {
        const v342 = v336;
        if (/hubcloud/i.test(v341.text)) {
          const v343 = yield resolveSourceUrl({
            url: v341.href,
            label: v333.label
          }, 0, v337.url, "HubCloud");
          if (v343) {
            return [v343];
          } else {
            return [];
          }
        }
        return [{
          url: normalizeDirectUrl(v341.href),
          route: routeName(v341.text, v341.href)
        }];
      })));
      const v344 = [].concat.apply([], v340);
      return v344;
    } catch (v345) {
      return [];
    }
  });
}
function resolveDirectUrls(v346) {
  return __async(this, null, function* () {
    const v347 = v1;
    const v348 = normalizeDirectUrl(v346.url);
    if (v348 && !isKnownUnplayableHost(v348)) {
      return [v348];
    } else {
      return [];
    }
  });
}
function resolveSourceUrl(v349) {
  const v350 = {
    dh89: 573,
    dh90: 500,
    dh91: 590
  };
  return __async(this, arguments, function* (v351, v352 = 0, v353 = SITE_URL + "/", v354 = "") {
    const v355 = {
      dh92: 590,
      dh93: 482
    };
    const v356 = v1;
    if (v352 > 5) {
      return null;
    }
    const v357 = absoluteUrl(v351.url, SITE_URL);
    if (!v357 || isKnownUnplayableHost(v357)) {
      return null;
    }
    if (isDirectMedia(v357)) {
      return {
        url: normalizeDirectUrl(v357),
        route: v354 || routeName("", v357)
      };
    }
    if (/^https?:\/\/links\.kmhd\.eu\/play(?:\?|$)/i.test(v357)) {
      try {
        const v358 = yield resolveKmhdPlayer(v357);
        if (v358) {
          return {
            url: v358,
            route: v354 || "Streamtape"
          };
        } else {
          return null;
        }
      } catch (v359) {
        return null;
      }
    }
    try {
      const v360 = yield fetchText(v357, {
        headers: Object.assign({}, PAGE_HEADERS, {
          Referer: v353
        })
      });
      const v361 = v360.html.match(/window\.location(?:\.href)?\s*=\s*["']([^"']+)["']/i);
      const v362 = anchors(v360.html, v360.url);
      const v363 = /(?:^|\.)sportverse\.cc$/i.test(new URL(v360.url).hostname) ? v362.find(v364 => {
        const v365 = v356;
        try {
          return new URL(v364.href).hostname.toLowerCase().endsWith(".r2.cloudflarestorage.com");
        } catch (v366) {
          return false;
        }
      }) : null;
      const v367 = preferredDownloadLink(v362);
      const v368 = v363 ? v363 : v361 ? {
        href: absoluteUrl(v361[1], v360.url),
        text: ""
      } : v367;
      const v369 = v368 && v368.href;
      if (!v369 || v369 === v357) {
        return null;
      }
      return resolveSourceUrl({
        url: v369,
        label: v351.label
      }, v352 + 1, v360.url, v354 || routeName(v368.text, v369));
    } catch (v370) {
      return null;
    }
  });
}
function sourceName(v371) {
  const v372 = {
    dh94: 573,
    dh95: 479
  };
  const v373 = v2;
  if (/4khdhub|hubcloud/i.test(v371)) {
    return "HubCloud";
  }
  if (/katmovies/i.test(v371)) {
    return "KatMovies";
  }
  if (/filmyfly/i.test(v371)) {
    return "FilmyFly";
  }
  if (/premium\s*hm/i.test(v371)) {
    return "Premium HM";
  }
  return "KatMovies";
}
function sourceFamily(v374, v375) {
  const v376 = {
    dh96: 598,
    dh97: 518,
    dh98: 606,
    dh99: 487,
    dh100: 617,
    dh101: 476
  };
  const v377 = v2;
  if (/4khdhub|hubcloud/i.test(v374)) {
    return "hubcloud";
  }
  if (/katmovies/i.test(v374)) {
    return "katmovies";
  }
  if (/filmyfly/i.test(v374)) {
    return "filmyfly";
  }
  if (/premium\s*hm/i.test(v374)) {
    return "premium-hm";
  }
  try {
    const v378 = new URL(v375).hostname.toLowerCase();
    if (v378 === "111477.xyz" || v378.endsWith(".111477.xyz")) {
      return "direct";
    }
  } catch (v379) {}
  return "other";
}
function qualityFromLabel(v380) {
  const v381 = v2;
  const v382 = String(v380 || "").replace(/р/gi, "p");
  if (/\b(?:2160p|4k)\b/i.test(v382)) {
    return "2160p";
  }
  const v383 = v382.match(/\b(1080|720|480)p\b/i);
  if (v383) {
    return v383[1] + "p";
  } else {
    return "480p";
  }
}
function qualityRank(v384) {
  const v385 = {
    dh102: 573,
    dh103: 573
  };
  const v386 = v2;
  if (/2160p|4k/i.test(v384)) {
    return 4;
  }
  if (/1080p/i.test(v384)) {
    return 3;
  }
  if (/720p/i.test(v384)) {
    return 2;
  }
  if (/480p/i.test(v384)) {
    return 1;
  }
  return 0;
}
function sizeFromLabel(v387) {
  const v388 = {
    dh104: 531,
    dh105: 492
  };
  const v389 = v2;
  const v390 = String(v387 || "").match(/([\d.]+)\s*(GB|MB|KB)/i);
  if (v390) {
    return v390[1] + " " + v390[2].toUpperCase();
  } else {
    return "";
  }
}
function filenameFromUrl(v391) {
  const v392 = {
    dh106: 511,
    dh107: 508,
    dh108: 537,
    dh109: 568,
    dh110: 504,
    dh111: 616
  };
  const v393 = v2;
  var v394;
  try {
    const v395 = new URL(v391);
    const v396 = v395.searchParams.get("response-content-disposition") || "";
    const v397 = (v394 = v396.match(/filename\*?=(?:UTF-8''|["']?)([^"';]+(?:\.[a-z0-9]{2,5}))/i)) == null ? undefined : v394[1];
    const v398 = v395.pathname.split("/").filter(Boolean).pop() || "";
    const v399 = v397 || v398;
    if (!/\.(?:mkv|mp4|avi|mov|webm)$/i.test(v399)) {
      return "";
    }
    return decodeURIComponent(v399.replace(/\+/g, " ")).replace(/\.(?:mkv|mp4|avi|mov|webm)$/i, "").replace(/_+/g, " ").replace(/\s+/g, " ").trim();
  } catch (v400) {
    return "";
  }
}
function typeFromUrl(v401) {
  const v402 = {
    dh112: 573,
    dh113: 588,
    dh114: 548
  };
  const v403 = v2;
  if (/\.m3u8(?:$|[?#])/i.test(v401)) {
    return "application/x-mpegURL";
  }
  if (/\.mpd(?:$|[?#])/i.test(v401)) {
    return "application/dash+xml";
  }
  if (/\.mp4(?:$|[?#])/i.test(v401) || /\/get_video\?(?:[^#]*&)?id=/i.test(v401)) {
    return "video/mp4";
  }
  return "video/x-matroska";
}
function playbackReferer(v404, v405) {
  const v406 = {
    dh115: 462,
    dh116: 513
  };
  const v407 = v2;
  try {
    const v408 = new URL(v404);
    if (v408.hostname.toLowerCase().includes("streamtape")) {
      return v408.protocol + "//" + v408.hostname + "/";
    }
  } catch (v409) {}
  return v405 || SITE_URL + "/";
}
function parseStreamInfo(v410, v411, v412, v413, v414) {
  const v415 = {
    dh117: 520,
    dh118: 621,
    dh119: 573,
    dh120: 488,
    dh121: 573,
    dh122: 573,
    dh123: 551,
    dh124: 599,
    dh125: 573,
    dh126: 565,
    dh127: 477,
    dh128: 501,
    dh129: 614
  };
  const v416 = v2;
  const v417 = ((v411 || "") + " " + (v410 || "") + " " + (v412 || "")).replace(/р/gi, "p");
  let v418 = qualityFromLabel(v417);
  let v419 = getResolutionEmoji(v418);
  const v420 = "" + v419;
  let v421 = "🗣️ Multi-Audio";
  if (/dual[- .]?audio/i.test(v417)) {
    v421 = "🗣️ Dual-Audio";
  } else if (/multi[- .]?audio/i.test(v417)) {
    v421 = "🗣️ Multi-Audio";
  } else {
    const v422 = ["Hindi", "English", "Tamil", "Telugu", "Malayalam", "Bengali"].filter(v423 => new RegExp("\\b" + v423 + "\\b", "i").test(v417));
    if (v422.length > 1) {
      v421 = "🗣️ " + v422.join("-");
    } else if (v422.length === 1) {
      v421 = "🗣️ " + v422[0];
    }
  }
  const v424 = v413 || v414 || sizeFromLabel(v417) || "";
  const v425 = v424 ? "💾 " + v424 : "";
  let v426 = "MKV";
  if (/\.mp4/i.test(v410) || /\.mp4/i.test(v412)) {
    v426 = "MP4";
  } else if (/\.mkv/i.test(v410) || /\.mkv/i.test(v412)) {
    v426 = "MKV";
  } else if (/\.webm/i.test(v410) || /\.webm/i.test(v412)) {
    v426 = "WEBM";
  }
  const v427 = "🎞️ " + v426;
  let v428 = "x265";
  if (/\bHEVC\b/i.test(v417)) {
    v428 = "HEVC";
  } else if (/\bx265\b|H[.]?265/i.test(v417)) {
    v428 = "x265";
  } else if (/\bx264\b|AVC|H[.]?264/i.test(v417)) {
    v428 = "x264";
  } else if (/\bAV1\b/i.test(v417)) {
    v428 = "AV1";
  }
  const v429 = "⚡ " + v428;
  let v430 = "AAC";
  if (/\b(?:DDP?\s?5\.1|DD\+\s?5\.1|EAC3)\b/i.test(v417)) {
    v430 = "DDP 5.1";
  } else if (/\bDDP?\s?2\.0\b/i.test(v417)) {
    v430 = "DDP 2.0";
  } else if (/\bDTS(?:-HD)?\b/i.test(v417)) {
    v430 = "DTS";
  } else if (/\bTrueHD\b/i.test(v417)) {
    v430 = "TrueHD";
  } else if (/\bAAC\b/i.test(v417)) {
    v430 = "AAC";
  }
  let v431 = "🎧 " + v430;
  if (/\bAtmos\b/i.test(v417)) {
    v431 = "🎧 " + v430 + " • 🔊 Atmos";
  }
  const v432 = [];
  if (/\bHDR10\+\b/i.test(v417)) {
    v432.push("HDR10+");
  } else if (/\bHDR\b/i.test(v417)) {
    v432.push("HDR");
  }
  if (/\b10[- ]?bit\b/i.test(v417)) {
    v432.push("10Bit");
  }
  const v433 = v432.length > 0 ? "🌈 " + v432.join(" • ") : "";
  const v434 = /\bDV\b|\bDolby[- ]?Vision\b|\bDoVi\b/i.test(v417) ? "✨ DV" : "";
  const v435 = /\bESub\b|\bEnglish\s*Sub\b/i.test(v417) ? "📝 ESub" : "";
  const v436 = [v433, v434, v435].filter(Boolean).join(" | ");
  return {
    q: v418,
    qLine: v420,
    audioLang: v421,
    sizeLine: v425,
    formatLine: v427,
    codecLine: v429,
    audioLine: v431,
    enhancementsLine: v436,
    sz: v424
  };
}
function makeStream(v437, v438, v439, v440, v441) {
  const v442 = {
    dh130: 500,
    dh131: 470,
    dh132: 601,
    dh133: 470,
    dh134: 582,
    dh135: 560,
    dh136: 591,
    dh137: 603,
    dh138: 544,
    dh139: 591,
    dh140: 566,
    dh141: 604,
    dh142: 502,
    dh143: 621,
    dh144: 520,
    dh145: 638
  };
  const v443 = v2;
  const v444 = v438.url;
  const v445 = sourceName(v437.label || "");
  const v446 = v438.route || routeName("", v444);
  const v447 = filenameFromUrl(v444) || v445 + "_file";
  const v448 = parseStreamInfo(v447, v437.label, v444, v437.size, v437.directSize);
  const v449 = qualityRank(v448.q);
  const v450 = parseSizeToMB(v448.sz);
  const v451 = getInvertedSortTag(v449 * 100000 + v450, 999999);
  const v452 = v451 + "1Shows • " + v448.q + " • " + v446 + (v440 > 1 ? " " + (v439 + 1) : "");
  const v453 = v441.mediaType === "tv" ? "🍿 " + v441.title + (v441.year ? " (" + v441.year + ")" : "") + " | S" + v441.season + "E" + v441.episode : "🍿 " + v441.title + (v441.year ? " (" + v441.year + ")" : "");
  const v454 = [v448.qLine, v448.audioLang, v448.sizeLine].filter(Boolean).join(" | ");
  const v455 = [v448.codecLine, v448.audioLine].filter(Boolean).join(" ");
  const v456 = [v448.formatLine, v455].filter(Boolean).join(" | ");
  const v457 = v448.enhancementsLine;
  const v458 = "🔗 " + v445 + " | 🌐 " + v446;
  const v459 = [v453, v454, v456, v457, v458].filter(v460 => v460 !== "");
  const v461 = v459.join("\n");
  const v462 = {
    "User-Agent": USER_AGENT,
    Referer: playbackReferer(v444, v437.url)
  };
  return {
    name: v452,
    title: v461,
    size: v461,
    description: v461,
    url: v444,
    type: typeFromUrl(v444),
    qualityRank: v449,
    sizeInMB: v450,
    behaviorHints: {
      notWebReady: true,
      proxyHeaders: {
        request: v462
      }
    }
  };
}
function resolveSource(v463, v464) {
  const v465 = {
    dh146: 470,
    dh147: 625,
    dh148: 624
  };
  return __async(this, null, function* () {
    const v466 = v1;
    const v467 = sourceFamily(v463.label || "", v463.url);
    const v468 = v467 === "katmovies" ? (yield resolveKatMoviesUrls(v463)).map(v469 => ({
      url: v469,
      route: "GD Index"
    })) : v467 === "filmyfly" ? yield resolveFilmyFlyUrls(v463) : v467 === "direct" ? (yield resolveDirectUrls(v463)).map(v470 => ({
      url: v470,
      route: "Direct"
    })) : [yield resolveSourceUrl(v463)];
    const v471 = v468.filter((v472, v473) => v472 && v472.url && v468.findIndex(v474 => v474 && v474.url === v472.url) === v473);
    return v471.map((v475, v476) => makeStream(v463, v475, v476, v471.length, v464));
  });
}
function isStreamAlive(v477) {
  const v478 = {
    dh149: 627,
    dh150: 505,
    dh151: 491,
    dh152: 550,
    dh153: 613,
    dh154: 511,
    dh155: 516,
    dh156: 467,
    dh157: 467,
    dh158: 538
  };
  return __async(this, null, function* () {
    const v479 = v1;
    var v480;
    const v481 = Date.now();
    try {
      const v482 = yield __nvFetch(v477.url, {
        method: "GET",
        headers: Object.assign({}, v477.headers || {}, {
          Range: "bytes=0-1"
        }),
        redirect: "follow",
        skipSizeCheck: true
      });
      const v483 = String(v482.headers && v482.headers.get ? v482.headers.get("content-range") || "" : "");
      const v484 = String(v482.headers && v482.headers.get ? v482.headers.get("content-type") || "" : "").toLowerCase();
      const v485 = Number(((v480 = v483.match(/\/(\d+)$/)) == null ? undefined : v480[1]) || 0);
      const v486 = v482.status === 206 && /^bytes\s+0-1\//i.test(v483) && v485 >= 1048576;
      const v487 = v482.ok && (/mpegurl|application\/vnd\.apple\.mpegurl/i.test(v484) || /\.m3u8(?:$|[?#])/i.test(v477.url));
      if (v486) {
        v477.sizeInMB = Math.floor(v485 / 1048576);
      }
      if (/video\/mp4/i.test(v484)) {
        v477.type = "video/mp4";
      } else if (/video\/webm/i.test(v484)) {
        v477.type = "video/webm";
      } else if (/matroska/i.test(v484)) {
        v477.type = "video/x-matroska";
      } else if (/mpegurl/i.test(v484)) {
        v477.type = "application/x-mpegURL";
      }
      v477._probeMs = Date.now() - v481;
      return v482.ok || v482.status === 206 || v486 || v487;
    } catch (v488) {
      return true;
    }
  });
}
function mediaFingerprint(v489) {
  const v490 = {
    dh159: 573
  };
  const v491 = v2;
  if (!/1Shows/i.test(v489.name || "")) {
    return "";
  }
  try {
    const v492 = decodeURIComponent(new URL(v489.url).pathname.split("/").filter(Boolean).pop() || "");
    if (/\.(?:mkv|mp4|webm)$/i.test(v492)) {
      return v492.toLowerCase();
    } else {
      return "";
    }
  } catch (v493) {
    return "";
  }
}
function getStreams(v494, v495, v496, v497, v498) {
  const v499 = {
    dh160: 549,
    dh161: 532,
    dh162: 591,
    dh163: 569,
    dh164: 517,
    dh165: 558
  };
  const v500 = {
    dh166: 628,
    dh167: 516
  };
  const v501 = {
    dh168: 500,
    dh169: 500
  };
  return __async(this, null, function* () {
    const v502 = v1;
    const v503 = String(v495 || "").toLowerCase().trim();
    const v504 = v503 === "series" || v503 === "show" || v503 === "tvshow" || v503 === "tv_show" || v503 === "tv" ? "tv" : "movie";
    if (!v494) {
      return [];
    }
    const v505 = Number(v496);
    const v506 = Number(v497);
    if (v504 === "tv" && (!Number.isInteger(v505) || v505 < 1 || !Number.isInteger(v506) || v506 < 1)) {
      return [];
    }
    try {
      const v507 = yield Promise.all([fetchDownloadSources(String(v494), v504, v505, v506), fetchMediaDetails(String(v494), v504)]);
      const v508 = v507[0];
      const v509 = v507[1];
      const v510 = {
        title: v509.title,
        year: v509.year,
        mediaType: v504,
        season: v505,
        episode: v506
      };
      const v511 = v508.filter(v512 => v512 && v512.url && (!v498 || sourceFamily(v512.label || "", v512.url) === v498) && !hasWrongYear((v512.label || "") + " " + v512.url, v510.year));
      const v513 = yield Promise.all(v511.map(v514 => resolveSource(v514, v510)));
      const v515 = [].concat.apply([], v513);
      const v516 = v515.filter((v517, v518) => v517 && v517.url && v515.findIndex(v519 => v519 && v519.url === v517.url) === v518);
      const v520 = yield Promise.all(v516.map(v521 => __async(this, null, function* () {
        if (v521 && (yield isStreamAlive(v521))) {
          return v521;
        } else {
          return null;
        }
      })));
      const v522 = {};
      for (const v523 of v520) {
        if (!v523) {
          continue;
        }
        const v524 = mediaFingerprint(v523);
        if (v524 && (!v522[v524] || v523._probeMs < v522[v524]._probeMs)) {
          v522[v524] = v523;
        }
      }
      const v525 = {};
      let v526 = v520.filter(v527 => {
        const v528 = v502;
        if (!v527 || !v527.url || v525[v527.url]) {
          return false;
        }
        const v529 = mediaFingerprint(v527);
        if (v529 && v522[v529] !== v527) {
          return false;
        }
        v525[v527.url] = true;
        delete v527._probeMs;
        return true;
      });
      v526.sort((v530, v531) => {
        const v532 = v502;
        if (v531.qualityRank !== v530.qualityRank) {
          return v531.qualityRank - v530.qualityRank;
        }
        return v531.sizeInMB - v530.sizeInMB;
      });
      v526.forEach(v533 => {
        const v534 = v502;
        delete v533.qualityRank;
        delete v533.sizeInMB;
      });
      return v526;
    } catch (v535) {
      return [];
    }
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
  var PROVIDER = "1shows";
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