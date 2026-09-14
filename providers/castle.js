/* nv-plugins castle.js v6.0.0 (pack 4.40.0 "all providers readable, no device killer")
 * Clean readable port of Eclipsia (codeberg eclipsia/nuvio-plugin) "Karnis." = Castle,
 * replacing the machine-renamed (v-name) 4.39 build. Endpoints kept from the device-verified
 * 4.39 file: https://api.hlowb.com Castle app API (AES-CBC-encrypted JSON) -
 * /v0.1/system/getSecurityKey/1?channel=IndiaA, /film-api/v1.1.0/movie/searchByKeyword,
 * /film-api/v1.9.9/movie (details/seasons/episodes), /film-api/v2.0.1/movie/getVideo2 (POST,
 * resolutions 3=1080p / 2=720p). TMDB api.themoviedb.org/3 key 439c478a771f35c05022f9feabcca01c.
 * Device notes: NO require, NO TextDecoder - decryption uses the verbatim device-proven
 *   __nvCastleCryptoJs pure-JS AES-CBC block from 4.39, with the optional native fast path
 *   (__crypto_aes_decrypt_raw when the host defines it) decoding via String.fromCharCode;
 *   every timer guarded; karnis flow kept (getSecurityKey -> searchByKeyword -> details ->
 *   getVideo2/getVideoV1 -> processVideoResponse, individual-video tracks limited to
 *   english/hindi/bangla/bengali, getQualityValue gate drops rows below 720p).
 * Lanes: native hlowb first, proven WINGS text lane (api.speedracelight.com / vidking) fallback.
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
/* nv-plugins best-settings pass 4.23.0 (kept from 4.39): hard 8s deadline on every
   network call. Exposed as __nvFetch so the WINGS lane and the nvio post-filter
   probe reuse the same bounded fetch. Timer-guarded: the device QuickJS realm
   ships no setTimeout, in which case the plain fetch promise is returned. */
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
/* ===== nv-plugins castle native lane v6.0.0 (readable Eclipsia "Karnis." port) =====
   Flow (karnis.js): getTMDBDetails -> getSecurityKey -> searchByKeyword -> details
   (season switch for TV) -> episode lookup -> getVideoV1 (per allowed-language track,
   when individual videos exist) or shared getVideo2 -> processVideoResponse.
   karnis device killers fixed here: require("crypto-js") -> pure-JS __nvCastleCryptoJs
   (no require anywhere), new TextDecoder().decode() -> String.fromCharCode loop.
   Endpoints/params/headers/naming kept from the device-verified 4.39 castle.js. */
'use strict';

var PROVIDER_NAME = 'Castle';
var TMDB_API_URL = 'https://api.themoviedb.org/3';
var TMDB_API_KEY = '439c478a771f35c05022f9feabcca01c'; /* pack key (4.39 device-verified) */
var CASTLE_BASE = 'https://api.hlowb.com';
var PKG = 'com.external.castle';
var CHANNEL = 'IndiaA';
var CLIENT = '1';
var LANG = 'en-US';
var KEY_SUFFIX = 'T!BgJB'; /* Castle app key suffix (karnis: KARNIS_SUFFIX) */

var API_HEADERS = {
  'User-Agent': 'okhttp/4.9.3',
  'Accept': 'application/json',
  'Accept-Language': 'en-US,en;q=0.9',
  'Connection': 'Keep-Alive',
  'Referer': CASTLE_BASE
};

var PLAYBACK_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36',
  'Accept': 'video/webm,video/ogg,video/*;q=0.9,application/ogg;q=0.7,audio/*;q=0.6,*/*;q=0.5',
  'Accept-Language': 'en-US,en;q=0.9',
  'Accept-Encoding': 'identity',
  'Connection': 'keep-alive',
  'Sec-Fetch-Dest': 'video',
  'Sec-Fetch-Mode': 'no-cors',
  'Sec-Fetch-Site': 'cross-site',
  'DNT': '1'
};

var RESOLUTIONS = [3, 2]; /* 3 = 1080p, 2 = 720p (karnis) */
var QUALITY_NAME_MAP = { '3': '1080p', '2': '720p', '1': '480p' };
var ALLOWED_LANGS = ['english', 'hindi', 'bangla', 'bengali']; /* individual-video tracks */

