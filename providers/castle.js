/* nv-plugins pack 4.37.0 (2026-09-14): device-fidelity fix. The Nuvio QuickJS realm ships NO timers - every unguarded setTimeout race in 4.33.0-4.36.0 (wings _race, wings partial collector, merge-wrapper cap(), native lanes, light deadline wrappers) threw ReferenceError on device and returned 0 rows on every call. All sites are guarded now and the merge wrapper is a fetch-count-bounded waterfall (verified WINGS text lane first/fallback + native lane, fail-soft, URL-deduped). Pure-JS polyfills for atob/URLSearchParams attached.
 */
/* ===== nv-plugins device polyfills v1.0.0 (pack 4.37.0, 2026-09-14) ============
   The Nuvio QuickJS plugin runtime (quickjs-kt 1.0.5-nuvio AAR) is a bare
   ES2020 realm: no atob/btoa, no URLSearchParams, no TextDecoder, no timers.
   These polyfills are define-only-if-missing, so node/desktop runtimes are
   completely unaffected. ==================================================== */
(function () {
  var G = typeof globalThis !== 'undefined' ? globalThis : (typeof global !== 'undefined' ? global : this);
  if (typeof G.atob !== 'function') {
    var _CH = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    G.atob = function (s) {
      s = String(s).replace(/[^A-Za-z0-9+\/]/g, '');
      var out = '', bits = 0, acc = 0, i;
      for (i = 0; i < s.length; i++) {
        acc = (acc << 6) | _CH.indexOf(s.charAt(i));
        bits += 6;
        if (bits >= 8) { bits -= 8; out += String.fromCharCode((acc >> bits) & 0xff); }
      }
      return out;
    };
  }
  if (typeof G.btoa !== 'function') {
    var _CH2 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    G.btoa = function (s) {
      s = String(s);
      var out = '', i;
      for (i = 0; i < s.length; i += 3) {
        var b0 = s.charCodeAt(i), b1 = s.charCodeAt(i + 1), b2 = s.charCodeAt(i + 2);
        var has1 = !(i + 1 >= s.length || isNaN(b1)), has2 = !(i + 2 >= s.length || isNaN(b2));
        out += _CH2.charAt(b0 >> 2);
        out += _CH2.charAt(((b0 & 3) << 4) | (has1 ? b1 >> 4 : 0));
        out += has1 ? _CH2.charAt(((b1 & 15) << 2) | (has2 ? b2 >> 6 : 0)) : '=';
        out += has2 ? _CH2.charAt(b2 & 63) : '=';
      }
      return out;
    };
  }
  if (typeof G.URLSearchParams !== 'function') {
    var USP = function (init) {
      this._m = {};
      if (init && typeof init === 'object') {
        for (var k in init) if (Object.prototype.hasOwnProperty.call(init, k)) this._m[k] = [String(init[k])];
      }
    };
    USP.prototype.append = function (k, v) { (this._m[k] = this._m[k] || []).push(String(v)); };
    USP.prototype.set = function (k, v) { this._m[k] = [String(v)]; };
    USP.prototype.get = function (k) { var a = this._m[k]; return a && a.length ? a[0] : null; };
    USP.prototype.has = function (k) { return Object.prototype.hasOwnProperty.call(this._m, k); };
    USP.prototype.toString = function () {
      var out = [];
      for (var k in this._m) {
        if (!Object.prototype.hasOwnProperty.call(this._m, k)) continue;
        var vs = this._m[k];
        for (var i = 0; i < vs.length; i++)
          out.push(encodeURIComponent(k).replace(/%20/g, '+') + '=' + encodeURIComponent(vs[i]).replace(/%20/g, '+'));
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
var __nvCastleCryptoJs = (function () {
  'use strict';
  /* AES tables */
  var SBOX = new Uint8Array(256), INV = new Uint8Array(256);
  (function () {
    var p = 1, q = 1, x;
    /* generate sbox via GF(2^8) inverse + affine transform */
    var mul = function (a, b) {
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
      var inv = 1, t = i;
      /* brute inverse */
      for (var j = 1; j < 256; j++) { if (mul(i, j) === 1) { inv = j; break; } }
      x = inv;
      var s = x;
      for (var k = 0; k < 4; k++) { s = ((s << 1) | (s >> 7)) & 0xff; x ^= s; }
      SBOX[i] = (x ^ 0x63) & 0xff;
    }
    for (var m = 0; m < 256; m++) INV[SBOX[m]] = m;
  })();
  var RCON = [0x01, 0x02, 0x04, 0x08, 0x10, 0x20, 0x40, 0x80, 0x1b, 0x36, 0x6c, 0xd8];

  function keyExpansion(key) {
    var nk = key.length / 4, nr = nk + 6, w = [], i, t;
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
    return { w: w, nr: nr };
  }

  function decryptBlock(ks, input) {
    var w = ks.w, nr = ks.nr;
    var s = [0, 0, 0, 0], i;
    for (i = 0; i < 4; i++) s[i] = (input[4 * i] << 24) | (input[4 * i + 1] << 16) | (input[4 * i + 2] << 8) | input[4 * i + 3];
    var m = function (x, y) { var r = 0; while (y) { if (y & 1) r ^= x; var hi = x & 0x80; x = (x << 1) & 0xff; if (hi) x ^= 0x1b; y >>= 1; } return r; };
    var ark = function (r) { for (var c = 0; c < 4; c++) s[c] = (s[c] ^ w[r * 4 + c]) >>> 0; };
    /* InvShiftRows + InvSubBytes: value at old (row,col) moves to (row,(col+row)%4) */
    var invShiftSub = function () {
      var st = new Uint8Array(16), o = new Uint8Array(16);
      for (var k = 0; k < 4; k++) {
        st[4 * k] = (s[k] >>> 24) & 0xff; st[4 * k + 1] = (s[k] >>> 16) & 0xff;
        st[4 * k + 2] = (s[k] >>> 8) & 0xff; st[4 * k + 3] = s[k] & 0xff;
      }
      for (var idx = 0; idx < 16; idx++) {
        var row = idx % 4, col = (idx - row) / 4;
        o[((col + row) % 4) * 4 + row] = INV[st[idx]];
      }
      for (var c2 = 0; c2 < 4; c2++) s[c2] = ((o[4 * c2] << 24) | (o[4 * c2 + 1] << 16) | (o[4 * c2 + 2] << 8) | o[4 * c2 + 3]) >>> 0;
    };
    var invMix = function () {
      for (var c = 0; c < 4; c++) {
        var a0 = (s[c] >>> 24) & 0xff, a1 = (s[c] >>> 16) & 0xff, a2 = (s[c] >>> 8) & 0xff, a3 = s[c] & 0xff;
        var b0 = (m(a0, 14) ^ m(a1, 11) ^ m(a2, 13) ^ m(a3, 9)) & 0xff;
        var b1 = (m(a0, 9) ^ m(a1, 14) ^ m(a2, 11) ^ m(a3, 13)) & 0xff;
        var b2 = (m(a0, 13) ^ m(a1, 9) ^ m(a2, 14) ^ m(a3, 11)) & 0xff;
        var b3 = (m(a0, 11) ^ m(a1, 13) ^ m(a2, 9) ^ m(a3, 14)) & 0xff;
        s[c] = ((b0 << 24) | (b1 << 16) | (b2 << 8) | b3) >>> 0;
      }
    };
    /* FIPS-197 InvCipher: ARK(nr); for r=nr-1..1 { ISH,ISB,ARK(r),IMC }; ISH,ISB,ARK(0) */
    ark(nr);
    for (var r = nr - 1; r >= 1; r--) { invShiftSub(); ark(r); invMix(); }
    invShiftSub();
    ark(0);
    var out = new Uint8Array(16);
    for (i = 0; i < 4; i++) {
      out[4 * i] = (s[i] >>> 24) & 0xff; out[4 * i + 1] = (s[i] >>> 16) & 0xff;
      out[4 * i + 2] = (s[i] >>> 8) & 0xff; out[4 * i + 3] = s[i] & 0xff;
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
    for (var i = b.length - n; i < b.length; i++) if (b[i] !== n) return b;
    return b.subarray(0, b.length - n);
  }

  /* --- CryptoJS-compatible WordArray --- */
  function WA(words, sigBytes) { this.words = words || []; this.sigBytes = sigBytes != null ? sigBytes : (this.words.length * 4); }
  WA.prototype.clamp = function () {
    if (this.sigBytes % 4) this.words[this.sigBytes >>> 2] &= (0xffffffff << (32 - (this.sigBytes % 4) * 8)) >>> 0;
    this.words.length = Math.ceil(this.sigBytes / 4);
    return this;
  };
  WA.prototype.concat = function (wa2) {
    var tw = wa2.words, ts = wa2.sigBytes;
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
      else if ((c & 0xf0) === 0xe0) s += String.fromCharCode(((c & 0x0f) << 12) | ((b[i++] & 0x3f) << 6) | (b[i++] & 0x3f));
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
      var bits = 0, acc = 0;
      for (var i = 0; i < clean.length; i++) {
        acc = (acc << 6) | CH.indexOf(clean.charAt(i)); bits += 6;
        if (bits >= 8) { bits -= 8; bin += String.fromCharCode((acc >> bits) & 0xff); }
      }
    }
    var out = new Uint8Array(bin.length);
    for (var k = 0; k < bin.length; k++) out[k] = bin.charCodeAt(k) & 0xff;
    return out;
  }

  var AES = {
    decrypt: function (cipher, key, cfg) {
      var ctBytes = (typeof cipher === 'string') ? b64ToBytes(cipher)
        : (cipher && cipher.ciphertext ? waToBytes(cipher.ciphertext) : new Uint8Array(0));
      var keyBytes = waToBytes(key);
      var ivBytes = (cfg && cfg.iv) ? waToBytes(cfg.iv) : new Uint8Array(16);
      var pt = pkcs7Unpad(cbcDecrypt(keyBytes, ivBytes, ctBytes));
      var w = bytesToWords(pt);
      return {
        sigBytes: pt.length, words: w,
        ciphertext: new WA(w.slice(), pt.length),
        toString: function () { return bytesToUtf8(pt); }
      };
    }
  };
  return {
    AES: AES,
    enc: {
      Base64: { parse: function (s) { var b = b64ToBytes(s); return new WA(bytesToWords(b), b.length); } },
      Utf8: {
        parse: function (s) { var b = utf8ToBytes(s); return new WA(bytesToWords(b), b.length); },
        stringify: function (wa) { return bytesToUtf8(waToBytes(wa)); }
      }
    },
    lib: { WordArray: { create: function (words, sigBytes) { return new WA(words ? words.slice() : [], sigBytes != null ? sigBytes : (words ? words.length * 4 : 0)); } } },
    mode: { CBC: {} },
    pad: { Pkcs7: {} }
  };
})();
/* ============================================================
 * AIO-EXACT DECODE (2026-09-13) - fully deobfuscated from
 * All-in-One-Nuvio upstream, all string-table references resolved
 * to literals, syntax-checked, live-verified against upstream.
 * Replaces the previous port whose extraction returned 0 rows.
 * ============================================================ */
'use strict';const _0x476166=_0x44e1;(function(_0x67a31b,_0x2c404f){const _0x36a05f=_0x44e1,_0x470649=_0x67a31b();while(!![]){try{const _0x5137c2=-parseInt("571140LlKspr")/0x1+parseInt("566976foJrkR")/0x2+parseInt("768105Ikdufh")/0x3+-parseInt("2404224BRlCvr")/0x4+parseInt("2015wYozez")/0x5*(-parseInt("6978hXvUnR")/0x6)+parseInt("1078asQYgi")/0x7*(parseInt("39680INItLI")/0x8)+parseInt("6995403qlEomf")/0x9;if(_0x5137c2===_0x2c404f)break;else _0x470649['push'](_0x470649['shift']());}catch(_0xc250f2){_0x470649['push'](_0x470649['shift']());}}}(_0x576f,0x6b5c1));function _0x44e1(_0x5972df,_0x46299a){_0x5972df=_0x5972df-0x1e0;const _0x576fb9=_0x576f();let _0x44e170=_0x576fb9[_0x5972df];if(_0x44e1['WPBLul']===undefined){var _0x3b63c2=function(_0x5c6f09){const _0x445c29='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=';let _0x1bd8fe='',_0x43a10c='';for(let _0x256223=0x0,_0x82eee6,_0x25a6e1,_0xf7c831=0x0;_0x25a6e1=_0x5c6f09['charAt'](_0xf7c831++);~_0x25a6e1&&(_0x82eee6=_0x256223%0x4?_0x82eee6*0x40+_0x25a6e1:_0x25a6e1,_0x256223++%0x4)?_0x1bd8fe+=String['fromCharCode'](0xff&_0x82eee6>>(-0x2*_0x256223&0x6)):0x0){_0x25a6e1=_0x445c29['indexOf'](_0x25a6e1);}for(let _0x56dc30=0x0,_0x4ed561=_0x1bd8fe['length'];_0x56dc30<_0x4ed561;_0x56dc30++){_0x43a10c+='%'+('00'+_0x1bd8fe['charCodeAt'](_0x56dc30)['toString'](0x10))['slice'](-0x2);}return decodeURIComponent(_0x43a10c);};_0x44e1['OchpKJ']=_0x3b63c2,_0x44e1['yHtRii']={},_0x44e1['WPBLul']=!![];}const _0x1e8776=_0x576fb9[0x0],_0x555aab=_0x5972df+_0x1e8776,_0x17a6f3=_0x44e1['yHtRii'][_0x555aab];return!_0x17a6f3?(_0x44e170=_0x44e1['OchpKJ'](_0x44e170),_0x44e1['yHtRii'][_0x555aab]=_0x44e170):_0x44e170=_0x17a6f3,_0x44e170;}var __defProp=Object['defineProperty'],__getOwnPropSymbols=Object['getOwnPropertySymbols'],__hasOwnProp=Object['prototype']["hasOwnProperty"],__propIsEnum=Object["prototype"]["propertyIsEnumerable"],__defNormalProp=(_0x1bd8fe,_0x43a10c,_0x256223)=>_0x43a10c in _0x1bd8fe?__defProp(_0x1bd8fe,_0x43a10c,{'enumerable':!![],'configurable':!![],'writable':!![],'value':_0x256223}):_0x1bd8fe[_0x43a10c]=_0x256223,__spreadValues=(_0x82eee6,_0x25a6e1)=>{const _0x57b9b7=_0x476166;for(var _0xf7c831 in _0x25a6e1||(_0x25a6e1={}))if(__hasOwnProp['call'](_0x25a6e1,_0xf7c831))__defNormalProp(_0x82eee6,_0xf7c831,_0x25a6e1[_0xf7c831]);if(__getOwnPropSymbols)for(var _0xf7c831 of __getOwnPropSymbols(_0x25a6e1)){if(__propIsEnum["call"](_0x25a6e1,_0xf7c831))__defNormalProp(_0x82eee6,_0xf7c831,_0x25a6e1[_0xf7c831]);}return _0x82eee6;},__async=(_0x56dc30,_0x4ed561,_0x267797)=>{return new Promise((_0x170526,_0x13dda8)=>{const _0x2a7b44=_0x44e1;var _0x5e18b1=_0x51d46c=>{const _0x3e6ab5=_0x44e1;try{_0x4b0257(_0x267797["next"](_0x51d46c));}catch(_0x478a26){_0x13dda8(_0x478a26);}},_0x5c517a=_0x4da371=>{const _0xddfc2a=_0x44e1;try{_0x4b0257(_0x267797["throw"](_0x4da371));}catch(_0x2893a0){_0x13dda8(_0x2893a0);}},_0x4b0257=_0x29e7e7=>_0x29e7e7['done']?_0x170526(_0x29e7e7["value"]):Promise["resolve"](_0x29e7e7['value'])["then"](_0x5e18b1,_0x5c517a);_0x4b0257((_0x267797=_0x267797["apply"](_0x56dc30,_0x4ed561))["next"]());});},TMDB_API_KEY='439c478a771f35c05022f9feabcca01c',TMDB_BASE_URL="https://api.themoviedb.org/3",CASTLE_BASE='https://api.hlowb.com',PKG="com.external.castle",CHANNEL="IndiaA",CLIENT='1',LANG='en-US',API_HEADERS={'User-Agent':"okhttp/4.9.3",'Accept':"application/json",'Accept-Language':"en-US,en;q=0.9",'Connection':"Keep-Alive",'Referer':CASTLE_BASE},PLAYBACK_HEADERS={'User-Agent':'Mozilla/5.0\x20(Windows\x20NT\x2010.0;\x20Win64;\x20x64)\x20AppleWebKit/537.36\x20(KHTML,\x20like\x20Gecko)\x20Chrome/137.0.0.0\x20Safari/537.36','Accept':'video/webm,video/ogg,video/*;q=0.9,application/ogg;q=0.7,audio/*;q=0.6,*/*;q=0.5','Accept-Language':"en-US,en;q=0.9",'Accept-Encoding':"identity",'Connection':"keep-alive",'Sec-Fetch-Dest':'video','Sec-Fetch-Mode':"no-cors",'Sec-Fetch-Site':"cross-site",'DNT':'1'};function makeRequest(_0x1b363e){return __async(this,arguments,function*(_0x3d5cba,_0x27b3ee={}){const _0x455f3a=_0x44e1;try{const _0x1c6c59=yield fetch(_0x3d5cba,{'method':_0x27b3ee["method"]||"GET",'headers':__spreadValues(__spreadValues({},API_HEADERS),_0x27b3ee['headers']),'body':_0x27b3ee['body']});if(!_0x1c6c59['ok'])throw new Error("HTTP "+_0x1c6c59["status"]+':\x20'+_0x1c6c59["statusText"]);return _0x1c6c59;}catch(_0x1cd416){console["error"]("[Castle] Request failed for "+_0x3d5cba+':\x20'+_0x1cd416["message"]);throw _0x1cd416;}});}function extractCipherFromResponse(_0x409352){return __async(this,null,function*(){const _0x3ad6ed=_0x44e1,_0x3f740d=yield _0x409352["text"](),_0x4fa311=_0x3f740d["trim"]();if(!_0x4fa311)throw new Error("Empty response");try{const _0x2dc537=JSON["parse"](_0x4fa311);if(_0x2dc537&&_0x2dc537["data"]&&typeof _0x2dc537['data']==='string')return _0x2dc537["data"]["trim"]();}catch(_0x49255b){}return _0x4fa311;});}function extractDataBlock(_0x5c1776){const _0x20a912=_0x476166;if(_0x5c1776&&_0x5c1776["data"]&&typeof _0x5c1776['data']==="object")return _0x5c1776["data"];return _0x5c1776||{};}function getTMDBDetails(_0x45bec2,_0xd6d16b){return __async(this,null,function*(){const _0x44aa1b=_0x44e1,_0x1fa830=_0xd6d16b==='tv'?'tv':"movie",_0x4e7160=TMDB_BASE_URL+'/'+_0x1fa830+'/'+_0x45bec2+"?api_key="+TMDB_API_KEY+"&append_to_response=external_ids",_0x220bdb=yield makeRequest(_0x4e7160),_0x2565cd=yield _0x220bdb["json"](),_0xfa7224=_0xd6d16b==='tv'?_0x2565cd["name"]:_0x2565cd["title"],_0x23eea7=_0xd6d16b==='tv'?_0x2565cd["first_air_date"]:_0x2565cd["release_date"],_0x451860=_0x23eea7?parseInt(_0x23eea7['split']('-')[0x0]):null;return{'title':_0xfa7224,'year':_0x451860,'tmdbId':_0x45bec2};});}function decryptCastle(_0xc6ebf1,_0x4830a9){return __async(this,null,function*(){const _0x32c1f5=_0x44e1;console['log']("[Castle] Starting local AES-CBC decryption...");try{const _0x124330=(typeof require==="function")?(function(){try{return require("crypto-js");}catch(_nvE){return __nvCastleCryptoJs;}})():__nvCastleCryptoJs;if(typeof __crypto_aes_decrypt_raw!=='undefined'){const _0x23174d=_0x124330["AES"]["decrypt"];_0x124330['AES']["decrypt"]=function(_0xee5ebe,_0xdc47ba,_0x350562){const _0x5d9219=_0x32c1f5;try{const _0xe2ca99=_0x56fed0=>{const _0x4dd3f1=_0x44e1,_0x4f63a2=new Uint8Array(_0x56fed0['sigBytes']);for(let _0x3866bd=0x0;_0x3866bd<_0x56fed0["sigBytes"];_0x3866bd++){_0x4f63a2[_0x3866bd]=_0x56fed0["words"][_0x3866bd>>>0x2]>>>0x18-_0x3866bd%0x4*0x8&0xff;}return _0x4f63a2;},_0x2a1521=_0x36e655=>{const _0x144bda=_0x44e1;if(_0x36e655 instanceof Uint8Array)return _0x36e655;if(_0x36e655 instanceof ArrayBuffer)return new Uint8Array(_0x36e655);if(_0x36e655&&typeof _0x36e655["length"]==="number")return new Uint8Array(Array["prototype"]['slice']["call"](_0x36e655));return new Uint8Array(0x0);},_0x5d8830=typeof _0xee5ebe==='string'?new Uint8Array(Array["from"](atob(_0xee5ebe),_0x42cb6d=>_0x42cb6d["charCodeAt"](0x0))):_0xee5ebe["ciphertext"]?_0xe2ca99(_0xee5ebe["ciphertext"]):_0x2a1521(_0xee5ebe),_0x300d1d=_0xe2ca99(_0xdc47ba),_0x25e833=_0x350562&&_0x350562['iv']?_0xe2ca99(_0x350562['iv']):new Uint8Array(0x0),_0x37b488=_0x350562&&_0x350562["mode"]||"AES-CBC",_0x155c77=typeof Int8Array!=="undefined"?new Int8Array(_0x300d1d["buffer"]):_0x300d1d,_0x579db0=typeof Int8Array!=='undefined'?new Int8Array(_0x25e833['buffer']):_0x25e833,_0x2d2b32=typeof Int8Array!=="undefined"?new Int8Array(_0x5d8830['buffer']):_0x5d8830,_0x5ba30d=__crypto_aes_decrypt_raw(_0x37b488,_0x155c77,_0x579db0,_0x2d2b32),_0xd18d9e=new TextDecoder()["decode"](_0x5ba30d);return{'toString':function(){return _0xd18d9e;}};}catch(_0xe309ac){return console["error"]("[Castle JNI Patch] Decrypt failed, falling back:",_0xe309ac),_0x23174d["call"](_0x124330['AES'],_0xee5ebe,_0xdc47ba,_0x350562);}};}const _0x227260='T!BgJB',_0x482d9c=_0x124330['enc']["Base64"]["parse"](_0x4830a9),_0x1339d3=_0x124330["enc"]["Utf8"]['parse'](_0x227260),_0xd52821=_0x482d9c['concat'](_0x1339d3);let _0x59f612;if(_0xd52821["sigBytes"]<0x10){const _0x129518=_0x124330["lib"]["WordArray"]["create"](new Array(0x10-_0xd52821['sigBytes'])["fill"](0x0));_0x59f612=_0xd52821['concat'](_0x129518);}else _0xd52821["sigBytes"]>0x10?_0x59f612=_0x124330['lib']['WordArray']["create"](_0xd52821["words"]["slice"](0x0,0x4),0x10):_0x59f612=_0xd52821;const _0x305fbb=_0x59f612,_0x165e51=_0x124330["AES"]["decrypt"](_0xc6ebf1,_0x59f612,{'iv':_0x305fbb,'mode':_0x124330["mode"]['CBC'],'padding':_0x124330['pad']["Pkcs7"]}),_0x3adb8e=_0x165e51["toString"](_0x124330['enc']["Utf8"]);if(!_0x3adb8e)throw new Error("Decryption resulted in empty string (possible key/IV mismatch)");return console["log"]('[Castle]\x20Local\x20decryption\x20successful'),_0x3adb8e;}catch(_0x282f45){console["error"]('[Castle]\x20Local\x20decryption\x20failed:\x20'+_0x282f45['message']);throw _0x282f45;}});}function getSecurityKey(){return __async(this,null,function*(){const _0x436439=_0x44e1;console['log']('[Castle]\x20Fetching\x20security\x20key...');const _0xcc4799=CASTLE_BASE+"/v0.1/system/getSecurityKey/1?channel="+CHANNEL+"&clientType="+CLIENT+"&lang="+LANG,_0x25d0a0=yield makeRequest(_0xcc4799),_0x5985bc=yield _0x25d0a0['json']();if(_0x5985bc["code"]!==0xc8||!_0x5985bc["data"])throw new Error("Security key API error: "+JSON["stringify"](_0x5985bc));return console["log"]("[Castle] Security key obtained"),_0x5985bc["data"];});}function searchCastle(_0x1a0a07,_0x15b1e2,_0x560f28=0x1,_0x208034=0x1e){return __async(this,null,function*(){const _0x3a4973=_0x44e1;console["log"]('[Castle]\x20Searching\x20for:\x20'+_0x15b1e2);const _0x4a939a=new URLSearchParams({'channel':CHANNEL,'clientType':CLIENT,'keyword':_0x15b1e2,'lang':LANG,'mode':'1','packageName':PKG,'page':_0x560f28["toString"](),'size':_0x208034['toString']()}),_0x1cc3db=CASTLE_BASE+"/film-api/v1.1.0/movie/searchByKeyword?"+_0x4a939a["toString"](),_0x20be66=yield makeRequest(_0x1cc3db),_0xd7a2bd=yield extractCipherFromResponse(_0x20be66),_0x703ccd=yield decryptCastle(_0xd7a2bd,_0x1a0a07);return JSON["parse"](_0x703ccd);});}function getDetails(_0x1b40c9,_0x33dbe1){return __async(this,null,function*(){const _0x743ebf=_0x44e1;console["log"]("[Castle] Fetching details for movieId: "+_0x33dbe1);const _0x588fee=CASTLE_BASE+"/film-api/v1.9.9/movie?channel="+CHANNEL+'&clientType='+CLIENT+"&lang="+LANG+'&movieId='+_0x33dbe1+"&packageName="+PKG,_0x2289e0=yield makeRequest(_0x588fee),_0x2865b4=yield extractCipherFromResponse(_0x2289e0),_0x217860=yield decryptCastle(_0x2865b4,_0x1b40c9);return JSON["parse"](_0x217860);});}function getVideoV1(_0x5db07e,_0x5e010,_0x5b503c,_0x39cb02,_0x52da17=0x2){return __async(this,null,function*(){const _0x3beb02=_0x44e1;console["log"]("[Castle] Fetching video (v1) for movieId: "+_0x5e010+", languageId: "+_0x39cb02);const _0x4153b9=CASTLE_BASE+"/film-api/v2.0.1/movie/getVideo2?clientType="+CLIENT+"&packageName="+PKG+"&channel="+CHANNEL+'&lang='+LANG,_0x1eb498={'mode':'1','appMarket':"GuanWang",'clientType':CLIENT,'woolUser':"false",'apkSignKey':"ED0955EB04E67A1D9F3305B95454FED485261475",'androidVersion':'13','movieId':_0x5e010["toString"](),'episodeId':_0x5b503c["toString"](),'languageId':_0x39cb02["toString"](),'isNewUser':"true",'resolution':_0x52da17['toString'](),'packageName':PKG},_0x10b03a=yield makeRequest(_0x4153b9,{'method':"POST",'headers':{'Content-Type':"application/json"},'body':JSON["stringify"](_0x1eb498)}),_0x3b5806=yield extractCipherFromResponse(_0x10b03a),_0x3545cc=yield decryptCastle(_0x3b5806,_0x5db07e);return JSON['parse'](_0x3545cc);});}function getVideo2(_0x13e2e0,_0x4e860c,_0x1b29ed,_0x12b2eb=0x2){return __async(this,null,function*(){const _0x46256f=_0x44e1;console["log"]("[Castle] Fetching video (v2) for movieId: "+_0x4e860c+", episodeId: "+_0x1b29ed);const _0x492b01=CASTLE_BASE+"/film-api/v2.0.1/movie/getVideo2?clientType="+CLIENT+"&packageName="+PKG+"&channel="+CHANNEL+"&lang="+LANG,_0x2bbf47={'mode':'1','appMarket':"GuanWang",'clientType':CLIENT,'woolUser':"false",'apkSignKey':"ED0955EB04E67A1D9F3305B95454FED485261475",'androidVersion':'13','movieId':_0x4e860c["toString"](),'episodeId':_0x1b29ed["toString"](),'isNewUser':"true",'resolution':_0x12b2eb["toString"](),'packageName':PKG},_0x334736=yield makeRequest(_0x492b01,{'method':"POST",'headers':{'Content-Type':"application/json"},'body':JSON["stringify"](_0x2bbf47)}),_0x891bc9=yield extractCipherFromResponse(_0x334736),_0x33520e=yield decryptCastle(_0x891bc9,_0x13e2e0);return JSON["parse"](_0x33520e);});}function findCastleMovieId(_0x57fcd6,_0x4f8418){return __async(this,null,function*(){const _0x1728f4=_0x44e1,_0x26af00=_0x4f8418['year']?_0x4f8418["title"]+'\x20'+_0x4f8418["year"]:_0x4f8418['title'],_0x4d704e=yield searchCastle(_0x57fcd6,_0x26af00),_0x59afbd=extractDataBlock(_0x4d704e),_0x8a8050=_0x59afbd["rows"]||[];if(_0x8a8050["length"]===0x0)throw new Error('No\x20search\x20results\x20found');for(const _0x255a56 of _0x8a8050){const _0x20be27=(_0x255a56["title"]||_0x255a56["name"]||'')["toLowerCase"](),_0x4f2b66=_0x4f8418['title']["toLowerCase"]();if(_0x20be27["includes"](_0x4f2b66)||_0x4f2b66["includes"](_0x20be27)){const _0x38ac5b=_0x255a56['id']||_0x255a56["redirectId"]||_0x255a56["redirectIdStr"];if(_0x38ac5b)return console["log"]('[Castle]\x20Found\x20match:\x20'+(_0x255a56['title']||_0x255a56["name"])+" (id: "+_0x38ac5b+')'),_0x38ac5b["toString"]();}}const _0x4d2a6e=_0x8a8050[0x0],_0x3a963b=_0x4d2a6e['id']||_0x4d2a6e["redirectId"]||_0x4d2a6e['redirectIdStr'];if(_0x3a963b)return console['log']("[Castle] Using first result: "+(_0x4d2a6e['title']||_0x4d2a6e["name"])+" (id: "+_0x3a963b+')'),_0x3a963b['toString']();throw new Error("Could not extract movie ID from search results");});}function _0x576f(){const _0x56b7ed=['lcbLCgLZB2rLswq6ia','q291BgqGBM90igzPBMqGzxbPC29Kzsbjra','jNbHy2THz2voyw1Lpq','w0nHC3rSzsbktKKGugf0y2HDierLy3j5ChqGzMfPBgvKlcbMywXSAw5NigjHy2S6','vw5RBM93BG','ntCXmtqWtgXlC3bY','AwrLBNrPDhK','B2jQzwn0','B2TODhrWlZqUos4Z','zxjYB3i','mJaXnxDzB3PLEG','CgfYC2u','ue9tva','nJK3ogHyDLvUuG','v29YzefYCMf5','zM9YrwfJAa','quvt','D29Yzhm','zgvJB2rL','l3yWlJeVC3LZDgvTl2DLDfnLy3vYAxr5s2v5lZe/y2HHBM5LBd0','y2fSBa','w0nHC3rSzv0Gvg90ywWGC3rYzwfTCYbMB3vUzdOG','rgvJCNLWDgLVBIbYzxn1BhrLzcbPBIbLBxb0EsbZDhjPBMCGkhbVC3nPyMXLigTLEs9jvIbTAxnTyxrJAcK','y2LWAgvYDgv4Da','zxHPC3rjBMrPDMLKDwfSvMLKzw8','CMvKAxjLy3rjzfn0CG','AgfZt3DUuhjVCgvYDhK','p2fWAv9RzxK9','C2LNqNL0zxm','zNjVBq','DxjS','zMfSC2u','oIbgB3vUzca','w0nHC3rSzv0Gu2vJDxjPDhKGA2v5ig9IDgfPBMvK','zgvJCNLWDa','mJqWndiYnejsBen2CG','Aw5JBhvKzxm','q2fZDgXLic0G','C3rHDhvZ','DgHYB3C','ChvZAa','Bg9N','mZK2odbjtKL0teK','yxbWBgLJyxrPB24VANnVBG','BwvZC2fNzq','nty2otC2zM9kCMTs','y2fZDgXL','qMfZzty0','w0nHC3rSzv0Gve1eqIbjBMzVoIaI','vxrMoa','BgfUz3vHz2voyw1L','r3vHBLDHBMC','w0nHC3rSzv0Gu3rHCNrPBMCGBg9JywWGquvtluncqYbKzwnYExb0Aw9UlI4U','CMvZB2X2zq','l2zPBg0TyxbPl3yXlJKUos9TB3zPzt9JAgfUBMvSpq','w0nHC3rSzv0GtM8GDMLKzw9vCMWGzM91BMqGAw4GCMvZCg9UC2u','sw5KAwfb','Dg9tDhjPBMC','C2vHC29UCW','y29Kzq','zMLSBa','ChjVCgvYDhLjC0vUDw1LCMfIBgu','DgL0Bgu','jMfWCgvUzf90B19YzxnWB25Zzt1LEhrLCM5HBf9Pzhm','jMnOyw5UzwW9','nZy4mta1swTKDwzO','BgLI','BM8Ty29YCW','w0nHC3rSzv0GrMv0y2HPBMCGDMLKzw8GkhyYksbMB3iGBw92AwvjzdOG','w0nHC3rSzv0GuMvXDwvZDcbMywLSzwqGzM9Yia','y3jLyxrL','C2L6zq','ruqWotu1ruiWneu2n0eXrdLgmZmWnui5ntq1nezfrdq4nti2mtq3nq','C3rHDhvZvgv4Da','Bw92Awvjza','w0nHC3rSzv0G4PQG77Ipia','y29TlMv4DgvYBMfSlMnHC3rSzq','icHPzdOG','jMnSAwvUDfr5Cgu9','zw4TvvmSzw47Ct0WlJK','ie1c','CM93CW','EwvHCG','Dhj1zq','mta4mha','ic0G','CxvHBgL0Eq','w0nHC3rSzv0GrMv0y2HPBMCGzgv0ywLSCYbMB3iGBw92AwvjzdOG','C2XPy2u','DMLKzw9Z','ieDc','zw5J','w0nHC3rSzv0GvxnPBMCGzMLYC3qGCMvZDwX0oIa','CMvWBgfJzq','BNvTyMvY','ugTJCZC','ndGWCa','zxbPC29Kzxm','CMvKAxjLy3rjza','q291BgqGBM90igv4DhjHy3qGBw92AwuGsuqGzNjVBsbZzwfYy2GGCMvZDwX0CW','zgf0yq','Bw9Kzq','zMLUza','s2vLCc1bBgL2zq','quvtluncqW','BMv4Da','w0nHC3rSzv0G4PYfia','DMfSDwu','w0nHC3rSzv0GrMv0y2HPBMCGDMLKzw8GkhyXksbMB3iGBw92AwvjzdOG','mta3ogfZuvLNAq','Dw5KzwzPBMvK','ywjICMv2Awf0zq','CgfKu3rHCNq','Dg9mB3DLCKnHC2u','Dgv4Da','yxbWBhK','DhjHy2TZ','DgHLBG','w0nHC3rSzv0GrMv0y2HPBMCG','lcbSyw5NDwfNzuLKoIa','BgvUz3rO','AxnbCNjHEq','y2HHCKnVzgvbDa','l2zPBg0TyxbPl3yXlJeUmc9TB3zPzs9ZzwfYy2HcEuTLExDVCMq/','C3vIDgL0BgvZ','y3j5ChrVlwPZ','ANnVBG','Bwv0Ag9K','CMvSzwfZzv9KyxrL','y3jVC3mTC2L0zq','nJK5ntqWm3fSrw9TzG','DhjPBq','yNvMzMvY','q2fZDgXLia','w0nHC3rSzv0GrMfSBgLUzYbIywnRihrVihnOyxjLzcbZDhjLyw0GkhyYkq','jMXHBMC9','BMfTzq','BgfUz3vHz2vjza','rw1WDhKGCMvZCg9UC2u','C3rYAw5NAwz5','A2vLCc1HBgL2zq','C29YDa','r0vu','zxHWB3j0CW','Dg9gAxHLza','igrLDgfPBhmUlI4','sfruuca','Ahr0Chm6lY9HCgKUDgHLBw92AwvKyI5VCMCVmW','ChjVDg90ExbL','u2vJDxjPDhKGA2v5iefqssbLCNjVCJOG','lcbtoG','zMLYC3rFywLYx2rHDgu','oIbgywLSzwqGlsa','Bw92Awu','l2zPBg0TyxbPl3yYlJaUms9TB3zPzs9NzxrwAwrLBZi/y2XPzw50vhLWzt0'];_0x576f=function(){return _0x56b7ed;};return _0x576f();}function getQualityValue(_0x2ea31c){const _0x5bcb63=_0x476166;if(!_0x2ea31c)return 0x0;const _0x4f5e3d=_0x2ea31c["toString"]()['toLowerCase']()["replace"](/^(sd|hd|fhd|uhd|4k)\s*/i,'')["replace"](/p$/,'')["trim"](),_0x28cc18={'4k':0x870,'2160':0x870,'1440':0x5a0,'1080':0x438,'720':0x2d0,'480':0x1e0,'360':0x168,'240':0xf0};if(_0x28cc18[_0x4f5e3d])return _0x28cc18[_0x4f5e3d];const _0x3c9cf9=parseInt(_0x4f5e3d);if(!isNaN(_0x3c9cf9)&&_0x3c9cf9>0x0)return _0x3c9cf9;return 0x0;}function formatSize(_0x2ca7d8){const _0x282182=_0x476166;if(typeof _0x2ca7d8!=="number"||_0x2ca7d8<=0x0)return "Unknown";if(_0x2ca7d8>0x3b9aca00)return(_0x2ca7d8/0x3b9aca00)['toFixed'](0x2)+" GB";return(_0x2ca7d8/0xf4240)["toFixed"](0x0)+" MB";}function resolutionToQuality(_0x4bfeef){const _0x3385b4=_0x476166,_0x2d7fe4={0x1:"480p",0x2:'720p',0x3:"1080p"};return _0x2d7fe4[_0x4bfeef]||_0x4bfeef+'p';}function processVideoResponse(_0x51d20f,_0x73c86a,_0x29525d,_0x2a9997,_0xc0905c,_0x463154){const _0x4ac61c=_0x476166,_0x4a3539=[],_0x5df573=extractDataBlock(_0x51d20f),_0x4355a9=_0x5df573['videoUrl'];if(!_0x4355a9)return console["log"]("[Castle] No videoUrl found in response"),_0x4a3539;const _0x18d63b=[];_0x5df573["subtitles"]&&Array["isArray"](_0x5df573["subtitles"])&&_0x5df573['subtitles']["forEach"](_0x6fb016=>{const _0x3030ee=_0x4ac61c;_0x6fb016["url"]&&_0x18d63b["push"]({'url':_0x6fb016['url'],'language':_0x6fb016['abbreviate']||"Unknown",'name':_0x6fb016["title"]||_0x6fb016["abbreviate"]||"Unknown",'headers':PLAYBACK_HEADERS});});let _0x1e4135=_0x73c86a['title']||"Unknown";_0x73c86a['year']&&(_0x1e4135+='\x20('+_0x73c86a["year"]+')');_0x29525d&&_0x2a9997&&(_0x1e4135=_0x73c86a["title"]+'\x20S'+String(_0x29525d)["padStart"](0x2,'0')+'E'+String(_0x2a9997)['padStart'](0x2,'0'));const _0x36522a=resolutionToQuality(_0xc0905c);if(_0x5df573['videos']&&Array["isArray"](_0x5df573["videos"]))for(const _0x2adc37 of _0x5df573['videos']){let _0x40004a=_0x2adc37['resolutionDescription']||_0x2adc37['resolution']||_0x36522a;_0x40004a=_0x40004a["replace"](/^(SD|HD|FHD)\s+/i,'');const _0x57d84b=_0x463154?"Castle "+_0x463154+" - "+_0x40004a:"Castle - "+_0x40004a;_0x4a3539['push']({'name':_0x57d84b,'title':_0x1e4135,'url':_0x2adc37["url"]||_0x4355a9,'quality':_0x40004a,'size':formatSize(_0x2adc37['size']),'headers':PLAYBACK_HEADERS,'provider':"castle",'subtitles':_0x18d63b});}else{const _0x23119a=_0x463154?"Castle "+_0x463154+" - "+_0x36522a:'Castle\x20-\x20'+_0x36522a;_0x4a3539["push"]({'name':_0x23119a,'title':_0x1e4135,'url':_0x4355a9,'quality':_0x36522a,'size':formatSize(_0x5df573["size"]),'headers':PLAYBACK_HEADERS,'provider':"castle",'subtitles':_0x18d63b});}return _0x4a3539;}function getStreams(_0x4e2678,_0x308ce5,_0x4360e6,_0x3a120a){return __async(this,null,function*(){const _0x40c17b=_0x44e1;console["log"]('[Castle]\x20Starting\x20extraction\x20for\x20TMDB\x20ID:\x20'+_0x4e2678+',\x20Type:\x20'+_0x308ce5+(_0x308ce5==='tv'?", S:"+_0x4360e6+'E:'+_0x3a120a:''));try{const _0x49acb1=yield getTMDBDetails(_0x4e2678,_0x308ce5);console['log']("[Castle] TMDB Info: \""+_0x49acb1["title"]+'\x22\x20('+(_0x49acb1["year"]||'N/A')+')');const _0x3a9a82=yield getSecurityKey(),_0xc7ae78=yield findCastleMovieId(_0x3a9a82,_0x49acb1);let _0x581633=yield getDetails(_0x3a9a82,_0xc7ae78),_0x53456a=_0xc7ae78;if(_0x308ce5==='tv'&&_0x4360e6&&_0x3a120a){const _0x31bf4c=extractDataBlock(_0x581633),_0x49de5f=_0x31bf4c["seasons"]||[],_0x28e6b7=_0x49de5f["find"](_0x2fba64=>_0x2fba64["number"]===_0x4360e6);_0x28e6b7&&_0x28e6b7["movieId"]&&_0x28e6b7["movieId"]!==_0xc7ae78&&(console["log"]('[Castle]\x20Fetching\x20season\x20'+_0x4360e6+" details..."),_0x581633=yield getDetails(_0x3a9a82,_0x28e6b7["movieId"]['toString']()),_0x53456a=_0x28e6b7["movieId"]["toString"]());}const _0x28285a=extractDataBlock(_0x581633),_0x5a3185=_0x28285a["episodes"]||[];let _0x278ae7=null;if(_0x308ce5==='tv'&&_0x4360e6&&_0x3a120a){const _0x3a26a4=_0x5a3185["find"](_0x40594b=>_0x40594b["number"]===_0x3a120a);_0x3a26a4&&_0x3a26a4['id']&&(_0x278ae7=_0x3a26a4['id']["toString"]());}else _0x5a3185["length"]>0x0&&(_0x278ae7=_0x5a3185[0x0]['id']["toString"]());if(!_0x278ae7)throw new Error("Could not find episode ID");const _0x32e04c=_0x5a3185["find"](_0x5b0c72=>_0x5b0c72['id']['toString']()===_0x278ae7),_0x568af5=_0x32e04c&&_0x32e04c["tracks"]||[],_0x5e477c=0x2,_0xcfb5e5=[];for(const _0x26219c of _0x568af5){const _0x47f944=_0x26219c["languageName"]||_0x26219c["abbreviate"]||"Unknown";if(_0x26219c["existIndividualVideo"]&&_0x26219c["languageId"])try{console["log"]("[Castle] Fetching "+_0x47f944+'\x20(languageId:\x20'+_0x26219c["languageId"]+')');const _0x133c6=yield getVideoV1(_0x3a9a82,_0x53456a,_0x278ae7,_0x26219c['languageId'],_0x5e477c),_0x31a517=processVideoResponse(_0x133c6,_0x49acb1,_0x4360e6,_0x3a120a,_0x5e477c,'['+_0x47f944+']');_0x31a517["length"]>0x0&&(console["log"]("[Castle] ✅ "+_0x47f944+": Found "+_0x31a517["length"]+'\x20streams'),_0xcfb5e5["push"](..._0x31a517));}catch(_0x524520){console["log"]("[Castle] ⚠️ "+_0x47f944+": Failed - "+_0x524520["message"]);}}if(_0xcfb5e5['length']===0x0){console["log"]("[Castle] Falling back to shared stream (v2)");const _0x4916cb=yield getVideo2(_0x3a9a82,_0x53456a,_0x278ae7,_0x5e477c),_0x5306a6=processVideoResponse(_0x4916cb,_0x49acb1,_0x4360e6,_0x3a120a,_0x5e477c,'[Shared]');_0xcfb5e5["push"](..._0x5306a6);}return _0xcfb5e5["sort"]((_0x10ef39,_0x38ac31)=>getQualityValue(_0x38ac31["quality"])-getQualityValue(_0x10ef39["quality"])),console["log"]("[Castle] Total streams found: "+_0xcfb5e5["length"]),_0xcfb5e5;}catch(_0x90f7a8){return console["error"]('[Castle]\x20Error:\x20'+_0x90f7a8["message"]),[];}});}module["exports"]={'getStreams':getStreams};

/* ===== nvio light deadline wrapper (8s) =================================
   Bounds the provider's total runtime so the stream sheet is never held
   past ~9s (AIO parity). No filtering: rows pass through unchanged.
   Opt-out: set SCRAPER_SETTINGS.postFilter = false. ==================== */
(function () {
  var G = typeof globalThis !== "undefined" ? globalThis : this;
  try {
    var __orig = module.exports && module.exports.getStreams;
    if (typeof __orig !== "function") return;
    module.exports.getStreams = function () {
      var args = arguments, self = this;
      function timed() {
        var base = Promise.resolve(__orig.apply(self, args))
          .then(function (rows) { return Array.isArray(rows) ? rows : []; })
          .catch(function () { return []; });
        if (typeof setTimeout !== "function") return base; /* device: no timers */
        return Promise.race([
          base,
          new Promise(function (res) {
            var t = setTimeout(function () { res([]); }, 9000);
            if (typeof t === "object" && typeof t.unref === "function") t.unref();
          })
        ]).catch(function () { return []; });
      }
      try {
        var pf = G.SCRAPER_SETTINGS && G.SCRAPER_SETTINGS.postFilter;
        if (pf === false) return Promise.resolve(__orig.apply(self, args)).catch(function () { return []; });
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
(function () {
  'use strict';

  var WINGS_BASE = 'https://api.speedracelight.com';
  var TMDB_KEY = '439c478a771f35c05022f9feabcca01c';
  var WINGS_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';
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
  var SHA_C = [0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
               0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174];

  function _f(x) {
    x = x >>> 0;
    x ^= x >>> 16; x = Math.imul(x, 0x85ebca6b) >>> 0;
    x ^= x >>> 13; x = Math.imul(x, 0xc2b2ae35) >>> 0;
    x = (x ^ (x >>> 16)) >>> 0;
    return x;
  }
  function _rotl(x, n) {
    x = x >>> 0; n = n & 31;
    if (n === 0) return x >>> 0;
    return ((x << n) | (x >>> (32 - n))) >>> 0;
  }
  function _branch(n) { return ((n * (n + 1)) & 1) === 0; }
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
    return { slots: slots, acc: _f((0xa5a5a5a5 ^ s) >>> 0) >>> 0 };
  }
  function _next(state, counter) {
    var slots = state.slots, acc = state.acc;
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
      for (var q = 0; q < s.length; q++) { var c = s.charAt(q); if (c !== '=' && CH.indexOf(c) !== -1) clean += c; }
      bin = '';
      for (var w = 0; w < clean.length; w += 4) {
        var a = CH.indexOf(clean.charAt(w)), b = CH.indexOf(clean.charAt(w + 1));
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
      else if ((b & 0xf0) === 0xe0) s += String.fromCharCode(((b & 0x0f) << 12) | ((bytes[i++] & 0x3f) << 6) | (bytes[i++] & 0x3f));
      else if ((b & 0xf8) === 0xf0) {
        var cp = ((b & 0x07) << 18) | ((bytes[i++] & 0x3f) << 12) | ((bytes[i++] & 0x3f) << 6) | (bytes[i++] & 0x3f);
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
      return Promise.resolve(p).then(function (v) { return v; }, function () { return fallback; });
    }
    return new Promise(function (resolve) {
      var done = false;
      var t = setTimeout(function () { if (!done) { done = true; resolve(fallback); } }, ms);
      if (t && typeof t.unref === 'function') t.unref();
      Promise.resolve(p).then(function (v) { if (!done) { done = true; clearTimeout(t); resolve(v); } },
                              function () { if (!done) { done = true; clearTimeout(t); resolve(fallback); } });
    });
  }
  function _jsonText(resp) {
    return Promise.resolve(resp.text()).catch(function () { return ''; });
  }

  function wingsTmdbMeta(tmdbId, mediaType) {
    var url = 'https://api.themoviedb.org/3/' + (mediaType === 'tv' ? 'tv' : 'movie') + '/' +
      parseInt(tmdbId, 10) + '?api_key=' + TMDB_KEY + '&append_to_response=external_ids';
    return _race(
      _fetchX(url, { headers: { 'User-Agent': WINGS_UA, 'Accept': 'application/json' } })
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (j) {
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
    return _fetchX(WINGS_BASE + '/' + serverPath + '?' + params, { headers: WINGS_HEADERS })
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.text(); })
      .then(function (txt) {
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
      return wingsTmdbMeta(tmdbId, mediaType).then(function (meta) {
        if (!meta || !meta.title) return [];
        return _fetchX(WINGS_BASE + '/seed?mediaId=' + tmdbId, { headers: WINGS_HEADERS })
          .then(function (r) {
            if (r.ok) return r.json();
            if (r.status === 429 || r.status === 503) {
              /* seed endpoint rate-limits bursts; on the serialized device bridge
                 the immediate retry lands past the burst window */
              return _fetchX(WINGS_BASE + '/seed?mediaId=' + tmdbId, { headers: WINGS_HEADERS })
                .then(function (r2) { return r2.ok ? r2.json() : null; }, function () { return null; });
            }
            return null;
          })
          .then(function (j) {
            if (!j || !j.seed) throw new Error('no seed');
            var seed = j.seed;
            var jobs = WINGS_SERVERS.map(function (sp) {
              return wingsQueryServer(sp, seed, meta, mediaType, opts.season, opts.episode, tmdbId)
                .then(function (o) { return o; }, function () { return null; });
            });
            /* collect PARTIAL results: never gate on the slowest server.
             * undefined = still pending, null = failed, object = success. */
            return new Promise(function (resolve) {
              var results = new Array(jobs.length);
              var done = false;
              var t = null;
              if (typeof setTimeout === 'function') {
                /* device QuickJS ships no timers - guard every timer use */
                t = setTimeout(function () { if (!done) { done = true; resolve(results); } }, Math.max(6000, timeoutMs - 2500));
                if (t && typeof t.unref === 'function') t.unref();
              }
              var pending = jobs.length;
              var settle = function () {
                if (!done) { done = true; if (t) clearTimeout(t); resolve(results); }
              };
              jobs.forEach(function (jp, idx) {
                Promise.resolve(jp).then(function (obj) {
                  results[idx] = obj; pending--; if (pending <= 0) settle();
                }, function () {
                  results[idx] = null; pending--; if (pending <= 0) settle();
                });
              });
            }).then(function (results) {
              results = results || [];
              var seen = {};
              var rows = [];
              for (var i = 0; i < results.length; i++) {
                var obj = results[i];
                if (!obj) continue;
                var subs = (obj.subtitles || []).filter(function (s) { return s && s.url; })
                  .map(function (s) {
                    return { url: s.url, language: s.lang || s.language || 'en', name: s.language || s.lang || 'English' };
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
                    title: label + ' ' + q + (mediaType === 'tv' ? ' S' + (opts.season || 1) + 'E' + (opts.episode || 1) : ''),
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
              rows.sort(function (a, b) {
                var order = { '4K': 4, '1440p': 3, '1080p': 2, '720p': 1 };
                return (order[b.quality] || 0) - (order[a.quality] || 0);
              });
              return rows;
            });
          });
      }).catch(function () { return []; });
    } catch (e) { return Promise.resolve([]); }
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
(function () {
  'use strict';
  var __LABEL = 'Castle';
  var __WINGS_FIRST = false;
  var __ALT_NAME = '__nvWingsStreams';
  function __junk(u) { return /tungtungtungsahur\.cfd|\/api\?d=/i.test(String(u || '')); }
  var __orig = null;
  try { __orig = module.exports && module.exports.getStreams; } catch (e) { __orig = null; }
  if (typeof __orig !== 'function') return;
  function runAlt(args, self) {
    var f = null;
    try { f = (typeof globalThis !== 'undefined' && globalThis) ? globalThis[__ALT_NAME] : null; } catch (e) { f = null; }
    if (typeof f !== 'function') return Promise.resolve([]);
    try {
      var r = f({ tmdbId: args[0], mediaType: args[1], season: args[2], episode: args[3], label: __LABEL });
      return Promise.resolve(r).then(function (v) { return Array.isArray(v) ? v : []; }, function () { return []; });
    } catch (e) { return Promise.resolve([]); }
  }
  function runNative(args, self) {
    try {
      var r = __orig.apply(self, args);
      return Promise.resolve(r).then(function (v) { return Array.isArray(v) ? v : []; }, function () { return []; });
    } catch (e) { return Promise.resolve([]); }
  }
  module.exports.getStreams = function () {
    var args = Array.prototype.slice.call(arguments), self = this;
    function clean(v) {
      var seen = {}, out = [];
      (v || []).forEach(function (r) {
        if (!r || !r.url || __junk(r.url)) return;
        var k = String(r.url);
        if (seen[k]) return;
        seen[k] = 1; out.push(r);
      });
      return out;
    }
    function laneA() { return __WINGS_FIRST ? runAlt(args, self) : runNative(args, self); }
    function laneB() { return __WINGS_FIRST ? runNative(args, self) : runAlt(args, self); }
    return Promise.resolve().then(laneA).then(function (rows) {
      rows = clean(rows);
      if (rows.length) return rows;
      return Promise.resolve().then(laneB).then(function (rows2) { return clean(rows2); });
    });
  };
})();
