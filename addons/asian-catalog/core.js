/**
 * Asian Catalog — Stremio-protocol catalog addon engine (v2.0.0)
 * Sources:
 *   - pinoymovieshub.win (WordPress + Dooplay 2.5.5)  — Pinoy catalogs
 *   - myasiantv.com.lv  (WordPress, wp-json REST)     — Asian dramas
 *   - dramacool.uno    (custom PHP, static grids)     — Asian movies/dramas by country
 * Author: xrexzerox
 *
 * WHAT THIS IS
 *   Nuvio QuickJS plugins can only export getStreams() — catalogs and meta
 *   MUST come from an HTTP addon (Stremio protocol). This engine implements
 *   such an addon: it scrapes the source sites' listing pages, resolves every
 *   title to a TMDB id (so Nuvio can open detail pages and route getStreams
 *   calls to the PinoyMoviesHub / AsianHub plugins), and serves:
 *
 *     GET /manifest.json
 *     GET /catalog/{type}/{catalogId}.json
 *     GET /catalog/{type}/{catalogId}/{search=..&genre=..&skip=..}.json
 *
 *   Verified against both Nuvio apps:
 *     - NuvioMobile (Kotlin): AddonManifestParser.kt, CatalogData.kt,
 *       HomeCatalogParser.kt — extras arrive as a PATH segment, response must
 *       be { metas: [...] }, pagination continues only when the catalog
 *       declares a `skip` extra, and `tmdb:` ids get automatic IMDb lookup +
 *       TMDB detail fallback.
 *     - NuvioTVSmart (JS): catalogRepository.js — same path-segment extras,
 *       honors per-catalog `pageSize` for skip steps, `{metas:[...]}` shape.
 *
 * RUNTIME TARGETS (this file is a classic script — no imports/exports):
 *   - Cloudflare Workers  (see worker.js, attaches to globalThis)
 *   - Node.js >= 18       (see server.js, CJS require via globalThis)
 *   It needs only: fetch, URL, Response — all present in both.
 *
 * PAGINATION MODEL
 *   Site listing pages hold 10 items; some of them do not resolve to a TMDB
 *   entry and are dropped. Naively mapping site pages to skip offsets would
 *   desync Nuvio's `skip` (the app computes nextSkip = skip + returnedCount).
 *   So the engine maintains a per-catalog RESOLVED-ITEM BUFFER: it keeps
 *   consuming site pages until the requested skip window is filled, and hands
 *   out stable slices of resolved items. nextSkip therefore always indexes
 *   into the resolved stream — pagination never stalls or repeats.
 */

