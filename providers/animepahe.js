/*
 * nv-plugins animepahe.js — FULLY DECODED port of the All-in-One-Nuvio provider (4.24.0 merge pass).
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
var _0x3e95=function(){return "";};const _0x1d73f4=_0x3e95;/*rotation removed*/;var __create=Object["create"],__defProp=Object["defineProperty"],__defProps=Object["defineProperties"],__getOwnPropDesc=Object['getOwnPropertyDescriptor'],__getOwnPropDescs=Object["getOwnPropertyDescriptors"],__getOwnPropNames=Object["getOwnPropertyNames"],__getOwnPropSymbols=Object["getOwnPropertySymbols"],__getProtoOf=Object["getPrototypeOf"],__hasOwnProp=Object["prototype"]['hasOwnProperty'],__propIsEnum=Object['prototype']['propertyIsEnumerable'],__defNormalProp=(_0x537b5d,_0x312257,_0x145bab)=>_0x312257 in _0x537b5d?__defProp(_0x537b5d,_0x312257,{'enumerable':!![],'configurable':!![],'writable':!![],'value':_0x145bab}):_0x537b5d[_0x312257]=_0x145bab,__spreadValues=(_0x454d4c,_0x10c821)=>{const _0x1d55b3=_0x1d73f4;for(var _0x5ca226 in _0x10c821||(_0x10c821={}))if(__hasOwnProp["call"](_0x10c821,_0x5ca226))__defNormalProp(_0x454d4c,_0x5ca226,_0x10c821[_0x5ca226]);if(__getOwnPropSymbols)for(var _0x5ca226 of __getOwnPropSymbols(_0x10c821)){if(__propIsEnum['call'](_0x10c821,_0x5ca226))__defNormalProp(_0x454d4c,_0x5ca226,_0x10c821[_0x5ca226]);}return _0x454d4c;},__spreadProps=(_0x3a8cb0,_0x2a9c46)=>__defProps(_0x3a8cb0,__getOwnPropDescs(_0x2a9c46)),__objRest=(_0x267409,_0x2a986e)=>{const _0x1f55b1=_0x1d73f4;var _0x4078ae={};for(var _0x37e51c in _0x267409)if(__hasOwnProp["call"](_0x267409,_0x37e51c)&&_0x2a986e["indexOf"](_0x37e51c)<0x0)_0x4078ae[_0x37e51c]=_0x267409[_0x37e51c];if(_0x267409!=null&&__getOwnPropSymbols)for(var _0x37e51c of __getOwnPropSymbols(_0x267409)){if(_0x2a986e["indexOf"](_0x37e51c)<0x0&&__propIsEnum["call"](_0x267409,_0x37e51c))_0x4078ae[_0x37e51c]=_0x267409[_0x37e51c];}return _0x4078ae;},__copyProps=(_0x257f25,_0x2649d8,_0xdbf521,_0x41706a)=>{const _0x4bd517=_0x1d73f4;if(_0x2649d8&&typeof _0x2649d8==="object"||typeof _0x2649d8==="function"){for(let _0x5e4956 of __getOwnPropNames(_0x2649d8))if(!__hasOwnProp["call"](_0x257f25,_0x5e4956)&&_0x5e4956!==_0xdbf521)__defProp(_0x257f25,_0x5e4956,{'get':()=>_0x2649d8[_0x5e4956],'enumerable':!(_0x41706a=__getOwnPropDesc(_0x2649d8,_0x5e4956))||_0x41706a["enumerable"]});}return _0x257f25;},__toESM=(_0x55ba45,_0x23f426,_0x31a83c)=>(_0x31a83c=_0x55ba45!=null?__create(__getProtoOf(_0x55ba45)):{},__copyProps(_0x23f426||!_0x55ba45||!_0x55ba45['__esModule']?__defProp(_0x31a83c,"default",{'value':_0x55ba45,'enumerable':!![]}):_0x31a83c,_0x55ba45)),__async=(_0x1abd7c,_0x51d469,_0x4db3b0)=>{return new Promise((_0x1cb0f7,_0x58ba9a)=>{const _0x5006dd=_0x3e95;var _0x16f488=_0x2becae=>{const _0x4f80c0=_0x3e95;try{_0x3ddc4b(_0x4db3b0["next"](_0x2becae));}catch(_0x4fff13){_0x58ba9a(_0x4fff13);}},_0x446bda=_0x2a96d8=>{try{_0x3ddc4b(_0x4db3b0['throw'](_0x2a96d8));}catch(_0x4ee400){_0x58ba9a(_0x4ee400);}},_0x3ddc4b=_0x28cd85=>_0x28cd85['done']?_0x1cb0f7(_0x28cd85["value"]):Promise["resolve"](_0x28cd85["value"])["then"](_0x16f488,_0x446bda);_0x3ddc4b((_0x4db3b0=_0x4db3b0["apply"](_0x1abd7c,_0x51d469))["next"]());});},import_cheerio_without_node_native=__toESM(__nvRequire("cheerio-without-node-native")),MAIN_URL="https://animepahe.com",PROXY_URL="https://animepaheproxy.phisheranimepahe.workers.dev/?url=",HEADERS={'User-Agent':'Mozilla/5.0\x20(Windows\x20NT\x2010.0;\x20Win64;\x20x64)\x20Chrome/120.0.0.0\x20Safari/537.36','Cookie':"__ddg2_=1234567890",'Referer':"https://animepahe.com/"};function fetchText(_0x53d5e8){return __async(this,arguments,function*(_0x3a9d6b,_0x3f7815={}){const _0x22182a=_0x3e95,_0x263547=_0x3f7815,{useProxy:useProxy=!![]}=_0x263547,_0x5368ce=__objRest(_0x263547,["useProxy"]),_0x3553fa=_0x3a9d6b["startsWith"]("http")?_0x3a9d6b:''+MAIN_URL+_0x3a9d6b,_0x23e259=useProxy?''+PROXY_URL+encodeURIComponent(_0x3553fa):_0x3553fa,_0x53e991=yield __nvFetch(_0x23e259,__spreadValues({'headers':HEADERS},_0x5368ce));if(!_0x53e991['ok'])throw new Error('HTTP\x20'+_0x53e991["status"]+" on "+_0x3553fa);return yield _0x53e991["text"]();});}function fetchJson(_0xbe08be){return __async(this,arguments,function*(_0x290be1,_0x1fec65={}){const _0x6a80f1=_0x3e95,_0x562e16=yield fetchText(_0x290be1,_0x1fec65);return JSON["parse"](_0x562e16);});}function getImdbId(_0x34ed2f,_0x226466){return __async(this,null,function*(){const _0x404dbd=_0x3e95;try{const _0x42212d="https://api.themoviedb.org/3/"+(_0x226466==='tv'?'tv':'movie')+'/'+_0x34ed2f+"/external_ids?api_key=1865f43a0549ca50d341dd9ab8b29f49",_0x49d3ef=yield __nvFetch(_0x42212d),_0x28a7ea=yield _0x49d3ef["json"]();return _0x28a7ea["imdb_id"];}catch(_0x4cf7e7){return null;}});}function resolveMapping(_0x459472,_0x2cc631,_0x460b16){return __async(this,null,function*(){const _0x13788c=_0x3e95;try{const _0x130392="https://id-mapping-api-malid.hf.space/api/resolve?id="+_0x459472+"&s="+_0x2cc631+"&e="+_0x460b16,_0x21e924=yield __nvFetch(_0x130392);if(!_0x21e924['ok'])return null;return yield _0x21e924["json"]();}catch(_0x2c2385){return null;}});}function getMalTitle(_0x30d391){return __async(this,null,function*(){const _0x15e96f=_0x3e95;try{const _0x4abe52=yield __nvFetch("https://api.jikan.moe/v4/anime/"+_0x30d391);if(!_0x4abe52['ok'])return null;const _0x238ad3=yield _0x4abe52['json']();return _0x238ad3["data"]["title"];}catch(_0x263c9e){return null;}});}function searchAnime(_0x3fa230){return __async(this,null,function*(){const _0x346695='/api?m=search&l=8&q='+encodeURIComponent(_0x3fa230);return yield fetchJson(_0x346695);});}/*string-table removed*//*decoder removed*/function extractQuality(_0x334f2a){const _0x382715=_0x1d73f4,_0x39fb17=_0x334f2a["match"](/(\d{3,4}p)/);return _0x39fb17?_0x39fb17[0x1]:"720p";}function unpack(_0xe31c41){const _0xdd0574=_0x1d73f4;try{const _0xb76ad=_0xe31c41["match"](/}\((['"])([\s\S]*?)\1,\s*(\d+),\s*(\d+),\s*(['"])([\s\S]*?)\5\.split\((['"])\|\7\)/);if(_0xb76ad){let [_0x5456ad,_0x1c0673,_0x51199a,_0x2f53c4,_0x8c4f7d,_0x2f8bea,_0x357743]=_0xb76ad;_0x51199a=_0x51199a['replace'](/\\'/g,'\x27')["replace"](/\\"/g,'\x22')['replace'](/\\\\/g,'\x5c'),_0x2f53c4=parseInt(_0x2f53c4),_0x8c4f7d=parseInt(_0x8c4f7d);const _0x354b84=_0x357743["split"]('|'),_0x530bd9=_0x1ec9b0=>(_0x1ec9b0<_0x2f53c4?'':_0x530bd9(parseInt(_0x1ec9b0/_0x2f53c4)))+((_0x1ec9b0=_0x1ec9b0%_0x2f53c4)>0x23?String["fromCharCode"](_0x1ec9b0+0x1d):_0x1ec9b0["toString"](0x24)),_0x4b988a={};while(_0x8c4f7d--)_0x4b988a[_0x530bd9(_0x8c4f7d)]=_0x354b84[_0x8c4f7d]||_0x530bd9(_0x8c4f7d);return _0x51199a["replace"](/\b\w+\b/g,_0x574c2b=>_0x4b988a[_0x574c2b]);}}catch(_0x2f2b57){console['error']("[AnimePahe] Unpack error:",_0x2f2b57["message"]);}return _0xe31c41;}function extractKwik(_0x3437f3){return __async(this,null,function*(){const _0x28243d=_0x3e95;try{const _0x495ea4=globalThis['SCRAPER_SETTINGS']||{},_0x3cd98e=_0x495ea4['domain']||"https://animepahe.com",_0x24d558=yield fetchText(_0x3437f3,{'headers':__spreadProps(__spreadValues({},HEADERS),{'Referer':_0x3cd98e+'/','User-Agent':"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"}),'useProxy':![]}),_0x1c346c=_0x24d558['match'](/<script.*?>([\s\S]*?)<\/script>/g)||[],_0x12465c=[];for(const _0x15ba09 of _0x1c346c){if(_0x15ba09["includes"]("eval(function(p,a,c,k,e,d)")){let _0x21942c=0x0;while(!![]){const _0x34bf2f=_0x15ba09['indexOf']("eval(function(p,a,c,k,e,d)",_0x21942c);if(_0x34bf2f===-0x1)break;const _0x338b30=_0x15ba09["indexOf"]('.split(\x27|\x27)',_0x34bf2f);if(_0x338b30===-0x1)break;const _0x3ddf3c=_0x15ba09['indexOf']('))',_0x338b30);if(_0x3ddf3c===-0x1)break;_0x12465c["push"](_0x15ba09["substring"](_0x34bf2f,_0x3ddf3c+0x2)),_0x21942c=_0x3ddf3c+0x2;}}}for(const _0x14c3ab of _0x12465c){const _0x235e1d=unpack(_0x14c3ab),_0x42fe27=_0x235e1d["match"](/source\s*=\s*'([^']+m3u8[^']*)'/)||_0x235e1d["match"](/source\s*=\s*"([^"]+m3u8[^"]*)"/);if(_0x42fe27)return{'url':_0x42fe27[0x1],'headers':{'Referer':"https://kwik.cx/",'Origin':'https://kwik.cx','User-Agent':'Mozilla/5.0\x20(Windows\x20NT\x2010.0;\x20Win64;\x20x64)\x20AppleWebKit/537.36\x20(KHTML,\x20like\x20Gecko)\x20Chrome/120.0.0.0\x20Safari/537.36'}};}}catch(_0x2c7b87){console["error"]("[AnimePahe] Kwik extraction failed:",_0x2c7b87["message"]);}return null;});}function getStreams(_0x1a69bb,_0x2befb3,_0x52fcf8,_0xfc825d){return __async(this,null,function*(){const _0x205542=_0x3e95;try{let _0x5e5e45=null,_0x581fa6='',_0x2c186e=_0xfc825d,_0x18bb35=null;if(_0x2befb3==='tv'){const _0x324a65=yield getImdbId(_0x1a69bb,_0x2befb3);if(!_0x324a65)return[];const _0xd31fc=yield resolveMapping(_0x324a65,_0x52fcf8,_0xfc825d);if(!_0xd31fc||!_0xd31fc['mal_id'])return[];_0x18bb35=_0xd31fc['mal_id'],_0x2c186e=_0xd31fc["mal_episode"]||_0xfc825d,_0x581fa6=yield getMalTitle(_0x18bb35);if(!_0x581fa6)return[];const _0x4cf3da=yield searchAnime(_0x581fa6);if(_0x4cf3da["data"]&&_0x4cf3da["data"]["length"]>0x0)for(let _0x22ea5c=0x0;_0x22ea5c<Math["min"](_0x4cf3da["data"]["length"],0x3);_0x22ea5c++){const _0x481763=_0x4cf3da["data"][_0x22ea5c],_0x1a4687=yield fetchText("/anime/"+_0x481763["session"]);if(_0x1a4687["includes"]("myanimelist.net/anime/"+_0x18bb35)){_0x5e5e45=_0x481763["session"];break;}}}else{const _0x426da0="https://api.themoviedb.org/3/movie/"+_0x1a69bb+"?api_key=1865f43a0549ca50d341dd9ab8b29f49",_0x51feb2=yield __nvFetch(_0x426da0),_0xc37f69=yield _0x51feb2["json"]();_0x581fa6=_0xc37f69["title"]||_0xc37f69["original_title"],_0x2c186e=0x1;if(!_0x581fa6)return[];const _0x1201c6=yield searchAnime(_0x581fa6);if(_0x1201c6["data"]&&_0x1201c6["data"]['length']>0x0){const _0xbe3fcd=_0x1201c6['data'][0x0];_0xbe3fcd['title']["toLowerCase"]()===_0x581fa6["toLowerCase"]()&&(_0x5e5e45=_0xbe3fcd['session']);}}if(!_0x5e5e45)return[];const _0xf57a00="/api?m=release&id="+_0x5e5e45+"&sort=episode_asc&page=1",_0x2f7c8a=yield fetchJson(_0xf57a00);if(!_0x2f7c8a["data"]||_0x2f7c8a["data"]["length"]===0x0)return[];const _0x38a1e6=Math["floor"](_0x2f7c8a['data'][0x0]["episode"]),_0x1712c9=_0x2f7c8a['per_page']||0x1e,_0x203dac=_0x38a1e6-0x1+_0x2c186e,_0x341dc5=Math["ceil"](_0x2c186e/_0x1712c9)||0x1,_0x2b765d="/api?m=release&id="+_0x5e5e45+"&sort=episode_asc&page="+_0x341dc5,_0x2a1326=yield fetchJson(_0x2b765d);let _0x55ba83=null;if(_0x2a1326&&_0x2a1326["data"]){const _0x34b42a=_0x2a1326['data']['find'](_0x1c811c=>Math["floor"](_0x1c811c["episode"])==_0x203dac);if(_0x34b42a)_0x55ba83=_0x34b42a["session"];}if(!_0x55ba83&&_0x341dc5!==0x1){const _0x2d7354=_0x2f7c8a["data"]["find"](_0x213fbf=>Math["floor"](_0x213fbf['episode'])==_0x203dac);if(_0x2d7354)_0x55ba83=_0x2d7354["session"];}if(!_0x55ba83)return[];const _0x418b69='/play/'+_0x5e5e45+'/'+_0x55ba83,_0x1219db=yield fetchText(_0x418b69),_0x50d5e1=import_cheerio_without_node_native['default']['load'](_0x1219db),_0xf83878=[],_0x3369fd=[];_0x50d5e1("#resolutionMenu button")["each"]((_0x48d682,_0x3a3741)=>{const _0x32e31e=_0x205542,_0xe51f28=_0x50d5e1(_0x3a3741),_0x4d5d8e=_0xe51f28["attr"]('data-src'),_0x22e454=_0xe51f28["text"](),_0x22d1e4=extractQuality(_0x22e454),_0x1e1048=_0x22e454["toLowerCase"]()["includes"]("eng")?"Dub":'Sub';_0x4d5d8e&&_0x4d5d8e["includes"]("kwik")&&_0x3369fd["push"](extractKwik(_0x4d5d8e)["then"](_0x126da6=>{const _0x41c033=_0x32e31e;_0x126da6&&_0xf83878['push']({'name':"AnimePahe ("+_0x22d1e4+'\x20'+_0x1e1048+')','title':_0x581fa6+" - Episode "+_0x2c186e,'url':_0x126da6["url"],'quality':_0x22d1e4,'headers':_0x126da6['headers']});}));}),yield Promise["all"](_0x3369fd);const _0x33e14a={'1080p':0x3,'720p':0x2,'360p':0x1};return _0xf83878['sort']((_0x45ffbb,_0x54b2c9)=>(_0x33e14a[_0x54b2c9["quality"]]||0x0)-(_0x33e14a[_0x45ffbb['quality']]||0x0));}catch(_0x18cd2a){return[];}});}function onSettings(){return __async(this,null,function*(){const _0x5ece5c=_0x3e95;return[{'type':'header','label':"Domain Selection"},{'type':"select",'key':"domain",'label':"Preferred Domain",'description':"AnimePahe frequently rotates domains. Choose the one currently working for you.",'options':[{'label':'animepahe.com','value':'https://animepahe.com'},{'label':"animepahe.org",'value':"https://animepahe.org"},{'label':"animepahe.pw",'value':"https://animepahe.pw"}],'defaultValue':'https://animepahe.com'}];});}typeof module!=="undefined"&&module["exports"]?module["exports"]={'getStreams':getStreams,'onSettings':onSettings}:(global["getStreams"]=getStreams,global["onSettings"]=onSettings);

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
  var PROVIDER = "animepahe";
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
