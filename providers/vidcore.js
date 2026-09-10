/**
 * vidcore - Built from src/vidcore/ (run bun build.js to regenerate)
 */
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};

// src/_shared/constants.js
var TMDB_API_KEY = "1865f43a0549ca50d341dd9ab8b29f49";
var TMDB_BASE_URL = "https://api.themoviedb.org/3";
var MULTI_DECRYPT_API = "https://enc-dec.app/api";
var VIDCORE_API = "https://vidcore.io";
var UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

// src/_shared/tmdb.js
var metaCache = {};
function fetchTmdbMeta(tmdbId, mediaType) {
  return __async(this, null, function* () {
    const type = mediaType === "tv" ? "tv" : "movie";
    const cacheKey = type + ":" + tmdbId;
    if (metaCache[cacheKey])
      return metaCache[cacheKey];
    const url = TMDB_BASE_URL + "/" + type + "/" + tmdbId + "?api_key=" + TMDB_API_KEY + "&append_to_response=external_ids";
    try {
      const res = yield fetch(url, {
        headers: { "User-Agent": UA, Accept: "application/json" }
      });
      if (!res.ok)
        throw new Error("TMDB HTTP " + res.status);
      const data = yield res.json();
      const title = type === "movie" ? data.title || data.original_title || "" : data.name || data.original_name || "";
      const originalTitle = data.original_title || data.original_name || title;
      const date = data.release_date || data.first_air_date || "";
      const imdbId = data.external_ids && data.external_ids.imdb_id || null;
      const meta = {
        title,
        originalTitle,
        year: date ? parseInt(String(date).substring(0, 4), 10) || null : null,
        imdbId,
        tmdbId: parseInt(tmdbId, 10) || null,
        countries: (data.production_countries || []).map(function(c) {
          return c && (c.name || c.iso_3166_1);
        }).filter(Boolean)
      };
      metaCache[cacheKey] = meta;
      return meta;
    } catch (e) {
      console.log("[Streamline][tmdb] " + e.message);
      return { title: "", originalTitle: "", year: null, imdbId: null, tmdbId: null, countries: [] };
    }
  });
}
function buildCtx(tmdbId, mediaType, season, episode) {
  return __async(this, null, function* () {
    const isTv = mediaType === "tv";
    const meta = yield fetchTmdbMeta(String(tmdbId), mediaType);
    const countries = meta.countries || [];
    return {
      tmdbId: meta.tmdbId || parseInt(tmdbId, 10) || null,
      imdbId: meta.imdbId,
      title: meta.title,
      originalTitle: meta.originalTitle,
      year: meta.year,
      season: season != null ? season : 1,
      episode: episode != null ? episode : 1,
      isTv,
      isBollywood: countries.some(function(c) {
        return /india|\bIN\b/i.test(String(c));
      })
    };
  });
}

