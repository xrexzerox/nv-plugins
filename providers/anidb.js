/*
 * nv-plugins anidb.js — FULLY DECODED port of the All-in-One-Nuvio provider (4.24.0 merge pass).
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
var _0x15ba=function(){return "";};const _0x4bb611=_0x15ba;/*rotation removed*/;var __async=(_0x3201be,_0x47356b,_0x5aa756)=>{return new Promise((_0x14ddc2,_0x4f6472)=>{const _0x3fb712=_0x15ba;var _0x198337=_0x477364=>{try{_0x51e3f4(_0x5aa756['next'](_0x477364));}catch(_0x1535ed){_0x4f6472(_0x1535ed);}},_0x3758e1=_0x1bb98b=>{try{_0x51e3f4(_0x5aa756['throw'](_0x1bb98b));}catch(_0x114279){_0x4f6472(_0x114279);}},_0x51e3f4=_0x5a9902=>_0x5a9902["done"]?_0x14ddc2(_0x5a9902["value"]):Promise["resolve"](_0x5a9902['value'])['then'](_0x198337,_0x3758e1);_0x51e3f4((_0x5aa756=_0x5aa756['apply'](_0x3201be,_0x47356b))['next']());});},cheerio=__nvRequire('cheerio-without-node-native'),TMDB_API_KEY='1865f43a0549ca50d341dd9ab8b29f49',BASE_URL="https://anidb.app",USER_AGENT="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";function getTmdbInfo(_0x2c6410,_0x2668b5,_0x507ecc,_0x2885de){const _0x385ad5={_0x2f2dff:0xcb,_0x2e1e2c:0xcb,_0x2ac5b3:0xf0,_0x8e28d8:0xbe,_0x34ca4f:0xea,_0xa7efb0:0xb3,_0x50cf4a:0xca};return __async(this,null,function*(){const _0x4e03c4=_0x15ba,_0x4b1147=_0x2668b5==='tv'?'tv':'movie',_0x5374d6=Number["isInteger"](_0x507ecc)?_0x507ecc:0x1,_0x2c99e3=Number["isInteger"](_0x2885de)?_0x2885de:0x1;try{if(_0x2668b5==='tv'){const _0x164a10='https://api.themoviedb.org/3/tv/'+_0x2c6410+'?api_key='+TMDB_API_KEY,_0x5d0f33=yield __nvFetch(_0x164a10,{'headers':{'User-Agent':USER_AGENT,'Accept':'application/json'}});if(!_0x5d0f33['ok'])return{'title':'','year':null,'runtime':0x0};const _0xcaedb8=yield _0x5d0f33['json'](),_0x1f57be=_0xcaedb8['name']||'',_0x22eb13=_0xcaedb8["first_air_date"]?parseInt(_0xcaedb8['first_air_date']['slice'](0x0,0x4),0xa):null,_0x5ae794="https://api.themoviedb.org/3/tv/"+_0x2c6410+'/season/'+_0x5374d6+'/episode/'+_0x2c99e3+'?api_key='+TMDB_API_KEY,_0x528a1c=yield __nvFetch(_0x5ae794,{'headers':{'User-Agent':USER_AGENT,'Accept':"application/json"}});let _0x447c00=_0xcaedb8["episode_run_time"]?_0xcaedb8['episode_run_time'][0x0]:0x0;if(_0x528a1c['ok']){const _0x35eabd=yield _0x528a1c['json']();if(_0x35eabd['runtime'])_0x447c00=_0x35eabd["runtime"];}return{'title':_0x1f57be,'year':_0x22eb13,'runtime':_0x447c00};}else{const _0x18407a="https://api.themoviedb.org/3/movie/"+_0x2c6410+"?api_key="+TMDB_API_KEY,_0x375c05=yield __nvFetch(_0x18407a,{'headers':{'User-Agent':USER_AGENT,'Accept':"application/json"}});if(!_0x375c05['ok'])return{'title':'','year':null,'runtime':0x0};const _0x4cfc62=yield _0x375c05["json"](),_0x3c4ede=_0x4cfc62["release_date"]?parseInt(_0x4cfc62["release_date"]['slice'](0x0,0x4),0xa):null;return{'title':_0x4cfc62["title"]||'','year':_0x3c4ede,'runtime':_0x4cfc62['runtime']||0x0};}}catch(_0x213d24){return{'title':'','year':null,'runtime':0x0};}});}function normalize(_0x3736ac){const _0x5d5041={_0x3b7518:0xbd,_0x26707a:0xc2},_0x32ba83=_0x4bb611;return String(_0x3736ac||'')['toLowerCase']()["replace"](/[^a-z0-9]+/g,'\x20')["trim"]();}function rankResults(_0x25b0ce,_0xe810ca){const _0x4c88b1={_0x206d9e:0xb0,_0x5c87fb:0xb0,_0x4cd509:0xda},_0x3874a0=_0x4bb611,_0x9ee06d=normalize(_0xe810ca),_0xbc5174=[],_0x32b90e=[];for(let _0x59c216=0x0;_0x59c216<_0x25b0ce["length"];_0x59c216++){const _0x51a8fd=normalize(_0x25b0ce[_0x59c216]['title']);if(_0x51a8fd===_0x9ee06d)_0xbc5174["push"](_0x25b0ce[_0x59c216]);else{if(_0x51a8fd['indexOf'](_0x9ee06d)!==-0x1||_0x9ee06d['indexOf'](_0x51a8fd)!==-0x1)_0x32b90e["push"](_0x25b0ce[_0x59c216]);}}return _0xbc5174["concat"](_0x32b90e);}function absolutize(_0x26b9cc){const _0x21a207={_0x4e9df6:0xae,_0x10a1df:0xf3},_0x56fe15=_0x4bb611;if(!_0x26b9cc)return'';if(_0x26b9cc['indexOf']("http")===0x0)return _0x26b9cc;if(_0x26b9cc["indexOf"]('//')===0x0)return "https:"+_0x26b9cc;if(_0x26b9cc['charAt'](0x0)==='/')return BASE_URL+_0x26b9cc;return BASE_URL+'/'+_0x26b9cc;}function searchSite(_0x54b77e){const _0x3c6cec={_0x360679:0xf1},_0x131591={_0xb64e89:0xdb,_0x40552d:0xaa,_0x151e34:0xf2,_0x3bda77:0xc2};return __async(this,null,function*(){const _0x104412=_0x15ba,_0x9fb706=[],_0x354c9d={};let _0x2109b2;try{const _0x2ff12a=yield __nvFetch(BASE_URL+"/browse?q="+encodeURIComponent(_0x54b77e),{'headers':{'User-Agent':USER_AGENT,'Accept':"text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",'Accept-Language':"en-US,en;q=0.9"}});_0x2109b2=yield _0x2ff12a['text']();}catch(_0x2dcf28){return _0x9fb706;}const _0x446cd0=cheerio["load"](_0x2109b2);return _0x446cd0("a.anime-card")['each'](function(_0x3a5c27,_0x377962){const _0x433d16=_0x104412,_0x2a78ff=absolutize(_0x446cd0(_0x377962)["attr"]('href')||''),_0xa5e15a=(_0x446cd0(_0x377962)['attr']('title')||_0x446cd0(_0x377962)["find"]("img")["attr"]("alt")||'')["trim"]();_0x2a78ff&&_0xa5e15a&&!_0x354c9d[_0x2a78ff]&&(_0x354c9d[_0x2a78ff]=!![],_0x9fb706['push']({'url':_0x2a78ff,'title':_0xa5e15a}));}),_0x9fb706;});}function getEpisodes(_0x1d5ecf){const _0x17cee0={_0x3974c9:0xcc,_0x183a8d:0xc9};return __async(this,null,function*(){const _0x30a83a=_0x15ba,_0x57c586=yield __nvFetch(BASE_URL+"/api/frontend/anime/"+_0x1d5ecf+'/episodes',{'headers':{'User-Agent':USER_AGENT,'X-Requested-With':"XMLHttpRequest"}}),_0x1de86c=yield _0x57c586["json"]();return _0x1de86c&&_0x1de86c["episodes"]?_0x1de86c["episodes"]:[];});}/*string-table removed*/function getLanguages(_0x465bf5,_0x353f32){const _0x1a5071={_0x441614:0xba,_0x5bdf7d:0xd8};return __async(this,null,function*(){const _0x24b7aa=_0x15ba,_0x3fd6ec=yield __nvFetch(BASE_URL+"/api/frontend/episode/"+_0x465bf5+'/languages',{'headers':{'User-Agent':USER_AGENT,'X-Requested-With':'XMLHttpRequest','Referer':BASE_URL+"/anime/"+_0x353f32}}),_0x7fe0f0=yield _0x3fd6ec['json']();return _0x7fe0f0&&_0x7fe0f0["languages"]?_0x7fe0f0["languages"]:[];});}var HLS_REGEXES=[/file\s*:\s*["'](https?:\/\/[^"']+\.m3u8[^"']*)["']/i,/sources\s*:\s*\[\s*\{[^}]*file\s*:\s*["'](https?:\/\/[^"']+\.m3u8[^"']*)["']/i,/["'](https?:\/\/[^"']+\/master\.m3u8[^"']*)["']/i,/["'](https?:\/\/[^"']+\.m3u8[^"']*)["']/i];function extractEmbed(_0x24053c){const _0x5438e7={_0x10cf23:0xb6};return __async(this,null,function*(){const _0x5a4ab9=_0x15ba;try{const _0x378bcd=yield __nvFetch(_0x24053c,{'headers':{'User-Agent':USER_AGENT,'Referer':BASE_URL+'/'}}),_0x4eba61=yield _0x378bcd["text"]();for(let _0xa21305=0x0;_0xa21305<HLS_REGEXES['length'];_0xa21305++){const _0x2e03fd=_0x4eba61["match"](HLS_REGEXES[_0xa21305]);if(_0x2e03fd&&_0x2e03fd[0x1])return _0x2e03fd[0x1];}}catch(_0x3f4868){}return null;});}function getStreams(_0xa7d540,_0x41060f,_0x37ec66,_0x45fdec){const _0x353538={_0x581c7c:0xbf,_0x5c10bd:0xc5,_0x210dd0:0xfa,_0x1bd778:0xec,_0xceeaae:0xe6,_0x3212c2:0xce,_0x4fdf11:0xeb,_0x501d83:0xab,_0x4ad37a:0xdf,_0xf6df98:0xdc,_0x2ee0f0:0xe3,_0xb6bc62:0xc1,_0x54cd17:0xc1,_0x44b1cd:0xe5,_0x54e52e:0xbb,_0x1eb1f3:0xe9,_0x506212:0xcd,_0x35e168:0xd7,_0x2432e2:0xb0,_0x1ae731:0xee,_0x5396f7:0xb2,_0x4c7641:0xc7,_0x19588f:0xd5};return __async(this,null,function*(){const _0x435279=_0x15ba;try{const _0x2988e6=yield getTmdbInfo(_0xa7d540,_0x41060f,_0x37ec66,_0x45fdec);if(!_0x2988e6["title"])return[];console['log']("[AniDB] "+_0x41060f+'\x20\x22'+_0x2988e6['title']+"\" S"+_0x37ec66+'E'+_0x45fdec);const _0xfb33e=rankResults(yield searchSite(_0x2988e6['title']),_0x2988e6['title']),_0x581036=_0x41060f==='tv'?_0x45fdec||0x1:0x1;for(let _0x1d692b=0x0;_0x1d692b<Math['min'](0x3,_0xfb33e['length']);_0x1d692b++){const _0x5c7b8d=_0xfb33e[_0x1d692b],_0xda1ce2=_0x5c7b8d["url"]['split']('/')['filter'](Boolean)["pop"]()||'',_0x14918e=_0xda1ce2['split']('-')["pop"](),_0xe5ca01=parseInt(_0x14918e,0xa);if(!_0xe5ca01)continue;let _0x119c32=[];try{_0x119c32=yield getEpisodes(_0xe5ca01);}catch(_0x32f686){continue;}if(!_0x119c32["length"])continue;let _0xd170c2=null;for(let _0xd6c271=0x0;_0xd6c271<_0x119c32['length'];_0xd6c271++){if(_0x119c32[_0xd6c271]['number']===_0x581036){_0xd170c2=_0x119c32[_0xd6c271];break;}}if(!_0xd170c2)_0xd170c2=_0x119c32[_0x581036-0x1]||_0x119c32[0x0];if(!_0xd170c2||_0xd170c2['id']==null)continue;let _0x21a936=[];try{_0x21a936=yield getLanguages(_0xd170c2['id'],_0xda1ce2);}catch(_0x391440){continue;}const _0x34c2b3=[];for(let _0xfb51fa=0x0;_0xfb51fa<_0x21a936['length'];_0xfb51fa++){const _0x4cdccc=_0x21a936[_0xfb51fa]["embed_url"];if(_0x4cdccc)_0x34c2b3['push']({'url':_0x4cdccc,'name':_0x21a936[_0xfb51fa]["name"]||_0x21a936[_0xfb51fa]["code"]||''});}if(!_0x34c2b3['length'])continue;const _0x8a1131=yield Promise["all"](_0x34c2b3['map'](function(_0x3278ac){const _0x129cf5=_0x435279;return extractEmbed(_0x3278ac["url"]);})),_0x39588e=[],_0x1eed04={};for(let _0x5da8e5=0x0;_0x5da8e5<_0x8a1131['length'];_0x5da8e5++){const _0x43d7a9=_0x8a1131[_0x5da8e5];if(!_0x43d7a9||_0x1eed04[_0x43d7a9])continue;_0x1eed04[_0x43d7a9]=!![];const _0x402a3e=String(_0x34c2b3[_0x5da8e5]["name"]||'')['toLowerCase']();let _0x3a031a=_0x34c2b3[_0x5da8e5]["name"]?_0x34c2b3[_0x5da8e5]["name"]:"RAW / SUB",_0x34c899="🗣️",_0x481493='Subbed\x20/\x20Dubbed';if(_0x402a3e["includes"]("japanese")||_0x402a3e["includes"]('jp')||_0x402a3e["includes"]('jap'))_0x34c899='🇯🇵',_0x481493='Japanese\x20Audio';else{if(_0x402a3e['includes']("english")||_0x402a3e['includes']("eng")||_0x402a3e["includes"]('en'))_0x34c899="🇺🇸",_0x481493="English Audio";else(_0x402a3e['includes']("korean")||_0x402a3e["includes"]("kor")||_0x402a3e['includes']('kr'))&&(_0x34c899="🇰🇷",_0x481493='Korean\x20Audio');}const _0x33e2de=_0x2988e6["year"]?'\x20('+_0x2988e6["year"]+')':'';let _0x4e63e3='N/A';_0x2988e6["runtime"]&&Number['isInteger'](_0x2988e6['runtime'])&&_0x2988e6["runtime"]>0x0&&(_0x4e63e3=_0x2988e6["runtime"]+" min");var _0x2a4dc5="🎋 "+_0x2988e6["title"]+_0x33e2de,_0x5191ff='🏷️\x20Auto\x20|\x20'+_0x34c899+'\x20'+_0x3a031a+" | 🔊 Native",_0x1f71d8="⚡ HLS | ⏱️ "+_0x4e63e3+" | 📌 AniDB Stream",_0x159785=_0x2a4dc5+'\x0a'+_0x5191ff+'\x0a'+_0x1f71d8;_0x39588e["push"]({'name':"AniDB | Auto | "+_0x481493,'title':_0x159785,'url':_0x43d7a9,'quality':'Auto','description':_0x159785,'headers':{'Referer':BASE_URL+'/'}});}if(_0x39588e["length"])return console['log']("[AniDB] found "+_0x39588e['length']+" streams"),_0x39588e;}return console['log']('[AniDB]\x20no\x20streams\x20found'),[];}catch(_0x3c169f){return console["error"]('[AniDB]\x20Fatal:\x20'+(_0x3c169f&&_0x3c169f["message"])),[];}});}/*decoder removed*/module["exports"]={'getStreams':getStreams};

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
  var PROVIDER = "anidb";
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
