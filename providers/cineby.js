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
/* nv-plugins cineby.js v2.5.0 (pack 4.33.0, 2026-09-13): speed fix - estimateHlsSize (1 master fetch + 5 segment HEADs per stream) removed: on device it pushed every call past the 8s tail cap, which is why cineby showed no streams on device while working on fast networks. Size now reported as Variable. */
/*
 * nv-plugins cineby.js — FULLY DECODED port of the All-in-One-Nuvio provider (4.23.0 best-settings pass).
 * Decoded from the obfuscated AIO build: string tables resolved, decoder machinery stripped,
 * every network call capped by an 8s deadline, nvio post-filter attached (en/tl audio gate,
 * >=720p quality gate, cross-provider dedupe). Behavior/endpoints identical to the AIO original.
 */
/* nv-plugins best-settings pass 4.23.0: hard 8s deadline on every network call */
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
var _0x16fc=function(){return "";};const _0x1c95ef=_0x16fc;/*rotation removed*/;var __defProp=Object["defineProperty"],__defProps=Object['defineProperties'],__getOwnPropDescs=Object["getOwnPropertyDescriptors"],__getOwnPropSymbols=Object["getOwnPropertySymbols"],__hasOwnProp=Object['prototype']["hasOwnProperty"],__propIsEnum=Object['prototype']["propertyIsEnumerable"],__defNormalProp=(_0xe10ae9,_0x3ff632,_0x3ec53f)=>_0x3ff632 in _0xe10ae9?__defProp(_0xe10ae9,_0x3ff632,{'enumerable':!![],'configurable':!![],'writable':!![],'value':_0x3ec53f}):_0xe10ae9[_0x3ff632]=_0x3ec53f,__spreadValues=(_0x119f85,_0x4b191f)=>{const _0x582889={_0x944e74:0x7b},_0x4e6c37=_0x1c95ef;for(var _0x5b5e38 in _0x4b191f||(_0x4b191f={}))if(__hasOwnProp['call'](_0x4b191f,_0x5b5e38))__defNormalProp(_0x119f85,_0x5b5e38,_0x4b191f[_0x5b5e38]);if(__getOwnPropSymbols)for(var _0x5b5e38 of __getOwnPropSymbols(_0x4b191f)){if(__propIsEnum["call"](_0x4b191f,_0x5b5e38))__defNormalProp(_0x119f85,_0x5b5e38,_0x4b191f[_0x5b5e38]);}return _0x119f85;},__spreadProps=(_0x489483,_0x3766c8)=>__defProps(_0x489483,__getOwnPropDescs(_0x3766c8)),__async=(_0x2bbbbc,_0x27b479,_0x435e6f)=>{const _0x3b5e12={_0x441252:0x86},_0x1f124e={_0x35f4c8:0x86};return new Promise((_0x139466,_0x5a70a3)=>{const _0x46d254=_0x16fc;var _0x4c59f2=_0x2b7eb0=>{const _0x5b3657=_0x16fc;try{_0x3d7944(_0x435e6f["next"](_0x2b7eb0));}catch(_0x384c3b){_0x5a70a3(_0x384c3b);}},_0x4f2aed=_0xee2a8a=>{try{_0x3d7944(_0x435e6f['throw'](_0xee2a8a));}catch(_0xf26a55){_0x5a70a3(_0xf26a55);}},_0x3d7944=_0x4827a7=>_0x4827a7['done']?_0x139466(_0x4827a7["value"]):Promise['resolve'](_0x4827a7["value"])['then'](_0x4c59f2,_0x4f2aed);_0x3d7944((_0x435e6f=_0x435e6f['apply'](_0x2bbbbc,_0x27b479))["next"]());});},DOMAINS_URL='https://raw.githubusercontent.com/sapariyaneel/nuvio-plugin/refs/heads/main/domains.json',FALLBACK_API_HOST="https://api.speedracelight.com",TMDB_API_KEY='1865f43a0549ca50d341dd9ab8b29f49',HEADERS={'User-Agent':"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",'Referer':'https://www.cineby.at/','Origin':'https://www.cineby.at'},cachedDomains=null;function getDomains(){return __async(this,null,function*(){if(cachedDomains)return cachedDomains;try{const _0x584599=yield __nvFetch(DOMAINS_URL,{'skipSizeCheck':!![]});cachedDomains=yield _0x584599['json']();}catch(_0x37b489){cachedDomains={};}return cachedDomains;});}function getApiHost(){const _0x11524e={_0x4720c9:0x84};return __async(this,null,function*(){const _0x12d3d1=_0x16fc,_0x7e0ea9=yield getDomains();return(_0x7e0ea9['speedracelight']||_0x7e0ea9["api.speedracelight.com"]||FALLBACK_API_HOST)["replace"](/\/+$/,'');});}var SHA256_CONSTANTS=[0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174],MAGIC_BYTES=[0x6d,0x76,0x6d,0x31];function isCustomBranch(_0x21b2e6){return(_0x21b2e6*(_0x21b2e6+0x1)&0x1)===0x0;}function fmix32(_0x2d32ad){const _0x460932={_0x408387:0x7a},_0x411eda=_0x1c95ef;return _0x2d32ad=_0x2d32ad>>>0x0,_0x2d32ad^=_0x2d32ad>>>0x10,_0x2d32ad=Math["imul"](_0x2d32ad,0x85ebca6b)>>>0x0,_0x2d32ad^=_0x2d32ad>>>0xd,_0x2d32ad=Math["imul"](_0x2d32ad,0xc2b2ae35)>>>0x0,_0x2d32ad=(_0x2d32ad^_0x2d32ad>>>0x10)>>>0x0,_0x2d32ad;}function rotl32(_0x3968e5,_0x28915b){_0x3968e5=_0x3968e5>>>0x0,_0x28915b&=0x1f;if(_0x28915b===0x0)return _0x3968e5>>>0x0;return(_0x3968e5<<_0x28915b|_0x3968e5>>>0x20-_0x28915b)>>>0x0;}var BASE64_CHARS="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";function pureBase64Decode(_0x4a6253){const _0x588128={_0x5df4eb:0x88,_0x17f2c4:0x8d,_0x236c0:0xaf},_0x25fbe0=_0x1c95ef;let _0x3d9a9e='';for(let _0x26547f=0x0;_0x26547f<_0x4a6253["length"];_0x26547f++){const _0x2b39b5=_0x4a6253['charAt'](_0x26547f);if(_0x2b39b5!=='='&&BASE64_CHARS["indexOf"](_0x2b39b5)!==-0x1)_0x3d9a9e+=_0x2b39b5;}let _0x484e83='';for(let _0x50964b=0x0;_0x50964b<_0x3d9a9e["length"];_0x50964b+=0x4){const _0x2f56a2=BASE64_CHARS['indexOf'](_0x3d9a9e["charAt"](_0x50964b)),_0x5e2513=BASE64_CHARS["indexOf"](_0x3d9a9e["charAt"](_0x50964b+0x1)),_0x45a55b=_0x50964b+0x2<_0x3d9a9e['length']?BASE64_CHARS["indexOf"](_0x3d9a9e["charAt"](_0x50964b+0x2)):-0x1,_0x416c65=_0x50964b+0x3<_0x3d9a9e["length"]?BASE64_CHARS['indexOf'](_0x3d9a9e['charAt'](_0x50964b+0x3)):-0x1;_0x484e83+=String["fromCharCode"](_0x2f56a2<<0x2|_0x5e2513>>0x4);if(_0x45a55b!==-0x1)_0x484e83+=String['fromCharCode']((_0x5e2513&0xf)<<0x4|_0x45a55b>>0x2);if(_0x416c65!==-0x1)_0x484e83+=String['fromCharCode']((_0x45a55b&0x3)<<0x6|_0x416c65);}return _0x484e83;}/*decoder removed*/function base64UrlToBytes(_0x27005d){const _0x38869b=_0x1c95ef,_0x41ab19=_0x27005d['replace'](/-/g,'+')["replace"](/_/g,'/')['padEnd'](0x4*Math['ceil'](_0x27005d['length']/0x4),'='),_0x34292b=typeof atob==='function'?atob(_0x41ab19):pureBase64Decode(_0x41ab19),_0x576466=new Uint8Array(_0x34292b['length']);for(let _0x3a848b=0x0;_0x3a848b<_0x34292b['length'];_0x3a848b++)_0x576466[_0x3a848b]=_0x34292b['charCodeAt'](_0x3a848b);return _0x576466;}function fnv1a32(_0x22dd18){const _0x3177c8={_0x59f7e1:0x7a,_0x2e9cd3:0x9b},_0x15303c=_0x1c95ef;let _0x248b4b=0x811c9dc5;for(let _0x177963=0x0;_0x177963<_0x22dd18['length'];_0x177963++)_0x248b4b=Math["imul"](_0x248b4b^_0x22dd18["charCodeAt"](_0x177963),0x1000193)>>>0x0;return fmix32(_0x248b4b);}function makeKeystreamState(_0x2e4eab,_0x152fcc){const _0xd1a525=new Array(0x3d);let _0x3ec03f=fmix32(fnv1a32(_0x2e4eab)^fmix32(_0x152fcc>>>0x0^0x9e3779b9))>>>0x0;for(let _0x35d66c=0x0;_0x35d66c<0x8;_0x35d66c++){if(isCustomBranch(_0x35d66c)){const _0x6dd951=_0x3ec03f%0x3d;_0x3ec03f=rotl32(_0x3ec03f+0x9e3779b9>>>0x0,0x7+(0x7&_0x35d66c)),_0xd1a525[_0x6dd951]=(_0x3ec03f^fmix32(_0x3ec03f))>>>0x0,_0x3ec03f=fmix32(_0x3ec03f+_0x6dd951>>>0x0);}else _0xd1a525[_0x35d66c]=SHA256_CONSTANTS[0xf&_0x35d66c];}return{'slots':_0xd1a525,'acc':fmix32(0xa5a5a5a5^_0x3ec03f)>>>0x0};}/*string-table removed*/function nextKeystreamWord(_0x30ff07,_0x34583b){const _0x5824a6={_0x1ed574:0x7a},_0x58f89e=_0x1c95ef,_0x4f18be=_0x30ff07['slots'],_0x1028bb=_0x30ff07['acc'],_0x71bdc8=_0x1028bb%0x3d,_0x369161=_0x71bdc8 in _0x4f18be?-0x1:0x0,_0x4a9be7=_0x4f18be[_0x71bdc8]>>>0x0,_0x3bd0f4=(_0x4a9be7^Math['imul'](0x9e3779b9,_0x34583b+0x1)>>>0x0)>>>0x0,_0x7bdba=((_0x1028bb^_0x3bd0f4)>>>0x0|(_0x1028bb&_0x3bd0f4&_0x369161)>>>0x0)>>>0x0,_0x3d6292=(rotl32(_0x7bdba+_0x1028bb>>>0x0,0x1f&_0x71bdc8)^rotl32(_0x1028bb,0x1f&Math["imul"](_0x71bdc8,0x7)))>>>0x0,_0x57637b=fmix32(_0x3d6292+0x9e3779b9>>>0x0);return _0x4f18be[_0x71bdc8]=_0x57637b>>>0x0,_0x30ff07["acc"]=_0x57637b,_0x57637b>>>0x0;}function generateKeystream(_0x28cfc2,_0x1fccb6,_0x604a16){const _0xa7122b=makeKeystreamState(_0x28cfc2,_0x1fccb6),_0x34d23a=new Uint8Array(_0x604a16);let _0xeb714b=0x0,_0x2ea9d6=0x0;while(_0xeb714b<_0x604a16){const _0x20593e=nextKeystreamWord(_0xa7122b,_0x2ea9d6++);_0x34d23a[_0xeb714b++]=0xff&_0x20593e;if(_0xeb714b<_0x604a16)_0x34d23a[_0xeb714b++]=_0x20593e>>>0x8&0xff;if(_0xeb714b<_0x604a16)_0x34d23a[_0xeb714b++]=_0x20593e>>>0x10&0xff;if(_0xeb714b<_0x604a16)_0x34d23a[_0xeb714b++]=_0x20593e>>>0x18&0xff;}return _0x34d23a;}function utf8BytesToString(_0x549940){const _0x147c74={_0x215f65:0xa3},_0x31c58b=_0x1c95ef;let _0x171c8a='',_0x25f76f=0x0;while(_0x25f76f<_0x549940['length']){const _0x340df2=_0x549940[_0x25f76f++];if(_0x340df2<0x80)_0x171c8a+=String['fromCharCode'](_0x340df2);else{if((_0x340df2&0xe0)===0xc0){const _0x290fb7=_0x549940[_0x25f76f++];_0x171c8a+=String['fromCharCode']((_0x340df2&0x1f)<<0x6|_0x290fb7&0x3f);}else{if((_0x340df2&0xf0)===0xe0){const _0x1bb43a=_0x549940[_0x25f76f++],_0x37c98c=_0x549940[_0x25f76f++];_0x171c8a+=String["fromCharCode"]((_0x340df2&0xf)<<0xc|(_0x1bb43a&0x3f)<<0x6|_0x37c98c&0x3f);}else{if((_0x340df2&0xf8)===0xf0){const _0x325db0=_0x549940[_0x25f76f++],_0x221911=_0x549940[_0x25f76f++],_0xaa76b0=_0x549940[_0x25f76f++];let _0x4566f=(_0x340df2&0x7)<<0x12|(_0x325db0&0x3f)<<0xc|(_0x221911&0x3f)<<0x6|_0xaa76b0&0x3f;_0x4566f-=0x10000,_0x171c8a+=String["fromCharCode"](0xd800+(_0x4566f>>0xa),0xdc00+(_0x4566f&0x3ff));}else _0x171c8a+=String["fromCharCode"](_0x340df2);}}}}return _0x171c8a;}function decryptSourcesPayload(_0x219443,_0x4d7883,_0x38593b){const _0x301527={_0x269e9e:0x8a},_0x59dd82=_0x1c95ef,_0x38f1b5=base64UrlToBytes(_0x219443),_0x542810=generateKeystream(_0x4d7883,_0x38593b,_0x38f1b5["length"]),_0x23ed59=new Uint8Array(_0x38f1b5['length']);for(let _0x1b7189=0x0;_0x1b7189<_0x38f1b5["length"];_0x1b7189++)_0x23ed59[_0x1b7189]=_0x38f1b5[_0x1b7189]^_0x542810[_0x1b7189];for(let _0x47945=0x0;_0x47945<MAGIC_BYTES["length"];_0x47945++){if(_0x23ed59[_0x47945]!==MAGIC_BYTES[_0x47945])throw new Error('decrypt\x20failed:\x20bad\x20seed\x20or\x20tampered\x20payload');}const _0x592f55=_0x23ed59["subarray"](MAGIC_BYTES['length']);return utf8BytesToString(_0x592f55);}function getTmdbMeta(_0x143a52,_0x45ac7d){const _0x5552a4={_0x2de402:0x85,_0x1b832d:0x74,_0x5414e9:0xa5,_0x28517b:0x91,_0x5d5fce:0xa0,_0x57011c:0xba};return __async(this,null,function*(){const _0x17f3b6=_0x16fc,_0x349966=_0x45ac7d==='tv'?'tv':"movie",_0xc71d90="https://api.themoviedb.org/3/"+_0x349966+'/'+_0x143a52+"?api_key="+TMDB_API_KEY+'&append_to_response=external_ids',_0x4fe2cf=yield __nvFetch(_0xc71d90,{'skipSizeCheck':!![]});if(!_0x4fe2cf['ok'])return null;const _0x5b2511=yield _0x4fe2cf["json"](),_0x1ab70b=_0x349966==='tv'?_0x5b2511["name"]:_0x5b2511["title"],_0x57a10a=_0x349966==='tv'?_0x5b2511['first_air_date']:_0x5b2511["release_date"],_0x2595b0=_0x57a10a?_0x57a10a["slice"](0x0,0x4):'',_0x2222b6=_0x5b2511["external_ids"]&&_0x5b2511["external_ids"]["imdb_id"]||_0x5b2511["imdb_id"]||'';return{'title':_0x1ab70b,'year':_0x2595b0,'imdbId':_0x2222b6};});}function qualityRank(_0x5a6344){const _0x58fb0d=_0x1c95ef;if(!_0x5a6344)return 0x0;if(/4k/i['test'](_0x5a6344))return 0x870;const _0x54ce0e=parseInt(_0x5a6344,0xa);return Number["isFinite"](_0x54ce0e)?_0x54ce0e:0x0;}function formatBytes(_0x360308){const _0x572abf={_0x38738e:0xa2,_0x23d493:0x97,_0x496641:0xb8,_0x1e5879:0x92,_0x595316:0x8e},_0x37895d=_0x1c95ef;if(!_0x360308)return "Unknown";const _0x242179=0x400,_0x1219fa=["Bytes",'KB','MB','GB','TB'],_0x40f6c5=Math["floor"](Math['log'](_0x360308)/Math["log"](_0x242179));return parseFloat((_0x360308/Math["pow"](_0x242179,_0x40f6c5))["toFixed"](0x2))+'\x20'+_0x1219fa[_0x40f6c5];}var SEGMENT_SAMPLE_SIZE=0x5;function getRealSegmentSize(_0x18911a){const _0x14f173={_0x4ec36f:0x81,_0x48eaaf:0x8b};return __async(this,null,function*(){const _0x35daae=_0x16fc;try{const _0x2c7977=yield __nvFetch(_0x18911a,{'method':'HEAD','headers':HEADERS,'skipSizeCheck':!![]}),_0x1612cc=_0x2c7977['headers']['get']('content-length');if(_0x1612cc)return parseInt(_0x1612cc,0xa);}catch(_0x1e4da8){}try{const _0x37b9c0=yield __nvFetch(_0x18911a,{'headers':__spreadProps(__spreadValues({},HEADERS),{'Range':"bytes=0-1"}),'skipSizeCheck':!![]}),_0xb0d2fe=_0x37b9c0["headers"]['get']("content-range"),_0x31f2e9=_0xb0d2fe&&_0xb0d2fe['match'](/\/(\d+)$/);if(_0x31f2e9)return parseInt(_0x31f2e9[0x1],0xa);}catch(_0x1b77af){}return null;});}function estimateHlsSize(_0x2f2291){return Promise.resolve("Variable");}function getStreams(_0x1c38df,_0x4d3f49,_0x58af4c,_0x90d707){const _0x21a29f={_0x470497:0x8c,_0x1096c1:0x7c,_0x4613dd:0xaf,_0x2717cd:0xb3,_0x39d040:0x9a,_0x1f1fab:0xb5,_0x27dc89:0x9a,_0x47b779:0x9d,_0x248af3:0x7d,_0x4acd2f:0xac};return __async(this,null,function*(){const _0x49e9cc={_0x2d41d9:0x87,_0x2fa432:0x7e,_0x50aca0:0xa2},_0x31616e=_0x16fc;try{let _0x1353d6=_0x1c38df;if(typeof _0x1c38df==='string'&&_0x1c38df["trim"]()['toLowerCase']()['startsWith']('tt')){const _0x2a50cd='https://api.themoviedb.org/3/find/'+_0x1c38df+"?api_key="+TMDB_API_KEY+"&external_source=imdb_id",_0x79d92b=yield(yield __nvFetch(_0x2a50cd,{'skipSizeCheck':!![]}))["json"](),_0x5119a7=_0x4d3f49==='tv'?_0x79d92b["tv_results"]:_0x79d92b["movie_results"];_0x1353d6=_0x5119a7&&_0x5119a7["length"]?_0x5119a7[0x0]['id']:null;if(!_0x1353d6)return[];}_0x1353d6=parseInt(_0x1353d6,0xa);if(!_0x1353d6)return[];const _0x214874=yield getTmdbMeta(_0x1353d6,_0x4d3f49);if(!_0x214874||!_0x214874["title"])return[];const _0x1b29f5=yield getApiHost(),_0x355766=_0x4d3f49==='tv',_0x3599a6=yield __nvFetch(_0x1b29f5+'/seed?mediaId='+_0x1353d6,{'headers':HEADERS,'skipSizeCheck':!![]});if(!_0x3599a6['ok'])return[];const _0x59b103=yield _0x3599a6['json']()["catch"](()=>null);if(!_0x59b103||!_0x59b103['seed'])return[];const _0x4f7d1b=new URLSearchParams({'title':_0x214874['title'],'mediaType':_0x355766?'tv':"movie",'year':_0x214874['year']||'','episodeId':String(_0x355766?_0x90d707||0x1:0x1),'seasonId':String(_0x355766?_0x58af4c||0x1:0x1),'tmdbId':String(_0x1353d6),'imdbId':_0x214874["imdbId"]||'','enc':'2','seed':_0x59b103["seed"]}),_0x3b9cf6=yield __nvFetch(_0x1b29f5+"/cdn/sources-with-title?"+_0x4f7d1b['toString'](),{'headers':HEADERS,'skipSizeCheck':!![]});if(!_0x3b9cf6['ok'])return[];const _0x512e72=yield _0x3b9cf6['text']();let _0x1beafa;try{const _0x491ba3=decryptSourcesPayload(_0x512e72,_0x59b103["seed"],_0x1353d6);_0x1beafa=JSON['parse'](_0x491ba3);}catch(_0x4214b0){return console["error"]("[Cineby] decrypt failed:",_0x4214b0['message']),[];}const _0x103abf=_0x1beafa&&_0x1beafa["sources"]||[];if(!_0x103abf['length'])return[];const _0x3b1fdc=(_0x1beafa&&_0x1beafa["subtitles"]||[])["filter"](_0x48c568=>_0x48c568&&_0x48c568['url'])['map'](_0x3cc3e6=>({'url':_0x3cc3e6['url'],'lang':_0x3cc3e6['lang']||_0x3cc3e6["language"]||"Unknown"})),_0x33247c=yield Promise["all"](_0x103abf['filter'](_0x1785fe=>_0x1785fe&&_0x1785fe["url"])['map'](_0x5c6fdd=>__async(this,null,function*(){const _0xae071d=_0x31616e,_0x5056fb=yield estimateHlsSize(_0x5c6fdd['url']);return{'url':_0x5c6fdd["url"],'quality':_0x5c6fdd['quality']||"Unknown",'title':"Cineby "+(_0x5c6fdd["quality"]||"Unknown"),'name':'Cineby','size':_0x5056fb,'headers':HEADERS,'subtitles':_0x3b1fdc};})));return _0x33247c['sort']((_0x5bb2b1,_0x3d14b6)=>qualityRank(_0x3d14b6["quality"])-qualityRank(_0x5bb2b1['quality'])),_0x33247c;}catch(_0x485693){return console["error"]('[Cineby]',_0x485693),[];}});}typeof module!=="undefined"&&module['exports']?module["exports"]={'getStreams':getStreams}:global['getStreams']=getStreams;

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
  var PROVIDER = "cineby";
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
    var p = fetch(url, opts).then(function (r) {
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
  var __LABEL = 'Cineby';
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
