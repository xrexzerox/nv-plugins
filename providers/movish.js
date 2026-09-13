/**
 * Movish - Nuvio provider (v1.0.0)
 *
 * movish.to is a Vidstack-based app with a TMDB-keyed sources API. Chain
 * verified live 2026-09-10:
 *
 *   GET {base}/player-sources/{serverKey}/movie/{tmdbId}
 *   GET {base}/player-sources/{serverKey}/tv/{tmdbId}/{season}/{episode}
 *     Headers: Accept: application/json, Referer: {base}/player/...
 *     -> {"source":"rigel","label":"Rigel","streams":[
 *          {"url":"https://api.dlproxy.com/v1/play/...","label":"Delta",
 *           "type":"mp4","quality":"360p"}, ...]}
 *
 *   Server keys live on the player page ({key,label} array). Only "rigel"
 *   was observed; the key list is parsed from the player page each call so
 *   new servers are picked up automatically.
 *
 *   GET {base}/player-episodes/{tmdbId}/{season} -> {"episodes":[...]}  (info only)
 *
 * No site search needed - the whole API is TMDB-id addressed. The dlproxy
 * streams are direct (mp4) or HLS per the "type" field. Rows are labeled
 * "Movish | {label} ({quality})". Language policy: English catalog.
 * Pure ES5 promise chains - QuickJS + Nuvio TV worker safe.
 */

var SITE_NAME = "Movish";
var BASE_CANDIDATES = [
  "https://movish.to"
];
var UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36";

var ACTIVE_BASE = "";

function settings() {
  try {
    return (typeof globalThis !== "undefined" && globalThis.SCRAPER_SETTINGS) ||
      (typeof global !== "undefined" && global.SCRAPER_SETTINGS) || {};
  } catch (e) { return {}; }
}

function hasTimers() {
  return typeof setTimeout === "function";
}

function fetchText(url, options) {
  options = options || {};
  var opts = {
    method: options.method || "GET",
    headers: options.headers || { "User-Agent": UA },
    redirect: "follow"
  };
  if (options.body) opts.body = options.body;
  if (!hasTimers()) {
    return fetch(url, opts).then(function (res) {
      if (!res.ok) throw new Error("HTTP " + res.status);
      return res.text();
    });
  }
  return new Promise(function (resolve, reject) {
    var timer = setTimeout(function () { reject(new Error("fetch timeout")); }, options.timeout || 15000);
    fetch(url, opts).then(function (res) {
      clearTimeout(timer);
      if (!res.ok) throw new Error("HTTP " + res.status);
      return res.text();
    }).then(function (t) { resolve(t); }, function (e) { clearTimeout(timer); reject(e); });
  });
}

function fetchJson(url, options) {
  return fetchText(url, options).then(function (t) {
    try { return JSON.parse(t); } catch (e) { return null; }
  });
}

function candidateBases() {
  var custom = settings().baseUrl;
  var bases = [];
  if (custom && /^https?:\/\//i.test(String(custom))) {
    bases.push(String(custom).replace(/\/+$/, ""));
  }
  BASE_CANDIDATES.forEach(function (b) { bases.push(b); });
  return bases;
}

function resolveBase() {
  if (ACTIVE_BASE) return Promise.resolve(ACTIVE_BASE);
  var chain = Promise.reject(new Error("no base"));
  candidateBases().forEach(function (b) {
    chain = chain.catch(function () {
      return fetchText(b + "/", { headers: { "User-Agent": UA }, timeout: 9000 })
        .then(function () { ACTIVE_BASE = b; return b; });
    });
  });
  return chain;
}

