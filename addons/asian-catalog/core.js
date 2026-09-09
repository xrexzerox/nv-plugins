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

  var VERSION = '3.0.0';
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

  function fallbackMeta(cfg, prefix, item) {
    var meta = {
      id: prefix + ':' + (item.slug || item.url || cleanDisplayName(item.title) || 'untitled'),
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

    url = base + 'discover/' + kind + '?api_key=' + encodeURIComponent(cfg.tmdbKey) +
      '&' + langFilter + '&include_adult=false&page=' + page;
    if (def.mode === 'genre' && genreSlug) {
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
      }
    ];
  }

  function manifest(cfg) {
    return {
      id: ADDON_ID,
      version: VERSION,
      name: ADDON_NAME,
      description: 'Organized Asian catalogs: Pinoy movies & series (pinoymovieshub), Asian dramas (kissasian.cam + viewasian.lol) and Asian movies/series directories by language (TMDB). Titles resolve to TMDB ids for playback.',
      logo: cfg.pinoySite + PINOY_ICON,
      resources: ['catalog'],
      types: ['movie', 'series'],
      idPrefixes: ['tmdb:', 'asian:'],
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
      '<li><b>TMDB</b> — official Asian-language movie &amp; series directories (Korean, Chinese, Japanese, Thai, Filipino)</li>' +
      '</ul>' +
      '<p>Add this manifest URL in Nuvio (Settings &rarr; Addons): <b>' + (cfg.__selfUrl || 'https://your-deployment') + '/manifest.json</b></p>' +
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
    healthReport: healthReport
  };

})(typeof globalThis !== 'undefined' ? globalThis : (typeof window !== 'undefined' ? window : this));
