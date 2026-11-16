"use strict";
// purstream.js - eclipsia wrenok.js source (codeberg eclipsia/nuvio-plugin v10.0.0), readable netmirror-style build for pack 4.43.0.
// v3.0.0 (pack 4.44.0, 2026-09-25): WRONG-CONTENT FIX ("purstream provides
// inaccurate stream links"). Root cause found live: findIdByTitle returned
// the FIRST type-matching search hit with zero title/year verification - for
// "Resident Evil" (2026, tmdb 1423191) the site's first movie hit is
// "Bienvenue a Raccoon City" (2021, tmdb 460458), so Nuvio served the 2021
// film for the 2026 release. The fix is three-layer verification, honoring
// the user's "add condition using imdb/tmdb search" directive:
//   L1  candidate title must match the TMDB title (normalized equality or
//       containment in EITHER direction) - rejects different titles outright;
//   L2  candidate release year must be within +-1 of the TMDB year when the
//       candidate exposes a release_date - rejects remakes/older entries;
//   L3  DETERMINISTIC: the media sheet's own tmdbId (the site stores the
//       TMDB id it mapped the item from) must equal the requested tmdbId.
//       Sheet-level verification runs before any row is emitted and skips to
//       the next candidate on mismatch; if no candidate verifies -> [].
// Result: a title absent from purstream (or mismatched) yields ZERO rows
// instead of the wrong movie - "it should not provide inaccurate streams".
// Also: all fetches now carry a guarded cap (device runtimes have no timers;
// there the fetch budget stays the app's 60s kill, node/TV race at 12s).
// Subtitles: passed through as upstream emits them (English/Tagalog tracks kept when upstream provides).

// v3.1.0 (pack 4.45.0): IMDb-search verification gate before the site
// search (nvImdbVerify below) - absent/mismatched IMDb content yields 0
// rows per the user rule; visible "v3.1" chip on row names for
// stale-cache diagnosis (the 4.44.0 report was reproduced as stale JS).
const PURSTREAM_API = 'https://api.purstream.club/api/v1';
const PURSTREAM_REFERER = 'https://purstream.club/';
const PURSTREAM_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
const TMDB_KEY = '6dc830f9624b43261325bed3bf7d0dfa';

const PURSTREAM_HEADERS = {
    'User-Agent': PURSTREAM_UA,
    'Referer': PURSTREAM_REFERER
};

function hasTimers() {
    return typeof setTimeout === 'function' && typeof clearTimeout === 'function';
}

async function fetchJsonCapped(url, options, timeoutMs) {
    const p = fetch(url, options).then((r) => (r && r.ok ? r.json() : null));
    if (hasTimers()) {
        return Promise.race([
            p,
            new Promise((res) => {
                const t = setTimeout(() => res(null), timeoutMs || 12000);
                if (t && typeof t.unref === 'function') t.unref();
            }),
        ]);
    }
    return p;
}

async function fetchTmdbMeta(tmdbId, mediaType) {
    try {
        const url = `https://api.themoviedb.org/3/${mediaType === 'tv' ? 'tv' : 'movie'}/${tmdbId}?api_key=${TMDB_KEY}&language=en-US`;
        const data = await fetchJsonCapped(url, { headers: { 'User-Agent': PURSTREAM_UA } });
        if (!data) return null;
        const date = data.release_date || data.first_air_date || '';
        return {
            title: data.title || data.name || '',
            originalTitle: data.original_title || data.original_name || '',
            year: date ? parseInt(String(date).substring(0, 4), 10) : null,
        };
    } catch {
        return null;
    }
}

/* ===== nv IMDb-search verification v1.0.0 (pack 4.45.0) =====================
   User directive: "it should not provide inaccurate streams if the movies or
   series is not on imdb or tmdb or incorrect ... since we are only using tmdb
   try add condition using imdb search." Runs BEFORE any site search:
     1. The content must expose an IMDb id (TMDB external_ids). No id means the
        title is not on IMDb, so title-based guessing can never be verified
        -> 0 rows (fail-closed, per the user's rule).
     2. IMDb is searched for that exact id (IMDb suggestion API first,
        Cinemeta v3 fallback). Reachable but ABSENT -> 0 rows (same rule).
     3. The IMDb entry's title + year must agree with TMDB (normalized
        containment, year +-1). A mismatched mapping is exactly the
        wrong-content class the user reported -> 0 rows.
   If both IMDb sources are unreachable we cannot tell "absent" from
   "offline", so verification degrades to this provider's own TMDB gates
   instead of zeroing legitimate titles (documented fail-open on offline only).
============================================================================ */
function nvImdbFetchJson(url) {
  return fetchJsonCapped(url, { 'User-Agent': PURSTREAM_UA });
}

function nvImdbNorm(s) {
  return String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}
