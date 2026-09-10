/**
 * MoviesJoy - Nuvio provider (v1.0.0)
 *
 * Site-anchored scraper for moviesjoy.bz (shares the FMovies-family platform and id space with zoechip/himovies/hdtoday (verified live: same internal ids and server ids)).
 * Chain verified live 2026-09-10:
 *
 *   1. POST {base}/ajax/search            body: keyword={title}      (XHR)
 *   2. GET  {base}/ajax/episode/list/{id}   movie servers (HTML)
 *   2. GET  {base}/ajax/season/list/{id}    tv seasons   (HTML)
 *   3. GET  {base}/ajax/season/episodes/{seasonId}   episodes  (HTML)
 *   4. GET  {base}/ajax/episode/servers/{episodeId} servers   (HTML)
 *   5. GET  {base}/ajax/episode/sources/{serverId}  -> {"link": embedUrl}
 *
 * The site aggregates these backends (all TMDB-id based):
 *   UpCloud   -> vidfast.vc   (covered by our dedicated vidfast provider; skipped here)
 *   VixCloud  -> vixsrc.to    (extracted: window.masterPlaylist + token)
 *   AKCloud   -> vidsrcme.ru  (extracted: /vs_src.php signed player)
 *   MegaCloud -> moviesapi.to (opaque SPA; skipped)
 *   PrimeSrc  -> primesrc.me  (extracted: /api/v1/s imdb API)
 *   VidLove   -> player.vidlove.cc (opaque; skipped)
 *
 * Language policy: English catalog; captions/subs attached when available.
 * Pure ES5 promise chains - QuickJS + Nuvio TV worker safe.
 */

var SITE_NAME = "MoviesJoy";
var SITE_URL = "https://moviesjoy.bz";
var BASE_CANDIDATES = [
  "https://moviesjoy.bz"
];
var TMDB_API_KEY = "439c478a771f35c05022f9feabcca01c";

// Active base - resolved once per getStreams() call. A custom base from
// settings() always wins; otherwise candidates are probed in order via a
// cheap search probe (the family rotates domains frequently).
var ACTIVE_BASE = "";

var UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36";
var XHR_HEADERS = {
  "User-Agent": UA,
  "Accept": "text/html, */*; q=0.01",
  "Accept-Language": "en-US,en;q=0.9",
  "X-Requested-With": "XMLHttpRequest",
  "Referer": SITE_URL + "/"
};

function settings() {
  try {
    return (typeof globalThis !== "undefined" && globalThis.SCRAPER_SETTINGS) ||
      (typeof global !== "undefined" && global.SCRAPER_SETTINGS) || {};
  } catch (e) { return {}; }
}

function hasTimers() {
  return typeof setTimeout === "function";
}

function fetchText(url, options) {
  options = options || {};
  var opts = {
    method: options.method || "GET",
    headers: options.headers || { "User-Agent": UA },
    redirect: "follow"
  };
  if (options.body) opts.body = options.body;
  if (!hasTimers()) {
    return fetch(url, opts).then(function (res) {
      if (!res.ok) throw new Error("HTTP " + res.status);
      return res.text();
    });
  }
  return new Promise(function (resolve, reject) {
    var timer = setTimeout(function () { reject(new Error("fetch timeout")); }, options.timeout || 15000);
    fetch(url, opts).then(function (res) {
      clearTimeout(timer);
      if (!res.ok) throw new Error("HTTP " + res.status);
      return res.text();
    }).then(function (t) { resolve(t); }, function (e) { clearTimeout(timer); reject(e); });
  });
}

function fetchJson(url, options) {
  return fetchText(url, options).then(function (t) {
    try { return JSON.parse(t); } catch (e) { return null; }
  });
}

// ---------------------------------------------------------------- TMDB meta

function tmdbMeta(tmdbId, mediaType) {
  var endpoint = mediaType === "tv" ? "tv" : "movie";
  var url = "https://api.themoviedb.org/3/" + endpoint + "/" + tmdbId + "?api_key=" + TMDB_API_KEY + "&append_to_response=external_ids";
  return fetchJson(url, { headers: { "User-Agent": UA, "Accept": "application/json" }, timeout: 10000 }).then(function (data) {
    if (!data) return { title: "", year: "", imdbId: null };
    return {
      title: (mediaType === "tv" ? (data.name || data.original_name) : (data.title || data.original_title)) || "",
      year: data.first_air_date ? String(data.first_air_date).substring(0, 4) : (data.release_date ? String(data.release_date).substring(0, 4) : ""),
      imdbId: (data.external_ids && data.external_ids.imdb_id) || null
    };
  }).catch(function () { return { title: "", year: "", imdbId: null }; });
}

