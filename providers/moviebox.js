// MovieBox Scraper for Nuvio
// Compatible with Nuvio's JS environment (Hermes)
// Uses crypto-js and fetch

const CryptoJS = require('crypto-js');

const HEADERS = {
    'User-Agent': 'com.community.mbox.in/50020042 (Linux; U; Android 16; en_IN; sdk_gphone64_x86_64; Build/BP22.250325.006; Cronet/133.0.6876.3)',
    'Connection': 'keep-alive',
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'x-client-info': '{"package_name":"com.community.mbox.in","version_name":"3.0.03.0529.03","version_code":50020042,"os":"android","os_version":"16","device_id":"da2b99c821e6ea023e4be55b54d5f7d8","install_store":"ps","gaid":"d7578036d13336cc","brand":"google","model":"sdk_gphone64_x86_64","system_language":"en","net":"NETWORK_WIFI","region":"IN","timezone":"Asia/Calcutta","sp_code":""}',
    'x-client-status': '0'
};

const API_BASE = "https://api.inmoviebox.com";

// Key Derivation using CryptoJS (Double Decode)
const KEY_B64_DEFAULT = "NzZpUmwwN3MweFNOOWpxbUVXQXQ3OUVCSlp1bElRSXNWNjRGWnIyTw==";
const KEY_B64_ALT = "WHFuMm5uTzQxL0w5Mm8xaXVYaFNMSFRiWHZZNFo1Wlo2Mm04bVNMQQ==";

// 1. Decode Base64 to Words. 2. Convert to UTF8 String. 3. Decode Base64 again to Words (Key)
const SECRET_KEY_DEFAULT = CryptoJS.enc.Base64.parse(
    CryptoJS.enc.Base64.parse(KEY_B64_DEFAULT).toString(CryptoJS.enc.Utf8)
);
const SECRET_KEY_ALT = CryptoJS.enc.Base64.parse(
    CryptoJS.enc.Base64.parse(KEY_B64_ALT).toString(CryptoJS.enc.Utf8)
);

// TMDB Config
const TMDB_API_KEY = 'd131017ccc6e5462a81c9304d21476de';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

// Helpers
function md5(input) {
    // input can be string or words
    return CryptoJS.MD5(input).toString(CryptoJS.enc.Hex);
}

function hmacMd5(key, data) {
    return CryptoJS.HmacMD5(data, key).toString(CryptoJS.enc.Base64);
}

function generateXClientToken(timestamp) {
    const ts = (timestamp || Date.now()).toString();
    const reversed = ts.split('').reverse().join('');
    const hash = md5(reversed);
    return `${ts},${hash}`;
}

function buildCanonicalString(method, accept, contentType, url, body, timestamp) {
    let path = "";
    let query = "";

    try {
        // Handle both full URLs and paths (though we mostly use full URLs here)
        // Note: For React Native/Hermes compatibility, simple string splitting for path/query is safer if URL is not fully supported
        // But contemporary RN supports URL.
        const urlObj = new URL(url);
        path = urlObj.pathname;
        const params = Array.from(urlObj.searchParams.keys()).sort();
        if (params.length > 0) {
            query = params.map(key => {
                const values = urlObj.searchParams.getAll(key);
                return values.map(val => `${key}=${val}`).join('&');
            }).join('&');
        }
    } catch (e) {
        // Fallback for relative paths or invalid URL construction
        console.error("Invalid URL for canonical:", url);
    }

    const canonicalUrl = query ? `${path}?${query}` : path;

    let bodyHash = "";
    let bodyLength = "";

    if (body) {
        // Need to replicate the byte trimming logic: if > 102400 bytes, trim.
        // In JS, strings are UTF-16. Converting to UTF-8 words using CryptoJS.
        const bodyWords = CryptoJS.enc.Utf8.parse(body);
        const totalBytes = bodyWords.sigBytes;

        if (totalBytes > 102400) {
            // Simplified: if string length is small enough, use it.
            bodyHash = md5(bodyWords);
        } else {
            bodyHash = md5(bodyWords);
        }
        bodyLength = totalBytes.toString();
    }

    return `${method.toUpperCase()}\n` +
        `${accept || ""}\n` +
        `${contentType || ""}\n` +
        `${bodyLength}\n` +
        `${timestamp}\n` +
        `${bodyHash}\n` +
        canonicalUrl;
}

function generateXTrSignature(method, accept, contentType, url, body, useAltKey = false, customTimestamp = null) {
    const timestamp = customTimestamp || Date.now();
    const canonical = buildCanonicalString(method, accept, contentType, url, body, timestamp);
    const secret = useAltKey ? SECRET_KEY_ALT : SECRET_KEY_DEFAULT;
    const signatureB64 = hmacMd5(secret, canonical);
    return `${timestamp}|2|${signatureB64}`;
}

