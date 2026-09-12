/**
 * cinejoy - Built from src/cinejoy/ (run bun build.js to regenerate)
 *
 * v1.6.0 (full-chain worker lane, 2026-09-12):
 *  User report: "netmirror and cinejoy still no stream showing" on 4.18.0.
 *  Re-verified live: the whole chain (servers -> enc -> binary /g -> dec) is
 *  healthy from Node and the returned HLS master plays (4K/1080p/720p), so
 *  the remaining failure mode on Mobile is DEPLOYMENT: v1.5.0's /cjg relay
 *  lane needs BOTH the worker redeploy AND the "Cinejoy relay base URL"
 *  setting, and any missed step means zero rows. v1.6.0 adds a second,
 *  stronger worker lane and a top-level lane memo:
 *    chain lane (unchanged): enc-cinejoy GET -> /g bytes via direct|relay ->
 *                            dec-cinejoy POST. Needs enc-dec.app reachable
 *                            from the device.
 *    NEW full lane:          ONE text POST {cjRelay}/cjs with the query
 *                            {title,type,year,imdb,tmdb,server,season,episode};
 *                            the asian-catalog worker v5.7.0+ runs the ENTIRE
 *                            chain server-side (enc -> /g -> dec included) and
 *                            returns final stream JSON. Nothing binary on the
 *                            wire, no enc-dec.app dependency on the device.
 *  scrapeServer now falls back chain -> full per server and memoizes the
 *  winner in __CINEJOY_TOP_LANE__ so Mobile skips the doomed chain attempts
 *  after the first server. TV/PC keep the direct chain with zero config.
 *
 * v1.5.0 (relay lane for NuvioMobile, 2026-09-12):
 *  User report: "cinejoy never works at all, doesn't give stream". Root cause
 *  is the TRANSPORT, not the chain (re-verified live: servers -> enc-cinejoy
 *  -> binary POST api.shegu.st/g -> dec-cinejoy all healthy; plain query
 *  returns only a {"status":"ok"} ACK, and /g 404s every text/base64 body).
 *  NuvioMobile's plugin bridge is string-only: request bodies go through
 *  toString()/UTF-8 ("[object Uint8Array]" or corrupted bytes >127) and the
 *  response has no arrayBuffer, so BOTH binary legs die there. v1.5.0 adds a
 *  text-safe relay lane and a lane memo:
 *    1. direct binary /g  - Node / Cloudflare / NuvioTVSmart (shim base64) [unchanged]
 *    2. direct latin-1 string /g - legacy string-only runtimes (unchanged)
 *    3. NEW relay lane - POST {cjRelay}/cjg with the token as base64url TEXT;
 *       the asian-catalog CF worker (v5.6.0+, /cjg route) decodes it, POSTs
 *       the real octet-stream bytes to shegu, and returns the response bytes
 *       as base64url text. Survives the string bridge on Mobile.
 *  The first server request tries direct first and memoizes the winning lane
 *  in __CINEJOY_G_LANE__, so Mobile never repeats its two doomed direct
 *  attempts per server. Configure the worker base in the provider settings
 *  ("Cinejoy relay base URL"); without it, Mobile stays empty by design.
 *
 * v1.4.0 (device binary transport):
 *  The enc-cinejoy -> POST /g -> dec-cinejoy chain is BINARY on both legs
 *  (verified live: api.shegu.st/g accepts ONLY raw octet-stream bodies -
 *  every base64/text/JSON/form/hex variant 404s - and replies octet-stream).
 *  Runtimes therefore need real byte fidelity:
 *   - Node/CF/tests: Uint8Array body + arrayBuffer() response (native).
 *   - NuvioTVSmart (webOS/Tizen): the plugin worker shim base64-encodes
 *     typed-array bodies and the plugin network service decodes them at the
 *     socket (x-nuvio-body-encoding: base64 protocol); binary responses come
 *     back base64-marked and the shim's arrayBuffer()/text() restore exact
 *     bytes. This provider needs no TV-specific code for that path.
 *   - NuvioMobile: the bridge stringifies bodies (no binary support), the
 *     /g request cannot succeed, and the per-server try/catch fail-softs to
 *     zero results - v1.5.0's relay lane is the fix for that runtime.
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
var CINEJOY_API = "https://api.shegu.st";
var CINEJOY_BASE = "https://cinejoy.to";
var WYZIE_API = "https://sub.wyzie.io";
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
  let timer = null;
  return Promise.race([
    promise,
    new Promise(function(resolve) {
      timer = setTimeout(function() {
        console.log("[Streamline] timeout: " + label);
        resolve([]);
      }, timeout);
    })
  ]).then(function(v) {
    // v1.6.0: clear the losing timer so resolved calls stop logging a
    // bogus "timeout" seconds later (stray timers are device-hostile).
    if (timer) clearTimeout(timer);
    return v;
  }, function(e) {
    if (timer) clearTimeout(timer);
    throw e;
  });
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

// src/_shared/subs.js
var STREMIO_SUBS = [
  "https://opensubtitles.stremio.homes/en|tl/ai-translated=true|from=all|auto-adjustment=true",
  'https://subsense.nepiraw.com/n0tcjfba-{"languages":["en","tl"],"maxSubtitles":10}'
];
function settings() {
  try {
    return globalThis.SCRAPER_SETTINGS || {};
  } catch (e) {
    return {};
  }
}
function stremioSubtitles(imdbId, season, episode, isTv) {
  return __async(this, null, function* () {
    const out = [];
    if (!imdbId)
      return out;
    const path = isTv ? "/subtitles/series/" + imdbId + ":" + season + ":" + episode + ".json" : "/subtitles/movie/" + imdbId + ".json";
    const jobs = STREMIO_SUBS.map(function(base) {
      return function() {
        return __async(this, null, function* () {
          try {
            const json = JSON.parse(yield fetchText(base + path, {}, 12e3));
            const list = json && json.subtitles || [];
            list.slice(0, 12).forEach(function(s) {
              if (!s || !s.url)
                return;
              out.push({
                url: s.url,
                language: s.lang || s.lang_code || "en",
                name: (s.title || s.lang || "Subtitle") + " [Stremio]"
              });
            });
          } catch (e) {
            console.log("[Streamline][subs] " + base + ": " + e.message);
          }
        });
      }();
    });
    yield Promise.all(jobs);
    return out;
  });
}
function wyzieSubtitles(imdbId, season, episode, isTv) {
  return __async(this, null, function* () {
    const key = settings().wyzieKey;
    if (!key || !imdbId)
      return [];
    const url = isTv ? WYZIE_API + "/search?id=" + imdbId + "&season=" + season + "&episode=" + episode + "&source=all&key=" + key : WYZIE_API + "/search?id=" + imdbId + "&source=all&key=" + key;
    try {
      const list = JSON.parse(yield fetchText(url, {}, 12e3));
      return (Array.isArray(list) ? list : []).slice(0, 12).map(function(s) {
        return {
          url: s.url,
          language: s.language || "en",
          name: (s.display || s.language || "Subtitle") + " [Wyzie]"
        };
      });
    } catch (e) {
      console.log("[Streamline][wyzie] " + e.message);
      return [];
    }
  });
}
function attachSubtitles(streams, subtitles) {
  if (!subtitles || !subtitles.length)
    return streams;
  return streams.map(function(s) {
    if (s.subtitles && s.subtitles.length)
      return s;
    const copy = Object.assign({}, s);
    copy.subtitles = subtitles.slice(0, 8);
    return copy;
  });
}
function withSharedSubs(streams, ctx) {
  return __async(this, null, function* () {
    try {
      if (!ctx || !ctx.imdbId)
        return streams;
      const subs = (yield stremioSubtitles(ctx.imdbId, ctx.season, ctx.episode, ctx.isTv)).concat(
        yield wyzieSubtitles(ctx.imdbId, ctx.season, ctx.episode, ctx.isTv)
      );
      return attachSubtitles(streams, subs);
    } catch (e) {
      return streams;
    }
  });
}
function wyzieKeyField() {
  return {
    type: "text",
    key: "wyzieKey",
    label: "Wyzie subtitles key",
    placeholder: "Optional Wyzie API key",
    description: "Extra subtitles alongside the built-in Stremio ones."
  };
}

// src/_shared/sources/cinejoy.js
var B64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
// v1.5.0 FIX: the old decoder ran every 4-char group through B64.indexOf and
// masked with & 63, so '=' padding (-1 -> 63) injected garbage tail bytes
// into every token whose length % 3 != 0 (184-byte live token -> 186 bytes ->
// shegu /g 404). That silently broke BOTH transports for most titles - the
// real "cinejoy never gives stream" root cause on top of the Mobile gap.
// Padding is now stripped and only full groups decode, with the remainder
// handled bit-exact (2 chars -> 1 byte, 3 chars -> 2 bytes).
function b64urlDecodeToBytes(s) {
  const std = String(s || "").replace(/-/g, "+").replace(/_/g, "/").replace(/=+$/, "");
  const out = [];
  const n = std.length;
  let i = 0;
  for (; i + 4 <= n; i += 4) {
    const v = B64.indexOf(std[i]) << 18 | B64.indexOf(std[i + 1]) << 12 | B64.indexOf(std[i + 2]) << 6 | B64.indexOf(std[i + 3]);
    out.push(v >> 16 & 255, v >> 8 & 255, v & 255);
  }
  const rem = n - i;
  if (rem === 2) {
    const v = B64.indexOf(std[i]) << 18 | B64.indexOf(std[i + 1]) << 12;
    out.push(v >> 16 & 255);
  } else if (rem === 3) {
    const v = B64.indexOf(std[i]) << 18 | B64.indexOf(std[i + 1]) << 12 | B64.indexOf(std[i + 2]) << 6;
    out.push(v >> 16 & 255, v >> 8 & 255);
  }
  return out;
}
function b64urlEncodeNoPad(bytes) {
  let out = "";
  for (let i = 0; i < bytes.length; i += 3) {
    const a = bytes[i], b = i + 1 < bytes.length ? bytes[i + 1] : 0, c = i + 2 < bytes.length ? bytes[i + 2] : 0;
    const n = a << 16 | b << 8 | c;
    out += B64[n >> 18 & 63] + B64[n >> 12 & 63];
    out += i + 1 < bytes.length ? B64[n >> 6 & 63] : "";
    out += i + 2 < bytes.length ? B64[n & 63] : "";
  }
  return out.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}
// src/cinejoy/relay.js (v1.5.0)
var __CJ_G = (typeof globalThis !== "undefined" ? globalThis : typeof global !== "undefined" ? global : this);
var __cjLane = __CJ_G.__CINEJOY_G_LANE__ || (__CJ_G.__CINEJOY_G_LANE__ = { mode: "" }); // "" | "direct" | "relay"
// v1.6.0: top-level lane memo ("" | "chain" | "full") - skips the doomed
// chain attempts on Mobile after the full worker lane won once.
var __cjTop = __CJ_G.__CINEJOY_TOP_LANE__ || (__CJ_G.__CINEJOY_TOP_LANE__ = { mode: "" });
function relayBase() {
  try {
    var s = (typeof globalThis !== "undefined" && globalThis.SCRAPER_SETTINGS) || (typeof global !== "undefined" && global.SCRAPER_SETTINGS) || {};
    var r = String(s.cjRelay || "").trim().replace(/\/+$/, "");
    return /^https?:\/\//i.test(r) ? r : "";
  } catch (e) {
    return "";
  }
}
function readGBytes(res) {
  if (res.arrayBuffer) {
    return res.arrayBuffer().then(function(ab) {
      const u8 = new Uint8Array(ab);
      const out = [];
      for (let i = 0; i < u8.length; i++) out.push(u8[i] & 255);
      return out;
    });
  }
  return res.text().then(function(t) {
    const out = [];
    for (let i = 0; i < t.length; i++) out.push(t.charCodeAt(i) & 255);
    return out;
  });
}
function gLaneDirectBytes(bodyBytes, headers) {
  return fetch(CINEJOY_API + "/g", {
    method: "POST",
    headers: Object.assign({}, headers, { "Content-Type": "application/octet-stream", Origin: CINEJOY_BASE }),
    body: bodyBytes
  }).then(function(res) {
    if (!res || !res.ok) throw new Error("g HTTP " + (res ? res.status : "?"));
    return readGBytes(res);
  }).then(function(bytes) {
    __cjLane.mode = "direct";
    return bytes;
  });
}
function gLaneDirectString(bodyBytes, headers) {
  let binBody = "";
  for (let i = 0; i < bodyBytes.length; i++) binBody += String.fromCharCode(bodyBytes[i] & 255);
  return fetch(CINEJOY_API + "/g", {
    method: "POST",
    headers: Object.assign({}, headers, { "Content-Type": "application/octet-stream", Origin: CINEJOY_BASE }),
    body: binBody
  }).then(function(res) {
    if (!res || !res.ok) throw new Error("g HTTP " + (res ? res.status : "?"));
    return readGBytes(res);
  }).then(function(bytes) {
    __cjLane.mode = "direct";
    return bytes;
  });
}
function gLaneRelay(bodyBytes) {
  const base = relayBase();
  if (!base) return Promise.reject(new Error("no relay configured"));
  return fetch(base + "/cjg", {
    method: "POST",
    headers: { "Content-Type": "text/plain" },
    body: b64urlEncodeNoPad(bodyBytes)
  }).then(function(res) {
    if (!res || !res.ok) throw new Error("relay HTTP " + (res ? res.status : "?"));
    return res.json();
  }).then(function(j) {
    const packed = (j && (j.b64 || (j.result && j.result.b64))) || "";
    if (!j || !j.ok || !packed) throw new Error("relay payload");
    const bytes = b64urlDecodeToBytes(packed);
    const out = [];
    for (let i = 0; i < bytes.length; i++) out.push(bytes[i] & 255);
    return out;
  }).then(function(bytes) {
    __cjLane.mode = "relay";
    return bytes;
  });
}
/**
 * POST the encrypted request token to shegu /g, return raw response bytes
 * (plain array) or null when every configured lane fails. Lane order honors
 * the memo so Mobile skips its doomed direct attempts after the first server.
 */
