// animepahe.js v5.0.0
// v5.0.0 fixes ("not working" on device):
//  1. The third-party proxy worker (animepaheproxy.phisheranimepahe.workers.dev)
//     is now dead — every request 403s through Cloudflare. ALL site requests
//     were routed through it, so the provider returned nothing anywhere.
//     Now: DIRECT fetch first (animepahe.pw is reachable from residential
//     devices), proxy only as fallback.
//  2. The MAL id-mapping API (id-mapping-api-malid.hf.space) returns
//     "Meta not found" for many valid IMDb ids. Fallback: resolve the MAL id
//     via a Jikan title search using the TMDB title.
var MAIN_URL = "https://animepahe.pw";
var PROXY_URL = "https://animepaheproxy.phisheranimepahe.workers.dev/?url=";
var HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36",
  "Cookie": "__ddg2_=1234567890",
  "Referer": "https://animepahe.pw/"
};
var TMDB_API_KEY = "1865f43a0549ca50d341dd9ab8b29f49";

function fetchText(url, options) {
  options = options || {};
  var finalUrl = url.indexOf("http") === 0 ? url : MAIN_URL + url;
  var fetchOpts = {
    headers: options.headers || HEADERS,
    skipSizeCheck: true
  };

  var direct = function () {
    return fetch(finalUrl, fetchOpts).then(function (response) {
      if (!response.ok) throw new Error("HTTP " + response.status + " on " + finalUrl);
      return response.text();
    });
  };
  var viaProxy = function () {
    var targetUrl = PROXY_URL + encodeURIComponent(finalUrl);
    return fetch(targetUrl, fetchOpts).then(function (response) {
      if (!response.ok) throw new Error("HTTP " + response.status + " (proxy) on " + finalUrl);
      return response.text();
    });
  };

  // useProxy === false means direct-only (kwik pages must be fetched from the
  // device itself so the CDN sees a consistent client)
  if (options.useProxy === false) return direct();

  return direct().catch(function (err) {
    console.log("[AnimePahe] direct failed (" + err.message + "), trying proxy fallback");
    return viaProxy();
  });
}

function fetchJson(url, options) {
  return fetchText(url, options).then(function(text) {
    return JSON.parse(text);
  });
}

function getImdbId(tmdbId, mediaType) {
  var url = "https://api.themoviedb.org/3/" + (mediaType === "tv" ? "tv" : "movie") + "/" + tmdbId + "/external_ids?api_key=" + TMDB_API_KEY;
  return fetch(url, { skipSizeCheck: true })
    .then(function(res) { return res.json(); })
    .then(function(data) { return data.imdb_id; })
    .catch(function() { return null; });
}

function resolveMapping(imdbId, season, episode) {
  var url = "https://id-mapping-api-malid.hf.space/api/resolve?id=" + imdbId + "&s=" + season + "&e=" + episode;
  return fetch(url, { skipSizeCheck: true })
    .then(function(res) {
      if (!res.ok) return null;
      return res.json();
    })
    .catch(function() { return null; });
}

function getMalTitle(malId) {
  return fetch("https://api.jikan.moe/v4/anime/" + malId, { skipSizeCheck: true })
    .then(function(res) {
      if (!res.ok) return null;
      return res.json();
    })
    .then(function(data) {
      return data.data ? data.data.title : null;
    })
    .catch(function() { return null; });
}

