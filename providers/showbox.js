// ShowBox Scraper for Nuvio Local Scrapers
// React Native compatible version - Promise-based approach only

// TMDB API Configuration
const TMDB_API_KEY = '439c478a771f35c05022f9feabcca01c';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

// ShowBox API Configuration
const SHOWBOX_API_BASE = 'https://febapi.nuvioapp.space/api/media';

// Working headers for ShowBox API
const WORKING_HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
    'Accept': 'application/json',
    'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8',
    'Accept-Encoding': 'gzip, deflate, br, zstd',
    'Content-Type': 'application/json'
};

// UI token (cookie) is provided by the host app via per-scraper settings (Plugin Screen)
function getUiToken() {
    try {
        // Prefer sandbox-injected globals
        if (typeof global !== 'undefined' && global.SCRAPER_SETTINGS && global.SCRAPER_SETTINGS.uiToken) {
            return String(global.SCRAPER_SETTINGS.uiToken);
        }
        if (typeof window !== 'undefined' && window.SCRAPER_SETTINGS && window.SCRAPER_SETTINGS.uiToken) {
            return String(window.SCRAPER_SETTINGS.uiToken);
        }
    } catch (e) {
        // ignore and fall through
    }
    return '';
}

// OSS Group is provided by the host app via per-scraper settings (Plugin Screen) - optional
function getOssGroup() {
    try {
        // Prefer sandbox-injected globals
        if (typeof global !== 'undefined' && global.SCRAPER_SETTINGS && global.SCRAPER_SETTINGS.ossGroup) {
            return String(global.SCRAPER_SETTINGS.ossGroup);
        }
        if (typeof window !== 'undefined' && window.SCRAPER_SETTINGS && window.SCRAPER_SETTINGS.ossGroup) {
            return String(window.SCRAPER_SETTINGS.ossGroup);
        }
    } catch (e) {
        // ignore and fall through
    }
    return null; // OSS group is optional
}

// Utility Functions
function getQualityFromName(qualityStr) {
    if (!qualityStr) return 'Unknown';
    
    const quality = qualityStr.toUpperCase();
    
    // Map API quality values to normalized format
    if (quality === 'ORG' || quality === 'ORIGINAL') return 'Original';
    if (quality === '4K' || quality === '2160P') return '4K';
    if (quality === '1440P' || quality === '2K') return '1440p';
    if (quality === '1080P' || quality === 'FHD') return '1080p';
    if (quality === '720P' || quality === 'HD') return '720p';
    if (quality === '480P' || quality === 'SD') return '480p';
    if (quality === '360P') return '360p';
    if (quality === '240P') return '240p';
    
    // Try to extract number from string and format consistently
    const match = qualityStr.match(/(\d{3,4})[pP]?/);
    if (match) {
        const resolution = parseInt(match[1]);
        if (resolution >= 2160) return '4K';
        if (resolution >= 1440) return '1440p';
        if (resolution >= 1080) return '1080p';
        if (resolution >= 720) return '720p';
        if (resolution >= 480) return '480p';
        if (resolution >= 360) return '360p';
        return '240p';
    }
    
    return 'Unknown';
}

function formatFileSize(sizeStr) {
    if (!sizeStr) return 'Unknown';
    
    // If it's already formatted (like "15.44 GB" or "224.39 MB"), return as is
    if (typeof sizeStr === 'string' && (sizeStr.includes('GB') || sizeStr.includes('MB') || sizeStr.includes('KB'))) {
        return sizeStr;
    }
    
    // If it's a number, convert to GB/MB
    if (typeof sizeStr === 'number') {
        const gb = sizeStr / (1024 * 1024 * 1024);
        if (gb >= 1) {
            return `${gb.toFixed(2)} GB`;
        } else {
            const mb = sizeStr / (1024 * 1024);
            return `${mb.toFixed(2)} MB`;
        }
    }
    
    return sizeStr;
}

// Helper function to make HTTP requests
function makeRequest(url, options = {}) {
    return fetch(url, {
        method: options.method || 'GET',
        headers: { ...WORKING_HEADERS, ...options.headers },
        ...options
    }).then(function(response) {
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return response;
    }).catch(function(error) {
        console.error(`[ShowBox] Request failed for ${url}: ${error.message}`);
        throw error;
    });
}

// Get movie/TV show details from TMDB
function getTMDBDetails(tmdbId, mediaType) {
    const endpoint = mediaType === 'tv' ? 'tv' : 'movie';
    const url = `${TMDB_BASE_URL}/${endpoint}/${tmdbId}?api_key=${TMDB_API_KEY}`;
    
    return makeRequest(url)
        .then(function(response) {
            return response.json();
        })
        .then(function(data) {
            const title = mediaType === 'tv' ? data.name : data.title;
            const releaseDate = mediaType === 'tv' ? data.first_air_date : data.release_date;
            const year = releaseDate ? parseInt(releaseDate.split('-')[0]) : null;
            
            return {
                title: title,
                year: year
            };
        })
        .catch(function(error) {
            console.log(`[ShowBox] TMDB lookup failed: ${error.message}`);
            return {
                title: `TMDB ID ${tmdbId}`,
                year: null
            };
        });
}