function log(msg) {
  try { console.log('[Castle] ' + msg); } catch (e) { /* console may be absent */ }
}

function isAllowedLang(name) {
  if (!name) return false;
  var n = String(name).toLowerCase();
  for (var i = 0; i < ALLOWED_LANGS.length; i++)
    if (n.indexOf(ALLOWED_LANGS[i]) !== -1) return true;
  return false;
}

/* ---------- HTTP ---------- */

/* throws on !ok so callers can fall through; every call site is try/caught (fail-soft) */
async function makeRequest(url, options) {
  options = options || {};
  var headers = Object.assign({}, API_HEADERS, options.headers || {});
  var res = await __nvFetch(url, {
    method: options.method || 'GET',
    headers: headers,
    body: options.body
  });
  if (!res || !res.ok) throw new Error('HTTP ' + (res ? res.status : 'no response'));
  return res;
}

/* responses are either raw cipher text or {"data": "<cipher>"} */
async function extractCipherFromResponse(res) {
  var text = (await res.text()).trim();
  if (!text) throw new Error('Empty response');
  try {
    var json = JSON.parse(text);
    if (json && json.data && typeof json.data === 'string') return json.data.trim();
  } catch (e) { /* plain cipher text */ }
  return text;
}

function extractDataBlock(obj) {
  return (obj && obj.data && typeof obj.data === 'object') ? obj.data : (obj || {});
}

/* ---------- decryption (no require / no TextDecoder) ---------- */

