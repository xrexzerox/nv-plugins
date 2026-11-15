// netmirror.js v17.0.0 - verbatim user-supplied readable implementation (soryn-style).
// Only addition: the guarded globalThis.atob fallback below - Nuvio device runtimes may
// lack global atob, which would kill every NewTV lane. Everything under the guard is the
// pasted code, unmodified.

"use strict";

if (typeof globalThis.atob !== "function") {
  globalThis.atob = function (input) {
    var B64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    var str = String(input).replace(/[\t\n\f\r ]/g, "").replace(/=+$/, "");
    var out = "";
    var bits = 0;
    var acc = 0;
    for (var i = 0; i < str.length; i++) {
      var c = B64.indexOf(str.charAt(i));
      if (c < 0 || c === 64) continue;
      acc = (acc << 6) | c;
      bits += 6;
      if (bits >= 8) {
        bits -= 8;
        out += String.fromCharCode((acc >> bits) & 0xff);
      }
    }
    return out;
  };
}

const TMDB_API_KEY = "6dc830f9624b43261325bed3bf7d0dfa";
const PLATFORM_MAP = {
  netflix: {
    ott: "nf",
    search: "/mobile/search.php",
    post: "/mobile/post.php",
    episodes: "/mobile/episodes.php",
    playlist: "/mobile/playlist.php",
    img: "poster/v",
    epImg: "epimg/150",
  },
  primevideo: {
    ott: "pv",
    search: "/mobile/pv/search.php",
    post: "/mobile/pv/post.php",
    episodes: "/mobile/pv/episodes.php",
    playlist: "/mobile/pv/playlist.php",
    img: "pv/v",
    epImg: "pvepimg",
  },
  hotstar: {
    ott: "hs",
    search: "/mobile/hs/search.php",
    post: "/mobile/hs/post.php",
    episodes: "/mobile/hs/episodes.php",
    playlist: "/mobile/hs/playlist.php",
    img: "hs/v",
    epImg: "hsepimg",
  },
  disney: {
    ott: "hs",
    search: "/mobile/hs/search.php",
    post: "/mobile/hs/post.php",
    episodes: "/mobile/hs/episodes.php",
    playlist: "/mobile/hs/playlist.php",
    img: "hs/v",
    epImg: "hsepimg",
  },
};

const NEW_TV_BASE_HEADERS = {
  "Cache-Control": "no-cache, no-store, must-revalidate",
  "Pragma": "no-cache",
  "Expires": "0",
  "X-Requested-With": "NetmirrorNewTV v1.0",
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:136.0) Gecko/20100101 Firefox/136.0 /OS.GatuNewTV v1.0",
  "Accept": "application/json, text/plain, */*",
};

const NEW_TV_DOMAINS = [
  "aHR0cHM6Ly9tb2JpbGVkZXRlY3RzLmNvbQ==",
  "aHR0cHM6Ly9tb2JpbGVkZXR0LmFwcA==",
  "aHR0cHM6Ly9tb2JpZGV0ZWN0LmFydA==",
  "aHR0cHM6Ly9tb2JpZGV0ZWN0LmNj",
  "aHR0cHM6Ly9tb2JpZGV0ZWN0LmNsaWNr",
  "aHR0cHM6Ly9tb2JpZGV0ZWN0Lmluaw==",
  "aHR0cHM6Ly9tb2JpZGV0ZWN0LmxpdmU=",
  "aHR0cHM6Ly9tb2JpZGV0ZWN0LnBybw==",
  "aHR0cHM6Ly9tb2JpZGV0ZWN0LnNob3A=",
  "aHR0cHM6Ly9tb2JpZGV0ZWN0LnNpdGU=",
  "aHR0cHM6Ly9tb2JpZGV0ZWN0LnNwYWNl",
  "aHR0cHM6Ly9tb2JpZGV0ZWN0LnN0b3Jl",
  "aHR0cHM6Ly9tb2JpZGV0ZWN0LnZpcA==",
  "aHR0cHM6Ly9tb2JpZGV0ZWN0Lndpa2k=",
  "aHR0cHM6Ly9tb2JpZGV0ZWN0Lnh5eg==",
  "aHR0cHM6Ly9tb2JpZGV0ZWN0cy5hcnQ=",
  "aHR0cHM6Ly9tb2JpZGV0ZWN0cy5jYw==",
  "aHR0cHM6Ly9tb2JpZGV0ZWN0cy5pbmZv",
  "aHR0cHM6Ly9tb2JpZGV0ZWN0cy5pbks=",
  "aHR0cHM6Ly9tb2JpZGV0ZWN0cy5saXZl",
  "aHR0cHM6Ly9tb2JpZGV0ZWN0cy5wcm8=",
  "aHR0cHM6Ly9tb2JpZGV0ZWN0cy5zdG9yZQ==",
  "aHR0cHM6Ly9tb2JpZGV0ZWN0cy50b3A=",
  "aHR0cHM6Ly9tb2JpZGV0ZWN0cy54eXo=",
];

