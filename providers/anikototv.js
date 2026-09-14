/* nv-plugins anikototv.js v1.3.0 (pack 4.33.0, 2026-09-13): playback fallback - the MegaPlay CDN (ncdn.imgnex.top / fetch.nexabloom.top) rejects non-residential traffic and the device report says rows do not play; the decoded 4.26.0 AllAnime provider is embedded as an independent anime lane (allanime FIRST, MegaPlay lanes kept). */
/* ============================================================
 * nv-plugins allanime lane v1.0.0 (pack 4.33.0) - embedded copy of the
 * decoded 4.26.0 AllAnime provider, IIFE-scoped, exported as
 * globalThis.__nvAllAnimeGetStreams. Kept as an independent anime
 * backend (POST api.allanime.day; search verified live 2026-09-13).
 * ============================================================ */
(function() {
  /*
   * nv-plugins allanime.js — FULLY DECODED port of the All-in-One-Nuvio provider (4.24.0 merge pass).
   * Decoded from the obfuscated AIO build: string tables resolved, decoder machinery stripped,
   * every network call capped by an 8s deadline, node-core requires fail-soft, nvio post-filter
   * attached (en/tl audio gate, >=720p quality gate, cross-provider dedupe). Endpoints/keys/headers
   * identical to the AIO original.
   */
  /* nv-plugins best-settings pass 4.24.0: hard 8s deadline on every network call */
/* nv-plugins 4.38.0 device fix: crypto-js-compatible pure-JS fallback.
   The device realm has no `require` and no crypto-js, so the unconditional
   CryptoJS.SHA256(...) at load crashed the provider BEFORE any network work.
   __nvAnikotoCrypto implements the exact surface this file uses - SHA256,
   Hex/Base64/Utf8 WordArray encodings, AES-128/192/256-CTR (NoPadding),
   CipherParams.create - validated against node:crypto (14/14 vectors).
   Node/PC runtimes keep using the real crypto-js module. */
  function makeShim() {
  function _sha256Bytes(bytes) {
    var K = [0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
      0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
      0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
      0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
      0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
      0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
      0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
      0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2];
    var l = bytes.length;
    var hi = Math.floor(l / 0x20000000), lo = (l << 3) >>> 0;
    var buf = bytes.concat([0x80]);
    var total = Math.ceil((buf.length + 8) / 64) * 64;
    while (buf.length < total) buf.push(0);
    var off = buf.length - 8;
    buf[off] = (hi >>> 24) & 255; buf[off + 1] = (hi >>> 16) & 255; buf[off + 2] = (hi >>> 8) & 255; buf[off + 3] = hi & 255;
    buf[off + 4] = (lo >>> 24) & 255; buf[off + 5] = (lo >>> 16) & 255; buf[off + 6] = (lo >>> 8) & 255; buf[off + 7] = lo & 255;
    function rotr(x, n) { return ((x >>> n) | (x << (32 - n))) >>> 0; }
    var h0 = 0x6a09e667, h1 = 0xbb67ae85, h2 = 0x3c6ef372, h3 = 0xa54ff53a,
        h4 = 0x510e527f, h5 = 0x9b05688c, h6 = 0x1f83d9ab, h7 = 0x5be0cd19;
    var w = new Array(64);
    for (var i = 0; i < buf.length; i += 64) {
      for (var t = 0; t < 16; t++) w[t] = ((buf[i + 4 * t] << 24) | (buf[i + 4 * t + 1] << 16) | (buf[i + 4 * t + 2] << 8) | buf[i + 4 * t + 3]) >>> 0;
      for (var t2 = 16; t2 < 64; t2++) {
        var s0 = rotr(w[t2 - 15], 7) ^ rotr(w[t2 - 15], 18) ^ (w[t2 - 15] >>> 3);
        var s1 = rotr(w[t2 - 2], 17) ^ rotr(w[t2 - 2], 19) ^ (w[t2 - 2] >>> 10);
        w[t2] = (w[t2 - 16] + s0 + w[t2 - 7] + s1) >>> 0;
      }
      var a = h0, b = h1, c = h2, d = h3, e = h4, f = h5, g = h6, h = h7;
      for (var k = 0; k < 64; k++) {
        var S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
        var ch = (e & f) ^ (~e & g);
        var t1 = (h + S1 + ch + K[k] + w[k]) >>> 0;
        var S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
        var maj = (a & b) ^ (a & c) ^ (b & c);
        var t2b = (S0 + maj) >>> 0;
        h = g; g = f; f = e; e = (d + t1) >>> 0; d = c; c = b; b = a; a = (t1 + t2b) >>> 0;
      }
      h0 = (h0 + a) >>> 0; h1 = (h1 + b) >>> 0; h2 = (h2 + c) >>> 0; h3 = (h3 + d) >>> 0;
      h4 = (h4 + e) >>> 0; h5 = (h5 + f) >>> 0; h6 = (h6 + g) >>> 0; h7 = (h7 + h) >>> 0;
    }
    var out = [];
    [h0, h1, h2, h3, h4, h5, h6, h7].forEach(function (hh) { out.push((hh >>> 24) & 255, (hh >>> 16) & 255, (hh >>> 8) & 255, hh & 255); });
    return out;
  }
  function _utf8(s) {
    var out = [];
    for (var i = 0; i < s.length; i++) {
      var c = s.codePointAt(i);
      if (c > 0xffff) i++;
      if (c < 0x80) out.push(c);
      else if (c < 0x800) out.push(0xc0 | (c >> 6), 0x80 | (c & 63));
      else if (c < 0x10000) out.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 63), 0x80 | (c & 63));
      else out.push(0xf0 | (c >> 18), 0x80 | ((c >> 12) & 63), 0x80 | ((c >> 6) & 63), 0x80 | (c & 63));
    }
    return out;
  }
  function _hex(bytes) { return bytes.map(function (b) { return (b < 16 ? "0" : "") + b.toString(16); }).join(""); }
  var Hex, Base64, Utf8; // forward declarations (WA.toString closes over these)
  function WA(bytes, sigBytes) {
    var words = [];
    var i;
    for (i = 0; i + 3 < bytes.length; i += 4) words.push(((bytes[i] << 24) | (bytes[i + 1] << 16) | (bytes[i + 2] << 8) | bytes[i + 3]) >>> 0);
    var rem = bytes.length - i;
    if (rem === 3) words.push(((bytes[i] << 24) | (bytes[i + 1] << 16) | (bytes[i + 2] << 8)) >>> 0);
    else if (rem === 2) words.push(((bytes[i] << 24) | (bytes[i + 1] << 16)) >>> 0);
    else if (rem === 1) words.push((bytes[i] << 24) >>> 0);
    var sig = sigBytes === undefined ? bytes.length : sigBytes;
    return {
      words: words, sigBytes: sig,
      /* crypto-js WordArray parity: toString(enc) instance method */
      toString: function (enc) {
        var bs = waBytes({ words: words, sigBytes: sig });
        if (enc === Utf8) return _utf8Dec(bs);
        if (enc === Base64) return _b64(bs);
        return _hex(bs);
      },
      clamp: function () { sig = Math.min(sig, words.length * 4); return this; },
    };
  }
  function waBytes(wa) {
    var out = [];
    for (var i = 0; i * 4 < Math.min(wa.sigBytes, wa.words.length * 4); i++) {
      var w = wa.words[i] | 0;
      out.push((w >>> 24) & 255, (w >>> 16) & 255, (w >>> 8) & 255, w & 255);
    }
    out.length = Math.min(wa.sigBytes, out.length);
    return out;
  }
  function _hex(bytes) { return bytes.map(function (b) { return (b < 16 ? "0" : "") + b.toString(16); }).join(""); }
  function _hexParse(str) {
    var clean = String(str).replace(/[^0-9a-fA-F]/g, "");
    if (clean.length % 2) clean += "0";
    var bytes = [];
    for (var i = 0; i < clean.length; i += 2) bytes.push(parseInt(clean.substr(i, 2), 16));
    return WA(bytes);
  }
  function _b64Parse(str) {
    var T = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    var clean = String(str).replace(/[^A-Za-z0-9+/=]/g, "");
    var bytes = [], bits = 0, acc = 0;
    for (var i = 0; i < clean.length; i++) {
      var ch = clean[i];
      if (ch === "=") break;
      var v = T.indexOf(ch);
      if (v < 0) continue;
      acc = (acc << 6) | v; bits += 6;
      if (bits >= 8) { bits -= 8; bytes.push((acc >> bits) & 255); }
    }
    return WA(bytes);
  }
  function _b64(bytes) {
    var T = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    var out = "";
    for (var i = 0; i < bytes.length; i += 3) {
      var b0 = bytes[i], b1 = bytes[i + 1], b2 = bytes[i + 2];
      out += T[b0 >> 2];
      out += T[((b0 & 3) << 4) | ((b1 === undefined ? 0 : b1) >> 4)];
      out += b1 === undefined ? "=" : T[((b1 & 15) << 2) | ((b2 === undefined ? 0 : b2) >> 6)];
      out += b2 === undefined ? "=" : T[b2 & 63];
    }
    return out;
  }
  function _utf8Dec(bytes) {
    var s = "";
    for (var i = 0; i < bytes.length; ) {
      var b = bytes[i];
      if (b < 0x80) { s += String.fromCharCode(b); i += 1; }
      else if (b < 0xe0) { s += String.fromCharCode(((b & 31) << 6) | (bytes[i + 1] & 63)); i += 2; }
      else if (b < 0xf0) { s += String.fromCharCode(((b & 15) << 12) | ((bytes[i + 1] & 63) << 6) | (bytes[i + 2] & 63)); i += 3; }
      else {
        var cp = ((b & 7) << 18) | ((bytes[i + 1] & 63) << 12) | ((bytes[i + 2] & 63) << 6) | (bytes[i + 3] & 63);
        s += String.fromCharCode(0xd800 + ((cp - 0x10000) >> 10), 0xdc00 + ((cp - 0x10000) & 0x3ff));
        i += 4;
      }
    }
    return s;
  }
  // AES core: key size 128/192/256 derived from key byte length
  var SBOX = [0x63,0x7c,0x77,0x7b,0xf2,0x6b,0x6f,0xc5,0x30,0x01,0x67,0x2b,0xfe,0xd7,0xab,0x76,
    0xca,0x82,0xc9,0x7d,0xfa,0x59,0x47,0xf0,0xad,0xd4,0xa2,0xaf,0x9c,0xa4,0x72,0xc0,
    0xb7,0xfd,0x93,0x26,0x36,0x3f,0xf7,0xcc,0x34,0xa5,0xe5,0xf1,0x71,0xd8,0x31,0x15,
    0x04,0xc7,0x23,0xc3,0x18,0x96,0x05,0x9a,0x07,0x12,0x80,0xe2,0xeb,0x27,0xb2,0x75,
    0x09,0x83,0x2c,0x1a,0x1b,0x6e,0x5a,0xa0,0x52,0x3b,0xd6,0xb3,0x29,0xe3,0x2f,0x84,
    0x53,0xd1,0x00,0xed,0x20,0xfc,0xb1,0x5b,0x6a,0xcb,0xbe,0x39,0x4a,0x4c,0x58,0xcf,
    0xd0,0xef,0xaa,0xfb,0x43,0x4d,0x33,0x85,0x45,0xf9,0x02,0x7f,0x50,0x3c,0x9f,0xa8,
    0x51,0xa3,0x40,0x8f,0x92,0x9d,0x38,0xf5,0xbc,0xb6,0xda,0x21,0x10,0xff,0xf3,0xd2,
    0xcd,0x0c,0x13,0xec,0x5f,0x97,0x44,0x17,0xc4,0xa7,0x7e,0x3d,0x64,0x5d,0x19,0x73,
    0x60,0x81,0x4f,0xdc,0x22,0x2a,0x90,0x88,0x46,0xee,0xb8,0x14,0xde,0x5e,0x0b,0xdb,
    0xe0,0x32,0x3a,0x0a,0x49,0x06,0x24,0x5c,0xc2,0xd3,0xac,0x62,0x91,0x95,0xe4,0x79,
    0xe7,0xc8,0x37,0x6d,0x8d,0xd5,0x4e,0xa9,0x6c,0x56,0xf4,0xea,0x65,0x7a,0xae,0x08,
    0xba,0x78,0x25,0x2e,0x1c,0xa6,0xb4,0xc6,0xe8,0xdd,0x74,0x1f,0x4b,0xbd,0x8b,0x8a,
    0x70,0x3e,0xb5,0x66,0x48,0x03,0xf6,0x0e,0x61,0x35,0x57,0xb9,0x86,0xc1,0x1d,0x9e,
    0xe1,0xf8,0x98,0x11,0x69,0xd9,0x8e,0x94,0x9b,0x1e,0x87,0xe9,0xce,0x55,0x28,0xdf,
    0x8c,0xa1,0x89,0x0d,0xbf,0xe6,0x42,0x68,0x41,0x99,0x2d,0x0f,0xb0,0x54,0xbb,0x16];
  function _xtime(v) { return ((v << 1) ^ ((v & 0x80) ? 0x1b : 0)) & 0xff; }
  function _aesExpand(keyBytes) {
    var nk = keyBytes.length / 4, nr = nk + 6;
    var w = [];
    for (var i = 0; i < nk; i++) w.push(((keyBytes[4 * i] << 24) | (keyBytes[4 * i + 1] << 16) | (keyBytes[4 * i + 2] << 8) | keyBytes[4 * i + 3]) >>> 0);
    var rcon = 1;
    for (var j = nk; j < 4 * (nr + 1); j++) {
      var t = w[j - 1];
      if (j % nk === 0) {
        // RotWord + SubWord: RotWord([a0,a1,a2,a3])=[a1,a2,a3,a0] with a0=MSB
        t = ((SBOX[(t >>> 16) & 255] << 24) ^ (SBOX[(t >>> 8) & 255] << 16) ^ (SBOX[t & 255] << 8) ^ SBOX[(t >>> 24) & 255]) >>> 0;
        t = (t ^ ((rcon << 24) >>> 0)) >>> 0;
        rcon = _xtime(rcon);
      } else if (nk > 6 && j % nk === 4) {
        t = ((SBOX[(t >>> 24) & 255] << 24) ^ (SBOX[(t >>> 16) & 255] << 16) ^ (SBOX[(t >>> 8) & 255] << 8) ^ SBOX[t & 255]) >>> 0;
      }
      w[j] = (w[j - nk] ^ t) >>> 0;
    }
    return { w: w, nr: nr };
  }
  function _subShift(s, i) {
    // SubBytes + ShiftRows for output column i: row r from input column (i+r)%4
    return ((SBOX[(s[i] >>> 24) & 255] << 24) ^
      (SBOX[(s[(i + 1) % 4] >>> 16) & 255] << 16) ^
      (SBOX[(s[(i + 2) % 4] >>> 8) & 255] << 8) ^
      SBOX[s[(i + 3) % 4] & 255]) >>> 0;
  }
  function _mixColWord(t) {
    // MixColumns on one column-word (MSB = row 0)
    var a0 = (t >>> 24) & 255, a1 = (t >>> 16) & 255, a2 = (t >>> 8) & 255, a3 = t & 255;
    var r0 = (_xtime(a0) ^ (a1 ^ _xtime(a1)) ^ a2 ^ a3) & 255;
    var r1 = (a0 ^ _xtime(a1) ^ (a2 ^ _xtime(a2)) ^ a3) & 255;
    var r2 = (a0 ^ a1 ^ _xtime(a2) ^ (a3 ^ _xtime(a3))) & 255;
    var r3 = ((a0 ^ _xtime(a0)) ^ a1 ^ a2 ^ _xtime(a3)) & 255;
    return ((r0 << 24) | (r1 << 16) | (r2 << 8) | r3) >>> 0;
  }
  function _aesEncryptBlock(exp, block16) {
    var w = exp.w, nr = exp.nr;
    var s = [
      ((block16[0] << 24) | (block16[1] << 16) | (block16[2] << 8) | block16[3]) >>> 0,
      ((block16[4] << 24) | (block16[5] << 16) | (block16[6] << 8) | block16[7]) >>> 0,
      ((block16[8] << 24) | (block16[9] << 16) | (block16[10] << 8) | block16[11]) >>> 0,
      ((block16[12] << 24) | (block16[13] << 16) | (block16[14] << 8) | block16[15]) >>> 0,
    ];
    s[0] = (s[0] ^ w[0]) >>> 0; s[1] = (s[1] ^ w[1]) >>> 0; s[2] = (s[2] ^ w[2]) >>> 0; s[3] = (s[3] ^ w[3]) >>> 0;
    for (var round = 1; round <= nr; round++) {
      var n0 = _subShift(s, 0), n1 = _subShift(s, 1), n2 = _subShift(s, 2), n3 = _subShift(s, 3);
      if (round < nr) { n0 = _mixColWord(n0); n1 = _mixColWord(n1); n2 = _mixColWord(n2); n3 = _mixColWord(n3); }
      n0 = (n0 ^ w[4 * round]) >>> 0; n1 = (n1 ^ w[4 * round + 1]) >>> 0; n2 = (n2 ^ w[4 * round + 2]) >>> 0; n3 = (n3 ^ w[4 * round + 3]) >>> 0;
      s = [n0, n1, n2, n3];
    }
    var out = [];
    for (var i = 0; i < 4; i++) out.push((s[i] >>> 24) & 255, (s[i] >>> 16) & 255, (s[i] >>> 8) & 255, s[i] & 255);
    return out;
  }
  function _ctrCrypt(keyBytes, ivBytes, dataBytes) {
    var exp = _aesExpand(keyBytes);
    var ctr = ivBytes.slice(0, 16);
    var out = [];
    for (var off = 0; off < dataBytes.length; off += 16) {
      var ks = _aesEncryptBlock(exp, ctr);
      for (var i = 0; i < 16 && off + i < dataBytes.length; i++) out.push(dataBytes[off + i] ^ ks[i]);
      for (var c = 15; c >= 12; c--) { if (ctr[c] === 255) { ctr[c] = 0; } else { ctr[c] = (ctr[c] + 1) & 255; break; } }
    }
    return out;
  }
  var Hex = {
    parse: function (s) { return _hexParse(s); },
    stringify: function (wa) { return _hex(waBytes(wa)); },
  };
  var Base64 = {
    parse: function (s) { return _b64Parse(s); },
    stringify: function (wa) { return _b64(waBytes(wa)); },
  };
  var Utf8 = {
    stringify: function (wa) { return _utf8Dec(waBytes(wa)); },
  };
  return {
    SHA256: function (msg) { return WA(_sha256Bytes(typeof msg === "string" ? _utf8(String(msg)) : waBytes(msg))); },
    enc: { Hex: Hex, Base64: Base64, Utf8: Utf8 },
    lib: { CipherParams: { create: function (o) { return o; } } },
    mode: { CTR: { name: "CTR" } },
    pad: { NoPadding: { name: "NoPadding" } },
    AES: {
      decrypt: function (params, key, cfg) {
        var data = waBytes(params.ciphertext);
        var keyBytes = waBytes(key);
        var ivBytes = waBytes(cfg.iv);
        var out = _ctrCrypt(keyBytes, ivBytes, data);
        return WA(out);
      },
    },
  };
}
// ---------- validation vs node:crypto ----------
  var __nvAnikotoCrypto = (makeShim)();
  var __nvFetch = function() {
    var _f = null;
    try {
      _f = typeof fetch === "function" ? fetch : null;
    } catch (e) {
      _f = null;
    }
    if (!_f) {
      return function() {
        return Promise.reject(new Error("no fetch"));
      };
    }
    var hasT = typeof setTimeout === "function";
    return function(input, init) {
      var p;
      try {
        p = _f.apply(this, arguments);
      } catch (e) {
        return Promise.reject(e);
      }
      if (!hasT || !p || typeof p.then !== "function") {
        return p;
      }
      return Promise.race([p, new Promise(function(_res, rej) {
        var t = setTimeout(function() {
          rej(new Error("nv deadline 8s"));
        }, 8000);
        if (t && typeof t.unref === "function") {
          t.unref();
        }
      })]);
    };
  }();
  /* fail-soft require: node-core modules (net/http/assert/...) never crash the provider */
  var __nvRequire = function() {
    var _rq = null;
    try {
      _rq = typeof require === "function" ? require : null;
    } catch (e) {
      _rq = null;
    }
    return function(name) {
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
  var window = typeof window !== "undefined" && window ? window : typeof globalThis !== "undefined" ?
    globalThis : typeof global !== "undefined" ? global : {};
  var self = typeof self !== "undefined" && self ? self : window;
  var document = typeof document !== "undefined" && document ? document : {
    createElement: function() {
      return {
        style: {},
        setAttribute: function() {},
        getElementsByTagName: function() {
          return [];
        }
      };
    },
    getElementsByTagName: function() {
      return [];
    },
    addEventListener: function() {}
  };
  var navigator = typeof navigator !== "undefined" && navigator ? navigator : {
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36"
  };

  function v1() {
    return "";
  }
  const v2 = v1; /*rotation removed*/ ;
  var __async = (v3, v4, v5) => {
    return new Promise((v6, v7) => {
      const v8 = v1;
      var v9 = v10 => {
        const v11 = v1;
        try {
          v12(v5.next(v10));
        } catch (v13) {
          v7(v13);
        }
      };
      var v14 = v15 => {
        const v16 = v1;
        try {
          v12(v5.throw(v15));
        } catch (v17) {
          v7(v17);
        }
      };
      var v12 = v18 => v18.done ? v6(v18.value) : Promise.resolve(v18.value).then(v9, v14);
      v12((v5 = v5.apply(v3, v4)).next());
    });
  };
  var CryptoJS = (function () {
    try {
      var m = typeof __nvRequire === "function" ? __nvRequire("crypto-js") : null;
      if (m && typeof m.SHA256 === "function" && m.AES && m.lib) return m;
    } catch (e) {}
    try {
      if (typeof require === "function") {
        var r = require("crypto-js");
        if (r && typeof r.SHA256 === "function") return r;
      }
    } catch (e) {}
    return __nvAnikotoCrypto;
  })();
  var AGENT =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36";
  var ALLANIME_BASE = "https://allanime.day";
  var ALLANIME_API = "https://api.allanime.day/api";

  function getSimilarity(v19, v20) {
    const v21 = v2;
    if (!v19 || !v20) {
      return 0;
    }
    const v22 = v19.toLowerCase().replace(/[^a-z0-9]/g, "");
    const v23 = v20.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (v22 === v23) {
      return 1;
    }
    if (v22.length < 2 || v23.length < 2) {
      return 0;
    }
    const v24 = v25 => {
      const v26 = v21;
      const v27 = new Set();
      for (let v28 = 0; v28 < v25.length - 1; v28++) {
        v27.add(v25.substring(v28, v28 + 2));
      }
      return v27;
    };
    const v29 = v24(v22);
    const v30 = v24(v23);
    let v31 = 0;
    for (const v32 of v29) {
      if (v30.has(v32)) {
        v31++;
      }
    }
    return v31 * 2 / (v29.size + v30.size);
  }

  function decryptProviderId(v33) {
    const v34 = v2;
    const v35 = {
      "79": "A",
      "7a": "B",
      "7b": "C",
      "7c": "D",
      "7d": "E",
      "7e": "F",
      "7f": "G",
      "70": "H",
      "71": "I",
      "72": "J",
      "73": "K",
      "74": "L",
      "75": "M",
      "76": "N",
      "77": "O",
      "68": "P",
      "69": "Q",
      "6a": "R",
      "6b": "S",
      "6c": "T",
      "6d": "U",
      "6e": "V",
      "6f": "W",
      "60": "X",
      "61": "Y",
      "62": "Z",
      "59": "a",
      "5a": "b",
      "5b": "c",
      "5c": "d",
      "5d": "e",
      "5e": "f",
      "5f": "g",
      "50": "h",
      "51": "i",
      "52": "j",
      "53": "k",
      "54": "l",
      "55": "m",
      "56": "n",
      "57": "o",
      "48": "p",
      "49": "q",
      "4a": "r",
      "4b": "s",
      "4c": "t",
      "4d": "u",
      "4e": "v",
      "4f": "w",
      "40": "x",
      "41": "y",
      "42": "z",
      "08": "0",
      "09": "1",
      "0a": "2",
      "0b": "3",
      "0c": "4",
      "0d": "5",
      "0e": "6",
      "0f": "7",
      "00": "8",
      "01": "9",
      "15": "-",
      "16": ".",
      "67": "_",
      "46": "~",
      "02": ":",
      "17": "/",
      "07": "?",
      "1b": "#",
      "63": "[",
      "65": "]",
      "78": "@",
      "19": "!",
      "1c": "$",
      "1e": "&",
      "10": "(",
      "11": ")",
      "12": "*",
      "13": "+",
      "14": ",",
      "03": ";",
      "05": "=",
      "1d": "%"
    };
    let v36 = "";
    for (let v37 = 0; v37 < v33.length; v37 += 2) {
      const v38 = v33.substring(v37, v37 + 2);
      v36 += v35[v38] || v38;
    }
    return v36.replace(/([^:])\/\//g, "$1/").replace("/clock", "/clock.json");
  }
  var AES_KEY = CryptoJS.SHA256("Xot36i3lK3:v1");

  function decryptToBeParsed(v39) {
    const v40 = v2;
    const v41 = CryptoJS.enc.Base64.parse(v39);
    const v42 = v41.toString(CryptoJS.enc.Hex);
    const v43 = v42.substring(2, 26);
    const v44 = v42.substring(26, v42.length - 32);
    if (!v44 || v44.length === 0) {
      return null;
    }
    const v45 = v43 + "00000002";
    const v46 = CryptoJS.enc.Hex.parse(v45);
    const v47 = CryptoJS.enc.Hex.parse(v44);
    const v48 = CryptoJS.lib.CipherParams.create({
      ciphertext: v47
    });
    const v49 = CryptoJS.AES.decrypt(v48, AES_KEY, {
      iv: v46,
      mode: CryptoJS.mode.CTR,
      padding: CryptoJS.pad.NoPadding
    });
    return v49.toString(CryptoJS.enc.Utf8);
  } /*string-table removed*/
  function searchAnime(v50, v51) {
    return __async(this, null, function*() {
      const v52 = v1;
      var v53;
      var v54;
      const v55 = v51 === "dub" ? "dub" : "sub";
      const v56 =
        "query( $search: SearchInput $limit: Int $page: Int $translationType: VaildTranslationTypeEnumType $countryOrigin: VaildCountryOriginEnumType ) { shows( search: $search limit: $limit page: $page translationType: $translationType countryOrigin: $countryOrigin ) { edges { _id name availableEpisodes __typename } }}";
      const v57 = JSON.stringify({
        variables: {
          search: {
            allowAdult: false,
            allowUnknown: false,
            query: v50
          },
          limit: 40,
          page: 1,
          translationType: v55,
          countryOrigin: "ALL"
        },
        query: v56
      });
      const v58 = {
        "User-Agent": AGENT,
        "Content-Type": "application/json",
        Referer: "https://allmanga.to",
        Origin: "https://allmanga.to"
      };
      try {
        const v59 = yield __nvFetch(ALLANIME_API, {
          method: "POST",
          headers: v58,
          body: v57
        });
        if (!v59.ok) {
          return [];
        }
        const v60 = yield v59.json();
        const v61 = ((v54 = (v53 = v60 == null ? undefined : v60.data) == null ? undefined : v53
          .shows) == null ? undefined : v54.edges) || [];
        return v61.map(v62 => ({
          id: v62._id,
          name: v62.name,
          episodes: v62.availableEpisodes && v62.availableEpisodes[v55] || 0
        }));
      } catch (v63) {
        console.error("AllAnime Search Error:", v63);
        return [];
      }
    });
  }

  function getRawStreamSources(v64, v65, v66) {
    return __async(this, null, function*() {
      const v67 = v1;
      var v68;
      var v69;
      var v70;
      var v71;
      const v72 = v66 === "dub" ? "dub" : "sub";
      const v73 = {
        showId: v64,
        translationType: v72,
        episodeString: String(v65)
      };
      const v74 = "d405d0edd690624b66baba3068e0edc3ac90f1597d898a1ec8db4e5c43c00fec";
      const v75 = ALLANIME_API + "?variables=" + encodeURIComponent(JSON.stringify(v73)) +
        "&extensions=" + encodeURIComponent(JSON.stringify({
          persistedQuery: {
            version: 1,
            sha256Hash: v74
          }
        }));
      const v76 = {
        "User-Agent": AGENT,
        Accept: "*/*",
        Referer: "https://youtu-chan.com",
        Origin: ALLANIME_BASE
      };
      try {
        const v77 = yield __nvFetch(v75, {
          headers: v76
        });
        if (!v77.ok) {
          console.error("getRawStreamSources HTTP", v77.status);
          return [];
        }
        const v78 = yield v77.json();
        if ((v68 = v78 == null ? undefined : v78.data) == null ? undefined : v68.tobeparsed) {
          const v79 = decryptToBeParsed(v78.data.tobeparsed);
          if (v79) {
            try {
              const v80 = JSON.parse(v79);
              if ((v69 = v80 == null ? undefined : v80.episode) == null ? undefined : v69.sourceUrls) {
                return v80.episode.sourceUrls;
              }
            } catch (v81) {
              console.error("tobeparsed JSON parse error:", v81, v79.substring(0, 100));
            }
          }
          return [];
        }
        return ((v71 = (v70 = v78 == null ? undefined : v78.data) == null ? undefined : v70.episode) ==
          null ? undefined : v71.sourceUrls) || [];
      } catch (v82) {
        console.error("AllAnime Raw Stream Error:", v82);
        return [];
      }
    });
  }

  function fetchLinksFromProvider(v83) {
    return __async(this, null, function*() {
      const v84 = v1;
      try {
        const v85 = v83.startsWith("http") ? v83 : ALLANIME_BASE + v83;
        const v86 = yield __nvFetch(v85, {
          headers: {
            "User-Agent": AGENT,
            Referer: ALLANIME_BASE + "/"
          }
        });
        if (!v86.ok) {
          return [];
        }
        const v87 = yield v86.json();
        const v88 = [];
        if (v87.links && Array.isArray(v87.links)) {
          v88.push(...v87.links.map(v89 => ({
            url: v89.link,
            quality: v89.resolutionStr || "Unknown",
            headers: {
              "User-Agent": AGENT
            }
          })));
        } else if (v87.data) {
          const v90 = decryptToBeParsed(v87.data);
          try {
            const v91 = JSON.parse(v90);
            const v92 = Array.isArray(v91) ? v91 : v91.links || [];
            v88.push(...v92.map(v93 => ({
              url: v93.link,
              quality: v93.resolutionStr || "Unknown",
              headers: {
                "User-Agent": AGENT
              }
            })));
          } catch (v94) {
            console.error("Failed to parse decrypted tobeparsed:", v94);
          }
        }
        return v88;
      } catch (v95) {
        console.error("Fetch provider links error:", v95);
        return [];
      }
    });
  } /*decoder removed*/
  function getAnilistId(v96, v97) {
    return __async(this, null, function*() {
      const v98 = v1;
      try {
        const v99 = "https://arm.haglund.dev/api/v2/themoviedb?id=" + v96;
        const v100 = yield __nvFetch(v99);
        if (v100.ok) {
          const v101 = yield v100.json();
          if (Array.isArray(v101) && v101.length > 0 && v101[0].anilist) {
            return v101[0].anilist;
          }
        }
      } catch (v102) {
        console.error("Mapping Error:", v102);
      }
      return null;
    });
  }

  function getAnilistMeta(v103) {
    return __async(this, null, function*() {
      const v104 = v1;
      var v105;
      const v106 =
        "\n        query ($id: Int) {\n            Media (id: $id) {\n                id\n                format\n                episodes\n                title { romaji english native }\n                relations {\n                    edges { relationType }\n                    nodes { id format episodes type }\n                }\n            }\n        }\n    ";
      try {
        const v107 = yield __nvFetch("https://graphql.anilist.co", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json"
          },
          body: JSON.stringify({
            query: v106,
            variables: {
              id: parseInt(v103)
            }
          })
        });
        if (v107.ok) {
          const v108 = yield v107.json();
          if ((v105 = v108.data) == null) {
            return undefined;
          } else {
            return v105.Media;
          }
        }
      } catch (v109) {}
      return null;
    });
  }

  function resolveAnilistEpisode(v110, v111, v112, v113) {
    return __async(this, null, function*() {
      const v114 = v1;
      const v115 = yield getAnilistMeta(v110);
      if (!v115) {
        return {
          title: null,
          ep: v112
        };
      }
      const v116 = v115.title.romaji || v115.title.english || "";
      return {
        title: v116,
        ep: v112
      };
    });
  }

  function getStreams(v117, v118, v119, v120) {
    return __async(this, null, function*() {
      const v121 = v1;
      const v122 = v117;
      const v123 = yield getAnilistId(v122, v118);
      console.log("Anilist ID:", v123);
      let v124 = "Anime";
      let v125 = String(v120);
      let v126 = String(v120);
      if (v123) {
        const v127 = yield resolveAnilistEpisode(v123, v119, v120, v118);
        console.log("Resolved:", v127);
        v124 = v127.title || v124;
        v125 = String(v127.ep);
        v126 = String(v127.ep);
      } else {
        try {
          const v128 = yield __nvFetch("https://api.themoviedb.org/3/" + (v118 === "movie" ? "movie" :
            "tv") + "/" + v122 + "?api_key=94fc7b2a9e6af14b1c78465d64e9e0d1");
          if (v128.ok) {
            const v129 = yield v128.json();
            v124 = v129.name || v129.title || v124;
          }
        } catch (v130) {}
      }
      console.log("Search title:", v124);
      const v131 = [v124];
      const [v132, v133] = yield Promise.all([searchAnime(v131[0], "sub").catch(() => []), searchAnime(
        v131[0], "dub").catch(() => [])]);
      console.log("Sub results: " + v132.length + ", Dub results: " + v133.length);
      const v134 = (v135, v136) => {
        const v137 = v121;
        if (!v135 || v135.length === 0) {
          return null;
        }
        let v138 = 0;
        let v139 = null;
        for (const v140 of v135) {
          const v141 = getSimilarity(v140.name, v136);
          if (v141 > v138) {
            v138 = v141;
            v139 = v140;
          }
        }
        if (v139 && v138 > 0.4) {
          return v139;
        }
        return v135[0];
      };
      let v142 = v134(v132, v124);
      let v143 = v134(v133, v124);
      const v144 = [];
      const v145 = (v146, v147, v148) => __async(this, null, function*() {
        const v149 = v121;
        if (!v146) {
          return;
        }
        const v150 = yield getRawStreamSources(v146.id, v148, v147.toLowerCase());
        console.log("[" + v147 + "] Got " + v150.length + " raw sources");
        const v151 = ["Yt-mp4", "Default", "S-mp4", "Uv-mp4", "Luf-Mp4", "Sl-mp4"];
        for (const v152 of v150) {
          const v153 = v152.sourceName || "";
          let v154 = v152.sourceUrl;
          if (v154.startsWith("--")) {
            v154 = decryptProviderId(v154.substring(2));
            if (!v154) {
              console.log("[" + v147 + "] Failed to decrypt " + v153);
              continue;
            }
          }
          console.log("[" + v147 + "] " + v153 + ": " + v154.substring(0, 80));
          if (v154.includes("fast4speed")) {
            v144.push({
              url: v154,
              quality: "1080p",
              provider: "AllAnime " + v153 + " (" + v147 + ")",
              headers: {
                Referer: "https://allanime.day",
                "User-Agent": AGENT
              }
            });
            continue;
          }
          if (v154.includes("/clock.json") || v154.includes("/apivtwo/")) {
            const v155 = v154.startsWith("http") ? v154 : ALLANIME_BASE + v154;
            const v156 = yield fetchLinksFromProvider(v155);
            for (const v157 of v156) {
              const v158 = v157.url || "";
              if (!v158) {
                continue;
              }
              const v159 = v158.match(
                /repackager\.wixmp\.com\/([^,]+)\/((?:,[^,]+)+,?)\/mp4\/file\.mp4/);
              if (v159) {
                const v160 = v159[1];
                const v161 = v159[2].split(",").filter(v162 => v162.length > 0);
                for (const v163 of v161) {
                  v144.push({
                    url: "https://" + v160 + "/" + v163 + "/mp4/file.mp4",
                    quality: v163,
                    provider: "AllAnime " + v153 + " (" + v147 + ")",
                    headers: {
                      "User-Agent": AGENT
                    }
                  });
                }
              } else {
                v144.push({
                  url: v158,
                  quality: v157.quality || v157.resolutionStr || "Auto",
                  provider: "AllAnime " + v153 + " (" + v147 + ")",
                  headers: Object.assign({
                    Referer: "https://allanime.day"
                  }, v157.headers || {})
                });
              }
            }
            continue;
          }
          if (v152.type === "iframe") {
            console.log("[" + v147 + "] Skipping iframe: " + v153);
            continue;
          }
        }
      });
      yield Promise.all([v145(v142, "Sub", v125), v145(v143, "Dub", v126)]);
      return v144.map(v164 => {
        const v165 = v121;
        let v166 = "Unknown";
        if (v164.quality) {
          const v167 = v164.quality.match(/\d+p/i);
          if (v167) {
            v166 = v167[0];
          } else if (v164.quality.toLowerCase() === "best") {
            v166 = "1080p";
          }
        }
        return {
          name: v164.provider,
          title: v164.provider + " | " + v164.quality,
          url: v164.url,
          quality: v166,
          headers: v164.headers
        };
      });
    });
  }
  if (typeof globalThis !== "undefined") {
    globalThis.__nvAllAnimeGetStreams = getStreams;
  }

})();
/*
 * nv-plugins anikototv.js v1.1.0 (pack 4.30.0, 2026-09-13):
 * "anikoto catalog doesnt show streams" - TWO stacked causes fixed:
 *  (a) MegaPlay's getSources/getSourcesNew responses became AES-encrypted
 *      ("enc" field); this provider only read the retired plain sources.file
 *      so extractHLS returned null on every anime. extractHLS now decrypts
 *      enc (mirrored from miruro v2.8.0's reversal of MegaPlay's
 *      e1-player.min.js) and signs the master.m3u8 token (HMAC-SHA256) that
 *      MegaPlay's CDN requires; legacy plain responses still supported.
 *  (b) even with a working URL, the SUB row label "Japanese (SUB)" tripped
 *      the nvio post-filter language gate (blocks \bjapanese\b) and the row
 *      was dropped - relabeled "SUB (JP)" like miruro's gate-passing labels.
 * Live-verified (datacenter): Frieren S1E1 via mal/52991 and ani/154587,
 * Inept Villainess E1/E9 via the anikoto s-2 embed route -> 1080p masters.
 */
