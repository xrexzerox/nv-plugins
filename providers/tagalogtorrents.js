/**
 * tagalogtorrents - Tagalog / Pinoy torrent streams for Nuvio (P2P + debrid).
 *
 * Lanes (all run in parallel, every lane fail-soft):
 *   1. Torrentio    - IMDb-keyed Stremio API (indexes 1337x / TPB / YTS; carries
 *                     Filipino WEB-DL releases for Pinoy titles)
 *   2. TorrentsDB   - IMDb-keyed Stremio API (fresher seed counts, TPB mirror index)
 *   3. ThePirateBay - title search via apibay.org JSON API (works from residential
 *                     IPs; skipped silently when Cloudflare-gated, e.g. datacenters)
 *
 * Tagalog relevance:
 *   - TMDB original_language === "tl" (or a Philippines production) -> the title
 *     itself is Tagalog; all of its releases are kept and labeled Tagalog.
 *   - Foreign titles -> only releases whose name carries Filipino markers
 *     (tagalog / filipino / pinoy / ...) are kept, unless keepAllLanguages is on.
 *   - Filipino-marked releases always rank first.
 *
 * Streams are returned as magnet: URLs (+ infoHash) resolved by Nuvio's P2P
 * engine (NuvioEngine) or a debrid service the user has configured.
 *
 * Sandbox-safe: pure-JS bundle, ES5 promise chains only, zero external
 * modules, chrome56-compatible string APIs, fail-soft everywhere.
 */

var __version = "1.0.0";

// ---------- constants ----------
var TMDB_API_KEY = "1865f43a0549ca50d341dd9ab8b29f49";
var TMDB_BASE_URL = "https://api.themoviedb.org/3";
var TORRENTIO_API = "https://torrentio.strem.fun/limit=20";
var TORRENTSDB_API = "https://torrentsdb.com/eyJsaW1pdCI6IjIwIn0=";
var APIBAY_BASE = "https://apibay.org";
var UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
var LANE_TIMEOUT_MS = 12000;
var TMDB_TIMEOUT_MS = 8000;
var MAX_STREAMS = 25;
var MIN_APIBAY_SEEDERS = 2;

var FILIPINO_RE = /filipino|tagalog|pinoy|pinay|pilipino|taglish|bisaya|cebuano/i;
var DUB_RE = /dubbed|\bdub\b/i;
var JUNK_RE = /\b(sample|trailer|nfo|readme|proof|password|keygen|cracks?|screens)\b|\.(exe|scr|bat|dll|nfo)\b|free[._-]?download|watch[._-]?online/i;
var HASH_RE = /^[0-9a-f]{40}$|^[a-z2-7]{32}$/i;

var FALLBACK_TRACKERS = [
  "udp://tracker.opentrackr.org:1337/announce",
  "udp://open.tracker.cl:1337/announce",
  "udp://tracker.openbittorrent.com:6969/announce",
  "udp://exodus.desync.com:6969/announce",
  "udp://open.stealth.si:80/announce",
  "udp://tracker.torrent.eu.org:451/announce",
  "udp://open.demonii.com:1337/announce"
];

var STOPWORDS = { the: 1, a: 1, an: 1, of: 1, and: 1, or: 1, on: 1, in: 1, to: 1, is: 1, ang: 1, ng: 1, sa: 1 };

// ---------- tiny utils ----------
function hasTimers() {
  try {
    return typeof setTimeout === "function" && typeof clearTimeout === "function";
  } catch (e) {
    return false;
  }
}

function fetchWithTimeout(url, options, timeoutMs) {
  if (!hasTimers()) return fetch(url, options || {});
  var timeout = timeoutMs || 10000;
  return new Promise(function (resolve, reject) {
    var timer = setTimeout(function () {
      reject(new Error("timeout " + timeout + "ms: " + url));
    }, timeout);
    fetch(url, options || {}).then(
      function (res) { clearTimeout(timer); resolve(res); },
      function (err) { clearTimeout(timer); reject(err); }
    );
  });
}

function fetchText(url, timeoutMs) {
  return fetchWithTimeout(url, { headers: { "User-Agent": UA, "Accept": "*/*" } }, timeoutMs).then(function (res) {
    if (!res.ok) throw new Error("HTTP " + res.status + " for " + url);
    return res.text();
  });
}

function withTimeout(promise, ms, label) {
  if (!hasTimers()) {
    return promise.catch(function () { return []; });
  }
  return Promise.race([
    promise,
    new Promise(function (resolve) {
      setTimeout(function () {
        console.log("[TagalogTorrents] timeout: " + label);
        resolve([]);
      }, ms);
    })
  ]);
}

