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
/* ===== nv-plugins castle pure crypto v1.0.0 (pack 4.37.0) ==================
   The device realm has no `require` (and no crypto-js module), so castle's
   decryptCastle() died with "require is not defined" BEFORE any network work
   could pay off. This is a self-contained CryptoJS-compatible subset:
   WordArray (parse/concat/create), enc.Base64/enc.Utf8, AES-CBC decrypt with
   Pkcs7 unpadding - pure JS, no TypedArray tricks beyond ES2020 core.
   Exposed as __nvCastleCryptoJs; the require("crypto-js") call site falls
   back to it when require is unavailable. =================================== */
var __nvCastleCryptoJs = (function() {
  'use strict';
  /* AES tables */
  var SBOX = new Uint8Array(256),
    INV = new Uint8Array(256);
  (function() {
    var p = 1,
      q = 1,
      x;
    /* generate sbox via GF(2^8) inverse + affine transform */
    var mul = function(a, b) {
      var r = 0;
      while (b) {
        if (b & 1) r ^= a;
        var hi = a & 0x80;
        a = (a << 1) & 0xff;
        if (hi) a ^= 0x1b;
        b >>= 1;
      }
      return r;
    };
    SBOX[0] = 0x63;
    for (var i = 1; i < 256; i++) {
      var inv = 1,
        t = i;
      /* brute inverse */
      for (var j = 1; j < 256; j++) {
        if (mul(i, j) === 1) {
          inv = j;
          break;
        }
      }
      x = inv;
      var s = x;
      for (var k = 0; k < 4; k++) {
        s = ((s << 1) | (s >> 7)) & 0xff;
        x ^= s;
      }
      SBOX[i] = (x ^ 0x63) & 0xff;
    }
    for (var m = 0; m < 256; m++) INV[SBOX[m]] = m;
  })();
  var RCON = [0x01, 0x02, 0x04, 0x08, 0x10, 0x20, 0x40, 0x80, 0x1b, 0x36, 0x6c, 0xd8];

  function keyExpansion(key) {
    var nk = key.length / 4,
      nr = nk + 6,
      w = [],
      i, t;
    for (i = 0; i < nk; i++) {
      w[i] = (key[4 * i] << 24) | (key[4 * i + 1] << 16) | (key[4 * i + 2] << 8) | key[4 * i + 3];
    }
    for (i = nk; i < 4 * (nr + 1); i++) {
      t = w[i - 1];
      if (i % nk === 0) {
        t = ((t << 8) | (t >>> 24)) >>> 0;
        t = ((SBOX[(t >>> 24) & 0xff] << 24) | (SBOX[(t >>> 16) & 0xff] << 16) |
          (SBOX[(t >>> 8) & 0xff] << 8) | SBOX[t & 0xff]) >>> 0;
        t = (t ^ (RCON[i / nk - 1] << 24)) >>> 0;
      } else if (nk > 6 && i % nk === 4) {
        t = ((SBOX[(t >>> 24) & 0xff] << 24) | (SBOX[(t >>> 16) & 0xff] << 16) |
          (SBOX[(t >>> 8) & 0xff] << 8) | SBOX[t & 0xff]) >>> 0;
      }
      w[i] = (w[i - nk] ^ t) >>> 0;
    }
    return {
      w: w,
      nr: nr
    };
  }

  function decryptBlock(ks, input) {
    var w = ks.w,
      nr = ks.nr;
    var s = [0, 0, 0, 0],
      i;
    for (i = 0; i < 4; i++) s[i] = (input[4 * i] << 24) | (input[4 * i + 1] << 16) | (input[4 * i + 2] <<
      8) | input[4 * i + 3];
    var m = function(x, y) {
      var r = 0;
      while (y) {
        if (y & 1) r ^= x;
        var hi = x & 0x80;
        x = (x << 1) & 0xff;
        if (hi) x ^= 0x1b;
        y >>= 1;
      }
      return r;
    };
    var ark = function(r) {
      for (var c = 0; c < 4; c++) s[c] = (s[c] ^ w[r * 4 + c]) >>> 0;
    };
    /* InvShiftRows + InvSubBytes: value at old (row,col) moves to (row,(col+row)%4) */
    var invShiftSub = function() {
      var st = new Uint8Array(16),
        o = new Uint8Array(16);
      for (var k = 0; k < 4; k++) {
        st[4 * k] = (s[k] >>> 24) & 0xff;
        st[4 * k + 1] = (s[k] >>> 16) & 0xff;
        st[4 * k + 2] = (s[k] >>> 8) & 0xff;
        st[4 * k + 3] = s[k] & 0xff;
      }
      for (var idx = 0; idx < 16; idx++) {
        var row = idx % 4,
          col = (idx - row) / 4;
        o[((col + row) % 4) * 4 + row] = INV[st[idx]];
      }
      for (var c2 = 0; c2 < 4; c2++) s[c2] = ((o[4 * c2] << 24) | (o[4 * c2 + 1] << 16) | (o[4 * c2 +
        2] << 8) | o[4 * c2 + 3]) >>> 0;
    };
    var invMix = function() {
      for (var c = 0; c < 4; c++) {
        var a0 = (s[c] >>> 24) & 0xff,
          a1 = (s[c] >>> 16) & 0xff,
          a2 = (s[c] >>> 8) & 0xff,
          a3 = s[c] & 0xff;
        var b0 = (m(a0, 14) ^ m(a1, 11) ^ m(a2, 13) ^ m(a3, 9)) & 0xff;
        var b1 = (m(a0, 9) ^ m(a1, 14) ^ m(a2, 11) ^ m(a3, 13)) & 0xff;
        var b2 = (m(a0, 13) ^ m(a1, 9) ^ m(a2, 14) ^ m(a3, 11)) & 0xff;
        var b3 = (m(a0, 11) ^ m(a1, 13) ^ m(a2, 9) ^ m(a3, 14)) & 0xff;
        s[c] = ((b0 << 24) | (b1 << 16) | (b2 << 8) | b3) >>> 0;
      }
    };
    /* FIPS-197 InvCipher: ARK(nr); for r=nr-1..1 { ISH,ISB,ARK(r),IMC }; ISH,ISB,ARK(0) */
    ark(nr);
    for (var r = nr - 1; r >= 1; r--) {
      invShiftSub();
      ark(r);
      invMix();
    }
    invShiftSub();
    ark(0);
    var out = new Uint8Array(16);
    for (i = 0; i < 4; i++) {
      out[4 * i] = (s[i] >>> 24) & 0xff;
      out[4 * i + 1] = (s[i] >>> 16) & 0xff;
      out[4 * i + 2] = (s[i] >>> 8) & 0xff;
      out[4 * i + 3] = s[i] & 0xff;
    }
    return out;
  }

  function cbcDecrypt(keyBytes, ivBytes, data) {
    var ks = keyExpansion(keyBytes);
    var out = new Uint8Array(data.length);
    var prev = new Uint8Array(ivBytes);
    for (var off = 0; off + 16 <= data.length; off += 16) {
      var blk = new Uint8Array(data.subarray(off, off + 16));
      var dec = decryptBlock(ks, blk);
      for (var i = 0; i < 16; i++) out[off + i] = dec[i] ^ prev[i];
      prev = blk;
    }
    return out;
  }

  function pkcs7Unpad(b) {
    if (!b.length) return b;
    var n = b[b.length - 1];
    if (n < 1 || n > 16) return b;
    for (var i = b.length - n; i < b.length; i++)
      if (b[i] !== n) return b;
    return b.subarray(0, b.length - n);
  }

  /* --- CryptoJS-compatible WordArray --- */
  function WA(words, sigBytes) {
    this.words = words || [];
    this.sigBytes = sigBytes != null ? sigBytes : (this.words.length * 4);
  }
  WA.prototype.clamp = function() {
    if (this.sigBytes % 4) this.words[this.sigBytes >>> 2] &= (0xffffffff << (32 - (this.sigBytes % 4) *
      8)) >>> 0;
    this.words.length = Math.ceil(this.sigBytes / 4);
    return this;
  };
  WA.prototype.concat = function(wa2) {
    var tw = wa2.words,
      ts = wa2.sigBytes;
    this.clamp();
    if (ts % 4) {
      for (var i = 0; i < ts; i++) {
        var thatByte = (tw[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
        this.words[(this.sigBytes + i) >>> 2] |= thatByte << (24 - ((this.sigBytes + i) % 4) * 8);
      }
    } else {
      for (var j = 0; j < ts / 4; j++) this.words[(this.sigBytes >>> 2) + j] = tw[j] | 0;
    }
    this.sigBytes += ts;
    return this;
  };

  function bytesToWords(b) {
    var w = [];
    for (var i = 0; i < b.length; i += 4) {
      w.push(((b[i] << 24) | ((b[i + 1] || 0) << 16) | ((b[i + 2] || 0) << 8) | (b[i + 3] || 0)) | 0);
    }
    return w;
  }

  function waToBytes(wa) {
    var out = new Uint8Array(wa.sigBytes);
    for (var i = 0; i < wa.sigBytes; i++) out[i] = (wa.words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
    return out;
  }

  function utf8ToBytes(s) {
    s = String(s);
    var out = [];
    for (var i = 0; i < s.length; i++) {
      var c = s.charCodeAt(i);
      if (c < 0x80) out.push(c);
      else if (c < 0x800) out.push(0xc0 | (c >> 6), 0x80 | (c & 63));
      else if (c >= 0xd800 && c < 0xdc00 && i + 1 < s.length) {
        var cp = ((c - 0xd800) << 10) + (s.charCodeAt(++i) - 0xdc00) + 0x10000;
        out.push(0xf0 | (cp >> 18), 0x80 | ((cp >> 12) & 63), 0x80 | ((cp >> 6) & 63), 0x80 | (cp & 63));
      } else out.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 63), 0x80 | (c & 63));
    }
    return new Uint8Array(out);
  }

  function bytesToUtf8(b) {
    var s = '';
    var i = 0;
    while (i < b.length) {
      var c = b[i++];
      if (c < 0x80) s += String.fromCharCode(c);
      else if ((c & 0xe0) === 0xc0) s += String.fromCharCode(((c & 0x1f) << 6) | (b[i++] & 0x3f));
      else if ((c & 0xf0) === 0xe0) s += String.fromCharCode(((c & 0x0f) << 12) | ((b[i++] & 0x3f) << 6) |
        (b[i++] & 0x3f));
      else if ((c & 0xf8) === 0xf0) {
        var cp = ((c & 0x07) << 18) | ((b[i++] & 0x3f) << 12) | ((b[i++] & 0x3f) << 6) | (b[i++] & 0x3f);
        cp -= 0x10000;
        s += String.fromCharCode(0xd800 + (cp >> 10), 0xdc00 + (cp & 0x3ff));
      } else s += String.fromCharCode(c);
    }
    return s;
  }

  function b64ToBytes(s) {
    var bin;
    if (typeof atob === 'function') bin = atob(s);
    else {
      var CH = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
      bin = '';
      var clean = String(s).replace(/[^A-Za-z0-9+\/]/g, '');
      var bits = 0,
        acc = 0;
      for (var i = 0; i < clean.length; i++) {
        acc = (acc << 6) | CH.indexOf(clean.charAt(i));
        bits += 6;
        if (bits >= 8) {
          bits -= 8;
          bin += String.fromCharCode((acc >> bits) & 0xff);
        }
      }
    }
    var out = new Uint8Array(bin.length);
    for (var k = 0; k < bin.length; k++) out[k] = bin.charCodeAt(k) & 0xff;
    return out;
  }

  var AES = {
    decrypt: function(cipher, key, cfg) {
      var ctBytes = (typeof cipher === 'string') ? b64ToBytes(cipher) :
        (cipher && cipher.ciphertext ? waToBytes(cipher.ciphertext) : new Uint8Array(0));
      var keyBytes = waToBytes(key);
      var ivBytes = (cfg && cfg.iv) ? waToBytes(cfg.iv) : new Uint8Array(16);
      var pt = pkcs7Unpad(cbcDecrypt(keyBytes, ivBytes, ctBytes));
      var w = bytesToWords(pt);
      return {
        sigBytes: pt.length,
        words: w,
        ciphertext: new WA(w.slice(), pt.length),
        toString: function() {
          return bytesToUtf8(pt);
        }
      };
    }
  };
  return {
    AES: AES,
    enc: {
      Base64: {
        parse: function(s) {
          var b = b64ToBytes(s);
          return new WA(bytesToWords(b), b.length);
        }
      },
      Utf8: {
        parse: function(s) {
          var b = utf8ToBytes(s);
          return new WA(bytesToWords(b), b.length);
        },
        stringify: function(wa) {
          return bytesToUtf8(waToBytes(wa));
        }
      }
    },
    lib: {
      WordArray: {
        create: function(words, sigBytes) {
          return new WA(words ? words.slice() : [], sigBytes != null ? sigBytes : (words ? words
            .length * 4 : 0));
        }
      }
    },
    mode: {
      CBC: {}
    },
    pad: {
      Pkcs7: {}
    }
  };
})();
/* ============================================================
 * AIO-EXACT DECODE (2026-09-13) - fully deobfuscated from
 * All-in-One-Nuvio upstream, all string-table references resolved
 * to literals, syntax-checked, live-verified against upstream.
 * Replaces the previous port whose extraction returned 0 rows.
 * ============================================================ */
'use strict';
var __defProp = Object.defineProperty,
  __getOwnPropSymbols = Object.getOwnPropertySymbols,
  __hasOwnProp = Object.prototype.hasOwnProperty,
  __propIsEnum = Object.prototype.propertyIsEnumerable,
  __defNormalProp = (v1, v2, v3) => (v2 in v1) ? __defProp(v1, v2, {
    enumerable: true,
    configurable: true,
    writable: true,
    value: v3
  }) : v1[v2] = v3,
  __spreadValues = (v4, v5) => {
    for (var v8 in v5 || (v5 = {}))
      if (__hasOwnProp.call(v5, v8)) __defNormalProp(v4, v8, v5[v8]);
    if (__getOwnPropSymbols)
      for (var v8 of __getOwnPropSymbols(v5)) {
        if (__propIsEnum.call(v5, v8)) __defNormalProp(v4, v8, v5[v8]);
      }
    return v4;
  },
  __async = (v9, v10, v11) => {
    return new Promise((v12, v13) => {
      var v16 = v17 => {
          try {
            v19(v11.next(v17));
          } catch (v20) {
            v13(v20);
          }
        },
        v21 = v22 => {
          try {
            v19(v11.throw(v22));
          } catch (v24) {
            v13(v24);
          }
        },
        v19 = v25 => v25.done ? v12(v25.value) : Promise.resolve(v25.value).then(v16, v21);
      v19((v11 = v11.apply(v9, v10)).next());
    });
  },
  TMDB_API_KEY = "439c478a771f35c05022f9feabcca01c",
  TMDB_BASE_URL = "https://api.themoviedb.org/3",
  CASTLE_BASE = "https://api.hlowb.com",
  PKG = "com.external.castle",
  CHANNEL = "IndiaA",
  CLIENT = "1",
  LANG = "en-US",
  API_HEADERS = {
    "User-Agent": "okhttp/4.9.3",
    Accept: "application/json",
    "Accept-Language": "en-US,en;q=0.9",
    Connection: "Keep-Alive",
    Referer: CASTLE_BASE
  },
  PLAYBACK_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36",
    Accept: "video/webm,video/ogg,video/*;q=0.9,application/ogg;q=0.7,audio/*;q=0.6,*/*;q=0.5",
    "Accept-Language": "en-US,en;q=0.9",
    "Accept-Encoding": "identity",
    Connection: "keep-alive",
    "Sec-Fetch-Dest": "video",
    "Sec-Fetch-Mode": "no-cors",
    "Sec-Fetch-Site": "cross-site",
    DNT: "1"
  };

