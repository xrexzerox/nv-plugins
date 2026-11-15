"use strict";
// vidfast.js - eclipsia nyxora.js source (codeberg eclipsia/nuvio-plugin v10.0.0), readable netmirror-style build for pack 4.43.0.
// v7.0.1 (pack 4.49.0): enc-dec.app two-stage protocol (stage=1 -> POST -> stage=2); live-verified 2026-10-18.
// Device fixes applied: verbatim (device-clean source).
// Subtitles: passed through as upstream emits them (English/Tagalog tracks kept when upstream provides).

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_API_KEY = "6dc830f9624b43261325bed3bf7d0dfa";
const BASE_URL = "https://vidfast.vc";
const ENC_API = "https://enc-dec.app/api/enc-vidfast";
const DEC_API = "https://enc-dec.app/api/dec-vidfast";
const BLOCKED_SERVERS = new Set(["Horizon"]);
const ALLOWED_QUALITIES = new Set(["4K", "2160p", "1440p", "1080p", "Adaptive", "Auto"]);
const HEADERS = {
  "Accept": "*/*",
  "Accept-Language": "en-US,en;q=0.9",
  "Connection": "keep-alive",
  "Origin": BASE_URL,
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36",
  "X-Requested-With": "XMLHttpRequest",
};

const heightToQuality = (height) => {
  if (height >= 2160) return "2160p";
  if (height >= 1440) return "1440p";
  if (height >= 1080) return "1080p";
  if (height >= 720) return "720p";
  if (height >= 480) return "480p";
  if (height >= 360) return "360p";
  return `${height}p`;
};

const parseQualityLabel = (str) => {
  if (/2160|4k/i.test(str)) return "2160p";
  if (/1440/i.test(str)) return "1440p";
  if (/1080/i.test(str)) return "1080p";
  if (/720/i.test(str)) return "720p";
  if (/480/i.test(str)) return "480p";
  if (/360/i.test(str)) return "360p";
  if (/auto|adaptive/i.test(str)) return "Auto";
  return null;
};

const extractStreamQuality = (data) => {
  if (data.quality) {
    const q = parseQualityLabel(data.quality);
    if (q) return q;
  }
  if (data.label) {
    const q = parseQualityLabel(data.label);
    if (q) return q;
  }
  const match = data.url?.match(/(\d{3,4})[pP]/);
  if (match) return `${match[1]}p`;
  return "Auto";
};

const resWeight = (quality) => {
  const q = (quality || "").toLowerCase();
  if (q === "2160p" || q === "4k") return 5;
  if (q === "1440p") return 4;
  if (q === "1080p") return 3;
  if (q === "720p") return 2;
  if (q === "480p" || q === "360p") return 1;
  return 0;
};

const getInvertedSortTag = (score, maxScore) => {
  maxScore = maxScore || 999999;
  let inv = Math.max(0, maxScore - Math.max(0, parseInt(score, 10) || 0));
  let bin = inv.toString(2);
  while (bin.length < 20) bin = "0" + bin;
  return bin.split("").map(b => b === "1" ? "\uFEFF" : "\u200B").join("");
};

const fetchPlaylistVariants = async (playlistUrl) => {
  try {
    const res = await fetch(playlistUrl, {
      headers: {
        "User-Agent": HEADERS["User-Agent"],
        "Referer": `${BASE_URL}/`,
      },
    });

    if (!res.ok) return null;

    const text = await res.text();
    if (!text.includes("#EXT-X-STREAM-INF")) return null;

    const tracks = [];
    const lines = text.split("\n");

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line.startsWith("#EXT-X-STREAM-INF")) continue;

      const resMatch = line.match(/RESOLUTION=(\d+)x(\d+)/i);
      const bwMatch = line.match(/BANDWIDTH=(\d+)/i);
      const urlLine = lines[i + 1]?.trim();

      if (!urlLine || urlLine.startsWith("#")) continue;

      const url = urlLine.startsWith("http")
        ? urlLine
        : playlistUrl.substring(0, playlistUrl.lastIndexOf("/") + 1) + urlLine;

      tracks.push({
        url,
        quality: resMatch ? heightToQuality(parseInt(resMatch[2])) : null,
        bandwidth: bwMatch ? parseInt(bwMatch[1]) : 0,
      });
    }

    if (tracks.length === 0) return null;

    tracks.sort((a, b) => b.bandwidth - a.bandwidth);

    for (const track of tracks) {
      if (!track.quality) {
        const m = track.url.match(/(\d{3,4})[pP]/);
        track.quality = m ? `${m[1]}p` : heightToQuality(
          tracks.indexOf(track) === 0 ? 2160 :
            tracks.indexOf(track) === 1 ? 1080 : 720
        );
      }
    }

    return tracks;
  } catch {
    return null;
  }
};

const fetchTmdbMetadata = async (tmdbId, mediaType) => {
  try {
    const endpoint = mediaType === "tv" ? "tv" : "movie";
    const res = await fetch(`${TMDB_BASE_URL}/${endpoint}/${tmdbId}?api_key=${TMDB_API_KEY}`);
    if (!res.ok) return null;
    const data = await res.json();
    const isTv = mediaType === "tv";
    return {
      title: isTv ? data.name : data.title,
      year: (isTv ? data.first_air_date : data.release_date)?.substring(0, 4) || "",
      mediaType: isTv ? "tv" : "movie",
    };
  } catch {
    return null;
  }
};

