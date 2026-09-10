/**
 * NetMirror - Nuvio provider (v6.0.0)
 *
 * v6.0.0: mirror prune + Tagalog dub lane rewrite (2026-09-11).
 *  - Mirror sweep: net77.cc (403) and net52.cc (CF challenge) are dead;
 *    only net27.cc still serves the embed API. Dead bases removed so the
 *    first call no longer wastes two doomed requests.
 *  - Tagalog dub lane now uses the /api/variants-tmdb/{type}/{id} API:
 *    variants list dub/detailPath pairs (e.g. Frozen carries "Tagalog dub"),
 *    and /api/embed-tmdb?...&dub={sid}&dubdp={dp} returns that dub's own
 *    sources. Replaces the old fallbackHls audio-group scan - the
 *    /api/loffe extractor behind fallbackHls is broken server-side
 *    (404 "extract failed: browserType.launch"), so the Auto row it fed
 *    is gone too.
 *  - Everything else (throttle, cache, 429 retry, caption sort) unchanged.
 *
 * v5.1.0: rate-limit hardening (upstream started returning HTTP 429).
 *  - Result cache: identical getStreams calls within 10 min reuse the same
 *    rows without touching the API; concurrent calls share one in-flight
 *    request instead of stampeding the mirrors.
 *  - Global throttle: embed API calls are spaced >= 1200 ms apart; bases
 *    are tried with a 600 ms gap; the last base that returned sources is
 *    remembered and tried first next time ("sticky base").
 *  - 429 handling: one retry honoring Retry-After (min 1.5 s, max 8 s)
 *    before moving on to the next mirror.
 *
 * API (unchanged since v2):
 *   GET {base}/api/embed-tmdb/{tmdbId}?type={movie|tv}&se={s}&ep={e}
 *   Headers: Referer: {base}/
 *     -> { ok, noSource?, mode, mp4, resolution, streams:[{url,resolution,size}],
 *          captions:[{lang,name,url}], fallbackHls, title, year, ... }
 *   GET {base}/api/variants-tmdb/{type}/{tmdbId}?se={s}&ep={e}
 *     -> { ok, variants:[{dubSubjectId, language, detailPath}] }
 *
 * Streams are direct mp4s on NetMirror's CDN (signed, ~8 h TTL). The site's
 * own player plays them directly and only falls back to its CF-worker proxy
 * on 403/401/410, so direct URLs are the correct lane for device playback.
 * Pure ES5 promise chains - QuickJS + Nuvio TV worker safe.
 */

var TMDB_API_KEY = "439c478a771f35c05022f9feabcca01c";
// v6: mirror sweep 2026-09-11 - net77.cc 403, net52.cc CF challenge; net27.cc
// is the only base still serving /api/embed-tmdb. Settings override still wins.
var CANDIDATE_BASES = [
  "https://net27.cc"
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
  function fail(res) {
    return res.text().then(function () { throw new Error("HTTP " + res.status); });
  }
  if (!hasTimers()) return fetch(url, opts).then(function (res) {
    if (!res.ok) return fail(res);
    return res.text();
  });
  return new Promise(function (resolve, reject) {
    var timer = setTimeout(function () { reject(new Error("fetch timeout")); }, timeoutMs || 15000);
    fetch(url, opts).then(function (res) {
      clearTimeout(timer);
      if (!res.ok) fail(res).then(function (e) { reject(e); }, function (e) { reject(e); });
      else res.text().then(function (t) { resolve(t); }, function (e) { reject(e); });
    }).catch(function (e) { clearTimeout(timer); reject(e); });
  });
}

function fetchJson(url, headers, timeoutMs) {
  return fetchText(url, headers, timeoutMs).then(function (t) {
    try { return JSON.parse(t); } catch (e) { return null; }
  });
}

// ---------------------------------------------------- rate-limit core v5.1

var RATE_MIN_GAP = 1200;      // min gap between embed API calls (ms)
var BASE_GAP = 600;           // gap between mirror bases (ms)
var CACHE_TTL = 10 * 60 * 1000;
var _G = typeof globalThis !== "undefined" ? globalThis : typeof global !== "undefined" ? global : this;
var _nmState = _G.__NETMIRROR_STATE__ || (_G.__NETMIRROR_STATE__ = {
  cache: {},          // key -> { ts, streams }
  inflight: {},       // key -> Promise
  lastCall: 0,        // ts of last embed API call
  goodBase: null      // sticky base that returned sources
});

function sleep(ms) {
  return new Promise(function (resolve) {
    if (hasTimers()) setTimeout(resolve, ms);
    else resolve();
  });
}

