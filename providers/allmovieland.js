/*
 * nv-plugins allmovieland.js — FULLY DECODED port of the All-in-One-Nuvio provider (4.24.0 merge pass).
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
var _0x1535=function(){return "";};const _0x585d93=_0x1535;/*rotation removed*/;var __create=Object["create"],__defProp=Object["defineProperty"],__defProps=Object['defineProperties'],__getOwnPropDesc=Object["getOwnPropertyDescriptor"],__getOwnPropDescs=Object["getOwnPropertyDescriptors"],__getOwnPropNames=Object["getOwnPropertyNames"],__getOwnPropSymbols=Object["getOwnPropertySymbols"],__getProtoOf=Object["getPrototypeOf"],__hasOwnProp=Object["prototype"]["hasOwnProperty"],__propIsEnum=Object['prototype']["propertyIsEnumerable"],__defNormalProp=(_0x2272e3,_0xab69db,_0x2d1cea)=>_0xab69db in _0x2272e3?__defProp(_0x2272e3,_0xab69db,{'enumerable':!![],'configurable':!![],'writable':!![],'value':_0x2d1cea}):_0x2272e3[_0xab69db]=_0x2d1cea,__spreadValues=(_0x4bc988,_0x51d5a0)=>{const _0x535d00=_0x585d93;for(var _0x121b6c in _0x51d5a0||(_0x51d5a0={}))if(__hasOwnProp["call"](_0x51d5a0,_0x121b6c))__defNormalProp(_0x4bc988,_0x121b6c,_0x51d5a0[_0x121b6c]);if(__getOwnPropSymbols)for(var _0x121b6c of __getOwnPropSymbols(_0x51d5a0)){if(__propIsEnum["call"](_0x51d5a0,_0x121b6c))__defNormalProp(_0x4bc988,_0x121b6c,_0x51d5a0[_0x121b6c]);}return _0x4bc988;},__spreadProps=(_0x2408c2,_0x231be8)=>__defProps(_0x2408c2,__getOwnPropDescs(_0x231be8)),__copyProps=(_0x49facb,_0x5a8e9a,_0x4cb84b,_0x5de8ad)=>{const _0xee573a=_0x585d93;if(_0x5a8e9a&&typeof _0x5a8e9a==="object"||typeof _0x5a8e9a==="function"){for(let _0x549c2a of __getOwnPropNames(_0x5a8e9a))if(!__hasOwnProp['call'](_0x49facb,_0x549c2a)&&_0x549c2a!==_0x4cb84b)__defProp(_0x49facb,_0x549c2a,{'get':()=>_0x5a8e9a[_0x549c2a],'enumerable':!(_0x5de8ad=__getOwnPropDesc(_0x5a8e9a,_0x549c2a))||_0x5de8ad["enumerable"]});}return _0x49facb;},__toESM=(_0x2bf915,_0x453623,_0x3b6817)=>(_0x3b6817=_0x2bf915!=null?__create(__getProtoOf(_0x2bf915)):{},__copyProps(_0x453623||!_0x2bf915||!_0x2bf915["__esModule"]?__defProp(_0x3b6817,"default",{'value':_0x2bf915,'enumerable':!![]}):_0x3b6817,_0x2bf915)),__async=(_0x3be590,_0x2163a4,_0x206f1d)=>{return new Promise((_0x21fad8,_0x177450)=>{const _0x24bbdc=_0x1535;var _0x59b2f7=_0x39c5f8=>{const _0x13220e=_0x1535;try{_0x24c22d(_0x206f1d["next"](_0x39c5f8));}catch(_0x2e2a51){_0x177450(_0x2e2a51);}},_0x1c9322=_0x47bf87=>{const _0x1092ad=_0x1535;try{_0x24c22d(_0x206f1d["throw"](_0x47bf87));}catch(_0x2c4275){_0x177450(_0x2c4275);}},_0x24c22d=_0x1b6dbd=>_0x1b6dbd['done']?_0x21fad8(_0x1b6dbd['value']):Promise['resolve'](_0x1b6dbd["value"])['then'](_0x59b2f7,_0x1c9322);_0x24c22d((_0x206f1d=_0x206f1d['apply'](_0x3be590,_0x2163a4))["next"]());});},import_cheerio_without_node_native=__toESM(__nvRequire("cheerio-without-node-native")),TMDB_API_KEY="439c478a771f35c05022f9feabcca01c",TMDB_BASE_URL="https://api.themoviedb.org/3",MAIN_URL='https://allmovieland.you',HEADERS={'User-Agent':"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36",'Accept':"text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",'Accept-Language':"en-US,en;q=0.5"};/*string-table removed*/function getTMDBDetails(_0x2aebb6,_0x12d1ab){return __async(this,null,function*(){const _0xc42d13=_0x1535;var _0x4b6787;const _0x88c99f=_0x12d1ab==='tv'?'tv':"movie",_0x36c80f=TMDB_BASE_URL+'/'+_0x88c99f+'/'+_0x2aebb6+"?api_key="+TMDB_API_KEY+'&append_to_response=external_ids',_0x3f44a0=yield __nvFetch(_0x36c80f,{'method':"GET",'headers':{'Accept':"application/json",'User-Agent':'Mozilla/5.0'}});if(!_0x3f44a0['ok'])throw new Error('TMDB\x20API\x20error:\x20'+_0x3f44a0['status']);const _0x1c16a5=yield _0x3f44a0['json'](),_0x4fe47f=_0x12d1ab==='tv'?_0x1c16a5["name"]:_0x1c16a5['title'],_0x4b9608=_0x12d1ab==='tv'?_0x1c16a5["first_air_date"]:_0x1c16a5["release_date"],_0x5d5561=_0x4b9608?parseInt(_0x4b9608["split"]('-')[0x0]):null;return{'title':_0x4fe47f,'year':_0x5d5561,'imdbId':((_0x4b6787=_0x1c16a5["external_ids"])==null?void 0x0:_0x4b6787["imdb_id"])||null,'data':_0x1c16a5};});}function normalizeTitle(_0x40dc60){const _0x27878f=_0x585d93;if(!_0x40dc60)return'';return _0x40dc60['toLowerCase']()["replace"](/\b(the|a|an)\b/g,'')["replace"](/[:\-_]/g,'\x20')["replace"](/\s+/g,'\x20')['replace'](/[^\w\s]/g,'')["trim"]();}function calculateTitleSimilarity(_0x2700af,_0x2844df){const _0x4d1634=_0x585d93,_0x2754bb=normalizeTitle(_0x2700af),_0x2228a7=normalizeTitle(_0x2844df);if(_0x2754bb===_0x2228a7)return 0x1;const _0x316f42=_0x2754bb["split"](/\s+/)["filter"](_0x52a881=>_0x52a881["length"]>0x0),_0x2b902d=_0x2228a7['split'](/\s+/)["filter"](_0x5f008e=>_0x5f008e["length"]>0x0);if(_0x316f42["length"]===0x0||_0x2b902d["length"]===0x0)return 0x0;const _0x1fcca6=new Set(_0x316f42),_0x2f4a0d=new Set(_0x2b902d),_0x3912f4=_0x316f42["filter"](_0x338654=>_0x2f4a0d["has"](_0x338654)),_0x3232a5=new Set([..._0x316f42,..._0x2b902d]),_0x12e40d=_0x3912f4["length"]/_0x3232a5["size"],_0x114b72=_0x2b902d["filter"](_0x12bdf3=>!_0x1fcca6["has"](_0x12bdf3))["length"];let _0x1153bc=_0x12e40d-_0x114b72*0.05;return _0x316f42["length"]>0x0&&_0x316f42["every"](_0x451666=>_0x2f4a0d["has"](_0x451666))&&(_0x1153bc+=0.2),_0x1153bc;}function findBestTitleMatch(_0x1a9474,_0x45cfa2){const _0x5af6a3=_0x585d93;if(!_0x45cfa2||_0x45cfa2['length']===0x0)return null;let _0x506ece=null,_0xddfc75=0x0;for(const _0x3f31e9 of _0x45cfa2){let _0x5f02cd=calculateTitleSimilarity(_0x1a9474['title'],_0x3f31e9["title"]);if(_0x1a9474["year"]&&_0x3f31e9["year"]){const _0x255d12=Math['abs'](_0x1a9474['year']-_0x3f31e9["year"]);if(_0x255d12===0x0)_0x5f02cd+=0.2;else{if(_0x255d12<=0x1)_0x5f02cd+=0.1;else{if(_0x255d12>0x5)_0x5f02cd-=0.3;}}}_0x5f02cd>_0xddfc75&&_0x5f02cd>0.3&&(_0xddfc75=_0x5f02cd,_0x506ece=_0x3f31e9);}return _0x506ece;}/*decoder removed*/function getStreams(_0x557378,_0x5e7559="movie",_0x2c24f0=null,_0xa15d0c=null){return __async(this,null,function*(){const _0x4b221f=_0x1535;console["log"]("[AllMovieLand] Fetching streams for TMDB ID: "+_0x557378+',\x20Type:\x20'+_0x5e7559);try{const _0x4120bf=yield getTMDBDetails(_0x557378,_0x5e7559);console['log']("[AllMovieLand] TMDB Info: \""+_0x4120bf["title"]+'\x22\x20('+(_0x4120bf["year"]||"N/A")+')');const _0x17e515=_0x4120bf["title"],_0x4e358c=MAIN_URL+"/index.php?story="+encodeURIComponent(_0x17e515)+"&do=search&subaction=search",_0x59312e=yield __nvFetch(_0x4e358c,{'headers':HEADERS}),_0x3908e7=yield _0x59312e["text"](),_0x54f259=import_cheerio_without_node_native["default"]["load"](_0x3908e7),_0x186d64=[];_0x54f259("article.short-mid")["each"]((_0x3e65f7,_0xc5f9f2)=>{const _0x504c80=_0x4b221f,_0x3c7620=_0x54f259(_0xc5f9f2)["find"]("a > h3")['text']()["trim"](),_0x256940=_0x54f259(_0xc5f9f2)["find"]('a')["attr"]('href'),_0x5e0f21=_0x3c7620['match'](new RegExp("(?<=\\()[\\d(\\]]+(?=\\))")),_0x4e2544=_0x5e0f21?parseInt(_0x5e0f21[0x0]):null;_0x186d64["push"]({'title':_0x3c7620,'href':_0x256940,'year':_0x4e2544});});if(_0x186d64["length"]===0x0)return console["log"]('[AllMovieLand]\x20No\x20search\x20results\x20found.'),[];const _0x3bb101=findBestTitleMatch(_0x4120bf,_0x186d64),_0x34e089=_0x3bb101||_0x186d64[0x0];console["log"]("[AllMovieLand] Selected: \""+_0x34e089["title"]+"\" ("+_0x34e089["href"]+')');const _0x450560=yield __nvFetch(_0x34e089["href"],{'headers':HEADERS}),_0x36ade9=yield _0x450560["text"](),_0x16773f=import_cheerio_without_node_native["default"]['load'](_0x36ade9),_0x1eb60e=_0x16773f("div.tabs__content script")["html"]()||'',_0x17503d=_0x1eb60e["match"](/const AwsIndStreamDomain\s*=\s*'([^']+)'/),_0x3058d2=_0x17503d?_0x17503d[0x1]["replace"](/\/$/,''):null,_0x78315c=_0x1eb60e["match"](/src:\s*'([^']+)'/),_0x5c2c01=_0x78315c?_0x78315c[0x1]:null;if(!_0x3058d2||!_0x5c2c01)return console["log"]("[AllMovieLand] Could not find player domain or ID."),[];const _0x57c41d=_0x3058d2+'/play/'+_0x5c2c01,_0x3d0b4b=yield __nvFetch(_0x57c41d,{'headers':__spreadProps(__spreadValues({},HEADERS),{'Referer':_0x34e089['href']})}),_0x439dc4=yield _0x3d0b4b["text"](),_0x3004ae=import_cheerio_without_node_native["default"]["load"](_0x439dc4),_0x56742f=_0x3004ae("body > script")["last"]()["html"]()||'',_0x539e26=_0x56742f["match"](/let\s+p3\s*=\s*(\{.*\});/);if(!_0x539e26)return console["log"]("[AllMovieLand] No p3 JSON found in embed."),[];const _0x351c54=JSON["parse"](_0x539e26[0x1]);let _0x3b59e0=_0x351c54["file"]['replace'](/\\\//g,'/');if(!_0x3b59e0["startsWith"]("http"))_0x3b59e0=''+_0x3058d2+_0x3b59e0;const _0x3ad049=yield __nvFetch(_0x3b59e0,{'method':"POST",'headers':__spreadProps(__spreadValues({},HEADERS),{'X-CSRF-TOKEN':_0x351c54["key"],'Referer':_0x57c41d})}),_0x48b3a6=yield _0x3ad049["text"]();let _0x267f03=[];const _0x20ddc1=JSON["parse"](_0x48b3a6["replace"](/,\]/g,']'));if(_0x5e7559==="movie")_0x267f03=_0x20ddc1["filter"](_0x21c86c=>_0x21c86c&&_0x21c86c['file']);else{if(_0x5e7559==='tv'){const _0x2332d6=_0x20ddc1['find'](_0x4e06e5=>_0x4e06e5['id']==_0x2c24f0);if(_0x2332d6&&_0x2332d6["folder"]){const _0x445e05=_0x2332d6["folder"]["find"](_0x18558c=>_0x18558c["episode"]==_0xa15d0c);_0x445e05&&_0x445e05["folder"]&&(_0x267f03=_0x445e05['folder']["filter"](_0x714d85=>_0x714d85&&_0x714d85["file"]));}}}if(_0x267f03["length"]===0x0)return console["log"]("[AllMovieLand] No streams found for the requested media."),[];const _0x4742a2=[];return yield Promise["all"](_0x267f03["map"](_0x4cac34=>__async(this,null,function*(){const _0x4589ca=_0x4b221f;try{const _0x18efde=_0x4cac34["file"]["replace"](/^~/,''),_0x2e0e93=_0x3058d2+"/playlist/"+_0x18efde+".txt",_0x3d19f2=yield __nvFetch(_0x2e0e93,{'method':"POST",'headers':__spreadProps(__spreadValues({},HEADERS),{'X-CSRF-TOKEN':_0x351c54["key"],'Referer':_0x57c41d})}),_0x171484=(yield _0x3d19f2['text']())["trim"]();if(_0x171484&&_0x171484["startsWith"]("http")){const _0x5a4747=_0x4cac34["title"]||"Unknown";_0x4742a2["push"]({'name':"AllMovieLand",'title':"AllMovieLand - "+_0x5a4747,'url':_0x171484,'quality':_0x5a4747,'headers':{'Referer':_0x3058d2+'/','Origin':_0x3058d2,'User-Agent':HEADERS["User-Agent"]},'provider':"allmovieland"});}}catch(_0x21d4de){console["error"]("[AllMovieLand] Failed to extract stream: "+_0x21d4de["message"]);}}))),_0x4742a2;}catch(_0x2c0cf5){return console["error"]('[AllMovieLand]\x20Error:\x20'+_0x2c0cf5['message']),[];}});}module["exports"]={'getStreams':getStreams};

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
  var PROVIDER = "allmovieland";
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
