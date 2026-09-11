/**
 * Pencuri — Nuvio provider (v1.2.0)
 *
 * Paired with asian-catalog v5.4.0: the addon's Pencuri catalogs (Movies
 * /movies/ + Series /series/ + the Malaysia / Indonesia / Japan / Thailand
 * / Most Viewed / Most Rating / Top IMDb boards) from pencurimovie.baby
 * emit `tmdb:<id>` rows
 * when TMDB matches and `asian:pen-<slug>` fallback rows when it does not.
 * This plugin plays BOTH:
 *
 *   asian:pen-<slug> / asian:<slug>  -> navigate the site's real page
 *     (movie) or its real episode page (series) — zero title searching.
 *   numeric / tmdb:<id> / tt:<imdb>  -> TMDB lookup -> site search
 *     `/?s={title}` -> best title+year match -> same resolution flow.
 *
 * v1.2.0 FIXES ("still doesnt show getstream or stream links not showing,
 *   both movies and tv" — user report on 4.13.0, 2026-09-12):
 *   0. *** THE DEVICE KILLER ***: Nuvio's plugin runtime is QuickJS with
 *      NO setTimeout/clearTimeout (verified in NuvioMobile source: no
 *      timer host bindings, no timer polyfill in JsBindings.kt, no timer
 *      strings in the quickjs-kt AAR). v1.1.0's fetchText called
 *      setTimeout(...) inside the Promise executor -> ReferenceError on
 *      the device -> every fetchText threw -> EVERY lane died -> 0 rows
 *      for BOTH movies and tv. Node/datacenter tests never caught it
 *      because Node HAS timers. Every other working provider guards this
 *      (pinoyhub hasTimers(), miruro hasTimers(), zoechip/vidzee/...).
 *      fetchText now uses the repo-standard guarded pattern: with timers
 *      -> Promise.race timeout; without -> bare fetch (the native fetch
 *      bridge and the app's 60s plugin budget bound the wait).
 *   1. Dood family (dsvplay.com is the FIRST embed on most pages) now
 *      runs the full pinoyhub-proven flow instead of requiring the
 *      pass_md5 response to carry a query: embed page -> turnstile gate
 *      check -> /pass_md5/{token}/{file} (Referer + X-Requested-With) ->
 *      direct URL = base + randomToken(10) + "?token=<token>&expiry=<ms>"
 *      plus the /d/{id} download-page fallback (dref_url cookie).
 *   2. TV-safe rows: every CDN URL is probed HEADERLESS (ranged GET, no
 *      Referer); headers are attached ONLY when the CDN demands them
 *      (verified live: mxcontent.net answers 403 text/html without
 *      Referer, 206 video/mp4 with it). Nuvio parses stream.headers and
 *      ExoPlayer sends them natively on mobile.
 *   3. Stream rows now carry behaviorHints.bingeGroup (pinoyhub shape);
 *      the unknown noProbe field is gone.
 *
 * v1.1.0 FIXES ("pencuri.js dont show streamable", user report 2026-09-12):
 *   1. Nuvio passes the TAPPED EPISODE id for series — "tmdb:<id>:<s>:<e>"
 *      (MetaDetailsScreen.buildPlaybackVideoId -> content.id + ":" + s + ":"
 *      + e) — and the old /^(?:tmdb:)?(\d+)$/ regex rejected it in 0ms.
 *      Same bug class miruro 2.7.0 fixed for mal: ids. The TMDB branch now
 *      tolerates trailing :s:e / :e decorations and prefers the explicit
 *      season/episode args (Nuvio 4-arg contract), falling back to the id
 *      suffix digits only when the args are missing.
 *   2. Series rows on the live site carry a /series/ prefix in their hrefs
 *      (/series/{slug}/ — listing AND /?s= search). parseListingItems
 *      captured "series" as the slug and the skip-list dropped the row,
 *      so the search lane never matched any series -> 0 streams. Now the
 *      prefix is captured, the slug is the last segment, and the row is
 *      typed series from the href.
 *   3. resolveBySlug tries the /series/{slug}/ shape first for series taps
 *      (the old /{slug}/ 301 still works but costs a round-trip and dies
 *      if the site drops the redirect).
 *   4. asian:pen- ids with :s:e suffixes (episode ids from the addon's new
 *      detail-page metas) resolve the episode from the suffix when the app
 *      passes no season/episode args.
 *
 * Site recon (2026-09-11/12, all live):
 *   - WordPress "MovieMo" theme; listing rows are
 *     <div data-movie-id class="ml-item"> -> a.ml-mask[oldtitle="T (Year)"].
 *     Series rows carry an mli-eps "Eps N" badge (the addon types rows from
 *     it; here the PAGE decides: /episode/ links present = series).
 *   - Series pages link episodes as /episode/{base}-season-{S}-episode-{E}
 *     (base = series slug minus the trailing year, verified on
 *     boboiboy-galaxy-baraju-2025 -> boboiboy-galaxy-baraju-season-1-episode-N).
 *   - Detail/episode pages embed a tab ring of servers, one iframe per tab:
 *     dsvplay.com (DoodStream family, redirects to playmogo.com),
 *     hgcloud.to / hglink.to (JS-loader stub), mixdrop.top, voe.sx
 *     (JS-redirects to rotating domains), streamtape.com, listeamed.net,
 *     bigwarp.pro.
 *
 * Extraction lanes (verified from the datacenter where possible):
 *   1. MIXDROP   — the embed page carries a Dean Edwards packed script whose
 *                  unpacked MDCore.wurl is a direct
 *                  https://a-deliveryNN.mxcontent.net/v2/{id}.mp4?... link.
 *                  VERIFIED end-to-end here: HTTP 206, content-type
 *                  video/mp4, ISO-BMFF bytes. PRIMARY lane.
 *   2. STREAMTAPE — the embed page's #robotlink div yields the
 *                  /get_video?...&token=... path (verified token issued;
 *                  the final redirect resolves on residential egresses —
 *                  datacenter egresses get a 500 at that last hop, the row
 *                  is kept anyway: fail-open, device is the judge).
 *   3. DOOD FAMILY (dsvplay.com + friends) — the classic /pass_md5/ flow is
 *                  attempted; pages gated behind a Cloudflare Turnstile
 *                  (challenges.cloudflare.com / .captcha-player markers) are
 *                  skipped immediately so a dead lane never burns the call.
 *   4. VOE       — follows the embed's own JS redirect to its rotating
 *                  domain and searches for direct sources; best-effort.
 *   5. UNKNOWN HOSTS — a cheap page probe for inline file/m3u8 URLs.
 *   hgcloud/hglink serve a JS-only loader stub — skipped (nothing to parse).
 *
 * All lanes are fail-soft: one dead host can never zero the provider, rows
 * are deduped by URL, and every embed the page offers is attempted in
 * parallel. Hermes-safe: no unescape/escape/btoa/atob anywhere.
 *
 * getStreams(<videoId>, <"movie"|"tv"|"series"|"show">, <season?>, <episode?>)
 *   (the mediaType slot is auto-detected; legacy 3-arg calls are tolerated)
 */

