/*
 * nv-plugins hianime.js — FULLY DECODED port of the All-in-One-Nuvio provider (4.24.0 merge pass).
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
var _0x518a=function(){return "";};/*decoder removed*//*string-table removed*/const _0x534f2d=_0x518a;/*rotation removed*/;var __create=Object["create"],__defProp=Object["defineProperty"],__defProps=Object["defineProperties"],__getOwnPropDesc=Object["getOwnPropertyDescriptor"],__getOwnPropDescs=Object["getOwnPropertyDescriptors"],__getOwnPropNames=Object["getOwnPropertyNames"],__getOwnPropSymbols=Object['getOwnPropertySymbols'],__getProtoOf=Object["getPrototypeOf"],__hasOwnProp=Object["prototype"]["hasOwnProperty"],__propIsEnum=Object['prototype']["propertyIsEnumerable"],__defNormalProp=(_0x2dae07,_0x274018,_0x29e17c)=>_0x274018 in _0x2dae07?__defProp(_0x2dae07,_0x274018,{'enumerable':!![],'configurable':!![],'writable':!![],'value':_0x29e17c}):_0x2dae07[_0x274018]=_0x29e17c,__spreadValues=(_0x492fa4,_0x22e2bd)=>{const _0x2b407e=_0x534f2d;for(var _0x254b06 in _0x22e2bd||(_0x22e2bd={}))if(__hasOwnProp["call"](_0x22e2bd,_0x254b06))__defNormalProp(_0x492fa4,_0x254b06,_0x22e2bd[_0x254b06]);if(__getOwnPropSymbols)for(var _0x254b06 of __getOwnPropSymbols(_0x22e2bd)){if(__propIsEnum["call"](_0x22e2bd,_0x254b06))__defNormalProp(_0x492fa4,_0x254b06,_0x22e2bd[_0x254b06]);}return _0x492fa4;},__spreadProps=(_0x15cfe8,_0xc48f6b)=>__defProps(_0x15cfe8,__getOwnPropDescs(_0xc48f6b)),__copyProps=(_0x18421e,_0x204a78,_0x11897e,_0x461fc8)=>{const _0x4cf2e8=_0x534f2d;if(_0x204a78&&typeof _0x204a78==="object"||typeof _0x204a78==='function'){for(let _0x17b24f of __getOwnPropNames(_0x204a78))if(!__hasOwnProp["call"](_0x18421e,_0x17b24f)&&_0x17b24f!==_0x11897e)__defProp(_0x18421e,_0x17b24f,{'get':()=>_0x204a78[_0x17b24f],'enumerable':!(_0x461fc8=__getOwnPropDesc(_0x204a78,_0x17b24f))||_0x461fc8['enumerable']});}return _0x18421e;},__toESM=(_0x4dde22,_0x120ea3,_0x25db69)=>(_0x25db69=_0x4dde22!=null?__create(__getProtoOf(_0x4dde22)):{},__copyProps(_0x120ea3||!_0x4dde22||!_0x4dde22["__esModule"]?__defProp(_0x25db69,"default",{'value':_0x4dde22,'enumerable':!![]}):_0x25db69,_0x4dde22)),__async=(_0x29d962,_0x5d921d,_0x15a883)=>{return new Promise((_0x4ab987,_0xe95780)=>{const _0x3bb134=_0x518a;var _0x26f92c=_0x3d0820=>{const _0x5144a4=_0x518a;try{_0x5eb037(_0x15a883["next"](_0x3d0820));}catch(_0x14ebc6){_0xe95780(_0x14ebc6);}},_0x1ea74d=_0x2ff374=>{const _0x6b926e=_0x518a;try{_0x5eb037(_0x15a883["throw"](_0x2ff374));}catch(_0x1cd14e){_0xe95780(_0x1cd14e);}},_0x5eb037=_0x6f11ba=>_0x6f11ba["done"]?_0x4ab987(_0x6f11ba["value"]):Promise["resolve"](_0x6f11ba['value'])["then"](_0x26f92c,_0x1ea74d);_0x5eb037((_0x15a883=_0x15a883["apply"](_0x29d962,_0x5d921d))["next"]());});},import_cheerio_without_node_native=__toESM(__nvRequire('cheerio-without-node-native')),MEGAPLAY_BASE="https://megaplay.buzz",VIDWISH_BASE="https://vidwish.live",MEGACLOUD_BASE="https://megacloud.bloggy.click",TMDB_API_KEY='1865f43a0549ca50d341dd9ab8b29f49',DEFAULT_HEADERS={'User-Agent':"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",'Accept':'*/*','Connection':'keep-alive'};function fetchText(_0x5267e4){return __async(this,arguments,function*(_0x45ccd9,_0x4bb980={}){const _0x20f29a=_0x518a,_0x5212ba=yield __nvFetch(_0x45ccd9,__spreadValues({'headers':__spreadValues(__spreadValues({},DEFAULT_HEADERS),_0x4bb980["headers"])},_0x4bb980));if(!_0x5212ba['ok'])throw new Error("HTTP "+_0x5212ba["status"]+" on "+_0x45ccd9);return yield _0x5212ba['text']();});}function fetchJson(_0x46b20f){return __async(this,arguments,function*(_0x207286,_0x46f2a0={}){const _0x403cfa=_0x518a,_0x111e1a=yield fetchText(_0x207286,_0x46f2a0);return JSON["parse"](_0x111e1a);});}function getImdbId(_0x2c75d7,_0x86b892){return __async(this,null,function*(){const _0xf83dbe=_0x518a;try{const _0x4003c9="https://api.themoviedb.org/3/"+(_0x86b892==='tv'?'tv':"movie")+'/'+_0x2c75d7+"/external_ids?api_key="+TMDB_API_KEY,_0x4ab9aa=yield fetchJson(_0x4003c9);return _0x4ab9aa["imdb_id"]||null;}catch(_0x17141d){return null;}});}function getTmdbDetails(_0x252301,_0x15e30d){return __async(this,null,function*(){try{const _0x523a4f='https://api.themoviedb.org/3/'+(_0x15e30d==='tv'?'tv':'movie')+'/'+_0x252301+'?api_key='+TMDB_API_KEY;return yield fetchJson(_0x523a4f);}catch(_0x4ce065){return null;}});}function getEpisodeMetadata(_0x173fd5,_0x2f3985,_0x2f37ca,_0x2f8a19){return __async(this,null,function*(){const _0x5e2319=_0x518a;try{if(_0x2f3985==="movie"){const _0x1c1e8f="https://api.themoviedb.org/3/movie/"+_0x173fd5+"?api_key="+TMDB_API_KEY,_0x39dc1c=yield fetchJson(_0x1c1e8f);return{'title':_0x39dc1c["title"]||"Movie",'duration':_0x39dc1c["runtime"]?_0x39dc1c["runtime"]+'m':'N/A'};}else{const _0x52a169="https://api.themoviedb.org/3/tv/"+_0x173fd5+'/season/'+_0x2f37ca+"/episode/"+_0x2f8a19+"?api_key="+TMDB_API_KEY,_0x570c4d=yield fetchJson(_0x52a169);return{'title':_0x570c4d["name"]||"Episode "+_0x2f8a19,'duration':_0x570c4d['runtime']?_0x570c4d["runtime"]+'m':"24m"};}}catch(_0x38aecd){return{'title':'Episode\x20'+_0x2f8a19,'duration':"24m"};}});}function resolveMapping(_0x4995db,_0x2365e5,_0x5a84a1){return __async(this,null,function*(){const _0x26302b=_0x518a;try{const _0xb65be9="https://id-mapping-api-malid.hf.space/api/resolve?id="+_0x4995db+"&s="+_0x2365e5+"&e="+_0x5a84a1,_0x3bc4ed=yield fetchJson(_0xb65be9);if(_0x3bc4ed["error"])return null;return _0x3bc4ed;}catch(_0x6b6afc){return null;}});}function searchMalId(_0x1e73db,_0xd87fc6){return __async(this,null,function*(){const _0x497763=_0x518a;try{const _0x2f1e3e=_0xd87fc6==="movie"?'movie':'tv',_0x4c44db="https://api.jikan.moe/v4/anime?q="+encodeURIComponent(_0x1e73db)+"&type="+_0x2f1e3e+"&limit=1",_0xdb646a=yield fetchJson(_0x4c44db);if(_0xdb646a['data']&&_0xdb646a["data"]["length"]>0x0)return _0xdb646a['data'][0x0]["mal_id"];return null;}catch(_0x375f0e){return null;}});}function extractSources(_0x37492a,_0x5db6a6,_0x9fddec,_0x54d0c1,_0x54723c,_0xb13dbf,_0x13fa30,_0x3990cb,_0x1dd32c,_0x3c867b){return __async(this,null,function*(){const _0x264f8d=_0x518a;var _0x59ab2b;try{const _0x2d9d1c=yield fetchJson(_0x37492a,{'headers':{'X-Requested-With':"XMLHttpRequest",'Referer':_0x5db6a6,'Origin':_0x9fddec}}),_0x91625f=(_0x59ab2b=_0x2d9d1c["sources"])==null?void 0x0:_0x59ab2b["file"];if(!_0x91625f)return[];const _0x3f5a78=_0x1dd32c['toLowerCase']()==="sub"?"Original (SUB)":"English (DUB)",_0x9e6cb=_0x1dd32c["toUpperCase"]();let _0x185941=[];_0xb13dbf==="movie"?_0x185941=["🎬 "+_0x54723c,"🎞️ M3U8 | ⚡ Auto | 🌍 "+_0x3f5a78+'\x20|\x20⏱️\x20'+_0x3c867b['duration']]:_0x185941=["🎬 "+_0x54723c,"🎥 S"+_0x13fa30+'E'+_0x3990cb+" - "+_0x3c867b["epTitle"],'🎞️\x20M3U8\x20|\x20⚡\x20Auto\x20|\x20🌍\x20'+_0x3f5a78+" | ⏱️ "+_0x3c867b["duration"]];const _0x5e9a48=_0x185941["join"]('\x0a'),_0x5bddf2=[];_0x5bddf2["push"]({'name':"HiAnime | Auto | ["+_0x54d0c1+"] ("+_0x9e6cb+')','title':_0x5e9a48,'url':_0x91625f,'quality':"Auto",'headers':__spreadProps(__spreadValues({},DEFAULT_HEADERS),{'Referer':_0x9fddec+'/','Origin':_0x9fddec}),'provider':'hianime','type':"m3u8"});if(_0x2d9d1c["tracks"]&&_0x2d9d1c['tracks']["length"]>0x0){const _0x5ba4b5=_0x2d9d1c["tracks"]['filter'](_0x2698de=>_0x2698de["file"]&&_0x2698de["kind"]==="captions")["map"](_0x466d9f=>({'url':_0x466d9f["file"],'name':_0x466d9f["label"]||"English",'language':_0x466d9f["label"]?_0x466d9f["label"]["slice"](0x0,0x3)["toLowerCase"]():'en'}));_0x5bddf2[0x0]["subtitles"]=_0x5ba4b5;}return _0x5bddf2;}catch(_0xc9e618){return[];}});}function scrapeType(_0x5f36cd,_0x105396,_0x6ab94d,_0x2f8165,_0x5483aa,_0x50e7d1,_0x8de394){return __async(this,null,function*(){const _0x42164d=_0x518a,_0x5e1cac=[],_0x2caa0b=MEGAPLAY_BASE+"/stream/mal/"+_0x5f36cd+'/'+_0x105396+'/'+_0x6ab94d;try{const _0x29afac=yield fetchText(_0x2caa0b,{'headers':{'Referer':_0x2caa0b}}),_0x49a6e5=import_cheerio_without_node_native["default"]['load'](_0x29afac),_0x14afb3=_0x49a6e5("div.fix-area#megaplay-player");if(!_0x14afb3['length'])return[];const _0x24b5d1=_0x14afb3['attr']("data-id"),_0x2eaf70=_0x14afb3["attr"]("data-realid"),_0x358486=[];if(_0x24b5d1){const _0x561168=MEGAPLAY_BASE+"/stream/getSources?id="+_0x24b5d1+"&id="+_0x24b5d1;_0x358486["push"](extractSources(_0x561168,_0x2caa0b,MEGAPLAY_BASE,'MegaPlay',_0x2f8165,_0x50e7d1,_0x8de394,_0x105396,_0x6ab94d,_0x5483aa));}if(_0x2eaf70){const _0x2e7767=VIDWISH_BASE+'/stream/s-2/'+_0x2eaf70+'/'+_0x6ab94d;_0x358486["push"](((()=>__async(this,null,function*(){const _0x5ae9fd=_0x42164d;try{const _0x2f7c7f=yield fetchText(_0x2e7767,{'headers':{'Referer':_0x2caa0b}}),_0x2e40ae=import_cheerio_without_node_native["default"]["load"](_0x2f7c7f),_0x315d7b=_0x2e40ae('div.fix-area#megaplay-player'),_0x3b622d=_0x315d7b["attr"]("data-id");if(_0x3b622d){const _0x3731c5=VIDWISH_BASE+"/stream/getSources?id="+_0x3b622d+'&id='+_0x3b622d;return yield extractSources(_0x3731c5,_0x2e7767,VIDWISH_BASE,'Vidwish',_0x2f8165,_0x50e7d1,_0x8de394,_0x105396,_0x6ab94d,_0x5483aa);}}catch(_0x308f42){}return[];}))()));}if(_0x2eaf70){const _0x21c11a=MEGACLOUD_BASE+"/stream/s-3/"+_0x2eaf70+'/'+_0x6ab94d;_0x358486['push'](((()=>__async(this,null,function*(){const _0x2bc360=_0x42164d;try{const _0x5bea62=yield fetchText(_0x21c11a,{'headers':{'Referer':_0x2caa0b}}),_0x60928c=import_cheerio_without_node_native['default']["load"](_0x5bea62),_0x38cb83=_0x60928c("div.fix-area#megaplay-player"),_0x7cab52=_0x38cb83["attr"]('data-id');if(_0x7cab52){const _0x29efbd=MEGACLOUD_BASE+"/stream/getSources?id="+_0x7cab52+"&id="+_0x7cab52;return yield extractSources(_0x29efbd,_0x21c11a,MEGACLOUD_BASE,"MegaCloud",_0x2f8165,_0x50e7d1,_0x8de394,_0x105396,_0x6ab94d,_0x5483aa);}}catch(_0x18a89f){}return[];}))()));}const _0x2d09f6=yield Promise["all"](_0x358486);for(const _0x58af50 of _0x2d09f6){_0x5e1cac["push"](..._0x58af50);}}catch(_0x5cac93){}return _0x5e1cac;});}function onSettings(){return __async(this,null,function*(){const _0x2b1ea6=_0x518a;return[{'type':'header','label':"Stream Preferences"},{'type':"select",'key':"subDub",'label':"Audio/Subtitle Preference",'options':[{'label':"Sub & Dub",'value':"both"},{'label':"Sub Only",'value':"sub"},{'label':"Dub Only",'value':"dub"}],'defaultValue':"both"}];});}function getStreams(_0x5bd111,_0x1a8559='tv',_0x4cfc56=0x1,_0x2d2abe=0x1){return __async(this,null,function*(){const _0x53b74c=_0x518a;try{const _0x3f85df=yield getTmdbDetails(_0x5bd111,_0x1a8559);if(!_0x3f85df)return[];const _0x11f81d=_0x3f85df["genres"]||[],_0x83f11e=_0x11f81d["some"](_0x214e2b=>_0x214e2b['id']===0x10),_0x48cdf2=_0x3f85df["original_language"]||'',_0x22eff8=_0x3f85df["origin_country"]||[],_0x427082=_0x48cdf2==='ja'||_0x22eff8['includes']('JP');if(!_0x83f11e||!_0x427082)return[];let _0x58d750=null,_0x555d4f=_0x2d2abe,_0x31ea66=_0x3f85df["name"]||_0x3f85df["title"]||_0x3f85df["original_title"]||(_0x1a8559==="movie"?"Movie":'Anime');const _0x560e7=yield getImdbId(_0x5bd111,_0x1a8559);if(!_0x560e7)return[];const _0xeb5b6e=yield getEpisodeMetadata(_0x5bd111,_0x1a8559,_0x4cfc56,_0x2d2abe),_0x15eb37={'epTitle':_0xeb5b6e['title'],'duration':_0xeb5b6e["duration"]},_0x2bfc5c=_0x1a8559==="movie"?0x1:_0x4cfc56,_0x40abb6=_0x1a8559==="movie"?0x1:_0x2d2abe;_0x1a8559==="movie"&&(_0x58d750=yield searchMalId(_0x31ea66,'movie'),_0x555d4f=0x1);if(!_0x58d750&&_0x1a8559!=='movie'){const _0x237577=yield resolveMapping(_0x560e7,_0x2bfc5c,_0x40abb6);_0x237577&&_0x237577["mal_id"]&&(_0x58d750=_0x237577['mal_id'],_0x555d4f=_0x237577["mal_episode"]||_0x2d2abe);}if(!_0x58d750)return[];const _0x4356e2=globalThis["SCRAPER_SETTINGS"]||{},_0x20c779=_0x4356e2["subDub"]||'both';let _0x22ca7a=[];if(_0x20c779==='both'){const [_0x31baf3,_0x1a1e6c]=yield Promise["all"]([scrapeType(_0x58d750,_0x555d4f,"sub",_0x31ea66,_0x15eb37,_0x1a8559,_0x2bfc5c),scrapeType(_0x58d750,_0x555d4f,"dub",_0x31ea66,_0x15eb37,_0x1a8559,_0x2bfc5c)]);_0x22ca7a=[..._0x31baf3,..._0x1a1e6c];}else _0x22ca7a=yield scrapeType(_0x58d750,_0x555d4f,_0x20c779,_0x31ea66,_0x15eb37,_0x1a8559,_0x2bfc5c);const _0x324702=new Set();return _0x22ca7a["filter"](_0x4694dc=>{const _0x5263e5=_0x53b74c;if(_0x324702["has"](_0x4694dc["url"]))return![];return _0x324702["add"](_0x4694dc['url']),!![];});}catch(_0x55da10){return[];}});}module['exports']={'getStreams':getStreams,'onSettings':onSettings};

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
  var PROVIDER = "hianime";
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
