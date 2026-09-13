/*
 * nv-plugins animetsu.js — FULLY DECODED port of the All-in-One-Nuvio provider (4.24.0 merge pass).
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
var _0x1ae2=function(){return "";};const _0x1b3810=_0x1ae2;/*rotation removed*/;var __async=(_0x2ea7d8,_0x3c67f6,_0x542a7f)=>{return new Promise((_0x5c99ff,_0x163440)=>{const _0x6f7606={_0x44cd62:0x1bd},_0x583aee={_0x4977a0:0x1dd},_0x1ff76b=_0x1ae2;var _0x19a76d=_0x78eaf2=>{const _0x257f7b=_0x1ae2;try{_0x3698bc(_0x542a7f["next"](_0x78eaf2));}catch(_0x504a09){_0x163440(_0x504a09);}},_0x40c560=_0x1526d5=>{const _0x9249e=_0x1ae2;try{_0x3698bc(_0x542a7f["throw"](_0x1526d5));}catch(_0x211bd8){_0x163440(_0x211bd8);}},_0x3698bc=_0x2a44c0=>_0x2a44c0['done']?_0x5c99ff(_0x2a44c0['value']):Promise["resolve"](_0x2a44c0['value'])['then'](_0x19a76d,_0x40c560);_0x3698bc((_0x542a7f=_0x542a7f['apply'](_0x2ea7d8,_0x3c67f6))['next']());});},PROVIDER_NAME='Animetsu',TMDB_API_KEY='439c478a771f35c05022f9feabcca01c',BASE_URL='https://animetsu.live/v2/api',PROXY_URL="https://swiftstream.top/proxy",MOBILE_UAS=['Mozilla/5.0\x20(Linux;\x20Android\x2014;\x20Pixel\x208\x20Pro)\x20AppleWebKit/537.36\x20(KHTML,\x20like\x20Gecko)\x20Chrome/124.0.0.0\x20Mobile\x20Safari/537.36',"Mozilla/5.0 (Linux; Android 13; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36",'Mozilla/5.0\x20(Linux;\x20Android\x2012;\x20Pixel\x206)\x20AppleWebKit/537.36\x20(KHTML,\x20like\x20Gecko)\x20Chrome/115.0.0.0\x20Mobile\x20Safari/537.36',"Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"];function getHeaders(_0x160481=null){const _0x5c25dd={_0x52692d:0x1f1},_0x41dcac=_0x1b3810,_0xed24f2=_0x160481||MOBILE_UAS[Math['floor'](Math["random"]()*MOBILE_UAS['length'])];return{'User-Agent':_0xed24f2,'Referer':"https://animetsu.live/",'Origin':"https://animetsu.live/",'Accept-Language':"en-US,en;q=0.9"};}var DOMAINS_JSON_URL="https://raw.githubusercontent.com/SaurabhKaperwan/Utils/refs/heads/main/urls.json",cachedDomains=null,domainCacheTime=0x0,DOMAIN_CACHE_TTL=0x4*0x3c*0x3c*0x3e8;function refreshDomains(){const _0x3fa51f={_0x2e3524:0x1c2};return __async(this,null,function*(){const _0x23c754=_0x1ae2,_0x19d3eb=Date['now']();if(cachedDomains&&_0x19d3eb-domainCacheTime<DOMAIN_CACHE_TTL)return cachedDomains;try{const _0x1908ea=yield __nvFetch(DOMAINS_JSON_URL);if(_0x1908ea['ok']){const _0x48f10a=yield _0x1908ea["json"]();if(_0x48f10a){cachedDomains=_0x48f10a,domainCacheTime=_0x19d3eb;if(_0x48f10a['gojo_base'])BASE_URL=_0x48f10a['gojo_base']+"/v2/api";console['log']('['+PROVIDER_NAME+']\x20Domains\x20updated:\x20BASE_URL='+BASE_URL);}}}catch(_0x4b0a80){console['log']('['+PROVIDER_NAME+"] Domain refresh failed, using default: "+BASE_URL);}return cachedDomains||{};});}function manifest(){const _0x65c03d={_0x5e6e2e:0x1f3,_0x1e41ad:0x1bc},_0x454c2f=_0x1b3810;return{'id':'animetsu','name':"Animetsu",'description':"Anime streams natively for Nuvio via Animetsu API.",'version':'1.0.1','logo':'https://animetsu.live/favicon.ico','background':'https://animetsu.live/favicon.ico','types':['tv',"movie","anime"],'resources':['stream'],'idPrefixes':['tt',"tmdb"]};}function extractM3u8Qualities(_0x1cda90,_0x2e224b){const _0x4f5cdb={_0x4480c1:0x216,_0x380c2b:0x1f4,_0x30f4c0:0x202,_0x28187e:0x1d7,_0x53506f:0x1d8};return __async(this,null,function*(){const _0x50dd87=_0x1ae2;try{const _0x478bab=yield __nvFetch(_0x1cda90,{'headers':_0x2e224b});if(!_0x478bab['ok'])return null;const _0x3ea20c=yield _0x478bab['text'](),_0x5cf4fb=_0x3ea20c["split"]('\x0a');let _0x2e1fa9=[],_0x4fc3a1=null;const _0x269fc6=_0x1cda90["indexOf"]('?'),_0x3c7c8f=_0x269fc6>-0x1?_0x1cda90['substring'](_0x269fc6):'',_0x4f11cc=_0x269fc6>-0x1?_0x1cda90["substring"](0x0,_0x269fc6):_0x1cda90,_0x3d4849=_0x4f11cc["substring"](0x0,_0x4f11cc["lastIndexOf"]('/'));for(let _0x2a8ea6=0x0;_0x2a8ea6<_0x5cf4fb["length"];_0x2a8ea6++){let _0x7e314e=_0x5cf4fb[_0x2a8ea6]['trim']();if(_0x7e314e['startsWith']('#EXT-X-STREAM-INF')){const _0x63c484=_0x7e314e["match"](/RESOLUTION=\d+x(\d+)/);_0x4fc3a1=_0x63c484?_0x63c484[0x1]+'p':'Unknown';}else{if(_0x7e314e&&!_0x7e314e['startsWith']('#')&&_0x4fc3a1){let _0x4add9=_0x7e314e["startsWith"]('http')?_0x7e314e:_0x3d4849+'/'+_0x7e314e;_0x3c7c8f&&!_0x4add9['includes']('?')&&(_0x4add9+=_0x3c7c8f),_0x2e1fa9["push"]({'quality':_0x4fc3a1,'url':_0x4add9}),_0x4fc3a1=null;}}}return _0x2e1fa9['length']>0x0?_0x2e1fa9:null;}catch(_0x40176f){return console['log']('['+PROVIDER_NAME+"] Failed to parse M3U8: "+_0x40176f['message']),null;}});}function search(_0xed2861,_0x3e6e91){return __async(this,null,function*(){return[];});}function makeStream(_0x3d2c51,_0x12805a,_0x67cc5d,_0x57b336,_0x2b500a,_0x193449,_0x1b2d8e,_0x1942b6){const _0x516b2f={_0x3510ac:0x211,_0xca2dcd:0x1c4,_0x143367:0x1bb,_0x4f560a:0x1de};return __async(this,null,function*(){const _0x56b543=_0x1ae2;let _0x3c01a7=_0x2b500a,_0x31ab21=!_0x2b500a["includes"]('.mp4'),_0xdbe312=_0x57b336["toUpperCase"](),_0x2d67fb=getHeaders(_0x1942b6);const _0x1a7819={'name':''+_0x3d2c51+_0x67cc5d+'\x20('+_0xdbe312+')','title':''+_0x12805a+_0x67cc5d+'\x20('+_0xdbe312+')','size':''+_0x12805a+_0x67cc5d+'\x20('+_0xdbe312+')','url':_0x3c01a7,'quality':_0x193449,'behaviorHints':{'proxyHeaders':{'request':_0x2d67fb},'notWebReady':!![]}};if(_0x31ab21){_0x1a7819["headers"]=_0x2d67fb;const _0x201f2d=yield extractM3u8Qualities(_0x3c01a7,_0x2d67fb);if(_0x201f2d){const _0x2817c0=_0x201f2d['find'](_0x3a3fb1=>_0x3a3fb1['quality']==='1080p')||_0x201f2d["find"](_0x294ec9=>_0x294ec9["quality"]==='720p')||_0x201f2d[0x0];_0x1a7819['url']=_0x2817c0['url']+'#ext=.m3u8',_0x1a7819['quality']=_0x2817c0['quality'],console['log']('['+PROVIDER_NAME+"] Forced M3U8 Quality: "+_0x2817c0["quality"]);}else _0x1a7819["url"]=_0x3c01a7+'#ext=.m3u8';}return _0x1a7819;});}/*string-table removed*//*decoder removed*/function fetchJson(_0x10c064,_0x838dd0){const _0x337eab={_0x42022c:0x1df};return __async(this,null,function*(){const _0x21f765=_0x1ae2;try{const _0x46fb12=new Promise((_0x2117c7,_0x4c7a04)=>{setTimeout(()=>_0x4c7a04(new Error('timeout')),0xfa0);}),_0x2f0598=yield Promise['race']([__nvFetch(_0x10c064,_0x838dd0),_0x46fb12]);if(!_0x2f0598['ok'])return null;return yield _0x2f0598["json"]();}catch(_0x22f476){return null;}});}function aniListBridge(_0x38fe92){const _0x179df4={_0x56c07e:0x1f9};return __async(this,null,function*(){const _0x55b0f3=_0x1ae2,_0x32a05c='\x0a\x20\x20\x20\x20query\x20($search:\x20String)\x20{\x0a\x20\x20\x20\x20\x20\x20Media\x20(search:\x20$search,\x20type:\x20ANIME)\x20{\x0a\x20\x20\x20\x20\x20\x20\x20\x20id\x0a\x20\x20\x20\x20\x20\x20}\x0a\x20\x20\x20\x20}\x0a\x20\x20\x20\x20';try{const _0x3ab2de=yield __nvFetch('https://graphql.anilist.co',{'method':'POST','headers':Object['assign'](getHeaders(),{'Content-Type':'application/json','Accept':'application/json'}),'body':JSON["stringify"]({'query':_0x32a05c,'variables':{'search':_0x38fe92}})});if(!_0x3ab2de['ok'])return null;const _0x346a87=yield _0x3ab2de['json']();if(_0x346a87&&_0x346a87["data"]&&_0x346a87['data']["Media"])return{'aniId':_0x346a87["data"]['Media']['id']};}catch(_0x286b14){}return null;});}function getAbsoluteEpisode(_0x3db03b,_0x4185bd,_0x4bf4b4,_0x55ddd6,_0x4f6e6e){const _0x4db530={_0x5ed36a:0x1c5,_0x430071:0x1eb,_0x2cf5f7:0x1f9,_0x2dd162:0x1f6,_0x3b07af:0x1ef,_0x19da72:0x1f9,_0x52973a:0x1bb,_0x43a134:0x1d0,_0x58e106:0x1b5,_0x1f0efe:0x1e0,_0x5c977d:0x219,_0x455258:0x1d4,_0x416fea:0x1fa,_0x4c0cd4:0x1d6,_0x6cb9b5:0x1d6};return __async(this,null,function*(){const _0x3d20ff=_0x1ae2;if(_0x4185bd==="movie")return 0x1;let _0x22bd86=_0x55ddd6,_0x46aca4=null,_0xf109eb=null;try{const _0x31a843=yield fetchJson("https://api.themoviedb.org/3/tv/"+_0x3db03b+"/external_ids?api_key="+TMDB_API_KEY);_0x31a843&&(_0x46aca4=_0x31a843['imdb_id'],_0xf109eb=_0x31a843["tvdb_id"]);}catch(_0x220014){}if(!_0xf109eb&&_0x4f6e6e)try{console["log"]('['+PROVIDER_NAME+"] Searching TVDB for series: "+_0x4f6e6e);const _0x47cb84='777140fb-de92-440a-aec2-95eb51e2d7ab',_0x35a4d6=yield fetchJson('https://api4.thetvdb.com/v4/login',{'method':'POST','headers':{'Content-Type':'application/json'},'body':JSON['stringify']({'apikey':_0x47cb84})});if(_0x35a4d6&&_0x35a4d6["data"]&&_0x35a4d6["data"]["token"]){const _0x5b605d=yield fetchJson("https://api4.thetvdb.com/v4/search?query="+encodeURIComponent(_0x4f6e6e),{'headers':{'Authorization':'Bearer\x20'+_0x35a4d6["data"]["token"]}});if(_0x5b605d&&_0x5b605d["data"]){const _0x38fad2=_0x5b605d["data"]["find"](_0x321abb=>_0x321abb['type']==='series');if(_0x38fad2){const _0x25e6c3=_0x38fad2['id']||_0x38fad2['tvdb_id'];_0x25e6c3&&(_0xf109eb=parseInt(String(_0x25e6c3)["replace"](/^series-/,''),0xa),console["log"]('['+PROVIDER_NAME+']\x20Resolved\x20TVDB\x20ID\x20'+_0xf109eb+'\x20from\x20search'));}}}}catch(_0x38d891){}if(_0xf109eb)try{console["log"]('['+PROVIDER_NAME+"] Attempting TVDB Math for TVDB: "+_0xf109eb);const _0x34df74='777140fb-de92-440a-aec2-95eb51e2d7ab',_0x5a80ea=yield fetchJson('https://api4.thetvdb.com/v4/login',{'method':'POST','headers':{'Content-Type':"application/json"},'body':JSON["stringify"]({'apikey':_0x34df74})});if(_0x5a80ea&&_0x5a80ea['data']&&_0x5a80ea['data']["token"]){const _0xdc9aea=yield fetchJson('https://api4.thetvdb.com/v4/series/'+_0xf109eb+"/episodes/default?season="+_0x4bf4b4,{'headers':{'Authorization':'Bearer\x20'+_0x5a80ea['data']["token"]}});if(_0xdc9aea&&_0xdc9aea['data']&&_0xdc9aea['data']['episodes']){const _0x1ec331=_0xdc9aea["data"]["episodes"]['find'](_0x49617a=>_0x49617a["seasonNumber"]==_0x4bf4b4&&_0x49617a["number"]==_0x55ddd6);if(_0x1ec331&&_0x1ec331['absoluteNumber'])return console['log']('['+PROVIDER_NAME+']\x20TVDB\x20Math\x20calculated\x20absolute\x20episode:\x20'+_0x1ec331['absoluteNumber']),_0x1ec331["absoluteNumber"];}}}catch(_0x8cd329){}if(_0x46aca4)try{console['log']('['+PROVIDER_NAME+"] Attempting Regex Math for IMDB: "+_0x46aca4);const _0x53d2f4='https://aiometadata.elfhosted.com/stremio/80d082c4-6e99-4c97-a67d-3d9e242685ce/meta/series/'+_0x46aca4+".json",_0x2ae4ca=yield __nvFetch(_0x53d2f4);if(_0x2ae4ca&&_0x2ae4ca['ok']){const _0x5f5d40=yield _0x2ae4ca['text']();let _0x2c988a=0x0,_0x5ca0b2=![];const _0x10c8ed=/"season"\s*:\s*(\d+)/g;let _0xc5fb66;while((_0xc5fb66=_0x10c8ed["exec"](_0x5f5d40))!==null){_0x5ca0b2=!![];const _0x508313=parseInt(_0xc5fb66[0x1]);_0x508313>0x0&&_0x508313<_0x4bf4b4&&_0x2c988a++;}if(_0x5ca0b2){let _0x1765f5=_0x2c988a+_0x55ddd6;return console["log"]('['+PROVIDER_NAME+']\x20Regex\x20Math\x20calculated\x20absolute\x20episode:\x20'+_0x1765f5),_0x1765f5;}}}catch(_0x223fbf){}try{console["log"]('['+PROVIDER_NAME+"] Attempting TMDB math for TMDB ID: "+_0x3db03b);const _0x3337de='https://api.themoviedb.org/3/tv/'+_0x3db03b+'?api_key='+TMDB_API_KEY,_0x400b82=yield fetchJson(_0x3337de,{});if(_0x400b82&&_0x400b82["seasons"]){let _0x241726=0x0;const _0x59d19e=_0x400b82["seasons"]['filter'](_0x1628f5=>_0x1628f5["season_number"]>0x0&&_0x1628f5["season_number"]<_0x4bf4b4);for(let _0x18ffd7 of _0x59d19e){_0x241726+=_0x18ffd7['episode_count'];}return _0x241726+=_0x55ddd6,console['log']('['+PROVIDER_NAME+"] TMDB Calculated absolute episode: "+_0x241726),_0x241726;}}catch(_0xdc1694){}return _0x22bd86;});}function getStreams(_0x37704d,_0x218083,_0x459b3d,_0x7ca264){const _0x1f9d8e={_0x47a5f1:0x1e5,_0x325ac1:0x217,_0x3719b2:0x1c0,_0x248fe2:0x204,_0x522468:0x1c7,_0x2e76eb:0x20d,_0x4a5ef5:0x1e4,_0x33d9f2:0x1e4,_0x5e5666:0x218,_0x266a14:0x1fb,_0x4c8558:0x1d4,_0x9e01fe:0x1ce,_0x4c9901:0x1e1,_0x494d07:0x1ba,_0x98eb5f:0x1b1,_0x494064:0x207,_0x45ea73:0x1ba,_0x150bd8:0x1ba,_0x10d000:0x203,_0x35e7c4:0x214,_0x330968:0x1d1,_0x1f94dd:0x208,_0x410514:0x20b,_0x1897a5:0x212,_0x4a112a:0x1de,_0x5832f8:0x1c6,_0x1f72e7:0x1cc,_0x2c9f40:0x1d7,_0x4a0c64:0x1bf};return __async(this,null,function*(){const _0x5d7a26=_0x1ae2,_0x4ddd9d=MOBILE_UAS[Math["floor"](Math["random"]()*MOBILE_UAS["length"])],_0x2ba8fd=getHeaders(_0x4ddd9d);console['log']('['+PROVIDER_NAME+']\x20Request:\x20ID='+_0x37704d+'\x20Type='+_0x218083+'\x20S='+_0x459b3d+" E="+_0x7ca264),yield refreshDomains();let _0x573ff5=[];try{const _0x104193=_0x218083==='tv'||_0x218083==='series'||_0x218083==='anime',_0x207569=_0x104193?'tv':'movie',_0x14625b=yield fetchJson('https://api.themoviedb.org/3/'+_0x207569+'/'+_0x37704d+'?api_key='+TMDB_API_KEY);if(!_0x14625b)return _0x573ff5;const _0x382f2a=_0x14625b['genres']&&_0x14625b['genres']['some'](_0x55dd04=>_0x55dd04["name"]==="Animation"),_0x40d9b6=['ja','zh','ko']["includes"](_0x14625b["original_language"]);if(!_0x382f2a||!_0x40d9b6)return console['log']('['+PROVIDER_NAME+"] Skipping non-anime media (Genres: "+(_0x14625b['genres']?_0x14625b["genres"]['map'](_0x2f9226=>_0x2f9226["name"])["join"](',\x20'):'none')+", Lang: "+_0x14625b['original_language']+').'),_0x573ff5;let _0x1fd32f=_0x14625b['name']||_0x14625b['title'];if(!_0x1fd32f)return _0x573ff5;let _0x26c93f='';if(_0x14625b['release_date'])_0x26c93f=_0x14625b["release_date"]["split"]('-')[0x0];else{if(_0x14625b['first_air_date'])_0x26c93f=_0x14625b['first_air_date']["split"]('-')[0x0];}let _0x346f8f=_0x1fd32f["split"](':')[0x0]['trim'](),_0x1429a0=_0x346f8f;_0x104193&&_0x459b3d>0x1&&(_0x1429a0+=" Season "+_0x459b3d);console['log']('['+PROVIDER_NAME+"] Searching for: "+_0x1429a0+" (Year: "+(_0x26c93f||'Unknown')+')');let _0xd096f9=yield fetchJson(BASE_URL+'/anime/search/?query='+encodeURIComponent(_0x1429a0),{'headers':_0x2ba8fd}),_0x40fe01=![];if(!_0xd096f9||!_0xd096f9['results']||_0xd096f9["results"]["length"]===0x0){_0x1429a0!==_0x346f8f&&(console['log']('['+PROVIDER_NAME+"] No results with season appended. Trying base title: "+_0x346f8f),_0xd096f9=yield fetchJson(BASE_URL+'/anime/search/?query='+encodeURIComponent(_0x346f8f),{'headers':_0x2ba8fd}),_0x40fe01=!![]);if(!_0xd096f9||!_0xd096f9['results']||_0xd096f9["results"]['length']===0x0)return console['log']('['+PROVIDER_NAME+"] No results found for query."),_0x573ff5;}let _0x369347=null,_0x477f15='',_0x28422e=_0x7ca264,_0x574c5=null,_0x4fe5cc=![];if(_0x104193){let _0x2dc1da=yield aniListBridge(_0x1429a0);if(_0x2dc1da&&_0x2dc1da['aniId'])_0x574c5=_0x2dc1da['aniId'],_0x4fe5cc=![];else _0x1429a0!==_0x346f8f&&(_0x2dc1da=yield aniListBridge(_0x346f8f),_0x2dc1da&&_0x2dc1da["aniId"]&&(_0x574c5=_0x2dc1da['aniId'],_0x4fe5cc=!![]));}if(_0x574c5){console["log"]('['+PROVIDER_NAME+']\x20AniList\x20Mapping\x20found:\x20AniId='+_0x574c5);const _0x3ebd33=new RegExp("[a-zA-Z/]"+_0x574c5+"[-.]");for(let _0x2b980a of _0xd096f9['results']){const _0x252850=_0x2b980a["cover_image"]&&_0x2b980a["cover_image"]["large"]?_0x2b980a['cover_image']['large']:'',_0x5e1b02=_0x2b980a["banner"]||'';if(_0x3ebd33["test"](_0x252850)||_0x3ebd33["test"](_0x5e1b02)){_0x369347=_0x2b980a['id'],_0x477f15=_0x2b980a["title"]['english']||_0x2b980a["title"]['romaji'];_0x4fe5cc&&_0x104193&&_0x459b3d>0x1?_0x28422e=yield getAbsoluteEpisode(_0x37704d,_0x218083,_0x459b3d,_0x7ca264,_0x1fd32f):_0x28422e=_0x7ca264;console["log"]('['+PROVIDER_NAME+"] Matched via AniList Cover/Banner Image ID!");break;}}}if(!_0x369347){for(let _0x3bc7ba=0x0;_0x3bc7ba<_0xd096f9["results"]["length"];_0x3bc7ba++){let _0x1c8b33=_0xd096f9['results'][_0x3bc7ba];if(_0x26c93f&&_0x1c8b33['year']===parseInt(_0x26c93f)){_0x369347=_0x1c8b33['id'],_0x477f15=_0x1c8b33["title"]['english']||_0x1c8b33["title"]['romaji'];break;}}!_0x369347&&(_0x369347=_0xd096f9['results'][0x0]['id'],_0x477f15=_0xd096f9["results"][0x0]["title"]["english"]||_0xd096f9["results"][0x0]["title"]["romaji"]),_0x104193&&_0x459b3d>0x1&&_0x40fe01&&(_0x28422e=yield getAbsoluteEpisode(_0x37704d,_0x218083,_0x459b3d,_0x7ca264,_0x1fd32f));}console['log']('['+PROVIDER_NAME+']\x20Matched\x20ID:\x20'+_0x369347+'\x20('+_0x477f15+") | Ep: "+_0x28422e);const _0x3167fa=['kite',"dio"],_0x114519=['sub',"dub"];for(const _0x273689 of _0x3167fa){for(const _0x399b34 of _0x114519){const _0x180b87=BASE_URL+'/anime/oppai/'+_0x369347+'/'+_0x28422e+"?server="+_0x273689+'&source_type='+_0x399b34;try{const _0xc5dcb3=yield fetchJson(_0x180b87,{'headers':_0x2ba8fd});if(_0xc5dcb3&&_0xc5dcb3["sources"]&&_0xc5dcb3["sources"]['length']>0x0)for(let _0x518154 of _0xc5dcb3['sources']){if(_0x518154['url']){const _0x43e8a1=PROXY_URL+_0x518154["url"],_0x473cf5=yield makeStream(PROVIDER_NAME,_0x273689['charAt'](0x0)['toUpperCase']()+_0x273689["slice"](0x1),_0x104193?'\x20S'+String(_0x459b3d)["padStart"](0x2,'0')+'E'+String(_0x7ca264)['padStart'](0x2,'0'):'',_0x399b34,_0x43e8a1,_0x518154["quality"]||"Auto",_0xc5dcb3["subs"],_0x4ddd9d);if(_0x473cf5)_0x573ff5["push"](_0x473cf5);}}}catch(_0x975fc4){console['log']('['+PROVIDER_NAME+']\x20Error\x20fetching\x20'+_0x273689+'\x20'+_0x399b34+':\x20'+_0x975fc4["message"]);}}}}catch(_0x3de368){console["log"]('['+PROVIDER_NAME+']\x20Error:\x20'+_0x3de368['message']);}return _0x573ff5;});}module['exports']={'manifest':manifest,'search':search,'getStreams':getStreams};

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
  var PROVIDER = "animetsu";
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