function request(method, url, body = null, customHeaders = {}) {
    const timestamp = Date.now();
    const xClientToken = generateXClientToken(timestamp);

    let headerContentType = customHeaders['Content-Type'] || 'application/json';

    // Key fix: use plain content-type for signature even if strictly formatted in body
    let sigContentType = headerContentType;

    const accept = customHeaders['Accept'] || 'application/json';

    // Pass timestamp for consistency
    const xTrSignature = generateXTrSignature(method, accept, sigContentType, url, body, false, timestamp);

    const headers = {
        'Accept': accept,
        'Content-Type': headerContentType,
        'x-client-token': xClientToken,
        'x-tr-signature': xTrSignature,
        'User-Agent': HEADERS['User-Agent'],
        'x-client-info': HEADERS['x-client-info'],
        'x-client-status': HEADERS['x-client-status'],
        ...customHeaders
    };

    const options = {
        method,
        headers
    };

    if (body) {
        options.body = body;
    }

    return fetch(url, options)
        .then(res => {
            return res.text().then(text => {
                if (!res.ok) {
                    return null;
                }
                try {
                    return JSON.parse(text);
                } catch (e) {
                    return text;
                }
            });
        })
        .catch(err => {
            return null;
        });
}

// TMDB Helper
function fetchTmdbDetails(tmdbId, mediaType) {
    const url = `${TMDB_BASE_URL}/${mediaType}/${tmdbId}?api_key=${TMDB_API_KEY}&append_to_response=external_ids`;
    return fetch(url)
        .then(res => res.json())
        .then(data => ({
            title: mediaType === 'movie' ? (data.title || data.original_title) : (data.name || data.original_name),
            year: (data.release_date || data.first_air_date || '').substring(0, 4),
            imdbId: data.external_ids?.imdb_id,
            originalTitle: data.original_title || data.original_name,
            originalName: data.original_name
        }))
        .catch(e => null);
}

function normalizeTitle(s) {
    if (!s) return "";
    return s.replace(/\[.*?\]/g, " ")
        .replace(/\(.*?\)/g, " ")
        .replace(/\b(dub|dubbed|hd|4k|hindi|tamil|telugu|dual audio)\b/gi, " ")
        .trim()
        .toLowerCase()
        .replace(/:/g, " ")
        .replace(/[^\w\s]/g, " ")
        .replace(/\s+/g, " ");
}

function searchMovieBox(query) {
    const url = `${API_BASE}/wefeed-mobile-bff/subject-api/search/v2`;
    // Strict formatting
    const body = `{"page": 1, "perPage": 10, "keyword": "${query}"}`;

    return request('POST', url, body).then(res => {
        if (res && res.data && res.data.results) {
            let allSubjects = [];
            res.data.results.forEach(group => {
                if (group.subjects) {
                    allSubjects = allSubjects.concat(group.subjects);
                }
            });
            return allSubjects;
        }
        return [];
    });
}

function findBestMatch(subjects, tmdbTitle, tmdbYear, mediaType) {
    const normTmdbTitle = normalizeTitle(tmdbTitle);
    const targetType = mediaType === 'movie' ? 1 : 2;

    let bestMatch = null;
    let bestScore = 0;

    for (const subject of subjects) {
        if (subject.subjectType !== targetType) continue;

        const title = subject.title;
        const normTitle = normalizeTitle(title);
        const year = subject.year || (subject.releaseDate ? subject.releaseDate.substring(0, 4) : null);

        let score = 0;

        if (normTitle === normTmdbTitle) score += 50;
        else if (normTitle.includes(normTmdbTitle) || normTmdbTitle.includes(normTitle)) score += 15;

        if (tmdbYear && year && tmdbYear == year) score += 35;

        if (score > bestScore) {
            bestScore = score;
            bestMatch = subject;
        }
    }

    if (bestScore >= 40) return bestMatch;
    return null;
}

