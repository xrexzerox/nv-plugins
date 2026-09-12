/**
 * Asian Catalog — Stremio-protocol catalog addon engine (v5.1.0)
 *
 * v5.1.0 (2026-09-11, user report "Anikoto latest episode — Though I am an
 * Inept Villainess S1 E9 — still comes up empty"):
 *
 * ROOT CAUSE (verified live while the report came in): the /meta/mal/{id}
 * resource depended on Jikan, and Jikan's upstream (myanimelist.net) was
 * having a full outage for exactly these ids:
 *   GET /v4/anime/61240        -> HTTP 200 body {"status":500,
 *        "type":"UpstreamException","message":"Request to MyAnimeList.net
 *        timed out ..."}   (a 200-wrapped failure the old code treated as
 *        data -> meta null -> 404 -> EMPTY DETAILS PAGE)
 *   GET /v4/anime/61240/episodes -> HTTP 504 (old code: throw -> 502 ->
 *        EMPTY DETAILS PAGE)
 * The Anikoto API itself was perfectly healthy for the same show
 * (/series/8952 = full episode list incl. the brand-new E9).
 *
 * FIXES:
 *   1. Jikan failure-shape hardening: HTTP errors AND 200-wrapped
 *      UpstreamException/MAL-timeout bodies are treated as failures, with
 *      ONE paced retry (upstream MAL timeouts are often transient), then
 *      null - never a thrown rejection.
 *   2. Anikoto fallback for mal: meta: the addon builds a mal_id -> anikoto
 *      series-id reverse map from the feed pages it already scans for the
 *      sections (cached; 6 pages = ~300 most-recent rows). /meta/mal/{id}
 *      now fetches Jikan AND the mapped Anikoto /series in parallel:
 *        - EPISODES prefer the Anikoto list (freshest for airing shows - the
 *          newest episode appears the day Anikoto adds it, no MAL lag), with
 *          Jikan episode pages as fallback and the episode-count placeholder
 *          as the last resort.
 *        - DETAILS prefer Jikan (richer artwork/description/score), filling
 *          every gap (name/poster/description/year/status/score/genres/
 *          background) from the Anikoto series data when Jikan is down.
 *      Result: the details page renders even during full MAL/Jikan outages.
 *
 * v5.0.0 (2026-09-11, user request "update the asian-catalog fully support
 * anilist mal kitsu so that miruro will work" + anikoto sections):
 *
 * 1. FIVE NEW ANIME SECTIONS from the Anikoto API (https://anikotoapi.site,
 *    the library MegaPlay documents for its /stream/s-2/{aniwatch-ep-id}
 *    route and the same library/ID system as HiAnime). The user enumerated
 *    them 1:1: Latest Episode / Upcoming Anime / New Release / New Added /
 *    Just Completed. The API only exposes /recent-anime, so the sections are
 *    derived from the feed's own row fields (verified live 2026-09-11:
 *    every row carries status/year/mal_id/ani_id):
 *      Latest Episode -> feed order (the daily episode-update stream)
 *      New Release    -> year == current year AND status "Currently Airing"
 *      New Added      -> highest anikoto ids first (library addition order)
 *      Upcoming Anime -> status "Not yet aired"
 *      Just Completed -> status "Finished Airing"
 *    Feed pages are scanned up to ANIKOTO_MAX_PAGES (10 = 500 rows) so the
 *    60 req/120s Anikoto rate limit is respected on first browse.
 *
 * 2. ANIME IDS FOR THE PAIRED PLUGINS (this is the "so that miruro will
 *    work" half): anikoto rows DO NOT go through TMDB matching. Each row
 *    emits the anime id the feed provides:
 *      mal_id  -> "mal:{id}"      ( MegaPlay /stream/mal/{id}/{ep}/{lang} )
 *      ani_id  -> "anilist:{id}"  ( MegaPlay /stream/ani/... + pipe lane )
 *      neither -> "anikoto:{id}"  ( miruro 2.4.0 resolves via /series/{id}
 *                                   and drives MegaPlay /stream/s-2/... )
 *    Nuvio passes unknown-prefix ids to plugins VERBATIM (verified in
 *    NuvioMobile PluginContentIds/ensureTmdbId), so miruro.js 2.4.0+ reads
 *    these prefixes directly. All 50 sampled feed rows carry mal_id.
 *
 * 3. NEW /meta/{type}/{id}.json RESOURCE so the details screen works for
 *    the anime ids (previously only catalog rows existed and non-TMDB ids
 *    could not open a details page at all):
 *      "mal:{id}"     -> Jikan /anime/{id} (+ episode pages 1..3)
 *      "anikoto:{id}" -> Anikoto /series/{id} (anime + full episode list)
 *    Videos use flat anime numbering (season 1, episode N) which matches
 *    MegaPlay's episode routes exactly. tmdb:/asian: meta requests answer
 *    404 on purpose — Nuvio's own TMDB fallback already resolves those.
 *
 * v4.1.0 (2026-09-10, deployed-worker status "degraded: kisskh 403"):
 * the deployed CF worker confirmed kisskh.co/.ovh/.nl ALL Cloudflare-403
 * from the worker's datacenter egress (free CORS proxies were probed too —
 * allorigins/codetabs/r.jina.ai/cors.lol/whateverorigin either receive the
 * same challenge page or error out; clone domains kisskh.org/.asia/.cc are
 * unrelated WordPress sites, not the real API). Instead of serving 7 EMPTY
 * KissKH catalogs, each section now falls back to a TMDB-curated rescue
 * list that mirrors the section's intent, with full metadata and real
 * `tmdb:` ids the paired plugins already resolve on-device (kisskh.js strips
 * the prefix, TMDB->title, searches kisskh over the device's residential
 * egress — the lane that works). When any mirror IS reachable the rescue is
 * never consulted. /health reports sources.kisskh.mode = 'api' |
 * 'tmdb-rescue' so the operator can tell the two apart.
 *
 * v4.0.0 (2026-09-10, user request): the catalog directory now mirrors the
 * REAL sections of each source website (the user enumerated them 1:1 from
 * the sites' home pages / nav menus). All paths below were fetched and
 * verified live on 2026-09-10.
 *
 * SOURCES & SECTIONS (user list -> implementation)
 * ────────────────────────────────────────────────────────────────────────
 * 1. pinoymovieshub.win  — WordPress/Dooplay HTML scrape
 *    MIRROR CHECK (user request "examine the website so that we have the
 *    right mirror"): pinoymovieshub.win is the canonical mirror (HTTP 200).
 *    pinoymovieshub.tv 301-redirects to .win; .org is CF-403 from all
 *    egresses; .ph/.net/.com/.es/.site/.cc/.me are dead. => .win stays.
 *    Sections:
 *      NEW RELEASES          -> home featured carousel (#featured-titles,
 *                               carries poster + rating + year; split into
 *                               movie/series catalogs because Stremio rows
 *                               are single-typed)
 *      Recently Added Movies -> /movies/          (paginated)
 *      Series                -> /series/          (paginated)
 *      Featured              -> /genre/featured   (paginated /page/N)
 *      Coming Soon           -> /genre/coming-soon
 *      Action..Wattpad Presents (17 chips) -> /genre/{slug}, incl. the
 *                               site's own label mapping "Rated R" ->
 *                               /genre/sexy and "Wattpad Presents" ->
 *                               /genre/wattpad (verified: those are the
 *                               see-all targets of the home sections)
 *
 * 2. kissasian.cam — WordPress "dramastream" HTML scrape
 *      Hot Series Update     -> home .hothome block (article.stylefor rows,
 *                               episode links deduped to series); deeper
 *                               pages continue on /series/?order=update
 *      Latest Release        -> /series/?status=&type=&order=update
 *                               (the section's own "View All" URL, verified)
 *      Fantasy/Friendship/Law/Romance/Sports -> /genres/{slug}/ (the home
 *                               "Recommendation" tabs; friendship/law/
 *                               sports archives verified 200 even though
 *                               they are not in the nav menu)
 *
 * 3. viewasian.lol — WordPress "viewasian" HTML scrape
 *      Recently Drama, Movie and Kshow -> home recent list (the section
 *                               heading on the home page is exactly this).
 *      (The nav's /movies-list/ and /kshows/ pages were probed and return
 *      IDENTICAL row sets — both are just "recently added" lists on this
 *      site, so they would only duplicate rows and were not added.)
 *
 * 4. kisskh — JSON API (kisskh.nl -> kisskh.ovh -> kisskh.co rotation).
 *    Datacenter egresses are Cloudflare-challenged (verified 403 from the
 *    DEPLOYED worker on 2026-09-10 — no transport lane exists from that
 *    runtime). v4.1.0: when every mirror fails, the 7 KissKH catalogs are
 *    auto-served from TMDB rescue lists (see KISSKH_TMDB_RESCUE below) with
 *    full metadata; streams still resolve on devices. Every catalog stays
 *    fail-soft: an unreachable API + failing rescue yields an empty row set
 *    + a /health hint, never a 500.
 *      Latest Update  -> /api/DramaList/List/{page}?type=KC&sub=0&sort=latest
 *      Top K-Drama    -> type=K&sort=rate (popular fallback)
 *      Top C-Drama    -> type=C&sort=rate (popular fallback)
 *      Hollywood      -> type=H&sort=latest (TV rows; Movie rows go to the
 *                        -movies companion catalog)
 *      Anime          -> type=A&sort=latest
 *      Upcoming       -> type=KC&sort=latest&status=Upcoming (ongoing
 *                        fallback) — param untestable from datacenter IPs,
 *                        candidates are tried in order at runtime.
 *
 * 5. animotvslash.org — WordPress "dramastream" HTML scrape
 *      Latest Release        -> /anime/?status=&type=&order=update
 *                               (the home section's own View All URL).
 *
 * 6. pencurimovie.baby (ww44.) — WordPress "MovieMo" HTML scrape (v5.2.0,
 *    user list 2026-09-11; every path fetched + verified live that day):
 *      Malaysia   -> /country/malaysia/      (paginated /country/.../page/N/)
 *      Indonesia  -> /country/indonesia/
 *      Japan      -> /country/japan/
 *      Thailand   -> /country/thailand/
 *      Most Viewed -> /most-viewed/          (paginated /most-viewed/page/N/)
 *      Most Rating -> /most-rating/
 *      Top IMDb   -> /top-imdb/              (paginated /top-imdb/page/N/,
 *                                             /page alone is a 404)
 *    Item markup: <div data-movie-id class="ml-item"> -> a.ml-mask with the
 *    absolute page URL + oldtitle="Title (Year)", a TMDB-hosted poster, and
 *    an mli-eps "Eps N" badge on SERIES rows (used as the row-type signal —
 *    everything else is typed movie). The host list carries sections that
 *    mix movies and series; rows are typed individually and the paired
 *    pencuri.js plugin sniffs the real page shape when playing. Site search
 *    is WordPress-standard /?s=query (verified: returns ml-item rows).
 *
 * STREAM-LINK GUARANTEE (unchanged contract, extended)
 *   Every meta id this addon emits MUST be playable by the paired plugins:
 *     - `tmdb:<id>` rows  -> any provider resolves the TMDB id to a title
 *       and searches its sites (full TMDB metadata attached: overview,
 *       year, rating, backdrop).
 *     - Source-scoped fallback rows (TMDB-unmatched) carry the SOURCE
 *       site's own address so the plugins navigate STRAIGHT to the real
 *       page — zero title searching:
 *           asian:pmh-<pinoymovieshub slug>  -> pinoyhub.js direct lane
 *           asian:ks-<kissasian slug>        -> asianhub.js direct lane
 *           asian:va-<viewasian slug>        -> asianhub.js direct lane
 *           asian:kh-<kisskh dramaId>        -> asianhub.js v2.6.0 direct
 *                                               lane (API id, no search)
 *           asian:an-<animotvslash slug>     -> animotvslash.js v5.3.0
 *                                               direct lane
 *           asian:pen-<pencuri slug>         -> pencuri.js (v5.2.0 pairing,
 *                                               direct page lane)
 *       The plugins that do NOT own a prefix skip it fast (no wasted
 *       searches, no false matches).
 *     - The generic `asian:<slug>` shape remains supported for stale
 *       CDN-cached rows (search-based fallback in the plugins).
 *
 * PAGINATION MODEL (unchanged)
 *   Per-catalog RESOLVED-ITEM BUFFER: source pages are consumed until the
 *   requested skip window is filled; Nuvio's `skip` never stalls or
 *   repeats. Page-1 failure = source down (fail-soft empty); deeper-page
 *   failure = listing exhausted.
 *
 * RUNTIME TARGETS (classic script — no imports/exports)
 *   - Cloudflare Workers  (see worker.js, attaches to globalThis)
 *   - Node.js >= 18       (see server.js, CJS require via globalThis)
 *   Needs only: fetch, URL, Response — all present in both.
 */

