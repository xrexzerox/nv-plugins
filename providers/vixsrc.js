/**
 * vixsrc - Built from src/vixsrc/
 * Generated: 2025-12-31T21:23:16.687Z
 */
"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
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

// src/vixsrc/constants.js
var TMDB_API_KEY = "68e094699525b18a70bab2f86b1fa706";
var BASE_URL = "https://vixsrc.to";
var USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

// src/vixsrc/http.js
function makeRequest(_0) {
  return __async(this, arguments, function* (url, options = {}) {
    const defaultHeaders = __spreadValues({
      "User-Agent": USER_AGENT,
      "Accept": "application/json,*/*",
      "Accept-Language": "en-US,en;q=0.5",
      "Accept-Encoding": "gzip, deflate",
      "Connection": "keep-alive"
    }, options.headers);
    try {
      const response = yield fetch(url, __spreadValues({
        method: options.method || "GET",
        headers: defaultHeaders
      }, options));
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return response;
    } catch (error) {
      console.error(`[Vixsrc] Request failed for ${url}: ${error.message}`);
      throw error;
    }
  });
}

// src/vixsrc/tmdb.js
function getTmdbInfo(tmdbId, mediaType) {
  return __async(this, null, function* () {
    var _a, _b;
    const endpoint = mediaType === "tv" ? "tv" : "movie";
    const url = `https://api.themoviedb.org/3/${endpoint}/${tmdbId}?api_key=${TMDB_API_KEY}`;
    const response = yield makeRequest(url);
    const data = yield response.json();
    const title = mediaType === "tv" ? data.name : data.title;
    const year = mediaType === "tv" ? (_a = data.first_air_date) == null ? void 0 : _a.substring(0, 4) : (_b = data.release_date) == null ? void 0 : _b.substring(0, 4);
    if (!title) {
      throw new Error("Could not extract title from TMDB response");
    }
    console.log(`[Vixsrc] TMDB Info: "${title}" (${year})`);
    return { title, year, data };
  });
}

