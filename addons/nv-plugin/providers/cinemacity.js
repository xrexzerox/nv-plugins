"use strict";
// cinemacity.js - eclipsia svartok.js source (codeberg eclipsia/nuvio-plugin v10.0.0), readable netmirror-style build for pack 4.43.0.
// Device fixes applied: atob.
// Subtitles: passed through as upstream emits them (English/Tagalog tracks kept when upstream provides).

/* device guard: Nuvio realm may lack global atob (pack house fix, same as netmirror v17) */
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
const CINEMACITY_BASE_URL = atob("aHR0cHM6Ly9jaW5lbWFjaXR5LmNj");
const REVERSE_PROXY_ORIGIN = "https://" + atob("Y2MucmVhbGJlc3RpYS5jb20=");
const DEFAULT_USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36";
const SITEMAP_FEED_URL = `${CINEMACITY_BASE_URL}/news_pages.xml`;
const SITEMAP_CACHE_TTL_MS = 3_600_000;
const TMDB_API_BASE_URL = "https://api.themoviedb.org/3";
const DEFAULT_PROXY_HEADERS = { "User-Agent": DEFAULT_USER_AGENT };
const TITLE_STOPWORDS = new Set([
  "the", "a", "an", "of", "and", "in", "on", "to", "for", "at", "by", "is", "it",
  "il", "lo", "la", "gli", "le", "un", "uno", "una", "di", "da", "del", "della", "dei", "e", "o", "con", "per", "su", "tra", "fra",
]);

let sitemapCatalogCache = null;

function normalizeHttpHeaders(headers) {
  if (!headers || typeof headers !== "object") return headers;
  const normalized = {};
  for (const [key, value] of Object.entries(headers)) {
    if (value == null) continue;
    const lowerKey = String(key).toLowerCase();
    if (lowerKey === "user-agent") normalized["User-Agent"] = value;
    else if (lowerKey === "referer" || lowerKey === "referrer") normalized["Referer"] = value;
    else if (lowerKey === "origin") normalized["Origin"] = value;
    else if (lowerKey === "accept") normalized["Accept"] = value;
    else if (lowerKey === "accept-language") normalized["Accept-Language"] = value;
    else normalized[key] = value;
  }
  return normalized;
}

async function fetchViaProxy(url) {
  const parsed = url.startsWith("http") ? new URL(url) : null;
  const path = parsed ? parsed.pathname + parsed.search : url;
  const target = REVERSE_PROXY_ORIGIN.replace(/\/+$/, "") + (path.startsWith("/") ? path : "/" + path);
  const res = await fetch(target, { headers: DEFAULT_PROXY_HEADERS });
  if (!res.ok) throw new Error(`Proxy HTTP ${res.status}`);
  return res.text();
}

function resolveAbsoluteUrl(base, relative) {
  try { return new URL(relative, base).toString(); } catch (_) { return relative; }
}

function isNotWebReadyStream(stream, providerName) {
  const combined = [stream?.url, stream?.name, stream?.title, stream?.server, providerName]
    .filter(Boolean).join(" ").toLowerCase();
  return combined.includes("loadm") || combined.includes("mixdrop") || combined.includes("mxcontent");
}

function toProviderSlug(name) {
  const slug = String(name || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "");
  return slug || undefined;
}