(function (global) {
  'use strict';

  var VERSION = '5.6.0';
  var ADDON_ID = 'community.asian.catalog';
  var ADDON_NAME = 'Asian Catalog';

  var PINOY_SITE_DEFAULT = 'https://pinoymovieshub.win';
  var KISSASIAN_SITE_DEFAULT = 'https://kissasian.cam';
  var VIEWASIAN_SITE_DEFAULT = 'https://viewasian.lol';
  var ANIMO_SITE_DEFAULT = 'https://animotvslash.org';
  // v5.2.0: Pencuri — user-provided mirror (ww44. subdomain rotates with the
  // site's own numbering; override with PENCURI_SITE when it moves again)
  var PENCURI_SITE_DEFAULT = 'https://ww44.pencurimovie.baby';
  var KISSKH_HOSTS_DEFAULT = ['https://kisskh.nl', 'https://kisskh.ovh', 'https://kisskh.co'];
  // v5.0.0: Anikoto API — the library MegaPlay documents for /stream/s-2 and
  // the id system HiAnime used. Rows carry mal_id + ani_id + status.
  var ANIKOTO_API_DEFAULT = 'https://anikotoapi.site';
  var ANIKOTO_PER_PAGE = 50;
  var ANIKOTO_MAX_PAGES = 10;      // feed pages scanned per section buffer
  var JIKAN_API_DEFAULT = 'https://api.jikan.moe/v4';
  var JIKAN_GAP_MS = 380;          // Jikan allows 3 req/s — stay under it
  var META_CACHE_TTL = 30 * 60 * 1000;
  // Same public TMDB key the Nuvio plugin ecosystem already embeds
  // (providers/pinoyhub.js et al). Override with TMDB_API_KEY env/secret.
  var DEFAULT_TMDB_KEY = '439c478a771f35c05022f9feabcca01c';
  var PINOY_ICON = '/wp-content/uploads/2025/04/cropped-favicon-11-192x192.png';
  var KS_ICON = '/wp-content/uploads/2024/03/cropped-favicon-1-1-192x192.png';
  var VA_ICON = '/wp-content/uploads/2024/09/logo.png';
  var ANIMO_ICON = '/wp-content/uploads/2024/03/cropped-favicon-1-1-192x192.png';

  var UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36';
  var MOBILE_UA = 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Mobile Safari/537.36';
  var BASE_HEADERS = {
    'User-Agent': UA,
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9'
  };
  var JSON_HEADERS = {
    'User-Agent': UA,
    'Accept': 'application/json,text/plain,*/*',
    'Accept-Language': 'en-US,en;q=0.9'
  };

  var PAGE_LIMIT_DEFAULT = 20;   // resolved items returned per request
  var MAX_SITE_PAGES_DEFAULT = 80;
  var TMDB_CONCURRENCY = 6;
  var PAGE_CACHE_TTL = 10 * 60 * 1000;        // raw parsed listing pages
  var PAGE_CACHE_STALE = 6 * 60 * 60 * 1000;  // serve-stale window on source errors
  var BUFFER_TTL = 30 * 60 * 1000;            // per-catalog resolved buffers
  var RESOLVED_TTL = 24 * 60 * 60 * 1000;     // TMDB lookups
  var RESOLVED_NULL_TTL = 6 * 60 * 60 * 1000; // negative TMDB lookups

  // ===== caches (module-level) =====

  var pageCache = new Map();     // url -> { ts, items }  (raw per-source items)
  var resolvedCache = new Map(); // key -> { ts, value: tmdb|null }
  var buffers = new Map();       // stateKey -> buffer
  var bufferInflight = new Map(); // stateKey -> Promise
  var metaCache = new Map();     // v5.0.0: metaId -> { ts, meta } (mal:/anikoto:)
  var _jikanLastReq = 0;         // v5.0.0: Jikan pacing (3 req/s limit)
  var tmdbInflight = new Map();  // lookup key -> Promise
  var CACHE_CAPS = { page: 250, resolved: 4000, buffers: 120 };

  function cachePrune(map, cap) {
    if (map.size <= cap) return;
    var it = map.keys();
    while (map.size > cap) {
      var k = it.next();
      if (k.done) break;
      map.delete(k.value);
    }
  }

  function resetCaches() {
    pageCache.clear();
    resolvedCache.clear();
    buffers.clear();
    bufferInflight.clear();
    tmdbInflight.clear();
    metaCache.clear();
  }

  // ===== config =====

  function makeConfig(env) {
    env = env || {};
    var limit = parseInt(env.ASIAN_PAGE_LIMIT, 10);
    var maxPages = parseInt(env.ASIAN_MAX_PAGES, 10);
    // workerd (Cloudflare Workers) receiver-checks its native API fns: an
    // unbound alias (`const f = fetch`) later invoked as cfg.fetchFn(url)
    // runs with `this === cfg` and throws "Illegal invocation..." BEFORE any
    // network I/O. Binding to the IIFE's global object satisfies workerd's
    // receiver check and is harmless everywhere else.
    var fetchRef = env.__fetchFn;
    if (!fetchRef && typeof fetch === 'function') {
      try { fetchRef = fetch.bind(global); } catch (e) { fetchRef = fetch; }
    }
    var khHosts = String(env.KISSKH_HOSTS || '')
      .split(',').map(function (s) { return s.trim().replace(/\/+$/, ''); })
      .filter(function (s) { return /^https?:\/\//.test(s); });
    if (!khHosts.length) khHosts = KISSKH_HOSTS_DEFAULT.slice();
    return {
      pinoySite: String(env.PINOY_SITE || PINOY_SITE_DEFAULT).replace(/\/+$/, ''),
      kissasianSite: String(env.KISSASIAN_SITE || KISSASIAN_SITE_DEFAULT).replace(/\/+$/, ''),
      viewasianSite: String(env.VIEWASIAN_SITE || VIEWASIAN_SITE_DEFAULT).replace(/\/+$/, ''),
      animoSite: String(env.ANIMO_SITE || ANIMO_SITE_DEFAULT).replace(/\/+$/, ''),
      pencuriSite: String(env.PENCURI_SITE || PENCURI_SITE_DEFAULT).replace(/\/+$/, ''),
      kisskhHosts: khHosts,
      anikotoApi: String(env.ANIKOTO_API || ANIKOTO_API_DEFAULT).replace(/\/+$/, ''),
      jikanApi: String(env.JIKAN_API || JIKAN_API_DEFAULT).replace(/\/+$/, ''),
      tmdbKey: String(env.TMDB_API_KEY || DEFAULT_TMDB_KEY),
      pageLimit: Math.min(Math.max(isFinite(limit) && limit > 0 ? limit : PAGE_LIMIT_DEFAULT, 5), 50),
      maxSitePages: isFinite(maxPages) && maxPages > 0 ? maxPages : MAX_SITE_PAGES_DEFAULT,
      keepUnmatched: env.ASIAN_KEEP_UNMATCHED !== '0', // fallback rows visible by default
      fetchFn: fetchRef || null,
      nowFn: env.__nowFn || (function () { return Date.now(); })
    };
  }

  // ===== small utilities =====

  var ENTITY_MAP = {
    amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ',
    '#8211': '\u2013', '#8212': '\u2014', '#8216': '\u2018', '#8217': '\u2019',
    '#8220': '\u201c', '#8221': '\u201d', '#038': '&', '#8210': '\u2010',
    '#8242': '\u2032', '#8482': '\u2122', '#174': '\u00ae'
  };

  function decodeEntities(s) {
    return String(s || '').replace(/&(#?\w+);/g, function (m, ent) {
      if (ENTITY_MAP[ent]) return ENTITY_MAP[ent];
      if (ent.charAt(0) === '#') {
        var num = parseInt(ent.substring(1), 10);
        if (isFinite(num) && num > 0 && num < 65536) return String.fromCharCode(num);
      }
      return m;
    });
  }

  function stripTags(s) {
    return String(s || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  }

  function collapseWs(s) {
    return String(s || '').replace(/\s+/g, ' ').trim();
  }

  function slugifyGenre(s) {
    return String(s || '').toLowerCase()
      .replace(/&/g, 'and')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  function normalizeForCompare(s) {
    return String(s || '')
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/&/g, ' and ')
      .replace(/[^a-z0-9]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function attr(tag, name) {
    var m = tag.match(new RegExp(name + '=["\']([^"\']*)["\']', 'i'));
    return m ? m[1] : '';
  }

  function absoluteUrl(cfg, base, u) {
    u = String(u || '').trim();
    if (!u) return '';
    if (u.indexOf('//') === 0) return 'https:' + u;
    if (/^https?:\/\//i.test(u)) return u;
    if (u.charAt(0) === '/') return base + u;
    return '';
  }

  function isPlaceholderPoster(u) {
    return /\/themes\/dooplay\/assets\/img\/no\//i.test(u || '') ||
      /placehold\.co|placeholder/i.test(u || '');
  }

  // WordPress thumbnail suffix (-150x150.webp -> .webp) upgrade.
  function cleanPosterUrl(base, u) {
    u = absoluteUrl(null, base, u);
    if (!u || isPlaceholderPoster(u)) return '';
    return u.replace(/-\d+x\d+(\.\w{3,4})(?:\?.*)?$/, '$1');
  }

  function jsonHeaders(maxAge) {
    return {
      'Content-Type': 'application/json;charset=utf-8',
      'Cache-Control': 'public, max-age=' + (maxAge || 300),
      'Access-Control-Allow-Origin': '*'
    };
  }

  function json(obj, status, maxAge) {
    return new Response(JSON.stringify(obj), { status: status || 200, headers: jsonHeaders(maxAge) });
  }

  // ===== title cleaning =====

  var QUALIFIER_WORDS = /(tagalog|dubbed|english|taglish|full[\s-]*(movie|series|film)|hd[\s-]*cam|cam|audio|subbed|subtitle)/i;

  // Strips site noise so the TMDB query is a clean title:
  //   "Queen Mantis (Tagalog Dubbed)"  -> "Queen Mantis"
  //   "ep14 – Love, Siargao"           -> "Love, Siargao"
  //   "The Love Lab (2026)"            -> "The Love Lab"
  function cleanTitleForSearch(title) {
    var t = decodeEntities(title);
    t = t.replace(/^\s*ep(?:isode)?\s*\d+\s*[\u2013\u2014:-]\s*/i, '');
    t = t.replace(/[\(\[\{][^\)\]\}]*[\)\]\}]/g, function (seg) {
      return QUALIFIER_WORDS.test(seg) ? ' ' : seg;
    });
    t = t.replace(/\b(tagalog|english)[\s-]*dubbed\b/gi, ' ');
    t = t.replace(/\bfull[\s-]*(movie|series|film)\b/gi, ' ');
    t = t.replace(/\bwith[\s-]+english[\s-]+subs(?:titles)?\b/gi, ' ');
    t = t.replace(/\s+\b(hd|hdtv|hdrip|webrip|dvdrip|blu-ray|bluray)\b\s*$/i, '');
    t = t.replace(/\b(19|20)\d{2}\b/g, ' ');
    // empty brackets left behind by year/qualifier removal ("The Love Lab ()")
    t = t.replace(/\(\s*\)|\[\s*\]|\{\s*\}/g, ' ');
    t = collapseWs(t).replace(/^[\u2013\u2014:,-]+\s*/, '').trim();
    return t;
  }

  // Display name: keep the site's own naming (users know it), minus the
  // per-episode "epN – " prefix and raw HTML noise.
  function cleanDisplayName(title) {
    var t = collapseWs(decodeEntities(title));
    t = t.replace(/^\s*ep(?:isode)?\s*\d+\s*[\u2013\u2014:-]\s*/i, '');
    t = t.replace(/^\s*\d+x\d+\s*[\u2013\u2014:-]\s*/, '');
    return t.substring(0, 120).trim();
  }

  // ===== network =====

  function timeoutSignal(ms) {
    if (typeof AbortSignal !== 'undefined' && typeof AbortSignal.timeout === 'function') {
      return AbortSignal.timeout(ms || 12000);
    }
    return undefined;
  }

  function fetchText(cfg, url, timeoutMs, headers) {
    if (!cfg.fetchFn) return Promise.reject(new Error('no fetch available'));
    var opts = { method: 'GET', redirect: 'follow', headers: headers || BASE_HEADERS };
    var sig = timeoutSignal(timeoutMs || 12000);
    if (sig) opts.signal = sig;
    return Promise.resolve().then(function () { return cfg.fetchFn(url, opts); }).then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status + ' for ' + url);
      return res.text();
    });
  }

  function fetchJson(cfg, url, timeoutMs) {
    if (!cfg.fetchFn) return Promise.reject(new Error('no fetch available'));
    var opts = { method: 'GET', redirect: 'follow', headers: JSON_HEADERS };
    var sig = timeoutSignal(timeoutMs || 12000);
    if (sig) opts.signal = sig;
    return Promise.resolve().then(function () { return cfg.fetchFn(url, opts); }).then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status + ' for ' + url);
      return res.json();
    });
  }

  // Escalating-identity retries for bot-gated responses (Cloudflare worker
  // egress IPs are frequently challenged by these WordPress hosts while
  // residential IPs sail through):
  //   1. desktop Chrome UA
  //   2. mobile Android UA  (challenge systems rarely hit mobile prints)
  //   3. Googlebot UA       (WordPress sites commonly allow-list the crawler)
  function fetchTextWithRetry(cfg, url, timeoutMs) {
    return fetchText(cfg, url, timeoutMs).catch(function (err) {
      var msg = String((err && err.message) || err);
      if (/HTTP (403|503)/.test(msg)) {
        return fetchText(cfg, url, timeoutMs, {
          'User-Agent': MOBILE_UA,
          'Accept': 'text/html,application/xhtml+xml,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'none'
        }).catch(function (err2) {
          var msg2 = String((err2 && err2.message) || err2);
          if (/HTTP (403|503)/.test(msg2)) {
            return fetchText(cfg, url, timeoutMs, {
              'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
              'Accept': 'text/html,application/xhtml+xml,*/*;q=0.8',
              'Accept-Language': 'en-US,en;q=0.9'
            });
          }
          throw err2;
        });
      }
      throw err;
    });
  }

  // Cached raw-page fetch (per-source item arrays) + serve-stale.
  function fetchPageCached(cfg, url, parseFn) {
    var entry = pageCache.get(url);
    var now = cfg.nowFn();
    if (entry && now - entry.ts < PAGE_CACHE_TTL) {
      return Promise.resolve(entry.items);
    }
    return parseFn(cfg, url).then(function (items) {
      pageCache.set(url, { ts: now, items: items });
      cachePrune(pageCache, CACHE_CAPS.page);
      return items;
    }).catch(function (err) {
      if (entry && now - entry.ts < PAGE_CACHE_STALE) return entry.items;
      throw err;
    });
  }

  function mapLimited(arr, n, fn) {
    var out = new Array(arr.length);
    var i = 0;
    function worker() {
      return Promise.resolve().then(function loop() {
        if (i >= arr.length) return undefined;
        var idx = i++;
        return Promise.resolve().then(function () { return fn(arr[idx], idx); }).then(function (r) {
          out[idx] = r;
          return loop();
        });
      });
    }
    var workers = [];
    for (var w = 0; w < Math.min(n, arr.length); w++) workers.push(worker());
    return Promise.all(workers).then(function () { return out; });
  }

  // ===== TMDB resolution (shared by scraped sources) =====

  function tmdbImg(size, path) {
    return path ? 'https://image.tmdb.org/t/p/' + size + path : '';
  }

  function tmdbSearch(cfg, kind, query, year) {
    var url = 'https://api.themoviedb.org/3/search/' + kind +
      '?api_key=' + encodeURIComponent(cfg.tmdbKey) +
      '&query=' + encodeURIComponent(query) +
      '&include_adult=false&page=1';
    if (year) url += kind === 'movie' ? '&year=' + encodeURIComponent(year) : '&first_air_date_year=' + encodeURIComponent(year);
    return fetchJson(cfg, url).then(function (data) {
      if (!data || !Array.isArray(data.results)) return [];
      return data.results.map(function (r) {
        return {
          id: r.id,
          title: r.title || r.name || '',
          original: r.original_title || r.original_name || '',
          year: String((r.release_date || r.first_air_date || '')).split('-')[0] || '',
          poster: r.poster_path || '',
          backdrop: r.backdrop_path || '',
          overview: r.overview || '',
          rating: typeof r.vote_average === 'number' && r.vote_average > 0 ? r.vote_average : 0
        };
      });
    }).catch(function () { return []; });
  }

  function titleScore(siteNorm, tmdbNorm) {
    if (!siteNorm || !tmdbNorm) return 0;
    if (siteNorm === tmdbNorm) return 3;
    if (siteNorm.length >= 6 && tmdbNorm.indexOf(siteNorm) === 0) return 2.5;
    if (tmdbNorm.length >= 6 && siteNorm.indexOf(tmdbNorm) === 0) return 2.5;
    if (siteNorm.indexOf(tmdbNorm) !== -1 || tmdbNorm.indexOf(siteNorm) !== -1) return 2;
    var a = siteNorm.split(' ');
    var b = tmdbNorm.split(' ');
    var setB = {};
    for (var i = 0; i < b.length; i++) setB[b[i]] = true;
    var inter = 0;
    for (var j = 0; j < a.length; j++) if (setB[a[j]]) inter++;
    var cov = inter / Math.max(a.length, b.length);
    return cov >= 0.6 ? 1.5 : 0;
  }

  function yearScore(siteYear, tmdbYear) {
    if (!siteYear || !tmdbYear) return 0;
    var d = Math.abs(parseInt(siteYear, 10) - parseInt(tmdbYear, 10));
    if (d === 0) return 2;
    if (d === 1) return 1;
    if (d === 2) return 0.5;
    return -2;
  }

  // Picks the best TMDB candidate for a cleaned site title. Returns null when
  // nothing matches confidently.
  function pickBestTmdb(candidates, cleanedTitle, siteYear) {
    var siteNorm = normalizeForCompare(cleanedTitle);
    var best = null;
    var bestScore = 0;
    for (var i = 0; i < candidates.length; i++) {
      var c = candidates[i];
      var t = Math.max(
        titleScore(siteNorm, normalizeForCompare(c.title)),
        titleScore(siteNorm, normalizeForCompare(c.original))
      );
      var y = yearScore(siteYear, c.year);
      var score = t * 10 + y;
      var acceptable = t >= 2.5 || (t >= 2 && y >= 1) || (t === 3);
      if (!acceptable) continue;
      if (score > bestScore) { bestScore = score; best = c; }
    }
    return best;
  }

  function resolveTmdb(cfg, type, rawTitle, siteYear) {
    var cleaned = cleanTitleForSearch(rawTitle);
    if (!cleaned) return Promise.resolve(null);
    var key = type + '|' + normalizeForCompare(cleaned) + '|' + (siteYear || '');
    var now = cfg.nowFn();
    var hit = resolvedCache.get(key);
    if (hit) {
      var ttl = hit.value ? RESOLVED_TTL : RESOLVED_NULL_TTL;
      if (now - hit.ts < ttl) return Promise.resolve(hit.value);
      resolvedCache.delete(key);
    }
    var pending = tmdbInflight.get(key);
    if (pending) return pending;

    var kind = type === 'movie' ? 'movie' : 'tv';
    var attempts = [{ q: cleaned, y: siteYear }, { q: cleaned, y: '' }];

    pending = (function run(idx) {
      if (idx >= attempts.length) return Promise.resolve(null);
      var at = attempts[idx];
      return tmdbSearch(cfg, kind, at.q, at.y).then(function (candidates) {
        var best = pickBestTmdb(candidates, cleaned, siteYear);
        // the yearless retry must still be a confident title match
        if (best) return best;
        return run(idx + 1);
      });
    })(0).then(function (value) {
      resolvedCache.set(key, { ts: now, value: value });
      cachePrune(resolvedCache, CACHE_CAPS.resolved);
      tmdbInflight.delete(key);
      return value;
    }).catch(function (err) {
      tmdbInflight.delete(key);
      throw err;
    });

    tmdbInflight.set(key, pending);
    return pending;
  }

  // ===== meta building =====

  /**
   * STREAM-LINK GUARANTEE: every fallback id tail MUST match the plugin
   * contract ^[a-z0-9][a-z0-9-]*$ (parseAsianCatalogId in the plugins).
   * v4.0.0 source-scoped ids (asian:<source>-<slug-or-id>):
   *   pmh -> pinoymovieshub page slug    (pinoyhub.js direct lane)
   *   ks  -> kissasian.cam series slug   (asianhub.js direct lane)
   *   va  -> viewasian.lol drama slug    (asianhub.js direct lane)
   *   kh  -> kisskh NUMERIC drama id     (asianhub.js v2.6.0 direct lane)
   *   an  -> animotvslash.org anime slug (animotvslash.js v5.3.0 lane)
   */
  var SOURCE_PREFIX = { ks: 'ks', va: 'va', pmh: 'pmh', kh: 'kh', an: 'an', pen: 'pen' };

  function fallbackIdTail(item) {
    var tail = '';
    if (item.sourceId !== undefined && item.sourceId !== null && String(item.sourceId) !== '') {
      tail = String(item.sourceId);
    } else {
      tail = String(item.slug || '').trim();
      if (!tail && item.url) {
        tail = String(item.url).replace(/\/+$/, '').split('/').pop() || '';
        tail = tail.replace(/\.(html?|json)$/i, '');
      }
      if (!tail) tail = cleanDisplayName(item.title);
      tail = String(tail).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    }
    var sp = SOURCE_PREFIX[item.source];
    if (sp && tail && tail.indexOf(sp + '-') !== 0) tail = sp + '-' + tail;
    return tail || 'untitled';
  }

  function fallbackMeta(cfg, prefix, item) {
    var meta = {
      id: prefix + ':' + fallbackIdTail(item),
      type: item.type === 'series' ? 'series' : 'movie',
      name: cleanDisplayName(item.title),
      posterShape: 'poster'
    };
    var sitePoster = cleanPosterUrl(cfg.pinoySite, item.poster) ||
      cleanPosterUrl(cfg.kissasianSite, item.poster) ||
      cleanPosterUrl(cfg.viewasianSite, item.poster) ||
      cleanPosterUrl(cfg.animoSite, item.poster) ||
      ((/^https?:\/\//i.test(String(item.poster || '')) && !isPlaceholderPoster(item.poster)) ? item.poster : '');
    if (sitePoster) meta.poster = sitePoster;
    if (item.description) meta.description = item.description;
    if (item.year) meta.releaseInfo = String(item.year);
    // Site-side rating (NEW RELEASES carousel prints it; kisskh rows may
    // carry it) — displayed even when TMDB could not match the title.
    var siteRating = parseFloat(item.rating);
    if (isFinite(siteRating) && siteRating > 0 && siteRating <= 10) {
      meta.imdbRating = Math.round(siteRating * 10) / 10;
    }
    return meta;
  }

  // Scraped/API item -> meta. TMDB match first (full metadata), visible
  // source-scoped `asian:` fallback row when unmatched (or dropped when
  // ASIAN_KEEP_UNMATCHED=0).
  function toMeta(cfg, item, tmdb) {
    var type = item.type === 'series' ? 'series' : 'movie';
    var name = cleanDisplayName(item.title);
    if (!name) return null;
    var sitePoster = cleanPosterUrl(cfg.pinoySite, item.poster) ||
      cleanPosterUrl(cfg.kissasianSite, item.poster) ||
      cleanPosterUrl(cfg.viewasianSite, item.poster) ||
      cleanPosterUrl(cfg.animoSite, item.poster) ||
      ((/^https?:\/\//i.test(String(item.poster || '')) && !isPlaceholderPoster(item.poster)) ? item.poster : '');
    if (tmdb) {
      var meta = {
        id: 'tmdb:' + tmdb.id,
        type: type,
        name: name,
        poster: sitePoster || tmdbImg('w342', tmdb.poster),
        posterShape: 'poster'
      };
      var bg = tmdbImg('w780', tmdb.backdrop);
      if (bg) meta.background = bg;
      if (tmdb.overview) meta.description = tmdb.overview;
      var rel = item.year || tmdb.year;
      if (rel) meta.releaseInfo = String(rel);
      var r = parseFloat(item.rating) || tmdb.rating || 0;
      if (r > 0) meta.imdbRating = Math.round(r * 10) / 10;
      return meta;
    }
    if (!cfg.keepUnmatched) return null;
    var fb = fallbackMeta(cfg, 'asian', item);
    // keep the site description when TMDB contributed none
    if (!fb.description && item.description) fb.description = item.description;
    return fb;
  }

  function resolveBatch(cfg, items) {
    return mapLimited(items, TMDB_CONCURRENCY, function (item) {
      return resolveTmdb(cfg, item.type, item.title, item.year)
        .then(function (tmdb) { return toMeta(cfg, item, tmdb); })
        .catch(function () { return null; });
    });
  }

  // ===== source 1: pinoymovieshub.win (WordPress/Dooplay HTML) =====

  // Accepts Dooplay archive items (<article class="item" id="post-N">),
  // search-template items (<article> with div.details) — the Featured
  // carousel inside #featured-titles is parsed by parseFeaturedCarousel.
  function parseListPage(cfg, html) {
    var items = [];
    var seen = {};
    var re = /<article\b[^>]*>([\s\S]*?)<\/article>/g;
    var m;
    while ((m = re.exec(html)) !== null) {
      var body = m[1];
      var whole = m[0];
      var idMatch = whole.match(/id=["']post-([\w-]+?)["']/);
      var postId = idMatch ? idMatch[1] : '';
      if (postId.indexOf('featured-') === 0) continue; // carousel -> parseFeaturedCarousel

      var img = body.match(/<img[^>]*>/i);
      var poster = img ? attr(img[0], 'src') : '';

      var link = body.match(/href=["'](https?:\/\/[^"']+)["']/i);
      if (!link) continue;
      var url = decodeEntities(link[1]).replace(/[?#].*$/, '');
      if (!/\/(?:movies|series)\/[^/]+$/i.test(url)) continue;
      var kind = /\/movies\//i.test(url) ? 'movie' : (/\/series\//i.test(url) ? 'series' : '');
      if (!kind) continue;

      var isSearchItem = /class=["']details["']/.test(body);
      var isArchiveItem = /^\d+$/.test(postId);
      if (!isSearchItem && !isArchiveItem) continue;

      var title = '';
      var th = body.match(/<h3[^>]*class=["'][^"']*title[^"']*["'][^>]*>([\s\S]*?)<\/h3>/i);
      if (th) title = stripTags(th[1]);
      if (!title) {
        var td = body.match(/<div[^>]*class=["']title["'][^>]*>\s*<a[^>]*>([\s\S]*?)<\/a>/i);
        if (td) title = stripTags(td[1]);
      }
      if (!title && img) {
        var alt = attr(img[0], 'alt');
        if (alt) title = stripTags(decodeEntities(alt));
      }
      if (!title) continue;

      var year = '';
      var ym = body.match(/<span[^>]*>\s*((?:19|20)\d{2})\s*</);
      if (ym) year = ym[1];

      var desc = '';
      var dm = body.match(/<div[^>]*class=["']contenido["'][^>]*>\s*<p>([\s\S]*?)<\/p>/i);
      if (dm) desc = stripTags(dm[1]);

      var slug = url.replace(/\/+$/, '').split('/').pop() || '';
      if (seen[url]) continue;
      seen[url] = true;

      items.push({
        postId: postId,
        slug: slug,
        url: url,
        source: 'pmh',
        type: kind,
        title: collapseWs(decodeEntities(title)),
        year: year,
        poster: poster,
        description: desc
      });
    }
    return items;
  }

  /**
   * v4.0.0 NEW RELEASES carousel parser (home #featured-titles block).
   * Row shape (verified live):
   *   <article id="post-featured-148827" class="item movies">
   *     <div class="poster"><img src="..."><div class="rating">8.7</div>...
   *     <a href="https://pinoymovieshub.win/movies/tayo-sa-wakas">...
   *     <h3><a href=...>Tayo Sa Wakas</a></h3><span>2026</span>
   *   class is "item movies" or "item tvshows" (tvshows rows link /series/).
   * The carousel is the site's NEW RELEASES section; it mixes movies and
   * series, so callers filter by type (Stremio rows are single-typed).
   */
  function parseFeaturedCarousel(cfg, html) {
    var start = html.indexOf('id="featured-titles"');
    if (start === -1) return [];
    // the carousel block ends at the next module header
    var end = html.indexOf('<h2>', start);
    if (end === -1) end = html.length;
    var seg = html.substring(start, end);
    var items = [];
    var seen = {};
    var re = /<article id="post-featured-(\d+)" class="item ([\w-]+)"([\s\S]*?)<\/article>/g;
    var m;
    while ((m = re.exec(seg)) !== null) {
      var postId = m[1];
      var cls = m[2];
      var body = m[3];
      var link = body.match(/href=["'](https?:\/\/[^"']+)["']/i);
      if (!link) continue;
      var url = decodeEntities(link[1]).replace(/[?#].*$/, '');
      var kind = /\/movies\//i.test(url) ? 'movie' : (/\/series\//i.test(url) ? 'series' : '');
      if (!kind) continue;
      var img = body.match(/<img[^>]*>/i);
      var poster = img ? attr(img[0], 'src') : '';
      var title = '';
      var th = body.match(/<h3[^>]*>\s*<a[^>]*>([\s\S]*?)<\/a>/i);
      if (th) title = stripTags(th[1]);
      if (!title && img) title = stripTags(decodeEntities(attr(img[0], 'alt') || ''));
      if (!title) continue;
      var year = '';
      var ym = body.match(/<span>\s*((?:19|20)\d{2})\s*<\/span>/i);
      if (ym) year = ym[1];
      var rating = '';
      var rm = body.match(/class=["']rating["']\s*>\s*([\d.]+)\s*</i);
      if (rm) rating = rm[1];
      if (seen[url]) continue;
      seen[url] = true;
      items.push({
        postId: 'featured-' + postId,
        slug: url.replace(/\/+$/, '').split('/').pop() || '',
        url: url,
        source: 'pmh',
        type: kind,
        title: collapseWs(decodeEntities(title)),
        year: year,
        poster: poster,
        rating: rating,
        description: ''
      });
    }
    return items;
  }

  function pinoyParseUrl(cfg, url) {
    return fetchTextWithRetry(cfg, url, 12000).then(function (html) {
      if (/id=["']featured-titles["']/.test(html) && url.replace(/\/+$/, '') === cfg.pinoySite) {
        return parseFeaturedCarousel(cfg, html);
      }
      return parseListPage(cfg, html);
    });
  }

  function pinoyPageRaw(cfg, url, type) {
    return fetchPageCached(cfg, url, pinoyParseUrl).then(function (items) {
      var out = [];
      for (var i = 0; i < items.length; i++) {
        if (!type || items[i].type === type) out.push(items[i]);
      }
      return out;
    });
  }

  // Genre chip -> real site slug. "Rated R" is the display label of the
  // site's /genre/sexy archive and "Wattpad Presents" of /genre/wattpad
  // (both verified as the home sections' see-all targets, 2026-09-10).
  var PINOY_GENRE_SLUGS = {
    'rated r': 'sexy',
    'wattpad presents': 'wattpad'
  };

  function pinoyGenreSlug(label) {
    var s = String(label || '').toLowerCase().trim();
    if (PINOY_GENRE_SLUGS[s]) return PINOY_GENRE_SLUGS[s];
    return slugifyGenre(s);
  }

  function pinoyPageMetas(cfg, def, page, extras) {
    var url;
    var search = String(extras.search || '').trim();
    if (search) {
      url = page === 1
        ? cfg.pinoySite + '/?s=' + encodeURIComponent(search)
        : cfg.pinoySite + '/page/' + page + '/?s=' + encodeURIComponent(search);
    } else if (def.mode === 'genre' && extras.genre) {
      var slug = pinoyGenreSlug(extras.genre);
      url = page === 1
        ? cfg.pinoySite + '/genre/' + slug
        : cfg.pinoySite + '/genre/' + slug + '/page/' + page;
    } else if (def.mode === 'newreleases') {
      // The home NEW RELEASES carousel is a finite widget (~15 rows, no
      // deeper pages) — deeper pages simply exhaust the listing.
      if (page > 1) return Promise.resolve([]);
      url = cfg.pinoySite + '/';
    } else if (def.mode === 'featured') {
      url = page === 1
        ? cfg.pinoySite + '/genre/featured'
        : cfg.pinoySite + '/genre/featured/page/' + page;
    } else if (def.mode === 'coming-soon') {
      url = page === 1
        ? cfg.pinoySite + '/genre/coming-soon'
        : cfg.pinoySite + '/genre/coming-soon/page/' + page;
    } else {
      var seg = def.type === 'series' ? '/series' : '/movies';
      url = page === 1 ? cfg.pinoySite + seg + '/' : cfg.pinoySite + seg + '/page/' + page;
    }
    return pinoyPageRaw(cfg, url, def.type).then(function (items) {
      if (!items.length) return [];
      return resolveBatch(cfg, items);
    });
  }

  // ===== source 2: kissasian.cam (WordPress "dramastream" HTML) =====
  // v4.0.0 sections (user list): Hot Series Update (home .hothome block),
  // Latest Release (/series/?order=update — the section's own View All URL),
  // genre chips Fantasy/Friendship/Law/Romance/Sports (/genres/{slug}/).

  function ksParseListPage(cfg, html) {
    var items = [];
    var seen = {};
    // host is config-driven (KISSASIAN_SITE override / test fixtures)
    var host = String(cfg.kissasianSite || '').replace(/^https?:\/\//, '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    var reHref = new RegExp('href="https?://' + host + '/(?:series/)?([a-z0-9-]+)/"', 'i');
    var reSeries = new RegExp('href="https?://' + host + '/series/', 'i');
    // Hot rows are <article class="stylefor">, archive rows <article class="bs">
    var re = /<article class="(?:bs|stylefor)"[^>]*>([\s\S]*?)<\/article>/g;
    var m;
    while ((m = re.exec(html)) !== null) {
      var body = m[1];
      var isSeriesRow = reSeries.test(body);
      var link = body.match(reHref);
      if (!link) continue;
      var slug = link[1];
      if (slug === 'feed' || slug === 'list-mode' || slug === 'page') continue;
      var img = body.match(/<img[^>]*>/i);
      var poster = '';
      if (img) {
        poster = attr(img[0], 'src') || attr(img[0], 'data-original') || attr(img[0], 'data-lazy-src');
      }
      var title = '';
      var tm = body.match(/title="([^"]+)"/i);
      if (tm) title = stripTags(decodeEntities(tm[1]));
      if (!title && img) {
        var alt = attr(img[0], 'alt') || attr(img[0], 'title');
        if (alt) title = stripTags(decodeEntities(alt));
      }
      if (!title) continue;

      var epm = slug.match(/^(.*)-episode-\d+$/);
      if (epm) {
        slug = epm[1];
        title = title.replace(/\s*[-\u2013\u2014]?\s*Episode\s*\d+.*$/i, '');
      }
      // v4.0.0: non-episode rows are accepted even when they link the root
      // form (hot-block movie rows like /pov-pasilip-on-vmx-2026/) — the
      // /series/{slug}/ canonical form is verified 200 for those slugs.
      if (seen[slug]) continue;
      seen[slug] = true;
      items.push({
        slug: slug,
        url: cfg.kissasianSite + '/series/' + slug + '/',
        source: 'ks',
        type: 'series',
        title: collapseWs(title),
        year: '',
        poster: poster,
        description: ''
      });
    }
    return items;
  }

  /**
   * v4.0.0: the home "Hot Series Update" block (div.releases.hothome ...
   * up to the next .bixbox). Rows are article.stylefor with ROOT episode
   * links (/the-early-spring-episode-24/) — ksParseListPage dedupes them
   * to their series (slug -episode-N strip -> /series/{slug}/).
   */
  function ksParseHotSection(cfg, html) {
    var start = html.indexOf('releases hothome');
    if (start === -1) start = html.indexOf('Hot Series Update');
    if (start === -1) return [];
    var end = html.indexOf('class="bixbox"', start + 10);
    if (end === -1) end = html.indexOf('Latest Release', start + 10);
    if (end === -1) end = html.length;
    var seg = html.substring(start, end);
    return ksParseListPage(cfg, seg);
  }

  function ksParseUrl(cfg, url) {
    return fetchTextWithRetry(cfg, url, 12000).then(function (html) {
      return ksParseListPage(cfg, html);
    });
  }

  function ksPageRaw(cfg, url) {
    return fetchPageCached(cfg, url, ksParseUrl);
  }

  function ksPageMetas(cfg, def, page, extras) {
    var url;
    var search = String(extras.search || '').trim();
    if (search) {
      url = page === 1
        ? cfg.kissasianSite + '/?s=' + encodeURIComponent(search)
        : cfg.kissasianSite + '/page/' + page + '/?s=' + encodeURIComponent(search);
    } else if (def.mode === 'genre' && extras.genre) {
      var slug = slugifyGenre(extras.genre);
      url = cfg.kissasianSite + '/genres/' + slug + '/';
      return ksPageRaw(cfg, url).then(function (items) {
        return items.length ? resolveBatch(cfg, items) : [];
      }).catch(function () { return []; }); // genre archives are shallow; empty beats a 502
    } else if (def.mode === 'hot') {
      if (page === 1) {
        return fetchPageCached(cfg, cfg.kissasianSite + '/home-hot', function (c, u) {
          return fetchTextWithRetry(c, cfg.kissasianSite + '/', 12000).then(function (html) {
            return ksParseHotSection(c, html);
          });
        }).then(function (items) {
          if (!items.length) return [];
          return resolveBatch(cfg, items);
        });
      }
      // the hot widget is home-only; deeper pages continue on the site's own
      // "latest updates" ordering so the row keeps scrolling seamlessly
      url = cfg.kissasianSite + '/series/?status=&type=&order=update&page=' + (page - 1);
    } else {
      // Latest Release: the section's own View All URL (verified live)
      url = page === 1
        ? cfg.kissasianSite + '/series/?status=&type=&order=update'
        : cfg.kissasianSite + '/series/?status=&type=&order=update&page=' + page;
    }
    return ksPageRaw(cfg, url).then(function (items) {
      if (!items.length) return [];
      return resolveBatch(cfg, items);
    });
  }

  // ===== source 3: viewasian.lol (WordPress "viewasian" HTML) =====
  // v4.0.0: the single user-requested section "Recently Drama , Movie and
  // Kshow" IS the home recent list (that exact heading is on the home page).
  // (The nav's /movies-list/ and /kshows/ pages return the SAME rows as the
  // home list — verified 2026-09-10 — so they add nothing.)

  function vaParseListPage(cfg, html) {
    var items = [];
    var seen = {};
    // host is config-driven (VIEWASIAN_SITE override / test fixtures)
    var host = String(cfg.viewasianSite || '').replace(/^https?:\/\//, '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // per-<li> scan: rows live in <li><a href=...><img ...><h2 class=title>.
    // Listing rows link to root episode URLs, search rows to /drama/{slug}/.
    var re = new RegExp('<li>\\s*<a href="https?://' + host + '/(?:drama/)?([a-z0-9-]+)/"([^>]*)>([\\s\\S]*?)</li>', 'g');
    var m;
    while ((m = re.exec(html)) !== null) {
      var isDramaRow = m[0].indexOf('/drama/') !== -1;
      var slug = m[1];
      var body = m[3];
      var img = body.match(/<img[^>]*>/i);
      if (!img) continue; // menu/nav rows have no thumbnails
      var poster = attr(img[0], 'data-original') || attr(img[0], 'src');
      var title = attr(img[0], 'title') || attr(img[0], 'alt');
      if (!title) {
        var at = m[0].match(/<a[^>]*title="([^"]+)"/i);
        if (at) title = at[1];
      }
      if (!title) {
        var h2 = body.match(/<h2[^>]*>([\s\S]*?)<\/h2>/i);
        if (h2) title = stripTags(h2[1]);
      }
      if (!title) continue;
      title = stripTags(decodeEntities(title));

      var year = '';
      var ym = title.match(/\((19|20)\d{2}\)/);
      if (ym) year = ym[0].slice(1, -1);

      var epm = slug.match(/^(.*?)(?:-episode-\d+|-ep-\d+)(?:-[a-z0-9-]+)?$/);
      if (epm) {
        slug = epm[1];
        title = title.replace(/\s*[-\u2013\u2014]?\s*Episode\s*\d+.*$/i, '');
      } else if (slug.indexOf('movie') !== -1) {
        slug = slug.replace(/-(?:full-hd-)?movie$/, '');
        title = title.replace(/\s*[-\u2013\u2014]?\s*Full[\s-]*HD[\s-]*Movie.*$/i, '');
      } else if (!isDramaRow) {
        continue; // non-content row (nav chips etc)
      }
      if (seen[slug]) continue;
      seen[slug] = true;
      items.push({
        slug: slug,
        url: cfg.viewasianSite + '/drama/' + slug + '/',
        source: 'va',
        type: 'series',
        title: collapseWs(title),
        year: year,
        poster: poster,
        description: ''
      });
    }
    return items;
  }

  function vaParseUrl(cfg, url) {
    return fetchTextWithRetry(cfg, url, 12000).then(function (html) {
      return vaParseListPage(cfg, html);
    });
  }

  function vaPageRaw(cfg, url) {
    return fetchPageCached(cfg, url, vaParseUrl);
  }

  function vaPageMetas(cfg, def, page, extras) {
    var url;
    var search = String(extras.search || '').trim();
    if (search) {
      url = page === 1
        ? cfg.viewasianSite + '/?s=' + encodeURIComponent(search)
        : cfg.viewasianSite + '/page/' + page + '/?s=' + encodeURIComponent(search);
    } else {
      url = page === 1 ? cfg.viewasianSite + '/' : cfg.viewasianSite + '/page/' + page + '/';
    }
    return vaPageRaw(cfg, url).then(function (items) {
      if (!items.length) return [];
      return resolveBatch(cfg, items);
    });
  }

  // ===== source 4: animotvslash.org (WordPress "dramastream" HTML) =====
  // v4.0.0 NEW SOURCE. Latest Release = /anime/?status=&type=&order=update
  // (the home section's own View All URL, verified live: 20 article.bs rows
  // per page, /anime/{slug}/ links, "-episode-N" rows dedupe to the series).

  function animoParseListPage(cfg, html) {
    var items = [];
    var seen = {};
    var host = String(cfg.animoSite || '').replace(/^https?:\/\//, '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    var reHref = new RegExp('href="https?://' + host + '/(?:anime/)?([a-z0-9-]+)/"', 'i');
    var reAnime = new RegExp('href="https?://' + host + '/anime/', 'i');
    var re = /<article class="(?:bs|stylefor)"[^>]*>([\s\S]*?)<\/article>/g;
    var m;
    while ((m = re.exec(html)) !== null) {
      var body = m[1];
      var isSeriesRow = reAnime.test(body);
      var link = body.match(reHref);
      if (!link) continue;
      var slug = link[1];
      if (slug === 'feed' || slug === 'list-mode' || slug === 'page') continue;
      var img = body.match(/<img[^>]*>/i);
      var poster = '';
      if (img) {
        poster = attr(img[0], 'src') || attr(img[0], 'data-original') || attr(img[0], 'data-lazy-src');
      }
      var title = '';
      var tm = body.match(/title="([^"]+)"/i);
      if (tm) title = stripTags(decodeEntities(tm[1]));
      if (!title && img) {
        var alt = attr(img[0], 'alt') || attr(img[0], 'title');
        if (alt) title = stripTags(decodeEntities(alt));
      }
      if (!title) continue;

      var epm = slug.match(/^(.*)-episode-\d+$/);
      if (epm) {
        slug = epm[1];
        title = title.replace(/\s*[-\u2013\u2014]?\s*Episode\s*\d+.*$/i, '');
      }
      // v4.0.0: accept non-episode rows too (symmetry with kissasian) —
      // every /anime/?order=update row carries /anime/ links anyway.
      if (seen[slug]) continue;
      seen[slug] = true;
      items.push({
        slug: slug,
        url: cfg.animoSite + '/anime/' + slug + '/',
        source: 'an',
        type: 'series',
        title: collapseWs(title),
        year: '',
        poster: poster,
        description: ''
      });
    }
    return items;
  }

  function animoParseUrl(cfg, url) {
    return fetchTextWithRetry(cfg, url, 12000).then(function (html) {
      return animoParseListPage(cfg, html);
    });
  }

  function animoPageRaw(cfg, url) {
    return fetchPageCached(cfg, url, animoParseUrl);
  }

  function animoPageMetas(cfg, def, page, extras) {
    var url;
    var search = String(extras.search || '').trim();
    if (search) {
      url = page === 1
        ? cfg.animoSite + '/?s=' + encodeURIComponent(search)
        : cfg.animoSite + '/page/' + page + '/?s=' + encodeURIComponent(search);
    } else {
      url = page === 1
        ? cfg.animoSite + '/anime/?status=&type=&order=update'
        : cfg.animoSite + '/anime/?status=&type=&order=update&page=' + page;
    }
    return animoPageRaw(cfg, url).then(function (items) {
      if (!items.length) return [];
      return resolveBatch(cfg, items);
    });
  }

  // ===== source 6: pencurimovie.baby (WordPress "MovieMo" HTML) =====
  // v5.2.0 NEW SOURCE. Flat item lists: <div data-movie-id class="ml-item">
  // -> a.ml-mask[href=absolute page][oldtitle="Title (Year)"] with a
  // TMDB-hosted poster and an mli-eps "Eps N" badge on series rows.
  // Row types: mli-eps present -> series, else movie (the user's 7 sections
  // mix both; the paired pencuri.js plugin re-sniffs the page when playing).

  var PEN_SKIP_SLUGS = {
    feed: 1, 'list-mode': 1, page: 1, 'wp-json': 1, 'request-movie': 1,
    genre: 1, country: 1, series: 1, movies: 1, episode: 1, release: 1,
    'release-year': 1, most: 1, top: 1, search: 1, tag: 1, profile: 1,
    login: 1, register: 1, notice: 1, dmca: 1, contact: 1, sitemap: 1
  };

  function penParseListPage(cfg, html) {
    var items = [];
    var seen = {};
    var host = String(cfg.pencuriSite || '').replace(/^https?:\/\//, '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // v5.3.0: series rows on the live site carry a /series/ prefix
    // (/series/{slug}/ — verified on ww44 /series/ and /?s= search rows);
    // movies stay unprefixed (/{slug}/). Capture the optional prefix so
    // series rows parse instead of being dropped.
    var reAnchor = new RegExp('<a href="https?://' + host + '/((?:series|movies)/)?([a-z0-9][a-z0-9-]*)/"[^>]*oldtitle="([^"]+)"', 'i');
    var reEps = /class="mli-eps"[\s\S]{0,80}Eps\s*<i>\s*(\d+)/i;
    var reQuality = /class="mli-quality-text">([^<]+)</i;
    // flat list: each item starts at its data-movie-id marker
    var chunks = String(html || '').split(/<div data-movie-id="\d+"[^>]*class="ml-item/);
    for (var i = 1; i < chunks.length; i++) {
      var body = chunks[i].length > 4000 ? chunks[i].slice(0, 4000) : chunks[i];
      var a = body.match(reAnchor);
      if (!a) continue;
      var hrefPrefix = a[1] ? a[1].replace(/\/+$/, '').toLowerCase() : '';
      var slug = a[2];
      if (PEN_SKIP_SLUGS[slug]) continue;
      var title = stripTags(decodeEntities(a[3] || ''));
      if (!title) continue;
      var year = '';
      var ym = title.match(/\s*\((\d{4})\)\s*$/);
      if (ym) {
        year = ym[1];
        title = title.replace(/\s*\((\d{4})\)\s*$/, '');
      } else {
        var sm = slug.match(/^(.*?)-(\d{4})$/);
        if (sm) year = sm[2];
      }
      var em = body.match(reEps);
      var qm = body.match(reQuality);
      // row type: the site's own /series/ href prefix is authoritative,
      // the mli-eps badge is the fallback signal (mix sections)
      var isSeries = hrefPrefix === 'series' || !!em;
      var url = cfg.pencuriSite +
        (isSeries ? '/series/' + slug + '/' : '/' + slug + '/');
      if (seen[url]) continue;
      seen[url] = true;
      var img = body.match(/<img[^>]*>/i);
      var poster = '';
      if (img) poster = attr(img[0], 'src') || attr(img[0], 'data-original') || attr(img[0], 'data-lazy-src') || '';
      if (poster && !/^https?:\/\//i.test(poster)) poster = '';
      items.push({
        slug: slug,
        url: url,
        source: 'pen',
        type: isSeries ? 'series' : 'movie',
        title: collapseWs(title),
        year: year,
        poster: poster,
        description: '',
        rating: '',
        quality: qm ? collapseWs(stripTags(decodeEntities(qm[1]))) : '',
        episodes: em ? parseInt(em[1], 10) : 0
      });
    }
    return items;
  }

  function penParseUrl(cfg, url) {
    return fetchTextWithRetry(cfg, url, 12000).then(function (html) {
      return penParseListPage(cfg, html);
    });
  }

  function penPageRaw(cfg, url) {
    return fetchPageCached(cfg, url, penParseUrl);
  }

  function penPageMetas(cfg, def, page, extras) {
    var url;
    var search = String(extras.search || '').trim();
    if (search) {
      // WordPress-standard search (verified: returns ml-item rows)
      url = page === 1
        ? cfg.pencuriSite + '/?s=' + encodeURIComponent(search)
        : cfg.pencuriSite + '/page/' + page + '/?s=' + encodeURIComponent(search);
    } else {
      var path = String(def.penPath || '').replace(/\/+$/, '');
      url = page === 1
        ? cfg.pencuriSite + '/' + path + '/'
        : cfg.pencuriSite + '/' + path + '/page/' + page + '/';
    }
    return penPageRaw(cfg, url).then(function (items) {
      // v5.3.0: typed catalogs — /movies/ keeps movie rows (the site's
      // sticky series block drops out) and /series/ keeps series rows.
      // v5.4.0: ONLY defs flagged penTyped filter rows — the re-added
      // country/feature boards mix movies and series exactly like the
      // original v5.2.0 sections did.
      var out = [];
      for (var i = 0; i < items.length; i++) {
        if (!def.penTyped || (def.type === 'series' ? items[i].type === 'series' : items[i].type !== 'series')) out.push(items[i]);
      }
      if (!out.length) return [];
      return resolveBatch(cfg, out);
    });
  }

  // ===== source 5: kisskh (JSON API, mirror rotation) =====
  // v4.0.0 NEW SOURCE. kisskh serves a clean JSON API; datacenter egresses
  // are usually CF-challenged, so every request rotates nl -> ovh -> co
  // (first success pinned) and every catalog is fail-soft (empty row set,
  // never a 500). List endpoint:
  //   /api/DramaList/List/{page}?type={K|C|H|A|KC}&sub=0&sort={latest|rate|
  //   popular|ongoing}[&status=Upcoming]
  // Response: { total, page, totalPages, datas: [{ id, title, release_date,
  //   poster_path, episode_count, type: "TV"|"Movie", ... }] }

  var kisskhActiveHost = null;

  // v4.1.0 TMDB RESCUE ------------------------------------------------------
  // When all mirrors are CF-challenged there is NO transport lane to the
  // real API from datacenter runtimes (direct + free CORS proxies probed
  // 2026-09-10: allorigins/codetabs/r.jina.ai/cors.lol/whateverorigin all
  // receive the same challenge or error; kisskh.org/.asia/.cc are unrelated
  // WordPress clones, not this API). The 7 KissKH catalogs then fall back
  // to TMDB-curated lists that mirror each section's intent:
  //
  //   kisskh-latest      -> TMDB trending TV this week ("Latest Update")
  //   kisskh-top-kdrama  -> discover TV origin=KR by popularity
  //   kisskh-top-cdrama  -> discover TV origin=CN|TW|HK by popularity
  //   kisskh-hollywood   -> discover TV origin=US by popularity
  //   kisskh-hollywood-movies -> discover MOVIES origin=US by popularity
  //   kisskh-anime       -> discover TV genre=16 (animation) origin=JP
  //   kisskh-upcoming    -> discover TV origin=KR|CN|TW|HK with
  //                         first_air_date >= today ("Upcomming")
  //
  // Rows are emitted in the SAME shape as normally TMDB-matched rows (id
  // `tmdb:<id>`, overview, year, rating, backdrop) — kisskh.js v4.3.0 strips
  // the `tmdb:` prefix and resolves them on-device by title-searching the
  // real kisskh API over the device's residential egress. The direct lane
  // (asian:kh-<dramaId>) is untouched and keeps working whenever the API is
  // reachable (then the rescue is never consulted).

  var kisskhRescueState = { engaged: false, ts: 0, catalog: '' };

  function kisskhMarkRescue(catalogId) {
    kisskhRescueState.engaged = true;
    kisskhRescueState.ts = Date.now();
    kisskhRescueState.catalog = String(catalogId || '');
  }

  var KISSKH_TMDB_RESCUE = {
    'kisskh-latest':           { kind: 'tv', path: '/trending/tv/week', q: '' },
    'kisskh-top-kdrama':       { kind: 'tv', path: '/discover/tv', q: 'with_origin_country=KR&sort_by=popularity.desc&include_null_first_air_dates=false' },
    'kisskh-top-cdrama':       { kind: 'tv', path: '/discover/tv', q: 'with_origin_country=CN|TW|HK&sort_by=popularity.desc&include_null_first_air_dates=false' },
    'kisskh-hollywood':        { kind: 'tv', path: '/discover/tv', q: 'with_origin_country=US&sort_by=popularity.desc&include_null_first_air_dates=false' },
    'kisskh-hollywood-movies': { kind: 'movie', path: '/discover/movie', q: 'with_origin_country=US&sort_by=popularity.desc' },
    'kisskh-anime':            { kind: 'tv', path: '/discover/tv', q: 'with_genres=16&with_origin_country=JP&sort_by=popularity.desc&include_null_first_air_dates=false' },
    'kisskh-upcoming':         { kind: 'tv', path: '/discover/tv', q: 'with_origin_country=KR|CN|TW|HK&sort_by=popularity.desc&include_null_first_air_dates=false', upcoming: true }
  };

  function kisskhRescueUrl(cfg, spec, page) {
    var q = 'api_key=' + encodeURIComponent(cfg.tmdbKey) + '&page=' + page;
    if (spec.upcoming) {
      var d = new Date(cfg.nowFn());
      var pad = function (n) { return (n < 10 ? '0' : '') + n; };
      q += '&first_air_date.gte=' + d.getUTCFullYear() + '-' + pad(d.getUTCMonth() + 1) + '-' + pad(d.getUTCDate());
    }
    if (spec.q) {
      // encode the VALUES (e.g. "CN|TW|HK" -> CN%7CTW%7CHK) but keep the
      // k=v&k=v structure intact for strict proxies/CDNs
      q += '&' + spec.q.split('&').map(function (kv) {
        var eq = kv.indexOf('=');
        return eq === -1 ? kv : kv.substring(0, eq) + '=' + encodeURIComponent(kv.substring(eq + 1));
      }).join('&');
    }
    return 'https://api.themoviedb.org/3' + spec.path + '?' + q;
  }

  // TMDB record -> meta, identical to toMeta()'s TMDB-matched branch (no
  // re-resolution needed — the row IS a TMDB record).
  function tmdbRowToMetaDirect(cfg, r, forcedKind) {
    if (!r || r.id === undefined || r.id === null) return null;
    var type;
    if (forcedKind === 'movie') type = 'movie';
    else if (forcedKind === 'tv') type = 'series';
    else if (r.media_type === 'movie') type = 'movie';
    else if (r.media_type === 'tv') type = 'series';
    else return null;
    var name = r.name || r.title || r.original_name || r.original_title || '';
    if (!String(name).trim()) return null;
    var meta = {
      id: 'tmdb:' + r.id,
      type: type,
      name: cleanDisplayName(name),
      poster: tmdbImg('w342', r.poster_path || ''),
      posterShape: 'poster'
    };
    var bg = tmdbImg('w780', r.backdrop_path || '');
    if (bg) meta.background = bg;
    if (r.overview) meta.description = r.overview;
    var yr = String(r.release_date || r.first_air_date || '').split('-')[0];
    if (yr) meta.releaseInfo = yr;
    if (typeof r.vote_average === 'number' && r.vote_average > 0) {
      meta.imdbRating = Math.round(r.vote_average * 10) / 10;
    }
    return meta;
  }

  // Rescue page for a KissKH catalog (or TMDB multi-search when the catalog
  // was asked to search). Applies the catalog's type filter, dedupes ids.
  function kisskhTmdbRescuePage(cfg, def, page, search) {
    var spec = search
      ? { kind: '', path: '/search/multi', q: '' }
      : (KISSKH_TMDB_RESCUE[def.id] || null);
    if (!spec) return Promise.resolve([]);
    var url = kisskhRescueUrl(cfg, spec, search ? 1 : page);
    if (search) url += '&query=' + encodeURIComponent(search) + '&include_adult=false';
    return fetchJson(cfg, url, 12000).then(function (data) {
      var rows = data && Array.isArray(data.results) ? data.results : [];
      var out = [];
      var seen = {};
      for (var i = 0; i < rows.length; i++) {
        var meta = tmdbRowToMetaDirect(cfg, rows[i], spec.kind || '');
        if (!meta || seen[meta.id]) continue;
        if (def.type === 'movie' && meta.type !== 'movie') continue;
        if (def.type === 'series' && meta.type !== 'series') continue;
        seen[meta.id] = true;
        out.push(meta);
      }
      if (out.length) kisskhMarkRescue(def.id);
      return out;
    });
  }

  function kisskhFetchJson(cfg, path) {
    var preferred = kisskhActiveHost ? [kisskhActiveHost] : [];
    var hosts = preferred.concat(cfg.kisskhHosts.filter(function (h) {
      return preferred.indexOf(h) === -1;
    }));
    function attempt(i) {
      if (i >= hosts.length) {
        return Promise.reject(new Error('all kisskh hosts failed (' + hosts.join(', ') + ')'));
      }
      return fetchJson(cfg, hosts[i] + path, 12000).then(function (data) {
        kisskhActiveHost = hosts[i];
        return data;
      }).catch(function (err) {
        if (i + 1 < hosts.length) return attempt(i + 1);
        throw err;
      });
    }
    return attempt(0);
  }

  // Per-catalog candidate query strings — the first one returning non-empty
  // datas wins (lets the untestable-from-datacenter params self-heal at
  // runtime, e.g. status=Upcoming).
  var KISSKH_SECTIONS = {
    'kisskh-latest': ['type=KC&sub=0&sort=latest', 'type=K&sub=0&sort=latest'],
    'kisskh-top-kdrama': ['type=K&sub=0&sort=rate', 'type=K&sub=0&sort=popular'],
    'kisskh-top-cdrama': ['type=C&sub=0&sort=rate', 'type=C&sub=0&sort=popular'],
    'kisskh-hollywood': ['type=H&sub=0&sort=latest'],
    'kisskh-anime': ['type=A&sub=0&sort=latest'],
    'kisskh-upcoming': ['type=KC&sub=0&sort=latest&status=Upcoming', 'type=KC&sub=0&sort=ongoing']
  };

  function kisskhRowToItem(cfg, row) {
    if (!row || row.id === undefined || row.id === null) return null;
    var title = String(row.title || '').trim();
    if (!title) return null;
    var poster = String(row.poster_path || '').trim();
    if (poster) {
      // kisskh posters may be absolute or host-relative — resolve the
      // relative form against the ACTIVE mirror (never the other sources)
      if (poster.indexOf('//') === 0) poster = 'https:' + poster;
      else if (poster.charAt(0) === '/') {
        poster = (kisskhActiveHost || cfg.kisskhHosts[0]) + poster;
      }
    }
    return {
      source: 'kh',
      sourceId: String(row.id),
      type: String(row.type || '') === 'Movie' ? 'movie' : 'series',
      title: collapseWs(decodeEntities(title)),
      year: String(row.release_date || '').split('-')[0] || '',
      poster: poster,
      rating: row.rate !== undefined && row.rate !== null ? String(row.rate) : '',
      description: ''
    };
  }

  function kisskhListRaw(cfg, def, page) {
    var queries = KISSKH_SECTIONS[def.id] || ['type=KC&sub=0&sort=latest'];
    function run(idx) {
      if (idx >= queries.length) return Promise.resolve([]);
      var url = '/api/DramaList/List/' + page + '?' + queries[idx] + '&title=';
      return kisskhFetchJson(cfg, url).then(function (data) {
        var rows = data && Array.isArray(data.datas) ? data.datas : [];
        if (!rows.length && idx + 1 < queries.length) return run(idx + 1);
        return rows;
      }).catch(function (err) {
        // a param-specific 4xx on a deeper candidate should try the next
        // candidate once; repeated failures propagate (fail-soft upstream)
        if (idx + 1 < queries.length) return run(idx + 1);
        throw err;
      });
    }
    return run(0);
  }

  function kisskhSearchRaw(cfg, query) {
    var url = '/api/DramaList/Search?q=' + encodeURIComponent(query) + '&type=0';
    return kisskhFetchJson(cfg, url).then(function (list) {
      return Array.isArray(list) ? list : [];
    });
  }

  function kisskhItemsToMetas(cfg, rows, typeFilter) {
    var items = [];
    for (var i = 0; i < rows.length; i++) {
      var it = kisskhRowToItem(cfg, rows[i]);
      if (!it) continue;
      if (typeFilter === 'movie' && it.type !== 'movie') continue;
      if (typeFilter === 'series' && it.type !== 'series') continue;
      items.push(it);
    }
    if (!items.length) return Promise.resolve([]);
    return resolveBatch(cfg, items);
  }

  function kisskhPageMetas(cfg, def, page, extras) {
    var search = String(extras.search || '').trim();
    var listPromise;
    if (search) {
      listPromise = kisskhSearchRaw(cfg, search).then(function (rows) {
        return kisskhItemsToMetas(cfg, rows, def.type);
      });
    } else {
      listPromise = kisskhListRaw(cfg, def, page).then(function (rows) {
        return kisskhItemsToMetas(cfg, rows, def.type);
      });
    }
    // v4.1.0: every mirror failed (CF-challenged datacenter egress) — serve
    // the section from the TMDB rescue list instead of an empty page. If the
    // rescue itself fails, degrade to empty (fail-soft contract).
    return listPromise.catch(function () {
      return kisskhTmdbRescuePage(cfg, def, page, search).catch(function () {
        return [];
      });
    });
  }

  // ===== source 6: Anikoto API (v5.0.0) — anime sections + anime ids =====
  // https://anikotoapi.site — GET /recent-anime?page=N&per_page=50
  // Rows: {id,title,alternative,titles,native,slug,rating,poster,is_dub,
  //        is_sub,description,aired,season,year,duration,status,score,
  //        mal_id,ani_id,episodes,source,s_id,background_image,updated_at,
  //        next_air_schedule_time,next_air_ep,terms_by_type}
  // (all fields verified live 2026-09-11; all 50 sampled rows carry mal_id)

  function anikotoFetchJson(cfg, path) {
    return fetchJson(cfg, cfg.anikotoApi + path, 12000);
  }

  function anikotoFeedPage(cfg, page) {
    var url = cfg.anikotoApi + '/recent-anime?page=' + page + '&per_page=' + ANIKOTO_PER_PAGE;
    return fetchPageCached(cfg, url, function (c, u) {
      return fetchJson(c, u, 12000).then(function (d) {
        return (d && Array.isArray(d.data)) ? d.data : [];
      });
    });
  }

  // Feed row -> catalog meta carrying the ANIME id (not a TMDB id).
  // mal_id wins (MegaPlay's primary route), then ani_id (AniList), then the
  // anikoto series id (miruro 2.4.0+ resolves it to MegaPlay's s-2 route).
  function anikotoRowToMeta(cfg, row) {
    var name = cleanDisplayName(row.title || row.titles || row.alternative || row.native);
    if (!name) return null;
    var animeId = null;
    var malId = parseInt(row.mal_id, 10);
    var aniId = parseInt(row.ani_id, 10);
    if (isFinite(malId) && malId > 0) animeId = 'mal:' + malId;
    else if (isFinite(aniId) && aniId > 0) animeId = 'anilist:' + aniId;
    else if (row.id) animeId = 'anikoto:' + row.id;
    if (!animeId) return null;
    var meta = {
      id: animeId,
      type: 'series',
      name: name,
      poster: (/^https?:\/\//i.test(String(row.poster || '')) && !isPlaceholderPoster(row.poster)) ? row.poster : undefined,
      posterShape: 'poster',
      description: stripTags(row.description || '') || undefined,
      releaseInfo: row.year ? String(row.year) : undefined,
      status: row.status || undefined
    };
    var bg = (/^https?:\/\//i.test(String(row.background_image || ''))) ? row.background_image : undefined;
    if (bg) meta.background = bg;
    var score = parseFloat(row.score);
    if (isFinite(score) && score > 0 && score <= 10) meta.imdbRating = Math.round(score * 10) / 10;
    if (Array.isArray(row.terms_by_type && row.terms_by_type.genre)) meta.genres = row.terms_by_type.genre.slice(0, 6);
    return meta;
  }

  function anikotoPageMetas(cfg, def, page, extras) {
    if (page > ANIKOTO_MAX_PAGES) return Promise.resolve([]); // rate-limit guard
    var mode = def.mode || 'latest';
    return anikotoFeedPage(cfg, page).then(function (rows) {
      var currentYear = new Date().getFullYear();
      var out = [];
      if (mode === 'newadded') rows = rows.slice().sort(function (a, b) { return (parseInt(b.id, 10) || 0) - (parseInt(a.id, 10) || 0); });
      for (var i = 0; i < rows.length; i++) {
        var r = rows[i];
        if (mode === 'newrelease' && !(parseInt(r.year, 10) === currentYear && r.status === 'Currently Airing')) continue;
        if (mode === 'upcoming' && r.status !== 'Not yet aired') continue;
        if (mode === 'completed' && r.status !== 'Finished Airing') continue;
        var meta = anikotoRowToMeta(cfg, r);
        if (meta) out.push(meta);
      }
      return out;
    });
  }

  // ===== /meta resource (v5.0.0) — details for mal:/anikoto: ids =====
  // Nuvio passes unknown-prefix ids to plugins verbatim, but the DETAILS
  // screen needs a meta provider for the id prefix. These handlers build
  // Stremio meta with flat anime episode numbering (season 1, episode N),
  // which is exactly the numbering MegaPlay's mal/ani/s-2 routes expect.

  function jikanGap() {
    var wait = _jikanLastReq + JIKAN_GAP_MS - Date.now();
    if (wait <= 0) { _jikanLastReq = Date.now(); return Promise.resolve(); }
    _jikanLastReq = Date.now() + wait;
    if (typeof setTimeout !== 'function') return Promise.resolve();
    return new Promise(function (resolve) { setTimeout(resolve, wait); });
  }

  function metaCacheGet(cfg, key) {
    var hit = metaCache.get(key);
    if (hit && cfg.nowFn() - hit.ts < META_CACHE_TTL) return hit.meta;
    if (hit) metaCache.delete(key);
    return null;
  }

  function metaCacheSet(cfg, key, meta) {
    metaCache.set(key, { ts: cfg.nowFn(), meta: meta });
    cachePrune(metaCache, 300);
  }

  // v5.1.0: Jikan wraps upstream MAL outages in HTTP 200 bodies (verified
  // live 2026-09-11: {"status":500,"type":"UpstreamException","message":
  // "Request to MyAnimeList.net timed out ..."}). Treat those shapes - and
  // any HTTP error (504/429/500) - as a FAILURE, not as data.
  function jikanLooksDown(d) {
    if (!d) return true;
    if (d.status === 500 || d.status === 502 || d.status === 503 || d.status === 504 || d.status === 429) return true;
    var sig = String((d && (d.message || d.error || d.type)) || '');
    return /UpstreamException|timed out|timeout|rate.?limit/i.test(sig);
  }

  function jikanAnimeFull(cfg, malId) {
    // v5.1.0: one paced retry (upstream MAL timeouts are often transient),
    // and NEVER a thrown rejection - a Jikan outage must not 502 the meta
    // route when the Anikoto fallback can still build the details page.
    function once() {
      return jikanGap().then(function () {
        return fetchJson(cfg, cfg.jikanApi + '/anime/' + encodeURIComponent(malId), 12000);
      }).then(function (d) {
        return (!d || jikanLooksDown(d)) ? null : ((d.data) ? d.data : null);
      });
    }
    function failSoft() { return Promise.resolve(null); }
    return once().then(function (a) {
      if (a) return a;
      return jikanGap().then(function () { return once(); }).then(function (a2) { return a2 || null; }).catch(failSoft);
    }).catch(function () {
      return jikanGap().then(function () { return once(); }).then(function (a2) { return a2 || null; }).catch(failSoft);
    });
  }

  function jikanEpisodePage(cfg, malId, page) {
    return jikanGap().then(function () {
      return fetchJson(cfg, cfg.jikanApi + '/anime/' + encodeURIComponent(malId) + '/episodes?page=' + page, 12000);
    }).then(function (d) {
      if (!d || jikanLooksDown(d)) return [];   // v5.1.0: 200-wrapped outage bodies
      return (d.data && Array.isArray(d.data)) ? d.data : [];
    }).catch(function () { return []; });
  }

  // v5.1.0: mal_id -> anikoto series-id reverse map, built from the same
  // feed pages the sections already scan (cached ~30min so /meta/mal requests
  // usually skip the extra HTTP entirely; Anikoto allows 60 req/120s).
  var ANIKOTO_META_PAGES = 6;   // ~300 most-recent rows cover the anime sections
  var ANIKOTO_MAP_TTL = 30 * 60 * 1000;
  var _anikotoByMal = null;     // { malId: anikotoId }
  var _anikotoByMalTs = 0;
  var _anikotoByMalInflight = null;
  function anikotoByMalMap(cfg) {
    var now = cfg.nowFn();
    if (_anikotoByMal && now - _anikotoByMalTs < ANIKOTO_MAP_TTL) return Promise.resolve(_anikotoByMal);
    if (_anikotoByMalInflight) return _anikotoByMalInflight;
    var pages = [];
    for (var p = 1; p <= ANIKOTO_META_PAGES; p++) {
      pages.push(anikotoFeedPage(cfg, p).catch(function () { return []; }));
    }
    _anikotoByMalInflight = Promise.all(pages).then(function (all) {
      var map = {};
      all.forEach(function (rows) {
        (rows || []).forEach(function (r) {
          var m = parseInt(r && r.mal_id, 10);
          if (isFinite(m) && m > 0 && r.id) map[m] = String(r.id);
        });
      });
      _anikotoByMal = map;
      _anikotoByMalTs = cfg.nowFn();
      _anikotoByMalInflight = null;
      return map;
    }).catch(function () {
      _anikotoByMalInflight = null;
      return {};
    });
    return _anikotoByMalInflight;
  }

  function metaForMal(cfg, malId, reqType) {
    var key = 'mal:' + malId;
    var cached = metaCacheGet(cfg, key);
    if (cached) return Promise.resolve(cached);
    // v5.1.0: Jikan AND the mapped Anikoto /series resolve IN PARALLEL, so a
    // full MAL/Jikan outage can no longer blank the details page (the exact
    // "comes up empty" report of 2026-09-11). EPISODES prefer the Anikoto
    // list: it is the library the user actually watches and the freshest for
    // airing shows (the newest episode shows up the day Anikoto adds it,
    // while MAL/Jikan episode pages lag by hours-to-days).
    return Promise.all([
      jikanAnimeFull(cfg, malId),
      anikotoByMalMap(cfg).then(function (map) {
        var aid = map[parseInt(malId, 10)];
        if (!aid) return null;
        return anikotoFetchJson(cfg, '/series/' + encodeURIComponent(aid)).then(function (d) {
          return (d && d.data) ? d.data : null;
        }).catch(function () { return null; });
      }).catch(function () { return null; })
    ]).then(function (parts) {
      var a = parts[0];
      var sData = parts[1];
      var sa = sData && sData.anime ? sData.anime : null;
      var aName = a ? (a.title_english || a.title) : '';
      var saName = sa ? cleanDisplayName(sa.title || sa.titles || sa.alternative || sa.native) : '';
      if ((!aName && !saName) || (!a && !sa)) return null;
      var isMovie = a ? String(a.type || '').toLowerCase() === 'movie' : false;
      var meta = {
        id: key,
        type: 'series',
        name: aName || saName,
        posterShape: 'poster'
      };
      var jikanPoster = a && a.images && a.images.jpg ? (a.images.jpg.large_image_url || a.images.jpg.image_url) : undefined;
      var aniPoster = sa && /^https?:\/\//i.test(String(sa.poster || '')) && !isPlaceholderPoster(sa.poster) ? sa.poster : undefined;
      meta.poster = jikanPoster || aniPoster || undefined;
      var jikanDesc = a && a.synopsis ? String(a.synopsis).replace(/\[Written by MAL Rewrite\]\s*$/i, '').trim() : '';
      meta.description = jikanDesc || (sa ? stripTags(sa.description || '') : '') || undefined;
      var jikanYear = a ? (a.year ? String(a.year) : (a.aired && a.aired.from ? String(a.aired.from).split('-')[0] : undefined)) : undefined;
      meta.releaseInfo = jikanYear || (sa && sa.year ? String(sa.year) : undefined);
      meta.status = (a && a.status) || (sa && sa.status) || undefined;
      if (a && a.duration) meta.runtime = String(a.duration).replace(/^per ep\s*/i, '');
      var jikanScore = a ? parseFloat(a.score) : NaN;
      var aniScore = sa ? parseFloat(sa.score) : NaN;
      var score = isFinite(jikanScore) && jikanScore > 0 ? jikanScore :
        (isFinite(aniScore) && aniScore > 0 && aniScore <= 10 ? Math.round(aniScore * 10) / 10 : undefined);
      if (score) meta.imdbRating = score;
      var genres = (a && Array.isArray(a.genres) && a.genres.length)
        ? a.genres.map(function (g) { return g.name; })
        : (sa && sa.terms_by_type && Array.isArray(sa.terms_by_type.genre) ? sa.terms_by_type.genre : []);
      if (genres.length) meta.genres = genres.slice(0, 6);
      var bg = (a && a.trailer && a.trailer.images && a.trailer.images.maximum_image_url) ||
        (sa && /^https?:\/\//i.test(String(sa.background_image || '')) ? sa.background_image : undefined);
      if (bg) meta.background = bg;
      if (!isMovie) {
        var aniEps = sData && Array.isArray(sData.episodes) ? sData.episodes : [];
        if (aniEps.length) {
          var aniVideos = [];
          for (var ae = 0; ae < aniEps.length; ae++) {
            var aep = aniEps[ae] || {};
            var anum = parseInt(aep.number, 10);
            if (!isFinite(anum) || anum <= 0) continue;
            aniVideos.push({
              id: key + ':1:' + anum,
              title: aep.title || ('Episode ' + anum),
              season: 1,
              episode: anum,
              released: aep.updated_at ? aep.updated_at : null
            });
          }
          aniVideos.sort(function (x, y) { return x.episode - y.episode; });
          if (aniVideos.length) {
            meta.videos = aniVideos;
            metaCacheSet(cfg, key, meta);
            return meta;
          }
        }
        // Jikan episode pages: 100 per page, up to 3 pages (300 eps) — enough
        // for the vast majority; keeps a cold details open under ~1.5s of Jikan
        var pagePromises = [jikanEpisodePage(cfg, malId, 1), jikanEpisodePage(cfg, malId, 2), jikanEpisodePage(cfg, malId, 3)];
        return Promise.all(pagePromises).then(function (pages) {
          var videos = [];
          var n = 0;
          for (var p = 0; p < pages.length; p++) {
            for (var i = 0; i < pages[p].length; i++) {
              n++;
              var ep = pages[p][i] || {};
              videos.push({
                id: key + ':1:' + n,
                title: ep.title || ('Episode ' + n),
                season: 1,
                episode: n,
                released: ep.aired ? ep.aired : null
              });
            }
          }
          if (videos.length) meta.videos = videos;
          else {
            // v5.1.0: the episode-count placeholder now also survives a Jikan
            // outage via the Anikoto row's own episode count.
            var countHint = a && a.episodes ? parseInt(a.episodes, 10) : (sa && sa.episodes ? parseInt(sa.episodes, 10) : 0);
            if (countHint > 0) {
              var max = Math.min(countHint, 300);
              for (var k = 1; k <= max; k++) {
                videos.push({ id: key + ':1:' + k, title: 'Episode ' + k, season: 1, episode: k, released: null });
              }
              meta.videos = videos;
            }
          }
          metaCacheSet(cfg, key, meta);
          return meta;
        });
      }
      metaCacheSet(cfg, key, meta);
      return meta;
    });
  }

  function metaForAnikoto(cfg, anikotoId) {
    var key = 'anikoto:' + anikotoId;
    var cached = metaCacheGet(cfg, key);
    if (cached) return Promise.resolve(cached);
    return anikotoFetchJson(cfg, '/series/' + encodeURIComponent(anikotoId)).then(function (d) {
      var data = d && d.data ? d.data : null;
      var a = data && data.anime ? data.anime : null;
      if (!a || !a.title) return null;
      var meta = {
        id: key,
        type: 'series',
        name: cleanDisplayName(a.title),
        poster: (/^https?:\/\//i.test(String(a.poster || ''))) ? a.poster : undefined,
        posterShape: 'poster',
        description: stripTags(a.description || '') || undefined,
        releaseInfo: a.year ? String(a.year) : undefined,
        status: a.status || undefined
      };
      var bg = (/^https?:\/\//i.test(String(a.background_image || ''))) ? a.background_image : undefined;
      if (bg) meta.background = bg;
      var score = parseFloat(a.score);
      if (isFinite(score) && score > 0 && score <= 10) meta.imdbRating = Math.round(score * 10) / 10;
      if (Array.isArray(a.terms_by_type && a.terms_by_type.genre)) meta.genres = a.terms_by_type.genre.slice(0, 6);
      var eps = Array.isArray(data.episodes) ? data.episodes : [];
      var videos = [];
      for (var i = 0; i < eps.length; i++) {
        var ep = eps[i] || {};
        var num = parseInt(ep.number, 10);
        if (!isFinite(num) || num <= 0) continue;
        videos.push({
          id: key + ':1:' + num,
          title: ep.title || ('Episode ' + num),
          season: 1,
          episode: num,
          released: ep.updated_at ? ep.updated_at : null
        });
      }
      if (videos.length) meta.videos = videos;
      metaCacheSet(cfg, key, meta);
      return meta;
    });
  }

  // ===== v5.3.0: real details for source-scoped asian: fallback ids =====
  // Unmatched rows used to fall through to asian:pmh-/asian:pen- ids that
  // NO addon served (/meta 404) and that Nuvio's TMDB fallback cannot
  // resolve either -> the app's "could not load the details from any
  // addons" error. Both sites' detail pages are plain WordPress HTML, so
  // the addon now builds the meta itself (and Stremio-shaped videos[] for
  // series). ks/va/kh/an tails keep answering null (other plugins' lanes).

  function parseAsianMetaId(rawId) {
    var s = String(rawId || '').trim();
    if (s.indexOf('%') >= 0) {
      try { var d = decodeURIComponent(s); if (d) s = d; } catch (e) {}
      s = String(s).trim();
    }
    s = s.replace(/\.json$/i, '').replace(/(:\d+)+$/, '').trim();
    var m = s.match(/^asian[:\/]([a-z0-9][a-z0-9-]*)$/i);
    if (!m) return null;
    var tail = m[1].toLowerCase();
    var pm = tail.match(/^(pmh|pen)-([a-z0-9][a-z0-9-]*)$/);
    if (pm) return { source: pm[1], slug: pm[2] };
    return null; // ks/va/kh/an/generic tails: not ours to detail
  }

  function pmhDetailHtml(cfg, kind, slug) {
    // kind-guessed URL first (the /meta request pins the type), the other
    // archive as fallback — some rows cross-list (verified live).
    function prim() {
      return fetchTextWithRetry(cfg, cfg.pinoySite + (kind === 'series' ? '/series/' : '/movies/') + slug, 12000);
    }
    function alt() {
      return fetchTextWithRetry(cfg, cfg.pinoySite + (kind === 'series' ? '/movies/' : '/series/') + slug, 12000);
    }
    return prim().then(function (html) {
      if (html && /<h1[ >]/i.test(html)) return { html: html, kind: kind };
      return alt().then(function (html2) {
        return html2 && /<h1[ >]/i.test(html2) ? { html: html2, kind: kind === 'series' ? 'movie' : 'series' } : null;
      });
    }).catch(function () {
      return alt().then(function (html2) {
        return html2 && /<h1[ >]/i.test(html2) ? { html: html2, kind: kind === 'series' ? 'movie' : 'series' } : null;
      }).catch(function () { return null; });
    });
  }

  function pmhParseDetail(cfg, html, kind, slug) {
    var hm = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
    var name = hm ? collapseWs(stripTags(decodeEntities(hm[1]))) : '';
    if (!name) return null;
    var meta = {
      id: 'asian:pmh-' + slug,
      type: kind,
      name: name,
      posterShape: 'poster'
    };
    var pp = html.match(/<div class="poster">\s*<img[^>]*>/i);
    if (pp) {
      var poster = attr(pp[0], 'src') || attr(pp[0], 'data-src') || '';
      if (poster && /^https?:\/\//i.test(poster) && !isPlaceholderPoster(poster)) meta.poster = poster;
    }
    var dm = html.match(/<div class="wp-content[^"]*"[^>]*>([\s\S]*?)<\/div>/i);
    if (dm) {
      var desc = collapseWs(stripTags(decodeEntities(dm[1])));
      if (desc) meta.description = desc.slice(0, 700);
    }
    var ym = html.match(/itemprop=['"]?dateCreated['"]?[^>]*>\s*[A-Za-z]{3}\.[^,]*,\s*((?:19|20)\d\d)/i);
    if (ym) meta.releaseInfo = ym[1];
    var rm = html.match(/itemprop=['"]?ratingValue['"]?[^>]*>\s*([\d.]+)/i);
    var r = rm ? parseFloat(rm[1]) : NaN;
    if (isFinite(r) && r > 0 && r <= 10) meta.imdbRating = Math.round(r * 10) / 10;
    if (kind === 'series') {
      // static "Seasons and episodes" block: <div id='seasons'> ... each
      // <li> carries numerando "S - E", an /episodes/ link and a title.
      var blockM = html.match(/id=['"]seasons['"][\s\S]{0,120000}/i);
      var block = blockM ? blockM[0] : html;
      var chunks = block.split(/<li\b/i);
      var videos = [];
      for (var i = 1; i < chunks.length; i++) {
        var nm = chunks[i].match(/class=['"]numerando['"][^>]*>\s*(\d+)\s*-\s*(\d+)/i);
        if (!nm) continue;
        var s = parseInt(nm[1], 10), e = parseInt(nm[2], 10);
        if (!isFinite(s) || !isFinite(e) || s <= 0 || e <= 0) continue;
        var am2 = chunks[i].match(/href=['"]([^'"]+)['"][^>]*>([\s\S]*?)<\/a>/i);
        var epTitle = am2 ? collapseWs(stripTags(decodeEntities(am2[2]))) : '';
        var dte = chunks[i].match(/class=['"]date['"][^>]*>([^<]*)</i);
        videos.push({
          id: 'asian:pmh-' + slug + ':' + s + ':' + e,
          title: epTitle || ('Episode ' + e),
          season: s,
          episode: e,
          released: dte ? collapseWs(stripTags(decodeEntities(dte[1]))) : null
        });
      }
      if (videos.length) meta.videos = videos;
    }
    return meta;
  }

  function metaForPmh(cfg, slug, wantSeries) {
    var kind = wantSeries ? 'series' : 'movie';
    var key = 'asian:pmh-' + slug;
    var cached = metaCacheGet(cfg, key);
    if (cached) return Promise.resolve(cached);
    return pmhDetailHtml(cfg, kind, slug).then(function (hit) {
      if (!hit) return null;
      var meta = pmhParseDetail(cfg, hit.html, hit.kind, slug);
      if (meta) metaCacheSet(cfg, key, meta);
      return meta;
    }).catch(function () { return null; });
  }

  function penDetailHtml(cfg, kind, slug) {
    function prim() {
      return fetchTextWithRetry(cfg, cfg.pencuriSite + (kind === 'series' ? '/series/' : '/') + slug + '/', 12000);
    }
    function alt() {
      return fetchTextWithRetry(cfg, cfg.pencuriSite + (kind === 'series' ? '/' : '/series/') + slug + '/', 12000);
    }
    return prim().then(function (html) {
      if (html && /og:title/i.test(html)) return { html: html, kind: kind };
      return alt().then(function (html2) {
        return html2 && /og:title/i.test(html2) ? { html: html2, kind: kind === 'series' ? 'movie' : 'series' } : null;
      });
    }).catch(function () {
      return alt().then(function (html2) {
        return html2 && /og:title/i.test(html2) ? { html: html2, kind: kind === 'series' ? 'movie' : 'series' } : null;
      }).catch(function () { return null; });
    });
  }

  function penParseDetail(cfg, html, kind, slug) {
    var tm = html.match(/property=["']og:title["'] content=["']([^"']+)["']/i) ||
      html.match(/<title>([^<]*)<\/title>/i);
    var raw = tm ? collapseWs(stripTags(decodeEntities(tm[1]))) : '';
    raw = raw.replace(/\s*-\s*Pencuri Movie.*$/i, '').trim();
    if (!raw) return null;
    var name = raw, year = '';
    var ym = raw.match(/\s*\((\d{4})\)\s*$/);
    if (ym) { year = ym[1]; name = raw.replace(/\s*\((\d{4})\)\s*$/, '').trim(); }
    var meta = {
      id: 'asian:pen-' + slug,
      type: kind,
      name: name,
      posterShape: 'poster'
    };
    if (year) meta.releaseInfo = year;
    var im = html.match(/property=["']og:image["'] content=["']([^"']+)["']/i);
    if (im && /^https?:\/\//i.test(im[1]) && !isPlaceholderPoster(im[1])) meta.poster = im[1];
    var dm = html.match(/property=["']og:description["'] content=["']([^"']*)["']/i);
    if (dm && dm[1]) meta.description = collapseWs(decodeEntities(dm[1])).slice(0, 700);
    if (kind === 'series') {
      // episode links are relative /episode/{base}-season-S-episode-E/ on
      // the series page (verified: agent-kim-reactivated-2026 lists 8)
      var seen = {}, videos = [];
      var re = /\/episode\/([a-z0-9-]+?)\/?["']/gi, m;
      while ((m = re.exec(html)) !== null) {
        var epSlug = m[1];
        if (seen[epSlug]) continue;
        seen[epSlug] = 1;
        var sm = epSlug.match(/^(.*)-season-(\d+)-episode-(\d+)$/i) || epSlug.match(/^(.*)-episode-(\d+)$/i);
        if (!sm) continue;
        var isFull = sm.length === 4;
        var s = isFull ? parseInt(sm[2], 10) : 1;
        var e = parseInt(isFull ? sm[3] : sm[2], 10);
        if (!isFinite(s) || !isFinite(e) || s <= 0 || e <= 0) continue;
        videos.push({
          id: 'asian:pen-' + slug + ':' + s + ':' + e,
          title: 'Episode ' + e,
          season: s,
          episode: e,
          released: null
        });
      }
      videos.sort(function (x, y) { return x.season - y.season || x.episode - y.episode; });
      if (videos.length) meta.videos = videos;
    }
    return meta;
  }

  function metaForPen(cfg, slug, wantSeries) {
    var kind = wantSeries ? 'series' : 'movie';
    var key = 'asian:pen-' + slug;
    var cached = metaCacheGet(cfg, key);
    if (cached) return Promise.resolve(cached);
    return penDetailHtml(cfg, kind, slug).then(function (hit) {
      if (!hit) return null;
      var meta = penParseDetail(cfg, hit.html, hit.kind, slug);
      if (meta) metaCacheSet(cfg, key, meta);
      return meta;
    }).catch(function () { return null; });
  }

  // Route handler for GET /meta/{type}/{id}.json. Serves the anime id
  // spaces (mal:/anikoto:) AND, since v5.3.0, the pmh/pen tails of the
  // asian: fallback ids this addon emits (real detail-page meta). tmdb:
  // ids resolve natively in Nuvio; other asian: tails answer 404.
  function addonMeta(cfg, type, rawId) {
    var id = String(rawId || '').trim();
    var mm = id.match(/^(mal|anikoto):(\d+)$/i);
    if (mm) {
      var prefix = mm[1].toLowerCase();
      var num = mm[2];
      if (prefix === 'mal') return metaForMal(cfg, num, type);
      return metaForAnikoto(cfg, num);
    }
    var am = parseAsianMetaId(id);
    if (am) {
      var wantSeries = String(type || '').toLowerCase() === 'series' || String(type || '').toLowerCase() === 'tv';
      if (am.source === 'pmh') return metaForPmh(cfg, am.slug, wantSeries);
      return metaForPen(cfg, am.slug, wantSeries);
    }
    return Promise.resolve(null);
  }

  // ===== buffered listing engine (multi-source) =====

  function bufferStateKey(cfg, kind, ident) {
    return kind + '|' + ident;
  }

  function getBuffer(cfg, stateKey) {
    var now = cfg.nowFn();
    var buf = buffers.get(stateKey);
    if (buf && now - buf.ts > BUFFER_TTL) {
      buffers.delete(stateKey);
      buf = null;
    }
    if (!buf) {
      buf = { items: [], seen: {}, nextPage: 1, exhausted: false, dupRuns: 0, ts: now };
      buffers.set(stateKey, buf);
      cachePrune(buffers, CACHE_CAPS.buffers);
    }
    buf.ts = now;
    return buf;
  }

  // Fetches source pages into the buffer until `skip + limit` resolved items
  // exist (or the listing is exhausted), then returns the stable slice.
  // Concurrent requests for the same buffer coalesce into one pump job.
  function runBuffered(cfg, stateKey, pageMetasFn, skip, limit) {
    var existing = bufferInflight.get(stateKey);
    if (existing) return existing;

    var job = Promise.resolve().then(function () {
      var buf = getBuffer(cfg, stateKey);
      function pump(guard) {
        var need = skip + limit;
        if (buf.items.length >= need || buf.exhausted) {
          return Promise.resolve(buf.items.slice(skip, skip + limit));
        }
        if (guard > cfg.maxSitePages) {
          buf.exhausted = true;
          return Promise.resolve(buf.items.slice(skip, skip + limit));
        }
        var page = buf.nextPage;
        // Page 1 failures mean the source is down (fatal -> empty page, the
        // catalog stays browsable rather than erroring). Deeper-page
        // failures (e.g. 404 past the last listing page) exhaust silently.
        var fetchPage = pageMetasFn(page);
        var safeFetch = fetchPage.catch(function () { return null; });
        return safeFetch.then(function (metas) {
          if (page === 1) {
            // page-1 failure keeps the buffer empty but NOT exhausted:
            // the next request retries the source (site flaps recover).
            if (!metas || !metas.length) {
              return buf.items.slice(skip, skip + limit);
            }
          } else if (!metas || !metas.length) {
            buf.exhausted = true;
            return buf.items.slice(skip, skip + limit);
          }
          buf.nextPage = page + 1;
          var added = 0;
          for (var i = 0; i < metas.length; i++) {
            var meta = metas[i];
            if (meta && meta.id && !buf.seen[meta.id]) {
              buf.seen[meta.id] = true;
              buf.items.push(meta);
              added++;
            }
          }
          if (added === 0) {
            buf.dupRuns++;
            if (buf.dupRuns >= 2) {
              buf.exhausted = true;
              return buf.items.slice(skip, skip + limit);
            }
          } else {
            buf.dupRuns = 0;
          }
          return pump(guard + 1);
        });
      }
      return pump(0);
    });

    bufferInflight.set(stateKey, job);
    return job.then(
      function (r) { bufferInflight.delete(stateKey); return r; },
      function (e) { bufferInflight.delete(stateKey); throw e; }
    );
  }

  // ===== catalogs / manifest (the organized directory) =====
  // v4.0.0: the directory mirrors each website's real sections (user list).
  // v5.3.0: Pinoy Movies Hub trimmed to the site's own two archives
  // (/movies, /series — user list 2026-09-12). The home-carousel/genre
  // sections are gone; unmatched rows fell through to asian:pmh- ids that
  // could not open details — the /movies + /series archives carry full
  // TMDB coverage AND the pmh detail-page meta below now serves the rest.

  // kissasian genre chips — the home "Recommendation" tabs (Fantasy,
  // Friendship, Law, Romance, Sports; archives verified live 200).
  var KS_GENRE_CHIPS = ['Fantasy', 'Friendship', 'Law', 'Romance', 'Sports'];

  function catalogDefinitions() {
    return [
      // --- Pinoy Movies Hub (pinoymovieshub.win) — Movies + Series ---
      // (user list 2026-09-12: the site's own /movies and /series archives,
      //  paginated /movies/page/N/ + /series/page/N/)
      {
        type: 'movie', id: 'pinoy-movies', name: 'Pinoy Movies', source: 'pinoy',
        mode: 'archive',
        description: 'Movies on pinoymovieshub.win',
        extra: [{ name: 'search' }, { name: 'skip' }]
      },
      {
        type: 'series', id: 'pinoy-series', name: 'Pinoy Series', source: 'pinoy',
        mode: 'archive',
        description: 'Series on pinoymovieshub.win (teleseryes, Tagalog-dubbed shows)',
        extra: [{ name: 'search' }, { name: 'skip' }]
      },
      // --- KissAsian (kissasian.cam) — 3 catalogs ---
      {
        type: 'series', id: 'asian-series-hot', name: 'KissAsian Hot Series Update', source: 'kissasian',
        mode: 'hot',
        description: 'Hot Series Update — the hot block on kissasian.cam',
        extra: [{ name: 'search' }, { name: 'skip' }]
      },
      {
        type: 'series', id: 'asian-series', name: 'KissAsian Latest Release', source: 'kissasian',
        mode: 'archive',
        description: 'Latest Release — newest drama updates on kissasian.cam',
        extra: [{ name: 'search' }, { name: 'skip' }]
      },
      {
        type: 'series', id: 'asian-series-genre', name: 'KissAsian by Genre', source: 'kissasian',
        mode: 'genre',
        description: 'Recommendation tabs on kissasian.cam',
        extra: [{ name: 'genre', options: KS_GENRE_CHIPS.slice() }, { name: 'skip' }]
      },
      // --- ViewAsian (viewasian.lol) — 1 catalog ---
      {
        type: 'series', id: 'asian-series-viewasian', name: 'ViewAsian Recently Drama, Movie and Kshow', source: 'viewasian',
        mode: 'archive',
        description: 'Recently Drama, Movie and Kshow — the recent list on viewasian.lol',
        extra: [{ name: 'search' }, { name: 'skip' }]
      },
      // --- KissKH (kisskh.nl/ovh/co API) — 7 catalogs ---
      {
        type: 'series', id: 'kisskh-latest', name: 'KissKH Latest Update', source: 'kisskh',
        mode: 'list',
        description: 'Latest Update on kisskh (K-drama + C-drama API list)',
        extra: [{ name: 'search' }, { name: 'skip' }]
      },
      {
        type: 'series', id: 'kisskh-top-kdrama', name: 'KissKH Top K-Drama', source: 'kisskh',
        mode: 'list',
        description: 'Top K-Drama on kisskh (rated)',
        extra: [{ name: 'search' }, { name: 'skip' }]
      },
      {
        type: 'series', id: 'kisskh-top-cdrama', name: 'KissKH Top C-Drama', source: 'kisskh',
        mode: 'list',
        description: 'Top C-Drama on kisskh (rated)',
        extra: [{ name: 'search' }, { name: 'skip' }]
      },
      {
        type: 'series', id: 'kisskh-hollywood', name: 'KissKH Hollywood', source: 'kisskh',
        mode: 'list',
        description: 'Hollywood series on kisskh',
        extra: [{ name: 'search' }, { name: 'skip' }]
      },
      {
        type: 'movie', id: 'kisskh-hollywood-movies', name: 'KissKH Hollywood Movies', source: 'kisskh',
        mode: 'list',
        description: 'Hollywood movies on kisskh',
        extra: [{ name: 'search' }, { name: 'skip' }]
      },
      {
        type: 'series', id: 'kisskh-anime', name: 'KissKH Anime', source: 'kisskh',
        mode: 'list',
        description: 'Anime on kisskh',
        extra: [{ name: 'search' }, { name: 'skip' }]
      },
      {
        type: 'series', id: 'kisskh-upcoming', name: 'KissKH Upcoming', source: 'kisskh',
        mode: 'list',
        description: 'Upcoming dramas on kisskh',
        extra: [{ name: 'skip' }]
      },
      // --- AnimeTVSlash (animotvslash.org) — 1 catalog ---
      {
        type: 'series', id: 'animo-latest', name: 'AnimeTVSlash Latest Release', source: 'animo',
        mode: 'archive',
        description: 'Latest Release — newest anime updates on animotvslash.org',
        extra: [{ name: 'search' }, { name: 'skip' }]
      },
      // --- Pencuri (pencurimovie.baby) — Movies + Series (user list
      //     2026-09-12: the site's own /movies/ and /series/ listings;
      //     rows typed individually from the /series/ href prefix or the
      //     site's mli-eps badge) ---
      {
        type: 'movie', id: 'pencuri-movies', name: 'Pencuri Movies', source: 'pencuri',
        mode: 'list', penPath: 'movies', penTyped: true,
        description: 'Movies on pencurimovie.baby',
        extra: [{ name: 'search' }, { name: 'skip' }]
      },
      {
        type: 'series', id: 'pencuri-series', name: 'Pencuri Series', source: 'pencuri',
        mode: 'list', penPath: 'series', penTyped: true,
        description: 'Series on pencurimovie.baby',
        extra: [{ name: 'search' }, { name: 'skip' }]
      },
      // --- Pencuri country / feature boards — RE-ADDED in v5.4.0 (user
      //     list 2026-09-12 "additional to asian-catalog for pencuri" after
      //     v5.3.0 trimmed them to Movies + Series). Same shapes as the
      //     original v5.2.0 boards: movie-typed sections that MIX movies
      //     and series (no row filter — the paired pencuri.js re-sniffs
      //     the real page shape when playing). /top-imdb is the verified
      //     base URL (the site's /top-imdb/page alone is a 404; its
      //     pagination lives at /top-imdb/page/N/). ---
      {
        type: 'movie', id: 'pencuri-malaysia', name: 'Pencuri Malaysia', source: 'pencuri',
        mode: 'list', penPath: 'country/malaysia',
        description: 'Malaysia section on pencurimovie.baby',
        extra: [{ name: 'search' }, { name: 'skip' }]
      },
      {
        type: 'movie', id: 'pencuri-indonesia', name: 'Pencuri Indonesia', source: 'pencuri',
        mode: 'list', penPath: 'country/indonesia',
        description: 'Indonesia section on pencurimovie.baby',
        extra: [{ name: 'search' }, { name: 'skip' }]
      },
      {
        type: 'movie', id: 'pencuri-japan', name: 'Pencuri Japan', source: 'pencuri',
        mode: 'list', penPath: 'country/japan',
        description: 'Japan section on pencurimovie.baby',
        extra: [{ name: 'search' }, { name: 'skip' }]
      },
      {
        type: 'movie', id: 'pencuri-thailand', name: 'Pencuri Thailand', source: 'pencuri',
        mode: 'list', penPath: 'country/thailand',
        description: 'Thailand section on pencurimovie.baby',
        extra: [{ name: 'search' }, { name: 'skip' }]
      },
      {
        type: 'movie', id: 'pencuri-most-viewed', name: 'Pencuri Most Viewed', source: 'pencuri',
        mode: 'list', penPath: 'most-viewed',
        description: 'Most viewed on pencurimovie.baby',
        extra: [{ name: 'search' }, { name: 'skip' }]
      },
      {
        type: 'movie', id: 'pencuri-most-rating', name: 'Pencuri Most Rating', source: 'pencuri',
        mode: 'list', penPath: 'most-rating',
        description: 'Most rating on pencurimovie.baby',
        extra: [{ name: 'search' }, { name: 'skip' }]
      },
      {
        type: 'movie', id: 'pencuri-top-imdb', name: 'Pencuri Top IMDb', source: 'pencuri',
        mode: 'list', penPath: 'top-imdb',
        description: 'Top IMDb on pencurimovie.baby',
        extra: [{ name: 'search' }, { name: 'skip' }]
      },
      // --- Anikoto API (anikotoapi.site) — 5 catalogs (user list 2026-09-11;
      //     rows carry mal:/anilist:/anikoto: ids the paired plugins use) ---
      {
        type: 'series', id: 'anikoto-latest-episode', name: 'Anikoto Latest Episode', source: 'anikoto',
        mode: 'latest',
        description: 'Latest Episode — the daily episode-update feed of the Anikoto/HiAnime library (MegaPlay-backed playback)',
        extra: [{ name: 'skip' }]
      },
      {
        type: 'series', id: 'anikoto-new-release', name: 'Anikoto New Release', source: 'anikoto',
        mode: 'newrelease',
        description: 'New Release — current-year anime currently airing on the Anikoto library',
        extra: [{ name: 'skip' }]
      },
      {
        type: 'series', id: 'anikoto-new-added', name: 'Anikoto New Added', source: 'anikoto',
        mode: 'newadded',
        description: 'New Added — most recently added series on the Anikoto library',
        extra: [{ name: 'skip' }]
      },
      {
        type: 'series', id: 'anikoto-upcoming', name: 'Anikoto Upcoming Anime', source: 'anikoto',
        mode: 'upcoming',
        description: 'Upcoming Anime — not-yet-aired entries on the Anikoto library',
        extra: [{ name: 'skip' }]
      },
      {
        type: 'series', id: 'anikoto-just-completed', name: 'Anikoto Just Completed', source: 'anikoto',
        mode: 'completed',
        description: 'Just Completed — recently finished anime on the Anikoto library',
        extra: [{ name: 'skip' }]
      }
    ];
  }

  function manifest(cfg) {
    return {
      id: ADDON_ID,
      version: VERSION,
      name: ADDON_NAME,
      description: 'Asian catalogs mirroring each site\'s real sections: pinoymovieshub.win (Movies / Series), kissasian.cam, viewasian.lol, kisskh API (auto-rescued from TMDB when CF-blocked), animotvslash.org, the Anikoto API (Latest Episode / New Release / New Added / Upcoming Anime / Just Completed) and pencurimovie.baby (Movies / Series / Malaysia / Indonesia / Japan / Thailand / Most Viewed / Most Rating / Top IMDb). v5.0.0: anime rows carry ANIME ids — mal:/anilist:/anikoto: — straight from the Anikoto feed (MegaPlay-backed playback via the paired miruro plugin), plus a /meta resource (Jikan/Anikoto) so anime ids open full details with episode lists. v5.3.0: pmh/pen rows open real detail-page meta (episodes included) so no row ever 404s on details. v5.4.0: the Pencuri country and feature boards are back. Other rows carry full TMDB metadata or source-scoped asian: fallback ids. v5.5.0: catalog layout restored to the 28-catalog set validated on 4.15.0; the paired pencuri.js v1.4.0 adds English subtitles to every stream row. v5.6.0: new POST /cjg route — a text-safe relay for cinejoy.js v1.5.0 (NuvioMobile cannot send the binary body cinejoy\'s API requires; the worker performs the binary hop and returns bytes as base64url text).',
      logo: cfg.pinoySite + PINOY_ICON,
      resources: ['catalog', 'meta'],
      types: ['movie', 'series'],
      idPrefixes: ['tmdb:', 'asian:', 'mal:', 'anikoto:'],
      catalogs: catalogDefinitions().map(function (c) {
        return {
          type: c.type,
          id: c.id,
          name: c.name,
          pageSize: cfg.pageLimit,
          extra: c.extra
        };
      }),
      behaviorHints: { configurable: false }
    };
  }

  // ===== /health — per-source probes with actionable hints =====

  function timeProbe(fn) {
    var t0 = Date.now();
    return fn().then(function (r) {
      r.ms = Date.now() - t0;
      return r;
    }, function (err) {
      return { ok: false, ms: Date.now() - t0, items: 0, error: String((err && err.message) || err) };
    });
  }

  function healthReport(cfg) {
    var probes = [
      ['pinoymovieshub', timeProbe(function () {
        return pinoyPageRaw(cfg, cfg.pinoySite + '/movies/', 'movie').then(function (items) {
          return { ok: items.length > 0, items: items.length, error: items.length ? undefined : 'parsed 0 items (site markup changed?)' };
        });
      })],
      ['kissasian', timeProbe(function () {
        return ksPageRaw(cfg, cfg.kissasianSite + '/series/?status=&type=&order=update').then(function (items) {
          return { ok: items.length > 0, items: items.length, error: items.length ? undefined : 'parsed 0 series rows (site markup changed?)' };
        });
      })],
      ['viewasian', timeProbe(function () {
        return vaPageRaw(cfg, cfg.viewasianSite + '/page/2/').then(function (items) {
          return { ok: items.length > 0, items: items.length, error: items.length ? undefined : 'parsed 0 series rows (site markup changed?)' };
        });
      })],
      ['animotvslash', timeProbe(function () {
        return animoPageRaw(cfg, cfg.animoSite + '/anime/?status=&type=&order=update').then(function (items) {
          return { ok: items.length > 0, items: items.length, error: items.length ? undefined : 'parsed 0 anime rows (site markup changed?)' };
        });
      })],
      ['pencuri', timeProbe(function () {
        return penPageRaw(cfg, cfg.pencuriSite + '/movies/').then(function (items) {
          return { ok: items.length > 0, items: items.length, error: items.length ? undefined : 'parsed 0 rows (site markup changed or mirror moved — set PENCURI_SITE)' };
        });
      })],
      ['kisskh', timeProbe(function () {
        var def = { id: 'kisskh-latest', type: 'series', mode: 'list' };
        kisskhRescueState.engaged = false;
        kisskhRescueState.catalog = '';
        return kisskhPageMetas(cfg, def, 1, {}).then(function (metas) {
          return {
            ok: metas.length > 0, items: metas.length,
            mode: kisskhRescueState.engaged ? 'tmdb-rescue' : 'api',
            error: metas.length ? undefined : 'kisskh API unreachable AND the TMDB rescue returned 0 rows (check TMDB_API_KEY; device playback is unaffected)'
          };
        });
      })],
      ['anikoto', timeProbe(function () {
        return anikotoFeedPage(cfg, 1).then(function (rows) {
          return { ok: rows.length > 0, items: rows.length, error: rows.length ? undefined : 'anikoto /recent-anime parsed 0 rows (API changed?)' };
        });
      })],
      ['tmdb', timeProbe(function () {
        var url = 'https://api.themoviedb.org/3/configuration?api_key=' + encodeURIComponent(cfg.tmdbKey);
        return fetchJson(cfg, url, 12000).then(function (data) {
          return { ok: !!(data && data.images), items: 1, error: data && data.images ? undefined : 'unexpected configuration response (check TMDB_API_KEY)' };
        });
      })]
    ];
    return Promise.all(probes.map(function (p) {
      return p[1].then(function (r) { return [p[0], r]; });
    })).then(function (entries) {
      var sources = {};
      var errors = [];
      var okCount = 0;
      for (var i = 0; i < entries.length; i++) {
        var name = entries[i][0];
        var r = entries[i][1];
        sources[name] = r;
        if (r.ok) okCount++;
        else errors.push(r.error || 'failed');
      }
      var sourceCount = probes.length;
      // Heuristic from the v2.1.1 incident: every source failing with the
      // IDENTICAL error is a worker-code bug (e.g. an unbound native fetch),
      // not IP blocking.
      var runtimeBug = okCount === 0 && errors.length && errors.every(function (e) { return e === errors[0]; });
      var hints = [];
      if (runtimeBug && /Illegal invocation|incorrect .this./i.test(errors[0])) {
        hints.push('All probes fail with the same runtime error — a worker-code bug (a native fn like fetch called unbound), NOT IP blocking. Redeploy the current worker-bundle.js (' + ADDON_NAME + ' v' + VERSION + ').');
      } else if (runtimeBug) {
        hints.push('All probes fail with the same error (' + errors[0] + ') — likely a worker-code bug, not IP blocking. Redeploy the current worker-bundle.js (' + ADDON_NAME + ' v' + VERSION + ').');
      } else {
        if (!sources.pinoymovieshub.ok) hints.push('pinoymovieshub unreachable from this runtime. Mirror check (2026-09-10): pinoymovieshub.win is the canonical host (pinoymovieshub.tv redirects to it; .org CF-blocks datacenter IPs; the rest are dead). Pinoy catalogs fall back to serve-stale cache.');
        if (!sources.kissasian.ok) hints.push('kissasian.cam unreachable from this runtime (site up but likely blocking this worker\'s egress — verified live from residential/other datacenter IPs). KissAsian catalogs fall back to serve-stale cache; device-side playback is unaffected (the plugin runs on the client).');
        if (!sources.viewasian.ok) hints.push('viewasian.lol unreachable from this runtime (site down or IP blocked). ViewAsian catalog may be empty; set VIEWASIAN_SITE to an alternate mirror.');
        if (!sources.animotvslash.ok) hints.push('animotvslash.org unreachable from this runtime (site down or IP blocked). AnimeTVSlash catalog may be empty; set ANIMO_SITE to an alternate mirror.');
        if (!sources.anikoto.ok) hints.push('anikotoapi.site unreachable from this runtime (API down or rate-limited 60 req/120s). Anikoto catalogs may be empty; device playback via miruro is unaffected (it runs on the client).');
        if (!sources.kisskh.ok) {
          hints.push('kisskh API unreachable AND the TMDB rescue returned 0 rows — KissKH catalogs are EMPTY. Check TMDB_API_KEY (rescue lists) and KISSKH_HOSTS (comma-separated API mirrors); device playback is unaffected either way.');
        } else if (sources.kisskh.mode === 'tmdb-rescue') {
          hints.push('kisskh API is Cloudflare-challenged from this runtime (nl/ovh/co all 403 — verified from the deployed worker; free CORS proxies get the same page). KissKH catalogs are AUTO-SERVED from TMDB rescue lists with full metadata; the paired plugins resolve streams on-device. Set KISSKH_HOSTS to a working mirror to switch back to live kisskh lists.');
        }
        if (!sources.tmdb.ok) hints.push('TMDB failed — check TMDB_API_KEY and outbound access; metadata enrichment is degraded.');
        if (okCount > 0 && okCount < sourceCount) hints.push('Partial outage: only ' + okCount + '/' + sourceCount + ' sources healthy — affected catalogs fall back to serve-stale cache.');
      }
      if (okCount === sourceCount) hints.push('All ' + sourceCount + ' sources healthy.');
      return {
        status: okCount === sourceCount ? 'up' : (okCount > 0 ? 'degraded' : 'down'),
        addon: ADDON_ID,
        version: VERSION,
        sources: sources,
        hints: hints
      };
    });
  }

  // ===== request handling =====

  function parseExtras(pathSegment, searchParams) {
    var extras = {};
    var seg = String(pathSegment || '').replace(/\.json$/i, '');
    if (seg) {
      var pairs = seg.split('&');
      for (var i = 0; i < pairs.length; i++) {
        var p = pairs[i];
        if (!p) continue;
        var eq = p.indexOf('=');
        var k = eq === -1 ? p : p.substring(0, eq);
        var v = eq === -1 ? '' : p.substring(eq + 1);
        if (k) extras[k.toLowerCase()] = v;
      }
    }
    if (searchParams) {
      searchParams.forEach(function (v, k) {
        var key = String(k).toLowerCase();
        if (!(key in extras)) extras[key] = v;
      });
    }
    return extras;
  }

  function findCatalog(catalogId, type) {
    var defs = catalogDefinitions();
    for (var i = 0; i < defs.length; i++) {
      if (defs[i].id === catalogId && defs[i].type === type) return defs[i];
    }
    return null;
  }

  function pageMetasFor(cfg, def, extras) {
    if (def.source === 'pinoy') return function (page) { return pinoyPageMetas(cfg, def, page, extras); };
    if (def.source === 'kissasian') return function (page) { return ksPageMetas(cfg, def, page, extras); };
    if (def.source === 'viewasian') return function (page) { return vaPageMetas(cfg, def, page, extras); };
    if (def.source === 'animo') return function (page) { return animoPageMetas(cfg, def, page, extras); };
    if (def.source === 'pencuri') return function (page) { return penPageMetas(cfg, def, page, extras); };
    if (def.source === 'kisskh') return function (page) { return kisskhPageMetas(cfg, def, page, extras); };
    if (def.source === 'anikoto') return function (page) { return anikotoPageMetas(cfg, def, page, extras); };
    return function () { return Promise.resolve([]); };
  }

  function getCatalogMetas(cfg, def, extras) {
    var skip = parseInt(extras.skip, 10);
    if (!isFinite(skip) || skip < 0) skip = 0;
    var limit = cfg.pageLimit;
    var search = String(extras.search || '').trim();
    var genreSlug = slugifyGenre(extras.genre || '');

    var mode = search ? 'search' : (def.mode === 'genre' && genreSlug ? 'genre' : 'list');
    var ident = def.id + ':' + (mode === 'search' ? search.toLowerCase() : (mode === 'genre' ? genreSlug : ''));
    var stateKey = bufferStateKey(cfg, mode + '|' + def.source, ident);
    return runBuffered(cfg, stateKey, pageMetasFor(cfg, def, extras), skip, limit);
  }

  function indexHtml(cfg) {
    var defs = catalogDefinitions();
    var srcLabel = {
      pinoy: 'pinoymovieshub.win', kissasian: 'kissasian.cam', viewasian: 'viewasian.lol',
      animo: 'animotvslash.org', pencuri: 'pencurimovie.baby (ww44.)', kisskh: 'kisskh API (nl/ovh/co)', anikoto: 'Anikoto API (anikotoapi.site)'
    };
    var rows = defs.map(function (c) {
      return '<tr><td>' + c.name + '</td><td><code>' + c.type + '</code></td><td>' +
        (srcLabel[c.source] || c.source) +
        '</td><td><code>/catalog/' + c.type + '/' + c.id + '.json</code></td></tr>';
    }).join('');
    return '<!DOCTYPE html><html><head><meta charset="utf-8"><title>' + ADDON_NAME + '</title>' +
      '<meta name="viewport" content="width=device-width,initial-scale=1">' +
      '<style>body{font-family:system-ui,sans-serif;max-width:900px;margin:40px auto;padding:0 16px;color:#eee;background:#14141b}a{color:#7ab8ff}table{border-collapse:collapse;width:100%}td,th{border:1px solid #333;padding:8px;text-align:left;font-size:14px}code{color:#9ef}h2{margin-top:28px}</style></head><body>' +
      '<h1>' + ADDON_NAME + ' <small>v' + VERSION + '</small></h1>' +
      '<p>Stremio-protocol catalog addon for Nuvio — mirrors each site\'s real sections:</p>' +
      '<ul>' +
      '<li><b>Pinoy Movies Hub</b> — <a href="' + cfg.pinoySite + '">' + cfg.pinoySite.replace(/^https:\/\//, '') + '</a> (New Releases, Recently Added Movies, Series, Featured, Coming Soon, 17 genre sections)</li>' +
      '<li><b>KissAsian</b> — <a href="' + cfg.kissasianSite + '">' + cfg.kissasianSite.replace(/^https:\/\//, '') + '</a> (Hot Series Update, Latest Release, Recommendation genres)</li>' +
      '<li><b>ViewAsian</b> — <a href="' + cfg.viewasianSite + '">' + cfg.viewasianSite.replace(/^https:\/\//, '') + '</a> (Recently Drama, Movie and Kshow)</li>' +
      '<li><b>KissKH</b> — JSON API via ' + cfg.kisskhHosts.join(' / ') + ' (Latest Update, Top K/C-Drama, Hollywood, Anime, Upcoming; auto-rescued from TMDB lists when every mirror is CF-blocked)</li>' +
      '<li><b>AnimeTVSlash</b> — <a href="' + cfg.animoSite + '">' + cfg.animoSite.replace(/^https:\/\//, '') + '</a> (Latest Release)</li>' +
      '<li><b>Pencuri</b> — <a href="' + cfg.pencuriSite + '">' + cfg.pencuriSite.replace(/^https:\/\//, '') + '</a> (Movies / Series / Malaysia / Indonesia / Japan / Thailand / Most Viewed / Most Rating / Top IMDb)</li>' +
      '<li><b>Anikoto API</b> — <a href="' + cfg.anikotoApi + '">' + cfg.anikotoApi.replace(/^https:\/\//, '') + '</a> (Latest Episode / New Release / New Added / Upcoming Anime / Just Completed; rows carry <code>mal:</code>/<code>anilist:</code>/<code>anikoto:</code> ids for the paired miruro plugin)</li>' +
      '</ul>' +
      '<p>Add this manifest URL in Nuvio (Settings &rarr; Addons): <b>' + (cfg.__selfUrl || 'https://your-deployment') + '/manifest.json</b></p>' +
      '<p>Health probe: <a href="/health"><code>/health</code></a> (per-source status, latency, hints)</p>' +
      '<h2>Catalogs</h2><table><tr><th>Name</th><th>Type</th><th>Source</th><th>Endpoint</th></tr>' + rows + '</table>' +
      '<h2>Search examples</h2>' +
      '<p><code>/catalog/movie/pinoy-movies/search=hello love again.json</code><br>' +
      '<code>/catalog/series/asian-series/search=queen of tears.json</code><br>' +
      '<code>/catalog/series/kisskh-latest/search=queen of tears.json</code><br>' +
      '<code>/catalog/movie/pencuri-movies/search=moana.json</code><br>' +
      '<code>/catalog/series/animo-latest/search=one piece.json</code></p>' +
      '<h2>Genre / section chips</h2>' +
      '<p><code>/catalog/series/asian-series-genre/genre=Romance.json</code></p>' +
      '<p>Pair with the <b>PinoyMoviesHub</b>, <b>AsianHub</b>, <b>AnimeTVSlash</b> and <b>Pencuri</b> Nuvio plugins (xrexzerox/nv-plugins) for playable streams.</p>' +
      '</body></html>';
  }

  // ===== v5.6.0: cinejoy /g relay (POST /cjg) =====
  // NuvioMobile's plugin bridge is string-only: it cannot POST the octet-
  // stream body cinejoy's API (api.shegu.st/g) requires, and it UTF-8-mangles
  // the binary reply. The provider (cinejoy.js v1.5.0+) sends the encrypted
  // request token here as base64url TEXT; this route decodes it, performs the
  // real binary POST server-side, and returns the response bytes as base64url
  // text inside a JSON object - text on the wire, bytes on the target hop.
  // Fixed upstream (no open-proxy): only api.shegu.st/g is ever called.
  var CJ_G_TARGET = 'https://api.shegu.st/g';
  var CJ_MAX_TOKEN_BYTES = 16384;

  function b64urlDecodeToU8(text) {
    var std = String(text || '').replace(/-/g, '+').replace(/_/g, '/');
    while (std.length % 4) std += '=';
    var bin = atob(std);
    var u8 = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i) & 255;
    return u8;
  }
  function u8ToB64url(u8) {
    var bin = '';
    var CHUNK = 0x8000;
    for (var i = 0; i < u8.length; i += CHUNK) {
      bin += String.fromCharCode.apply(null, u8.subarray(i, Math.min(i + CHUNK, u8.length)));
    }
    return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
  }

  function cinejoyRelay(request) {
    if (request.method !== 'POST') {
      return Promise.resolve(json({ ok: false, error: 'POST required' }, 405, 0));
    }
    return request.text().then(function (text) {
      var bytes;
      try { bytes = b64urlDecodeToU8(text.trim()); } catch (e) {
        return json({ ok: false, error: 'body is not base64url' }, 400, 0);
      }
      if (!bytes.length || bytes.length > CJ_MAX_TOKEN_BYTES) {
        return json({ ok: false, error: 'token size out of range' }, 400, 0);
      }
      return fetch(CJ_G_TARGET, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/octet-stream',
          'Origin': 'https://cinejoy.to',
          'Referer': 'https://cinejoy.to/',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': '*/*'
        },
        body: bytes
      }).then(function (res) {
        return res.arrayBuffer().then(function (ab) {
          return json({
            ok: res.ok,
            status: res.status,
            b64: u8ToB64url(new Uint8Array(ab))
          }, 200, 0);
        });
      }).catch(function (err) {
        return json({ ok: false, error: String((err && err.message) || err) }, 502, 0);
      });
    }).catch(function (err) {
      return json({ ok: false, error: String((err && err.message) || err) }, 500, 0);
    });
  }

  function handle(urlString, env) {
    var cfg = makeConfig(env || {});
    cfg.__selfUrl = (env && env.__selfUrl) || '';
    var raw = String(urlString || '/');
    if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(raw)) raw = 'https://asian-catalog.local' + (raw.charAt(0) === '/' ? raw : '/' + raw);

    var u;
    try { u = new URL(raw); } catch (e) { return Promise.resolve(json({ error: 'invalid url' }, 400, 0)); }

    var path = u.pathname.replace(/\/+$/, '') || '/';
    try {
      if (path === '/' || path === '/healthz') {
        return Promise.resolve(new Response(indexHtml(cfg), {
          status: 200,
          headers: { 'Content-Type': 'text/html;charset=utf-8', 'Cache-Control': 'public, max-age=60', 'Access-Control-Allow-Origin': '*' }
        }));
      }
      if (path === '/health') {
        return healthReport(cfg).then(function (report) {
          return json(report, 200, 0);
        });
      }
      if (path === '/manifest.json') {
        return Promise.resolve(json(manifest(cfg), 200, 300));
      }
      // v5.0.0: /meta resource for the anime ids this addon emits
      var mm = path.match(/^\/meta\/(movie|series|tv)\/([^/]+?)\.json$/i);
      if (mm) {
        var mType = mm[1].toLowerCase() === 'tv' ? 'series' : mm[1].toLowerCase();
        var mId = '';
        try { mId = decodeURIComponent(mm[2]); } catch (e2) { mId = mm[2]; }
        return addonMeta(cfg, mType, mId).then(function (meta) {
          if (!meta) return json({ error: 'meta not found for id', id: mId }, 404, 60);
          return json({ meta: meta }, 200, 300);
        }).catch(function (err2) {
          return json({ error: String((err2 && err2.message) || err2) }, 502, 0);
        });
      }
      var m = path.match(/^\/catalog\/(movie|series|tv)\/([a-z0-9-]+)(?:\/([^/]*))?\.json$/i);
      if (!m) {
        return Promise.resolve(json({ error: 'not found', hint: 'GET /manifest.json or /catalog/{type}/{catalogId}/[extras].json' }, 404, 0));
      }
      var type = m[1].toLowerCase() === 'tv' ? 'series' : m[1].toLowerCase();
      var catalogId = m[2].toLowerCase();
      var def = findCatalog(catalogId, type);
      if (!def) {
        return Promise.resolve(json({ error: 'unknown catalog', catalogId: catalogId, type: type }, 404, 0));
      }
      var extras = parseExtras(m[3] ? decodeURIComponent(m[3]) : '', u.searchParams);
      return getCatalogMetas(cfg, def, extras).then(function (metas) {
        return json({ metas: metas }, 200, 300);
      }).catch(function (err) {
        return json({ error: String((err && err.message) || err) }, 502, 0);
      });
    } catch (err) {
      return Promise.resolve(json({ error: String((err && err.message) || err) }, 500, 0));
    }
  }

  // ===== exports =====

  global.AsianCatalogCore = {
    VERSION: VERSION,
    ADDON_ID: ADDON_ID,
    makeConfig: makeConfig,
    manifest: manifest,
    handle: handle,
    cinejoyRelay: cinejoyRelay,
    resetCaches: resetCaches,
    catalogDefinitions: catalogDefinitions,
    // test hooks
    parseListPage: parseListPage,
    parseFeaturedCarousel: parseFeaturedCarousel,
    ksParseListPage: ksParseListPage,
    ksParseHotSection: ksParseHotSection,
    vaParseListPage: vaParseListPage,
    animoParseListPage: animoParseListPage,
    penParseListPage: penParseListPage,
    cleanTitleForSearch: cleanTitleForSearch,
    cleanDisplayName: cleanDisplayName,
    normalizeForCompare: normalizeForCompare,
    titleScore: titleScore,
    yearScore: yearScore,
    pickBestTmdb: pickBestTmdb,
    toMeta: toMeta,
    fallbackIdTail: fallbackIdTail,
    slugifyGenre: slugifyGenre,
    pinoyGenreSlug: pinoyGenreSlug,
    pinoyPageMetas: pinoyPageMetas,
    ksPageMetas: ksPageMetas,
    vaPageMetas: vaPageMetas,
    animoPageMetas: animoPageMetas,
    kisskhPageMetas: kisskhPageMetas,
    // v5.0.0 anikoto + meta test hooks
    anikotoPageMetas: anikotoPageMetas,
    anikotoRowToMeta: anikotoRowToMeta,
    addonMeta: addonMeta,
    metaForMal: metaForMal,
    metaForAnikoto: metaForAnikoto,
    // v4.1.0 rescue test hooks
    kisskhRescueState: kisskhRescueState,
    KISSKH_TMDB_RESCUE: KISSKH_TMDB_RESCUE,
    kisskhRescueUrl: kisskhRescueUrl,
    tmdbRowToMetaDirect: tmdbRowToMetaDirect,
    getCatalogMetas: getCatalogMetas,
    healthReport: healthReport
  };

})(typeof globalThis !== 'undefined' ? globalThis : (typeof window !== 'undefined' ? window : this));
