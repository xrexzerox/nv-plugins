/*
 * nv-plugins dahmermovies.js — FULLY DECODED port of the All-in-One-Nuvio provider (4.23.0 best-settings pass).
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
var _0x1c29=function(){return "";};const _0xb19ab1=_0x1c29;/*string-table removed*//*rotation removed*/;var __async=(_0x45e41a,_0x51e1a,_0x4062f3)=>{return new Promise((_0x5b0a50,_0x172787)=>{const _0x3b5821=_0x1c29;var _0x2df394=_0x41e437=>{const _0x2306a7=_0x1c29;try{_0x4bb7d4(_0x4062f3["next"](_0x41e437));}catch(_0x3ff30b){_0x172787(_0x3ff30b);}},_0x4ed7dd=_0x44ec8a=>{try{_0x4bb7d4(_0x4062f3['throw'](_0x44ec8a));}catch(_0x500bc9){_0x172787(_0x500bc9);}},_0x4bb7d4=_0x1c97cc=>_0x1c97cc['done']?_0x5b0a50(_0x1c97cc["value"]):Promise["resolve"](_0x1c97cc["value"])["then"](_0x2df394,_0x4ed7dd);_0x4bb7d4((_0x4062f3=_0x4062f3["apply"](_0x45e41a,_0x51e1a))["next"]());});};console["log"]("[DahmerMovies] Initializing Scraper");var TMDB_API_KEY="439c478a771f35c05022f9feabcca01c",DAHMER_MOVIES_API='https://a.111477.xyz',DAHMER_WORKER_API="https://p.111477.xyz/bulk?u=";/*decoder removed*/function makeRequest(_0x4873c3){return __async(this,null,function*(){const _0xad7b78=_0x1c29;try{return yield __nvFetch(_0x4873c3,{'headers':{'User-Agent':"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",'Referer':DAHMER_MOVIES_API+'/'}});}catch(_0x259102){return{'ok':![]};}});}function parseLinks(_0x4ebc26){const _0xfff8af=_0xb19ab1,_0x3e8d9a=[],_0x4718e3=/<tr[^>]*>([\s\S]*?)<\/tr>/gi;let _0x1cfdca;while((_0x1cfdca=_0x4718e3["exec"](_0x4ebc26))!==null){const _0x5cee51=_0x1cfdca[0x1],_0x450106=_0x5cee51["match"](/<a[^>]*href=["']([^"']*)["'][^>]*>([^<]*)<\/a>/i),_0x508162=_0x5cee51["match"](/<td[^>]*>(\d+(?:\.\d+)?\s?[KMGT]B)<\/td>/i);if(_0x450106){const _0x1e531e=_0x450106[0x1],_0x3846ab=_0x450106[0x2]['trim'](),_0xe4ff8f=_0x508162?_0x508162[0x1]["trim"]():"N/A";_0x3846ab&&_0x1e531e!=="../"&&/\.(mkv|mp4|avi|webm|m3u8)$/i['test'](_0x3846ab)&&_0x3e8d9a['push']({'text':_0x3846ab,'href':_0x1e531e,'size':_0xe4ff8f});}}return _0x3e8d9a;}function invokeDahmerMovies(_0x281b4d,_0x3875c7,_0x33dad9=null,_0x4ecc2c=null){return __async(this,null,function*(){const _0x5887e1=_0x1c29;var _0x22b1cb;const _0x2e17fa=_0x281b4d["replace"](/:/g,''),_0x2db398=_0x33dad9!==null?["/tvs/"+encodeURIComponent(_0x2e17fa)+"/Season%20"+(_0x33dad9<0xa?'0'+_0x33dad9:_0x33dad9)+'/','/tvs/'+encodeURIComponent(_0x2e17fa)+"/Season%20"+_0x33dad9+'/']:["/movies/"+encodeURIComponent(_0x2e17fa+'\x20('+_0x3875c7+')')+'/'];let _0x4a108a='',_0x577087='';for(const _0x235ef7 of _0x2db398){const _0x38edc5=DAHMER_MOVIES_API+_0x235ef7,_0xf926d=yield makeRequest(_0x38edc5);if(_0xf926d['ok']){_0x4a108a=yield _0xf926d['text'](),_0x577087=_0x38edc5;break;}}if(!_0x4a108a)return[];const _0x3e7c7c=parseLinks(_0x4a108a),_0x3e7a2d=_0x3e7c7c['sort']((_0x366190,_0x5dcba3)=>{const _0x1b17ed=_0x5887e1,_0x5a7dc3=/2160p|4k/i['test'](_0x366190["text"]),_0x4cab78=/2160p|4k/i["test"](_0x5dcba3["text"]);return _0x4cab78-_0x5a7dc3;}),_0x1a99b6=[];for(const _0x250035 of _0x3e7a2d["slice"](0x0,0x5)){let _0x18db41;if(_0x250035["href"]['startsWith']("http"))_0x18db41=_0x250035["href"];else _0x250035["href"]['includes']("/movies/")||_0x250035['href']["includes"]("/tvs/")?_0x18db41=DAHMER_MOVIES_API+(_0x250035["href"]["startsWith"]('/')?'':'/')+_0x250035['href']:_0x18db41=_0x577087+_0x250035['href'];_0x18db41=_0x18db41["replace"](/([^:]\/)\/+/g,'$1'),_0x18db41=decodeURI(_0x18db41);let _0x1ca44d=DAHMER_WORKER_API+encodeURI(_0x18db41);const _0x41c687=_0x250035["text"];let _0x4c99c0="Original";const _0x5dfb1a=/\b(HIN|TAM|TEL|Multi|Dual|DUB|Multi-Audio|MULTI)\b/i['test'](_0x41c687),_0x104fa7=/\b(Eng|English)\b/i["test"](_0x41c687),_0xb619f6=/^[a-zA-Z0-9\s?!\-:]+$/["test"](_0x281b4d);if(_0x5dfb1a)_0x4c99c0='Multi\x20Audio';else{if(_0xb619f6&&_0x104fa7)_0x4c99c0="English";}const _0x5f1538=_0x41c687['match'](/\.(mkv|mp4|m3u8|avi|webm)$/i),_0x4aa592=_0x5f1538?_0x5f1538[0x1]["toUpperCase"]():"LINK",_0x2c2ff8=((_0x22b1cb=_0x41c687["match"](/\b(2160p|1080p|720p|4k)\b/i))==null?void 0x0:_0x22b1cb[0x0])||'1080p',_0x541e77=_0x250035['size']!=="N/A"?_0x250035["size"]:'N/A';let _0x8155f9=_0x41c687["replace"](/\.(mkv|mp4|avi|webm|m3u8)$/i,'')["replace"](/[\[\]()._-]/g,'\x20')["replace"](/\s+/g,'\x20')['trim']();_0x1a99b6["push"]({'name':'DahmerMovies','title':"📺 "+_0x2c2ff8+"  |  🌐 "+_0x4c99c0+"  |  💾 "+_0x541e77+"  |  🎞️ "+_0x4aa592+"  |  ℹ️ "+_0x8155f9,'url':_0x1ca44d,'quality':_0x2c2ff8['toLowerCase'](),'headers':{'User-Agent':"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",'Referer':DAHMER_MOVIES_API+'/','Connection':"keep-alive",'Accept':'*/*','Range':"bytes=0-"},'provider':"dahmermovies"});}return _0x1a99b6;});}function getStreams(_0x390bdb,_0x599059="movie",_0x4513c8=null,_0x3bd20a=null){return __async(this,null,function*(){const _0x15855e=_0x1c29;var _0x4399bd;try{const _0x375ee9=_0x599059==='tv'?'tv':"movie",_0x269590="https://api.themoviedb.org/3/"+_0x375ee9+'/'+_0x390bdb+"?api_key="+TMDB_API_KEY,_0x4732bf=yield makeRequest(_0x269590),_0x5d0d8c=yield _0x4732bf["json"](),_0x5ea823=_0x599059==='tv'?_0x5d0d8c["name"]:_0x5d0d8c["title"],_0x19bc73=(_0x4399bd=_0x599059==='tv'?_0x5d0d8c['first_air_date']:_0x5d0d8c["release_date"])==null?void 0x0:_0x4399bd['substring'](0x0,0x4);if(!_0x5ea823)return[];return yield invokeDahmerMovies(_0x5ea823,_0x19bc73,_0x4513c8,_0x3bd20a);}catch(_0x294f5b){return[];}});}if(typeof module!=="undefined")module["exports"]={'getStreams':getStreams};else global["getStreams"]=getStreams;

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
  var PROVIDER = "dahmermovies";
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
