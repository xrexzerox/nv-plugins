/* nv-plugins anikototv.js v8.0.0 (pack 4.40.0 "all providers readable, no device killer")
 * Clean readable port of Eclipsia (codeberg eclipsia/nuvio-plugin) "Zyrvael." = Anikoto,
 * replacing the 4.39 AllAnime/MegaPlay stack (machine-v-name port). Flow: TMDB meta
 * (alt titles + season offset) -> anikoto.cz search (/filter HTML, /ajax/anime/search
 * fallback) -> title scoring -> seasons -> episode list -> server list -> player url
 * -> /stream/getSourcesNew (enc -> AES-256-CBC decrypt via pure-JS __nvAnikotoCrypto,
 * the pack-proven castle subset) -> hls master + subtitle tracks.
 * Endpoint notes: BASE_URL https://anikoto.cz (Eclipsia == current; the 4.39
 *   allanime.day lane is REPLACED by this per task - the MegaPlay host rewrite
 *   fetch.nexabloom.top -> ncdn.imgnex.top is kept, it exists in both sources).
 *   TMDB key 439c478a771f35c05022f9feabcca01c (pack key; zyrvael shipped its own).
 * Device notes: preamble polyfills, 8s __nvFetch deadline, no URL/URLSearchParams
 *   ctor (string-ops origin/param), no require, no raw timers, sequential server
 *   probes (max 6, early exit at 3 streams), ajax-path anime id resolved from the
 *   watch page. nvio post-filter (>=720p, en/tl gate - Japanese-audio rows are
 *   gated, English dub rows survive) + waterfall merge appended below.
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
/* ===== nv-plugins anikoto pure crypto v1.0.0 (pack 4.40.0) ==================
   The device realm has no `require` (and no crypto-js module), so zyrvael's
   AES-256-CBC source decrypt would die on device. Self-contained
   CryptoJS-compatible subset reused VERBATIM from the pack-proven 4.37.0
   castle build: WordArray, enc.Base64/enc.Utf8, AES-CBC decrypt with Pkcs7
   unpadding - pure JS. Exposed as __nvAnikotoCrypto. ======================== */
