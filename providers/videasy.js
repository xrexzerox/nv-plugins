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
/* nv-plugins videasy.js v2.2.0 (pack 4.33.0, 2026-09-13): device-timeout fix - the 10-server race widened 6.8s -> 9s and the hard tail cap 12s -> 20s: on mobile networks TMDB+seed+servers exceeded 12s, the tail returned [], and the sheet showed nothing. */
/* ============================================================
 * AIO-EXACT DECODE (2026-09-13) - fully deobfuscated from
 * All-in-One-Nuvio upstream, all string-table references resolved
 * to literals, syntax-checked, live-verified against upstream.
 * Replaces the previous port whose extraction returned 0 rows.
 * ============================================================ */
const _0xa7424a=_0x4a66;(function(_0x589b66,_0x59d20c){const _0x4878ef={_0x38b690:0x1f7,_0x4e863a:0x1ce,_0x30b9de:0x201,_0x455218:0x1e4,_0x59bb01:0x1c3,_0x4d4d1a:0x1f6},_0x301657=_0x4a66,_0x375cd2=_0x589b66();while(!![]){try{const _0x5c5cc4=parseInt("610275EIaBFH")/0x1+-parseInt("4kBbEWr")/0x2*(parseInt("117783YZEjqA")/0x3)+-parseInt("2528252xiHoGX")/0x4+-parseInt("50KxoDnm")/0x5*(-parseInt("472200XtMynY")/0x6)+parseInt("1583673eKGKIB")/0x7+parseInt("8jeKnmt")/0x8*(parseInt("999396GUvxlt")/0x9)+parseInt("18940CFIJDg")/0xa*(-parseInt("2343qNMELO")/0xb);if(_0x5c5cc4===_0x59d20c)break;else _0x375cd2['push'](_0x375cd2['shift']());}catch(_0x21e459){_0x375cd2['push'](_0x375cd2['shift']());}}}(_0x429a,0x97807));var __async=(_0xd0c07d,_0x340765,_0x2fa615)=>{return new Promise((_0x5f3661,_0x15e11c)=>{const _0x119019=_0x4a66;var _0x24bf8e=_0x52b38a=>{const _0x267aa3=_0x4a66;try{_0x27eb35(_0x2fa615["next"](_0x52b38a));}catch(_0x275c10){_0x15e11c(_0x275c10);}},_0x3d784d=_0x436a1f=>{try{_0x27eb35(_0x2fa615['throw'](_0x436a1f));}catch(_0x5dca38){_0x15e11c(_0x5dca38);}},_0x27eb35=_0x516626=>_0x516626["done"]?_0x5f3661(_0x516626["value"]):Promise["resolve"](_0x516626["value"])["then"](_0x24bf8e,_0x3d784d);_0x27eb35((_0x2fa615=_0x2fa615['apply'](_0xd0c07d,_0x340765))["next"]());});},TMDB_API_KEY="439c478a771f35c05022f9feabcca01c",TMDB_BASE_URL="https://api.themoviedb.org/3",WINGS_API_BASE="https://api.speedracelight.com",USER_AGENT="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",REQUEST_HEADERS={'User-Agent':USER_AGENT,'Accept':"*/*",'Origin':"https://www.vidking.net",'Referer':"https://www.vidking.net/",'Cache-Control':'no-cache,\x20no-store,\x20must-revalidate','Pragma':'no-cache','Expires':'0'},SERVERS={'Hydrogen':{'path':"cdn/sources-with-title"},'Titanium':{'path':"tejo/sources-with-title"},'Oxygen':{'path':"neon2/sources-with-title"},'Lithium':{'path':'downloader2/sources-with-title'},'Krypton':{'path':"ym/sources-with-title"},'Carbon':{'path':"mb-flix/sources-with-title"},'Aluminium':{'path':'lamovie/sources-with-title'},'Nitrogen':{'path':"m4uhd/sources-with-title"},'Neon':{'path':'superflix/sources-with-title'},'Helium':{'path':"1movies/sources-with-title"}},jl=[0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174],Tf=[0x67452301,0xefcdab89,0x98badcfe,0x10325476],Js=0x3d,_f=0x8,ms=0x9e3779b9,Ys=[0x6d,0x76,0x6d,0x31],Sf=_0x37e181=>(_0x37e181*(_0x37e181+0x1)&0x1)===0x0,bf=_0x391c9f=>(_0x391c9f*(_0x391c9f+0x1)&0x1)===0x1;function ui(_0x55d008){const _0x59f141=_0xa7424a;return _0x55d008>>>=0x0,_0x55d008^=_0x55d008>>>0x10,_0x55d008=Math['imul'](_0x55d008,0x85ebca6b)>>>0x0,_0x55d008^=_0x55d008>>>0xd,_0x55d008=Math["imul"](_0x55d008,0xc2b2ae35)>>>0x0,_0x55d008^=_0x55d008>>>0x10,_0x55d008>>>0x0;}function ps(_0x347f79,_0x7edf3f){return _0x347f79>>>=0x0,_0x7edf3f&=0x1f,_0x7edf3f===0x0?_0x347f79>>>0x0:(_0x347f79<<_0x7edf3f|_0x347f79>>>0x20-_0x7edf3f)>>>0x0;}function If(_0x1f22c0){const _0x287fb3={_0x298dcc:0x221,_0x363fe6:0x1fe},_0x7e3be0=_0xa7424a;let _0xe6f21=Tf[0x0]>>>0x0;for(let _0x271667=0x0;_0x271667<_0x1f22c0['length'];_0x271667++){_0xe6f21=ps((_0xe6f21^Math["imul"](_0x1f22c0["charCodeAt"](_0x271667),jl[_0x271667&0xf]))>>>0x0,0x5);}return ui(_0xe6f21);}function Af(_0x343e78){const _0x1e8b40=_0xa7424a,_0x462795=new Array(0x100);for(let _0x2202f5=0x0;_0x2202f5<0x100;_0x2202f5++)_0x462795[_0x2202f5]=_0x2202f5;let _0x3654f8=0x0;for(let _0x1593a5=0x0;_0x1593a5<0x100;_0x1593a5++){_0x3654f8=_0x3654f8+_0x462795[_0x1593a5]+_0x343e78["charCodeAt"](_0x1593a5%_0x343e78["length"])&0xff;const _0x393c75=_0x462795[_0x1593a5];_0x462795[_0x1593a5]=_0x462795[_0x3654f8],_0x462795[_0x3654f8]=_0x393c75;}return _0x462795;}function wf(_0x302fd9){const _0x3063e2={_0x324930:0x221},_0x58f133=_0xa7424a;let _0x37b6da=0x811c9dc5;for(let _0x4f989f=0x0;_0x4f989f<_0x302fd9['length'];_0x4f989f++){_0x37b6da=Math["imul"](_0x37b6da^_0x302fd9['charCodeAt'](_0x4f989f),0x1000193)>>>0x0;}return ui(_0x37b6da);}function vf(_0xc8001c,_0x4b2aa1,_0x41cdd8){return((_0xc8001c^_0x4b2aa1)>>>0x0|(_0xc8001c&_0x4b2aa1&_0x41cdd8)>>>0x0)>>>0x0;}function Nf(_0x631558,_0x42b3cc){if(bf(_0x631558['length']))return{'S':Af(_0x631558),'acc':If(_0x631558)};const _0x2cbc01=new Array(Js);let _0x2bb9da=ui(wf(_0x631558)^ui(_0x42b3cc>>>0x0^ms))>>>0x0;for(let _0xfb5e8d=0x0;_0xfb5e8d<_f;_0xfb5e8d++){if(Sf(_0xfb5e8d)){const _0x1a78ae=_0x2bb9da%Js;_0x2bb9da=ps(_0x2bb9da+ms>>>0x0,0x7+(_0xfb5e8d&0x7)),_0x2cbc01[_0x1a78ae]=(_0x2bb9da^ui(_0x2bb9da))>>>0x0,_0x2bb9da=ui(_0x2bb9da+_0x1a78ae>>>0x0);}else _0x2cbc01[_0xfb5e8d]=jl[_0xfb5e8d&0xf];}return{'S':_0x2cbc01,'acc':ui(_0x2bb9da^0xa5a5a5a5)>>>0x0};}function Rf(_0xea83ed,_0x405e02){const _0xf4349d={_0x24af3b:0x203},_0x11d34e=_0xa7424a,_0x15d800=_0xea83ed['S'];let _0x4ac929=_0xea83ed["acc"];const _0x1a9656=_0x4ac929%Js,_0x188ab4=0x0-+(_0x1a9656 in _0x15d800),_0x1d77d1=_0x15d800[_0x1a9656]>>>0x0,_0x3b743f=Math['imul'](ms,_0x405e02+0x1)>>>0x0;let _0x57c0b2=vf(_0x4ac929,(_0x1d77d1^_0x3b743f)>>>0x0,_0x188ab4);return _0x57c0b2=(ps(_0x57c0b2+_0x4ac929>>>0x0,_0x1a9656&0x1f)^ps(_0x4ac929,Math['imul'](_0x1a9656,0x7)&0x1f))>>>0x0,_0x4ac929=ui(_0x57c0b2+ms>>>0x0),_0x15d800[_0x1a9656]=_0x4ac929>>>0x0,_0xea83ed['acc']=_0x4ac929,_0x4ac929>>>0x0;}function Cf(_0x121578,_0x2c5249,_0x17eb78){const _0x3ddc8a=Nf(_0x121578,_0x2c5249),_0x442b0e=new Uint8Array(_0x17eb78);let _0x396470=0x0;for(let _0x2f7e65=0x0;_0x2f7e65<_0x17eb78;){const _0x402e74=Rf(_0x3ddc8a,_0x396470++);_0x442b0e[_0x2f7e65++]=_0x402e74&0xff,_0x2f7e65<_0x17eb78&&(_0x442b0e[_0x2f7e65++]=_0x402e74>>>0x8&0xff),_0x2f7e65<_0x17eb78&&(_0x442b0e[_0x2f7e65++]=_0x402e74>>>0x10&0xff),_0x2f7e65<_0x17eb78&&(_0x442b0e[_0x2f7e65++]=_0x402e74>>>0x18&0xff);}return _0x442b0e;}function decodeBase64(_0x110a95){const _0x4e0652={_0x2dac4a:0x222,_0x51522a:0x227},_0x1233dc=_0xa7424a,_0x470eb7='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/',_0x2666c3=_0x110a95["replace"](/-/g,'+')["replace"](/_/g,'/')["replace"](/=+$/,''),_0x202116=_0x2666c3['length'],_0x2bfde0=new Uint8Array(Math['floor'](_0x202116*0.75));let _0x5ac383=0x0;for(let _0x38cd70=0x0;_0x38cd70<_0x202116;_0x38cd70+=0x4){const _0xce8190=_0x470eb7["indexOf"](_0x2666c3[_0x38cd70]),_0x245cc4=_0x470eb7["indexOf"](_0x2666c3[_0x38cd70+0x1]||'A'),_0x4163a0=_0x470eb7['indexOf'](_0x2666c3[_0x38cd70+0x2]||'A'),_0x33022f=_0x470eb7["indexOf"](_0x2666c3[_0x38cd70+0x3]||'A');_0x2bfde0[_0x5ac383++]=_0xce8190<<0x2|_0x245cc4>>0x4;if(_0x38cd70+0x2<_0x202116)_0x2bfde0[_0x5ac383++]=(_0x245cc4&0xf)<<0x4|_0x4163a0>>0x2;if(_0x38cd70+0x3<_0x202116)_0x2bfde0[_0x5ac383++]=(_0x4163a0&0x3)<<0x6|_0x33022f;}return _0x2bfde0;}function xf(_0x158e23){return decodeBase64(_0x158e23);}function decryptWingsDatabase(_0x122b4d,_0x55054e,_0x55103e){const _0x5942c9={_0x5b2ddf:0x1bf,_0x3d5209:0x1e8},_0x48f50b=_0xa7424a,_0x450fdb=xf(_0x122b4d),_0x5ae58b=Cf(_0x55054e,_0x55103e,_0x450fdb['length']);for(let _0x29cd02=0x0;_0x29cd02<_0x450fdb["length"];_0x29cd02++)_0x450fdb[_0x29cd02]^=_0x5ae58b[_0x29cd02];for(let _0x2d4c0d=0x0;_0x2d4c0d<Ys["length"];_0x2d4c0d++){if(_0x450fdb[_0x2d4c0d]!==Ys[_0x2d4c0d])throw new Error('decrypt\x20failed:\x20bad\x20seed\x20or\x20tampered\x20payload');}let _0x5eaced='';const _0x4ae975=_0x450fdb['subarray'](Ys['length']);for(let _0x339204=0x0;_0x339204<_0x4ae975['length'];){const _0x677c7e=_0x4ae975[_0x339204++];if(_0x677c7e<0x80)_0x5eaced+=String["fromCharCode"](_0x677c7e);else{if(_0x677c7e>0xbf&&_0x677c7e<0xe0)_0x5eaced+=String['fromCharCode']((_0x677c7e&0x1f)<<0x6|_0x4ae975[_0x339204++]&0x3f);else _0x677c7e>0xdf&&_0x677c7e<0xf0?_0x5eaced+=String['fromCharCode']((_0x677c7e&0xf)<<0xc|(_0x4ae975[_0x339204++]&0x3f)<<0x6|_0x4ae975[_0x339204++]&0x3f):_0x5eaced+=String['fromCharCode']((_0x677c7e&0x7)<<0x12|(_0x4ae975[_0x339204++]&0x3f)<<0xc|(_0x4ae975[_0x339204++]&0x3f)<<0x6|_0x4ae975[_0x339204++]&0x3f);}}return _0x5eaced;}function fetchMediaDetails(_0x5c8a2b,_0x4694a3,_0x3947bd,_0x42bb6e){const _0x4dd6a5={_0x5865a6:0x20f,_0x470cf7:0x222,_0x59c357:0x1c8,_0x2fb6e1:0x1f8,_0x372a14:0x206,_0x7fdfa2:0x1d8,_0x300906:0x1d7,_0x570a71:0x202,_0x2888fe:0x1e2};return __async(this,null,function*(){const _0x14b013=_0x4a66;var _0x2e90ea;let _0x821299=_0x4694a3==='tv'?"45 min":'90\x20min';try{const _0x15806e=_0x4694a3==='tv'?'tv':'movie',_0x2b71a6=String(_0x5c8a2b)["replace"](/\D/g,''),_0x5d776e=TMDB_BASE_URL+'/'+_0x15806e+'/'+_0x2b71a6+"?api_key="+TMDB_API_KEY+"&append_to_response=external_ids",_0x2fbf32=yield fetch(_0x5d776e,{'headers':{'User-Agent':REQUEST_HEADERS['User-Agent'],'Accept':"application/json"}});if(!_0x2fbf32['ok'])throw new Error("TMDB HTTP "+_0x2fbf32['status']);const _0x12de86=yield _0x2fbf32['json']();let _0x4cebc4=_0x821299;if(_0x4694a3==="movie"&&_0x12de86['runtime'])_0x4cebc4=_0x12de86['runtime']+" min";else{if(_0x4694a3==='tv'&&_0x3947bd!=null&&_0x42bb6e!=null){const _0x6695aa=TMDB_BASE_URL+'/tv/'+_0x2b71a6+"/season/"+_0x3947bd+'/episode/'+_0x42bb6e+'?api_key='+TMDB_API_KEY,_0x538a32=yield fetch(_0x6695aa);if(_0x538a32['ok']){const _0x4fbdb1=yield _0x538a32["json"]();if(_0x4fbdb1&&_0x4fbdb1['runtime'])_0x4cebc4=_0x4fbdb1["runtime"]+" min";else _0x12de86["episode_run_time"]&&_0x12de86["episode_run_time"]["length"]>0x0&&(_0x4cebc4=_0x12de86['episode_run_time'][0x0]+'\x20min');}}}return{'title':_0x4694a3==='tv'?_0x12de86["name"]:_0x12de86['title'],'year':(_0x4694a3==='tv'?_0x12de86['first_air_date']:_0x12de86["release_date"]||'')["substring"](0x0,0x4),'imdbId':((_0x2e90ea=_0x12de86['external_ids'])==null?void 0x0:_0x2e90ea['imdb_id'])||null,'mediaType':_0x4694a3,'duration':_0x4cebc4};}catch(_0xd5dfc6){return console['error']('[VidEasy]\x20TMDB\x20details\x20fetch\x20error:\x20'+_0xd5dfc6['message']),{'title':_0x4694a3==='tv'?"Unknown TV Show":'Unknown\x20Movie','year':'N/A','imdbId':null,'mediaType':_0x4694a3,'duration':_0x821299};}});}function _0x4a66(_0x4f41e2,_0x418fb1){_0x4f41e2=_0x4f41e2-0x1be;const _0x429a76=_0x429a();let _0x4a6607=_0x429a76[_0x4f41e2];if(_0x4a66['TDSDIZ']===undefined){var _0x546b1b=function(_0x458c00){const _0x764488='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=';let _0xd0c07d='',_0x340765='';for(let _0x2fa615=0x0,_0x5f3661,_0x15e11c,_0x24bf8e=0x0;_0x15e11c=_0x458c00['charAt'](_0x24bf8e++);~_0x15e11c&&(_0x5f3661=_0x2fa615%0x4?_0x5f3661*0x40+_0x15e11c:_0x15e11c,_0x2fa615++%0x4)?_0xd0c07d+=String['fromCharCode'](0xff&_0x5f3661>>(-0x2*_0x2fa615&0x6)):0x0){_0x15e11c=_0x764488['indexOf'](_0x15e11c);}for(let _0x3d784d=0x0,_0x27eb35=_0xd0c07d['length'];_0x3d784d<_0x27eb35;_0x3d784d++){_0x340765+='%'+('00'+_0xd0c07d['charCodeAt'](_0x3d784d)['toString'](0x10))['slice'](-0x2);}return decodeURIComponent(_0x340765);};_0x4a66['sGoAhR']=_0x546b1b,_0x4a66['YDcjRA']={},_0x4a66['TDSDIZ']=!![];}const _0x154d35=_0x429a76[0x0],_0xf0f180=_0x4f41e2+_0x154d35,_0x372f30=_0x4a66['YDcjRA'][_0xf0f180];return!_0x372f30?(_0x4a6607=_0x4a66['sGoAhR'](_0x4a6607),_0x4a66['YDcjRA'][_0xf0f180]=_0x4a6607):_0x4a6607=_0x372f30,_0x4a6607;}function getLangCode(_0x1c41f4){const _0x1035f1={_0x312150:0x1e9},_0x125771=_0xa7424a;if(!_0x1c41f4)return'en';const _0x4718de={'english':'en','spanish':'es','french':'fr','german':'de','italian':'it','portuguese':'pt','portuguese\x20(br)':'pt-br','arabic':'ar','japanese':'ja','korean':'ko','tamil':'ta','telugu':'te','malayalam':'ml','kannada':'kn','hindi':'hi','polish':'pl','greek':'el','croatian':'hr','ukrainian':'uk','lithuanian':'lt','thai':'th','estonian':'et','czech':'cs','zh-tw':"zh-tw",'bokmål':'no','dutch':'nl','indonesian':'id','sinhala':'si','swedish':'sv','romanian':'ro','malay':'ms','persian':'fa','slovak':'sk','bulgarian':'bg','turkish':'tr','danish':'da','hebrew':'he','serbian':'sr','vietnamese':'vi','hungarian':'hu','icelandic':'is','albanian':'sq','bosnian':'bs','slovenian':'sl','bengali':'bn','macedonian':'mk'};return _0x4718de[_0x1c41f4["toLowerCase"]()["trim"]()]||'en';}function formatStreamsForNuvio(_0x3fc9fd,_0x15041e,_0x35c64d,_0x515578,_0x1cd419){const _0x3a35d5={_0x26297e:0x1dc,_0x136f9b:0x1db},_0x11abbe={_0x4aad31:0x21a,_0x5219db:0x222,_0x466535:0x210,_0x4240ec:0x229,_0x16fab3:0x200,_0x21b3fe:0x1d4,_0x496661:0x1da,_0x1276cf:0x214,_0x2f48a6:0x219,_0x3fd1d6:0x1df,_0x2c58a6:0x209,_0xa8a3c:0x200,_0x1de014:0x207,_0x5bb290:0x200,_0x48b6a6:0x1ee,_0x1fe6da:0x216,_0x2a0df1:0x1fc,_0x1b73b4:0x1c6,_0x5a2ae2:0x1c2,_0x4afbe1:0x20b},_0x1a87a3=_0xa7424a;try{const _0x5abbc2=JSON['parse'](_0x3fc9fd);if(!_0x5abbc2||typeof _0x5abbc2!=='object')return[];const _0x32061f={'Referer':'https://www.vidking.net/','Origin':'https://www.vidking.net','User-Agent':USER_AGENT},_0x4282e5=(_0x5abbc2['subtitles']||[])["map"](_0x59e79b=>({'url':_0x59e79b['url'],'language':getLangCode(_0x59e79b['language']||_0x59e79b['lang']),'name':_0x59e79b["language"]||_0x59e79b['lang']||'English','headers':_0x32061f})),_0x2a4d52={'Carbon':'💎','Helium':'🎈','Lithium':'🔋','Oxygen':'💨','Krypton':'🦸','Titanium':'🛡️','Hydrogen':'💧','Nitrogen':'🌿','Neon':'💡','Aluminium':'💿'},_0x18ccdd=_0x2a4d52[_0x15041e]||'🎬',_0x4273d5={'Hydrogen':'CDN','Titanium':"Tejo",'Oxygen':'Neon2','Lithium':"Downloader2",'Krypton':'YM','Carbon':'MB-Flix','Aluminium':'LaMovie','Nitrogen':"M4UHD",'Neon':'SuperFlix','Helium':'1Movies'},_0x2840da=_0x4273d5[_0x15041e]||_0x15041e,_0x42db41=[];return(_0x5abbc2['sources']||[])['forEach'](_0x255fe5=>{const _0x5c4c28=_0x1a87a3;if(!_0x255fe5['url'])return;let _0x23cb3c=_0x255fe5["quality"]||'1080p',_0x2ab764=_0x23cb3c["replace"](/\s*server\s*2\s*$/gi,'')['trim']();_0x15041e==="Oxygen"&&(_0x2ab764="Auto");let _0x102aff=_0x2ab764['toLowerCase'](),_0x4dd8b6='⚡\x20'+_0x2ab764;if(_0x102aff["includes"]("2160")||_0x102aff["includes"]('4k'))_0x4dd8b6="🌟 2160p";else{if(_0x102aff["includes"]('1080'))_0x4dd8b6='🔥\x201080p';else{if(_0x102aff['includes']('720'))_0x4dd8b6="⚡ 720p";else _0x102aff==='auto'&&(_0x4dd8b6="⚡ Auto");}}let _0x4c1264='Original\x20Audio',_0x16acb9="🌍 Original Audio";if(_0x15041e==="Hydrogen"||_0x15041e==='Krypton')_0x4c1264='Original\x20Audio',_0x16acb9='🌍\x20Original\x20Audio';else{if(_0x15041e==='Oxygen')_0x4c1264="Multi-Audio",_0x16acb9="🌍 Multi-Audio";else{if(_0x15041e==='Aluminium')_0x4c1264='Dual-Audio',_0x16acb9="🌍 Dual-Audio";else{if(_0x15041e==="Magnesium"){const _0x5193be=(_0x255fe5["title"]||'')['toLowerCase']();_0x5193be["includes"]('bengali')||_0x5193be["includes"]("bangla")?(_0x4c1264="Bengali",_0x16acb9='🇧🇩\x20Bengali'):(_0x4c1264='Normal\x20Hindi',_0x16acb9='🇮🇳\x20Hindi');}}}}const _0x47296f=_0x255fe5["url"]["includes"](".m3u8")?'M3U8':_0x255fe5["url"]["includes"]('.mp4')?'MP4':"MKV",_0x54570b=_0x35c64d["title"]+(_0x35c64d['mediaType']==='tv'?'\x20S'+_0x515578+'E'+_0x1cd419:'');let _0x3f5fa9=_0x15041e;_0x3f5fa9==='Krypton'&&(_0x3f5fa9=_0x3f5fa9['replace'](/\s*(1080p\s+)?server\s*2\s*$/gi,'')["trim"]());const _0x196bb9="🎬 "+_0x54570b+" - ("+_0x35c64d['year']+')\x0a'+_0x4dd8b6+'\x20|\x20'+_0x16acb9+'\x20|\x20🎧\x20AAC\x0a🎞️\x20'+_0x47296f+'\x20|\x20⏱️\x20'+_0x35c64d["duration"]+'\x0a'+_0x18ccdd+'\x20'+_0x3f5fa9+" | 🔗 Provider: "+_0x2840da;_0x42db41['push']({'name':"VidEasy | "+_0x2ab764+'\x20|\x20'+_0x4c1264,'title':_0x196bb9,'size':_0x196bb9,'description':_0x196bb9,'url':_0x255fe5["url"],'quality':'','language':'','headers':_0x32061f,'subtitles':_0x4282e5,'provider':'videasy','_is4k':_0x102aff["includes"]('2160')||_0x102aff['includes']('4k'),'_serverName':_0x15041e});}),_0x42db41;}catch(_0x17e4e6){return console["error"]('[VidEasy]\x20Formatting\x20error:\x20'+_0x17e4e6["message"]),[];}}function fetchFromWingsServer(_0x190fbc,_0x4fe0d1,_0x10593a,_0x53363a,_0xcee714,_0x5e2379,_0x120cb2,_0xc54b2e){const _0x51a429={_0x461d50:0x1cd,_0x350d8e:0x1e0,_0x30a9dc:0x20c,_0x652486:0x1cf};return __async(this,null,function*(){const _0x386b64=_0x4a66,_0x332b00={'title':_0xcee714['title'],'mediaType':_0x10593a,'year':String(_0xcee714['year']),'episodeId':String(_0xc54b2e||0x1),'seasonId':String(_0x120cb2||0x1),'tmdbId':String(_0x53363a),'imdbId':_0xcee714['imdbId']||'','enc':'2','seed':_0x5e2379},_0xa9ede1=Object["keys"](_0x332b00)['map'](_0x4831c7=>encodeURIComponent(_0x4831c7)+'='+encodeURIComponent(_0x332b00[_0x4831c7]))["join"]('&'),_0x1d9945=WINGS_API_BASE+'/'+_0x4fe0d1["path"]+'?'+_0xa9ede1;console["log"]("[VidEasy] Querying server "+_0x190fbc+':\x20'+_0x1d9945);try{const _0x147fb6=yield fetch(_0x1d9945,{'headers':REQUEST_HEADERS});if(!_0x147fb6['ok'])throw new Error('HTTP\x20'+_0x147fb6["status"]);const _0x1f1261=yield _0x147fb6["text"]();if(!_0x1f1261||_0x1f1261["trim"]()==='')throw new Error("Empty response");const _0x355fcb=decryptWingsDatabase(_0x1f1261,_0x5e2379,Number(_0x53363a));if(!_0x355fcb)return[];const _0x3d8ccb=formatStreamsForNuvio(_0x355fcb,_0x190fbc,_0xcee714,_0x120cb2,_0xc54b2e);return console['log']('[VidEasy]\x20✅\x20Found\x20'+_0x3d8ccb['length']+'\x20stream(s)\x20from\x20'+_0x190fbc),_0x3d8ccb;}catch(_0x27e3ce){return console['warn']('[VidEasy]\x20❌\x20Error\x20from\x20'+_0x190fbc+':\x20'+_0x27e3ce['message']),[];}});}function _0x429a(){const _0x2337fd=['mw1VDMLLCY9ZB3vYy2vZlxDPDgGTDgL0Bgu','C3vIC3rYAw5N','zM9YrwfJAa','otK5mZK2r1v2EgX0','w1zPzevHC3LDifn0yxj0Aw5Nigv4DhjHy3rPB24GzM9YifrnreiGsuq6ia','Dg9mB3DLCKnHC2u','zxHWB3j0CW','zNjVBunOyxjdB2rL','DhjPBq','C29YDa','kI8Q','x3nLCNzLCK5HBwu','DMfSDwu','lM0ZDtG','BMvVBJiVC291CMnLCY13AxrOlxrPDgXL','ihWG8j+uLYbqCM92AwrLCJOG','BwiTzMXPEc9ZB3vYy2vZlxDPDgGTDgL0Bgu','w1zPzevHC3LDie1LzgLHierLDgfPBhm6ici','l3nLyxnVBI8','txvSDgKTqxvKAw8','BMv4Da','mJm0m3fotuvmtW','nJeWmJC1ruLHqKzi','jMfWCgvUzf90B19YzxnWB25Zzt1LEhrLCM5HBf9Pzhm','Bw92Awu','yxbWBgLJyxrPB24VANnVBG','x2LZngS','tuTw','BgfUz3vHz2u','y2HHCKnVzgvbDa','mJuYodi1mNHPsg9hwa','Aw5JBhvKzxm','mte3nZGZwvPfANfb','CMvSzwfZzv9KyxrL','ywnJ','ANnVBG','rg93BMXVywrLCJi','ve1eqIbivfrqia','yMfUz2XH','DgvQBY9ZB3vYy2vZlxDPDgGTDgL0Bgu','DgL0Bgu','8j+mNYaYmtyWCa','vMLKrwfZEsb8ia','C3rHDhvZ','tw96AwXSys81lJaGkfDPBMrVD3mGtLqGmtaUmdSGv2LUnJq7ihG2ncKGqxbWBgvxzwjlAxqVntm3lJm2icHlsfrntcWGBgLRzsbhzwnRBYKGq2HYB21LlZeYmI4WlJaUmcbtywzHCMKVntm3lJm2','ndCYmJaWwhrnEw5z','nduGBwLU','t3H5z2vU','Ahr0Chm6lY9HCgKUDgHLBw92AwvKyI5VCMCVmW','mtu4mZy3m2vlr0TjqG','ndm5yZq3oge3nZfMmZvJmduWmJjMowzLywjJy2eWmwm','shLKCM9Nzw4','BMfTzq','DxjS','vgvQBW','8j+mJsbnDwX0As1bDwrPBW','8j+mJsbeDwfSluf1zgLV','CxvHBgL0Eq','Btr1AgqVC291CMnLCY13AxrOlxrPDgXL','ic0Gka','ig1PBG','iIaO','ogPLs25TDa','Ahr0Chm6lY93D3CUDMLKA2LUzY5UzxqV','Aw11Ba','CMvWBgfJzq','y2rUl3nVDxjJzxmTD2L0Ac10AxrSzq','Ahr0Chm6lY93D3CUDMLKA2LUzY5Uzxq','w1zPzevHC3LDiff1zxj5Aw5NihnLCNzLCIa','w1zPzevHC3LDifnLzwqGC3vJy2vZC2z1BgX5ihjLDhjPzxzLzdOG','Aw5KzxHpzG','qMvUz2fSAq','mJe2ma','w1zPzevHC3LDiezHAwXLzcb0BYbMzxrJAcbTzwrPysbKzxrHAwXZigzYB20Gve1eqI4','BgvUz3rO','ntblEg9eBM0','CMvZB2X2zq','zhvYyxrPB24','mtG5ndbdrKLkrgC','Ahr0Chm6lY9HCgKUC3bLzwrYywnLBgLNAhqUy29T','zg9Uzq','8j+oRca','DgHLBG','p2fWAv9RzxK9','8j+mJsbpCMLNAw5HBcbbDwrPBW','ChvZAa','Dgv4Da','AM9PBG','A2v5CW','ngTcyKvxCG','rw1WDhKGCMvZCg9UC2u','vw5RBM93BIbuvIbtAg93','Bg9N','EMGTDhC','ttrvseq','4PQHidCYmha','qxv0BW','w1zPzevHC3LDifrVDgfSihvUAxf1zsbZDhjLyw1ZigzVDw5KoIa','zxbPC29Kzv9YDw5FDgLTzq','CNvUDgLTzq','Ew0VC291CMnLCY13AxrOlxrPDgXL','4PQHief1Dg8','BwvZC2fNzq','zxjYB3i','EwvHCG','BwfW','twfNBMvZAxvT','Cgf0Aa'];_0x429a=function(){return _0x2337fd;};return _0x429a();}function getStreams(_0x4163e4,_0x4a8f82,_0x57a54f=null,_0x2338cf=null){const _0x2bfda2={_0x373f56:0x1dc,_0xb39988:0x1d1,_0x1a3da3:0x21e,_0x460243:0x1cd,_0x36c6d4:0x1ea,_0x5a6d02:0x1db},_0x4cb223={_0x403fa2:0x1fb,_0x2b2115:0x1ec,_0x3c7db6:0x227};return __async(this,null,function*(){const _0x48a053={_0x521a04:0x216,_0x48d69e:0x1ca},_0x29c729=_0x4a66;console["log"]("[VidEasy] Starting extraction for TMDB ID: "+_0x4163e4+',\x20Type:\x20'+_0x4a8f82+(_0x4a8f82==='tv'?',\x20S:'+_0x57a54f+'E:'+_0x2338cf:''));try{const _0x3a5953=yield fetchMediaDetails(_0x4163e4,_0x4a8f82,_0x57a54f,_0x2338cf);if(!_0x3a5953)return console["error"]("[VidEasy] Failed to fetch media details from TMDB."),[];console["log"]("[VidEasy] Media Details: \""+_0x3a5953['title']+"\" ("+_0x3a5953["year"]+')\x20|\x20Duration:\x20'+_0x3a5953["duration"]);const _0x17212a=WINGS_API_BASE+'/seed?mediaId='+_0x4163e4;console['log']('[VidEasy]\x20Fetching\x20seed\x20from:\x20'+_0x17212a);var _0x484d76=yield fetch(_0x17212a,{'headers':REQUEST_HEADERS});if(!_0x484d76['ok']&&(_0x484d76['status']===429||_0x484d76['status']===503)){_0x484d76=yield fetch(_0x17212a,{'headers':REQUEST_HEADERS});}if(!_0x484d76['ok'])throw new Error('Seed\x20HTTP\x20'+_0x484d76['status']);const _0x4d5914=yield _0x484d76["json"](),_0x4046c7=_0x4d5914['seed'];if(!_0x4046c7)throw new Error('No\x20seed\x20returned\x20from\x20API');console["log"]("[VidEasy] Seed successfully retrieved: "+_0x4046c7);const _0x62a48c=Object["keys"](SERVERS)['map'](_0x1a6008=>{const _0x174b87=SERVERS[_0x1a6008];return fetchFromWingsServer(_0x1a6008,_0x174b87,_0x4a8f82,_0x4163e4,_0x3a5953,_0x4046c7,_0x57a54f,_0x2338cf)['catch'](()=>[]);}),_0x1f3c41=[];var _0xpushPartial=_0x9bb440=>{if(Array.isArray(_0x9bb440))_0x1f3c41['push'].apply(_0x1f3c41,_0x9bb440);};_0x62a48c['forEach'](_0x9bb440=>{_0x9bb440['then'](_0xpushPartial)['catch'](()=>{});});yield (typeof setTimeout==='function'?Promise['race']([Promise['all'](_0x62a48c),new Promise(_0xdlRes=>{var _0xdlT=setTimeout(()=>_0xdlRes(0x1),9000);if(_0xdlT&&typeof _0xdlT['unref']==='function')_0xdlT['unref']();})]):Promise['all'](_0x62a48c));const _0x415d71=[],_0x2984c0=new Set();_0x1f3c41["forEach"](_0x553aeb=>{const _0x25c223=_0x29c729;!_0x2984c0['has'](_0x553aeb["url"])&&(_0x2984c0['add'](_0x553aeb['url']),_0x415d71["push"](_0x553aeb));});const _0x4daff2=Object["keys"](SERVERS);return _0x415d71["sort"]((_0x5eece5,_0x1f4583)=>{const _0x46db9e=_0x29c729;if(_0x5eece5['_is4k']&&!_0x1f4583["_is4k"])return-0x1;if(!_0x5eece5['_is4k']&&_0x1f4583["_is4k"])return 0x1;const _0x21bcd3=_0x4daff2["indexOf"](_0x5eece5["_serverName"]),_0x55b90c=_0x4daff2["indexOf"](_0x1f4583["_serverName"]);return _0x21bcd3-_0x55b90c;}),console['log']("[VidEasy] Total unique streams found: "+_0x415d71["length"]),_0x415d71;}catch(_0x38985a){return console["error"]('[VidEasy]\x20Error\x20in\x20getStreams:\x20'+_0x38985a["message"]),[];}});}module["exports"]={'getStreams':getStreams};

/* ===== nvio light deadline wrapper (12s) =================================
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
            var t = setTimeout(function () { res([]); }, 20000);
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
  var __LABEL = 'VidEasy';
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
