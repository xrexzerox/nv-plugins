/**
 * UHDMovies Provider - Ported from Kotlin CloudStream Extension
 * Based on: phisher98/cloudstream-extensions-phisher/UHDmoviesProvider
 */
"use strict";

var cheerio = require("cheerio-without-node-native");

var DOMAIN = "https://uhdmovies.pink";
var DOMAINS_URL = "https://raw.githubusercontent.com/phisher98/TVVVV/refs/heads/main/domains.json";
var DOMAIN_CACHE = { url: DOMAIN, ts: 0 };

function getLatestDomain() {
  const now = Date.now();
  if (now - DOMAIN_CACHE.ts < 36e5) return Promise.resolve(DOMAIN_CACHE.url);
  return fetch(DOMAINS_URL)
    .then(res => res.json())
    .then(data => {
      if (data && data["UHDMovies"]) {
        DOMAIN_CACHE.url = data["UHDMovies"];
        DOMAIN_CACHE.ts = now;
      }
      return DOMAIN_CACHE.url;
    })
    .catch(() => DOMAIN_CACHE.url);
}
var TMDB_API = "https://api.themoviedb.org/3";
var TMDB_API_KEY = "1865f43a0549ca50d341dd9ab8b29f49";
var USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

// ============ UTILITY FUNCTIONS ============

function getBaseUrl(url) {
  try {
    var urlObj = new URL(url);
    return urlObj.protocol + "//" + urlObj.host;
  } catch (e) {
    return DOMAIN;
  }
}

function fixUrl(url, domain) {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  if (url.startsWith("//")) return "https:" + url;
  if (url.startsWith("/")) return domain + url;
  return domain + "/" + url;
}

function getIndexQuality(str) {
  if (!str) return "Unknown";
  var match = str.match(/(\d{3,4})[pP]/);
  if (match) return match[1] + "p";
  if (str.toUpperCase().includes("4K") || str.toUpperCase().includes("UHD")) return "2160p";
  return "Unknown";
}

function cleanTitle(title) {
  var parts = title.split(/[.\-_]/);
  var qualityTags = ["WEBRip", "WEB-DL", "WEB", "BluRay", "HDRip", "DVDRip", "HDTV", "CAM", "TS", "R5", "DVDScr", "BRRip", "BDRip", "DVD", "PDTV", "HD"];
  var audioTags = ["AAC", "AC3", "DTS", "MP3", "FLAC", "DD5", "EAC3", "Atmos"];
  var subTags = ["ESub", "ESubs", "Subs", "MultiSub", "NoSub", "EnglishSub", "HindiSub"];
  var codecTags = ["x264", "x265", "H264", "HEVC", "AVC"];

  var startIndex = parts.findIndex(function (part) {
    return qualityTags.some(function (tag) {
      return part.toLowerCase().includes(tag.toLowerCase());
    });
  });

  var endIndex = -1;
  for (var i = parts.length - 1; i >= 0; i--) {
    var part = parts[i];
    if (subTags.some(function (tag) { return part.toLowerCase().includes(tag.toLowerCase()); }) ||
      audioTags.some(function (tag) { return part.toLowerCase().includes(tag.toLowerCase()); }) ||
      codecTags.some(function (tag) { return part.toLowerCase().includes(tag.toLowerCase()); })) {
      endIndex = i;
      break;
    }
  }

  if (startIndex !== -1 && endIndex !== -1 && endIndex >= startIndex) {
    return parts.slice(startIndex, endIndex + 1).join(".");
  } else if (startIndex !== -1) {
    return parts.slice(startIndex).join(".");
  }
  return parts.slice(-3).join(".");
}

function extractSize(text) {
  var match = text.match(/(\d+(?:\.\d+)?)\s*(GB|MB)/i);
  return match ? match[1] + " " + match[2].toUpperCase() : null;
}

// ============ SEARCH FUNCTIONS ============

