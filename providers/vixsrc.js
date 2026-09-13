/**
 * nv-plugins vixsrc.js — v3.0.0 FULL DECODE rebuild (2026-09-13).
 *
 * The 4.24.0 file was a broken decode: the string-array decoder was stubbed to
 * return "" (so every decoder-derived string resolved empty) and ~460KB of the
 * original obfuscated code was swallowed into a comment block - dead weight the
 * runtime still parsed on every tap. This cycle the ORIGINAL obfuscated AIO
 * provider was decoded properly (both string scopes executed, every literal
 * resolved) and rebuilt as this compact clean port. Logic is a 1:1 port of the
 * decoded flow, live-verified endpoint shapes:
 *   * base: https://komiknostalgia.id (AIO's current vixsrc wrapper domain)
 *   * movie: {base}/api/movie/{tmdbId}   tv: {base}/api/tv/{tmdbId}/{s}/{e}
 *   * payload.src -> embed URL -> embed HTML carries
 *     token:'..' / expires:'..' / url:'..../playlist/{n}....'
 *   * playlist = url(+.m3u8)?token=..&expires=..&h=1&lang=it  (vixsrc is the
 *     Italian site - audio may be Italian; kept for AIO parity)
 *   * quality probed from the master playlist text (RESOLUTION=..x..)
 * 8s hard deadline on every network call, node-core requires fail soft,
 * QuickJS-safe shims, nvio post-filter v1.0 appended (en/tl audio gate,
 * >=720p, cross-provider dedupe). Opt out with SCRAPER_SETTINGS.postFilter=false.
 */

/* 8 s hard deadline on every fetch */
var __nvFetch = (function () {
  var _fetch = null;
  try { _fetch = typeof fetch === "function" ? fetch : null; } catch (e) { _fetch = null; }
  if (!_fetch) return function () { return Promise.reject(new Error("no fetch")); };
  var hasTimers = typeof setTimeout === "function";
  return function (input, init) {
    var p;
    try { p = _fetch.apply(this, arguments); } catch (e) { return Promise.reject(e); }
    if (!hasTimers || !p || typeof p.then !== "function") return p;
    return Promise.race([
      p,
      new Promise(function (_resolve, reject) {
        var t = setTimeout(function () { reject(new Error("nv deadline 8s")); }, 8000);
        if (t && typeof t.unref === "function") t.unref();
      })
    ]);
  };
})();

var PROVIDER_NAME = "VixSrc";
var TMDB_API_KEY = "68e094699525b18a70bab2f86b1fa706";
var USER_AGENT = "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36";
var TIMEOUT = 8000;

function getVixSrcBaseUrl() { return "https://komiknostalgia.id"; }

function getCommonHeaders() {
  return {
    "User-Agent": USER_AGENT,
    Referer: getVixSrcBaseUrl() + "/",
    Accept: "application/json, text/plain, */*",
    "Accept-Language": "en-US,en;q=0.9"
  };
}
function getEmbedHeaders() {
  return {
    "User-Agent": USER_AGENT,
    Referer: getVixSrcBaseUrl() + "/",
    Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9"
  };
}
function getPlaylistHeaders(embedUrl) {
  return {
    "User-Agent": USER_AGENT,
    Referer: embedUrl,
    Origin: getVixSrcBaseUrl(),
    Accept: "*/*",
    "Accept-Language": "en-US,en;q=0.9",
    "Sec-Fetch-Dest": "empty",
    "Sec-Fetch-Mode": "cors",
    "Sec-Fetch-Site": "same-origin"
  };
}

function fetchText(url, headers, timeoutMs) {
  return fetch(__nvFetch === null ? url : url, { headers: headers || {} }).then(function (r) { return r.ok ? r.text() : null; }).catch(function () { return null; });
}

