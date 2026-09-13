/*
 * nv-plugins peachify.js — FULLY DECODED port of the All-in-One-Nuvio provider (4.24.0 merge pass).
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
var v2 = v1; /*string-table removed*/ /*rotation removed*/
;
var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
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
  var v8 = {
    dh1: 724
  };
  var v9 = v2;
  for (var v10 in v7 ||= {}) {
    if (__hasOwnProp.call(v7, v10)) {
      __defNormalProp(v6, v10, v7[v10]);
    }
  }
  if (__getOwnPropSymbols) {
    for (var v10 of __getOwnPropSymbols(v7)) {
      if (__propIsEnum.call(v7, v10)) {
        __defNormalProp(v6, v10, v7[v10]);
      }
    }
  }
  return v6;
};
var __commonJS = (v11, v12) => function v13() {
  var v14 = {
    dh2: 891
  };
  var v15 = v2;
  if (!v12) {
    (0, v11[__getOwnPropNames(v11)[0]])((v12 = {
      exports: {}
    }).exports, v12);
  }
  return v12.exports;
};
var __async = (v16, v17, v18) => {
  var v19 = {
    dh3: 428
  };
  return new Promise((v20, v21) => {
    var v22 = v1;
    var v23 = v24 => {
      try {
        v25(v18.next(v24));
      } catch (v26) {
        v21(v26);
      }
    };
    var v27 = v28 => {
      var v29 = v1;
      try {
        v25(v18.throw(v28));
      } catch (v30) {
        v21(v30);
      }
    };
    var v25 = v31 => v31.done ? v20(v31.value) : Promise.resolve(v31.value).then(v23, v27);
    v25((v18 = v18.apply(v16, v17)).next());
  });
};
var require_forge = __commonJS({
  "node_modules/node-forge/lib/forge.js"(v32, v33) {
    var v34 = {
      dh4: 891
    };
    var v35 = v2;
    v33.exports = {
      options: {
        usePureJavaScript: false
      }
    };
  }
});
var require_baseN = __commonJS({
  "node_modules/node-forge/lib/baseN.js"(v36, v37) {
    var v38 = {
      dh5: 857
    };
    var v39 = {
      dh6: 1028,
      dh7: 278,
      dh8: 865,
      dh9: 278,
      dh10: 1416,
      dh11: 1016
    };
    var v40 = {
      dh12: 865,
      dh13: 1302
    };
    var v41 = v2;
    var v42 = {};
    v37.exports = v42;
    var v43 = {};
    v42.encode = function (v44, v45, v46) {
      var v47 = v1;
      if (typeof v45 !== "string") {
        throw new TypeError("\"alphabet\" must be a string.");
      }
      if (v46 !== undefined && typeof v46 !== "number") {
        throw new TypeError("\"maxline\" must be a number.");
      }
      var v48 = "";
      if (!(v44 instanceof Uint8Array)) {
        v48 = v49(v44, v45);
      } else {
        var v50 = 0;
        var v51 = v45.length;
        var v52 = v45.charAt(0);
        var v53 = [0];
        for (v50 = 0; v50 < v44.length; ++v50) {
          for (var v54 = 0, v55 = v44[v50]; v54 < v53.length; ++v54) {
            v55 += v53[v54] << 8;
            v53[v54] = v55 % v51;
            v55 = v55 / v51 | 0;
          }
          while (v55 > 0) {
            v53.push(v55 % v51);
            v55 = v55 / v51 | 0;
          }
        }
        for (v50 = 0; v44[v50] === 0 && v50 < v44.length - 1; ++v50) {
          v48 += v52;
        }
        for (v50 = v53.length - 1; v50 >= 0; --v50) {
          v48 += v45[v53[v50]];
        }
      }
      if (v46) {
        var v56 = new RegExp(".{1," + v46 + "}", "g");
        v48 = v48.match(v56).join("\r\n");
      }
      return v48;
    };
    v42.decode = function (v57, v58) {
      var v59 = v41;
      if (typeof v57 !== "string") {
        throw new TypeError("\"input\" must be a string.");
      }
      if (typeof v58 !== "string") {
        throw new TypeError("\"alphabet\" must be a string.");
      }
      var v60 = v43[v58];
      if (!v60) {
        v60 = v43[v58] = [];
        for (var v61 = 0; v61 < v58.length; ++v61) {
          v60[v58.charCodeAt(v61)] = v61;
        }
      }
      v57 = v57.replace(/\s/g, "");
      var v62 = v58.length;
      var v63 = v58.charAt(0);
      var v64 = [0];
      for (var v61 = 0; v61 < v57.length; v61++) {
        var v65 = v60[v57.charCodeAt(v61)];
        if (v65 === undefined) {
          return;
        }
        for (var v66 = 0, v67 = v65; v66 < v64.length; ++v66) {
          v67 += v64[v66] * v62;
          v64[v66] = v67 & 255;
          v67 >>= 8;
        }
        while (v67 > 0) {
          v64.push(v67 & 255);
          v67 >>= 8;
        }
      }
      for (var v68 = 0; v57[v68] === v63 && v68 < v57.length - 1; ++v68) {
        v64.push(0);
      }
      if (typeof Buffer !== "undefined") {
        return Buffer.from(v64.reverse());
      }
      return new Uint8Array(v64.reverse());
    };
    function v49(v69, v70) {
      var v71 = v41;
      var v72 = 0;
      var v73 = v70.length;
      var v74 = v70.charAt(0);
      var v75 = [0];
      for (v72 = 0; v72 < v69.length(); ++v72) {
        for (var v76 = 0, v77 = v69.at(v72); v76 < v75.length; ++v76) {
          v77 += v75[v76] << 8;
          v75[v76] = v77 % v73;
          v77 = v77 / v73 | 0;
        }
        while (v77 > 0) {
          v75.push(v77 % v73);
          v77 = v77 / v73 | 0;
        }
      }
      var v78 = "";
      for (v72 = 0; v69.at(v72) === 0 && v72 < v69.length() - 1; ++v72) {
        v78 += v74;
      }
      for (v72 = v75.length - 1; v72 >= 0; --v72) {
        v78 += v70[v75[v72]];
      }
      return v78;
    }
  }
});
var require_util = __commonJS({
  "node_modules/node-forge/lib/util.js"(v79, v80) {
    var v81 = {
      dh14: 1406,
      dh15: 1106,
      dh16: 745,
      dh17: 992,
      dh18: 992,
      dh19: 992,
      dh20: 992,
      dh21: 992,
      dh22: 1155,
      dh23: 913,
      dh24: 1276,
      dh25: 992,
      dh26: 913,
      dh27: 1025,
      dh28: 1364,
      dh29: 1206,
      dh30: 913,
      dh31: 622,
      dh32: 1450,
      dh33: 781,
      dh34: 1472,
      dh35: 913,
      dh36: 214,
      dh37: 598,
      dh38: 598,
      dh39: 1260,
      dh40: 598,
      dh41: 250,
      dh42: 598,
      dh43: 654,
      dh44: 913,
      dh45: 1447,
      dh46: 598,
      dh47: 598,
      dh48: 764,
      dh49: 1155,
      dh50: 1220,
      dh51: 516,
      dh52: 913,
      dh53: 1025,
      dh54: 913,
      dh55: 913,
      dh56: 1450,
      dh57: 1472,
      dh58: 677,
      dh59: 699,
      dh60: 384,
      dh61: 699,
      dh62: 292,
      dh63: 416,
      dh64: 1209,
      dh65: 699,
      dh66: 1123,
      dh67: 699,
      dh68: 384,
      dh69: 753,
      dh70: 393,
      dh71: 416,
      dh72: 772,
      dh73: 940,
      dh74: 209,
      dh75: 612,
      dh76: 745,
      dh77: 911,
      dh78: 1140
    };
    var v82 = {
      dh79: 1423,
      dh80: 795,
      dh81: 1424,
      dh82: 624,
      dh83: 1042
    };
    var v83 = {
      dh84: 531
    };
    var v84 = {
      dh85: 1486,
      dh86: 852,
      dh87: 531,
      dh88: 852,
      dh89: 442,
      dh90: 852
    };
    var v85 = {
      dh91: 857
    };
    var v86 = {
      dh92: 927,
      dh93: 857,
      dh94: 1025
    };
    var v87 = {
      dh95: 1508
    };
    var v88 = {
      dh96: 607,
      dh97: 607
    };
    var v89 = {
      dh98: 857
    };
    var v90 = {
      dh99: 1396,
      dh100: 1089,
      dh101: 531
    };
    var v91 = {
      dh102: 795,
      dh103: 949
    };
    var v92 = {
      dh104: 771,
      dh105: 1219,
      dh106: 1204,
      dh107: 1174
    };
    var v93 = {
      dh108: 697,
      dh109: 774,
      dh110: 771,
      dh111: 1219,
      dh112: 1219,
      dh113: 956
    };
    var v94 = {
      dh114: 1433,
      dh115: 771
    };
    var v95 = {
      dh116: 684
    };
    var v96 = {
      dh117: 322
    };
    var v97 = {
      dh118: 677
    };
    var v98 = {
      dh119: 699,
      dh120: 963
    };
    var v99 = {
      dh121: 857,
      dh122: 278
    };
    var v100 = {
      dh123: 857,
      dh124: 1486
    };
    var v101 = {
      dh125: 660,
      dh126: 857,
      dh127: 1486
    };
    var v102 = {
      dh128: 322
    };
    var v103 = {
      dh129: 278,
      dh130: 322
    };
    var v104 = {
      dh131: 865,
      dh132: 1486
    };
    var v105 = {
      dh133: 1508,
      dh134: 321
    };
    var v106 = {
      dh135: 322,
      dh136: 1486
    };
    var v107 = {
      dh137: 900
    };
    var v108 = {
      dh138: 857,
      dh139: 699,
      dh140: 292,
      dh141: 416,
      dh142: 393,
      dh143: 940,
      dh144: 772
    };
    var v109 = {
      dh145: 1151
    };
    var v110 = {
      dh146: 793,
      dh147: 1354,
      dh148: 857
    };
    var v111 = {
      dh149: 793
    };
    var v112 = {
      dh150: 1151,
      dh151: 793
    };
    var v113 = {
      dh152: 310
    };
    var v114 = {
      dh153: 1151
    };
    var v115 = {
      dh154: 1151,
      dh155: 372
    };
    var v116 = {
      dh156: 372,
      dh157: 372,
      dh158: 1472
    };
    var v117 = {
      dh159: 1151,
      dh160: 1181
    };
    var v118 = {
      dh161: 933
    };
    var v119 = {
      dh162: 1151
    };
    var v120 = {
      dh163: 372
    };
    var v121 = {
      dh164: 1255
    };
    var v122 = {
      dh165: 793
    };
    var v123 = {
      dh166: 1151
    };
    var v124 = {
      dh167: 1151
    };
    var v125 = {
      dh168: 620
    };
    var v126 = {
      dh169: 1151
    };
    var v127 = {
      dh170: 793
    };
    var v128 = {
      dh171: 250,
      dh172: 940
    };
    var v129 = {
      dh173: 1472
    };
    var v130 = {
      dh174: 1106,
      dh175: 1422,
      dh176: 793,
      dh177: 319,
      dh178: 598,
      dh179: 1227,
      dh180: 1151,
      dh181: 1151,
      dh182: 277,
      dh183: 793,
      dh184: 940,
      dh185: 857
    };
    var v131 = {
      dh186: 1151
    };
    var v132 = {
      dh187: 1354,
      dh188: 362,
      dh189: 1151,
      dh190: 1151,
      dh191: 857
    };
    var v133 = {
      dh192: 793,
      dh193: 372
    };
    var v134 = {
      dh194: 372,
      dh195: 666,
      dh196: 1106,
      dh197: 1371,
      dh198: 319,
      dh199: 718,
      dh200: 1151
    };
    var v135 = {
      dh201: 1151
    };
    var v136 = {
      dh202: 1151
    };
    var v137 = {
      dh203: 1151,
      dh204: 372
    };
    var v138 = {
      dh205: 1151,
      dh206: 372
    };
    var v139 = {
      dh207: 1151,
      dh208: 478,
      dh209: 1151
    };
    var v140 = {
      dh210: 372,
      dh211: 1151,
      dh212: 278
    };
    var v141 = {
      dh213: 372
    };
    var v142 = {
      dh214: 1151,
      dh215: 278,
      dh216: 372
    };
    var v143 = {
      dh217: 372
    };
    var v144 = {
      dh218: 1151
    };
    var v145 = {
      dh219: 372
    };
    var v146 = {
      dh220: 322,
      dh221: 322
    };
    var v147 = {
      dh222: 250
    };
    var v148 = {
      dh223: 322
    };
    var v149 = {
      dh224: 322
    };
    var v150 = {
      dh225: 250
    };
    var v151 = {
      dh226: 322
    };
    var v152 = {
      dh227: 857
    };
    var v153 = {
      dh228: 374
    };
    var v154 = {
      dh229: 214,
      dh230: 1151,
      dh231: 322,
      dh232: 684,
      dh233: 1260,
      dh234: 372,
      dh235: 1227
    };
    var v155 = {
      dh236: 795
    };
    var v156 = {
      dh237: 349,
      dh238: 977,
      dh239: 1356,
      dh240: 312,
      dh241: 618
    };
    var v157 = {
      dh242: 1356
    };
    var v158 = v2;
    var v159 = require_forge();
    var v160 = require_baseN();
    var v161 = v80.exports = v159.util = v159.util || {};
    (function () {
      var v162 = {
        dh243: 970,
        dh244: 970
      };
      var v163 = {
        dh245: 1168,
        dh246: 857,
        dh247: 1516
      };
      var v164 = v158;
      if (typeof process !== "undefined" && process.nextTick && !process.browser) {
        v161.nextTick = process.nextTick;
        if (typeof setImmediate === "function") {
          v161.setImmediate = setImmediate;
        } else {
          v161.setImmediate = v161.nextTick;
        }
        return;
      }
      if (typeof setImmediate === "function") {
        v161.setImmediate = function () {
          return setImmediate.apply(undefined, arguments);
        };
        v161.nextTick = function (v165) {
          return setImmediate(v165);
        };
        return;
      }
      v161.setImmediate = function (v166) {
        setTimeout(v166, 0);
      };
      if (typeof window !== "undefined" && typeof window.postMessage === "function") {
        let v167 = function (v168) {
          var v169 = v164;
          if (v168.source === window && v168.data === v170) {
            v168.stopPropagation();
            var v171 = v172.slice();
            v172.length = 0;
            v171.forEach(function (v173) {
              v173();
            });
          }
        };
        var v174 = v167;
        var v170 = "forge.setImmediate";
        var v172 = [];
        v161.setImmediate = function (v175) {
          var v176 = v164;
          v172.push(v175);
          if (v172.length === 1) {
            window.postMessage(v170, "*");
          }
        };
        window.addEventListener("message", v167, true);
      }
      if (typeof MutationObserver !== "undefined") {
        var v177 = Date.now();
        var v178 = true;
        var v179 = document.createElement("div");
        var v172 = [];
        new MutationObserver(function () {
          var v180 = v172.slice();
          v172.length = 0;
          v180.forEach(function (v181) {
            v181();
          });
        }).observe(v179, {
          attributes: true
        });
        var v182 = v161.setImmediate;
        v161.setImmediate = function (v183) {
          var v184 = v164;
          if (Date.now() - v177 > 15) {
            v177 = Date.now();
            v182(v183);
          } else {
            v172.push(v183);
            if (v172.length === 1) {
              v179.setAttribute("a", v178 = !v178);
            }
          }
        };
      }
      v161.nextTick = v161.setImmediate;
    })();
    v161.isNodejs = typeof process !== "undefined" && process.versions && process.versions.node;
    v161.globalScope = function () {
      var v185 = v158;
      if (v161.isNodejs) {
        return global;
      }
      if (typeof self === "undefined") {
        return window;
      } else {
        return self;
      }
    }();
    v161.isArray = Array.isArray || function (v186) {
      var v187 = v158;
      return Object.prototype.toString.call(v186) === "[object Array]";
    };
    v161.isArrayBuffer = function (v188) {
      return typeof ArrayBuffer !== "undefined" && v188 instanceof ArrayBuffer;
    };
    v161.isArrayBufferView = function (v189) {
      var v190 = v158;
      return v189 && v161.isArrayBuffer(v189.buffer) && v189.byteLength !== undefined;
    };
    function v191(v192) {
      if (v192 !== 8 && v192 !== 16 && v192 !== 24 && v192 !== 32) {
        throw new Error("Only 8, 16, 24, or 32 bits supported: " + v192);
      }
    }
    v161.ByteBuffer = v193;
    function v193(v194) {
      var v195 = v158;
      this.data = "";
      this.read = 0;
      if (typeof v194 === "string") {
        this.data = v194;
      } else if (v161.isArrayBuffer(v194) || v161.isArrayBufferView(v194)) {
        if (typeof Buffer !== "undefined" && v194 instanceof Buffer) {
          this.data = v194.toString("binary");
        } else {
          var v196 = new Uint8Array(v194);
          try {
            this.data = String.fromCharCode.apply(null, v196);
          } catch (v197) {
            for (var v198 = 0; v198 < v196.length; ++v198) {
              this.putByte(v196[v198]);
            }
          }
        }
      } else if (v194 instanceof v193 || typeof v194 === "object" && typeof v194.data === "string" && typeof v194.read === "number") {
        this.data = v194.data;
        this.read = v194.read;
      }
      this._constructedStringLength = 0;
    }
    v161.ByteStringBuffer = v193;
    var v199 = 4096;
    v161.ByteStringBuffer.prototype._optimizeConstructedString = function (v200) {
      var v201 = v158;
      this._constructedStringLength += v200;
      if (this._constructedStringLength > v199) {
        this.data.substr(0, 1);
        this._constructedStringLength = 0;
      }
    };
    v161.ByteStringBuffer.prototype.length = function () {
      return this.data.length - this.read;
    };
    v161.ByteStringBuffer.prototype.isEmpty = function () {
      var v202 = v158;
      return this.length() <= 0;
    };
    v161.ByteStringBuffer.prototype.putByte = function (v203) {
      var v204 = v158;
      return this.putBytes(String.fromCharCode(v203));
    };
    v161.ByteStringBuffer.prototype.fillWithByte = function (v205, v206) {
      var v207 = v158;
      v205 = String.fromCharCode(v205);
      var v208 = this.data;
      while (v206 > 0) {
        if (v206 & 1) {
          v208 += v205;
        }
        v206 >>>= 1;
        if (v206 > 0) {
          v205 += v205;
        }
      }
      this.data = v208;
      this._optimizeConstructedString(v206);
      return this;
    };
    v161.ByteStringBuffer.prototype.putBytes = function (v209) {
      var v210 = v158;
      this.data += v209;
      this._optimizeConstructedString(v209.length);
      return this;
    };
    v161.ByteStringBuffer.prototype.putString = function (v211) {
      return this.putBytes(v161.encodeUtf8(v211));
    };
    v161.ByteStringBuffer.prototype.putInt16 = function (v212) {
      var v213 = v158;
      return this.putBytes(String.fromCharCode(v212 >> 8 & 255) + String.fromCharCode(v212 & 255));
    };
    v161.ByteStringBuffer.prototype.putInt24 = function (v214) {
      var v215 = v158;
      return this.putBytes(String.fromCharCode(v214 >> 16 & 255) + String.fromCharCode(v214 >> 8 & 255) + String.fromCharCode(v214 & 255));
    };
    v161.ByteStringBuffer.prototype.putInt32 = function (v216) {
      var v217 = v158;
      return this.putBytes(String.fromCharCode(v216 >> 24 & 255) + String.fromCharCode(v216 >> 16 & 255) + String.fromCharCode(v216 >> 8 & 255) + String.fromCharCode(v216 & 255));
    };
    v161.ByteStringBuffer.prototype.putInt16Le = function (v218) {
      var v219 = v158;
      return this.putBytes(String.fromCharCode(v218 & 255) + String.fromCharCode(v218 >> 8 & 255));
    };
    v161.ByteStringBuffer.prototype.putInt24Le = function (v220) {
      var v221 = v158;
      return this.putBytes(String.fromCharCode(v220 & 255) + String.fromCharCode(v220 >> 8 & 255) + String.fromCharCode(v220 >> 16 & 255));
    };
    v161.ByteStringBuffer.prototype.putInt32Le = function (v222) {
      var v223 = v158;
      return this.putBytes(String.fromCharCode(v222 & 255) + String.fromCharCode(v222 >> 8 & 255) + String.fromCharCode(v222 >> 16 & 255) + String.fromCharCode(v222 >> 24 & 255));
    };
    v161.ByteStringBuffer.prototype.putInt = function (v224, v225) {
      v191(v225);
      var v226 = "";
      do {
        v225 -= 8;
        v226 += String.fromCharCode(v224 >> v225 & 255);
      } while (v225 > 0);
      return this.putBytes(v226);
    };
    v161.ByteStringBuffer.prototype.putSignedInt = function (v227, v228) {
      if (v227 < 0) {
        v227 += 2 << v228 - 1;
      }
      return this.putInt(v227, v228);
    };
    v161.ByteStringBuffer.prototype.putBuffer = function (v229) {
      return this.putBytes(v229.getBytes());
    };
    v161.ByteStringBuffer.prototype.getByte = function () {
      var v230 = v158;
      return this.data.charCodeAt(this.read++);
    };
    v161.ByteStringBuffer.prototype.getInt16 = function () {
      var v231 = v158;
      var v232 = this.data.charCodeAt(this.read) << 8 ^ this.data.charCodeAt(this.read + 1);
      this.read += 2;
      return v232;
    };
    v161.ByteStringBuffer.prototype.getInt24 = function () {
      var v233 = v158;
      var v234 = this.data.charCodeAt(this.read) << 16 ^ this.data.charCodeAt(this.read + 1) << 8 ^ this.data.charCodeAt(this.read + 2);
      this.read += 3;
      return v234;
    };
    v161.ByteStringBuffer.prototype.getInt32 = function () {
      var v235 = v158;
      var v236 = this.data.charCodeAt(this.read) << 24 ^ this.data.charCodeAt(this.read + 1) << 16 ^ this.data.charCodeAt(this.read + 2) << 8 ^ this.data.charCodeAt(this.read + 3);
      this.read += 4;
      return v236;
    };
    v161.ByteStringBuffer.prototype.getInt16Le = function () {
      var v237 = v158;
      var v238 = this.data.charCodeAt(this.read) ^ this.data.charCodeAt(this.read + 1) << 8;
      this.read += 2;
      return v238;
    };
    v161.ByteStringBuffer.prototype.getInt24Le = function () {
      var v239 = v158;
      var v240 = this.data.charCodeAt(this.read) ^ this.data.charCodeAt(this.read + 1) << 8 ^ this.data.charCodeAt(this.read + 2) << 16;
      this.read += 3;
      return v240;
    };
    v161.ByteStringBuffer.prototype.getInt32Le = function () {
      var v241 = v158;
      var v242 = this.data.charCodeAt(this.read) ^ this.data.charCodeAt(this.read + 1) << 8 ^ this.data.charCodeAt(this.read + 2) << 16 ^ this.data.charCodeAt(this.read + 3) << 24;
      this.read += 4;
      return v242;
    };
    v161.ByteStringBuffer.prototype.getInt = function (v243) {
      var v244 = v158;
      v191(v243);
      var v245 = 0;
      do {
        v245 = (v245 << 8) + this.data.charCodeAt(this.read++);
        v243 -= 8;
      } while (v243 > 0);
      return v245;
    };
    v161.ByteStringBuffer.prototype.getSignedInt = function (v246) {
      var v247 = v158;
      var v248 = this.getInt(v246);
      var v249 = 2 << v246 - 2;
      if (v248 >= v249) {
        v248 -= v249 << 1;
      }
      return v248;
    };
    v161.ByteStringBuffer.prototype.getBytes = function (v250) {
      var v251 = v158;
      var v252;
      if (v250) {
        v250 = Math.min(this.length(), v250);
        v252 = this.data.slice(this.read, this.read + v250);
        this.read += v250;
      } else if (v250 === 0) {
        v252 = "";
      } else {
        v252 = this.read === 0 ? this.data : this.data.slice(this.read);
        this.clear();
      }
      return v252;
    };
    v161.ByteStringBuffer.prototype.bytes = function (v253) {
      var v254 = v158;
      if (typeof v253 === "undefined") {
        return this.data.slice(this.read);
      } else {
        return this.data.slice(this.read, this.read + v253);
      }
    };
    v161.ByteStringBuffer.prototype.at = function (v255) {
      return this.data.charCodeAt(this.read + v255);
    };
    v161.ByteStringBuffer.prototype.setAt = function (v256, v257) {
      var v258 = v158;
      this.data = this.data.substr(0, this.read + v256) + String.fromCharCode(v257) + this.data.substr(this.read + v256 + 1);
      return this;
    };
    v161.ByteStringBuffer.prototype.last = function () {
      var v259 = v158;
      return this.data.charCodeAt(this.data.length - 1);
    };
    v161.ByteStringBuffer.prototype.copy = function () {
      var v260 = v161.createBuffer(this.data);
      v260.read = this.read;
      return v260;
    };
    v161.ByteStringBuffer.prototype.compact = function () {
      var v261 = v158;
      if (this.read > 0) {
        this.data = this.data.slice(this.read);
        this.read = 0;
      }
      return this;
    };
    v161.ByteStringBuffer.prototype.clear = function () {
      var v262 = v158;
      this.data = "";
      this.read = 0;
      return this;
    };
    v161.ByteStringBuffer.prototype.truncate = function (v263) {
      var v264 = v158;
      var v265 = Math.max(0, this.length() - v263);
      this.data = this.data.substr(this.read, v265);
      this.read = 0;
      return this;
    };
    v161.ByteStringBuffer.prototype.toHex = function () {
      var v266 = v158;
      var v267 = "";
      for (var v268 = this.read; v268 < this.data.length; ++v268) {
        var v269 = this.data.charCodeAt(v268);
        if (v269 < 16) {
          v267 += "0";
        }
        v267 += v269.toString(16);
      }
      return v267;
    };
    v161.ByteStringBuffer.prototype.toString = function () {
      return v161.decodeUtf8(this.bytes());
    };
    function v270(v271, v272) {
      var v273 = v158;
      v272 = v272 || {};
      this.read = v272.readOffset || 0;
      this.growSize = v272.growSize || 1024;
      var v274 = v161.isArrayBuffer(v271);
      var v275 = v161.isArrayBufferView(v271);
      if (v274 || v275) {
        if (v274) {
          this.data = new DataView(v271);
        } else {
          this.data = new DataView(v271.buffer, v271.byteOffset, v271.byteLength);
        }
        this.write = "writeOffset" in v272 ? v272.writeOffset : this.data.byteLength;
        return;
      }
      this.data = new DataView(new ArrayBuffer(0));
      this.write = 0;
      if (v271 !== null && v271 !== undefined) {
        this.putBytes(v271);
      }
      if ("writeOffset" in v272) {
        this.write = v272.writeOffset;
      }
    }
    v161.DataBuffer = v270;
    v161.DataBuffer.prototype.length = function () {
      var v276 = v158;
      return this.write - this.read;
    };
    v161.DataBuffer.prototype.isEmpty = function () {
      var v277 = v158;
      return this.length() <= 0;
    };
    v161.DataBuffer.prototype.accommodate = function (v278, v279) {
      var v280 = v158;
      if (this.length() >= v278) {
        return this;
      }
      v279 = Math.max(v279 || this.growSize, v278);
      var v281 = new Uint8Array(this.data.buffer, this.data.byteOffset, this.data.byteLength);
      var v282 = new Uint8Array(this.length() + v279);
      v282.set(v281);
      this.data = new DataView(v282.buffer);
      return this;
    };
    v161.DataBuffer.prototype.putByte = function (v283) {
      var v284 = v158;
      this.accommodate(1);
      this.data.setUint8(this.write++, v283);
      return this;
    };
    v161.DataBuffer.prototype.fillWithByte = function (v285, v286) {
      this.accommodate(v286);
      for (var v287 = 0; v287 < v286; ++v287) {
        this.data.setUint8(v285);
      }
      return this;
    };
    v161.DataBuffer.prototype.putBytes = function (v288, v289) {
      var v290 = v158;
      if (v161.isArrayBufferView(v288)) {
        var v291 = new Uint8Array(v288.buffer, v288.byteOffset, v288.byteLength);
        var v292 = v291.byteLength - v291.byteOffset;
        this.accommodate(v292);
        var v293 = new Uint8Array(this.data.buffer, this.write);
        v293.set(v291);
        this.write += v292;
        return this;
      }
      if (v161.isArrayBuffer(v288)) {
        var v291 = new Uint8Array(v288);
        this.accommodate(v291.byteLength);
        var v293 = new Uint8Array(this.data.buffer);
        v293.set(v291, this.write);
        this.write += v291.byteLength;
        return this;
      }
      if (v288 instanceof v161.DataBuffer || typeof v288 === "object" && typeof v288.read === "number" && typeof v288.write === "number" && v161.isArrayBufferView(v288.data)) {
        var v291 = new Uint8Array(v288.data.byteLength, v288.read, v288.length());
        this.accommodate(v291.byteLength);
        var v293 = new Uint8Array(v288.data.byteLength, this.write);
        v293.set(v291);
        this.write += v291.byteLength;
        return this;
      }
      if (v288 instanceof v161.ByteStringBuffer) {
        v288 = v288.data;
        v289 = "binary";
      }
      v289 = v289 || "binary";
      if (typeof v288 === "string") {
        var v294;
        if (v289 === "hex") {
          this.accommodate(Math.ceil(v288.length / 2));
          v294 = new Uint8Array(this.data.buffer, this.write);
          this.write += v161.binary.hex.decode(v288, v294, this.write);
          return this;
        }
        if (v289 === "base64") {
          this.accommodate(Math.ceil(v288.length / 4) * 3);
          v294 = new Uint8Array(this.data.buffer, this.write);
          this.write += v161.binary.base64.decode(v288, v294, this.write);
          return this;
        }
        if (v289 === "utf8") {
          v288 = v161.encodeUtf8(v288);
          v289 = "binary";
        }
        if (v289 === "binary" || v289 === "raw") {
          this.accommodate(v288.length);
          v294 = new Uint8Array(this.data.buffer, this.write);
          this.write += v161.binary.raw.decode(v294);
          return this;
        }
        if (v289 === "utf16") {
          this.accommodate(v288.length * 2);
          v294 = new Uint16Array(this.data.buffer, this.write);
          this.write += v161.text.utf16.encode(v294);
          return this;
        }
        throw new Error("Invalid encoding: " + v289);
      }
      throw Error("Invalid parameter: " + v288);
    };
    v161.DataBuffer.prototype.putBuffer = function (v295) {
      var v296 = v158;
      this.putBytes(v295);
      v295.clear();
      return this;
    };
    v161.DataBuffer.prototype.putString = function (v297) {
      var v298 = v158;
      return this.putBytes(v297, "utf16");
    };
    v161.DataBuffer.prototype.putInt16 = function (v299) {
      var v300 = v158;
      this.accommodate(2);
      this.data.setInt16(this.write, v299);
      this.write += 2;
      return this;
    };
    v161.DataBuffer.prototype.putInt24 = function (v301) {
      var v302 = v158;
      this.accommodate(3);
      this.data.setInt16(this.write, v301 >> 8 & 65535);
      this.data.setInt8(this.write, v301 >> 16 & 255);
      this.write += 3;
      return this;
    };
    v161.DataBuffer.prototype.putInt32 = function (v303) {
      var v304 = v158;
      this.accommodate(4);
      this.data.setInt32(this.write, v303);
      this.write += 4;
      return this;
    };
    v161.DataBuffer.prototype.putInt16Le = function (v305) {
      var v306 = v158;
      this.accommodate(2);
      this.data.setInt16(this.write, v305, true);
      this.write += 2;
      return this;
    };
    v161.DataBuffer.prototype.putInt24Le = function (v307) {
      var v308 = v158;
      this.accommodate(3);
      this.data.setInt8(this.write, v307 >> 16 & 255);
      this.data.setInt16(this.write, v307 >> 8 & 65535, true);
      this.write += 3;
      return this;
    };
    v161.DataBuffer.prototype.putInt32Le = function (v309) {
      var v310 = v158;
      this.accommodate(4);
      this.data.setInt32(this.write, v309, true);
      this.write += 4;
      return this;
    };
    v161.DataBuffer.prototype.putInt = function (v311, v312) {
      var v313 = v158;
      v191(v312);
      this.accommodate(v312 / 8);
      do {
        v312 -= 8;
        this.data.setInt8(this.write++, v311 >> v312 & 255);
      } while (v312 > 0);
      return this;
    };
    v161.DataBuffer.prototype.putSignedInt = function (v314, v315) {
      var v316 = v158;
      v191(v315);
      this.accommodate(v315 / 8);
      if (v314 < 0) {
        v314 += 2 << v315 - 1;
      }
      return this.putInt(v314, v315);
    };
    v161.DataBuffer.prototype.getByte = function () {
      var v317 = v158;
      return this.data.getInt8(this.read++);
    };
    v161.DataBuffer.prototype.getInt16 = function () {
      var v318 = v158;
      var v319 = this.data.getInt16(this.read);
      this.read += 2;
      return v319;
    };
    v161.DataBuffer.prototype.getInt24 = function () {
      var v320 = v158;
      var v321 = this.data.getInt16(this.read) << 8 ^ this.data.getInt8(this.read + 2);
      this.read += 3;
      return v321;
    };
    v161.DataBuffer.prototype.getInt32 = function () {
      var v322 = v158;
      var v323 = this.data.getInt32(this.read);
      this.read += 4;
      return v323;
    };
    v161.DataBuffer.prototype.getInt16Le = function () {
      var v324 = v158;
      var v325 = this.data.getInt16(this.read, true);
      this.read += 2;
      return v325;
    };
    v161.DataBuffer.prototype.getInt24Le = function () {
      var v326 = v158;
      var v327 = this.data.getInt8(this.read) ^ this.data.getInt16(this.read + 1, true) << 8;
      this.read += 3;
      return v327;
    };
    v161.DataBuffer.prototype.getInt32Le = function () {
      var v328 = v158;
      var v329 = this.data.getInt32(this.read, true);
      this.read += 4;
      return v329;
    };
    v161.DataBuffer.prototype.getInt = function (v330) {
      var v331 = v158;
      v191(v330);
      var v332 = 0;
      do {
        v332 = (v332 << 8) + this.data.getInt8(this.read++);
        v330 -= 8;
      } while (v330 > 0);
      return v332;
    };
    v161.DataBuffer.prototype.getSignedInt = function (v333) {
      var v334 = this.getInt(v333);
      var v335 = 2 << v333 - 2;
      if (v334 >= v335) {
        v334 -= v335 << 1;
      }
      return v334;
    };
    v161.DataBuffer.prototype.getBytes = function (v336) {
      var v337 = v158;
      var v338;
      if (v336) {
        v336 = Math.min(this.length(), v336);
        v338 = this.data.slice(this.read, this.read + v336);
        this.read += v336;
      } else if (v336 === 0) {
        v338 = "";
      } else {
        v338 = this.read === 0 ? this.data : this.data.slice(this.read);
        this.clear();
      }
      return v338;
    };
    v161.DataBuffer.prototype.bytes = function (v339) {
      var v340 = v158;
      if (typeof v339 === "undefined") {
        return this.data.slice(this.read);
      } else {
        return this.data.slice(this.read, this.read + v339);
      }
    };
    v161.DataBuffer.prototype.at = function (v341) {
      var v342 = v158;
      return this.data.getUint8(this.read + v341);
    };
    v161.DataBuffer.prototype.setAt = function (v343, v344) {
      var v345 = v158;
      this.data.setUint8(v343, v344);
      return this;
    };
    v161.DataBuffer.prototype.last = function () {
      var v346 = v158;
      return this.data.getUint8(this.write - 1);
    };
    v161.DataBuffer.prototype.copy = function () {
      return new v161.DataBuffer(this);
    };
    v161.DataBuffer.prototype.compact = function () {
      var v347 = v158;
      if (this.read > 0) {
        var v348 = new Uint8Array(this.data.buffer, this.read);
        var v349 = new Uint8Array(v348.byteLength);
        v349.set(v348);
        this.data = new DataView(v349);
        this.write -= this.read;
        this.read = 0;
      }
      return this;
    };
    v161.DataBuffer.prototype.clear = function () {
      var v350 = v158;
      this.data = new DataView(new ArrayBuffer(0));
      this.read = this.write = 0;
      return this;
    };
    v161.DataBuffer.prototype.truncate = function (v351) {
      var v352 = v158;
      this.write = Math.max(0, this.length() - v351);
      this.read = Math.min(this.read, this.write);
      return this;
    };
    v161.DataBuffer.prototype.toHex = function () {
      var v353 = v158;
      var v354 = "";
      for (var v355 = this.read; v355 < this.data.byteLength; ++v355) {
        var v356 = this.data.getUint8(v355);
        if (v356 < 16) {
          v354 += "0";
        }
        v354 += v356.toString(16);
      }
      return v354;
    };
    v161.DataBuffer.prototype.toString = function (v357) {
      var v358 = v158;
      var v359 = new Uint8Array(this.data, this.read, this.length());
      v357 = v357 || "utf8";
      if (v357 === "binary" || v357 === "raw") {
        return v161.binary.raw.encode(v359);
      }
      if (v357 === "hex") {
        return v161.binary.hex.encode(v359);
      }
      if (v357 === "base64") {
        return v161.binary.base64.encode(v359);
      }
      if (v357 === "utf8") {
        return v161.text.utf8.decode(v359);
      }
      if (v357 === "utf16") {
        return v161.text.utf16.decode(v359);
      }
      throw new Error("Invalid encoding: " + v357);
    };
    v161.createBuffer = function (v360, v361) {
      var v362 = v158;
      v361 = v361 || "raw";
      if (v360 !== undefined && v361 === "utf8") {
        v360 = v161.encodeUtf8(v360);
      }
      return new v161.ByteBuffer(v360);
    };
    v161.fillString = function (v363, v364) {
      var v365 = "";
      while (v364 > 0) {
        if (v364 & 1) {
          v365 += v363;
        }
        v364 >>>= 1;
        if (v364 > 0) {
          v363 += v363;
        }
      }
      return v365;
    };
    v161.xorBytes = function (v366, v367, v368) {
      var v369 = "";
      var v370 = "";
      var v371 = "";
      var v372 = 0;
      var v373 = 0;
      for (; v368 > 0; --v368, ++v372) {
        v370 = v366.charCodeAt(v372) ^ v367.charCodeAt(v372);
        if (v373 >= 10) {
          v369 += v371;
          v371 = "";
          v373 = 0;
        }
        v371 += String.fromCharCode(v370);
        ++v373;
      }
      v369 += v371;
      return v369;
    };
    v161.hexToBytes = function (v374) {
      var v375 = v158;
      var v376 = "";
      var v377 = 0;
      if (v374.length & true) {
        v377 = 1;
        v376 += String.fromCharCode(parseInt(v374[0], 16));
      }
      for (; v377 < v374.length; v377 += 2) {
        v376 += String.fromCharCode(parseInt(v374.substr(v377, 2), 16));
      }
      return v376;
    };
    v161.bytesToHex = function (v378) {
      var v379 = v158;
      return v161.createBuffer(v378).toHex();
    };
    v161.int32ToBytes = function (v380) {
      var v381 = v158;
      return String.fromCharCode(v380 >> 24 & 255) + String.fromCharCode(v380 >> 16 & 255) + String.fromCharCode(v380 >> 8 & 255) + String.fromCharCode(v380 & 255);
    };
    var v382 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    var v383 = [62, -1, -1, -1, 63, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, -1, -1, -1, 64, -1, -1, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, -1, -1, -1, -1, -1, -1, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51];
    var v384 = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
    v161.encode64 = function (v385, v386) {
      var v387 = v158;
      var v388 = "";
      var v389 = "";
      var v390;
      var v391;
      var v392;
      var v393 = 0;
      while (v393 < v385.length) {
        v390 = v385.charCodeAt(v393++);
        v391 = v385.charCodeAt(v393++);
        v392 = v385.charCodeAt(v393++);
        v388 += v382.charAt(v390 >> 2);
        v388 += v382.charAt((v390 & 3) << 4 | v391 >> 4);
        if (isNaN(v391)) {
          v388 += "==";
        } else {
          v388 += v382.charAt((v391 & 15) << 2 | v392 >> 6);
          v388 += isNaN(v392) ? "=" : v382.charAt(v392 & 63);
        }
        if (v386 && v388.length > v386) {
          v389 += v388.substr(0, v386) + "\r\n";
          v388 = v388.substr(v386);
        }
      }
      v389 += v388;
      return v389;
    };
    v161.decode64 = function (v394) {
      var v395 = v158;
      v394 = v394.replace(/[^A-Za-z0-9\+\/\=]/g, "");
      var v396 = "";
      var v397;
      var v398;
      var v399;
      var v400;
      var v401 = 0;
      while (v401 < v394.length) {
        v397 = v383[v394.charCodeAt(v401++) - 43];
        v398 = v383[v394.charCodeAt(v401++) - 43];
        v399 = v383[v394.charCodeAt(v401++) - 43];
        v400 = v383[v394.charCodeAt(v401++) - 43];
        v396 += String.fromCharCode(v397 << 2 | v398 >> 4);
        if (v399 !== 64) {
          v396 += String.fromCharCode((v398 & 15) << 4 | v399 >> 2);
          if (v400 !== 64) {
            v396 += String.fromCharCode((v399 & 3) << 6 | v400);
          }
        }
      }
      return v396;
    };
    v161.encodeUtf8 = function (v402) {
      return unescape(encodeURIComponent(v402));
    };
    v161.decodeUtf8 = function (v403) {
      return decodeURIComponent(escape(v403));
    };
    v161.binary = {
      raw: {},
      hex: {},
      base64: {},
      base58: {},
      baseN: {
        encode: v160.encode,
        decode: v160.decode
      }
    };
    v161.binary.raw.encode = function (v404) {
      var v405 = v158;
      return String.fromCharCode.apply(null, v404);
    };
    v161.binary.raw.decode = function (v406, v407, v408) {
      var v409 = v158;
      var v410 = v407;
      if (!v410) {
        v410 = new Uint8Array(v406.length);
      }
      v408 = v408 || 0;
      var v411 = v408;
      for (var v412 = 0; v412 < v406.length; ++v412) {
        v410[v411++] = v406.charCodeAt(v412);
      }
      if (v407) {
        return v411 - v408;
      } else {
        return v410;
      }
    };
    v161.binary.hex.encode = v161.bytesToHex;
    v161.binary.hex.decode = function (v413, v414, v415) {
      var v416 = v158;
      var v417 = v414;
      if (!v417) {
        v417 = new Uint8Array(Math.ceil(v413.length / 2));
      }
      v415 = v415 || 0;
      var v418 = 0;
      var v419 = v415;
      if (v413.length & 1) {
        v418 = 1;
        v417[v419++] = parseInt(v413[0], 16);
      }
      for (; v418 < v413.length; v418 += 2) {
        v417[v419++] = parseInt(v413.substr(v418, 2), 16);
      }
      if (v414) {
        return v419 - v415;
      } else {
        return v417;
      }
    };
    v161.binary.base64.encode = function (v420, v421) {
      var v422 = v158;
      var v423 = "";
      var v424 = "";
      var v425;
      var v426;
      var v427;
      var v428 = 0;
      while (v428 < v420.byteLength) {
        v425 = v420[v428++];
        v426 = v420[v428++];
        v427 = v420[v428++];
        v423 += v382.charAt(v425 >> 2);
        v423 += v382.charAt((v425 & 3) << 4 | v426 >> 4);
        if (isNaN(v426)) {
          v423 += "==";
        } else {
          v423 += v382.charAt((v426 & 15) << 2 | v427 >> 6);
          v423 += isNaN(v427) ? "=" : v382.charAt(v427 & 63);
        }
        if (v421 && v423.length > v421) {
          v424 += v423.substr(0, v421) + "\r\n";
          v423 = v423.substr(v421);
        }
      }
      v424 += v423;
      return v424;
    };
    v161.binary.base64.decode = function (v429, v430, v431) {
      var v432 = v158;
      var v433 = v430;
      if (!v433) {
        v433 = new Uint8Array(Math.ceil(v429.length / 4) * 3);
      }
      v429 = v429.replace(/[^A-Za-z0-9\+\/\=]/g, "");
      v431 = v431 || 0;
      var v434;
      var v435;
      var v436;
      var v437;
      var v438 = 0;
      var v439 = v431;
      while (v438 < v429.length) {
        v434 = v383[v429.charCodeAt(v438++) - 43];
        v435 = v383[v429.charCodeAt(v438++) - 43];
        v436 = v383[v429.charCodeAt(v438++) - 43];
        v437 = v383[v429.charCodeAt(v438++) - 43];
        v433[v439++] = v434 << 2 | v435 >> 4;
        if (v436 !== 64) {
          v433[v439++] = (v435 & 15) << 4 | v436 >> 2;
          if (v437 !== 64) {
            v433[v439++] = (v436 & 3) << 6 | v437;
          }
        }
      }
      if (v430) {
        return v439 - v431;
      } else {
        return v433.subarray(0, v439);
      }
    };
    v161.binary.base58.encode = function (v440, v441) {
      return v161.binary.baseN.encode(v440, v384, v441);
    };
    v161.binary.base58.decode = function (v442, v443) {
      var v444 = v158;
      return v161.binary.baseN.decode(v442, v384, v443);
    };
    v161.text = {
      utf8: {},
      utf16: {}
    };
    v161.text.utf8.encode = function (v445, v446, v447) {
      var v448 = v158;
      v445 = v161.encodeUtf8(v445);
      var v449 = v446;
      if (!v449) {
        v449 = new Uint8Array(v445.length);
      }
      v447 = v447 || 0;
      var v450 = v447;
      for (var v451 = 0; v451 < v445.length; ++v451) {
        v449[v450++] = v445.charCodeAt(v451);
      }
      if (v446) {
        return v450 - v447;
      } else {
        return v449;
      }
    };
    v161.text.utf8.decode = function (v452) {
      var v453 = v158;
      return v161.decodeUtf8(String.fromCharCode.apply(null, v452));
    };
    v161.text.utf16.encode = function (v454, v455, v456) {
      var v457 = v158;
      var v458 = v455;
      if (!v458) {
        v458 = new Uint8Array(v454.length * 2);
      }
      var v459 = new Uint16Array(v458.buffer);
      v456 = v456 || 0;
      var v460 = v456;
      var v461 = v456;
      for (var v462 = 0; v462 < v454.length; ++v462) {
        v459[v461++] = v454.charCodeAt(v462);
        v460 += 2;
      }
      if (v455) {
        return v460 - v456;
      } else {
        return v458;
      }
    };
    v161.text.utf16.decode = function (v463) {
      var v464 = v158;
      return String.fromCharCode.apply(null, new Uint16Array(v463.buffer));
    };
    v161.deflate = function (v465, v466, v467) {
      var v468 = v158;
      v466 = v161.decode64(v465.deflate(v161.encode64(v466)).rval);
      if (v467) {
        var v469 = 2;
        var v470 = v466.charCodeAt(1);
        if (v470 & 32) {
          v469 = 6;
        }
        v466 = v466.substring(v469, v466.length - 4);
      }
      return v466;
    };
    v161.inflate = function (v471, v472, v473) {
      var v474 = v158;
      var v475 = v471.inflate(v161.encode64(v472)).rval;
      if (v475 === null) {
        return null;
      } else {
        return v161.decode64(v475);
      }
    };
    function v476(v477, v478, v479) {
      var v480 = v158;
      if (!v477) {
        throw new Error("WebStorage not available.");
      }
      var v481;
      if (v479 === null) {
        v481 = v477.removeItem(v478);
      } else {
        v479 = v161.encode64(JSON.stringify(v479));
        v481 = v477.setItem(v478, v479);
      }
      if (typeof v481 !== "undefined" && v481.rval !== true) {
        var v482 = new Error(v481.error.message);
        v482.id = v481.error.id;
        v482.name = v481.error.name;
        throw v482;
      }
    }
    function v483(v484, v485) {
      var v486 = v158;
      if (!v484) {
        throw new Error("WebStorage not available.");
      }
      var v487 = v484.getItem(v485);
      if (v484.init) {
        if (v487.rval === null) {
          if (v487.error) {
            var v488 = new Error(v487.error.message);
            v488.id = v487.error.id;
            v488.name = v487.error.name;
            throw v488;
          }
          v487 = null;
        } else {
          v487 = v487.rval;
        }
      }
      if (v487 !== null) {
        v487 = JSON.parse(v161.decode64(v487));
      }
      return v487;
    }
    function v489(v490, v491, v492, v493) {
      var v494 = v483(v490, v491);
      if (v494 === null) {
        v494 = {};
      }
      v494[v492] = v493;
      v476(v490, v491, v494);
    }
    function v495(v496, v497, v498) {
      var v499 = v483(v496, v497);
      if (v499 !== null) {
        v499 = v498 in v499 ? v499[v498] : null;
      }
      return v499;
    }
    function v500(v501, v502, v503) {
      var v504 = v483(v501, v502);
      if (v504 !== null && v503 in v504) {
        delete v504[v503];
        var v505 = true;
        for (var v506 in v504) {
          v505 = false;
          break;
        }
        if (v505) {
          v504 = null;
        }
        v476(v501, v502, v504);
      }
    }
    function v507(v508, v509) {
      v476(v508, v509, null);
    }
    function v510(v511, v512, v513) {
      var v514 = v158;
      var v515 = null;
      if (typeof v513 === "undefined") {
        v513 = ["web", "flash"];
      }
      var v516;
      var v517 = false;
      var v518 = null;
      for (var v519 in v513) {
        v516 = v513[v519];
        try {
          if (v516 === "flash" || v516 === "both") {
            if (v512[0] === null) {
              throw new Error("Flash local storage not available.");
            }
            v515 = v511.apply(this, v512);
            v517 = v516 === "flash";
          }
          if (v516 === "web" || v516 === "both") {
            v512[0] = localStorage;
            v515 = v511.apply(this, v512);
            v517 = true;
          }
        } catch (v520) {
          v518 = v520;
        }
        if (v517) {
          break;
        }
      }
      if (!v517) {
        throw v518;
      }
      return v515;
    }
    v161.setItem = function (v521, v522, v523, v524, v525) {
      v510(v489, arguments, v525);
    };
    v161.getItem = function (v526, v527, v528, v529) {
      return v510(v495, arguments, v529);
    };
    v161.removeItem = function (v530, v531, v532, v533) {
      v510(v500, arguments, v533);
    };
    v161.clearItems = function (v534, v535, v536) {
      v510(v507, arguments, v536);
    };
    v161.isEmpty = function (v537) {
      for (var v538 in v537) {
        if (v537.hasOwnProperty(v538)) {
          return false;
        }
      }
      return true;
    };
    v161.format = function (v539) {
      var v540 = v158;
      var v541 = /%./g;
      var v542;
      var v543;
      var v544 = 0;
      var v545 = [];
      var v546 = 0;
      while (v542 = v541.exec(v539)) {
        v543 = v539.substring(v546, v541.lastIndex - 2);
        if (v543.length > 0) {
          v545.push(v543);
        }
        v546 = v541.lastIndex;
        var v547 = v542[0][1];
        switch (v547) {
          case "s":
          case "o":
            if (v544 < arguments.length) {
              v545.push(arguments[v544++ + 1]);
            } else {
              v545.push("<?>");
            }
            break;
          case "%":
            v545.push("%");
            break;
          default:
            v545.push("<%" + v547 + "?>");
        }
      }
      v545.push(v539.substring(v546));
      return v545.join("");
    };
    v161.formatNumber = function (v548, v549, v550, v551) {
      var v552 = v158;
      var v553 = v548;
      var v554 = isNaN(v549 = Math.abs(v549)) ? 2 : v549;
      var v555 = v550 === undefined ? "," : v550;
      var v556 = v551 === undefined ? "." : v551;
      var v557 = v553 < 0 ? "-" : "";
      var v558 = parseInt(v553 = Math.abs(+v553 || 0).toFixed(v554), 10) + "";
      var v559 = v558.length > 3 ? v558.length % 3 : 0;
      return v557 + (v559 ? v558.substr(0, v559) + v556 : "") + v558.substr(v559).replace(/(\d{3})(?=\d)/g, "$1" + v556) + (v554 ? v555 + Math.abs(v553 - v558).toFixed(v554).slice(2) : "");
    };
    v161.formatSize = function (v560) {
      var v561 = v158;
      if (v560 >= 1073741824) {
        v560 = v161.formatNumber(v560 / 1073741824, 2, ".", "") + " GiB";
      } else if (v560 >= 1048576) {
        v560 = v161.formatNumber(v560 / 1048576, 2, ".", "") + " MiB";
      } else if (v560 >= 1024) {
        v560 = v161.formatNumber(v560 / 1024, 0) + " KiB";
      } else {
        v560 = v161.formatNumber(v560, 0) + " bytes";
      }
      return v560;
    };
    v161.bytesFromIP = function (v562) {
      if (v562.indexOf(".") !== -1) {
        return v161.bytesFromIPv4(v562);
      }
      if (v562.indexOf(":") !== -1) {
        return v161.bytesFromIPv6(v562);
      }
      return null;
    };
    v161.bytesFromIPv4 = function (v563) {
      var v564 = v158;
      v563 = v563.split(".");
      if (v563.length !== 4) {
        return null;
      }
      var v565 = v161.createBuffer();
      for (var v566 = 0; v566 < v563.length; ++v566) {
        var v567 = parseInt(v563[v566], 10);
        if (isNaN(v567)) {
          return null;
        }
        v565.putByte(v567);
      }
      return v565.getBytes();
    };
    v161.bytesFromIPv6 = function (v568) {
      var v569 = v158;
      var v570 = 0;
      v568 = v568.split(":").filter(function (v571) {
        if (v571.length === 0) {
          ++v570;
        }
        return true;
      });
      var v572 = (8 - v568.length + v570) * 2;
      var v573 = v161.createBuffer();
      for (var v574 = 0; v574 < 8; ++v574) {
        if (!v568[v574] || v568[v574].length === 0) {
          v573.fillWithByte(0, v572);
          v572 = 0;
          continue;
        }
        var v575 = v161.hexToBytes(v568[v574]);
        if (v575.length < 2) {
          v573.putByte(0);
        }
        v573.putBytes(v575);
      }
      return v573.getBytes();
    };
    v161.bytesToIP = function (v576) {
      var v577 = v158;
      if (v576.length === 4) {
        return v161.bytesToIPv4(v576);
      }
      if (v576.length === 16) {
        return v161.bytesToIPv6(v576);
      }
      return null;
    };
    v161.bytesToIPv4 = function (v578) {
      var v579 = v158;
      if (v578.length !== 4) {
        return null;
      }
      var v580 = [];
      for (var v581 = 0; v581 < v578.length; ++v581) {
        v580.push(v578.charCodeAt(v581));
      }
      return v580.join(".");
    };
    v161.bytesToIPv6 = function (v582) {
      var v583 = v158;
      if (v582.length !== 16) {
        return null;
      }
      var v584 = [];
      var v585 = [];
      var v586 = 0;
      for (var v587 = 0; v587 < v582.length; v587 += 2) {
        var v588 = v161.bytesToHex(v582[v587] + v582[v587 + 1]);
        while (v588[0] === "0" && v588 !== "0") {
          v588 = v588.substr(1);
        }
        if (v588 === "0") {
          var v589 = v585[v585.length - 1];
          var v590 = v584.length;
          if (!v589 || v590 !== v589.end + 1) {
            v585.push({
              start: v590,
              end: v590
            });
          } else {
            v589.end = v590;
            if (v589.end - v589.start > v585[v586].end - v585[v586].start) {
              v586 = v585.length - 1;
            }
          }
        }
        v584.push(v588);
      }
      if (v585.length > 0) {
        var v591 = v585[v586];
        if (v591.end - v591.start > 0) {
          v584.splice(v591.start, v591.end - v591.start + 1, "");
          if (v591.start === 0) {
            v584.unshift("");
          }
          if (v591.end === 7) {
            v584.push("");
          }
        }
      }
      return v584.join(":");
    };
    v161.estimateCores = function (v592, v593) {
      var v594 = {
        dh248: 1354,
        dh249: 1514,
        dh250: 624
      };
      var v595 = {
        dh251: 1204
      };
      var v596 = v158;
      if (typeof v592 === "function") {
        v593 = v592;
        v592 = {};
      }
      v592 = v592 || {};
      if ("cores" in v161 && !v592.update) {
        return v593(null, v161.cores);
      }
      if (typeof navigator !== "undefined" && "hardwareConcurrency" in navigator && navigator.hardwareConcurrency > 0) {
        v161.cores = navigator.hardwareConcurrency;
        return v593(null, v161.cores);
      }
      if (typeof Worker === "undefined") {
        v161.cores = 1;
        return v593(null, v161.cores);
      }
      if (typeof Blob === "undefined") {
        v161.cores = 2;
        return v593(null, v161.cores);
      }
      var v597 = URL.createObjectURL(new Blob(["(", function () {
        var v598 = {
          dh252: 1356
        };
        var v599 = v596;
        self.addEventListener("message", function (v600) {
          var v601 = v599;
          var v602 = Date.now();
          var v603 = v602 + 4;
          while (Date.now() < v603);
          self.postMessage({
            st: v602,
            et: v603
          });
        });
      }.toString(), ")()"], {
        type: "application/javascript"
      }));
      v604([], 5, 16);
      function v604(v605, v606, v607) {
        var v608 = v596;
        if (v606 === 0) {
          var v609 = Math.floor(v605.reduce(function (v610, v611) {
            return v610 + v611;
          }, 0) / v605.length);
          v161.cores = Math.max(1, v609);
          URL.revokeObjectURL(v597);
          return v593(null, v161.cores);
        }
        v612(v607, function (v613, v614) {
          v605.push(v615(v607, v614));
          v604(v605, v606 - 1, v607);
        });
      }
      function v612(v616, v617) {
        var v618 = {
          dh253: 857
        };
        var v619 = v596;
        var v620 = [];
        var v621 = [];
        for (var v622 = 0; v622 < v616; ++v622) {
          var v623 = new Worker(v597);
          v623.addEventListener("message", function (v624) {
            var v625 = v1;
            v621.push(v624.data);
            if (v621.length === v616) {
              for (var v626 = 0; v626 < v616; ++v626) {
                v620[v626].terminate();
              }
              v617(null, v621);
            }
          });
          v620.push(v623);
        }
        for (var v622 = 0; v622 < v616; ++v622) {
          v620[v622].postMessage(v622);
        }
      }
      function v615(v627, v628) {
        var v629 = {
          dh254: 857
        };
        var v630 = [];
        for (var v631 = 0; v631 < v627; ++v631) {
          var v632 = v628[v631];
          var v633 = v630[v631] = [];
          for (var v634 = 0; v634 < v627; ++v634) {
            if (v631 === v634) {
              continue;
            }
            var v635 = v628[v634];
            if (v632.st > v635.st && v632.st < v635.et || v635.st > v632.st && v635.st < v632.et) {
              v633.push(v634);
            }
          }
        }
        return v630.reduce(function (v636, v637) {
          var v638 = v1;
          return Math.max(v636, v637.length);
        }, 0);
      }
    };
  }
});
var require_cipher = __commonJS({
  "node_modules/node-forge/lib/cipher.js"(v639, v640) {
    var v641 = {
      dh255: 1251,
      dh256: 443,
      dh257: 1251,
      dh258: 931,
      dh259: 352
    };
    var v642 = {
      dh260: 956,
      dh261: 532,
      dh262: 532,
      dh263: 480,
      dh264: 857,
      dh265: 256,
      dh266: 1376,
      dh267: 623
    };
    var v643 = {
      dh268: 654,
      dh269: 724,
      dh270: 1037
    };
    var v644 = {
      dh271: 619,
      dh272: 931
    };
    var v645 = {
      dh273: 904,
      dh274: 480,
      dh275: 537
    };
    var v646 = {
      dh276: 1375,
      dh277: 1251
    };
    var v647 = {
      dh278: 1375,
      dh279: 443
    };
    var v648 = v2;
    var v649 = require_forge();
    require_util();
    v640.exports = v649.cipher = v649.cipher || {};
    v649.cipher.algorithms = v649.cipher.algorithms || {};
    v649.cipher.createCipher = function (v650, v651) {
      var v652 = v648;
      var v653 = v650;
      if (typeof v653 === "string") {
        v653 = v649.cipher.getAlgorithm(v653);
        v653 &&= v653();
      }
      if (!v653) {
        throw new Error("Unsupported algorithm: " + v650);
      }
      return new v649.cipher.BlockCipher({
        algorithm: v653,
        key: v651,
        decrypt: false
      });
    };
    v649.cipher.createDecipher = function (v654, v655) {
      var v656 = v648;
      var v657 = v654;
      if (typeof v657 === "string") {
        v657 = v649.cipher.getAlgorithm(v657);
        v657 &&= v657();
      }
      if (!v657) {
        throw new Error("Unsupported algorithm: " + v654);
      }
      return new v649.cipher.BlockCipher({
        algorithm: v657,
        key: v655,
        decrypt: true
      });
    };
    v649.cipher.registerAlgorithm = function (v658, v659) {
      var v660 = v648;
      v658 = v658.toUpperCase();
      v649.cipher.algorithms[v658] = v659;
    };
    v649.cipher.getAlgorithm = function (v661) {
      var v662 = v648;
      v661 = v661.toUpperCase();
      if (v661 in v649.cipher.algorithms) {
        return v649.cipher.algorithms[v661];
      }
      return null;
    };
    var v663 = v649.cipher.BlockCipher = function (v664) {
      var v665 = v648;
      this.algorithm = v664.algorithm;
      this.mode = this.algorithm.mode;
      this.blockSize = this.mode.blockSize;
      this._finish = false;
      this._input = null;
      this.output = null;
      this._op = v664.decrypt ? this.mode.decrypt : this.mode.encrypt;
      this._decrypt = v664.decrypt;
      this.algorithm.initialize(v664);
    };
    v663.prototype.start = function (v666) {
      var v667 = v648;
      v666 = v666 || {};
      var v668 = {};
      for (var v669 in v666) {
        v668[v669] = v666[v669];
      }
      v668.decrypt = this._decrypt;
      this._finish = false;
      this._input = v649.util.createBuffer();
      this.output = v666.output || v649.util.createBuffer();
      this.mode.start(v668);
    };
    v663.prototype.update = function (v670) {
      var v671 = v648;
      if (v670) {
        this._input.putBuffer(v670);
      }
      while (!this._op.call(this.mode, this._input, this.output, this._finish) && !this._finish) {}
      this._input.compact();
    };
    v663.prototype.finish = function (v672) {
      var v673 = v648;
      if (v672 && (this.mode.name === "ECB" || this.mode.name === "CBC")) {
        this.mode.pad = function (v674) {
          var v675 = v673;
          return v672(this.blockSize, v674, false);
        };
        this.mode.unpad = function (v676) {
          var v677 = v673;
          return v672(this.blockSize, v676, true);
        };
      }
      var v678 = {
        decrypt: this._decrypt
      };
      v678.overflow = this._input.length() % this.blockSize;
      if (!this._decrypt && this.mode.pad) {
        if (!this.mode.pad(this._input, v678)) {
          return false;
        }
      }
      this._finish = true;
      this.update();
      if (this._decrypt && this.mode.unpad) {
        if (!this.mode.unpad(this.output, v678)) {
          return false;
        }
      }
      if (this.mode.afterFinish) {
        if (!this.mode.afterFinish(this.output, v678)) {
          return false;
        }
      }
      return true;
    };
  }
});
var require_cipherModes = __commonJS({
  "node_modules/node-forge/lib/cipherModes.js"(v679, v680) {
    var v681 = {
      dh280: 1476,
      dh281: 1476,
      dh282: 931,
      dh283: 913,
      dh284: 1347,
      dh285: 913,
      dh286: 1098,
      dh287: 1347,
      dh288: 937,
      dh289: 937,
      dh290: 1286,
      dh291: 931,
      dh292: 1286,
      dh293: 281,
      dh294: 913,
      dh295: 1530,
      dh296: 356,
      dh297: 1376,
      dh298: 543,
      dh299: 913,
      dh300: 815,
      dh301: 913,
      dh302: 1253,
      dh303: 1116
    };
    var v682 = {
      dh304: 857
    };
    var v683 = {
      dh305: 478,
      dh306: 325
    };
    var v684 = {
      dh307: 1049
    };
    var v685 = {
      dh308: 1251,
      dh309: 631,
      dh310: 857
    };
    var v686 = {
      dh311: 821,
      dh312: 933,
      dh313: 1350,
      dh314: 933,
      dh315: 1339,
      dh316: 1350,
      dh317: 904
    };
    var v687 = {
      dh318: 1530,
      dh319: 991,
      dh320: 933,
      dh321: 904,
      dh322: 764,
      dh323: 904,
      dh324: 493,
      dh325: 1284,
      dh326: 1284,
      dh327: 250,
      dh328: 1025,
      dh329: 1163,
      dh330: 1162
    };
    var v688 = {
      dh331: 619,
      dh332: 493,
      dh333: 1508,
      dh334: 1252,
      dh335: 480,
      dh336: 1508,
      dh337: 1350,
      dh338: 631,
      dh339: 1339,
      dh340: 1162,
      dh341: 857,
      dh342: 933,
      dh343: 399,
      dh344: 478,
      dh345: 821,
      dh346: 619,
      dh347: 1130,
      dh348: 904,
      dh349: 904,
      dh350: 933
    };
    var v689 = {
      dh351: 904,
      dh352: 1339,
      dh353: 991,
      dh354: 1284,
      dh355: 619
    };
    var v690 = {
      dh356: 1163,
      dh357: 933,
      dh358: 1472,
      dh359: 904,
      dh360: 1025,
      dh361: 250,
      dh362: 1163
    };
    var v691 = {
      dh363: 1251,
      dh364: 1339
    };
    var v692 = {
      dh365: 991,
      dh366: 1339,
      dh367: 764,
      dh368: 991,
      dh369: 933,
      dh370: 1163,
      dh371: 1025,
      dh372: 1284,
      dh373: 250,
      dh374: 1163
    };
    var v693 = {
      dh375: 821,
      dh376: 478,
      dh377: 1163
    };
    var v694 = {
      dh378: 1339,
      dh379: 991,
      dh380: 1284
    };
    var v695 = {
      dh381: 857,
      dh382: 1530,
      dh383: 764,
      dh384: 1472,
      dh385: 1339,
      dh386: 372,
      dh387: 1339,
      dh388: 1163,
      dh389: 1284,
      dh390: 1163
    };
    var v696 = {
      dh391: 1530,
      dh392: 1163,
      dh393: 1339,
      dh394: 821,
      dh395: 933,
      dh396: 821,
      dh397: 204,
      dh398: 250,
      dh399: 250
    };
    var v697 = {
      dh400: 1163
    };
    var v698 = {
      dh401: 1034,
      dh402: 904,
      dh403: 991
    };
    var v699 = {
      dh404: 857,
      dh405: 904,
      dh406: 1090
    };
    var v700 = {
      dh407: 904
    };
    var v701 = {
      dh408: 857,
      dh409: 821
    };
    var v702 = {
      dh410: 933,
      dh411: 1251,
      dh412: 1530
    };
    var v703 = {
      dh413: 1198,
      dh414: 478
    };
    var v704 = {
      dh415: 1251,
      dh416: 821,
      dh417: 1339
    };
    var v705 = {
      dh418: 1090
    };
    var v706 = {
      dh419: 857,
      dh420: 904,
      dh421: 904
    };
    var v707 = {
      dh422: 1251
    };
    var v708 = {
      dh423: 1339,
      dh424: 1251,
      dh425: 1339,
      dh426: 991
    };
    var v709 = {
      dh427: 956,
      dh428: 1251,
      dh429: 821
    };
    var v710 = v2;
    var v711 = require_forge();
    require_util();
    v711.cipher = v711.cipher || {};
    var v712 = v680.exports = v711.cipher.modes = v711.cipher.modes || {};
    v712.ecb = function (v713) {
      var v714 = v710;
      v713 = v713 || {};
      this.name = "ECB";
      this.cipher = v713.cipher;
      this.blockSize = v713.blockSize || 16;
      this._ints = this.blockSize / 4;
      this._inBlock = new Array(this._ints);
      this._outBlock = new Array(this._ints);
    };
    v712.ecb.prototype.start = function (v715) {};
    v712.ecb.prototype.encrypt = function (v716, v717, v718) {
      var v719 = v710;
      if (v716.length() < this.blockSize && (!v718 || !(v716.length() > 0))) {
        return true;
      }
      for (var v720 = 0; v720 < this._ints; ++v720) {
        this._inBlock[v720] = v716.getInt32();
      }
      this.cipher.encrypt(this._inBlock, this._outBlock);
      for (var v720 = 0; v720 < this._ints; ++v720) {
        v717.putInt32(this._outBlock[v720]);
      }
    };
    v712.ecb.prototype.decrypt = function (v721, v722, v723) {
      var v724 = v710;
      if (v721.length() < this.blockSize && (!v723 || !(v721.length() > 0))) {
        return true;
      }
      for (var v725 = 0; v725 < this._ints; ++v725) {
        this._inBlock[v725] = v721.getInt32();
      }
      this.cipher.decrypt(this._inBlock, this._outBlock);
      for (var v725 = 0; v725 < this._ints; ++v725) {
        v722.putInt32(this._outBlock[v725]);
      }
    };
    v712.ecb.prototype.pad = function (v726, v727) {
      var v728 = v710;
      var v729 = v726.length() === this.blockSize ? this.blockSize : this.blockSize - v726.length();
      v726.fillWithByte(v729, v729);
      return true;
    };
    v712.ecb.prototype.unpad = function (v730, v731) {
      var v732 = v710;
      if (v731.overflow > 0) {
        return false;
      }
      var v733 = v730.length();
      var v734 = v730.at(v733 - 1);
      if (v734 > this.blockSize << 2) {
        return false;
      }
      v730.truncate(v734);
      return true;
    };
    v712.cbc = function (v735) {
      var v736 = v710;
      v735 = v735 || {};
      this.name = "CBC";
      this.cipher = v735.cipher;
      this.blockSize = v735.blockSize || 16;
      this._ints = this.blockSize / 4;
      this._inBlock = new Array(this._ints);
      this._outBlock = new Array(this._ints);
    };
    v712.cbc.prototype.start = function (v737) {
      var v738 = v710;
      if (v737.iv === null) {
        if (!this._prev) {
          throw new Error("Invalid IV parameter.");
        }
        this._iv = this._prev.slice(0);
      } else if (!("iv" in v737)) {
        throw new Error("Invalid IV parameter.");
      } else {
        this._iv = v739(v737.iv, this.blockSize);
        this._prev = this._iv.slice(0);
      }
    };
    v712.cbc.prototype.encrypt = function (v740, v741, v742) {
      var v743 = v710;
      if (v740.length() < this.blockSize && (!v742 || !(v740.length() > 0))) {
        return true;
      }
      for (var v744 = 0; v744 < this._ints; ++v744) {
        this._inBlock[v744] = this._prev[v744] ^ v740.getInt32();
      }
      this.cipher.encrypt(this._inBlock, this._outBlock);
      for (var v744 = 0; v744 < this._ints; ++v744) {
        v741.putInt32(this._outBlock[v744]);
      }
      this._prev = this._outBlock;
    };
    v712.cbc.prototype.decrypt = function (v745, v746, v747) {
      var v748 = v710;
      if (v745.length() < this.blockSize && (!v747 || !(v745.length() > 0))) {
        return true;
      }
      for (var v749 = 0; v749 < this._ints; ++v749) {
        this._inBlock[v749] = v745.getInt32();
      }
      this.cipher.decrypt(this._inBlock, this._outBlock);
      for (var v749 = 0; v749 < this._ints; ++v749) {
        v746.putInt32(this._prev[v749] ^ this._outBlock[v749]);
      }
      this._prev = this._inBlock.slice(0);
    };
    v712.cbc.prototype.pad = function (v750, v751) {
      var v752 = v710;
      var v753 = v750.length() === this.blockSize ? this.blockSize : this.blockSize - v750.length();
      v750.fillWithByte(v753, v753);
      return true;
    };
    v712.cbc.prototype.unpad = function (v754, v755) {
      var v756 = v710;
      if (v755.overflow > 0) {
        return false;
      }
      var v757 = v754.length();
      var v758 = v754.at(v757 - 1);
      if (v758 > this.blockSize << 2) {
        return false;
      }
      v754.truncate(v758);
      return true;
    };
    v712.cfb = function (v759) {
      var v760 = v710;
      v759 = v759 || {};
      this.name = "CFB";
      this.cipher = v759.cipher;
      this.blockSize = v759.blockSize || 16;
      this._ints = this.blockSize / 4;
      this._inBlock = null;
      this._outBlock = new Array(this._ints);
      this._partialBlock = new Array(this._ints);
      this._partialOutput = v711.util.createBuffer();
      this._partialBytes = 0;
    };
    v712.cfb.prototype.start = function (v761) {
      var v762 = v710;
      if (!("iv" in v761)) {
        throw new Error("Invalid IV parameter.");
      }
      this._iv = v739(v761.iv, this.blockSize);
      this._inBlock = this._iv.slice(0);
      this._partialBytes = 0;
    };
    v712.cfb.prototype.encrypt = function (v763, v764, v765) {
      var v766 = v710;
      var v767 = v763.length();
      if (v767 === 0) {
        return true;
      }
      this.cipher.encrypt(this._inBlock, this._outBlock);
      if (this._partialBytes === 0 && v767 >= this.blockSize) {
        for (var v768 = 0; v768 < this._ints; ++v768) {
          this._inBlock[v768] = v763.getInt32() ^ this._outBlock[v768];
          v764.putInt32(this._inBlock[v768]);
        }
        return;
      }
      var v769 = (this.blockSize - v767) % this.blockSize;
      if (v769 > 0) {
        v769 = this.blockSize - v769;
      }
      this._partialOutput.clear();
      for (var v768 = 0; v768 < this._ints; ++v768) {
        this._partialBlock[v768] = v763.getInt32() ^ this._outBlock[v768];
        this._partialOutput.putInt32(this._partialBlock[v768]);
      }
      if (v769 > 0) {
        v763.read -= this.blockSize;
      } else {
        for (var v768 = 0; v768 < this._ints; ++v768) {
          this._inBlock[v768] = this._partialBlock[v768];
        }
      }
      if (this._partialBytes > 0) {
        this._partialOutput.getBytes(this._partialBytes);
      }
      if (v769 > 0 && !v765) {
        v764.putBytes(this._partialOutput.getBytes(v769 - this._partialBytes));
        this._partialBytes = v769;
        return true;
      }
      v764.putBytes(this._partialOutput.getBytes(v767 - this._partialBytes));
      this._partialBytes = 0;
    };
    v712.cfb.prototype.decrypt = function (v770, v771, v772) {
      var v773 = v710;
      var v774 = v770.length();
      if (v774 === 0) {
        return true;
      }
      this.cipher.encrypt(this._inBlock, this._outBlock);
      if (this._partialBytes === 0 && v774 >= this.blockSize) {
        for (var v775 = 0; v775 < this._ints; ++v775) {
          this._inBlock[v775] = v770.getInt32();
          v771.putInt32(this._inBlock[v775] ^ this._outBlock[v775]);
        }
        return;
      }
      var v776 = (this.blockSize - v774) % this.blockSize;
      if (v776 > 0) {
        v776 = this.blockSize - v776;
      }
      this._partialOutput.clear();
      for (var v775 = 0; v775 < this._ints; ++v775) {
        this._partialBlock[v775] = v770.getInt32();
        this._partialOutput.putInt32(this._partialBlock[v775] ^ this._outBlock[v775]);
      }
      if (v776 > 0) {
        v770.read -= this.blockSize;
      } else {
        for (var v775 = 0; v775 < this._ints; ++v775) {
          this._inBlock[v775] = this._partialBlock[v775];
        }
      }
      if (this._partialBytes > 0) {
        this._partialOutput.getBytes(this._partialBytes);
      }
      if (v776 > 0 && !v772) {
        v771.putBytes(this._partialOutput.getBytes(v776 - this._partialBytes));
        this._partialBytes = v776;
        return true;
      }
      v771.putBytes(this._partialOutput.getBytes(v774 - this._partialBytes));
      this._partialBytes = 0;
    };
    v712.ofb = function (v777) {
      var v778 = v710;
      v777 = v777 || {};
      this.name = "OFB";
      this.cipher = v777.cipher;
      this.blockSize = v777.blockSize || 16;
      this._ints = this.blockSize / 4;
      this._inBlock = null;
      this._outBlock = new Array(this._ints);
      this._partialOutput = v711.util.createBuffer();
      this._partialBytes = 0;
    };
    v712.ofb.prototype.start = function (v779) {
      var v780 = v710;
      if (!("iv" in v779)) {
        throw new Error("Invalid IV parameter.");
      }
      this._iv = v739(v779.iv, this.blockSize);
      this._inBlock = this._iv.slice(0);
      this._partialBytes = 0;
    };
    v712.ofb.prototype.encrypt = function (v781, v782, v783) {
      var v784 = v710;
      var v785 = v781.length();
      if (v781.length() === 0) {
        return true;
      }
      this.cipher.encrypt(this._inBlock, this._outBlock);
      if (this._partialBytes === 0 && v785 >= this.blockSize) {
        for (var v786 = 0; v786 < this._ints; ++v786) {
          v782.putInt32(v781.getInt32() ^ this._outBlock[v786]);
          this._inBlock[v786] = this._outBlock[v786];
        }
        return;
      }
      var v787 = (this.blockSize - v785) % this.blockSize;
      if (v787 > 0) {
        v787 = this.blockSize - v787;
      }
      this._partialOutput.clear();
      for (var v786 = 0; v786 < this._ints; ++v786) {
        this._partialOutput.putInt32(v781.getInt32() ^ this._outBlock[v786]);
      }
      if (v787 > 0) {
        v781.read -= this.blockSize;
      } else {
        for (var v786 = 0; v786 < this._ints; ++v786) {
          this._inBlock[v786] = this._outBlock[v786];
        }
      }
      if (this._partialBytes > 0) {
        this._partialOutput.getBytes(this._partialBytes);
      }
      if (v787 > 0 && !v783) {
        v782.putBytes(this._partialOutput.getBytes(v787 - this._partialBytes));
        this._partialBytes = v787;
        return true;
      }
      v782.putBytes(this._partialOutput.getBytes(v785 - this._partialBytes));
      this._partialBytes = 0;
    };
    v712.ofb.prototype.decrypt = v712.ofb.prototype.encrypt;
    v712.ctr = function (v788) {
      var v789 = v710;
      v788 = v788 || {};
      this.name = "CTR";
      this.cipher = v788.cipher;
      this.blockSize = v788.blockSize || 16;
      this._ints = this.blockSize / 4;
      this._inBlock = null;
      this._outBlock = new Array(this._ints);
      this._partialOutput = v711.util.createBuffer();
      this._partialBytes = 0;
    };
    v712.ctr.prototype.start = function (v790) {
      var v791 = v710;
      if (!("iv" in v790)) {
        throw new Error("Invalid IV parameter.");
      }
      this._iv = v739(v790.iv, this.blockSize);
      this._inBlock = this._iv.slice(0);
      this._partialBytes = 0;
    };
    v712.ctr.prototype.encrypt = function (v792, v793, v794) {
      var v795 = v710;
      var v796 = v792.length();
      if (v796 === 0) {
        return true;
      }
      this.cipher.encrypt(this._inBlock, this._outBlock);
      if (this._partialBytes === 0 && v796 >= this.blockSize) {
        for (var v797 = 0; v797 < this._ints; ++v797) {
          v793.putInt32(v792.getInt32() ^ this._outBlock[v797]);
        }
      } else {
        var v798 = (this.blockSize - v796) % this.blockSize;
        if (v798 > 0) {
          v798 = this.blockSize - v798;
        }
        this._partialOutput.clear();
        for (var v797 = 0; v797 < this._ints; ++v797) {
          this._partialOutput.putInt32(v792.getInt32() ^ this._outBlock[v797]);
        }
        if (v798 > 0) {
          v792.read -= this.blockSize;
        }
        if (this._partialBytes > 0) {
          this._partialOutput.getBytes(this._partialBytes);
        }
        if (v798 > 0 && !v794) {
          v793.putBytes(this._partialOutput.getBytes(v798 - this._partialBytes));
          this._partialBytes = v798;
          return true;
        }
        v793.putBytes(this._partialOutput.getBytes(v796 - this._partialBytes));
        this._partialBytes = 0;
      }
      v799(this._inBlock);
    };
    v712.ctr.prototype.decrypt = v712.ctr.prototype.encrypt;
    v712.gcm = function (v800) {
      var v801 = v710;
      v800 = v800 || {};
      this.name = "GCM";
      this.cipher = v800.cipher;
      this.blockSize = v800.blockSize || 16;
      this._ints = this.blockSize / 4;
      this._inBlock = new Array(this._ints);
      this._outBlock = new Array(this._ints);
      this._partialOutput = v711.util.createBuffer();
      this._partialBytes = 0;
      this._R = 3774873600;
    };
    v712.gcm.prototype.start = function (v802) {
      var v803 = v710;
      if (!("iv" in v802)) {
        throw new Error("Invalid IV parameter.");
      }
      var v804 = v711.util.createBuffer(v802.iv);
      this._cipherLength = 0;
      var v805;
      if ("additionalData" in v802) {
        v805 = v711.util.createBuffer(v802.additionalData);
      } else {
        v805 = v711.util.createBuffer();
      }
      if ("tagLength" in v802) {
        this._tagLength = v802.tagLength;
      } else {
        this._tagLength = 128;
      }
      this._tag = null;
      if (v802.decrypt) {
        this._tag = v711.util.createBuffer(v802.tag).getBytes();
        if (this._tag.length !== this._tagLength / 8) {
          throw new Error("Authentication tag does not match tag length.");
        }
      }
      this._hashBlock = new Array(this._ints);
      this.tag = null;
      this._hashSubkey = new Array(this._ints);
      this.cipher.encrypt([0, 0, 0, 0], this._hashSubkey);
      this.componentBits = 4;
      this._m = this.generateHashTable(this._hashSubkey, this.componentBits);
      var v806 = v804.length();
      if (v806 === 12) {
        this._j0 = [v804.getInt32(), v804.getInt32(), v804.getInt32(), 1];
      } else {
        this._j0 = [0, 0, 0, 0];
        while (v804.length() > 0) {
          this._j0 = this.ghash(this._hashSubkey, this._j0, [v804.getInt32(), v804.getInt32(), v804.getInt32(), v804.getInt32()]);
        }
        this._j0 = this.ghash(this._hashSubkey, this._j0, [0, 0].concat(v807(v806 * 8)));
      }
      this._inBlock = this._j0.slice(0);
      v799(this._inBlock);
      this._partialBytes = 0;
      v805 = v711.util.createBuffer(v805);
      this._aDataLength = v807(v805.length() * 8);
      var v808 = v805.length() % this.blockSize;
      if (v808) {
        v805.fillWithByte(0, this.blockSize - v808);
      }
      this._s = [0, 0, 0, 0];
      while (v805.length() > 0) {
        this._s = this.ghash(this._hashSubkey, this._s, [v805.getInt32(), v805.getInt32(), v805.getInt32(), v805.getInt32()]);
      }
    };
    v712.gcm.prototype.encrypt = function (v809, v810, v811) {
      var v812 = v710;
      var v813 = v809.length();
      if (v813 === 0) {
        return true;
      }
      this.cipher.encrypt(this._inBlock, this._outBlock);
      if (this._partialBytes === 0 && v813 >= this.blockSize) {
        for (var v814 = 0; v814 < this._ints; ++v814) {
          v810.putInt32(this._outBlock[v814] ^= v809.getInt32());
        }
        this._cipherLength += this.blockSize;
      } else {
        var v815 = (this.blockSize - v813) % this.blockSize;
        if (v815 > 0) {
          v815 = this.blockSize - v815;
        }
        this._partialOutput.clear();
        for (var v814 = 0; v814 < this._ints; ++v814) {
          this._partialOutput.putInt32(v809.getInt32() ^ this._outBlock[v814]);
        }
        if (v815 <= 0 || v811) {
          if (v811) {
            var v816 = v813 % this.blockSize;
            this._cipherLength += v816;
            this._partialOutput.truncate(this.blockSize - v816);
          } else {
            this._cipherLength += this.blockSize;
          }
          for (var v814 = 0; v814 < this._ints; ++v814) {
            this._outBlock[v814] = this._partialOutput.getInt32();
          }
          this._partialOutput.read -= this.blockSize;
        }
        if (this._partialBytes > 0) {
          this._partialOutput.getBytes(this._partialBytes);
        }
        if (v815 > 0 && !v811) {
          v809.read -= this.blockSize;
          v810.putBytes(this._partialOutput.getBytes(v815 - this._partialBytes));
          this._partialBytes = v815;
          return true;
        }
        v810.putBytes(this._partialOutput.getBytes(v813 - this._partialBytes));
        this._partialBytes = 0;
      }
      this._s = this.ghash(this._hashSubkey, this._s, this._outBlock);
      v799(this._inBlock);
    };
    v712.gcm.prototype.decrypt = function (v817, v818, v819) {
      var v820 = v710;
      var v821 = v817.length();
      if (v821 < this.blockSize && (!v819 || !(v821 > 0))) {
        return true;
      }
      this.cipher.encrypt(this._inBlock, this._outBlock);
      v799(this._inBlock);
      this._hashBlock[0] = v817.getInt32();
      this._hashBlock[1] = v817.getInt32();
      this._hashBlock[2] = v817.getInt32();
      this._hashBlock[3] = v817.getInt32();
      this._s = this.ghash(this._hashSubkey, this._s, this._hashBlock);
      for (var v822 = 0; v822 < this._ints; ++v822) {
        v818.putInt32(this._outBlock[v822] ^ this._hashBlock[v822]);
      }
      if (v821 < this.blockSize) {
        this._cipherLength += v821 % this.blockSize;
      } else {
        this._cipherLength += this.blockSize;
      }
    };
    v712.gcm.prototype.afterFinish = function (v823, v824) {
      var v825 = v710;
      var v826 = true;
      if (v824.decrypt && v824.overflow) {
        v823.truncate(this.blockSize - v824.overflow);
      }
      this.tag = v711.util.createBuffer();
      var v827 = this._aDataLength.concat(v807(this._cipherLength * 8));
      this._s = this.ghash(this._hashSubkey, this._s, v827);
      var v828 = [];
      this.cipher.encrypt(this._j0, v828);
      for (var v829 = 0; v829 < this._ints; ++v829) {
        this.tag.putInt32(this._s[v829] ^ v828[v829]);
      }
      this.tag.truncate(this.tag.length() % (this._tagLength / 8));
      if (v824.decrypt && this.tag.bytes() !== this._tag) {
        v826 = false;
      }
      return v826;
    };
    v712.gcm.prototype.multiply = function (v830, v831) {
      var v832 = [0, 0, 0, 0];
      var v833 = v831.slice(0);
      for (var v834 = 0; v834 < 128; ++v834) {
        var v835 = v830[v834 / 32 | 0] & 1 << 31 - v834 % 32;
        if (v835) {
          v832[0] ^= v833[0];
          v832[1] ^= v833[1];
          v832[2] ^= v833[2];
          v832[3] ^= v833[3];
        }
        this.pow(v833, v833);
      }
      return v832;
    };
    v712.gcm.prototype.pow = function (v836, v837) {
      var v838 = v836[3] & 1;
      for (var v839 = 3; v839 > 0; --v839) {
        v837[v839] = v836[v839] >>> 1 | (v836[v839 - 1] & 1) << 31;
      }
      v837[0] = v836[0] >>> 1;
      if (v838) {
        v837[0] ^= this._R;
      }
    };
    v712.gcm.prototype.tableMultiply = function (v840) {
      var v841 = [0, 0, 0, 0];
      for (var v842 = 0; v842 < 32; ++v842) {
        var v843 = v842 / 8 | 0;
        var v844 = v840[v843] >>> (7 - v842 % 8) * 4 & 15;
        var v845 = this._m[v842][v844];
        v841[0] ^= v845[0];
        v841[1] ^= v845[1];
        v841[2] ^= v845[2];
        v841[3] ^= v845[3];
      }
      return v841;
    };
    v712.gcm.prototype.ghash = function (v846, v847, v848) {
      var v849 = v710;
      v847[0] ^= v848[0];
      v847[1] ^= v848[1];
      v847[2] ^= v848[2];
      v847[3] ^= v848[3];
      return this.tableMultiply(v847);
    };
    v712.gcm.prototype.generateHashTable = function (v850, v851) {
      var v852 = v710;
      var v853 = 8 / v851;
      var v854 = v853 * 4;
      var v855 = v853 * 16;
      var v856 = new Array(v855);
      for (var v857 = 0; v857 < v855; ++v857) {
        var v858 = [0, 0, 0, 0];
        var v859 = v857 / v854 | 0;
        var v860 = (v854 - 1 - v857 % v854) * v851;
        v858[v859] = 1 << v851 - 1 << v860;
        v856[v857] = this.generateSubHashTable(this.multiply(v858, v850), v851);
      }
      return v856;
    };
    v712.gcm.prototype.generateSubHashTable = function (v861, v862) {
      var v863 = v710;
      var v864 = 1 << v862;
      var v865 = v864 >>> 1;
      var v866 = new Array(v864);
      v866[v865] = v861.slice(0);
      var v867 = v865 >>> 1;
      while (v867 > 0) {
        this.pow(v866[v867 * 2], v866[v867] = []);
        v867 >>= 1;
      }
      v867 = 2;
      while (v867 < v865) {
        for (var v868 = 1; v868 < v867; ++v868) {
          var v869 = v866[v867];
          var v870 = v866[v868];
          v866[v867 + v868] = [v869[0] ^ v870[0], v869[1] ^ v870[1], v869[2] ^ v870[2], v869[3] ^ v870[3]];
        }
        v867 *= 2;
      }
      v866[0] = [0, 0, 0, 0];
      for (v867 = v865 + 1; v867 < v864; ++v867) {
        var v871 = v866[v867 ^ v865];
        v866[v867] = [v861[0] ^ v871[0], v861[1] ^ v871[1], v861[2] ^ v871[2], v861[3] ^ v871[3]];
      }
      return v866;
    };
    function v739(v872, v873) {
      var v874 = v710;
      if (typeof v872 === "string") {
        v872 = v711.util.createBuffer(v872);
      }
      if (v711.util.isArray(v872) && v872.length > 4) {
        var v875 = v872;
        v872 = v711.util.createBuffer();
        for (var v876 = 0; v876 < v875.length; ++v876) {
          v872.putByte(v875[v876]);
        }
      }
      if (v872.length() < v873) {
        throw new Error("Invalid IV length; got " + v872.length() + " bytes and expected " + v873 + " bytes.");
      }
      if (!v711.util.isArray(v872)) {
        var v877 = [];
        var v878 = v873 / 4;
        for (var v876 = 0; v876 < v878; ++v876) {
          v877.push(v872.getInt32());
        }
        v872 = v877;
      }
      return v872;
    }
    function v799(v879) {
      v879[v879.length - 1] = v879[v879.length - 1] + 1 & -1;
    }
    function v807(v880) {
      return [v880 / 4294967296 | 0, v880 & -1];
    }
  }
});
var require_aes = __commonJS({
  "node_modules/node-forge/lib/aes.js"(v881, v882) {
    var v883 = {
      dh430: 891,
      dh431: 1091,
      dh432: 472,
      dh433: 472,
      dh434: 672,
      dh435: 627,
      dh436: 1251,
      dh437: 1476,
      dh438: 937,
      dh439: 1251,
      dh440: 1476,
      dh441: 1265,
      dh442: 281,
      dh443: 1288,
      dh444: 543
    };
    var v884 = {
      dh445: 934,
      dh446: 1375,
      dh447: 1251
    };
    var v885 = {
      dh448: 857
    };
    var v886 = {
      dh449: 478
    };
    var v887 = {
      dh450: 472
    };
    var v888 = {
      dh451: 277,
      dh452: 857,
      dh453: 619,
      dh454: 289,
      dh455: 1260,
      dh456: 619,
      dh457: 857,
      dh458: 532,
      dh459: 1034,
      dh460: 599,
      dh461: 480
    };
    var v889 = v2;
    var v890 = require_forge();
    require_cipher();
    require_cipherModes();
    require_util();
    v882.exports = v890.aes = v890.aes || {};
    v890.aes.startEncrypting = function (v891, v892, v893, v894) {
      var v895 = v889;
      var v896 = v897({
        key: v891,
        output: v893,
        decrypt: false,
        mode: v894
      });
      v896.start(v892);
      return v896;
    };
    v890.aes.createEncryptionCipher = function (v898, v899) {
      return v897({
        key: v898,
        output: null,
        decrypt: false,
        mode: v899
      });
    };
    v890.aes.startDecrypting = function (v900, v901, v902, v903) {
      var v904 = v897({
        key: v900,
        output: v902,
        decrypt: true,
        mode: v903
      });
      v904.start(v901);
      return v904;
    };
    v890.aes.createDecryptionCipher = function (v905, v906) {
      return v897({
        key: v905,
        output: null,
        decrypt: true,
        mode: v906
      });
    };
    v890.aes.Algorithm = function (v907, v908) {
      if (!v909) {
        v910();
      }
      var v911 = this;
      v911.name = v907;
      v911.mode = new v908({
        blockSize: 16,
        cipher: {
          encrypt: function (v912, v913) {
            return v914(v911._w, v912, v913, false);
          },
          decrypt: function (v915, v916) {
            return v914(v911._w, v915, v916, true);
          }
        }
      });
      v911._init = false;
    };
    v890.aes.Algorithm.prototype.initialize = function (v917) {
      var v918 = v889;
      if (this._init) {
        return;
      }
      var v919 = v917.key;
      var v920;
      if (typeof v919 === "string" && (v919.length === 16 || v919.length === 24 || v919.length === 32)) {
        v919 = v890.util.createBuffer(v919);
      } else if (v890.util.isArray(v919) && (v919.length === 16 || v919.length === 24 || v919.length === 32)) {
        v920 = v919;
        v919 = v890.util.createBuffer();
        for (var v921 = 0; v921 < v920.length; ++v921) {
          v919.putByte(v920[v921]);
        }
      }
      if (!v890.util.isArray(v919)) {
        v920 = v919;
        v919 = [];
        var v922 = v920.length();
        if (v922 === 16 || v922 === 24 || v922 === 32) {
          v922 = v922 >>> 2;
          for (var v921 = 0; v921 < v922; ++v921) {
            v919.push(v920.getInt32());
          }
        }
      }
      if (!v890.util.isArray(v919) || v919.length !== 4 && v919.length !== 6 && v919.length !== 8) {
        throw new Error("Invalid key parameter.");
      }
      var v923 = this.mode.name;
      var v924 = ["CFB", "OFB", "CTR", "GCM"].indexOf(v923) !== -1;
      this._w = v925(v919, v917.decrypt && !v924);
      this._init = true;
    };
    v890.aes._expandKey = function (v926, v927) {
      if (!v909) {
        v910();
      }
      return v925(v926, v927);
    };
    v890.aes._updateBlock = v914;
    v928("AES-ECB", v890.cipher.modes.ecb);
    v928("AES-CBC", v890.cipher.modes.cbc);
    v928("AES-CFB", v890.cipher.modes.cfb);
    v928("AES-OFB", v890.cipher.modes.ofb);
    v928("AES-CTR", v890.cipher.modes.ctr);
    v928("AES-GCM", v890.cipher.modes.gcm);
    function v928(v929, v930) {
      function v931() {
        var v932 = v1;
        return new v890.aes.Algorithm(v929, v930);
      }
      v890.cipher.registerAlgorithm(v929, v931);
    }
    var v909 = false;
    var v933 = 4;
    var v934;
    var v935;
    var v936;
    var v937;
    var v938;
    function v910() {
      v909 = true;
      v936 = [0, 1, 2, 4, 8, 16, 32, 64, 128, 27, 54];
      var v939 = new Array(256);
      for (var v940 = 0; v940 < 128; ++v940) {
        v939[v940] = v940 << 1;
        v939[v940 + 128] = v940 + 128 << 1 ^ 283;
      }
      v934 = new Array(256);
      v935 = new Array(256);
      v937 = new Array(4);
      v938 = new Array(4);
      for (var v940 = 0; v940 < 4; ++v940) {
        v937[v940] = new Array(256);
        v938[v940] = new Array(256);
      }
      var v941 = 0;
      var v942 = 0;
      var v943;
      var v944;
      var v945;
      var v946;
      var v947;
      var v948;
      var v949;
      for (var v940 = 0; v940 < 256; ++v940) {
        v946 = v942 ^ v942 << 1 ^ v942 << 2 ^ v942 << 3 ^ v942 << 4;
        v946 = v946 >> 8 ^ v946 & 255 ^ 99;
        v934[v941] = v946;
        v935[v946] = v941;
        v947 = v939[v946];
        v943 = v939[v941];
        v944 = v939[v943];
        v945 = v939[v944];
        v948 = v947 << 24 ^ v946 << 16 ^ v946 << 8 ^ (v946 ^ v947);
        v949 = (v943 ^ v944 ^ v945) << 24 ^ (v941 ^ v945) << 16 ^ (v941 ^ v944 ^ v945) << 8 ^ (v941 ^ v943 ^ v945);
        for (var v950 = 0; v950 < 4; ++v950) {
          v937[v950][v941] = v948;
          v938[v950][v946] = v949;
          v948 = v948 << 24 | v948 >>> 8;
          v949 = v949 << 24 | v949 >>> 8;
        }
        if (v941 === 0) {
          v941 = v942 = 1;
        } else {
          v941 = v943 ^ v939[v939[v939[v943 ^ v945]]];
          v942 ^= v939[v939[v942]];
        }
      }
    }
    function v925(v951, v952) {
      var v953 = v889;
      var v954 = v951.slice(0);
      var v955;
      var v956 = 1;
      var v957 = v954.length;
      var v958 = v957 + 6 + 1;
      var v959 = v933 * v958;
      for (var v960 = v957; v960 < v959; ++v960) {
        v955 = v954[v960 - 1];
        if (v960 % v957 === 0) {
          v955 = v934[v955 >>> 16 & 255] << 24 ^ v934[v955 >>> 8 & 255] << 16 ^ v934[v955 & 255] << 8 ^ v934[v955 >>> 24] ^ v936[v956] << 24;
          v956++;
        } else if (v957 > 6 && v960 % v957 === 4) {
          v955 = v934[v955 >>> 24] << 24 ^ v934[v955 >>> 16 & 255] << 16 ^ v934[v955 >>> 8 & 255] << 8 ^ v934[v955 & 255];
        }
        v954[v960] = v954[v960 - v957] ^ v955;
      }
      if (v952) {
        var v961;
        var v962 = v938[0];
        var v963 = v938[1];
        var v964 = v938[2];
        var v965 = v938[3];
        var v966 = v954.slice(0);
        v959 = v954.length;
        for (var v960 = 0, v967 = v959 - v933; v960 < v959; v960 += v933, v967 -= v933) {
          if (v960 === 0 || v960 === v959 - v933) {
            v966[v960] = v954[v967];
            v966[v960 + 1] = v954[v967 + 3];
            v966[v960 + 2] = v954[v967 + 2];
            v966[v960 + 3] = v954[v967 + 1];
          } else {
            for (var v968 = 0; v968 < v933; ++v968) {
              v961 = v954[v967 + v968];
              v966[v960 + (-v968 & 3)] = v962[v934[v961 >>> 24]] ^ v963[v934[v961 >>> 16 & 255]] ^ v964[v934[v961 >>> 8 & 255]] ^ v965[v934[v961 & 255]];
            }
          }
        }
        v954 = v966;
      }
      return v954;
    }
    function v914(v969, v970, v971, v972) {
      var v973 = v889;
      var v974 = v969.length / 4 - 1;
      var v975;
      var v976;
      var v977;
      var v978;
      var v979;
      if (v972) {
        v975 = v938[0];
        v976 = v938[1];
        v977 = v938[2];
        v978 = v938[3];
        v979 = v935;
      } else {
        v975 = v937[0];
        v976 = v937[1];
        v977 = v937[2];
        v978 = v937[3];
        v979 = v934;
      }
      var v980;
      var v981;
      var v982;
      var v983;
      var v984;
      var v985;
      var v986;
      v980 = v970[0] ^ v969[0];
      v981 = v970[v972 ? 3 : 1] ^ v969[1];
      v982 = v970[2] ^ v969[2];
      v983 = v970[v972 ? 1 : 3] ^ v969[3];
      var v987 = 3;
      for (var v988 = 1; v988 < v974; ++v988) {
        v984 = v975[v980 >>> 24] ^ v976[v981 >>> 16 & 255] ^ v977[v982 >>> 8 & 255] ^ v978[v983 & 255] ^ v969[++v987];
        v985 = v975[v981 >>> 24] ^ v976[v982 >>> 16 & 255] ^ v977[v983 >>> 8 & 255] ^ v978[v980 & 255] ^ v969[++v987];
        v986 = v975[v982 >>> 24] ^ v976[v983 >>> 16 & 255] ^ v977[v980 >>> 8 & 255] ^ v978[v981 & 255] ^ v969[++v987];
        v983 = v975[v983 >>> 24] ^ v976[v980 >>> 16 & 255] ^ v977[v981 >>> 8 & 255] ^ v978[v982 & 255] ^ v969[++v987];
        v980 = v984;
        v981 = v985;
        v982 = v986;
      }
      v971[0] = v979[v980 >>> 24] << 24 ^ v979[v981 >>> 16 & 255] << 16 ^ v979[v982 >>> 8 & 255] << 8 ^ v979[v983 & 255] ^ v969[++v987];
      v971[v972 ? 3 : 1] = v979[v981 >>> 24] << 24 ^ v979[v982 >>> 16 & 255] << 16 ^ v979[v983 >>> 8 & 255] << 8 ^ v979[v980 & 255] ^ v969[++v987];
      v971[2] = v979[v982 >>> 24] << 24 ^ v979[v983 >>> 16 & 255] << 16 ^ v979[v980 >>> 8 & 255] << 8 ^ v979[v981 & 255] ^ v969[++v987];
      v971[v972 ? 1 : 3] = v979[v983 >>> 24] << 24 ^ v979[v980 >>> 16 & 255] << 16 ^ v979[v981 >>> 8 & 255] << 8 ^ v979[v982 & 255] ^ v969[++v987];
    }
    function v897(v989) {
      var v990 = {
        dh462: 619
      };
      var v991 = v889;
      v989 = v989 || {};
      var v992 = (v989.mode || "CBC").toUpperCase();
      var v993 = "AES-" + v992;
      var v994;
      if (v989.decrypt) {
        v994 = v890.cipher.createDecipher(v993, v989.key);
      } else {
        v994 = v890.cipher.createCipher(v993, v989.key);
      }
      var v995 = v994.start;
      v994.start = function (v996, v997) {
        var v998 = v991;
        var v999 = null;
        if (v997 instanceof v890.util.ByteBuffer) {
          v999 = v997;
          v997 = {};
        }
        v997 = v997 || {};
        v997.output = v999;
        v997.iv = v996;
        v995.call(v994, v997);
      };
      return v994;
    }
  }
});
var require_oids = __commonJS({
  "node_modules/node-forge/lib/oids.js"(v1000, v1001) {
    var v1002 = {
      dh463: 880,
      dh464: 880,
      dh465: 1358,
      dh466: 418,
      dh467: 714,
      dh468: 571,
      dh469: 572,
      dh470: 1149,
      dh471: 1484,
      dh472: 1083,
      dh473: 1499,
      dh474: 412,
      dh475: 243,
      dh476: 434,
      dh477: 538,
      dh478: 805,
      dh479: 1548,
      dh480: 826,
      dh481: 609,
      dh482: 688,
      dh483: 1483,
      dh484: 1004,
      dh485: 218,
      dh486: 903,
      dh487: 1552,
      dh488: 1225,
      dh489: 350,
      dh490: 1213,
      dh491: 1517,
      dh492: 702,
      dh493: 505,
      dh494: 1442,
      dh495: 470,
      dh496: 387,
      dh497: 1171,
      dh498: 225,
      dh499: 1201,
      dh500: 709,
      dh501: 301,
      dh502: 908,
      dh503: 1543,
      dh504: 388,
      dh505: 380,
      dh506: 928,
      dh507: 743,
      dh508: 644,
      dh509: 1466,
      dh510: 239,
      dh511: 228,
      dh512: 591,
      dh513: 1306,
      dh514: 1459,
      dh515: 1397,
      dh516: 1543,
      dh517: 1365,
      dh518: 1480,
      dh519: 835
    };
    var v1003 = v2;
    var v1004 = require_forge();
    v1004.pki = v1004.pki || {};
    var v1005 = v1001.exports = v1004.pki.oids = v1004.oids = v1004.oids || {};
    function v1006(v1007, v1008) {
      v1005[v1007] = v1008;
      v1005[v1008] = v1007;
    }
    function v1009(v1010, v1011) {
      v1005[v1010] = v1011;
    }
    v1006("1.2.840.113549.1.1.1", "rsaEncryption");
    v1006("1.2.840.113549.1.1.4", "md5WithRSAEncryption");
    v1006("1.2.840.113549.1.1.5", "sha1WithRSAEncryption");
    v1006("1.2.840.113549.1.1.7", "RSAES-OAEP");
    v1006("1.2.840.113549.1.1.8", "mgf1");
    v1006("1.2.840.113549.1.1.9", "pSpecified");
    v1006("1.2.840.113549.1.1.10", "RSASSA-PSS");
    v1006("1.2.840.113549.1.1.11", "sha256WithRSAEncryption");
    v1006("1.2.840.113549.1.1.12", "sha384WithRSAEncryption");
    v1006("1.2.840.113549.1.1.13", "sha512WithRSAEncryption");
    v1006("1.3.101.112", "EdDSA25519");
    v1006("1.2.840.10040.4.3", "dsa-with-sha1");
    v1006("1.3.14.3.2.7", "desCBC");
    v1006("1.3.14.3.2.26", "sha1");
    v1006("1.3.14.3.2.29", "sha1WithRSASignature");
    v1006("2.16.840.1.101.3.4.2.1", "sha256");
    v1006("2.16.840.1.101.3.4.2.2", "sha384");
    v1006("2.16.840.1.101.3.4.2.3", "sha512");
    v1006("2.16.840.1.101.3.4.2.4", "sha224");
    v1006("2.16.840.1.101.3.4.2.5", "sha512-224");
    v1006("2.16.840.1.101.3.4.2.6", "sha512-256");
    v1006("1.2.840.113549.2.2", "md2");
    v1006("1.2.840.113549.2.5", "md5");
    v1006("1.2.840.113549.1.7.1", "data");
    v1006("1.2.840.113549.1.7.2", "signedData");
    v1006("1.2.840.113549.1.7.3", "envelopedData");
    v1006("1.2.840.113549.1.7.4", "signedAndEnvelopedData");
    v1006("1.2.840.113549.1.7.5", "digestedData");
    v1006("1.2.840.113549.1.7.6", "encryptedData");
    v1006("1.2.840.113549.1.9.1", "emailAddress");
    v1006("1.2.840.113549.1.9.2", "unstructuredName");
    v1006("1.2.840.113549.1.9.3", "contentType");
    v1006("1.2.840.113549.1.9.4", "messageDigest");
    v1006("1.2.840.113549.1.9.5", "signingTime");
    v1006("1.2.840.113549.1.9.6", "counterSignature");
    v1006("1.2.840.113549.1.9.7", "challengePassword");
    v1006("1.2.840.113549.1.9.8", "unstructuredAddress");
    v1006("1.2.840.113549.1.9.14", "extensionRequest");
    v1006("1.2.840.113549.1.9.20", "friendlyName");
    v1006("1.2.840.113549.1.9.21", "localKeyId");
    v1006("1.2.840.113549.1.9.22.1", "x509Certificate");
    v1006("1.2.840.113549.1.12.10.1.1", "keyBag");
    v1006("1.2.840.113549.1.12.10.1.2", "pkcs8ShroudedKeyBag");
    v1006("1.2.840.113549.1.12.10.1.3", "certBag");
    v1006("1.2.840.113549.1.12.10.1.4", "crlBag");
    v1006("1.2.840.113549.1.12.10.1.5", "secretBag");
    v1006("1.2.840.113549.1.12.10.1.6", "safeContentsBag");
    v1006("1.2.840.113549.1.5.13", "pkcs5PBES2");
    v1006("1.2.840.113549.1.5.12", "pkcs5PBKDF2");
    v1006("1.2.840.113549.1.12.1.1", "pbeWithSHAAnd128BitRC4");
    v1006("1.2.840.113549.1.12.1.2", "pbeWithSHAAnd40BitRC4");
    v1006("1.2.840.113549.1.12.1.3", "pbeWithSHAAnd3-KeyTripleDES-CBC");
    v1006("1.2.840.113549.1.12.1.4", "pbeWithSHAAnd2-KeyTripleDES-CBC");
    v1006("1.2.840.113549.1.12.1.5", "pbeWithSHAAnd128BitRC2-CBC");
    v1006("1.2.840.113549.1.12.1.6", "pbewithSHAAnd40BitRC2-CBC");
    v1006("1.2.840.113549.2.7", "hmacWithSHA1");
    v1006("1.2.840.113549.2.8", "hmacWithSHA224");
    v1006("1.2.840.113549.2.9", "hmacWithSHA256");
    v1006("1.2.840.113549.2.10", "hmacWithSHA384");
    v1006("1.2.840.113549.2.11", "hmacWithSHA512");
    v1006("1.2.840.113549.3.7", "des-EDE3-CBC");
    v1006("2.16.840.1.101.3.4.1.2", "aes128-CBC");
    v1006("2.16.840.1.101.3.4.1.22", "aes192-CBC");
    v1006("2.16.840.1.101.3.4.1.42", "aes256-CBC");
    v1006("2.5.4.3", "commonName");
    v1006("2.5.4.4", "surname");
    v1006("2.5.4.5", "serialNumber");
    v1006("2.5.4.6", "countryName");
    v1006("2.5.4.7", "localityName");
    v1006("2.5.4.8", "stateOrProvinceName");
    v1006("2.5.4.9", "streetAddress");
    v1006("2.5.4.10", "organizationName");
    v1006("2.5.4.11", "organizationalUnitName");
    v1006("2.5.4.12", "title");
    v1006("2.5.4.13", "description");
    v1006("2.5.4.15", "businessCategory");
    v1006("2.5.4.17", "postalCode");
    v1006("2.5.4.42", "givenName");
    v1006("2.5.4.65", "pseudonym");
    v1006("1.3.6.1.4.1.311.60.2.1.2", "jurisdictionOfIncorporationStateOrProvinceName");
    v1006("1.3.6.1.4.1.311.60.2.1.3", "jurisdictionOfIncorporationCountryName");
    v1006("2.16.840.1.113730.1.1", "nsCertType");
    v1006("2.16.840.1.113730.1.13", "nsComment");
    v1009("2.5.29.1", "authorityKeyIdentifier");
    v1009("2.5.29.2", "keyAttributes");
    v1009("2.5.29.3", "certificatePolicies");
    v1009("2.5.29.4", "keyUsageRestriction");
    v1009("2.5.29.5", "policyMapping");
    v1009("2.5.29.6", "subtreesConstraint");
    v1009("2.5.29.7", "subjectAltName");
    v1009("2.5.29.8", "issuerAltName");
    v1009("2.5.29.9", "subjectDirectoryAttributes");
    v1009("2.5.29.10", "basicConstraints");
    v1009("2.5.29.11", "nameConstraints");
    v1009("2.5.29.12", "policyConstraints");
    v1009("2.5.29.13", "basicConstraints");
    v1006("2.5.29.14", "subjectKeyIdentifier");
    v1006("2.5.29.15", "keyUsage");
    v1009("2.5.29.16", "privateKeyUsagePeriod");
    v1006("2.5.29.17", "subjectAltName");
    v1006("2.5.29.18", "issuerAltName");
    v1006("2.5.29.19", "basicConstraints");
    v1009("2.5.29.20", "cRLNumber");
    v1009("2.5.29.21", "cRLReason");
    v1009("2.5.29.22", "expirationDate");
    v1009("2.5.29.23", "instructionCode");
    v1009("2.5.29.24", "invalidityDate");
    v1009("2.5.29.25", "cRLDistributionPoints");
    v1009("2.5.29.26", "issuingDistributionPoint");
    v1009("2.5.29.27", "deltaCRLIndicator");
    v1009("2.5.29.28", "issuingDistributionPoint");
    v1009("2.5.29.29", "certificateIssuer");
    v1009("2.5.29.30", "nameConstraints");
    v1006("2.5.29.31", "cRLDistributionPoints");
    v1006("2.5.29.32", "certificatePolicies");
    v1009("2.5.29.33", "policyMappings");
    v1009("2.5.29.34", "policyConstraints");
    v1006("2.5.29.35", "authorityKeyIdentifier");
    v1009("2.5.29.36", "policyConstraints");
    v1006("2.5.29.37", "extKeyUsage");
    v1009("2.5.29.46", "freshestCRL");
    v1009("2.5.29.54", "inhibitAnyPolicy");
    v1006("1.3.6.1.4.1.11129.2.4.2", "timestampList");
    v1006("1.3.6.1.5.5.7.1.1", "authorityInfoAccess");
    v1006("1.3.6.1.5.5.7.3.1", "serverAuth");
    v1006("1.3.6.1.5.5.7.3.2", "clientAuth");
    v1006("1.3.6.1.5.5.7.3.3", "codeSigning");
    v1006("1.3.6.1.5.5.7.3.4", "emailProtection");
    v1006("1.3.6.1.5.5.7.3.8", "timeStamping");
  }
});
var require_asn1 = __commonJS({
  "node_modules/node-forge/lib/asn1.js"(v1012, v1013) {
    var v1014 = {
      dh520: 400,
      dh521: 1013,
      dh522: 613,
      dh523: 564
    };
    var v1015 = {
      dh524: 1282,
      dh525: 419,
      dh526: 1045,
      dh527: 441,
      dh528: 1027,
      dh529: 890,
      dh530: 799,
      dh531: 236,
      dh532: 740,
      dh533: 318,
      dh534: 1435,
      dh535: 1382,
      dh536: 398,
      dh537: 1231,
      dh538: 857,
      dh539: 880,
      dh540: 880,
      dh541: 1358,
      dh542: 682,
      dh543: 597,
      dh544: 619,
      dh545: 1209,
      dh546: 478,
      dh547: 1452,
      dh548: 323,
      dh549: 597,
      dh550: 916,
      dh551: 950,
      dh552: 323,
      dh553: 1231
    };
    var v1016 = {
      dh554: 1282,
      dh555: 597,
      dh556: 823,
      dh557: 1231,
      dh558: 531,
      dh559: 795,
      dh560: 597,
      dh561: 956,
      dh562: 920,
      dh563: 478,
      dh564: 531,
      dh565: 956,
      dh566: 823,
      dh567: 956,
      dh568: 451
    };
    var v1017 = {
      dh569: 857
    };
    var v1018 = {
      dh570: 643
    };
    var v1019 = {
      dh571: 562,
      dh572: 1031,
      dh573: 1458,
      dh574: 857
    };
    var v1020 = {
      dh575: 277,
      dh576: 531,
      dh577: 531,
      dh578: 1031
    };
    var v1021 = {
      dh579: 865,
      dh580: 1446,
      dh581: 1540
    };
    var v1022 = {
      dh582: 865,
      dh583: 1486
    };
    var v1023 = {
      dh584: 1508,
      dh585: 662,
      dh586: 857,
      dh587: 1276
    };
    var v1024 = {
      dh588: 1282,
      dh589: 597,
      dh590: 920,
      dh591: 1013,
      dh592: 203,
      dh593: 250,
      dh594: 1231,
      dh595: 689,
      dh596: 1231,
      dh597: 1027,
      dh598: 278,
      dh599: 1486,
      dh600: 857,
      dh601: 654
    };
    var v1025 = {
      dh602: 857,
      dh603: 857,
      dh604: 1027,
      dh605: 1027,
      dh606: 857,
      dh607: 1045,
      dh608: 1025
    };
    var v1026 = {
      dh609: 1296,
      dh610: 958,
      dh611: 1522
    };
    var v1027 = {
      dh612: 1276,
      dh613: 1389
    };
    var v1028 = {
      dh614: 1276
    };
    var v1029 = {
      dh615: 823,
      dh616: 1013
    };
    var v1030 = {
      dh617: 619,
      dh618: 289,
      dh619: 1450,
      dh620: 920,
      dh621: 920
    };
    var v1031 = {
      dh622: 289,
      dh623: 920,
      dh624: 203
    };
    var v1032 = v2;
    var v1033 = require_forge();
    require_util();
    require_oids();
    var v1034 = v1013.exports = v1033.asn1 = v1033.asn1 || {};
    v1034.Class = {
      UNIVERSAL: 0,
      APPLICATION: 64,
      CONTEXT_SPECIFIC: 128,
      PRIVATE: 192
    };
    v1034.Type = {
      NONE: 0,
      BOOLEAN: 1,
      INTEGER: 2,
      BITSTRING: 3,
      OCTETSTRING: 4,
      NULL: 5,
      OID: 6,
      ODESC: 7,
      EXTERNAL: 8,
      REAL: 9,
      ENUMERATED: 10,
      EMBEDDED: 11,
      UTF8: 12,
      ROID: 13,
      SEQUENCE: 16,
      SET: 17,
      PRINTABLESTRING: 19,
      IA5STRING: 22,
      UTCTIME: 23,
      GENERALIZEDTIME: 24,
      BMPSTRING: 30
    };
    v1034.maxDepth = 256;
    v1034.create = function (v1035, v1036, v1037, v1038, v1039) {
      var v1040 = v1032;
      if (v1033.util.isArray(v1038)) {
        var v1041 = [];
        for (var v1042 = 0; v1042 < v1038.length; ++v1042) {
          if (v1038[v1042] !== undefined) {
            v1041.push(v1038[v1042]);
          }
        }
        v1038 = v1041;
      }
      var v1043 = {
        tagClass: v1035,
        type: v1036,
        constructed: v1037,
        composed: v1037 || v1033.util.isArray(v1038),
        value: v1038
      };
      if (v1039 && "bitStringContents" in v1039) {
        v1043.bitStringContents = v1039.bitStringContents;
        v1043.original = v1034.copy(v1043);
      }
      return v1043;
    };
    v1034.copy = function (v1044, v1045) {
      var v1046 = v1032;
      var v1047;
      if (v1033.util.isArray(v1044)) {
        v1047 = [];
        for (var v1048 = 0; v1048 < v1044.length; ++v1048) {
          v1047.push(v1034.copy(v1044[v1048], v1045));
        }
        return v1047;
      }
      if (typeof v1044 === "string") {
        return v1044;
      }
      v1047 = {
        tagClass: v1044.tagClass,
        type: v1044.type,
        constructed: v1044.constructed,
        composed: v1044.composed,
        value: v1034.copy(v1044.value, v1045)
      };
      if (v1045 && !v1045.excludeBitStringContents) {
        v1047.bitStringContents = v1044.bitStringContents;
      }
      return v1047;
    };
    v1034.equals = function (v1049, v1050, v1051) {
      var v1052 = v1032;
      if (v1033.util.isArray(v1049)) {
        if (!v1033.util.isArray(v1050)) {
          return false;
        }
        if (v1049.length !== v1050.length) {
          return false;
        }
        for (var v1053 = 0; v1053 < v1049.length; ++v1053) {
          if (!v1034.equals(v1049[v1053], v1050[v1053])) {
            return false;
          }
        }
        return true;
      }
      if (typeof v1049 !== typeof v1050) {
        return false;
      }
      if (typeof v1049 === "string") {
        return v1049 === v1050;
      }
      var v1054 = v1049.tagClass === v1050.tagClass && v1049.type === v1050.type && v1049.constructed === v1050.constructed && v1049.composed === v1050.composed && v1034.equals(v1049.value, v1050.value);
      if (v1051 && v1051.includeBitStringContents) {
        v1054 = v1054 && v1049.bitStringContents === v1050.bitStringContents;
      }
      return v1054;
    };
    v1034.getBerValueLength = function (v1055) {
      var v1056 = v1032;
      var v1057 = v1055.getByte();
      if (v1057 === 128) {
        return undefined;
      }
      var v1058;
      var v1059 = v1057 & 128;
      if (!v1059) {
        v1058 = v1057;
      } else {
        v1058 = v1055.getInt((v1057 & 127) << 3);
      }
      return v1058;
    };
    function v1060(v1061, v1062, v1063) {
      var v1064 = v1032;
      if (v1063 > v1062) {
        var v1065 = new Error("Too few bytes to parse DER.");
        v1065.available = v1061.length();
        v1065.remaining = v1062;
        v1065.requested = v1063;
        throw v1065;
      }
    }
    function v1066(v1067, v1068) {
      var v1069 = v1032;
      var v1070 = v1067.getByte();
      v1068--;
      if (v1070 === 128) {
        return undefined;
      }
      var v1071;
      var v1072 = v1070 & 128;
      if (!v1072) {
        v1071 = v1070;
      } else {
        var v1073 = v1070 & 127;
        v1060(v1067, v1068, v1073);
        v1071 = v1067.getInt(v1073 << 3);
      }
      if (v1071 < 0) {
        throw new Error("Negative length: " + v1071);
      }
      return v1071;
    }
    v1034.fromDer = function (v1074, v1075) {
      var v1076 = v1032;
      if (v1075 === undefined) {
        v1075 = {
          strict: true,
          parseAllBytes: true,
          decodeBitStrings: true
        };
      }
      if (typeof v1075 === "boolean") {
        v1075 = {
          strict: v1075,
          parseAllBytes: true,
          decodeBitStrings: true
        };
      }
      if (!("strict" in v1075)) {
        v1075.strict = true;
      }
      if (!("parseAllBytes" in v1075)) {
        v1075.parseAllBytes = true;
      }
      if (!("decodeBitStrings" in v1075)) {
        v1075.decodeBitStrings = true;
      }
      if (!("maxDepth" in v1075)) {
        v1075.maxDepth = v1034.maxDepth;
      }
      if (typeof v1074 === "string") {
        v1074 = v1033.util.createBuffer(v1074);
      }
      var v1077 = v1074.length();
      var v1078 = v1079(v1074, v1074.length(), 0, v1075);
      if (v1075.parseAllBytes && v1074.length() !== 0) {
        var v1080 = new Error("Unparsed DER bytes remain after ASN.1 parsing.");
        v1080.byteCount = v1077;
        v1080.remaining = v1074.length();
        throw v1080;
      }
      return v1078;
    };
    function v1079(v1081, v1082, v1083, v1084) {
      var v1085 = v1032;
      if (v1083 >= v1084.maxDepth) {
        throw new Error("ASN.1 parsing error: Max depth exceeded.");
      }
      var v1086;
      v1060(v1081, v1082, 2);
      var v1087 = v1081.getByte();
      v1082--;
      var v1088 = v1087 & 192;
      var v1089 = v1087 & 31;
      v1086 = v1081.length();
      var v1090 = v1066(v1081, v1082);
      v1082 -= v1086 - v1081.length();
      if (v1090 !== undefined && v1090 > v1082) {
        if (v1084.strict) {
          var v1091 = new Error("Too few bytes to read ASN.1 value.");
          v1091.available = v1081.length();
          v1091.remaining = v1082;
          v1091.requested = v1090;
          throw v1091;
        }
        v1090 = v1082;
      }
      var v1092;
      var v1093;
      var v1094 = (v1087 & 32) === 32;
      if (v1094) {
        v1092 = [];
        if (v1090 === undefined) {
          while (true) {
            v1060(v1081, v1082, 2);
            if (v1081.bytes(2) === String.fromCharCode(0, 0)) {
              v1081.getBytes(2);
              v1082 -= 2;
              break;
            }
            v1086 = v1081.length();
            v1092.push(v1079(v1081, v1082, v1083 + 1, v1084));
            v1082 -= v1086 - v1081.length();
          }
        } else {
          while (v1090 > 0) {
            v1086 = v1081.length();
            v1092.push(v1079(v1081, v1090, v1083 + 1, v1084));
            v1082 -= v1086 - v1081.length();
            v1090 -= v1086 - v1081.length();
          }
        }
      }
      if (v1092 === undefined && v1088 === v1034.Class.UNIVERSAL && v1089 === v1034.Type.BITSTRING) {
        v1093 = v1081.bytes(v1090);
      }
      if (v1092 === undefined && v1084.decodeBitStrings && v1088 === v1034.Class.UNIVERSAL && v1089 === v1034.Type.BITSTRING && v1090 > 1) {
        var v1095 = v1081.read;
        var v1096 = v1082;
        var v1097 = 0;
        if (v1089 === v1034.Type.BITSTRING) {
          v1060(v1081, v1082, 1);
          v1097 = v1081.getByte();
          v1082--;
        }
        if (v1097 === 0) {
          try {
            v1086 = v1081.length();
            var v1098 = {
              strict: true,
              decodeBitStrings: true
            };
            var v1099 = v1079(v1081, v1082, v1083 + 1, v1098);
            var v1100 = v1086 - v1081.length();
            v1082 -= v1100;
            if (v1089 == v1034.Type.BITSTRING) {
              v1100++;
            }
            var v1101 = v1099.tagClass;
            if (v1100 === v1090 && (v1101 === v1034.Class.UNIVERSAL || v1101 === v1034.Class.CONTEXT_SPECIFIC)) {
              v1092 = [v1099];
            }
          } catch (v1102) {}
        }
        if (v1092 === undefined) {
          v1081.read = v1095;
          v1082 = v1096;
        }
      }
      if (v1092 === undefined) {
        if (v1090 === undefined) {
          if (v1084.strict) {
            throw new Error("Non-constructed ASN.1 object of indefinite length.");
          }
          v1090 = v1082;
        }
        if (v1089 === v1034.Type.BMPSTRING) {
          v1092 = "";
          for (; v1090 > 0; v1090 -= 2) {
            v1060(v1081, v1082, 2);
            v1092 += String.fromCharCode(v1081.getInt16());
            v1082 -= 2;
          }
        } else {
          v1092 = v1081.getBytes(v1090);
          v1082 -= v1090;
        }
      }
      var v1103 = v1093 === undefined ? null : {
        bitStringContents: v1093
      };
      return v1034.create(v1088, v1089, v1094, v1092, v1103);
    }
    v1034.toDer = function (v1104) {
      var v1105 = v1032;
      var v1106 = v1033.util.createBuffer();
      var v1107 = v1104.tagClass | v1104.type;
      var v1108 = v1033.util.createBuffer();
      var v1109 = false;
      if ("bitStringContents" in v1104) {
        v1109 = true;
        if (v1104.original) {
          v1109 = v1034.equals(v1104, v1104.original);
        }
      }
      if (v1109) {
        v1108.putBytes(v1104.bitStringContents);
      } else if (v1104.composed) {
        if (v1104.constructed) {
          v1107 |= 32;
        } else {
          v1108.putByte(0);
        }
        for (var v1110 = 0; v1110 < v1104.value.length; ++v1110) {
          if (v1104.value[v1110] !== undefined) {
            v1108.putBuffer(v1034.toDer(v1104.value[v1110]));
          }
        }
      } else if (v1104.type === v1034.Type.BMPSTRING) {
        for (var v1110 = 0; v1110 < v1104.value.length; ++v1110) {
          v1108.putInt16(v1104.value.charCodeAt(v1110));
        }
      } else if (v1104.type === v1034.Type.INTEGER && v1104.value.length > 1 && (v1104.value.charCodeAt(0) === 0 && (v1104.value.charCodeAt(1) & 128) === 0 || v1104.value.charCodeAt(0) === 255 && (v1104.value.charCodeAt(1) & 128) === 128)) {
        v1108.putBytes(v1104.value.substr(1));
      } else {
        v1108.putBytes(v1104.value);
      }
      v1106.putByte(v1107);
      if (v1108.length() <= 127) {
        v1106.putByte(v1108.length() & 127);
      } else {
        var v1111 = v1108.length();
        var v1112 = "";
        do {
          v1112 += String.fromCharCode(v1111 & 255);
          v1111 = v1111 >>> 8;
        } while (v1111 > 0);
        v1106.putByte(v1112.length | 128);
        for (var v1110 = v1112.length - 1; v1110 >= 0; --v1110) {
          v1106.putByte(v1112.charCodeAt(v1110));
        }
      }
      v1106.putBuffer(v1108);
      return v1106;
    };
    v1034.oidToDer = function (v1113) {
      var v1114 = v1032;
      var v1115 = v1113.split(".");
      var v1116 = v1033.util.createBuffer();
      v1116.putByte(parseInt(v1115[0], 10) * 40 + parseInt(v1115[1], 10));
      var v1117;
      var v1118;
      var v1119;
      var v1120;
      for (var v1121 = 2; v1121 < v1115.length; ++v1121) {
        v1117 = true;
        v1118 = [];
        v1119 = parseInt(v1115[v1121], 10);
        if (v1119 > 4294967295) {
          throw new Error("OID value too large; max is 32-bits.");
        }
        do {
          v1120 = v1119 & 127;
          v1119 = v1119 >>> 7;
          if (!v1117) {
            v1120 |= 128;
          }
          v1118.push(v1120);
          v1117 = false;
        } while (v1119 > 0);
        for (var v1122 = v1118.length - 1; v1122 >= 0; --v1122) {
          v1116.putByte(v1118[v1122]);
        }
      }
      return v1116;
    };
    v1034.derToOid = function (v1123) {
      var v1124 = v1032;
      var v1125;
      if (typeof v1123 === "string") {
        v1123 = v1033.util.createBuffer(v1123);
      }
      var v1126 = v1123.getByte();
      v1125 = Math.floor(v1126 / 40) + "." + v1126 % 40;
      var v1127 = 0;
      while (v1123.length() > 0) {
        if (v1127 > 70368744177663) {
          throw new Error("OID value too large; max is 53-bits.");
        }
        v1126 = v1123.getByte();
        v1127 = v1127 * 128;
        if (v1126 & 128) {
          v1127 += v1126 & 127;
        } else {
          v1125 += "." + (v1127 + v1126);
          v1127 = 0;
        }
      }
      return v1125;
    };
    v1034.utcTimeToDate = function (v1128) {
      var v1129 = v1032;
      var v1130 = new Date();
      var v1131 = parseInt(v1128.substr(0, 2), 10);
      v1131 = v1131 >= 50 ? 1900 + v1131 : 2000 + v1131;
      var v1132 = parseInt(v1128.substr(2, 2), 10) - 1;
      var v1133 = parseInt(v1128.substr(4, 2), 10);
      var v1134 = parseInt(v1128.substr(6, 2), 10);
      var v1135 = parseInt(v1128.substr(8, 2), 10);
      var v1136 = 0;
      if (v1128.length > 11) {
        var v1137 = v1128.charAt(10);
        var v1138 = 10;
        if (v1137 !== "+" && v1137 !== "-") {
          v1136 = parseInt(v1128.substr(10, 2), 10);
          v1138 += 2;
        }
      }
      v1130.setUTCFullYear(v1131, v1132, v1133);
      v1130.setUTCHours(v1134, v1135, v1136, 0);
      if (v1138) {
        v1137 = v1128.charAt(v1138);
        if (v1137 === "+" || v1137 === "-") {
          var v1139 = parseInt(v1128.substr(v1138 + 1, 2), 10);
          var v1140 = parseInt(v1128.substr(v1138 + 4, 2), 10);
          var v1141 = v1139 * 60 + v1140;
          v1141 *= 60000;
          if (v1137 === "+") {
            v1130.setTime(+v1130 - v1141);
          } else {
            v1130.setTime(+v1130 + v1141);
          }
        }
      }
      return v1130;
    };
    v1034.generalizedTimeToDate = function (v1142) {
      var v1143 = v1032;
      var v1144 = new Date();
      var v1145 = parseInt(v1142.substr(0, 4), 10);
      var v1146 = parseInt(v1142.substr(4, 2), 10) - 1;
      var v1147 = parseInt(v1142.substr(6, 2), 10);
      var v1148 = parseInt(v1142.substr(8, 2), 10);
      var v1149 = parseInt(v1142.substr(10, 2), 10);
      var v1150 = parseInt(v1142.substr(12, 2), 10);
      var v1151 = 0;
      var v1152 = 0;
      var v1153 = false;
      if (v1142.charAt(v1142.length - 1) === "Z") {
        v1153 = true;
      }
      var v1154 = v1142.length - 5;
      var v1155 = v1142.charAt(v1154);
      if (v1155 === "+" || v1155 === "-") {
        var v1156 = parseInt(v1142.substr(v1154 + 1, 2), 10);
        var v1157 = parseInt(v1142.substr(v1154 + 4, 2), 10);
        v1152 = v1156 * 60 + v1157;
        v1152 *= 60000;
        if (v1155 === "+") {
          v1152 *= -1;
        }
        v1153 = true;
      }
      if (v1142.charAt(14) === ".") {
        v1151 = parseFloat(v1142.substr(14), 10) * 1000;
      }
      if (v1153) {
        v1144.setUTCFullYear(v1145, v1146, v1147);
        v1144.setUTCHours(v1148, v1149, v1150, v1151);
        v1144.setTime(+v1144 + v1152);
      } else {
        v1144.setFullYear(v1145, v1146, v1147);
        v1144.setHours(v1148, v1149, v1150, v1151);
      }
      return v1144;
    };
    v1034.dateToUtcTime = function (v1158) {
      var v1159 = v1032;
      if (typeof v1158 === "string") {
        return v1158;
      }
      var v1160 = "";
      var v1161 = [];
      v1161.push(("" + v1158.getUTCFullYear()).substr(2));
      v1161.push("" + (v1158.getUTCMonth() + 1));
      v1161.push("" + v1158.getUTCDate());
      v1161.push("" + v1158.getUTCHours());
      v1161.push("" + v1158.getUTCMinutes());
      v1161.push("" + v1158.getUTCSeconds());
      for (var v1162 = 0; v1162 < v1161.length; ++v1162) {
        if (v1161[v1162].length < 2) {
          v1160 += "0";
        }
        v1160 += v1161[v1162];
      }
      v1160 += "Z";
      return v1160;
    };
    v1034.dateToGeneralizedTime = function (v1163) {
      var v1164 = v1032;
      if (typeof v1163 === "string") {
        return v1163;
      }
      var v1165 = "";
      var v1166 = [];
      v1166.push("" + v1163.getUTCFullYear());
      v1166.push("" + (v1163.getUTCMonth() + 1));
      v1166.push("" + v1163.getUTCDate());
      v1166.push("" + v1163.getUTCHours());
      v1166.push("" + v1163.getUTCMinutes());
      v1166.push("" + v1163.getUTCSeconds());
      for (var v1167 = 0; v1167 < v1166.length; ++v1167) {
        if (v1166[v1167].length < 2) {
          v1165 += "0";
        }
        v1165 += v1166[v1167];
      }
      v1165 += "Z";
      return v1165;
    };
    v1034.integerToDer = function (v1168) {
      var v1169 = v1032;
      var v1170 = v1033.util.createBuffer();
      if (v1168 >= -128 && v1168 < 128) {
        return v1170.putSignedInt(v1168, 8);
      }
      if (v1168 >= -32768 && v1168 < 32768) {
        return v1170.putSignedInt(v1168, 16);
      }
      if (v1168 >= -8388608 && v1168 < 8388608) {
        return v1170.putSignedInt(v1168, 24);
      }
      if (v1168 >= -2147483648 && v1168 < 2147483648) {
        return v1170.putSignedInt(v1168, 32);
      }
      var v1171 = new Error("Integer too large; max is 32-bits.");
      v1171.integer = v1168;
      throw v1171;
    };
    v1034.derToInteger = function (v1172) {
      var v1173 = v1032;
      if (typeof v1172 === "string") {
        v1172 = v1033.util.createBuffer(v1172);
      }
      var v1174 = v1172.length() * 8;
      if (v1174 > 32) {
        throw new Error("Integer too large; max is 32-bits.");
      }
      return v1172.getSignedInt(v1174);
    };
    v1034.validate = function (v1175, v1176, v1177, v1178) {
      var v1179 = v1032;
      var v1180 = false;
      if ((v1175.tagClass === v1176.tagClass || typeof v1176.tagClass === "undefined") && (v1175.type === v1176.type || typeof v1176.type === "undefined")) {
        if (v1175.constructed === v1176.constructed || typeof v1176.constructed === "undefined") {
          v1180 = true;
          if (v1176.value && v1033.util.isArray(v1176.value)) {
            var v1181 = 0;
            for (var v1182 = 0; v1180 && v1182 < v1176.value.length; ++v1182) {
              var v1183 = v1176.value[v1182];
              v1180 = !!v1183.optional;
              var v1184 = v1175.value[v1181];
              if (!v1184) {
                if (!v1183.optional) {
                  v1180 = false;
                  if (v1178) {
                    v1178.push("[" + v1176.name + "] Missing required element. Expected tag class \"" + v1183.tagClass + "\", type \"" + v1183.type + "\"");
                  }
                }
                continue;
              }
              var v1185 = typeof v1183.tagClass !== "undefined" && typeof v1183.type !== "undefined";
              if (v1185 && (v1184.tagClass !== v1183.tagClass || v1184.type !== v1183.type)) {
                if (v1183.optional) {
                  v1180 = true;
                  continue;
                } else {
                  v1180 = false;
                  if (v1178) {
                    v1178.push("[" + v1176.name + "] Tag mismatch. Expected (" + v1183.tagClass + "," + v1183.type + "), got (" + v1184.tagClass + "," + v1184.type + ")");
                  }
                  break;
                }
              }
              var v1186 = v1034.validate(v1184, v1183, v1177, v1178);
              if (v1186) {
                ++v1181;
                v1180 = true;
              } else if (v1183.optional) {
                v1180 = true;
              } else {
                v1180 = false;
                break;
              }
            }
          }
          if (v1180 && v1177) {
            if (v1176.capture) {
              v1177[v1176.capture] = v1175.value;
            }
            if (v1176.captureAsn1) {
              v1177[v1176.captureAsn1] = v1175;
            }
            if (v1176.captureBitStringContents && "bitStringContents" in v1175) {
              v1177[v1176.captureBitStringContents] = v1175.bitStringContents;
            }
            if (v1176.captureBitStringValue && "bitStringContents" in v1175) {
              var v1187;
              if (v1175.bitStringContents.length < 2) {
                v1177[v1176.captureBitStringValue] = "";
              } else {
                var v1188 = v1175.bitStringContents.charCodeAt(0);
                if (v1188 !== 0) {
                  throw new Error("captureBitStringValue only supported for zero unused bits");
                }
                v1177[v1176.captureBitStringValue] = v1175.bitStringContents.slice(1);
              }
            }
          }
        } else if (v1178) {
          v1178.push("[" + v1176.name + "] Expected constructed \"" + v1176.constructed + "\", got \"" + v1175.constructed + "\"");
        }
      } else if (v1178) {
        if (v1175.tagClass !== v1176.tagClass) {
          v1178.push("[" + v1176.name + "] Expected tag class \"" + v1176.tagClass + "\", got \"" + v1175.tagClass + "\"");
        }
        if (v1175.type !== v1176.type) {
          v1178.push("[" + v1176.name + "] Expected type \"" + v1176.type + "\", got \"" + v1175.type + "\"");
        }
      }
      return v1180;
    };
    var v1189 = /[^\\u0000-\\u00ff]/;
    v1034.prettyPrint = function (v1190, v1191, v1192) {
      var v1193 = v1032;
      var v1194 = "";
      v1191 = v1191 || 0;
      v1192 = v1192 || 2;
      if (v1191 > 0) {
        v1194 += "\n";
      }
      var v1195 = "";
      for (var v1196 = 0; v1196 < v1191 * v1192; ++v1196) {
        v1195 += " ";
      }
      v1194 += v1195 + "Tag: ";
      switch (v1190.tagClass) {
        case v1034.Class.UNIVERSAL:
          v1194 += "Universal:";
          break;
        case v1034.Class.APPLICATION:
          v1194 += "Application:";
          break;
        case v1034.Class.CONTEXT_SPECIFIC:
          v1194 += "Context-Specific:";
          break;
        case v1034.Class.PRIVATE:
          v1194 += "Private:";
          break;
      }
      if (v1190.tagClass === v1034.Class.UNIVERSAL) {
        v1194 += v1190.type;
        switch (v1190.type) {
          case v1034.Type.NONE:
            v1194 += " (None)";
            break;
          case v1034.Type.BOOLEAN:
            v1194 += " (Boolean)";
            break;
          case v1034.Type.INTEGER:
            v1194 += " (Integer)";
            break;
          case v1034.Type.BITSTRING:
            v1194 += " (Bit string)";
            break;
          case v1034.Type.OCTETSTRING:
            v1194 += " (Octet string)";
            break;
          case v1034.Type.NULL:
            v1194 += " (Null)";
            break;
          case v1034.Type.OID:
            v1194 += " (Object Identifier)";
            break;
          case v1034.Type.ODESC:
            v1194 += " (Object Descriptor)";
            break;
          case v1034.Type.EXTERNAL:
            v1194 += " (External or Instance of)";
            break;
          case v1034.Type.REAL:
            v1194 += " (Real)";
            break;
          case v1034.Type.ENUMERATED:
            v1194 += " (Enumerated)";
            break;
          case v1034.Type.EMBEDDED:
            v1194 += " (Embedded PDV)";
            break;
          case v1034.Type.UTF8:
            v1194 += " (UTF8)";
            break;
          case v1034.Type.ROID:
            v1194 += " (Relative Object Identifier)";
            break;
          case v1034.Type.SEQUENCE:
            v1194 += " (Sequence)";
            break;
          case v1034.Type.SET:
            v1194 += " (Set)";
            break;
          case v1034.Type.PRINTABLESTRING:
            v1194 += " (Printable String)";
            break;
          case v1034.Type.IA5String:
            v1194 += " (IA5String (ASCII))";
            break;
          case v1034.Type.UTCTIME:
            v1194 += " (UTC time)";
            break;
          case v1034.Type.GENERALIZEDTIME:
            v1194 += " (Generalized time)";
            break;
          case v1034.Type.BMPSTRING:
            v1194 += " (BMP String)";
            break;
        }
      } else {
        v1194 += v1190.type;
      }
      v1194 += "\n";
      v1194 += v1195 + "Constructed: " + v1190.constructed + "\n";
      if (v1190.composed) {
        var v1197 = 0;
        var v1198 = "";
        for (var v1196 = 0; v1196 < v1190.value.length; ++v1196) {
          if (v1190.value[v1196] !== undefined) {
            v1197 += 1;
            v1198 += v1034.prettyPrint(v1190.value[v1196], v1191 + 1, v1192);
            if (v1196 + 1 < v1190.value.length) {
              v1198 += ",";
            }
          }
        }
        v1194 += v1195 + "Sub values: " + v1197 + v1198;
      } else {
        v1194 += v1195 + "Value: ";
        if (v1190.type === v1034.Type.OID) {
          var v1199 = v1034.derToOid(v1190.value);
          v1194 += v1199;
          if (v1033.pki && v1033.pki.oids) {
            if (v1199 in v1033.pki.oids) {
              v1194 += " (" + v1033.pki.oids[v1199] + ") ";
            }
          }
        }
        if (v1190.type === v1034.Type.INTEGER) {
          try {
            v1194 += v1034.derToInteger(v1190.value);
          } catch (v1200) {
            v1194 += "0x" + v1033.util.bytesToHex(v1190.value);
          }
        } else if (v1190.type === v1034.Type.BITSTRING) {
          if (v1190.value.length > 1) {
            v1194 += "0x" + v1033.util.bytesToHex(v1190.value.slice(1));
          } else {
            v1194 += "(none)";
          }
          if (v1190.value.length > 0) {
            var v1201 = v1190.value.charCodeAt(0);
            if (v1201 == 1) {
              v1194 += " (1 unused bit shown)";
            } else if (v1201 > 1) {
              v1194 += " (" + v1201 + " unused bits shown)";
            }
          }
        } else if (v1190.type === v1034.Type.OCTETSTRING) {
          if (!v1189.test(v1190.value)) {
            v1194 += "(" + v1190.value + ") ";
          }
          v1194 += "0x" + v1033.util.bytesToHex(v1190.value);
        } else if (v1190.type === v1034.Type.UTF8) {
          try {
            v1194 += v1033.util.decodeUtf8(v1190.value);
          } catch (v1202) {
            if (v1202.message === "URI malformed") {
              v1194 += "0x" + v1033.util.bytesToHex(v1190.value) + " (malformed UTF8)";
            } else {
              throw v1202;
            }
          }
        } else if (v1190.type === v1034.Type.PRINTABLESTRING || v1190.type === v1034.Type.IA5String) {
          v1194 += v1190.value;
        } else if (v1189.test(v1190.value)) {
          v1194 += "0x" + v1033.util.bytesToHex(v1190.value);
        } else if (v1190.value.length === 0) {
          v1194 += "[null]";
        } else {
          v1194 += v1190.value;
        }
      }
      return v1194;
    };
  }
});
var require_md = __commonJS({
  "node_modules/node-forge/lib/md.js"(v1203, v1204) {
    var v1205 = {
      dh625: 443
    };
    var v1206 = v2;
    var v1207 = require_forge();
    v1204.exports = v1207.md = v1207.md || {};
    v1207.md.algorithms = v1207.md.algorithms || {};
  }
});
var require_hmac = __commonJS({
  "node_modules/node-forge/lib/hmac.js"(v1208, v1209) {
    var v1210 = {
      dh626: 219
    };
    var v1211 = {
      dh627: 931,
      dh628: 1528
    };
    var v1212 = v2;
    var v1213 = require_forge();
    require_md();
    require_util();
    var v1214 = v1209.exports = v1213.hmac = v1213.hmac || {};
    v1214.create = function () {
      var v1215 = {
        dh629: 289,
        dh630: 619,
        dh631: 355,
        dh632: 931,
        dh633: 352
      };
      var v1216 = v1212;
      var v1217 = null;
      var v1218 = null;
      var v1219 = null;
      var v1220 = null;
      var v1221 = {};
      v1221.start = function (v1222, v1223) {
        var v1224 = v1216;
        if (v1222 !== null) {
          if (typeof v1222 === "string") {
            v1222 = v1222.toLowerCase();
            if (v1222 in v1213.md.algorithms) {
              v1218 = v1213.md.algorithms[v1222].create();
            } else {
              throw new Error("Unknown hash algorithm \"" + v1222 + "\"");
            }
          } else {
            v1218 = v1222;
          }
        }
        if (v1223 === null) {
          v1223 = v1217;
        } else {
          if (typeof v1223 === "string") {
            v1223 = v1213.util.createBuffer(v1223);
          } else if (v1213.util.isArray(v1223)) {
            var v1225 = v1223;
            v1223 = v1213.util.createBuffer();
            for (var v1226 = 0; v1226 < v1225.length; ++v1226) {
              v1223.putByte(v1225[v1226]);
            }
          }
          var v1227 = v1223.length();
          if (v1227 > v1218.blockLength) {
            v1218.start();
            v1218.update(v1223.bytes());
            v1223 = v1218.digest();
          }
          v1219 = v1213.util.createBuffer();
          v1220 = v1213.util.createBuffer();
          v1227 = v1223.length();
          for (var v1226 = 0; v1226 < v1227; ++v1226) {
            var v1225 = v1223.at(v1226);
            v1219.putByte(v1225 ^ 54);
            v1220.putByte(v1225 ^ 92);
          }
          if (v1227 < v1218.blockLength) {
            var v1225 = v1218.blockLength - v1227;
            for (var v1226 = 0; v1226 < v1225; ++v1226) {
              v1219.putByte(54);
              v1220.putByte(92);
            }
          }
          v1217 = v1223;
          v1219 = v1219.bytes();
          v1220 = v1220.bytes();
        }
        v1218.start();
        v1218.update(v1219);
      };
      v1221.update = function (v1228) {
        v1218.update(v1228);
      };
      v1221.getMac = function () {
        var v1229 = v1216;
        var v1230 = v1218.digest().bytes();
        v1218.start();
        v1218.update(v1220);
        v1218.update(v1230);
        return v1218.digest();
      };
      v1221.digest = v1221.getMac;
      return v1221;
    };
  }
});
var require_md5 = __commonJS({
  "node_modules/node-forge/lib/md5.js"(v1231, v1232) {
    var v1233 = {
      dh634: 443
    };
    var v1234 = {
      dh635: 322,
      dh636: 322,
      dh637: 841
    };
    var v1235 = {
      dh638: 372
    };
    var v1236 = v2;
    var v1237 = require_forge();
    require_md();
    require_util();
    var v1238 = v1232.exports = v1237.md5 = v1237.md5 || {};
    v1237.md.md5 = v1237.md.algorithms.md5 = v1238;
    v1238.create = function () {
      var v1239 = {
        dh639: 619,
        dh640: 355,
        dh641: 857,
        dh642: 1220
      };
      var v1240 = v1236;
      if (!v1241) {
        v1242();
      }
      var v1243 = null;
      var v1244 = v1237.util.createBuffer();
      var v1245 = new Array(16);
      var v1246 = {
        algorithm: "md5",
        blockLength: 64,
        digestLength: 16,
        messageLength: 0,
        fullMessageLength: null,
        messageLengthSize: 8
      };
      v1246.start = function () {
        var v1247 = v1;
        v1246.messageLength = 0;
        v1246.fullMessageLength = v1246.messageLength64 = [];
        var v1248 = v1246.messageLengthSize / 4;
        for (var v1249 = 0; v1249 < v1248; ++v1249) {
          v1246.fullMessageLength.push(0);
        }
        v1244 = v1237.util.createBuffer();
        v1243 = {
          h0: 1732584193,
          h1: 4023233417,
          h2: 2562383102,
          h3: 271733878
        };
        return v1246;
      };
      v1246.start();
      v1246.update = function (v1250, v1251) {
        var v1252 = v1240;
        if (v1251 === "utf8") {
          v1250 = v1237.util.encodeUtf8(v1250);
        }
        var v1253 = v1250.length;
        v1246.messageLength += v1253;
        v1253 = [v1253 / 4294967296 >>> 0, v1253 >>> 0];
        for (var v1254 = v1246.fullMessageLength.length - 1; v1254 >= 0; --v1254) {
          v1246.fullMessageLength[v1254] += v1253[1];
          v1253[1] = v1253[0] + (v1246.fullMessageLength[v1254] / 4294967296 >>> 0);
          v1246.fullMessageLength[v1254] = v1246.fullMessageLength[v1254] >>> 0;
          v1253[0] = v1253[1] / 4294967296 >>> 0;
        }
        v1244.putBytes(v1250);
        v1255(v1243, v1245, v1244);
        if (v1244.read > 2048 || v1244.length() === 0) {
          v1244.compact();
        }
        return v1246;
      };
      v1246.digest = function () {
        var v1256 = v1240;
        var v1257 = v1237.util.createBuffer();
        v1257.putBytes(v1244.bytes());
        var v1258 = v1246.fullMessageLength[v1246.fullMessageLength.length - 1] + v1246.messageLengthSize;
        var v1259 = v1258 & v1246.blockLength - 1;
        v1257.putBytes(v1260.substr(0, v1246.blockLength - v1259));
        var v1261;
        var v1262 = 0;
        for (var v1263 = v1246.fullMessageLength.length - 1; v1263 >= 0; --v1263) {
          v1261 = v1246.fullMessageLength[v1263] * 8 + v1262;
          v1262 = v1261 / 4294967296 >>> 0;
          v1257.putInt32Le(v1261 >>> 0);
        }
        var v1264 = {
          h0: v1243.h0,
          h1: v1243.h1,
          h2: v1243.h2,
          h3: v1243.h3
        };
        v1255(v1264, v1245, v1257);
        var v1265 = v1237.util.createBuffer();
        v1265.putInt32Le(v1264.h0);
        v1265.putInt32Le(v1264.h1);
        v1265.putInt32Le(v1264.h2);
        v1265.putInt32Le(v1264.h3);
        return v1265;
      };
      return v1246;
    };
    var v1260 = null;
    var v1266 = null;
    var v1267 = null;
    var v1268 = null;
    var v1241 = false;
    function v1242() {
      var v1269 = v1236;
      v1260 = String.fromCharCode(128);
      v1260 += v1237.util.fillString(String.fromCharCode(0), 64);
      v1266 = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 1, 6, 11, 0, 5, 10, 15, 4, 9, 14, 3, 8, 13, 2, 7, 12, 5, 8, 11, 14, 1, 4, 7, 10, 13, 0, 3, 6, 9, 12, 15, 2, 0, 7, 14, 5, 12, 3, 10, 1, 8, 15, 6, 13, 4, 11, 2, 9];
      v1267 = [7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21];
      v1268 = new Array(64);
      for (var v1270 = 0; v1270 < 64; ++v1270) {
        v1268[v1270] = Math.floor(Math.abs(Math.sin(v1270 + 1)) * 4294967296);
      }
      v1241 = true;
    }
    function v1255(v1271, v1272, v1273) {
      var v1274 = v1236;
      var v1275;
      var v1276;
      var v1277;
      var v1278;
      var v1279;
      var v1280;
      var v1281;
      var v1282;
      var v1283 = v1273.length();
      while (v1283 >= 64) {
        v1276 = v1271.h0;
        v1277 = v1271.h1;
        v1278 = v1271.h2;
        v1279 = v1271.h3;
        for (v1282 = 0; v1282 < 16; ++v1282) {
          v1272[v1282] = v1273.getInt32Le();
          v1280 = v1279 ^ v1277 & (v1278 ^ v1279);
          v1275 = v1276 + v1280 + v1268[v1282] + v1272[v1282];
          v1281 = v1267[v1282];
          v1276 = v1279;
          v1279 = v1278;
          v1278 = v1277;
          v1277 += v1275 << v1281 | v1275 >>> 32 - v1281;
        }
        for (; v1282 < 32; ++v1282) {
          v1280 = v1278 ^ v1279 & (v1277 ^ v1278);
          v1275 = v1276 + v1280 + v1268[v1282] + v1272[v1266[v1282]];
          v1281 = v1267[v1282];
          v1276 = v1279;
          v1279 = v1278;
          v1278 = v1277;
          v1277 += v1275 << v1281 | v1275 >>> 32 - v1281;
        }
        for (; v1282 < 48; ++v1282) {
          v1280 = v1277 ^ v1278 ^ v1279;
          v1275 = v1276 + v1280 + v1268[v1282] + v1272[v1266[v1282]];
          v1281 = v1267[v1282];
          v1276 = v1279;
          v1279 = v1278;
          v1278 = v1277;
          v1277 += v1275 << v1281 | v1275 >>> 32 - v1281;
        }
        for (; v1282 < 64; ++v1282) {
          v1280 = v1278 ^ (v1277 | ~v1279);
          v1275 = v1276 + v1280 + v1268[v1282] + v1272[v1266[v1282]];
          v1281 = v1267[v1282];
          v1276 = v1279;
          v1279 = v1278;
          v1278 = v1277;
          v1277 += v1275 << v1281 | v1275 >>> 32 - v1281;
        }
        v1271.h0 = v1271.h0 + v1276 | 0;
        v1271.h1 = v1271.h1 + v1277 | 0;
        v1271.h2 = v1271.h2 + v1278 | 0;
        v1271.h3 = v1271.h3 + v1279 | 0;
        v1283 -= 64;
      }
    }
  }
});
var require_pem = __commonJS({
  "node_modules/node-forge/lib/pem.js"(v1284, v1285) {
    var v1286 = {
      dh643: 1463,
      dh644: 1463,
      dh645: 361,
      dh646: 1302,
      dh647: 1486
    };
    var v1287 = {
      dh648: 1207,
      dh649: 1174,
      dh650: 531,
      dh651: 857,
      dh652: 857,
      dh653: 1463,
      dh654: 304,
      dh655: 261,
      dh656: 875,
      dh657: 603,
      dh658: 567
    };
    var v1288 = {
      dh659: 603,
      dh660: 603,
      dh661: 875,
      dh662: 875,
      dh663: 870
    };
    var v1289 = v2;
    var v1290 = require_forge();
    require_util();
    var v1291 = v1285.exports = v1290.pem = v1290.pem || {};
    v1291.encode = function (v1292, v1293) {
      var v1294 = v1289;
      v1293 = v1293 || {};
      var v1295 = "-----BEGIN " + v1292.type + "-----\r\n";
      var v1296;
      if (v1292.procType) {
        v1296 = {
          name: "Proc-Type",
          values: [String(v1292.procType.version), v1292.procType.type]
        };
        v1295 += v1297(v1296);
      }
      if (v1292.contentDomain) {
        v1296 = {
          name: "Content-Domain",
          values: [v1292.contentDomain]
        };
        v1295 += v1297(v1296);
      }
      if (v1292.dekInfo) {
        v1296 = {
          name: "DEK-Info",
          values: [v1292.dekInfo.algorithm]
        };
        if (v1292.dekInfo.parameters) {
          v1296.values.push(v1292.dekInfo.parameters);
        }
        v1295 += v1297(v1296);
      }
      if (v1292.headers) {
        for (var v1298 = 0; v1298 < v1292.headers.length; ++v1298) {
          v1295 += v1297(v1292.headers[v1298]);
        }
      }
      if (v1292.procType) {
        v1295 += "\r\n";
      }
      v1295 += v1290.util.encode64(v1292.body, v1293.maxline || 64) + "\r\n";
      v1295 += "-----END " + v1292.type + "-----\r\n";
      return v1295;
    };
    v1291.decode = function (v1299) {
      var v1300 = v1289;
      var v1301 = [];
      var v1302 = /\s*-----BEGIN ([A-Z0-9- ]+)-----\r?\n?([\x21-\x7e\s]+?(?:\r?\n\r?\n))?([:A-Za-z0-9+\/=\s]+?)-----END \1-----/g;
      var v1303 = /([\x21-\x7e]+):\s*([\x21-\x7e\s^:]+)/;
      var v1304 = /\r?\n/;
      var v1305;
      while (true) {
        v1305 = v1302.exec(v1299);
        if (!v1305) {
          break;
        }
        var v1306 = v1305[1];
        if (v1306 === "NEW CERTIFICATE REQUEST") {
          v1306 = "CERTIFICATE REQUEST";
        }
        var v1307 = {
          type: v1306,
          procType: null,
          contentDomain: null,
          dekInfo: null,
          headers: [],
          body: v1290.util.decode64(v1305[3])
        };
        v1301.push(v1307);
        if (!v1305[2]) {
          continue;
        }
        var v1308 = v1305[2].split(v1304);
        var v1309 = 0;
        while (v1305 && v1309 < v1308.length) {
          var v1310 = v1308[v1309].replace(/\s+$/, "");
          for (var v1311 = v1309 + 1; v1311 < v1308.length; ++v1311) {
            var v1312 = v1308[v1311];
            if (!/\s/.test(v1312[0])) {
              break;
            }
            v1310 += v1312;
            v1309 = v1311;
          }
          v1305 = v1310.match(v1303);
          if (v1305) {
            var v1313 = {
              name: v1305[1],
              values: []
            };
            var v1314 = v1305[2].split(",");
            for (var v1315 = 0; v1315 < v1314.length; ++v1315) {
              v1313.values.push(v1316(v1314[v1315]));
            }
            if (!v1307.procType) {
              if (v1313.name !== "Proc-Type") {
                throw new Error("Invalid PEM formatted message. The first encapsulated header must be \"Proc-Type\".");
              } else if (v1313.values.length !== 2) {
                throw new Error("Invalid PEM formatted message. The \"Proc-Type\" header must have two subfields.");
              }
              v1307.procType = {
                version: v1314[0],
                type: v1314[1]
              };
            } else if (!v1307.contentDomain && v1313.name === "Content-Domain") {
              v1307.contentDomain = v1314[0] || "";
            } else if (!v1307.dekInfo && v1313.name === "DEK-Info") {
              if (v1313.values.length === 0) {
                throw new Error("Invalid PEM formatted message. The \"DEK-Info\" header must have at least one subfield.");
              }
              v1307.dekInfo = {
                algorithm: v1314[0],
                parameters: v1314[1] || null
              };
            } else {
              v1307.headers.push(v1313);
            }
          }
          ++v1309;
        }
        if (v1307.procType === "ENCRYPTED" && !v1307.dekInfo) {
          throw new Error("Invalid PEM formatted message. The \"DEK-Info\" header must be present if \"Proc-Type\" is \"ENCRYPTED\".");
        }
      }
      if (v1301.length === 0) {
        throw new Error("Invalid PEM formatted message.");
      }
      return v1301;
    };
    function v1297(v1317) {
      var v1318 = v1289;
      var v1319 = v1317.name + ": ";
      var v1320 = [];
      function v1321(v1322, v1323) {
        return " " + v1323;
      }
      for (var v1324 = 0; v1324 < v1317.values.length; ++v1324) {
        v1320.push(v1317.values[v1324].replace(/^(\S+\r\n)/, v1321));
      }
      v1319 += v1320.join(",") + "\r\n";
      var v1325 = 0;
      var v1326 = -1;
      for (var v1324 = 0; v1324 < v1319.length; ++v1324, ++v1325) {
        if (v1325 > 65 && v1326 !== -1) {
          var v1327 = v1319[v1326];
          if (v1327 === ",") {
            ++v1326;
            v1319 = v1319.substr(0, v1326) + "\r\n " + v1319.substr(v1326);
          } else {
            v1319 = v1319.substr(0, v1326) + "\r\n" + v1327 + v1319.substr(v1326 + 1);
          }
          v1325 = v1324 - v1326 - 1;
          v1326 = -1;
          ++v1324;
        } else if (v1319[v1324] === " " || v1319[v1324] === "\t" || v1319[v1324] === ",") {
          v1326 = v1324;
        }
      }
      return v1319;
    }
    function v1316(v1328) {
      return v1328.replace(/^\s+/, "");
    }
  }
});
var require_des = __commonJS({
  "node_modules/node-forge/lib/des.js"(v1329, v1330) {
    var v1331 = {
      dh664: 778,
      dh665: 778,
      dh666: 778,
      dh667: 778,
      dh668: 913,
      dh669: 537,
      dh670: 1476,
      dh671: 1251,
      dh672: 281,
      dh673: 1251,
      dh674: 830
    };
    var v1332 = {
      dh675: 934,
      dh676: 1275,
      dh677: 307
    };
    var v1333 = {
      dh678: 857
    };
    var v1334 = {
      dh679: 1251
    };
    var v1335 = {
      dh680: 1444
    };
    var v1336 = {
      dh681: 931
    };
    var v1337 = v2;
    var v1338 = require_forge();
    require_cipher();
    require_cipherModes();
    require_util();
    v1330.exports = v1338.des = v1338.des || {};
    v1338.des.startEncrypting = function (v1339, v1340, v1341, v1342) {
      var v1343 = v1337;
      var v1344 = v1345({
        key: v1339,
        output: v1341,
        decrypt: false,
        mode: v1342 || (v1340 === null ? "ECB" : "CBC")
      });
      v1344.start(v1340);
      return v1344;
    };
    v1338.des.createEncryptionCipher = function (v1346, v1347) {
      return v1345({
        key: v1346,
        output: null,
        decrypt: false,
        mode: v1347
      });
    };
    v1338.des.startDecrypting = function (v1348, v1349, v1350, v1351) {
      var v1352 = v1337;
      var v1353 = v1345({
        key: v1348,
        output: v1350,
        decrypt: true,
        mode: v1351 || (v1349 === null ? "ECB" : "CBC")
      });
      v1353.start(v1349);
      return v1353;
    };
    v1338.des.createDecryptionCipher = function (v1354, v1355) {
      return v1345({
        key: v1354,
        output: null,
        decrypt: true,
        mode: v1355
      });
    };
    v1338.des.Algorithm = function (v1356, v1357) {
      var v1358 = {
        dh682: 1120
      };
      var v1359 = v1337;
      var v1360 = this;
      v1360.name = v1356;
      v1360.mode = new v1357({
        blockSize: 8,
        cipher: {
          encrypt: function (v1361, v1362) {
            var v1363 = v1359;
            return v1364(v1360._keys, v1361, v1362, false);
          },
          decrypt: function (v1365, v1366) {
            var v1367 = v1359;
            return v1364(v1360._keys, v1365, v1366, true);
          }
        }
      });
      v1360._init = false;
    };
    v1338.des.Algorithm.prototype.initialize = function (v1368) {
      var v1369 = v1337;
      if (this._init) {
        return;
      }
      var v1370 = v1338.util.createBuffer(v1368.key);
      if (this.name.indexOf("3DES") === 0) {
        if (v1370.length() !== 24) {
          throw new Error("Invalid Triple-DES key size: " + v1370.length() * 8);
        }
      }
      this._keys = v1371(v1370);
      this._init = true;
    };
    v1372("DES-ECB", v1338.cipher.modes.ecb);
    v1372("DES-CBC", v1338.cipher.modes.cbc);
    v1372("DES-CFB", v1338.cipher.modes.cfb);
    v1372("DES-OFB", v1338.cipher.modes.ofb);
    v1372("DES-CTR", v1338.cipher.modes.ctr);
    v1372("3DES-ECB", v1338.cipher.modes.ecb);
    v1372("3DES-CBC", v1338.cipher.modes.cbc);
    v1372("3DES-CFB", v1338.cipher.modes.cfb);
    v1372("3DES-OFB", v1338.cipher.modes.ofb);
    v1372("3DES-CTR", v1338.cipher.modes.ctr);
    function v1372(v1373, v1374) {
      var v1375 = v1337;
      function v1376() {
        return new v1338.des.Algorithm(v1373, v1374);
      }
      v1338.cipher.registerAlgorithm(v1373, v1376);
    }
    var v1377 = [16843776, 0, 65536, 16843780, 16842756, 66564, 4, 65536, 1024, 16843776, 16843780, 1024, 16778244, 16842756, 16777216, 4, 1028, 16778240, 16778240, 66560, 66560, 16842752, 16842752, 16778244, 65540, 16777220, 16777220, 65540, 0, 1028, 66564, 16777216, 65536, 16843780, 4, 16842752, 16843776, 16777216, 16777216, 1024, 16842756, 65536, 66560, 16777220, 1024, 4, 16778244, 66564, 16843780, 65540, 16842752, 16778244, 16777220, 1028, 66564, 16843776, 1028, 16778240, 16778240, 0, 65540, 66560, 0, 16842756];
    var v1378 = [-2146402272, -2147450880, 32768, 1081376, 1048576, 32, -2146435040, -2147450848, -2147483616, -2146402272, -2146402304, -2147483648, -2147450880, 1048576, 32, -2146435040, 1081344, 1048608, -2147450848, 0, -2147483648, 32768, 1081376, -2146435072, 1048608, -2147483616, 0, 1081344, 32800, -2146402304, -2146435072, 32800, 0, 1081376, -2146435040, 1048576, -2147450848, -2146435072, -2146402304, 32768, -2146435072, -2147450880, 32, -2146402272, 1081376, 32, 32768, -2147483648, 32800, -2146402304, 1048576, -2147483616, 1048608, -2147450848, -2147483616, 1048608, 1081344, 0, -2147450880, 32800, -2147483648, -2146435040, -2146402272, 1081344];
    var v1379 = [520, 134349312, 0, 134348808, 134218240, 0, 131592, 134218240, 131080, 134217736, 134217736, 131072, 134349320, 131080, 134348800, 520, 134217728, 8, 134349312, 512, 131584, 134348800, 134348808, 131592, 134218248, 131584, 131072, 134218248, 8, 134349320, 512, 134217728, 134349312, 134217728, 131080, 520, 131072, 134349312, 134218240, 0, 512, 131080, 134349320, 134218240, 134217736, 512, 0, 134348808, 134218248, 131072, 134217728, 134349320, 8, 131592, 131584, 134217736, 134348800, 134218248, 520, 134348800, 131592, 8, 134348808, 131584];
    var v1380 = [8396801, 8321, 8321, 128, 8396928, 8388737, 8388609, 8193, 0, 8396800, 8396800, 8396929, 129, 0, 8388736, 8388609, 1, 8192, 8388608, 8396801, 128, 8388608, 8193, 8320, 8388737, 1, 8320, 8388736, 8192, 8396928, 8396929, 129, 8388736, 8388609, 8396800, 8396929, 129, 0, 0, 8396800, 8320, 8388736, 8388737, 1, 8396801, 8321, 8321, 128, 8396929, 129, 1, 8192, 8388609, 8193, 8396928, 8388737, 8193, 8320, 8388608, 8396801, 128, 8388608, 8192, 8396928];
    var v1381 = [256, 34078976, 34078720, 1107296512, 524288, 256, 1073741824, 34078720, 1074266368, 524288, 33554688, 1074266368, 1107296512, 1107820544, 524544, 1073741824, 33554432, 1074266112, 1074266112, 0, 1073742080, 1107820800, 1107820800, 33554688, 1107820544, 1073742080, 0, 1107296256, 34078976, 33554432, 1107296256, 524544, 524288, 1107296512, 256, 33554432, 1073741824, 34078720, 1107296512, 1074266368, 33554688, 1073741824, 1107820544, 34078976, 1074266368, 256, 33554432, 1107820544, 1107820800, 524544, 1107296256, 1107820800, 34078720, 0, 1074266112, 1107296256, 524544, 33554688, 1073742080, 524288, 0, 1074266112, 34078976, 1073742080];
    var v1382 = [536870928, 541065216, 16384, 541081616, 541065216, 16, 541081616, 4194304, 536887296, 4210704, 4194304, 536870928, 4194320, 536887296, 536870912, 16400, 0, 4194320, 536887312, 16384, 4210688, 536887312, 16, 541065232, 541065232, 0, 4210704, 541081600, 16400, 4210688, 541081600, 536870912, 536887296, 16, 541065232, 4210688, 541081616, 4194304, 16400, 536870928, 4194304, 536887296, 536870912, 16400, 536870928, 541081616, 4210688, 541065216, 4210704, 541081600, 0, 541065232, 16, 16384, 541065216, 4210704, 16384, 4194320, 536887312, 0, 541081600, 536870912, 4194320, 536887312];
    var v1383 = [2097152, 69206018, 67110914, 0, 2048, 67110914, 2099202, 69208064, 69208066, 2097152, 0, 67108866, 2, 67108864, 69206018, 2050, 67110912, 2099202, 2097154, 67110912, 67108866, 69206016, 69208064, 2097154, 69206016, 2048, 2050, 69208066, 2099200, 2, 67108864, 2099200, 67108864, 2099200, 2097152, 67110914, 67110914, 69206018, 69206018, 2, 2097154, 67108864, 67110912, 2097152, 69208064, 2050, 2099202, 69208064, 2050, 67108866, 69208066, 69206016, 2099200, 0, 2, 69208066, 0, 2099202, 69206016, 2048, 67108866, 67110912, 2048, 2097154];
    var v1384 = [268439616, 4096, 262144, 268701760, 268435456, 268439616, 64, 268435456, 262208, 268697600, 268701760, 266240, 268701696, 266304, 4096, 64, 268697600, 268435520, 268439552, 4160, 266240, 262208, 268697664, 268701696, 4160, 0, 0, 268697664, 268435520, 268439552, 266304, 262144, 266304, 262144, 268701696, 4096, 64, 268697664, 4096, 266304, 268439552, 64, 268435520, 268697600, 268697664, 268435456, 262144, 268439616, 0, 268701760, 262208, 268435520, 268697600, 268439552, 268439616, 0, 268701760, 266240, 266240, 4160, 4160, 262208, 268435456, 268701696];
    function v1371(v1385) {
      var v1386 = v1337;
      var v1387 = [0, 4, 536870912, 536870916, 65536, 65540, 536936448, 536936452, 512, 516, 536871424, 536871428, 66048, 66052, 536936960, 536936964];
      var v1388 = [0, 1, 1048576, 1048577, 67108864, 67108865, 68157440, 68157441, 256, 257, 1048832, 1048833, 67109120, 67109121, 68157696, 68157697];
      var v1389 = [0, 8, 2048, 2056, 16777216, 16777224, 16779264, 16779272, 0, 8, 2048, 2056, 16777216, 16777224, 16779264, 16779272];
      var v1390 = [0, 2097152, 134217728, 136314880, 8192, 2105344, 134225920, 136323072, 131072, 2228224, 134348800, 136445952, 139264, 2236416, 134356992, 136454144];
      var v1391 = [0, 262144, 16, 262160, 0, 262144, 16, 262160, 4096, 266240, 4112, 266256, 4096, 266240, 4112, 266256];
      var v1392 = [0, 1024, 32, 1056, 0, 1024, 32, 1056, 33554432, 33555456, 33554464, 33555488, 33554432, 33555456, 33554464, 33555488];
      var v1393 = [0, 268435456, 524288, 268959744, 2, 268435458, 524290, 268959746, 0, 268435456, 524288, 268959744, 2, 268435458, 524290, 268959746];
      var v1394 = [0, 65536, 2048, 67584, 536870912, 536936448, 536872960, 536938496, 131072, 196608, 133120, 198656, 537001984, 537067520, 537004032, 537069568];
      var v1395 = [0, 262144, 0, 262144, 2, 262146, 2, 262146, 33554432, 33816576, 33554432, 33816576, 33554434, 33816578, 33554434, 33816578];
      var v1396 = [0, 268435456, 8, 268435464, 0, 268435456, 8, 268435464, 1024, 268436480, 1032, 268436488, 1024, 268436480, 1032, 268436488];
      var v1397 = [0, 32, 0, 32, 1048576, 1048608, 1048576, 1048608, 8192, 8224, 8192, 8224, 1056768, 1056800, 1056768, 1056800];
      var v1398 = [0, 16777216, 512, 16777728, 2097152, 18874368, 2097664, 18874880, 67108864, 83886080, 67109376, 83886592, 69206016, 85983232, 69206528, 85983744];
      var v1399 = [0, 4096, 134217728, 134221824, 524288, 528384, 134742016, 134746112, 16, 4112, 134217744, 134221840, 524304, 528400, 134742032, 134746128];
      var v1400 = [0, 4, 256, 260, 0, 4, 256, 260, 1, 5, 257, 261, 1, 5, 257, 261];
      var v1401 = v1385.length() > 8 ? 3 : 1;
      var v1402 = [];
      var v1403 = [0, 0, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0];
      var v1404 = 0;
      var v1405;
      for (var v1406 = 0; v1406 < v1401; v1406++) {
        var v1407 = v1385.getInt32();
        var v1408 = v1385.getInt32();
        v1405 = (v1407 >>> 4 ^ v1408) & 252645135;
        v1408 ^= v1405;
        v1407 ^= v1405 << 4;
        v1405 = (v1408 >>> -16 ^ v1407) & 65535;
        v1407 ^= v1405;
        v1408 ^= v1405 << -16;
        v1405 = (v1407 >>> 2 ^ v1408) & 858993459;
        v1408 ^= v1405;
        v1407 ^= v1405 << 2;
        v1405 = (v1408 >>> -16 ^ v1407) & 65535;
        v1407 ^= v1405;
        v1408 ^= v1405 << -16;
        v1405 = (v1407 >>> 1 ^ v1408) & 1431655765;
        v1408 ^= v1405;
        v1407 ^= v1405 << 1;
        v1405 = (v1408 >>> 8 ^ v1407) & 16711935;
        v1407 ^= v1405;
        v1408 ^= v1405 << 8;
        v1405 = (v1407 >>> 1 ^ v1408) & 1431655765;
        v1408 ^= v1405;
        v1407 ^= v1405 << 1;
        v1405 = v1407 << 8 | v1408 >>> 20 & 240;
        v1407 = v1408 << 24 | v1408 << 8 & 16711680 | v1408 >>> 8 & 65280 | v1408 >>> 24 & 240;
        v1408 = v1405;
        for (var v1409 = 0; v1409 < v1403.length; ++v1409) {
          if (v1403[v1409]) {
            v1407 = v1407 << 2 | v1407 >>> 26;
            v1408 = v1408 << 2 | v1408 >>> 26;
          } else {
            v1407 = v1407 << 1 | v1407 >>> 27;
            v1408 = v1408 << 1 | v1408 >>> 27;
          }
          v1407 &= -15;
          v1408 &= -15;
          var v1410 = v1387[v1407 >>> 28] | v1388[v1407 >>> 24 & 15] | v1389[v1407 >>> 20 & 15] | v1390[v1407 >>> 16 & 15] | v1391[v1407 >>> 12 & 15] | v1392[v1407 >>> 8 & 15] | v1393[v1407 >>> 4 & 15];
          var v1411 = v1394[v1408 >>> 28] | v1395[v1408 >>> 24 & 15] | v1396[v1408 >>> 20 & 15] | v1397[v1408 >>> 16 & 15] | v1398[v1408 >>> 12 & 15] | v1399[v1408 >>> 8 & 15] | v1400[v1408 >>> 4 & 15];
          v1405 = (v1411 >>> 16 ^ v1410) & 65535;
          v1402[v1404++] = v1410 ^ v1405;
          v1402[v1404++] = v1411 ^ v1405 << 16;
        }
      }
      return v1402;
    }
    function v1364(v1412, v1413, v1414, v1415) {
      var v1416 = v1412.length === 32 ? 3 : 9;
      var v1417;
      if (v1416 === 3) {
        v1417 = v1415 ? [30, -2, -2] : [0, 32, 2];
      } else {
        v1417 = v1415 ? [94, 62, -2, 32, 64, 2, 30, -2, -2] : [0, 32, 2, 62, 30, -2, 64, 96, 2];
      }
      var v1418;
      var v1419 = v1413[0];
      var v1420 = v1413[1];
      v1418 = (v1419 >>> 4 ^ v1420) & 252645135;
      v1420 ^= v1418;
      v1419 ^= v1418 << 4;
      v1418 = (v1419 >>> 16 ^ v1420) & 65535;
      v1420 ^= v1418;
      v1419 ^= v1418 << 16;
      v1418 = (v1420 >>> 2 ^ v1419) & 858993459;
      v1419 ^= v1418;
      v1420 ^= v1418 << 2;
      v1418 = (v1420 >>> 8 ^ v1419) & 16711935;
      v1419 ^= v1418;
      v1420 ^= v1418 << 8;
      v1418 = (v1419 >>> 1 ^ v1420) & 1431655765;
      v1420 ^= v1418;
      v1419 ^= v1418 << 1;
      v1419 = v1419 << 1 | v1419 >>> 31;
      v1420 = v1420 << 1 | v1420 >>> 31;
      for (var v1421 = 0; v1421 < v1416; v1421 += 3) {
        var v1422 = v1417[v1421 + 1];
        var v1423 = v1417[v1421 + 2];
        for (var v1424 = v1417[v1421]; v1424 != v1422; v1424 += v1423) {
          var v1425 = v1420 ^ v1412[v1424];
          var v1426 = (v1420 >>> 4 | v1420 << 28) ^ v1412[v1424 + 1];
          v1418 = v1419;
          v1419 = v1420;
          v1420 = v1418 ^ (v1378[v1425 >>> 24 & 63] | v1380[v1425 >>> 16 & 63] | v1382[v1425 >>> 8 & 63] | v1384[v1425 & 63] | v1377[v1426 >>> 24 & 63] | v1379[v1426 >>> 16 & 63] | v1381[v1426 >>> 8 & 63] | v1383[v1426 & 63]);
        }
        v1418 = v1419;
        v1419 = v1420;
        v1420 = v1418;
      }
      v1419 = v1419 >>> 1 | v1419 << 31;
      v1420 = v1420 >>> 1 | v1420 << 31;
      v1418 = (v1419 >>> 1 ^ v1420) & 1431655765;
      v1420 ^= v1418;
      v1419 ^= v1418 << 1;
      v1418 = (v1420 >>> 8 ^ v1419) & 16711935;
      v1419 ^= v1418;
      v1420 ^= v1418 << 8;
      v1418 = (v1420 >>> 2 ^ v1419) & 858993459;
      v1419 ^= v1418;
      v1420 ^= v1418 << 2;
      v1418 = (v1419 >>> 16 ^ v1420) & 65535;
      v1420 ^= v1418;
      v1419 ^= v1418 << 16;
      v1418 = (v1419 >>> 4 ^ v1420) & 252645135;
      v1420 ^= v1418;
      v1419 ^= v1418 << 4;
      v1414[0] = v1419;
      v1414[1] = v1420;
    }
    function v1345(v1427) {
      var v1428 = {
        dh683: 900
      };
      var v1429 = v1337;
      v1427 = v1427 || {};
      var v1430 = (v1427.mode || "CBC").toUpperCase();
      var v1431 = "DES-" + v1430;
      var v1432;
      if (v1427.decrypt) {
        v1432 = v1338.cipher.createDecipher(v1431, v1427.key);
      } else {
        v1432 = v1338.cipher.createCipher(v1431, v1427.key);
      }
      var v1433 = v1432.start;
      v1432.start = function (v1434, v1435) {
        var v1436 = v1429;
        var v1437 = null;
        if (v1435 instanceof v1338.util.ByteBuffer) {
          v1437 = v1435;
          v1435 = {};
        }
        v1435 = v1435 || {};
        v1435.output = v1437;
        v1435.iv = v1434;
        v1433.call(v1432, v1435);
      };
      return v1432;
    }
  }
});
var require_crypto = __commonJS({
  "(disabled):crypto"() {}
});
var require_pbkdf2 = __commonJS({
  "node_modules/node-forge/lib/pbkdf2.js"(v1438, v1439) {
    var v1440 = {
      dh684: 1267,
      dh685: 1507,
      dh686: 891,
      dh687: 948
    };
    var v1441 = {
      dh688: 803,
      dh689: 338,
      dh690: 857,
      dh691: 1416,
      dh692: 369,
      dh693: 214,
      dh694: 948,
      dh695: 795,
      dh696: 443,
      dh697: 1195,
      dh698: 1190,
      dh699: 1077,
      dh700: 1025,
      dh701: 1025,
      dh702: 619,
      dh703: 1486
    };
    var v1442 = {
      dh704: 1025,
      dh705: 619,
      dh706: 977
    };
    var v1443 = {
      dh707: 699
    };
    var v1444 = v2;
    var v1445 = require_forge();
    require_hmac();
    require_md();
    require_util();
    var v1446 = v1445.pkcs5 = v1445.pkcs5 || {};
    var v1447;
    if (v1445.util.isNodejs && !v1445.options.usePureJavaScript) {
      v1447 = require_crypto();
    }
    v1439.exports = v1445.pbkdf2 = v1446.pbkdf2 = function (v1448, v1449, v1450, v1451, v1452, v1453) {
      var v1454 = {
        dh708: 619,
        dh709: 1025
      };
      var v1455 = v1444;
      if (typeof v1452 === "function") {
        v1453 = v1452;
        v1452 = null;
      }
      if (v1445.util.isNodejs && !v1445.options.usePureJavaScript && v1447.pbkdf2 && (v1452 === null || typeof v1452 !== "object") && (v1447.pbkdf2Sync.length > 4 || !v1452 || v1452 === "sha1")) {
        if (typeof v1452 !== "string") {
          v1452 = "sha1";
        }
        v1448 = Buffer.from(v1448, "binary");
        v1449 = Buffer.from(v1449, "binary");
        if (!v1453) {
          if (v1447.pbkdf2Sync.length === 4) {
            return v1447.pbkdf2Sync(v1448, v1449, v1450, v1451).toString("binary");
          }
          return v1447.pbkdf2Sync(v1448, v1449, v1450, v1451, v1452).toString("binary");
        }
        if (v1447.pbkdf2Sync.length === 4) {
          return v1447.pbkdf2(v1448, v1449, v1450, v1451, function (v1456, v1457) {
            var v1458 = v1455;
            if (v1456) {
              return v1453(v1456);
            }
            v1453(null, v1457.toString("binary"));
          });
        }
        return v1447.pbkdf2(v1448, v1449, v1450, v1451, v1452, function (v1459, v1460) {
          var v1461 = v1455;
          if (v1459) {
            return v1453(v1459);
          }
          v1453(null, v1460.toString("binary"));
        });
      }
      if (typeof v1452 === "undefined" || v1452 === null) {
        v1452 = "sha1";
      }
      if (typeof v1452 === "string") {
        if (!(v1452 in v1445.md.algorithms)) {
          throw new Error("Unknown hash algorithm: " + v1452);
        }
        v1452 = v1445.md[v1452].create();
      }
      var v1462 = v1452.digestLength;
      if (v1451 > v1462 * 4294967295) {
        var v1463 = new Error("Derived key is too long.");
        if (v1453) {
          return v1453(v1463);
        }
        throw v1463;
      }
      var v1464 = Math.ceil(v1451 / v1462);
      var v1465 = v1451 - (v1464 - 1) * v1462;
      var v1466 = v1445.hmac.create();
      v1466.start(v1452, v1448);
      var v1467 = "";
      var v1468;
      var v1469;
      var v1470;
      if (!v1453) {
        for (var v1471 = 1; v1471 <= v1464; ++v1471) {
          v1466.start(null, null);
          v1466.update(v1449);
          v1466.update(v1445.util.int32ToBytes(v1471));
          v1468 = v1470 = v1466.digest().getBytes();
          for (var v1472 = 2; v1472 <= v1450; ++v1472) {
            v1466.start(null, null);
            v1466.update(v1470);
            v1469 = v1466.digest().getBytes();
            v1468 = v1445.util.xorBytes(v1468, v1469, v1462);
            v1470 = v1469;
          }
          v1467 += v1471 < v1464 ? v1468 : v1468.substr(0, v1465);
        }
        return v1467;
      }
      var v1471 = 1;
      var v1472;
      function v1473() {
        var v1474 = v1455;
        if (v1471 > v1464) {
          return v1453(null, v1467);
        }
        v1466.start(null, null);
        v1466.update(v1449);
        v1466.update(v1445.util.int32ToBytes(v1471));
        v1468 = v1470 = v1466.digest().getBytes();
        v1472 = 2;
        v1475();
      }
      function v1475() {
        var v1476 = v1455;
        if (v1472 <= v1450) {
          v1466.start(null, null);
          v1466.update(v1470);
          v1469 = v1466.digest().getBytes();
          v1468 = v1445.util.xorBytes(v1468, v1469, v1462);
          v1470 = v1469;
          ++v1472;
          return v1445.util.setImmediate(v1475);
        }
        v1467 += v1471 < v1464 ? v1468 : v1468.substr(0, v1465);
        ++v1471;
        v1473();
      }
      v1473();
    };
  }
});
var require_sha256 = __commonJS({
  "node_modules/node-forge/lib/sha256.js"(v1477, v1478) {
    var v1479 = {
      dh710: 322
    };
    var v1480 = {
      dh711: 619,
      dh712: 677,
      dh713: 857,
      dh714: 1101
    };
    var v1481 = {
      dh715: 531,
      dh716: 1508
    };
    var v1482 = v2;
    var v1483 = require_forge();
    require_md();
    require_util();
    var v1484 = v1478.exports = v1483.sha256 = v1483.sha256 || {};
    v1483.md.sha256 = v1483.md.algorithms.sha256 = v1484;
    v1484.create = function () {
      var v1485 = {
        dh717: 1101,
        dh718: 764,
        dh719: 1508
      };
      var v1486 = v1482;
      if (!v1487) {
        v1488();
      }
      var v1489 = null;
      var v1490 = v1483.util.createBuffer();
      var v1491 = new Array(64);
      var v1492 = {
        algorithm: "sha256",
        blockLength: 64,
        digestLength: 32,
        messageLength: 0,
        fullMessageLength: null,
        messageLengthSize: 8
      };
      v1492.start = function () {
        var v1493 = v1486;
        v1492.messageLength = 0;
        v1492.fullMessageLength = v1492.messageLength64 = [];
        var v1494 = v1492.messageLengthSize / 4;
        for (var v1495 = 0; v1495 < v1494; ++v1495) {
          v1492.fullMessageLength.push(0);
        }
        v1490 = v1483.util.createBuffer();
        v1489 = {
          h0: 1779033703,
          h1: 3144134277,
          h2: 1013904242,
          h3: 2773480762,
          h4: 1359893119,
          h5: 2600822924,
          h6: 528734635,
          h7: 1541459225
        };
        return v1492;
      };
      v1492.start();
      v1492.update = function (v1496, v1497) {
        var v1498 = v1486;
        if (v1497 === "utf8") {
          v1496 = v1483.util.encodeUtf8(v1496);
        }
        var v1499 = v1496.length;
        v1492.messageLength += v1499;
        v1499 = [v1499 / 4294967296 >>> 0, v1499 >>> 0];
        for (var v1500 = v1492.fullMessageLength.length - 1; v1500 >= 0; --v1500) {
          v1492.fullMessageLength[v1500] += v1499[1];
          v1499[1] = v1499[0] + (v1492.fullMessageLength[v1500] / 4294967296 >>> 0);
          v1492.fullMessageLength[v1500] = v1492.fullMessageLength[v1500] >>> 0;
          v1499[0] = v1499[1] / 4294967296 >>> 0;
        }
        v1490.putBytes(v1496);
        v1501(v1489, v1491, v1490);
        if (v1490.read > 2048 || v1490.length() === 0) {
          v1490.compact();
        }
        return v1492;
      };
      v1492.digest = function () {
        var v1502 = v1486;
        var v1503 = v1483.util.createBuffer();
        v1503.putBytes(v1490.bytes());
        var v1504 = v1492.fullMessageLength[v1492.fullMessageLength.length - 1] + v1492.messageLengthSize;
        var v1505 = v1504 & v1492.blockLength - 1;
        v1503.putBytes(v1506.substr(0, v1492.blockLength - v1505));
        var v1507;
        var v1508;
        var v1509 = v1492.fullMessageLength[0] * 8;
        for (var v1510 = 0; v1510 < v1492.fullMessageLength.length - 1; ++v1510) {
          v1507 = v1492.fullMessageLength[v1510 + 1] * 8;
          v1508 = v1507 / 4294967296 >>> 0;
          v1509 += v1508;
          v1503.putInt32(v1509 >>> 0);
          v1509 = v1507 >>> 0;
        }
        v1503.putInt32(v1509);
        var v1511 = {
          h0: v1489.h0,
          h1: v1489.h1,
          h2: v1489.h2,
          h3: v1489.h3,
          h4: v1489.h4,
          h5: v1489.h5,
          h6: v1489.h6,
          h7: v1489.h7
        };
        v1501(v1511, v1491, v1503);
        var v1512 = v1483.util.createBuffer();
        v1512.putInt32(v1511.h0);
        v1512.putInt32(v1511.h1);
        v1512.putInt32(v1511.h2);
        v1512.putInt32(v1511.h3);
        v1512.putInt32(v1511.h4);
        v1512.putInt32(v1511.h5);
        v1512.putInt32(v1511.h6);
        v1512.putInt32(v1511.h7);
        return v1512;
      };
      return v1492;
    };
    var v1506 = null;
    var v1487 = false;
    var v1513 = null;
    function v1488() {
      var v1514 = v1482;
      v1506 = String.fromCharCode(128);
      v1506 += v1483.util.fillString(String.fromCharCode(0), 64);
      v1513 = [1116352408, 1899447441, 3049323471, 3921009573, 961987163, 1508970993, 2453635748, 2870763221, 3624381080, 310598401, 607225278, 1426881987, 1925078388, 2162078206, 2614888103, 3248222580, 3835390401, 4022224774, 264347078, 604807628, 770255983, 1249150122, 1555081692, 1996064986, 2554220882, 2821834349, 2952996808, 3210313671, 3336571891, 3584528711, 113926993, 338241895, 666307205, 773529912, 1294757372, 1396182291, 1695183700, 1986661051, 2177026350, 2456956037, 2730485921, 2820302411, 3259730800, 3345764771, 3516065817, 3600352804, 4094571909, 275423344, 430227734, 506948616, 659060556, 883997877, 958139571, 1322822218, 1537002063, 1747873779, 1955562222, 2024104815, 2227730452, 2361852424, 2428436474, 2756734187, 3204031479, 3329325298];
      v1487 = true;
    }
    function v1501(v1515, v1516, v1517) {
      var v1518 = v1482;
      var v1519;
      var v1520;
      var v1521;
      var v1522;
      var v1523;
      var v1524;
      var v1525;
      var v1526;
      var v1527;
      var v1528;
      var v1529;
      var v1530;
      var v1531;
      var v1532;
      var v1533;
      var v1534 = v1517.length();
      while (v1534 >= 64) {
        for (v1525 = 0; v1525 < 16; ++v1525) {
          v1516[v1525] = v1517.getInt32();
        }
        for (; v1525 < 64; ++v1525) {
          v1519 = v1516[v1525 - 2];
          v1519 = (v1519 >>> 17 | v1519 << 15) ^ (v1519 >>> 19 | v1519 << 13) ^ v1519 >>> 10;
          v1520 = v1516[v1525 - 15];
          v1520 = (v1520 >>> 7 | v1520 << 25) ^ (v1520 >>> 18 | v1520 << 14) ^ v1520 >>> 3;
          v1516[v1525] = v1519 + v1516[v1525 - 7] + v1520 + v1516[v1525 - 16] | 0;
        }
        v1526 = v1515.h0;
        v1527 = v1515.h1;
        v1528 = v1515.h2;
        v1529 = v1515.h3;
        v1530 = v1515.h4;
        v1531 = v1515.h5;
        v1532 = v1515.h6;
        v1533 = v1515.h7;
        for (v1525 = 0; v1525 < 64; ++v1525) {
          v1522 = (v1530 >>> 6 | v1530 << 26) ^ (v1530 >>> 11 | v1530 << 21) ^ (v1530 >>> 25 | v1530 << 7);
          v1523 = v1532 ^ v1530 & (v1531 ^ v1532);
          v1521 = (v1526 >>> 2 | v1526 << 30) ^ (v1526 >>> 13 | v1526 << 19) ^ (v1526 >>> 22 | v1526 << 10);
          v1524 = v1526 & v1527 | v1528 & (v1526 ^ v1527);
          v1519 = v1533 + v1522 + v1523 + v1513[v1525] + v1516[v1525];
          v1520 = v1521 + v1524;
          v1533 = v1532;
          v1532 = v1531;
          v1531 = v1530;
          v1530 = v1529 + v1519 >>> 0;
          v1529 = v1528;
          v1528 = v1527;
          v1527 = v1526;
          v1526 = v1519 + v1520 >>> 0;
        }
        v1515.h0 = v1515.h0 + v1526 | 0;
        v1515.h1 = v1515.h1 + v1527 | 0;
        v1515.h2 = v1515.h2 + v1528 | 0;
        v1515.h3 = v1515.h3 + v1529 | 0;
        v1515.h4 = v1515.h4 + v1530 | 0;
        v1515.h5 = v1515.h5 + v1531 | 0;
        v1515.h6 = v1515.h6 + v1532 | 0;
        v1515.h7 = v1515.h7 + v1533 | 0;
        v1534 -= 64;
      }
    }
  }
});
var require_prng = __commonJS({
  "node_modules/node-forge/lib/prng.js"(v1535, v1536) {
    var v1537 = {
      dh720: 1021,
      dh721: 1507,
      dh722: 1406
    };
    var v1538 = {
      dh723: 407,
      dh724: 249,
      dh725: 249
    };
    var v1539 = {
      dh726: 1486,
      dh727: 1150
    };
    var v1540 = {
      dh728: 838,
      dh729: 962
    };
    var v1541 = v2;
    var v1542 = require_forge();
    require_util();
    var v1543 = null;
    if (v1542.util.isNodejs && !v1542.options.usePureJavaScript && !process.versions["node-webkit"]) {
      v1543 = require_crypto();
    }
    var v1544 = v1536.exports = v1542.prng = v1542.prng || {};
    v1544.create = function (v1545) {
      var v1546 = {
        dh730: 1542
      };
      var v1547 = {
        dh731: 619,
        dh732: 1508,
        dh733: 857,
        dh734: 764,
        dh735: 857
      };
      var v1548 = {
        dh736: 1264,
        dh737: 389,
        dh738: 352,
        dh739: 352,
        dh740: 1077,
        dh741: 389,
        dh742: 1081
      };
      var v1549 = {
        dh743: 838,
        dh744: 1321
      };
      var v1550 = {
        dh745: 1251,
        dh746: 1508,
        dh747: 307,
        dh748: 247,
        dh749: 1081,
        dh750: 1025
      };
      var v1551 = {
        dh751: 407,
        dh752: 389
      };
      var v1552 = {
        dh753: 247,
        dh754: 619,
        dh755: 349,
        dh756: 857,
        dh757: 250,
        dh758: 307,
        dh759: 1081
      };
      var v1553 = v1541;
      var v1554 = {
        plugin: v1545,
        key: null,
        seed: null,
        time: null,
        reseeds: 0,
        generated: 0,
        keyBytes: ""
      };
      var v1555 = v1545.md;
      var v1556 = new Array(32);
      for (var v1557 = 0; v1557 < 32; ++v1557) {
        v1556[v1557] = v1555.create();
      }
      v1554.pools = v1556;
      v1554.pool = 0;
      v1554.generate = function (v1558, v1559) {
        var v1560 = v1553;
        if (!v1559) {
          return v1554.generateSync(v1558);
        }
        var v1561 = v1554.plugin.cipher;
        var v1562 = v1554.plugin.increment;
        var v1563 = v1554.plugin.formatKey;
        var v1564 = v1554.plugin.formatSeed;
        var v1565 = v1542.util.createBuffer();
        v1554.key = null;
        v1566();
        function v1566(v1567) {
          var v1568 = v1560;
          if (v1567) {
            return v1559(v1567);
          }
          if (v1565.length() >= v1558) {
            return v1559(null, v1565.getBytes(v1558));
          }
          if (v1554.generated > 1048575) {
            v1554.key = null;
          }
          if (v1554.key === null) {
            return v1542.util.nextTick(function () {
              v1569(v1566);
            });
          }
          var v1570 = v1561(v1554.key, v1554.seed);
          v1554.generated += v1570.length;
          v1565.putBytes(v1570);
          v1554.key = v1563(v1561(v1554.key, v1562(v1554.seed)));
          v1554.seed = v1564(v1561(v1554.key, v1554.seed));
          v1542.util.setImmediate(v1566);
        }
      };
      v1554.generateSync = function (v1571) {
        var v1572 = v1553;
        var v1573 = v1554.plugin.cipher;
        var v1574 = v1554.plugin.increment;
        var v1575 = v1554.plugin.formatKey;
        var v1576 = v1554.plugin.formatSeed;
        v1554.key = null;
        var v1577 = v1542.util.createBuffer();
        while (v1577.length() < v1571) {
          if (v1554.generated > 1048575) {
            v1554.key = null;
          }
          if (v1554.key === null) {
            v1578();
          }
          var v1579 = v1573(v1554.key, v1554.seed);
          v1554.generated += v1579.length;
          v1577.putBytes(v1579);
          v1554.key = v1575(v1573(v1554.key, v1574(v1554.seed)));
          v1554.seed = v1576(v1573(v1554.key, v1554.seed));
        }
        return v1577.getBytes(v1571);
      };
      function v1569(v1580) {
        var v1581 = v1553;
        if (v1554.pools[0].messageLength >= 32) {
          v1582();
          return v1580();
        }
        var v1583 = 32 - v1554.pools[0].messageLength << 5;
        v1554.seedFile(v1583, function (v1584, v1585) {
          if (v1584) {
            return v1580(v1584);
          }
          v1554.collect(v1585);
          v1582();
          v1580();
        });
      }
      function v1578() {
        var v1586 = v1553;
        if (v1554.pools[0].messageLength >= 32) {
          return v1582();
        }
        var v1587 = 32 - v1554.pools[0].messageLength << 5;
        v1554.collect(v1554.seedFileSync(v1587));
        v1582();
      }
      function v1582() {
        var v1588 = v1553;
        v1554.reseeds = v1554.reseeds === 4294967295 ? 0 : v1554.reseeds + 1;
        var v1589 = v1554.plugin.md.create();
        v1589.update(v1554.keyBytes);
        var v1590 = 1;
        for (var v1591 = 0; v1591 < 32; ++v1591) {
          if (v1554.reseeds % v1590 === 0) {
            v1589.update(v1554.pools[v1591].digest().getBytes());
            v1554.pools[v1591].start();
          }
          v1590 = v1590 << 1;
        }
        v1554.keyBytes = v1589.digest().getBytes();
        v1589.start();
        v1589.update(v1554.keyBytes);
        var v1592 = v1589.digest().getBytes();
        v1554.key = v1554.plugin.formatKey(v1554.keyBytes);
        v1554.seed = v1554.plugin.formatSeed(v1592);
        v1554.generated = 0;
      }
      function v1593(v1594) {
        var v1595 = {
          dh760: 1047
        };
        var v1596 = v1553;
        var v1597 = null;
        var v1598 = v1542.util.globalScope;
        var v1599 = v1598.crypto || v1598.msCrypto;
        if (v1599 && v1599.getRandomValues) {
          v1597 = function (v1600) {
            var v1601 = v1596;
            return v1599.getRandomValues(v1600);
          };
        }
        var v1602 = v1542.util.createBuffer();
        if (v1597) {
          while (v1602.length() < v1594) {
            var v1603 = Math.max(1, Math.min(v1594 - v1602.length(), 65536) / 4);
            var v1604 = new Uint32Array(Math.floor(v1603));
            try {
              v1597(v1604);
              for (var v1605 = 0; v1605 < v1604.length; ++v1605) {
                v1602.putInt32(v1604[v1605]);
              }
            } catch (v1606) {
              if (typeof QuotaExceededError === "undefined" || !(v1606 instanceof QuotaExceededError)) {
                throw v1606;
              }
            }
          }
        }
        if (v1602.length() < v1594) {
          var v1607;
          var v1608;
          var v1609;
          var v1610 = Math.floor(Math.random() * 65536);
          while (v1602.length() < v1594) {
            v1608 = (v1610 & 65535) * 16807;
            v1607 = (v1610 >> 16) * 16807;
            v1608 += (v1607 & 32767) << 16;
            v1608 += v1607 >> 15;
            v1608 = (v1608 & 2147483647) + (v1608 >> 31);
            v1610 = v1608 & -1;
            for (var v1605 = 0; v1605 < 3; ++v1605) {
              v1609 = v1610 >>> (v1605 << 3);
              v1609 ^= Math.floor(Math.random() * 256);
              v1602.putByte(v1609 & 255);
            }
          }
        }
        return v1602.getBytes(v1594);
      }
      if (v1543) {
        v1554.seedFile = function (v1611, v1612) {
          var v1613 = {
            dh761: 214
          };
          var v1614 = v1553;
          v1543.randomBytes(v1611, function (v1615, v1616) {
            var v1617 = v1614;
            if (v1615) {
              return v1612(v1615);
            }
            v1612(null, v1616.toString());
          });
        };
        v1554.seedFileSync = function (v1618) {
          var v1619 = v1553;
          return v1543.randomBytes(v1618).toString();
        };
      } else {
        v1554.seedFile = function (v1620, v1621) {
          try {
            v1621(null, v1593(v1620));
          } catch (v1622) {
            v1621(v1622);
          }
        };
        v1554.seedFileSync = v1593;
      }
      v1554.collect = function (v1623) {
        var v1624 = v1553;
        var v1625 = v1623.length;
        for (var v1626 = 0; v1626 < v1625; ++v1626) {
          v1554.pools[v1554.pool].update(v1623.substr(v1626, 1));
          v1554.pool = v1554.pool === 31 ? 0 : v1554.pool + 1;
        }
      };
      v1554.collectInt = function (v1627, v1628) {
        var v1629 = v1553;
        var v1630 = "";
        for (var v1631 = 0; v1631 < v1628; v1631 += 8) {
          v1630 += String.fromCharCode(v1627 >> v1631 & 255);
        }
        v1554.collect(v1630);
      };
      v1554.registerWorker = function (v1632) {
        var v1633 = {
          dh762: 1356
        };
        var v1634 = {
          dh763: 334,
          dh764: 296
        };
        var v1635 = v1553;
        if (v1632 === self) {
          v1554.seedFile = function (v1636, v1637) {
            var v1638 = v1635;
            function v1639(v1640) {
              var v1641 = v1;
              var v1642 = v1640.data;
              if (v1642.forge && v1642.forge.prng) {
                self.removeEventListener("message", v1639);
                v1637(v1642.forge.prng.err, v1642.forge.prng.bytes);
              }
            }
            self.addEventListener("message", v1639);
            self.postMessage({
              forge: {
                prng: {
                  needed: v1636
                }
              }
            });
          };
        } else {
          function v1643(v1644) {
            var v1645 = v1635;
            var v1646 = v1644.data;
            if (v1646.forge && v1646.forge.prng) {
              v1554.seedFile(v1646.forge.prng.needed, function (v1647, v1648) {
                v1632.postMessage({
                  forge: {
                    prng: {
                      err: v1647,
                      bytes: v1648
                    }
                  }
                });
              });
            }
          }
          v1632.addEventListener("message", v1643);
        }
      };
      return v1554;
    };
  }
});
var require_random = __commonJS({
  "node_modules/node-forge/lib/random.js"(v1649, v1650) {
    var v1651 = {
      dh765: 1088,
      dh766: 1025,
      dh767: 795
    };
    var v1652 = require_forge();
    require_aes();
    require_sha256();
    require_prng();
    require_util();
    (function () {
      var v1653 = {
        dh768: 1251,
        dh769: 786,
        dh770: 555,
        dh771: 619,
        dh772: 661,
        dh773: 725,
        dh774: 552
      };
      var v1654 = {
        dh775: 1144,
        dh776: 488
      };
      var v1655 = {
        dh777: 933,
        dh778: 627
      };
      var v1656 = v1;
      if (v1652.random && v1652.random.getBytes) {
        v1650.exports = v1652.random;
        return;
      }
      (function (v1657) {
        var v1658 = {
          dh779: 933
        };
        var v1659 = v1656;
        var v1660 = {};
        var v1661 = new Array(4);
        var v1662 = v1652.util.createBuffer();
        v1660.formatKey = function (v1663) {
          var v1664 = v1;
          var v1665 = v1652.util.createBuffer(v1663);
          v1663 = new Array(4);
          v1663[0] = v1665.getInt32();
          v1663[1] = v1665.getInt32();
          v1663[2] = v1665.getInt32();
          v1663[3] = v1665.getInt32();
          return v1652.aes._expandKey(v1663, false);
        };
        v1660.formatSeed = function (v1666) {
          var v1667 = v1;
          var v1668 = v1652.util.createBuffer(v1666);
          v1666 = new Array(4);
          v1666[0] = v1668.getInt32();
          v1666[1] = v1668.getInt32();
          v1666[2] = v1668.getInt32();
          v1666[3] = v1668.getInt32();
          return v1666;
        };
        v1660.cipher = function (v1669, v1670) {
          var v1671 = v1659;
          v1652.aes._updateBlock(v1669, v1670, v1661, false);
          v1662.putInt32(v1661[0]);
          v1662.putInt32(v1661[1]);
          v1662.putInt32(v1661[2]);
          v1662.putInt32(v1661[3]);
          return v1662.getBytes();
        };
        v1660.increment = function (v1672) {
          ++v1672[3];
          return v1672;
        };
        v1660.md = v1652.md.sha256;
        function v1673() {
          var v1674 = v1659;
          var v1675 = v1652.prng.create(v1660);
          v1675.getBytes = function (v1676, v1677) {
            var v1678 = v1674;
            return v1675.generate(v1676, v1677);
          };
          v1675.getBytesSync = function (v1679) {
            var v1680 = v1674;
            return v1675.generate(v1679);
          };
          return v1675;
        }
        var v1681 = v1673();
        var v1682 = null;
        var v1683 = v1652.util.globalScope;
        var v1684 = v1683.crypto || v1683.msCrypto;
        if (v1684 && v1684.getRandomValues) {
          v1682 = function (v1685) {
            return v1684.getRandomValues(v1685);
          };
        }
        if (v1652.options.usePureJavaScript || !v1652.util.isNodejs && !v1682) {
          if (typeof window === "undefined" || window.document === undefined) {}
          v1681.collectInt(+new Date(), 32);
          if (typeof navigator !== "undefined") {
            var v1686 = "";
            for (var v1687 in navigator) {
              try {
                if (typeof navigator[v1687] == "string") {
                  v1686 += navigator[v1687];
                }
              } catch (v1688) {}
            }
            v1681.collect(v1686);
            v1686 = null;
          }
          if (v1657) {
            v1657().mousemove(function (v1689) {
              var v1690 = v1659;
              v1681.collectInt(v1689.clientX, 16);
              v1681.collectInt(v1689.clientY, 16);
            });
            v1657().keypress(function (v1691) {
              var v1692 = v1659;
              v1681.collectInt(v1691.charCode, 8);
            });
          }
        }
        if (!v1652.random) {
          v1652.random = v1681;
        } else {
          for (var v1687 in v1681) {
            v1652.random[v1687] = v1681[v1687];
          }
        }
        v1652.random.createInstance = v1673;
        v1650.exports = v1652.random;
      })(typeof jQuery !== "undefined" ? jQuery : null);
    })();
  }
});
var require_rc2 = __commonJS({
  "node_modules/node-forge/lib/rc2.js"(v1693, v1694) {
    var v1695 = {
      dh780: 891,
      dh781: 1420,
      dh782: 1385,
      dh783: 1063
    };
    var v1696 = {
      dh784: 931
    };
    var v1697 = {
      dh785: 850,
      dh786: 850,
      dh787: 850
    };
    var v1698 = {
      dh788: 1206
    };
    var v1699 = v2;
    var v1700 = require_forge();
    require_util();
    var v1701 = [217, 120, 249, 196, 25, 221, 181, 237, 40, 233, 253, 121, 74, 160, 216, 157, 198, 126, 55, 131, 43, 118, 83, 142, 98, 76, 100, 136, 68, 139, 251, 162, 23, 154, 89, 245, 135, 179, 79, 19, 97, 69, 109, 141, 9, 129, 125, 50, 189, 143, 64, 235, 134, 183, 123, 11, 240, 149, 33, 34, 92, 107, 78, 130, 84, 214, 101, 147, 206, 96, 178, 28, 115, 86, 192, 20, 167, 140, 241, 220, 18, 117, 202, 31, 59, 190, 228, 209, 66, 61, 212, 48, 163, 60, 182, 38, 111, 191, 14, 218, 70, 105, 7, 87, 39, 242, 29, 155, 188, 148, 67, 3, 248, 17, 199, 246, 144, 239, 62, 231, 6, 195, 213, 47, 200, 102, 30, 215, 8, 232, 234, 222, 128, 82, 238, 247, 132, 170, 114, 172, 53, 77, 106, 42, 150, 26, 210, 113, 90, 21, 73, 116, 75, 159, 208, 94, 4, 24, 164, 236, 194, 224, 65, 110, 15, 81, 203, 204, 36, 145, 175, 80, 161, 244, 112, 57, 153, 124, 58, 133, 35, 184, 180, 122, 252, 2, 54, 91, 37, 85, 151, 49, 45, 93, 250, 152, 227, 138, 146, 174, 5, 223, 41, 16, 103, 108, 186, 201, 211, 0, 230, 207, 225, 158, 168, 44, 99, 22, 1, 63, 88, 226, 137, 169, 13, 56, 52, 27, 171, 51, 255, 176, 187, 72, 12, 95, 185, 177, 205, 46, 197, 243, 219, 71, 229, 165, 156, 119, 10, 166, 32, 104, 254, 127, 193, 173];
    var v1702 = [1, 2, 3, 5];
    function v1703(v1704, v1705) {
      return v1704 << v1705 & 65535 | (v1704 & 65535) >> 16 - v1705;
    }
    function v1706(v1707, v1708) {
      return (v1707 & 65535) >> v1708 | v1707 << 16 - v1708 & 65535;
    }
    v1694.exports = v1700.rc2 = v1700.rc2 || {};
    v1700.rc2.expandKey = function (v1709, v1710) {
      var v1711 = v1699;
      if (typeof v1709 === "string") {
        v1709 = v1700.util.createBuffer(v1709);
      }
      v1710 = v1710 || 128;
      var v1712 = v1709;
      var v1713 = v1709.length();
      var v1714 = v1710;
      var v1715 = Math.ceil(v1714 / 8);
      var v1716 = 255 >> (v1714 & 7);
      var v1717;
      for (v1717 = v1713; v1717 < 128; v1717++) {
        v1712.putByte(v1701[v1712.at(v1717 - 1) + v1712.at(v1717 - v1713) & 255]);
      }
      v1712.setAt(128 - v1715, v1701[v1712.at(128 - v1715) & v1716]);
      for (v1717 = 127 - v1715; v1717 >= 0; v1717--) {
        v1712.setAt(v1717, v1701[v1712.at(v1717 + 1) ^ v1712.at(v1717 + v1715)]);
      }
      return v1712;
    };
    function v1718(v1719, v1720, v1721) {
      var v1722 = {
        dh789: 1373,
        dh790: 857
      };
      var v1723 = {
        dh791: 619,
        dh792: 1508
      };
      var v1724 = v1699;
      var v1725 = false;
      var v1726 = null;
      var v1727 = null;
      var v1728 = null;
      var v1729;
      var v1730;
      var v1731;
      var v1732;
      var v1733 = [];
      v1719 = v1700.rc2.expandKey(v1719, v1720);
      for (v1731 = 0; v1731 < 64; v1731++) {
        v1733.push(v1719.getInt16Le());
      }
      if (v1721) {
        v1729 = function (v1734) {
          for (v1731 = 0; v1731 < 4; v1731++) {
            v1734[v1731] += v1733[v1732] + (v1734[(v1731 + 3) % 4] & v1734[(v1731 + 2) % 4]) + (~v1734[(v1731 + 3) % 4] & v1734[(v1731 + 1) % 4]);
            v1734[v1731] = v1703(v1734[v1731], v1702[v1731]);
            v1732++;
          }
        };
        v1730 = function (v1735) {
          for (v1731 = 0; v1731 < 4; v1731++) {
            v1735[v1731] += v1733[v1735[(v1731 + 3) % 4] & 63];
          }
        };
      } else {
        v1729 = function (v1736) {
          for (v1731 = 3; v1731 >= 0; v1731--) {
            v1736[v1731] = v1706(v1736[v1731], v1702[v1731]);
            v1736[v1731] -= v1733[v1732] + (v1736[(v1731 + 3) % 4] & v1736[(v1731 + 2) % 4]) + (~v1736[(v1731 + 3) % 4] & v1736[(v1731 + 1) % 4]);
            v1732--;
          }
        };
        v1730 = function (v1737) {
          for (v1731 = 3; v1731 >= 0; v1731--) {
            v1737[v1731] -= v1733[v1737[(v1731 + 3) % 4] & 63];
          }
        };
      }
      function v1738(v1739) {
        var v1740 = v1724;
        var v1741 = [];
        for (v1731 = 0; v1731 < 4; v1731++) {
          var v1742 = v1726.getInt16Le();
          if (v1728 !== null) {
            if (v1721) {
              v1742 ^= v1728.getInt16Le();
            } else {
              v1728.putInt16Le(v1742);
            }
          }
          v1741.push(v1742 & 65535);
        }
        v1732 = v1721 ? 0 : 63;
        for (var v1743 = 0; v1743 < v1739.length; v1743++) {
          for (var v1744 = 0; v1744 < v1739[v1743][0]; v1744++) {
            v1739[v1743][1](v1741);
          }
        }
        for (v1731 = 0; v1731 < 4; v1731++) {
          if (v1728 !== null) {
            if (v1721) {
              v1728.putInt16Le(v1741[v1731]);
            } else {
              v1741[v1731] ^= v1728.getInt16Le();
            }
          }
          v1727.putInt16Le(v1741[v1731]);
        }
      }
      var v1745 = null;
      v1745 = {
        start: function (v1746, v1747) {
          var v1748 = v1724;
          if (v1746) {
            if (typeof v1746 === "string") {
              v1746 = v1700.util.createBuffer(v1746);
            }
          }
          v1725 = false;
          v1726 = v1700.util.createBuffer();
          v1727 = v1747 || new v1700.util.createBuffer();
          v1728 = v1746;
          v1745.output = v1727;
        },
        update: function (v1749) {
          var v1750 = v1724;
          if (!v1725) {
            v1726.putBuffer(v1749);
          }
          while (v1726.length() >= 8) {
            v1738([[5, v1729], [1, v1730], [6, v1729], [1, v1730], [5, v1729]]);
          }
        },
        finish: function (v1751) {
          var v1752 = v1724;
          var v1753 = true;
          if (v1721) {
            if (v1751) {
              v1753 = v1751(8, v1726, !v1721);
            } else {
              var v1754 = v1726.length() === 8 ? 8 : 8 - v1726.length();
              v1726.fillWithByte(v1754, v1754);
            }
          }
          if (v1753) {
            v1725 = true;
            v1745.update();
          }
          if (!v1721) {
            v1753 = v1726.length() === 0;
            if (v1753) {
              if (v1751) {
                v1753 = v1751(8, v1727, !v1721);
              } else {
                var v1755 = v1727.length();
                var v1756 = v1727.at(v1755 - 1);
                if (v1756 > v1755) {
                  v1753 = false;
                } else {
                  v1727.truncate(v1756);
                }
              }
            }
          }
          return v1753;
        }
      };
      return v1745;
    }
    v1700.rc2.startEncrypting = function (v1757, v1758, v1759) {
      var v1760 = v1699;
      var v1761 = v1700.rc2.createEncryptionCipher(v1757, 128);
      v1761.start(v1758, v1759);
      return v1761;
    };
    v1700.rc2.createEncryptionCipher = function (v1762, v1763) {
      return v1718(v1762, v1763, true);
    };
    v1700.rc2.startDecrypting = function (v1764, v1765, v1766) {
      var v1767 = v1699;
      var v1768 = v1700.rc2.createDecryptionCipher(v1764, 128);
      v1768.start(v1765, v1766);
      return v1768;
    };
    v1700.rc2.createDecryptionCipher = function (v1769, v1770) {
      return v1718(v1769, v1770, false);
    };
  }
});
var require_jsbn = __commonJS({
  "node_modules/node-forge/lib/jsbn.js"(v1771, v1772) {
    var v1773 = {
      dh793: 891,
      dh794: 913,
      dh795: 325,
      dh796: 278,
      dh797: 775,
      dh798: 601,
      dh799: 899,
      dh800: 1374,
      dh801: 1107,
      dh802: 913,
      dh803: 435,
      dh804: 402,
      dh805: 1440,
      dh806: 859,
      dh807: 913,
      dh808: 224,
      dh809: 1058,
      dh810: 913,
      dh811: 913,
      dh812: 462,
      dh813: 913,
      dh814: 287,
      dh815: 913,
      dh816: 913,
      dh817: 913,
      dh818: 913,
      dh819: 1136,
      dh820: 1049,
      dh821: 789,
      dh822: 807,
      dh823: 1344,
      dh824: 913,
      dh825: 913
    };
    var v1774 = {
      dh826: 857
    };
    var v1775 = {
      dh827: 652,
      dh828: 1169
    };
    var v1776 = {
      dh829: 866,
      dh830: 857
    };
    var v1777 = {
      dh831: 1440,
      dh832: 1448,
      dh833: 866,
      dh834: 749,
      dh835: 479,
      dh836: 402,
      dh837: 479,
      dh838: 974,
      dh839: 1146,
      dh840: 1136
    };
    var v1778 = {
      dh841: 360,
      dh842: 360,
      dh843: 1448,
      dh844: 749,
      dh845: 652
    };
    var v1779 = {
      dh846: 1151
    };
    var v1780 = {
      dh847: 1216,
      dh848: 1058,
      dh849: 479
    };
    var v1781 = {
      dh850: 402,
      dh851: 315
    };
    var v1782 = {
      dh852: 1151,
      dh853: 1354
    };
    var v1783 = {
      dh854: 287,
      dh855: 1151
    };
    var v1784 = {
      dh856: 474
    };
    var v1785 = {
      dh857: 1107
    };
    var v1786 = {
      dh858: 1151,
      dh859: 1151
    };
    var v1787 = {
      dh860: 1151
    };
    var v1788 = {
      dh861: 749,
      dh862: 339
    };
    var v1789 = {
      dh863: 1151
    };
    var v1790 = {
      dh864: 1496
    };
    var v1791 = {
      dh865: 1151,
      dh866: 1151
    };
    var v1792 = {
      dh867: 402
    };
    var v1793 = {
      dh868: 272,
      dh869: 625,
      dh870: 265,
      dh871: 866,
      dh872: 809
    };
    var v1794 = {
      dh873: 272,
      dh874: 224,
      dh875: 544,
      dh876: 479
    };
    var v1795 = {
      dh877: 1166
    };
    var v1796 = {
      dh878: 952
    };
    var v1797 = {
      dh879: 1151
    };
    var v1798 = {
      dh880: 457
    };
    var v1799 = {
      dh881: 974
    };
    var v1800 = {
      dh882: 315
    };
    var v1801 = {
      dh883: 1043
    };
    var v1802 = {
      dh884: 1151,
      dh885: 402,
      dh886: 479
    };
    var v1803 = {
      dh887: 1166,
      dh888: 1440
    };
    var v1804 = {
      dh889: 330,
      dh890: 629
    };
    var v1805 = {
      dh891: 315
    };
    var v1806 = {
      dh892: 841,
      dh893: 479
    };
    var v1807 = {
      dh894: 841,
      dh895: 1374,
      dh896: 1151,
      dh897: 1216,
      dh898: 479
    };
    var v1808 = {
      dh899: 841,
      dh900: 1151,
      dh901: 1151
    };
    var v1809 = {
      dh902: 1151,
      dh903: 1151
    };
    var v1810 = {
      dh904: 287,
      dh905: 1151
    };
    var v1811 = {
      dh906: 1151,
      dh907: 1151,
      dh908: 397
    };
    var v1812 = {
      dh909: 1151
    };
    var v1813 = {
      dh910: 1151
    };
    var v1814 = {
      dh911: 435
    };
    var v1815 = {
      dh912: 760,
      dh913: 865,
      dh914: 1151,
      dh915: 1151,
      dh916: 397
    };
    var v1816 = {
      dh917: 1151
    };
    var v1817 = {
      dh918: 1151
    };
    var v1818 = {
      dh919: 1151
    };
    var v1819 = {
      dh920: 899
    };
    var v1820 = v2;
    var v1821 = require_forge();
    v1772.exports = v1821.jsbn = v1821.jsbn || {};
    var v1822;
    var v1823 = 244837814094590;
    var v1824 = (v1823 & 16777215) == 15715070;
    function v1825(v1826, v1827, v1828) {
      var v1829 = v1820;
      this.data = [];
      if (v1826 != null) {
        if (typeof v1826 == "number") {
          this.fromNumber(v1826, v1827, v1828);
        } else if (v1827 == null && typeof v1826 != "string") {
          this.fromString(v1826, 256);
        } else {
          this.fromString(v1826, v1827);
        }
      }
    }
    v1821.jsbn.BigInteger = v1825;
    function v1830() {
      return new v1825(null);
    }
    function v1831(v1832, v1833, v1834, v1835, v1836, v1837) {
      var v1838 = v1820;
      while (--v1837 >= 0) {
        var v1839 = v1833 * this.data[v1832++] + v1834.data[v1835] + v1836;
        v1836 = Math.floor(v1839 / 67108864);
        v1834.data[v1835++] = v1839 & 67108863;
      }
      return v1836;
    }
    function v1840(v1841, v1842, v1843, v1844, v1845, v1846) {
      var v1847 = v1820;
      var v1848 = v1842 & 32767;
      var v1849 = v1842 >> 15;
      while (--v1846 >= 0) {
        var v1850 = this.data[v1841] & 32767;
        var v1851 = this.data[v1841++] >> 15;
        var v1852 = v1849 * v1850 + v1851 * v1848;
        v1850 = v1848 * v1850 + ((v1852 & 32767) << 15) + v1843.data[v1844] + (v1845 & 1073741823);
        v1845 = (v1850 >>> 30) + (v1852 >>> 15) + v1849 * v1851 + (v1845 >>> 30);
        v1843.data[v1844++] = v1850 & 1073741823;
      }
      return v1845;
    }
    function v1853(v1854, v1855, v1856, v1857, v1858, v1859) {
      var v1860 = v1820;
      var v1861 = v1855 & 16383;
      var v1862 = v1855 >> 14;
      while (--v1859 >= 0) {
        var v1863 = this.data[v1854] & 16383;
        var v1864 = this.data[v1854++] >> 14;
        var v1865 = v1862 * v1863 + v1864 * v1861;
        v1863 = v1861 * v1863 + ((v1865 & 16383) << 14) + v1856.data[v1857] + v1858;
        v1858 = (v1863 >> 28) + (v1865 >> 14) + v1862 * v1864;
        v1856.data[v1857++] = v1863 & 268435455;
      }
      return v1858;
    }
    if (typeof navigator === "undefined") {
      v1825.prototype.am = v1853;
      v1822 = 28;
    } else if (v1824 && navigator.appName == "Microsoft Internet Explorer") {
      v1825.prototype.am = v1840;
      v1822 = 30;
    } else if (v1824 && navigator.appName != "Netscape") {
      v1825.prototype.am = v1831;
      v1822 = 26;
    } else {
      v1825.prototype.am = v1853;
      v1822 = 28;
    }
    v1825.prototype.DB = v1822;
    v1825.prototype.DM = (1 << v1822) - 1;
    v1825.prototype.DV = 1 << v1822;
    var v1866 = 52;
    v1825.prototype.FV = Math.pow(2, v1866);
    v1825.prototype.F1 = v1866 - v1822;
    v1825.prototype.F2 = v1822 * 2 - v1866;
    var v1867 = "0123456789abcdefghijklmnopqrstuvwxyz";
    var v1868 = new Array();
    var v1869;
    var v1870;
    v1869 = "0".charCodeAt(0);
    for (v1870 = 0; v1870 <= 9; ++v1870) {
      v1868[v1869++] = v1870;
    }
    v1869 = "a".charCodeAt(0);
    for (v1870 = 10; v1870 < 36; ++v1870) {
      v1868[v1869++] = v1870;
    }
    v1869 = "A".charCodeAt(0);
    for (v1870 = 10; v1870 < 36; ++v1870) {
      v1868[v1869++] = v1870;
    }
    function v1871(v1872) {
      return v1867.charAt(v1872);
    }
    function v1873(v1874, v1875) {
      var v1876 = v1868[v1874.charCodeAt(v1875)];
      if (v1876 == null) {
        return -1;
      } else {
        return v1876;
      }
    }
    function v1877(v1878) {
      var v1879 = v1820;
      for (var v1880 = this.t - 1; v1880 >= 0; --v1880) {
        v1878.data[v1880] = this.data[v1880];
      }
      v1878.t = this.t;
      v1878.s = this.s;
    }
    function v1881(v1882) {
      var v1883 = v1820;
      this.t = 1;
      this.s = v1882 < 0 ? -1 : 0;
      if (v1882 > 0) {
        this.data[0] = v1882;
      } else if (v1882 < -1) {
        this.data[0] = v1882 + this.DV;
      } else {
        this.t = 0;
      }
    }
    function v1884(v1885) {
      var v1886 = v1830();
      v1886.fromInt(v1885);
      return v1886;
    }
    function v1887(v1888, v1889) {
      var v1890 = v1820;
      var v1891;
      if (v1889 == 16) {
        v1891 = 4;
      } else if (v1889 == 8) {
        v1891 = 3;
      } else if (v1889 == 256) {
        v1891 = 8;
      } else if (v1889 == 2) {
        v1891 = 1;
      } else if (v1889 == 32) {
        v1891 = 5;
      } else if (v1889 == 4) {
        v1891 = 2;
      } else {
        this.fromRadix(v1888, v1889);
        return;
      }
      this.t = 0;
      this.s = 0;
      var v1892 = v1888.length;
      var v1893 = false;
      var v1894 = 0;
      while (--v1892 >= 0) {
        var v1895 = v1891 == 8 ? v1888[v1892] & 255 : v1873(v1888, v1892);
        if (v1895 < 0) {
          if (v1888.charAt(v1892) == "-") {
            v1893 = true;
          }
          continue;
        }
        v1893 = false;
        if (v1894 == 0) {
          this.data[this.t++] = v1895;
        } else if (v1894 + v1891 > this.DB) {
          this.data[this.t - 1] |= (v1895 & (1 << this.DB - v1894) - 1) << v1894;
          this.data[this.t++] = v1895 >> this.DB - v1894;
        } else {
          this.data[this.t - 1] |= v1895 << v1894;
        }
        v1894 += v1891;
        if (v1894 >= this.DB) {
          v1894 -= this.DB;
        }
      }
      if (v1891 == 8 && (v1888[0] & 128) != 0) {
        this.s = -1;
        if (v1894 > 0) {
          this.data[this.t - 1] |= (1 << this.DB - v1894) - 1 << v1894;
        }
      }
      this.clamp();
      if (v1893) {
        v1825.ZERO.subTo(this, this);
      }
    }
    function v1896() {
      var v1897 = this.s & this.DM;
      while (this.t > 0 && this.data[this.t - 1] == v1897) {
        --this.t;
      }
    }
    function v1898(v1899) {
      var v1900 = v1820;
      if (this.s < 0) {
        return "-" + this.negate().toString(v1899);
      }
      var v1901;
      if (v1899 == 16) {
        v1901 = 4;
      } else if (v1899 == 8) {
        v1901 = 3;
      } else if (v1899 == 2) {
        v1901 = 1;
      } else if (v1899 == 32) {
        v1901 = 5;
      } else if (v1899 == 4) {
        v1901 = 2;
      } else {
        return this.toRadix(v1899);
      }
      var v1902 = (1 << v1901) - 1;
      var v1903;
      var v1904 = false;
      var v1905 = "";
      var v1906 = this.t;
      var v1907 = this.DB - v1906 * this.DB % v1901;
      if (v1906-- > 0) {
        if (v1907 < this.DB && (v1903 = this.data[v1906] >> v1907) > 0) {
          v1904 = true;
          v1905 = v1871(v1903);
        }
        while (v1906 >= 0) {
          if (v1907 < v1901) {
            v1903 = (this.data[v1906] & (1 << v1907) - 1) << v1901 - v1907;
            v1903 |= this.data[--v1906] >> (v1907 += this.DB - v1901);
          } else {
            v1903 = this.data[v1906] >> (v1907 -= v1901) & v1902;
            if (v1907 <= 0) {
              v1907 += this.DB;
              --v1906;
            }
          }
          if (v1903 > 0) {
            v1904 = true;
          }
          if (v1904) {
            v1905 += v1871(v1903);
          }
        }
      }
      if (v1904) {
        return v1905;
      } else {
        return "0";
      }
    }
    function v1908() {
      var v1909 = v1820;
      var v1910 = v1830();
      v1825.ZERO.subTo(this, v1910);
      return v1910;
    }
    function v1911() {
      var v1912 = v1820;
      if (this.s < 0) {
        return this.negate();
      } else {
        return this;
      }
    }
    function v1913(v1914) {
      var v1915 = this.s - v1914.s;
      if (v1915 != 0) {
        return v1915;
      }
      var v1916 = this.t;
      v1915 = v1916 - v1914.t;
      if (v1915 != 0) {
        if (this.s < 0) {
          return -v1915;
        } else {
          return v1915;
        }
      }
      while (--v1916 >= 0) {
        if ((v1915 = this.data[v1916] - v1914.data[v1916]) != 0) {
          return v1915;
        }
      }
      return 0;
    }
    function v1917(v1918) {
      var v1919 = 1;
      var v1920;
      if ((v1920 = v1918 >>> 16) != 0) {
        v1918 = v1920;
        v1919 += 16;
      }
      if ((v1920 = v1918 >> 8) != 0) {
        v1918 = v1920;
        v1919 += 8;
      }
      if ((v1920 = v1918 >> 4) != 0) {
        v1918 = v1920;
        v1919 += 4;
      }
      if ((v1920 = v1918 >> 2) != 0) {
        v1918 = v1920;
        v1919 += 2;
      }
      if ((v1920 = v1918 >> 1) != 0) {
        v1918 = v1920;
        v1919 += 1;
      }
      return v1919;
    }
    function v1921() {
      if (this.t <= 0) {
        return 0;
      }
      return this.DB * (this.t - 1) + v1917(this.data[this.t - 1] ^ this.s & this.DM);
    }
    function v1922(v1923, v1924) {
      var v1925 = v1820;
      var v1926;
      for (v1926 = this.t - 1; v1926 >= 0; --v1926) {
        v1924.data[v1926 + v1923] = this.data[v1926];
      }
      for (v1926 = v1923 - 1; v1926 >= 0; --v1926) {
        v1924.data[v1926] = 0;
      }
      v1924.t = this.t + v1923;
      v1924.s = this.s;
    }
    function v1927(v1928, v1929) {
      var v1930 = v1820;
      for (var v1931 = v1928; v1931 < this.t; ++v1931) {
        v1929.data[v1931 - v1928] = this.data[v1931];
      }
      v1929.t = Math.max(this.t - v1928, 0);
      v1929.s = this.s;
    }
    function v1932(v1933, v1934) {
      var v1935 = v1820;
      var v1936 = v1933 % this.DB;
      var v1937 = this.DB - v1936;
      var v1938 = (1 << v1937) - 1;
      var v1939 = Math.floor(v1933 / this.DB);
      var v1940 = this.s << v1936 & this.DM;
      var v1941;
      for (v1941 = this.t - 1; v1941 >= 0; --v1941) {
        v1934.data[v1941 + v1939 + 1] = this.data[v1941] >> v1937 | v1940;
        v1940 = (this.data[v1941] & v1938) << v1936;
      }
      for (v1941 = v1939 - 1; v1941 >= 0; --v1941) {
        v1934.data[v1941] = 0;
      }
      v1934.data[v1939] = v1940;
      v1934.t = this.t + v1939 + 1;
      v1934.s = this.s;
      v1934.clamp();
    }
    function v1942(v1943, v1944) {
      var v1945 = v1820;
      v1944.s = this.s;
      var v1946 = Math.floor(v1943 / this.DB);
      if (v1946 >= this.t) {
        v1944.t = 0;
        return;
      }
      var v1947 = v1943 % this.DB;
      var v1948 = this.DB - v1947;
      var v1949 = (1 << v1947) - 1;
      v1944.data[0] = this.data[v1946] >> v1947;
      for (var v1950 = v1946 + 1; v1950 < this.t; ++v1950) {
        v1944.data[v1950 - v1946 - 1] |= (this.data[v1950] & v1949) << v1948;
        v1944.data[v1950 - v1946] = this.data[v1950] >> v1947;
      }
      if (v1947 > 0) {
        v1944.data[this.t - v1946 - 1] |= (this.s & v1949) << v1948;
      }
      v1944.t = this.t - v1946;
      v1944.clamp();
    }
    function v1951(v1952, v1953) {
      var v1954 = v1820;
      var v1955 = 0;
      var v1956 = 0;
      var v1957 = Math.min(v1952.t, this.t);
      while (v1955 < v1957) {
        v1956 += this.data[v1955] - v1952.data[v1955];
        v1953.data[v1955++] = v1956 & this.DM;
        v1956 >>= this.DB;
      }
      if (v1952.t < this.t) {
        v1956 -= v1952.s;
        while (v1955 < this.t) {
          v1956 += this.data[v1955];
          v1953.data[v1955++] = v1956 & this.DM;
          v1956 >>= this.DB;
        }
        v1956 += this.s;
      } else {
        v1956 += this.s;
        while (v1955 < v1952.t) {
          v1956 -= v1952.data[v1955];
          v1953.data[v1955++] = v1956 & this.DM;
          v1956 >>= this.DB;
        }
        v1956 -= v1952.s;
      }
      v1953.s = v1956 < 0 ? -1 : 0;
      if (v1956 < -1) {
        v1953.data[v1955++] = this.DV + v1956;
      } else if (v1956 > 0) {
        v1953.data[v1955++] = v1956;
      }
      v1953.t = v1955;
      v1953.clamp();
    }
    function v1958(v1959, v1960) {
      var v1961 = v1820;
      var v1962 = this.abs();
      var v1963 = v1959.abs();
      var v1964 = v1962.t;
      v1960.t = v1964 + v1963.t;
      while (--v1964 >= 0) {
        v1960.data[v1964] = 0;
      }
      for (v1964 = 0; v1964 < v1963.t; ++v1964) {
        v1960.data[v1964 + v1962.t] = v1962.am(0, v1963.data[v1964], v1960, v1964, 0, v1962.t);
      }
      v1960.s = 0;
      v1960.clamp();
      if (this.s != v1959.s) {
        v1825.ZERO.subTo(v1960, v1960);
      }
    }
    function v1965(v1966) {
      var v1967 = v1820;
      var v1968 = this.abs();
      var v1969 = v1966.t = v1968.t * 2;
      while (--v1969 >= 0) {
        v1966.data[v1969] = 0;
      }
      for (v1969 = 0; v1969 < v1968.t - 1; ++v1969) {
        var v1970 = v1968.am(v1969, v1968.data[v1969], v1966, v1969 * 2, 0, 1);
        if ((v1966.data[v1969 + v1968.t] += v1968.am(v1969 + 1, v1968.data[v1969] * 2, v1966, v1969 * 2 + 1, v1970, v1968.t - v1969 - 1)) >= v1968.DV) {
          v1966.data[v1969 + v1968.t] -= v1968.DV;
          v1966.data[v1969 + v1968.t + 1] = 1;
        }
      }
      if (v1966.t > 0) {
        v1966.data[v1966.t - 1] += v1968.am(v1969, v1968.data[v1969], v1966, v1969 * 2, 0, 1);
      }
      v1966.s = 0;
      v1966.clamp();
    }
    function v1971(v1972, v1973, v1974) {
      var v1975 = v1820;
      var v1976 = v1972.abs();
      if (v1976.t <= 0) {
        return;
      }
      var v1977 = this.abs();
      if (v1977.t < v1976.t) {
        if (v1973 != null) {
          v1973.fromInt(0);
        }
        if (v1974 != null) {
          this.copyTo(v1974);
        }
        return;
      }
      if (v1974 == null) {
        v1974 = v1830();
      }
      var v1978 = v1830();
      var v1979 = this.s;
      var v1980 = v1972.s;
      var v1981 = this.DB - v1917(v1976.data[v1976.t - 1]);
      if (v1981 > 0) {
        v1976.lShiftTo(v1981, v1978);
        v1977.lShiftTo(v1981, v1974);
      } else {
        v1976.copyTo(v1978);
        v1977.copyTo(v1974);
      }
      var v1982 = v1978.t;
      var v1983 = v1978.data[v1982 - 1];
      if (v1983 == 0) {
        return;
      }
      var v1984 = v1983 * (1 << this.F1) + (v1982 > 1 ? v1978.data[v1982 - 2] >> this.F2 : 0);
      var v1985 = this.FV / v1984;
      var v1986 = (1 << this.F1) / v1984;
      var v1987 = 1 << this.F2;
      var v1988 = v1974.t;
      var v1989 = v1988 - v1982;
      var v1990 = v1973 == null ? v1830() : v1973;
      v1978.dlShiftTo(v1989, v1990);
      if (v1974.compareTo(v1990) >= 0) {
        v1974.data[v1974.t++] = 1;
        v1974.subTo(v1990, v1974);
      }
      v1825.ONE.dlShiftTo(v1982, v1990);
      v1990.subTo(v1978, v1978);
      while (v1978.t < v1982) {
        v1978.data[v1978.t++] = 0;
      }
      while (--v1989 >= 0) {
        var v1991 = v1974.data[--v1988] == v1983 ? this.DM : Math.floor(v1974.data[v1988] * v1985 + (v1974.data[v1988 - 1] + v1987) * v1986);
        if ((v1974.data[v1988] += v1978.am(0, v1991, v1974, v1989, 0, v1982)) < v1991) {
          v1978.dlShiftTo(v1989, v1990);
          v1974.subTo(v1990, v1974);
          while (v1974.data[v1988] < --v1991) {
            v1974.subTo(v1990, v1974);
          }
        }
      }
      if (v1973 != null) {
        v1974.drShiftTo(v1982, v1973);
        if (v1979 != v1980) {
          v1825.ZERO.subTo(v1973, v1973);
        }
      }
      v1974.t = v1982;
      v1974.clamp();
      if (v1981 > 0) {
        v1974.rShiftTo(v1981, v1974);
      }
      if (v1979 < 0) {
        v1825.ZERO.subTo(v1974, v1974);
      }
    }
    function v1992(v1993) {
      var v1994 = v1820;
      var v1995 = v1830();
      this.abs().divRemTo(v1993, null, v1995);
      if (this.s < 0 && v1995.compareTo(v1825.ZERO) > 0) {
        v1993.subTo(v1995, v1995);
      }
      return v1995;
    }
    function v1996(v1997) {
      this.m = v1997;
    }
    function v1998(v1999) {
      if (v1999.s < 0 || v1999.compareTo(this.m) >= 0) {
        return v1999.mod(this.m);
      } else {
        return v1999;
      }
    }
    function v2000(v2001) {
      return v2001;
    }
    function v2002(v2003) {
      var v2004 = v1820;
      v2003.divRemTo(this.m, null, v2003);
    }
    function v2005(v2006, v2007, v2008) {
      v2006.multiplyTo(v2007, v2008);
      this.reduce(v2008);
    }
    function v2009(v2010, v2011) {
      var v2012 = v1820;
      v2010.squareTo(v2011);
      this.reduce(v2011);
    }
    v1996.prototype.convert = v1998;
    v1996.prototype.revert = v2000;
    v1996.prototype.reduce = v2002;
    v1996.prototype.mulTo = v2005;
    v1996.prototype.sqrTo = v2009;
    function v2013() {
      var v2014 = v1820;
      if (this.t < 1) {
        return 0;
      }
      var v2015 = this.data[0];
      if ((v2015 & 1) == 0) {
        return 0;
      }
      var v2016 = v2015 & 3;
      v2016 = v2016 * (2 - (v2015 & 15) * v2016) & 15;
      v2016 = v2016 * (2 - (v2015 & 255) * v2016) & 255;
      v2016 = v2016 * (2 - ((v2015 & 65535) * v2016 & 65535)) & 65535;
      v2016 = v2016 * (2 - v2015 * v2016 % this.DV) % this.DV;
      if (v2016 > 0) {
        return this.DV - v2016;
      } else {
        return -v2016;
      }
    }
    function v2017(v2018) {
      var v2019 = v1820;
      this.m = v2018;
      this.mp = v2018.invDigit();
      this.mpl = this.mp & 32767;
      this.mph = this.mp >> 15;
      this.um = (1 << v2018.DB - 15) - 1;
      this.mt2 = v2018.t * 2;
    }
    function v2020(v2021) {
      var v2022 = v1820;
      var v2023 = v1830();
      v2021.abs().dlShiftTo(this.m.t, v2023);
      v2023.divRemTo(this.m, null, v2023);
      if (v2021.s < 0 && v2023.compareTo(v1825.ZERO) > 0) {
        this.m.subTo(v2023, v2023);
      }
      return v2023;
    }
    function v2024(v2025) {
      var v2026 = v1820;
      var v2027 = v1830();
      v2025.copyTo(v2027);
      this.reduce(v2027);
      return v2027;
    }
    function v2028(v2029) {
      var v2030 = v1820;
      while (v2029.t <= this.mt2) {
        v2029.data[v2029.t++] = 0;
      }
      for (var v2031 = 0; v2031 < this.m.t; ++v2031) {
        var v2032 = v2029.data[v2031] & 32767;
        var v2033 = v2032 * this.mpl + ((v2032 * this.mph + (v2029.data[v2031] >> 15) * this.mpl & this.um) << 15) & v2029.DM;
        v2032 = v2031 + this.m.t;
        v2029.data[v2032] += this.m.am(0, v2033, v2029, v2031, 0, this.m.t);
        while (v2029.data[v2032] >= v2029.DV) {
          v2029.data[v2032] -= v2029.DV;
          v2029.data[++v2032]++;
        }
      }
      v2029.clamp();
      v2029.drShiftTo(this.m.t, v2029);
      if (v2029.compareTo(this.m) >= 0) {
        v2029.subTo(this.m, v2029);
      }
    }
    function v2034(v2035, v2036) {
      var v2037 = v1820;
      v2035.squareTo(v2036);
      this.reduce(v2036);
    }
    function v2038(v2039, v2040, v2041) {
      var v2042 = v1820;
      v2039.multiplyTo(v2040, v2041);
      this.reduce(v2041);
    }
    v2017.prototype.convert = v2020;
    v2017.prototype.revert = v2024;
    v2017.prototype.reduce = v2028;
    v2017.prototype.mulTo = v2038;
    v2017.prototype.sqrTo = v2034;
    function v2043() {
      return (this.t > 0 ? this.data[0] & 1 : this.s) == 0;
    }
    function v2044(v2045, v2046) {
      var v2047 = v1820;
      if (v2045 > 4294967295 || v2045 < 1) {
        return v1825.ONE;
      }
      var v2048 = v1830();
      var v2049 = v1830();
      var v2050 = v2046.convert(this);
      var v2051 = v1917(v2045) - 1;
      v2050.copyTo(v2048);
      while (--v2051 >= 0) {
        v2046.sqrTo(v2048, v2049);
        if ((v2045 & 1 << v2051) > 0) {
          v2046.mulTo(v2049, v2050, v2048);
        } else {
          var v2052 = v2048;
          v2048 = v2049;
          v2049 = v2052;
        }
      }
      return v2046.revert(v2048);
    }
    function v2053(v2054, v2055) {
      var v2056 = v1820;
      var v2057;
      if (v2054 < 256 || v2055.isEven()) {
        v2057 = new v1996(v2055);
      } else {
        v2057 = new v2017(v2055);
      }
      return this.exp(v2054, v2057);
    }
    v1825.prototype.copyTo = v1877;
    v1825.prototype.fromInt = v1881;
    v1825.prototype.fromString = v1887;
    v1825.prototype.clamp = v1896;
    v1825.prototype.dlShiftTo = v1922;
    v1825.prototype.drShiftTo = v1927;
    v1825.prototype.lShiftTo = v1932;
    v1825.prototype.rShiftTo = v1942;
    v1825.prototype.subTo = v1951;
    v1825.prototype.multiplyTo = v1958;
    v1825.prototype.squareTo = v1965;
    v1825.prototype.divRemTo = v1971;
    v1825.prototype.invDigit = v2013;
    v1825.prototype.isEven = v2043;
    v1825.prototype.exp = v2044;
    v1825.prototype.toString = v1898;
    v1825.prototype.negate = v1908;
    v1825.prototype.abs = v1911;
    v1825.prototype.compareTo = v1913;
    v1825.prototype.bitLength = v1921;
    v1825.prototype.mod = v1992;
    v1825.prototype.modPowInt = v2053;
    v1825.ZERO = v1884(0);
    v1825.ONE = v1884(1);
    function v2058() {
      var v2059 = v1820;
      var v2060 = v1830();
      this.copyTo(v2060);
      return v2060;
    }
    function v2061() {
      var v2062 = v1820;
      if (this.s < 0) {
        if (this.t == 1) {
          return this.data[0] - this.DV;
        } else if (this.t == 0) {
          return -1;
        }
      } else if (this.t == 1) {
        return this.data[0];
      } else if (this.t == 0) {
        return 0;
      }
      return (this.data[1] & (1 << 32 - this.DB) - 1) << this.DB | this.data[0];
    }
    function v2063() {
      if (this.t == 0) {
        return this.s;
      } else {
        return this.data[0] << 24 >> 24;
      }
    }
    function v2064() {
      if (this.t == 0) {
        return this.s;
      } else {
        return this.data[0] << 16 >> 16;
      }
    }
    function v2065(v2066) {
      var v2067 = v1820;
      return Math.floor(Math.LN2 * this.DB / Math.log(v2066));
    }
    function v2068() {
      var v2069 = v1820;
      if (this.s < 0) {
        return -1;
      } else if (this.t <= 0 || this.t == 1 && this.data[0] <= 0) {
        return 0;
      } else {
        return 1;
      }
    }
    function v2070(v2071) {
      var v2072 = v1820;
      if (v2071 == null) {
        v2071 = 10;
      }
      if (this.signum() == 0 || v2071 < 2 || v2071 > 36) {
        return "0";
      }
      var v2073 = this.chunkSize(v2071);
      var v2074 = Math.pow(v2071, v2073);
      var v2075 = v1884(v2074);
      var v2076 = v1830();
      var v2077 = v1830();
      var v2078 = "";
      this.divRemTo(v2075, v2076, v2077);
      while (v2076.signum() > 0) {
        v2078 = (v2074 + v2077.intValue()).toString(v2071).substr(1) + v2078;
        v2076.divRemTo(v2075, v2076, v2077);
      }
      return v2077.intValue().toString(v2071) + v2078;
    }
    function v2079(v2080, v2081) {
      var v2082 = v1820;
      this.fromInt(0);
      if (v2081 == null) {
        v2081 = 10;
      }
      var v2083 = this.chunkSize(v2081);
      var v2084 = Math.pow(v2081, v2083);
      var v2085 = false;
      var v2086 = 0;
      var v2087 = 0;
      for (var v2088 = 0; v2088 < v2080.length; ++v2088) {
        var v2089 = v1873(v2080, v2088);
        if (v2089 < 0) {
          if (v2080.charAt(v2088) == "-" && this.signum() == 0) {
            v2085 = true;
          }
          continue;
        }
        v2087 = v2081 * v2087 + v2089;
        if (++v2086 >= v2083) {
          this.dMultiply(v2084);
          this.dAddOffset(v2087, 0);
          v2086 = 0;
          v2087 = 0;
        }
      }
      if (v2086 > 0) {
        this.dMultiply(Math.pow(v2081, v2086));
        this.dAddOffset(v2087, 0);
      }
      if (v2085) {
        v1825.ZERO.subTo(this, this);
      }
    }
    function v2090(v2091, v2092, v2093) {
      var v2094 = v1820;
      if (typeof v2092 == "number") {
        if (v2091 < 2) {
          this.fromInt(1);
        } else {
          this.fromNumber(v2091, v2093);
          if (!this.testBit(v2091 - 1)) {
            this.bitwiseTo(v1825.ONE.shiftLeft(v2091 - 1), v2095, this);
          }
          if (this.isEven()) {
            this.dAddOffset(1, 0);
          }
          while (!this.isProbablePrime(v2092)) {
            this.dAddOffset(2, 0);
            if (this.bitLength() > v2091) {
              this.subTo(v1825.ONE.shiftLeft(v2091 - 1), this);
            }
          }
        }
      } else {
        var v2096 = new Array();
        var v2097 = v2091 & 7;
        v2096.length = (v2091 >> 3) + 1;
        v2092.nextBytes(v2096);
        if (v2097 > 0) {
          v2096[0] &= (1 << v2097) - 1;
        } else {
          v2096[0] = 0;
        }
        this.fromString(v2096, 256);
      }
    }
    function v2098() {
      var v2099 = v1820;
      var v2100 = this.t;
      var v2101 = new Array();
      v2101[0] = this.s;
      var v2102 = this.DB - v2100 * this.DB % 8;
      var v2103;
      var v2104 = 0;
      if (v2100-- > 0) {
        if (v2102 < this.DB && (v2103 = this.data[v2100] >> v2102) != (this.s & this.DM) >> v2102) {
          v2101[v2104++] = v2103 | this.s << this.DB - v2102;
        }
        while (v2100 >= 0) {
          if (v2102 < 8) {
            v2103 = (this.data[v2100] & (1 << v2102) - 1) << 8 - v2102;
            v2103 |= this.data[--v2100] >> (v2102 += this.DB - 8);
          } else {
            v2103 = this.data[v2100] >> (v2102 -= 8) & 255;
            if (v2102 <= 0) {
              v2102 += this.DB;
              --v2100;
            }
          }
          if ((v2103 & 128) != 0) {
            v2103 |= -256;
          }
          if (v2104 == 0 && (this.s & 128) != (v2103 & 128)) {
            ++v2104;
          }
          if (v2104 > 0 || v2103 != this.s) {
            v2101[v2104++] = v2103;
          }
        }
      }
      return v2101;
    }
    function v2105(v2106) {
      var v2107 = v1820;
      return this.compareTo(v2106) == 0;
    }
    function v2108(v2109) {
      if (this.compareTo(v2109) < 0) {
        return this;
      } else {
        return v2109;
      }
    }
    function v2110(v2111) {
      if (this.compareTo(v2111) > 0) {
        return this;
      } else {
        return v2111;
      }
    }
    function v2112(v2113, v2114, v2115) {
      var v2116 = v1820;
      var v2117;
      var v2118;
      var v2119 = Math.min(v2113.t, this.t);
      for (v2117 = 0; v2117 < v2119; ++v2117) {
        v2115.data[v2117] = v2114(this.data[v2117], v2113.data[v2117]);
      }
      if (v2113.t < this.t) {
        v2118 = v2113.s & this.DM;
        for (v2117 = v2119; v2117 < this.t; ++v2117) {
          v2115.data[v2117] = v2114(this.data[v2117], v2118);
        }
        v2115.t = this.t;
      } else {
        v2118 = this.s & this.DM;
        for (v2117 = v2119; v2117 < v2113.t; ++v2117) {
          v2115.data[v2117] = v2114(v2118, v2113.data[v2117]);
        }
        v2115.t = v2113.t;
      }
      v2115.s = v2114(this.s, v2113.s);
      v2115.clamp();
    }
    function v2120(v2121, v2122) {
      return v2121 & v2122;
    }
    function v2123(v2124) {
      var v2125 = v1820;
      var v2126 = v1830();
      this.bitwiseTo(v2124, v2120, v2126);
      return v2126;
    }
    function v2095(v2127, v2128) {
      return v2127 | v2128;
    }
    function v2129(v2130) {
      var v2131 = v1820;
      var v2132 = v1830();
      this.bitwiseTo(v2130, v2095, v2132);
      return v2132;
    }
    function v2133(v2134, v2135) {
      return v2134 ^ v2135;
    }
    function v2136(v2137) {
      var v2138 = v1820;
      var v2139 = v1830();
      this.bitwiseTo(v2137, v2133, v2139);
      return v2139;
    }
    function v2140(v2141, v2142) {
      return v2141 & ~v2142;
    }
    function v2143(v2144) {
      var v2145 = v1820;
      var v2146 = v1830();
      this.bitwiseTo(v2144, v2140, v2146);
      return v2146;
    }
    function v2147() {
      var v2148 = v1820;
      var v2149 = v1830();
      for (var v2150 = 0; v2150 < this.t; ++v2150) {
        v2149.data[v2150] = this.DM & ~this.data[v2150];
      }
      v2149.t = this.t;
      v2149.s = ~this.s;
      return v2149;
    }
    function v2151(v2152) {
      var v2153 = v1820;
      var v2154 = v1830();
      if (v2152 < 0) {
        this.rShiftTo(-v2152, v2154);
      } else {
        this.lShiftTo(v2152, v2154);
      }
      return v2154;
    }
    function v2155(v2156) {
      var v2157 = v1830();
      if (v2156 < 0) {
        this.lShiftTo(-v2156, v2157);
      } else {
        this.rShiftTo(v2156, v2157);
      }
      return v2157;
    }
    function v2158(v2159) {
      if (v2159 == 0) {
        return -1;
      }
      var v2160 = 0;
      if ((v2159 & 65535) == 0) {
        v2159 >>= 16;
        v2160 += 16;
      }
      if ((v2159 & 255) == 0) {
        v2159 >>= 8;
        v2160 += 8;
      }
      if ((v2159 & 15) == 0) {
        v2159 >>= 4;
        v2160 += 4;
      }
      if ((v2159 & 3) == 0) {
        v2159 >>= 2;
        v2160 += 2;
      }
      if ((v2159 & 1) == 0) {
        ++v2160;
      }
      return v2160;
    }
    function v2161() {
      for (var v2162 = 0; v2162 < this.t; ++v2162) {
        if (this.data[v2162] != 0) {
          return v2162 * this.DB + v2158(this.data[v2162]);
        }
      }
      if (this.s < 0) {
        return this.t * this.DB;
      }
      return -1;
    }
    function v2163(v2164) {
      var v2165 = 0;
      while (v2164 != 0) {
        v2164 &= v2164 - 1;
        ++v2165;
      }
      return v2165;
    }
    function v2166() {
      var v2167 = 0;
      var v2168 = this.s & this.DM;
      for (var v2169 = 0; v2169 < this.t; ++v2169) {
        v2167 += v2163(this.data[v2169] ^ v2168);
      }
      return v2167;
    }
    function v2170(v2171) {
      var v2172 = v1820;
      var v2173 = Math.floor(v2171 / this.DB);
      if (v2173 >= this.t) {
        return this.s != 0;
      }
      return (this.data[v2173] & 1 << v2171 % this.DB) != 0;
    }
    function v2174(v2175, v2176) {
      var v2177 = v1820;
      var v2178 = v1825.ONE.shiftLeft(v2175);
      this.bitwiseTo(v2178, v2176, v2178);
      return v2178;
    }
    function v2179(v2180) {
      return this.changeBit(v2180, v2095);
    }
    function v2181(v2182) {
      return this.changeBit(v2182, v2140);
    }
    function v2183(v2184) {
      return this.changeBit(v2184, v2133);
    }
    function v2185(v2186, v2187) {
      var v2188 = v1820;
      var v2189 = 0;
      var v2190 = 0;
      var v2191 = Math.min(v2186.t, this.t);
      while (v2189 < v2191) {
        v2190 += this.data[v2189] + v2186.data[v2189];
        v2187.data[v2189++] = v2190 & this.DM;
        v2190 >>= this.DB;
      }
      if (v2186.t < this.t) {
        v2190 += v2186.s;
        while (v2189 < this.t) {
          v2190 += this.data[v2189];
          v2187.data[v2189++] = v2190 & this.DM;
          v2190 >>= this.DB;
        }
        v2190 += this.s;
      } else {
        v2190 += this.s;
        while (v2189 < v2186.t) {
          v2190 += v2186.data[v2189];
          v2187.data[v2189++] = v2190 & this.DM;
          v2190 >>= this.DB;
        }
        v2190 += v2186.s;
      }
      v2187.s = v2190 < 0 ? -1 : 0;
      if (v2190 > 0) {
        v2187.data[v2189++] = v2190;
      } else if (v2190 < -1) {
        v2187.data[v2189++] = this.DV + v2190;
      }
      v2187.t = v2189;
      v2187.clamp();
    }
    function v2192(v2193) {
      var v2194 = v1830();
      this.addTo(v2193, v2194);
      return v2194;
    }
    function v2195(v2196) {
      var v2197 = v1830();
      this.subTo(v2196, v2197);
      return v2197;
    }
    function v2198(v2199) {
      var v2200 = v1820;
      var v2201 = v1830();
      this.multiplyTo(v2199, v2201);
      return v2201;
    }
    function v2202() {
      var v2203 = v1820;
      var v2204 = v1830();
      this.squareTo(v2204);
      return v2204;
    }
    function v2205(v2206) {
      var v2207 = v1830();
      this.divRemTo(v2206, v2207, null);
      return v2207;
    }
    function v2208(v2209) {
      var v2210 = v1830();
      this.divRemTo(v2209, null, v2210);
      return v2210;
    }
    function v2211(v2212) {
      var v2213 = v1830();
      var v2214 = v1830();
      this.divRemTo(v2212, v2213, v2214);
      return new Array(v2213, v2214);
    }
    function v2215(v2216) {
      var v2217 = v1820;
      this.data[this.t] = this.am(0, v2216 - 1, this, 0, 0, this.t);
      ++this.t;
      this.clamp();
    }
    function v2218(v2219, v2220) {
      var v2221 = v1820;
      if (v2219 == 0) {
        return;
      }
      while (this.t <= v2220) {
        this.data[this.t++] = 0;
      }
      this.data[v2220] += v2219;
      while (this.data[v2220] >= this.DV) {
        this.data[v2220] -= this.DV;
        if (++v2220 >= this.t) {
          this.data[this.t++] = 0;
        }
        ++this.data[v2220];
      }
    }
    function v2222() {}
    function v2223(v2224) {
      return v2224;
    }
    function v2225(v2226, v2227, v2228) {
      var v2229 = v1820;
      v2226.multiplyTo(v2227, v2228);
    }
    function v2230(v2231, v2232) {
      v2231.squareTo(v2232);
    }
    v2222.prototype.convert = v2223;
    v2222.prototype.revert = v2223;
    v2222.prototype.mulTo = v2225;
    v2222.prototype.sqrTo = v2230;
    function v2233(v2234) {
      var v2235 = v1820;
      return this.exp(v2234, new v2222());
    }
    function v2236(v2237, v2238, v2239) {
      var v2240 = v1820;
      var v2241 = Math.min(this.t + v2237.t, v2238);
      v2239.s = 0;
      v2239.t = v2241;
      while (v2241 > 0) {
        v2239.data[--v2241] = 0;
      }
      var v2242;
      for (v2242 = v2239.t - this.t; v2241 < v2242; ++v2241) {
        v2239.data[v2241 + this.t] = this.am(0, v2237.data[v2241], v2239, v2241, 0, this.t);
      }
      for (v2242 = Math.min(v2237.t, v2238); v2241 < v2242; ++v2241) {
        this.am(0, v2237.data[v2241], v2239, v2241, 0, v2238 - v2241);
      }
      v2239.clamp();
    }
    function v2243(v2244, v2245, v2246) {
      var v2247 = v1820;
      --v2245;
      var v2248 = v2246.t = this.t + v2244.t - v2245;
      v2246.s = 0;
      while (--v2248 >= 0) {
        v2246.data[v2248] = 0;
      }
      for (v2248 = Math.max(v2245 - this.t, 0); v2248 < v2244.t; ++v2248) {
        v2246.data[this.t + v2248 - v2245] = this.am(v2245 - v2248, v2244.data[v2248], v2246, 0, 0, this.t + v2248 - v2245);
      }
      v2246.clamp();
      v2246.drShiftTo(1, v2246);
    }
    function v2249(v2250) {
      this.r2 = v1830();
      this.q3 = v1830();
      v1825.ONE.dlShiftTo(v2250.t * 2, this.r2);
      this.mu = this.r2.divide(v2250);
      this.m = v2250;
    }
    function v2251(v2252) {
      var v2253 = v1820;
      if (v2252.s < 0 || v2252.t > this.m.t * 2) {
        return v2252.mod(this.m);
      } else if (v2252.compareTo(this.m) < 0) {
        return v2252;
      } else {
        var v2254 = v1830();
        v2252.copyTo(v2254);
        this.reduce(v2254);
        return v2254;
      }
    }
    function v2255(v2256) {
      return v2256;
    }
    function v2257(v2258) {
      var v2259 = v1820;
      v2258.drShiftTo(this.m.t - 1, this.r2);
      if (v2258.t > this.m.t + 1) {
        v2258.t = this.m.t + 1;
        v2258.clamp();
      }
      this.mu.multiplyUpperTo(this.r2, this.m.t + 1, this.q3);
      this.m.multiplyLowerTo(this.q3, this.m.t + 1, this.r2);
      while (v2258.compareTo(this.r2) < 0) {
        v2258.dAddOffset(1, this.m.t + 1);
      }
      v2258.subTo(this.r2, v2258);
      while (v2258.compareTo(this.m) >= 0) {
        v2258.subTo(this.m, v2258);
      }
    }
    function v2260(v2261, v2262) {
      var v2263 = v1820;
      v2261.squareTo(v2262);
      this.reduce(v2262);
    }
    function v2264(v2265, v2266, v2267) {
      var v2268 = v1820;
      v2265.multiplyTo(v2266, v2267);
      this.reduce(v2267);
    }
    v2249.prototype.convert = v2251;
    v2249.prototype.revert = v2255;
    v2249.prototype.reduce = v2257;
    v2249.prototype.mulTo = v2264;
    v2249.prototype.sqrTo = v2260;
    function v2269(v2270, v2271) {
      var v2272 = v1820;
      var v2273 = v2270.bitLength();
      var v2274;
      var v2275 = v1884(1);
      var v2276;
      if (v2273 <= 0) {
        return v2275;
      } else if (v2273 < 18) {
        v2274 = 1;
      } else if (v2273 < 48) {
        v2274 = 3;
      } else if (v2273 < 144) {
        v2274 = 4;
      } else if (v2273 < 768) {
        v2274 = 5;
      } else {
        v2274 = 6;
      }
      if (v2273 < 8) {
        v2276 = new v1996(v2271);
      } else if (v2271.isEven()) {
        v2276 = new v2249(v2271);
      } else {
        v2276 = new v2017(v2271);
      }
      var v2277 = new Array();
      var v2278 = 3;
      var v2279 = v2274 - 1;
      var v2280 = (1 << v2274) - 1;
      v2277[1] = v2276.convert(this);
      if (v2274 > 1) {
        var v2281 = v1830();
        v2276.sqrTo(v2277[1], v2281);
        while (v2278 <= v2280) {
          v2277[v2278] = v1830();
          v2276.mulTo(v2281, v2277[v2278 - 2], v2277[v2278]);
          v2278 += 2;
        }
      }
      var v2282 = v2270.t - 1;
      var v2283;
      var v2284 = true;
      var v2285 = v1830();
      var v2286;
      v2273 = v1917(v2270.data[v2282]) - 1;
      while (v2282 >= 0) {
        if (v2273 >= v2279) {
          v2283 = v2270.data[v2282] >> v2273 - v2279 & v2280;
        } else {
          v2283 = (v2270.data[v2282] & (1 << v2273 + 1) - 1) << v2279 - v2273;
          if (v2282 > 0) {
            v2283 |= v2270.data[v2282 - 1] >> this.DB + v2273 - v2279;
          }
        }
        v2278 = v2274;
        while ((v2283 & 1) == 0) {
          v2283 >>= 1;
          --v2278;
        }
        if ((v2273 -= v2278) < 0) {
          v2273 += this.DB;
          --v2282;
        }
        if (v2284) {
          v2277[v2283].copyTo(v2275);
          v2284 = false;
        } else {
          while (v2278 > 1) {
            v2276.sqrTo(v2275, v2285);
            v2276.sqrTo(v2285, v2275);
            v2278 -= 2;
          }
          if (v2278 > 0) {
            v2276.sqrTo(v2275, v2285);
          } else {
            v2286 = v2275;
            v2275 = v2285;
            v2285 = v2286;
          }
          v2276.mulTo(v2285, v2277[v2283], v2275);
        }
        while (v2282 >= 0 && (v2270.data[v2282] & 1 << v2273) == 0) {
          v2276.sqrTo(v2275, v2285);
          v2286 = v2275;
          v2275 = v2285;
          v2285 = v2286;
          if (--v2273 < 0) {
            v2273 = this.DB - 1;
            --v2282;
          }
        }
      }
      return v2276.revert(v2275);
    }
    function v2287(v2288) {
      var v2289 = v1820;
      var v2290 = this.s < 0 ? this.negate() : this.clone();
      var v2291 = v2288.s < 0 ? v2288.negate() : v2288.clone();
      if (v2290.compareTo(v2291) < 0) {
        var v2292 = v2290;
        v2290 = v2291;
        v2291 = v2292;
      }
      var v2293 = v2290.getLowestSetBit();
      var v2294 = v2291.getLowestSetBit();
      if (v2294 < 0) {
        return v2290;
      }
      if (v2293 < v2294) {
        v2294 = v2293;
      }
      if (v2294 > 0) {
        v2290.rShiftTo(v2294, v2290);
        v2291.rShiftTo(v2294, v2291);
      }
      while (v2290.signum() > 0) {
        if ((v2293 = v2290.getLowestSetBit()) > 0) {
          v2290.rShiftTo(v2293, v2290);
        }
        if ((v2293 = v2291.getLowestSetBit()) > 0) {
          v2291.rShiftTo(v2293, v2291);
        }
        if (v2290.compareTo(v2291) >= 0) {
          v2290.subTo(v2291, v2290);
          v2290.rShiftTo(1, v2290);
        } else {
          v2291.subTo(v2290, v2291);
          v2291.rShiftTo(1, v2291);
        }
      }
      if (v2294 > 0) {
        v2291.lShiftTo(v2294, v2291);
      }
      return v2291;
    }
    function v2295(v2296) {
      if (v2296 <= 0) {
        return 0;
      }
      var v2297 = this.DV % v2296;
      var v2298 = this.s < 0 ? v2296 - 1 : 0;
      if (this.t > 0) {
        if (v2297 == 0) {
          v2298 = this.data[0] % v2296;
        } else {
          for (var v2299 = this.t - 1; v2299 >= 0; --v2299) {
            v2298 = (v2297 * v2298 + this.data[v2299]) % v2296;
          }
        }
      }
      return v2298;
    }
    function v2300(v2301) {
      var v2302 = v1820;
      if (this.signum() == 0) {
        return v1825.ZERO;
      }
      var v2303 = v2301.isEven();
      if (this.isEven() && v2303 || v2301.signum() == 0) {
        return v1825.ZERO;
      }
      var v2304 = v2301.clone();
      var v2305 = this.clone();
      var v2306 = v1884(1);
      var v2307 = v1884(0);
      var v2308 = v1884(0);
      var v2309 = v1884(1);
      while (v2304.signum() != 0) {
        while (v2304.isEven()) {
          v2304.rShiftTo(1, v2304);
          if (v2303) {
            if (!v2306.isEven() || !v2307.isEven()) {
              v2306.addTo(this, v2306);
              v2307.subTo(v2301, v2307);
            }
            v2306.rShiftTo(1, v2306);
          } else if (!v2307.isEven()) {
            v2307.subTo(v2301, v2307);
          }
          v2307.rShiftTo(1, v2307);
        }
        while (v2305.isEven()) {
          v2305.rShiftTo(1, v2305);
          if (v2303) {
            if (!v2308.isEven() || !v2309.isEven()) {
              v2308.addTo(this, v2308);
              v2309.subTo(v2301, v2309);
            }
            v2308.rShiftTo(1, v2308);
          } else if (!v2309.isEven()) {
            v2309.subTo(v2301, v2309);
          }
          v2309.rShiftTo(1, v2309);
        }
        if (v2304.compareTo(v2305) >= 0) {
          v2304.subTo(v2305, v2304);
          if (v2303) {
            v2306.subTo(v2308, v2306);
          }
          v2307.subTo(v2309, v2307);
        } else {
          v2305.subTo(v2304, v2305);
          if (v2303) {
            v2308.subTo(v2306, v2308);
          }
          v2309.subTo(v2307, v2309);
        }
      }
      if (v2305.compareTo(v1825.ONE) != 0) {
        return v1825.ZERO;
      }
      if (v2309.compareTo(v2301) >= 0) {
        return v2309.subtract(v2301);
      }
      if (v2309.signum() < 0) {
        v2309.addTo(v2301, v2309);
      } else {
        return v2309;
      }
      if (v2309.signum() < 0) {
        return v2309.add(v2301);
      } else {
        return v2309;
      }
    }
    var v2310 = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97, 101, 103, 107, 109, 113, 127, 131, 137, 139, 149, 151, 157, 163, 167, 173, 179, 181, 191, 193, 197, 199, 211, 223, 227, 229, 233, 239, 241, 251, 257, 263, 269, 271, 277, 281, 283, 293, 307, 311, 313, 317, 331, 337, 347, 349, 353, 359, 367, 373, 379, 383, 389, 397, 401, 409, 419, 421, 431, 433, 439, 443, 449, 457, 461, 463, 467, 479, 487, 491, 499, 503, 509, 521, 523, 541, 547, 557, 563, 569, 571, 577, 587, 593, 599, 601, 607, 613, 617, 619, 631, 641, 643, 647, 653, 659, 661, 673, 677, 683, 691, 701, 709, 719, 727, 733, 739, 743, 751, 757, 761, 769, 773, 787, 797, 809, 811, 821, 823, 827, 829, 839, 853, 857, 859, 863, 877, 881, 883, 887, 907, 911, 919, 929, 937, 941, 947, 953, 967, 971, 977, 983, 991, 997];
    var v2311 = 67108864 / v2310[v2310.length - 1];
    function v2312(v2313) {
      var v2314 = v1820;
      var v2315;
      var v2316 = this.abs();
      if (v2316.t == 1 && v2316.data[0] <= v2310[v2310.length - 1]) {
        for (v2315 = 0; v2315 < v2310.length; ++v2315) {
          if (v2316.data[0] == v2310[v2315]) {
            return true;
          }
        }
        return false;
      }
      if (v2316.isEven()) {
        return false;
      }
      v2315 = 1;
      while (v2315 < v2310.length) {
        var v2317 = v2310[v2315];
        var v2318 = v2315 + 1;
        while (v2318 < v2310.length && v2317 < v2311) {
          v2317 *= v2310[v2318++];
        }
        v2317 = v2316.modInt(v2317);
        while (v2315 < v2318) {
          if (v2317 % v2310[v2315++] == 0) {
            return false;
          }
        }
      }
      return v2316.millerRabin(v2313);
    }
    function v2319(v2320) {
      var v2321 = v1820;
      var v2322 = this.subtract(v1825.ONE);
      var v2323 = v2322.getLowestSetBit();
      if (v2323 <= 0) {
        return false;
      }
      var v2324 = v2322.shiftRight(v2323);
      var v2325 = v2326();
      var v2327;
      for (var v2328 = 0; v2328 < v2320; ++v2328) {
        do {
          v2327 = new v1825(this.bitLength(), v2325);
        } while (v2327.compareTo(v1825.ONE) <= 0 || v2327.compareTo(v2322) >= 0);
        var v2329 = v2327.modPow(v2324, this);
        if (v2329.compareTo(v1825.ONE) != 0 && v2329.compareTo(v2322) != 0) {
          var v2330 = 1;
          while (v2330++ < v2323 && v2329.compareTo(v2322) != 0) {
            v2329 = v2329.modPowInt(2, this);
            if (v2329.compareTo(v1825.ONE) == 0) {
              return false;
            }
          }
          if (v2329.compareTo(v2322) != 0) {
            return false;
          }
        }
      }
      return true;
    }
    function v2326() {
      return {
        nextBytes: function (v2331) {
          var v2332 = v1;
          for (var v2333 = 0; v2333 < v2331.length; ++v2333) {
            v2331[v2333] = Math.floor(Math.random() * 256);
          }
        }
      };
    }
    v1825.prototype.chunkSize = v2065;
    v1825.prototype.toRadix = v2070;
    v1825.prototype.fromRadix = v2079;
    v1825.prototype.fromNumber = v2090;
    v1825.prototype.bitwiseTo = v2112;
    v1825.prototype.changeBit = v2174;
    v1825.prototype.addTo = v2185;
    v1825.prototype.dMultiply = v2215;
    v1825.prototype.dAddOffset = v2218;
    v1825.prototype.multiplyLowerTo = v2236;
    v1825.prototype.multiplyUpperTo = v2243;
    v1825.prototype.modInt = v2295;
    v1825.prototype.millerRabin = v2319;
    v1825.prototype.clone = v2058;
    v1825.prototype.intValue = v2061;
    v1825.prototype.byteValue = v2063;
    v1825.prototype.shortValue = v2064;
    v1825.prototype.signum = v2068;
    v1825.prototype.toByteArray = v2098;
    v1825.prototype.equals = v2105;
    v1825.prototype.min = v2108;
    v1825.prototype.max = v2110;
    v1825.prototype.and = v2123;
    v1825.prototype.or = v2129;
    v1825.prototype.xor = v2136;
    v1825.prototype.andNot = v2143;
    v1825.prototype.not = v2147;
    v1825.prototype.shiftLeft = v2151;
    v1825.prototype.shiftRight = v2155;
    v1825.prototype.getLowestSetBit = v2161;
    v1825.prototype.bitCount = v2166;
    v1825.prototype.testBit = v2170;
    v1825.prototype.setBit = v2179;
    v1825.prototype.clearBit = v2181;
    v1825.prototype.flipBit = v2183;
    v1825.prototype.add = v2192;
    v1825.prototype.subtract = v2195;
    v1825.prototype.multiply = v2198;
    v1825.prototype.divide = v2205;
    v1825.prototype.remainder = v2208;
    v1825.prototype.divideAndRemainder = v2211;
    v1825.prototype.modPow = v2269;
    v1825.prototype.modInverse = v2300;
    v1825.prototype.pow = v2233;
    v1825.prototype.gcd = v2287;
    v1825.prototype.isProbablePrime = v2312;
    v1825.prototype.square = v2202;
  }
});
var require_sha1 = __commonJS({
  "node_modules/node-forge/lib/sha1.js"(v2334, v2335) {
    var v2336 = {
      dh921: 891,
      dh922: 1057,
      dh923: 1144
    };
    var v2337 = {
      dh924: 619,
      dh925: 1010
    };
    var v2338 = {
      dh926: 355,
      dh927: 1101,
      dh928: 1101,
      dh929: 764
    };
    var v2339 = {
      dh930: 393,
      dh931: 677,
      dh932: 857,
      dh933: 250
    };
    var v2340 = v2;
    var v2341 = require_forge();
    require_md();
    require_util();
    var v2342 = v2335.exports = v2341.sha1 = v2341.sha1 || {};
    v2341.md.sha1 = v2341.md.algorithms.sha1 = v2342;
    v2342.create = function () {
      var v2343 = {
        dh934: 489,
        dh935: 1061,
        dh936: 1101
      };
      var v2344 = v2340;
      if (!v2345) {
        v2346();
      }
      var v2347 = null;
      var v2348 = v2341.util.createBuffer();
      var v2349 = new Array(80);
      var v2350 = {
        algorithm: "sha1",
        blockLength: 64,
        digestLength: 20,
        messageLength: 0,
        fullMessageLength: null,
        messageLengthSize: 8
      };
      v2350.start = function () {
        var v2351 = v2344;
        v2350.messageLength = 0;
        v2350.fullMessageLength = v2350.messageLength64 = [];
        var v2352 = v2350.messageLengthSize / 4;
        for (var v2353 = 0; v2353 < v2352; ++v2353) {
          v2350.fullMessageLength.push(0);
        }
        v2348 = v2341.util.createBuffer();
        v2347 = {
          h0: 1732584193,
          h1: 4023233417,
          h2: 2562383102,
          h3: 271733878,
          h4: 3285377520
        };
        return v2350;
      };
      v2350.start();
      v2350.update = function (v2354, v2355) {
        var v2356 = v2344;
        if (v2355 === "utf8") {
          v2354 = v2341.util.encodeUtf8(v2354);
        }
        var v2357 = v2354.length;
        v2350.messageLength += v2357;
        v2357 = [v2357 / 4294967296 >>> 0, v2357 >>> 0];
        for (var v2358 = v2350.fullMessageLength.length - 1; v2358 >= 0; --v2358) {
          v2350.fullMessageLength[v2358] += v2357[1];
          v2357[1] = v2357[0] + (v2350.fullMessageLength[v2358] / 4294967296 >>> 0);
          v2350.fullMessageLength[v2358] = v2350.fullMessageLength[v2358] >>> 0;
          v2357[0] = v2357[1] / 4294967296 >>> 0;
        }
        v2348.putBytes(v2354);
        v2359(v2347, v2349, v2348);
        if (v2348.read > 2048 || v2348.length() === 0) {
          v2348.compact();
        }
        return v2350;
      };
      v2350.digest = function () {
        var v2360 = v2344;
        var v2361 = v2341.util.createBuffer();
        v2361.putBytes(v2348.bytes());
        var v2362 = v2350.fullMessageLength[v2350.fullMessageLength.length - 1] + v2350.messageLengthSize;
        var v2363 = v2362 & v2350.blockLength - 1;
        v2361.putBytes(v2364.substr(0, v2350.blockLength - v2363));
        var v2365;
        var v2366;
        var v2367 = v2350.fullMessageLength[0] * 8;
        for (var v2368 = 0; v2368 < v2350.fullMessageLength.length - 1; ++v2368) {
          v2365 = v2350.fullMessageLength[v2368 + 1] * 8;
          v2366 = v2365 / 4294967296 >>> 0;
          v2367 += v2366;
          v2361.putInt32(v2367 >>> 0);
          v2367 = v2365 >>> 0;
        }
        v2361.putInt32(v2367);
        var v2369 = {
          h0: v2347.h0,
          h1: v2347.h1,
          h2: v2347.h2,
          h3: v2347.h3,
          h4: v2347.h4
        };
        v2359(v2369, v2349, v2361);
        var v2370 = v2341.util.createBuffer();
        v2370.putInt32(v2369.h0);
        v2370.putInt32(v2369.h1);
        v2370.putInt32(v2369.h2);
        v2370.putInt32(v2369.h3);
        v2370.putInt32(v2369.h4);
        return v2370;
      };
      return v2350;
    };
    var v2364 = null;
    var v2345 = false;
    function v2346() {
      var v2371 = v2340;
      v2364 = String.fromCharCode(128);
      v2364 += v2341.util.fillString(String.fromCharCode(0), 64);
      v2345 = true;
    }
    function v2359(v2372, v2373, v2374) {
      var v2375;
      var v2376;
      var v2377;
      var v2378;
      var v2379;
      var v2380;
      var v2381;
      var v2382;
      var v2383 = v2374.length();
      while (v2383 >= 64) {
        v2376 = v2372.h0;
        v2377 = v2372.h1;
        v2378 = v2372.h2;
        v2379 = v2372.h3;
        v2380 = v2372.h4;
        for (v2382 = 0; v2382 < 16; ++v2382) {
          v2375 = v2374.getInt32();
          v2373[v2382] = v2375;
          v2381 = v2379 ^ v2377 & (v2378 ^ v2379);
          v2375 = (v2376 << 5 | v2376 >>> 27) + v2381 + v2380 + 1518500249 + v2375;
          v2380 = v2379;
          v2379 = v2378;
          v2378 = (v2377 << 30 | v2377 >>> 2) >>> 0;
          v2377 = v2376;
          v2376 = v2375;
        }
        for (; v2382 < 20; ++v2382) {
          v2375 = v2373[v2382 - 3] ^ v2373[v2382 - 8] ^ v2373[v2382 - 14] ^ v2373[v2382 - 16];
          v2375 = v2375 << 1 | v2375 >>> 31;
          v2373[v2382] = v2375;
          v2381 = v2379 ^ v2377 & (v2378 ^ v2379);
          v2375 = (v2376 << 5 | v2376 >>> 27) + v2381 + v2380 + 1518500249 + v2375;
          v2380 = v2379;
          v2379 = v2378;
          v2378 = (v2377 << 30 | v2377 >>> 2) >>> 0;
          v2377 = v2376;
          v2376 = v2375;
        }
        for (; v2382 < 32; ++v2382) {
          v2375 = v2373[v2382 - 3] ^ v2373[v2382 - 8] ^ v2373[v2382 - 14] ^ v2373[v2382 - 16];
          v2375 = v2375 << 1 | v2375 >>> 31;
          v2373[v2382] = v2375;
          v2381 = v2377 ^ v2378 ^ v2379;
          v2375 = (v2376 << 5 | v2376 >>> 27) + v2381 + v2380 + 1859775393 + v2375;
          v2380 = v2379;
          v2379 = v2378;
          v2378 = (v2377 << 30 | v2377 >>> 2) >>> 0;
          v2377 = v2376;
          v2376 = v2375;
        }
        for (; v2382 < 40; ++v2382) {
          v2375 = v2373[v2382 - 6] ^ v2373[v2382 - 16] ^ v2373[v2382 - 28] ^ v2373[v2382 - 32];
          v2375 = v2375 << 2 | v2375 >>> 30;
          v2373[v2382] = v2375;
          v2381 = v2377 ^ v2378 ^ v2379;
          v2375 = (v2376 << 5 | v2376 >>> 27) + v2381 + v2380 + 1859775393 + v2375;
          v2380 = v2379;
          v2379 = v2378;
          v2378 = (v2377 << 30 | v2377 >>> 2) >>> 0;
          v2377 = v2376;
          v2376 = v2375;
        }
        for (; v2382 < 60; ++v2382) {
          v2375 = v2373[v2382 - 6] ^ v2373[v2382 - 16] ^ v2373[v2382 - 28] ^ v2373[v2382 - 32];
          v2375 = v2375 << 2 | v2375 >>> 30;
          v2373[v2382] = v2375;
          v2381 = v2377 & v2378 | v2379 & (v2377 ^ v2378);
          v2375 = (v2376 << 5 | v2376 >>> 27) + v2381 + v2380 + 2400959708 + v2375;
          v2380 = v2379;
          v2379 = v2378;
          v2378 = (v2377 << 30 | v2377 >>> 2) >>> 0;
          v2377 = v2376;
          v2376 = v2375;
        }
        for (; v2382 < 80; ++v2382) {
          v2375 = v2373[v2382 - 6] ^ v2373[v2382 - 16] ^ v2373[v2382 - 28] ^ v2373[v2382 - 32];
          v2375 = v2375 << 2 | v2375 >>> 30;
          v2373[v2382] = v2375;
          v2381 = v2377 ^ v2378 ^ v2379;
          v2375 = (v2376 << 5 | v2376 >>> 27) + v2381 + v2380 + 3395469782 + v2375;
          v2380 = v2379;
          v2379 = v2378;
          v2378 = (v2377 << 30 | v2377 >>> 2) >>> 0;
          v2377 = v2376;
          v2376 = v2375;
        }
        v2372.h0 = v2372.h0 + v2376 | 0;
        v2372.h1 = v2372.h1 + v2377 | 0;
        v2372.h2 = v2372.h2 + v2378 | 0;
        v2372.h3 = v2372.h3 + v2379 | 0;
        v2372.h4 = v2372.h4 + v2380 | 0;
        v2383 -= 64;
      }
    }
  }
});
var require_pkcs1 = __commonJS({
  "node_modules/node-forge/lib/pkcs1.js"(v2384, v2385) {
    var v2386 = {
      dh937: 898
    };
    var v2387 = {
      dh938: 1057,
      dh939: 1195,
      dh940: 352,
      dh941: 1077,
      dh942: 1025,
      dh943: 264
    };
    var v2388 = {
      dh944: 238,
      dh945: 572,
      dh946: 660,
      dh947: 1169,
      dh948: 440,
      dh949: 1195,
      dh950: 1195,
      dh951: 446,
      dh952: 865,
      dh953: 1195,
      dh954: 1343
    };
    var v2389 = {
      dh955: 1081,
      dh956: 1169,
      dh957: 756,
      dh958: 1077,
      dh959: 1088,
      dh960: 391,
      dh961: 857,
      dh962: 1195,
      dh963: 857,
      dh964: 446
    };
    var v2390 = v2;
    var v2391 = require_forge();
    require_util();
    require_random();
    require_sha1();
    var v2392 = v2385.exports = v2391.pkcs1 = v2391.pkcs1 || {};
    v2392.encode_rsa_oaep = function (v2393, v2394, v2395) {
      var v2396 = v2390;
      var v2397;
      var v2398;
      var v2399;
      var v2400;
      if (typeof v2395 === "string") {
        v2397 = v2395;
        v2398 = arguments[3] || undefined;
        v2399 = arguments[4] || undefined;
      } else if (v2395) {
        v2397 = v2395.label || undefined;
        v2398 = v2395.seed || undefined;
        v2399 = v2395.md || undefined;
        if (v2395.mgf1 && v2395.mgf1.md) {
          v2400 = v2395.mgf1.md;
        }
      }
      if (!v2399) {
        v2399 = v2391.md.sha1.create();
      } else {
        v2399.start();
      }
      if (!v2400) {
        v2400 = v2399;
      }
      var v2401 = Math.ceil(v2393.n.bitLength() / 8);
      var v2402 = v2401 - v2399.digestLength * 2 - 2;
      if (v2394.length > v2402) {
        var v2403 = new Error("RSAES-OAEP input message length is too long.");
        v2403.length = v2394.length;
        v2403.maxLength = v2402;
        throw v2403;
      }
      if (!v2397) {
        v2397 = "";
      }
      v2399.update(v2397, "raw");
      var v2404 = v2399.digest();
      var v2405 = "";
      var v2406 = v2402 - v2394.length;
      for (var v2407 = 0; v2407 < v2406; v2407++) {
        v2405 += "\0";
      }
      var v2408 = v2404.getBytes() + v2405 + "" + v2394;
      if (!v2398) {
        v2398 = v2391.random.getBytes(v2399.digestLength);
      } else if (v2398.length !== v2399.digestLength) {
        var v2403 = new Error("Invalid RSAES-OAEP seed. The seed length must match the digest length.");
        v2403.seedLength = v2398.length;
        v2403.digestLength = v2399.digestLength;
        throw v2403;
      }
      var v2409 = v2410(v2398, v2401 - v2399.digestLength - 1, v2400);
      var v2411 = v2391.util.xorBytes(v2408, v2409, v2408.length);
      var v2412 = v2410(v2411, v2399.digestLength, v2400);
      var v2413 = v2391.util.xorBytes(v2398, v2412, v2398.length);
      return "\0" + v2413 + v2411;
    };
    v2392.decode_rsa_oaep = function (v2414, v2415, v2416) {
      var v2417 = v2390;
      var v2418;
      var v2419;
      var v2420;
      if (typeof v2416 === "string") {
        v2418 = v2416;
        v2419 = arguments[3] || undefined;
      } else if (v2416) {
        v2418 = v2416.label || undefined;
        v2419 = v2416.md || undefined;
        if (v2416.mgf1 && v2416.mgf1.md) {
          v2420 = v2416.mgf1.md;
        }
      }
      var v2421 = Math.ceil(v2414.n.bitLength() / 8);
      if (v2415.length !== v2421) {
        var v2422 = new Error("RSAES-OAEP encoded message length is invalid.");
        v2422.length = v2415.length;
        v2422.expectedLength = v2421;
        throw v2422;
      }
      if (v2419 === undefined) {
        v2419 = v2391.md.sha1.create();
      } else {
        v2419.start();
      }
      if (!v2420) {
        v2420 = v2419;
      }
      if (v2421 < v2419.digestLength * 2 + 2) {
        throw new Error("RSAES-OAEP key is too short for the hash function.");
      }
      if (!v2418) {
        v2418 = "";
      }
      v2419.update(v2418, "raw");
      var v2423 = v2419.digest().getBytes();
      var v2424 = v2415.charAt(0);
      var v2425 = v2415.substring(1, v2419.digestLength + 1);
      var v2426 = v2415.substring(1 + v2419.digestLength);
      var v2427 = v2410(v2426, v2419.digestLength, v2420);
      var v2428 = v2391.util.xorBytes(v2425, v2427, v2425.length);
      var v2429 = v2410(v2428, v2421 - v2419.digestLength - 1, v2420);
      var v2430 = v2391.util.xorBytes(v2426, v2429, v2426.length);
      var v2431 = v2430.substring(0, v2419.digestLength);
      var v2422 = v2424 !== "\0";
      for (var v2432 = 0; v2432 < v2419.digestLength; ++v2432) {
        v2422 |= v2423.charAt(v2432) !== v2431.charAt(v2432);
      }
      var v2433 = 1;
      var v2434 = v2419.digestLength;
      for (var v2435 = v2419.digestLength; v2435 < v2430.length; v2435++) {
        var v2436 = v2430.charCodeAt(v2435);
        var v2437 = v2436 & 1 ^ 1;
        var v2438 = v2433 ? 65534 : 0;
        v2422 |= v2436 & v2438;
        v2433 = v2433 & v2437;
        v2434 += v2433;
      }
      if (v2422 || v2430.charCodeAt(v2434) !== 1) {
        throw new Error("Invalid RSAES-OAEP padding.");
      }
      return v2430.substring(v2434 + 1);
    };
    function v2410(v2439, v2440, v2441) {
      var v2442 = v2390;
      if (!v2441) {
        v2441 = v2391.md.sha1.create();
      }
      var v2443 = "";
      var v2444 = Math.ceil(v2440 / v2441.digestLength);
      for (var v2445 = 0; v2445 < v2444; ++v2445) {
        var v2446 = String.fromCharCode(v2445 >> 24 & 255, v2445 >> 16 & 255, v2445 >> 8 & 255, v2445 & 255);
        v2441.start();
        v2441.update(v2439 + v2446);
        v2443 += v2441.digest().getBytes();
      }
      return v2443.substring(0, v2440);
    }
  }
});
var require_prime = __commonJS({
  "node_modules/node-forge/lib/prime.js"(v2447, v2448) {
    var v2449 = {
      dh965: 469,
      dh966: 469,
      dh967: 469,
      dh968: 485
    };
    var v2450 = {
      dh969: 334,
      dh970: 246
    };
    var v2451 = require_forge();
    require_util();
    require_jsbn();
    require_random();
    (function () {
      var v2452 = {
        dh971: 1354
      };
      var v2453 = v1;
      if (v2451.prime) {
        v2448.exports = v2451.prime;
        return;
      }
      var v2454 = v2448.exports = v2451.prime = v2451.prime || {};
      var v2455 = v2451.jsbn.BigInteger;
      var v2456 = [6, 4, 2, 4, 2, 4, 6, 2];
      var v2457 = new v2455(null);
      v2457.fromInt(30);
      function v2458(v2459, v2460) {
        return v2459 | v2460;
      }
      v2454.generateProbablePrime = function (v2461, v2462, v2463) {
        var v2464 = {
          dh972: 857
        };
        var v2465 = v2453;
        if (typeof v2462 === "function") {
          v2463 = v2462;
          v2462 = {};
        }
        v2462 = v2462 || {};
        var v2466 = v2462.algorithm || "PRIMEINC";
        if (typeof v2466 === "string") {
          v2466 = {
            name: v2466
          };
        }
        v2466.options = v2466.options || {};
        var v2467 = v2462.prng || v2451.random;
        var v2468 = {
          nextBytes: function (v2469) {
            var v2470 = v2465;
            var v2471 = v2467.getBytesSync(v2469.length);
            for (var v2472 = 0; v2472 < v2469.length; ++v2472) {
              v2469[v2472] = v2471.charCodeAt(v2472);
            }
          }
        };
        if (v2466.name === "PRIMEINC") {
          return v2473(v2461, v2468, v2466.options, v2463);
        }
        throw new Error("Invalid prime generation algorithm: " + v2466.name);
      };
      function v2473(v2474, v2475, v2476, v2477) {
        var v2478 = v2453;
        if ("workers" in v2476) {
          return v2479(v2474, v2475, v2476, v2477);
        }
        return v2480(v2474, v2475, v2476, v2477);
      }
      function v2480(v2481, v2482, v2483, v2484) {
        var v2485 = v2486(v2481, v2482);
        var v2487 = 0;
        var v2488 = v2489(v2485.bitLength());
        if ("millerRabinTests" in v2483) {
          v2488 = v2483.millerRabinTests;
        }
        var v2490 = 10;
        if ("maxBlockTime" in v2483) {
          v2490 = v2483.maxBlockTime;
        }
        v2491(v2485, v2481, v2482, v2487, v2488, v2490, v2484);
      }
      function v2491(v2492, v2493, v2494, v2495, v2496, v2497, v2498) {
        var v2499 = v2453;
        var v2500 = +new Date();
        do {
          if (v2492.bitLength() > v2493) {
            v2492 = v2486(v2493, v2494);
          }
          if (v2492.isProbablePrime(v2496)) {
            return v2498(null, v2492);
          }
          v2492.dAddOffset(v2456[v2495++ % 8], 0);
        } while (v2497 < 0 || +new Date() - v2500 < v2497);
        v2451.util.setImmediate(function () {
          v2491(v2492, v2493, v2494, v2495, v2496, v2497, v2498);
        });
      }
      function v2479(v2501, v2502, v2503, v2504) {
        var v2505 = v2453;
        if (typeof Worker === "undefined") {
          return v2480(v2501, v2502, v2503, v2504);
        }
        var v2506 = v2486(v2501, v2502);
        var v2507 = v2503.workers;
        var v2508 = v2503.workLoad || 100;
        var v2509 = v2508 * 30 / 8;
        var v2510 = v2503.workerScript || "forge/prime.worker.js";
        if (v2507 === -1) {
          return v2451.util.estimateCores(function (v2511, v2512) {
            if (v2511) {
              v2512 = 2;
            }
            v2507 = v2512 - 1;
            v2513();
          });
        }
        v2513();
        function v2513() {
          var v2514 = v2505;
          v2507 = Math.max(1, v2507);
          var v2515 = [];
          for (var v2516 = 0; v2516 < v2507; ++v2516) {
            v2515[v2516] = new Worker(v2510);
          }
          var v2517 = v2507;
          for (var v2516 = 0; v2516 < v2507; ++v2516) {
            v2515[v2516].addEventListener("message", v2518);
          }
          var v2519 = false;
          function v2518(v2520) {
            var v2521 = v2514;
            if (v2519) {
              return;
            }
            --v2517;
            var v2522 = v2520.data;
            if (v2522.found) {
              for (var v2523 = 0; v2523 < v2515.length; ++v2523) {
                v2515[v2523].terminate();
              }
              v2519 = true;
              return v2504(null, new v2455(v2522.prime, 16));
            }
            if (v2506.bitLength() > v2501) {
              v2506 = v2486(v2501, v2502);
            }
            var v2524 = v2506.toString(16);
            v2520.target.postMessage({
              hex: v2524,
              workLoad: v2508
            });
            v2506.dAddOffset(v2509, 0);
          }
        }
      }
      function v2486(v2525, v2526) {
        var v2527 = v2453;
        var v2528 = new v2455(v2525, v2526);
        var v2529 = v2525 - 1;
        if (!v2528.testBit(v2529)) {
          v2528.bitwiseTo(v2455.ONE.shiftLeft(v2529), v2458, v2528);
        }
        v2528.dAddOffset(31 - v2528.mod(v2457).byteValue(), 0);
        return v2528;
      }
      function v2489(v2530) {
        if (v2530 <= 100) {
          return 27;
        }
        if (v2530 <= 150) {
          return 18;
        }
        if (v2530 <= 200) {
          return 15;
        }
        if (v2530 <= 250) {
          return 12;
        }
        if (v2530 <= 300) {
          return 9;
        }
        if (v2530 <= 350) {
          return 8;
        }
        if (v2530 <= 400) {
          return 7;
        }
        if (v2530 <= 500) {
          return 6;
        }
        if (v2530 <= 600) {
          return 5;
        }
        if (v2530 <= 800) {
          return 4;
        }
        if (v2530 <= 1250) {
          return 3;
        }
        return 2;
      }
    })();
  }
});
var require_rsa = __commonJS({
  "node_modules/node-forge/lib/rsa.js"(v2531, v2532) {
    var v2533 = {
      dh973: 400,
      dh974: 880,
      dh975: 1027,
      dh976: 1045,
      dh977: 738,
      dh978: 1017,
      dh979: 785,
      dh980: 368,
      dh981: 738,
      dh982: 445,
      dh983: 720,
      dh984: 738,
      dh985: 1045,
      dh986: 738,
      dh987: 401,
      dh988: 293,
      dh989: 1222,
      dh990: 1027,
      dh991: 1131,
      dh992: 785,
      dh993: 233,
      dh994: 738,
      dh995: 1340,
      dh996: 421,
      dh997: 1537,
      dh998: 300,
      dh999: 1529,
      dh1000: 926,
      dh1001: 976,
      dh1002: 738,
      dh1003: 763,
      dh1004: 458,
      dh1005: 1525,
      dh1006: 480,
      dh1007: 267
    };
    var v2534 = {
      dh1008: 619
    };
    var v2535 = {
      dh1009: 661,
      dh1010: 338,
      dh1011: 725
    };
    var v2536 = {
      dh1012: 661,
      dh1013: 587
    };
    var v2537 = {
      dh1014: 1021,
      dh1015: 1423
    };
    var v2538 = {
      dh1016: 214,
      dh1017: 581,
      dh1018: 278,
      dh1019: 278
    };
    var v2539 = {
      dh1020: 985,
      dh1021: 896,
      dh1022: 1455,
      dh1023: 794
    };
    var v2540 = {
      dh1024: 1169,
      dh1025: 619,
      dh1026: 1508,
      dh1027: 1276,
      dh1028: 1276,
      dh1029: 1221
    };
    var v2541 = {
      dh1030: 619,
      dh1031: 1508,
      dh1032: 660,
      dh1033: 332,
      dh1034: 857,
      dh1035: 1354,
      dh1036: 250
    };
    var v2542 = {
      dh1037: 1045,
      dh1038: 1027,
      dh1039: 738,
      dh1040: 682
    };
    var v2543 = {
      dh1041: 1495,
      dh1042: 458,
      dh1043: 1045,
      dh1044: 259
    };
    var v2544 = {
      dh1045: 1144,
      dh1046: 1045,
      dh1047: 738,
      dh1048: 785,
      dh1049: 682,
      dh1050: 873,
      dh1051: 1025,
      dh1052: 1045,
      dh1053: 1027,
      dh1054: 1027,
      dh1055: 738,
      dh1056: 1144
    };
    var v2545 = {
      dh1057: 619,
      dh1058: 548,
      dh1059: 1508,
      dh1060: 321,
      dh1061: 1506,
      dh1062: 1508
    };
    var v2546 = {
      dh1063: 738,
      dh1064: 1027,
      dh1065: 1144,
      dh1066: 1045,
      dh1067: 1027,
      dh1068: 1358,
      dh1069: 738
    };
    var v2547 = {
      dh1070: 480
    };
    var v2548 = {
      dh1071: 1375,
      dh1072: 890,
      dh1073: 751
    };
    var v2549 = {
      dh1074: 981,
      dh1075: 890,
      dh1076: 1182,
      dh1077: 1169
    };
    var v2550 = {
      dh1078: 458,
      dh1079: 708,
      dh1080: 277,
      dh1081: 1530
    };
    var v2551 = {
      dh1082: 857,
      dh1083: 1423,
      dh1084: 1227,
      dh1085: 803,
      dh1086: 1340,
      dh1087: 283,
      dh1088: 1126,
      dh1089: 661,
      dh1090: 298,
      dh1091: 1182,
      dh1092: 878,
      dh1093: 1087,
      dh1094: 297,
      dh1095: 565,
      dh1096: 445,
      dh1097: 694
    };
    var v2552 = {
      dh1098: 985,
      dh1099: 379,
      dh1100: 1175,
      dh1101: 1378,
      dh1102: 1496,
      dh1103: 974,
      dh1104: 265,
      dh1105: 1175,
      dh1106: 1378,
      dh1107: 1169,
      dh1108: 1175,
      dh1109: 544,
      dh1110: 402,
      dh1111: 1175,
      dh1112: 1378,
      dh1113: 1378,
      dh1114: 617,
      dh1115: 1049,
      dh1116: 889,
      dh1117: 967,
      dh1118: 1317,
      dh1119: 735
    };
    var v2553 = {
      dh1120: 379
    };
    var v2554 = {
      dh1121: 1169,
      dh1122: 857,
      dh1123: 1117,
      dh1124: 321,
      dh1125: 1139,
      dh1126: 619
    };
    var v2555 = {
      dh1127: 660,
      dh1128: 619,
      dh1129: 214,
      dh1130: 1260,
      dh1131: 1025
    };
    var v2556 = {
      dh1132: 453,
      dh1133: 1146,
      dh1134: 619,
      dh1135: 1169,
      dh1136: 402,
      dh1137: 1344,
      dh1138: 1013,
      dh1139: 1317,
      dh1140: 215,
      dh1141: 1049
    };
    var v2557 = {
      dh1142: 985,
      dh1143: 1203,
      dh1144: 884,
      dh1145: 1027,
      dh1146: 1144,
      dh1147: 1027,
      dh1148: 738,
      dh1149: 738,
      dh1150: 1045
    };
    var v2558 = v2;
    var v2559 = require_forge();
    require_asn1();
    require_jsbn();
    require_oids();
    require_pkcs1();
    require_prime();
    require_random();
    require_util();
    if (typeof v2560 === "undefined") {
      v2560 = v2559.jsbn.BigInteger;
    }
    var v2560;
    var v2561 = v2559.util.isNodejs ? require_crypto() : null;
    var v2562 = v2559.asn1;
    var v2563 = v2559.util;
    v2559.pki = v2559.pki || {};
    v2532.exports = v2559.pki.rsa = v2559.rsa = v2559.rsa || {};
    var v2564 = v2559.pki;
    var v2565 = [6, 4, 2, 4, 2, 4, 6, 2];
    var v2566 = {
      name: "PrivateKeyInfo",
      tagClass: v2562.Class.UNIVERSAL,
      type: v2562.Type.SEQUENCE,
      constructed: true,
      value: [{
        name: "PrivateKeyInfo.version",
        tagClass: v2562.Class.UNIVERSAL,
        type: v2562.Type.INTEGER,
        constructed: false,
        capture: "privateKeyVersion"
      }, {
        name: "PrivateKeyInfo.privateKeyAlgorithm",
        tagClass: v2562.Class.UNIVERSAL,
        type: v2562.Type.SEQUENCE,
        constructed: true,
        value: [{
          name: "AlgorithmIdentifier.algorithm",
          tagClass: v2562.Class.UNIVERSAL,
          type: v2562.Type.OID,
          constructed: false,
          capture: "privateKeyOid"
        }]
      }, {
        name: "PrivateKeyInfo",
        tagClass: v2562.Class.UNIVERSAL,
        type: v2562.Type.OCTETSTRING,
        constructed: false,
        capture: "privateKey"
      }]
    };
    var v2567 = {
      name: "RSAPrivateKey",
      tagClass: v2562.Class.UNIVERSAL,
      type: v2562.Type.SEQUENCE,
      constructed: true,
      value: [{
        name: "RSAPrivateKey.version",
        tagClass: v2562.Class.UNIVERSAL,
        type: v2562.Type.INTEGER,
        constructed: false,
        capture: "privateKeyVersion"
      }, {
        name: "RSAPrivateKey.modulus",
        tagClass: v2562.Class.UNIVERSAL,
        type: v2562.Type.INTEGER,
        constructed: false,
        capture: "privateKeyModulus"
      }, {
        name: "RSAPrivateKey.publicExponent",
        tagClass: v2562.Class.UNIVERSAL,
        type: v2562.Type.INTEGER,
        constructed: false,
        capture: "privateKeyPublicExponent"
      }, {
        name: "RSAPrivateKey.privateExponent",
        tagClass: v2562.Class.UNIVERSAL,
        type: v2562.Type.INTEGER,
        constructed: false,
        capture: "privateKeyPrivateExponent"
      }, {
        name: "RSAPrivateKey.prime1",
        tagClass: v2562.Class.UNIVERSAL,
        type: v2562.Type.INTEGER,
        constructed: false,
        capture: "privateKeyPrime1"
      }, {
        name: "RSAPrivateKey.prime2",
        tagClass: v2562.Class.UNIVERSAL,
        type: v2562.Type.INTEGER,
        constructed: false,
        capture: "privateKeyPrime2"
      }, {
        name: "RSAPrivateKey.exponent1",
        tagClass: v2562.Class.UNIVERSAL,
        type: v2562.Type.INTEGER,
        constructed: false,
        capture: "privateKeyExponent1"
      }, {
        name: "RSAPrivateKey.exponent2",
        tagClass: v2562.Class.UNIVERSAL,
        type: v2562.Type.INTEGER,
        constructed: false,
        capture: "privateKeyExponent2"
      }, {
        name: "RSAPrivateKey.coefficient",
        tagClass: v2562.Class.UNIVERSAL,
        type: v2562.Type.INTEGER,
        constructed: false,
        capture: "privateKeyCoefficient"
      }]
    };
    var v2568 = {
      name: "RSAPublicKey",
      tagClass: v2562.Class.UNIVERSAL,
      type: v2562.Type.SEQUENCE,
      constructed: true,
      value: [{
        name: "RSAPublicKey.modulus",
        tagClass: v2562.Class.UNIVERSAL,
        type: v2562.Type.INTEGER,
        constructed: false,
        capture: "publicKeyModulus"
      }, {
        name: "RSAPublicKey.exponent",
        tagClass: v2562.Class.UNIVERSAL,
        type: v2562.Type.INTEGER,
        constructed: false,
        capture: "publicKeyExponent"
      }]
    };
    var v2569 = v2559.pki.rsa.publicKeyValidator = {
      name: "SubjectPublicKeyInfo",
      tagClass: v2562.Class.UNIVERSAL,
      type: v2562.Type.SEQUENCE,
      constructed: true,
      captureAsn1: "subjectPublicKeyInfo",
      value: [{
        name: "SubjectPublicKeyInfo.AlgorithmIdentifier",
        tagClass: v2562.Class.UNIVERSAL,
        type: v2562.Type.SEQUENCE,
        constructed: true,
        value: [{
          name: "AlgorithmIdentifier.algorithm",
          tagClass: v2562.Class.UNIVERSAL,
          type: v2562.Type.OID,
          constructed: false,
          capture: "publicKeyOid"
        }]
      }, {
        name: "SubjectPublicKeyInfo.subjectPublicKey",
        tagClass: v2562.Class.UNIVERSAL,
        type: v2562.Type.BITSTRING,
        constructed: false,
        value: [{
          name: "SubjectPublicKeyInfo.subjectPublicKey.RSAPublicKey",
          tagClass: v2562.Class.UNIVERSAL,
          type: v2562.Type.SEQUENCE,
          constructed: true,
          optional: true,
          captureAsn1: "rsaPublicKey"
        }]
      }]
    };
    var v2570 = {
      name: "DigestInfo",
      tagClass: v2562.Class.UNIVERSAL,
      type: v2562.Type.SEQUENCE,
      constructed: true,
      value: [{
        name: "DigestInfo.DigestAlgorithm",
        tagClass: v2562.Class.UNIVERSAL,
        type: v2562.Type.SEQUENCE,
        constructed: true,
        value: [{
          name: "DigestInfo.DigestAlgorithm.algorithmIdentifier",
          tagClass: v2562.Class.UNIVERSAL,
          type: v2562.Type.OID,
          constructed: false,
          capture: "algorithmIdentifier"
        }, {
          name: "DigestInfo.DigestAlgorithm.parameters",
          tagClass: v2562.Class.UNIVERSAL,
          type: v2562.Type.NULL,
          capture: "parameters",
          optional: true,
          constructed: false
        }]
      }, {
        name: "DigestInfo.digest",
        tagClass: v2562.Class.UNIVERSAL,
        type: v2562.Type.OCTETSTRING,
        constructed: false,
        capture: "digest"
      }]
    };
    function v2571(v2572) {
      var v2573 = v2558;
      var v2574;
      if (v2572.algorithm in v2564.oids) {
        v2574 = v2564.oids[v2572.algorithm];
      } else {
        var v2575 = new Error("Unknown message digest algorithm.");
        v2575.algorithm = v2572.algorithm;
        throw v2575;
      }
      var v2576 = v2562.oidToDer(v2574).getBytes();
      var v2577 = v2562.create(v2562.Class.UNIVERSAL, v2562.Type.SEQUENCE, true, []);
      var v2578 = v2562.create(v2562.Class.UNIVERSAL, v2562.Type.SEQUENCE, true, []);
      v2578.value.push(v2562.create(v2562.Class.UNIVERSAL, v2562.Type.OID, false, v2576));
      v2578.value.push(v2562.create(v2562.Class.UNIVERSAL, v2562.Type.NULL, false, ""));
      var v2579 = v2562.create(v2562.Class.UNIVERSAL, v2562.Type.OCTETSTRING, false, v2572.digest().getBytes());
      v2577.value.push(v2578);
      v2577.value.push(v2579);
      return v2562.toDer(v2577).getBytes();
    }
    function v2580(v2581, v2582, v2583) {
      var v2584 = v2558;
      if (v2583) {
        return v2581.modPow(v2582.e, v2582.n);
      }
      if (!v2582.p || !v2582.q) {
        return v2581.modPow(v2582.d, v2582.n);
      }
      if (!v2582.dP) {
        v2582.dP = v2582.d.mod(v2582.p.subtract(v2560.ONE));
      }
      if (!v2582.dQ) {
        v2582.dQ = v2582.d.mod(v2582.q.subtract(v2560.ONE));
      }
      if (!v2582.qInv) {
        v2582.qInv = v2582.q.modInverse(v2582.p);
      }
      var v2585;
      do {
        v2585 = new v2560(v2559.util.bytesToHex(v2559.random.getBytes(v2582.n.bitLength() / 8)), 16);
      } while (v2585.compareTo(v2582.n) >= 0 || !v2585.gcd(v2582.n).equals(v2560.ONE));
      v2581 = v2581.multiply(v2585.modPow(v2582.e, v2582.n)).mod(v2582.n);
      var v2586 = v2581.mod(v2582.p).modPow(v2582.dP, v2582.p);
      var v2587 = v2581.mod(v2582.q).modPow(v2582.dQ, v2582.q);
      while (v2586.compareTo(v2587) < 0) {
        v2586 = v2586.add(v2582.p);
      }
      var v2588 = v2586.subtract(v2587).multiply(v2582.qInv).mod(v2582.p).multiply(v2582.q).add(v2587);
      v2588 = v2588.multiply(v2585.modInverse(v2582.n)).mod(v2582.n);
      return v2588;
    }
    v2564.rsa.encrypt = function (v2589, v2590, v2591) {
      var v2592 = v2558;
      var v2593 = v2591;
      var v2594;
      var v2595 = Math.ceil(v2590.n.bitLength() / 8);
      if (v2591 !== false && v2591 !== true) {
        v2593 = v2591 === 2;
        v2594 = v2596(v2589, v2590, v2591);
      } else {
        v2594 = v2559.util.createBuffer();
        v2594.putBytes(v2589);
      }
      var v2597 = new v2560(v2594.toHex(), 16);
      var v2598 = v2580(v2597, v2590, v2593);
      var v2599 = v2598.toString(16);
      var v2600 = v2559.util.createBuffer();
      var v2601 = v2595 - Math.ceil(v2599.length / 2);
      while (v2601 > 0) {
        v2600.putByte(0);
        --v2601;
      }
      v2600.putBytes(v2559.util.hexToBytes(v2599));
      return v2600.getBytes();
    };
    v2564.rsa.decrypt = function (v2602, v2603, v2604, v2605) {
      var v2606 = v2558;
      var v2607 = Math.ceil(v2603.n.bitLength() / 8);
      if (v2602.length !== v2607) {
        var v2608 = new Error("Encrypted message length is invalid.");
        v2608.length = v2602.length;
        v2608.expected = v2607;
        throw v2608;
      }
      var v2609 = new v2560(v2559.util.createBuffer(v2602).toHex(), 16);
      if (v2609.compareTo(v2603.n) >= 0) {
        throw new Error("Encrypted message is invalid.");
      }
      var v2610 = v2580(v2609, v2603, v2604);
      var v2611 = v2610.toString(16);
      var v2612 = v2559.util.createBuffer();
      var v2613 = v2607 - Math.ceil(v2611.length / 2);
      while (v2613 > 0) {
        v2612.putByte(0);
        --v2613;
      }
      v2612.putBytes(v2559.util.hexToBytes(v2611));
      if (v2605 !== false) {
        return v2614(v2612.getBytes(), v2603, v2604);
      }
      return v2612.getBytes();
    };
    v2564.rsa.createKeyPairGenerationState = function (v2615, v2616, v2617) {
      var v2618 = {
        dh1151: 488
      };
      var v2619 = v2558;
      if (typeof v2615 === "string") {
        v2615 = parseInt(v2615, 10);
      }
      v2615 = v2615 || 2048;
      v2617 = v2617 || {};
      var v2620 = v2617.prng || v2559.random;
      var v2621 = {
        nextBytes: function (v2622) {
          var v2623 = v2619;
          var v2624 = v2620.getBytesSync(v2622.length);
          for (var v2625 = 0; v2625 < v2622.length; ++v2625) {
            v2622[v2625] = v2624.charCodeAt(v2625);
          }
        }
      };
      var v2626 = v2617.algorithm || "PRIMEINC";
      var v2627;
      if (v2626 === "PRIMEINC") {
        v2627 = {
          algorithm: v2626,
          state: 0,
          bits: v2615,
          rng: v2621,
          eInt: v2616 || 65537,
          e: new v2560(null),
          p: null,
          q: null,
          qBits: v2615 >> 1,
          pBits: v2615 - (v2615 >> 1),
          pqState: 0,
          num: null,
          keys: null
        };
        v2627.e.fromInt(v2627.eInt);
      } else {
        throw new Error("Invalid key generation algorithm: " + v2626);
      }
      return v2627;
    };
    v2564.rsa.stepKeyPairGenerationState = function (v2628, v2629) {
      var v2630 = v2558;
      if (!("algorithm" in v2628)) {
        v2628.algorithm = "PRIMEINC";
      }
      var v2631 = new v2560(null);
      v2631.fromInt(30);
      var v2632 = 0;
      function v2633(v2634, v2635) {
        return v2634 | v2635;
      }
      var v2636 = +new Date();
      var v2637;
      var v2638 = 0;
      while (v2628.keys === null && (v2629 <= 0 || v2638 < v2629)) {
        if (v2628.state === 0) {
          var v2639 = v2628.p === null ? v2628.pBits : v2628.qBits;
          var v2640 = v2639 - 1;
          if (v2628.pqState === 0) {
            v2628.num = new v2560(v2639, v2628.rng);
            if (!v2628.num.testBit(v2640)) {
              v2628.num.bitwiseTo(v2560.ONE.shiftLeft(v2640), v2633, v2628.num);
            }
            v2628.num.dAddOffset(31 - v2628.num.mod(v2631).byteValue(), 0);
            v2632 = 0;
            ++v2628.pqState;
          } else if (v2628.pqState === 1) {
            if (v2628.num.bitLength() > v2639) {
              v2628.pqState = 0;
            } else if (v2628.num.isProbablePrime(v2641(v2628.num.bitLength()))) {
              ++v2628.pqState;
            } else {
              v2628.num.dAddOffset(v2565[v2632++ % 8], 0);
            }
          } else if (v2628.pqState === 2) {
            v2628.pqState = v2628.num.subtract(v2560.ONE).gcd(v2628.e).compareTo(v2560.ONE) === 0 ? 3 : 0;
          } else if (v2628.pqState === 3) {
            v2628.pqState = 0;
            if (v2628.p === null) {
              v2628.p = v2628.num;
            } else {
              v2628.q = v2628.num;
            }
            if (v2628.p !== null && v2628.q !== null) {
              ++v2628.state;
            }
            v2628.num = null;
          }
        } else if (v2628.state === 1) {
          if (v2628.p.compareTo(v2628.q) < 0) {
            v2628.num = v2628.p;
            v2628.p = v2628.q;
            v2628.q = v2628.num;
          }
          ++v2628.state;
        } else if (v2628.state === 2) {
          v2628.p1 = v2628.p.subtract(v2560.ONE);
          v2628.q1 = v2628.q.subtract(v2560.ONE);
          v2628.phi = v2628.p1.multiply(v2628.q1);
          ++v2628.state;
        } else if (v2628.state === 3) {
          if (v2628.phi.gcd(v2628.e).compareTo(v2560.ONE) === 0) {
            ++v2628.state;
          } else {
            v2628.p = null;
            v2628.q = null;
            v2628.state = 0;
          }
        } else if (v2628.state === 4) {
          v2628.n = v2628.p.multiply(v2628.q);
          if (v2628.n.bitLength() === v2628.bits) {
            ++v2628.state;
          } else {
            v2628.q = null;
            v2628.state = 0;
          }
        } else if (v2628.state === 5) {
          var v2642 = v2628.e.modInverse(v2628.phi);
          v2628.keys = {
            privateKey: v2564.rsa.setPrivateKey(v2628.n, v2628.e, v2642, v2628.p, v2628.q, v2642.mod(v2628.p1), v2642.mod(v2628.q1), v2628.q.modInverse(v2628.p)),
            publicKey: v2564.rsa.setPublicKey(v2628.n, v2628.e)
          };
        }
        v2637 = +new Date();
        v2638 += v2637 - v2636;
        v2636 = v2637;
      }
      return v2628.keys !== null;
    };
    v2564.rsa.generateKeyPair = function (v2643, v2644, v2645, v2646) {
      var v2647 = {
        dh1152: 960,
        dh1153: 1069,
        dh1154: 445
      };
      var v2648 = {
        dh1155: 1069
      };
      var v2649 = {
        dh1156: 1153
      };
      var v2650 = v2558;
      if (arguments.length === 1) {
        if (typeof v2643 === "object") {
          v2645 = v2643;
          v2643 = undefined;
        } else if (typeof v2643 === "function") {
          v2646 = v2643;
          v2643 = undefined;
        }
      } else if (arguments.length === 2) {
        if (typeof v2643 === "number") {
          if (typeof v2644 === "function") {
            v2646 = v2644;
            v2644 = undefined;
          } else if (typeof v2644 !== "number") {
            v2645 = v2644;
            v2644 = undefined;
          }
        } else {
          v2645 = v2643;
          v2646 = v2644;
          v2643 = undefined;
          v2644 = undefined;
        }
      } else if (arguments.length === 3) {
        if (typeof v2644 === "number") {
          if (typeof v2645 === "function") {
            v2646 = v2645;
            v2645 = undefined;
          }
        } else {
          v2646 = v2645;
          v2645 = v2644;
          v2644 = undefined;
        }
      }
      v2645 = v2645 || {};
      if (v2643 === undefined) {
        v2643 = v2645.bits || 2048;
      }
      if (v2644 === undefined) {
        v2644 = v2645.e || 65537;
      }
      if (!v2559.options.usePureJavaScript && !v2645.prng && v2643 >= 256 && v2643 <= 16384 && (v2644 === 65537 || v2644 === 3)) {
        if (v2646) {
          if (v2651("generateKeyPair")) {
            return v2561.generateKeyPair("rsa", {
              modulusLength: v2643,
              publicExponent: v2644,
              publicKeyEncoding: {
                type: "spki",
                format: "pem"
              },
              privateKeyEncoding: {
                type: "pkcs8",
                format: "pem"
              }
            }, function (v2652, v2653, v2654) {
              var v2655 = v2650;
              if (v2652) {
                return v2646(v2652);
              }
              v2646(null, {
                privateKey: v2564.privateKeyFromPem(v2654),
                publicKey: v2564.publicKeyFromPem(v2653)
              });
            });
          }
          if (v2656("generateKey") && v2656("exportKey")) {
            return v2563.globalScope.crypto.subtle.generateKey({
              name: "RSASSA-PKCS1-v1_5",
              modulusLength: v2643,
              publicExponent: v2657(v2644),
              hash: {
                name: "SHA-256"
              }
            }, true, ["sign", "verify"]).then(function (v2658) {
              var v2659 = v2650;
              return v2563.globalScope.crypto.subtle.exportKey("pkcs8", v2658.privateKey);
            }).then(undefined, function (v2660) {
              v2646(v2660);
            }).then(function (v2661) {
              var v2662 = v2650;
              if (v2661) {
                var v2663 = v2564.privateKeyFromAsn1(v2562.fromDer(v2559.util.createBuffer(v2661)));
                v2646(null, {
                  privateKey: v2663,
                  publicKey: v2564.setRsaPublicKey(v2663.n, v2663.e)
                });
              }
            });
          }
          if (v2664("generateKey") && v2664("exportKey")) {
            var v2665 = v2563.globalScope.msCrypto.subtle.generateKey({
              name: "RSASSA-PKCS1-v1_5",
              modulusLength: v2643,
              publicExponent: v2657(v2644),
              hash: {
                name: "SHA-256"
              }
            }, true, ["sign", "verify"]);
            v2665.oncomplete = function (v2666) {
              var v2667 = v2650;
              var v2668 = v2666.target.result;
              var v2669 = v2563.globalScope.msCrypto.subtle.exportKey("pkcs8", v2668.privateKey);
              v2669.oncomplete = function (v2670) {
                var v2671 = v2667;
                var v2672 = v2670.target.result;
                var v2673 = v2564.privateKeyFromAsn1(v2562.fromDer(v2559.util.createBuffer(v2672)));
                v2646(null, {
                  privateKey: v2673,
                  publicKey: v2564.setRsaPublicKey(v2673.n, v2673.e)
                });
              };
              v2669.onerror = function (v2674) {
                v2646(v2674);
              };
            };
            v2665.onerror = function (v2675) {
              v2646(v2675);
            };
            return;
          }
        } else if (v2651("generateKeyPairSync")) {
          var v2676 = v2561.generateKeyPairSync("rsa", {
            modulusLength: v2643,
            publicExponent: v2644,
            publicKeyEncoding: {
              type: "spki",
              format: "pem"
            },
            privateKeyEncoding: {
              type: "pkcs8",
              format: "pem"
            }
          });
          return {
            privateKey: v2564.privateKeyFromPem(v2676.privateKey),
            publicKey: v2564.publicKeyFromPem(v2676.publicKey)
          };
        }
      }
      var v2677 = v2564.rsa.createKeyPairGenerationState(v2643, v2644, v2645);
      if (!v2646) {
        v2564.rsa.stepKeyPairGenerationState(v2677, 0);
        return v2677.keys;
      }
      v2678(v2677, v2645, v2646);
    };
    v2564.setRsaPublicKey = v2564.rsa.setPublicKey = function (v2679, v2680) {
      var v2681 = {
        n: v2679,
        e: v2680
      };
      v2681.encrypt = function (v2682, v2683, v2684) {
        var v2685 = v1;
        if (typeof v2683 === "string") {
          v2683 = v2683.toUpperCase();
        } else if (v2683 === undefined) {
          v2683 = "RSAES-PKCS1-V1_5";
        }
        if (v2683 === "RSAES-PKCS1-V1_5") {
          v2683 = {
            encode: function (v2686, v2687, v2688) {
              return v2596(v2686, v2687, 2).getBytes();
            }
          };
        } else if (v2683 === "RSA-OAEP" || v2683 === "RSAES-OAEP") {
          v2683 = {
            encode: function (v2689, v2690) {
              return v2559.pkcs1.encode_rsa_oaep(v2690, v2689, v2684);
            }
          };
        } else if (["RAW", "NONE", "NULL", null].indexOf(v2683) !== -1) {
          v2683 = {
            encode: function (v2691) {
              return v2691;
            }
          };
        } else if (typeof v2683 === "string") {
          throw new Error("Unsupported encryption scheme: \"" + v2683 + "\".");
        }
        var v2692 = v2683.encode(v2682, v2681, true);
        return v2564.rsa.encrypt(v2692, v2681, true);
      };
      v2681.verify = function (v2693, v2694, v2695, v2696) {
        var v2697 = {
          dh1157: 411,
          dh1158: 1358,
          dh1159: 1040,
          dh1160: 812,
          dh1161: 482
        };
        var v2698 = v1;
        if (typeof v2695 === "string") {
          v2695 = v2695.toUpperCase();
        } else if (v2695 === undefined) {
          v2695 = "RSASSA-PKCS1-V1_5";
        }
        if (v2696 === undefined) {
          v2696 = {
            _parseAllDigestBytes: true,
            _skipPaddingChecks: false
          };
        }
        if (!("_parseAllDigestBytes" in v2696)) {
          v2696._parseAllDigestBytes = true;
        }
        if (!("_skipPaddingChecks" in v2696)) {
          v2696._skipPaddingChecks = false;
        }
        if (v2695 === "RSASSA-PKCS1-V1_5") {
          v2695 = {
            verify: function (v2699, v2700) {
              var v2701 = v2698;
              v2700 = v2614(v2700, v2681, true, undefined, v2696);
              var v2702 = v2562.fromDer(v2700, {
                parseAllBytes: v2696._parseAllDigestBytes
              });
              var v2703 = {};
              var v2704 = [];
              if (!v2562.validate(v2702, v2570, v2703, v2704) || v2702.value.length !== 2) {
                var v2705 = new Error("ASN.1 object does not contain a valid RSASSA-PKCS1-v1_5 DigestInfo value.");
                v2705.errors = v2704;
                throw v2705;
              }
              var v2706 = v2562.derToOid(v2703.algorithmIdentifier);
              if (v2706 !== v2559.oids.md2 && v2706 !== v2559.oids.md5 && v2706 !== v2559.oids.sha1 && v2706 !== v2559.oids.sha224 && v2706 !== v2559.oids.sha256 && v2706 !== v2559.oids.sha384 && v2706 !== v2559.oids.sha512 && v2706 !== v2559.oids["sha512-224"] && v2706 !== v2559.oids["sha512-256"]) {
                var v2705 = new Error("Unknown RSASSA-PKCS1-v1_5 DigestAlgorithm identifier.");
                v2705.oid = v2706;
                throw v2705;
              }
              if (v2706 === v2559.oids.md2 || v2706 === v2559.oids.md5) {
                if (!("parameters" in v2703)) {
                  throw new Error("ASN.1 object does not contain a valid RSASSA-PKCS1-v1_5 DigestInfo value. Missing algorithm identifier NULL parameters.");
                }
              }
              return v2699 === v2703.digest;
            }
          };
        } else if (v2695 === "NONE" || v2695 === "NULL" || v2695 === null) {
          v2695 = {
            verify: function (v2707, v2708) {
              v2708 = v2614(v2708, v2681, true, undefined, v2696);
              return v2707 === v2708;
            }
          };
        }
        var v2709 = v2564.rsa.decrypt(v2694, v2681, true, false);
        return v2695.verify(v2693, v2709, v2681.n.bitLength());
      };
      return v2681;
    };
    v2564.setRsaPrivateKey = v2564.rsa.setPrivateKey = function (v2710, v2711, v2712, v2713, v2714, v2715, v2716, v2717) {
      var v2718 = {
        dh1162: 458,
        dh1163: 1530
      };
      var v2719 = {
        dh1164: 898,
        dh1165: 377
      };
      var v2720 = v2558;
      var v2721 = {
        n: v2710,
        e: v2711,
        d: v2712,
        p: v2713,
        q: v2714,
        dP: v2715,
        dQ: v2716,
        qInv: v2717
      };
      v2721.decrypt = function (v2722, v2723, v2724) {
        var v2725 = v2720;
        if (typeof v2723 === "string") {
          v2723 = v2723.toUpperCase();
        } else if (v2723 === undefined) {
          v2723 = "RSAES-PKCS1-V1_5";
        }
        var v2726 = v2564.rsa.decrypt(v2722, v2721, false, false);
        if (v2723 === "RSAES-PKCS1-V1_5") {
          v2723 = {
            decode: v2614
          };
        } else if (v2723 === "RSA-OAEP" || v2723 === "RSAES-OAEP") {
          v2723 = {
            decode: function (v2727, v2728) {
              var v2729 = v2725;
              return v2559.pkcs1.decode_rsa_oaep(v2728, v2727, v2724);
            }
          };
        } else if (["RAW", "NONE", "NULL", null].indexOf(v2723) !== -1) {
          v2723 = {
            decode: function (v2730) {
              return v2730;
            }
          };
        } else {
          throw new Error("Unsupported encryption scheme: \"" + v2723 + "\".");
        }
        return v2723.decode(v2726, v2721, false);
      };
      v2721.sign = function (v2731, v2732) {
        var v2733 = v2720;
        var v2734 = false;
        if (typeof v2732 === "string") {
          v2732 = v2732.toUpperCase();
        }
        if (v2732 === undefined || v2732 === "RSASSA-PKCS1-V1_5") {
          v2732 = {
            encode: v2571
          };
          v2734 = 1;
        } else if (v2732 === "NONE" || v2732 === "NULL" || v2732 === null) {
          v2732 = {
            encode: function () {
              return v2731;
            }
          };
          v2734 = 1;
        }
        var v2735 = v2732.encode(v2731, v2721.n.bitLength());
        return v2564.rsa.encrypt(v2735, v2721, v2734);
      };
      return v2721;
    };
    v2564.wrapRsaPrivateKey = function (v2736) {
      var v2737 = v2558;
      return v2562.create(v2562.Class.UNIVERSAL, v2562.Type.SEQUENCE, true, [v2562.create(v2562.Class.UNIVERSAL, v2562.Type.INTEGER, false, v2562.integerToDer(0).getBytes()), v2562.create(v2562.Class.UNIVERSAL, v2562.Type.SEQUENCE, true, [v2562.create(v2562.Class.UNIVERSAL, v2562.Type.OID, false, v2562.oidToDer(v2564.oids.rsaEncryption).getBytes()), v2562.create(v2562.Class.UNIVERSAL, v2562.Type.NULL, false, "")]), v2562.create(v2562.Class.UNIVERSAL, v2562.Type.OCTETSTRING, false, v2562.toDer(v2736).getBytes())]);
    };
    v2564.privateKeyFromAsn1 = function (v2738) {
      var v2739 = v2558;
      var v2740 = {};
      var v2741 = [];
      if (v2562.validate(v2738, v2566, v2740, v2741)) {
        v2738 = v2562.fromDer(v2559.util.createBuffer(v2740.privateKey));
      }
      v2740 = {};
      v2741 = [];
      if (!v2562.validate(v2738, v2567, v2740, v2741)) {
        var v2742 = new Error("Cannot read private key. ASN.1 object does not contain an RSAPrivateKey.");
        v2742.errors = v2741;
        throw v2742;
      }
      var v2743;
      var v2744;
      var v2745;
      var v2746;
      var v2747;
      var v2748;
      var v2749;
      var v2750;
      v2743 = v2559.util.createBuffer(v2740.privateKeyModulus).toHex();
      v2744 = v2559.util.createBuffer(v2740.privateKeyPublicExponent).toHex();
      v2745 = v2559.util.createBuffer(v2740.privateKeyPrivateExponent).toHex();
      v2746 = v2559.util.createBuffer(v2740.privateKeyPrime1).toHex();
      v2747 = v2559.util.createBuffer(v2740.privateKeyPrime2).toHex();
      v2748 = v2559.util.createBuffer(v2740.privateKeyExponent1).toHex();
      v2749 = v2559.util.createBuffer(v2740.privateKeyExponent2).toHex();
      v2750 = v2559.util.createBuffer(v2740.privateKeyCoefficient).toHex();
      return v2564.setRsaPrivateKey(new v2560(v2743, 16), new v2560(v2744, 16), new v2560(v2745, 16), new v2560(v2746, 16), new v2560(v2747, 16), new v2560(v2748, 16), new v2560(v2749, 16), new v2560(v2750, 16));
    };
    v2564.privateKeyToAsn1 = v2564.privateKeyToRSAPrivateKey = function (v2751) {
      var v2752 = v2558;
      return v2562.create(v2562.Class.UNIVERSAL, v2562.Type.SEQUENCE, true, [v2562.create(v2562.Class.UNIVERSAL, v2562.Type.INTEGER, false, v2562.integerToDer(0).getBytes()), v2562.create(v2562.Class.UNIVERSAL, v2562.Type.INTEGER, false, v2753(v2751.n)), v2562.create(v2562.Class.UNIVERSAL, v2562.Type.INTEGER, false, v2753(v2751.e)), v2562.create(v2562.Class.UNIVERSAL, v2562.Type.INTEGER, false, v2753(v2751.d)), v2562.create(v2562.Class.UNIVERSAL, v2562.Type.INTEGER, false, v2753(v2751.p)), v2562.create(v2562.Class.UNIVERSAL, v2562.Type.INTEGER, false, v2753(v2751.q)), v2562.create(v2562.Class.UNIVERSAL, v2562.Type.INTEGER, false, v2753(v2751.dP)), v2562.create(v2562.Class.UNIVERSAL, v2562.Type.INTEGER, false, v2753(v2751.dQ)), v2562.create(v2562.Class.UNIVERSAL, v2562.Type.INTEGER, false, v2753(v2751.qInv))]);
    };
    v2564.publicKeyFromAsn1 = function (v2754) {
      var v2755 = v2558;
      var v2756 = {};
      var v2757 = [];
      if (v2562.validate(v2754, v2569, v2756, v2757)) {
        var v2758 = v2562.derToOid(v2756.publicKeyOid);
        if (v2758 !== v2564.oids.rsaEncryption) {
          var v2759 = new Error("Cannot read public key. Unknown OID.");
          v2759.oid = v2758;
          throw v2759;
        }
        v2754 = v2756.rsaPublicKey;
      }
      v2757 = [];
      if (!v2562.validate(v2754, v2568, v2756, v2757)) {
        var v2759 = new Error("Cannot read public key. ASN.1 object does not contain an RSAPublicKey.");
        v2759.errors = v2757;
        throw v2759;
      }
      var v2760 = v2559.util.createBuffer(v2756.publicKeyModulus).toHex();
      var v2761 = v2559.util.createBuffer(v2756.publicKeyExponent).toHex();
      return v2564.setRsaPublicKey(new v2560(v2760, 16), new v2560(v2761, 16));
    };
    v2564.publicKeyToAsn1 = v2564.publicKeyToSubjectPublicKeyInfo = function (v2762) {
      var v2763 = v2558;
      return v2562.create(v2562.Class.UNIVERSAL, v2562.Type.SEQUENCE, true, [v2562.create(v2562.Class.UNIVERSAL, v2562.Type.SEQUENCE, true, [v2562.create(v2562.Class.UNIVERSAL, v2562.Type.OID, false, v2562.oidToDer(v2564.oids.rsaEncryption).getBytes()), v2562.create(v2562.Class.UNIVERSAL, v2562.Type.NULL, false, "")]), v2562.create(v2562.Class.UNIVERSAL, v2562.Type.BITSTRING, false, [v2564.publicKeyToRSAPublicKey(v2762)])]);
    };
    v2564.publicKeyToRSAPublicKey = function (v2764) {
      var v2765 = v2558;
      return v2562.create(v2562.Class.UNIVERSAL, v2562.Type.SEQUENCE, true, [v2562.create(v2562.Class.UNIVERSAL, v2562.Type.INTEGER, false, v2753(v2764.n)), v2562.create(v2562.Class.UNIVERSAL, v2562.Type.INTEGER, false, v2753(v2764.e))]);
    };
    function v2596(v2766, v2767, v2768) {
      var v2769 = v2558;
      var v2770 = v2559.util.createBuffer();
      var v2771 = Math.ceil(v2767.n.bitLength() / 8);
      if (v2766.length > v2771 - 11) {
        var v2772 = new Error("Message is too long for PKCS#1 v1.5 padding.");
        v2772.length = v2766.length;
        v2772.max = v2771 - 11;
        throw v2772;
      }
      v2770.putByte(0);
      v2770.putByte(v2768);
      var v2773 = v2771 - 3 - v2766.length;
      var v2774;
      if (v2768 === 0 || v2768 === 1) {
        v2774 = v2768 === 0 ? 0 : 255;
        for (var v2775 = 0; v2775 < v2773; ++v2775) {
          v2770.putByte(v2774);
        }
      } else {
        while (v2773 > 0) {
          var v2776 = 0;
          var v2777 = v2559.random.getBytes(v2773);
          for (var v2775 = 0; v2775 < v2773; ++v2775) {
            v2774 = v2777.charCodeAt(v2775);
            if (v2774 === 0) {
              ++v2776;
            } else {
              v2770.putByte(v2774);
            }
          }
          v2773 = v2776;
        }
      }
      v2770.putByte(0);
      v2770.putBytes(v2766);
      return v2770;
    }
    function v2614(v2778, v2779, v2780, v2781, v2782) {
      var v2783 = v2558;
      var v2784 = Math.ceil(v2779.n.bitLength() / 8);
      var v2785 = v2559.util.createBuffer(v2778);
      var v2786 = v2785.getByte();
      var v2787 = v2785.getByte();
      if (v2786 !== 0 || v2780 && v2787 !== 0 && v2787 !== 1 || !v2780 && v2787 !== 2 || v2780 && v2787 === 0 && typeof v2781 === "undefined") {
        throw new Error("Encryption block is invalid.");
      }
      var v2788 = 0;
      if (v2787 === 0) {
        v2788 = v2784 - 3 - v2781;
        for (var v2789 = 0; v2789 < v2788; ++v2789) {
          if (v2785.getByte() !== 0) {
            throw new Error("Encryption block is invalid.");
          }
        }
      } else if (v2787 === 1) {
        v2788 = 0;
        while (v2785.length() > 1) {
          if (v2785.getByte() !== 255) {
            --v2785.read;
            break;
          }
          ++v2788;
        }
        if (v2788 < 8 && !(v2782 ? v2782._skipPaddingChecks : false)) {
          throw new Error("Encryption block is invalid.");
        }
      } else if (v2787 === 2) {
        v2788 = 0;
        while (v2785.length() > 1) {
          if (v2785.getByte() === 0) {
            --v2785.read;
            break;
          }
          ++v2788;
        }
        if (v2788 < 8 && !(v2782 ? v2782._skipPaddingChecks : false)) {
          throw new Error("Encryption block is invalid.");
        }
      }
      var v2790 = v2785.getByte();
      if (v2790 !== 0 || v2788 !== v2784 - 3 - v2785.length()) {
        throw new Error("Encryption block is invalid.");
      }
      return v2785.getBytes();
    }
    function v2678(v2791, v2792, v2793) {
      var v2794 = {
        dh1166: 402,
        dh1167: 1146,
        dh1168: 974,
        dh1169: 1344,
        dh1170: 402,
        dh1171: 1044,
        dh1172: 1443,
        dh1173: 967
      };
      var v2795 = v2558;
      if (typeof v2792 === "function") {
        v2793 = v2792;
        v2792 = {};
      }
      v2792 = v2792 || {};
      var v2796 = {
        algorithm: {
          name: v2792.algorithm || "PRIMEINC",
          options: {
            workers: v2792.workers || 2,
            workLoad: v2792.workLoad || 100,
            workerScript: v2792.workerScript
          }
        }
      };
      if ("prng" in v2792) {
        v2796.prng = v2792.prng;
      }
      v2797();
      function v2797() {
        v2798(v2791.pBits, function (v2799, v2800) {
          if (v2799) {
            return v2793(v2799);
          }
          v2791.p = v2800;
          if (v2791.q !== null) {
            return v2801(v2799, v2791.q);
          }
          v2798(v2791.qBits, v2801);
        });
      }
      function v2798(v2802, v2803) {
        var v2804 = v2795;
        v2559.prime.generateProbablePrime(v2802, v2796, v2803);
      }
      function v2801(v2805, v2806) {
        var v2807 = v2795;
        if (v2805) {
          return v2793(v2805);
        }
        v2791.q = v2806;
        if (v2791.p.compareTo(v2791.q) < 0) {
          var v2808 = v2791.p;
          v2791.p = v2791.q;
          v2791.q = v2808;
        }
        if (v2791.p.subtract(v2560.ONE).gcd(v2791.e).compareTo(v2560.ONE) !== 0) {
          v2791.p = null;
          v2797();
          return;
        }
        if (v2791.q.subtract(v2560.ONE).gcd(v2791.e).compareTo(v2560.ONE) !== 0) {
          v2791.q = null;
          v2798(v2791.qBits, v2801);
          return;
        }
        v2791.p1 = v2791.p.subtract(v2560.ONE);
        v2791.q1 = v2791.q.subtract(v2560.ONE);
        v2791.phi = v2791.p1.multiply(v2791.q1);
        if (v2791.phi.gcd(v2791.e).compareTo(v2560.ONE) !== 0) {
          v2791.p = v2791.q = null;
          v2797();
          return;
        }
        v2791.n = v2791.p.multiply(v2791.q);
        if (v2791.n.bitLength() !== v2791.bits) {
          v2791.q = null;
          v2798(v2791.qBits, v2801);
          return;
        }
        var v2809 = v2791.e.modInverse(v2791.phi);
        v2791.keys = {
          privateKey: v2564.rsa.setPrivateKey(v2791.n, v2791.e, v2809, v2791.p, v2791.q, v2809.mod(v2791.p1), v2809.mod(v2791.q1), v2791.q.modInverse(v2791.p)),
          publicKey: v2564.rsa.setPublicKey(v2791.n, v2791.e)
        };
        v2793(null, v2791.keys);
      }
    }
    function v2753(v2810) {
      var v2811 = v2558;
      var v2812 = v2810.toString(16);
      if (v2812[0] >= "8") {
        v2812 = "00" + v2812;
      }
      var v2813 = v2559.util.hexToBytes(v2812);
      if (v2813.length > 1 && (v2813.charCodeAt(0) === 0 && (v2813.charCodeAt(1) & 128) === 0 || v2813.charCodeAt(0) === 255 && (v2813.charCodeAt(1) & 128) === 128)) {
        return v2813.substr(1);
      }
      return v2813;
    }
    function v2641(v2814) {
      if (v2814 <= 100) {
        return 27;
      }
      if (v2814 <= 150) {
        return 18;
      }
      if (v2814 <= 200) {
        return 15;
      }
      if (v2814 <= 250) {
        return 12;
      }
      if (v2814 <= 300) {
        return 9;
      }
      if (v2814 <= 350) {
        return 8;
      }
      if (v2814 <= 400) {
        return 7;
      }
      if (v2814 <= 500) {
        return 6;
      }
      if (v2814 <= 600) {
        return 5;
      }
      if (v2814 <= 800) {
        return 4;
      }
      if (v2814 <= 1250) {
        return 3;
      }
      return 2;
    }
    function v2651(v2815) {
      var v2816 = v2558;
      return v2559.util.isNodejs && typeof v2561[v2815] === "function";
    }
    function v2656(v2817) {
      var v2818 = v2558;
      return typeof v2563.globalScope !== "undefined" && typeof v2563.globalScope.crypto === "object" && typeof v2563.globalScope.crypto.subtle === "object" && typeof v2563.globalScope.crypto.subtle[v2817] === "function";
    }
    function v2664(v2819) {
      var v2820 = v2558;
      return typeof v2563.globalScope !== "undefined" && typeof v2563.globalScope.msCrypto === "object" && typeof v2563.globalScope.msCrypto.subtle === "object" && typeof v2563.globalScope.msCrypto.subtle[v2819] === "function";
    }
    function v2657(v2821) {
      var v2822 = v2558;
      var v2823 = v2559.util.hexToBytes(v2821.toString(16));
      var v2824 = new Uint8Array(v2823.length);
      for (var v2825 = 0; v2825 < v2823.length; ++v2825) {
        v2824[v2825] = v2823.charCodeAt(v2825);
      }
      return v2824;
    }
  }
});
var require_pbe = __commonJS({
  "node_modules/node-forge/lib/pbe.js"(v2826, v2827) {
    var v2828 = {
      dh1174: 577,
      dh1175: 235,
      dh1176: 632,
      dh1177: 1358,
      dh1178: 1103,
      dh1179: 738,
      dh1180: 1027,
      dh1181: 1045,
      dh1182: 738,
      dh1183: 1027,
      dh1184: 1045,
      dh1185: 785,
      dh1186: 738,
      dh1187: 483,
      dh1188: 738,
      dh1189: 1045,
      dh1190: 1027,
      dh1191: 426,
      dh1192: 1045,
      dh1193: 682,
      dh1194: 1045,
      dh1195: 738,
      dh1196: 475,
      dh1197: 285,
      dh1198: 1210,
      dh1199: 1165,
      dh1200: 280,
      dh1201: 738,
      dh1202: 518,
      dh1203: 513,
      dh1204: 373
    };
    var v2829 = {
      dh1205: 1045,
      dh1206: 738,
      dh1207: 1210,
      dh1208: 1045,
      dh1209: 531,
      dh1210: 738,
      dh1211: 682,
      dh1212: 619,
      dh1213: 581,
      dh1214: 1027,
      dh1215: 1045,
      dh1216: 738,
      dh1217: 1027,
      dh1218: 884,
      dh1219: 1025,
      dh1220: 1144,
      dh1221: 458
    };
    var v2830 = {
      dh1222: 731,
      dh1223: 220,
      dh1224: 486
    };
    var v2831 = {
      dh1225: 1500
    };
    var v2832 = {
      dh1226: 430,
      dh1227: 1486
    };
    var v2833 = {
      dh1228: 353,
      dh1229: 1091,
      dh1230: 1358,
      dh1231: 665,
      dh1232: 1015,
      dh1233: 632
    };
    var v2834 = {
      dh1234: 1063
    };
    var v2835 = {
      dh1235: 1096,
      dh1236: 1308,
      dh1237: 983,
      dh1238: 691,
      dh1239: 983,
      dh1240: 387,
      dh1241: 1358,
      dh1242: 1500,
      dh1243: 1454,
      dh1244: 1508,
      dh1245: 432,
      dh1246: 1063,
      dh1247: 931
    };
    var v2836 = {
      dh1248: 1358,
      dh1249: 1287,
      dh1250: 681
    };
    var v2837 = {
      dh1251: 1057,
      dh1252: 1144,
      dh1253: 355,
      dh1254: 900,
      dh1255: 205,
      dh1256: 857,
      dh1257: 1373,
      dh1258: 900,
      dh1259: 352,
      dh1260: 1025,
      dh1261: 1077,
      dh1262: 660,
      dh1263: 857,
      dh1264: 1206
    };
    var v2838 = {
      dh1265: 384,
      dh1266: 597,
      dh1267: 726,
      dh1268: 1248,
      dh1269: 472,
      dh1270: 509,
      dh1271: 985,
      dh1272: 619,
      dh1273: 875,
      dh1274: 1025,
      dh1275: 1409,
      dh1276: 1379,
      dh1277: 1143,
      dh1278: 1143
    };
    var v2839 = {
      dh1279: 415,
      dh1280: 1531,
      dh1281: 1039,
      dh1282: 1088,
      dh1283: 1441,
      dh1284: 778,
      dh1285: 936,
      dh1286: 313,
      dh1287: 1209
    };
    var v2840 = {
      dh1288: 384,
      dh1289: 594,
      dh1290: 1546,
      dh1291: 1409
    };
    var v2841 = {
      dh1292: 1025,
      dh1293: 297
    };
    var v2842 = {
      dh1294: 548,
      dh1295: 887,
      dh1296: 1159,
      dh1297: 352,
      dh1298: 1143,
      dh1299: 623
    };
    var v2843 = {
      dh1300: 1229,
      dh1301: 1531,
      dh1302: 1095,
      dh1303: 653,
      dh1304: 1229,
      dh1305: 873,
      dh1306: 985,
      dh1307: 778,
      dh1308: 1039,
      dh1309: 472,
      dh1310: 985,
      dh1311: 1415,
      dh1312: 1375,
      dh1313: 948,
      dh1314: 352,
      dh1315: 1495,
      dh1316: 1025,
      dh1317: 1144,
      dh1318: 1045,
      dh1319: 785,
      dh1320: 1045,
      dh1321: 884,
      dh1322: 1025,
      dh1323: 1045,
      dh1324: 1144,
      dh1325: 1027,
      dh1326: 1025,
      dh1327: 1438,
      dh1328: 1027,
      dh1329: 1045,
      dh1330: 1025,
      dh1331: 785,
      dh1332: 738,
      dh1333: 1027
    };
    var v2844 = v2;
    var v2845 = require_forge();
    require_aes();
    require_asn1();
    require_des();
    require_md();
    require_oids();
    require_pbkdf2();
    require_pem();
    require_random();
    require_rc2();
    require_rsa();
    require_util();
    if (typeof v2846 === "undefined") {
      v2846 = v2845.jsbn.BigInteger;
    }
    var v2846;
    var v2847 = v2845.asn1;
    var v2848 = v2845.pki = v2845.pki || {};
    v2827.exports = v2848.pbe = v2845.pbe = v2845.pbe || {};
    var v2849 = v2848.oids;
    var v2850 = {
      name: "EncryptedPrivateKeyInfo",
      tagClass: v2847.Class.UNIVERSAL,
      type: v2847.Type.SEQUENCE,
      constructed: true,
      value: [{
        name: "EncryptedPrivateKeyInfo.encryptionAlgorithm",
        tagClass: v2847.Class.UNIVERSAL,
        type: v2847.Type.SEQUENCE,
        constructed: true,
        value: [{
          name: "AlgorithmIdentifier.algorithm",
          tagClass: v2847.Class.UNIVERSAL,
          type: v2847.Type.OID,
          constructed: false,
          capture: "encryptionOid"
        }, {
          name: "AlgorithmIdentifier.parameters",
          tagClass: v2847.Class.UNIVERSAL,
          type: v2847.Type.SEQUENCE,
          constructed: true,
          captureAsn1: "encryptionParams"
        }]
      }, {
        name: "EncryptedPrivateKeyInfo.encryptedData",
        tagClass: v2847.Class.UNIVERSAL,
        type: v2847.Type.OCTETSTRING,
        constructed: false,
        capture: "encryptedData"
      }]
    };
    var v2851 = {
      name: "PBES2Algorithms",
      tagClass: v2847.Class.UNIVERSAL,
      type: v2847.Type.SEQUENCE,
      constructed: true,
      value: [{
        name: "PBES2Algorithms.keyDerivationFunc",
        tagClass: v2847.Class.UNIVERSAL,
        type: v2847.Type.SEQUENCE,
        constructed: true,
        value: [{
          name: "PBES2Algorithms.keyDerivationFunc.oid",
          tagClass: v2847.Class.UNIVERSAL,
          type: v2847.Type.OID,
          constructed: false,
          capture: "kdfOid"
        }, {
          name: "PBES2Algorithms.params",
          tagClass: v2847.Class.UNIVERSAL,
          type: v2847.Type.SEQUENCE,
          constructed: true,
          value: [{
            name: "PBES2Algorithms.params.salt",
            tagClass: v2847.Class.UNIVERSAL,
            type: v2847.Type.OCTETSTRING,
            constructed: false,
            capture: "kdfSalt"
          }, {
            name: "PBES2Algorithms.params.iterationCount",
            tagClass: v2847.Class.UNIVERSAL,
            type: v2847.Type.INTEGER,
            constructed: false,
            capture: "kdfIterationCount"
          }, {
            name: "PBES2Algorithms.params.keyLength",
            tagClass: v2847.Class.UNIVERSAL,
            type: v2847.Type.INTEGER,
            constructed: false,
            optional: true,
            capture: "keyLength"
          }, {
            name: "PBES2Algorithms.params.prf",
            tagClass: v2847.Class.UNIVERSAL,
            type: v2847.Type.SEQUENCE,
            constructed: true,
            optional: true,
            value: [{
              name: "PBES2Algorithms.params.prf.algorithm",
              tagClass: v2847.Class.UNIVERSAL,
              type: v2847.Type.OID,
              constructed: false,
              capture: "prfOid"
            }]
          }]
        }]
      }, {
        name: "PBES2Algorithms.encryptionScheme",
        tagClass: v2847.Class.UNIVERSAL,
        type: v2847.Type.SEQUENCE,
        constructed: true,
        value: [{
          name: "PBES2Algorithms.encryptionScheme.oid",
          tagClass: v2847.Class.UNIVERSAL,
          type: v2847.Type.OID,
          constructed: false,
          capture: "encOid"
        }, {
          name: "PBES2Algorithms.encryptionScheme.iv",
          tagClass: v2847.Class.UNIVERSAL,
          type: v2847.Type.OCTETSTRING,
          constructed: false,
          capture: "encIv"
        }]
      }]
    };
    var v2852 = {
      name: "pkcs-12PbeParams",
      tagClass: v2847.Class.UNIVERSAL,
      type: v2847.Type.SEQUENCE,
      constructed: true,
      value: [{
        name: "pkcs-12PbeParams.salt",
        tagClass: v2847.Class.UNIVERSAL,
        type: v2847.Type.OCTETSTRING,
        constructed: false,
        capture: "salt"
      }, {
        name: "pkcs-12PbeParams.iterations",
        tagClass: v2847.Class.UNIVERSAL,
        type: v2847.Type.INTEGER,
        constructed: false,
        capture: "iterations"
      }]
    };
    v2848.encryptPrivateKeyInfo = function (v2853, v2854, v2855) {
      var v2856 = v2844;
      v2855 = v2855 || {};
      v2855.saltSize = v2855.saltSize || 8;
      v2855.count = v2855.count || 2048;
      v2855.algorithm = v2855.algorithm || "aes128";
      v2855.prfAlgorithm = v2855.prfAlgorithm || "sha1";
      var v2857 = v2845.random.getBytesSync(v2855.saltSize);
      var v2858 = v2855.count;
      var v2859 = v2847.integerToDer(v2858);
      var v2860;
      var v2861;
      var v2862;
      if (v2855.algorithm.indexOf("aes") === 0 || v2855.algorithm === "des") {
        var v2863;
        var v2864;
        var v2865;
        switch (v2855.algorithm) {
          case "aes128":
            v2860 = 16;
            v2863 = 16;
            v2864 = v2849["aes128-CBC"];
            v2865 = v2845.aes.createEncryptionCipher;
            break;
          case "aes192":
            v2860 = 24;
            v2863 = 16;
            v2864 = v2849["aes192-CBC"];
            v2865 = v2845.aes.createEncryptionCipher;
            break;
          case "aes256":
            v2860 = 32;
            v2863 = 16;
            v2864 = v2849["aes256-CBC"];
            v2865 = v2845.aes.createEncryptionCipher;
            break;
          case "des":
            v2860 = 8;
            v2863 = 8;
            v2864 = v2849.desCBC;
            v2865 = v2845.des.createEncryptionCipher;
            break;
          default:
            var v2866 = new Error("Cannot encrypt private key. Unknown encryption algorithm.");
            v2866.algorithm = v2855.algorithm;
            throw v2866;
        }
        var v2867 = "hmacWith" + v2855.prfAlgorithm.toUpperCase();
        var v2868 = v2869(v2867);
        var v2870 = v2845.pkcs5.pbkdf2(v2854, v2857, v2858, v2860, v2868);
        var v2871 = v2845.random.getBytesSync(v2863);
        var v2872 = v2865(v2870);
        v2872.start(v2871);
        v2872.update(v2847.toDer(v2853));
        v2872.finish();
        v2862 = v2872.output.getBytes();
        var v2873 = v2874(v2857, v2859, v2860, v2867);
        v2861 = v2847.create(v2847.Class.UNIVERSAL, v2847.Type.SEQUENCE, true, [v2847.create(v2847.Class.UNIVERSAL, v2847.Type.OID, false, v2847.oidToDer(v2849.pkcs5PBES2).getBytes()), v2847.create(v2847.Class.UNIVERSAL, v2847.Type.SEQUENCE, true, [v2847.create(v2847.Class.UNIVERSAL, v2847.Type.SEQUENCE, true, [v2847.create(v2847.Class.UNIVERSAL, v2847.Type.OID, false, v2847.oidToDer(v2849.pkcs5PBKDF2).getBytes()), v2873]), v2847.create(v2847.Class.UNIVERSAL, v2847.Type.SEQUENCE, true, [v2847.create(v2847.Class.UNIVERSAL, v2847.Type.OID, false, v2847.oidToDer(v2864).getBytes()), v2847.create(v2847.Class.UNIVERSAL, v2847.Type.OCTETSTRING, false, v2871)])])]);
      } else if (v2855.algorithm === "3des") {
        v2860 = 24;
        var v2875 = new v2845.util.ByteBuffer(v2857);
        var v2870 = v2848.pbe.generatePkcs12Key(v2854, v2875, 1, v2858, v2860);
        var v2871 = v2848.pbe.generatePkcs12Key(v2854, v2875, 2, v2858, v2860);
        var v2872 = v2845.des.createEncryptionCipher(v2870);
        v2872.start(v2871);
        v2872.update(v2847.toDer(v2853));
        v2872.finish();
        v2862 = v2872.output.getBytes();
        v2861 = v2847.create(v2847.Class.UNIVERSAL, v2847.Type.SEQUENCE, true, [v2847.create(v2847.Class.UNIVERSAL, v2847.Type.OID, false, v2847.oidToDer(v2849["pbeWithSHAAnd3-KeyTripleDES-CBC"]).getBytes()), v2847.create(v2847.Class.UNIVERSAL, v2847.Type.SEQUENCE, true, [v2847.create(v2847.Class.UNIVERSAL, v2847.Type.OCTETSTRING, false, v2857), v2847.create(v2847.Class.UNIVERSAL, v2847.Type.INTEGER, false, v2859.getBytes())])]);
      } else {
        var v2866 = new Error("Cannot encrypt private key. Unknown encryption algorithm.");
        v2866.algorithm = v2855.algorithm;
        throw v2866;
      }
      var v2876 = v2847.create(v2847.Class.UNIVERSAL, v2847.Type.SEQUENCE, true, [v2861, v2847.create(v2847.Class.UNIVERSAL, v2847.Type.OCTETSTRING, false, v2862)]);
      return v2876;
    };
    v2848.decryptPrivateKeyInfo = function (v2877, v2878) {
      var v2879 = v2844;
      var v2880 = null;
      var v2881 = {};
      var v2882 = [];
      if (!v2847.validate(v2877, v2850, v2881, v2882)) {
        var v2883 = new Error("Cannot read encrypted private key. ASN.1 object is not a supported EncryptedPrivateKeyInfo.");
        v2883.errors = v2882;
        throw v2883;
      }
      var v2884 = v2847.derToOid(v2881.encryptionOid);
      var v2885 = v2848.pbe.getCipher(v2884, v2881.encryptionParams, v2878);
      var v2886 = v2845.util.createBuffer(v2881.encryptedData);
      v2885.update(v2886);
      if (v2885.finish()) {
        v2880 = v2847.fromDer(v2885.output);
      }
      return v2880;
    };
    v2848.encryptedPrivateKeyToPem = function (v2887, v2888) {
      var v2889 = v2844;
      var v2890 = {
        type: "ENCRYPTED PRIVATE KEY",
        body: v2847.toDer(v2887).getBytes()
      };
      return v2845.pem.encode(v2890, {
        maxline: v2888
      });
    };
    v2848.encryptedPrivateKeyFromPem = function (v2891) {
      var v2892 = v2844;
      var v2893 = v2845.pem.decode(v2891)[0];
      if (v2893.type !== "ENCRYPTED PRIVATE KEY") {
        var v2894 = new Error("Could not convert encrypted private key from PEM; PEM header type is \"ENCRYPTED PRIVATE KEY\".");
        v2894.headerType = v2893.type;
        throw v2894;
      }
      if (v2893.procType && v2893.procType.type === "ENCRYPTED") {
        throw new Error("Could not convert encrypted private key from PEM; PEM is encrypted.");
      }
      return v2847.fromDer(v2893.body);
    };
    v2848.encryptRsaPrivateKey = function (v2895, v2896, v2897) {
      var v2898 = v2844;
      v2897 = v2897 || {};
      if (!v2897.legacy) {
        var v2899 = v2848.wrapRsaPrivateKey(v2848.privateKeyToAsn1(v2895));
        v2899 = v2848.encryptPrivateKeyInfo(v2899, v2896, v2897);
        return v2848.encryptedPrivateKeyToPem(v2899);
      }
      var v2900;
      var v2901;
      var v2902;
      var v2903;
      switch (v2897.algorithm) {
        case "aes128":
          v2900 = "AES-128-CBC";
          v2902 = 16;
          v2901 = v2845.random.getBytesSync(16);
          v2903 = v2845.aes.createEncryptionCipher;
          break;
        case "aes192":
          v2900 = "AES-192-CBC";
          v2902 = 24;
          v2901 = v2845.random.getBytesSync(16);
          v2903 = v2845.aes.createEncryptionCipher;
          break;
        case "aes256":
          v2900 = "AES-256-CBC";
          v2902 = 32;
          v2901 = v2845.random.getBytesSync(16);
          v2903 = v2845.aes.createEncryptionCipher;
          break;
        case "3des":
          v2900 = "DES-EDE3-CBC";
          v2902 = 24;
          v2901 = v2845.random.getBytesSync(8);
          v2903 = v2845.des.createEncryptionCipher;
          break;
        case "des":
          v2900 = "DES-CBC";
          v2902 = 8;
          v2901 = v2845.random.getBytesSync(8);
          v2903 = v2845.des.createEncryptionCipher;
          break;
        default:
          var v2904 = new Error("Could not encrypt RSA private key; unsupported encryption algorithm \"" + v2897.algorithm + "\".");
          v2904.algorithm = v2897.algorithm;
          throw v2904;
      }
      var v2905 = v2845.pbe.opensslDeriveBytes(v2896, v2901.substr(0, 8), v2902);
      var v2906 = v2903(v2905);
      v2906.start(v2901);
      v2906.update(v2847.toDer(v2848.privateKeyToAsn1(v2895)));
      v2906.finish();
      var v2907 = {
        type: "RSA PRIVATE KEY",
        procType: {
          version: "4",
          type: "ENCRYPTED"
        },
        dekInfo: {
          algorithm: v2900,
          parameters: v2845.util.bytesToHex(v2901).toUpperCase()
        },
        body: v2906.output.getBytes()
      };
      return v2845.pem.encode(v2907);
    };
    v2848.decryptRsaPrivateKey = function (v2908, v2909) {
      var v2910 = {
        dh1334: 1063
      };
      var v2911 = v2844;
      var v2912 = null;
      var v2913 = v2845.pem.decode(v2908)[0];
      if (v2913.type !== "ENCRYPTED PRIVATE KEY" && v2913.type !== "PRIVATE KEY" && v2913.type !== "RSA PRIVATE KEY") {
        var v2914 = new Error("Could not convert private key from PEM; PEM header type is not \"ENCRYPTED PRIVATE KEY\", \"PRIVATE KEY\", or \"RSA PRIVATE KEY\".");
        v2914.headerType = v2914;
        throw v2914;
      }
      if (v2913.procType && v2913.procType.type === "ENCRYPTED") {
        var v2915;
        var v2916;
        switch (v2913.dekInfo.algorithm) {
          case "DES-CBC":
            v2915 = 8;
            v2916 = v2845.des.createDecryptionCipher;
            break;
          case "DES-EDE3-CBC":
            v2915 = 24;
            v2916 = v2845.des.createDecryptionCipher;
            break;
          case "AES-128-CBC":
            v2915 = 16;
            v2916 = v2845.aes.createDecryptionCipher;
            break;
          case "AES-192-CBC":
            v2915 = 24;
            v2916 = v2845.aes.createDecryptionCipher;
            break;
          case "AES-256-CBC":
            v2915 = 32;
            v2916 = v2845.aes.createDecryptionCipher;
            break;
          case "RC2-40-CBC":
            v2915 = 5;
            v2916 = function (v2917) {
              return v2845.rc2.createDecryptionCipher(v2917, 40);
            };
            break;
          case "RC2-64-CBC":
            v2915 = 8;
            v2916 = function (v2918) {
              var v2919 = v2911;
              return v2845.rc2.createDecryptionCipher(v2918, 64);
            };
            break;
          case "RC2-128-CBC":
            v2915 = 16;
            v2916 = function (v2920) {
              return v2845.rc2.createDecryptionCipher(v2920, 128);
            };
            break;
          default:
            var v2914 = new Error("Could not decrypt private key; unsupported encryption algorithm \"" + v2913.dekInfo.algorithm + "\".");
            v2914.algorithm = v2913.dekInfo.algorithm;
            throw v2914;
        }
        var v2921 = v2845.util.hexToBytes(v2913.dekInfo.parameters);
        var v2922 = v2845.pbe.opensslDeriveBytes(v2909, v2921.substr(0, 8), v2915);
        var v2923 = v2916(v2922);
        v2923.start(v2921);
        v2923.update(v2845.util.createBuffer(v2913.body));
        if (v2923.finish()) {
          v2912 = v2923.output.getBytes();
        } else {
          return v2912;
        }
      } else {
        v2912 = v2913.body;
      }
      if (v2913.type === "ENCRYPTED PRIVATE KEY") {
        v2912 = v2848.decryptPrivateKeyInfo(v2847.fromDer(v2912), v2909);
      } else {
        v2912 = v2847.fromDer(v2912);
      }
      if (v2912 !== null) {
        v2912 = v2848.privateKeyFromAsn1(v2912);
      }
      return v2912;
    };
    v2848.pbe.generatePkcs12Key = function (v2924, v2925, v2926, v2927, v2928, v2929) {
      var v2930 = v2844;
      var v2931;
      var v2932;
      if (typeof v2929 === "undefined" || v2929 === null) {
        if (!("sha1" in v2845.md)) {
          throw new Error("\"sha1\" hash algorithm unavailable.");
        }
        v2929 = v2845.md.sha1.create();
      }
      var v2933 = v2929.digestLength;
      var v2934 = v2929.blockLength;
      var v2935 = new v2845.util.ByteBuffer();
      var v2936 = new v2845.util.ByteBuffer();
      if (v2924 !== null && v2924 !== undefined) {
        for (v2932 = 0; v2932 < v2924.length; v2932++) {
          v2936.putInt16(v2924.charCodeAt(v2932));
        }
        v2936.putInt16(0);
      }
      var v2937 = v2936.length();
      var v2938 = v2925.length();
      var v2939 = new v2845.util.ByteBuffer();
      v2939.fillWithByte(v2926, v2934);
      var v2940 = v2934 * Math.ceil(v2938 / v2934);
      var v2941 = new v2845.util.ByteBuffer();
      for (v2932 = 0; v2932 < v2940; v2932++) {
        v2941.putByte(v2925.at(v2932 % v2938));
      }
      var v2942 = v2934 * Math.ceil(v2937 / v2934);
      var v2943 = new v2845.util.ByteBuffer();
      for (v2932 = 0; v2932 < v2942; v2932++) {
        v2943.putByte(v2936.at(v2932 % v2937));
      }
      var v2944 = v2941;
      v2944.putBuffer(v2943);
      var v2945 = Math.ceil(v2928 / v2933);
      for (var v2946 = 1; v2946 <= v2945; v2946++) {
        var v2947 = new v2845.util.ByteBuffer();
        v2947.putBytes(v2939.bytes());
        v2947.putBytes(v2944.bytes());
        for (var v2948 = 0; v2948 < v2927; v2948++) {
          v2929.start();
          v2929.update(v2947.getBytes());
          v2947 = v2929.digest();
        }
        var v2949 = new v2845.util.ByteBuffer();
        for (v2932 = 0; v2932 < v2934; v2932++) {
          v2949.putByte(v2947.at(v2932 % v2933));
        }
        var v2950 = Math.ceil(v2938 / v2934) + Math.ceil(v2937 / v2934);
        var v2951 = new v2845.util.ByteBuffer();
        for (v2931 = 0; v2931 < v2950; v2931++) {
          var v2952 = new v2845.util.ByteBuffer(v2944.getBytes(v2934));
          var v2953 = 511;
          for (v2932 = v2949.length() - 1; v2932 >= 0; v2932--) {
            v2953 = v2953 >> 8;
            v2953 += v2949.at(v2932) + v2952.at(v2932);
            v2952.setAt(v2932, v2953 & 255);
          }
          v2951.putBuffer(v2952);
        }
        v2944 = v2951;
        v2935.putBuffer(v2947);
      }
      v2935.truncate(v2935.length() - v2928);
      return v2935;
    };
    v2848.pbe.getCipher = function (v2954, v2955, v2956) {
      var v2957 = v2844;
      switch (v2954) {
        case v2848.oids.pkcs5PBES2:
          return v2848.pbe.getCipherForPBES2(v2954, v2955, v2956);
        case v2848.oids["pbeWithSHAAnd3-KeyTripleDES-CBC"]:
        case v2848.oids["pbewithSHAAnd40BitRC2-CBC"]:
          return v2848.pbe.getCipherForPKCS12PBE(v2954, v2955, v2956);
        default:
          var v2958 = new Error("Cannot read encrypted PBE data block. Unsupported OID.");
          v2958.oid = v2954;
          v2958.supportedOids = ["pkcs5PBES2", "pbeWithSHAAnd3-KeyTripleDES-CBC", "pbewithSHAAnd40BitRC2-CBC"];
          throw v2958;
      }
    };
    v2848.pbe.getCipherForPBES2 = function (v2959, v2960, v2961) {
      var v2962 = v2844;
      var v2963 = {};
      var v2964 = [];
      if (!v2847.validate(v2960, v2851, v2963, v2964)) {
        var v2965 = new Error("Cannot read password-based-encryption algorithm parameters. ASN.1 object is not a supported EncryptedPrivateKeyInfo.");
        v2965.errors = v2964;
        throw v2965;
      }
      v2959 = v2847.derToOid(v2963.kdfOid);
      if (v2959 !== v2848.oids.pkcs5PBKDF2) {
        var v2965 = new Error("Cannot read encrypted private key. Unsupported key derivation function OID.");
        v2965.oid = v2959;
        v2965.supportedOids = ["pkcs5PBKDF2"];
        throw v2965;
      }
      v2959 = v2847.derToOid(v2963.encOid);
      if (v2959 !== v2848.oids["aes128-CBC"] && v2959 !== v2848.oids["aes192-CBC"] && v2959 !== v2848.oids["aes256-CBC"] && v2959 !== v2848.oids["des-EDE3-CBC"] && v2959 !== v2848.oids.desCBC) {
        var v2965 = new Error("Cannot read encrypted private key. Unsupported encryption scheme OID.");
        v2965.oid = v2959;
        v2965.supportedOids = ["aes128-CBC", "aes192-CBC", "aes256-CBC", "des-EDE3-CBC", "desCBC"];
        throw v2965;
      }
      var v2966 = v2963.kdfSalt;
      var v2967 = v2845.util.createBuffer(v2963.kdfIterationCount);
      v2967 = v2967.getInt(v2967.length() << 3);
      var v2968;
      var v2969;
      switch (v2848.oids[v2959]) {
        case "aes128-CBC":
          v2968 = 16;
          v2969 = v2845.aes.createDecryptionCipher;
          break;
        case "aes192-CBC":
          v2968 = 24;
          v2969 = v2845.aes.createDecryptionCipher;
          break;
        case "aes256-CBC":
          v2968 = 32;
          v2969 = v2845.aes.createDecryptionCipher;
          break;
        case "des-EDE3-CBC":
          v2968 = 24;
          v2969 = v2845.des.createDecryptionCipher;
          break;
        case "desCBC":
          v2968 = 8;
          v2969 = v2845.des.createDecryptionCipher;
          break;
      }
      var v2970 = v2971(v2963.prfOid);
      var v2972 = v2845.pkcs5.pbkdf2(v2961, v2966, v2967, v2968, v2970);
      var v2973 = v2963.encIv;
      var v2974 = v2969(v2972);
      v2974.start(v2973);
      return v2974;
    };
    v2848.pbe.getCipherForPKCS12PBE = function (v2975, v2976, v2977) {
      var v2978 = v2844;
      var v2979 = {};
      var v2980 = [];
      if (!v2847.validate(v2976, v2852, v2979, v2980)) {
        var v2981 = new Error("Cannot read password-based-encryption algorithm parameters. ASN.1 object is not a supported EncryptedPrivateKeyInfo.");
        v2981.errors = v2980;
        throw v2981;
      }
      var v2982 = v2845.util.createBuffer(v2979.salt);
      var v2983 = v2845.util.createBuffer(v2979.iterations);
      v2983 = v2983.getInt(v2983.length() << 3);
      var v2984;
      var v2985;
      var v2986;
      switch (v2975) {
        case v2848.oids["pbeWithSHAAnd3-KeyTripleDES-CBC"]:
          v2984 = 24;
          v2985 = 8;
          v2986 = v2845.des.startDecrypting;
          break;
        case v2848.oids["pbewithSHAAnd40BitRC2-CBC"]:
          v2984 = 5;
          v2985 = 8;
          v2986 = function (v2987, v2988) {
            var v2989 = v2978;
            var v2990 = v2845.rc2.createDecryptionCipher(v2987, 40);
            v2990.start(v2988, null);
            return v2990;
          };
          break;
        default:
          var v2981 = new Error("Cannot read PKCS #12 PBE data block. Unsupported OID.");
          v2981.oid = v2975;
          throw v2981;
      }
      var v2991 = v2971(v2979.prfOid);
      var v2992 = v2848.pbe.generatePkcs12Key(v2977, v2982, 1, v2983, v2984, v2991);
      v2991.start();
      var v2993 = v2848.pbe.generatePkcs12Key(v2977, v2982, 2, v2983, v2985, v2991);
      return v2986(v2992, v2993);
    };
    v2848.pbe.opensslDeriveBytes = function (v2994, v2995, v2996, v2997) {
      var v2998 = v2844;
      if (typeof v2997 === "undefined" || v2997 === null) {
        if (!("md5" in v2845.md)) {
          throw new Error("\"md5\" hash algorithm unavailable.");
        }
        v2997 = v2845.md.md5.create();
      }
      if (v2995 === null) {
        v2995 = "";
      }
      var v2999 = [v3000(v2997, v2994 + v2995)];
      for (var v3001 = 16, v3002 = 1; v3001 < v2996; ++v3002, v3001 += 16) {
        v2999.push(v3000(v2997, v2999[v3002 - 1] + v2994 + v2995));
      }
      return v2999.join("").substr(0, v2996);
    };
    function v3000(v3003, v3004) {
      var v3005 = v2844;
      return v3003.start().update(v3004).digest().getBytes();
    }
    function v2971(v3006) {
      var v3007 = v2844;
      var v3008;
      if (!v3006) {
        v3008 = "hmacWithSHA1";
      } else {
        v3008 = v2848.oids[v2847.derToOid(v3006)];
        if (!v3008) {
          var v3009 = new Error("Unsupported PRF OID.");
          v3009.oid = v3006;
          v3009.supported = ["hmacWithSHA1", "hmacWithSHA224", "hmacWithSHA256", "hmacWithSHA384", "hmacWithSHA512"];
          throw v3009;
        }
      }
      return v2869(v3008);
    }
    function v2869(v3010) {
      var v3011 = v2844;
      var v3012 = v2845.md;
      switch (v3010) {
        case "hmacWithSHA224":
          v3012 = v2845.md.sha512;
        case "hmacWithSHA1":
        case "hmacWithSHA256":
        case "hmacWithSHA384":
        case "hmacWithSHA512":
          v3010 = v3010.substr(8).toLowerCase();
          break;
        default:
          var v3013 = new Error("Unsupported PRF algorithm.");
          v3013.algorithm = v3010;
          v3013.supported = ["hmacWithSHA1", "hmacWithSHA224", "hmacWithSHA256", "hmacWithSHA384", "hmacWithSHA512"];
          throw v3013;
      }
      if (!v3012 || !(v3010 in v3012)) {
        throw new Error("Unknown hash algorithm: " + v3010);
      }
      return v3012[v3010].create();
    }
    function v2874(v3014, v3015, v3016, v3017) {
      var v3018 = v2844;
      var v3019 = v2847.create(v2847.Class.UNIVERSAL, v2847.Type.SEQUENCE, true, [v2847.create(v2847.Class.UNIVERSAL, v2847.Type.OCTETSTRING, false, v3014), v2847.create(v2847.Class.UNIVERSAL, v2847.Type.INTEGER, false, v3015.getBytes())]);
      if (v3017 !== "hmacWithSHA1") {
        v3019.value.push(v2847.create(v2847.Class.UNIVERSAL, v2847.Type.INTEGER, false, v2845.util.hexToBytes(v3016.toString(16))), v2847.create(v2847.Class.UNIVERSAL, v2847.Type.SEQUENCE, true, [v2847.create(v2847.Class.UNIVERSAL, v2847.Type.OID, false, v2847.oidToDer(v2848.oids[v3017]).getBytes()), v2847.create(v2847.Class.UNIVERSAL, v2847.Type.NULL, false, "")]));
      }
      return v3019;
    }
  }
});
var require_pkcs7asn1 = __commonJS({
  "node_modules/node-forge/lib/pkcs7asn1.js"(v3020, v3021) {
    var v3022 = {
      dh1335: 596,
      dh1336: 1495,
      dh1337: 1294,
      dh1338: 1027,
      dh1339: 1045,
      dh1340: 738,
      dh1341: 932,
      dh1342: 1425,
      dh1343: 901,
      dh1344: 785,
      dh1345: 1045,
      dh1346: 1478,
      dh1347: 968,
      dh1348: 1045,
      dh1349: 947,
      dh1350: 1045,
      dh1351: 1045,
      dh1352: 1538,
      dh1353: 738,
      dh1354: 1027,
      dh1355: 1495,
      dh1356: 888,
      dh1357: 922,
      dh1358: 1027,
      dh1359: 499,
      dh1360: 682,
      dh1361: 1070,
      dh1362: 1045,
      dh1363: 494,
      dh1364: 1512,
      dh1365: 1132,
      dh1366: 1027,
      dh1367: 404,
      dh1368: 1527,
      dh1369: 785,
      dh1370: 738,
      dh1371: 738
    };
    var v3023 = v2;
    var v3024 = require_forge();
    require_asn1();
    require_util();
    var v3025 = v3024.asn1;
    var v3026 = v3021.exports = v3024.pkcs7asn1 = v3024.pkcs7asn1 || {};
    v3024.pkcs7 = v3024.pkcs7 || {};
    v3024.pkcs7.asn1 = v3026;
    var v3027 = {
      name: "ContentInfo",
      tagClass: v3025.Class.UNIVERSAL,
      type: v3025.Type.SEQUENCE,
      constructed: true,
      value: [{
        name: "ContentInfo.ContentType",
        tagClass: v3025.Class.UNIVERSAL,
        type: v3025.Type.OID,
        constructed: false,
        capture: "contentType"
      }, {
        name: "ContentInfo.content",
        tagClass: v3025.Class.CONTEXT_SPECIFIC,
        type: 0,
        constructed: true,
        optional: true,
        captureAsn1: "content"
      }]
    };
    v3026.contentInfoValidator = v3027;
    var v3028 = {
      name: "EncryptedContentInfo",
      tagClass: v3025.Class.UNIVERSAL,
      type: v3025.Type.SEQUENCE,
      constructed: true,
      value: [{
        name: "EncryptedContentInfo.contentType",
        tagClass: v3025.Class.UNIVERSAL,
        type: v3025.Type.OID,
        constructed: false,
        capture: "contentType"
      }, {
        name: "EncryptedContentInfo.contentEncryptionAlgorithm",
        tagClass: v3025.Class.UNIVERSAL,
        type: v3025.Type.SEQUENCE,
        constructed: true,
        value: [{
          name: "EncryptedContentInfo.contentEncryptionAlgorithm.algorithm",
          tagClass: v3025.Class.UNIVERSAL,
          type: v3025.Type.OID,
          constructed: false,
          capture: "encAlgorithm"
        }, {
          name: "EncryptedContentInfo.contentEncryptionAlgorithm.parameter",
          tagClass: v3025.Class.UNIVERSAL,
          captureAsn1: "encParameter"
        }]
      }, {
        name: "EncryptedContentInfo.encryptedContent",
        tagClass: v3025.Class.CONTEXT_SPECIFIC,
        type: 0,
        capture: "encryptedContent",
        captureAsn1: "encryptedContentAsn1"
      }]
    };
    v3026.envelopedDataValidator = {
      name: "EnvelopedData",
      tagClass: v3025.Class.UNIVERSAL,
      type: v3025.Type.SEQUENCE,
      constructed: true,
      value: [{
        name: "EnvelopedData.Version",
        tagClass: v3025.Class.UNIVERSAL,
        type: v3025.Type.INTEGER,
        constructed: false,
        capture: "version"
      }, {
        name: "EnvelopedData.RecipientInfos",
        tagClass: v3025.Class.UNIVERSAL,
        type: v3025.Type.SET,
        constructed: true,
        captureAsn1: "recipientInfos"
      }].concat(v3028)
    };
    v3026.encryptedDataValidator = {
      name: "EncryptedData",
      tagClass: v3025.Class.UNIVERSAL,
      type: v3025.Type.SEQUENCE,
      constructed: true,
      value: [{
        name: "EncryptedData.Version",
        tagClass: v3025.Class.UNIVERSAL,
        type: v3025.Type.INTEGER,
        constructed: false,
        capture: "version"
      }].concat(v3028)
    };
    var v3029 = {
      name: "SignerInfo",
      tagClass: v3025.Class.UNIVERSAL,
      type: v3025.Type.SEQUENCE,
      constructed: true,
      value: [{
        name: "SignerInfo.version",
        tagClass: v3025.Class.UNIVERSAL,
        type: v3025.Type.INTEGER,
        constructed: false
      }, {
        name: "SignerInfo.issuerAndSerialNumber",
        tagClass: v3025.Class.UNIVERSAL,
        type: v3025.Type.SEQUENCE,
        constructed: true,
        value: [{
          name: "SignerInfo.issuerAndSerialNumber.issuer",
          tagClass: v3025.Class.UNIVERSAL,
          type: v3025.Type.SEQUENCE,
          constructed: true,
          captureAsn1: "issuer"
        }, {
          name: "SignerInfo.issuerAndSerialNumber.serialNumber",
          tagClass: v3025.Class.UNIVERSAL,
          type: v3025.Type.INTEGER,
          constructed: false,
          capture: "serial"
        }]
      }, {
        name: "SignerInfo.digestAlgorithm",
        tagClass: v3025.Class.UNIVERSAL,
        type: v3025.Type.SEQUENCE,
        constructed: true,
        value: [{
          name: "SignerInfo.digestAlgorithm.algorithm",
          tagClass: v3025.Class.UNIVERSAL,
          type: v3025.Type.OID,
          constructed: false,
          capture: "digestAlgorithm"
        }, {
          name: "SignerInfo.digestAlgorithm.parameter",
          tagClass: v3025.Class.UNIVERSAL,
          constructed: false,
          captureAsn1: "digestParameter",
          optional: true
        }]
      }, {
        name: "SignerInfo.authenticatedAttributes",
        tagClass: v3025.Class.CONTEXT_SPECIFIC,
        type: 0,
        constructed: true,
        optional: true,
        capture: "authenticatedAttributes"
      }, {
        name: "SignerInfo.digestEncryptionAlgorithm",
        tagClass: v3025.Class.UNIVERSAL,
        type: v3025.Type.SEQUENCE,
        constructed: true,
        capture: "signatureAlgorithm"
      }, {
        name: "SignerInfo.encryptedDigest",
        tagClass: v3025.Class.UNIVERSAL,
        type: v3025.Type.OCTETSTRING,
        constructed: false,
        capture: "signature"
      }, {
        name: "SignerInfo.unauthenticatedAttributes",
        tagClass: v3025.Class.CONTEXT_SPECIFIC,
        type: 1,
        constructed: true,
        optional: true,
        capture: "unauthenticatedAttributes"
      }]
    };
    v3026.signedDataValidator = {
      name: "SignedData",
      tagClass: v3025.Class.UNIVERSAL,
      type: v3025.Type.SEQUENCE,
      constructed: true,
      value: [{
        name: "SignedData.Version",
        tagClass: v3025.Class.UNIVERSAL,
        type: v3025.Type.INTEGER,
        constructed: false,
        capture: "version"
      }, {
        name: "SignedData.DigestAlgorithms",
        tagClass: v3025.Class.UNIVERSAL,
        type: v3025.Type.SET,
        constructed: true,
        captureAsn1: "digestAlgorithms"
      }, v3027, {
        name: "SignedData.Certificates",
        tagClass: v3025.Class.CONTEXT_SPECIFIC,
        type: 0,
        optional: true,
        captureAsn1: "certificates"
      }, {
        name: "SignedData.CertificateRevocationLists",
        tagClass: v3025.Class.CONTEXT_SPECIFIC,
        type: 1,
        optional: true,
        captureAsn1: "crls"
      }, {
        name: "SignedData.SignerInfos",
        tagClass: v3025.Class.UNIVERSAL,
        type: v3025.Type.SET,
        capture: "signerInfos",
        optional: true,
        value: [v3029]
      }]
    };
    v3026.recipientInfoValidator = {
      name: "RecipientInfo",
      tagClass: v3025.Class.UNIVERSAL,
      type: v3025.Type.SEQUENCE,
      constructed: true,
      value: [{
        name: "RecipientInfo.version",
        tagClass: v3025.Class.UNIVERSAL,
        type: v3025.Type.INTEGER,
        constructed: false,
        capture: "version"
      }, {
        name: "RecipientInfo.issuerAndSerial",
        tagClass: v3025.Class.UNIVERSAL,
        type: v3025.Type.SEQUENCE,
        constructed: true,
        value: [{
          name: "RecipientInfo.issuerAndSerial.issuer",
          tagClass: v3025.Class.UNIVERSAL,
          type: v3025.Type.SEQUENCE,
          constructed: true,
          captureAsn1: "issuer"
        }, {
          name: "RecipientInfo.issuerAndSerial.serialNumber",
          tagClass: v3025.Class.UNIVERSAL,
          type: v3025.Type.INTEGER,
          constructed: false,
          capture: "serial"
        }]
      }, {
        name: "RecipientInfo.keyEncryptionAlgorithm",
        tagClass: v3025.Class.UNIVERSAL,
        type: v3025.Type.SEQUENCE,
        constructed: true,
        value: [{
          name: "RecipientInfo.keyEncryptionAlgorithm.algorithm",
          tagClass: v3025.Class.UNIVERSAL,
          type: v3025.Type.OID,
          constructed: false,
          capture: "encAlgorithm"
        }, {
          name: "RecipientInfo.keyEncryptionAlgorithm.parameter",
          tagClass: v3025.Class.UNIVERSAL,
          constructed: false,
          captureAsn1: "encParameter",
          optional: true
        }]
      }, {
        name: "RecipientInfo.encryptedKey",
        tagClass: v3025.Class.UNIVERSAL,
        type: v3025.Type.OCTETSTRING,
        constructed: false,
        capture: "encKey"
      }]
    };
  }
});
var require_mgf1 = __commonJS({
  "node_modules/node-forge/lib/mgf1.js"(v3030, v3031) {
    var v3032 = {
      dh1372: 1144
    };
    var v3033 = v2;
    var v3034 = require_forge();
    require_util();
    v3034.mgf = v3034.mgf || {};
    var v3035 = v3031.exports = v3034.mgf.mgf1 = v3034.mgf1 = v3034.mgf1 || {};
    v3035.create = function (v3036) {
      var v3037 = {
        dh1373: 619,
        dh1374: 352,
        dh1375: 857
      };
      var v3038 = {
        generate: function (v3039, v3040) {
          var v3041 = v1;
          var v3042 = new v3034.util.ByteBuffer();
          var v3043 = Math.ceil(v3040 / v3036.digestLength);
          for (var v3044 = 0; v3044 < v3043; v3044++) {
            var v3045 = new v3034.util.ByteBuffer();
            v3045.putInt32(v3044);
            v3036.start();
            v3036.update(v3039 + v3045.getBytes());
            v3042.putBuffer(v3036.digest());
          }
          v3042.truncate(v3042.length() - v3040);
          return v3042.getBytes();
        }
      };
      return v3038;
    };
  }
});
var require_mgf = __commonJS({
  "node_modules/node-forge/lib/mgf.js"(v3046, v3047) {
    var v3048 = {
      dh1376: 1164
    };
    var v3049 = v2;
    var v3050 = require_forge();
    require_mgf1();
    v3047.exports = v3050.mgf = v3050.mgf || {};
    v3050.mgf.mgf1 = v3050.mgf1;
  }
});
var require_pss = __commonJS({
  "node_modules/node-forge/lib/pss.js"(v3051, v3052) {
    var v3053 = {
      dh1377: 650,
      dh1378: 1144
    };
    var v3054 = {
      dh1379: 1164,
      dh1380: 669,
      dh1381: 857
    };
    var v3055 = v2;
    var v3056 = require_forge();
    require_random();
    require_util();
    var v3057 = v3052.exports = v3056.pss = v3056.pss || {};
    v3057.create = function (v3058) {
      var v3059 = {
        dh1382: 660,
        dh1383: 1428,
        dh1384: 278,
        dh1385: 900,
        dh1386: 250,
        dh1387: 1025
      };
      var v3060 = {
        dh1388: 660,
        dh1389: 1077,
        dh1390: 619,
        dh1391: 278
      };
      var v3061 = v3055;
      if (arguments.length === 3) {
        v3058 = {
          md: arguments[0],
          mgf: arguments[1],
          saltLength: arguments[2]
        };
      }
      var v3062 = v3058.md;
      var v3063 = v3058.mgf;
      var v3064 = v3062.digestLength;
      var v3065 = v3058.salt || null;
      if (typeof v3065 === "string") {
        v3065 = v3056.util.createBuffer(v3065);
      }
      var v3066;
      if ("saltLength" in v3058) {
        v3066 = v3058.saltLength;
      } else if (v3065 !== null) {
        v3066 = v3065.length();
      } else {
        throw new Error("Salt length not specified or specific salt not given.");
      }
      if (v3065 !== null && v3065.length() !== v3066) {
        throw new Error("Given salt length does not match length of given salt.");
      }
      var v3067 = v3058.prng || v3056.random;
      var v3068 = {};
      v3068.encode = function (v3069, v3070) {
        var v3071 = v3061;
        var v3072;
        var v3073 = v3070 - 1;
        var v3074 = Math.ceil(v3073 / 8);
        var v3075 = v3069.digest().getBytes();
        if (v3074 < v3064 + v3066 + 2) {
          throw new Error("Message is too long to encrypt.");
        }
        var v3076;
        if (v3065 === null) {
          v3076 = v3067.getBytesSync(v3066);
        } else {
          v3076 = v3065.bytes();
        }
        var v3077 = new v3056.util.ByteBuffer();
        v3077.fillWithByte(0, 8);
        v3077.putBytes(v3075);
        v3077.putBytes(v3076);
        v3062.start();
        v3062.update(v3077.getBytes());
        var v3078 = v3062.digest().getBytes();
        var v3079 = new v3056.util.ByteBuffer();
        v3079.fillWithByte(0, v3074 - v3066 - v3064 - 2);
        v3079.putByte(1);
        v3079.putBytes(v3076);
        var v3080 = v3079.getBytes();
        var v3081 = v3074 - v3064 - 1;
        var v3082 = v3063.generate(v3078, v3081);
        var v3083 = "";
        for (v3072 = 0; v3072 < v3081; v3072++) {
          v3083 += String.fromCharCode(v3080.charCodeAt(v3072) ^ v3082.charCodeAt(v3072));
        }
        var v3084 = 65280 >> v3074 * 8 - v3073 & 255;
        v3083 = String.fromCharCode(v3083.charCodeAt(0) & ~v3084) + v3083.substr(1);
        return v3083 + v3078 + String.fromCharCode(188);
      };
      v3068.verify = function (v3085, v3086, v3087) {
        var v3088 = v3061;
        var v3089;
        var v3090 = v3087 - 1;
        var v3091 = Math.ceil(v3090 / 8);
        v3086 = v3086.substr(-v3091);
        if (v3091 < v3064 + v3066 + 2) {
          throw new Error("Inconsistent parameters to PSS signature verification.");
        }
        if (v3086.charCodeAt(v3091 - 1) !== 188) {
          throw new Error("Encoded message does not end in 0xBC.");
        }
        var v3092 = v3091 - v3064 - 1;
        var v3093 = v3086.substr(0, v3092);
        var v3094 = v3086.substr(v3092, v3064);
        var v3095 = 65280 >> v3091 * 8 - v3090 & 255;
        if ((v3093.charCodeAt(0) & v3095) !== 0) {
          throw new Error("Bits beyond keysize not zero as expected.");
        }
        var v3096 = v3063.generate(v3094, v3092);
        var v3097 = "";
        for (v3089 = 0; v3089 < v3092; v3089++) {
          v3097 += String.fromCharCode(v3093.charCodeAt(v3089) ^ v3096.charCodeAt(v3089));
        }
        v3097 = String.fromCharCode(v3097.charCodeAt(0) & ~v3095) + v3097.substr(1);
        var v3098 = v3091 - v3064 - v3066 - 2;
        for (v3089 = 0; v3089 < v3098; v3089++) {
          if (v3097.charCodeAt(v3089) !== 0) {
            throw new Error("Leftmost octets not zero as expected");
          }
        }
        if (v3097.charCodeAt(v3098) !== 1) {
          throw new Error("Inconsistent PSS signature, 0x01 marker not found");
        }
        var v3099 = v3097.substr(-v3066);
        var v3100 = new v3056.util.ByteBuffer();
        v3100.fillWithByte(0, 8);
        v3100.putBytes(v3085);
        v3100.putBytes(v3099);
        v3062.start();
        v3062.update(v3100.getBytes());
        var v3101 = v3062.digest().getBytes();
        return v3094 === v3101;
      };
      return v3068;
    };
  }
});
var require_x509 = __commonJS({
  "node_modules/node-forge/lib/x509.js"(v3102, v3103) {
    var v3104 = {
      dh1392: 400,
      dh1393: 891,
      dh1394: 1358,
      dh1395: 257,
      dh1396: 1027,
      dh1397: 785,
      dh1398: 1045,
      dh1399: 481,
      dh1400: 1045,
      dh1401: 1000,
      dh1402: 340,
      dh1403: 1045,
      dh1404: 1027,
      dh1405: 522,
      dh1406: 1045,
      dh1407: 738,
      dh1408: 738,
      dh1409: 551,
      dh1410: 1045,
      dh1411: 491,
      dh1412: 231,
      dh1413: 1233,
      dh1414: 785,
      dh1415: 1045,
      dh1416: 1045,
      dh1417: 1027,
      dh1418: 1468,
      dh1419: 1495,
      dh1420: 1398,
      dh1421: 738,
      dh1422: 306,
      dh1423: 1045,
      dh1424: 682,
      dh1425: 738,
      dh1426: 427,
      dh1427: 1027,
      dh1428: 1027,
      dh1429: 1045,
      dh1430: 738,
      dh1431: 519,
      dh1432: 305,
      dh1433: 1523,
      dh1434: 1020,
      dh1435: 371,
      dh1436: 436,
      dh1437: 460,
      dh1438: 819,
      dh1439: 886,
      dh1440: 255,
      dh1441: 687
    };
    var v3105 = {
      dh1442: 1423,
      dh1443: 1464,
      dh1444: 1199,
      dh1445: 1199,
      dh1446: 1079,
      dh1447: 1036,
      dh1448: 619,
      dh1449: 289,
      dh1450: 857,
      dh1451: 1182,
      dh1452: 984,
      dh1453: 1239,
      dh1454: 1118,
      dh1455: 1133,
      dh1456: 857,
      dh1457: 956,
      dh1458: 1018,
      dh1459: 895,
      dh1460: 1133,
      dh1461: 1457,
      dh1462: 498,
      dh1463: 1219
    };
    var v3106 = {
      dh1464: 1261,
      dh1465: 1261
    };
    var v3107 = {
      dh1466: 1020,
      dh1467: 1509,
      dh1468: 945,
      dh1469: 1509,
      dh1470: 464,
      dh1471: 918,
      dh1472: 1025,
      dh1473: 857,
      dh1474: 918
    };
    var v3108 = {
      dh1475: 464
    };
    var v3109 = {
      dh1476: 1509
    };
    var v3110 = {
      dh1477: 945,
      dh1478: 918,
      dh1479: 464,
      dh1480: 464,
      dh1481: 1509,
      dh1482: 918
    };
    var v3111 = {
      dh1483: 1045,
      dh1484: 1495,
      dh1485: 1144,
      dh1486: 738
    };
    var v3112 = {
      dh1487: 1144,
      dh1488: 1495,
      dh1489: 884,
      dh1490: 1025,
      dh1491: 1144,
      dh1492: 322,
      dh1493: 1068,
      dh1494: 531,
      dh1495: 738
    };
    var v3113 = {
      dh1496: 1144,
      dh1497: 1045,
      dh1498: 1231,
      dh1499: 687
    };
    var v3114 = {
      dh1500: 447,
      dh1501: 738,
      dh1502: 1045,
      dh1503: 884,
      dh1504: 1408,
      dh1505: 545,
      dh1506: 1045,
      dh1507: 499
    };
    var v3115 = {
      dh1508: 738,
      dh1509: 1027,
      dh1510: 682,
      dh1511: 1509
    };
    var v3116 = {
      dh1512: 1045,
      dh1513: 1144,
      dh1514: 1025,
      dh1515: 1027,
      dh1516: 581,
      dh1517: 1495,
      dh1518: 404,
      dh1519: 1027,
      dh1520: 1509,
      dh1521: 692,
      dh1522: 1231,
      dh1523: 1045,
      dh1524: 1449,
      dh1525: 1045,
      dh1526: 738,
      dh1527: 1449
    };
    var v3117 = {
      dh1528: 1144,
      dh1529: 738,
      dh1530: 1439
    };
    var v3118 = {
      dh1531: 1027,
      dh1532: 738,
      dh1533: 1045
    };
    var v3119 = {
      dh1534: 531,
      dh1535: 1045,
      dh1536: 1495,
      dh1537: 884,
      dh1538: 1164,
      dh1539: 1144,
      dh1540: 738,
      dh1541: 1164,
      dh1542: 1045,
      dh1543: 1027,
      dh1544: 884,
      dh1545: 1025,
      dh1546: 458,
      dh1547: 306
    };
    var v3120 = {
      dh1548: 956,
      dh1549: 1358,
      dh1550: 795,
      dh1551: 871,
      dh1552: 322,
      dh1553: 1045,
      dh1554: 956,
      dh1555: 358,
      dh1556: 738,
      dh1557: 1144,
      dh1558: 1027,
      dh1559: 595,
      dh1560: 507,
      dh1561: 1144,
      dh1562: 682,
      dh1563: 1025,
      dh1564: 531,
      dh1565: 1045,
      dh1566: 863,
      dh1567: 750,
      dh1568: 1324,
      dh1569: 1231,
      dh1570: 1045,
      dh1571: 1072,
      dh1572: 785,
      dh1573: 597,
      dh1574: 619,
      dh1575: 884,
      dh1576: 1500,
      dh1577: 306,
      dh1578: 956,
      dh1579: 883,
      dh1580: 857,
      dh1581: 1238,
      dh1582: 273,
      dh1583: 648,
      dh1584: 1238,
      dh1585: 738,
      dh1586: 1038,
      dh1587: 1144,
      dh1588: 1041,
      dh1589: 1238,
      dh1590: 1041,
      dh1591: 1041,
      dh1592: 306,
      dh1593: 1144,
      dh1594: 1144,
      dh1595: 1045,
      dh1596: 857,
      dh1597: 795,
      dh1598: 1003
    };
    var v3121 = {
      dh1599: 1358,
      dh1600: 956,
      dh1601: 245,
      dh1602: 1231,
      dh1603: 531,
      dh1604: 687,
      dh1605: 808,
      dh1606: 279
    };
    var v3122 = {
      dh1607: 1027,
      dh1608: 785,
      dh1609: 1554,
      dh1610: 1027,
      dh1611: 1277,
      dh1612: 1351,
      dh1613: 1027,
      dh1614: 1027
    };
    var v3123 = {
      dh1615: 1551,
      dh1616: 1509,
      dh1617: 918,
      dh1618: 1554
    };
    var v3124 = {
      dh1619: 1299,
      dh1620: 1025
    };
    var v3125 = {
      dh1621: 678,
      dh1622: 985,
      dh1623: 1408,
      dh1624: 1551,
      dh1625: 1299,
      dh1626: 1025
    };
    var v3126 = {
      dh1627: 1554
    };
    var v3127 = {
      dh1628: 1509
    };
    var v3128 = {
      dh1629: 673,
      dh1630: 851,
      dh1631: 1250,
      dh1632: 1408,
      dh1633: 943,
      dh1634: 1068,
      dh1635: 352,
      dh1636: 1025,
      dh1637: 1316,
      dh1638: 1077
    };
    var v3129 = {
      dh1639: 1231,
      dh1640: 1359,
      dh1641: 1231,
      dh1642: 1231,
      dh1643: 1231,
      dh1644: 993,
      dh1645: 836,
      dh1646: 358,
      dh1647: 1143,
      dh1648: 1027,
      dh1649: 1231,
      dh1650: 1250,
      dh1651: 1024,
      dh1652: 417,
      dh1653: 301,
      dh1654: 1143,
      dh1655: 1231
    };
    var v3130 = {
      dh1656: 857,
      dh1657: 531,
      dh1658: 504,
      dh1659: 1231
    };
    var v3131 = {
      dh1660: 548,
      dh1661: 271,
      dh1662: 1445,
      dh1663: 400,
      dh1664: 545,
      dh1665: 392,
      dh1666: 378,
      dh1667: 1250,
      dh1668: 1073,
      dh1669: 664,
      dh1670: 531,
      dh1671: 254,
      dh1672: 668,
      dh1673: 1292,
      dh1674: 638,
      dh1675: 1199,
      dh1676: 1068,
      dh1677: 1057,
      dh1678: 352,
      dh1679: 578,
      dh1680: 978,
      dh1681: 1449,
      dh1682: 918,
      dh1683: 321,
      dh1684: 1025,
      dh1685: 1509,
      dh1686: 1060,
      dh1687: 1077,
      dh1688: 1337,
      dh1689: 694
    };
    var v3132 = {
      dh1690: 531
    };
    var v3133 = {
      dh1691: 404
    };
    var v3134 = {
      dh1692: 271,
      dh1693: 499,
      dh1694: 1551,
      dh1695: 1199,
      dh1696: 1079,
      dh1697: 910,
      dh1698: 1554,
      dh1699: 1509,
      dh1700: 694,
      dh1701: 1215,
      dh1702: 450,
      dh1703: 273
    };
    var v3135 = {
      dh1704: 1493
    };
    var v3136 = {
      dh1705: 918,
      dh1706: 1554,
      dh1707: 857,
      dh1708: 1554
    };
    var v3137 = {
      dh1709: 1554
    };
    var v3138 = {
      dh1710: 404
    };
    var v3139 = {
      dh1711: 262,
      dh1712: 1025
    };
    var v3140 = {
      dh1713: 597,
      dh1714: 1453,
      dh1715: 603,
      dh1716: 597,
      dh1717: 1051
    };
    var v3141 = {
      dh1718: 1057,
      dh1719: 1178,
      dh1720: 352,
      dh1721: 292,
      dh1722: 294,
      dh1723: 699,
      dh1724: 705
    };
    var v3142 = {
      dh1725: 1056,
      dh1726: 1025
    };
    var v3143 = {
      dh1727: 1025,
      dh1728: 416
    };
    var v3144 = {
      dh1729: 597,
      dh1730: 1491,
      dh1731: 1453,
      dh1732: 313,
      dh1733: 1409
    };
    var v3145 = {
      dh1734: 886,
      dh1735: 297,
      dh1736: 416
    };
    var v3146 = {
      dh1737: 615,
      dh1738: 597,
      dh1739: 534,
      dh1740: 1409
    };
    var v3147 = {
      dh1741: 676,
      dh1742: 714,
      dh1743: 545,
      dh1744: 378,
      dh1745: 1362,
      dh1746: 1164,
      dh1747: 324,
      dh1748: 1164,
      dh1749: 1144,
      dh1750: 1109,
      dh1751: 545,
      dh1752: 918,
      dh1753: 378,
      dh1754: 669,
      dh1755: 694
    };
    var v3148 = {
      dh1756: 1144,
      dh1757: 1310,
      dh1758: 555,
      dh1759: 611
    };
    var v3149 = {
      dh1760: 918,
      dh1761: 1164,
      dh1762: 1250,
      dh1763: 1398
    };
    var v3150 = {
      dh1764: 597,
      dh1765: 288,
      dh1766: 288
    };
    var v3151 = {
      dh1767: 1231,
      dh1768: 597,
      dh1769: 531
    };
    var v3152 = {
      dh1770: 1231,
      dh1771: 956
    };
    var v3153 = v2;
    var v3154 = require_forge();
    require_aes();
    require_asn1();
    require_des();
    require_md();
    require_mgf();
    require_oids();
    require_pem();
    require_pss();
    require_rsa();
    require_util();
    var v3155 = v3154.asn1;
    var v3156 = v3103.exports = v3154.pki = v3154.pki || {};
    var v3157 = v3156.oids;
    var v3158 = {
      CN: v3157.commonName,
      commonName: "CN",
      C: v3157.countryName,
      countryName: "C",
      L: v3157.localityName,
      localityName: "L",
      ST: v3157.stateOrProvinceName,
      stateOrProvinceName: "ST",
      O: v3157.organizationName,
      organizationName: "O",
      OU: v3157.organizationalUnitName,
      organizationalUnitName: "OU",
      E: v3157.emailAddress,
      emailAddress: "E"
    };
    var v3159 = v3154.pki.rsa.publicKeyValidator;
    var v3160 = {
      name: "Certificate",
      tagClass: v3155.Class.UNIVERSAL,
      type: v3155.Type.SEQUENCE,
      constructed: true,
      value: [{
        name: "Certificate.TBSCertificate",
        tagClass: v3155.Class.UNIVERSAL,
        type: v3155.Type.SEQUENCE,
        constructed: true,
        captureAsn1: "tbsCertificate",
        value: [{
          name: "Certificate.TBSCertificate.version",
          tagClass: v3155.Class.CONTEXT_SPECIFIC,
          type: 0,
          constructed: true,
          optional: true,
          value: [{
            name: "Certificate.TBSCertificate.version.integer",
            tagClass: v3155.Class.UNIVERSAL,
            type: v3155.Type.INTEGER,
            constructed: false,
            capture: "certVersion"
          }]
        }, {
          name: "Certificate.TBSCertificate.serialNumber",
          tagClass: v3155.Class.UNIVERSAL,
          type: v3155.Type.INTEGER,
          constructed: false,
          capture: "certSerialNumber"
        }, {
          name: "Certificate.TBSCertificate.signature",
          tagClass: v3155.Class.UNIVERSAL,
          type: v3155.Type.SEQUENCE,
          constructed: true,
          value: [{
            name: "Certificate.TBSCertificate.signature.algorithm",
            tagClass: v3155.Class.UNIVERSAL,
            type: v3155.Type.OID,
            constructed: false,
            capture: "certinfoSignatureOid"
          }, {
            name: "Certificate.TBSCertificate.signature.parameters",
            tagClass: v3155.Class.UNIVERSAL,
            optional: true,
            captureAsn1: "certinfoSignatureParams"
          }]
        }, {
          name: "Certificate.TBSCertificate.issuer",
          tagClass: v3155.Class.UNIVERSAL,
          type: v3155.Type.SEQUENCE,
          constructed: true,
          captureAsn1: "certIssuer"
        }, {
          name: "Certificate.TBSCertificate.validity",
          tagClass: v3155.Class.UNIVERSAL,
          type: v3155.Type.SEQUENCE,
          constructed: true,
          value: [{
            name: "Certificate.TBSCertificate.validity.notBefore (utc)",
            tagClass: v3155.Class.UNIVERSAL,
            type: v3155.Type.UTCTIME,
            constructed: false,
            optional: true,
            capture: "certValidity1UTCTime"
          }, {
            name: "Certificate.TBSCertificate.validity.notBefore (generalized)",
            tagClass: v3155.Class.UNIVERSAL,
            type: v3155.Type.GENERALIZEDTIME,
            constructed: false,
            optional: true,
            capture: "certValidity2GeneralizedTime"
          }, {
            name: "Certificate.TBSCertificate.validity.notAfter (utc)",
            tagClass: v3155.Class.UNIVERSAL,
            type: v3155.Type.UTCTIME,
            constructed: false,
            optional: true,
            capture: "certValidity3UTCTime"
          }, {
            name: "Certificate.TBSCertificate.validity.notAfter (generalized)",
            tagClass: v3155.Class.UNIVERSAL,
            type: v3155.Type.GENERALIZEDTIME,
            constructed: false,
            optional: true,
            capture: "certValidity4GeneralizedTime"
          }]
        }, {
          name: "Certificate.TBSCertificate.subject",
          tagClass: v3155.Class.UNIVERSAL,
          type: v3155.Type.SEQUENCE,
          constructed: true,
          captureAsn1: "certSubject"
        }, v3159, {
          name: "Certificate.TBSCertificate.issuerUniqueID",
          tagClass: v3155.Class.CONTEXT_SPECIFIC,
          type: 1,
          constructed: true,
          optional: true,
          value: [{
            name: "Certificate.TBSCertificate.issuerUniqueID.id",
            tagClass: v3155.Class.UNIVERSAL,
            type: v3155.Type.BITSTRING,
            constructed: false,
            captureBitStringValue: "certIssuerUniqueId"
          }]
        }, {
          name: "Certificate.TBSCertificate.subjectUniqueID",
          tagClass: v3155.Class.CONTEXT_SPECIFIC,
          type: 2,
          constructed: true,
          optional: true,
          value: [{
            name: "Certificate.TBSCertificate.subjectUniqueID.id",
            tagClass: v3155.Class.UNIVERSAL,
            type: v3155.Type.BITSTRING,
            constructed: false,
            captureBitStringValue: "certSubjectUniqueId"
          }]
        }, {
          name: "Certificate.TBSCertificate.extensions",
          tagClass: v3155.Class.CONTEXT_SPECIFIC,
          type: 3,
          constructed: true,
          captureAsn1: "certExtensions",
          optional: true
        }]
      }, {
        name: "Certificate.signatureAlgorithm",
        tagClass: v3155.Class.UNIVERSAL,
        type: v3155.Type.SEQUENCE,
        constructed: true,
        value: [{
          name: "Certificate.signatureAlgorithm.algorithm",
          tagClass: v3155.Class.UNIVERSAL,
          type: v3155.Type.OID,
          constructed: false,
          capture: "certSignatureOid"
        }, {
          name: "Certificate.TBSCertificate.signature.parameters",
          tagClass: v3155.Class.UNIVERSAL,
          optional: true,
          captureAsn1: "certSignatureParams"
        }]
      }, {
        name: "Certificate.signatureValue",
        tagClass: v3155.Class.UNIVERSAL,
        type: v3155.Type.BITSTRING,
        constructed: false,
        captureBitStringValue: "certSignature"
      }]
    };
    var v3161 = {
      name: "rsapss",
      tagClass: v3155.Class.UNIVERSAL,
      type: v3155.Type.SEQUENCE,
      constructed: true,
      value: [{
        name: "rsapss.hashAlgorithm",
        tagClass: v3155.Class.CONTEXT_SPECIFIC,
        type: 0,
        constructed: true,
        value: [{
          name: "rsapss.hashAlgorithm.AlgorithmIdentifier",
          tagClass: v3155.Class.UNIVERSAL,
          type: v3155.Class.SEQUENCE,
          constructed: true,
          optional: true,
          value: [{
            name: "rsapss.hashAlgorithm.AlgorithmIdentifier.algorithm",
            tagClass: v3155.Class.UNIVERSAL,
            type: v3155.Type.OID,
            constructed: false,
            capture: "hashOid"
          }]
        }]
      }, {
        name: "rsapss.maskGenAlgorithm",
        tagClass: v3155.Class.CONTEXT_SPECIFIC,
        type: 1,
        constructed: true,
        value: [{
          name: "rsapss.maskGenAlgorithm.AlgorithmIdentifier",
          tagClass: v3155.Class.UNIVERSAL,
          type: v3155.Class.SEQUENCE,
          constructed: true,
          optional: true,
          value: [{
            name: "rsapss.maskGenAlgorithm.AlgorithmIdentifier.algorithm",
            tagClass: v3155.Class.UNIVERSAL,
            type: v3155.Type.OID,
            constructed: false,
            capture: "maskGenOid"
          }, {
            name: "rsapss.maskGenAlgorithm.AlgorithmIdentifier.params",
            tagClass: v3155.Class.UNIVERSAL,
            type: v3155.Type.SEQUENCE,
            constructed: true,
            value: [{
              name: "rsapss.maskGenAlgorithm.AlgorithmIdentifier.params.algorithm",
              tagClass: v3155.Class.UNIVERSAL,
              type: v3155.Type.OID,
              constructed: false,
              capture: "maskGenHashOid"
            }]
          }]
        }]
      }, {
        name: "rsapss.saltLength",
        tagClass: v3155.Class.CONTEXT_SPECIFIC,
        type: 2,
        optional: true,
        value: [{
          name: "rsapss.saltLength.saltLength",
          tagClass: v3155.Class.UNIVERSAL,
          type: v3155.Class.INTEGER,
          constructed: false,
          capture: "saltLength"
        }]
      }, {
        name: "rsapss.trailerField",
        tagClass: v3155.Class.CONTEXT_SPECIFIC,
        type: 3,
        optional: true,
        value: [{
          name: "rsapss.trailer.trailer",
          tagClass: v3155.Class.UNIVERSAL,
          type: v3155.Class.INTEGER,
          constructed: false,
          capture: "trailer"
        }]
      }]
    };
    var v3162 = {
      name: "CertificationRequestInfo",
      tagClass: v3155.Class.UNIVERSAL,
      type: v3155.Type.SEQUENCE,
      constructed: true,
      captureAsn1: "certificationRequestInfo",
      value: [{
        name: "CertificationRequestInfo.integer",
        tagClass: v3155.Class.UNIVERSAL,
        type: v3155.Type.INTEGER,
        constructed: false,
        capture: "certificationRequestInfoVersion"
      }, {
        name: "CertificationRequestInfo.subject",
        tagClass: v3155.Class.UNIVERSAL,
        type: v3155.Type.SEQUENCE,
        constructed: true,
        captureAsn1: "certificationRequestInfoSubject"
      }, v3159, {
        name: "CertificationRequestInfo.attributes",
        tagClass: v3155.Class.CONTEXT_SPECIFIC,
        type: 0,
        constructed: true,
        optional: true,
        capture: "certificationRequestInfoAttributes",
        value: [{
          name: "CertificationRequestInfo.attributes",
          tagClass: v3155.Class.UNIVERSAL,
          type: v3155.Type.SEQUENCE,
          constructed: true,
          value: [{
            name: "CertificationRequestInfo.attributes.type",
            tagClass: v3155.Class.UNIVERSAL,
            type: v3155.Type.OID,
            constructed: false
          }, {
            name: "CertificationRequestInfo.attributes.value",
            tagClass: v3155.Class.UNIVERSAL,
            type: v3155.Type.SET,
            constructed: true
          }]
        }]
      }]
    };
    var v3163 = {
      name: "CertificationRequest",
      tagClass: v3155.Class.UNIVERSAL,
      type: v3155.Type.SEQUENCE,
      constructed: true,
      captureAsn1: "csr",
      value: [v3162, {
        name: "CertificationRequest.signatureAlgorithm",
        tagClass: v3155.Class.UNIVERSAL,
        type: v3155.Type.SEQUENCE,
        constructed: true,
        value: [{
          name: "CertificationRequest.signatureAlgorithm.algorithm",
          tagClass: v3155.Class.UNIVERSAL,
          type: v3155.Type.OID,
          constructed: false,
          capture: "csrSignatureOid"
        }, {
          name: "CertificationRequest.signatureAlgorithm.parameters",
          tagClass: v3155.Class.UNIVERSAL,
          optional: true,
          captureAsn1: "csrSignatureParams"
        }]
      }, {
        name: "CertificationRequest.signature",
        tagClass: v3155.Class.UNIVERSAL,
        type: v3155.Type.BITSTRING,
        constructed: false,
        captureBitStringValue: "csrSignature"
      }]
    };
    v3156.RDNAttributesAsArray = function (v3164, v3165) {
      var v3166 = v3153;
      var v3167 = [];
      var v3168;
      var v3169;
      var v3170;
      for (var v3171 = 0; v3171 < v3164.value.length; ++v3171) {
        v3168 = v3164.value[v3171];
        for (var v3172 = 0; v3172 < v3168.value.length; ++v3172) {
          v3170 = {};
          v3169 = v3168.value[v3172];
          v3170.type = v3155.derToOid(v3169.value[0].value);
          v3170.value = v3169.value[1].value;
          v3170.valueTagClass = v3169.value[1].type;
          if (v3170.type in v3157) {
            v3170.name = v3157[v3170.type];
            if (v3170.name in v3158) {
              v3170.shortName = v3158[v3170.name];
            }
          }
          if (v3165) {
            v3165.update(v3170.type);
            v3165.update(v3170.value);
          }
          v3167.push(v3170);
        }
      }
      return v3167;
    };
    v3156.CRIAttributesAsArray = function (v3173) {
      var v3174 = v3153;
      var v3175 = [];
      for (var v3176 = 0; v3176 < v3173.length; ++v3176) {
        var v3177 = v3173[v3176];
        var v3178 = v3155.derToOid(v3177.value[0].value);
        var v3179 = v3177.value[1].value;
        for (var v3180 = 0; v3180 < v3179.length; ++v3180) {
          var v3181 = {
            type: v3178,
            value: v3179[v3180].value,
            valueTagClass: v3179[v3180].type
          };
          if (v3181.type in v3157) {
            v3181.name = v3157[v3181.type];
            if (v3181.name in v3158) {
              v3181.shortName = v3158[v3181.name];
            }
          }
          if (v3181.type === v3157.extensionRequest) {
            v3181.extensions = [];
            for (var v3182 = 0; v3182 < v3181.value.length; ++v3182) {
              v3181.extensions.push(v3156.certificateExtensionFromAsn1(v3181.value[v3182]));
            }
          }
          v3175.push(v3181);
        }
      }
      return v3175;
    };
    function v3183(v3184, v3185) {
      var v3186 = v3153;
      if (typeof v3185 === "string") {
        v3185 = {
          shortName: v3185
        };
      }
      var v3187 = null;
      var v3188;
      for (var v3189 = 0; v3187 === null && v3189 < v3184.attributes.length; ++v3189) {
        v3188 = v3184.attributes[v3189];
        if (v3185.type && v3185.type === v3188.type) {
          v3187 = v3188;
        } else if (v3185.name && v3185.name === v3188.name) {
          v3187 = v3188;
        } else if (v3185.shortName && v3185.shortName === v3188.shortName) {
          v3187 = v3188;
        }
      }
      return v3187;
    }
    function v3190(v3191, v3192, v3193) {
      var v3194 = v3153;
      var v3195 = {};
      if (v3191 !== v3157["RSASSA-PSS"]) {
        return v3195;
      }
      if (v3193) {
        v3195 = {
          hash: {
            algorithmOid: v3157.sha1
          },
          mgf: {
            algorithmOid: v3157.mgf1,
            hash: {
              algorithmOid: v3157.sha1
            }
          },
          saltLength: 20
        };
      }
      var v3196 = {};
      var v3197 = [];
      if (!v3155.validate(v3192, v3161, v3196, v3197)) {
        var v3198 = new Error("Cannot read RSASSA-PSS parameter block.");
        v3198.errors = v3197;
        throw v3198;
      }
      if (v3196.hashOid !== undefined) {
        v3195.hash = v3195.hash || {};
        v3195.hash.algorithmOid = v3155.derToOid(v3196.hashOid);
      }
      if (v3196.maskGenOid !== undefined) {
        v3195.mgf = v3195.mgf || {};
        v3195.mgf.algorithmOid = v3155.derToOid(v3196.maskGenOid);
        v3195.mgf.hash = v3195.mgf.hash || {};
        v3195.mgf.hash.algorithmOid = v3155.derToOid(v3196.maskGenHashOid);
      }
      if (v3196.saltLength !== undefined) {
        v3195.saltLength = v3196.saltLength.charCodeAt(0);
      }
      return v3195;
    }
    function v3199(v3200) {
      var v3201 = v3153;
      switch (v3157[v3200.signatureOid]) {
        case "sha1WithRSAEncryption":
        case "sha1WithRSASignature":
          return v3154.md.sha1.create();
        case "md5WithRSAEncryption":
          return v3154.md.md5.create();
        case "sha256WithRSAEncryption":
          return v3154.md.sha256.create();
        case "sha384WithRSAEncryption":
          return v3154.md.sha384.create();
        case "sha512WithRSAEncryption":
          return v3154.md.sha512.create();
        case "RSASSA-PSS":
          return v3154.md.sha256.create();
        default:
          var v3202 = new Error("Could not compute " + v3200.type + " digest. Unknown signature OID.");
          v3202.signatureOid = v3200.signatureOid;
          throw v3202;
      }
    }
    function v3203(v3204) {
      var v3205 = v3153;
      var v3206 = v3204.certificate;
      var v3207;
      switch (v3206.signatureOid) {
        case v3157.sha1WithRSAEncryption:
        case v3157.sha1WithRSASignature:
          break;
        case v3157["RSASSA-PSS"]:
          var v3208;
          var v3209;
          v3208 = v3157[v3206.signatureParameters.mgf.hash.algorithmOid];
          if (v3208 === undefined || v3154.md[v3208] === undefined) {
            var v3210 = new Error("Unsupported MGF hash function.");
            v3210.oid = v3206.signatureParameters.mgf.hash.algorithmOid;
            v3210.name = v3208;
            throw v3210;
          }
          v3209 = v3157[v3206.signatureParameters.mgf.algorithmOid];
          if (v3209 === undefined || v3154.mgf[v3209] === undefined) {
            var v3210 = new Error("Unsupported MGF function.");
            v3210.oid = v3206.signatureParameters.mgf.algorithmOid;
            v3210.name = v3209;
            throw v3210;
          }
          v3209 = v3154.mgf[v3209].create(v3154.md[v3208].create());
          v3208 = v3157[v3206.signatureParameters.hash.algorithmOid];
          if (v3208 === undefined || v3154.md[v3208] === undefined) {
            var v3210 = new Error("Unsupported RSASSA-PSS hash function.");
            v3210.oid = v3206.signatureParameters.hash.algorithmOid;
            v3210.name = v3208;
            throw v3210;
          }
          v3207 = v3154.pss.create(v3154.md[v3208].create(), v3209, v3206.signatureParameters.saltLength);
          break;
      }
      return v3206.publicKey.verify(v3204.md.digest().getBytes(), v3204.signature, v3207);
    }
    v3156.certificateFromPem = function (v3211, v3212, v3213) {
      var v3214 = v3153;
      var v3215 = v3154.pem.decode(v3211)[0];
      if (v3215.type !== "CERTIFICATE" && v3215.type !== "X509 CERTIFICATE" && v3215.type !== "TRUSTED CERTIFICATE") {
        var v3216 = new Error("Could not convert certificate from PEM; PEM header type is not \"CERTIFICATE\", \"X509 CERTIFICATE\", or \"TRUSTED CERTIFICATE\".");
        v3216.headerType = v3215.type;
        throw v3216;
      }
      if (v3215.procType && v3215.procType.type === "ENCRYPTED") {
        throw new Error("Could not convert certificate from PEM; PEM is encrypted.");
      }
      var v3217 = v3155.fromDer(v3215.body, v3213);
      return v3156.certificateFromAsn1(v3217, v3212);
    };
    v3156.certificateToPem = function (v3218, v3219) {
      var v3220 = v3153;
      var v3221 = {
        type: "CERTIFICATE",
        body: v3155.toDer(v3156.certificateToAsn1(v3218)).getBytes()
      };
      return v3154.pem.encode(v3221, {
        maxline: v3219
      });
    };
    v3156.publicKeyFromPem = function (v3222) {
      var v3223 = v3153;
      var v3224 = v3154.pem.decode(v3222)[0];
      if (v3224.type !== "PUBLIC KEY" && v3224.type !== "RSA PUBLIC KEY") {
        var v3225 = new Error("Could not convert public key from PEM; PEM header type is not \"PUBLIC KEY\" or \"RSA PUBLIC KEY\".");
        v3225.headerType = v3224.type;
        throw v3225;
      }
      if (v3224.procType && v3224.procType.type === "ENCRYPTED") {
        throw new Error("Could not convert public key from PEM; PEM is encrypted.");
      }
      var v3226 = v3155.fromDer(v3224.body);
      return v3156.publicKeyFromAsn1(v3226);
    };
    v3156.publicKeyToPem = function (v3227, v3228) {
      var v3229 = v3153;
      var v3230 = {
        type: "PUBLIC KEY",
        body: v3155.toDer(v3156.publicKeyToAsn1(v3227)).getBytes()
      };
      return v3154.pem.encode(v3230, {
        maxline: v3228
      });
    };
    v3156.publicKeyToRSAPublicKeyPem = function (v3231, v3232) {
      var v3233 = v3153;
      var v3234 = {
        type: "RSA PUBLIC KEY",
        body: v3155.toDer(v3156.publicKeyToRSAPublicKey(v3231)).getBytes()
      };
      return v3154.pem.encode(v3234, {
        maxline: v3232
      });
    };
    v3156.getPublicKeyFingerprint = function (v3235, v3236) {
      var v3237 = v3153;
      v3236 = v3236 || {};
      var v3238 = v3236.md || v3154.md.sha1.create();
      var v3239 = v3236.type || "RSAPublicKey";
      var v3240;
      switch (v3239) {
        case "RSAPublicKey":
          v3240 = v3155.toDer(v3156.publicKeyToRSAPublicKey(v3235)).getBytes();
          break;
        case "SubjectPublicKeyInfo":
          v3240 = v3155.toDer(v3156.publicKeyToAsn1(v3235)).getBytes();
          break;
        default:
          throw new Error("Unknown fingerprint type \"" + v3236.type + "\".");
      }
      v3238.start();
      v3238.update(v3240);
      var v3241 = v3238.digest();
      if (v3236.encoding === "hex") {
        var v3242 = v3241.toHex();
        if (v3236.delimiter) {
          return v3242.match(/.{2}/g).join(v3236.delimiter);
        }
        return v3242;
      } else if (v3236.encoding === "binary") {
        return v3241.getBytes();
      } else if (v3236.encoding) {
        throw new Error("Unknown encoding \"" + v3236.encoding + "\".");
      }
      return v3241;
    };
    v3156.certificationRequestFromPem = function (v3243, v3244, v3245) {
      var v3246 = v3153;
      var v3247 = v3154.pem.decode(v3243)[0];
      if (v3247.type !== "CERTIFICATE REQUEST") {
        var v3248 = new Error("Could not convert certification request from PEM; PEM header type is not \"CERTIFICATE REQUEST\".");
        v3248.headerType = v3247.type;
        throw v3248;
      }
      if (v3247.procType && v3247.procType.type === "ENCRYPTED") {
        throw new Error("Could not convert certification request from PEM; PEM is encrypted.");
      }
      var v3249 = v3155.fromDer(v3247.body, v3245);
      return v3156.certificationRequestFromAsn1(v3249, v3244);
    };
    v3156.certificationRequestToPem = function (v3250, v3251) {
      var v3252 = v3153;
      var v3253 = {
        type: "CERTIFICATE REQUEST",
        body: v3155.toDer(v3156.certificationRequestToAsn1(v3250)).getBytes()
      };
      return v3154.pem.encode(v3253, {
        maxline: v3251
      });
    };
    v3156.createCertificate = function () {
      var v3254 = {
        dh1772: 849,
        dh1773: 273,
        dh1774: 1025,
        dh1775: 619
      };
      var v3255 = {
        dh1776: 694
      };
      var v3256 = {
        dh1777: 450,
        dh1778: 828,
        dh1779: 1281,
        dh1780: 447,
        dh1781: 1068,
        dh1782: 352,
        dh1783: 1025,
        dh1784: 499
      };
      var v3257 = {
        dh1785: 985,
        dh1786: 447
      };
      var v3258 = {
        dh1787: 277,
        dh1788: 956
      };
      var v3259 = {
        dh1789: 404,
        dh1790: 1449
      };
      var v3260 = v3153;
      var v3261 = {
        version: 2,
        serialNumber: "00",
        signatureOid: null,
        signature: null,
        siginfo: {}
      };
      v3261.siginfo.algorithmOid = null;
      v3261.validity = {};
      v3261.validity.notBefore = new Date();
      v3261.validity.notAfter = new Date();
      v3261.issuer = {};
      v3261.issuer.getField = function (v3262) {
        var v3263 = v3260;
        return v3183(v3261.issuer, v3262);
      };
      v3261.issuer.addField = function (v3264) {
        var v3265 = v3260;
        v3266([v3264]);
        v3261.issuer.attributes.push(v3264);
      };
      v3261.issuer.attributes = [];
      v3261.issuer.hash = null;
      v3261.subject = {};
      v3261.subject.getField = function (v3267) {
        var v3268 = v3260;
        return v3183(v3261.subject, v3267);
      };
      v3261.subject.addField = function (v3269) {
        v3266([v3269]);
        v3261.subject.attributes.push(v3269);
      };
      v3261.subject.attributes = [];
      v3261.subject.hash = null;
      v3261.extensions = [];
      v3261.publicKey = null;
      v3261.md = null;
      v3261.setSubject = function (v3270, v3271) {
        var v3272 = v3260;
        v3266(v3270);
        v3261.subject.attributes = v3270;
        delete v3261.subject.uniqueId;
        if (v3271) {
          v3261.subject.uniqueId = v3271;
        }
        v3261.subject.hash = null;
      };
      v3261.setIssuer = function (v3273, v3274) {
        var v3275 = v3260;
        v3266(v3273);
        v3261.issuer.attributes = v3273;
        delete v3261.issuer.uniqueId;
        if (v3274) {
          v3261.issuer.uniqueId = v3274;
        }
        v3261.issuer.hash = null;
      };
      v3261.setExtensions = function (v3276) {
        var v3277 = v3260;
        for (var v3278 = 0; v3278 < v3276.length; ++v3278) {
          v3279(v3276[v3278], {
            cert: v3261
          });
        }
        v3261.extensions = v3276;
      };
      v3261.getExtension = function (v3280) {
        var v3281 = v3260;
        if (typeof v3280 === "string") {
          v3280 = {
            name: v3280
          };
        }
        var v3282 = null;
        var v3283;
        for (var v3284 = 0; v3282 === null && v3284 < v3261.extensions.length; ++v3284) {
          v3283 = v3261.extensions[v3284];
          if (v3280.id && v3283.id === v3280.id) {
            v3282 = v3283;
          } else if (v3280.name && v3283.name === v3280.name) {
            v3282 = v3283;
          }
        }
        return v3282;
      };
      v3261.sign = function (v3285, v3286) {
        var v3287 = v3260;
        v3261.md = v3286 || v3154.md.sha1.create();
        var v3288 = v3157[v3261.md.algorithm + "WithRSAEncryption"];
        if (!v3288) {
          var v3289 = new Error("Could not compute certificate digest. Unknown message digest algorithm OID.");
          v3289.algorithm = v3261.md.algorithm;
          throw v3289;
        }
        v3261.signatureOid = v3261.siginfo.algorithmOid = v3288;
        v3261.tbsCertificate = v3156.getTBSCertificate(v3261);
        var v3290 = v3155.toDer(v3261.tbsCertificate);
        v3261.md.update(v3290.getBytes());
        v3261.signature = v3285.sign(v3261.md);
      };
      v3261.verify = function (v3291) {
        var v3292 = v3260;
        var v3293 = false;
        if (!v3261.issued(v3291)) {
          var v3294 = v3291.issuer;
          var v3295 = v3261.subject;
          var v3296 = new Error("The parent certificate did not issue the given child certificate; the child certificate's issuer does not match the parent's subject.");
          v3296.expectedIssuer = v3295.attributes;
          v3296.actualIssuer = v3294.attributes;
          throw v3296;
        }
        var v3297 = v3291.md;
        if (v3297 === null) {
          v3297 = v3199({
            signatureOid: v3291.signatureOid,
            type: "certificate"
          });
          var v3298 = v3291.tbsCertificate || v3156.getTBSCertificate(v3291);
          var v3299 = v3155.toDer(v3298);
          v3297.update(v3299.getBytes());
        }
        if (v3297 !== null) {
          v3293 = v3203({
            certificate: v3261,
            md: v3297,
            signature: v3291.signature
          });
        }
        return v3293;
      };
      v3261.isIssuer = function (v3300) {
        var v3301 = v3260;
        var v3302 = false;
        var v3303 = v3261.issuer;
        var v3304 = v3300.subject;
        if (v3303.hash && v3304.hash) {
          v3302 = v3303.hash === v3304.hash;
        } else if (v3303.attributes.length === v3304.attributes.length) {
          v3302 = true;
          var v3305;
          var v3306;
          for (var v3307 = 0; v3302 && v3307 < v3303.attributes.length; ++v3307) {
            v3305 = v3303.attributes[v3307];
            v3306 = v3304.attributes[v3307];
            if (v3305.type !== v3306.type || v3305.value !== v3306.value) {
              v3302 = false;
            }
          }
        }
        return v3302;
      };
      v3261.issued = function (v3308) {
        var v3309 = v3260;
        return v3308.isIssuer(v3261);
      };
      v3261.generateSubjectKeyIdentifier = function () {
        var v3310 = v3260;
        return v3156.getPublicKeyFingerprint(v3261.publicKey, {
          type: "RSAPublicKey"
        });
      };
      v3261.verifySubjectKeyIdentifier = function () {
        var v3311 = v3260;
        var v3312 = v3157.subjectKeyIdentifier;
        for (var v3313 = 0; v3313 < v3261.extensions.length; ++v3313) {
          var v3314 = v3261.extensions[v3313];
          if (v3314.id === v3312) {
            var v3315 = v3261.generateSubjectKeyIdentifier().getBytes();
            return v3154.util.hexToBytes(v3314.subjectKeyIdentifier) === v3315;
          }
        }
        return false;
      };
      return v3261;
    };
    v3156.certificateFromAsn1 = function (v3316, v3317) {
      var v3318 = {
        dh1791: 404,
        dh1792: 1554
      };
      var v3319 = v3153;
      var v3320 = {};
      var v3321 = [];
      if (!v3155.validate(v3316, v3160, v3320, v3321)) {
        var v3322 = new Error("Cannot read X.509 certificate. ASN.1 object is not an X509v3 Certificate.");
        v3322.errors = v3321;
        throw v3322;
      }
      var v3323 = v3155.derToOid(v3320.publicKeyOid);
      if (v3323 !== v3156.oids.rsaEncryption) {
        throw new Error("Cannot read public key. OID is not RSA.");
      }
      var v3324 = v3156.createCertificate();
      v3324.version = v3320.certVersion ? v3320.certVersion.charCodeAt(0) : 0;
      var v3325 = v3154.util.createBuffer(v3320.certSerialNumber);
      v3324.serialNumber = v3325.toHex();
      v3324.signatureOid = v3154.asn1.derToOid(v3320.certSignatureOid);
      v3324.signatureParameters = v3190(v3324.signatureOid, v3320.certSignatureParams, true);
      v3324.siginfo.algorithmOid = v3154.asn1.derToOid(v3320.certinfoSignatureOid);
      v3324.siginfo.parameters = v3190(v3324.siginfo.algorithmOid, v3320.certinfoSignatureParams, false);
      v3324.signature = v3320.certSignature;
      var v3326 = [];
      if (v3320.certValidity1UTCTime !== undefined) {
        v3326.push(v3155.utcTimeToDate(v3320.certValidity1UTCTime));
      }
      if (v3320.certValidity2GeneralizedTime !== undefined) {
        v3326.push(v3155.generalizedTimeToDate(v3320.certValidity2GeneralizedTime));
      }
      if (v3320.certValidity3UTCTime !== undefined) {
        v3326.push(v3155.utcTimeToDate(v3320.certValidity3UTCTime));
      }
      if (v3320.certValidity4GeneralizedTime !== undefined) {
        v3326.push(v3155.generalizedTimeToDate(v3320.certValidity4GeneralizedTime));
      }
      if (v3326.length > 2) {
        throw new Error("Cannot read notBefore/notAfter validity times; more than two times were provided in the certificate.");
      }
      if (v3326.length < 2) {
        throw new Error("Cannot read notBefore/notAfter validity times; they were not provided as either UTCTime or GeneralizedTime.");
      }
      v3324.validity.notBefore = v3326[0];
      v3324.validity.notAfter = v3326[1];
      v3324.tbsCertificate = v3320.tbsCertificate;
      if (v3317) {
        v3324.md = v3199({
          signatureOid: v3324.signatureOid,
          type: "certificate"
        });
        var v3327 = v3155.toDer(v3324.tbsCertificate);
        v3324.md.update(v3327.getBytes());
      }
      var v3328 = v3154.md.sha1.create();
      var v3329 = v3155.toDer(v3320.certIssuer);
      v3328.update(v3329.getBytes());
      v3324.issuer.getField = function (v3330) {
        var v3331 = v3319;
        return v3183(v3324.issuer, v3330);
      };
      v3324.issuer.addField = function (v3332) {
        var v3333 = v3319;
        v3266([v3332]);
        v3324.issuer.attributes.push(v3332);
      };
      v3324.issuer.attributes = v3156.RDNAttributesAsArray(v3320.certIssuer);
      if (v3320.certIssuerUniqueId) {
        v3324.issuer.uniqueId = v3320.certIssuerUniqueId;
      }
      v3324.issuer.hash = v3328.digest().toHex();
      var v3334 = v3154.md.sha1.create();
      var v3335 = v3155.toDer(v3320.certSubject);
      v3334.update(v3335.getBytes());
      v3324.subject.getField = function (v3336) {
        return v3183(v3324.subject, v3336);
      };
      v3324.subject.addField = function (v3337) {
        var v3338 = v3319;
        v3266([v3337]);
        v3324.subject.attributes.push(v3337);
      };
      v3324.subject.attributes = v3156.RDNAttributesAsArray(v3320.certSubject);
      if (v3320.certSubjectUniqueId) {
        v3324.subject.uniqueId = v3320.certSubjectUniqueId;
      }
      v3324.subject.hash = v3334.digest().toHex();
      if (v3320.certExtensions) {
        v3324.extensions = v3156.certificateExtensionsFromAsn1(v3320.certExtensions);
      } else {
        v3324.extensions = [];
      }
      v3324.publicKey = v3156.publicKeyFromAsn1(v3320.subjectPublicKeyInfo);
      return v3324;
    };
    v3156.certificateExtensionsFromAsn1 = function (v3339) {
      var v3340 = v3153;
      var v3341 = [];
      for (var v3342 = 0; v3342 < v3339.value.length; ++v3342) {
        var v3343 = v3339.value[v3342];
        for (var v3344 = 0; v3344 < v3343.value.length; ++v3344) {
          v3341.push(v3156.certificateExtensionFromAsn1(v3343.value[v3344]));
        }
      }
      return v3341;
    };
    v3156.certificateExtensionFromAsn1 = function (v3345) {
      var v3346 = v3153;
      var v3347 = {};
      v3347.id = v3155.derToOid(v3345.value[0].value);
      v3347.critical = false;
      if (v3345.value[1].type === v3155.Type.BOOLEAN) {
        v3347.critical = v3345.value[1].value.charCodeAt(0) !== 0;
        v3347.value = v3345.value[2].value;
      } else {
        v3347.value = v3345.value[1].value;
      }
      if (v3347.id in v3157) {
        v3347.name = v3157[v3347.id];
        if (v3347.name === "keyUsage") {
          var v3348 = v3155.fromDer(v3347.value);
          var v3349 = 0;
          var v3350 = 0;
          if (v3348.value.length > 1) {
            v3349 = v3348.value.charCodeAt(1);
            v3350 = v3348.value.length > 2 ? v3348.value.charCodeAt(2) : 0;
          }
          v3347.digitalSignature = (v3349 & 128) === 128;
          v3347.nonRepudiation = (v3349 & 64) === 64;
          v3347.keyEncipherment = (v3349 & 32) === 32;
          v3347.dataEncipherment = (v3349 & 16) === 16;
          v3347.keyAgreement = (v3349 & 8) === 8;
          v3347.keyCertSign = (v3349 & 4) === 4;
          v3347.cRLSign = (v3349 & 2) === 2;
          v3347.encipherOnly = (v3349 & 1) === 1;
          v3347.decipherOnly = (v3350 & 128) === 128;
        } else if (v3347.name === "basicConstraints") {
          var v3348 = v3155.fromDer(v3347.value);
          if (v3348.value.length > 0 && v3348.value[0].type === v3155.Type.BOOLEAN) {
            v3347.cA = v3348.value[0].value.charCodeAt(0) !== 0;
          } else {
            v3347.cA = false;
          }
          var v3351 = null;
          if (v3348.value.length > 0 && v3348.value[0].type === v3155.Type.INTEGER) {
            v3351 = v3348.value[0].value;
          } else if (v3348.value.length > 1) {
            v3351 = v3348.value[1].value;
          }
          if (v3351 !== null) {
            v3347.pathLenConstraint = v3155.derToInteger(v3351);
          }
        } else if (v3347.name === "extKeyUsage") {
          var v3348 = v3155.fromDer(v3347.value);
          for (var v3352 = 0; v3352 < v3348.value.length; ++v3352) {
            var v3353 = v3155.derToOid(v3348.value[v3352].value);
            if (v3353 in v3157) {
              v3347[v3157[v3353]] = true;
            } else {
              v3347[v3353] = true;
            }
          }
        } else if (v3347.name === "nsCertType") {
          var v3348 = v3155.fromDer(v3347.value);
          var v3349 = 0;
          if (v3348.value.length > 1) {
            v3349 = v3348.value.charCodeAt(1);
          }
          v3347.client = (v3349 & 128) === 128;
          v3347.server = (v3349 & 64) === 64;
          v3347.email = (v3349 & 32) === 32;
          v3347.objsign = (v3349 & 16) === 16;
          v3347.reserved = (v3349 & 8) === 8;
          v3347.sslCA = (v3349 & 4) === 4;
          v3347.emailCA = (v3349 & 2) === 2;
          v3347.objCA = (v3349 & 1) === 1;
        } else if (v3347.name === "subjectAltName" || v3347.name === "issuerAltName") {
          v3347.altNames = [];
          var v3354;
          var v3348 = v3155.fromDer(v3347.value);
          for (var v3355 = 0; v3355 < v3348.value.length; ++v3355) {
            v3354 = v3348.value[v3355];
            var v3356 = {
              type: v3354.type,
              value: v3354.value
            };
            v3347.altNames.push(v3356);
            switch (v3354.type) {
              case 1:
              case 2:
              case 6:
                break;
              case 7:
                v3356.ip = v3154.util.bytesToIP(v3354.value);
                break;
              case 8:
                v3356.oid = v3155.derToOid(v3354.value);
                break;
              default:
            }
          }
        } else if (v3347.name === "subjectKeyIdentifier") {
          var v3348 = v3155.fromDer(v3347.value);
          v3347.subjectKeyIdentifier = v3154.util.bytesToHex(v3348.value);
        }
      }
      return v3347;
    };
    v3156.certificationRequestFromAsn1 = function (v3357, v3358) {
      var v3359 = v3153;
      var v3360 = {};
      var v3361 = [];
      if (!v3155.validate(v3357, v3163, v3360, v3361)) {
        var v3362 = new Error("Cannot read PKCS#10 certificate request. ASN.1 object is not a PKCS#10 CertificationRequest.");
        v3362.errors = v3361;
        throw v3362;
      }
      var v3363 = v3155.derToOid(v3360.publicKeyOid);
      if (v3363 !== v3156.oids.rsaEncryption) {
        throw new Error("Cannot read public key. OID is not RSA.");
      }
      var v3364 = v3156.createCertificationRequest();
      v3364.version = v3360.csrVersion ? v3360.csrVersion.charCodeAt(0) : 0;
      v3364.signatureOid = v3154.asn1.derToOid(v3360.csrSignatureOid);
      v3364.signatureParameters = v3190(v3364.signatureOid, v3360.csrSignatureParams, true);
      v3364.siginfo.algorithmOid = v3154.asn1.derToOid(v3360.csrSignatureOid);
      v3364.siginfo.parameters = v3190(v3364.siginfo.algorithmOid, v3360.csrSignatureParams, false);
      v3364.signature = v3360.csrSignature;
      v3364.certificationRequestInfo = v3360.certificationRequestInfo;
      if (v3358) {
        v3364.md = v3199({
          signatureOid: v3364.signatureOid,
          type: "certification request"
        });
        var v3365 = v3155.toDer(v3364.certificationRequestInfo);
        v3364.md.update(v3365.getBytes());
      }
      var v3366 = v3154.md.sha1.create();
      v3364.subject.getField = function (v3367) {
        var v3368 = v3359;
        return v3183(v3364.subject, v3367);
      };
      v3364.subject.addField = function (v3369) {
        var v3370 = v3359;
        v3266([v3369]);
        v3364.subject.attributes.push(v3369);
      };
      v3364.subject.attributes = v3156.RDNAttributesAsArray(v3360.certificationRequestInfoSubject, v3366);
      v3364.subject.hash = v3366.digest().toHex();
      v3364.publicKey = v3156.publicKeyFromAsn1(v3360.subjectPublicKeyInfo);
      v3364.getAttribute = function (v3371) {
        return v3183(v3364, v3371);
      };
      v3364.addAttribute = function (v3372) {
        var v3373 = v3359;
        v3266([v3372]);
        v3364.attributes.push(v3372);
      };
      v3364.attributes = v3156.CRIAttributesAsArray(v3360.certificationRequestInfoAttributes || []);
      return v3364;
    };
    v3156.createCertificationRequest = function () {
      var v3374 = {
        dh1793: 1554
      };
      var v3375 = {
        dh1794: 1509
      };
      var v3376 = v3153;
      var v3377 = {
        version: 0,
        signatureOid: null,
        signature: null,
        siginfo: {}
      };
      v3377.siginfo.algorithmOid = null;
      v3377.subject = {};
      v3377.subject.getField = function (v3378) {
        var v3379 = v3376;
        return v3183(v3377.subject, v3378);
      };
      v3377.subject.addField = function (v3380) {
        var v3381 = v3376;
        v3266([v3380]);
        v3377.subject.attributes.push(v3380);
      };
      v3377.subject.attributes = [];
      v3377.subject.hash = null;
      v3377.publicKey = null;
      v3377.attributes = [];
      v3377.getAttribute = function (v3382) {
        return v3183(v3377, v3382);
      };
      v3377.addAttribute = function (v3383) {
        var v3384 = v3376;
        v3266([v3383]);
        v3377.attributes.push(v3383);
      };
      v3377.md = null;
      v3377.setSubject = function (v3385) {
        var v3386 = v3376;
        v3266(v3385);
        v3377.subject.attributes = v3385;
        v3377.subject.hash = null;
      };
      v3377.setAttributes = function (v3387) {
        var v3388 = v3376;
        v3266(v3387);
        v3377.attributes = v3387;
      };
      v3377.sign = function (v3389, v3390) {
        var v3391 = v3376;
        v3377.md = v3390 || v3154.md.sha1.create();
        var v3392 = v3157[v3377.md.algorithm + "WithRSAEncryption"];
        if (!v3392) {
          var v3393 = new Error("Could not compute certification request digest. Unknown message digest algorithm OID.");
          v3393.algorithm = v3377.md.algorithm;
          throw v3393;
        }
        v3377.signatureOid = v3377.siginfo.algorithmOid = v3392;
        v3377.certificationRequestInfo = v3156.getCertificationRequestInfo(v3377);
        var v3394 = v3155.toDer(v3377.certificationRequestInfo);
        v3377.md.update(v3394.getBytes());
        v3377.signature = v3389.sign(v3377.md);
      };
      v3377.verify = function () {
        var v3395 = v3376;
        var v3396 = false;
        var v3397 = v3377.md;
        if (v3397 === null) {
          v3397 = v3199({
            signatureOid: v3377.signatureOid,
            type: "certification request"
          });
          var v3398 = v3377.certificationRequestInfo || v3156.getCertificationRequestInfo(v3377);
          var v3399 = v3155.toDer(v3398);
          v3397.update(v3399.getBytes());
        }
        if (v3397 !== null) {
          v3396 = v3203({
            certificate: v3377,
            md: v3397,
            signature: v3377.signature
          });
        }
        return v3396;
      };
      return v3377;
    };
    function v3400(v3401) {
      var v3402 = v3153;
      var v3403 = v3155.create(v3155.Class.UNIVERSAL, v3155.Type.SEQUENCE, true, []);
      var v3404;
      var v3405;
      var v3406 = v3401.attributes;
      for (var v3407 = 0; v3407 < v3406.length; ++v3407) {
        v3404 = v3406[v3407];
        var v3408 = v3404.value;
        var v3409 = v3155.Type.PRINTABLESTRING;
        if ("valueTagClass" in v3404) {
          v3409 = v3404.valueTagClass;
          if (v3409 === v3155.Type.UTF8) {
            v3408 = v3154.util.encodeUtf8(v3408);
          }
        }
        v3405 = v3155.create(v3155.Class.UNIVERSAL, v3155.Type.SET, true, [v3155.create(v3155.Class.UNIVERSAL, v3155.Type.SEQUENCE, true, [v3155.create(v3155.Class.UNIVERSAL, v3155.Type.OID, false, v3155.oidToDer(v3404.type).getBytes()), v3155.create(v3155.Class.UNIVERSAL, v3409, false, v3408)])]);
        v3403.value.push(v3405);
      }
      return v3403;
    }
    function v3266(v3410) {
      var v3411 = v3153;
      var v3412;
      for (var v3413 = 0; v3413 < v3410.length; ++v3413) {
        v3412 = v3410[v3413];
        if (typeof v3412.name === "undefined") {
          if (v3412.type && v3412.type in v3156.oids) {
            v3412.name = v3156.oids[v3412.type];
          } else if (v3412.shortName && v3412.shortName in v3158) {
            v3412.name = v3156.oids[v3158[v3412.shortName]];
          }
        }
        if (typeof v3412.type === "undefined") {
          if (v3412.name && v3412.name in v3156.oids) {
            v3412.type = v3156.oids[v3412.name];
          } else {
            var v3414 = new Error("Attribute type not specified.");
            v3414.attribute = v3412;
            throw v3414;
          }
        }
        if (typeof v3412.shortName === "undefined") {
          if (v3412.name && v3412.name in v3158) {
            v3412.shortName = v3158[v3412.name];
          }
        }
        if (v3412.type === v3157.extensionRequest) {
          v3412.valueConstructed = true;
          v3412.valueTagClass = v3155.Type.SEQUENCE;
          if (!v3412.value && v3412.extensions) {
            v3412.value = [];
            for (var v3415 = 0; v3415 < v3412.extensions.length; ++v3415) {
              v3412.value.push(v3156.certificateExtensionToAsn1(v3279(v3412.extensions[v3415])));
            }
          }
        }
        if (typeof v3412.value === "undefined") {
          var v3414 = new Error("Attribute value not specified.");
          v3414.attribute = v3412;
          throw v3414;
        }
      }
    }
    function v3279(v3416, v3417) {
      var v3418 = v3153;
      v3417 = v3417 || {};
      if (typeof v3416.name === "undefined") {
        if (v3416.id && v3416.id in v3156.oids) {
          v3416.name = v3156.oids[v3416.id];
        }
      }
      if (typeof v3416.id === "undefined") {
        if (v3416.name && v3416.name in v3156.oids) {
          v3416.id = v3156.oids[v3416.name];
        } else {
          var v3419 = new Error("Extension ID not specified.");
          v3419.extension = v3416;
          throw v3419;
        }
      }
      if (typeof v3416.value !== "undefined") {
        return v3416;
      }
      if (v3416.name === "keyUsage") {
        var v3420 = 0;
        var v3421 = 0;
        var v3422 = 0;
        if (v3416.digitalSignature) {
          v3421 |= 128;
          v3420 = 7;
        }
        if (v3416.nonRepudiation) {
          v3421 |= 64;
          v3420 = 6;
        }
        if (v3416.keyEncipherment) {
          v3421 |= 32;
          v3420 = 5;
        }
        if (v3416.dataEncipherment) {
          v3421 |= 16;
          v3420 = 4;
        }
        if (v3416.keyAgreement) {
          v3421 |= 8;
          v3420 = 3;
        }
        if (v3416.keyCertSign) {
          v3421 |= 4;
          v3420 = 2;
        }
        if (v3416.cRLSign) {
          v3421 |= 2;
          v3420 = 1;
        }
        if (v3416.encipherOnly) {
          v3421 |= 1;
          v3420 = 0;
        }
        if (v3416.decipherOnly) {
          v3422 |= 128;
          v3420 = 7;
        }
        var v3423 = String.fromCharCode(v3420);
        if (v3422 !== 0) {
          v3423 += String.fromCharCode(v3421) + String.fromCharCode(v3422);
        } else if (v3421 !== 0) {
          v3423 += String.fromCharCode(v3421);
        }
        v3416.value = v3155.create(v3155.Class.UNIVERSAL, v3155.Type.BITSTRING, false, v3423);
      } else if (v3416.name === "basicConstraints") {
        v3416.value = v3155.create(v3155.Class.UNIVERSAL, v3155.Type.SEQUENCE, true, []);
        if (v3416.cA) {
          v3416.value.value.push(v3155.create(v3155.Class.UNIVERSAL, v3155.Type.BOOLEAN, false, String.fromCharCode(255)));
        }
        if ("pathLenConstraint" in v3416) {
          v3416.value.value.push(v3155.create(v3155.Class.UNIVERSAL, v3155.Type.INTEGER, false, v3155.integerToDer(v3416.pathLenConstraint).getBytes()));
        }
      } else if (v3416.name === "extKeyUsage") {
        v3416.value = v3155.create(v3155.Class.UNIVERSAL, v3155.Type.SEQUENCE, true, []);
        var v3424 = v3416.value.value;
        for (var v3425 in v3416) {
          if (v3416[v3425] !== true) {
            continue;
          }
          if (v3425 in v3157) {
            v3424.push(v3155.create(v3155.Class.UNIVERSAL, v3155.Type.OID, false, v3155.oidToDer(v3157[v3425]).getBytes()));
          } else if (v3425.indexOf(".") !== -1) {
            v3424.push(v3155.create(v3155.Class.UNIVERSAL, v3155.Type.OID, false, v3155.oidToDer(v3425).getBytes()));
          }
        }
      } else if (v3416.name === "nsCertType") {
        var v3420 = 0;
        var v3421 = 0;
        if (v3416.client) {
          v3421 |= 128;
          v3420 = 7;
        }
        if (v3416.server) {
          v3421 |= 64;
          v3420 = 6;
        }
        if (v3416.email) {
          v3421 |= 32;
          v3420 = 5;
        }
        if (v3416.objsign) {
          v3421 |= 16;
          v3420 = 4;
        }
        if (v3416.reserved) {
          v3421 |= 8;
          v3420 = 3;
        }
        if (v3416.sslCA) {
          v3421 |= 4;
          v3420 = 2;
        }
        if (v3416.emailCA) {
          v3421 |= 2;
          v3420 = 1;
        }
        if (v3416.objCA) {
          v3421 |= 1;
          v3420 = 0;
        }
        var v3423 = String.fromCharCode(v3420);
        if (v3421 !== 0) {
          v3423 += String.fromCharCode(v3421);
        }
        v3416.value = v3155.create(v3155.Class.UNIVERSAL, v3155.Type.BITSTRING, false, v3423);
      } else if (v3416.name === "subjectAltName" || v3416.name === "issuerAltName") {
        v3416.value = v3155.create(v3155.Class.UNIVERSAL, v3155.Type.SEQUENCE, true, []);
        var v3426;
        for (var v3427 = 0; v3427 < v3416.altNames.length; ++v3427) {
          v3426 = v3416.altNames[v3427];
          var v3423 = v3426.value;
          if (v3426.type === 7 && v3426.ip) {
            v3423 = v3154.util.bytesFromIP(v3426.ip);
            if (v3423 === null) {
              var v3419 = new Error("Extension \"ip\" value is not a valid IPv4 or IPv6 address.");
              v3419.extension = v3416;
              throw v3419;
            }
          } else if (v3426.type === 8) {
            if (v3426.oid) {
              v3423 = v3155.oidToDer(v3155.oidToDer(v3426.oid));
            } else {
              v3423 = v3155.oidToDer(v3423);
            }
          }
          v3416.value.value.push(v3155.create(v3155.Class.CONTEXT_SPECIFIC, v3426.type, false, v3423));
        }
      } else if (v3416.name === "nsComment" && v3417.cert) {
        if (!/^[\x00-\x7F]*$/.test(v3416.comment) || v3416.comment.length < 1 || v3416.comment.length > 128) {
          throw new Error("Invalid \"nsComment\" content.");
        }
        v3416.value = v3155.create(v3155.Class.UNIVERSAL, v3155.Type.IA5STRING, false, v3416.comment);
      } else if (v3416.name === "subjectKeyIdentifier" && v3417.cert) {
        var v3428 = v3417.cert.generateSubjectKeyIdentifier();
        v3416.subjectKeyIdentifier = v3428.toHex();
        v3416.value = v3155.create(v3155.Class.UNIVERSAL, v3155.Type.OCTETSTRING, false, v3428.getBytes());
      } else if (v3416.name === "authorityKeyIdentifier" && v3417.cert) {
        v3416.value = v3155.create(v3155.Class.UNIVERSAL, v3155.Type.SEQUENCE, true, []);
        var v3424 = v3416.value.value;
        if (v3416.keyIdentifier) {
          var v3429 = v3416.keyIdentifier === true ? v3417.cert.generateSubjectKeyIdentifier().getBytes() : v3416.keyIdentifier;
          v3424.push(v3155.create(v3155.Class.CONTEXT_SPECIFIC, 0, false, v3429));
        }
        if (v3416.authorityCertIssuer) {
          var v3430 = [v3155.create(v3155.Class.CONTEXT_SPECIFIC, 4, true, [v3400(v3416.authorityCertIssuer === true ? v3417.cert.issuer : v3416.authorityCertIssuer)])];
          v3424.push(v3155.create(v3155.Class.CONTEXT_SPECIFIC, 1, true, v3430));
        }
        if (v3416.serialNumber) {
          var v3431 = v3154.util.hexToBytes(v3416.serialNumber === true ? v3417.cert.serialNumber : v3416.serialNumber);
          v3424.push(v3155.create(v3155.Class.CONTEXT_SPECIFIC, 2, false, v3431));
        }
      } else if (v3416.name === "cRLDistributionPoints") {
        v3416.value = v3155.create(v3155.Class.UNIVERSAL, v3155.Type.SEQUENCE, true, []);
        var v3424 = v3416.value.value;
        var v3432 = v3155.create(v3155.Class.UNIVERSAL, v3155.Type.SEQUENCE, true, []);
        var v3433 = v3155.create(v3155.Class.CONTEXT_SPECIFIC, 0, true, []);
        var v3426;
        for (var v3427 = 0; v3427 < v3416.altNames.length; ++v3427) {
          v3426 = v3416.altNames[v3427];
          var v3423 = v3426.value;
          if (v3426.type === 7 && v3426.ip) {
            v3423 = v3154.util.bytesFromIP(v3426.ip);
            if (v3423 === null) {
              var v3419 = new Error("Extension \"ip\" value is not a valid IPv4 or IPv6 address.");
              v3419.extension = v3416;
              throw v3419;
            }
          } else if (v3426.type === 8) {
            if (v3426.oid) {
              v3423 = v3155.oidToDer(v3155.oidToDer(v3426.oid));
            } else {
              v3423 = v3155.oidToDer(v3423);
            }
          }
          v3433.value.push(v3155.create(v3155.Class.CONTEXT_SPECIFIC, v3426.type, false, v3423));
        }
        v3432.value.push(v3155.create(v3155.Class.CONTEXT_SPECIFIC, 0, true, [v3433]));
        v3424.push(v3432);
      }
      if (typeof v3416.value === "undefined") {
        var v3419 = new Error("Extension value not specified.");
        v3419.extension = v3416;
        throw v3419;
      }
      return v3416;
    }
    function v3434(v3435, v3436) {
      var v3437 = v3153;
      switch (v3435) {
        case v3157["RSASSA-PSS"]:
          var v3438 = [];
          if (v3436.hash.algorithmOid !== undefined) {
            v3438.push(v3155.create(v3155.Class.CONTEXT_SPECIFIC, 0, true, [v3155.create(v3155.Class.UNIVERSAL, v3155.Type.SEQUENCE, true, [v3155.create(v3155.Class.UNIVERSAL, v3155.Type.OID, false, v3155.oidToDer(v3436.hash.algorithmOid).getBytes()), v3155.create(v3155.Class.UNIVERSAL, v3155.Type.NULL, false, "")])]));
          }
          if (v3436.mgf.algorithmOid !== undefined) {
            v3438.push(v3155.create(v3155.Class.CONTEXT_SPECIFIC, 1, true, [v3155.create(v3155.Class.UNIVERSAL, v3155.Type.SEQUENCE, true, [v3155.create(v3155.Class.UNIVERSAL, v3155.Type.OID, false, v3155.oidToDer(v3436.mgf.algorithmOid).getBytes()), v3155.create(v3155.Class.UNIVERSAL, v3155.Type.SEQUENCE, true, [v3155.create(v3155.Class.UNIVERSAL, v3155.Type.OID, false, v3155.oidToDer(v3436.mgf.hash.algorithmOid).getBytes()), v3155.create(v3155.Class.UNIVERSAL, v3155.Type.NULL, false, "")])])]));
          }
          if (v3436.saltLength !== undefined) {
            v3438.push(v3155.create(v3155.Class.CONTEXT_SPECIFIC, 2, true, [v3155.create(v3155.Class.UNIVERSAL, v3155.Type.INTEGER, false, v3155.integerToDer(v3436.saltLength).getBytes())]));
          }
          return v3155.create(v3155.Class.UNIVERSAL, v3155.Type.SEQUENCE, true, v3438);
        default:
          return v3155.create(v3155.Class.UNIVERSAL, v3155.Type.NULL, false, "");
      }
    }
    function v3439(v3440) {
      var v3441 = v3153;
      var v3442 = v3155.create(v3155.Class.CONTEXT_SPECIFIC, 0, true, []);
      if (v3440.attributes.length === 0) {
        return v3442;
      }
      var v3443 = v3440.attributes;
      for (var v3444 = 0; v3444 < v3443.length; ++v3444) {
        var v3445 = v3443[v3444];
        var v3446 = v3445.value;
        var v3447 = v3155.Type.UTF8;
        if ("valueTagClass" in v3445) {
          v3447 = v3445.valueTagClass;
        }
        if (v3447 === v3155.Type.UTF8) {
          v3446 = v3154.util.encodeUtf8(v3446);
        }
        var v3448 = false;
        if ("valueConstructed" in v3445) {
          v3448 = v3445.valueConstructed;
        }
        var v3449 = v3155.create(v3155.Class.UNIVERSAL, v3155.Type.SEQUENCE, true, [v3155.create(v3155.Class.UNIVERSAL, v3155.Type.OID, false, v3155.oidToDer(v3445.type).getBytes()), v3155.create(v3155.Class.UNIVERSAL, v3155.Type.SET, true, [v3155.create(v3155.Class.UNIVERSAL, v3447, v3448, v3446)])]);
        v3442.value.push(v3449);
      }
      return v3442;
    }
    var v3450 = new Date("1950-01-01T00:00:00Z");
    var v3451 = new Date("2050-01-01T00:00:00Z");
    function v3452(v3453) {
      var v3454 = v3153;
      if (v3453 >= v3450 && v3453 < v3451) {
        return v3155.create(v3155.Class.UNIVERSAL, v3155.Type.UTCTIME, false, v3155.dateToUtcTime(v3453));
      } else {
        return v3155.create(v3155.Class.UNIVERSAL, v3155.Type.GENERALIZEDTIME, false, v3155.dateToGeneralizedTime(v3453));
      }
    }
    v3156.getTBSCertificate = function (v3455) {
      var v3456 = v3153;
      var v3457 = v3452(v3455.validity.notBefore);
      var v3458 = v3452(v3455.validity.notAfter);
      var v3459 = v3155.create(v3155.Class.UNIVERSAL, v3155.Type.SEQUENCE, true, [v3155.create(v3155.Class.CONTEXT_SPECIFIC, 0, true, [v3155.create(v3155.Class.UNIVERSAL, v3155.Type.INTEGER, false, v3155.integerToDer(v3455.version).getBytes())]), v3155.create(v3155.Class.UNIVERSAL, v3155.Type.INTEGER, false, v3154.util.hexToBytes(v3455.serialNumber)), v3155.create(v3155.Class.UNIVERSAL, v3155.Type.SEQUENCE, true, [v3155.create(v3155.Class.UNIVERSAL, v3155.Type.OID, false, v3155.oidToDer(v3455.siginfo.algorithmOid).getBytes()), v3434(v3455.siginfo.algorithmOid, v3455.siginfo.parameters)]), v3400(v3455.issuer), v3155.create(v3155.Class.UNIVERSAL, v3155.Type.SEQUENCE, true, [v3457, v3458]), v3400(v3455.subject), v3156.publicKeyToAsn1(v3455.publicKey)]);
      if (v3455.issuer.uniqueId) {
        v3459.value.push(v3155.create(v3155.Class.CONTEXT_SPECIFIC, 1, true, [v3155.create(v3155.Class.UNIVERSAL, v3155.Type.BITSTRING, false, String.fromCharCode(0) + v3455.issuer.uniqueId)]));
      }
      if (v3455.subject.uniqueId) {
        v3459.value.push(v3155.create(v3155.Class.CONTEXT_SPECIFIC, 2, true, [v3155.create(v3155.Class.UNIVERSAL, v3155.Type.BITSTRING, false, String.fromCharCode(0) + v3455.subject.uniqueId)]));
      }
      if (v3455.extensions.length > 0) {
        v3459.value.push(v3156.certificateExtensionsToAsn1(v3455.extensions));
      }
      return v3459;
    };
    v3156.getCertificationRequestInfo = function (v3460) {
      var v3461 = v3153;
      var v3462 = v3155.create(v3155.Class.UNIVERSAL, v3155.Type.SEQUENCE, true, [v3155.create(v3155.Class.UNIVERSAL, v3155.Type.INTEGER, false, v3155.integerToDer(v3460.version).getBytes()), v3400(v3460.subject), v3156.publicKeyToAsn1(v3460.publicKey), v3439(v3460)]);
      return v3462;
    };
    v3156.distinguishedNameToAsn1 = function (v3463) {
      return v3400(v3463);
    };
    v3156.certificateToAsn1 = function (v3464) {
      var v3465 = v3153;
      var v3466 = v3464.tbsCertificate || v3156.getTBSCertificate(v3464);
      return v3155.create(v3155.Class.UNIVERSAL, v3155.Type.SEQUENCE, true, [v3466, v3155.create(v3155.Class.UNIVERSAL, v3155.Type.SEQUENCE, true, [v3155.create(v3155.Class.UNIVERSAL, v3155.Type.OID, false, v3155.oidToDer(v3464.signatureOid).getBytes()), v3434(v3464.signatureOid, v3464.signatureParameters)]), v3155.create(v3155.Class.UNIVERSAL, v3155.Type.BITSTRING, false, String.fromCharCode(0) + v3464.signature)]);
    };
    v3156.certificateExtensionsToAsn1 = function (v3467) {
      var v3468 = v3153;
      var v3469 = v3155.create(v3155.Class.CONTEXT_SPECIFIC, 3, true, []);
      var v3470 = v3155.create(v3155.Class.UNIVERSAL, v3155.Type.SEQUENCE, true, []);
      v3469.value.push(v3470);
      for (var v3471 = 0; v3471 < v3467.length; ++v3471) {
        v3470.value.push(v3156.certificateExtensionToAsn1(v3467[v3471]));
      }
      return v3469;
    };
    v3156.certificateExtensionToAsn1 = function (v3472) {
      var v3473 = v3153;
      var v3474 = v3155.create(v3155.Class.UNIVERSAL, v3155.Type.SEQUENCE, true, []);
      v3474.value.push(v3155.create(v3155.Class.UNIVERSAL, v3155.Type.OID, false, v3155.oidToDer(v3472.id).getBytes()));
      if (v3472.critical) {
        v3474.value.push(v3155.create(v3155.Class.UNIVERSAL, v3155.Type.BOOLEAN, false, String.fromCharCode(255)));
      }
      var v3475 = v3472.value;
      if (typeof v3472.value !== "string") {
        v3475 = v3155.toDer(v3475).getBytes();
      }
      v3474.value.push(v3155.create(v3155.Class.UNIVERSAL, v3155.Type.OCTETSTRING, false, v3475));
      return v3474;
    };
    v3156.certificationRequestToAsn1 = function (v3476) {
      var v3477 = v3153;
      var v3478 = v3476.certificationRequestInfo || v3156.getCertificationRequestInfo(v3476);
      return v3155.create(v3155.Class.UNIVERSAL, v3155.Type.SEQUENCE, true, [v3478, v3155.create(v3155.Class.UNIVERSAL, v3155.Type.SEQUENCE, true, [v3155.create(v3155.Class.UNIVERSAL, v3155.Type.OID, false, v3155.oidToDer(v3476.signatureOid).getBytes()), v3434(v3476.signatureOid, v3476.signatureParameters)]), v3155.create(v3155.Class.UNIVERSAL, v3155.Type.BITSTRING, false, String.fromCharCode(0) + v3476.signature)]);
    };
    v3156.createCaStore = function (v3479) {
      var v3480 = {
        dh1795: 1144,
        dh1796: 1077
      };
      var v3481 = {
        dh1797: 464,
        dh1798: 918
      };
      var v3482 = {
        dh1799: 404
      };
      var v3483 = v3153;
      var v3484 = {
        certs: {}
      };
      v3484.getIssuer = function (v3485) {
        var v3486 = v1;
        var v3487 = v3488(v3485.issuer);
        return v3487;
      };
      v3484.addCertificate = function (v3489) {
        var v3490 = v3483;
        if (typeof v3489 === "string") {
          v3489 = v3154.pki.certificateFromPem(v3489);
        }
        v3491(v3489.subject);
        if (!v3484.hasCertificate(v3489)) {
          if (v3489.subject.hash in v3484.certs) {
            var v3492 = v3484.certs[v3489.subject.hash];
            if (!v3154.util.isArray(v3492)) {
              v3492 = [v3492];
            }
            v3492.push(v3489);
            v3484.certs[v3489.subject.hash] = v3492;
          } else {
            v3484.certs[v3489.subject.hash] = v3489;
          }
        }
      };
      v3484.hasCertificate = function (v3493) {
        var v3494 = v3483;
        if (typeof v3493 === "string") {
          v3493 = v3154.pki.certificateFromPem(v3493);
        }
        var v3495 = v3488(v3493.subject);
        if (!v3495) {
          return false;
        }
        if (!v3154.util.isArray(v3495)) {
          v3495 = [v3495];
        }
        var v3496 = v3155.toDer(v3156.certificateToAsn1(v3493)).getBytes();
        for (var v3497 = 0; v3497 < v3495.length; ++v3497) {
          var v3498 = v3155.toDer(v3156.certificateToAsn1(v3495[v3497])).getBytes();
          if (v3496 === v3498) {
            return true;
          }
        }
        return false;
      };
      v3484.listAllCertificates = function () {
        var v3499 = v3483;
        var v3500 = [];
        for (var v3501 in v3484.certs) {
          if (v3484.certs.hasOwnProperty(v3501)) {
            var v3502 = v3484.certs[v3501];
            if (!v3154.util.isArray(v3502)) {
              v3500.push(v3502);
            } else {
              for (var v3503 = 0; v3503 < v3502.length; ++v3503) {
                v3500.push(v3502[v3503]);
              }
            }
          }
        }
        return v3500;
      };
      v3484.removeCertificate = function (v3504) {
        var v3505 = v3483;
        var v3506;
        if (typeof v3504 === "string") {
          v3504 = v3154.pki.certificateFromPem(v3504);
        }
        v3491(v3504.subject);
        if (!v3484.hasCertificate(v3504)) {
          return null;
        }
        var v3507 = v3488(v3504.subject);
        if (!v3154.util.isArray(v3507)) {
          v3506 = v3484.certs[v3504.subject.hash];
          delete v3484.certs[v3504.subject.hash];
          return v3506;
        }
        var v3508 = v3155.toDer(v3156.certificateToAsn1(v3504)).getBytes();
        for (var v3509 = 0; v3509 < v3507.length; ++v3509) {
          var v3510 = v3155.toDer(v3156.certificateToAsn1(v3507[v3509])).getBytes();
          if (v3508 === v3510) {
            v3506 = v3507[v3509];
            v3507.splice(v3509, 1);
          }
        }
        if (v3507.length === 0) {
          delete v3484.certs[v3504.subject.hash];
        }
        return v3506;
      };
      function v3488(v3511) {
        var v3512 = v3483;
        v3491(v3511);
        return v3484.certs[v3511.hash] || null;
      }
      function v3491(v3513) {
        var v3514 = v3483;
        if (!v3513.hash) {
          var v3515 = v3154.md.sha1.create();
          v3513.attributes = v3156.RDNAttributesAsArray(v3400(v3513), v3515);
          v3513.hash = v3515.digest().toHex();
        }
      }
      if (v3479) {
        for (var v3516 = 0; v3516 < v3479.length; ++v3516) {
          var v3517 = v3479[v3516];
          v3484.addCertificate(v3517);
        }
      }
      return v3484;
    };
    v3156.certificateError = {
      bad_certificate: "forge.pki.BadCertificate",
      unsupported_certificate: "forge.pki.UnsupportedCertificate",
      certificate_revoked: "forge.pki.CertificateRevoked",
      certificate_expired: "forge.pki.CertificateExpired",
      certificate_unknown: "forge.pki.CertificateUnknown",
      unknown_ca: "forge.pki.UnknownCertificateAuthority"
    };
    v3156.verifyCertificateChain = function (v3518, v3519, v3520) {
      var v3521 = v3153;
      if (typeof v3520 === "function") {
        v3520 = {
          verify: v3520
        };
      }
      v3520 = v3520 || {};
      v3519 = v3519.slice(0);
      var v3522 = v3519.slice(0);
      var v3523 = v3520.validityCheckDate;
      if (typeof v3523 === "undefined") {
        v3523 = new Date();
      }
      var v3524 = true;
      var v3525 = null;
      var v3526 = 0;
      do {
        var v3527 = v3519.shift();
        var v3528 = null;
        var v3529 = false;
        if (v3523) {
          if (v3523 < v3527.validity.notBefore || v3523 > v3527.validity.notAfter) {
            v3525 = {
              message: "Certificate is not valid yet or has expired.",
              error: v3156.certificateError.certificate_expired,
              notBefore: v3527.validity.notBefore,
              notAfter: v3527.validity.notAfter,
              now: v3523
            };
          }
        }
        if (v3525 === null) {
          v3528 = v3519[0] || v3518.getIssuer(v3527);
          if (v3528 === null) {
            if (v3527.isIssuer(v3527)) {
              v3529 = true;
              v3528 = v3527;
            }
          }
          if (v3528) {
            var v3530 = v3528;
            if (!v3154.util.isArray(v3530)) {
              v3530 = [v3530];
            }
            var v3531 = false;
            while (!v3531 && v3530.length > 0) {
              v3528 = v3530.shift();
              try {
                v3531 = v3528.verify(v3527);
              } catch (v3532) {}
            }
            if (!v3531) {
              v3525 = {
                message: "Certificate signature is invalid.",
                error: v3156.certificateError.bad_certificate
              };
            }
          }
          if (v3525 === null && (!v3528 || v3529) && !v3518.hasCertificate(v3527)) {
            v3525 = {
              message: "Certificate is not trusted.",
              error: v3156.certificateError.unknown_ca
            };
          }
        }
        if (v3525 === null && v3528 && !v3527.isIssuer(v3528)) {
          v3525 = {
            message: "Certificate issuer is invalid.",
            error: v3156.certificateError.bad_certificate
          };
        }
        if (v3525 === null) {
          var v3533 = {
            keyUsage: true,
            basicConstraints: true
          };
          for (var v3534 = 0; v3525 === null && v3534 < v3527.extensions.length; ++v3534) {
            var v3535 = v3527.extensions[v3534];
            if (v3535.critical && !(v3535.name in v3533)) {
              v3525 = {
                message: "Certificate has an unsupported critical extension.",
                error: v3156.certificateError.unsupported_certificate
              };
            }
          }
        }
        if (v3525 === null && (!v3524 || v3519.length === 0 && (!v3528 || v3529))) {
          var v3536 = v3527.getExtension("basicConstraints");
          var v3537 = v3527.getExtension("keyUsage");
          if (v3537 !== null) {
            if (!v3537.keyCertSign || v3536 === null) {
              v3525 = {
                message: "Certificate keyUsage or basicConstraints conflict or indicate that the certificate is not a CA. If the certificate is the only one in the chain or isn't the first then the certificate must be a valid CA.",
                error: v3156.certificateError.bad_certificate
              };
            }
          }
          if (v3525 === null && v3536 === null) {
            v3525 = {
              message: "Certificate is missing basicConstraints extension and cannot be used as a CA.",
              error: v3156.certificateError.bad_certificate
            };
          }
          if (v3525 === null && v3536 !== null && !v3536.cA) {
            v3525 = {
              message: "Certificate basicConstraints indicates the certificate is not a CA.",
              error: v3156.certificateError.bad_certificate
            };
          }
          if (v3525 === null && v3537 !== null && "pathLenConstraint" in v3536) {
            var v3538 = v3526 - 1;
            if (v3538 > v3536.pathLenConstraint) {
              v3525 = {
                message: "Certificate basicConstraints pathLenConstraint violated.",
                error: v3156.certificateError.bad_certificate
              };
            }
          }
        }
        var v3539 = v3525 === null ? true : v3525.error;
        var v3540 = v3520.verify ? v3520.verify(v3539, v3526, v3522) : v3539;
        if (v3540 === true) {
          v3525 = null;
        } else {
          if (v3539 === true) {
            v3525 = {
              message: "The application rejected the certificate.",
              error: v3156.certificateError.bad_certificate
            };
          }
          if (v3540 || v3540 === 0) {
            if (typeof v3540 === "object" && !v3154.util.isArray(v3540)) {
              if (v3540.message) {
                v3525.message = v3540.message;
              }
              if (v3540.error) {
                v3525.error = v3540.error;
              }
            } else if (typeof v3540 === "string") {
              v3525.error = v3540;
            }
          }
          throw v3525;
        }
        v3524 = false;
        ++v3526;
      } while (v3519.length > 0);
      return true;
    };
  }
});
var require_pkcs12 = __commonJS({
  "node_modules/node-forge/lib/pkcs12.js"(v3541, v3542) {
    var v3543 = {
      dh1800: 738,
      dh1801: 1027,
      dh1802: 1360,
      dh1803: 782,
      dh1804: 969,
      dh1805: 1045,
      dh1806: 847,
      dh1807: 316,
      dh1808: 1045,
      dh1809: 1210,
      dh1810: 802,
      dh1811: 785,
      dh1812: 439,
      dh1813: 1495,
      dh1814: 1323,
      dh1815: 295,
      dh1816: 738,
      dh1817: 1027,
      dh1818: 1045,
      dh1819: 785,
      dh1820: 1274,
      dh1821: 1289,
      dh1822: 1293,
      dh1823: 1210
    };
    var v3544 = {
      dh1824: 653,
      dh1825: 1229,
      dh1826: 985,
      dh1827: 386,
      dh1828: 581,
      dh1829: 289,
      dh1830: 1020,
      dh1831: 1088,
      dh1832: 1045,
      dh1833: 738,
      dh1834: 1027,
      dh1835: 1495,
      dh1836: 588,
      dh1837: 1144,
      dh1838: 1210,
      dh1839: 1144,
      dh1840: 1045,
      dh1841: 494,
      dh1842: 857,
      dh1843: 619,
      dh1844: 277,
      dh1845: 1020,
      dh1846: 884,
      dh1847: 1025,
      dh1848: 1045,
      dh1849: 1144,
      dh1850: 1025,
      dh1851: 1144,
      dh1852: 1027,
      dh1853: 1358,
      dh1854: 1151,
      dh1855: 1045,
      dh1856: 1045,
      dh1857: 1045,
      dh1858: 306,
      dh1859: 1358,
      dh1860: 1027,
      dh1861: 1068,
      dh1862: 619,
      dh1863: 1144,
      dh1864: 1045,
      dh1865: 1144,
      dh1866: 1144,
      dh1867: 1045,
      dh1868: 1495,
      dh1869: 1045,
      dh1870: 1027,
      dh1871: 1045,
      dh1872: 785,
      dh1873: 1027
    };
    var v3545 = {
      dh1874: 548,
      dh1875: 1250,
      dh1876: 1500,
      dh1877: 1358,
      dh1878: 1463,
      dh1879: 1231
    };
    var v3546 = {
      dh1880: 1027,
      dh1881: 1323,
      dh1882: 531,
      dh1883: 295,
      dh1884: 1231,
      dh1885: 987,
      dh1886: 1358,
      dh1887: 848,
      dh1888: 307,
      dh1889: 400
    };
    var v3547 = {
      dh1890: 986,
      dh1891: 563,
      dh1892: 1151,
      dh1893: 1030,
      dh1894: 632,
      dh1895: 1231,
      dh1896: 1381,
      dh1897: 623
    };
    var v3548 = {
      dh1898: 1027,
      dh1899: 328,
      dh1900: 1358,
      dh1901: 1151,
      dh1902: 597,
      dh1903: 282,
      dh1904: 376,
      dh1905: 1189
    };
    var v3549 = {
      dh1906: 619,
      dh1907: 1508,
      dh1908: 250,
      dh1909: 1231
    };
    var v3550 = {
      dh1910: 953,
      dh1911: 271,
      dh1912: 278,
      dh1913: 506,
      dh1914: 1282,
      dh1915: 1057,
      dh1916: 1358,
      dh1917: 1144,
      dh1918: 1358,
      dh1919: 1310,
      dh1920: 1126,
      dh1921: 1144
    };
    var v3551 = {
      dh1922: 604
    };
    var v3552 = {
      dh1923: 588,
      dh1924: 502,
      dh1925: 581,
      dh1926: 604,
      dh1927: 1477,
      dh1928: 604,
      dh1929: 573
    };
    var v3553 = {
      dh1930: 1520,
      dh1931: 531
    };
    var v3554 = v2;
    var v3555 = require_forge();
    require_asn1();
    require_hmac();
    require_oids();
    require_pkcs7asn1();
    require_pbe();
    require_random();
    require_rsa();
    require_sha1();
    require_util();
    require_x509();
    var v3556 = v3555.asn1;
    var v3557 = v3555.pki;
    var v3558 = v3542.exports = v3555.pkcs12 = v3555.pkcs12 || {};
    var v3559 = {
      name: "ContentInfo",
      tagClass: v3556.Class.UNIVERSAL,
      type: v3556.Type.SEQUENCE,
      constructed: true,
      value: [{
        name: "ContentInfo.contentType",
        tagClass: v3556.Class.UNIVERSAL,
        type: v3556.Type.OID,
        constructed: false,
        capture: "contentType"
      }, {
        name: "ContentInfo.content",
        tagClass: v3556.Class.CONTEXT_SPECIFIC,
        constructed: true,
        captureAsn1: "content"
      }]
    };
    var v3560 = {
      name: "PFX",
      tagClass: v3556.Class.UNIVERSAL,
      type: v3556.Type.SEQUENCE,
      constructed: true,
      value: [{
        name: "PFX.version",
        tagClass: v3556.Class.UNIVERSAL,
        type: v3556.Type.INTEGER,
        constructed: false,
        capture: "version"
      }, v3559, {
        name: "PFX.macData",
        tagClass: v3556.Class.UNIVERSAL,
        type: v3556.Type.SEQUENCE,
        constructed: true,
        optional: true,
        captureAsn1: "mac",
        value: [{
          name: "PFX.macData.mac",
          tagClass: v3556.Class.UNIVERSAL,
          type: v3556.Type.SEQUENCE,
          constructed: true,
          value: [{
            name: "PFX.macData.mac.digestAlgorithm",
            tagClass: v3556.Class.UNIVERSAL,
            type: v3556.Type.SEQUENCE,
            constructed: true,
            value: [{
              name: "PFX.macData.mac.digestAlgorithm.algorithm",
              tagClass: v3556.Class.UNIVERSAL,
              type: v3556.Type.OID,
              constructed: false,
              capture: "macAlgorithm"
            }, {
              name: "PFX.macData.mac.digestAlgorithm.parameters",
              optional: true,
              tagClass: v3556.Class.UNIVERSAL,
              captureAsn1: "macAlgorithmParameters"
            }]
          }, {
            name: "PFX.macData.mac.digest",
            tagClass: v3556.Class.UNIVERSAL,
            type: v3556.Type.OCTETSTRING,
            constructed: false,
            capture: "macDigest"
          }]
        }, {
          name: "PFX.macData.macSalt",
          tagClass: v3556.Class.UNIVERSAL,
          type: v3556.Type.OCTETSTRING,
          constructed: false,
          capture: "macSalt"
        }, {
          name: "PFX.macData.iterations",
          tagClass: v3556.Class.UNIVERSAL,
          type: v3556.Type.INTEGER,
          constructed: false,
          optional: true,
          capture: "macIterations"
        }]
      }]
    };
    var v3561 = {
      name: "SafeBag",
      tagClass: v3556.Class.UNIVERSAL,
      type: v3556.Type.SEQUENCE,
      constructed: true,
      value: [{
        name: "SafeBag.bagId",
        tagClass: v3556.Class.UNIVERSAL,
        type: v3556.Type.OID,
        constructed: false,
        capture: "bagId"
      }, {
        name: "SafeBag.bagValue",
        tagClass: v3556.Class.CONTEXT_SPECIFIC,
        constructed: true,
        captureAsn1: "bagValue"
      }, {
        name: "SafeBag.bagAttributes",
        tagClass: v3556.Class.UNIVERSAL,
        type: v3556.Type.SET,
        constructed: true,
        optional: true,
        capture: "bagAttributes"
      }]
    };
    var v3562 = {
      name: "Attribute",
      tagClass: v3556.Class.UNIVERSAL,
      type: v3556.Type.SEQUENCE,
      constructed: true,
      value: [{
        name: "Attribute.attrId",
        tagClass: v3556.Class.UNIVERSAL,
        type: v3556.Type.OID,
        constructed: false,
        capture: "oid"
      }, {
        name: "Attribute.attrValues",
        tagClass: v3556.Class.UNIVERSAL,
        type: v3556.Type.SET,
        constructed: true,
        capture: "values"
      }]
    };
    var v3563 = {
      name: "CertBag",
      tagClass: v3556.Class.UNIVERSAL,
      type: v3556.Type.SEQUENCE,
      constructed: true,
      value: [{
        name: "CertBag.certId",
        tagClass: v3556.Class.UNIVERSAL,
        type: v3556.Type.OID,
        constructed: false,
        capture: "certId"
      }, {
        name: "CertBag.certValue",
        tagClass: v3556.Class.CONTEXT_SPECIFIC,
        constructed: true,
        value: [{
          name: "CertBag.certValue[0]",
          tagClass: v3556.Class.UNIVERSAL,
          type: v3556.Class.OCTETSTRING,
          constructed: false,
          capture: "cert"
        }]
      }]
    };
    function v3564(v3565, v3566, v3567, v3568) {
      var v3569 = v3554;
      var v3570 = [];
      for (var v3571 = 0; v3571 < v3565.length; v3571++) {
        for (var v3572 = 0; v3572 < v3565[v3571].safeBags.length; v3572++) {
          var v3573 = v3565[v3571].safeBags[v3572];
          if (v3568 !== undefined && v3573.type !== v3568) {
            continue;
          }
          if (v3566 === null) {
            v3570.push(v3573);
            continue;
          }
          if (v3573.attributes[v3566] !== undefined && v3573.attributes[v3566].indexOf(v3567) >= 0) {
            v3570.push(v3573);
          }
        }
      }
      return v3570;
    }
    v3558.pkcs12FromAsn1 = function (v3574, v3575, v3576) {
      var v3577 = v3554;
      if (typeof v3575 === "string") {
        v3576 = v3575;
        v3575 = true;
      } else if (v3575 === undefined) {
        v3575 = true;
      }
      var v3578 = {};
      var v3579 = [];
      if (!v3556.validate(v3574, v3560, v3578, v3579)) {
        var v3580 = new Error("Cannot read PKCS#12 PFX. ASN.1 object is not an PKCS#12 PFX.");
        v3580.errors = v3580;
        throw v3580;
      }
      var v3581 = {
        version: v3578.version.charCodeAt(0),
        safeContents: [],
        getBags: function (v3582) {
          var v3583 = v3577;
          var v3584 = {};
          var v3585;
          if ("localKeyId" in v3582) {
            v3585 = v3582.localKeyId;
          } else if ("localKeyIdHex" in v3582) {
            v3585 = v3555.util.hexToBytes(v3582.localKeyIdHex);
          }
          if (v3585 === undefined && !("friendlyName" in v3582) && "bagType" in v3582) {
            v3584[v3582.bagType] = v3564(v3581.safeContents, null, null, v3582.bagType);
          }
          if (v3585 !== undefined) {
            v3584.localKeyId = v3564(v3581.safeContents, "localKeyId", v3585, v3582.bagType);
          }
          if ("friendlyName" in v3582) {
            v3584.friendlyName = v3564(v3581.safeContents, "friendlyName", v3582.friendlyName, v3582.bagType);
          }
          return v3584;
        },
        getBagsByFriendlyName: function (v3586, v3587) {
          var v3588 = v3577;
          return v3564(v3581.safeContents, "friendlyName", v3586, v3587);
        },
        getBagsByLocalKeyId: function (v3589, v3590) {
          return v3564(v3581.safeContents, "localKeyId", v3589, v3590);
        }
      };
      if (v3578.version.charCodeAt(0) !== 3) {
        var v3580 = new Error("PKCS#12 PFX of version other than 3 not supported.");
        v3580.version = v3578.version.charCodeAt(0);
        throw v3580;
      }
      if (v3556.derToOid(v3578.contentType) !== v3557.oids.data) {
        var v3580 = new Error("Only PKCS#12 PFX in password integrity mode supported.");
        v3580.oid = v3556.derToOid(v3578.contentType);
        throw v3580;
      }
      var v3591 = v3578.content.value[0];
      if (v3591.tagClass !== v3556.Class.UNIVERSAL || v3591.type !== v3556.Type.OCTETSTRING) {
        throw new Error("PKCS#12 authSafe content data is not an OCTET STRING.");
      }
      v3591 = v3592(v3591);
      if (v3578.mac) {
        var v3593 = null;
        var v3594 = 0;
        var v3595 = v3556.derToOid(v3578.macAlgorithm);
        switch (v3595) {
          case v3557.oids.sha1:
            v3593 = v3555.md.sha1.create();
            v3594 = 20;
            break;
          case v3557.oids.sha256:
            v3593 = v3555.md.sha256.create();
            v3594 = 32;
            break;
          case v3557.oids.sha384:
            v3593 = v3555.md.sha384.create();
            v3594 = 48;
            break;
          case v3557.oids.sha512:
            v3593 = v3555.md.sha512.create();
            v3594 = 64;
            break;
          case v3557.oids.md5:
            v3593 = v3555.md.md5.create();
            v3594 = 16;
            break;
        }
        if (v3593 === null) {
          throw new Error("PKCS#12 uses unsupported MAC algorithm: " + v3595);
        }
        var v3596 = new v3555.util.ByteBuffer(v3578.macSalt);
        var v3597 = "macIterations" in v3578 ? parseInt(v3555.util.bytesToHex(v3578.macIterations), 16) : 1;
        var v3598 = v3558.generateKey(v3576, v3596, 3, v3597, v3594, v3593);
        var v3599 = v3555.hmac.create();
        v3599.start(v3593, v3598);
        v3599.update(v3591.value);
        var v3600 = v3599.getMac();
        if (v3600.getBytes() !== v3578.macDigest) {
          throw new Error("PKCS#12 MAC could not be verified. Invalid password?");
        }
      } else if (Array.isArray(v3574.value) && v3574.value.length > 2) {
        throw new Error("Invalid PKCS#12. macData field present but MAC was not validated.");
      }
      v3601(v3581, v3591.value, v3575, v3576);
      return v3581;
    };
    function v3592(v3602) {
      var v3603 = v3554;
      if (v3602.composed || v3602.constructed) {
        var v3604 = v3555.util.createBuffer();
        for (var v3605 = 0; v3605 < v3602.value.length; ++v3605) {
          v3604.putBytes(v3602.value[v3605].value);
        }
        v3602.composed = v3602.constructed = false;
        v3602.value = v3604.getBytes();
      }
      return v3602;
    }
    function v3601(v3606, v3607, v3608, v3609) {
      var v3610 = v3554;
      v3607 = v3556.fromDer(v3607, v3608);
      if (v3607.tagClass !== v3556.Class.UNIVERSAL || v3607.type !== v3556.Type.SEQUENCE || v3607.constructed !== true) {
        throw new Error("PKCS#12 AuthenticatedSafe expected to be a SEQUENCE OF ContentInfo");
      }
      for (var v3611 = 0; v3611 < v3607.value.length; v3611++) {
        var v3612 = v3607.value[v3611];
        var v3613 = {};
        var v3614 = [];
        if (!v3556.validate(v3612, v3559, v3613, v3614)) {
          var v3615 = new Error("Cannot read ContentInfo.");
          v3615.errors = v3614;
          throw v3615;
        }
        var v3616 = {
          encrypted: false
        };
        var v3617 = null;
        var v3618 = v3613.content.value[0];
        switch (v3556.derToOid(v3613.contentType)) {
          case v3557.oids.data:
            if (v3618.tagClass !== v3556.Class.UNIVERSAL || v3618.type !== v3556.Type.OCTETSTRING) {
              throw new Error("PKCS#12 SafeContents Data is not an OCTET STRING.");
            }
            v3617 = v3592(v3618).value;
            break;
          case v3557.oids.encryptedData:
            v3617 = v3619(v3618, v3609);
            v3616.encrypted = true;
            break;
          default:
            var v3615 = new Error("Unsupported PKCS#12 contentType.");
            v3615.contentType = v3556.derToOid(v3613.contentType);
            throw v3615;
        }
        v3616.safeBags = v3620(v3617, v3608, v3609);
        v3606.safeContents.push(v3616);
      }
    }
    function v3619(v3621, v3622) {
      var v3623 = v3554;
      var v3624 = {};
      var v3625 = [];
      if (!v3556.validate(v3621, v3555.pkcs7.asn1.encryptedDataValidator, v3624, v3625)) {
        var v3626 = new Error("Cannot read EncryptedContentInfo.");
        v3626.errors = v3625;
        throw v3626;
      }
      var v3627 = v3556.derToOid(v3624.contentType);
      if (v3627 !== v3557.oids.data) {
        var v3626 = new Error("PKCS#12 EncryptedContentInfo ContentType is not Data.");
        v3626.oid = v3627;
        throw v3626;
      }
      v3627 = v3556.derToOid(v3624.encAlgorithm);
      var v3628 = v3557.pbe.getCipher(v3627, v3624.encParameter, v3622);
      var v3629 = v3592(v3624.encryptedContentAsn1);
      var v3630 = v3555.util.createBuffer(v3629.value);
      v3628.update(v3630);
      if (!v3628.finish()) {
        throw new Error("Failed to decrypt PKCS#12 SafeContents.");
      }
      return v3628.output.getBytes();
    }
    function v3620(v3631, v3632, v3633) {
      var v3634 = {
        dh1932: 712,
        dh1933: 1238
      };
      var v3635 = v3554;
      if (!v3632 && v3631.length === 0) {
        return [];
      }
      v3631 = v3556.fromDer(v3631, v3632);
      if (v3631.tagClass !== v3556.Class.UNIVERSAL || v3631.type !== v3556.Type.SEQUENCE || v3631.constructed !== true) {
        throw new Error("PKCS#12 SafeContents expected to be a SEQUENCE OF SafeBag.");
      }
      var v3636 = [];
      for (var v3637 = 0; v3637 < v3631.value.length; v3637++) {
        var v3638 = v3631.value[v3637];
        var v3639 = {};
        var v3640 = [];
        if (!v3556.validate(v3638, v3561, v3639, v3640)) {
          var v3641 = new Error("Cannot read SafeBag.");
          v3641.errors = v3640;
          throw v3641;
        }
        var v3642 = {
          type: v3556.derToOid(v3639.bagId),
          attributes: v3643(v3639.bagAttributes)
        };
        v3636.push(v3642);
        var v3644;
        var v3645;
        var v3646 = v3639.bagValue.value[0];
        switch (v3642.type) {
          case v3557.oids.pkcs8ShroudedKeyBag:
            v3646 = v3557.decryptPrivateKeyInfo(v3646, v3633);
            if (v3646 === null) {
              throw new Error("Unable to decrypt PKCS#8 ShroudedKeyBag, wrong password?");
            }
          case v3557.oids.keyBag:
            try {
              v3642.key = v3557.privateKeyFromAsn1(v3646);
            } catch (v3647) {
              v3642.key = null;
              v3642.asn1 = v3646;
            }
            continue;
          case v3557.oids.certBag:
            v3644 = v3563;
            v3645 = function () {
              var v3648 = v3635;
              if (v3556.derToOid(v3639.certId) !== v3557.oids.x509Certificate) {
                var v3649 = new Error("Unsupported certificate type, only X.509 supported.");
                v3649.oid = v3556.derToOid(v3639.certId);
                throw v3649;
              }
              var v3650 = v3556.fromDer(v3639.cert, v3632);
              try {
                v3642.cert = v3557.certificateFromAsn1(v3650, true);
              } catch (v3651) {
                v3642.cert = null;
                v3642.asn1 = v3650;
              }
            };
            break;
          default:
            var v3641 = new Error("Unsupported PKCS#12 SafeBag type.");
            v3641.oid = v3642.type;
            throw v3641;
        }
        if (v3644 !== undefined && !v3556.validate(v3646, v3644, v3639, v3640)) {
          var v3641 = new Error("Cannot read PKCS#12 " + v3644.name);
          v3641.errors = v3640;
          throw v3641;
        }
        v3645();
      }
      return v3636;
    }
    function v3643(v3652) {
      var v3653 = v3554;
      var v3654 = {};
      if (v3652 !== undefined) {
        for (var v3655 = 0; v3655 < v3652.length; ++v3655) {
          var v3656 = {};
          var v3657 = [];
          if (!v3556.validate(v3652[v3655], v3562, v3656, v3657)) {
            var v3658 = new Error("Cannot read PKCS#12 BagAttribute.");
            v3658.errors = v3657;
            throw v3658;
          }
          var v3659 = v3556.derToOid(v3656.oid);
          if (v3557.oids[v3659] === undefined) {
            continue;
          }
          v3654[v3557.oids[v3659]] = [];
          for (var v3660 = 0; v3660 < v3656.values.length; ++v3660) {
            v3654[v3557.oids[v3659]].push(v3656.values[v3660].value);
          }
        }
      }
      return v3654;
    }
    v3558.toPkcs12Asn1 = function (v3661, v3662, v3663, v3664) {
      var v3665 = v3554;
      v3664 = v3664 || {};
      v3664.saltSize = v3664.saltSize || 8;
      v3664.count = v3664.count || 2048;
      v3664.algorithm = v3664.algorithm || v3664.encAlgorithm || "aes128";
      if (!("useMac" in v3664)) {
        v3664.useMac = true;
      }
      if (!("localKeyId" in v3664)) {
        v3664.localKeyId = null;
      }
      if (!("generateLocalKeyId" in v3664)) {
        v3664.generateLocalKeyId = true;
      }
      var v3666 = v3664.localKeyId;
      var v3667;
      if (v3666 !== null) {
        v3666 = v3555.util.hexToBytes(v3666);
      } else if (v3664.generateLocalKeyId) {
        if (v3662) {
          var v3668 = v3555.util.isArray(v3662) ? v3662[0] : v3662;
          if (typeof v3668 === "string") {
            v3668 = v3557.certificateFromPem(v3668);
          }
          var v3669 = v3555.md.sha1.create();
          v3669.update(v3556.toDer(v3557.certificateToAsn1(v3668)).getBytes());
          v3666 = v3669.digest().getBytes();
        } else {
          v3666 = v3555.random.getBytes(20);
        }
      }
      var v3670 = [];
      if (v3666 !== null) {
        v3670.push(v3556.create(v3556.Class.UNIVERSAL, v3556.Type.SEQUENCE, true, [v3556.create(v3556.Class.UNIVERSAL, v3556.Type.OID, false, v3556.oidToDer(v3557.oids.localKeyId).getBytes()), v3556.create(v3556.Class.UNIVERSAL, v3556.Type.SET, true, [v3556.create(v3556.Class.UNIVERSAL, v3556.Type.OCTETSTRING, false, v3666)])]));
      }
      if ("friendlyName" in v3664) {
        v3670.push(v3556.create(v3556.Class.UNIVERSAL, v3556.Type.SEQUENCE, true, [v3556.create(v3556.Class.UNIVERSAL, v3556.Type.OID, false, v3556.oidToDer(v3557.oids.friendlyName).getBytes()), v3556.create(v3556.Class.UNIVERSAL, v3556.Type.SET, true, [v3556.create(v3556.Class.UNIVERSAL, v3556.Type.BMPSTRING, false, v3664.friendlyName)])]));
      }
      if (v3670.length > 0) {
        v3667 = v3556.create(v3556.Class.UNIVERSAL, v3556.Type.SET, true, v3670);
      }
      var v3671 = [];
      var v3672 = [];
      if (v3662 !== null) {
        if (v3555.util.isArray(v3662)) {
          v3672 = v3662;
        } else {
          v3672 = [v3662];
        }
      }
      var v3673 = [];
      for (var v3674 = 0; v3674 < v3672.length; ++v3674) {
        v3662 = v3672[v3674];
        if (typeof v3662 === "string") {
          v3662 = v3557.certificateFromPem(v3662);
        }
        var v3675 = v3674 === 0 ? v3667 : undefined;
        var v3676 = v3557.certificateToAsn1(v3662);
        var v3677 = v3556.create(v3556.Class.UNIVERSAL, v3556.Type.SEQUENCE, true, [v3556.create(v3556.Class.UNIVERSAL, v3556.Type.OID, false, v3556.oidToDer(v3557.oids.certBag).getBytes()), v3556.create(v3556.Class.CONTEXT_SPECIFIC, 0, true, [v3556.create(v3556.Class.UNIVERSAL, v3556.Type.SEQUENCE, true, [v3556.create(v3556.Class.UNIVERSAL, v3556.Type.OID, false, v3556.oidToDer(v3557.oids.x509Certificate).getBytes()), v3556.create(v3556.Class.CONTEXT_SPECIFIC, 0, true, [v3556.create(v3556.Class.UNIVERSAL, v3556.Type.OCTETSTRING, false, v3556.toDer(v3676).getBytes())])])]), v3675]);
        v3673.push(v3677);
      }
      if (v3673.length > 0) {
        var v3678 = v3556.create(v3556.Class.UNIVERSAL, v3556.Type.SEQUENCE, true, v3673);
        var v3679 = v3556.create(v3556.Class.UNIVERSAL, v3556.Type.SEQUENCE, true, [v3556.create(v3556.Class.UNIVERSAL, v3556.Type.OID, false, v3556.oidToDer(v3557.oids.data).getBytes()), v3556.create(v3556.Class.CONTEXT_SPECIFIC, 0, true, [v3556.create(v3556.Class.UNIVERSAL, v3556.Type.OCTETSTRING, false, v3556.toDer(v3678).getBytes())])]);
        v3671.push(v3679);
      }
      var v3680 = null;
      if (v3661 !== null) {
        var v3681 = v3557.wrapRsaPrivateKey(v3557.privateKeyToAsn1(v3661));
        if (v3663 === null) {
          v3680 = v3556.create(v3556.Class.UNIVERSAL, v3556.Type.SEQUENCE, true, [v3556.create(v3556.Class.UNIVERSAL, v3556.Type.OID, false, v3556.oidToDer(v3557.oids.keyBag).getBytes()), v3556.create(v3556.Class.CONTEXT_SPECIFIC, 0, true, [v3681]), v3667]);
        } else {
          v3680 = v3556.create(v3556.Class.UNIVERSAL, v3556.Type.SEQUENCE, true, [v3556.create(v3556.Class.UNIVERSAL, v3556.Type.OID, false, v3556.oidToDer(v3557.oids.pkcs8ShroudedKeyBag).getBytes()), v3556.create(v3556.Class.CONTEXT_SPECIFIC, 0, true, [v3557.encryptPrivateKeyInfo(v3681, v3663, v3664)]), v3667]);
        }
        var v3682 = v3556.create(v3556.Class.UNIVERSAL, v3556.Type.SEQUENCE, true, [v3680]);
        var v3683 = v3556.create(v3556.Class.UNIVERSAL, v3556.Type.SEQUENCE, true, [v3556.create(v3556.Class.UNIVERSAL, v3556.Type.OID, false, v3556.oidToDer(v3557.oids.data).getBytes()), v3556.create(v3556.Class.CONTEXT_SPECIFIC, 0, true, [v3556.create(v3556.Class.UNIVERSAL, v3556.Type.OCTETSTRING, false, v3556.toDer(v3682).getBytes())])]);
        v3671.push(v3683);
      }
      var v3684 = v3556.create(v3556.Class.UNIVERSAL, v3556.Type.SEQUENCE, true, v3671);
      var v3685;
      if (v3664.useMac) {
        var v3669 = v3555.md.sha1.create();
        var v3686 = new v3555.util.ByteBuffer(v3555.random.getBytes(v3664.saltSize));
        var v3687 = v3664.count;
        var v3661 = v3558.generateKey(v3663, v3686, 3, v3687, 20);
        var v3688 = v3555.hmac.create();
        v3688.start(v3669, v3661);
        v3688.update(v3556.toDer(v3684).getBytes());
        var v3689 = v3688.getMac();
        v3685 = v3556.create(v3556.Class.UNIVERSAL, v3556.Type.SEQUENCE, true, [v3556.create(v3556.Class.UNIVERSAL, v3556.Type.SEQUENCE, true, [v3556.create(v3556.Class.UNIVERSAL, v3556.Type.SEQUENCE, true, [v3556.create(v3556.Class.UNIVERSAL, v3556.Type.OID, false, v3556.oidToDer(v3557.oids.sha1).getBytes()), v3556.create(v3556.Class.UNIVERSAL, v3556.Type.NULL, false, "")]), v3556.create(v3556.Class.UNIVERSAL, v3556.Type.OCTETSTRING, false, v3689.getBytes())]), v3556.create(v3556.Class.UNIVERSAL, v3556.Type.OCTETSTRING, false, v3686.getBytes()), v3556.create(v3556.Class.UNIVERSAL, v3556.Type.INTEGER, false, v3556.integerToDer(v3687).getBytes())]);
      }
      return v3556.create(v3556.Class.UNIVERSAL, v3556.Type.SEQUENCE, true, [v3556.create(v3556.Class.UNIVERSAL, v3556.Type.INTEGER, false, v3556.integerToDer(3).getBytes()), v3556.create(v3556.Class.UNIVERSAL, v3556.Type.SEQUENCE, true, [v3556.create(v3556.Class.UNIVERSAL, v3556.Type.OID, false, v3556.oidToDer(v3557.oids.data).getBytes()), v3556.create(v3556.Class.CONTEXT_SPECIFIC, 0, true, [v3556.create(v3556.Class.UNIVERSAL, v3556.Type.OCTETSTRING, false, v3556.toDer(v3684).getBytes())])]), v3685]);
    };
    v3558.generateKey = v3555.pbe.generatePkcs12Key;
  }
});
var require_pki = __commonJS({
  "node_modules/node-forge/lib/pki.js"(v3690, v3691) {
    var v3692 = {
      dh1934: 400,
      dh1935: 1357
    };
    var v3693 = {
      dh1936: 726,
      dh1937: 1025
    };
    var v3694 = {
      dh1938: 384,
      dh1939: 930,
      dh1940: 1453,
      dh1941: 597,
      dh1942: 603,
      dh1943: 744
    };
    var v3695 = {
      dh1944: 619,
      dh1945: 1508
    };
    var v3696 = v2;
    var v3697 = require_forge();
    require_asn1();
    require_oids();
    require_pbe();
    require_pem();
    require_pbkdf2();
    require_pkcs12();
    require_pss();
    require_rsa();
    require_util();
    require_x509();
    var v3698 = v3697.asn1;
    var v3699 = v3691.exports = v3697.pki = v3697.pki || {};
    v3699.pemToDer = function (v3700) {
      var v3701 = v3696;
      var v3702 = v3697.pem.decode(v3700)[0];
      if (v3702.procType && v3702.procType.type === "ENCRYPTED") {
        throw new Error("Could not convert PEM to DER; PEM is encrypted.");
      }
      return v3697.util.createBuffer(v3702.body);
    };
    v3699.privateKeyFromPem = function (v3703) {
      var v3704 = v3696;
      var v3705 = v3697.pem.decode(v3703)[0];
      if (v3705.type !== "PRIVATE KEY" && v3705.type !== "RSA PRIVATE KEY") {
        var v3706 = new Error("Could not convert private key from PEM; PEM header type is not \"PRIVATE KEY\" or \"RSA PRIVATE KEY\".");
        v3706.headerType = v3705.type;
        throw v3706;
      }
      if (v3705.procType && v3705.procType.type === "ENCRYPTED") {
        throw new Error("Could not convert private key from PEM; PEM is encrypted.");
      }
      var v3707 = v3698.fromDer(v3705.body);
      return v3699.privateKeyFromAsn1(v3707);
    };
    v3699.privateKeyToPem = function (v3708, v3709) {
      var v3710 = v3696;
      var v3711 = {
        type: "RSA PRIVATE KEY",
        body: v3698.toDer(v3699.privateKeyToAsn1(v3708)).getBytes()
      };
      return v3697.pem.encode(v3711, {
        maxline: v3709
      });
    };
    v3699.privateKeyInfoToPem = function (v3712, v3713) {
      var v3714 = v3696;
      var v3715 = {
        type: "PRIVATE KEY",
        body: v3698.toDer(v3712).getBytes()
      };
      return v3697.pem.encode(v3715, {
        maxline: v3713
      });
    };
  }
});
var require_tls = __commonJS({
  "node_modules/node-forge/lib/tls.js"(v3716, v3717) {
    var v3718 = {
      dh1946: 437,
      dh1947: 1137,
      dh1948: 855,
      dh1949: 892,
      dh1950: 452,
      dh1951: 980,
      dh1952: 700,
      dh1953: 907,
      dh1954: 1426,
      dh1955: 1311,
      dh1956: 784,
      dh1957: 659,
      dh1958: 907,
      dh1959: 1114,
      dh1960: 674,
      dh1961: 1249,
      dh1962: 769,
      dh1963: 997,
      dh1964: 1141,
      dh1965: 461
    };
    var v3719 = {
      dh1966: 634,
      dh1967: 1399,
      dh1968: 667,
      dh1969: 437,
      dh1970: 801,
      dh1971: 831,
      dh1972: 1026,
      dh1973: 1303,
      dh1974: 619,
      dh1975: 1501,
      dh1976: 500
    };
    var v3720 = {
      dh1977: 667,
      dh1978: 667,
      dh1979: 1202,
      dh1980: 679,
      dh1981: 855
    };
    var v3721 = {
      dh1982: 900,
      dh1983: 857,
      dh1984: 252,
      dh1985: 825,
      dh1986: 553
    };
    var v3722 = {
      dh1987: 1202,
      dh1988: 1276,
      dh1989: 619,
      dh1990: 271,
      dh1991: 271,
      dh1992: 1366,
      dh1993: 317,
      dh1994: 1011,
      dh1995: 271,
      dh1996: 1219,
      dh1997: 449
    };
    var v3723 = {
      dh1998: 394,
      dh1999: 1114,
      dh2000: 1052
    };
    var v3724 = {
      dh2001: 589,
      dh2002: 1075,
      dh2003: 1557,
      dh2004: 857,
      dh2005: 1557
    };
    var v3725 = {
      dh2006: 1209,
      dh2007: 1557,
      dh2008: 589
    };
    var v3726 = {
      dh2009: 1172,
      dh2010: 634,
      dh2011: 619,
      dh2012: 237,
      dh2013: 1219
    };
    var v3727 = {
      dh2014: 1204,
      dh2015: 635,
      dh2016: 651,
      dh2017: 635
    };
    var v3728 = {
      dh2018: 855,
      dh2019: 855,
      dh2020: 783,
      dh2021: 880,
      dh2022: 855,
      dh2023: 892,
      dh2024: 1457,
      dh2025: 569,
      dh2026: 1457
    };
    var v3729 = {
      dh2027: 1133,
      dh2028: 880,
      dh2029: 569,
      dh2030: 892
    };
    var v3730 = {
      dh2031: 1260,
      dh2032: 333,
      dh2033: 1176
    };
    var v3731 = {
      dh2034: 406,
      dh2035: 597,
      dh2036: 406,
      dh2037: 1364,
      dh2038: 317,
      dh2039: 914,
      dh2040: 914,
      dh2041: 531,
      dh2042: 857
    };
    var v3732 = {
      dh2043: 795,
      dh2044: 619,
      dh2045: 250
    };
    var v3733 = {
      dh2046: 317,
      dh2047: 654,
      dh2048: 1057,
      dh2049: 1114,
      dh2050: 1052,
      dh2051: 1260,
      dh2052: 857
    };
    var v3734 = {
      dh2053: 619
    };
    var v3735 = {
      dh2054: 1508,
      dh2055: 619,
      dh2056: 634,
      dh2057: 619
    };
    var v3736 = {
      dh2058: 1508,
      dh2059: 1077,
      dh2060: 1432
    };
    var v3737 = {
      dh2061: 1260
    };
    var v3738 = {
      dh2062: 317,
      dh2063: 1417,
      dh2064: 542,
      dh2065: 250,
      dh2066: 1530,
      dh2067: 671,
      dh2068: 619,
      dh2069: 1260
    };
    var v3739 = {
      dh2070: 1241,
      dh2071: 317,
      dh2072: 600,
      dh2073: 384,
      dh2074: 1005,
      dh2075: 597,
      dh2076: 902,
      dh2077: 615,
      dh2078: 1409,
      dh2079: 654,
      dh2080: 759,
      dh2081: 1219,
      dh2082: 892,
      dh2083: 857
    };
    var v3740 = {
      dh2084: 317,
      dh2085: 957,
      dh2086: 1366,
      dh2087: 1260
    };
    var v3741 = {
      dh2088: 317,
      dh2089: 1366,
      dh2090: 271,
      dh2091: 240,
      dh2092: 857,
      dh2093: 1260,
      dh2094: 619,
      dh2095: 1508,
      dh2096: 1260,
      dh2097: 619,
      dh2098: 1508,
      dh2099: 654,
      dh2100: 271,
      dh2101: 619
    };
    var v3742 = {
      dh2102: 1260,
      dh2103: 635
    };
    var v3743 = {
      dh2104: 857,
      dh2105: 1151
    };
    var v3744 = {
      dh2106: 619,
      dh2107: 764
    };
    var v3745 = {
      dh2108: 1052,
      dh2109: 372,
      dh2110: 352,
      dh2111: 317,
      dh2112: 526,
      dh2113: 967,
      dh2114: 967,
      dh2115: 1335,
      dh2116: 793,
      dh2117: 988,
      dh2118: 1335,
      dh2119: 209,
      dh2120: 1521,
      dh2121: 793
    };
    var v3746 = {
      dh2122: 1148,
      dh2123: 1312,
      dh2124: 237
    };
    var v3747 = {
      dh2125: 251,
      dh2126: 317,
      dh2127: 671,
      dh2128: 1074,
      dh2129: 270,
      dh2130: 574,
      dh2131: 1025
    };
    var v3748 = {
      dh2132: 1025,
      dh2133: 553,
      dh2134: 216
    };
    var v3749 = {
      dh2135: 914
    };
    var v3750 = {
      dh2136: 492,
      dh2137: 857,
      dh2138: 372,
      dh2139: 1241,
      dh2140: 674,
      dh2141: 696,
      dh2142: 1057,
      dh2143: 1544,
      dh2144: 317,
      dh2145: 1057,
      dh2146: 1241,
      dh2147: 286,
      dh2148: 452
    };
    var v3751 = {
      dh2149: 1276,
      dh2150: 1346,
      dh2151: 1547,
      dh2152: 892,
      dh2153: 229,
      dh2154: 263,
      dh2155: 685,
      dh2156: 783,
      dh2157: 1258,
      dh2158: 856,
      dh2159: 855,
      dh2160: 569,
      dh2161: 876,
      dh2162: 855,
      dh2163: 608,
      dh2164: 892,
      dh2165: 1490,
      dh2166: 1002,
      dh2167: 1241
    };
    var v3752 = {
      dh2168: 372,
      dh2169: 914,
      dh2170: 654,
      dh2171: 317,
      dh2172: 1241,
      dh2173: 1114,
      dh2174: 1377,
      dh2175: 1219,
      dh2176: 758,
      dh2177: 317,
      dh2178: 817,
      dh2179: 501,
      dh2180: 535,
      dh2181: 1249,
      dh2182: 617,
      dh2183: 1062,
      dh2184: 637,
      dh2185: 633
    };
    var v3753 = {
      dh2186: 1276,
      dh2187: 906,
      dh2188: 855,
      dh2189: 1241,
      dh2190: 1052,
      dh2191: 617,
      dh2192: 244,
      dh2193: 1471,
      dh2194: 617,
      dh2195: 317
    };
    var v3754 = {
      dh2196: 1185,
      dh2197: 1188,
      dh2198: 635,
      dh2199: 338,
      dh2200: 1204,
      dh2201: 635,
      dh2202: 1219,
      dh2203: 1012
    };
    var v3755 = {
      dh2204: 1318,
      dh2205: 237,
      dh2206: 372,
      dh2207: 619,
      dh2208: 1077,
      dh2209: 317,
      dh2210: 1057,
      dh2211: 1219,
      dh2212: 868
    };
    var v3756 = {
      dh2213: 1219,
      dh2214: 914,
      dh2215: 258,
      dh2216: 1327
    };
    var v3757 = {
      dh2217: 892,
      dh2218: 410,
      dh2219: 375,
      dh2220: 1185,
      dh2221: 364,
      dh2222: 855,
      dh2223: 237,
      dh2224: 628,
      dh2225: 317,
      dh2226: 542,
      dh2227: 278
    };
    var v3758 = {
      dh2228: 237,
      dh2229: 855,
      dh2230: 925,
      dh2231: 592,
      dh2232: 400,
      dh2233: 436,
      dh2234: 1219,
      dh2235: 855,
      dh2236: 1241,
      dh2237: 1052,
      dh2238: 1212,
      dh2239: 855,
      dh2240: 892,
      dh2241: 317,
      dh2242: 759
    };
    var v3759 = {
      dh2243: 1364,
      dh2244: 271,
      dh2245: 317,
      dh2246: 817,
      dh2247: 346,
      dh2248: 317,
      dh2249: 1471,
      dh2250: 617,
      dh2251: 252,
      dh2252: 501,
      dh2253: 406,
      dh2254: 371,
      dh2255: 406,
      dh2256: 252,
      dh2257: 1485,
      dh2258: 633
    };
    var v3760 = {
      dh2259: 271,
      dh2260: 542,
      dh2261: 1191,
      dh2262: 1318,
      dh2263: 286,
      dh2264: 317
    };
    var v3761 = {
      dh2265: 1364,
      dh2266: 1246,
      dh2267: 1108
    };
    var v3762 = {
      dh2268: 1318,
      dh2269: 892,
      dh2270: 914,
      dh2271: 1110,
      dh2272: 857,
      dh2273: 1276,
      dh2274: 1276,
      dh2275: 1151,
      dh2276: 857,
      dh2277: 531,
      dh2278: 271,
      dh2279: 271,
      dh2280: 317,
      dh2281: 1219,
      dh2282: 1110,
      dh2283: 1025,
      dh2284: 1179,
      dh2285: 855,
      dh2286: 237,
      dh2287: 1402,
      dh2288: 839
    };
    var v3763 = {
      dh2289: 308
    };
    var v3764 = {
      dh2290: 696,
      dh2291: 1114,
      dh2292: 1052,
      dh2293: 1318
    };
    var v3765 = {
      dh2294: 278,
      dh2295: 278
    };
    var v3766 = {
      dh2296: 857
    };
    var v3767 = {
      dh2297: 1276,
      dh2298: 933,
      dh2299: 619,
      dh2300: 1508
    };
    var v3768 = {
      dh2301: 914
    };
    var v3769 = {
      dh2302: 619,
      dh2303: 1508
    };
    var v3770 = {
      dh2304: 1053,
      dh2305: 1508,
      dh2306: 1366,
      dh2307: 271,
      dh2308: 542,
      dh2309: 914
    };
    var v3771 = {
      dh2310: 219,
      dh2311: 1364,
      dh2312: 352,
      dh2313: 352,
      dh2314: 619,
      dh2315: 446
    };
    var v3772 = v2;
    var v3773 = require_forge();
    require_asn1();
    require_hmac();
    require_md5();
    require_pem();
    require_pki();
    require_random();
    require_sha1();
    require_util();
    function v3774(v3775, v3776, v3777, v3778) {
      var v3779 = v1;
      var v3780 = v3773.util.createBuffer();
      var v3781 = v3775.length >> 1;
      var v3782 = v3781 + (v3775.length & 1);
      var v3783 = v3775.substr(0, v3782);
      var v3784 = v3775.substr(v3781, v3782);
      var v3785 = v3773.util.createBuffer();
      var v3786 = v3773.hmac.create();
      v3777 = v3776 + v3777;
      var v3787 = Math.ceil(v3778 / 16);
      var v3788 = Math.ceil(v3778 / 20);
      v3786.start("MD5", v3783);
      var v3789 = v3773.util.createBuffer();
      v3785.putBytes(v3777);
      for (var v3790 = 0; v3790 < v3787; ++v3790) {
        v3786.start(null, null);
        v3786.update(v3785.getBytes());
        v3785.putBuffer(v3786.digest());
        v3786.start(null, null);
        v3786.update(v3785.bytes() + v3777);
        v3789.putBuffer(v3786.digest());
      }
      v3786.start("SHA1", v3784);
      var v3791 = v3773.util.createBuffer();
      v3785.clear();
      v3785.putBytes(v3777);
      for (var v3790 = 0; v3790 < v3788; ++v3790) {
        v3786.start(null, null);
        v3786.update(v3785.getBytes());
        v3785.putBuffer(v3786.digest());
        v3786.start(null, null);
        v3786.update(v3785.bytes() + v3777);
        v3791.putBuffer(v3786.digest());
      }
      v3780.putBytes(v3773.util.xorBytes(v3789.getBytes(), v3791.getBytes(), v3778));
      return v3780;
    }
    function v3792(v3793, v3794, v3795) {
      var v3796 = v1;
      var v3797 = v3773.hmac.create();
      v3797.start("SHA1", v3793);
      var v3798 = v3773.util.createBuffer();
      v3798.putInt32(v3794[0]);
      v3798.putInt32(v3794[1]);
      v3798.putByte(v3795.type);
      v3798.putByte(v3795.version.major);
      v3798.putByte(v3795.version.minor);
      v3798.putInt16(v3795.length);
      v3798.putBytes(v3795.fragment.bytes());
      v3797.update(v3798.getBytes());
      return v3797.digest().getBytes();
    }
    function v3799(v3800, v3801, v3802) {
      var v3803 = v1;
      var v3804 = false;
      try {
        var v3805 = v3800.deflate(v3801.fragment.getBytes());
        v3801.fragment = v3773.util.createBuffer(v3805);
        v3801.length = v3805.length;
        v3804 = true;
      } catch (v3806) {}
      return v3804;
    }
    function v3807(v3808, v3809, v3810) {
      var v3811 = v1;
      var v3812 = false;
      try {
        var v3813 = v3808.inflate(v3809.fragment.getBytes());
        v3809.fragment = v3773.util.createBuffer(v3813);
        v3809.length = v3813.length;
        v3812 = true;
      } catch (v3814) {}
      return v3812;
    }
    function v3815(v3816, v3817) {
      var v3818 = v1;
      var v3819 = 0;
      switch (v3817) {
        case 1:
          v3819 = v3816.getByte();
          break;
        case 2:
          v3819 = v3816.getInt16();
          break;
        case 3:
          v3819 = v3816.getInt24();
          break;
        case 4:
          v3819 = v3816.getInt32();
          break;
      }
      return v3773.util.createBuffer(v3816.getBytes(v3819));
    }
    function v3820(v3821, v3822, v3823) {
      var v3824 = v1;
      v3821.putInt(v3823.length(), v3822 << 3);
      v3821.putBuffer(v3823);
    }
    var v3825 = {
      Versions: {
        TLS_1_0: {
          major: 3,
          minor: 1
        },
        TLS_1_1: {
          major: 3,
          minor: 2
        },
        TLS_1_2: {
          major: 3,
          minor: 3
        }
      }
    };
    v3825.SupportedVersions = [v3825.Versions.TLS_1_1, v3825.Versions.TLS_1_0];
    v3825.Version = v3825.SupportedVersions[0];
    v3825.MaxFragment = 15360;
    v3825.ConnectionEnd = {
      server: 0,
      client: 1
    };
    v3825.PRFAlgorithm = {
      tls_prf_sha256: 0
    };
    v3825.BulkCipherAlgorithm = {
      none: null,
      rc4: 0,
      des3: 1,
      aes: 2
    };
    v3825.CipherType = {
      stream: 0,
      block: 1,
      aead: 2
    };
    v3825.MACAlgorithm = {
      none: null,
      hmac_md5: 0,
      hmac_sha1: 1,
      hmac_sha256: 2,
      hmac_sha384: 3,
      hmac_sha512: 4
    };
    v3825.CompressionMethod = {
      none: 0,
      deflate: 1
    };
    v3825.ContentType = {
      change_cipher_spec: 20,
      alert: 21,
      handshake: 22,
      application_data: 23,
      heartbeat: 24
    };
    v3825.HandshakeType = {
      hello_request: 0,
      client_hello: 1,
      server_hello: 2,
      certificate: 11,
      server_key_exchange: 12,
      certificate_request: 13,
      server_hello_done: 14,
      certificate_verify: 15,
      client_key_exchange: 16,
      finished: 20
    };
    v3825.Alert = {};
    v3825.Alert.Level = {
      warning: 1,
      fatal: 2
    };
    v3825.Alert.Description = {
      close_notify: 0,
      unexpected_message: 10,
      bad_record_mac: 20,
      decryption_failed: 21,
      record_overflow: 22,
      decompression_failure: 30,
      handshake_failure: 40,
      bad_certificate: 42,
      unsupported_certificate: 43,
      certificate_revoked: 44,
      certificate_expired: 45,
      certificate_unknown: 46,
      illegal_parameter: 47,
      unknown_ca: 48,
      access_denied: 49,
      decode_error: 50,
      decrypt_error: 51,
      export_restriction: 60,
      protocol_version: 70,
      insufficient_security: 71,
      internal_error: 80,
      user_canceled: 90,
      no_renegotiation: 100
    };
    v3825.HeartbeatMessageType = {
      heartbeat_request: 1,
      heartbeat_response: 2
    };
    v3825.CipherSuites = {};
    v3825.getCipherSuite = function (v3826) {
      var v3827 = v3772;
      var v3828 = null;
      for (var v3829 in v3825.CipherSuites) {
        var v3830 = v3825.CipherSuites[v3829];
        if (v3830.id[0] === v3826.charCodeAt(0) && v3830.id[1] === v3826.charCodeAt(1)) {
          v3828 = v3830;
          break;
        }
      }
      return v3828;
    };
    v3825.handleUnexpected = function (v3831, v3832) {
      var v3833 = v3772;
      var v3834 = !v3831.open && v3831.entity === v3825.ConnectionEnd.client;
      if (!v3834) {
        v3831.error(v3831, {
          message: "Unexpected message. Received TLS record out of order.",
          send: true,
          alert: {
            level: v3825.Alert.Level.fatal,
            description: v3825.Alert.Description.unexpected_message
          }
        });
      }
    };
    v3825.handleHelloRequest = function (v3835, v3836, v3837) {
      var v3838 = v3772;
      if (!v3835.handshaking && v3835.handshakes > 0) {
        v3825.queue(v3835, v3825.createAlert(v3835, {
          level: v3825.Alert.Level.warning,
          description: v3825.Alert.Description.no_renegotiation
        }));
        v3825.flush(v3835);
      }
      v3835.process();
    };
    v3825.parseHelloMessage = function (v3839, v3840, v3841) {
      var v3842 = v3772;
      var v3843 = null;
      var v3844 = v3839.entity === v3825.ConnectionEnd.client;
      if (v3841 < 38) {
        v3839.error(v3839, {
          message: v3844 ? "Invalid ServerHello message. Message too short." : "Invalid ClientHello message. Message too short.",
          send: true,
          alert: {
            level: v3825.Alert.Level.fatal,
            description: v3825.Alert.Description.illegal_parameter
          }
        });
      } else {
        var v3845 = v3840.fragment;
        var v3846 = v3845.length();
        v3843 = {
          version: {
            major: v3845.getByte(),
            minor: v3845.getByte()
          },
          random: v3773.util.createBuffer(v3845.getBytes(32)),
          session_id: v3815(v3845, 1),
          extensions: []
        };
        if (v3844) {
          v3843.cipher_suite = v3845.getBytes(2);
          v3843.compression_method = v3845.getByte();
        } else {
          v3843.cipher_suites = v3815(v3845, 2);
          v3843.compression_methods = v3815(v3845, 1);
        }
        v3846 = v3841 - (v3846 - v3845.length());
        if (v3846 > 0) {
          var v3847 = v3815(v3845, 2);
          while (v3847.length() > 0) {
            v3843.extensions.push({
              type: [v3847.getByte(), v3847.getByte()],
              data: v3815(v3847, 2)
            });
          }
          if (!v3844) {
            for (var v3848 = 0; v3848 < v3843.extensions.length; ++v3848) {
              var v3849 = v3843.extensions[v3848];
              if (v3849.type[0] === 0 && v3849.type[1] === 0) {
                var v3850 = v3815(v3849.data, 2);
                while (v3850.length() > 0) {
                  var v3851 = v3850.getByte();
                  if (v3851 !== 0) {
                    break;
                  }
                  v3839.session.extensions.server_name.serverNameList.push(v3815(v3850, 2).getBytes());
                }
              }
            }
          }
        }
        if (v3839.session.version) {
          if (v3843.version.major !== v3839.session.version.major || v3843.version.minor !== v3839.session.version.minor) {
            return v3839.error(v3839, {
              message: "TLS version change is disallowed during renegotiation.",
              send: true,
              alert: {
                level: v3825.Alert.Level.fatal,
                description: v3825.Alert.Description.protocol_version
              }
            });
          }
        }
        if (v3844) {
          v3839.session.cipherSuite = v3825.getCipherSuite(v3843.cipher_suite);
        } else {
          var v3852 = v3773.util.createBuffer(v3843.cipher_suites.bytes());
          while (v3852.length() > 0) {
            v3839.session.cipherSuite = v3825.getCipherSuite(v3852.getBytes(2));
            if (v3839.session.cipherSuite !== null) {
              break;
            }
          }
        }
        if (v3839.session.cipherSuite === null) {
          return v3839.error(v3839, {
            message: "No cipher suites in common.",
            send: true,
            alert: {
              level: v3825.Alert.Level.fatal,
              description: v3825.Alert.Description.handshake_failure
            },
            cipherSuite: v3773.util.bytesToHex(v3843.cipher_suite)
          });
        }
        if (v3844) {
          v3839.session.compressionMethod = v3843.compression_method;
        } else {
          v3839.session.compressionMethod = v3825.CompressionMethod.none;
        }
      }
      return v3843;
    };
    v3825.createSecurityParameters = function (v3853, v3854) {
      var v3855 = v3772;
      var v3856 = v3853.entity === v3825.ConnectionEnd.client;
      var v3857 = v3854.random.bytes();
      var v3858 = v3856 ? v3853.session.sp.client_random : v3857;
      var v3859 = v3856 ? v3857 : v3825.createRandom().getBytes();
      v3853.session.sp = {
        entity: v3853.entity,
        prf_algorithm: v3825.PRFAlgorithm.tls_prf_sha256,
        bulk_cipher_algorithm: null,
        cipher_type: null,
        enc_key_length: null,
        block_length: null,
        fixed_iv_length: null,
        record_iv_length: null,
        mac_algorithm: null,
        mac_length: null,
        mac_key_length: null,
        compression_algorithm: v3853.session.compressionMethod,
        pre_master_secret: null,
        master_secret: null,
        client_random: v3858,
        server_random: v3859
      };
    };
    v3825.handleServerHello = function (v3860, v3861, v3862) {
      var v3863 = v3772;
      var v3864 = v3825.parseHelloMessage(v3860, v3861, v3862);
      if (v3860.fail) {
        return;
      }
      if (v3864.version.minor <= v3860.version.minor) {
        v3860.version.minor = v3864.version.minor;
      } else {
        return v3860.error(v3860, {
          message: "Incompatible TLS version.",
          send: true,
          alert: {
            level: v3825.Alert.Level.fatal,
            description: v3825.Alert.Description.protocol_version
          }
        });
      }
      v3860.session.version = v3860.version;
      var v3865 = v3864.session_id.bytes();
      if (v3865.length > 0 && v3865 === v3860.session.id) {
        v3860.expect = v3866;
        v3860.session.resuming = true;
        v3860.session.sp.server_random = v3864.random.bytes();
      } else {
        v3860.expect = v3867;
        v3860.session.resuming = false;
        v3825.createSecurityParameters(v3860, v3864);
      }
      v3860.session.id = v3865;
      v3860.process();
    };
    v3825.handleClientHello = function (v3868, v3869, v3870) {
      var v3871 = v3772;
      var v3872 = v3825.parseHelloMessage(v3868, v3869, v3870);
      if (v3868.fail) {
        return;
      }
      var v3873 = v3872.session_id.bytes();
      var v3874 = null;
      if (v3868.sessionCache) {
        v3874 = v3868.sessionCache.getSession(v3873);
        if (v3874 === null) {
          v3873 = "";
        } else if (v3874.version.major !== v3872.version.major || v3874.version.minor > v3872.version.minor) {
          v3874 = null;
          v3873 = "";
        }
      }
      if (v3873.length === 0) {
        v3873 = v3773.random.getBytes(32);
      }
      v3868.session.id = v3873;
      v3868.session.clientHelloVersion = v3872.version;
      v3868.session.sp = {};
      if (v3874) {
        v3868.version = v3868.session.version = v3874.version;
        v3868.session.sp = v3874.sp;
      } else {
        var v3875;
        for (var v3876 = 1; v3876 < v3825.SupportedVersions.length; ++v3876) {
          v3875 = v3825.SupportedVersions[v3876];
          if (v3875.minor <= v3872.version.minor) {
            break;
          }
        }
        v3868.version = {
          major: v3875.major,
          minor: v3875.minor
        };
        v3868.session.version = v3868.version;
      }
      if (v3874 !== null) {
        v3868.expect = v3877;
        v3868.session.resuming = true;
        v3868.session.sp.client_random = v3872.random.bytes();
      } else {
        v3868.expect = v3868.verifyClient !== false ? v3878 : v3879;
        v3868.session.resuming = false;
        v3825.createSecurityParameters(v3868, v3872);
      }
      v3868.open = true;
      v3825.queue(v3868, v3825.createRecord(v3868, {
        type: v3825.ContentType.handshake,
        data: v3825.createServerHello(v3868)
      }));
      if (v3868.session.resuming) {
        v3825.queue(v3868, v3825.createRecord(v3868, {
          type: v3825.ContentType.change_cipher_spec,
          data: v3825.createChangeCipherSpec()
        }));
        v3868.state.pending = v3825.createConnectionState(v3868);
        v3868.state.current.write = v3868.state.pending.write;
        v3825.queue(v3868, v3825.createRecord(v3868, {
          type: v3825.ContentType.handshake,
          data: v3825.createFinished(v3868)
        }));
      } else {
        v3825.queue(v3868, v3825.createRecord(v3868, {
          type: v3825.ContentType.handshake,
          data: v3825.createCertificate(v3868)
        }));
        if (!v3868.fail) {
          v3825.queue(v3868, v3825.createRecord(v3868, {
            type: v3825.ContentType.handshake,
            data: v3825.createServerKeyExchange(v3868)
          }));
          if (v3868.verifyClient !== false) {
            v3825.queue(v3868, v3825.createRecord(v3868, {
              type: v3825.ContentType.handshake,
              data: v3825.createCertificateRequest(v3868)
            }));
          }
          v3825.queue(v3868, v3825.createRecord(v3868, {
            type: v3825.ContentType.handshake,
            data: v3825.createServerHelloDone(v3868)
          }));
        }
      }
      v3825.flush(v3868);
      v3868.process();
    };
    v3825.handleCertificate = function (v3880, v3881, v3882) {
      var v3883 = v3772;
      if (v3882 < 3) {
        return v3880.error(v3880, {
          message: "Invalid Certificate message. Message too short.",
          send: true,
          alert: {
            level: v3825.Alert.Level.fatal,
            description: v3825.Alert.Description.illegal_parameter
          }
        });
      }
      var v3884 = v3881.fragment;
      var v3885 = {
        certificate_list: v3815(v3884, 3)
      };
      var v3886;
      var v3887;
      var v3888 = [];
      try {
        while (v3885.certificate_list.length() > 0) {
          v3886 = v3815(v3885.certificate_list, 3);
          v3887 = v3773.asn1.fromDer(v3886);
          v3886 = v3773.pki.certificateFromAsn1(v3887, true);
          v3888.push(v3886);
        }
      } catch (v3889) {
        return v3880.error(v3880, {
          message: "Could not parse certificate list.",
          cause: v3889,
          send: true,
          alert: {
            level: v3825.Alert.Level.fatal,
            description: v3825.Alert.Description.bad_certificate
          }
        });
      }
      var v3890 = v3880.entity === v3825.ConnectionEnd.client;
      if ((v3890 || v3880.verifyClient === true) && v3888.length === 0) {
        v3880.error(v3880, {
          message: v3890 ? "No server certificate provided." : "No client certificate provided.",
          send: true,
          alert: {
            level: v3825.Alert.Level.fatal,
            description: v3825.Alert.Description.illegal_parameter
          }
        });
      } else if (v3888.length === 0) {
        v3880.expect = v3890 ? v3891 : v3879;
      } else {
        if (v3890) {
          v3880.session.serverCertificate = v3888[0];
        } else {
          v3880.session.clientCertificate = v3888[0];
        }
        if (v3825.verifyCertificateChain(v3880, v3888)) {
          v3880.expect = v3890 ? v3891 : v3879;
        }
      }
      v3880.process();
    };
    v3825.handleServerKeyExchange = function (v3892, v3893, v3894) {
      var v3895 = v3772;
      if (v3894 > 0) {
        return v3892.error(v3892, {
          message: "Invalid key parameters. Only RSA is supported.",
          send: true,
          alert: {
            level: v3825.Alert.Level.fatal,
            description: v3825.Alert.Description.unsupported_certificate
          }
        });
      }
      v3892.expect = v3896;
      v3892.process();
    };
    v3825.handleClientKeyExchange = function (v3897, v3898, v3899) {
      var v3900 = v3772;
      if (v3899 < 48) {
        return v3897.error(v3897, {
          message: "Invalid key parameters. Only RSA is supported.",
          send: true,
          alert: {
            level: v3825.Alert.Level.fatal,
            description: v3825.Alert.Description.unsupported_certificate
          }
        });
      }
      var v3901 = v3898.fragment;
      var v3902 = {
        enc_pre_master_secret: v3815(v3901, 2).getBytes()
      };
      var v3903 = null;
      if (v3897.getPrivateKey) {
        try {
          v3903 = v3897.getPrivateKey(v3897, v3897.session.serverCertificate);
          v3903 = v3773.pki.privateKeyFromPem(v3903);
        } catch (v3904) {
          v3897.error(v3897, {
            message: "Could not get private key.",
            cause: v3904,
            send: true,
            alert: {
              level: v3825.Alert.Level.fatal,
              description: v3825.Alert.Description.internal_error
            }
          });
        }
      }
      if (v3903 === null) {
        return v3897.error(v3897, {
          message: "No private key set.",
          send: true,
          alert: {
            level: v3825.Alert.Level.fatal,
            description: v3825.Alert.Description.internal_error
          }
        });
      }
      try {
        var v3905 = v3897.session.sp;
        v3905.pre_master_secret = v3903.decrypt(v3902.enc_pre_master_secret);
        var v3906 = v3897.session.clientHelloVersion;
        if (v3906.major !== v3905.pre_master_secret.charCodeAt(0) || v3906.minor !== v3905.pre_master_secret.charCodeAt(1)) {
          throw new Error("TLS version rollback attack detected.");
        }
      } catch (v3907) {
        v3905.pre_master_secret = v3773.random.getBytes(48);
      }
      v3897.expect = v3877;
      if (v3897.session.clientCertificate !== null) {
        v3897.expect = v3908;
      }
      v3897.process();
    };
    v3825.handleCertificateRequest = function (v3909, v3910, v3911) {
      var v3912 = v3772;
      if (v3911 < 3) {
        return v3909.error(v3909, {
          message: "Invalid CertificateRequest. Message too short.",
          send: true,
          alert: {
            level: v3825.Alert.Level.fatal,
            description: v3825.Alert.Description.illegal_parameter
          }
        });
      }
      var v3913 = v3910.fragment;
      var v3914 = {
        certificate_types: v3815(v3913, 1),
        certificate_authorities: v3815(v3913, 2)
      };
      v3909.session.certificateRequest = v3914;
      v3909.expect = v3915;
      v3909.process();
    };
    v3825.handleCertificateVerify = function (v3916, v3917, v3918) {
      var v3919 = v3772;
      if (v3918 < 2) {
        return v3916.error(v3916, {
          message: "Invalid CertificateVerify. Message too short.",
          send: true,
          alert: {
            level: v3825.Alert.Level.fatal,
            description: v3825.Alert.Description.illegal_parameter
          }
        });
      }
      var v3920 = v3917.fragment;
      v3920.read -= 4;
      var v3921 = v3920.bytes();
      v3920.read += 4;
      var v3922 = {
        signature: v3815(v3920, 2).getBytes()
      };
      var v3923 = v3773.util.createBuffer();
      v3923.putBuffer(v3916.session.md5.digest());
      v3923.putBuffer(v3916.session.sha1.digest());
      v3923 = v3923.getBytes();
      try {
        var v3924 = v3916.session.clientCertificate;
        if (!v3924.publicKey.verify(v3923, v3922.signature, "NONE")) {
          throw new Error("CertificateVerify signature does not match.");
        }
        v3916.session.md5.update(v3921);
        v3916.session.sha1.update(v3921);
      } catch (v3925) {
        return v3916.error(v3916, {
          message: "Bad signature in CertificateVerify.",
          send: true,
          alert: {
            level: v3825.Alert.Level.fatal,
            description: v3825.Alert.Description.handshake_failure
          }
        });
      }
      v3916.expect = v3877;
      v3916.process();
    };
    v3825.handleServerHelloDone = function (v3926, v3927, v3928) {
      var v3929 = {
        dh2316: 252,
        dh2317: 874,
        dh2318: 406,
        dh2319: 535,
        dh2320: 1249,
        dh2321: 1471,
        dh2322: 793,
        dh2323: 793
      };
      var v3930 = v3772;
      if (v3928 > 0) {
        return v3926.error(v3926, {
          message: "Invalid ServerHelloDone message. Invalid length.",
          send: true,
          alert: {
            level: v3825.Alert.Level.fatal,
            description: v3825.Alert.Description.record_overflow
          }
        });
      }
      if (v3926.serverCertificate === null) {
        var v3931 = {
          message: "No server certificate provided. Not enough security.",
          send: true,
          alert: {
            level: v3825.Alert.Level.fatal,
            description: v3825.Alert.Description.insufficient_security
          }
        };
        var v3932 = 0;
        var v3933 = v3926.verify(v3926, v3931.alert.description, v3932, []);
        if (v3933 !== true) {
          if (v3933 || v3933 === 0) {
            if (typeof v3933 === "object" && !v3773.util.isArray(v3933)) {
              if (v3933.message) {
                v3931.message = v3933.message;
              }
              if (v3933.alert) {
                v3931.alert.description = v3933.alert;
              }
            } else if (typeof v3933 === "number") {
              v3931.alert.description = v3933;
            }
          }
          return v3926.error(v3926, v3931);
        }
      }
      if (v3926.session.certificateRequest !== null) {
        v3927 = v3825.createRecord(v3926, {
          type: v3825.ContentType.handshake,
          data: v3825.createCertificate(v3926)
        });
        v3825.queue(v3926, v3927);
      }
      v3927 = v3825.createRecord(v3926, {
        type: v3825.ContentType.handshake,
        data: v3825.createClientKeyExchange(v3926)
      });
      v3825.queue(v3926, v3927);
      v3926.expect = v3934;
      function v3935(v3936, v3937) {
        var v3938 = v3930;
        if (v3936.session.certificateRequest !== null && v3936.session.clientCertificate !== null) {
          v3825.queue(v3936, v3825.createRecord(v3936, {
            type: v3825.ContentType.handshake,
            data: v3825.createCertificateVerify(v3936, v3937)
          }));
        }
        v3825.queue(v3936, v3825.createRecord(v3936, {
          type: v3825.ContentType.change_cipher_spec,
          data: v3825.createChangeCipherSpec()
        }));
        v3936.state.pending = v3825.createConnectionState(v3936);
        v3936.state.current.write = v3936.state.pending.write;
        v3825.queue(v3936, v3825.createRecord(v3936, {
          type: v3825.ContentType.handshake,
          data: v3825.createFinished(v3936)
        }));
        v3936.expect = v3866;
        v3825.flush(v3936);
        v3936.process();
      }
      if (v3926.session.certificateRequest === null || v3926.session.clientCertificate === null) {
        return v3935(v3926, null);
      }
      v3825.getClientSignature(v3926, v3935);
    };
    v3825.handleChangeCipherSpec = function (v3939, v3940) {
      var v3941 = v3772;
      if (v3940.fragment.getByte() !== 1) {
        return v3939.error(v3939, {
          message: "Invalid ChangeCipherSpec message received.",
          send: true,
          alert: {
            level: v3825.Alert.Level.fatal,
            description: v3825.Alert.Description.illegal_parameter
          }
        });
      }
      var v3942 = v3939.entity === v3825.ConnectionEnd.client;
      if (v3939.session.resuming && v3942 || !v3939.session.resuming && !v3942) {
        v3939.state.pending = v3825.createConnectionState(v3939);
      }
      v3939.state.current.read = v3939.state.pending.read;
      if (!v3939.session.resuming && v3942 || v3939.session.resuming && !v3942) {
        v3939.state.pending = null;
      }
      v3939.expect = v3942 ? v3943 : v3944;
      v3939.process();
    };
    v3825.handleFinished = function (v3945, v3946, v3947) {
      var v3948 = v3772;
      var v3949 = v3946.fragment;
      v3949.read -= 4;
      var v3950 = v3949.bytes();
      v3949.read += 4;
      var v3951 = v3946.fragment.getBytes();
      v3949 = v3773.util.createBuffer();
      v3949.putBuffer(v3945.session.md5.digest());
      v3949.putBuffer(v3945.session.sha1.digest());
      var v3952 = v3945.entity === v3825.ConnectionEnd.client;
      var v3953 = v3952 ? "server finished" : "client finished";
      var v3954 = v3945.session.sp;
      var v3955 = 12;
      var v3956 = v3774;
      v3949 = v3956(v3954.master_secret, v3953, v3949.getBytes(), v3955);
      if (v3949.getBytes() !== v3951) {
        return v3945.error(v3945, {
          message: "Invalid verify_data in Finished message.",
          send: true,
          alert: {
            level: v3825.Alert.Level.fatal,
            description: v3825.Alert.Description.decrypt_error
          }
        });
      }
      v3945.session.md5.update(v3950);
      v3945.session.sha1.update(v3950);
      if (v3945.session.resuming && v3952 || !v3945.session.resuming && !v3952) {
        v3825.queue(v3945, v3825.createRecord(v3945, {
          type: v3825.ContentType.change_cipher_spec,
          data: v3825.createChangeCipherSpec()
        }));
        v3945.state.current.write = v3945.state.pending.write;
        v3945.state.pending = null;
        v3825.queue(v3945, v3825.createRecord(v3945, {
          type: v3825.ContentType.handshake,
          data: v3825.createFinished(v3945)
        }));
      }
      v3945.expect = v3952 ? v3957 : v3958;
      v3945.handshaking = false;
      ++v3945.handshakes;
      v3945.peerCertificate = v3952 ? v3945.session.serverCertificate : v3945.session.clientCertificate;
      v3825.flush(v3945);
      v3945.isConnected = true;
      v3945.connected(v3945);
      v3945.process();
    };
    v3825.handleAlert = function (v3959, v3960) {
      var v3961 = v3772;
      var v3962 = v3960.fragment;
      var v3963 = {
        level: v3962.getByte(),
        description: v3962.getByte()
      };
      var v3964;
      switch (v3963.description) {
        case v3825.Alert.Description.close_notify:
          v3964 = "Connection closed.";
          break;
        case v3825.Alert.Description.unexpected_message:
          v3964 = "Unexpected message.";
          break;
        case v3825.Alert.Description.bad_record_mac:
          v3964 = "Bad record MAC.";
          break;
        case v3825.Alert.Description.decryption_failed:
          v3964 = "Decryption failed.";
          break;
        case v3825.Alert.Description.record_overflow:
          v3964 = "Record overflow.";
          break;
        case v3825.Alert.Description.decompression_failure:
          v3964 = "Decompression failed.";
          break;
        case v3825.Alert.Description.handshake_failure:
          v3964 = "Handshake failure.";
          break;
        case v3825.Alert.Description.bad_certificate:
          v3964 = "Bad certificate.";
          break;
        case v3825.Alert.Description.unsupported_certificate:
          v3964 = "Unsupported certificate.";
          break;
        case v3825.Alert.Description.certificate_revoked:
          v3964 = "Certificate revoked.";
          break;
        case v3825.Alert.Description.certificate_expired:
          v3964 = "Certificate expired.";
          break;
        case v3825.Alert.Description.certificate_unknown:
          v3964 = "Certificate unknown.";
          break;
        case v3825.Alert.Description.illegal_parameter:
          v3964 = "Illegal parameter.";
          break;
        case v3825.Alert.Description.unknown_ca:
          v3964 = "Unknown certificate authority.";
          break;
        case v3825.Alert.Description.access_denied:
          v3964 = "Access denied.";
          break;
        case v3825.Alert.Description.decode_error:
          v3964 = "Decode error.";
          break;
        case v3825.Alert.Description.decrypt_error:
          v3964 = "Decrypt error.";
          break;
        case v3825.Alert.Description.export_restriction:
          v3964 = "Export restriction.";
          break;
        case v3825.Alert.Description.protocol_version:
          v3964 = "Unsupported protocol version.";
          break;
        case v3825.Alert.Description.insufficient_security:
          v3964 = "Insufficient security.";
          break;
        case v3825.Alert.Description.internal_error:
          v3964 = "Internal error.";
          break;
        case v3825.Alert.Description.user_canceled:
          v3964 = "User canceled.";
          break;
        case v3825.Alert.Description.no_renegotiation:
          v3964 = "Renegotiation not supported.";
          break;
        default:
          v3964 = "Unknown error.";
          break;
      }
      if (v3963.description === v3825.Alert.Description.close_notify) {
        return v3959.close();
      }
      v3959.error(v3959, {
        message: v3964,
        send: false,
        origin: v3959.entity === v3825.ConnectionEnd.client ? "server" : "client",
        alert: v3963
      });
      v3959.process();
    };
    v3825.handleHandshake = function (v3965, v3966) {
      var v3967 = v3772;
      var v3968 = v3966.fragment;
      var v3969 = v3968.getByte();
      var v3970 = v3968.getInt24();
      if (v3970 > v3968.length()) {
        v3965.fragmented = v3966;
        v3966.fragment = v3773.util.createBuffer();
        v3968.read -= 4;
        return v3965.process();
      }
      v3965.fragmented = null;
      v3968.read -= 4;
      var v3971 = v3968.bytes(v3970 + 4);
      v3968.read += 4;
      if (v3969 in v3972[v3965.entity][v3965.expect]) {
        if (v3965.entity === v3825.ConnectionEnd.server && !v3965.open && !v3965.fail) {
          v3965.handshaking = true;
          v3965.session = {
            version: null,
            extensions: {
              server_name: {
                serverNameList: []
              }
            },
            cipherSuite: null,
            compressionMethod: null,
            serverCertificate: null,
            clientCertificate: null,
            md5: v3773.md.md5.create(),
            sha1: v3773.md.sha1.create()
          };
        }
        if (v3969 !== v3825.HandshakeType.hello_request && v3969 !== v3825.HandshakeType.certificate_verify && v3969 !== v3825.HandshakeType.finished) {
          v3965.session.md5.update(v3971);
          v3965.session.sha1.update(v3971);
        }
        v3972[v3965.entity][v3965.expect][v3969](v3965, v3966, v3970);
      } else {
        v3825.handleUnexpected(v3965, v3966);
      }
    };
    v3825.handleApplicationData = function (v3973, v3974) {
      var v3975 = v3772;
      v3973.data.putBuffer(v3974.fragment);
      v3973.dataReady(v3973);
      v3973.process();
    };
    v3825.handleHeartbeat = function (v3976, v3977) {
      var v3978 = v3772;
      var v3979 = v3977.fragment;
      var v3980 = v3979.getByte();
      var v3981 = v3979.getInt16();
      var v3982 = v3979.getBytes(v3981);
      if (v3980 === v3825.HeartbeatMessageType.heartbeat_request) {
        if (v3976.handshaking || v3981 > v3982.length) {
          return v3976.process();
        }
        v3825.queue(v3976, v3825.createRecord(v3976, {
          type: v3825.ContentType.heartbeat,
          data: v3825.createHeartbeat(v3825.HeartbeatMessageType.heartbeat_response, v3982)
        }));
        v3825.flush(v3976);
      } else if (v3980 === v3825.HeartbeatMessageType.heartbeat_response) {
        if (v3982 !== v3976.expectedHeartbeatPayload) {
          return v3976.process();
        }
        if (v3976.heartbeatReceived) {
          v3976.heartbeatReceived(v3976, v3773.util.createBuffer(v3982));
        }
      }
      v3976.process();
    };
    var v3983 = 0;
    var v3867 = 1;
    var v3891 = 2;
    var v3896 = 3;
    var v3915 = 4;
    var v3866 = 5;
    var v3943 = 6;
    var v3957 = 7;
    var v3934 = 8;
    var v3984 = 0;
    var v3878 = 1;
    var v3879 = 2;
    var v3908 = 3;
    var v3877 = 4;
    var v3944 = 5;
    var v3958 = 6;
    var v3985 = v3825.handleUnexpected;
    var v3986 = v3825.handleChangeCipherSpec;
    var v3987 = v3825.handleAlert;
    var v3988 = v3825.handleHandshake;
    var v3989 = v3825.handleApplicationData;
    var v3990 = v3825.handleHeartbeat;
    var v3991 = [];
    v3991[v3825.ConnectionEnd.client] = [[v3985, v3987, v3988, v3985, v3990], [v3985, v3987, v3988, v3985, v3990], [v3985, v3987, v3988, v3985, v3990], [v3985, v3987, v3988, v3985, v3990], [v3985, v3987, v3988, v3985, v3990], [v3986, v3987, v3985, v3985, v3990], [v3985, v3987, v3988, v3985, v3990], [v3985, v3987, v3988, v3989, v3990], [v3985, v3987, v3988, v3985, v3990]];
    v3991[v3825.ConnectionEnd.server] = [[v3985, v3987, v3988, v3985, v3990], [v3985, v3987, v3988, v3985, v3990], [v3985, v3987, v3988, v3985, v3990], [v3985, v3987, v3988, v3985, v3990], [v3986, v3987, v3985, v3985, v3990], [v3985, v3987, v3988, v3985, v3990], [v3985, v3987, v3988, v3989, v3990], [v3985, v3987, v3988, v3985, v3990]];
    var v3992 = v3825.handleHelloRequest;
    var v3993 = v3825.handleServerHello;
    var v3994 = v3825.handleCertificate;
    var v3995 = v3825.handleServerKeyExchange;
    var v3996 = v3825.handleCertificateRequest;
    var v3997 = v3825.handleServerHelloDone;
    var v3998 = v3825.handleFinished;
    var v3972 = [];
    v3972[v3825.ConnectionEnd.client] = [[v3985, v3985, v3993, v3985, v3985, v3985, v3985, v3985, v3985, v3985, v3985, v3985, v3985, v3985, v3985, v3985, v3985, v3985, v3985, v3985, v3985], [v3992, v3985, v3985, v3985, v3985, v3985, v3985, v3985, v3985, v3985, v3985, v3994, v3995, v3996, v3997, v3985, v3985, v3985, v3985, v3985, v3985], [v3992, v3985, v3985, v3985, v3985, v3985, v3985, v3985, v3985, v3985, v3985, v3985, v3995, v3996, v3997, v3985, v3985, v3985, v3985, v3985, v3985], [v3992, v3985, v3985, v3985, v3985, v3985, v3985, v3985, v3985, v3985, v3985, v3985, v3985, v3996, v3997, v3985, v3985, v3985, v3985, v3985, v3985], [v3992, v3985, v3985, v3985, v3985, v3985, v3985, v3985, v3985, v3985, v3985, v3985, v3985, v3985, v3997, v3985, v3985, v3985, v3985, v3985, v3985], [v3992, v3985, v3985, v3985, v3985, v3985, v3985, v3985, v3985, v3985, v3985, v3985, v3985, v3985, v3985, v3985, v3985, v3985, v3985, v3985, v3985], [v3992, v3985, v3985, v3985, v3985, v3985, v3985, v3985, v3985, v3985, v3985, v3985, v3985, v3985, v3985, v3985, v3985, v3985, v3985, v3985, v3998], [v3992, v3985, v3985, v3985, v3985, v3985, v3985, v3985, v3985, v3985, v3985, v3985, v3985, v3985, v3985, v3985, v3985, v3985, v3985, v3985, v3985], [v3992, v3985, v3985, v3985, v3985, v3985, v3985, v3985, v3985, v3985, v3985, v3985, v3985, v3985, v3985, v3985, v3985, v3985, v3985, v3985, v3985]];
    var v3999 = v3825.handleClientHello;
    var v4000 = v3825.handleClientKeyExchange;
    var v4001 = v3825.handleCertificateVerify;
    v3972[v3825.ConnectionEnd.server] = [[v3985, v3999, v3985, v3985, v3985, v3985, v3985, v3985, v3985, v3985, v3985, v3985, v3985, v3985, v3985, v3985, v3985, v3985, v3985, v3985, v3985], [v3985, v3985, v3985, v3985, v3985, v3985, v3985, v3985, v3985, v3985, v3985, v3994, v3985, v3985, v3985, v3985, v3985, v3985, v3985, v3985, v3985], [v3985, v3985, v3985, v3985, v3985, v3985, v3985, v3985, v3985, v3985, v3985, v3985, v3985, v3985, v3985, v3985, v4000, v3985, v3985, v3985, v3985], [v3985, v3985, v3985, v3985, v3985, v3985, v3985, v3985, v3985, v3985, v3985, v3985, v3985, v3985, v3985, v4001, v3985, v3985, v3985, v3985, v3985], [v3985, v3985, v3985, v3985, v3985, v3985, v3985, v3985, v3985, v3985, v3985, v3985, v3985, v3985, v3985, v3985, v3985, v3985, v3985, v3985, v3985], [v3985, v3985, v3985, v3985, v3985, v3985, v3985, v3985, v3985, v3985, v3985, v3985, v3985, v3985, v3985, v3985, v3985, v3985, v3985, v3985, v3998], [v3985, v3985, v3985, v3985, v3985, v3985, v3985, v3985, v3985, v3985, v3985, v3985, v3985, v3985, v3985, v3985, v3985, v3985, v3985, v3985, v3985], [v3985, v3985, v3985, v3985, v3985, v3985, v3985, v3985, v3985, v3985, v3985, v3985, v3985, v3985, v3985, v3985, v3985, v3985, v3985, v3985, v3985]];
    v3825.generateKeys = function (v4002, v4003) {
      var v4004 = v3772;
      var v4005 = v3774;
      var v4006 = v4003.client_random + v4003.server_random;
      if (!v4002.session.resuming) {
        v4003.master_secret = v4005(v4003.pre_master_secret, "master secret", v4006, 48).bytes();
        v4003.pre_master_secret = null;
      }
      v4006 = v4003.server_random + v4003.client_random;
      var v4007 = v4003.mac_key_length * 2 + v4003.enc_key_length * 2;
      var v4008 = v4002.version.major === v3825.Versions.TLS_1_0.major && v4002.version.minor === v3825.Versions.TLS_1_0.minor;
      if (v4008) {
        v4007 += v4003.fixed_iv_length * 2;
      }
      var v4009 = v4005(v4003.master_secret, "key expansion", v4006, v4007);
      var v4010 = {
        client_write_MAC_key: v4009.getBytes(v4003.mac_key_length),
        server_write_MAC_key: v4009.getBytes(v4003.mac_key_length),
        client_write_key: v4009.getBytes(v4003.enc_key_length),
        server_write_key: v4009.getBytes(v4003.enc_key_length)
      };
      if (v4008) {
        v4010.client_write_IV = v4009.getBytes(v4003.fixed_iv_length);
        v4010.server_write_IV = v4009.getBytes(v4003.fixed_iv_length);
      }
      return v4010;
    };
    v3825.createConnectionState = function (v4011) {
      var v4012 = {
        dh2324: 892,
        dh2325: 1121,
        dh2326: 1411
      };
      var v4013 = {
        dh2327: 524
      };
      var v4014 = v3772;
      var v4015 = v4011.entity === v3825.ConnectionEnd.client;
      function v4016() {
        var v4017 = {
          sequenceNumber: [0, 0],
          macKey: null,
          macLength: 0,
          macFunction: null,
          cipherState: null,
          cipherFunction: function (v4018) {
            return true;
          },
          compressionState: null,
          compressFunction: function (v4019) {
            return true;
          },
          updateSequenceNumber: function () {
            var v4020 = v1;
            if (v4017.sequenceNumber[1] === 4294967295) {
              v4017.sequenceNumber[1] = 0;
              ++v4017.sequenceNumber[0];
            } else {
              ++v4017.sequenceNumber[1];
            }
          }
        };
        return v4017;
      }
      var v4021 = {
        read: v4016(),
        write: v4016()
      };
      v4021.read.update = function (v4022, v4023) {
        var v4024 = v4014;
        if (!v4021.read.cipherFunction(v4023, v4021.read)) {
          v4022.error(v4022, {
            message: "Could not decrypt record or bad MAC.",
            send: true,
            alert: {
              level: v3825.Alert.Level.fatal,
              description: v3825.Alert.Description.bad_record_mac
            }
          });
        } else if (!v4021.read.compressFunction(v4022, v4023, v4021.read)) {
          v4022.error(v4022, {
            message: "Could not decompress record.",
            send: true,
            alert: {
              level: v3825.Alert.Level.fatal,
              description: v3825.Alert.Description.decompression_failure
            }
          });
        }
        return !v4022.fail;
      };
      v4021.write.update = function (v4025, v4026) {
        var v4027 = v4014;
        if (!v4021.write.compressFunction(v4025, v4026, v4021.write)) {
          v4025.error(v4025, {
            message: "Could not compress record.",
            send: false,
            alert: {
              level: v3825.Alert.Level.fatal,
              description: v3825.Alert.Description.internal_error
            }
          });
        } else if (!v4021.write.cipherFunction(v4026, v4021.write)) {
          v4025.error(v4025, {
            message: "Could not encrypt record.",
            send: false,
            alert: {
              level: v3825.Alert.Level.fatal,
              description: v3825.Alert.Description.internal_error
            }
          });
        }
        return !v4025.fail;
      };
      if (v4011.session) {
        var v4028 = v4011.session.sp;
        v4011.session.cipherSuite.initSecurityParameters(v4028);
        v4028.keys = v3825.generateKeys(v4011, v4028);
        v4021.read.macKey = v4015 ? v4028.keys.server_write_MAC_key : v4028.keys.client_write_MAC_key;
        v4021.write.macKey = v4015 ? v4028.keys.client_write_MAC_key : v4028.keys.server_write_MAC_key;
        v4011.session.cipherSuite.initConnectionState(v4021, v4011, v4028);
        switch (v4028.compression_algorithm) {
          case v3825.CompressionMethod.none:
            break;
          case v3825.CompressionMethod.deflate:
            v4021.read.compressFunction = v3807;
            v4021.write.compressFunction = v3799;
            break;
          default:
            throw new Error("Unsupported compression algorithm.");
        }
      }
      return v4021;
    };
    v3825.createRandom = function () {
      var v4029 = v3772;
      var v4030 = new Date();
      var v4031 = +v4030 + v4030.getTimezoneOffset() * 60000;
      var v4032 = v3773.util.createBuffer();
      v4032.putInt32(v4031);
      v4032.putBytes(v3773.random.getBytes(28));
      return v4032;
    };
    v3825.createRecord = function (v4033, v4034) {
      var v4035 = v3772;
      if (!v4034.data) {
        return null;
      }
      var v4036 = {
        type: v4034.type,
        version: {
          major: v4033.version.major,
          minor: v4033.version.minor
        },
        length: v4034.data.length(),
        fragment: v4034.data
      };
      return v4036;
    };
    v3825.createAlert = function (v4037, v4038) {
      var v4039 = v3772;
      var v4040 = v3773.util.createBuffer();
      v4040.putByte(v4038.level);
      v4040.putByte(v4038.description);
      return v3825.createRecord(v4037, {
        type: v3825.ContentType.alert,
        data: v4040
      });
    };
    v3825.createClientHello = function (v4041) {
      var v4042 = v3772;
      v4041.session.clientHelloVersion = {
        major: v4041.version.major,
        minor: v4041.version.minor
      };
      var v4043 = v3773.util.createBuffer();
      for (var v4044 = 0; v4044 < v4041.cipherSuites.length; ++v4044) {
        var v4045 = v4041.cipherSuites[v4044];
        v4043.putByte(v4045.id[0]);
        v4043.putByte(v4045.id[1]);
      }
      var v4046 = v4043.length();
      var v4047 = v3773.util.createBuffer();
      v4047.putByte(v3825.CompressionMethod.none);
      var v4048 = v4047.length();
      var v4049 = v3773.util.createBuffer();
      if (v4041.virtualHost) {
        var v4050 = v3773.util.createBuffer();
        v4050.putByte(0);
        v4050.putByte(0);
        var v4051 = v3773.util.createBuffer();
        v4051.putByte(0);
        v3820(v4051, 2, v3773.util.createBuffer(v4041.virtualHost));
        var v4052 = v3773.util.createBuffer();
        v3820(v4052, 2, v4051);
        v3820(v4050, 2, v4052);
        v4049.putBuffer(v4050);
      }
      var v4053 = v4049.length();
      if (v4053 > 0) {
        v4053 += 2;
      }
      var v4054 = v4041.session.id;
      var v4055 = v4054.length + 1 + 2 + 4 + 28 + 2 + v4046 + 1 + v4048 + v4053;
      var v4056 = v3773.util.createBuffer();
      v4056.putByte(v3825.HandshakeType.client_hello);
      v4056.putInt24(v4055);
      v4056.putByte(v4041.version.major);
      v4056.putByte(v4041.version.minor);
      v4056.putBytes(v4041.session.sp.client_random);
      v3820(v4056, 1, v3773.util.createBuffer(v4054));
      v3820(v4056, 2, v4043);
      v3820(v4056, 1, v4047);
      if (v4053 > 0) {
        v3820(v4056, 2, v4049);
      }
      return v4056;
    };
    v3825.createServerHello = function (v4057) {
      var v4058 = v3772;
      var v4059 = v4057.session.id;
      var v4060 = v4059.length + 1 + 2 + 4 + 28 + 2 + 1;
      var v4061 = v3773.util.createBuffer();
      v4061.putByte(v3825.HandshakeType.server_hello);
      v4061.putInt24(v4060);
      v4061.putByte(v4057.version.major);
      v4061.putByte(v4057.version.minor);
      v4061.putBytes(v4057.session.sp.server_random);
      v3820(v4061, 1, v3773.util.createBuffer(v4059));
      v4061.putByte(v4057.session.cipherSuite.id[0]);
      v4061.putByte(v4057.session.cipherSuite.id[1]);
      v4061.putByte(v4057.session.compressionMethod);
      return v4061;
    };
    v3825.createCertificate = function (v4062) {
      var v4063 = v3772;
      var v4064 = v4062.entity === v3825.ConnectionEnd.client;
      var v4065 = null;
      if (v4062.getCertificate) {
        var v4066;
        if (v4064) {
          v4066 = v4062.session.certificateRequest;
        } else {
          v4066 = v4062.session.extensions.server_name.serverNameList;
        }
        v4065 = v4062.getCertificate(v4062, v4066);
      }
      var v4067 = v3773.util.createBuffer();
      if (v4065 !== null) {
        try {
          if (!v3773.util.isArray(v4065)) {
            v4065 = [v4065];
          }
          var v4068 = null;
          for (var v4069 = 0; v4069 < v4065.length; ++v4069) {
            var v4070 = v3773.pem.decode(v4065[v4069])[0];
            if (v4070.type !== "CERTIFICATE" && v4070.type !== "X509 CERTIFICATE" && v4070.type !== "TRUSTED CERTIFICATE") {
              var v4071 = new Error("Could not convert certificate from PEM; PEM header type is not \"CERTIFICATE\", \"X509 CERTIFICATE\", or \"TRUSTED CERTIFICATE\".");
              v4071.headerType = v4070.type;
              throw v4071;
            }
            if (v4070.procType && v4070.procType.type === "ENCRYPTED") {
              throw new Error("Could not convert certificate from PEM; PEM is encrypted.");
            }
            var v4072 = v3773.util.createBuffer(v4070.body);
            if (v4068 === null) {
              v4068 = v3773.asn1.fromDer(v4072.bytes(), false);
            }
            var v4073 = v3773.util.createBuffer();
            v3820(v4073, 3, v4072);
            v4067.putBuffer(v4073);
          }
          v4065 = v3773.pki.certificateFromAsn1(v4068);
          if (v4064) {
            v4062.session.clientCertificate = v4065;
          } else {
            v4062.session.serverCertificate = v4065;
          }
        } catch (v4074) {
          return v4062.error(v4062, {
            message: "Could not send certificate list.",
            cause: v4074,
            send: true,
            alert: {
              level: v3825.Alert.Level.fatal,
              description: v3825.Alert.Description.bad_certificate
            }
          });
        }
      }
      var v4075 = 3 + v4067.length();
      var v4076 = v3773.util.createBuffer();
      v4076.putByte(v3825.HandshakeType.certificate);
      v4076.putInt24(v4075);
      v3820(v4076, 3, v4067);
      return v4076;
    };
    v3825.createClientKeyExchange = function (v4077) {
      var v4078 = v3772;
      var v4079 = v3773.util.createBuffer();
      v4079.putByte(v4077.session.clientHelloVersion.major);
      v4079.putByte(v4077.session.clientHelloVersion.minor);
      v4079.putBytes(v3773.random.getBytes(46));
      var v4080 = v4077.session.sp;
      v4080.pre_master_secret = v4079.getBytes();
      var v4081 = v4077.session.serverCertificate.publicKey;
      v4079 = v4081.encrypt(v4080.pre_master_secret);
      var v4082 = v4079.length + 2;
      var v4083 = v3773.util.createBuffer();
      v4083.putByte(v3825.HandshakeType.client_key_exchange);
      v4083.putInt24(v4082);
      v4083.putInt16(v4079.length);
      v4083.putBytes(v4079);
      return v4083;
    };
    v3825.createServerKeyExchange = function (v4084) {
      var v4085 = v3772;
      var v4086 = 0;
      var v4087 = v3773.util.createBuffer();
      if (v4086 > 0) {
        v4087.putByte(v3825.HandshakeType.server_key_exchange);
        v4087.putInt24(v4086);
      }
      return v4087;
    };
    v3825.getClientSignature = function (v4088, v4089) {
      var v4090 = {
        dh2328: 549,
        dh2329: 1219,
        dh2330: 364,
        dh2331: 1318
      };
      var v4091 = v3772;
      var v4092 = v3773.util.createBuffer();
      v4092.putBuffer(v4088.session.md5.digest());
      v4092.putBuffer(v4088.session.sha1.digest());
      v4092 = v4092.getBytes();
      v4088.getSignature = v4088.getSignature || function (v4093, v4094, v4095) {
        var v4096 = v4091;
        var v4097 = null;
        if (v4093.getPrivateKey) {
          try {
            v4097 = v4093.getPrivateKey(v4093, v4093.session.clientCertificate);
            v4097 = v3773.pki.privateKeyFromPem(v4097);
          } catch (v4098) {
            v4093.error(v4093, {
              message: "Could not get private key.",
              cause: v4098,
              send: true,
              alert: {
                level: v3825.Alert.Level.fatal,
                description: v3825.Alert.Description.internal_error
              }
            });
          }
        }
        if (v4097 === null) {
          v4093.error(v4093, {
            message: "No private key set.",
            send: true,
            alert: {
              level: v3825.Alert.Level.fatal,
              description: v3825.Alert.Description.internal_error
            }
          });
        } else {
          v4094 = v4097.sign(v4094, null);
        }
        v4095(v4093, v4094);
      };
      v4088.getSignature(v4088, v4092, v4089);
    };
    v3825.createCertificateVerify = function (v4099, v4100) {
      var v4101 = v3772;
      var v4102 = v4100.length + 2;
      var v4103 = v3773.util.createBuffer();
      v4103.putByte(v3825.HandshakeType.certificate_verify);
      v4103.putInt24(v4102);
      v4103.putInt16(v4100.length);
      v4103.putBytes(v4100);
      return v4103;
    };
    v3825.createCertificateRequest = function (v4104) {
      var v4105 = v3772;
      var v4106 = v3773.util.createBuffer();
      v4106.putByte(1);
      var v4107 = v3773.util.createBuffer();
      for (var v4108 in v4104.caStore.certs) {
        var v4109 = v4104.caStore.certs[v4108];
        var v4110 = v3773.pki.distinguishedNameToAsn1(v4109.subject);
        var v4111 = v3773.asn1.toDer(v4110);
        v4107.putInt16(v4111.length());
        v4107.putBuffer(v4111);
      }
      var v4112 = 1 + v4106.length() + 2 + v4107.length();
      var v4113 = v3773.util.createBuffer();
      v4113.putByte(v3825.HandshakeType.certificate_request);
      v4113.putInt24(v4112);
      v3820(v4113, 1, v4106);
      v3820(v4113, 2, v4107);
      return v4113;
    };
    v3825.createServerHelloDone = function (v4114) {
      var v4115 = v3772;
      var v4116 = v3773.util.createBuffer();
      v4116.putByte(v3825.HandshakeType.server_hello_done);
      v4116.putInt24(0);
      return v4116;
    };
    v3825.createChangeCipherSpec = function () {
      var v4117 = v3773.util.createBuffer();
      v4117.putByte(1);
      return v4117;
    };
    v3825.createFinished = function (v4118) {
      var v4119 = v3772;
      var v4120 = v3773.util.createBuffer();
      v4120.putBuffer(v4118.session.md5.digest());
      v4120.putBuffer(v4118.session.sha1.digest());
      var v4121 = v4118.entity === v3825.ConnectionEnd.client;
      var v4122 = v4118.session.sp;
      var v4123 = 12;
      var v4124 = v3774;
      var v4125 = v4121 ? "client finished" : "server finished";
      v4120 = v4124(v4122.master_secret, v4125, v4120.getBytes(), v4123);
      var v4126 = v3773.util.createBuffer();
      v4126.putByte(v3825.HandshakeType.finished);
      v4126.putInt24(v4120.length());
      v4126.putBuffer(v4120);
      return v4126;
    };
    v3825.createHeartbeat = function (v4127, v4128, v4129) {
      var v4130 = v3772;
      if (typeof v4129 === "undefined") {
        v4129 = v4128.length;
      }
      var v4131 = v3773.util.createBuffer();
      v4131.putByte(v4127);
      v4131.putInt16(v4129);
      v4131.putBytes(v4128);
      var v4132 = v4131.length();
      var v4133 = Math.max(16, v4132 - v4129 - 3);
      v4131.putBytes(v3773.random.getBytes(v4133));
      return v4131;
    };
    v3825.queue = function (v4134, v4135) {
      var v4136 = v3772;
      if (!v4135) {
        return;
      }
      if (v4135.fragment.length() === 0) {
        if (v4135.type === v3825.ContentType.handshake || v4135.type === v3825.ContentType.alert || v4135.type === v3825.ContentType.change_cipher_spec) {
          return;
        }
      }
      if (v4135.type === v3825.ContentType.handshake) {
        var v4137 = v4135.fragment.bytes();
        v4134.session.md5.update(v4137);
        v4134.session.sha1.update(v4137);
        v4137 = null;
      }
      var v4138;
      if (v4135.fragment.length() <= v3825.MaxFragment) {
        v4138 = [v4135];
      } else {
        v4138 = [];
        var v4139 = v4135.fragment.bytes();
        while (v4139.length > v3825.MaxFragment) {
          v4138.push(v3825.createRecord(v4134, {
            type: v4135.type,
            data: v3773.util.createBuffer(v4139.slice(0, v3825.MaxFragment))
          }));
          v4139 = v4139.slice(v3825.MaxFragment);
        }
        if (v4139.length > 0) {
          v4138.push(v3825.createRecord(v4134, {
            type: v4135.type,
            data: v3773.util.createBuffer(v4139)
          }));
        }
      }
      for (var v4140 = 0; v4140 < v4138.length && !v4134.fail; ++v4140) {
        var v4141 = v4138[v4140];
        var v4142 = v4134.state.current.write;
        if (v4142.update(v4134, v4141)) {
          v4134.records.push(v4141);
        }
      }
    };
    v3825.flush = function (v4143) {
      var v4144 = v3772;
      for (var v4145 = 0; v4145 < v4143.records.length; ++v4145) {
        var v4146 = v4143.records[v4145];
        v4143.tlsData.putByte(v4146.type);
        v4143.tlsData.putByte(v4146.version.major);
        v4143.tlsData.putByte(v4146.version.minor);
        v4143.tlsData.putInt16(v4146.fragment.length());
        v4143.tlsData.putBuffer(v4143.records[v4145].fragment);
      }
      v4143.records = [];
      return v4143.tlsDataReady(v4143);
    };
    function v4147(v4148) {
      var v4149 = v3772;
      switch (v4148) {
        case true:
          return true;
        case v3773.pki.certificateError.bad_certificate:
          return v3825.Alert.Description.bad_certificate;
        case v3773.pki.certificateError.unsupported_certificate:
          return v3825.Alert.Description.unsupported_certificate;
        case v3773.pki.certificateError.certificate_revoked:
          return v3825.Alert.Description.certificate_revoked;
        case v3773.pki.certificateError.certificate_expired:
          return v3825.Alert.Description.certificate_expired;
        case v3773.pki.certificateError.certificate_unknown:
          return v3825.Alert.Description.certificate_unknown;
        case v3773.pki.certificateError.unknown_ca:
          return v3825.Alert.Description.unknown_ca;
        default:
          return v3825.Alert.Description.bad_certificate;
      }
    }
    function v4150(v4151) {
      var v4152 = v3772;
      switch (v4151) {
        case true:
          return true;
        case v3825.Alert.Description.bad_certificate:
          return v3773.pki.certificateError.bad_certificate;
        case v3825.Alert.Description.unsupported_certificate:
          return v3773.pki.certificateError.unsupported_certificate;
        case v3825.Alert.Description.certificate_revoked:
          return v3773.pki.certificateError.certificate_revoked;
        case v3825.Alert.Description.certificate_expired:
          return v3773.pki.certificateError.certificate_expired;
        case v3825.Alert.Description.certificate_unknown:
          return v3773.pki.certificateError.certificate_unknown;
        case v3825.Alert.Description.unknown_ca:
          return v3773.pki.certificateError.unknown_ca;
        default:
          return v3773.pki.certificateError.bad_certificate;
      }
    }
    v3825.verifyCertificateChain = function (v4153, v4154) {
      var v4155 = v3772;
      try {
        var v4156 = {};
        for (var v4157 in v4153.verifyOptions) {
          v4156[v4157] = v4153.verifyOptions[v4157];
        }
        v4156.verify = function (v4158, v4159, v4160) {
          var v4161 = v1;
          var v4162 = v4147(v4158);
          var v4163 = v4153.verify(v4153, v4158, v4159, v4160);
          if (v4163 !== true) {
            if (typeof v4163 === "object" && !v3773.util.isArray(v4163)) {
              var v4164 = new Error("The application rejected the certificate.");
              v4164.send = true;
              v4164.alert = {
                level: v3825.Alert.Level.fatal,
                description: v3825.Alert.Description.bad_certificate
              };
              if (v4163.message) {
                v4164.message = v4163.message;
              }
              if (v4163.alert) {
                v4164.alert.description = v4163.alert;
              }
              throw v4164;
            }
            if (v4163 !== v4158) {
              v4163 = v4150(v4163);
            }
          }
          return v4163;
        };
        v3773.pki.verifyCertificateChain(v4153.caStore, v4154, v4156);
      } catch (v4165) {
        var v4166 = v4165;
        if (typeof v4166 !== "object" || v3773.util.isArray(v4166)) {
          v4166 = {
            send: true,
            alert: {
              level: v3825.Alert.Level.fatal,
              description: v4147(v4165)
            }
          };
        }
        if (!("send" in v4166)) {
          v4166.send = true;
        }
        if (!("alert" in v4166)) {
          v4166.alert = {
            level: v3825.Alert.Level.fatal,
            description: v4147(v4166.error)
          };
        }
        v4153.error(v4153, v4166);
      }
      return !v4153.fail;
    };
    v3825.createSessionCache = function (v4167, v4168) {
      var v4169 = {
        dh2332: 1557,
        dh2333: 589,
        dh2334: 619,
        dh2335: 589
      };
      var v4170 = v3772;
      var v4171 = null;
      if (v4167 && v4167.getSession && v4167.setSession && v4167.order) {
        v4171 = v4167;
      } else {
        v4171 = {};
        v4171.cache = v4167 || {};
        v4171.capacity = Math.max(v4168 || 100, 1);
        v4171.order = [];
        for (var v4172 in v4167) {
          if (v4171.order.length <= v4168) {
            v4171.order.push(v4172);
          } else {
            delete v4167[v4172];
          }
        }
        v4171.getSession = function (v4173) {
          var v4174 = v4170;
          var v4175 = null;
          var v4176 = null;
          if (v4173) {
            v4176 = v3773.util.bytesToHex(v4173);
          } else if (v4171.order.length > 0) {
            v4176 = v4171.order[0];
          }
          if (v4176 !== null && v4176 in v4171.cache) {
            v4175 = v4171.cache[v4176];
            delete v4171.cache[v4176];
            for (var v4177 in v4171.order) {
              if (v4171.order[v4177] === v4176) {
                v4171.order.splice(v4177, 1);
                break;
              }
            }
          }
          return v4175;
        };
        v4171.setSession = function (v4178, v4179) {
          var v4180 = v4170;
          if (v4171.order.length === v4171.capacity) {
            var v4181 = v4171.order.shift();
            delete v4171.cache[v4181];
          }
          var v4181 = v3773.util.bytesToHex(v4178);
          v4171.order.push(v4181);
          v4171.cache[v4181] = v4179;
        };
      }
      return v4171;
    };
    v3825.createConnection = function (v4182) {
      var v4183 = {
        dh2336: 252,
        dh2337: 406,
        dh2338: 619
      };
      var v4184 = {
        dh2339: 1011,
        dh2340: 1011
      };
      var v4185 = {
        dh2341: 1114,
        dh2342: 1113,
        dh2343: 1219,
        dh2344: 715,
        dh2345: 667,
        dh2346: 271,
        dh2347: 317,
        dh2348: 1246,
        dh2349: 729
      };
      var v4186 = {
        dh2350: 857,
        dh2351: 1011,
        dh2352: 250,
        dh2353: 1062,
        dh2354: 372,
        dh2355: 597,
        dh2356: 597,
        dh2357: 654,
        dh2358: 1011,
        dh2359: 1431,
        dh2360: 855,
        dh2361: 237,
        dh2362: 855,
        dh2363: 1346,
        dh2364: 1011
      };
      var v4187 = {
        dh2365: 597,
        dh2366: 535
      };
      var v4188 = {
        dh2367: 271,
        dh2368: 1011,
        dh2369: 317,
        dh2370: 1241,
        dh2371: 1431,
        dh2372: 637,
        dh2373: 1411,
        dh2374: 1472,
        dh2375: 1151,
        dh2376: 1471
      };
      var v4189 = v3772;
      var v4190 = null;
      if (v4182.caStore) {
        if (v3773.util.isArray(v4182.caStore)) {
          v4190 = v3773.pki.createCaStore(v4182.caStore);
        } else {
          v4190 = v4182.caStore;
        }
      } else {
        v4190 = v3773.pki.createCaStore();
      }
      var v4191 = v4182.cipherSuites || null;
      if (v4191 === null) {
        v4191 = [];
        for (var v4192 in v3825.CipherSuites) {
          v4191.push(v3825.CipherSuites[v4192]);
        }
      }
      var v4193 = v4182.server || false ? v3825.ConnectionEnd.server : v3825.ConnectionEnd.client;
      var v4194 = v4182.sessionCache ? v3825.createSessionCache(v4182.sessionCache) : null;
      var v4195 = {
        version: {
          major: v3825.Version.major,
          minor: v3825.Version.minor
        },
        entity: v4193,
        sessionId: v4182.sessionId,
        caStore: v4190,
        sessionCache: v4194,
        cipherSuites: v4191,
        connected: v4182.connected,
        virtualHost: v4182.virtualHost || null,
        verifyClient: v4182.verifyClient || false,
        verify: v4182.verify || function (v4196, v4197, v4198, v4199) {
          return v4197;
        },
        verifyOptions: v4182.verifyOptions || {},
        getCertificate: v4182.getCertificate || null,
        getPrivateKey: v4182.getPrivateKey || null,
        getSignature: v4182.getSignature || null,
        input: v3773.util.createBuffer(),
        tlsData: v3773.util.createBuffer(),
        data: v3773.util.createBuffer(),
        tlsDataReady: v4182.tlsDataReady,
        dataReady: v4182.dataReady,
        heartbeatReceived: v4182.heartbeatReceived,
        closed: v4182.closed,
        error: function (v4200, v4201) {
          var v4202 = v4189;
          v4201.origin = v4201.origin || (v4200.entity === v3825.ConnectionEnd.client ? "client" : "server");
          if (v4201.send) {
            v3825.queue(v4200, v3825.createAlert(v4200, v4201.alert));
            v3825.flush(v4200);
          }
          var v4203 = v4201.fatal !== false;
          if (v4203) {
            v4200.fail = true;
          }
          v4182.error(v4200, v4201);
          if (v4203) {
            v4200.close(false);
          }
        },
        deflate: v4182.deflate || null,
        inflate: v4182.inflate || null
      };
      v4195.reset = function (v4204) {
        var v4205 = v4189;
        v4195.version = {
          major: v3825.Version.major,
          minor: v3825.Version.minor
        };
        v4195.record = null;
        v4195.session = null;
        v4195.peerCertificate = null;
        v4195.state = {
          pending: null,
          current: null
        };
        v4195.expect = v4195.entity === v3825.ConnectionEnd.client ? v3983 : v3984;
        v4195.fragmented = null;
        v4195.records = [];
        v4195.open = false;
        v4195.handshakes = 0;
        v4195.handshaking = false;
        v4195.isConnected = false;
        v4195.fail = !v4204 && typeof v4204 !== "undefined";
        v4195.input.clear();
        v4195.tlsData.clear();
        v4195.data.clear();
        v4195.state.current = v3825.createConnectionState(v4195);
      };
      v4195.reset();
      function v4206(v4207, v4208) {
        var v4209 = v4189;
        var v4210 = v4208.type - v3825.ContentType.change_cipher_spec;
        var v4211 = v3991[v4207.entity][v4207.expect];
        if (v4210 in v4211) {
          v4211[v4210](v4207, v4208);
        } else {
          v3825.handleUnexpected(v4207, v4208);
        }
      }
      function v4212(v4213) {
        var v4214 = v4189;
        var v4215 = 0;
        var v4216 = v4213.input;
        var v4217 = v4216.length();
        if (v4217 < 5) {
          v4215 = 5 - v4217;
        } else {
          v4213.record = {
            type: v4216.getByte(),
            version: {
              major: v4216.getByte(),
              minor: v4216.getByte()
            },
            length: v4216.getInt16(),
            fragment: v3773.util.createBuffer(),
            ready: false
          };
          var v4218 = v4213.record.version.major === v4213.version.major;
          if (v4218 && v4213.session && v4213.session.version) {
            v4218 = v4213.record.version.minor === v4213.version.minor;
          }
          if (!v4218) {
            v4213.error(v4213, {
              message: "Incompatible TLS version.",
              send: true,
              alert: {
                level: v3825.Alert.Level.fatal,
                description: v3825.Alert.Description.protocol_version
              }
            });
          }
        }
        return v4215;
      }
      function v4219(v4220) {
        var v4221 = v4189;
        var v4222 = 0;
        var v4223 = v4220.input;
        var v4224 = v4223.length();
        if (v4224 < v4220.record.length) {
          v4222 = v4220.record.length - v4224;
        } else {
          v4220.record.fragment.putBytes(v4223.getBytes(v4220.record.length));
          v4223.compact();
          var v4225 = v4220.state.current.read;
          if (v4225.update(v4220, v4220.record)) {
            if (v4220.fragmented !== null) {
              if (v4220.fragmented.type === v4220.record.type) {
                v4220.fragmented.fragment.putBuffer(v4220.record.fragment);
                v4220.record = v4220.fragmented;
              } else {
                v4220.error(v4220, {
                  message: "Invalid fragmented record.",
                  send: true,
                  alert: {
                    level: v3825.Alert.Level.fatal,
                    description: v3825.Alert.Description.unexpected_message
                  }
                });
              }
            }
            v4220.record.ready = true;
          }
        }
        return v4222;
      }
      v4195.handshake = function (v4226) {
        var v4227 = v4189;
        if (v4195.entity !== v3825.ConnectionEnd.client) {
          v4195.error(v4195, {
            message: "Cannot initiate handshake as a server.",
            fatal: false
          });
        } else if (v4195.handshaking) {
          v4195.error(v4195, {
            message: "Handshake already in progress.",
            fatal: false
          });
        } else {
          if (v4195.fail && !v4195.open && v4195.handshakes === 0) {
            v4195.fail = false;
          }
          v4195.handshaking = true;
          v4226 = v4226 || "";
          var v4228 = null;
          if (v4226.length > 0) {
            if (v4195.sessionCache) {
              v4228 = v4195.sessionCache.getSession(v4226);
            }
            if (v4228 === null) {
              v4226 = "";
            }
          }
          if (v4226.length === 0 && v4195.sessionCache) {
            v4228 = v4195.sessionCache.getSession();
            if (v4228 !== null) {
              v4226 = v4228.id;
            }
          }
          v4195.session = {
            id: v4226,
            version: null,
            cipherSuite: null,
            compressionMethod: null,
            serverCertificate: null,
            certificateRequest: null,
            clientCertificate: null,
            sp: {},
            md5: v3773.md.md5.create(),
            sha1: v3773.md.sha1.create()
          };
          if (v4228) {
            v4195.version = v4228.version;
            v4195.session.sp = v4228.sp;
          }
          v4195.session.sp.client_random = v3825.createRandom().getBytes();
          v4195.open = true;
          v3825.queue(v4195, v3825.createRecord(v4195, {
            type: v3825.ContentType.handshake,
            data: v3825.createClientHello(v4195)
          }));
          v3825.flush(v4195);
        }
      };
      v4195.process = function (v4229) {
        var v4230 = v4189;
        var v4231 = 0;
        if (v4229) {
          v4195.input.putBytes(v4229);
        }
        if (!v4195.fail) {
          if (v4195.record !== null && v4195.record.ready && v4195.record.fragment.isEmpty()) {
            v4195.record = null;
          }
          if (v4195.record === null) {
            v4231 = v4212(v4195);
          }
          if (!v4195.fail && v4195.record !== null && !v4195.record.ready) {
            v4231 = v4219(v4195);
          }
          if (!v4195.fail && v4195.record !== null && v4195.record.ready) {
            v4206(v4195, v4195.record);
          }
        }
        return v4231;
      };
      v4195.prepare = function (v4232) {
        var v4233 = v4189;
        v3825.queue(v4195, v3825.createRecord(v4195, {
          type: v3825.ContentType.application_data,
          data: v3773.util.createBuffer(v4232)
        }));
        return v3825.flush(v4195);
      };
      v4195.prepareHeartbeatRequest = function (v4234, v4235) {
        var v4236 = v4189;
        if (v4234 instanceof v3773.util.ByteBuffer) {
          v4234 = v4234.bytes();
        }
        if (typeof v4235 === "undefined") {
          v4235 = v4234.length;
        }
        v4195.expectedHeartbeatPayload = v4234;
        v3825.queue(v4195, v3825.createRecord(v4195, {
          type: v3825.ContentType.heartbeat,
          data: v3825.createHeartbeat(v3825.HeartbeatMessageType.heartbeat_request, v4234, v4235)
        }));
        return v3825.flush(v4195);
      };
      v4195.close = function (v4237) {
        var v4238 = v4189;
        if (!v4195.fail && v4195.sessionCache && v4195.session) {
          var v4239 = {
            id: v4195.session.id,
            version: v4195.session.version,
            sp: v4195.session.sp
          };
          v4239.sp.keys = null;
          v4195.sessionCache.setSession(v4239.id, v4239);
        }
        if (v4195.open) {
          v4195.open = false;
          v4195.input.clear();
          if (v4195.isConnected || v4195.handshaking) {
            v4195.isConnected = v4195.handshaking = false;
            v3825.queue(v4195, v3825.createAlert(v4195, {
              level: v3825.Alert.Level.warning,
              description: v3825.Alert.Description.close_notify
            }));
            v3825.flush(v4195);
          }
          v4195.closed(v4195);
        }
        v4195.reset(v4237);
      };
      return v4195;
    };
    v3717.exports = v3773.tls = v3773.tls || {};
    for (v4240 in v3825) {
      if (typeof v3825[v4240] !== "function") {
        v3773.tls[v4240] = v3825[v4240];
      }
    }
    var v4240;
    v3773.tls.prf_tls1 = v3774;
    v3773.tls.hmac_sha1 = v3792;
    v3773.tls.createSessionCache = v3825.createSessionCache;
    v3773.tls.createConnection = v3825.createConnection;
  }
});
var require_aesCipherSuites = __commonJS({
  "node_modules/node-forge/lib/aesCipherSuites.js"(v4241, v4242) {
    var v4243 = {
      dh2377: 1399
    };
    var v4244 = {
      dh2378: 1053,
      dh2379: 1077,
      dh2380: 352,
      dh2381: 1077
    };
    var v4245 = {
      dh2382: 271,
      dh2383: 931,
      dh2384: 623,
      dh2385: 914,
      dh2386: 619,
      dh2387: 524
    };
    var v4246 = {
      dh2388: 988,
      dh2389: 914,
      dh2390: 250,
      dh2391: 271,
      dh2392: 1224,
      dh2393: 352,
      dh2394: 914,
      dh2395: 857
    };
    var v4247 = {
      dh2396: 1241,
      dh2397: 909,
      dh2398: 1251,
      dh2399: 1014,
      dh2400: 1312,
      dh2401: 793,
      dh2402: 221,
      dh2403: 944
    };
    var v4248 = {
      dh2404: 1488,
      dh2405: 423,
      dh2406: 1405
    };
    var v4249 = {
      dh2407: 342,
      dh2408: 472,
      dh2409: 1173
    };
    var v4250 = v2;
    var v4251 = require_forge();
    require_aes();
    require_tls();
    var v4252 = v4242.exports = v4251.tls;
    v4252.CipherSuites.TLS_RSA_WITH_AES_128_CBC_SHA = {
      id: [0, 47],
      name: "TLS_RSA_WITH_AES_128_CBC_SHA",
      initSecurityParameters: function (v4253) {
        var v4254 = v4250;
        v4253.bulk_cipher_algorithm = v4252.BulkCipherAlgorithm.aes;
        v4253.cipher_type = v4252.CipherType.block;
        v4253.enc_key_length = 16;
        v4253.block_length = 16;
        v4253.fixed_iv_length = 16;
        v4253.record_iv_length = 16;
        v4253.mac_algorithm = v4252.MACAlgorithm.hmac_sha1;
        v4253.mac_length = 20;
        v4253.mac_key_length = 20;
      },
      initConnectionState: v4255
    };
    v4252.CipherSuites.TLS_RSA_WITH_AES_256_CBC_SHA = {
      id: [0, 53],
      name: "TLS_RSA_WITH_AES_256_CBC_SHA",
      initSecurityParameters: function (v4256) {
        var v4257 = v4250;
        v4256.bulk_cipher_algorithm = v4252.BulkCipherAlgorithm.aes;
        v4256.cipher_type = v4252.CipherType.block;
        v4256.enc_key_length = 32;
        v4256.block_length = 16;
        v4256.fixed_iv_length = 16;
        v4256.record_iv_length = 16;
        v4256.mac_algorithm = v4252.MACAlgorithm.hmac_sha1;
        v4256.mac_length = 20;
        v4256.mac_key_length = 20;
      },
      initConnectionState: v4255
    };
    function v4255(v4258, v4259, v4260) {
      var v4261 = v4250;
      var v4262 = v4259.entity === v4251.tls.ConnectionEnd.client;
      v4258.read.cipherState = {
        init: false,
        cipher: v4251.cipher.createDecipher("AES-CBC", v4262 ? v4260.keys.server_write_key : v4260.keys.client_write_key),
        iv: v4262 ? v4260.keys.server_write_IV : v4260.keys.client_write_IV
      };
      v4258.write.cipherState = {
        init: false,
        cipher: v4251.cipher.createCipher("AES-CBC", v4262 ? v4260.keys.client_write_key : v4260.keys.server_write_key),
        iv: v4262 ? v4260.keys.client_write_IV : v4260.keys.server_write_IV
      };
      v4258.read.cipherFunction = v4263;
      v4258.write.cipherFunction = v4264;
      v4258.read.macLength = v4258.write.macLength = v4260.mac_length;
      v4258.read.macFunction = v4258.write.macFunction = v4252.hmac_sha1;
    }
    function v4264(v4265, v4266) {
      var v4267 = v4250;
      var v4268 = false;
      var v4269 = v4266.macFunction(v4266.macKey, v4266.sequenceNumber, v4265);
      v4265.fragment.putBytes(v4269);
      v4266.updateSequenceNumber();
      var v4270;
      if (v4265.version.minor === v4252.Versions.TLS_1_0.minor) {
        v4270 = v4266.cipherState.init ? null : v4266.cipherState.iv;
      } else {
        v4270 = v4251.random.getBytesSync(16);
      }
      v4266.cipherState.init = true;
      var v4271 = v4266.cipherState.cipher;
      v4271.start({
        iv: v4270
      });
      if (v4265.version.minor >= v4252.Versions.TLS_1_1.minor) {
        v4271.output.putBytes(v4270);
      }
      v4271.update(v4265.fragment);
      if (v4271.finish(v4272)) {
        v4265.fragment = v4271.output;
        v4265.length = v4265.fragment.length();
        v4268 = true;
      }
      return v4268;
    }
    function v4272(v4273, v4274, v4275) {
      var v4276 = v4250;
      if (!v4275) {
        var v4277 = v4273 - v4274.length() % v4273;
        v4274.fillWithByte(v4277 - 1, v4277);
      }
      return true;
    }
    function v4278(v4279, v4280, v4281) {
      var v4282 = v4250;
      var v4283 = true;
      if (v4281) {
        var v4284 = v4280.length();
        var v4285 = v4280.last();
        for (var v4286 = v4284 - 1 - v4285; v4286 < v4284 - 1; ++v4286) {
          v4283 = v4283 && v4280.at(v4286) == v4285;
        }
        if (v4283) {
          v4280.truncate(v4285 + 1);
        }
      }
      return v4283;
    }
    function v4263(v4287, v4288) {
      var v4289 = v4250;
      var v4290 = false;
      var v4291;
      if (v4287.version.minor === v4252.Versions.TLS_1_0.minor) {
        v4291 = v4288.cipherState.init ? null : v4288.cipherState.iv;
      } else {
        v4291 = v4287.fragment.getBytes(16);
      }
      v4288.cipherState.init = true;
      var v4292 = v4288.cipherState.cipher;
      v4292.start({
        iv: v4291
      });
      v4292.update(v4287.fragment);
      v4290 = v4292.finish(v4278);
      var v4293 = v4288.macLength;
      var v4294 = v4251.random.getBytesSync(v4293);
      var v4295 = v4292.output.length();
      if (v4295 >= v4293) {
        v4287.fragment = v4292.output.getBytes(v4295 - v4293);
        v4294 = v4292.output.getBytes(v4293);
      } else {
        v4287.fragment = v4292.output.getBytes();
      }
      v4287.fragment = v4251.util.createBuffer(v4287.fragment);
      v4287.length = v4287.fragment.length();
      var v4296 = v4288.macFunction(v4288.macKey, v4288.sequenceNumber, v4287);
      v4288.updateSequenceNumber();
      v4290 = v4297(v4288.macKey, v4294, v4296) && v4290;
      return v4290;
    }
    function v4297(v4298, v4299, v4300) {
      var v4301 = v4250;
      var v4302 = v4251.hmac.create();
      v4302.start("SHA1", v4298);
      v4302.update(v4299);
      v4299 = v4302.digest().getBytes();
      v4302.start(null, null);
      v4302.update(v4300);
      v4300 = v4302.digest().getBytes();
      return v4299 === v4300;
    }
  }
});
var require_sha512 = __commonJS({
  "node_modules/node-forge/lib/sha512.js"(v4303, v4304) {
    var v4305 = {
      dh2410: 891,
      dh2411: 1138,
      dh2412: 443,
      dh2413: 1040,
      dh2414: 1144,
      dh2415: 555,
      dh2416: 693,
      dh2417: 693
    };
    var v4306 = {
      dh2418: 933
    };
    var v4307 = {
      dh2419: 322,
      dh2420: 824
    };
    var v4308 = {
      dh2421: 1539,
      dh2422: 931
    };
    var v4309 = {
      dh2423: 1144,
      dh2424: 1539
    };
    var v4310 = {
      dh2425: 1099
    };
    var v4311 = v2;
    var v4312 = require_forge();
    require_md();
    require_util();
    var v4313 = v4304.exports = v4312.sha512 = v4312.sha512 || {};
    v4312.md.sha512 = v4312.md.algorithms.sha512 = v4313;
    var v4314 = v4312.sha384 = v4312.sha512.sha384 = v4312.sha512.sha384 || {};
    v4314.create = function () {
      var v4315 = v4311;
      return v4313.create("SHA-384");
    };
    v4312.md.sha384 = v4312.md.algorithms.sha384 = v4314;
    v4312.sha512.sha256 = v4312.sha512.sha256 || {
      create: function () {
        var v4316 = v4311;
        return v4313.create("SHA-512/256");
      }
    };
    v4312.md["sha512/256"] = v4312.md.algorithms["sha512/256"] = v4312.sha512.sha256;
    v4312.sha512.sha224 = v4312.sha512.sha224 || {
      create: function () {
        return v4313.create("SHA-512/224");
      }
    };
    v4312.md["sha512/224"] = v4312.md.algorithms["sha512/224"] = v4312.sha512.sha224;
    v4313.create = function (v4317) {
      var v4318 = {
        dh2426: 619,
        dh2427: 1061,
        dh2428: 355,
        dh2429: 250,
        dh2430: 1486,
        dh2431: 1101,
        dh2432: 857,
        dh2433: 741,
        dh2434: 764
      };
      var v4319 = {
        dh2435: 393,
        dh2436: 619,
        dh2437: 677,
        dh2438: 1101,
        dh2439: 857
      };
      var v4320 = {
        dh2440: 531,
        dh2441: 619,
        dh2442: 857
      };
      var v4321 = v4311;
      if (!v4322) {
        v4323();
      }
      if (typeof v4317 === "undefined") {
        v4317 = "SHA-512";
      }
      if (!(v4317 in v4324)) {
        throw new Error("Invalid SHA-512 algorithm: " + v4317);
      }
      var v4325 = v4324[v4317];
      var v4326 = null;
      var v4327 = v4312.util.createBuffer();
      var v4328 = new Array(80);
      for (var v4329 = 0; v4329 < 80; ++v4329) {
        v4328[v4329] = new Array(2);
      }
      var v4330 = 64;
      switch (v4317) {
        case "SHA-384":
          v4330 = 48;
          break;
        case "SHA-512/256":
          v4330 = 32;
          break;
        case "SHA-512/224":
          v4330 = 28;
          break;
      }
      var v4331 = {
        algorithm: v4317.replace("-", "").toLowerCase(),
        blockLength: 128,
        digestLength: v4330,
        messageLength: 0,
        fullMessageLength: null,
        messageLengthSize: 16
      };
      v4331.start = function () {
        var v4332 = v4321;
        v4331.messageLength = 0;
        v4331.fullMessageLength = v4331.messageLength128 = [];
        var v4333 = v4331.messageLengthSize / 4;
        for (var v4334 = 0; v4334 < v4333; ++v4334) {
          v4331.fullMessageLength.push(0);
        }
        v4327 = v4312.util.createBuffer();
        v4326 = new Array(v4325.length);
        for (var v4334 = 0; v4334 < v4325.length; ++v4334) {
          v4326[v4334] = v4325[v4334].slice(0);
        }
        return v4331;
      };
      v4331.start();
      v4331.update = function (v4335, v4336) {
        var v4337 = v4321;
        if (v4336 === "utf8") {
          v4335 = v4312.util.encodeUtf8(v4335);
        }
        var v4338 = v4335.length;
        v4331.messageLength += v4338;
        v4338 = [v4338 / 4294967296 >>> 0, v4338 >>> 0];
        for (var v4339 = v4331.fullMessageLength.length - 1; v4339 >= 0; --v4339) {
          v4331.fullMessageLength[v4339] += v4338[1];
          v4338[1] = v4338[0] + (v4331.fullMessageLength[v4339] / 4294967296 >>> 0);
          v4331.fullMessageLength[v4339] = v4331.fullMessageLength[v4339] >>> 0;
          v4338[0] = v4338[1] / 4294967296 >>> 0;
        }
        v4327.putBytes(v4335);
        v4340(v4326, v4328, v4327);
        if (v4327.read > 2048 || v4327.length() === 0) {
          v4327.compact();
        }
        return v4331;
      };
      v4331.digest = function () {
        var v4341 = v4321;
        var v4342 = v4312.util.createBuffer();
        v4342.putBytes(v4327.bytes());
        var v4343 = v4331.fullMessageLength[v4331.fullMessageLength.length - 1] + v4331.messageLengthSize;
        var v4344 = v4343 & v4331.blockLength - 1;
        v4342.putBytes(v4345.substr(0, v4331.blockLength - v4344));
        var v4346;
        var v4347;
        var v4348 = v4331.fullMessageLength[0] * 8;
        for (var v4349 = 0; v4349 < v4331.fullMessageLength.length - 1; ++v4349) {
          v4346 = v4331.fullMessageLength[v4349 + 1] * 8;
          v4347 = v4346 / 4294967296 >>> 0;
          v4348 += v4347;
          v4342.putInt32(v4348 >>> 0);
          v4348 = v4346 >>> 0;
        }
        v4342.putInt32(v4348);
        var v4350 = new Array(v4326.length);
        for (var v4349 = 0; v4349 < v4326.length; ++v4349) {
          v4350[v4349] = v4326[v4349].slice(0);
        }
        v4340(v4350, v4328, v4342);
        var v4351 = v4312.util.createBuffer();
        var v4352;
        if (v4317 === "SHA-512") {
          v4352 = v4350.length;
        } else if (v4317 === "SHA-384") {
          v4352 = v4350.length - 2;
        } else {
          v4352 = v4350.length - 4;
        }
        for (var v4349 = 0; v4349 < v4352; ++v4349) {
          v4351.putInt32(v4350[v4349][0]);
          if (v4349 !== v4352 - 1 || v4317 !== "SHA-512/224") {
            v4351.putInt32(v4350[v4349][1]);
          }
        }
        return v4351;
      };
      return v4331;
    };
    var v4345 = null;
    var v4322 = false;
    var v4353 = null;
    var v4324 = null;
    function v4323() {
      var v4354 = v4311;
      v4345 = String.fromCharCode(128);
      v4345 += v4312.util.fillString(String.fromCharCode(0), 128);
      v4353 = [[1116352408, 3609767458], [1899447441, 602891725], [3049323471, 3964484399], [3921009573, 2173295548], [961987163, 4081628472], [1508970993, 3053834265], [2453635748, 2937671579], [2870763221, 3664609560], [3624381080, 2734883394], [310598401, 1164996542], [607225278, 1323610764], [1426881987, 3590304994], [1925078388, 4068182383], [2162078206, 991336113], [2614888103, 633803317], [3248222580, 3479774868], [3835390401, 2666613458], [4022224774, 944711139], [264347078, 2341262773], [604807628, 2007800933], [770255983, 1495990901], [1249150122, 1856431235], [1555081692, 3175218132], [1996064986, 2198950837], [2554220882, 3999719339], [2821834349, 766784016], [2952996808, 2566594879], [3210313671, 3203337956], [3336571891, 1034457026], [3584528711, 2466948901], [113926993, 3758326383], [338241895, 168717936], [666307205, 1188179964], [773529912, 1546045734], [1294757372, 1522805485], [1396182291, 2643833823], [1695183700, 2343527390], [1986661051, 1014477480], [2177026350, 1206759142], [2456956037, 344077627], [2730485921, 1290863460], [2820302411, 3158454273], [3259730800, 3505952657], [3345764771, 106217008], [3516065817, 3606008344], [3600352804, 1432725776], [4094571909, 1467031594], [275423344, 851169720], [430227734, 3100823752], [506948616, 1363258195], [659060556, 3750685593], [883997877, 3785050280], [958139571, 3318307427], [1322822218, 3812723403], [1537002063, 2003034995], [1747873779, 3602036899], [1955562222, 1575990012], [2024104815, 1125592928], [2227730452, 2716904306], [2361852424, 442776044], [2428436474, 593698344], [2756734187, 3733110249], [3204031479, 2999351573], [3329325298, 3815920427], [3391569614, 3928383900], [3515267271, 566280711], [3940187606, 3454069534], [4118630271, 4000239992], [116418474, 1914138554], [174292421, 2731055270], [289380356, 3203993006], [460393269, 320620315], [685471733, 587496836], [852142971, 1086792851], [1017036298, 365543100], [1126000580, 2618297676], [1288033470, 3409855158], [1501505948, 4234509866], [1607167915, 987167468], [1816402316, 1246189591]];
      v4324 = {};
      v4324["SHA-512"] = [[1779033703, 4089235720], [3144134277, 2227873595], [1013904242, 4271175723], [2773480762, 1595750129], [1359893119, 2917565137], [2600822924, 725511199], [528734635, 4215389547], [1541459225, 327033209]];
      v4324["SHA-384"] = [[3418070365, 3238371032], [1654270250, 914150663], [2438529370, 812702999], [355462360, 4144912697], [1731405415, 4290775857], [2394180231, 1750603025], [3675008525, 1694076839], [1203062813, 3204075428]];
      v4324["SHA-512/256"] = [[573645204, 4230739756], [2673172387, 3360449730], [596883563, 1867755857], [2520282905, 1497426621], [2519219938, 2827943907], [3193839141, 1401305490], [721525244, 746961066], [246885852, 2177182882]];
      v4324["SHA-512/224"] = [[2352822216, 424955298], [1944164710, 2312950998], [502970286, 855612546], [1738396948, 1479516111], [258812777, 2077511080], [2011393907, 79989058], [1067287976, 1780299464], [286451373, 2446758561]];
      v4322 = true;
    }
    function v4340(v4355, v4356, v4357) {
      var v4358 = v4311;
      var v4359;
      var v4360;
      var v4361;
      var v4362;
      var v4363;
      var v4364;
      var v4365;
      var v4366;
      var v4367;
      var v4368;
      var v4369;
      var v4370;
      var v4371;
      var v4372;
      var v4373;
      var v4374;
      var v4375;
      var v4376;
      var v4377;
      var v4378;
      var v4379;
      var v4380;
      var v4381;
      var v4382;
      var v4383;
      var v4384;
      var v4385;
      var v4386;
      var v4387;
      var v4388;
      var v4389;
      var v4390;
      var v4391;
      var v4392;
      var v4393;
      var v4394 = v4357.length();
      while (v4394 >= 128) {
        for (v4387 = 0; v4387 < 16; ++v4387) {
          v4356[v4387][0] = v4357.getInt32() >>> 0;
          v4356[v4387][1] = v4357.getInt32() >>> 0;
        }
        for (; v4387 < 80; ++v4387) {
          v4390 = v4356[v4387 - 2];
          v4388 = v4390[0];
          v4389 = v4390[1];
          v4359 = ((v4388 >>> 19 | v4389 << 13) ^ (v4389 >>> 29 | v4388 << 3) ^ v4388 >>> 6) >>> 0;
          v4360 = ((v4388 << 13 | v4389 >>> 19) ^ (v4389 << 3 | v4388 >>> 29) ^ (v4388 << 26 | v4389 >>> 6)) >>> 0;
          v4392 = v4356[v4387 - 15];
          v4388 = v4392[0];
          v4389 = v4392[1];
          v4361 = ((v4388 >>> 1 | v4389 << 31) ^ (v4388 >>> 8 | v4389 << 24) ^ v4388 >>> 7) >>> 0;
          v4362 = ((v4388 << 31 | v4389 >>> 1) ^ (v4388 << 24 | v4389 >>> 8) ^ (v4388 << 25 | v4389 >>> 7)) >>> 0;
          v4391 = v4356[v4387 - 7];
          v4393 = v4356[v4387 - 16];
          v4389 = v4360 + v4391[1] + v4362 + v4393[1];
          v4356[v4387][0] = v4359 + v4391[0] + v4361 + v4393[0] + (v4389 / 4294967296 >>> 0) >>> 0;
          v4356[v4387][1] = v4389 >>> 0;
        }
        v4371 = v4355[0][0];
        v4372 = v4355[0][1];
        v4373 = v4355[1][0];
        v4374 = v4355[1][1];
        v4375 = v4355[2][0];
        v4376 = v4355[2][1];
        v4377 = v4355[3][0];
        v4378 = v4355[3][1];
        v4379 = v4355[4][0];
        v4380 = v4355[4][1];
        v4381 = v4355[5][0];
        v4382 = v4355[5][1];
        v4383 = v4355[6][0];
        v4384 = v4355[6][1];
        v4385 = v4355[7][0];
        v4386 = v4355[7][1];
        for (v4387 = 0; v4387 < 80; ++v4387) {
          v4365 = ((v4379 >>> 14 | v4380 << 18) ^ (v4379 >>> 18 | v4380 << 14) ^ (v4380 >>> 9 | v4379 << 23)) >>> 0;
          v4366 = ((v4379 << 18 | v4380 >>> 14) ^ (v4379 << 14 | v4380 >>> 18) ^ (v4380 << 23 | v4379 >>> 9)) >>> 0;
          v4367 = (v4383 ^ v4379 & (v4381 ^ v4383)) >>> 0;
          v4368 = (v4384 ^ v4380 & (v4382 ^ v4384)) >>> 0;
          v4363 = ((v4371 >>> 28 | v4372 << 4) ^ (v4372 >>> 2 | v4371 << 30) ^ (v4372 >>> 7 | v4371 << 25)) >>> 0;
          v4364 = ((v4371 << 4 | v4372 >>> 28) ^ (v4372 << 30 | v4371 >>> 2) ^ (v4372 << 25 | v4371 >>> 7)) >>> 0;
          v4369 = (v4371 & v4373 | v4375 & (v4371 ^ v4373)) >>> 0;
          v4370 = (v4372 & v4374 | v4376 & (v4372 ^ v4374)) >>> 0;
          v4389 = v4386 + v4366 + v4368 + v4353[v4387][1] + v4356[v4387][1];
          v4359 = v4385 + v4365 + v4367 + v4353[v4387][0] + v4356[v4387][0] + (v4389 / 4294967296 >>> 0) >>> 0;
          v4360 = v4389 >>> 0;
          v4389 = v4364 + v4370;
          v4361 = v4363 + v4369 + (v4389 / 4294967296 >>> 0) >>> 0;
          v4362 = v4389 >>> 0;
          v4385 = v4383;
          v4386 = v4384;
          v4383 = v4381;
          v4384 = v4382;
          v4381 = v4379;
          v4382 = v4380;
          v4389 = v4378 + v4360;
          v4379 = v4377 + v4359 + (v4389 / 4294967296 >>> 0) >>> 0;
          v4380 = v4389 >>> 0;
          v4377 = v4375;
          v4378 = v4376;
          v4375 = v4373;
          v4376 = v4374;
          v4373 = v4371;
          v4374 = v4372;
          v4389 = v4360 + v4362;
          v4371 = v4359 + v4361 + (v4389 / 4294967296 >>> 0) >>> 0;
          v4372 = v4389 >>> 0;
        }
        v4389 = v4355[0][1] + v4372;
        v4355[0][0] = v4355[0][0] + v4371 + (v4389 / 4294967296 >>> 0) >>> 0;
        v4355[0][1] = v4389 >>> 0;
        v4389 = v4355[1][1] + v4374;
        v4355[1][0] = v4355[1][0] + v4373 + (v4389 / 4294967296 >>> 0) >>> 0;
        v4355[1][1] = v4389 >>> 0;
        v4389 = v4355[2][1] + v4376;
        v4355[2][0] = v4355[2][0] + v4375 + (v4389 / 4294967296 >>> 0) >>> 0;
        v4355[2][1] = v4389 >>> 0;
        v4389 = v4355[3][1] + v4378;
        v4355[3][0] = v4355[3][0] + v4377 + (v4389 / 4294967296 >>> 0) >>> 0;
        v4355[3][1] = v4389 >>> 0;
        v4389 = v4355[4][1] + v4380;
        v4355[4][0] = v4355[4][0] + v4379 + (v4389 / 4294967296 >>> 0) >>> 0;
        v4355[4][1] = v4389 >>> 0;
        v4389 = v4355[5][1] + v4382;
        v4355[5][0] = v4355[5][0] + v4381 + (v4389 / 4294967296 >>> 0) >>> 0;
        v4355[5][1] = v4389 >>> 0;
        v4389 = v4355[6][1] + v4384;
        v4355[6][0] = v4355[6][0] + v4383 + (v4389 / 4294967296 >>> 0) >>> 0;
        v4355[6][1] = v4389 >>> 0;
        v4389 = v4355[7][1] + v4386;
        v4355[7][0] = v4355[7][0] + v4385 + (v4389 / 4294967296 >>> 0) >>> 0;
        v4355[7][1] = v4389 >>> 0;
        v4394 -= 128;
      }
    }
  }
});
var require_asn1_validator = __commonJS({
  "node_modules/node-forge/lib/asn1-validator.js"(v4395) {
    var v4396 = {
      dh2443: 1045,
      dh2444: 682,
      dh2445: 300,
      dh2446: 1495,
      dh2447: 1533,
      dh2448: 368,
      dh2449: 738,
      dh2450: 1027,
      dh2451: 701,
      dh2452: 1045,
      dh2453: 300,
      dh2454: 519
    };
    var v4397 = v2;
    var v4398 = require_forge();
    require_asn1();
    var v4399 = v4398.asn1;
    v4395.privateKeyValidator = {
      name: "PrivateKeyInfo",
      tagClass: v4399.Class.UNIVERSAL,
      type: v4399.Type.SEQUENCE,
      constructed: true,
      value: [{
        name: "PrivateKeyInfo.version",
        tagClass: v4399.Class.UNIVERSAL,
        type: v4399.Type.INTEGER,
        constructed: false,
        capture: "privateKeyVersion"
      }, {
        name: "PrivateKeyInfo.privateKeyAlgorithm",
        tagClass: v4399.Class.UNIVERSAL,
        type: v4399.Type.SEQUENCE,
        constructed: true,
        value: [{
          name: "AlgorithmIdentifier.algorithm",
          tagClass: v4399.Class.UNIVERSAL,
          type: v4399.Type.OID,
          constructed: false,
          capture: "privateKeyOid"
        }]
      }, {
        name: "PrivateKeyInfo",
        tagClass: v4399.Class.UNIVERSAL,
        type: v4399.Type.OCTETSTRING,
        constructed: false,
        capture: "privateKey"
      }]
    };
    v4395.publicKeyValidator = {
      name: "SubjectPublicKeyInfo",
      tagClass: v4399.Class.UNIVERSAL,
      type: v4399.Type.SEQUENCE,
      constructed: true,
      captureAsn1: "subjectPublicKeyInfo",
      value: [{
        name: "SubjectPublicKeyInfo.AlgorithmIdentifier",
        tagClass: v4399.Class.UNIVERSAL,
        type: v4399.Type.SEQUENCE,
        constructed: true,
        value: [{
          name: "AlgorithmIdentifier.algorithm",
          tagClass: v4399.Class.UNIVERSAL,
          type: v4399.Type.OID,
          constructed: false,
          capture: "publicKeyOid"
        }]
      }, {
        tagClass: v4399.Class.UNIVERSAL,
        type: v4399.Type.BITSTRING,
        constructed: false,
        composed: true,
        captureBitStringValue: "ed25519PublicKey"
      }]
    };
  }
});
var require_ed25519 = __commonJS({
  "node_modules/node-forge/lib/ed25519.js"(v4400, v4401) {
    var v4402 = {
      dh2455: 421,
      dh2456: 235,
      dh2457: 795,
      dh2458: 736,
      dh2459: 747,
      dh2460: 298,
      dh2461: 1182
    };
    var v4403 = {
      dh2462: 662,
      dh2463: 662,
      dh2464: 662,
      dh2465: 662
    };
    var v4404 = {
      dh2466: 1125
    };
    var v4405 = {
      dh2467: 1125
    };
    var v4406 = {
      dh2468: 1025,
      dh2469: 1077,
      dh2470: 431
    };
    var v4407 = {
      dh2471: 1025,
      dh2472: 277,
      dh2473: 857
    };
    var v4408 = {
      dh2474: 1462,
      dh2475: 1084,
      dh2476: 747
    };
    var v4409 = {
      dh2477: 699,
      dh2478: 857,
      dh2479: 747
    };
    var v4410 = {
      dh2480: 400,
      dh2481: 1529,
      dh2482: 658
    };
    var v4411 = {
      dh2483: 1533,
      dh2484: 1231
    };
    var v4412 = {
      dh2485: 521,
      dh2486: 1383
    };
    var v4413 = v2;
    var v4414 = require_forge();
    require_jsbn();
    require_random();
    require_sha512();
    require_util();
    var v4415 = require_asn1_validator();
    var v4416 = v4415.publicKeyValidator;
    var v4417 = v4415.privateKeyValidator;
    if (typeof v4418 === "undefined") {
      v4418 = v4414.jsbn.BigInteger;
    }
    var v4418;
    var v4419 = v4414.util.ByteBuffer;
    var v4420 = typeof Buffer === "undefined" ? Uint8Array : Buffer;
    v4414.pki = v4414.pki || {};
    v4401.exports = v4414.pki.ed25519 = v4414.ed25519 = v4414.ed25519 || {};
    var v4421 = v4414.ed25519;
    v4421.constants = {};
    v4421.constants.PUBLIC_KEY_BYTE_LENGTH = 32;
    v4421.constants.PRIVATE_KEY_BYTE_LENGTH = 64;
    v4421.constants.SEED_BYTE_LENGTH = 32;
    v4421.constants.SIGN_BYTE_LENGTH = 64;
    v4421.constants.HASH_BYTE_LENGTH = 64;
    v4421.generateKeyPair = function (v4422) {
      var v4423 = v4413;
      v4422 = v4422 || {};
      var v4424 = v4422.seed;
      if (v4424 === undefined) {
        v4424 = v4414.random.getBytesSync(v4421.constants.SEED_BYTE_LENGTH);
      } else if (typeof v4424 === "string") {
        if (v4424.length !== v4421.constants.SEED_BYTE_LENGTH) {
          throw new TypeError("\"seed\" must be " + v4421.constants.SEED_BYTE_LENGTH + " bytes in length.");
        }
      } else if (!(v4424 instanceof Uint8Array)) {
        throw new TypeError("\"seed\" must be a node.js Buffer, Uint8Array, or a binary string.");
      }
      v4424 = v4425({
        message: v4424,
        encoding: "binary"
      });
      var v4426 = new v4420(v4421.constants.PUBLIC_KEY_BYTE_LENGTH);
      var v4427 = new v4420(v4421.constants.PRIVATE_KEY_BYTE_LENGTH);
      for (var v4428 = 0; v4428 < 32; ++v4428) {
        v4427[v4428] = v4424[v4428];
      }
      v4429(v4426, v4427);
      return {
        publicKey: v4426,
        privateKey: v4427
      };
    };
    v4421.privateKeyFromAsn1 = function (v4430) {
      var v4431 = v4413;
      var v4432 = {};
      var v4433 = [];
      var v4434 = v4414.asn1.validate(v4430, v4417, v4432, v4433);
      if (!v4434) {
        var v4435 = new Error("Invalid Key.");
        v4435.errors = v4433;
        throw v4435;
      }
      var v4436 = v4414.asn1.derToOid(v4432.privateKeyOid);
      var v4437 = v4414.oids.EdDSA25519;
      if (v4436 !== v4437) {
        throw new Error("Invalid OID \"" + v4436 + "\"; OID must be \"" + v4437 + "\".");
      }
      var v4438 = v4432.privateKey;
      var v4439 = v4425({
        message: v4414.asn1.fromDer(v4438).value,
        encoding: "binary"
      });
      return {
        privateKeyBytes: v4439
      };
    };
    v4421.publicKeyFromAsn1 = function (v4440) {
      var v4441 = v4413;
      var v4442 = {};
      var v4443 = [];
      var v4444 = v4414.asn1.validate(v4440, v4416, v4442, v4443);
      if (!v4444) {
        var v4445 = new Error("Invalid Key.");
        v4445.errors = v4443;
        throw v4445;
      }
      var v4446 = v4414.asn1.derToOid(v4442.publicKeyOid);
      var v4447 = v4414.oids.EdDSA25519;
      if (v4446 !== v4447) {
        throw new Error("Invalid OID \"" + v4446 + "\"; OID must be \"" + v4447 + "\".");
      }
      var v4448 = v4442.ed25519PublicKey;
      if (v4448.length !== v4421.constants.PUBLIC_KEY_BYTE_LENGTH) {
        throw new Error("Key length is invalid.");
      }
      return v4425({
        message: v4448,
        encoding: "binary"
      });
    };
    v4421.publicKeyFromPrivateKey = function (v4449) {
      var v4450 = v4413;
      v4449 = v4449 || {};
      var v4451 = v4425({
        message: v4449.privateKey,
        encoding: "binary"
      });
      if (v4451.length !== v4421.constants.PRIVATE_KEY_BYTE_LENGTH) {
        throw new TypeError("\"options.privateKey\" must have a byte length of " + v4421.constants.PRIVATE_KEY_BYTE_LENGTH);
      }
      var v4452 = new v4420(v4421.constants.PUBLIC_KEY_BYTE_LENGTH);
      for (var v4453 = 0; v4453 < v4452.length; ++v4453) {
        v4452[v4453] = v4451[32 + v4453];
      }
      return v4452;
    };
    v4421.sign = function (v4454) {
      var v4455 = v4413;
      v4454 = v4454 || {};
      var v4456 = v4425(v4454);
      var v4457 = v4425({
        message: v4454.privateKey,
        encoding: "binary"
      });
      if (v4457.length === v4421.constants.SEED_BYTE_LENGTH) {
        var v4458 = v4421.generateKeyPair({
          seed: v4457
        });
        v4457 = v4458.privateKey;
      } else if (v4457.length !== v4421.constants.PRIVATE_KEY_BYTE_LENGTH) {
        throw new TypeError("\"options.privateKey\" must have a byte length of " + v4421.constants.SEED_BYTE_LENGTH + " or " + v4421.constants.PRIVATE_KEY_BYTE_LENGTH);
      }
      var v4459 = new v4420(v4421.constants.SIGN_BYTE_LENGTH + v4456.length);
      v4460(v4459, v4456, v4456.length, v4457);
      var v4461 = new v4420(v4421.constants.SIGN_BYTE_LENGTH);
      for (var v4462 = 0; v4462 < v4461.length; ++v4462) {
        v4461[v4462] = v4459[v4462];
      }
      return v4461;
    };
    v4421.verify = function (v4463) {
      var v4464 = v4413;
      v4463 = v4463 || {};
      var v4465 = v4425(v4463);
      if (v4463.signature === undefined) {
        throw new TypeError("\"options.signature\" must be a node.js Buffer, a Uint8Array, a forge ByteBuffer, or a binary string.");
      }
      var v4466 = v4425({
        message: v4463.signature,
        encoding: "binary"
      });
      if (v4466.length !== v4421.constants.SIGN_BYTE_LENGTH) {
        throw new TypeError("\"options.signature\" must have a byte length of " + v4421.constants.SIGN_BYTE_LENGTH);
      }
      var v4467 = v4425({
        message: v4463.publicKey,
        encoding: "binary"
      });
      if (v4467.length !== v4421.constants.PUBLIC_KEY_BYTE_LENGTH) {
        throw new TypeError("\"options.publicKey\" must have a byte length of " + v4421.constants.PUBLIC_KEY_BYTE_LENGTH);
      }
      var v4468 = new v4420(v4421.constants.SIGN_BYTE_LENGTH + v4465.length);
      var v4469 = new v4420(v4421.constants.SIGN_BYTE_LENGTH + v4465.length);
      var v4470;
      for (v4470 = 0; v4470 < v4421.constants.SIGN_BYTE_LENGTH; ++v4470) {
        v4468[v4470] = v4466[v4470];
      }
      for (v4470 = 0; v4470 < v4465.length; ++v4470) {
        v4468[v4470 + v4421.constants.SIGN_BYTE_LENGTH] = v4465[v4470];
      }
      return v4471(v4469, v4468, v4468.length, v4467) >= 0;
    };
    function v4425(v4472) {
      var v4473 = v4413;
      var v4474 = v4472.message;
      if (v4474 instanceof Uint8Array || v4474 instanceof v4420) {
        return v4474;
      }
      var v4475 = v4472.encoding;
      if (v4474 === undefined) {
        if (v4472.md) {
          v4474 = v4472.md.digest().getBytes();
          v4475 = "binary";
        } else {
          throw new TypeError("\"options.message\" or \"options.md\" not specified.");
        }
      }
      if (typeof v4474 === "string" && !v4475) {
        throw new TypeError("\"options.encoding\" must be \"binary\" or \"utf8\".");
      }
      if (typeof v4474 === "string") {
        if (typeof Buffer !== "undefined") {
          return Buffer.from(v4474, v4475);
        }
        v4474 = new v4419(v4474, v4475);
      } else if (!(v4474 instanceof v4419)) {
        throw new TypeError("\"options.message\" must be a node.js Buffer, a Uint8Array, a forge ByteBuffer, or a string with \"options.encoding\" specifying its encoding.");
      }
      var v4476 = new v4420(v4474.length());
      for (var v4477 = 0; v4477 < v4476.length; ++v4477) {
        v4476[v4477] = v4474.at(v4477);
      }
      return v4476;
    }
    var v4478 = v4479();
    var v4480 = v4479([1]);
    var v4481 = v4479([30883, 4953, 19914, 30187, 55467, 16705, 2637, 112, 59544, 30585, 16505, 36039, 65139, 11119, 27886, 20995]);
    var v4482 = v4479([61785, 9906, 39828, 60374, 45398, 33411, 5274, 224, 53552, 61171, 33010, 6542, 64743, 22239, 55772, 9222]);
    var v4483 = v4479([54554, 36645, 11616, 51542, 42930, 38181, 51040, 26924, 56412, 64982, 57905, 49316, 21502, 52590, 14035, 8553]);
    var v4484 = v4479([26200, 26214, 26214, 26214, 26214, 26214, 26214, 26214, 26214, 26214, 26214, 26214, 26214, 26214, 26214, 26214]);
    var v4485 = new Float64Array([237, 211, 245, 92, 26, 99, 18, 88, 214, 156, 247, 162, 222, 249, 222, 20, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 16]);
    var v4486 = v4479([41136, 18958, 6951, 50414, 58488, 44335, 6150, 12099, 55207, 15867, 153, 11085, 57099, 20417, 9344, 11139]);
    function v4487(v4488, v4489) {
      var v4490 = v4413;
      var v4491 = v4414.md.sha512.create();
      var v4492 = new v4419(v4488);
      v4491.update(v4492.getBytes(v4489), "binary");
      var v4493 = v4491.digest().getBytes();
      if (typeof Buffer !== "undefined") {
        return Buffer.from(v4493, "binary");
      }
      var v4494 = new v4420(v4421.constants.HASH_BYTE_LENGTH);
      for (var v4495 = 0; v4495 < 64; ++v4495) {
        v4494[v4495] = v4493.charCodeAt(v4495);
      }
      return v4494;
    }
    function v4429(v4496, v4497) {
      var v4498 = [v4479(), v4479(), v4479(), v4479()];
      var v4499;
      var v4500 = v4487(v4497, 32);
      v4500[0] &= 248;
      v4500[31] &= 127;
      v4500[31] |= 64;
      v4501(v4498, v4500);
      v4502(v4496, v4498);
      for (v4499 = 0; v4499 < 32; ++v4499) {
        v4497[v4499 + 32] = v4496[v4499];
      }
      return 0;
    }
    function v4460(v4503, v4504, v4505, v4506) {
      var v4507 = v4413;
      var v4508;
      var v4509;
      var v4510 = new Float64Array(64);
      var v4511 = [v4479(), v4479(), v4479(), v4479()];
      var v4512 = v4487(v4506, 32);
      v4512[0] &= 248;
      v4512[31] &= 127;
      v4512[31] |= 64;
      var v4513 = v4505 + 64;
      for (v4508 = 0; v4508 < v4505; ++v4508) {
        v4503[64 + v4508] = v4504[v4508];
      }
      for (v4508 = 0; v4508 < 32; ++v4508) {
        v4503[32 + v4508] = v4512[32 + v4508];
      }
      var v4514 = v4487(v4503.subarray(32), v4505 + 32);
      v4515(v4514);
      v4501(v4511, v4514);
      v4502(v4503, v4511);
      for (v4508 = 32; v4508 < 64; ++v4508) {
        v4503[v4508] = v4506[v4508];
      }
      var v4516 = v4487(v4503, v4505 + 64);
      v4515(v4516);
      for (v4508 = 32; v4508 < 64; ++v4508) {
        v4510[v4508] = 0;
      }
      for (v4508 = 0; v4508 < 32; ++v4508) {
        v4510[v4508] = v4514[v4508];
      }
      for (v4508 = 0; v4508 < 32; ++v4508) {
        for (v4509 = 0; v4509 < 32; v4509++) {
          v4510[v4508 + v4509] += v4516[v4508] * v4512[v4509];
        }
      }
      v4517(v4503.subarray(32), v4510);
      return v4513;
    }
    function v4471(v4518, v4519, v4520, v4521) {
      var v4522 = v4413;
      var v4523;
      var v4524;
      var v4525 = new v4420(32);
      var v4526 = [v4479(), v4479(), v4479(), v4479()];
      var v4527 = [v4479(), v4479(), v4479(), v4479()];
      v4524 = -1;
      if (v4520 < 64) {
        return -1;
      }
      if (v4528(v4527, v4521)) {
        return -1;
      }
      if (!v4529(v4519, 32)) {
        return -1;
      }
      for (v4523 = 0; v4523 < v4520; ++v4523) {
        v4518[v4523] = v4519[v4523];
      }
      for (v4523 = 0; v4523 < 32; ++v4523) {
        v4518[v4523 + 32] = v4521[v4523];
      }
      var v4530 = v4487(v4518, v4520);
      v4515(v4530);
      v4531(v4526, v4527, v4530);
      v4501(v4527, v4519.subarray(32));
      v4532(v4526, v4527);
      v4502(v4525, v4526);
      v4520 -= 64;
      if (v4533(v4519, 0, v4525, 0)) {
        for (v4523 = 0; v4523 < v4520; ++v4523) {
          v4518[v4523] = 0;
        }
        return -1;
      }
      for (v4523 = 0; v4523 < v4520; ++v4523) {
        v4518[v4523] = v4519[v4523 + 64];
      }
      v4524 = v4520;
      return v4524;
    }
    function v4529(v4534, v4535) {
      var v4536;
      for (v4536 = 31; v4536 >= 0; --v4536) {
        if (v4534[v4535 + v4536] < v4485[v4536]) {
          return true;
        }
        if (v4534[v4535 + v4536] > v4485[v4536]) {
          return false;
        }
      }
      return false;
    }
    function v4517(v4537, v4538) {
      var v4539;
      var v4540;
      var v4541;
      var v4542;
      for (v4540 = 63; v4540 >= 32; --v4540) {
        v4539 = 0;
        v4541 = v4540 - 32;
        v4542 = v4540 - 12;
        for (; v4541 < v4542; ++v4541) {
          v4538[v4541] += v4539 - v4538[v4540] * 16 * v4485[v4541 - (v4540 - 32)];
          v4539 = v4538[v4541] + 128 >> 8;
          v4538[v4541] -= v4539 * 256;
        }
        v4538[v4541] += v4539;
        v4538[v4540] = 0;
      }
      v4539 = 0;
      for (v4541 = 0; v4541 < 32; ++v4541) {
        v4538[v4541] += v4539 - (v4538[31] >> 4) * v4485[v4541];
        v4539 = v4538[v4541] >> 8;
        v4538[v4541] &= 255;
      }
      for (v4541 = 0; v4541 < 32; ++v4541) {
        v4538[v4541] -= v4539 * v4485[v4541];
      }
      for (v4540 = 0; v4540 < 32; ++v4540) {
        v4538[v4540 + 1] += v4538[v4540] >> 8;
        v4537[v4540] = v4538[v4540] & 255;
      }
    }
    function v4515(v4543) {
      var v4544 = new Float64Array(64);
      for (var v4545 = 0; v4545 < 64; ++v4545) {
        v4544[v4545] = v4543[v4545];
        v4543[v4545] = 0;
      }
      v4517(v4543, v4544);
    }
    function v4532(v4546, v4547) {
      var v4548 = v4479();
      var v4549 = v4479();
      var v4550 = v4479();
      var v4551 = v4479();
      var v4552 = v4479();
      var v4553 = v4479();
      var v4554 = v4479();
      var v4555 = v4479();
      var v4556 = v4479();
      v4557(v4548, v4546[1], v4546[0]);
      v4557(v4556, v4547[1], v4547[0]);
      v4558(v4548, v4548, v4556);
      v4559(v4549, v4546[0], v4546[1]);
      v4559(v4556, v4547[0], v4547[1]);
      v4558(v4549, v4549, v4556);
      v4558(v4550, v4546[3], v4547[3]);
      v4558(v4550, v4550, v4482);
      v4558(v4551, v4546[2], v4547[2]);
      v4559(v4551, v4551, v4551);
      v4557(v4552, v4549, v4548);
      v4557(v4553, v4551, v4550);
      v4559(v4554, v4551, v4550);
      v4559(v4555, v4549, v4548);
      v4558(v4546[0], v4552, v4553);
      v4558(v4546[1], v4555, v4554);
      v4558(v4546[2], v4554, v4553);
      v4558(v4546[3], v4552, v4555);
    }
    function v4560(v4561, v4562, v4563) {
      for (var v4564 = 0; v4564 < 4; ++v4564) {
        v4565(v4561[v4564], v4562[v4564], v4563);
      }
    }
    function v4502(v4566, v4567) {
      var v4568 = v4479();
      var v4569 = v4479();
      var v4570 = v4479();
      v4571(v4570, v4567[2]);
      v4558(v4568, v4567[0], v4570);
      v4558(v4569, v4567[1], v4570);
      v4572(v4566, v4569);
      v4566[31] ^= v4573(v4568) << 7;
    }
    function v4572(v4574, v4575) {
      var v4576;
      var v4577;
      var v4578;
      var v4579 = v4479();
      var v4580 = v4479();
      for (v4576 = 0; v4576 < 16; ++v4576) {
        v4580[v4576] = v4575[v4576];
      }
      v4581(v4580);
      v4581(v4580);
      v4581(v4580);
      for (v4577 = 0; v4577 < 2; ++v4577) {
        v4579[0] = v4580[0] - 65517;
        for (v4576 = 1; v4576 < 15; ++v4576) {
          v4579[v4576] = v4580[v4576] - 65535 - (v4579[v4576 - 1] >> 16 & 1);
          v4579[v4576 - 1] &= 65535;
        }
        v4579[15] = v4580[15] - 32767 - (v4579[14] >> 16 & 1);
        v4578 = v4579[15] >> 16 & 1;
        v4579[14] &= 65535;
        v4565(v4580, v4579, 1 - v4578);
      }
      for (v4576 = 0; v4576 < 16; v4576++) {
        v4574[v4576 * 2] = v4580[v4576] & 255;
        v4574[v4576 * 2 + 1] = v4580[v4576] >> 8;
      }
    }
    function v4528(v4582, v4583) {
      var v4584 = v4479();
      var v4585 = v4479();
      var v4586 = v4479();
      var v4587 = v4479();
      var v4588 = v4479();
      var v4589 = v4479();
      var v4590 = v4479();
      v4591(v4582[2], v4480);
      v4592(v4582[1], v4583);
      v4593(v4586, v4582[1]);
      v4558(v4587, v4586, v4481);
      v4557(v4586, v4586, v4582[2]);
      v4559(v4587, v4582[2], v4587);
      v4593(v4588, v4587);
      v4593(v4589, v4588);
      v4558(v4590, v4589, v4588);
      v4558(v4584, v4590, v4586);
      v4558(v4584, v4584, v4587);
      v4594(v4584, v4584);
      v4558(v4584, v4584, v4586);
      v4558(v4584, v4584, v4587);
      v4558(v4584, v4584, v4587);
      v4558(v4582[0], v4584, v4587);
      v4593(v4585, v4582[0]);
      v4558(v4585, v4585, v4587);
      if (v4595(v4585, v4586)) {
        v4558(v4582[0], v4582[0], v4486);
      }
      v4593(v4585, v4582[0]);
      v4558(v4585, v4585, v4587);
      if (v4595(v4585, v4586)) {
        return -1;
      }
      if (v4573(v4582[0]) === v4583[31] >> 7) {
        v4557(v4582[0], v4478, v4582[0]);
      }
      v4558(v4582[3], v4582[0], v4582[1]);
      return 0;
    }
    function v4592(v4596, v4597) {
      var v4598;
      for (v4598 = 0; v4598 < 16; ++v4598) {
        v4596[v4598] = v4597[v4598 * 2] + (v4597[v4598 * 2 + 1] << 8);
      }
      v4596[15] &= 32767;
    }
    function v4594(v4599, v4600) {
      var v4601 = v4479();
      var v4602;
      for (v4602 = 0; v4602 < 16; ++v4602) {
        v4601[v4602] = v4600[v4602];
      }
      for (v4602 = 250; v4602 >= 0; --v4602) {
        v4593(v4601, v4601);
        if (v4602 !== 1) {
          v4558(v4601, v4601, v4600);
        }
      }
      for (v4602 = 0; v4602 < 16; ++v4602) {
        v4599[v4602] = v4601[v4602];
      }
    }
    function v4595(v4603, v4604) {
      var v4605 = new v4420(32);
      var v4606 = new v4420(32);
      v4572(v4605, v4603);
      v4572(v4606, v4604);
      return v4533(v4605, 0, v4606, 0);
    }
    function v4533(v4607, v4608, v4609, v4610) {
      return v4611(v4607, v4608, v4609, v4610, 32);
    }
    function v4611(v4612, v4613, v4614, v4615, v4616) {
      var v4617;
      var v4618 = 0;
      for (v4617 = 0; v4617 < v4616; ++v4617) {
        v4618 |= v4612[v4613 + v4617] ^ v4614[v4615 + v4617];
      }
      return (v4618 - 1 >>> 8 & 1) - 1;
    }
    function v4573(v4619) {
      var v4620 = new v4420(32);
      v4572(v4620, v4619);
      return v4620[0] & 1;
    }
    function v4531(v4621, v4622, v4623) {
      var v4624;
      var v4625;
      v4591(v4621[0], v4478);
      v4591(v4621[1], v4480);
      v4591(v4621[2], v4480);
      v4591(v4621[3], v4478);
      for (v4625 = 255; v4625 >= 0; --v4625) {
        v4624 = v4623[v4625 / 8 | 0] >> (v4625 & 7) & 1;
        v4560(v4621, v4622, v4624);
        v4532(v4622, v4621);
        v4532(v4621, v4621);
        v4560(v4621, v4622, v4624);
      }
    }
    function v4501(v4626, v4627) {
      var v4628 = [v4479(), v4479(), v4479(), v4479()];
      v4591(v4628[0], v4483);
      v4591(v4628[1], v4484);
      v4591(v4628[2], v4480);
      v4558(v4628[3], v4483, v4484);
      v4531(v4626, v4628, v4627);
    }
    function v4591(v4629, v4630) {
      var v4631;
      for (v4631 = 0; v4631 < 16; v4631++) {
        v4629[v4631] = v4630[v4631] | 0;
      }
    }
    function v4571(v4632, v4633) {
      var v4634 = v4479();
      var v4635;
      for (v4635 = 0; v4635 < 16; ++v4635) {
        v4634[v4635] = v4633[v4635];
      }
      for (v4635 = 253; v4635 >= 0; --v4635) {
        v4593(v4634, v4634);
        if (v4635 !== 2 && v4635 !== 4) {
          v4558(v4634, v4634, v4633);
        }
      }
      for (v4635 = 0; v4635 < 16; ++v4635) {
        v4632[v4635] = v4634[v4635];
      }
    }
    function v4581(v4636) {
      var v4637;
      var v4638;
      var v4639 = 1;
      for (v4637 = 0; v4637 < 16; ++v4637) {
        v4638 = v4636[v4637] + v4639 + 65535;
        v4639 = Math.floor(v4638 / 65536);
        v4636[v4637] = v4638 - v4639 * 65536;
      }
      v4636[0] += v4639 - 1 + (v4639 - 1) * 37;
    }
    function v4565(v4640, v4641, v4642) {
      var v4643;
      var v4644 = ~(v4642 - 1);
      for (var v4645 = 0; v4645 < 16; ++v4645) {
        v4643 = v4644 & (v4640[v4645] ^ v4641[v4645]);
        v4640[v4645] ^= v4643;
        v4641[v4645] ^= v4643;
      }
    }
    function v4479(v4646) {
      var v4647;
      var v4648 = new Float64Array(16);
      if (v4646) {
        for (v4647 = 0; v4647 < v4646.length; ++v4647) {
          v4648[v4647] = v4646[v4647];
        }
      }
      return v4648;
    }
    function v4559(v4649, v4650, v4651) {
      for (var v4652 = 0; v4652 < 16; ++v4652) {
        v4649[v4652] = v4650[v4652] + v4651[v4652];
      }
    }
    function v4557(v4653, v4654, v4655) {
      for (var v4656 = 0; v4656 < 16; ++v4656) {
        v4653[v4656] = v4654[v4656] - v4655[v4656];
      }
    }
    function v4593(v4657, v4658) {
      v4558(v4657, v4658, v4658);
    }
    function v4558(v4659, v4660, v4661) {
      var v4662 = v4413;
      var v4663;
      var v4664;
      var v4665 = 0;
      var v4666 = 0;
      var v4667 = 0;
      var v4668 = 0;
      var v4669 = 0;
      var v4670 = 0;
      var v4671 = 0;
      var v4672 = 0;
      var v4673 = 0;
      var v4674 = 0;
      var v4675 = 0;
      var v4676 = 0;
      var v4677 = 0;
      var v4678 = 0;
      var v4679 = 0;
      var v4680 = 0;
      var v4681 = 0;
      var v4682 = 0;
      var v4683 = 0;
      var v4684 = 0;
      var v4685 = 0;
      var v4686 = 0;
      var v4687 = 0;
      var v4688 = 0;
      var v4689 = 0;
      var v4690 = 0;
      var v4691 = 0;
      var v4692 = 0;
      var v4693 = 0;
      var v4694 = 0;
      var v4695 = 0;
      var v4696 = v4661[0];
      var v4697 = v4661[1];
      var v4698 = v4661[2];
      var v4699 = v4661[3];
      var v4700 = v4661[4];
      var v4701 = v4661[5];
      var v4702 = v4661[6];
      var v4703 = v4661[7];
      var v4704 = v4661[8];
      var v4705 = v4661[9];
      var v4706 = v4661[10];
      var v4707 = v4661[11];
      var v4708 = v4661[12];
      var v4709 = v4661[13];
      var v4710 = v4661[14];
      var v4711 = v4661[15];
      v4663 = v4660[0];
      v4665 += v4663 * v4696;
      v4666 += v4663 * v4697;
      v4667 += v4663 * v4698;
      v4668 += v4663 * v4699;
      v4669 += v4663 * v4700;
      v4670 += v4663 * v4701;
      v4671 += v4663 * v4702;
      v4672 += v4663 * v4703;
      v4673 += v4663 * v4704;
      v4674 += v4663 * v4705;
      v4675 += v4663 * v4706;
      v4676 += v4663 * v4707;
      v4677 += v4663 * v4708;
      v4678 += v4663 * v4709;
      v4679 += v4663 * v4710;
      v4680 += v4663 * v4711;
      v4663 = v4660[1];
      v4666 += v4663 * v4696;
      v4667 += v4663 * v4697;
      v4668 += v4663 * v4698;
      v4669 += v4663 * v4699;
      v4670 += v4663 * v4700;
      v4671 += v4663 * v4701;
      v4672 += v4663 * v4702;
      v4673 += v4663 * v4703;
      v4674 += v4663 * v4704;
      v4675 += v4663 * v4705;
      v4676 += v4663 * v4706;
      v4677 += v4663 * v4707;
      v4678 += v4663 * v4708;
      v4679 += v4663 * v4709;
      v4680 += v4663 * v4710;
      v4681 += v4663 * v4711;
      v4663 = v4660[2];
      v4667 += v4663 * v4696;
      v4668 += v4663 * v4697;
      v4669 += v4663 * v4698;
      v4670 += v4663 * v4699;
      v4671 += v4663 * v4700;
      v4672 += v4663 * v4701;
      v4673 += v4663 * v4702;
      v4674 += v4663 * v4703;
      v4675 += v4663 * v4704;
      v4676 += v4663 * v4705;
      v4677 += v4663 * v4706;
      v4678 += v4663 * v4707;
      v4679 += v4663 * v4708;
      v4680 += v4663 * v4709;
      v4681 += v4663 * v4710;
      v4682 += v4663 * v4711;
      v4663 = v4660[3];
      v4668 += v4663 * v4696;
      v4669 += v4663 * v4697;
      v4670 += v4663 * v4698;
      v4671 += v4663 * v4699;
      v4672 += v4663 * v4700;
      v4673 += v4663 * v4701;
      v4674 += v4663 * v4702;
      v4675 += v4663 * v4703;
      v4676 += v4663 * v4704;
      v4677 += v4663 * v4705;
      v4678 += v4663 * v4706;
      v4679 += v4663 * v4707;
      v4680 += v4663 * v4708;
      v4681 += v4663 * v4709;
      v4682 += v4663 * v4710;
      v4683 += v4663 * v4711;
      v4663 = v4660[4];
      v4669 += v4663 * v4696;
      v4670 += v4663 * v4697;
      v4671 += v4663 * v4698;
      v4672 += v4663 * v4699;
      v4673 += v4663 * v4700;
      v4674 += v4663 * v4701;
      v4675 += v4663 * v4702;
      v4676 += v4663 * v4703;
      v4677 += v4663 * v4704;
      v4678 += v4663 * v4705;
      v4679 += v4663 * v4706;
      v4680 += v4663 * v4707;
      v4681 += v4663 * v4708;
      v4682 += v4663 * v4709;
      v4683 += v4663 * v4710;
      v4684 += v4663 * v4711;
      v4663 = v4660[5];
      v4670 += v4663 * v4696;
      v4671 += v4663 * v4697;
      v4672 += v4663 * v4698;
      v4673 += v4663 * v4699;
      v4674 += v4663 * v4700;
      v4675 += v4663 * v4701;
      v4676 += v4663 * v4702;
      v4677 += v4663 * v4703;
      v4678 += v4663 * v4704;
      v4679 += v4663 * v4705;
      v4680 += v4663 * v4706;
      v4681 += v4663 * v4707;
      v4682 += v4663 * v4708;
      v4683 += v4663 * v4709;
      v4684 += v4663 * v4710;
      v4685 += v4663 * v4711;
      v4663 = v4660[6];
      v4671 += v4663 * v4696;
      v4672 += v4663 * v4697;
      v4673 += v4663 * v4698;
      v4674 += v4663 * v4699;
      v4675 += v4663 * v4700;
      v4676 += v4663 * v4701;
      v4677 += v4663 * v4702;
      v4678 += v4663 * v4703;
      v4679 += v4663 * v4704;
      v4680 += v4663 * v4705;
      v4681 += v4663 * v4706;
      v4682 += v4663 * v4707;
      v4683 += v4663 * v4708;
      v4684 += v4663 * v4709;
      v4685 += v4663 * v4710;
      v4686 += v4663 * v4711;
      v4663 = v4660[7];
      v4672 += v4663 * v4696;
      v4673 += v4663 * v4697;
      v4674 += v4663 * v4698;
      v4675 += v4663 * v4699;
      v4676 += v4663 * v4700;
      v4677 += v4663 * v4701;
      v4678 += v4663 * v4702;
      v4679 += v4663 * v4703;
      v4680 += v4663 * v4704;
      v4681 += v4663 * v4705;
      v4682 += v4663 * v4706;
      v4683 += v4663 * v4707;
      v4684 += v4663 * v4708;
      v4685 += v4663 * v4709;
      v4686 += v4663 * v4710;
      v4687 += v4663 * v4711;
      v4663 = v4660[8];
      v4673 += v4663 * v4696;
      v4674 += v4663 * v4697;
      v4675 += v4663 * v4698;
      v4676 += v4663 * v4699;
      v4677 += v4663 * v4700;
      v4678 += v4663 * v4701;
      v4679 += v4663 * v4702;
      v4680 += v4663 * v4703;
      v4681 += v4663 * v4704;
      v4682 += v4663 * v4705;
      v4683 += v4663 * v4706;
      v4684 += v4663 * v4707;
      v4685 += v4663 * v4708;
      v4686 += v4663 * v4709;
      v4687 += v4663 * v4710;
      v4688 += v4663 * v4711;
      v4663 = v4660[9];
      v4674 += v4663 * v4696;
      v4675 += v4663 * v4697;
      v4676 += v4663 * v4698;
      v4677 += v4663 * v4699;
      v4678 += v4663 * v4700;
      v4679 += v4663 * v4701;
      v4680 += v4663 * v4702;
      v4681 += v4663 * v4703;
      v4682 += v4663 * v4704;
      v4683 += v4663 * v4705;
      v4684 += v4663 * v4706;
      v4685 += v4663 * v4707;
      v4686 += v4663 * v4708;
      v4687 += v4663 * v4709;
      v4688 += v4663 * v4710;
      v4689 += v4663 * v4711;
      v4663 = v4660[10];
      v4675 += v4663 * v4696;
      v4676 += v4663 * v4697;
      v4677 += v4663 * v4698;
      v4678 += v4663 * v4699;
      v4679 += v4663 * v4700;
      v4680 += v4663 * v4701;
      v4681 += v4663 * v4702;
      v4682 += v4663 * v4703;
      v4683 += v4663 * v4704;
      v4684 += v4663 * v4705;
      v4685 += v4663 * v4706;
      v4686 += v4663 * v4707;
      v4687 += v4663 * v4708;
      v4688 += v4663 * v4709;
      v4689 += v4663 * v4710;
      v4690 += v4663 * v4711;
      v4663 = v4660[11];
      v4676 += v4663 * v4696;
      v4677 += v4663 * v4697;
      v4678 += v4663 * v4698;
      v4679 += v4663 * v4699;
      v4680 += v4663 * v4700;
      v4681 += v4663 * v4701;
      v4682 += v4663 * v4702;
      v4683 += v4663 * v4703;
      v4684 += v4663 * v4704;
      v4685 += v4663 * v4705;
      v4686 += v4663 * v4706;
      v4687 += v4663 * v4707;
      v4688 += v4663 * v4708;
      v4689 += v4663 * v4709;
      v4690 += v4663 * v4710;
      v4691 += v4663 * v4711;
      v4663 = v4660[12];
      v4677 += v4663 * v4696;
      v4678 += v4663 * v4697;
      v4679 += v4663 * v4698;
      v4680 += v4663 * v4699;
      v4681 += v4663 * v4700;
      v4682 += v4663 * v4701;
      v4683 += v4663 * v4702;
      v4684 += v4663 * v4703;
      v4685 += v4663 * v4704;
      v4686 += v4663 * v4705;
      v4687 += v4663 * v4706;
      v4688 += v4663 * v4707;
      v4689 += v4663 * v4708;
      v4690 += v4663 * v4709;
      v4691 += v4663 * v4710;
      v4692 += v4663 * v4711;
      v4663 = v4660[13];
      v4678 += v4663 * v4696;
      v4679 += v4663 * v4697;
      v4680 += v4663 * v4698;
      v4681 += v4663 * v4699;
      v4682 += v4663 * v4700;
      v4683 += v4663 * v4701;
      v4684 += v4663 * v4702;
      v4685 += v4663 * v4703;
      v4686 += v4663 * v4704;
      v4687 += v4663 * v4705;
      v4688 += v4663 * v4706;
      v4689 += v4663 * v4707;
      v4690 += v4663 * v4708;
      v4691 += v4663 * v4709;
      v4692 += v4663 * v4710;
      v4693 += v4663 * v4711;
      v4663 = v4660[14];
      v4679 += v4663 * v4696;
      v4680 += v4663 * v4697;
      v4681 += v4663 * v4698;
      v4682 += v4663 * v4699;
      v4683 += v4663 * v4700;
      v4684 += v4663 * v4701;
      v4685 += v4663 * v4702;
      v4686 += v4663 * v4703;
      v4687 += v4663 * v4704;
      v4688 += v4663 * v4705;
      v4689 += v4663 * v4706;
      v4690 += v4663 * v4707;
      v4691 += v4663 * v4708;
      v4692 += v4663 * v4709;
      v4693 += v4663 * v4710;
      v4694 += v4663 * v4711;
      v4663 = v4660[15];
      v4680 += v4663 * v4696;
      v4681 += v4663 * v4697;
      v4682 += v4663 * v4698;
      v4683 += v4663 * v4699;
      v4684 += v4663 * v4700;
      v4685 += v4663 * v4701;
      v4686 += v4663 * v4702;
      v4687 += v4663 * v4703;
      v4688 += v4663 * v4704;
      v4689 += v4663 * v4705;
      v4690 += v4663 * v4706;
      v4691 += v4663 * v4707;
      v4692 += v4663 * v4708;
      v4693 += v4663 * v4709;
      v4694 += v4663 * v4710;
      v4695 += v4663 * v4711;
      v4665 += v4681 * 38;
      v4666 += v4682 * 38;
      v4667 += v4683 * 38;
      v4668 += v4684 * 38;
      v4669 += v4685 * 38;
      v4670 += v4686 * 38;
      v4671 += v4687 * 38;
      v4672 += v4688 * 38;
      v4673 += v4689 * 38;
      v4674 += v4690 * 38;
      v4675 += v4691 * 38;
      v4676 += v4692 * 38;
      v4677 += v4693 * 38;
      v4678 += v4694 * 38;
      v4679 += v4695 * 38;
      v4664 = 1;
      v4663 = v4665 + v4664 + 65535;
      v4664 = Math.floor(v4663 / 65536);
      v4665 = v4663 - v4664 * 65536;
      v4663 = v4666 + v4664 + 65535;
      v4664 = Math.floor(v4663 / 65536);
      v4666 = v4663 - v4664 * 65536;
      v4663 = v4667 + v4664 + 65535;
      v4664 = Math.floor(v4663 / 65536);
      v4667 = v4663 - v4664 * 65536;
      v4663 = v4668 + v4664 + 65535;
      v4664 = Math.floor(v4663 / 65536);
      v4668 = v4663 - v4664 * 65536;
      v4663 = v4669 + v4664 + 65535;
      v4664 = Math.floor(v4663 / 65536);
      v4669 = v4663 - v4664 * 65536;
      v4663 = v4670 + v4664 + 65535;
      v4664 = Math.floor(v4663 / 65536);
      v4670 = v4663 - v4664 * 65536;
      v4663 = v4671 + v4664 + 65535;
      v4664 = Math.floor(v4663 / 65536);
      v4671 = v4663 - v4664 * 65536;
      v4663 = v4672 + v4664 + 65535;
      v4664 = Math.floor(v4663 / 65536);
      v4672 = v4663 - v4664 * 65536;
      v4663 = v4673 + v4664 + 65535;
      v4664 = Math.floor(v4663 / 65536);
      v4673 = v4663 - v4664 * 65536;
      v4663 = v4674 + v4664 + 65535;
      v4664 = Math.floor(v4663 / 65536);
      v4674 = v4663 - v4664 * 65536;
      v4663 = v4675 + v4664 + 65535;
      v4664 = Math.floor(v4663 / 65536);
      v4675 = v4663 - v4664 * 65536;
      v4663 = v4676 + v4664 + 65535;
      v4664 = Math.floor(v4663 / 65536);
      v4676 = v4663 - v4664 * 65536;
      v4663 = v4677 + v4664 + 65535;
      v4664 = Math.floor(v4663 / 65536);
      v4677 = v4663 - v4664 * 65536;
      v4663 = v4678 + v4664 + 65535;
      v4664 = Math.floor(v4663 / 65536);
      v4678 = v4663 - v4664 * 65536;
      v4663 = v4679 + v4664 + 65535;
      v4664 = Math.floor(v4663 / 65536);
      v4679 = v4663 - v4664 * 65536;
      v4663 = v4680 + v4664 + 65535;
      v4664 = Math.floor(v4663 / 65536);
      v4680 = v4663 - v4664 * 65536;
      v4665 += v4664 - 1 + (v4664 - 1) * 37;
      v4664 = 1;
      v4663 = v4665 + v4664 + 65535;
      v4664 = Math.floor(v4663 / 65536);
      v4665 = v4663 - v4664 * 65536;
      v4663 = v4666 + v4664 + 65535;
      v4664 = Math.floor(v4663 / 65536);
      v4666 = v4663 - v4664 * 65536;
      v4663 = v4667 + v4664 + 65535;
      v4664 = Math.floor(v4663 / 65536);
      v4667 = v4663 - v4664 * 65536;
      v4663 = v4668 + v4664 + 65535;
      v4664 = Math.floor(v4663 / 65536);
      v4668 = v4663 - v4664 * 65536;
      v4663 = v4669 + v4664 + 65535;
      v4664 = Math.floor(v4663 / 65536);
      v4669 = v4663 - v4664 * 65536;
      v4663 = v4670 + v4664 + 65535;
      v4664 = Math.floor(v4663 / 65536);
      v4670 = v4663 - v4664 * 65536;
      v4663 = v4671 + v4664 + 65535;
      v4664 = Math.floor(v4663 / 65536);
      v4671 = v4663 - v4664 * 65536;
      v4663 = v4672 + v4664 + 65535;
      v4664 = Math.floor(v4663 / 65536);
      v4672 = v4663 - v4664 * 65536;
      v4663 = v4673 + v4664 + 65535;
      v4664 = Math.floor(v4663 / 65536);
      v4673 = v4663 - v4664 * 65536;
      v4663 = v4674 + v4664 + 65535;
      v4664 = Math.floor(v4663 / 65536);
      v4674 = v4663 - v4664 * 65536;
      v4663 = v4675 + v4664 + 65535;
      v4664 = Math.floor(v4663 / 65536);
      v4675 = v4663 - v4664 * 65536;
      v4663 = v4676 + v4664 + 65535;
      v4664 = Math.floor(v4663 / 65536);
      v4676 = v4663 - v4664 * 65536;
      v4663 = v4677 + v4664 + 65535;
      v4664 = Math.floor(v4663 / 65536);
      v4677 = v4663 - v4664 * 65536;
      v4663 = v4678 + v4664 + 65535;
      v4664 = Math.floor(v4663 / 65536);
      v4678 = v4663 - v4664 * 65536;
      v4663 = v4679 + v4664 + 65535;
      v4664 = Math.floor(v4663 / 65536);
      v4679 = v4663 - v4664 * 65536;
      v4663 = v4680 + v4664 + 65535;
      v4664 = Math.floor(v4663 / 65536);
      v4680 = v4663 - v4664 * 65536;
      v4665 += v4664 - 1 + (v4664 - 1) * 37;
      v4659[0] = v4665;
      v4659[1] = v4666;
      v4659[2] = v4667;
      v4659[3] = v4668;
      v4659[4] = v4669;
      v4659[5] = v4670;
      v4659[6] = v4671;
      v4659[7] = v4672;
      v4659[8] = v4673;
      v4659[9] = v4674;
      v4659[10] = v4675;
      v4659[11] = v4676;
      v4659[12] = v4677;
      v4659[13] = v4678;
      v4659[14] = v4679;
      v4659[15] = v4680;
    }
  }
});
var require_kem = __commonJS({
  "node_modules/node-forge/lib/kem.js"(v4712, v4713) {
    var v4714 = {
      dh2487: 891,
      dh2488: 577,
      dh2489: 235,
      dh2490: 1481
    };
    var v4715 = {
      dh2491: 1195
    };
    var v4716 = {
      dh2492: 480
    };
    var v4717 = {
      dh2493: 480
    };
    var v4718 = {
      dh2494: 214,
      dh2495: 857,
      dh2496: 322
    };
    var v4719 = v2;
    var v4720 = require_forge();
    require_util();
    require_random();
    require_jsbn();
    v4713.exports = v4720.kem = v4720.kem || {};
    var v4721 = v4720.jsbn.BigInteger;
    v4720.kem.rsa = {};
    v4720.kem.rsa.create = function (v4722, v4723) {
      var v4724 = v4719;
      v4723 = v4723 || {};
      var v4725 = v4723.prng || v4720.random;
      var v4726 = {};
      v4726.encrypt = function (v4727, v4728) {
        var v4729 = v4724;
        var v4730 = Math.ceil(v4727.n.bitLength() / 8);
        var v4731;
        do {
          v4731 = new v4721(v4720.util.bytesToHex(v4725.getBytesSync(v4730)), 16).mod(v4727.n);
        } while (v4731.compareTo(v4721.ONE) <= 0);
        v4731 = v4720.util.hexToBytes(v4731.toString(16));
        var v4732 = v4730 - v4731.length;
        if (v4732 > 0) {
          v4731 = v4720.util.fillString(String.fromCharCode(0), v4732) + v4731;
        }
        var v4733 = v4727.encrypt(v4731, "NONE");
        var v4734 = v4722.generate(v4731, v4728);
        return {
          encapsulation: v4733,
          key: v4734
        };
      };
      v4726.decrypt = function (v4735, v4736, v4737) {
        var v4738 = v4724;
        var v4739 = v4735.decrypt(v4736, "NONE");
        return v4722.generate(v4739, v4737);
      };
      return v4726;
    };
    v4720.kem.kdf1 = function (v4740, v4741) {
      v4742(this, v4740, 0, v4741 || v4740.digestLength);
    };
    v4720.kem.kdf2 = function (v4743, v4744) {
      var v4745 = v4719;
      v4742(this, v4743, 1, v4744 || v4743.digestLength);
    };
    function v4742(v4746, v4747, v4748, v4749) {
      var v4750 = {
        dh2497: 764,
        dh2498: 931
      };
      v4746.generate = function (v4751, v4752) {
        var v4753 = v1;
        var v4754 = new v4720.util.ByteBuffer();
        var v4755 = Math.ceil(v4752 / v4749) + v4748;
        var v4756 = new v4720.util.ByteBuffer();
        for (var v4757 = v4748; v4757 < v4755; ++v4757) {
          v4756.putInt32(v4757);
          v4747.start();
          v4747.update(v4751 + v4756.getBytes());
          var v4758 = v4747.digest();
          v4754.putBytes(v4758.getBytes(v4749));
        }
        v4754.truncate(v4754.length() - v4752);
        return v4754.getBytes();
      };
    }
  }
});
var require_log = __commonJS({
  "node_modules/node-forge/lib/log.js"(v4759, v4760) {
    var v4761 = {
      dh2499: 839,
      dh2500: 308,
      dh2501: 586,
      dh2502: 703,
      dh2503: 557,
      dh2504: 952,
      dh2505: 765,
      dh2506: 857,
      dh2507: 1342,
      dh2508: 586,
      dh2509: 952,
      dh2510: 1342,
      dh2511: 337,
      dh2512: 837,
      dh2513: 496,
      dh2514: 1400,
      dh2515: 872
    };
    var v4762 = {
      dh2516: 952,
      dh2517: 314,
      dh2518: 560
    };
    var v4763 = {
      dh2519: 897,
      dh2520: 684
    };
    var v4764 = {
      dh2521: 952
    };
    var v4765 = {
      dh2522: 703,
      dh2523: 857
    };
    var v4766 = {
      dh2524: 1519
    };
    var v4767 = {
      dh2525: 952
    };
    var v4768 = {
      dh2526: 478,
      dh2527: 1388
    };
    var v4769 = {
      dh2528: 557,
      dh2529: 560
    };
    var v4770 = {
      dh2530: 619,
      dh2531: 684
    };
    var v4771 = {
      dh2532: 1482
    };
    var v4772 = {
      dh2533: 952,
      dh2534: 686,
      dh2535: 897
    };
    var v4773 = v2;
    var v4774 = require_forge();
    require_util();
    v4760.exports = v4774.log = v4774.log || {};
    v4774.log.levels = ["none", "error", "warning", "info", "debug", "verbose", "max"];
    var v4775 = {};
    var v4776 = [];
    var v4777 = null;
    v4774.log.LEVEL_LOCKED = 2;
    v4774.log.NO_LEVEL_CHECK = 4;
    v4774.log.INTERPOLATE = 8;
    for (v4778 = 0; v4778 < v4774.log.levels.length; ++v4778) {
      v4779 = v4774.log.levels[v4778];
      v4775[v4779] = {
        index: v4778,
        name: v4779.toUpperCase()
      };
    }
    var v4779;
    var v4778;
    v4774.log.logMessage = function (v4780) {
      var v4781 = v4773;
      var v4782 = v4775[v4780.level].index;
      for (var v4783 = 0; v4783 < v4776.length; ++v4783) {
        var v4784 = v4776[v4783];
        if (v4784.flags & v4774.log.NO_LEVEL_CHECK) {
          v4784.f(v4780);
        } else {
          var v4785 = v4775[v4784.level].index;
          if (v4782 <= v4785) {
            v4784.f(v4784, v4780);
          }
        }
      }
    };
    v4774.log.prepareStandard = function (v4786) {
      var v4787 = v4773;
      if (!("standard" in v4786)) {
        v4786.standard = v4775[v4786.level].name + " [" + v4786.category + "] " + v4786.message;
      }
    };
    v4774.log.prepareFull = function (v4788) {
      var v4789 = v4773;
      if (!("full" in v4788)) {
        var v4790 = [v4788.message];
        v4790 = v4790.concat([]);
        v4788.full = v4774.util.format.apply(this, v4790);
      }
    };
    v4774.log.prepareStandardFull = function (v4791) {
      var v4792 = v4773;
      if (!("standardFull" in v4791)) {
        v4774.log.prepareStandard(v4791);
        v4791.standardFull = v4791.standard;
      }
    };
    if (true) {
      v4793 = ["error", "warning", "info", "debug", "verbose"];
      for (v4778 = 0; v4778 < v4793.length; ++v4778) {
        (function (v4794) {
          var v4795 = v4773;
          v4774.log[v4794] = function (v4796, v4797) {
            var v4798 = v4795;
            var v4799 = Array.prototype.slice.call(arguments).slice(2);
            var v4800 = {
              timestamp: new Date(),
              level: v4794,
              category: v4796,
              message: v4797,
              arguments: v4799
            };
            v4774.log.logMessage(v4800);
          };
        })(v4793[v4778]);
      }
    }
    var v4793;
    var v4778;
    v4774.log.makeLogger = function (v4801) {
      var v4802 = v4773;
      var v4803 = {
        flags: 0,
        f: v4801
      };
      v4774.log.setLevel(v4803, "none");
      return v4803;
    };
    v4774.log.setLevel = function (v4804, v4805) {
      var v4806 = v4773;
      var v4807 = false;
      if (v4804 && !(v4804.flags & v4774.log.LEVEL_LOCKED)) {
        for (var v4808 = 0; v4808 < v4774.log.levels.length; ++v4808) {
          var v4809 = v4774.log.levels[v4808];
          if (v4805 == v4809) {
            v4804.level = v4805;
            v4807 = true;
            break;
          }
        }
      }
      return v4807;
    };
    v4774.log.lock = function (v4810, v4811) {
      var v4812 = v4773;
      if (typeof v4811 === "undefined" || v4811) {
        v4810.flags |= v4774.log.LEVEL_LOCKED;
      } else {
        v4810.flags &= ~v4774.log.LEVEL_LOCKED;
      }
    };
    v4774.log.addLogger = function (v4813) {
      v4776.push(v4813);
    };
    if (typeof console !== "undefined" && "log" in console) {
      if (console.error && console.warn && console.info && console.debug) {
        v4814 = {
          error: console.error,
          warning: console.warn,
          info: console.info,
          debug: console.debug,
          verbose: console.debug
        };
        v4815 = function (v4816, v4817) {
          var v4818 = v4773;
          v4774.log.prepareStandard(v4817);
          var v4819 = v4814[v4817.level];
          var v4820 = [v4817.standard];
          v4820 = v4820.concat(v4817.arguments.slice());
          v4819.apply(console, v4820);
        };
        v4821 = v4774.log.makeLogger(v4815);
      } else {
        v4815 = function (v4822, v4823) {
          var v4824 = v4773;
          v4774.log.prepareStandardFull(v4823);
          console.log(v4823.standardFull);
        };
        v4821 = v4774.log.makeLogger(v4815);
      }
      v4774.log.setLevel(v4821, "debug");
      v4774.log.addLogger(v4821);
      v4777 = v4821;
    } else {
      console = {
        log: function () {}
      };
    }
    var v4821;
    var v4814;
    var v4815;
    if (v4777 !== null && typeof window !== "undefined" && window.location) {
      v4825 = new URL(window.location.href).searchParams;
      if (v4825.has("console.level")) {
        v4774.log.setLevel(v4777, v4825.get("console.level").slice(-1)[0]);
      }
      if (v4825.has("console.lock")) {
        v4826 = v4825.get("console.lock").slice(-1)[0];
        if (v4826 == "true") {
          v4774.log.lock(v4777);
        }
      }
    }
    var v4825;
    var v4826;
    v4774.log.consoleLogger = v4777;
  }
});
var require_md_all = __commonJS({
  "node_modules/node-forge/lib/md.all.js"(v4827, v4828) {
    var v4829 = {
      dh2536: 891
    };
    var v4830 = v2;
    v4828.exports = require_md();
    require_md5();
    require_sha1();
    require_sha256();
    require_sha512();
  }
});
var require_pkcs7 = __commonJS({
  "node_modules/node-forge/lib/pkcs7.js"(v4831, v4832) {
    var v4833 = {
      dh2537: 400,
      dh2538: 302
    };
    var v4834 = {
      dh2539: 880,
      dh2540: 1358,
      dh2541: 1171,
      dh2542: 472,
      dh2543: 1358,
      dh2544: 1105,
      dh2545: 985,
      dh2546: 1360,
      dh2547: 623
    };
    var v4835 = {
      dh2548: 222,
      dh2549: 1250,
      dh2550: 619,
      dh2551: 1425,
      dh2552: 1027,
      dh2553: 1231,
      dh2554: 619,
      dh2555: 1508,
      dh2556: 619,
      dh2557: 1360,
      dh2558: 271
    };
    var v4836 = {
      dh2559: 1144,
      dh2560: 1495,
      dh2561: 985,
      dh2562: 497,
      dh2563: 1025,
      dh2564: 1027
    };
    var v4837 = {
      dh2565: 880,
      dh2566: 1045,
      dh2567: 1027,
      dh2568: 1358,
      dh2569: 1144,
      dh2570: 1210,
      dh2571: 597,
      dh2572: 880,
      dh2573: 1358,
      dh2574: 1280,
      dh2575: 1054,
      dh2576: 254,
      dh2577: 1439,
      dh2578: 1076,
      dh2579: 738
    };
    var v4838 = {
      dh2580: 738,
      dh2581: 1027,
      dh2582: 682,
      dh2583: 873,
      dh2584: 738,
      dh2585: 1144,
      dh2586: 1041,
      dh2587: 1027,
      dh2588: 1045,
      dh2589: 1027,
      dh2590: 458,
      dh2591: 1231,
      dh2592: 531,
      dh2593: 1144,
      dh2594: 785,
      dh2595: 746,
      dh2596: 1025,
      dh2597: 531,
      dh2598: 499,
      dh2599: 370
    };
    var v4839 = {
      dh2600: 738,
      dh2601: 1144,
      dh2602: 1045,
      dh2603: 271,
      dh2604: 404,
      dh2605: 581,
      dh2606: 738,
      dh2607: 1495,
      dh2608: 458,
      dh2609: 1210,
      dh2610: 1360
    };
    var v4840 = {
      dh2611: 683,
      dh2612: 1177,
      dh2613: 548,
      dh2614: 321,
      dh2615: 646
    };
    var v4841 = {
      dh2616: 647
    };
    var v4842 = {
      dh2617: 985,
      dh2618: 880,
      dh2619: 1039,
      dh2620: 1454,
      dh2621: 472,
      dh2622: 1171,
      dh2623: 1358,
      dh2624: 408,
      dh2625: 768,
      dh2626: 1425,
      dh2627: 931,
      dh2628: 1360,
      dh2629: 623,
      dh2630: 1358,
      dh2631: 1530,
      dh2632: 1425,
      dh2633: 1425
    };
    var v4843 = {
      dh2634: 880,
      dh2635: 480,
      dh2636: 1425,
      dh2637: 307,
      dh2638: 985
    };
    var v4844 = {
      dh2639: 738,
      dh2640: 1144,
      dh2641: 884,
      dh2642: 597,
      dh2643: 1045,
      dh2644: 738,
      dh2645: 1144,
      dh2646: 494,
      dh2647: 536,
      dh2648: 1027
    };
    var v4845 = {
      dh2649: 400,
      dh2650: 1427,
      dh2651: 536,
      dh2652: 1231
    };
    var v4846 = {
      dh2653: 1159
    };
    var v4847 = {
      dh2654: 1404,
      dh2655: 880,
      dh2656: 1358,
      dh2657: 559,
      dh2658: 1027,
      dh2659: 1144,
      dh2660: 1045
    };
    var v4848 = {
      dh2661: 994
    };
    var v4849 = {
      dh2662: 880,
      dh2663: 510
    };
    var v4850 = {
      dh2664: 338,
      dh2665: 1301,
      dh2666: 1144,
      dh2667: 785,
      dh2668: 738,
      dh2669: 1358,
      dh2670: 1025,
      dh2671: 1360,
      dh2672: 277,
      dh2673: 732,
      dh2674: 1301,
      dh2675: 531,
      dh2676: 1027
    };
    var v4851 = {
      dh2677: 857,
      dh2678: 1144,
      dh2679: 682,
      dh2680: 738,
      dh2681: 494,
      dh2682: 1231,
      dh2683: 306,
      dh2684: 531,
      dh2685: 1045,
      dh2686: 1144
    };
    var v4852 = {
      dh2687: 559,
      dh2688: 1186,
      dh2689: 510,
      dh2690: 1231,
      dh2691: 531,
      dh2692: 436
    };
    var v4853 = {
      dh2693: 1250,
      dh2694: 647,
      dh2695: 880,
      dh2696: 1358,
      dh2697: 1119
    };
    var v4854 = {
      dh2698: 845,
      dh2699: 297
    };
    var v4855 = {
      dh2700: 313
    };
    var v4856 = v2;
    var v4857 = require_forge();
    require_aes();
    require_asn1();
    require_des();
    require_oids();
    require_pem();
    require_pkcs7asn1();
    require_random();
    require_util();
    require_x509();
    var v4858 = v4857.asn1;
    var v4859 = v4832.exports = v4857.pkcs7 = v4857.pkcs7 || {};
    v4859.messageFromPem = function (v4860) {
      var v4861 = v4856;
      var v4862 = v4857.pem.decode(v4860)[0];
      if (v4862.type !== "PKCS7") {
        var v4863 = new Error("Could not convert PKCS#7 message from PEM; PEM header type is not \"PKCS#7\".");
        v4863.headerType = v4862.type;
        throw v4863;
      }
      if (v4862.procType && v4862.procType.type === "ENCRYPTED") {
        throw new Error("Could not convert PKCS#7 message from PEM; PEM is encrypted.");
      }
      var v4864 = v4858.fromDer(v4862.body);
      return v4859.messageFromAsn1(v4864);
    };
    v4859.messageToPem = function (v4865, v4866) {
      var v4867 = v4856;
      var v4868 = {
        type: "PKCS7",
        body: v4858.toDer(v4865.toAsn1()).getBytes()
      };
      return v4857.pem.encode(v4868, {
        maxline: v4866
      });
    };
    v4859.messageFromAsn1 = function (v4869) {
      var v4870 = v4856;
      var v4871 = {};
      var v4872 = [];
      if (!v4858.validate(v4869, v4859.asn1.contentInfoValidator, v4871, v4872)) {
        var v4873 = new Error("Cannot read PKCS#7 message. ASN.1 object is not an PKCS#7 ContentInfo.");
        v4873.errors = v4872;
        throw v4873;
      }
      var v4874 = v4858.derToOid(v4871.contentType);
      var v4875;
      switch (v4874) {
        case v4857.pki.oids.envelopedData:
          v4875 = v4859.createEnvelopedData();
          break;
        case v4857.pki.oids.encryptedData:
          v4875 = v4859.createEncryptedData();
          break;
        case v4857.pki.oids.signedData:
          v4875 = v4859.createSignedData();
          break;
        default:
          throw new Error("Cannot read PKCS#7 message. ContentType with OID " + v4874 + " is not (yet) supported.");
      }
      v4875.fromAsn1(v4871.content.value[0]);
      return v4875;
    };
    v4859.createSignedData = function () {
      var v4876 = {
        dh2701: 1250,
        dh2702: 1231,
        dh2703: 931,
        dh2704: 939,
        dh2705: 1151,
        dh2706: 1243,
        dh2707: 1077,
        dh2708: 597,
        dh2709: 880,
        dh2710: 1280,
        dh2711: 499,
        dh2712: 291
      };
      var v4877 = {
        dh2713: 1020,
        dh2714: 880,
        dh2715: 888,
        dh2716: 1358,
        dh2717: 1040,
        dh2718: 1138,
        dh2719: 1310,
        dh2720: 1358,
        dh2721: 531,
        dh2722: 1545
      };
      var v4878 = v4856;
      var v4879 = null;
      v4879 = {
        type: v4857.pki.oids.signedData,
        version: 1,
        certificates: [],
        crls: [],
        signers: [],
        digestAlgorithmIdentifiers: [],
        contentInfo: null,
        signerInfos: [],
        fromAsn1: function (v4880) {
          var v4881 = v4878;
          v4882(v4879, v4880, v4859.asn1.signedDataValidator);
          v4879.certificates = [];
          v4879.crls = [];
          v4879.digestAlgorithmIdentifiers = [];
          v4879.contentInfo = null;
          v4879.signerInfos = [];
          if (v4879.rawCapture.certificates) {
            var v4883 = v4879.rawCapture.certificates.value;
            for (var v4884 = 0; v4884 < v4883.length; ++v4884) {
              v4879.certificates.push(v4857.pki.certificateFromAsn1(v4883[v4884]));
            }
          }
        },
        toAsn1: function () {
          var v4885 = v4878;
          if (!v4879.contentInfo) {
            v4879.sign();
          }
          var v4886 = [];
          for (var v4887 = 0; v4887 < v4879.certificates.length; ++v4887) {
            v4886.push(v4857.pki.certificateToAsn1(v4879.certificates[v4887]));
          }
          var v4888 = [];
          var v4889 = v4858.create(v4858.Class.CONTEXT_SPECIFIC, 0, true, [v4858.create(v4858.Class.UNIVERSAL, v4858.Type.SEQUENCE, true, [v4858.create(v4858.Class.UNIVERSAL, v4858.Type.INTEGER, false, v4858.integerToDer(v4879.version).getBytes()), v4858.create(v4858.Class.UNIVERSAL, v4858.Type.SET, true, v4879.digestAlgorithmIdentifiers), v4879.contentInfo])]);
          if (v4886.length > 0) {
            v4889.value[0].value.push(v4858.create(v4858.Class.CONTEXT_SPECIFIC, 0, true, v4886));
          }
          if (v4888.length > 0) {
            v4889.value[0].value.push(v4858.create(v4858.Class.CONTEXT_SPECIFIC, 1, true, v4888));
          }
          v4889.value[0].value.push(v4858.create(v4858.Class.UNIVERSAL, v4858.Type.SET, true, v4879.signerInfos));
          return v4858.create(v4858.Class.UNIVERSAL, v4858.Type.SEQUENCE, true, [v4858.create(v4858.Class.UNIVERSAL, v4858.Type.OID, false, v4858.oidToDer(v4879.type).getBytes()), v4889]);
        },
        addSigner: function (v4890) {
          var v4891 = v4878;
          var v4892 = v4890.issuer;
          var v4893 = v4890.serialNumber;
          if (v4890.certificate) {
            var v4894 = v4890.certificate;
            if (typeof v4894 === "string") {
              v4894 = v4857.pki.certificateFromPem(v4894);
            }
            v4892 = v4894.issuer.attributes;
            v4893 = v4894.serialNumber;
          }
          var v4895 = v4890.key;
          if (!v4895) {
            throw new Error("Could not add PKCS#7 signer; no private key specified.");
          }
          if (typeof v4895 === "string") {
            v4895 = v4857.pki.privateKeyFromPem(v4895);
          }
          var v4896 = v4890.digestAlgorithm || v4857.pki.oids.sha1;
          switch (v4896) {
            case v4857.pki.oids.sha1:
            case v4857.pki.oids.sha256:
            case v4857.pki.oids.sha384:
            case v4857.pki.oids.sha512:
            case v4857.pki.oids.md5:
              break;
            default:
              throw new Error("Could not add PKCS#7 signer; unknown message digest algorithm: " + v4896);
          }
          var v4897 = v4890.authenticatedAttributes || [];
          if (v4897.length > 0) {
            var v4898 = false;
            var v4899 = false;
            for (var v4900 = 0; v4900 < v4897.length; ++v4900) {
              var v4901 = v4897[v4900];
              if (!v4898 && v4901.type === v4857.pki.oids.contentType) {
                v4898 = true;
                if (v4899) {
                  break;
                }
                continue;
              }
              if (!v4899 && v4901.type === v4857.pki.oids.messageDigest) {
                v4899 = true;
                if (v4898) {
                  break;
                }
                continue;
              }
            }
            if (!v4898 || !v4899) {
              throw new Error("Invalid signer.authenticatedAttributes. If signer.authenticatedAttributes is specified, then it must contain at least two attributes, PKCS #9 content-type and PKCS #9 message-digest.");
            }
          }
          v4879.signers.push({
            key: v4895,
            version: 1,
            issuer: v4892,
            serialNumber: v4893,
            digestAlgorithm: v4896,
            signatureAlgorithm: v4857.pki.oids.rsaEncryption,
            signature: null,
            authenticatedAttributes: v4897,
            unauthenticatedAttributes: []
          });
        },
        sign: function (v4902) {
          var v4903 = v4878;
          v4902 = v4902 || {};
          if (typeof v4879.content !== "object" || v4879.contentInfo === null) {
            v4879.contentInfo = v4858.create(v4858.Class.UNIVERSAL, v4858.Type.SEQUENCE, true, [v4858.create(v4858.Class.UNIVERSAL, v4858.Type.OID, false, v4858.oidToDer(v4857.pki.oids.data).getBytes())]);
            if ("content" in v4879) {
              var v4904;
              if (v4879.content instanceof v4857.util.ByteBuffer) {
                v4904 = v4879.content.bytes();
              } else if (typeof v4879.content === "string") {
                v4904 = v4857.util.encodeUtf8(v4879.content);
              }
              if (v4902.detached) {
                v4879.detachedContent = v4858.create(v4858.Class.UNIVERSAL, v4858.Type.OCTETSTRING, false, v4904);
              } else {
                v4879.contentInfo.value.push(v4858.create(v4858.Class.CONTEXT_SPECIFIC, 0, true, [v4858.create(v4858.Class.UNIVERSAL, v4858.Type.OCTETSTRING, false, v4904)]));
              }
            }
          }
          if (v4879.signers.length === 0) {
            return;
          }
          var v4905 = v4906();
          v4907(v4905);
        },
        verify: function () {
          throw new Error("PKCS#7 signature verification not yet implemented.");
        },
        addCertificate: function (v4908) {
          var v4909 = v4878;
          if (typeof v4908 === "string") {
            v4908 = v4857.pki.certificateFromPem(v4908);
          }
          v4879.certificates.push(v4908);
        },
        addCertificateRevokationList: function (v4910) {
          var v4911 = v4878;
          throw new Error("PKCS#7 CRL support not yet implemented.");
        }
      };
      return v4879;
      function v4906() {
        var v4912 = v4878;
        var v4913 = {};
        for (var v4914 = 0; v4914 < v4879.signers.length; ++v4914) {
          var v4915 = v4879.signers[v4914];
          var v4916 = v4915.digestAlgorithm;
          if (!(v4916 in v4913)) {
            v4913[v4916] = v4857.md[v4857.pki.oids[v4916]].create();
          }
          if (v4915.authenticatedAttributes.length === 0) {
            v4915.md = v4913[v4916];
          } else {
            v4915.md = v4857.md[v4857.pki.oids[v4916]].create();
          }
        }
        v4879.digestAlgorithmIdentifiers = [];
        for (var v4916 in v4913) {
          v4879.digestAlgorithmIdentifiers.push(v4858.create(v4858.Class.UNIVERSAL, v4858.Type.SEQUENCE, true, [v4858.create(v4858.Class.UNIVERSAL, v4858.Type.OID, false, v4858.oidToDer(v4916).getBytes()), v4858.create(v4858.Class.UNIVERSAL, v4858.Type.NULL, false, "")]));
        }
        return v4913;
      }
      function v4907(v4917) {
        var v4918 = v4878;
        var v4919;
        if (v4879.detachedContent) {
          v4919 = v4879.detachedContent;
        } else {
          v4919 = v4879.contentInfo.value[1];
          v4919 = v4919.value[0];
        }
        if (!v4919) {
          throw new Error("Could not sign PKCS#7 message; there is no content to sign.");
        }
        var v4920 = v4858.derToOid(v4879.contentInfo.value[0].value);
        var v4921 = v4858.toDer(v4919);
        v4921.getByte();
        v4858.getBerValueLength(v4921);
        v4921 = v4921.getBytes();
        for (var v4922 in v4917) {
          v4917[v4922].start().update(v4921);
        }
        var v4923 = new Date();
        for (var v4924 = 0; v4924 < v4879.signers.length; ++v4924) {
          var v4925 = v4879.signers[v4924];
          if (v4925.authenticatedAttributes.length === 0) {
            if (v4920 !== v4857.pki.oids.data) {
              throw new Error("Invalid signer; authenticatedAttributes must be present when the ContentInfo content type is not PKCS#7 Data.");
            }
          } else {
            v4925.authenticatedAttributesAsn1 = v4858.create(v4858.Class.CONTEXT_SPECIFIC, 0, true, []);
            var v4926 = v4858.create(v4858.Class.UNIVERSAL, v4858.Type.SET, true, []);
            for (var v4927 = 0; v4927 < v4925.authenticatedAttributes.length; ++v4927) {
              var v4928 = v4925.authenticatedAttributes[v4927];
              if (v4928.type === v4857.pki.oids.messageDigest) {
                v4928.value = v4917[v4925.digestAlgorithm].digest();
              } else if (v4928.type === v4857.pki.oids.signingTime) {
                if (!v4928.value) {
                  v4928.value = v4923;
                }
              }
              v4926.value.push(v4929(v4928));
              v4925.authenticatedAttributesAsn1.value.push(v4929(v4928));
            }
            v4921 = v4858.toDer(v4926).getBytes();
            v4925.md.start().update(v4921);
          }
          v4925.signature = v4925.key.sign(v4925.md, "RSASSA-PKCS1-V1_5");
        }
        v4879.signerInfos = v4930(v4879.signers);
      }
    };
    v4859.createEncryptedData = function () {
      var v4931 = v4856;
      var v4932 = null;
      v4932 = {
        type: v4857.pki.oids.encryptedData,
        version: 0,
        encryptedContent: {
          algorithm: v4857.pki.oids["aes256-CBC"]
        },
        fromAsn1: function (v4933) {
          v4882(v4932, v4933, v4859.asn1.encryptedDataValidator);
        },
        decrypt: function (v4934) {
          if (v4934 !== undefined) {
            v4932.encryptedContent.key = v4934;
          }
          v4935(v4932);
        }
      };
      return v4932;
    };
    v4859.createEnvelopedData = function () {
      var v4936 = {
        dh2723: 404,
        dh2724: 1554,
        dh2725: 1041,
        dh2726: 694
      };
      var v4937 = {
        dh2727: 536,
        dh2728: 597
      };
      var v4938 = v4856;
      var v4939 = null;
      v4939 = {
        type: v4857.pki.oids.envelopedData,
        version: 0,
        recipients: [],
        encryptedContent: {
          algorithm: v4857.pki.oids["aes256-CBC"]
        },
        fromAsn1: function (v4940) {
          var v4941 = v4938;
          var v4942 = v4882(v4939, v4940, v4859.asn1.envelopedDataValidator);
          v4939.recipients = v4943(v4942.recipientInfos.value);
        },
        toAsn1: function () {
          var v4944 = v4938;
          return v4858.create(v4858.Class.UNIVERSAL, v4858.Type.SEQUENCE, true, [v4858.create(v4858.Class.UNIVERSAL, v4858.Type.OID, false, v4858.oidToDer(v4939.type).getBytes()), v4858.create(v4858.Class.CONTEXT_SPECIFIC, 0, true, [v4858.create(v4858.Class.UNIVERSAL, v4858.Type.SEQUENCE, true, [v4858.create(v4858.Class.UNIVERSAL, v4858.Type.INTEGER, false, v4858.integerToDer(v4939.version).getBytes()), v4858.create(v4858.Class.UNIVERSAL, v4858.Type.SET, true, v4945(v4939.recipients)), v4858.create(v4858.Class.UNIVERSAL, v4858.Type.SEQUENCE, true, v4946(v4939.encryptedContent))])])]);
        },
        findRecipient: function (v4947) {
          var v4948 = v4938;
          var v4949 = v4947.issuer.attributes;
          for (var v4950 = 0; v4950 < v4939.recipients.length; ++v4950) {
            var v4951 = v4939.recipients[v4950];
            var v4952 = v4951.issuer;
            if (v4951.serialNumber !== v4947.serialNumber) {
              continue;
            }
            if (v4952.length !== v4949.length) {
              continue;
            }
            var v4953 = true;
            for (var v4954 = 0; v4954 < v4949.length; ++v4954) {
              if (v4952[v4954].type !== v4949[v4954].type || v4952[v4954].value !== v4949[v4954].value) {
                v4953 = false;
                break;
              }
            }
            if (v4953) {
              return v4951;
            }
          }
          return null;
        },
        decrypt: function (v4955, v4956) {
          var v4957 = v4938;
          if (v4939.encryptedContent.key === undefined && v4955 !== undefined && v4956 !== undefined) {
            switch (v4955.encryptedContent.algorithm) {
              case v4857.pki.oids.rsaEncryption:
              case v4857.pki.oids.desCBC:
                var v4958 = v4956.decrypt(v4955.encryptedContent.content);
                v4939.encryptedContent.key = v4857.util.createBuffer(v4958);
                break;
              default:
                throw new Error("Unsupported asymmetric cipher, OID " + v4955.encryptedContent.algorithm);
            }
          }
          v4935(v4939);
        },
        addRecipient: function (v4959) {
          var v4960 = v4938;
          v4939.recipients.push({
            version: 0,
            issuer: v4959.issuer.attributes,
            serialNumber: v4959.serialNumber,
            encryptedContent: {
              algorithm: v4857.pki.oids.rsaEncryption,
              key: v4959.publicKey
            }
          });
        },
        encrypt: function (v4961, v4962) {
          var v4963 = v4938;
          if (v4939.encryptedContent.content === undefined) {
            v4962 = v4962 || v4939.encryptedContent.algorithm;
            v4961 = v4961 || v4939.encryptedContent.key;
            var v4964;
            var v4965;
            var v4966;
            switch (v4962) {
              case v4857.pki.oids["aes128-CBC"]:
                v4964 = 16;
                v4965 = 16;
                v4966 = v4857.aes.createEncryptionCipher;
                break;
              case v4857.pki.oids["aes192-CBC"]:
                v4964 = 24;
                v4965 = 16;
                v4966 = v4857.aes.createEncryptionCipher;
                break;
              case v4857.pki.oids["aes256-CBC"]:
                v4964 = 32;
                v4965 = 16;
                v4966 = v4857.aes.createEncryptionCipher;
                break;
              case v4857.pki.oids["des-EDE3-CBC"]:
                v4964 = 24;
                v4965 = 8;
                v4966 = v4857.des.createEncryptionCipher;
                break;
              default:
                throw new Error("Unsupported symmetric cipher, OID " + v4962);
            }
            if (v4961 === undefined) {
              v4961 = v4857.util.createBuffer(v4857.random.getBytes(v4964));
            } else if (v4961.length() != v4964) {
              throw new Error("Symmetric key has wrong length; got " + v4961.length() + " bytes, expected " + v4964 + ".");
            }
            v4939.encryptedContent.algorithm = v4962;
            v4939.encryptedContent.key = v4961;
            v4939.encryptedContent.parameter = v4857.util.createBuffer(v4857.random.getBytes(v4965));
            var v4967 = v4966(v4961);
            v4967.start(v4939.encryptedContent.parameter.copy());
            v4967.update(v4939.content);
            if (!v4967.finish()) {
              throw new Error("Symmetric encryption failed.");
            }
            v4939.encryptedContent.content = v4967.output;
          }
          for (var v4968 = 0; v4968 < v4939.recipients.length; ++v4968) {
            var v4969 = v4939.recipients[v4968];
            if (v4969.encryptedContent.content !== undefined) {
              continue;
            }
            switch (v4969.encryptedContent.algorithm) {
              case v4857.pki.oids.rsaEncryption:
                v4969.encryptedContent.content = v4969.encryptedContent.key.encrypt(v4939.encryptedContent.key.data);
                break;
              default:
                throw new Error("Unsupported asymmetric cipher, OID " + v4969.encryptedContent.algorithm);
            }
          }
        }
      };
      return v4939;
    };
    function v4970(v4971) {
      var v4972 = v4856;
      var v4973 = {};
      var v4974 = [];
      if (!v4858.validate(v4971, v4859.asn1.recipientInfoValidator, v4973, v4974)) {
        var v4975 = new Error("Cannot read PKCS#7 RecipientInfo. ASN.1 object is not an PKCS#7 RecipientInfo.");
        v4975.errors = v4974;
        throw v4975;
      }
      return {
        version: v4973.version.charCodeAt(0),
        issuer: v4857.pki.RDNAttributesAsArray(v4973.issuer),
        serialNumber: v4857.util.createBuffer(v4973.serial).toHex(),
        encryptedContent: {
          algorithm: v4858.derToOid(v4973.encAlgorithm),
          parameter: v4973.encParameter ? v4973.encParameter.value : undefined,
          content: v4973.encKey
        }
      };
    }
    function v4976(v4977) {
      var v4978 = v4856;
      return v4858.create(v4858.Class.UNIVERSAL, v4858.Type.SEQUENCE, true, [v4858.create(v4858.Class.UNIVERSAL, v4858.Type.INTEGER, false, v4858.integerToDer(v4977.version).getBytes()), v4858.create(v4858.Class.UNIVERSAL, v4858.Type.SEQUENCE, true, [v4857.pki.distinguishedNameToAsn1({
        attributes: v4977.issuer
      }), v4858.create(v4858.Class.UNIVERSAL, v4858.Type.INTEGER, false, v4857.util.hexToBytes(v4977.serialNumber))]), v4858.create(v4858.Class.UNIVERSAL, v4858.Type.SEQUENCE, true, [v4858.create(v4858.Class.UNIVERSAL, v4858.Type.OID, false, v4858.oidToDer(v4977.encryptedContent.algorithm).getBytes()), v4858.create(v4858.Class.UNIVERSAL, v4858.Type.NULL, false, "")]), v4858.create(v4858.Class.UNIVERSAL, v4858.Type.OCTETSTRING, false, v4977.encryptedContent.content)]);
    }
    function v4943(v4979) {
      var v4980 = [];
      for (var v4981 = 0; v4981 < v4979.length; ++v4981) {
        v4980.push(v4970(v4979[v4981]));
      }
      return v4980;
    }
    function v4945(v4982) {
      var v4983 = [];
      for (var v4984 = 0; v4984 < v4982.length; ++v4984) {
        v4983.push(v4976(v4982[v4984]));
      }
      return v4983;
    }
    function v4985(v4986) {
      var v4987 = v4856;
      var v4988 = v4858.create(v4858.Class.UNIVERSAL, v4858.Type.SEQUENCE, true, [v4858.create(v4858.Class.UNIVERSAL, v4858.Type.INTEGER, false, v4858.integerToDer(v4986.version).getBytes()), v4858.create(v4858.Class.UNIVERSAL, v4858.Type.SEQUENCE, true, [v4857.pki.distinguishedNameToAsn1({
        attributes: v4986.issuer
      }), v4858.create(v4858.Class.UNIVERSAL, v4858.Type.INTEGER, false, v4857.util.hexToBytes(v4986.serialNumber))]), v4858.create(v4858.Class.UNIVERSAL, v4858.Type.SEQUENCE, true, [v4858.create(v4858.Class.UNIVERSAL, v4858.Type.OID, false, v4858.oidToDer(v4986.digestAlgorithm).getBytes()), v4858.create(v4858.Class.UNIVERSAL, v4858.Type.NULL, false, "")])]);
      if (v4986.authenticatedAttributesAsn1) {
        v4988.value.push(v4986.authenticatedAttributesAsn1);
      }
      v4988.value.push(v4858.create(v4858.Class.UNIVERSAL, v4858.Type.SEQUENCE, true, [v4858.create(v4858.Class.UNIVERSAL, v4858.Type.OID, false, v4858.oidToDer(v4986.signatureAlgorithm).getBytes()), v4858.create(v4858.Class.UNIVERSAL, v4858.Type.NULL, false, "")]));
      v4988.value.push(v4858.create(v4858.Class.UNIVERSAL, v4858.Type.OCTETSTRING, false, v4986.signature));
      if (v4986.unauthenticatedAttributes.length > 0) {
        var v4989 = v4858.create(v4858.Class.CONTEXT_SPECIFIC, 1, true, []);
        for (var v4990 = 0; v4990 < v4986.unauthenticatedAttributes.length; ++v4990) {
          var v4991 = v4986.unauthenticatedAttributes[v4990];
          v4989.values.push(v4929(v4991));
        }
        v4988.value.push(v4989);
      }
      return v4988;
    }
    function v4930(v4992) {
      var v4993 = [];
      for (var v4994 = 0; v4994 < v4992.length; ++v4994) {
        v4993.push(v4985(v4992[v4994]));
      }
      return v4993;
    }
    function v4929(v4995) {
      var v4996 = v4856;
      var v4997;
      if (v4995.type === v4857.pki.oids.contentType) {
        v4997 = v4858.create(v4858.Class.UNIVERSAL, v4858.Type.OID, false, v4858.oidToDer(v4995.value).getBytes());
      } else if (v4995.type === v4857.pki.oids.messageDigest) {
        v4997 = v4858.create(v4858.Class.UNIVERSAL, v4858.Type.OCTETSTRING, false, v4995.value.bytes());
      } else if (v4995.type === v4857.pki.oids.signingTime) {
        var v4998 = new Date("1950-01-01T00:00:00Z");
        var v4999 = new Date("2050-01-01T00:00:00Z");
        var v5000 = v4995.value;
        if (typeof v5000 === "string") {
          var v5001 = Date.parse(v5000);
          if (!isNaN(v5001)) {
            v5000 = new Date(v5001);
          } else if (v5000.length === 13) {
            v5000 = v4858.utcTimeToDate(v5000);
          } else {
            v5000 = v4858.generalizedTimeToDate(v5000);
          }
        }
        if (v5000 >= v4998 && v5000 < v4999) {
          v4997 = v4858.create(v4858.Class.UNIVERSAL, v4858.Type.UTCTIME, false, v4858.dateToUtcTime(v5000));
        } else {
          v4997 = v4858.create(v4858.Class.UNIVERSAL, v4858.Type.GENERALIZEDTIME, false, v4858.dateToGeneralizedTime(v5000));
        }
      }
      return v4858.create(v4858.Class.UNIVERSAL, v4858.Type.SEQUENCE, true, [v4858.create(v4858.Class.UNIVERSAL, v4858.Type.OID, false, v4858.oidToDer(v4995.type).getBytes()), v4858.create(v4858.Class.UNIVERSAL, v4858.Type.SET, true, [v4997])]);
    }
    function v4946(v5002) {
      var v5003 = v4856;
      return [v4858.create(v4858.Class.UNIVERSAL, v4858.Type.OID, false, v4858.oidToDer(v4857.pki.oids.data).getBytes()), v4858.create(v4858.Class.UNIVERSAL, v4858.Type.SEQUENCE, true, [v4858.create(v4858.Class.UNIVERSAL, v4858.Type.OID, false, v4858.oidToDer(v5002.algorithm).getBytes()), !v5002.parameter ? undefined : v4858.create(v4858.Class.UNIVERSAL, v4858.Type.OCTETSTRING, false, v5002.parameter.getBytes())]), v4858.create(v4858.Class.CONTEXT_SPECIFIC, 0, true, [v4858.create(v4858.Class.UNIVERSAL, v4858.Type.OCTETSTRING, false, v5002.content.getBytes())])];
    }
    function v4882(v5004, v5005, v5006) {
      var v5007 = v4856;
      var v5008 = {};
      var v5009 = [];
      if (!v4858.validate(v5005, v5006, v5008, v5009)) {
        var v5010 = new Error("Cannot read PKCS#7 message. ASN.1 object is not a supported PKCS#7 message.");
        v5010.errors = v5010;
        throw v5010;
      }
      var v5011 = v4858.derToOid(v5008.contentType);
      if (v5011 !== v4857.pki.oids.data) {
        throw new Error("Unsupported PKCS#7 message. Only wrapped ContentType Data supported.");
      }
      if (v5008.encryptedContent) {
        var v5012 = "";
        if (v4857.util.isArray(v5008.encryptedContent)) {
          for (var v5013 = 0; v5013 < v5008.encryptedContent.length; ++v5013) {
            if (v5008.encryptedContent[v5013].type !== v4858.Type.OCTETSTRING) {
              throw new Error("Malformed PKCS#7 message, expecting encrypted content constructed of only OCTET STRING objects.");
            }
            v5012 += v5008.encryptedContent[v5013].value;
          }
        } else {
          v5012 = v5008.encryptedContent;
        }
        v5004.encryptedContent = {
          algorithm: v4858.derToOid(v5008.encAlgorithm),
          parameter: v4857.util.createBuffer(v5008.encParameter.value),
          content: v4857.util.createBuffer(v5012)
        };
      }
      if (v5008.content) {
        var v5012 = "";
        if (v4857.util.isArray(v5008.content)) {
          for (var v5013 = 0; v5013 < v5008.content.length; ++v5013) {
            if (v5008.content[v5013].type !== v4858.Type.OCTETSTRING) {
              throw new Error("Malformed PKCS#7 message, expecting content constructed of only OCTET STRING objects.");
            }
            v5012 += v5008.content[v5013].value;
          }
        } else {
          v5012 = v5008.content;
        }
        v5004.content = v4857.util.createBuffer(v5012);
      }
      v5004.version = v5008.version.charCodeAt(0);
      v5004.rawCapture = v5008;
      return v5008;
    }
    function v4935(v5014) {
      var v5015 = v4856;
      if (v5014.encryptedContent.key === undefined) {
        throw new Error("Symmetric key not available.");
      }
      if (v5014.content === undefined) {
        var v5016;
        switch (v5014.encryptedContent.algorithm) {
          case v4857.pki.oids["aes128-CBC"]:
          case v4857.pki.oids["aes192-CBC"]:
          case v4857.pki.oids["aes256-CBC"]:
            v5016 = v4857.aes.createDecryptionCipher(v5014.encryptedContent.key);
            break;
          case v4857.pki.oids.desCBC:
          case v4857.pki.oids["des-EDE3-CBC"]:
            v5016 = v4857.des.createDecryptionCipher(v5014.encryptedContent.key);
            break;
          default:
            throw new Error("Unsupported symmetric cipher, OID " + v5014.encryptedContent.algorithm);
        }
        v5016.start(v5014.encryptedContent.parameter);
        v5016.update(v5014.encryptedContent.content);
        if (!v5016.finish()) {
          throw new Error("Symmetric decryption failed.");
        }
        v5014.content = v5016.output;
      }
    }
  }
});
var require_ssh = __commonJS({
  "node_modules/node-forge/lib/ssh.js"(v5017, v5018) {
    var v5019 = {
      dh2729: 1524
    };
    var v5020 = {
      dh2730: 1144
    };
    var v5021 = {
      dh2731: 764
    };
    var v5022 = {
      dh2732: 619
    };
    var v5023 = {
      dh2733: 1310,
      dh2734: 352,
      dh2735: 1077,
      dh2736: 321
    };
    var v5024 = {
      dh2737: 1508,
      dh2738: 1433
    };
    var v5025 = {
      dh2739: 579,
      dh2740: 227,
      dh2741: 662,
      dh2742: 857,
      dh2743: 619,
      dh2744: 1508,
      dh2745: 1433,
      dh2746: 654,
      dh2747: 1373,
      dh2748: 352,
      dh2749: 1257,
      dh2750: 1144,
      dh2751: 931,
      dh2752: 1100
    };
    var v5026 = v2;
    var v5027 = require_forge();
    require_aes();
    require_hmac();
    require_md5();
    require_sha1();
    require_util();
    var v5028 = v5018.exports = v5027.ssh = v5027.ssh || {};
    v5028.privateKeyToPutty = function (v5029, v5030, v5031) {
      var v5032 = v1;
      v5031 = v5031 || "";
      v5030 = v5030 || "";
      var v5033 = "ssh-rsa";
      var v5034 = v5030 === "" ? "none" : "aes256-cbc";
      var v5035 = "PuTTY-User-Key-File-2: " + v5033 + "\r\n";
      v5035 += "Encryption: " + v5034 + "\r\n";
      v5035 += "Comment: " + v5031 + "\r\n";
      var v5036 = v5027.util.createBuffer();
      v5037(v5036, v5033);
      v5038(v5036, v5029.e);
      v5038(v5036, v5029.n);
      var v5039 = v5027.util.encode64(v5036.bytes(), 64);
      var v5040 = Math.floor(v5039.length / 66) + 1;
      v5035 += "Public-Lines: " + v5040 + "\r\n";
      v5035 += v5039;
      var v5041 = v5027.util.createBuffer();
      v5038(v5041, v5029.d);
      v5038(v5041, v5029.p);
      v5038(v5041, v5029.q);
      v5038(v5041, v5029.qInv);
      var v5042;
      if (!v5030) {
        v5042 = v5027.util.encode64(v5041.bytes(), 64);
      } else {
        var v5043 = v5041.length() + 16 - 1;
        v5043 -= v5043 % 16;
        var v5044 = v5045(v5041.bytes());
        v5044.truncate(v5044.length() - v5043 + v5041.length());
        v5041.putBuffer(v5044);
        var v5046 = v5027.util.createBuffer();
        v5046.putBuffer(v5045("\0\0\0\0", v5030));
        v5046.putBuffer(v5045("\0\0\0", v5030));
        var v5047 = v5027.aes.createEncryptionCipher(v5046.truncate(8), "CBC");
        v5047.start(v5027.util.createBuffer().fillWithByte(0, 16));
        v5047.update(v5041.copy());
        v5047.finish();
        var v5048 = v5047.output;
        v5048.truncate(16);
        v5042 = v5027.util.encode64(v5048.bytes(), 64);
      }
      v5040 = Math.floor(v5042.length / 66) + 1;
      v5035 += "\r\nPrivate-Lines: " + v5040 + "\r\n";
      v5035 += v5042;
      var v5049 = v5045("putty-private-key-file-mac-key", v5030);
      var v5050 = v5027.util.createBuffer();
      v5037(v5050, v5033);
      v5037(v5050, v5034);
      v5037(v5050, v5031);
      v5050.putInt32(v5036.length());
      v5050.putBuffer(v5036);
      v5050.putInt32(v5041.length());
      v5050.putBuffer(v5041);
      var v5051 = v5027.hmac.create();
      v5051.start("sha1", v5049);
      v5051.update(v5050.bytes());
      v5035 += "\r\nPrivate-MAC: " + v5051.digest().toHex() + "\r\n";
      return v5035;
    };
    v5028.publicKeyToOpenSSH = function (v5052, v5053) {
      var v5054 = v5026;
      var v5055 = "ssh-rsa";
      v5053 = v5053 || "";
      var v5056 = v5027.util.createBuffer();
      v5037(v5056, v5055);
      v5038(v5056, v5052.e);
      v5038(v5056, v5052.n);
      return v5055 + " " + v5027.util.encode64(v5056.bytes()) + " " + v5053;
    };
    v5028.privateKeyToOpenSSH = function (v5057, v5058) {
      var v5059 = v5026;
      if (!v5058) {
        return v5027.pki.privateKeyToPem(v5057);
      }
      return v5027.pki.encryptRsaPrivateKey(v5057, v5058, {
        legacy: true,
        algorithm: "aes128"
      });
    };
    v5028.getPublicKeyFingerprint = function (v5060, v5061) {
      var v5062 = v5026;
      v5061 = v5061 || {};
      var v5063 = v5061.md || v5027.md.md5.create();
      var v5064 = "ssh-rsa";
      var v5065 = v5027.util.createBuffer();
      v5037(v5065, v5064);
      v5038(v5065, v5060.e);
      v5038(v5065, v5060.n);
      v5063.start();
      v5063.update(v5065.getBytes());
      var v5066 = v5063.digest();
      if (v5061.encoding === "hex") {
        var v5067 = v5066.toHex();
        if (v5061.delimiter) {
          return v5067.match(/.{2}/g).join(v5061.delimiter);
        }
        return v5067;
      } else if (v5061.encoding === "binary") {
        return v5066.getBytes();
      } else if (v5061.encoding) {
        throw new Error("Unknown encoding \"" + v5061.encoding + "\".");
      }
      return v5066;
    };
    function v5038(v5068, v5069) {
      var v5070 = v5026;
      var v5071 = v5069.toString(16);
      if (v5071[0] >= "8") {
        v5071 = "00" + v5071;
      }
      var v5072 = v5027.util.hexToBytes(v5071);
      v5068.putInt32(v5072.length);
      v5068.putBytes(v5072);
    }
    function v5037(v5073, v5074) {
      var v5075 = v5026;
      v5073.putInt32(v5074.length);
      v5073.putString(v5074);
    }
    function v5045() {
      var v5076 = v5026;
      var v5077 = v5027.md.sha1.create();
      var v5078 = arguments.length;
      for (var v5079 = 0; v5079 < v5078; ++v5079) {
        v5077.update(arguments[v5079]);
      }
      return v5077.digest();
    }
  }
});
var require_lib = __commonJS({
  "node_modules/node-forge/lib/index.js"(v5080, v5081) {
    v5081.exports = require_forge();
    require_aes();
    require_aesCipherSuites();
    require_asn1();
    require_cipher();
    require_des();
    require_ed25519();
    require_hmac();
    require_kem();
    require_log();
    require_md_all();
    require_mgf1();
    require_pbkdf2();
    require_pem();
    require_pkcs1();
    require_pkcs12();
    require_pkcs7();
    require_pki();
    require_prime();
    require_prng();
    require_pss();
    require_random();
    require_rc2();
    require_ssh();
    require_tls();
    require_util();
  }
});
var forge = require_lib();
var PROVIDER_NAME = "Peachify";
var AES_KEY_HEX = "a8f2a1b5e9c470814f6b2c3a5d8e7f9c1a2b3c4d5e3f7a8b8cad1e2d0a4d5c5d";
var KEY_BYTES = forge.util.hexToBytes(AES_KEY_HEX);
var MOBILE_UAS = ["Mozilla/5.0 (Linux; Android 14; Pixel 8 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36", "Mozilla/5.0 (Linux; Android 13; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36", "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1", "Mozilla/5.0 (Linux; Android 14; SM-F946U) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Mobile Safari/537.36"];
var TIMEOUT = 15000;
var TMDB_KEY = "439c478a771f35c05022f9feabcca01c";
var SERVERS = [{
  label: "Iron",
  base: "https://uwu.eat-peach.sbs",
  path: "moviebox"
}, {
  label: "Wolf",
  base: "https://usa.eat-peach.sbs",
  path: "air"
}, {
  label: "Spider",
  base: "https://usa.eat-peach.sbs",
  path: "holly"
}, {
  label: "Multi",
  base: "https://usa.eat-peach.sbs",
  path: "multi"
}, {
  label: "Dark",
  base: "https://uwu.eat-peach.sbs",
  path: "net"
}];
function getRequestHeaders(v5082) {
  var v5083 = {
    dh2753: 540
  };
  var v5084 = v2;
  return {
    "User-Agent": v5082,
    Origin: "https://peachify.top",
    Referer: "https://peachify.top/"
  };
}
function b64urlDecode(v5085) {
  var v5086 = v2;
  let v5087 = v5085.replace(/-/g, "+").replace(/_/g, "/");
  let v5088 = v5087.length % 4 === 0 ? "" : "=".repeat(4 - v5087.length % 4);
  return forge.util.decode64(v5087 + v5088);
}
function aesGcmDecrypt(v5089) {
  var v5090 = {
    dh2754: 1336,
    dh2755: 857,
    dh2756: 1251,
    dh2757: 1275,
    dh2758: 1288,
    dh2759: 619,
    dh2760: 352,
    dh2761: 1508
  };
  var v5091 = v2;
  const v5092 = v5089.split(".");
  if (v5092.length < 3) {
    return null;
  }
  const v5093 = b64urlDecode(v5092[0]);
  const v5094 = b64urlDecode(v5092[1]);
  const v5095 = b64urlDecode(v5092[2]);
  const v5096 = v5094 + v5095;
  const v5097 = v5096.substring(0, v5096.length - 16);
  const v5098 = v5096.substring(v5096.length - 16);
  const v5099 = forge.cipher.createDecipher("AES-GCM", KEY_BYTES);
  v5099.start({
    iv: v5093,
    tagLength: 128,
    tag: forge.util.createBuffer(v5098)
  });
  v5099.update(forge.util.createBuffer(v5097));
  const v5100 = v5099.finish();
  if (v5100) {
    try {
      return JSON.parse(v5099.output.toString("utf8"));
    } catch (v5101) {
      return null;
    }
  } else {
    return null;
  }
}
function fetchWithTimeout(v5102, v5103, v5104) {
  var v5105 = {
    dh2762: 795,
    dh2763: 956
  };
  return __async(this, null, function* () {
    var v5106 = v1;
    v5104 = v5104 || TIMEOUT;
    try {
      var v5107 = typeof AbortSignal !== "undefined" && AbortSignal.timeout ? AbortSignal.timeout(v5104) : null;
      var v5108 = __spreadValues({}, v5103 || {});
      if (v5107) {
        v5108.signal = v5107;
      }
      return yield __nvFetch(v5102, v5108);
    } catch (v5109) {
      if (v5109.name === "AbortError" || v5109.name === "TimeoutError") {
        console.log("[" + PROVIDER_NAME + "] Timeout: " + v5102.substring(0, 80));
      }
      return null;
    }
  });
}
function fetchFromServer(v5110, v5111, v5112, v5113, v5114, v5115) {
  var v5116 = {
    dh2764: 971,
    dh2765: 238,
    dh2766: 238,
    dh2767: 527,
    dh2768: 675,
    dh2769: 1151,
    dh2770: 299,
    dh2771: 952,
    dh2772: 1208
  };
  return __async(this, null, function* () {
    var v5117 = v1;
    var v5118 = v5112 === "tv" || v5112 === "series" ? "tv" : "movie";
    var v5119 = v5110.base + "/" + v5110.path + "/" + v5118 + "/" + v5111;
    if ((v5112 === "tv" || v5112 === "series") && v5113 != null && v5114 != null) {
      v5119 += "/" + v5113 + "/" + v5114;
    }
    console.log("[" + PROVIDER_NAME + "] " + v5110.label + ": " + v5119.substring(0, 100));
    var v5120 = getRequestHeaders(v5115);
    var v5121 = yield fetchWithTimeout(v5119, {
      headers: v5120
    }, TIMEOUT);
    if (!v5121 || !v5121.ok) {
      console.log("[" + PROVIDER_NAME + "] " + v5110.label + " -> " + (v5121 ? v5121.status : "no response"));
      return null;
    }
    var v5122 = yield v5121.json();
    if (!v5122 || !v5122.isEncrypted || !v5122.data) {
      console.log("[" + PROVIDER_NAME + "] " + v5110.label + " unexpected format");
      return null;
    }
    var v5123 = aesGcmDecrypt(v5122.data);
    if (!v5123) {
      console.log("[" + PROVIDER_NAME + "] " + v5110.label + " decrypt fail");
      return null;
    }
    var v5124 = v5123.sources ? v5123.sources.length : 0;
    console.log("[" + PROVIDER_NAME + "] " + v5110.label + " OK (" + v5124 + " sources)");
    return v5123;
  });
}
function normalizeQuality(v5125) {
  var v5126 = {
    dh2773: 708
  };
  var v5127 = v2;
  var v5128 = String(v5125 || "").toLowerCase();
  var v5129 = v5128.match(/(2160|1080|720|480)\s*p/i);
  if (v5129) {
    return v5129[1] + "p";
  } else if (v5128.indexOf("4k") >= 0) {
    return "2160p";
  } else {
    return "HD";
  }
}
function buildStreams(v5130, v5131, v5132, v5133, v5134, v5135) {
  var v5136 = {
    dh2774: 266,
    dh2775: 857,
    dh2776: 299,
    dh2777: 616,
    dh2778: 956,
    dh2779: 1353,
    dh2780: 870,
    dh2781: 818
  };
  var v5137 = v2;
  var v5138 = [];
  var v5139 = {};
  if (!v5130 || !v5130.sources) {
    return v5138;
  }
  var v5140 = v5133 != null && v5134 != null;
  var v5141 = v5140 ? " S" + v5133 + "E" + v5134 : "";
  var v5142 = v5132 ? v5132 + v5141 + " - Peachify" : "Peachify";
  for (var v5143 = 0; v5143 < v5130.sources.length; v5143++) {
    var v5144 = v5130.sources[v5143];
    var v5145 = v5144.url || v5144.src || v5144.file || v5144.stream || v5144.streamUrl || "";
    var v5146 = v5144.dub || v5144.audio || v5144.language || v5144.name || "Original";
    var v5147 = v5145 + "|" + v5146;
    if (!v5145 || v5139[v5147]) {
      continue;
    }
    v5139[v5147] = true;
    var v5148 = normalizeQuality(v5144.quality || v5144.resolution || "");
    var v5149 = v5142 + " | " + v5131 + " | " + v5148 + " | " + v5146;
    var v5150 = {
      origin: "https://peachify.top",
      referer: "https://peachify.top/",
      "user-agent": v5135,
      accept: "*/*"
    };
    if (v5144.headers) {
      for (var v5151 in v5144.headers) {
        v5150[v5151.toLowerCase()] = v5144.headers[v5151];
      }
    }
    var v5152 = v5144.type === "hls" || v5145.indexOf("m3u8") !== -1;
    var v5153 = {
      name: v5149,
      title: v5149,
      url: v5145,
      quality: v5148,
      behaviorHints: {
        notWebReady: true
      }
    };
    if (v5152) {
      v5153.headers = v5150;
    } else {
      v5153.behaviorHints.proxyHeaders = {
        request: v5150
      };
    }
    v5138.push(v5153);
  }
  return v5138;
} /*decoder removed*/
function getStreams(v5154, v5155, v5156, v5157) {
  var v5158 = {
    dh2782: 1088,
    dh2783: 713,
    dh2784: 610,
    dh2785: 952,
    dh2786: 593,
    dh2787: 971,
    dh2788: 857,
    dh2789: 1534,
    dh2790: 1151,
    dh2791: 857,
    dh2792: 767,
    dh2793: 351,
    dh2794: 1204
  };
  var v5159 = {
    dh2795: 1290
  };
  return __async(this, null, function* () {
    var v5160 = {
      dh2796: 792,
      dh2797: 894,
      dh2798: 1278
    };
    var v5161 = v1;
    try {
      var v5162 = MOBILE_UAS[Math.floor(Math.random() * MOBILE_UAS.length)];
      console.log("[" + PROVIDER_NAME + "] ID=" + v5154 + " T=" + v5155 + " S=" + v5156 + " E=" + v5157);
      var v5163 = String(v5154 || "").trim();
      if (v5163.indexOf("tt") === 0) {
        console.log("[" + PROVIDER_NAME + "] Resolving IMDb ID...");
        var v5164 = yield fetchWithTimeout("https://api.themoviedb.org/3/find/" + v5163 + "?api_key=" + TMDB_KEY + "&external_source=imdb_id", {
          headers: {
            "User-Agent": v5162
          }
        }, 10000);
        if (v5164 && v5164.ok) {
          var v5165 = yield v5164.json();
          var v5166 = v5155 === "tv" || v5155 === "series" ? v5165.tv_results : v5165.movie_results;
          if (v5166 && v5166.length > 0) {
            v5163 = String(v5166[0].id);
            console.log("[" + PROVIDER_NAME + "] Resolved to TMDB: " + v5163);
          }
        }
      }
      var v5167 = (() => __async(this, null, function* () {
        var v5168 = v5161;
        var v5169 = v5155 === "tv" || v5155 === "series" ? "tv" : "movie";
        try {
          var v5170 = yield fetchWithTimeout("https://api.themoviedb.org/3/" + v5169 + "/" + v5163 + "?api_key=" + TMDB_KEY, {
            headers: {
              "User-Agent": v5162
            }
          }, 8000);
          if (v5170 && v5170.ok) {
            var v5171 = yield v5170.json();
            return v5171.title || v5171.name || null;
          }
        } catch (v5172) {}
        return null;
      }))();
      var v5173 = SERVERS.map(function (v5174) {
        return __async(this, null, function* () {
          var v5175 = yield fetchFromServer(v5174, v5163, v5155, v5156, v5157, v5162);
          return {
            data: v5175,
            label: v5174.label
          };
        });
      });
      var v5176 = yield v5167;
      var v5177 = yield Promise.all(v5173);
      var v5178 = [];
      for (var v5179 = 0; v5179 < v5177.length; v5179++) {
        var v5180 = v5177[v5179];
        if (v5180.data) {
          var v5181 = buildStreams(v5180.data, v5180.label, v5176, v5156, v5157, v5162);
          for (var v5182 = 0; v5182 < v5181.length; v5182++) {
            v5178.push(v5181[v5182]);
          }
        }
      }
      var v5183 = {
        "2160p": 0,
        "1080p": 1,
        "720p": 2,
        "480p": 3,
        HD: 4
      };
      v5178.sort(function (v5184, v5185) {
        var v5186 = v5161;
        var v5187 = v5183[v5184.quality] !== undefined ? v5183[v5184.quality] : 99;
        var v5188 = v5183[v5185.quality] !== undefined ? v5183[v5185.quality] : 99;
        return v5187 - v5188;
      });
      console.log("[" + PROVIDER_NAME + "] Total: " + v5178.length + " streams");
      return v5178;
    } catch (v5189) {
      console.error("[" + PROVIDER_NAME + "] Fatal: " + (v5189.message || v5189));
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
  var PROVIDER = "peachify";
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