/*
 * nv-plugins anikototv.js — FULLY DECODED port of the All-in-One-Nuvio provider (4.24.0 merge pass).
 * Decoded from the obfuscated AIO build: string tables resolved, decoder machinery stripped,
 * every network call capped by an 8s deadline, node-core requires fail-soft, nvio post-filter
 * attached (en/tl audio gate, >=720p quality gate, cross-provider dedupe). Endpoints/keys/headers
 * identical to the AIO original.
 */
/* nv-plugins best-settings pass 4.24.0: hard 8s deadline on every network call */
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
/* fail-soft require: node-core modules (net/http/assert/...) never crash the provider */
var __nvRequire = (function() {
  var _rq = null;
  try {
    _rq = (typeof require === "function") ? require : null;
  } catch (e) {
    _rq = null;
  }
  return function(name) {
    if (_rq) {
      try {
        return _rq(name);
      } catch (e) {}
    }
    return {};
  };
})();
/* QuickJS-safe global aliases: embedded polyfills (forge/uuid/whatwg) reference
   window/self/document unguarded - in Nuvio's QuickJS those would throw
   ReferenceError at module load and kill the provider. */
var window = (typeof window !== "undefined" && window) ? window :
  (typeof globalThis !== "undefined" ? globalThis : (typeof global !== "undefined" ? global : {}));
