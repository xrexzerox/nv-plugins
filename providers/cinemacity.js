// cinemacity.js v5.0.0
// v5.0.0: language-aware extraction. The site's PlayerJS data carries
// language markers on its file entries ("eng", "italian/ita", "sub", and for
// some titles Filipino markers "tagalog"/"filipino"/"tl dub"/"fil dub").
// v5 policy (user requirement: English movies/TV, grab Tagalog/Filipino dub
// when the site has it):
//   1. classify every entry by its title text / file URL
//   2. emit English rows first
//   3. emit "CinemaCity | Tagalog Dub" rows when tagalog/filipino markers
//      exist (dub beats subs; a tagalog-marked entry is a dub print)
//   4. Italian / Hindi / Arabic entries only as last resort
//   5. "sub"-only variants skipped unless nothing else exists
// v4.2.0: third retry identity (Googlebot). The site's Cloudflare sits in
// front of DLE with a managed challenge: desktop Chrome -> 403, mobile
// Android -> 403 on some edges. WordPress/DLE hosts commonly allow-list the
// Google crawler, so the escalation ends with a Googlebot UA before giving
// up (same 3-step ladder the asian-catalog addon uses successfully).
// v4.1.0: challenge/403 detection, automatic mobile retry, clean fail-soft.
var MAIN_URL = "https://cinemacity.cc";
var HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36",
  "Cookie": "dle_user_id=32729; dle_password=894171c6a8dab18ee594d5c652009a35;",
  "Referer": "https://cinemacity.cc/",
  "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9"
};
var MOBILE_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Linux; Android 13; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
  "Cookie": "dle_user_id=32729; dle_password=894171c6a8dab18ee594d5c652009a35;",
  "Referer": "https://cinemacity.cc/",
  "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9"
};
var BOT_HEADERS = {
  "User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
  "Cookie": "dle_user_id=32729; dle_password=894171c6a8dab18ee594d5c652009a35;",
  "Referer": "https://cinemacity.cc/",
  "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9"
};
var TMDB_API_KEY = "1865f43a0549ca50d341dd9ab8b29f49";

function atobPolyfill(str) {
  try {
    var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    var output = "";
    str = String(str).replace(/[=]+$/, "");
    if (str.length % 4 === 1) return "";
    for (var bc = 0, bs = 0, buffer, i = 0; buffer = str.charAt(i++); ~buffer && (bs = bc % 4 ? bs * 64 + buffer : buffer, bc++ % 4) ? output += String.fromCharCode(255 & bs >> (-2 * bc & 6)) : 0) {
      buffer = chars.indexOf(buffer);
    }
    return output;
  } catch (e) {
    return "";
  }
}

function extractQuality(url) {
  var low = (url || "").toLowerCase();
  if (low.indexOf("2160p") !== -1 || low.indexOf("4k") !== -1) return "4K";
  if (low.indexOf("1080p") !== -1) return "1080p";
  if (low.indexOf("720p") !== -1) return "720p";
  if (low.indexOf("480p") !== -1) return "480p";
  if (low.indexOf("360p") !== -1) return "360p";
  return "HD";
}

function looksLikeChallenge(html) {
  return /Just a moment|challenges\.cloudflare\.com|Attention Required|cf-chl/i.test(html || "");
}

function fetchOnce(url, headers) {
  return fetch(url, {
    headers: headers || HEADERS,
    skipSizeCheck: true
  }).then(function(response) {
    return response.text().then(function(text) {
      if (response.status === 403 || response.status === 503 || looksLikeChallenge(text)) {
        throw new Error("CF_BLOCK " + response.status);
      }
      return text;
    });
  });
}

function fetchText(url, options) {
  options = options || {};
  return fetchOnce(url, options.headers).catch(function(err) {
    console.log("[CinemaCity] blocked or failed (" + err.message + "), retrying with mobile identity...");
    return fetchOnce(url, MOBILE_HEADERS).catch(function(err2) {
      var msg2 = String((err2 && err2.message) || err2);
      if (/CF_BLOCK (403|503)/.test(msg2)) {
        console.log("[CinemaCity] mobile retry failed too (" + msg2 + "), trying Googlebot identity...");
        return fetchOnce(url, BOT_HEADERS);
      }
      throw err2;
    });
  }).catch(function(err3) {
    console.log("[CinemaCity] all identities failed (" + err3.message + ")");
    return ""; // empty keeps the old fail-soft flow (callers treat falsy as no-data)
  });
}