/* Decoded AIO regexes: token/expires/url out of the embed page */
function extractMasterPlaylistFromEmbedHtml(html) {
  if (!html) return null;
  var tok = html.match(/'token'\s*:\s*'([^']+)'/i);
  var exp = html.match(/'expires'\s*:\s*'([^']+)'/i);
  var url = html.match(/url\s*:\s*'([^']+\/playlist\/\d+[^']*)'/i);
  if (!tok || !exp || !url) return null;
  return { token: tok[1], expires: exp[1], url: url[1] };
}

function checkQualityFromText(text) {
  if (!text || text.indexOf("#EXTM3U") === -1) return "";
  var best = 0, re = /RESOLUTION=(\d+)x(\d+)/gi, m;
  while ((m = re.exec(text)) !== null) {
    var h = parseInt(m[2], 10);
    if (h > best) best = h;
  }
  if (best >= 2100) return "4K";
  if (best >= 1440) return "1440p";
  if (best >= 1080) return "1080p";
  if (best >= 720) return "720p";
  if (best >= 480) return "480p";
  if (best > 0) return "360p";
  return "";
}

function getQualityFromName(name) {
  var q = String(name || "");
  var m = q.match(/(\d{3,4})[pP]?/);
  if (!m) return "1080p";
  var n = parseInt(m[1], 10);
  if (n >= 2160) return "4K";
  if (n >= 1440) return "1440p";
  if (n >= 1080) return "1080p";
  if (n >= 720) return "720p";
  if (n >= 480) return "480p";
  if (n >= 360) return "360p";
  return "240p";
}

function getTmdbId(imdbId, mediaType) {
  var kind = String(mediaType).toLowerCase() === "tv" ? "tv" : "movie";
  var url = "https://api.themoviedb.org/3/find/" + encodeURIComponent(imdbId) +
    "?api_key=" + TMDB_API_KEY + "&external_source=imdb_id";
  return __nvFetch(url, { headers: { Accept: "application/json" } })
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (j) {
      if (!j) return null;
      if (kind === "movie" && j.movie_results && j.movie_results.length) return String(j.movie_results[0].id);
      if (kind === "tv" && j.tv_results && j.tv_results.length) return String(j.tv_results[0].id);
      return null;
    })
    .catch(function () { return null; });
}

function getMetadata(tmdbId, mediaType) {
  var kind = String(mediaType).toLowerCase() === "tv" ? "tv" : "movie";
  var url = "https://api.themoviedb.org/3/" + kind + "/" + encodeURIComponent(tmdbId) +
    "?api_key=" + TMDB_API_KEY + "&language=en-US";
  return __nvFetch(url, { headers: { Accept: "application/json" } })
    .then(function (r) { return r.ok ? r.json() : null; })
    .catch(function () { return null; });
}

function formatStream(core, quality) {
  var name = "🎦 VixSrc | " + quality;
  return {
    name: name,
    title: name,
    url: core.url,
    quality: quality,
    headers: core.headers,
    behaviorHints: { notWebReady: false, proxyHeaders: { request: core.headers } },
    provider: "vixsrc"
  };
}