var self = (typeof self !== "undefined" && self) ? self : window;
var document = (typeof document !== "undefined" && document) ? document : {
  createElement: function() {
    return {
      style: {},
      setAttribute: function() {},
      getElementsByTagName: function() {
        return [];
      }
    };
  },
  getElementsByTagName: function() {
    return [];
  },
  addEventListener: function() {}
};
var navigator = (typeof navigator !== "undefined" && navigator) ? navigator : {
  userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36"
};
var v168 = function() {
  return "";
};
'use strict';
var __async = (v170, v171, v172) => {
    return new Promise((v173, v174) => {
      var v178 = v179 => {
          try {
            v181(v172.next(v179));
          } catch (v182) {
            v174(v182);
          }
        },
        v183 = v184 => {
          try {
            v181(v172.throw(v184));
          } catch (v186) {
            v174(v186);
          }
        },
        v181 = v187 => v187.done ? v173(v187.value) : Promise.resolve(v187.value).then(v178, v183);
      v181((v172 = v172.apply(v170, v171)).next());
    });
  },
  PROVIDER_NAME = "AnikotoTV",
  TMDB_API_KEY = "439c478a771f35c05022f9feabcca01c",
  TVDB_API_KEY = "777140fb-de92-440a-aec2-95eb51e2d7ab",
  MOBILE_UAS = [
    "Mozilla/5.0 (Linux; Android 14; Pixel 8 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36",
    "Mozilla/5.0 (Linux; Android 13; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36",
    "Mozilla/5.0 (Linux; Android 12; Pixel 6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Mobile Safari/537.36",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"
  ];

