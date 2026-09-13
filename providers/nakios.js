/*
 * nv-plugins nakios.js — FULLY DECODED port of the All-in-One-Nuvio provider (4.24.0 merge pass).
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
var _0x1a06=function(){return "";};var _0x2eb68e=_0x1a06;/*rotation removed*/;var TMDB_KEY='f3d757824f08ea2cff45eb8f47ca3a1e',NAKIOS_UA='Mozilla/5.0\x20(Windows\x20NT\x2010.0;\x20Win64;\x20x64)\x20AppleWebKit/537.36\x20(KHTML,\x20like\x20Gecko)\x20Chrome/120.0.0.0\x20Safari/537.36',DOMAINS_URL='https://raw.githubusercontent.com/wooodyhood/nuvio-repo/main/domains.json',NAKIOS_FALLBACK='click',_cachedEndpoint=null;function getTmdbMetadata(_0x45dacc,_0x547f97){var _0x5a1383={_0x2a1dc8:0xbf},_0x2c795a={_0x558864:0xc4,_0x2ebeef:0xa3,_0x3c13e1:0xa3,_0x447f5c:0xa6,_0x5c4eaf:0xbe},_0x436d67=_0x1a06,_0x2adc87='https://api.themoviedb.org/3/'+(_0x547f97==='tv'?'tv':'movie')+'/'+_0x45dacc+'?api_key='+TMDB_KEY+'&language=en-US';return __nvFetch(_0x2adc87)['then'](function(_0x51291e){var _0x532c3e=_0x1a06;return _0x51291e["json"]();})["then"](function(_0x32fcd0){var _0x10bc82=_0x436d67,_0x308a6b=_0x32fcd0["title"]||_0x32fcd0["name"]||"Nakios",_0x2a2412=_0x32fcd0["release_date"]||_0x32fcd0["first_air_date"]||'',_0x230dee=_0x2a2412?_0x2a2412['split']('-')[0x0]:'',_0x46fb31='';if(_0x547f97==='movie'&&_0x32fcd0["runtime"])_0x46fb31=_0x32fcd0["runtime"]+" min";else _0x547f97==='tv'&&_0x32fcd0["episode_run_time"]&&_0x32fcd0['episode_run_time']["length"]>0x0&&(_0x46fb31=_0x32fcd0["episode_run_time"][0x0]+'\x20min');return{'name':_0x308a6b,'year':_0x230dee,'duration':_0x46fb31};})["catch"](function(){var _0x38ad19=_0x436d67;return{'name':"Nakios",'year':'','duration':''};});}/*string-table removed*/function getEpisodeInfo(_0x250583,_0x289e12,_0x2d109d){var _0x2888b3={_0x205433:0x99},_0x54c375={_0x4cbf4a:0xa3},_0x39877d=_0x1a06;if(!_0x250583||!_0x289e12||!_0x2d109d)return Promise["resolve"](null);var _0x949365='https://api.themoviedb.org/3/tv/'+_0x250583+'/season/'+_0x289e12+'/episode/'+_0x2d109d+"?api_key="+TMDB_KEY+'&language=en-US';return __nvFetch(_0x949365)['then'](function(_0x250aba){return _0x250aba['json']();})['then'](function(_0x568341){var _0x5c7a24=_0x39877d;return{'name':_0x568341["name"]||null,'duration':_0x568341["runtime"]?_0x568341["runtime"]+'\x20min':null};})['catch'](function(){return null;});}function buildEndpoint(_0x8995ab){var _0x1f0eb6=_0x1a06,_0x4322a1=_0x8995ab["includes"]("nakios")?_0x8995ab:"nakios."+_0x8995ab;return{'base':'https://'+_0x4322a1,'api':"https://api."+_0x4322a1+"/api",'referer':'https://'+_0x4322a1+'/'};}function detectEndpoint(){var _0x54cafd=_0x1a06;if(_cachedEndpoint)return Promise['resolve'](_cachedEndpoint);return __nvFetch(DOMAINS_URL)["then"](function(_0xeaa3fb){return _0xeaa3fb['ok']?_0xeaa3fb['json']():Promise['reject']();})["then"](function(_0x4a6009){return _cachedEndpoint=buildEndpoint(_0x4a6009['nakios']||NAKIOS_FALLBACK),_cachedEndpoint;})["catch"](function(){return _cachedEndpoint=buildEndpoint(NAKIOS_FALLBACK),_cachedEndpoint;});}function extractOrigin(_0x4aa458){var _0x3f25a9=_0x1a06,_0x4e98d4=_0x4aa458["match"](/^(https?:\/\/[^\/]+)/);return _0x4e98d4?_0x4e98d4[0x1]:null;}function resolveSource(_0x11af07,_0x5ed86c){var _0x2a4b69={_0x194925:0x9e,_0x28d619:0xab,_0xc2539c:0xb9,_0x42516e:0xca,_0x22cb1b:0xb6},_0x243c27=_0x1a06,_0x224c51=_0x11af07['url']||'';if(_0x224c51['startsWith']("http"))return{'url':_0x224c51,'format':_0x11af07['isM3U8']||_0x224c51["indexOf"]('.m3u8')!==-0x1?'m3u8':"mp4",'referer':_0x5ed86c["referer"],'origin':_0x5ed86c["base"]};if(_0x224c51['charAt'](0x0)==='/'){var _0x524f0f=_0x224c51["match"](/[?&]url=([^&]+)/);if(!_0x524f0f)return null;var _0x12fe4e;try{_0x12fe4e=decodeURIComponent(_0x524f0f[0x1]);}catch(_0x396c9f){return null;}var _0x208919=extractOrigin(_0x12fe4e);return{'url':_0x12fe4e,'format':"m3u8",'referer':_0x208919?_0x208919+'/':_0x5ed86c['referer'],'origin':_0x208919||_0x5ed86c['base']};}return null;}function normalizeSources(_0x250cd4,_0x46a02a,_0xaf122e,_0x33b35f,_0x4de12e,_0x352f17){var _0x3ef861={_0x17fd03:0xbe,_0x1099f7:0xa7,_0xd469a0:0xa8,_0x2b7405:0xce,_0x3e0871:0xb8,_0x3b892c:0xc9,_0x4115da:0xa9,_0x33d040:0xb0,_0x13f50b:0xc2},_0x2a587d=_0x1a06,_0x423049=[];for(var _0x4026bc=0x0;_0x4026bc<_0x250cd4["length"];_0x4026bc++){var _0x5eb8c2=_0x250cd4[_0x4026bc];if(_0x5eb8c2["isEmbed"])continue;var _0x2bc749=resolveSource(_0x5eb8c2,_0x46a02a);if(!_0x2bc749)continue;var _0x20e31d=_0x5eb8c2['quality']||'HD',_0x576bf8=(_0x5eb8c2['lang']||'MULTI')['toUpperCase'](),_0x5d6e29=_0x2bc749['format']['toUpperCase'](),_0x15350e='🇫🇷',_0x252ab6='VF';if(_0x576bf8['indexOf']("MULTI")!==-0x1||_0x5eb8c2["name"]&&_0x5eb8c2['name']["toUpperCase"]()['indexOf']('MULTI')!==-0x1)_0x15350e='🌍',_0x252ab6='MULTI';else _0x576bf8['indexOf']("VOST")!==-0x1&&(_0x15350e='🔡',_0x252ab6="VOSTFR");var _0x5949d1='🎬\x20';if(_0x33b35f&&_0x4de12e){var _0x9aa953=_0x352f17&&_0x352f17['name']?" - "+_0x352f17['name']:'';_0x5949d1+='S'+_0x33b35f+'\x20E'+_0x4de12e+_0x9aa953+'\x20|\x20'+_0xaf122e['name'];}else _0x5949d1+=_0xaf122e["name"]+(_0xaf122e["year"]?'\x20-\x20'+_0xaf122e["year"]:'');var _0x3a0676=["📺 "+_0x20e31d,_0x15350e+'\x20'+_0x252ab6,"🎞️ "+_0x5d6e29];if(_0x5eb8c2["size"])_0x3a0676['push']('💾\x20'+_0x5eb8c2['size']);var _0x49da3a=_0x352f17&&_0x352f17["duration"]?_0x352f17["duration"]:_0xaf122e["duration"];if(_0x49da3a)_0x3a0676['push']('⏱️\x20'+_0x49da3a);_0x423049["push"]({'name':"Nakios - "+_0x20e31d,'title':_0x5949d1+'\x0a'+_0x3a0676["join"](" | "),'url':_0x2bc749['url'],'quality':_0x20e31d,'format':_0x2bc749['format'],'headers':{'User-Agent':NAKIOS_UA,'Referer':_0x2bc749['referer'],'Origin':_0x2bc749['origin']}});}return _0x423049;}/*decoder removed*/function getStreams(_0x4cb892,_0x4394b5,_0x4ca306,_0x1478d9){var _0x19316a={_0x123d88:0xc5},_0x4dee11={_0x58f418:0xb1,_0x13e1d0:0xb2},_0x4fe12a=_0x1a06;return Promise['all']([getTmdbMetadata(_0x4cb892,_0x4394b5),_0x4394b5==='tv'?getEpisodeInfo(_0x4cb892,_0x4ca306,_0x1478d9):Promise['resolve'](null),detectEndpoint()])['then'](function(_0x368e90){var _0x53f636=_0x1a06,_0x1b9f68=_0x368e90[0x0],_0x5214c9=_0x368e90[0x1],_0x3e704b=_0x368e90[0x2],_0x4e50cd=_0x4394b5==='tv'?_0x3e704b['api']+"/sources/tv/"+_0x4cb892+'/'+(_0x4ca306||0x1)+'/'+(_0x1478d9||0x1):_0x3e704b['api']+"/sources/movie/"+_0x4cb892;return __nvFetch(_0x4e50cd,{'headers':{'User-Agent':NAKIOS_UA,'Referer':_0x3e704b["referer"]}})["then"](function(_0x4eb8ae){var _0x411625=_0x53f636;return _0x4eb8ae["json"]();})["then"](function(_0x3c19c8){var _0x299c66=_0x53f636;if(!_0x3c19c8['success']||!_0x3c19c8["sources"])return[];var _0x4d3b6e=_0x4394b5==='tv'?_0x4ca306:null,_0xa51308=_0x4394b5==='tv'?_0x1478d9:null;return normalizeSources(_0x3c19c8['sources'],_0x3e704b,_0x1b9f68,_0x4d3b6e,_0xa51308,_0x5214c9);});})["catch"](function(){return[];});}typeof module!=='undefined'&&module["exports"]?module['exports']={'getStreams':getStreams}:global["getStreams"]=getStreams;

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
  var PROVIDER = "nakios";
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