function gRequest(bodyBytes, headers) {
  const lanes = __cjLane.mode === "relay"
    ? [gLaneRelay]
    : [gLaneDirectBytes, gLaneDirectString, gLaneRelay];
  let chain = Promise.reject(new Error("start"));
  lanes.forEach(function(lane) {
    chain = chain.catch(function() {
      return lane(bodyBytes, headers);
    });
  });
  return chain.catch(function() {
    return null;
  });
}

function enabled() {
  try {
    const s = globalThis.SCRAPER_SETTINGS || {};
    return s.cinejoy !== false;
  } catch (e) {
    return true;
  }
}
/** Shared row builder from a dec/full-lane stream list. */
function rowsFromStreams(streams, name) {
  const out = [];
  const list = Array.isArray(streams) ? streams : [streams];
  list.forEach(function(st) {
    if (!st)
      return;
    if (st.playlist) {
      const s = makeStream("Cinejoy", "Cinejoy - " + (st.id || name) + " [HLS]", st.playlist, "1080p", { Referer: CINEJOY_BASE + "/" }, []);
      if (s)
        out.push(s);
    }
    const quals = st.qualities || st.files || {};
    Object.keys(quals).forEach(function(k) {
      const u = quals[k];
      if (!u || String(u).indexOf("https") !== 0)
        return;
      const s = makeStream("Cinejoy", "Cinejoy - " + (st.id || name) + " " + k, u, parseQuality(k), { Referer: CINEJOY_BASE + "/" }, []);
      if (s)
        out.push(s);
    });
  });
  return out;
}

