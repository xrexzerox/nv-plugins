/*
 * nv-plugins videasy.js — FULLY DECODED port of the All-in-One-Nuvio provider (4.24.0 merge pass).
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
var _0x4a66=function(){return "";};const _0xa7424a=_0x4a66;/*rotation removed*/;var __async=(_0xd0c07d,_0x340765,_0x2fa615)=>{return new Promise((_0x5f3661,_0x15e11c)=>{const _0x119019=_0x4a66;var _0x24bf8e=_0x52b38a=>{const _0x267aa3=_0x4a66;try{_0x27eb35(_0x2fa615["next"](_0x52b38a));}catch(_0x275c10){_0x15e11c(_0x275c10);}},_0x3d784d=_0x436a1f=>{try{_0x27eb35(_0x2fa615['throw'](_0x436a1f));}catch(_0x5dca38){_0x15e11c(_0x5dca38);}},_0x27eb35=_0x516626=>_0x516626["done"]?_0x5f3661(_0x516626["value"]):Promise["resolve"](_0x516626["value"])["then"](_0x24bf8e,_0x3d784d);_0x27eb35((_0x2fa615=_0x2fa615['apply'](_0xd0c07d,_0x340765))["next"]());});},TMDB_API_KEY="439c478a771f35c05022f9feabcca01c",TMDB_BASE_URL="https://api.themoviedb.org/3",WINGS_API_BASE="https://api.speedracelight.com",USER_AGENT="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",REQUEST_HEADERS={'User-Agent':USER_AGENT,'Accept':"*/*",'Origin':"https://www.vidking.net",'Referer':"https://www.vidking.net/",'Cache-Control':'no-cache,\x20no-store,\x20must-revalidate','Pragma':'no-cache','Expires':'0'},SERVERS={'Hydrogen':{'path':"cdn/sources-with-title"},'Titanium':{'path':"tejo/sources-with-title"},'Oxygen':{'path':"neon2/sources-with-title"},'Lithium':{'path':'downloader2/sources-with-title'},'Krypton':{'path':"ym/sources-with-title"},'Carbon':{'path':"mb-flix/sources-with-title"},'Aluminium':{'path':'lamovie/sources-with-title'},'Nitrogen':{'path':"m4uhd/sources-with-title"},'Neon':{'path':'superflix/sources-with-title'},'Helium':{'path':"1movies/sources-with-title"}},jl=[0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174],Tf=[0x67452301,0xefcdab89,0x98badcfe,0x10325476],Js=0x3d,_f=0x8,ms=0x9e3779b9,Ys=[0x6d,0x76,0x6d,0x31],Sf=_0x37e181=>(_0x37e181*(_0x37e181+0x1)&0x1)===0x0,bf=_0x391c9f=>(_0x391c9f*(_0x391c9f+0x1)&0x1)===0x1;function ui(_0x55d008){const _0x59f141=_0xa7424a;return _0x55d008>>>=0x0,_0x55d008^=_0x55d008>>>0x10,_0x55d008=Math['imul'](_0x55d008,0x85ebca6b)>>>0x0,_0x55d008^=_0x55d008>>>0xd,_0x55d008=Math["imul"](_0x55d008,0xc2b2ae35)>>>0x0,_0x55d008^=_0x55d008>>>0x10,_0x55d008>>>0x0;}function ps(_0x347f79,_0x7edf3f){return _0x347f79>>>=0x0,_0x7edf3f&=0x1f,_0x7edf3f===0x0?_0x347f79>>>0x0:(_0x347f79<<_0x7edf3f|_0x347f79>>>0x20-_0x7edf3f)>>>0x0;}function If(_0x1f22c0){const _0x287fb3={_0x298dcc:0x221,_0x363fe6:0x1fe},_0x7e3be0=_0xa7424a;let _0xe6f21=Tf[0x0]>>>0x0;for(let _0x271667=0x0;_0x271667<_0x1f22c0['length'];_0x271667++){_0xe6f21=ps((_0xe6f21^Math["imul"](_0x1f22c0["charCodeAt"](_0x271667),jl[_0x271667&0xf]))>>>0x0,0x5);}return ui(_0xe6f21);}function Af(_0x343e78){const _0x1e8b40=_0xa7424a,_0x462795=new Array(0x100);for(let _0x2202f5=0x0;_0x2202f5<0x100;_0x2202f5++)_0x462795[_0x2202f5]=_0x2202f5;let _0x3654f8=0x0;for(let _0x1593a5=0x0;_0x1593a5<0x100;_0x1593a5++){_0x3654f8=_0x3654f8+_0x462795[_0x1593a5]+_0x343e78["charCodeAt"](_0x1593a5%_0x343e78["length"])&0xff;const _0x393c75=_0x462795[_0x1593a5];_0x462795[_0x1593a5]=_0x462795[_0x3654f8],_0x462795[_0x3654f8]=_0x393c75;}return _0x462795;}function wf(_0x302fd9){const _0x3063e2={_0x324930:0x221},_0x58f133=_0xa7424a;let _0x37b6da=0x811c9dc5;for(let _0x4f989f=0x0;_0x4f989f<_0x302fd9['length'];_0x4f989f++){_0x37b6da=Math["imul"](_0x37b6da^_0x302fd9['charCodeAt'](_0x4f989f),0x1000193)>>>0x0;}return ui(_0x37b6da);}function vf(_0xc8001c,_0x4b2aa1,_0x41cdd8){return((_0xc8001c^_0x4b2aa1)>>>0x0|(_0xc8001c&_0x4b2aa1&_0x41cdd8)>>>0x0)>>>0x0;}function Nf(_0x631558,_0x42b3cc){if(bf(_0x631558['length']))return{'S':Af(_0x631558),'acc':If(_0x631558)};const _0x2cbc01=new Array(Js);let _0x2bb9da=ui(wf(_0x631558)^ui(_0x42b3cc>>>0x0^ms))>>>0x0;for(let _0xfb5e8d=0x0;_0xfb5e8d<_f;_0xfb5e8d++){if(Sf(_0xfb5e8d)){const _0x1a78ae=_0x2bb9da%Js;_0x2bb9da=ps(_0x2bb9da+ms>>>0x0,0x7+(_0xfb5e8d&0x7)),_0x2cbc01[_0x1a78ae]=(_0x2bb9da^ui(_0x2bb9da))>>>0x0,_0x2bb9da=ui(_0x2bb9da+_0x1a78ae>>>0x0);}else _0x2cbc01[_0xfb5e8d]=jl[_0xfb5e8d&0xf];}return{'S':_0x2cbc01,'acc':ui(_0x2bb9da^0xa5a5a5a5)>>>0x0};}function Rf(_0xea83ed,_0x405e02){const _0xf4349d={_0x24af3b:0x203},_0x11d34e=_0xa7424a,_0x15d800=_0xea83ed['S'];let _0x4ac929=_0xea83ed["acc"];const _0x1a9656=_0x4ac929%Js,_0x188ab4=0x0-+(_0x1a9656 in _0x15d800),_0x1d77d1=_0x15d800[_0x1a9656]>>>0x0,_0x3b743f=Math['imul'](ms,_0x405e02+0x1)>>>0x0;let _0x57c0b2=vf(_0x4ac929,(_0x1d77d1^_0x3b743f)>>>0x0,_0x188ab4);return _0x57c0b2=(ps(_0x57c0b2+_0x4ac929>>>0x0,_0x1a9656&0x1f)^ps(_0x4ac929,Math['imul'](_0x1a9656,0x7)&0x1f))>>>0x0,_0x4ac929=ui(_0x57c0b2+ms>>>0x0),_0x15d800[_0x1a9656]=_0x4ac929>>>0x0,_0xea83ed['acc']=_0x4ac929,_0x4ac929>>>0x0;}function Cf(_0x121578,_0x2c5249,_0x17eb78){const _0x3ddc8a=Nf(_0x121578,_0x2c5249),_0x442b0e=new Uint8Array(_0x17eb78);let _0x396470=0x0;for(let _0x2f7e65=0x0;_0x2f7e65<_0x17eb78;){const _0x402e74=Rf(_0x3ddc8a,_0x396470++);_0x442b0e[_0x2f7e65++]=_0x402e74&0xff,_0x2f7e65<_0x17eb78&&(_0x442b0e[_0x2f7e65++]=_0x402e74>>>0x8&0xff),_0x2f7e65<_0x17eb78&&(_0x442b0e[_0x2f7e65++]=_0x402e74>>>0x10&0xff),_0x2f7e65<_0x17eb78&&(_0x442b0e[_0x2f7e65++]=_0x402e74>>>0x18&0xff);}return _0x442b0e;}function decodeBase64(_0x110a95){const _0x4e0652={_0x2dac4a:0x222,_0x51522a:0x227},_0x1233dc=_0xa7424a,_0x470eb7='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/',_0x2666c3=_0x110a95["replace"](/-/g,'+')["replace"](/_/g,'/')["replace"](/=+$/,''),_0x202116=_0x2666c3['length'],_0x2bfde0=new Uint8Array(Math['floor'](_0x202116*0.75));let _0x5ac383=0x0;for(let _0x38cd70=0x0;_0x38cd70<_0x202116;_0x38cd70+=0x4){const _0xce8190=_0x470eb7["indexOf"](_0x2666c3[_0x38cd70]),_0x245cc4=_0x470eb7["indexOf"](_0x2666c3[_0x38cd70+0x1]||'A'),_0x4163a0=_0x470eb7['indexOf'](_0x2666c3[_0x38cd70+0x2]||'A'),_0x33022f=_0x470eb7["indexOf"](_0x2666c3[_0x38cd70+0x3]||'A');_0x2bfde0[_0x5ac383++]=_0xce8190<<0x2|_0x245cc4>>0x4;if(_0x38cd70+0x2<_0x202116)_0x2bfde0[_0x5ac383++]=(_0x245cc4&0xf)<<0x4|_0x4163a0>>0x2;if(_0x38cd70+0x3<_0x202116)_0x2bfde0[_0x5ac383++]=(_0x4163a0&0x3)<<0x6|_0x33022f;}return _0x2bfde0;}function xf(_0x158e23){return decodeBase64(_0x158e23);}function decryptWingsDatabase(_0x122b4d,_0x55054e,_0x55103e){const _0x5942c9={_0x5b2ddf:0x1bf,_0x3d5209:0x1e8},_0x48f50b=_0xa7424a,_0x450fdb=xf(_0x122b4d),_0x5ae58b=Cf(_0x55054e,_0x55103e,_0x450fdb['length']);for(let _0x29cd02=0x0;_0x29cd02<_0x450fdb["length"];_0x29cd02++)_0x450fdb[_0x29cd02]^=_0x5ae58b[_0x29cd02];for(let _0x2d4c0d=0x0;_0x2d4c0d<Ys["length"];_0x2d4c0d++){if(_0x450fdb[_0x2d4c0d]!==Ys[_0x2d4c0d])throw new Error('decrypt\x20failed:\x20bad\x20seed\x20or\x20tampered\x20payload');}let _0x5eaced='';const _0x4ae975=_0x450fdb['subarray'](Ys['length']);for(let _0x339204=0x0;_0x339204<_0x4ae975['length'];){const _0x677c7e=_0x4ae975[_0x339204++];if(_0x677c7e<0x80)_0x5eaced+=String["fromCharCode"](_0x677c7e);else{if(_0x677c7e>0xbf&&_0x677c7e<0xe0)_0x5eaced+=String['fromCharCode']((_0x677c7e&0x1f)<<0x6|_0x4ae975[_0x339204++]&0x3f);else _0x677c7e>0xdf&&_0x677c7e<0xf0?_0x5eaced+=String['fromCharCode']((_0x677c7e&0xf)<<0xc|(_0x4ae975[_0x339204++]&0x3f)<<0x6|_0x4ae975[_0x339204++]&0x3f):_0x5eaced+=String['fromCharCode']((_0x677c7e&0x7)<<0x12|(_0x4ae975[_0x339204++]&0x3f)<<0xc|(_0x4ae975[_0x339204++]&0x3f)<<0x6|_0x4ae975[_0x339204++]&0x3f);}}return _0x5eaced;}function fetchMediaDetails(_0x5c8a2b,_0x4694a3,_0x3947bd,_0x42bb6e){const _0x4dd6a5={_0x5865a6:0x20f,_0x470cf7:0x222,_0x59c357:0x1c8,_0x2fb6e1:0x1f8,_0x372a14:0x206,_0x7fdfa2:0x1d8,_0x300906:0x1d7,_0x570a71:0x202,_0x2888fe:0x1e2};return __async(this,null,function*(){const _0x14b013=_0x4a66;var _0x2e90ea;let _0x821299=_0x4694a3==='tv'?"45 min":'90\x20min';try{const _0x15806e=_0x4694a3==='tv'?'tv':'movie',_0x2b71a6=String(_0x5c8a2b)["replace"](/\D/g,''),_0x5d776e=TMDB_BASE_URL+'/'+_0x15806e+'/'+_0x2b71a6+"?api_key="+TMDB_API_KEY+"&append_to_response=external_ids",_0x2fbf32=yield __nvFetch(_0x5d776e,{'headers':{'User-Agent':REQUEST_HEADERS['User-Agent'],'Accept':"application/json"}});if(!_0x2fbf32['ok'])throw new Error("TMDB HTTP "+_0x2fbf32['status']);const _0x12de86=yield _0x2fbf32['json']();let _0x4cebc4=_0x821299;if(_0x4694a3==="movie"&&_0x12de86['runtime'])_0x4cebc4=_0x12de86['runtime']+" min";else{if(_0x4694a3==='tv'&&_0x3947bd!=null&&_0x42bb6e!=null){const _0x6695aa=TMDB_BASE_URL+'/tv/'+_0x2b71a6+"/season/"+_0x3947bd+'/episode/'+_0x42bb6e+'?api_key='+TMDB_API_KEY,_0x538a32=yield __nvFetch(_0x6695aa);if(_0x538a32['ok']){const _0x4fbdb1=yield _0x538a32["json"]();if(_0x4fbdb1&&_0x4fbdb1['runtime'])_0x4cebc4=_0x4fbdb1["runtime"]+" min";else _0x12de86["episode_run_time"]&&_0x12de86["episode_run_time"]["length"]>0x0&&(_0x4cebc4=_0x12de86['episode_run_time'][0x0]+'\x20min');}}}return{'title':_0x4694a3==='tv'?_0x12de86["name"]:_0x12de86['title'],'year':(_0x4694a3==='tv'?_0x12de86['first_air_date']:_0x12de86["release_date"]||'')["substring"](0x0,0x4),'imdbId':((_0x2e90ea=_0x12de86['external_ids'])==null?void 0x0:_0x2e90ea['imdb_id'])||null,'mediaType':_0x4694a3,'duration':_0x4cebc4};}catch(_0xd5dfc6){return console['error']('[VidEasy]\x20TMDB\x20details\x20fetch\x20error:\x20'+_0xd5dfc6['message']),{'title':_0x4694a3==='tv'?"Unknown TV Show":'Unknown\x20Movie','year':'N/A','imdbId':null,'mediaType':_0x4694a3,'duration':_0x821299};}});}/*decoder removed*/function getLangCode(_0x1c41f4){const _0x1035f1={_0x312150:0x1e9},_0x125771=_0xa7424a;if(!_0x1c41f4)return'en';const _0x4718de={'english':'en','spanish':'es','french':'fr','german':'de','italian':'it','portuguese':'pt','portuguese\x20(br)':'pt-br','arabic':'ar','japanese':'ja','korean':'ko','tamil':'ta','telugu':'te','malayalam':'ml','kannada':'kn','hindi':'hi','polish':'pl','greek':'el','croatian':'hr','ukrainian':'uk','lithuanian':'lt','thai':'th','estonian':'et','czech':'cs','zh-tw':"zh-tw",'bokmål':'no','dutch':'nl','indonesian':'id','sinhala':'si','swedish':'sv','romanian':'ro','malay':'ms','persian':'fa','slovak':'sk','bulgarian':'bg','turkish':'tr','danish':'da','hebrew':'he','serbian':'sr','vietnamese':'vi','hungarian':'hu','icelandic':'is','albanian':'sq','bosnian':'bs','slovenian':'sl','bengali':'bn','macedonian':'mk'};return _0x4718de[_0x1c41f4["toLowerCase"]()["trim"]()]||'en';}function formatStreamsForNuvio(_0x3fc9fd,_0x15041e,_0x35c64d,_0x515578,_0x1cd419){const _0x3a35d5={_0x26297e:0x1dc,_0x136f9b:0x1db},_0x11abbe={_0x4aad31:0x21a,_0x5219db:0x222,_0x466535:0x210,_0x4240ec:0x229,_0x16fab3:0x200,_0x21b3fe:0x1d4,_0x496661:0x1da,_0x1276cf:0x214,_0x2f48a6:0x219,_0x3fd1d6:0x1df,_0x2c58a6:0x209,_0xa8a3c:0x200,_0x1de014:0x207,_0x5bb290:0x200,_0x48b6a6:0x1ee,_0x1fe6da:0x216,_0x2a0df1:0x1fc,_0x1b73b4:0x1c6,_0x5a2ae2:0x1c2,_0x4afbe1:0x20b},_0x1a87a3=_0xa7424a;try{const _0x5abbc2=JSON['parse'](_0x3fc9fd);if(!_0x5abbc2||typeof _0x5abbc2!=='object')return[];const _0x32061f={'Referer':'https://www.vidking.net/','Origin':'https://www.vidking.net','User-Agent':USER_AGENT},_0x4282e5=(_0x5abbc2['subtitles']||[])["map"](_0x59e79b=>({'url':_0x59e79b['url'],'language':getLangCode(_0x59e79b['language']||_0x59e79b['lang']),'name':_0x59e79b["language"]||_0x59e79b['lang']||'English','headers':_0x32061f})),_0x2a4d52={'Carbon':'💎','Helium':'🎈','Lithium':'🔋','Oxygen':'💨','Krypton':'🦸','Titanium':'🛡️','Hydrogen':'💧','Nitrogen':'🌿','Neon':'💡','Aluminium':'💿'},_0x18ccdd=_0x2a4d52[_0x15041e]||'🎬',_0x4273d5={'Hydrogen':'CDN','Titanium':"Tejo",'Oxygen':'Neon2','Lithium':"Downloader2",'Krypton':'YM','Carbon':'MB-Flix','Aluminium':'LaMovie','Nitrogen':"M4UHD",'Neon':'SuperFlix','Helium':'1Movies'},_0x2840da=_0x4273d5[_0x15041e]||_0x15041e,_0x42db41=[];return(_0x5abbc2['sources']||[])['forEach'](_0x255fe5=>{const _0x5c4c28=_0x1a87a3;if(!_0x255fe5['url'])return;let _0x23cb3c=_0x255fe5["quality"]||'1080p',_0x2ab764=_0x23cb3c["replace"](/\s*server\s*2\s*$/gi,'')['trim']();_0x15041e==="Oxygen"&&(_0x2ab764="Auto");let _0x102aff=_0x2ab764['toLowerCase'](),_0x4dd8b6='⚡\x20'+_0x2ab764;if(_0x102aff["includes"]("2160")||_0x102aff["includes"]('4k'))_0x4dd8b6="🌟 2160p";else{if(_0x102aff["includes"]('1080'))_0x4dd8b6='🔥\x201080p';else{if(_0x102aff['includes']('720'))_0x4dd8b6="⚡ 720p";else _0x102aff==='auto'&&(_0x4dd8b6="⚡ Auto");}}let _0x4c1264='Original\x20Audio',_0x16acb9="🌍 Original Audio";if(_0x15041e==="Hydrogen"||_0x15041e==='Krypton')_0x4c1264='Original\x20Audio',_0x16acb9='🌍\x20Original\x20Audio';else{if(_0x15041e==='Oxygen')_0x4c1264="Multi-Audio",_0x16acb9="🌍 Multi-Audio";else{if(_0x15041e==='Aluminium')_0x4c1264='Dual-Audio',_0x16acb9="🌍 Dual-Audio";else{if(_0x15041e==="Magnesium"){const _0x5193be=(_0x255fe5["title"]||'')['toLowerCase']();_0x5193be["includes"]('bengali')||_0x5193be["includes"]("bangla")?(_0x4c1264="Bengali",_0x16acb9='🇧🇩\x20Bengali'):(_0x4c1264='Normal\x20Hindi',_0x16acb9='🇮🇳\x20Hindi');}}}}const _0x47296f=_0x255fe5["url"]["includes"](".m3u8")?'M3U8':_0x255fe5["url"]["includes"]('.mp4')?'MP4':"MKV",_0x54570b=_0x35c64d["title"]+(_0x35c64d['mediaType']==='tv'?'\x20S'+_0x515578+'E'+_0x1cd419:'');let _0x3f5fa9=_0x15041e;_0x3f5fa9==='Krypton'&&(_0x3f5fa9=_0x3f5fa9['replace'](/\s*(1080p\s+)?server\s*2\s*$/gi,'')["trim"]());const _0x196bb9="🎬 "+_0x54570b+" - ("+_0x35c64d['year']+')\x0a'+_0x4dd8b6+'\x20|\x20'+_0x16acb9+'\x20|\x20🎧\x20AAC\x0a🎞️\x20'+_0x47296f+'\x20|\x20⏱️\x20'+_0x35c64d["duration"]+'\x0a'+_0x18ccdd+'\x20'+_0x3f5fa9+" | 🔗 Provider: "+_0x2840da;_0x42db41['push']({'name':"VidEasy | "+_0x2ab764+'\x20|\x20'+_0x4c1264,'title':_0x196bb9,'size':_0x196bb9,'description':_0x196bb9,'url':_0x255fe5["url"],'quality':'','language':'','headers':_0x32061f,'subtitles':_0x4282e5,'provider':'videasy','_is4k':_0x102aff["includes"]('2160')||_0x102aff['includes']('4k'),'_serverName':_0x15041e});}),_0x42db41;}catch(_0x17e4e6){return console["error"]('[VidEasy]\x20Formatting\x20error:\x20'+_0x17e4e6["message"]),[];}}function fetchFromWingsServer(_0x190fbc,_0x4fe0d1,_0x10593a,_0x53363a,_0xcee714,_0x5e2379,_0x120cb2,_0xc54b2e){const _0x51a429={_0x461d50:0x1cd,_0x350d8e:0x1e0,_0x30a9dc:0x20c,_0x652486:0x1cf};return __async(this,null,function*(){const _0x386b64=_0x4a66,_0x332b00={'title':_0xcee714['title'],'mediaType':_0x10593a,'year':String(_0xcee714['year']),'episodeId':String(_0xc54b2e||0x1),'seasonId':String(_0x120cb2||0x1),'tmdbId':String(_0x53363a),'imdbId':_0xcee714['imdbId']||'','enc':'2','seed':_0x5e2379},_0xa9ede1=Object["keys"](_0x332b00)['map'](_0x4831c7=>encodeURIComponent(_0x4831c7)+'='+encodeURIComponent(_0x332b00[_0x4831c7]))["join"]('&'),_0x1d9945=WINGS_API_BASE+'/'+_0x4fe0d1["path"]+'?'+_0xa9ede1;console["log"]("[VidEasy] Querying server "+_0x190fbc+':\x20'+_0x1d9945);try{const _0x147fb6=yield __nvFetch(_0x1d9945,{'headers':REQUEST_HEADERS});if(!_0x147fb6['ok'])throw new Error('HTTP\x20'+_0x147fb6["status"]);const _0x1f1261=yield _0x147fb6["text"]();if(!_0x1f1261||_0x1f1261["trim"]()==='')throw new Error("Empty response");const _0x355fcb=decryptWingsDatabase(_0x1f1261,_0x5e2379,Number(_0x53363a));if(!_0x355fcb)return[];const _0x3d8ccb=formatStreamsForNuvio(_0x355fcb,_0x190fbc,_0xcee714,_0x120cb2,_0xc54b2e);return console['log']('[VidEasy]\x20✅\x20Found\x20'+_0x3d8ccb['length']+'\x20stream(s)\x20from\x20'+_0x190fbc),_0x3d8ccb;}catch(_0x27e3ce){return console['warn']('[VidEasy]\x20❌\x20Error\x20from\x20'+_0x190fbc+':\x20'+_0x27e3ce['message']),[];}});}/*string-table removed*/function getStreams(_0x4163e4,_0x4a8f82,_0x57a54f=null,_0x2338cf=null){const _0x2bfda2={_0x373f56:0x1dc,_0xb39988:0x1d1,_0x1a3da3:0x21e,_0x460243:0x1cd,_0x36c6d4:0x1ea,_0x5a6d02:0x1db},_0x4cb223={_0x403fa2:0x1fb,_0x2b2115:0x1ec,_0x3c7db6:0x227};return __async(this,null,function*(){const _0x48a053={_0x521a04:0x216,_0x48d69e:0x1ca},_0x29c729=_0x4a66;console["log"]("[VidEasy] Starting extraction for TMDB ID: "+_0x4163e4+',\x20Type:\x20'+_0x4a8f82+(_0x4a8f82==='tv'?',\x20S:'+_0x57a54f+'E:'+_0x2338cf:''));try{const _0x3a5953=yield fetchMediaDetails(_0x4163e4,_0x4a8f82,_0x57a54f,_0x2338cf);if(!_0x3a5953)return console["error"]("[VidEasy] Failed to fetch media details from TMDB."),[];console["log"]("[VidEasy] Media Details: \""+_0x3a5953['title']+"\" ("+_0x3a5953["year"]+')\x20|\x20Duration:\x20'+_0x3a5953["duration"]);const _0x17212a=WINGS_API_BASE+'/seed?mediaId='+_0x4163e4;console['log']('[VidEasy]\x20Fetching\x20seed\x20from:\x20'+_0x17212a);const _0x484d76=yield __nvFetch(_0x17212a,{'headers':REQUEST_HEADERS});if(!_0x484d76['ok'])throw new Error('Seed\x20HTTP\x20'+_0x484d76['status']);const _0x4d5914=yield _0x484d76["json"](),_0x4046c7=_0x4d5914['seed'];if(!_0x4046c7)throw new Error('No\x20seed\x20returned\x20from\x20API');console["log"]("[VidEasy] Seed successfully retrieved: "+_0x4046c7);const _0x62a48c=Object["keys"](SERVERS)['map'](_0x1a6008=>{const _0x174b87=SERVERS[_0x1a6008];return fetchFromWingsServer(_0x1a6008,_0x174b87,_0x4a8f82,_0x4163e4,_0x3a5953,_0x4046c7,_0x57a54f,_0x2338cf);}),_0x278a77=yield Promise['all'](_0x62a48c),_0x1f3c41=[];_0x278a77['forEach'](_0x9bb440=>{const _0x4860b5=_0x29c729;_0x1f3c41["push"](..._0x9bb440);});const _0x415d71=[],_0x2984c0=new Set();_0x1f3c41["forEach"](_0x553aeb=>{const _0x25c223=_0x29c729;!_0x2984c0['has'](_0x553aeb["url"])&&(_0x2984c0['add'](_0x553aeb['url']),_0x415d71["push"](_0x553aeb));});const _0x4daff2=Object["keys"](SERVERS);return _0x415d71["sort"]((_0x5eece5,_0x1f4583)=>{const _0x46db9e=_0x29c729;if(_0x5eece5['_is4k']&&!_0x1f4583["_is4k"])return-0x1;if(!_0x5eece5['_is4k']&&_0x1f4583["_is4k"])return 0x1;const _0x21bcd3=_0x4daff2["indexOf"](_0x5eece5["_serverName"]),_0x55b90c=_0x4daff2["indexOf"](_0x1f4583["_serverName"]);return _0x21bcd3-_0x55b90c;}),console['log']("[VidEasy] Total unique streams found: "+_0x415d71["length"]),_0x415d71;}catch(_0x38985a){return console["error"]('[VidEasy]\x20Error\x20in\x20getStreams:\x20'+_0x38985a["message"]),[];}});}module["exports"]={'getStreams':getStreams};

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
  var PROVIDER = "videasy";
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