// src/_shared/utils.js
function defaultHeaders(extra) {
  return Object.assign({ "User-Agent": UA, "Accept": "*/*" }, extra || {});
}
function hasTimers() {
  try {
    return typeof setTimeout === "function" && typeof clearTimeout === "function";
  } catch (e) {
    return false;
  }
}
function fetchWithTimeout(url, options, timeoutMs) {
  return __async(this, null, function* () {
    if (!hasTimers()) {
      return fetch(url, options || {});
    }
    const timeout = timeoutMs || 2e4;
    let timer = null;
    try {
      const fetchPromise = fetch(url, options || {});
      const timeoutPromise = new Promise(function(_, reject) {
        timer = setTimeout(function() {
          reject(new Error("timeout after " + timeout + "ms: " + url));
        }, timeout);
      });
      const res = yield Promise.race([fetchPromise, timeoutPromise]);
      if (timer)
        clearTimeout(timer);
      return res;
    } catch (e) {
      if (timer)
        clearTimeout(timer);
      throw e;
    }
  });
}
function fetchText(url, headers, timeoutMs) {
  return __async(this, null, function* () {
    const res = yield fetchWithTimeout(url, { headers: defaultHeaders(headers) }, timeoutMs);
    if (!res.ok)
      throw new Error("HTTP " + res.status + " for " + url);
    return yield res.text();
  });
}
function postJson(url, body, headers, timeoutMs) {
  return __async(this, null, function* () {
    const res = yield fetchWithTimeout(
      url,
      {
        method: "POST",
        headers: defaultHeaders(
          Object.assign({ "Content-Type": "application/json", Accept: "application/json" }, headers || {})
        ),
        body: typeof body === "string" ? body : JSON.stringify(body == null ? {} : body)
      },
      timeoutMs
    );
    if (!res.ok)
      throw new Error("HTTP " + res.status + " for " + url);
    const text = yield res.text();
    try {
      return JSON.parse(text);
    } catch (e) {
      return text;
    }
  });
}
function parseQuality(raw) {
  if (raw == null)
    return "Auto";
  const s = String(raw).toLowerCase().replace(/4khdhub|uhdmovies|vegamovies|moviesmod|moviesdrive|bollyflix|hubcloud|vcloud|pixeldrain|gofile/g, " ");
  const m = s.match(/(\d{3,4})\s*p/i);
  if (m) {
    const n = parseInt(m[1], 10);
    if (n >= 4e3)
      return "8K";
    if (n >= 1e3)
      return "1080p";
    if (n >= 700)
      return "720p";
    if (n >= 400)
      return "480p";
    if (n > 0)
      return "360p";
  }
  if (/\b8k\b/.test(s))
    return "8K";
  if (/2160|4k|uhd/.test(s))
    return "4K";
  if (/org/.test(s))
    return "4K";
  if (/cam|ts|telesync|telecine|hdcam/.test(s))
    return "CAM";
  if (/hd/.test(s))
    return "720p";
  return "Auto";
}
function makeStream(source, title, url, quality, headers, subtitles, extra) {
  if (!url)
    return null;
  const u = String(url);
  if (u.indexOf("http") !== 0 && u.indexOf("magnet:?") !== 0)
    return null;
  const stream = {
    name: source,
    title: title || source,
    url: u,
    quality: quality || parseQuality(title),
    headers: headers || {},
    subtitles: subtitles || []
  };
  if (extra) {
    Object.keys(extra).forEach(function(k) {
      if (extra[k] !== void 0 && extra[k] !== null && extra[k] !== "")
        stream[k] = extra[k];
    });
  }
  return stream;
}
function withTimeout(promise, ms, label) {
  if (!hasTimers())
    return promise;
  const timeout = ms || 25e3;
  return Promise.race([
    promise,
    new Promise(function(resolve) {
      setTimeout(function() {
        console.log("[Streamline] timeout: " + label);
        resolve([]);
      }, timeout);
    })
  ]);
}
function dedupe(streams) {
  const seen = {};
  const out = [];
  (streams || []).forEach(function(s) {
    if (!s || !s.url || seen[s.url])
      return;
    seen[s.url] = true;
    out.push(s);
  });
  return out;
}