function settings() {
  try {
    return globalThis.SCRAPER_SETTINGS || {};
  } catch (e) {
    return {};
  }
}

function pad2(n) {
  return ("0" + n).slice(-2);
}

// ---------- TMDB ----------
function fetchTmdbMeta(tmdbId, mediaType) {
  var type = mediaType === "tv" ? "tv" : "movie";
  var url = TMDB_BASE_URL + "/" + type + "/" + encodeURIComponent(String(tmdbId)) +
    "?api_key=" + TMDB_API_KEY + "&append_to_response=external_ids";
  return fetchText(url, TMDB_TIMEOUT_MS).then(function (text) {
    var data = JSON.parse(text);
    var title = type === "tv"
      ? (data.name || data.original_name || "")
      : (data.title || data.original_title || "");
    var originalTitle = data.original_title || data.original_name || title;
    var date = String(data.release_date || data.first_air_date || "");
    var countries = (data.production_countries || []).map(function (c) {
      return (c && (c.iso_3166_1 || c.name)) || "";
    });
    var isPh = countries.indexOf("PH") !== -1 || /philippines/i.test(countries.join(" "));
    return {
      title: title,
      originalTitle: originalTitle,
      year: date ? parseInt(date.substring(0, 4), 10) || null : null,
      imdbId: (data.external_ids && data.external_ids.imdb_id) || null,
      originalLanguage: data.original_language || "",
      isTagalogOriginal: data.original_language === "tl" || isPh
    };
  }).catch(function () {
    return { title: "", originalTitle: "", year: null, imdbId: null, originalLanguage: "", isTagalogOriginal: false };
  });
}