function buildStreamDescriptor(stream, providerName, mediaMeta = null) {
  if (!stream) return stream;

  const rawQuality = (stream.quality || "1080p").toLowerCase();
  let normalizedQuality = "1080p";
  if (rawQuality.includes("4k") || rawQuality.includes("2160")) normalizedQuality = "4K";
  else if (rawQuality.includes("1440")) normalizedQuality = "1440p";
  else if (rawQuality.includes("1080")) normalizedQuality = "1080p";
  else if (rawQuality.includes("720")) normalizedQuality = "720p";
  else if (rawQuality.includes("480")) normalizedQuality = "480p";
  else if (rawQuality.includes("360")) normalizedQuality = "360p";
  else normalizedQuality = stream.quality || "1080p";

  const isHighQuality = normalizedQuality === "4K" ||
    (stream.url && (stream.url.includes("hq") || stream.url.includes("hevc")));
  const audioCodec = isHighQuality ? "DD5.1" : "AAC";
  const videoCodec = (normalizedQuality === "4K" || (stream.url && stream.url.includes("hevc")))
    ? "HEVC" : "H.264";

  const runtime = mediaMeta?.runtime ?? stream.runtime;
  const displayName = providerName || stream.providerName || stream.name || "CinemaCity";

  const qualityLabel = runtime
    ? `${normalizedQuality} • ${runtime} minutes\n${videoCodec} • ${audioCodec}`
    : `${normalizedQuality}\n${videoCodec} • ${audioCodec}`;

  const behaviorHints = stream.behaviorHints && typeof stream.behaviorHints === "object"
    ? { ...stream.behaviorHints } : {};

  let mergedHeaders = { ...(stream.headers || {}) };
  if (behaviorHints.proxyHeaders?.request) Object.assign(mergedHeaders, behaviorHints.proxyHeaders.request);
  else if (behaviorHints.headers) Object.assign(mergedHeaders, behaviorHints.headers);
  mergedHeaders = Object.keys(mergedHeaders).length ? normalizeHttpHeaders(mergedHeaders) : null;

  const isStreamingCommunity =
    String(providerName || "").toLowerCase() === "streamingcommunity" ||
    String(stream?.name || "").toLowerCase().includes("streamingcommunity");

  if (isStreamingCommunity && !mergedHeaders) {
    delete behaviorHints.proxyHeaders;
    delete behaviorHints.headers;
    delete behaviorHints.notWebReady;
  }
  if (mergedHeaders) {
    behaviorHints.proxyHeaders = { ...(behaviorHints.proxyHeaders || {}), request: mergedHeaders };
    behaviorHints.headers = mergedHeaders;
  }

  const providerExplicitlySetNotWebReady = stream.behaviorHints && "notWebReady" in stream.behaviorHints;
  if (!isStreamingCommunity && isNotWebReadyStream(stream, providerName)) {
    behaviorHints.notWebReady = true;
  } else if (!providerExplicitlySetNotWebReady) {
    delete behaviorHints.notWebReady;
  }

  const referer = stream.referer ?? mergedHeaders?.Referer ?? mergedHeaders?.referer;
  const userAgent = stream.userAgent ?? mergedHeaders?.["User-Agent"] ?? mergedHeaders?.["user-agent"];

  const { quality: _q, language: _l, ...streamBase } = stream;

  return {
    ...streamBase,
    name: displayName,
    title: displayName,
    quality: qualityLabel,
    _nuvio_formatted: true,
    behaviorHints,
    provider: stream.provider || toProviderSlug(providerName),
    referer, userAgent,
    headers: mergedHeaders,
  };
}

function decodeHtmlEntities(str) {
  return String(str || "")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&ndash;|&mdash;/g, "-").replace(/\u2013|\u2014/g, "-");
}

function normalizeTitle(value) {
  return decodeHtmlEntities(String(value || ""))
    .normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase().replace(/\([^)]*\)/g, " ").replace(/[^a-z0-9]+/g, " ").trim();
}

const compactTitle = (value) => normalizeTitle(value).replace(/\s+/g, "");

function extractReleaseYear(meta) {
  const raw = meta?.release_date || meta?.first_air_date || "";
  const year = Number.parseInt(String(raw).slice(0, 4), 10);
  return Number.isInteger(year) ? year : null;
}

function tokenizeTitle(value) {
  return normalizeTitle(value).split(/\s+/).filter(token => token.length > 1 && !TITLE_STOPWORDS.has(token));
}

function parseSitemapEntries(xml) {
  const entries = [];
  const pattern = /<loc>(https:\/\/cinemacity\.cc\/(movies|tv-series)\/\d+-([a-z0-9-]+)\.html)<\/loc>/gi;
  let match;
  while ((match = pattern.exec(String(xml || ""))) !== null) {
    const [, url, kind, slug] = match;
    const yearMatch = slug.match(/-(\d{4})$/);
    const year = yearMatch ? Number.parseInt(yearMatch[1], 10) : null;
    const title = (yearMatch ? slug.slice(0, -5) : slug).replace(/-/g, " ");
    entries.push({
      url, kind, title,
      normalizedTitle: normalizeTitle(title),
      compactTitle: compactTitle(title),
      tokens: tokenizeTitle(title),
      year: Number.isInteger(year) ? year : null,
    });
  }
  return entries;
}

