"use strict";
// animesalt.js - eclipsia gravix.js source (codeberg eclipsia/nuvio-plugin v10.0.0), readable netmirror-style build for pack 4.43.0.
// Device fixes applied: verbatim (device-clean source).
// Subtitles: passed through as upstream emits them (English/Tagalog tracks kept when upstream provides).

const BASE_URL = "https://animesalt.cx";
const TMDB_API_KEY = "6dc830f9624b43261325bed3bf7d0dfa";
const HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/151.0.0.0 Safari/537.36",
  "Referer": "https://animesalt.cx/",
};

async function fetchHtml(url, options = {}) {
  const resolvedUrl = url.startsWith("http") ? url : `${BASE_URL}${url}`;
  try {
    const response = await fetch(resolvedUrl, { headers: HEADERS, ...options });
    if (!response.ok) return "";
    return await response.text();
  } catch (_) {
    return "";
  }
}

async function fetchJson(url, options = {}) {
  try {
    const response = await fetch(url, { headers: HEADERS, ...options });
    if (!response.ok) return null;
    return await response.json();
  } catch (_) {
    return null;
  }
}

async function fetchTmdbMetadata(tmdbId, mediaType) {
  const endpoint = mediaType === "movie" ? "movie" : "tv";
  const data = await fetchJson(
    `https://api.themoviedb.org/3/${endpoint}/${tmdbId}?api_key=${TMDB_API_KEY}`
  );
  if (!data) return null;
  const title = data.title || data.name;
  const year = parseInt((data.release_date || data.first_air_date || "").split("-")[0]) || null;
  return { title, year };
}

async function fetchEpisodeTitle(tmdbId, season, episode) {
  const data = await fetchJson(
    `https://api.themoviedb.org/3/tv/${tmdbId}/season/${season}?api_key=${TMDB_API_KEY}`
  );
  const episodeNumber = parseInt(episode) || 1;
  return data?.episodes?.find((ep) => ep.episode_number === episodeNumber)?.name || "";
}

function normalizeTitle(str) {
  return str.toLowerCase().replace(/[^a-z0-9]/g, "").trim();
}

function extractSearchEntries(html, mediaType) {
  const containerMatch = html.match(/id="movies-a"([\s\S]*?)(?=<footer|id="footer|class="footer)/m);
  const contentHtml = containerMatch ? containerMatch[1] : html;

  const entries = [];
  const visitedSlugs = new Set();
  const articlePattern = /<article[^>]*>([\s\S]*?)<\/article>/g;

  let match;
  while ((match = articlePattern.exec(contentHtml)) !== null) {
    const articleHtml = match[1];
    const linkMatch = articleHtml.match(/href="(https:\/\/animesalt\.cx\/(series|movies)\/([^\/\"]+)\/?)"/);
    const titleMatch = articleHtml.match(/class="entry-title"[^>]*>([^<]+)</);
    const yearMatch = articleHtml.match(/class="year"[^>]*>(\d{4})</);

    if (!linkMatch || !titleMatch) continue;
    const [, url, type, slug] = linkMatch;
    if (!slug || slug === "page" || visitedSlugs.has(slug)) continue;

    visitedSlugs.add(slug);
    entries.push({ url, type, slug, title: titleMatch[1].trim(), year: yearMatch ? +yearMatch[1] : null });
  }

  const typed = entries.filter((entry) => entry.type === (mediaType === "movie" ? "movies" : "series"));
  return typed.length ? typed : entries;
}

function selectTopCandidate(entries, title, year) {
  let pool = entries;

  if (year) {
    const yearAligned = entries.filter((e) => e.year !== null && Math.abs(e.year - year) <= 1);
    const undated = entries.filter((e) => e.year === null);
    pool = yearAligned.length ? yearAligned : undated.length ? undated : entries;
  }

  const normalizedQuery = normalizeTitle(title);
  pool.sort((a, b) => {
    const na = normalizeTitle(a.title), nb = normalizeTitle(b.title);
    const exactDiff = (na === normalizedQuery ? 0 : 1) - (nb === normalizedQuery ? 0 : 1);
    if (exactDiff !== 0) return exactDiff;
    const prefixDiff = (na.startsWith(normalizedQuery) ? 0 : 1) - (nb.startsWith(normalizedQuery) ? 0 : 1);
    if (prefixDiff !== 0) return prefixDiff;
    return na.length - nb.length;
  });

  return pool[0] || null;
}

async function resolveAnimePageUrl(title, mediaType, year) {
  const html = await fetchHtml(`/?s=${encodeURIComponent(title)}`);
  if (!html) return null;
  const entries = extractSearchEntries(html, mediaType);
  if (!entries.length) return null;
  const candidate = selectTopCandidate(entries, title, year);
  return candidate ? candidate.url : null;
}