function normalizeTitle(t) {
  return String(t || "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function fetchTmdbTvTitle(tmdbId) {
  var url = "https://api.themoviedb.org/3/tv/" + tmdbId + "?api_key=" + TMDB_API_KEY;
  return fetch(url, { skipSizeCheck: true })
    .then(function(r) { return r.ok ? r.json() : null; })
    .then(function(d) { return d ? (d.name || d.original_name) : null; })
    .catch(function() { return null; });
}

// The id-mapping API misses many ids — resolve the MAL entry by searching
// Jikan with the TMDB title instead. Episode numbers align when the TMDB
// entry and MAL entry describe the same show (the common case).
function getMalInfoFallback(title) {
  var url = "https://api.jikan.moe/v4/anime?q=" + encodeURIComponent(title) + "&limit=5";
  return fetch(url, { skipSizeCheck: true })
    .then(function(res) { return res.ok ? res.json() : null; })
    .then(function(data) {
      var list = (data && data.data) || [];
      if (!list.length) return null;
      var nq = normalizeTitle(title);
      var best = null;
      for (var i = 0; i < list.length; i++) {
        var cand = list[i];
        var names = [cand.title, cand.title_english].filter(Boolean);
        var matched = false;
        for (var j = 0; j < names.length; j++) {
          var nt = normalizeTitle(names[j]);
          if (nt === nq || (nt.indexOf(nq) !== -1) || (nq.indexOf(nt) !== -1)) {
            matched = true;
            break;
          }
        }
        if (matched) { best = cand; break; }
      }
      return best ? { mal_id: best.mal_id, title: best.title } : null;
    })
    .catch(function() { return null; });
}

function searchAnime(query) {
  var url = "/api?m=search&l=8&q=" + encodeURIComponent(query);
  return fetchJson(url);
}

function extractQuality(text) {
  var match = text.match(/(\d{3,4}p)/);
  return match ? match[1] : "720p";
}

function unpack(code) {
  try {
    var match = code.match(/}\((['"])([\s\S]*?)\1,\s*(\d+),\s*(\d+),\s*(['"])([\s\S]*?)\5\.split\((['"])\|\7\)/);
    if (match) {
      var p = match[2];
      var a = parseInt(match[3]);
      var c = parseInt(match[4]);
      var kStr = match[6];
      p = p.replace(/\\'/g, "'").replace(/\\"/g, '"').replace(/\\\\/g, "\\");
      var k = kStr.split("|");
      var e = function(c2) {
        return (c2 < a ? "" : e(parseInt(c2 / a))) + ((c2 = c2 % a) > 35 ? String.fromCharCode(c2 + 29) : c2.toString(36));
      };
      var d = {};
      while (c--) {
        d[e(c)] = k[c] || e(c);
      }
      return p.replace(/\b\w+\b/g, function(w) {
        return d[w];
      });
    }
  } catch (e) {
    console.error("[AnimePahe] Unpack error:", e.message);
  }
  return code;
}