async function fetchSitemapCatalog() {
  if (sitemapCatalogCache && sitemapCatalogCache.expiresAt > Date.now()) return sitemapCatalogCache.entries;

  const sitemapPath = new URL(SITEMAP_FEED_URL).pathname;
  const buildPageUrl = (page) => `${REVERSE_PROXY_ORIGIN.replace(/\/+$/, "")}${sitemapPath}?page=${page}&perPage=500`;

  const firstPageRes = await fetch(buildPageUrl(1), { headers: DEFAULT_PROXY_HEADERS });
  if (firstPageRes.ok) {
    const totalEntries = parseInt(firstPageRes.headers.get("x-total-entries") || "0", 10);
    let entries = parseSitemapEntries(await firstPageRes.text());

    if (totalEntries > 0) {
      const totalPages = Math.ceil(totalEntries / 500);
      const remainingXml = await Promise.all(
        Array.from({ length: totalPages - 1 }, (_, i) =>
          fetch(buildPageUrl(i + 2), { headers: DEFAULT_PROXY_HEADERS })
            .then(r => r.ok ? r.text() : "")
            .catch(() => "")
        )
      );
      for (const xml of remainingXml) if (xml) entries = entries.concat(parseSitemapEntries(xml));
    } else if (entries.length >= 1800) {
      sitemapCatalogCache = { entries, expiresAt: Date.now() + SITEMAP_CACHE_TTL_MS };
      return entries;
    }

    if (entries.length > 0) {
      sitemapCatalogCache = { entries, expiresAt: Date.now() + SITEMAP_CACHE_TTL_MS };
      return entries;
    }
  }

  const fallbackRes = await fetch(
    `${REVERSE_PROXY_ORIGIN.replace(/\/+$/, "")}${sitemapPath}`,
    { headers: DEFAULT_PROXY_HEADERS }
  );
  if (!fallbackRes.ok) throw new Error(`Sitemap proxy HTTP ${fallbackRes.status}`);
  const entries = parseSitemapEntries(await fallbackRes.text());
  sitemapCatalogCache = { entries, expiresAt: Date.now() + SITEMAP_CACHE_TTL_MS };
  return entries;
}

function scoreCatalogEntry(entry, candidateTitles, releaseYear) {
  let highestScore = 0;
  for (const title of candidateTitles) {
    const normalized = normalizeTitle(title);
    const compact = compactTitle(title);
    if (!normalized || !compact) continue;

    let score = 0;
    if (entry.normalizedTitle === normalized || entry.compactTitle === compact) {
      score = 1000;
    } else if (entry.normalizedTitle.startsWith(normalized) || normalized.startsWith(entry.normalizedTitle)) {
      score = 500;
    } else if (entry.compactTitle.includes(compact) || compact.includes(entry.compactTitle)) {
      score = 420;
    } else {
      const expectedTokens = tokenizeTitle(title);
      if (expectedTokens.length && entry.tokens.length) {
        const entryTokenSet = new Set(entry.tokens);
        const matchedCount = expectedTokens.filter(t => entryTokenSet.has(t)).length;
        const coverageRatio = matchedCount / expectedTokens.length;
        const excessTokens = Math.max(0, entry.tokens.length - expectedTokens.length);
        score = coverageRatio * 300 - excessTokens * 20 - Math.abs(entry.tokens.length - expectedTokens.length) * 2;
      }
    }
    if (releaseYear && entry.year) score += entry.year === releaseYear ? 50 : -Math.abs(entry.year - releaseYear) * 3;
    highestScore = Math.max(highestScore, score);
  }
  return highestScore;
}

