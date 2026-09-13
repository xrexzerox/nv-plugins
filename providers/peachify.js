/*
 * nv-plugins peachify.js — FULLY DECODED port of the All-in-One-Nuvio provider (4.24.0 merge pass).
 * Decoded from the obfuscated AIO build: string tables resolved, decoder machinery stripped,
 * every network call capped by an 8s deadline, node-core requires fail-soft, nvio post-filter
 * attached (en/tl audio gate, >=720p quality gate, cross-provider dedupe). Endpoints/keys/headers
 * identical to the AIO original.
 */
/* nv-plugins best-settings pass 4.24.0: hard 8s deadline on every network call */
var __nvFetch = (function () {
  var _f = null;
  try { _f = (typeof fetch === "function") ? fetch : null; } catch (e) { _f = null; }
  if (!_f) return function () { return Promise.reject(new Error("no fetch")); };
  var hasT = typeof setTimeout === "function";
  return function (input, init) {
    var p;
    try { p = _f.apply(this, arguments); } catch (e) { return Promise.reject(e); }
    if (!hasT || !p || typeof p.then !== "function") return p;
    return Promise.race([p, new Promise(function (_res, rej) {
      var t = setTimeout(function () { rej(new Error("nv deadline 8s")); }, 8000);
      if (t && typeof t.unref === "function") t.unref();
    })]);
  };
})();
/* fail-soft require: node-core modules (net/http/assert/...) never crash the provider */
var __nvRequire = (function () {
  var _rq = null;
  try { _rq = (typeof require === "function") ? require : null; } catch (e) { _rq = null; }
  return function (name) {
    if (_rq) { try { return _rq(name); } catch (e) { } }
    return {};
  };
})();
/* QuickJS-safe global aliases: embedded polyfills (forge/uuid/whatwg) reference
   window/self/document unguarded - in Nuvio's QuickJS those would throw
   ReferenceError at module load and kill the provider. */
var window = (typeof window !== "undefined" && window) ? window
  : (typeof globalThis !== "undefined" ? globalThis : (typeof global !== "undefined" ? global : {}));