function makeRequest(v26) {
  return __async(this, arguments, function*(v27, v28 = {}) {
    try {
      const v29 = yield fetch(v27, {
        method: v28.method || "GET",
        headers: __spreadValues(__spreadValues({}, API_HEADERS), v28.headers),
        body: v28.body
      });
      if (!v29.ok) throw new Error("HTTP " + v29.status + ": " + v29.statusText);
      return v29;
    } catch (v30) {
      console.error("[Castle] Request failed for " + v27 + ": " + v30.message);
      throw v30;
    }
  });
}

function extractCipherFromResponse(v31) {
  return __async(this, null, function*() {
    const v32 = yield v31.text(), v33 = v32.trim();
    if (!v33) throw new Error("Empty response");
    try {
      const v34 = JSON.parse(v33);
      if (v34 && v34.data && typeof v34.data === "string") return v34.data.trim();
    } catch (v35) {}
    return v33;
  });
}

function extractDataBlock(v36) {
  if (v36 && v36.data && typeof v36.data === "object") return v36.data;
  return v36 || ({});
}

function getTMDBDetails(v37, v38) {
  return __async(this, null, function*() {
    const v39 = v38 === "tv" ? "tv" : "movie",
      v40 = TMDB_BASE_URL + "/" + v39 + "/" + v37 + "?api_key=" + TMDB_API_KEY +
      "&append_to_response=external_ids",
      v41 = yield makeRequest(v40), v42 = yield v41.json(), v43 = v38 === "tv" ? v42.name : v42.title,
        v44 = v38 === "tv" ? v42.first_air_date : v42.release_date, v45 = v44 ? parseInt(v44.split("-")[
          0]) : null;
    return {
      title: v43,
      year: v45,
      tmdbId: v37
    };
  });
}

