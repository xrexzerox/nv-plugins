/*
 * nv-plugins ctgmovies.js — FULLY DECODED port of the All-in-One-Nuvio provider (4.24.0 merge pass).
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
var _0x4700=function(){return "";};const _0x52e89e=_0x4700;/*decoder removed*//*rotation removed*/;var TMDB_API_KEY="439c478a771f35c05022f9feabcca01c",TMDB_BASE_URL="https://api.themoviedb.org/3",MAIN_URL='https://ctgmovies.com',DEFAULT_API_BASE='https://cockpit.103.109.92.178.nip.io/api/v1',UA='Mozilla/5.0\x20(Windows\x20NT\x2010.0;\x20Win64;\x20x64)\x20AppleWebKit/537.36\x20(KHTML,\x20like\x20Gecko)\x20Chrome/125.0.0.0\x20Safari/537.36',AUTH_CONFIG={'token':'','cookie':''},WEB_HEADERS={'User-Agent':UA,'Accept':'application/json','Accept-Language':'en','Referer':MAIN_URL+'/','Origin':MAIN_URL},STREAM_HEADERS={'User-Agent':UA,'Accept':"video/webm,video/ogg,video/*;q=0.9,application/ogg;q=0.7,audio/*;q=0.6,*/*;q=0.5",'Accept-Language':'en-US,en;q=0.9','Accept-Encoding':"identity",'Referer':MAIN_URL+'/','Sec-Fetch-Dest':'video','Sec-Fetch-Mode':"no-cors",'Sec-Fetch-Site':'cross-site','DNT':'1'};function encodeUrl(_0x306cc0){return encodeURIComponent(_0x306cc0||'');}function yearFromDate(_0x204961){const _0x257174=_0x52e89e;if(!_0x204961)return null;const _0x16208c=_0x204961["match"](/\d{4}/);return _0x16208c?parseInt(_0x16208c[0x0],0xa):null;}function cleanDisplayTitle(_0x196df4){const _0x59ced6={_0x55487b:0x1dc},_0x58d98f=_0x52e89e;if(!_0x196df4)return'';return _0x196df4["replace"](/\b(1080p|720p|480p|2160p|4k|web[- ]?dl|webrip|bluray|hdrip|x264|x265|hevc|10bit|dual[- ]?audio|hindi[- ]?dubbed|dubbed|esub)\b/gi,'\x20')["replace"](/\[[^\]]*\]/g,'\x20')['replace'](/\s+/g,'\x20')["trim"]();}function normalizedTitle(_0x89087b){return cleanDisplayTitle(_0x89087b)['toLowerCase']()['replace'](/[^a-z0-9]+/g,'\x20')['trim']();}function optString(_0x2172aa,_0x4307dd){const _0xeb97fa={_0x435e1f:0x1e8},_0x364cb8=_0x52e89e;if(!_0x2172aa||_0x2172aa[_0x4307dd]==null)return null;let _0x458f7a=_0x2172aa[_0x4307dd];if(typeof _0x458f7a!=="string")_0x458f7a=String(_0x458f7a);_0x458f7a=_0x458f7a['trim']();if(!_0x458f7a||_0x458f7a==="null")return null;return _0x458f7a;}function optInt(_0x3152bb,_0x529129){if(!_0x3152bb||_0x3152bb[_0x529129]==null)return null;const _0x47b0c3=_0x3152bb[_0x529129];if(typeof _0x47b0c3==='number')return _0x47b0c3;const _0x1e1728=parseInt(String(_0x47b0c3),0xa);return isNaN(_0x1e1728)?null:_0x1e1728;}function resolveMediaUrl(_0x32103e){const _0x525a61={_0x43308a:0x1e0},_0x21cd6b=_0x52e89e;if(!_0x32103e)return'';if(_0x32103e['startsWith']('//'))return'https:'+_0x32103e;if(/^https?:\/\//i["test"](_0x32103e))return _0x32103e;if(_0x32103e["startsWith"]('/'))return MAIN_URL+_0x32103e;return _0x32103e;}function resolveSubtitleUrl(_0x206272){const _0x5cb94f={_0x164607:0x187,_0x1231b8:0x1d2},_0x15dd6b=_0x52e89e;if(!_0x206272)return'';if(_0x206272["startsWith"]('//'))return "https:"+_0x206272;if(/^https?:\/\//i['test'](_0x206272))return _0x206272;if(_0x206272['startsWith']('/'))return MAIN_URL+_0x206272;return MAIN_URL+'/'+_0x206272;}function qualityFromUrl(_0x1ddb03){const _0x2392bf={_0x258bed:0x17d,_0x51c1a2:0x1b3,_0x2f8ca0:0x1b9},_0x3fe055=_0x52e89e;if(!_0x1ddb03)return'Unknown';const _0x3d5cf9=_0x1ddb03['match'](/(2160p|1440p|1080p|720p|576p|540p|480p|360p|4k|uhd)/i);if(_0x3d5cf9){const _0x46c84e=_0x3d5cf9[0x1]["toLowerCase"]();if(_0x46c84e==='4k'||_0x46c84e==="uhd")return "2160p";return _0x46c84e;}return'Unknown';}function cleanSourceName(_0x51bf0e){const _0x43e7cc={_0x5ccc47:0x1c0},_0x122ae1=_0x52e89e;if(!_0x51bf0e)return'';let _0x2fc29d=_0x51bf0e['replace']("auto:",'')["replace"](/:/g,'\x20')["replace"](/-/g,'\x20')['trim']();return/^server\s*[a-z]$/i["test"](_0x2fc29d)&&(_0x2fc29d=_0x2fc29d['replace'](/server\s*([a-z])/i,function(_0x38629f,_0x215e51){const _0x57589f=_0x122ae1;return'Server\x20'+_0x215e51["toUpperCase"]();})),_0x2fc29d;}function subtitleLabelFromUrl(_0x537a4b){const _0x49215e={_0x489d0a:0x1e1,_0x5a7b07:0x17d,_0x2c3698:0x1aa,_0x2a7241:0x1c4,_0x4a18a1:0x196},_0x3cf83a=_0x52e89e;if(!_0x537a4b)return'Subtitle';const _0xa21711=_0x537a4b["split"]('?')[0x0]["split"]('/')['pop']()['replace'](/%20/g,'\x20'),_0x4e6ebb=_0xa21711["toLowerCase"]();if(_0x4e6ebb['includes']('bangla')||_0x4e6ebb['includes']("bengali")||_0x4e6ebb['includes']("ben"))return'Bangla';if(_0x4e6ebb["includes"]('english')||_0x4e6ebb['includes']('eng'))return "English";if(_0x4e6ebb["includes"]('hindi')||_0x4e6ebb['includes']('hin'))return "Hindi";return'Subtitle';}function formatBytes(_0x2cb7ec){const _0x325d31={_0x46436f:0x199,_0x524bf3:0x176,_0x1eb709:0x176,_0x8df58b:0x1f4},_0x47a05a=_0x52e89e;if(!_0x2cb7ec||_0x2cb7ec===0x0)return "Unknown";const _0x195dd8=0x400,_0x535431=['Bytes','KB','MB','GB','TB'],_0x53308e=Math["floor"](Math["log"](_0x2cb7ec)/Math["log"](_0x195dd8));return parseFloat((_0x2cb7ec/Math["pow"](_0x195dd8,_0x53308e))['toFixed'](0x1))+'\x20'+_0x535431[_0x53308e];}function getTMDBDetails(_0x8dca7c,_0x38c07a){const _0x4679da={_0x219083:0x197},_0x1c9c99={_0x512860:0x1c2},_0x1425d2={_0x4398e1:0x174},_0x3e027c=_0x52e89e,_0x3d1053=_0x38c07a==='tv'?'tv':'movie',_0x27d001=TMDB_BASE_URL+'/'+_0x3d1053+'/'+_0x8dca7c+"?api_key="+TMDB_API_KEY+'&append_to_response=external_ids';return __nvFetch(_0x27d001,{'headers':{'Accept':'application/json'},'skipSizeCheck':!![]})["then"](_0x552a9d=>{if(!_0x552a9d['ok'])throw new Error('TMDB\x20HTTP\x20'+_0x552a9d['status']);return _0x552a9d['json']();})["then"](_0x49e24c=>{const _0x2c67c4=_0x3e027c,_0x3bef18=_0x38c07a==='tv'?_0x49e24c['name']:_0x49e24c['title'],_0x475597=_0x38c07a==='tv'?_0x49e24c['first_air_date']:_0x49e24c["release_date"];return{'title':_0x3bef18,'year':_0x475597?parseInt(_0x475597["split"]('-')[0x0],0xa):null,'imdbId':_0x49e24c['external_ids']&&_0x49e24c['external_ids']['imdb_id']||null};})["catch"](_0x1d094e=>{const _0xb79ea1=_0x3e027c;return console["error"]('[CTGMovies]\x20TMDB\x20fetch\x20failed:',_0x1d094e['message']),null;});}function queryString(_0x1705e3){const _0x521cdb={_0x3e4469:0x1d4,_0x416877:0x19b},_0x583ce7=_0x52e89e;_0x1705e3=_0x1705e3||{};const _0x55c7fc=Object["keys"](_0x1705e3)['filter'](_0x33f506=>_0x1705e3[_0x33f506]!=null)["map"](_0x384759=>encodeUrl(_0x384759)+'='+encodeUrl(String(_0x1705e3[_0x384759])));return _0x55c7fc["length"]?'?'+_0x55c7fc["join"]('&'):'';}function buildApiUrl(_0x247cc4,_0x1e5990){const _0x46a549={_0x14b005:0x187},_0x3168b9=_0x52e89e,_0x131f2b=_0x247cc4["startsWith"]('/')?_0x247cc4:'/'+_0x247cc4;return DEFAULT_API_BASE+_0x131f2b+queryString(_0x1e5990);}function buildSameOriginUrl(_0x3c39fd,_0x18d1d7){const _0x140c9b={_0x302d8d:0x187},_0x50b44f=_0x52e89e,_0x129018=_0x3c39fd["startsWith"]('/')?_0x3c39fd:'/'+_0x3c39fd;return MAIN_URL+'/api/v1'+_0x129018+queryString(_0x18d1d7);}function getDetail(_0x169f63){const _0x2ea707={_0x1b4c57:0x192,_0x14360a:0x17b,_0x54d2a7:0x197},_0x567818=_0x52e89e;let _0x1f8184=_0x169f63["kind"]||"movies";if(_0x1f8184==='movie')_0x1f8184='movies';return apiGet('/'+_0x1f8184+'/'+_0x169f63['id'])["then"](_0x297bce=>{if(!_0x297bce)return null;try{return JSON['parse'](_0x297bce);}catch(_0x2ca488){return null;}});}function apiHeaders(){const _0x55596c={_0x5c838e:0x1a5,_0x396058:0x1b2,_0x554dca:0x1bd,_0x3966a9:0x1ee},_0x4840fc=_0x52e89e,_0x1dba0e=Object["assign"]({},WEB_HEADERS);if(AUTH_CONFIG['token']&&AUTH_CONFIG["token"]['trim']()){const _0x325268=AUTH_CONFIG['token']['trim']()['replace'](/^Bearer\s+/i,'');_0x1dba0e["Authorization"]="Bearer "+_0x325268,_0x1dba0e["x-auth-token"]=_0x325268;}return AUTH_CONFIG["cookie"]&&AUTH_CONFIG['cookie']["trim"]()&&(_0x1dba0e["Cookie"]=AUTH_CONFIG["cookie"]['trim']()),_0x1dba0e;}function apiGet(_0x5b9cc6,_0x82ba72){const _0x520a41={_0x191a9d:0x1c2},_0xffe710={_0x379636:0x197,_0x30bc4a:0x1cc,_0x105840:0x1b6},_0x11f48e=_0x52e89e,_0x5b5473=buildApiUrl(_0x5b9cc6,_0x82ba72),_0x1c0573=buildSameOriginUrl(_0x5b9cc6,_0x82ba72),_0x39e02a=apiHeaders();function _0x182623(_0x32f83c,_0x3c6962){return _0x3c6962=_0x3c6962||0x0,__nvFetch(_0x32f83c,{'headers':_0x39e02a,'skipSizeCheck':!![]})['then'](_0x357bcd=>{const _0x13a147=_0x4700;if(_0x357bcd["status"]>=0x1f4&&_0x357bcd['status']<0x258&&_0x3c6962<0x1)return new Promise(_0x4013e7=>setTimeout(_0x4013e7,0x12c))["then"](()=>_0x182623(_0x32f83c,_0x3c6962+0x1));if(!_0x357bcd['ok'])throw new Error('HTTP\x20'+_0x357bcd["status"]);return _0x357bcd["text"]();});}return _0x182623(_0x5b5473)['catch'](()=>_0x182623(_0x1c0573))["catch"](_0x1dda93=>{const _0x1857cf=_0x11f48e;return console["error"]('[CTGMovies]\x20apiGet\x20'+_0x5b9cc6+" failed:",_0x1dda93["message"]),null;});}function toSearchItem(_0xe2fd2a,_0x341c01){const _0x534500={_0x41023e:0x1c5,_0x5d7784:0x190,_0x3924fe:0x19f,_0x2498e7:0x177,_0x4320a2:0x193},_0x1542eb=_0x52e89e,_0x1fdcd8=_0x341c01==="movies",_0x2d0768=_0x341c01==="anime"||_0xe2fd2a['is_anime']===!![]&&_0x341c01!=='tv',_0x53dcf7=optString(_0xe2fd2a,"title")||optString(_0xe2fd2a,'name')||optString(_0xe2fd2a,"english_title");if(!_0x53dcf7)return null;const _0x210449=optString(_0xe2fd2a,'slug')||optString(_0xe2fd2a,'id')||optString(_0xe2fd2a,'_id');if(!_0x210449)return null;const _0x20f1a2=optString(_0xe2fd2a,'poster_url')||optString(_0xe2fd2a,'cover_url'),_0x2de495=optInt(_0xe2fd2a,"year")||yearFromDate(optString(_0xe2fd2a,'release_date'))||yearFromDate(optString(_0xe2fd2a,"first_air_date"));let _0x54e90c=_0x1fdcd8?'movie':_0x2d0768?"anime":'tv',_0x5dcd76=MAIN_URL+'/'+(_0x1fdcd8?'movies':_0x2d0768?"anime":'tv')+'/'+_0x210449;return{'title':cleanDisplayTitle(_0x53dcf7),'url':_0x5dcd76,'kind':_0x341c01,'id':_0x210449,'type':_0x54e90c,'poster':_0x20f1a2,'year':_0x2de495};}function parseSearchItems(_0x794105,_0x59df5d){const _0x3f06b3={_0x443332:0x17b},_0x2ca968=_0x52e89e;if(!_0x794105)return[];let _0x5930a9=_0x794105["trim"](),_0x3ada66;try{const _0x273d16=JSON['parse'](_0x5930a9);if(Array['isArray'](_0x273d16))_0x3ada66=_0x273d16;else _0x273d16&&typeof _0x273d16==="object"?_0x3ada66=_0x273d16["movies"]||_0x273d16["results"]||_0x273d16['data']||[]:_0x3ada66=[];}catch(_0x27f4a6){return[];}const _0x52b019=[];for(const _0x592b0f of _0x3ada66){const _0x5a6a06=toSearchItem(_0x592b0f,_0x59df5d);if(_0x5a6a06)_0x52b019["push"](_0x5a6a06);}return _0x52b019;}function searchCtg(_0x153f4c){const _0x57a05d={_0x543c80:0x19c,_0x1a6e02:0x197,_0x246868:0x188,_0x104238:0x1b0},_0x464056=_0x52e89e,_0x3cf7bd={'search':_0x153f4c},_0x24ab75=apiGet("/movies",_0x3cf7bd)["then"](_0x3ce19e=>parseSearchItems(_0x3ce19e,"movies"))["catch"](()=>[]),_0x53d37a=apiGet("/tv",_0x3cf7bd)["then"](_0x1d9988=>parseSearchItems(_0x1d9988,'tv'))["catch"](()=>[]),_0x4cfb3b=apiGet("/anime",_0x3cf7bd)["then"](_0x8ac47e=>parseSearchItems(_0x8ac47e,"anime"))['catch'](()=>[]);return Promise['all']([_0x24ab75,_0x53d37a,_0x4cfb3b])["then"](([_0x12d3b1,_0x31b65f,_0x2fa174])=>_0x12d3b1['concat'](_0x31b65f)["concat"](_0x2fa174));}function findBestMatch(_0x471698,_0x169eeb,_0x5e24f9){const _0x2dac40={_0x53ad65:0x177,_0x53c02f:0x190,_0x15e753:0x196,_0x45f1ca:0x1f0},_0x3c11f1=_0x52e89e;if(!_0x169eeb['length'])return null;const _0x40130f=normalizedTitle(_0x471698['title']),_0x5741a6=_0x471698["year"];let _0x29343e=null,_0x452f18=-0x1;for(const _0x5db85b of _0x169eeb){const _0x445855=normalizedTitle(_0x5db85b["title"]);let _0x4c8e3d=-0x1;if(_0x445855===_0x40130f){_0x4c8e3d=0x64;if(_0x5741a6&&_0x5db85b["year"]===_0x5741a6)_0x4c8e3d+=0x32;}else{if(_0x445855["includes"](_0x40130f)&&_0x40130f['length']>=0x4){_0x4c8e3d=0x3c;if(_0x5741a6&&_0x5db85b['year']===_0x5741a6)_0x4c8e3d+=0x1e;}else _0x40130f['includes'](_0x445855)&&_0x445855['length']>=0x4&&(_0x4c8e3d=0x28);}if(_0x5e24f9==='tv'&&(_0x5db85b['type']==='tv'||_0x5db85b['type']==='anime'))_0x4c8e3d+=0xa;if(_0x5e24f9==="movie"&&(_0x5db85b["type"]==='movie'||_0x5db85b["type"]==='anime'))_0x4c8e3d+=0xa;_0x4c8e3d>_0x452f18&&(_0x452f18=_0x4c8e3d,_0x29343e=_0x5db85b);}return _0x452f18>=0x1e?_0x29343e:null;}function buildStreams(_0x3741c5,_0x14285e){const _0x42c6de={_0xecf79c:0x1ef,_0xf282fb:0x1a9,_0x4b2a54:0x1c6,_0x5f3a24:0x1e7,_0x5d2a6e:0x17d,_0x4029d4:0x1ad,_0x2b4bbe:0x196,_0x1cdd65:0x196,_0x46e94b:0x1c4,_0x1bbf29:0x1b1,_0x2cfa74:0x1d1,_0x51ec89:0x196,_0x45ead1:0x1de,_0x4daa35:0x196,_0x3e6d53:0x1ac,_0xc5c557:0x196,_0x29b535:0x1be,_0x488b53:0x1dd,_0x218b5d:0x17e,_0x188d7b:0x1a0,_0x4de779:0x1a8,_0x4b2b22:0x18b,_0x243bc0:0x1ae,_0x519ddd:0x1d0,_0x4e4bc4:0x1db,_0x4201c5:0x186,_0x48c030:0x1a4,_0x40dc8c:0x194,_0x2f680e:0x1c9,_0x4a0742:0x181,_0x55cf92:0x19d},_0x3f8495=new Set(),_0x16f72e=[];return _0x3741c5['forEach']((_0x4cb377,_0x2a2991)=>{const _0x6c7e9d=_0x4700;if(!_0x4cb377||_0x4cb377['broken']===!![])return;const _0x4c02b5=optString(_0x4cb377,"url")||optString(_0x4cb377,'file')||optString(_0x4cb377,'src')||optString(_0x4cb377,"link");if(!_0x4c02b5)return;const _0x20f24a=resolveMediaUrl(_0x4c02b5);if(!_0x20f24a||_0x3f8495['has'](_0x20f24a))return;_0x3f8495["add"](_0x20f24a);let _0x3c29dd=qualityFromUrl(_0x20f24a);const _0x527f8d=optString(_0x4cb377,'quality')||'';if(_0x3c29dd==='Unknown'){const _0xbc93f9=_0x527f8d['match'](/(2160|1440|1080|720|576|540|480|360)p?/i);if(_0xbc93f9){const _0x5ecfd5=parseInt(_0xbc93f9[0x1],0xa);_0x3c29dd=_0x5ecfd5>=0x870?"2160p":_0x5ecfd5>=0x5a0?"1440p":_0x5ecfd5>=0x438?"1080p":_0x5ecfd5>=0x2d0?"720p":_0x5ecfd5>=0x240?"576p":_0x5ecfd5>=0x1e0?"480p":_0x5ecfd5>=0x168?'360p':'Unknown';}}const _0xe1d117=_0x3c29dd!=='Unknown'?_0x3c29dd["toLowerCase"]():"1080p",_0x11a27e=(optString(_0x4cb377,"language")||'en')["toLowerCase"]();let _0x4d122a="English",_0x1adc98='🌍';if(_0x11a27e["includes"]("hin")||_0x527f8d["toLowerCase"]()["includes"]('hindi'))_0x4d122a='Hindi',_0x1adc98='🇮🇳';else{if(_0x11a27e["includes"]("ben")||_0x11a27e['includes']('bangla'))_0x4d122a="Bangla",_0x1adc98='🇧🇩';else(_0x11a27e['includes']("eng")||_0x11a27e==='en')&&(_0x4d122a='English',_0x1adc98="🇺🇸");}const _0x2cf04f=(_0x20f24a+'\x20'+_0x527f8d+'\x20'+(_0x4cb377['group_source']||'')+'\x20'+(_0x4cb377["source_display"]||''))['toLowerCase']();let _0xcd7423='x264';if(_0x2cf04f["includes"]("x265")||_0x2cf04f["includes"]("h265"))_0xcd7423='x265';else{if(_0x2cf04f["includes"]("hevc"))_0xcd7423='HEVC';}let _0x51d353='WEB-DL';if(_0x2cf04f["includes"]('webrip')||_0x2cf04f["includes"]("web-rip"))_0x51d353="WEB-Rip";else{if(_0x2cf04f["includes"]("bluray")||_0x2cf04f["includes"]('blu-ray')||_0x2cf04f['includes']("brrip"))_0x51d353="BluRay";else{if(_0x2cf04f['includes']("hdrip"))_0x51d353="HDRip";}}let _0x256fe5="MKV";if(_0x20f24a["includes"]('.mp4'))_0x256fe5="MP4";else{if(_0x20f24a['includes'](".m3u8"))_0x256fe5="M3U8";}const _0x539dc2=optInt(_0x4cb377,"size_bytes")?formatBytes(optInt(_0x4cb377,"size_bytes")):'Unknown';let _0x1f5abd='5.1\x20Surround',_0x4844c6=optString(_0x4cb377,"group_source")||optString(_0x4cb377,'source_display')||"Server "+(_0x2a2991+0x1);const _0x2e878f=cleanSourceName(_0x4844c6),_0x11a46d='CTGMovies\x20|\x20'+_0xe1d117+'\x20|\x20'+_0x4d122a,_0x5d5662="🍿 "+_0x14285e["title"]+" - ("+(_0x14285e['year']||"2026")+')',_0x4921ef='⭐\x20'+_0xe1d117+'\x20|\x20'+_0x1adc98+'\x20'+_0x4d122a+" | 💾 "+_0x539dc2,_0x37bdce='🔖\x20'+_0x256fe5+" | 🎥 "+_0xcd7423+" | 🎧 "+_0x1f5abd,_0x5e6e94='⛓️‍💥\x20'+_0x2e878f+'\x20|\x20☁️\x20'+_0x51d353,_0x15d868=_0x5d5662+'\x0a'+_0x4921ef+'\x0a'+_0x37bdce+'\x0a'+_0x5e6e94,_0x19832e=[],_0x34b375=['subtitle_tracks',"subtitles","captions","tracks"];for(const _0x3e0e8a of _0x34b375){const _0x58ad43=_0x4cb377[_0x3e0e8a];if(Array["isArray"](_0x58ad43))for(const _0x16028e of _0x58ad43){const _0x352dc2=optString(_0x16028e,'url')||optString(_0x16028e,"file")||optString(_0x16028e,'src');if(!_0x352dc2)continue;const _0x39da28=resolveSubtitleUrl(_0x352dc2);if(!_0x39da28||_0x19832e["some"](_0x2b93be=>_0x2b93be['url']===_0x39da28))continue;const _0x523e07=optString(_0x16028e,"label")||optString(_0x16028e,"language")||subtitleLabelFromUrl(_0x39da28);_0x19832e["push"]({'url':_0x39da28,'lang':_0x523e07});}}_0x16f72e["push"]({'name':_0x11a46d,'title':_0x15d868,'size':_0x15d868,'description':_0x15d868,'url':_0x20f24a,'quality':'','language':'','provider':'CTGMovies','headers':STREAM_HEADERS,'subtitles':_0x19832e["length"]?_0x19832e:void 0x0});}),_0x16f72e;}function getMovieStreams(_0x1a749b,_0x478076){const _0x2da345={_0x2a915a:0x1b0},_0x2e7470=_0x52e89e;return getDetail(_0x1a749b)["then"](_0x22eaf3=>{const _0x5957aa=_0x2e7470;if(!_0x22eaf3||!_0x22eaf3['links'])return[];return buildStreams(_0x22eaf3["links"],_0x478076);})["catch"](()=>[]);}/*string-table removed*/function getEpisodeStreams(_0x5eddb8,_0x524e5b,_0x498f51,_0x9c9dbe){const _0xe55f7c={_0x6720db:0x180,_0x13ae54:0x189,_0x518a95:0x1c3};return getDetail(_0x5eddb8)['then'](_0x198edb=>{const _0x791408=_0x4700;if(!_0x198edb||!_0x198edb["episodes"])return[];const _0x1587fa=[];for(const _0x3c6ae0 of _0x198edb['episodes']){const _0x55a6bc=optInt(_0x3c6ae0,"episode_number")||optInt(_0x3c6ae0,"absolute_number"),_0x4398e7=optInt(_0x3c6ae0,"season_number")||0x1;if(_0x4398e7!==_0x498f51||_0x55a6bc!==_0x9c9dbe)continue;const _0x3fc9a9=_0x3c6ae0["links"]||[];for(const _0x4fc8b7 of _0x3fc9a9){if(_0x4fc8b7&&_0x4fc8b7["broken"]!==!![])_0x1587fa["push"](_0x4fc8b7);}}return buildStreams(_0x1587fa,_0x524e5b);})['catch'](()=>[]);}function scrape(_0x22beb2){const _0x4e5299={_0x169c23:0x190,_0x4ead37:0x1f0,_0x9c6046:0x1ab},_0x31f166={_0x5f1d2e:0x19b},_0x531991=_0x52e89e,_0x245aaf=_0x22beb2&&_0x22beb2["title"],_0x1a28c7=_0x22beb2&&_0x22beb2['type']||"movie",_0xb11ab8=_0x22beb2&&_0x22beb2['season'],_0x3dddfc=_0x22beb2&&_0x22beb2["episode"],_0x45d0bf=_0x22beb2&&_0x22beb2['year'];if(!_0x245aaf)return Promise['resolve']([]);const _0x533c06={'title':_0x245aaf,'year':_0x45d0bf||null,'imdbId':_0x22beb2&&_0x22beb2['imdbId']||null};return searchCtg(_0x245aaf)["then"](_0x571c46=>{const _0x2b2162=_0x531991;if(!_0x571c46["length"])return[];const _0x4a5a05=findBestMatch(_0x533c06,_0x571c46,_0x1a28c7);if(!_0x4a5a05)return[];if(_0x1a28c7==='tv'&&_0xb11ab8&&_0x3dddfc)return _0x533c06['title']=_0x533c06['title']+'\x20S'+String(_0xb11ab8)["padStart"](0x2,'0')+'E'+String(_0x3dddfc)['padStart'](0x2,'0'),getEpisodeStreams(_0x4a5a05,_0x533c06,_0xb11ab8,_0x3dddfc);return getMovieStreams(_0x4a5a05,_0x533c06);})['catch'](()=>[]);}function getStreams(_0x129610,_0x4320ec="movie",_0x5c7bd6=null,_0x1c7287=null){const _0xae5107=_0x52e89e;return getTMDBDetails(_0x129610,_0x4320ec)["then"](_0x150dbc=>{const _0x1621e5=_0xae5107;if(!_0x150dbc||!_0x150dbc['title'])return[];return scrape({'title':_0x150dbc['title'],'year':_0x150dbc["year"],'type':_0x4320ec,'season':_0x5c7bd6,'episode':_0x1c7287,'imdbId':_0x150dbc["imdbId"]});})["catch"](()=>[]);}typeof module!=='undefined'&&module['exports']&&(module["exports"]={'getStreams':getStreams,'scrape':scrape});

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
  var PROVIDER = "ctgmovies";
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
