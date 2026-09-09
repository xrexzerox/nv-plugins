/**
 * AsianHub Nuvio Plugin - Direct Streams Edition
 * Sources: MyAsianTV (myasiantv.com.lv) + Dramacool (dramacool.uno)
 * Supports: Movies & TV Shows (Korean / Chinese / Japanese / Thai / Taiwan /
 *           Hong Kong / Indian / other Asian titles, English subs)
 * Language: ko / zh / ja / th / en
 * Author: xrexzerox
 * Version: 1.1.0
 *
 * v1.1.0 (2026-09-09) — "series not fetching" fix:
 *   dramacool.uno migrated its embed player to "VidTube" (jwplayer+hls.js).
 *   Variant A still inlines the direct HLS URL in the embed HTML (old regex
 *   keeps working), but variant B embeds only carry
 *     var streamUrl = "https://kisskh.asianc.sr/api/resolve/{cid}"
 *   which the old regex could not see -> the Dramacool lane silently died
 *   for every episode served through that variant. Added the resolve hop:
 *   parse {cid} (streamUrl / settings.cid / data-id), GET the resolve
 *   endpoint, take {"file": ".../hls/{hash}/index.m3u8"}. Both lanes
 *   live-verified end-to-end on 2026-09-09.
 *
 * EXTRACTION CHAINS (both verified live end-to-end on 2026-09-09):
 *
 *   MyAsianTV (WordPress, wp-json REST enabled):
 *     1. search   GET /wp-json/wp/v2/search?search={title}&per_page=20
 *                 -> [{ title: "Crash Landing on You (2019) Episode 16",
 *                       url: ".../crash-landing-on-you-2019-episode-16/" }]
 *        (fallback: construct show URL /series/{slug}-{year}/ and scrape
 *         the episode list when wp-json returns nothing usable)
 *     2. episode  GET /{slug}-episode-{n}/
 *                 -> <iframe src="https://catalog.dramavibe.cfd/player_embed.php?episode=421">
 *     3. player   GET catalog.dramavibe.cfd/player_embed.php?episode=421
 *                 -> https://cdn.dramavite... cdn.dramav2.xyz/{uuid}/video.m3u8   (DIRECT HLS)
 *
 *   Dramacool (episode pages are static, player embeds are server-rendered):
 *     1. episode  GET /{slug}-episode-{n}.html   (slug may or may not carry the year;
 *                 both variants are probed; movies live at -episode-1.html too)
 *                 -> https://dramacool.uno/embed/{base64token}[?server=N]
 *     2. embed    GET /embed/{token}   (Referer: episode page)
 *                 -> https://kisskh.asianc.sr/hls/{hash}/index.m3u8   (DIRECT HLS)
 *
 * SANDBOX SAFETY (NuvioTVSmart worker + NuvioMobile QuickJS):
 *   - No require() of anything; global fetch only
 *   - Pure ES5 promise chains, no async/await
 *   - No Buffer / TextDecoder / URL / padStart / Object.entries / Array.prototype.flat
 *   - Pure-regex HTML parsing (no cheerio)
 *   - Every lane fully fail-soft; a dead source never blocks the other one
 */

var PROVIDER_NAME = "AsianHub";
var TMDB_API_KEY = "439c478a771f35c05022f9feabcca01c";

var MYASIANTV_BASE = "https://myasiantv.com.lv";
var DRAMACOOL_BASE = "https://dramacool.uno";

var HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36",
  "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9"
};

var PAGE_TIMEOUT_MS = 12000;
var EMBED_TIMEOUT_MS = 10000;
var GLOBAL_DEADLINE_MS = 12000;

// ===== SMALL UTILITIES =====

function merge(obj1, obj2) {
  var out = {};
  var k;
  for (k in obj1 || {}) out[k] = obj1[k];
  for (k in obj2 || {}) out[k] = obj2[k];
  return out;
}

function hasTimers() {
  return typeof setTimeout === "function";
}