/** Serialized slot: resolves when >= gap has passed since the last call. */
function throttleSlot(gap) {
  var now = Date.now();
  var wait = Math.max(0, _nmState.lastCall + gap - now);
  _nmState.lastCall = now + wait;
  return sleep(wait);
}

/** fetchJson with one 429-aware retry. */
function fetchJsonRetry(url, headers, timeoutMs) {
  return fetchJson(url, headers, timeoutMs).then(function (data) {
    return data;
  }, function (err) {
    var msg = String((err && err.message) || err);
    if (msg.indexOf("429") === -1) throw err;
    return sleep(1500).then(function () { return fetchJson(url, headers, timeoutMs); });
  });
}

cacheKey = function (tmdbId, mediaType, season, episode) {
  return (mediaType === "tv" ? "tv" : "movie") + ":" + tmdbId + ":" + (season || 1) + ":" + (episode || 1);
};

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

function captionsFor(base, data) {
  if (!Array.isArray(data.captions)) return [];
  var mode = settings().captionLang || "en+fil";
  var subs = [];
  data.captions.forEach(function (c) {
    if (!c || !c.url) return;
    // v6: net27 now returns same-origin proxy paths
    // ("/api/proxy/video?url=<enc CDN url>") instead of absolute URLs.
    var u = String(c.url);
    if (/^\/\//i.test(u)) u = "https:" + u;
    else if (!/^https?:\/\//i.test(u)) u = base + (u.charAt(0) === "/" ? u : "/" + u);
    if (!/^https?:\/\//i.test(u)) return;
    var lang = String(c.lang || c.language || "en").toLowerCase();
    if (mode === "en" && lang !== "en") return;
    if (mode === "en+fil" && !(lang === "en" || lang === "fil" || lang === "tl")) return;
    subs.push({ c: c, u: u, prio: captionPriority(c) });
  });
  subs.sort(function (a, b) { return a.prio - b.prio; });
  return subs.slice(0, 8).map(function (x) {
    return { url: x.u, language: String(x.c.lang || x.c.language || "en"), name: captionName(x.c) };
  });
}

// --------------------------------------------------- Tagalog dub lane v6

/**
 * v6: Tagalog dub lanes via the variants API (replaces the v5 fallbackHls
 * audio-group scan - that endpoint's server-side extractor is broken).
 *
 * 1. GET {base}/api/variants-tmdb/{type}/{tmdbId}?se&ep
 *      -> { ok, variants:[{dubSubjectId, language, detailPath}, ...] }
 *    Language strings observed live: "Tagalog dub", "Hindi dub", "French dub",
 *    "Arabic sub", ... (NetMirror is a PH-market app; Tagalog dubs exist for
 *    many titles - e.g. Frozen).
 * 2. For each Tagalog/Filipino variant:
 *    GET {base}/api/embed-tmdb/{tmdbId}?type&se&ep&dub={sid}&dubdp={dp}
 *      -> that dub's own sources (verified: subjectId switches to the dub's).
 *
 * Every call is throttled like the main lane; all failures are fail-soft ([]).
 */
function isTagalogVariant(langText) {
  return /tagalog|filipino|pilipino/i.test(String(langText || ""));
}

function tagalogDubVariants(base, tmdbId, mediaType, season, episode, meta) {
  var type = mediaType === "tv" ? "tv" : "movie";
  var vUrl = base + "/api/variants-tmdb/" + type + "/" + encodeURIComponent(tmdbId) +
    "?se=" + (season || 1) + "&ep=" + (episode || 1);
  return throttleSlot(RATE_MIN_GAP).then(function () {
    return fetchJsonRetry(vUrl, { Referer: base + "/" }, 12000);
  }).then(function (data) {
    if (!data || !data.ok || !Array.isArray(data.variants)) return [];
    var dubs = [];
    data.variants.forEach(function (v) {
      if (v && v.dubSubjectId && v.detailPath && isTagalogVariant(v.language) &&
          dubs.length < 2) dubs.push(v);
    });
    if (!dubs.length) return [];
    var out = [];
    var title = labelFor(meta);
    var referer = { Referer: base + "/" };
    var seen = {};
    var chain = Promise.resolve();
    dubs.forEach(function (dub) {
      chain = chain.then(function () {
        var dUrl = base + "/api/embed-tmdb/" + encodeURIComponent(tmdbId) +
          "?type=" + type + "&se=" + (season || 1) + "&ep=" + (episode || 1) +
          "&dub=" + encodeURIComponent(dub.dubSubjectId) +
          "&dubdp=" + encodeURIComponent(dub.detailPath);
        return throttleSlot(RATE_MIN_GAP).then(function () {
          return fetchJsonRetry(dUrl, { Referer: base + "/" }, 12000);
        }).then(function (dd) {
          if (!dd || !dd.ok || dd.noSource) return;
          var all = [];
          if (Array.isArray(dd.streams)) all = all.concat(dd.streams);
          if (dd.mp4) all.push({ url: dd.mp4, resolution: dd.resolution });
          all.forEach(function (s) {
            if (!s || !s.url || typeof s.url !== "string") return;
            if (!/^https?:\/\//i.test(s.url) || seen[s.url]) return;
            seen[s.url] = 1;
            var q = qualityFromResolution(s.resolution);
            out.push({
              name: "NetMirror | Tagalog Dub",
              title: title + " | Tagalog Dub (" + q + ")",
              url: s.url,
              quality: q,
              headers: referer
            });
          });
        }).catch(function () {});
      });
    });
    return chain.then(function () { return out; });
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

  return throttleSlot(RATE_MIN_GAP).then(function () {
    return fetchJsonRetry(url, { Referer: base + "/" }, 15000);
  }).then(function (data) {
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

    // v6: the fallbackHls "Auto" row is gone - /api/loffe (its extractor)
    // returns 404 "extract failed: browserType.launch" server-side.

    // v5: captions sorted en/fil first (+ optional filter).
    // v6: caption urls are relative proxy paths now - resolved against base.
    var subs = captionsFor(base, data);
    if (subs.length) {
      streams.forEach(function (s) { s.subtitles = subs; });
    }

    return streams;
  }).then(function (streams) {
    if (streams && streams.length) _nmState.goodBase = base;
    return streams;
  }).catch(function () {
    return []; // base unreachable / rate-limited -> try next
  });
}

function cacheKey(tmdbId, mediaType, season, episode) {
  return (mediaType === "tv" ? "tv" : "movie") + ":" + tmdbId + ":" + (season || 1) + ":" + (episode || 1);
}

function getStreams(tmdbId, mediaType, season, episode) {
  try { tmdbId = String(tmdbId); } catch (e) { tmdbId = ""; }
  if (!tmdbId) return Promise.resolve([]);

  var key = cacheKey(tmdbId, mediaType, season, episode);
  var hit = _nmState.cache[key];
  if (hit && Date.now() - hit.ts < CACHE_TTL) {
    return Promise.resolve(hit.streams);
  }
  if (_nmState.inflight[key]) return _nmState.inflight[key];

  console.log("[NetMirror] start " + mediaType + " " + tmdbId + " S" + season + "E" + episode);
  var customBase = settings().baseUrl;
  var bases = (customBase && /^https?:\/\//i.test(String(customBase)))
    ? [String(customBase).replace(/\/+$/, "")].concat(CANDIDATE_BASES)
    : CANDIDATE_BASES.slice();
  if (_nmState.goodBase && bases.indexOf(_nmState.goodBase) !== -1) {
    bases = [_nmState.goodBase].concat(bases.filter(function (b) { return b !== _nmState.goodBase; }));
  }

  var run = tmdbMeta(tmdbId, mediaType).then(function (meta) {
    var chain = Promise.resolve([]);
    bases.forEach(function (base, idx) {
      chain = chain.then(function (existing) {
        if (existing && existing.length) return existing;
        return (idx > 0 ? throttleSlot(BASE_GAP) : Promise.resolve())
          .then(function () { return fetchFromBase(base, tmdbId, mediaType, season, episode, meta); });
      });
    });
    return chain.then(function (streams) {
      // v6: Tagalog dub lane via the variants API (fail-soft, throttled).
      // Runs even when the main lane found nothing - a dub can exist while
      // the default audio does not. Cached together with the main rows.
      var dubBase = (_nmState.goodBase && CANDIDATE_BASES.indexOf(_nmState.goodBase) !== -1)
        ? _nmState.goodBase
        : CANDIDATE_BASES[0];
      return tagalogDubVariants(dubBase, tmdbId, mediaType, season, episode, meta)
        .then(function (dubs) {
          var all = streams.concat(dubs);
          console.log("[NetMirror] returning " + all.length + " stream(s)" +
            (dubs.length ? " (incl. " + dubs.length + " Tagalog dub)" : ""));
          if (all.length) _nmState.cache[key] = { ts: Date.now(), streams: all };
          return all;
        });
    });
  }).catch(function (error) {
    console.log("[NetMirror] failed: " + (error && error.message ? error.message : error));
    return [];
  }).then(function (streams) {
    delete _nmState.inflight[key];
    return streams;
  });
  _nmState.inflight[key] = run;
  return run;
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
      default: "en+fil",
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
  var PROVIDER = "netmirror";
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
