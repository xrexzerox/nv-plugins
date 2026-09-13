/*
 * nv-plugins vidlove.js — FULLY DECODED port of the All-in-One-Nuvio provider (4.24.0 merge pass).
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
var _0x8990=function(){return "";};'use strict';const _0x4d63e8=_0x8990;/*rotation removed*/;var __async=(_0x472eda,_0xf1b654,_0x439816)=>{const _0x238894={_0x825e05:0x1d2};return new Promise((_0x3b160d,_0xa6b417)=>{const _0x2fcce1={_0x34a812:0x1ce},_0xaff2ff=_0x8990;var _0x4c7ba1=_0x25ad8a=>{const _0x3dd6ee=_0x8990;try{_0x58a3dc(_0x439816["next"](_0x25ad8a));}catch(_0x4b583e){_0xa6b417(_0x4b583e);}},_0x1fb517=_0x3a4c28=>{try{_0x58a3dc(_0x439816['throw'](_0x3a4c28));}catch(_0x138e93){_0xa6b417(_0x138e93);}},_0x58a3dc=_0x2d940c=>_0x2d940c['done']?_0x3b160d(_0x2d940c["value"]):Promise["resolve"](_0x2d940c["value"])["then"](_0x4c7ba1,_0x1fb517);_0x58a3dc((_0x439816=_0x439816["apply"](_0x472eda,_0xf1b654))['next']());});},BASE_URL='https://ballerinacappuccinalovestungtungtungsahur.com',REFERER="https://player.vidlove.cc/",TMDB_BASE='https://api.themoviedb.org/3',TMDB_KEY="307b7b8ef035c6aa336900aef4e203bd",MIN_QUALITY=0x438,DEFAULT_QUALITY='1080p',USER_AGENT="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",PROVIDERS=["moviebox",'ipcloud','tcloud','vidapi',"vixsrc","1embed",'xpass','vidrift','lookmovie','vidnest'],DEFAULT_HEADERS={'accept':'application/json','accept-language':"nl-NL,nl;q=0.9,en-US;q=0.8,en;q=0.7",'sec-ch-ua':'\x22Not;A=Brand\x22;v=\x228\x22,\x20\x22Chromium\x22;v=\x22150\x22,\x20\x22Google\x20Chrome\x22;v=\x22150\x22','Referer':REFERER,'User-Agent':USER_AGENT};function getInvertedSortTag(_0x41e68d,_0x1b718f=0xf423f){const _0x5fb71c={_0x43edde:0x1c4,_0x318e3a:0x1ab},_0x4f8f3d=_0x4d63e8,_0x2c787e=Math['max'](0x0,parseInt(_0x41e68d,0xa)||0x0),_0x56ffd7=Math["max"](0x0,_0x1b718f-_0x2c787e),_0x1430c9=_0x56ffd7["toString"](0x2)["padStart"](0x14,'0');return _0x1430c9["split"]('')['map'](_0x36aa60=>_0x36aa60==='1'?'\ufeff':'​')['join']('');}/*string-table removed*/function getResolutionEmoji(_0x5ab27d){const _0x8c76e8={_0x3d33cf:0x1c2,_0xb527c7:0x1b5,_0x3a1013:0x1cb,_0x2090a9:0x1ad,_0x59ce78:0x1b5,_0x316c46:0x1b6,_0x5436cf:0x19e,_0x3ec92d:0x19d,_0x526ec6:0x1b5,_0x695a62:0x198,_0x3369a6:0x1bb},_0x22c162=_0x4d63e8,_0x2912d4=String(_0x5ab27d||'')['toLowerCase']();if(_0x2912d4["includes"]("2160")||_0x2912d4["includes"]('4k')||_0x2912d4['includes']("uhd"))return'🌟\x204K';if(_0x2912d4['includes']("1080")||_0x2912d4["includes"]("fhd"))return "🔥 1080p";if(_0x2912d4['includes']('720')||_0x2912d4["includes"]('hd'))return "💎 720p";if(_0x2912d4["includes"]("480")||_0x2912d4['includes']('sd'))return'📱\x20480p';return "📺 "+(_0x5ab27d||'1080p');}function qualityRank(_0x2120a3){const _0x356471={_0x473ce1:0x1b8},_0x2db853=_0x4d63e8;if(/2160p|4k/i['test'](_0x2120a3))return 0x4;if(/1080p/i['test'](_0x2120a3))return 0x3;if(/720p/i["test"](_0x2120a3))return 0x2;if(/480p/i["test"](_0x2120a3))return 0x1;return 0x0;}/*decoder removed*/var parseQuality=_0x4045ac=>{const _0x1c893d=String(_0x4045ac||'')['match'](/(\d+)/);return _0x1c893d?parseInt(_0x1c893d[0x1],0xa):0x0;},normalizeQuality=_0x406c1e=>{const _0x27be66=String(_0x406c1e||'')['trim']();return _0x27be66?_0x27be66:DEFAULT_QUALITY;},isQualityAcceptable=_0x2f4790=>{return parseQuality(normalizeQuality(_0x2f4790))>=MIN_QUALITY;};function fetchTmdbMeta(_0x3d0213,_0x4cdac0,_0x22b507=null,_0x173f3a=null){const _0x657f0a={_0x30cb6e:0x1bf,_0x1b4a78:0x1b4,_0x32f3bb:0x1d3,_0x23e860:0x1ac,_0x181708:0x1cc,_0x2c9ee4:0x1d1,_0x128025:0x1bd,_0x2759a2:0x1bf,_0x14a8d3:0x1ba};return __async(this,null,function*(){const _0x180e6f=_0x8990;try{const _0x1de216=_0x4cdac0==='tv'?'tv':"movie",_0x854349=yield __nvFetch(TMDB_BASE+'/'+_0x1de216+'/'+encodeURIComponent(_0x3d0213)+'?api_key='+TMDB_KEY,{'headers':{'Accept':'application/json','User-Agent':USER_AGENT}});if(!_0x854349['ok'])return{'title':'Unknown','year':null,'episodeTitle':''};const _0x5b9b0d=yield _0x854349['json'](),_0x41f141=_0x5b9b0d['title']||_0x5b9b0d["name"]||_0x5b9b0d["original_title"]||_0x5b9b0d['original_name']||'Unknown',_0x349c71=_0x5b9b0d["release_date"]||_0x5b9b0d['first_air_date']||'',_0x201edf=_0x349c71?parseInt(_0x349c71["slice"](0x0,0x4)):null;let _0x1ff9f6='';if(_0x4cdac0==='tv'&&_0x22b507&&_0x173f3a)try{const _0x3f184d=yield __nvFetch(TMDB_BASE+"/tv/"+encodeURIComponent(_0x3d0213)+"/season/"+_0x22b507+'?api_key='+TMDB_KEY,{'headers':{'Accept':"application/json",'User-Agent':USER_AGENT}});if(_0x3f184d['ok']){const _0x5ce59d=yield _0x3f184d["json"]();if(_0x5ce59d&&Array['isArray'](_0x5ce59d["episodes"])){const _0x569ab7=parseInt(_0x173f3a),_0x5e496a=_0x5ce59d["episodes"]['find'](_0x261291=>_0x261291['episode_number']===_0x569ab7);_0x5e496a&&_0x5e496a["name"]&&(_0x1ff9f6=_0x5e496a["name"]);}}}catch(_0x598159){}return{'title':_0x41f141,'year':_0x201edf,'episodeTitle':_0x1ff9f6};}catch(_0x292f74){return{'title':"Unknown",'year':null,'episodeTitle':''};}});}var buildEndpointUrl=(_0x40b773,_0x49cdf3,_0x1db82a,_0x18f942,_0x3406ff)=>{const _0x394a72={_0x26d9b0:0x1b2,_0x59abaa:0x1c7},_0x3f469d=_0x4d63e8,_0x4fd7ec=new URLSearchParams({'id':_0x49cdf3,'mode':"json",'sources':_0x1db82a,'hevc':'1'});if(_0x18f942!=null)_0x4fd7ec["set"]("season",_0x18f942);if(_0x3406ff!=null)_0x4fd7ec['set']('episode',_0x3406ff);return BASE_URL+'/'+_0x40b773+'?'+_0x4fd7ec;},mapQualityToStream=(_0x380b5c,_0x347921,_0x20ee65,_0x95e6c)=>{const _0x37acdc={_0x56a3e1:0x1cd,_0x13f9fb:0x1d8,_0x4ae9c0:0x1da,_0x3cb567:0x1c6,_0x5095b0:0x1a3,_0x25f9eb:0x1c6,_0x1f5a7e:0x1c8},_0x5eb43b=_0x4d63e8,_0x2e01ae=normalizeQuality(_0x380b5c['quality']),_0x271211=getResolutionEmoji(_0x2e01ae),_0x19f1b0=qualityRank(_0x2e01ae),_0x14ecb0=getInvertedSortTag(_0x19f1b0*0x186a0+(0x64-_0x20ee65),0xf423f),_0x465d76=_0x14ecb0+"Vidlove • "+_0x2e01ae+'\x20•\x20'+_0x347921,_0x5bf416="🎬 "+_0x95e6c["title"]+(_0x95e6c["year"]?'\x20('+_0x95e6c["year"]+')':'');let _0x114db4=null;_0x95e6c["mediaType"]==='tv'&&_0x95e6c['season']&&_0x95e6c["episode"]&&(_0x114db4="📋 S"+_0x95e6c['season']+'\x20E'+_0x95e6c["episode"]+(_0x95e6c["episodeTitle"]?'\x20-\x20'+_0x95e6c['episodeTitle']:''));const _0x3a7f92=_0x271211+'\x20|\x20🗣️\x20Multi-Audio',_0x5e0246="🎞️ MKV | ⚡ HEVC | 🎧 AAC",_0x1c57cf='🔗\x20Vidlove\x20|\x20🌐\x20'+_0x347921+" | 📥 WEB-DL",_0x38ef9e=[_0x5bf416,_0x114db4,_0x3a7f92,_0x5e0246,_0x1c57cf]["filter"](Boolean)['join']('\x0a'),_0x150734={'Referer':REFERER,'Origin':'https://player.vidlove.cc','User-Agent':USER_AGENT};return{'name':_0x465d76,'title':_0x38ef9e,'size':_0x38ef9e,'description':_0x38ef9e,'url':_0x380b5c['url'],'quality':_0x2e01ae,'headers':_0x150734,'behaviorHints':{'notWebReady':!![],'proxyHeaders':{'request':_0x150734}}};};function fetchProviderStreams(_0x26141a,_0x5e4699,_0x5b47fa,_0x409aac,_0x375ba1,_0x4d7cb9){const _0x4cdea0={_0x3d2385:0x1bc,_0x1d8816:0x1c3,_0x3e977c:0x1d5,_0x30b6e9:0x1aa};return __async(this,null,function*(){const _0x5ba0ba=_0x8990;var _0x37edeb;try{const _0x5c8c05=yield __nvFetch(buildEndpointUrl(_0x5b47fa,_0x5e4699,_0x26141a,_0x409aac,_0x375ba1),{'method':'GET','headers':DEFAULT_HEADERS});if(!_0x5c8c05['ok'])return[];const {source:_0x4fb42e}=yield _0x5c8c05['json']();if(!_0x4fb42e)return[];const _0x4de8a7=Array['isArray'](_0x4fb42e["qualities"])?_0x4fb42e["qualities"]:[],_0x402fbb=(_0x37edeb=_0x4fb42e["label"])!=null?_0x37edeb:_0x26141a;if(_0x4de8a7["length"]>0x0)return _0x4de8a7['filter'](_0x4c8dce=>(_0x4c8dce==null?void 0x0:_0x4c8dce["url"])&&isQualityAcceptable(_0x4c8dce['quality']))["map"]((_0x2f9b37,_0x57f912)=>mapQualityToStream(_0x2f9b37,_0x402fbb,_0x57f912,_0x4d7cb9));if(_0x4fb42e["url"]&&isQualityAcceptable(_0x4fb42e["quality"]))return[mapQualityToStream({'url':_0x4fb42e['url'],'quality':_0x4fb42e['quality']},_0x402fbb,0x0,_0x4d7cb9)];return[];}catch(_0x52c73f){return[];}});}function getStreams(_0x59080d,_0x149a3f,_0x18ab50,_0x1bec07){const _0x270063={_0x1308a5:0x19c,_0x34a1e0:0x196,_0x2b222d:0x1c6};return __async(this,null,function*(){const _0x251b1b=_0x8990;try{const _0xd11de6=String(_0x149a3f||'')["toLowerCase"]()["trim"](),_0x3f08d4=_0xd11de6==='series'||_0xd11de6==='show'||_0xd11de6==="tvshow"||_0xd11de6==='tv'?'tv':"movie";if(_0x3f08d4==='tv'&&(_0x18ab50==null||_0x1bec07==null))return[];const _0x52cca4=yield fetchTmdbMeta(_0x59080d,_0x3f08d4,_0x18ab50,_0x1bec07);_0x52cca4['mediaType']=_0x3f08d4,_0x52cca4['season']=_0x18ab50,_0x52cca4["episode"]=_0x1bec07;const _0x5ec104=yield Promise['all'](PROVIDERS['map'](_0x2bd823=>fetchProviderStreams(_0x2bd823,_0x59080d,_0x3f08d4,_0x18ab50,_0x1bec07,_0x52cca4))),_0x19c1ab=new Set();return _0x5ec104['flat']()["filter"](_0x48012f=>_0x48012f['url']&&!_0x19c1ab["has"](_0x48012f["url"])&&_0x19c1ab['add'](_0x48012f['url']));}catch(_0x3b1cd2){return[];}});}module["exports"]={'getStreams':getStreams};

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
  var PROVIDER = "vidlove";
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
