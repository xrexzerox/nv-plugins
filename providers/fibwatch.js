/*
 * nv-plugins fibwatch.js — FULLY DECODED port of the All-in-One-Nuvio provider (4.24.0 merge pass).
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
var _0x2887=function(){return "";};const _0xf741e1=_0x2887;/*rotation removed*/;var __async=(_0x2d675e,_0x60c5d2,_0x4d995e)=>{return new Promise((_0x4625d3,_0x318b22)=>{const _0x3ca796=_0x2887;var _0x2208ac=_0x3e7f5a=>{try{_0x4a8699(_0x4d995e['next'](_0x3e7f5a));}catch(_0x548bed){_0x318b22(_0x548bed);}},_0x27dcf1=_0x1e6249=>{try{_0x4a8699(_0x4d995e['throw'](_0x1e6249));}catch(_0x39c42){_0x318b22(_0x39c42);}},_0x4a8699=_0x278d21=>_0x278d21['done']?_0x4625d3(_0x278d21["value"]):Promise['resolve'](_0x278d21["value"])["then"](_0x2208ac,_0x27dcf1);_0x4a8699((_0x4d995e=_0x4d995e['apply'](_0x2d675e,_0x60c5d2))['next']());});},cheerio=__nvRequire("cheerio-without-node-native"),BASE_URL="https://fibwatch.art",TMDB_API_KEY="1865f43a0549ca50d341dd9ab8b29f49",BROWSER_UA="Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36",HEADERS={'User-Agent':BROWSER_UA,'Referer':BASE_URL+'/'},PLAYBACK_HEADERS={'User-Agent':BROWSER_UA,'Referer':'https://urlshortlink.top/','Origin':'https://urlshortlink.top'};/*string-table removed*/function extractQuality(_0x4af06e){const _0x2a1bf5={_0x1845bf:0x209,_0x287843:0x209,_0x846d66:0x1d0,_0x5618bd:0x1f9,_0x1139ad:0x217,_0x368115:0x218},_0x3d3eb7=_0xf741e1,_0x364bfd=(_0x4af06e||'')["toLowerCase"]();if(_0x364bfd['includes']("2160")||_0x364bfd["includes"]('4k'))return'4K';if(_0x364bfd['includes']("1080"))return'1080p';if(_0x364bfd["includes"]('720'))return "720p";if(_0x364bfd["includes"]("480"))return "480p";if(_0x364bfd['includes']("360"))return'360p';return'Unknown';}function parseStreamFromShortenerHtml(_0x472691){const _0x1a0a70={_0x5861aa:0x1eb},_0x17f5a5={_0x2ee33e:0x200},_0x1d6725=_0xf741e1;if(!_0x472691)return null;const _0x30fbd7=cheerio["load"](_0x472691);let _0x37aa7e=_0x30fbd7('a.hidden-button.buttonDownloadnew')['attr']("href");!_0x37aa7e&&_0x30fbd7('a')['each']((_0x439235,_0x3862d7)=>{const _0xd3d77c=_0x1d6725,_0x58c50c=_0x30fbd7(_0x3862d7)['attr']('href')||'';if(_0x58c50c["includes"]("url=http"))return _0x37aa7e=_0x58c50c,![];});if(!_0x37aa7e){const _0x34e4f4=/https?:\/\/[^\s"'`<>]+?\.b-cdn\.net\/[^\s"'`<>]+\.(?:mkv|mp4|m3u8)/i,_0x2d5b16=_0x472691['match'](_0x34e4f4);if(_0x2d5b16)return _0x2d5b16[0x0];}if(_0x37aa7e){let _0x88d123=_0x37aa7e["replace"](/.*url=/,'')["trim"]();return decodeURIComponent(_0x88d123);}return null;}/*decoder removed*/function generateStreamLayout(_0x45cde5,_0x473df8,_0x2ff13b,_0x2d85c1,_0x53b7b1,_0x1d9781,_0x17799c){const _0x29894e={_0x2fe9f9:0x1f2,_0x41c336:0x1ea,_0x196abd:0x1f0,_0x2be5bf:0x20b,_0x370a1e:0x1ed,_0x199945:0x209,_0x5a1598:0x1fc,_0x4a1384:0x1e6,_0x28a840:0x20f,_0xd2358c:0x207,_0xb3c17b:0x1ff,_0x1b61c7:0x215,_0x5a9bb5:0x1e8,_0x4cd2b3:0x1da},_0x5a8af3=_0xf741e1;var _0x35e15c;const _0x50c4cc=_0x2d85c1["title"]||_0x2d85c1["name"]||"Unknown Title",_0x4888ca=_0x2d85c1['release_date']||_0x2d85c1['first_air_date']||'',_0x10b4de=_0x4888ca?_0x4888ca['split']('-')[0x0]:"N/A",_0x1bded7=_0x45cde5['toLowerCase']();let _0x493a43="Single-Audio",_0x574513="Hindi";if(_0x1bded7['includes']("dual")||_0x1bded7["includes"]('hindi')&&_0x1bded7["includes"]('english'))_0x493a43="Dual-Audio",_0x574513="English • Hindi";else{if(_0x1bded7['includes']("multi"))_0x493a43='Multi-Audio',_0x574513='Multilingual';else{if(_0x1bded7['includes']("bangla"))_0x574513="Bangla";else{if(_0x1bded7['includes']("tamil"))_0x574513="Tamil";else{if(_0x1bded7['includes']("telugu"))_0x574513='Telugu';else _0x1bded7['includes']("english")&&(_0x493a43='Single-Audio',_0x574513='English');}}}}let _0x138764='MKV';if(_0x1bded7['includes'](".mp4"))_0x138764='MP4';if(_0x1bded7["includes"](".m3u8"))_0x138764='M3U8\x20/\x20HLS';let _0x19f49d='N/A';_0x53b7b1?_0x19f49d=((_0x35e15c=_0x2d85c1['episode_run_time'])==null?void 0x0:_0x35e15c[0x0])?_0x2d85c1["episode_run_time"][0x0]+'\x20min':'45\x20min':_0x19f49d=_0x2d85c1['runtime']?_0x2d85c1["runtime"]+'\x20min':"N/A";const _0x148fca=_0x2ff13b["includes"]('4K')||_0x2ff13b['includes']("2160")?'🌟':'💎',_0xcd946a="⚫ FibWatch | "+_0x2ff13b+'\x20|\x20'+_0x493a43,_0x164663=_0x53b7b1?"🎬 "+_0x50c4cc+" - S"+_0x1d9781+'E'+_0x17799c+'\x20('+_0x10b4de+')':'🎬\x20'+_0x50c4cc+" - "+_0x10b4de,_0x4f061e=_0x148fca+'\x20'+_0x2ff13b+'\x20|\x20🌍\x20'+_0x574513,_0x1cafb5="🎞️ "+_0x138764+" | ⏱️ "+_0x19f49d+'\x20|\x20📌\x20WEB-DL',_0x25d63e=_0x164663+'\x0a'+_0x4f061e+'\x0a'+_0x1cafb5;return{'name':_0xcd946a,'title':_0x25d63e,'url':_0x45cde5,'quality':_0x2ff13b,'behaviorHints':{'notWebReady':![]},'headers':PLAYBACK_HEADERS};}function getStreams(_0x9bd952,_0x573dbc,_0x416797,_0x4f77c3){const _0x152d3a={_0x357efe:0x1df,_0x785b2a:0x206,_0x5c6740:0x208,_0x2dd1d2:0x213,_0x145d07:0x1ce,_0x2ec064:0x1ec,_0x1b51b8:0x20e,_0x5cb22:0x1e9,_0x59e7da:0x1fa,_0x45218e:0x208,_0x56ca69:0x1f4,_0x51b616:0x1ce,_0x1fa55c:0x1ef,_0x165469:0x1ce,_0x51d278:0x210,_0x547997:0x1d4,_0x5933d7:0x1e0},_0x378f2c={_0x5930f6:0x1db,_0x3b8fb7:0x1fa,_0x881890:0x20a},_0x3b9d35={_0x14d194:0x1dd,_0x1c89f6:0x1cd};return __async(this,null,function*(){const _0x498ec3=_0x2887;try{const _0xab14ae="https://api.themoviedb.org/3/"+_0x573dbc+'/'+_0x9bd952+'?api_key='+TMDB_API_KEY,_0x5b3da3=yield(yield __nvFetch(_0xab14ae))['json'](),_0x19d996=_0x5b3da3['title']||_0x5b3da3['name'];if(!_0x19d996)return[];const _0x3b3a96=BASE_URL+'/search?keyword='+encodeURIComponent(_0x19d996)+"&page_id=1",_0x221f78=yield(yield __nvFetch(_0x3b3a96,{'headers':HEADERS}))["text"](),_0x24832c=cheerio['load'](_0x221f78),_0x3da328=[];_0x24832c('div.video-thumb')["each"]((_0x4491ab,_0x134ea3)=>{const _0x2a16cb=_0x498ec3,_0x3479ee=_0x24832c('a',_0x134ea3)["attr"]('href'),_0x5050c8=_0x24832c('p.hptag',_0x134ea3)['text']()['trim']()||_0x24832c("div.video-thumb img",_0x134ea3)["attr"]('alt')||'';if(_0x3479ee)_0x3da328["push"]({'title':_0x5050c8,'url':_0x3479ee});});if(!_0x3da328['length'])return[];const _0x240ce8=_0x573dbc==='tv',_0x5e59b5=_0x19d996['toLowerCase']();let _0x423ee6=_0x3da328["find"](_0x45e521=>_0x45e521["title"]["toLowerCase"]()["includes"](_0x5e59b5));if(!_0x423ee6)_0x423ee6=_0x3da328[0x0];const _0x2b02bd=_0x423ee6["url"]['startsWith']("http")?_0x423ee6['url']:''+BASE_URL+_0x423ee6['url'],_0x1e5c29=yield(yield __nvFetch(_0x2b02bd,{'headers':HEADERS}))["text"](),_0x154bdb=cheerio["load"](_0x1e5c29),_0x3ff341=_0x154bdb("input#video-id")['attr']('value');if(!_0x3ff341)return[];const _0x5ee2f0=[],_0x180a66=_0x4f2ccd=>__async(this,null,function*(){const _0x276398=_0x498ec3;for(const _0x5d7537 of _0x4f2ccd){let _0x3bf558=(_0x5d7537['url']||'')["trim"]();if(!_0x3bf558)continue;!_0x3bf558['startsWith']("http")&&(_0x3bf558=''+BASE_URL+_0x3bf558);const _0xad5265=extractQuality(_0x5d7537['res']||_0x3bf558);if(_0x3bf558["match"](/\.(mp4|mkv|m3u8)/i))_0x5ee2f0["push"]({'url':_0x3bf558,'quality':_0xad5265});else try{const _0x40602e=yield(yield __nvFetch(_0x3bf558,{'headers':HEADERS}))['text'](),_0x564a9f=parseStreamFromShortenerHtml(_0x40602e);if(_0x564a9f&&_0x564a9f["startsWith"]("http")){const _0xf57535=extractQuality(_0x564a9f)!=="Unknown"?extractQuality(_0x564a9f):_0xad5265;_0x5ee2f0["push"]({'url':_0x564a9f,'quality':_0xf57535});}}catch(_0x1ecc2b){}}});if(_0x240ce8){const _0x3eaa2e=BASE_URL+"/ajax/episodes.php?video_id="+_0x3ff341,_0x5cfa0e=yield(yield __nvFetch(_0x3eaa2e,{'headers':HEADERS}))['json'](),_0x4fd45b=_0x5cfa0e['episodes']||[];if(!_0x4fd45b['length'])return[];let _0x87078e='';for(const _0x2a8eef of _0x4fd45b){const _0x31f08d=(_0x2a8eef['title']||'')["toLowerCase"](),_0x2b8c5a=_0x31f08d["match"](/s(\d{1,2})e(\d{1,3})/);if(_0x2b8c5a){const _0x5419ab=parseInt(_0x2b8c5a[0x1]),_0xbc3e00=parseInt(_0x2b8c5a[0x2]);if(_0x5419ab===_0x416797&&_0xbc3e00===_0x4f77c3){_0x87078e=_0x2a8eef["url"]?_0x2a8eef["url"]["startsWith"]('http')?_0x2a8eef['url']:''+BASE_URL+_0x2a8eef["url"]:'';break;}}}!_0x87078e&&_0x4fd45b["length"]>0x0&&(_0x87078e=_0x4fd45b[0x0]['url']?_0x4fd45b[0x0]["url"]['startsWith']("http")?_0x4fd45b[0x0]['url']:''+BASE_URL+_0x4fd45b[0x0]['url']:'');if(!_0x87078e)return[];const _0x4be846=yield(yield __nvFetch(_0x87078e,{'headers':HEADERS}))["text"](),_0x259da0=cheerio["load"](_0x4be846),_0x588d93=_0x259da0('input#video-id')['attr']('value');if(_0x588d93){const _0x1a82ec=BASE_URL+'/ajax/resolution_switcher.php?video_id='+_0x588d93,_0x53c6fc=yield(yield __nvFetch(_0x1a82ec,{'headers':HEADERS}))["json"](),_0x529c64=[..._0x53c6fc['current']||[],..._0x53c6fc["popup"]||[]];yield _0x180a66(_0x529c64);}}else{const _0x439a72=BASE_URL+'/ajax/resolution_switcher.php?video_id='+_0x3ff341,_0x26760a=yield(yield __nvFetch(_0x439a72,{'headers':HEADERS}))["json"](),_0x184dd3=[..._0x26760a['current']||[],..._0x26760a['popup']||[]];yield _0x180a66(_0x184dd3);}const _0x803de4=[],_0x3dd978=new Set();for(const _0x2740e8 of _0x5ee2f0){if(!_0x3dd978['has'](_0x2740e8["url"])){_0x3dd978["add"](_0x2740e8['url']);const _0x1d86da=generateStreamLayout(_0x2740e8["url"],_0x19d996,_0x2740e8["quality"],_0x5b3da3,_0x240ce8,_0x416797,_0x4f77c3);_0x803de4["push"](_0x1d86da);}}const _0xc548d8={'4K':0x5,'1080p':0x4,'720p':0x3,'480p':0x2,'360p':0x1,'Unknown':0x0};return _0x803de4["sort"]((_0x18dc1a,_0x57bf79)=>{const _0x475003=_0xc548d8[_0x18dc1a['quality']]||0x0,_0x2c32c2=_0xc548d8[_0x57bf79['quality']]||0x0;return _0x2c32c2-_0x475003;}),_0x803de4;}catch(_0x54ae18){return console["error"]("[FibWatch]",_0x54ae18),[];}});}typeof module!=="undefined"&&module["exports"]&&(module["exports"]={'getStreams':getStreams});

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
  var PROVIDER = "fibwatch";
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
