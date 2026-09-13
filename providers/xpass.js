/*
 * nv-plugins xpass.js — FULLY DECODED port of the All-in-One-Nuvio provider (4.24.0 merge pass).
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
var _0xff43=function(){return "";};const _0x1f1144=_0xff43;/*rotation removed*/;/*decoder removed*/var __async=(_0x3a0565,_0x22fa3f,_0x1ffd4e)=>{return new Promise((_0x4bc82d,_0x4be4a1)=>{const _0x1794e4=_0xff43;var _0x47085d=_0x131a02=>{const _0x1b37b3=_0xff43;try{_0x2013fe(_0x1ffd4e["next"](_0x131a02));}catch(_0x51287a){_0x4be4a1(_0x51287a);}},_0x53d322=_0x3a8c51=>{try{_0x2013fe(_0x1ffd4e['throw'](_0x3a8c51));}catch(_0x34921d){_0x4be4a1(_0x34921d);}},_0x2013fe=_0x551158=>_0x551158["done"]?_0x4bc82d(_0x551158["value"]):Promise["resolve"](_0x551158["value"])["then"](_0x47085d,_0x53d322);_0x2013fe((_0x1ffd4e=_0x1ffd4e["apply"](_0x3a0565,_0x22fa3f))["next"]());});},XPASS_API='https://play.xpass.top',BASE_HEADERS={'User-Agent':"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",'Referer':XPASS_API+'/'};/*string-table removed*/function generateM3u8(_0xf23bda,_0x2e383f){return __async(this,arguments,function*(_0x31fabd,_0x2fe368,_0x5f3140={}){const _0x23d0ed=_0xff43;try{console["log"]("[Xpass] Parsing master m3u8: "+_0x2fe368);const _0xc4234c=yield __nvFetch(_0x2fe368,{'headers':_0x5f3140}),_0x10e096=yield _0xc4234c["text"](),_0x9608c3=_0x2fe368["substring"](0x0,_0x2fe368["lastIndexOf"]('/'))+'/',_0x47dbc4=[],_0x216f40=/#EXT-X-STREAM-INF:.*?RESOLUTION=(\d+x\d+).*?\n([^\n]+)/g;let _0x1d3ef4;while((_0x1d3ef4=_0x216f40["exec"](_0x10e096))!==null){const _0x13781a=_0x1d3ef4[0x1]["split"]('x')[0x1]+'p';let _0x142801=_0x1d3ef4[0x2]["trim"]();if(!_0x142801["startsWith"]("http")){if(_0x142801['startsWith']('/')){const _0xd9a343=new URL(_0x2fe368)["origin"];_0x142801=_0xd9a343+_0x142801;}else _0x142801=_0x9608c3+_0x142801;}_0x47dbc4["push"]({'quality':_0x13781a,'url':_0x142801});}if(_0x47dbc4["length"]===0x0)return[{'quality':"Auto",'url':_0x2fe368}];return _0x47dbc4;}catch(_0x52b45f){return console["warn"]('[Xpass]\x20Error\x20parsing\x20M3U8,\x20returning\x20master\x20URL.',_0x52b45f),[{'quality':"Auto",'url':_0x2fe368}];}});}function getStreams(_0x384d54,_0x63fd0b,_0x54ef69,_0x1fa79d){return __async(this,null,function*(){const _0x2dec02=_0xff43;console["log"]("[Xpass] Fetching streams for "+_0x63fd0b+'\x20'+_0x384d54);const _0x52ad55=[];try{const _0x1f8775=_0x63fd0b==='tv'?XPASS_API+"/e/tv/"+_0x384d54+'/'+_0x54ef69+'/'+_0x1fa79d:XPASS_API+"/e/movie/"+_0x384d54;console["log"]("[Xpass] Navigating to Embed: "+_0x1f8775);const _0x3100ac=yield __nvFetch(_0x1f8775,{'headers':BASE_HEADERS}),_0x1a31ff=yield _0x3100ac["text"](),_0x526cb2=_0x1a31ff["match"](new RegExp("var backups\\s*=\\s*(\\[.*?\\])\\s*(?:;|<\\/script>)",'s'));if(!_0x526cb2)return console['log']("[Xpass] No backups variable found in page source."),[];let _0x3a003a=[];try{_0x3a003a=JSON["parse"](_0x526cb2[0x1]);}catch(_0x39c978){return console["error"]("[Xpass] Failed parsing backups JSON:",_0x39c978),[];}console["log"]("[Xpass] Found "+_0x3a003a["length"]+" servers.");for(const _0x6f7ff1 of _0x3a003a){try{const _0x17a701=_0x6f7ff1['name']||"Default";let _0x5b8316=_0x6f7ff1['url'];if(!_0x5b8316)continue;!_0x5b8316["startsWith"]("http")&&(_0x5b8316=XPASS_API+_0x5b8316);console["log"]("[Xpass] Fetching JSON from backup server: "+_0x5b8316);const _0x5cf924=yield __nvFetch(_0x5b8316,{'headers':BASE_HEADERS}),_0xf94553=yield _0x5cf924["json"](),_0x28959a=_0xf94553["playlist"]||[];if(_0x28959a["length"]===0x0)continue;const _0x209abd=_0x28959a[0x0]['sources']||[];for(const _0x344e43 of _0x209abd){const _0x24b944=_0x344e43['file'];if(!_0x24b944||!_0x24b944["startsWith"]("http"))continue;const _0xfede0f=_0x344e43["type"]&&_0x344e43['type']["toLowerCase"]()["includes"]('hls')||_0x24b944["includes"](".m3u8");if(_0xfede0f){const _0x424a9c=yield generateM3u8(_0x17a701,_0x24b944,BASE_HEADERS);_0x424a9c['forEach'](_0x949ef2=>{const _0x2197ca=_0x2dec02;_0x52ad55["push"]({'name':"Xpass ["+_0x17a701+']','title':_0x949ef2["quality"],'url':_0x949ef2["url"],'quality':_0x949ef2["quality"],'type':"m3u8",'headers':{'Referer':XPASS_API+'/','User-Agent':BASE_HEADERS["User-Agent"]},'provider':"xpass"});});}else _0x52ad55["push"]({'name':"Xpass ["+_0x17a701+']','title':"Auto",'url':_0x24b944,'quality':"Auto",'type':_0x24b944["includes"](".mp4")||_0x24b944["includes"](".mkv")?"video":null,'headers':{'Referer':XPASS_API+'/','User-Agent':BASE_HEADERS["User-Agent"]},'provider':'xpass'});}}catch(_0x361131){console["warn"]("[Xpass] Failed querying server "+_0x6f7ff1["name"]+':',_0x361131['message']);}}}catch(_0x4c1a19){console['error']("[Xpass] Unexpected overall error:",_0x4c1a19["message"]);}return console["log"]("[Xpass] Returning "+_0x52ad55["length"]+" parsed streams."),_0x52ad55;});}module["exports"]={'getStreams':getStreams};

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
  var PROVIDER = "xpass";
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