var __nvAnikotoCrypto = (function() {
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

"use strict";

/* ---------- Anikoto (zyrvael) constants ---------- */
var PROVIDER_NAME = "Anikoto";
var TMDB_API_URL = "https://api.themoviedb.org/3";
var TMDB_API_KEY = "439c478a771f35c05022f9feabcca01c"; /* pack key (4.39); Eclipsia zyrvael shipped its own */
var BASE_URL = "https://anikoto.cz";

var HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36",
  "Referer": BASE_URL + "/",
};

function ajaxHeaders() {
  return Object.assign({}, HEADERS, { "X-Requested-With": "XMLHttpRequest" });
}

/* Device budget: sequential server probes with early exit (the device fetch
 * bridge runs one blocking call at a time, so fan-outs only add latency). */
var MAX_SEARCH_QUERIES = 8;
var MAX_SERVER_PROBES = 6;
var MAX_STREAMS = 3;

/* ---------- text helpers ---------- */
function decodeHtmlEntities(str) {
  if (!str) return "";
  return String(str)
    .replace(/&#039;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function normalizeTitle(str) {
  if (!str) return "";
  return decodeHtmlEntities(str)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function diceCoefficient(a, b) {
  var na = normalizeTitle(a);
  var nb = normalizeTitle(b);
  if (!na || !nb) return 0;
  if (na === nb) return 1;
  var wordsA = na.split(" ").filter(Boolean);
  var wordsB = nb.split(" ").filter(Boolean);
  if (!wordsA.length || !wordsB.length) return 0;
  var setA = {}, setB = {};
  for (var i = 0; i < wordsA.length; i++) setA[wordsA[i]] = 1;
  for (var j = 0; j < wordsB.length; j++) setB[wordsB[j]] = 1;
  var intersection = 0;
  for (var w in setA) if (setB[w]) intersection++;
  return (2 * intersection) / (wordsA.length + wordsB.length);
}

function parseSeasonNumber(title) {
  if (!title) return null;
  var match = String(title).match(/\b(?:season\s*(\d+)|(\d+)(?:nd|rd|th|st)\s*season|part\s*(\d+))\b/i);
  if (!match) return null;
  var num = match[1] || match[2] || match[3];
  return num ? parseInt(num, 10) : null;
}

function dedupeStreamsByUrl(streams) {
  var seen = {};
  return streams.filter(function (s) { return s && s.url && !seen[s.url] && (seen[s.url] = 1); });
}

/* ---------- URL helpers (string ops: the device realm has no URL ctor) ---------- */
function urlOrigin(u) {
  var m = /^(https?:\/\/[^\/?#]+)/i.exec(String(u || ""));
  return m ? m[1] : "";
}

function urlParam(u, key) {
  var s = String(u || "");
  var q = s.indexOf("?");
  if (q < 0) return null;
  var parts = s.slice(q + 1).split("#")[0].split("&");
  for (var i = 0; i < parts.length; i++) {
    var kv = parts[i].split("=");
    if (decodeURIComponent(kv[0] || "") === key) {
      return kv.length > 1 ? decodeURIComponent(kv.slice(1).join("=").replace(/\+/g, " ")) : "";
    }
  }
  return null;
}

/* ---------- fetch helpers (ok-check + fail-soft, 8s deadline via __nvFetch) ---------- */
async function fetchText(url, options) {
  try {
    var res = await __nvFetch(url, options || {});
    if (!res || !res.ok) return null;
    var t = await res.text();
    return t || null;
  } catch (_) { return null; }
}

async function fetchJson(url, options) {
  try {
    var res = await __nvFetch(url, options || {});
    if (!res || !res.ok) return null;
    return await res.json();
  } catch (_) { return null; }
}

/* ---------- TMDB metadata ---------- */
async function fetchTmdbMetadata(tmdbId, mediaType, targetSeason) {
  var endpoint = mediaType === "movie" ? "movie" : "tv";
  try {
    var data = await fetchJson(
      TMDB_API_URL + "/" + endpoint + "/" + tmdbId + "?api_key=" + TMDB_API_KEY + "&append_to_response=alternative_titles,external_ids",
      { headers: HEADERS }
    );
    if (!data) return null;
    var title = endpoint === "tv" ? data.name : data.title;
    var origTitle = endpoint === "tv" ? data.original_name : data.original_title;
    var altRaw = (data.alternative_titles && (data.alternative_titles.results || data.alternative_titles.titles)) || [];
    var altTitles = altRaw.map(function (t) { return decodeHtmlEntities(t.title); });
    var absoluteOffset = 0;
    var seasonName;
    if (endpoint === "tv" && targetSeason && data.seasons) {
      for (var i = 0; i < data.seasons.length; i++) {
        var s = data.seasons[i];
        if (s.season_number > 0 && s.season_number < targetSeason) {
          absoluteOffset += s.episode_count || 0;
        }
        if (s.season_number === targetSeason) {
          seasonName = s.name;
        }
      }
    }
    return {
      numericId: String(tmdbId),
      kind: endpoint,
      title: decodeHtmlEntities(title || ""),
      originalTitle: origTitle ? decodeHtmlEntities(origTitle) : undefined,
      alternateTitles: altTitles,
      imdbId: data.external_ids ? data.external_ids.imdb_id : undefined,
      seasonName: seasonName,
      absoluteOffset: absoluteOffset,
    };
  } catch (_) {
    return null;
  }
}

/* ---------- anikoto search (HTML page first, ajax fallback) ---------- */
async function searchAnikoto(query) {
  if (!query || !String(query).trim()) return [];
  var kw = encodeURIComponent(String(query).trim());
  var html = await fetchText(BASE_URL + "/filter?keyword=" + kw, { headers: HEADERS });
  if (html) {
    var matches = [];
    var re = /<div class="item [\s\S]*?<div class="ani poster tip" data-tip="(\d+)"[\s\S]*?<a class="name d-title" href="([^"]+)"(?:\s+data-jp="([^"]*)")?[^>]*>([\s\S]*?)<\/a>/gi;
    var m;
    while ((m = re.exec(html)) !== null) {
      matches.push({
        id: m[1],
        url: m[2],
        jpTitle: m[3] ? decodeHtmlEntities(m[3].trim()) : undefined,
        title: decodeHtmlEntities(m[4].replace(/<[^>]+>/g, "").trim()),
      });
    }
    if (matches.length > 0) return matches;
  }
  var json = await fetchJson(BASE_URL + "/ajax/anime/search?keyword=" + kw, { headers: ajaxHeaders() });
  if (json && json.result && json.result.html) {
    var out = [];
    var re2 = /<a class="item" href="([^"]+)"[\s\S]*?<div class="name d-title"[^>]*>([\s\S]*?)<\/div>/gi;
    var m2;
    while ((m2 = re2.exec(json.result.html)) !== null) {
      out.push({
        id: "",
        url: m2[1],
        title: decodeHtmlEntities(m2[2].replace(/<[^>]+>/g, "").trim()),
      });
    }
    return out;
  }
  return [];
}

async function resolveAnimeIdFromUrl(pageUrl) {
  var html = await fetchText(pageUrl, { headers: HEADERS });
  if (html) {
    var match = html.match(/data-id="(\d+)"/);
    if (match) return match[1];
  }
  return null;
}

async function fetchAnimeSeasons(animeId) {
  var json = await fetchJson(BASE_URL + "/api/seasons/" + encodeURIComponent(animeId), { headers: ajaxHeaders() });
  var html = json && json.result ? json.result : "";
  if (!html) return [];
  var out = [];
  var re = /<div class="swiper-slide season (active)?">[\s\S]*?<a href="([^"]+)"[^>]*>[\s\S]*?<div class="name"[^>]*>([\s\S]*?)<\/div>/gi;
  var m;
  while ((m = re.exec(html)) !== null) {
    out.push({
      active: !!m[1],
      url: m[2],
      name: decodeHtmlEntities(m[3].trim()),
    });
  }
  return out;
}

async function fetchEpisodeList(animeId) {
  var json = await fetchJson(BASE_URL + "/ajax/episode/list/" + encodeURIComponent(animeId), { headers: ajaxHeaders() });
  var html = json && json.result ? json.result : "";
  if (!html) return [];
  var out = [];
  var re = /<a[^>]+data-id="(\d+)"[^>]+data-num="(\d+)"[^>]+data-ids="([^"]+)"(?:[^>]*data-mal="(\d+)")?[^>]*>(?:<b>(\d+)<\/b>)?(?:\s*<span[^>]*class="d-title"[^>]*>([^<]*)<\/span>)?/gi;
  var m;
  while ((m = re.exec(html)) !== null) {
    out.push({
      id: m[1],
      num: parseInt(m[2], 10),
      dataIds: m[3],
      malId: m[4] || undefined,
      title: m[6] ? decodeHtmlEntities(m[6].trim()) : undefined,
    });
  }
  return out;
}

