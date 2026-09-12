var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  try {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  } catch (e) {
    throw mod = 0, e;
  }
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
      var VERSION = "5.7.0";
      var ADDON_ID = "community.asian.catalog";
      var ADDON_NAME = "Asian Catalog";
      var PINOY_SITE_DEFAULT = "https://pinoymovieshub.win";
      var KISSASIAN_SITE_DEFAULT = "https://kissasian.cam";
      var VIEWASIAN_SITE_DEFAULT = "https://viewasian.lol";
      var ANIMO_SITE_DEFAULT = "https://animotvslash.org";
      var PENCURI_SITE_DEFAULT = "https://ww44.pencurimovie.baby";
      var KISSKH_HOSTS_DEFAULT = ["https://kisskh.nl", "https://kisskh.ovh", "https://kisskh.co"];
      var ANIKOTO_API_DEFAULT = "https://anikotoapi.site";
      var ANIKOTO_PER_PAGE = 50;
      var ANIKOTO_MAX_PAGES = 10;
      var JIKAN_API_DEFAULT = "https://api.jikan.moe/v4";
      var JIKAN_GAP_MS = 380;
      var META_CACHE_TTL = 30 * 60 * 1e3;
      var DEFAULT_TMDB_KEY = "439c478a771f35c05022f9feabcca01c";
      var PINOY_ICON = "/wp-content/uploads/2025/04/cropped-favicon-11-192x192.png";
      var KS_ICON = "/wp-content/uploads/2024/03/cropped-favicon-1-1-192x192.png";
      var VA_ICON = "/wp-content/uploads/2024/09/logo.png";
      var ANIMO_ICON = "/wp-content/uploads/2024/03/cropped-favicon-1-1-192x192.png";
      var UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36";
      var MOBILE_UA = "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Mobile Safari/537.36";
      var BASE_HEADERS = {
        "User-Agent": UA,
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9"
      };
      var JSON_HEADERS = {
        "User-Agent": UA,
        "Accept": "application/json,text/plain,*/*",
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
      var pageCache = /* @__PURE__ */ new Map();
      var resolvedCache = /* @__PURE__ */ new Map();
      var buffers = /* @__PURE__ */ new Map();
      var bufferInflight = /* @__PURE__ */ new Map();
      var metaCache = /* @__PURE__ */ new Map();
      var _jikanLastReq = 0;
      var tmdbInflight = /* @__PURE__ */ new Map();
      var CACHE_CAPS = { page: 250, resolved: 4e3, buffers: 120 };
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
      function makeConfig(env) {
        env = env || {};
        var limit = parseInt(env.ASIAN_PAGE_LIMIT, 10);
        var maxPages = parseInt(env.ASIAN_MAX_PAGES, 10);
        var fetchRef = env.__fetchFn;
        if (!fetchRef && typeof fetch === "function") {
          try {
            fetchRef = fetch.bind(global);
          } catch (e) {
            fetchRef = fetch;
          }
        }
        var khHosts = String(env.KISSKH_HOSTS || "").split(",").map(function(s) {
          return s.trim().replace(/\/+$/, "");
        }).filter(function(s) {
          return /^https?:\/\//.test(s);
        });
        if (!khHosts.length) khHosts = KISSKH_HOSTS_DEFAULT.slice();
        return {
          pinoySite: String(env.PINOY_SITE || PINOY_SITE_DEFAULT).replace(/\/+$/, ""),
          kissasianSite: String(env.KISSASIAN_SITE || KISSASIAN_SITE_DEFAULT).replace(/\/+$/, ""),
          viewasianSite: String(env.VIEWASIAN_SITE || VIEWASIAN_SITE_DEFAULT).replace(/\/+$/, ""),
          animoSite: String(env.ANIMO_SITE || ANIMO_SITE_DEFAULT).replace(/\/+$/, ""),
          pencuriSite: String(env.PENCURI_SITE || PENCURI_SITE_DEFAULT).replace(/\/+$/, ""),
          kisskhHosts: khHosts,
          anikotoApi: String(env.ANIKOTO_API || ANIKOTO_API_DEFAULT).replace(/\/+$/, ""),
          jikanApi: String(env.JIKAN_API || JIKAN_API_DEFAULT).replace(/\/+$/, ""),
          tmdbKey: String(env.TMDB_API_KEY || DEFAULT_TMDB_KEY),
          pageLimit: Math.min(Math.max(isFinite(limit) && limit > 0 ? limit : PAGE_LIMIT_DEFAULT, 5), 50),
          maxSitePages: isFinite(maxPages) && maxPages > 0 ? maxPages : MAX_SITE_PAGES_DEFAULT,
          keepUnmatched: env.ASIAN_KEEP_UNMATCHED !== "0",
          // fallback rows visible by default
          fetchFn: fetchRef || null,
          nowFn: env.__nowFn || (function() {
            return Date.now();
          })
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
          if (ENTITY_MAP[ent]) return ENTITY_MAP[ent];
          if (ent.charAt(0) === "#") {
            var num = parseInt(ent.substring(1), 10);
            if (isFinite(num) && num > 0 && num < 65536) return String.fromCharCode(num);
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
      function absoluteUrl(cfg, base, u) {
        u = String(u || "").trim();
        if (!u) return "";
        if (u.indexOf("//") === 0) return "https:" + u;
        if (/^https?:\/\//i.test(u)) return u;
        if (u.charAt(0) === "/") return base + u;
        return "";
      }
      function isPlaceholderPoster(u) {
        return /\/themes\/dooplay\/assets\/img\/no\//i.test(u || "") || /placehold\.co|placeholder/i.test(u || "");
      }
      function cleanPosterUrl(base, u) {
        u = absoluteUrl(null, base, u);
        if (!u || isPlaceholderPoster(u)) return "";
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
      var QUALIFIER_WORDS = /(tagalog|dubbed|english|taglish|full[\s-]*(movie|series|film)|hd[\s-]*cam|cam|audio|subbed|subtitle)/i;
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
        t = t.replace(/\(\s*\)|\[\s*\]|\{\s*\}/g, " ");
        t = collapseWs(t).replace(/^[\u2013\u2014:,-]+\s*/, "").trim();
        return t;
      }
      function cleanDisplayName(title) {
        var t = collapseWs(decodeEntities(title));
        t = t.replace(/^\s*ep(?:isode)?\s*\d+\s*[\u2013\u2014:-]\s*/i, "");
        t = t.replace(/^\s*\d+x\d+\s*[\u2013\u2014:-]\s*/, "");
        return t.substring(0, 120).trim();
      }
      function timeoutSignal(ms) {
        if (typeof AbortSignal !== "undefined" && typeof AbortSignal.timeout === "function") {
          return AbortSignal.timeout(ms || 12e3);
        }
        return void 0;
      }
      function fetchText(cfg, url, timeoutMs, headers) {
        if (!cfg.fetchFn) return Promise.reject(new Error("no fetch available"));
        var opts = { method: "GET", redirect: "follow", headers: headers || BASE_HEADERS };
        var sig = timeoutSignal(timeoutMs || 12e3);
        if (sig) opts.signal = sig;
        return Promise.resolve().then(function() {
          return cfg.fetchFn(url, opts);
        }).then(function(res) {
          if (!res.ok) throw new Error("HTTP " + res.status + " for " + url);
          return res.text();
        });
      }
      function fetchJson(cfg, url, timeoutMs) {
        if (!cfg.fetchFn) return Promise.reject(new Error("no fetch available"));
        var opts = { method: "GET", redirect: "follow", headers: JSON_HEADERS };
        var sig = timeoutSignal(timeoutMs || 12e3);
        if (sig) opts.signal = sig;
        return Promise.resolve().then(function() {
          return cfg.fetchFn(url, opts);
        }).then(function(res) {
          if (!res.ok) throw new Error("HTTP " + res.status + " for " + url);
          return res.json();
        });
      }
      function fetchTextWithRetry(cfg, url, timeoutMs) {
        return fetchText(cfg, url, timeoutMs).catch(function(err) {
          var msg = String(err && err.message || err);
          if (/HTTP (403|503)/.test(msg)) {
            return fetchText(cfg, url, timeoutMs, {
              "User-Agent": MOBILE_UA,
              "Accept": "text/html,application/xhtml+xml,*/*;q=0.8",
              "Accept-Language": "en-US,en;q=0.9",
              "Sec-Fetch-Mode": "navigate",
              "Sec-Fetch-Site": "none"
            }).catch(function(err2) {
              var msg2 = String(err2 && err2.message || err2);
              if (/HTTP (403|503)/.test(msg2)) {
                return fetchText(cfg, url, timeoutMs, {
                  "User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
                  "Accept": "text/html,application/xhtml+xml,*/*;q=0.8",
                  "Accept-Language": "en-US,en;q=0.9"
                });
              }
              throw err2;
            });
          }
          throw err;
        });
      }
      function fetchPageCached(cfg, url, parseFn) {
        var entry = pageCache.get(url);
        var now = cfg.nowFn();
        if (entry && now - entry.ts < PAGE_CACHE_TTL) {
          return Promise.resolve(entry.items);
        }
        return parseFn(cfg, url).then(function(items) {
          pageCache.set(url, { ts: now, items });
          cachePrune(pageCache, CACHE_CAPS.page);
          return items;
        }).catch(function(err) {
          if (entry && now - entry.ts < PAGE_CACHE_STALE) return entry.items;
          throw err;
        });
      }
      function mapLimited(arr, n, fn) {
        var out = new Array(arr.length);
        var i = 0;
        function worker() {
          return Promise.resolve().then(function loop() {
            if (i >= arr.length) return void 0;
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
        for (var w = 0; w < Math.min(n, arr.length); w++) workers.push(worker());
        return Promise.all(workers).then(function() {
          return out;
        });
      }
      function tmdbImg(size, path) {
        return path ? "https://image.tmdb.org/t/p/" + size + path : "";
      }
      function tmdbSearch(cfg, kind, query, year) {
        var url = "https://api.themoviedb.org/3/search/" + kind + "?api_key=" + encodeURIComponent(cfg.tmdbKey) + "&query=" + encodeURIComponent(query) + "&include_adult=false&page=1";
        if (year) url += kind === "movie" ? "&year=" + encodeURIComponent(year) : "&first_air_date_year=" + encodeURIComponent(year);
        return fetchJson(cfg, url).then(function(data) {
          if (!data || !Array.isArray(data.results)) return [];
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
        if (!siteNorm || !tmdbNorm) return 0;
        if (siteNorm === tmdbNorm) return 3;
        if (siteNorm.length >= 6 && tmdbNorm.indexOf(siteNorm) === 0) return 2.5;
        if (tmdbNorm.length >= 6 && siteNorm.indexOf(tmdbNorm) === 0) return 2.5;
        if (siteNorm.indexOf(tmdbNorm) !== -1 || tmdbNorm.indexOf(siteNorm) !== -1) return 2;
        var a = siteNorm.split(" ");
        var b = tmdbNorm.split(" ");
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
          if (!acceptable) continue;
          if (score > bestScore) {
            bestScore = score;
            best = c;
          }
        }
        return best;
      }
      function resolveTmdb(cfg, type, rawTitle, siteYear) {
        var cleaned = cleanTitleForSearch(rawTitle);
        if (!cleaned) return Promise.resolve(null);
        var key = type + "|" + normalizeForCompare(cleaned) + "|" + (siteYear || "");
        var now = cfg.nowFn();
        var hit = resolvedCache.get(key);
        if (hit) {
          var ttl = hit.value ? RESOLVED_TTL : RESOLVED_NULL_TTL;
          if (now - hit.ts < ttl) return Promise.resolve(hit.value);
          resolvedCache.delete(key);
        }
        var pending = tmdbInflight.get(key);
        if (pending) return pending;
        var kind = type === "movie" ? "movie" : "tv";
        var attempts = [{ q: cleaned, y: siteYear }, { q: cleaned, y: "" }];
        pending = (function run(idx) {
          if (idx >= attempts.length) return Promise.resolve(null);
          var at = attempts[idx];
          return tmdbSearch(cfg, kind, at.q, at.y).then(function(candidates) {
            var best = pickBestTmdb(candidates, cleaned, siteYear);
            if (best) return best;
            return run(idx + 1);
          });
        })(0).then(function(value) {
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
      var SOURCE_PREFIX = { ks: "ks", va: "va", pmh: "pmh", kh: "kh", an: "an", pen: "pen" };
      function fallbackIdTail(item) {
        var tail = "";
        if (item.sourceId !== void 0 && item.sourceId !== null && String(item.sourceId) !== "") {
          tail = String(item.sourceId);
        } else {
          tail = String(item.slug || "").trim();
          if (!tail && item.url) {
            tail = String(item.url).replace(/\/+$/, "").split("/").pop() || "";
            tail = tail.replace(/\.(html?|json)$/i, "");
          }
          if (!tail) tail = cleanDisplayName(item.title);
          tail = String(tail).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
        }
        var sp = SOURCE_PREFIX[item.source];
        if (sp && tail && tail.indexOf(sp + "-") !== 0) tail = sp + "-" + tail;
        return tail || "untitled";
      }
      function fallbackMeta(cfg, prefix, item) {
        var meta = {
          id: prefix + ":" + fallbackIdTail(item),
          type: item.type === "series" ? "series" : "movie",
          name: cleanDisplayName(item.title),
          posterShape: "poster"
        };
        var sitePoster = cleanPosterUrl(cfg.pinoySite, item.poster) || cleanPosterUrl(cfg.kissasianSite, item.poster) || cleanPosterUrl(cfg.viewasianSite, item.poster) || cleanPosterUrl(cfg.animoSite, item.poster) || (/^https?:\/\//i.test(String(item.poster || "")) && !isPlaceholderPoster(item.poster) ? item.poster : "");
        if (sitePoster) meta.poster = sitePoster;
        if (item.description) meta.description = item.description;
        if (item.year) meta.releaseInfo = String(item.year);
        var siteRating = parseFloat(item.rating);
        if (isFinite(siteRating) && siteRating > 0 && siteRating <= 10) {
          meta.imdbRating = Math.round(siteRating * 10) / 10;
        }
        return meta;
      }
      function toMeta(cfg, item, tmdb) {
        var type = item.type === "series" ? "series" : "movie";
        var name = cleanDisplayName(item.title);
        if (!name) return null;
        var sitePoster = cleanPosterUrl(cfg.pinoySite, item.poster) || cleanPosterUrl(cfg.kissasianSite, item.poster) || cleanPosterUrl(cfg.viewasianSite, item.poster) || cleanPosterUrl(cfg.animoSite, item.poster) || (/^https?:\/\//i.test(String(item.poster || "")) && !isPlaceholderPoster(item.poster) ? item.poster : "");
        if (tmdb) {
          var meta = {
            id: "tmdb:" + tmdb.id,
            type,
            name,
            poster: sitePoster || tmdbImg("w342", tmdb.poster),
            posterShape: "poster"
          };
          var bg = tmdbImg("w780", tmdb.backdrop);
          if (bg) meta.background = bg;
          if (tmdb.overview) meta.description = tmdb.overview;
          var rel = item.year || tmdb.year;
          if (rel) meta.releaseInfo = String(rel);
          var r = parseFloat(item.rating) || tmdb.rating || 0;
          if (r > 0) meta.imdbRating = Math.round(r * 10) / 10;
          return meta;
        }
        if (!cfg.keepUnmatched) return null;
        var fb = fallbackMeta(cfg, "asian", item);
        if (!fb.description && item.description) fb.description = item.description;
        return fb;
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
      function parseListPage(cfg, html) {
        var items = [];
        var seen = {};
        var re = /<article\b[^>]*>([\s\S]*?)<\/article>/g;
        var m;
        while ((m = re.exec(html)) !== null) {
          var body = m[1];
          var whole = m[0];
          var idMatch = whole.match(/id=["']post-([\w-]+?)["']/);
          var postId = idMatch ? idMatch[1] : "";
          if (postId.indexOf("featured-") === 0) continue;
          var img = body.match(/<img[^>]*>/i);
          var poster = img ? attr(img[0], "src") : "";
          var link = body.match(/href=["'](https?:\/\/[^"']+)["']/i);
          if (!link) continue;
          var url = decodeEntities(link[1]).replace(/[?#].*$/, "");
          if (!/\/(?:movies|series)\/[^/]+$/i.test(url)) continue;
          var kind = /\/movies\//i.test(url) ? "movie" : /\/series\//i.test(url) ? "series" : "";
          if (!kind) continue;
          var isSearchItem = /class=["']details["']/.test(body);
          var isArchiveItem = /^\d+$/.test(postId);
          if (!isSearchItem && !isArchiveItem) continue;
          var title = "";
          var th = body.match(/<h3[^>]*class=["'][^"']*title[^"']*["'][^>]*>([\s\S]*?)<\/h3>/i);
          if (th) title = stripTags(th[1]);
          if (!title) {
            var td = body.match(/<div[^>]*class=["']title["'][^>]*>\s*<a[^>]*>([\s\S]*?)<\/a>/i);
            if (td) title = stripTags(td[1]);
          }
          if (!title && img) {
            var alt = attr(img[0], "alt");
            if (alt) title = stripTags(decodeEntities(alt));
          }
          if (!title) continue;
          var year = "";
          var ym = body.match(/<span[^>]*>\s*((?:19|20)\d{2})\s*</);
          if (ym) year = ym[1];
          var desc = "";
          var dm = body.match(/<div[^>]*class=["']contenido["'][^>]*>\s*<p>([\s\S]*?)<\/p>/i);
          if (dm) desc = stripTags(dm[1]);
          var slug = url.replace(/\/+$/, "").split("/").pop() || "";
          if (seen[url]) continue;
          seen[url] = true;
          items.push({
            postId,
            slug,
            url,
            source: "pmh",
            type: kind,
            title: collapseWs(decodeEntities(title)),
            year,
            poster,
            description: desc
          });
        }
        return items;
      }
      function parseFeaturedCarousel(cfg, html) {
        var start = html.indexOf('id="featured-titles"');
        if (start === -1) return [];
        var end = html.indexOf("<h2>", start);
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
          var url = decodeEntities(link[1]).replace(/[?#].*$/, "");
          var kind = /\/movies\//i.test(url) ? "movie" : /\/series\//i.test(url) ? "series" : "";
          if (!kind) continue;
          var img = body.match(/<img[^>]*>/i);
          var poster = img ? attr(img[0], "src") : "";
          var title = "";
          var th = body.match(/<h3[^>]*>\s*<a[^>]*>([\s\S]*?)<\/a>/i);
          if (th) title = stripTags(th[1]);
          if (!title && img) title = stripTags(decodeEntities(attr(img[0], "alt") || ""));
          if (!title) continue;
          var year = "";
          var ym = body.match(/<span>\s*((?:19|20)\d{2})\s*<\/span>/i);
          if (ym) year = ym[1];
          var rating = "";
          var rm = body.match(/class=["']rating["']\s*>\s*([\d.]+)\s*</i);
          if (rm) rating = rm[1];
          if (seen[url]) continue;
          seen[url] = true;
          items.push({
            postId: "featured-" + postId,
            slug: url.replace(/\/+$/, "").split("/").pop() || "",
            url,
            source: "pmh",
            type: kind,
            title: collapseWs(decodeEntities(title)),
            year,
            poster,
            rating,
            description: ""
          });
        }
        return items;
      }
      function pinoyParseUrl(cfg, url) {
        return fetchTextWithRetry(cfg, url, 12e3).then(function(html) {
          if (/id=["']featured-titles["']/.test(html) && url.replace(/\/+$/, "") === cfg.pinoySite) {
            return parseFeaturedCarousel(cfg, html);
          }
          return parseListPage(cfg, html);
        });
      }
      function pinoyPageRaw(cfg, url, type) {
        return fetchPageCached(cfg, url, pinoyParseUrl).then(function(items) {
          var out = [];
          for (var i = 0; i < items.length; i++) {
            if (!type || items[i].type === type) out.push(items[i]);
          }
          return out;
        });
      }
      var PINOY_GENRE_SLUGS = {
        "rated r": "sexy",
        "wattpad presents": "wattpad"
      };
      function pinoyGenreSlug(label) {
        var s = String(label || "").toLowerCase().trim();
        if (PINOY_GENRE_SLUGS[s]) return PINOY_GENRE_SLUGS[s];
        return slugifyGenre(s);
      }
      function pinoyPageMetas(cfg, def, page, extras) {
        var url;
        var search = String(extras.search || "").trim();
        if (search) {
          url = page === 1 ? cfg.pinoySite + "/?s=" + encodeURIComponent(search) : cfg.pinoySite + "/page/" + page + "/?s=" + encodeURIComponent(search);
        } else if (def.mode === "genre" && extras.genre) {
          var slug = pinoyGenreSlug(extras.genre);
          url = page === 1 ? cfg.pinoySite + "/genre/" + slug : cfg.pinoySite + "/genre/" + slug + "/page/" + page;
        } else if (def.mode === "newreleases") {
          if (page > 1) return Promise.resolve([]);
          url = cfg.pinoySite + "/";
        } else if (def.mode === "featured") {
          url = page === 1 ? cfg.pinoySite + "/genre/featured" : cfg.pinoySite + "/genre/featured/page/" + page;
        } else if (def.mode === "coming-soon") {
          url = page === 1 ? cfg.pinoySite + "/genre/coming-soon" : cfg.pinoySite + "/genre/coming-soon/page/" + page;
        } else {
          var seg = def.type === "series" ? "/series" : "/movies";
          url = page === 1 ? cfg.pinoySite + seg + "/" : cfg.pinoySite + seg + "/page/" + page;
        }
        return pinoyPageRaw(cfg, url, def.type).then(function(items) {
          if (!items.length) return [];
          return resolveBatch(cfg, items);
        });
      }
      function ksParseListPage(cfg, html) {
        var items = [];
        var seen = {};
        var host = String(cfg.kissasianSite || "").replace(/^https?:\/\//, "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        var reHref = new RegExp('href="https?://' + host + '/(?:series/)?([a-z0-9-]+)/"', "i");
        var reSeries = new RegExp('href="https?://' + host + "/series/", "i");
        var re = /<article class="(?:bs|stylefor)"[^>]*>([\s\S]*?)<\/article>/g;
        var m;
        while ((m = re.exec(html)) !== null) {
          var body = m[1];
          var isSeriesRow = reSeries.test(body);
          var link = body.match(reHref);
          if (!link) continue;
          var slug = link[1];
          if (slug === "feed" || slug === "list-mode" || slug === "page") continue;
          var img = body.match(/<img[^>]*>/i);
          var poster = "";
          if (img) {
            poster = attr(img[0], "src") || attr(img[0], "data-original") || attr(img[0], "data-lazy-src");
          }
          var title = "";
          var tm = body.match(/title="([^"]+)"/i);
          if (tm) title = stripTags(decodeEntities(tm[1]));
          if (!title && img) {
            var alt = attr(img[0], "alt") || attr(img[0], "title");
            if (alt) title = stripTags(decodeEntities(alt));
          }
          if (!title) continue;
          var epm = slug.match(/^(.*)-episode-\d+$/);
          if (epm) {
            slug = epm[1];
            title = title.replace(/\s*[-\u2013\u2014]?\s*Episode\s*\d+.*$/i, "");
          }
          if (seen[slug]) continue;
          seen[slug] = true;
          items.push({
            slug,
            url: cfg.kissasianSite + "/series/" + slug + "/",
            source: "ks",
            type: "series",
            title: collapseWs(title),
            year: "",
            poster,
            description: ""
          });
        }
        return items;
      }
      function ksParseHotSection(cfg, html) {
        var start = html.indexOf("releases hothome");
        if (start === -1) start = html.indexOf("Hot Series Update");
        if (start === -1) return [];
        var end = html.indexOf('class="bixbox"', start + 10);
        if (end === -1) end = html.indexOf("Latest Release", start + 10);
        if (end === -1) end = html.length;
        var seg = html.substring(start, end);
        return ksParseListPage(cfg, seg);
      }
      function ksParseUrl(cfg, url) {
        return fetchTextWithRetry(cfg, url, 12e3).then(function(html) {
          return ksParseListPage(cfg, html);
        });
      }
      function ksPageRaw(cfg, url) {
        return fetchPageCached(cfg, url, ksParseUrl);
      }
      function ksPageMetas(cfg, def, page, extras) {
        var url;
        var search = String(extras.search || "").trim();
        if (search) {
          url = page === 1 ? cfg.kissasianSite + "/?s=" + encodeURIComponent(search) : cfg.kissasianSite + "/page/" + page + "/?s=" + encodeURIComponent(search);
        } else if (def.mode === "genre" && extras.genre) {
          var slug = slugifyGenre(extras.genre);
          url = cfg.kissasianSite + "/genres/" + slug + "/";
          return ksPageRaw(cfg, url).then(function(items) {
            return items.length ? resolveBatch(cfg, items) : [];
          }).catch(function() {
            return [];
          });
        } else if (def.mode === "hot") {
          if (page === 1) {
            return fetchPageCached(cfg, cfg.kissasianSite + "/home-hot", function(c, u) {
              return fetchTextWithRetry(c, cfg.kissasianSite + "/", 12e3).then(function(html) {
                return ksParseHotSection(c, html);
              });
            }).then(function(items) {
              if (!items.length) return [];
              return resolveBatch(cfg, items);
            });
          }
          url = cfg.kissasianSite + "/series/?status=&type=&order=update&page=" + (page - 1);
        } else {
          url = page === 1 ? cfg.kissasianSite + "/series/?status=&type=&order=update" : cfg.kissasianSite + "/series/?status=&type=&order=update&page=" + page;
        }
        return ksPageRaw(cfg, url).then(function(items) {
          if (!items.length) return [];
          return resolveBatch(cfg, items);
        });
      }
      function vaParseListPage(cfg, html) {
        var items = [];
        var seen = {};
        var host = String(cfg.viewasianSite || "").replace(/^https?:\/\//, "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        var re = new RegExp('<li>\\s*<a href="https?://' + host + '/(?:drama/)?([a-z0-9-]+)/"([^>]*)>([\\s\\S]*?)</li>', "g");
        var m;
        while ((m = re.exec(html)) !== null) {
          var isDramaRow = m[0].indexOf("/drama/") !== -1;
          var slug = m[1];
          var body = m[3];
          var img = body.match(/<img[^>]*>/i);
          if (!img) continue;
          var poster = attr(img[0], "data-original") || attr(img[0], "src");
          var title = attr(img[0], "title") || attr(img[0], "alt");
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
          var year = "";
          var ym = title.match(/\((19|20)\d{2}\)/);
          if (ym) year = ym[0].slice(1, -1);
          var epm = slug.match(/^(.*?)(?:-episode-\d+|-ep-\d+)(?:-[a-z0-9-]+)?$/);
          if (epm) {
            slug = epm[1];
            title = title.replace(/\s*[-\u2013\u2014]?\s*Episode\s*\d+.*$/i, "");
          } else if (slug.indexOf("movie") !== -1) {
            slug = slug.replace(/-(?:full-hd-)?movie$/, "");
            title = title.replace(/\s*[-\u2013\u2014]?\s*Full[\s-]*HD[\s-]*Movie.*$/i, "");
          } else if (!isDramaRow) {
            continue;
          }
          if (seen[slug]) continue;
          seen[slug] = true;
          items.push({
            slug,
            url: cfg.viewasianSite + "/drama/" + slug + "/",
            source: "va",
            type: "series",
            title: collapseWs(title),
            year,
            poster,
            description: ""
          });
        }
        return items;
      }
      function vaParseUrl(cfg, url) {
        return fetchTextWithRetry(cfg, url, 12e3).then(function(html) {
          return vaParseListPage(cfg, html);
        });
      }
      function vaPageRaw(cfg, url) {
        return fetchPageCached(cfg, url, vaParseUrl);
      }
      function vaPageMetas(cfg, def, page, extras) {
        var url;
        var search = String(extras.search || "").trim();
        if (search) {
          url = page === 1 ? cfg.viewasianSite + "/?s=" + encodeURIComponent(search) : cfg.viewasianSite + "/page/" + page + "/?s=" + encodeURIComponent(search);
        } else {
          url = page === 1 ? cfg.viewasianSite + "/" : cfg.viewasianSite + "/page/" + page + "/";
        }
        return vaPageRaw(cfg, url).then(function(items) {
          if (!items.length) return [];
          return resolveBatch(cfg, items);
        });
      }
      function animoParseListPage(cfg, html) {
        var items = [];
        var seen = {};
        var host = String(cfg.animoSite || "").replace(/^https?:\/\//, "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        var reHref = new RegExp('href="https?://' + host + '/(?:anime/)?([a-z0-9-]+)/"', "i");
        var reAnime = new RegExp('href="https?://' + host + "/anime/", "i");
        var re = /<article class="(?:bs|stylefor)"[^>]*>([\s\S]*?)<\/article>/g;
        var m;
        while ((m = re.exec(html)) !== null) {
          var body = m[1];
          var isSeriesRow = reAnime.test(body);
          var link = body.match(reHref);
          if (!link) continue;
          var slug = link[1];
          if (slug === "feed" || slug === "list-mode" || slug === "page") continue;
          var img = body.match(/<img[^>]*>/i);
          var poster = "";
          if (img) {
            poster = attr(img[0], "src") || attr(img[0], "data-original") || attr(img[0], "data-lazy-src");
          }
          var title = "";
          var tm = body.match(/title="([^"]+)"/i);
          if (tm) title = stripTags(decodeEntities(tm[1]));
          if (!title && img) {
            var alt = attr(img[0], "alt") || attr(img[0], "title");
            if (alt) title = stripTags(decodeEntities(alt));
          }
          if (!title) continue;
          var epm = slug.match(/^(.*)-episode-\d+$/);
          if (epm) {
            slug = epm[1];
            title = title.replace(/\s*[-\u2013\u2014]?\s*Episode\s*\d+.*$/i, "");
          }
          if (seen[slug]) continue;
          seen[slug] = true;
          items.push({
            slug,
            url: cfg.animoSite + "/anime/" + slug + "/",
            source: "an",
            type: "series",
            title: collapseWs(title),
            year: "",
            poster,
            description: ""
          });
        }
        return items;
      }
      function animoParseUrl(cfg, url) {
        return fetchTextWithRetry(cfg, url, 12e3).then(function(html) {
          return animoParseListPage(cfg, html);
        });
      }
      function animoPageRaw(cfg, url) {
        return fetchPageCached(cfg, url, animoParseUrl);
      }
      function animoPageMetas(cfg, def, page, extras) {
        var url;
        var search = String(extras.search || "").trim();
        if (search) {
          url = page === 1 ? cfg.animoSite + "/?s=" + encodeURIComponent(search) : cfg.animoSite + "/page/" + page + "/?s=" + encodeURIComponent(search);
        } else {
          url = page === 1 ? cfg.animoSite + "/anime/?status=&type=&order=update" : cfg.animoSite + "/anime/?status=&type=&order=update&page=" + page;
        }
        return animoPageRaw(cfg, url).then(function(items) {
          if (!items.length) return [];
          return resolveBatch(cfg, items);
        });
      }
      var PEN_SKIP_SLUGS = {
        feed: 1,
        "list-mode": 1,
        page: 1,
        "wp-json": 1,
        "request-movie": 1,
        genre: 1,
        country: 1,
        series: 1,
        movies: 1,
        episode: 1,
        release: 1,
        "release-year": 1,
        most: 1,
        top: 1,
        search: 1,
        tag: 1,
        profile: 1,
        login: 1,
        register: 1,
        notice: 1,
        dmca: 1,
        contact: 1,
        sitemap: 1
      };
      function penParseListPage(cfg, html) {
        var items = [];
        var seen = {};
        var host = String(cfg.pencuriSite || "").replace(/^https?:\/\//, "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        var reAnchor = new RegExp('<a href="https?://' + host + '/((?:series|movies)/)?([a-z0-9][a-z0-9-]*)/"[^>]*oldtitle="([^"]+)"', "i");
        var reEps = /class="mli-eps"[\s\S]{0,80}Eps\s*<i>\s*(\d+)/i;
        var reQuality = /class="mli-quality-text">([^<]+)</i;
        var chunks = String(html || "").split(/<div data-movie-id="\d+"[^>]*class="ml-item/);
        for (var i = 1; i < chunks.length; i++) {
          var body = chunks[i].length > 4e3 ? chunks[i].slice(0, 4e3) : chunks[i];
          var a = body.match(reAnchor);
          if (!a) continue;
          var hrefPrefix = a[1] ? a[1].replace(/\/+$/, "").toLowerCase() : "";
          var slug = a[2];
          if (PEN_SKIP_SLUGS[slug]) continue;
          var title = stripTags(decodeEntities(a[3] || ""));
          if (!title) continue;
          var year = "";
          var ym = title.match(/\s*\((\d{4})\)\s*$/);
          if (ym) {
            year = ym[1];
            title = title.replace(/\s*\((\d{4})\)\s*$/, "");
          } else {
            var sm = slug.match(/^(.*?)-(\d{4})$/);
            if (sm) year = sm[2];
          }
          var em = body.match(reEps);
          var qm = body.match(reQuality);
          var isSeries = hrefPrefix === "series" || !!em;
          var url = cfg.pencuriSite + (isSeries ? "/series/" + slug + "/" : "/" + slug + "/");
          if (seen[url]) continue;
          seen[url] = true;
          var img = body.match(/<img[^>]*>/i);
          var poster = "";
          if (img) poster = attr(img[0], "src") || attr(img[0], "data-original") || attr(img[0], "data-lazy-src") || "";
          if (poster && !/^https?:\/\//i.test(poster)) poster = "";
          items.push({
            slug,
            url,
            source: "pen",
            type: isSeries ? "series" : "movie",
            title: collapseWs(title),
            year,
            poster,
            description: "",
            rating: "",
            quality: qm ? collapseWs(stripTags(decodeEntities(qm[1]))) : "",
            episodes: em ? parseInt(em[1], 10) : 0
          });
        }
        return items;
      }
      function penParseUrl(cfg, url) {
        return fetchTextWithRetry(cfg, url, 12e3).then(function(html) {
          return penParseListPage(cfg, html);
        });
      }
      function penPageRaw(cfg, url) {
        return fetchPageCached(cfg, url, penParseUrl);
      }
      function penPageMetas(cfg, def, page, extras) {
        var url;
        var search = String(extras.search || "").trim();
        if (search) {
          url = page === 1 ? cfg.pencuriSite + "/?s=" + encodeURIComponent(search) : cfg.pencuriSite + "/page/" + page + "/?s=" + encodeURIComponent(search);
        } else {
          var path = String(def.penPath || "").replace(/\/+$/, "");
          url = page === 1 ? cfg.pencuriSite + "/" + path + "/" : cfg.pencuriSite + "/" + path + "/page/" + page + "/";
        }
        return penPageRaw(cfg, url).then(function(items) {
          var out = [];
          for (var i = 0; i < items.length; i++) {
            if (!def.penTyped || (def.type === "series" ? items[i].type === "series" : items[i].type !== "series")) out.push(items[i]);
          }
          if (!out.length) return [];
          return resolveBatch(cfg, out);
        });
      }
      var kisskhActiveHost = null;
      var kisskhRescueState = { engaged: false, ts: 0, catalog: "" };
      function kisskhMarkRescue(catalogId) {
        kisskhRescueState.engaged = true;
        kisskhRescueState.ts = Date.now();
        kisskhRescueState.catalog = String(catalogId || "");
      }
      var KISSKH_TMDB_RESCUE = {
        "kisskh-latest": { kind: "tv", path: "/trending/tv/week", q: "" },
        "kisskh-top-kdrama": { kind: "tv", path: "/discover/tv", q: "with_origin_country=KR&sort_by=popularity.desc&include_null_first_air_dates=false" },
        "kisskh-top-cdrama": { kind: "tv", path: "/discover/tv", q: "with_origin_country=CN|TW|HK&sort_by=popularity.desc&include_null_first_air_dates=false" },
        "kisskh-hollywood": { kind: "tv", path: "/discover/tv", q: "with_origin_country=US&sort_by=popularity.desc&include_null_first_air_dates=false" },
        "kisskh-hollywood-movies": { kind: "movie", path: "/discover/movie", q: "with_origin_country=US&sort_by=popularity.desc" },
        "kisskh-anime": { kind: "tv", path: "/discover/tv", q: "with_genres=16&with_origin_country=JP&sort_by=popularity.desc&include_null_first_air_dates=false" },
        "kisskh-upcoming": { kind: "tv", path: "/discover/tv", q: "with_origin_country=KR|CN|TW|HK&sort_by=popularity.desc&include_null_first_air_dates=false", upcoming: true }
      };
      function kisskhRescueUrl(cfg, spec, page) {
        var q = "api_key=" + encodeURIComponent(cfg.tmdbKey) + "&page=" + page;
        if (spec.upcoming) {
          var d = new Date(cfg.nowFn());
          var pad = function(n) {
            return (n < 10 ? "0" : "") + n;
          };
          q += "&first_air_date.gte=" + d.getUTCFullYear() + "-" + pad(d.getUTCMonth() + 1) + "-" + pad(d.getUTCDate());
        }
        if (spec.q) {
          q += "&" + spec.q.split("&").map(function(kv) {
            var eq = kv.indexOf("=");
            return eq === -1 ? kv : kv.substring(0, eq) + "=" + encodeURIComponent(kv.substring(eq + 1));
          }).join("&");
        }
        return "https://api.themoviedb.org/3" + spec.path + "?" + q;
      }
      function tmdbRowToMetaDirect(cfg, r, forcedKind) {
        if (!r || r.id === void 0 || r.id === null) return null;
        var type;
        if (forcedKind === "movie") type = "movie";
        else if (forcedKind === "tv") type = "series";
        else if (r.media_type === "movie") type = "movie";
        else if (r.media_type === "tv") type = "series";
        else return null;
        var name = r.name || r.title || r.original_name || r.original_title || "";
        if (!String(name).trim()) return null;
        var meta = {
          id: "tmdb:" + r.id,
          type,
          name: cleanDisplayName(name),
          poster: tmdbImg("w342", r.poster_path || ""),
          posterShape: "poster"
        };
        var bg = tmdbImg("w780", r.backdrop_path || "");
        if (bg) meta.background = bg;
        if (r.overview) meta.description = r.overview;
        var yr = String(r.release_date || r.first_air_date || "").split("-")[0];
        if (yr) meta.releaseInfo = yr;
        if (typeof r.vote_average === "number" && r.vote_average > 0) {
          meta.imdbRating = Math.round(r.vote_average * 10) / 10;
        }
        return meta;
      }
      function kisskhTmdbRescuePage(cfg, def, page, search) {
        var spec = search ? { kind: "", path: "/search/multi", q: "" } : KISSKH_TMDB_RESCUE[def.id] || null;
        if (!spec) return Promise.resolve([]);
        var url = kisskhRescueUrl(cfg, spec, search ? 1 : page);
        if (search) url += "&query=" + encodeURIComponent(search) + "&include_adult=false";
        return fetchJson(cfg, url, 12e3).then(function(data) {
          var rows = data && Array.isArray(data.results) ? data.results : [];
          var out = [];
          var seen = {};
          for (var i = 0; i < rows.length; i++) {
            var meta = tmdbRowToMetaDirect(cfg, rows[i], spec.kind || "");
            if (!meta || seen[meta.id]) continue;
            if (def.type === "movie" && meta.type !== "movie") continue;
            if (def.type === "series" && meta.type !== "series") continue;
            seen[meta.id] = true;
            out.push(meta);
          }
          if (out.length) kisskhMarkRescue(def.id);
          return out;
        });
      }
      function kisskhFetchJson(cfg, path) {
        var preferred = kisskhActiveHost ? [kisskhActiveHost] : [];
        var hosts = preferred.concat(cfg.kisskhHosts.filter(function(h) {
          return preferred.indexOf(h) === -1;
        }));
        function attempt(i) {
          if (i >= hosts.length) {
            return Promise.reject(new Error("all kisskh hosts failed (" + hosts.join(", ") + ")"));
          }
          return fetchJson(cfg, hosts[i] + path, 12e3).then(function(data) {
            kisskhActiveHost = hosts[i];
            return data;
          }).catch(function(err) {
            if (i + 1 < hosts.length) return attempt(i + 1);
            throw err;
          });
        }
        return attempt(0);
      }
      var KISSKH_SECTIONS = {
        "kisskh-latest": ["type=KC&sub=0&sort=latest", "type=K&sub=0&sort=latest"],
        "kisskh-top-kdrama": ["type=K&sub=0&sort=rate", "type=K&sub=0&sort=popular"],
        "kisskh-top-cdrama": ["type=C&sub=0&sort=rate", "type=C&sub=0&sort=popular"],
        "kisskh-hollywood": ["type=H&sub=0&sort=latest"],
        "kisskh-anime": ["type=A&sub=0&sort=latest"],
        "kisskh-upcoming": ["type=KC&sub=0&sort=latest&status=Upcoming", "type=KC&sub=0&sort=ongoing"]
      };
      function kisskhRowToItem(cfg, row) {
        if (!row || row.id === void 0 || row.id === null) return null;
        var title = String(row.title || "").trim();
        if (!title) return null;
        var poster = String(row.poster_path || "").trim();
        if (poster) {
          if (poster.indexOf("//") === 0) poster = "https:" + poster;
          else if (poster.charAt(0) === "/") {
            poster = (kisskhActiveHost || cfg.kisskhHosts[0]) + poster;
          }
        }
        return {
          source: "kh",
          sourceId: String(row.id),
          type: String(row.type || "") === "Movie" ? "movie" : "series",
          title: collapseWs(decodeEntities(title)),
          year: String(row.release_date || "").split("-")[0] || "",
          poster,
          rating: row.rate !== void 0 && row.rate !== null ? String(row.rate) : "",
          description: ""
        };
      }
      function kisskhListRaw(cfg, def, page) {
        var queries = KISSKH_SECTIONS[def.id] || ["type=KC&sub=0&sort=latest"];
        function run(idx) {
          if (idx >= queries.length) return Promise.resolve([]);
          var url = "/api/DramaList/List/" + page + "?" + queries[idx] + "&title=";
          return kisskhFetchJson(cfg, url).then(function(data) {
            var rows = data && Array.isArray(data.datas) ? data.datas : [];
            if (!rows.length && idx + 1 < queries.length) return run(idx + 1);
            return rows;
          }).catch(function(err) {
            if (idx + 1 < queries.length) return run(idx + 1);
            throw err;
          });
        }
        return run(0);
      }
      function kisskhSearchRaw(cfg, query) {
        var url = "/api/DramaList/Search?q=" + encodeURIComponent(query) + "&type=0";
        return kisskhFetchJson(cfg, url).then(function(list) {
          return Array.isArray(list) ? list : [];
        });
      }
      function kisskhItemsToMetas(cfg, rows, typeFilter) {
        var items = [];
        for (var i = 0; i < rows.length; i++) {
          var it = kisskhRowToItem(cfg, rows[i]);
          if (!it) continue;
          if (typeFilter === "movie" && it.type !== "movie") continue;
          if (typeFilter === "series" && it.type !== "series") continue;
          items.push(it);
        }
        if (!items.length) return Promise.resolve([]);
        return resolveBatch(cfg, items);
      }
      function kisskhPageMetas(cfg, def, page, extras) {
        var search = String(extras.search || "").trim();
        var listPromise;
        if (search) {
          listPromise = kisskhSearchRaw(cfg, search).then(function(rows) {
            return kisskhItemsToMetas(cfg, rows, def.type);
          });
        } else {
          listPromise = kisskhListRaw(cfg, def, page).then(function(rows) {
            return kisskhItemsToMetas(cfg, rows, def.type);
          });
        }
        return listPromise.catch(function() {
          return kisskhTmdbRescuePage(cfg, def, page, search).catch(function() {
            return [];
          });
        });
      }
      function anikotoFetchJson(cfg, path) {
        return fetchJson(cfg, cfg.anikotoApi + path, 12e3);
      }
      function anikotoFeedPage(cfg, page) {
        var url = cfg.anikotoApi + "/recent-anime?page=" + page + "&per_page=" + ANIKOTO_PER_PAGE;
        return fetchPageCached(cfg, url, function(c, u) {
          return fetchJson(c, u, 12e3).then(function(d) {
            return d && Array.isArray(d.data) ? d.data : [];
          });
        });
      }
      function anikotoRowToMeta(cfg, row) {
        var name = cleanDisplayName(row.title || row.titles || row.alternative || row.native);
        if (!name) return null;
        var animeId = null;
        var malId = parseInt(row.mal_id, 10);
        var aniId = parseInt(row.ani_id, 10);
        if (isFinite(malId) && malId > 0) animeId = "mal:" + malId;
        else if (isFinite(aniId) && aniId > 0) animeId = "anilist:" + aniId;
        else if (row.id) animeId = "anikoto:" + row.id;
        if (!animeId) return null;
        var meta = {
          id: animeId,
          type: "series",
          name,
          poster: /^https?:\/\//i.test(String(row.poster || "")) && !isPlaceholderPoster(row.poster) ? row.poster : void 0,
          posterShape: "poster",
          description: stripTags(row.description || "") || void 0,
          releaseInfo: row.year ? String(row.year) : void 0,
          status: row.status || void 0
        };
        var bg = /^https?:\/\//i.test(String(row.background_image || "")) ? row.background_image : void 0;
        if (bg) meta.background = bg;
        var score = parseFloat(row.score);
        if (isFinite(score) && score > 0 && score <= 10) meta.imdbRating = Math.round(score * 10) / 10;
        if (Array.isArray(row.terms_by_type && row.terms_by_type.genre)) meta.genres = row.terms_by_type.genre.slice(0, 6);
        return meta;
      }
      function anikotoPageMetas(cfg, def, page, extras) {
        if (page > ANIKOTO_MAX_PAGES) return Promise.resolve([]);
        var mode = def.mode || "latest";
        return anikotoFeedPage(cfg, page).then(function(rows) {
          var currentYear = (/* @__PURE__ */ new Date()).getFullYear();
          var out = [];
          if (mode === "newadded") rows = rows.slice().sort(function(a, b) {
            return (parseInt(b.id, 10) || 0) - (parseInt(a.id, 10) || 0);
          });
          for (var i = 0; i < rows.length; i++) {
            var r = rows[i];
            if (mode === "newrelease" && !(parseInt(r.year, 10) === currentYear && r.status === "Currently Airing")) continue;
            if (mode === "upcoming" && r.status !== "Not yet aired") continue;
            if (mode === "completed" && r.status !== "Finished Airing") continue;
            var meta = anikotoRowToMeta(cfg, r);
            if (meta) out.push(meta);
          }
          return out;
        });
      }
      function jikanGap() {
        var wait = _jikanLastReq + JIKAN_GAP_MS - Date.now();
        if (wait <= 0) {
          _jikanLastReq = Date.now();
          return Promise.resolve();
        }
        _jikanLastReq = Date.now() + wait;
        if (typeof setTimeout !== "function") return Promise.resolve();
        return new Promise(function(resolve) {
          setTimeout(resolve, wait);
        });
      }
      function metaCacheGet(cfg, key) {
        var hit = metaCache.get(key);
        if (hit && cfg.nowFn() - hit.ts < META_CACHE_TTL) return hit.meta;
        if (hit) metaCache.delete(key);
        return null;
      }
      function metaCacheSet(cfg, key, meta) {
        metaCache.set(key, { ts: cfg.nowFn(), meta });
        cachePrune(metaCache, 300);
      }
      function jikanLooksDown(d) {
        if (!d) return true;
        if (d.status === 500 || d.status === 502 || d.status === 503 || d.status === 504 || d.status === 429) return true;
        var sig = String(d && (d.message || d.error || d.type) || "");
        return /UpstreamException|timed out|timeout|rate.?limit/i.test(sig);
      }
      function jikanAnimeFull(cfg, malId) {
        function once() {
          return jikanGap().then(function() {
            return fetchJson(cfg, cfg.jikanApi + "/anime/" + encodeURIComponent(malId), 12e3);
          }).then(function(d) {
            return !d || jikanLooksDown(d) ? null : d.data ? d.data : null;
          });
        }
        function failSoft() {
          return Promise.resolve(null);
        }
        return once().then(function(a) {
          if (a) return a;
          return jikanGap().then(function() {
            return once();
          }).then(function(a2) {
            return a2 || null;
          }).catch(failSoft);
        }).catch(function() {
          return jikanGap().then(function() {
            return once();
          }).then(function(a2) {
            return a2 || null;
          }).catch(failSoft);
        });
      }
      function jikanEpisodePage(cfg, malId, page) {
        return jikanGap().then(function() {
          return fetchJson(cfg, cfg.jikanApi + "/anime/" + encodeURIComponent(malId) + "/episodes?page=" + page, 12e3);
        }).then(function(d) {
          if (!d || jikanLooksDown(d)) return [];
          return d.data && Array.isArray(d.data) ? d.data : [];
        }).catch(function() {
          return [];
        });
      }
      var ANIKOTO_META_PAGES = 6;
      var ANIKOTO_MAP_TTL = 30 * 60 * 1e3;
      var _anikotoByMal = null;
      var _anikotoByMalTs = 0;
      var _anikotoByMalInflight = null;
      function anikotoByMalMap(cfg) {
        var now = cfg.nowFn();
        if (_anikotoByMal && now - _anikotoByMalTs < ANIKOTO_MAP_TTL) return Promise.resolve(_anikotoByMal);
        if (_anikotoByMalInflight) return _anikotoByMalInflight;
        var pages = [];
        for (var p = 1; p <= ANIKOTO_META_PAGES; p++) {
          pages.push(anikotoFeedPage(cfg, p).catch(function() {
            return [];
          }));
        }
        _anikotoByMalInflight = Promise.all(pages).then(function(all) {
          var map = {};
          all.forEach(function(rows) {
            (rows || []).forEach(function(r) {
              var m = parseInt(r && r.mal_id, 10);
              if (isFinite(m) && m > 0 && r.id) map[m] = String(r.id);
            });
          });
          _anikotoByMal = map;
          _anikotoByMalTs = cfg.nowFn();
          _anikotoByMalInflight = null;
          return map;
        }).catch(function() {
          _anikotoByMalInflight = null;
          return {};
        });
        return _anikotoByMalInflight;
      }
      function metaForMal(cfg, malId, reqType) {
        var key = "mal:" + malId;
        var cached = metaCacheGet(cfg, key);
        if (cached) return Promise.resolve(cached);
        return Promise.all([
          jikanAnimeFull(cfg, malId),
          anikotoByMalMap(cfg).then(function(map) {
            var aid = map[parseInt(malId, 10)];
            if (!aid) return null;
            return anikotoFetchJson(cfg, "/series/" + encodeURIComponent(aid)).then(function(d) {
              return d && d.data ? d.data : null;
            }).catch(function() {
              return null;
            });
          }).catch(function() {
            return null;
          })
        ]).then(function(parts) {
          var a = parts[0];
          var sData = parts[1];
          var sa = sData && sData.anime ? sData.anime : null;
          var aName = a ? a.title_english || a.title : "";
          var saName = sa ? cleanDisplayName(sa.title || sa.titles || sa.alternative || sa.native) : "";
          if (!aName && !saName || !a && !sa) return null;
          var isMovie = a ? String(a.type || "").toLowerCase() === "movie" : false;
          var meta = {
            id: key,
            type: "series",
            name: aName || saName,
            posterShape: "poster"
          };
          var jikanPoster = a && a.images && a.images.jpg ? a.images.jpg.large_image_url || a.images.jpg.image_url : void 0;
          var aniPoster = sa && /^https?:\/\//i.test(String(sa.poster || "")) && !isPlaceholderPoster(sa.poster) ? sa.poster : void 0;
          meta.poster = jikanPoster || aniPoster || void 0;
          var jikanDesc = a && a.synopsis ? String(a.synopsis).replace(/\[Written by MAL Rewrite\]\s*$/i, "").trim() : "";
          meta.description = jikanDesc || (sa ? stripTags(sa.description || "") : "") || void 0;
          var jikanYear = a ? a.year ? String(a.year) : a.aired && a.aired.from ? String(a.aired.from).split("-")[0] : void 0 : void 0;
          meta.releaseInfo = jikanYear || (sa && sa.year ? String(sa.year) : void 0);
          meta.status = a && a.status || sa && sa.status || void 0;
          if (a && a.duration) meta.runtime = String(a.duration).replace(/^per ep\s*/i, "");
          var jikanScore = a ? parseFloat(a.score) : NaN;
          var aniScore = sa ? parseFloat(sa.score) : NaN;
          var score = isFinite(jikanScore) && jikanScore > 0 ? jikanScore : isFinite(aniScore) && aniScore > 0 && aniScore <= 10 ? Math.round(aniScore * 10) / 10 : void 0;
          if (score) meta.imdbRating = score;
          var genres = a && Array.isArray(a.genres) && a.genres.length ? a.genres.map(function(g) {
            return g.name;
          }) : sa && sa.terms_by_type && Array.isArray(sa.terms_by_type.genre) ? sa.terms_by_type.genre : [];
          if (genres.length) meta.genres = genres.slice(0, 6);
          var bg = a && a.trailer && a.trailer.images && a.trailer.images.maximum_image_url || (sa && /^https?:\/\//i.test(String(sa.background_image || "")) ? sa.background_image : void 0);
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
                  id: key + ":1:" + anum,
                  title: aep.title || "Episode " + anum,
                  season: 1,
                  episode: anum,
                  released: aep.updated_at ? aep.updated_at : null
                });
              }
              aniVideos.sort(function(x, y) {
                return x.episode - y.episode;
              });
              if (aniVideos.length) {
                meta.videos = aniVideos;
                metaCacheSet(cfg, key, meta);
                return meta;
              }
            }
            var pagePromises = [jikanEpisodePage(cfg, malId, 1), jikanEpisodePage(cfg, malId, 2), jikanEpisodePage(cfg, malId, 3)];
            return Promise.all(pagePromises).then(function(pages) {
              var videos = [];
              var n = 0;
              for (var p = 0; p < pages.length; p++) {
                for (var i = 0; i < pages[p].length; i++) {
                  n++;
                  var ep = pages[p][i] || {};
                  videos.push({
                    id: key + ":1:" + n,
                    title: ep.title || "Episode " + n,
                    season: 1,
                    episode: n,
                    released: ep.aired ? ep.aired : null
                  });
                }
              }
              if (videos.length) meta.videos = videos;
              else {
                var countHint = a && a.episodes ? parseInt(a.episodes, 10) : sa && sa.episodes ? parseInt(sa.episodes, 10) : 0;
                if (countHint > 0) {
                  var max = Math.min(countHint, 300);
                  for (var k = 1; k <= max; k++) {
                    videos.push({ id: key + ":1:" + k, title: "Episode " + k, season: 1, episode: k, released: null });
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
        var key = "anikoto:" + anikotoId;
        var cached = metaCacheGet(cfg, key);
        if (cached) return Promise.resolve(cached);
        return anikotoFetchJson(cfg, "/series/" + encodeURIComponent(anikotoId)).then(function(d) {
          var data = d && d.data ? d.data : null;
          var a = data && data.anime ? data.anime : null;
          if (!a || !a.title) return null;
          var meta = {
            id: key,
            type: "series",
            name: cleanDisplayName(a.title),
            poster: /^https?:\/\//i.test(String(a.poster || "")) ? a.poster : void 0,
            posterShape: "poster",
            description: stripTags(a.description || "") || void 0,
            releaseInfo: a.year ? String(a.year) : void 0,
            status: a.status || void 0
          };
          var bg = /^https?:\/\//i.test(String(a.background_image || "")) ? a.background_image : void 0;
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
              id: key + ":1:" + num,
              title: ep.title || "Episode " + num,
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
      function parseAsianMetaId(rawId) {
        var s = String(rawId || "").trim();
        if (s.indexOf("%") >= 0) {
          try {
            var d = decodeURIComponent(s);
            if (d) s = d;
          } catch (e) {
          }
          s = String(s).trim();
        }
        s = s.replace(/\.json$/i, "").replace(/(:\d+)+$/, "").trim();
        var m = s.match(/^asian[:\/]([a-z0-9][a-z0-9-]*)$/i);
        if (!m) return null;
        var tail = m[1].toLowerCase();
        var pm = tail.match(/^(pmh|pen)-([a-z0-9][a-z0-9-]*)$/);
        if (pm) return { source: pm[1], slug: pm[2] };
        return null;
      }
      function pmhDetailHtml(cfg, kind, slug) {
        function prim() {
          return fetchTextWithRetry(cfg, cfg.pinoySite + (kind === "series" ? "/series/" : "/movies/") + slug, 12e3);
        }
        function alt() {
          return fetchTextWithRetry(cfg, cfg.pinoySite + (kind === "series" ? "/movies/" : "/series/") + slug, 12e3);
        }
        return prim().then(function(html) {
          if (html && /<h1[ >]/i.test(html)) return { html, kind };
          return alt().then(function(html2) {
            return html2 && /<h1[ >]/i.test(html2) ? { html: html2, kind: kind === "series" ? "movie" : "series" } : null;
          });
        }).catch(function() {
          return alt().then(function(html2) {
            return html2 && /<h1[ >]/i.test(html2) ? { html: html2, kind: kind === "series" ? "movie" : "series" } : null;
          }).catch(function() {
            return null;
          });
        });
      }
      function pmhParseDetail(cfg, html, kind, slug) {
        var hm = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
        var name = hm ? collapseWs(stripTags(decodeEntities(hm[1]))) : "";
        if (!name) return null;
        var meta = {
          id: "asian:pmh-" + slug,
          type: kind,
          name,
          posterShape: "poster"
        };
        var pp = html.match(/<div class="poster">\s*<img[^>]*>/i);
        if (pp) {
          var poster = attr(pp[0], "src") || attr(pp[0], "data-src") || "";
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
        if (kind === "series") {
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
            var epTitle = am2 ? collapseWs(stripTags(decodeEntities(am2[2]))) : "";
            var dte = chunks[i].match(/class=['"]date['"][^>]*>([^<]*)</i);
            videos.push({
              id: "asian:pmh-" + slug + ":" + s + ":" + e,
              title: epTitle || "Episode " + e,
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
        var kind = wantSeries ? "series" : "movie";
        var key = "asian:pmh-" + slug;
        var cached = metaCacheGet(cfg, key);
        if (cached) return Promise.resolve(cached);
        return pmhDetailHtml(cfg, kind, slug).then(function(hit) {
          if (!hit) return null;
          var meta = pmhParseDetail(cfg, hit.html, hit.kind, slug);
          if (meta) metaCacheSet(cfg, key, meta);
          return meta;
        }).catch(function() {
          return null;
        });
      }
      function penDetailHtml(cfg, kind, slug) {
        function prim() {
          return fetchTextWithRetry(cfg, cfg.pencuriSite + (kind === "series" ? "/series/" : "/") + slug + "/", 12e3);
        }
        function alt() {
          return fetchTextWithRetry(cfg, cfg.pencuriSite + (kind === "series" ? "/" : "/series/") + slug + "/", 12e3);
        }
        return prim().then(function(html) {
          if (html && /og:title/i.test(html)) return { html, kind };
          return alt().then(function(html2) {
            return html2 && /og:title/i.test(html2) ? { html: html2, kind: kind === "series" ? "movie" : "series" } : null;
          });
        }).catch(function() {
          return alt().then(function(html2) {
            return html2 && /og:title/i.test(html2) ? { html: html2, kind: kind === "series" ? "movie" : "series" } : null;
          }).catch(function() {
            return null;
          });
        });
      }
      function penParseDetail(cfg, html, kind, slug) {
        var tm = html.match(/property=["']og:title["'] content=["']([^"']+)["']/i) || html.match(/<title>([^<]*)<\/title>/i);
        var raw = tm ? collapseWs(stripTags(decodeEntities(tm[1]))) : "";
        raw = raw.replace(/\s*-\s*Pencuri Movie.*$/i, "").trim();
        if (!raw) return null;
        var name = raw, year = "";
        var ym = raw.match(/\s*\((\d{4})\)\s*$/);
        if (ym) {
          year = ym[1];
          name = raw.replace(/\s*\((\d{4})\)\s*$/, "").trim();
        }
        var meta = {
          id: "asian:pen-" + slug,
          type: kind,
          name,
          posterShape: "poster"
        };
        if (year) meta.releaseInfo = year;
        var im = html.match(/property=["']og:image["'] content=["']([^"']+)["']/i);
        if (im && /^https?:\/\//i.test(im[1]) && !isPlaceholderPoster(im[1])) meta.poster = im[1];
        var dm = html.match(/property=["']og:description["'] content=["']([^"']*)["']/i);
        if (dm && dm[1]) meta.description = collapseWs(decodeEntities(dm[1])).slice(0, 700);
        if (kind === "series") {
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
              id: "asian:pen-" + slug + ":" + s + ":" + e,
              title: "Episode " + e,
              season: s,
              episode: e,
              released: null
            });
          }
          videos.sort(function(x, y) {
            return x.season - y.season || x.episode - y.episode;
          });
          if (videos.length) meta.videos = videos;
        }
        return meta;
      }
      function metaForPen(cfg, slug, wantSeries) {
        var kind = wantSeries ? "series" : "movie";
        var key = "asian:pen-" + slug;
        var cached = metaCacheGet(cfg, key);
        if (cached) return Promise.resolve(cached);
        return penDetailHtml(cfg, kind, slug).then(function(hit) {
          if (!hit) return null;
          var meta = penParseDetail(cfg, hit.html, hit.kind, slug);
          if (meta) metaCacheSet(cfg, key, meta);
          return meta;
        }).catch(function() {
          return null;
        });
      }
      function addonMeta(cfg, type, rawId) {
        var id = String(rawId || "").trim();
        var mm = id.match(/^(mal|anikoto):(\d+)$/i);
        if (mm) {
          var prefix = mm[1].toLowerCase();
          var num = mm[2];
          if (prefix === "mal") return metaForMal(cfg, num, type);
          return metaForAnikoto(cfg, num);
        }
        var am = parseAsianMetaId(id);
        if (am) {
          var wantSeries = String(type || "").toLowerCase() === "series" || String(type || "").toLowerCase() === "tv";
          if (am.source === "pmh") return metaForPmh(cfg, am.slug, wantSeries);
          return metaForPen(cfg, am.slug, wantSeries);
        }
        return Promise.resolve(null);
      }
      function bufferStateKey(cfg, kind, ident) {
        return kind + "|" + ident;
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
      function runBuffered(cfg, stateKey, pageMetasFn, skip, limit) {
        var existing = bufferInflight.get(stateKey);
        if (existing) return existing;
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
            var fetchPage = pageMetasFn(page);
            var safeFetch = fetchPage.catch(function() {
              return null;
            });
            return safeFetch.then(function(metas) {
              if (page === 1) {
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
      var KS_GENRE_CHIPS = ["Fantasy", "Friendship", "Law", "Romance", "Sports"];
      function catalogDefinitions() {
        return [
          // --- Pinoy Movies Hub (pinoymovieshub.win) — Movies + Series ---
          // (user list 2026-09-12: the site's own /movies and /series archives,
          //  paginated /movies/page/N/ + /series/page/N/)
          {
            type: "movie",
            id: "pinoy-movies",
            name: "Pinoy Movies",
            source: "pinoy",
            mode: "archive",
            description: "Movies on pinoymovieshub.win",
            extra: [{ name: "search" }, { name: "skip" }]
          },
          {
            type: "series",
            id: "pinoy-series",
            name: "Pinoy Series",
            source: "pinoy",
            mode: "archive",
            description: "Series on pinoymovieshub.win (teleseryes, Tagalog-dubbed shows)",
            extra: [{ name: "search" }, { name: "skip" }]
          },
          // --- KissAsian (kissasian.cam) — 3 catalogs ---
          {
            type: "series",
            id: "asian-series-hot",
            name: "KissAsian Hot Series Update",
            source: "kissasian",
            mode: "hot",
            description: "Hot Series Update \u2014 the hot block on kissasian.cam",
            extra: [{ name: "search" }, { name: "skip" }]
          },
          {
            type: "series",
            id: "asian-series",
            name: "KissAsian Latest Release",
            source: "kissasian",
            mode: "archive",
            description: "Latest Release \u2014 newest drama updates on kissasian.cam",
            extra: [{ name: "search" }, { name: "skip" }]
          },
          {
            type: "series",
            id: "asian-series-genre",
            name: "KissAsian by Genre",
            source: "kissasian",
            mode: "genre",
            description: "Recommendation tabs on kissasian.cam",
            extra: [{ name: "genre", options: KS_GENRE_CHIPS.slice() }, { name: "skip" }]
          },
          // --- ViewAsian (viewasian.lol) — 1 catalog ---
          {
            type: "series",
            id: "asian-series-viewasian",
            name: "ViewAsian Recently Drama, Movie and Kshow",
            source: "viewasian",
            mode: "archive",
            description: "Recently Drama, Movie and Kshow \u2014 the recent list on viewasian.lol",
            extra: [{ name: "search" }, { name: "skip" }]
          },
          // --- KissKH (kisskh.nl/ovh/co API) — 7 catalogs ---
          {
            type: "series",
            id: "kisskh-latest",
            name: "KissKH Latest Update",
            source: "kisskh",
            mode: "list",
            description: "Latest Update on kisskh (K-drama + C-drama API list)",
            extra: [{ name: "search" }, { name: "skip" }]
          },
          {
            type: "series",
            id: "kisskh-top-kdrama",
            name: "KissKH Top K-Drama",
            source: "kisskh",
            mode: "list",
            description: "Top K-Drama on kisskh (rated)",
            extra: [{ name: "search" }, { name: "skip" }]
          },
          {
            type: "series",
            id: "kisskh-top-cdrama",
            name: "KissKH Top C-Drama",
            source: "kisskh",
            mode: "list",
            description: "Top C-Drama on kisskh (rated)",
            extra: [{ name: "search" }, { name: "skip" }]
          },
          {
            type: "series",
            id: "kisskh-hollywood",
            name: "KissKH Hollywood",
            source: "kisskh",
            mode: "list",
            description: "Hollywood series on kisskh",
            extra: [{ name: "search" }, { name: "skip" }]
          },
          {
            type: "movie",
            id: "kisskh-hollywood-movies",
            name: "KissKH Hollywood Movies",
            source: "kisskh",
            mode: "list",
            description: "Hollywood movies on kisskh",
            extra: [{ name: "search" }, { name: "skip" }]
          },
          {
            type: "series",
            id: "kisskh-anime",
            name: "KissKH Anime",
            source: "kisskh",
            mode: "list",
            description: "Anime on kisskh",
            extra: [{ name: "search" }, { name: "skip" }]
          },
          {
            type: "series",
            id: "kisskh-upcoming",
            name: "KissKH Upcoming",
            source: "kisskh",
            mode: "list",
            description: "Upcoming dramas on kisskh",
            extra: [{ name: "skip" }]
          },
          // --- AnimeTVSlash (animotvslash.org) — 1 catalog ---
          {
            type: "series",
            id: "animo-latest",
            name: "AnimeTVSlash Latest Release",
            source: "animo",
            mode: "archive",
            description: "Latest Release \u2014 newest anime updates on animotvslash.org",
            extra: [{ name: "search" }, { name: "skip" }]
          },
          // --- Pencuri (pencurimovie.baby) — Movies + Series (user list
          //     2026-09-12: the site's own /movies/ and /series/ listings;
          //     rows typed individually from the /series/ href prefix or the
          //     site's mli-eps badge) ---
          {
            type: "movie",
            id: "pencuri-movies",
            name: "Pencuri Movies",
            source: "pencuri",
            mode: "list",
            penPath: "movies",
            penTyped: true,
            description: "Movies on pencurimovie.baby",
            extra: [{ name: "search" }, { name: "skip" }]
          },
          {
            type: "series",
            id: "pencuri-series",
            name: "Pencuri Series",
            source: "pencuri",
            mode: "list",
            penPath: "series",
            penTyped: true,
            description: "Series on pencurimovie.baby",
            extra: [{ name: "search" }, { name: "skip" }]
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
            type: "movie",
            id: "pencuri-malaysia",
            name: "Pencuri Malaysia",
            source: "pencuri",
            mode: "list",
            penPath: "country/malaysia",
            description: "Malaysia section on pencurimovie.baby",
            extra: [{ name: "search" }, { name: "skip" }]
          },
          {
            type: "movie",
            id: "pencuri-indonesia",
            name: "Pencuri Indonesia",
            source: "pencuri",
            mode: "list",
            penPath: "country/indonesia",
            description: "Indonesia section on pencurimovie.baby",
            extra: [{ name: "search" }, { name: "skip" }]
          },
          {
            type: "movie",
            id: "pencuri-japan",
            name: "Pencuri Japan",
            source: "pencuri",
            mode: "list",
            penPath: "country/japan",
            description: "Japan section on pencurimovie.baby",
            extra: [{ name: "search" }, { name: "skip" }]
          },
          {
            type: "movie",
            id: "pencuri-thailand",
            name: "Pencuri Thailand",
            source: "pencuri",
            mode: "list",
            penPath: "country/thailand",
            description: "Thailand section on pencurimovie.baby",
            extra: [{ name: "search" }, { name: "skip" }]
          },
          {
            type: "movie",
            id: "pencuri-most-viewed",
            name: "Pencuri Most Viewed",
            source: "pencuri",
            mode: "list",
            penPath: "most-viewed",
            description: "Most viewed on pencurimovie.baby",
            extra: [{ name: "search" }, { name: "skip" }]
          },
          {
            type: "movie",
            id: "pencuri-most-rating",
            name: "Pencuri Most Rating",
            source: "pencuri",
            mode: "list",
            penPath: "most-rating",
            description: "Most rating on pencurimovie.baby",
            extra: [{ name: "search" }, { name: "skip" }]
          },
          {
            type: "movie",
            id: "pencuri-top-imdb",
            name: "Pencuri Top IMDb",
            source: "pencuri",
            mode: "list",
            penPath: "top-imdb",
            description: "Top IMDb on pencurimovie.baby",
            extra: [{ name: "search" }, { name: "skip" }]
          },
          // --- Anikoto API (anikotoapi.site) — 5 catalogs (user list 2026-09-11;
          //     rows carry mal:/anilist:/anikoto: ids the paired plugins use) ---
          {
            type: "series",
            id: "anikoto-latest-episode",
            name: "Anikoto Latest Episode",
            source: "anikoto",
            mode: "latest",
            description: "Latest Episode \u2014 the daily episode-update feed of the Anikoto/HiAnime library (MegaPlay-backed playback)",
            extra: [{ name: "skip" }]
          },
          {
            type: "series",
            id: "anikoto-new-release",
            name: "Anikoto New Release",
            source: "anikoto",
            mode: "newrelease",
            description: "New Release \u2014 current-year anime currently airing on the Anikoto library",
            extra: [{ name: "skip" }]
          },
          {
            type: "series",
            id: "anikoto-new-added",
            name: "Anikoto New Added",
            source: "anikoto",
            mode: "newadded",
            description: "New Added \u2014 most recently added series on the Anikoto library",
            extra: [{ name: "skip" }]
          },
          {
            type: "series",
            id: "anikoto-upcoming",
            name: "Anikoto Upcoming Anime",
            source: "anikoto",
            mode: "upcoming",
            description: "Upcoming Anime \u2014 not-yet-aired entries on the Anikoto library",
            extra: [{ name: "skip" }]
          },
          {
            type: "series",
            id: "anikoto-just-completed",
            name: "Anikoto Just Completed",
            source: "anikoto",
            mode: "completed",
            description: "Just Completed \u2014 recently finished anime on the Anikoto library",
            extra: [{ name: "skip" }]
          }
        ];
      }
      function manifest(cfg) {
        return {
          id: ADDON_ID,
          version: VERSION,
          name: ADDON_NAME,
          description: "Asian catalogs mirroring each site's real sections: pinoymovieshub.win (Movies / Series), kissasian.cam, viewasian.lol, kisskh API (auto-rescued from TMDB when CF-blocked), animotvslash.org, the Anikoto API (Latest Episode / New Release / New Added / Upcoming Anime / Just Completed) and pencurimovie.baby (Movies / Series / Malaysia / Indonesia / Japan / Thailand / Most Viewed / Most Rating / Top IMDb). v5.0.0: anime rows carry ANIME ids \u2014 mal:/anilist:/anikoto: \u2014 straight from the Anikoto feed (MegaPlay-backed playback via the paired miruro plugin), plus a /meta resource (Jikan/Anikoto) so anime ids open full details with episode lists. v5.3.0: pmh/pen rows open real detail-page meta (episodes included) so no row ever 404s on details. v5.4.0: the Pencuri country and feature boards are back. Other rows carry full TMDB metadata or source-scoped asian: fallback ids. v5.5.0: catalog layout restored to the 28-catalog set validated on 4.15.0; the paired pencuri.js v1.4.0 adds English subtitles to every stream row. v5.6.0: new POST /cjg route \u2014 a text-safe relay for cinejoy.js v1.5.0 (NuvioMobile cannot send the binary body cinejoy's API requires; the worker performs the binary hop and returns bytes as base64url text). v5.7.0: new POST /cjs route \u2014 the ENTIRE cinejoy chain (enc -> /g -> dec) runs server-side and returns final stream JSON for cinejoy.js v1.6.0's one-request full lane.",
          logo: cfg.pinoySite + PINOY_ICON,
          resources: ["catalog", "meta"],
          types: ["movie", "series"],
          idPrefixes: ["tmdb:", "asian:", "mal:", "anikoto:"],
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
      function timeProbe(fn) {
        var t0 = Date.now();
        return fn().then(function(r) {
          r.ms = Date.now() - t0;
          return r;
        }, function(err) {
          return { ok: false, ms: Date.now() - t0, items: 0, error: String(err && err.message || err) };
        });
      }
      function healthReport(cfg) {
        var probes = [
          ["pinoymovieshub", timeProbe(function() {
            return pinoyPageRaw(cfg, cfg.pinoySite + "/movies/", "movie").then(function(items) {
              return { ok: items.length > 0, items: items.length, error: items.length ? void 0 : "parsed 0 items (site markup changed?)" };
            });
          })],
          ["kissasian", timeProbe(function() {
            return ksPageRaw(cfg, cfg.kissasianSite + "/series/?status=&type=&order=update").then(function(items) {
              return { ok: items.length > 0, items: items.length, error: items.length ? void 0 : "parsed 0 series rows (site markup changed?)" };
            });
          })],
          ["viewasian", timeProbe(function() {
            return vaPageRaw(cfg, cfg.viewasianSite + "/page/2/").then(function(items) {
              return { ok: items.length > 0, items: items.length, error: items.length ? void 0 : "parsed 0 series rows (site markup changed?)" };
            });
          })],
          ["animotvslash", timeProbe(function() {
            return animoPageRaw(cfg, cfg.animoSite + "/anime/?status=&type=&order=update").then(function(items) {
              return { ok: items.length > 0, items: items.length, error: items.length ? void 0 : "parsed 0 anime rows (site markup changed?)" };
            });
          })],
          ["pencuri", timeProbe(function() {
            return penPageRaw(cfg, cfg.pencuriSite + "/movies/").then(function(items) {
              return { ok: items.length > 0, items: items.length, error: items.length ? void 0 : "parsed 0 rows (site markup changed or mirror moved \u2014 set PENCURI_SITE)" };
            });
          })],
          ["kisskh", timeProbe(function() {
            var def = { id: "kisskh-latest", type: "series", mode: "list" };
            kisskhRescueState.engaged = false;
            kisskhRescueState.catalog = "";
            return kisskhPageMetas(cfg, def, 1, {}).then(function(metas) {
              return {
                ok: metas.length > 0,
                items: metas.length,
                mode: kisskhRescueState.engaged ? "tmdb-rescue" : "api",
                error: metas.length ? void 0 : "kisskh API unreachable AND the TMDB rescue returned 0 rows (check TMDB_API_KEY; device playback is unaffected)"
              };
            });
          })],
          ["anikoto", timeProbe(function() {
            return anikotoFeedPage(cfg, 1).then(function(rows) {
              return { ok: rows.length > 0, items: rows.length, error: rows.length ? void 0 : "anikoto /recent-anime parsed 0 rows (API changed?)" };
            });
          })],
          ["tmdb", timeProbe(function() {
            var url = "https://api.themoviedb.org/3/configuration?api_key=" + encodeURIComponent(cfg.tmdbKey);
            return fetchJson(cfg, url, 12e3).then(function(data) {
              return { ok: !!(data && data.images), items: 1, error: data && data.images ? void 0 : "unexpected configuration response (check TMDB_API_KEY)" };
            });
          })]
        ];
        return Promise.all(probes.map(function(p) {
          return p[1].then(function(r) {
            return [p[0], r];
          });
        })).then(function(entries) {
          var sources = {};
          var errors = [];
          var okCount = 0;
          for (var i = 0; i < entries.length; i++) {
            var name = entries[i][0];
            var r = entries[i][1];
            sources[name] = r;
            if (r.ok) okCount++;
            else errors.push(r.error || "failed");
          }
          var sourceCount = probes.length;
          var runtimeBug = okCount === 0 && errors.length && errors.every(function(e) {
            return e === errors[0];
          });
          var hints = [];
          if (runtimeBug && /Illegal invocation|incorrect .this./i.test(errors[0])) {
            hints.push("All probes fail with the same runtime error \u2014 a worker-code bug (a native fn like fetch called unbound), NOT IP blocking. Redeploy the current worker-bundle.js (" + ADDON_NAME + " v" + VERSION + ").");
          } else if (runtimeBug) {
            hints.push("All probes fail with the same error (" + errors[0] + ") \u2014 likely a worker-code bug, not IP blocking. Redeploy the current worker-bundle.js (" + ADDON_NAME + " v" + VERSION + ").");
          } else {
            if (!sources.pinoymovieshub.ok) hints.push("pinoymovieshub unreachable from this runtime. Mirror check (2026-09-10): pinoymovieshub.win is the canonical host (pinoymovieshub.tv redirects to it; .org CF-blocks datacenter IPs; the rest are dead). Pinoy catalogs fall back to serve-stale cache.");
            if (!sources.kissasian.ok) hints.push("kissasian.cam unreachable from this runtime (site up but likely blocking this worker's egress \u2014 verified live from residential/other datacenter IPs). KissAsian catalogs fall back to serve-stale cache; device-side playback is unaffected (the plugin runs on the client).");
            if (!sources.viewasian.ok) hints.push("viewasian.lol unreachable from this runtime (site down or IP blocked). ViewAsian catalog may be empty; set VIEWASIAN_SITE to an alternate mirror.");
            if (!sources.animotvslash.ok) hints.push("animotvslash.org unreachable from this runtime (site down or IP blocked). AnimeTVSlash catalog may be empty; set ANIMO_SITE to an alternate mirror.");
            if (!sources.anikoto.ok) hints.push("anikotoapi.site unreachable from this runtime (API down or rate-limited 60 req/120s). Anikoto catalogs may be empty; device playback via miruro is unaffected (it runs on the client).");
            if (!sources.kisskh.ok) {
              hints.push("kisskh API unreachable AND the TMDB rescue returned 0 rows \u2014 KissKH catalogs are EMPTY. Check TMDB_API_KEY (rescue lists) and KISSKH_HOSTS (comma-separated API mirrors); device playback is unaffected either way.");
            } else if (sources.kisskh.mode === "tmdb-rescue") {
              hints.push("kisskh API is Cloudflare-challenged from this runtime (nl/ovh/co all 403 \u2014 verified from the deployed worker; free CORS proxies get the same page). KissKH catalogs are AUTO-SERVED from TMDB rescue lists with full metadata; the paired plugins resolve streams on-device. Set KISSKH_HOSTS to a working mirror to switch back to live kisskh lists.");
            }
            if (!sources.tmdb.ok) hints.push("TMDB failed \u2014 check TMDB_API_KEY and outbound access; metadata enrichment is degraded.");
            if (okCount > 0 && okCount < sourceCount) hints.push("Partial outage: only " + okCount + "/" + sourceCount + " sources healthy \u2014 affected catalogs fall back to serve-stale cache.");
          }
          if (okCount === sourceCount) hints.push("All " + sourceCount + " sources healthy.");
          return {
            status: okCount === sourceCount ? "up" : okCount > 0 ? "degraded" : "down",
            addon: ADDON_ID,
            version: VERSION,
            sources,
            hints
          };
        });
      }
      function parseExtras(pathSegment, searchParams) {
        var extras = {};
        var seg = String(pathSegment || "").replace(/\.json$/i, "");
        if (seg) {
          var pairs = seg.split("&");
          for (var i = 0; i < pairs.length; i++) {
            var p = pairs[i];
            if (!p) continue;
            var eq = p.indexOf("=");
            var k = eq === -1 ? p : p.substring(0, eq);
            var v = eq === -1 ? "" : p.substring(eq + 1);
            if (k) extras[k.toLowerCase()] = v;
          }
        }
        if (searchParams) {
          searchParams.forEach(function(v2, k2) {
            var key = String(k2).toLowerCase();
            if (!(key in extras)) extras[key] = v2;
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
        if (def.source === "pinoy") return function(page) {
          return pinoyPageMetas(cfg, def, page, extras);
        };
        if (def.source === "kissasian") return function(page) {
          return ksPageMetas(cfg, def, page, extras);
        };
        if (def.source === "viewasian") return function(page) {
          return vaPageMetas(cfg, def, page, extras);
        };
        if (def.source === "animo") return function(page) {
          return animoPageMetas(cfg, def, page, extras);
        };
        if (def.source === "pencuri") return function(page) {
          return penPageMetas(cfg, def, page, extras);
        };
        if (def.source === "kisskh") return function(page) {
          return kisskhPageMetas(cfg, def, page, extras);
        };
        if (def.source === "anikoto") return function(page) {
          return anikotoPageMetas(cfg, def, page, extras);
        };
        return function() {
          return Promise.resolve([]);
        };
      }
      function getCatalogMetas(cfg, def, extras) {
        var skip = parseInt(extras.skip, 10);
        if (!isFinite(skip) || skip < 0) skip = 0;
        var limit = cfg.pageLimit;
        var search = String(extras.search || "").trim();
        var genreSlug = slugifyGenre(extras.genre || "");
        var mode = search ? "search" : def.mode === "genre" && genreSlug ? "genre" : "list";
        var ident = def.id + ":" + (mode === "search" ? search.toLowerCase() : mode === "genre" ? genreSlug : "");
        var stateKey = bufferStateKey(cfg, mode + "|" + def.source, ident);
        return runBuffered(cfg, stateKey, pageMetasFor(cfg, def, extras), skip, limit);
      }
      function indexHtml(cfg) {
        var defs = catalogDefinitions();
        var srcLabel = {
          pinoy: "pinoymovieshub.win",
          kissasian: "kissasian.cam",
          viewasian: "viewasian.lol",
          animo: "animotvslash.org",
          pencuri: "pencurimovie.baby (ww44.)",
          kisskh: "kisskh API (nl/ovh/co)",
          anikoto: "Anikoto API (anikotoapi.site)"
        };
        var rows = defs.map(function(c) {
          return "<tr><td>" + c.name + "</td><td><code>" + c.type + "</code></td><td>" + (srcLabel[c.source] || c.source) + "</td><td><code>/catalog/" + c.type + "/" + c.id + ".json</code></td></tr>";
        }).join("");
        return '<!DOCTYPE html><html><head><meta charset="utf-8"><title>' + ADDON_NAME + '</title><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{font-family:system-ui,sans-serif;max-width:900px;margin:40px auto;padding:0 16px;color:#eee;background:#14141b}a{color:#7ab8ff}table{border-collapse:collapse;width:100%}td,th{border:1px solid #333;padding:8px;text-align:left;font-size:14px}code{color:#9ef}h2{margin-top:28px}</style></head><body><h1>' + ADDON_NAME + " <small>v" + VERSION + `</small></h1><p>Stremio-protocol catalog addon for Nuvio \u2014 mirrors each site's real sections:</p><ul><li><b>Pinoy Movies Hub</b> \u2014 <a href="` + cfg.pinoySite + '">' + cfg.pinoySite.replace(/^https:\/\//, "") + '</a> (New Releases, Recently Added Movies, Series, Featured, Coming Soon, 17 genre sections)</li><li><b>KissAsian</b> \u2014 <a href="' + cfg.kissasianSite + '">' + cfg.kissasianSite.replace(/^https:\/\//, "") + '</a> (Hot Series Update, Latest Release, Recommendation genres)</li><li><b>ViewAsian</b> \u2014 <a href="' + cfg.viewasianSite + '">' + cfg.viewasianSite.replace(/^https:\/\//, "") + "</a> (Recently Drama, Movie and Kshow)</li><li><b>KissKH</b> \u2014 JSON API via " + cfg.kisskhHosts.join(" / ") + ' (Latest Update, Top K/C-Drama, Hollywood, Anime, Upcoming; auto-rescued from TMDB lists when every mirror is CF-blocked)</li><li><b>AnimeTVSlash</b> \u2014 <a href="' + cfg.animoSite + '">' + cfg.animoSite.replace(/^https:\/\//, "") + '</a> (Latest Release)</li><li><b>Pencuri</b> \u2014 <a href="' + cfg.pencuriSite + '">' + cfg.pencuriSite.replace(/^https:\/\//, "") + '</a> (Movies / Series / Malaysia / Indonesia / Japan / Thailand / Most Viewed / Most Rating / Top IMDb)</li><li><b>Anikoto API</b> \u2014 <a href="' + cfg.anikotoApi + '">' + cfg.anikotoApi.replace(/^https:\/\//, "") + "</a> (Latest Episode / New Release / New Added / Upcoming Anime / Just Completed; rows carry <code>mal:</code>/<code>anilist:</code>/<code>anikoto:</code> ids for the paired miruro plugin)</li></ul><p>Add this manifest URL in Nuvio (Settings &rarr; Addons): <b>" + (cfg.__selfUrl || "https://your-deployment") + '/manifest.json</b></p><p>Health probe: <a href="/health"><code>/health</code></a> (per-source status, latency, hints)</p><h2>Catalogs</h2><table><tr><th>Name</th><th>Type</th><th>Source</th><th>Endpoint</th></tr>' + rows + "</table><h2>Search examples</h2><p><code>/catalog/movie/pinoy-movies/search=hello love again.json</code><br><code>/catalog/series/asian-series/search=queen of tears.json</code><br><code>/catalog/series/kisskh-latest/search=queen of tears.json</code><br><code>/catalog/movie/pencuri-movies/search=moana.json</code><br><code>/catalog/series/animo-latest/search=one piece.json</code></p><h2>Genre / section chips</h2><p><code>/catalog/series/asian-series-genre/genre=Romance.json</code></p><p>Pair with the <b>PinoyMoviesHub</b>, <b>AsianHub</b>, <b>AnimeTVSlash</b> and <b>Pencuri</b> Nuvio plugins (xrexzerox/nv-plugins) for playable streams.</p></body></html>";
      }
      var CJ_G_TARGET = "https://api.shegu.st/g";
      var CJ_MAX_TOKEN_BYTES = 16384;
      function b64urlDecodeToU8(text) {
        var std = String(text || "").replace(/-/g, "+").replace(/_/g, "/");
        while (std.length % 4) std += "=";
        var bin = atob(std);
        var u8 = new Uint8Array(bin.length);
        for (var i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i) & 255;
        return u8;
      }
      function u8ToB64url(u8) {
        var bin = "";
        var CHUNK = 32768;
        for (var i = 0; i < u8.length; i += CHUNK) {
          bin += String.fromCharCode.apply(null, u8.subarray(i, Math.min(i + CHUNK, u8.length)));
        }
        return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
      }
      function cinejoyRelay(request) {
        if (request.method !== "POST") {
          return Promise.resolve(json({ ok: false, error: "POST required" }, 405, 0));
        }
        return request.text().then(function(text) {
          var bytes;
          try {
            bytes = b64urlDecodeToU8(text.trim());
          } catch (e) {
            return json({ ok: false, error: "body is not base64url" }, 400, 0);
          }
          if (!bytes.length || bytes.length > CJ_MAX_TOKEN_BYTES) {
            return json({ ok: false, error: "token size out of range" }, 400, 0);
          }
          return fetch(CJ_G_TARGET, {
            method: "POST",
            headers: {
              "Content-Type": "application/octet-stream",
              "Origin": "https://cinejoy.to",
              "Referer": "https://cinejoy.to/",
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
              "Accept": "*/*"
            },
            body: bytes
          }).then(function(res) {
            return res.arrayBuffer().then(function(ab) {
              return json({
                ok: res.ok,
                status: res.status,
                b64: u8ToB64url(new Uint8Array(ab))
              }, 200, 0);
            });
          }).catch(function(err) {
            return json({ ok: false, error: String(err && err.message || err) }, 502, 0);
          });
        }).catch(function(err) {
          return json({ ok: false, error: String(err && err.message || err) }, 500, 0);
        });
      }
      var CJ_CHAIN_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
      var CJ_DEC_TARGET = "https://enc-dec.app/api/dec-cinejoy";
      var CJ_ENC_TARGET = "https://enc-dec.app/api/enc-cinejoy";
      function cinejoyFull(request) {
        if (request.method !== "POST") {
          return Promise.resolve(json({ ok: false, error: "POST required" }, 405, 0));
        }
        return request.text().then(function(text) {
          var body;
          try {
            body = JSON.parse(String(text || "{}"));
          } catch (e) {
            return json({ ok: false, error: "body is not JSON" }, 400, 0);
          }
          var title = String(body.title || "").slice(0, 300);
          if (!title) return json({ ok: false, error: "title required" }, 400, 0);
          var type = String(body.type || "movie") === "series" || String(body.type || "") === "tv" ? "series" : "movie";
          var target = "https://api.shegu.st/?title=" + encodeURIComponent(title) + "&type=" + type + "&year=" + encodeURIComponent(String(body.year || "")) + "&imdb=" + encodeURIComponent(String(body.imdb || "")) + "&tmdb=" + encodeURIComponent(String(body.tmdb || "")) + "&server=" + encodeURIComponent(String(body.server || ""));
          if (type === "series") {
            target += "&season=" + (parseInt(body.season, 10) || 1) + "&episode=" + (parseInt(body.episode, 10) || 1);
          }
          var encHeaders = { "User-Agent": CJ_CHAIN_UA, "Accept": "*/*" };
          return fetch(CJ_ENC_TARGET + "?url=" + encodeURIComponent(target), { headers: encHeaders }).then(function(res) {
            return res.json();
          }).then(function(enc) {
            var result = enc && enc.result || enc;
            if (!result || !result.data) throw new Error("enc-cinejoy returned no data");
            var bytes = b64urlDecodeToU8(result.data);
            return fetch(CJ_G_TARGET, {
              method: "POST",
              headers: {
                "Content-Type": "application/octet-stream",
                "Origin": "https://cinejoy.to",
                "Referer": "https://cinejoy.to/",
                "User-Agent": CJ_CHAIN_UA,
                "Accept": "*/*"
              },
              body: bytes
            }).then(function(gres) {
              if (!gres.ok) throw new Error("shegu /g HTTP " + gres.status);
              return gres.arrayBuffer();
            }).then(function(ab) {
              var packed = u8ToB64url(new Uint8Array(ab));
              return fetch(CJ_DEC_TARGET, {
                method: "POST",
                headers: { "Content-Type": "application/json", "User-Agent": CJ_CHAIN_UA, "Accept": "*/*" },
                body: JSON.stringify({ text: packed, state: result.state })
              }).then(function(dres) {
                return dres.json();
              });
            });
          }).then(function(dec) {
            var data = (dec && dec.result || {}).data || {};
            var streams = data.stream;
            if (!streams) {
              return json({ ok: false, error: String(dec && dec.result && dec.result.message || "no stream in dec response") }, 200, 0);
            }
            var list = Array.isArray(streams) ? streams : [streams];
            var out = [];
            list.forEach(function(st) {
              if (!st) return;
              out.push({
                id: String(st.id || ""),
                playlist: String(st.playlist || ""),
                qualities: st.qualities || st.files || {},
                captions: st.captions || []
              });
            });
            return json({ ok: out.length > 0, streams: out }, 200, 0);
          }).catch(function(err) {
            return json({ ok: false, error: String(err && err.message || err) }, 502, 0);
          });
        }).catch(function(err) {
          return json({ ok: false, error: String(err && err.message || err) }, 500, 0);
        });
      }
      function handle(urlString, env) {
        var cfg = makeConfig(env || {});
        cfg.__selfUrl = env && env.__selfUrl || "";
        var raw = String(urlString || "/");
        if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(raw)) raw = "https://asian-catalog.local" + (raw.charAt(0) === "/" ? raw : "/" + raw);
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
          if (path === "/health") {
            return healthReport(cfg).then(function(report) {
              return json(report, 200, 0);
            });
          }
          if (path === "/manifest.json") {
            return Promise.resolve(json(manifest(cfg), 200, 300));
          }
          var mm = path.match(/^\/meta\/(movie|series|tv)\/([^/]+?)\.json$/i);
          if (mm) {
            var mType = mm[1].toLowerCase() === "tv" ? "series" : mm[1].toLowerCase();
            var mId = "";
            try {
              mId = decodeURIComponent(mm[2]);
            } catch (e2) {
              mId = mm[2];
            }
            return addonMeta(cfg, mType, mId).then(function(meta) {
              if (!meta) return json({ error: "meta not found for id", id: mId }, 404, 60);
              return json({ meta }, 200, 300);
            }).catch(function(err2) {
              return json({ error: String(err2 && err2.message || err2) }, 502, 0);
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
      global.AsianCatalogCore = {
        VERSION,
        ADDON_ID,
        makeConfig,
        manifest,
        handle,
        cinejoyRelay,
        cinejoyFull,
        resetCaches,
        catalogDefinitions,
        // test hooks
        parseListPage,
        parseFeaturedCarousel,
        ksParseListPage,
        ksParseHotSection,
        vaParseListPage,
        animoParseListPage,
        penParseListPage,
        cleanTitleForSearch,
        cleanDisplayName,
        normalizeForCompare,
        titleScore,
        yearScore,
        pickBestTmdb,
        toMeta,
        fallbackIdTail,
        slugifyGenre,
        pinoyGenreSlug,
        pinoyPageMetas,
        ksPageMetas,
        vaPageMetas,
        animoPageMetas,
        kisskhPageMetas,
        // v5.0.0 anikoto + meta test hooks
        anikotoPageMetas,
        anikotoRowToMeta,
        addonMeta,
        metaForMal,
        metaForAnikoto,
        // v4.1.0 rescue test hooks
        kisskhRescueState,
        KISSKH_TMDB_RESCUE,
        kisskhRescueUrl,
        tmdbRowToMetaDirect,
        getCatalogMetas,
        healthReport
      };
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
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "*",
          "Access-Control-Max-Age": "86400"
        }
      });
    }
    if (request.method === "POST") {
      let path = "";
      try {
        path = new URL(request.url).pathname.replace(/\/+$/, "") || "/";
      } catch (e) {
        path = "/";
      }
      if (path === "/cjg") {
        try {
          const relayResponse = await Core.cinejoyRelay(request);
          const newHeaders = new Headers(relayResponse.headers);
          newHeaders.set("Access-Control-Allow-Origin", "*");
          return new Response(relayResponse.body, { status: relayResponse.status, headers: newHeaders });
        } catch (err) {
          return new Response(JSON.stringify({ ok: false, error: String(err && err.message || err) }), {
            status: 500,
            headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
          });
        }
      }
      if (path === "/cjs") {
        try {
          const fullResponse = await Core.cinejoyFull(request);
          const newHeaders = new Headers(fullResponse.headers);
          newHeaders.set("Access-Control-Allow-Origin", "*");
          return new Response(fullResponse.body, { status: fullResponse.status, headers: newHeaders });
        } catch (err) {
          return new Response(JSON.stringify({ ok: false, error: String(err && err.message || err) }), {
            status: 500,
            headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
          });
        }
      }
      return new Response(JSON.stringify({ error: "method not allowed" }), {
        status: 405,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
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
