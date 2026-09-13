/*
 * nv-plugins animeworld.js — FULLY DECODED port of the All-in-One-Nuvio provider (4.24.0 merge pass).
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
var _0x3571=function(){return "";};var _0x388760=_0x3571;/*rotation removed*/;var TMDB_KEY='d80ba92bc7cefe3359668d30d06f3305',BASE='https://watchanimeworld.top',PLAYER='https://play.zephyrix.top',UA="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";function getInvertedSortTag(_0x4c3f75,_0xfb7bb3){var _0x290f4f={_0x394ae0:0x1e3,_0x178b3e:0x1d1},_0x332005=_0x388760;if(!_0xfb7bb3)_0xfb7bb3=0xf423f;var _0x23a5d2=Math["max"](0x0,parseInt(_0x4c3f75,0xa)||0x0),_0x5c9928=Math['max'](0x0,_0xfb7bb3-_0x23a5d2),_0x40953a=_0x5c9928['toString'](0x2);while(_0x40953a['length']<0x14){_0x40953a='0'+_0x40953a;}return _0x40953a["split"]('')["map"](function(_0xefa4ba){return _0xefa4ba==='1'?'\ufeff':'​';})["join"]('');}/*decoder removed*/function qualityRank(_0x56397c){var _0x122cb9={_0x5ab1bc:0x1e8},_0xa97dd7=_0x388760;if(/2160p|4k/i["test"](_0x56397c))return 0x4;if(/1080p/i["test"](_0x56397c))return 0x3;if(/720p/i["test"](_0x56397c))return 0x2;if(/480p/i['test'](_0x56397c))return 0x1;return 0x0;}function httpGet(_0x631031,_0x2c3d03){var _0x10d49e={_0x234804:0x1c0},_0x1fdc12=_0x388760;return __nvFetch(_0x631031,{'headers':Object["assign"]({'User-Agent':UA},_0x2c3d03||{})})['then'](function(_0x35fa86){var _0x4306a6=_0x1fdc12;if(!_0x35fa86['ok'])throw new Error("HTTP "+_0x35fa86["status"]);return _0x35fa86['text']();});}function httpPost(_0x561273,_0x25b05b,_0x23cf0a){var _0x2248c9={_0x23b087:0x1e0},_0x1f5ed3={_0x1cbff5:0x1f1},_0x11f50c=_0x388760;return __nvFetch(_0x561273,{'method':"POST",'headers':Object["assign"]({'User-Agent':UA,'Content-Type':'application/x-www-form-urlencoded'},_0x23cf0a||{}),'body':_0x25b05b})['then'](function(_0x19d609){var _0xe21291=_0x11f50c;if(!_0x19d609['ok'])throw new Error('HTTP\x20'+_0x19d609["status"]);return _0x19d609["json"]();});}function searchSite(_0x351314,_0x4be9e8){var _0x31dfb5={_0x239f28:0x1bf},_0x473b77={_0x3101ee:0x1e6,_0x124cd2:0x1c2},_0x2b3cd0=BASE+'/?s='+encodeURIComponent(_0x351314);return httpGet(_0x2b3cd0,{'Referer':BASE+'/'})['then'](function(_0x9e0c7d){var _0x82d447=_0x3571,_0x2adf89=[],_0x14b4c4=/href="(https:\/\/watchanimeworld\.top\/(series|movies)\/([^\/\"]+)\/)"/g,_0x1e5b68;while((_0x1e5b68=_0x14b4c4['exec'](_0x9e0c7d))!==null){var _0x53679f=_0x1e5b68[0x1],_0x160d23=_0x1e5b68[0x2],_0x1c1991=_0x1e5b68[0x3];_0x1c1991&&_0x1c1991!=='page'&&_0x2adf89["push"]({'url':_0x53679f,'type':_0x160d23,'slug':_0x1c1991});}return _0x2adf89["filter"](function(_0xfcc283){var _0xee17a5=_0x82d447;return _0x4be9e8==="movie"?_0xfcc283['type']==="movies":_0xfcc283["type"]==="series";});});}/*string-table removed*/function getEpisodeUrl(_0x590dbe,_0x28538a,_0x29cb65){var _0x156730={_0x63ff1e:0x1ee,_0x437d06:0x1ee},_0x2818c4={_0x5d7f1e:0x1d9};return httpGet(_0x590dbe,{'Referer':BASE+'/'})['then'](function(_0x51a2a4){var _0x2e9d21=_0x3571,_0x2673f1=_0x51a2a4["match"](/postid-(\d+)/)||_0x51a2a4["match"](/data-post="(\d+)"/);if(!_0x2673f1)return null;var _0x886d37=BASE+"/wp-admin/admin-ajax.php?action=action_select_season&season="+_0x28538a+'&post='+_0x2673f1[0x1];return httpGet(_0x886d37,{'Referer':_0x590dbe})['then'](function(_0x3b2056){var _0x40e1af=_0x2e9d21,_0x57f381=_0x28538a+'x'+_0x29cb65+'/',_0xf2abe5=/href="(https:\/\/watchanimeworld\.top\/episode\/([^"]+))"/g,_0x52d1b3;while((_0x52d1b3=_0xf2abe5["exec"](_0x3b2056))!==null){if(_0x52d1b3[0x1]["indexOf"](_0x57f381)!==-0x1)return _0x52d1b3[0x1];}return null;});});}function getStreamFromPage(_0x10e27e){var _0x1ad9bd={_0x4f20de:0x1ef,_0x85a47a:0x1ea},_0x328b10={_0xe563da:0x1d8,_0x1c02a0:0x1df},_0x214d20=_0x388760;return httpGet(_0x10e27e,{'Referer':BASE+'/'})["then"](function(_0x166a21){var _0x5e15fe=_0x214d20,_0x100606=_0x166a21['match'](/(?:src|data-src)="(https:\/\/play\.zephyrix\.top\/video\/([a-f0-9]+))"/);if(!_0x100606)return null;var _0xb075b=_0x100606[0x2];return httpPost(PLAYER+'/player/index.php?data='+_0xb075b+"&do=getVideo",'hash='+_0xb075b+"&r="+encodeURIComponent(BASE+'/'),{'Referer':BASE+'/','Origin':PLAYER,'X-Requested-With':"XMLHttpRequest"})['then'](function(_0x1fe1bd){var _0x37ac33=_0x5e15fe,_0x541b95=_0x1fe1bd['videoSource']||_0x1fe1bd["securedLink"];if(!_0x541b95)return null;var _0x2971a0=_0x541b95['match'](/\/cdn\/hls\/([a-f0-9]+)\//),_0x490804=_0x2971a0?_0x2971a0[0x1]:_0xb075b,_0x1427cb=PLAYER+"/cdn/down/"+_0x490804+'/Subtitle/subtitle_eng.srt';return{'url':_0x541b95,'subtitle':_0x1427cb};});});}function getStreams(_0xb4ba8e,_0x431eca,_0x32ec6c,_0x3510d2){var _0x25bd51={_0x519fb2:0x1c7,_0x573d75:0x1e6,_0x4c0259:0x1cc},_0x44a76d={_0x267443:0x1ec,_0x10e2e7:0x1e5,_0x196cb8:0x1cf,_0x3854a8:0x1d1,_0x3b1df3:0x1d4},_0x3611cd={_0x239625:0x1f0},_0x276747={_0x2da500:0x1f2,_0x55f572:0x1de,_0xe2953a:0x1cd};return new Promise(function(_0x2674af){var _0x36ece6={_0x1f50a9:0x1f1},_0x4a233c=_0x3571,_0xf2f0eb="https://api.themoviedb.org/3/"+(_0x431eca==="movie"?"movie":'tv')+'/'+_0xb4ba8e+'?api_key='+TMDB_KEY,_0x2de7a6={'title':'Unknown','year':null,'episodeTitle':''};__nvFetch(_0xf2f0eb)["then"](function(_0x5ec918){return _0x5ec918['json']();})["then"](function(_0x5b0372){var _0x5cd158={_0x46d3ce:0x1eb,_0x186606:0x1cf},_0xab877=_0x4a233c,_0xe69161=_0x5b0372['title']||_0x5b0372["name"];if(!_0xe69161)throw new Error('No\x20title');var _0x110a61=_0x5b0372['release_date']||_0x5b0372["first_air_date"]||'',_0x9ccb29=_0x110a61?parseInt(_0x110a61["split"]('-')[0x0]):null;_0x2de7a6['title']=_0xe69161,_0x2de7a6['year']=_0x9ccb29;if(_0x431eca==='tv'&&_0x32ec6c){var _0x1e01ed="https://api.themoviedb.org/3/tv/"+_0xb4ba8e+'/season/'+_0x32ec6c+'?api_key='+TMDB_KEY;return __nvFetch(_0x1e01ed)['then'](function(_0x19bd77){var _0x259f49=_0xab877;return _0x19bd77["json"]();})['then'](function(_0x4da677){var _0x8fd48e=_0xab877;if(_0x4da677&&_0x4da677["episodes"]){var _0x5b5531=parseInt(_0x3510d2)||0x1;for(var _0x1b32c6=0x0;_0x1b32c6<_0x4da677['episodes']["length"];_0x1b32c6++){if(_0x4da677["episodes"][_0x1b32c6]["episode_number"]===_0x5b5531){_0x2de7a6["episodeTitle"]=_0x4da677["episodes"][_0x1b32c6]['name']||'';break;}}}return searchSite(_0xe69161,_0x431eca);})["catch"](function(){return searchSite(_0xe69161,_0x431eca);});}return searchSite(_0xe69161,_0x431eca);})['then'](function(_0x26bc10){var _0x9ef501=_0x4a233c;if(!_0x26bc10||_0x26bc10['length']===0x0)return _0x2674af([]),null;var _0x5d6ef1=_0x26bc10[0x0]["url"];if(_0x431eca==='movie')return getStreamFromPage(_0x5d6ef1);return getEpisodeUrl(_0x5d6ef1,_0x32ec6c,_0x3510d2)['then'](function(_0x31cd07){return _0x31cd07?getStreamFromPage(_0x31cd07):null;});})['then'](function(_0xc0dfdd){var _0x2fe9ce=_0x4a233c;if(!_0xc0dfdd){_0x2674af([]);return;}var _0x1e9c74='1080p',_0xd3fac2=qualityRank(_0x1e9c74),_0xfc82e9=getInvertedSortTag(_0xd3fac2*0x186a0,0xf423f),_0x22a89e=_0xfc82e9+'AnimeWorld\x20•\x20'+_0x1e9c74+" • Multi-Audio",_0x1cdbcb="🗡️ "+_0x2de7a6['title']+(_0x2de7a6["year"]?'\x20('+_0x2de7a6['year']+')':''),_0x3bc986=null;_0x431eca==='tv'&&_0x32ec6c&&_0x3510d2&&(_0x3bc986="📋 S"+_0x32ec6c+'\x20E'+_0x3510d2+(_0x2de7a6["episodeTitle"]?" - "+_0x2de7a6["episodeTitle"]:''));var _0x430bb='🔥\x201080p\x20|\x20🗣️\x20Multi-Audio\x20|\x20🎧\x20AAC',_0x5f72fa='🎞️\x20M3U8\x20|\x20⚡\x20H.264\x20|\x20🎥\x20HLS',_0x17c69b='🔗\x20AnimeWorld\x20|\x20🌐\x20Zephyrix\x20CDN',_0x213220=[_0x1cdbcb,_0x3bc986,_0x430bb,_0x5f72fa,_0x17c69b]['filter'](Boolean)["join"]('\x0a');_0x2674af([{'name':_0x22a89e,'title':_0x213220,'size':_0x213220,'description':_0x213220,'url':_0xc0dfdd['url'],'headers':{'Referer':PLAYER+'/','Origin':PLAYER,'User-Agent':UA,'Connection':"keep-alive"},'subtitles':_0xc0dfdd['subtitle']?[{'url':_0xc0dfdd['subtitle'],'lang':'en','name':"English"}]:[]}]);})['catch'](function(){_0x2674af([]);});});}module['exports']={'getStreams':getStreams};

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
  var PROVIDER = "animeworld";
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