async function nvImdbVerify(tmdbId, mediaType, tmdbTitle, tmdbYear, knownImdbId) {
  try {
    const kind = mediaType === 'tv' ? 'tv' : 'movie';
    let imdbId = String(knownImdbId || '');
    if (!imdbId) {
      const ex = await nvImdbFetchJson(`https://api.themoviedb.org/3/${kind}/${encodeURIComponent(String(tmdbId))}/external_ids?api_key=${TMDB_KEY}`);
      if (ex && ex.imdb_id) imdbId = String(ex.imdb_id);
    }
    if (!imdbId || imdbId.indexOf('tt') !== 0) return { ok: false, reason: 'not-on-imdb: no imdb id on TMDB' };
    let imdbTitle = '';
    let imdbYear = null;
    let reachable = false;
    const sg = await nvImdbFetchJson(`https://v2.sg.media-imdb.com/suggestion/t/${encodeURIComponent(imdbId)}.json`);
    const d = sg && Array.isArray(sg.d) ? sg.d : [];
    let hit = null;
    for (const x of d) {
      if (x && String(x.id || '').toLowerCase() === imdbId.toLowerCase()) { hit = x; break; }
    }
    if (!hit && d.length) hit = d[0];
    if (hit && hit.l) {
      reachable = true;
      imdbTitle = String(hit.l);
      imdbYear = parseInt(hit.y, 10) || parseInt(hit.tl, 10) || null;
    }
    if (!reachable) {
      const cm = await nvImdbFetchJson(`https://v3-cinemeta.strem.io/meta/${mediaType === 'tv' ? 'series' : 'movie'}/${encodeURIComponent(imdbId)}.json`);
      if (cm && cm.meta && cm.meta.name) {
        reachable = true;
        imdbTitle = String(cm.meta.name);
        imdbYear = parseInt(cm.meta.releaseYear, 10) || parseInt(cm.meta.year, 10) || null;
      }
    }
    if (!reachable) return { ok: true, imdbId, reason: 'imdb-unreachable: own gates apply' };
    if (!imdbTitle) return { ok: false, reason: 'not-on-imdb: no entry for ' + imdbId };
    const a = nvImdbNorm(imdbTitle);
    const t = nvImdbNorm(tmdbTitle);
    const titleOk = !!a && !!t && (a === t || a.includes(t) || t.includes(a));
    const yearOk = !tmdbYear || !imdbYear || Math.abs(imdbYear - parseInt(tmdbYear, 10)) <= 1;
    if (!titleOk || !yearOk) return { ok: false, reason: 'imdb-mismatch: imdb "' + imdbTitle + '" (' + imdbYear + ') vs tmdb "' + tmdbTitle + '" (' + tmdbYear + ')' };
    return { ok: true, imdbId, imdbTitle, imdbYear };
  } catch (e) {
    return { ok: true, reason: 'verify-error: own gates apply' };
  }
}
function parseLang(n) {
    const up = (n || '').toUpperCase();
    if (up.includes('VOSTFR')) return 'VOSTFR';
    if (up.includes('VF')) return 'VF';
    return 'MULTI';
}

function parseQuality(n) {
    const up = (n || '').toUpperCase();
    if (up.includes('4K')) return '4K';
    if (up.includes('1080')) return '1080p';
    if (up.includes('720')) return '720p';
    return '1080p';
}

function buildTitle(title, quality, lang, format, season, episode) {
    const dispLang = lang === 'MULTI' ? 'MULTI' : lang === 'VOSTFR' ? 'VOSTFR' : 'VF';
    const fmt = (format || 'M3U8').toUpperCase();
    let line1 = title;
    if (season && episode) line1 = `S${season} E${episode} | ${title}`;
    return `${line1}\n${[quality, dispLang, fmt].join(' | ')}`;
}

function normalizeTitle(s) {
    return String(s || '')
        .toLowerCase()
        .replace(/[\u00c0-\u017f]/g, (c) => c.normalize('NFD').replace(/[\u0300-\u036f]/g, ''))
        .replace(/[^a-z0-9]+/g, ' ')
        .trim();
}

/** L1: title identity (either direction containment catches franchise subtitles). */
function titleMatches(candidateTitle, meta) {
    const a = normalizeTitle(candidateTitle);
    const targets = [normalizeTitle(meta.title), normalizeTitle(meta.originalTitle)].filter(Boolean);
    for (const t of targets) {
        if (!t) continue;
        if (a === t) return true;
        if (a.includes(t) || t.includes(a)) return true;
    }
    return false;
}

/** L2: year sanity (+-1) when the candidate exposes a release_date. */
function yearMatches(candidate, meta) {
    if (!meta || !meta.year) return true;
    const cdate = candidate.release_date || candidate.releaseDate || '';
    if (!cdate) return true; // no year on the candidate -> L3 sheet check decides
    const cy = parseInt(String(cdate).substring(0, 4), 10);
    if (!Number.isFinite(cy)) return true;
    return Math.abs(cy - meta.year) <= 1;
}

async function findCandidates(title) {
    const encoded = encodeURIComponent(title);
    const data = await fetchJsonCapped(`${PURSTREAM_API}/search-bar/search/${encoded}`, { headers: PURSTREAM_HEADERS });
    const items = data?.data?.items?.movies?.items || [];
    return Array.isArray(items) ? items : [];
}