// src/_shared/meta.js
function qualityEmoji(quality) {
  const q = String(quality || "");
  if (/4K|2160/i.test(q))
    return "\u{1F525}";
  if (/1080/i.test(q))
    return "\u{1F48E}";
  if (/720/i.test(q))
    return "\u26A1";
  if (/480/i.test(q))
    return "\u{1F4F1}";
  if (/CAM|TS|TC/i.test(q))
    return "\u{1F3A5}";
  return "\u{1F3AC}";
}
function qualityRank(quality) {
  const q = String(quality || "").toLowerCase();
  if (/8k|4320/.test(q))
    return 5;
  if (/4k|2160/.test(q))
    return 4;
  if (/1080|fhd/.test(q))
    return 3;
  if (/720|hd/.test(q))
    return 2;
  if (/480|sd/.test(q))
    return 1;
  return 0;
}
function firstMatch(text, re) {
  const m = String(text || "").match(re);
  return m ? m[0] : null;
}
var SITE_TAGS = /4khdhub|uhdmovies|vegamovies|moviesmod|moviesdrive|bollyflix|rogmovies|topmovies|hubcloud|vcloud|hubdrive|pixeldrain|gofile|driveleech|driveseed|fastdlserver|linksmod|moviemod|hdhub4u|movies4u|dudefilms|mlsbd|multimovies|skymovies|rtally|toonstream/gi;
function parseMeta(raw) {
  const cleaned = String(raw || "").replace(SITE_TAGS, " ");
  const noUrl = cleaned.replace(/https?:\/\/\S+/g, " ");
  const text = cleaned;
  const meta = {
    quality: "Auto",
    rank: 0,
    size: "",
    sizeMB: 0,
    hdr: "",
    codec: "",
    dv: false,
    audio: "",
    atmos: false,
    lang: "",
    source: "",
    container: ""
  };
  const qm = text.match(/(\d{3,4})\s*p/i);
  if (qm) {
    const n = parseInt(qm[1], 10);
    meta.quality = n >= 2e3 ? n >= 4e3 ? "8K" : "4K" : n >= 1e3 ? "1080p" : n >= 700 ? "720p" : n >= 400 ? "480p" : "360p";
    if (n >= 8e3)
      meta.quality = "8K";
  } else if (/\b8k\b/i.test(text))
    meta.quality = "8K";
  else if (/2160|4k|uhd/i.test(text))
    meta.quality = "4K";
  else if (/cam|hdcam|telesync|telecine|\bts\b|\btc\b|scr|dvdscr/i.test(text))
    meta.quality = "CAM";
  else if (/\bhd\b/i.test(text))
    meta.quality = "720p";
  meta.rank = qualityRank(meta.quality);
  let sm = noUrl.match(/(\d+(?:\.\d+)?)\s*(GB|MB)/i) || text.match(/(\d+(?:\.\d+)?)\s*(GB|MB)/i);
  if (sm) {
    meta.size = parseFloat(sm[1]).toFixed(sm[2].toUpperCase() === "GB" && sm[1].indexOf(".") === -1 ? 0 : 2).replace(/\.00$/, "") + " " + sm[2].toUpperCase();
    meta.sizeMB = Math.round(parseFloat(sm[1]) * (sm[2].toUpperCase() === "GB" ? 1024 : 1));
  }
  if (/\bdolby[\s-]*vision\b|dovi/i.test(text) || /[.\-_]dv[.\-_]/i.test(text)) {
    meta.dv = true;
    meta.hdr = "DV";
  } else if (/hdr10\+/i.test(text))
    meta.hdr = "HDR10+";
  else if (/hdr10/i.test(text))
    meta.hdr = "HDR10";
  else if (/\bhlg\b/i.test(text))
    meta.hdr = "HLG";
  else if (/\bhdr\b/i.test(text))
    meta.hdr = "HDR";
  else if (/\bsdr\b/i.test(text))
    meta.hdr = "SDR";
  if (/\bav1\b/i.test(text))
    meta.codec = "AV1";
  else if (/\b(h\.?265|x265|hevc)\b/i.test(text))
    meta.codec = "H.265";
  else if (/\b(h\.?264|x264|avc)\b/i.test(text))
    meta.codec = "H.264";
  else if (/\bvp9\b/i.test(text))
    meta.codec = "VP9";
  else if (/\bxvid\b/i.test(text))
    meta.codec = "XviD";
  else if (/\bdivx\b/i.test(text))
    meta.codec = "DivX";
  if (/truehd[\s.]*7\.1|truehd.*atmos/i.test(text))
    meta.audio = "TrueHD 7.1";
  else if (/atmos/i.test(text))
    meta.atmos = true;
  if (!meta.audio) {
    if (/\bddp[\s.]*5\.1\b|eac3|dd\+[\s.]*5\.1/i.test(text))
      meta.audio = "DDP5.1";
    else if (/\bdd5\.1\b|ac3[\s.]*5\.1|dolby[\s.]*digital[\s.]*5\.1/i.test(text))
      meta.audio = "DD5.1";
    else if (/\bac3\b|dolby[\s.]*digital/i.test(text))
      meta.audio = "DD";
    else if (/dts[\s-]*hd[\s.]*ma|dts[\s.]*x/i.test(text))
      meta.audio = "DTS-HD MA";
    else if (/\bdts\b/i.test(text))
      meta.audio = "DTS";
    else if (/\b7\.1\b/i.test(text))
      meta.audio = "7.1";
    else if (/\b5\.1\b/i.test(text))
      meta.audio = "5.1";
    else if (/\baac\b/i.test(text))
      meta.audio = "AAC";
    else if (/\bopus\b/i.test(text))
      meta.audio = "Opus";
    else if (/\bmp3\b/i.test(text))
      meta.audio = "MP3";
  }
  if (/atmos/i.test(text))
    meta.atmos = true;
  const langs = [];
  function has() {
    for (let i = 0; i < arguments.length; i++) {
      if (new RegExp("\\b" + arguments[i] + "\\b", "i").test(text))
        return true;
    }
    return false;
  }
  if (/multi[\s._-]*audio/i.test(text))
    langs.push("Multi-Audio");
  else if (/dual[\s._-]*audio/i.test(text))
    langs.push("Dual-Audio");
  if (/\btagalog\b|\bfilipino\b|\btl\b/i.test(text))
    langs.push("Tagalog");
  if (has("english", "eng"))
    langs.push("English");
  if (/esub/i.test(text))
    langs.push("ESub");
  meta.lang = langs.slice(0, 3).join(" + ");
  if (/remux/i.test(text))
    meta.source = "REMUX";
  else if (/bluray|blu[\s._-]*ray|brrip|bdrip/i.test(text))
    meta.source = "BluRay";
  else if (/web[\s._-]*dl/i.test(text))
    meta.source = "WEB-DL";
  else if (/webrip|web[\s._-]*rip/i.test(text))
    meta.source = "WEBRip";
  else if (/hdrip/i.test(text))
    meta.source = "HDRip";
  else if (/hdtv/i.test(text))
    meta.source = "HDTV";
  else if (/pdtv|sdtv|tvrip/i.test(text))
    meta.source = "TVRip";
  else if (/dvdrip|dvdscr/i.test(text))
    meta.source = "DVDRip";
  else if (/\bdvd\b/i.test(text))
    meta.source = "DVD";
  else if (/cam|hdcam|telesync|telecine|\bts\b|\btc\b|\bscr\b/i.test(text))
    meta.source = "CAM";
  if (/\.m3u8/i.test(text) || firstMatch(text, /hls/i))
    meta.container = "HLS";
  else if (/\.mpd/i.test(text) || /\bdash\b/i.test(text))
    meta.container = "DASH";
  else if (/\.mp4/i.test(text))
    meta.container = "MP4";
  else if (/\.mkv/i.test(text))
    meta.container = "MKV";
  return meta;
}
function headline(title, year, seasonEp) {
  const t = String(title || "Unknown").trim();
  if (seasonEp)
    return "\u{1F3AC} " + t + " - (" + seasonEp + ")";
  if (year)
    return "\u{1F3AC} " + t + " (" + year + ")";
  return "\u{1F3AC} " + t;
}
function seasonEpCode(season, episode) {
  if (season == null || episode == null)
    return "";
  return "S" + String(season).padStart(2, "0") + "E" + String(episode).padStart(2, "0");
}
function richTitle(provider, line1, meta, container) {
  const lines = [line1];
  const l2 = qualityEmoji(meta.quality) + " " + meta.quality + (meta.size ? " \u2022 " + meta.size : "") + " | \u{1F4FC} " + (container || meta.container || "VIDEO");
  lines.push(l2);
  const l3parts = [];
  if (meta.hdr)
    l3parts.push("\u{1F308} " + meta.hdr);
  if (meta.codec)
    l3parts.push("\u{1F39E} " + meta.codec);
  if (meta.dv && meta.hdr !== "DV")
    l3parts.push("\u{1F441}\uFE0F DV");
  if (l3parts.length)
    lines.push(l3parts.join(" \u2022 "));
  const l4parts = [];
  if (meta.lang)
    l4parts.push("\u{1F30D} " + meta.lang);
  if (meta.audio || meta.atmos) {
    l4parts.push("\u{1F3A7} " + (meta.audio || "Audio") + (meta.atmos ? " +Atmos" : ""));
  }
  if (l4parts.length)
    lines.push(l4parts.join(" | "));
  if (meta.source)
    lines.push("\u{1F4BF} " + meta.source);
  return { text: lines.join("\n"), providerTag: provider + " | " + meta.quality };
}
function richName(provider, meta) {
  const bits = [meta.quality];
  if (meta.audio)
    bits.push(meta.audio + (meta.atmos ? "+Atmos" : ""));
  else if (meta.lang)
    bits.push(meta.lang);
  return provider + " | " + bits.join(" \u2022 ");
}
function enrichStream(stream, raw, line1) {
  if (!stream || stream._rich)
    return stream;
  const meta = parseMeta((raw || "") + " " + (stream.url || ""));
  const rt = richTitle(stream.name, line1 || stream.title, meta);
  const copy = Object.assign({}, stream);
  copy.name = richName(stream.name, meta);
  copy.title = rt.text;
  copy.quality = meta.quality === "Auto" ? stream.quality || "Auto" : meta.quality;
  if (meta.size)
    copy.size = meta.size;
  if (meta.lang && !copy.language)
    copy.language = meta.lang.split(" + ")[0];
  copy._rank = meta.rank;
  copy._sizeMB = meta.sizeMB;
  copy._rich = true;
  return copy;
}
function presentStreams(streams, ctx) {
  const line1 = ctx && (ctx.title || ctx.originalTitle) ? headline(
    ctx.originalTitle || ctx.title,
    ctx.isTv ? null : ctx.year,
    ctx.isTv ? seasonEpCode(ctx.season, ctx.episode) : ""
  ) : null;
  const enriched = (streams || []).map(function(s) {
    if (!s || s._rich)
      return s;
    return enrichStream(s, (s.title || "") + " " + (s.quality || ""), line1 || s.title);
  });
  enriched.sort(function(a, b) {
    const r = (b._rank || 0) - (a._rank || 0);
    if (r !== 0)
      return r;
    return (b._sizeMB || 0) - (a._sizeMB || 0);
  });
  return enriched.map(function(s) {
    if (!s)
      return s;
    const copy = Object.assign({}, s);
    delete copy._rank;
    delete copy._sizeMB;
    delete copy._rich;
    return copy;
  });
}