let resolvedApiUrl = "";

function buildNewTvHeaders(ott, extra = {}) {
  return { ...NEW_TV_BASE_HEADERS, Ott: ott, ...extra };
}

function meetsQualityFilter(quality) {
  if (quality === "Auto") return true;
  const num = parseInt(quality, 10);
  return !isNaN(num) && num >= 720;
}

async function resolveApiUrl() {
  if (resolvedApiUrl) return resolvedApiUrl;
  for (const encoded of NEW_TV_DOMAINS) {
    const base = atob(encoded).replace(/\/$/, "");
    try {
      const response = await fetch(`${base}/checknewtv.php`, {
        headers: { ...NEW_TV_BASE_HEADERS, "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
      });
      const data = await response.json();
      const tokenHash = data.token_hash;
      if (tokenHash) {
        resolvedApiUrl = atob(tokenHash).replace(/\/$/, "");
        return resolvedApiUrl;
      }
    } catch (_) { }
  }
  throw new Error("Failed to resolve NewTV API base URL");
}

async function fetchFromNetflixDirect(tmdbId, mediaType, season, episode, title) {
  try {
    const apiUrl = mediaType === "tv"
      ? `https://net27.cc/api/embed-tmdb/${tmdbId}?type=tv&s=${season}&e=${episode}`
      : `https://net27.cc/api/embed-tmdb/${tmdbId}`;

    const response = await fetch(apiUrl, {
      headers: {
        "Accept": "application/json, text/plain, */*",
        "Referer": "https://net27.cc/",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36",
      },
    });
    if (!response.ok) return null;

    const data = await response.json();
    if (data.ok !== true) return null;

    const playbackHeaders = {
      "Referer": "https://videodownloader.site/",
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36",
    };

    const formattedSubtitles = (data.captions || []).map((caption) => {
      let url = caption.url;
      if (url.startsWith("/")) url = `https://net27.cc${url}`;
      return { url, language: caption.lang || "en", name: caption.name || "English", headers: playbackHeaders };
    });

    const streams = [];
    if (data.streams && data.streams.length > 0) {
      data.streams.forEach((stream) => {
        if (meetsQualityFilter(`${stream.resolution}p`)) {
          streams.push({
            name: `Netmirror • ${stream.resolution}p`,
            title: `Netmirror • ${stream.resolution}p`,
            url: stream.url,
            quality: `${stream.resolution}p`,
            headers: playbackHeaders,
            subtitles: formattedSubtitles,
          });
        }
      });
    } else if (data.mp4) {
      streams.push({
        name: "Netmirror • Auto",
        title: "Netmirror • Auto",
        url: data.mp4,
        quality: "Auto",
        headers: playbackHeaders,
        subtitles: formattedSubtitles,
      });
    }
    return streams;
  } catch (_) {
    return null;
  }
}

async function fetchEpisodesPage(contentId, seasonId, page, seasonNumber, platform, apiBase) {
  const episodes = [];
  let pg = page;
  while (true) {
    const url = `${apiBase}/newtv/episodes.php?id=${seasonId}&page=${pg}`;
    const resp = await fetch(url, { headers: buildNewTvHeaders(platform.ott) });
    const data = await resp.json();
    if (data.episodes) {
      data.episodes.filter((e) => e !== null).forEach((ep) => {
        const epNum = ep.ep
          ? parseInt(ep.ep)
          : ep.epNum ? parseInt(ep.epNum.replace("E", "")) : null;
        const sNum = seasonNumber || (ep.sNum ? parseInt(ep.sNum.replace("S", "")) : null);
        episodes.push({ id: ep.id, s: sNum, ep: epNum });
      });
    }
    if (data.nextPageShow !== 1) break;
    pg++;
  }
  return episodes;
}

async function getAllEpisodes(contentId, postData, platform, apiBase) {
  const episodes = [];
  const selectedSeasonIdx = postData.season
    ? postData.season.findIndex((s) => s.selected === true)
    : -1;
  const selectedSeasonId = selectedSeasonIdx >= 0
    ? postData.season[selectedSeasonIdx].id
    : postData.nextPageSeason;
  const selectedSeasonNumber = selectedSeasonIdx >= 0 ? selectedSeasonIdx + 1 : null;

  if (postData.episodes) {
    postData.episodes.filter((e) => e !== null).forEach((ep) => {
      const epNum = ep.ep
        ? parseInt(ep.ep)
        : ep.epNum ? parseInt(ep.epNum.replace("E", "")) : null;
      const sNum = selectedSeasonNumber || (ep.sNum ? parseInt(ep.sNum.replace("S", "")) : null);
      episodes.push({ id: ep.id, s: sNum, ep: epNum });
    });
  }

  if (postData.nextPageShow === 1 && selectedSeasonId) {
    const more = await fetchEpisodesPage(contentId, selectedSeasonId, 2, selectedSeasonNumber, platform, apiBase);
    episodes.push(...more);
  }

  if (postData.season) {
    for (let index = 0; index < postData.season.length; index++) {
      const season = postData.season[index];
      if (season.id !== selectedSeasonId && season.id) {
        const more = await fetchEpisodesPage(contentId, season.id, 1, index + 1, platform, apiBase);
        episodes.push(...more);
      }
    }
  }

  return episodes;
}

async function fetchFromPlatform(platformKey, title, mediaType, season, episode) {
  const platform = PLATFORM_MAP[platformKey];
  const apiBase = await resolveApiUrl();

  const searchUrl = `${apiBase}/newtv/search.php?s=${encodeURIComponent(title)}`;
  const searchResp = await fetch(searchUrl, { headers: buildNewTvHeaders(platform.ott) });
  const searchData = await searchResp.json();
  if (!searchData.searchResult || searchData.searchResult.length === 0) return null;

  const result = searchData.searchResult[0];
  const contentId = result.id;

  const postUrl = `${apiBase}/newtv/post.php?id=${contentId}`;
  const postResp = await fetch(postUrl, { headers: buildNewTvHeaders(platform.ott, { Lastep: "", Usertoken: "" }) });
  const postData = await postResp.json();

  let targetId = contentId;
  if (mediaType === "tv") {
    const episodes = await getAllEpisodes(contentId, postData, platform, apiBase);
    const targetEp = episodes.find((ep) => ep && ep.s === season && ep.ep === episode);
    if (targetEp) {
      targetId = targetEp.id;
    } else {
      return null;
    }
  } else {
    const isSeries = postData.type === "t" || (postData.episodes && postData.episodes.filter((e) => e !== null).length > 0);
    if (isSeries) return null;
    targetId = postData.main_id || contentId;
  }

  const playerUrl = `${apiBase}/newtv/player.php?id=${targetId}`;
  const playerResp = await fetch(playerUrl, { headers: buildNewTvHeaders(platform.ott, { Usertoken: "" }) });
  const response = await playerResp.json();

  if (response.status === "ok" && response.video_link) {
    return [{
      name: `Netmirror • ${platformKey.charAt(0).toUpperCase() + platformKey.slice(1)}`,
      title: `Netmirror • ${platformKey.charAt(0).toUpperCase() + platformKey.slice(1)}`,
      url: response.video_link,
      quality: "Auto",
      headers: { Referer: response.referer || apiBase },
    }];
  }
  return null;
}

async function getStreams(tmdbId, mediaType, season, episode) {
  if (mediaType === "tv" && (season == null || episode == null)) return [];

  try {
    const tmdbResp = await fetch(
      `https://api.themoviedb.org/3/${mediaType === "tv" ? "tv" : "movie"}/${tmdbId}?api_key=${TMDB_API_KEY}`,
      {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
          "Accept": "application/json",
        },
      }
    );
    const tmdbData = await tmdbResp.json();
    const title = mediaType === "tv" ? tmdbData.name : tmdbData.title;
    if (!title) return [];

    const platforms = ["netflix", "primevideo", "hotstar", "disney"];
    for (const platformKey of platforms) {
      try {
        let streams = [];
        if (platformKey === "netflix") {
          streams = await fetchFromNetflixDirect(tmdbId, mediaType, season, episode, title);
        }
        if (!streams || streams.length === 0) {
          streams = await fetchFromPlatform(platformKey, title, mediaType, season, episode);
        }
        if (streams && streams.length > 0) {
          return streams.filter((stream) => meetsQualityFilter(stream.quality));
        }
      } catch (_) { }
    }
    return [];
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