function decryptCastle(v46, v47) {
  return __async(this, null, function*() {
    console.log("[Castle] Starting local AES-CBC decryption...");
    try {
      const v48 = typeof require === "function" ? (function() {
        try {
          return require("crypto-js");
        } catch (_nvE) {
          return __nvCastleCryptoJs;
        }
      })() : __nvCastleCryptoJs;
      if (typeof __crypto_aes_decrypt_raw !== "undefined") {
        const v49 = v48.AES.decrypt;
        v48.AES.decrypt = function(v50, v51, v52) {
          try {
            const v53 = v54 => {
                const v56 = new Uint8Array(v54.sigBytes);
                for (let v57 = 0; v57 < v54.sigBytes; v57++) {
                  v56[v57] = v54.words[v57 >>> 2] >>> 24 - v57 % 4 * 8 & 255;
                }
                return v56;
              },
              v58 = v59 => {
                if (v59 instanceof Uint8Array) return v59;
                if (v59 instanceof ArrayBuffer) return new Uint8Array(v59);
                if (v59 && typeof v59.length === "number") return new Uint8Array(Array.prototype.slice
                  .call(v59));
                return new Uint8Array(0);
              },
              v61 = typeof v50 === "string" ? new Uint8Array(Array.from(atob(v50), v62 => v62
                .charCodeAt(0))) : v50.ciphertext ? v53(v50.ciphertext) : v58(v50),
              v63 = v53(v51),
              v64 = v52 && v52.iv ? v53(v52.iv) : new Uint8Array(0),
              v65 = v52 && v52.mode || "AES-CBC",
              v66 = typeof Int8Array !== "undefined" ? new Int8Array(v63.buffer) : v63,
              v67 = typeof Int8Array !== "undefined" ? new Int8Array(v64.buffer) : v64,
              v68 = typeof Int8Array !== "undefined" ? new Int8Array(v61.buffer) : v61,
              v69 = __crypto_aes_decrypt_raw(v65, v66, v67, v68),
              v70 = new TextDecoder().decode(v69);
            return {
              toString: function() {
                return v70;
              }
            };
          } catch (v71) {
            return (console.error("[Castle JNI Patch] Decrypt failed, falling back:", v71), v49.call(v48
              .AES, v50, v51, v52));
          }
        };
      }
      const v72 = "T!BgJB",
        v73 = v48.enc.Base64.parse(v47),
        v74 = v48.enc.Utf8.parse(v72),
        v75 = v73.concat(v74);
      let v76;
      if (v75.sigBytes < 16) {
        const v77 = v48.lib.WordArray.create(new Array(16 - v75.sigBytes).fill(0));
        v76 = v75.concat(v77);
      } else v75.sigBytes > 16 ? v76 = v48.lib.WordArray.create(v75.words.slice(0, 4), 16) : v76 = v75;
      const v78 = v76,
        v79 = v48.AES.decrypt(v46, v76, {
          iv: v78,
          mode: v48.mode.CBC,
          padding: v48.pad.Pkcs7
        }),
        v80 = v79.toString(v48.enc.Utf8);
      if (!v80) throw new Error("Decryption resulted in empty string (possible key/IV mismatch)");
      return (console.log("[Castle] Local decryption successful"), v80);
    } catch (v81) {
      console.error("[Castle] Local decryption failed: " + v81.message);
      throw v81;
    }
  });
}