const resolvePageUrl = (tmdbId, mediaType, season, episode) =>
  mediaType === "tv"
    ? `${BASE_URL}/tv/${tmdbId}/${season}/${episode}/`
    : `${BASE_URL}/movie/${tmdbId}/`;

const extractEncryptedPayload = (pageText) => {
  const m = String(pageText || "").match(/\\"(?:en|token)\\":\\"(.*?)\\"/);
  return m ? m[1] : null;
};

const decrypt = async (payload) =>
  (await fetch(DEC_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: payload }),
  })).json();

const fetchRawStreams = async (tmdbId, mediaType, season, episode) => {
  const pageUrl = resolvePageUrl(tmdbId, mediaType, season, episode);
  const headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36",
    "Referer": `${BASE_URL}/`,
  };

  const pageRes = await fetch(pageUrl, { headers });
  if (!pageRes.ok) return [];

  const payload = extractEncryptedPayload(await pageRes.text());
  if (!payload) return [];

  // v7.0.1 (pack 4.49.0): enc-dec.app split the vidfast endpoint into TWO
  // stages. The old single `?text=` call now answers 400 "Expected query:
  // text, stage" — every vidfast tap died with HTTP 400 before any stream.
  // Verified live 2026-10-18 (6 servers decrypted end-to-end):
  //   1) GET  {ENC}?text={payload}&stage=1  -> {stage1, token}
  //   2) POST {stage1} with X-CSRF-Token    -> text
  //   3) GET  {ENC}?text={text}&stage=2     -> {servers, stream, token}
  //   then unchanged: POST servers -> dec -> POST stream/{data} -> dec.
  const encGet = async (stage) => {
    const res = await fetch(`${ENC_API}?text=${encodeURIComponent(payload)}&stage=${stage}`);
    if (!res.ok) return null;
    const data = await res.json().catch(() => null);
    if (!data || data.status !== 200 || !data.result) return null;
    return data.result;
  };

  const stage1 = await encGet(1);
  if (!stage1 || !stage1.stage1) return [];
  const stage1Headers = {
    ...headers,
    "X-CSRF-Token": stage1.token,
  };
  const stage1Text = await (await fetch(stage1.stage1, { method: "POST", headers: stage1Headers })).text();

  const encData = await fetch(`${ENC_API}?text=${encodeURIComponent(stage1Text)}&stage=2`)
    .then(r => r.ok ? r.json().catch(() => null) : null);
  if (!encData || encData.status !== 200 || !encData.result) return [];

  const { servers: serversUrl, stream: streamBase, token } = encData.result;

  if (token) headers["X-CSRF-Token"] = token;

  const serversEnc = await (await fetch(serversUrl, { method: "POST", headers })).text();
  const { result: servers } = await decrypt(serversEnc);

  if (!Array.isArray(servers) || servers.length === 0) return [];

  const settled = (
    await Promise.all(
      servers
        .filter(s => !BLOCKED_SERVERS.has(s.name))
        .map(async (server, i) => {
          try {
            const name = server.name || `Server ${i + 1}`;
            const res = await fetch(`${streamBase}/${server.data}`, { method: "POST", headers });
            if (!res.ok) return null;

            const { result: data } = await decrypt(await res.text());
            if (!data?.url) return null;

            return {
              name,
              url: data.url,
              quality: extractStreamQuality(data),
              isM3U8: data.url.includes(".m3u8"),
            };
          } catch {
            return null;
          }
        })
    )
  ).filter(Boolean);

  const expanded = (
    await Promise.all(
      settled.map(async (stream) => {
        if (!stream.isM3U8) return [stream];
        const tracks = await fetchPlaylistVariants(stream.url);
        if (tracks?.length > 0) {
          return tracks.map(t => ({
            name: stream.name,
            url: t.url,
            quality: t.quality,
            isM3U8: false,
          }));
        }
        return [stream];
      })
    )
  ).flat();

  const seen = new Set();
  return expanded.filter(s => {
    if (seen.has(s.url)) return false;
    seen.add(s.url);
    return ALLOWED_QUALITIES.has(s.quality);
  });
};

const sortAndTag = (streams) => {
  streams.sort((a, b) => resWeight(b.quality) - resWeight(a.quality));

  const total = streams.length;
  return streams.map((s, i) => {
    const tag = getInvertedSortTag(total - i, total + 1);
    return { ...s, name: tag + s.name };
  });
};

const normalizeStreams = (streams) =>
  sortAndTag(
    streams.map(stream => ({
      name: `VidFast • ${stream.name}`,
      title: `VidFast • ${stream.name}`,
      url: stream.url,
      quality: stream.quality,
      headers: {
        "User-Agent": HEADERS["User-Agent"],
        "Referer": `${BASE_URL}/`,
      },
    }))
  );

async function getStreams(tmdbId, mediaType, season, episode) {
  try {
    if (mediaType === "tv" && (season == null || episode == null)) return [];

    const [meta, streams] = await Promise.all([
      fetchTmdbMetadata(tmdbId, mediaType),
      fetchRawStreams(tmdbId, mediaType, season, episode),
    ]);
    if (!meta || !streams?.length) return [];
    return normalizeStreams(streams);
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

/* BEGIN NV_NON_ANIME_PROVIDER_BOUNDARY */
(function () {
  var G = typeof globalThis !== 'undefined' ? globalThis : this;
  var original = null;
  try { original = module.exports && module.exports.getStreams; } catch (e) { original = null; }
  if (typeof original !== 'function') return;
  var PROVIDER_ID = "vidfast";
  var MAX_MS = 22000;

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