var PENCURI_BASE = 'https://ww44.pencurimovie.baby';
var TMDB_API_KEY = '439c478a771f35c05022f9feabcca01c';
var UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';
var EMBED_TIMEOUT_MS = 8000;
var PAGE_TIMEOUT_MS = 10000;

function hasTimers() {
  return typeof setTimeout === 'function' && typeof clearTimeout === 'function';
}

var ENTITY_MAP = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', '#39': "'", '#039': "'", '#8216': "'", '#8217': "'", '#8220': '"', '#8221': '"' };

function decodeEntities(s) {
  return String(s == null ? '' : s)
    .replace(/&#x([0-9a-fA-F]+);/g, function (m, h) { var c = parseInt(h, 16); return isFinite(c) && c > 0 && c < 65536 ? String.fromCharCode(c) : m; })
    .replace(/&#(\d+);/g, function (m, d) { var c = parseInt(d, 10); return isFinite(c) && c > 0 && c < 65536 ? String.fromCharCode(c) : m; })
    .replace(/&([a-zA-Z#0-9]+);/g, function (m, name) { return ENTITY_MAP[name] !== undefined ? ENTITY_MAP[name] : m; });
}

function stripTags(s) { return String(s == null ? '' : s).replace(/<[^>]*>/g, ' '); }
function collapseWs(s) { return String(s == null ? '' : s).replace(/\s+/g, ' ').trim(); }

function attr(tag, name) {
  var m = String(tag || '').match(new RegExp(name + '="([^"]*)"', 'i'));
  if (!m) m = String(tag || '').match(new RegExp(name + "='([^']*)'", 'i'));
  return m ? m[1] : '';
}

function fetchRaw(url, refererOrHeaders, timeoutMs, wantMeta) {
  // v1.2.0: GUARDED timeout race — the device runtime has no timers, so
  // when hasTimers() is false we call fetch bare (the native fetch bridge
  // owns the wait; the app's 60s plugin budget is the hard cap). Calling
  // setTimeout unconditionally was the 4.13.0 zero-rows device bug.
  var headers = { 'User-Agent': UA, 'Accept': 'text/html,*/*' };
  if (refererOrHeaders) {
    if (typeof refererOrHeaders === 'string') {
      headers['Referer'] = refererOrHeaders;
    } else {
      for (var hk in refererOrHeaders) headers[hk] = refererOrHeaders[hk];
    }
  }
  var go = function () {
    return fetch(url, { headers: headers, redirect: 'follow' }).then(function (res) {
      if (!res || !res.ok) return null;
      return res.text().then(function (body) {
        return wantMeta ? { text: body, url: String(res.url || url) } : body;
      });
    }).catch(function () { return null; });
  };
  if (!hasTimers()) {
    try { return go(); } catch (e) { return Promise.resolve(null); }
  }
  return new Promise(function (resolve) {
    var done = false;
    var settle = function (v) { if (!done) { done = true; clearTimeout(timer); resolve(v); } };
    var timer = setTimeout(function () { settle(null); }, timeoutMs || PAGE_TIMEOUT_MS);
    go().then(function (v) { settle(v); }, function () { settle(null); });
  });
}

function fetchText(url, referer, timeoutMs) {
  return fetchRaw(url, referer, timeoutMs, false);
}

// redirect-aware variant for lanes that need the FINAL url (dood host
// rotation: dsvplay.com 301s to playmogo.com etc.)
function fetchTextFollow(url, referer, timeoutMs) {
  return fetchRaw(url, referer, timeoutMs, true);
}

// v1.2.0: headerless playability probe (pinoyhub pattern) — ranged GET
// with NO Referer; a text/html answer means the CDN demands headers.
function probeHeaderless(url) {
  var go = function () {
    return fetch(url, { headers: { 'User-Agent': UA, 'Range': 'bytes=0-1023' }, redirect: 'follow' })
      .then(function (res) {
        if (!res || res.status < 200 || res.status >= 300) return false;
        var ct = '';
        try { ct = String((res.headers && res.headers.get && res.headers.get('content-type')) || ''); } catch (e) { ct = ''; }
        if (/text\/html/i.test(ct)) return false; // challenge / soft-404 page
        return true;
      }).catch(function () { return false; });
  };
  if (!hasTimers()) {
    try { return go(); } catch (e) { return Promise.resolve(false); }
  }
  return new Promise(function (resolve) {
    var done = false;
    var settle = function (v) { if (!done) { done = true; clearTimeout(timer); resolve(v); } };
    var timer = setTimeout(function () { settle(false); }, 9000);
    go().then(function (v) { settle(v); }, function () { settle(false); });
  });
}

function randomToken(len) {
  var chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  var out = '';
  for (var i = 0; i < (len || 8); i++) out += chars.charAt(Math.floor(Math.random() * chars.length));
  return out;
}

// ---------------------------------------------------------------------------
// tolerant catalog-id parsing (same contract as pinoyhub/asianhub/animotvslash
// + miruro 2.7.0: Nuvio decorates ids — urlencoding, "/" separators, .json,
// episode-id suffixes). "asian:pen-<slug>" is OWNED here; foreign sources are
// skipped fast.
function parsePencuriCatalogId(rawId) {
  var s = String(rawId == null ? '' : rawId).trim();
  if (!s) return null;
  if (s.indexOf('%') >= 0) {
    try { var dec = decodeURIComponent(s); if (dec) s = dec; } catch (e) {}
  }
  s = String(s).trim();
  var h = s.indexOf('#'); if (h >= 0) s = s.slice(0, h);
  var q = s.indexOf('?'); if (q >= 0) s = s.slice(0, q);
  s = s.replace(/\.json([^.].*)?$/i, '').replace(/\.json$/i, '').trim();
  if (!s) return null;
  var m = s.match(/^asian[:\/](.+)$/i);
  if (!m) return null;
  // v1.1.0: tokens AFTER the slug are the tapped-episode decoration
  // ("pen-<slug>:1:3", "pen-<slug>/1/3") — captured as a season/episode
  // fallback for callers that receive no explicit s/e args. Only a pure
  // digit pair counts (never "slug/2026" -> E2026).
  var toks = m[1].split(/[:\/]/);
  var tail = toks[0].trim().toLowerCase();
  var decS = /^\d+$/.test(toks[1] || '') && /^\d+$/.test(toks[2] || '') ? parseInt(toks[1], 10) : 0;
  var decE = decS > 0 ? parseInt(toks[2], 10) : 0;
  if (!tail || !/^[a-z0-9][a-z0-9-]*$/i.test(tail)) return null;
  var pm = tail.match(/^(pen)-([a-z0-9][a-z0-9-]*)$/);
  if (pm) {
    if (!pm[2]) return null;
    return {
      source: pm[1], slug: pm[2],
      season: decS,
      episode: decE
    };
  }
  // foreign source-scoped rows (ks/va/pmh/kh/an-...) -> not ours
  if (/^(ks|va|pmh|kh|an)-/.test(tail)) return { source: 'foreign', slug: '' };
  return {
    source: '', slug: tail, // legacy generic asian:<slug>
    season: decS,
    episode: decE
  };
}

// ---------------------------------------------------------------------------
// site page resolution

function slugBase(slug) {
  // "boboiboy-galaxy-baraju-2025" -> "boboiboy-galaxy-baraju" (episode slugs
  // drop the year; verified live). Non-year slugs pass through.
  var m = String(slug || '').match(/^(.*?)-\d{4}$/);
  return m ? m[1] : String(slug || '');
}

function collectEpisodeLinks(html) {
  var out = [], seen = {}, re = /href="(?:https?:\/\/[^"]*)?(\/episode\/[a-z0-9-]+)\/?"/gi, m;
  while ((m = re.exec(html)) !== null) {
    var ep = m[1].replace(/^\/episode\//, '');
    if (!seen[ep]) { seen[ep] = 1; out.push(ep); }
  }
  return out;
}

function parseEpisodeSlug(epSlug) {
  var m = String(epSlug).match(/^(.*)-season-(\d+)-episode-(\d+)$/i);
  if (m) return { season: parseInt(m[2], 10) || 1, episode: parseInt(m[3], 10) || 1, base: m[1] };
  m = String(epSlug).match(/^(.*)-episode-(\d+)$/i);
  if (m) return { season: 1, episode: parseInt(m[2], 10) || 1, base: m[1] };
  return null;
}

function pickEpisodeLink(epLinks, season, episode) {
  var wantEp = parseInt(episode, 10) || 1;
  var wantSe = parseInt(season, 10) || 1;
  var exact = null, anyEp = null, first = null;
  for (var i = 0; i < epLinks.length; i++) {
    var p = parseEpisodeSlug(epLinks[i]);
    if (!p) continue;
    if (!first) first = epLinks[i];
    if (p.episode === wantEp) {
      if (!anyEp) anyEp = epLinks[i];
      if (p.season === wantSe) { exact = epLinks[i]; break; }
    }
  }
  return exact || anyEp || first;
}

// every /e/{id} embed iframe on a detail/episode page
function collectEmbeds(html) {
  var out = [], seen = {}, re = /(?:data-src|src)="(https?:\/\/[^"']+\/e\/[a-z0-9]+)"/gi, m;
  while ((m = re.exec(html)) !== null) {
    var url = m[1].replace(/^http:\/\//i, 'https://');
    if (!seen[url]) { seen[url] = 1; out.push(url); }
  }
  return out;
}

function isSeriesPage(html) {
  return /\/episode\/[a-z0-9-]+-season-\d+-episode-\d+/i.test(html) ||
    /\/episode\/[a-z0-9-]+-episode-\d+/i.test(html);
}

// ---------------------------------------------------------------------------
// HOST LANES — each returns Promise<row|null> and never rejects.

function makeRow(url, hostLabel, quality, headers) {
  var q = String(quality || '');
  var name = 'Pencuri | ' + hostLabel + (q ? ' | ' + q : '');
  // v1.2.0: pinoyhub-style row — behaviorHints carried, the unknown
  // noProbe field dropped; headers attached ONLY when the CDN needs them.
  var row = { name: name, title: name, url: url, quality: q, behaviorHints: { bingeGroup: 'pencuri-direct' } };
  if (headers) row.headers = headers;
  return row;
}

function qualityFromText(s) {
  var m = String(s || '').match(/(\d{3,4})\s*p/i);
  if (!m) return '';
  var n = parseInt(m[1], 10);
  if (n >= 2160) return '4K';
  if (n >= 1440) return '1440p';
  if (n >= 1000) return '1080p';
  if (n >= 640) return '720p';
  if (n >= 400) return '480p';
  return '';
}

// --- lane 1: mixdrop (verified datacenter-playable direct mp4) --------------
function unpackPackedScript(html) {
  var m = String(html || '').match(/eval\(function\(p,a,c,k,e,[a-z]?\)\{[\s\S]*?\}\('([\s\S]*?)',(\d+),(\d+),'([\s\S]*?)'\.split\('\|'\)/);
  if (!m) return '';
  var p = m[1].replace(/\\'/g, "'").replace(/\\\\/g, '\\');
  var k = m[4].split('|');
  return p.replace(/\b(\d+)\b/g, function (tok, n) {
    var idx = parseInt(n, 10);
    if (!isFinite(idx) || idx >= k.length) return tok;
    return k[idx];
  });
}

function mixdropExtract(embedUrl) {
  var hostLabel = 'MixDrop';
  return fetchText(embedUrl, PENCURI_BASE + '/', EMBED_TIMEOUT_MS).then(function (html) {
    if (!html) return null;
    var unpacked = unpackPackedScript(html);
    if (!unpacked) return null;
    var wurl = unpacked.match(/MDCore\.wurl\s*=\s*"([^"]+)"/);
    if (!wurl || !wurl[1]) return null;
    var path = wurl[1].replace(/^\/\//, '');
    var url = /^https?:\/\//i.test(path) ? path : 'https://' + path;
    var q = qualityFromText(unpacked);
    // v1.2.0: mxcontent.net 403s text/html without Referer and 206s with it
    // (verified live) — probe headerless, attach headers only on demand.
    return probeHeaderless(url).then(function (ok) {
      return makeRow(url, hostLabel, q, ok ? '' : { Referer: 'https://mixdrop.top/', 'User-Agent': UA });
    });
  }).catch(function () { return null; });
}

// --- lane 2: streamtape (token verified; final hop resolves device-side) ----
function streamtapeExtract(embedUrl) {
  return fetchText(embedUrl, PENCURI_BASE + '/', EMBED_TIMEOUT_MS).then(function (html) {
    if (!html) return null;
    // shape 1 (observed live): the div carries the FULL /get_video path
    var m = html.match(/id="robotlink"[^>]*>(\s*\/[\w.-]+\/get_video\?[^<\s]+)/i);
    var path = m ? m[1].trim() : '';
    // shape 2 (classic): div has the rotation part; innerHTML appends the rest
    if (!path) {
      var divm = html.match(/id="robotlink"[^>]*>([^<]*)</i);
      var expr = html.match(/getElementById\("robotlink"\)\.innerHTML\s*=\s*([^;]+);/i);
      if (divm && expr) {
        // eval-FREE: concatenate the string literals in the expression
        var parts = [], lm, lre = /'([^']*)'|"([^"]*)"/g;
        while ((lm = lre.exec(expr[1])) !== null) parts.push(lm[1] || lm[2] || '');
        // obfuscated hex additions resolve to numbers — ignore them; the
        // div text + literals reconstruct the token tail on modern pages
        path = divm[1] + parts.join('');
      }
    }
    if (!path || path.indexOf('get_video') < 0) return null;
    if (path.indexOf('//') === 0) return makeRow('https:' + path, 'Streamtape', '', '');
    if (/^https?:\/\//i.test(path)) return makeRow(path, 'Streamtape', '', '');
    return makeRow('https://' + path.replace(/^\//, ''), 'Streamtape', '', '');
  }).catch(function () { return null; });
}

// --- lane 3: dood family (dsvplay/playmogo/...) — the pinoyhub-proven
// flow. v1.2.0 no longer requires the /pass_md5/ response to carry a
// query: the token from the path + a random tail + expiry IS the
// authorization on most Dood nodes (verified pattern from pinoyhub.js,
// device-proven since 5.5.0). Turnstile-gated pages stay skipped.
var DOOD_HOST_RE = /(^|\.)(dsvplay\.com|dsvplayz?\.com|playmogo\.com|dood\.[a-z.]+|doodstream\.com|ds2play\.com|d000d\.com|d000g\.com|dsvtbs\.com)$/i;

function doodIsGated(html) {
  // Cloudflare Turnstile interstitial: a pure HTTP client never passes.
  return /op=validate|turnstile\.render|challenges\.cloudflare\.com\/turnstile|captcha-player|g-recaptcha/i.test(html);
}

function doodIsDead(html) {
  return /video you are looking for is not found|class="not_found"/i.test(html);
}

function doodFindMd5Path(html) {
  var m = String(html || '').match(/['"]\/(pass_md5\/[a-z0-9]+(?:\/[a-z0-9]+)?)['"]/i);
  if (!m) {
    var unpacked = unpackPackedScript(html);
    if (unpacked) m = unpacked.match(/['"]\/(pass_md5\/[a-z0-9]+(?:\/[a-z0-9]+)?)['"]/i);
  }
  if (m) return m[1];
  m = String(html || '').match(/\/pass_md5\/([a-z0-9]+)/i);
  return m ? 'pass_md5/' + m[1] : null;
}

function doodFromMd5Path(host, md5Path, refererUrl, q, hostLabel) {
  var passUrl = 'https://' + host + '/' + md5Path;
  return fetchText(passUrl, { Referer: refererUrl, 'X-Requested-With': 'XMLHttpRequest', 'User-Agent': UA }, EMBED_TIMEOUT_MS).then(function (body) {
    var base = String(body || '').trim();
    if (base.indexOf('http') !== 0 || base.length > 300) return null;
    var token = md5Path.split('/')[1] || '';
    var expiry = Date.now() + 2 * 60 * 60 * 1000;
    var directUrl = base + randomToken(10) + '?token=' + token + '&expiry=' + expiry;
    return probeHeaderless(directUrl).then(function (ok) {
      return makeRow(directUrl, hostLabel, q, ok ? '' : { Referer: 'https://' + host + '/', 'User-Agent': UA });
    });
  }).catch(function () { return null; });
}

function doodExtract(embedUrl) {
  var idm = String(embedUrl).match(/\/e\/([a-z0-9]+)/i);
  var embedId = idm ? idm[1] : '';
  return fetchTextFollow(embedUrl, PENCURI_BASE + '/', EMBED_TIMEOUT_MS).then(function (page) {
    if (!page || !page.text) return null;
    var html = page.text;
    var fm = String(page.url || embedUrl).match(/^https?:\/\/([^\/]+)/i);
    var host = fm ? fm[1].replace(/^www\./, '') : (String(embedUrl).match(/^https?:\/\/([^\/]+)/i) || ['', ''])[1];
    var hostLabel = 'Dood (' + host + ')';
    if (doodIsGated(html)) return null;
    if (doodIsDead(html)) return null;
    var title = html.match(/<title[^>]*>([^<]*)<\/title>/i);
    var q = qualityFromText(title ? title[1] : '');
    var md5Path = doodFindMd5Path(html);
    if (md5Path) return doodFromMd5Path(host, md5Path, 'https://' + host + '/e/' + (embedId || 'x'), q, hostLabel);
    // legacy /d/{id} download-page fallback (dref_url cookie set client-side)
    if (!embedId) return null;
    var embedAbs = 'https://' + host + '/e/' + embedId;
    return fetchTextFollow('https://' + host + '/d/' + embedId, { Referer: embedAbs, Cookie: 'dref_url=' + encodeURIComponent(embedAbs), 'User-Agent': UA }, EMBED_TIMEOUT_MS).then(function (dl) {
      if (!dl || !dl.text || doodIsGated(dl.text)) return null;
      var fm2 = String(dl.url || embedUrl).match(/^https?:\/\/([^\/]+)/i);
      var dlHost = fm2 ? fm2[1].replace(/^www\./, '') : host;
      var md5Path2 = doodFindMd5Path(dl.text);
      if (!md5Path2) return null;
      return doodFromMd5Path(dlHost, md5Path2, 'https://' + dlHost + '/d/' + embedId, q, 'Dood (' + dlHost + ')');
    });
  }).catch(function () { return null; });
}

// --- lane 4: voe (follow the embed's own JS redirect, best-effort) ----------
function voeExtract(embedUrl) {
  return fetchText(embedUrl, PENCURI_BASE + '/', EMBED_TIMEOUT_MS).then(function (html) {
    if (!html) return null;
    var follow = html.match(/window\.location\.href\s*=\s*'(https?:\/\/[^']+)'/);
    if (follow && follow[1] && follow[1].indexOf(embedUrl) < 0) {
      return fetchText(follow[1], PENCURI_BASE + '/', EMBED_TIMEOUT_MS).then(function (real) {
        return real ? voeParseReal(real, embedUrl) : null;
      });
    }
    return voeParseReal(html, embedUrl);
  }).catch(function () { return null; });
}

function voeParseReal(html, embedUrl) {
  // direct file markers first, then packed-script unpack, then \x-sourced
  var m = html.match(/["']file["']\s*:\s*["']([^"']+\.(?:m3u8|mp4)[^"']*)["']/i) ||
    html.match(/hls\s*:\s*["']([^"']+\.m3u8[^"']*)["']/i);
  if (!m) {
    var unpacked = unpackPackedScript(html);
    if (unpacked) html = unpacked;
    m = html.match(/["']file["']\s*:\s*["']([^"']+\.(?:m3u8|mp4)[^"']*)["']/i) ||
      html.match(/https?:\/\/[^"'\s]+\.m3u8[^"'\s]*/i);
  }
  if (!m) return null;
  var url = m[1] || m[0];
  if (!/^https?:\/\//i.test(url)) return null;
  var host = String(embedUrl).replace(/^https?:\/\//i, '').split('/')[0];
  var q = qualityFromText(html);
  return probeHeaderless(url).then(function (ok) {
    return makeRow(url, 'Voe', q, ok ? '' : { Referer: 'https://' + host + '/', 'User-Agent': UA });
  });
}

// --- lane 5: unknown hosts — cheap inline probe -----------------------------
function genericExtract(embedUrl) {
  var hm = String(embedUrl).match(/^https?:\/\/([^\/]+)/i);
  var label = hm ? hm[1].replace(/^www\./, '') : 'Embed';
  return fetchText(embedUrl, PENCURI_BASE + '/', EMBED_TIMEOUT_MS).then(function (html) {
    if (!html) return null;
    if (/challenges\.cloudflare\.com|captcha-player|turnstile/i.test(html)) return null;
    var m = html.match(/["']file["']\s*:\s*["']([^"']+\.(?:m3u8|mp4)[^"']*)["']/i) ||
      html.match(/https?:\/\/[^"'\s]+\.m3u8[^"'\s]*/i);
    if (!m) return null;
    var url = m[1] || m[0];
    if (!/^https?:\/\//i.test(url)) return null;
    var q5 = qualityFromText(html);
    return probeHeaderless(url).then(function (ok) {
      return makeRow(url, label, q5, ok ? '' : { Referer: embedUrl, 'User-Agent': UA });
    });
  }).catch(function () { return null; });
}

function extractEmbed(embedUrl) {
  var u = String(embedUrl);
  if (/mixdrop/i.test(u)) return mixdropExtract(u);
  if (/streamtape/i.test(u)) return streamtapeExtract(u);
  if (DOOD_HOST_RE.test(u.replace(/^https?:\/\//i, '').split('/')[0])) return doodExtract(u);
  if (/voe\.[a-z]+|johnfullwonder|audaciouslily/i.test(u)) return voeExtract(u);
  return genericExtract(u);
}

// ---------------------------------------------------------------------------
// resolve a movie/series page into rows

function dedupeRows(rows) {
  var seen = {}, out = [];
  for (var i = 0; i < rows.length; i++) {
    var r = rows[i];
    if (!r || !r.url) continue;
    var key = String(r.url).replace(/[#?].*$/, '');
    if (seen[key]) continue;
    seen[key] = 1;
    out.push(r);
  }
  // keep same-host multi-file pairs (different ids) — they differ by URL;
  // label the later duplicates per host so the user can tell them apart
  var perHost = {};
  for (var j = 0; j < out.length; j++) {
    var hm = out[j].name.split(' | ')[1] || 'Embed';
    perHost[hm] = (perHost[hm] || 0) + 1;
    if (perHost[hm] > 1) {
      out[j].name = out[j].title = out[j].name + ' #' + perHost[hm];
    }
  }
  return out;
}

function resolvePageRows(html) {
  var embeds = collectEmbeds(html);
  if (!embeds.length) return Promise.resolve([]);
  return Promise.all(embeds.map(function (u) {
    return extractEmbed(u).catch(function () { return null; });
  })).then(function (rows) {
    return dedupeRows(rows);
  });
}

function resolveFromDetail(html, slug, season, episode, pageUrl) {
  if (isSeriesPage(html)) {
    var epLinks = collectEpisodeLinks(html);
    if (epLinks.length) {
      var want = parseInt(episode, 10) || 1;
      var epSlug = pickEpisodeLink(epLinks, season, want);
      if (!epSlug) {
        // construct the canonical shape as a last resort (verified pattern)
        epSlug = slugBase(slug) + '-season-' + (parseInt(season, 10) || 1) + '-episode-' + want;
      }
      var epUrl = PENCURI_BASE + '/episode/' + epSlug;
      return fetchText(epUrl, pageUrl, PAGE_TIMEOUT_MS).then(function (epHtml) {
        if (!epHtml) {
          // fall back to the season-less shape before giving up
          var alt = PENCURI_BASE + '/episode/' + slugBase(slug) + '-episode-' + (parseInt(episode, 10) || 1);
          return fetchText(alt, pageUrl, PAGE_TIMEOUT_MS).then(function (altHtml) {
            return altHtml ? resolvePageRows(altHtml) : [];
          });
        }
        return resolvePageRows(epHtml);
      });
    }
  }
  return resolvePageRows(html);
}

// v1.1.0: series detail pages live at /series/{slug}/ (the bare /{slug}/
// shape only 301s — a round-trip that dies if the site drops the redirect).
// hintSeries (from the mediaType arg, explicit s/e, or the search row's own
// type) picks which shape goes first; the other is always tried on failure.
function resolveBySlug(slug, season, episode, hintSeries) {
  var seriesUrl = PENCURI_BASE + '/series/' + slug + '/';
  var plainUrl = PENCURI_BASE + '/' + slug + '/';
  var firstUrl = hintSeries ? seriesUrl : plainUrl;
  var secondUrl = hintSeries ? plainUrl : seriesUrl;
  function looksAlive(html) {
    return !!html && (collectEmbeds(html).length > 0 ||
      collectEpisodeLinks(html).length > 0 || isSeriesPage(html));
  }
  return fetchText(firstUrl, PENCURI_BASE + '/', PAGE_TIMEOUT_MS).then(function (html) {
    if (looksAlive(html)) return resolveFromDetail(html, slug, season, episode, firstUrl);
    return fetchText(secondUrl, PENCURI_BASE + '/', PAGE_TIMEOUT_MS).then(function (html2) {
      return looksAlive(html2) ? resolveFromDetail(html2, slug, season, episode, secondUrl) : [];
    });
  }).catch(function () {
    return fetchText(secondUrl, PENCURI_BASE + '/', PAGE_TIMEOUT_MS).then(function (html2) {
      return looksAlive(html2) ? resolveFromDetail(html2, slug, season, episode, secondUrl) : [];
    }).catch(function () { return []; });
  });
}

// ---------------------------------------------------------------------------
// TMDB-keyed path: numeric / tmdb: / tt: ids

function normalizeTitle(s) {
  return collapseWs(String(s || '').toLowerCase())
    .replace(/[\u2019\u2018']/g, '')
    .replace(/[^a-z0-9 ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function titleScore(a, b) {
  var na = normalizeTitle(a), nb = normalizeTitle(b);
  if (!na || !nb) return 0;
  if (na === nb) return 1;
  if (na.indexOf(nb) === 0 || nb.indexOf(na) === 0) return 0.85;
  if (na.indexOf(nb) >= 0 || nb.indexOf(na) >= 0) return 0.7;
  var wa = na.split(' '), wb = nb.split(' '), hit = 0;
  for (var i = 0; i < wa.length; i++) {
    if (wb.indexOf(wa[i]) >= 0) hit++;
  }
  return wb.length ? hit / wb.length : 0;
}

function tmdbFetch(kind, id) {
  var url = 'https://api.themoviedb.org/3/' + kind + '/' + encodeURIComponent(id) +
    '?api_key=' + TMDB_API_KEY + '&language=en-US';
  return fetchText(url, null, PAGE_TIMEOUT_MS).then(function (body) {
    if (!body) return null;
    try { return JSON.parse(body); } catch (e) { return null; }
  });
}

function parseListingItems(html) {
  // same markup as the addon's parser: data-movie-id -> ml-mask[oldtitle].
  // v1.1.0: series rows href /series/{slug}/ (listing + search, verified
  // live) — capture the optional prefix, slug is the LAST segment, and the
  // prefix pins the series type.
  var items = [], seen = {};
  var chunks = String(html || '').split(/<div data-movie-id="\d+"[^>]*class="ml-item/);
  for (var i = 1; i < chunks.length; i++) {
    var body = chunks[i].length > 4000 ? chunks[i].slice(0, 4000) : chunks[i];
    var a = body.match(/<a href="https?:\/\/[^"]*pencurimovie\.baby\/((?:series|movies)\/)?([a-z0-9][a-z0-9-]*)\/"[^>]*oldtitle="([^"]+)"/i);
    if (!a) continue;
    var prefix = a[1] ? a[1].replace(/\/+$/, '').toLowerCase() : '';
    var slug = a[2];
    if (/^(feed|list-mode|page|wp-json|request-movie|genre|country|series|movies|episode|release|release-year|most|top|search|tag)$/.test(slug)) continue;
    var key = prefix + ':' + slug;
    if (seen[key]) continue;
    seen[key] = 1;
    var title = collapseWs(stripTags(decodeEntities(a[3] || '')));
    var year = '';
    var ym = title.match(/\s*\((\d{4})\)\s*$/);
    if (ym) { year = ym[1]; title = title.replace(/\s*\((\d{4})\)\s*$/, ''); }
    var em = body.match(/class="mli-eps"[\s\S]{0,80}Eps\s*<i>\s*(\d+)/i);
    var isSeries = prefix === 'series' || !!em;
    items.push({ slug: slug, title: title, year: year, type: isSeries ? 'series' : 'movie' });
  }
  return items;
}

function searchSiteByTitle(title) {
  var url = PENCURI_BASE + '/?s=' + encodeURIComponent(String(title || '').trim());
  return fetchText(url, PENCURI_BASE + '/', PAGE_TIMEOUT_MS).then(function (html) {
    return html ? parseListingItems(html) : [];
  });
}

function resolveByTmdb(kind, id, season, episode) {
  return tmdbFetch(kind, id).then(function (info) {
    if (!info) return [];
    var title = info.name || info.title || info.original_name || info.original_title || '';
    var year = String((info.release_date || info.first_air_date || '')).slice(0, 4);
    return searchSiteByTitle(title).then(function (items) {
      var best = null, bestScore = 0;
      for (var i = 0; i < items.length; i++) {
        var s = titleScore(items[i].title, title);
        if (year && items[i].year) {
          if (items[i].year === year) s += 0.15;
          else if (Math.abs(parseInt(items[i].year, 10) - parseInt(year, 10)) <= 1) s += 0.05;
          else s -= 0.2;
        }
        if (s > bestScore) { bestScore = s; best = items[i]; }
      }
      if (!best || bestScore < 0.6) return [];
      return resolveBySlug(best.slug, season, episode, best.type === 'series');
    });
  }).catch(function () { return []; });
}

// ---------------------------------------------------------------------------
// entry

function getStreams(videoId, mediaType, season, episode) {
  // mediaType-slot detection (mirrors animotvslash/miruro 2.7.0): the 4-arg
  // Nuvio contract is (id, type, season, episode); legacy 3-arg callers pass
  // (id, season, episode) — never let the slots shift.
  var mtSlot = String(mediaType == null ? '' : mediaType).toLowerCase();
  if (mtSlot !== 'movie' && mtSlot !== 'tv' && mtSlot !== 'series' &&
    mtSlot !== 'show' && mtSlot !== 'tv_show' && mtSlot !== 'tvshow') {
    if (mediaType !== undefined && mediaType !== null && mtSlot !== '') {
      episode = season;
      season = mediaType;
      mediaType = undefined;
    }
  }
  var idStr = String(videoId == null ? '' : videoId).trim();
  if (!idStr) return Promise.resolve([]);
  if (idStr.indexOf('%') >= 0) {
    try { var dec = decodeURIComponent(idStr); if (dec) idStr = String(dec).trim(); } catch (e) {}
  }
  console.log('[Pencuri] start ' + idStr + (mediaType ? ' (' + mediaType + ')' : '') +
    ' S' + (parseInt(season, 10) || 1) + 'E' + (parseInt(episode, 10) || 1));

  var argSeason = parseInt(season, 10) > 0 ? parseInt(season, 10) : 0;
  var argEpisode = parseInt(episode, 10) > 0 ? parseInt(episode, 10) : 0;
  var hintSeries = mtSlot === 'tv' || mtSlot === 'series' || mtSlot === 'show' ||
    mtSlot === 'tv_show' || mtSlot === 'tvshow';

  var catalog = parsePencuriCatalogId(idStr);
  if (catalog) {
    if (catalog.source === 'foreign' || !catalog.slug) {
      console.log('[Pencuri] foreign asian: id -> skipping');
      return Promise.resolve([]);
    }
    // v1.1.0: episode-id suffixes on pen ids ("asian:pen-<slug>:1:3") carry
    // the tapped s/e when the app passes no explicit args.
    var catS = argSeason > 0 ? argSeason : catalog.season;
    var catE = argEpisode > 0 ? argEpisode : catalog.episode;
    var catHint = hintSeries || catS > 0 || catE > 0;
    return resolveBySlug(catalog.slug, catS, catE, catHint);
  }

  // v1.1.0: tolerate tapped-episode decorations ("tmdb:<id>:<s>:<e>",
  // ":<e>" single, "/"-separated) — the old strict regex rejected the exact
  // id Nuvio passes for every TMDB-meta series episode tap
  // (buildPlaybackVideoId -> content.id + ":" + s + ":" + e).
  var tmParts = idStr.replace(/^tmdb:/i, '').split(/[:\/]/);
  if (/^\d+$/.test(tmParts[0])) {
    var tmm = tmParts[0];
    var decS = tmParts.length >= 3 ? (parseInt(tmParts[1], 10) || 0) : 0;
    var decE = tmParts.length >= 2 ? (parseInt(tmParts[tmParts.length - 1], 10) || 0) : 0;
    var useS = argSeason > 0 ? argSeason : decS;
    var useE = argEpisode > 0 ? argEpisode : decE;
    var isTv = mediaType ? (mtSlot === 'tv' || mtSlot === 'series' || mtSlot === 'show' ||
      mtSlot === 'tv_show' || mtSlot === 'tvshow') : true;
    var kind = isTv ? 'tv' : 'movie';
    // try the requested kind, then the other (site rows are typed by badge
    // but TMDB ids arrive from the addon with the catalog's type)
    return resolveByTmdb(kind, tmm, useS, useE).then(function (rows) {
      if (rows.length) return rows;
      return resolveByTmdb(kind === 'tv' ? 'movie' : 'tv', tmm, useS, useE);
    });
  }

  var im = idStr.match(/^tt(\d+)/i);
  if (im) {
    var ttS = argSeason > 0 ? argSeason : (tmParts.length >= 3 ? (parseInt(tmParts[1], 10) || 0) : 0);
    var ttE = argEpisode > 0 ? argEpisode : (tmParts.length >= 2 ? (parseInt(tmParts[tmParts.length - 1], 10) || 0) : 0);
    var findUrl = 'https://api.themoviedb.org/3/find/tt' + im[1] +
      '?api_key=' + TMDB_API_KEY + '&external_source=imdb_id';
    return fetchText(findUrl, null, PAGE_TIMEOUT_MS).then(function (body) {
      if (!body) return [];
      var data = null;
      try { data = JSON.parse(body); } catch (e) { return []; }
      var mv = data && data.movie_results && data.movie_results[0];
      var tv = data && data.tv_results && data.tv_results[0];
      if (mv && mv.id) return resolveByTmdb('movie', mv.id, ttS, ttE);
      if (tv && tv.id) return resolveByTmdb('tv', tv.id, ttS, ttE);
      return [];
    });
  }

  // bare slug-ish id (stale caches): strip any numeric decorations first
  var slugish = idStr.replace(/(?:[:\/]\d+)+$/, '');
  if (/^[a-z0-9][a-z0-9-]*$/i.test(slugish)) {
    return resolveBySlug(slugish.toLowerCase(), season, episode, hintSeries || argEpisode > 0);
  }
  return Promise.resolve([]);
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { getStreams: getStreams };
} else if (typeof global !== 'undefined') {
  global.getStreams = getStreams;
}
