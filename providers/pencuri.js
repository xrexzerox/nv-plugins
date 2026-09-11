/**
 * Pencuri Movie provider (pencurimovie.baby / .sbs family) for Nuvio.
 *
 * pencuri.js v1.3.0 (repo 4.16.0) — ENGLISH SUBTITLES cycle.
 *
 * WHAT THIS PROVIDER DOES
 * ----------------------
 * Source: the Pencuri Movie WordPress network (MovieMo theme). Detail pages
 * expose N server tabs (<div id="tab1..N">, each an <iframe data-src=...>);
 * the tab labels (<a href="#tabK">Web-dl</a>) name the print. Every server
 * embed is resolved to a DIRECT link through per-family extractors:
 *
 *   - Dood family      doodstream.com / playmogo.com / dsvplay.com /
 *                      d000d / dooood / ds2play / dood.yt ...   -> direct mp4
 *                      (pass_md5 flow + Dean-Edwards packer unpack, ported
 *                      from asianhub.js v2.2.0 where it is proven on-device;
 *                      Turnstile-gated and "not found" pages are detected and
 *                      skipped instead of emitting dead links)
 *   - Streamtape       streamtape.com / .to / stape            -> get_video link
 *                      (videolink element + robotlink concat + raw regex)
 *   - Uptostream       /iframe/{id}                            -> per-res mp4
 *   - VOE              /e/{id} (JS-redirect to rotating domains) -> hls, with
 *                      the johnfullwonder-style JS redirect followed once;
 *                      obfuscated player bodies fail soft
 *   - generic leak     any embed HTML that leaks .m3u8/.mp4 directly
 *
 * Unresolvable or dead hosts are silently dropped (fail-soft per host) — the
 * rows that remain are exactly the servers that resolved.
 *
 * ENGLISH SUBTITLES (new in 1.3.0)
 * --------------------------------
 * Every returned stream row carries a `subtitles` array of English tracks:
 *   s.subtitles = [{ url, language: "en", name: "English" }]
 * That is the exact shape NuvioMobile's plugin runtime maps to
 * PluginSubtitleResult (url / language / name / headers) — the same
 * convention netmirror.js has used since 5.0.0.
 *
 * Subtitle source: Stremio's official OpenSubtitles-v3 addon
 * (opensubtitles-v3.strem.io) — keyless, returns direct UTF-8 SRT URLs via
 * subs5.strem.io (verified: movie tt32338669 -> 3 English SRTs, series
 * tt13443470:1:1 -> 6 English SRTs for Wednesday S01E01). Hearing-impaired
 * tracks are ranked after clean ones and labelled "English (HI)".
 *
 * The IMDb id needed by that lane is resolved from whatever id Nuvio passes:
 *   - tt...            -> used directly
 *   - tmdb/numeric     -> /3/{type}/{id}/external_ids
 *   - pencuri:{slug}   -> the page's og:title "Name (Year)" -> TMDB search ->
 *                        external_ids (2 calls, cached)
 * The subtitle fetch runs IN PARALLEL with host extraction, so it never
 * extends the stream deadline.
 *
 * ID CONTRACT
 * -----------
 *   pencuri:{slug}            asian-catalog Pencuri sections (exact page)
 *   pencuri:{slug}:1:{ep}     episode-scoped shape Nuvio passes on series
 *                             taps (tolerated, only matters if series rows
 *                             are ever added to the catalogs)
 *   tt\d+ / numeric / tmdb:N  TMDB-browsed content -> TMDB title lookup ->
 *                             site search (?s=title) -> best title+year match
 *
 * Domain strategy: the family rotates subdomains/TLDs (ww44.pencurimovie.baby,
 * ww11.pencurimovie.sbs, ...). Bases are probed once per process and the
 * first healthy one sticks (goodBase), like netmirror's base rotation.
 */

var PROVIDER_NAME = "Pencuri";
var PENCURI_BASES = [
  "https://ww44.pencurimovie.baby",
  "https://ww11.pencurimovie.sbs",
  "https://pencurimovie.baby"
];

var HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36",
  "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9"
};

var PAGE_TIMEOUT_MS = 12000;
var EMBED_TIMEOUT_MS = 8000;
var SUBS_TIMEOUT_MS = 7000;
var STREAM_CACHE_TTL = 3 * 60 * 1000; // streamtape links die in ~5min
var SUBS_CACHE_TTL = 30 * 60 * 1000;
var TMDB_CACHE_TTL = 60 * 60 * 1000;

var TMDB_API_KEY = "439c478a771f35c05022f9feabcca01c";
var OS_V3_BASE = "https://opensubtitles-v3.strem.io";

var _G = typeof globalThis !== "undefined" ? globalThis : typeof global !== "undefined" ? global : this;
var _pcState = _G.__PENCURI_STATE__ || (_G.__PENCURI_STATE__ = {
  goodBase: null,       // sticky base that answered last
  baseDead: {},         // base -> ts until which it is benched
  streamCache: {},      // cacheKey -> { ts, streams }
  subsCache: {},        // imdbKey -> { ts, subs }
  tmdbCache: {},        // url -> { ts, data }
  pageCache: {}         // pageUrl -> { ts, html }
});

// ---------------------------------------------------------------- helpers

function merge(a, b) {
  var out = {}, k;
  for (k in (a || {})) out[k] = a[k];
  for (k in (b || {})) out[k] = b[k];
  return out;
}

function hasTimers() {
  return typeof setTimeout === "function";
}

function fetchText(url, headers, timeoutMs) {
  var opts = {
    method: "GET",
    redirect: "follow",
    headers: merge(HEADERS, headers || {})
  };
  function fail(res) {
    return res.text().then(function () { throw new Error("HTTP " + res.status); });
  }
  if (!hasTimers()) return fetch(url, opts).then(function (res) {
    if (!res.ok) return fail(res);
    return res.text();
  });
  return new Promise(function (resolve, reject) {
    var done = false;
    var timer = setTimeout(function () {
      if (done) return;
      done = true;
      reject(new Error("fetch timeout"));
    }, timeoutMs || 15000);
    fetch(url, opts).then(function (res) {
      if (done) return;
      if (!res.ok) {
        fail(res).then(function (e) { if (!done) { done = true; clearTimeout(timer); reject(e); } },
                       function (e) { if (!done) { done = true; clearTimeout(timer); reject(e); } });
        return;
      }
      res.text().then(function (t) {
        if (done) return;
        done = true;
        clearTimeout(timer);
        resolve(t);
      }, function (e) {
        if (done) return;
        done = true;
        clearTimeout(timer);
        reject(e);
      });
    }).catch(function (e) {
      if (done) return;
      done = true;
      clearTimeout(timer);
      reject(e);
    });
  });
}

