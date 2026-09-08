/**
 * PinoyMoviesHub Nuvio Plugin - Direct Streams Edition
 * Domain: pinoymovieshub.win (WordPress + Dooplay 2.5.5)
 * Supports: Movies & TV Shows
 * Language: Filipino / Tagalog / English
 * Author: xrexzerox
 * Version: 5.0.0
 *
 * v5.0.0 changelog:
 *  - Returns PLAYABLE direct streams: Mixdrop unpacked to direct mp4,
 *    DoodStream-family best-effort pass_md5 extraction, embed fallback.
 *  - Robust page resolution: direct slug guess -> Dooplay live search
 *    (/wp-json/dooplay/search/ with page-scraped nonce) -> series page
 *    episode map scraping (episode slugs may differ from series slugs).
 *  - Pure-regex HTML parsing (no cheerio) -> smaller + sandbox-safe.
 *  - Native 4-arg Nuvio signature getStreams(tmdbId, mediaType, season,
 *    episode) with legacy 3-arg remap kept.
 */

var PROVIDER_NAME = "PinoyMoviesHub";
var TMDB_API_KEY = "439c478a771f35c05022f9feabcca01c";
var BASE_URL = "https://pinoymovieshub.win";

var HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36",
  "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9"
};

// Dooplay search nonce cache (nonce is session-stable, ~24h server side).
var nonceCache = { value: "", ts: 0 };
var NONCE_TTL_MS = 6 * 60 * 60 * 1000;

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
    }, ms || 30000);
  });
  return Promise.race([fetch(url, options), killer]).then(
    function(res) { clearTimeout(timer); return res; },
    function(err) { clearTimeout(timer); throw err; }
  );
}

function fetchText(url, options) {
  options = options || {};
  return fetchWithTimeout(url, {
    method: options.method || "GET",
    redirect: options.redirect || "follow",
    headers: merge(HEADERS, options.headers || {}),
    body: options.body
  }, options.timeoutMs || 25000).then(function(res) {
    if (!res.ok) throw new Error("HTTP " + res.status);
    return res.text();
  });
}

function fetchJson(url, options) {
  options = options || {};
  return fetchWithTimeout(url, {
    method: options.method || "GET",
    redirect: options.redirect || "follow",
    headers: merge(HEADERS, options.headers || {}),
    body: options.body
  }, options.timeoutMs || 25000).then(function(res) {
    if (!res.ok) return null;
    return res.json();
  }).catch(function() { return null; });
}