function getSecurityKey() {
  return __async(this, null, function*() {
    console.log("[Castle] Fetching security key...");
    const v82 = CASTLE_BASE + "/v0.1/system/getSecurityKey/1?channel=" + CHANNEL + "&clientType=" +
      CLIENT + "&lang=" + LANG,
      v83 = yield makeRequest(v82), v84 = yield v83.json();
    if (v84.code !== 200 || !v84.data) throw new Error("Security key API error: " + JSON.stringify(v84));
    return (console.log("[Castle] Security key obtained"), v84.data);
  });
}

function searchCastle(v85, v86, v87 = 1, v88 = 30) {
  return __async(this, null, function*() {
    console.log("[Castle] Searching for: " + v86);
    const v89 = new URLSearchParams({
        channel: CHANNEL,
        clientType: CLIENT,
        keyword: v86,
        lang: LANG,
        mode: "1",
        packageName: PKG,
        page: v87.toString(),
        size: v88.toString()
      }),
      v90 = CASTLE_BASE + "/film-api/v1.1.0/movie/searchByKeyword?" + v89.toString(),
      v91 = yield makeRequest(v90), v92 = yield extractCipherFromResponse(v91), v93 = yield decryptCastle(
        v92, v85);
    return JSON.parse(v93);
  });
}

