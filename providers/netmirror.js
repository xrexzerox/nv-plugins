/**
 * NetMirror - Nuvio provider (v2, rebuilt against the current NetMirror API)
 *
 * The old /mobile/*.php endpoints are gone. NetMirror's Astro app now exposes
 * a JSON API that resolves TMDB ids directly:
 *
 *   GET {base}/api/embed-tmdb/{tmdbId}?type={movie|tv}&se={s}&ep={e}
 *   Headers: Referer: {base}/
 *     -> { ok, noSource?, mode, mp4, resolution, streams:[{url,resolution,size}],
 *          captions:[{lang,name,url}], fallbackHls, title, year, ... }
 *
 * Streams are direct mp4s on NetMirror's CDN (signed). fallbackHls is a
 * same-origin HLS path. Pure ES5 promise chains, no timers needed beyond
 * fetch - QuickJS + Nuvio TV worker safe.
 */

var TMDB_API_KEY = "439c478a771f35c05022f9feabcca01c";
var CANDIDATE_BASES = [
  "https://net27.cc",
  "https://net77.cc",
  "https://net52.cc"
];

var COMMON_HEADERS = {
  "Accept": "application/json, text/plain, */*",
  "Accept-Language": "en-US,en;q=0.9",
  "Cache-Control": "no-cache",
  "Pragma": "no-cache",
  "User-Agent": "Mozilla/5.0 (Linux; Android 13; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0 Mobile Safari/537.36"
};

function settings() {
  return typeof globalThis !== "undefined" && globalThis.SCRAPER_SETTINGS
    ? globalThis.SCRAPER_SETTINGS
    : (typeof global !== "undefined" && global.SCRAPER_SETTINGS ? global.SCRAPER_SETTINGS : {});
}

function merge(a, b) {
  var out = {}, k;
  for (k in (a || {})) out[k] = a[k];
  for (k in (b || {})) out[k] = b[k];
  return out;
}

function hasTimers() {
  return typeof setTimeout === "function";
}

function fetchJson(url, headers, timeoutMs) {
  var opts = {
    method: "GET",
    redirect: "follow",
    headers: merge(COMMON_HEADERS, headers || {})
  };
  if (!hasTimers()) return fetch(url, opts).then(function (res) {
    if (!res.ok) throw new Error("HTTP " + res.status);
    return res.json();
  });
  return new Promise(function (resolve, reject) {
    var timer = setTimeout(function () { reject(new Error("fetch timeout")); }, timeoutMs || 15000);
    fetch(url, opts).then(function (res) {
      clearTimeout(timer);
      if (!res.ok) throw new Error("HTTP " + res.status);
      return res.json();
    }).then(function (json) { resolve(json); }, function (e) { clearTimeout(timer); reject(e); });
  });
}

function tmdbMeta(tmdbId, mediaType) {
  var endpoint = mediaType === "tv" ? "tv" : "movie";
  var url = "https://api.themoviedb.org/3/" + endpoint + "/" + tmdbId + "?api_key=" + TMDB_API_KEY;
  return fetchJson(url, null, 10000).then(function (data) {
    if (!data) return { title: "" };
    return {
      title: (mediaType === "tv" ? (data.name || data.original_name) : (data.title || data.original_title)) || "",
      year: data.first_air_date ? String(data.first_air_date).split("-")[0] : (data.release_date ? String(data.release_date).split("-")[0] : "")
    };
  }).catch(function () { return { title: "" }; });
}

function qualityFromResolution(resolution) {
  var n = parseInt(resolution, 10);
  if (!n) return "Auto";
  if (n >= 2160) return "4K";
  if (n >= 1440) return "1440p";
  return n + "p";
}

function labelFor(meta, resolution) {
  var label = meta && meta.title ? meta.title : "NetMirror";
  if (meta && meta.year) label += " (" + meta.year + ")";
  return label;
}

/**
 * Query one base. Resolves [] when the base is unreachable or reports
 * noSource (title not on NetMirror).
 */