function waToBytes(wa) {
  var out = new Uint8Array(wa.sigBytes);
  for (var i = 0; i < wa.sigBytes; i++)
    out[i] = (wa.words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
  return out;
}

function toArg(u8) { /* __crypto_aes_decrypt_raw expects Int8Array views when available */
  if (u8 instanceof Uint8Array && typeof Int8Array !== 'undefined') return new Int8Array(u8.buffer, u8.byteOffset, u8.byteLength);
  if (u8 instanceof ArrayBuffer && typeof Int8Array !== 'undefined') return new Int8Array(u8);
  return u8;
}

function cipherToBytes(cipher) {
  if (typeof cipher === 'string')
    return new Uint8Array(Array.prototype.map.call(atob(cipher), function (c) { return c.charCodeAt(0); }));
  if (cipher && cipher.ciphertext) return waToBytes(cipher.ciphertext);
  if (cipher instanceof Uint8Array) return cipher;
  if (cipher instanceof ArrayBuffer) return new Uint8Array(cipher);
  if (cipher && typeof cipher.length === 'number') return new Uint8Array(Array.prototype.slice.call(cipher));
  return new Uint8Array(0);
}

/* AES output here is JSON text, safe to map byte-by-byte (replaces TextDecoder) */
function bytesToText(bytes) {
  var out = '';
  for (var i = 0; i < bytes.length; i++) out += String.fromCharCode(bytes[i] & 0xff);
  return out;
}

/* fallback chain: host-native __crypto_aes_decrypt_raw when defined -> pure-JS lib */
async function decryptCastle(encryptedB64, securityKeyB64) {
  var CryptoJS = __nvCastleCryptoJs; /* device-proven CryptoJS-compatible pure-JS subset */

  if (typeof __crypto_aes_decrypt_raw === 'function' && !CryptoJS.AES.__nvRawPatched) {
    CryptoJS.AES.__nvRawPatched = true;
    var originalDecrypt = CryptoJS.AES.decrypt;
    CryptoJS.AES.decrypt = function (cipher, key, options) {
      try {
        var cipherBytes = cipherToBytes(cipher);
        var keyBytes = waToBytes(key);
        var ivBytes = (options && options.iv) ? waToBytes(options.iv) : new Uint8Array(16);
        if (ivBytes.length !== 16) throw new Error('Invalid IV length: ' + ivBytes.length);
        var resBytes = __crypto_aes_decrypt_raw('AES-CBC', toArg(keyBytes), toArg(ivBytes), toArg(cipherBytes));
        return { toString: function () { return bytesToText(resBytes); } };
      } catch (e) {
        return originalDecrypt.call(CryptoJS.AES, cipher, key, options);
      }
    };
  }

  /* securityKey(base64) + suffix, truncated/zero-padded to 16 bytes (karnis key schedule) */
  var keyMaterial = CryptoJS.enc.Base64.parse(securityKeyB64)
    .concat(CryptoJS.enc.Utf8.parse(KEY_SUFFIX));
  var finalKey;
  if (keyMaterial.sigBytes < 16) {
    finalKey = keyMaterial.concat(CryptoJS.lib.WordArray.create(new Array(16 - keyMaterial.sigBytes).fill(0)));
  } else if (keyMaterial.sigBytes > 16) {
    finalKey = CryptoJS.lib.WordArray.create(keyMaterial.words.slice(0, 4), 16);
  } else {
    finalKey = keyMaterial;
  }

  var decrypted = CryptoJS.AES.decrypt(encryptedB64, finalKey, {
    iv: finalKey,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  });
  var result = decrypted.toString(CryptoJS.enc.Utf8);
  if (!result) throw new Error('Decryption resulted in empty string');
  return result;
}

/* encrypted request helper: fetch -> extract cipher -> decrypt -> JSON */
async function castleRequest(url, options) {
  var cipher = await extractCipherFromResponse(await makeRequest(url, options));
  var decrypted = await decryptCastle(cipher, options._securityKey);
  return JSON.parse(decrypted);
}

/* ---------- API steps (karnis flow, 4.39 endpoints) ---------- */

async function getTMDBDetails(tmdbId, mediaType) {
  var endpoint = mediaType === 'tv' ? 'tv' : 'movie';
  var url = TMDB_API_URL + '/' + endpoint + '/' + tmdbId +
    '?api_key=' + TMDB_API_KEY + '&append_to_response=external_ids';
  var data = await (await makeRequest(url)).json();
  var title = mediaType === 'tv' ? data.name : data.title;
  var releaseDate = mediaType === 'tv' ? data.first_air_date : data.release_date;
  return { title: title, year: releaseDate ? parseInt(releaseDate, 10) : null, tmdbId: tmdbId };
}

async function getSecurityKey() {
  var url = CASTLE_BASE + '/v0.1/system/getSecurityKey/1?channel=' + CHANNEL +
    '&clientType=' + CLIENT + '&lang=' + LANG;
  var data = await (await makeRequest(url)).json();
  if (data.code !== 200 || !data.data)
    throw new Error('Security key API error: ' + JSON.stringify(data));
  return data.data;
}

async function searchCastle(securityKey, keyword, page, size) {
  page = page || 1;
  size = size || 30;
  var params = new URLSearchParams({
    channel: CHANNEL, clientType: CLIENT, keyword: keyword, lang: LANG,
    mode: '1', packageName: PKG, page: String(page), size: String(size)
  });
  return castleRequest(CASTLE_BASE + '/film-api/v1.1.0/movie/searchByKeyword?' + params.toString(),
    { _securityKey: securityKey });
}

async function getCastleDetails(securityKey, movieId) {
  return castleRequest(CASTLE_BASE + '/film-api/v1.9.9/movie?channel=' + CHANNEL +
    '&clientType=' + CLIENT + '&lang=' + LANG + '&movieId=' + movieId + '&packageName=' + PKG,
    { _securityKey: securityKey });
}

function videoBody(fields) {
  return JSON.stringify(Object.assign({
    mode: '1',
    appMarket: 'GuanWang',
    clientType: CLIENT,
    woolUser: 'false',
    apkSignKey: 'ED0955EB04E67A1D9F3305B95454FED485261475',
    androidVersion: '13',
    isNewUser: 'true',
    packageName: PKG
  }, fields));
}

async function getVideoV1(securityKey, movieId, episodeId, languageId, resolution) {
  return castleRequest(CASTLE_BASE + '/film-api/v2.0.1/movie/getVideo2?clientType=' + CLIENT +
    '&packageName=' + PKG + '&channel=' + CHANNEL + '&lang=' + LANG, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: videoBody({
      movieId: String(movieId), episodeId: String(episodeId),
      languageId: String(languageId), resolution: String(resolution)
    }),
    _securityKey: securityKey
  });
}