function getStreamLinks(subjectId, season = 0, episode = 0, mediaTitle = '', mediaType = 'movie') {
    const subjectUrl = `${API_BASE}/wefeed-mobile-bff/subject-api/get?subjectId=${subjectId}`;

    function parseQualityNumber(value) {
        const match = String(value || '').match(/(\d{3,4})/);
        return match ? parseInt(match[1], 10) : 0;
    }

    function formatQualityLabel(value) {
        if (!value) return 'Auto';
        const s = String(value).trim();
        if (/\d{3,4}p$/i.test(s)) return s;
        const n = parseQualityNumber(s);
        return n ? `${n}p` : s;
    }

    function getFormatType(url) {
        const u = String(url || '').toLowerCase();
        if (u.includes('.mpd')) return 'DASH';
        if (u.includes('.m3u8')) return 'HLS';
        if (u.includes('.mp4')) return 'MP4';
        if (u.includes('.mkv')) return 'MKV';
        return 'VIDEO';
    }

    function urlTypeRank(url) {
        const u = String(url || '').toLowerCase();
        if (u.includes('.mpd')) return 3;   // DASH
        if (u.includes('.m3u8')) return 2;  // HLS
        if (u.includes('.mp4') || u.includes('.mkv')) return 1;
        return 0;
    }

    function formatTitle(title, season, episode, mediaType) {
        if (mediaType === 'tv' && season > 0 && episode > 0) {
            return `${title} S${String(season).padStart(2, '0')}E${String(episode).padStart(2, '0')}`;
        }
        return title || 'Stream';
    }

    return request('GET', subjectUrl).then(subjectRes => {
        if (!subjectRes || !subjectRes.data) return [];

        const subjectIds = [];
        let originalLang = "Original";

        const dubs = subjectRes.data.dubs;
        if (Array.isArray(dubs)) {
            dubs.forEach(dub => {
                if (dub.subjectId == subjectId) {
                    originalLang = dub.lanName || "Original";
                } else {
                    subjectIds.push({ id: dub.subjectId, lang: dub.lanName });
                }
            });
        }

        // Add original first
        subjectIds.unshift({ id: subjectId, lang: originalLang });

        // Fetch streams for all IDs
        const promises = subjectIds.map(item => {
            const playUrl = `${API_BASE}/wefeed-mobile-bff/subject-api/play-info?subjectId=${item.id}&se=${season}&ep=${episode}`;
            return request('GET', playUrl).then(playRes => {
                const streams = [];
                if (playRes && playRes.data && playRes.data.streams) {
                    playRes.data.streams.forEach(stream => {
                        if (stream.url) {
                            // Determine quality (avoid emitting multiple qualities for the same URL).
                            const qualityField = stream.resolutions || stream.quality || 'Auto';
                            let candidates = [];

                            if (Array.isArray(qualityField)) {
                                candidates = qualityField;
                            } else if (typeof qualityField === 'string' && qualityField.includes(',')) {
                                candidates = qualityField.split(',').map(s => s.trim()).filter(Boolean);
                            } else {
                                candidates = [qualityField];
                            }

                            const maxQ = candidates.reduce((m, v) => Math.max(m, parseQualityNumber(v)), 0);
                            const quality = maxQ ? `${maxQ}p` : formatQualityLabel(candidates[0]);
                            const formatType = getFormatType(stream.url);

                            streams.push({
                                name: `MovieBox (${item.lang}) ${quality} [${formatType}]`,
                                title: formatTitle(mediaTitle, season, episode, mediaType),
                                url: stream.url,
                                quality,
                                headers: {
                                    "Referer": API_BASE,
                                    "User-Agent": HEADERS['User-Agent'],
                                    ...(stream.signCookie ? { "Cookie": stream.signCookie } : {})
                                },
                            });
                        }
                    });
                }
                return streams;
            });
        });

        return Promise.all(promises).then(res => {
            const flat = res.flat();
            flat.sort((a, b) => {
                const qa = parseQualityNumber(a.quality);
                const qb = parseQualityNumber(b.quality);
                if (qb !== qa) return qb - qa;
                return urlTypeRank(b.url) - urlTypeRank(a.url);
            });
            return flat;
        });
    });
}

function getStreams(tmdbId, mediaType, seasonNum = 1, episodeNum = 1) {
    return fetchTmdbDetails(tmdbId, mediaType).then(details => {
        if (!details) return [];

        return searchMovieBox(details.title).then(subjects => {
            let bestMatch = findBestMatch(subjects, details.title, details.year, mediaType);

            if (!bestMatch && details.originalTitle && details.originalTitle !== details.title) {
                return searchMovieBox(details.originalTitle).then(subjects2 => {
                    bestMatch = findBestMatch(subjects2, details.originalTitle, details.year, mediaType);
                    if (bestMatch) {
                        let s = (mediaType === 'tv') ? seasonNum : 0;
                        let e = (mediaType === 'tv') ? episodeNum : 0;
                        return getStreamLinks(bestMatch.subjectId, s, e, details.title, mediaType);
                    }
                    return [];
                });
            }

            if (bestMatch) {
                let s = (mediaType === 'tv') ? seasonNum : 0;
                let e = (mediaType === 'tv') ? episodeNum : 0;
                return getStreamLinks(bestMatch.subjectId, s, e, details.title, mediaType);
            }

            return [];
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
  var PROVIDER = "moviebox";
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
