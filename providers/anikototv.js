/*
 * nv-plugins anikototv.js — FULLY DECODED port of the All-in-One-Nuvio provider (4.24.0 merge pass).
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
var _0x18f4=function(){return "";};'use strict';const _0x28f3f0=_0x18f4;/*rotation removed*/;var __async=(_0x4ca38f,_0x3f879a,_0x1e39c8)=>{return new Promise((_0x4516b1,_0x3deece)=>{const _0x1eec5b={_0x53f0f7:0x162},_0x528d0b=_0x18f4;var _0x1f5651=_0x58cd18=>{const _0x5c3b6f=_0x18f4;try{_0x22d50d(_0x1e39c8["next"](_0x58cd18));}catch(_0x1cb52d){_0x3deece(_0x1cb52d);}},_0x7ccbee=_0x4e6ff1=>{const _0x1bb5d3=_0x18f4;try{_0x22d50d(_0x1e39c8["throw"](_0x4e6ff1));}catch(_0x31bf78){_0x3deece(_0x31bf78);}},_0x22d50d=_0x5acf0e=>_0x5acf0e['done']?_0x4516b1(_0x5acf0e["value"]):Promise["resolve"](_0x5acf0e["value"])["then"](_0x1f5651,_0x7ccbee);_0x22d50d((_0x1e39c8=_0x1e39c8['apply'](_0x4ca38f,_0x3f879a))['next']());});},PROVIDER_NAME='AnikotoTV',TMDB_API_KEY='439c478a771f35c05022f9feabcca01c',TVDB_API_KEY='777140fb-de92-440a-aec2-95eb51e2d7ab',MOBILE_UAS=['Mozilla/5.0\x20(Linux;\x20Android\x2014;\x20Pixel\x208\x20Pro)\x20AppleWebKit/537.36\x20(KHTML,\x20like\x20Gecko)\x20Chrome/124.0.0.0\x20Mobile\x20Safari/537.36',"Mozilla/5.0 (Linux; Android 13; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36",'Mozilla/5.0\x20(Linux;\x20Android\x2012;\x20Pixel\x206)\x20AppleWebKit/537.36\x20(KHTML,\x20like\x20Gecko)\x20Chrome/115.0.0.0\x20Mobile\x20Safari/537.36',"Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"];/*string-table removed*/function getHeaders(_0x1c5a86){const _0x5f4051=_0x28f3f0;var _0x3a2778=MOBILE_UAS[Math["floor"](Math['random']()*MOBILE_UAS['length'])],_0x3d8a55={'User-Agent':_0x3a2778,'Accept-Language':"en-US,en;q=0.9"};if(_0x1c5a86)for(var _0x14e9b5 in _0x1c5a86){_0x3d8a55[_0x14e9b5]=_0x1c5a86[_0x14e9b5];}return _0x3d8a55;}var _tvdbToken=null;function getTvdbToken(){const _0x4a89ef={_0x44bdfd:0x153,_0x160ec5:0x156,_0x38b8fc:0x144};return __async(this,null,function*(){const _0x2ff76b=_0x18f4;if(_tvdbToken)return _tvdbToken;try{var _0x76c45d=yield __nvFetch("https://api4.thetvdb.com/v4/login",{'method':"POST",'headers':{'Content-Type':"application/json"},'body':JSON["stringify"]({'apikey':TVDB_API_KEY})});if(_0x76c45d['ok']){var _0x3637f7=yield _0x76c45d["json"]();if(_0x3637f7&&_0x3637f7["data"]&&_0x3637f7["data"]['token'])_tvdbToken=_0x3637f7["data"]['token'];}}catch(_0x301b32){}return _tvdbToken;});}function getTMDBDetails(_0x569e9e,_0x361eb1,_0x2b4901,_0x28699d){const _0x202119={_0x41e1c1:0x187,_0x10ffb0:0x167,_0x478bfe:0x178,_0x1ae61b:0x13a,_0x243e77:0x18f,_0x53f4e2:0x18e,_0x2717eb:0x154,_0x36db47:0x148,_0x4eb5b5:0x18f,_0x485fb1:0x146,_0x4dd54e:0x19b,_0x1fe43e:0x195};return __async(this,null,function*(){const _0x5f37cb=_0x18f4;var _0x1d2771,_0x3a0d51;const _0x1011e8=_0x361eb1==='tv'||_0x361eb1==="series"?'tv':'movie';let _0x25aec7="https://api.themoviedb.org/3/"+_0x1011e8+'/'+_0x569e9e+"?api_key="+TMDB_API_KEY+"&append_to_response=external_ids";String(_0x569e9e)['startsWith']('tt')&&(_0x25aec7="https://api.themoviedb.org/3/find/"+_0x569e9e+'?external_source=imdb_id&api_key='+TMDB_API_KEY);try{const _0x237def=yield __nvFetch(_0x25aec7,{'headers':getHeaders()});if(!_0x237def['ok'])return{'title':'Anime\x20Title','year':"2026",'epTitle':"Episode "+_0x28699d,'duration':'24\x20min'};const _0x35bf75=yield _0x237def['json']();let _0x5cecab=_0x35bf75;String(_0x569e9e)['startsWith']('tt')&&(_0x5cecab=_0x1011e8==='tv'?(_0x1d2771=_0x35bf75['tv_results'])==null?void 0x0:_0x1d2771[0x0]:(_0x3a0d51=_0x35bf75["movie_results"])==null?void 0x0:_0x3a0d51[0x0]);if(!_0x5cecab)return{'title':"Anime Title",'year':'2026','epTitle':"Episode "+_0x28699d,'duration':"24 min"};const _0x124495=_0x1011e8==='tv'?_0x5cecab["name"]:_0x5cecab['title'],_0x5de1f4=_0x5cecab['release_date']||_0x5cecab["first_air_date"]||'',_0x263464=_0x5de1f4?_0x5de1f4["split"]('-')[0x0]:"2026";let _0x2bb2d1='Episode\x20'+_0x28699d,_0xc53680="24 min";if(_0x1011e8==='tv'&&_0x5cecab['id']&&_0x2b4901&&_0x28699d)try{const _0x16d255="https://api.themoviedb.org/3/tv/"+_0x5cecab['id']+'/season/'+_0x2b4901+"/episode/"+_0x28699d+'?api_key='+TMDB_API_KEY,_0x10c964=yield __nvFetch(_0x16d255,{'headers':getHeaders()});if(_0x10c964['ok']){const _0x5a43a8=yield _0x10c964['json']();if(_0x5a43a8["name"])_0x2bb2d1=_0x5a43a8["name"];if(_0x5a43a8["runtime"])_0xc53680=_0x5a43a8["runtime"]+'\x20min';}}catch(_0xa947a9){}else _0x1011e8==="movie"&&_0x5cecab['runtime']&&(_0xc53680=_0x5cecab["runtime"]+" min");return{'title':_0x124495,'year':_0x263464,'epTitle':_0x2bb2d1,'duration':_0xc53680};}catch(_0xbb92c2){return{'title':'Anime\x20Title','year':"2026",'epTitle':"Episode "+_0x28699d,'duration':"24 min"};}});}function getTMDBTitle(_0x1b01e5,_0x4a77b9){return __async(this,null,function*(){const _0x2c407b=yield getTMDBDetails(_0x1b01e5,_0x4a77b9);return{'title':_0x2c407b['title'],'numericId':_0x1b01e5};});}function getTMDBSeasonName(_0x4ff155,_0xb0d29e){const _0x9da589={_0x416d44:0x146,_0x3205e1:0x167};return __async(this,null,function*(){const _0x3937b4=_0x18f4,_0xb05af2="https://api.themoviedb.org/3/tv/"+_0x4ff155+"/season/"+_0xb0d29e+"?api_key="+TMDB_API_KEY;try{const _0x41ba87=yield __nvFetch(_0xb05af2);if(_0x41ba87['ok']){const _0x26de84=yield _0x41ba87["json"]();return _0x26de84['name'];}}catch(_0x3a5427){}return null;});}function aniListBridge(_0x16494b){const _0x333519={_0x2d600c:0x147};return __async(this,null,function*(){const _0x4d865b=_0x18f4,_0x50970f=" query ($search: String) { Media (search: $search, type: ANIME) { id idMal } } ";try{const _0x4b446e=yield __nvFetch('https://graphql.anilist.co',{'method':'POST','headers':Object["assign"](getHeaders(),{'Content-Type':'application/json','Accept':'application/json'}),'body':JSON['stringify']({'query':_0x50970f,'variables':{'search':_0x16494b}})}),_0x124419=yield _0x4b446e['json']();if(_0x124419&&_0x124419['data']&&_0x124419['data']['Media'])return{'malId':_0x124419['data']['Media']['idMal'],'aniId':_0x124419['data']['Media']['id'],'absEp':null};}catch(_0x32a3a6){}return null;});}function getMalId(_0x339937,_0x4e42cb,_0x37659c,_0x1f5b25){const _0x2cc129={_0xe6592e:0x18d,_0x426a4a:0x168,_0xf6282f:0x19c};return __async(this,null,function*(){const _0x58d710=_0x18f4;try{let _0x30fa98="https://arm.haglund.dev/api/v2/tmdb?id="+_0x339937;if(_0x4e42cb==='tv'||_0x4e42cb==='series')_0x30fa98+="&s="+_0x37659c+'&e='+_0x1f5b25;const _0x69bc24=yield __nvFetch(_0x30fa98);if(_0x69bc24['ok']){const _0x4c3820=yield _0x69bc24['json']();if(_0x4c3820['mal']||_0x4c3820['mal_id']||_0x4c3820["anilist"]||_0x4c3820["ani_id"])return{'malId':_0x4c3820['mal']||_0x4c3820['mal_id'],'aniId':_0x4c3820['anilist']||_0x4c3820['ani_id'],'absEp':_0x4c3820['episode']||_0x1f5b25};}}catch(_0x55e695){}const _0x152dd6=yield getTMDBTitle(_0x339937,_0x4e42cb);let _0x43f7cb=_0x152dd6['title'];const _0x3453d4=_0x152dd6['numericId'];if(_0x43f7cb){let _0x4afcb2=_0x43f7cb;if((_0x4e42cb==='tv'||_0x4e42cb==="series")&&_0x37659c>0x1&&_0x3453d4){const _0x388c70=yield getTMDBSeasonName(_0x3453d4,_0x37659c);_0x388c70?_0x388c70['toLowerCase']()['includes'](_0x43f7cb["toLowerCase"]())?_0x43f7cb=_0x388c70:_0x43f7cb=_0x43f7cb+'\x20'+_0x388c70:_0x43f7cb=_0x43f7cb+" Season "+_0x37659c;}let _0x230ebc=yield aniListBridge(_0x43f7cb),_0x348ca7=![];(!_0x230ebc||_0x230ebc&&!_0x230ebc['malId'])&&_0x43f7cb!==_0x4afcb2&&(_0x230ebc=yield aniListBridge(_0x4afcb2),_0x348ca7=!![]);if(_0x230ebc)return _0x230ebc["absEp"]=_0x1f5b25,_0x230ebc['usedFallback']=_0x348ca7,_0x230ebc['name']=_0x152dd6['title'],_0x230ebc;}return null;});}function extractHLS(_0x2e734b,_0x471807){const _0x5bc420={_0x1ae053:0x176,_0x5ec42d:0x15d,_0x283957:0x159,_0x2ce91b:0x191,_0x296576:0x186};return __async(this,null,function*(){const _0x574265=_0x18f4;try{const _0x1aeca0=Object["assign"](getHeaders(),{'Referer':"https://"+_0x471807+'/'}),_0x3d9692=yield __nvFetch(_0x2e734b,{'headers':_0x1aeca0});if(!_0x3d9692['ok'])return null;const _0x17b3ad=yield _0x3d9692['text']();let _0x31636d=_0x17b3ad['match'](/data-id="(\d+)"/);if(!_0x31636d){const _0x64f085=_0x17b3ad['match'](/<iframe[^>]*src="([^"]+)"/);if(_0x64f085){const _0x4f40d8=_0x64f085[0x1]['startsWith']("http")?_0x64f085[0x1]:'https://'+_0x471807+_0x64f085[0x1],_0x429fa1=yield __nvFetch(_0x4f40d8,{'headers':_0x1aeca0});if(_0x429fa1['ok']){const _0x5068a4=yield _0x429fa1["text"]();_0x31636d=_0x5068a4['match'](/data-id="(\d+)"/);}}}if(!_0x31636d)return null;const _0x2888d3=_0x31636d[0x1],_0x286339='https://'+_0x471807+"/stream/getSources?id="+_0x2888d3,_0x5908b5=yield __nvFetch(_0x286339,{'headers':Object['assign'](getHeaders(),{'X-Requested-With':"XMLHttpRequest",'Referer':_0x2e734b})});if(!_0x5908b5['ok'])return null;const _0x57845c=yield _0x5908b5['json']();if(_0x57845c['sources']&&_0x57845c["sources"]['file']){const _0x59beb9=[];if(_0x57845c['tracks'])for(const _0x4a7097 of _0x57845c["tracks"]){(_0x4a7097['kind']==="captions"||_0x4a7097["kind"]==='subtitles')&&_0x59beb9['push']({'id':_0x4a7097['label']||_0x4a7097["file"]||"Unknown",'url':_0x4a7097["file"],'language':'eng'});}var _0x3ace61='1080p';try{const _0x5d39ff=yield __nvFetch(_0x57845c['sources']['file'],{'headers':{'Referer':'https://'+_0x471807+'/'}});if(_0x5d39ff['ok']){const _0x2edc9a=yield _0x5d39ff['text']();var _0x48fab0=_0x2edc9a['match'](/RESOLUTION=\d+x(\d+)/);if(_0x48fab0)_0x3ace61=_0x48fab0[0x1]+'p';}}catch(_0x21ca45){}return{'url':_0x57845c['sources']['file'],'quality':_0x3ace61,'subtitles':_0x59beb9,'headers':{'Referer':"https://"+_0x471807+'/','Origin':'https://'+_0x471807}};}}catch(_0xbbd631){}return null;});}function fetchJson(_0x76d1db){return __async(this,arguments,function*(_0x2fb9c6,_0xa93135={}){const _0x54f14f=yield __nvFetch(_0x2fb9c6,_0xa93135);if(!_0x54f14f['ok'])return null;return yield _0x54f14f['json']();});}function getAbsoluteEpisode(_0x58f293,_0x2f7ba5,_0xc25cba,_0x5443bd,_0x318a39){const _0x20e5f4={_0x269c65:0x19b,_0x48e47a:0x144,_0x11148a:0x144,_0x30ee96:0x18a,_0xecd43f:0x180,_0x309ef0:0x17e};return __async(this,null,function*(){const _0x2d956b=_0x18f4;if(_0x2f7ba5==="movie")return 0x1;let _0x51d86f=_0x5443bd,_0x1a114d=null,_0x2a63a6=null;try{const _0xb6803a=yield fetchJson('https://api.themoviedb.org/3/tv/'+_0x58f293+'/external_ids?api_key='+TMDB_API_KEY);_0xb6803a&&(_0x1a114d=_0xb6803a['imdb_id'],_0x2a63a6=_0xb6803a['tvdb_id']);}catch(_0x383895){}if(!_0x2a63a6&&_0x318a39)try{const _0x31c6e7=yield getTvdbToken();if(_0x31c6e7){const _0x5a2b81=yield fetchJson("https://api4.thetvdb.com/v4/search?query="+encodeURIComponent(_0x318a39),{'headers':{'Authorization':"Bearer "+_0x31c6e7}});if(_0x5a2b81&&_0x5a2b81["data"]){const _0x37ec1b=_0x5a2b81['data']['find'](_0x194a9c=>_0x194a9c['type']==="series");if(_0x37ec1b){const _0x55f55a=_0x37ec1b['id']||_0x37ec1b['tvdb_id'];if(_0x55f55a)_0x2a63a6=parseInt(String(_0x55f55a)['replace'](/^series-/,''),0xa);}}}}catch(_0x45cdd0){}if(_0x2a63a6)try{const _0x56e90a=yield getTvdbToken();if(_0x56e90a){const _0x1721a2=yield fetchJson("https://api4.thetvdb.com/v4/series/"+_0x2a63a6+'/episodes/default?season='+_0xc25cba,{'headers':{'Authorization':'Bearer\x20'+_0x56e90a}});if(_0x1721a2&&_0x1721a2["data"]&&_0x1721a2["data"]["episodes"]){const _0x3707dc=_0x1721a2['data']['episodes']["find"](_0x4af43d=>_0x4af43d["seasonNumber"]==_0xc25cba&&_0x4af43d["number"]==_0x5443bd);if(_0x3707dc&&_0x3707dc['absoluteNumber'])return _0x3707dc["absoluteNumber"];}}}catch(_0x39df92){}if(_0x1a114d)try{const _0x280fa3="https://aiometadata.elfhosted.com/stremio/80d082c4-6e99-4c97-a67d-3d9e242685ce/meta/series/"+_0x1a114d+'.json',_0x11b45d=yield __nvFetch(_0x280fa3);if(_0x11b45d['ok']){const _0x1ac81c=yield _0x11b45d["text"]();let _0x1e6b1e=0x0,_0x20695a=![];const _0x4e9432=/"season"\s*:\s*(\d+)/g;let _0x1f7b47;while((_0x1f7b47=_0x4e9432['exec'](_0x1ac81c))!==null){_0x20695a=!![];const _0x2587d2=parseInt(_0x1f7b47[0x1]);if(_0x2587d2>0x0&&_0x2587d2<_0xc25cba)_0x1e6b1e++;}if(_0x20695a)return _0x1e6b1e+_0x5443bd;}}catch(_0x7dc9a7){}try{const _0x1dd45c='https://api.themoviedb.org/3/tv/'+_0x58f293+"?api_key="+TMDB_API_KEY,_0x14a578=yield fetchJson(_0x1dd45c,{});if(_0x14a578&&_0x14a578['seasons']){let _0x481bcb=0x0;const _0x2ab00d=_0x14a578["seasons"]['filter'](_0x2027ab=>_0x2027ab['season_number']>0x0&&_0x2027ab["season_number"]<_0xc25cba);for(let _0x37395c of _0x2ab00d){_0x481bcb+=_0x37395c["episode_count"];}return _0x481bcb+=_0x5443bd,_0x481bcb;}}catch(_0x589820){}return _0x51d86f;});}function getStreams(_0x4e3efa,_0x2d8f06,_0xdae045,_0x2db00a){const _0x145d04={_0xe692fe:0x152,_0x41c9d8:0x183,_0x40e8be:0x14f,_0x4b739c:0x145,_0x50e5d0:0x14e,_0x1e34d7:0x19d,_0xd2d640:0x171,_0x388fff:0x16c,_0x3839c8:0x14c,_0x12babb:0x165,_0x3f4f9a:0x17a,_0x486a67:0x16f,_0x3b8243:0x16c};return __async(this,null,function*(){const _0x5094bf=_0x18f4;try{const _0x40b06f=yield getMalId(_0x4e3efa,_0x2d8f06,_0xdae045,_0x2db00a);if(!_0x40b06f||!_0x40b06f['malId']&&!_0x40b06f['aniId'])return[];const _0x204d8f=!!_0x40b06f["malId"],_0x25b16d=_0x204d8f?_0x40b06f['malId']:_0x40b06f['aniId'],_0x586a77=_0x204d8f?"mal":"ani";let _0x40660e=_0x2d8f06==='movie'?0x1:_0x40b06f['absEp'];_0x2d8f06!=="movie"&&_0x40b06f['usedFallback']&&_0xdae045>0x1&&(_0x40660e=yield getAbsoluteEpisode(_0x4e3efa,_0x2d8f06,_0xdae045,_0x2db00a,_0x40b06f['name']));const _0x17d9dc=yield getTMDBDetails(_0x4e3efa,_0x2d8f06,_0xdae045,_0x2db00a),_0x58a1d1=[],_0x5a010b=[{'id':'Vidstream','domain':'megaplay.buzz'}];for(const _0x388dd3 of _0x5a010b){const _0x16157c=['sub',"dub"];for(const _0x4da171 of _0x16157c){const _0x466019='https://'+_0x388dd3['domain']+"/stream/"+_0x586a77+'/'+_0x25b16d+'/'+_0x40660e+'/'+_0x4da171,_0x3bb62=yield extractHLS(_0x466019,_0x388dd3["domain"]);if(_0x3bb62){const _0x4cdf52=(_0x3bb62["quality"]||"1080p")['toLowerCase'](),_0x20c292=_0x4da171==="sub"?'🇯🇵\x20Japanese':"🇺🇲 English",_0x14cd1f=_0x4da171==="sub"?"SUB":'DUB',_0x376163=_0x4da171==='sub'?'Japanese\x20(SUB)':'English\x20(DUB)',_0x2b3f0b=_0x3bb62["url"]['includes'](".m3u8")?'HLS':'M3U8',_0x15d865=PROVIDER_NAME+" | "+_0x4cdf52+" | "+_0x376163,_0x33089d='🎦\x20'+_0x17d9dc['title']+" - ("+_0x17d9dc["year"]+')',_0x59a1c3=_0x2d8f06==='movie'?"🎬 Movie Presentation":'🎬\x20S'+(_0xdae045||0x1)+'E'+(_0x2db00a||0x1)+'\x20-\x20'+_0x17d9dc['epTitle'],_0x83a2fa='✨\x20'+_0x4cdf52+'\x20|\x20'+_0x20c292+" • 🗣️ "+_0x14cd1f,_0x45de7b="🔗 "+_0x388dd3['id']+'\x20|\x20⏳\x20'+_0x17d9dc["duration"]+" | ⚡ "+_0x2b3f0b,_0x508e7f=_0x33089d+'\x0a'+_0x59a1c3+'\x0a'+_0x83a2fa+'\x0a'+_0x45de7b;_0x58a1d1["push"]({'name':_0x15d865,'title':_0x508e7f,'size':_0x508e7f,'description':_0x508e7f,'url':_0x3bb62["url"],'subtitles':_0x3bb62['subtitles'],'headers':_0x3bb62['headers']});}}}return _0x58a1d1;}catch(_0x50a85a){return[];}});}function search(_0x2afb92){return __async(this,null,function*(){return[];});}/*decoder removed*/function getCatalog(_0x3d0599){return __async(this,null,function*(){return[];});}function getItemDetails(_0x4fe737){return __async(this,null,function*(){return[];});}typeof module!=='undefined'&&module['exports']?module['exports']={'getStreams':getStreams,'search':search,'getCatalog':getCatalog,'getItemDetails':getItemDetails}:global['getStreams']=getStreams;

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
  var PROVIDER = "anikototv";
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