function getHeaders(v188) {
  var v190 = MOBILE_UAS[Math.floor(Math.random() * MOBILE_UAS.length)],
    v191 = {
      "User-Agent": v190,
      "Accept-Language": "en-US,en;q=0.9"
    };
  if (v188)
    for (var v192 in v188) {
      v191[v192] = v188[v192];
    }
  return v191;
}
var _tvdbToken = null;

function getTvdbToken() {
  return __async(this, null, function*() {
    if (_tvdbToken) return _tvdbToken;
    try {
      var v198 = yield __nvFetch("https://api4.thetvdb.com/v4/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          apikey: TVDB_API_KEY
        })
      });
      if (v198.ok) {
        var v199 = yield v198.json();
        if (v199 && v199.data && v199.data.token) _tvdbToken = v199.data.token;
      }
    } catch (v200) {}
    return _tvdbToken;
  });
}

function getTMDBDetails(v201, v202, v203, v204) {
  const v205 = {
    v206: 391,
    v207: 359,
    v208: 376,
    v209: 314,
    v210: 399,
    v211: 398,
    v212: 340,
    v213: 328,
    v214: 399,
    v215: 326,
    v216: 411,
    v217: 405
  };
  return __async(this, null, function*() {
    var v219, v220;
    const v221 = v202 === "tv" || v202 === "series" ? "tv" : "movie";
    let v222 = "https://api.themoviedb.org/3/" + v221 + "/" + v201 + "?api_key=" + TMDB_API_KEY +
      "&append_to_response=external_ids";
    String(v201).startsWith("tt") && (v222 = "https://api.themoviedb.org/3/find/" + v201 +
      "?external_source=imdb_id&api_key=" + TMDB_API_KEY);
    try {
      const v223 = yield __nvFetch(v222, {
        headers: getHeaders()
      });
      if (!v223.ok) return {
        title: "Anime Title",
        year: "2026",
        epTitle: "Episode " + v204,
        duration: "24 min"
      };
      const v224 = yield v223.json();
      let v225 = v224;
      String(v201).startsWith("tt") && (v225 = v221 === "tv" ? (v219 = v224.tv_results) == null ? void 0 :
        v219[0] : (v220 = v224.movie_results) == null ? void 0 : v220[0]);
      if (!v225) return {
        title: "Anime Title",
        year: "2026",
        epTitle: "Episode " + v204,
        duration: "24 min"
      };
      const v226 = v221 === "tv" ? v225.name : v225.title,
        v227 = v225.release_date || v225.first_air_date || "",
        v228 = v227 ? v227.split("-")[0] : "2026";
      let v229 = "Episode " + v204,
        v230 = "24 min";
      if (v221 === "tv" && v225.id && v203 && v204) try {
        const v231 = "https://api.themoviedb.org/3/tv/" + v225.id + "/season/" + v203 + "/episode/" +
          v204 + "?api_key=" + TMDB_API_KEY,
          v232 = yield __nvFetch(v231, {
            headers: getHeaders()
          });
        if (v232.ok) {
          const v233 = yield v232.json();
          if (v233.name) v229 = v233.name;
          if (v233.runtime) v230 = v233.runtime + " min";
        }
      } catch (v234) {} else v221 === "movie" && v225.runtime && (v230 = v225.runtime + " min");
      return {
        title: v226,
        year: v228,
        epTitle: v229,
        duration: v230
      };
    } catch (v235) {
      return {
        title: "Anime Title",
        year: "2026",
        epTitle: "Episode " + v204,
        duration: "24 min"
      };
    }
  });
}