// src/_shared/sources/vidfast.js
function enabled(key) {
  try {
    const s = globalThis.SCRAPER_SETTINGS || {};
    return s[key] !== false;
  } catch (e) {
    return true;
  }
}
function extractToken(page) {
  const m = String(page || "").match(/\\"(?:en|token)\\":\\"(.*?)\\"/);
  return m ? m[1] : null;
}
function scrapeVidcore(ctx) {
  return __async(this, null, function* () {
    if (!enabled("vidcore"))
      return [];
    if (!ctx.tmdbId)
      return [];
    try {
      const extra = { Referer: VIDCORE_API + "/", "X-Requested-With": "XMLHttpRequest", "User-Agent": UA };
      const pageUrl = !ctx.isTv ? VIDCORE_API + "/movie/" + ctx.tmdbId : VIDCORE_API + "/tv/" + ctx.tmdbId + "/" + ctx.season + "/" + ctx.episode;
      const page = yield fetchText(pageUrl, extra, 2e4);
      const tokenText = extractToken(page);
      if (!tokenText)
        return [];
      const initJson = JSON.parse(
        yield fetchText(
          MULTI_DECRYPT_API + "/enc-vidcore?text=" + encodeURIComponent(tokenText),
          {},
          15e3
        )
      );
      const init = initJson && initJson.result || {};
      if (!init.servers || !init.stream)
        return [];
      const headers = Object.assign({}, extra);
      if (init.token)
        headers["X-CSRF-Token"] = init.token;
      const serversEnc = yield function() {
        return __async(this, null, function* () {
          const res = yield fetch(init.servers, { method: "POST", headers });
          return yield res.text();
        });
      }();
      const serversJson = yield postJson(MULTI_DECRYPT_API + "/dec-vidcore", { text: serversEnc }, {}, 15e3);
      const servers = serversJson && serversJson.result || [];
      const out = [];
      for (const server of servers) {
        try {
          const streamRes = yield fetch(init.stream + "/" + server.data, { method: "POST", headers });
          const streamEnc = yield streamRes.text();
          const streamJson = yield postJson(MULTI_DECRYPT_API + "/dec-vidcore", { text: streamEnc }, {}, 15e3);
          const data = streamJson && streamJson.result || {};
          if (!data.url)
            continue;
          const subs = (data.tracks || []).filter(function(t) {
            return t && t.file;
          }).map(function(t) {
            return {
              url: t.file,
              language: t.label || "en",
              name: (t.label || "Subtitle") + " [Vidcore]"
            };
          });
          const s = makeStream(
            "Vidcore",
            "Vidcore - " + (server.name || "server"),
            data.url,
            "Auto",
            { Referer: VIDCORE_API + "/" },
            subs.slice(0, 8)
          );
          if (s)
            out.push(s);
        } catch (e) {
          continue;
        }
      }
      return out;
    } catch (e) {
      console.log("[Streamline][vidcore] " + e.message);
      return [];
    }
  });
}