function extractEpisodeUrl(html, season, episode) {
  const pattern = new RegExp(`href="(https://animesalt\\.cx/episode/[^"]*${season}x${episode}[^"]*)"`);
  return pattern.exec(html)?.[1] ?? null;
}

async function resolveEpisodeUrl(seriesPageUrl, season, episode) {
  const html = await fetchHtml(seriesPageUrl);
  if (!html) return null;

  const seasonEntries = [];
  const seasonPattern = /data-post="(\d+)"\s+data-season="(\d+)"/g;
  let match;
  while ((match = seasonPattern.exec(html)) !== null) {
    seasonEntries.push({ post: match[1], season: +match[2] });
  }

  if (!seasonEntries.length) return extractEpisodeUrl(html, season, episode);

  const targetSeason = seasonEntries.find((s) => s.season === +season);
  if (!targetSeason) return null;

  const seasonHtml = await fetchHtml(
    `/wp-admin/admin-ajax.php?action=action_select_season&season=${season}&post=${targetSeason.post}`
  );
  return seasonHtml ? extractEpisodeUrl(seasonHtml, season, episode) : null;
}

async function resolveStreamData(pageUrl) {
  const html = await fetchHtml(pageUrl);
  if (!html) return null;

  const playerMatch = html.match(/src="(https:\/\/as-cdn\d+\.top\/video\/([a-f0-9]+))"/);
  if (!playerMatch) return null;

  const [, playerUrl, videoHash] = playerMatch;
  const cdnOrigin = playerUrl.split("/video/")[0];

  try {
    const response = await fetch(`${cdnOrigin}/player/index.php?data=${videoHash}&do=getVideo`, {
      method: "POST",
      headers: {
        ...HEADERS,
        "Content-Type": "application/x-www-form-urlencoded",
        "Origin": cdnOrigin,
        "X-Requested-With": "XMLHttpRequest",
      },
      body: `hash=${videoHash}&r=${encodeURIComponent(BASE_URL + "/")}`,
    });
    if (!response.ok) return null;

    const payload = await response.json();
    const m3u8Url = payload.videoSource || payload.securedLink;
    if (!m3u8Url) return null;

    const contentHash = m3u8Url.match(/\/hls\/([a-f0-9]+)\//)?.[1] ?? videoHash;
    const cdnBase = m3u8Url.split("/cdn/hls/")[0];
    const subtitleUrl = `${cdnBase}/cdn/down/${contentHash}/Subtitle/subtitle_eng.srt`;

    return { url: m3u8Url, subtitle: subtitleUrl, cdnBase };
  } catch (_) {
    return null;
  }
}

async function getStreams(tmdbId, mediaType, season, episode) {
  if (mediaType === "tv" && (season == null || episode == null)) return [];

  try {
    const metadata = await fetchTmdbMetadata(tmdbId, mediaType);
    if (!metadata?.title) return [];

    const { title, year } = metadata;

    const episodeTitle = mediaType === "tv"
      ? await fetchEpisodeTitle(tmdbId, season, episode)
      : "";

    const animePageUrl = await resolveAnimePageUrl(title, mediaType, year);
    if (!animePageUrl) return [];

    let stream = null;
    if (mediaType === "movie") {
      stream = await resolveStreamData(animePageUrl);
    } else {
      const episodeUrl = await resolveEpisodeUrl(animePageUrl, season, episode);
      if (episodeUrl) stream = await resolveStreamData(episodeUrl);
    }

    if (!stream) return [];

    const episodeLabel = mediaType === "tv" && season && episode
      ? ` • Episode ${episode}${episodeTitle ? ` - ${episodeTitle}` : ""}`
      : "";

    return [{
      name: "AnimeSalt",
      title: "AnimeSalt",
      url: stream.url,
      quality: "1080p",
      headers: {
        "Referer": stream.cdnBase + "/",
        "Origin": stream.cdnBase,
        "User-Agent": HEADERS["User-Agent"],
      },
      subtitles: stream.subtitle
        ? [{ url: stream.subtitle, lang: "en", name: "English" }]
        : [],
    }];
  } catch (_) {
    return [];
  }
}

module.exports = { getStreams };

/* ===== nv universal subtitle lane v1.0.0 (pack 4.48.0) =====================
   Every scraper's stream rows now carry multi-language sidecar subtitles:
   English, Tagalog/Filipino, Korean, Japanese, Indonesian, Malay, Chinese,
   Thai + all other tracks the source offers.

   Source: Stremio's official keyless OpenSubtitles-v3 addon
     GET https://opensubtitles-v3.strem.io/subtitles/{movie|series}/{imdbId}[:s:e].json
     -> { subtitles: [{ url, lang(ISO-639-3), ... }] }
   The subs5.strem.io URLs serve UTF-8 SRT; NuvioTV's player converts SRT to
   WebVTT transparently (playerScreenMethods-42.createSubtitleObjectUrl), and
   the player merges stream.sidecar `subtitles` rows (lang/url/headers) into
   the subtitle rail - the same path the Pencuri English lane uses.

   Design: ES2020-safe, zero-dependency, fail-soft. The IMDb id is resolved
   once per title via TMDB external_ids (cached), the subtitle JSON once per
   (imdb, s, e) (cached 6h). The wrapper runs in PARALLEL with the provider's
   own lane and only fills rows that have no subtitles of their own, so
   provider-specific tracks (vidlove/anikoto/megaplay vtt, pencuri en) always
   win. Never throws; never delays the stream lane by more than the host's
   own 8s deadline.
=========================================================================== */
(function () {
  var G = typeof globalThis !== "undefined" ? globalThis : this;
  if (G.__nvOsv3Subs) return;

  var OSV3_BASE = "https://opensubtitles-v3.strem.io/subtitles/";
  var TMDB_KEY = (typeof TMDB_API_KEY === "string" && TMDB_API_KEY) || "6dc830f9624b43261325bed3bf7d0dfa";
  var TTL_MS = 6 * 60 * 60 * 1000;
  var DEADLINE_MS = 8000;

  /* ISO-639-3 -> ISO-639-1 (+ display names) for the pack's languages */
  var CODE_MAP = {
    eng: "en", tgl: "tl", fil: "fil", ko: "ko", kor: "ko", jpn: "ja",
    ind: "id", may: "ms", zho: "zh", zhe: "zh", zht: "zh-TW", tha: "th",
    hin: "hi", ben: "bn", tam: "ta", tel: "te", spa: "es", por: "pt",
    pob: "pt-BR", fre: "fr", ger: "de", ita: "it", rus: "ru", ara: "ar",
    tur: "tr", vie: "vi", pol: "pl", nld: "nl", ukr: "uk", pes: "fa",
    per: "fa", swe: "sv", nor: "no", dan: "da", fin: "fi", ell: "el",
    heb: "he", hun: "hu", ces: "cs", cze: "cs", ron: "ro", rum: "ro",
    hrv: "hr", srp: "sr", bul: "bg", slo: "sk", slv: "sl", bos: "bs",
    mac: "mk", mkd: "mk", est: "et", lav: "lv", lit: "lt", ind2: "id"
  };
  var NAME_MAP = {
    en: "English", tl: "Tagalog", fil: "Filipino", ko: "Korean", ja: "Japanese",
    id: "Indonesian", ms: "Malay", zh: "Chinese", "zh-TW": "Chinese (Traditional)",
    th: "Thai", hi: "Hindi", bn: "Bengali", ta: "Tamil", te: "Telugu",
    es: "Spanish", pt: "Portuguese", "pt-BR": "Portuguese (BR)", fr: "French",
    de: "German", it: "Italian", ru: "Russian", ar: "Arabic", tr: "Turkish",
    vi: "Vietnamese", pl: "Polish", nl: "Dutch", uk: "Ukrainian", fa: "Persian",
    sv: "Swedish", no: "Norwegian", da: "Danish", fi: "Finnish", el: "Greek",
    he: "Hebrew", hu: "Hungarian", cs: "Czech", sk: "Slovak", ro: "Romanian",
    hr: "Croatian", sr: "Serbian", bg: "Bulgarian", sl: "Slovenian",
    bs: "Bosnian", mk: "Macedonian", et: "Estonian", lv: "Latvian", lt: "Lithuanian"
  };

  var _cache = {};   /* key -> { t: ms, rows: [...] } */
  var _imdbCache = {}; /* tmdbKey -> { t: ms, imdb } */
  var _inflight = {};  /* key -> Promise */

  function _hasTimers() {
    return typeof setTimeout === "function" && typeof Promise !== "undefined" && Promise.race;
  }
  function _withDeadline(p) {
    if (!_hasTimers()) return p;
    return Promise.race([p, new Promise(function (res) {
      var t = setTimeout(function () { res(null); }, DEADLINE_MS);
      if (t && typeof t.unref === "function") t.unref();
    })]);
  }
  function _normType(mediaType) {
    var t = String(mediaType || "").toLowerCase();
    return (t === "series" || t === "show" || t === "tvshow" || t === "tv") ? "series" : "movie";
  }
  function _fetchJson(url) {
    return _withDeadline(
      (typeof fetch === "function" ? fetch(url) : Promise.reject(new Error("no fetch")))
        .then(function (res) {
          if (!res || !res.ok) return null;
          return res.json().catch(function () { return null; });
        })
        .catch(function () { return null; })
    );
  }
  function _resolveImdb(tmdbId, mediaType) {
    var key = _normType(mediaType) + ":" + String(tmdbId);
    var now = Date.now();
    if (_imdbCache[key] && now - _imdbCache[key].t < TTL_MS) {
      return Promise.resolve(_imdbCache[key].imdb);
    }
    if (_inflight["imdb:" + key]) return _inflight["imdb:" + key];
    var kind = _normType(mediaType) === "series" ? "tv" : "movie";
    var url = "https://api.themoviedb.org/3/" + kind + "/" + encodeURIComponent(String(tmdbId)) +
      "/external_ids?api_key=" + TMDB_KEY;
    _inflight["imdb:" + key] = _fetchJson(url).then(function (data) {
      var imdb = data && data.imdb_id && /^tt\d+$/.test(String(data.imdb_id)) ? String(data.imdb_id) : null;
      _imdbCache[key] = { t: now, imdb: imdb };
      delete _inflight["imdb:" + key];
      return imdb;
    });
    return _inflight["imdb:" + key];
  }
  function _osv3Rows(imdbId, mediaType, season, episode) {
    var isSeries = _normType(mediaType) === "series";
    var path = isSeries
      ? "series/" + encodeURIComponent(imdbId) + ":" + (parseInt(season, 10) || 1) + ":" + (parseInt(episode, 10) || 1) + ".json"
      : "movie/" + encodeURIComponent(imdbId) + ".json";
    var key = path;
    var now = Date.now();
    if (_cache[key] && now - _cache[key].t < TTL_MS) return Promise.resolve(_cache[key].rows);
    if (_inflight[key]) return _inflight[key];
    _inflight[key] = _fetchJson(OSV3_BASE + path).then(function (data) {
      var list = (data && Array.isArray(data.subtitles)) ? data.subtitles : [];
      var seen = {};
      var rows = [];
      for (var i = 0; i < list.length; i++) {
        var t = list[i];
        if (!t || !t.url) continue;
        var code = CODE_MAP[String(t.lang || "").toLowerCase()] || String(t.lang || "").toLowerCase();
        if (!code) continue;
        var dedupeKey = code + "|" + (t.id || t.url);
        if (seen[dedupeKey]) continue;
        seen[dedupeKey] = 1;
        rows.push({
          url: String(t.url),
          lang: code,
          language: code,
          name: NAME_MAP[code] || (String(t.lang || "subtitle").charAt(0).toUpperCase() + String(t.lang || "subtitle").slice(1))
        });
        if (rows.length >= 60) break;
      }
      _cache[key] = { t: now, rows: rows };
      delete _inflight[key];
      return rows;
    });
    return _inflight[key];
  }

  G.__nvOsv3Subs = {
    get: function (tmdbId, mediaType, season, episode) {
      try {
        return _resolveImdb(tmdbId, mediaType).then(function (imdb) {
          if (!imdb) return [];
          return _osv3Rows(imdb, mediaType, season, episode);
        }).catch(function () { return []; });
      } catch (e) { return Promise.resolve([]); }
    }
  };
})();

/* ===== nv universal subtitle wrapper v1.0.0 (pack 4.48.0) ==================
   Re-wraps module.exports.getStreams: runs the provider lane and the OSv3
   subtitle lane concurrently, then attaches the language tracks to every
   row that has no subtitles of its own. Provider-specific tracks always
   win; rows keep their originals untouched. Fail-soft end to end.
=========================================================================== */
(function () {
  var G = typeof globalThis !== "undefined" ? globalThis : this;
  var lane = G.__nvOsv3Subs;
  var orig = null;
  try { orig = module.exports && module.exports.getStreams; } catch (e) { orig = null; }
  if (!lane || typeof orig !== "function") return;
  module.exports.getStreams = function (tmdbId, mediaType, season, episode) {
    var rowsP;
    try {
      rowsP = Promise.resolve(orig.apply(this, arguments));
    } catch (e) {
      rowsP = Promise.resolve([]);
    }
    var subsP = lane.get(tmdbId, mediaType, season, episode).catch(function () { return []; });
    return Promise.all([rowsP.catch(function () { return []; }), subsP]).then(function (arr) {
      var rows = Array.isArray(arr[0]) ? arr[0] : [];
      var subs = Array.isArray(arr[1]) ? arr[1] : [];
      if (!rows.length || !subs.length) return rows;
      for (var i = 0; i < rows.length; i++) {
        var r = rows[i];
        if (r && (!r.subtitles || !r.subtitles.length)) r.subtitles = subs;
      }
      return rows;
    });
  };
})();