async function getVideo2(securityKey, movieId, episodeId, resolution) {
  return castleRequest(CASTLE_BASE + '/film-api/v2.0.1/movie/getVideo2?clientType=' + CLIENT +
    '&packageName=' + PKG + '&channel=' + CHANNEL + '&lang=' + LANG, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: videoBody({
      movieId: String(movieId), episodeId: String(episodeId),
      resolution: String(resolution)
    }),
    _securityKey: securityKey
  });
}

async function findCastleMovieId(securityKey, tmdbInfo) {
  var searchTerm = tmdbInfo.year ? tmdbInfo.title + ' ' + tmdbInfo.year : tmdbInfo.title;
  var searchResult = await searchCastle(securityKey, searchTerm);
  var rows = extractDataBlock(searchResult).rows || [];
  if (!rows.length) throw new Error('No search results found');

  var searchTitle = tmdbInfo.title.toLowerCase();
  var match = rows.find(function (item) {
    var t = String(item.title || item.name || '').toLowerCase();
    return t.indexOf(searchTitle) !== -1 || searchTitle.indexOf(t) !== -1;
  }) || rows[0];

  var id = match.id || match.redirectId || match.redirectIdStr;
  if (!id) throw new Error('Could not extract movie ID from search results');
  return id.toString();
}

/* ---------- stream rows ---------- */

function getQualityValue(quality) {
  if (!quality) return 0;
  var clean = String(quality).toLowerCase()
    .replace(/^(sd|hd|fhd|uhd|4k)\s*/i, '')
    .replace(/p$/, '')
    .trim();
  var map = { '4k': 2160, '2160': 2160, '1440': 1440, '1080': 1080, '720': 720, '480': 480, '360': 360, '240': 240 };
  if (map[clean]) return map[clean];
  var parsed = parseInt(clean, 10);
  return isNaN(parsed) ? 0 : parsed;
}

function formatSize(sizeValue) {
  if (typeof sizeValue !== 'number' || sizeValue <= 0) return 'Unknown';
  return sizeValue > 1e9
    ? (sizeValue / 1e9).toFixed(2) + ' GB'
    : (sizeValue / 1e6).toFixed(0) + ' MB';
}

function resolutionToQuality(resolution) {
  return QUALITY_NAME_MAP[String(resolution)] || resolution + 'p';
}

function processVideoResponse(videoData, mediaInfo, seasonNum, episodeNum, resolution, languageLabel) {
  var data = extractDataBlock(videoData);
  var videoUrl = data.videoUrl;
  if (!videoUrl) return [];

  var subtitles = (data.subtitles || [])
    .filter(function (s) { return s && s.url; })
    .map(function (s) {
      return {
        url: s.url,
        language: s.abbreviate || 'Unknown',
        name: s.title || s.abbreviate || 'Unknown',
        headers: PLAYBACK_HEADERS
      };
    });

  var mediaTitle = mediaInfo.title || 'Unknown';
  if (seasonNum && episodeNum) {
    mediaTitle += ' S' + String(seasonNum).padStart(2, '0') + 'E' + String(episodeNum).padStart(2, '0');
  } else if (mediaInfo.year) {
    mediaTitle += ' (' + mediaInfo.year + ')';
  }

  var fallbackQuality = resolutionToQuality(resolution);
  var makeStream = function (url, rawQuality, size) {
    var q = String(rawQuality || fallbackQuality).replace(/^(SD|HD|FHD)\s+/i, '');
    if (getQualityValue(q) < 720) return null; /* karnis gate: nothing below 720p */
    var label = languageLabel
      ? PROVIDER_NAME + ' ' + languageLabel + ' - ' + q
      : PROVIDER_NAME + ' - ' + q;
    return {
      name: label,
      title: mediaTitle,
      url: url,
      quality: q,
      size: formatSize(size),
      headers: PLAYBACK_HEADERS,
      subtitles: subtitles
    };
  };

  if (data.videos && data.videos.length) {
    var out = [];
    for (var i = 0; i < data.videos.length; i++) {
      var v = data.videos[i];
      var row = makeStream(v.url || videoUrl, v.resolutionDescription || v.resolution, v.size);
      if (row) out.push(row);
    }
    return out;
  }
  var single = makeStream(videoUrl, fallbackQuality, data.size);
  return single ? [single] : [];
}