function fetchJson(url, headers, timeoutMs) {
  return fetchText(url, headers, timeoutMs).then(function (t) {
    try { return JSON.parse(t); } catch (e) { return null; }
  });
}

function hostOf(u) {
  var m = String(u || "").match(/^https?:\/\/([^\/?#]+)/i);
  return m ? m[1].toLowerCase() : "";
}

function cacheGet(store, key, ttl) {
  var e = store[key];
  if (e && (Date.now() - e.ts) < ttl) return e.value;
  return null;
}

function cachePut(store, key, value) {
  store[key] = { ts: Date.now(), value: value };
}

function normalizeTitle(s) {
  var t = String(s || "").toLowerCase();
  t = t.replace(/\((?:19|20)\d{2}\)/g, " ");
  t = t.replace(/[-:\u2013\u2014|]?\s*episode\s*\d+\s*$/i, " ");
  t = t.replace(/[-:\u2013\u2014|]?\s*ep\s*\d+\s*$/i, " ");
  t = t.replace(/\b(19|20)\d{2}\b/g, " ");
  t = t.replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " ").trim();
  return t;
}

/** token-overlap score (0..3) between two already-normalized titles */
function titleScore(a, b) {
  if (!a || !b) return 0;
  if (a === b) return 3;
  if (a.length >= 6 && b.indexOf(a) === 0) return 2.5;
  if (b.length >= 6 && a.indexOf(b) === 0) return 2.5;
  if (a.indexOf(b) !== -1 || b.indexOf(a) !== -1) return 2;
  var at = a.split(" ");
  var bt = b.split(" ");
  var set = {};
  var i;
  for (i = 0; i < bt.length; i++) set[bt[i]] = true;
  var inter = 0;
  for (i = 0; i < at.length; i++) if (set[at[i]]) inter++;
  var cov = inter / Math.max(at.length, bt.length);
  return cov >= 0.6 ? 1.5 : 0;
}

function qualityFromText(text) {
  var value = String(text || "").toLowerCase();
  var m = value.match(/\b(2160p|1440p|1080p|720p|480p|360p|4k|uhd|hd|sd|cam|blu-ray|brrip|web-dl|webdl|hdtv|hdrip|web-?rip)\b/);
  if (!m) return "";
  var q = m[1];
  if (q === "4k" || q === "uhd" || q === "2160p") return "4K";
  if (q === "hd") return "720p";
  if (q === "sd") return "480p";
  if (q === "cam") return "CAM";
  if (q === "blu-ray" || q === "brrip") return "1080p";
  if (q === "web-dl" || q === "webdl" || q === "hdtv" || q === "hdrip" || q === "webrip" || q === "web-rip") return "";
  return q;
}

// --------------------------------------------- Dean Edwards packer unpack

function jsUnescape(s) {
  return String(s).replace(/\\(u[0-9a-fA-F]{4}|x[0-9a-fA-F]{2}|[0-3][0-7]{0,2}|[\\nrtbfv'"])/g, function (all, esc) {
    if (esc.charAt(0) === "u" || esc.charAt(0) === "x") {
      return String.fromCharCode(parseInt(esc.slice(1), 16));
    }
    switch (esc) {
      case "n": return "\n";
      case "r": return "\r";
      case "t": return "\t";
      case "b": return "\b";
      case "f": return "\f";
      case "v": return "\v";
      case "0": return "\0";
      case "\\": return "\\";
      default: return esc;
    }
  });
}

function unpackPacker(packed) {
  var m = String(packed).match(/\}\s*\(\s*'((?:\\.|[^'\\])*)'\s*,\s*\d+\s*,\s*(\d+)\s*,\s*'([^']*)'\.split\('\|'\)/);
  if (!m) return "";
  var payload = jsUnescape(m[1]);
  var keys = jsUnescape(m[3]).split("|");
  var dict = {};
  var i;
  for (i = 0; i < keys.length; i++) dict[String(i)] = keys[i];
  return payload.replace(/\b\w+\b/g, function (w) {
    return (dict[w] !== undefined && dict[w] !== "") ? dict[w] : w;
  });
}

// ----------------------------------------------------- base rotation

function baseBenched(base) {
  var until = _pcState.baseDead[base] || 0;
  return Date.now() < until;
}

function benchBase(base) {
  _pcState.baseDead[base] = Date.now() + 10 * 60 * 1000;
  if (_pcState.goodBase === base) _pcState.goodBase = null;
}

/** fetchText with base failover; benches bases that error on GET /. */
function pencuriFetch(pathOrUrl, refererBase, timeoutMs) {
  var url = pathOrUrl;
  var order = [];
  if (_pcState.goodBase && !baseBenched(_pcState.goodBase)) order.push(_pcState.goodBase);
  var i;
  for (i = 0; i < PENCURI_BASES.length; i++) {
    if (order.indexOf(PENCURI_BASES[i]) === -1 && !baseBenched(PENCURI_BASES[i])) order.push(PENCURI_BASES[i]);
  }
  if (!order.length) order = PENCURI_BASES.slice(0, 1);

  if (/^https?:\/\//i.test(url)) {
    // absolute URL (episode pages etc.) — hit it directly, single base
    return fetchText(url, refererBase ? { "Referer": refererBase + "/" } : {}, timeoutMs || PAGE_TIMEOUT_MS);
  }

  var attempt = 0;
  function tryNext(err) {
    if (attempt >= order.length) return Promise.reject(err || new Error("all pencuri bases failed"));
    var base = order[attempt++];
    return fetchText(base + url, { "Referer": base + "/" }, timeoutMs || PAGE_TIMEOUT_MS).then(function (html) {
      _pcState.goodBase = base;
      return html;
    }, function (e) {
      benchBase(base);
      return tryNext(e);
    });
  }
  return tryNext();
}

// --------------------------------------------------- page parsers

/**
 * Catalog/search listing rows (MovieMo theme):
 *   <div data-movie-id=".." class="ml-item ..."><a href="DETAIL" ...
 *        oldtitle="Name (Year)" ...><span class="mli-quality">...
 *        <img src="POSTER" ...
 * Series rows link /series/{slug}/, episode-derived rows are skipped.
 */
function parseListingRows(html) {
  var rows = [];
  var re = /<div[^>]*class="ml-item([^"]*)"[^>]*>\s*<a\s+href="([^"]+)"([^>]*)>/g;
  var m;
  while ((m = re.exec(html)) !== null) {
    var attrs = m[2 + 1] || "";
    var href = m[2];
    var title = (attrs.match(/oldtitle="([^"]*)"/i) || [])[1] || "";
    var isSeries = /\/series\//i.test(href);
    // poster appears within the same anchor block
    var tail = html.slice(re.lastIndex, re.lastIndex + 1200);
    var poster = (tail.match(/<img[^>]+src="([^"]+(?:image\.tmdb\.org|pencuri)[^"]*)"/i) || [])[1] || "";
    var quality = (tail.match(/mli-quality-text">([^<]+)</i) || [])[1] || "";
    var year = (title.match(/\((19|20)\d{2}\)/) || [])[0] || "";
    year = year ? year.replace(/[()]/g, "") : "";
    var name = title.replace(/\s*\((19|20)\d{2}\)\s*$/, "").trim();
    rows.push({
      slug: slugFromUrl(href),
      url: href,
      title: name,
      year: year,
      poster: poster,
      quality: quality,
      isSeries: isSeries
    });
  }
  return rows;
}

function slugFromUrl(href) {
  var m = String(href || "").match(/\/([a-z0-9-]+)\/?$/i);
  return m ? m[1] : "";
}

/** og:title "Name (Year) - Pencuri Movie Official Website" */
function parsePageTitle(html) {
  var m = html.match(/property=["']og:title["']\s+content=["']([^"']+)["']/i) ||
          html.match(/content=["']([^"']+)["']\s+property=["']og:title["']/i);
  if (!m) return { title: "", year: "" };
  var raw = m[1].replace(/\s*-\s*Pencuri Movie.*$/i, "").trim();
  var ym = raw.match(/\((19|20)\d{2}\)/);
  var year = ym ? ym[0].replace(/[()]/g, "") : "";
  var title = raw.replace(/\s*\((19|20)\d{2}\)\s*/, "").trim();
  return { title: title, year: year };
}

function parsePageDescription(html) {
  // the <div itemprop="description" class="desc"> block — NOT the
  // self-closing <meta itemprop="description"/> that precedes it
  var m = html.match(/<div[^>]+itemprop="description"[^>]*>([\s\S]*?)<\/div>/i);
  var d = m ? m[1] : "";
  if (!d) {
    m = html.match(/property=["']og:description["']\s+content=["']([^"']+)["']/i);
    d = m ? m[1] : "";
  }
  return d.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/&#8217;/g, "'")
    .replace(/&#8216;/g, "'").replace(/&amp;/g, "&").replace(/&quot;/g, '"')
    .replace(/\s+/g, " ").trim();
}

/**
 * Server tabs on detail/episode pages:
 *   <li>...<strong>Server N</strong>...<a href="#tabK">Label</a>...</li>
 *   <div id="tabK"><div class="movieplay"><iframe data-src="EMBED">
 * Returns [{ label, embed }] in tab order (YouTube trailers dropped).
 */
function parseServerTabs(html) {
  var labels = {};
  var lr = /<a\s+href="#(tab\d+)"[^>]*>([^<]*)<\/a>/gi;
  var lm;
  while ((lm = lr.exec(html)) !== null) {
    labels[lm[1]] = (lm[2] || "").trim();
  }
  var servers = [];
  var sr = /<div\s+id="(tab\d+)"[^>]*>([\s\S]*?)(?=<div\s+id="tab\d+"|<\/ul>\s*<\/div>|<div class="mobile-btn")/gi;
  var sm;
  while ((sm = sr.exec(html)) !== null) {
    var tabId = sm[1];
    var block = sm[2];
    var em = block.match(/<iframe[^>]*(?:data-)?src=["']([^"']+)["']/i);
    if (!em) continue;
    var embed = em[1];
    if (embed.indexOf("//") === 0) embed = "https:" + embed;
    if (!/^https?:\/\//i.test(embed)) continue;
    if (/youtube\.com|youtu\.be/i.test(embed)) continue; // trailer iframe
    servers.push({
      tab: tabId,
      label: labels[tabId] || "",
      embed: embed
    });
  }
  // fallback: loose iframe scan when the tab regex misses (layout drift)
  if (!servers.length) {
    var ir = /<iframe[^>]*(?:data-)?src=["']([^"']+)["']/gi;
    var im, n = 0;
    while ((im = ir.exec(html)) !== null) {
      var u = im[1];
      if (u.indexOf("//") === 0) u = "https:" + u;
      if (!/^https?:\/\//i.test(u)) continue;
      if (/youtube\.com|youtu\.be/i.test(u)) continue;
      n += 1;
      servers.push({ tab: "tab" + n, label: "", embed: u });
    }
  }
  return servers;
}

/**
 * Series pages: <div class="tvseason">... <strong>Season N</strong> ...
 *   <div class="les-content"><a href="/episode/slug-season-1-episode-1">...
 * Returns [{ season, episodes: [{ num, slug, title }] }]
 */
function parseSeriesSeasons(html) {
  var seasons = [];
  var sr = /<div class="tvseason"[^>]*>([\s\S]*?)(?=<div class="tvseason"|<\/div>\s*<\/div>\s*<\/div>|<\/section>|<div class="mvi-content")/gi;
  var sm;
  while ((sm = sr.exec(html)) !== null) {
    var block = sm[1];
    var sNum = (block.match(/<strong>\s*Season\s*(\d+)\s*<\/strong>/i) || [])[1] || "";
    var eps = [];
    var er = /<a\s+href="(\/episode\/[^"]+)"[^>]*>\s*Episode\s*(\d+)\s*([^<]*)<\/a>/gi;
    var em;
    while ((em = er.exec(block)) !== null) {
      eps.push({ num: parseInt(em[2], 10), slug: em[1].replace(/^\/episode\//, "").replace(/\/$/, ""), title: (em[3] || "").replace(/^\s*-\s*/, "").trim() });
    }
    if (eps.length) seasons.push({ season: parseInt(sNum, 10) || (seasons.length + 1), episodes: eps });
  }
  return seasons;
}

// ------------------------------------------------- embed extractors

var DECOY_HOSTS = /test-videos\.co\.uk|commondatastorage\.googleapis\.com|sample-videos\.com/i;

/** Extractor result: { url, quality?, headers?, source } | null */

// --- Dood family (ported from asianhub.js v2.2.0, proven on-device) ---

function doodFamilyHost(host) {
  var h = String(host || "").toLowerCase();
  if (h.indexOf("dood") !== -1 || h.indexOf("dooo") !== -1 || h.indexOf("dsvplay") !== -1) return true;
  var known = ["playmogo.com", "myvidplay.com", "dsvplay.com", "d000d.com", "dooood.com", "ds2play.com", "ds2play2.com", "doodcdn.io", "dood.wad", "dood.yt", "dsvplay", "d000d", "dooood", "doply", "doodstream"];
  var i;
  for (i = 0; i < known.length; i++) {
    if (h.indexOf(known[i]) !== -1) return true;
  }
  return false;
}

function doodFindMd5Path(html) {
  var m = html.match(/["']\/(pass_md5\/[a-z0-9]+(?:\/[a-z0-9]+)?)['"]/i);
  if (m) return m[1];
  var unpacked = unpackPacker(html);
  if (unpacked) {
    m = unpacked.match(/["']\/(pass_md5\/[a-z0-9]+(?:\/[a-z0-9]+)?)['"]/i);
    if (m) return m[1];
  }
  m = html.match(/\/pass_md5\/([a-z0-9]+)/i);
  return m ? "pass_md5/" + m[1] : null;
}

function doodIsGated(html) {
  return /op=validate|turnstile\.render|challenges\.cloudflare\.com\/turnstile/i.test(html);
}

function doodIsDead(html) {
  return /video you are looking for is not found|class="not_found"|Video not found/i.test(html);
}

function doodFetchDirect(host, md5Path, refererUrl, qualityHint) {
  var passUrl = "https://" + host + "/" + md5Path;
  return fetchText(passUrl, {
    headers: { "Referer": refererUrl, "X-Requested-With": "XMLHttpRequest" }
  }, EMBED_TIMEOUT_MS).then(function (body) {
    var base = String(body).trim();
    if (base.indexOf("http") !== 0) return null;
    var token = md5Path.split("/")[1] || "";
    var expiry = Date.now() + 2 * 60 * 60 * 1000;
    var chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    var pad = "", ci;
    for (ci = 0; ci < 10; ci++) pad += chars.charAt(Math.floor(Math.random() * chars.length));
    var directUrl = base + pad + "?token=" + token + "&expiry=" + expiry;
    return {
      url: directUrl,
      quality: qualityFromText(qualityHint) || "",
      headers: null, // the token IS the authorization on dood nodes
      source: "Dood"
    };
  }).catch(function () { return null; });
}

function extractDood(embedUrl, refererUrl) {
  var embedIdMatch = embedUrl.match(/\/e\/([a-z0-9]+)/i);
  if (!embedIdMatch) return Promise.resolve(null);
  var embedId = embedIdMatch[1];
  var qualityHint = "";
  return fetchText(embedUrl, { "Referer": refererUrl || "" }, EMBED_TIMEOUT_MS).then(function (html) {
    if (doodIsGated(html)) return null;
    if (doodIsDead(html)) return null;
    var tm = html.match(/<title[^>]*>([^<]*)<\/title>/i);
    if (tm) qualityHint = tm[1];
    var host = hostOf(embedUrl);
    // dood mirrors 301 to a sibling host; pass_md5 must go to that host when
    // the body itself carries one — the md5 path is host-relative anyway.
    var md5Path = doodFindMd5Path(html);
    if (!md5Path) return null;
    return doodFetchDirect(host, md5Path, "https://" + host + "/e/" + embedId, qualityHint);
  }).catch(function () { return null; });
}

// --- Streamtape (patterns from mycima.js + hdhub4u.js) ---

function streamtapeFamilyHost(host) {
  return /streamtape|stape\.|streamta\.|tapewithadblock|strcloud/i.test(String(host || ""));
}

function extractStreamtape(embedUrl, refererUrl) {
  var host = hostOf(embedUrl) || "streamtape.com";
  return fetchText(embedUrl, { "Referer": refererUrl || "" }, EMBED_TIMEOUT_MS).then(function (html) {
    if (/Video not found/i.test(html)) return null;
    function buildUrl(text) {
      var gv = String(text).match(/get_video\?[^"'<>\s]+/);
      if (!gv) return null;
      var path = gv[0];
      // older pages split the id across two fragments: id="XXXX"&expires...
      var gm = path.match(/id=([a-zA-Z0-9]+)/);
      if (gm && !/[A-Za-z]/.test(gm[1].slice(0, 1))) return null;
      return "https://" + host + "/" + path;
    }
    // current layout: plain-text divs (robotlink = the valid token;
    // botlink/ideoolink carry decoy tokens, JS overwrites them)
    var m = html.match(/id="robotlink"[^>]*>([^<]+)</i) ||
            html.match(/id="botlink"[^>]*>([^<]+)</i);
    if (m) {
      var u = buildUrl(m[1]);
      if (u) return { url: u, quality: "", headers: null, source: "Streamtape" };
    }
    // 1) videolink element carries the ready link (older layout)
    m = html.match(/id="videolink"[^>]*>([^<]+)/);
    if (m && /get_video/.test(m[1])) {
      return { url: "https:" + m[1].trim().replace(/^https?:/, ""), quality: "", headers: null, source: "Streamtape" };
    }
    // 2) innerHTML assignment with a single quoted get_video string
    m = html.match(/'(\/\/(?:[a-z.]*streamtape[^\/]*)?\/get_video[^']+)'/i) ||
        html.match(/"(\/\/(?:[a-z.]*streamtape[^\/]*)?\/get_video[^"]+)"/i);
    if (m) {
      return { url: "https:" + m[1], quality: "", headers: null, source: "Streamtape" };
    }
    // 3) legacy JS concatenation: join EVERY string literal (both quote
    //    types, in order) after the robotlink marker, then re-scan
    var idx = html.indexOf("robotlink");
    if (idx !== -1) {
      var chunk = html.slice(idx, idx + 1200);
      var fr = /"((?:[^"\\]|\\.)*)"|'((?:[^'\\]|\\.)*)'/g;
      var fm, joined = "";
      while ((fm = fr.exec(chunk)) !== null) {
        joined += (fm[1] !== undefined ? fm[1] : fm[2]);
      }
      joined = joined.replace(/\\(["'\/])/g, "$1");
      var u2 = buildUrl(joined);
      if (u2) return { url: u2, quality: "", headers: null, source: "Streamtape" };
    }
    return null;
  }).catch(function () { return null; });
}

// --- Uptostream (/iframe/{id} -> per-resolution mp4 sources) ---

function extractUptostream(embedUrl, refererUrl) {
  return fetchText(embedUrl, { "Referer": refererUrl || "" }, EMBED_TIMEOUT_MS).then(function (html) {
    var out = [];
    var sr = /<source[^>]+src="([^"]+\.mp4[^"]*)"[^>]*>/gi;
    var sm;
    while ((sm = sr.exec(html)) !== null) {
      var tag = sm[0];
      var res = (tag.match(/res="(\d+)"/i) || [])[1] || (tag.match(/label="(\d+)p?"/i) || [])[1] || "";
      out.push({
        url: sm[1],
        quality: res ? res + "p" : "",
        headers: null,
        source: "Uptostream"
      });
    }
    if (!out.length) return null;
    return out;
  }).catch(function () { return null; });
}

// --- VOE (best effort: follow the JS redirect once, then plain leaks) ---

function voeFamilyHost(host) {
  return /(^|\.)voe\.(sx|unblockia|ser|mov)|voeunbl|audienced|johnfullwonder|v-e-o/i.test(String(host || ""));
}

function extractVoe(embedUrl, refererUrl, depth) {
  var d = depth || 0;
  return fetchText(embedUrl, { "Referer": refererUrl || "" }, EMBED_TIMEOUT_MS).then(function (html) {
    // voe.sx serves a JS redirect to a rotating domain — follow it once
    if (d < 2) {
      var rm = html.match(/window\.location\.href\s*=\s*['"]([^'"]+)['"]/);
      if (rm && !/^\s*$/.test(rm[1]) && rm[1].indexOf("localStorage") === -1) {
        var target = rm[1];
        if (target.indexOf("//") === 0) target = "https:" + target;
        if (/^https?:\/\//i.test(target)) {
          return extractVoe(target, refererUrl, d + 1);
        }
      }
    }
    var found = "";
    var m = html.match(/sources\s*:\s*\[\s*\{\s*file\s*:\s*["']([^"']+)["']/i) ||
            html.match(/["']hls["']\s*:\s*["']([^"']+)["']/i) ||
            html.match(/(https?:\/\/[^"'\s\\]+\.m3u8[^"'\s\\]*)/i) ||
            html.match(/var\s+source\s*=\s*['"]([^'']+)['"]/i);
    if (m) found = m[1];
    if (found && !DECOY_HOSTS.test(found)) {
      var q = qualityFromText(html.slice(html.indexOf(found) - 300 > 0 ? html.indexOf(found) - 300 : 0, html.indexOf(found) + 300)) || "";
      return { url: found, quality: q, headers: null, source: "VOE" };
    }
    return null;
  }).catch(function () { return null; });
}

// --- Generic leak scanner (embed HTML carrying plain mp4/m3u8) ---

function extractGenericLeak(embedUrl, refererUrl) {
  return fetchText(embedUrl, { "Referer": refererUrl || "" }, EMBED_TIMEOUT_MS).then(function (html) {
    var urls = [];
    var re = /(https?:\/\/[^"'\s\\<>]+?\.(?:m3u8|mp4)(?:\?[^"'\s\\<>]*)?)/gi;
    var m;
    while ((m = re.exec(html)) !== null) {
      if (!DECOY_HOSTS.test(m[1])) urls.push(m[1]);
    }
    var packed = unpackPacker(html);
    if (packed) {
      re = /(https?:\/\/[^"'\s\\<>]+?\.(?:m3u8|mp4)(?:\?[^"'\s\\<>]*)?)/gi;
      while ((m = re.exec(packed)) !== null) {
        if (!DECOY_HOSTS.test(m[1])) urls.push(m[1]);
      }
    }
    if (!urls.length) return null;
    // mp4 > m3u8 preference; first occurrence wins
    urls.sort(function (a, b) { return (/\.mp4/i.test(b) ? 1 : 0) - (/\.mp4/i.test(a) ? 1 : 0); });
    var q = qualityFromText(html) || "";
    return { url: urls[0], quality: q, headers: null, source: "Direct" };
  }).catch(function () { return null; });
}

/** Dispatch one embed URL to the right family extractor. */
function resolveEmbed(server, refererUrl) {
  var embed = server.embed;
  var host = hostOf(embed);
  if (!host) return Promise.resolve(null);
  if (doodFamilyHost(host)) return extractDood(embed, refererUrl);
  if (streamtapeFamilyHost(host)) return extractStreamtape(embed, refererUrl);
  if (/uptostream|uptobox/i.test(host)) return extractUptostream(embed, refererUrl);
  if (voeFamilyHost(host)) return extractVoe(embed, refererUrl, 0);
  return extractGenericLeak(embed, refererUrl);
}

/** All servers in parallel, fail-soft per host; drops dead/unresolvable. */
function resolveAllServers(servers, refererUrl) {
  var jobs = servers.map(function (server) {
    return resolveEmbed(server, refererUrl).then(function (r) {
      return { server: server, r: r };
    }).catch(function () { return { server: server, r: null }; });
  });
  return Promise.all(jobs).then(function (results) {
    var rows = [];
    var seen = {};
    var i, j;
    for (i = 0; i < results.length; i++) {
      var res = results[i];
      if (!res || !res.r) continue;
      var list = Array.isArray(res.r) ? res.r : [res.r];
      for (j = 0; j < list.length; j++) {
        var r = list[j];
        if (!r || !r.url || seen[r.url]) continue;
        seen[r.url] = true;
        var n = rows.length + 1;
        r.serverLabel = "Server " + n + (res.server.label ? " " + res.server.label : "");
        rows.push(r);
      }
    }
    return rows;
  });
}

// --------------------------------------------------------- TMDB helpers

function tmdbGet(path) {
  var url = "https://api.themoviedb.org/3" + path + (path.indexOf("?") === -1 ? "?" : "&") +
    "api_key=" + TMDB_API_KEY;
  var hit = cacheGet(_pcState.tmdbCache, url, TMDB_CACHE_TTL);
  if (hit) return Promise.resolve(hit);
  return fetchJson(url, {}, 10000).then(function (data) {
    if (data) cachePut(_pcState.tmdbCache, url, data);
    return data;
  }).catch(function () { return null; });
}

/** type+id -> { imdbId, title, original, year } (null when unresolvable) */
function tmdbMeta(type, tmdbId) {
  return tmdbGet("/" + type + "/" + tmdbId).then(function (d) {
    if (!d) return null;
    return {
      title: (d.title || d.name || d.original_title || d.original_name || ""),
      original: (d.original_title || d.original_name || ""),
      year: String((d.release_date || d.first_air_date || "")).split("-")[0] || ""
    };
  });
}

/** tt1234567 -> { tmdbId, type } via /find (null on miss) */
function resolveImdbToTmdb(imdbId) {
  return tmdbGet("/find/" + imdbId + "?external_source=imdb_id").then(function (d) {
    if (!d) return null;
    if (d.movie_results && d.movie_results.length) return { tmdbId: String(d.movie_results[0].id), type: "movie" };
    if (d.tv_results && d.tv_results.length) return { tmdbId: String(d.tv_results[0].id), type: "tv" };
    return null;
  });
}

/** type+tmdbId -> imdb id ("" when none) */
function tmdbExternalImdb(type, tmdbId) {
  return tmdbGet("/" + type + "/" + tmdbId + "/external_ids").then(function (d) {
    return (d && d.imdb_id) ? String(d.imdb_id) : "";
  });
}

// --------------------------------------------------- ENGLISH SUBTITLES
//
// Stremio's official OpenSubtitles-v3 addon, keyless:
//   GET {base}/subtitles/{movie|series}/{imdbId}[:s:e].json
//     -> { subtitles: [{ url, lang, subtitleFileName, ... }] }
// The returned urls (subs5.strem.io/.../subencoding-stremio-utf8/...) are
// plain UTF-8 SRT downloads — verified live for movies and per-episode.

function subKey(imdbId, mediaType, season, episode) {
  var base = imdbId + ":" + (mediaType === "tv" ? "s" : "m");
  if (mediaType === "tv") base += ":" + (season || 1) + ":" + (episode || 1);
  return base;
}

function englishSubsFor(imdbId, mediaType, season, episode) {
  if (!/^tt\d+/i.test(imdbId || "")) return Promise.resolve([]);
  var key = subKey(imdbId, mediaType, season, episode);
  var hit = cacheGet(_pcState.subsCache, key, SUBS_CACHE_TTL);
  if (hit) return Promise.resolve(hit);

  var path = mediaType === "tv"
    ? "/subtitles/series/" + encodeURIComponent(imdbId) + ":" + (season || 1) + ":" + (episode || 1) + ".json"
    : "/subtitles/movie/" + encodeURIComponent(imdbId) + ".json";
  return fetchJson(OS_V3_BASE + path, {}, SUBS_TIMEOUT_MS).then(function (data) {
    var list = (data && Array.isArray(data.subtitles)) ? data.subtitles : [];
    var eng = [];
    var i;
    for (i = 0; i < list.length; i++) {
      var s = list[i];
      if (!s || !s.url) continue;
      var lang = String(s.lang || s.language || "").toLowerCase();
      if (lang !== "eng" && lang.indexOf("en") !== 0) continue;
      var fname = String(s.subtitleFileName || s.movieReleaseName || "");
      var hi = /(^|[.\-_ ])(hi|sdh)([.\-_ ])|hearing.impaired/i.test(fname);
      eng.push({ s: s, hi: hi, fname: fname });
    }
    // clean tracks first, then HI; stable within groups
    eng.sort(function (a, b) { return (a.hi ? 1 : 0) - (b.hi ? 1 : 0); });
    var out = [];
    var seen = {};
    for (i = 0; i < eng.length && out.length < 4; i++) {
      var u = eng[i].s.url;
      if (seen[u]) continue;
      seen[u] = true;
      out.push({
        url: u,
        language: "en",
        name: eng[i].hi ? "English (HI)" : "English"
      });
    }
    cachePut(_pcState.subsCache, key, out);
    return out;
  }).catch(function () { return []; });
}

/**
 * Subtitles for a pencuri:{slug} id: the slug page's og:title gives
 * "Name (Year)"; one TMDB search + one external_ids call pins the IMDb id.
 * Failure is fail-soft ("" -> no subs attached).
 */
function imdbFromPencuriPage(title, year) {
  if (!title) return Promise.resolve("");
  var q = "/search/movie?query=" + encodeURIComponent(title) +
    (year ? "&year=" + encodeURIComponent(year) : "");
  return tmdbGet(q).then(function (d) {
    if (!d || !Array.isArray(d.results) || !d.results.length) return "";
    var results = d.results;
    var best = results[0];
    var i;
    if (year) {
      for (i = 0; i < results.length; i++) {
        if (String(results[i].release_date || "").indexOf(year) === 0) { best = results[i]; break; }
      }
    }
    return tmdbExternalImdb("movie", String(best.id));
  }).catch(function () { return ""; });
}

// ------------------------------------------------------- getStreams

function buildRows(displayTitle, resolvedList, subs, isSeries, season, episode) {
  var rows = [];
  var i;
  for (i = 0; i < resolvedList.length; i++) {
    var r = resolvedList[i];
    var q = r.quality || "Direct";
    var line1 = isSeries
      ? "S" + (season || 1) + "E" + (episode || 1) + " | " + displayTitle
      : displayTitle;
    var line2 = r.serverLabel + " | " + q;
    var stream = {
      name: PROVIDER_NAME + " | " + r.source + (q && q !== "Direct" ? " | " + q : ""),
      title: line1 + "\n" + line2,
      url: r.url,
      quality: q,
      behaviorHints: { bingeGroup: "pencuri-direct" }
    };
    if (r.headers) stream.headers = r.headers;
    if (subs && subs.length) stream.subtitles = subs;
    rows.push(stream);
  }
  return rows;
}

/**
 * Detail/episode page -> all resolvable server rows (+ English subs).
 * Runs host extraction and the subtitle lane IN PARALLEL.
 */
function streamsFromPage(pageHtml, pageUrl, displayTitle, opts) {
  var servers = parseServerTabs(pageHtml);
  if (!servers.length) return Promise.resolve([]);
  var referer = pageUrl;

  var imdbJob = opts.imdbPromise || Promise.resolve("");
  var subsJob = imdbJob.then(function (imdb) {
    return englishSubsFor(imdb, opts.mediaType, opts.season, opts.episode);
  });
  var rowsJob = resolveAllServers(servers, referer);

  return Promise.all([rowsJob, subsJob]).then(function (all) {
    var resolvedList = all[0];
    var subs = all[1];
    return buildRows(displayTitle, resolvedList, subs, opts.mediaType === "tv", opts.season, opts.episode);
  });
}

/** Site search -> best movie row matching title (+year). Returns row|null */
function searchBestRow(title, year, wantSeries) {
  if (!title) return Promise.resolve(null);
  var url = "/?s=" + encodeURIComponent(title);
  return pencuriFetch(url).then(function (html) {
    var rows = parseListingRows(html);
    if (!rows.length) return null;
    var norm = normalizeTitle(title);
    var best = null, bestScore = 0;
    var i;
    for (i = 0; i < rows.length; i++) {
      var r = rows[i];
      if (wantSeries === true && !r.isSeries) continue;
      if (wantSeries === false && r.isSeries) continue;
      var score = titleScore(norm, normalizeTitle(r.title));
      if (year && r.year) {
        if (r.year === year) score += 1.5;      // exact year is decisive
        else if (score < 2.5) score -= 1;        // wrong year + weak title -> no
      }
      if (score > bestScore) { bestScore = score; best = r; }
    }
    return bestScore >= 2 ? best : null;
  }).catch(function () { return null; });
}

function parsePencuriId(rawId) {
  // pencuri:{slug}[:s:e] — slug itself may contain ':'? No (WordPress slugs).
  var m = String(rawId || "").match(/^pencuri:([a-z0-9-]+)(?::(\d+):(\d+))?$/i);
  if (!m) return null;
  return { slug: m[1], season: m[2] ? parseInt(m[2], 10) : 0, episode: m[3] ? parseInt(m[3], 10) : 0 };
}

function getStreams(videoId, mediaType, season, episode) {
  // Legacy 3-arg signatures -> mediaType slot auto-detection (asianhub rule)
  var mt = String(mediaType === undefined || mediaType === null ? "" : mediaType).toLowerCase();
  if (mt === "series" || mt === "show" || mt === "tv_show" || mt === "tvshow") mt = "tv";
  if (mt !== "movie" && mt !== "tv") {
    episode = season;
    season = mediaType;
    mt = "";
  }
  var id = String(videoId === undefined || videoId === null ? "" : videoId).trim();
  id = id.replace(/\.json$/i, "").replace(/^tmdb:/i, "");
  var s = (season === undefined || season === null || season === "") ? 0 : parseInt(String(season).replace(/[^0-9]/g, ""), 10) || 0;
  var e = (episode === undefined || episode === null || episode === "") ? 0 : parseInt(String(episode).replace(/[^0-9]/g, ""), 10) || 0;

  console.log("[Pencuri] === START id=" + id + " type=" + mt + " S" + s + "E" + e + " ===");
  if (!id) return Promise.resolve([]);

  var cacheKey = (mt || "?") + ":" + id + ":" + s + ":" + e;
  var hit = cacheGet(_pcState.streamCache, cacheKey, STREAM_CACHE_TTL);
  if (hit) {
    console.log("[Pencuri] cache hit (" + hit.length + " rows)");
    return Promise.resolve(hit);
  }

  // ---- lane 1: catalog slug ids (exact page, no search)
  var catId = parsePencuriId(id);
  if (catId) {
    var isSeries = catId.season > 0 || catId.episode > 0 || mt === "tv";
    var pagePath = isSeries && catId.episode > 0
      ? "/series/" + catId.slug + "/"   // resolved to the episode page below
      : "/" + catId.slug + "/";
    var catSeason = catId.season || s || 0;
    var catEpisode = catId.episode || e || 0;
    return pencuriFetch(pagePath).then(function (html) {
      var base = _pcState.goodBase || PENCURI_BASES[0];
      var meta = parsePageTitle(html);
      var display = (meta.title || catId.slug.replace(/-/g, " ")) +
        (meta.year ? " (" + meta.year + ")" : "");
      var imdbPromise = imdbFromPencuriPage(meta.title, meta.year);
      if (isSeries && catEpisode > 0) {
        return episodePageFromSeries(html, base, catId.slug, catSeason, catEpisode).then(function (ep) {
          return streamsFromPage(ep.html, ep.url, display, {
            mediaType: "tv", season: catSeason || 1, episode: catEpisode, imdbPromise: imdbPromise
          });
        });
      }
      return streamsFromPage(html, base + pagePath, display, {
        mediaType: isSeries ? "tv" : "movie",
        season: catSeason || 1, episode: catEpisode || 1,
        imdbPromise: imdbPromise
      });
    }).then(function (rows) {
      cachePut(_pcState.streamCache, cacheKey, rows);
      console.log("[Pencuri] catalog slug lane -> " + rows.length + " row(s)");
      return rows;
    }).catch(function (err) {
      console.error("[Pencuri] catalog slug lane error:", (err && err.message) || err);
      return [];
    });
  }

  // ---- lane 2: IMDb tt ids
  if (/^tt\d+/i.test(id)) {
    return resolveImdbToTmdb(id).then(function (hitTmdb) {
      if (!hitTmdb) {
        console.log("[Pencuri] IMDb id not on TMDB: " + id);
        return [];
      }
      return tmdbFlow(hitTmdb.tmdbId, hitTmdb.type, s, e, id);
    }).catch(function (err) {
      console.error("[Pencuri] imdb lane error:", (err && err.message) || err);
      return [];
    });
  }

  // ---- lane 3: numeric/tmdb ids (type from args or auto-detect)
  if (/^\d+$/.test(id)) {
    var autoType;
    if (mt === "movie" || mt === "tv") autoType = Promise.resolve(mt);
    else {
      autoType = tmdbGet("/movie/" + id).then(function (d) {
        return d ? "movie" : "tv";
      });
    }
    return autoType.then(function (type) {
      return tmdbFlow(id, type, s, e, "");
    }).catch(function (err) {
      console.error("[Pencuri] tmdb lane error:", (err && err.message) || err);
      return [];
    });
  }

  console.log("[Pencuri] unrecognized id shape, giving up: " + id);
  return Promise.resolve([]);
}

/**
 * Episode page resolver. WordPress episode slugs are built from the series
 * TITLE (no year): /series/wednesday-2022/ -> /episode/wednesday-season-1-
 * episode-1. The seasons listing on the series page is authoritative — use
 * it first; fall back to a constructed path with a year-stripped slug.
 * Returns { html, url }.
 */
function episodePageFromSeries(seriesHtml, base, seriesSlug, season, episode) {
  var seasons = parseSeriesSeasons(seriesHtml);
  var i, j;
  for (i = 0; i < seasons.length; i++) {
    if (seasons[i].season !== season) continue;
    for (j = 0; j < seasons[i].episodes.length; j++) {
      if (seasons[i].episodes[j].num === episode) {
        var slug = seasons[i].episodes[j].slug;
        var url = base + "/episode/" + slug + (slug.indexOf("/") === -1 ? "/" : "");
        return pencuriFetch(url).then(function (html) {
          return { html: html, url: url };
        });
      }
    }
  }
  var fallback = base + "/episode/" + seriesSlug.replace(/-\d{4}$/, "") +
    "-season-" + season + "-episode-" + episode + "/";
  return pencuriFetch(fallback).then(function (html) {
    return { html: html, url: fallback };
  });
}

/**
 * TMDB-keyed flow: title lookup -> site search -> best match -> page ->
 * servers + subs. `imdbKnown` short-circuits the external_ids hop.
 */
function tmdbFlow(tmdbId, type, s, e, imdbKnown) {
  return tmdbMeta(type, tmdbId).then(function (meta) {
    if (!meta || !meta.title) return [];
    var wantSeries = type === "tv" ? true : false;
    var imdbPromise = imdbKnown
      ? Promise.resolve(imdbKnown)
      : tmdbExternalImdb(type, tmdbId);
    return searchBestRow(meta.title, meta.year, wantSeries).then(function (row) {
      if (!row) {
        // one retry with the original-language title (site indexes some
        // titles natively — same trick asianhub uses)
        if (meta.original && meta.original !== meta.title) {
          return searchBestRow(meta.original, meta.year, wantSeries);
        }
        return null;
      }
      return row;
    }).then(function (row) {
      if (!row) {
        console.log("[Pencuri] site search miss for \"" + meta.title + "\"");
        return [];
      }
      var targetPath = row.isSeries
        ? "/series/" + row.slug + "/"
        : "/" + row.slug + "/";
      return pencuriFetch(targetPath).then(function (html) {
        var base = _pcState.goodBase || PENCURI_BASES[0];
        var display = (meta.title || row.title) + (meta.year ? " (" + meta.year + ")" : "");
        if (row.isSeries && s > 0 && e > 0) {
          return episodePageFromSeries(html, base, row.slug, s, e).then(function (ep) {
            return streamsFromPage(ep.html, ep.url, display, {
              mediaType: "tv", season: s, episode: e, imdbPromise: imdbPromise
            });
          });
        }
        return streamsFromPage(html, base + targetPath, display, {
          mediaType: row.isSeries ? "tv" : "movie",
          season: s || 1, episode: e || 1,
          imdbPromise: imdbPromise
        });
      });
    }).then(function (rows) {
      cachePut(_pcState.streamCache, "tmdb:" + type + ":" + tmdbId + ":" + s + ":" + e, rows);
      console.log("[Pencuri] tmdb lane -> " + (rows ? rows.length : 0) + " row(s)");
      return rows || [];
    });
  });
}

// ------------------------------------------------------------- exports

var _export = { getStreams: getStreams };

if (typeof module !== "undefined" && module.exports) {
  module.exports = _export;
  // test hooks (guarded; never used by the apps)
  module.exports.__internals = {
    parseListingRows: parseListingRows,
    parseServerTabs: parseServerTabs,
    parseSeriesSeasons: parseSeriesSeasons,
    parsePageTitle: parsePageTitle,
    unpackPacker: unpackPacker,
    resolveAllServers: resolveAllServers,
    englishSubsFor: englishSubsFor,
    searchBestRow: searchBestRow,
    parsePencuriId: parsePencuriId,
    _state: _pcState,
    _setBases: function (bases) { PENCURI_BASES.length = 0; var i; for (i = 0; i < bases.length; i++) PENCURI_BASES.push(bases[i]); }
  };
} else if (typeof globalThis !== "undefined") {
  try { globalThis.getStreams = getStreams; } catch (e) { /* noop */ }
}
