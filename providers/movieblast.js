/*
 * nv-plugins movieblast.js — FULLY DECODED port of the All-in-One-Nuvio provider (4.23.0 best-settings pass).
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
var _0x2a84=function(){return "";};const _0x5096f5=_0x2a84;/*rotation removed*/;var __create=Object["create"],__defProp=Object['defineProperty'],__defProps=Object["defineProperties"],__getOwnPropDesc=Object["getOwnPropertyDescriptor"],__getOwnPropDescs=Object["getOwnPropertyDescriptors"],__getOwnPropNames=Object["getOwnPropertyNames"],__getOwnPropSymbols=Object["getOwnPropertySymbols"],__getProtoOf=Object['getPrototypeOf'],__hasOwnProp=Object["prototype"]["hasOwnProperty"],__propIsEnum=Object["prototype"]["propertyIsEnumerable"],__defNormalProp=(_0x2f6bc6,_0x4b6353,_0x140ba5)=>_0x4b6353 in _0x2f6bc6?__defProp(_0x2f6bc6,_0x4b6353,{'enumerable':!![],'configurable':!![],'writable':!![],'value':_0x140ba5}):_0x2f6bc6[_0x4b6353]=_0x140ba5,__spreadValues=(_0xe116ae,_0x31f087)=>{const _0x485ac7=_0x5096f5;for(var _0x26c768 in _0x31f087||(_0x31f087={}))if(__hasOwnProp["call"](_0x31f087,_0x26c768))__defNormalProp(_0xe116ae,_0x26c768,_0x31f087[_0x26c768]);if(__getOwnPropSymbols)for(var _0x26c768 of __getOwnPropSymbols(_0x31f087)){if(__propIsEnum["call"](_0x31f087,_0x26c768))__defNormalProp(_0xe116ae,_0x26c768,_0x31f087[_0x26c768]);}return _0xe116ae;},__spreadProps=(_0x29229e,_0xafc651)=>__defProps(_0x29229e,__getOwnPropDescs(_0xafc651)),__copyProps=(_0x4e4855,_0x172aab,_0x3f2bd2,_0x5a288a)=>{const _0x1d640a=_0x5096f5;if(_0x172aab&&typeof _0x172aab==="object"||typeof _0x172aab==="function"){for(let _0x2d4dd8 of __getOwnPropNames(_0x172aab))if(!__hasOwnProp["call"](_0x4e4855,_0x2d4dd8)&&_0x2d4dd8!==_0x3f2bd2)__defProp(_0x4e4855,_0x2d4dd8,{'get':()=>_0x172aab[_0x2d4dd8],'enumerable':!(_0x5a288a=__getOwnPropDesc(_0x172aab,_0x2d4dd8))||_0x5a288a["enumerable"]});}return _0x4e4855;},__toESM=(_0x47c598,_0x5847fa,_0x25675a)=>(_0x25675a=_0x47c598!=null?__create(__getProtoOf(_0x47c598)):{},__copyProps(_0x5847fa||!_0x47c598||!_0x47c598["__esModule"]?__defProp(_0x25675a,"default",{'value':_0x47c598,'enumerable':!![]}):_0x25675a,_0x47c598)),__async=(_0x9f583a,_0x2a2a09,_0x5a70eb)=>{return new Promise((_0x2adea4,_0x4691ab)=>{const _0x5cc2bc=_0x2a84;var _0x469cf7=_0x3d6f15=>{const _0x13ac69=_0x2a84;try{_0x5c2342(_0x5a70eb["next"](_0x3d6f15));}catch(_0x5c07f6){_0x4691ab(_0x5c07f6);}},_0x51c245=_0x3ddc9b=>{const _0x271587=_0x2a84;try{_0x5c2342(_0x5a70eb["throw"](_0x3ddc9b));}catch(_0x5f2a47){_0x4691ab(_0x5f2a47);}},_0x5c2342=_0x3704b8=>_0x3704b8["done"]?_0x2adea4(_0x3704b8["value"]):Promise["resolve"](_0x3704b8['value'])['then'](_0x469cf7,_0x51c245);_0x5c2342((_0x5a70eb=_0x5a70eb["apply"](_0x9f583a,_0x2a2a09))["next"]());});},BASE_URL='https://app.cloud-mb.xyz',TOKEN="jdvhhjv255vghhghdhvfch2565656jhdcghfdf",APP_ID='com.movieblast',HEADERS={'user-agent':'okhttp/5.0.0-alpha.6','x-request-x':APP_ID},SEARCH_HEADERS=__spreadProps(__spreadValues({},HEADERS),{'hash256':'86dc03244adddb3cbedbf0ae36074a736ee293a64774b18e82a6244eafd0df30','packagename':APP_ID}),SIGN_SECRET="GJ8reydarI7Jqat9rvbAJKNQ9gY4DoEQF2H5nfuI1gi",TMDB_API_KEY="439c478a771f35c05022f9feabcca01c",TMDB_BASE_URL="https://api.themoviedb.org/3",import_crypto_js=__toESM(require('crypto-js'));function generateSignedUrl(_0x5e4203){const _0x273036=_0x5096f5;try{const _0x56b7f6=new URL(_0x5e4203),_0x1ee493=_0x56b7f6['pathname'],_0x596117=Math["floor"](Date["now"]()/0x3e8)["toString"](),_0x28999f=import_crypto_js["default"]["HmacSHA256"](_0x1ee493+_0x596117,SIGN_SECRET),_0x5b06cf=import_crypto_js["default"]["enc"]["Base64"]["stringify"](_0x28999f),_0x99067d=encodeURIComponent(_0x5b06cf);return _0x5e4203+"?verify="+_0x596117+'-'+_0x99067d;}catch(_0x313287){return console["error"]("[MovieBlast] Error generating signed URL:",_0x313287["message"]),_0x5e4203;}}function matchQuality(_0x256200){const _0x43bb8e=_0x5096f5;if(!_0x256200)return "Unknown";const _0x3e071e=_0x256200["toLowerCase"]();if(_0x3e071e["includes"]("2160")||_0x3e071e["includes"]('4k'))return'4K';if(_0x3e071e["includes"]("1440"))return'2K';if(_0x3e071e["includes"]('1080'))return "1080p";if(_0x3e071e['includes']("720"))return "720p";if(_0x3e071e["includes"]("480"))return "480p";if(_0x3e071e['includes']("360"))return "360p";return "Unknown";}function normalizeTitle(_0x22fd67){const _0x8372c6=_0x5096f5;if(!_0x22fd67)return'';return _0x22fd67["toLowerCase"]()["replace"](/\b(the|a|an)\b/g,'')["replace"](/[:\-_]/g,'\x20')["replace"](/\s+/g,'\x20')["replace"](/[^\w\s]/g,'')["trim"]();}function getTMDBDetails(_0x3b02bc,_0x53718d){return __async(this,null,function*(){const _0x4303de=_0x2a84,_0xea0646=_0x53718d==='tv'?'tv':"movie",_0x217bdb=TMDB_BASE_URL+'/'+_0xea0646+'/'+_0x3b02bc+'?api_key='+TMDB_API_KEY,_0x5e2dd7=yield __nvFetch(_0x217bdb,{'method':"GET",'headers':{'Accept':"application/json",'User-Agent':"Mozilla/5.0"}});if(!_0x5e2dd7['ok'])throw new Error("TMDB API error: "+_0x5e2dd7["status"]);const _0x4fcce7=yield _0x5e2dd7["json"](),_0x53021f=_0x53718d==='tv'?_0x4fcce7['name']:_0x4fcce7["title"],_0x3329ed=_0x53718d==='tv'?_0x4fcce7["first_air_date"]:_0x4fcce7["release_date"],_0x2bc970=_0x3329ed?parseInt(_0x3329ed["split"]('-')[0x0]):null;return{'title':_0x53021f,'year':_0x2bc970};});}function calculateTitleSimilarity(_0x59be19,_0x5f4f0f){const _0xca79e1=_0x5096f5,_0x19f894=normalizeTitle(_0x59be19),_0x323850=normalizeTitle(_0x5f4f0f);if(_0x19f894===_0x323850)return 0x1;const _0x3c43cf=_0x19f894['split'](/\s+/)['filter'](_0x1c0bec=>_0x1c0bec["length"]>0x0),_0x1e0c83=_0x323850["split"](/\s+/)["filter"](_0x419b2e=>_0x419b2e["length"]>0x0);if(_0x3c43cf['length']===0x0||_0x1e0c83['length']===0x0)return 0x0;const _0x572156=new Set(_0x3c43cf),_0x4cee15=new Set(_0x1e0c83),_0x31e7cf=_0x3c43cf["filter"](_0xdf7475=>_0x4cee15['has'](_0xdf7475)),_0x79f074=new Set([..._0x3c43cf,..._0x1e0c83]);return _0x31e7cf["length"]/_0x79f074["size"];}/*string-table removed*/function findBestMatch(_0x59dc1f,_0x1fc4dd){const _0x3a7f51=_0x5096f5;if(!_0x1fc4dd||_0x1fc4dd['length']===0x0)return null;let _0xc01b04=null,_0x677343=0x0;for(const _0x25db1d of _0x1fc4dd){let _0x508b5a=calculateTitleSimilarity(_0x59dc1f['title'],_0x25db1d["name"]);if(_0x59dc1f["year"]&&_0x25db1d['release_date']){const _0x42406b=parseInt(_0x25db1d["release_date"]["split"]('-')[0x0]);if(_0x59dc1f["year"]===_0x42406b)_0x508b5a+=0.2;}_0x508b5a>_0x677343&&_0x508b5a>0.4&&(_0x677343=_0x508b5a,_0xc01b04=_0x25db1d);}return _0xc01b04;}/*decoder removed*/function getStreams(_0xe0c8bd,_0xb5223a="movie",_0x674976=null,_0xc1b764=null){return __async(this,null,function*(){const _0x17a8bb=_0x2a84;console["log"]("[MovieBlast] Fetching streams for TMDB ID: "+_0xe0c8bd+", Type: "+_0xb5223a);try{const _0x221f1d=yield getTMDBDetails(_0xe0c8bd,_0xb5223a);console["log"]("[MovieBlast] Searching for: \""+_0x221f1d["title"]+"\" ("+_0x221f1d["year"]+')');const _0x2a3c18=encodeURIComponent(_0x221f1d["title"]),_0xacc299=BASE_URL+"/api/search/"+_0x2a3c18+'/'+TOKEN,_0x12ae95=yield __nvFetch(_0xacc299,{'headers':SEARCH_HEADERS});if(!_0x12ae95['ok'])return console['error']("[MovieBlast] Search failed with status: "+_0x12ae95["status"]),[];const _0x1c34fb=yield _0x12ae95["json"](),_0x52d56d=_0x1c34fb["search"]||[],_0x31ba54=findBestMatch(_0x221f1d,_0x52d56d);if(!_0x31ba54)return console["log"]("[MovieBlast] No confident matches found in MovieBlast."),[];const _0x46aff4=_0x31ba54['id'],_0x258a41=_0x31ba54["type"]["toLowerCase"]()["includes"]('serie')||_0xb5223a==='tv';console['log']("[MovieBlast] Match Found: \""+_0x31ba54["name"]+"\" (ID: "+_0x46aff4+')');const _0x3110f7=_0x258a41?'series/show':'media/detail',_0x1daa73=BASE_URL+'/api/'+_0x3110f7+'/'+_0x46aff4+'/'+TOKEN,_0xe0ae2e=yield __nvFetch(_0x1daa73,{'headers':HEADERS});if(!_0xe0ae2e['ok'])return console["error"]('[MovieBlast]\x20Detail\x20fetch\x20failed:\x20'+_0xe0ae2e["status"]),[];const _0x12af3f=yield _0xe0ae2e['json']();let _0x3b8ffb=[];if(_0x258a41){const _0x75890d=_0x12af3f["seasons"]||[],_0x4d1f9e=_0x75890d['find'](_0x34150d=>_0x34150d['season_number']==_0x674976);if(_0x4d1f9e){const _0x1a67f7=(_0x4d1f9e["episodes"]||[])["find"](_0x3f7514=>_0x3f7514["episode_number"]==_0xc1b764);_0x1a67f7?_0x3b8ffb=_0x1a67f7["videos"]||[]:console['log']("[MovieBlast] Episode "+_0xc1b764+" not found in Season "+_0x674976+'.');}else console['log']("[MovieBlast] Season "+_0x674976+" not found.");}else _0x3b8ffb=_0x12af3f["videos"]||[];if(_0x3b8ffb['length']===0x0)return console["log"]("[MovieBlast] No video links found in details."),[];const _0x4aa62b=_0x3b8ffb["map"](_0x553e51=>{const _0x2c50e4=_0x17a8bb,_0x3884ed=_0x553e51["link"];if(!_0x3884ed)return null;const _0x4ae398=_0x3884ed["startsWith"]("http")?_0x3884ed:"https://"+_0x3884ed,_0x57c144=generateSignedUrl(_0x4ae398);return{'name':"MovieBlast",'title':"MovieBlast - "+_0x553e51["server"]+'\x20('+(_0x553e51["lang"]||'EN')+')','url':_0x57c144,'quality':matchQuality(_0x553e51["server"]),'headers':{'User-Agent':'MovieBlast','Referer':"MovieBlast",'x-request-x':'com.movieblast'},'provider':'movieblast'};})['filter'](_0x29d247=>_0x29d247!==null);return console['log']("[MovieBlast] Successfully found "+_0x4aa62b["length"]+" streams."),_0x4aa62b;}catch(_0x2f009b){return console["error"]("[MovieBlast] Error: "+_0x2f009b["message"]),[];}});}module['exports']={'getStreams':getStreams};

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
  var PROVIDER = "movieblast";
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
