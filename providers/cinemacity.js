// cinemacity.js v4.2.0
// v4.2.0: optional worker-relay lane. The site sits behind a Cloudflare
// managed challenge that challenges some IPs (notably datacenter egress) no
// matter the identity; the asian-catalog worker relay (v3.1.0+) fetches with
// worker-grade HTTP and base64-wraps the reply, so text-only device runtimes
// and challenged clients get a second path. Direct lanes stay primary.
// v4.1.0: the site sits behind a Cloudflare managed challenge. The old fetch
// ignored response codes, so a challenge page was parsed as if it were real
// markup ("Found 0 script tags" / no anchors). Now: challenge/403 detection,
// automatic retry with a mobile browser identity (mobile IPs are rarely
// challenged), and clean fail-soft so other providers still load.
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

function relayBase() {
  try {
    var s = globalThis.SCRAPER_SETTINGS || {};
    var raw = String(s.workerRelay || s.cinemacityRelay || "").trim().replace(/\/+$/, "");
    return raw && /^https?:\/\//i.test(raw) ? raw : "";
  } catch (e) {
    return "";
  }
}

function relayGetText(url, headers) {
  var base = relayBase();
  if (!base)
    return Promise.resolve("");
  return fetch(base + "/relay", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ url: url, method: "GET", headers: headers || {} })
  }).then(function (r) {
    if (!r || !r.ok)
      return "";
    return r.json();
  }).then(function (j) {
    if (!j || !j.ok || !j.bodyB64)
      return "";
    try {
      var norm = String(j.bodyB64).replace(/-/g, "+").replace(/_/g, "/").replace(/[^A-Za-z0-9+/=]/g, "");
      while (norm.length % 4) norm += "=";
      return typeof atob === "function" ? atob(norm) : "";
    } catch (e) {
      return "";
    }
  }).catch(function () {
    return "";
  });
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
    return fetchOnce(url, MOBILE_HEADERS);
  }).catch(function(err2) {
    console.log("[CinemaCity] retry failed too (" + err2.message + "), trying worker relay...");
    return relayGetText(url, options.headers || MOBILE_HEADERS).then(function(relayed) {
      if (relayed && !looksLikeChallenge(relayed))
        return relayed;
      console.log("[CinemaCity] relay empty or challenged too");
      return ""; // empty keeps the old fail-soft flow (callers treat falsy as no-data)
    });
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
// arrays — the old lazy regex /\[.*?\]/ truncated at the inner "]",
// JSON.parse always died and TV silently returned zero streams (the
// long-standing "not working" bug).
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
        var addStream = function(url, title, quality) {
          if (!url || url.indexOf("http") !== 0 || url.length < 15) return;
          streams.push({
            name: "CinemaCity",
            title: title,
            url: url,
            quality: quality || extractQuality(url),
            headers: Object.assign({}, MOBILE_HEADERS, { Referer: "https://cinemacity.cc/" })
          });
        };

        var processStr = function(str, title) {
          console.log("[CinemaCity] Processing file string, length:", str.length);

          if (str.indexOf(".urlset/master.m3u8") !== -1) {
            // PlayerJS multi-file format: the CDN endpoint .urlset/master.m3u8
            // dynamically generates an HLS master playlist combining video+audio+subs.
            // The individual MP4s in the string are demuxed tracks (video-only, no audio).
            // Only the HLS master URL produces a properly playable stream.
            addStream(str, title, "Auto");
            console.log("[CinemaCity] Added HLS Auto stream");
          } else if (str.indexOf("[") !== -1) {
            // Quality-labeled direct URLs: [360p]url1,[720p]url2
            var urls = str.split(",");
            urls.forEach(function(u) {
              var m = u.match(/\[(.*?)\](.*)/);
              if (m) addStream(m[2], title, m[1]);
              else addStream(u, title, extractQuality(u));
            });
          } else {
            // Single direct URL
            addStream(str, title, extractQuality(str));
          }
          console.log("[CinemaCity] Returning", streams.length, "streams");
        };

        if (mediaType === "movie") {
          if (Array.isArray(fileData)) {
            var obj = null;
            for (var i = 0; i < fileData.length; i++) {
              if (!fileData[i].folder && fileData[i].file) {
                obj = fileData[i];
                break;
              }
            }
            if (!obj && fileData.length > 0) obj = fileData[0];
            if (obj && obj.file) {
              console.log("[CinemaCity] File data is array with", fileData.length, "items");
              processStr(obj.file, animeTitle);
            }
          } else if (typeof fileData === "string") {
            processStr(fileData, animeTitle);
          }
        } else {
          if (Array.isArray(fileData)) {
            console.log("[CinemaCity] TV file data has", fileData.length, "items");
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
              var eObj = null;
              for (var j = 0; j < sObj.folder.length; j++) {
                var etitle = sObj.folder[j].title || "";
                if (etitle.indexOf(eLabel) !== -1 || etitle.indexOf("E" + episode) !== -1) {
                  eObj = sObj.folder[j];
                  break;
                }
              }
              if (eObj && eObj.file) {
                console.log("[CinemaCity] Found episode file");
                processStr(eObj.file, animeTitle + " S" + season + "E" + episode);
              }
            }
          }
        }

        resolve(streams);
      })
      .catch(function(error) {
        console.error("[CinemaCity] Error:", error);
        resolve([]);
      });
  });
}

module.exports = {
  getStreams,
  // test hooks (offline regression suite)
  _test: {
    looksLikeChallenge: looksLikeChallenge,
    relayBase: relayBase,
    atobPolyfill: atobPolyfill,
    extractBalanced: extractBalanced
  }
};