// Pull [{key,label}] out of the player page JS (pattern: [{"key":"rigel","label":"Rigel"}])
function serverKeys(base, isTv, tmdbId, season, episode) {
  var playerPath = isTv
    ? "/player/tv/" + tmdbId + "/" + season + "/" + episode
    : "/player/movie/" + tmdbId;
  return fetchText(base + playerPath, {
    headers: { "User-Agent": UA, "Accept": "text/html,*/*", "Referer": base + "/" },
    timeout: 14000
  }).then(function (html) {
    var keys = [];
    var m = html.match(/\[\s*\{\s*["']key["']\s*:\s*["']([a-z0-9_-]+)["']/i);
    if (m) {
      var arrRe = /\{\s*["']key["']\s*:\s*["']([a-z0-9_-]+)["']\s*,\s*["']label["']\s*:\s*["']([^"']+)["']\s*\}/gi;
      var am;
      while ((am = arrRe.exec(html)) !== null) {
        keys.push({ key: am[1], label: am[2] });
      }
    }
    if (!keys.length) keys.push({ key: "rigel", label: "Rigel" }); // observed default
    return keys;
  }).catch(function () {
    return [{ key: "rigel", label: "Rigel" }];
  });
}

function qualityOf(q) {
  var s = String(q || "").toLowerCase();
  if (s.indexOf("2160") !== -1 || s === "4k") return "4K";
  if (s.indexOf("1440") !== -1) return "1440p";
  if (s.indexOf("1080") !== -1) return "1080p";
  if (s.indexOf("720") !== -1) return "720p";
  if (s.indexOf("480") !== -1) return "480p";
  if (s.indexOf("360") !== -1) return "360p";
  return "Auto";
}

function getStreams(tmdbId, mediaType, season, episode) {
  var isTv = mediaType === "tv";
  var s = season || 1;
  var e = episode || 1;
  console.log("[" + SITE_NAME + "] start " + mediaType + " " + tmdbId + (isTv ? " S" + s + "E" + e : ""));
  try { tmdbId = String(tmdbId); } catch (err) { tmdbId = ""; }
  if (!tmdbId) return Promise.resolve([]);

  return resolveBase().then(function (base) {
    return serverKeys(base, isTv, tmdbId, s, e).then(function (keys) {
      var chain = Promise.resolve([]);
      keys.forEach(function (k) {
        chain = chain.then(function (rows) {
          var srcPath = isTv
            ? "/player-sources/" + k.key + "/tv/" + tmdbId + "/" + s + "/" + e
            : "/player-sources/" + k.key + "/movie/" + tmdbId;
          return fetchJson(base + srcPath, {
            headers: { "User-Agent": UA, "Accept": "application/json", "Referer": base + "/" },
            timeout: 14000
          }).then(function (payload) {
            var streams = (payload && payload.streams) || [];
            streams.forEach(function (st) {
              if (!st || !st.url || !/^https?:\/\//i.test(st.url)) return;
              if (rows.some(function (r) { return r.url === st.url; })) return;
              var q = qualityOf(st.quality);
              var kind = String(st.type || "mp4").toLowerCase() === "hls" ? "HLS" : "Direct";
              rows.push({
                name: SITE_NAME + " | " + (k.label || k.key),
                title: SITE_NAME + (isTv ? " S" + s + "E" + e : "") + " | " + (st.label || kind) + " - " + q,
                url: st.url,
                quality: q,
                headers: { "User-Agent": UA, "Referer": base + "/" }
              });
            });
            return rows;
          }).catch(function () { return rows; });
        });
      });
      return chain.then(function (rows) {
        console.log("[" + SITE_NAME + "] returning " + rows.length + " stream(s)");
        return rows;
      });
    });
  }).catch(function (error) {
    console.log("[" + SITE_NAME + "] failed: " + (error && error.message ? error.message : error));
    return [];
  });
}

function onSettings() {
  return Promise.resolve([
    {
      key: "baseUrl",
      title: "Movish base URL (optional)",
      label: "Movish base URL (optional)",
      type: "text",
      default: "",
      description: "Leave blank to use built-in mirrors. Use when the site rotates domains."
    }
  ]);
}

module.exports = { getStreams: getStreams, onSettings: onSettings };

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
  var PROVIDER = "movish";
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
