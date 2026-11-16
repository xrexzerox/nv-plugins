"use strict";
// ctgmovies.js - eclipsia durnel.js source (codeberg eclipsia/nuvio-plugin v10.0.0), readable netmirror-style build for pack 4.43.0.
// Device fixes applied: sleep.
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
const TMDB_API_URL = 'https://api.themoviedb.org/3';
const TMDB_API_KEY = '6dc830f9624b43261325bed3bf7d0dfa';
const BASE_URL = 'https://ctgmovies.com';
const API_BASE_URL = 'https://cockpit.103.109.92.178.nip.io/api/v1';
const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36";
const AUTH_CONFIG = {
    token: '',
    cookie: '',
};
const WEB_HEADERS = {
    'User-Agent': USER_AGENT,
    'Accept': 'application/json',
    'Accept-Language': 'en',
    'Referer': BASE_URL + '/',
    'Origin': BASE_URL
};
const STREAM_HEADERS = {
    'User-Agent': USER_AGENT,
    'Accept': 'video/webm,video/ogg,video/*;q=0.9,application/ogg;q=0.7,audio/*;q=0.6,*/*;q=0.5',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'identity',
    'Referer': BASE_URL + '/'
};

function encodeUrl(s) {
    return encodeURIComponent(s || '');
}

function yearFromDate(date) {
    if (!date) return null;
    const m = date.match(/\d{4}/);
    return m ? parseInt(m[0], 10) : null;
}

function cleanDisplayTitle(title) {
    if (!title) return '';
    return title
        .replace(/\b(1080p|720p|480p|2160p|4k|web[- ]?dl|webrip|bluray|hdrip|x264|x265|hevc|10bit|dual[- ]?audio|hindi[- ]?dubbed|dubbed|esub)\b/gi, ' ')
        .replace(/\[[^\]]*\]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

function normalizedTitle(title) {
    return cleanDisplayTitle(title)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, ' ')
        .trim();
}

function optString(obj, key) {
    if (!obj || obj[key] == null) return null;
    let v = obj[key];
    if (typeof v !== 'string') v = String(v);
    v = v.trim();
    if (!v || v === 'null') return null;
    return v;
}

function optInt(obj, key) {
    if (!obj || obj[key] == null) return null;
    const v = obj[key];
    if (typeof v === 'number') return v;
    const parsed = parseInt(String(v), 10);
    return isNaN(parsed) ? null : parsed;
}

function optDouble(obj, key) {
    if (!obj || obj[key] == null) return null;
    const v = obj[key];
    if (typeof v === 'number') return v;
    const parsed = parseFloat(String(v));
    return isNaN(parsed) ? null : parsed;
}

function splitCsv(s) {
    if (!s) return [];
    return s.split(/[,\s]+/).map(x => x.trim()).filter(Boolean);
}

