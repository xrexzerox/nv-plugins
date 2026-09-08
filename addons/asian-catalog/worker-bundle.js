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

// addons/asian-catalog/core.js
var require_core = __commonJS({
  "addons/asian-catalog/core.js"(exports) {
    (function(global) {
      "use strict";
      var VERSION = "2.1.1";
      var ADDON_ID = "community.asianhub.catalog";
      var DEFAULT_SITE = "https://pinoymovieshub.win";
      var DEFAULT_MATV_SITE = "https://myasiantv.com.lv";
      var DEFAULT_DC_SITE = "https://dramacool.uno";
      var DEFAULT_TMDB_KEY = "439c478a771f35c05022f9feabcca01c";
      var SITE_ICON = "/wp-content/uploads/2025/04/cropped-favicon-11-192x192.png";
      var ASIAN_LOGO = "https://www.google.com/s2/favicons?domain=myasiantv.com.lv&sz=128";
      var UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36";
      var BASE_HEADERS = {
        "User-Agent": UA,
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9"
      };
      var ALT_HEADERS = {
        "User-Agent": "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Mobile Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
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
      var TMDB_GENRES_MOVIE = {
        28: "Action",
        12: "Adventure",
        16: "Animation",
        35: "Comedy",
        80: "Crime",
        99: "Documentary",
        18: "Drama",
        10751: "Family",
        14: "Fantasy",
        36: "History",
        27: "Horror",
        10402: "Music",
        9648: "Mystery",
        10749: "Romance",
        878: "Science Fiction",
        10770: "TV Movie",
        53: "Thriller",
        10752: "War",
        37: "Western"
      };
      var TMDB_GENRES_TV = {
        10759: "Action & Adventure",
        16: "Animation",
        35: "Comedy",
        80: "Crime",
        99: "Documentary",
        18: "Drama",
        10751: "Family",
        10762: "Kids",
        9648: "Mystery",
        10763: "News",
        10764: "Reality",
        10765: "Sci-Fi & Fantasy",
        10766: "Soap",
        10767: "Talk",
        10768: "War & Politics",
        37: "Western"
      };
      var COUNTRY_BY_CODE = {
        KR: "South Korea",
        KP: "North Korea",
        CN: "China",
        TW: "Taiwan",
        HK: "Hong Kong",
        JP: "Japan",
        TH: "Thailand",
        IN: "India",
        PH: "Philippines",
        ID: "Indonesia",
        MY: "Malaysia",
        SG: "Singapore",
        VN: "Vietnam",
        MN: "Mongolia",
        NP: "Nepal"
      };
      var COUNTRY_BY_LANG = {
        ko: "South Korea",
        zh: "China",
        ja: "Japan",
        th: "Thailand",
        tl: "Philippines",
        fil: "Philippines",
        hi: "India",
        ta: "India",
        te: "India",
        ml: "India",
        id: "Indonesia",
        ms: "Malaysia"
      };
      function genresFromIds(type, ids) {
        var map = type === "movie" ? TMDB_GENRES_MOVIE : TMDB_GENRES_TV;
        var out = [];
        for (var i = 0; i < (ids || []).length && out.length < 5; i++) {
          var name = map[ids[i]];
          if (name && out.indexOf(name) === -1)
            out.push(name);
        }
        return out;
      }
      function countryFromCandidate(cand) {
        var names = [];
        for (var i = 0; i < (cand.origin || []).length; i++) {
          var n = COUNTRY_BY_CODE[cand.origin[i]];
          if (n && names.indexOf(n) === -1)
            names.push(n);
        }
        if (!names.length && cand.lang && COUNTRY_BY_LANG[cand.lang]) {
          names.push(COUNTRY_BY_LANG[cand.lang]);
        }
        return names;
      }
      var pageCache = /* @__PURE__ */ new Map();
      var resolvedCache = /* @__PURE__ */ new Map();
      var buffers = /* @__PURE__ */ new Map();
      var bufferInflight = /* @__PURE__ */ new Map();
      var tmdbInflight = /* @__PURE__ */ new Map();
      var detailsCache = /* @__PURE__ */ new Map();
      var detailsInflight = /* @__PURE__ */ new Map();
      var DETAILS_TTL = 24 * 60 * 60 * 1e3;
      var healthCache = { ts: 0, data: null };
      var CACHE_CAPS = { page: 250, resolved: 4e3, buffers: 80, details: 4e3 };
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
        detailsCache.clear();
        detailsInflight.clear();
        healthCache.ts = 0;
        healthCache.data = null;
      }
      function makeConfig(env) {
        env = env || {};
        var site = String(env.PINOYHUB_SITE || DEFAULT_SITE).replace(/\/+$/, "");
        var matvSite = String(env.MYASIANTV_SITE || DEFAULT_MATV_SITE).replace(/\/+$/, "");
        var dcSite = String(env.DRAMACOOL_SITE || DEFAULT_DC_SITE).replace(/\/+$/, "");
        var limit = parseInt(env.PINOYHUB_PAGE_LIMIT, 10);
        var maxPages = parseInt(env.PINOYHUB_MAX_PAGES, 10);
        return {
          site,
          matvSite,
          dcSite,
          tmdbKey: String(env.TMDB_API_KEY || DEFAULT_TMDB_KEY),
          pageLimit: Math.min(Math.max(isFinite(limit) && limit > 0 ? limit : PAGE_LIMIT_DEFAULT, 5), 50),
          maxSitePages: isFinite(maxPages) && maxPages > 0 ? maxPages : MAX_SITE_PAGES_DEFAULT,
          keepUnmatched: env.PINOYHUB_KEEP_UNMATCHED === "1",
          // workerd (Cloudflare Workers) receiver-checks its native API fns: an
          // unbound alias (`const f = fetch`) invoked as cfg.fetchFn(url) runs
          // with `this === cfg` and throws "Illegal invocation: function called
          // with incorrect `this` reference" BEFORE any network I/O (ms:0 on
          // every /health probe). Node's fetch ignores its receiver, which is
          // why server.js and the offline test suite never caught this. Binding
          // to the IIFE's global object satisfies workerd and changes nothing
          // for Node/tests (injected env.__fetchFn is used verbatim as before).
          fetchFn: env.__fetchFn || (typeof fetch === "function" ? fetch.bind(global) : null),
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
        t = t.replace(/\s*[-:\u2013\u2014]?\s*Episode\s*\d+\s*$/i, "");
        t = t.replace(/\b(19|20)\d{2}\b/g, " ");
        t = t.replace(/\(\s*\)/g, " ");
        t = collapseWs(t).replace(/^[\u2013\u2014:,-]+\s*/, "").trim();
        return t;
      }
      function cleanDisplayName(title) {
        var t = collapseWs(decodeEntities(title));
        t = t.replace(/^\s*ep(?:isode)?\s*\d+\s*[\u2013\u2014:-]\s*/i, "");
        t = t.replace(/^\s*\d+x\d+\s*[\u2013\u2014:-]\s*/, "");
        t = t.replace(/\s*[-:\u2013\u2014]?\s*Episode\s*\d+\s*$/i, "");
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
      function parseMatvListPage(cfg, html) {
        var items = [];
        var seen = {};
        var re = /<a\s+href="(https?:\/\/[^"']*\/series\/([a-z0-9-]+)\/)"\s+title="([^"]+)"[^>]*>\s*<div\s+class="cover"\s+style="background-image:\s*url\('([^']+)'\);?"/gi;
        var m;
        while ((m = re.exec(html)) !== null) {
          var url = decodeEntities(m[1]);
          if (seen[url])
            continue;
          seen[url] = true;
          var slug = m[2];
          var rawTitle = decodeEntities(m[3]).replace(/\s+/g, " ").trim();
          var poster = m[4] || "";
          var ym = rawTitle.match(/\b((?:19|20)\d{2})\b/);
          items.push({
            postId: slug,
            slug,
            url,
            type: "series",
            title: rawTitle,
            year: ym ? ym[1] : "",
            poster,
            description: "",
            source: "matv"
          });
        }
        return items;
      }
      function parseDcListPage(cfg, html) {
        var items = [];
        var seen = {};
        var re = /<a\s+href="(https?:\/\/[^"']*\/(movie-detail|drama-info)\/([a-z0-9-]+))"\s+class="img"\s+title="([^"]*)"[^>]*>([\s\S]{0,600}?)<\/a>/gi;
        var m;
        while ((m = re.exec(html)) !== null) {
          var url = decodeEntities(m[1]);
          if (seen[url])
            continue;
          seen[url] = true;
          var kind = m[2].toLowerCase() === "movie-detail" ? "movie" : "series";
          var slug = m[3];
          var rawTitle = decodeEntities(m[4]).replace(/\s+/g, " ").trim();
          if (!rawTitle) {
            var h3 = m[5].match(/<h3[^>]*>([\s\S]*?)<\/h3>/i);
            if (h3)
              rawTitle = stripTags(h3[1]);
          }
          if (!rawTitle)
            continue;
          var pm = m[5].match(/data-original="([^"]+)"/i) || m[5].match(/<img[^>]+src="([^"]+)"/i);
          var ym = rawTitle.match(/\b((?:19|20)\d{2})\b/);
          items.push({
            postId: slug,
            slug,
            url,
            type: kind,
            title: rawTitle,
            year: ym ? ym[1] : "",
            poster: pm ? pm[1] : "",
            description: "",
            source: "dc"
          });
        }
        return items;
      }
      function parseMatvJson(cfg, data) {
        var items = [];
        if (!Array.isArray(data))
          return items;
        for (var i = 0; i < data.length; i++) {
          var r = data[i];
          if (!r || !r.url || !r.title)
            continue;
          var url = String(r.url);
          if (!/^https?:\/\//.test(url))
            continue;
          var title = String(r.title);
          var slug = url.replace(/\/+$/, "").split("/").pop() || "";
          var ym = title.match(/\b((?:19|20)\d{2})\b/);
          items.push({
            postId: slug,
            slug,
            url,
            type: "series",
            title,
            year: ym ? ym[1] : "",
            poster: "",
            description: "",
            source: "matv"
          });
        }
        return items;
      }
      function looksChallenged(body) {
        return /just a moment|cf-browser-verification|cf-chl|challenge-platform|attention required|ddos-guard|enable javascript and cookies/i.test(String(body || "").substring(0, 4e3));
      }
      function fetchOnce(cfg, url, timeoutMs, headers) {
        if (!cfg.fetchFn)
          return Promise.reject(new Error("no fetch available"));
        var opts = { method: "GET", redirect: "follow", headers: headers || BASE_HEADERS };
        if (typeof AbortSignal !== "undefined" && typeof AbortSignal.timeout === "function") {
          opts.signal = AbortSignal.timeout(timeoutMs);
        }
        return Promise.resolve().then(function() {
          return cfg.fetchFn(url, opts);
        });
      }
      function fetchText(cfg, url, timeoutMs) {
        var t = timeoutMs || 2e4;
        return fetchOnce(cfg, url, t, BASE_HEADERS).then(function(res) {
          if (!res.ok) {
            if (res.status === 403 || res.status === 429 || res.status === 503) {
              return fetchOnce(cfg, url, t, ALT_HEADERS).then(function(r2) {
                if (!r2.ok)
                  throw new Error("HTTP " + res.status + "/" + r2.status + " for " + url);
                return r2.text();
              }).then(function(body) {
                if (looksChallenged(body))
                  throw new Error("HTTP " + res.status + " challenge for " + url);
                return body;
              });
            }
            throw new Error("HTTP " + res.status + " for " + url);
          }
          return res.text().then(function(body) {
            if (!looksChallenged(body))
              return body;
            return fetchOnce(cfg, url, t, ALT_HEADERS).then(function(r2) {
              if (!r2.ok)
                throw new Error("HTTP " + r2.status + " challenge for " + url);
              return r2.text();
            }).then(function(body2) {
              if (looksChallenged(body2))
                throw new Error("challenge page for " + url);
              return body2;
            });
          });
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
      function parseWithParser(cfg, parser, raw) {
        if (parser === "matv-json")
          return parseMatvJson(cfg, raw);
        var html = String(raw || "");
        if (parser === "matv")
          return parseMatvListPage(cfg, html);
        if (parser === "dc")
          return parseDcListPage(cfg, html);
        return parseListPage(cfg, html);
      }
      function fetchSitePageCached(cfg, url, type, parser) {
        parser = parser || "pinoy";
        var entry = pageCache.get(url);
        var now = cfg.nowFn();
        if (entry && now - entry.ts < PAGE_CACHE_TTL) {
          return Promise.resolve(filterType(entry.items, type));
        }
        var p = parser === "matv-json" ? fetchJson(cfg, url) : fetchText(cfg, url, 2e4);
        return p.then(function(raw) {
          var items = parseWithParser(cfg, parser, raw);
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
              rating: typeof r.vote_average === "number" && r.vote_average > 0 ? r.vote_average : 0,
              genreIds: Array.isArray(r.genre_ids) ? r.genre_ids : [],
              lang: r.original_language || "",
              origin: Array.isArray(r.origin_country) ? r.origin_country : []
            };
          });
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
      function tmdbDetails(cfg, kind, id) {
        var key = kind + ":" + id;
        var now = cfg.nowFn();
        var hit = detailsCache.get(key);
        if (hit && now - hit.ts < DETAILS_TTL)
          return Promise.resolve(hit.value);
        var pending = detailsInflight.get(key);
        if (pending)
          return pending;
        var url = "https://api.themoviedb.org/3/" + kind + "/" + id + "?api_key=" + encodeURIComponent(cfg.tmdbKey) + "&append_to_response=credits";
        pending = fetchJson(cfg, url).then(function(d) {
          var info = { runtime: 0, genres: [], countries: [], cast: [], directors: [] };
          if (d) {
            var g = Array.isArray(d.genres) ? d.genres : [];
            for (var i = 0; i < g.length; i++) {
              if (g[i] && g[i].name)
                info.genres.push(g[i].name);
            }
            if (kind === "movie") {
              if (typeof d.runtime === "number" && d.runtime > 0)
                info.runtime = d.runtime;
              var pc = Array.isArray(d.production_countries) ? d.production_countries : [];
              for (var j = 0; j < pc.length; j++) {
                if (pc[j] && pc[j].name && info.countries.indexOf(pc[j].name) === -1)
                  info.countries.push(pc[j].name);
              }
            } else {
              var ert = Array.isArray(d.episode_run_time) ? d.episode_run_time : [];
              for (var k = 0; k < ert.length; k++) {
                if (typeof ert[k] === "number" && ert[k] > 0) {
                  info.runtime = ert[k];
                  break;
                }
              }
              var oc = Array.isArray(d.origin_country) ? d.origin_country : [];
              for (var c = 0; c < oc.length; c++) {
                var cn = COUNTRY_BY_CODE[oc[c]];
                if (cn && info.countries.indexOf(cn) === -1)
                  info.countries.push(cn);
              }
            }
            var cr = d.credits || {};
            var ca = Array.isArray(cr.cast) ? cr.cast : [];
            for (var m = 0; m < ca.length && info.cast.length < 6; m++) {
              if (ca[m] && ca[m].name)
                info.cast.push(ca[m].name);
            }
            var cw = Array.isArray(cr.crew) ? cr.crew : [];
            for (var n = 0; n < cw.length && info.directors.length < 2; n++) {
              if (cw[n] && cw[n].job === "Director" && cw[n].name && info.directors.indexOf(cw[n].name) === -1) {
                info.directors.push(cw[n].name);
              }
            }
          }
          detailsCache.set(key, { ts: now, value: info });
          cachePrune(detailsCache, CACHE_CAPS.details);
          detailsInflight.delete(key);
          return info;
        }).catch(function(err) {
          detailsInflight.delete(key);
          throw err;
        });
        detailsInflight.set(key, pending);
        return pending;
      }
      function enrichMetaWithDetails(cfg, meta, type, tmdbId) {
        if (!meta || String(meta.id).indexOf("tmdb:") !== 0)
          return Promise.resolve(meta);
        var kind = type === "movie" ? "movie" : "tv";
        return tmdbDetails(cfg, kind, tmdbId).then(function(d) {
          if (d.runtime > 0 && !meta.runtime)
            meta.runtime = d.runtime + " min";
          if (d.genres.length && !meta.genres) {
            meta.genres = d.genres.slice(0, 5);
            meta.genre = meta.genres.join(", ");
          }
          if (d.countries.length && !meta.country)
            meta.country = d.countries.slice(0, 2).join(", ");
          if (d.cast.length && !meta.cast)
            meta.cast = d.cast;
          if (d.directors.length && type === "movie" && !meta.director)
            meta.director = d.directors;
          return meta;
        }).catch(function() {
          return meta;
        });
      }
      function unmatchedMetaId(item) {
        var norm = normalizeForCompare(cleanTitleForSearch(item.title));
        var tail = (norm || item.slug || "").replace(/\s+/g, "-") || "untitled";
        return "asian:" + (item.source || "pinoy") + ":" + tail;
      }
      function buildUnmatchedMeta(cfg, item) {
        var type = item.type === "series" ? "series" : "movie";
        var name = cleanDisplayName(item.title);
        if (!name)
          return null;
        var meta = {
          id: unmatchedMetaId(item),
          type,
          name,
          posterShape: "poster"
        };
        var sitePoster = cleanPosterUrl(cfg, item.poster);
        if (sitePoster)
          meta.poster = sitePoster;
        if (item.description)
          meta.description = item.description;
        if (item.year)
          meta.releaseInfo = String(item.year);
        return meta;
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
          else if (item.description)
            meta.description = item.description;
          var rel = item.year || tmdb.year;
          if (rel)
            meta.releaseInfo = String(rel);
          if (tmdb.rating)
            meta.imdbRating = Math.round(tmdb.rating * 10) / 10;
          var genres = genresFromIds(type, tmdb.genreIds);
          if (genres.length) {
            meta.genres = genres;
            meta.genre = genres.join(", ");
          }
          var country = countryFromCandidate(tmdb);
          if (country.length)
            meta.country = country.join(", ");
          return meta;
        }
        if (!cfg.keepUnmatched)
          return null;
        return buildUnmatchedMeta(cfg, item);
      }
      function resolveBatch(cfg, items) {
        return mapLimited(items, TMDB_CONCURRENCY, function(item) {
          return resolveTmdb(cfg, item.type, item.title, item.year).then(function(tmdb) {
            var meta = toMeta(cfg, item, tmdb);
            if (!meta)
              return null;
            var idStr = String(meta.id);
            if (idStr.indexOf("tmdb:") === 0) {
              return enrichMetaWithDetails(cfg, meta, item.type, idStr.substring(5));
            }
            return meta;
          }).catch(function() {
            return buildUnmatchedMeta(cfg, item);
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
      function runBuffered(cfg, stateKey, pageUrlFn, type, skip, limit, parser) {
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
            var fetchPage = fetchSitePageCached(cfg, pageUrlFn(page), type, parser);
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
      var DC_COUNTRIES = [
        { label: "Korean", slug: "korean" },
        { label: "Chinese", slug: "chinese" },
        { label: "Japanese", slug: "japanese" },
        { label: "Thai", slug: "thailand" },
        { label: "Taiwanese", slug: "taiwanese" },
        { label: "Hong Kong", slug: "hong-kong" },
        { label: "Indian", slug: "indian" },
        { label: "Other Asia", slug: "other-asia" }
      ];
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
          },
          {
            type: "series",
            id: "asian-dramas",
            name: "Asian Dramas",
            mode: "matv-archive",
            description: "Korean/Chinese/Japanese/Thai dramas from myasiantv.com.lv (English subs)",
            extra: [{ name: "search" }, { name: "skip" }]
          },
          {
            type: "movie",
            id: "asian-movies",
            name: "Asian Movies by Country",
            mode: "dc-country",
            kind: "movie",
            description: "Asian movies by country from dramacool.uno (English subs)",
            extra: [{ name: "genre", options: DC_COUNTRIES.map(function(c) {
              return c.label;
            }) }, { name: "skip" }]
          },
          {
            type: "series",
            id: "asian-dramas-country",
            name: "Asian Dramas by Country",
            mode: "dc-country",
            kind: "series",
            description: "Asian dramas by country from dramacool.uno (English subs)",
            extra: [{ name: "genre", options: DC_COUNTRIES.map(function(c) {
              return c.label;
            }) }, { name: "skip" }]
          }
        ];
      }
      function manifest(cfg) {
        return {
          id: ADDON_ID,
          version: VERSION,
          name: "Asian Catalog",
          description: "Browse Pinoy movies, Tagalog-dubbed series and Asian movies & dramas (Korean/Chinese/Japanese/Thai and more, English subs). Titles resolve to TMDB ids; pair with the PinoyMoviesHub and AsianHub plugins for playback.",
          logo: ASIAN_LOGO,
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
          if (def.mode === "matv-archive") {
            var mKey = bufferStateKey(cfg, "matv-search", def.id + ":" + search.toLowerCase());
            var matvSearchUrl = function(page) {
              var u = cfg.matvSite + "/wp-json/wp/v2/search?search=" + encodeURIComponent(search) + "&per_page=40";
              if (page > 1)
                u += "&page=" + page;
              return u;
            };
            return runBuffered(cfg, mKey, matvSearchUrl, def.type, skip, limit, "matv-json");
          }
          var stateKey = bufferStateKey(cfg, "search", def.id + ":" + search.toLowerCase());
          var searchUrl = function(page) {
            return page === 1 ? cfg.site + "/?s=" + encodeURIComponent(search) : cfg.site + "/page/" + page + "/?s=" + encodeURIComponent(search);
          };
          return runBuffered(cfg, stateKey, searchUrl, def.type, skip, limit, "pinoy");
        }
        if (def.mode === "genre" && genreSlug) {
          var gKey = bufferStateKey(cfg, "genre", def.id + ":" + genreSlug);
          var genreUrl = function(page) {
            return page === 1 ? cfg.site + "/genre/" + genreSlug + "/" : cfg.site + "/genre/" + genreSlug + "/page/" + page + "/";
          };
          return runBuffered(cfg, gKey, genreUrl, def.type, skip, limit, "pinoy");
        }
        if (def.mode === "dc-country") {
          var chosen = def.extra[0].options[0];
          var found = false;
          for (var ci = 0; ci < DC_COUNTRIES.length; ci++) {
            if (slugifyGenre(DC_COUNTRIES[ci].label) === genreSlug) {
              chosen = DC_COUNTRIES[ci].label;
              found = true;
              break;
            }
          }
          if (!found && genreSlug)
            chosen = extras.genre || chosen;
          var dcSlug = function() {
            for (var di = 0; di < DC_COUNTRIES.length; di++) {
              if (slugifyGenre(DC_COUNTRIES[di].label) === slugifyGenre(chosen))
                return DC_COUNTRIES[di].slug;
            }
            return slugifyGenre(chosen);
          }();
          var dcKind = def.kind === "movie" ? "movie" : "drama";
          var cKey = bufferStateKey(cfg, "dc-country", def.id + ":" + dcSlug);
          var dcUrl = function(page) {
            return page === 1 ? cfg.dcSite + "/country/" + dcSlug + "-" + dcKind : cfg.dcSite + "/country/" + dcSlug + "-" + dcKind + "?page=" + page;
          };
          return runBuffered(cfg, cKey, dcUrl, def.type, skip, limit, "dc");
        }
        if (def.mode === "matv-archive") {
          var lKey = bufferStateKey(cfg, "matv-list", def.id);
          var matvListUrl = function(page) {
            if (page === 1)
              return cfg.matvSite + "/most-popular-drama/";
            if (page === 2)
              return cfg.matvSite + "/recently-added-movie/";
            if (page === 3)
              return cfg.matvSite + "/recently-added-kshow/";
            var li = page - 4;
            if (li < 0 || li > 25)
              return cfg.matvSite + "/drama-list/drama-start-with-zzz/";
            return cfg.matvSite + "/drama-list/drama-start-with-" + String.fromCharCode(97 + li) + "/";
          };
          return runBuffered(cfg, lKey, matvListUrl, def.type, skip, limit, "matv");
        }
        var seg = def.type === "series" ? "/series" : "/movies";
        var listKey = bufferStateKey(cfg, "list", def.id);
        var listUrl = function(page) {
          return page === 1 ? cfg.site + seg + "/" : cfg.site + seg + "/page/" + page;
        };
        return runBuffered(cfg, listKey, listUrl, def.type, skip, limit, "pinoy");
      }
      function indexHtml(cfg) {
        var defs = catalogDefinitions();
        var rows = defs.map(function(c) {
          return "<tr><td><code>" + c.type + "</code></td><td>" + c.name + "</td><td><code>/catalog/" + c.type + "/" + c.id + ".json</code></td></tr>";
        }).join("");
        return '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Asian Catalog</title><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{font-family:system-ui,sans-serif;max-width:860px;margin:40px auto;padding:0 16px;color:#eee;background:#14141b}a{color:#7ab8ff}table{border-collapse:collapse;width:100%}td,th{border:1px solid #333;padding:8px;text-align:left;font-size:14px}code{color:#9ef}</style></head><body><h1>Asian Catalog <small>v' + VERSION + '</small></h1><p>Stremio-protocol catalog addon built for Nuvio. Sources: <a href="' + cfg.site + '">pinoymovieshub.win</a> (Pinoy), <a href="' + cfg.matvSite + '">myasiantv.com.lv</a> (Asian dramas) and <a href="' + cfg.dcSite + '">dramacool.uno</a> (Asian movies & dramas by country).</p><p>Add this manifest URL in Nuvio (Settings &rarr; Addons): <b>' + (cfg.__selfUrl || "https://your-deployment") + '/manifest.json</b></p><p>Deployment diagnostics: <a href="/health"><code>/health</code></a> &mdash; live-checks pinoymovieshub / myasiantv / dramacool / TMDB from this runtime and explains what to fix when catalogs come back empty.</p><h2>Catalogs</h2><table><tr><th>Type</th><th>Name</th><th>Endpoint</th></tr>' + rows + "</table><h2>Extras</h2><p>Search: <code>/catalog/series/asian-dramas/search=crash landing.json</code> &middot; Country: <code>/catalog/movie/asian-movies/genre=Korean&amp;skip=20.json</code></p><p>Pair with the <b>PinoyMoviesHub</b> and <b>AsianHub</b> Nuvio plugins (providers/pinoyhub.js and providers/asianhub.js in xrexzerox/nv-plugins) for playable streams.</p></body></html>";
      }
      function checkSource(cfg, label, url, parser) {
        var t0 = cfg.nowFn();
        return fetchText(cfg, url, 12e3).then(function(raw) {
          var items = parseWithParser(cfg, parser, raw);
          return { label, ok: true, ms: cfg.nowFn() - t0, items: items.length, url, error: null };
        }).catch(function(err) {
          return { label, ok: false, ms: cfg.nowFn() - t0, items: 0, url, error: String(err && err.message || err) };
        });
      }
      function checkTmdb(cfg) {
        var t0 = cfg.nowFn();
        return tmdbSearch(cfg, "tv", "Crash Landing on You", "2019").then(function(results) {
          return { label: "tmdb", ok: true, ms: cfg.nowFn() - t0, items: results.length, url: "https://api.themoviedb.org", error: null };
        }).catch(function(err) {
          return { label: "tmdb", ok: false, ms: cfg.nowFn() - t0, items: 0, url: "https://api.themoviedb.org", error: String(err && err.message || err) };
        });
      }
      function healthCheck(cfg) {
        var now = cfg.nowFn();
        if (healthCache.data && now - healthCache.ts < 6e4)
          return Promise.resolve(healthCache.data);
        return Promise.all([
          checkSource(cfg, "pinoymovieshub", cfg.site + "/movies/", "pinoy"),
          checkSource(cfg, "myasiantv", cfg.matvSite + "/most-popular-drama/", "matv"),
          checkSource(cfg, "dramacool", cfg.dcSite + "/country/korean-drama", "dc"),
          checkTmdb(cfg)
        ]).then(function(results) {
          var sites = results.slice(0, 3);
          var tmdb = results[3];
          var sitesOk = 0;
          for (var i = 0; i < sites.length; i++) {
            if (sites[i].ok && sites[i].items > 0)
              sitesOk++;
          }
          var status = sitesOk === 0 ? "down" : sitesOk < 3 || !tmdb.ok || tmdb.items === 0 ? "degraded" : "ok";
          var hints = [];
          var runtimeBug = sitesOk === 0 && !!sites[0].error;
          if (runtimeBug) {
            for (var s = 1; s < sites.length; s++) {
              if ((sites[s].error || "") !== sites[0].error) {
                runtimeBug = false;
                break;
              }
            }
          }
          if (runtimeBug && /illegal invocation/i.test(sites[0].error)) {
            hints.push('Every probe crashes with "Illegal invocation: function called with incorrect `this` reference" - a worker-code bug (a native fn like fetch called unbound), NOT IP blocking. Redeploy with the fixed worker-bundle.js (asian-catalog v2.1.1+): paste it in the dashboard editor or run `npx wrangler deploy`.');
          } else if (runtimeBug) {
            hints.push("All probes fail with the identical error (" + sites[0].error + ") - that points at a bug in the deployed worker code rather than IP blocking. Redeploy the current worker-bundle.js from the repo, or point PINOYHUB_SITE / MYASIANTV_SITE / DRAMACOOL_SITE env vars at working mirrors.");
          } else if (sitesOk === 0) {
            hints.push("All three source sites are unreachable from this deployment - the hosting IP is likely blocked or region-locked. Redeploy the worker in another region or point PINOYHUB_SITE / MYASIANTV_SITE / DRAMACOOL_SITE env vars at working mirrors.");
          } else {
            for (var j = 0; j < sites.length; j++) {
              if (!sites[j].ok) {
                hints.push(sites[j].label + " unreachable (" + sites[j].error + ") - catalogs from this source error out; the others keep working. Set its *_SITE env var to a working mirror.");
              } else if (sites[j].items === 0) {
                hints.push(sites[j].label + " reachable but 0 items parsed - the site template changed or a challenge page was served; catalogs from this source may be empty.");
              }
            }
          }
          if (!tmdb.ok) {
            if (runtimeBug && /illegal invocation/i.test(tmdb.error || "")) {
            } else {
              hints.push("TMDB unreachable or key rejected (" + tmdb.error + ") - catalogs fall back to site-only rows (asian:* ids) that may not resolve for playback. Set your own v3 key via the TMDB_API_KEY secret.");
            }
          } else if (tmdb.items === 0) {
            hints.push("TMDB reachable but the probe search returned 0 results - check that TMDB_API_KEY is a valid v3 key.");
          }
          if (!hints.length)
            hints.push("All sources and TMDB reachable - if Nuvio still shows nothing, make sure the manifest URL you installed is THIS deployment (https://<worker>/manifest.json), not a GitHub/local path, and that the plugin manifest (repo manifest.json with PinoyMoviesHub + AsianHub) is installed for playback.");
          var data = {
            version: VERSION,
            addonId: ADDON_ID,
            status,
            healthy: status === "ok",
            sources: results,
            hints
          };
          healthCache.ts = now;
          healthCache.data = data;
          return data;
        });
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
          if (path === "/health" || path === "/health.json") {
            return healthCheck(cfg).then(function(h) {
              return json(h, h.status === "down" ? 503 : 200, 15);
            });
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
      var exported = {
        VERSION,
        ADDON_ID,
        makeConfig,
        manifest,
        handle,
        resetCaches,
        // test hooks
        parseListPage,
        parseMatvListPage,
        parseDcListPage,
        parseMatvJson,
        cleanTitleForSearch,
        cleanDisplayName,
        normalizeForCompare,
        titleScore,
        yearScore,
        pickBestTmdb,
        toMeta,
        buildUnmatchedMeta,
        unmatchedMetaId,
        tmdbDetails,
        healthCheck,
        slugifyGenre
      };
      global.AsianCatalogCore = exported;
      global.PinoyHubCatalogCore = exported;
    })(typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : exports);
  }
});

// addons/asian-catalog/worker.js
var import_core = __toESM(require_core());
var Core = globalThis.AsianCatalogCore;
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