// src/vixsrc/extractor.js
function extractStreamFromPage(contentType, contentId, seasonNum, episodeNum) {
  return __async(this, null, function* () {
    let vixsrcUrl;
    let subtitleApiUrl;
    if (contentType === "movie") {
      vixsrcUrl = `${BASE_URL}/movie/${contentId}`;
      subtitleApiUrl = `https://sub.wyzie.ru/search?id=${contentId}`;
    } else {
      vixsrcUrl = `${BASE_URL}/tv/${contentId}/${seasonNum}/${episodeNum}`;
      subtitleApiUrl = `https://sub.wyzie.ru/search?id=${contentId}&season=${seasonNum}&episode=${episodeNum}`;
    }
    console.log(`[Vixsrc] Fetching: ${vixsrcUrl}`);
    const response = yield makeRequest(vixsrcUrl, {
      headers: {
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
      }
    });
    const html = yield response.text();
    console.log(`[Vixsrc] HTML length: ${html.length} characters`);
    let masterPlaylistUrl = null;
    if (html.includes("window.masterPlaylist")) {
      console.log("[Vixsrc] Found window.masterPlaylist");
      const urlMatch = html.match(/url:\s*['"]([^'"]+)['"]/);
      const tokenMatch = html.match(/['"]?token['"]?\s*:\s*['"]([^'"]+)['"]/);
      const expiresMatch = html.match(/['"]?expires['"]?\s*:\s*['"]([^'"]+)['"]/);
      if (urlMatch && tokenMatch && expiresMatch) {
        const baseUrl = urlMatch[1];
        const token = tokenMatch[1];
        const expires = expiresMatch[1];
        console.log("[Vixsrc] Extracted tokens:");
        console.log(`  - Base URL: ${baseUrl}`);
        console.log(`  - Token: ${token.substring(0, 20)}...`);
        console.log(`  - Expires: ${expires}`);
        if (baseUrl.includes("?b=1")) {
          masterPlaylistUrl = `${baseUrl}&token=${token}&expires=${expires}&h=1&lang=en`;
        } else {
          masterPlaylistUrl = `${baseUrl}?token=${token}&expires=${expires}&h=1&lang=en`;
        }
        console.log(`[Vixsrc] Constructed master playlist URL: ${masterPlaylistUrl}`);
      }
    }
    if (!masterPlaylistUrl) {
      const m3u8Match = html.match(/(https?:\/\/[^'"\s]+\.m3u8[^'"\s]*)/);
      if (m3u8Match) {
        masterPlaylistUrl = m3u8Match[1];
        console.log("[Vixsrc] Found direct .m3u8 URL:", masterPlaylistUrl);
      }
    }
    if (!masterPlaylistUrl) {
      const scriptMatches = html.match(new RegExp("<script[^>]*>(.*?)<\\/script>", "gs"));
      if (scriptMatches) {
        for (const script of scriptMatches) {
          const streamMatch = script.match(/['"]?(https?:\/\/[^'"\s]+(?:\.m3u8|playlist)[^'"\s]*)/);
          if (streamMatch) {
            masterPlaylistUrl = streamMatch[1];
            console.log("[Vixsrc] Found stream in script:", masterPlaylistUrl);
            break;
          }
        }
      }
    }
    if (!masterPlaylistUrl) {
      console.log("[Vixsrc] No master playlist URL found");
      return null;
    }
    return { masterPlaylistUrl, subtitleApiUrl };
  });
}

// src/vixsrc/subtitles.js
function getSubtitles(subtitleApiUrl) {
  return __async(this, null, function* () {
    try {
      const response = yield makeRequest(subtitleApiUrl);
      const subtitleData = yield response.json();
      let subtitleTrack = subtitleData.find(
        (track) => track.display.includes("English") && (track.encoding === "ASCII" || track.encoding === "UTF-8")
      );
      if (!subtitleTrack) {
        subtitleTrack = subtitleData.find(
          (track) => track.display.includes("English") && track.encoding === "CP1252"
        );
      }
      if (!subtitleTrack) {
        subtitleTrack = subtitleData.find(
          (track) => track.display.includes("English") && track.encoding === "CP1250"
        );
      }
      if (!subtitleTrack) {
        subtitleTrack = subtitleData.find(
          (track) => track.display.includes("English") && track.encoding === "CP850"
        );
      }
      const subtitles = subtitleTrack ? subtitleTrack.url : "";
      console.log(
        subtitles ? `[Vixsrc] Found subtitles: ${subtitles}` : "[Vixsrc] No English subtitles found"
      );
      return subtitles;
    } catch (error) {
      console.log("[Vixsrc] Subtitle fetch failed:", error.message);
      return "";
    }
  });
}

// src/vixsrc/index.js
function getStreams(tmdbId, mediaType = "movie", seasonNum = null, episodeNum = null) {
  return __async(this, null, function* () {
    console.log(`[Vixsrc] Fetching streams for TMDB ID: ${tmdbId}, Type: ${mediaType}`);
    try {
      const tmdbInfo = yield getTmdbInfo(tmdbId, mediaType);
      const { title, year } = tmdbInfo;
      console.log(`[Vixsrc] Title: "${title}" (${year})`);
      const streamData = yield extractStreamFromPage(mediaType, tmdbId, seasonNum, episodeNum);
      if (!streamData) {
        console.log("[Vixsrc] No stream data found");
        return [];
      }
      const { masterPlaylistUrl, subtitleApiUrl } = streamData;
      const subtitles = yield getSubtitles(subtitleApiUrl);
      const nuvioStreams = [{
        name: "Vixsrc",
        title: "Auto Quality Stream",
        url: masterPlaylistUrl,
        quality: "Auto",
        type: "direct",
        headers: {
          "Referer": BASE_URL,
          "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
        }
      }];
      console.log("[Vixsrc] Successfully processed 1 stream with Auto quality");
      return nuvioStreams;
    } catch (error) {
      console.error(`[Vixsrc] Error in getStreams: ${error.message}`);
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
  var PROVIDER = "vixsrc";
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
