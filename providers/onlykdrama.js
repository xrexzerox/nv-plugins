/*
 * nv-plugins onlykdrama.js — FULLY DECODED port of the All-in-One-Nuvio provider (4.24.0 merge pass).
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
var _0x147b=function(){return "";};'use strict';var _0xbb3974=_0x147b;/*rotation removed*/;var PROVIDER_NAME='OnlyKDrama',SITE_URL="https://onlykdrama.shop",TMDB_URL="https://www.themoviedb.org",FILEPRESS_ORIGIN="https://new5.filepress.wiki",DEFAULT_HEADERS={'User-Agent':"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36",'Accept-Language':"en-US,en;q=0.9"},STOP_WORDS={'a':!![],'an':!![],'and':!![],'at':!![],'by':!![],'for':!![],'from':!![],'in':!![],'of':!![],'on':!![],'the':!![],'to':!![],'tv':!![]};function mergeHeaders(_0x27457d,_0x45029c){var _0x1d9f84=_0xbb3974,_0x1b0d01={},_0x5cd293;for(_0x5cd293 in _0x27457d){Object["prototype"]["hasOwnProperty"]["call"](_0x27457d,_0x5cd293)&&(_0x1b0d01[_0x5cd293]=_0x27457d[_0x5cd293]);}if(!_0x45029c)return _0x1b0d01;for(_0x5cd293 in _0x45029c){Object["prototype"]["hasOwnProperty"]["call"](_0x45029c,_0x5cd293)&&(_0x1b0d01[_0x5cd293]=_0x45029c[_0x5cd293]);}return _0x1b0d01;}function fetchText(_0x4ff150,_0x1a3cef){var _0xfa9d46=_0xbb3974,_0x4a2aeb=_0x1a3cef||{};return _0x4a2aeb["headers"]=mergeHeaders(DEFAULT_HEADERS,_0x4a2aeb["headers"]||{}),__nvFetch(_0x4ff150,_0x4a2aeb)["then"](function(_0x4acd18){var _0x23a477=_0xfa9d46;if(!_0x4acd18['ok'])throw new Error("HTTP "+_0x4acd18['status']+" for "+_0x4ff150);return _0x4acd18["text"]();});}function fetchJson(_0x4a0b42,_0x5ebb7d){var _0x466425=_0xbb3974,_0x3c6c6b=_0x5ebb7d||{};return _0x3c6c6b["headers"]=mergeHeaders(DEFAULT_HEADERS,_0x3c6c6b["headers"]||{}),__nvFetch(_0x4a0b42,_0x3c6c6b)["then"](function(_0x520aea){var _0x60bce=_0x466425;if(!_0x520aea['ok'])throw new Error('HTTP\x20'+_0x520aea["status"]+" for "+_0x4a0b42);return _0x520aea["json"]();});}function decodeHtml(_0x32ce18){var _0x152e22=_0xbb3974;if(!_0x32ce18)return'';return _0x32ce18['replace'](/&#(\d+);/g,function(_0x3af2a5,_0x149eb4){var _0x45fda9=_0x147b;return String["fromCharCode"](parseInt(_0x149eb4,0xa));})["replace"](/&amp;/g,'&')["replace"](/&quot;/g,'\x22')["replace"](/&#39;/g,'\x27')["replace"](/&apos;/g,'\x27')["replace"](/&lt;/g,'<')["replace"](/&gt;/g,'>');}function safeDecode(_0x17c60a){if(!_0x17c60a)return'';try{return decodeURIComponent(_0x17c60a);}catch(_0x669afc){return _0x17c60a;}}function safeEncodeUrl(_0x4cd907){var _0x3d06f0=_0xbb3974;if(!_0x4cd907)return'';return String(_0x4cd907)['replace'](/ /g,"%20")["replace"](/\[/g,'%5B')["replace"](/\]/g,"%5D");}function stripTags(_0x14cc94){var _0x47af41=_0xbb3974;return decodeHtml((_0x14cc94||'')['replace'](/<[^>]+>/g,'\x20')["replace"](/\s+/g,'\x20')["trim"]());}function normalizeText(_0x47cf1e){var _0x14b1b4=_0xbb3974;return decodeHtml(_0x47cf1e||'')["toLowerCase"]()['replace'](/&#8212;/g,'\x20')["replace"](/[\u2019'`]/g,'')["replace"](/[^a-z0-9]+/g,'\x20')["replace"](/\s+/g,'\x20')['trim']();}function uniqueTokens(_0x8dd3e2){var _0x28d60a=_0xbb3974,_0x549cc9=normalizeText(_0x8dd3e2)['split']('\x20'),_0x5265fe={},_0x4d5bc7=[],_0x3f2348,_0x2861f0;for(_0x3f2348=0x0;_0x3f2348<_0x549cc9["length"];_0x3f2348+=0x1){_0x2861f0=_0x549cc9[_0x3f2348];if(!_0x2861f0||_0x2861f0["length"]<0x2||STOP_WORDS[_0x2861f0]||_0x5265fe[_0x2861f0])continue;_0x5265fe[_0x2861f0]=!![],_0x4d5bc7["push"](_0x2861f0);}return _0x4d5bc7;}function escapeRegex(_0x37705e){var _0xcf1e04=_0xbb3974;return String(_0x37705e||'')["replace"](/[.*+?^${}()|[\]\\]/g,'\x5c$&');}function extractQuality(_0x5da079){var _0x37ba1d=_0xbb3974,_0x4b24d4=String(_0x5da079||'')["match"](/\b(2160p|1440p|1080p|720p|540p|480p|360p)\b/i);return _0x4b24d4?_0x4b24d4[0x1]["toUpperCase"]():'HD';}function getFirstMatch(_0x40ace4,_0x3800d8){var _0x371944=_0xbb3974,_0x22d078,_0x334c0b;for(_0x22d078=0x0;_0x22d078<_0x3800d8["length"];_0x22d078+=0x1){_0x334c0b=_0x40ace4["match"](_0x3800d8[_0x22d078]);if(_0x334c0b&&_0x334c0b[0x1])return stripTags(_0x334c0b[0x1]);}return'';}function getTmdbInfo(_0x599b,_0x58c67f){var _0x144841=_0xbb3974,_0x534344=_0x58c67f==='movie'?"movie":'tv',_0x43bfbf=TMDB_URL+'/'+_0x534344+'/'+encodeURIComponent(String(_0x599b))+'?language=en-US';return fetchText(_0x43bfbf)["then"](function(_0x478406){var _0x2b2592=_0x144841,_0x595b88=getFirstMatch(_0x478406,[/<meta property="og:title" content="([^"]+)"/i,/<title>([\s\S]*?)<\/title>/i,/"name":"([^"]+)"/i]),_0x1cb8bd=_0x478406["match"](/<title>[\s\S]*?\b((?:19|20)\d{2})\b[\s\S]*?<\/title>/i)||_0x478406["match"](/\b((?:19|20)\d{2})\b/);return{'title':_0x595b88["replace"](/\s+\(TV Series.*$/i,'')["replace"](/\s+\(\d{4}\).*$/i,'')["trim"](),'year':_0x1cb8bd?_0x1cb8bd[0x1]:''};});}function buildSearchQueries(_0x2256fe,_0x37fed6){var _0x54b7ac=_0xbb3974,_0x4d3b43=[],_0xd6d3e9=decodeHtml(_0x2256fe||'')["replace"](/[:\-]/g,'\x20')["replace"](/\s+/g,'\x20')['trim'](),_0x3a71b6={};function _0x3d1b79(_0x13f1e3){var _0x5080a3=_0x54b7ac,_0x4fca43=normalizeText(_0x13f1e3);if(!_0x4fca43||_0x3a71b6[_0x4fca43])return;_0x3a71b6[_0x4fca43]=!![],_0x4d3b43["push"](_0x13f1e3);}return _0x3d1b79(_0x2256fe),_0x3d1b79(_0xd6d3e9),_0x37fed6&&(_0x3d1b79(_0x2256fe+'\x20'+_0x37fed6),_0x3d1b79(_0xd6d3e9+'\x20'+_0x37fed6)),_0x4d3b43;}/*string-table removed*/function extractCandidateUrls(_0x194a70,_0x5b5dd4){var _0x1d75b2=_0xbb3974,_0x3b83b2=_0x5b5dd4==="movie"?"/movies/":"/drama/",_0x5da032=/href=["'](https?:\/\/onlykdrama\.shop\/[^"'#?]+)["']/gi,_0x7e1139=[],_0xb890b0={},_0x13229f;while(_0x13229f=_0x5da032['exec'](_0x194a70)){if(_0x13229f[0x1]["indexOf"](_0x3b83b2)===-0x1||_0xb890b0[_0x13229f[0x1]])continue;_0xb890b0[_0x13229f[0x1]]=!![],_0x7e1139["push"](_0x13229f[0x1]);}return _0x7e1139;}function scoreCandidateUrl(_0x15a2d4,_0x13f8f3,_0x18d18a,_0x22eb4c){var _0x179eaf=_0xbb3974,_0x44d01f=_0x22eb4c==="movie"?_0x15a2d4["indexOf"]("/movies/")!==-0x1?0xa:0x0:_0x15a2d4["indexOf"]('/drama/')!==-0x1?0xa:0x0,_0x2be248=uniqueTokens(_0x13f8f3),_0x30f5d6=normalizeText(_0x15a2d4),_0x344096;for(_0x344096=0x0;_0x344096<_0x2be248["length"];_0x344096+=0x1){_0x30f5d6['indexOf'](_0x2be248[_0x344096])!==-0x1&&(_0x44d01f+=0xc);}return _0x18d18a&&_0x30f5d6['indexOf'](String(_0x18d18a))!==-0x1&&(_0x44d01f+=0xf),_0x44d01f;}function collectCandidatePages(_0x1175ab,_0x5a1c83,_0x5854e8,_0x29c8b8,_0x84dcae){var _0x45aacd=_0xbb3974;if(_0x29c8b8>=_0x1175ab['length'])return Promise["resolve"](rankCandidatePages(_0x84dcae,_0x5854e8,_0x5a1c83));return fetchText(SITE_URL+"/?s="+encodeURIComponent(_0x1175ab[_0x29c8b8]))["then"](function(_0x51a767){var _0x524b3a=_0x45aacd;return collectCandidatePages(_0x1175ab,_0x5a1c83,_0x5854e8,_0x29c8b8+0x1,_0x84dcae["concat"](extractCandidateUrls(_0x51a767,_0x5a1c83)));})["catch"](function(){return collectCandidatePages(_0x1175ab,_0x5a1c83,_0x5854e8,_0x29c8b8+0x1,_0x84dcae);});}function rankCandidatePages(_0x41cb39,_0x100bc1,_0x53999a){var _0x5b290d=_0xbb3974,_0x416d16={},_0x5a7761=[],_0x182110;for(_0x182110=0x0;_0x182110<_0x41cb39["length"];_0x182110+=0x1){if(_0x416d16[_0x41cb39[_0x182110]])continue;_0x416d16[_0x41cb39[_0x182110]]=!![],_0x5a7761["push"]({'url':_0x41cb39[_0x182110],'score':scoreCandidateUrl(_0x41cb39[_0x182110],_0x100bc1["title"],_0x100bc1["year"],_0x53999a),'index':_0x182110});}return _0x5a7761["sort"](function(_0x2b4053,_0x216d28){var _0x33f92b=_0x5b290d;if(_0x216d28['score']!==_0x2b4053["score"])return _0x216d28["score"]-_0x2b4053['score'];return _0x2b4053["index"]-_0x216d28["index"];}),_0x5a7761["slice"](0x0,0x8)["map"](function(_0xabef99){var _0x56445c=_0x5b290d;return _0xabef99["url"];});}function getOnlyKDramaTitle(_0x1cf9e4){return getFirstMatch(_0x1cf9e4,[/<div class="data">\s*<h1>([\s\S]*?)<\/h1>/i,/<h1[^>]*>([\s\S]*?)<\/h1>/i,/<meta property="og:title" content="([^"]+)"/i]);}function titleLooksRelevant(_0x4f9d3f,_0x4d93f3,_0xab0497){var _0xec54b4=_0xbb3974,_0xe52cd6=uniqueTokens(_0x4f9d3f),_0x353454=uniqueTokens(_0x4d93f3),_0x357022=0x0,_0xe1d081,_0x22757e={},_0x4ea942=String(_0x4f9d3f||'')["match"](/\b((?:19|20)\d{2})\b/),_0xb730ee=_0x4ea942?_0x4ea942[0x1]:'';for(_0xe1d081=0x0;_0xe1d081<_0xe52cd6['length'];_0xe1d081+=0x1){_0x22757e[_0xe52cd6[_0xe1d081]]=!![];}for(_0xe1d081=0x0;_0xe1d081<_0x353454["length"];_0xe1d081+=0x1){_0x22757e[_0x353454[_0xe1d081]]&&(_0x357022+=0x1);}if(_0xab0497&&_0xb730ee&&_0xb730ee!==String(_0xab0497))return![];if(_0x353454["length"]<=0x2)return _0x357022>=0x1;return _0x357022>=0x2;}function extractAttr(_0x167f63,_0x2de330){var _0x426db1=_0xbb3974,_0x284835=_0x167f63["match"](new RegExp(_0x2de330+'=[\x27\x22]([^\x27\x22]+)[\x27\x22]','i'));return _0x284835?_0x284835[0x1]:'';}function extractMovieOptions(_0x27d2d2){var _0x40f31e=_0xbb3974,_0x4cd156=/<li[^>]*class=['"][^'"]*dooplay_player_option[^'"]*['"][^>]*>[\s\S]*?<\/li>/gi,_0x3d6c27=[],_0xbae690;while(_0xbae690=_0x4cd156['exec'](_0x27d2d2)){_0x3d6c27["push"]({'label':stripTags(_0xbae690[0x0]),'post':extractAttr(_0xbae690[0x0],"data-post"),'type':extractAttr(_0xbae690[0x0],'data-type'),'nume':extractAttr(_0xbae690[0x0],"data-nume")});}return _0x3d6c27;}function extractDirectMovieUrl(_0xd3a475){var _0xe71d98=_0xbb3974;if(!_0xd3a475)return'';try{var _0x496a07=new URL(_0xd3a475),_0xc25403=_0x496a07["searchParams"]['get']("source");if(_0xc25403)return _0xc25403;}catch(_0x200c87){return _0xd3a475;}return _0xd3a475;}function buildStream(_0x5e1cc7,_0x58dc97,_0x2a09fe){return{'name':PROVIDER_NAME,'title':_0x5e1cc7,'url':safeEncodeUrl(_0x58dc97),'quality':_0x2a09fe||'HD'};}function resolveMoviePage(_0x35816b,_0x23fec6){var _0xb91a6e=_0xbb3974,_0x37f3f5=extractMovieOptions(_0x23fec6),_0x41199b=null,_0x158cf4;for(_0x158cf4=0x0;_0x158cf4<_0x37f3f5['length'];_0x158cf4+=0x1){if(/fast stream/i["test"](_0x37f3f5[_0x158cf4]["label"])&&_0x37f3f5[_0x158cf4]['post']&&_0x37f3f5[_0x158cf4]["nume"]){_0x41199b=_0x37f3f5[_0x158cf4];break;}}if(!_0x41199b)return Promise["resolve"]([]);return fetchJson(SITE_URL+"/wp-admin/admin-ajax.php",{'method':"POST",'headers':{'Content-Type':"application/x-www-form-urlencoded; charset=UTF-8",'X-Requested-With':"XMLHttpRequest",'Referer':_0x35816b},'body':new URLSearchParams({'action':"doo_player_ajax",'post':_0x41199b['post'],'nume':_0x41199b["nume"],'type':_0x41199b["type"]||'movie'})["toString"]()})["then"](function(_0x435f10){var _0x100262=_0xb91a6e,_0x22f75c=extractDirectMovieUrl(_0x435f10&&_0x435f10["embed_url"]);if(!_0x22f75c)return[];return[buildStream('Fast\x20Stream',_0x22f75c,extractQuality(safeDecode(_0x22f75c)))];});}function extractEpisodeAnchors(_0x3eaf3d){var _0x5b7d19=_0xbb3974,_0x14d802=/<a[^>]+href=["'](https:\/\/new5\.filepress\.wiki\/file\/([A-Za-z0-9]+))["'][^>]*>([\s\S]*?)<\/a>/gi,_0x1ae13a=[],_0x47fcaa={},_0x293ce0;while(_0x293ce0=_0x14d802["exec"](_0x3eaf3d)){if(_0x47fcaa[_0x293ce0[0x2]])continue;_0x47fcaa[_0x293ce0[0x2]]=!![],_0x1ae13a['push']({'url':_0x293ce0[0x1],'fileId':_0x293ce0[0x2],'text':stripTags(_0x293ce0[0x3])});}return _0x1ae13a;}function episodeMatches(_0x1a8a51,_0x13cf5d,_0x357635,_0x33f7c3){var _0x2002d5=_0xbb3974,_0x588edb=escapeRegex(String(_0x357635)),_0x5cbaca=new RegExp("(?:^|[^A-Z0-9])S0*"+escapeRegex(String(_0x13cf5d))+"E0*"+_0x588edb+"(?:[^A-Z0-9]|$)",'i'),_0x377d02=new RegExp('(?:^|[^A-Z0-9])E0*'+_0x588edb+"(?:[^A-Z0-9]|$)",'i'),_0x4d50c8=new RegExp("Episode\\s*0*"+_0x588edb+'(?:[^0-9]|$)','i');if(_0x5cbaca["test"](_0x1a8a51))return!![];if(_0x33f7c3)return![];if(_0x13cf5d>0x1)return![];return _0x377d02["test"](_0x1a8a51)||_0x4d50c8["test"](_0x1a8a51);}function pickEpisodeAnchor(_0x32a402,_0x524870,_0x434c96){var _0x580374=_0xbb3974,_0x478f23=_0x32a402['some'](function(_0x5b1295){var _0x16bf18=_0x147b;return/S\d{1,2}E\d{1,2}/i["test"](_0x5b1295["text"]);}),_0x31017f;for(_0x31017f=0x0;_0x31017f<_0x32a402["length"];_0x31017f+=0x1){if(episodeMatches(_0x32a402[_0x31017f]["text"],_0x524870,_0x434c96,_0x478f23))return _0x32a402[_0x31017f];}return null;}/*decoder removed*/function filePressHeaders(_0x328989){var _0x3fc5f3=_0xbb3974;return{'Accept':'application/json,\x20text/plain,\x20*/*','Content-Type':'application/json','Origin':FILEPRESS_ORIGIN,'Referer':FILEPRESS_ORIGIN+"/file/"+_0x328989,'Sec-Fetch-Dest':'empty','Sec-Fetch-Mode':"cors",'Sec-Fetch-Site':"same-origin"};}function extractFilePressUrl(_0x3a7e0c,_0x3d8e6d){var _0xb65030=_0xbb3974;if(_0x3d8e6d==="indexDownlaod"||_0x3d8e6d==="cloudDownlaod"||_0x3d8e6d==="cloudR2Downlaod")return Array["isArray"](_0x3a7e0c)&&_0x3a7e0c[0x0]?_0x3a7e0c[0x0]:'';if(_0x3d8e6d==="publicDownlaod"||_0x3d8e6d==="publicUserDownlaod")return _0x3a7e0c?"https://drive.google.com/uc?id="+_0x3a7e0c:'';return'';}function resolveFilePressWithMethod(_0x4418bf,_0x2d5930,_0x128346){var _0x5a1882=_0xbb3974;if(_0x128346>=_0x2d5930["length"])return Promise["resolve"]('');var _0x6630f4=_0x2d5930[_0x128346],_0x4ed149=filePressHeaders(_0x4418bf);return fetchJson(FILEPRESS_ORIGIN+"/api/file/downlaod/",{'method':"POST",'headers':_0x4ed149,'body':JSON['stringify']({'id':_0x4418bf,'method':_0x6630f4,'captchaValue':''})})["then"](function(_0x8d1889){var _0x29c9ae=_0x5a1882;if(!_0x8d1889||!_0x8d1889["status"]||!_0x8d1889["data"])return resolveFilePressWithMethod(_0x4418bf,_0x2d5930,_0x128346+0x1);return fetchJson(FILEPRESS_ORIGIN+"/api/file/downlaod2/",{'method':'POST','headers':_0x4ed149,'body':JSON["stringify"]({'id':_0x8d1889["data"],'method':_0x6630f4,'captchaValue':''})})['then'](function(_0xbd3e2a){var _0x4f624c=_0x29c9ae,_0x2a84f7=_0xbd3e2a&&_0xbd3e2a["status"]?extractFilePressUrl(_0xbd3e2a['data'],_0x6630f4):'';if(_0x2a84f7)return _0x2a84f7;return resolveFilePressWithMethod(_0x4418bf,_0x2d5930,_0x128346+0x1);});})["catch"](function(){return resolveFilePressWithMethod(_0x4418bf,_0x2d5930,_0x128346+0x1);});}function resolveEpisodePage(_0x586747,_0x280dbd,_0x6ffd4a){var _0xcb91ec=_0xbb3974,_0x4c04c5=pickEpisodeAnchor(extractEpisodeAnchors(_0x586747),_0x280dbd,_0x6ffd4a);if(!_0x4c04c5)return Promise["resolve"]([]);return resolveFilePressWithMethod(_0x4c04c5['fileId'],["indexDownlaod","publicDownlaod","publicUserDownlaod"],0x0)["then"](function(_0x2d4378){var _0x17d0fb=_0xcb91ec;if(!_0x2d4378)return[];return[buildStream(_0x4c04c5['text']||'Episode\x20'+_0x6ffd4a,_0x2d4378,extractQuality(_0x4c04c5["text"]))];});}function tryCandidatePages(_0x46ac1a,_0x32887c,_0xc1fa27,_0x5312cb,_0x506609,_0x119d18){var _0x1a53ab=_0xbb3974;if(_0x32887c>=_0x46ac1a["length"])return Promise["resolve"]([]);return fetchText(_0x46ac1a[_0x32887c])["then"](function(_0x3c375d){var _0x156f0a=_0x1a53ab,_0x2fb4ca=getOnlyKDramaTitle(_0x3c375d);if(!titleLooksRelevant(_0x2fb4ca,_0x5312cb["title"],_0x5312cb["year"]))return tryCandidatePages(_0x46ac1a,_0x32887c+0x1,_0xc1fa27,_0x5312cb,_0x506609,_0x119d18);return(_0xc1fa27==="movie"?resolveMoviePage(_0x46ac1a[_0x32887c],_0x3c375d):resolveEpisodePage(_0x3c375d,_0x506609,_0x119d18))['then'](function(_0x492942){var _0x4ade33=_0x156f0a;if(_0x492942&&_0x492942["length"])return _0x492942;return tryCandidatePages(_0x46ac1a,_0x32887c+0x1,_0xc1fa27,_0x5312cb,_0x506609,_0x119d18);})['catch'](function(){return tryCandidatePages(_0x46ac1a,_0x32887c+0x1,_0xc1fa27,_0x5312cb,_0x506609,_0x119d18);});})['catch'](function(){return tryCandidatePages(_0x46ac1a,_0x32887c+0x1,_0xc1fa27,_0x5312cb,_0x506609,_0x119d18);});}function getStreams(_0x164a51,_0x361684,_0x4384f9,_0x40d098){var _0x1d01f9=_0xbb3974,_0x362d08=_0x361684==="movie"?"movie":'tv',_0x83e84d=Number(_0x4384f9)||0x1,_0x3123bb=Number(_0x40d098)||0x1;return getTmdbInfo(_0x164a51,_0x362d08)["then"](function(_0x5b1747){var _0x1354cb=_0x1d01f9;if(!_0x5b1747||!_0x5b1747['title'])return[];return collectCandidatePages(buildSearchQueries(_0x5b1747["title"],_0x5b1747["year"]),_0x362d08,_0x5b1747,0x0,[])["then"](function(_0x30862c){return tryCandidatePages(_0x30862c,0x0,_0x362d08,_0x5b1747,_0x83e84d,_0x3123bb);});})["catch"](function(_0x56cd9a){var _0x452f58=_0x1d01f9;return console["log"]('['+PROVIDER_NAME+']\x20'+_0x56cd9a["message"]),[];});}module['exports']={'getStreams':getStreams};

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
  var PROVIDER = "onlykdrama";
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