/* ---------- entry point ---------- */

async function getStreams(tmdbId, mediaType, season, episode) {
  var isTv = mediaType === 'tv' || mediaType === 'series';
  var seasonNum = isTv && season != null ? parseInt(season, 10) : null;
  var episodeNum = isTv && episode != null ? parseInt(episode, 10) : null;
  if (isTv && (seasonNum == null || episodeNum == null)) return [];

  try {
    var tmdbInfo = await getTMDBDetails(tmdbId, isTv ? 'tv' : 'movie');
    if (!tmdbInfo || !tmdbInfo.title) return [];
    var securityKey = await getSecurityKey();
    var rootMovieId = await findCastleMovieId(securityKey, tmdbInfo);
    var currentMovieId = rootMovieId;
    log('movieId ' + rootMovieId + ' for "' + tmdbInfo.title + '"');

    /* TV: switch to the season's own movieId when the show has multiple seasons */
    if (isTv && seasonNum != null) {
      var rootData = extractDataBlock(await getCastleDetails(securityKey, rootMovieId));
      var seasons = rootData.seasons || [];
      if (seasons.length > 1) {
        var seasonObj = seasons.find(function (s) { return Number(s.number) === seasonNum; });
        if (seasonObj && seasonObj.movieId && String(seasonObj.movieId) !== String(rootMovieId))
          currentMovieId = String(seasonObj.movieId);
      }
    }

    var detailsData = extractDataBlock(await getCastleDetails(securityKey, currentMovieId));
    var episodes = detailsData.episodes || [];

    var episodeObj = null;
    if (isTv) {
      episodeObj = episodes.find(function (e) { return Number(e.number) === episodeNum; }) || null;
    } else {
      episodeObj = episodes.length ? episodes[0] : null;
    }
    if (!episodeObj || !episodeObj.id) throw new Error('Could not find episode');
    var episodeId = String(episodeObj.id);

    var tracks = (episodeObj.tracks || []).filter(function (t) {
      return t && isAllowedLang(t.languageName || t.abbreviate);
    });
    var hasIndivVideo = tracks.some(function (t) {
      return t && t.existIndividualVideo === true;
    });
    var allStreams = [];

    /* shared track: first resolution that yields rows wins (1080p preferred) */
    async function trySharedResolutions() {
      for (var r = 0; r < RESOLUTIONS.length; r++) {
        try {
          var rows = processVideoResponse(
            await getVideo2(securityKey, currentMovieId, episodeId, RESOLUTIONS[r]),
            tmdbInfo, seasonNum, episodeNum, RESOLUTIONS[r], null
          );
          if (rows.length) { allStreams.push.apply(allStreams, rows); return true; }
        } catch (e) { /* try next resolution */ }
      }
      return false;
    }

    if (!hasIndivVideo) {
      await trySharedResolutions();
    } else {
      var loaded = false;
      for (var t = 0; t < tracks.length; t++) {
        var track = tracks[t];
        if (!track || track.languageId == null) continue;
        var langName = track.languageName || track.abbreviate || 'Unknown';
        for (var r2 = 0; r2 < RESOLUTIONS.length; r2++) {
          try {
            var rows2 = processVideoResponse(
              await getVideoV1(securityKey, currentMovieId, episodeId, track.languageId, RESOLUTIONS[r2]),
              tmdbInfo, seasonNum, episodeNum, RESOLUTIONS[r2], '[' + langName + ']'
            );
            if (rows2.length) { allStreams.push.apply(allStreams, rows2); loaded = true; }
          } catch (e2) { /* fail-soft: next track/resolution */ }
        }
      }
      if (!loaded) await trySharedResolutions();
    }

    /* dedupe by URL, best quality first (karnis) */
    allStreams.sort(function (a, b) { return getQualityValue(b.quality) - getQualityValue(a.quality); });
    var seen = {};
    return allStreams.filter(function (s) {
      if (!s || !s.url || seen[s.url]) return false;
      seen[s.url] = true;
      return true;
    });
  } catch (e) {
    log('extraction failed: ' + (e && e.message));
    return [];
  }
}

