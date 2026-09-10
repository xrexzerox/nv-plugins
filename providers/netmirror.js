/**
 * NetMirror - Nuvio provider (v5.0.0)
 *
 * v5.0.0: language lane.
 *  - Captions are now sorted with English + Filipino ("fil" = Tagalog) first
 *    and labeled; optional setting filters captions (all | en+fil | en).
 *  - The fallbackHls master playlist is inspected for AUDIO groups: if a
 *    Filipino/Tagalog audio group exists AND variant playlists reference it,
 *    each such variant is emitted as its own "NetMirror | Tagalog Dub" row.
 *    (NetMirror carries no per-stream language tag otherwise - verified via
 *    live probe 2026-09-10; captions[] are the only lang-bearing surface,
 *    plus HLS audio groups on the fallback master.)
 *
 * API (unchanged since v2):
 *   GET {base}/api/embed-tmdb/{tmdbId}?type={movie|tv}&se={s}&ep={e}
 *   Headers: Referer: {base}/
 *     -> { ok, noSource?, mode, mp4, resolution, streams:[{url,resolution,size}],
 *          captions:[{lang,name,url}], fallbackHls, title, year, ... }
 *
 * Streams are direct mp4s on NetMirror's CDN (signed). fallbackHls is a
 * same-origin HLS path. Pure ES5 promise chains - QuickJS + Nuvio TV worker
 * safe.
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

function fetchText(url, headers, timeoutMs) {
  var opts = {
    method: "GET",
    redirect: "follow",
    headers: merge(COMMON_HEADERS, headers || {})
  };
  if (!hasTimers()) return fetch(url, opts).then(function (res) {
    if (!res.ok) throw new Error("HTTP " + res.status);
    return res.text();
  });
  return new Promise(function (resolve, reject) {
    var timer = setTimeout(function () { reject(new Error("fetch timeout")); }, timeoutMs || 15000);
    fetch(url, opts).then(function (res) {
      clearTimeout(timer);
      if (!res.ok) throw new Error("HTTP " + res.status);
      return res.text();
    }).then(function (t) { resolve(t); }, function (e) { clearTimeout(timer); reject(e); });
  });
}

function fetchJson(url, headers, timeoutMs) {
  return fetchText(url, headers, timeoutMs).then(function (t) {
    try { return JSON.parse(t); } catch (e) { return null; }
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

// ------------------------------------------------------------- captions v5

function captionPriority(c) {
  var lang = String((c && (c.lang || c.language)) || "").toLowerCase();
  if (lang === "en" || lang.indexOf("english") === 0) return 0;
  if (lang === "fil" || lang === "tl" || lang.indexOf("filipino") === 0 || lang.indexOf("tagalog") === 0) return 1;
  return 2;
}

function captionName(c) {
  var lang = String((c && (c.lang || c.language)) || "").toLowerCase();
  var name = String((c && c.name) || c.lang || "Subtitles");
  if (lang === "fil" || lang === "tl" || /filipino|tagalog/i.test(name)) {
    return "Tagalog / Filipino" + (name && !/tagalog|filipino/i.test(name) ? " (" + name + ")" : "");
  }
  return name;
}

function captionsFor(data) {
  if (!Array.isArray(data.captions)) return [];
  var mode = settings().captionLang || "all";
  var subs = [];
  data.captions.forEach(function (c) {
    if (!c || !c.url || !/^https?:\/\//i.test(String(c.url))) return;
    var lang = String(c.lang || c.language || "en").toLowerCase();
    if (mode === "en" && lang !== "en") return;
    if (mode === "en+fil" && !(lang === "en" || lang === "fil" || lang === "tl")) return;
    subs.push({ c: c, prio: captionPriority(c) });
  });
  subs.sort(function (a, b) { return a.prio - b.prio; });
  return subs.slice(0, 8).map(function (x) {
    return { url: String(x.c.url), language: String(x.c.lang || x.c.language || "en"), name: captionName(x.c) };
  });
}

// --------------------------------------------------- Tagalog dub audio v5

function isTagalogGroup(attrs) {
  // #EXT-X-MEDIA:TYPE=AUDIO,GROUP-ID="aud1",NAME="Filipino",LANGUAGE="fil"
  var language = (attrs.match(/LANGUAGE=["']([^"']+)["']/i) || [])[1] || "";
  var name = (attrs.match(/NAME=["']([^"']+)["']/i) || [])[1] || "";
  var hay = (language + " " + name).toLowerCase();
  return /\b(fil|tl|filipino|tagalog|pilipino)\b/.test(hay) ||
    /tagalog|filipino/.test(hay);
}

/**
 * Parses the fallback HLS master playlist. Returns Promise<{tagalogUrls:[]}>.
 * Tagalog lanes exist only when an AUDIO group is Filipino/Tagalog AND
 * #EXT-X-STREAM-INF variants reference that group (then the variant playlist
 * URL plays the Tagalog audio directly in any player).
 */
