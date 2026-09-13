/*
 * nv-plugins showbox.js — FULLY DECODED port of the All-in-One-Nuvio provider (4.24.0 merge pass).
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
var _0x5e70=function(){return "";};const _0x3cd342=_0x5e70;/*rotation removed*/;var __async=(_0x1e07e2,_0x2cc067,_0x1be933)=>{const _0x15d55a={_0x1460ff:0x1c3};return new Promise((_0x2e56f2,_0x7c1fa0)=>{const _0x550975=_0x5e70;var _0x2c1987=_0x55af57=>{const _0x3bf95d=_0x5e70;try{_0x51e2ae(_0x1be933["next"](_0x55af57));}catch(_0x198de1){_0x7c1fa0(_0x198de1);}},_0x440915=_0x581606=>{const _0x45671c=_0x5e70;try{_0x51e2ae(_0x1be933["throw"](_0x581606));}catch(_0x16b483){_0x7c1fa0(_0x16b483);}},_0x51e2ae=_0x46bc26=>_0x46bc26['done']?_0x2e56f2(_0x46bc26["value"]):Promise["resolve"](_0x46bc26['value'])['then'](_0x2c1987,_0x440915);_0x51e2ae((_0x1be933=_0x1be933["apply"](_0x1e07e2,_0x2cc067))["next"]());});},cheerio=__nvRequire('cheerio-without-node-native'),CryptoJS=__nvRequire('crypto-js'),TMDB_API_KEY='439c478a771f35c05022f9feabcca01c',TMDB_BASE_URL='https://api.themoviedb.org/3',DEFAULT_API_BASE="https://id-mapping-api-showbox-proxy.hf.space/api/media",WORKING_HEADERS={'User-Agent':"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",'Accept':"application/json",'Accept-Language':"en-US,en;q=0.9",'Content-Type':'application/json'};function getQualityEmoji(_0x2e4b3c){const _0x1525cd={_0x1350d2:0x1bb,_0x98c864:0x1bf},_0x55b5fa=_0x3cd342;switch(_0x2e4b3c){case "Original":return'✨';case'4K':return'🌟';case "1440p":return'⚡';case "1080p":return'🔥';case "720p":return'💎';case'480p':return "🗜️";default:return'📼';}}/*string-table removed*/function getSubheadingQualityLabel(_0xc5b276,_0x4a266c){const _0x2d477c=_0x3cd342;if(_0xc5b276==="Original"&&_0x4a266c){const _0x22e515=_0x4a266c['match'](/(\d{3,4})[pP]/);if(_0x22e515)return'✨\x20'+_0x22e515[0x1]+'p';return'✨\x20Original';}const _0x84cace=getQualityEmoji(_0xc5b276);return _0x84cace+'\x20'+_0xc5b276;}function getFileContainerFormat(_0x4e9021){const _0x4bb180={_0x18e360:0x236,_0x152c87:0x1e0,_0x491a15:0x21c,_0x4b4322:0x1e3},_0x2519a4=_0x3cd342;if(!_0x4e9021)return "📦 MKV";const _0x1e0105=_0x4e9021['toUpperCase']();if(_0x1e0105['includes'](".MP4")||_0x1e0105["includes"]("MP4"))return "📦 MP4";if(_0x1e0105['includes']('.AVI')||_0x1e0105["includes"]("AVI"))return'📦\x20AVI';if(_0x1e0105["includes"](".TS")||_0x1e0105['includes']("M2TS"))return "📦 TS";return "📦 MKV";}/*decoder removed*/function parseFilenameMetadata(_0x169c64){const _0x458491={_0x5c8185:0x1fa,_0x236d40:0x21c,_0x3c5c49:0x242,_0x359e1c:0x217,_0x4fec7c:0x21c,_0xce37e4:0x1f1,_0x2931df:0x21f,_0x3e0742:0x1ca,_0xc05a9c:0x1b7,_0x2dfda1:0x21c,_0x18a7fb:0x229,_0x4543be:0x21c,_0x467dba:0x1d1,_0x506020:0x1e4,_0x3860de:0x1cb,_0x58c1ec:0x21c,_0x5d5a7a:0x21c,_0x4cd3f5:0x1c2,_0x28a59b:0x232,_0x2466bc:0x1b0},_0x54f20c=_0x3cd342;if(!_0x169c64)return{'line3':'🎞️\x20H.264\x20|\x20📺\x20SDR\x20|\x20🎧\x20Stereo','source':"📥 WEB-DL"};const _0x2fa54d=_0x169c64["toUpperCase"]();let _0xc8ef74='';if(_0x2fa54d['includes']("HEVC")||_0x2fa54d["includes"]("H265")||_0x2fa54d["includes"]("H.265")||_0x2fa54d["includes"]('X265'))_0xc8ef74="🎞️ HEVC";else{if(_0x2fa54d["includes"]('AVC')||_0x2fa54d['includes']('H264')||_0x2fa54d['includes']('H.264')||_0x2fa54d['includes']("X264"))_0xc8ef74='🎞️\x20H.264';else _0x2fa54d["includes"]('AV1')&&(_0xc8ef74="🎞️ AV1");}let _0x3a214d='';if(_0x2fa54d['includes']('DV')||_0x2fa54d['includes']("DOLBY VISION")||_0x2fa54d["includes"]('DOLBYVISION'))_0x3a214d="🌈 DV";else{if(_0x2fa54d["includes"]("HDR10+"))_0x3a214d="✨ HDR10+";else{if(_0x2fa54d["includes"]("HDR10"))_0x3a214d='✨\x20HDR10';else{if(_0x2fa54d['includes']("HDR"))_0x3a214d="✨ HDR";else _0x2fa54d['includes']("SDR")&&(_0x3a214d="📺 SDR");}}}let _0x124e61='';if(_0x2fa54d['includes']('ATMOS'))_0x124e61="🔊 Atmos";else{if(_0x2fa54d["includes"]("DDP5.1")||_0x2fa54d["includes"]('DD+5.1')||_0x2fa54d['includes']('EAC3\x205.1'))_0x124e61='🎧\x20DDP\x205.1';else{if(_0x2fa54d["includes"]("DDP7.1")||_0x2fa54d['includes']("DD+7.1")||_0x2fa54d["includes"]('EAC3\x207.1'))_0x124e61='🎧\x20DDP\x207.1';else{if(_0x2fa54d['includes']('DD5.1')||_0x2fa54d['includes']("AC3 5.1")||_0x2fa54d["includes"]('5.1'))_0x124e61="🎧 DD 5.1";else{if(_0x2fa54d["includes"]('AAC'))_0x124e61='🎧\x20AAC';else _0x2fa54d["includes"]("DTS")&&(_0x124e61="🎧 DTS");}}}}const _0x36ab00=[_0xc8ef74,_0x3a214d,_0x124e61]['filter'](Boolean),_0x6a1bec=_0x36ab00['length']>0x0?_0x36ab00["join"]('\x20|\x20'):"🎞️ H.264 | 📺 SDR | 🎧 Stereo";let _0x330116='📥\x20WEB-DL';if(_0x2fa54d['includes']('BLURAY')||_0x2fa54d["includes"]('BLU-RAY')||_0x2fa54d["includes"]('BDREMUX'))_0x330116='💿\x20BluRay';else{if(_0x2fa54d["includes"]("WEBRIP")||_0x2fa54d["includes"]('WEB-RIP'))_0x330116="🌐 WEB-Rip";else{if(_0x2fa54d['includes']('TELESYNC')||_0x2fa54d['includes']('TS')||_0x2fa54d['includes']("CAM"))_0x330116='📺\x20TELESYNC';else{if(_0x2fa54d["includes"]("HDTV"))_0x330116="📺 HDTV";else(_0x2fa54d["includes"]("WEBDL")||_0x2fa54d['includes']('WEB-DL'))&&(_0x330116="📥 WEB-DL");}}}return{'line3':_0x6a1bec,'source':_0x330116};}function parseSingleToken(_0x9c54e1){const _0x263893={_0x516a1d:0x1d0,_0x3b89d8:0x1dc,_0x471d03:0x20b,_0x254e3e:0x1c8,_0x1fe913:0x1da,_0x1ad0b2:0x1cd,_0x1555d9:0x20c},_0x422d01=_0x3cd342;if(!_0x9c54e1)return'';if(_0x9c54e1["startsWith"]('eyJ')){console['log']("[ShowBox] Base64 JWT/JSON token detected. Attempting automatic decryption...");try{const _0xd3e108=CryptoJS['enc']["Base64"]['parse'](_0x9c54e1),_0x4e7e6c=_0xd3e108['toString'](CryptoJS["enc"]["Utf8"]),_0x3928dd=JSON['parse'](_0x4e7e6c);if(_0x3928dd&&_0x3928dd["encrypt_data"]){const _0x541660='wEiphTn!',_0x1e7ff6="123d6cedf626dy54233aa1w6",_0x1b80a3=CryptoJS['enc']["Utf8"]["parse"](_0x1e7ff6),_0x5c6b74=CryptoJS['enc']['Utf8']['parse'](_0x541660),_0x38f31a=CryptoJS["TripleDES"]["decrypt"](_0x3928dd["encrypt_data"],_0x1b80a3,{'iv':_0x5c6b74,'mode':CryptoJS['mode']['CBC'],'padding':CryptoJS['pad']["Pkcs7"]}),_0x28a259=_0x38f31a["toString"](CryptoJS['enc']["Utf8"]),_0x6ece35=JSON["parse"](_0x28a259);if(_0x6ece35&&_0x6ece35['uid'])return String(_0x6ece35["uid"]);}}catch(_0x261626){console["error"]("[ShowBox] Failed to decrypt base64 uiToken:",_0x261626["message"]);}}return _0x9c54e1;}function getAllUiTokens(){const _0x1a5ae7={_0x347621:0x1c9,_0x7df1c8:0x1b5},_0x19fae6=_0x3cd342;try{let _0xac82dc='';if(typeof global!=='undefined'&&global['SCRAPER_SETTINGS']&&global['SCRAPER_SETTINGS']['uiToken'])_0xac82dc=String(global["SCRAPER_SETTINGS"]["uiToken"])["trim"]();else typeof window!=='undefined'&&window["SCRAPER_SETTINGS"]&&window["SCRAPER_SETTINGS"]['uiToken']&&(_0xac82dc=String(window['SCRAPER_SETTINGS']["uiToken"])['trim']());if(!_0xac82dc)return[];return _0xac82dc["split"](',')['map'](_0x1ade7c=>_0x1ade7c["trim"]())['filter'](Boolean);}catch(_0x45b1df){return[];}}function getOssGroup(){const _0x6a560c={_0x46e76f:0x1b5},_0x5d7c83=_0x3cd342;try{if(typeof global!=='undefined'&&global['SCRAPER_SETTINGS']&&global["SCRAPER_SETTINGS"]["ossGroup"])return String(global['SCRAPER_SETTINGS']["ossGroup"]);if(typeof window!=='undefined'&&window['SCRAPER_SETTINGS']&&window['SCRAPER_SETTINGS']['ossGroup'])return String(window["SCRAPER_SETTINGS"]['ossGroup']);}catch(_0x220982){}return null;}function getApiBase(){const _0x11724d={_0x29fa79:0x1b5,_0x41ddb0:0x237},_0x5741fd=_0x3cd342;try{if(typeof global!=="undefined"&&global['SCRAPER_SETTINGS']&&global['SCRAPER_SETTINGS']['apiBase'])return String(global["SCRAPER_SETTINGS"]["apiBase"]);if(typeof window!=='undefined'&&window['SCRAPER_SETTINGS']&&window['SCRAPER_SETTINGS']["apiBase"])return String(window['SCRAPER_SETTINGS']["apiBase"]);}catch(_0x4cea13){}return DEFAULT_API_BASE;}function getQualityFromName(_0x2d088c){const _0x556b7c={_0x4a2127:0x1fa,_0x5192f2:0x1d9,_0x5e5600:0x235,_0x336458:0x1f7,_0x35f7e1:0x1ad,_0x136740:0x201,_0x1de60c:0x1cf,_0x4be47b:0x1ec},_0x184f07=_0x3cd342;if(!_0x2d088c)return'Unknown';const _0x7bee4=_0x2d088c["toUpperCase"]();if(_0x7bee4==="ORG"||_0x7bee4==='ORIGINAL')return "Original";if(_0x7bee4==='4K'||_0x7bee4==="2160P")return'4K';if(_0x7bee4==='1440P'||_0x7bee4==='2K')return "1440p";if(_0x7bee4==="1080P"||_0x7bee4==="FHD")return "1080p";if(_0x7bee4==='720P'||_0x7bee4==='HD')return'720p';if(_0x7bee4==="480P"||_0x7bee4==='SD')return "480p";if(_0x7bee4==='360P')return "360p";if(_0x7bee4==='240P')return'240p';const _0x342995=_0x2d088c["match"](/(\d{3,4})[pP]?/);if(_0x342995){const _0x592d82=parseInt(_0x342995[0x1]);if(_0x592d82>=0x870)return'4K';if(_0x592d82>=0x5a0)return'1440p';if(_0x592d82>=0x438)return "1080p";if(_0x592d82>=0x2d0)return "720p";if(_0x592d82>=0x1e0)return "480p";if(_0x592d82>=0x168)return "360p";return'240p';}return'Unknown';}function formatFileSize(_0x4a4f7b){const _0x4bf322=_0x3cd342;if(!_0x4a4f7b)return'Unknown\x20Size';if(typeof _0x4a4f7b==="string"&&(_0x4a4f7b['includes']('GB')||_0x4a4f7b['includes']('MB')||_0x4a4f7b["includes"]('KB')))return _0x4a4f7b;if(typeof _0x4a4f7b==="number"){const _0x25425b=_0x4a4f7b/(0x400*0x400*0x400);if(_0x25425b>=0x1)return _0x25425b['toFixed'](0x2)+" GB";const _0x429eca=_0x4a4f7b/(0x400*0x400);return _0x429eca["toFixed"](0x2)+'\x20MB';}return _0x4a4f7b;}function getTMDBDetails(_0x438cbb,_0x4b3182){const _0x73df2a={_0x8c3f0a:0x20a,_0x5b7b89:0x1ac,_0x6c8980:0x1c4,_0x366794:0x1c7};return __async(this,null,function*(){const _0x56988e=_0x5e70,_0x49c0f8=_0x4b3182==='tv'?'tv':'movie',_0x1f8121=TMDB_BASE_URL+'/'+_0x49c0f8+'/'+_0x438cbb+'?api_key='+TMDB_API_KEY;try{const _0x19c466=yield __nvFetch(_0x1f8121);if(!_0x19c466['ok'])throw new Error("HTTP "+_0x19c466["status"]);const _0x4cf314=yield _0x19c466['json'](),_0x5ba675=_0x4b3182==='tv'?_0x4cf314["name"]:_0x4cf314["title"],_0x46efd9=_0x4b3182==='tv'?_0x4cf314['first_air_date']:_0x4cf314["release_date"],_0xf5bf18=_0x46efd9?parseInt(_0x46efd9["split"]('-')[0x0]):null;return{'title':_0x5ba675,'year':_0xf5bf18};}catch(_0x3cb522){return console['log']('[ShowBox]\x20TMDB\x20details\x20query\x20failed:\x20'+_0x3cb522["message"]),{'title':'TMDB\x20ID\x20'+_0x438cbb,'year':null};}});}function extractFebBoxShare(_0x521d70,_0x393e98,_0x56a732,_0x4411af,_0x4a1c83,_0x317524,_0x4e45a6){const _0x405180={_0x2d87e4:0x1b6,_0xce3dcd:0x1d8,_0x5c6614:0x22e,_0x400ec7:0x234,_0xc666e9:0x246,_0x3dd312:0x23d,_0x2098e2:0x1c1,_0x15711a:0x223,_0x3f5810:0x1d8,_0x4f13ac:0x1d8,_0x5221a0:0x1e5,_0x115b4b:0x24a,_0x236022:0x1d0,_0x144393:0x207,_0x24ddbb:0x238,_0x318373:0x200,_0x2d5c05:0x1a5};return __async(this,null,function*(){const _0x270de1={_0x6c0e8c:0x1af,_0x4c2311:0x1fd,_0x17b548:0x224,_0x5df043:0x239,_0x111750:0x1f8,_0x4d5fad:0x243,_0x98f4e5:0x203,_0x25787e:0x1c6},_0x47e7f2=_0x5e70,_0x2823e2=[];try{const _0x214951=_0x393e98==='tv'?0x2:0x1,_0x18780d="https://www.febbox.com/mbp/to_share_page?box_type="+_0x214951+"&mid="+_0x521d70+'&json=1',_0x5f0859=yield __nvFetch(_0x18780d)["then"](_0x5679e8=>_0x5679e8["json"]());if(!_0x5f0859||_0x5f0859["code"]!==0x1||!_0x5f0859["data"])return[];const _0x16f024=_0x5f0859['data']["share_link"]||_0x5f0859["data"]["shareLink"];if(!_0x16f024)return[];const _0x3d60d7=_0x16f024["split"]('/')["pop"](),_0x110653='https://www.febbox.com/file/file_share_list?share_key='+_0x3d60d7,_0xbe1eb1=yield __nvFetch(_0x110653,{'headers':{'Accept-Language':'en'}})["then"](_0x37fb83=>_0x37fb83["json"]());if(!_0xbe1eb1||_0xbe1eb1["code"]!==0x1||!_0xbe1eb1['data']||!_0xbe1eb1["data"]["file_list"])return[];let _0x25468f=[];if(_0x393e98==="movie")_0x25468f=_0xbe1eb1['data']["file_list"];else{const _0x51aab6="season "+_0x56a732,_0x5d66a0=_0xbe1eb1["data"]["file_list"]["find"](_0x1b3fa1=>_0x1b3fa1["file_name"]&&_0x1b3fa1["file_name"]["toLowerCase"]()===_0x51aab6);if(!_0x5d66a0)return[];const _0x1964de='https://www.febbox.com/file/file_share_list?share_key='+_0x3d60d7+"&parent_id="+_0x5d66a0["fid"]+'&page=1',_0x2209f6=yield __nvFetch(_0x1964de,{'headers':{'Accept-Language':'en'}})['then'](_0x131ab6=>_0x131ab6['json']());if(!_0x2209f6||_0x2209f6['code']!==0x1||!_0x2209f6['data']||!_0x2209f6["data"]['file_list'])return[];const _0x17fbb4=String(_0x56a732)["padStart"](0x2,'0'),_0x24a838=String(_0x4411af)['padStart'](0x2,'0');_0x25468f=_0x2209f6["data"]['file_list']["filter"](_0x37db69=>_0x37db69['file_name']&&(_0x37db69["file_name"]['toLowerCase']()['includes']('s'+_0x17fbb4+'e'+_0x24a838)||_0x37db69['file_name']["toLowerCase"]()["includes"]('s'+_0x56a732+'e'+_0x4411af)));}const _0x71004e={'Accept':"*/*",'Accept-Language':'en-US,en;q=0.8','Connection':'keep-alive','Range':'bytes=0-','Referer':"https://www.febbox.com/",'User-Agent':'Mozilla/5.0\x20(Windows\x20NT\x2010.0;\x20Win64;\x20x64)\x20AppleWebKit/537.36\x20(KHTML,\x20like\x20Gecko)\x20Chrome/120.0.0.0\x20Safari/537.36'},_0x57ee1a=_0x4a1c83["startsWith"]("ui=")?_0x4a1c83:"ui="+_0x4a1c83;for(const _0x29259e of _0x25468f){const _0xef87aa='https://www.febbox.com/console/video_quality_list?fid='+_0x29259e["fid"]+'&share_key='+_0x3d60d7,_0x5a5936=yield __nvFetch(_0xef87aa,{'headers':{'Cookie':_0x57ee1a}})['then'](_0x380830=>_0x380830["json"]())['catch'](()=>null);if(!_0x5a5936||!_0x5a5936["html"])continue;const _0x836de1=cheerio['load'](_0x5a5936['html']);_0x836de1("div.file_quality")["each"]((_0x233c3e,_0x4f2e55)=>{const _0x592cb0=_0x47e7f2,_0x5e71ad=_0x836de1(_0x4f2e55),_0x548b96=_0x5e71ad['attr']('data-url'),_0x187d55=_0x5e71ad["attr"]('data-quality'),_0x164e25=_0x5e71ad["find"](".size")["text"]()['trim']();if(_0x548b96){const _0x371112=getQualityFromName(_0x187d55),_0x1882b6=getSubheadingQualityLabel(_0x371112,_0x29259e['file_name']||_0x548b96),_0x3ca865=formatFileSize(_0x164e25||_0x29259e["file_size"]),_0x1b6e60=getFileContainerFormat(_0x29259e["file_name"]||_0x548b96),_0x219d04=parseFilenameMetadata(_0x29259e['file_name']||_0x548b96),_0x10f83d="ShowBox | "+_0x371112+'\x20|\x20Cookie\x20'+_0x317524,_0x99e4e=_0x393e98==='tv'?"🎬 "+(_0x4e45a6['title']||'Unknown')+" - ("+(_0x4e45a6["year"]||'')+')\x20|\x20S'+String(_0x56a732)['padStart'](0x2,'0')+'\x20E'+String(_0x4411af)["padStart"](0x2,'0'):'🍿\x20'+(_0x4e45a6['title']||'Unknown')+'\x20-\x20('+(_0x4e45a6['year']||'')+')',_0x38737d=_0x1882b6+'\x20|\x20💾\x20'+_0x3ca865+'\x20|\x20'+_0x1b6e60,_0x46a170=_0x219d04['line3'],_0x1e40d5=_0x219d04["source"]+" | 🍪 Cookie #"+_0x317524,_0x1cd513=_0x99e4e+'\x0a'+_0x38737d+'\x0a'+_0x46a170+'\x0a'+_0x1e40d5;_0x2823e2['push']({'name':_0x10f83d,'title':_0x1cd513,'size':_0x1cd513,'description':_0x1cd513,'url':_0x548b96,'quality':'','language':'','headers':_0x71004e});}});}}catch(_0x5a5b82){console['error']('[ShowBox]\x20FebBox\x20share\x20extraction\x20error:\x20'+_0x5a5b82["message"]);}return _0x2823e2;});}function processShowBoxResponse(_0x4420f9,_0x59b34e,_0xe8c7ce,_0x439155,_0x26d574,_0xd2aed0){const _0x4b44ca={_0x516296:0x206,_0x15f67f:0x1ab},_0x376ef4={_0x56df7f:0x214,_0x5604c1:0x1e7},_0x5b7332=_0x3cd342,_0x5f00bc=[];try{if(!_0x4420f9||!_0x4420f9['success']||!_0x4420f9['versions']||!Array['isArray'](_0x4420f9["versions"]))return _0x5f00bc;_0x4420f9["versions"]["forEach"](function(_0x1721b3,_0x3979ff){const _0x1d531b={_0x56703e:0x21b,_0x497054:0x203,_0x49d093:0x202,_0xd41144:0x1c6,_0x56bf18:0x233,_0x46d153:0x1c4,_0x3219b2:0x1ed,_0x37e3cb:0x1ba},_0x19ca08=_0x5b7332,_0x5cb4d0=_0x1721b3['size']||'Unknown';_0x1721b3["links"]&&Array["isArray"](_0x1721b3['links'])&&_0x1721b3["links"]['forEach'](function(_0x3088fc){const _0x3f355e=_0x19ca08;if(!_0x3088fc['url'])return;const _0x515fce=getQualityFromName(_0x3088fc['quality']||'Unknown'),_0x5d3476=getSubheadingQualityLabel(_0x515fce,_0x3088fc["url"]),_0x469b0d=_0x3088fc['size']||_0x5cb4d0,_0x599972=formatFileSize(_0x469b0d),_0x4690d3=getFileContainerFormat(_0x3088fc['url']),_0x4f5954=parseFilenameMetadata(_0x3088fc["url"]);let _0x3796e4='ShowBox';_0x4420f9['versions']['length']>0x1&&(_0x3796e4+='\x20V'+(_0x3979ff+0x1));const _0x39bf52=_0x3796e4+'\x20|\x20'+_0x515fce+" | Cookie "+_0xd2aed0,_0x2234b6=_0xe8c7ce==='tv'?"🎬 "+(_0x59b34e['title']||"Unknown")+'\x20-\x20('+(_0x59b34e["year"]||'')+") | S"+String(_0x439155)["padStart"](0x2,'0')+'\x20E'+String(_0x26d574)['padStart'](0x2,'0'):"🍿 "+(_0x59b34e["title"]||"Unknown")+" - ("+(_0x59b34e['year']||'')+')',_0x37d967=_0x5d3476+" | 💾 "+_0x599972+'\x20|\x20'+_0x4690d3,_0x42a0f8=_0x4f5954['line3'],_0x7f1f13=_0x4f5954['source']+'\x20|\x20🍪\x20Cookie\x20#'+_0xd2aed0,_0xdd5659=_0x2234b6+'\x0a'+_0x37d967+'\x0a'+_0x42a0f8+'\x0a'+_0x7f1f13;_0x5f00bc['push']({'name':_0x39bf52,'title':_0xdd5659,'size':_0xdd5659,'description':_0xdd5659,'url':_0x3088fc['url'],'quality':'','language':''});});});}catch(_0x3ef880){console['error']('[ShowBox]\x20Error\x20processing\x20response:\x20'+_0x3ef880['message']);}return _0x5f00bc;}function getStreams(_0x1496c7,_0x576afa='movie',_0x428500=null,_0x45539c=null){const _0x467f4a={_0x49ea7:0x1b3,_0x3dde3d:0x208,_0x4d3dc7:0x205,_0x12129f:0x1ce,_0x429b8d:0x216,_0x523edf:0x1d8,_0xbb11a4:0x1a4};return __async(this,null,function*(){const _0x398ee8=_0x5e70;console["log"]('[ShowBox]\x20Fetching\x20streams\x20for\x20TMDB\x20ID:\x20'+_0x1496c7+',\x20Type:\x20'+_0x576afa);const _0x55405b=getAllUiTokens(),_0x548dc0=getOssGroup(),_0x1d9c35=getApiBase();if(_0x55405b["length"]===0x0)return console['error']("[ShowBox] No UI token (cookie) found in settings."),[];let _0x5c5332=[];try{const _0x3c2f38=yield getTMDBDetails(_0x1496c7,_0x576afa);for(let _0x391943=0x0;_0x391943<_0x55405b["length"];_0x391943++){const _0x50dc2d=_0x391943+0x1,_0x32145f=_0x55405b[_0x391943],_0x3b35df=parseSingleToken(_0x32145f);if(!_0x3b35df)continue;console['log']("\n--- Processing Cookie "+_0x50dc2d+" ---");let _0x5ef24b=[],_0x3acb31;_0x576afa==='tv'&&_0x428500&&_0x45539c?_0x548dc0?_0x3acb31=_0x1d9c35+'/tv/'+_0x1496c7+"/oss="+_0x548dc0+'/'+_0x428500+'/'+_0x45539c+"?cookie="+encodeURIComponent(_0x3b35df):_0x3acb31=_0x1d9c35+"/tv/"+_0x1496c7+'/'+_0x428500+'/'+_0x45539c+'?cookie='+encodeURIComponent(_0x3b35df):_0x3acb31=_0x1d9c35+'/movie/'+_0x1496c7+"?cookie="+encodeURIComponent(_0x3b35df);let _0x1dc6fc=null;try{const _0x5284e6=yield __nvFetch(_0x3acb31,{'headers':WORKING_HEADERS});if(_0x5284e6['ok']){const _0x2ba20d=yield _0x5284e6["json"]();_0x5ef24b=processShowBoxResponse(_0x2ba20d,_0x3c2f38,_0x576afa,_0x428500,_0x45539c,_0x50dc2d);if(_0x2ba20d['id']||_0x2ba20d['mid'])_0x1dc6fc=_0x2ba20d['id']||_0x2ba20d['mid'];else _0x2ba20d["data"]&&(_0x2ba20d["data"]['id']||_0x2ba20d['data']["mid"])&&(_0x1dc6fc=_0x2ba20d['data']['id']||_0x2ba20d['data']['mid']);}}catch(_0x371d99){console['log']('[ShowBox]\x20Proxy\x20server\x20lookup\x20failed\x20for\x20Cookie\x20'+_0x50dc2d+':\x20'+_0x371d99['message']);}if(_0x1dc6fc){const _0x5e33cf=yield extractFebBoxShare(_0x1dc6fc,_0x576afa,_0x428500,_0x45539c,_0x3b35df,_0x50dc2d,_0x3c2f38);_0x5e33cf['length']>0x0&&(_0x5ef24b=_0x5ef24b['concat'](_0x5e33cf));}console['log']('[ShowBox]\x20Found\x20'+_0x5ef24b["length"]+'\x20links\x20for\x20Cookie\x20'+_0x50dc2d),_0x5c5332=_0x5c5332['concat'](_0x5ef24b);}return _0x5c5332;}catch(_0x13bb69){return console['error']("[ShowBox] Scraper execution failure: "+_0x13bb69['message']),[];}});}function onSettings(){const _0x59f3a3={_0x48cfd8:0x23e,_0x42505f:0x213};return __async(this,null,function*(){const _0x273770=_0x5e70;return[{'type':"header",'label':"ShowBox Configuration"},{'type':"text",'isPassword':!![],'key':"uiToken",'label':"FebBox UI Tokens (Separated by commas)",'placeholder':"ui=token1, ui=token2",'description':'Add\x20multiple\x20tokens\x20separated\x20by\x20commas.\x20Links\x20will\x20display\x20grouped\x20by\x20cookie\x20indicator.'},{'type':"text",'key':'ossGroup','label':"FebBox OSS Group (Optional)",'placeholder':'','description':"Optional OSS group parameter."}];});}module["exports"]={'getStreams':getStreams,'onSettings':onSettings};

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
  var PROVIDER = "showbox";
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
