/*
 * nv-plugins playimdb.js — FULLY DECODED port of the All-in-One-Nuvio provider (4.23.0 best-settings pass).
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
var _0x351c=function(){return "";};var _0x591515=_0x351c;/*string-table removed*//*rotation removed*/;var __defProp=Object["defineProperty"],__defProps=Object["defineProperties"],__getOwnPropDescs=Object["getOwnPropertyDescriptors"],__getOwnPropSymbols=Object["getOwnPropertySymbols"],__hasOwnProp=Object["prototype"]['hasOwnProperty'],__propIsEnum=Object['prototype']["propertyIsEnumerable"],__defNormalProp=(_0x1b278f,_0x4056c3,_0x70e7f3)=>_0x4056c3 in _0x1b278f?__defProp(_0x1b278f,_0x4056c3,{'enumerable':!![],'configurable':!![],'writable':!![],'value':_0x70e7f3}):_0x1b278f[_0x4056c3]=_0x70e7f3,__spreadValues=(_0x2b23de,_0xbe8bfa)=>{var _0x1d271a=_0x591515;for(var _0x529cd0 in _0xbe8bfa||(_0xbe8bfa={}))if(__hasOwnProp['call'](_0xbe8bfa,_0x529cd0))__defNormalProp(_0x2b23de,_0x529cd0,_0xbe8bfa[_0x529cd0]);if(__getOwnPropSymbols)for(var _0x529cd0 of __getOwnPropSymbols(_0xbe8bfa)){if(__propIsEnum["call"](_0xbe8bfa,_0x529cd0))__defNormalProp(_0x2b23de,_0x529cd0,_0xbe8bfa[_0x529cd0]);}return _0x2b23de;},__spreadProps=(_0x2ec486,_0x39c3da)=>__defProps(_0x2ec486,__getOwnPropDescs(_0x39c3da)),__async=(_0x37b65b,_0x170b08,_0x488249)=>{var _0x32836b={_0x30c019:0x85};return new Promise((_0x9bda57,_0x583983)=>{var _0x129858=_0x351c,_0x548817=_0x5f4b48=>{try{_0x597fac(_0x488249['next'](_0x5f4b48));}catch(_0x34a995){_0x583983(_0x34a995);}},_0x2a2afe=_0x200266=>{try{_0x597fac(_0x488249['throw'](_0x200266));}catch(_0x5d68bc){_0x583983(_0x5d68bc);}},_0x597fac=_0x538a38=>_0x538a38["done"]?_0x9bda57(_0x538a38['value']):Promise["resolve"](_0x538a38['value'])["then"](_0x548817,_0x2a2afe);_0x597fac((_0x488249=_0x488249['apply'](_0x37b65b,_0x170b08))["next"]());});},PROVIDER_NAME="🟡 PlayIMDb",BASE_API='https://streamdata.vaplayer.ru/api.php',TMDB_API_KEY="68e094699525b18a70bab2f86b1fa706",HEADERS={'Origin':'https://nextgencloudfabric.com','Referer':'https://nextgencloudfabric.com/','User-Agent':'Mozilla/5.0\x20(Windows\x20NT\x2010.0;\x20Win64;\x20x64)\x20AppleWebKit/537.36\x20(KHTML,\x20like\x20Gecko)\x20Chrome/124.0.0.0\x20Safari/537.36'};function fetchWithTimeout(_0xb5554e,_0x3c5a3f){return __async(this,null,function*(){var _0x1a87ae=_0x351c,_0x4fdd10=0x2710,_0x286913=typeof AbortSignal!=='undefined'&&AbortSignal['timeout']?AbortSignal['timeout'](_0x4fdd10):null,_0x40eed4=__spreadProps(__spreadValues({},_0x3c5a3f),{'headers':__spreadValues(__spreadValues({},HEADERS),(_0x3c5a3f==null?void 0x0:_0x3c5a3f['headers'])||{})});if(_0x286913)_0x40eed4["signal"]=_0x286913;return yield __nvFetch(_0xb5554e,_0x40eed4);});}/*decoder removed*/function fetchJson(_0x373bf4,_0x5a7592){var _0x588720={_0x263c7e:0xb8};return __async(this,null,function*(){var _0x8c4196=_0x351c;try{var _0x2d6ca2=yield fetchWithTimeout(_0x373bf4,_0x5a7592||{});if(_0x2d6ca2['ok'])return yield _0x2d6ca2["json"]();return null;}catch(_0x45ec7a){return console["log"]('['+PROVIDER_NAME+"] fetchJson error: "+_0x45ec7a),null;}});}function getTmdbMetadata(_0xf33d62,_0x12d36b,_0x12f397,_0x20f23a){var _0x2fb4c1={_0x4e10a2:0xb9,_0x50bc46:0xbf,_0x1fd756:0xa1,_0x18146d:0x9e,_0x4a3e87:0x9c,_0x43d02e:0xbd,_0x5e4961:0xbd};return __async(this,null,function*(){var _0x486bc5=_0x351c;let _0x5aab97='Unknown\x20Title',_0x3c9ac0=_0x12d36b==='tv'?'45\x20min':"90 min";try{const _0x276e27=_0x12d36b==='movie'?'movie':'tv',_0x3b77c2='https://api.themoviedb.org/3/'+_0x276e27+'/'+_0xf33d62+'?api_key='+TMDB_API_KEY,_0x14b051=yield __nvFetch(_0x3b77c2);if(!_0x14b051['ok'])return{'name':_0x5aab97,'year':'N/A','duration':_0x3c9ac0};const _0x1b9e97=yield _0x14b051['json']();let _0x4f8b5b=_0x3c9ac0;if(_0x12d36b==="movie"&&_0x1b9e97["runtime"])_0x4f8b5b=_0x1b9e97["runtime"]+" min";else{if(_0x12d36b==='tv'){const _0x35f399="https://api.themoviedb.org/3/tv/"+_0xf33d62+'/season/'+_0x12f397+"/episode/"+_0x20f23a+'?api_key='+TMDB_API_KEY,_0x326882=yield __nvFetch(_0x35f399);if(_0x326882['ok']){const _0x4d5e6c=yield _0x326882["json"]();if(_0x4d5e6c["runtime"])_0x4f8b5b=_0x4d5e6c["runtime"]+" min";else _0x1b9e97['episode_run_time']&&_0x1b9e97['episode_run_time']['length']>0x0&&(_0x4f8b5b=_0x1b9e97['episode_run_time'][0x0]+" min");}}}return{'name':_0x1b9e97["title"]||_0x1b9e97['name']||_0x5aab97,'year':(_0x1b9e97['release_date']||_0x1b9e97['first_air_date']||'')["split"]('-')[0x0]||'N/A','duration':_0x4f8b5b};}catch(_0x348187){return{'name':_0x5aab97,'year':'N/A','duration':_0x3c9ac0};}});}function getStreams(_0x8253ec,_0x3a181f,_0x7a0c24,_0x32fd74){var _0x432895={_0x36ad1a:0x7c,_0x33b537:0x7f,_0x4b92ed:0x88,_0x282fa5:0x95,_0x5d3a37:0x9d,_0x27ff5c:0xa8,_0x3bfa79:0x94,_0x151d3e:0x82,_0x6398dc:0x82,_0x2191f5:0x9b,_0x2856d1:0x99,_0x199283:0x8a,_0x23a90a:0x93,_0x54df83:0x82,_0x1b504f:0x8c,_0x45d558:0xc3,_0x11c7d2:0x90};return __async(this,null,function*(){var _0x2c9985={_0x28ff84:0xab,_0x2738e9:0x9a,_0x25ba58:0xb2,_0xdbb64f:0x7e,_0x38bbff:0x86,_0x4e0cd5:0x91,_0x2e8281:0xba,_0x528e00:0x91},_0x416f0a={_0x42adb9:0x96},_0x11e389=_0x351c,_0x1e315d=[];try{var _0x5348b1=_0x3a181f==='tv'||_0x3a181f==="series",_0x305f95=_0x5348b1?'tv':'movie';if(!_0x8253ec)return console['log']('['+PROVIDER_NAME+']\x20Missing\x20TMDB\x20ID'),_0x1e315d;var _0x2a5fa1=yield getTmdbMetadata(_0x8253ec,_0x305f95,_0x7a0c24,_0x32fd74),_0x2f5792=BASE_API+"?tmdb="+_0x8253ec+'&type='+_0x305f95;if(_0x5348b1){if(!_0x7a0c24||!_0x32fd74)return _0x1e315d;_0x2f5792+="&season="+_0x7a0c24+"&episode="+_0x32fd74;}console["log"]('['+PROVIDER_NAME+"] Fetching stream data from API: "+_0x2f5792);var _0x47c700=yield fetchJson(_0x2f5792,{'headers':HEADERS});if(_0x47c700&&(_0x47c700['status_code']==0xc8||_0x47c700["status_code"]==="200")&&_0x47c700['data']&&_0x47c700["data"]['stream_urls']){var _0x2a8eff='1080p\x20FHD',_0x35e348='1080P',_0x4ff203=String(_0x47c700["data"]['file_name']||'')['toLowerCase']();if(_0x4ff203["includes"]("2160p")||_0x4ff203['includes']('4k'))_0x2a8eff='4K\x20UHD',_0x35e348="2160P";else{if(_0x4ff203["includes"]("1080p"))_0x2a8eff='1080p\x20FHD',_0x35e348="1080P";else _0x4ff203['includes']('720p')&&(_0x2a8eff="720p HD",_0x35e348="720P");}var _0x241338='Original-Audio',_0x2614ab='Original-Audio';if(_0x4ff203["includes"]('dual')||_0x4ff203["includes"]("hindi")&&_0x4ff203["includes"]('english'))_0x241338='Dual-Audio',_0x2614ab="English • Hindi";else{if(_0x4ff203['includes']('multi'))_0x241338="Multi-Audio",_0x2614ab='Multilingual';else{if(_0x4ff203["includes"]('hindi'))_0x241338='Hindi-Audio',_0x2614ab='Hindi';else _0x4ff203['includes']('english')&&(_0x241338='English-Audio',_0x2614ab="English");}}var _0x28cac4=_0x2a5fa1["name"]||"Unknown Title",_0x2ac274=_0x2a5fa1['year']||"N/A";_0x47c700["data"]["stream_urls"]['forEach']((_0x1dec24,_0x4c0467)=>{var _0x30cb58=_0x11e389,_0x23a99f=_0x1dec24['toLowerCase'](),_0x1f87bf='Server\x20'+(_0x4c0467+0x1),_0x12e7e0="MKV";if(_0x23a99f['includes']('.mp4'))_0x12e7e0='MP4';if(_0x23a99f['includes']('.m3u8'))_0x12e7e0="M3U8";var _0x3ccd21=PROVIDER_NAME+" | "+_0x2a8eff+" | "+_0x241338,_0x5e7f4e=_0x5348b1?"🎬 "+_0x28cac4+" - S"+_0x7a0c24+'E'+_0x32fd74+'\x20('+_0x2ac274+')':'🎬\x20'+_0x28cac4+'\x20-\x20'+_0x2ac274,_0x5012a3='💎\x20'+_0x35e348+'\x20|\x20🌍\x20'+_0x2614ab,_0x244502='🎞️\x20'+_0x12e7e0+'\x20|\x20⏱️\x20'+_0x2a5fa1["duration"]+" | 📌 "+_0x1f87bf,_0x79ac9d=_0x5e7f4e+'\x0a'+_0x5012a3+'\x0a'+_0x244502,_0x3812f6={'name':_0x3ccd21,'title':_0x79ac9d,'url':_0x1dec24,'quality':_0x35e348["toLowerCase"](),'type':"direct"};_0x3812f6['headers']=HEADERS,_0x47c700["default_subs"]&&Array['isArray'](_0x47c700["default_subs"])&&_0x47c700['default_subs']['length']>0x0&&(_0x3812f6["subtitles"]=_0x47c700["default_subs"]['map'](_0x3d9f15=>{var _0x319bfe=_0x30cb58;return{'id':_0x3d9f15['code']||_0x3d9f15["lang"],'url':_0x3d9f15["url"],'lang':_0x3d9f15['lang']};})),_0x1e315d["push"](_0x3812f6);});}}catch(_0x3b0a1f){console['log']('['+PROVIDER_NAME+"] Error: "+_0x3b0a1f["message"]);}return _0x1e315d;});}typeof module!=='undefined'&&module["exports"]?module["exports"]={'getStreams':getStreams}:global["getStreams"]=getStreams;

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
  var PROVIDER = "playimdb";
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
