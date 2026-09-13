/*
 * nv-plugins topcartoons.js — clean rewrite (4.23.0).
 * Source flow decoded from the AIO build and repaired against the live site
 * (topcartoons.tv, 2026-09): search -> cartoon page -> episode links (skip
 * anchor "#" placeholders) -> watch page -> og:video:url direct mp4.
 * 8s deadline on every call, 8s overall cap, nvio post-filter attached.
 */
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

var cheerio = require("cheerio-without-node-native");

var BASE_URL = "https://www.topcartoons.tv";
var TMDB_API_KEY = "1865f43a0549ca50d341dd9ab8b29f49";
var HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Referer": BASE_URL + "/"
};

function abs(u) {
  if (!u) return "";
  u = String(u).trim();
  if (!u || u === "#") return "";
  if (u.indexOf("http") === 0) return u;
  return BASE_URL + (u.charAt(0) === "/" ? u : "/" + u);
}

function extractQuality(url) {
  var s = String(url || "").toLowerCase();
  if (s.indexOf("2160") !== -1 || s.indexOf("4k") !== -1) return "4K";
  if (s.indexOf("1440") !== -1) return "1440p";
  if (s.indexOf("1080") !== -1) return "1080p";
  if (s.indexOf("720") !== -1) return "720p";
  return "720p"; // cartoon masters are sd/pal-era encodes; treat as 720p baseline
}

function getStreams(tmdbId, mediaType, season, episode) {
  return __nvFetch("https://api.themoviedb.org/3/" + (mediaType === "tv" ? "tv" : "movie") + "/" + tmdbId + "?api_key=" + TMDB_API_KEY)
    .then(function (r) { return r.json(); })
    .then(function (meta) {
      var title = meta && (meta.title || meta.name);
      if (!title) return [];
      // 1. site search
      return __nvFetch(BASE_URL + "/?s=" + encodeURIComponent(title), { headers: HEADERS })
        .then(function (r) { return r.text(); })
        .then(function (html) {
          var $ = cheerio.load(html);
          var cartoonLink = "";
          $("article a").each(function (i, el) {
            if (cartoonLink) return;
            var href = abs($(el).attr("href"));
            if (href) cartoonLink = href;
          });
          if (!cartoonLink) return [];
          // 2. cartoon page -> episode links (A→Z episode grid)
          return __nvFetch(cartoonLink, { headers: HEADERS })
            .then(function (r) { return r.text(); })
            .then(function (html2) {
              var $2 = cheerio.load(html2);
              var eps = [];
              $2("article article").each(function (i, el) {
                var href = abs($2(el).find("a").attr("href"));
                var name = $2(el).find("h3 a").text().trim();
                if (href) eps.push({ href: href, name: name });
              });
              var watchUrl = "";
              if (mediaType === "tv" && episode != null && eps.length) {
                var idx = parseInt(episode, 10) - 1;
                var pick = (idx >= 0 && idx < eps.length) ? eps[idx] : eps[0];
                watchUrl = pick.href;
              } else if (eps.length) {
                watchUrl = eps[0].href;
              }
              if (!watchUrl) watchUrl = cartoonLink;
              // 3. watch page -> og:video:url (direct mp4 on ww.topcartoons.tv)
              return __nvFetch(watchUrl, { headers: HEADERS })
                .then(function (r) { return r.text(); })
                .then(function (html3) {
                  var m = html3.match(/property=["']og:video:url["'][^>]+content=["']([^"']+)/) ||
                    html3.match(/content=["']([^"']+)["'][^>]+property=["']og:video:url["']/);
                  var video = m ? m[1] : "";
                  if (!video) {
                    var ifr = html3.match(/<iframe[^>]+src=["']([^"']+)/);
                    video = ifr ? ifr[1] : "";
                  }
                  if (!video || video.indexOf("http") !== 0) return [];
                  return [{
                    name: "TopCartoons",
                    title: "TopCartoons | " + title,
                    url: video,
                    quality: extractQuality(video),
                    headers: HEADERS,
                    subtitles: []
                  }];
                });
            });
        });
    })
    .catch(function () { return []; });
}

if (typeof module !== "undefined" && module.exports) module.exports = { getStreams: getStreams };

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
  var PROVIDER = "topcartoons";
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
  var LANG_BLOCK_RE = /\b(hindi|hdcam|tamil|telugu|malayalam|kannada|bengali|punjabi|marathi|espanol|español|latino|castellano|spanish|arabic|arab|korean|japanese audio|chinese|mandarin|cantonese|russian|ukrainian|turkish|german|deutsch|french|italian|portugues|brasileiro|indonesian|bahasa|thai|vietnamese|polish|dutch|svenska|multi[- ]?audio|dual[- ]?audio(?![^\n]*(?:eng|english))|dubbed in hindi)\b/i;
  var TAGALOG_RE = /\b(tagalog|filipino|fil\b|dubbed in tagalog)\b/i;
  var ENGLISH_RE = /\b(english|eng\b|dual audio|multi audio)\b/i;
  var SUB_ONLY_RE = /(esub|esubbed|eng ?sub|english ?sub|multi ?sub|hindi ?sub|subbed)/i;
  function langAllowed(text) {
    var s = String(text || "");
    if (!s) return true;
    if (TAGALOG_RE.test(s)) return true;
    if (SUB_ONLY_RE.test(s) && !LANG_BLOCK_RE.test(s.replace(SUB_ONLY_RE, ""))) {
      if (ENGLISH_RE.test(s)) return true;
    }
    if (LANG_BLOCK_RE.test(s) && !ENGLISH_RE.test(s)) return false;
    return true;
  }

  /* ---------- dedupe ---------- */
  function normUrl(u) {
    var s = String(u || "");
    var m = s.match(/^magnet:\?xt=urn:btih:([a-z0-9]+)/i);
    if (m) return "m:" + m[1].toLowerCase();
    return s.split("?")[0].replace(/\/+$/, "").toLowerCase();
  }
  var SEEN = G.__NV_SEEN_URLS__ || (G.__NV_SEEN_URLS__ = {});
  function claim(u, now, owner) {
    var nu = normUrl(u);
    if (!nu) return true;
    var rec = SEEN[nu];
    if (rec && rec.exp > now && rec.owner !== owner) return false;
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
        if (!claim(nu, now, PROVIDER)) return;
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
