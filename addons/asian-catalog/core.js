/**
 * Asian Catalog — Stremio-protocol catalog addon engine (v3.0.0)
 * Sources (all verified server-side reachable, Sep 2026):
 *   1. pinoymovieshub.win   — WordPress/Dooplay HTML scrape (Pinoy movies+series)
 *   2. kissasian.cam        — WordPress "dramastream" HTML scrape (Asian series)
 *   3. viewasian.lol        — WordPress "viewasian" HTML scrape (Asian series)
 *   4. TMDB Discover/Search — official asian-language directories (ko|zh|ja|th|tl)
 *
 * WHY THE SOURCES CHANGED (v3.0.0, user request):
 *   - myasiantv.com.lv, dramacool and the AnimePahe-mirror catalog were
 *     REMOVED. Series now come from kissasian.cam (home archive pagination
 *     deduped to series, /?s= search, /genres/ archives) and viewasian.lol
 *     (home archive pagination, /?s= search, /genre/ + /country/ archives).
 *   - kisskh.co is NOT a catalog source: it Cloudflare-challenges datacenter
 *     IPs. It remains a PLAYBACK lane inside providers/asianhub.js (devices
 *     are served normally) — same split the standalone kisskh.js provider
 *     has always had.
 *
 * WHAT THIS IS
 *   Nuvio QuickJS plugins can only export getStreams() — catalogs and meta
 *   MUST come from an HTTP addon (Stremio protocol). This engine implements
 *   such an addon and serves:
 *
 *     GET /manifest.json
 *     GET /catalog/{type}/{catalogId}.json
 *     GET /catalog/{type}/{catalogId}/{search=..&genre=..&skip=..}.json
 *     GET /health                     (per-source probes + hints)
 *
 *   Verified against both Nuvio apps:
 *     - NuvioMobile (Kotlin): extras arrive as a PATH segment, response must
 *       be { metas: [...] }, pagination continues only when the catalog
 *       declares a `skip` extra, and `tmdb:` ids get automatic IMDb lookup +
 *       TMDB detail fallback.
 *     - NuvioTVSmart (JS): catalogRepository.js — same path-segment extras,
 *       honors per-catalog `pageSize` for skip steps, `{metas:[...]}` shape.
 *
 * ORGANIZED DIRECTORY (11 catalogs, grouped by source in the manifest order):
 *   Pinoy Movies Hub ....... pinoy-movies, pinoy-series (+ genre browses)
 *   KissAsian .............. asian-series, asian-series-genre
 *   ViewAsian .............. asian-series-viewasian, asian-series-viewasian-genre
 *   TMDB Asian directory ... asian-movies, asian-series-trending,
 *                            asian-movies-genre
 *   Every catalog supports search; chips (genre/country) render as extras.
 *
 * PAGINATION MODEL
 *   Sources hold 10-30 items per page and some items fail TMDB matching and
 *   are turned into `asian:<slug>` fallback rows (visible, site poster) or
 *   dropped. Naively mapping site pages to skip offsets would desync Nuvio's
 *   `skip` (nextSkip = skip + returnedCount). So the engine maintains a
 *   per-catalog RESOLVED-ITEM BUFFER: it keeps consuming source pages until
 *   the requested skip window is filled, and hands out stable slices of
 *   resolved items. Pagination never stalls or repeats.
 *
 * RUNTIME TARGETS (classic script — no imports/exports):
 *   - Cloudflare Workers  (see worker.js, attaches to globalThis)
 *   - Node.js >= 18       (see server.js, CJS require via globalThis)
 *   Needs only: fetch, URL, Response — all present in both.
 */

