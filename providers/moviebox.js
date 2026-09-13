/*
 * nv-plugins moviebox.js — FULLY DECODED port of the All-in-One-Nuvio provider (4.24.0 merge pass).
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
var _0x1301=function(){return "";};'use strict';const _0x5df61e=_0x1301;/*decoder removed*//*rotation removed*/;var __defProp=Object['defineProperty'],__defProps=Object['defineProperties'],__getOwnPropDescs=Object['getOwnPropertyDescriptors'],__getOwnPropSymbols=Object['getOwnPropertySymbols'],__hasOwnProp=Object['prototype']['hasOwnProperty'],__propIsEnum=Object["prototype"]["propertyIsEnumerable"],__defNormalProp=(_0x40bf53,_0x6486c7,_0x5874a7)=>_0x6486c7 in _0x40bf53?__defProp(_0x40bf53,_0x6486c7,{'enumerable':!![],'configurable':!![],'writable':!![],'value':_0x5874a7}):_0x40bf53[_0x6486c7]=_0x5874a7,__spreadValues=(_0x4168ea,_0x2a9b98)=>{const _0x51bb8f=_0x5df61e;for(var _0x5882ca in _0x2a9b98||(_0x2a9b98={}))if(__hasOwnProp['call'](_0x2a9b98,_0x5882ca))__defNormalProp(_0x4168ea,_0x5882ca,_0x2a9b98[_0x5882ca]);if(__getOwnPropSymbols)for(var _0x5882ca of __getOwnPropSymbols(_0x2a9b98)){if(__propIsEnum["call"](_0x2a9b98,_0x5882ca))__defNormalProp(_0x4168ea,_0x5882ca,_0x2a9b98[_0x5882ca]);}return _0x4168ea;},__spreadProps=(_0x451df1,_0x2b5730)=>__defProps(_0x451df1,__getOwnPropDescs(_0x2b5730)),__async=(_0x14d30f,_0x6a36a5,_0x4cc304)=>{const _0x2d60b2={_0x1f2408:0xf2};return new Promise((_0x565c41,_0x2dfc0b)=>{const _0x2c160d={_0x5c1f27:0xe7},_0x293180=_0x1301;var _0x2aeac6=_0x300863=>{const _0x49c7d1=_0x1301;try{_0x34f38a(_0x4cc304["next"](_0x300863));}catch(_0x9546d7){_0x2dfc0b(_0x9546d7);}},_0x301a54=_0x5a164e=>{const _0x51b13f=_0x1301;try{_0x34f38a(_0x4cc304["throw"](_0x5a164e));}catch(_0x199ef4){_0x2dfc0b(_0x199ef4);}},_0x34f38a=_0x4ba69b=>_0x4ba69b['done']?_0x565c41(_0x4ba69b["value"]):Promise['resolve'](_0x4ba69b["value"])['then'](_0x2aeac6,_0x301a54);_0x34f38a((_0x4cc304=_0x4cc304["apply"](_0x14d30f,_0x6a36a5))["next"]());});};function onSettings(){const _0xd81328={_0x50e1b2:0xfe,_0xb098b:0xe5,_0x8a736d:0xe1};return __async(this,null,function*(){const _0x2e9c9c=_0x1301;return[{'type':"header",'label':"Audio Preferences"},{'type':"toggle",'key':'langEnglish','label':"Enable English 🇺🇸",'defaultValue':!![]},{'type':'toggle','key':"langHindi",'label':'Enable\x20Hindi\x20🇮🇳','defaultValue':!![]}];});}var PROVIDER_NAME="MovieBox",CINESCRAPE_BASE='https://pengu.uk/%7B%22source_moviebox%22%3A%22on%22%2C%22res_1080%22%3A%22on%22%2C%22disable_direct%22%3A%22on%22%2C%22auth_token%22%3A%22XwZg2rLkLlbjXBeDVCyxgfHXjxN1ijLMkUuToW8KaKc%22%7D',TMDB_API_KEY="439c478a771f35c05022f9feabcca01c";function getStreams(_0x5a32a7,_0x2fe227,_0x328cc2,_0x2733e2){const _0x11a400={_0x5d2410:0xe4,_0x277c11:0xfb,_0x19fe37:0xd6,_0x4a3bd8:0xde,_0x4dbb50:0xee,_0x56fb4e:0xff,_0x4eae8d:0xd1,_0x21c047:0xcf,_0x53d823:0xd4};return __async(this,null,function*(){const _0x39b341={_0x3e3e69:0xd8},_0xb642cf=_0x1301;var _0xd04b39;const _0x700f53=_0x2fe227==='tv'||_0x2fe227==="series",_0x59c3c7="https://api.themoviedb.org/3/"+(_0x700f53?'tv':'movie')+'/'+_0x5a32a7+"?api_key="+TMDB_API_KEY+"&append_to_response=external_ids";try{const _0x3699f4=globalThis['SCRAPER_SETTINGS']||{},_0x51ddfd=_0x3699f4['langEnglish']!==![],_0x2601af=_0x3699f4['langHindi']!==![],_0x11cd2f=yield __nvFetch(_0x59c3c7)['then'](_0x8d9829=>_0x8d9829['json']()),_0x30b102=((_0xd04b39=_0x11cd2f==null?void 0x0:_0x11cd2f['external_ids'])==null?void 0x0:_0xd04b39['imdb_id'])||(_0x11cd2f==null?void 0x0:_0x11cd2f['imdb_id']);if(!_0x30b102)return[];const _0x3a0392=_0x11cd2f["title"]||_0x11cd2f["name"]||'Movie/Show',_0x1469d4=_0x11cd2f['release_date']?_0x11cd2f["release_date"]['split']('-')[0x0]:_0x11cd2f['first_air_date']?_0x11cd2f["first_air_date"]["split"]('-')[0x0]:"2026",_0x492ce4=_0x700f53?CINESCRAPE_BASE+'/stream/series/'+_0x30b102+':'+(_0x328cc2||0x1)+':'+(_0x2733e2||0x1)+'.json':CINESCRAPE_BASE+'/stream/movie/'+_0x30b102+".json",_0xcdbdaf=yield __nvFetch(_0x492ce4)["then"](_0x547ac8=>_0x547ac8['json']());if(!(_0xcdbdaf==null?void 0x0:_0xcdbdaf['streams'])||_0xcdbdaf["streams"]["length"]===0x0)return[];const _0x146ec8=[];_0xcdbdaf["streams"]["forEach"](_0x2e3ff7=>{const _0x3175c2=_0xb642cf;if(_0x2e3ff7["url"]&&_0x2e3ff7["url"]['includes']('bcdnxw.hakunaymatata.com'))return;const _0x121347=(_0x2e3ff7['title']||_0x2e3ff7['description']||'')['toLowerCase']();let _0x549c7c="English 🇺🇲",_0x2e7cfb=![];if(/hindi|hin|dual/["test"](_0x121347))_0x549c7c='Hindi\x20🇮🇳',_0x2e7cfb=!![];else/multi|🌐/['test'](_0x121347)&&(_0x549c7c='Multi\x20🌐');if(_0x2e7cfb&&!_0x2601af)return;if(!_0x2e7cfb&&!_0x51ddfd)return;_0x146ec8['push'](__spreadProps(__spreadValues({},_0x2e3ff7),{'lang':_0x549c7c}));});const _0x1ab62a=[],_0x56398f={};return _0x146ec8['forEach'](_0x7a7a8b=>{const _0xdd8916=_0xb642cf,_0x553cb6=(_0x7a7a8b['title']||'')['toLowerCase'](),_0x1341b5=/2160|4k/["test"](_0x553cb6)?'2160p':/1080/["test"](_0x553cb6)?'1080p':/720/["test"](_0x553cb6)?'720p':/480/["test"](_0x553cb6)?'480p':'1080p',_0x16e4d5=_0x1341b5+'-'+_0x7a7a8b['lang'];if(!_0x56398f[_0x16e4d5])_0x56398f[_0x16e4d5]=[];_0x56398f[_0x16e4d5]['push'](_0x7a7a8b);}),Object["entries"](_0x56398f)["forEach"](([_0x2fa5ea,_0x1b7ef0])=>{const _0x13db6d={_0x193491:0xe2,_0xbabefb:0xde,_0x4b3c1b:0xdc,_0x36878c:0xf7,_0x5166ea:0xd2,_0x2b66e9:0xe0},[_0x394e6f,_0xcee24c]=_0x2fa5ea['split']('-');_0x1b7ef0['forEach'](_0x5016c1=>{const _0x1a42be=_0x1301,_0x475b1c=(_0x5016c1['title']||_0x5016c1["description"]||'')["toLowerCase"](),_0x2bd5e6=_0x5016c1["title"]?_0x5016c1['title']["match"](/(\d+(?:\.\d+)?\s*(?:GB|MB))/i):null,_0x158b6d=_0x2bd5e6?_0x2bd5e6[0x1]:'1.99\x20GB',_0xc55352=/\b(mp4|avi|m4v)\b/["test"](_0x475b1c)?'MP4':"MKV",_0x5bd01c=_0xcee24c["replace"](/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD00-\uDFFF]/g,'')['trim'](),_0x50ae5a='🎬\x20'+_0x3a0392+'\x20-\x20('+_0x1469d4+')\x0a💎\x20'+_0x394e6f+" | 🔊 "+_0x5bd01c+'\x20|\x20💾\x20'+_0x158b6d+"\n🎞️ "+_0xc55352+" | ⛓️‍💥 MovieBox";_0x1ab62a["push"]({'name':PROVIDER_NAME+" | "+_0x394e6f+" | "+_0xcee24c,'title':_0x50ae5a,'size':_0x50ae5a,'description':_0x50ae5a,'url':_0x5016c1['url'],'behaviorHints':{'proxyHeaders':{'request':{'Referer':'https://stremio-moviebox-1.onrender.com/'}}}});});}),_0x1ab62a;}catch(_0x373340){return console['error']('Global\x20processing\x20failure\x20context:',_0x373340),[];}});}typeof module!=='undefined'&&module['exports']?module['exports']={'getStreams':getStreams,'onSettings':onSettings}:(global['getStreams']=getStreams,global["onSettings"]=onSettings);/*string-table removed*/

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
  var PROVIDER = "moviebox";
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