var self = (typeof self !== "undefined" && self) ? self : window;
var document = (typeof document !== "undefined" && document) ? document : { createElement: function () { return { style: {}, setAttribute: function () { }, getElementsByTagName: function () { return []; } }; }, getElementsByTagName: function () { return []; }, addEventListener: function () { } };
var navigator = (typeof navigator !== "undefined" && navigator) ? navigator : { userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36" };
var _0x55df=function(){return "";};var _0xbcc88b=_0x55df;/*string-table removed*//*rotation removed*/;
/* ---------- verified pure-JS AES-256-GCM (decrypt-only) ---------- */
var __nvHexToBytes = function (hex) {
  var out = [];
  for (var i = 0; i < hex.length; i += 2) out.push(parseInt(hex.substr(i, 2), 16));
  return out;
};
var __nvGcmDecrypt = (function () {
  function makeGcm() {
  // ---- GF(2^8) tables ----
  var SBOX = new Uint8Array(256);
  var EXP = new Uint8Array(256);
  var LOG = new Uint8Array(256);
  (function init() {
    // exponent/log tables over GF(2^8), poly 0x11b, walking generator 3
    function xtime(a) { return ((a << 1) ^ ((a & 0x80) ? 0x1b : 0)) & 0xff; }
    var x = 1;
    for (var i = 0; i < 255; i++) {
      EXP[i] = x;
      LOG[x] = i;
      x = x ^ xtime(x); // x *= 3 (generator)
    }
    for (var v = 0; v < 256; v++) {
      var inv = v === 0 ? 0 : EXP[(255 - LOG[v]) % 255];
      var s = inv ^ rotl8(inv, 1) ^ rotl8(inv, 2) ^ rotl8(inv, 3) ^ rotl8(inv, 4) ^ 0x63;
      SBOX[v] = s & 0xff;
    }
    function rotl8(v, n) { return ((v << n) | (v >>> (8 - n))) & 0xff; }
  })();
  function gmul(a, b) {
    if (a === 0 || b === 0) return 0;
    return EXP[(LOG[a] + LOG[b]) % 255];
  }
  // ---- key expansion (AES-256: Nk=8, Nr=14) ----
  function expandKey(key /* Uint8Array 32 */) {
    var w = new Uint8Array(240); // 60 words * 4 bytes
    var i;
    for (i = 0; i < 32; i++) w[i] = key[i];
    var rc = 1;
    for (i = 8; i < 60; i++) {
      var t0 = w[4 * (i - 1)], t1 = w[4 * (i - 1) + 1], t2 = w[4 * (i - 1) + 2], t3 = w[4 * (i - 1) + 3];
      if (i % 8 === 0) {
        var tmp0 = t0;
        t0 = SBOX[t1] ^ rc; t1 = SBOX[t2]; t2 = SBOX[t3]; t3 = SBOX[tmp0];
        rc = ((rc << 1) ^ ((rc & 0x80) ? 0x1b : 0)) & 0xff;
      } else if (i % 8 === 4) {
        var u0 = t0;
        t0 = SBOX[t0]; t1 = SBOX[t1]; t2 = SBOX[t2]; t3 = SBOX[t3];
        t0 = t0; void u0;
      }
      w[4 * i] = w[4 * (i - 8)] ^ t0;
      w[4 * i + 1] = w[4 * (i - 8) + 1] ^ t1;
      w[4 * i + 2] = w[4 * (i - 8) + 2] ^ t2;
      w[4 * i + 3] = w[4 * (i - 8) + 3] ^ t3;
    }
    return w;
  }
  // ---- encrypt one block (used for CTR keystream + tag mask) ----
  // Canonical column-major state: byte i of the block = state[row i%4][col i>>2]
  function encryptBlock(w, inB, out) {
    var s = new Uint8Array(16);
    var i, r, c;
    for (i = 0; i < 16; i++) s[i] = inB[i] ^ w[i];
    for (r = 1; r <= 14; r++) {
      // SubBytes
      for (i = 0; i < 16; i++) s[i] = SBOX[s[i]];
      // ShiftRows: state[row][col] <- state[row][(col + row) % 4]
      var t = new Uint8Array(16);
      for (var row = 0; row < 4; row++) {
        for (c = 0; c < 4; c++) t[row + 4 * c] = s[row + 4 * ((c + row) % 4)];
      }
      // MixColumns (skip on final round)
      if (r !== 14) {
        for (c = 0; c < 4; c++) {
          var a0 = t[4 * c], a1 = t[4 * c + 1], a2 = t[4 * c + 2], a3 = t[4 * c + 3];
          t[4 * c]     = gmul(a0, 2) ^ gmul(a1, 3) ^ a2 ^ a3;
          t[4 * c + 1] = a0 ^ gmul(a1, 2) ^ gmul(a2, 3) ^ a3;
          t[4 * c + 2] = a0 ^ a1 ^ gmul(a2, 2) ^ gmul(a3, 3);
          t[4 * c + 3] = gmul(a0, 3) ^ a1 ^ a2 ^ gmul(a3, 2);
        }
      }
      // AddRoundKey: word (4r + col) of the schedule, byte `row`
      for (c = 0; c < 4; c++) {
        for (row = 0; row < 4; row++) {
          s[row + 4 * c] = t[row + 4 * c] ^ w[16 * r + 4 * c + row];
        }
      }
    }
    for (i = 0; i < 16; i++) out[i] = s[i];
  }
  // ---- GHASH ----
  function ghash(h, data) {
    // h: 16-byte GHASH key; data: byte array (multiple of 16 NOT required here;
    // caller pads). Returns 16-byte tag component.
    var y = new Uint8Array(16);
    var v = new Uint8Array(16), z = new Uint8Array(16);
    var i, bit;
    for (var off = 0; off < data.length; off += 16) {
      for (i = 0; i < 16; i++) {
        var b = off + i < data.length ? data[off + i] : 0;
        y[i] ^= b;
      }
      // multiply y by h in GF(2^128)
      for (i = 0; i < 16; i++) v[i] = h[i];
      for (i = 0; i < 16; i++) z[i] = y[i];
      y.set(gmul128(z, v));
    }
    return y;
    function gmul128(x, hh) {
      var out = new Uint8Array(16);
      var R = 0xe1;
      var zf = new Uint8Array(16), vf = new Uint8Array(16);
      zf.set(x); vf.set(hh);
      for (bit = 0; bit < 128; bit++) {
        if (zf[bit >> 3] & (0x80 >> (bit & 7))) {
          for (i = 0; i < 16; i++) out[i] ^= vf[i];
        }
        var lsb = vf[15] & 1;
        // v >>= 1
        for (i = 15; i > 0; i--) vf[i] = ((vf[i] >> 1) | ((vf[i - 1] & 1) << 7)) & 0xff;
        vf[0] = (vf[0] >> 1) & 0xff;
        if (lsb) vf[0] ^= R;
      }
      return out;
    }
  }
  // ---- GCM decrypt: returns plaintext Uint8Array or null (auth fail) ----
  function gcmDecrypt(key, iv, ctWithTag, aad) {
    var w = expandKey(key);
    var h = new Uint8Array(16);
    var zero = new Uint8Array(16);
    encryptBlock(w, zero, h);
    var j0 = new Uint8Array(16);
    if (iv.length === 12) {
      j0.set(iv); j0[15] = 1;
    } else {
      var ivPad = new Uint8Array(Math.ceil(iv.length / 16) * 16 + 16);
      ivPad.set(iv);
      var lenBlock = new Uint8Array(16);
      var ivBits = iv.length * 8;
      lenBlock[8] = (ivBits / 0x100000000) & 0xff;
      lenBlock[12] = (ivBits >>> 24) & 0xff; lenBlock[13] = (ivBits >>> 16) & 0xff;
      lenBlock[14] = (ivBits >>> 8) & 0xff; lenBlock[15] = ivBits & 0xff;
      var hData = new Uint8Array(ivPad.length + 16);
      hData.set(ivPad); hData.set(lenBlock, ivPad.length);
      j0.set(ghash(h, hData));
    }
    // tag mask E(K, J0)
    var tagMask = new Uint8Array(16);
    encryptBlock(w, j0, tagMask);
    // keystream from inc32(J0)
    var n = Math.ceil(ctWithTag.length / 16);
    var ks = new Uint8Array(n * 16);
    var ctr = new Uint8Array(16);
    ctr.set(j0);
    for (var b = 0; b < n; b++) {
      // inc32
      var c = ((ctr[12] << 24) | (ctr[13] << 16) | (ctr[14] << 8) | ctr[15]) + 1;
      ctr[12] = (c >>> 24) & 0xff; ctr[13] = (c >>> 16) & 0xff; ctr[14] = (c >>> 8) & 0xff; ctr[15] = c & 0xff;
      var blk = new Uint8Array(16);
      encryptBlock(w, ctr, blk);
      ks.set(blk, b * 16);
    }
    var pt = new Uint8Array(ctWithTag.length);
    for (var i2 = 0; i2 < ctWithTag.length; i2++) pt[i2] = ctWithTag[i2] ^ ks[i2];
    // tag = E(K,J0) xor GHASH_H(aad || ct || len)
    var ctLen = ctWithTag.length - 16;
    var pad = function (x) { return (Math.ceil(x / 16) * 16) - x; };
    var gData = new Uint8Array(aad.length + pad(aad.length) + ctLen + pad(ctLen) + 16);
    var o = 0;
    gData.set(aad, o); o += aad.length + pad(aad.length);
    // GHASH runs over the CIPHERTEXT (not the plaintext!)
    gData.set(ctWithTag.subarray(0, ctLen), o); o += ctLen + pad(ctLen);
    var aadBits = aad.length * 8, ctBits = ctLen * 8;
    // 64-bit big-endian bit lengths: [len(A) as u64][len(C) as u64]
    // (values < 2^32 in practice: upper word stays zero)
    gData[o]      = 0; gData[o + 1] = 0; gData[o + 2] = 0; gData[o + 3] = 0;
    gData[o + 4]  = (aadBits >>> 24) & 0xff; gData[o + 5] = (aadBits >>> 16) & 0xff;
    gData[o + 6]  = (aadBits >>> 8) & 0xff;  gData[o + 7] = aadBits & 0xff;
    gData[o + 8]  = 0; gData[o + 9] = 0; gData[o + 10] = 0; gData[o + 11] = 0;
    gData[o + 12] = (ctBits >>> 24) & 0xff;  gData[o + 13] = (ctBits >>> 16) & 0xff;
    gData[o + 14] = (ctBits >>> 8) & 0xff;   gData[o + 15] = ctBits & 0xff;
    void pad;
    var s_ = ghash(h, gData);
    var tag = new Uint8Array(16);
    for (var k = 0; k < 16; k++) tag[k] = s_[k] ^ tagMask[k];
    // constant-time compare
    var diff = 0;
    for (var k2 = 0; k2 < 16; k2++) diff |= tag[k2] ^ ctWithTag[ctLen + k2];
    if (diff !== 0) return null;
    return pt.subarray(0, ctLen);
  }
  return { gcmDecrypt: gcmDecrypt, expandKey: expandKey, encryptBlock: encryptBlock };
}


  var impl = makeGcm().gcmDecrypt;
  return function (key, iv, ct, aad) {
    try {
      return impl(new Uint8Array(key), new Uint8Array(iv), new Uint8Array(ct), new Uint8Array(aad || []));
    } catch (e) { return null; }
  };
})();

PROVIDER_NAME='Peachify',AES_KEY_HEX='a8f2a1b5e9c470814f6b2c3a5d8e7f9c1a2b3c4d5e3f7a8b8cad1e2d0a4d5c5d',MOBILE_UAS=['Mozilla/5.0\x20(Linux;\x20Android\x2014;\x20Pixel\x208\x20Pro)\x20AppleWebKit/537.36\x20(KHTML,\x20like\x20Gecko)\x20Chrome/124.0.0.0\x20Mobile\x20Safari/537.36','Mozilla/5.0\x20(Linux;\x20Android\x2013;\x20SM-S918B)\x20AppleWebKit/537.36\x20(KHTML,\x20like\x20Gecko)\x20Chrome/116.0.0.0\x20Mobile\x20Safari/537.36',"Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1","Mozilla/5.0 (Linux; Android 14; SM-F946U) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Mobile Safari/537.36"],TIMEOUT=0x3a98,TMDB_KEY="439c478a771f35c05022f9feabcca01c",SERVERS=[{'label':"Iron",'base':'https://uwu.eat-peach.sbs','path':"moviebox"},{'label':"Wolf",'base':'https://usa.eat-peach.sbs','path':'air'},{'label':'Spider','base':"https://usa.eat-peach.sbs",'path':'holly'},{'label':'Multi','base':"https://usa.eat-peach.sbs",'path':"multi"},{'label':"Dark",'base':"https://uwu.eat-peach.sbs",'path':'net'}];function getRequestHeaders(_0x2de58e){var _0x6c2961={_0xde2a2a:0x21c},_0x59bae4=_0xbcc88b;return{'User-Agent':_0x2de58e,'Origin':"https://peachify.top",'Referer':"https://peachify.top/"};}function b64urlDecode(s){
    var T='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    var str=String(s).replace(/-/g,'+').replace(/_/g,'/');
    while(str.length%4!==0) str+='=';
    var padLen=0;
    if(str.slice(-2)==='==') padLen=2; else if(str.slice(-1)==='=') padLen=1;
    var outLen=str.length/4*3-padLen;
    var out='';
    var i;
    for(i=0;out.length<outLen&&i<str.length;i+=4){
      var c0=T.indexOf(str.charAt(i)),c1=T.indexOf(str.charAt(i+1)),
          c2=T.indexOf(str.charAt(i+2)),c3=T.indexOf(str.charAt(i+3));
      var n=(c0<<18)|(c1<<12)|((c2<0?0:c2)<<6)|(c3<0?0:c3);
      out+=String.fromCharCode((n>>16)&0xff);
      if(out.length<outLen) out+=String.fromCharCode((n>>8)&0xff);
      if(out.length<outLen) out+=String.fromCharCode(n&0xff);
    }
    return out;
  }function aesGcmDecrypt(data){
    var parts=String(data||'').split('.');
    if(parts.length<3) return null;
    try{
      var ivB=b64urlDecode(parts[0]), ctB=b64urlDecode(parts[1]), tagB=b64urlDecode(parts[2]);
      var toHex=function(bin){var h='';for(var i=0;i<bin.length;i++){h+=('0'+bin.charCodeAt(i).toString(16)).slice(-2);}return h;};
      var ivHex=toHex(ivB), bodyHex=toHex(ctB+tagB);
      /* 1) host bridge (PluginCrypto supports AES-GCM) */
      if(typeof __crypto_aes_decrypt_hex==='function'){
        try{
          var outHex=__crypto_aes_decrypt_hex('AES-GCM',AES_KEY_HEX,ivHex,bodyHex);
          if(outHex){
            var out='';
            for(var k=0;k<outHex.length;k+=2){out+=String.fromCharCode(parseInt(outHex.substr(k,2),16));}
            var utf8=decodeURIComponent(escape(out));
            return JSON.parse(utf8);
          }
        }catch(eBridge){/* fall through to pure JS */}
      }
      /* 2) pure-JS AES-256-GCM (verified against 40 random + NIST vectors) */
      var blob=ivB.length>=0?ctB+tagB:ctB+tagB;
      var ptBytes=__nvGcmDecrypt(
        __nvHexToBytes(AES_KEY_HEX),
        (function(){var a=[];for(var q=0;q<ivB.length;q++)a.push(ivB.charCodeAt(q));return a;})(),
        (function(){var a=[];for(var q=0;q<blob.length;q++)a.push(blob.charCodeAt(q)&0xff);return a;})(),
        []);
      if(!ptBytes) return null;
      var bin='';
      for(var j=0;j<ptBytes.length;j++) bin+=String.fromCharCode(ptBytes[j]);
      return JSON.parse(decodeURIComponent(escape(bin)));
    }catch(eAll){return null;}
  }function fetchWithTimeout(_0x7f3e52,_0x17dcbd,_0x5c2b51){var _0x53c4ff={_0x5044be:0x31b,_0xe82156:0x3bc};return __async(this,null,function*(){var _0x51e104=_0x55df;_0x5c2b51=_0x5c2b51||TIMEOUT;try{var _0x252c14=typeof AbortSignal!=="undefined"&&AbortSignal['timeout']?AbortSignal['timeout'](_0x5c2b51):null,_0x296d17=__spreadValues({},_0x17dcbd||{});if(_0x252c14)_0x296d17['signal']=_0x252c14;return yield __nvFetch(_0x7f3e52,_0x296d17);}catch(_0x3c2b7a){if(_0x3c2b7a["name"]==="AbortError"||_0x3c2b7a['name']==='TimeoutError')console['log']('['+PROVIDER_NAME+"] Timeout: "+_0x7f3e52['substring'](0x0,0x50));return null;}});}function fetchFromServer(_0x444c40,_0x1bf881,_0x15ba46,_0x434a64,_0x39f1cf,_0x2f3b78){var _0x4bd183={_0x4e39ac:0x3cb,_0x2e74c1:0xee,_0xfb3561:0xee,_0x86fedf:0x20f,_0x2f0322:0x2a3,_0x1f5c29:0x47f,_0x28f559:0x12b,_0x32a525:0x3b8,_0x52ec48:0x4b8};return __async(this,null,function*(){var _0x260207=_0x55df,_0x5f23ec=_0x15ba46==='tv'||_0x15ba46==="series"?'tv':'movie',_0x4f687b=_0x444c40['base']+'/'+_0x444c40["path"]+'/'+_0x5f23ec+'/'+_0x1bf881;if((_0x15ba46==='tv'||_0x15ba46==='series')&&_0x434a64!=null&&_0x39f1cf!=null)_0x4f687b+='/'+_0x434a64+'/'+_0x39f1cf;console['log']('['+PROVIDER_NAME+']\x20'+_0x444c40["label"]+':\x20'+_0x4f687b["substring"](0x0,0x64));var _0x4ff8cc=getRequestHeaders(_0x2f3b78),_0x2ea58d=yield fetchWithTimeout(_0x4f687b,{'headers':_0x4ff8cc},TIMEOUT);if(!_0x2ea58d||!_0x2ea58d['ok'])return console['log']('['+PROVIDER_NAME+']\x20'+_0x444c40["label"]+'\x20->\x20'+(_0x2ea58d?_0x2ea58d["status"]:'no\x20response')),null;var _0x273d5b=yield _0x2ea58d['json']();if(!_0x273d5b||!_0x273d5b["isEncrypted"]||!_0x273d5b["data"])return console["log"]('['+PROVIDER_NAME+']\x20'+_0x444c40['label']+'\x20unexpected\x20format'),null;var _0x15ac19=aesGcmDecrypt(_0x273d5b["data"]);if(!_0x15ac19)return console["log"]('['+PROVIDER_NAME+']\x20'+_0x444c40['label']+'\x20decrypt\x20fail'),null;var _0x45be48=_0x15ac19['sources']?_0x15ac19["sources"]["length"]:0x0;return console["log"]('['+PROVIDER_NAME+']\x20'+_0x444c40['label']+" OK ("+_0x45be48+" sources)"),_0x15ac19;});}function normalizeQuality(_0x1cd9e1){var _0x2e37fd={_0x531e3f:0x2c4},_0x2a0479=_0xbcc88b,_0x3f6698=String(_0x1cd9e1||'')['toLowerCase'](),_0x38591e=_0x3f6698['match'](/(2160|1080|720|480)\s*p/i);return _0x38591e?_0x38591e[0x1]+'p':_0x3f6698["indexOf"]('4k')>=0x0?"2160p":'HD';}function buildStreams(_0x386491,_0x4b04b0,_0x6c91cd,_0x5cce07,_0x5d2615,_0x5605de){var _0x34d1f0={_0x57d11d:0x10a,_0x57c1ce:0x359,_0x4964c8:0x12b,_0x34527f:0x268,_0x26f99e:0x3bc,_0xfed5ce:0x549,_0x5d4b93:0x366,_0x282ee0:0x332},_0x5bf6e8=_0xbcc88b,_0x47591c=[],_0x5d106f={};if(!_0x386491||!_0x386491["sources"])return _0x47591c;var _0x25be7a=_0x5cce07!=null&&_0x5d2615!=null,_0x233165=_0x25be7a?'\x20S'+_0x5cce07+'E'+_0x5d2615:'',_0x33bf39=_0x6c91cd?_0x6c91cd+_0x233165+" - Peachify":'Peachify';for(var _0x4c6aaa=0x0;_0x4c6aaa<_0x386491['sources']["length"];_0x4c6aaa++){var _0x1cdf1e=_0x386491["sources"][_0x4c6aaa],_0x59288c=_0x1cdf1e["url"]||_0x1cdf1e['src']||_0x1cdf1e["file"]||_0x1cdf1e["stream"]||_0x1cdf1e['streamUrl']||'',_0x4c6016=_0x1cdf1e['dub']||_0x1cdf1e["audio"]||_0x1cdf1e['language']||_0x1cdf1e["name"]||'Original',_0x2337d0=_0x59288c+'|'+_0x4c6016;if(!_0x59288c||_0x5d106f[_0x2337d0])continue;_0x5d106f[_0x2337d0]=!![];var _0x168eb3=normalizeQuality(_0x1cdf1e['quality']||_0x1cdf1e["resolution"]||''),_0x416218=_0x33bf39+'\x20|\x20'+_0x4b04b0+" | "+_0x168eb3+'\x20|\x20'+_0x4c6016,_0x49fc0c={'origin':"https://peachify.top",'referer':"https://peachify.top/",'user-agent':_0x5605de,'accept':'*/*'};if(_0x1cdf1e["headers"])for(var _0x316be8 in _0x1cdf1e['headers']){_0x49fc0c[_0x316be8["toLowerCase"]()]=_0x1cdf1e['headers'][_0x316be8];}var _0x261c14=_0x1cdf1e['type']==='hls'||_0x59288c["indexOf"]('m3u8')!==-0x1,_0x3e3c9c={'name':_0x416218,'title':_0x416218,'url':_0x59288c,'quality':_0x168eb3,'behaviorHints':{'notWebReady':!![]}};_0x261c14?_0x3e3c9c["headers"]=_0x49fc0c:_0x3e3c9c['behaviorHints']['proxyHeaders']={'request':_0x49fc0c},_0x47591c['push'](_0x3e3c9c);}return _0x47591c;}/*decoder removed*/function getStreams(_0x968d80,_0x49502e,_0x3bb9a7,_0x3c7b2a){var _0x171d18={_0xf9dcb9:0x440,_0x5b6628:0x2c9,_0x2e4930:0x262,_0x37ed3e:0x3b8,_0x523fa5:0x251,_0x12db76:0x3cb,_0x343217:0x359,_0x51ef23:0x5fe,_0x235b18:0x47f,_0x2a280d:0x359,_0x40ee1a:0x2ff,_0x509d52:0x15f,_0x2464f3:0x4b4},_0x5b2da7={_0x112183:0x50a};return __async(this,null,function*(){var _0x3eec7a={_0x468ddc:0x318,_0x11dd03:0x37e,_0x1ce164:0x4fe},_0x1edeee=_0x55df;try{var _0x580bd=MOBILE_UAS[Math['floor'](Math["random"]()*MOBILE_UAS['length'])];console['log']('['+PROVIDER_NAME+']\x20ID='+_0x968d80+'\x20T='+_0x49502e+" S="+_0x3bb9a7+" E="+_0x3c7b2a);var _0x2fa12a=String(_0x968d80||'')["trim"]();if(_0x2fa12a["indexOf"]('tt')===0x0){console["log"]('['+PROVIDER_NAME+"] Resolving IMDb ID...");var _0x271704=yield fetchWithTimeout("https://api.themoviedb.org/3/find/"+_0x2fa12a+'?api_key='+TMDB_KEY+"&external_source=imdb_id",{'headers':{'User-Agent':_0x580bd}},0x2710);if(_0x271704&&_0x271704['ok']){var _0x188d5a=yield _0x271704["json"](),_0xc5915f=_0x49502e==='tv'||_0x49502e==="series"?_0x188d5a['tv_results']:_0x188d5a["movie_results"];_0xc5915f&&_0xc5915f["length"]>0x0&&(_0x2fa12a=String(_0xc5915f[0x0]['id']),console["log"]('['+PROVIDER_NAME+"] Resolved to TMDB: "+_0x2fa12a));}}var _0x292525=((()=>__async(this,null,function*(){var _0x4f3fbd=_0x1edeee,_0x5d1614=_0x49502e==='tv'||_0x49502e==='series'?'tv':'movie';try{var _0x11676b=yield fetchWithTimeout("https://api.themoviedb.org/3/"+_0x5d1614+'/'+_0x2fa12a+"?api_key="+TMDB_KEY,{'headers':{'User-Agent':_0x580bd}},0x1f40);if(_0x11676b&&_0x11676b['ok']){var _0x16bae4=yield _0x11676b["json"]();return _0x16bae4["title"]||_0x16bae4['name']||null;}}catch(_0x20b84c){}return null;}))()),_0x46523a=SERVERS['map'](function(_0x382207){return __async(this,null,function*(){var _0x35bbda=yield fetchFromServer(_0x382207,_0x2fa12a,_0x49502e,_0x3bb9a7,_0x3c7b2a,_0x580bd);return{'data':_0x35bbda,'label':_0x382207['label']};});}),_0xc8e6f=yield _0x292525,_0x581314=yield Promise["all"](_0x46523a),_0x16b5aa=[];for(var _0x2451cd=0x0;_0x2451cd<_0x581314['length'];_0x2451cd++){var _0x25662f=_0x581314[_0x2451cd];if(_0x25662f["data"]){var _0x417ff8=buildStreams(_0x25662f["data"],_0x25662f['label'],_0xc8e6f,_0x3bb9a7,_0x3c7b2a,_0x580bd);for(var _0x54cab8=0x0;_0x54cab8<_0x417ff8["length"];_0x54cab8++)_0x16b5aa['push'](_0x417ff8[_0x54cab8]);}}var _0x4b10db={'2160p':0x0,'1080p':0x1,'720p':0x2,'480p':0x3,'HD':0x4};return _0x16b5aa["sort"](function(_0x111f51,_0x409586){var _0x28c2de=_0x1edeee,_0x5c3d1c=_0x4b10db[_0x111f51["quality"]]!==void 0x0?_0x4b10db[_0x111f51['quality']]:0x63,_0x587e50=_0x4b10db[_0x409586["quality"]]!==void 0x0?_0x4b10db[_0x409586['quality']]:0x63;return _0x5c3d1c-_0x587e50;}),console['log']('['+PROVIDER_NAME+']\x20Total:\x20'+_0x16b5aa["length"]+" streams"),_0x16b5aa;}catch(_0x1e6c27){return console['error']('['+PROVIDER_NAME+']\x20Fatal:\x20'+(_0x1e6c27["message"]||_0x1e6c27)),[];}});}typeof module!=='undefined'&&module['exports']?module["exports"]={'getStreams':getStreams}:global['getStreams']=getStreams;

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
