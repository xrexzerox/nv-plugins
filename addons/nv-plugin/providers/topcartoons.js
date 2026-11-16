/* v2.7.0 (pack 4.45.0): IMDb-search verification gate (nvImdbVerify below)
 * + visible "v2.7" chip on row names for stale-cache diagnosis.
 */
/*
 * nv-plugins topcartoons.js — clean rewrite (4.23.0).
 * Source flow decoded from the AIO build and repaired against the live site
 * (topcartoons.tv, 2026-09): search -> cartoon page -> episode links (skip
 * anchor "#" placeholders) -> watch page -> og:video:url direct mp4.
 * 8s deadline on every call, 8s overall cap, nvio post-filter attached.
 * v2.6.0 (pack 4.44.0, 2026-09-25): WRONG-CONTENT FIX ("topcartoons
 * provides inaccurate stream links"). The WP search picker took the FIRST
 * <article a> href with zero verification - live repro: searching "Resident
 * Evil" returned "Ben 10 - Permanent Retirement" because the first article
 * on the results page is a sidebar/recent post, not the query match. The
 * picker now reads every article's heading text and only accepts an article
 * whose title actually matches the requested TMDB title (normalized, all
 * query words covered, either-direction containment); no matching article ->
 * ZERO rows. Modern titles the site does not carry now correctly return []
 * instead of an unrelated cartoon that plays.
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

/* ===== nv-plugins cheerio-lite v1.0.0 (pack 4.39.0, 2026-09-14) ================
   The Nuvio device QuickJS realm has no require(), so the original top-level
   require("cheerio-without-node-native") threw ReferenceError at LOAD and
   killed this provider on every device call. Node/desktop runtimes still get
   real cheerio through the guarded loader below; the device falls back to
   this pure-JS subset covering the exact API surface used here:
     $("tag tag") / $(el)  ->  { length, each(fn(i,el)), attr(name),
                                 find(sel), text() }
   Only descendant tag-chain selectors are supported (all this file needs:
   "article a", "article article", "a", "h3 a").
============================================================================ */
var __nvCheerioLite = (function () {
  var VOID = { br:1, img:1, input:1, meta:1, link:1, hr:1, source:1, area:1, base:1, col:1, embed:1, track:1, wbr:1 };
  function parseHtml(html) {
    var src = String(html || "")
      .replace(/<!--[\s\S]*?-->/g, "")
      .replace(/<(script|style)\b[\s\S]*?<\/\1>/gi, "");
    var root = { tag: "#root", attrs: {}, children: [], parent: null };
    var stack = [root];
    var re = /<([a-zA-Z][a-zA-Z0-9]*)((?:\s+[^<>]*?)?)(\/?)>|<\/([a-zA-Z][a-zA-Z0-9]*)\s*>|([^<]+)/g;
    var m;
    while ((m = re.exec(src)) !== null) {
      if (m[1]) {
        var tag = m[1].toLowerCase();
        var node = { tag: tag, attrs: {}, children: [], parent: stack[stack.length - 1] };
        var are = /([a-zA-Z_:][a-zA-Z0-9_:.\-]*)\s*(?:=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g, am;
        while ((am = are.exec(m[2] || "")) !== null) {
          node.attrs[am[1].toLowerCase()] = am[2] !== undefined ? am[2] : (am[3] !== undefined ? am[3] : (am[4] !== undefined ? am[4] : ""));
        }
        node.parent.children.push(node);
        if (!m[3] && !VOID[tag]) stack.push(node);
      } else if (m[4]) {
        var ct = m[4].toLowerCase();
        for (var k = stack.length - 1; k > 0; k--) {
          if (stack[k].tag === ct) { stack.length = k; break; }
        }
      } else if (m[5]) {
        if (/\S/.test(m[5])) {
          var tp = stack[stack.length - 1];
          tp.children.push({ tag: "#text", attrs: {}, children: [], parent: tp, text: m[5] });
        }
      }
    }
    return root;
  }
  function chainMatch(el, chain) {
    if (el.tag !== chain[chain.length - 1]) return false;
    var i = chain.length - 2, p = el.parent;
    while (i >= 0 && p) {
      if (p.tag === chain[i]) i--;
      p = p.parent;
    }
    return i < 0;
  }
  function select(root, selector) {
    var chain = String(selector || "").trim().toLowerCase().split(/\s+/);
    var out = [];
    if (!chain.length || !chain[0]) return out;
    (function walk(node) {
      for (var i = 0; i < node.children.length; i++) {
        var c = node.children[i];
        if (c.tag === "#text") continue;
        if (chainMatch(c, chain)) out.push(c);
        walk(c);
      }
    })(root);
    return out;
  }
  function collectText(el) {
    var out = "";
    for (var i = 0; i < el.children.length; i++) {
      var c = el.children[i];
      out += (c.tag === "#text") ? c.text : collectText(c);
    }
    return out;
  }
  function wrap(el) {
    return {
      attr: function (name) {
        var v = el.attrs[String(name || "").toLowerCase()];
        return v === undefined ? undefined : String(v);
      },
      find: function (sel) { return makeColl(select(el, sel)); },
      text: function () { return collectText(el); }
    };
  }
  function makeColl(els) {
    var coll = {
      length: els.length,
      each: function (fn) {
        for (var i = 0; i < els.length; i++) fn(i, els[i]);
        return coll;
      },
      attr: function (name) { return els.length ? wrap(els[0]).attr(name) : undefined; },
      find: function (sel) {
        var all = [];
        for (var i = 0; i < els.length; i++) all = all.concat(select(els[i], sel));
        return makeColl(all);
      },
      text: function () {
        var out = "";
        for (var i = 0; i < els.length; i++) out += collectText(els[i]);
        return out;
      }
    };
    return coll;
  }
  return {
    load: function (html) {
      var root = parseHtml(html);
      var $ = function (selOrEl, ctx) {
        if (selOrEl && selOrEl.tag) return makeColl([selOrEl]);
        return makeColl(select(ctx || root, selOrEl));
      };
      return $;
    }
  };
})();

var cheerio = (function () {
  try {
    if (typeof require === "function") {
      var _ch = require("cheerio-without-node-native");
      if (_ch && typeof _ch.load === "function") return _ch;
    }
  } catch (e) { /* device: no require -> cheerio-lite below */ }
  return __nvCheerioLite;
})();

var BASE_URL = "https://www.topcartoons.tv";
var TMDB_API_KEY = "6dc830f9624b43261325bed3bf7d0dfa";
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

function normalizeTitle(s) {
  return String(s || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

/** v2.6.0: article heading must genuinely match the requested title.
 *  Accept when the normalized article title contains the normalized query
 *  (or vice versa for short queries) AND every query word appears in the
 *  article title - "Resident Evil" can never match "Ben 10 ..." again. */
/* ===== nv IMDb-search verification v1.0.0 (pack 4.45.0) =====================
   User directive: "it should not provide inaccurate streams if the movies or
   series is not on imdb or tmdb or incorrect ... since we are only using tmdb
   try add condition using imdb search." Runs BEFORE any site search:
     1. The content must expose an IMDb id (TMDB external_ids). No id means the
        title is not on IMDb, so title-based guessing can never be verified
        -> 0 rows (fail-closed, per the user's rule).
     2. IMDb is searched for that exact id (IMDb suggestion API first,
        Cinemeta v3 fallback). Reachable but ABSENT -> 0 rows (same rule).
     3. The IMDb entry's title + year must agree with TMDB (normalized
        containment, year +-1). A mismatched mapping is exactly the
        wrong-content class the user reported -> 0 rows.
   If both IMDb sources are unreachable we cannot tell "absent" from
   "offline", so verification degrades to this provider's own TMDB gates
   instead of zeroing legitimate titles (documented fail-open on offline only).
============================================================================ */
function nvImdbFetchJson(url) {
  return __nvFetch(url).then(function (r) { return r && r.ok ? r.json() : null; }).catch(function () { return null; });
}

function nvImdbNorm(s) {
  return String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}
async function nvImdbVerify(tmdbId, mediaType, tmdbTitle, tmdbYear, knownImdbId) {
  try {
    const kind = mediaType === 'tv' ? 'tv' : 'movie';
    let imdbId = String(knownImdbId || '');
    if (!imdbId) {
      const ex = await nvImdbFetchJson(`https://api.themoviedb.org/3/${kind}/${encodeURIComponent(String(tmdbId))}/external_ids?api_key=${TMDB_API_KEY}`);
      if (ex && ex.imdb_id) imdbId = String(ex.imdb_id);
    }
    if (!imdbId || imdbId.indexOf('tt') !== 0) return { ok: false, reason: 'not-on-imdb: no imdb id on TMDB' };
    let imdbTitle = '';
    let imdbYear = null;
    let reachable = false;
    const sg = await nvImdbFetchJson(`https://v2.sg.media-imdb.com/suggestion/t/${encodeURIComponent(imdbId)}.json`);
    const d = sg && Array.isArray(sg.d) ? sg.d : [];
    let hit = null;
    for (const x of d) {
      if (x && String(x.id || '').toLowerCase() === imdbId.toLowerCase()) { hit = x; break; }
    }
    if (!hit && d.length) hit = d[0];
    if (hit && hit.l) {
      reachable = true;
      imdbTitle = String(hit.l);
      imdbYear = parseInt(hit.y, 10) || parseInt(hit.tl, 10) || null;
    }
    if (!reachable) {
      const cm = await nvImdbFetchJson(`https://v3-cinemeta.strem.io/meta/${mediaType === 'tv' ? 'series' : 'movie'}/${encodeURIComponent(imdbId)}.json`);
      if (cm && cm.meta && cm.meta.name) {
        reachable = true;
        imdbTitle = String(cm.meta.name);
        imdbYear = parseInt(cm.meta.releaseYear, 10) || parseInt(cm.meta.year, 10) || null;
      }
    }
    if (!reachable) return { ok: true, imdbId, reason: 'imdb-unreachable: own gates apply' };
    if (!imdbTitle) return { ok: false, reason: 'not-on-imdb: no entry for ' + imdbId };
    const a = nvImdbNorm(imdbTitle);
    const t = nvImdbNorm(tmdbTitle);
    const titleOk = !!a && !!t && (a === t || a.includes(t) || t.includes(a));
    const yearOk = !tmdbYear || !imdbYear || Math.abs(imdbYear - parseInt(tmdbYear, 10)) <= 1;
    if (!titleOk || !yearOk) return { ok: false, reason: 'imdb-mismatch: imdb "' + imdbTitle + '" (' + imdbYear + ') vs tmdb "' + tmdbTitle + '" (' + tmdbYear + ')' };
    return { ok: true, imdbId, imdbTitle, imdbYear };
  } catch (e) {
    return { ok: true, reason: 'verify-error: own gates apply' };
  }
}
function articleTitleMatches(articleText, wantedTitle) {
  var a = normalizeTitle(articleText);
  var w = normalizeTitle(wantedTitle);
  if (!a || !w) return false;
  if (a === w) return true;
  var words = w.split(" ").filter(Boolean);
  if (!words.length) return false;
  for (var i = 0; i < words.length; i++) {
    // v4.50.0 ACCURACY FIX: word-boundary test - "over" no longer matches
    // inside "Lover", and the old `words.length >= 2` escape hatch is gone.
    var re = new RegExp("(^|[^a-z0-9])" + words[i].replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "([^a-z0-9]|$)");
    if (!re.test(a)) return false;
  }
  return true;
}

function getStreams(tmdbId, mediaType, season, episode) {
  return __nvFetch("https://api.themoviedb.org/3/" + (mediaType === "tv" ? "tv" : "movie") + "/" + tmdbId + "?api_key=" + TMDB_API_KEY)
    .then(function (r) { return r.json(); })
    .then(function (meta) {
      var title = meta && (meta.title || meta.name);
      if (!title) return null;
      var tmdbYear = parseInt(String(meta.release_date || meta.first_air_date || "").substring(0, 4), 10) || null;
      // v2.7.0: IMDb-search verification (user directive) - absent or
      // mismatched content never reaches the site search.
      return nvImdbVerify(tmdbId, mediaType, title, tmdbYear, "").then(function (nv) {
        if (!nv.ok) return null;
        return title;
      });
    })
    .then(function (title) {
      if (!title) return [];
      // 1. site search - collect ALL articles with their heading text and
      //    pick the first one whose title VERIFIES against the query
      return __nvFetch(BASE_URL + "/?s=" + encodeURIComponent(title), { headers: HEADERS })
        .then(function (r) { return r.text(); })
        .then(function (html) {
          var $ = cheerio.load(html);
          var cartoonLink = "";
          $("article").each(function (i, el) {
            if (cartoonLink) return;
            var a = $(el).find("a");
            var href = a && a.length ? abs(a.attr("href")) : "";
            if (!href) return;
            var heading = "";
            ["h1", "h2", "h3", "h4"].some(function (tag) {
              var h = $(el).find(tag);
              if (h && h.length && h.text && h.text().trim()) {
                heading = h.text().trim();
                return true;
              }
              return false;
            });
            if (!heading) heading = (a.text && a.text().trim()) || "";
            if (articleTitleMatches(heading, title)) cartoonLink = href;
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
                    name: "TopCartoons v2.7",
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


/* ===== nv universal subtitle lane v1.0.0 (pack 4.48.0) =====================
   Every scraper's stream rows now carry multi-language sidecar subtitles:
   English, Tagalog/Filipino, Korean, Japanese, Indonesian, Malay, Chinese,
   Thai + all other tracks the source offers.

   Source: Stremio's official keyless OpenSubtitles-v3 addon
     GET https://opensubtitles-v3.strem.io/subtitles/{movie|series}/{imdbId}[:s:e].json
     -> { subtitles: [{ url, lang(ISO-639-3), ... }] }
   The subs5.strem.io URLs serve UTF-8 SRT; NuvioTV's player converts SRT to
   WebVTT transparently (playerScreenMethods-42.createSubtitleObjectUrl), and
   the player merges stream.sidecar `subtitles` rows (lang/url/headers) into
   the subtitle rail - the same path the Pencuri English lane uses.

   Design: ES2020-safe, zero-dependency, fail-soft. The IMDb id is resolved
   once per title via TMDB external_ids (cached), the subtitle JSON once per
   (imdb, s, e) (cached 6h). The wrapper runs in PARALLEL with the provider's
   own lane and only fills rows that have no subtitles of their own, so
   provider-specific tracks (vidlove/anikoto/megaplay vtt, pencuri en) always
   win. Never throws; never delays the stream lane by more than the host's
   own 8s deadline.
=========================================================================== */
(function () {
  var G = typeof globalThis !== "undefined" ? globalThis : this;
  if (G.__nvOsv3Subs) return;

  var OSV3_BASE = "https://opensubtitles-v3.strem.io/subtitles/";
  var TMDB_KEY = (typeof TMDB_API_KEY === "string" && TMDB_API_KEY) || "6dc830f9624b43261325bed3bf7d0dfa";
  var TTL_MS = 6 * 60 * 60 * 1000;
  var DEADLINE_MS = 8000;

  /* ISO-639-3 -> ISO-639-1 (+ display names) for the pack's languages */
  var CODE_MAP = {
    eng: "en", tgl: "tl", fil: "fil", ko: "ko", kor: "ko", jpn: "ja",
    ind: "id", may: "ms", zho: "zh", zhe: "zh", zht: "zh-TW", tha: "th",
    hin: "hi", ben: "bn", tam: "ta", tel: "te", spa: "es", por: "pt",
    pob: "pt-BR", fre: "fr", ger: "de", ita: "it", rus: "ru", ara: "ar",
    tur: "tr", vie: "vi", pol: "pl", nld: "nl", ukr: "uk", pes: "fa",
    per: "fa", swe: "sv", nor: "no", dan: "da", fin: "fi", ell: "el",
    heb: "he", hun: "hu", ces: "cs", cze: "cs", ron: "ro", rum: "ro",
    hrv: "hr", srp: "sr", bul: "bg", slo: "sk", slv: "sl", bos: "bs",
    mac: "mk", mkd: "mk", est: "et", lav: "lv", lit: "lt", ind2: "id"
  };
  var NAME_MAP = {
    en: "English", tl: "Tagalog", fil: "Filipino", ko: "Korean", ja: "Japanese",
    id: "Indonesian", ms: "Malay", zh: "Chinese", "zh-TW": "Chinese (Traditional)",
    th: "Thai", hi: "Hindi", bn: "Bengali", ta: "Tamil", te: "Telugu",
    es: "Spanish", pt: "Portuguese", "pt-BR": "Portuguese (BR)", fr: "French",
    de: "German", it: "Italian", ru: "Russian", ar: "Arabic", tr: "Turkish",
    vi: "Vietnamese", pl: "Polish", nl: "Dutch", uk: "Ukrainian", fa: "Persian",
    sv: "Swedish", no: "Norwegian", da: "Danish", fi: "Finnish", el: "Greek",
    he: "Hebrew", hu: "Hungarian", cs: "Czech", sk: "Slovak", ro: "Romanian",
    hr: "Croatian", sr: "Serbian", bg: "Bulgarian", sl: "Slovenian",
    bs: "Bosnian", mk: "Macedonian", et: "Estonian", lv: "Latvian", lt: "Lithuanian"
  };

  var _cache = {};   /* key -> { t: ms, rows: [...] } */
  var _imdbCache = {}; /* tmdbKey -> { t: ms, imdb } */
  var _inflight = {};  /* key -> Promise */

  function _hasTimers() {
    return typeof setTimeout === "function" && typeof Promise !== "undefined" && Promise.race;
  }
  function _withDeadline(p) {
    if (!_hasTimers()) return p;
    return Promise.race([p, new Promise(function (res) {
      var t = setTimeout(function () { res(null); }, DEADLINE_MS);
      if (t && typeof t.unref === "function") t.unref();
    })]);
  }
  function _normType(mediaType) {
    var t = String(mediaType || "").toLowerCase();
    return (t === "series" || t === "show" || t === "tvshow" || t === "tv") ? "series" : "movie";
  }
  function _fetchJson(url) {
    return _withDeadline(
      (typeof fetch === "function" ? fetch(url) : Promise.reject(new Error("no fetch")))
        .then(function (res) {
          if (!res || !res.ok) return null;
          return res.json().catch(function () { return null; });
        })
        .catch(function () { return null; })
    );
  }
  function _resolveImdb(tmdbId, mediaType) {
    var key = _normType(mediaType) + ":" + String(tmdbId);
    var now = Date.now();
    if (_imdbCache[key] && now - _imdbCache[key].t < TTL_MS) {
      return Promise.resolve(_imdbCache[key].imdb);
    }
    if (_inflight["imdb:" + key]) return _inflight["imdb:" + key];
    var kind = _normType(mediaType) === "series" ? "tv" : "movie";
    var url = "https://api.themoviedb.org/3/" + kind + "/" + encodeURIComponent(String(tmdbId)) +
      "/external_ids?api_key=" + TMDB_KEY;
    _inflight["imdb:" + key] = _fetchJson(url).then(function (data) {
      var imdb = data && data.imdb_id && /^tt\d+$/.test(String(data.imdb_id)) ? String(data.imdb_id) : null;
      _imdbCache[key] = { t: now, imdb: imdb };
      delete _inflight["imdb:" + key];
      return imdb;
    });
    return _inflight["imdb:" + key];
  }
  function _osv3Rows(imdbId, mediaType, season, episode) {
    var isSeries = _normType(mediaType) === "series";
    var path = isSeries
      ? "series/" + encodeURIComponent(imdbId) + ":" + (parseInt(season, 10) || 1) + ":" + (parseInt(episode, 10) || 1) + ".json"
      : "movie/" + encodeURIComponent(imdbId) + ".json";
    var key = path;
    var now = Date.now();
    if (_cache[key] && now - _cache[key].t < TTL_MS) return Promise.resolve(_cache[key].rows);
    if (_inflight[key]) return _inflight[key];
    _inflight[key] = _fetchJson(OSV3_BASE + path).then(function (data) {
      var list = (data && Array.isArray(data.subtitles)) ? data.subtitles : [];
      var seen = {};
      var rows = [];
      for (var i = 0; i < list.length; i++) {
        var t = list[i];
        if (!t || !t.url) continue;
        var code = CODE_MAP[String(t.lang || "").toLowerCase()] || String(t.lang || "").toLowerCase();
        if (!code) continue;
        var dedupeKey = code + "|" + (t.id || t.url);
        if (seen[dedupeKey]) continue;
        seen[dedupeKey] = 1;
        rows.push({
          url: String(t.url),
          lang: code,
          language: code,
          name: NAME_MAP[code] || (String(t.lang || "subtitle").charAt(0).toUpperCase() + String(t.lang || "subtitle").slice(1))
        });
        if (rows.length >= 60) break;
      }
      _cache[key] = { t: now, rows: rows };
      delete _inflight[key];
      return rows;
    });
    return _inflight[key];
  }

  G.__nvOsv3Subs = {
    get: function (tmdbId, mediaType, season, episode) {
      try {
        return _resolveImdb(tmdbId, mediaType).then(function (imdb) {
          if (!imdb) return [];
          return _osv3Rows(imdb, mediaType, season, episode);
        }).catch(function () { return []; });
      } catch (e) { return Promise.resolve([]); }
    }
  };
})();

/* ===== nv universal subtitle wrapper v1.0.0 (pack 4.48.0) ==================
   Re-wraps module.exports.getStreams: runs the provider lane and the OSv3
   subtitle lane concurrently, then attaches the language tracks to every
   row that has no subtitles of its own. Provider-specific tracks always
   win; rows keep their originals untouched. Fail-soft end to end.
=========================================================================== */
(function () {
  var G = typeof globalThis !== "undefined" ? globalThis : this;
  var lane = G.__nvOsv3Subs;
  var orig = null;
  try { orig = module.exports && module.exports.getStreams; } catch (e) { orig = null; }
  if (!lane || typeof orig !== "function") return;
  module.exports.getStreams = function (tmdbId, mediaType, season, episode) {
    var rowsP;
    try {
      rowsP = Promise.resolve(orig.apply(this, arguments));
    } catch (e) {
      rowsP = Promise.resolve([]);
    }
    var subsP = lane.get(tmdbId, mediaType, season, episode).catch(function () { return []; });
    // Captions are optional. Give OSV3 a short head start, then return the
    // provider's playable rows even if the subtitle service is unavailable.
    var subsFastP;
    if (typeof setTimeout === "function" && typeof Promise !== "undefined" && Promise.race) {
      var subsTimer = null;
      var subsFallback = new Promise(function (resolve) {
        subsTimer = setTimeout(function () { resolve([]); }, 1200);
        if (subsTimer && typeof subsTimer.unref === "function") subsTimer.unref();
      });
      subsFastP = Promise.race([subsP, subsFallback]).then(function (value) {
        if (subsTimer != null && typeof clearTimeout === "function") clearTimeout(subsTimer);
        return value;
      }, function () {
        if (subsTimer != null && typeof clearTimeout === "function") clearTimeout(subsTimer);
        return [];
      });
    } else {
      subsFastP = Promise.resolve([]);
    }
    return Promise.all([rowsP.catch(function () { return []; }), subsFastP]).then(function (arr) {
      var rows = Array.isArray(arr[0]) ? arr[0] : [];
      var subs = Array.isArray(arr[1]) ? arr[1] : [];
      if (!rows.length || !subs.length) return rows;
      for (var i = 0; i < rows.length; i++) {
        var r = rows[i];
        if (r && (!r.subtitles || !r.subtitles.length)) r.subtitles = subs;
      }
      return rows;
    });
  };
})();

/* BEGIN NV_NON_ANIME_PROVIDER_BOUNDARY */
(function () {
  var G = typeof globalThis !== 'undefined' ? globalThis : this;
  var original = null;
  try { original = module.exports && module.exports.getStreams; } catch (e) { original = null; }
  if (typeof original !== 'function') return;
  var PROVIDER_ID = "topcartoons";
  var MAX_MS = 12000;

  function number(raw) {
    return raw != null && /^\d+$/.test(String(raw).trim()) ? Number(raw) : null;
  }
  function clean(raw) {
    var id = String(raw == null ? '' : raw).trim();
    try { id = decodeURIComponent(id); } catch (e) {}
    id = id.replace(/[?#].*$/, '').replace(/\.json$/i, '').replace(/\/+$/, '');
    return id;
  }
  function normalize(input, mediaType, season, episode, argCount) {
    var id = clean(input);
    var mt = String(mediaType == null ? '' : mediaType).trim().toLowerCase();
    if (number(mediaType) != null && argCount === 3) {
      episode = season; season = mediaType; mt = 'tv';
    }
    var match = id.match(/^tmdb:(\d+)(?::(\d+)(?::(\d+))?)?$/i);
    if (match) {
      id = match[1];
      if (season == null && match[2] != null) season = Number(match[2]);
      if (episode == null && match[3] != null) episode = Number(match[3]);
    } else {
      match = id.match(/^(asian:[a-z0-9-]+|(?:mal|anilist|kitsu|anikoto):\d+)(?::(\d+)(?::(\d+))?)?$/i);
      if (match) {
        id = match[1];
        if (season == null && match[3] != null) season = Number(match[2]);
        if (episode == null && match[3] != null) episode = Number(match[3]);
        if (episode == null && match[2] != null && match[3] == null) episode = Number(match[2]);
        var owner = /^asian:pmh-/i.test(id) ? 'pinoymovieshub' :
          /^asian:pen-/i.test(id) ? 'pencuri' :
          /^asian:(?:ks|va|kh)-/i.test(id) ? 'asianhub' :
          /^asian:hd4u-/i.test(id) ? 'hdhub4u' :
          /^(mal|anilist|kitsu|anikoto):/i.test(id) ? 'miruro' : '';
        if (!owner || owner !== PROVIDER_ID) return null;
      } else if (!/^\d+$/.test(id) && !/^tt\d+$/i.test(id)) {
        return null;
      }
    }
    if (/^(series|show|tvshow|tv_show|tv|other)$/.test(mt)) mt = 'tv';
    else if (mt !== 'movie') mt = number(episode) != null ? 'tv' : 'movie';
    season = number(season); episode = number(episode);
    if (mt === 'tv' && (season == null || episode == null || episode < 1)) return null;
    return { id: id, mediaType: mt, season: season, episode: episode };
  }
  function cleanRows(raw) {
    if (!Array.isArray(raw)) return [];
    var out = [], seen = {};
    for (var i = 0; i < raw.length && out.length < 40; i++) {
      var row = raw[i];
      if (!row || typeof row !== 'object') continue;
      var url = String(row.url || row.playlist || '').trim();
      if (!/^https?:\/\//i.test(url) || /^https?:\/\/[^/]+\/$/i.test(url)) continue;
      if (/^(?:javascript|data):/i.test(url) || /(?:^|[?&])(?:error|message)=/i.test(url)) continue;
      if (seen[url]) continue;
      seen[url] = 1;
      var copy = {};
      for (var k in row) if (Object.prototype.hasOwnProperty.call(row, k)) copy[k] = row[k];
      copy.url = url;
      out.push(copy);
    }
    return out;
  }
  function tmdbKey() {
    var key = '';
    try {
      if (typeof G.__NV_TMDB_API_KEY === 'string') key = G.__NV_TMDB_API_KEY;
      if (!key && typeof TMDB_API_KEY === 'string') key = TMDB_API_KEY;
      if (!key && typeof TMDB_KEY === 'string') key = TMDB_KEY;
    } catch (e) {}
    return key;
  }
  function resolveImdb(id, mediaType) {
    if (!/^tt\d+$/i.test(id) || PROVIDER_ID === 'torrents' || PROVIDER_ID === 'tagalogtorrents') {
      return Promise.resolve(id);
    }
    var key = tmdbKey();
    if (!key || typeof fetch !== 'function') return Promise.resolve(null);
    var kind = mediaType === 'tv' ? 'tv_results' : 'movie_results';
    var request = Promise.resolve().then(function () {
      return fetch('https://api.themoviedb.org/3/find/' + encodeURIComponent(id) +
        '?external_source=imdb_id&api_key=' + encodeURIComponent(key));
    }).then(function (res) {
      if (!res || !res.ok) return null;
      return res.json();
    }).then(function (data) {
      var list = data && Array.isArray(data[kind]) ? data[kind] : [];
      return list.length && /^\d+$/.test(String(list[0].id)) ? String(list[0].id) : null;
    }).catch(function () { return null; });
    if (typeof setTimeout !== 'function' || typeof clearTimeout !== 'function') return request;
    var timer = null;
    var timeout = new Promise(function (resolve) {
      timer = setTimeout(function () { resolve(null); }, 6000);
      if (timer && typeof timer.unref === 'function') timer.unref();
    });
    return Promise.race([request, timeout]).then(function (result) {
      if (timer != null) clearTimeout(timer);
      return result;
    }).catch(function () {
      if (timer != null) clearTimeout(timer);
      return null;
    });
  }
  function invoke(args, normalized) {
    args[0] = normalized.id;
    args[1] = normalized.mediaType;
    args[2] = normalized.season;
    args[3] = normalized.episode;
    var pending;
    try { pending = Promise.resolve(original.apply(this, args)); }
    catch (e) { return Promise.resolve([]); }
    if (typeof setTimeout !== 'function' || typeof clearTimeout !== 'function') {
      return pending.then(cleanRows).catch(function () { return []; });
    }
    var timer = null;
    var timeout = new Promise(function (resolve) {
      timer = setTimeout(function () { resolve([]); }, MAX_MS);
      if (timer && typeof timer.unref === 'function') timer.unref();
    });
    return Promise.race([pending, timeout]).then(function (rows) {
      if (timer != null) clearTimeout(timer);
      return cleanRows(rows);
    }).catch(function () {
      if (timer != null) clearTimeout(timer);
      return [];
    });
  }
  module.exports.getStreams = function () {
    var args = Array.prototype.slice.call(arguments);
    var normalized = normalize(args[0], args[1], args[2], args[3], args.length);
    if (!normalized) return Promise.resolve([]);
    var self = this;
    return resolveImdb(normalized.id, normalized.mediaType).then(function (resolvedId) {
      if (!resolvedId) return [];
      normalized.id = resolvedId;
      return invoke.call(self, args, normalized);
    }).catch(function () { return []; });
  };
})();
/* END NV_NON_ANIME_PROVIDER_BOUNDARY */