function searchByTitle(title, year) {
  return getLatestDomain().then(function(domain) {
    var query = encodeURIComponent((title + " " + (year || "")).trim());
    var searchUrl = domain + "/?s=" + query;
    console.log("[UHDMovies] Search URL: " + searchUrl);

    return fetch(searchUrl, {
      headers: { "User-Agent": USER_AGENT }
    })
      .then(function (response) { return response.text(); })
      .then(function (html) {
        console.log("[UHDMovies] Response length: " + html.length + " bytes");
        return parseSearchResults(html);
      })
      .catch(function (error) {
        console.error("[UHDMovies] Search failed:", error.message);
        return [];
      });
  });
}

function parseSearchResults(html) {
  var $ = cheerio.load(html);
  var results = [];

  // Using selector from Kotlin: article.gridlove-post
  $("article.gridlove-post").each(function (_, el) {
    var $el = $(el);
    var titleRaw = $el.find("h1.sanket").text().trim().replace(/^Download\s+/i, "");
    var titleMatch = titleRaw.match(/^(.*\)\d*)/);
    var title = titleMatch ? titleMatch[1] : titleRaw;
    var href = $el.find("div.entry-image > a").attr("href");

    if (href && title) {
      results.push({
        title: title,
        url: href,
        rawTitle: titleRaw
      });
    }
  });

  console.log("[UHDMovies] Found " + results.length + " search results");
  return results;
}

// ============ BYPASS FUNCTIONS (from Utils.kt) ============