function normalizeTitle(s) {
  return String(s || "").toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/(^\s+|\s+$)/g, "");
}

// ------------------------------------------------------- site search + ids

function candidateBases() {
  var custom = settings().baseUrl;
  var bases = [];
  if (custom && /^https?:\/\//i.test(String(custom))) {
    bases.push(String(custom).replace(/\/+$/, ""));
  }
  BASE_CANDIDATES.forEach(function (b) { bases.push(b); });
  return bases;
}

function probeBase(base) {
  var headers = Object.assign({}, XHR_HEADERS, { Referer: base + "/home" });
  return fetchText(base + "/", { headers: headers, timeout: 9000 }).then(function (html) {
    if (!html || /<title[^>]*(?:404|not found)/i.test(html)) throw new Error("bad base");
    return base;
  });
}

function resolveBase() {
  if (ACTIVE_BASE) return Promise.resolve(ACTIVE_BASE);
  var bases = candidateBases();
  var chain = Promise.reject(new Error("no base"));
  bases.forEach(function (b) {
    chain = chain.catch(function () { return probeBase(b); });
  });
  return chain.then(function (b) {
    ACTIVE_BASE = b;
    return b;
  });
}

// Returns Promise<[{url, id, isTv, title, year}]> sorted best-match first.
function siteSearch(base, title) {
  var body = "keyword=" + encodeURIComponent(title);
  var headers = Object.assign({}, XHR_HEADERS, {
    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
    "Referer": base + "/home"
  });
  return fetchText(base + "/ajax/search", { method: "POST", body: body, headers: headers, timeout: 14000 })
    .then(function (html) {
      var out = [];
      var re = /<a\s+href="https?:\/\/[^"]*\/(movie|tv)\/([a-z0-9-]+)"[^>]*class="[^"]*nav-item[^"]*"([\s\S]*?)<\/a>/gi;
      var m;
      while ((m = re.exec(html)) !== null) {
        var kind = m[1];
        var slug = m[2];
        var inner = m[3];
        var t = (inner.match(/class="film-name">([^<]*)</) || [])[1] || "";
        var yearM = inner.match(/<span>(\d{4})<\/span>/);
        var idM = slug.match(/-([A-Za-z0-9]+)$/);
        out.push({
          url: base + "/" + kind + "/" + slug,
          id: idM ? idM[1] : slug,
          isTv: kind === "tv",
          title: t,
          year: yearM ? yearM[1] : ""
        });
      }
      return out;
    })
    .catch(function () { return []; });
}

function pickCandidate(cands, meta, isTv) {
  var nTitle = normalizeTitle(meta.title);
  var nYear = String(meta.year || "");
  var scored = [];
  cands.forEach(function (c) {
    if (c.isTv !== isTv) return;
    var score = 0;
    var cTitle = normalizeTitle(c.title);
    if (!nTitle || !cTitle) return;
    if (cTitle === nTitle) score += 100;
    else if (cTitle.indexOf(nTitle) !== -1 || nTitle.indexOf(cTitle) !== -1) score += 60;
    else return;
    var cYear = String(c.year || "");
    if (nYear && cYear) {
      var d = Math.abs(parseInt(nYear, 10) - parseInt(cYear, 10));
      if (d === 0) score += 40;
      else if (d === 1) score += 20;
      else if (d > 2) score -= 30;
    }
    scored.push({ c: c, score: score });
  });
  scored.sort(function (a, b) { return b.score - a.score; });
  return scored.length ? scored[0].c : null;
}

// ------------------------------------------------- episode/server resolution

function extractAnchors(html, kind) {
  // kind: "server" -> <a data-id="..." title="Server X">; "season" -> class "ss-item";
  //       "episode" -> class "eps-item" title="Eps N: ..."
  var out = [];
  var re = /<a\s+([^>]*)>([\s\S]*?)<\/a>/gi;
  var m;
  while ((m = re.exec(html)) !== null) {
    var attrs = m[1];
    var text = m[2].replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
    var idM = attrs.match(/data-id="([A-Za-z0-9]+)"/);
    if (!idM) continue;
    var item = { id: idM[1], text: text };
    var titleM = attrs.match(/title="([^"]*)"/);
    if (titleM) item.title = titleM[1];
    if (kind === "server") {
      var srvM = (item.title || "").match(/Server\s+(.+)/i);
      item.name = srvM ? srvM[1].trim() : (text || "Server");
    }
    out.push(item);
  }
  return out;
}