function slugify(title) {
  return String(title || "").toLowerCase()
    .replace(/['\u2019]/g, "")
    .replace(/&/g, "and")
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function stripTags(html) {
  return String(html || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function attrValue(tag, name) {
  var re = new RegExp(name + "=['\"]([^'\"]*)['\"]", "i");
  var m = tag.match(re);
  return m ? m[1] : "";
}

function parseQuality(text) {
  var value = String(text || "").toLowerCase();
  var m = value.match(/\b(2160p|1440p|1080p|720p|480p|360p|4k|uhd|hd|sd|cam)\b/);
  if (m) {
    var q = m[1];
    if (q === "4k" || q === "uhd") return "2160p";
    if (q === "hd") return "720p";
    if (q === "sd") return "480p";
    if (q === "cam") return "CAM";
    return q;
  }
  return "Auto";
}

function inferLang(text) {
  var t = String(text || "").toLowerCase();
  if (t.indexOf("tagalog") !== -1 || t.indexOf("filipino") !== -1) return "Tagalog";
  if (t.indexOf("english") !== -1 || /\beng\b/.test(t)) return "English";
  if (t.indexOf("spanish") !== -1) return "Spanish";
  if (t.indexOf("korean") !== -1) return "Korean";
  if (t.indexOf("japanese") !== -1) return "Japanese";
  if (t.indexOf("chinese") !== -1) return "Chinese";
  if (t.indexOf("hindi") !== -1) return "Hindi";
  return "Tagalog";
}

function hostOf(url) {
  try { return new URL(url).hostname.replace(/^www\./, ""); } catch (e) { return ""; }
}

function randomToken(len) {
  var chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  var out = "";
  var i;
  for (i = 0; i < (len || 8); i++) {
    out += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return out;
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

// ===== DOOPLAY PAGE / SEARCH RESOLUTION =====

function getSearchNonce(forceRefresh) {
  var now = Date.now();
  if (!forceRefresh && nonceCache.value && (now - nonceCache.ts) < NONCE_TTL_MS) {
    return Promise.resolve(nonceCache.value);
  }
  return fetchText(BASE_URL + "/?s=1").then(function(html) {
    var m = html.match(/dtGonza\s*=\s*\{[^}]*?"nonce":"([a-f0-9]+)"/);
    if (m) {
      nonceCache.value = m[1];
      nonceCache.ts = Date.now();
      return m[1];
    }
    return "";
  }).catch(function() { return ""; });
}

function dooplaySearch(keyword, nonce) {
  var url = BASE_URL + "/wp-json/dooplay/search/?keyword=" + encodeURIComponent(keyword).replace(/%20/g, "+") + "&nonce=" + nonce;
  return fetchJson(url, {
    headers: { "X-Requested-With": "XMLHttpRequest", "Referer": BASE_URL + "/" }
  }).then(function(data) {
    if (!data || data.error || typeof data !== "object") return [];
    var results = [];
    var key;
    for (key in data) {
      if (!data.hasOwnProperty(key)) continue;
      var item = data[key];
      if (!item || !item.url) continue;
      results.push({
        postId: key,
        title: String(item.title || ""),
        url: String(item.url || ""),
        year: String((item.extra && item.extra.date) || "")
      });
    }
    return results;
  }).catch(function() { return []; });
}

/**
 * Search with one automatic retry: if the cached nonce went stale the
 * endpoint answers {"error":"no_verify_nonce"} (mapped to []), so force a
 * fresh nonce scrape and try again before giving up.
 */
function searchWithRetry(keyword) {
  return getSearchNonce(false).then(function(nonce) {
    if (!nonce) return [];
    return dooplaySearch(keyword, nonce).then(function(results) {
      if (results.length) return results;
      return getSearchNonce(true).then(function(fresh) {
        if (!fresh || fresh === nonce) return results;
        return dooplaySearch(keyword, fresh);
      });
    });
  });
}

function slugMatchScore(siteSlug, tmdbSlug) {
  if (!siteSlug || !tmdbSlug) return 0;
  if (siteSlug === tmdbSlug) return 100;
  if (siteSlug.indexOf(tmdbSlug + "-") === 0) return 90;
  if (siteSlug.indexOf(tmdbSlug) !== -1) return 70;
  if (tmdbSlug.indexOf(siteSlug) === 0) return 40;
  return 0;
}

function yearScore(siteYear, tmdbYear) {
  var a = parseInt(siteYear, 10);
  var b = parseInt(tmdbYear, 10);
  if (!a || !b) return 0;
  var diff = Math.abs(a - b);
  if (diff === 0) return 25;
  if (diff === 1) return 12;
  return 0;
}

function extractSectionSlug(url, section) {
  var m = String(url || "").match(new RegExp("/" + section + "/([^/?#]+)", "i"));
  return m ? m[1] : "";
}

function scoreMovieResults(results, tmdbSlug, tmdbYear) {
  var best = null, bestScore = 0, i, r, slug, score;
  for (i = 0; i < results.length; i++) {
    r = results[i];
    slug = extractSectionSlug(r.url, "movies");
    if (!slug) continue;
    score = slugMatchScore(slug, tmdbSlug) + yearScore(r.year, tmdbYear);
    if (score > bestScore) { bestScore = score; best = r; }
  }
  return bestScore >= 70 ? best : null;
}

function scoreSeriesResults(results, tmdbSlug, tmdbYear) {
  var best = null, bestScore = 0, i, r, slug, score;
  for (i = 0; i < results.length; i++) {
    r = results[i];
    slug = extractSectionSlug(r.url, "series");
    if (!slug) continue;
    score = slugMatchScore(slug, tmdbSlug) + yearScore(r.year, tmdbYear);
    if (score > bestScore) { bestScore = score; best = r; }
  }
  return bestScore >= 70 ? best : null;
}

function scoreEpisodeResults(results, tmdbSlug, season, episode) {
  var i, r, slug;
  var suffix = "-" + season + "x" + episode;
  for (i = 0; i < results.length; i++) {
    r = results[i];
    slug = extractSectionSlug(r.url, "episodes");
    if (!slug) continue;
    if (slug.indexOf(suffix, slug.length - suffix.length) !== -1 && slug.indexOf(tmdbSlug) !== -1) {
      return r;
    }
  }
  return null;
}

/**
 * Dooplay renders every season server-side as:
 *   <div class='numerando'>S - E</div> ... <a href='.../episodes/SLUG-SxE'>Title</a>
 * Walk numerando positions and take the first /episodes/ href before the
 * next numerando marker. Episode slugs frequently differ from the series
 * slug (e.g. series "cobra-kai-tagalog-dubbed" -> episodes "cobra-kai-5x1"),
 * so guessing from the series slug alone is not reliable.
 */
function findEpisodeUrlInSeries(html, season, episode) {
  var re = /numerando['"]>\s*(\d+)\s*-\s*(\d+)\s*</gi;
  var positions = [];
  var m;
  while ((m = re.exec(html)) !== null) {
    positions.push({ s: parseInt(m[1], 10), e: parseInt(m[2], 10), idx: m.index });
  }
  var i, end, seg, href;
  for (i = 0; i < positions.length; i++) {
    if (positions[i].s === season && positions[i].e === episode) {
      end = (i + 1 < positions.length) ? positions[i + 1].idx : Math.min(html.length, positions[i].idx + 6000);
      seg = html.substring(positions[i].idx, end);
      href = seg.match(/href=['"]([^'"]*\/episodes\/[^'"]+)['"]/i);
      if (href) {
        if (href[1].indexOf("http") === 0) return href[1];
        return BASE_URL + (href[1].charAt(0) === "/" ? href[1] : "/" + href[1]);
      }
    }
  }
  return null;
}

function absoluteUrl(url) {
  if (!url) return "";
  if (url.indexOf("http") === 0) return url;
  return BASE_URL + (url.charAt(0) === "/" ? url : "/" + url);
}

/**
 * Resolve the concrete PMH page (movie page or episode page) for a title.
 * Returns Promise<pageUrl:string|null>.
 */
function resolvePageUrl(mediaType, tmdb, season, episode) {
  var tmdbSlug = slugify(tmdb.title);
  var altSlug = slugify(tmdb.original);
  var pageUrl;
  var tryFetchPlayers = function(url) {
    return fetchText(url).then(function(html) {
      return hasPlayerOptions(html) ? html : null;
    }).catch(function() { return null; });
  };

  if (mediaType === "movie") {
    pageUrl = BASE_URL + "/movies/" + tmdbSlug;
    return tryFetchPlayers(pageUrl).then(function(html) {
      if (html) return { url: pageUrl, html: html };
      if (altSlug && altSlug !== tmdbSlug) {
        var altUrl = BASE_URL + "/movies/" + altSlug;
        return tryFetchPlayers(altUrl).then(function(html2) {
          if (html2) return { url: altUrl, html: html2 };
          return { url: "", html: "" }; // fall through to search
        });
      }
      return { url: "", html: "" };
    });
  }

  // TV: guess /episodes/{slug}-{s}x{e} first.
  pageUrl = BASE_URL + "/episodes/" + tmdbSlug + "-" + season + "x" + episode;
  return tryFetchPlayers(pageUrl).then(function(html) {
    if (html) return { url: pageUrl, html: html };
    return getSearchNonce(false).then(function(nonce) {
      if (!nonce) return { url: "", html: "" };
      return searchWithRetry(tmdb.title).then(function(results) {
        // 1) an exact episode page from search
        var ep = scoreEpisodeResults(results, tmdbSlug, season, episode);
        if (ep) {
          return tryFetchPlayers(absoluteUrl(ep.url)).then(function(html3) {
            if (html3) return { url: absoluteUrl(ep.url), html: html3 };
            return { url: "", html: "" };
          });
        }
        // 2) series page from search -> scrape episode map
        var series = scoreSeriesResults(results, tmdbSlug, tmdb.year);
        var seriesUrl = series ? absoluteUrl(series.url) : "";
        var fetchSeries = seriesUrl
          ? fetchText(seriesUrl)
          : Promise.resolve("");
        return fetchSeries.then(function(seriesHtml) {
          if (seriesHtml) {
            var epUrl = findEpisodeUrlInSeries(seriesHtml, season, episode);
            if (epUrl) {
              return tryFetchPlayers(epUrl).then(function(html4) {
                if (html4) return { url: epUrl, html: html4 };
                return { url: "", html: "" };
              });
            }
          }
          // 3) last resort: guess episode URL from the series slug
          if (series) {
            var sSlug = extractSectionSlug(series.url, "series");
            if (sSlug) {
              var guess = BASE_URL + "/episodes/" + sSlug + "-" + season + "x" + episode;
              return tryFetchPlayers(guess).then(function(html5) {
                if (html5) return { url: guess, html: html5 };
                return { url: "", html: "" };
              });
            }
          }
          return { url: "", html: "" };
        });
      });
    });
  });
}

// ===== DOOPLAY PLAYER OPTIONS =====

function hasPlayerOptions(html) {
  return /dooplay_player_option[^>]*data-post=['"]?\d+/i.test(html) ||
         /data-post=['"]\d+['"][^>]*data-type=['"][^'"]+['"]/i.test(html);
}

function extractPlayerOptions(html) {
  var options = [];
  var seen = {};
  var m;
  var liRe = /<li[^>]*class=['"][^'"]*dooplay_player_option[^'"]*['"][^>]*>([\s\S]*?)<\/li>/gi;
  while ((m = liRe.exec(html)) !== null) {
    var tag = m[0];
    var post = attrValue(tag, "data-post") || attrValue(tag, "data-id");
    if (!post) continue;
    var type = attrValue(tag, "data-type") || "movie";
    var nume = attrValue(tag, "data-nume") || attrValue(tag, "data-source") || "1";
    var labelMatch = m[1].match(/<span[^>]*class=['"][^'"]*title[^'"]*['"][^>]*>([^<]*)<\//i);
    var label = labelMatch ? stripTags(labelMatch[1]) : "";
    var key = post + "-" + nume;
    if (seen[key]) continue;
    seen[key] = 1;
    options.push({ post: post, type: type, nume: nume, label: label });
  }
  if (!options.length) {
    var tagRe = /<[^>]*data-post=['"](\d+)['"][^>]*>/gi;
    while ((m = tagRe.exec(html)) !== null) {
      var tag2 = m[0];
      var post2 = m[1];
      var type2 = attrValue(tag2, "data-type") || "movie";
      var nume2 = attrValue(tag2, "data-nume") || attrValue(tag2, "data-source") || "1";
      var key2 = post2 + "-" + nume2;
      if (seen[key2]) continue;
      seen[key2] = 1;
      options.push({ post: post2, type: type2, nume: nume2, label: "" });
    }
  }
  console.log("[PinoyMoviesHub] Found", options.length, "player option(s)");
  return options;
}

function callDooPlayerAPI(player, pageUrl) {
  var apiUrl = BASE_URL + "/wp-json/dooplayer/v2/" + player.post + "/" + player.type + "/" + player.nume;
  return fetchJson(apiUrl, {
    headers: {
      "X-Requested-With": "XMLHttpRequest",
      "Referer": pageUrl || BASE_URL + "/"
    }
  }).then(function(data) {
    if (!data) return "";
    if (Object.prototype.toString.call(data) === "[object Array]") data = data[0];
    if (!data) return "";
    var embedUrl = data.embed_url || data.url || data.source || data.link || data.file || data.src;
    if (!embedUrl && data.data) {
      embedUrl = data.data.embed_url || data.data.url || data.data.source;
    }
    if (!embedUrl && (data.html || data.iframe)) {
      var m = String(data.html || data.iframe).match(/src=['"]([^'"]+)['"]/i);
      if (m) embedUrl = m[1];
    }
    return embedUrl ? String(embedUrl) : "";
  }).catch(function() { return ""; });
}

// ===== EXTRACTOR: MIXDROP (direct mp4 via Dean Edwards unpacker) =====

function jsUnescape(s) {
  return String(s).replace(/\\(u[0-9a-fA-F]{4}|x[0-9a-fA-F]{2}|[0-3][0-7]{0,2}|[\\nrtbfv'"0])/g, function(all, esc) {
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
      case "'": return "'";
      case '"': return '"';
      default: return esc;
    }
  });
}

/**
 * Pure-JS Dean Edwards packer unpacker (p,a,c,k,e,d).
 * Mixdrop embeds the player config in an eval(function(p,a,c,k,e,d){...})
 * payload containing MDCore.wurl (the direct file URL).
 */
function unpackPacker(packed) {
  // Canonical Dean Edwards single-quoted layout:
  // }('payload',base,count,'k0|k1|...'.split('|'),0,{})
  var m = String(packed).match(/\}\s*\(\s*'((?:\\.|[^'\\])*)'\s*,\s*\d+\s*,\s*(\d+)\s*,\s*'([^']*)'\.split\('\|'\)/);
  if (!m) return "";
  var payload = jsUnescape(m[1]);
  var keys = jsUnescape(m[3]).split("|");
  var dict = {};
  var i;
  for (i = 0; i < keys.length; i++) dict[String(i)] = keys[i];
  return payload.replace(/\b\w+\b/g, function(w) {
    return (dict[w] !== undefined && dict[w] !== "") ? dict[w] : w;
  });
}

function extractMixdropDirect(embedUrl) {
  return fetchText(embedUrl, {
    headers: {
      "Referer": BASE_URL + "/",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
    }
  }).then(function(html) {
    var packedMatch = html.match(/eval\(function\(p,a,c,k,e,d\)[\s\S]{0,3000}?\}\)\)/);
    var unpacked = packedMatch ? unpackPacker(packedMatch[0]) : "";
    var wurl = "";
    var m = unpacked.match(/MDCore\.wurl\s*=\s*["']([^"']*)["']/);
    if (m) wurl = m[1];
    if (!wurl) {
      m = html.match(/MDCore\.wurl\s*=\s*["']([^"']*)["']/);
      if (m) wurl = m[1];
    }
    if (!wurl || wurl === " " || wurl.length < 6) return null;
    if (wurl.indexOf("//") === 0) wurl = "https:" + wurl;
    else if (wurl.indexOf("http") !== 0) wurl = "https://" + wurl.replace(/^\/+/, "");
    var host = hostOf(embedUrl);
    return {
      url: wurl,
      headers: { Referer: "https://" + host + "/", "User-Agent": HEADERS["User-Agent"] }
    };
  }).catch(function(e) {
    console.log("[PinoyMoviesHub] mixdrop extract failed:", e.message);
    return null;
  });
}

// ===== EXTRACTOR: DOODSTREAM FAMILY (best-effort pass_md5 flow) =====

function isDoodFamily(host) {
  var h = String(host || "").toLowerCase();
  if (h.indexOf("dood") !== -1) return true;
  if (h.indexOf("dsvplay") !== -1 || h.indexOf("dooo") !== -1) return true;
  // known dood-clone custom domains used by PMH
  var known = ["playmogo.com", "myvidplay.com", "dsvplay.com", "d000d.com", "dooood.com", "ds2play.com", "ds2play2.com", "doodcdn.io"];
  var i;
  for (i = 0; i < known.length; i++) {
    if (h === known[i] || h.indexOf(known[i]) !== -1) return true;
  }
  return false;
}

function isMixdrop(host) {
  var h = String(host || "").toLowerCase();
  // mixdrop.top, mixdrop.co, mixdrp.co, mxdrop.to, miixdrop.top, mixdroop.co ...
  return /mixdrop|mixdrp|mxdrop|miixdrop|mixdroop/.test(h);
}

function extractDoodDirect(embedUrl) {
  var embedHost = hostOf(embedUrl);
  var embedId = "";
  var m = embedUrl.match(/\/e\/([a-z0-9]+)/i);
  if (m) embedId = m[1];
  if (!embedHost || !embedId) return Promise.resolve(null);

  var embedPageUrl = "https://" + embedHost + "/e/" + embedId;
  var downloadPageUrl = "https://" + embedHost + "/d/" + embedId;
  var qualityHint = "";

  return fetchText(embedPageUrl, {
    headers: { Referer: BASE_URL + "/" }
  }).then(function(embedHtml) {
    var titleMatch = embedHtml.match(/<title[^>]*>([^<]*)<\/title>/i);
    qualityHint = titleMatch ? titleMatch[1] : "";
    // Some dood clones embed the pass_md5 token directly in the embed page.
    var direct = embedHtml.match(/\/pass_md5\/([a-z0-9]+)/i);
    if (direct) return direct[1];
    // Standard flow: /d/{id} with the dref_url cookie the embed sets client-side.
    return fetchText(downloadPageUrl, {
      headers: {
        Referer: embedPageUrl,
        Cookie: "dref_url=" + encodeURIComponent(embedPageUrl)
      }
    }).then(function(dHtml) {
      var tMatch = dHtml.match(/<title[^>]*>([^<]*)<\/title>/i);
      if (tMatch && !qualityHint) qualityHint = tMatch[1];
      var d = dHtml.match(/\/pass_md5\/([a-z0-9]+)/i);
      return d ? d[1] : null;
    });
  }).then(function(token) {
    if (!token) return null;
    var passUrl = "https://" + embedHost + "/pass_md5/" + token;
    return fetchText(passUrl, {
      headers: { Referer: downloadPageUrl }
    }).then(function(body) {
      var base = String(body).trim();
      if (base.indexOf("http") !== 0) return null;
      var expiry = Date.now() + 2 * 60 * 60 * 1000;
      var direct = base + randomToken(8) + "?token=" + token + "&expiry=" + expiry;
      return {
        url: direct,
        quality: parseQuality(qualityHint),
        headers: { Referer: downloadPageUrl, "User-Agent": HEADERS["User-Agent"] }
      };
    });
  }).catch(function(e) {
    console.log("[PinoyMoviesHub] dood extract failed (" + embedHost + "):", e.message);
    return null;
  });
}

// ===== STREAM BUILDER =====

function shortLabel(player) {
  var label = String((player && player.label) || "");
  label = label.replace(/^watch\s*online\s*[-:]\s*/i, "").trim();
  return label || "Source " + ((player && player.nume) || "?");
}

function buildStream(displayTitle, player, resolved, meta) {
  // resolved: { kind: "direct"|"embed", url, headers, quality? }
  var host = hostOf(resolved.url);
  var lang = inferLang((player && player.label) || "");
  var label = shortLabel(player);
  var q = resolved.kind === "direct"
    ? (resolved.quality && resolved.quality !== "Auto" ? resolved.quality : parseQuality(label))
    : "Browser";

  var line1 = meta.isSeries
    ? "S" + meta.season + "E" + meta.episode + (meta.episodeTitle ? " - " + meta.episodeTitle : "") + " | " + displayTitle
    : displayTitle;
  var line2 = (resolved.kind === "direct" ? "Direct | " + q : "Embed page") + " | " + lang + (host ? " | " + host : "");
  var line3 = label;

  return {
    name: PROVIDER_NAME + " | " + label + " | " + (resolved.kind === "direct" ? q : "Embed"),
    title: line1 + "\n" + line2 + "\n" + line3,
    url: resolved.url,
    quality: resolved.kind === "direct" ? q : "Auto",
    headers: resolved.headers || { Referer: BASE_URL },
    behaviorHints: {
      bingeGroup: "pinoymovieshub-" + (resolved.kind === "direct" ? "direct" : "embed"),
      notWebReady: resolved.kind !== "direct"
    }
  };
}

// ===== MAIN ENTRY =====

function getStreams(tmdbId, mediaType, season, episode) {
  // Legacy signatures:
  //   getStreams(tmdbId, season, episode)               -> mediaType undefined
  //   getStreams(tmdbId, mediaType, season, episode)    -> Nuvio contract (4 args)
  if (mediaType !== "movie" && mediaType !== "tv") {
    // shift: mediaType slot actually held season (or nothing)
    episode = season;
    season = mediaType;
    mediaType = "";
  }

  try { tmdbId = String(tmdbId); } catch (e) { tmdbId = ""; }
  season = (season === undefined || season === null || season === "") ? "" : String(season).replace(/^s/i, "").replace(/[^0-9]/g, "");
  episode = (episode === undefined || episode === null || episode === "") ? "" : String(episode).replace(/^e/i, "").replace(/[^0-9]/g, "");

  console.log("[PinoyMoviesHub] === START tmdbId=" + tmdbId + " type=" + mediaType + " S" + season + "E" + episode + " ===");

  if (!tmdbId) return Promise.resolve([]);

  var forceTv = mediaType === "tv" || (!!(season && episode) && !mediaType);

  var tmdbPromise = mediaType === "movie"
    ? tmdbLookup("movie", tmdbId).then(function(r) { return r || getTmdbInfoAuto(tmdbId); })
    : forceTv
      ? tmdbLookup("tv", tmdbId).then(function(r) { return r || { type: "", title: "", original: "", year: "", raw: null }; })
      : getTmdbInfoAuto(tmdbId);

  return tmdbPromise.then(function(tmdb) {
    if (!tmdb || !tmdb.type || !tmdb.title) {
      console.log("[PinoyMoviesHub] Could not detect media for TMDB ID:", tmdbId);
      return [];
    }
    var type = tmdb.type;
    console.log("[PinoyMoviesHub] type=" + type + " | title=" + tmdb.title + " | year=" + tmdb.year);

    if (type === "tv" && (!season || !episode)) {
      console.log("[PinoyMoviesHub] TV show requires season and episode");
      return [];
    }

    var epPromise = type === "tv"
      ? getTmdbEpisodeTitle(tmdbId, season, episode)
      : Promise.resolve("");

    return epPromise.then(function(episodeTitle) {
      var meta = {
        isSeries: type === "tv",
        season: season,
        episode: episode,
        episodeTitle: episodeTitle
      };
      var displayTitle = meta.isSeries
        ? tmdb.title + " S" + season + "E" + episode
        : tmdb.title;

      return resolvePageUrl(type, tmdb, season, episode).then(function(page) {
        var html = page && page.html;
        if (!html) {
          console.log("[PinoyMoviesHub] No PMH page/players found for \"" + tmdb.title + "\"");
          return [];
        }
        var options = extractPlayerOptions(html);
        if (!options.length) return [];

        // Prefer real sources; only fall back to trailer posts when nothing else exists.
        var realOptions = [];
        var trailerOptions = [];
        var oi;
        for (oi = 0; oi < options.length; oi++) {
          if (/trailer/i.test(options[oi].label || "")) trailerOptions.push(options[oi]);
          else realOptions.push(options[oi]);
        }
        var chosen = realOptions.length ? realOptions : trailerOptions;

        return Promise.all(chosen.slice(0, 8).map(function(player) {
          return callDooPlayerAPI(player, page.url).then(function(embedUrl) {
            if (!embedUrl) return null;
            var host = hostOf(embedUrl);
            var extractor = null;

            if (isMixdrop(host)) {
              extractor = extractMixdropDirect(embedUrl);
            } else if (isDoodFamily(host)) {
              extractor = extractDoodDirect(embedUrl);
            } else {
              // Unknown host: content-sniff for a mixdrop-style player
              // (auto-covers future mirror domains), else embed fallback.
              extractor = extractMixdropDirect(embedUrl).then(function(direct) {
                return (direct && direct.url) ? direct : null;
              });
            }

            return extractor.then(function(direct) {
              if (direct && direct.url && direct.headers) {
                return buildStream(displayTitle, player, {
                  kind: "direct",
                  url: direct.url,
                  headers: direct.headers,
                  quality: direct.quality
                }, meta);
              }
              // Extraction blocked (e.g. dood captcha) -> embed fallback
              return buildStream(displayTitle, player, { kind: "embed", url: embedUrl }, meta);
            });
          });
        })).then(function(results) {
          var streams = [];
          var i;
          for (i = 0; i < results.length; i++) {
            if (results[i]) streams.push(results[i]);
          }
          console.log("[PinoyMoviesHub] Returning", streams.length, "stream(s)");
          return streams;
        });
      });
    });
  }).catch(function(err) {
    console.error("[PinoyMoviesHub] error:", (err && err.message) || err);
    return [];
  });
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { getStreams: getStreams };
} else {
  global.getStreams = getStreams;
}
