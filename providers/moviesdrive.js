/*
 * nv-plugins moviesdrive.js — FULLY DECODED port of the All-in-One-Nuvio provider (4.24.0 merge pass).
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
var _0x1b28=function(){return "";};var _0x3ddb21=_0x1b28;/*rotation removed*/;var __defProp=Object["defineProperty"],__defProps=Object["defineProperties"],__getOwnPropDescs=Object["getOwnPropertyDescriptors"],__getOwnPropSymbols=Object["getOwnPropertySymbols"],__hasOwnProp=Object["prototype"]["hasOwnProperty"],__propIsEnum=Object["prototype"]["propertyIsEnumerable"],__defNormalProp=(_0x2ee21e,_0x9cbb11,_0x1207f5)=>_0x9cbb11 in _0x2ee21e?__defProp(_0x2ee21e,_0x9cbb11,{'enumerable':!![],'configurable':!![],'writable':!![],'value':_0x1207f5}):_0x2ee21e[_0x9cbb11]=_0x1207f5,__spreadValues=(_0x480f16,_0x1472e7)=>{var _0x39ddb0={_0x1c6c1c:0x18b},_0xd84ed7=_0x3ddb21;for(var _0xe3415d in _0x1472e7||(_0x1472e7={}))if(__hasOwnProp["call"](_0x1472e7,_0xe3415d))__defNormalProp(_0x480f16,_0xe3415d,_0x1472e7[_0xe3415d]);if(__getOwnPropSymbols)for(var _0xe3415d of __getOwnPropSymbols(_0x1472e7)){if(__propIsEnum["call"](_0x1472e7,_0xe3415d))__defNormalProp(_0x480f16,_0xe3415d,_0x1472e7[_0xe3415d]);}return _0x480f16;},__spreadProps=(_0x4e6c84,_0x3807c1)=>__defProps(_0x4e6c84,__getOwnPropDescs(_0x3807c1)),__async=(_0x5b3bff,_0x2e179d,_0x1b79c8)=>{var _0x9b6f33={_0x2adfb8:0x17b};return new Promise((_0xf8680c,_0x315523)=>{var _0x1ad00f=_0x1b28,_0x5d0b89=_0xae726=>{try{_0x502c30(_0x1b79c8['next'](_0xae726));}catch(_0x1611a9){_0x315523(_0x1611a9);}},_0x2bc555=_0x73e0dd=>{try{_0x502c30(_0x1b79c8['throw'](_0x73e0dd));}catch(_0x21f7af){_0x315523(_0x21f7af);}},_0x502c30=_0x2e42b7=>_0x2e42b7["done"]?_0xf8680c(_0x2e42b7['value']):Promise['resolve'](_0x2e42b7['value'])['then'](_0x5d0b89,_0x2bc555);_0x502c30((_0x1b79c8=_0x1b79c8["apply"](_0x5b3bff,_0x2e179d))['next']());});},PROVIDER_NAME="MoviesDrive",MAIN_URL='https://new1.moviesdrive.christmas',ARCHIVE_DOMAIN="https://mdrive.lol",TMDB_KEY='439c478a771f35c05022f9feabcca01c',MOBILE_UAS=["Mozilla/5.0 (Linux; Android 14; Pixel 8 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36","Mozilla/5.0 (Linux; Android 13; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36","Mozilla/5.0 (Linux; Android 12; Pixel 6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Mobile Safari/537.36",'Mozilla/5.0\x20(iPhone;\x20CPU\x20iPhone\x20OS\x2017_0\x20like\x20Mac\x20OS\x20X)\x20AppleWebKit/605.1.15\x20(KHTML,\x20like\x20Gecko)\x20Version/17.0\x20Mobile/15E148\x20Safari/604.1','Mozilla/5.0\x20(iPad;\x20CPU\x20OS\x2017_0\x20like\x20Mac\x20OS\x20X)\x20AppleWebKit/605.1.15\x20(KHTML,\x20like\x20Gecko)\x20Version/17.0\x20Mobile/15E148\x20Safari/604.1'];function getHeaders(_0x1fa484){var _0x1ff31e={_0x3dffc3:0x1b0,_0x558810:0x18f,_0x59d52f:0x1a3},_0x5f280d=_0x3ddb21,_0x35ba14=MOBILE_UAS[Math["floor"](Math["random"]()*MOBILE_UAS["length"])],_0x310ec5={'User-Agent':_0x35ba14,'Accept-Language':"en-US,en;q=0.9"};if(_0x1fa484)for(var _0x2f2f4c in _0x1fa484){_0x310ec5[_0x2f2f4c]=_0x1fa484[_0x2f2f4c];}return _0x310ec5;}/*string-table removed*/function log(_0x3cb9e7){var _0x564510={_0x1d2d76:0x16d},_0x4a7d49=_0x3ddb21;console["log"]('['+PROVIDER_NAME+']\x20'+_0x3cb9e7);}function err(_0x18c6cf){console['error']('['+PROVIDER_NAME+']\x20'+_0x18c6cf);}function fetchText(_0x4a2beb,_0x4a517c,_0x182d6b){var _0x3e664b={_0x8b8de4:0x19b,_0x32ef07:0x1c3,_0xd6d4d2:0x19d};return __async(this,null,function*(){var _0x2b310c=_0x1b28;_0x182d6b=_0x182d6b||0x2ee0;try{var _0x5550da=null;if(typeof AbortSignal!=="undefined"&&AbortSignal["timeout"])_0x5550da=AbortSignal["timeout"](_0x182d6b);var _0x75441b=getHeaders(_0x4a517c&&_0x4a517c['headers']?null:null);if(_0x4a517c&&_0x4a517c["headers"])for(var _0x2c2958 in _0x4a517c['headers']){_0x75441b[_0x2c2958]=_0x4a517c['headers'][_0x2c2958];}var _0x51d043=__spreadProps(__spreadValues({},_0x4a517c||{}),{'headers':_0x75441b});if(_0x5550da)_0x51d043["signal"]=_0x5550da;var _0x2c299f=__nvFetch(_0x4a2beb,_0x51d043),_0xa41b62=new Promise(function(_0x447005,_0x1588cb){setTimeout(function(){var _0x1ae9d6=_0x1b28;_0x1588cb(new Error("Timeout "+_0x182d6b+'ms'));},_0x182d6b);}),_0x123a31=yield Promise['race']([_0x2c299f,_0xa41b62]);if(_0x123a31['ok'])return yield _0x123a31["text"]();return null;}catch(_0x377295){return err("fetch: "+_0x4a2beb['substring'](0x0,0x50)+'\x20->\x20'+(_0x377295['message']||'')),null;}});}function fetchJson(_0xffb6b2,_0x51b88a,_0x58db60){return __async(this,null,function*(){var _0x55378f=yield fetchText(_0xffb6b2,_0x51b88a,_0x58db60);if(!_0x55378f)return null;try{return JSON['parse'](_0x55378f);}catch(_0x3aaa54){return null;}});}function parseQuality(_0x207a50){var _0x3fd9f5=_0x3ddb21,_0x142729=String(_0x207a50||''),_0x5975bf=_0x142729["match"](/(2160|1080|720|480)\s*P/i);if(_0x5975bf)return _0x5975bf[0x1]+'p';if(/4K|UHD/i["test"](_0x142729))return'2160p';if(/1440|2K/i["test"](_0x142729))return "1440p";return'HD';}function extractSiteTitle(_0xfd352a){var _0x3097aa={_0x58ffe2:0x1b3,_0x3505ad:0x1b3},_0x399f58=_0x3ddb21,_0x43b673=_0xfd352a['match'](/<title>(.*?)<\/title>/i);if(!_0x43b673)return'';var _0xb07637=_0x43b673[0x1],_0x2c6147=_0xb07637["match"](/Download\s+(.+?)\s+(?:In HD Free|Free Download)/i);if(_0x2c6147)return _0x2c6147[0x1]["trim"]();var _0x2fb326=_0xb07637["replace"](/^(?:Download\s+)?/,'');return _0x2fb326=_0x2fb326["replace"](/\s+(?:\d{3,4}p\b|4K\b|WEB-DL\b|BluRay\b|HDTV\b|x26[45]\b|HEVC\b|SDR\b|HDR\b|DD\d|DDP\d|Hindi|English|Dual\s*Audio|ESubs?)\b.*$/i,''),_0x2fb326=_0x2fb326["replace"](/\s*[-–|]\s*\w*\s*$/i,'')['trim'](),_0x2fb326=_0x2fb326["replace"](/&#8211;/g,'–'),_0x2fb326||_0xb07637;}function isStrictMatch(_0x26f314,_0x1f74c1,_0x1b5d95,_0xec578d){var _0x2def16={_0x3ea4cd:0x1b3,_0x40603b:0x1b6,_0x275854:0x19f},_0x255206=_0x3ddb21;if(!_0x26f314||!_0x1b5d95)return![];var _0xe750e6=_0x26f314["toLowerCase"]()["replace"](/[^a-z0-9\s]/g,'\x20')['trim']()["replace"](/\s+/g,'\x20'),_0x518fa5=_0x1b5d95['toLowerCase']()['replace'](/download\s*/g,'')["replace"](/[^a-z0-9\s]/g,'\x20')['trim']()["replace"](/\s+/g,'\x20');if(_0x518fa5!==_0xe750e6&&_0x518fa5['indexOf'](_0xe750e6+'\x20')!==0x0&&_0x518fa5["indexOf"]('\x20'+_0xe750e6+'\x20')===-0x1&&_0x518fa5["indexOf"]('\x20'+_0xe750e6)!==_0x518fa5['length']-_0xe750e6["length"]-0x1)return![];if(_0x1f74c1&&_0xec578d){var _0x1dd326=parseInt(_0x1f74c1),_0x3b4e25=parseInt(_0xec578d);if(!isNaN(_0x1dd326)&&!isNaN(_0x3b4e25)&&Math["abs"](_0x1dd326-_0x3b4e25)>0x1)return![];}return!![];}function extractSeasonHtml(_0x3873ce,_0x4bd46b){var _0xd18896={_0x10c9d0:0x1a3,_0x54cbc2:0x19c,_0xa35b8f:0x1c8,_0x3ccfcb:0x1c8,_0x3d9b03:0x18a},_0x55efd6=_0x3ddb21;if(!_0x3873ce||_0x4bd46b==null)return _0x3873ce;var _0x3b2f35=new RegExp('(<h[1-6][^>]*>|<strong[^>]*>|<span[^>]*>)[\x5cs\x5cS]{0,100}?(?:Season|Saison|Staffel)\x5cs*0*(\x5cd+)\x5cb(?!\x5cs*[-–+&])','gi'),_0x3efe2d,_0x3849fe=[];while((_0x3efe2d=_0x3b2f35["exec"](_0x3873ce))!==null){_0x3849fe["push"]({'index':_0x3efe2d["index"],'season':parseInt(_0x3efe2d[0x2])});}var _0x5cc307=-0x1,_0x2636ef=-0x1;for(var _0x841ba2=0x0;_0x841ba2<_0x3849fe["length"];_0x841ba2++){if(_0x3849fe[_0x841ba2]["season"]===_0x4bd46b){if(_0x5cc307===-0x1)_0x5cc307=_0x841ba2;}else _0x2636ef=_0x841ba2;}if(_0x5cc307===-0x1){var _0x56ee7a=new RegExp("(<h[1-6][^>]*>|<strong[^>]*>).*?(?:Season|Saison|Staffel)\\s*0*(\\d+)\\s*[-–]\\s*0*(\\d+)",'gi'),_0x3a5bde,_0x189f10=-0x1;while((_0x3a5bde=_0x56ee7a["exec"](_0x3873ce))!==null){if(_0x4bd46b>=parseInt(_0x3a5bde[0x2])&&_0x4bd46b<=parseInt(_0x3a5bde[0x3])){_0x189f10=_0x3a5bde["index"];break;}}if(_0x189f10!==-0x1)return _0x3873ce['substring'](_0x189f10);return null;}var _0x51ced9=_0x3849fe[_0x5cc307]['index'];if(_0x2636ef>_0x5cc307)for(var _0x145519=0x0;_0x145519<_0x3849fe["length"];_0x145519++){if(_0x3849fe[_0x145519]["season"]===_0x4bd46b&&_0x145519>_0x2636ef){_0x51ced9=_0x3849fe[_0x145519]["index"];break;}}var _0x487c89=_0x3873ce["length"];for(var _0x145519=0x0;_0x145519<_0x3849fe["length"];_0x145519++){if(_0x3849fe[_0x145519]['index']>_0x51ced9&&_0x3849fe[_0x145519]['season']!==_0x4bd46b){_0x487c89=_0x3849fe[_0x145519]['index'];break;}}return _0x3873ce["substring"](_0x51ced9,_0x487c89);}function getMedia(_0xbb6318,_0xe738c6){var _0x3d60ae={_0x322eed:0x190,_0x55be8d:0x1a3,_0x8f516d:0x1c4,_0x2d9916:0x16f,_0x1254da:0x184,_0x2cf536:0x16f,_0x2c9755:0x1ca,_0x104fdc:0x1b5};return __async(this,null,function*(){var _0x4d86f9=_0x1b28,_0x428675=String(_0xbb6318||'')["trim"](),_0x170e1a=_0x428675['indexOf']('tt')===0x0,_0x31bb27=_0xe738c6==='tv'||_0xe738c6==='series'?'tv':'movie';try{if(_0x170e1a){var _0x2d7bba=yield fetchJson("https://api.themoviedb.org/3/find/"+_0x428675+'?api_key='+TMDB_KEY+'&external_source=imdb_id',{},0x2710),_0x433f9e=_0x2d7bba?_0x31bb27==='tv'?_0x2d7bba['tv_results']:_0x2d7bba['movie_results']:null;if(_0x433f9e&&_0x433f9e["length"]>0x0){var _0xbf5684=_0x433f9e[0x0];return{'title':_0x31bb27==='tv'?_0xbf5684["name"]:_0xbf5684['title'],'year':(_0xbf5684["first_air_date"]||_0xbf5684['release_date']||'')["split"]('-')[0x0],'imdb':_0x428675};}}else{var _0x2d7bba=yield fetchJson("https://api.themoviedb.org/3/"+_0x31bb27+'/'+_0x428675+'?api_key='+TMDB_KEY+'&append_to_response=external_ids',{},0x2710);if(_0x2d7bba)return{'title':_0x31bb27==='tv'?_0x2d7bba['name']:_0x2d7bba['title'],'year':(_0x2d7bba["first_air_date"]||_0x2d7bba["release_date"]||'')['split']('-')[0x0],'imdb':_0x2d7bba["imdb_id"]||_0x2d7bba['external_ids']&&_0x2d7bba["external_ids"]['imdb_id']||null};}}catch(_0x52d9a6){err('tmdb:\x20'+_0x52d9a6['message']);}return{'title':_0x428675,'year':null,'imdb':null};});}function searchSite(_0x51507a){var _0x568bf8={_0x52e905:0x17c,_0x5eef80:0x1a3,_0x24db26:0x1af,_0x549035:0x181,_0x563e7e:0x1b8,_0x534a28:0x1ce,_0x1b2416:0x1b8,_0x12f1d0:0x1ca,_0x1d85fb:0x1bf};return __async(this,null,function*(){var _0x1b4ce9=_0x1b28,_0x2f5621=encodeURIComponent(_0x51507a),_0x20834d=MAIN_URL+"/search.php?q="+_0x2f5621+'&per_page=10',_0x1670e2=yield fetchJson(_0x20834d,{'headers':{'Referer':MAIN_URL+'/'}},0x2710);if(!_0x1670e2||!_0x1670e2["hits"]||_0x1670e2["hits"]["length"]===0x0)return log("search zero: "+_0x51507a),[];var _0x15d020=[];for(var _0x295cfe=0x0;_0x295cfe<_0x1670e2['hits']["length"];_0x295cfe++){var _0x571e85=_0x1670e2["hits"][_0x295cfe]["document"];if(_0x571e85&&_0x571e85['permalink']&&_0x571e85['post_title']){var _0x568db1=_0x571e85["post_title"]["match"](/\((\d{4})\)/);_0x15d020["push"]({'title':_0x571e85["post_title"],'href':_0x571e85['permalink'],'year':_0x568db1?parseInt(_0x568db1[0x1]):null,'imdb':_0x571e85["imdb_id"]||null});}}return log("search found "+_0x15d020['length']+'\x20for:\x20'+_0x51507a),_0x15d020;});}function parsePage(_0x38d805,_0x59fa3b,_0x3d6740){var _0x5d3ed3={_0x226f5d:0x179,_0x37c5bf:0x1a3,_0x265cff:0x1c0};return __async(this,null,function*(){var _0x478b31=_0x1b28;if(!_0x3d6740)_0x3d6740=yield fetchText(_0x38d805,{'headers':{'Referer':MAIN_URL+'/'}},0x2ee0);if(!_0x3d6740)return[];var _0x1f5811=_0x59fa3b!=null,_0x4acd25=_0x1f5811?extractSeasonHtml(_0x3d6740,_0x59fa3b):_0x3d6740;if(!_0x4acd25)return log('season\x20'+_0x59fa3b+" not found"),[];var _0x4fd2ea=[],_0x22ce4a=/href="(https?:\/\/mdrive\.lol\/archive\/(\d+)[^"]*)"[^>]*>([\s\S]*?)<\/a>/gi,_0x379837;while((_0x379837=_0x22ce4a['exec'](_0x4acd25))!==null){var _0x48349b=_0x379837[0x3]['replace'](/<[^>]+>/g,'')["trim"]();if(_0x1f5811&&/zip/i["test"](_0x48349b))continue;var _0x53cc16=parseQuality(_0x48349b);if(_0x53cc16==="480p")continue;var _0x3343db=_0x48349b["match"](/\[([\d.]+)\s*(MB|GB|TB)\]/i),_0x4d49ae=_0x3343db?_0x3343db[0x0]:'';_0x4fd2ea['push']({'id':_0x379837[0x2],'url':_0x379837[0x1],'label':_0x48349b,'q':_0x53cc16,'size':_0x4d49ae});}return log('archive\x20links:\x20'+_0x4fd2ea["length"]+(_0x1f5811?" (season "+_0x59fa3b+')':'')),_0x4fd2ea;});}function parseArchive(_0x179c21,_0x47f996){var _0x490fb4={_0xcad21f:0x171,_0x7f4be3:0x195,_0x3ef904:0x1a3,_0x582c03:0x1be};return __async(this,null,function*(){var _0x18c2be=_0x1b28,_0x2efa9f=yield fetchText(_0x179c21,{'headers':{'Referer':MAIN_URL+'/'}},0x2ee0);if(!_0x2efa9f)return[];var _0x21a79f=[],_0x25a348=/https?:\/\/hubcloud\.[a-z]+\/drive\/([a-z0-9_]+)/gi,_0x4d087b;while((_0x4d087b=_0x25a348['exec'](_0x2efa9f))!==null){var _0xf0df4b=_0x4d087b[0x0],_0x4bfc91=_0x47f996!=null;if(_0x4bfc91){var _0x69d020=Math["max"](0x0,_0x4d087b["index"]-0x12c),_0x3ea33d=_0x2efa9f['substring'](_0x69d020,_0x4d087b["index"]),_0x55e850=/(?:EP|Episode|E)\D*0*(\d+)/gi,_0x293a10,_0x5c397d=-0x1;while((_0x293a10=_0x55e850["exec"](_0x3ea33d))!==null){_0x5c397d=parseInt(_0x293a10[0x1]);}if(_0x5c397d===-0x1||_0x5c397d!==_0x47f996)continue;}_0x21a79f['push']({'url':_0xf0df4b,'id':_0x4d087b[0x1]});}return log("archive hosts: "+_0x21a79f["length"]+(_0x4bfc91?" (ep "+_0x47f996+')':'')),_0x21a79f;});}function minutes(){var _0x355d14=_0x3ddb21;return String(new Date()["getMinutes"]());}function decodeBase64(_0x3296ae){var _0x1d669a={_0x3dda01:0x17f,_0x3e07c1:0x1c2},_0x39885b=_0x3ddb21;if(typeof atob==="function")return atob(_0x3296ae);var _0x2adb70="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",_0x4e36c8='';_0x3296ae=String(_0x3296ae)['replace'](/=+$/,'');for(var _0x4bd2b3=0x0,_0x4145ab,_0x499df8,_0x3312c6=0x0;_0x499df8=_0x3296ae["charAt"](_0x3312c6++);~_0x499df8&&(_0x4145ab=_0x4bd2b3%0x4?_0x4145ab*0x40+_0x499df8:_0x499df8,_0x4bd2b3++%0x4)?_0x4e36c8+=String["fromCharCode"](0xff&_0x4145ab>>(-0x2*_0x4bd2b3&0x6)):0x0){_0x499df8=_0x2adb70['indexOf'](_0x499df8);}return _0x4e36c8;}function resolveHubcloud(_0x38c6c1,_0x2f73f6,_0x52e29f){var _0x1fdd56={_0x2919dd:0x170,_0x4c7235:0x18d,_0x284510:0x189,_0x50b75c:0x1ce,_0x59b1ce:0x192,_0x56fd43:0x1a3,_0x5d2e0e:0x1ce};return __async(this,null,function*(){var _0x14e00a=_0x1b28,_0x3f4292=yield fetchText(_0x38c6c1,{'headers':{'Cookie':'xla=s4t','Referer':ARCHIVE_DOMAIN+'/'}},0x2ee0);if(!_0x3f4292)return[];var _0x3cdbfa=null,_0x37fde1=_0x3f4292['match'](/var\s+url\s*=\s*'([^']+)'/);if(_0x37fde1)_0x3cdbfa=_0x37fde1[0x1];if(!_0x3cdbfa){var _0x54f7b3=_0x3f4292['match'](/<a\s+id="download"\s+(?:x-href|href)="([^"]+)"/);if(_0x54f7b3){_0x3cdbfa=_0x54f7b3[0x1];if(!_0x3cdbfa["startsWith"]("http"))try{_0x3cdbfa=decodeBase64(_0x3cdbfa);}catch(_0x405955){}}}if(!_0x3cdbfa)return[];var _0x23b14f=yield fetchText(_0x3cdbfa,{'headers':{'Cookie':"xla=s4t",'Referer':_0x38c6c1}},0x3a98);if(!_0x23b14f)return[];var _0x466e8b=[],_0x25c484,_0x5cc09a=/href="(https?:\/\/fsl\.gigabytes\.icu[^"]+)"/gi;while((_0x25c484=_0x5cc09a['exec'](_0x23b14f))!==null){_0x466e8b["push"]({'type':"FSLv2",'url':_0x25c484[0x1],'quality':_0x2f73f6,'size':_0x52e29f||''});}var _0x308d35=/href="(https?:\/\/(?:pub-[a-z0-9]+\.r2\.dev|[a-z0-9.]+\.buzz)[^"]+)"/gi;while((_0x25c484=_0x308d35['exec'](_0x23b14f))!==null){_0x466e8b['push']({'type':"FSL",'url':_0x25c484[0x1]+'1'+minutes(),'quality':_0x2f73f6,'size':_0x52e29f||''});}if(_0x466e8b["length"]===0x0){var _0x18d3d8=_0x23b14f["match"](/https?:\/\/[^\s"'<>]+\?token=\d+/);if(_0x18d3d8){var _0x2fdf6d=_0x18d3d8[0x0]['replace'](/["'].*$/,'')['replace'](/[<>].*$/,'');_0x466e8b["push"]({'type':"FSL",'url':_0x2fdf6d+'1'+minutes(),'quality':_0x2f73f6,'size':_0x52e29f||''});}}return _0x466e8b;});}function dedupe(_0x4a21fe){var _0x5a8e9e=_0x3ddb21,_0x3e3cfd={};return(_0x4a21fe||[])["filter"](function(_0x2443fa){var _0x2b2554=_0x5a8e9e;if(!_0x2443fa||!_0x2443fa['url']||_0x3e3cfd[_0x2443fa["url"]])return![];return _0x3e3cfd[_0x2443fa['url']]=!![],!![];});}function pad2(_0xadde42){return _0xadde42!=null&&_0xadde42<0xa?'0'+_0xadde42:String(_0xadde42);}/*decoder removed*/function getStreams(_0x422544,_0x22e02e,_0x23bfb7,_0x452dc8){var _0x229e68={_0x27c140:0x1a9,_0x5310c5:0x16e,_0x281b89:0x17a,_0x3dba1b:0x174,_0x36ef7c:0x172,_0x5ca4e1:0x172,_0x1fbd3f:0x1b6,_0x23a391:0x198,_0x58e055:0x168,_0x4e1d80:0x173,_0x4d57e4:0x186,_0x519aaa:0x1a3,_0x225da5:0x1c9,_0x26eff1:0x1ba,_0x3c84b4:0x169,_0xbd5e4f:0x197,_0x432acc:0x1a3,_0x150f52:0x1aa,_0x18b8de:0x197,_0x203534:0x18c,_0x256583:0x1bb},_0x15028c={_0x2526e3:0x1a8};return __async(this,null,function*(){var _0x27d80c={_0x4af985:0x180,_0x26603d:0x1ce,_0x122307:0x178},_0x5831f0=_0x1b28;try{log('request:\x20id='+_0x422544+'\x20type='+_0x22e02e+" s="+_0x23bfb7+'\x20e='+_0x452dc8);var _0x80a9ba=yield getMedia(_0x422544,_0x22e02e);if(!_0x80a9ba||!_0x80a9ba['title'])return[];var _0x3c2b61=_0x22e02e==='tv'||_0x22e02e==="series",_0x32690e=_0x23bfb7!=null?Number(_0x23bfb7):null,_0x4b55d2=_0x452dc8!=null?Number(_0x452dc8):null;log('resolved:\x20\x22'+_0x80a9ba['title']+"\" ("+(_0x80a9ba["year"]||'?')+')');var _0x3625dd,_0x5a4b70,_0x1ee22f=null,_0x30d5f4=null;if(_0x80a9ba['imdb']&&_0x80a9ba["imdb"]['indexOf']('tt')===0x0){_0x3625dd=yield searchSite(_0x80a9ba["imdb"]);if(_0x3c2b61&&_0x32690e!=null)for(_0x5a4b70=0x0;_0x5a4b70<_0x3625dd['length'];_0x5a4b70++){if(_0x3625dd[_0x5a4b70]['imdb']!==_0x80a9ba['imdb'])continue;var _0x53e4fd=_0x3625dd[_0x5a4b70]["href"]["indexOf"]("http")===0x0?_0x3625dd[_0x5a4b70]['href']:MAIN_URL+_0x3625dd[_0x5a4b70]["href"],_0x38d8cb=yield fetchText(_0x53e4fd,{'headers':{'Referer':MAIN_URL+'/'}},0x2ee0);if(_0x38d8cb&&extractSeasonHtml(_0x38d8cb,_0x32690e)!==null){_0x1ee22f=_0x3625dd[_0x5a4b70],_0x30d5f4=_0x38d8cb,log('imdb\x20season\x20match:\x20'+_0x1ee22f['title']);break;}}else for(_0x5a4b70=0x0;_0x5a4b70<_0x3625dd['length'];_0x5a4b70++){if(_0x3625dd[_0x5a4b70]['imdb']===_0x80a9ba["imdb"]){_0x1ee22f=_0x3625dd[_0x5a4b70],log('imdb\x20exact\x20match:\x20'+_0x1ee22f['title']);break;}}}if(!_0x1ee22f){_0x3625dd=yield searchSite(_0x80a9ba['title']);for(_0x5a4b70=0x0;_0x5a4b70<_0x3625dd["length"];_0x5a4b70++){if(isStrictMatch(_0x80a9ba['title'],_0x80a9ba['year'],_0x3625dd[_0x5a4b70]['title'],_0x3625dd[_0x5a4b70]['year'])){var _0x53e4fd=_0x3625dd[_0x5a4b70]['href']["indexOf"]('http')===0x0?_0x3625dd[_0x5a4b70]['href']:MAIN_URL+_0x3625dd[_0x5a4b70]['href'],_0x38d8cb=yield fetchText(_0x53e4fd,{'headers':{'Referer':MAIN_URL+'/'}},0x2ee0);if(!_0x3c2b61||extractSeasonHtml(_0x38d8cb,_0x32690e)!==null){_0x1ee22f=_0x3625dd[_0x5a4b70],_0x30d5f4=_0x38d8cb,log("title match: "+_0x1ee22f['title']);break;}}}}if(!_0x1ee22f)return log('no\x20match'),[];if(!_0x30d5f4){var _0x1cf2f4=_0x1ee22f["href"]['indexOf']("http")===0x0?_0x1ee22f["href"]:MAIN_URL+_0x1ee22f['href'];_0x30d5f4=yield fetchText(_0x1cf2f4,{'headers':{'Referer':MAIN_URL+'/'}},0x2ee0);if(!_0x30d5f4)return[];}var _0x5ca7fc=extractSiteTitle(_0x30d5f4),_0x175107='';_0x3c2b61&&(_0x175107=(_0x5ca7fc||_0x80a9ba["title"])+'\x20[S'+pad2(_0x32690e)+'E'+pad2(_0x4b55d2)+']');var _0x37c3c7=yield parsePage(_0x1ee22f["href"]['indexOf']("http")===0x0?_0x1ee22f['href']:MAIN_URL+_0x1ee22f["href"],_0x32690e,_0x30d5f4);_0x37c3c7=_0x37c3c7["filter"](function(_0x42c250){var _0x819127=_0x5831f0;return _0x42c250['q']!=="480p";});if(_0x37c3c7['length']===0x0)return log("no 720p/1080p/4k archives"),[];log("processing "+_0x37c3c7["length"]+'\x20archive\x20links');var _0xd321cf=[];for(var _0x36e672=0x0;_0x36e672<_0x37c3c7["length"];_0x36e672++){var _0x46b460=_0x37c3c7[_0x36e672];try{var _0x457ccf=yield parseArchive(_0x46b460["url"],_0x4b55d2);_0x457ccf["forEach"](function(_0x5ab293){var _0x1a2b1d=_0x5831f0;_0xd321cf['push']({'url':_0x5ab293["url"],'q':_0x46b460['q'],'size':_0x46b460["size"]});});}catch(_0x599e52){}}if(_0xd321cf['length']===0x0)return log('no\x20hubcloud\x20hosts'),[];log("resolving "+_0xd321cf["length"]+" hubcloud links");var _0x17b524=[];for(var _0x36e672=0x0;_0x36e672<_0xd321cf['length'];_0x36e672++){var _0x3e9a8a=_0xd321cf[_0x36e672];try{var _0x2f35e0=yield resolveHubcloud(_0x3e9a8a["url"],_0x3e9a8a['q'],_0x3e9a8a["size"]);_0x17b524['push'](_0x2f35e0);}catch(_0xb33246){}}var _0x38b1ee=[];_0x17b524["forEach"](function(_0x4c192e){var _0x159027={_0x36cca0:0x1ce};_0x4c192e['forEach'](function(_0x18407c){var _0x2f55f8=_0x1b28;_0x38b1ee["push"](_0x18407c);});});if(_0x38b1ee["length"]===0x0)return log("no FSL streams resolved"),[];var _0x15c9cb=_0x3c2b61&&_0x175107?_0x175107:_0x5ca7fc,_0x547bcd=[];_0x38b1ee["forEach"](function(_0x45713d){var _0x34032d=_0x5831f0,_0x50ca8b=_0x45713d["size"]?'\x20'+_0x45713d['size']:'',_0x33e317=_0x15c9cb+'\x20-\x20'+PROVIDER_NAME;_0x547bcd["push"]({'name':_0x33e317,'title':"Auto",'url':_0x45713d['url'],'quality':_0x45713d['quality'],'size':'('+_0x45713d['type']+')'+_0x50ca8b,'behaviorHints':{'notWebReady':!![],'proxyHeaders':{'request':{'Referer':ARCHIVE_DOMAIN+'/'}}}});}),_0x547bcd=dedupe(_0x547bcd);var _0x196043={'2160p':0x4,'1080p':0x3,'720p':0x2,'HD':0x1};return _0x547bcd["sort"](function(_0xc2ae38,_0x50b6d5){var _0x2b3821=_0x5831f0,_0x520980=function(_0x1bf9bf){var _0x4e024a=_0x1b28;return _0x1bf9bf['indexOf']("(FSLv2)")!==-0x1?0x1:0x0;},_0x25eccc=_0x520980(_0xc2ae38['name']),_0x217a05=_0x520980(_0x50b6d5["name"]);if(_0x25eccc!==_0x217a05)return _0x217a05-_0x25eccc;return(_0x196043[_0x50b6d5["quality"]]||0x0)-(_0x196043[_0xc2ae38["quality"]]||0x0);}),log("returning "+_0x547bcd["length"]+" streams"),_0x547bcd;}catch(_0xec3640){return err("fatal: "+_0xec3640['message']),[];}});}typeof module!=="undefined"&&module['exports']?module['exports']={'getStreams':getStreams}:global['getStreams']=getStreams;

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
  var PROVIDER = "moviesdrive";
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