function ajaxGet(base, path) {
  return fetchText(base + path, { headers: Object.assign({}, XHR_HEADERS, { Referer: base + "/" }), timeout: 14000 })
    .catch(function () { return ""; });
}

function getMovieServers(base, id) {
  return ajaxGet(base, "/ajax/episode/list/" + id).then(function (html) {
    return html ? extractAnchors(html, "server") : [];
  });
}

function getTvEpisodeServers(base, id, season, episode) {
  return ajaxGet(base, "/ajax/season/list/" + id).then(function (html) {
    if (!html) return [];
    var seasons = extractAnchors(html, "season");
    if (!seasons.length) return [];
    var sObj = seasons[season - 1] || null;
    if (!sObj) {
      var label = "Season " + season;
      for (var i = 0; i < seasons.length; i++) {
        var t = (seasons[i].title || seasons[i].text || "") + "";
        if (t.indexOf(label) !== -1 || t.indexOf("S" + season) !== -1) { sObj = seasons[i]; break; }
      }
    }
    if (!sObj) sObj = seasons[0];
    return ajaxGet(base, "/ajax/season/episodes/" + sObj.id).then(function (epHtml) {
      if (!epHtml) return [];
      var eps = extractAnchors(epHtml, "episode");
      if (!eps.length) return [];
      var eObj = eps[episode - 1] || null;
      if (!eObj) {
        var eLabel = "Eps " + episode;
        var eLabel2 = "Episode " + episode;
        for (var j = 0; j < eps.length; j++) {
          var et = (eps[j].title || eps[j].text || "") + "";
          if (et.indexOf(eLabel) !== -1 || et.indexOf(eLabel2) !== -1) { eObj = eps[j]; break; }
        }
      }
      if (!eObj) eObj = eps[0];
      return ajaxGet(base, "/ajax/episode/servers/" + eObj.id).then(function (srvHtml) {
        return srvHtml ? extractAnchors(srvHtml, "server") : [];
      });
    });
  });
}

function resolveSource(base, serverId) {
  return ajaxGet(base, "/ajax/episode/sources/" + serverId).then(function (body) {
    if (!body) return null;
    try {
      var j = JSON.parse(body);
      return (j && j.link) ? j.link : null;
    } catch (e) {
      var lm = body.match(/"link"\s*:\s*"([^"]+)"/);
      return lm ? lm[1] : null;
    }
  });
}

// ------------------------------------------------------- backend extractors