(function (global) {
  'use strict';

  var VERSION = '3.2.0';
  var ADDON_ID = 'community.asian.catalog';
  var ADDON_NAME = 'Asian Catalog';

  var PINOY_SITE_DEFAULT = 'https://pinoymovieshub.win';
  var KISSASIAN_SITE_DEFAULT = 'https://kissasian.cam';
  var VIEWASIAN_SITE_DEFAULT = 'https://viewasian.lol';
  // Same public TMDB key the Nuvio plugin ecosystem already embeds
  // (providers/pinoyhub.js et al). Override with TMDB_API_KEY env/secret.
  var DEFAULT_TMDB_KEY = '439c478a771f35c05022f9feabcca01c';
  var PINOY_ICON = '/wp-content/uploads/2025/04/cropped-favicon-11-192x192.png';
  var KS_ICON = '/wp-content/uploads/2024/03/cropped-favicon-1-1-192x192.png';
  var VA_ICON = '/wp-content/uploads/2024/09/logo.png';

  // Asian original languages surfaced through TMDB discover/search filters.
  var ASIAN_LANGS = ['ko', 'zh', 'ja', 'th', 'tl'];
  var ASIAN_LANG_LABELS = {
    ko: 'Korean', zh: 'Chinese', ja: 'Japanese', th: 'Thai', tl: 'Filipino'
  };

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
  var TERMS_TTL = 6 * 60 * 60 * 1000;         // (retained for cache-cap compat)

  // ===== caches (module-level) =====

  var pageCache = new Map();     // url -> { ts, items }  (raw per-source items)
  var resolvedCache = new Map(); // key -> { ts, value: tmdb|null }
  var buffers = new Map();       // stateKey -> buffer
  var bufferInflight = new Map(); // stateKey -> Promise
  var tmdbInflight = new Map();  // lookup key -> Promise
  var CACHE_CAPS = { page: 250, resolved: 4000, buffers: 80, terms: 20 };

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
    streamCache.clear();
    docCache.clear();
  }

  // ===== config =====

  function makeConfig(env) {
    env = env || {};
    var limit = parseInt(env.ASIAN_PAGE_LIMIT, 10);
    var maxPages = parseInt(env.ASIAN_MAX_PAGES, 10);
    // workerd (Cloudflare Workers) receiver-checks its native API fns: an
    // unbound alias (`const f = fetch`) later invoked as cfg.fetchFn(url)
    // runs with `this === cfg` and throws "Illegal invocation..." BEFORE any
    // network I/O. Node's fetch ignores its receiver, which is why the Node
    // test suite / server never sees it. Binding to the IIFE's global object
    // satisfies workerd's receiver check and is harmless everywhere else.
    var fetchRef = env.__fetchFn;
    if (!fetchRef && typeof fetch === 'function') {
      try { fetchRef = fetch.bind(global); } catch (e) { fetchRef = fetch; }
    }
    return {
      pinoySite: String(env.PINOY_SITE || PINOY_SITE_DEFAULT).replace(/\/+$/, ''),
      kissasianSite: String(env.KISSASIAN_SITE || KISSASIAN_SITE_DEFAULT).replace(/\/+$/, ''),
      viewasianSite: String(env.VIEWASIAN_SITE || VIEWASIAN_SITE_DEFAULT).replace(/\/+$/, ''),
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

  // One automatic retry with a mobile identity on bot-gated responses
  // (Cloudflare challenges rarely hit mobile fingerprints).
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

  // Site-coded fallback id: "asian:<site>-<slug>" (ph=|ks=|va=). The
  // /stream + /meta endpoints decode the site from this prefix and resolve
  // the item DIRECTLY from its source page — no title search, no TMDB.
  // (v3.2.0: plain "asian:<slug>" ids were unplayable — the apps only pass
  // tmdb:/tt ids to plugins, so those rows could never fetch a stream.)
  var SITE_CODES = { ph: true, ks: true, va: true };

  function fallbackMeta(cfg, prefix, item) {
    var siteCode = SITE_CODES[item.source] ? item.source : '';
    var slug = item.slug || cleanDisplayName(item.title) || 'untitled';
    var meta = {
      id: prefix + ':' + (siteCode ? siteCode + '-' + slug : slug),
      type: item.type === 'series' ? 'series' : 'movie',
      name: cleanDisplayName(item.title),
      posterShape: 'poster'
    };
    var sitePoster = cleanPosterUrl(cfg.pinoySite, item.poster) ||
      cleanPosterUrl(cfg.kissasianSite, item.poster) ||
      cleanPosterUrl(cfg.viewasianSite, item.poster);
    if (sitePoster) meta.poster = sitePoster;
    if (item.description) meta.description = item.description;
    if (item.year) meta.releaseInfo = String(item.year);
    return meta;
  }

  // Scraped item (pinoy HTML / kissasian HTML / viewasian HTML) -> meta.
  // TMDB match first, visible `asian:<slug>` fallback row when unmatched (or
  // dropped when ASIAN_KEEP_UNMATCHED=0).
  function toMeta(cfg, item, tmdb) {
    var type = item.type === 'series' ? 'series' : 'movie';
    var name = cleanDisplayName(item.title);
    if (!name) return null;
    var sitePoster = cleanPosterUrl(cfg.pinoySite, item.poster) ||
      cleanPosterUrl(cfg.kissasianSite, item.poster) ||
      cleanPosterUrl(cfg.viewasianSite, item.poster);
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
        var fp = cleanPosterUrl(cfg.pinoySite, poster);
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
        source: 'ph',
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

  function pinoyParseUrl(cfg, url) {
    return fetchTextWithRetry(cfg, url, 12000).then(function (html) {
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

  function pinoyPageMetas(cfg, def, page, extras) {
    var url;
    var search = String(extras.search || '').trim();
    if (search) {
      url = page === 1
        ? cfg.pinoySite + '/?s=' + encodeURIComponent(search)
        : cfg.pinoySite + '/page/' + page + '/?s=' + encodeURIComponent(search);
    } else if (def.mode === 'genre' && extras.genre) {
      var slug = slugifyGenre(extras.genre);
      url = page === 1
        ? cfg.pinoySite + '/genre/' + slug + '/'
        : cfg.pinoySite + '/genre/' + slug + '/page/' + page + '/';
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
  // v3.0.0: replaces myasiantv.com.lv (user request). The site serves:
  //   - home archive  /page/{n}/  -> <article class="bs"> episode rows;
  //     rows are deduped to SERIES by stripping the "-episode-{n}" suffix
  //     (a fresh "latest updates" browse — every page mixes ~26 series)
  //   - search        /?s={q}    -> <article class="bs"> rows with
  //     /series/{slug}/ links and clean title attributes
  //   - genre archive /genres/{slug}/ (page 1; deeper pages 404 -> the
  //     buffer engine simply marks the listing exhausted)
  // Titles carry no year; posters are episode thumbs (upgraded via
  // cleanPosterUrl). TMDB matching runs as for every other source.

  // Genre chips for the kissasian catalog (live /genres/ slugs, Sep 2026).
  var KS_GENRE_CHIPS = [
    'Action', 'Comedy', 'Crime', 'Documentary', 'Drama', 'Fantasy',
    'Historical', 'Horror', 'Life', 'Mature', 'Music', 'Mystery',
    'Romance', 'Sci-Fi', 'Supernatural', 'Thriller', 'War', 'Wuxia', 'Youth'
  ];

  function ksSlugToGenre(slug) {
    var s = String(slug || '');
    var map = {
      action: 'Action', comedy: 'Comedy', crime: 'Crime',
      documentary: 'Documentary', drama: 'Drama', fantasy: 'Fantasy',
      historical: 'Historical', horror: 'Horror', life: 'Life',
      mature: 'Mature', music: 'Music', mystery: 'Mystery',
      romance: 'Romance', 'sci-fi': 'Sci-Fi', supernatural: 'Supernatural',
      thriller: 'Thriller', war: 'War', wuxia: 'Wuxia', youth: 'Youth'
    };
    return map[s] || s.charAt(0).toUpperCase() + s.slice(1);
  }

  /**
   * Parses one kissasian.cam HTML page into series rows.
   * Episode rows (/{slug}-episode-{n}/) dedupe to their series; /series/
   * rows pass through as-is; movie rows (no episode suffix) are dropped —
   * this catalog is series-only by design.
   */
  function ksParseListPage(cfg, html) {
    var items = [];
    var seen = {};
    // host is config-driven (KISSASIAN_SITE override / test fixtures)
    var host = String(cfg.kissasianSite || '').replace(/^https?:\/\//, '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    var reHref = new RegExp('href="https?://' + host + '/(?:series/)?([a-z0-9-]+)/"', 'i');
    var reSeries = new RegExp('href="https?://' + host + '/series/', 'i');
    var re = /<article class="bs"[^>]*>([\s\S]*?)<\/article>/g;
    var m;
    while ((m = re.exec(html)) !== null) {
      var body = m[1];
      var isSeriesRow = reSeries.test(body);
      // first link inside the row: search rows point at /series/{slug}/,
      // home rows at /{slug}-episode-{n}/ — capture the full path tail
      var link = body.match(reHref);
      if (!link) continue;
      var slug = link[1];
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
      } else if (!isSeriesRow) {
        // movie / non-series row (search rows carry /series/ links)
        continue;
      }
      if (seen[slug]) continue;
      seen[slug] = true;
      items.push({
        source: 'ks',
        slug: slug,
        url: cfg.kissasianSite + '/series/' + slug + '/',
        type: 'series',
        title: collapseWs(title),
        year: '',
        poster: poster,
        description: ''
      });
    }
    return items;
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
    } else {
      url = page === 1 ? cfg.kissasianSite + '/' : cfg.kissasianSite + '/page/' + page + '/';
    }
    return ksPageRaw(cfg, url).then(function (items) {
      if (!items.length) return [];
      return resolveBatch(cfg, items);
    });
  }

  // ===== source 3: viewasian.lol (WordPress "viewasian" HTML) =====
  // v3.0.0: second series source (user request). The site serves:
  //   - home archive  /page/{n}/  -> ul.switch-block.list-episode-item rows;
  //     li titles look like "Show (2026) Episode 2 English Sub" (year inline)
  //   - search        /?s={q}    -> /drama/{slug}/ rows, a-title "Show (2024)"
  //   - genre archive /genre/{slug}/ + /genre/{slug}/page/{n}/ (verified)
  //   - country       /country/{slug}/ (korean/chinese/japanese verified;
  //     thai archive does not exist on this site)

  // Genre chips for the viewasian catalog (all slugs verified live, Sep 2026).
  var VA_GENRE_CHIPS = [
    'Action', 'Adventure', 'Business', 'Comedy', 'Crime', 'Documentary',
    'Drama', 'Friendship', 'Historical', 'Horror', 'Life', 'Medical',
    'Melodrama', 'Music', 'Mystery', 'Political', 'Romance', 'School',
    'Sci-Fi', 'Supernatural', 'Thriller', 'War', 'Youth',
    'Korean', 'Chinese', 'Japanese'
  ];

  function vaGenreUrlPart(genre) {
    // country chips route to /country/ archives, everything else /genre/
    var map = { korean: 'country', chinese: 'country', japanese: 'country' };
    var slug = slugifyGenre(genre);
    return (map[slug] || 'genre') + '/' + slug;
  }

  /**
   * Parses one viewasian.lol listing/search page into series rows.
   * Episode rows dedupe to their series; a-titles / img alts carry
   * "Show (Year) Episode N ..." — the year is kept for TMDB matching.
   */
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
        source: 'va',
        slug: slug,
        url: cfg.viewasianSite + '/drama/' + slug + '/',
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
    } else if (def.mode === 'genre' && extras.genre) {
      var part = vaGenreUrlPart(extras.genre);
      url = page === 1
        ? cfg.viewasianSite + '/' + part + '/'
        : cfg.viewasianSite + '/' + part + '/page/' + page + '/';
      return vaPageRaw(cfg, url).then(function (items) {
        return items.length ? resolveBatch(cfg, items) : [];
      }).catch(function () { return []; }); // missing archives (e.g. thai) stay empty
    } else {
      url = page === 1 ? cfg.viewasianSite + '/' : cfg.viewasianSite + '/page/' + page + '/';
    }
    return vaPageRaw(cfg, url).then(function (items) {
      if (!items.length) return [];
      return resolveBatch(cfg, items);
    });
  }

  // ===== source 4: TMDB Discover / Search (official asian directories) =====

  // Official TMDB movie genre ids (stable).
  var TMDB_MOVIE_GENRES = {
    action: 28, adventure: 12, animation: 16, comedy: 35, crime: 80,
    documentary: 99, drama: 18, family: 10751, fantasy: 14, history: 36,
    horror: 27, music: 10402, mystery: 9648, romance: 10749, 'sci-fi': 878,
    thriller: 53, war: 10752
  };

  var TMDB_GENRE_CHIPS = [
    'Action', 'Adventure', 'Animation', 'Comedy', 'Crime', 'Documentary',
    'Drama', 'Family', 'Fantasy', 'History', 'Horror', 'Music', 'Mystery',
    'Romance', 'Sci-Fi', 'Thriller', 'War'
  ];

  function asianLangFilter() {
    return encodeURIComponent(ASIAN_LANGS.join('|'));
  }

  function tmdbResultToMeta(cfg, r, type) {
    var id = r && r.id;
    if (!id) return null;
    var name = r.title || r.name || '';
    if (!name) return null;
    var meta = {
      id: 'tmdb:' + id,
      type: type,
      name: name,
      poster: tmdbImg('w342', r.poster_path || ''),
      posterShape: 'poster'
    };
    if (!meta.poster) delete meta.poster;
    var bg = tmdbImg('w780', r.backdrop_path || '');
    if (bg) meta.background = bg;
    var year = String(r.release_date || r.first_air_date || '').split('-')[0] || '';
    if (year) meta.releaseInfo = year;
    if (r.overview) meta.description = r.overview;
    if (typeof r.vote_average === 'number' && r.vote_average > 0) {
      meta.imdbRating = Math.round(r.vote_average * 10) / 10;
    }
    return meta;
  }

  function tmdbPageMetas(cfg, def, page, extras) {
    var type = def.type; // 'movie' | 'series'
    var kind = type === 'movie' ? 'movie' : 'tv';
    var dateField = type === 'movie' ? 'primary_release_date' : 'first_air_date';
    var search = String(extras.search || '').trim();
    var genreSlug = slugifyGenre(extras.genre || '');
    var base = 'https://api.themoviedb.org/3/';
    var langFilter = 'with_original_language=' + asianLangFilter();
    var url;

    if (search) {
      url = base + 'search/' + kind + '?api_key=' + encodeURIComponent(cfg.tmdbKey) +
        '&query=' + encodeURIComponent(search) + '&include_adult=false&page=' + page;
      return fetchJson(cfg, url, 12000).then(function (data) {
        var out = [];
        if (data && Array.isArray(data.results)) {
          for (var i = 0; i < data.results.length; i++) {
            var r = data.results[i];
            if (ASIAN_LANGS.indexOf(r.original_language) === -1) {
              continue;
            }
            var m = tmdbResultToMeta(cfg, r, type);
            if (m) out.push(m);
          }
        }
        return out;
      });
    }

    // v3.1.0: language-matrix rows pin ONE original language (replacing the
    // multi-language filter); on-the-air row pins TMDB's airing flag.
    if (def.mode === 'language' && genreSlug) {
      var langCode = ASIAN_LANG_CODES[genreSlug];
      if (!langCode) return Promise.resolve([]);
      langFilter = 'with_original_language=' + langCode;
    }

    url = base + 'discover/' + kind + '?api_key=' + encodeURIComponent(cfg.tmdbKey) +
      '&' + langFilter + '&include_adult=false&page=' + page;
    if (def.mode === 'airing') {
      url += '&on_the_air=true&vote_count.gte=2&sort_by=popularity.desc';
    } else if (def.mode === 'genre' && genreSlug) {
      var gid = TMDB_MOVIE_GENRES[genreSlug];
      if (!gid) return Promise.resolve([]);
      url += '&with_genres=' + gid;
    } else if (def.id === 'asian-series-trending') {
      // newest asian series first (the "what's new" browse)
      url += '&sort_by=' + dateField + '.desc&vote_count.gte=3';
    } else {
      url += '&sort_by=popularity.desc&vote_count.gte=5';
    }
    return fetchJson(cfg, url, 12000).then(function (data) {
      var out = [];
      if (data && Array.isArray(data.results)) {
        for (var i = 0; i < data.results.length; i++) {
          var m = tmdbResultToMeta(cfg, data.results[i], type);
          if (m) out.push(m);
        }
      }
      return out;
    });
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
        // Page 1 failures mean the source is down (fatal). Deeper-page
        // failures (e.g. 404 past the last listing page) simply mark the
        // listing exhausted.
        var fetchPage = pageMetasFn(page);
        var safeFetch = page === 1 ? fetchPage : fetchPage.catch(function () { return null; });
        return safeFetch.then(function (metas) {
          if (!metas || !metas.length) {
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

  // ===== language chips (stremio-parity language matrix) =====
  // v3.1.0: TMDB-native browse rows learned from stremio-addons.net research
  // (Streaming Catalogs Plus provider_* pattern): a per-language matrix and an
  // on-the-air row, both powered by the official TMDB directory.
  var ASIAN_LANG_CHIPS = ['Korean', 'Japanese', 'Chinese', 'Thai', 'Filipino / Tagalog'];
  var ASIAN_LANG_CODES = {
    'korean': 'ko',
    'japanese': 'ja',
    'chinese': 'zh',
    'thai': 'th',
    'filipino-tagalog': 'tl'
  };

  // ===== catalogs / manifest (the organized directory) =====

  // Manifest order groups catalogs by source. Pinoy catalogs keep the
  // well-known pinoy-* ids so existing installs stay coherent.
  function catalogDefinitions() {
    var pinoyGenres = [
      'Action', 'Adventure', 'Animation', 'Anthology Series', 'BL Series',
      'Comedy', 'Concert', 'Crime', 'Documentary', 'Drama', 'Family',
      'Fantasy', 'History', 'Horror', 'Indie', 'LGBTQ', 'Music', 'Musical',
      'Mystery', 'Romance', 'Science Fiction', 'Short Films', 'Sports',
      'Stageplay', 'Tagalog Dubbed', 'Teleserye', 'Thriller', 'War',
      'Wattpad', 'Web Series'
    ];
    return [
      // --- Pinoy Movies Hub (pinoymovieshub.win) ---
      {
        type: 'movie', id: 'pinoy-movies', name: 'Pinoy Movies', source: 'pinoy',
        mode: 'archive',
        description: 'Latest Pinoy movies from pinoymovieshub.win',
        extra: [{ name: 'search' }, { name: 'skip' }]
      },
      {
        type: 'series', id: 'pinoy-series', name: 'Pinoy Series', source: 'pinoy',
        mode: 'archive',
        description: 'Latest Pinoy series and Tagalog-dubbed shows from pinoymovieshub.win',
        extra: [{ name: 'search' }, { name: 'skip' }]
      },
      {
        type: 'movie', id: 'pinoy-movies-genre', name: 'Pinoy Movies by Genre', source: 'pinoy',
        mode: 'genre',
        description: 'Browse Pinoy movies by genre',
        extra: [{ name: 'genre', options: pinoyGenres }, { name: 'skip' }]
      },
      {
        type: 'series', id: 'pinoy-series-genre', name: 'Pinoy Series by Genre', source: 'pinoy',
        mode: 'genre',
        description: 'Browse Pinoy series by genre',
        extra: [{ name: 'genre', options: pinoyGenres }, { name: 'skip' }]
      },
      // --- KissAsian (kissasian.cam HTML, series) ---
      {
        type: 'series', id: 'asian-series', name: 'Asian Series (KissAsian)', source: 'kissasian',
        mode: 'archive',
        description: 'Latest Asian dramas — Korean, Chinese, Japanese and more — from kissasian.cam',
        extra: [{ name: 'search' }, { name: 'skip' }]
      },
      {
        type: 'series', id: 'asian-series-genre', name: 'Asian Series by Genre (KissAsian)', source: 'kissasian',
        mode: 'genre',
        description: 'Browse Asian dramas by genre on kissasian.cam',
        extra: [{ name: 'genre', options: KS_GENRE_CHIPS.slice() }, { name: 'skip' }]
      },
      // --- ViewAsian (viewasian.lol HTML, series) ---
      {
        type: 'series', id: 'asian-series-viewasian', name: 'Asian Series (ViewAsian)', source: 'viewasian',
        mode: 'archive',
        description: 'Latest Asian dramas — Korean, Chinese, Japanese, Thai — from viewasian.lol',
        extra: [{ name: 'search' }, { name: 'skip' }]
      },
      {
        type: 'series', id: 'asian-series-viewasian-genre', name: 'Asian Series by Genre (ViewAsian)', source: 'viewasian',
        mode: 'genre',
        description: 'Browse Asian dramas by genre or country on viewasian.lol',
        extra: [{ name: 'genre', options: VA_GENRE_CHIPS.slice() }, { name: 'skip' }]
      },
      // --- TMDB asian-language directory ---
      {
        type: 'movie', id: 'asian-movies', name: 'Asian Movies', source: 'tmdb',
        mode: 'archive',
        description: 'Popular Korean, Chinese, Japanese, Thai and Filipino movies (official TMDB directory)',
        extra: [{ name: 'search' }, { name: 'skip' }]
      },
      {
        type: 'series', id: 'asian-series-trending', name: 'Asian Series Trending', source: 'tmdb',
        mode: 'archive',
        description: 'Newest and trending Asian series across all languages (official TMDB directory)',
        extra: [{ name: 'search' }, { name: 'skip' }]
      },
      {
        type: 'movie', id: 'asian-movies-genre', name: 'Asian Movies by Genre', source: 'tmdb',
        mode: 'genre',
        description: 'Browse Asian movies by genre (official TMDB directory)',
        extra: [{ name: 'genre', options: TMDB_GENRE_CHIPS.slice() }, { name: 'skip' }]
      },
      // --- TMDB language matrix + on-the-air (v3.1.0) ---
      {
        type: 'series', id: 'asian-series-language', name: 'Asian Series by Language', source: 'tmdb',
        mode: 'language',
        description: 'Browse Asian series by original language: Korean, Japanese, Chinese, Thai, Filipino (official TMDB directory)',
        extra: [{ name: 'genre', options: ASIAN_LANG_CHIPS.slice() }, { name: 'skip' }]
      },
      {
        type: 'movie', id: 'asian-movies-language', name: 'Asian Movies by Language', source: 'tmdb',
        mode: 'language',
        description: 'Browse Asian movies by original language: Korean, Japanese, Chinese, Thai, Filipino (official TMDB directory)',
        extra: [{ name: 'genre', options: ASIAN_LANG_CHIPS.slice() }, { name: 'skip' }]
      },
      {
        type: 'series', id: 'asian-series-airing', name: 'Asian Series On The Air', source: 'tmdb',
        mode: 'airing',
        description: 'Asian dramas with episodes airing right now (official TMDB on-the-air directory)',
        extra: [{ name: 'skip' }]
      }
    ];
  }

  // v3.1.0 personalization (Streaming-Catalogs-Plus pattern, proven Nuvio-safe):
  //   /manifest.json?sources=pinoy,kissasian,viewasian,tmdb  -> only catalogs from those sources
  //   /manifest.json?langs=ko,ja,th                          -> language rows trimmed to those codes
  function manifest(cfg) {
    var srcFilter = (cfg && cfg.__manifestSources) || null;
    var langFilter = (cfg && cfg.__manifestLangs) || null;
    var catalogs = catalogDefinitions().filter(function (c) {
      if (srcFilter && srcFilter.indexOf(c.source) === -1) return false;
      return true;
    }).map(function (c) {
      var extra = c.extra;
      if (langFilter && c.mode === 'language') {
        var trimmed = ASIAN_LANG_CHIPS.filter(function (chip) {
          var code = ASIAN_LANG_CODES[slugifyGenre(chip)];
          return code && langFilter.indexOf(code) !== -1;
        });
        if (!trimmed.length) return null;
        extra = [{ name: 'genre', options: trimmed }, { name: 'skip' }];
      }
      return {
        type: c.type,
        id: c.id,
        name: c.name,
        pageSize: cfg.pageLimit,
        extra: extra
      };
    }).filter(function (c) { return c; });
    return {
      id: ADDON_ID,
      version: VERSION,
      name: ADDON_NAME,
      description: 'Organized Asian catalogs: Pinoy movies & series (pinoymovieshub), Asian dramas (kissasian.cam + viewasian.lol) and Asian movies/series directories by language (TMDB). EVERY row resolves to a playable stream: the addon serves /stream + /meta for its own ids (site-coded fallbacks + TMDB rows), paired with the AsianHub/PinoyMoviesHub plugins.',
      logo: cfg.pinoySite + PINOY_ICON,
      resources: [
        { name: 'catalog', types: ['movie', 'series'] },
        { name: 'meta', types: ['movie', 'series'], idPrefixes: ['asian:'] },
        { name: 'stream', types: ['movie', 'series'], idPrefixes: ['asian:', 'tmdb:'] }
      ],
      types: ['movie', 'series'],
      idPrefixes: ['tmdb:', 'asian:'],
      catalogs: catalogs,
      behaviorHints: { configurable: false }
    };
  }

  // ===== /meta + /stream — every catalog row resolves to a playable stream ==
  // WHY (v3.2.0): both Nuvio apps only forward `tmdb:`/`tt` ids to stream
  // plugins. TVSmart skips plugin execution entirely for `asian:` ids
  // (TmdbService.ensureTmdbId -> null -> streamRepository bails) and Mobile
  // hands the raw `asian:...` string to plugins whose TMDB lookup then 404s.
  // The addon previously declared only a `catalog` resource, so no app ever
  // asked it for streams. Both apps DO honor Stremio meta/stream resources
  // with idPrefixes (verified in both codebases), so this engine adds:
  //     GET /meta/{type}/{id}.json     -> details + episode `videos` (series)
  //     GET /stream/{type}/{id}.json   -> direct playable Stremio streams
  // Server-side extraction ports the proven device chains (providers/
  // pinoyhub.js + asianhub.js): Workers run real fetch + full JS, so the
  // PoW + AES work devices do in QuickJS runs here too, fail-soft per lane.
  //
  // ID FORMATS SERVED
  //   asian:ph-<slug>          pinoymovieshub  (/movies/slug, /episodes/slug-SxE)
  //   asian:ks-<slug>          kissasian.cam   (/series/slug -> episode pages)
  //   asian:va-<slug>          viewasian.lol   (/drama/slug  -> episode pages)
  //   asian:<slug>             LEGACY bare ids (pre-3.2.0 rows still cached in
  //                            apps) -> title search across all three sites
  //   tmdb:<id>[:S:E]          TMDB rows -> title search + slug probes
  //   <anything>:S:E           series episode ids (Nuvio app convention)

  var STREAM_CACHE_TTL = 15 * 60 * 1000;
  var DOC_CACHE_TTL = 10 * 60 * 1000;
  var SERVER_POW_MAX_MS = 2500; // Worker CPU budget for the Byse PoW loop
  var JUSTPLAY_BASE = 'https://justplay.cam';

  var streamCache = new Map(); // cacheKey -> { ts, streams }
  var docCache = new Map();    // url -> { ts, html }

  function cacheGetFresh(map, key, ttl, nowFn) {
    var hit = map.get(key);
    if (!hit) return null;
    if (nowFn() - hit.ts >= ttl) { map.delete(key); return null; }
    return hit;
  }

  function cachePut(map, key, value, cap) {
    map.set(key, { ts: Date.now(), value: value });
    var it = map.keys();
    while (map.size > cap) {
      var k = it.next();
      if (k.done) break;
      map.delete(k.value);
    }
  }

  function sxHostOf(url) {
    var m = String(url || '').match(/^https?:\/\/([^\/?#]+)/i);
    return m ? m[1].toLowerCase() : '';
  }

  function sxSlugTitle(s) {
    return String(s || '').toLowerCase()
      .replace(/&/g, ' and ')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  function sxParseQuality(text) {
    var t = String(text || '');
    var m = t.match(/(\d{3,4})\s*p/i);
    if (m) { var n = parseInt(m[1], 10); if (n >= 144) return n + 'p'; }
    if (/1080|full[\s-]*hd/i.test(t)) return '1080p';
    if (/720|hd[\s-]*cam|hdrip|web[\s-]*dl/i.test(t)) return '720p';
    return '';
  }

  // Page fetch with a small doc cache (episode/series pages are hit by both
  // /meta and /stream and by consecutive episode requests).
  function sxDoc(cfg, url, timeoutMs, headers) {
    var hit = cacheGetFresh(docCache, url, DOC_CACHE_TTL, cfg.nowFn);
    if (hit) return Promise.resolve(hit.value);
    return fetchText(cfg, url, timeoutMs || 12000, headers).then(function (html) {
      cachePut(docCache, url, html, 300);
      return html;
    });
  }

  function sxMerge(a, b) {
    var out = {}, k;
    for (k in (a || {})) out[k] = a[k];
    for (k in (b || {})) out[k] = b[k];
    return out;
  }

  function sxJsonPost(cfg, url, bodyObj, headers, timeoutMs) {
    if (!cfg.fetchFn) return Promise.reject(new Error('no fetch available'));
    var opts = {
      method: 'POST',
      headers: sxMerge({
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }, headers || {}),
      body: JSON.stringify(bodyObj || {}),
      redirect: 'follow'
    };
    var sig = timeoutSignal(timeoutMs || 15000);
    if (sig) opts.signal = sig;
    return Promise.resolve().then(function () { return cfg.fetchFn(url, opts); }).then(function (res) {
      return res.text().then(function (t) {
        var data = null;
        try { data = t ? JSON.parse(t) : null; } catch (e) { data = null; }
        return { status: res.status, data: data };
      });
    });
  }

  // HLS master/media playlist resolver (port of asianhub.js resolveHls).
  function sxResolveHls(cfg, url, referer, sourceLabel) {
    var headers = referer ? { 'Referer': referer } : {};
    return fetchText(cfg, url, 6000, headers).then(function (text) {
      if (!text || text.indexOf('#EXTM3U') !== 0) {
        if (/\.mp4(\?|$)/i.test(url)) return { url: url, quality: '' };
        return null;
      }
      if (text.indexOf('#EXT-X-STREAM-INF') !== -1) {
        var lines = text.split('\n');
        var best = null, bestH = 0, i;
        for (i = 0; i < lines.length - 1; i++) {
          if (lines[i].indexOf('#EXT-X-STREAM-INF') === 0) {
            var rm = lines[i].match(/RESOLUTION=(\d+)x(\d+)/);
            var bm = lines[i].match(/BANDWIDTH=(\d+)/);
            var h = rm ? parseInt(rm[1], 10) : (bm ? parseInt(bm[1], 10) / 1000 : 0);
            var next = String(lines[i + 1] || '').trim();
            if (next && next.charAt(0) !== '#' && h > bestH) { bestH = h; best = next; }
          }
        }
        if (best) {
          var abs = best.indexOf('http') === 0 ? best : url.replace(/[^\/]*$/, '') + best;
          return { url: abs, quality: sxParseQuality(text) };
        }
        return null;
      }
      return { url: url, quality: sxParseQuality(text) };
    }).catch(function () {
      // The URL is still the player's real stream URL — return unverified.
      return { url: url, quality: '' };
    });
  }

  // ===== Byse crypto (verbatim port of providers/asianhub.js — proven) ==

  function b64urlToBytes(str) {
    var ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    var t = String(str || '').replace(/-/g, '+').replace(/_/g, '/');
    var out = [];
    var acc = 0, bits = 0, i, v;
    for (i = 0; i < t.length; i++) {
      var ch = t.charAt(i);
      if (ch === '=') break;
      v = ALPHA.indexOf(ch);
      if (v < 0) continue;
      acc = (acc << 6) | v;
      bits += 6;
      if (bits >= 8) {
        bits -= 8;
        out.push((acc >> bits) & 0xff);
      }
    }
    return out;
  }

  function bytesToUtf8(bytes) {
    var out = '', i = 0, c, cp;
    while (i < bytes.length) {
      c = bytes[i];
      if (c < 0x80) { out += String.fromCharCode(c); i += 1; }
      else if (c < 0xe0) {
        out += String.fromCharCode(((c & 0x1f) << 6) | (bytes[i + 1] & 0x3f));
        i += 2;
      } else if (c < 0xf0) {
        out += String.fromCharCode(((c & 0x0f) << 12) | ((bytes[i + 1] & 0x3f) << 6) | (bytes[i + 2] & 0x3f));
        i += 3;
      } else {
        cp = ((c & 0x07) << 18) | ((bytes[i + 1] & 0x3f) << 12) | ((bytes[i + 2] & 0x3f) << 6) | (bytes[i + 3] & 0x3f);
        cp -= 0x10000;
        out += String.fromCharCode(0xd800 + (cp >> 10), 0xdc00 + (cp & 0x3ff));
        i += 4;
      }
    }
    return out;
  }

  var AES_SBOX = (function () {
    var box = new Array(256);
    var p = 1, q = 1, t;
    do {
      p = p ^ ((p << 1) ^ (p & 0x80 ? 0x11b : 0));
      p &= 0xff;
      q = (q ^ (q << 1)) & 0xff;
      q = (q ^ (q << 2)) & 0xff;
      q = (q ^ (q << 4)) & 0xff;
      if (q & 0x80) q ^= 0x09;
      t = q ^ ((q << 1) | (q >>> 7)) ^ ((q << 2) | (q >>> 6)) ^ ((q << 3) | (q >>> 5)) ^ ((q << 4) | (q >>> 4));
      box[p] = (t ^ 0x63) & 0xff;
    } while (p !== 1);
    box[0] = 0x63;
    return box;
  })();

  function aes256ExpandKey(keyBytes) {
    var rcon = [0x01, 0x02, 0x04, 0x08, 0x10, 0x20, 0x40];
    var w = [];
    var i, t;
    for (i = 0; i < 8; i++) {
      w.push([keyBytes[4 * i], keyBytes[4 * i + 1], keyBytes[4 * i + 2], keyBytes[4 * i + 3]]);
    }
    for (i = 8; i < 60; i++) {
      t = w[i - 1].slice(0);
      if (i % 8 === 0) {
        t = [AES_SBOX[t[1]] ^ rcon[i / 8 - 1], AES_SBOX[t[2]], AES_SBOX[t[3]], AES_SBOX[t[0]]];
      } else if (i % 8 === 4) {
        t = [AES_SBOX[t[0]], AES_SBOX[t[1]], AES_SBOX[t[2]], AES_SBOX[t[3]]];
      }
      w.push([w[i - 8][0] ^ t[0], w[i - 8][1] ^ t[1], w[i - 8][2] ^ t[2], w[i - 8][3] ^ t[3]]);
    }
    return w;
  }

  function aesXtime(x) {
    return ((x << 1) ^ (x & 0x80 ? 0x1b : 0)) & 0xff;
  }

  function aes256EncryptBlock(w, input) {
    var s = new Array(16);
    var out = new Array(16);
    var i, c, r, round, a0, a1, a2, a3, t0, t1, t2, t3, src;
    for (i = 0; i < 16; i++) s[i] = input[i] ^ w[Math.floor(i / 4)][i % 4];
    for (round = 1; round < 14; round++) {
      src = s.slice(0);
      for (c = 0; c < 4; c++) {
        a0 = AES_SBOX[src[((c + 0) % 4) * 4 + 0]];
        a1 = AES_SBOX[src[((c + 1) % 4) * 4 + 1]];
        a2 = AES_SBOX[src[((c + 2) % 4) * 4 + 2]];
        a3 = AES_SBOX[src[((c + 3) % 4) * 4 + 3]];
        t0 = aesXtime(a0); t1 = aesXtime(a1); t2 = aesXtime(a2); t3 = aesXtime(a3);
        s[c * 4 + 0] = (t0 ^ a1 ^ t1 ^ a2 ^ a3) & 0xff;
        s[c * 4 + 1] = (a0 ^ t1 ^ a2 ^ t2 ^ a3) & 0xff;
        s[c * 4 + 2] = (a0 ^ a1 ^ t2 ^ a3 ^ t3) & 0xff;
        s[c * 4 + 3] = (a0 ^ t0 ^ a1 ^ a2 ^ t3) & 0xff;
      }
      for (i = 0; i < 16; i++) s[i] ^= w[4 * round + Math.floor(i / 4)][i % 4];
    }
    for (c = 0; c < 4; c++) {
      for (r = 0; r < 4; r++) {
        out[c * 4 + r] = AES_SBOX[s[((c + r) % 4) * 4 + r]] ^ w[56 + c][r];
      }
    }
    return out;
  }

  // GCM plaintext recovery (CTR phase only, 16-byte auth tag skipped) —
  // identical behaviour to asianhub.js on devices.
  function aesGcmDecryptNoTag(keyBytes, ivBytes, dataBytes) {
    var w = aes256ExpandKey(keyBytes);
    var cb = [];
    var i, j, ks, off = 0, n = dataBytes.length - 16;
    for (i = 0; i < 12; i++) cb.push(ivBytes[i] & 0xff);
    cb.push(0, 0, 0, 2);
    var out = [];
    while (off < n) {
      ks = aes256EncryptBlock(w, cb);
      for (j = 0; j < 16 && off < n; j++, off++) {
        out.push(dataBytes[off] ^ ks[j]);
      }
      for (j = 3; j >= 0; j--) {
        cb[12 + j] = (cb[12 + j] + 1) & 0xff;
        if (cb[12 + j]) break;
      }
    }
    return out;
  }

  function byseKeyFromParts(playback) {
    var parts = playback.key_parts;
    if (!parts || !parts.length) return null;
    var version = parseInt(playback.version, 10);
    var picked = [];
    var i, b;
    if (version >= 1 && version <= 20) {
      var i1 = version - 1;
      var i2 = 30 - version;
      if (parts[i1]) picked.push(parts[i1]);
      if (parts[i2] && i2 !== i1) picked.push(parts[i2]);
      if (!picked.length) return null;
    } else {
      picked = parts;
    }
    var bytes = [];
    for (i = 0; i < picked.length; i++) {
      if (typeof picked[i] !== 'string' || !picked[i].length) continue;
      b = b64urlToBytes(picked[i]);
      bytes = bytes.concat(b);
    }
    return bytes;
  }

  // ===== Byse proof-of-work (custom xxHash-style mixer, NOT sha256) =====

  function byseRotl(x, n) { return ((x << n) | (x >>> (32 - n))) >>> 0; }

  function byseMix(s) {
    s[0] = (s[0] + s[1]) >>> 0; s[3] = byseRotl(s[3] ^ s[0], 16);
    s[2] = (s[2] + s[3]) >>> 0; s[1] = byseRotl(s[1] ^ s[2], 12);
    s[0] = (s[0] + s[1]) >>> 0; s[3] = byseRotl(s[3] ^ s[0], 8);
    s[2] = (s[2] + s[3]) >>> 0; s[1] = byseRotl(s[1] ^ s[2], 7);
  }

  function byseBytes(str) {
    var out = new Uint8Array(str.length);
    for (var i = 0; i < str.length; i++) out[i] = str.charCodeAt(i) & 255;
    return out;
  }

  function byseHashDigest(bytes) {
    var s = new Uint32Array([1779033703, 3144134277, 1013904242, 2773480762]);
    var i, f, a, rd, k, w, t, d, v;
    for (i = 0; i < bytes.length; i++) {
      s[0] = (s[0] + bytes[i]) >>> 0;
      s[0] = byseRotl(s[0], 7);
      byseMix(s);
    }
    for (f = 0; f < 8; f++) byseMix(s);
    var r = new Uint32Array(512);
    for (a = 0; a < 512; a++) { byseMix(s); r[a] = (s[0] ^ s[2]) >>> 0; }
    for (rd = 0; rd < 2; rd++) {
      for (k = 0; k < 512; k++) {
        var idx = r[k] & 511;
        var c = (r[k] + r[idx]) >>> 0;
        c = byseRotl(c, 13);
        c = (c ^ Math.imul(r[(k + 1) & 511], 2654435761)) >>> 0;
        r[k] = c;
        s[0] = (s[0] ^ c) >>> 0;
        byseMix(s);
      }
    }
    var n = new Uint32Array(8);
    for (w = 0; w < 8; w++) {
      byseMix(s);
      v = s[0];
      var base = w * 64;
      for (t = 0; t < 64; t++) {
        d = r[base + t];
        v = (v + d) >>> 0;
        v = byseRotl(v, 5);
        v = (v ^ Math.imul(d, 2246822519)) >>> 0;
      }
      n[w] = (v ^ s[2]) >>> 0;
    }
    return n;
  }

  function byseLeadingZeroBits(words) {
    var bits = 0;
    for (var i = 0; i < words.length; i++) {
      if (words[i] === 0) { bits += 32; continue; }
      return bits + Math.clz32(words[i]);
    }
    return bits;
  }

  function byseSolvePow(nonceStr, difficulty, maxMs) {
    if (difficulty <= 0) return '0';
    var prefix = String(nonceStr) + ':';
    var counter = 0;
    var t0 = Date.now();
    var budget = maxMs || SERVER_POW_MAX_MS;
    for (;;) {
      var d = byseHashDigest(byseBytes(prefix + counter));
      if (byseLeadingZeroBits(d) >= difficulty) return String(counter);
      counter++;
      if ((counter & 8191) === 0 && Date.now() - t0 > budget) return null;
      if (counter > 4000000) return null;
    }
  }

  // Byse playback payload decrypt -> { url, quality } (best source).
  function byseDecryptPlayback(pb) {
    if (!pb || !pb.payload || !pb.iv || pb.algorithm !== 'AES-256-GCM') return null;
    var keyBytes = byseKeyFromParts(pb);
    if (!keyBytes || keyBytes.length !== 32) return null;
    var plain = aesGcmDecryptNoTag(keyBytes, b64urlToBytes(pb.iv), b64urlToBytes(pb.payload));
    if (!plain.length) return null;
    var info = null;
    try { info = JSON.parse(bytesToUtf8(plain)); } catch (e) { return null; }
    var sources = (info && info.sources) || [];
    var best = null, bestH = -1, i, s, h;
    for (i = 0; i < sources.length; i++) {
      s = sources[i];
      if (!s || !s.url || String(s.url).indexOf('http') !== 0) continue;
      h = parseInt(s.height, 10) || 0;
      if (h >= bestH) { bestH = h; best = s; }
    }
    if (!best) return null;
    var q = (best.label && best.label !== 'x')
      ? (parseInt(best.height, 10) ? best.height + 'p' : String(best.label))
      : (parseInt(best.height, 10) ? best.height + 'p' : 'Auto');
    // Signed Byse URLs are self-authorizing — no playback headers attached.
    return { url: String(best.url), quality: q };
  }

  // KissAsian flavour: justplay.cam embed API with PoW + captcha token.
  function sxByseEmbedResolve(cfg, code, refererUrl) {
    var embedHeaders = {
      'Referer': refererUrl || (cfg.kissasianSite + '/'),
      'X-Embed-Origin': cfg.kissasianSite,
      'X-Embed-Referer': refererUrl || (cfg.kissasianSite + '/'),
      'X-Embed-Parent': cfg.kissasianSite
    };
    var fingerprint = { device_id: 'nuvio', confidence: 0.9 };
    return sxJsonPost(cfg, JUSTPLAY_BASE + '/api/videos/' + code + '/embed/captcha',
      { fingerprint: fingerprint }, embedHeaders).then(function (ch) {
      var c = ch.data;
      if (!c || !c.pow_nonce || !c.pow_token || ch.status !== 200) return null;
      var solution = byseSolvePow(c.pow_nonce, parseInt(c.pow_difficulty, 10) || 16, SERVER_POW_MAX_MS);
      if (solution === null) return null;
      return sxJsonPost(cfg, JUSTPLAY_BASE + '/api/videos/' + code + '/embed/captcha/verify',
        { pow_token: c.pow_token, solution: solution }, embedHeaders).then(function (vr) {
        var v = vr.data;
        if (!v || v.status !== 'ok' || !v.token) return null;
        var headers = sxMerge(embedHeaders, { 'X-Captcha-Token': v.token });
        return sxJsonPost(cfg, JUSTPLAY_BASE + '/api/videos/' + code + '/embed/playback',
          { fingerprint: fingerprint }, headers).then(function (pr) {
          return byseDecryptPlayback(pr.data && pr.data.playback);
        });
      });
    }).catch(function () { return null; });
  }

  // GET with explicit headers (core fetchJson is fixed to JSON_HEADERS).
  function sxJsonGet(cfg, url, timeoutMs, headers) {
    if (!cfg.fetchFn) return Promise.reject(new Error('no fetch available'));
    var opts = { method: 'GET', redirect: 'follow', headers: headers || JSON_HEADERS };
    var sig = timeoutSignal(timeoutMs || 12000);
    if (sig) opts.signal = sig;
    return Promise.resolve().then(function () { return cfg.fetchFn(url, opts); }).then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status + ' for ' + url);
      return res.json();
    });
  }

  // PinoyMoviesHub flavour: same-origin /api/videos/{code}, no PoW.
  function sxByseDirectResolve(cfg, embedUrl) {
    var codeMatch = embedUrl.match(/\/e\/([a-z0-9]+)/i);
    if (!codeMatch) return Promise.resolve(null);
    var host = sxHostOf(embedUrl);
    var apiUrl = 'https://' + host + '/api/videos/' + codeMatch[1];
    return sxJsonGet(cfg, apiUrl, 12000, {
      'Accept': 'application/json',
      'Referer': cfg.pinoySite + '/',
      'Origin': cfg.pinoySite
    }).then(function (data) {
      if (!data || data.error || !data.playback || data.premium_only) return null;
      return byseDecryptPlayback(data.playback);
    }).catch(function () { return null; });
  }

  // ===== per-site lanes (ports of the proven device chains) =====

  // --- KissAsian (kissasian.cam -> justplay.cam Byse) ---

  // Search rows: <article class="bs"> with /series/{slug}/ + title="Show".
  function ksSearchSeriesUrl(cfg, query) {
    if (!query) return Promise.resolve(null);
    var host = String(cfg.kissasianSite).replace(/^https?:\/\//, '');
    var url = cfg.kissasianSite + '/?s=' + encodeURIComponent(query);
    return sxDoc(cfg, url).then(function (html) {
      var normQ = normalizeForCompare(query);
      var best = null, bestScore = 0;
      var re = /<article class="bs"[^>]*>([\s\S]*?)<\/article>/g;
      var m;
      while ((m = re.exec(html)) !== null) {
        var lm = m[1].match(new RegExp('href="https?://' + host + '/series/([a-z0-9-]+)/"', 'i'));
        if (!lm) continue;
        var tm = m[1].match(/title="([^"]+)"/i);
        if (!tm) continue;
        var score = titleScore(normQ, normalizeForCompare(stripTags(decodeEntities(tm[1]))));
        if (score > bestScore) { bestScore = score; best = lm[1]; }
      }
      return bestScore >= 1.5 ? { site: 'ks', slug: best } : null;
    }).catch(function () { return null; });
  }

  function ksSeriesUrl(cfg, slug) { return cfg.kissasianSite + '/series/' + slug + '/'; }

  // Series page -> episode link /{slug}-episode-{n}/. STRICT slug prefix.
  function ksFindEpisodeUrl(cfg, slug, wantEp) {
    var host = String(cfg.kissasianSite).replace(/^https?:\/\//, '');
    return sxDoc(cfg, ksSeriesUrl(cfg, slug)).then(function (html) {
      var re = new RegExp('href="https?://' + host + '/([a-z0-9-]+-episode-(\\d+))/"', 'gi');
      var m;
      while ((m = re.exec(html)) !== null) {
        if (slug && m[1].indexOf(slug + '-episode-') !== 0) continue;
        if (parseInt(m[2], 10) === wantEp) return cfg.kissasianSite + '/' + m[1] + '/';
      }
      return cfg.kissasianSite + '/' + slug + '-episode-' + wantEp + '/';
    }).catch(function () {
      return cfg.kissasianSite + '/' + slug + '-episode-' + wantEp + '/';
    });
  }

  function ksExtract(cfg, episodeUrl) {
    if (!episodeUrl) return Promise.resolve(null);
    return sxDoc(cfg, episodeUrl).then(function (html) {
      var m = html.match(/<iframe[^>]*src="https?:\/\/justplay\.cam\/e\/([a-z0-9]+)/i);
      if (!m) m = html.match(/https?:\/\/justplay\.cam\/e\/([a-z0-9]+)/i);
      if (!m) return null;
      return sxByseEmbedResolve(cfg, m[1], episodeUrl).then(function (r) {
        if (!r) return null;
        r.source = 'KissAsian';
        return r;
      });
    }).catch(function () { return null; });
  }

  // --- ViewAsian (viewasian.lol -> kisskh.space -> vidmoly -> m3u8) ---

  function vaSearchDramaUrl(cfg, query) {
    if (!query) return Promise.resolve(null);
    var host = String(cfg.viewasianSite).replace(/^https?:\/\//, '');
    var url = cfg.viewasianSite + '/?s=' + encodeURIComponent(query);
    return sxDoc(cfg, url).then(function (html) {
      var normQ = normalizeForCompare(query);
      var best = null, bestScore = 0;
      var re = new RegExp('<a href="https?://' + host + '/drama/([a-z0-9-]+)/"([^>]*)>', 'gi');
      var m;
      while ((m = re.exec(html)) !== null) {
        var tm = m[2].match(/title="([^"]+)"/i);
        var t = tm ? stripTags(decodeEntities(tm[1])) : m[1].replace(/-/g, ' ');
        var score = titleScore(normQ, normalizeForCompare(t));
        if (score > bestScore) { bestScore = score; best = m[1]; }
      }
      return bestScore >= 1.5 ? { site: 'va', slug: best } : null;
    }).catch(function () { return null; });
  }

  function vaDramaUrl(cfg, slug) { return cfg.viewasianSite + '/drama/' + slug + '/'; }

  // Episode URL tails vary per show (-eng-sub / -episode-N / -N-x tails);
  // prefer the shortest tail for the wanted episode (main version).
  function vaFindEpisodeUrl(cfg, slug, wantEp, isSeries) {
    var host = String(cfg.viewasianSite).replace(/^https?:\/\//, '');
    return sxDoc(cfg, vaDramaUrl(cfg, slug)).then(function (html) {
      var moviePath = '';
      var links = {};
      var re = new RegExp('href="https?://' + host + '/([a-z0-9-]+-(?:ep|episode)-(\\d+)(-[a-z0-9-]+)?)/"', 'gi');
      var mre = new RegExp('href="https?://' + host + '/([a-z0-9-]+-(?:full-hd-)?movie)/"', 'i');
      var mm = html.match(mre);
      if (mm) moviePath = mm[1];
      var m;
      while ((m = re.exec(html)) !== null) {
        var num = parseInt(m[2], 10);
        var tail = m[3] || '';
        var svm = tail.match(/^-(\d+)(?:-|$)/);
        var sv = svm ? parseInt(svm[1], 10) : 0;
        var key = num + '-' + sv;
        if (!links[key] || tail.length < links[key].tailLen) {
          links[key] = { path: m[1], num: num, sv: sv, tailLen: tail.length };
        }
      }
      if (!isSeries) {
        if (moviePath) return cfg.viewasianSite + '/' + moviePath + '/';
        var lo = null, k;
        for (k in links) { if (!lo || links[k].num < lo.num) lo = links[k]; }
        return lo ? cfg.viewasianSite + '/' + lo.path + '/' : '';
      }
      var bestMain = null, bestAlt = null, k2;
      for (k2 in links) {
        var e = links[k2];
        if (e.num !== wantEp) continue;
        if (e.sv === 0) {
          if (!bestMain || e.tailLen < bestMain.tailLen) bestMain = e;
        } else {
          if (!bestAlt || e.sv < bestAlt.sv) bestAlt = e;
        }
      }
      var picked = bestMain || bestAlt;
      return picked ? cfg.viewasianSite + '/' + picked.path + '/' : '';
    }).catch(function () { return ''; });
  }

  function vaExtract(cfg, episodeUrl) {
    if (!episodeUrl) return Promise.resolve(null);
    return sxDoc(cfg, episodeUrl).then(function (html) {
      var m = html.match(/<iframe[^>]*src="(https?:\/\/kisskh\.space\/[a-z0-9-]+\/?)"/i);
      if (!m) m = html.match(/(https?:\/\/kisskh\.space\/[a-z0-9-]+\/?)/i);
      if (!m) return null;
      var playerUrl = m[1].replace(/\\u002F/gi, '/');
      return sxDoc(cfg, playerUrl, 12000, { 'Referer': cfg.viewasianSite + '/' }).then(function (playerHtml) {
        var em = playerHtml.match(/<iframe[^>]*src="(https?:\/\/[^"]*vidmoly[^"]*\/embed-[a-z0-9]+\.html)"/i);
        if (!em) em = playerHtml.match(/(https?:\/\/[a-z0-9.-]*vidmoly[a-z0-9.-]*\/embed-[a-z0-9]+\.html)/i);
        if (!em) return null;
        var embedUrl = em[1].replace(/\\u002F/gi, '/');
        return sxDoc(cfg, embedUrl, 12000, { 'Referer': playerUrl }).then(function (embedHtml) {
          var mm2 = embedHtml.match(/(https?:\/\/[^"'\s\\]+\.m3u8[^"'\s\\]*)/i);
          if (!mm2) return null;
          var m3u8 = mm2[1].replace(/\\u002F/gi, '/').replace(/\\\//g, '/');
          return sxResolveHls(cfg, m3u8, embedUrl, 'ViewAsian').then(function (r) {
            if (!r) return null;
            r.source = 'ViewAsian';
            r.headers = { 'Referer': embedUrl.substring(0, embedUrl.indexOf('/', 8) + 1) || embedUrl };
            return r;
          });
        });
      });
    }).catch(function () { return null; });
  }

  // --- PinoyMoviesHub (Dooplay -> dooplayer v2 -> mixdrop/byse/dood) ---

  var SX_UA = BASE_HEADERS['User-Agent'];

  function phAttr(tag, name) {
    var m = tag.match(new RegExp(name + '=["\']([^"\']*)["\']', 'i'));
    return m ? m[1] : '';
  }

  function phExtractPlayerOptions(html) {
    var options = [];
    var seen = {};
    var m;
    var liRe = /<li[^>]*class=['"][^'"]*dooplay_player_option[^'"]*['"][^>]*>([\s\S]*?)<\/li>/gi;
    while ((m = liRe.exec(html)) !== null) {
      var tag = m[0];
      var post = phAttr(tag, 'data-post') || phAttr(tag, 'data-id');
      if (!post) continue;
      var type = phAttr(tag, 'data-type') || 'movie';
      var nume = phAttr(tag, 'data-nume') || phAttr(tag, 'data-source') || '1';
      var labelMatch = m[1].match(/<span[^>]*class=['"][^'"]*title[^'"]*['"][^>]*>([^<]*)<\//i);
      var label = labelMatch ? stripTags(labelMatch[1]) : '';
      var key = post + '-' + nume;
      if (seen[key]) continue;
      seen[key] = 1;
      options.push({ post: post, type: type, nume: nume, label: label });
    }
    if (!options.length) {
      var tagRe = /<[^>]*data-post=['"](\d+)['"][^>]*>/gi;
      while ((m = tagRe.exec(html)) !== null) {
        var post2 = m[1];
        var type2 = phAttr(m[0], 'data-type') || 'movie';
        var nume2 = phAttr(m[0], 'data-nume') || phAttr(m[0], 'data-source') || '1';
        var key2 = post2 + '-' + nume2;
        if (seen[key2]) continue;
        seen[key2] = 1;
        options.push({ post: post2, type: type2, nume: nume2, label: '' });
      }
    }
    return options;
  }

  function phDooPlayer(cfg, player, pageUrl) {
    var apiUrl = cfg.pinoySite + '/wp-json/dooplayer/v2/' + player.post + '/' + player.type + '/' + player.nume;
    return sxJsonGet(cfg, apiUrl, 12000, {
      'X-Requested-With': 'XMLHttpRequest',
      'Referer': pageUrl || cfg.pinoySite + '/'
    }).then(function (data) {
      if (!data) return '';
      if (Object.prototype.toString.call(data) === '[object Array]') data = data[0];
      if (!data) return '';
      var embedUrl = data.embed_url || data.url || data.source || data.link || data.file || data.src;
      if (!embedUrl && data.data) embedUrl = data.data.embed_url || data.data.url || data.data.source;
      if (!embedUrl && (data.html || data.iframe)) {
        var m = String(data.html || data.iframe).match(/src=['"]([^'"]+)['"]/i);
        if (m) embedUrl = m[1];
      }
      return embedUrl ? String(embedUrl) : '';
    }).catch(function () { return ''; });
  }

  // Dean Edwards packer unpacker (verbatim behaviour from pinoyhub.js).
  function sxJsUnescape(s) {
    return String(s).replace(/\\(u[0-9a-fA-F]{4}|x[0-9a-fA-F]{2}|[0-3][0-7]{0,2}|[\\nrtbfv'"0])/g, function (all, esc) {
      if (esc.charAt(0) === 'u' || esc.charAt(0) === 'x') {
        return String.fromCharCode(parseInt(esc.slice(1), 16));
      }
      switch (esc) {
        case 'n': return '\n'; case 'r': return '\r'; case 't': return '\t';
        case 'b': return '\b'; case 'f': return '\f'; case 'v': return '\v';
        case '0': return '\0'; case '\\': return '\\';
        case "'": return "'"; case '"': return '"';
        default: return esc;
      }
    });
  }

  function sxUnpackPacker(packed) {
    var m = String(packed).match(/\}\s*\(\s*'((?:\\.|[^'\\])*)'\s*,\s*\d+\s*,\s*(\d+)\s*,\s*'([^']*)'\.split\('\|'\)/);
    if (!m) return '';
    var payload = sxJsUnescape(m[1]);
    var keys = sxJsUnescape(m[3]).split('|');
    var dict = {};
    var i;
    for (i = 0; i < keys.length; i++) dict[String(i)] = keys[i];
    return payload.replace(/\b\w+\b/g, function (w) {
      return (dict[w] !== undefined && dict[w] !== '') ? dict[w] : w;
    });
  }

  function isMixdropHost(h) { return /mixdrop|mixdrp|mxdrop|miixdrop|mixdroop/.test(String(h || '').toLowerCase()); }
  function isDoodHost(h) {
    var s = String(h || '').toLowerCase();
    if (/dood|dsvplay|dooo|d000d|ds2play/.test(s)) return true;
    var known = ['playmogo.com', 'myvidplay.com', 'dsvplay.com', 'd000d.com', 'dooood.com', 'ds2play.com', 'ds2play2.com', 'doodcdn.io'];
    for (var i = 0; i < known.length; i++) { if (s.indexOf(known[i]) !== -1) return true; }
    return false;
  }
  function isByseHost(h) { return /byse/.test(String(h || '').toLowerCase()); }

  function phMixdropDirect(cfg, embedUrl) {
    return sxDoc(cfg, embedUrl, 12000, {
      'Referer': cfg.pinoySite + '/',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
    }).then(function (html) {
      var packedMatch = html.match(/eval\(function\(p,a,c,k,e,d\)[\s\S]{0,3000}?\}\)\)/);
      var unpacked = packedMatch ? sxUnpackPacker(packedMatch[0]) : '';
      var wurl = '';
      var m = unpacked.match(/MDCore\.wurl\s*=\s*["']([^"']*)["']/);
      if (m) wurl = m[1];
      if (!wurl) {
        m = html.match(/MDCore\.wurl\s*=\s*["']([^"']*)["']/);
        if (m) wurl = m[1];
      }
      if (!wurl || wurl === ' ' || wurl.length < 6) return null;
      if (wurl.indexOf('//') === 0) wurl = 'https:' + wurl;
      else if (wurl.indexOf('http') !== 0) wurl = 'https://' + wurl.replace(/^\/+/, '');
      var host = sxHostOf(embedUrl);
      return {
        url: wurl,
        quality: '',
        headers: { 'Referer': 'https://' + host + '/', 'User-Agent': SX_UA },
        source: 'Mixdrop'
      };
    }).catch(function () { return null; });
  }

  function phDoodDirect(cfg, embedUrl) {
    var embedIdMatch = embedUrl.match(/\/e\/([a-z0-9]+)/i) || embedUrl.match(/\/d\/([a-z0-9]+)/i);
    if (!embedIdMatch) return Promise.resolve(null);
    var embedId = embedIdMatch[1];
    var qualityHint = '';
    var rnd = '';
    for (var i = 0; i < 10; i++) rnd += 'abcdefghijklmnopqrstuvwxyz0123456789'.charAt(Math.floor(Math.random() * 36));
    return sxDoc(cfg, embedUrl, 12000, { 'Referer': cfg.pinoySite + '/' }).then(function (html) {
      var host = sxHostOf(embedUrl);
      var embedFinalUrl = 'https://' + host + '/e/' + embedId;
      var titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
      if (titleMatch) qualityHint = titleMatch[1];
      if (/op=validate|turnstile\.render|challenges\.cloudflare\.com\/turnstile/i.test(html)) return null;
      if (/video you are looking for is not found|class="not_found"/i.test(html)) return null;
      var md5 = null;
      var pm = html.match(/['"]\/(pass_md5\/[a-z0-9]+(?:\/[a-z0-9]+)?)['"]/i);
      if (!pm) {
        var unpacked = sxUnpackPacker(html);
        if (unpacked) pm = unpacked.match(/['"]\/(pass_md5\/[a-z0-9]+(?:\/[a-z0-9]+)?)['"]/i);
      }
      if (!pm) {
        pm = html.match(/\/pass_md5\/([a-z0-9]+)/i);
        if (pm) pm = ['x', 'pass_md5/' + pm[1]];
      }
      if (pm) md5 = pm[1];
      if (!md5) return null;
      var passUrl = 'https://' + host + '/' + md5;
      return fetchText(cfg, passUrl, 10000, {
        'Referer': embedFinalUrl,
        'X-Requested-With': 'XMLHttpRequest'
      }).then(function (body) {
        var base = String(body).trim();
        if (base.indexOf('http') !== 0) return null;
        var token = md5.split('/')[1] || '';
        var expiry = Date.now() + 2 * 60 * 60 * 1000;
        return {
          url: base + rnd + '?token=' + token + '&expiry=' + expiry,
          quality: sxParseQuality(qualityHint),
          headers: { 'Referer': 'https://' + host + '/', 'User-Agent': SX_UA },
          source: 'Dood'
        };
      });
    }).catch(function () { return null; });
  }

  function phExtractEmbed(cfg, label, embedUrl, pageUrl) {
    if (!embedUrl) return Promise.resolve(null);
    var host = sxHostOf(embedUrl);
    var job = null;
    if (isByseHost(host)) {
      job = sxByseDirectResolve(cfg, embedUrl).then(function (r) {
        return r ? merge2(r, { source: 'Byse' }) : null;
      });
    } else if (isMixdropHost(host)) {
      job = phMixdropDirect(cfg, embedUrl);
    } else if (isDoodHost(host)) {
      job = phDoodDirect(cfg, embedUrl);
    }
    if (!job) return Promise.resolve(null);
    return job.then(function (r) {
      if (!r) return null;
      if (label && !r.source) r.source = label;
      if (r.source === 'Byse') delete r.headers; // signed, self-authorizing
      return r;
    });
  }

  function merge2(a, b) {
    var out = {}, k;
    for (k in (a || {})) out[k] = a[k];
    for (k in (b || {})) out[k] = b[k];
    return out;
  }

  // Page (movie or episode) -> player options -> extracted results.
  function phExtractPage(cfg, pageUrl) {
    return sxDoc(cfg, pageUrl).then(function (html) {
      var options = phExtractPlayerOptions(html);
      if (!options.length) return [];
      return Promise.all(options.map(function (p) {
        return phDooPlayer(cfg, p, pageUrl).then(function (embedUrl) {
          return phExtractEmbed(cfg, p.label, embedUrl, pageUrl);
        });
      })).then(function (results) {
        var out = [];
        for (var i = 0; i < results.length; i++) {
          if (results[i] && results[i].url) out.push(results[i]);
        }
        return out;
      });
    }).catch(function () { return []; });
  }

  function phMoviePageUrl(cfg, slug) { return cfg.pinoySite + '/movies/' + slug; }
  function phSeriesPageUrl(cfg, slug) { return cfg.pinoySite + '/series/' + slug; }
  function phEpisodePageUrl(cfg, slug, s, e) {
    return cfg.pinoySite + '/episodes/' + slug + '-' + s + 'x' + e;
  }

  // ===== id parsing =====

  // "asian:ks-foo:1:5" / "asian:foo" (legacy) / "tmdb:123:1:5"
  function sxParseId(rawId) {
    var id = String(rawId || '').trim();
    var out = { kind: 'unknown', site: '', slug: '', tmdbId: '', season: 0, episode: 0 };
    if (!id) return out;
    // Nuvio episode ids append ":<season>:<episode>" to the meta id. Only
    // strip when the head still starts with a known prefix and keeps content
    // (greedy match keeps "tmdb:872334" intact inside "tmdb:872334:1:5";
    // single-digit tmdb ids like "tmdb:1:5" fall through un-stripped and
    // resolve with the default episode — a harmless corner).
    var m = id.match(/^((?:tmdb|asian):.+):(\d+):(\d+)$/i);
    if (m) {
      out.season = parseInt(m[2], 10) || 0;
      out.episode = parseInt(m[3], 10) || 0;
      id = m[1];
    }
    if (id.indexOf('tmdb:') === 0) {
      out.kind = 'tmdb';
      out.tmdbId = id.substring(5).split(':')[0].split('/')[0];
      return out;
    }
    if (id.indexOf('asian:') === 0) {
      var tail = id.substring(6);
      var sm = tail.match(/^(ph|ks|va)-([a-z0-9-]+)$/i);
      if (sm) {
        out.kind = 'asian';
        out.site = sm[1].toLowerCase();
        out.slug = sm[2];
      } else {
        out.kind = 'asian';
        out.site = '';
        out.slug = tail; // legacy bare slug
      }
      return out;
    }
    return out;
  }

  // ===== stream resolution =====

  function resolveAsiansite(cfg, site, slug, type, season, episode) {
    var isSeries = type !== 'movie';
    var wantEp = episode || 1;
    if (site === 'ks') {
      return ksFindEpisodeUrl(cfg, slug, wantEp).then(function (epUrl) {
        return ksExtract(cfg, epUrl);
      });
    }
    if (site === 'va') {
      return vaFindEpisodeUrl(cfg, slug, wantEp, isSeries).then(function (epUrl) {
        return vaExtract(cfg, epUrl);
      });
    }
    if (site === 'ph') {
      var pageUrl = isSeries
        ? phEpisodePageUrl(cfg, slug, season || 1, wantEp)
        : phMoviePageUrl(cfg, slug);
      return phExtractPage(cfg, pageUrl).then(function (results) {
        if (results.length || !isSeries) return results;
        // episode-page slug guesses fail on renamed shows — probe series page
        return phExtractPage(cfg, phSeriesPageUrl(cfg, slug)).catch(function () { return []; });
      });
    }
    return Promise.resolve(null);
  }

  // Legacy bare slugs / TMDB rows: title search across KS + VA, PH slug probe.
  function resolveByTitle(cfg, title, year, type, season, episode, langCode) {
    var isSeries = type !== 'movie';
    var wantEp = episode || 1;
    var attempts = [];

    attempts.push(ksSearchSeriesUrl(cfg, title).then(function (hit) {
      if (!hit) return null;
      return ksFindEpisodeUrl(cfg, hit.slug, wantEp).then(function (epUrl) {
        return ksExtract(cfg, epUrl);
      });
    }).catch(function () { return null; }));

    attempts.push(vaSearchDramaUrl(cfg, title).then(function (hit) {
      if (!hit) return null;
      return vaFindEpisodeUrl(cfg, hit.slug, wantEp, isSeries).then(function (epUrl) {
        return vaExtract(cfg, epUrl);
      });
    }).catch(function () { return null; }));

    // PH slug probes: sites slugify plain titles (sometimes with the year).
    var phSlugs = [sxSlugTitle(title)];
    var ySlug = sxSlugTitle(title + ' ' + (year || ''));
    if (year && ySlug !== phSlugs[0]) phSlugs.push(ySlug);
    attempts.push(Promise.all(phSlugs.map(function (ps) {
      var pageUrl = isSeries
        ? phEpisodePageUrl(cfg, ps, season || 1, wantEp)
        : phMoviePageUrl(cfg, ps);
      return phExtractPage(cfg, pageUrl).catch(function () { return []; });
    })).then(function (batches) {
      var out = [];
      for (var i = 0; i < batches.length; i++) out = out.concat(batches[i] || []);
      return out.length ? out : null;
    }).catch(function () { return null; }));

    return Promise.all(attempts).then(function (results) {
      var out = [];
      for (var i = 0; i < results.length; i++) {
        var r = results[i];
        if (!r) continue;
        if (Object.prototype.toString.call(r) === '[object Array]') out = out.concat(r);
        else out.push(r);
      }
      return out.length ? out : null;
    });
  }

  function toStremioStreams(results, displayTitle) {
    var streams = [];
    var seen = {};
    var i, r;
    for (i = 0; i < results.length; i++) {
      r = results[i];
      if (!r || !r.url || seen[r.url]) continue;
      seen[r.url] = true;
      var label = r.source || 'Asian Catalog';
      var q = r.quality || '';
      var s = {
        name: 'Asian Catalog',
        title: label + (q ? ' • ' + q : ''),
        description: displayTitle ? label + (q ? ' • ' + q : '') + '\n' + displayTitle : label + (q ? ' • ' + q : ''),
        url: r.url,
        quality: q || null
      };
      if (r.headers && Object.keys(r.headers).length) {
        s.behaviorHints = { notWebReady: true, proxyHeaders: { request: r.headers } };
      }
      streams.push(s);
    }
    return streams;
  }

  function tmdbInfoForStream(cfg, type, tmdbId) {
    var kind = type === 'movie' ? 'movie' : 'tv';
    var url = 'https://api.themoviedb.org/3/' + kind + '/' + encodeURIComponent(tmdbId) +
      '?api_key=' + encodeURIComponent(cfg.tmdbKey);
    return sxJsonGet(cfg, url, 10000).then(function (r) {
      if (!r || r.success === false) return null;
      return {
        title: r.title || r.name || '',
        original: r.original_title || r.original_name || '',
        year: String(r.release_date || r.first_air_date || '').split('-')[0] || '',
        lang: r.original_language || ''
      };
    }).catch(function () { return null; });
  }

  // ===== /stream/{type}/{id}.json =====

  function streamHandler(cfg, type, rawId) {
    var parsed = sxParseId(rawId);
    var isMovie = type === 'movie';
    var wantEp = isMovie ? 0 : (parsed.episode || 1);
    var wantSeason = parsed.season || 1;
    var displayTitle = '';
    var cacheKey = type + '|' + rawId;

    var hit = cacheGetFresh(streamCache, cacheKey, STREAM_CACHE_TTL, cfg.nowFn);
    if (hit) return Promise.resolve(json({ streams: hit.value.streams }, 200, 60));

    var resolvePromise;
    if (parsed.kind === 'asian' && parsed.site) {
      resolvePromise = resolveAsiansite(cfg, parsed.site, parsed.slug, type, wantSeason, wantEp)
        .then(function (results) {
          // ks/va lanes resolve a single result object; ph resolves an array.
          var arr = results == null ? null
            : (Object.prototype.toString.call(results) === '[object Array]' ? results : [results]);
          if (arr && arr.length) return arr;
          // coded-id miss (renamed page, stale catalog row) -> title fallback
          var title = parsed.slug.replace(/-/g, ' ');
          return resolveByTitle(cfg, title, '', type, wantSeason, wantEp);
        });
    } else if (parsed.kind === 'asian') {
      // legacy bare slug: try it as a page slug first, then as a title
      resolvePromise = Promise.all([
        resolveAsiansite(cfg, 'ks', parsed.slug, type, wantSeason, wantEp).catch(function () { return null; }),
        resolveAsiansite(cfg, 'va', parsed.slug, type, wantSeason, wantEp).catch(function () { return null; }),
        resolveAsiansite(cfg, 'ph', parsed.slug, type, wantSeason, wantEp).catch(function () { return null; })
      ]).then(function (batches) {
        var out = [];
        for (var i = 0; i < batches.length; i++) {
          var b = batches[i];
          if (!b) continue;
          if (Object.prototype.toString.call(b) === '[object Array]') out = out.concat(b);
          else if (b.url) out.push(b);
        }
        if (out.length) return out;
        return resolveByTitle(cfg, parsed.slug.replace(/-/g, ' '), '', type, wantSeason, wantEp);
      });
    } else if (parsed.kind === 'tmdb' && parsed.tmdbId) {
      resolvePromise = tmdbInfoForStream(cfg, type, parsed.tmdbId).then(function (info) {
        if (!info || !info.title) return null;
        displayTitle = info.title;
        return resolveByTitle(cfg, info.title, info.year, type, wantSeason, wantEp, info.lang)
          .then(function (results) {
            if (results && results.length) return results;
            if (info.original && info.original !== info.title) {
              return resolveByTitle(cfg, info.original, info.year, type, wantSeason, wantEp, info.lang);
            }
            return null;
          });
      });
    } else {
      resolvePromise = Promise.resolve(null);
    }

    return resolvePromise.then(function (results) {
      var streams = toStremioStreams(results || [], displayTitle);
      cachePut(streamCache, cacheKey, { streams: streams }, 600);
      return json({ streams: streams }, 200, 60);
    }).catch(function (err) {
      return json({ streams: [], error: String((err && err.message) || err) }, 200, 30);
    });
  }

  // ===== /meta/{type}/{id}.json (asian: ids only; tmdb: is native) =====

  function sxScrapeMetaPage(cfg, site, slug, type) {
    // Returns { name, poster, description, year, episodes: [{path, s, e}] }
    if (site === 'ks') {
      var ksh = String(cfg.kissasianSite).replace(/^https?:\/\//, '');
      return sxDoc(cfg, ksSeriesUrl(cfg, slug)).then(function (html) {
        var name = '';
        var tm = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i) || html.match(/<title[^>]*>([^<]*)<\/title>/i);
        if (tm) name = stripTags(tm[1]).replace(/\s*[-\u2013\u2014|].*$/, '');
        var img = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i) ||
          html.match(/content=["']([^"']+)["'][^>]*property=["']og:image["']/i);
        var desc = '';
        var dm = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i) ||
          html.match(/content=["']([^"']+)["'][^>]*property=["']og:description["']/i);
        if (dm) desc = stripTags(decodeEntities(dm[1]));
        var eps = [];
        var re = new RegExp('href="https?://' + ksh + '/([a-z0-9-]+-episode-(\\d+))/"', 'gi');
        var m;
        while ((m = re.exec(html)) !== null) {
          if (slug && m[1].indexOf(slug + '-episode-') !== 0) continue;
          eps.push({ n: parseInt(m[2], 10), s: 1 });
        }
        return { name: name, poster: img ? img[1] : '', description: desc, year: '', episodes: eps };
      });
    }
    if (site === 'va') {
      var vah = String(cfg.viewasianSite).replace(/^https?:\/\//, '');
      return sxDoc(cfg, vaDramaUrl(cfg, slug)).then(function (html) {
        var name = '';
        var tm = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i) || html.match(/<title[^>]*>([^<]*)<\/title>/i);
        if (tm) name = stripTags(tm[1]).replace(/\s*[-\u2013\u2014|].*$/, '');
        var img = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i) ||
          html.match(/content=["']([^"']+)["'][^>]*property=["']og:image["']/i);
        var desc = '';
        var dm = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i) ||
          html.match(/content=["']([^"']+)["'][^>]*property=["']og:description["']/i);
        if (dm) desc = stripTags(decodeEntities(dm[1]));
        var year = '';
        var ym = name.match(/\((19|20)\d{2}\)/);
        if (ym) year = ym[0].slice(1, -1);
        var eps = [];
        var re = new RegExp('href="https?://' + vah + '/([a-z0-9-]+-(?:ep|episode)-(\\d+)(-[a-z0-9-]+)?)/"', 'gi');
        var m;
        while ((m = re.exec(html)) !== null) {
          var base = m[1].substring(0, m[1].indexOf('-episode-') !== -1 ? m[1].indexOf('-episode-') : m[1].indexOf('-ep-'));
          if (base !== slug) continue;
          eps.push({ n: parseInt(m[2], 10), s: 1 });
        }
        return { name: name, poster: img ? img[1] : '', description: desc, year: year, episodes: eps };
      });
    }
    if (site === 'ph') {
      if (type === 'movie') {
        return sxDoc(cfg, phMoviePageUrl(cfg, slug)).then(function (html) {
          var name = '';
          var tm = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i) || html.match(/<title[^>]*>([^<]*)<\/title>/i);
          if (tm) name = stripTags(tm[1]);
          var img = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i);
          var desc = '';
          var dm = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i);
          if (dm) desc = stripTags(decodeEntities(dm[1]));
          return { name: name, poster: img ? img[1] : '', description: desc, year: '', episodes: [] };
        });
      }
      return sxDoc(cfg, phSeriesPageUrl(cfg, slug)).then(function (html) {
        var name = '';
        var tm = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i) || html.match(/<title[^>]*>([^<]*)<\/title>/i);
        if (tm) name = stripTags(tm[1]);
        var img = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i);
        var desc = '';
        var dm = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i);
        if (dm) desc = stripTags(decodeEntities(dm[1]));
        var eps = [];
        var re = new RegExp('href="https?://[a-z0-9.-]*' + String(cfg.pinoySite).replace(/^https?:\/\//, '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\/episodes\/([a-z0-9-]+)-(\\d+)x(\\d+)', 'gi');
        var m;
        while ((m = re.exec(html)) !== null) {
          if (m[1].indexOf(slug) !== 0) continue;
          eps.push({ n: parseInt(m[3], 10), s: parseInt(m[2], 10) });
        }
        return { name: name, poster: img ? img[1] : '', description: desc, year: '', episodes: eps };
      });
    }
    return Promise.resolve(null);
  }

  function metaHandler(cfg, type, rawId) {
    var parsed = sxParseId(rawId);
    if (parsed.kind !== 'asian') {
      return Promise.resolve(json({ meta: {} }, 404, 30));
    }
    var site = parsed.site;
    var slug = parsed.slug;
    // legacy bare ids: search for the site+slug first
    var sitePromise = site
      ? Promise.resolve({ site: site, slug: slug })
      : Promise.all([
          ksSearchSeriesUrl(cfg, slug.replace(/-/g, ' ')),
          vaSearchDramaUrl(cfg, slug.replace(/-/g, ' '))
        ]).then(function (hits) {
          for (var i = 0; i < hits.length; i++) { if (hits[i]) return hits[i]; }
          return null;
        });
    return sitePromise.then(function (resolved) {
      if (!resolved) return json({ meta: {} }, 404, 30);
      return sxScrapeMetaPage(cfg, resolved.site, resolved.slug, type).then(function (page) {
        if (!page) return json({ meta: {} }, 404, 30);
        var metaId = 'asian:' + resolved.site + '-' + resolved.slug;
        var meta = {
          id: metaId,
          type: type,
          name: cleanDisplayName(page.name) || slug.replace(/-/g, ' '),
          posterShape: 'poster'
        };
        if (page.poster) meta.poster = page.poster;
        if (page.description) meta.description = page.description;
        if (page.year) meta.releaseInfo = String(page.year);
        if (type !== 'movie' && page.episodes && page.episodes.length) {
          var seen = {};
          var videos = [];
          for (var i = 0; i < page.episodes.length; i++) {
            var ep = page.episodes[i];
            var vid = metaId + ':' + (ep.s || 1) + ':' + ep.n;
            if (seen[vid]) continue;
            seen[vid] = 1;
            videos.push({
              id: vid,
              season: ep.s || 1,
              episode: ep.n,
              title: 'Episode ' + ep.n,
              name: 'Episode ' + ep.n
            });
          }
          videos.sort(function (a, b) {
            return (a.season - b.season) || (a.episode - b.episode);
          });
          meta.videos = videos;
        }
        return json({ meta: meta }, 200, 300);
      });
    }).catch(function () {
      return json({ meta: {} }, 404, 30);
    });
  }

  // ===== /relay — text-safe binary relay for device runtimes =====
  // Nuvio's fetch bridges stringify request bodies and expose text()/json()
  // only, so providers cannot POST binary (cinejoy's octet-stream /g exchange)
  // or read binary replies on-device. Workers CAN. The provider base64s the
  // payload into JSON, this handler performs the binary fetch server-side and
  // returns the reply base64-wrapped. Host-allowlisted so the deployment can
  // never serve as an open proxy.
  var RELAY_ALLOWED_HOSTS = {
    'api.shegu.st': true,          // cinejoy binary /g exchange
    'animotvslash.ru': true,       // animotvslash multi-server stream API
    'animotvslash.p2pplay.pro': true, // animotvslash legacy self-hosted player
    'cinemacity.cc': true          // cinemacity DLE pages (CF-challenged clients)
  };
  var RELAY_BODY_LIMIT = 2 * 1024 * 1024; // 2MB reply cap (cinejoy replies ~100B)

  function relayB64ToUint8(b64) {
    try {
      var norm = String(b64 || '').replace(/-/g, '+').replace(/_/g, '/').replace(/[^A-Za-z0-9+/=]/g, '');
      while (norm.length % 4) norm += '=';
      var bin = atob(norm);
      var u8 = new Uint8Array(bin.length);
      for (var i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i) & 255;
      return u8;
    } catch (e) { return null; }
  }

  function relayUint8ToB64(u8) {
    var s = '';
    for (var i = 0; i < u8.length; i += 0x8000) {
      s += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000));
    }
    return btoa(s);
  }

  function relayHandler(request, env) {
    var cfg = makeConfig(env || {});
    if (!request || request.method !== 'POST') {
      return Promise.resolve(json({ error: 'POST required' }, 405, 0));
    }
    return request.text().then(function (raw) {
      var req;
      try { req = JSON.parse(raw); } catch (e) {
        return json({ error: 'invalid json body' }, 400, 0);
      }
      var target = String((req && req.url) || '');
      var u = null;
      try { u = new URL(target); } catch (e) {}
      if (!u || (u.protocol !== 'https:' && u.protocol !== 'http:')) {
        return json({ error: 'bad url' }, 400, 0);
      }
      if (!RELAY_ALLOWED_HOSTS[u.hostname]) {
        return json({ error: 'host not allowed', host: u.hostname }, 403, 0);
      }
      var method = String((req && req.method) || 'GET').toUpperCase();
      if (['GET', 'HEAD', 'POST'].indexOf(method) === -1) {
        return json({ error: 'method not allowed', method: method }, 400, 0);
      }
      var headers = {};
      var hdrs = (req && req.headers) || {};
      Object.keys(hdrs).forEach(function (k) {
        if (!/^[a-z0-9-]+$/i.test(k)) return;
        var lk = k.toLowerCase();
        if (lk === 'host' || lk === 'cookie' || lk === 'content-length') return;
        var v = String(hdrs[k]).slice(0, 500);
        if (v) headers[k] = v;
      });
      var body = null;
      if (method === 'POST' && req.bodyB64) {
        body = relayB64ToUint8(req.bodyB64);
        if (!body) return json({ error: 'bad bodyB64' }, 400, 0);
      }
      if (!cfg.fetchFn) return json({ error: 'no fetch available' }, 500, 0);
      var ac = null;
      try {
        ac = new AbortController();
        setTimeout(function () { try { ac.abort(); } catch (e) {} }, 20000);
      } catch (e) { ac = null; }
      return cfg.fetchFn(target, {
        method: method,
        headers: headers,
        body: body || undefined,
        signal: ac ? ac.signal : undefined
      }).then(function (res) {
        return res.arrayBuffer().then(function (ab) {
          var u8 = new Uint8Array(ab);
          if (u8.length > RELAY_BODY_LIMIT) {
            return json({ error: 'reply too large', bytes: u8.length }, 502, 0);
          }
          return json({ ok: true, status: res.status, bodyB64: relayUint8ToB64(u8) }, 200, 0);
        });
      }).catch(function (err) {
        return json({ error: 'relay fetch failed: ' + String((err && err.message) || err) }, 502, 0);
      });
    });
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
        return ksPageRaw(cfg, cfg.kissasianSite + '/page/2/').then(function (items) {
          return { ok: items.length > 0, items: items.length, error: items.length ? undefined : 'parsed 0 series rows (site markup changed?)' };
        });
      })],
      ['viewasian', timeProbe(function () {
        return vaPageRaw(cfg, cfg.viewasianSite + '/page/2/').then(function (items) {
          return { ok: items.length > 0, items: items.length, error: items.length ? undefined : 'parsed 0 series rows (site markup changed?)' };
        });
      })],
      ['tmdb', timeProbe(function () {
        var def = { type: 'movie', id: 'asian-movies', mode: 'archive' };
        return tmdbPageMetas(cfg, def, 1, {}).then(function (metas) {
          return { ok: metas.length > 0, items: metas.length, error: metas.length ? undefined : 'discover returned 0 rows (check TMDB_API_KEY)' };
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
        if (!sources.pinoymovieshub.ok) hints.push('pinoymovieshub unreachable from this runtime (site down or IP blocked). Pinoy catalogs may be empty; set PINOY_SITE to an alternate mirror if the site moved.');
        if (!sources.kissasian.ok) hints.push('kissasian.cam unreachable from this runtime (site down or IP blocked). KissAsian series catalogs may be empty; set KISSASIAN_SITE to an alternate mirror.');
        if (!sources.viewasian.ok) hints.push('viewasian.lol unreachable from this runtime (site down or IP blocked). ViewAsian series catalogs may be empty; set VIEWASIAN_SITE to an alternate mirror.');
        if (!sources.tmdb.ok) hints.push('TMDB discover failed — check TMDB_API_KEY and outbound access; Asian Movies / Trending catalogs may be empty.');
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
    return function (page) { return tmdbPageMetas(cfg, def, page, extras); };
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
    var rows = defs.map(function (c) {
      return '<tr><td>' + c.name + '</td><td><code>' + c.type + '</code></td><td>' +
        (c.source === 'pinoy' ? 'pinoymovieshub.win' : c.source === 'kissasian' ? 'kissasian.cam' : c.source === 'viewasian' ? 'viewasian.lol' : 'TMDB') +
        '</td><td><code>/catalog/' + c.type + '/' + c.id + '.json</code></td></tr>';
    }).join('');
    return '<!DOCTYPE html><html><head><meta charset="utf-8"><title>' + ADDON_NAME + '</title>' +
      '<meta name="viewport" content="width=device-width,initial-scale=1">' +
      '<style>body{font-family:system-ui,sans-serif;max-width:900px;margin:40px auto;padding:0 16px;color:#eee;background:#14141b}a{color:#7ab8ff}table{border-collapse:collapse;width:100%}td,th{border:1px solid #333;padding:8px;text-align:left;font-size:14px}code{color:#9ef}h2{margin-top:28px}</style></head><body>' +
      '<h1>' + ADDON_NAME + ' <small>v' + VERSION + '</small></h1>' +
      '<p>Stremio-protocol catalog addon for Nuvio — organized directory:</p>' +
      '<ul>' +
      '<li><b>Pinoy Movies Hub</b> — <a href="' + cfg.pinoySite + '">' + cfg.pinoySite.replace(/^https:\/\//, '') + '</a> (movies, series, genres, search)</li>' +
      '<li><b>KissAsian</b> — <a href="' + cfg.kissasianSite + '">' + cfg.kissasianSite.replace(/^https:\/\//, '') + '</a> (Asian dramas: latest, genres, search)</li>' +
      '<li><b>ViewAsian</b> — <a href="' + cfg.viewasianSite + '">' + cfg.viewasianSite.replace(/^https:\/\//, '') + '</a> (Asian dramas: latest, genres, countries, search)</li>' +
      '<li><b>TMDB directory</b> — Asian movies/series: popular, trending, genre, <b>by language</b> (Korean/Japanese/Chinese/Thai/Filipino) and <b>on-the-air</b> rows</li>' +
      '</ul>' +
      '<p>Add this manifest URL in Nuvio (Settings &rarr; Addons): <b>' + (cfg.__selfUrl || 'https://your-deployment') + '/manifest.json</b></p>' +
      '<p>Personalize it (optional): <code>/manifest.json?sources=pinoy,kissasian,viewasian,tmdb</code> &middot; <code>?langs=ko,ja,th</code></p>' +
      '<p>Health probe: <a href="/health"><code>/health</code></a> (per-source status, latency, hints)</p>' +
      '<h2>Catalogs</h2><table><tr><th>Name</th><th>Type</th><th>Source</th><th>Endpoint</th></tr>' + rows + '</table>' +
      '<h2>Search examples</h2>' +
      '<p><code>/catalog/movie/pinoy-movies/search=hello love again.json</code><br>' +
      '<code>/catalog/series/asian-series/search=queen of tears.json</code><br>' +
      '<code>/catalog/series/asian-series-viewasian/search=crash landing on you.json</code><br>' +
      '<code>/catalog/movie/asian-movies/search=parasite.json</code> (TMDB, asian-language results only)</p>' +
      '<h2>Genre / country chips</h2>' +
      '<p><code>/catalog/series/asian-series-genre/genre=Romance.json</code><br>' +
      '<code>/catalog/series/asian-series-viewasian-genre/genre=Korean.json</code><br>' +
      '<code>/catalog/movie/asian-movies-genre/genre=Action&amp;skip=20.json</code><br>' +
      '<code>/catalog/series/pinoy-series-genre/genre=Tagalog Dubbed.json</code></p>' +
      '<p>Pair with the <b>PinoyMoviesHub</b> and <b>AsianHub</b> Nuvio plugins (xrexzerox/nv-plugins) for playable streams.</p>' +
      '</body></html>';
  }

  function handle(urlString, env) {
    var cfg = makeConfig(env || {});
    cfg.__selfUrl = (env && env.__selfUrl) || '';
    var raw = String(urlString || '/');
    if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(raw)) raw = 'https://asian-catalog.local' + (raw.charAt(0) === '/' ? raw : '/' + raw);

    var u;
    try { u = new URL(raw); } catch (e) { return Promise.resolve(json({ error: 'invalid url' }, 400, 0)); }

    // v3.1.0 manifest personalization (Streaming-Catalogs-Plus pattern):
    //   ?sources=pinoy,kissasian,viewasian,tmdb   ?langs=ko,ja,th
    function csvParam(name) {
      var v = String((u.searchParams && u.searchParams.get(name)) || '').trim();
      if (!v) return null;
      var arr = v.split(',').map(function (s) { return s.trim().toLowerCase(); }).filter(Boolean);
      return arr.length ? arr : null;
    }
    cfg.__manifestSources = csvParam('sources');
    cfg.__manifestLangs = csvParam('langs');

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
      // v3.2.0: /stream + /meta — make every catalog row playable. Ids arrive
      // URL-encoded from the apps (e.g. asian%3Aks-foo%3A1%3A5).
      var mStream = path.match(/^\/stream\/(movie|series|tv)\/([^/]+)\.json$/i);
      if (mStream) {
        var sType = mStream[1].toLowerCase() === 'tv' ? 'series' : mStream[1].toLowerCase();
        var sId;
        try { sId = decodeURIComponent(mStream[2]); } catch (e2) { sId = mStream[2]; }
        return streamHandler(cfg, sType, sId);
      }
      var mMeta = path.match(/^\/meta\/(movie|series|tv)\/([^/]+)\.json$/i);
      if (mMeta) {
        var mmType = mMeta[1].toLowerCase() === 'tv' ? 'series' : mMeta[1].toLowerCase();
        var mmId;
        try { mmId = decodeURIComponent(mMeta[2]); } catch (e3) { mmId = mMeta[2]; }
        return metaHandler(cfg, mmType, mmId);
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
    relayHandler: relayHandler,
    resetCaches: resetCaches,
    catalogDefinitions: catalogDefinitions,
    // test hooks
    parseListPage: parseListPage,
    ksParseListPage: ksParseListPage,
    vaParseListPage: vaParseListPage,
    cleanTitleForSearch: cleanTitleForSearch,
    cleanDisplayName: cleanDisplayName,
    normalizeForCompare: normalizeForCompare,
    titleScore: titleScore,
    yearScore: yearScore,
    pickBestTmdb: pickBestTmdb,
    toMeta: toMeta,
    slugifyGenre: slugifyGenre,
    tmdbResultToMeta: tmdbResultToMeta,
    pinoyPageMetas: pinoyPageMetas,
    ksPageMetas: ksPageMetas,
    vaPageMetas: vaPageMetas,
    tmdbPageMetas: tmdbPageMetas,
    getCatalogMetas: getCatalogMetas,
    healthReport: healthReport,
    streamHandler: streamHandler,
    metaHandler: metaHandler,
    sxParseId: sxParseId,
    resolveByTitle: resolveByTitle,
    resolveAsiansite: resolveAsiansite,
    byseHashDigest: byseHashDigest,
    byseLeadingZeroBits: byseLeadingZeroBits
  };

})(typeof globalThis !== 'undefined' ? globalThis : (typeof window !== 'undefined' ? window : this));
