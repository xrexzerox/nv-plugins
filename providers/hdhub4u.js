/*
 * nv-plugins hdhub4u.js — FULLY DECODED port of the All-in-One-Nuvio provider (4.24.0 merge pass).
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
var _0x1850=function(){return "";};/*string-table removed*/const _0x4cfe8c=_0x1850;/*rotation removed*/;var __create=Object['create'],__defProp=Object["defineProperty"],__defProps=Object["defineProperties"],__getOwnPropDesc=Object["getOwnPropertyDescriptor"],__getOwnPropDescs=Object["getOwnPropertyDescriptors"],__getOwnPropNames=Object["getOwnPropertyNames"],__getOwnPropSymbols=Object["getOwnPropertySymbols"],__getProtoOf=Object['getPrototypeOf'],__hasOwnProp=Object['prototype']["hasOwnProperty"],__propIsEnum=Object["prototype"]["propertyIsEnumerable"],__defNormalProp=(_0x88bbc8,_0x59e2f6,_0x38ec05)=>_0x59e2f6 in _0x88bbc8?__defProp(_0x88bbc8,_0x59e2f6,{'enumerable':!![],'configurable':!![],'writable':!![],'value':_0x38ec05}):_0x88bbc8[_0x59e2f6]=_0x38ec05,__spreadValues=(_0x586ac9,_0x243eff)=>{const _0x3d2fc4=_0x4cfe8c;for(var _0x4d4ed6 in _0x243eff||(_0x243eff={}))if(__hasOwnProp['call'](_0x243eff,_0x4d4ed6))__defNormalProp(_0x586ac9,_0x4d4ed6,_0x243eff[_0x4d4ed6]);if(__getOwnPropSymbols)for(var _0x4d4ed6 of __getOwnPropSymbols(_0x243eff)){if(__propIsEnum["call"](_0x243eff,_0x4d4ed6))__defNormalProp(_0x586ac9,_0x4d4ed6,_0x243eff[_0x4d4ed6]);}return _0x586ac9;},__spreadProps=(_0x2528ff,_0x869b1a)=>__defProps(_0x2528ff,__getOwnPropDescs(_0x869b1a)),__copyProps=(_0x5d58d3,_0x472071,_0x7c0d03,_0xd1c451)=>{const _0x1dddaa={_0x1e108d:0x126,_0x4dbc4a:0x145},_0x4d34db=_0x4cfe8c;if(_0x472071&&typeof _0x472071==="object"||typeof _0x472071==="function"){for(let _0x32d39b of __getOwnPropNames(_0x472071))if(!__hasOwnProp["call"](_0x5d58d3,_0x32d39b)&&_0x32d39b!==_0x7c0d03)__defProp(_0x5d58d3,_0x32d39b,{'get':()=>_0x472071[_0x32d39b],'enumerable':!(_0xd1c451=__getOwnPropDesc(_0x472071,_0x32d39b))||_0xd1c451["enumerable"]});}return _0x5d58d3;},__toESM=(_0x522601,_0x375c55,_0x1820cc)=>(_0x1820cc=_0x522601!=null?__create(__getProtoOf(_0x522601)):{},__copyProps(_0x375c55||!_0x522601||!_0x522601["__esModule"]?__defProp(_0x1820cc,'default',{'value':_0x522601,'enumerable':!![]}):_0x1820cc,_0x522601)),__async=(_0x1389ca,_0x1ef12d,_0x2af041)=>{return new Promise((_0x217d5a,_0x5e2a10)=>{const _0x928a11={_0x2c1548:0x103},_0x3664ae=_0x1850;var _0x1c6bd1=_0x464de7=>{const _0x1eac05=_0x1850;try{_0x2518b0(_0x2af041["next"](_0x464de7));}catch(_0x4da465){_0x5e2a10(_0x4da465);}},_0xd2a47f=_0x185354=>{const _0x536ed0=_0x1850;try{_0x2518b0(_0x2af041["throw"](_0x185354));}catch(_0x325b10){_0x5e2a10(_0x325b10);}},_0x2518b0=_0x3b9469=>_0x3b9469['done']?_0x217d5a(_0x3b9469["value"]):Promise["resolve"](_0x3b9469['value'])['then'](_0x1c6bd1,_0xd2a47f);_0x2518b0((_0x2af041=_0x2af041['apply'](_0x1389ca,_0x1ef12d))['next']());});},import_cheerio_without_node_native2=__toESM(__nvRequire('cheerio-without-node-native')),TMDB_API_KEY="439c478a771f35c05022f9feabcca01c",TMDB_BASE_URL="https://api.themoviedb.org/3",MAIN_URL="https://new1.hdhub4u.cl",DOMAINS_URL="https://raw.githubusercontent.com/phisher98/TVVVV/refs/heads/main/domains.json",DOMAIN_CACHE_TTL=0x4*0x3c*0x3c*0x3e8,HEADERS={'User-Agent':'Mozilla/5.0\x20(Windows\x20NT\x2010.0;\x20Win64;\x20x64)\x20AppleWebKit/537.36\x20(KHTML,\x20like\x20Gecko)\x20Chrome/131.0.0.0\x20Safari/537.36\x20Edg/131.0.0.0','Cookie':"xla=s4t",'Referer':MAIN_URL+'/'};function updateMainUrl(_0x2bc9ad){const _0x633fe5=_0x4cfe8c;MAIN_URL=_0x2bc9ad,HEADERS["Referer"]=_0x2bc9ad+'/';}var domainCacheTimestamp=0x0;function formatBytes(_0x3c872b){const _0x3b4efe={_0x5bc7d1:0xc5,_0x1039cb:0xa9},_0x84971e=_0x4cfe8c;if(!_0x3c872b||_0x3c872b===0x0)return "Unknown";const _0x58bc76=0x400,_0x4e1b4d=["Bytes",'KB','MB','GB','TB'],_0x15c2ec=Math['floor'](Math['log'](_0x3c872b)/Math['log'](_0x58bc76));return parseFloat((_0x3c872b/Math["pow"](_0x58bc76,_0x15c2ec))['toFixed'](0x1))+'\x20'+_0x4e1b4d[_0x15c2ec];}function extractServerName(_0x308c00){const _0x188b6f={_0x316e2a:0xd6,_0x3266c4:0x108,_0x4f30b0:0x11a,_0x2e18fb:0xab,_0x32d545:0xd7},_0xf06425=_0x4cfe8c;if(!_0x308c00)return'Unknown';if(_0x308c00["startsWith"]('HubCloud')){const _0x36e3ab=_0x308c00['match'](/HubCloud(?:\s*-\s*([^[\]]+))?/);return _0x36e3ab?_0x36e3ab[0x1]||'Download':'HubCloud';}if(_0x308c00['startsWith']('Pixeldrain'))return'Pixeldrain';if(_0x308c00["startsWith"]('StreamTape'))return "StreamTape";if(_0x308c00["startsWith"]("HubCdn"))return "HubCdn";if(_0x308c00["startsWith"]("HbLinks"))return "HbLinks";if(_0x308c00['startsWith']("Hubstream"))return "Hubstream";return _0x308c00['replace'](/^www\./,'')["split"]('.')[0x0];}function rot13(_0x457d9a){const _0x8001ce={_0x55e8e0:0x112},_0x2cd556=_0x4cfe8c;return _0x457d9a["replace"](/[a-zA-Z]/g,function(_0x359643){const _0x3d42fb=_0x2cd556;return String["fromCharCode"]((_0x359643<='Z'?0x5a:0x7a)>=(_0x359643=_0x359643['charCodeAt'](0x0)+0xd)?_0x359643:_0x359643-0x1a);});}var BASE64_CHARS="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";function atob(_0x5adf3b){const _0x36b0d1={_0x3d0b0c:0xb5},_0x4be03e=_0x4cfe8c;if(!_0x5adf3b)return'';let _0x54ae01=String(_0x5adf3b)['replace'](/=+$/,''),_0x26a2bf='',_0x3af0cf=0x0,_0x4c155d,_0x23c38e,_0x23662f=0x0;while(_0x23c38e=_0x54ae01["charAt"](_0x23662f++)){_0x23c38e=BASE64_CHARS['indexOf'](_0x23c38e),~_0x23c38e&&(_0x4c155d=_0x3af0cf%0x4?_0x4c155d*0x40+_0x23c38e:_0x23c38e,_0x3af0cf++%0x4&&(_0x26a2bf+=String['fromCharCode'](0xff&_0x4c155d>>(-0x2*_0x3af0cf&0x6))));}return _0x26a2bf;}function cleanTitle(_0x297d1f){const _0x78f195={_0x298a74:0xf9,_0x38b158:0x112,_0x28f38f:0xec,_0x3d84f:0x15c,_0x25fea9:0xdd,_0x33b0d2:0x133,_0x3160f9:0xd1},_0x4d4d4a={_0x37a267:0x15e,_0x1540dc:0x11f,_0x987da1:0xfa},_0x2b47ef=_0x4cfe8c;let _0x5d2ab8=_0x297d1f['replace'](/\.[a-zA-Z0-9]{2,4}$/,'');const _0x41af30=_0x5d2ab8['replace'](/WEB[-_. ]?DL/gi,"WEB-DL")["replace"](/WEB[-_. ]?RIP/gi,'WEBRIP')['replace'](/H[ .]?265/gi,"H265")["replace"](/H[ .]?264/gi,"H264")["replace"](/DDP[ .]?([0-9]\.[0-9])/gi,'DDP$1'),_0x23ddbd=_0x41af30["split"](/[\s_.]/),_0x4c9494=new Set(['WEB-DL',"WEBRIP",'BLURAY','HDRIP','DVDRIP','HDTV',"CAM",'TS',"BRRIP",'BDRIP']),_0x41a9cf=new Set(['H264','H265','X264','X265','HEVC',"AVC"]),_0x13d603=["AAC",'AC3',"DTS",'MP3','FLAC','DD','DDP','EAC3'],_0x44d8f7=new Set(['ATMOS']),_0x4b10ed=new Set(['SDR','HDR','HDR10','HDR10+','DV','DOLBYVISION']),_0x522135=_0x23ddbd['map'](_0x58df58=>{const _0x12c8ab=_0x2b47ef,_0xe390ee=_0x58df58["toUpperCase"]();if(_0x4c9494['has'](_0xe390ee))return _0xe390ee;if(_0x41a9cf['has'](_0xe390ee))return _0xe390ee;if(_0x13d603["some"](_0x1a4762=>_0xe390ee["startsWith"](_0x1a4762)))return _0xe390ee;if(_0x44d8f7["has"](_0xe390ee))return _0xe390ee;if(_0x4b10ed['has'](_0xe390ee))return _0xe390ee==='DOLBYVISION'||_0xe390ee==='DV'?"DOLBYVISION":_0xe390ee;if(_0xe390ee==='NF'||_0xe390ee==='CR')return _0xe390ee;return null;})["filter"](Boolean);return[...new Set(_0x522135)]["join"]('\x20');}function fetchAndUpdateDomain(){const _0x1937ef={_0x3401ab:0x14d};return __async(this,null,function*(){const _0x14b1d5=_0x1850,_0x36af68=Date["now"]();if(_0x36af68-domainCacheTimestamp<DOMAIN_CACHE_TTL)return;console['log']('[HDHub4u]\x20Fetching\x20latest\x20domain...');try{const _0x277b12=yield __nvFetch(DOMAINS_URL,{'method':"GET",'headers':{'User-Agent':"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}});if(_0x277b12['ok']){const _0x34efb6=yield _0x277b12['json']();if(_0x34efb6&&_0x34efb6["HDHUB4u"]){const _0x5f1f97=_0x34efb6["HDHUB4u"];_0x5f1f97!==MAIN_URL&&(console['log']('[HDHub4u]\x20Updating\x20domain\x20from\x20'+MAIN_URL+" to "+_0x5f1f97),updateMainUrl(_0x5f1f97),domainCacheTimestamp=_0x36af68);}}}catch(_0xbe2ec5){console['error']("[HDHub4u] Failed to fetch latest domains: "+_0xbe2ec5["message"]);}});}function getCurrentDomain(){return __async(this,null,function*(){return yield fetchAndUpdateDomain(),MAIN_URL;});}function normalizeTitle(_0x4ff874){const _0x5bcbe8={_0x4c9ca8:0x113,_0x5f0c34:0x112,_0x18539b:0x112,_0xe6898a:0x112,_0x26937b:0xf7},_0x6d1b1a=_0x4cfe8c;if(!_0x4ff874)return'';return _0x4ff874["toLowerCase"]()["replace"](/\b(the|a|an)\b/g,'')["replace"](/[:\-_]/g,'\x20')["replace"](/\s+/g,'\x20')['replace'](/[^\w\s]/g,'')["trim"]();}function calculateTitleSimilarity(_0x46b3e4,_0x1b01ae){const _0x2979ac={_0x54fa97:0x140,_0x2c55ac:0x161,_0x466689:0x149},_0x285d0c=_0x4cfe8c,_0xecd6c9=normalizeTitle(_0x46b3e4),_0x1ce152=normalizeTitle(_0x1b01ae);if(_0xecd6c9===_0x1ce152)return 0x1;const _0x497600=_0xecd6c9['split'](/\s+/)['filter'](_0x973f27=>_0x973f27['length']>0x0),_0x13b7d3=_0x1ce152['split'](/\s+/)['filter'](_0x3d5d0c=>_0x3d5d0c['length']>0x0);if(_0x497600["length"]===0x0||_0x13b7d3['length']===0x0)return 0x0;const _0x29dd94=new Set(_0x497600),_0x5c74c1=new Set(_0x13b7d3),_0x3778b0=_0x497600["filter"](_0x394f3e=>_0x5c74c1["has"](_0x394f3e)),_0x296ff4=new Set([..._0x497600,..._0x13b7d3]),_0x315743=_0x3778b0['length']/_0x296ff4["size"],_0x14fb85=_0x13b7d3["filter"](_0x3d0b09=>!_0x29dd94["has"](_0x3d0b09))['length'];let _0x2872cd=_0x315743-_0x14fb85*0.05;return _0x497600["length"]>0x0&&_0x497600['every'](_0x41c073=>_0x5c74c1['has'](_0x41c073))&&(_0x2872cd+=0.2),_0x2872cd;}function findBestTitleMatch(_0x40cb33,_0x280381,_0x4a7316,_0xd19fba){const _0x1bd18c={_0x259fa5:0x149,_0x2d4b86:0x157,_0x5b134f:0x113,_0x1c792d:0x12f,_0x461f94:0xef,_0x48b604:0xb3,_0x199a01:0x13a},_0x586de5=_0x4cfe8c;if(!_0x280381||_0x280381["length"]===0x0)return null;let _0x136bdf=null,_0x14607c=0x0;for(const _0x550c70 of _0x280381){let _0x9de7ca=calculateTitleSimilarity(_0x40cb33['title'],_0x550c70['title']);if(_0x40cb33['year']&&_0x550c70['year']){const _0x528758=Math['abs'](_0x40cb33['year']-_0x550c70["year"]);if(_0x528758===0x0)_0x9de7ca+=0.2;else{if(_0x528758<=0x1)_0x9de7ca+=0.1;else{if(_0x528758>0x5)_0x9de7ca-=0.3;}}}if(_0x4a7316==='tv'&&_0xd19fba){const _0x592c93=_0x550c70['title']['toLowerCase'](),_0x238fc7=["season "+_0xd19fba,'s'+_0xd19fba,'season\x20'+_0xd19fba["toString"]()["padStart"](0x2,'0'),'s'+_0xd19fba['toString']()['padStart'](0x2,'0')],_0x1e5c67=_0x238fc7["some"](_0xe07ba7=>_0x592c93['includes'](_0xe07ba7)),_0x58c61e=_0x592c93["match"](/season\s*(\d+)|s(\d+)/i);if(_0x58c61e){const _0x23f41f=parseInt(_0x58c61e[0x1]||_0x58c61e[0x2]);_0x23f41f!==_0xd19fba&&(_0x9de7ca-=0.8);}if(_0x1e5c67)_0x9de7ca+=0.5;else _0x9de7ca-=0.3;}(_0x550c70['title']["toLowerCase"]()["includes"]('2160p')||_0x550c70['title']['toLowerCase']()['includes']('4k'))&&(_0x9de7ca+=0.05),_0x9de7ca>_0x14607c&&_0x9de7ca>0.3&&(_0x14607c=_0x9de7ca,_0x136bdf=_0x550c70);}if(_0x136bdf)console['log']("[HDHub4u] Best title match: \""+_0x136bdf["title"]+"\" (score: "+_0x14607c['toFixed'](0x2)+')');return _0x136bdf;}function getTMDBDetails(_0x30f6d5,_0x293f43){const _0x15db4c={_0x4d9e07:0x167,_0x4bc8d2:0x168,_0x521819:0x156,_0x45ae7f:0x13f,_0x1f42fe:0x16b};return __async(this,null,function*(){const _0x25ae9c=_0x1850;var _0x4e4372;const _0x39bb08=_0x293f43==='tv'?'tv':'movie',_0x2bdc62=TMDB_BASE_URL+'/'+_0x39bb08+'/'+_0x30f6d5+"?api_key="+TMDB_API_KEY+"&append_to_response=external_ids",_0x2580ee=yield __nvFetch(_0x2bdc62,{'method':"GET",'headers':{'Accept':'application/json','User-Agent':"Mozilla/5.0"}});if(!_0x2580ee['ok'])throw new Error('TMDB\x20API\x20error:\x20'+_0x2580ee['status']);const _0x35e068=yield _0x2580ee['json'](),_0x4179c8=_0x293f43==='tv'?_0x35e068['name']:_0x35e068['title'],_0x291a1d=_0x293f43==='tv'?_0x35e068["first_air_date"]:_0x35e068["release_date"],_0x316a55=_0x291a1d?parseInt(_0x291a1d['split']('-')[0x0]):null;return{'title':_0x4179c8,'year':_0x316a55,'imdbId':((_0x4e4372=_0x35e068["external_ids"])==null?void 0x0:_0x4e4372["imdb_id"])||null};});}var import_cheerio_without_node_native=__toESM(__nvRequire("cheerio-without-node-native")),import_crypto_js=__toESM(__nvRequire('crypto-js'));/*decoder removed*/function getRedirectLinks(_0x3a4a38){const _0x3d42ce={_0x91b740:0x12d,_0x2be88:0xc9,_0x31c3ba:0x154,_0x5467fc:0xf7,_0x363cc0:0x139,_0x45ded9:0xb9};return __async(this,null,function*(){const _0x2af61e=_0x1850;try{const _0x1dc9b2=yield __nvFetch(_0x3a4a38,{'headers':HEADERS});if(!_0x1dc9b2['ok'])throw new Error('HTTP\x20'+_0x1dc9b2["status"]+':\x20'+_0x1dc9b2["statusText"]);const _0x330cbb=yield _0x1dc9b2["text"](),_0x1b48f6=/s\s*\(\s*['"]o['"]\s*,\s*['"]([A-Za-z0-9+/=]+)['"]|ck\s*\(\s*['"]_wp_http_\d+['"]\s*,\s*['"]([^'"]+)['"]/g;let _0x151934='',_0x1b719f;while((_0x1b719f=_0x1b48f6["exec"](_0x330cbb))!==null){const _0x5bfc8d=_0x1b719f[0x1]||_0x1b719f[0x2];if(_0x5bfc8d)_0x151934+=_0x5bfc8d;}if(!_0x151934){const _0x502bed=_0x330cbb["match"](/window\.location\.href\s*=\s*['"]([^'"]+)['"]/);if(_0x502bed&&_0x502bed[0x1]){const _0x19e414=_0x502bed[0x1];if(_0x19e414!==_0x3a4a38&&!_0x19e414["includes"](_0x3a4a38))return yield getRedirectLinks(_0x19e414);}return null;}const _0x42df4e=atob(rot13(atob(atob(_0x151934)))),_0x3f31d3=JSON['parse'](_0x42df4e),_0x1657a9=atob(_0x3f31d3['o']||'')["trim"]();if(_0x1657a9)return _0x1657a9;const _0x14ed66=atob(_0x3f31d3["data"]||'')["trim"](),_0x3e9646=(_0x3f31d3["blog_url"]||'')["trim"]();if(_0x3e9646&&_0x14ed66){const _0x98b056=yield __nvFetch(_0x3e9646+'?re='+_0x14ed66,{'headers':HEADERS}),_0x36ff79=yield _0x98b056["text"](),_0x49af98=import_cheerio_without_node_native['default']['load'](_0x36ff79);return(_0x49af98("body")["text"]()||_0x36ff79)["trim"]();}return null;}catch(_0x25d58d){return null;}});}function vidStackExtractor(_0x11edee){const _0xc14b88={_0x59755b:0x142,_0x5a8978:0xf7,_0x5b4df0:0x11d,_0x53849c:0x13c,_0x472c4b:0xd4,_0x6dc351:0x157,_0x44d8a9:0xdf};return __async(this,null,function*(){const _0x3f2a40=_0x1850;var _0x3223b7,_0x79fab5,_0x46f594;try{const _0x23102c=_0x11edee['split']('#')['pop']()['split']('/')["pop"](),_0x5c88b3=new URL(_0x11edee)['origin'],_0x55ddcb=_0x5c88b3+"/api/v1/video?id="+_0x23102c,_0x57224b=yield __nvFetch(_0x55ddcb,{'headers':__spreadProps(__spreadValues({},HEADERS),{'Referer':_0x11edee})}),_0x1b50c1=(yield _0x57224b['text']())["trim"](),_0x43e1b9=import_crypto_js["default"]["enc"]["Utf8"]["parse"]("kiemtienmua911ca"),_0x39fcda=["1234567890oiuytr","0123456789abcdef"];for(const _0x3b8c36 of _0x39fcda){try{const _0x479c4a=import_crypto_js['default']["enc"]["Utf8"]["parse"](_0x3b8c36),_0x2965ff=import_crypto_js['default']['AES']['decrypt']({'ciphertext':import_crypto_js['default']['enc']["Hex"]["parse"](_0x1b50c1)},_0x43e1b9,{'iv':_0x479c4a,'mode':import_crypto_js['default']['mode']["CBC"],'padding':import_crypto_js["default"]['pad']['Pkcs7']}),_0x2baea8=_0x2965ff["toString"](import_crypto_js["default"]["enc"]["Utf8"]);if(_0x2baea8&&_0x2baea8['includes']("source")){const _0x18f56d=(_0x79fab5=(_0x3223b7=_0x2baea8['match'](/"source":"(.*?)"/))==null?void 0x0:_0x3223b7[0x1])==null?void 0x0:_0x79fab5['replace'](/\\/g,''),_0x415a15=[],_0x3f7223=(_0x46f594=_0x2baea8['match'](/"subtitle":\{(.*?)\}/))==null?void 0x0:_0x46f594[0x1];if(_0x3f7223){const _0x305160=/"([^"]+)":\s*"([^"]+)"/g;let _0x5d18fa;while((_0x5d18fa=_0x305160['exec'](_0x3f7223))!==null){const _0x808ee3=_0x5d18fa[0x1],_0x3e50c2=_0x5d18fa[0x2]['split']('#')[0x0]["replace"](/\\/g,'');_0x3e50c2&&_0x415a15['push']({'language':_0x808ee3,'url':_0x3e50c2["startsWith"]('http')?_0x3e50c2:''+_0x5c88b3+_0x3e50c2});}}if(_0x18f56d)return[{'source':'Vidstack\x20Hubstream','quality':"M3U8",'url':_0x18f56d['replace']('https:','http:'),'headers':{'Referer':_0x11edee,'Origin':_0x11edee['split']('/')["pop"]()},'subtitles':_0x415a15}];}}catch(_0x5d46c8){}}return[];}catch(_0x4ea3d9){return[];}});}function hbLinksExtractor(_0x1b96b2){const _0x672eee={_0x90bf4c:0x128,_0x50f821:0xe9};return __async(this,null,function*(){const _0x5c90df=_0x1850;try{const _0x1b2fba=yield __nvFetch(_0x1b96b2,{'headers':__spreadProps(__spreadValues({},HEADERS),{'Referer':_0x1b96b2})}),_0xf11254=yield _0x1b2fba['text'](),_0xaaa57f=import_cheerio_without_node_native["default"]["load"](_0xf11254),_0xe0515a=_0xaaa57f('h3\x20a,\x20h5\x20a,\x20div.entry-content\x20p\x20a')['map']((_0x14f8b3,_0x38ee5b)=>_0xaaa57f(_0x38ee5b)['attr']('href'))["get"](),_0x295da5=yield Promise["all"](_0xe0515a['map'](_0x438144=>loadExtractor(_0x438144,_0x1b96b2)));return _0x295da5['flat']()['map'](_0x57c356=>__spreadProps(__spreadValues({},_0x57c356),{'source':_0x57c356['source']+" Hblinks"}));}catch(_0x9238c2){return[];}});}function pixelDrainExtractor(_0x1a2bd7){const _0x274678={_0x2f5ac0:0xd2,_0x546ad9:0xd7};return __async(this,null,function*(){const _0x71334a=_0x1850;var _0x155c03;try{const _0xe2832d=new URL(_0x1a2bd7),_0x324dba=_0xe2832d["protocol"]+'//'+_0xe2832d["hostname"],_0x1f4e3f=((_0x155c03=_0x1a2bd7['match'](/(?:file|u)\/([A-Za-z0-9]+)/))==null?void 0x0:_0x155c03[0x1])||_0x1a2bd7["split"]('/')['pop']();if(!_0x1f4e3f)return[{'source':"Pixeldrain",'quality':0x0,'url':_0x1a2bd7}];const _0x40bab5=_0x1a2bd7['includes']("?download")?_0x1a2bd7:_0x324dba+'/api/file/'+_0x1f4e3f+"?download";return[{'source':'Pixeldrain','quality':0x0,'url':_0x40bab5}];}catch(_0x2cb417){return[{'source':'Pixeldrain','quality':0x0,'url':_0x1a2bd7}];}});}function streamTapeExtractor(_0x1f9c4f){const _0x1897ea={_0x512ff2:0x144,_0x1105ed:0x118};return __async(this,null,function*(){const _0x1e28c3=_0x1850;var _0x49aaa2,_0x5c07ff,_0x2c8792,_0x400c37;try{const _0x1146bd=new URL(_0x1f9c4f);_0x1146bd["hostname"]="streamtape.com";const _0x1206a3=yield __nvFetch(_0x1146bd['toString'](),{'headers':HEADERS}),_0x4a5441=yield _0x1206a3['text']();let _0x4a3557=(_0x2c8792=(_0x5c07ff=(_0x49aaa2=_0x4a5441["match"](/document\.getElementById\('videolink'\)\.innerHTML = (.*?);/))==null?void 0x0:_0x49aaa2[0x1])==null?void 0x0:_0x5c07ff["match"](/'(\/\/streamtape\.com\/get_video[^']+)'/))==null?void 0x0:_0x2c8792[0x1];return!_0x4a3557&&(_0x4a3557=(_0x400c37=_0x4a5441["match"](/'(\/\/streamtape\.com\/get_video[^']+)'/))==null?void 0x0:_0x400c37[0x1]),_0x4a3557?[{'source':'StreamTape','quality':0x2d0,'url':'https:'+_0x4a3557}]:[];}catch(_0x2afe28){return[];}});}function hubCloudExtractor(_0x40be9e,_0x4b466f){const _0x2be4f1={_0x353b42:0x12f,_0x9e4a75:0xc7,_0x1f63e4:0x149,_0xba947a:0x14a,_0x387860:0x118,_0x1e34c5:0xc9,_0x963340:0x165,_0x491e49:0x132,_0x30d1a6:0xf7,_0x11cb7b:0xc9,_0x709fae:0x134,_0x3e1f70:0x12f,_0x48fc4d:0xbc,_0x1c87b1:0x148,_0x238337:0x12f,_0xf7cea7:0xfc,_0x24ced6:0x15d,_0x33cf53:0x169,_0x56423c:0xe9,_0x5d7055:0xc1,_0x3df873:0xac,_0x3ba68e:0x101,_0x2d94ca:0x104,_0x3c3bc8:0xe7,_0x1c7b8c:0xb6};return __async(this,null,function*(){const _0x18fe85=_0x1850;var _0x3b7b60;try{let _0x2e9567=_0x40be9e['replace']("hubcloud.ink",'hubcloud.dad');const _0x44ad7f=yield __nvFetch(_0x2e9567,{'headers':__spreadProps(__spreadValues({},HEADERS),{'Referer':_0x4b466f})});let _0x3c42ab=yield _0x44ad7f['text'](),_0x1f1731=_0x2e9567;if(!_0x2e9567["includes"]('hubcloud.php')){let _0x5c5b56='';const _0x658c85=import_cheerio_without_node_native['default']['load'](_0x3c42ab),_0x506a69=_0x658c85("#download");if(_0x506a69["length"])_0x5c5b56=_0x506a69['attr']("href");else{const _0x18fdae=_0x3c42ab["match"](/var url = '([^']*)'/);if(_0x18fdae)_0x5c5b56=_0x18fdae[0x1];}if(_0x5c5b56){if(!_0x5c5b56["startsWith"]("http")){const _0x11f1f5=new URL(_0x2e9567);_0x5c5b56=_0x11f1f5['protocol']+'//'+_0x11f1f5["hostname"]+'/'+_0x5c5b56['replace'](/^\//,'');}_0x1f1731=_0x5c5b56;const _0x3f741f=yield __nvFetch(_0x1f1731,{'headers':__spreadProps(__spreadValues({},HEADERS),{'Referer':_0x2e9567})});_0x3c42ab=yield _0x3f741f["text"]();}}const _0x26900c=import_cheerio_without_node_native['default']["load"](_0x3c42ab),_0x4a5266=_0x26900c("i#size")["text"]()['trim'](),_0x7cdd77=_0x26900c('div.card-header')["text"]()["trim"](),_0x35c35d=(_0x3b7b60=_0x7cdd77["match"](/(\d{3,4})[pP]/))==null?void 0x0:_0x3b7b60[0x1],_0x4d5130=_0x35c35d?parseInt(_0x35c35d):0x438,_0x586be9=cleanTitle(_0x7cdd77),_0x106853=(_0x586be9?'['+_0x586be9+']':'')+(_0x4a5266?'['+_0x4a5266+']':''),_0x3c4587=((()=>{const _0x3f0983=_0x4a5266['match'](/([\d.]+)\s*(GB|MB|KB)/i);if(!_0x3f0983)return 0x0;const _0x4e08f2={'GB':0x400**0x3,'MB':0x400**0x2,'KB':0x400};return parseFloat(_0x3f0983[0x1])*(_0x4e08f2[_0x3f0983[0x2]['toUpperCase']()]||0x0);})()),_0x349f68=[],_0x274ffe=_0x26900c('a.btn')['get']();for(const _0x2eeba4 of _0x274ffe){const _0x4e6ddb=_0x26900c(_0x2eeba4)['attr']("href"),_0x28f39b=_0x26900c(_0x2eeba4)["text"]()["toLowerCase"](),_0x30238b=_0x7cdd77||_0x586be9||'Unknown';if(_0x28f39b['includes']('download\x20file')||_0x28f39b['includes']("fsl server")||_0x28f39b["includes"]("s3 server")||_0x28f39b['includes']('fslv2')||_0x28f39b["includes"]('mega\x20server')||_0x4e6ddb&&_0x4e6ddb["includes"]("r2.dev")){let _0x148366="HubCloud";if(_0x4e6ddb&&_0x4e6ddb['includes']('r2.dev'))_0x148366="Direct R2";else{if(_0x4e6ddb&&_0x4e6ddb["includes"]('workers.dev'))_0x148366="ZipDisk Server";else{if(_0x28f39b["includes"]("fsl server"))_0x148366="HubCloud - FSL";else{if(_0x28f39b['includes']("s3 server"))_0x148366='HubCloud\x20-\x20S3';else{if(_0x28f39b["includes"]("fslv2"))_0x148366='HubCloud\x20-\x20FSLv2';else{if(_0x28f39b["includes"]('mega\x20server'))_0x148366='HubCloud\x20-\x20Mega';}}}}}_0x349f68["push"]({'source':_0x148366+'\x20'+_0x106853,'quality':_0x4d5130,'url':_0x4e6ddb,'size':_0x3c4587,'fileName':_0x30238b});}else{if(_0x28f39b['includes']('buzzserver'))try{const _0x2c3c73=yield __nvFetch(_0x4e6ddb+"/download",{'method':'GET','headers':__spreadProps(__spreadValues({},HEADERS),{'Referer':_0x4e6ddb}),'redirect':"manual"});let _0x519976=_0x2c3c73['headers']["get"]("hx-redirect")||_0x2c3c73["headers"]["get"]("HX-Redirect");!_0x519976&&_0x2c3c73['url']&&_0x2c3c73['url']!==_0x4e6ddb+"/download"&&(_0x519976=_0x2c3c73["url"]),_0x519976&&_0x349f68['push']({'source':'HubCloud\x20-\x20BuzzServer\x20'+_0x106853,'quality':_0x4d5130,'url':_0x519976,'size':_0x3c4587,'fileName':_0x30238b});}catch(_0x40c8a9){}else{if(_0x28f39b['includes']('10gbps')||_0x4e6ddb&&_0x4e6ddb["includes"]("hubcloud.cx")){let _0x567c2e=_0x4e6ddb;if(_0x4e6ddb&&!_0x4e6ddb['includes']("hubcloud.cx"))try{const _0x3abc77=yield __nvFetch(_0x4e6ddb,{'method':'GET','redirect':"manual"}),_0x1e3af5=_0x3abc77['headers']['get']("location");_0x1e3af5&&_0x1e3af5["includes"]("link=")&&(_0x567c2e=_0x1e3af5["substring"](_0x1e3af5['indexOf']("link=")+0x5));}catch(_0x8aa1e5){}_0x349f68['push']({'source':"HubCloud - 10Gbps "+_0x106853,'quality':_0x4d5130,'url':_0x567c2e,'size':_0x3c4587,'fileName':_0x30238b});}else{if(_0x28f39b['includes']("zipdisk")||_0x4e6ddb&&_0x4e6ddb['includes']('workers.dev'))_0x349f68['push']({'source':"ZipDisk Server "+_0x106853,'quality':_0x4d5130,'url':_0x4e6ddb,'size':_0x3c4587,'fileName':_0x30238b});else{if(_0x4e6ddb&&_0x4e6ddb['includes']("pixeldra")){const _0x28c01d=yield pixelDrainExtractor(_0x4e6ddb);_0x349f68['push'](..._0x28c01d['map'](_0x3d631e=>__spreadProps(__spreadValues({},_0x3d631e),{'source':_0x3d631e['source']+'\x20'+_0x106853,'size':_0x3c4587,'fileName':_0x30238b})));}else{if(_0x4e6ddb&&!_0x4e6ddb['includes']("magnet:")&&_0x4e6ddb["startsWith"]('http')){const _0x269814=yield loadExtractor(_0x4e6ddb,_0x1f1731);_0x349f68["push"](..._0x269814['map'](_0x38c29f=>__spreadProps(__spreadValues({},_0x38c29f),{'quality':_0x38c29f['quality']||_0x4d5130})));}}}}}}}return _0x349f68;}catch(_0x5b5815){return[];}});}function hubCdnExtractor(_0x57f16d,_0x156a2d){const _0x82767d={_0x5bf069:0x122,_0x2204cc:0x104,_0x1ce294:0xe6,_0x5bb782:0xd7,_0x31c1eb:0xd6,_0x1c3dca:0x118,_0x29deb6:0xd6},_0x369509={_0x3ebd90:0x13d,_0x36ba1f:0x12f,_0x48296d:0x131};return __async(this,null,function*(){const _0x22b631=_0x1850;try{const _0x308477=yield __nvFetch(_0x57f16d,{'headers':__spreadProps(__spreadValues({},HEADERS),{'Referer':_0x156a2d})}),_0x25a016=yield _0x308477["text"](),_0x21ed9a=import_cheerio_without_node_native['default']['load'](_0x25a016);let _0x2fe83e='';_0x21ed9a('script')['each']((_0x4485ae,_0x461b7d)=>{const _0xb4d551=_0x22b631,_0x578952=_0x21ed9a(_0x461b7d)["html"]();_0x578952&&_0x578952["includes"]("reurl")&&(_0x2fe83e=_0x578952);});if(_0x2fe83e){const _0x3c4c92=_0x2fe83e['match'](/reurl\s*=\s*["']([^"']+)["']/);if(_0x3c4c92&&_0x3c4c92[0x1]){const _0x14caa4=_0x3c4c92[0x1];if(_0x14caa4['includes']('?r=')){const _0x3f8999=_0x14caa4['split']('?r=')['pop']();try{const _0x34087c=atob(_0x3f8999),_0x584606=_0x34087c["substring"](_0x34087c["lastIndexOf"]("link=")+0x5);if(_0x584606&&_0x584606["startsWith"]("http"))return[{'source':'HubCdn','quality':0x438,'url':_0x584606}];}catch(_0xa2f973){}}else{if(_0x14caa4['includes']("link=")){const _0x577557=_0x14caa4["split"]("link=")['pop']();if(_0x577557&&_0x577557['startsWith']("http"))return[{'source':'HubCdn','quality':0x438,'url':_0x577557}];}else{if(_0x14caa4["startsWith"]("http"))return[{'source':"HubCdn",'quality':0x438,'url':_0x14caa4}];}}}}const _0x57b4da=_0x25a016["match"](/r=([A-Za-z0-9+/=]+)/);if(_0x57b4da&&_0x57b4da[0x1])try{const _0x44d334=atob(_0x57b4da[0x1]),_0x330cb5=_0x44d334['substring'](_0x44d334['lastIndexOf']("link=")+0x5);if(_0x330cb5&&_0x330cb5["startsWith"]('http'))return[{'source':"HubCdn",'quality':0x438,'url':_0x330cb5}];}catch(_0x4ec171){}return[];}catch(_0x99eac8){return[];}});}function loadExtractor(_0x37f613){const _0xc43b91={_0x651fc2:0xbb,_0x1ead00:0x141,_0x2873de:0x155,_0x45e8ef:0xe8,_0xfe189f:0x12f,_0x3d31bb:0x15a,_0xc56c1f:0x12f,_0x440e78:0xdc,_0x224390:0x12f,_0xf7ef73:0x165};return __async(this,arguments,function*(_0x43a854,_0x38a20c=MAIN_URL){const _0xd5fd69=_0x1850;try{const _0x7e64e9=new URL(_0x43a854)['hostname'],_0x32c947=_0x43a854['includes']("?id=")||_0x7e64e9['includes']("techyboy4u")||_0x7e64e9['includes']("gadgetsweb.xyz")||_0x7e64e9["includes"]("cryptoinsights.site")||_0x7e64e9["includes"]('bloggingvector')||_0x7e64e9['includes']('ampproject.org');if(_0x32c947){const _0x3c4d34=yield getRedirectLinks(_0x43a854);if(_0x3c4d34&&_0x3c4d34!==_0x43a854)return yield loadExtractor(_0x3c4d34,_0x43a854);return[];}if(_0x7e64e9['includes']('hubcloud'))return yield hubCloudExtractor(_0x43a854,_0x38a20c);if(_0x7e64e9['includes']("hubcdn"))return yield hubCdnExtractor(_0x43a854,_0x38a20c);if(_0x7e64e9['includes']('hblinks')||_0x7e64e9["includes"]('hubstream.dad'))return yield hbLinksExtractor(_0x43a854);if(_0x7e64e9['includes']('hubstream')||_0x7e64e9['includes']('vidstack'))return yield vidStackExtractor(_0x43a854);if(_0x7e64e9["includes"]('pixeldrain'))return yield pixelDrainExtractor(_0x43a854);if(_0x7e64e9["includes"]('streamtape'))return yield streamTapeExtractor(_0x43a854);if(_0x7e64e9['includes']("hdstream4u"))return[{'source':"HdStream4u",'quality':0x438,'url':_0x43a854}];if(_0x7e64e9["includes"]('hubdrive')){const _0xd2fc4f=yield __nvFetch(_0x43a854,{'headers':__spreadProps(__spreadValues({},HEADERS),{'Referer':_0x38a20c})}),_0x2bb502=yield _0xd2fc4f['text'](),_0x52fa9f=import_cheerio_without_node_native['default']["load"](_0x2bb502)('.btn.btn-primary.btn-user.btn-success1.m-1')["attr"]("href");if(_0x52fa9f)return yield loadExtractor(_0x52fa9f,_0x43a854);}return[];}catch(_0x42387d){return[];}});}function search(_0x4050e0){const _0x18a073={_0x361da1:0xd7,_0xebeed8:0xe3,_0x3aebc6:0xf8};return __async(this,null,function*(){const _0x19d7d5={_0x147b22:0x107,_0x309bdf:0xd5,_0x11cdb1:0xd6,_0x4c4e6c:0xb0},_0x34c9c6=_0x1850,_0x394053=new Date()['toISOString']()["split"]('T')[0x0],_0x54245b="https://search.pingora.fyi/collections/post/documents/search?q="+encodeURIComponent(_0x4050e0)+'&query_by=post_title,category&query_by_weights=4,2&sort_by=sort_by_date:desc&limit=15&highlight_fields=none&use_cache=true&page=1&analytics_tag='+_0x394053,_0x3ce9c9=yield __nvFetch(_0x54245b,{'headers':HEADERS}),_0x4de085=yield _0x3ce9c9['json']();if(!_0x4de085||!_0x4de085["hits"])return[];return _0x4de085["hits"]["map"](_0xdf65e0=>{const _0x540e6a=_0x34c9c6,_0x4b6532=_0xdf65e0['document'],_0x630153=_0x4b6532["post_title"],_0x59fa7c=_0x630153["match"](/\((\d{4})\)|\b(\d{4})\b/),_0x5a819d=_0x59fa7c?parseInt(_0x59fa7c[0x1]||_0x59fa7c[0x2]):null;let _0x352428=_0x4b6532["permalink"];return _0x352428&&_0x352428["startsWith"]('/')&&(_0x352428=''+MAIN_URL+_0x352428),{'title':_0x630153,'url':_0x352428,'poster':_0x4b6532["post_thumbnail"],'year':_0x5a819d};});});}function getDownloadLinks(_0x37ecb2){const _0x244e8d={_0x51d6fd:0x159,_0x53f372:0x165,_0x903b65:0x130,_0x1d8417:0x12f,_0x3807b2:0x153,_0x2907d7:0xf8,_0x2a8202:0xe9,_0x5ebc1a:0xcf,_0x5becc8:0x149,_0xb58748:0xfd},_0x4f0384={_0x3fb8c6:0xc1,_0x2cf72e:0x12f,_0x5eb2f9:0xca},_0x2e7d99={_0x1909a6:0xb6},_0x2d15bc={_0x294953:0xbf,_0x4fc8a9:0xf8,_0x4be1b3:0xb6,_0x272b27:0xe9},_0x2d5f59={_0x3bab7c:0x113,_0x4f77b6:0x12f},_0x5f0d72={_0x3bee9e:0x14a,_0x22c9f2:0xdc,_0x1f1e6d:0x12f};return __async(this,null,function*(){const _0x518efc={_0x462412:0xc1},_0x5165ce={_0x438d3b:0xd3,_0x1a3700:0xbd},_0x2f3123=_0x1850,_0x491a83=yield getCurrentDomain();if(_0x37ecb2['includes']('hdhub4u.'))try{const _0x5aa80e=new URL(_0x37ecb2),_0x191c64=new URL(_0x491a83);_0x5aa80e["hostname"]=_0x191c64["hostname"],_0x37ecb2=_0x5aa80e['toString']();}catch(_0x14960f){}const _0x2977be=yield __nvFetch(_0x37ecb2,{'headers':__spreadProps(__spreadValues({},HEADERS),{'Referer':_0x491a83+'/'})}),_0x203f07=yield _0x2977be['text'](),_0x346a06=import_cheerio_without_node_native2['default']["load"](_0x203f07),_0x1aac06=_0x346a06("h1.page-title span")['text'](),_0xfa4a85=_0x1aac06["toLowerCase"]()["includes"]("movie");if(_0xfa4a85){const _0x774e1a=_0x346a06("h3 a, h4 a")['filter']((_0x3d8871,_0x4e83cc)=>_0x346a06(_0x4e83cc)["text"]()["match"](/480|720|1080|2160|4K/i)),_0x44a955=_0x346a06(".page-body > div a")["filter"]((_0x3a4cf4,_0x275fe2)=>{const _0x58f8c1=_0x2f3123,_0x370ccf=_0x346a06(_0x275fe2)['attr']("href");return _0x370ccf&&(_0x370ccf['includes']("hdstream4u")||_0x370ccf["includes"]('hubstream'));}),_0x15f8f2=[...new Set([..._0x774e1a["map"]((_0x1f7992,_0x12e5c0)=>_0x346a06(_0x12e5c0)['attr']("href"))['get'](),..._0x44a955['map']((_0x3c1e41,_0x189e8f)=>_0x346a06(_0x189e8f)["attr"]("href"))["get"]()])],_0x222f1b=yield Promise["all"](_0x15f8f2["map"](_0x69d139=>loadExtractor(_0x69d139,_0x37ecb2))),_0x56430f=_0x222f1b['flat'](),_0x34f06a=new Set(),_0x57c441=_0x56430f["filter"](_0x143ac2=>{const _0x4076c7=_0x2f3123;var _0x304ddb;if(!_0x143ac2["url"]||_0x143ac2["url"]['includes']('.zip')||((_0x304ddb=_0x143ac2["name"])==null?void 0x0:_0x304ddb["toLowerCase"]()["includes"]('.zip')))return![];if(_0x34f06a['has'](_0x143ac2['url']))return![];return _0x34f06a['add'](_0x143ac2['url']),!![];});return{'finalLinks':_0x57c441,'isMovie':_0xfa4a85};}else{const _0x12e458=new Map(),_0x3b176b=[];_0x346a06('h3,\x20h4')['each']((_0x49cf27,_0x8a1934)=>{const _0x389fd7=_0x2f3123,_0xe47dfc=_0x346a06(_0x8a1934),_0x1f94a4=_0xe47dfc['text'](),_0x55ff00=_0xe47dfc["find"]('a'),_0x590ec1=_0x55ff00["map"]((_0x29bfd9,_0xb4c1e4)=>_0x346a06(_0xb4c1e4)["attr"]("href"))['get'](),_0x45ebb7=_0x55ff00["get"]()["some"](_0x9ebf90=>_0x346a06(_0x9ebf90)['text']()["match"](/1080|720|4K|2160/i));if(_0x45ebb7){_0x3b176b["push"](..._0x590ec1);return;}const _0x1f5588=_0x1f94a4['match'](/(?:EPiSODE\s*(\d+)|E(\d+))/i);if(_0x1f5588){const _0x5cd6c6=parseInt(_0x1f5588[0x1]||_0x1f5588[0x2]);if(!_0x12e458['has'](_0x5cd6c6))_0x12e458["set"](_0x5cd6c6,[]);_0x12e458['get'](_0x5cd6c6)["push"](..._0x590ec1);let _0x492e9c=_0xe47dfc["next"]();while(_0x492e9c['length']&&_0x492e9c["get"](0x0)['tagName']!=='hr'){const _0x34c9f5=_0x492e9c["find"]('a[href]')["map"]((_0x1e5376,_0x2755f6)=>_0x346a06(_0x2755f6)["attr"]('href'))["get"]();_0x12e458["get"](_0x5cd6c6)['push'](..._0x34c9f5),_0x492e9c=_0x492e9c['next']();}}});_0x3b176b["length"]>0x0&&(yield Promise['all'](_0x3b176b["map"](_0x109f62=>__async(this,null,function*(){const _0x406122={_0x5cad47:0x147,_0x575e3c:0x14a,_0x6b4aaf:0xb6},_0x319fd8=_0x2f3123;try{const _0x325ae7=yield getRedirectLinks(_0x109f62);if(!_0x325ae7)return;const _0x588f94=yield __nvFetch(_0x325ae7,{'headers':HEADERS}),_0x3b516e=yield _0x588f94['text'](),_0xe62e14=import_cheerio_without_node_native2['default']["load"](_0x3b516e);_0xe62e14("h5 a, h4 a, h3 a")["each"]((_0x475367,_0x238ad0)=>{const _0x26dcb7=_0x319fd8,_0x36f923=_0xe62e14(_0x238ad0)["text"](),_0x404524=_0xe62e14(_0x238ad0)["attr"]("href"),_0x5d2f74=_0x36f923['match'](/Episode\s*(\d+)/i);if(_0x5d2f74&&_0x404524){const _0x21d8e0=parseInt(_0x5d2f74[0x1]);if(!_0x12e458['has'](_0x21d8e0))_0x12e458['set'](_0x21d8e0,[]);_0x12e458['get'](_0x21d8e0)["push"](_0x404524);}});}catch(_0x319d2a){}}))));const _0x1e0a42=[];_0x12e458['forEach']((_0x1387a7,_0x4127e4)=>{const _0x47f5e8=_0x2f3123,_0x1f018c=[...new Set(_0x1387a7)];_0x1e0a42["push"](..._0x1f018c["map"](_0x374732=>({'url':_0x374732,'episode':_0x4127e4})));});const _0xe76bd9=yield Promise['all'](_0x1e0a42['map'](_0x11c525=>__async(this,null,function*(){const _0xac4085=_0x2f3123;try{const _0x280a57=yield loadExtractor(_0x11c525["url"],_0x37ecb2);return _0x280a57['map'](_0x58e66c=>__spreadProps(__spreadValues({},_0x58e66c),{'episode':_0x11c525['episode']}));}catch(_0x16778a){return[];}}))),_0x2b3267=_0xe76bd9["flat"](),_0x397162=new Set(),_0x19b4f0=_0x2b3267['filter'](_0x344da7=>{const _0x5cd943=_0x2f3123;if(!_0x344da7['url']||_0x344da7["url"]["includes"](".zip"))return![];if(_0x397162["has"](_0x344da7["url"]))return![];return _0x397162["add"](_0x344da7["url"]),!![];});return{'finalLinks':_0x19b4f0,'isMovie':_0xfa4a85};}});}function getStreams(_0x6fb123,_0x44e130="movie",_0xe589e2=null,_0x23aa96=null){const _0x2e7077={_0x18e96e:0x120,_0xc53699:0xcd,_0x4f5e33:0x137,_0x450da4:0xc1},_0x7ef8f={_0x4ba768:0xe0,_0x5d0aac:0xd0,_0x2ba8df:0xb3,_0x46fc7b:0xaa,_0x1fc576:0xaa,_0x8bc9a3:0x138,_0x2eca56:0x13e,_0x36a4bb:0x10f,_0x37b3e0:0xcc,_0x5e29c4:0x169,_0x3edd6f:0x15b};return __async(this,null,function*(){const _0x5aa329=_0x1850;console["log"]("[HDHub4u] Fetching streams for TMDB ID: "+_0x6fb123+", Type: "+_0x44e130);try{const _0x2fa81d=yield getTMDBDetails(_0x6fb123,_0x44e130);console['log']("[HDHub4u] TMDB Info: \""+_0x2fa81d['title']+'\x22\x20('+(_0x2fa81d["year"]||'N/A')+')');const _0x5add83=_0x44e130==='tv'&&_0xe589e2?_0x2fa81d['title']+" Season "+_0xe589e2:_0x2fa81d['title'],_0x424e15=yield search(_0x5add83);if(_0x424e15["length"]===0x0)return[];const _0x250433=findBestTitleMatch(_0x2fa81d,_0x424e15,_0x44e130,_0xe589e2),_0x8b1a29=_0x250433||_0x424e15[0x0];console["log"]("[HDHub4u] Selected: \""+_0x8b1a29['title']+"\" ("+_0x8b1a29["url"]+')');const _0x256b26=yield getDownloadLinks(_0x8b1a29["url"]),_0x163c3e=_0x256b26["finalLinks"];let _0x3cfcfe=_0x163c3e;_0x44e130==='tv'&&_0x23aa96!==null&&(_0x3cfcfe=_0x163c3e['filter'](_0x4f12c5=>_0x4f12c5["episode"]===_0x23aa96));const _0x1504d4=_0x3cfcfe["map"](_0x4c046b=>{const _0x17024b=_0x5aa329;let _0x50686f=_0x4c046b['fileName']&&_0x4c046b["fileName"]!=="Unknown"?_0x4c046b['fileName']:_0x2fa81d['title'];_0x44e130==='tv'&&_0xe589e2&&_0x23aa96&&(_0x50686f=_0x2fa81d["title"]+'\x20S'+String(_0xe589e2)["padStart"](0x2,'0')+'E'+String(_0x23aa96)["padStart"](0x2,'0'));const _0x53d15f=extractServerName(_0x4c046b['source']);let _0x4acaf9='Unknown';if(typeof _0x4c046b['quality']==="number"&&_0x4c046b['quality']>0x0){if(_0x4c046b['quality']>=0x870)_0x4acaf9='4K';else{if(_0x4c046b['quality']>=0x438)_0x4acaf9="1080p";else{if(_0x4c046b['quality']>=0x2d0)_0x4acaf9="720p";else{if(_0x4c046b["quality"]>=0x1e0)_0x4acaf9='480p';}}}}else typeof _0x4c046b['quality']==="string"&&(_0x4acaf9=_0x4c046b["quality"]);return{'name':"HDHub4u "+_0x53d15f,'title':_0x50686f,'url':_0x4c046b["url"],'quality':_0x4acaf9,'size':formatBytes(_0x4c046b['size']),'headers':_0x4c046b["headers"]||void 0x0,'provider':"hdhub4u"};}),_0xa1c74={'4K':0x4,'1080p':0x2,'720p':0x1,'480p':0x0,'Unknown':-0x2};return _0x1504d4['sort']((_0x141dca,_0x5b99ad)=>(_0xa1c74[_0x5b99ad['quality']]||-0x3)-(_0xa1c74[_0x141dca["quality"]]||-0x3));}catch(_0x11c64c){return console['error']('[HDHub4u]\x20Scraping\x20error:\x20'+_0x11c64c['message']),[];}});}module["exports"]={'getStreams':getStreams};

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
  var PROVIDER = "hdhub4u";
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