async function fetchTmdbMetadata(tmdbId, providerType) {
  try {
    const mediaType = providerType === "movie" ? "movie" : "tv";
    const res = await fetch(
      `${TMDB_API_BASE_URL}/${mediaType}/${tmdbId}?api_key=${TMDB_API_KEY}&language=en-US&append_to_response=external_ids`
    );
    return res.ok ? await res.json() : null;
  } catch (_) { return null; }
}

async function fetchTmdbEpisodeTitle(tmdbId, season, episode) {
  try {
    const res = await fetch(`${TMDB_API_BASE_URL}/tv/${tmdbId}/season/${season}?api_key=${TMDB_API_KEY}`);
    if (!res.ok) return "";
    const data = await res.json();
    return data?.episodes?.find(ep => ep.episode_number === parseInt(episode, 10))?.name ?? "";
  } catch (_) { return ""; }
}

function extractImdbId(html) {
  const matches = String(html || "").match(/\btt\d{5,}\b/gi) || [];
  return matches.find(id => /^tt\d{5,}$/i.test(id))?.toLowerCase() ?? null;
}

async function resolveImdbIdFromPage(candidateUrl, expectedImdbId) {
  const id = String(expectedImdbId || "").trim().toLowerCase();
  if (!/^tt\d{5,}$/.test(id)) return null;
  try {
    return extractImdbId(await fetchViaProxy(candidateUrl));
  } catch (_) { return null; }
}

function buildCdnStreamUrl(fileVal) {
  const publicFilesMarker = "/public_files/";
  const markerIndex = fileVal.indexOf(publicFilesMarker);
  if (markerIndex === -1) return null;
  const cdnBase = fileVal.substring(0, markerIndex + publicFilesMarker.length);
  const rest = fileVal.substring(markerIndex + publicFilesMarker.length);
  const parts = rest.split(",");
  const mp4File = parts.find(p => p.includes("1080p") && p.endsWith(".mp4")) || parts.find(p => p.endsWith(".mp4"));
  if (!mp4File) return null;
  const hasHlsManifest = parts.find(p => p.includes(".m3u8"));
  return cdnBase + rest + (hasHlsManifest ? "" : ".urlset/master.m3u8");
}

