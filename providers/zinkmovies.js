/*
 * nv-plugins zinkmovies.js — FULLY DECODED port of the All-in-One-Nuvio provider (4.24.0 merge pass).
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
var _0x4dda=function(){return "";};const _0x4e9a2b=_0x4dda;/*rotation removed*/;var __defProp=Object['defineProperty'],__getOwnPropSymbols=Object["getOwnPropertySymbols"],__hasOwnProp=Object['prototype']["hasOwnProperty"],__propIsEnum=Object['prototype']["propertyIsEnumerable"],__defNormalProp=(_0x1da1f9,_0x54ab6e,_0x3b9027)=>_0x54ab6e in _0x1da1f9?__defProp(_0x1da1f9,_0x54ab6e,{'enumerable':!![],'configurable':!![],'writable':!![],'value':_0x3b9027}):_0x1da1f9[_0x54ab6e]=_0x3b9027,__spreadValues=(_0x1b5dc7,_0x4cfce2)=>{for(var _0x332c7a in _0x4cfce2||(_0x4cfce2={}))if(__hasOwnProp['call'](_0x4cfce2,_0x332c7a))__defNormalProp(_0x1b5dc7,_0x332c7a,_0x4cfce2[_0x332c7a]);if(__getOwnPropSymbols)for(var _0x332c7a of __getOwnPropSymbols(_0x4cfce2)){if(__propIsEnum['call'](_0x4cfce2,_0x332c7a))__defNormalProp(_0x1b5dc7,_0x332c7a,_0x4cfce2[_0x332c7a]);}return _0x1b5dc7;},__async=(_0x5f27bd,_0x107c28,_0x57ab12)=>{const _0x53c138={_0x5aede1:0x82};return new Promise((_0x2ab46f,_0x45fe7f)=>{const _0x497510={_0x19b6e3:0x82},_0x9d20ff=_0x4dda;var _0x29e5d0=_0x4eff69=>{const _0x3c50f8=_0x4dda;try{_0x2151b1(_0x57ab12["next"](_0x4eff69));}catch(_0x26da6a){_0x45fe7f(_0x26da6a);}},_0x587f7f=_0x5e4c7f=>{try{_0x2151b1(_0x57ab12['throw'](_0x5e4c7f));}catch(_0x2f76d5){_0x45fe7f(_0x2f76d5);}},_0x2151b1=_0x3ec6b5=>_0x3ec6b5['done']?_0x2ab46f(_0x3ec6b5["value"]):Promise["resolve"](_0x3ec6b5["value"])["then"](_0x29e5d0,_0x587f7f);_0x2151b1((_0x57ab12=_0x57ab12['apply'](_0x5f27bd,_0x107c28))["next"]());});},PROVIDER_NAME='ZinkMovies',TMDB_API_KEY="439c478a771f35c05022f9feabcca01c",MAIN_URL='https://zinkmovies.wtf',DOMAINS_JSON_URL='https://raw.githubusercontent.com/PirateZoro9/asura-providers/main/urls.json',baseUrl=MAIN_URL,cachedDomains=null,domainCacheTime=0x0,DOMAIN_CACHE_TTL=0x4*0x3c*0x3c*0x3e8,currentUA="Mozilla/5.0 (Linux; Android 14; Pixel 8 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36",UAS=['Mozilla/5.0\x20(Linux;\x20Android\x2014;\x20Pixel\x208\x20Pro)\x20AppleWebKit/537.36\x20(KHTML,\x20like\x20Gecko)\x20Chrome/124.0.0.0\x20Mobile\x20Safari/537.36',"Mozilla/5.0 (Linux; Android 13; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36",'Mozilla/5.0\x20(Linux;\x20Android\x2012;\x20Pixel\x206)\x20AppleWebKit/537.36\x20(KHTML,\x20like\x20Gecko)\x20Chrome/115.0.0.0\x20Mobile\x20Safari/537.36',"Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"];function refreshDomains(){return __async(this,null,function*(){const _0x3ab462=_0x4dda;if(cachedDomains&&Date["now"]()-domainCacheTime<DOMAIN_CACHE_TTL)return;try{const _0x31b943=yield __nvFetch(DOMAINS_JSON_URL,{'headers':{'User-Agent':'Mozilla/5.0'}});if(_0x31b943==null?void 0x0:_0x31b943['ok']){const _0x1f9711=JSON['parse'](yield _0x31b943["text"]());(_0x1f9711==null?void 0x0:_0x1f9711["zinkmovies"])&&(cachedDomains=_0x1f9711,domainCacheTime=Date['now'](),baseUrl=_0x1f9711['zinkmovies']);}}catch(_0x53cbf9){}});}function hdrs(_0x9212bf={}){const _0x27d929={_0x198d78:0x97},_0x222913=_0x4e9a2b;return __spreadValues({'User-Agent':currentUA,'Accept-Language':"en-US,en;q=0.9"},_0x9212bf);}var FETCH_TIMEOUT=0x2ee0;function raceTimeout(_0x45e691){const _0x4d3241=_0x4e9a2b;return new Promise((_0x2280e0,_0x8dc273)=>setTimeout(()=>_0x8dc273(new Error("Timeout")),_0x45e691));}/*string-table removed*/function fetchText(_0x2e5a0c,_0x52fa21){return __async(this,null,function*(){const _0x487faf=_0x4dda;try{const _0x25554d=yield Promise["race"]([__nvFetch(_0x2e5a0c,_0x52fa21||{}),raceTimeout(FETCH_TIMEOUT)]);if(_0x25554d['ok'])return yield _0x25554d["text"]();}catch(_0x400ccf){}return null;});}function fetchJson(_0x43ff6c,_0x4098ff){const _0x3480a7={_0x2c0f06:0xc1};return __async(this,null,function*(){const _0x40bd45=_0x4dda;try{const _0x117050=yield Promise["race"]([__nvFetch(_0x43ff6c,_0x4098ff||{}),raceTimeout(FETCH_TIMEOUT)]);if(_0x117050['ok'])return yield _0x117050["json"]();}catch(_0x582f62){}return null;});}/*decoder removed*/function parseQuality(_0x3713dc){const _0x2720c5={_0x4a20c4:0xe4},_0x18f183=_0x4e9a2b,_0x4262f4=_0x3713dc["match"](/(2160|1080|720|480)\s*P/i);if(_0x4262f4)return _0x4262f4[0x1]+'p';if(/4K|UHD/i["test"](_0x3713dc))return'2160p';return'HD';}function parseSize(_0x4a3a15){const _0x5d07ae=_0x4e9a2b;if(!_0x4a3a15)return'Unknown\x20Size';const _0x53cbd1=_0x4a3a15['match'](/(\d+(?:\.\d+)?\s*(?:GB|MB|gb|mb))/);return _0x53cbd1?_0x53cbd1[0x1]["toUpperCase"]():"Unknown Size";}function cleanHubTitle(_0x3d7c14){const _0x1e5643={_0x5b6dbd:0xb1,_0x457f9d:0xd5,_0x5e42ee:0xb1,_0x50811e:0xd5},_0x1e9368=_0x4e9a2b;let _0x3f1b2b=_0x3d7c14["replace"](/\.(mkv|mp4|avi)$/i,'')["trim"]();return _0x3f1b2b=_0x3f1b2b['replace'](/\s*[-–—]\s*ZINKMOVIES.*/i,'')["trim"](),_0x3f1b2b=_0x3f1b2b["replace"](/\s*[-–—]\s*JiTU.*/i,'')['trim'](),_0x3f1b2b=_0x3f1b2b["replace"](/\s+(IMAX\s+)?(2160|1080|720|480)\s*[pP].*/i,'')["trim"](),_0x3f1b2b=_0x3f1b2b["replace"](/\s+4K\s+.*/i,'')["trim"](),_0x3f1b2b["trim"]()||_0x3d7c14;}function buildDropdownMetadata(_0x4cbaeb,_0x181f17,_0x44c943,_0x49284a,_0x136472,_0x1f07e9,_0x42c68c,_0x5329a9){const _0x3c600a={_0x31eeed:0xd9,_0x2a203a:0xb9,_0x56ac19:0x93,_0x42beff:0xca,_0xc7cf1a:0x9b,_0x583422:0xbb,_0x33c345:0x9b,_0x8a5413:0x9c,_0x43f47b:0x8e,_0x5c9ed1:0x7a,_0x110e38:0x87,_0x2b2a12:0x92,_0x174678:0xa9,_0x136abe:0x7d,_0x1dce2d:0xd7,_0x24f8b1:0xc0,_0x51902c:0xc5,_0x1dd81f:0x78,_0x1c428c:0xce,_0x2aba7b:0x9b,_0xc2678c:0xaf,_0x494250:0x9b,_0x482af9:0x72,_0x16abde:0x72,_0x4ddd47:0xb5,_0x1689fc:0x9b},_0x518b84=_0x4e9a2b,_0x17bf01=(_0x44c943?_0x4cbaeb["name"]:_0x4cbaeb["title"])||'Unknown\x20Title',_0x5f52a7=_0x44c943?(_0x4cbaeb['first_air_date']||'')["split"]('-')[0x0]:(_0x4cbaeb["release_date"]||'')["split"]('-')[0x0],_0xc697b2=_0x5f52a7?'\x20('+_0x5f52a7+')':'';let _0x5e685c='';try{if(_0x5329a9)_0x5e685c=decodeURIComponent(_0x5329a9);}catch(_0x5bdc05){_0x5e685c=_0x5329a9||'';}const _0x30fa94=(String(_0x42c68c)+'\x20'+_0x5e685c)["toLowerCase"]();let _0x107fd7='🎬\x20'+_0x17bf01+'\x20-\x20'+_0xc697b2;_0x44c943&&_0x49284a&&_0x136472&&(_0x107fd7+=" | S"+String(_0x49284a)["padStart"](0x2,'0')+'E'+String(_0x136472)["padStart"](0x2,'0'));let _0x5b86f9=String(_0x181f17)["toLowerCase"]()['replace'](/p/g,'')+'p';if(_0x30fa94["includes"]("2160p")||_0x30fa94['includes']('4k')||_0x30fa94['includes']('uhd'))_0x5b86f9="2160p";else{if(_0x30fa94["includes"]('1080p'))_0x5b86f9="1080p";else{if(_0x30fa94["includes"]("720p"))_0x5b86f9="720p";}}let _0x1f7b62='💎';if(_0x5b86f9['includes']("2160")||_0x5b86f9['includes']('4k'))_0x1f7b62='🌟';else{if(_0x5b86f9["includes"]("1080"))_0x1f7b62='🔥';}let _0x3687ed="Original-Audio";const _0x226b49=["multi",'dual','hindi','tamil','telugu',"bengali",'malayalam','kannada',"marathi",'punjabi'];_0x226b49['some'](_0x4e68ae=>_0x30fa94['includes'](_0x4e68ae))&&(_0x3687ed="Multi-Audio");const _0x33fbd6=parseSize(_0x42c68c),_0x39a0c5=_0x1f7b62+'\x20'+_0x5b86f9+'\x20|\x20🌍\x20'+_0x3687ed+" | 💾 "+_0x33fbd6,_0x32303f=_0x5329a9['includes']('.mp4')?"MP4":"MKV";let _0x13bdcf='🎥\x20H.264';if(_0x30fa94["includes"]("hevc")||_0x30fa94["includes"]('x265')||_0x30fa94['includes']("h265"))_0x13bdcf=_0x30fa94["includes"]('hevc')?'⚡\x20HEVC':"🎥 H.265";else _0x30fa94['includes']("x264")&&(_0x13bdcf='🎥\x20H.264');let _0x45246f='';if(_0x30fa94['includes']('hdr10+'))_0x45246f=" | 🌈 HDR10+";else{if(_0x30fa94['includes']("hdr"))_0x45246f='\x20|\x20🌈\x20HDR';else{if(_0x30fa94["includes"]("sdr"))_0x45246f=" | 🌈 SDR";}}let _0x1a3dc3='';if(_0x30fa94["includes"]('web-dl')||_0x30fa94['includes']("webdl"))_0x1a3dc3='\x20|\x20📥\x20WEB-DL';else{if(_0x30fa94['includes']("web-rip")||_0x30fa94['includes']("webrip"))_0x1a3dc3=" | 🌐 WEB-Rip";else{if(_0x30fa94["includes"]('hd-rip')||_0x30fa94['includes']("hdrip"))_0x1a3dc3='\x20|\x20📺\x20HD-Rip';else{if(_0x30fa94["includes"]('bluray'))_0x1a3dc3='\x20|\x20💿\x20BluRay';}}}const _0x4f7bc5='🎞️\x20'+_0x32303f+_0x45246f+" | "+_0x13bdcf+_0x1a3dc3;let _0x283f75='🎵\x20AAC';if(_0x30fa94["includes"]("ddp5.1")||_0x30fa94["includes"]('ddp\x205.1')||_0x30fa94["includes"]("atmos"))_0x283f75='🎵\x20DDP\x205.1';else{if(_0x30fa94["includes"]('truehd'))_0x283f75='🎵\x20TrueHD';}let _0x22cd83='';if(_0x30fa94['includes']("atmos"))_0x22cd83=" | 🔊 Dolby Atmos";else{if(_0x30fa94["includes"]('dv')||_0x30fa94['includes']("dolby vision"))_0x22cd83=" | ♾ Dolby Vision";}const _0x58211f=_0x283f75+_0x22cd83,_0x119fab='🔗\x20'+_0x1f07e9;return _0x107fd7+'\x0a'+_0x39a0c5+'\x0a'+_0x4f7bc5+'\x0a'+_0x58211f+'\x0a'+_0x119fab;}function makeStream(_0x485b11,_0xce794a,_0x28a8cd,_0xd77dc5,_0x2afeb2,_0x1cfaa6,_0x475586,_0x4c08ed){const _0x456dde={_0x5e489d:0xca,_0x4ac45a:0xac,_0x1c459d:0x7b,_0x23a8e1:0x92,_0x18646c:0xaf},_0xb2c16f=_0x4e9a2b,_0x171381=_0x28a8cd["toLowerCase"](),_0x47d84e=buildDropdownMetadata(_0x485b11,_0x171381,_0x1cfaa6,_0x475586,_0x4c08ed,_0xd77dc5,_0xce794a,_0x2afeb2);let _0x2688b9="Original-Audio";const _0x26144c=(_0xce794a+'\x20'+_0x2afeb2)["toLowerCase"](),_0x177c40=['multi',"dual","hindi",'tamil',"telugu",'bengali','malayalam',"kannada","marathi",'punjabi'];return _0x177c40["some"](_0x4a3f87=>_0x26144c['includes'](_0x4a3f87))&&(_0x2688b9='Multi-Audio'),{'name':PROVIDER_NAME+" | "+_0x171381+'\x20|\x20'+_0x2688b9,'title':_0x47d84e,'size':_0x47d84e,'description':_0x47d84e,'url':_0x2afeb2,'quality':'','language':''};}function resolveTpiLink(_0xa0e161){const _0x5783f5={_0xb2382d:0xdc,_0x315228:0x9e};return __async(this,null,function*(){const _0x1f4ee5=_0x4dda;try{const _0x98b025=yield fetchText(_0xa0e161,{'headers':hdrs({'Referer':baseUrl+'/'})});if(!_0x98b025)return null;const _0x389a75=_0x98b025['match'](/<input\s+type="hidden"\s+name="token"\s+value="([^"]+)"/i);if(!_0x389a75)return null;const _0x48af9d=_0x389a75[0x1]["indexOf"]("aHR0c");if(_0x48af9d<0x0)return null;const _0x530676=atob(_0x389a75[0x1]["substring"](_0x48af9d));return _0x530676["startsWith"]("http")?_0x530676:null;}catch(_0x208532){}return null;});}function serverHandler(_0x885959,_0x363984){const _0x344bcf={_0x47cfdf:0x74,_0x362588:0x84,_0x32b2f7:0xb6,_0x514897:0xc9};return __async(this,null,function*(){const _0x53c408=_0x4dda;try{const _0x2d0438=yield Promise["race"]([__nvFetch("https://new4.zinkcloud.net/server-handler.php",{'method':'POST','headers':{'Content-Type':"application/json",'X-Requested-With':'XMLHttpRequest','User-Agent':currentUA},'body':JSON['stringify']({'server':_0x363984,'random_id':_0x885959})}),raceTimeout(FETCH_TIMEOUT)]),_0x3cb59b=yield _0x2d0438["json"]();if((_0x3cb59b==null?void 0x0:_0x3cb59b["success"])&&_0x3cb59b['url'])return _0x3cb59b['url'];}catch(_0x20667e){}return null;});}function processFile(_0x473301,_0x4734a1,_0x591063,_0x3efeb6,_0xa5e450,_0x93e92c,_0x57b536){const _0x4121d1={_0x1cdf14:0x9d,_0x23ea62:0xe4,_0x37b1ee:0x80,_0x275d4b:0xd5,_0x2ecde3:0x9a,_0x41b15c:0x96};return __async(this,null,function*(){const _0x517b48=_0x4dda,_0xb6c3e1=_0x3efeb6||parseQuality(_0x591063),_0x10b578=[];if(_0xb6c3e1['toUpperCase']()==="480P")return _0x10b578;const [_0x5d7d6e,_0x282e54]=yield Promise['all']([serverHandler(_0x4734a1,"hubcloud"),serverHandler(_0x4734a1,'worker')]);let _0x15cd4=_0x591063;if(_0x5d7d6e){const _0xee024c=yield fetchText(_0x5d7d6e,{'headers':hdrs()});if(_0xee024c){const _0x28961d=(_0xee024c["match"](/<title>(.*?)<\/title>/i)||[])[0x1]||'',_0x194627=cleanHubTitle(_0x28961d);_0x15cd4=_0x194627?_0x194627+'\x20'+parseSize(_0x591063):_0x591063;const _0x5baabd=_0xee024c['match'](/href="(https:\/\/gamerxyt\.com[^"]+)"/i);if(_0x5baabd){const _0x499a87=_0x5baabd[0x1]['replace'](/&amp;/g,'&'),_0x3f825d=yield fetchText(_0x499a87,{'headers':{'User-Agent':'Mozilla/5.0\x20(X11;\x20Ubuntu;\x20Linux\x20x86_64;\x20rv:152.0)\x20Gecko/20100101\x20Firefox/152.0','Accept':'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8','Accept-Language':"en-US,en;q=0.5",'Referer':_0x5d7d6e,'DNT':'1','Cookie':"xla=s4t"}});if(_0x3f825d&&_0x3f825d['length']>0x1f4){const _0x52f54d=[],_0x893335=/<a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;let _0x8702b0;while((_0x8702b0=_0x893335["exec"](_0x3f825d))!==null){const _0xb7caa0=_0x8702b0[0x1]["replace"](/&amp;/g,'&'),_0xdb9604=_0x8702b0[0x2]["replace"](/<[^>]+>/g,'')["trim"]();if(!_0xb7caa0||_0xb7caa0['includes']('javascript:')||/telegram|tg\/|pixeldrain|hubcloud\.cx|gpdl2/i['test'](_0xb7caa0))continue;if(!/cdn\.fsl-buckets\.life|r2\.cloudflarestorage|r2\.dev|workers\.dev|hub\.(latent|whistle)/i["test"](_0xb7caa0))continue;const _0x4b4efb=/workers\.dev/i["test"](_0xb7caa0)?'Worker':'FSLv2',_0x56ace9=_0xdb9604["match"](/(2160|1080|720|480)\s*[pP]/i);_0x52f54d["push"]({'url':_0xb7caa0,'type':_0x4b4efb,'quality':_0x56ace9?_0x56ace9[0x1]+'p':''});}for(const _0xa19458 of _0x52f54d)_0x10b578['push'](makeStream(_0x473301,_0x15cd4,_0xa19458["quality"]||_0xb6c3e1,_0xa19458["type"],_0xa19458['url'],_0xa5e450,_0x93e92c,_0x57b536));}}}}if(_0x282e54)_0x10b578['push'](makeStream(_0x473301,_0x15cd4,_0xb6c3e1,'Worker',_0x282e54,_0xa5e450,_0x93e92c,_0x57b536));return _0x10b578;});}function extractConfig(_0xb57376){try{const _0x4e10bf=_0xb57376['match'](/new HDVBPlayer\((\{[\s\S]*?\})\)/);if(_0x4e10bf)return JSON['parse'](_0x4e10bf[0x1]);const _0x4303e1=_0xb57376['match'](/(?:let|var|const)\s+\w+\s*=\s*(\{[\s\S]*?"file":[\s\S]*?\});/);if(_0x4303e1)return JSON['parse'](_0x4303e1[0x1]);}catch(_0x990238){}return null;}function getGemmaStreams(_0x990de8,_0x2a6789,_0x2e19d2,_0x5e2a52,_0x41036f,_0x5d4a8c){const _0x685cbe={_0x46aef5:0xbd,_0x1d2685:0x9b,_0x120e61:0xcb,_0x3e11ed:0x75,_0x49a2ac:0xbd,_0x233545:0xbd,_0x4f6869:0xc8,_0x946388:0xbd,_0x439685:0x9e,_0x5b856c:0xdf,_0x43d64f:0x98,_0x361a61:0xbf,_0x450dff:0x8f,_0x37e174:0xb4,_0x101083:0x71};return __async(this,null,function*(){const _0x14976e=_0x4dda,_0x5a87b4=[];try{const _0x2f353e='https://gemma416okl.com/play/'+_0x2a6789,_0x2b50c8=yield fetchText(_0x2f353e,{'headers':hdrs({'Referer':baseUrl+'/'})});if(!_0x2b50c8)return _0x5a87b4;const _0x523c7e=extractConfig(_0x2b50c8);if(!(_0x523c7e==null?void 0x0:_0x523c7e["file"])||!(_0x523c7e==null?void 0x0:_0x523c7e['key']))return _0x5a87b4;let _0xd9ba17=_0x523c7e["file"];if(!_0xd9ba17["includes"]('://'))_0xd9ba17='https://gemma416okl.com'+_0xd9ba17;const _0x3acc1c=_0x523c7e['key'],_0x2cedcf=yield fetchJson(_0xd9ba17,{'method':"POST",'headers':{'X-CSRF-TOKEN':_0x3acc1c,'Content-Type':'application/x-www-form-urlencoded','Origin':'https://gemma416okl.com','Referer':_0x2f353e}});if(!_0x2cedcf)return _0x5a87b4;const _0x16a03b=_0xd9ba17['substring'](0x0,_0xd9ba17['lastIndexOf']('/')+0x1);let _0xfac629=[];if(_0x2e19d2)for(const _0x2980f0 of _0x2cedcf){if(_0xfac629['length'])break;if(_0x2980f0['id']==_0x5e2a52||_0x2980f0['title']&&_0x2980f0['title']["includes"](String(_0x5e2a52))){if(!_0x2980f0['folder'])continue;for(const _0x2a92b3 of _0x2980f0['folder']){if(_0x2a92b3["episode"]==_0x41036f||_0x2a92b3['id']==_0x5e2a52+'-'+_0x41036f){if(!_0x2a92b3["folder"])continue;for(const _0x118ae6 of _0x2a92b3["folder"]){if(_0x118ae6["file"]&&_0x118ae6["file"]["startsWith"]('~'))_0xfac629['push'](_0x118ae6);}}}}}else for(const _0x57377b of _0x2cedcf){if(_0x57377b["file"]&&_0x57377b["file"]["startsWith"]('~'))_0xfac629['push'](_0x57377b);}for(const _0x5bcac2 of _0xfac629){const _0x11eae9=''+_0x16a03b+_0x5bcac2['file']["substring"](0x1)+".txt",_0x426388=yield fetchText(_0x11eae9,{'method':'POST','headers':{'X-CSRF-TOKEN':_0x3acc1c,'Content-Type':"application/x-www-form-urlencoded",'Origin':'https://gemma416okl.com','Referer':_0x2f353e}});if(_0x426388&&_0x426388["includes"](".m3u8")){const _0x35eada=buildDropdownMetadata(_0x990de8,'HD',_0x2e19d2,_0x5e2a52,_0x41036f,'Embed',_0x5bcac2["title"]||"Gemma",_0x426388),_0x3d84e0=_0x5bcac2['title']?'\x20|\x20'+_0x5bcac2["title"]:'';_0x5a87b4["push"]({'name':PROVIDER_NAME+" | hd | Gemma"+_0x3d84e0,'title':_0x35eada,'size':_0x35eada,'description':_0x35eada,'url':_0x426388['trim'](),'quality':'','language':'','headers':{'origin':'https://i-arch-400.keymi417exx.com','referer':"https://i-arch-400.keymi417exx.com/"}});}}}catch(_0x4ca536){}return _0x5a87b4;});}function scrapeZinkCloud(_0x237e2a,_0x1e580e,_0x197f2e,_0x5119ab,_0x536b1d,_0x284dd3){const _0x4c077b={_0x3684dd:0x9b,_0xf1232f:0xe4,_0x213ed5:0xb1,_0x57f868:0xda,_0x463316:0xd5,_0x2e4306:0x8f,_0x5467fc:0xad};return __async(this,null,function*(){const _0x3d8b42={_0x142c21:0xe4},_0x509d9a=_0x4dda,_0x102c81=[];try{const _0x374a6b=yield fetchText(baseUrl+"/?s="+encodeURIComponent(_0x1e580e));if(!_0x374a6b)return _0x102c81;const _0x32a51e=_0x5119ab?'tvshows':'movies',_0x3839e8=new RegExp('href=\x22(https?:\x5c/\x5c/[^\x5c/]+\x5c/'+_0x32a51e+'\x5c/([^\x22]+))\x22','ig');let _0x14b853,_0x537def;while((_0x537def=_0x3839e8["exec"](_0x374a6b))!==null){if(!_0x197f2e||_0x537def[0x1]["includes"](_0x197f2e)){_0x14b853=_0x537def[0x1];break;}}if(!_0x14b853)return _0x102c81;const _0x2472a9=yield fetchText(_0x14b853);if(!_0x2472a9)return _0x102c81;if(_0x5119ab){let _0x33ee58=null,_0x52d50a='',_0x4b2a79='';const _0x1048a1=_0x2472a9['split']('<div\x20class=\x22seriecontainer\x22>');for(let _0x552e2e=0x1;_0x552e2e<_0x1048a1['length'];_0x552e2e++){const _0x2021e1=_0x1048a1[_0x552e2e]['indexOf']("<div class=\"seriecontainer\">"),_0x11dcce=_0x2021e1>=0x0?_0x1048a1[_0x552e2e]['substring'](0x0,_0x2021e1):_0x1048a1[_0x552e2e],_0xb48b58=_0x11dcce["match"](/<p>([\s\S]*?)<\/p>/i);if(!_0xb48b58)continue;const _0x4f23cc=_0xb48b58[0x1]["match"](/Season\s*0?(\d+)/i);if(!_0x4f23cc||parseInt(_0x4f23cc[0x1])!==_0x536b1d)continue;const _0x502c84=[],_0x428274=/href="(https:\/\/tpi\.li\/[^"]+)"[^>]*>[\s\S]*?<span>([\s\S]*?)<\/span>/ig;let _0x538693;while((_0x538693=_0x428274['exec'](_0x11dcce))!==null){const _0x320453=_0x538693[0x2]["replace"](/<[^>]+>/g,'')["trim"](),_0x3954aa=parseQuality(_0x320453);if(_0x3954aa["toUpperCase"]()!=='480P')_0x502c84['push']({'tpiUrl':_0x538693[0x1],'quality':_0x3954aa,'label':_0x320453});}_0x502c84["sort"]((_0x5304a6,_0x25b33a)=>(parseInt(_0x25b33a["quality"])||0x0)-(parseInt(_0x5304a6['quality'])||0x0));_0x502c84['length']&&(_0x33ee58=_0x502c84[0x0]['tpiUrl'],_0x52d50a=_0x502c84[0x0]['quality'],_0x4b2a79=_0x502c84[0x0]['label']);break;}if(_0x33ee58){const _0x27f81a=yield resolveTpiLink(_0x33ee58);if(_0x27f81a){const _0x464fcd=yield fetchText(_0x27f81a,{'headers':hdrs()});if(_0x464fcd){const _0x7b0080=[],_0x564461=/href="(https:\/\/new3\.zinkcloud\.net\/file\/([^"]+))"[^>]*>\s*<span[^>]*>(.*?)<\/span>/ig;while((_0x537def=_0x564461["exec"](_0x464fcd))!==null){const _0x1fdf9a=_0x537def[0x3]['replace'](/<[^>]+>/g,'')["trim"]();if(_0x1fdf9a['toLowerCase']()['includes']('all\x20episodes'))continue;const _0x57832f=_0x1fdf9a['match'](/(?:EPISODE|EP|E)\s*[-_]?\s*0?(\d+)/i);_0x57832f&&parseInt(_0x57832f[0x1])===_0x284dd3&&_0x7b0080['push']({'id':_0x537def[0x2],'label':_0x1fdf9a+'\x20'+_0x4b2a79,'quality':_0x52d50a});}const _0x339e17=yield Promise['all'](_0x7b0080['map'](_0x2a689f=>processFile(_0x237e2a,_0x2a689f['id'],_0x2a689f['label'],_0x2a689f['quality'],!![],_0x536b1d,_0x284dd3)));for(const _0x4ad386 of _0x339e17['flat']())_0x102c81["push"](_0x4ad386);}}}}else{const _0x4727b0=[],_0x92a8a7=/href="(https:\/\/tpi\.li\/[^"]+)"[^>]*>[\s\S]*?<span>([\s\S]*?)<\/span>/ig;while((_0x537def=_0x92a8a7["exec"](_0x2472a9))!==null){_0x4727b0['push']({'tpiUrl':_0x537def[0x1],'label':_0x537def[0x2]["replace"](/<[^>]+>/g,'')['trim']()});}if(_0x4727b0['length']){const _0x22b3e1=yield Promise['all'](_0x4727b0['map'](_0x19e96f=>__async(this,null,function*(){const _0x3e5924=_0x509d9a,_0x5bacc7=yield resolveTpiLink(_0x19e96f['tpiUrl']);if(!_0x5bacc7)return null;const _0x733cf5=_0x5bacc7["match"](/\/file\/([^\/]+)$/);return _0x733cf5?{'id':_0x733cf5[0x1],'label':_0x19e96f['label']}:null;}))),_0x32049a=_0x22b3e1['filter'](Boolean),_0x91bd61=yield Promise['all'](_0x32049a["map"](_0x3bb527=>processFile(_0x237e2a,_0x3bb527['id'],_0x3bb527['label'],null,![],0x0,0x0)));for(const _0x5253a6 of _0x91bd61["flat"]())_0x102c81["push"](_0x5253a6);}}}catch(_0x4908fe){}return _0x102c81;});}function getStreams(_0x530d4d,_0x536ff7,_0x292943,_0x482b8d){const _0x240181={_0x4c5adb:0x9f,_0x53bc2c:0x81,_0x482c15:0xba,_0x4973c3:0xa0,_0x14363:0xbf,_0x114443:0x7e,_0x5cf05c:0x93,_0x247d31:0xd8,_0x3124dd:0x8f};return __async(this,null,function*(){const _0xa711c9={_0x2112dd:0xbb,_0x3e8e6a:0xa6},_0x28cf9c=_0x4dda;yield refreshDomains(),currentUA=UAS[Math["floor"](Math['random']()*UAS["length"])];const _0x5ed221=_0x536ff7==='series'||_0x536ff7==='tv',_0x272d37=[];let _0x58b65c='',_0x45a91c=null;try{_0x45a91c=yield fetchJson("https://api.themoviedb.org/3/"+(_0x5ed221?'tv':"movie")+'/'+_0x530d4d+"?api_key="+TMDB_API_KEY);if(_0x45a91c){const _0x3e6917=_0x5ed221?_0x45a91c["name"]:_0x45a91c["title"],_0x3a6ab3=_0x5ed221?(_0x45a91c["first_air_date"]||'')['split']('-')[0x0]:(_0x45a91c["release_date"]||'')['split']('-')[0x0];_0x58b65c=_0x5ed221?_0x3e6917+'\x20S'+String(_0x292943)["padStart"](0x2,'0')+'E'+String(_0x482b8d)["padStart"](0x2,'0'):''+_0x3e6917+(_0x3a6ab3?'\x20('+_0x3a6ab3+')':'');const _0x243008=yield scrapeZinkCloud(_0x45a91c,_0x3e6917,_0x3a6ab3,_0x5ed221,_0x292943,_0x482b8d);for(const _0x9f56ef of _0x243008)_0x272d37["push"](_0x9f56ef);}}catch(_0x44c8b0){}if(_0x45a91c)try{const _0x1ed05b=yield fetchJson('https://api.themoviedb.org/3/'+(_0x5ed221?'tv':"movie")+'/'+_0x530d4d+'/external_ids?api_key='+TMDB_API_KEY);if(_0x1ed05b==null?void 0x0:_0x1ed05b['imdb_id']){const _0x2ccdaf=yield getGemmaStreams(_0x45a91c,_0x1ed05b['imdb_id'],_0x5ed221,_0x292943,_0x482b8d,_0x58b65c);for(const _0x3d2eee of _0x2ccdaf)_0x272d37["push"](_0x3d2eee);}}catch(_0x1eb45e){}function _0x31437a(_0x3bb34b){const _0x130e1a=_0x28cf9c,_0x2f9f1f=_0x3bb34b['toLowerCase']();if(_0x2f9f1f['includes']("2160p")||_0x2f9f1f["includes"]('4k'))return 0x870;if(_0x2f9f1f["includes"]("1080p"))return 0x438;if(_0x2f9f1f["includes"]('720p'))return 0x2d0;return 0x0;}return _0x272d37['sort']((_0xbfddd5,_0x31d6a0)=>{const _0x898c87=_0x28cf9c;return _0x31437a(_0x31d6a0['name'])-_0x31437a(_0xbfddd5["name"]);});});}typeof module!=='undefined'&&module['exports']?module['exports']={'getStreams':getStreams}:global['getStreams']=getStreams;

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
  var PROVIDER = "zinkmovies";
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