function fetchWithTimeout(url, options, ms) {
  options = options || {};
  if (!hasTimers()) return fetch(url, options);
  var timer = null;
  var killer = new Promise(function(resolve, reject) {
    timer = setTimeout(function() {
      reject(new Error("fetch timeout"));
    }, ms || PAGE_TIMEOUT_MS);
  });
  return Promise.race([fetch(url, options), killer]).then(
    function(res) { clearTimeout(timer); return res; },
    function(err) { clearTimeout(timer); throw err; }
  );
}

/**
 * Races a body-read promise against the same deadline as the request.
 * Some free CDNs return headers instantly but stream the body at ~1KB/s
 * (throttled playlists); without this guard a single playlist could stall
 * extraction for 25s+ even though fetchWithTimeout resolved on time.
 */
function raceBody(promise, ms) {
  if (!hasTimers()) return promise;
  var timer = null;
  var killer = new Promise(function(resolve, reject) {
    timer = setTimeout(function() {
      reject(new Error("body read timeout"));
    }, ms || PAGE_TIMEOUT_MS);
  });
  return Promise.race([promise, killer]).then(
    function(res) { clearTimeout(timer); return res; },
    function(err) { clearTimeout(timer); throw err; }
  );
}

function fetchText(url, options) {
  options = options || {};
  var deadline = options.timeoutMs || PAGE_TIMEOUT_MS;
  return fetchWithTimeout(url, {
    method: options.method || "GET",
    redirect: options.redirect || "follow",
    headers: merge(HEADERS, options.headers || {}),
    body: options.body
  }, deadline).then(function(res) {
    if (!res.ok) throw new Error("HTTP " + res.status);
    return raceBody(res.text(), deadline);
  });
}

function fetchJson(url, options) {
  options = options || {};
  var deadline = options.timeoutMs || PAGE_TIMEOUT_MS;
  return fetchWithTimeout(url, {
    method: options.method || "GET",
    redirect: options.redirect || "follow",
    headers: merge(HEADERS, options.headers || {}),
    body: options.body
  }, deadline).then(function(res) {
    if (!res.ok) return null;
    return raceBody(res.json(), deadline);
  }).catch(function() { return null; });
}