function getTMDBTitle(v236, v237) {
  return __async(this, null, function*() {
    const v238 = yield getTMDBDetails(v236, v237);
    return {
      title: v238.title,
      numericId: v236
    };
  });
}

function getTMDBSeasonName(v239, v240) {
  return __async(this, null, function*() {
    const v245 = "https://api.themoviedb.org/3/tv/" + v239 + "/season/" + v240 + "?api_key=" +
      TMDB_API_KEY;
    try {
      const v246 = yield __nvFetch(v245);
      if (v246.ok) {
        const v247 = yield v246.json();
        return v247.name;
      }
    } catch (v248) {}
    return null;
  });
}

function aniListBridge(v249) {
  return __async(this, null, function*() {
    const v253 = " query ($search: String) { Media (search: $search, type: ANIME) { id idMal } } ";
    try {
      const v254 = yield __nvFetch("https://graphql.anilist.co", {
        method: "POST",
        headers: Object.assign(getHeaders(), {
          "Content-Type": "application/json",
          Accept: "application/json"
        }),
        body: JSON.stringify({
          query: v253,
          variables: {
            search: v249
          }
        })
      }), v255 = yield v254.json();
      if (v255 && v255.data && v255.data.Media) return {
        malId: v255.data.Media.idMal,
        aniId: v255.data.Media.id,
        absEp: null
      };
    } catch (v256) {}
    return null;
  });
}