async function fetchServerList(dataIds) {
  var json = await fetchJson(BASE_URL + "/ajax/server/list?servers=" + encodeURIComponent(dataIds), { headers: ajaxHeaders() });
  var html = json && json.result ? json.result : "";
  if (!html) return [];
  var servers = [];
  var typeRe = /<div class="type" data-type="(sub|dub)">([\s\S]*?)<\/div>/gi;
  var block;
  while ((block = typeRe.exec(html)) !== null) {
    var type = block[1];
    var itemRe = /<li[^>]*data-link-id="([^"]+)"[^>]*>([\s\S]*?)<\/li>/gi;
    var item;
    while ((item = itemRe.exec(block[2])) !== null) {
      servers.push({
        type: type,
        linkId: item[1],
        serverName: decodeHtmlEntities(item[2].replace(/<[^>]+>/g, "").trim()),
      });
    }
  }
  return servers;
}

async function fetchPlayerUrl(linkId) {
  var json = await fetchJson(BASE_URL + "/ajax/server?get=" + encodeURIComponent(linkId), { headers: ajaxHeaders() });
  if (json && json.result && json.result.url) return json.result.url;
  return null;
}

/* ---------- AES-256-CBC source decrypt (key/iv zero-padded utf8) ---------- */
function padUtf8ToWordArray(str, byteLength) {
  var parsed = __nvAnikotoCrypto.enc.Utf8.parse(str);
  var sigBytes = parsed.sigBytes;
  var srcWords = parsed.words;
  var resultWords = [];
  for (var i = 0; i < byteLength; i += 4) {
    var word = 0;
    for (var j = 0; j < 4 && i + j < byteLength; j++) {
      var byteIdx = i + j;
      if (byteIdx < sigBytes) {
        var byte = (srcWords[Math.floor(byteIdx / 4)] >>> (24 - (byteIdx % 4) * 8)) & 0xff;
        word |= byte << (24 - j * 8);
      }
    }
    resultWords.push(word >>> 0);
  }
  return __nvAnikotoCrypto.lib.WordArray.create(resultWords, byteLength);
}

