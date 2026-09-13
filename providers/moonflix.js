/*
 * nv-plugins moonflix.js — FULLY DECODED port of the All-in-One-Nuvio provider (4.24.0 merge pass).
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
var _0x20d2=function(){return "";};'use strict';/*string-table removed*/var _0x32077b=_0x20d2;/*rotation removed*/;/*decoder removed*/var M_PLAYER='https://player.moonflix.website',M_UA='Mozilla/5.0\x20(Windows\x20NT\x2010.0;\x20Win64;\x20x64)\x20AppleWebKit/537.36\x20(KHTML,\x20like\x20Gecko)\x20Chrome/121.0.0.0\x20Safari/537.36',M_PLAYER_HEADERS={'User-Agent':M_UA,'Referer':M_PLAYER+'/','Origin':M_PLAYER},M_APIS=[['CH','https://confident-harmony-production-0578.up.railway.app'],['HV','https://hvhyu-production.up.railway.app']],TMDB_KEY="439c478a771f35c05022f9feabcca01c";function getInvertedSortTag(_0x43c68d,_0x34e06b){var _0xc2af12={_0x34bf36:0x168},_0x22b4d4=_0x32077b;if(!_0x34e06b)_0x34e06b=0xf423f;var _0x4adfc6=Math['max'](0x0,parseInt(_0x43c68d,0xa)||0x0),_0x59e07b=Math["max"](0x0,_0x34e06b-_0x4adfc6),_0x3717dd=_0x59e07b['toString'](0x2);while(_0x3717dd['length']<0x14){_0x3717dd='0'+_0x3717dd;}return _0x3717dd['split']('')['map'](function(_0x35ef05){return _0x35ef05==='1'?'\ufeff':'​';})['join']('');}function getResolutionEmoji(_0x53aa9c){var _0x5830d={_0xe74fa4:0x151,_0x314010:0x157},_0x5c8a03=_0x32077b,_0x43c14e=String(_0x53aa9c||'')['toLowerCase']();if(_0x43c14e['includes']('2160')||_0x43c14e["includes"]('4k')||_0x43c14e['includes']('uhd'))return'🔥\x204K';if(_0x43c14e['includes']("1080")||_0x43c14e['includes']('fhd'))return'🚀\x201080p';if(_0x43c14e["includes"]("720")||_0x43c14e['includes']('hd'))return'✨\x20720p';if(_0x43c14e['includes']('480')||_0x43c14e['includes']('sd'))return'💎\x20480p';return'📺\x20'+(_0x53aa9c||'1080p');}function qualityRank(_0x2f3603){var _0x13631b={_0x371765:0x163},_0x43a4a6=_0x32077b;if(/2160p|4k/i["test"](_0x2f3603))return 0x4;if(/1080p/i["test"](_0x2f3603))return 0x3;if(/720p/i["test"](_0x2f3603))return 0x2;if(/480p/i['test'](_0x2f3603))return 0x1;return 0x0;}function fetchTmdbMeta(_0x2bb0a1,_0x41c9dd,_0x9ec7ed,_0x16f0f6){var _0x533348={_0x2236e4:0x16c,_0xc0c778:0x160,_0x946fca:0x156,_0x17acb3:0x17c,_0x5b15c9:0x14b},_0x1617b0={_0x3a737f:0x177,_0x63084a:0x156},_0xcf9a72=_0x32077b;if(!_0x2bb0a1)return Promise['resolve']({'title':'Unknown','year':null,'episodeTitle':''});var _0x3136d1=_0x41c9dd==='tv',_0x11cfbe=_0x3136d1?"https://api.themoviedb.org/3/tv/"+_0x2bb0a1+'?api_key='+TMDB_KEY:"https://api.themoviedb.org/3/movie/"+_0x2bb0a1+"?api_key="+TMDB_KEY;return __nvFetch(_0x11cfbe)["then"](function(_0x4dbf15){return _0x4dbf15['json']();})['then'](function(_0x3d2eb8){var _0x52bec3={_0x305c11:0x166,_0x525a44:0x171,_0x52fafe:0x148},_0x4c47d3=_0xcf9a72,_0x268945=_0x3d2eb8['title']||_0x3d2eb8['name']||"Unknown",_0x4eda1f=_0x3d2eb8['release_date']||_0x3d2eb8['first_air_date']||'',_0x3cb157=_0x4eda1f?parseInt(_0x4eda1f['split']('-')[0x0]):null,_0x98c742={'title':_0x268945,'year':_0x3cb157,'episodeTitle':''};if(_0x3136d1&&_0x9ec7ed&&_0x16f0f6){var _0x1357c9='https://api.themoviedb.org/3/tv/'+_0x2bb0a1+"/season/"+_0x9ec7ed+"?api_key="+TMDB_KEY;return __nvFetch(_0x1357c9)['then'](function(_0x1955c8){var _0x2262ae=_0x4c47d3;return _0x1955c8["json"]();})["then"](function(_0x16b631){var _0x354345=_0x4c47d3;if(_0x16b631&&Array['isArray'](_0x16b631["episodes"])){var _0xd4f69b=parseInt(_0x16f0f6);for(var _0x34cdb7=0x0;_0x34cdb7<_0x16b631['episodes']['length'];_0x34cdb7++){if(_0x16b631['episodes'][_0x34cdb7]["episode_number"]===_0xd4f69b){_0x98c742["episodeTitle"]=_0x16b631['episodes'][_0x34cdb7]['name']||'';break;}}}return _0x98c742;})['catch'](function(){return _0x98c742;});}return _0x98c742;})["catch"](function(){return{'title':'Unknown','year':null,'episodeTitle':''};});}function formatMoonflixStream(_0x55984f,_0x26be31,_0x1adea3,_0x3791d6){var _0x25cb41={_0x405c00:0x176,_0x405180:0x173,_0x217a1f:0x15d},_0x1f1583=_0x32077b,_0x452e4b=_0x55984f['q']||'1080p',_0x610b42=getResolutionEmoji(_0x452e4b),_0x5e0711=qualityRank(_0x452e4b),_0x3c6d9a=getInvertedSortTag(_0x5e0711*0x186a0+(0x64-_0x1adea3),0xf423f),_0x5c1fe9=_0x3c6d9a+"🌙 Moonflix • "+_0x452e4b+'\x20•\x20Dual-Audio',_0x42bd33="🎬 "+_0x3791d6['title']+(_0x3791d6['year']?'\x20('+_0x3791d6['year']+')':''),_0x1377d1=null;_0x3791d6["isTv"]&&_0x3791d6['season']&&_0x3791d6['episode']&&(_0x1377d1='📋\x20S'+_0x3791d6['season']+'\x20E'+_0x3791d6['episode']+(_0x3791d6['episodeTitle']?'\x20-\x20'+_0x3791d6["episodeTitle"]:''));var _0xa35d58=_0x610b42+'\x20|\x20🗣️\x20Dual-Audio',_0xd71243="🛰️ HLS | ⚡ H.264 | 🎧 AAC",_0x45babc='🌔\x20Moonflix\x20|\x20🌐\x20'+_0x26be31+" | 📥 WEB-DL",_0x41e391=[_0x42bd33,_0x1377d1,_0xa35d58,_0xd71243,_0x45babc]["filter"](Boolean)["join"]('\x0a'),_0x5c7c83={'User-Agent':M_UA,'Referer':M_PLAYER+'/','Origin':M_PLAYER};return{'name':_0x5c1fe9,'title':_0x41e391,'size':_0x41e391,'description':_0x41e391,'url':_0x55984f["url"],'headers':_0x5c7c83,'behaviorHints':{'notWebReady':!![],'proxyHeaders':{'request':_0x5c7c83}}};}function mFetch(_0x1edcc8,_0xfc6000){var _0x3b6ac5={_0x48194e:0x172,_0x27029f:0x170},_0x23f605=_0x32077b;return _0xfc6000=_0xfc6000||{},__nvFetch(_0x1edcc8,{'method':_0xfc6000["method"]||"GET",'headers':Object["assign"]({'User-Agent':M_UA},_0xfc6000['headers']||{}),'body':_0xfc6000["body"]})["then"](function(_0x20d200){var _0x197731=_0x23f605;return _0x20d200['text']()["then"](function(_0x1840c8){return{'code':_0x20d200['status'],'text':_0x1840c8};});})['catch'](function(){return null;});}function mProbe(_0xd95572,_0x1ec375){var _0x5bbadb={_0xb2403:0x152,_0x1927cf:0x167},_0x4eaef2=_0x32077b;return mFetch(_0xd95572,{'headers':Object['assign']({'Range':'bytes=0-16384'},_0x1ec375||{})})['then'](function(_0x10c899){var _0x366026=_0x20d2;if(!_0x10c899)return![];if(_0x10c899["code"]!==0xc8&&_0x10c899["code"]!==0xce)return![];var _0x19b4b1=_0x10c899['text'];return _0x19b4b1['indexOf']("#EXTM3U")===0x0||_0x19b4b1['indexOf']('{')!==0x0;})["catch"](function(){return![];});}function mParseStreams(_0x46a03a,_0x142743){var _0x5379c8={_0x37fafa:0x17d,_0x473735:0x16f,_0x4d41c5:0x162,_0xb32e32:0x16e,_0x55eef5:0x14a},_0x25f1f8=_0x32077b,_0x3f0e11=[],_0x4467ed=_0x46a03a&&Array["isArray"](_0x46a03a['streams'])?_0x46a03a["streams"]:[];for(var _0x2c61df=0x0;_0x2c61df<_0x4467ed["length"];_0x2c61df++){var _0x14fa68=_0x4467ed[_0x2c61df]||{},_0x3f815a=_0x14fa68['url']?String(_0x14fa68['url']):'';if(!_0x3f815a||_0x3f815a["indexOf"]("http")!==0x0)continue;var _0x20c729=_0x14fa68["quality"]||"Auto";_0x3f0e11['push']({'url':_0x3f815a,'q':_0x20c729,'extra':_0x14fa68});}return _0x3f0e11;}function mGetStreams(_0x18d49f,_0x15e041,_0x2c5d4e,_0x595ad1){var _0x4d88a9={_0x362aad:0x17c},_0x245de5={_0x2c9cbc:0x14d,_0x5f13b1:0x178},_0x341c45=_0x32077b;if(!_0x18d49f)return Promise["resolve"]([]);var _0x1b823b=_0x15e041==='tv',_0x2487eb=_0x2c5d4e||0x1,_0x249576=_0x595ad1||0x1,_0xcb3836=_0x1b823b?"tv/"+_0x18d49f+'/'+_0x2487eb+'/'+_0x249576:'movie/'+_0x18d49f;return fetchTmdbMeta(_0x18d49f,_0x15e041,_0x2487eb,_0x249576)["then"](function(_0x5ee387){var _0x3aea3c=_0x341c45;_0x5ee387['isTv']=_0x1b823b,_0x5ee387['season']=_0x2487eb,_0x5ee387["episode"]=_0x249576;var _0x2f9902=Promise["resolve"]([]);return M_APIS["forEach"](function(_0x3f816e){var _0x36eb88=_0x3aea3c;_0x2f9902=_0x2f9902["then"](function(_0x31738c){var _0x3a4a7b=_0x36eb88;if(_0x31738c['length'])return _0x31738c;return mFetch(_0x3f816e[0x1]+'/'+_0xcb3836,{'headers':M_PLAYER_HEADERS})["then"](function(_0xe9c7e8){var _0x2cf684=_0x3a4a7b;if(!_0xe9c7e8||_0xe9c7e8["code"]!==0xc8)return _0x31738c;var _0x3d87c1;try{_0x3d87c1=JSON['parse'](_0xe9c7e8['text']);}catch(_0x5cb49d){return _0x31738c;}var _0x1432fa=mParseStreams(_0x3d87c1,_0x3f816e[0x0]),_0x2bbeee=[],_0x1940ed=Promise['resolve']();return _0x1432fa["forEach"](function(_0x35005c,_0x3ed99a){var _0x26649b=_0x2cf684;_0x1940ed=_0x1940ed["then"](function(){return mProbe(_0x35005c['url'],M_PLAYER_HEADERS)['then'](function(_0x2aafc0){if(!_0x2aafc0)return;_0x2bbeee['push'](formatMoonflixStream(_0x35005c,_0x3f816e[0x0],_0x3ed99a,_0x5ee387));});});}),_0x1940ed['then'](function(){return _0x31738c['concat'](_0x2bbeee);});});});}),_0x1b823b&&(_0x2f9902=_0x2f9902['then'](function(_0x3e6614){var _0x25dab5={_0x2d5439:0x17c},_0x29612a=_0x3aea3c;if(_0x3e6614["length"])return _0x3e6614;return mFetch('https://series-production-5c1c.up.railway.app/tv/'+_0x18d49f+'/'+_0x2487eb+'/'+_0x249576,{'headers':M_PLAYER_HEADERS})['then'](function(_0x166e1a){var _0x4375bc={_0x566490:0x14a},_0x1ea9a6=_0x29612a;if(!_0x166e1a||_0x166e1a["code"]!==0xc8)return _0x3e6614;var _0xbd4635;try{_0xbd4635=JSON['parse'](_0x166e1a['text']);}catch(_0x90f58f){return _0x3e6614;}var _0x110572=_0xbd4635['sources']||[],_0x48d157=[],_0xf042f2=Promise['resolve']();for(var _0x13c941=0x0;_0x13c941<_0x110572['length'];_0x13c941++){(function(_0x56df4a,_0x8ad623){var _0x4d5154=_0x1ea9a6;_0xf042f2=_0xf042f2["then"](function(){var _0x28dfd4={_0x5e0b71:0x17a},_0x5024a1=_0x4d5154,_0x1ed6ab=_0x56df4a["proxy_url"]||_0x56df4a['url']||'';if(!_0x1ed6ab||_0x1ed6ab['indexOf']("http")!==0x0)return;return mProbe(_0x1ed6ab,M_PLAYER_HEADERS)['then'](function(_0x1e947b){var _0x5b0041=_0x5024a1;if(!_0x1e947b)return;var _0x2bc7f6={'url':_0x1ed6ab,'q':_0x56df4a["quality"]||"Auto"};_0x48d157['push'](formatMoonflixStream(_0x2bc7f6,'SE',_0x8ad623,_0x5ee387));});});}(_0x110572[_0x13c941],_0x13c941));}return _0xf042f2['then'](function(){var _0x551d6c=_0x1ea9a6;return _0x3e6614["concat"](_0x48d157);});});})),_0x2f9902;});}function mOnSettings(){return[];}if(typeof module!=="undefined"&&module["exports"])module['exports']={'getStreams':mGetStreams,'scrape':mGetStreams,'onSettings':mOnSettings};else typeof global!=='undefined'&&(global["getStreams"]=mGetStreams,global["onSettings"]=mOnSettings);

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
  var PROVIDER = "moonflix";
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