function getMalId(v257, v258, v259, v260) {
  return __async(this, null, function*() {
    try {
      let v266 = "https://arm.haglund.dev/api/v2/tmdb?id=" + v257;
      if (v258 === "tv" || v258 === "series") v266 += "&s=" + v259 + "&e=" + v260;
      const v267 = yield __nvFetch(v266);
      if (v267.ok) {
        const v268 = yield v267.json();
        if (v268.mal || v268.mal_id || v268.anilist || v268.ani_id) return {
          malId: v268.mal || v268.mal_id,
          aniId: v268.anilist || v268.ani_id,
          absEp: v268.episode || v260
        };
      }
    } catch (v269) {}
    const v270 = yield getTMDBTitle(v257, v258);
    let v271 = v270.title;
    const v272 = v270.numericId;
    if (v271) {
      let v273 = v271;
      if ((v258 === "tv" || v258 === "series") && v259 > 1 && v272) {
        const v274 = yield getTMDBSeasonName(v272, v259);
        v274 ? v274.toLowerCase().includes(v271.toLowerCase()) ? v271 = v274 : v271 = v271 + " " + v274 :
          v271 = v271 + " Season " + v259;
      }
      let v275 = yield aniListBridge(v271), v276 = false;
      (!v275 || v275 && !v275.malId) && v271 !== v273 && (v275 = yield aniListBridge(v273), v276 = true);
      if (v275) return (v275.absEp = v260, v275.usedFallback = v276, v275.name = v270.title, v275);
    }
    return null;
  });
}
/* ===== nv-plugins 4.30.0 / v1.1.0 patch (v1.2.0 variant emission 4.32.0): MegaPlay enc decrypt + signed master ====
   MegaPlay's getSources AND getSourcesNew now ship the stream URL AES-encrypted
   in the "enc" field (the plain sources.file body is gone upstream - the same
   change that silenced miruro 2.7.0 and this provider). Algorithm reversed from
   MegaPlay's own e1-player.min.js during the 4.29.0 cycle and verified against
   live episodes (Frieren E1/E28, Inept Villainess E1/E9):
     enc (base64url) -> AES-256-CBC, key = hex 693f4c4d5441783051362c3a7d353055
     followed by 16 zero bytes, IV = ASCII "W0;27ToaUpl_P%'c", PKCS7
     -> {"file":"https://<cdn>/anime/<md5a>/<md5b>/master.m3u8"}
   The master answers 403 WITHOUT a signed token:
     token = b64url("<unixtime>|<type>/<md5a>/<md5b>") + "." +
             b64url(HMAC-SHA256(key "MpCdnT0k3n!9f2K#xQ7vL5mR8wN1pY4s", msg))
   Variant playlists need no token. crypto-js access mirrors castle.js
   (bare require works on the device runtime; global __nvRequire tried first). */
function mpCJS() {
  try {
    if (typeof __nvRequire === "function") {
      var c = __nvRequire("crypto-js");
      if (c && c.AES && c.HmacSHA256) return c;
    }
  } catch (e) {}
  try {
    if (typeof require === "function") {
      var c2 = require("crypto-js");
      if (c2 && c2.AES && c2.HmacSHA256) return c2;
    }
  } catch (e) {}
  return null;
}
var _MP_AES = null,
  _MP_HMAC = null,
  _MP_IV = null;

function mpKeys() {
  var C = mpCJS();
  if (!C) return false;
  if (!_MP_AES) {
    try {
      _MP_AES = C.enc.Hex.parse("693f4c4d5441783051362c3a7d35305500000000000000000000000000000000");
      _MP_IV = C.enc.Utf8.parse("W0;27ToaUpl_P%'c");
      _MP_HMAC = C.enc.Utf8.parse("MpCdnT0k3n!9f2K#xQ7vL5mR8wN1pY4s");
    } catch (e) {
      return false;
    }
  }
  return true;
}

function mpDecryptFile(enc) {
  try {
    var C = mpCJS();
    if (!C || !mpKeys()) return null;
    var ct = C.enc.Base64.parse(String(enc).replace(/-/g, "+").replace(/_/g, "/"));
    var params = C.lib.CipherParams.create({
      ciphertext: ct
    });
    var pt = C.AES.decrypt(params, _MP_AES, {
      iv: _MP_IV,
      mode: C.mode.CBC,
      padding: C.pad.Pkcs7
    });
    var txt = pt.toString(C.enc.Utf8);
    if (!txt) return null;
    var j = JSON.parse(txt);
    return j && j.file ? String(j.file) : null;
  } catch (e) {
    return null;
  }
}

function mpTokenForPath(path) {
  var C = mpCJS();
  if (!C || !mpKeys()) return "";
  try {
    var msg = Math.floor(Date.now() / 1000) + "|" + path;
    var b64url = function(wa) {
      return wa.toString(C.enc.Base64).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    };
    return b64url(C.enc.Utf8.parse(msg)) + "." + b64url(C.HmacSHA256(msg, _MP_HMAC));
  } catch (e) {
    return "";
  }
}