function findAnchorsInHtml(html) {
  var anchors = [];
  var regex = /<a\s+([^>]*)>([\s\S]*?)<\/a>/gi;
  var match;
  while ((match = regex.exec(html)) !== null) {
    var attrs = match[1];
    var text = match[2].replace(/<[^>]*>/g, "").trim();
    var hrefMatch = attrs.match(/href=["']([^"']+)["']/i);
    var href = hrefMatch ? hrefMatch[1] : "";
    anchors.push({ text: text, href: href });
  }
  return anchors;
}

function findScriptsInHtml(html) {
  var scripts = [];
  var regex = /<script[^>]*>([\s\S]*?)<\/script>/gi;
  var match;
  while ((match = regex.exec(html)) !== null) {
    scripts.push(match[1]);
  }
  return scripts;
}

// Walks a string/object/array literal from its opening bracket to the
// MATCHING closing bracket (quote-aware). DLE season trees are nested
// arrays - the old lazy regex truncated at the inner "]" and JSON.parse
// always died (the long-standing TV bug).
function extractBalanced(str, startIdx, openCh, closeCh) {
  var depth = 0, inStr = null, esc = false;
  for (var i = startIdx; i < str.length; i++) {
    var ch = str.charAt(i);
    if (inStr) {
      if (esc) { esc = false; }
      else if (ch === "\\") { esc = true; }
      else if (ch === inStr) { inStr = null; }
    } else {
      if (ch === '"' || ch === "'") { inStr = ch; }
      else if (ch === openCh) { depth++; }
      else if (ch === closeCh) {
        depth--;
        if (depth === 0) return str.substring(startIdx, i + 1);
      }
    }
  }
  return null;
}

// ------------------------------------------------------------- v5 language

var LANG_MARKERS = {
  tagalog: /tagalog|filipino|pilipino|\btl[\s._-]*(?:dub)?\b|\bfil[\s._-]*dub\b/i,
  english: /\beng(?:lish)?\b|\bengl\b/i,
  italian: /italian|italiano|\bita\b/i,
  hindi: /hindi/i,
  arabic: /arab(?:ic)?/i,
  subtitleOnly: /\bsub(?:s|title)?s?\b/i
};

// Classify a PlayerJS entry by its title text and file url.
// Returns "tagalog" | "english" | "italian" | "hindi" | "arabic" | "sub" | "unknown".
function classifyEntry(entry) {
  var hay = ((entry && entry.title) ? String(entry.title) : "") + " " + ((entry && entry.file) ? String(entry.file) : "");
  if (LANG_MARKERS.tagalog.test(hay)) return "tagalog";
  if (LANG_MARKERS.english.test(hay) && !LANG_MARKERS.subtitleOnly.test(hay)) return "english";
  if (LANG_MARKERS.italian.test(hay)) return "italian";
  if (LANG_MARKERS.hindi.test(hay)) return "hindi";
  if (LANG_MARKERS.arabic.test(hay)) return "arabic";
  if (LANG_MARKERS.subtitleOnly.test(hay)) return "sub";
  return "unknown";
}

function langRank(cls) {
  // English first, Tagalog dub right after, then unknown (unlabeled is
  // usually the site default), Italian/Hindi/Arabic last, sub-only dropped
  // unless nothing else.
  switch (cls) {
    case "english": return 0;
    case "tagalog": return 1;
    case "unknown": return 2;
    case "italian": return 3;
    case "hindi": return 4;
    case "arabic": return 5;
    case "sub": return 9;
    default: return 8;
  }
}

function langLabel(cls) {
  if (cls === "tagalog") return "Tagalog Dub";
  if (cls === "english") return "English";
  if (cls === "italian") return "Italian";
  if (cls === "hindi") return "Hindi";
  if (cls === "arabic") return "Arabic";
  if (cls === "sub") return "Subbed";
  return "";
}

