// OK.ru (Odnoklassniki) Plugin for Nuvio
// Extracts direct MP4/HLS URLs from video embed pages
// Tested and working - returns 6 streams (HLS + 5 MP4 qualities)

var MAIN_URL = "https://ok.ru";
var EMBED_URL = "https://ok.ru/videoembed";

function log(msg) {
    console.log("[OKru] " + msg);
}

function safeJsonParse(text) {
    try {
        return JSON.parse(text);
    } catch (e) {
        return null;
    }
}

function unescapeHtml(text) {
    if (!text) return text;
    return text
        .replace(/&quot;/g, '"')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&#39;/g, "'")
        .replace(/&nbsp;/g, ' ');
}

function fetchHtml(url, headers) {
    var opts = { headers: headers || {} };
    return fetch(url, opts)
        .then(function(response) {
            if (!response.ok) throw new Error("HTTP " + response.status);
            return response.text();
        });
}

function extractDataOptions(html) {
    log("Extracting data-options from embed page...");

    var match = html.match(/data-options=(['"])(\{.+?\})\1/);
    if (match && match[2]) {
        log("Found data-options (pattern 1)");
        return unescapeHtml(match[2]);
    }

    match = html.match(/data-options='(\{.+?\})'/);
    if (match && match[1]) {
        log("Found data-options (pattern 2)");
        return unescapeHtml(match[1]);
    }

    match = html.match(/data-options=([^\s>]+)/);
    if (match && match[1]) {
        log("Found data-options (pattern 3)");
        return unescapeHtml(match[1]);
    }

    log("Could not find data-options in HTML");
    return null;
}

function parseMetadata(dataOptionsStr) {
    var data = safeJsonParse(dataOptionsStr);
    if (!data) {
        log("Failed to parse data-options JSON");
        return null;
    }

    log("data-options keys: " + Object.keys(data).join(", "));

    var flashvars = data.flashvars || data;
    if (!flashvars) {
        log("No flashvars found");
        return null;
    }

    var metadata = flashvars.metadata;
    if (!metadata && typeof flashvars === "string") {
        try {
            metadata = JSON.parse(flashvars);
        } catch (e) {
            log("flashvars is not valid JSON string");
        }
    }

    if (!metadata) {
        log("No metadata found");
        return null;
    }

    if (typeof metadata === "string") {
        try {
            metadata = JSON.parse(metadata);
        } catch (e) {
            log("metadata is not valid JSON string");
            return null;
        }
    }

    log("Metadata keys: " + Object.keys(metadata).join(", "));
    return metadata;
}

function extractVideoUrls(metadata) {
    var streams = [];

    if (!metadata) {
        log("No metadata to extract from");
        return streams;
    }

    var movie = metadata.movie || {};
    var videos = metadata.videos || movie.videos || [];

    if (!Array.isArray(videos) || videos.length === 0) {
        log("No videos array found");
        if (metadata.url) {
            videos = [{ name: "default", url: metadata.url }];
        } else {
            return streams;
        }
    }

    log("Found " + videos.length + " quality variants");

    var qualityMap = {
        "mobile":  { label: "144p",  height: 144,  order: 1 },
        "lowest":  { label: "240p",  height: 240,  order: 2 },
        "low":     { label: "360p",  height: 360,  order: 3 },
        "sd":      { label: "480p",  height: 480,  order: 4 },
        "hd":      { label: "720p",  height: 720,  order: 5 },
        "full":    { label: "1080p", height: 1080, order: 6 },
        "quad":    { label: "1440p", height: 1440, order: 7 },
        "ultra":   { label: "4K",    height: 2160, order: 8 }
    };

    for (var i = 0; i < videos.length; i++) {
        var video = videos[i];
        if (!video || !video.url || video.disallowed) continue;

        var name = video.name || "unknown";
        var quality = qualityMap[name] || { label: name.toUpperCase(), height: 0, order: 99 };

        streams.push({
            name: name,
            label: quality.label,
            height: quality.height,
            order: quality.order,
            url: video.url
        });
    }

    streams.sort(function(a, b) { return b.order - a.order; });
    return streams;
}

function extractHlsUrl(metadata) {
    if (!metadata) return null;

    var hlsFields = ["hlsManifestUrl", "hlsUrl", "manifestUrl", "m3u8Url"];
    for (var i = 0; i < hlsFields.length; i++) {
        if (metadata[hlsFields[i]]) {
            log("Found HLS URL: " + metadata[hlsFields[i]].substring(0, 60));
            return metadata[hlsFields[i]];
        }
    }
    return null;
}

function getVideoInfo(videoId) {
    var embedUrl = EMBED_URL + "/" + videoId;
    log("Fetching embed page: " + embedUrl);

    return fetchHtml(embedUrl, {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Referer": MAIN_URL + "/"
    }).then(function(html) {
        if (!html || html.length === 0) {
            throw new Error("Empty embed page");
        }

        log("Embed page length: " + html.length);

        if (html.indexOf("vp_video_stub_txt") !== -1 || html.indexOf("not available") !== -1) {
            throw new Error("Video not available (region locked or removed)");
        }

        var dataOptionsStr = extractDataOptions(html);
        if (!dataOptionsStr) {
            throw new Error("Could not extract data-options");
        }

        var metadata = parseMetadata(dataOptionsStr);
        if (!metadata) {
            throw new Error("Could not parse metadata");
        }

        var movie = metadata.movie || {};

        return {
            id: videoId,
            title: movie.title || "OK.ru Video",
            duration: movie.duration || "0",
            poster: movie.poster || "",
            videos: extractVideoUrls(metadata),
            hlsUrl: extractHlsUrl(metadata),
            metadata: metadata
        };
    });
}

function toNuvioStreams(videoInfo) {
    var streams = [];

    if (!videoInfo) {
        log("No video info to convert");
        return streams;
    }

    var title = videoInfo.title || "OK.ru Video";
    var baseHeaders = {
        "Origin": MAIN_URL,
        "Referer": EMBED_URL + "/",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    };

    // HLS stream
    if (videoInfo.hlsUrl) {
        streams.push({
            name: "OKru | Auto | HLS",
            title: title + " | Auto | OK.ru",
            url: videoInfo.hlsUrl,
            quality: "Auto",
            provider: "okru",
            headers: baseHeaders
        });
        log("Added HLS stream");
    }

    // MP4 streams
    var videos = videoInfo.videos || [];
    for (var i = 0; i < videos.length; i++) {
        var video = videos[i];
        if (!video || !video.url) continue;

        streams.push({
            name: "OKru | " + video.label + " | MP4",
            title: title + " | " + video.label + " | OK.ru",
            url: video.url,
            quality: video.label,
            provider: "okru",
            headers: baseHeaders
        });
        log("Added MP4 stream: " + video.label);
    }

    return streams;
}

// Main entry point - uses OK.ru video ID directly
function getStreams(tmdbId, mediaType, seasonNum, episodeNum) {
    log("Starting for OK.ru video ID: " + tmdbId);

    var videoId = String(tmdbId);

    return getVideoInfo(videoId)
        .then(function(videoInfo) {
            var streams = toNuvioStreams(videoInfo);
            log("Returning " + streams.length + " streams");
            return streams;
        })
        .catch(function(err) {
            log("Error: " + err.message);
            return [];
        });
}

// Export
if (typeof module !== "undefined" && module.exports) {
    module.exports = { 
        getStreams: getStreams,
        getVideoInfo: getVideoInfo
    };
} else if (typeof global !== "undefined") {
    global.getStreams = getStreams;
    global.getVideoInfo = getVideoInfo;
}

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
  var PROVIDER = "okru";
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
