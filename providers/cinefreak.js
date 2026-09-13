/*
 * nv-plugins cinefreak.js — FULLY DECODED port of the All-in-One-Nuvio provider (4.24.0 merge pass).
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
var _0x38d9=function(){return "";};var _0x2a015c=_0x38d9;/*rotation removed*/;var __async=(_0x3be549,_0x467335,_0x19a99c)=>{var _0xac46c5={_0x48de3a:0xa7};return new Promise((_0x243f70,_0x1dbd51)=>{var _0x2f2c9a={_0x36bc72:0x9b},_0x284017=_0x38d9,_0xb7e89b=_0x4349f5=>{var _0x292293=_0x38d9;try{_0x28e579(_0x19a99c["next"](_0x4349f5));}catch(_0x3f34e9){_0x1dbd51(_0x3f34e9);}},_0x2ad1d7=_0x1cada2=>{var _0x48f6df=_0x38d9;try{_0x28e579(_0x19a99c["throw"](_0x1cada2));}catch(_0x114164){_0x1dbd51(_0x114164);}},_0x28e579=_0xaa676e=>_0xaa676e['done']?_0x243f70(_0xaa676e["value"]):Promise["resolve"](_0xaa676e["value"])["then"](_0xb7e89b,_0x2ad1d7);_0x28e579((_0x19a99c=_0x19a99c["apply"](_0x3be549,_0x467335))["next"]());});},PROVIDER_NAME='CineFreak',BASE_URL="https://cinefreak.nl",CINECLOUD_BASE="https://new5.cinecloud.site",TMDB_API_KEY="439c478a771f35c05022f9feabcca01c",MOBILE_UAS=['Mozilla/5.0\x20(Linux;\x20Android\x2014;\x20Pixel\x208\x20Pro)\x20AppleWebKit/537.36\x20(KHTML,\x20like\x20Gecko)\x20Chrome/124.0.0.0\x20Mobile\x20Safari/537.36','Mozilla/5.0\x20(Linux;\x20Android\x2013;\x20SM-S918B)\x20AppleWebKit/537.36\x20(KHTML,\x20like\x20Gecko)\x20Chrome/116.0.0.0\x20Mobile\x20Safari/537.36',"Mozilla/5.0 (Linux; Android 12; Pixel 6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Mobile Safari/537.36","Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"];function getHeaders(_0x2dd0c7){return{'User-Agent':_0x2dd0c7,'Accept':'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8','Accept-Language':'en-US,en;q=0.5'};}/*decoder removed*/function fetchText(_0x52bf0e,_0x407ee1){return __async(this,null,function*(){try{var _0x415047={'headers':getHeaders(_0x407ee1||MOBILE_UAS[0x0])};const _0x56ea88=new Promise(function(_0x59a8a5,_0x125a17){setTimeout(function(){_0x125a17(new Error('timeout'));},0xfa0);}),_0x27b025=yield Promise['race']([__nvFetch(_0x52bf0e,_0x415047),_0x56ea88]);if(!_0x27b025['ok'])return null;return yield _0x27b025['text']();}catch(_0x68dacb){return null;}});}function fetchJson(_0x4952dc,_0x3dc4a1){var _0x3eb1ae={_0x196f46:0xec};return __async(this,null,function*(){var _0x511286=_0x38d9;try{var _0x5ae51e=yield fetchText(_0x4952dc,_0x3dc4a1);if(!_0x5ae51e)return null;return JSON["parse"](_0x5ae51e);}catch(_0x1f8085){return null;}});}function parseQuality(_0x35f962){var _0x3fb9fb={_0x16617c:0xed,_0xdd928e:0xbd},_0x52baf9=_0x2a015c,_0xda4ff3=String(_0x35f962||'')["toLowerCase"]();if(_0xda4ff3['indexOf']('2160')>=0x0||_0xda4ff3["indexOf"]('4k')>=0x0)return "2160p";if(_0xda4ff3["indexOf"]("1080")>=0x0)return'1080p';if(_0xda4ff3['indexOf']('720')>=0x0)return'720p';if(_0xda4ff3['indexOf']('480')>=0x0)return'480p';return'HD';}function extractFslUrl(_0x7d5745){var _0x13e9e7={_0x219fca:0xbf,_0x4ea906:0xed,_0x350ac9:0x104},_0x5f1aa0=_0x2a015c,_0x25a6b5=/href="([^"]+)"[^>]*id="fsl"|href="([^"]+(?:\.workers\.dev|\.r2\.dev|\.buzz|\.cloudflarestorage\.com)\/[^"]+)"|href="(https?:\/\/[^"]+\.(?:mkv|mp4)[^"]*)"|href="(https:\/\/pub-[^"]+)"/ig,_0x3ccd36;while((_0x3ccd36=_0x25a6b5['exec'](_0x7d5745))!==null){var _0x58d607=_0x3ccd36[0x1]||_0x3ccd36[0x2]||_0x3ccd36[0x3]||_0x3ccd36[0x4];if(_0x58d607&&!_0x58d607['includes'](".zip"))return _0x58d607["replace"](/&amp;/g,'&');}var _0x5cfdc0="href=\"https://pub-",_0xcbdca5=_0x7d5745["indexOf"](_0x5cfdc0);if(_0xcbdca5===-0x1)return null;var _0x273996=_0xcbdca5+0x6,_0x469335=_0x7d5745['indexOf']('\x22',_0x273996);if(_0x469335===-0x1)return null;var _0x15f79c=_0x7d5745["substring"](_0x273996,_0x469335);return _0x15f79c=_0x15f79c["replace"](/&amp;/g,'&'),_0x15f79c;}function decodeGenerateUrl(_0x488e74){try{var _0x1cd08c=atob(_0x488e74);return _0x1cd08c=_0x1cd08c['replace'](/newgo32$/,''),_0x1cd08c;}catch(_0x184465){return null;}}function encodeUri(_0x3d4840){try{return encodeURIComponent(_0x3d4840);}catch(_0x317ba6){return _0x3d4840;}}function manifest(){var _0x1afdf9={_0x5474d3:0xaa},_0x3ca56c=_0x2a015c;return{'id':"cinefreak",'name':'CineFreak','description':'Direct\x20MKV/MP4\x20streams\x20from\x20cinefreak.nl','version':'1.0.0','logo':'https://cinefreak.nl/wp-content/uploads/2024/08/cropped-cgk-192x192.png','background':"https://cinefreak.nl/wp-content/uploads/2024/08/cropped-cgk-192x192.png",'types':['movie','tv'],'resources':["stream"],'idPrefixes':['tt','tmdb']};}function search(_0x1a4407,_0x348ee3){var _0x348955={_0x406562:0xc0,_0x49c6b9:0x102,_0x517d12:0xa4,_0x33b856:0xba,_0x1255d0:0x100};return __async(this,null,function*(){var _0x2214c5=_0x38d9;if(!_0x1a4407)return[];var _0x1eca08=BASE_URL+"/wp-json/wp/v2/search?search="+encodeUri(_0x1a4407)+"&per_page=10",_0x5f3b1f=yield fetchJson(_0x1eca08);if(!_0x5f3b1f||!_0x5f3b1f["length"])return[];var _0xe06eb8=[];for(var _0x1da82e=0x0;_0x1da82e<_0x5f3b1f['length'];_0x1da82e++){var _0xdb2a01=_0x5f3b1f[_0x1da82e];if(!_0xdb2a01||!_0xdb2a01['title']||!_0xdb2a01["url"])continue;var _0x4708b5=String(_0xdb2a01["title"])['replace'](/Download\s*/gi,'')['trim']();if(!_0x4708b5)continue;_0xe06eb8["push"]({'id':_0xdb2a01["url"],'title':_0x4708b5,'url':_0xdb2a01['url']});}return _0xe06eb8;});}function getTMDBInfo(_0x3d2d43,_0x514873,_0x1c0dda){var _0x269f69={_0x4de4c2:0x104,_0x4aa3b4:0xa2,_0x4d92ab:0x104};return __async(this,null,function*(){var _0x43b767=_0x38d9,_0x104c4e=_0x514873==='tv'||_0x514873==="series",_0x532a1f=_0x104c4e?'https://api.themoviedb.org/3/tv/'+_0x3d2d43+"?api_key="+TMDB_API_KEY:'https://api.themoviedb.org/3/movie/'+_0x3d2d43+'?api_key='+TMDB_API_KEY,_0x514ee8=yield fetchJson(_0x532a1f,_0x1c0dda);if(!_0x514ee8)return null;return{'title':_0x104c4e?_0x514ee8["name"]:_0x514ee8['title'],'year':_0x104c4e?(_0x514ee8["first_air_date"]||'')["substring"](0x0,0x4):(_0x514ee8["release_date"]||'')["substring"](0x0,0x4),'isTv':_0x104c4e};});}function wordMatchScore(_0xbc8050,_0x58d101){var _0x69135c={_0x26143a:0xa1,_0x2184dd:0xa4,_0x4d26ce:0xa4,_0x3702f2:0xbf},_0x22a63f=_0x2a015c,_0x37171c=String(_0xbc8050||'')["toLowerCase"]()["trim"](),_0x3040dd=String(_0x58d101||'')["toLowerCase"](),_0x477e9f=_0x37171c['replace'](/[^a-z0-9\s]/g,'\x20')['split'](/\s+/),_0x52d020=0x0,_0x1f8834=0x0;for(var _0x4834b7=0x0;_0x4834b7<_0x477e9f["length"];_0x4834b7++){var _0x49d6ee=_0x477e9f[_0x4834b7];if(_0x49d6ee["length"]<0x3)continue;_0x1f8834++;var _0x1da5d2=new RegExp('\x5cb'+_0x49d6ee["replace"](/[.*+?^${}()|[\]\\]/g,'\x5c$&')+'\x5cb','i');if(_0x1da5d2["test"](_0x58d101))_0x52d020++;}if(_0x1f8834===0x0)return 0x0;return _0x52d020/_0x1f8834;}function titleStartsWith(_0x5a12f7,_0x31e86f){var _0x107851={_0x3bb8ca:0xa1,_0x4132fe:0xed},_0x5b47a0=_0x2a015c,_0x3d9be2=String(_0x5a12f7||'')["toLowerCase"]()['trim'](),_0x294ecd=String(_0x31e86f||'')['toLowerCase']()['trim']();return _0x3d9be2["indexOf"](_0x294ecd)===0x0||_0x3d9be2["indexOf"](_0x294ecd+'\x20')===0x0||_0x3d9be2['indexOf']('('+_0x294ecd+')')===0x0;}function urlContains(_0x4a8b3b,_0x3000f3){var _0x59faf1={_0x323bd7:0xa1,_0x112e48:0xa4},_0x2f9a5f=_0x2a015c,_0x281a9d=String(_0x4a8b3b||'')['toLowerCase'](),_0x39f5bb=String(_0x3000f3||'')["toLowerCase"]()['replace'](/[^a-z0-9]/g,'-')["replace"](/-+/g,'-'),_0x2dea0f=_0x39f5bb["split"]('-')['filter'](function(_0x1f4265){return _0x1f4265['length']>0x2;}),_0x148074=0x0;for(var _0x4c8880=0x0;_0x4c8880<_0x2dea0f["length"];_0x4c8880++){if(_0x281a9d["indexOf"](_0x2dea0f[_0x4c8880])>=0x0)_0x148074++;}return _0x2dea0f["length"]>0x0?_0x148074/_0x2dea0f['length']:0x0;}function matchByTitleYear(_0x42693c,_0x6704ea,_0x5abe5b,_0x321236){var _0x465029={_0x27f290:0xac,_0x2ae28a:0xa4,_0x47eee8:0xa4,_0x35ea1d:0xc3},_0x5b097c=_0x2a015c;if(!_0x5abe5b||!_0x5abe5b["length"])return null;var _0x400a99=String(_0x42693c||'')['toLowerCase']()["trim"](),_0x546209=String(_0x6704ea||'');function _0x4a66b9(_0x4992f){var _0x34ec6f=_0x5b097c;if(!_0x4992f)return 0x0;var _0x111d06=0x0;if(titleStartsWith(_0x4992f['title'],_0x42693c))_0x111d06+=0xa;_0x111d06+=urlContains(_0x4992f["url"],_0x42693c)*0x5,_0x111d06+=wordMatchScore(_0x42693c,_0x4992f["title"]);if(_0x546209&&String(_0x4992f["title"])['toLowerCase']()['indexOf'](_0x546209)>=0x0)_0x111d06+=0x3;return _0x111d06;}if(_0x321236){var _0x358ce1="(?:season|s)\\s*"+_0x321236+'\x5cb',_0x5f22e8=new RegExp(_0x358ce1,'i'),_0x333857=null,_0x141d96=-0x1;for(var _0x54e15f=0x0;_0x54e15f<_0x5abe5b["length"];_0x54e15f++){var _0x120a26=_0x5abe5b[_0x54e15f];if(!_0x120a26||!_0x120a26['title'])continue;if(_0x5f22e8["test"](_0x120a26["title"])){var _0x327716=_0x4a66b9(_0x120a26)+0xa;_0x327716>_0x141d96&&(_0x141d96=_0x327716,_0x333857=_0x120a26);}}if(_0x333857)return _0x333857;}var _0x333857=null,_0x141d96=-0x1;for(var _0x54e15f=0x0;_0x54e15f<_0x5abe5b["length"];_0x54e15f++){var _0x120a26=_0x5abe5b[_0x54e15f];if(!_0x120a26||!_0x120a26["title"])continue;var _0x327716=_0x4a66b9(_0x120a26);_0x327716>_0x141d96&&(_0x141d96=_0x327716,_0x333857=_0x120a26);}if(_0x333857&&_0x141d96>=0x3)return _0x333857;return null;}function searchCinefreak(_0xd0d906,_0x49e11d,_0x1e5b83){var _0xa29beb={_0x32e392:0xa4,_0x22c051:0xba};return __async(this,null,function*(){var _0x32c375=_0x38d9;if(!_0xd0d906)return[];var _0x38c726=BASE_URL+'/wp-json/wp/v2/search?search='+encodeUri(_0xd0d906)+'&per_page=10',_0x2bdf4c=yield fetchJson(_0x38c726,_0x1e5b83);if(!_0x2bdf4c||!_0x2bdf4c["length"])return[];var _0x543750=[];for(var _0x305a1d=0x0;_0x305a1d<_0x2bdf4c['length'];_0x305a1d++){var _0x222c12=_0x2bdf4c[_0x305a1d];if(!_0x222c12||!_0x222c12["title"]||!_0x222c12["url"])continue;_0x543750['push']({'id':_0x222c12['id'],'title':String(_0x222c12['title'])['replace'](/Download\s*/gi,'')['trim'](),'url':_0x222c12["url"]});}return _0x543750;});}function fetchPostPage(_0x3f8371,_0x3f8a4a){var _0x33a8ff={_0x14add6:0xed};return __async(this,null,function*(){var _0xc1cc73=_0x38d9;if(!_0x3f8371)return null;var _0x44fc7b=_0x3f8371;if(_0x3f8371['indexOf']('http')!==0x0){if(_0x3f8371["indexOf"]('/')===0x0)_0x44fc7b=BASE_URL+_0x3f8371;else _0x44fc7b=BASE_URL+'/'+_0x3f8371;}return yield fetchText(_0x44fc7b,_0x3f8a4a);});}function extractAllGenerateLinks(_0x44287b){var _0x44228a={_0x2f4797:0xed,_0x5affff:0xf5,_0x1c7fa1:0xe8,_0x29300e:0x104,_0x2c5630:0x100},_0x2aaa5c=_0x2a015c;if(!_0x44287b)return[];var _0xbd97e9=[],_0x25fa84=0x0,_0x4be806='/generate.php?id=';while(!![]){var _0x437a92=_0x44287b["indexOf"](_0x4be806,_0x25fa84);if(_0x437a92===-0x1)break;var _0x5314aa=_0x44287b["lastIndexOf"]("<a ",_0x437a92);if(_0x5314aa===-0x1||_0x5314aa<_0x25fa84){_0x25fa84=_0x437a92+0x1;continue;}var _0x434c53=_0x44287b["indexOf"]('</a>',_0x437a92);if(_0x434c53===-0x1){_0x25fa84=_0x437a92+0x1;continue;}var _0x200dc0=_0x44287b['indexOf']('>',_0x437a92);if(_0x200dc0===-0x1||_0x200dc0>_0x434c53){_0x25fa84=_0x434c53+0x4;continue;}var _0x8f7faf=_0x44287b["substring"](_0x200dc0+0x1,_0x434c53)['trim'](),_0x3f3e36=_0x44287b['indexOf']('\x22',_0x437a92);if(_0x3f3e36===-0x1){_0x25fa84=_0x434c53+0x4;continue;}var _0x53b0fb=_0x44287b['substring'](_0x437a92,_0x3f3e36),_0x26d579=_0x53b0fb['match'](/id=([a-zA-Z0-9+/=]+)/);if(!_0x26d579){_0x25fa84=_0x434c53+0x4;continue;}var _0x50ea59=_0x26d579[0x1],_0x323aa9=decodeGenerateUrl(_0x50ea59);_0xbd97e9["push"]({'encodedId':_0x50ea59,'decodedUrl':_0x323aa9||'','label':_0x8f7faf,'fullTag':_0x44287b['substring'](_0x5314aa,_0x434c53+0x4)}),_0x25fa84=_0x434c53+0x4;}return _0xbd97e9;}function extractMovieQualities(_0x1cf4c1){var _0x5333b1=_0x2a015c;if(!_0x1cf4c1)return[];var _0x1f62eb=[],_0x3435f4=_0x1cf4c1['split']('dlbtn-container');for(var _0x5018ff=0x1;_0x5018ff<_0x3435f4['length'];_0x5018ff++){var _0x32d1b0=_0x3435f4[_0x5018ff],_0x426fed=_0x3435f4[_0x5018ff-0x1],_0x5d59e2=_0x32d1b0['match'](/href="(?:https?:\/\/[^"]*?)?\/generate\.php\?id=([a-zA-Z0-9+/=]+)"/);if(!_0x5d59e2)continue;var _0x468624=_0x5d59e2[0x1],_0x1cb06=decodeGenerateUrl(_0x468624);if(!_0x1cb06||_0x1cb06["indexOf"]('/f/')===-0x1)continue;var _0x1e7c91='',_0x4e1d2a=_0x426fed['match'](/<\/span>\s*([^<]*?(?:2160|1080|720|480|4K)[^<]*?\[[^\]]+\])/i);!_0x4e1d2a&&(_0x4e1d2a=_0x426fed['match'](/<\/span>\s*([^<]*?(?:2160|1080|720|480|4K)[^<]*?)\s*\[/i));_0x4e1d2a&&(_0x1e7c91=_0x4e1d2a[0x1]['trim']());if(!_0x1e7c91||!_0x1e7c91["includes"]('[')){var _0x358f6f=_0x426fed['match'](/<h4[^>]*>([\s\S]*?)<\/h4>/i);if(_0x358f6f)_0x1e7c91=(_0x1e7c91+'\x20'+_0x358f6f[0x1]["replace"](/<[^>]*>/g,''))["trim"]();}if(!_0x1e7c91){_0x4e1d2a=_0x426fed['match'](/\b(?:4K\s*2160p|UHD|2160p|1080p|720p|480p)\b/i);if(!_0x4e1d2a)_0x4e1d2a=_0x426fed['match'](/\b(?:SD|HD)\b/i);if(_0x4e1d2a)_0x1e7c91=_0x4e1d2a[0x0];}if(!_0x1e7c91)_0x1e7c91=_0x1cb06;var _0x4422ac=parseQuality(_0x1e7c91),_0x41a098=![];for(var _0x5cfb41=0x0;_0x5cfb41<_0x1f62eb['length'];_0x5cfb41++){if(_0x1f62eb[_0x5cfb41]['decodedUrl']===_0x1cb06){_0x41a098=!![];break;}}if(_0x41a098)continue;_0x1f62eb['push']({'encodedId':_0x468624,'decodedUrl':_0x1cb06,'label':_0x1e7c91||_0x4422ac,'quality':_0x4422ac});}return _0x1f62eb;}function extractEpisodeQualities(_0x3ef157,_0x3d3be4){var _0x2db26c={_0x7b54ef:0x103,_0x305d7b:0xa3,_0x24809a:0x103,_0x4380e8:0x100,_0x105b76:0xf0},_0x483476=_0x2a015c;if(!_0x3ef157)return[];var _0x2de654=_0x3ef157['split']("<div class=\"ep-card\""),_0x420914=null;for(var _0x37251a=0x1;_0x37251a<_0x2de654['length'];_0x37251a++){var _0x385612=_0x2de654[_0x37251a],_0x1a2ca6=_0x385612['match'](/episode-badge[^>]*>Episode\s*(\d+)/i);if(!_0x1a2ca6)continue;var _0x2ab8ba=parseInt(_0x1a2ca6[0x1],0xa);if(_0x2ab8ba===_0x3d3be4){_0x420914=_0x385612;break;}}if(!_0x420914)return[];var _0x8721cc=extractAllGenerateLinks(_0x420914),_0x4e59d3=[];for(var _0x1a2085=0x0;_0x1a2085<_0x8721cc['length'];_0x1a2085++){var _0x5829f8=_0x8721cc[_0x1a2085];if(!_0x5829f8["decodedUrl"]||_0x5829f8["decodedUrl"]["indexOf"]('/f/')===-0x1)continue;var _0x57a3fd=_0x5829f8["label"],_0x1b3da8=parseQuality(_0x57a3fd||_0x5829f8["decodedUrl"]),_0x2738b3=![];for(var _0x4e14eb=0x0;_0x4e14eb<_0x4e59d3['length'];_0x4e14eb++){if(_0x4e59d3[_0x4e14eb]['decodedUrl']===_0x5829f8["decodedUrl"]){_0x2738b3=!![];break;}}if(_0x2738b3)continue;_0x4e59d3["push"]({'encodedId':_0x5829f8["encodedId"],'decodedUrl':_0x5829f8['decodedUrl'],'label':_0x57a3fd||_0x1b3da8,'quality':_0x1b3da8});}return _0x4e59d3;}function filterQualities(_0x140c40){var _0x67342a={_0x36b724:0xa4,_0x2fdde3:0xea,_0x2727ca:0xea,_0x4c62b0:0x100},_0x46a3ed={_0x1baea7:0xea},_0x195f7a=_0x2a015c;if(!_0x140c40||!_0x140c40["length"])return[];var _0xe7872=[];for(var _0x5d5f0a=0x0;_0x5d5f0a<_0x140c40['length'];_0x5d5f0a++){var _0x7f4f5=_0x140c40[_0x5d5f0a];if(_0x7f4f5["quality"]==='480p'||_0x7f4f5["quality"]==='SD')continue;_0xe7872["push"](_0x7f4f5);}var _0x3bd302={'2160p':0x0,'1080p':0x1,'720p':0x2,'HD':0x3};return _0xe7872['sort'](function(_0x3a1f3a,_0x264d6e){var _0x2dbf00=_0x195f7a,_0x3c43a7=_0x3bd302[_0x3a1f3a['quality']]!==void 0x0?_0x3bd302[_0x3a1f3a['quality']]:0x63,_0x1e6e62=_0x3bd302[_0x264d6e["quality"]]!==void 0x0?_0x3bd302[_0x264d6e['quality']]:0x63;return _0x3c43a7-_0x1e6e62;}),_0xe7872;}function extractHash(_0x276c4c){var _0x2162d5={_0x5e98c4:0xed,_0x4ab73b:0x104},_0x4e1596=_0x2a015c;if(!_0x276c4c)return'';var _0x20d164=_0x276c4c["indexOf"]('/f/'),_0x18cfe7=_0x276c4c["indexOf"]("/x/"),_0x25ced1=_0x20d164>=0x0?_0x20d164+0x3:_0x18cfe7>=0x0?_0x18cfe7+0x3:-0x1;if(_0x25ced1<0x0)return'';return _0x276c4c["substring"](_0x25ced1);}function resolveFslUrl(_0x26b466,_0x1223d6){var _0x4f4163={_0x427409:0xbb};return __async(this,null,function*(){var _0xbb18fd=_0x38d9;if(!_0x26b466)return null;var _0x4b7b66=extractHash(_0x26b466);if(!_0x4b7b66)return null;var _0x1c9da5=CINECLOUD_BASE+"/f/"+_0x4b7b66,_0x40338e=yield fetchText(_0x1c9da5,_0x1223d6);if(!_0x40338e)return null;return extractFslUrl(_0x40338e);});}function decodeEntities(_0x40648d){var _0x1905a3=_0x2a015c;if(!_0x40648d)return'';var _0x432079=/&(nbsp|amp|quot|lt|gt|#038);/g,_0x41c2ce={'nbsp':'\x20','amp':'&','quot':'\x22','lt':'<','gt':'>','#038':'&'};return _0x40648d['replace'](_0x432079,function(_0x3a1827,_0x2c13d0){return _0x41c2ce[_0x2c13d0];})["replace"](/&#(\d+);/g,function(_0xf7bc58,_0x42b312){return String['fromCharCode'](_0x42b312);});}function makeStream(_0x122e14,_0x219aa7,_0x2ef03f,_0x8666f,_0xac0aec,_0xad91d1){var _0x44beed={_0x562e64:0xfa,_0x58dd02:0xa8,_0x257801:0xbf,_0x40ffd9:0xa1,_0x1ecc1a:0xcd,_0x1ad7ce:0x9c,_0x16d606:0xf3,_0x45e5a0:0xde,_0x5237ee:0xaf,_0x36c877:0xce,_0x437950:0xf3,_0x3d5f0e:0xf2,_0x5d41f6:0xf3,_0x179077:0xc5,_0x29352b:0xb2,_0x14f543:0xb8,_0x3bf716:0xc1,_0x5a21b3:0xc4,_0x241ed9:0xf4,_0x27bde1:0xd2,_0x219b11:0xf8,_0x16956c:0xb1,_0x39c340:0xb5,_0x371f2d:0xda,_0x202931:0xca,_0x3e2396:0xbd},_0x1ee8f3=_0x2a015c,_0x51a831=decodeEntities(_0x122e14||'')['replace'](/[\n\t]+/g,'')["trim"](),_0x54eca3=decodeEntities(_0x219aa7||'')['replace'](/[\n\t]+/g,'\x20')["replace"](/\s{2,}/g,'\x20')["trim"]();_0x51a831["indexOf"]('\x20-\x20')>0x0&&(_0x51a831=_0x51a831["split"](" - ")[0x0]["trim"]());_0x51a831=_0x51a831["replace"](/\(\d{4}\).*$/gi,'')["replace"](/\d{3,4}p.*$/gi,'')["trim"]();var _0x1d7ae7=_0x54eca3["toLowerCase"](),_0x54f002=(_0x2ef03f||'')['toLowerCase'](),_0x1ec06c="N/A",_0x2ee72d=_0x54eca3['match'](/\[\s*(\d+(?:\.\d+)?\s*[MG]B)\s*\]/i)||_0x54eca3["match"](/(\d+(?:\.\d+)?\s*[MG]B)/i);if(_0x2ee72d)_0x1ec06c=_0x2ee72d[0x1]["toUpperCase"]()['replace'](/\s+/g,'');var _0x2bad2d=0x0,_0x588fd0=0x0;if(_0x2ee72d){var _0x67dba4=parseFloat(_0x2ee72d[0x1]),_0x225f35=_0x2ee72d[0x1]['toUpperCase']();_0x2bad2d=_0x225f35['includes']('GB')?_0x67dba4*0x400:_0x67dba4,_0x588fd0=_0x225f35["includes"]('GB')?_0x67dba4:_0x67dba4/0x400;}var _0x4a470a="MKV";if(_0x2ef03f&&_0x54f002["split"]('?')[0x0]["endsWith"](".mp4"))_0x4a470a="MP4";var _0x441e46='WEB-DL';if(/\b(bluray|blu\-ray)\b/i['test'](_0x1d7ae7))_0x441e46="BluRay";else{if(/\b(hdrip|webrip)\b/i["test"](_0x1d7ae7))_0x441e46="WEBRip";}var _0x966acc=_0x8666f["includes"]("2160")||_0x8666f['toLowerCase']()["includes"]('4k')||_0x1d7ae7["includes"]('2160p'),_0x47db4b='H.264';(/\b(hevc|x265|h265)\b/i['test'](_0x1d7ae7)||_0x54f002["includes"]("hevc")||_0x54f002["includes"]("x265")||_0x966acc)&&(_0x47db4b="HEVC");var _0x3a8100='',_0x1c9b3a='';if(/\b(dolby\s*vision|dovi|dv)\b/i['test'](_0x1d7ae7)||_0x54f002['includes']('dovi')||_0x54f002["includes"]("dolby.vision"))_0x1c9b3a="Dolby Vision";else{if(/\bhdr10\b/i['test'](_0x1d7ae7)||_0x54f002["includes"]('hdr10'))_0x1c9b3a="HDR10";else{if(/\bhdr\b/i['test'](_0x1d7ae7)||_0x54f002["includes"]('hdr'))_0x1c9b3a='HDR';else(/\b(10bit|10\-bit)\b/i['test'](_0x1d7ae7)||_0x54f002['includes']('10bit'))&&(_0x1c9b3a="10Bit");}}if(_0x1c9b3a)_0x3a8100=" | 🔆 "+_0x1c9b3a+" • ⚡ "+_0x47db4b;else _0x3a8100='\x20|\x20⚡\x20'+_0x47db4b;var _0x43cfa6='DD5.1';if(_0x966acc)_0x43cfa6="DDP5.1 • 🔊 Atmos";else{if(_0x2ee72d&&_0x588fd0<1.3)_0x43cfa6='Stereo';else{if(_0x54f002["includes"]('hq'))_0x43cfa6="DDP5.1 • 🔊 Atmos";else _0x47db4b==='HEVC'&&(_0x43cfa6='DD5.1');}}var _0xbfc29f=/\b(dual|multi|dubbed|hindi)\b/i['test'](_0x1d7ae7)||decodeEntities(_0x122e14||'')["toLowerCase"]()["includes"]("dual audio")||_0x54f002['includes']('dual'),_0x17bf2b=_0xbfc29f?"Dual-Audio":"Single Audio",_0x1b0fde=_0xbfc29f?'English\x20🇺🇸\x20•\x20Hindi\x20🇮🇳':'English\x20🇺🇸',_0x2f3e81=_0x8666f||'1080p',_0x4f2667=PROVIDER_NAME+'\x20|\x20'+_0x2f3e81+" | "+_0x17bf2b,_0xe8d045=decodeEntities(_0x122e14||'')["match"](/\b(19|20)\d{2}\b/),_0x115289=_0xe8d045?_0xe8d045[0x0]:"2026",_0x1ad103='';_0xad91d1&&(_0xad91d1["startsWith"]('S')||_0xad91d1['includes']('E'))?_0x1ad103="🎦 "+_0x51a831+'\x20('+_0x115289+')\x20-\x20'+_0xad91d1['replace'](/E0*(\d+)/i,"E$1")["replace"](/S0*(\d+)/i,'S$1'):_0x1ad103='🎦\x20'+_0x51a831+'\x20-\x20('+_0x115289+')';var _0x4dca98='💎\x20'+_0x2f3e81+'\x20|\x20🗣️\x20'+_0x1b0fde+" | 💾 "+_0x1ec06c,_0x45e7fb='🎞️\x20'+_0x4a470a+'\x20|\x20🎧\x20'+_0x43cfa6+_0x3a8100,_0x259934='🔗\x20FSL\x20Server\x20|\x20☁️\x20'+_0x441e46,_0x59af77=_0x1ad103+'\x0a'+_0x4dca98+'\x0a'+_0x45e7fb+'\x0a'+_0x259934,_0x5851a0=_0x966acc?0x895440:_0x2f3e81["includes"]("1080")?0x5b8d80:0x2dc6c0,_0x1583cc=_0x5851a0+_0x2bad2d;return{'name':_0x4f2667,'title':_0x59af77,'size':_0x59af77,'url':_0x2ef03f||'','_resWeight':_0x5851a0,'_sortWeight':_0x1583cc,'behaviorHints':{'notWebReady':!![],'proxyHeaders':{'request':_0xac0aec||{'Referer':CINECLOUD_BASE+'/'}}}};}function getStreams(_0x1c24c2,_0x598c03,_0xb3006a,_0x2ea8d7){var _0x5bcbd0={_0x24ef91:0xa4,_0x362e3c:0xdb,_0x54844a:0xcc,_0x2c66fb:0xc3,_0x48b740:0xb3,_0xb87c61:0xc3,_0x12832c:0xba,_0x1ee864:0xa5,_0x3b8f7f:0x103,_0x27bd38:0xc3,_0x41a31c:0xa3,_0x4712b3:0xea,_0x303e44:0xfa,_0xad2e7b:0xef,_0x20b00d:0xe5,_0x30db30:0xa6,_0x5517cb:0xff},_0x585855={_0x234c1e:0xea};return __async(this,null,function*(){var _0x83ed32=_0x38d9;try{var _0xc96a6c=_0x598c03==='tv'||_0x598c03==='series';console['log']('['+PROVIDER_NAME+']\x20Request:\x20tmdbId='+_0x1c24c2+'\x20type='+_0x598c03+" S="+_0xb3006a+" E="+_0x2ea8d7);var _0x1d68e4=MOBILE_UAS[Math["floor"](Math["random"]()*MOBILE_UAS["length"])],_0x1022ee=yield getTMDBInfo(_0x1c24c2,_0x598c03,_0x1d68e4);if(!_0x1022ee||!_0x1022ee['title'])return console['log']('['+PROVIDER_NAME+"] TMDB info not found for "+_0x1c24c2),[];console['log']('['+PROVIDER_NAME+']\x20TMDB:\x20'+_0x1022ee["title"]+'\x20('+_0x1022ee['year']+')');var _0x4b3418=_0xc96a6c?parseInt(_0xb3006a,0xa)||0x1:null,_0x2bdde8=yield searchCinefreak(_0x1022ee['title'],null,_0x1d68e4);if(!_0x2bdde8||_0x2bdde8['length']<0x3){var _0x120b59=yield searchCinefreak(_0x1022ee['title']+'\x20'+_0x1022ee["year"],null,_0x1d68e4);if(_0x120b59&&_0x120b59["length"])_0x2bdde8=_0x120b59;}if(!_0x2bdde8||!_0x2bdde8['length'])return console['log']('['+PROVIDER_NAME+']\x20No\x20search\x20results\x20for\x20'+_0x1022ee['title']),[];var _0x315c82=matchByTitleYear(_0x1022ee['title'],_0x1022ee['year'],_0x2bdde8,_0x4b3418);if(!_0x315c82)return console['log']('['+PROVIDER_NAME+"] No match found for "+_0x1022ee["title"]),[];console["log"]('['+PROVIDER_NAME+']\x20Matched:\x20'+_0x315c82["title"]);var _0x9cb3ec=yield fetchPostPage(_0x315c82["url"],_0x1d68e4);if(!_0x9cb3ec)return console["log"]('['+PROVIDER_NAME+']\x20Failed\x20to\x20fetch\x20post\x20page'),[];var _0x4475b1;if(_0xc96a6c){var _0x5883a4=parseInt(_0x2ea8d7,0xa)||0x1;_0x4475b1=extractEpisodeQualities(_0x9cb3ec,_0x5883a4);}else _0x4475b1=extractMovieQualities(_0x9cb3ec);if(!_0x4475b1||!_0x4475b1["length"])return console['log']('['+PROVIDER_NAME+']\x20No\x20quality\x20links\x20found'),[];var _0x2db500=filterQualities(_0x4475b1);if(!_0x2db500["length"])return console["log"]('['+PROVIDER_NAME+']\x20No\x20usable\x20qualities\x20after\x20filtering'),[];console["log"]('['+PROVIDER_NAME+"] Qualities: "+_0x2db500["map"](function(_0x5713e9){var _0x113ddb=_0x83ed32;return _0x5713e9["quality"];})['join'](',\x20'));var _0x4b5dec='';if(_0xc96a6c){var _0xa85a7f=parseInt(_0xb3006a,0xa)||0x1,_0x410351=parseInt(_0x2ea8d7,0xa)||0x1;_0x4b5dec='S'+(_0xa85a7f<0xa?'0':'')+_0xa85a7f+'E'+(_0x410351<0xa?'0':'')+_0x410351+'\x20';}var _0x2c1a43=[];for(var _0x46bf4b=0x0;_0x46bf4b<_0x2db500['length'];_0x46bf4b++){var _0x16d35d=_0x2db500[_0x46bf4b],_0x5ec026=yield resolveFslUrl(_0x16d35d["decodedUrl"],_0x1d68e4);if(_0x5ec026){var _0x283ed2=makeStream(_0x315c82["title"],_0x16d35d["label"],_0x5ec026,_0x16d35d["quality"],{'Referer':CINECLOUD_BASE+'/','User-Agent':_0x1d68e4},_0x4b5dec["trim"]());_0x2c1a43['push'](_0x283ed2);}}var _0x4cabd3=_0x2c1a43["sort"](function(_0x4b2eab,_0x4a011a){var _0x38b42f=_0x83ed32;return(_0x4a011a['_sortWeight']||0x0)-(_0x4b2eab["_sortWeight"]||0x0);});return console['log']('['+PROVIDER_NAME+"] Returning "+_0x4cabd3['length']+'\x20stream(s)'),_0x4cabd3;}catch(_0x26fcbf){return console["log"]('['+PROVIDER_NAME+"] Fatal error: "+(_0x26fcbf["message"]||_0x26fcbf)),[];}});}/*string-table removed*/typeof module!=="undefined"&&module['exports']?module["exports"]={'manifest':manifest,'search':search,'getStreams':getStreams}:(global["manifest"]=manifest,global["search"]=search,global['getStreams']=getStreams);

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
  var PROVIDER = "cinefreak";
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
