/* PinoyHub Catalog worker bundle v1.0.0 — paste this whole file into a Cloudflare Worker (Edit code -> Deploy). Source: addons/pinoyhub-catalog/ */
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// addons/pinoyhub-catalog/core.js
var require_core = __commonJS({
  "addons/pinoyhub-catalog/core.js"(exports) {
    (function(global) {
      "use strict";
      var VERSION = "1.0.0";
      var ADDON_ID = "community.pinoyhub.catalog";
      var DEFAULT_SITE = "https://pinoymovieshub.win";
      var DEFAULT_TMDB_KEY = "439c478a771f35c05022f9feabcca01c";
      var SITE_ICON = "/wp-content/uploads/2025/04/cropped-favicon-11-192x192.png";
      var UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36";
      var BASE_HEADERS = {
        "User-Agent": UA,
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9"
      };
      var PAGE_LIMIT_DEFAULT = 20;
      var MAX_SITE_PAGES_DEFAULT = 80;
      var TMDB_CONCURRENCY = 6;
      var PAGE_CACHE_TTL = 10 * 60 * 1e3;
      var PAGE_CACHE_STALE = 6 * 60 * 60 * 1e3;
      var BUFFER_TTL = 30 * 60 * 1e3;
      var RESOLVED_TTL = 24 * 60 * 60 * 1e3;
      var RESOLVED_NULL_TTL = 6 * 60 * 60 * 1e3;
      var GENRES = [
        "Action",
        "Adventure",
        "Animation",
        "Anthology Series",
        "BL Series",
        "Comedy",
        "Concert",
        "Crime",
        "Documentary",
        "Drama",
        "Family",
        "Fantasy",
        "History",
        "Horror",
        "Indie",
        "LGBTQ",
        "Music",
        "Musical",
        "Mystery",
        "Romance",
        "Science Fiction",
        "Short Films",
        "Sports",
        "Stageplay",
        "Tagalog Dubbed",
        "Teleserye",
        "Thriller",
        "War",
        "Wattpad",
        "Web Series"
      ];
      var pageCache = /* @__PURE__ */ new Map();
      var resolvedCache = /* @__PURE__ */ new Map();
      var buffers = /* @__PURE__ */ new Map();
      var bufferInflight = /* @__PURE__ */ new Map();
      var tmdbInflight = /* @__PURE__ */ new Map();
      var CACHE_CAPS = { page: 250, resolved: 4e3, buffers: 80 };
      function cachePrune(map, cap) {
        if (map.size <= cap)
          return;
        var it = map.keys();
        while (map.size > cap) {
          var k = it.next();
          if (k.done)
            break;
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
      function makeConfig(env) {
        env = env || {};
        var site = String(env.PINOYHUB_SITE || DEFAULT_SITE).replace(/\/+$/, "");
        var limit = parseInt(env.PINOYHUB_PAGE_LIMIT, 10);
        var maxPages = parseInt(env.PINOYHUB_MAX_PAGES, 10);
        return {
          site,
          tmdbKey: String(env.TMDB_API_KEY || DEFAULT_TMDB_KEY),
          pageLimit: Math.min(Math.max(isFinite(limit) && limit > 0 ? limit : PAGE_LIMIT_DEFAULT, 5), 50),
          maxSitePages: isFinite(maxPages) && maxPages > 0 ? maxPages : MAX_SITE_PAGES_DEFAULT,
          keepUnmatched: env.PINOYHUB_KEEP_UNMATCHED === "1",
          fetchFn: env.__fetchFn || (typeof fetch === "function" ? fetch : null),
          nowFn: env.__nowFn || function() {
            return Date.now();
          }
        };
      }
      var ENTITY_MAP = {
        amp: "&",
        lt: "<",
        gt: ">",
        quot: '"',
        apos: "'",
        nbsp: " ",
        "#8211": "\u2013",
        "#8212": "\u2014",
        "#8216": "\u2018",
        "#8217": "\u2019",
        "#8220": "\u201C",
        "#8221": "\u201D",
        "#038": "&",
        "#8210": "\u2010",
        "#8242": "\u2032",
        "#8482": "\u2122",
        "#174": "\xAE"
      };
      function decodeEntities(s) {
        return String(s || "").replace(/&(#?\w+);/g, function(m, ent) {
          if (ENTITY_MAP[ent])
            return ENTITY_MAP[ent];
          if (ent.charAt(0) === "#") {
            var num = parseInt(ent.substring(1), 10);
            if (isFinite(num) && num > 0 && num < 65536)
              return String.fromCharCode(num);
          }
          return m;
        });
      }
      function stripTags(s) {
        return String(s || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
      }
      function collapseWs(s) {
        return String(s || "").replace(/\s+/g, " ").trim();
      }
      function slugifyGenre(s) {
        return String(s || "").toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
      }
      function normalizeForCompare(s) {
        return String(s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " ").trim();
      }
      function attr(tag, name) {
        var m = tag.match(new RegExp(name + `=["']([^"']*)["']`, "i"));
        return m ? m[1] : "";
      }
      function absoluteUrl(cfg, u) {
        u = String(u || "").trim();
        if (!u)
          return "";
        if (u.indexOf("//") === 0)
          return "https:" + u;
        if (/^https?:\/\//i.test(u))
          return u;
        if (u.charAt(0) === "/")
          return cfg.site + u;
        return "";
      }
      function isPlaceholderPoster(u) {
        return /\/themes\/dooplay\/assets\/img\/no\//i.test(u || "");
      }
      function cleanPosterUrl(cfg, u) {
        u = absoluteUrl(cfg, u);
        if (!u || isPlaceholderPoster(u))
          return "";
        return u.replace(/-\d+x\d+(\.\w{3,4})(?:\?.*)?$/, "$1");
      }
      function jsonHeaders(maxAge) {
        return {
          "Content-Type": "application/json;charset=utf-8",
          "Cache-Control": "public, max-age=" + (maxAge || 300),
          "Access-Control-Allow-Origin": "*"
        };
      }
      function json(obj, status, maxAge) {
        return new Response(JSON.stringify(obj), { status: status || 200, headers: jsonHeaders(maxAge) });
      }
      var QUALIFIER_WORDS = /(tagalog|dubbed|english|taglish|full[\s-]*(movie|series|film)|hd(?:[\s-]*cam)?|audio|subtitle|subbed|cam|ts|print)/i;
      function cleanTitleForSearch(title) {
        var t = decodeEntities(title);
        t = t.replace(/^\s*ep(?:isode)?\s*\d+\s*[\u2013\u2014:-]\s*/i, "");
        t = t.replace(/[\(\[\{][^\)\]\}]*[\)\]\}]/g, function(seg) {
          return QUALIFIER_WORDS.test(seg) ? " " : seg;
        });
        t = t.replace(/\b(tagalog|english)[\s-]*dubbed\b/gi, " ");
        t = t.replace(/\bfull[\s-]*(movie|series|film)\b/gi, " ");
        t = t.replace(/\bwith[\s-]+english[\s-]+subs(?:titles)?\b/gi, " ");
        t = t.replace(/\s+\b(hd|hdtv|hdrip|webrip|dvdrip|blu-ray|bluray)\b\s*$/i, "");
        t = t.replace(/\b(19|20)\d{2}\b/g, " ");
        t = collapseWs(t).replace(/^[\u2013\u2014:,-]+\s*/, "").trim();
        return t;
      }
      function cleanDisplayName(title) {
        var t = collapseWs(decodeEntities(title));
        t = t.replace(/^\s*ep(?:isode)?\s*\d+\s*[\u2013\u2014:-]\s*/i, "");
        t = t.replace(/^\s*\d+x\d+\s*[\u2013\u2014:-]\s*/, "");
        return t.substring(0, 120).trim();
      }
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
          var postId = idMatch ? idMatch[1] : "";
          var img = body.match(/<img[^>]*>/i);
          var poster = img ? attr(img[0], "src") : "";
          if (postId.indexOf("featured-") === 0) {
            var fid = postId.substring("featured-".length);
            var fp = cleanPosterUrl(cfg, poster);
            if (fp)
              featuredPosters[fid] = fp;
            continue;
          }
          var link = body.match(/href=["'](https?:\/\/[^"']+)["']/i);
          if (!link)
            continue;
          var url = decodeEntities(link[1]).replace(/[?#].*$/, "");
          if (!/\/(?:movies|series)\/[^/]+$/i.test(url))
            continue;
          var kind = /\/movies\//i.test(url) ? "movie" : /\/series\//i.test(url) ? "series" : "";
          if (!kind)
            continue;
          var isSearchItem = /class=["']details["']/.test(body);
          var isArchiveItem = /^\d+$/.test(postId);
          if (!isSearchItem && !isArchiveItem)
            continue;
          var title = "";
          var th = body.match(/<h3[^>]*class=["'][^"']*title[^"']*["'][^>]*>([\s\S]*?)<\/h3>/i);
          if (th)
            title = stripTags(th[1]);
          if (!title) {
            var td = body.match(/<div[^>]*class=["']title["'][^>]*>\s*<a[^>]*>([\s\S]*?)<\/a>/i);
            if (td)
              title = stripTags(td[1]);
          }
          if (!title && img) {
            var alt = attr(img[0], "alt");
            if (alt)
              title = stripTags(decodeEntities(alt));
          }
          if (!title)
            continue;
          var year = "";
          var ym = body.match(/<span[^>]*>\s*((?:19|20)\d{2})\s*</);
          if (ym)
            year = ym[1];
          var desc = "";
          var dm = body.match(/<div[^>]*class=["']contenido["'][^>]*>\s*<p>([\s\S]*?)<\/p>/i);
          if (dm)
            desc = stripTags(dm[1]);
          var slug = url.replace(/\/+$/, "").split("/").pop() || "";
          if (seen[url])
            continue;
          seen[url] = true;
          items.push({
            postId,
            slug,
            url,
            type: kind,
            title: collapseWs(decodeEntities(title)),
            year,
            poster,
            description: desc
          });
        }
        for (var i = 0; i < items.length; i++) {
          var it = items[i];
          if (isPlaceholderPoster(it.poster) && it.postId && featuredPosters[it.postId]) {
            it.poster = featuredPosters[it.postId];
          }
        }
        return items;
      }
      function fetchText(cfg, url, timeoutMs) {
        if (!cfg.fetchFn)
          return Promise.reject(new Error("no fetch available"));
        var opts = { method: "GET", redirect: "follow", headers: BASE_HEADERS };
        if (typeof AbortSignal !== "undefined" && typeof AbortSignal.timeout === "function") {
          opts.signal = AbortSignal.timeout(timeoutMs || 2e4);
        }
        return Promise.resolve().then(function() {
          return cfg.fetchFn(url, opts);
        }).then(function(res) {
          if (!res.ok)
            throw new Error("HTTP " + res.status + " for " + url);
          return res.text();
        });
      }
      function fetchJson(cfg, url) {
        if (!cfg.fetchFn)
          return Promise.reject(new Error("no fetch available"));
        var opts = { method: "GET", redirect: "follow", headers: BASE_HEADERS };
        if (typeof AbortSignal !== "undefined" && typeof AbortSignal.timeout === "function") {
          opts.signal = AbortSignal.timeout(15e3);
        }
        return Promise.resolve().then(function() {
          return cfg.fetchFn(url, opts);
        }).then(function(res) {
          if (!res.ok)
            throw new Error("HTTP " + res.status);
          return res.json();
        });
      }
      function fetchSitePageCached(cfg, url, type) {
        var entry = pageCache.get(url);
        var now = cfg.nowFn();
        if (entry && now - entry.ts < PAGE_CACHE_TTL) {
          return Promise.resolve(filterType(entry.items, type));
        }
        return fetchText(cfg, url, 2e4).then(function(html) {
          var items = parseListPage(cfg, html);
          pageCache.set(url, { ts: now, items });
          cachePrune(pageCache, CACHE_CAPS.page);
          return filterType(items, type);
        }).catch(function(err) {
          if (entry && now - entry.ts < PAGE_CACHE_STALE)
            return filterType(entry.items, type);
          throw err;
        });
      }
      function filterType(items, type) {
        var out = [];
        for (var i = 0; i < items.length; i++) {
          if (!type || items[i].type === type)
            out.push(items[i]);
        }
        return out;
      }
      function tmdbImg(size, path) {
        return path ? "https://image.tmdb.org/t/p/" + size + path : "";
      }
      function tmdbSearch(cfg, kind, query, year) {
        var url = "https://api.themoviedb.org/3/search/" + kind + "?api_key=" + encodeURIComponent(cfg.tmdbKey) + "&query=" + encodeURIComponent(query) + "&include_adult=false&page=1";
        if (year)
          url += kind === "movie" ? "&year=" + encodeURIComponent(year) : "&first_air_date_year=" + encodeURIComponent(year);
        return fetchJson(cfg, url).then(function(data) {
          if (!data || !Array.isArray(data.results))
            return [];
          return data.results.map(function(r) {
            return {
              id: r.id,
              title: r.title || r.name || "",
              original: r.original_title || r.original_name || "",
              year: String(r.release_date || r.first_air_date || "").split("-")[0] || "",
              poster: r.poster_path || "",
              backdrop: r.backdrop_path || "",
              overview: r.overview || "",
              rating: typeof r.vote_average === "number" && r.vote_average > 0 ? r.vote_average : 0
            };
          });
        }).catch(function() {
          return [];
        });
      }
      function titleScore(siteNorm, tmdbNorm) {
        if (!siteNorm || !tmdbNorm)
          return 0;
        if (siteNorm === tmdbNorm)
          return 3;
        if (siteNorm.length >= 6 && tmdbNorm.indexOf(siteNorm) === 0)
          return 2.5;
        if (tmdbNorm.length >= 6 && siteNorm.indexOf(tmdbNorm) === 0)
          return 2.5;
        if (siteNorm.indexOf(tmdbNorm) !== -1 || tmdbNorm.indexOf(siteNorm) !== -1)
          return 2;
        var a = siteNorm.split(" ");
        var b = tmdbNorm.split(" ");
        var setB = {};
        for (var i = 0; i < b.length; i++)
          setB[b[i]] = true;
        var inter = 0;
        for (var j = 0; j < a.length; j++)
          if (setB[a[j]])
            inter++;
        var cov = inter / Math.max(a.length, b.length);
        return cov >= 0.6 ? 1.5 : 0;
      }
      function yearScore(siteYear, tmdbYear) {
        if (!siteYear || !tmdbYear)
          return 0;
        var d = Math.abs(parseInt(siteYear, 10) - parseInt(tmdbYear, 10));
        if (d === 0)
          return 2;
        if (d === 1)
          return 1;
        if (d === 2)
          return 0.5;
        return -2;
      }
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
          var acceptable = t >= 2.5 || t >= 2 && y >= 1 || t === 3;
          if (!acceptable)
            continue;
          if (score > bestScore) {
            bestScore = score;
            best = c;
          }
        }
        return best;
      }
      function resolveTmdb(cfg, type, rawTitle, siteYear) {
        var cleaned = cleanTitleForSearch(rawTitle);
        if (!cleaned)
          return Promise.resolve(null);
        var key = cfg.site + "|" + type + "|" + normalizeForCompare(cleaned) + "|" + (siteYear || "");
        var now = cfg.nowFn();
        var hit = resolvedCache.get(key);
        if (hit) {
          var ttl = hit.value ? RESOLVED_TTL : RESOLVED_NULL_TTL;
          if (now - hit.ts < ttl)
            return Promise.resolve(hit.value);
          resolvedCache.delete(key);
        }
        var pending = tmdbInflight.get(key);
        if (pending)
          return pending;
        var kind = type === "movie" ? "movie" : "tv";
        var attempts = [{ q: cleaned, y: siteYear }, { q: cleaned, y: "" }];
        pending = function run(idx) {
          if (idx >= attempts.length)
            return Promise.resolve(null);
          var at = attempts[idx];
          return tmdbSearch(cfg, kind, at.q, at.y).then(function(candidates) {
            var best = pickBestTmdb(candidates, cleaned, siteYear);
            if (best)
              return best;
            return run(idx + 1);
          });
        }(0).then(function(value) {
          resolvedCache.set(key, { ts: now, value });
          cachePrune(resolvedCache, CACHE_CAPS.resolved);
          tmdbInflight.delete(key);
          return value;
        }).catch(function(err) {
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
            if (i >= arr.length)
              return void 0;
            var idx = i++;
            return Promise.resolve().then(function() {
              return fn(arr[idx], idx);
            }).then(function(r) {
              out[idx] = r;
              return loop();
            });
          });
        }
        var workers = [];
        for (var w = 0; w < Math.min(n, arr.length); w++)
          workers.push(worker());
        return Promise.all(workers).then(function() {
          return out;
        });
      }
      function toMeta(cfg, item, tmdb) {
        var type = item.type === "series" ? "series" : "movie";
        var name = cleanDisplayName(item.title);
        if (!name)
          return null;
        var sitePoster = cleanPosterUrl(cfg, item.poster);
        if (tmdb) {
          var meta = {
            id: "tmdb:" + tmdb.id,
            type,
            name,
            poster: sitePoster || tmdbImg("w342", tmdb.poster),
            posterShape: "poster"
          };
          var bg = tmdbImg("w780", tmdb.backdrop);
          if (bg)
            meta.background = bg;
          if (tmdb.overview)
            meta.description = tmdb.overview;
          var rel = item.year || tmdb.year;
          if (rel)
            meta.releaseInfo = String(rel);
          if (tmdb.rating)
            meta.imdbRating = Math.round(tmdb.rating * 10) / 10;
          return meta;
        }
        if (!cfg.keepUnmatched)
          return null;
        var fallbackMeta = {
          id: "pinoyhub:" + (item.slug || ""),
          type,
          name,
          posterShape: "poster"
        };
        if (sitePoster)
          fallbackMeta.poster = sitePoster;
        if (item.description)
          fallbackMeta.description = item.description;
        if (item.year)
          fallbackMeta.releaseInfo = String(item.year);
        return fallbackMeta;
      }
      function resolveBatch(cfg, items) {
        return mapLimited(items, TMDB_CONCURRENCY, function(item) {
          return resolveTmdb(cfg, item.type, item.title, item.year).then(function(tmdb) {
            return toMeta(cfg, item, tmdb);
          }).catch(function() {
            return null;
          });
        });
      }
      function bufferStateKey(cfg, kind, ident) {
        return cfg.site + "|" + kind + "|" + ident;
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
      function runBuffered(cfg, stateKey, pageUrlFn, type, skip, limit) {
        var existing = bufferInflight.get(stateKey);
        if (existing)
          return existing;
        var job = Promise.resolve().then(function() {
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
            var fetchPage = fetchSitePageCached(cfg, pageUrlFn(page), type);
            var safeFetch = page === 1 ? fetchPage : fetchPage.catch(function() {
              return null;
            });
            return safeFetch.then(function(items) {
              if (!items || !items.length) {
                buf.exhausted = true;
                return buf.items.slice(skip, skip + limit);
              }
              buf.nextPage = page + 1;
              return resolveBatch(cfg, items).then(function(metas) {
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
          function(r) {
            bufferInflight.delete(stateKey);
            return r;
          },
          function(e) {
            bufferInflight.delete(stateKey);
            throw e;
          }
        );
      }
      function catalogDefinitions() {
        return [
          {
            type: "movie",
            id: "pinoy-movies",
            name: "Pinoy Movies",
            mode: "archive",
            description: "Latest Pinoy movies from pinoymovieshub.win",
            extra: [{ name: "search" }, { name: "skip" }]
          },
          {
            type: "movie",
            id: "pinoy-movies-genre",
            name: "Pinoy Movies by Genre",
            mode: "genre",
            description: "Browse Pinoy movies by genre",
            extra: [{ name: "genre", options: GENRES.slice() }, { name: "skip" }]
          },
          {
            type: "series",
            id: "pinoy-series",
            name: "Pinoy Series",
            mode: "archive",
            description: "Latest Pinoy series and Tagalog-dubbed shows",
            extra: [{ name: "search" }, { name: "skip" }]
          },
          {
            type: "series",
            id: "pinoy-series-genre",
            name: "Pinoy Series by Genre",
            mode: "genre",
            description: "Browse Pinoy series by genre",
            extra: [{ name: "genre", options: GENRES.slice() }, { name: "skip" }]
          }
        ];
      }
      function manifest(cfg) {
        return {
          id: ADDON_ID,
          version: VERSION,
          name: "PinoyHub Catalog",
          description: "Browse Pinoy movies and Tagalog-dubbed series from pinoymovieshub.win. Titles resolve to TMDB ids; pair with the PinoyMoviesHub plugin for playback.",
          logo: cfg.site + SITE_ICON,
          resources: ["catalog"],
          types: ["movie", "series"],
          idPrefixes: ["tmdb:"],
          catalogs: catalogDefinitions().map(function(c) {
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
      function parseExtras(pathSegment, searchParams) {
        var extras = {};
        var seg = String(pathSegment || "").replace(/\.json$/i, "");
        if (seg) {
          var pairs = seg.split("&");
          for (var i = 0; i < pairs.length; i++) {
            var p = pairs[i];
            if (!p)
              continue;
            var eq = p.indexOf("=");
            var k = eq === -1 ? p : p.substring(0, eq);
            var v = eq === -1 ? "" : p.substring(eq + 1);
            if (k)
              extras[k.toLowerCase()] = v;
          }
        }
        if (searchParams) {
          searchParams.forEach(function(v2, k2) {
            var key = String(k2).toLowerCase();
            if (!(key in extras))
              extras[key] = v2;
          });
        }
        return extras;
      }
      function findCatalog(catalogId, type) {
        var defs = catalogDefinitions();
        for (var i = 0; i < defs.length; i++) {
          if (defs[i].id === catalogId && defs[i].type === type)
            return defs[i];
        }
        return null;
      }
      function getCatalogMetas(cfg, def, extras) {
        var skip = parseInt(extras.skip, 10);
        if (!isFinite(skip) || skip < 0)
          skip = 0;
        var limit = cfg.pageLimit;
        var search = String(extras.search || "").trim();
        var genreSlug = slugifyGenre(extras.genre || "");
        if (search) {
          var stateKey = bufferStateKey(cfg, "search", def.id + ":" + search.toLowerCase());
          var searchUrl = function(page) {
            return page === 1 ? cfg.site + "/?s=" + encodeURIComponent(search) : cfg.site + "/page/" + page + "/?s=" + encodeURIComponent(search);
          };
          return runBuffered(cfg, stateKey, searchUrl, def.type, skip, limit);
        }
        if (def.mode === "genre" && genreSlug) {
          var gKey = bufferStateKey(cfg, "genre", def.id + ":" + genreSlug);
          var genreUrl = function(page) {
            return page === 1 ? cfg.site + "/genre/" + genreSlug + "/" : cfg.site + "/genre/" + genreSlug + "/page/" + page + "/";
          };
          return runBuffered(cfg, gKey, genreUrl, def.type, skip, limit);
        }
        var seg = def.type === "series" ? "/series" : "/movies";
        var listKey = bufferStateKey(cfg, "list", def.id);
        var listUrl = function(page) {
          return page === 1 ? cfg.site + seg + "/" : cfg.site + seg + "/page/" + page;
        };
        return runBuffered(cfg, listKey, listUrl, def.type, skip, limit);
      }
      function indexHtml(cfg) {
        var defs = catalogDefinitions();
        var rows = defs.map(function(c) {
          return "<tr><td><code>" + c.type + "</code></td><td>" + c.name + "</td><td><code>/catalog/" + c.type + "/" + c.id + ".json</code></td></tr>";
        }).join("");
        return '<!DOCTYPE html><html><head><meta charset="utf-8"><title>PinoyHub Catalog</title><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{font-family:system-ui,sans-serif;max-width:860px;margin:40px auto;padding:0 16px;color:#eee;background:#14141b}a{color:#7ab8ff}table{border-collapse:collapse;width:100%}td,th{border:1px solid #333;padding:8px;text-align:left;font-size:14px}code{color:#9ef}</style></head><body><h1>PinoyHub Catalog <small>v' + VERSION + '</small></h1><p>Stremio-protocol catalog addon for <a href="' + cfg.site + '">pinoymovieshub.win</a>, built for Nuvio.</p><p>Add this manifest URL in Nuvio (Settings &rarr; Addons): <b>' + (cfg.__selfUrl || "https://your-deployment") + "/manifest.json</b></p><h2>Catalogs</h2><table><tr><th>Type</th><th>Name</th><th>Endpoint</th></tr>" + rows + "</table><h2>Extras</h2><p>Search: <code>/catalog/movie/pinoy-movies/search=cobra kai.json</code> &middot; Genre: <code>/catalog/series/pinoy-series-genre/genre=Tagalog Dubbed&amp;skip=20.json</code></p><p>Pair with the <b>PinoyMoviesHub</b> Nuvio plugin (providers/pinoyhub.js in xrexzerox/nv-plugins) for playable streams.</p></body></html>";
      }
      function handle(urlString, env) {
        var cfg = makeConfig(env || {});
        cfg.__selfUrl = env && env.__selfUrl || "";
        var raw = String(urlString || "/");
        if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(raw))
          raw = "https://pinoyhub.local" + (raw.charAt(0) === "/" ? raw : "/" + raw);
        var u;
        try {
          u = new URL(raw);
        } catch (e) {
          return Promise.resolve(json({ error: "invalid url" }, 400, 0));
        }
        var path = u.pathname.replace(/\/+$/, "") || "/";
        try {
          if (path === "/" || path === "/healthz") {
            return Promise.resolve(new Response(indexHtml(cfg), {
              status: 200,
              headers: { "Content-Type": "text/html;charset=utf-8", "Cache-Control": "public, max-age=60", "Access-Control-Allow-Origin": "*" }
            }));
          }
          if (path === "/manifest.json") {
            return Promise.resolve(json(manifest(cfg), 200, 300));
          }
          var m = path.match(/^\/catalog\/(movie|series|tv)\/([a-z0-9-]+)(?:\/([^/]*))?\.json$/i);
          if (!m) {
            return Promise.resolve(json({ error: "not found", hint: "GET /manifest.json or /catalog/{type}/{catalogId}/[extras].json" }, 404, 0));
          }
          var type = m[1].toLowerCase() === "tv" ? "series" : m[1].toLowerCase();
          var catalogId = m[2].toLowerCase();
          var def = findCatalog(catalogId, type);
          if (!def) {
            return Promise.resolve(json({ error: "unknown catalog", catalogId, type }, 404, 0));
          }
          var extras = parseExtras(m[3] ? decodeURIComponent(m[3]) : "", u.searchParams);
          return getCatalogMetas(cfg, def, extras).then(function(metas) {
            return json({ metas }, 200, 300);
          }).catch(function(err) {
            return json({ error: String(err && err.message || err) }, 502, 0);
          });
        } catch (err) {
          return Promise.resolve(json({ error: String(err && err.message || err) }, 500, 0));
        }
      }
      global.PinoyHubCatalogCore = {
        VERSION,
        ADDON_ID,
        makeConfig,
        manifest,
        handle,
        resetCaches,
        // test hooks
        parseListPage,
        cleanTitleForSearch,
        cleanDisplayName,
        normalizeForCompare,
        titleScore,
        yearScore,
        pickBestTmdb,
        toMeta,
        slugifyGenre
      };
    })(typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : exports);
  }
});

// addons/pinoyhub-catalog/worker.js
var import_core = __toESM(require_core());
var Core = globalThis.PinoyHubCatalogCore;
var worker_default = {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "*",
          "Access-Control-Max-Age": "86400"
        }
      });
    }
    if (request.method !== "GET" && request.method !== "HEAD") {
      return new Response(JSON.stringify({ error: "method not allowed" }), {
        status: 405,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
      });
    }
    try {
      const url = new URL(request.url);
      const response = await Core.handle(url.toString(), env);
      if (request.method === "HEAD") {
        return new Response(null, { status: response.status, headers: response.headers });
      }
      return response;
    } catch (err) {
      return new Response(JSON.stringify({ error: String(err && err.message || err) }), {
        status: 500,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
      });
    }
  }
};
export {
  worker_default as default
};