if (typeof module !== 'undefined' && module.exports) module.exports = { getStreams: getStreams };
else if (typeof globalThis !== 'undefined') globalThis.getStreams = getStreams;
/* ===== nv-plugins light deadline wrapper (kept from 4.39) =================
   Bounds the native lane's total runtime to ~9s where timers exist so the
   stream sheet is never held. Device QuickJS ships no timers -> the wrapper
   is a no-op there (native lane simply runs to completion, fail-soft).
   Opt-out: set SCRAPER_SETTINGS.postFilter = false. ==================== */
(function () {
  var G = typeof globalThis !== 'undefined' ? globalThis : this;
  try {
    var orig = module.exports && module.exports.getStreams;
    if (typeof orig !== 'function') return;
    module.exports.getStreams = function () {
      var args = arguments, self = this;
      var base = Promise.resolve(orig.apply(self, args)).then(function (rows) {
        return Array.isArray(rows) ? rows : [];
      }, function () { return []; });
      if (typeof setTimeout !== 'function') return base; /* device: no timers */
      return Promise.race([
        base,
        new Promise(function (res) {
          var t = setTimeout(function () { res([]); }, 9000);
          if (t && typeof t.unref === 'function') t.unref();
        })
      ]).catch(function () { return []; });
    };
  } catch (e) { /* keep the raw export */ }
})();

/* ===== nv-plugins waterfall merge v2.0.0 (pack 4.37.0, readable re-emit) ======
   Device truth (NuvioMobile PluginRuntime.kt + quickjs-kt 1.0.5-nuvio AAR):
   no timers in the realm, each fetch is one BLOCKING host call (lanes run
   sequentially regardless of Promise.all), app kills the call at 60s.
   Sequential waterfall bounded by fetch count, fail-soft both lanes:
     native hlowb lane FIRST (WINGS_FIRST = false), WINGS lane only when empty.
   ========================================================================== */
(function () {
  'use strict';
  var LABEL = 'Castle';
  var WINGS_FIRST = false;
  var ALT_NAME = '__nvWingsStreams';

  function junkUrl(u) {
    return /tungtungtungsahur\.cfd|\/api\?d=/i.test(String(u || ''));
  }

  var orig = null;
  try { orig = module.exports && module.exports.getStreams; } catch (e) { orig = null; }
  if (typeof orig !== 'function') return;

  function runWings(args) {
    var f = null;
    try { f = (typeof globalThis !== 'undefined' && globalThis) ? globalThis[ALT_NAME] : null; }
    catch (e) { f = null; }
    if (typeof f !== 'function') return Promise.resolve([]);
    try {
      var r = f({
        tmdbId: args[0], mediaType: args[1],
        season: args[2], episode: args[3], label: LABEL
      });
      return Promise.resolve(r).then(function (v) { return Array.isArray(v) ? v : []; },
        function () { return []; });
    } catch (e) {
      return Promise.resolve([]);
    }
  }

  function runNative(args, self) {
    try {
      var r = orig.apply(self, args);
      return Promise.resolve(r).then(function (v) { return Array.isArray(v) ? v : []; },
        function () { return []; });
    } catch (e) {
      return Promise.resolve([]);
    }
  }

  function clean(rows) {
    var seen = {}, out = [];
    (rows || []).forEach(function (r) {
      if (!r || !r.url || junkUrl(r.url)) return;
      var k = String(r.url);
      if (seen[k]) return;
      seen[k] = 1;
      out.push(r);
    });
    return out;
  }

  module.exports.getStreams = function () {
    var args = Array.prototype.slice.call(arguments), self = this;
    var first = WINGS_FIRST ? runWings(args) : runNative(args, self);
    var second = function () { return WINGS_FIRST ? runNative(args, self) : runWings(args); };
    return Promise.resolve().then(function () { return first; }).then(function (rows) {
      rows = clean(rows);
      if (rows.length) return rows;
      return Promise.resolve().then(second).then(clean);
    });
  };
})();