function resolveMediaUrl(url) {
    if (!url) return '';
    if (url.startsWith('//')) return 'https:' + url;
    if (/^https?:\/\//i.test(url)) return url;
    if (url.startsWith('/')) return BASE_URL + url;
    return url;
}

function isDirectVideo(url) {
    if (!url) return false;
    const lower = url.split('?')[0].toLowerCase();
    return lower.endsWith('.mp4') || lower.endsWith('.mkv') ||
        lower.endsWith('.webm') || lower.endsWith('.avi') ||
        lower.endsWith('.mov') || lower.endsWith('.ts') || lower.endsWith('.m4v');
}

function qualityFromUrl(url) {
    if (!url) return 'Unknown';
    const m = url.match(/(2160p|1440p|1080p|720p|480p|360p|4k|uhd)/i);
    if (m) {
        const v = m[1].toLowerCase();
        if (v === '4k' || v === 'uhd') return '2160p';
        return v;
    }
    return 'Unknown';
}

function resWeight(quality) {
    const q = (quality || '').toLowerCase();
    if (q === '2160p') return 5;
    if (q === '1440p') return 4;
    if (q === '1080p') return 3;
    if (q === '720p') return 2;
    if (q === '480p') return 1;
    if (q === '360p') return 0;
    return -1;
}

function isValidLanguage(lang) {
    if (!lang) return false;
    const lower = lang.toLowerCase().trim();
    if (lower === '' || lower === 'unknown' || lower === 'null' || lower === 'none') return false;
    return true;
}

function buildShortSourceName(link, finalUrl, index) {
    const langs = new Set();

    function addLang(value) {
        if (!value) return;
        const parts = splitCsv(value);
        for (const part of parts) {
            if (isValidLanguage(part)) {
                langs.add(part);
            }
        }
    }

    if (Array.isArray(link.languages)) {
        for (const lang of link.languages) {
            addLang(optString({ val: lang }, 'val') || String(lang).trim());
        }
    }

    const langField = optString(link, 'language') || optString(link, 'lang');
    addLang(langField);

    const subKeys = ['subtitle_tracks', 'subtitles', 'captions', 'tracks'];
    for (const key of subKeys) {
        const subs = link[key];
        if (Array.isArray(subs)) {
            for (const sub of subs) {
                const label = optString(sub, 'label')
                    || optString(sub, 'language')
                    || optString(sub, 'srclang');
                addLang(label);
            }
        }
    }

    if (langs.size === 0) {
        langs.add('English');
    }

    const langString = Array.from(langs).join(' • ');
    return `CTGMovies`;
}

function buildQualityInitials() {
    const hints = Array.prototype.slice.call(arguments).filter(Boolean);
    const raw = hints.join(' ').replace(/%20/g, ' ').replace(/_/g, ' ').replace(/-/g, ' ');
    if (!raw.trim()) return null;

    function has(pattern) {
        return new RegExp(pattern, 'i').test(raw);
    }

    const parts = [];
    if (has('\\b3d\\b')) parts.push('3D');

    if (has('\\b(?:4k|2160p|uhd)\\b')) {
        parts.push('4K');
    } else {
        const re = /\b(1080|720|480|360)p\b/gi;
        let m;
        const nums = [];
        while ((m = re.exec(raw)) !== null) nums.push(parseInt(m[1], 10));
        const max = Math.max.apply(null, nums.length ? nums : [-Infinity]);
        if (max !== -Infinity) parts.push(max + 'p');
    }

    if (!parts.length && has('\\bHD\\b')) parts.push('HD');

    if (!parts.length) {
        const map = [
            ['WEB-DL', '\\bweb[- ]?dl\\b'],
            ['WEBRip', '\\bwebrip\\b'],
            ['BluRay', '\\b(?:bluray|blu ray|brrip)\\b'],
            ['HDRip', '\\bhdrip\\b'],
            ['HEVC', '\\b(?:hevc|x265|h265)\\b'],
            ['10bit', '\\b10[- ]?bit\\b'],
        ];
        for (const [label, pattern] of map) {
            if (has(pattern)) { parts.push(label); break; }
        }
    }
    return parts.length ? parts.join(' ') : null;
}

function cleanSourceName(s) {
    if (!s) return '';
    return s.replace('auto:', '')
        .replace(/:/g, ' ')
        .replace(/-/g, ' ')
        .trim()
        || s;
}

function formatBytes(bytes) {
    if (!bytes || bytes === 0) return 'Unknown';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function getTMDBDetails(tmdbId, mediaType) {
    const endpoint = mediaType === 'tv' ? 'tv' : 'movie';
    const url = `${TMDB_API_URL}/${endpoint}/${tmdbId}?api_key=${TMDB_API_KEY}&append_to_response=external_ids`;

    return fetch(url, { headers: { 'Accept': 'application/json' }, skipSizeCheck: true })
        .then(r => {
            if (!r.ok) throw new Error('TMDB HTTP ' + r.status);
            return r.json();
        })
        .then(data => {
            const title = mediaType === 'tv' ? data.name : data.title;
            const releaseDate = mediaType === 'tv' ? data.first_air_date : data.release_date;
            return {
                title: title,
                year: releaseDate ? parseInt(releaseDate.split('-')[0], 10) : null,
                imdbId: (data.external_ids && data.external_ids.imdb_id) || null,
            };
        })
        .catch(() => null);
}

function queryString(query) {
    query = query || {};
    const params = Object.keys(query)
        .filter(k => query[k] != null)
        .map(k => `${encodeUrl(k)}=${encodeUrl(String(query[k]))}`);
    return params.length ? '?' + params.join('&') : '';
}

function buildApiUrl(path, query) {
    const p = path.startsWith('/') ? path : '/' + path;
    return API_BASE_URL + p + queryString(query);
}

function buildSameOriginUrl(path, query) {
    const p = path.startsWith('/') ? path : '/' + path;
    return BASE_URL + '/api/v1' + p + queryString(query);
}

function apiHeaders() {
    const h = Object.assign({}, WEB_HEADERS);
    if (AUTH_CONFIG.token && AUTH_CONFIG.token.trim()) {
        const token = AUTH_CONFIG.token.trim()
            .replace(/^Bearer\s+/i, '');
        h['Authorization'] = 'Bearer ' + token;
        h['x-auth-token'] = token;
    }
    if (AUTH_CONFIG.cookie && AUTH_CONFIG.cookie.trim()) {
        h['Cookie'] = AUTH_CONFIG.cookie.trim();
    }
    return h;
}

function apiGet(path, query) {
    const primaryUrl = buildApiUrl(path, query);
    const fallbackUrl = buildSameOriginUrl(path, query);
    const headers = apiHeaders();

    function tryFetch(url, attempt) {
        attempt = attempt || 0;
        return fetch(url, { headers: headers, skipSizeCheck: true })
            .then(r => {
                if (r.status >= 500 && r.status < 600 && attempt < 1) {
                    return nvSleep(300)
                        .then(() => tryFetch(url, attempt + 1));
                }
                if (!r.ok) throw new Error('HTTP ' + r.status);
                return r.text();
            });
    }

    return tryFetch(primaryUrl)
        .catch(() => tryFetch(fallbackUrl))
        .catch(() => null);
}

function toSearchItem(obj, kind) {
    const isMovie = kind === 'movies';
    const isAnime = kind === 'anime' || (obj.is_anime === true && kind !== 'tv');

    const title = optString(obj, 'title')
        || optString(obj, 'name')
        || optString(obj, 'english_title');
    if (!title) return null;

    const id = optString(obj, 'slug') || optString(obj, 'id') || optString(obj, '_id');
    if (!id) return null;

    const poster = optString(obj, 'poster_url') || optString(obj, 'cover_url');
    const year = optInt(obj, 'year')
        || yearFromDate(optString(obj, 'release_date'))
        || yearFromDate(optString(obj, 'first_air_date'));

    let type;
    if (isMovie) type = 'movie';
    else if (isAnime) type = 'anime';
    else type = 'tv';

    let url;
    if (isMovie) url = `${BASE_URL}/movies/${id}`;
    else if (isAnime) url = `${BASE_URL}/anime/${id}`;
    else url = `${BASE_URL}/tv/${id}`;

    return {
        title: cleanDisplayTitle(title),
        url: url,
        kind: kind,
        id: id,
        type: type,
        poster: poster,
        year: year,
        sourceLabel: buildQualityInitials(
            optString(obj, 'quality'),
            optString(obj, 'source'),
            optString(obj, 'source_display'),
            title
        ),
    };
}

function parseSearchItems(raw, kind) {
    if (!raw) return [];
    let trimmed = raw.trim();
    let arr;
    try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
            arr = parsed;
        } else if (parsed && typeof parsed === 'object') {
            arr = parsed.movies || parsed.results || parsed.data || [];
        } else {
            arr = [];
        }
    } catch (e) {
        return [];
    }

    const items = [];
    for (const obj of arr) {
        const item = toSearchItem(obj, kind);
        if (item) items.push(item);
    }
    return items;
}