var ANIKOTO_AES_KEY = null;
var ANIKOTO_AES_IV = null;

function decryptAesCbc(encryptedBase64) {
  try {
    if (!ANIKOTO_AES_KEY) {
      ANIKOTO_AES_KEY = padUtf8ToWordArray("i?LMTAx0Q6,:}50U", 32);
      ANIKOTO_AES_IV = padUtf8ToWordArray("W0;27ToaUpl_P%'c", 16);
    }
    var b64 = String(encryptedBase64).replace(/-/g, "+").replace(/_/g, "/");
    while (b64.length % 4) b64 += "=";
    var decrypted = __nvAnikotoCrypto.AES.decrypt(
      { ciphertext: __nvAnikotoCrypto.enc.Base64.parse(b64) },
      ANIKOTO_AES_KEY,
      { iv: ANIKOTO_AES_IV }
    );
    return JSON.parse(decrypted.toString());
  } catch (_) {
    return null;
  }
}

/* ---------- per-server extraction ---------- */
async function extractStreamFromServer(server) {
  try {
    var playerUrl = await fetchPlayerUrl(server.linkId);
    if (!playerUrl) return null;

    var playerHtml = await fetchText(playerUrl, { headers: Object.assign({}, HEADERS, { "Referer": BASE_URL + "/" }) });
    if (!playerHtml) return null;

    var dataIdMatch = playerHtml.match(/data-id="(\d+)"/);
    if (!dataIdMatch) return null;

    var streamId = dataIdMatch[1];
    var playerOrigin = urlOrigin(playerUrl);
    if (!playerOrigin) return null;
    var sParam = urlParam(playerUrl, "s") || "tcdn";

    var sourcesJson = await fetchJson(
      playerOrigin + "/stream/getSourcesNew?id=" + streamId + "&s=" + encodeURIComponent(sParam),
      {
        headers: Object.assign({}, HEADERS, {
          "Referer": playerUrl,
          "X-Requested-With": "XMLHttpRequest",
        }),
      }
    );
    if (!sourcesJson) return null;

    var masterUrl = sourcesJson.sources ? sourcesJson.sources.file : null;
    if (!masterUrl && sourcesJson.enc) {
      var decrypted = decryptAesCbc(sourcesJson.enc);
      masterUrl = decrypted ? decrypted.file : null;
    }
    if (!masterUrl || typeof masterUrl !== "string") return null;

    if (masterUrl.indexOf("fetch.nexabloom.top") >= 0) {
      masterUrl = masterUrl.replace("fetch.nexabloom.top", "ncdn.imgnex.top");
    }

    var subtitles = [];
    var tracks = sourcesJson.tracks || [];
    for (var i = 0; i < tracks.length; i++) {
      if (tracks[i] && tracks[i].file) {
        subtitles.push({
          url: tracks[i].file,
          language: tracks[i].label || "Unknown",
          name: tracks[i].label || "Subtitles",
        });
      }
    }

    var isDub = server.type === "dub";
    var langName = isDub ? "English" : "Japanese";

    return {
      title: PROVIDER_NAME + " \u2022 " + langName + " \u2022 " + server.serverName,
      name: PROVIDER_NAME + " \u2022 " + langName + " \u2022 " + server.serverName,
      quality: "1080p",
      url: masterUrl,
      headers: {
        "Referer": playerOrigin + "/",
        "Origin": playerOrigin,
      },
      subtitles: subtitles.length > 0 ? subtitles : undefined,
    };
  } catch (_) {
    return null;
  }
}

