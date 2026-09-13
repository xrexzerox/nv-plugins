/*
 * nv-plugins allwish.js — FULLY DECODED port of the All-in-One-Nuvio provider (4.24.0 merge pass).
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
var _0xf68e=function(){return "";};const _0x2c2e6d=_0xf68e;/*rotation removed*/;var __defProp=Object["defineProperty"],__defProps=Object['defineProperties'],__getOwnPropDescs=Object["getOwnPropertyDescriptors"],__getOwnPropSymbols=Object['getOwnPropertySymbols'],__hasOwnProp=Object["prototype"]["hasOwnProperty"],__propIsEnum=Object["prototype"]['propertyIsEnumerable'],__defNormalProp=(_0xf040fc,_0x508bfd,_0xb4428b)=>_0x508bfd in _0xf040fc?__defProp(_0xf040fc,_0x508bfd,{'enumerable':!![],'configurable':!![],'writable':!![],'value':_0xb4428b}):_0xf040fc[_0x508bfd]=_0xb4428b,__spreadValues=(_0x195fe3,_0x36422a)=>{const _0x603060=_0x2c2e6d;for(var _0x2afa6d in _0x36422a||(_0x36422a={}))if(__hasOwnProp["call"](_0x36422a,_0x2afa6d))__defNormalProp(_0x195fe3,_0x2afa6d,_0x36422a[_0x2afa6d]);if(__getOwnPropSymbols)for(var _0x2afa6d of __getOwnPropSymbols(_0x36422a)){if(__propIsEnum["call"](_0x36422a,_0x2afa6d))__defNormalProp(_0x195fe3,_0x2afa6d,_0x36422a[_0x2afa6d]);}return _0x195fe3;},__spreadProps=(_0x340b78,_0xf3dbff)=>__defProps(_0x340b78,__getOwnPropDescs(_0xf3dbff)),__async=(_0x219ac4,_0x41e316,_0xe46133)=>{return new Promise((_0x466e92,_0x208718)=>{const _0x10d627=_0xf68e;var _0xafb8ed=_0x109bb2=>{const _0x57f0fe=_0xf68e;try{_0x2885fb(_0xe46133["next"](_0x109bb2));}catch(_0x251dae){_0x208718(_0x251dae);}},_0x40e3d4=_0x2e2e95=>{try{_0x2885fb(_0xe46133['throw'](_0x2e2e95));}catch(_0xd7854f){_0x208718(_0xd7854f);}},_0x2885fb=_0x39bb5e=>_0x39bb5e["done"]?_0x466e92(_0x39bb5e["value"]):Promise["resolve"](_0x39bb5e["value"])["then"](_0xafb8ed,_0x40e3d4);_0x2885fb((_0xe46133=_0xe46133["apply"](_0x219ac4,_0x41e316))["next"]());});},cheerio=__nvRequire("cheerio-without-node-native"),CryptoJS=__nvRequire("crypto-js"),PROVIDER_NAME="AllWish",MAIN_URL="https://all-wish.me",TMDB_API_KEY="439c478a771f35c05022f9feabcca01c",REQUEST_TIMEOUT=0x2ee0,EPISODE_LIST_TIMEOUT=0x7530,VRF_SECRET='ysJhV6U27FVIjjuk',HEADERS={'User-Agent':"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",'Accept':'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8','Accept-Language':"en-US,en;q=0.5",'Connection':'keep-alive'},AJAX_HEADERS={'X-Requested-With':"XMLHttpRequest",'User-Agent':HEADERS["User-Agent"],'Referer':MAIN_URL+'/'};function fetchSafe(_0x15767a){return __async(this,arguments,function*(_0x4eff9c,_0x133c67={},_0x1f22fb=REQUEST_TIMEOUT){const _0x2d55b7=_0xf68e;try{const _0x25091a=typeof AbortSignal!=="undefined"&&AbortSignal["timeout"]?AbortSignal["timeout"](_0x1f22fb):null,_0xb2382a=__spreadProps(__spreadValues({},_0x133c67),{'headers':__spreadValues(__spreadValues({},HEADERS),_0x133c67['headers']||{})});if(_0x25091a)_0xb2382a["signal"]=_0x25091a;const _0x398ba0=yield __nvFetch(_0x4eff9c,_0xb2382a);return _0x398ba0;}catch(_0x311219){return console["error"]('['+PROVIDER_NAME+"] fetchSafe: "+(_0x4eff9c||'')['substring'](0x0,0x64)+" -> "+_0x311219["message"]),null;}});}function fetchJson(_0x2f2610){return __async(this,arguments,function*(_0x23b0a9,_0x2891d4={},_0xe7baa3){const _0x3af8e8=_0xf68e;try{const _0xbfebbd=yield fetchSafe(_0x23b0a9,_0x2891d4,_0xe7baa3);if(!_0xbfebbd||!_0xbfebbd['ok'])return null;return JSON['parse'](yield _0xbfebbd["text"]());}catch(_0xc6bce2){return console["error"]('['+PROVIDER_NAME+"] fetchJson: "+(_0x23b0a9||'')['substring'](0x0,0x64)+" -> "+_0xc6bce2['message']),null;}});}function fetchHtml(_0x4ba983){return __async(this,arguments,function*(_0x1c1995,_0x39dff0={}){const _0x5acee7=_0xf68e;try{const _0x220ea2=yield fetchSafe(_0x1c1995,_0x39dff0);if(!_0x220ea2||!_0x220ea2['ok'])return null;return cheerio["load"](yield _0x220ea2["text"]());}catch(_0x4f4772){return console["error"]('['+PROVIDER_NAME+']\x20fetchHtml:\x20'+(_0x1c1995||'')["substring"](0x0,0x64)+'\x20->\x20'+_0x4f4772["message"]),null;}});}function makeStream(_0x246b71,_0x3bde92,_0x2bc1c1,_0x2c99fc,_0x32fc65={},_0x590048){const _0x231fb6=_0x2c2e6d,_0x2c7d70={'name':PROVIDER_NAME+" | "+_0x246b71,'title':_0x3bde92||'','url':_0x2bc1c1||'','quality':_0x2c99fc||'HD','headers':__spreadValues({'User-Agent':HEADERS["User-Agent"]},_0x32fc65||{})};return _0x590048&&Array["isArray"](_0x590048)&&_0x590048["length"]>0x0&&(_0x2c7d70["subtitles"]=_0x590048),_0x2c7d70;}function buildStreamLabels(_0x3df22d,_0x35b9ed,_0x14d38d,_0x2df68b){const _0x547b87=_0x2c2e6d,_0x12e808=_0x35b9ed||'HD',_0xf356ee=_0x12e808+(_0x14d38d?'\x20'+_0x14d38d:'');let _0x5b58b1='';return _0x2df68b&&_0x2df68b["title"]?_0x2df68b["mediaType"]==='tv'&&_0x2df68b["season"]!=null&&_0x2df68b["episode"]!=null?_0x5b58b1=_0x2df68b["title"]+'\x0aS'+_0x2df68b["season"]+'\x20E'+_0x2df68b["episode"]+" · "+_0x12e808+" · HLS":_0x5b58b1=_0x2df68b["title"]+'\x0a'+_0x12e808+'\x20·\x20HLS':_0x5b58b1=_0x3df22d+(_0x14d38d?'\x20'+_0x14d38d:'')+'\x0a'+_0x12e808+" · HLS",_0x5b58b1+="\nby piratezoro9",{'name':_0xf356ee,'title':_0x5b58b1};}function dedupe(_0x31838e){const _0x593d3d=_0x2c2e6d,_0x20b6f3=new Set();return(_0x31838e||[])["filter"](_0x5eb7a7=>{const _0x5ac165=_0x593d3d;if(!_0x5eb7a7||!_0x5eb7a7['url']||_0x20b6f3['has'](_0x5eb7a7['url']))return![];return _0x20b6f3['add'](_0x5eb7a7["url"]),!![];});}function getTMDBInfo(_0x523e8a,_0x416b94){return __async(this,null,function*(){const _0x5edb60=_0xf68e,_0x41131c=String(_0x523e8a||'')["trim"](),_0x4473d9=_0x41131c["startsWith"]('tt'),_0x369740=_0x416b94==='tv'||_0x416b94==="series"?'tv':'movie';try{if(_0x4473d9){const _0x52cc96=yield fetchJson("https://api.themoviedb.org/3/find/"+_0x41131c+"?api_key="+TMDB_API_KEY+"&external_source=imdb_id"),_0x502ac2=_0x52cc96?_0x369740==='tv'?_0x52cc96["tv_results"]:_0x52cc96["movie_results"]:null;if(_0x502ac2&&_0x502ac2["length"]>0x0){const _0x876064=_0x502ac2[0x0];return{'id':_0x876064['id'],'title':_0x369740==='tv'?_0x876064['name']:_0x876064['title'],'originalTitle':_0x369740==='tv'?_0x876064["original_name"]:_0x876064["original_title"],'year':(_0x876064["first_air_date"]||_0x876064["release_date"]||'')["split"]('-')[0x0],'genres':_0x876064["genre_ids"]||[],'imdbId':_0x41131c};}return{'id':_0x41131c,'title':_0x41131c,'originalTitle':_0x41131c,'year':null,'genres':[],'imdbId':_0x41131c};}else{const _0x1854ed=yield fetchJson('https://api.themoviedb.org/3/'+_0x369740+'/'+_0x41131c+"?api_key="+TMDB_API_KEY+"&append_to_response=external_ids");if(_0x1854ed)return{'id':_0x1854ed['id'],'title':_0x369740==='tv'?_0x1854ed["name"]:_0x1854ed["title"],'originalTitle':_0x369740==='tv'?_0x1854ed["original_name"]:_0x1854ed["original_title"],'year':(_0x1854ed["first_air_date"]||_0x1854ed["release_date"]||'')['split']('-')[0x0],'genres':(_0x1854ed["genres"]||[])['map'](_0x2e3aec=>_0x2e3aec['id']),'imdbId':_0x1854ed["imdb_id"]||_0x1854ed["external_ids"]&&_0x1854ed["external_ids"]['imdb_id']||null};}}catch(_0x2316be){console["error"]('['+PROVIDER_NAME+"] TMDB error: "+_0x2316be['message']);}return{'id':_0x41131c,'title':_0x41131c,'originalTitle':_0x41131c,'year':null,'genres':[],'imdbId':null};});}function cleanTitle(_0x545905){const _0x5c1a86=_0x2c2e6d;return String(_0x545905||'')["toLowerCase"]()["replace"](/[^a-z0-9\s]/g,'\x20')["replace"](/\s+/g,'\x20')["trim"]();}function tokenize(_0x5aaef7){const _0x3af422=_0x2c2e6d;return cleanTitle(_0x5aaef7)["split"]('\x20')["filter"](Boolean);}function scoreTitle(_0x5ac27f,_0x2031c5,_0x51e3fb,_0x19557d){const _0x1816d0=_0x2c2e6d,_0x164ee7=tokenize(_0x2031c5);if(!_0x164ee7["length"])return 0x0;const _0x577656=new Set(tokenize(_0x5ac27f)),_0x1cc5bd=cleanTitle(_0x5ac27f),_0x540e1e=cleanTitle(_0x2031c5),_0x221b24=tokenize(_0x5ac27f);if(_0x1cc5bd===_0x540e1e)return 1.5;const _0x38251a=_0x1cc5bd["replace"](/\s+tv$/,'')["replace"](/\s+movie$/,'')['replace'](/\s+anime$/,'')["replace"](/\s+specials?$/,'')["trim"]();if(_0x38251a===_0x540e1e)return 1.4;let _0x5d2e9d=0x0;for(const _0x233736 of _0x164ee7){if(_0x577656["has"](_0x233736))_0x5d2e9d++;}let _0x27db1c=_0x5d2e9d/Math["max"](_0x164ee7['length'],0x1);if(_0x1cc5bd['startsWith'](_0x540e1e)){_0x27db1c+=0.3;const _0x179f6f=_0x221b24["length"]-_0x164ee7["length"];_0x179f6f>0x2&&(_0x27db1c-=Math['min'](_0x179f6f*0.1,0.4));const _0x12bcb0=['part',"parts","season","movie","movies",'special',"specials","ova","film",'films',"the"],_0x929984=_0x221b24["slice"](_0x164ee7["length"])['filter'](_0x4c4c16=>_0x12bcb0["includes"](_0x4c4c16))["length"];if(_0x929984>0x0)_0x27db1c-=0.2;}else _0x164ee7["length"]<=0x4&&_0x5d2e9d===_0x164ee7["length"]&&(_0x27db1c-=0.4);if(_0x51e3fb){const _0x22c22f=/\b(19|20)\d{2}\b/,_0x5ac534=_0x1cc5bd["match"](_0x22c22f);if(_0x5ac534&&Math["abs"](parseInt(_0x5ac534[0x0])-parseInt(_0x51e3fb))<=0x1)_0x27db1c+=0.5;else{if(_0x5ac534){const _0x2edd5f=Math["abs"](parseInt(_0x5ac534[0x0])-parseInt(_0x51e3fb));_0x27db1c-=Math["min"](_0x2edd5f*0.1,0.8);}}}if(_0x19557d&&Number(_0x19557d)>0x1){const _0x4de336=Number(_0x19557d),_0x45ebf1=_0x1cc5bd["match"](new RegExp('\x5cb'+_0x4de336+"(?:st|nd|rd|th)\\s+season|season\\s*"+_0x4de336+'|\x5cbpart\x5cs*'+_0x4de336,'i'));if(_0x45ebf1)_0x27db1c+=0.4;else{const _0x5b2feb=_0x1cc5bd["match"](/\b(?:season|part)\s*\d+/i);!_0x5b2feb&&(_0x27db1c-=0.3);}}return Math['min'](_0x27db1c,0x2);}function searchAllWish(_0xcfe9eb,_0x4466f7,_0x5abccc,_0x37043e){return __async(this,null,function*(){const _0xfe3060=_0xf68e;try{const _0x12bc75=[];if(_0xcfe9eb)_0x12bc75["push"](_0xcfe9eb);if(_0x4466f7&&_0x4466f7!==_0xcfe9eb)_0x12bc75["push"](_0x4466f7);if(_0x37043e&&Number(_0x37043e)>0x1){const _0x450227=Number(_0x37043e);_0xcfe9eb&&(_0x12bc75["push"](_0xcfe9eb+'\x20'+_0x450227),_0x12bc75["push"](_0xcfe9eb+" season "+_0x450227));}const _0x48b11c=[];for(const _0x298c4f of _0x12bc75){const _0x4f1184=yield fetchHtml(MAIN_URL+'/filter?keyword='+encodeURIComponent(_0x298c4f)+"&page=1");if(!_0x4f1184)continue;_0x4f1184("div.item")["each"]((_0x488885,_0x3d3f72)=>{const _0x47ae3c=_0xfe3060,_0x615fd8=_0x4f1184(_0x3d3f72)['find']("div.name > a")["text"]()["trim"](),_0x3ec04a=_0x4f1184(_0x3d3f72)['find']("div.name > a")['attr']("href");if(_0x615fd8&&_0x3ec04a){const _0x2c56c2=_0x3ec04a['replace'](/\/ep-\d+\/?$/i,'');_0x48b11c['push']({'title':_0x615fd8,'watchUrl':_0x2c56c2,'query':_0x298c4f});}});if(_0x48b11c["length"]>0x0)break;}if(_0x48b11c["length"]===0x0)return null;let _0x285339=null,_0x4f2bf7=-0x1;for(const _0x128c8a of _0x48b11c){const _0xdf55be=scoreTitle(_0x128c8a['title'],_0xcfe9eb||'',_0x5abccc||null,_0x37043e),_0x4f1667=_0x4466f7?scoreTitle(_0x128c8a['title'],_0x4466f7,_0x5abccc||null,_0x37043e):0x0,_0x444d38=Math["max"](_0xdf55be,_0x4f1667);_0x444d38>_0x4f2bf7&&(_0x4f2bf7=_0x444d38,_0x285339=_0x128c8a);}if(_0x4f2bf7<0.3)return console["log"]('['+PROVIDER_NAME+']\x20Title\x20match\x20score\x20too\x20low:\x20'+_0x4f2bf7),null;return console["log"]('['+PROVIDER_NAME+']\x20Best\x20match:\x20\x22'+_0x285339["title"]+'\x22\x20score='+_0x4f2bf7['toFixed'](0x2)),_0x285339;}catch(_0x15088a){return console['error']('['+PROVIDER_NAME+']\x20Search\x20error:\x20'+_0x15088a['message']),null;}});}/*decoder removed*//*string-table removed*/function generateEpisodeVrf(_0x500214){const _0xbed82f=_0x2c2e6d,_0x3cf55b=encodeURIComponent(_0x500214)["replace"](/%21/g,'!')["replace"](/%27/g,'\x27')['replace'](/%28/g,'(')["replace"](/%29/g,')')["replace"](/%7E/g,'~')["replace"](/%2A/g,'*')["replace"](/%20/g,"%20"),_0x5087b8=Array['from'](VRF_SECRET)["map"](_0x2d8d67=>_0x2d8d67["charCodeAt"](0x0)),_0x5c0b22=Array["from"](_0x3cf55b)["map"](_0x2f55e2=>_0x2f55e2["charCodeAt"](0x0)),_0x7caec5=Array["from"]({'length':0x100},(_0x59ecf9,_0x2d9a50)=>_0x2d9a50);let _0x2ea21d=0x0;for(let _0x4e714d=0x0;_0x4e714d<=0xff;_0x4e714d++){_0x2ea21d=(_0x2ea21d+_0x7caec5[_0x4e714d]+_0x5087b8[_0x4e714d%_0x5087b8["length"]])%0x100,[_0x7caec5[_0x4e714d],_0x7caec5[_0x2ea21d]]=[_0x7caec5[_0x2ea21d],_0x7caec5[_0x4e714d]];}const _0x4527aa=[];let _0xd982fb=0x0;_0x2ea21d=0x0;for(let _0x2ad2d8=0x0;_0x2ad2d8<_0x5c0b22['length'];_0x2ad2d8++){_0xd982fb=(_0xd982fb+0x1)%0x100,_0x2ea21d=(_0x2ea21d+_0x7caec5[_0xd982fb])%0x100,[_0x7caec5[_0xd982fb],_0x7caec5[_0x2ea21d]]=[_0x7caec5[_0x2ea21d],_0x7caec5[_0xd982fb]];const _0x11dff5=_0x7caec5[(_0x7caec5[_0xd982fb]+_0x7caec5[_0x2ea21d])%0x100];_0x4527aa["push"]((_0x5c0b22[_0x2ad2d8]^_0x11dff5)&0xff);}function _0x2eb1b3(_0x3e39b4){const _0x166389=_0xbed82f;let _0x1bc6de='';for(const _0x44dc53 of _0x3e39b4)_0x1bc6de+=String["fromCharCode"](_0x44dc53);return btoa(_0x1bc6de)["replace"](/\+/g,'-')['replace'](/\//g,'_')["replace"](/=+$/,'');}const _0xf4ec51=_0x2eb1b3(_0x4527aa),_0x2e33b5={0x0:-0x3,0x1:0x3,0x2:-0x4,0x3:0x2,0x4:-0x2,0x5:0x5,0x6:0x4,0x7:0x5},_0x7602ab=Array["from"](_0xf4ec51)["map"]((_0x11995f,_0x14904d)=>{const _0x33acd6=_0xbed82f;let _0x33bdb9=_0x11995f["charCodeAt"](0x0);return _0x33bdb9+=_0x2e33b5[_0x14904d%0x8]||0x0,_0x33bdb9&0xff;}),_0x3beaf3=_0x2eb1b3(_0x7602ab),_0x48d4ed=_0x11f4f3=>{const _0x4d4a03=_0xbed82f;if(_0x11f4f3>='A'&&_0x11f4f3<='Z')return String["fromCharCode"]((_0x11f4f3['charCodeAt'](0x0)-0x41+0xd)%0x1a+0x41);if(_0x11f4f3>='a'&&_0x11f4f3<='z')return String['fromCharCode']((_0x11f4f3["charCodeAt"](0x0)-0x61+0xd)%0x1a+0x61);return _0x11f4f3;};return Array["from"](_0x3beaf3)["map"](_0x48d4ed)["join"]('');}function chooseEpisode(_0x4a666d,_0x86455f,_0x4cb2f9,_0x20af93){const _0x509d1a=_0x2c2e6d,_0x21189a=_0x4a666d("div.range > div > a")["map"]((_0x400f86,_0x361b54)=>({'slug':parseInt(_0x4a666d(_0x361b54)['attr']('data-slug')||'0',0xa),'ids':_0x4a666d(_0x361b54)["attr"]("data-ids")||'','hasSub':_0x4a666d(_0x361b54)["attr"]("data-sub")==='1','hasDub':_0x4a666d(_0x361b54)["attr"]("data-dub")==='1','malId':_0x4a666d(_0x361b54)["attr"]('data-mal')?parseInt(_0x4a666d(_0x361b54)['attr']("data-mal"),0xa):null}))["get"]()['filter'](_0x542e9e=>_0x542e9e['ids']);if(!_0x21189a['length'])return null;if(_0x20af93==="movie"||_0x4cb2f9==null)return _0x21189a[0x0];const _0x59e568=Number(_0x4cb2f9);return _0x21189a["find"](_0x84cfa4=>_0x84cfa4["slug"]===_0x59e568)||null;}function extractMegaPlay(_0x122ebf,_0x4f95d5,_0x39d6a5){return __async(this,null,function*(){const _0x3adb51=_0xf68e;try{const _0x4e91f8=yield fetchSafe(_0x122ebf,{'headers':__spreadProps(__spreadValues({},HEADERS),{'X-Requested-With':'XMLHttpRequest','Referer':'https://megaplay.buzz/'})});if(!_0x4e91f8)return[];const _0x6d1a54=cheerio["load"](yield _0x4e91f8["text"]()),_0x5645d5=_0x6d1a54("#megaplay-player")["attr"]("data-id");if(!_0x5645d5)return[];const _0x1a0258=yield fetchJson("https://megaplay.buzz/stream/getSources?id="+_0x5645d5+"&id="+_0x5645d5,{'headers':__spreadProps(__spreadValues({},HEADERS),{'X-Requested-With':"XMLHttpRequest",'Referer':"https://megaplay.buzz/"})});if(!_0x1a0258||!_0x1a0258["sources"]||!_0x1a0258["sources"]["file"])return[];const _0x3b0f5b=(_0x1a0258['tracks']||[])['filter'](_0x461d13=>_0x461d13['kind']==='captions'||_0x461d13["kind"]==="subtitles")["map"](_0x284a1e=>({'label':_0x284a1e["label"]||"Unknown",'url':_0x284a1e["file"]}))["filter"](_0x3369a8=>_0x3369a8["url"]),_0x48a5ab=buildStreamLabels('MegaPlay',"1080p",_0x4f95d5,_0x39d6a5);return[makeStream(_0x48a5ab["name"],_0x48a5ab["title"],_0x1a0258["sources"]["file"],'1080p',{'Referer':"https://megaplay.buzz/",'Origin':"https://megaplay.buzz",'User-Agent':HEADERS['User-Agent']},_0x3b0f5b["length"]>0x0?_0x3b0f5b:void 0x0)];}catch(_0x2ef7ac){return console['error']('['+PROVIDER_NAME+"] MegaPlay error: "+_0x2ef7ac['message']),[];}});}function extractZen(_0x5d78a6,_0x33d978,_0x56adb3){return __async(this,null,function*(){const _0x11d295=_0xf68e;try{const _0x37de36=yield fetchSafe(_0x5d78a6,{'headers':HEADERS});if(!_0x37de36)return[];const _0x2cde77=yield _0x37de36["text"](),_0x267dd3=_0x2cde77["match"](/video_b64:\s*"([^"]+)"/),_0x4990a6=_0x2cde77["match"](/enc_key_b64:\s*"([^"]+)"/),_0x1ad258=_0x2cde77["match"](/iv_b64:\s*"([^"]+)"/),_0x5f3fd8=_0x2cde77["match"](/subtitles:\s*"([^"]*)"/);if(!_0x267dd3||!_0x4990a6||!_0x1ad258)return[];const _0x4087e8=_0x267dd3[0x1],_0x5a3e9b=_0x4990a6[0x1],_0x12dba7=_0x1ad258[0x1],_0x2cbb74=CryptoJS["enc"]['Base64']["parse"](_0x5a3e9b),_0x514354=CryptoJS["enc"]["Base64"]['parse'](_0x12dba7),_0x1d3aa9=CryptoJS["enc"]["Base64"]['parse'](_0x4087e8),_0x13bc80=CryptoJS["AES"]["decrypt"]({'ciphertext':_0x1d3aa9},_0x2cbb74,{'iv':_0x514354,'mode':CryptoJS["mode"]["CBC"],'padding':CryptoJS["pad"]["Pkcs7"]}),_0x3e33ec=_0x13bc80["toString"](CryptoJS['enc']["Utf8"]);if(!_0x3e33ec)return[];let _0x40c735=[];if(_0x5f3fd8&&_0x5f3fd8[0x1])try{const _0xada49a=_0x5f3fd8[0x1]["replace"](/\\"/g,'\x22')["replace"](/\\\\\//g,'/')["replace"](/\\u([0-9a-fA-F]{4})/g,(_0x2973d5,_0x3a2a95)=>String["fromCharCode"](parseInt(_0x3a2a95,0x10))),_0x3930df=JSON["parse"](_0xada49a);Array['isArray'](_0x3930df)&&(_0x40c735=_0x3930df['filter'](_0x373e47=>_0x373e47["url"])['map'](_0x4d1eaa=>({'label':_0x4d1eaa["language"]||"Unknown",'url':_0x4d1eaa["url"]})));}catch(_0x58cabb){}const _0x486464=buildStreamLabels('Zen',"1080p",_0x33d978,_0x56adb3);return[makeStream(_0x486464["name"],_0x486464["title"],_0x3e33ec["trim"](),"1080p",{'Referer':"https://player.sgsgsgsr.site/",'Origin':"https://player.sgsgsgsr.site/"},_0x40c735['length']>0x0?_0x40c735:void 0x0)];}catch(_0x355be7){return console["error"]('['+PROVIDER_NAME+"] Zen error: "+_0x355be7["message"]),[];}});}function resolveServers(_0x579215,_0x5903f8,_0x26bd69){return __async(this,null,function*(){const _0x130670=_0xf68e;try{const _0x3c430d=yield fetchJson(MAIN_URL+"/ajax/server/list?servers="+encodeURIComponent(_0x579215),{'headers':AJAX_HEADERS});if(!_0x3c430d||_0x3c430d['status']!==0xc8)return[];const _0x2da6c9=cheerio["load"](_0x3c430d["result"]||''),_0x7d2569=[];_0x2da6c9("div.server-type")["each"]((_0x33d671,_0x30df53)=>{const _0x340340=_0x130670,_0xa6f7b9=_0x2da6c9(_0x30df53)['attr']("data-type"),_0x5b68e6=(_0x2da6c9(_0x30df53)["find"]("span")["first"]()["text"]()||'')["includes"]("H-Sub");if(!_0x5903f8['includes'](_0xa6f7b9))return;_0x2da6c9(_0x30df53)["find"]("div.server-list > div.server")["each"]((_0x2264aa,_0x3a6574)=>{const _0x146adb=_0x340340,_0xcde100=_0x2da6c9(_0x3a6574)['attr']("data-link-id");if(!_0xcde100)return;_0x7d2569["push"]({'dataId':_0xcde100,'sectionType':_0xa6f7b9,'isHardSub':_0x5b68e6});});});if(_0x7d2569["length"]===0x0)return[];const _0xf4e4b4=yield Promise["all"](_0x7d2569["map"](_0x426d55=>__async(this,null,function*(){const _0x4d4419=_0x130670;try{const _0x117348=yield fetchJson(MAIN_URL+"/ajax/server?get="+encodeURIComponent(_0x426d55['dataId']),{'headers':AJAX_HEADERS});if(!_0x117348||!_0x117348['result']||!_0x117348["result"]['url'])return[];const _0x14f09b=_0x117348["result"]["url"],_0x62a8e1=_0x426d55["sectionType"]==="dub"?"[Dub]":_0x426d55['isHardSub']?"[Hard Sub]":"[Sub]";if(/megaplay\.buzz/i['test'](_0x14f09b))return extractMegaPlay(_0x14f09b,_0x62a8e1,_0x26bd69);else{if(/player\.sgsgsgsr\.site|zencloudz\.cc/i['test'](_0x14f09b))return extractZen(_0x14f09b,_0x62a8e1,_0x26bd69);else{if(/vidwish\.live/i["test"](_0x14f09b))return extractMegaPlay(_0x14f09b,_0x62a8e1,_0x26bd69);}}return[];}catch(_0x565754){return[];}})));return dedupe(_0xf4e4b4["flat"]());}catch(_0x5828e0){return console["error"]('['+PROVIDER_NAME+"] Server resolve error: "+_0x5828e0["message"]),[];}});}function getStreams(_0x2132d3,_0x54bdd0,_0x355997,_0x33819d){return __async(this,null,function*(){const _0xde36f2=_0xf68e;try{console['log']('['+PROVIDER_NAME+']\x20Request:\x20ID='+_0x2132d3+'\x20Type='+_0x54bdd0+" S="+_0x355997+" E="+_0x33819d);if(_0x54bdd0!=='tv'&&_0x54bdd0!=="movie")return[];const _0xdc407f=yield getTMDBInfo(_0x2132d3,_0x54bdd0);if(!_0xdc407f||!_0xdc407f["title"])return console["log"]('['+PROVIDER_NAME+"] No TMDB data"),[];console['log']('['+PROVIDER_NAME+"] Resolved: \""+_0xdc407f['title']+"\" ("+(_0xdc407f["year"]||"N/A")+')');if(_0xdc407f["genres"]&&_0xdc407f["genres"]["length"]>0x0&&!_0xdc407f["genres"]['includes'](0x10))return console["log"]('['+PROVIDER_NAME+"] Not anime (genres: "+_0xdc407f["genres"]['join'](',')+"), rejecting"),[];const _0xe095c0=yield searchAllWish(_0xdc407f["title"],_0xdc407f["originalTitle"],_0xdc407f["year"],_0x355997);if(!_0xe095c0||!_0xe095c0["watchUrl"])return console["log"]('['+PROVIDER_NAME+"] No match on AllWish"),[];const _0x38038b=yield fetchHtml(_0xe095c0["watchUrl"]);if(!_0x38038b)return[];const _0x327624=_0x38038b('main\x20>\x20div.container')["attr"]("data-id");if(!_0x327624)return console['log']('['+PROVIDER_NAME+"] No show ID found"),[];const _0x1d6799=generateEpisodeVrf(_0x327624),_0x31fa2e=yield fetchJson(MAIN_URL+"/ajax/episode/list/"+_0x327624+"?vrf="+encodeURIComponent(_0x1d6799),{'headers':AJAX_HEADERS},EPISODE_LIST_TIMEOUT);if(!_0x31fa2e||_0x31fa2e['status']!==0xc8)return console['log']('['+PROVIDER_NAME+"] Episode list failed"),[];const _0x302b90=cheerio['load'](_0x31fa2e["result"]||''),_0x2b4615=_0x33819d!=null?Number(_0x33819d):null,_0x11a3f0=chooseEpisode(_0x302b90,_0x355997,_0x2b4615,_0x54bdd0);if(!_0x11a3f0)return console["log"]('['+PROVIDER_NAME+']\x20Episode\x20not\x20found\x20(looking\x20for\x20ep\x20'+_0x2b4615+')'),[];console["log"]('['+PROVIDER_NAME+"] Selected episode slug="+_0x11a3f0["slug"]+" ids="+_0x11a3f0['ids']["substring"](0x0,0x1e)+'...');const _0x662c6b=[];if(_0x11a3f0["hasSub"])_0x662c6b["push"]("sub");if(_0x11a3f0["hasDub"])_0x662c6b["push"]('dub');if(_0x662c6b["length"]===0x0)return[];const _0x2d95c7={'title':_0xdc407f["title"],'season':_0x355997,'episode':_0x33819d,'mediaType':_0x54bdd0},_0x33b2e0=yield resolveServers(_0x11a3f0['ids'],_0x662c6b,_0x2d95c7);console["log"]('['+PROVIDER_NAME+"] Returning "+_0x33b2e0['length']+" streams");const _0x5a2f28={'2160p':0x5,'4k':0x5,'1080p':0x3,'720p':0x2,'HD':0x1,'480p':0x1,'360p':0x0};return _0x33b2e0["sort"]((_0x2e9452,_0x2e6559)=>(_0x5a2f28[_0x2e6559['quality']]||0x0)-(_0x5a2f28[_0x2e9452["quality"]]||0x0));}catch(_0x4f8310){return console["error"]('['+PROVIDER_NAME+"] Fatal: "+_0x4f8310['message']),[];}});}typeof module!=="undefined"&&module["exports"]?module["exports"]={'getStreams':getStreams}:global["getStreams"]=getStreams;

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
  var PROVIDER = "allwish";
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