function extractAtobStreamSource(html, season, episode) {
  const atobPattern = /atob\s*\(\s*['"]([^"']{20,})['"]\s*\)/gi;
  let match;
  while ((match = atobPattern.exec(html)) !== null) {
    try {
      const decoded = atob(match[1]);
      if (!decoded || decoded.length < 20) continue;
      const fileMatch = decoded.match(/file\s*:\s*'(\[.*?\])'/s);
      if (!fileMatch) continue;
      const parsed = JSON.parse(fileMatch[1]);
      if (!Array.isArray(parsed) || !parsed.length) continue;
      if (parsed[0].folder && Array.isArray(parsed[0].folder)) {
        const seasonObj = parsed[(season || 1) - 1];
        if (seasonObj?.folder) {
          const episodeObj = seasonObj.folder[(episode || 1) - 1];
          if (episodeObj?.file) { const url = buildCdnStreamUrl(episodeObj.file); if (url) return url; }
        }
      }
      if (parsed[0].file?.startsWith("http")) {
        const url = buildCdnStreamUrl(parsed[0].file);
        if (url) return url;
      }
    } catch (_) { }
  }
  return null;
}

function extractMediaLinks(html) {
  const links = [];
  const anchorPattern = /<a\s[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let match;
  while ((match = anchorPattern.exec(html)) !== null) {
    const href = match[1].trim();
    const linkText = match[2].replace(/<[^>]+>/g, "").trim();
    if (!/\.(mp4|m3u8|mkv|avi|mov|webm)([?#].*)?$/i.test(href) || href.length < 10) continue;
    links.push({ url: href, text: linkText.toLowerCase() });
  }
  return links;
}

async function resolveCatalogEntry(tmdbId, providerType, metadata) {
  const imdbId = metadata?.imdb_id ?? metadata?.external_ids?.imdb_id ?? null;
  const candidateTitles = [...new Set(
    [metadata?.title, metadata?.name, metadata?.original_title, metadata?.original_name].filter(Boolean)
  )];
  if (!candidateTitles.length) return null;

  const releaseYear = extractReleaseYear(metadata);
  const contentKind = providerType === "movie" ? "movies" : "tv-series";
  const runtime = typeof metadata?.runtime === "number" && metadata.runtime > 0
    ? metadata.runtime
    : Array.isArray(metadata?.episode_run_time) && metadata.episode_run_time.length
      ? metadata.episode_run_time[0] : null;

  const catalogEntries = await fetchSitemapCatalog();

  let topEntry = null, topScore = -Infinity;
  const qualifiedEntries = [];

  for (const entry of catalogEntries) {
    if (entry.kind !== contentKind) continue;
    const score = scoreCatalogEntry(entry, candidateTitles, releaseYear);
    if (score >= 250) qualifiedEntries.push({ entry, score });
    if (score > topScore) { topScore = score; topEntry = entry; }
  }

  if (!topEntry || topScore < 250) return null;

  if (imdbId) {
    qualifiedEntries.sort((a, b) => b.score - a.score);
    for (const { entry } of qualifiedEntries.slice(0, 3)) {
      const resolvedId = await resolveImdbIdFromPage(entry.url, imdbId);
      if (resolvedId === imdbId) return { url: entry.url, title: candidateTitles[0] || entry.title, year: releaseYear ?? entry.year, runtime };
      if (resolvedId && resolvedId !== imdbId) continue;
    }
    if (topScore < 950) return null;
  }

  return { url: topEntry.url, title: candidateTitles[0] || topEntry.title, year: releaseYear ?? topEntry.year, runtime };
}

async function getStreams(tmdbId, mediaType, season, episode) {
  try {
    const providerType = mediaType === "tv" ? "tv" : "movie";
    if (providerType === "tv" && (season == null || episode == null)) return [];

    const [metadata] = await Promise.all([
      fetchTmdbMetadata(tmdbId, providerType),
      fetchSitemapCatalog().catch(() => null),
    ]);
    if (!metadata) return [];

    const catalogMatch = await resolveCatalogEntry(tmdbId, providerType, metadata);
    if (!catalogMatch?.url) return [];

    const cleanTitle = (catalogMatch.title || "").replace(/\s*\(.*?\)\s*/g, "").trim();

    const [pageHtml, episodeTitle] = await Promise.all([
      fetchViaProxy(catalogMatch.url).catch(() => null),
      providerType === "tv" ? fetchTmdbEpisodeTitle(tmdbId, season, episode) : Promise.resolve(""),
    ]);

    if (!pageHtml || pageHtml.length < 500 || pageHtml.includes("Just a moment") ||
      (pageHtml.includes("admin") && pageHtml.includes("Unlimited"))) return [];

    const mediaLinks = extractMediaLinks(pageHtml);

    if (!mediaLinks.length) {
      const streamUrl = extractAtobStreamSource(
        pageHtml,
        providerType === "tv" ? season : null,
        providerType === "tv" ? episode : null
      );
      if (streamUrl) mediaLinks.push({ url: streamUrl, text: "" });
    }

    if (!mediaLinks.length) return [];

    const chosenUrl = mediaLinks.find(l => !/eng|sub/.test(l.text))?.url ?? mediaLinks[0].url;

    const resolvedStreamUrl = resolveAbsoluteUrl(catalogMatch.url, chosenUrl);
    const streamMediaMeta = {
      title: cleanTitle,
      year: catalogMatch.year,
      mediaType: providerType,
      season: providerType === "tv" ? season : null,
      episode: providerType === "tv" ? episode : null,
      episodeTitle,
      runtime: catalogMatch.runtime,
    };

    return [buildStreamDescriptor(
      {
        name: "CinemaCity",
        title: cleanTitle,
        url: resolvedStreamUrl,
        quality: "1080p",
        behaviorHints: { notWebReady: true },
        headers: { "Referer": `${CINEMACITY_BASE_URL}/`, "User-Agent": DEFAULT_USER_AGENT },
      },
      "CinemaCity",
      streamMediaMeta
    )];
  } catch (_) { return []; }
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
  var PROVIDER_ID = "cinemacity";
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
