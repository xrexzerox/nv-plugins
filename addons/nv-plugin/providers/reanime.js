"use strict";
// reanime.js - eclipsia praxiel.js source (codeberg eclipsia/nuvio-plugin v10.0.0), readable netmirror-style build for pack 4.43.0.
// Device fixes applied: verbatim (device-clean source).
// Subtitles: passed through as upstream emits them (English/Tagalog tracks kept when upstream provides).

const TMDB_API_URL = `https://api.themoviedb.org/3`;
const TMDB_API_KEY = "6dc830f9624b43261325bed3bf7d0dfa";
const API_BASE = "https://flixcloud.cc";
const ANIZIP_API = "https://api.ani.zip/mappings";
const BASE_URLS = ["https://reanime.to", "https://reanime.cz", "https://reanime.wtf"];
const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36";
const HEADERS = {
    "User-Agent": USER_AGENT,
    "Accept": "application/json, text/plain, */*",
    "Accept-Language": "en-US,en;q=0.9",
};

let activeReanimeOrigin = BASE_URLS[0];

function toAbsoluteUrl(path, base) {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    const b = base || activeReanimeOrigin;
    return b + (path.startsWith("/") ? path : "/" + path);
}

async function httpGetText(url, options) {
    options = options || {};
    const isAbsolute = url.startsWith("http");
    const targets = isAbsolute ? [url] : BASE_URLS.map(function (d) { return toAbsoluteUrl(url, d); });
    let lastErr;
    for (let i = 0; i < targets.length; i++) {
        const target = targets[i];
        try {
            const res = await fetch(target, Object.assign({}, options, {
                headers: Object.assign({}, HEADERS, options.headers || {}),
            }));
            if (res.ok) {
                if (!isAbsolute) {
                    const m = target.match(/^(https?:\/\/[^/]+)/);
                    if (m) activeReanimeOrigin = m[1];
                }
                return await res.text();
            }
            lastErr = new Error("HTTP " + res.status + ": " + target);
        } catch (e) {
            lastErr = e;
        }
    }
    throw lastErr || new Error("Failed: " + url);
}

async function httpGetJson(url, options) {
    options = options || {};
    const text = await httpGetText(url, Object.assign({}, options, {
        headers: Object.assign({ "Accept": "application/json, text/plain, */*" }, options.headers || {}),
    }));
    return JSON.parse(text);
}

async function fetchAniZip(param, value) {
    return httpGetJson(ANIZIP_API + "?" + encodeURIComponent(param) + "=" + encodeURIComponent(value));
}

async function resolveAnilistId(tmdbId) {
    // v1.4.2 (pack 4.51.0): the 4.49.0 probe conflated the REQUEST param
    // with the RESPONSE key. Live re-probe 2026-10-19: fetchAniZip works
    // with param "themoviedb_id" (tmdb_id is what 400s); ids nest under
    // data.mappings. Deterministic lane restored, fail-soft to the
    // title->index search on any miss.
    try {
        const data = await fetchAniZip("themoviedb_id", String(tmdbId));
        const m = (data && (data.mappings || data)) || {};
        const al = m.anilist_id != null ? parseInt(m.anilist_id, 10) : null;
        if (al && isFinite(al) && al > 0) return { anilistId: String(al), title: "" };
        return { anilistId: null, title: "" };
    } catch (e) {
        return { anilistId: null, title: "" };
    }
}

async function fetchTmdbTitle(tmdbId, mediaType) {
    try {
        const endpoint = mediaType === "tv" ? "tv" : "movie";
        const res = await fetch(
            `${TMDB_API_URL}/${endpoint}/${tmdbId}?api_key=${TMDB_API_KEY}`,
            { headers: HEADERS }
        );
        if (!res.ok) return { title: "", year: null };
        const data = await res.json();
        const title = mediaType === "tv" ? (data.name || "") : (data.title || "");
        const year = ((data.first_air_date || data.release_date || "").slice(0, 4)) || null;
        return { title, year };
    } catch (e) {
        return { title: "", year: null };
    }
}