function getStreams(id, type, season, episode) {
  var mediaType = String(type || "").toLowerCase() === "tv" ? "tv" : "movie";
  var tmdbId = String(id == null ? "" : id).trim();
  var se = parseInt(season, 10) || 1;
  var ep = parseInt(episode, 10) || 1;

  var prep = Promise.resolve(tmdbId);
  if (tmdbId.indexOf("tmdb:") === 0) {
    prep = Promise.resolve(tmdbId.slice(5));
  } else if (tmdbId.indexOf("tt") === 0) {
    prep = getTmdbId(tmdbId, mediaType).then(function (r) { return r || tmdbId; });
  }

  return prep.then(function (tid) {
    var base = getVixSrcBaseUrl();
    var apiUrl = mediaType === "tv"
      ? base + "/api/tv/" + encodeURIComponent(tid) + "/" + se + "/" + ep
      : base + "/api/movie/" + encodeURIComponent(tid);

    console.log("[VixSrc] API: " + apiUrl);
    var metaP = getMetadata(tid, mediaType);
    var apiP = __nvFetch(apiUrl, { headers: getCommonHeaders() })
      .then(function (r) { return r.ok ? r.json() : null; })
      .catch(function () { return null; });

    return Promise.all([apiP, metaP]).then(function (res) {
      var payload = res[0], meta = res[1];
      var srcPath = payload && typeof payload === "object" ? payload.src : null;
      if (!srcPath) { console.log("[VixSrc] no embed src in api payload"); return []; }
      var embedUrl = srcPath;
      if (embedUrl.indexOf("http") !== 0) {
        try { embedUrl = new URL(embedUrl, base).toString(); } catch (e) { embedUrl = base + embedUrl; }
      }
      return __nvFetch(embedUrl, { headers: getEmbedHeaders() })
        .then(function (r) { return r.ok ? r.text() : null; })
        .then(function (html) {
          var mp = extractMasterPlaylistFromEmbedHtml(html);
          if (!mp) { console.log("[VixSrc] no master playlist in embed"); return []; }
          var parts = mp.url.split("?");
          var u = parts[0].slice(-5) === ".m3u8" ? parts[0] : parts[0] + ".m3u8";
          var playlist = u + (parts[1] ? "?" + parts[1] + "&" : "?") +
            "token=" + encodeURIComponent(mp.token) +
            "&expires=" + encodeURIComponent(mp.expires) +
            "&h=1&lang=it";
          var H = getPlaylistHeaders(embedUrl);
          var title = (meta && (meta.title || meta.name)) || "VixSrc";
          return __nvFetch(playlist, { headers: H })
            .then(function (r) { return r.ok ? r.text() : ""; })
            .then(function (text) {
              var q = checkQualityFromText(text) || "1080p";
              var quality = getQualityFromName(q);
              console.log("[VixSrc] " + title + " -> " + quality);
              return [formatStream({ url: playlist, headers: H }, quality)];
            }).catch(function () {
              // master exists but the probe failed - still serve the row
              var H2 = getPlaylistHeaders(embedUrl);
              return [formatStream({ url: playlist, headers: H2 }, "1080p")];
            });
        });
    }).catch(function (e) {
      console.log("[VixSrc] error: " + (e && e.message ? e.message : e));
      return [];
    });
  });
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { getStreams: getStreams };
} else {
  global.getStreams = getStreams;
}

/* ===========================================================================
 * nvio post-filter v1.0
 * ======================================================================== */