function getDetails(v94, v95) {
  return __async(this, null, function*() {
    console.log("[Castle] Fetching details for movieId: " + v95);
    const v96 = CASTLE_BASE + "/film-api/v1.9.9/movie?channel=" + CHANNEL + "&clientType=" + CLIENT +
      "&lang=" + LANG + "&movieId=" + v95 + "&packageName=" + PKG,
      v97 = yield makeRequest(v96), v98 = yield extractCipherFromResponse(v97), v99 = yield decryptCastle(
        v98, v94);
    return JSON.parse(v99);
  });
}

function getVideoV1(v100, v101, v102, v103, v104 = 2) {
  return __async(this, null, function*() {
    console.log("[Castle] Fetching video (v1) for movieId: " + v101 + ", languageId: " + v103);
    const v105 = CASTLE_BASE + "/film-api/v2.0.1/movie/getVideo2?clientType=" + CLIENT + "&packageName=" +
      PKG + "&channel=" + CHANNEL + "&lang=" + LANG,
      v106 = {
        mode: "1",
        appMarket: "GuanWang",
        clientType: CLIENT,
        woolUser: "false",
        apkSignKey: "ED0955EB04E67A1D9F3305B95454FED485261475",
        androidVersion: "13",
        movieId: v101.toString(),
        episodeId: v102.toString(),
        languageId: v103.toString(),
        isNewUser: "true",
        resolution: v104.toString(),
        packageName: PKG
      },
      v107 = yield makeRequest(v105, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(v106)
      }), v108 = yield extractCipherFromResponse(v107), v109 = yield decryptCastle(v108, v100);
    return JSON.parse(v109);
  });
}