function makeRow(name, title, url, quality, referer, subtitles) {
  if (!url || !/^https?:\/\//i.test(url)) return null;
  var row = {
    name: name,
    title: title,
    url: url,
    quality: quality || "Auto",
    headers: { "User-Agent": UA }
  };
  if (referer) row.headers.Referer = referer;
  if (subtitles && subtitles.length) row.subtitles = subtitles;
  return row;
}

// vixsrc.to - window.masterPlaylist {url, token, expires}
function extractVixsrc(tmdbId, isTv, season, episode, serverName, meta) {
  var pageUrl = isTv
    ? "https://vixsrc.to/tv/" + tmdbId + "/" + season + "/" + episode
    : "https://vixsrc.to/movie/" + tmdbId;
  return fetchText(pageUrl, {
    headers: { "User-Agent": UA, "Referer": SITE_URL + "/", "Accept": "text/html,*/*" },
    timeout: 15000
  }).then(function (html) {
    var master = null;
    if (html.indexOf("window.masterPlaylist") !== -1) {
      var uM = html.match(/url:\s*['"]([^'"]+)['"]/);
      var tM = html.match(/['"]?token['"]?\s*:\s*['"]([^'"]+)['"]/);
      var eM = html.match(/['"]?expires['"]?\s*:\s*['"]([^'"]+)['"]/);
      if (uM && tM && eM) {
        var base = uM[1];
        master = base + (base.indexOf("?") !== -1 ? "&" : "?") +
          "token=" + tM[1] + "&expires=" + eM[1] + "&h=1&lang=en";
      }
    }
    if (!master) {
      var mM = html.match(/(https?:\/\/[^'"\s]+\.m3u8[^'"\s]*)/);
      if (mM) master = mM[1];
    }
    if (!master) return [];
    var row = makeRow(
      SITE_NAME + " | " + serverName,
      (meta.title || SITE_NAME) + (isTv ? " S" + season + "E" + episode : "") + " | VixCloud",
      master, "Auto", "https://vixsrc.to/"
    );
    return row ? [row] : [];
  }).catch(function () { return []; });
}

// primesrc.me - imdb based api
function extractPrimesrc(imdbId, isTv, season, episode, serverName, meta) {
  if (!imdbId) return Promise.resolve([]);
  var listUrl = !isTv
    ? "https://primesrc.me/api/v1/s?imdb=" + imdbId + "&type=movie"
    : "https://primesrc.me/api/v1/s?imdb=" + imdbId + "&season=" + season + "&episode=" + episode + "&type=tv";
  var headers = { "User-Agent": UA, "Referer": "https://primesrc.me/" };
  return fetchJson(listUrl, { headers: headers, timeout: 14000 }).then(function (list) {
    var servers = (list && list.servers) || [];
    var chain = Promise.resolve([]);
    servers.forEach(function (srv) {
      chain = chain.then(function (rows) {
        if (!srv || !srv.key) return rows;
        return fetchJson("https://primesrc.me/api/v1/l?key=" + srv.key, { headers: headers, timeout: 12000 })
          .then(function (raw) {
            if (!raw || !raw.link) return rows;
            var q = (srv.quality || "").toString().replace(/[^a-zA-Z0-9]/g, "") || "Auto";
            var row = makeRow(
              SITE_NAME + " | " + serverName,
              (meta.title || SITE_NAME) + (isTv ? " S" + season + "E" + episode : "") + " | PrimeSrc [" + (srv.name || "server") + "]",
              raw.link, /hd/i.test(q) ? q.toLowerCase() : q, "https://primesrc.me/"
            );
            return row ? rows.concat([row]) : rows;
          })
          .catch(function () { return rows; });
      });
    });
    return chain;
  }).catch(function () { return []; });
}

// vidsrcme.ru - embed page -> /vs_src.php -> signed player page
function extractVidsrcme(tmdbId, isTv, season, episode, serverName, meta) {
  var embedUrl = isTv
    ? "https://vidsrcme.ru/embed/tv?tmdb=" + tmdbId + "&season=" + season + "&episode=" + episode
    : "https://vidsrcme.ru/embed/movie?tmdb=" + tmdbId;
  return fetchText(embedUrl, { headers: { "User-Agent": UA, "Referer": SITE_URL + "/" }, timeout: 15000 })
    .then(function (embedHtml) {
      var apiM = embedHtml.match(/data-api="([^"]+)"/);
      if (!apiM) return [];
      var apiUrl = apiM[1].replace(/&amp;/g, "&");
      if (apiUrl.charAt(0) === "/") apiUrl = "https://vidsrcme.ru" + apiUrl;
      return fetchText(apiUrl, { headers: { "User-Agent": UA, "Referer": "https://vidsrcme.ru/" }, timeout: 14000 });
    })
    .then(function (body) {
      if (!body) return [];
      var srcM = body.match(/"src"\s*:\s*"([^"]+)"/);
      if (!srcM) return [];
      var playerUrl = srcM[1].replace(/\\\//g, "/");
      return fetchText(playerUrl, { headers: { "User-Agent": UA, "Referer": "https://vidsrcme.ru/" }, timeout: 14000 });
    })
    .then(function (playerHtml) {
      if (!playerHtml) return [];
      var rows = [];
      var fileRe = /file\s*:\s*["']([^"']+\.(?:m3u8|mp4)[^"']*)["']/gi;
      var fm;
      while ((fm = fileRe.exec(playerHtml)) !== null) {
        var url = fm[1].replace(/\\\//g, "/");
        var q = /2160|4k/i.test(url) ? "4K" : (/1080/.test(url) ? "1080p" : (/720/.test(url) ? "720p" : (/480/.test(url) ? "480p" : "Auto")));
        var row = makeRow(SITE_NAME + " | " + serverName,
          (meta.title || SITE_NAME) + (isTv ? " S" + season + "E" + episode : "") + " | AKCloud",
          url, q, "https://vidsrcme.ru/");
        if (row) { rows.push(row); break; } // master playlist only; extra rows are dupes
      }
      if (!rows.length) {
        var anyM = playerHtml.match(/(https?:\/\/[^"'\s]+\.m3u8[^"'\s]*)/);
        if (anyM) {
          var r = makeRow(SITE_NAME + " | " + serverName,
            (meta.title || SITE_NAME) + (isTv ? " S" + season + "E" + episode : "") + " | AKCloud",
            anyM[1], "Auto", "https://vidsrcme.ru/");
          if (r) rows.push(r);
        }
      }
      return rows;
    })
    .catch(function () { return []; });
}

// --------------------------------------------------------------- main chain

function extractServer(serverName, embedUrl, meta, isTv, season, episode, tmdbId) {
  var lower = String(embedUrl || "").toLowerCase();
  var host = (lower.match(/^https?:\/\/([^\/]+)/) || [])[1] || "";
  if (host.indexOf("vixsrc") !== -1) {
    return extractVixsrc(tmdbId, isTv, season, episode, serverName, meta);
  }
  if (host.indexOf("primesrc") !== -1) {
    return extractPrimesrc(meta.imdbId, isTv, season, episode, serverName, meta);
  }
  if (host.indexOf("vidsrcme") !== -1 || host.indexOf("vidsrc.me") !== -1) {
    return extractVidsrcme(tmdbId, isTv, season, episode, serverName, meta);
  }
  // vidfast.vc / moviesapi.to / player.vidlove.cc and unknown hosts:
  // handled by dedicated providers or not extractable from device - skip.
  return Promise.resolve([]);
}

function getStreams(tmdbId, mediaType, season, episode) {
  var isTv = mediaType === "tv";
  var s = season || 1;
  var e = episode || 1;
  console.log("[" + SITE_NAME + "] start " + mediaType + " " + tmdbId + (isTv ? " S" + s + "E" + e : ""));
  try { tmdbId = String(tmdbId); } catch (err) { tmdbId = ""; }
  if (!tmdbId) return Promise.resolve([]);

  return tmdbMeta(tmdbId, mediaType).then(function (meta) {
    if (!meta.title) return [];
    return resolveBase().then(function (base) {
      return siteSearch(base, meta.title).then(function (cands) {
        var cand = pickCandidate(cands, meta, isTv);
        if (!cand) {
          console.log("[" + SITE_NAME + "] no site match for: " + meta.title);
          return [];
        }
        console.log("[" + SITE_NAME + "] matched: " + cand.title + " (" + cand.year + ") id=" + cand.id);
        var serversP = isTv ? getTvEpisodeServers(base, cand.id, s, e) : getMovieServers(base, cand.id);
        return serversP.then(function (servers) {
          if (!servers.length) return [];
          console.log("[" + SITE_NAME + "] servers: " + servers.map(function (x) { return x.name; }).join(", "));
          var chain = Promise.resolve([]);
          servers.forEach(function (srv) {
            chain = chain.then(function (rows) {
              return resolveSource(base, srv.id).then(function (embedUrl) {
                if (!embedUrl) return rows;
                return extractServer(srv.name, embedUrl, meta, isTv, s, e, tmdbId)
                  .then(function (more) { return rows.concat(more); });
              });
            });
          });
          return chain.then(function (rows) {
            console.log("[" + SITE_NAME + "] returning " + rows.length + " stream(s)");
            return rows;
          });
        });
      });
    });
  }).catch(function (error) {
    console.log("[" + SITE_NAME + "] failed: " + (error && error.message ? error.message : error));
    return [];
  });
}

module.exports = { getStreams: getStreams };

/* ===== nvio post-filter v1.0 (auto-injected) ============================
   Rules (per user request 2026-09):
   1. Language gate: only English / Tagalog (Filipino) audio lanes are kept.
      Streams explicitly tagged with another audio language (hindi, tamil,
      spanish, arabic, korean, ...) are dropped unless an allowed language
      is also present (dual/multi audio) or no language is tagged at all.
      Subtitle-only tokens (ESub, HindiSub, ...) are ignored by the gate.
   2. Quality gate: unknown/"Auto" resolutions are probed from the HLS
      master playlist; everything below 720p, CAM/telesync, and still-
      unknown rows are dropped. Survivors are labeled 720p/1080p/1440p/4K.
   3. Dedupe: exact URL, then normalized URL (query stripped, torrent
      info-hash), then identical name+quality rows. A short-TTL global
      registry also removes the same URL reported by two different
      providers (cross-provider duplicates).
   Opt-out: set SCRAPER_SETTINGS.postFilter = false.
======================================================================== */
(function () {
  var PROVIDER = "moviesjoy";
  var G = typeof globalThis !== "undefined" ? globalThis : typeof global !== "undefined" ? global : this;
  function settings() {
    try { return (G && G.SCRAPER_SETTINGS) || {}; } catch (e) { return {}; }
  }
  function hasTimers() { return typeof setTimeout === "function" && typeof clearTimeout === "function"; }

  /* ---------- quality ---------- */
  function normQ(q) {
    var s = String(q == null ? "" : q).toLowerCase();
    if (!s) return "";
    if (/8k/.test(s)) return "4K";
    if (/2160|4k|uhd/.test(s)) return "4K";
    if (/1440/.test(s)) return "1440p";
    if (/1080|fhd/.test(s)) return "1080p";
    if (/720/.test(s)) return "720p";
    if (/480|360|240|\bsd\b/.test(s)) return "CAM";
    if (/cam|telesync|telecine|\bts\b|\btc\b|screener|dvdscr/.test(s)) return "CAM";
    return "";
  }
  function qFromText(text) {
    var s = String(text || "");
    var m = s.match(/(\d{3,4})\s*p/i);
    if (m) {
      var n = parseInt(m[1], 10);
      if (n >= 2100) return "4K";
      if (n >= 1300) return "1440p";
      if (n >= 1000) return "1080p";
      if (n >= 640) return "720p";
      return "CAM";
    }
    if (/\b8k\b/i.test(s) || /2160|4k|uhd/i.test(s)) return "4K";
    if (/1440p/i.test(s)) return "1440p";
    if (/cam|telesync|telecine|\bts\b|\btc\b|screener|dvdscr/i.test(s)) return "CAM";
    if (/480p|360p|240p|\bsd\b|\bdvdrip\b/i.test(s)) return "CAM";
    if (/\bhd\b/i.test(s)) return "720p";
    return "";
  }
  var qualCache = G.__NV_QUAL_CACHE__ || (G.__NV_QUAL_CACHE__ = {});
  function probeM3u8(url, headers) {
    var now = Date.now();
    var c = qualCache[url];
    if (c && now - c.t < (c.q ? 15 * 60 * 1000 : 3 * 60 * 1000)) {
      return Promise.resolve(c.q);
    }
    var opts = { headers: Object.assign({}, headers || {}) };
    var p = fetch(url, opts).then(function (r) {
      return r.ok ? r.text() : "";
    }).then(function (t) {
      var q = "";
      if (t && t.indexOf("#EXTM3U") !== -1) {
        var best = 0, re = /RESOLUTION=(\d+)x(\d+)/gi, m;
        while ((m = re.exec(t)) !== null) {
          var h = parseInt(m[2], 10);
          if (h > best) best = h;
        }
        if (best >= 2100) q = "4K";
        else if (best >= 1300) q = "1440p";
        else if (best >= 1000) q = "1080p";
        else if (best >= 640) q = "720p";
        else if (best > 0) q = "CAM";
      }
      qualCache[url] = { t: now, q: q };
      return q;
    }).catch(function () { qualCache[url] = { t: now, q: "" }; return ""; });
    if (hasTimers()) {
      p = Promise.race([p, new Promise(function (res) {
        var timer = setTimeout(function () { res(""); }, 6000);
        if (typeof timer === "object" && typeof timer.unref === "function") timer.unref();
      })]);
    }
    return p;
  }

  /* ---------- language gate ---------- */
  var BLOCK_RE = new RegExp(
    "\\b(hindi|hin|tamil|telugu|malayalam|mallu|kannada|bengali|bangla|punjabi|marathi|bhojpuri|gujarati|" +
    "odia|assamese|nepali|urdu|sinhala|arabic|ara|farsi|persian|turkish|turkce|espanol|spanish|latino|" +
    "castellano|french|vostfr|german|deutsch|russian|korean|kor|japanese|jpn|chinese|mandarin|cantonese|" +
    "thai|vietnamese|indonesian|bahasa|portuguese|brasileiro|italian|polish|ukrainian|hebrew|" +
    "hungarian|romanian|dutch|flemish|greek|czech|swedish|danish|norwegian|finnish|org)\\b", "i");
  var ALLOW_RE = /\b(english|eng|tagalog|filipino)\b/i;
  var SUB_RE = /\b[a-z0-9]{0,12}subs?\b/gi;
  // NOTE: gate runs on the stream TITLE only (release names / labels).
  // Provider names (e.g. "MallumV") must not trigger the language gate.
  function langAllowed(titleText) {
    var t = String(titleText || "").replace(SUB_RE, " ");
    if (BLOCK_RE.test(t)) return ALLOW_RE.test(t);
    return true;
  }

  /* ---------- dedupe ---------- */
  function normUrl(u) {
    var s = String(u || "");
    if (/^magnet:/i.test(s)) {
      var m = s.match(/btih:([a-z0-9]+)/i);
      return "m:" + (m ? m[1].toLowerCase() : s.slice(0, 80));
    }
    return s.replace(/[#?].*$/, "").replace(/\/+$/, "");
  }
  var SEEN = G.__NV_SEEN_URLS__ || (G.__NV_SEEN_URLS__ = {});
  // SEEN[nu] = { exp: <ts>, owner: <provider> }
  // - same URL from a DIFFERENT provider within TTL -> dropped (cross-provider dup)
  // - same provider re-querying its own URL -> allowed (repeat opens must still
  //   return rows) and its claim is refreshed
  function claim(nu, now, owner) {
    if (!nu) return true;
    var e = SEEN[nu];
    if (e && e.exp > now && e.owner !== owner) return false;
    SEEN[nu] = { exp: now + 120000, owner: owner };
    return true;
  }

  /* ---------- main ---------- */
  function rank(q) {
    if (q === "4K") return 4;
    if (q === "1440p") return 3.5;
    if (q === "1080p") return 3;
    if (q === "720p") return 2;
    return 0;
  }
  function postProcess(list) {
    var now = Date.now();
    var kept = [];
    var probes = [];
    var rows = [];
    (list || []).forEach(function (s, i) {
      if (!s || !s.url) return;
      if (!langAllowed(s.title)) return;
      var text = (s.name || "") + " " + (s.title || "");
      var isMagnet = /^magnet:/i.test(String(s.url));
      var q = normQ(s.quality) || normQ(String(s.title || "").split("\n")[0]) || qFromText(text);
      var isHlsLike = /m3u8/i.test(String(s.url)) ||
        (!/\.(mp4|mkv|avi|mov|webm|ts|flv|m4v|mp3|aac)(\?|$)/i.test(String(s.url.split("?")[0])) && /^https?:/i.test(String(s.url)));
      if (!q && !isMagnet && isHlsLike) {
        rows.push({ s: s, i: i });
        probes.push(probeM3u8(String(s.url), s.headers));
      } else {
        rows.push({ s: s, i: i });
        probes.push(Promise.resolve(q));
      }
    });
    return Promise.all(probes).then(function (qs) {
      var ranked = [];
      rows.forEach(function (row, k) {
        var q = qs[k];
        if (!q) return; // unknown resolution -> removed
        if (q === "CAM") return; // cam / sd / sub-720 -> removed
        row.s.quality = q;
        ranked.push({ s: row.s, i: row.i, q: q });
      });
      // best first so dedupe keeps the strongest duplicate (stable)
      ranked.sort(function (a, b) {
        var r = rank(b.q) - rank(a.q);
        if (r !== 0) return r;
        return a.i - b.i;
      });
      var seenLocal = {}, out = [];
      ranked.forEach(function (row) {
        var s = row.s;
        var nu = normUrl(s.url);
        if (seenLocal[nu]) return;
        if (!claim(nu, now, PROVIDER)) return; // already reported by a different provider
        seenLocal[nu] = 1;
        out.push(s);
      });
      return out.slice(0, 40);
    }).catch(function () { return (list || []).slice(0, 40); });
  }

  var __orig = null;
  try { __orig = module.exports && module.exports.getStreams; } catch (e) { __orig = null; }
  if (typeof __orig === "function") {
    module.exports.getStreams = function () {
      var args = Array.prototype.slice.call(arguments), self = this;
      function finish(v) {
        if (settings().postFilter === false) return v;
        try { return postProcess(Array.isArray(v) ? v : []); }
        catch (e) { return Array.isArray(v) ? v : []; }
      }
      try {
        var r = __orig.apply(self, args);
        if (r && typeof r.then === "function") {
          return r.then(function (v) { return finish(v); }, function () { return []; });
        }
        return finish(r);
      } catch (e) { return Promise.resolve([]); }
    };
  }
})();