(function (global) {
  'use strict';

  var VERSION = '2.0.0';
  var ADDON_ID = 'community.asianhub.catalog';
  var DEFAULT_SITE = 'https://pinoymovieshub.win';
  var DEFAULT_MATV_SITE = 'https://myasiantv.com.lv';
  var DEFAULT_DC_SITE = 'https://dramacool.uno';
  // Same public TMDB key the Nuvio plugin ecosystem already embeds
  // (providers/pinoyhub.js et al). Override with TMDB_API_KEY env/secret.
  var DEFAULT_TMDB_KEY = '439c478a771f35c05022f9feabcca01c';
  var SITE_ICON = '/wp-content/uploads/2025/04/cropped-favicon-11-192x192.png';
  var ASIAN_LOGO = 'https://www.google.com/s2/favicons?domain=myasiantv.com.lv&sz=128';

  var UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36';
  var BASE_HEADERS = {
    'User-Agent': UA,
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9'
  };

  var PAGE_LIMIT_DEFAULT = 20;   // resolved items returned per request
  var MAX_SITE_PAGES_DEFAULT = 80;
  var TMDB_CONCURRENCY = 6;
  var PAGE_CACHE_TTL = 10 * 60 * 1000;        // raw parsed listing pages
  var PAGE_CACHE_STALE = 6 * 60 * 60 * 1000;  // serve-stale window on site errors
  var BUFFER_TTL = 30 * 60 * 1000;            // per-catalog resolved buffers
  var RESOLVED_TTL = 24 * 60 * 60 * 1000;     // TMDB lookups
  var RESOLVED_NULL_TTL = 6 * 60 * 60 * 1000; // negative TMDB lookups

  // Genre labels surfaced in the manifest (engine slugifies the value back).
  // The engine accepts ANY slug the site understands, these are just the
  // curated chips. Placeholder-poster/adult/boilerplate genres excluded.
  var GENRES = [
    'Action', 'Adventure', 'Animation', 'Anthology Series', 'BL Series',
    'Comedy', 'Concert', 'Crime', 'Documentary', 'Drama', 'Family',
    'Fantasy', 'History', 'Horror', 'Indie', 'LGBTQ', 'Music', 'Musical',
    'Mystery', 'Romance', 'Science Fiction', 'Short Films', 'Sports',
    'Stageplay', 'Tagalog Dubbed', 'Teleserye', 'Thriller', 'War',
    'Wattpad', 'Web Series'
  ];

  // ===== caches (module-level; keyed by site) =====

  var pageCache = new Map();     // url -> { ts, items }
  var resolvedCache = new Map(); // key -> { ts, value: tmdb|null }
  var buffers = new Map();       // stateKey -> buffer
  var bufferInflight = new Map(); // stateKey -> Promise
  var tmdbInflight = new Map();  // lookup key -> Promise
  var CACHE_CAPS = { page: 250, resolved: 4000, buffers: 80 };

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
  }

  // ===== config =====

  function makeConfig(env) {
    env = env || {};
    var site = String(env.PINOYHUB_SITE || DEFAULT_SITE).replace(/\/+$/, '');
    var matvSite = String(env.MYASIANTV_SITE || DEFAULT_MATV_SITE).replace(/\/+$/, '');
    var dcSite = String(env.DRAMACOOL_SITE || DEFAULT_DC_SITE).replace(/\/+$/, '');
    var limit = parseInt(env.PINOYHUB_PAGE_LIMIT, 10);
    var maxPages = parseInt(env.PINOYHUB_MAX_PAGES, 10);
    return {
      site: site,
      matvSite: matvSite,
      dcSite: dcSite,
      tmdbKey: String(env.TMDB_API_KEY || DEFAULT_TMDB_KEY),
      pageLimit: Math.min(Math.max(isFinite(limit) && limit > 0 ? limit : PAGE_LIMIT_DEFAULT, 5), 50),
      maxSitePages: isFinite(maxPages) && maxPages > 0 ? maxPages : MAX_SITE_PAGES_DEFAULT,
      keepUnmatched: env.PINOYHUB_KEEP_UNMATCHED === '1',
      fetchFn: env.__fetchFn || (typeof fetch === 'function' ? fetch : null),
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

  function absoluteUrl(cfg, u) {
    u = String(u || '').trim();
    if (!u) return '';
    if (u.indexOf('//') === 0) return 'https:' + u;
    if (/^https?:\/\//i.test(u)) return u;
    if (u.charAt(0) === '/') return cfg.site + u;
    return '';
  }

  function isPlaceholderPoster(u) {
    return /\/themes\/dooplay\/assets\/img\/no\//i.test(u || '');
  }

  // WordPress thumbnail suffix (-150x150.webp -> .webp) upgrade.
  function cleanPosterUrl(cfg, u) {
    u = absoluteUrl(cfg, u);
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

  var QUALIFIER_WORDS = /(tagalog|dubbed|english|taglish|full[\s-]*(movie|series|film)|hd(?:[\s-]*cam)?|audio|subtitle|subbed|cam|ts|print)/i;

  // Strips site noise so the TMDB query is a clean title:
  //   "Queen Mantis (Tagalog Dubbed)"         -> "Queen Mantis"
  //   "ep14 \u2013 Love, Siargao"              -> "Love, Siargao"
  //   "The Chambermaid's Daughter Full Series" -> "The Chambermaid's Daughter"
  //   "Co x Love (Co-Love)"                   -> "Co x Love"  (no keyword in parens)
  function cleanTitleForSearch(title) {
    var t = decodeEntities(title);
    // leading per-episode post prefixes: "ep14 - Title", "Episode 5: Title"
    t = t.replace(/^\s*ep(?:isode)?\s*\d+\s*[\u2013\u2014:-]\s*/i, '');
    // bracketed segments that contain qualifier words
    t = t.replace(/[\(\[\{][^\)\]\}]*[\)\]\}]/g, function (seg) {
      return QUALIFIER_WORDS.test(seg) ? ' ' : seg;
    });
    // bare qualifier phrases (no brackets)
    t = t.replace(/\b(tagalog|english)[\s-]*dubbed\b/gi, ' ');
    t = t.replace(/\bfull[\s-]*(movie|series|film)\b/gi, ' ');
    t = t.replace(/\bwith[\s-]+english[\s-]+subs(?:titles)?\b/gi, ' ');
    t = t.replace(/\s+\b(hd|hdtv|hdrip|webrip|dvdrip|blu-ray|bluray)\b\s*$/i, '');
    // MyAsianTV episode posts carry a trailing "Episode N"
    t = t.replace(/\s*[-:\u2013\u2014]?\s*Episode\s*\d+\s*$/i, '');
    t = t.replace(/\b(19|20)\d{2}\b/g, ' ');
    t = t.replace(/\(\s*\)/g, ' ');
    t = collapseWs(t).replace(/^[\u2013\u2014:,-]+\s*/, '').trim();
    return t;
  }

  // Display name: keep the site's own naming (users know it), minus the
  // per-episode "epN \u2013 " prefix and raw HTML noise.
  function cleanDisplayName(title) {
    var t = collapseWs(decodeEntities(title));
    t = t.replace(/^\s*ep(?:isode)?\s*\d+\s*[\u2013\u2014:-]\s*/i, '');
    t = t.replace(/^\s*\d+x\d+\s*[\u2013\u2014:-]\s*/, '');
    // MyAsianTV episode posts: "Show Name (2019) Episode 16" -> show level
    t = t.replace(/\s*[-:\u2013\u2014]?\s*Episode\s*\d+\s*$/i, '');
    return t.substring(0, 120).trim();
  }

  // ===== site page parsing =====

  // Accepts Dooplay archive items (<article class="item" id="post-N">),
  // search-template items (<article> with div.details), and the Featured
  // carousel (id="post-featured-N") — the featured carousel is parsed for
  // poster enrichment only and never emitted as a list item.
  function parseListPage(cfg, html) {
    var items = [];
    var featuredPosters = {};
    var seen = {};
    var re = /<article\b[^>]*>([\s\S]*?)<\/article>/g;
    var m;
    while ((m = re.exec(html)) !== null) {
      var body = m[1];
      var whole = m[0];
      var idMatch = whole.match(/id=["']post-([\w-]+?)["']/);
      var postId = idMatch ? idMatch[1] : '';

      var img = body.match(/<img[^>]*>/i);
      var poster = img ? attr(img[0], 'src') : '';

      if (postId.indexOf('featured-') === 0) {
        var fid = postId.substring('featured-'.length);
        var fp = cleanPosterUrl(cfg, poster);
        if (fp) featuredPosters[fid] = fp;
        continue;
      }

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
        type: kind,
        title: collapseWs(decodeEntities(title)),
        year: year,
        poster: poster,
        description: desc
      });
    }
    // enrich placeholder posters from the Featured carousel (same post id)
    for (var i = 0; i < items.length; i++) {
      var it = items[i];
      if (isPlaceholderPoster(it.poster) && it.postId && featuredPosters[it.postId]) {
        it.poster = featuredPosters[it.postId];
      }
    }
    return items;
  }

  // ===== MyAsianTV page parsing =====

  // Listing items (recently-added-movie / most-popular-drama / kshow):
  //   <li> <a href="https://myasiantv.com.lv/series/the-early-spring-2026/"
  //          title="The Early Spring (2026)">
  //     <div class="cover" style="background-image: url('...jpg');">
  //     ... <p class="title">The Early Spring (2026)</p>
  // The site files EVERYTHING under /series/ (movies included) and every
  // title carries a "(Year)" suffix. All items are episodic posts, so they
  // are emitted as type 'series'.
  function parseMatvListPage(cfg, html) {
    var items = [];
    var seen = {};
    var re = /<a\s+href="(https?:\/\/[^"']*\/series\/([a-z0-9-]+)\/)"\s+title="([^"]+)"[^>]*>\s*<div\s+class="cover"\s+style="background-image:\s*url\('([^']+)'\);?"/gi;
    var m;
    while ((m = re.exec(html)) !== null) {
      var url = decodeEntities(m[1]);
      if (seen[url]) continue;
      seen[url] = true;
      var slug = m[2];
      var rawTitle = decodeEntities(m[3]).replace(/\s+/g, ' ').trim();
      var poster = m[4] || '';
      var ym = rawTitle.match(/\b((?:19|20)\d{2})\b/);
      items.push({
        postId: slug,
        slug: slug,
        url: url,
        type: 'series',
        title: rawTitle,
        year: ym ? ym[1] : '',
        poster: poster,
        description: '',
        source: 'matv'
      });
    }
    return items;
  }

  // ===== Dramacool page parsing =====

  // Main-grid items on country/list pages:
  //   <a href="https://dramacool.uno/movie-detail/parasite" class="img" title="Parasite">
  //     <img ... data-original="...jpg"> ... <h3 class="title">Parasite</h3></a>
  // Path decides the type: /movie-detail/ -> movie, /drama-info/ -> series.
  // Sidebar widgets (<li><h3><a ...>) have no class="img" and never match.
  function parseDcListPage(cfg, html) {
    var items = [];
    var seen = {};
    var re = /<a\s+href="(https?:\/\/[^"']*\/(movie-detail|drama-info)\/([a-z0-9-]+))"\s+class="img"\s+title="([^"]*)"[^>]*>([\s\S]{0,600}?)<\/a>/gi;
    var m;
    while ((m = re.exec(html)) !== null) {
      var url = decodeEntities(m[1]);
      if (seen[url]) continue;
      seen[url] = true;
      var kind = m[2].toLowerCase() === 'movie-detail' ? 'movie' : 'series';
      var slug = m[3];
      var rawTitle = decodeEntities(m[4]).replace(/\s+/g, ' ').trim();
      if (!rawTitle) {
        var h3 = m[5].match(/<h3[^>]*>([\s\S]*?)<\/h3>/i);
        if (h3) rawTitle = stripTags(h3[1]);
      }
      if (!rawTitle) continue;
      var pm = m[5].match(/data-original="([^"]+)"/i) || m[5].match(/<img[^>]+src="([^"]+)"/i);
      var ym = rawTitle.match(/\b((?:19|20)\d{2})\b/);
      items.push({
        postId: slug,
        slug: slug,
        url: url,
        type: kind,
        title: rawTitle,
        year: ym ? ym[1] : '',
        poster: pm ? pm[1] : '',
        description: '',
        source: 'dc'
      });
    }
    return items;
  }

  // MyAsianTV wp-json search results (JSON):
  //   [{ title: "Crash Landing on You (2019) Episode 16",
  //      url: "https://myasiantv.com.lv/crash-landing-on-you-2019-episode-16/" }]
  // Episode posts are fed in as-is; the resolved-item buffer dedupes them to
  // one meta per show because every episode of a show resolves to the same
  // TMDB id.
  function parseMatvJson(cfg, data) {
    var items = [];
    if (!Array.isArray(data)) return items;
    for (var i = 0; i < data.length; i++) {
      var r = data[i];
      if (!r || !r.url || !r.title) continue;
      var url = String(r.url);
      if (!/^https?:\/\//.test(url)) continue;
      var title = String(r.title);
      var slug = url.replace(/\/+$/, '').split('/').pop() || '';
      var ym = title.match(/\b((?:19|20)\d{2})\b/);
      items.push({
        postId: slug,
        slug: slug,
        url: url,
        type: 'series',
        title: title,
        year: ym ? ym[1] : '',
        poster: '',
        description: '',
        source: 'matv'
      });
    }
    return items;
  }

  // ===== network =====

  function fetchText(cfg, url, timeoutMs) {
    if (!cfg.fetchFn) return Promise.reject(new Error('no fetch available'));
    var opts = { method: 'GET', redirect: 'follow', headers: BASE_HEADERS };
    if (typeof AbortSignal !== 'undefined' && typeof AbortSignal.timeout === 'function') {
      opts.signal = AbortSignal.timeout(timeoutMs || 20000);
    }
    return Promise.resolve().then(function () { return cfg.fetchFn(url, opts); }).then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status + ' for ' + url);
      return res.text();
    });
  }

  function fetchJson(cfg, url) {
    if (!cfg.fetchFn) return Promise.reject(new Error('no fetch available'));
    var opts = { method: 'GET', redirect: 'follow', headers: BASE_HEADERS };
    if (typeof AbortSignal !== 'undefined' && typeof AbortSignal.timeout === 'function') {
      opts.signal = AbortSignal.timeout(15000);
    }
    return Promise.resolve().then(function () { return cfg.fetchFn(url, opts); }).then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    });
  }

  // Cached listing-page fetch + parse + type filter. `parser` selects the
  // site-specific parser: 'pinoy' (default), 'matv', 'dc', 'matv-json'.
  function parseWithParser(cfg, parser, raw) {
    if (parser === 'matv-json') return parseMatvJson(cfg, raw);
    var html = String(raw || '');
    if (parser === 'matv') return parseMatvListPage(cfg, html);
    if (parser === 'dc') return parseDcListPage(cfg, html);
    return parseListPage(cfg, html);
  }

  function fetchSitePageCached(cfg, url, type, parser) {
    parser = parser || 'pinoy';
    var entry = pageCache.get(url);
    var now = cfg.nowFn();
    if (entry && now - entry.ts < PAGE_CACHE_TTL) {
      return Promise.resolve(filterType(entry.items, type));
    }
    var p = (parser === 'matv-json')
      ? fetchJson(cfg, url)
      : fetchText(cfg, url, 20000);
    return p.then(function (raw) {
      var items = parseWithParser(cfg, parser, raw);
      pageCache.set(url, { ts: now, items: items });
      cachePrune(pageCache, CACHE_CAPS.page);
      return filterType(items, type);
    }).catch(function (err) {
      if (entry && now - entry.ts < PAGE_CACHE_STALE) return filterType(entry.items, type);
      throw err;
    });
  }

  function filterType(items, type) {
    var out = [];
    for (var i = 0; i < items.length; i++) {
      if (!type || items[i].type === type) out.push(items[i]);
    }
    return out;
  }

  // ===== TMDB resolution =====

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
    var key = cfg.site + '|' + type + '|' + normalizeForCompare(cleaned) + '|' + (siteYear || '');
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

  // ===== meta building =====

  function toMeta(cfg, item, tmdb) {
    var type = item.type === 'series' ? 'series' : 'movie';
    var name = cleanDisplayName(item.title);
    if (!name) return null;
    var sitePoster = cleanPosterUrl(cfg, item.poster);
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
      if (tmdb.rating) meta.imdbRating = Math.round(tmdb.rating * 10) / 10;
      return meta;
    }
    if (!cfg.keepUnmatched) return null;
    var fallbackMeta = {
      id: 'asian:' + (item.source || 'pinoy') + ':' + (item.slug || ''),
      type: type,
      name: name,
      posterShape: 'poster'
    };
    if (sitePoster) fallbackMeta.poster = sitePoster;
    if (item.description) fallbackMeta.description = item.description;
    if (item.year) fallbackMeta.releaseInfo = String(item.year);
    return fallbackMeta;
  }

  function resolveBatch(cfg, items) {
    return mapLimited(items, TMDB_CONCURRENCY, function (item) {
      return resolveTmdb(cfg, item.type, item.title, item.year)
        .then(function (tmdb) { return toMeta(cfg, item, tmdb); })
        .catch(function () { return null; });
    });
  }

  // ===== buffered listing engine =====

  function bufferStateKey(cfg, kind, ident) {
    return cfg.site + '|' + kind + '|' + ident;
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

  // Fetches site pages into the buffer until `skip + limit` resolved items
  // exist (or the listing is exhausted), then returns the stable slice.
  // Concurrent requests for the same buffer coalesce into one pump job.
  function runBuffered(cfg, stateKey, pageUrlFn, type, skip, limit, parser) {
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
        // Page 1 failures mean the source is down (fatal). Deeper-page
        // failures (e.g. WordPress 404 past the last search/listing page)
        // simply mark the listing exhausted.
        var fetchPage = fetchSitePageCached(cfg, pageUrlFn(page), type, parser);
        var safeFetch = page === 1 ? fetchPage : fetchPage.catch(function () { return null; });
        return safeFetch.then(function (items) {
          if (!items || !items.length) {
            buf.exhausted = true;
            return buf.items.slice(skip, skip + limit);
          }
          buf.nextPage = page + 1;
          return resolveBatch(cfg, items).then(function (metas) {
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

  // ===== catalogs / manifest =====

  // Dramacool country slugs (labels shown as chips; the slug is appended
  // with '-movie' / '-drama' for the site path /country/{slug}-{kind}).
  var DC_COUNTRIES = [
    { label: 'Korean', slug: 'korean' },
    { label: 'Chinese', slug: 'chinese' },
    { label: 'Japanese', slug: 'japanese' },
    { label: 'Thai', slug: 'thailand' },
    { label: 'Taiwanese', slug: 'taiwanese' },
    { label: 'Hong Kong', slug: 'hong-kong' },
    { label: 'Indian', slug: 'indian' },
    { label: 'Other Asia', slug: 'other-asia' }
  ];

  function catalogDefinitions() {
    return [
      {
        type: 'movie', id: 'pinoy-movies', name: 'Pinoy Movies', mode: 'archive',
        description: 'Latest Pinoy movies from pinoymovieshub.win',
        extra: [{ name: 'search' }, { name: 'skip' }]
      },
      {
        type: 'movie', id: 'pinoy-movies-genre', name: 'Pinoy Movies by Genre', mode: 'genre',
        description: 'Browse Pinoy movies by genre',
        extra: [{ name: 'genre', options: GENRES.slice() }, { name: 'skip' }]
      },
      {
        type: 'series', id: 'pinoy-series', name: 'Pinoy Series', mode: 'archive',
        description: 'Latest Pinoy series and Tagalog-dubbed shows',
        extra: [{ name: 'search' }, { name: 'skip' }]
      },
      {
        type: 'series', id: 'pinoy-series-genre', name: 'Pinoy Series by Genre', mode: 'genre',
        description: 'Browse Pinoy series by genre',
        extra: [{ name: 'genre', options: GENRES.slice() }, { name: 'skip' }]
      },
      {
        type: 'series', id: 'asian-dramas', name: 'Asian Dramas', mode: 'matv-archive',
        description: 'Korean/Chinese/Japanese/Thai dramas from myasiantv.com.lv (English subs)',
        extra: [{ name: 'search' }, { name: 'skip' }]
      },
      {
        type: 'movie', id: 'asian-movies', name: 'Asian Movies by Country', mode: 'dc-country',
        kind: 'movie',
        description: 'Asian movies by country from dramacool.uno (English subs)',
        extra: [{ name: 'genre', options: DC_COUNTRIES.map(function (c) { return c.label; }) }, { name: 'skip' }]
      },
      {
        type: 'series', id: 'asian-dramas-country', name: 'Asian Dramas by Country', mode: 'dc-country',
        kind: 'series',
        description: 'Asian dramas by country from dramacool.uno (English subs)',
        extra: [{ name: 'genre', options: DC_COUNTRIES.map(function (c) { return c.label; }) }, { name: 'skip' }]
      }
    ];
  }

  function manifest(cfg) {
    return {
      id: ADDON_ID,
      version: VERSION,
      name: 'Asian Catalog',
      description: 'Browse Pinoy movies, Tagalog-dubbed series and Asian movies & dramas (Korean/Chinese/Japanese/Thai and more, English subs). Titles resolve to TMDB ids; pair with the PinoyMoviesHub and AsianHub plugins for playback.',
      logo: ASIAN_LOGO,
      resources: ['catalog'],
      types: ['movie', 'series'],
      idPrefixes: ['tmdb:'],
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

  function getCatalogMetas(cfg, def, extras) {
    var skip = parseInt(extras.skip, 10);
    if (!isFinite(skip) || skip < 0) skip = 0;
    var limit = cfg.pageLimit;
    var search = String(extras.search || '').trim();
    var genreSlug = slugifyGenre(extras.genre || '');

    if (search) {
      if (def.mode === 'matv-archive') {
        // MyAsianTV search via wp-json (episode posts; the resolved buffer
        // dedupes them to one meta per show)
        var mKey = bufferStateKey(cfg, 'matv-search', def.id + ':' + search.toLowerCase());
        var matvSearchUrl = function (page) {
          var u = cfg.matvSite + '/wp-json/wp/v2/search?search=' + encodeURIComponent(search) + '&per_page=40';
          if (page > 1) u += '&page=' + page;
          return u;
        };
        return runBuffered(cfg, mKey, matvSearchUrl, def.type, skip, limit, 'matv-json');
      }
      var stateKey = bufferStateKey(cfg, 'search', def.id + ':' + search.toLowerCase());
      var searchUrl = function (page) {
        return page === 1
          ? cfg.site + '/?s=' + encodeURIComponent(search)
          : cfg.site + '/page/' + page + '/?s=' + encodeURIComponent(search);
      };
      return runBuffered(cfg, stateKey, searchUrl, def.type, skip, limit, 'pinoy');
    }

    if (def.mode === 'genre' && genreSlug) {
      var gKey = bufferStateKey(cfg, 'genre', def.id + ':' + genreSlug);
      var genreUrl = function (page) {
        return page === 1
          ? cfg.site + '/genre/' + genreSlug + '/'
          : cfg.site + '/genre/' + genreSlug + '/page/' + page + '/';
      };
      return runBuffered(cfg, gKey, genreUrl, def.type, skip, limit, 'pinoy');
    }

    if (def.mode === 'dc-country') {
      // default chip = Korean; every country slug comes from DC_COUNTRIES
      var chosen = def.extra[0].options[0];
      var found = false;
      for (var ci = 0; ci < DC_COUNTRIES.length; ci++) {
        if (slugifyGenre(DC_COUNTRIES[ci].label) === genreSlug) {
          chosen = DC_COUNTRIES[ci].label;
          found = true;
          break;
        }
      }
      if (!found && genreSlug) chosen = extras.genre || chosen;
      var dcSlug = (function () {
        for (var di = 0; di < DC_COUNTRIES.length; di++) {
          if (slugifyGenre(DC_COUNTRIES[di].label) === slugifyGenre(chosen)) return DC_COUNTRIES[di].slug;
        }
        return slugifyGenre(chosen);
      })();
      // Dramacool paths are /country/{slug}-movie and /country/{slug}-drama
      // (a 'series' catalog maps to the '-drama' suffix)
      var dcKind = def.kind === 'movie' ? 'movie' : 'drama';
      var cKey = bufferStateKey(cfg, 'dc-country', def.id + ':' + dcSlug);
      var dcUrl = function (page) {
        return page === 1
          ? cfg.dcSite + '/country/' + dcSlug + '-' + dcKind
          : cfg.dcSite + '/country/' + dcSlug + '-' + dcKind + '?page=' + page;
      };
      return runBuffered(cfg, cKey, dcUrl, def.type, skip, limit, 'dc');
    }

    if (def.mode === 'matv-archive') {
      // page 1 popular dramas, page 2 recent movies, page 3 recent kshow,
      // pages 4..29 = A-Z letter index of the full drama list
      var lKey = bufferStateKey(cfg, 'matv-list', def.id);
      var matvListUrl = function (page) {
        if (page === 1) return cfg.matvSite + '/most-popular-drama/';
        if (page === 2) return cfg.matvSite + '/recently-added-movie/';
        if (page === 3) return cfg.matvSite + '/recently-added-kshow/';
        var li = page - 4;
        if (li < 0 || li > 25) return cfg.matvSite + '/drama-list/drama-start-with-zzz/';
        return cfg.matvSite + '/drama-list/drama-start-with-' + String.fromCharCode(97 + li) + '/';
      };
      return runBuffered(cfg, lKey, matvListUrl, def.type, skip, limit, 'matv');
    }

    // archive mode; genre catalogs without a genre behave like the archive
    var seg = def.type === 'series' ? '/series' : '/movies';
    var listKey = bufferStateKey(cfg, 'list', def.id);
    var listUrl = function (page) {
      return page === 1 ? cfg.site + seg + '/' : cfg.site + seg + '/page/' + page;
    };
    return runBuffered(cfg, listKey, listUrl, def.type, skip, limit, 'pinoy');
  }

  function indexHtml(cfg) {
    var defs = catalogDefinitions();
    var rows = defs.map(function (c) {
      return '<tr><td><code>' + c.type + '</code></td><td>' + c.name + '</td><td><code>/catalog/' + c.type + '/' + c.id + '.json</code></td></tr>';
    }).join('');
    return '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Asian Catalog</title>' +
      '<meta name="viewport" content="width=device-width,initial-scale=1">' +
      '<style>body{font-family:system-ui,sans-serif;max-width:860px;margin:40px auto;padding:0 16px;color:#eee;background:#14141b}a{color:#7ab8ff}table{border-collapse:collapse;width:100%}td,th{border:1px solid #333;padding:8px;text-align:left;font-size:14px}code{color:#9ef}</style></head><body>' +
      '<h1>Asian Catalog <small>v' + VERSION + '</small></h1>' +
      '<p>Stremio-protocol catalog addon built for Nuvio. Sources: <a href="' + cfg.site + '">pinoymovieshub.win</a> (Pinoy), <a href="' + cfg.matvSite + '">myasiantv.com.lv</a> (Asian dramas) and <a href="' + cfg.dcSite + '">dramacool.uno</a> (Asian movies & dramas by country).</p>' +
      '<p>Add this manifest URL in Nuvio (Settings &rarr; Addons): <b>' + (cfg.__selfUrl || 'https://your-deployment') + '/manifest.json</b></p>' +
      '<h2>Catalogs</h2><table><tr><th>Type</th><th>Name</th><th>Endpoint</th></tr>' + rows + '</table>' +
      '<h2>Extras</h2><p>Search: <code>/catalog/series/asian-dramas/search=crash landing.json</code> &middot; Country: <code>/catalog/movie/asian-movies/genre=Korean&amp;skip=20.json</code></p>' +
      '<p>Pair with the <b>PinoyMoviesHub</b> and <b>AsianHub</b> Nuvio plugins (providers/pinoyhub.js and providers/asianhub.js in xrexzerox/nv-plugins) for playable streams.</p>' +
      '</body></html>';
  }

  function handle(urlString, env) {
    var cfg = makeConfig(env || {});
    cfg.__selfUrl = (env && env.__selfUrl) || '';
    var raw = String(urlString || '/');
    if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(raw)) raw = 'https://pinoyhub.local' + (raw.charAt(0) === '/' ? raw : '/' + raw);

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
      if (path === '/manifest.json') {
        return Promise.resolve(json(manifest(cfg), 200, 300));
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

  var exported = {
    VERSION: VERSION,
    ADDON_ID: ADDON_ID,
    makeConfig: makeConfig,
    manifest: manifest,
    handle: handle,
    resetCaches: resetCaches,
    // test hooks
    parseListPage: parseListPage,
    parseMatvListPage: parseMatvListPage,
    parseDcListPage: parseDcListPage,
    parseMatvJson: parseMatvJson,
    cleanTitleForSearch: cleanTitleForSearch,
    cleanDisplayName: cleanDisplayName,
    normalizeForCompare: normalizeForCompare,
    titleScore: titleScore,
    yearScore: yearScore,
    pickBestTmdb: pickBestTmdb,
    toMeta: toMeta,
    slugifyGenre: slugifyGenre
  };

  global.AsianCatalogCore = exported;
  // Back-compat alias for scripts written against v1.x
  global.PinoyHubCatalogCore = exported;

})(typeof globalThis !== 'undefined' ? globalThis : (typeof window !== 'undefined' ? window : this));