// Process ShowBox API response - new format with versions and links
function processShowBoxResponse(data, mediaInfo, mediaType, seasonNum, episodeNum) {
    const streams = [];
    
    try {
        if (!data || !data.success) {
            console.log(`[ShowBox] API returned unsuccessful response`);
            return streams;
        }

        if (!data.versions || !Array.isArray(data.versions) || data.versions.length === 0) {
            console.log(`[ShowBox] No versions found in API response`);
            return streams;
        }

        console.log(`[ShowBox] Processing ${data.versions.length} version(s)`);

        // Build title with year and episode info if TV
        let streamTitle = mediaInfo.title || 'Unknown Title';
        if (mediaInfo.year) {
            streamTitle += ` (${mediaInfo.year})`;
        }
        if (mediaType === 'tv' && seasonNum && episodeNum) {
            streamTitle = `${mediaInfo.title || 'Unknown'} S${String(seasonNum).padStart(2, '0')}E${String(episodeNum).padStart(2, '0')}`;
            if (mediaInfo.year) {
                streamTitle += ` (${mediaInfo.year})`;
            }
        }

        // Process each version
        data.versions.forEach(function(version, versionIndex) {
            const versionName = version.name || `Version ${versionIndex + 1}`;
            const versionSize = version.size || 'Unknown';

            // Process each link in the version
            if (version.links && Array.isArray(version.links)) {
                version.links.forEach(function(link) {
                    if (!link.url) return;

                    const normalizedQuality = getQualityFromName(link.quality || 'Unknown');
                    const linkSize = link.size || versionSize;
                    const linkName = link.name || `${normalizedQuality}`;

                    // Create stream name - use version number if multiple versions exist
                    let streamName = 'ShowBox';
                    if (data.versions.length > 1) {
                        streamName += ` V${versionIndex + 1}`;
                    }
                    streamName += ` ${normalizedQuality}`;

                    streams.push({
                        name: streamName,
                        title: streamTitle,
                        url: link.url,
                        quality: normalizedQuality,
                        size: formatFileSize(linkSize),
                        provider: 'showbox',
                        speed: link.speed || null
                    });

                    console.log(`[ShowBox] Added ${normalizedQuality} stream from ${versionName}: ${link.url.substring(0, 50)}...`);
                });
            }
        });

    } catch (error) {
        console.error(`[ShowBox] Error processing response: ${error.message}`);
    }
    
    return streams;
}

// Main scraping function
function getStreams(tmdbId, mediaType = 'movie', seasonNum = null, episodeNum = null) {
    console.log(`[ShowBox] Fetching streams for TMDB ID: ${tmdbId}, Type: ${mediaType}${mediaType === 'tv' ? `, S:${seasonNum}E:${episodeNum}` : ''}`);

    // Get cookie (uiToken) - required
    const cookie = getUiToken();
    if (!cookie) {
        console.error('[ShowBox] No UI token (cookie) found in scraper settings');
        return Promise.resolve([]);
    }

    // Get OSS group - optional
    const ossGroup = getOssGroup();
    console.log(`[ShowBox] Using cookie: ${cookie.substring(0, 20)}...${ossGroup ? `, OSS Group: ${ossGroup}` : ' (no OSS group)'}`);

    // Get TMDB details for title formatting
    return getTMDBDetails(tmdbId, mediaType)
        .then(function(mediaInfo) {
            console.log(`[ShowBox] TMDB Info: "${mediaInfo.title}" (${mediaInfo.year || 'N/A'})`);

            // Build API URL based on media type
            let apiUrl;
            if (mediaType === 'tv' && seasonNum && episodeNum) {
                // TV format: /api/media/tv/:tmdbId/oss=:ossGroup/:season/:episode?cookie=:cookie
                if (ossGroup) {
                    apiUrl = `${SHOWBOX_API_BASE}/tv/${tmdbId}/oss=${ossGroup}/${seasonNum}/${episodeNum}?cookie=${encodeURIComponent(cookie)}`;
                } else {
                    apiUrl = `${SHOWBOX_API_BASE}/tv/${tmdbId}/${seasonNum}/${episodeNum}?cookie=${encodeURIComponent(cookie)}`;
                }
            } else {
                // Movie format: /api/media/movie/:tmdbId?cookie=:cookie
                apiUrl = `${SHOWBOX_API_BASE}/movie/${tmdbId}?cookie=${encodeURIComponent(cookie)}`;
            }

            console.log(`[ShowBox] Requesting: ${apiUrl}`);

            // Make request to ShowBox API
            return makeRequest(apiUrl)
                .then(function(response) {
                    console.log(`[ShowBox] API Response status: ${response.status}`);
                    return response.json();
                })
                .then(function(data) {
                    console.log(`[ShowBox] API Response received:`, JSON.stringify(data, null, 2));
                    
                    // Process the response
                    const streams = processShowBoxResponse(data, mediaInfo, mediaType, seasonNum, episodeNum);
                    
                    if (streams.length === 0) {
                        console.log(`[ShowBox] No streams found in API response`);
                        return [];
                    }
                    
                    // Sort streams by quality (highest first)
                    streams.sort(function(a, b) {
                        const qualityOrder = { 
                            'Original': 6, 
                            '4K': 5, 
                            '1440p': 4, 
                            '1080p': 3, 
                            '720p': 2, 
                            '480p': 1, 
                            '360p': 0, 
                            '240p': -1, 
                            'Unknown': -2 
                        };
                        return (qualityOrder[b.quality] || -2) - (qualityOrder[a.quality] || -2);
                    });

                    console.log(`[ShowBox] Returning ${streams.length} streams`);
                    return streams;
                })
                .catch(function(error) {
                    console.error(`[ShowBox] API request failed: ${error.message}`);
                    throw error;
                });
        })
        .catch(function(error) {
            console.error(`[ShowBox] Error in getStreams: ${error.message}`);
            return []; // Return empty array on error as per Nuvio scraper guidelines
        });
}

// Export the main function
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { getStreams };
} else {
    // For React Native environment
    global.ShowBoxScraperModule = { getStreams };
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
  var PROVIDER = "showbox";
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