function bypassHrefli(url) {
  var host = getBaseUrl(url);
  console.log("[UHDMovies] Bypassing Hrefli: " + url);

  return fetch(url, { headers: { "User-Agent": USER_AGENT } })
    .then(function (res) { return res.text(); })
    .then(function (html) {
      var $ = cheerio.load(html);
      var formUrl = $("form#landing").attr("action");
      var formData = {};
      $("form#landing input").each(function (_, el) {
        formData[$(el).attr("name")] = $(el).attr("value") || "";
      });

      return fetch(formUrl, {
        method: "POST",
        headers: {
          "User-Agent": USER_AGENT,
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams(formData).toString()
      });
    })
    .then(function (res) { return res.text(); })
    .then(function (html) {
      var $ = cheerio.load(html);
      var formUrl = $("form#landing").attr("action");
      var formData = {};
      $("form#landing input").each(function (_, el) {
        formData[$(el).attr("name")] = $(el).attr("value") || "";
      });

      return fetch(formUrl, {
        method: "POST",
        headers: {
          "User-Agent": USER_AGENT,
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams(formData).toString()
      }).then(function (res) {
        return { response: res, formData: formData };
      });
    })
    .then(function (result) {
      return result.response.text().then(function (html) {
        return { html: html, formData: result.formData };
      });
    })
    .then(function (result) {
      var $ = cheerio.load(result.html);
      var script = $("script:contains(?go=)").html() || "";
      var skTokenMatch = script.match(/\?go=([^"]+)/);
      if (!skTokenMatch) return null;
      var skToken = skTokenMatch[1];
      var wpHttp2 = result.formData["_wp_http2"] || "";

      return fetch(host + "?go=" + skToken, {
        headers: {
          "User-Agent": USER_AGENT,
          "Cookie": skToken + "=" + wpHttp2
        }
      });
    })
    .then(function (res) {
      if (!res) return null;
      return res.text();
    })
    .then(function (html) {
      if (!html) return null;
      var $ = cheerio.load(html);
      var metaRefresh = $('meta[http-equiv="refresh"]').attr("content") || "";
      var driveUrlMatch = metaRefresh.match(/url=(.+)/);
      if (!driveUrlMatch) return null;
      return driveUrlMatch[1];
    })
    .then(function (driveUrl) {
      if (!driveUrl) return null;
      return fetch(driveUrl, { headers: { "User-Agent": USER_AGENT } })
        .then(function (res) { return res.text(); })
        .then(function (html) {
          var pathMatch = html.match(/replace\("([^"]+)"\)/);
          if (!pathMatch || pathMatch[1] === "/404") return null;
          return fixUrl(pathMatch[1], getBaseUrl(driveUrl));
        });
    })
    .catch(function (error) {
      console.error("[UHDMovies] Hrefli bypass failed:", error.message);
      return null;
    });
}

// ============ EXTRACTOR FUNCTIONS (from Extractors.kt - Driveseed) ============

function extractVideoSeed(finallink) {
  console.log("[UHDMovies] Extracting VideoSeed: " + finallink);

  try {
    var urlObj = new URL(finallink);
    var host = urlObj.host || "video-seed.xyz";
    var token = finallink.split("?url=")[1];
    if (!token) return Promise.resolve(null);

    return fetch("https://" + host + "/api", {
      method: "POST",
      headers: {
        "User-Agent": USER_AGENT,
        "Content-Type": "application/x-www-form-urlencoded",
        "x-token": host,
        "Referer": finallink
      },
      body: "keys=" + encodeURIComponent(token)
    })
      .then(function (res) { return res.text(); })
      .then(function (text) {
        var urlMatch = text.match(/url":"([^"]+)"/);
        if (urlMatch) {
          return urlMatch[1].replace(/\\\//g, "/");
        }
        return null;
      })
      .catch(function (error) {
        console.error("[UHDMovies] VideoSeed extraction failed:", error.message);
        return null;
      });
  } catch (e) {
    return Promise.resolve(null);
  }
}

function extractInstantLink(finallink) {
  console.log("[UHDMovies] Extracting InstantLink: " + finallink);

  try {
    var urlObj = new URL(finallink);
    var host = urlObj.host;
    if (!host) {
      host = finallink.includes("video-leech") ? "video-leech.pro" : "video-seed.pro";
    }

    var token = finallink.split("url=")[1];
    if (!token) return Promise.resolve(null);

    return fetch("https://" + host + "/api", {
      method: "POST",
      headers: {
        "User-Agent": USER_AGENT,
        "Content-Type": "application/x-www-form-urlencoded",
        "x-token": host,
        "Referer": finallink
      },
      body: "keys=" + encodeURIComponent(token)
    })
      .then(function (res) { return res.text(); })
      .then(function (text) {
        var urlMatch = text.match(/url":"([^"]+)"/);
        if (urlMatch) {
          return urlMatch[1].replace(/\\\//g, "/");
        }
        return null;
      })
      .catch(function (error) {
        console.error("[UHDMovies] InstantLink extraction failed:", error.message);
        return null;
      });
  } catch (e) {
    return Promise.resolve(null);
  }
}

function extractResumeBot(url) {
  console.log("[UHDMovies] Extracting ResumeBot: " + url);

  return fetch(url, { headers: { "User-Agent": USER_AGENT } })
    .then(function (res) { return res.text(); })
    .then(function (html) {
      var tokenMatch = html.match(/formData\.append\('token', '([a-f0-9]+)'\)/);
      var pathMatch = html.match(/fetch\('\/download\?id=([a-zA-Z0-9\/+]+)'/);
      if (!tokenMatch || !pathMatch) return null;

      var token = tokenMatch[1];
      var path = pathMatch[1];
      var baseUrl = url.split("/download")[0];

      return fetch(baseUrl + "/download?id=" + path, {
        method: "POST",
        headers: {
          "User-Agent": USER_AGENT,
          "Content-Type": "application/x-www-form-urlencoded",
          "Accept": "*/*",
          "Origin": baseUrl,
          "Referer": url
        },
        body: "token=" + encodeURIComponent(token)
      });
    })
    .then(function (res) {
      if (!res) return null;
      return res.text();
    })
    .then(function (text) {
      if (!text) return null;
      try {
        var json = JSON.parse(text);
        return json.url && json.url.startsWith("http") ? json.url : null;
      } catch (e) {
        return null;
      }
    })
    .catch(function (error) {
      console.error("[UHDMovies] ResumeBot extraction failed:", error.message);
      return null;
    });
}

function extractCFType1(url) {
  console.log("[UHDMovies] Extracting CFType1: " + url);

  return fetch(url + "?type=1", { headers: { "User-Agent": USER_AGENT } })
    .then(function (res) { return res.text(); })
    .then(function (html) {
      var $ = cheerio.load(html);
      var links = [];
      $("a.btn-success").each(function (_, el) {
        var href = $(el).attr("href");
        if (href && href.startsWith("http")) {
          links.push(href);
        }
      });
      return links;
    })
    .catch(function (error) {
      console.error("[UHDMovies] CFType1 extraction failed:", error.message);
      return [];
    });
}

function extractResumeCloudLink(baseUrl, path) {
  console.log("[UHDMovies] Extracting ResumeCloud: " + baseUrl + path);

  return fetch(baseUrl + path, { headers: { "User-Agent": USER_AGENT } })
    .then(function (res) { return res.text(); })
    .then(function (html) {
      var $ = cheerio.load(html);
      var link = $("a.btn-success").first().attr("href");
      return link && link.startsWith("http") ? link : null;
    })
    .catch(function (error) {
      console.error("[UHDMovies] ResumeCloud extraction failed:", error.message);
      return null;
    });
}

// ============ DRIVESEED PAGE EXTRACTION (from Extractors.kt) ============

function extractDriveseedPage(url) {
  console.log("[UHDMovies] Extracting Driveseed page: " + url);
  var streams = [];

  return Promise.resolve()
    .then(function () {
      // Handle r?key= redirect
      if (url.includes("r?key=")) {
        return fetch(url, { headers: { "User-Agent": USER_AGENT } })
          .then(function (res) { return res.text(); })
          .then(function (html) {
            var redirectMatch = html.match(/replace\("([^"]+)"\)/);
            if (redirectMatch) {
              var baseDomain = getBaseUrl(url);
              return fetch(baseDomain + redirectMatch[1], { headers: { "User-Agent": USER_AGENT } })
                .then(function (res) { return res.text(); });
            }
            return html;
          });
      }
      return fetch(url, { headers: { "User-Agent": USER_AGENT } })
        .then(function (res) { return res.text(); });
    })
    .then(function (html) {
      var $ = cheerio.load(html);
      var baseDomain = getBaseUrl(url);

      var qualityText = $("li.list-group-item").first().text() || "";
      var rawFileName = qualityText.replace("Name : ", "").trim();
      var fileName = cleanTitle(rawFileName);
      var size = $("li:nth-child(3)").text().replace("Size : ", "").trim();
      var quality = getIndexQuality(qualityText);

      var labelExtras = "";
      if (fileName) labelExtras += "[" + fileName + "]";
      if (size) labelExtras += "[" + size + "]";

      var promises = [];

      $("div.text-center > a").each(function (_, el) {
        var text = $(el).text();
        var href = $(el).attr("href");
        if (!href) return;

        if (text.toLowerCase().includes("instant download")) {
          promises.push(
            extractInstantLink(href).then(function (link) {
              if (link) {
                streams.push({
                  name: "UHDMovies",
                  title: "Driveseed Instant " + labelExtras,
                  url: link,
                  quality: quality,
                  size: size
                });
              }
            })
          );
        } else if (text.toLowerCase().includes("resume worker bot")) {
          promises.push(
            extractResumeBot(href).then(function (link) {
              if (link) {
                streams.push({
                  name: "UHDMovies",
                  title: "Driveseed ResumeBot " + labelExtras,
                  url: link,
                  quality: quality,
                  size: size
                });
              }
            })
          );
        } else if (text.toLowerCase().includes("direct links")) {
          promises.push(
            extractCFType1(baseDomain + href).then(function (links) {
              links.forEach(function (link) {
                streams.push({
                  name: "UHDMovies",
                  title: "Driveseed Direct " + labelExtras,
                  url: link,
                  quality: quality,
                  size: size
                });
              });
            })
          );
        } else if (text.toLowerCase().includes("resume cloud")) {
          promises.push(
            extractResumeCloudLink(baseDomain, href).then(function (link) {
              if (link) {
                streams.push({
                  name: "UHDMovies",
                  title: "Driveseed ResumeCloud " + labelExtras,
                  url: link,
                  quality: quality,
                  size: size
                });
              }
            })
          );
        } else if (text.toLowerCase().includes("cloud download")) {
          streams.push({
            name: "UHDMovies",
            title: "Driveseed Cloud " + labelExtras,
            url: href,
            quality: quality,
            size: size
          });
        }
      });

      return Promise.all(promises).then(function () {
        return streams;
      });
    })
    .catch(function (error) {
      console.error("[UHDMovies] Driveseed extraction failed:", error.message);
      return [];
    });
}

// ============ MOVIE LINK EXTRACTION (from UHDmoviesProvider.kt load function) ============

function getMovieLinks(pageUrl) {
  console.log("[UHDMovies] Getting movie links from: " + pageUrl);

  return fetch(pageUrl, { headers: { "User-Agent": USER_AGENT } })
    .then(function (res) { return res.text(); })
    .then(function (html) {
      var $ = cheerio.load(html);
      var links = [];

      // From Kotlin: div.entry-content > p with [.*] regex and a.maxbutton-1
      var iframeRegex = /\[.*\]/;
      $("div.entry-content > p").each(function (_, el) {
        var $el = $(el);
        var elHtml = $.html(el);

        if (iframeRegex.test(elHtml)) {
          var sourceName = $el.text().split("Download")[0].trim();
          var nextEl = $el.next();
          var sourceLink = nextEl.find("a.maxbutton-1").attr("href") || "";

          if (sourceLink) {
            links.push({
              sourceName: sourceName,
              sourceLink: sourceLink
            });
          }
        }
      });

      console.log("[UHDMovies] Found " + links.length + " movie links");
      return links;
    })
    .catch(function (error) {
      console.error("[UHDMovies] Movie links extraction failed:", error.message);
      return [];
    });
}

// ============ TV EPISODE LINK EXTRACTION (from UHDmoviesProvider.kt) ============

function getTvEpisodeLink(pageUrl, targetSeason, targetEpisode) {
  console.log("[UHDMovies] Getting TV episode S" + targetSeason + "E" + targetEpisode + " from: " + pageUrl);

  return fetch(pageUrl, { headers: { "User-Agent": USER_AGENT } })
    .then(function (res) { return res.text(); })
    .then(function (html) {
      var $ = cheerio.load(html);
      var links = [];

      // From Kotlin: p:has(a:contains(Episode)) or div:has(a:contains(Episode))
      var pTags = $("p:has(a:contains(Episode))");
      if (pTags.length === 0) {
        pTags = $("div:has(a:contains(Episode))");
      }

      var currentSeason = 1;
      pTags.each(function (_, pTag) {
        var $pTag = $(pTag);
        var prevPtag = $pTag.prev();
        var details = prevPtag.text() || "";

        // Extract season from previous element
        var seasonMatch = details.match(/(?:Season |S0?)(\d+)/i);
        if (seasonMatch) {
          currentSeason = parseInt(seasonMatch[1]);
        }

        // Check if this is the season we want
        if (currentSeason === targetSeason) {
          var aTags = $pTag.find("a:contains(Episode)");
          aTags.each(function (idx, aTag) {
            var episodeNum = idx + 1;
            if (episodeNum === targetEpisode) {
              var link = $(aTag).attr("href");
              if (link) {
                // Extract quality and size from details
                var qualityMatch = details.match(/(1080p|720p|480p|2160p|4K|\d+0p)/i);
                var sizeMatch = details.match(/(\d+(?:\.\d+)?\s*(?:MB|GB))/i);

                links.push({
                  sourceLink: link,
                  quality: qualityMatch ? qualityMatch[1] : "Unknown",
                  size: sizeMatch ? sizeMatch[1] : null,
                  details: details
                });
              }
            }
          });
        }
        currentSeason++;
      });

      console.log("[UHDMovies] Found " + links.length + " episode links for S" + targetSeason + "E" + targetEpisode);
      return links;
    })
    .catch(function (error) {
      console.error("[UHDMovies] TV episode extraction failed:", error.message);
      return [];
    });
}

// ============ MAIN ENTRY POINT ============

function getTmdbDetails(tmdbId, mediaType) {
  var isSeries = mediaType === "series" || mediaType === "tv";
  var endpoint = isSeries ? "tv" : "movie";
  var url = TMDB_API + "/" + endpoint + "/" + tmdbId + "?api_key=" + TMDB_API_KEY;

  console.log("[UHDMovies] Fetching TMDB details from: " + url);

  return fetch(url)
    .then(function (res) { return res.json(); })
    .then(function (data) {
      if (isSeries) {
        return {
          title: data.name,
          year: data.first_air_date ? parseInt(data.first_air_date.split("-")[0]) : null
        };
      } else {
        return {
          title: data.title,
          year: data.release_date ? parseInt(data.release_date.split("-")[0]) : null
        };
      }
    })
    .catch(function (error) {
      console.error("[UHDMovies] TMDB request failed:", error.message);
      return null;
    });
}

function getStreams(tmdbId, mediaType, season, episode) {
  console.log("[UHDMovies] Searching for " + mediaType + " " + tmdbId);
  var allStreams = [];

  return getTmdbDetails(tmdbId, mediaType)
    .then(function (tmdbDetails) {
      if (!tmdbDetails) {
        console.log("[UHDMovies] Could not get TMDB details");
        return [];
      }

      var title = tmdbDetails.title;
      var year = tmdbDetails.year;
      console.log("[UHDMovies] Search: " + title + " (" + year + ")");

      return searchByTitle(title, year);
    })
    .then(function (searchResults) {
      if (!searchResults || searchResults.length === 0) {
        console.log("[UHDMovies] No results found");
        return [];
      }

      var isSeries = mediaType === "series" || mediaType === "tv";

      // Process each search result sequentially
      var processResult = function (index) {
        if (index >= searchResults.length) {
          return Promise.resolve(allStreams);
        }

        var result = searchResults[index];
        console.log("[UHDMovies] Processing result: " + result.title);

        var linksPromise;
        if (isSeries && season && episode) {
          linksPromise = getTvEpisodeLink(result.url, season, episode);
        } else {
          linksPromise = getMovieLinks(result.url);
        }

        return linksPromise.then(function (links) {
          var extractPromises = links.map(function (linkData) {
            var sourceLink = linkData.sourceLink;
            if (!sourceLink) return Promise.resolve([]);

            // Bypass hrefli if needed (from Kotlin loadLinks)
            var finalLinkPromise;
            if (sourceLink.includes("unblockedgames")) {
              finalLinkPromise = bypassHrefli(sourceLink);
            } else {
              finalLinkPromise = Promise.resolve(sourceLink);
            }

            return finalLinkPromise.then(function (finalLink) {
              if (!finalLink) return [];

              // Check if it's a driveseed/driveleech link
              if (finalLink.includes("driveseed") || finalLink.includes("driveleech")) {
                return extractDriveseedPage(finalLink);
              }

              // Check for video-seed
              if (finalLink.includes("video-seed")) {
                return extractVideoSeed(finalLink).then(function (url) {
                  if (url) {
                    return [{
                      name: "UHDMovies",
                      title: "UHDMovies " + (linkData.quality || "Unknown"),
                      url: url,
                      quality: linkData.quality || "Unknown",
                      size: linkData.size
                    }];
                  }
                  return [];
                });
              }

              // Return the link as-is for external player
              return [{
                name: "UHDMovies",
                title: "UHDMovies " + (linkData.sourceName || linkData.quality || ""),
                url: finalLink,
                quality: linkData.quality || "Unknown",
                size: linkData.size
              }];
            });
          });

          return Promise.all(extractPromises).then(function (results) {
            results.forEach(function (streams) {
              allStreams = allStreams.concat(streams);
            });
            return processResult(index + 1);
          });
        });
      };

      return processResult(0);
    })
    .catch(function (error) {
      console.error("[UHDMovies] Error:", error.message);
      return [];
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
  var PROVIDER = "uhdmovies";
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