// ---------- text parsing ----------
function normalizeName(s) {
  return String(s || "")
    .toLowerCase()
    .replace(/\.(mp4|mkv|avi|mov|wmv|iso|ts)\b/g, " ")
    .replace(/[\[\]\(\)\{\}._\-:;,'"\+!@#$%^&\*=?!<>/\\|~\u2013\u2014]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokensOf(title) {
  var parts = normalizeName(title).split(" ");
  var out = [];
  for (var i = 0; i < parts.length; i++) {
    var w = parts[i];
    if (w.length >= 2 && !STOPWORDS[w] && !/^\d{4}$/.test(w)) out.push(w);
  }
  return out;
}

function tokenCoverage(nameNorm, tokens) {
  if (!tokens.length) return true;
  var hit = 0;
  for (var i = 0; i < tokens.length; i++) {
    if (nameNorm.indexOf(tokens[i]) !== -1) hit++;
  }
  return hit / tokens.length >= 0.6;
}

function isFilipinoRelease(name) {
  return FILIPINO_RE.test(String(name || ""));
}

function isJunk(name) {
  return JUNK_RE.test(String(name || ""));
}

function validHash(h) {
  return typeof h === "string" && HASH_RE.test(h);
}

function parseQuality(name) {
  var s = String(name || "").toLowerCase();
  var m = s.match(/(\d{3,4})\s*p/);
  if (m) {
    var n = parseInt(m[1], 10);
    if (n >= 2000) return "4K";
    if (n >= 1000) return "1080p";
    if (n >= 700) return "720p";
    if (n >= 400) return "480p";
    return "360p";
  }
  if (/\b8k\b/.test(s)) return "8K";
  if (/2160p?|\b4k\b|\buhd\b/.test(s)) return "4K";
  if (/hdcam|\bcam\b|telesync|\bts\b|telecine|dvdscr/.test(s)) return "CAM";
  if (/\bhd\b/.test(s)) return "720p";
  return "Auto";
}

function qualityRank(q) {
  if (q === "8K") return 5;
  if (q === "4K") return 4;
  if (q === "1080p") return 3;
  if (q === "720p") return 2;
  if (q === "480p" || q === "360p") return 1;
  return 0;
}

function humanSize(bytes) {
  var b = parseInt(bytes, 10);
  if (!b || b < 0) return "";
  if (b >= 1073741824) return (Math.round((b / 1073741824) * 100) / 100) + " GB";
  if (b >= 1048576) return Math.round(b / 1048576) + " MB";
  return b + " KB";
}

function parseSeeders(text) {
  var m = String(text || "").match(/(?:👤|👥)\s*([\d,]+)/);
  if (!m) return 0;
  var n = parseInt(m[1].replace(/,/g, ""), 10);
  return isNaN(n) ? 0 : n;
}

function parseSizeText(text) {
  var m = String(text || "").match(/💾\s*([\d.,]+\s*[KMGT]i?B)/i);
  return m ? m[1].replace(/\s+/g, " ").trim() : "";
}

function parseTracker(text) {
  var m = String(text || "").match(/⚙️\s*([^\n]+)/);
  if (!m) return "";
  return m[1].trim().split(" ")[0];
}

function parseCodec(name) {
  var s = String(name || "").toLowerCase();
  if (/\b(x265|h\.?265|hevc)\b/.test(s)) return "H.265";
  if (/\b(x264|h\.?264|avc)\b/.test(s)) return "H.264";
  if (/\bxvid\b/.test(s)) return "XviD";
  return "";
}

function parseSource(name) {
  var s = String(name || "").toLowerCase();
  if (/remux/.test(s)) return "REMUX";
  if (/blu[\s._-]*ray|bdrip|brrip/.test(s)) return "BluRay";
  if (/web[\s._-]*dl/.test(s)) return "WEB-DL";
  if (/web[\s._-]*rip/.test(s)) return "WEBRip";
  if (/hdrip/.test(s)) return "HDRip";
  if (/hdtv/.test(s)) return "HDTV";
  if (/dvdrip|dvd[\s._-]*r\b/.test(s)) return "DVDRip";
  if (/hdcam|\bcam\b|telesync|telecine/.test(s)) return "CAM";
  return "";
}

function seasonEpBonus(name, season, episode) {
  if (season == null) return 0;
  var s = String(name || "").toLowerCase();
  var se = String(season);
  var ee = episode == null ? "" : String(episode);
  var patterns = [];
  if (ee) {
    patterns.push(new RegExp("\\bs" + pad2(se) + "e" + pad2(ee) + "\\b"));
    patterns.push(new RegExp("\\bs" + se + "e" + pad2(ee) + "\\b"));
    patterns.push(new RegExp("\\b" + se + "x" + pad2(ee) + "\\b"));
  } else {
    patterns.push(new RegExp("\\bseason[\\s._-]*" + se + "\\b"));
  }
  for (var i = 0; i < patterns.length; i++) {
    if (patterns[i].test(s)) return 30;
  }
  if (/complete|collection|\bpack\b|full series|all episodes/.test(s)) return 5;
  return 0;
}

// ---------- magnet ----------
function buildMagnet(infoHash, dn, trackers, fileIdx) {
  var magnet = "magnet:?xt=urn:btih:" + String(infoHash).toLowerCase();
  if (dn) magnet += "&dn=" + encodeURIComponent(String(dn).substring(0, 120));
  var seen = {};
  var list = [];
  (trackers || []).forEach(function (t) {
    if (!t) return;
    var tr = String(t).replace(/^tracker:/i, "").trim();
    if (!/^(udp|https?):\/\//i.test(tr)) return;
    if (seen[tr]) return;
    seen[tr] = true;
    list.push(tr);
  });
  FALLBACK_TRACKERS.forEach(function (t) {
    if (!seen[t]) {
      seen[t] = true;
      list.push(t);
    }
  });
  for (var i = 0; i < list.length; i++) {
    magnet += "&tr=" + encodeURIComponent(list[i]);
  }
  if (fileIdx != null) magnet += "&index=" + parseInt(fileIdx, 10);
  return magnet;
}

// ---------- presentation ----------
function languageLabel(filipino, release, ctx) {
  if (filipino) {
    if (!ctx.isTagalogOriginal && DUB_RE.test(String(release))) return "Tagalog Dub";
    return "Tagalog";
  }
  if (ctx.isTagalogOriginal) return "Tagalog";
  return "";
}

function buildTitle(release, ctx, quality, size, tracker, filipino) {
  var head = "🎬 " + (ctx.originalTitle || ctx.title || "Unknown");
  if (!ctx.isTv && ctx.year) head += " (" + ctx.year + ")";
  if (ctx.isTv && ctx.season != null && ctx.episode != null) {
    head += " - S" + pad2(ctx.season) + "E" + pad2(ctx.episode);
  }
  var line2 = "💎 " + quality + (size ? " • " + size : "") + (tracker ? " | ⚙️ " + tracker : "");
  var bits = [];
  var lang = languageLabel(filipino, release, ctx);
  if (lang) bits.push("🌍 " + lang);
  var codec = parseCodec(release);
  if (codec) bits.push("🎥 " + codec);
  var source = parseSource(release);
  if (source) bits.push("📀 " + source);
  return head + "\n" + line2 + (bits.length ? "\n" + bits.join(" | ") : "");
}

function scoreRelease(r, ctx) {
  var score = 0;
  if (r.filipino) score += 100;
  if (ctx && ctx.isTagalogOriginal) score += 25;
  score += qualityRank(r.quality) * 10;
  score += Math.min(r.seeders || 0, 400) / 20;
  score += r.seasonBonus || 0;
  if (r.tracker) score += 2;
  return score;
}

// ---------- lane 1+2: Stremio-style IMDb-keyed APIs ----------
function parseStremioStreams(sourceName, text, ctx) {
  var json;
  try {
    json = JSON.parse(text);
  } catch (e) {
    return [];
  }
  var streams = (json && json.streams) || [];
  var out = [];
  streams.forEach(function (s) {
    if (!s || !validHash(s.infoHash)) return;
    var label = s.title || s.description || s.name || "";
    var release = (s.behaviorHints && s.behaviorHints.filename) || String(label).split("\n")[0];
    if (isJunk(release)) return;
    var filipino = isFilipinoRelease(release);
    if (!ctx.isTagalogOriginal && !filipino && ctx.keepAllLanguages !== true) return;
    var seeders = parseSeeders(label);
    var size = parseSizeText(label);
    var tracker = parseTracker(label);
    var quality = parseQuality(release);
    var magnet = buildMagnet(s.infoHash, release, (s.sources || []).slice(0, 12), s.fileIdx);
    var stream = {
      name: sourceName + " 👤" + (seeders || "?") + " ⏫" + quality,
      title: buildTitle(release, ctx, quality, size, tracker, filipino),
      url: magnet,
      quality: quality,
      size: size || undefined,
      language: languageLabel(filipino, release, ctx) || undefined,
      seeders: seeders || undefined,
      infoHash: s.infoHash,
      headers: {}
    };
    stream._filipino = filipino;
    stream._score = scoreRelease({ filipino: filipino, quality: quality, seeders: seeders, tracker: tracker }, ctx);
    out.push(stream);
  });
  return out;
}

function stremioLane(sourceName, api, ctx) {
  if (!ctx.imdbId) return Promise.resolve([]);
  var path = ctx.isTv
    ? "/stream/series/" + ctx.imdbId + ":" + (ctx.season || 1) + ":" + (ctx.episode || 1) + ".json"
    : "/stream/movie/" + ctx.imdbId + ".json";
  return withTimeout(
    fetchText(api + path, LANE_TIMEOUT_MS).then(function (text) {
      return parseStremioStreams(sourceName, text, ctx);
    }).catch(function (e) {
      console.log("[TagalogTorrents][" + sourceName + "] " + (e && e.message));
      return [];
    }),
    LANE_TIMEOUT_MS + 2000,
    sourceName
  );
}

// ---------- lane 3: ThePirateBay title search ----------
function parseApibay(text, ctx) {
  var raw = String(text || "");
  if (raw.charAt(0) === "<" || /just a moment|cf-browser-verification|challenge-platform/i.test(raw.slice(0, 500))) {
    console.log("[TagalogTorrents][tpb] cloudflare-gated, skipping lane");
    return [];
  }
  var json;
  try {
    json = JSON.parse(raw);
  } catch (e) {
    return [];
  }
  if (!json || !json.length || json[0].noresults) return [];
  var tokens = tokensOf(ctx.title);
  var out = [];
  json.forEach(function (e) {
    if (!e || !validHash(e.info_hash)) return;
    var name = String(e.name || "");
    if (isJunk(name)) return;
    var seeders = parseInt(e.seeders, 10) || 0;
    if (seeders < MIN_APIBAY_SEEDERS) return;
    if (ctx.imdbId && e.imdb && /^tt/i.test(String(e.imdb)) &&
      String(e.imdb).toLowerCase() !== String(ctx.imdbId).toLowerCase()) return;
    if (!tokenCoverage(normalizeName(name), tokens)) return;
    var filipino = isFilipinoRelease(name);
    if (!ctx.isTagalogOriginal && !filipino && ctx.keepAllLanguages !== true) return;
    var quality = parseQuality(name);
    var size = humanSize(e.size);
    var seasonBonus = ctx.isTv ? seasonEpBonus(name, ctx.season, ctx.episode) : 0;
    var magnet = buildMagnet(e.info_hash, name, [], null);
    var stream = {
      name: "TagalogTorrent 👤" + seeders + " ⏫" + quality,
      title: buildTitle(name, ctx, quality, size, "TPB", filipino),
      url: magnet,
      quality: quality,
      size: size || undefined,
      language: languageLabel(filipino, name, ctx) || undefined,
      seeders: seeders,
      infoHash: e.info_hash,
      headers: {}
    };
    stream._filipino = filipino;
    stream._score = scoreRelease(
      { filipino: filipino, quality: quality, seeders: seeders, tracker: "TPB", seasonBonus: seasonBonus },
      ctx
    );
    out.push(stream);
  });
  return out;
}

function apibayLane(ctx) {
  if (!ctx.title) return Promise.resolve([]);
  var url = APIBAY_BASE + "/q.php?q=" + encodeURIComponent(ctx.title) + "&cat=" + (ctx.isTv ? "202" : "201");
  return withTimeout(
    fetchText(url, LANE_TIMEOUT_MS).then(function (text) {
      return parseApibay(text, ctx);
    }).catch(function (e) {
      console.log("[TagalogTorrents][tpb] " + (e && e.message));
      return [];
    }),
    LANE_TIMEOUT_MS + 2000,
    "tpb"
  );
}

// ---------- finalize ----------
function finalize(streams) {
  var byHash = {};
  var out = [];
  (streams || []).forEach(function (s) {
    if (!s || !s.url) return;
    var key = String(s.infoHash || s.url).toLowerCase();
    var prev = byHash[key];
    if (prev) {
      if ((s._score || 0) > (prev._score || 0)) {
        out[out.indexOf(prev)] = s;
        byHash[key] = s;
      }
      return;
    }
    byHash[key] = s;
    out.push(s);
  });
  out.sort(function (a, b) {
    return (b._score || 0) - (a._score || 0);
  });
  return out.slice(0, MAX_STREAMS).map(function (s) {
    var copy = {};
    Object.keys(s).forEach(function (k) {
      if (k.charAt(0) !== "_") copy[k] = s[k];
    });
    return copy;
  });
}

// ---------- entry point ----------
function getStreams(tmdbId, mediaType, season, episode) {
  try {
    var cfg = settings();
    if (cfg.enableTorrents === false) return Promise.resolve([]);
    var isTv = String(mediaType) === "tv";
    return fetchTmdbMeta(tmdbId, mediaType).then(function (meta) {
      var ctx = {
        isTv: isTv,
        title: meta.title || meta.originalTitle || "",
        originalTitle: meta.originalTitle || meta.title || "",
        year: meta.year,
        imdbId: meta.imdbId,
        isTagalogOriginal: meta.isTagalogOriginal,
        season: isTv ? (season != null ? parseInt(season, 10) || 1 : 1) : null,
        episode: isTv ? (episode != null ? parseInt(episode, 10) || 1 : 1) : null,
        keepAllLanguages: cfg.keepAllLanguages === true
      };
      var jobs = [];
      if (cfg.torrentioLane !== false) jobs.push(stremioLane("Torrentio", TORRENTIO_API, ctx));
      if (cfg.torrentsdbLane !== false) jobs.push(stremioLane("TorrentsDB", TORRENTSDB_API, ctx));
      if (cfg.tpbLane !== false) jobs.push(apibayLane(ctx));
      if (!jobs.length) return [];
      return Promise.all(jobs).then(function (results) {
        return finalize([].concat(results[0] || [], results[1] || [], results[2] || []));
      });
    }).catch(function (e) {
      console.log("[TagalogTorrents] " + (e && e.message));
      return [];
    });
  } catch (e) {
    return Promise.resolve([]);
  }
}

function onSettings() {
  return Promise.resolve([
    { type: "header", label: "Tagalog Torrents (P2P / debrid)" },
    { type: "toggle", key: "enableTorrents", label: "Enable torrent sources", defaultValue: true },
    { type: "toggle", key: "torrentioLane", label: "Torrentio (IMDb-keyed)", defaultValue: true },
    { type: "toggle", key: "torrentsdbLane", label: "TorrentsDB (IMDb-keyed)", defaultValue: true },
    { type: "toggle", key: "tpbLane", label: "ThePirateBay title search", defaultValue: true },
    { type: "toggle", key: "keepAllLanguages", label: "Keep non-Tagalog releases too", defaultValue: false }
  ]);
}

module.exports = { getStreams: getStreams, onSettings: onSettings, __version: __version };