// src/vidcore/index.js
function getStreams(tmdbId, mediaType, season, episode) {
  return __async(this, null, function* () {
    try {
      const ctx = yield buildCtx(tmdbId, mediaType, season, episode);
      const out = yield withTimeout(scrapeVidcore(ctx), 2e4, "vidcore");
      return presentStreams(dedupe(out), ctx);
    } catch (e) {
      console.log("[Streamline][vidcore] " + (e && e.message));
      return [];
    }
  });
}
module.exports = { getStreams };

/* ===== nvio post-filter v1.0 (auto-injected) ============================
   Rules (per user request 2026-09):
   1. Language gate: only English / Tagalog (Filipino) audio lanes are kept.
      Streams explicitly tagged with another audio language (hindi, tamil,
      spanish, arabic, korean, ...) are dropped unless an allowed language
      is also present (dual/multi audio) or no language is tagged at all.
      Subtitle-only tokens (ESub, HindiSub, ...) are ignored by the gate.
   2. Quality gate: unknown/"Auto" resolutions are probed from the HLS
      master playlist; everything below 720p, CAM/telesync, and still-
      unknown rows are dropped. Survivors are labeled 720p/1080p/1440p/4K.
   3. Dedupe: exact URL, then normalized URL (query stripped, torrent
      info-hash), then identical name+quality rows. A short-TTL global
      registry also removes the same URL reported by two different
      providers (cross-provider duplicates).
   Opt-out: set SCRAPER_SETTINGS.postFilter = false.
======================================================================== */
(function () {
  var PROVIDER = "vidcore";
  var G = typeof globalThis !== "undefined" ? globalThis : typeof global !== "undefined" ? global : this;
  function settings() {
    try { return (G && G.SCRAPER_SETTINGS) || {}; } catch (e) { return {}; }
  }
  function hasTimers() { return typeof setTimeout === "function" && typeof clearTimeout === "function"; }

  /* ---------- quality ---------- */
  function normQ(q) {
    var s = String(q == null ? "" : q).toLowerCase();
    if (!s) return "";
    if (/8k/.test(s)) return "4K";
    if (/2160|4k|uhd/.test(s)) return "4K";
    if (/1440/.test(s)) return "1440p";
    if (/1080|fhd/.test(s)) return "1080p";
    if (/720/.test(s)) return "720p";
    if (/480|360|240|\bsd\b/.test(s)) return "CAM";
    if (/cam|telesync|telecine|\bts\b|\btc\b|screener|dvdscr/.test(s)) return "CAM";
    return "";
  }
  function qFromText(text) {
    var s = String(text || "");
    var m = s.match(/(\d{3,4})\s*p/i);
    if (m) {
      var n = parseInt(m[1], 10);
      if (n >= 2100) return "4K";
      if (n >= 1300) return "1440p";
      if (n >= 1000) return "1080p";
      if (n >= 640) return "720p";
      return "CAM";
    }
    if (/\b8k\b/i.test(s) || /2160|4k|uhd/i.test(s)) return "4K";
    if (/1440p/i.test(s)) return "1440p";
    if (/cam|telesync|telecine|\bts\b|\btc\b|screener|dvdscr/i.test(s)) return "CAM";
    if (/480p|360p|240p|\bsd\b|\bdvdrip\b/i.test(s)) return "CAM";
    if (/\bhd\b/i.test(s)) return "720p";
    return "";
  }
  var qualCache = G.__NV_QUAL_CACHE__ || (G.__NV_QUAL_CACHE__ = {});
  function probeM3u8(url, headers) {
    var now = Date.now();
    var c = qualCache[url];
    if (c && now - c.t < (c.q ? 15 * 60 * 1000 : 3 * 60 * 1000)) {
      return Promise.resolve(c.q);
    }
    var opts = { headers: Object.assign({}, headers || {}) };
    var p = fetch(url, opts).then(function (r) {
      return r.ok ? r.text() : "";
    }).then(function (t) {
      var q = "";
      if (t && t.indexOf("#EXTM3U") !== -1) {
        var best = 0, re = /RESOLUTION=(\d+)x(\d+)/gi, m;
        while ((m = re.exec(t)) !== null) {
          var h = parseInt(m[2], 10);
          if (h > best) best = h;
        }
        if (best >= 2100) q = "4K";
        else if (best >= 1300) q = "1440p";
        else if (best >= 1000) q = "1080p";
        else if (best >= 640) q = "720p";
        else if (best > 0) q = "CAM";
      }
      qualCache[url] = { t: now, q: q };
      return q;
    }).catch(function () { qualCache[url] = { t: now, q: "" }; return ""; });
    if (hasTimers()) {
      p = Promise.race([p, new Promise(function (res) {
        var timer = setTimeout(function () { res(""); }, 6000);
        if (typeof timer === "object" && typeof timer.unref === "function") timer.unref();
      })]);
    }
    return p;
  }

  /* ---------- language gate ---------- */
  var BLOCK_RE = new RegExp(
    "\\b(hindi|hin|tamil|telugu|malayalam|mallu|kannada|bengali|bangla|punjabi|marathi|bhojpuri|gujarati|" +
    "odia|assamese|nepali|urdu|sinhala|arabic|ara|farsi|persian|turkish|turkce|espanol|spanish|latino|" +
    "castellano|french|vostfr|german|deutsch|russian|korean|kor|japanese|jpn|chinese|mandarin|cantonese|" +
    "thai|vietnamese|indonesian|bahasa|portuguese|brasileiro|italian|polish|ukrainian|hebrew|" +
    "hungarian|romanian|dutch|flemish|greek|czech|swedish|danish|norwegian|finnish|org)\\b", "i");
  var ALLOW_RE = /\b(english|eng|tagalog|filipino)\b/i;
  var SUB_RE = /\b[a-z0-9]{0,12}subs?\b/gi;
  // NOTE: gate runs on the stream TITLE only (release names / labels).
  // Provider names (e.g. "MallumV") must not trigger the language gate.
  function langAllowed(titleText) {
    var t = String(titleText || "").replace(SUB_RE, " ");
    if (BLOCK_RE.test(t)) return ALLOW_RE.test(t);
    return true;
  }

  /* ---------- dedupe ---------- */
  function normUrl(u) {
    var s = String(u || "");
    if (/^magnet:/i.test(s)) {
      var m = s.match(/btih:([a-z0-9]+)/i);
      return "m:" + (m ? m[1].toLowerCase() : s.slice(0, 80));
    }
    return s.replace(/[#?].*$/, "").replace(/\/+$/, "");
  }
  var SEEN = G.__NV_SEEN_URLS__ || (G.__NV_SEEN_URLS__ = {});
  // SEEN[nu] = { exp: <ts>, owner: <provider> }
  // - same URL from a DIFFERENT provider within TTL -> dropped (cross-provider dup)
  // - same provider re-querying its own URL -> allowed (repeat opens must still
  //   return rows) and its claim is refreshed
  function claim(nu, now, owner) {
    if (!nu) return true;
    var e = SEEN[nu];
    if (e && e.exp > now && e.owner !== owner) return false;
    SEEN[nu] = { exp: now + 120000, owner: owner };
    return true;
  }

  /* ---------- main ---------- */
  function rank(q) {
    if (q === "4K") return 4;
    if (q === "1440p") return 3.5;
    if (q === "1080p") return 3;
    if (q === "720p") return 2;
    return 0;
  }
  function postProcess(list) {
    var now = Date.now();
    var kept = [];
    var probes = [];
    var rows = [];
    (list || []).forEach(function (s, i) {
      if (!s || !s.url) return;
      if (!langAllowed(s.title)) return;
      var text = (s.name || "") + " " + (s.title || "");
      var isMagnet = /^magnet:/i.test(String(s.url));
      var q = normQ(s.quality) || normQ(String(s.title || "").split("\n")[0]) || qFromText(text);
      var isHlsLike = /m3u8/i.test(String(s.url)) ||
        (!/\.(mp4|mkv|avi|mov|webm|ts|flv|m4v|mp3|aac)(\?|$)/i.test(String(s.url.split("?")[0])) && /^https?:/i.test(String(s.url)));
      if (!q && !isMagnet && isHlsLike) {
        rows.push({ s: s, i: i });
        probes.push(probeM3u8(String(s.url), s.headers));
      } else {
        rows.push({ s: s, i: i });
        probes.push(Promise.resolve(q));
      }
    });
    return Promise.all(probes).then(function (qs) {
      var ranked = [];
      rows.forEach(function (row, k) {
        var q = qs[k];
        if (!q) return; // unknown resolution -> removed
        if (q === "CAM") return; // cam / sd / sub-720 -> removed
        row.s.quality = q;
        ranked.push({ s: row.s, i: row.i, q: q });
      });
      // best first so dedupe keeps the strongest duplicate (stable)
      ranked.sort(function (a, b) {
        var r = rank(b.q) - rank(a.q);
        if (r !== 0) return r;
        return a.i - b.i;
      });
      var seenLocal = {}, out = [];
      ranked.forEach(function (row) {
        var s = row.s;
        var nu = normUrl(s.url);
        if (seenLocal[nu]) return;
        if (!claim(nu, now, PROVIDER)) return; // already reported by a different provider
        seenLocal[nu] = 1;
        out.push(s);
      });
      return out.slice(0, 40);
    }).catch(function () { return (list || []).slice(0, 40); });
  }

  var __orig = null;
  try { __orig = module.exports && module.exports.getStreams; } catch (e) { __orig = null; }
  if (typeof __orig === "function") {
    module.exports.getStreams = function () {
      var args = Array.prototype.slice.call(arguments), self = this;
      function finish(v) {
        if (settings().postFilter === false) return v;
        try { return postProcess(Array.isArray(v) ? v : []); }
        catch (e) { return Array.isArray(v) ? v : []; }
      }
      try {
        var r = __orig.apply(self, args);
        if (r && typeof r.then === "function") {
          return r.then(function (v) { return finish(v); }, function () { return []; });
        }
        return finish(r);
      } catch (e) { return Promise.resolve([]); }
    };
  }
})();