function mpBuildMaster(fileUrl) {
  var f = String(fileUrl || "");
  if (/\/$/.test(f)) f += "master.m3u8";
  var m = f.match(/^https?:\/\/[^\/]+\/(?:anime|movie|series|tv)\/(.+?)(?:\/master\.m3u8)?$/);
  var path = m ? m[1] : "";
  if (!path || !mpKeys()) return {
    plain: f,
    tokenized: f
  };
  var tok = mpTokenForPath(path);
  return {
    plain: f,
    tokenized: tok ? f + "?token=" + tok : f
  };
}
/* ==== end 4.30.0 patch helpers ==== */
function extractHLS(v277, v278) {
  return __async(this, null, function*() {
    try {
      const v286 = Object.assign(getHeaders(), {
          Referer: "https://" + v278 + "/"
        }),
        v287 = yield __nvFetch(v277, {
          headers: v286
        });
      if (!v287.ok) return null;
      const v288 = yield v287.text();
      let v289 = v288.match(/data-id="(\d+)"/);
      if (!v289) {
        const v290 = v288.match(/<iframe[^>]*src="([^"]+)"/);
        if (v290) {
          const v291 = v290[1].startsWith("http") ? v290[1] : "https://" + v278 + v290[1],
            v292 = yield __nvFetch(v291, {
              headers: v286
            });
          if (v292.ok) {
            const v293 = yield v292.text();
            v289 = v293.match(/data-id="(\d+)"/);
          }
        }
      }
      if (!v289) return null;
      const v294 = v289[1],
        v295 = "https://" + v278 + "/stream/getSources?id=" + v294,
        v296 = yield __nvFetch(v295, {
          headers: Object.assign(getHeaders(), {
            "X-Requested-With": "XMLHttpRequest",
            Referer: v277
          })
        });
      if (!v296.ok) return null;
      const v297 = yield v296.json();
      var _mpFile = v297.enc ? mpDecryptFile(v297.enc) : null;
      if (!_mpFile && v297.sources && v297.sources.file) _mpFile = String(v297.sources.file);
      if (_mpFile) {
        var _mpTok = mpBuildMaster(_mpFile);
        _mpFile = _mpTok.tokenized || _mpFile;
        const v298 = [];
        if (v297.tracks)
          for (const v299 of v297.tracks) {
            (v299.kind === "captions" || v299.kind === "subtitles") && v298.push({
              id: v299.label || v299.file || "Unknown",
              url: v299.file,
              language: "eng"
            });
          }
        var _mpVariant = null;
        var v300 = "1080p";
        try {
          const v301 = yield __nvFetch(_mpFile, {
            headers: {
              Referer: "https://" + v278 + "/"
            }
          });
          if (v301.ok) {
            const v302 = yield v301.text();
            if (v302.indexOf("#EXTM3U") !== -1) {
              var _mpBestH = 0,
                _mpRe = /#EXT-X-STREAM-INF([^\n]*)\n([^\n#][^\n]*)/g,
                _mpM;
              while ((_mpM = _mpRe.exec(v302)) !== null) {
                var _mpRes = _mpM[1].match(/RESOLUTION=\d+x(\d+)/i);
                var _mpUrl = _mpM[2].trim();
                if (!_mpUrl) continue;
                if (!(/^https?:\/\//i).test(_mpUrl)) _mpUrl = _mpFile.replace(/[^\/]*$/, "") + _mpUrl;
                var _mpH = _mpRes ? parseInt(_mpRes[1], 10) : 0;
                if (_mpH >= _mpBestH) {
                  _mpBestH = _mpH;
                  _mpVariant = _mpUrl;
                }
              }
              if (_mpVariant) v300 = _mpBestH > 0 ? _mpBestH + "p" : "1080p";
            } else {
              var v303 = v302.match(/RESOLUTION=\d+x(\d+)/);
              if (v303) v300 = v303[1] + "p";
            }
          }
        } catch (v304) {}
        var _mpRows = [{
          url: _mpVariant || _mpFile,
          quality: v300,
          subtitles: v298,
          headers: {
            Referer: "https://" + v278 + "/",
            Origin: "https://" + v278
          }
        }];
        try {
          var _mpU0 = String(_mpVariant || _mpFile);
          var _mpP0 = _mpU0.replace(/^https?:\/\/[^\/]+/, "");
          if (_mpP0 && _mpP0.indexOf("/") === 0) _mpRows.push({
            url: "https://ncdn.imgnex.top" + _mpP0,
            quality: v300,
            subtitles: v298,
            headers: {
              Referer: "https://" + v278 + "/",
              Origin: "https://" + v278
            }
          });
        } catch (_mpE0) {}
        return {
          rows: _mpRows,
          url: _mpRows[0].url,
          quality: v300,
          subtitles: v298,
          headers: _mpRows[0].headers
        };
      }
    } catch (v305) {}
    return null;
  });
}

function fetchJson(v306) {
  return __async(this, arguments, function*(v307, v308 = {}) {
    const v309 = yield __nvFetch(v307, v308);
    if (!v309.ok) return null;
    return yield v309.json();
  });
}

function getAbsoluteEpisode(v310, v311, v312, v313, v314) {
  return __async(this, null, function*() {
    if (v311 === "movie") return 1;
    let v323 = v313,
      v324 = null,
      v325 = null;
    try {
      const v326 = yield fetchJson("https://api.themoviedb.org/3/tv/" + v310 + "/external_ids?api_key=" +
        TMDB_API_KEY);
      v326 && (v324 = v326.imdb_id, v325 = v326.tvdb_id);
    } catch (v327) {}
    if (!v325 && v314) try {
      const v328 = yield getTvdbToken();
      if (v328) {
        const v329 = yield fetchJson("https://api4.thetvdb.com/v4/search?query=" + encodeURIComponent(
          v314), {
          headers: {
            Authorization: "Bearer " + v328
          }
        });
        if (v329 && v329.data) {
          const v330 = v329.data.find(v331 => v331.type === "series");
          if (v330) {
            const v332 = v330.id || v330.tvdb_id;
            if (v332) v325 = parseInt(String(v332).replace(/^series-/, ""), 10);
          }
        }
      }
    } catch (v333) {}
    if (v325) try {
      const v334 = yield getTvdbToken();
      if (v334) {
        const v335 = yield fetchJson("https://api4.thetvdb.com/v4/series/" + v325 +
          "/episodes/default?season=" + v312, {
            headers: {
              Authorization: "Bearer " + v334
            }
          });
        if (v335 && v335.data && v335.data.episodes) {
          const v336 = v335.data.episodes.find(v337 => v337.seasonNumber == v312 && v337.number ==
          v313);
          if (v336 && v336.absoluteNumber) return v336.absoluteNumber;
        }
      }
    } catch (v338) {}
    if (v324) try {
      const v339 =
        "https://aiometadata.elfhosted.com/stremio/80d082c4-6e99-4c97-a67d-3d9e242685ce/meta/series/" +
        v324 + ".json",
        v340 = yield __nvFetch(v339);
      if (v340.ok) {
        const v341 = yield v340.text();
        let v342 = 0,
          v343 = false;
        const v344 = /"season"\s*:\s*(\d+)/g;
        let v345;
        while ((v345 = v344.exec(v341)) !== null) {
          v343 = true;
          const v346 = parseInt(v345[1]);
          if (v346 > 0 && v346 < v312) v342++;
        }
        if (v343) return v342 + v313;
      }
    } catch (v347) {}
    try {
      const v348 = "https://api.themoviedb.org/3/tv/" + v310 + "?api_key=" + TMDB_API_KEY,
        v349 = yield fetchJson(v348, {});
      if (v349 && v349.seasons) {
        let v350 = 0;
        const v351 = v349.seasons.filter(v352 => v352.season_number > 0 && v352.season_number < v312);
        for (let v353 of v351) {
          v350 += v353.episode_count;
        }
        return (v350 += v313, v350);
      }
    } catch (v354) {}
    return v323;
  });
}

function getStreams(v355, v356, v357, v358) {
  const v359 = {
    v360: 338,
    v361: 387,
    v362: 335,
    v363: 325,
    v364: 334,
    v365: 413,
    v366: 369,
    v367: 364,
    v368: 332,
    v369: 357,
    v370: 378,
    v371: 367,
    v372: 364
  };
  return __async(this, null, function*() {
    try {
      const v374 = yield getMalId(v355, v356, v357, v358);
      if (!v374 || !v374.malId && !v374.aniId) return [];
      const v375 = !!v374.malId,
        v376 = v375 ? v374.malId : v374.aniId,
        v377 = v375 ? "mal" : "ani";
      let v378 = v356 === "movie" ? 1 : v374.absEp;
      v356 !== "movie" && v374.usedFallback && v357 > 1 && (v378 = yield getAbsoluteEpisode(v355, v356,
        v357, v358, v374.name));
      const v379 = yield getTMDBDetails(v355, v356, v357, v358), v380 = [], v381 = [{
        id: "Vidstream",
        domain: "megaplay.buzz"
      }];
      for (const v382 of v381) {
        const v383 = ["sub", "dub"];
        for (const v384 of v383) {
          const v385 = "https://" + v382.domain + "/stream/" + v377 + "/" + v376 + "/" + v378 + "/" +
            v384,
            v386 = yield extractHLS(v385, v382.domain);
          if (v386) {
            const v387 = (v386.quality || "1080p").toLowerCase(),
              v388 = v384 === "sub" ? "🇯🇵 JP" : "🇺🇲 English",
              v389 = v384 === "sub" ? "SUB" : "DUB",
              v390 = v384 === "sub" ? "SUB (JP)" : "English (DUB)",
              v391 = v386.url.includes(".m3u8") ? "HLS" : "M3U8",
              v392 = PROVIDER_NAME + " | " + v387 + " | " + v390,
              v393 = "🎦 " + v379.title + " - (" + v379.year + ")",
              v394 = v356 === "movie" ? "🎬 Movie Presentation" : "🎬 S" + (v357 || 1) + "E" + (v358 ||
              1) + " - " + v379.epTitle,
              v395 = "✨ " + v387 + " | " + v388 + " • 🗣️ " + v389,
              v396 = "🔗 " + v382.id + " | ⏳ " + v379.duration + " | ⚡ " + v391,
              v397 = v393 + "\n" + v394 + "\n" + v395 + "\n" + v396;
            var _mpLane = v386 && v386.rows ? v386.rows : [v386];
            for (const _mpR of _mpLane) {
              if (!_mpR || !_mpR.url) continue;
              v380.push({
                name: _mpR === _mpLane[0] ? v392 : v392 + " | ALT",
                title: v397,
                size: v397,
                description: v397,
                url: _mpR.url,
                subtitles: _mpR.subtitles || v386.subtitles,
                headers: _mpR.headers || v386.headers
              });
            }
          }
        }
      }
      return v380;
    } catch (v398) {
      return [];
    }
  });
}

function search(v399) {
  return __async(this, null, function*() {
    return [];
  });
}
/*decoder removed*/
function getCatalog(v400) {
  return __async(this, null, function*() {
    return [];
  });
}

function getItemDetails(v401) {
  return __async(this, null, function*() {
    return [];
  });
}
typeof module !== 'undefined' && module['exports'] ? module['exports'] = {
  'getStreams': getStreams,
  'search': search,
  'getCatalog': getCatalog,
  'getItemDetails': getItemDetails
} : global['getStreams'] = getStreams;
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
(function() {
  var PROVIDER = "anikototv";
  var G = typeof globalThis !== "undefined" ? globalThis : typeof global !== "undefined" ? global : this;

  function settings() {
    try {
      return (G && G.SCRAPER_SETTINGS) || {};
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
    if (!s) return "";
    if (/8k/.test(s)) return "4K";
    if (/2160|4k|uhd/.test(s)) return "4K";
    if (/1440/.test(s)) return "1440p";
    if (/1080|fhd/.test(s)) return "1080p";
    if (/720/.test(s)) return "720p";
    if (/480|360|240|\bsd\b/.test(s)) return "CAM";
    if (/cam|telesync|telecine|\bts\b|\btc\b|screener|dvdscr/.test(s)) return "CAM";
    return "";
  }

  function qFromText(text) {
    var s = String(text || "");
    var m = s.match(/(\d{3,4})\s*p/i);
    if (m) {
      var n = parseInt(m[1], 10);
      if (n >= 2100) return "4K";
      if (n >= 1300) return "1440p";
      if (n >= 1000) return "1080p";
      if (n >= 640) return "720p";
      return "CAM";
    }
    if (/\b8k\b/i.test(s) || /2160|4k|uhd/i.test(s)) return "4K";
    if (/1440p/i.test(s)) return "1440p";
    if (/cam|telesync|telecine|\bts\b|\btc\b|screener|dvdscr/i.test(s)) return "CAM";
    if (/480p|360p|240p|\bsd\b|\bdvdrip\b/i.test(s)) return "CAM";
    if (/\bhd\b/i.test(s)) return "720p";
    return "";
  }
  var qualCache = G.__NV_QUAL_CACHE__ || (G.__NV_QUAL_CACHE__ = {});

  function probeM3u8(url, headers) {
    var now = Date.now();
    var c = qualCache[url];
    if (c && now - c.t < (c.q ? 15 * 60 * 1000 : 3 * 60 * 1000)) {
      return Promise.resolve(c.q);
    }
    var opts = {
      headers: Object.assign({}, headers || {})
    };
    var p = __nvFetch(url, opts).then(function(r) {
      return r.ok ? r.text() : "";
    }).then(function(t) {
      var q = "";
      if (t && t.indexOf("#EXTM3U") !== -1) {
        var best = 0,
          re = /RESOLUTION=(\d+)x(\d+)/gi,
          m;
        while ((m = re.exec(t)) !== null) {
          var h = parseInt(m[2], 10);
          if (h > best) best = h;
        }
        if (best >= 2100) q = "4K";
        else if (best >= 1300) q = "1440p";
        else if (best >= 1000) q = "1080p";
        else if (best >= 640) q = "720p";
        else if (best > 0) q = "CAM";
      }
      qualCache[url] = {
        t: now,
        q: q
      };
      return q;
    }).catch(function() {
      qualCache[url] = {
        t: now,
        q: ""
      };
      return "";
    });
    if (hasTimers()) {
      p = Promise.race([p, new Promise(function(res) {
        var timer = setTimeout(function() {
          res("");
        }, 6000);
        if (typeof timer === "object" && typeof timer.unref === "function") timer.unref();
      })]);
    }
    return p;
  }

  /* ---------- language gate ---------- */
  var BLOCK_RE = new RegExp(
    "\\b(hindi|hin|tamil|telugu|malayalam|mallu|kannada|bengali|bangla|punjabi|marathi|bhojpuri|gujarati|" +
    "odia|assamese|nepali|urdu|sinhala|arabic|ara|farsi|persian|turkish|turkce|espanol|spanish|latino|" +
    "castellano|french|vostfr|german|deutsch|russian|korean|kor|japanese|jpn|chinese|mandarin|cantonese|" +
    "thai|vietnamese|indonesian|bahasa|portuguese|brasileiro|italian|polish|ukrainian|hebrew|" +
    "hungarian|romanian|dutch|flemish|greek|czech|swedish|danish|norwegian|finnish|org)\\b", "i");
  var ALLOW_RE = /\b(english|eng|tagalog|filipino)\b/i;
  var SUB_RE = /\b[a-z0-9]{0,12}subs?\b/gi;
  // NOTE: gate runs on the stream TITLE only (release names / labels).
  // Provider names (e.g. "MallumV") must not trigger the language gate.
  function langAllowed(titleText) {
    var t = String(titleText || "").replace(SUB_RE, " ");
    if (BLOCK_RE.test(t)) return ALLOW_RE.test(t);
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
  var SEEN = G.__NV_SEEN_URLS__ || (G.__NV_SEEN_URLS__ = {});
  // SEEN[nu] = { exp: <ts>, owner: <provider> }
  // - same URL from a DIFFERENT provider within TTL -> dropped (cross-provider dup)
  // - same provider re-querying its own URL -> allowed (repeat opens must still
  //   return rows) and its claim is refreshed
  function claim(nu, now, owner) {
    if (!nu) return true;
    var e = SEEN[nu];
    if (e && e.exp > now && e.owner !== owner) return false;
    SEEN[nu] = {
      exp: now + 120000,
      owner: owner
    };
    return true;
  }

  /* ---------- main ---------- */
  function rank(q) {
    if (q === "4K") return 4;
    if (q === "1440p") return 3.5;
    if (q === "1080p") return 3;
    if (q === "720p") return 2;
    return 0;
  }

  function postProcess(list) {
    var now = Date.now();
    var kept = [];
    var probes = [];
    var rows = [];
    (list || []).forEach(function(s, i) {
      if (!s || !s.url) return;
      if (!langAllowed(s.title)) return;
      var text = (s.name || "") + " " + (s.title || "");
      var isMagnet = /^magnet:/i.test(String(s.url));
      var q = normQ(s.quality) || normQ(String(s.title || "").split("\n")[0]) || qFromText(text);
      var isHlsLike = /m3u8/i.test(String(s.url)) ||
        (!/\.(mp4|mkv|avi|mov|webm|ts|flv|m4v|mp3|aac)(\?|$)/i.test(String(s.url.split("?")[0])) &&
          /^https?:/i.test(String(s.url)));
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
    return Promise.all(probes).then(function(qs) {
      var ranked = [];
      rows.forEach(function(row, k) {
        var q = qs[k];
        if (!q) return; // unknown resolution -> removed
        if (q === "CAM") return; // cam / sd / sub-720 -> removed
        row.s.quality = q;
        ranked.push({
          s: row.s,
          i: row.i,
          q: q
        });
      });
      // best first so dedupe keeps the strongest duplicate (stable)
      ranked.sort(function(a, b) {
        var r = rank(b.q) - rank(a.q);
        if (r !== 0) return r;
        return a.i - b.i;
      });
      var seenLocal = {},
        out = [];
      ranked.forEach(function(row) {
        var s = row.s;
        var nu = normUrl(s.url);
        if (seenLocal[nu]) return;
        if (!claim(nu, now, PROVIDER)) return; // already reported by a different provider
        seenLocal[nu] = 1;
        out.push(s);
      });
      return out.slice(0, 40);
    }).catch(function() {
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
    module.exports.getStreams = function() {
      var args = Array.prototype.slice.call(arguments),
        self = this;

      function finish(v) {
        if (settings().postFilter === false) return v;
        try {
          return postProcess(Array.isArray(v) ? v : []);
        } catch (e) {
          return Array.isArray(v) ? v : [];
        }
      }
      try {
        var r = __orig.apply(self, args);
        if (r && typeof r.then === "function") {
          if (typeof setTimeout === "function") {
            // nv best-settings 4.23.0: hard 8s cap on the whole provider run
            r = Promise.race([r, new Promise(function(res) {
              var dl = setTimeout(function() {
                res([]);
              }, 8000);
              if (dl && typeof dl.unref === "function") dl.unref();
            })]);
          }
          return r.then(function(v) {
            return finish(v);
          }, function() {
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
/* ===== nv 4.33.0 verified-lane merge (auto-injected) ==================
   Adds an independent, live-verified extraction lane beside the native one.
   Policy: AllAnime rows first, native MegaPlay rows after
   - Junk VidAPI relay rows (tungtungtungsahur.cfd YT-rip lane) are dropped.
   - Never rejects; every lane is capped; QuickJS-safe (no AbortController). */
(function() {
  'use strict';
  var __LABEL = 'AnikotoTV';
  var __ALT_FIRST = true;
  var __DROP_JUNK = true;
  var __ALT_NAME = '__nvAllAnimeGetStreams';
  var __ALT_CAP = 18000;
  var __NATIVE_CAP = 20000;

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
  module.exports.getStreams = function() {
    var args = Array.prototype.slice.call(arguments),
      self = this;

    function cap(p, ms) {
      if (typeof setTimeout !== "function") {
        /* device realm: no timers -> no cap; fail-soft passthrough keeps the
           waterfall fetch-count bounded (same semantics as 4.37.0 wrapper) */
        return Promise.resolve(p).then(function(v) {
          return Array.isArray(v) ? v : [];
        }, function() {
          return [];
        });
      }
      return new Promise(function(res) {
        var done = false;
        var t = setTimeout(function() {
          if (!done) {
            done = true;
            res([]);
          }
        }, ms);
        if (t && typeof t.unref === 'function') t.unref();
        Promise.resolve(p).then(function(v) {
          if (!done) {
            done = true;
            if (t) clearTimeout(t);
            res(Array.isArray(v) ? v : []);
          }
        }, function() {
          if (!done) {
            done = true;
            if (t) clearTimeout(t);
            res([]);
          }
        });
      });
    }

    function runNative() {
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

    function runAlt() {
      var f = null;
      try {
        f = (typeof globalThis !== 'undefined' && globalThis) ? globalThis[__ALT_NAME] : null;
      } catch (e) {
        f = null;
      }
      if (typeof f !== 'function') return Promise.resolve([]);
      try {
        var r = (__ALT_NAME === '__nvWingsStreams') ?
          f({
            tmdbId: args[0],
            mediaType: args[1],
            season: args[2],
            episode: args[3],
            label: __LABEL
          }) :
          f(args[0], args[1], args[2], args[3]);
        return Promise.resolve(r).then(function(v) {
          return Array.isArray(v) ? v : [];
        }, function() {
          return [];
        });
      } catch (e) {
        return Promise.resolve([]);
      }
    }
    var natP = cap(runNative(), __NATIVE_CAP);
    var altP = cap(runAlt(), __ALT_CAP);
    return Promise.all([natP, altP]).then(function(rs) {
      var nat = rs[0] || [],
        alt = rs[1] || [];
      if (__DROP_JUNK) nat = nat.filter(function(r) {
        return r && r.url && !__junk(r.url);
      });
      alt = alt.filter(function(r) {
        return r && r.url && !__junk(r.url);
      });
      var seen = {},
        out = [];
      var order = __ALT_FIRST ? [alt, nat] : [nat, alt];
      for (var i = 0; i < order.length; i++) {
        for (var k = 0; k < order[i].length; k++) {
          var r = order[i][k];
          if (!r || !r.url || seen[r.url]) continue;
          seen[r.url] = 1;
          out.push(r);
        }
      }
      return out;
    });
  };
})();
