/*
 * nv-plugins hdghartv.js — FULLY DECODED port of the All-in-One-Nuvio provider (4.24.0 merge pass).
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
var _0x3e8b=function(){return "";};'use strict';const _0x254784=_0x3e8b;/*string-table removed*//*decoder removed*//*rotation removed*/;var __getOwnPropSymbols=Object['getOwnPropertySymbols'],__hasOwnProp=Object['prototype']['hasOwnProperty'],__propIsEnum=Object["prototype"]['propertyIsEnumerable'],__objRest=(_0x32dd60,_0x30537d)=>{const _0x5bc783={_0x183bce:0x1fa},_0x48a134=_0x254784;var _0x451285={};for(var _0x357a59 in _0x32dd60)if(__hasOwnProp["call"](_0x32dd60,_0x357a59)&&_0x30537d['indexOf'](_0x357a59)<0x0)_0x451285[_0x357a59]=_0x32dd60[_0x357a59];if(_0x32dd60!=null&&__getOwnPropSymbols)for(var _0x357a59 of __getOwnPropSymbols(_0x32dd60)){if(_0x30537d["indexOf"](_0x357a59)<0x0&&__propIsEnum['call'](_0x32dd60,_0x357a59))_0x451285[_0x357a59]=_0x32dd60[_0x357a59];}return _0x451285;},__async=(_0x1e68f1,_0x2b2a58,_0x248c56)=>{const _0x67a41d={_0x57dce2:0x204};return new Promise((_0x8454e6,_0x41a041)=>{const _0x598a44={_0x24ebb1:0x204},_0xd4597f=_0x3e8b;var _0x290409=_0x215559=>{const _0x51c502=_0x3e8b;try{_0x3455b5(_0x248c56["next"](_0x215559));}catch(_0x5632eb){_0x41a041(_0x5632eb);}},_0x2e8360=_0x2a308f=>{const _0x5efc02=_0x3e8b;try{_0x3455b5(_0x248c56["throw"](_0x2a308f));}catch(_0x18ee83){_0x41a041(_0x18ee83);}},_0x3455b5=_0xb20b32=>_0xb20b32["done"]?_0x8454e6(_0xb20b32['value']):Promise['resolve'](_0xb20b32["value"])["then"](_0x290409,_0x2e8360);_0x3455b5((_0x248c56=_0x248c56["apply"](_0x1e68f1,_0x2b2a58))["next"]());});},HDGHARTV_API="https://hdghartv.cc",TMDB_BASE='https://api.themoviedb.org/3',TMDB_KEY="439c478a771f35c05022f9feabcca01c",UA="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36",BASE_HEADERS={'User-Agent':UA,'Referer':HDGHARTV_API+'/'};function getStreams(_0x627089,_0x57894b,_0x46fa3e,_0x4eb05f){const _0x39ee39={_0x31a542:0x201,_0x1c4b12:0x1e9,_0x478de0:0x1e7,_0x130b30:0x1f1,_0x5c26fb:0x1f5,_0x1d701b:0x20e,_0x15d06c:0x1fb,_0x29ca2f:0x200,_0x314a44:0x20b,_0x32f1dc:0x1db,_0x2f8c4f:0x1e2,_0x3d3dff:0x216,_0x458bab:0x20f,_0x4a4417:0x202,_0x883135:0x216,_0x14f9e3:0x1df,_0xc6930:0x1e8,_0x47256d:0x1e8,_0x15454f:0x1e8,_0x1e2195:0x1f9,_0x391882:0x1e8,_0x4db12f:0x210,_0x2c556b:0x1ee,_0x416b99:0x1f2,_0x2b663b:0x1d8};return __async(this,null,function*(){const _0x1db28c={_0x1b0a90:0x1da},_0xd3cc3d=_0x3e8b,_0x247eae=_0x57894b==='tv'||_0x57894b==='series',_0x345593=_0x247eae?'series':"movies";try{const _0x2b39f5=_0x247eae?'tv':"movie",_0x4edd3d=TMDB_BASE+'/'+_0x2b39f5+'/'+_0x627089+"?api_key="+TMDB_KEY+"&append_to_response=external_ids",_0x4741f3=yield __nvFetch(_0x4edd3d)["then"](_0x138d07=>_0x138d07["json"]())['catch'](()=>null);if(!_0x4741f3)return[];const _0x4eff81=_0x4741f3['title']||_0x4741f3['name']||"Unknown Title",_0x2a1758=_0x4741f3['release_date']?_0x4741f3['release_date']["split"]('-')[0x0]:_0x4741f3["first_air_date"]?_0x4741f3['first_air_date']['split']('-')[0x0]:"2026";let _0x62a999="N/A";if(!_0x247eae&&_0x4741f3["runtime"])_0x62a999=_0x4741f3["runtime"]+'\x20min';else _0x247eae&&_0x4741f3["episode_run_time"]&&_0x4741f3['episode_run_time']["length"]>0x0&&(_0x62a999=_0x4741f3['episode_run_time'][0x0]+" min");const _0x4d6396=yield __nvFetch(HDGHARTV_API+'/api/search?q='+encodeURIComponent(_0x4eff81)+'&type=all&page=1',{'headers':BASE_HEADERS})['catch'](()=>null);if(!_0x4d6396||!_0x4d6396['ok'])return[];const _0x5e8e1a=yield _0x4d6396["json"]()['catch'](()=>null);if(!_0x5e8e1a)return[];const _0x4024c7=[..._0x5e8e1a['movies']||[],..._0x5e8e1a['series']||[]],_0x4bae4b=_0x4024c7['find'](_0x3a000a=>_0x3a000a['tmdbId']===Number(_0x627089));if(!_0x4bae4b||!_0x4bae4b['_id'])return[];const _0x3ac0cd=yield __nvFetch(HDGHARTV_API+"/api/"+_0x345593+"/public/"+_0x4bae4b["_id"],{'headers':BASE_HEADERS})['catch'](()=>null);if(!_0x3ac0cd||!_0x3ac0cd['ok'])return[];const _0x41f221=yield _0x3ac0cd["json"]()['catch'](()=>null);if(!_0x41f221)return[];let _0x38ed90=[];if(!_0x247eae)_0x38ed90=_0x41f221['streamingLinks']||[];else{const _0x31f8eb=(_0x41f221['seasons']||[])['find'](_0x4d8e2b=>_0x4d8e2b['seasonNumber']===Number(_0x46fa3e));if(!_0x31f8eb)return[];const _0x58869a=(_0x31f8eb["episodes"]||[])["find"](_0x20ddff=>_0x20ddff["episodeNumber"]===Number(_0x4eb05f));if(!_0x58869a)return[];_0x38ed90=_0x58869a['streamingLinks']||[];}const _0x17d9d6=[];for(const _0x4da9f7 of _0x38ed90){if(!_0x4da9f7||!_0x4da9f7["url"])continue;const _0x86bcc3=((_0x4da9f7["quality"]||'')+'\x20'+(_0x4da9f7['name']||'')+'\x20'+_0x4da9f7["url"])['toLowerCase'](),_0xfad067=/\b(2160p|4k)\b/i["test"](_0x86bcc3),_0x615521=/\b(1080p)\b/i['test'](_0x86bcc3),_0x47be0a=/\b(720p)\b/i["test"](_0x86bcc3);if(!_0xfad067&&!_0x615521&&!_0x47be0a)continue;let _0x1b6869="1080p",_0x3d91ab='🔥',_0x41a24c=0x2;if(_0xfad067)_0x1b6869='2160p',_0x3d91ab='💎',_0x41a24c=0x3;else _0x47be0a&&(_0x1b6869='720p',_0x3d91ab='🎬',_0x41a24c=0x1);let _0x38cbde='Dual-Audio\x20🌐';/hindi|hin|🇮🇳/["test"](_0x86bcc3)&&!/multi|dual/["test"](_0x86bcc3)&&(_0x38cbde='Hindi\x20🇮🇳');const _0x18b157=_0x4da9f7['url']["includes"](".m3u8"),_0x4243ea=_0x18b157?'HLS':/\b(mp4|avi|m4v)\b/["test"](_0x86bcc3)?"MP4":"MKV",_0xba6757=/\b(hevc|x265|h265)\b/["test"](_0x86bcc3)?'x.265':'x.264',_0x2e9d52=_0x18b157?'HLS':"Direct",_0xafec24=/\b(ddp|dd\+|eac3|dolby)\b/["test"](_0x86bcc3)?"E-AC3":/\b(ac3|dolby)\b/['test'](_0x86bcc3)?"AC3":'AAC',_0x437631=_0x247eae?"🎦 "+_0x4eff81+" - ("+_0x2a1758+')\x20|\x20S'+(_0x46fa3e||0x1)+'E'+(_0x4eb05f||0x1):'🎦\x20'+_0x4eff81+" - ("+_0x2a1758+')',_0x2330f6=_0x437631+'\x0a'+_0x3d91ab+'\x20'+_0x1b6869+'\x20|\x20🔊\x20'+_0x38cbde+" | ⏳ "+_0x62a999+'\x0a⚡\x20'+_0x4243ea+" | 🎥 "+_0xba6757+" • "+_0x2e9d52+" | 🎧 "+_0xafec24+"\n🛰️ Source: HDGharTV";_0x17d9d6["push"]({'rank':_0x41a24c,'name':'HDGharTV\x20|\x20'+_0x1b6869+'\x20|\x20Dual-Audio','title':_0x2330f6,'description':_0x2330f6,'size':_0x2330f6,'url':_0x4da9f7['url'],'headers':BASE_HEADERS,'behaviorHints':{'notSupported':![],'proxyHeaders':{'request':BASE_HEADERS}}});}return _0x17d9d6["sort"]((_0x424def,_0x210e92)=>_0x210e92['rank']-_0x424def['rank']),_0x17d9d6['map'](_0x3db0d7=>{const _0x573737=_0xd3cc3d;var _0x1e23c5=_0x3db0d7,{rank:_0x47a32f}=_0x1e23c5,_0x19220f=__objRest(_0x1e23c5,["rank"]);return _0x19220f;});}catch(_0xf7c188){return console["error"]("Failed to construct layout from HDGHARTV endpoint:",_0xf7c188),[];}});}typeof module!=="undefined"&&module["exports"]?module['exports']={'getStreams':getStreams}:global["getStreams"]=getStreams;

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
  var PROVIDER = "hdghartv";
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