/**
 * v1.6.0: full-chain worker lane. ONE text POST to the asian-catalog worker
 * (/cjs, v5.7.0+) which runs the entire cinejoy chain server-side and returns
 * final stream JSON. The device never touches a binary body nor enc-dec.app.
 */
function scrapeServerFull(srv, ctx, type) {
  const base = relayBase();
  if (!base)
    return Promise.resolve([]);
  const name = srv && srv.name || srv;
  const body = JSON.stringify({
    title: ctx.title || "",
    type: type,
    year: ctx.year || "",
    imdb: ctx.imdbId || "",
    tmdb: ctx.tmdbId || "",
    server: String(name || ""),
    season: ctx.isTv ? (ctx.season || 1) : 0,
    episode: ctx.isTv ? (ctx.episode || 1) : 0
  });
  return fetch(base + "/cjs", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: body
  }).then(function(res) {
    if (!res || !res.ok)
      throw new Error("full HTTP " + (res ? res.status : "?"));
    return res.json();
  }).then(function(j) {
    if (!j || !j.ok)
      return [];
    return rowsFromStreams(j.streams || [], name);
  });
}

function scrapeServer(srv, ctx, headers, type) {
  return __async(this, null, function* () {
    // v1.6.0: per-server chain lane (below) + full-chain worker fallback,
    // memoized in __CINEJOY_TOP_LANE__ ("chain" | "full") so Mobile skips the
    // doomed direct attempts after the first server.
    const name = srv && srv.name || srv;
    if (__cjTop.mode === "full") {
      return scrapeServerFull(srv, ctx, type).catch(function() { return []; });
    }
    let rows = [];
    try {
      rows = yield scrapeServerChain(srv, ctx, headers, type);
    } catch (e) {
      rows = [];
    }
    if (rows.length) {
      __cjTop.mode = "chain";
      return rows;
    }
    if (relayBase()) {
      try {
        const full = yield scrapeServerFull(srv, ctx, type);
        if (full.length)
          __cjTop.mode = "full";
        return full;
      } catch (e2) {
        return [];
      }
    }
    return rows;
  });
}

