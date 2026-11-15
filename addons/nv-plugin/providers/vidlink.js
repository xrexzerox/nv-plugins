"use strict";
// vidlink.js - eclipsia haylox.js source (codeberg eclipsia/nuvio-plugin v10.0.0), readable netmirror-style build for pack 4.43.0.
// Device fixes applied: verbatim (device-clean source).
// Subtitles: passed through as upstream emits them (English/Tagalog tracks kept when upstream provides).

const TMDB_API_URL = "https://api.themoviedb.org/3";
const TMDB_API_KEY = "6dc830f9624b43261325bed3bf7d0dfa";
const API_BASE = "https://vidlink.pro/api/b";
const ENC_API = "https://enc-dec.app/api";
const HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36",
  "Connection": "keep-alive",
  "Referer": "https://vidlink.pro/",
  "Origin": "https://vidlink.pro"
};

const ALLOWED_QUALITIES = ["4K", "1440p", "1080p", "720p"];

function resWeight(quality) {
  const q = (quality || "").toUpperCase();
  if (q === "4K" || q === "2160P") return 5;
  if (q === "1440P") return 4;
  if (q === "1080P") return 3;
  if (q === "720P") return 2;
  if (q === "480P") return 1;
  return 0;
}

function getInvertedSortTag(score, maxScore) {
  maxScore = maxScore || 999999;
  let val = Math.max(0, parseInt(score, 10) || 0);
  let inv = Math.max(0, maxScore - val);
  let bin = inv.toString(2);
  while (bin.length < 20) bin = "0" + bin;
  const chars = [];
  for (let i = 0; i < bin.length; i++) {
    chars.push(bin.charAt(i) === "1" ? "\uFEFF" : "\u200B");
  }
  return chars.join("");
}

async function getTmdbInfo(tmdbId, mediaType) {
  try {
    const type = mediaType === "tv" ? "tv" : "movie";
    const res = await fetch(`${TMDB_API_URL}/${type}/${tmdbId}?api_key=${TMDB_API_KEY}`);
    if (!res.ok) return null;
    const data = await res.json();
    const title = mediaType === "tv" ? data.name : data.title;
    if (!title) return null;
    const dateStr = mediaType === "tv" ? data.first_air_date : data.release_date;
    return { title, year: dateStr ? dateStr.substring(0, 4) : null };
  } catch {
    return null;
  }
}