function getVideo2(v110, v111, v112, v113 = 2) {
  return __async(this, null, function*() {
    console.log("[Castle] Fetching video (v2) for movieId: " + v111 + ", episodeId: " + v112);
    const v114 = CASTLE_BASE + "/film-api/v2.0.1/movie/getVideo2?clientType=" + CLIENT + "&packageName=" +
      PKG + "&channel=" + CHANNEL + "&lang=" + LANG,
      v115 = {
        mode: "1",
        appMarket: "GuanWang",
        clientType: CLIENT,
        woolUser: "false",
        apkSignKey: "ED0955EB04E67A1D9F3305B95454FED485261475",
        androidVersion: "13",
        movieId: v111.toString(),
        episodeId: v112.toString(),
        isNewUser: "true",
        resolution: v113.toString(),
        packageName: PKG
      },
      v116 = yield makeRequest(v114, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(v115)
      }), v117 = yield extractCipherFromResponse(v116), v118 = yield decryptCastle(v117, v110);
    return JSON.parse(v118);
  });
}

function findCastleMovieId(v119, v120) {
  return __async(this, null, function*() {
    const v121 = v120.year ? v120.title + " " + v120.year : v120.title,
      v122 = yield searchCastle(v119, v121), v123 = extractDataBlock(v122), v124 = v123.rows || [];
    if (v124.length === 0) throw new Error("No search results found");
    for (const v125 of v124) {
      const v126 = (v125.title || v125.name || "").toLowerCase(),
        v127 = v120.title.toLowerCase();
      if (v126.includes(v127) || v127.includes(v126)) {
        const v128 = v125.id || v125.redirectId || v125.redirectIdStr;
        if (v128) return (console.log("[Castle] Found match: " + (v125.title || v125.name) + " (id: " +
          v128 + ")"), v128.toString());
      }
    }
    const v129 = v124[0],
      v130 = v129.id || v129.redirectId || v129.redirectIdStr;
    if (v130) return (console.log("[Castle] Using first result: " + (v129.title || v129.name) + " (id: " +
      v130 + ")"), v130.toString());
    throw new Error("Could not extract movie ID from search results");
  });
}