/* ---------- title matching (zyrvael scoring) ---------- */
function scoreTitleMatch(candidateTitle, candidateJp, targetTitle, targetSeason) {
  var cn = normalizeTitle(candidateTitle);
  var jn = candidateJp ? normalizeTitle(candidateJp) : "";
  var tn = normalizeTitle(targetTitle);
  if ((!cn && !jn) || !tn) return 0;
  if (cn === tn || jn === tn) return 1;
  var best = 0;
  var candidates = [cn, jn];
  for (var i = 0; i < candidates.length; i++) {
    var candidate = candidates[i];
    if (!candidate) continue;
    if (candidate === tn) { best = 1; break; }
    var ratio = Math.min(candidate.length, tn.length) / Math.max(candidate.length, tn.length);
    if (candidate.indexOf(tn) === 0 || tn.indexOf(candidate) === 0) {
      if (0.8 * ratio > best) best = 0.8 * ratio;
    } else if (candidate.indexOf(tn) >= 0 || tn.indexOf(candidate) >= 0) {
      if (0.65 * ratio > best) best = 0.65 * ratio;
    } else {
      var dice = diceCoefficient(candidate, tn);
      if (dice > best) best = dice;
    }
  }
  if (targetSeason && targetSeason > 1) {
    var candidateSeason = parseSeasonNumber(candidateTitle) ||
      (candidateJp ? parseSeasonNumber(candidateJp) : null);
    if (candidateSeason === targetSeason) best += 0.35;
    else if (candidateSeason !== null) best -= 0.4;
  }
  return Math.max(0, best);
}

function pickBestCandidate(candidates, meta, season) {
  if (!candidates || !candidates.length) return null;
  var titlesToScore = [meta.title, meta.originalTitle].concat(meta.alternateTitles || [])
    .filter(function (t) { return t && String(t).trim(); });
  var isMovie = meta.kind === "movie";
  var best = null;
  var highScore = -1;
  for (var i = 0; i < candidates.length; i++) {
    var candidate = candidates[i];
    var candidateScore = 0;
    for (var j = 0; j < titlesToScore.length; j++) {
      var s = scoreTitleMatch(candidate.title, candidate.jpTitle, titlesToScore[j], season);
      if (s > candidateScore) candidateScore = s;
    }
    var isItemMovie = /\bmovie\b/i.test(candidate.title || "") || /\/movie\b/i.test(candidate.url || "");
    var isItemOva = /\b(?:ova|ona|special)\b/i.test(candidate.title || "") || /\b(?:ova|ona|special)\b/i.test(candidate.url || "");
    if (isMovie && !isItemMovie) candidateScore *= 0.5;
    else if (!isMovie && isItemMovie) candidateScore *= 0.6;
    else if (!isMovie && isItemOva) candidateScore *= 0.7;
    if (candidateScore > highScore) { highScore = candidateScore; best = candidate; }
  }
  return highScore >= 0.25 ? best : null;
}

async function resolveTargetSeasonId(baseAnimeId, seasonNumber, seasonName) {
  if (!seasonNumber || seasonNumber <= 1) return baseAnimeId;
  var seasons = await fetchAnimeSeasons(baseAnimeId);
  if (!seasons.length) return baseAnimeId;
  var matched = null;
  for (var i = 0; i < seasons.length; i++) {
    if (parseSeasonNumber(seasons[i].name) === seasonNumber) { matched = seasons[i]; break; }
  }
  if (!matched && seasonName) {
    var normalizedTarget = normalizeTitle(seasonName);
    for (var k = 0; k < seasons.length; k++) {
      var sn = normalizeTitle(seasons[k].name);
      if (sn.indexOf(normalizedTarget) >= 0 || normalizedTarget.indexOf(sn) >= 0) { matched = seasons[k]; break; }
    }
  }
  if (!matched) return baseAnimeId;
  var resolvedId = await resolveAnimeIdFromUrl(matched.url);
  return resolvedId || baseAnimeId;
}

