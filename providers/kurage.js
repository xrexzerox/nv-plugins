/*
 * nv-plugins kurage.js — FULLY DECODED port of the All-in-One-Nuvio provider (4.24.0 merge pass).
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
var _0x5ea7=function(){return "";};const _0x58353f=_0x5ea7;/*decoder removed*//*rotation removed*/;var __defProp=Object["defineProperty"],__defProps=Object['defineProperties'],__getOwnPropDescs=Object['getOwnPropertyDescriptors'],__getOwnPropSymbols=Object['getOwnPropertySymbols'],__hasOwnProp=Object["prototype"]['hasOwnProperty'],__propIsEnum=Object["prototype"]["propertyIsEnumerable"],__defNormalProp=(_0x4c2529,_0xf0d22d,_0xd0f73a)=>_0xf0d22d in _0x4c2529?__defProp(_0x4c2529,_0xf0d22d,{'enumerable':!![],'configurable':!![],'writable':!![],'value':_0xd0f73a}):_0x4c2529[_0xf0d22d]=_0xd0f73a,__spreadValues=(_0x3f0e1d,_0x2c110c)=>{const _0x208ed2=_0x58353f;for(var _0x2385c1 in _0x2c110c||(_0x2c110c={}))if(__hasOwnProp['call'](_0x2c110c,_0x2385c1))__defNormalProp(_0x3f0e1d,_0x2385c1,_0x2c110c[_0x2385c1]);if(__getOwnPropSymbols)for(var _0x2385c1 of __getOwnPropSymbols(_0x2c110c)){if(__propIsEnum["call"](_0x2c110c,_0x2385c1))__defNormalProp(_0x3f0e1d,_0x2385c1,_0x2c110c[_0x2385c1]);}return _0x3f0e1d;},__spreadProps=(_0xfee7a9,_0x2e851a)=>__defProps(_0xfee7a9,__getOwnPropDescs(_0x2e851a)),__async=(_0x5c523a,_0x4cf45c,_0xbbf5e1)=>{const _0x48ab50={_0xa9f8e3:0x128};return new Promise((_0x5bc88e,_0x2f6717)=>{const _0x55f25e={_0x23a930:0x121},_0x426d25=_0x5ea7;var _0x5a3fd5=_0x49d615=>{const _0x27aedb=_0x5ea7;try{_0x4a91b3(_0xbbf5e1["next"](_0x49d615));}catch(_0x11ea2b){_0x2f6717(_0x11ea2b);}},_0x58b612=_0xf94934=>{const _0x1b7332=_0x5ea7;try{_0x4a91b3(_0xbbf5e1["throw"](_0xf94934));}catch(_0x28a232){_0x2f6717(_0x28a232);}},_0x4a91b3=_0x2dad2e=>_0x2dad2e['done']?_0x5bc88e(_0x2dad2e['value']):Promise['resolve'](_0x2dad2e["value"])["then"](_0x5a3fd5,_0x58b612);_0x4a91b3((_0xbbf5e1=_0xbbf5e1['apply'](_0x5c523a,_0x4cf45c))['next']());});},KURAGE_BASE='https://kurage.live',TMDB_API_KEY='439c478a771f35c05022f9feabcca01c',ANILIST_URL="https://graphql.anilist.co",ARM_BASE='https://arm.haglund.dev/api/v2',CINEMETA_URL='https://v3-cinemeta.strem.io/meta',DEFAULT_HEADERS={'User-Agent':'Mozilla/5.0\x20(Windows\x20NT\x2010.0;\x20Win64;\x20x64)\x20AppleWebKit/537.36\x20(KHTML,\x20like\x20Gecko)\x20Chrome/120.0.0.0\x20Safari/537.36','Accept':"application/json, text/plain, */*",'Accept-Language':"en-US,en;q=0.9",'Origin':KURAGE_BASE,'Referer':KURAGE_BASE+'/'};function fetchText(_0x1caee2){return __async(this,arguments,function*(_0x101775,_0x5dba55={}){const _0x48138e=_0x5ea7,_0x4b5f74=yield __nvFetch(_0x101775,__spreadProps(__spreadValues({},_0x5dba55),{'headers':__spreadValues(__spreadValues({},DEFAULT_HEADERS),_0x5dba55["headers"]||{})}));if(!_0x4b5f74['ok'])throw new Error('HTTP\x20'+_0x4b5f74["status"]+':\x20'+_0x101775);return yield _0x4b5f74['text']();});}function fetchJson(_0x1e17b4){return __async(this,arguments,function*(_0x4ad1ec,_0x1cb9ec={}){const _0x1eb7d8=yield fetchText(_0x4ad1ec,_0x1cb9ec);return JSON['parse'](_0x1eb7d8);});}function getSyncInfo(_0x1d852b,_0x151384,_0x2c2ed1,_0x446f5a){const _0x3d6c17={_0x3daeaa:0x168,_0x4bea9b:0x145,_0x330783:0x124,_0x95b324:0x140,_0x595a16:0x130};return __async(this,null,function*(){const _0x3b0964={_0x2bb396:0x13c,_0x171955:0x120,_0xcad33e:0x140,_0x2f5e2b:0x13d,_0x964d8d:0x161,_0x1c75e8:0x169,_0x515d37:0x122},_0x21b968=_0x5ea7,_0x129b2e=_0x415e93=>__async(this,null,function*(){const _0x5e2a30=_0x5ea7,_0x503cc2=_0x151384==="movie"?'movie':'series',_0x42e6c9=CINEMETA_URL+'/'+_0x503cc2+'/'+_0x415e93+'.json';try{const _0x5077dc=yield fetchJson(_0x42e6c9),_0x26f5f0=_0x5077dc['meta'];if(!_0x26f5f0)throw new Error('No\x20Cinemata\x20metadata');if(_0x151384==='movie')return{'date':_0x26f5f0["released"]?_0x26f5f0["released"]["split"]('T')[0x0]:null,'title':_0x26f5f0["name"],'dayIndex':0x1,'runtime':_0x26f5f0["runtime"]||"N/A"};const _0x4d0e73=_0x26f5f0["videos"]||[],_0x1076d5=_0x4d0e73['find'](_0x36ec1d=>_0x36ec1d['season']==_0x2c2ed1&&_0x36ec1d['episode']==_0x446f5a);if(!_0x1076d5||!_0x1076d5['released'])return{'date':null,'title':null,'dayIndex':0x1,'runtime':'24m'};const _0x59cef5=_0x1076d5["released"]['split']('T')[0x0],_0x4a8232=_0x4d0e73['filter'](_0x3ef849=>_0x3ef849['season']==_0x2c2ed1&&_0x3ef849["released"]&&_0x3ef849["released"]['split']('T')[0x0]===_0x59cef5&&parseInt(_0x3ef849['episode'])<parseInt(_0x446f5a))["length"]+0x1;return{'date':_0x59cef5,'title':_0x1076d5["name"]||null,'dayIndex':_0x4a8232,'runtime':_0x26f5f0["runtime"]||"24m"};}catch(_0x24169c){return{'date':null,'title':null,'dayIndex':0x1,'runtime':'24m'};}}),_0x5397c3="https://api.themoviedb.org/3/"+(_0x151384==='movie'?'movie':'tv')+'/'+_0x1d852b,[_0x3cd5e6,_0x3a3f1a]=yield Promise['all']([fetchJson(_0x5397c3+(_0x151384==="movie"?'':'/external_ids')+('?api_key='+TMDB_API_KEY)),fetchJson(_0x5397c3+('?api_key='+TMDB_API_KEY))]);let _0x16c1d6=_0x3cd5e6["imdb_id"]||null;const _0x2d0242=_0x3a3f1a['name']||_0x3a3f1a['title']||null;if(!_0x16c1d6)try{const _0x2ca554=yield fetchJson(ARM_BASE+"/themoviedb?id="+_0x1d852b);_0x16c1d6=Array['isArray'](_0x2ca554)&&_0x2ca554["length"]>0x0?_0x2ca554[0x0]["imdb"]:null;}catch(_0x56b588){}if(!_0x16c1d6)throw new Error('No\x20IMDb\x20ID\x20found\x20for\x20TMDB\x20'+_0x1d852b);const _0x2c3bd5=yield _0x129b2e(_0x16c1d6);let _0x26b763=_0x2c3bd5['date'];if(_0x151384==="movie"&&_0x3a3f1a['release_date'])_0x26b763=_0x3a3f1a["release_date"];if(!_0x26b763)throw new Error('Could\x20not\x20find\x20release\x20date\x20for\x20ID\x20'+_0x16c1d6);const _0x35ac6c=_0x3a3f1a["runtime"]?_0x3a3f1a['runtime']+'m':_0x2c3bd5['runtime']?_0x2c3bd5["runtime"]["toString"]()["includes"]('m')?_0x2c3bd5["runtime"]:_0x2c3bd5['runtime']+'m':"24m";return{'imdbId':_0x16c1d6,'tmdbId':_0x1d852b,'releaseDate':_0x26b763,'title':_0x2d0242,'episodeTitle':_0x2c3bd5["title"],'dayIndex':_0x2c3bd5["dayIndex"],'episode':_0x446f5a,'duration':_0x35ac6c};});}function resolveAnilistId(_0x3daa3e){const _0x35ec31={_0x3d2229:0x14d,_0x2e8bd1:0x158,_0xef8238:0x13f,_0x515e10:0x147,_0x4fae99:0x162,_0x5ac1c7:0x126,_0x1aa730:0x141,_0x3aad67:0x116,_0x4b16ba:0x139,_0xf5552:0x16b,_0x34f79b:0x141,_0x10e370:0x116,_0x1fc841:0x11e,_0x3a59b3:0x161,_0x18a941:0x150};return __async(this,null,function*(){const _0x32e1b8=_0x5ea7;var _0x3f6201,_0xd41751;const {releaseDate:_0x107e3a,title:_0x43b110,episode:_0x16224b,episodeTitle:_0x443d4b,dayIndex:_0x5cbc04}=_0x3daa3e;if(!_0x107e3a||!/^\d{4}-\d{2}-\d{2}/['test'](_0x107e3a))return null;const _0x28284c='query($search:String){Page(perPage:20){media(search:$search,type:ANIME){id\x20type\x20format\x20title{romaji\x20english}startDate{year\x20month\x20day}endDate{year\x20month\x20day}episodes\x20streamingEpisodes{title}}}}';try{const _0x1edad7=yield fetchJson(ANILIST_URL,{'method':"POST",'headers':{'Content-Type':"application/json"},'body':JSON['stringify']({'query':_0x28284c,'variables':{'search':_0x43b110}})}),_0xc6d3bc=((_0xd41751=(_0x3f6201=_0x1edad7['data'])==null?void 0x0:_0x3f6201["Page"])==null?void 0x0:_0xd41751['media'])||[];if(_0xc6d3bc["length"]===0x0)return null;const _0x4c5b38=new Date(_0x107e3a);for(const _0x142a44 of _0xc6d3bc){const _0x428304=_0x142a44['startDate'],_0x46d78e=_0x428304['year']&&_0x428304['month']&&_0x428304['day']?_0x428304['year']+'-'+String(_0x428304["month"])["padStart"](0x2,'0')+'-'+String(_0x428304['day'])['padStart'](0x2,'0'):null;if(!_0x46d78e)continue;const _0x1c2fc6=new Date(_0x46d78e),_0x1de188=Math['ceil'](Math["abs"](_0x4c5b38["getTime"]()-_0x1c2fc6["getTime"]())/(0x3e8*0x3c*0x3c*0x18));let _0x389649=![];if(_0x142a44["format"]==="MOVIE"||_0x142a44["format"]==="SPECIAL"||_0x142a44['episodes']===0x1){if(_0x1de188<=0x2)_0x389649=!![];}else{const _0x20bc6a=new Date(_0x1c2fc6);_0x20bc6a['setDate'](_0x20bc6a['getDate']()-0x2);if(_0x4c5b38>=_0x20bc6a){if(_0x142a44['endDate']&&_0x142a44["endDate"]['year']){const _0x299545=new Date(_0x142a44['endDate']['year'],(_0x142a44["endDate"]['month']||0xc)-0x1,_0x142a44["endDate"]["day"]||0x1f);_0x299545['setDate'](_0x299545["getDate"]()+0x2);if(_0x4c5b38<=_0x299545)_0x389649=!![];}else _0x389649=!![];}}if(_0x389649){const _0x2c2600=_0x142a44["format"]!=="MOVIE"&&_0x142a44["format"]!=='SPECIAL'&&_0x142a44["episodes"]!==0x1;let _0x359785=_0x2c2600&&_0x16224b?_0x16224b:_0x5cbc04||0x1;const _0x3415fb=_0x142a44["streamingEpisodes"]||[];if(_0x3415fb['length']>0x1&&_0x443d4b){const _0x356602=_0x443d4b["toLowerCase"]()['replace'](/[^a-z0-9]/g,'');for(let _0x2d1e3e=0x0;_0x2d1e3e<_0x3415fb["length"];_0x2d1e3e++){const _0x137cad=(_0x3415fb[_0x2d1e3e]['title']||'')['toLowerCase']()["replace"](/[^a-z0-9]/g,'');if(_0x137cad&&(_0x137cad["indexOf"](_0x356602)!==-0x1||_0x356602['indexOf'](_0x137cad)!==-0x1)){_0x359785=_0x2d1e3e+0x1;break;}}}return{'alId':_0x142a44['id'],'episode':_0x359785};}}}catch(_0xa3e291){}return null;});}function getStreams(_0x2f293c,_0x307e15,_0x5affbb,_0x20dbd9){const _0x1a6f7d={_0x4ea72c:0x153,_0x422cfc:0x15c,_0x532f03:0x12c,_0x4798fa:0x117,_0xcc78c2:0x119,_0x35a217:0x158,_0x5323e7:0x15e};return __async(this,null,function*(){const _0x46d7b6={_0x3655c1:0x14c},_0x135f8a={_0x1d546d:0x13e,_0x466fc4:0x137,_0x4f353d:0x12f,_0x4d2fbf:0x13a,_0x20f822:0x142,_0x734be3:0x11b,_0x138b89:0x14a,_0x1945f5:0x16a},_0x11c46a=_0x5ea7;try{const _0x595a2f=yield getSyncInfo(_0x2f293c,_0x307e15,_0x5affbb,_0x20dbd9),_0x438e73=yield resolveAnilistId(_0x595a2f);if(!_0x438e73||!_0x438e73['alId'])return console['log']("[Kurage] Could not resolve AniList ID for TMDB "+_0x2f293c),[];const {alId:_0x688ae2,episode:_0x24b8f8}=_0x438e73;console["log"]("[Kurage] Resolved to AniList ID: "+_0x688ae2+',\x20Episode:\x20'+_0x24b8f8);const _0x3d0623={'0':{'json':{'id':_0x688ae2}},'1':{'json':{'animeId':_0x688ae2,'episode':_0x24b8f8,'language':"sub"}},'2':{'json':{'animeId':_0x688ae2,'episode':_0x24b8f8,'language':"dub"}}},_0x4d504b=KURAGE_BASE+"/api/trpc/catalog.anilistInfo,episodes.source,episodes.source?batch=1&input="+encodeURIComponent(JSON['stringify'](_0x3d0623)),_0x1afd11=yield fetchJson(_0x4d504b,{'headers':{'trpc-accept':"application/json",'x-trpc-source':"nextjs-react"}}),_0x1738e0=[];return _0x1afd11["forEach"](_0x4dc964=>{const _0x2d00fc=_0x11c46a;var _0x1e232e,_0x33736c,_0x3d2c9e;const _0x2cbc91=((_0x3d2c9e=(_0x33736c=(_0x1e232e=_0x4dc964['result'])==null?void 0x0:_0x1e232e['data'])==null?void 0x0:_0x33736c['json'])==null?void 0x0:_0x3d2c9e["servers"])||[];_0x2cbc91["forEach"](_0x55a323=>{const _0x3764bf=_0x2d00fc,_0x23e5ac=_0x55a323["url"]["startsWith"]('/')?''+KURAGE_BASE+_0x55a323['url']:_0x55a323['url'];let _0x56f05b={};try{const _0x2901e8=new URL(_0x23e5ac),_0x2dcd4=_0x2901e8["searchParams"]['get']('headers');_0x2dcd4&&(_0x56f05b=JSON["parse"](atob(_0x2dcd4)));}catch(_0x5e4a24){}const _0x2158a1=(_0x55a323['language']||"sub")["toUpperCase"](),_0x5b1fb0=_0x2158a1==='SUB'?'Original\x20(SUB)':"English (DUB)";let _0xd826f1=[];_0x307e15==="movie"?_0xd826f1=["🎬 "+_0x595a2f['title'],'🎞️\x20MP4\x20|\x20⚡\x20Auto\x20|\x20🌍\x20'+_0x5b1fb0+'\x20|\x20⏱️\x20'+_0x595a2f["duration"]]:_0xd826f1=["🎬 "+_0x595a2f['title'],"🎥 S"+_0x5affbb+'E'+_0x20dbd9+'\x20-\x20'+(_0x595a2f['episodeTitle']||"Episode "+_0x24b8f8),"🎞️ MP4 | ⚡ Auto | 🌍 "+_0x5b1fb0+" | ⏱️ "+_0x595a2f['duration']];const _0x11fa8f=_0xd826f1['join']('\x0a');_0x1738e0["push"]({'name':"Kurage | Auto | ["+_0x55a323['label']+']\x20('+_0x2158a1+')','title':_0x11fa8f,'url':_0x23e5ac,'quality':'Auto','headers':__spreadValues(__spreadValues({},DEFAULT_HEADERS),_0x56f05b),'provider':'kurage','type':_0x55a323['sourceType']||"mp4"});});}),_0x1738e0;}catch(_0x4c1fcd){return console['error']('[Kurage]\x20Error:\x20'+_0x4c1fcd["message"]),[];}});}module['exports']={'getStreams':getStreams};/*string-table removed*/

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
  var PROVIDER = "kurage";
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