function getQualityValue(v131) {
  if (!v131) return 0;
  const v132 = v131.toString().toLowerCase().replace(/^(sd|hd|fhd|uhd|4k)\s*/i, "").replace(/p$/, "").trim(),
    v133 = {
      "4k": 2160,
      "2160": 2160,
      "1440": 1440,
      "1080": 1080,
      "720": 720,
      "480": 480,
      "360": 360,
      "240": 240
    };
  if (v133[v132]) return v133[v132];
  const v134 = parseInt(v132);
  if (!isNaN(v134) && v134 > 0) return v134;
  return 0;
}

function formatSize(v135) {
  if (typeof v135 !== "number" || v135 <= 0) return "Unknown";
  if (v135 > 1000000000) return (v135 / 1000000000).toFixed(2) + " GB";
  return (v135 / 1000000).toFixed(0) + " MB";
}

function resolutionToQuality(v136) {
  const v137 = {
    1: "480p",
    2: "720p",
    3: "1080p"
  };
  return v137[v136] || v136 + "p";
}

function processVideoResponse(v138, v139, v140, v141, v142, v143) {
  const v144 = [],
    v145 = extractDataBlock(v138),
    v146 = v145.videoUrl;
  if (!v146) return (console.log("[Castle] No videoUrl found in response"), v144);
  const v147 = [];
  v145.subtitles && Array.isArray(v145.subtitles) && v145.subtitles.forEach(v148 => {
    v148.url && v147.push({
      url: v148.url,
      language: v148.abbreviate || "Unknown",
      name: v148.title || v148.abbreviate || "Unknown",
      headers: PLAYBACK_HEADERS
    });
  });
  let v149 = v139.title || "Unknown";
  v139.year && (v149 += " (" + v139.year + ")");
  v140 && v141 && (v149 = v139.title + " S" + String(v140).padStart(2, "0") + "E" + String(v141).padStart(2,
    "0"));
  const v150 = resolutionToQuality(v142);
  if (v145.videos && Array.isArray(v145.videos))
    for (const v151 of v145.videos) {
      let v152 = v151.resolutionDescription || v151.resolution || v150;
      v152 = v152.replace(/^(SD|HD|FHD)\s+/i, "");
      const v153 = v143 ? "Castle " + v143 + " - " + v152 : "Castle - " + v152;
      v144.push({
        name: v153,
        title: v149,
        url: v151.url || v146,
        quality: v152,
        size: formatSize(v151.size),
        headers: PLAYBACK_HEADERS,
        provider: "castle",
        subtitles: v147
      });
    } else {
      const v154 = v143 ? "Castle " + v143 + " - " + v150 : "Castle - " + v150;
      v144.push({
        name: v154,
        title: v149,
        url: v146,
        quality: v150,
        size: formatSize(v145.size),
        headers: PLAYBACK_HEADERS,
        provider: "castle",
        subtitles: v147
      });
    }
  return v144;
}