function resolveTargetEpisode(episodes, episodeNumber, absoluteOffset) {
  if (!episodes || !episodes.length) return null;
  var off = absoluteOffset || 0;
  var target = episodeNumber > 0 ? episodeNumber : 1;
  for (var i = 0; i < episodes.length; i++) if (episodes[i].num === target) return episodes[i];
  if (off > 0) {
    for (var j = 0; j < episodes.length; j++) if (episodes[j].num === off + target) return episodes[j];
  }
  return target <= episodes.length ? (episodes[target - 1] || null) : null;
}

/* ---------- entry point ---------- */
async function getStreams(tmdbId, mediaType, season, episode) {
  try {
    if (!tmdbId) return [];

    var settings = (typeof SCRAPER_SETTINGS !== "undefined" && SCRAPER_SETTINGS) || {};
    var enableSub = settings.enableSub !== false;
    var enableDub = settings.enableDub !== false;
    var enable1080 = settings.enable1080p !== false;
    var enable720 = settings.enable720p === true;

    var targetSeason = parseInt(season, 10);
    if (isNaN(targetSeason) || targetSeason <= 0) targetSeason = 1;
    var targetEpisode = parseInt(episode, 10);
    if (isNaN(targetEpisode) || targetEpisode <= 0) targetEpisode = 1;

    var meta = await fetchTmdbMetadata(tmdbId, mediaType, targetSeason);
    if (!meta || !meta.title) return [];

    /* capped query variants (hexion-style title trim + alternates) */
    var searchQueries = [meta.title, meta.originalTitle];
    if (meta.title.indexOf(":") >= 0) searchQueries.push(meta.title.split(":")[0].trim());
    if (meta.title.indexOf("-") >= 0) searchQueries.push(meta.title.split("-")[0].trim());
    if (meta.originalTitle && meta.originalTitle.indexOf(":") >= 0) searchQueries.push(meta.originalTitle.split(":")[0].trim());
    searchQueries = searchQueries.concat(meta.alternateTitles || []);
    searchQueries = searchQueries.filter(function (t) { return t && String(t).trim(); });
    if (searchQueries.length > MAX_SEARCH_QUERIES) searchQueries = searchQueries.slice(0, MAX_SEARCH_QUERIES);

    var candidates = [];
    for (var qi = 0; qi < searchQueries.length && !candidates.length; qi++) {
      candidates = await searchAnikoto(searchQueries[qi]);
    }
    if (!candidates.length) return [];

    var matchedAnime = pickBestCandidate(candidates, meta, targetSeason);
    if (!matchedAnime) return [];

    /* the ajax search path returns no data-tip id -> resolve it from the page */
    var animeId = matchedAnime.id;
    if (!animeId && matchedAnime.url) animeId = await resolveAnimeIdFromUrl(matchedAnime.url);
    if (!animeId) return [];

    var seasonAnimeId = await resolveTargetSeasonId(animeId, targetSeason, meta.seasonName);

    var episodes = await fetchEpisodeList(seasonAnimeId);
    if (!episodes.length) return [];

    var matchedEpisode = resolveTargetEpisode(episodes, targetEpisode, meta.absoluteOffset);
    if (!matchedEpisode || !matchedEpisode.dataIds) return [];

    var allServers = await fetchServerList(matchedEpisode.dataIds);
    if (!allServers.length) return [];

    var eligibleServers = allServers.filter(function (s) {
      if (s.type === "sub" && !enableSub) return false;
      if (s.type === "dub" && !enableDub) return false;
      return true;
    }).sort(function (a, b) {
      var aHd = (a.serverName || "").toLowerCase().indexOf("hd") >= 0;
      var bHd = (b.serverName || "").toLowerCase().indexOf("hd") >= 0;
      return aHd === bHd ? 0 : (aHd ? -1 : 1);
    });

    /* sequential probes, capped, early exit */
    var streams = [];
    for (var si = 0; si < eligibleServers.length && si < MAX_SERVER_PROBES && streams.length < MAX_STREAMS; si++) {
      var row = await extractStreamFromServer(eligibleServers[si]);
      if (row && row.url) streams.push(row);
    }

    streams = streams.filter(function (s) {
      if (s.quality === "1080p" && !enable1080) return false;
      if (s.quality === "720p" && !enable720) return false;
      return true;
    });

    return dedupeStreamsByUrl(streams);
  } catch (_) {
    return [];
  }
}

