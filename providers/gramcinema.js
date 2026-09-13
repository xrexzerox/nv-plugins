/*
 * nv-plugins gramcinema.js — FULLY DECODED port of the All-in-One-Nuvio provider (4.24.0 merge pass).
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
var _0x199d=function(){return "";};var _0x1c6b03=_0x199d;/*rotation removed*/;/*decoder removed*/function getToken(){var _0x4cdc62={_0xad2aa6:0x165,_0x2f06a2:0x14b};return new Promise(function(_0x2abbc7){var _0x7ff70f=_0x199d;try{if(typeof global!=="undefined"&&global["SCRAPER_SETTINGS"]&&global['SCRAPER_SETTINGS']['cinemaTvToken'])return console["log"]('[CinemaTV]\x20Using\x20token\x20from\x20global.SCRAPER_SETTINGS'),_0x2abbc7(String(global['SCRAPER_SETTINGS']['cinemaTvToken'])["trim"]());if(typeof window!=="undefined"&&window['SCRAPER_SETTINGS']&&window["SCRAPER_SETTINGS"]['cinemaTvToken'])return console['log']('[CinemaTV]\x20Using\x20token\x20from\x20window.SCRAPER_SETTINGS'),_0x2abbc7(String(window["SCRAPER_SETTINGS"]["cinemaTvToken"])['trim']());}catch(_0x4b7d49){console['error']("[CinemaTV] Error checking settings panel:",_0x4b7d49["message"]);}console['error']("[CinemaTV] No token found in settings! Please configure GramCinema settings."),_0x2abbc7('');});}function formatBytes(_0x3042d4){var _0x56ef83={_0x5009d7:0x124,_0x58f728:0x15a,_0x5b9229:0x14f},_0x2f89b1=_0x199d;if(!_0x3042d4||_0x3042d4==0x0)return'Unknown';var _0x13949c=0x400,_0x54d5f7=['Bytes','KB','MB','GB','TB'],_0x3ae674=Math["floor"](Math["log"](_0x3042d4)/Math['log'](_0x13949c));return parseFloat((_0x3042d4/Math['pow'](_0x13949c,_0x3ae674))["toFixed"](0x2))+'\x20'+_0x54d5f7[_0x3ae674];}/*string-table removed*/function fetchJson(_0x1aa0f4,_0x3e7692){var _0x47b830={_0x5a66e7:0x175},_0xd24dd5={_0xd421a9:0x160},_0x4f1a68=_0x199d;return console['log']('[CinemaTV]\x20Fetching:\x20'+_0x1aa0f4),__nvFetch(_0x1aa0f4,_0x3e7692||{})['then'](function(_0x1d8111){var _0x5e8072=_0x199d;if(!_0x1d8111['ok'])throw new Error("HTTP "+_0x1d8111['status']);return _0x1d8111['json']();})["catch"](function(_0x47bbc0){var _0x40b7f8=_0x4f1a68;console["error"]("[CinemaTV] Fetch Failed: "+_0x47bbc0["message"]);throw _0x47bbc0;});}function makeStream(_0x34124b,_0x57f14b,_0x4c8df1,_0x4cdc1a){var _0x3e8153={_0x247a8e:0x14d,_0x1e782a:0x12f,_0x8d8ed5:0x13a,_0x3215f9:0x156,_0x17719d:0x137,_0xa1fbaf:0x12c,_0x308548:0x15b,_0x1b72bb:0x129,_0x4befac:0x13c,_0x2aaa3e:0x158,_0x309be3:0x13f,_0x45a91a:0x16c,_0x36f88e:0x13e,_0x47122f:0x139,_0x22944d:0x13e,_0x497d40:0x16a,_0x3db50f:0x130,_0x4a9d87:0x145,_0x27176c:0x129,_0x350162:0x129,_0x38b552:0x145,_0xa4810d:0x133,_0x1d1a8f:0x126,_0x3105b7:0x147},_0x529be3={_0x22fe6c:0x120},_0x4709e2=_0x199d,_0x27b0fb='';try{_0x27b0fb=decodeURIComponent(_0x57f14b)+'\x20'+_0x34124b;}catch(_0x3183f7){_0x27b0fb=_0x57f14b+'\x20'+_0x34124b;}var _0x378a0c=_0x27b0fb["toLowerCase"](),_0x7a7df6=/[\s\.\-\+\[\]_\(\)\|]+/g,_0x308a7d=_0x378a0c['replace'](_0x7a7df6,''),_0x3dd72a="1080P";if(/2160p|4k|uhd/i['test'](_0x378a0c))_0x3dd72a='2160P';else{if(/1080p/i['test'](_0x378a0c))_0x3dd72a='1080P';else{if(/720p/i['test'](_0x378a0c))_0x3dd72a='720P';else{if(/480p/i["test"](_0x378a0c))_0x3dd72a='480P';}}}var _0x528b99='Dual-Audio',_0x4ca506=/hindi/i['test'](_0x378a0c),_0xbb4795=/(english|eng)/i["test"](_0x378a0c),_0x35ebd9=/tamil/i['test'](_0x378a0c),_0x4034d6=/telugu/i['test'](_0x378a0c),_0xdb86ad=0x0;if(_0x4ca506)_0xdb86ad++;if(_0xbb4795)_0xdb86ad++;if(_0x35ebd9)_0xdb86ad++;if(_0x4034d6)_0xdb86ad++;if(/(multi|multi\-audio|multi\.audio)/i['test'](_0x378a0c)||_0xdb86ad>=0x3)_0x528b99='Multi-Audio';else{if(/(dual|dual\-audio|dual\.audio|dubbed)/i['test'](_0x378a0c)||_0xdb86ad===0x2)_0x528b99="Dual-Audio";else{if(_0xdb86ad===0x1){if(_0x4ca506)_0x528b99='Hindi';else{if(_0x35ebd9)_0x528b99="Tamil";else{if(_0x4034d6)_0x528b99='Telugu';else{if(_0xbb4795)_0x528b99="English";}}}}}}var _0x170071=_0x34124b["replace"](/\.(mkv|mp4|avi)$/i,'')['replace'](/\./g,'\x20'),_0x31079d='',_0x56ddc6=_0x170071["match"](/\b(S\d{1,2}\s*E\d{1,2})\b/i);if(_0x56ddc6){_0x31079d='\x20|\x20'+_0x56ddc6[0x1]['toUpperCase']()["replace"](/\s+/g,'');var _0x285c14=_0x170071["toLowerCase"]()['indexOf'](_0x56ddc6[0x0]['toLowerCase']());if(_0x285c14>0x0)_0x170071=_0x170071['substring'](0x0,_0x285c14);}var _0x1b557b='',_0x4e4e43=_0x170071['match'](/\b(19|20)\d{2}\b/);if(_0x4e4e43){_0x1b557b=_0x4e4e43[0x0];var _0xe93330=_0x170071['indexOf'](_0x1b557b);if(_0xe93330>0x0)_0x170071=_0x170071["substring"](0x0,_0xe93330);}_0x170071=_0x170071['replace'](/AMZN|WEB\-DL|WEB|DL|AVC|x264|x265|HEVC|STAN|WEBRip|SDR|10bit|iTunes|HQ|HDRip|BluRay|6CH|Dual|Audio|Hindi|English|Tamil|Telugu|720p|1080p|2160p|4k/gi,'')["replace"](/[-_()\[\]|]/g,'\x20')['replace'](/\s+/g,'\x20')["trim"](),_0x170071=_0x170071["replace"](/\b\w/g,function(_0x2d6e4d){var _0x487b4c=_0x4709e2;return _0x2d6e4d["toUpperCase"]();});var _0x5c4d42=_0x3dd72a==="2160P"?'🌟':'💎',_0x4d7682=_0x5c4d42+'\x20'+_0x3dd72a+'\x20|\x20🌍\x20'+_0x528b99+" | 💾 "+(_0x4cdc1a||'N/A'),_0x329b68='',_0x56a9ad=![];if(/hdr10\+|hdr10p/i['test'](_0x378a0c))_0x329b68="HDR10+",_0x56a9ad=!![];else{if(/hdr10/i["test"](_0x378a0c))_0x329b68="HDR10",_0x56a9ad=!![];else/hdr(?!ip)/i['test'](_0x378a0c)&&(_0x329b68="HDR",_0x56a9ad=!![]);}var _0x3eaeb9=/10bit/i["test"](_0x378a0c)?"🔆 10Bit":'',_0x545fb3=/(dv|dolby\s*vision|dolbyvision)/i["test"](_0x378a0c)?'🕵️‍♀️\x20DV':'',_0x51a343=/bluray/i['test'](_0x378a0c),_0x40f45b="x264";if(/(hevc|x265|265|h265)/i["test"](_0x378a0c))_0x40f45b='HEVC\x20x265';else{if(/(x264|264|h264)/i['test'](_0x378a0c))_0x40f45b='x264';else _0x3dd72a==='2160P'&&(_0x40f45b="HEVC x265");}var _0x236a43=[];if(_0x329b68)_0x236a43["push"](_0x329b68);if(_0x3eaeb9)_0x236a43["push"](_0x3eaeb9);if(_0x51a343)_0x236a43['push']('📀\x20BluRay');if(_0x545fb3)_0x236a43['push'](_0x545fb3);var _0x362c42='';if(_0x236a43["length"]>0x0){var _0x96895=_0x56a9ad?'⚡\x20':'';_0x362c42=_0x96895+_0x236a43["join"](" • ")+" | 🎥 "+_0x40f45b;}else _0x362c42='🎥\x20'+_0x40f45b;var _0x2d9bd4='🎞️\x20MKV';if(/\bmp4\b/i["test"](_0x378a0c))_0x2d9bd4="🎞️ MP4";var _0x3641e3='AAC\x205.1',_0x3ed155=/atmos/i['test'](_0x378a0c);if(_0x308a7d["indexOf"]('ddp51')!==-0x1||_0x308a7d['indexOf']('eac351')!==-0x1||_0x308a7d['indexOf']('dd51')!==-0x1)_0x3641e3='DDP\x205.1';else{if(_0x308a7d["indexOf"]('truehd71')!==-0x1)_0x3641e3="TrueHD 7.1";else{if(_0x308a7d["indexOf"]('aac71')!==-0x1)_0x3641e3="AAC 7.1";else(_0x308a7d["indexOf"]("aac20")!==-0x1||_0x308a7d['indexOf']("aac")!==-0x1)&&(_0x3641e3=/aac\s*5\.1/i['test'](_0x378a0c)?'AAC\x205.1':"AAC 2.0");}}(/ddp\s*5\s*1/i["test"](_0x378a0c)||/ddp5\.1/i['test'](_0x378a0c))&&(_0x3641e3="DDP 5.1");var _0xf1a207=_0x3ed155?'\x20•\x20🔊\x20Atmos':'',_0xc3d31c=_0x2d9bd4+'\x20|\x20🎧\x20'+_0x3641e3+_0xf1a207+'\x20|',_0xaf9143="WEB-DL";if(_0x51a343)_0xaf9143='BluRay';else{if(/hdrip/i["test"](_0x378a0c))_0xaf9143='HDRip';else{if(/webrip/i["test"](_0x378a0c))_0xaf9143='WEB-Rip';else/(webdl|web\-dl|itunes|amzn)/i["test"](_0x378a0c)&&(_0xaf9143="WEB-DL");}}var _0x12c433='CDN1',_0x3bf275=_0x57f14b['match'](/cdn(\d+)/i);if(_0x3bf275)_0x12c433='CDN'+_0x3bf275[0x1];else _0x57f14b['indexOf']('tga-hd')!==-0x1&&(_0x12c433="TGA-CDN");var _0x42a396=/imax/i['test'](_0x378a0c)?" | 👁️ iMAX":'',_0x3ad39f="🔗 GramCinema • "+_0x12c433+'\x20|\x20☁️\x20'+_0xaf9143+_0x42a396,_0x644a15='GramCinema\x20|\x20'+_0x3dd72a+" | "+_0x528b99,_0x176aa3='🎬\x20'+_0x170071+(_0x1b557b?'\x20-\x20('+_0x1b557b+')':'')+_0x31079d+'\x0a'+_0x4d7682+'\x0a'+_0x362c42+'\x0a'+_0xc3d31c+'\x0a'+_0x3ad39f;return{'name':_0x644a15,'title':_0x176aa3,'size':_0x176aa3,'url':_0x57f14b["replace"](/ /g,"%20"),'behaviorHints':{'notWebReady':!![],'proxyHeaders':{'request':{'Referer':_0x4c8df1||"https://bollywood.eu.org/"}}}};}function getStreams(_0x238989,_0x2242d2,_0x251aec,_0x1ed877){var _0x457f02={_0x1eca4f:0x15c},_0x20754b={_0x5cd093:0x173,_0x13f0c7:0x161},_0x2aa917={_0x587582:0x12b,_0x154a3c:0x138},_0x459333={_0x45acde:0x14c},_0x353120=_0x199d;console['log']('[Hashhackers]\x20getStreams:\x20'+_0x238989+'\x20|\x20Type:\x20'+_0x2242d2);if(_0x2242d2!=="movie"&&_0x2242d2!=='tv'&&_0x2242d2!=='series')return Promise["resolve"]([]);return getToken()['then'](function(_0x49c4c6){var _0x4bc7b0=_0x353120;if(!_0x49c4c6)return console['error']("[CinemaTV] No token available, aborting getStreams"),[];var _0x4af95b=_0x2242d2==='tv'||_0x2242d2==="series",_0x5def22=String(_0x238989)['indexOf']('tt')===0x0,_0x3aae38=_0x5def22?'https://api.themoviedb.org/3/find/'+_0x238989+'?api_key=d131017ccc6e5462a81c9304d21476de&external_source=imdb_id&language=en-US':'https://api.themoviedb.org/3/'+(_0x4af95b?'tv':'movie')+'/'+_0x238989+'?api_key=d131017ccc6e5462a81c9304d21476de&language=en-US';return fetchJson(_0x3aae38)["then"](function(_0x43dba6){var _0x4cacab={_0x3a98ba:0x174,_0x3f5272:0x168,_0x24ee63:0x127},_0x2539d0={_0x3e2fa7:0x146},_0x1f96cd={_0x18e031:0x150},_0x5942fa=_0x4bc7b0,_0x2d04fa;_0x5def22?_0x2d04fa=_0x4af95b?_0x43dba6["tv_results"]&&_0x43dba6['tv_results'][0x0]:_0x43dba6['movie_results']&&_0x43dba6['movie_results'][0x0]:_0x2d04fa=_0x43dba6;if(!_0x2d04fa)return[];var _0x21dfd6=_0x4af95b?_0x2d04fa["name"]:_0x2d04fa["title"],_0x29355f=_0x4af95b?_0x2d04fa['first_air_date']:_0x2d04fa['release_date'],_0x392c10=_0x29355f?_0x29355f["split"]('-')[0x0]:'',_0x342cb4=_0x21dfd6+'\x20'+_0x392c10;if(_0x4af95b&&_0x251aec!==void 0x0&&_0x1ed877!==void 0x0){var _0x26c796=_0x251aec<0xa?'0'+_0x251aec:''+_0x251aec,_0x2746bf=_0x1ed877<0xa?'0'+_0x1ed877:''+_0x1ed877;_0x342cb4+='\x20S'+_0x26c796+'E'+_0x2746bf;}var _0x2e80ad=encodeURIComponent(_0x342cb4['trim']()),_0x24f8fa={'User-Agent':'Mozilla/5.0\x20(iPhone;\x20CPU\x20iPhone\x20OS\x2018_7\x20like\x20Mac\x20OS\x20X)\x20AppleWebKit/605.1.15\x20(KHTML,\x20like\x20Gecko)\x20Version/26.0.1\x20Mobile/15E148\x20Safari/604.1','Accept':"*/*",'Authorization':"Bearer "+_0x49c4c6,'Origin':'https://bollywood.eu.org','Referer':'https://bollywood.eu.org/'},_0x456e3b="https://tga-hd.api.hashhackers.com/mix_media_files/search?q="+_0x2e80ad+'&page=1';return fetchJson(_0x456e3b,{'headers':_0x24f8fa})["then"](function(_0x1dda15){var _0x47836c={_0x373a1a:0x15d},_0x4647f4={_0x12856f:0x15d},_0x388a20={_0x393800:0x141,_0x58aa35:0x15d},_0x465356=_0x5942fa,_0x38af0a=_0x1dda15['files']||[],_0x58562e=_0x38af0a['filter'](function(_0x17a79e){var _0xb7a4d0=_0x199d,_0x3ef857=_0x17a79e["file_name"]['toLowerCase']()['trim']();return/\.(mkv|mp4)$/["test"](_0x3ef857);});if(_0x58562e["length"]===0x0)return[];var _0x4a9dda=_0x58562e["slice"](0x0,0x6),_0x2bcd51=_0x4a9dda["map"](function(_0x2f4bf1){var _0x2e2c63={_0x4edc12:0x14e},_0x3a1ceb=_0x465356;return fetchJson("https://tga-hd.api.hashhackers.com/genLink?type=mix_media&id="+_0x2f4bf1['id'],{'headers':_0x24f8fa})['then'](function(_0x168f49){var _0x2a43e2=_0x3a1ceb;if(_0x168f49['success']&&_0x168f49['url']){var _0x4518d4=formatBytes(parseInt(_0x2f4bf1['file_size']));return makeStream(_0x2f4bf1['file_name'],_0x168f49["url"],'https://bollywood.eu.org/',_0x4518d4);}return null;})['catch'](function(){return null;});});return Promise["all"](_0x2bcd51)["then"](function(_0x206faa){var _0x2daad1=_0x465356,_0x12d18d=_0x206faa["filter"](function(_0x4f9c86){return _0x4f9c86!==null;});return _0x12d18d['forEach'](function(_0x1d68ed){var _0x50c626=_0x2daad1,_0x51cd84=(_0x1d68ed["title"]||'')['toLowerCase']();if(_0x51cd84['indexOf']("2160p")!==-0x1||_0x51cd84['indexOf']('4k')!==-0x1)_0x1d68ed['_resWeight']=0x4;else{if(_0x51cd84["indexOf"]('1080p')!==-0x1)_0x1d68ed["_resWeight"]=0x3;else{if(_0x51cd84["indexOf"]('720p')!==-0x1)_0x1d68ed['_resWeight']=0x2;else _0x1d68ed['_resWeight']=0x1;}}}),_0x12d18d["sort"](function(_0x43e32a,_0x32b70a){var _0x38ea33=_0x2daad1;return _0x32b70a['_resWeight']-_0x43e32a["_resWeight"];}),_0x12d18d["forEach"](function(_0x8e9bb2){var _0x2f865d=_0x2daad1;delete _0x8e9bb2["_resWeight"];}),_0x12d18d;});});})['catch'](function(_0x141460){var _0x3a326d=_0x4bc7b0;return console["error"]("[CinemaTV] Error: "+_0x141460["message"]),[];});});}function onSettings(){var _0x5ddc9e={_0xf32243:0x157,_0x5625af:0x140},_0xa0e3b8=_0x199d;return Promise["resolve"]([{'type':"header",'label':'GramCinema\x20Configuration'},{'type':"text",'isPassword':!![],'key':"cinemaTvToken",'label':'CinemaTV\x20Token','placeholder':'Enter\x20token\x20here...','description':'Provide\x20the\x20authorization\x20token\x20required\x20to\x20access\x20CinemaTV\x20links.'}]);}module["exports"]={'getStreams':getStreams,'onSettings':onSettings};

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
  var PROVIDER = "gramcinema";
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