function getStreams(v155, v156, v157, v158) {
  return __async(this, null, function*() {
    console.log("[Castle] Starting extraction for TMDB ID: " + v155 + ", Type: " + v156 + (v156 === "tv" ?
      ", S:" + v157 + "E:" + v158 : ""));
    try {
      const v159 = yield getTMDBDetails(v155, v156);
      console.log("[Castle] TMDB Info: \"" + v159.title + "\" (" + (v159.year || "N/A") + ")");
      const v160 = yield getSecurityKey(), v161 = yield findCastleMovieId(v160, v159);
      let v162 = yield getDetails(v160, v161), v163 = v161;
      if (v156 === "tv" && v157 && v158) {
        const v164 = extractDataBlock(v162),
          v165 = v164.seasons || [],
          v166 = v165.find(v167 => v167.number === v157);
        v166 && v166.movieId && v166.movieId !== v161 && (console.log("[Castle] Fetching season " + v157 +
          " details..."), v162 = yield getDetails(v160, v166.movieId.toString()), v163 = v166.movieId
          .toString());
      }
      const v168 = extractDataBlock(v162),
        v169 = v168.episodes || [];
      let v170 = null;
      if (v156 === "tv" && v157 && v158) {
        const v171 = v169.find(v172 => v172.number === v158);
        v171 && v171.id && (v170 = v171.id.toString());
      } else v169.length > 0 && (v170 = v169[0].id.toString());
      if (!v170) throw new Error("Could not find episode ID");
      const v173 = v169.find(v174 => v174.id.toString() === v170),
        v175 = v173 && v173.tracks || [],
        v176 = 2,
        v177 = [];
      for (const v178 of v175) {
        const v179 = v178.languageName || v178.abbreviate || "Unknown";
        if (v178.existIndividualVideo && v178.languageId) try {
          console.log("[Castle] Fetching " + v179 + " (languageId: " + v178.languageId + ")");
          const v180 = yield getVideoV1(v160, v163, v170, v178.languageId, v176), v181 =
            processVideoResponse(v180, v159, v157, v158, v176, "[" + v179 + "]");
          v181.length > 0 && (console.log("[Castle] ✅ " + v179 + ": Found " + v181.length + " streams"),
            v177.push(...v181));
        } catch (v182) {
          console.log("[Castle] ⚠️ " + v179 + ": Failed - " + v182.message);
        }
      }
      if (v177.length === 0) {
        console.log("[Castle] Falling back to shared stream (v2)");
        const v183 = yield getVideo2(v160, v163, v170, v176), v184 = processVideoResponse(v183, v159,
          v157, v158, v176, "[Shared]");
        v177.push(...v184);
      }
      return (v177.sort((v185, v186) => getQualityValue(v186.quality) - getQualityValue(v185.quality)),
        console.log("[Castle] Total streams found: " + v177.length), v177);
    } catch (v187) {
      return (console.error("[Castle] Error: " + v187.message), []);
    }
  });
}
module["exports"] = {
  'getStreams': getStreams
};
/* ===== nvio light deadline wrapper (8s) =================================
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
            }, 9000);
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
  var __LABEL = 'Castle';
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