function searchCtg(query) {
    const params = { search: query };

    const moviesP = apiGet('/movies', params).then(raw => parseSearchItems(raw, 'movies')).catch(() => []);
    const tvP = apiGet('/tv', params).then(raw => parseSearchItems(raw, 'tv')).catch(() => []);
    const animeP = apiGet('/anime', params).then(raw => parseSearchItems(raw, 'anime')).catch(() => []);

    return Promise.all([moviesP, tvP, animeP]).then(([m, t, a]) => m.concat(t).concat(a));
}

function findBestMatch(mediaInfo, items, mediaType) {
    if (!items.length) return null;

    const targetNorm = normalizedTitle(mediaInfo.title);
    const targetYear = mediaInfo.year;
    let best = null;
    let bestScore = -1;

    for (const item of items) {
        const itemNorm = normalizedTitle(item.title);
        let score = -1;

        if (itemNorm === targetNorm) {
            score = 100;
            if (targetYear && item.year === targetYear) score += 50;
        } else if (itemNorm.includes(targetNorm) && targetNorm.length >= 4) {
            score = 60;
            if (targetYear && item.year === targetYear) score += 30;
        } else if (targetNorm.includes(itemNorm) && itemNorm.length >= 4) {
            score = 40;
        }

        if (mediaType === 'tv' && (item.type === 'tv' || item.type === 'anime')) score += 10;
        if (mediaType === 'movie' && (item.type === 'movie' || item.type === 'anime')) score += 10;

        if (score > bestScore) {
            bestScore = score;
            best = item;
        }
    }

    return bestScore >= 30 ? best : null;
}

function getDetail(item) {
    return apiGet(`/${item.kind}/${encodeUrl(item.id)}`)
        .then(raw => {
            if (!raw) return null;
            try { return JSON.parse(raw); } catch (e) { return null; }
        });
}

