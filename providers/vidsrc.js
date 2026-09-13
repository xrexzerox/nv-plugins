/*
 * nv-plugins vidsrc.js — FULLY DECODED port of the All-in-One-Nuvio provider (4.24.0 merge pass).
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
var _0x3d0b=function(){return "";};var _0x10161d=_0x3d0b;/*rotation removed*/;var __async=(_0x46e79d,_0x2eca92,_0xb92204)=>{var _0x183d63={_0x339596:0x12e},_0x2b96b0={_0x34b802:0x13a};return new Promise((_0x6ab048,_0x569803)=>{var _0x4f05ce=_0x3d0b,_0xbf13c=_0x5e9f0b=>{var _0xe59dc4=_0x3d0b;try{_0x32ba86(_0xb92204["next"](_0x5e9f0b));}catch(_0x122bfe){_0x569803(_0x122bfe);}},_0x42a348=_0x3fc4f6=>{var _0x3e1faa=_0x3d0b;try{_0x32ba86(_0xb92204["throw"](_0x3fc4f6));}catch(_0x6743e3){_0x569803(_0x6743e3);}},_0x32ba86=_0x4a6426=>_0x4a6426['done']?_0x6ab048(_0x4a6426["value"]):Promise['resolve'](_0x4a6426["value"])["then"](_0xbf13c,_0x42a348);_0x32ba86((_0xb92204=_0xb92204["apply"](_0x46e79d,_0x2eca92))["next"]());});},BASEDOM='https://whisperingauroras.com',UA='Mozilla/5.0\x20(Windows\x20NT\x2010.0;\x20Win64;\x20x64)\x20AppleWebKit/537.36\x20(KHTML,\x20like\x20Gecko)\x20Chrome/128.0.0.0\x20Safari/537.36',TMDB_API_KEY="439c478a771f35c05022f9feabcca01c";function safeFetch(_0x38c7d2,_0x22c1f2,_0x2470b2){var _0x3e0cb2={_0x45ac16:0x138,_0x2e8254:0x10a},_0x36a12d={_0x6fbd93:0x152},_0x4cedae=_0x10161d;_0x2470b2=_0x2470b2||0x1f40;var _0x1c90ea,_0x28bb5c;try{_0x1c90ea=new AbortController(),_0x28bb5c=setTimeout(function(){var _0x13a933=_0x3d0b;_0x1c90ea["abort"]();},_0x2470b2);}catch(_0x5c632b){_0x1c90ea=null;}var _0x20e058=Object['assign']({'method':"GET"},_0x22c1f2||{});if(_0x1c90ea)_0x20e058["signal"]=_0x1c90ea['signal'];return __nvFetch(_0x38c7d2,_0x20e058)['then'](function(_0x4c01c8){if(_0x28bb5c)clearTimeout(_0x28bb5c);return _0x4c01c8;})["catch"](function(_0x40c68b){if(_0x28bb5c)clearTimeout(_0x28bb5c);throw _0x40c68b;});}function bMGyx71TzQLfdonN(_0x1a8754){var _0x5ac2c2={_0x4b9fec:0x159,_0x26cef1:0x118},_0x399bc8=_0x10161d,_0x487118=0x3,_0x3abed3=[];if(typeof _0x1a8754!=='string')return'';for(var _0x5dc1a0=0x0;_0x5dc1a0<_0x1a8754['length'];_0x5dc1a0+=_0x487118){_0x3abed3["push"](_0x1a8754['slice'](_0x5dc1a0,_0x5dc1a0+_0x487118));}return _0x3abed3["reverse"]()['join']('');}function Iry9MQXnLs(_0x46d1a2){var _0x3a2d67={_0x366036:0x139,_0x885ac9:0x141,_0x1c8698:0x10c,_0xfda53a:0x10c},_0x24ec9a=_0x10161d,_0x24f8b9='pWB9V)[*4I`nJpp?ozyB~dbr9yt!_n4u',_0x4098f2=_0x46d1a2["match"](/.{1,2}/g)['map'](function(_0x2ef788){return String['fromCharCode'](parseInt(_0x2ef788,0x10));})["join"](''),_0x177575='';for(var _0x34df3e=0x0;_0x34df3e<_0x4098f2['length'];_0x34df3e++){_0x177575+=String['fromCharCode'](_0x4098f2['charCodeAt'](_0x34df3e)^_0x24f8b9["charCodeAt"](_0x34df3e%_0x24f8b9['length']));}var _0x420f9a='';for(var _0x2f883f=0x0;_0x2f883f<_0x177575['length'];_0x2f883f++){_0x420f9a+=String["fromCharCode"](_0x177575["charCodeAt"](_0x2f883f)-0x3);}try{return atob(_0x420f9a);}catch(_0x558dde){return'';}}function IGLImMhWrI(_0x41050a){var _0x7ea3b9={_0x52f316:0x141,_0x189d41:0x12b,_0x279d2e:0x141},_0x1997fa=_0x10161d,_0x2f25fe=_0x41050a["split"]('')["reverse"]()["join"](''),_0x4dcd3a=_0x2f25fe['replace'](/[a-zA-Z]/g,function(_0x8d62bc){return String['fromCharCode'](_0x8d62bc['charCodeAt'](0x0)+(_0x8d62bc['toLowerCase']()<'n'?0xd:-0xd));}),_0x594d55=_0x4dcd3a["split"]('')['reverse']()["join"]('');try{return atob(_0x594d55);}catch(_0x3fca10){return'';}}function GTAxQyTyBx(_0x1b8cc4){var _0x1616b6={_0xfefa68:0x12b},_0x270411=_0x10161d,_0xb0374d=_0x1b8cc4["split"]('')["reverse"]()["join"](''),_0x44ba88='';for(var _0x130950=0x0;_0x130950<_0xb0374d['length'];_0x130950+=0x2){_0x44ba88+=_0xb0374d[_0x130950];}try{return atob(_0x44ba88);}catch(_0x475e7f){return'';}}function C66jPHx8qu(_0x3f974b){var _0x364002={_0x443e25:0x151},_0x59a408={_0x4304e7:0x12f},_0x4cd910=_0x10161d,_0x3cd8d6=_0x3f974b['split']('')['reverse']()['join'](''),_0x1f1d77='X9a(O;FMV2-7VO5x;Ao\x20:dN1NoFs?j,',_0x17d46c=_0x3cd8d6['match'](/.{1,2}/g)["map"](function(_0x3b4572){var _0x3fee97=_0x4cd910;return String["fromCharCode"](parseInt(_0x3b4572,0x10));})['join'](''),_0xd98432='';for(var _0xd98bf4=0x0;_0xd98bf4<_0x17d46c["length"];_0xd98bf4++){_0xd98432+=String['fromCharCode'](_0x17d46c['charCodeAt'](_0xd98bf4)^_0x1f1d77["charCodeAt"](_0xd98bf4%_0x1f1d77['length']));}return _0xd98432;}function MyL1IRSfHe(_0x51248d){var _0x61df37=_0x10161d,_0x5b900f=_0x51248d['split']('')['reverse']()["join"](''),_0x70e5d0='';for(var _0x34816d=0x0;_0x34816d<_0x5b900f["length"];_0x34816d++){_0x70e5d0+=String['fromCharCode'](_0x5b900f['charCodeAt'](_0x34816d)-0x1);}var _0x500dc3='';for(var _0x5ef5a8=0x0;_0x5ef5a8<_0x70e5d0['length'];_0x5ef5a8+=0x2){_0x500dc3+=String["fromCharCode"](parseInt(_0x70e5d0['substr'](_0x5ef5a8,0x2),0x10));}return _0x500dc3;}function detdj7JHiK(_0x17773d){var _0xc6c902={_0x262dfb:0x115},_0x46ef5c=_0x10161d,_0x3bc577=_0x17773d['slice'](0xa,-0x10),_0xdece7f="3SAY~#%Y(V%>5d/Yg\"$G[Lh1rK4a;7ok",_0x1aa6a0='';try{_0x1aa6a0=atob(_0x3bc577);}catch(_0x14b217){return'';}var _0x46780c=_0xdece7f["repeat"](Math["ceil"](_0x1aa6a0["length"]/_0xdece7f['length']))['substring'](0x0,_0x1aa6a0['length']),_0x3806b0='';for(var _0x3f2d11=0x0;_0x3f2d11<_0x1aa6a0["length"];_0x3f2d11++){_0x3806b0+=String['fromCharCode'](_0x1aa6a0["charCodeAt"](_0x3f2d11)^_0x46780c["charCodeAt"](_0x3f2d11));}return _0x3806b0;}function nZlUnj2VSo(_0x44f460){var _0x25ec9d=_0x10161d,_0x1a2aa0={'x':'a','y':'b','z':'c','a':'d','b':'e','c':'f','d':'g','e':'h','f':'i','g':'j','h':'k','i':'l','j':'m','k':'n','l':'o','m':'p','n':'q','o':'r','p':'s','q':'t','r':'u','s':'v','t':'w','u':'x','v':'y','w':'z','X':'A','Y':'B','Z':'C','A':'D','B':'E','C':'F','D':'G','E':'H','F':'I','G':'J','H':'K','I':'L','J':'M','K':'N','L':'O','M':'P','N':'Q','O':'R','P':'S','Q':'T','R':'U','S':'V','T':'W','U':'X','V':'Y','W':'Z'};return _0x44f460["replace"](/[xyzabcdefghijklmnopqrstuvwXYZABCDEFGHIJKLMNOPQRSTUVW]/g,function(_0x4ca05e){return _0x1a2aa0[_0x4ca05e]||_0x4ca05e;});}function laM1dAi3vO(_0x3c1a77){var _0x2ae741={_0x39f9e5:0x141,_0x40faaf:0x12f},_0x17fec5=_0x10161d,_0x3259db=_0x3c1a77['split']('')["reverse"]()["join"](''),_0x457b60=_0x3259db['replace'](/-/g,'+')["replace"](/_/g,'/'),_0x303dfd='';try{_0x303dfd=atob(_0x457b60);}catch(_0x129fbf){return'';}var _0x70cfac='';for(var _0x42460f=0x0;_0x42460f<_0x303dfd['length'];_0x42460f++){_0x70cfac+=String["fromCharCode"](_0x303dfd["charCodeAt"](_0x42460f)-0x5);}return _0x70cfac;}/*string-table removed*/function GuxKGDsA2T(_0x56fc88){var _0x57820d={_0x172a26:0x140},_0x555177=_0x10161d,_0x1e4e93=_0x56fc88["split"]('')["reverse"]()["join"](''),_0x66d98c=_0x1e4e93["replace"](/-/g,'+')['replace'](/_/g,'/'),_0x148ef7='';try{_0x148ef7=atob(_0x66d98c);}catch(_0x388245){return'';}var _0x3ec6ce='';for(var _0x5e4555=0x0;_0x5e4555<_0x148ef7["length"];_0x5e4555++){_0x3ec6ce+=String["fromCharCode"](_0x148ef7["charCodeAt"](_0x5e4555)-0x7);}return _0x3ec6ce;}function LXVUMCoAHJ(_0x483fb2){var _0x133e48={_0xda507:0x141,_0xd28cc8:0x149,_0x553e1f:0x140,_0x1aebeb:0x12f},_0x55ea98=_0x10161d,_0x2ef238=_0x483fb2['split']('')["reverse"]()["join"](''),_0x514a7f=_0x2ef238["replace"](/-/g,'+')['replace'](/_/g,'/'),_0x43f157='';try{_0x43f157=atob(_0x514a7f);}catch(_0x3d6a4d){return'';}var _0x44b529='';for(var _0x5c78f3=0x0;_0x5c78f3<_0x43f157["length"];_0x5c78f3++){_0x44b529+=String["fromCharCode"](_0x43f157["charCodeAt"](_0x5c78f3)-0x3);}return _0x44b529;}function decrypt(_0x1d8c7c,_0x33fcbf){var _0x14f27b={_0x175cbb:0x102,_0x323766:0x10b},_0x4fb043=_0x10161d;switch(_0x33fcbf){case'LXVUMCoAHJ':return LXVUMCoAHJ(_0x1d8c7c);case'GuxKGDsA2T':return GuxKGDsA2T(_0x1d8c7c);case'laM1dAi3vO':return laM1dAi3vO(_0x1d8c7c);case'nZlUnj2VSo':return nZlUnj2VSo(_0x1d8c7c);case "Iry9MQXnLs":return Iry9MQXnLs(_0x1d8c7c);case'IGLImMhWrI':return IGLImMhWrI(_0x1d8c7c);case "GTAxQyTyBx":return GTAxQyTyBx(_0x1d8c7c);case "C66jPHx8qu":return C66jPHx8qu(_0x1d8c7c);case'MyL1IRSfHe':return MyL1IRSfHe(_0x1d8c7c);case'detdj7JHiK':return detdj7JHiK(_0x1d8c7c);case "bMGyx71TzQLfdonN":return bMGyx71TzQLfdonN(_0x1d8c7c);default:return null;}}function serversLoad(_0x2a7235){var _0x4737b7={_0x4de94e:0x139},_0x17f895=_0x10161d,_0x42eb8f=[],_0x1da41a=_0x2a7235["match"](/<title>([^<]*)<\/title>/i),_0x16e096=_0x1da41a?_0x1da41a[0x1]:'',_0x5ef3c8=_0x2a7235['match'](/<iframe\s+[^>]*src="([^"]*)"/i),_0x246a46=_0x5ef3c8?_0x5ef3c8[0x1]:'';_0x246a46&&(BASEDOM=new URL(_0x246a46["startsWith"]('//')?"https:"+_0x246a46:_0x246a46)["origin"]);var _0x95df63=/class="[^"]*server[^"]*"[^>]*data-hash="([^"]*)"[^>]*>([^<]*)/g,_0xae8eaf;while((_0xae8eaf=_0x95df63['exec'](_0x2a7235))!==null){_0x42eb8f["push"]({'name':_0xae8eaf[0x2]["trim"](),'dataHash':_0xae8eaf[0x1]});}return{'servers':_0x42eb8f,'title':_0x16e096};}function PRORCPhandler(_0x44923c){var _0x30c608={_0x160dab:0x149,_0x38b794:0x149,_0x492554:0x145,_0xd98bd1:0x145,_0x1b0452:0x131};return __async(this,null,function*(){var _0x38d402=_0x3d0b;try{var _0x2761d3=yield safeFetch(BASEDOM+'/prorcp/'+_0x44923c,{'headers':{'Referer':'https://vidsrc.me/','User-Agent':UA}},0x1388),_0x2f3c45=yield _0x2761d3["text"](),_0x3836db=_0x2f3c45['match'](/<script\s+src="\/([^"]*\.js)\?\_=([^"]*)"><\/script>/gm);if(!_0x3836db)return null;var _0xa3523b=_0x3836db[_0x3836db["length"]-0x1]["includes"]('cpt.js')?_0x3836db[_0x3836db['length']-0x2]["replace"](/.*src="\/([^"]*\.js)\?\_=([^"]*)".*/,"$1?_=$2"):_0x3836db[_0x3836db["length"]-0x1]["replace"](/.*src="\/([^"]*\.js)\?\_=([^"]*)".*/,"$1?_=$2"),_0x2d316a=yield safeFetch(BASEDOM+'/'+_0xa3523b,{},0x1388),_0x1eaf6b=yield _0x2d316a["text"](),_0x175d5f=/{}\}window\[([^"]+)\("([^"]+)"\)/,_0x6fd42d=_0x1eaf6b['match'](_0x175d5f);if(!_0x6fd42d||_0x6fd42d["length"]<0x3)return null;var _0x12d741=_0x6fd42d[0x1]["toString"]()["trim"](),_0x586fca=_0x6fd42d[0x2]['toString']()["trim"](),_0x2ac414=decrypt(_0x586fca,_0x12d741);if(!_0x2ac414)return null;var _0x21f25c=new RegExp("id=\""+_0x2ac414+'\x22[^>]*>([^<]*)','i'),_0x4bf06b=_0x2f3c45['match'](_0x21f25c);if(!_0x4bf06b)return null;var _0x29e66f=_0x4bf06b[0x1]["trim"](),_0x1ffcfc=decrypt(_0x29e66f,_0x586fca);return _0x1ffcfc;}catch(_0x451789){return console["log"]("[VidSrc.me] PRORCPhandler error: "+_0x451789['message']),null;}});}function rcpGrabber(_0x543fc3){var _0x27c82e=_0x10161d,_0x2651ec=/src:\s*'([^']*)'/,_0x1f4dd1=_0x543fc3["match"](_0x2651ec);if(!_0x1f4dd1)return null;return _0x1f4dd1[0x1];}/*decoder removed*/function cleanTitleString(_0x509e26){var _0x26d358=_0x10161d;if(!_0x509e26)return{'title':"VidSrc Media",'year':'2026'};var _0x17dc82=_0x509e26['replace'](/\s*-\s*VidSrc\.me$/i,'')['trim'](),_0x2c2024=_0x17dc82["match"](/\s*\((\d{4})\)$/),_0x48c5e8="2026";return _0x2c2024&&(_0x48c5e8=_0x2c2024[0x1],_0x17dc82=_0x17dc82["replace"](/\s*\(\d{4}\)$/,'')['trim']()),{'title':_0x17dc82,'year':_0x48c5e8};}function fetchTMDBDuration(_0x5cf1d4,_0x459fbd,_0x229d6e,_0x3adc95){var _0x19c994={_0x50e2d5:0x12a,_0x3f6654:0x136,_0x114246:0x121,_0x3d4853:0x12c,_0xa54876:0x10e,_0x598812:0x144,_0x807399:0x140};return __async(this,null,function*(){var _0xd8c91b=_0x3d0b;let _0x12871=_0x459fbd==='tv'?"45 min":"90 min";try{const _0x3cdcac=_0x459fbd==='tv'?'tv':"movie",_0xd1ee63=String(_0x5cf1d4)['replace'](/\D/g,''),_0x25820f="https://api.themoviedb.org/3/"+_0x3cdcac+'/'+_0xd1ee63+"?api_key="+TMDB_API_KEY+"&append_to_response=external_ids",_0x5baa0c=yield __nvFetch(_0x25820f);if(!_0x5baa0c['ok'])return _0x12871;const _0x118570=yield _0x5baa0c["json"]();let _0x25aa3f=_0x12871;if(_0x459fbd==='movie'&&_0x118570["runtime"])_0x25aa3f=_0x118570["runtime"]+" min";else{if(_0x459fbd==='tv'&&_0x229d6e!=null&&_0x3adc95!=null){const _0x2b18e2='https://api.themoviedb.org/3/tv/'+_0xd1ee63+"/season/"+_0x229d6e+"/episode/"+_0x3adc95+'?api_key='+TMDB_API_KEY,_0x487c78=yield __nvFetch(_0x2b18e2);if(_0x487c78['ok']){const _0x23a92d=yield _0x487c78['json']();if(_0x23a92d["runtime"])_0x25aa3f=_0x23a92d['runtime']+'\x20min';else _0x118570['episode_run_time']&&_0x118570["episode_run_time"]["length"]>0x0&&(_0x25aa3f=_0x118570["episode_run_time"][0x0]+'\x20min');}}}return _0x25aa3f;}catch(_0x987051){return _0x12871;}});}function getStreams(_0x4a5a7c,_0x4e1353,_0x2e873c,_0x175a03){var _0x5231c4={_0x1a8669:0x126,_0x496cd8:0x14a,_0x4449ee:0x11a,_0xcd29b7:0x106,_0x2618f0:0x120,_0x55047b:0x142,_0x5643d9:0x146,_0x174e2e:0x125,_0x1ef56c:0x13f,_0x1b5237:0x143,_0xf65eb7:0x140,_0x1fe0b4:0x145,_0x4c42eb:0x135,_0x545d68:0x10f,_0x37579d:0x13e,_0x43b864:0x13c,_0x21f2ee:0x113,_0x2cfc5d:0x147,_0x510b87:0x111};return __async(this,null,function*(){var _0x3e43bd=_0x3d0b;try{var _0x28243b=_0x4e1353==='movie',_0x56d39b=_0x28243b?'https://vidsrc.me/embed/'+_0x4a5a7c:"https://vidsrc.me/embed/"+_0x4a5a7c+'/'+(_0x2e873c||0x1)+'-'+(_0x175a03||0x1);console['log']('[VidSrc.me]\x20Fetching\x20embed\x20page:\x20'+_0x56d39b);var _0x54aafc=safeFetch(_0x56d39b,{},0x1f40),_0x3d5544=fetchTMDBDuration(_0x4a5a7c,_0x4e1353,_0x2e873c,_0x175a03),_0x117591=yield _0x54aafc,_0x103a93=yield _0x117591['text'](),_0x51ec0a=yield _0x3d5544,_0x43894a=serversLoad(_0x103a93),_0x5216fc=_0x43894a["servers"],_0x1ffb80=cleanTitleString(_0x43894a["title"]),_0x583e8f=_0x1ffb80["title"],_0x58b028=_0x1ffb80["year"];console["log"]('[VidSrc.me]\x20Parsed\x20servers:\x20'+_0x5216fc['length']);var _0x58ead6=[];for(var _0x3708f3=0x0;_0x3708f3<_0x5216fc["length"];_0x3708f3++){var _0x2efb1c=_0x5216fc[_0x3708f3];try{console['log']('[VidSrc.me]\x20Fetching\x20RCP\x20for\x20server:\x20'+_0x2efb1c["name"]);var _0xea64c2=yield safeFetch(BASEDOM+"/rcp/"+_0x2efb1c["dataHash"],{},0x1388),_0x4df09a=yield _0xea64c2["text"](),_0x3c23fe=rcpGrabber(_0x4df09a);if(_0x3c23fe&&_0x3c23fe["substring"](0x0,0x8)==='/prorcp/'){console["log"]("[VidSrc.me] Resolving server prorcp: "+_0x2efb1c["name"]);var _0x406401=yield PRORCPhandler(_0x3c23fe['replace']("/prorcp/",''));if(_0x406401){var _0x3bdf69=_0x406401;if(_0x3bdf69['includes']('__TOKEN__')||_0x3bdf69['includes']('__TOKENPG__'))try{var _0x429003=new URL(_0x3bdf69['split'](" or ")[0x0]),_0x537d87=_0x429003["hostname"];console["log"]('[VidSrc.me]\x20Generating\x20token\x20for\x20host:\x20'+_0x537d87);var _0x431927=yield safeFetch('https://'+_0x537d87+'/generate.php',{'headers':{'Referer':'https://vidsrc.me/','User-Agent':UA}},0xfa0),_0x324954=yield _0x431927["text"](),_0x401bd5=_0x324954["trim"]();_0x401bd5&&_0x401bd5["length"]>0xa&&(_0x3bdf69=_0x3bdf69['replace'](/__TOKEN__/g,_0x401bd5)["replace"](/__TOKENPG__/g,_0x401bd5),console['log']('[VidSrc.me]\x20Token\x20successfully\x20generated\x20&\x20injected'));}catch(_0x4c414a){console['log']("[VidSrc.me] Token generation failed: "+_0x4c414a['message']);}var _0x32cb9f=_0x3bdf69["split"](" or ");for(var _0x4c8eb4=0x0;_0x4c8eb4<_0x32cb9f["length"];_0x4c8eb4++){var _0x201279=_0x32cb9f[_0x4c8eb4]["trim"]();if(!_0x201279)continue;var _0x53ea3d="1080p";if(_0x201279['includes']('/720/')||_0x201279['includes']("720p")||_0x201279["includes"]("/7e39f"))_0x53ea3d='720p';else{if(_0x201279["includes"]('/360/')||_0x201279['includes']('360p')||_0x201279['includes']('/7a67b'))_0x53ea3d='360p';else(_0x201279['includes']("/1080/")||_0x201279['includes']("1080p"))&&(_0x53ea3d='1080p');}var _0x537523=_0x53ea3d["toLowerCase"](),_0x11561b=_0x2efb1c['name']['replace'](/\D+/g,''),_0x503df9=_0x11561b?"Server "+_0x11561b:'Server\x20'+(_0x3708f3+0x1);_0x32cb9f["length"]>0x1&&(_0x503df9+=" (Variant "+(_0x4c8eb4+0x1)+')');var _0x1cf24b='MKV';if(_0x201279['includes']('.m3u8'))_0x1cf24b="M3U8";else{if(_0x201279['includes']('.mp4'))_0x1cf24b='MP4';}var _0x2e7896='VidSrc\x20|\x20'+_0x537523+" | Original-Audio",_0x50479b=!_0x28243b&&_0x2e873c&&_0x175a03?'\x20S'+String(_0x2e873c)['padStart'](0x2,'0')+'E'+String(_0x175a03)["padStart"](0x2,'0'):'',_0x4f484d="📽️ "+_0x583e8f+_0x50479b+'\x20-\x20('+_0x58b028+')',_0x3f0f71='⭐\x20'+_0x537523+'\x20|\x20🌍\x20Original-Audio\x20|\x20🎧\x20AAC',_0x5c0090="🎞️ "+_0x1cf24b+'\x20|\x20🎥\x20x264\x20|\x20⏳\x20'+_0x51ec0a,_0x40a267='📎\x20'+_0x503df9,_0x4ab2d3=_0x4f484d+'\x0a'+_0x3f0f71+'\x0a'+_0x5c0090+'\x0a'+_0x40a267;_0x58ead6["push"]({'name':_0x2e7896,'title':_0x4ab2d3,'size':_0x4ab2d3,'description':_0x4ab2d3,'url':_0x201279,'quality':'','language':'','headers':{},'subtitles':[],'provider':"vidsrcme"});}}}}catch(_0x4668f5){console["log"]("[VidSrc.me] Server "+_0x2efb1c["name"]+'\x20error:\x20'+_0x4668f5["message"]);}}return console['log']("[VidSrc.me] Scraped streams: "+_0x58ead6['length']),_0x58ead6;}catch(_0x1419cf){return console['log']('[VidSrc.me]\x20Scraper\x20error:\x20'+_0x1419cf["message"]),[];}});}module['exports']={'getStreams':getStreams};

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
  var PROVIDER = "vidsrc";
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
