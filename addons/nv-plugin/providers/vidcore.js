"use strict";

// vidcore.js - eclipsia lenyr.js source (codeberg eclipsia/nuvio-plugin v10.0.0), readable netmirror-style build for pack 4.43.0.
// Device fixes applied: qs.
// Subtitles: passed through as upstream emits them (English/Tagalog tracks kept when upstream provides).

/* device-safe helpers (pack house) */
function nvQs(params) {
  return Object.keys(params).map(function (k) {
    return encodeURIComponent(k) + "=" + encodeURIComponent(params[k]);
  }).join("&");
}
function nvSleep(ms) {
  return new Promise(function (r) {
    if (typeof setTimeout === "function") setTimeout(r, ms); else r();
  });
}
function nvTimeoutRej(ms, err) {
  return new Promise(function (_, rej) {
    if (typeof setTimeout === "function") setTimeout(function () { rej(err); }, ms);
  });
}
function nvUtf8Decode(bytes) {
  var out = "", i = 0;
  while (i < bytes.length) {
    var b = bytes[i++];
    if (b < 0x80) out += String.fromCharCode(b);
    else if (b >= 0xc0 && b < 0xe0) out += String.fromCharCode(((b & 0x1f) << 6) | (bytes[i++] & 0x3f));
    else if (b >= 0xe0 && b < 0xf0) out += String.fromCharCode(((b & 0x0f) << 12) | ((bytes[i++] & 0x3f) << 6) | (bytes[i++] & 0x3f));
    else {
      var cp = ((b & 0x07) << 18) | ((bytes[i++] & 0x3f) << 12) | ((bytes[i++] & 0x3f) << 6) | (bytes[i++] & 0x3f);
      cp -= 0x10000;
      out += String.fromCharCode(0xd800 + (cp >> 10), 0xdc00 + (cp & 0x3ff));
    }
  }
  return out;
}
"use strict"

const MAIN_URL = "https://vidcore.org";
const API_BASE = "https://hahaevilcraft.site";
const TMDB_API_BASE = "https://api.themoviedb.org/3";
const TMDB_API_KEY = "6dc830f9624b43261325bed3bf7d0dfa";
const PROVIDER_NAME = "VidCore";
const MIN_STREAM_SIZE_MB = 768;
/* v1.2.0: the backend now exposes a single source id (vaplayer); the old
   hera / vidsuper-vidnest / multivid ids answer NotFoundError. */
const SERVER_POOL = [
    { id: "vaplayer", label: "VaPlayer" },
];