function getStreams(tmdbId, mediaType, season, episode) {
  console.log("[CinemaCity] Starting for TMDB ID:", tmdbId, "Type:", mediaType);
  return new Promise(function(resolve, reject) {
    var animeTitle = null;
    var tmdbUrl = "https://api.themoviedb.org/3/" + (mediaType === "tv" ? "tv" : "movie") + "/" + tmdbId + "?api_key=" + TMDB_API_KEY;

    fetch(tmdbUrl, { skipSizeCheck: true })
      .then(function(res) { return res.json(); })
      .then(function(mediaInfo) {
        animeTitle = mediaInfo.title || mediaInfo.name;
        console.log("[CinemaCity] TMDB title:", animeTitle);
        if (!animeTitle) {
          resolve([]);
          return Promise.reject("No title");
        }

        var searchUrl = MAIN_URL + "/?do=search&subaction=search&search_start=0&full_search=0&story=" + encodeURIComponent(animeTitle);
        console.log("[CinemaCity] Searching:", animeTitle);
        return fetchText(searchUrl);
      })
      .then(function(searchHtml) {
        if (!searchHtml) return null;

        var anchors = findAnchorsInHtml(searchHtml);
        var mediaUrl = null;

        for (var i = 0; i < anchors.length; i++) {
          var a = anchors[i];
          if (a.href.indexOf(".html") === -1) continue;
          var foundTitle = a.text.split("(")[0].trim();
          if (foundTitle.toLowerCase() === animeTitle.toLowerCase() ||
              foundTitle.toLowerCase().indexOf(animeTitle.toLowerCase()) !== -1 ||
              animeTitle.toLowerCase().indexOf(foundTitle.toLowerCase()) !== -1) {
            mediaUrl = a.href;
            if (mediaUrl.indexOf("http") !== 0) mediaUrl = MAIN_URL + mediaUrl;
            console.log("[CinemaCity] Found match:", foundTitle);
            console.log("[CinemaCity] URL:", mediaUrl);
            break;
          }
        }

        if (!mediaUrl) {
          console.log("[CinemaCity] No match in search, trying homepage...");
          return fetchText(MAIN_URL).then(function(homeHtml) {
            var homeAnchors = findAnchorsInHtml(homeHtml);
            for (var i = 0; i < homeAnchors.length; i++) {
              var a = homeAnchors[i];
              if (a.href.indexOf(".html") === -1) continue;
              var foundTitle = a.text.split("(")[0].trim();
              if (foundTitle.toLowerCase() === animeTitle.toLowerCase()) {
                mediaUrl = a.href;
                if (mediaUrl.indexOf("http") !== 0) mediaUrl = MAIN_URL + mediaUrl;
                console.log("[CinemaCity] Found on homepage:", foundTitle);
                break;
              }
            }
            return mediaUrl;
          });
        }
        return mediaUrl;
      })
      .then(function(mediaUrl) {
        if (!mediaUrl) {
          console.log("[CinemaCity] No media URL found");
          resolve([]);
          return Promise.reject("No URL");
        }
        return fetchText(mediaUrl);
      })
      .then(function(pageHtml) {
        if (!pageHtml) return;

        console.log("[CinemaCity] Extracting file data from scripts...");
        var scripts = findScriptsInHtml(pageHtml);
        console.log("[CinemaCity] Found", scripts.length, "script tags");

        var fileData = null;

        for (var i = 0; i < scripts.length; i++) {
          var html = scripts[i];
          if (!html || html.indexOf("atob") === -1) continue;

          var regex = /atob\s*\(\s*(["'])(.*?)\1\s*\)/g;
          var match;
          while ((match = regex.exec(html)) !== null) {
            var decoded = atobPolyfill(match[2]);
            if (!decoded || decoded.length < 10) continue;

            var rawFile = null;
            var mObj = decoded.match(/file\s*:\s*([\[{])/);
            if (mObj) {
              var openCh = mObj[1];
              var start = decoded.indexOf(openCh, mObj.index);
              rawFile = extractBalanced(decoded, start, openCh, openCh === "[" ? "]" : "}");
            }
            if (!rawFile) {
              var mStr = decoded.match(/file\s*:\s*(["'])((?:\\.|(?!\1)[\s\S])*)\1/s);
              if (mStr) rawFile = mStr[2];
            }

            if (rawFile && rawFile.length > 5) {
              if (rawFile.charAt(0) === "[" || rawFile.charAt(0) === "{") {
                try {
                  var unescaped = rawFile.replace(/\\(.)/g, "$1");
                  fileData = JSON.parse(unescaped);
                  console.log("[CinemaCity] Parsed file data as JSON (unescaped)");
                } catch (e) {
                  try {
                    fileData = JSON.parse(rawFile);
                    console.log("[CinemaCity] Parsed file data as JSON");
                  } catch (e2) {
                    fileData = rawFile;
                  }
                }
              } else {
                fileData = rawFile;
              }
              if (fileData) break;
            }
          }
          if (fileData) break;
        }

        if (!fileData) {
          console.log("[CinemaCity] No file data found");
          resolve([]);
          return;
        }

        var streams = [];
        var seenUrls = {};
        var addStream = function(url, title, quality, cls) {
          if (!url || url.indexOf("http") !== 0 || url.length < 15) return;
          if (seenUrls[url]) return;
          seenUrls[url] = 1;
          var tag = langLabel(cls);
          streams.push({
            name: tag ? "CinemaCity | " + tag : "CinemaCity",
            title: title + (tag ? " | " + tag : ""),
            url: url,
            quality: quality || extractQuality(url),
            headers: Object.assign({}, MOBILE_HEADERS, { Referer: "https://cinemacity.cc/" }),
            _rank: langRank(cls)
          });
        };

        // Turn one PlayerJS entry into stream row(s) (v4.2.0 logic + v5 label).
        var processStr = function(str, title, cls) {
          if (str.indexOf(".urlset/master.m3u8") !== -1) {
            // PlayerJS multi-file format: the CDN endpoint .urlset/master.m3u8
            // dynamically generates an HLS master playlist combining
            // video+audio+subs. Individual MP4s are demuxed tracks.
            addStream(str, title, "Auto", cls);
          } else if (str.indexOf("[") !== -1) {
            var urls = str.split(",");
            urls.forEach(function(u) {
              var m = u.match(/\[(.*?)\](.*)/);
              if (m) addStream(m[2], title, m[1], cls);
              else addStream(u, title, extractQuality(u), cls);
            });
          } else {
            addStream(str, title, extractQuality(str), cls);
          }
        };

        // v5: collect candidate entries (each carries a language class), then
        // emit in langRank order. Sub-only rows only if nothing else exists.
        var candidates = [];

        if (mediaType === "movie") {
          if (Array.isArray(fileData)) {
            fileData.forEach(function(item) {
              if (item && !item.folder && item.file) {
                candidates.push({ file: item.file, cls: classifyEntry(item) });
              }
            });
            if (!candidates.length && fileData.length > 0 && fileData[0] && fileData[0].file) {
              candidates.push({ file: fileData[0].file, cls: "unknown" });
            }
          } else if (typeof fileData === "string") {
            candidates.push({ file: fileData, cls: "unknown" });
          }
        } else {
          if (Array.isArray(fileData)) {
            var sLabel = "Season " + season;
            var sObj = null;
            for (var i = 0; i < fileData.length; i++) {
              var stitle = fileData[i].title || "";
              if (stitle.indexOf(sLabel) !== -1 || stitle.indexOf("S" + season) !== -1) {
                sObj = fileData[i];
                break;
              }
            }
            if (sObj && sObj.folder) {
              console.log("[CinemaCity] Found season with", sObj.folder.length, "episodes");
              var eLabel = "Episode " + episode;
              var eLabel2 = "Eps " + episode;
              var epEntries = [];
              for (var j = 0; j < sObj.folder.length; j++) {
                var etitle = sObj.folder[j].title || "";
                if (etitle.indexOf(eLabel) !== -1 || etitle.indexOf(eLabel2) !== -1 ||
                    etitle.indexOf("E" + episode) !== -1) {
                  epEntries.push(sObj.folder[j]);
                }
              }
              if (!epEntries.length) epEntries = [sObj.folder[episode - 1]];
              epEntries.forEach(function(eObj) {
                if (eObj && eObj.file) {
                  candidates.push({ file: eObj.file, cls: classifyEntry(eObj) });
                }
              });
            }
          }
        }

        if (!candidates.length) {
          console.log("[CinemaCity] No candidate entries");
          resolve([]);
          return;
        }

        candidates.forEach(function(c) {
          processStr(c.file, animeTitle + (mediaType === "tv" ? " S" + season + "E" + episode : ""), c.cls);
        });

        // Rank: english -> tagalog -> unknown -> other langs; "sub" only if empty.
        streams.sort(function(a, b) { return (a._rank || 8) - (b._rank || 8); });
        var keep = streams.filter(function(s) { return s._rank < 9; });
        if (!keep.length) keep = streams.filter(function(s) { return s._rank === 9; });
        keep.forEach(function(s) { delete s._rank; });

        console.log("[CinemaCity] Returning", keep.length, "streams (lang-ranked)");
        resolve(keep);
      })
      .catch(function(error) {
        console.error("[CinemaCity] Error:", error);
        resolve([]);
      });
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
  var PROVIDER = "cinemacity";
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
          if (typeof setTimeout === "function") {
            // nv best-settings 4.23.0: hard 12s cap on the whole provider run
            r = Promise.race([r, new Promise(function (res) {
              var dl = setTimeout(function () { res([]); }, 12000);
              if (dl && typeof dl.unref === "function") dl.unref();
            })]);
          }
          return r.then(function (v) { return finish(v); }, function () { return []; });
        }
        return finish(r);
      } catch (e) { return Promise.resolve([]); }
    };
  }
})();
