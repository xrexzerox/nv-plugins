/*
 * nv-plugins movix.js — FULLY DECODED port of the All-in-One-Nuvio provider (4.23.0 best-settings pass).
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
var _0x2bf8=function(){return "";};var _0x2a35f6=_0x2bf8;/*rotation removed*/;var TMDB_KEY="f3d757824f08ea2cff45eb8f47ca3a1e",DOMAINS_URL='https://raw.githubusercontent.com/wooodyhood/nuvio-repo/main/domains.json',MOVIX_FALLBACK="cash",_cachedEndpoint=null;/*string-table removed*/function getTmdbMetadata(_0x27aaad,_0x579339){var _0x45457c={_0x1c7d44:0x8f,_0x50f3c4:0x9e},_0x114a35={_0x38a933:0xb8,_0x5c8a8a:0xa9},_0x319e14=_0x2a35f6,_0x22192c="https://api.themoviedb.org/3/"+(_0x579339==='tv'?'tv':"movie")+'/'+_0x27aaad+"?api_key="+TMDB_KEY+"&language=en-US";return __nvFetch(_0x22192c)['then'](function(_0x276b6d){var _0x4d273b=_0x319e14;return _0x276b6d["json"]();})['then'](function(_0x3077cb){var _0x4c713f=_0x319e14,_0x194fba=_0x3077cb["release_date"]||_0x3077cb["first_air_date"]||'';return{'name':_0x3077cb["title"]||_0x3077cb['name']||"Movix",'year':_0x194fba?_0x194fba["split"]('-')[0x0]:'','duration':_0x579339==="movie"&&_0x3077cb['runtime']?_0x3077cb['runtime']+'\x20min':_0x579339==='tv'&&_0x3077cb["episode_run_time"]&&_0x3077cb['episode_run_time']['length']>0x0?_0x3077cb["episode_run_time"][0x0]+" min":''};})['catch'](function(){var _0x4ec38a=_0x319e14;return{'name':"Movix",'year':'','duration':''};});}function getEpisodeInfo(_0x394bd7,_0x8879af,_0x4021d4){var _0x10fe55=_0x2a35f6;if(!_0x394bd7||!_0x8879af||!_0x4021d4)return Promise["resolve"](null);var _0x4de06e='https://api.themoviedb.org/3/tv/'+_0x394bd7+'/season/'+_0x8879af+'/episode/'+_0x4021d4+"?api_key="+TMDB_KEY+"&language=en-US";return __nvFetch(_0x4de06e)['then'](function(_0x2ec0b3){return _0x2ec0b3['json']();})['then'](function(_0x3b5101){return{'name':_0x3b5101['name']||null,'duration':_0x3b5101['runtime']?_0x3b5101['runtime']+'\x20min':null};})["catch"](function(){return null;});}function buildTitle(_0x48dfca,_0x31f40c,_0x2fe997,_0x4e3592,_0xbff04c,_0x55b198,_0x5beac5,_0x533cb8,_0x2c55a6){var _0x1a8d32={_0x242689:0x8e,_0x23ed36:0x92,_0xef597:0x99,_0x95a154:0x97,_0x35ffa2:0x9f,_0x464df3:0xbb,_0x2c80ae:0x9f,_0x2a4eda:0xc2,_0x2d40ad:0xbc,_0x3d4541:0xab,_0x7edcb0:0xab,_0x2889ba:0xab},_0x2f90bf=_0x2a35f6,_0x146172=_0x31f40c["toLowerCase"]()["replace"](/p/g,'')+'p',_0x2dd22d='⚡',_0x519a57='VF',_0x23f645="🇫🇷",_0x4482f7=(String(_0x2fe997)+'\x20'+String(_0x31f40c)+'\x20'+String(_0x55b198))['toUpperCase']();if(_0x4482f7['indexOf']('MULTI')!==-0x1||_0x4482f7['indexOf']('DUAL')!==-0x1)_0x519a57="Dual-Audio",_0x23f645="🇺🇸 • 🇫🇷";else _0x4482f7['indexOf']('VOST')!==-0x1&&(_0x519a57='VOSTFR',_0x23f645="🇺🇸 • 🇫🇷");var _0x3edf99="🍿 ";_0x5beac5&&_0x533cb8?_0x3edf99+='S'+_0x5beac5+'\x20E'+_0x533cb8+(_0x2c55a6&&_0x2c55a6["name"]?" - "+_0x2c55a6["name"]:'')+" | "+_0x48dfca["name"]:_0x3edf99+=_0x48dfca["name"]+(_0x48dfca["year"]?'\x20-\x20'+_0x48dfca["year"]:'');var _0x5da3b7=_0x2dd22d+'\x20'+_0x146172+'\x20|\x20💬\x20'+_0x519a57+" | 🎵 "+_0x23f645,_0x39586b=(_0x4e3592||'M3U8')['toUpperCase'](),_0x2f4914="H.264";(_0x4482f7['indexOf']('HEVC')!==-0x1||_0x4482f7["indexOf"]('X265')!==-0x1||_0x4482f7["indexOf"]('H265')!==-0x1)&&(_0x2f4914='H.265');var _0x271807=_0x2c55a6&&_0x2c55a6["duration"]?_0x2c55a6["duration"]:_0x48dfca["duration"],_0x242352=_0x271807?'\x20|\x20'+_0x271807:'',_0x3fd813='💿\x20'+_0x39586b+'\x20•\x20'+_0x2f4914+'\x20|\x20🎧\x20AAC'+_0x242352;return _0x3edf99+'\x0a'+_0x5da3b7+'\x0a'+_0x3fd813;}/*decoder removed*/function detectApi(){var _0x1f944c={_0x553cf6:0xa8};if(_cachedEndpoint)return Promise['resolve'](_cachedEndpoint);return __nvFetch(DOMAINS_URL)['then'](function(_0x4bec86){return _0x4bec86['ok']?_0x4bec86['json']():Promise['reject']();})['then'](function(_0x160061){var _0x5bcbee=_0x2bf8,_0x5b2afa=_0x160061["movix"]||MOVIX_FALLBACK;return _cachedEndpoint={'api':'https://api.movix.'+_0x5b2afa,'referer':"https://movix."+_0x5b2afa+'/'},_cachedEndpoint;})['catch'](function(){return _cachedEndpoint={'api':'https://api.movix.'+MOVIX_FALLBACK,'referer':'https://movix.'+MOVIX_FALLBACK+'/'},_cachedEndpoint;});}function resolveRedirect(_0x19f047,_0x5d8074){var _0x42cd9a={_0xdf0824:0x9a},_0x2826cb={_0x22079c:0x8a},_0x288299=_0x2a35f6;return __nvFetch(_0x19f047,{'method':"GET",'redirect':'follow','headers':{'User-Agent':'Mozilla/5.0','Referer':_0x5d8074}})['then'](function(_0x777d3d){var _0x255d76=_0x288299;return _0x777d3d["url"]||_0x19f047;})["catch"](function(){return _0x19f047;});}function resolveEmbed(_0x16b0f3,_0x4d4d48){var _0xc8944f={_0x5ec6f1:0xa1},_0x1570a7=_0x2a35f6;return __nvFetch(_0x16b0f3,{'method':'GET','redirect':'follow','headers':{'User-Agent':'Mozilla/5.0','Referer':_0x4d4d48}})["then"](function(_0x5f5378){return _0x5f5378['text']();})['then'](function(_0x1a4b38){var _0x357168=_0x1570a7,_0x425b97=[/file\s*:\s*["']([^"']+\.m3u8[^"']*)["']/i,/source\s+src=["']([^"']+\.m3u8[^"']*)["']/i,/["']([^"']*\.m3u8(?:\?[^"']*)?)["']/i];for(var _0x29f66c=0x0;_0x29f66c<_0x425b97["length"];_0x29f66c++){var _0x3884f1=_0x1a4b38['match'](_0x425b97[_0x29f66c]);if(_0x3884f1)return _0x3884f1[0x1]['startsWith']('//')?'https:'+_0x3884f1[0x1]:_0x3884f1[0x1];}return null;})["catch"](function(){return null;});}function fetchPurstream(_0x40939b,_0x3e3fa5,_0x248b98,_0x398da9,_0x26a352,_0x55dab8){var _0x4fc634={_0x1ef089:0xaf,_0x5d59f2:0x89},_0x1fbd53=_0x2a35f6,_0xdb4c55=_0x398da9==='tv'?_0x40939b+'/api/purstream/tv/'+_0x248b98+"/stream?season="+(_0x26a352||0x1)+"&episode="+(_0x55dab8||0x1):_0x40939b+'/api/purstream/movie/'+_0x248b98+"/stream";return __nvFetch(_0xdb4c55,{'headers':{'Referer':_0x3e3fa5}})['then'](function(_0x43751f){return _0x43751f['json']();})['then'](function(_0x29bb94){var _0x3df380=_0x1fbd53;return _0x29bb94["sources"]||[];});}function fetchCpasmal(_0x5423f9,_0x101f58,_0x44ee3d,_0x307147,_0x4b17da,_0xb7422c){var _0x2d9e61={_0x4b57c9:0x98,_0x11af41:0xa1},_0x322756={_0xcb7dc2:0xc0},_0x2f6652=_0x2a35f6,_0x2688f4=_0x307147==='tv'?_0x5423f9+"/api/cpasmal/tv/"+_0x44ee3d+'/'+(_0x4b17da||0x1)+'/'+(_0xb7422c||0x1):_0x5423f9+'/api/cpasmal/movie/'+_0x44ee3d;return __nvFetch(_0x2688f4,{'headers':{'Referer':_0x101f58}})["then"](function(_0x2c9d6a){var _0x45931b=_0x2f6652;return _0x2c9d6a["json"]();})["then"](function(_0x3eac4f){var _0x154f44=_0x2f6652,_0x5f404e=[];return['vf','vostfr']["forEach"](function(_0x1185e3){var _0xd1fa5={_0x2f95da:0xba,_0x10d9f5:0xb3},_0x26f0dc=_0x154f44;_0x3eac4f["links"]&&_0x3eac4f["links"][_0x1185e3]&&_0x3eac4f['links'][_0x1185e3]['forEach'](function(_0x45a1d3){var _0xd182b7=_0x26f0dc;_0x5f404e["push"]({'url':_0x45a1d3["url"],'name':"Movix",'player':_0x45a1d3['server'],'lang':_0x1185e3});});}),_0x5f404e;});}function tryFetchAll(_0x3941d5,_0xc17801,_0x5b6fe6,_0x1f472a,_0x485697,_0x534552,_0x274e75,_0x5d0def){var _0x481c0c={_0x2f8c72:0x82},_0x8697ca=_0x2a35f6;return fetchPurstream(_0x3941d5,_0xc17801,_0x5b6fe6,_0x1f472a,_0x485697,_0x534552)["then"](function(_0x18b303){var _0x4eb6aa={_0xec5f91:0x9f},_0x2b561c=_0x8697ca;return Promise["all"](_0x18b303['map'](function(_0x1ade2a){var _0x10482c=_0x2b561c;return resolveRedirect(_0x1ade2a["url"],_0xc17801)['then'](function(_0x2dcf49){var _0x8459a8=_0x10482c,_0x3f5d84=(_0x1ade2a['name']||'')["indexOf"]("1080")!==-0x1?"1080p":"720p",_0x59bf78=(_0x1ade2a["name"]||'')['indexOf']('VOST')!==-0x1?"VOSTFR":(_0x1ade2a['name']||'')['indexOf']('VF')!==-0x1?'VF':'Dual-Audio',_0x16424f=buildTitle(_0x274e75,_0x3f5d84,_0x59bf78,_0x1ade2a['format']||"m3u8",null,null,_0x485697,_0x534552,_0x5d0def);return{'name':"Movix | "+_0x3f5d84['toLowerCase']()+" | "+_0x59bf78,'title':_0x16424f,'size':_0x16424f,'description':_0x16424f,'url':_0x2dcf49,'quality':'','language':'','format':_0x1ade2a['format']||'m3u8','headers':{'User-Agent':'Mozilla/5.0'}};});}));})["catch"](function(){var _0xa52aa0={_0x198cc4:0xa1};return fetchCpasmal(_0x3941d5,_0xc17801,_0x5b6fe6,_0x1f472a,_0x485697,_0x534552)['then'](function(_0x442c5e){var _0x29de33={_0x4e7c46:0xb1},_0x357a8f={_0x437d80:0x80,_0x8d02d5:0xb6,_0x4f6f9c:0xb9},_0x33cfe9=_0x2bf8;return Promise['all'](_0x442c5e["slice"](0x0,0x5)["map"](function(_0x9f0a2c){return resolveEmbed(_0x9f0a2c['url'],_0xc17801)['then'](function(_0x413b29){var _0x2a4415=_0x2bf8;if(!_0x413b29)return null;var _0x2a772c=_0x9f0a2c['lang']&&_0x9f0a2c["lang"]["toUpperCase"]()==='VOSTFR'?"VOSTFR":'VF',_0x5d7f53=buildTitle(_0x274e75,'HD',_0x2a772c,"m3u8",'',_0x9f0a2c["player"],_0x485697,_0x534552,_0x5d0def);return{'name':'Movix\x20|\x20hd\x20|\x20'+_0x2a772c,'title':_0x5d7f53,'size':_0x5d7f53,'description':_0x5d7f53,'url':_0x413b29,'quality':'','language':'','format':"m3u8",'headers':{'Referer':_0xc17801}};});}))["then"](function(_0xb72cb7){var _0x56126c=_0x33cfe9;return _0xb72cb7["filter"](function(_0x1aafeb){return _0x1aafeb!==null;});});});});}function getStreams(_0x1cf2d2,_0x3e20a7,_0x4c17e8,_0x334912){var _0x7cb5dd={_0x1ef100:0xac,_0x23a1e0:0x90},_0x1cefbd=_0x2a35f6;return Promise['all']([getTmdbMetadata(_0x1cf2d2,_0x3e20a7),_0x3e20a7==='tv'?getEpisodeInfo(_0x1cf2d2,_0x4c17e8,_0x334912):Promise['resolve'](null),detectApi()])["then"](function(_0xd591cb){var _0x57d453=_0x1cefbd,_0x5e17ed=_0xd591cb[0x0],_0x21195e=_0xd591cb[0x1],_0x592f09=_0xd591cb[0x2];return tryFetchAll(_0x592f09["api"],_0x592f09["referer"],_0x1cf2d2,_0x3e20a7,_0x4c17e8,_0x334912,_0x5e17ed,_0x21195e);})['catch'](function(){return[];});}typeof module!=="undefined"&&module["exports"]?module['exports']={'getStreams':getStreams}:global["getStreams"]=getStreams;

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
  var PROVIDER = "movix";
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