function extractKwik(url) {
  return fetchText(url, {
    headers: Object.assign({}, HEADERS, {
      "Referer": url,
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }),
    useProxy: false
  }).then(function(html) {
    var scripts = html.match(/<script[^>]*>([\s\S]*?)<\/script>/g) || [];
    var matches = [];
    for (var i = 0; i < scripts.length; i++) {
      var script = scripts[i];
      if (script.indexOf("eval(function(p,a,c,k,e,d)") !== -1) {
        var pos = 0;
        while (true) {
          var start = script.indexOf("eval(function(p,a,c,k,e,d)", pos);
          if (start === -1) break;
          var end = script.indexOf(".split('|')", start);
          if (end === -1) break;
          var closeParen = script.indexOf("))", end);
          if (closeParen === -1) break;
          matches.push(script.substring(start, closeParen + 2));
          pos = closeParen + 2;
        }
      }
    }
    for (var j = 0; j < matches.length; j++) {
      var unpacked = unpack(matches[j]);
      var urlMatch = unpacked.match(/source\s*=\s*["'](https?:\/\/.*?)["']/) ||
                     unpacked.match(/const\s+source\s*=\s*["'](https?:\/\/.*?)["']/) ||
                     unpacked.match(/var\s+source\s*=\s*["'](https?:\/\/.*?)["']/) ||
                     unpacked.match(/src\s*:\s*["'](https?:\/\/.*?)["']/);
      if (urlMatch) {
        return {
          url: urlMatch[1],
          headers: {
            "Referer": "https://kwik.cx/",
            "Origin": "https://kwik.cx",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
          }
        };
      }
    }
    return null;
  }).catch(function(e) {
    console.error("[AnimePahe] Kwik extraction failed:", e.message);
    return null;
  });
}

function parseResolutionButtons(html) {
  var streams = [];
  var regex = /<button[^>]*data-src=["']([^"']+)["'][^>]*>([\s\S]*?)<\/button>/gi;
  var match;
  while ((match = regex.exec(html)) !== null) {
    var kwikUrl = match[1];
    var btnText = match[2].replace(/<[^>]*>/g, "").trim();
    if (kwikUrl && kwikUrl.indexOf("kwik") !== -1) {
      var quality = extractQuality(btnText);
      var type = btnText.toLowerCase().indexOf("eng") !== -1 ? "Dub" : "Sub";
      streams.push({
        kwikUrl: kwikUrl,
        quality: quality,
        type: type,
        name: "AnimePahe (" + quality + " " + type + ")"
      });
    }
  }
  return streams;
}

function getStreams(tmdbId, mediaType, season, episode) {
  console.log("[AnimePahe] Starting for TMDB ID:", tmdbId, "Type:", mediaType);
  return new Promise(function(resolve, reject) {
    var animeSession = null;
    var animeTitle = "";
    var mappedEp = episode;
    var targetMalId = null;

    if (mediaType === "tv") {
      getImdbId(tmdbId, mediaType)
        .then(function(imdbId) {
          console.log("[AnimePahe] IMDB ID:", imdbId);
          if (!imdbId) {
            resolve([]);
            return Promise.reject("No IMDB");
          }
          return resolveMapping(imdbId, season, episode);
        })
        .then(function(mapping) {
          console.log("[AnimePahe] MAL mapping:", mapping);
          if (mapping && mapping.mal_id) {
            targetMalId = mapping.mal_id;
            mappedEp = mapping.mal_episode || episode;
            return getMalTitle(targetMalId);
          }
          // Fallback: mapping API misses many IMDb ids — resolve via Jikan
          // title search using the TMDB title.
          console.log("[AnimePahe] Mapping failed, using Jikan title-search fallback");
          return fetchTmdbTvTitle(tmdbId).then(function(tvTitle) {
            if (!tvTitle) return null;
            return getMalInfoFallback(tvTitle).then(function(info) {
              if (info) {
                targetMalId = info.mal_id;
                mappedEp = episode; // same show -> episode numbers align
                console.log("[AnimePahe] Jikan fallback MAL:", targetMalId, info.title);
                return info.title;
              }
              return null;
            });
          });
        })
        .then(function(title) {
          animeTitle = title;
          console.log("[AnimePahe] MAL title:", animeTitle);
          if (!animeTitle) {
            resolve([]);
            return Promise.reject("No MAL title");
          }
          return searchAnime(animeTitle);
        })
        .then(function(searchResults) {
          console.log("[AnimePahe] Search results:", searchResults.data ? searchResults.data.length : 0);
          if (searchResults.data && searchResults.data.length > 0) {
            var checkNext = function(idx) {
              if (idx >= Math.min(searchResults.data.length, 3)) {
                return Promise.resolve();
              }
              var item = searchResults.data[idx];
              return fetchText("/anime/" + item.session).then(function(pageHtml) {
                if (pageHtml.indexOf("myanimelist.net/anime/" + targetMalId) !== -1) {
                  animeSession = item.session;
                  console.log("[AnimePahe] Found session:", animeSession);
                  return Promise.resolve();
                }
                return checkNext(idx + 1);
              });
            };
            return checkNext(0);
          }
          return Promise.resolve();
        })
        .then(function() {
          return proceedToEpisodes();
        })
        .catch(function(err) {
          console.error("[AnimePahe] TV error:", err);
          resolve([]);
        });
    } else {
      var tmdbUrl = "https://api.themoviedb.org/3/movie/" + tmdbId + "?api_key=" + TMDB_API_KEY;
      fetch(tmdbUrl, { skipSizeCheck: true })
        .then(function(res) { return res.json(); })
        .then(function(tmdbData) {
          animeTitle = tmdbData.title || tmdbData.original_title;
          mappedEp = 1;
          console.log("[AnimePahe] Movie title:", animeTitle);
          if (!animeTitle) {
            resolve([]);
            return Promise.reject("No title");
          }
          return searchAnime(animeTitle);
        })
        .then(function(searchResults) {
          console.log("[AnimePahe] Search results:", searchResults.data ? searchResults.data.length : 0);
          if (searchResults.data && searchResults.data.length > 0) {
            var firstResult = searchResults.data[0];
            if (firstResult.title.toLowerCase() === animeTitle.toLowerCase()) {
              animeSession = firstResult.session;
              console.log("[AnimePahe] Found session:", animeSession);
            }
          }
          return proceedToEpisodes();
        })
        .catch(function(err) {
          console.error("[AnimePahe] Movie error:", err);
          resolve([]);
        });
    }

    function proceedToEpisodes() {
      if (!animeSession) {
        console.log("[AnimePahe] No anime session found");
        resolve([]);
        return Promise.resolve();
      }

      var firstPageUrl = "/api?m=release&id=" + animeSession + "&sort=episode_asc&page=1";
      return fetchJson(firstPageUrl)
        .then(function(firstPageData) {
          console.log("[AnimePahe] First page episodes:", firstPageData.data ? firstPageData.data.length : 0);
          if (!firstPageData.data || firstPageData.data.length === 0) {
            resolve([]);
            return Promise.reject("No episodes");
          }
          var paheEpStart = Math.floor(firstPageData.data[0].episode);
          var perPage = firstPageData.per_page || 30;
          var targetPaheEp = paheEpStart - 1 + mappedEp;
          var targetPage = Math.ceil(mappedEp / perPage) || 1;
          var targetPageUrl = "/api?m=release&id=" + animeSession + "&sort=episode_asc&page=" + targetPage;

          return fetchJson(targetPageUrl).then(function(targetPageData) {
            var episodeSession = null;
            if (targetPageData && targetPageData.data) {
              for (var i = 0; i < targetPageData.data.length; i++) {
                if (Math.floor(targetPageData.data[i].episode) == targetPaheEp) {
                  episodeSession = targetPageData.data[i].session;
                  break;
                }
              }
            }
            if (!episodeSession && targetPage !== 1) {
              for (var j = 0; j < firstPageData.data.length; j++) {
                if (Math.floor(firstPageData.data[j].episode) == targetPaheEp) {
                  episodeSession = firstPageData.data[j].session;
                  break;
                }
              }
            }
            if (!episodeSession) {
              console.log("[AnimePahe] No episode session found");
              resolve([]);
              return Promise.reject("No episode");
            }

            var playUrl = "/play/" + animeSession + "/" + episodeSession;
            return fetchText(playUrl).then(function(playHtml) {
              var buttons = parseResolutionButtons(playHtml);
              console.log("[AnimePahe] Found", buttons.length, "resolution buttons");

              if (buttons.length === 0) {
                resolve([]);
                return;
              }

              var promises = [];
              var streams = [];
              for (var k = 0; k < buttons.length; k++) {
                (function(btn) {
                  promises.push(
                    extractKwik(btn.kwikUrl).then(function(res) {
                      if (res) {
                        streams.push({
                          name: btn.name,
                          title: animeTitle + " - Episode " + mappedEp,
                          url: res.url,
                          quality: btn.quality,
                          headers: res.headers
                        });
                      }
                    })
                  );
                })(buttons[k]);
              }

              Promise.all(promises).then(function() {
                var qualityOrder = { "1080p": 3, "720p": 2, "360p": 1 };
                streams.sort(function(a, b) {
                  return (qualityOrder[b.quality] || 0) - (qualityOrder[a.quality] || 0);
                });
                console.log("[AnimePahe] Returning", streams.length, "streams");
                resolve(streams);
              });
            });
          });
        })
        .catch(function(err) {
          console.error("[AnimePahe] Episode error:", err);
          resolve([]);
        });
    }
  });
}

module.exports = { getStreams };