(function () {
  var PROVIDER = "vixsrc";
  var G = typeof globalThis !== "undefined" ? globalThis : typeof global !== "undefined" ? global : this;

  function settings() {
    try { return (G && G.SCRAPER_SETTINGS) || {}; } catch (e) { return {}; }
  }
  function hasTimers() { return typeof setTimeout === "function" && typeof clearTimeout === "function"; }

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

  var qualCache = (G.__NV_QUAL_CACHE__ ||= {});

  function probeM3u8(url, headers) {
    var now = Date.now();
    var cached = qualCache[url];
    if (cached && now - cached.t < (cached.q ? 900000 : 180000)) return Promise.resolve(cached.q);
    var opts = { headers: Object.assign({}, headers || {}) };
    var p = __nvFetch(url, opts)
      .then(function (r) { return r.ok ? r.text() : ""; })
      .then(function (text) {
        var q = "";
        if (text && text.indexOf("#EXTM3U") !== -1) {
          var best = 0, re = /RESOLUTION=(\d+)x(\d+)/gi, m;
          while ((m = re.exec(text)) !== null) {
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
      })
      .catch(function () { qualCache[url] = { t: now, q: "" }; return ""; });
    if (hasTimers()) {
      p = Promise.race([p, new Promise(function (resolve) {
        var timer = setTimeout(function () { resolve(""); }, 2000);
        if (timer && typeof timer.unref === "function") timer.unref();
      })]);
    }
    return p;
  }

  var BLOCK_RE = new RegExp(
    "\\b(hindi|hin|tamil|telugu|malayalam|mallu|kannada|bengali|bangla|punjabi|marathi|bhojpuri|gujarati|odia|assamese|nepali|urdu|sinhala|" +
    "arabic|ara|farsi|persian|turkish|turkce|espanol|spanish|latino|castellano|french|vostfr|german|deutsch|russian|korean|kor|japanese|" +
    "jpn|chinese|mandarin|cantonese|thai|vietnamese|indonesian|bahasa|portuguese|brasileiro|italian|polish|ukrainian|hebrew|hungarian|" +
    "romanian|dutch|flemish|greek|czech|swedish|danish|norwegian|finnish|org)\\b", "i");
  var ALLOW_RE = /\b(english|eng|tagalog|filipino)\b/i;
  var SUB_RE = /\b[a-z0-9]{0,12}subs?\b/gi;

  function langAllowed(titleText) {
    var t = String(titleText || "").replace(SUB_RE, " ");
    if (BLOCK_RE.test(t)) return ALLOW_RE.test(t);
    return true;
  }

  function normUrl(u) {
    var s = String(u || "");
    if (/^magnet:/i.test(s)) {
      var m = s.match(/btih:([a-z0-9]+)/i);
      return "m:" + (m ? m[1].toLowerCase() : s.slice(0, 80));
    }
    return s.replace(/[#?].*$/, "").replace(/\/+$/, "");
  }

  var SEEN = (G.__NV_SEEN_URLS__ ||= {});

  function claim(nu, now, owner) {
    if (!nu) return true;
    var e = SEEN[nu];
    if (e && e.exp > now && e.owner !== owner) return false;
    SEEN[nu] = { exp: now + 120000, owner: owner };
    return true;
  }

  function rank(q) {
    if (q === "4K") return 4;
    if (q === "1440p") return 3.5;
    if (q === "1080p") return 3;
    if (q === "720p") return 2;
    return 0;
  }

  function postProcess(list) {
    var now = Date.now();
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
        var s = row.s;
        var titleQ = normQ(s.quality) || normQ(String(s.title || "").split("\n")[0]) || qFromText((s.name || "") + " " + (s.title || ""));
        // FAIL-OPEN quality gate (AIO parity)
        var q = qs[k] || titleQ || "Auto";
        if (q === "CAM") return;
        s.quality = q;
        ranked.push({ s: s, i: row.i, q: q });
      });
      ranked.sort(function (a, b) {
        var r = rank(b.q) - rank(a.q);
        if (r !== 0) return r;
        return a.i - b.i;
      });
      var seenLocal = {};
      var out = [];
      ranked.forEach(function (row) {
        var s = row.s;
        var nu = normUrl(s.url);
        if (seenLocal[nu]) return;
        if (!claim(nu, now, PROVIDER)) return;
        seenLocal[nu] = 1;
        out.push(s);
      });
      return out.slice(0, 40);
    }).catch(function () {
      return (list || []).slice(0, 40);
    });
  }

  var originalGetStreams = null;
  try { originalGetStreams = module.exports && module.exports.getStreams; } catch (e) { originalGetStreams = null; }

  if (typeof originalGetStreams === "function") {
    module.exports.getStreams = function () {
      var args = Array.prototype.slice.call(arguments);
      var self = this;

      function finish(v) {
        if (settings().postFilter === false) return v;
        try { return postProcess(Array.isArray(v) ? v : []); } catch (e) {
          if (Array.isArray(v)) return v;
          return [];
        }
      }
      try {
        var r = originalGetStreams.apply(self, args);
        if (r && typeof r.then === "function") {
          if (typeof setTimeout === "function") {
            r = Promise.race([
              r,
              new Promise(function (resolve) {
                var dl = setTimeout(function () { resolve([]); }, 8000);
                if (dl && typeof dl.unref === "function") dl.unref();
              })
            ]);
          }
          return r.then(function (v) { return finish(v); }, function () { return []; });
        }
        return finish(r);
      } catch (e) { return Promise.resolve([]); }
    };
  }
})();
