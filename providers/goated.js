/*
 * nv-plugins goated.js — FULLY DECODED port of the All-in-One-Nuvio provider (4.24.0 merge pass).
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
var _0x4039=function(){return "";};const _0x1b33ca=_0x4039;/*rotation removed*/;var __async=(_0x2da762,_0x229052,_0x21c18c)=>{return new Promise((_0x1ec922,_0x4f0593)=>{const _0x5d0142=_0x4039;var _0x1ee395=_0x163801=>{const _0x150794=_0x4039;try{_0xa01c7b(_0x21c18c["next"](_0x163801));}catch(_0x2e6d1e){_0x4f0593(_0x2e6d1e);}},_0x998c48=_0x4a5ad3=>{const _0x4c4277=_0x4039;try{_0xa01c7b(_0x21c18c["throw"](_0x4a5ad3));}catch(_0x16da00){_0x4f0593(_0x16da00);}},_0xa01c7b=_0x409b2f=>_0x409b2f['done']?_0x1ec922(_0x409b2f["value"]):Promise["resolve"](_0x409b2f['value'])['then'](_0x1ee395,_0x998c48);_0xa01c7b((_0x21c18c=_0x21c18c['apply'](_0x2da762,_0x229052))['next']());});},TMDB_API_KEY='1865f43a0549ca50d341dd9ab8b29f49',DOMAINS_URL='https://raw.githubusercontent.com/sapariyaneel/nuvio-plugin/refs/heads/main/domains.json',FALLBACK_API_HOST='https://api.reallyfast.xyz',HEADERS={'User-Agent':'Mozilla/5.0\x20(Windows\x20NT\x2010.0;\x20Win64;\x20x64)\x20AppleWebKit/537.36\x20(KHTML,\x20like\x20Gecko)\x20Chrome/131.0.0.0\x20Safari/537.36','Referer':'https://goated.cx/','Origin':'https://goated.cx'},cachedDomains=null;function getDomains(){return __async(this,null,function*(){if(cachedDomains)return cachedDomains;try{const _0x3aaf18=yield __nvFetch(DOMAINS_URL,{'skipSizeCheck':!![]});cachedDomains=yield _0x3aaf18['json']();}catch(_0x1c0510){cachedDomains={};}return cachedDomains;});}/*string-table removed*//*decoder removed*/function getApiHost(){const _0x44c4f4={_0x58f4bf:0xca};return __async(this,null,function*(){const _0x36fead=_0x4039,_0x222abf=yield getDomains();return(_0x222abf['reallyfast']||_0x222abf["api.reallyfast.xyz"]||FALLBACK_API_HOST)["replace"](/\/+$/,'');});}function getInvertedSortTag(_0x2a2c91,_0x474312=0xf423f){const _0x4fa28c={_0xb00424:0xda,_0x19ef76:0xd4},_0x2c6692=_0x4039,_0x131907=Math['max'](0x0,parseInt(_0x2a2c91,0xa)||0x0),_0x1eb81b=Math["max"](0x0,_0x474312-_0x131907),_0x5f3333=_0x1eb81b['toString'](0x2)['padStart'](0x14,'0');return _0x5f3333["split"]('')['map'](_0x42e6ed=>_0x42e6ed==='1'?'\ufeff':'​')['join']('');}function getQualityRank(_0xf6dfe4){const _0x643af9={_0x569d45:0xdd,_0x4bb9e5:0xf4},_0x41ec4b=_0x4039,_0x3c0b13=String(_0xf6dfe4||'')['toLowerCase']();if(_0x3c0b13["includes"]("2160")||_0x3c0b13["includes"]('4k')||_0x3c0b13['includes']('uhd'))return 0x4;if(_0x3c0b13["includes"]("1080")||_0x3c0b13["includes"]('fhd')||_0x3c0b13['includes']('fullhd'))return 0x3;if(_0x3c0b13['includes']('720')||_0x3c0b13['includes']('hd'))return 0x2;if(_0x3c0b13['includes']("480")||_0x3c0b13['includes']('sd')||_0x3c0b13['includes']("360"))return 0x1;return 0x0;}function parseSizeToMB(_0x25ae4f){const _0x59827d=_0x4039;if(!_0x25ae4f||_0x25ae4f==='N/A'||_0x25ae4f==='Unknown')return 0x0;const _0x32acbe=String(_0x25ae4f)['match'](/([\d.]+)\s*(GB|MB)/i);if(!_0x32acbe)return 0x0;const _0x8091d1=parseFloat(_0x32acbe[0x1]),_0xc67f30=_0x32acbe[0x2]['toUpperCase']();if(_0xc67f30==='GB')return Math["floor"](_0x8091d1*0x400);if(_0xc67f30==='MB')return Math["floor"](_0x8091d1);return 0x0;}function getResolutionEmoji(_0xa59730){const _0x8d1527={_0xa8c647:0xc6,_0x5731f2:0xdd,_0x5a5a2f:0xec,_0x5317b2:0xfb},_0x192cec=_0x4039,_0x10cc83=String(_0xa59730||'')["toLowerCase"]();if(_0x10cc83['includes']("2160")||_0x10cc83['includes']('4k')||_0x10cc83["includes"]("uhd"))return'🌟\x204K';if(_0x10cc83['includes']('1080')||_0x10cc83["includes"]("fhd"))return "🔥 1080p";if(_0x10cc83['includes']('720')||_0x10cc83['includes']('hd'))return "💎 720p";if(_0x10cc83['includes']("480")||_0x10cc83['includes']('sd'))return'📱\x20480p';return'📺\x20'+(_0xa59730||'1080p');}var SHA256_K=[0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,0xe49b69c1,0xefbe4786,0xfc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x6ca6351,0x14292967,0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2];function utf8Bytes(_0x28d05d){const _0x20ea15={_0x2e56a1:0xcf,_0x1a1f23:0x107,_0x55250b:0x107},_0x43fca=_0x4039,_0x293749=[];for(let _0x138b53=0x0;_0x138b53<_0x28d05d['length'];_0x138b53++){const _0x582021=_0x28d05d["charCodeAt"](_0x138b53);if(_0x582021<0x80)_0x293749["push"](_0x582021);else{if(_0x582021<0x800)_0x293749['push'](0xc0|_0x582021>>0x6,0x80|_0x582021&0x3f);else{if(_0x582021>=0xd800&&_0x582021<=0xdbff&&_0x138b53+0x1<_0x28d05d["length"]){const _0x3b1f48=_0x28d05d['charCodeAt'](_0x138b53+0x1);if(_0x3b1f48>=0xdc00&&_0x3b1f48<=0xdfff){const _0x53401b=0x10000+(_0x582021-0xd800<<0xa)+(_0x3b1f48-0xdc00);_0x293749["push"](0xf0|_0x53401b>>0x12,0x80|_0x53401b>>0xc&0x3f,0x80|_0x53401b>>0x6&0x3f,0x80|_0x53401b&0x3f),_0x138b53++;}else _0x293749["push"](0xe0|_0x582021>>0xc,0x80|_0x582021>>0x6&0x3f,0x80|_0x582021&0x3f);}else _0x293749["push"](0xe0|_0x582021>>0xc,0x80|_0x582021>>0x6&0x3f,0x80|_0x582021&0x3f);}}}return _0x293749;}function sha256Hex(_0x29450a){const _0x27f4b7={_0x17f783:0xed,_0xb86f67:0x107,_0x3efde0:0xf0},_0x4d4751=_0x4039,_0x203c83=utf8Bytes(_0x29450a),_0x49e7b4=_0x203c83["length"]*0x8;_0x203c83["push"](0x80);while(_0x203c83["length"]%0x40!==0x38)_0x203c83["push"](0x0);const _0x4ec930=Math["floor"](_0x49e7b4/0x100000000);_0x203c83['push'](_0x4ec930>>>0x18&0xff,_0x4ec930>>>0x10&0xff,_0x4ec930>>>0x8&0xff,_0x4ec930&0xff),_0x203c83["push"](_0x49e7b4>>>0x18&0xff,_0x49e7b4>>>0x10&0xff,_0x49e7b4>>>0x8&0xff,_0x49e7b4&0xff);let _0x309b64=0x6a09e667,_0x4a1cc5=0xbb67ae85,_0x5937e2=0x3c6ef372,_0x35a6e7=0xa54ff53a,_0x2cdec8=0x510e527f,_0x45c5b4=0x9b05688c,_0x4b573b=0x1f83d9ab,_0x43dc07=0x5be0cd19;const _0x43a875=new Array(0x40);for(let _0x441e87=0x0;_0x441e87<_0x203c83["length"];_0x441e87+=0x40){for(let _0x29b79a=0x0;_0x29b79a<0x10;_0x29b79a++){const _0x3d1336=_0x441e87+_0x29b79a*0x4;_0x43a875[_0x29b79a]=(_0x203c83[_0x3d1336]<<0x18|_0x203c83[_0x3d1336+0x1]<<0x10|_0x203c83[_0x3d1336+0x2]<<0x8|_0x203c83[_0x3d1336+0x3])>>>0x0;}for(let _0x5c542e=0x10;_0x5c542e<0x40;_0x5c542e++){const _0x260146=_0x43a875[_0x5c542e-0xf],_0x4ab913=_0x43a875[_0x5c542e-0x2],_0x3b8a79=((_0x260146>>>0x7|_0x260146<<0x19)^(_0x260146>>>0x12|_0x260146<<0xe)^_0x260146>>>0x3)>>>0x0,_0x569a36=((_0x4ab913>>>0x11|_0x4ab913<<0xf)^(_0x4ab913>>>0x13|_0x4ab913<<0xd)^_0x4ab913>>>0xa)>>>0x0;_0x43a875[_0x5c542e]=(_0x43a875[_0x5c542e-0x10]+_0x3b8a79>>>0x0)+(_0x43a875[_0x5c542e-0x7]+_0x569a36>>>0x0)>>>0x0;}let _0x18c026=_0x309b64,_0x14b527=_0x4a1cc5,_0x571622=_0x5937e2,_0xd74bdd=_0x35a6e7,_0x25b40c=_0x2cdec8,_0x4778b4=_0x45c5b4,_0x4b108b=_0x4b573b,_0x3df590=_0x43dc07;for(let _0x3d409c=0x0;_0x3d409c<0x40;_0x3d409c++){const _0x79b514=((_0x25b40c>>>0x6|_0x25b40c<<0x1a)^(_0x25b40c>>>0xb|_0x25b40c<<0x15)^(_0x25b40c>>>0x19|_0x25b40c<<0x7))>>>0x0,_0x24fef=(_0x25b40c&_0x4778b4^~_0x25b40c&_0x4b108b)>>>0x0,_0x1e38b3=((_0x3df590+_0x79b514>>>0x0)+_0x24fef>>>0x0)+(SHA256_K[_0x3d409c]+_0x43a875[_0x3d409c]>>>0x0)>>>0x0,_0x37f98d=((_0x18c026>>>0x2|_0x18c026<<0x1e)^(_0x18c026>>>0xd|_0x18c026<<0x13)^(_0x18c026>>>0x16|_0x18c026<<0xa))>>>0x0,_0x18659c=(_0x18c026&_0x14b527^_0x18c026&_0x571622^_0x14b527&_0x571622)>>>0x0,_0x2cf4e5=_0x37f98d+_0x18659c>>>0x0;_0x3df590=_0x4b108b,_0x4b108b=_0x4778b4,_0x4778b4=_0x25b40c,_0x25b40c=_0xd74bdd+_0x1e38b3>>>0x0,_0xd74bdd=_0x571622,_0x571622=_0x14b527,_0x14b527=_0x18c026,_0x18c026=_0x1e38b3+_0x2cf4e5>>>0x0;}_0x309b64=_0x309b64+_0x18c026>>>0x0,_0x4a1cc5=_0x4a1cc5+_0x14b527>>>0x0,_0x5937e2=_0x5937e2+_0x571622>>>0x0,_0x35a6e7=_0x35a6e7+_0xd74bdd>>>0x0,_0x2cdec8=_0x2cdec8+_0x25b40c>>>0x0,_0x45c5b4=_0x45c5b4+_0x4778b4>>>0x0,_0x4b573b=_0x4b573b+_0x4b108b>>>0x0,_0x43dc07=_0x43dc07+_0x3df590>>>0x0;}const _0x34e985=[_0x309b64,_0x4a1cc5,_0x5937e2,_0x35a6e7,_0x2cdec8,_0x45c5b4,_0x4b573b,_0x43dc07];let _0x17cb7d='';for(const _0x7d5b4b of _0x34e985)_0x17cb7d+=('00000000'+_0x7d5b4b["toString"](0x10))["slice"](-0x8);return _0x17cb7d;}function solveProofOfWork(_0x22aa33){const _0x51daec={_0x20e18e:0xf6,_0x11a15f:0xdf};return __async(this,null,function*(){const _0x5c2dab=_0x4039,_0x3a9590=yield __nvFetch(_0x22aa33+'/api/challenge',{'skipSizeCheck':!![]});if(!_0x3a9590['ok'])throw new Error("failed to fetch PoW challenge");const {challenge:_0x41f147,difficulty:_0x31b6cd}=yield _0x3a9590["json"](),_0xd9180a='0'["repeat"](_0x31b6cd);for(let _0x430bbb=0x0;_0x430bbb<0x4c4b40;_0x430bbb++){const _0x81efe5=sha256Hex(_0x41f147+_0x430bbb);if(_0x81efe5["startsWith"](_0xd9180a))return{'challenge':_0x41f147,'nonce':String(_0x430bbb)};}throw new Error('PoW\x20solve\x20timed\x20out');});}function getTmdbRuntimeSeconds(_0x56d92a,_0x41d176,_0x56c288,_0x39bda7){const _0x536991={_0x4d9a4d:0x106};return __async(this,null,function*(){const _0x375f30=_0x4039;var _0x19086a;try{const _0x4048fc=_0x41d176==='tv'?'https://api.themoviedb.org/3/tv/'+_0x56d92a+'/season/'+(_0x56c288||0x1)+'/episode/'+(_0x39bda7||0x1)+'?api_key='+TMDB_API_KEY:'https://api.themoviedb.org/3/movie/'+_0x56d92a+"?api_key="+TMDB_API_KEY,_0xc2ef09=yield __nvFetch(_0x4048fc,{'skipSizeCheck':!![]});if(!_0xc2ef09['ok'])return null;const _0x368457=yield _0xc2ef09["json"](),_0xb02698=_0x368457["runtime"]||((_0x19086a=_0x368457['episode_run_time'])==null?void 0x0:_0x19086a[0x0]);return _0xb02698?_0xb02698*0x3c:null;}catch(_0x3c1c06){return null;}});}function getTmdbMetadata(_0x153468,_0x1d02d5){const _0x2d445b={_0x1bfb95:0xf5};return __async(this,null,function*(){const _0x9d440b=_0x4039;try{const _0x5c723b=_0x1d02d5==='tv'?'tv':"movie",_0x5a60be=yield __nvFetch("https://api.themoviedb.org/3/"+_0x5c723b+'/'+_0x153468+'?api_key='+TMDB_API_KEY,{'skipSizeCheck':!![]}),_0x59fa4a=yield _0x5a60be['json'](),_0x15f145=_0x5c723b==='tv'?_0x59fa4a['name']:_0x59fa4a["title"],_0x4c001a=_0x5c723b==='tv'?_0x59fa4a['first_air_date']:_0x59fa4a['release_date'],_0x362030=_0x4c001a?_0x4c001a['split']('-')[0x0]:'';return{'title':_0x15f145,'year':_0x362030};}catch(_0x1ba5a8){return{'title':'','year':''};}});}function formatBytes(_0x34a642){const _0x2b746e={_0x15f47a:0xf0},_0x36ccad=_0x4039;if(!_0x34a642)return'Unknown';const _0x1d08ce=0x400,_0x37a350=['Bytes','KB','MB','GB','TB'],_0xe08084=Math["floor"](Math['log'](_0x34a642)/Math["log"](_0x1d08ce));return parseFloat((_0x34a642/Math['pow'](_0x1d08ce,_0xe08084))['toFixed'](0x2))+'\x20'+_0x37a350[_0xe08084];}function resolveUrl(_0x5332c2,_0x7ad0a5){try{return new URL(_0x5332c2,_0x7ad0a5)['toString']();}catch(_0x13094f){return _0x5332c2;}}function parseMasterPlaylist(_0x1b89b7,_0x2666ba){const _0x3448c7={_0x271b9c:0xd4,_0x3a128b:0xed,_0x498692:0xdf,_0x217acc:0xc5,_0x3bb16b:0xdf,_0x4dbde8:0xd0},_0x757f44=_0x4039,_0x44ad1c=_0x1b89b7["split"]('\x0a')['map'](_0x34c335=>_0x34c335['trim']()),_0x12c380=[];let _0x16deba=null;for(let _0x4adb57=0x0;_0x4adb57<_0x44ad1c["length"];_0x4adb57++){if(_0x44ad1c[_0x4adb57]["startsWith"]("#EXT-X-MEDIA")&&_0x44ad1c[_0x4adb57]['includes']("TYPE=AUDIO")&&!_0x16deba){const _0x21bb41=_0x44ad1c[_0x4adb57]["match"](/URI="([^"]+)"/),_0x2c75c8=/DEFAULT=YES/['test'](_0x44ad1c[_0x4adb57]);if(_0x21bb41&&(_0x2c75c8||!_0x16deba))_0x16deba=resolveUrl(_0x21bb41[0x1],_0x2666ba);continue;}if(!_0x44ad1c[_0x4adb57]["startsWith"]("#EXT-X-STREAM-INF"))continue;const _0xfcb2eb=_0x44ad1c[_0x4adb57],_0x563f1c=_0x44ad1c[_0x4adb57+0x1];if(!_0x563f1c||_0x563f1c['startsWith']('#'))continue;const _0x50c42f=_0xfcb2eb['match'](/BANDWIDTH=(\d+)/),_0x356750=_0xfcb2eb['match'](/RESOLUTION=(\d+)x(\d+)/),_0x306c0b=_0x50c42f?parseInt(_0x50c42f[0x1],0xa):0x0,_0x5596d2=_0x356750?parseInt(_0x356750[0x2],0xa):0x0;_0x12c380["push"]({'url':resolveUrl(_0x563f1c,_0x2666ba),'bandwidth':_0x306c0b,'height':_0x5596d2});}return{'variants':_0x12c380,'defaultAudioUrl':_0x16deba};}function getAudioBitrateBps(_0x38a0a4){return __async(this,null,function*(){const _0x598107=_0x4039;if(!_0x38a0a4)return 0x0;try{const _0x408456=yield(yield __nvFetch(_0x38a0a4,{'skipSizeCheck':!![]}))["text"](),_0x1480cf=_0x408456["match"](/#EXT-X-BITRATE:(\d+)/);return _0x1480cf?parseInt(_0x1480cf[0x1],0xa)*0x3e8:0x0;}catch(_0x53942d){return 0x0;}});}function qualityLabelFromHeight(_0x1ce66f){const _0x3dbffd={_0x584090:0xd8},_0x143545=_0x4039;if(_0x1ce66f>=0x7d0)return'4K';if(_0x1ce66f<=0x0)return "Unknown";return _0x1ce66f+'p';}function makeStream(_0x1c3be6,_0x1709c4,_0x49a2b6,_0x175c9f,_0x5677d7,_0x4d1a90,_0x20c0aa,_0x3f5d3b,_0x1b7b38){const _0x1b24b6={_0xa61978:0xe2,_0x2c4a2c:0x100,_0xf2e5b4:0xee},_0x4b978f=_0x4039,_0x246b8f=getQualityRank(_0x1709c4),_0x1e97fa=parseSizeToMB(_0x49a2b6),_0x58de96=getInvertedSortTag(_0x246b8f*0x186a0+_0x1e97fa,0xf423f),_0x10ab98=getResolutionEmoji(_0x1709c4),_0x2012d9=(_0x175c9f||'')['replace'](/[^a-zA-Z0-9]/g,'.'),_0x12ce7c=_0x4d1a90==='tv',_0x3e4a6c=_0x20c0aa||0x1,_0x1d95a3=_0x3f5d3b||0x1,_0x5b5af4=_0x12ce7c?_0x2012d9+'.S'+String(_0x3e4a6c)["padStart"](0x2,'0')+'E'+String(_0x1d95a3)["padStart"](0x2,'0')+'.'+_0x1709c4+'.WEB-DL.Multi-Audio.HEVC.AAC.MKV.MSubs':_0x2012d9+'.'+(_0x5677d7||'2026')+'.'+_0x1709c4+'.WEB-DL.Multi-Audio.HEVC.AAC.MKV.MSubs',_0x4ecb79=_0x12ce7c?"🎬 "+_0x175c9f+(_0x5677d7?'\x20('+_0x5677d7+')':'')+" | S"+_0x3e4a6c+'E'+_0x1d95a3:'🎬\x20'+_0x175c9f+(_0x5677d7?'\x20('+_0x5677d7+')':''),_0x12b1ea=_0x10ab98+'\x20|\x20🗣️\x20Multi-Audio\x20|\x20💾\x20'+_0x49a2b6,_0x477f1f="🎞️ MKV | ✨ HEVC | 🎧 AAC",_0x5094b8="🌐 Goated | 📥 WEB-DL",_0x515db0=_0x5b5af4,_0x48dc65=_0x58de96+'Goated\x20•\x20'+_0x1709c4+" • Multi-Audio",_0x4b15e1=[_0x4ecb79,_0x12b1ea,_0x477f1f,_0x5094b8,_0x515db0]['join']('\x0a');return{'qualityRank':_0x246b8f,'sizeInMB':_0x1e97fa,'data':{'name':_0x48dc65,'title':_0x4b15e1,'size':_0x4b15e1,'description':_0x4b15e1,'url':_0x1c3be6,'headers':HEADERS,'subtitles':_0x1b7b38,'behaviorHints':{'notWebReady':!![],'proxyHeaders':{'request':HEADERS}}}};}function getStreams(_0x2803da,_0x170db3,_0x40fb51,_0x166df6){const _0x4908a4={_0x144f4e:0xcc,_0x406212:0x106,_0x53cc0c:0xd9,_0x35ca18:0xe7,_0x45f55b:0xdb,_0x4ac7c4:0xc4,_0x3d31bc:0xf6,_0x16621d:0xc1};return __async(this,null,function*(){const _0x2fb004=_0x4039;try{let _0xb5d15a=_0x2803da;if(typeof _0x2803da==="string"&&_0x2803da["trim"]()['toLowerCase']()['startsWith']('tt')){const _0x25b574='https://api.themoviedb.org/3/find/'+_0x2803da+"?api_key="+TMDB_API_KEY+'&external_source=imdb_id',_0x585cf4=yield(yield __nvFetch(_0x25b574,{'skipSizeCheck':!![]}))['json'](),_0x4161c3=_0x170db3==='tv'?_0x585cf4["tv_results"]:_0x585cf4["movie_results"];_0xb5d15a=_0x4161c3&&_0x4161c3['length']?_0x4161c3[0x0]['id']:null;if(!_0xb5d15a)return[];}_0xb5d15a=parseInt(_0xb5d15a,0xa);if(!_0xb5d15a)return[];const {title:_0x50243c,year:_0x43c633}=yield getTmdbMetadata(_0xb5d15a,_0x170db3),_0x551964=yield getApiHost(),_0x3441f0=_0x170db3==='tv',_0xba2656=yield solveProofOfWork(_0x551964),_0x29bf91={'mediaType':_0x3441f0?'tv':"movie",'id':String(_0xb5d15a),'challenge':_0xba2656["challenge"],'nonce':_0xba2656["nonce"]};_0x3441f0&&(_0x29bf91['season']=_0x40fb51||0x1,_0x29bf91["episode"]=_0x166df6||0x1);const _0x18f532=yield __nvFetch(_0x551964+'/api/resolve',{'method':'POST','headers':{'Content-Type':"application/json"},'body':JSON['stringify'](_0x29bf91),'skipSizeCheck':!![]});if(!_0x18f532['ok'])return[];const _0x3b8073=yield _0x18f532["json"]()["catch"](()=>null);if(!_0x3b8073||!_0x3b8073["url"])return[];const _0x48487b=yield __nvFetch(_0x3b8073["url"],{'skipSizeCheck':!![]});if(!_0x48487b['ok'])return[];const _0x521b11=yield _0x48487b["text"](),{variants:_0x61ce58,defaultAudioUrl:_0x492a71}=parseMasterPlaylist(_0x521b11,_0x3b8073['url']);if(!_0x61ce58['length'])return[];const _0x38d4ad=_0x61ce58['slice']()['sort']((_0x27f93a,_0x1253e0)=>_0x1253e0['height']-_0x27f93a["height"])[0x0],[_0x294a70,_0x5820c6]=yield Promise['all']([getTmdbRuntimeSeconds(_0xb5d15a,_0x170db3,_0x40fb51,_0x166df6),getAudioBitrateBps(_0x492a71)]);let _0x5c2976=[];try{const _0x11b244=yield solveProofOfWork(_0x551964),_0x39e5fc={'mediaType':_0x3441f0?'tv':'movie','id':String(_0xb5d15a),'challenge':_0x11b244['challenge'],'nonce':_0x11b244['nonce']};_0x3441f0&&(_0x39e5fc['season']=_0x40fb51||0x1,_0x39e5fc['episode']=_0x166df6||0x1);const _0x2e770c=yield __nvFetch(_0x551964+'/api/subtitles',{'method':'POST','headers':{'Content-Type':"application/json"},'body':JSON["stringify"](_0x39e5fc),'skipSizeCheck':!![]});if(_0x2e770c['ok']){const _0x49bd95=yield _0x2e770c["json"]()['catch'](()=>null);_0x5c2976=(_0x49bd95&&_0x49bd95["subtitles"]||[])["filter"](_0x2f036c=>_0x2f036c&&_0x2f036c['url'])['map'](_0x524a68=>({'url':_0x524a68['url'],'lang':_0x524a68["label"]||_0x524a68['language']||"Unknown"}));}}catch(_0x195de1){}const _0x2b8227=_0x38d4ad['bandwidth']+_0x5820c6,_0x352221=qualityLabelFromHeight(_0x38d4ad["height"]),_0x44b834=_0x294a70?formatBytes(_0x2b8227*_0x294a70/0x8):'Unknown',_0x2851b0=makeStream(_0x3b8073['url'],_0x352221,_0x44b834,_0x50243c||'Unknown\x20Title',_0x43c633||'2026',_0x170db3,_0x40fb51,_0x166df6,_0x5c2976);return[_0x2851b0['data']];}catch(_0x1f702a){return console['error']('[Goated]',_0x1f702a),[];}});}typeof module!=="undefined"&&module['exports']?module['exports']={'getStreams':getStreams}:global["getStreams"]=getStreams;

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
  var PROVIDER = "goated";
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