function buildStreams(links, mediaTitle) {
    const seen = new Set();
    const out = [];

    links.forEach((link, i) => {
        if (!link || link.broken === true) return;

        const rawUrl = optString(link, 'url')
            || optString(link, 'file')
            || optString(link, 'src')
            || optString(link, 'link');
        if (!rawUrl) return;

        const finalUrl = resolveMediaUrl(rawUrl);
        if (!finalUrl || seen.has(finalUrl)) return;
        seen.add(finalUrl);

        const sourceName = buildShortSourceName(link, finalUrl, i + 1);

        let quality = qualityFromUrl(finalUrl);
        if (quality === 'Unknown') {
            const qHint = optString(link, 'quality') || '';
            const qMatch = qHint.match(/(2160|1440|1080|720|480|360)p?/i);
            if (qMatch) {
                const v = parseInt(qMatch[1], 10);
                quality = v >= 2160 ? '2160p' : v >= 1440 ? '1440p' : v >= 1080 ? '1080p' :
                    v >= 720 ? '720p' : v >= 480 ? '480p' : v >= 360 ? '360p' : 'Unknown';
            }
        }

        const langs = new Set();

        function addLang(value) {
            if (!value) return;
            const parts = splitCsv(value);
            for (const part of parts) {
                if (isValidLanguage(part)) {
                    langs.add(part);
                }
            }
        }

        if (Array.isArray(link.languages)) {
            for (const lang of link.languages) {
                addLang(optString({ val: lang }, 'val') || String(lang).trim());
            }
        }

        const langField = optString(link, 'language') || optString(link, 'lang');
        addLang(langField);

        const subKeys = ['subtitle_tracks', 'subtitles', 'captions', 'tracks'];
        for (const key of subKeys) {
            const subs = link[key];
            if (Array.isArray(subs)) {
                for (const sub of subs) {
                    const label = optString(sub, 'label')
                        || optString(sub, 'language')
                        || optString(sub, 'srclang');
                    addLang(label);
                }
            }
        }

        const languageStr = langs.size > 0 ? Array.from(langs).join(' • ') : 'English';

        out.push({
            name: sourceName,
            title: sourceName,
            url: finalUrl,
            quality: quality,
            language: languageStr,
            headers: STREAM_HEADERS
        });
    });

    return out.sort((a, b) => resWeight(b.quality) - resWeight(a.quality));
}

function getMovieStreams(item, mediaInfo) {
    return getDetail(item)
        .then(obj => {
            if (!obj) return [];
            const links = obj.links || [];
            if (!links.length) return [];
            const title = mediaInfo.year
                ? `${mediaInfo.title} (${mediaInfo.year})`
                : mediaInfo.title;
            return buildStreams(links, title);
        })
        .catch(() => []);
}

function getEpisodeStreams(item, mediaInfo, season, episode) {
    return getDetail(item)
        .then(obj => {
            if (!obj) return [];
            const episodes = obj.episodes || [];
            if (!episodes.length) return [];

            const mergedLinks = [];
            for (const ep of episodes) {
                const epNum = optInt(ep, 'episode_number') || optInt(ep, 'absolute_number');
                const seasonNum = optInt(ep, 'season_number') || 1;
                if (seasonNum !== season || epNum !== episode) continue;

                const links = ep.links || [];
                for (const link of links) {
                    if (link && link.broken !== true) mergedLinks.push(link);
                }
            }

            if (!mergedLinks.length) return [];

            const mediaTitle = `${mediaInfo.title} S${String(season).padStart(2, '0')}E${String(episode).padStart(2, '0')}`;
            return buildStreams(mergedLinks, mediaTitle);
        })
        .catch(() => []);
}

function scrape(metadata) {
    const title = metadata && metadata.title;
    const type = (metadata && metadata.type) || 'movie';
    const season = metadata && metadata.season;
    const episode = metadata && metadata.episode;
    const year = metadata && metadata.year;

    if (!title) {
        return Promise.resolve([]);
    }

    const mediaInfo = { title: title, year: year || null, imdbId: (metadata && metadata.imdbId) || null };

    return searchCtg(title)
        .then(items => {
            if (!items.length) return [];

            const match = findBestMatch(mediaInfo, items, type);
            if (!match) return [];

            if (type === 'tv' && season && episode) {
                return getEpisodeStreams(match, mediaInfo, season, episode);
            }
            return getMovieStreams(match, mediaInfo);
        })
        .catch(() => []);
}

function getStreams(tmdbId, mediaType = 'movie', season = null, episode = null) {
    return getTMDBDetails(tmdbId, mediaType)
        .then(mediaInfo => {
            if (!mediaInfo || !mediaInfo.title) return [];

            return scrape({
                title: mediaInfo.title,
                year: mediaInfo.year,
                type: mediaType,
                season: season,
                episode: episode,
                imdbId: mediaInfo.imdbId,
            });
        })
        .catch(() => []);
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
  var PROVIDER_ID = "ctgmovies";
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