/**
 * Candidates ordered by (type match, title match, year proximity); each is
 * verified against its media sheet's tmdbId (L3) before being accepted.
 * Returns the purstream media id of the FIRST verified candidate or null.
 */
async function findVerifiedId(meta, preferType) {
    const candidates = await findCandidates(meta.title);
    if (!candidates.length && meta.originalTitle && meta.originalTitle !== meta.title) {
        candidates.push(...(await findCandidates(meta.originalTitle)));
    }
    if (!candidates.length) return null;

    const scored = [];
    for (const item of candidates) {
        if (!item || item.id == null) continue;
        if (item.type && preferType && item.type !== preferType) continue;
        if (!titleMatches(item.title, meta)) continue; // L1
        const yScore = yearMatches(item, meta) ? 1 : 0; // L2 (ordering only)
        if (!yScore) continue;
        scored.push(item);
    }
    // closest year first, then catalog order
    scored.sort((a, b) => {
        const ya = parseInt(String(a.release_date || '').substring(0, 4), 10) || 0;
        const yb = parseInt(String(b.release_date || '').substring(0, 4), 10) || 0;
        const da = meta.year ? Math.abs(ya - meta.year) : 0;
        const db = meta.year ? Math.abs(yb - meta.year) : 0;
        return da - db;
    });
    if (!scored.length) return null;

    // L3: sheet-level tmdbId verification (deterministic)
    for (const item of scored.slice(0, 3)) {
        try {
            const sheet = await fetchJsonCapped(`${PURSTREAM_API}/media/${item.id}/sheet`, { headers: PURSTREAM_HEADERS });
            const payload = sheet && (sheet.data?.items || sheet.data?.data?.items) || null;
            const siteTmdbId = payload ? Number(payload.tmdbId) : NaN;
            if (Number.isFinite(siteTmdbId) && Number(siteTmdbId) === Number(meta.tmdbId)) {
                return { id: item.id, sheet: payload };
            }
            console.log(`[Purstream] sheet tmdbId mismatch for "${item.title}" (site ${siteTmdbId} != requested ${meta.tmdbId}) - candidate rejected`);
        } catch { }
    }
    return null;
}

function normalizeMovieSources(urls, title) {
    return (urls || [])
        .filter((u) => u.url && (u.url.match(/\.m3u8/i) || u.url.match(/\.mp4/i)))
        .map((u) => {
            const q = parseQuality(u.name);
            const l = parseLang(u.name);
            const f = u.url.match(/\.mp4/i) ? 'mp4' : 'm3u8';
            return {
                name: `Purstream v3.1 • ${q}`,
                title: buildTitle(title, q, l, f),
                url: u.url,
                quality: q,
                headers: PURSTREAM_HEADERS,
            };
        });
}

function normalizeEpisodeSources(sources, title, season, episode) {
    return (sources || []).map((s) => {
        const q = parseQuality(s.source_name);
        const l = parseLang(s.source_name);
        return {
            name: `Purstream v3.1 • ${q}`,
            title: buildTitle(title, q, l, s.format || 'm3u8', season, episode),
            url: s.stream_url,
            quality: q,
            headers: PURSTREAM_HEADERS,
        };
    });
}

async function getStreams(tmdbId, mediaType, season, episode) {
    try {
        const isTv = mediaType === 'tv';

        if (isTv && (season == null || episode == null)) return [];

        const meta = await fetchTmdbMeta(tmdbId, mediaType);
        if (!meta || !meta.title) return [];
        meta.tmdbId = tmdbId;

        // v3.1.0: IMDb-search verification (user directive) - absent or
        // mismatched content never reaches the site search.
        const nvImdb = await nvImdbVerify(tmdbId, isTv ? 'tv' : 'movie', meta.title, meta.year, '');
        if (!nvImdb.ok) {
            console.log(`[Purstream] imdb verify failed (${nvImdb.reason}) for tmdb ${tmdbId} - 0 rows`);
            return [];
        }

        const preferType = isTv ? 'tv' : 'movie';
        const verified = await findVerifiedId(meta, preferType);
        if (!verified) {
            // Absent or unverifiable on purstream -> NO rows (never wrong ones).
            return [];
        }

        let streams;
        if (isTv) {
            const data = await fetchJsonCapped(
                `${PURSTREAM_API}/stream/${verified.id}/episode?season=${season}&episode=${episode}`,
                { headers: PURSTREAM_HEADERS }
            );
            const sources = data?.data?.items?.sources || data?.data?.data?.items?.sources || [];
            streams = normalizeEpisodeSources(sources, meta.title, season, episode);
        } else {
            const urls = verified.sheet ? verified.sheet.urls || [] : [];
            streams = normalizeMovieSources(urls, meta.title);
        }

        const seen = new Set();
        return streams.filter((s) => s.url && !seen.has(s.url) && seen.add(s.url));
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
  var PROVIDER_ID = "purstream";
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