module.exports = { getStreams };


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
  var PROVIDER = "anikototv";
  var G = typeof globalThis !== "undefined" ? globalThis : typeof global !== "undefined" ? global : this;
  function settings() {
    try { return (G && G.SCRAPER_SETTINGS) || {}; } catch (e) { return {}; }
  }
  function hasTimers() { return typeof setTimeout === "function" && typeof clearTimeout === "function"; }

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
    var opts = { headers: Object.assign({}, headers || {}) };
    var p = __nvFetch(url, opts).then(function (r) {
      return r.ok ? r.text() : "";
    }).then(function (t) {
      var q = "";
      if (t && t.indexOf("#EXTM3U") !== -1) {
        var best = 0, re = /RESOLUTION=(\d+)x(\d+)/gi, m;
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
      qualCache[url] = { t: now, q: q };
      return q;
    }).catch(function () { qualCache[url] = { t: now, q: "" }; return ""; });
    if (hasTimers()) {
      p = Promise.race([p, new Promise(function (res) {
        var timer = setTimeout(function () { res(""); }, 6000);
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
    SEEN[nu] = { exp: now + 120000, owner: owner };
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
        var q = qs[k];
        if (!q) return; // unknown resolution -> removed
        if (q === "CAM") return; // cam / sd / sub-720 -> removed
        row.s.quality = q;
        ranked.push({ s: row.s, i: row.i, q: q });
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
  try { __orig = module.exports && module.exports.getStreams; } catch (e) { __orig = null; }
  if (typeof __orig === "function") {
    module.exports.getStreams = function () {
      var args = Array.prototype.slice.call(arguments), self = this;
      function finish(v) {
        if (settings().postFilter === false) return v;
        try { return postProcess(Array.isArray(v) ? v : []); }
        catch (e) { return Array.isArray(v) ? v : []; }
      }
      try {
        var r = __orig.apply(self, args);
        if (r && typeof r.then === "function") {
          if (typeof setTimeout === "function") {
            // nv best-settings 4.23.0: hard 8s cap on the whole provider run
            r = Promise.race([r, new Promise(function (res) {
              var dl = setTimeout(function () { res([]); }, 8000);
              if (dl && typeof dl.unref === "function") dl.unref();
            })]);
          }
          return r.then(function (v) { return finish(v); }, function () { return []; });
        }
        return finish(r);
      } catch (e) { return Promise.resolve([]); }
    };
  }
})();


/* ===== nv-plugins device waterfall merge v2.0.0 (pack 4.37.0, 2026-09-14) ======
   Device truth (NuvioMobile PluginRuntime.kt + quickjs-kt 1.0.5-nuvio AAR):
   no timers in the realm (every Promise.race cap was inert or threw
   ReferenceError), each fetch is one BLOCKING host call (lanes run
   sequentially regardless of Promise.all), app kills the call at 60s. The
   old 4.33.0 merge ran BOTH lanes on every call and its cap() called
   setTimeout DIRECTLY -> the whole provider rejected -> 0 rows.
   v2.0.0: sequential waterfall bounded by fetch count, fail-soft both lanes.
     __WINGS_FIRST = true  : WINGS lane first, native only when empty
   ========================================================================== */
(function () {
  'use strict';
  var __LABEL = 'AnikotoTV';
  var __WINGS_FIRST = true;
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