function scrapeServerChain(srv, ctx, headers, type) {
  return __async(this, null, function* () {
    // v1.5.0: one server lane, isolated (any failure -> []). Extracted from
    // scrape() so servers can run in PARALLEL waves - the sequential loop
    // blew getStreams' 20s budget (enc/g/dec at 3-5s per server x 6) and
    // returned zero rows on slow networks - the device's other "never
    // streams" symptom.
    const out = [];
    try {
      const isTv = ctx.isTv;
      const name = srv && srv.name || srv;
      let target = CINEJOY_API + "/?title=" + encodeURIComponent(ctx.title) + "&type=" + type + "&year=" + (ctx.year || "") + "&imdb=" + (ctx.imdbId || "") + "&tmdb=" + (ctx.tmdbId || "") + "&server=" + encodeURIComponent(name);
      if (isTv)
        target += "&season=" + ctx.season + "&episode=" + ctx.episode;
      const encJson = JSON.parse(
        yield fetchText(MULTI_DECRYPT_API + "/enc-cinejoy?url=" + encodeURIComponent(target), {}, 15e3)
      );
      const result = encJson && encJson.result || encJson;
      if (!result || !result.data)
        return out;
      const bodyBytes = b64urlDecodeToBytes(result.data);
      // v1.5.0: the request/response bodies are BINARY. gRequest runs the
      // direct octet-stream lanes (Node/CF/TVSmart) and, when the runtime
      // cannot send binary at all (NuvioMobile's string bridge), the
      // base64url text relay on the user's asian-catalog worker (/cjg).
      // Each lane is memoized in __CINEJOY_G_LANE__ after the first hit.
      let gBody = bodyBytes;
      if (!(typeof Uint8Array !== "undefined" && bodyBytes instanceof Uint8Array)) {
        gBody = new Uint8Array(bodyBytes.length);
        for (let i = 0; i < bodyBytes.length; i++) gBody[i] = bodyBytes[i] & 255;
      }
      const gBuf = yield gRequest(gBody, headers);
      if (!gBuf)
        return out;
      const payload = b64urlEncodeNoPad(gBuf);
      const decJson = yield postJson(
        MULTI_DECRYPT_API + "/dec-cinejoy",
        { text: payload, state: result.state },
        {},
        15e3
      );
      const streams = ((decJson && decJson.result || {}).data || {}).stream;
      if (!streams)
        return out;
      rowsFromStreams(streams, name).forEach(function(s) { out.push(s); });
    } catch (e) {
      return out;
    }
    return out;
  });
}
function scrape(ctx) {
  return __async(this, null, function* () {
    if (!enabled())
      return [];
    if (!ctx.title)
      return [];
    const isTv = ctx.isTv;
    const type = isTv ? "series" : "movie";
    const headers = {
      Accept: "*/*",
      Origin: CINEJOY_BASE,
      Referer: CINEJOY_BASE + "/",
      "User-Agent": UA
    };
    try {
      const serversJson = JSON.parse(yield fetchText(CINEJOY_API + "/servers", headers, 15e3));
      const servers = serversJson && serversJson.servers || [];
      if (!servers.length)
        return [];
      // v1.5.0: parallel waves of 3 servers. If the first wave yields rows,
      // the second is skipped - typical path finishes in one wave's latency
      // (fits the 20s getStreams budget with margin; the old sequential loop
      // did not).
      const out = [];
      const wave1 = servers.slice(0, 3);
      const wave2 = servers.slice(3, 6);
      const runWave = (list) => Promise.all(list.map(function(srv) {
        return scrapeServer(srv, ctx, headers, type).catch(function() { return []; });
      }));
      const r1 = yield runWave(wave1);
      r1.forEach(function(arr) { out.push.apply(out, arr); });
      if (!out.length && wave2.length) {
        const r2 = yield runWave(wave2);
        r2.forEach(function(arr) { out.push.apply(out, arr); });
      }
      return out;
    } catch (e) {
      console.log("[Streamline][cinejoy] " + e.message);
      return [];
    }
  });
}

// src/cinejoy/index.js
function getStreams(tmdbId, mediaType, season, episode) {
  return __async(this, null, function* () {
    try {
      const ctx = yield buildCtx(tmdbId, mediaType, season, episode);
      const out = yield withTimeout(scrape(ctx), 2e4, "cinejoy");
      return presentStreams(dedupe(yield withSharedSubs(out, ctx)), ctx);
    } catch (e) {
      console.log("[Streamline][cinejoy] " + (e && e.message));
      return [];
    }
  });
}
function onSettings() {
  return __async(this, null, function* () {
    return [
      {
        key: "cjRelay",
        title: "Cinejoy relay base URL (Cloudflare Worker)",
        label: "Cinejoy relay base URL",
        type: "text",
        default: "",
        description: "NuvioMobile cannot send the binary request cinejoy.to's API needs. Paste your asian-catalog worker base URL (https://<your-worker>.workers.dev) running the v5.6.0+ bundle with the /cjg relay route. Leave blank on NuvioTV/PC - the direct lane works there without a relay."
      },
      wyzieKeyField()
    ];
  });
}
module.exports = { getStreams, onSettings };

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
  var PROVIDER = "cinejoy";
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
