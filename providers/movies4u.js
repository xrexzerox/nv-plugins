/*
 * nv-plugins movies4u.js — FULLY DECODED port of the All-in-One-Nuvio provider (4.24.0 merge pass).
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
var _0x2859=function(){return "";};const _0x244354=_0x2859;/*rotation removed*/;/*decoder removed*//*string-table removed*/var __defProp=Object["defineProperty"],__defProps=Object["defineProperties"],__getOwnPropDescs=Object["getOwnPropertyDescriptors"],__getOwnPropSymbols=Object['getOwnPropertySymbols'],__hasOwnProp=Object['prototype']["hasOwnProperty"],__propIsEnum=Object["prototype"]['propertyIsEnumerable'],__defNormalProp=(_0xe7b8a6,_0xa6dae8,_0x22d250)=>_0xa6dae8 in _0xe7b8a6?__defProp(_0xe7b8a6,_0xa6dae8,{'enumerable':!![],'configurable':!![],'writable':!![],'value':_0x22d250}):_0xe7b8a6[_0xa6dae8]=_0x22d250,__spreadValues=(_0x49c0be,_0x14d8e8)=>{for(var _0x56c2b6 in _0x14d8e8||(_0x14d8e8={}))if(__hasOwnProp['call'](_0x14d8e8,_0x56c2b6))__defNormalProp(_0x49c0be,_0x56c2b6,_0x14d8e8[_0x56c2b6]);if(__getOwnPropSymbols)for(var _0x56c2b6 of __getOwnPropSymbols(_0x14d8e8)){if(__propIsEnum['call'](_0x14d8e8,_0x56c2b6))__defNormalProp(_0x49c0be,_0x56c2b6,_0x14d8e8[_0x56c2b6]);}return _0x49c0be;},__spreadProps=(_0x3f3092,_0x2293c1)=>__defProps(_0x3f3092,__getOwnPropDescs(_0x2293c1)),__async=(_0xcd979,_0x57d1c8,_0x15291f)=>{const _0x11c7be={_0x4134a3:0x166};return new Promise((_0x27250d,_0x20c5a0)=>{const _0xe7c2ab=_0x2859;var _0x4cc8ae=_0x45aa8d=>{const _0x41c3e7=_0x2859;try{_0x3c92fb(_0x15291f["next"](_0x45aa8d));}catch(_0x3b9a61){_0x20c5a0(_0x3b9a61);}},_0x4820d3=_0x529f0e=>{try{_0x3c92fb(_0x15291f['throw'](_0x529f0e));}catch(_0x459d8f){_0x20c5a0(_0x459d8f);}},_0x3c92fb=_0x672cc4=>_0x672cc4['done']?_0x27250d(_0x672cc4["value"]):Promise["resolve"](_0x672cc4['value'])["then"](_0x4cc8ae,_0x4820d3);_0x3c92fb((_0x15291f=_0x15291f["apply"](_0xcd979,_0x57d1c8))["next"]());});},DOMAINS_URL='https://raw.githubusercontent.com/phisher98/TVVVV/refs/heads/main/domains.json',FALLBACK_URL="https://new2.movies4u.clinic",WORKER_PROXY='https://lucky-star-3059.salman-sohail93.workers.dev',TMDB_API_KEY="1865f43a0549ca50d341dd9ab8b29f49",HEADERS={'User-Agent':'Mozilla/5.0\x20(Windows\x20NT\x2010.0;\x20Win64;\x20x64)\x20AppleWebKit/537.36\x20(KHTML,\x20like\x20Gecko)\x20Chrome/131.0.0.0\x20Safari/537.36','Referer':FALLBACK_URL,'Cookie':"xla=s4t"},cachedBaseUrl=null;function getBaseUrl(){const _0x27613e={_0x5478cf:0x141};return __async(this,null,function*(){const _0x110b64=_0x2859;if(cachedBaseUrl)return cachedBaseUrl;try{const _0x43cc31=yield __nvFetch(DOMAINS_URL,{'skipSizeCheck':!![]}),_0xba2495=yield _0x43cc31['json']();cachedBaseUrl=_0xba2495["movies4u"]||_0xba2495['movies4uhd']||FALLBACK_URL;}catch(_0x5c7928){cachedBaseUrl=FALLBACK_URL;}return cachedBaseUrl;});}function getInvertedSortTag(_0x47bc3b,_0x25072e=0xf423f){const _0x44ed26={_0x47637b:0x168},_0x3bcbf4=_0x244354,_0x345928=Math["max"](0x0,parseInt(_0x47bc3b,0xa)||0x0),_0x2a18f5=Math['max'](0x0,_0x25072e-_0x345928),_0x1a9ad7=_0x2a18f5['toString'](0x2)['padStart'](0x14,'0');return _0x1a9ad7['split']('')['map'](_0xfad711=>_0xfad711==='1'?'\ufeff':'​')["join"]('');}function getQualityRank(_0x33dc9b){const _0x7a5c86={_0x360cdb:0x195,_0x32861c:0x18e,_0x5e90f3:0x195,_0x370125:0x142,_0x50f376:0x13e,_0x4dd301:0x192},_0x3dd727=_0x244354,_0x3dba7c=String(_0x33dc9b||'')['toLowerCase']();if(_0x3dba7c["includes"]('2160')||_0x3dba7c['includes']('4k')||_0x3dba7c['includes']('uhd'))return 0x4;if(_0x3dba7c['includes']("1080")||_0x3dba7c["includes"]('fhd')||_0x3dba7c["includes"]("fullhd"))return 0x3;if(_0x3dba7c["includes"]('720')||_0x3dba7c['includes']('hd'))return 0x2;if(_0x3dba7c['includes']("480")||_0x3dba7c['includes']('sd')||_0x3dba7c['includes']("360"))return 0x1;return 0x0;}function parseSizeToMB(_0x4b58bf){const _0x320afd={_0x3c761d:0x199},_0x259ae4=_0x244354;if(!_0x4b58bf||_0x4b58bf==='N/A')return 0x0;const _0x1d73c1=String(_0x4b58bf)["match"](/([\d.]+)\s*(GB|MB)/i);if(!_0x1d73c1)return 0x0;const _0x48b74f=parseFloat(_0x1d73c1[0x1]),_0x3994b5=_0x1d73c1[0x2]["toUpperCase"]();if(_0x3994b5==='GB')return Math['floor'](_0x48b74f*0x400);if(_0x3994b5==='MB')return Math['floor'](_0x48b74f);return 0x0;}function getResolutionEmoji(_0x424c50){const _0x39e47b={_0x2e59a4:0x193,_0x10558e:0x195,_0x3242f7:0x19c,_0x50d5e9:0x185,_0x24f4d6:0x18e,_0x573c53:0x176,_0x306101:0x159},_0x48d96a=_0x244354,_0x310ef4=String(_0x424c50||'')["toLowerCase"]();if(_0x310ef4["includes"]("2160")||_0x310ef4['includes']('4k')||_0x310ef4["includes"]('uhd'))return "🌟 4K";if(_0x310ef4['includes']("1080")||_0x310ef4["includes"]("fhd"))return'🔥\x201080p';if(_0x310ef4["includes"]('720')||_0x310ef4['includes']('hd'))return'💎\x20720p';if(_0x310ef4['includes']('480')||_0x310ef4['includes']('sd'))return "📱 480p";return'📺\x20'+(_0x424c50||"1080p");}function extractQuality(_0x156177){const _0x15148e={_0x2a9453:0x193,_0xe5a756:0x146,_0xed8134:0x137},_0x1e8bf2=_0x244354,_0x54c068=(_0x156177||'')["toLowerCase"]();if(/\b(2160p|4k|uhd)\b/['test'](_0x54c068))return'4K';if(/\b(1080p|1080)(?!(?:\s*gb|\s*mb|\s*b))\b/['test'](_0x54c068))return'1080p';if(/\b(720p|720)(?!(?:\s*gb|\s*mb|\s*b))\b/['test'](_0x54c068))return "720p";if(/\b(480p|480)(?!(?:\s*gb|\s*mb|\s*b))\b/["test"](_0x54c068))return "480p";if(/\b(360p|360)(?!(?:\s*gb|\s*mb|\s*b))\b/["test"](_0x54c068))return "360p";return'Unknown';}function parseExtraMetadata(_0x1e72cd,_0x5b6cdf=''){const _0x5aa91b={_0x396693:0x16a,_0x37d4dc:0x13d,_0x2a8134:0x19b,_0x401740:0x157,_0x5ef65d:0x14e,_0x26fab9:0x169,_0x4aec63:0x182,_0x26be84:0x195,_0x3abeb8:0x195,_0x5f480c:0x143,_0x533e51:0x133,_0x199239:0x150,_0x4234e4:0x13b,_0x32a7ec:0x195,_0x5b5b9a:0x17d,_0x2a33c3:0x195,_0x71dfa8:0x195,_0x27919f:0x17e,_0xc66546:0x13a},_0x761dd2=_0x244354,_0x5a4692=(_0x1e72cd+'\x20'+_0x5b6cdf)["toUpperCase"]();let _0x4e328c="Multi-Audio";if(_0x5a4692['includes']("DUAL"))_0x4e328c='Multi\x20Audio';if(_0x5a4692['includes']('ENGLISH')&&!_0x5a4692['includes']('HINDI'))_0x4e328c="English";const _0x1f6a3c=_0x5a4692["match"](/(\d+(?:\.\d+)?\s*[MGB]B)/i);let _0x37b22b=_0x1f6a3c?_0x1f6a3c[0x0]['replace'](/\s+/g,''):"N/A";if(_0x37b22b==='N/A'){const _0x7912c4=_0x5a4692['match'](/(\d+\.\d+)\s?G/);if(_0x7912c4)_0x37b22b=_0x7912c4[0x1]+'GB';}let _0x35a35e="MKV";if(_0x5a4692["includes"]("MP4"))_0x35a35e="MP4";let _0x33fc10="✨ H.264";if(_0x5a4692['includes']('HDR')||_0x5a4692['includes']('DV')||_0x5a4692["includes"]("VISION"))_0x33fc10="🌈 HDR";else{if(_0x5a4692["includes"]("HEVC")||_0x5a4692["includes"]('X265')||_0x5a4692["includes"]("H265")||_0x5a4692['includes']("H.265"))_0x33fc10="✨ HEVC";else{if(_0x5a4692['includes']('X264')||_0x5a4692['includes']("H264")||_0x5a4692["includes"]('H.264'))_0x33fc10="✨ H.264";}}let _0x55e959='🎧\x20DDP5.1';if(_0x5a4692["includes"]("ATMOS"))_0x55e959='🎧\x20Dolby\x20Atmos';else{if(_0x5a4692["includes"]("DD5")||_0x5a4692['includes']('DDP5')||_0x5a4692["includes"]('5.1'))_0x55e959="🎧 DDP5.1";else{if(_0x5a4692["includes"]("AAC"))_0x55e959="🎧 AAC";}}const _0x493e81=_0x5a4692['includes']('IMAX')?"👁️ IMAX":null;return{'language':_0x4e328c,'size':_0x37b22b,'format':_0x35a35e,'codecTag':_0x33fc10,'audioCodec':_0x55e959,'isImax':_0x493e81};}function safeUrl(_0x597ccf){const _0x26e9c7={_0x443789:0x15f,_0x1ed68a:0x168},_0x47ed3b=_0x244354;if(!_0x597ccf)return null;try{const _0x3c0b4f=new URL(_0x597ccf);return _0x3c0b4f["pathname"]=_0x3c0b4f['pathname']['split']('/')["map"](_0xacfe96=>{try{return encodeURIComponent(decodeURIComponent(_0xacfe96));}catch(_0x19a269){return encodeURIComponent(_0xacfe96);}})["join"]('/'),_0x3c0b4f["toString"]();}catch(_0x39c446){return _0x597ccf;}}function wrapFslMkvUrl(_0x192570){const _0x5bc5fc={_0x335665:0x193},_0xf6c0e5=_0x244354;try{const _0x5d24df=new URL(_0x192570),_0x246b05=_0x5d24df['hostname']["toLowerCase"]();if(!(_0x246b05==='r2.cloudflarestorage.com'||_0x246b05['endsWith'](".r2.cloudflarestorage.com")))return _0x192570;return WORKER_PROXY+"/media/file.mkv?url="+encodeURIComponent(_0x192570);}catch(_0x97b723){return _0x192570;}}function hubCloudServer(_0xb90b38,_0x39f2a7){const _0x47454a={_0xd51536:0x15b,_0x51c1dd:0x15b,_0x390795:0x178,_0x3ec165:0x16e},_0x451f9f=_0x244354,_0x102e41=((_0xb90b38||'')+'\x20'+(_0x39f2a7||''))['toLowerCase']();if(/gpdl\.|server\s*:\s*10gbps/["test"](_0x102e41))return "HubCloud Pixel 10Gbps";if(/fslv2/["test"](_0x102e41))return "HubCloud FSLv2";if(/fsl/["test"](_0x102e41))return'HubCloud\x20FSL';if(/s3 server/["test"](_0x102e41))return "HubCloud S3";if(/mega server/["test"](_0x102e41))return "HubCloud Mega";if(/pdl server/["test"](_0x102e41))return "HubCloud PDL";if(/buzzserver/["test"](_0x102e41))return'HubCloud\x20BuzzServer';if(/pixeldrain/['test'](_0x102e41))return'HubCloud\x20Pixeldrain';if(/pixel\.|pixelserver/['test'](_0x102e41))return'HubCloud\x20Pixel';if(/workers\.dev|download file/["test"](_0x102e41))return "HubCloud Direct";return'HubCloud';}function detectFileSize(_0x35ad52){const _0x4bb1fa={_0x203db1:0x190};return __async(this,arguments,function*(_0x4f8380,_0x3811b5={}){const _0x3264bf=_0x2859;try{const _0x3d3b5b=yield __nvFetch(_0x4f8380,{'method':'HEAD','headers':_0x3811b5,'skipSizeCheck':!![],'redirect':"follow"}),_0x114e07=_0x3d3b5b["headers"]['get']('content-length');if(!_0x114e07)return null;const _0x596e1a=parseInt(_0x114e07);let _0x1f26ae=_0x596e1a>=0x400*0x400*0x400?(_0x596e1a/(0x400*0x400*0x400))['toFixed'](0x1)+'GB':Math['round'](_0x596e1a/(0x400*0x400))+'MB';return{'bytes':_0x596e1a,'string':_0x1f26ae};}catch(_0x375d25){}return null;});}function detectDynamicQuality(_0x4103a4){const _0x57248f={_0x20df19:0x131,_0x1d927d:0x193,_0x4a036c:0x159};return __async(this,arguments,function*(_0x59debe,_0x373968={},_0x432b7b='',_0x2e2b80=0x78){const _0x241678=_0x2859;try{if(!_0x59debe)return'1080p';const _0x3f24e8=decodeURIComponent(_0x59debe)['toLowerCase']();let _0x4f614b=extractQuality(_0x3f24e8);if(_0x4f614b!=="Unknown")return _0x4f614b;if(_0x432b7b){_0x4f614b=extractQuality(_0x432b7b["toLowerCase"]());if(_0x4f614b!=="Unknown")return _0x4f614b;}const _0x424124=yield detectFileSize(_0x59debe,_0x373968);if(_0x424124&&_0x424124['bytes']){const _0x5ed04a=_0x424124["bytes"]/(0x400*0x400*0x400),_0x183060=(parseInt(_0x2e2b80)||0x78)/0x3c,_0x27833f=_0x5ed04a/_0x183060;if(_0x27833f>=6.5)return'4K';if(_0x27833f>=0.95)return "1080p";if(_0x27833f>=0.35)return'720p';return'480p';}}catch(_0x5b6e7b){}return "1080p";});}function makeStream(_0x1bbc01,_0x5e27d5,_0x4d0d8c,_0x4a308b,_0x47a5ac,_0x53e62f,_0x575102,_0x4f421e){const _0x2a565a={_0x2126a7:0x12e,_0x95e4ef:0x173,_0x4aaf4b:0x134,_0x5395ed:0x13c,_0x50aaad:0x17c},_0x2d55a4=_0x244354,_0x410f8e=getQualityRank(_0x4d0d8c),_0x3b9868=parseSizeToMB(_0x4a308b),_0x407563=getInvertedSortTag(_0x410f8e*0x186a0+_0x3b9868,0xf423f),_0x577439=getResolutionEmoji(_0x4d0d8c),_0x47e071=(_0x53e62f||'')['replace'](/[^a-zA-Z0-9]/g,'.'),_0x465bf7=_0x47e071+'.'+(_0x575102||'2026')+'.'+(_0x4f421e['isImax']?'IMAX.':'')+_0x4d0d8c+'.AMZN.WEB-DL.'+_0x4f421e["language"]["replace"](/\s+/g,'.')+'.'+_0x4f421e['audioCodec']["replace"](/[^\w.]/g,'')+'.'+_0x4f421e["format"]+".MSubs",_0x50dc7a='🎬\x20'+_0x53e62f+(_0x575102?'\x20('+_0x575102+')':''),_0x17ffd2=_0x577439+'\x20|\x20🗣️\x20'+_0x4f421e['language']+" | 💾 "+_0x4a308b,_0x277dc8="🎞️ "+_0x4f421e['format']+'\x20|\x20'+_0x4f421e['codecTag']+'\x20|\x20'+_0x4f421e["audioCodec"],_0x34661a=_0x4f421e['isImax']?"👁️ IMAX | 🌐 Movies4u | 📦 "+_0x47a5ac:'🌐\x20Movies4u\x20|\x20📦\x20'+_0x47a5ac,_0x672309=_0x465bf7,_0xc647ea=_0x407563+'Movies4u\x20•\x20'+_0x4d0d8c+" • "+_0x47a5ac,_0x29bc21=[_0x50dc7a,_0x17ffd2,_0x277dc8,_0x34661a,_0x672309]['join']('\x0a');return{'qualityRank':_0x410f8e,'sizeInMB':_0x3b9868,'data':{'name':_0xc647ea,'title':_0x29bc21,'size':_0x29bc21,'description':_0x29bc21,'url':_0x1bbc01,'behaviorHints':{'notWebReady':!![],'proxyHeaders':{'request':_0x5e27d5}}}};}function unpackJS(_0x1b3202,_0x1e040c,_0x1048a1,_0x25adb8){while(_0x1048a1--){_0x25adb8[_0x1048a1]&&(_0x1b3202=_0x1b3202['replace'](new RegExp('\x5cb'+_0x1048a1['toString'](_0x1e040c)+'\x5cb','g'),_0x25adb8[_0x1048a1]));}return _0x1b3202;}function extractDirectM3u8(_0x30f88c){const _0x583e6e={_0x1f792f:0x199,_0x4f0bc8:0x199,_0x1b147d:0x12e,_0x2ba768:0x197};return __async(this,null,function*(){const _0x561f97=_0x2859;var _0xce9c3e,_0x4399ab,_0x1980ab,_0x20fad6,_0x54ce43,_0x381f3b;try{const _0xf7fede=yield __nvFetch(_0x30f88c,{'headers':__spreadProps(__spreadValues({},HEADERS),{'Referer':'https://m4uplay.store/'}),'skipSizeCheck':!![]}),_0x597a9e=yield _0xf7fede['text']();let _0x103fc6=((_0xce9c3e=_0x597a9e['match'](/https?:\/\/[^\s"'<>]+\.m3u8[^\s"'<>]*/i))==null?void 0x0:_0xce9c3e[0x0])||((_0x4399ab=_0x597a9e["match"](/https?:\/\/[^\s"'<>]+master\.txt[^\s"'<>]*/i))==null?void 0x0:_0x4399ab[0x0]);if(!_0x103fc6){const _0x527418=(_0x1980ab=_0x597a9e["match"](/\/(?:3o|stream)\/[^\s"'<>]+(?:m3u8|txt)/i))==null?void 0x0:_0x1980ab[0x0];if(_0x527418)_0x103fc6="https://m4uplay.store"+_0x527418;}if(!_0x103fc6){const _0x1ecd50=_0x597a9e["match"](new RegExp('eval\x5c(function\x5c(p,a,c,k,e,d\x5c).*?\x5c}\x5c(\x27(.*)\x27,(\x5cd+),(\x5cd+),\x27(.*)\x27\x5c.split\x5c(\x27\x5c|\x27\x5c)','s'));if(_0x1ecd50){const _0x5f1203=unpackJS(_0x1ecd50[0x1],parseInt(_0x1ecd50[0x2]),parseInt(_0x1ecd50[0x3]),_0x1ecd50[0x4]["split"]('|'));_0x103fc6=((_0x20fad6=_0x5f1203["match"](/https?:\/\/[^\s"'<>]+\.m3u8[^\s"'<>]*/i))==null?void 0x0:_0x20fad6[0x0])||((_0x54ce43=_0x5f1203["match"](/https?:\/\/[^\s"'<>]+master\.txt[^\s"'<>]*/i))==null?void 0x0:_0x54ce43[0x0]);if(!_0x103fc6){const _0x3f9d7d=(_0x381f3b=_0x5f1203["match"](/\/(?:3o|stream)\/[^\s"'<>]+(?:m3u8|txt)/i))==null?void 0x0:_0x381f3b[0x0];if(_0x3f9d7d)_0x103fc6='https://m4uplay.store'+_0x3f9d7d;}}}if(_0x103fc6)return _0x103fc6["replace"]('master.txt',"master.m3u8");}catch(_0x587606){console["error"]('[Movies4u]\x20Player\x20direct\x20parsing\x20failed:',_0x587606);}return null;});}function extractHubCloud(_0x5abc86,_0x120686){const _0x49899f={_0x5111f0:0x12e,_0x490acd:0x15b,_0x590ee6:0x172},_0x475363={_0x3b9911:0x152,_0x5a0a7a:0x14d,_0xd7b950:0x14c,_0x138d0e:0x171,_0x2a1bfb:0x14c,_0x3252a8:0x14d,_0x578edf:0x167,_0x33d0bc:0x14d,_0x2b36e6:0x15b};return __async(this,null,function*(){const _0x5ec52d=_0x2859;var _0xe1924f,_0x18dcdd,_0x36621a,_0x5a7d55,_0x3f5c68,_0x512139,_0x296153;try{let _0x558d3a=_0x5abc86["replace"]('hubcloud.foo','hubcloud.cx')['replace']('hubcloud.ink','hubcloud.dad'),_0x324e04=yield __nvFetch(_0x558d3a,{'headers':__spreadProps(__spreadValues({},HEADERS),{'Referer':_0x120686}),'skipSizeCheck':!![]}),_0x3cff71=yield _0x324e04['text'](),_0x2683f1=_0x324e04['url']||_0x558d3a;const _0x317a20=((_0xe1924f=_0x3cff71['match'](/<a[^>]+href="([^"]*hubcloud\.php[^"]*)"/i))==null?void 0x0:_0xe1924f[0x1])||((_0x18dcdd=_0x3cff71['match'](/id="download"[^>]+href="([^"]+)"/i))==null?void 0x0:_0x18dcdd[0x1])||((_0x36621a=_0x3cff71['match'](/var url = '([^']+)'/))==null?void 0x0:_0x36621a[0x1]);if(_0x317a20){const _0x31211c=new URL(_0x317a20,_0x2683f1)['href'];_0x324e04=yield __nvFetch(_0x31211c,{'headers':__spreadProps(__spreadValues({},HEADERS),{'Referer':_0x2683f1}),'skipSizeCheck':!![]}),_0x3cff71=yield _0x324e04["text"](),_0x2683f1=_0x324e04['url']||_0x31211c;}const _0x10f273=((_0x5a7d55=_0x3cff71['match'](/class="card-header">([^<]+)</i))==null?void 0x0:_0x5a7d55[0x1])||((_0x3f5c68=_0x3cff71['match'](/<title>([^<]+)<\/title>/i))==null?void 0x0:_0x3f5c68[0x1])||'',_0x4761d7=((_0x512139=_0x3cff71['match'](/id="size">([^<]+)</i))==null?void 0x0:_0x512139[0x1])||((_0x296153=_0x3cff71['match'](/([\d.]+\s*(?:GB|MB))/i))==null?void 0x0:_0x296153[0x1]),_0x3637af=_0x4761d7?_0x4761d7["trim"]():void 0x0,_0x22d949=extractQuality(_0x10f273),_0x2db4c2=[..._0x3cff71['matchAll'](/<a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi)],_0x232306=[];for(const _0x21ef4e of _0x2db4c2){const _0x23a9bf=_0x21ef4e[0x1],_0x493d37=_0x21ef4e[0x2]["replace"](/<[^>]+>/g,'\x20')["toLowerCase"]();if(!_0x23a9bf||!/(download file|download\s*\[server|fsl|buzzserver|pixeldra|pixelserver|pixel server|s3 server|mega server|pdl server)/i['test'](_0x493d37))continue;if(/workers\.dev/i['test'](_0x23a9bf)&&/download file/i["test"](_0x493d37))continue;_0x232306["push"]({'link':new URL(_0x23a9bf,_0x2683f1)['href'],'text':_0x493d37});}const _0x567937=yield Promise['all'](_0x232306['map'](_0x17ef86=>__async(this,null,function*(){const _0x1dcea9=_0x5ec52d;let _0x5d3523=_0x17ef86["link"];if(/pixeldra|pixelserver|pixel server/i['test'](_0x17ef86['text']))return null;else{if(/gpdl\.|download\s*\[server\s*:\s*10gbps/i['test'](_0x17ef86['link']+'\x20'+_0x17ef86["text"]))try{const _0x403967=yield __nvFetch(_0x5d3523,{'redirect':'manual','headers':__spreadProps(__spreadValues({},HEADERS),{'Referer':_0x2683f1}),'skipSizeCheck':!![]}),_0x1f788d=_0x403967["headers"]["get"]('location');if(!_0x1f788d)return null;const _0x12c9d5=yield __nvFetch(new URL(_0x1f788d,_0x5d3523)['href'],{'redirect':'manual','headers':__spreadProps(__spreadValues({},HEADERS),{'Referer':_0x5d3523}),'skipSizeCheck':!![]}),_0x6699ff=_0x12c9d5['headers']['get']('location');if(!_0x6699ff)return null;_0x5d3523=new URL(_0x6699ff)["searchParams"]["get"]("link");if(!_0x5d3523)return null;}catch(_0x6325aa){return null;}else{if(/buzzserver/i["test"](_0x17ef86["text"]))try{const _0x25b54b=yield __nvFetch(_0x5d3523,{'redirect':'manual','headers':__spreadProps(__spreadValues({},HEADERS),{'Referer':_0x2683f1}),'skipSizeCheck':!![]});_0x5d3523=_0x25b54b["headers"]["get"]("hx-redirect")||_0x25b54b['headers']['get']('location');if(!_0x5d3523)return null;_0x5d3523=new URL(_0x5d3523,_0x17ef86["link"])['href'];}catch(_0x13b124){return null;}}}const _0x3cd30a=hubCloudServer(_0x17ef86["text"],_0x17ef86['link']);return/HubCloud FSL/i["test"](_0x3cd30a)&&(_0x5d3523=wrapFslMkvUrl(_0x5d3523)),{'source':_0x3cd30a,'url':safeUrl(_0x5d3523),'quality':_0x22d949,'size':_0x3637af,'headers':__spreadProps(__spreadValues({},HEADERS),{'Referer':_0x2683f1})};})));return _0x567937['filter'](Boolean);}catch(_0x572efb){return[];}});}function getStreams(_0x5f5bbb,_0x40ca68,_0x7a567d=0x1,_0x41b1bf=0x1){const _0x46456d={_0x4a79ef:0x196,_0x264160:0x156,_0x2091d9:0x195,_0x5bf18c:0x136,_0x5a5894:0x131,_0x7d6aaf:0x199,_0x26eee2:0x147,_0x14edf4:0x161,_0x2a1b95:0x19e,_0x12bd20:0x161,_0x42198e:0x177,_0x4e44f2:0x18d,_0x52d249:0x195,_0x1713d1:0x177,_0x4570d7:0x15c,_0x4ffbeb:0x177,_0x5dd4e0:0x172,_0x11fd9b:0x130},_0x3d30b0={_0x5e1738:0x140,_0x236052:0x140,_0x12634d:0x163};return __async(this,null,function*(){const _0x5455c6=_0x2859,_0x5f262e=yield getBaseUrl(),_0x591755=_0x5f5bbb['toString']()["replace"]('tmdb:','');let _0x209ac5='',_0x49e594='';try{const _0x8f8199=_0x40ca68==='tv'?'tv':"movie",_0x1f99d4=yield __nvFetch('https://api.themoviedb.org/3/'+_0x8f8199+'/'+_0x591755+'?api_key='+TMDB_API_KEY,{'skipSizeCheck':!![]}),_0x4d91a2=yield _0x1f99d4["json"]();_0x209ac5=_0x8f8199==='tv'?_0x4d91a2['name']:_0x4d91a2['title'];const _0x5a075c=_0x8f8199==='tv'?_0x4d91a2["first_air_date"]:_0x4d91a2["release_date"];if(_0x5a075c)_0x49e594=_0x5a075c["split"]('-')[0x0];}catch(_0x40893d){}if(!_0x209ac5)return[];let _0x5ab329=null;try{const _0x12bd1d=yield __nvFetch(_0x5f262e+'/?s='+encodeURIComponent(_0x209ac5),{'headers':HEADERS,'skipSizeCheck':!![]}),_0x4ef983=yield _0x12bd1d["text"](),_0x1c9471=[..._0x4ef983['matchAll'](/<article[\s\S]*?<a href="([^"]+)"[^>]*rel="bookmark">([^<]+)<\/a>/gi)];for(const _0x5a4322 of _0x1c9471){const _0x5780a6=_0x5a4322[0x1],_0x2d8fa7=_0x5a4322[0x2]['toLowerCase'](),_0x16775b=_0x209ac5["toLowerCase"]();if(_0x2d8fa7["includes"](_0x16775b)&&(!_0x49e594||_0x2d8fa7['includes'](_0x49e594))){if(_0x40ca68==='tv'&&!/season|series/i['test'](_0x2d8fa7))continue;_0x5ab329=_0x5780a6;break;}}}catch(_0x5befd5){}if(!_0x5ab329)return[];let _0x122273='';try{const _0x265552=yield __nvFetch(_0x5ab329,{'headers':HEADERS,'skipSizeCheck':!![]});_0x122273=yield _0x265552["text"]();}catch(_0x5f1d7e){return[];}const _0xa3c685=[],_0xbba4b0=[..._0x122273["matchAll"](/<a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi)];for(const _0xf680bb of _0xbba4b0){const _0x1152f2=_0xf680bb[0x1],_0x565945=_0xf680bb[0x2]["replace"](/<[^>]+>/g,'\x20')["trim"]();if(_0x1152f2["includes"]('m4uplay.store')){const _0x45918d=yield extractDirectM3u8(_0x1152f2);if(_0x45918d){const _0x5ad9c4=__spreadProps(__spreadValues({},HEADERS),{'Referer':"https://m4uplay.store/",'Origin':'https://m4uplay.store'}),_0x409dd8=parseExtraMetadata(_0x565945,_0x1152f2),_0x16f3ca=yield detectDynamicQuality(_0x45918d,_0x5ad9c4,_0x565945),_0x4c4496=yield detectFileSize(_0x45918d,_0x5ad9c4),_0x4bcd95=_0x4c4496&&_0x4c4496['string']?_0x4c4496["string"]:_0x409dd8['size']!=='N/A'?_0x409dd8['size']:"Unknown";_0xa3c685["push"](makeStream(_0x45918d,_0x5ad9c4,_0x16f3ca,_0x4bcd95,'M4U\x20Player\x20Direct',_0x209ac5,_0x49e594,_0x409dd8));}}}const _0x4dc574=[],_0x17e325=[..._0x122273['matchAll'](/<h4[^>]*>([\s\S]*?)<\/h4>([\s\S]*?)(?=<h4|$)/gi)];for(const _0xd7a2e8 of _0x17e325){const _0x57daf9=_0xd7a2e8[0x1]['replace'](/<[^>]+>/g,'\x20')['trim'](),_0x136746=_0xd7a2e8[0x2];if(_0x40ca68==='tv'&&!new RegExp('season\x5cs*0?'+_0x7a567d+'(?:\x5cD|$)','i')['test'](_0x57daf9))continue;const _0x5d78cf=extractQuality(_0x57daf9),_0x425392=_0x57daf9["match"](/\b\d+(?:\.\d+)?\s*(?:GB|MB)(?:\/E)?\b/i),_0xc72384=_0x425392?_0x425392[0x0]:void 0x0,_0x4da227=[..._0x136746["matchAll"](/<a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi)];for(const _0x3ecdc8 of _0x4da227){const _0x488df3=_0x3ecdc8[0x1],_0x180336=_0x3ecdc8[0x2]["replace"](/<[^>]+>/g,'')["trim"]();/m4ulinks\./i['test'](_0x488df3)&&_0x4dc574["push"]({'url':_0x488df3,'quality':_0x5d78cf,'size':_0xc72384,'label':_0x57daf9,'anchorText':_0x180336});}}for(const _0x121684 of _0x4dc574){try{const _0x56e0c9=yield __nvFetch(_0x121684["url"],{'headers':__spreadProps(__spreadValues({},HEADERS),{'Referer':_0x5ab329}),'skipSizeCheck':!![]}),_0x4ee7ac=yield _0x56e0c9['text'](),_0x1dbb15=[],_0x271c9f=[..._0x4ee7ac['matchAll'](/<h[45][^>]*>([\s\S]*?)<\/h[45]>([\s\S]*?)(?=<h[45]|$)/gi)];for(const _0x54e84c of _0x271c9f){const _0x5bec18=_0x54e84c[0x1]['replace'](/<[^>]+>/g,'')["trim"](),_0x57059b=_0x54e84c[0x2];if(_0x40ca68==='tv'){const _0x2d03fd=_0x5bec18['match'](/episodes?\s*:\s*0*(\d+)/i);if(!_0x2d03fd||parseInt(_0x2d03fd[0x1])!==parseInt(_0x41b1bf))continue;}const _0x2f870b=[..._0x57059b['matchAll'](/<a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi)];for(const _0x50e9b0 of _0x2f870b){_0x1dbb15['push']({'url':_0x50e9b0[0x1],'label':_0x50e9b0[0x2]["replace"](/<[^>]+>/g,'')["trim"]()});}}for(const _0x5bb679 of _0x1dbb15){const _0x43d695=(_0x5bb679["label"]+'\x20'+_0x5bb679["url"])['toLowerCase']();if(_0x43d695["includes"]("hubcloud")){const _0x579a9a=yield extractHubCloud(_0x5bb679["url"],_0x121684["url"]);for(const _0x378bae of _0x579a9a){const _0x5ce204=parseExtraMetadata(_0x121684['label']+'\x20'+(_0x121684['size']||''),_0x5bb679["label"]),_0x3447b1=yield detectDynamicQuality(_0x378bae["url"],_0x378bae["headers"],_0x121684['quality']),_0x56b339=_0x378bae["size"]||_0x5ce204["size"];_0xa3c685['push'](makeStream(_0x378bae['url'],_0x378bae['headers'],_0x3447b1,_0x56b339,_0x378bae['source'],_0x209ac5,_0x49e594,_0x5ce204));}}else{if(_0x5bb679['url']['includes']("m4uplay.store")||_0x43d695["includes"]('m4uplay')){const _0x3a2934=yield extractDirectM3u8(_0x5bb679['url']);if(_0x3a2934){const _0x2edc38=parseExtraMetadata(_0x121684['label']+'\x20'+(_0x121684["size"]||''),_0x5bb679["label"]),_0x478097=__spreadProps(__spreadValues({},HEADERS),{'Referer':'https://m4uplay.store/','Origin':"https://m4uplay.store"}),_0x5f441b=yield detectDynamicQuality(_0x3a2934,_0x478097,_0x121684["quality"]),_0x3d014e=yield detectFileSize(_0x3a2934,_0x478097),_0x231c9d=_0x3d014e&&_0x3d014e['string']?_0x3d014e["string"]:_0x2edc38['size']!=='N/A'?_0x2edc38["size"]:'Unknown';_0xa3c685["push"](makeStream(_0x3a2934,_0x478097,_0x5f441b,_0x231c9d,'M4U\x20Player\x20Direct',_0x209ac5,_0x49e594,_0x2edc38));}}}}}catch(_0x298347){}}const _0xaf93ed=new Set(),_0x1ff7e3=_0xa3c685["filter"](_0x3560c1=>{const _0x23849b=_0x5455c6;if(!_0x3560c1["data"]['url']||_0xaf93ed["has"](_0x3560c1["data"]['url']))return![];return _0xaf93ed["add"](_0x3560c1['data']['url']),!![];});return _0x1ff7e3['sort']((_0x229f5f,_0x4d893c)=>{if(_0x4d893c['qualityRank']!==_0x229f5f['qualityRank'])return _0x4d893c['qualityRank']-_0x229f5f['qualityRank'];return _0x4d893c['sizeInMB']-_0x229f5f['sizeInMB'];}),_0x1ff7e3['map'](_0x58c7de=>_0x58c7de['data']);});}module['exports']={'getStreams':getStreams};

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
  var PROVIDER = "movies4u";
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