async function encryptTmdbId(tmdbId) {
  try {
    const res = await fetch(`${ENC_API}/enc-vidlink?text=${tmdbId}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data && data.result ? data.result : null;
  } catch {
    return null;
  }
}

function extractQuality(str) {
  if (!str) return null;
  const s = str.toString().toLowerCase();
  if (s.includes("2160") || s.includes("4k")) return "4K";
  if (s.includes("1440") || s.includes("2k")) return "1440p";
  if (s.includes("1080") || s.includes("fhd")) return "1080p";
  if (s.includes("720") || s.includes("hd")) return "720p";
  const match = s.match(/(\d{3,4})[p]?/);
  if (match) {
    const h = parseInt(match[1]);
    if (h >= 2160) return "4K";
    if (h >= 1440) return "1440p";
    if (h >= 1080) return "1080p";
    if (h >= 720) return "720p";
  }
  return null;
}

function resolveUrl(url, baseUrl) {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  try {
    return new URL(url, baseUrl).toString();
  } catch {
    return url;
  }
}

function buildStream(url, qualityKey) {
  if (!url) return null;
  const quality = extractQuality(qualityKey);
  if (!quality) return null;
  return {
    name: "Vidlink",
    title: "Vidlink",
    url,
    quality,
    type: url.toLowerCase().includes(".m3u8") ? "m3u8" : "video"
  };
}

function parseM3U8(content, baseUrl) {
  const lines = content.split("\n").map(l => l.trim()).filter(Boolean);
  const streams = [];
  let current = null;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith("#EXT-X-STREAM-INF:")) {
      current = { resolution: null };
      const resMatch = line.match(/RESOLUTION=(\d+x\d+)/);
      if (resMatch) current.resolution = resMatch[1];
    } else if (current && !line.startsWith("#")) {
      current.url = resolveUrl(line, baseUrl);
      streams.push(current);
      current = null;
    }
  }
  return streams;
}

async function fetchM3U8Streams(playlistUrl) {
  try {
    const r = await fetch(playlistUrl, { headers: HEADERS });
    if (!r.ok) return [];
    const content = await r.text();
    if (!content) return [];
    return parseM3U8(content, playlistUrl).map(s => {
      const qualityKey = s.resolution ? s.resolution.split("x").pop() + "p" : null;
      return buildStream(s.url, qualityKey);
    }).filter(Boolean);
  } catch {
    return [];
  }
}

function extractStreamsFromData(data) {
  const results = [];
  if (!data) return results;

  if (data.stream && data.stream.qualities) {
    for (const key of Object.keys(data.stream.qualities)) {
      const item = data.stream.qualities[key];
      if (item && item.url) {
        const s = buildStream(item.url, key);
        if (s) results.push(s);
      }
    }
    if (data.stream.playlist) {
      results.push({ _playlist: true, url: data.stream.playlist });
    }
    return results;
  }

  if (data.stream && data.stream.playlist) {
    results.push({ _playlist: true, url: data.stream.playlist });
    return results;
  }

  if (data.url) {
    const s = buildStream(data.url, data.quality || null);
    if (s) results.push(s);
    return results;
  }

  if (Array.isArray(data.streams)) {
    for (const item of data.streams) {
      if (item && item.url) {
        const s = buildStream(item.url, item.quality || item.resolution || null);
        if (s) results.push(s);
      }
    }
    return results;
  }

  if (Array.isArray(data.links)) {
    for (const item of data.links) {
      if (item && item.url) {
        const s = buildStream(item.url, item.quality || null);
        if (s) results.push(s);
      }
    }
    return results;
  }

  (function findUrls(obj) {
    if (!obj || typeof obj !== "object") return;
    for (const key of Object.keys(obj)) {
      const val = obj[key];
      const keyLower = key.toLowerCase();
      if (keyLower.includes("subtitle") || keyLower.includes("caption")) continue;
      if (typeof val === "string" && val.startsWith("http")) {
        if (val.includes(".srt") || val.includes(".vtt") ||
            val.includes("subtitle") || val.includes("caption")) continue;
        const s = buildStream(val, key);
        if (s) results.push(s);
      } else if (typeof val === "object" && val !== null) {
        findUrls(val);
      }
    }
  })(data);

  return results;
}

function sortAndDedupeStreams(streams) {
  const seen = new Set();
  let result = streams
    .filter(s => ALLOWED_QUALITIES.indexOf(s.quality) !== -1 && s.url && s.url.startsWith("https"))
    .filter(s => !seen.has(s.url) && seen.add(s.url));

  result.sort((a, b) => resWeight(b.quality) - resWeight(a.quality));

  const total = result.length;
  result = result.map((s, i) => {
    const tag = getInvertedSortTag(total - i, total + 1);
    return Object.assign({}, s, { name: tag + s.name, title: tag + s.title });
  });

  return result;
}

async function getStreams(tmdbId, mediaType, season, episode) {
  try {
    const isTv = mediaType === "tv";
    if (isTv && (season == null || episode == null)) return [];

    const [info, encryptedId] = await Promise.all([
      getTmdbInfo(tmdbId, mediaType),
      encryptTmdbId(tmdbId)
    ]);
    if (!info || !encryptedId) return [];

    const vidlinkUrl = isTv
      ? `${API_BASE}/tv/${encryptedId}/${season}/${episode}`
      : `${API_BASE}/movie/${encryptedId}`;

    const r = await fetch(vidlinkUrl, { headers: HEADERS });
    if (!r.ok) return [];
    const data = await r.json();
    if (!data) return [];

    const extracted = extractStreamsFromData(data);
    if (extracted.length === 0) return [];

    const playlists = extracted.filter(x => x._playlist);
    const direct = extracted.filter(x => !x._playlist);

    if (playlists.length === 0) return sortAndDedupeStreams(direct);

    const m3u8Results = await Promise.all(playlists.map(p => fetchM3U8Streams(p.url)));
    return sortAndDedupeStreams(direct.concat(...m3u8Results));
  } catch {
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