function formatFileSize(bytes) {
    if (!bytes) return "Unknown";
    const k = 1024;
    const units = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${units[i]}`;
}

function exceedsMinimumSize(sizeStr) {
    const match = String(sizeStr || "").match(/^([\d.]+)\s*(Bytes|KB|MB|GB|TB)$/i);
    if (!match) return true;
    const toMb = { BYTES: 1 / 1048576, KB: 1 / 1024, MB: 1, GB: 1024, TB: 1048576 };
    return parseFloat(match[1]) * (toMb[match[2].toUpperCase()] || 0) >= MIN_STREAM_SIZE_MB;
}

function resolveQualityLabel(width, height) {
    if (width >= 3200 || height >= 2000) return "4K";
    if (width >= 2400 || height >= 1400) return "1440p";
    if (width >= 1800 || height >= 1000) return "1080p";
    if (width >= 1200 || height >= 700) return "720p";
    if (width >= 800 || height >= 460) return "480p";
    if (width >= 600 || height >= 340) return "360p";
    if (width > 0 || height > 0) return "240p";
    return "Unknown";
}

function resolveAbsoluteUrl(rawUrl, baseUrl) {
    try {
        return new URL(rawUrl, baseUrl).toString();
    } catch {
        return rawUrl;
    }
}

function extractHighestBandwidthVariant(m3u8Text, playlistUrl) {
    const lines = m3u8Text.split("\n").map((l) => l.trim());
    let best = null;
    for (let i = 0; i < lines.length; i++) {
        if (!lines[i].startsWith("#EXT-X-STREAM-INF")) continue;
        const variantUrl = lines[i + 1];
        if (!variantUrl || variantUrl.startsWith("#")) continue;
        const bwMatch = lines[i].match(/BANDWIDTH=(\d+)/);
        const resMatch = lines[i].match(/RESOLUTION=(\d+)x(\d+)/);
        const bandwidth = bwMatch ? parseInt(bwMatch[1], 10) : 0;
        const width = resMatch ? parseInt(resMatch[1], 10) : 0;
        const height = resMatch ? parseInt(resMatch[2], 10) : 0;
        if (!best || bandwidth > best.bandwidth) {
            best = { url: resolveAbsoluteUrl(variantUrl, playlistUrl), bandwidth, width, height };
        }
    }
    return best;
}

function extractSseCompletedPayload(rawText) {
    const lines = rawText.split("\n");
    let currentEvent = null;
    for (const line of lines) {
        if (line.startsWith("event:")) {
            currentEvent = line.slice(6).trim();
        } else if (line.startsWith("data:") && currentEvent === "completed") {
            try {
                return JSON.parse(line.slice(5).trim());
            } catch {
                return null;
            }
        }
    }
    return null;
}

async function fetchTmdbMetadata(tmdbId, mediaType, season, episode) {
    try {
        const endpoint = mediaType === "tv" ? "tv" : "movie";
        const detailUrl = `${TMDB_API_BASE}/${endpoint}/${tmdbId}?api_key=${TMDB_API_KEY}`;
        const episodeUrl = mediaType === "tv"
            ? `${TMDB_API_BASE}/tv/${tmdbId}/season/${season}/episode/${episode}?api_key=${TMDB_API_KEY}`
            : null;

        const requests = [fetch(detailUrl, { redirect: "follow" })];
        if (episodeUrl) requests.push(fetch(episodeUrl, { redirect: "follow" }));

        const responses = await Promise.all(requests);
        const detail = responses[0].ok ? await responses[0].json() : null;
        const episode_ = (episodeUrl && responses[1].ok) ? await responses[1].json() : null;

        const title = detail ? (detail.title || detail.name || "") : "";
        const runtimeMinutes = episode_ ? episode_.runtime : (detail ? detail.runtime : null);

        return { title, runtimeSeconds: runtimeMinutes ? runtimeMinutes * 60 : null };
    } catch {
        return { title: "", runtimeSeconds: null };
    }
}

async function fetchMirrorStreams(mirrorId, referer, tmdbId, mediaType, title) {
    try {
        const params = nvQs({
            id: mirrorId,
            tmdbId: String(tmdbId),
            type: mediaType,
            starred: "1",
            fallback: "false",
            title: title || "",
            _cb: String(Date.now())
        });
        const resp = await fetch(`${API_BASE}/scrape/source?${params.toString()}`, {
            headers: { Referer: referer, Accept: "text/event-stream" },
            redirect: "follow"
        });
        if (!resp.ok) return [];
        const payload = extractSseCompletedPayload(await resp.text());
        if (!payload) return [];
        /* v1.2.0: the completed event now carries a single stream OBJECT
           ({type, playlist, id, flags, captions}); older deployments sent an
           array. Normalize both into an array of entries. */
        const st = payload.stream;
        if (Array.isArray(st)) return st.filter(Boolean);
        if (st && typeof st === "object" && st.playlist) return [st];
        return [];
    } catch {
        return [];
    }
}

async function resolveStreamFromEntry(mirrorId, mirrorLabel, entry, runtimeSeconds, referer) {
    try {
        if (entry.type !== "hls" || !entry.playlist || !/^https?:\/\//i.test(entry.playlist)) return null;
        const playbackHeaders = { Referer: referer };
        const resp = await fetch(entry.playlist, { headers: playbackHeaders, redirect: "follow" });
        if (!resp.ok) return null;
        const topVariant = extractHighestBandwidthVariant(await resp.text(), entry.playlist);
        if (!topVariant) return null;
        const qualityLabel = resolveQualityLabel(topVariant.width, topVariant.height);
        const estimatedSize = runtimeSeconds && topVariant.bandwidth
            ? formatFileSize(topVariant.bandwidth * runtimeSeconds / 8)
            : "Unknown";
        if (!exceedsMinimumSize(estimatedSize)) return null;
        /* v1.2.0: pass through backend captions (vtt tracks) when present */
        const captionRows = Array.isArray(entry.captions)
            ? entry.captions
                .filter((c) => c && (c.file || c.url))
                .map((c) => ({
                    url: c.file || c.url,
                    lang: String(c.language || c.lang || c.label || "und").slice(0, 8).toLowerCase(),
                    language: String(c.language || c.lang || c.label || "und").slice(0, 8).toLowerCase(),
                    name: String(c.label || c.language || "Subtitle")
                }))
            : [];
        return {
            name: `${PROVIDER_NAME} \u2022 ${mirrorLabel}`,
            title: `${PROVIDER_NAME} \u2022 ${mirrorLabel}`,
            quality: qualityLabel,
            size: estimatedSize,
            url: entry.playlist,
            headers: playbackHeaders,
            subtitles: captionRows
        };
    } catch {
        return null;
    }
}

async function getStreams(tmdbId, mediaType, season, episode) {
    try {
        if (mediaType === "tv" && (season == null || episode == null)) return [];

        const numericId = parseInt(tmdbId, 10);
        if (!numericId) return [];

        const isTv = mediaType === "tv";
        const referer = isTv
            ? `${MAIN_URL}/embed/tv/${numericId}/${season}/${episode}`
            : `${MAIN_URL}/embed/movie/${numericId}`;

        const { title, runtimeSeconds } = await fetchTmdbMetadata(numericId, mediaType, season, episode);

        const mirrorResults = await Promise.all(
            SERVER_POOL.map(({ id }) => fetchMirrorStreams(id, referer, numericId, mediaType, title))
        );

        const seenPlaylists = new Set();
        const uniqueEntries = [];
        for (let i = 0; i < mirrorResults.length; i++) {
            for (const entry of mirrorResults[i]) {
                if (!entry.playlist || seenPlaylists.has(entry.playlist)) continue;
                seenPlaylists.add(entry.playlist);
                uniqueEntries.push({ mirror: SERVER_POOL[i], entry });
            }
        }
        if (!uniqueEntries.length) return [];

        const resolved = await Promise.all(
            uniqueEntries.map(({ mirror, entry }) => resolveStreamFromEntry(mirror.id, mirror.label, entry, runtimeSeconds, referer))
        );

        return resolved.filter((s) => s != null);
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
    // Captions are optional. Give OSV3 a short head start, then return the
    // provider's playable rows even if the subtitle service is unavailable.
    var subsFastP;
    if (typeof setTimeout === "function" && typeof Promise !== "undefined" && Promise.race) {
      var subsTimer = null;
      var subsFallback = new Promise(function (resolve) {
        subsTimer = setTimeout(function () { resolve([]); }, 1200);
        if (subsTimer && typeof subsTimer.unref === "function") subsTimer.unref();
      });
      subsFastP = Promise.race([subsP, subsFallback]).then(function (value) {
        if (subsTimer != null && typeof clearTimeout === "function") clearTimeout(subsTimer);
        return value;
      }, function () {
        if (subsTimer != null && typeof clearTimeout === "function") clearTimeout(subsTimer);
        return [];
      });
    } else {
      subsFastP = Promise.resolve([]);
    }
    return Promise.all([rowsP.catch(function () { return []; }), subsFastP]).then(function (arr) {
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

/* BEGIN NV_NON_ANIME_PROVIDER_BOUNDARY */
(function () {
  var G = typeof globalThis !== 'undefined' ? globalThis : this;
  var original = null;
  try { original = module.exports && module.exports.getStreams; } catch (e) { original = null; }
  if (typeof original !== 'function') return;
  var PROVIDER_ID = "vidcore";
  var MAX_MS = 12000;

  function number(raw) {
    return raw != null && /^\d+$/.test(String(raw).trim()) ? Number(raw) : null;
  }
  function clean(raw) {
    var id = String(raw == null ? '' : raw).trim();
    try { id = decodeURIComponent(id); } catch (e) {}
    id = id.replace(/[?#].*$/, '').replace(/\.json$/i, '').replace(/\/+$/, '');
    return id;
  }
  function normalize(input, mediaType, season, episode, argCount) {
    var id = clean(input);
    var mt = String(mediaType == null ? '' : mediaType).trim().toLowerCase();
    if (number(mediaType) != null && argCount === 3) {
      episode = season; season = mediaType; mt = 'tv';
    }
    var match = id.match(/^tmdb:(\d+)(?::(\d+)(?::(\d+))?)?$/i);
    if (match) {
      id = match[1];
      if (season == null && match[2] != null) season = Number(match[2]);
      if (episode == null && match[3] != null) episode = Number(match[3]);
    } else {
      match = id.match(/^(asian:[a-z0-9-]+|(?:mal|anilist|kitsu|anikoto):\d+)(?::(\d+)(?::(\d+))?)?$/i);
      if (match) {
        id = match[1];
        if (season == null && match[3] != null) season = Number(match[2]);
        if (episode == null && match[3] != null) episode = Number(match[3]);
        if (episode == null && match[2] != null && match[3] == null) episode = Number(match[2]);
        var owner = /^asian:pmh-/i.test(id) ? 'pinoymovieshub' :
          /^asian:pen-/i.test(id) ? 'pencuri' :
          /^asian:(?:ks|va|kh)-/i.test(id) ? 'asianhub' :
          /^asian:hd4u-/i.test(id) ? 'hdhub4u' :
          /^(mal|anilist|kitsu|anikoto):/i.test(id) ? 'miruro' : '';
        if (!owner || owner !== PROVIDER_ID) return null;
      } else if (!/^\d+$/.test(id) && !/^tt\d+$/i.test(id)) {
        return null;
      }
    }
    if (/^(series|show|tvshow|tv_show|tv|other)$/.test(mt)) mt = 'tv';
    else if (mt !== 'movie') mt = number(episode) != null ? 'tv' : 'movie';
    season = number(season); episode = number(episode);
    if (mt === 'tv' && (season == null || episode == null || episode < 1)) return null;
    return { id: id, mediaType: mt, season: season, episode: episode };
  }
  function cleanRows(raw) {
    if (!Array.isArray(raw)) return [];
    var out = [], seen = {};
    for (var i = 0; i < raw.length && out.length < 40; i++) {
      var row = raw[i];
      if (!row || typeof row !== 'object') continue;
      var url = String(row.url || row.playlist || '').trim();
      if (!/^https?:\/\//i.test(url) || /^https?:\/\/[^/]+\/$/i.test(url)) continue;
      if (/^(?:javascript|data):/i.test(url) || /(?:^|[?&])(?:error|message)=/i.test(url)) continue;
      if (seen[url]) continue;
      seen[url] = 1;
      var copy = {};
      for (var k in row) if (Object.prototype.hasOwnProperty.call(row, k)) copy[k] = row[k];
      copy.url = url;
      out.push(copy);
    }
    return out;
  }
  function tmdbKey() {
    var key = '';
    try {
      if (typeof G.__NV_TMDB_API_KEY === 'string') key = G.__NV_TMDB_API_KEY;
      if (!key && typeof TMDB_API_KEY === 'string') key = TMDB_API_KEY;
      if (!key && typeof TMDB_KEY === 'string') key = TMDB_KEY;
    } catch (e) {}
    return key;
  }
  function resolveImdb(id, mediaType) {
    if (!/^tt\d+$/i.test(id) || PROVIDER_ID === 'torrents' || PROVIDER_ID === 'tagalogtorrents') {
      return Promise.resolve(id);
    }
    var key = tmdbKey();
    if (!key || typeof fetch !== 'function') return Promise.resolve(null);
    var kind = mediaType === 'tv' ? 'tv_results' : 'movie_results';
    var request = Promise.resolve().then(function () {
      return fetch('https://api.themoviedb.org/3/find/' + encodeURIComponent(id) +
        '?external_source=imdb_id&api_key=' + encodeURIComponent(key));
    }).then(function (res) {
      if (!res || !res.ok) return null;
      return res.json();
    }).then(function (data) {
      var list = data && Array.isArray(data[kind]) ? data[kind] : [];
      return list.length && /^\d+$/.test(String(list[0].id)) ? String(list[0].id) : null;
    }).catch(function () { return null; });
    if (typeof setTimeout !== 'function' || typeof clearTimeout !== 'function') return request;
    var timer = null;
    var timeout = new Promise(function (resolve) {
      timer = setTimeout(function () { resolve(null); }, 6000);
      if (timer && typeof timer.unref === 'function') timer.unref();
    });
    return Promise.race([request, timeout]).then(function (result) {
      if (timer != null) clearTimeout(timer);
      return result;
    }).catch(function () {
      if (timer != null) clearTimeout(timer);
      return null;
    });
  }
  function invoke(args, normalized) {
    args[0] = normalized.id;
    args[1] = normalized.mediaType;
    args[2] = normalized.season;
    args[3] = normalized.episode;
    var pending;
    try { pending = Promise.resolve(original.apply(this, args)); }
    catch (e) { return Promise.resolve([]); }
    if (typeof setTimeout !== 'function' || typeof clearTimeout !== 'function') {
      return pending.then(cleanRows).catch(function () { return []; });
    }
    var timer = null;
    var timeout = new Promise(function (resolve) {
      timer = setTimeout(function () { resolve([]); }, MAX_MS);
      if (timer && typeof timer.unref === 'function') timer.unref();
    });
    return Promise.race([pending, timeout]).then(function (rows) {
      if (timer != null) clearTimeout(timer);
      return cleanRows(rows);
    }).catch(function () {
      if (timer != null) clearTimeout(timer);
      return [];
    });
  }
  module.exports.getStreams = function () {
    var args = Array.prototype.slice.call(arguments);
    var normalized = normalize(args[0], args[1], args[2], args[3], args.length);
    if (!normalized) return Promise.resolve([]);
    var self = this;
    return resolveImdb(normalized.id, normalized.mediaType).then(function (resolvedId) {
      if (!resolvedId) return [];
      normalized.id = resolvedId;
      return invoke.call(self, args, normalized);
    }).catch(function () { return []; });
  };
})();
/* END NV_NON_ANIME_PROVIDER_BOUNDARY */