function fetchFromBase(base, tmdbId, mediaType, season, episode, meta) {
  var type = mediaType === "tv" ? "tv" : "movie";
  var url = base + "/api/embed-tmdb/" + encodeURIComponent(tmdbId) +
    "?type=" + type + "&se=" + (season || 1) + "&ep=" + (episode || 1);

  return fetchJson(url, { Referer: base + "/" }, 15000).then(function (data) {
    if (!data || !data.ok || data.noSource) return [];
    var streams = [];
    var title = labelFor(meta);
    var referer = { Referer: base + "/" };

    var seen = {};
    function pushStream(u, q) {
      if (!u || typeof u !== "string") return;
      if (!/^https?:\/\//i.test(u)) return;
      if (seen[u]) return;
      seen[u] = 1;
      streams.push({
        name: "NetMirror | " + q,
        title: title + " | " + q + " | NetMirror CDN",
        url: u,
        quality: q,
        headers: referer
      });
    }

    // Multi-resolution list first (highest last in API order; keep API order).
    if (Array.isArray(data.streams)) {
      data.streams.forEach(function (s) {
        if (s && s.url) pushStream(s.url, qualityFromResolution(s.resolution));
      });
    }

    // Single default mp4 (dedupes against streams[] automatically).
    if (data.mp4) pushStream(data.mp4, qualityFromResolution(data.resolution));

    // Same-origin HLS fallback.
    if (data.fallbackHls && typeof data.fallbackHls === "string") {
      var hls = /^https?:\/\//i.test(data.fallbackHls)
        ? data.fallbackHls
        : base + (data.fallbackHls.charAt(0) === "/" ? data.fallbackHls : "/" + data.fallbackHls);
      pushStream(hls, "Auto");
    }

    // Captions -> subtitles (max 8, same cap as Streamline).
    if (Array.isArray(data.captions)) {
      var subs = [];
      data.captions.forEach(function (c) {
        if (c && c.url && /^https?:\/\//i.test(String(c.url)) && subs.length < 8) {
          subs.push({ url: String(c.url), language: String(c.lang || c.language || "en"), name: String(c.name || c.lang || "Subtitles") });
        }
      });
      if (subs.length) {
        streams.forEach(function (s) { s.subtitles = subs; });
      }
    }

    return streams;
  }).catch(function () {
    return []; // base unreachable -> try next
  });
}

function getStreams(tmdbId, mediaType, season, episode) {
  console.log("[NetMirror] start " + mediaType + " " + tmdbId + " S" + season + "E" + episode);
  try { tmdbId = String(tmdbId); } catch (e) { tmdbId = ""; }
  if (!tmdbId) return Promise.resolve([]);

  var customBase = settings().baseUrl;
  var bases = (customBase && /^https?:\/\//i.test(String(customBase)))
    ? [String(customBase).replace(/\/+$/, "")].concat(CANDIDATE_BASES)
    : CANDIDATE_BASES;

  return tmdbMeta(tmdbId, mediaType).then(function (meta) {
    var chain = Promise.resolve([]);
    bases.forEach(function (base) {
      chain = chain.then(function (existing) {
        if (existing && existing.length) return existing;
        return fetchFromBase(base, tmdbId, mediaType, season, episode, meta);
      });
    });
    return chain.then(function (streams) {
      console.log("[NetMirror] returning " + streams.length + " stream(s)");
      return streams;
    });
  }).catch(function (error) {
    console.log("[NetMirror] failed: " + (error && error.message ? error.message : error));
    return [];
  });
}

function onSettings() {
  return Promise.resolve([
    {
      key: "baseUrl",
      title: "NetMirror base URL (optional)",
      label: "NetMirror base URL (optional)",
      type: "text",
      default: "",
      description: "Leave blank to use automatic mirror fallback."
    }
  ]);
}

module.exports = {
  getStreams: getStreams,
  onSettings: onSettings
};