function tagalogDubLanes(hlsUrl, referer) {
  if (!hlsUrl) return Promise.resolve([]);
  return fetchText(hlsUrl, { Referer: referer }, 9000).then(function (master) {
    if (!master || master.indexOf("#EXT-X-MEDIA") === -1) return [];
    var groups = {};      // groupId -> isTagalog
    var re = /#EXT-X-MEDIA:([^|\r\n]+)/gi;
    var m;
    while ((m = re.exec(master)) !== null) {
      var attrs = m[1];
      if (!/TYPE=["']?AUDIO/i.test(attrs)) continue;
      var gid = (attrs.match(/GROUP-ID=["']([^"']+)["']/i) || [])[1] || "";
      if (gid) groups[gid] = isTagalogGroup(attrs);
    }
    var tagalogGids = Object.keys(groups).filter(function (g) { return groups[g]; });
    if (!tagalogGids.length) return [];
    var wanted = {};
    tagalogGids.forEach(function (g) { wanted[g] = 1; });
    var out = [];
    var lines = master.split(/\r?\n/);
    for (var i = 0; i < lines.length; i++) {
      var line = lines[i];
      if (line.indexOf("#EXT-X-STREAM-INF") !== 0) continue;
      var audioM = line.match(/AUDIO=["']([^"']+)["']/i);
      if (!audioM || !wanted[audioM[1]]) continue;
      var url = "";
      for (var j = i + 1; j < lines.length; j++) {
        var t = lines[j].trim();
        if (t && t.charAt(0) !== "#") { url = t; break; }
      }
      var resM = line.match(/RESOLUTION=(\d+)x(\d+)/i);
      var q = resM ? qualityFromResolution(resM[2]) : "Auto";
      if (url) {
        out.push({ url: /^https?:\/\//i.test(url) ? url : hlsUrl.replace(/[^/]*$/, url), quality: q });
      }
    }
    // dedupe by url
    var seen = {}, uniq = [];
    out.forEach(function (x) {
      if (seen[x.url]) return;
      seen[x.url] = 1;
      uniq.push(x);
    });
    return uniq;
  }).catch(function () { return []; });
}

// ------------------------------------------------------------------ core v4

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
    var hlsUrl = null;
    if (data.fallbackHls && typeof data.fallbackHls === "string") {
      hlsUrl = /^https?:\/\//i.test(data.fallbackHls)
        ? data.fallbackHls
        : base + (data.fallbackHls.charAt(0) === "/" ? data.fallbackHls : "/" + data.fallbackHls);
      pushStream(hlsUrl, "Auto");
    }

    // v5: captions sorted en/fil first (+ optional filter).
    var subs = captionsFor(data);
    if (subs.length) {
      streams.forEach(function (s) { s.subtitles = subs; });
    }

    // v5: Tagalog dub audio lanes from the fallback HLS master (best effort).
    var laneP = hlsUrl ? tagalogDubLanes(hlsUrl, base + "/") : Promise.resolve([]);
    return laneP.then(function (lanes) {
      lanes.forEach(function (lane) {
        if (seen[lane.url]) return;
        seen[lane.url] = 1;
        streams.push({
          name: "NetMirror | Tagalog Dub",
          title: title + " | Tagalog Dub (" + lane.quality + ")",
          url: lane.url,
          quality: lane.quality,
          headers: referer
        });
      });
      return streams;
    });
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
    },
    {
      key: "captionLang",
      title: "Subtitle language",
      label: "Subtitle language",
      type: "select",
      default: "all",
      options: [
        { value: "all", label: "All languages" },
        { value: "en+fil", label: "English + Tagalog / Filipino" },
        { value: "en", label: "English only" }
      ],
      description: "English and Tagalog (fil) tracks are always listed first. This filter hides the rest."
    }
  ]);
}

module.exports = {
  getStreams: getStreams,
  onSettings: onSettings
};