function slugifyTitle(val) {
    return String(val || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function computeMatchScore(title, query, year, targetAlId, candidateAlId) {
    if (targetAlId && candidateAlId && String(targetAlId) === String(candidateAlId)) return 1000;
    const a = slugifyTitle(title);
    const b = slugifyTitle(query);
    if (!a || !b) return 0;
    let score = 0;
    if (a === b) score += 100;
    if (a.indexOf(b) !== -1 || b.indexOf(a) !== -1) score += 50;
    const words = b.split(/\s+/).filter(Boolean);
    for (let i = 0; i < words.length; i++) {
        if (a.indexOf(words[i]) !== -1) score += 4;
    }
    if (year && String(title).indexOf(String(year)) !== -1) score += 10;
    return score;
}

function parseAnilistId(item) {
    const direct = item && (item.anilist_id || item.anilistId);
    if (direct) return String(direct);
    const urls = [
        item && item.cover_image && item.cover_image.extra_large,
        item && item.cover_image && item.cover_image.large,
        item && item.cover_image && item.cover_image.medium,
        item && item.banner_image,
    ].filter(Boolean);
    for (let i = 0; i < urls.length; i++) {
        const m = String(urls[i]).match(/\/b?x?(\d+)-|\/(\d+)[-.]/);
        if (m) return m[1] || m[2];
    }
    return null;
}

async function queryReanimeIndex(query, year, targetAlId) {
    targetAlId = targetAlId || null;
    const endpoints = [
        "/api/v1/search?q=" + encodeURIComponent(query) + "&limit=36",
        "/api/search?q=" + encodeURIComponent(query),
    ];

    const candidates = [];

    for (let ei = 0; ei < endpoints.length; ei++) {
        try {
            const text = await httpGetText(endpoints[ei]);
            const trimmed = text.trim();
            if (!trimmed.startsWith("{") && !trimmed.startsWith("[")) continue;
            const json = JSON.parse(text);
            const list = json.results || json.data || json.anime || (Array.isArray(json) ? json : null);
            if (!Array.isArray(list)) continue;

            for (let li = 0; li < list.length; li++) {
                const item = list[li];
                const rawSlug = item.anime_id || item.slug || item.id || item.url;
                if (!rawSlug) continue;
                const cleanSlug = String(rawSlug).replace(/-[a-z0-9]{6}$/, "");
                const rawTitle = typeof item.title === "object"
                    ? ((item.title && (item.title.english || item.title.romaji || item.title.native)) || cleanSlug)
                    : (item.title || item.name || cleanSlug);
                const alId = parseAnilistId(item);
                candidates.push({
                    slug: String(rawSlug),
                    cleanSlug: cleanSlug,
                    title: rawTitle,
                    anilistId: alId,
                    score: computeMatchScore(rawTitle, query, year, targetAlId, alId),
                });
            }
        } catch (e) { }

        let hasExact = false;
        for (let ci = 0; ci < candidates.length; ci++) {
            if (candidates[ci].score >= 1000) { hasExact = true; break; }
        }
        if (hasExact) break;
        if (candidates.length > 0 && !targetAlId) break;
    }

    const seen = {};
    const unique = [];
    for (let i = 0; i < candidates.length; i++) {
        const c = candidates[i];
        if (!c.slug || seen[c.slug]) continue;
        seen[c.slug] = true;
        unique.push(c);
    }
    unique.sort(function (a, b) { return b.score - a.score; });
    // v1.3.0 (pack 4.44.0): accuracy gate per the "provides inaccurate stream
    // links" report. Previously the top candidate was returned REGARDLESS of
    // score - a query like "Resident Evil" matched any anime sharing one
    // word (score 4-58) and flixcloud served links for the wrong show.
    // Accepted now only when the match is real: anilist-id equality (1000)
    // or exact normalized-slug equality (>=100). Containment/word-overlap
    // alone (50/4-per-word) is never enough - wrong-show links are worse
    // than no links.
    const best = unique.length > 0 ? unique[0] : null;
    return best && (best.score >= 1000 || best.score >= 100) ? best : null;
}

async function fetchFlixServerList(slug, episodeNum, language, anilistId) {
    const watchPath = "/watch/" + (slug || "anime") + "?ep=" + episodeNum;

    async function tryFlixApi(alId) {
        const json = await httpGetJson("/api/flix/" + alId + "/" + episodeNum, {
            headers: { "Referer": toAbsoluteUrl(watchPath) },
        });
        if (!json.success || !json.servers || !json.servers.length) return null;
        const filtered = json.servers.filter(function (s) {
            return !language || !s.dataType || s.dataType === language;
        });
        return filtered.length > 0 ? filtered : json.servers;
    }

    if (anilistId) {
        try {
            const servers = await tryFlixApi(anilistId);
            if (servers) return servers;
        } catch (e) { }
    }

    if (slug) {
        try {
            const html = await httpGetText("/anime/" + slug + "?_ep=" + episodeNum);
            const m = html.match(/anilist_id:\s*(\d+)/);
            if (m) {
                const servers = await tryFlixApi(m[1]);
                if (servers) return servers;
            }
        } catch (e) { }
    }

    return [];
}

async function resolveFlixDownloadUrl(embedUrl) {
    try {
        const m = embedUrl.match(/\/e\/([a-z0-9]+)/i);
        if (!m) return null;
        const aid = m[1];
        const dlHeaders = { "Accept": "*/*", "Referer": API_BASE + "/", "User-Agent": USER_AGENT };
        const res = await fetch(API_BASE + "/d/" + aid + "/__data.json", { headers: dlHeaders });
        if (!res.ok) return null;

        const body = await res.text();
        const fileIdM = body.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
        const tokenM = body.match(/eyJ[\w-]+\.[\w-]+\.[\w-]+/);
        const baseM = body.match(/https:\/\/fetch\d*\.flixcloud\.cc/);

        if (!fileIdM || !tokenM) return null;
        const fileId = fileIdM[0];
        const token = tokenM[0];
        const fetchBase = baseM ? baseM[0] : API_BASE;

        for (let attempt = 0; attempt < 2; attempt++) {
            try {
                const progRes = await fetch(
                    fetchBase + "/download/" + fileId + "/progress?token=" + token,
                    { headers: dlHeaders }
                );
                if (progRes.ok) {
                    const t = await progRes.text();
                    if (t.indexOf('"status":"ready"') !== -1 || t.indexOf('"ready"') !== -1) break;
                    if (t.indexOf('"status":"failed"') !== -1) return null;
                }
            } catch (e) { }
        }

        return {
            url: fetchBase + "/download/" + fileId + "?token=" + token,
            headers: dlHeaders,
        };
    } catch (e) {
        return null;
    }
}

async function getStreams(tmdbId, mediaType, season, episode) {
    try {
        if (mediaType !== "tv" && mediaType !== "movie") return [];
        if (mediaType === "tv" && episode == null) return [];

        const isAnilist = typeof tmdbId === "string" && tmdbId.startsWith("anilist:");
        let alId = null;
        let episodeNum = mediaType === "tv" ? Number(episode) : 1;
        let searchTitle = "";
        let searchYear = null;

        if (isAnilist) {
            alId = tmdbId.split(":")[1];
        } else {
            try {
                const info = await resolveAnilistId(tmdbId);
                alId = info.anilistId;
                searchTitle = info.title || "";
            } catch (e) { }
        }

        if (!searchTitle && !isAnilist) {
            const meta = await fetchTmdbTitle(tmdbId, mediaType);
            searchTitle = meta.title;
            searchYear = meta.year;
        }

        const serversByLang = {};
        const langs = ["sub", "dub"];

        if (alId) {
            const langResults = await Promise.allSettled([
                fetchFlixServerList(null, episodeNum, "sub", alId),
                fetchFlixServerList(null, episodeNum, "dub", alId),
            ]);
            for (let i = 0; i < langResults.length; i++) {
                if (langResults[i].status === "fulfilled" && langResults[i].value.length) {
                    serversByLang[langs[i]] = langResults[i].value;
                }
            }
        }

        if (!Object.keys(serversByLang).length && searchTitle) {
            const anime = await queryReanimeIndex(searchTitle, searchYear, alId);
            if (anime) {
                const finalAlId = alId || anime.anilistId;
                const langResults = await Promise.allSettled([
                    fetchFlixServerList(anime.slug, episodeNum, "sub", finalAlId),
                    fetchFlixServerList(anime.slug, episodeNum, "dub", finalAlId),
                ]);
                for (let i = 0; i < langResults.length; i++) {
                    if (langResults[i].status === "fulfilled" && langResults[i].value.length) {
                        serversByLang[langs[i]] = langResults[i].value;
                    }
                }
            }
        }

        if (!Object.keys(serversByLang).length) return [];

        const streams = [];
        const seenUrls = {};
        const displayTitle = searchTitle || "Anime";

        for (let li = 0; li < langs.length; li++) {
            const lang = langs[li];
            const serverList = serversByLang[lang] || [];
            const streamLabel = mediaType === "movie"
                ? displayTitle + " (" + lang + ")"
                : displayTitle + " - Episode " + episodeNum + " (" + lang + ")";

            const jobs = [];
            for (let si = 0; si < serverList.length; si++) {
                const server = serverList[si];
                const dataLink = server.dataLink;
                if (!dataLink) continue;
                const serverTag = server.serverName || ("HD-" + (si + 1));
                jobs.push({ dataLink, serverTag, streamLabel });
            }

            const jobResults = await Promise.allSettled(jobs.map(async function (job) {
                const dl = await resolveFlixDownloadUrl(job.dataLink).catch(function () { return null; });
                return dl && dl.url ? { data: dl, job } : null;
            }));

            for (let ri = 0; ri < jobResults.length; ri++) {
                if (jobResults[ri].status !== "fulfilled" || !jobResults[ri].value) continue;
                const { data, job } = jobResults[ri].value;
                const dedupeKey = data.url.split("?")[0];
                if (seenUrls[dedupeKey]) continue;
                seenUrls[dedupeKey] = true;
                streams.push({
                    name: "Re:ANIME v1.4 \u2022 " + job.serverTag,
                    title: "Re:ANIME \u2022 " + job.serverTag,
                    url: data.url,
                    quality: "1080p \u2022 MKV",
                    headers: data.headers || {},
                });
            }
        }

        return streams;
    } catch (e) {
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
