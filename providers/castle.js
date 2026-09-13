/*
 * nv-plugins castle.js — FULLY DECODED port of the All-in-One-Nuvio provider (4.23.0 best-settings pass).
 * Decoded from the obfuscated AIO build: string tables resolved, decoder machinery stripped,
 * every network call capped by an 8s deadline, nvio post-filter attached (en/tl audio gate,
 * >=720p quality gate, cross-provider dedupe). Behavior/endpoints identical to the AIO original.
 */
/* nv-plugins best-settings pass 4.23.0: hard 8s deadline on every network call */
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
var _0x44e1=function(){return "";};'use strict';const _0x476166=_0x44e1;/*rotation removed*/;/*decoder removed*/var __defProp=Object['defineProperty'],__getOwnPropSymbols=Object['getOwnPropertySymbols'],__hasOwnProp=Object['prototype']["hasOwnProperty"],__propIsEnum=Object["prototype"]["propertyIsEnumerable"],__defNormalProp=(_0x1bd8fe,_0x43a10c,_0x256223)=>_0x43a10c in _0x1bd8fe?__defProp(_0x1bd8fe,_0x43a10c,{'enumerable':!![],'configurable':!![],'writable':!![],'value':_0x256223}):_0x1bd8fe[_0x43a10c]=_0x256223,__spreadValues=(_0x82eee6,_0x25a6e1)=>{const _0x57b9b7=_0x476166;for(var _0xf7c831 in _0x25a6e1||(_0x25a6e1={}))if(__hasOwnProp['call'](_0x25a6e1,_0xf7c831))__defNormalProp(_0x82eee6,_0xf7c831,_0x25a6e1[_0xf7c831]);if(__getOwnPropSymbols)for(var _0xf7c831 of __getOwnPropSymbols(_0x25a6e1)){if(__propIsEnum["call"](_0x25a6e1,_0xf7c831))__defNormalProp(_0x82eee6,_0xf7c831,_0x25a6e1[_0xf7c831]);}return _0x82eee6;},__async=(_0x56dc30,_0x4ed561,_0x267797)=>{return new Promise((_0x170526,_0x13dda8)=>{const _0x2a7b44=_0x44e1;var _0x5e18b1=_0x51d46c=>{const _0x3e6ab5=_0x44e1;try{_0x4b0257(_0x267797["next"](_0x51d46c));}catch(_0x478a26){_0x13dda8(_0x478a26);}},_0x5c517a=_0x4da371=>{const _0xddfc2a=_0x44e1;try{_0x4b0257(_0x267797["throw"](_0x4da371));}catch(_0x2893a0){_0x13dda8(_0x2893a0);}},_0x4b0257=_0x29e7e7=>_0x29e7e7['done']?_0x170526(_0x29e7e7["value"]):Promise["resolve"](_0x29e7e7['value'])["then"](_0x5e18b1,_0x5c517a);_0x4b0257((_0x267797=_0x267797["apply"](_0x56dc30,_0x4ed561))["next"]());});},TMDB_API_KEY='439c478a771f35c05022f9feabcca01c',TMDB_BASE_URL="https://api.themoviedb.org/3",CASTLE_BASE='https://api.hlowb.com',PKG="com.external.castle",CHANNEL="IndiaA",CLIENT='1',LANG='en-US',API_HEADERS={'User-Agent':"okhttp/4.9.3",'Accept':"application/json",'Accept-Language':"en-US,en;q=0.9",'Connection':"Keep-Alive",'Referer':CASTLE_BASE},PLAYBACK_HEADERS={'User-Agent':'Mozilla/5.0\x20(Windows\x20NT\x2010.0;\x20Win64;\x20x64)\x20AppleWebKit/537.36\x20(KHTML,\x20like\x20Gecko)\x20Chrome/137.0.0.0\x20Safari/537.36','Accept':'video/webm,video/ogg,video/*;q=0.9,application/ogg;q=0.7,audio/*;q=0.6,*/*;q=0.5','Accept-Language':"en-US,en;q=0.9",'Accept-Encoding':"identity",'Connection':"keep-alive",'Sec-Fetch-Dest':'video','Sec-Fetch-Mode':"no-cors",'Sec-Fetch-Site':"cross-site",'DNT':'1'};function makeRequest(_0x1b363e){return __async(this,arguments,function*(_0x3d5cba,_0x27b3ee={}){const _0x455f3a=_0x44e1;try{const _0x1c6c59=yield __nvFetch(_0x3d5cba,{'method':_0x27b3ee["method"]||"GET",'headers':__spreadValues(__spreadValues({},API_HEADERS),_0x27b3ee['headers']),'body':_0x27b3ee['body']});if(!_0x1c6c59['ok'])throw new Error("HTTP "+_0x1c6c59["status"]+':\x20'+_0x1c6c59["statusText"]);return _0x1c6c59;}catch(_0x1cd416){console["error"]("[Castle] Request failed for "+_0x3d5cba+':\x20'+_0x1cd416["message"]);throw _0x1cd416;}});}function extractCipherFromResponse(_0x409352){return __async(this,null,function*(){const _0x3ad6ed=_0x44e1,_0x3f740d=yield _0x409352["text"](),_0x4fa311=_0x3f740d["trim"]();if(!_0x4fa311)throw new Error("Empty response");try{const _0x2dc537=JSON["parse"](_0x4fa311);if(_0x2dc537&&_0x2dc537["data"]&&typeof _0x2dc537['data']==='string')return _0x2dc537["data"]["trim"]();}catch(_0x49255b){}return _0x4fa311;});}function extractDataBlock(_0x5c1776){const _0x20a912=_0x476166;if(_0x5c1776&&_0x5c1776["data"]&&typeof _0x5c1776['data']==="object")return _0x5c1776["data"];return _0x5c1776||{};}function getTMDBDetails(_0x45bec2,_0xd6d16b){return __async(this,null,function*(){const _0x44aa1b=_0x44e1,_0x1fa830=_0xd6d16b==='tv'?'tv':"movie",_0x4e7160=TMDB_BASE_URL+'/'+_0x1fa830+'/'+_0x45bec2+"?api_key="+TMDB_API_KEY+"&append_to_response=external_ids",_0x220bdb=yield makeRequest(_0x4e7160),_0x2565cd=yield _0x220bdb["json"](),_0xfa7224=_0xd6d16b==='tv'?_0x2565cd["name"]:_0x2565cd["title"],_0x23eea7=_0xd6d16b==='tv'?_0x2565cd["first_air_date"]:_0x2565cd["release_date"],_0x451860=_0x23eea7?parseInt(_0x23eea7['split']('-')[0x0]):null;return{'title':_0xfa7224,'year':_0x451860,'tmdbId':_0x45bec2};});}function decryptCastle(_0xc6ebf1,_0x4830a9){return __async(this,null,function*(){const _0x32c1f5=_0x44e1;console['log']("[Castle] Starting local AES-CBC decryption...");try{const _0x124330=require("crypto-js");if(typeof __crypto_aes_decrypt_raw!=='undefined'){const _0x23174d=_0x124330["AES"]["decrypt"];_0x124330['AES']["decrypt"]=function(_0xee5ebe,_0xdc47ba,_0x350562){const _0x5d9219=_0x32c1f5;try{const _0xe2ca99=_0x56fed0=>{const _0x4dd3f1=_0x44e1,_0x4f63a2=new Uint8Array(_0x56fed0['sigBytes']);for(let _0x3866bd=0x0;_0x3866bd<_0x56fed0["sigBytes"];_0x3866bd++){_0x4f63a2[_0x3866bd]=_0x56fed0["words"][_0x3866bd>>>0x2]>>>0x18-_0x3866bd%0x4*0x8&0xff;}return _0x4f63a2;},_0x2a1521=_0x36e655=>{const _0x144bda=_0x44e1;if(_0x36e655 instanceof Uint8Array)return _0x36e655;if(_0x36e655 instanceof ArrayBuffer)return new Uint8Array(_0x36e655);if(_0x36e655&&typeof _0x36e655["length"]==="number")return new Uint8Array(Array["prototype"]['slice']["call"](_0x36e655));return new Uint8Array(0x0);},_0x5d8830=typeof _0xee5ebe==='string'?new Uint8Array(Array["from"](atob(_0xee5ebe),_0x42cb6d=>_0x42cb6d["charCodeAt"](0x0))):_0xee5ebe["ciphertext"]?_0xe2ca99(_0xee5ebe["ciphertext"]):_0x2a1521(_0xee5ebe),_0x300d1d=_0xe2ca99(_0xdc47ba),_0x25e833=_0x350562&&_0x350562['iv']?_0xe2ca99(_0x350562['iv']):new Uint8Array(0x0),_0x37b488=_0x350562&&_0x350562["mode"]||"AES-CBC",_0x155c77=typeof Int8Array!=="undefined"?new Int8Array(_0x300d1d["buffer"]):_0x300d1d,_0x579db0=typeof Int8Array!=='undefined'?new Int8Array(_0x25e833['buffer']):_0x25e833,_0x2d2b32=typeof Int8Array!=="undefined"?new Int8Array(_0x5d8830['buffer']):_0x5d8830,_0x5ba30d=__crypto_aes_decrypt_raw(_0x37b488,_0x155c77,_0x579db0,_0x2d2b32),_0xd18d9e=new TextDecoder()["decode"](_0x5ba30d);return{'toString':function(){return _0xd18d9e;}};}catch(_0xe309ac){return console["error"]("[Castle JNI Patch] Decrypt failed, falling back:",_0xe309ac),_0x23174d["call"](_0x124330['AES'],_0xee5ebe,_0xdc47ba,_0x350562);}};}const _0x227260='T!BgJB',_0x482d9c=_0x124330['enc']["Base64"]["parse"](_0x4830a9),_0x1339d3=_0x124330["enc"]["Utf8"]['parse'](_0x227260),_0xd52821=_0x482d9c['concat'](_0x1339d3);let _0x59f612;if(_0xd52821["sigBytes"]<0x10){const _0x129518=_0x124330["lib"]["WordArray"]["create"](new Array(0x10-_0xd52821['sigBytes'])["fill"](0x0));_0x59f612=_0xd52821['concat'](_0x129518);}else _0xd52821["sigBytes"]>0x10?_0x59f612=_0x124330['lib']['WordArray']["create"](_0xd52821["words"]["slice"](0x0,0x4),0x10):_0x59f612=_0xd52821;const _0x305fbb=_0x59f612,_0x165e51=_0x124330["AES"]["decrypt"](_0xc6ebf1,_0x59f612,{'iv':_0x305fbb,'mode':_0x124330["mode"]['CBC'],'padding':_0x124330['pad']["Pkcs7"]}),_0x3adb8e=_0x165e51["toString"](_0x124330['enc']["Utf8"]);if(!_0x3adb8e)throw new Error("Decryption resulted in empty string (possible key/IV mismatch)");return console["log"]('[Castle]\x20Local\x20decryption\x20successful'),_0x3adb8e;}catch(_0x282f45){console["error"]('[Castle]\x20Local\x20decryption\x20failed:\x20'+_0x282f45['message']);throw _0x282f45;}});}function getSecurityKey(){return __async(this,null,function*(){const _0x436439=_0x44e1;console['log']('[Castle]\x20Fetching\x20security\x20key...');const _0xcc4799=CASTLE_BASE+"/v0.1/system/getSecurityKey/1?channel="+CHANNEL+"&clientType="+CLIENT+"&lang="+LANG,_0x25d0a0=yield makeRequest(_0xcc4799),_0x5985bc=yield _0x25d0a0['json']();if(_0x5985bc["code"]!==0xc8||!_0x5985bc["data"])throw new Error("Security key API error: "+JSON["stringify"](_0x5985bc));return console["log"]("[Castle] Security key obtained"),_0x5985bc["data"];});}function searchCastle(_0x1a0a07,_0x15b1e2,_0x560f28=0x1,_0x208034=0x1e){return __async(this,null,function*(){const _0x3a4973=_0x44e1;console["log"]('[Castle]\x20Searching\x20for:\x20'+_0x15b1e2);const _0x4a939a=new URLSearchParams({'channel':CHANNEL,'clientType':CLIENT,'keyword':_0x15b1e2,'lang':LANG,'mode':'1','packageName':PKG,'page':_0x560f28["toString"](),'size':_0x208034['toString']()}),_0x1cc3db=CASTLE_BASE+"/film-api/v1.1.0/movie/searchByKeyword?"+_0x4a939a["toString"](),_0x20be66=yield makeRequest(_0x1cc3db),_0xd7a2bd=yield extractCipherFromResponse(_0x20be66),_0x703ccd=yield decryptCastle(_0xd7a2bd,_0x1a0a07);return JSON["parse"](_0x703ccd);});}function getDetails(_0x1b40c9,_0x33dbe1){return __async(this,null,function*(){const _0x743ebf=_0x44e1;console["log"]("[Castle] Fetching details for movieId: "+_0x33dbe1);const _0x588fee=CASTLE_BASE+"/film-api/v1.9.9/movie?channel="+CHANNEL+'&clientType='+CLIENT+"&lang="+LANG+'&movieId='+_0x33dbe1+"&packageName="+PKG,_0x2289e0=yield makeRequest(_0x588fee),_0x2865b4=yield extractCipherFromResponse(_0x2289e0),_0x217860=yield decryptCastle(_0x2865b4,_0x1b40c9);return JSON["parse"](_0x217860);});}function getVideoV1(_0x5db07e,_0x5e010,_0x5b503c,_0x39cb02,_0x52da17=0x2){return __async(this,null,function*(){const _0x3beb02=_0x44e1;console["log"]("[Castle] Fetching video (v1) for movieId: "+_0x5e010+", languageId: "+_0x39cb02);const _0x4153b9=CASTLE_BASE+"/film-api/v2.0.1/movie/getVideo2?clientType="+CLIENT+"&packageName="+PKG+"&channel="+CHANNEL+'&lang='+LANG,_0x1eb498={'mode':'1','appMarket':"GuanWang",'clientType':CLIENT,'woolUser':"false",'apkSignKey':"ED0955EB04E67A1D9F3305B95454FED485261475",'androidVersion':'13','movieId':_0x5e010["toString"](),'episodeId':_0x5b503c["toString"](),'languageId':_0x39cb02["toString"](),'isNewUser':"true",'resolution':_0x52da17['toString'](),'packageName':PKG},_0x10b03a=yield makeRequest(_0x4153b9,{'method':"POST",'headers':{'Content-Type':"application/json"},'body':JSON["stringify"](_0x1eb498)}),_0x3b5806=yield extractCipherFromResponse(_0x10b03a),_0x3545cc=yield decryptCastle(_0x3b5806,_0x5db07e);return JSON['parse'](_0x3545cc);});}function getVideo2(_0x13e2e0,_0x4e860c,_0x1b29ed,_0x12b2eb=0x2){return __async(this,null,function*(){const _0x46256f=_0x44e1;console["log"]("[Castle] Fetching video (v2) for movieId: "+_0x4e860c+", episodeId: "+_0x1b29ed);const _0x492b01=CASTLE_BASE+"/film-api/v2.0.1/movie/getVideo2?clientType="+CLIENT+"&packageName="+PKG+"&channel="+CHANNEL+"&lang="+LANG,_0x2bbf47={'mode':'1','appMarket':"GuanWang",'clientType':CLIENT,'woolUser':"false",'apkSignKey':"ED0955EB04E67A1D9F3305B95454FED485261475",'androidVersion':'13','movieId':_0x4e860c["toString"](),'episodeId':_0x1b29ed["toString"](),'isNewUser':"true",'resolution':_0x12b2eb["toString"](),'packageName':PKG},_0x334736=yield makeRequest(_0x492b01,{'method':"POST",'headers':{'Content-Type':"application/json"},'body':JSON["stringify"](_0x2bbf47)}),_0x891bc9=yield extractCipherFromResponse(_0x334736),_0x33520e=yield decryptCastle(_0x891bc9,_0x13e2e0);return JSON["parse"](_0x33520e);});}function findCastleMovieId(_0x57fcd6,_0x4f8418){return __async(this,null,function*(){const _0x1728f4=_0x44e1,_0x26af00=_0x4f8418['year']?_0x4f8418["title"]+'\x20'+_0x4f8418["year"]:_0x4f8418['title'],_0x4d704e=yield searchCastle(_0x57fcd6,_0x26af00),_0x59afbd=extractDataBlock(_0x4d704e),_0x8a8050=_0x59afbd["rows"]||[];if(_0x8a8050["length"]===0x0)throw new Error('No\x20search\x20results\x20found');for(const _0x255a56 of _0x8a8050){const _0x20be27=(_0x255a56["title"]||_0x255a56["name"]||'')["toLowerCase"](),_0x4f2b66=_0x4f8418['title']["toLowerCase"]();if(_0x20be27["includes"](_0x4f2b66)||_0x4f2b66["includes"](_0x20be27)){const _0x38ac5b=_0x255a56['id']||_0x255a56["redirectId"]||_0x255a56["redirectIdStr"];if(_0x38ac5b)return console["log"]('[Castle]\x20Found\x20match:\x20'+(_0x255a56['title']||_0x255a56["name"])+" (id: "+_0x38ac5b+')'),_0x38ac5b["toString"]();}}const _0x4d2a6e=_0x8a8050[0x0],_0x3a963b=_0x4d2a6e['id']||_0x4d2a6e["redirectId"]||_0x4d2a6e['redirectIdStr'];if(_0x3a963b)return console['log']("[Castle] Using first result: "+(_0x4d2a6e['title']||_0x4d2a6e["name"])+" (id: "+_0x3a963b+')'),_0x3a963b['toString']();throw new Error("Could not extract movie ID from search results");});}/*string-table removed*/function getQualityValue(_0x2ea31c){const _0x5bcb63=_0x476166;if(!_0x2ea31c)return 0x0;const _0x4f5e3d=_0x2ea31c["toString"]()['toLowerCase']()["replace"](/^(sd|hd|fhd|uhd|4k)\s*/i,'')["replace"](/p$/,'')["trim"](),_0x28cc18={'4k':0x870,'2160':0x870,'1440':0x5a0,'1080':0x438,'720':0x2d0,'480':0x1e0,'360':0x168,'240':0xf0};if(_0x28cc18[_0x4f5e3d])return _0x28cc18[_0x4f5e3d];const _0x3c9cf9=parseInt(_0x4f5e3d);if(!isNaN(_0x3c9cf9)&&_0x3c9cf9>0x0)return _0x3c9cf9;return 0x0;}function formatSize(_0x2ca7d8){const _0x282182=_0x476166;if(typeof _0x2ca7d8!=="number"||_0x2ca7d8<=0x0)return "Unknown";if(_0x2ca7d8>0x3b9aca00)return(_0x2ca7d8/0x3b9aca00)['toFixed'](0x2)+" GB";return(_0x2ca7d8/0xf4240)["toFixed"](0x0)+" MB";}function resolutionToQuality(_0x4bfeef){const _0x3385b4=_0x476166,_0x2d7fe4={0x1:"480p",0x2:'720p',0x3:"1080p"};return _0x2d7fe4[_0x4bfeef]||_0x4bfeef+'p';}function processVideoResponse(_0x51d20f,_0x73c86a,_0x29525d,_0x2a9997,_0xc0905c,_0x463154){const _0x4ac61c=_0x476166,_0x4a3539=[],_0x5df573=extractDataBlock(_0x51d20f),_0x4355a9=_0x5df573['videoUrl'];if(!_0x4355a9)return console["log"]("[Castle] No videoUrl found in response"),_0x4a3539;const _0x18d63b=[];_0x5df573["subtitles"]&&Array["isArray"](_0x5df573["subtitles"])&&_0x5df573['subtitles']["forEach"](_0x6fb016=>{const _0x3030ee=_0x4ac61c;_0x6fb016["url"]&&_0x18d63b["push"]({'url':_0x6fb016['url'],'language':_0x6fb016['abbreviate']||"Unknown",'name':_0x6fb016["title"]||_0x6fb016["abbreviate"]||"Unknown",'headers':PLAYBACK_HEADERS});});let _0x1e4135=_0x73c86a['title']||"Unknown";_0x73c86a['year']&&(_0x1e4135+='\x20('+_0x73c86a["year"]+')');_0x29525d&&_0x2a9997&&(_0x1e4135=_0x73c86a["title"]+'\x20S'+String(_0x29525d)["padStart"](0x2,'0')+'E'+String(_0x2a9997)['padStart'](0x2,'0'));const _0x36522a=resolutionToQuality(_0xc0905c);if(_0x5df573['videos']&&Array["isArray"](_0x5df573["videos"]))for(const _0x2adc37 of _0x5df573['videos']){let _0x40004a=_0x2adc37['resolutionDescription']||_0x2adc37['resolution']||_0x36522a;_0x40004a=_0x40004a["replace"](/^(SD|HD|FHD)\s+/i,'');const _0x57d84b=_0x463154?"Castle "+_0x463154+" - "+_0x40004a:"Castle - "+_0x40004a;_0x4a3539['push']({'name':_0x57d84b,'title':_0x1e4135,'url':_0x2adc37["url"]||_0x4355a9,'quality':_0x40004a,'size':formatSize(_0x2adc37['size']),'headers':PLAYBACK_HEADERS,'provider':"castle",'subtitles':_0x18d63b});}else{const _0x23119a=_0x463154?"Castle "+_0x463154+" - "+_0x36522a:'Castle\x20-\x20'+_0x36522a;_0x4a3539["push"]({'name':_0x23119a,'title':_0x1e4135,'url':_0x4355a9,'quality':_0x36522a,'size':formatSize(_0x5df573["size"]),'headers':PLAYBACK_HEADERS,'provider':"castle",'subtitles':_0x18d63b});}return _0x4a3539;}function getStreams(_0x4e2678,_0x308ce5,_0x4360e6,_0x3a120a){return __async(this,null,function*(){const _0x40c17b=_0x44e1;console["log"]('[Castle]\x20Starting\x20extraction\x20for\x20TMDB\x20ID:\x20'+_0x4e2678+',\x20Type:\x20'+_0x308ce5+(_0x308ce5==='tv'?", S:"+_0x4360e6+'E:'+_0x3a120a:''));try{const _0x49acb1=yield getTMDBDetails(_0x4e2678,_0x308ce5);console['log']("[Castle] TMDB Info: \""+_0x49acb1["title"]+'\x22\x20('+(_0x49acb1["year"]||'N/A')+')');const _0x3a9a82=yield getSecurityKey(),_0xc7ae78=yield findCastleMovieId(_0x3a9a82,_0x49acb1);let _0x581633=yield getDetails(_0x3a9a82,_0xc7ae78),_0x53456a=_0xc7ae78;if(_0x308ce5==='tv'&&_0x4360e6&&_0x3a120a){const _0x31bf4c=extractDataBlock(_0x581633),_0x49de5f=_0x31bf4c["seasons"]||[],_0x28e6b7=_0x49de5f["find"](_0x2fba64=>_0x2fba64["number"]===_0x4360e6);_0x28e6b7&&_0x28e6b7["movieId"]&&_0x28e6b7["movieId"]!==_0xc7ae78&&(console["log"]('[Castle]\x20Fetching\x20season\x20'+_0x4360e6+" details..."),_0x581633=yield getDetails(_0x3a9a82,_0x28e6b7["movieId"]['toString']()),_0x53456a=_0x28e6b7["movieId"]["toString"]());}const _0x28285a=extractDataBlock(_0x581633),_0x5a3185=_0x28285a["episodes"]||[];let _0x278ae7=null;if(_0x308ce5==='tv'&&_0x4360e6&&_0x3a120a){const _0x3a26a4=_0x5a3185["find"](_0x40594b=>_0x40594b["number"]===_0x3a120a);_0x3a26a4&&_0x3a26a4['id']&&(_0x278ae7=_0x3a26a4['id']["toString"]());}else _0x5a3185["length"]>0x0&&(_0x278ae7=_0x5a3185[0x0]['id']["toString"]());if(!_0x278ae7)throw new Error("Could not find episode ID");const _0x32e04c=_0x5a3185["find"](_0x5b0c72=>_0x5b0c72['id']['toString']()===_0x278ae7),_0x568af5=_0x32e04c&&_0x32e04c["tracks"]||[],_0x5e477c=0x2,_0xcfb5e5=[];for(const _0x26219c of _0x568af5){const _0x47f944=_0x26219c["languageName"]||_0x26219c["abbreviate"]||"Unknown";if(_0x26219c["existIndividualVideo"]&&_0x26219c["languageId"])try{console["log"]("[Castle] Fetching "+_0x47f944+'\x20(languageId:\x20'+_0x26219c["languageId"]+')');const _0x133c6=yield getVideoV1(_0x3a9a82,_0x53456a,_0x278ae7,_0x26219c['languageId'],_0x5e477c),_0x31a517=processVideoResponse(_0x133c6,_0x49acb1,_0x4360e6,_0x3a120a,_0x5e477c,'['+_0x47f944+']');_0x31a517["length"]>0x0&&(console["log"]("[Castle] ✅ "+_0x47f944+": Found "+_0x31a517["length"]+'\x20streams'),_0xcfb5e5["push"](..._0x31a517));}catch(_0x524520){console["log"]("[Castle] ⚠️ "+_0x47f944+": Failed - "+_0x524520["message"]);}}if(_0xcfb5e5['length']===0x0){console["log"]("[Castle] Falling back to shared stream (v2)");const _0x4916cb=yield getVideo2(_0x3a9a82,_0x53456a,_0x278ae7,_0x5e477c),_0x5306a6=processVideoResponse(_0x4916cb,_0x49acb1,_0x4360e6,_0x3a120a,_0x5e477c,'[Shared]');_0xcfb5e5["push"](..._0x5306a6);}return _0xcfb5e5["sort"]((_0x10ef39,_0x38ac31)=>getQualityValue(_0x38ac31["quality"])-getQualityValue(_0x10ef39["quality"])),console["log"]("[Castle] Total streams found: "+_0xcfb5e5["length"]),_0xcfb5e5;}catch(_0x90f7a8){return console["error"]('[Castle]\x20Error:\x20'+_0x90f7a8["message"]),[];}});}module["exports"]={'getStreams':getStreams};

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
  var PROVIDER = "castle";
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
    var p = fetch(url, opts).then(function (r) {
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
            // nv best-settings 4.23.0: hard 12s cap on the whole provider run
            r = Promise.race([r, new Promise(function (res) {
              var dl = setTimeout(function () { res([]); }, 12000);
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