function hostOf(url) {
  var m = String(url || "").match(/^https?:\/\/([^\/?#]+)/i);
  return m ? m[1].replace(/^www\./i, "") : "";
}

function slugify(s) {
  return String(s || "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** "Crash Landing on You (2019) Episode 16" -> "crash landing on you" */
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

function parseQualityFromPlaylist(playlistText) {
  if (!playlistText) return "";
  var best = 0;
  var re = /RESOLUTION=(\d+)x(\d+)/g;
  var m;
  while ((m = re.exec(playlistText)) !== null) {
    var h = parseInt(m[1], 10);
    if (h > best) best = h;
  }
  if (best >= 3800) return "2160p";
  if (best >= 1900) return "1080p";
  if (best >= 1250) return "720p";
  if (best >= 800) return "480p";
  return "";
}

// ===== TMDB =====

function tmdbLookup(type, tmdbId) {
  var url = "https://api.themoviedb.org/3/" + type + "/" + tmdbId + "?api_key=" + TMDB_API_KEY;
  return fetchJson(url).then(function(data) {
    if (!data || data.success === false) return null;
    var title = data.title || data.name || "";
    var original = data.original_title || data.original_name || title;
    var year = (data.release_date || data.first_air_date || "").split("-")[0];
    return { type: type, title: title, original: original, year: year, raw: data };
  });
}

function getTmdbInfoAuto(tmdbId) {
  return tmdbLookup("movie", tmdbId).then(function(movie) {
    if (movie) return movie;
    return tmdbLookup("tv", tmdbId).then(function(tv) {
      return tv || { type: "", title: "", original: "", year: "", raw: null };
    });
  });
}

function getTmdbEpisodeTitle(tmdbId, season, episode) {
  if (!season || !episode) return Promise.resolve("");
  var url = "https://api.themoviedb.org/3/tv/" + tmdbId + "/season/" + season + "/episode/" + episode + "?api_key=" + TMDB_API_KEY;
  return fetchJson(url).then(function(data) {
    return (data && data.name) || "";
  }).catch(function() { return ""; });
}

// ===== GLOBAL EXTRACTION DEADLINE (same pattern as pinoyhub v5.2.0) =====

/**
 * Runs lane thunks in parallel. When the deadline fires, ALREADY-COMPLETED
 * lane results are returned (in-flight lanes become null) instead of
 * discarding everything: a fast source must never be dropped because a
 * second source is stalled on a throttled CDN.
 */
function withExtractionDeadline(promises, ms) {
  var results = new Array(promises.length);
  var trackers = promises.map(function(p, idx) {
    return Promise.resolve().then(p).then(function(r) {
      results[idx] = (r === undefined) ? null : r;
    }, function() {
      results[idx] = null;
    });
  });
  var allDone = Promise.all(trackers).then(function() { return results; });
  if (!hasTimers()) return allDone;
  var timer = null;
  var partial = new Promise(function(resolve) {
    timer = setTimeout(function() { resolve(results.slice()); }, ms || GLOBAL_DEADLINE_MS);
  });
  return Promise.race([allDone, partial]).then(function(result) {
    clearTimeout(timer);
    return result;
  }, function() {
    clearTimeout(timer);
    return [];
  });
}

// ===== STREAM BUILDER =====

function buildStream(displayTitle, meta, resolved) {
  // resolved: { url, quality, source, host }
  var q = resolved.quality || "HLS";
  var line1 = meta.isSeries
    ? "S" + meta.season + "E" + meta.episode + (meta.episodeTitle ? " - " + meta.episodeTitle : "") + " | " + displayTitle
    : displayTitle;
  var line2 = "Direct HLS | " + q + " | " + (resolved.host || "");
  var line3 = resolved.source;

  return {
    name: PROVIDER_NAME + " | " + resolved.source + " | " + q,
    title: line1 + "\n" + line2 + "\n" + line3,
    url: resolved.url,
    quality: q,
    behaviorHints: {
      bingeGroup: "asianhub-hls"
    }
  };
}

/**
 * Fetches an HLS playlist and, when it is a master playlist, picks the
 * highest-bandwidth variant. Media playlists pass through unchanged.
 * Returns { url, quality } or null.
 */
function resolveHls(url, referer, sourceLabel) {
  var headers = referer ? { "Referer": referer } : {};
  // 5s verify budget: a healthy playlist arrives in <2s. A throttled CDN
  // (some datacenter IPs) times out -> the URL is still returned unverified
  // below, because it IS the player's real stream URL and devices on
  // residential IPs typically fetch it fine.
  return fetchText(url, { headers: headers, timeoutMs: 5000 }).then(function(text) {
    if (!text || text.indexOf("#EXTM3U") !== 0) {
      // Not a playlist (maybe an mp4 direct link or an HTML error page):
      // still return the URL if it looks like media.
      if (/\.mp4(\?|$)/i.test(url)) return { url: url, quality: "" };
      return null;
    }
    if (text.indexOf("#EXT-X-STREAM-INF") !== -1) {
      // master playlist: choose highest RESOLUTION / BANDWIDTH variant
      var lines = text.split("\n");
      var best = null, bestH = 0, i;
      for (i = 0; i < lines.length - 1; i++) {
        if (lines[i].indexOf("#EXT-X-STREAM-INF") === 0) {
          var rm = lines[i].match(/RESOLUTION=(\d+)x(\d+)/);
          var bm = lines[i].match(/BANDWIDTH=(\d+)/);
          var h = rm ? parseInt(rm[1], 10) : (bm ? parseInt(bm[1], 10) / 1000 : 0);
          var next = String(lines[i + 1] || "").trim();
          if (next && next.charAt(0) !== "#" && h > bestH) {
            bestH = h;
            best = next;
          }
        }
      }
      if (best) {
        var abs = best.indexOf("http") === 0 ? best : url.replace(/[^\/]*$/, "") + best;
        var q = parseQualityFromPlaylist(text);
        return { url: abs, quality: q };
      }
      return null;
    }
    // plain media playlist
    return { url: url, quality: parseQualityFromPlaylist(text) };
  }).catch(function(err) {
    var msg = String((err && err.message) || err);
    if (msg.indexOf("body read timeout") !== -1 || msg.indexOf("fetch timeout") !== -1) {
      // throttled CDN: hand back the real stream URL unverified
      return { url: url, quality: "" };
    }
    return null;
  });
}

// ===== SOURCE 1: MyAsianTV =====

/**
 * wp-json search returns episode posts:
 *   [{ title: "Crash Landing on You (2019) Episode 16",
 *      url: "https://myasiantv.com.lv/crash-landing-on-you-2019-episode-16/" }]
 * Matching rules:
 *   - TV: ONLY exact-episode candidates are accepted (a wrong episode is
 *     worse than none; the show-page fallback enumerates the full list).
 *   - Movies: episode-1 (or an episode-less watch post) preferred.
 */
function myasiantvSearchEpisodeUrl(tmdb, isSeries, episode) {
  var query = tmdb.title || tmdb.original || "";
  if (!query) return Promise.resolve("");
  var url = MYASIANTV_BASE + "/wp-json/wp/v2/search?search=" + encodeURIComponent(query) + "&per_page=40";
  return fetchJson(url, { timeoutMs: EMBED_TIMEOUT_MS }).then(function(data) {
    if (!Array.isArray(data)) return "";
    var normTitle = normalizeTitle(tmdb.title);
    var normOrig = normalizeTitle(tmdb.original);
    var bestExact = null, bestExactScore = 0;
    var bestMovie = null, bestMovieScore = 0;
    var i, item, t, epm, epNum, score;
    for (i = 0; i < data.length; i++) {
      item = data[i];
      if (!item || !item.url) continue;
      t = String(item.title || "");
      var tNorm = normalizeTitle(t);
      score = Math.max(titleScore(normTitle, tNorm), titleScore(normOrig, tNorm));
      if (score < 1.5) continue;
      epm = t.match(/episode\s*(\d+)/i);
      epNum = epm ? parseInt(epm[1], 10) : 0;
      if (isSeries) {
        if (epNum === parseInt(episode, 10) && score > bestExactScore) {
          bestExactScore = score;
          bestExact = item.url;
        }
      } else {
        // movies: episode-1 is the watch page; an episode-less post can be one too
        if (epNum === 1) score += 2;
        else if (epNum === 0) score += 1;
        else score -= 0.5;
        if (score > bestMovieScore) { bestMovieScore = score; bestMovie = item.url; }
      }
    }
    if (isSeries) return bestExact || "";
    return bestMovie || "";
  }).catch(function() { return ""; });
}

/**
 * Fallback: scrape the show page /series/{slug}/ for its episode list.
 * STRICT: only episode links whose slug starts with the show's own slug are
 * accepted (episode widgets in the sidebar link to unrelated shows and must
 * never match - that used to return the same "recently added" video for
 * every title).
 */
function myasiantvShowPageEpisodeUrl(tmdb, isSeries, episode) {
  var base = slugify(tmdb.title || tmdb.original || "");
  if (!base) return Promise.resolve("");
  var withYear = tmdb.year ? base + "-" + tmdb.year : base;
  var candidates = [
    { url: MYASIANTV_BASE + "/series/" + withYear + "/", slug: withYear },
    { url: MYASIANTV_BASE + "/series/" + base + "/", slug: base }
  ];
  var wantEp = isSeries ? parseInt(episode, 10) || 1 : 1;

  function tryIdx(idx) {
    if (idx >= candidates.length) return Promise.resolve("");
    var cand = candidates[idx];
    return fetchText(cand.url, { timeoutMs: EMBED_TIMEOUT_MS }).then(function(html) {
      var eps = [];
      var re = /href="https?:\/\/myasiantv\.com\.lv\/([a-z0-9-]+-episode-(\d+))\/"/gi;
      var m;
      while ((m = re.exec(html)) !== null) {
        // episode slug must belong to THIS show: "{slug}-episode-N" or
        // "{base}-episode-N" (some shows carry the year, some do not)
        if (m[1].indexOf(cand.slug + "-episode-") !== 0 &&
            m[1].indexOf(base + "-episode-") !== 0) {
          continue;
        }
        eps.push({ url: MYASIANTV_BASE + "/" + m[1] + "/", num: parseInt(m[2], 10) });
      }
      if (!eps.length) return tryIdx(idx + 1);
      var picked = null, i;
      for (i = 0; i < eps.length; i++) {
        if (eps[i].num === wantEp) { picked = eps[i].url; break; }
      }
      if (!picked && !isSeries) {
        // movie: the lowest episode number is the watch page
        var lo = null;
        for (i = 0; i < eps.length; i++) {
          if (lo === null || eps[i].num < lo.num) lo = eps[i];
        }
        picked = lo ? lo.url : "";
      }
      // TV: if the exact episode is not on the show page we return nothing
      // (never a wrong episode)
      return picked || "";
    }).catch(function() { return tryIdx(idx + 1); });
  }
  return tryIdx(0);
}

/** MyAsianTV episode page -> dramavibe player -> direct m3u8 */
function myasiantvExtract(episodePageUrl) {
  if (!episodePageUrl) return Promise.resolve(null);
  return fetchText(episodePageUrl, { timeoutMs: EMBED_TIMEOUT_MS }).then(function(html) {
    var m = html.match(/iframe[^>]*src="(https?:\/\/catalog\.dramavibe\.cfd\/player_embed\.php\?episode=\d+)"/i);
    if (!m) {
      // looser fallback: any dramavibe player link on the page
      m = html.match(/(https?:\/\/catalog\.dramavibe\.cfd\/player_embed\.php\?episode=\d+)/i);
    }
    if (!m) return null;
    var playerUrl = m[1].replace(/\\u002F/gi, "/");
    return fetchText(playerUrl, {
      headers: { "Referer": MYASIANTV_BASE + "/" },
      timeoutMs: EMBED_TIMEOUT_MS
    }).then(function(playerHtml) {
      var vm = playerHtml.match(/(https?:\/\/[a-z0-9.-]+\/[a-z0-9-]+\/video\.m3u8)/i);
      if (!vm) {
        vm = playerHtml.match(/(https?:\/\/[^"'\s\\]+\.m3u8[^"'\s\\]*)/i);
      }
      if (!vm) return null;
      var m3u8 = vm[1].replace(/\\u002F/gi, "/").replace(/\\\//g, "/");
      return resolveHls(m3u8, "https://catalog.dramavibe.cfd/", "MyAsianTV").then(function(r) {
        if (!r) return null;
        r.source = "MyAsianTV";
        r.host = hostOf(r.url);
        return r;
      });
    });
  }).catch(function() { return null; });
}

function myasiantvLane(tmdb, isSeries, season, episode) {
  var wantEp = isSeries ? String(episode) : "1";
  return myasiantvSearchEpisodeUrl(tmdb, isSeries, wantEp).then(function(found) {
    if (found) return found;
    return myasiantvShowPageEpisodeUrl(tmdb, isSeries, wantEp);
  }).then(function(episodeUrl) {
    if (!episodeUrl) return null;
    return myasiantvExtract(episodeUrl);
  });
}

// ===== SOURCE 2: Dramacool =====

/**
 * Episode URLs are constructible: /{slug}-episode-{n}.html (slug may or may
 * not carry the year; movies are -episode-1.html). The episode page embeds
 * /embed/{token} player URLs (server variants ?server=N included).
 */
function dramacoolLane(tmdb, isSeries, season, episode) {
  var base = slugify(tmdb.title || tmdb.original || "");
  if (!base) return Promise.resolve(null);
  var wantEp = isSeries ? (parseInt(episode, 10) || 1) : 1;
  var withYear = tmdb.year ? base + "-" + tmdb.year : "";
  var epPaths = [];
  if (withYear) epPaths.push("/" + withYear + "-episode-" + wantEp + ".html");
  epPaths.push("/" + base + "-episode-" + wantEp + ".html");

  var referer = DRAMACOOL_BASE + "/";

  function tryEpisodePage(idx) {
    if (idx >= epPaths.length) return Promise.resolve(null);
    var pageUrl = DRAMACOOL_BASE + epPaths[idx];
    return fetchText(pageUrl, { timeoutMs: EMBED_TIMEOUT_MS, headers: { "Referer": referer } }).then(function(html) {
      // collect all embed tokens (dedupe, keep up to 3 server variants)
      var seen = {};
      var embeds = [];
      var re = /(https?:\/\/dramacool\.uno\/embed\/[A-Za-z0-9]+=*(?:\?server=\d+)?)/g;
      var m;
      while ((m = re.exec(html)) !== null) {
        var u = m[1];
        var bare = u.split("?")[0];
        if (!seen[bare]) {
          seen[bare] = true;
          embeds.push(u);
        } else if (u.indexOf("server=") !== -1 && embeds.length < 3 && u !== embeds[embeds.length - 1]) {
          embeds.push(u);
        }
        if (embeds.length >= 3) break;
      }
      if (!embeds.length) return tryEpisodePage(idx + 1);
      return extractDramacoolEmbeds(embeds, pageUrl).then(function(best) {
        if (best) return best;
        return tryEpisodePage(idx + 1);
      });
    }).catch(function() { return tryEpisodePage(idx + 1); });
  }
  return tryEpisodePage(0);
}

function dramacoolTagStream(m3u8, referer) {
  return resolveHls(m3u8, referer, "Dramacool").then(function(r) {
    if (!r) return null;
    r.source = "Dramacool";
    r.host = hostOf(r.url);
    return r;
  });
}

/**
 * Second-chance hop for the VidTube embed variant: the embed page sometimes
 * has NO inline m3u8 and instead points the player at a resolve endpoint
 *   var streamUrl = "https://kisskh.asianc.sr/api/resolve/{cid}"
 * where {cid} also sits in settings.cid / data-id. Hitting the endpoint
 * returns {"file":"https://kisskh.asianc.sr/hls/{hash}/index.m3u8", ...}.
 * Verified live 2026-09-09 (episode pages of dramacool.uno).
 */
function dramacoolResolveVariant(html, pageUrl) {
  var ru = html.match(/(https?:\/\/[^"'\s]+?\/api\/resolve\/\d+)/i);
  var cidm = null;
  if (!ru) cidm = html.match(/\bcid\b\s*[:=]\s*["']?(\d+)/i);
  if (!ru && !cidm) cidm = html.match(/data-id=["'](\d+)["']/i);
  if (!ru && !cidm) return Promise.resolve(null);
  var resolveUrl = ru
    ? ru[1]
    : "https://kisskh.asianc.sr/api/resolve/" + cidm[1];
  return fetchText(resolveUrl, {
    headers: { "Referer": pageUrl },
    timeoutMs: EMBED_TIMEOUT_MS
  }).then(function(body) {
    var fm = body.match(/"file"\s*:\s*"([^"]+)"/i) ||
             body.match(/(https?:\/\/[^"'\s]+?\.m3u8[^"'\s]*)/i);
    if (!fm) return null;
    var m3u8 = fm[1]
      .replace(/\\u002F/gi, "/")
      .replace(/\\u003D/gi, "=")
      .replace(/\\u003d/gi, "=")
      .replace(/\\\//g, "/");
    return dramacoolTagStream(m3u8, resolveUrl);
  }).catch(function() { return null; });
}

function extractDramacoolEmbeds(embedUrls, pageUrl) {
  var jobs = embedUrls.slice(0, 3).map(function(embedUrl) {
    return fetchText(embedUrl, {
      headers: { "Referer": pageUrl },
      timeoutMs: EMBED_TIMEOUT_MS
    }).then(function(html) {
      var m = html.match(/(https?:\/\/[^"'\s]+?\/hls\/[a-z0-9]+\/index\.m3u8)/i);
      if (!m) m = html.match(/(https?:\/\/[^"'\s]+?\.m3u8[^"'\s]*)/i);
      if (m) {
        var m3u8 = m[1].replace(/\\u002F/gi, "/").replace(/\\\//g, "/");
        return dramacoolTagStream(m3u8, embedUrl);
      }
      // VidTube variant: stream lives behind the resolve endpoint
      return dramacoolResolveVariant(html, embedUrl);
    }).catch(function() { return null; });
  });
  return Promise.all(jobs).then(function(results) {
    var best = null, bestScore = -1, i;
    for (i = 0; i < results.length; i++) {
      var r = results[i];
      if (!r) continue;
      var score = r.quality === "2160p" ? 4 : r.quality === "1080p" ? 3 : r.quality === "720p" ? 2 : r.quality === "480p" ? 1 : 0;
      if (score > bestScore) { bestScore = score; best = r; }
    }
    return best;
  });
}

// ===== MAIN ENTRY =====

function getStreams(tmdbId, mediaType, season, episode) {
  // Legacy signatures:
  //   getStreams(tmdbId, season, episode)               -> mediaType undefined
  //   getStreams(tmdbId, mediaType, season, episode)    -> Nuvio contract (4 args)
  if (mediaType !== "movie" && mediaType !== "tv") {
    episode = season;
    season = mediaType;
    mediaType = "";
  }

  try { tmdbId = String(tmdbId); } catch (e) { tmdbId = ""; }
  season = (season === undefined || season === null || season === "") ? "" : String(season).replace(/^s/i, "").replace(/[^0-9]/g, "");
  episode = (episode === undefined || episode === null || episode === "") ? "" : String(episode).replace(/^e/i, "").replace(/[^0-9]/g, "");

  console.log("[AsianHub] === START tmdbId=" + tmdbId + " type=" + mediaType + " S" + season + "E" + episode + " ===");

  if (!tmdbId) return Promise.resolve([]);

  var forceTv = mediaType === "tv" || (!!(season && episode) && !mediaType);

  var tmdbPromise = mediaType === "movie"
    ? tmdbLookup("movie", tmdbId).then(function(r) { return r || getTmdbInfoAuto(tmdbId); })
    : forceTv
      ? tmdbLookup("tv", tmdbId).then(function(r) { return r || { type: "", title: "", original: "", year: "", raw: null }; })
      : getTmdbInfoAuto(tmdbId);

  return tmdbPromise.then(function(tmdb) {
    if (!tmdb || !tmdb.type || !tmdb.title) {
      console.log("[AsianHub] Could not detect media for TMDB ID:", tmdbId);
      return [];
    }
    var type = tmdb.type;
    var isSeries = type === "tv";
    console.log("[AsianHub] type=" + type + " | title=" + tmdb.title + " | year=" + tmdb.year);

    if (isSeries && (!season || !episode)) {
      console.log("[AsianHub] TV show requires season and episode");
      return [];
    }

    var epPromise = isSeries
      ? getTmdbEpisodeTitle(tmdbId, season, episode)
      : Promise.resolve("");

    return epPromise.then(function(episodeTitle) {
      var meta = {
        isSeries: isSeries,
        season: season,
        episode: episode,
        episodeTitle: episodeTitle
      };
      var displayTitle = isSeries
        ? tmdb.title + " S" + season + "E" + episode
        : tmdb.title;

      // Both lanes run in parallel under the global deadline; each is
      // individually fail-soft so a dead source never blocks the other.
      return withExtractionDeadline([
        function() { return myasiantvLane(tmdb, isSeries, season, episode); },
        function() { return dramacoolLane(tmdb, isSeries, season, episode); }
      ], GLOBAL_DEADLINE_MS).then(function(results) {
        var streams = [];
        var seen = {};
        var i, r, s;
        for (i = 0; i < results.length; i++) {
          r = results[i];
          if (!r || !r.url) continue;
          if (seen[r.url]) continue;
          seen[r.url] = true;
          s = buildStream(displayTitle, meta, r);
          streams.push(s);
        }
        console.log("[AsianHub] Returning " + streams.length + " stream(s)");
        return streams;
      });
    });
  }).catch(function(err) {
    console.error("[AsianHub] error:", (err && err.message) || err);
    return [];
  });
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { getStreams: getStreams };
} else {
  global.getStreams = getStreams;
}
