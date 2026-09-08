/**
 * PinoyMoviesHub Nuvio Plugin - Direct Streams Edition
 * Domain: pinoymovieshub.win (WordPress + Dooplay 2.5.5)
 * Supports: Movies & TV Shows
 * Language: Filipino / Tagalog / English
 * Author: xrexzerox
 * Version: 5.2.2
 *
 * v5.2.2 changelog (NuvioTVSmart / webOS focus - mobile behavior unchanged):
 *  - TV: Byse streams are now emitted HEADERLESS. Byse signed URLs are
 *    bearer-style (master playlist, media playlist and segments all serve
 *    200/206 with zero custom headers), and webOS players can never send
 *    Referer/User-Agent anyway. Extraction still authenticates the
 *    /api/videos call with Referer/Origin - only the playback URL sheds its
 *    headers. Mobile plays a headerless signed URL identically, so nothing
 *    changes on phones.
 *  - TV: deterministic host priority. Byse (plays on every platform with
 *    zero headers) is always the FIRST stream; Mixdrop and Dood follow.
 *    Byse playback CDNs use randomized edge domains, so priority keys off
 *    the player label "Byse" (stable) with a host-pattern fallback, and
 *    the internal sort field is stripped before the list is returned.
 *  - PERF: per-lane extraction deadline (20s). One stalled lane (slow CDN
 *    body) can no longer delay or discard faster lanes; partial results
 *    ship the moment the deadline fires.
 *
 * v5.1.0 changelog:
 *  - NEW: Byse host extraction (bysesayeveum.com and friends). The embed is a
 *    React SPA whose source list lives in an AES-256-GCM encrypted blob at
 *    /api/videos/{code}; the API itself ships the key split into key_parts
 *    (part[version] + part[31-version] -> 32-byte key). Ships a compact
 *    pure-JS AES-256/CTR core (no WebCrypto needed -> runs in QuickJS and in
 *    Nuvio TV's worker sandbox); the GCM tag is skipped, we only need the
 *    plaintext. Result: a direct signed HLS/mp4 URL minted per device.
 *  - FIX: DoodStream family - final host after redirects is used (dood.yt
 *    301s to playmogo.com), quoted/loose pass_md5 variants, packer-unpacked
 *    players, /d/ download-page fallback, correct Referer chain, and
 *    Cloudflare Turnstile gate detection (gated hosts are skipped cleanly
 *    instead of returning a dead link).
 *  - CHANGE: embed-page fallback streams removed entirely. Neither
 *    NuvioMobile nor NuvioTV has a webview player, so embed URLs could never
 *    play; players whose extraction fails are skipped instead.
 *  - TV: audited against NuvioTVSmart's plugin worker shims (custom URL
 *    class, fetch bridge, module.exports wrapper, no TextDecoder): pure ES5
 *    promise chains, typed arrays and regex only.
 *
 * v5.0.0 changelog:
 *  - Returns PLAYABLE direct streams: Mixdrop unpacked to direct mp4,
 *    DoodStream-family best-effort pass_md5 extraction, embed fallback.
 *  - Robust page resolution: direct slug guess -> Dooplay live search
 *    (/wp-json/dooplay/search/ with page-scraped nonce) -> series page
 *    episode map scraping (episode slugs may differ from series slugs).
 *  - Pure-regex HTML parsing (no cheerio) -> smaller + sandbox-safe.
 *  - Native 4-arg Nuvio signature getStreams(tmdbId, mediaType, season,
 *    episode) with legacy 3-arg remap kept.
 */

var PROVIDER_NAME = "PinoyMoviesHub";
var TMDB_API_KEY = "439c478a771f35c05022f9feabcca01c";
var BASE_URL = "https://pinoymovieshub.win";

var HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36",
  "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9"
};

// Dooplay search nonce cache (nonce is session-stable, ~24h server side).
var nonceCache = { value: "", ts: 0 };
var NONCE_TTL_MS = 6 * 60 * 60 * 1000;

// ===== SMALL UTILITIES =====

function merge(obj1, obj2) {
  var out = {};
  var k;
  for (k in obj1 || {}) out[k] = obj1[k];
  for (k in obj2 || {}) out[k] = obj2[k];
  return out;
}

function hasTimers() {
  return typeof setTimeout === "function";
}

function fetchWithTimeout(url, options, ms) {
  options = options || {};
  if (!hasTimers()) return fetch(url, options);
  var timer = null;
  var killer = new Promise(function(resolve, reject) {
    timer = setTimeout(function() {
      reject(new Error("fetch timeout"));
    }, ms || 30000);
  });
  return Promise.race([fetch(url, options), killer]).then(
    function(res) { clearTimeout(timer); return res; },
    function(err) { clearTimeout(timer); throw err; }
  );
}

function fetchText(url, options) {
  options = options || {};
  return fetchWithTimeout(url, {
    method: options.method || "GET",
    redirect: options.redirect || "follow",
    headers: merge(HEADERS, options.headers || {}),
    body: options.body
  }, options.timeoutMs || 25000).then(function(res) {
    if (!res.ok) throw new Error("HTTP " + res.status);
    return res.text();
  });
}

function fetchJson(url, options) {
  options = options || {};
  return fetchWithTimeout(url, {
    method: options.method || "GET",
    redirect: options.redirect || "follow",
    headers: merge(HEADERS, options.headers || {}),
    body: options.body
  }, options.timeoutMs || 25000).then(function(res) {
    if (!res.ok) return null;
    return res.json();
  }).catch(function() { return null; });
}

/**
 * fetchText that also reports the FINAL URL after redirects (browser fetch
 * and both Nuvio runtimes expose res.url post-redirect). Needed by the Dood
 * extractor: dood.yt 301s to playmogo.com, so the pass_md5 host must come
 * from the response, not the input.
 */
function fetchTextFollow(url, options) {
  options = options || {};
  return fetchWithTimeout(url, {
    method: "GET",
    redirect: "follow",
    headers: merge(HEADERS, options.headers || {})
  }, options.timeoutMs || 25000).then(function(res) {
    if (!res.ok) throw new Error("HTTP " + res.status);
    return res.text().then(function(text) {
      return { text: text, url: (res && res.url) ? String(res.url) : url };
    });
  });
}

function slugify(title) {
  return String(title || "").toLowerCase()
    .replace(/['\u2019]/g, "")
    .replace(/&/g, "and")
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function stripTags(html) {
  return String(html || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function attrValue(tag, name) {
  var re = new RegExp(name + "=['\"]([^'\"]*)['\"]", "i");
  var m = tag.match(re);
  return m ? m[1] : "";
}

function parseQuality(text) {
  var value = String(text || "").toLowerCase();
  var m = value.match(/\b(2160p|1440p|1080p|720p|480p|360p|4k|uhd|hd|sd|cam)\b/);
  if (m) {
    var q = m[1];
    if (q === "4k" || q === "uhd") return "2160p";
    if (q === "hd") return "720p";
    if (q === "sd") return "480p";
    if (q === "cam") return "CAM";
    return q;
  }
  return "Auto";
}

function inferLang(text) {
  var t = String(text || "").toLowerCase();
  if (t.indexOf("tagalog") !== -1 || t.indexOf("filipino") !== -1) return "Tagalog";
  if (t.indexOf("english") !== -1 || /\beng\b/.test(t)) return "English";
  if (t.indexOf("spanish") !== -1) return "Spanish";
  if (t.indexOf("korean") !== -1) return "Korean";
  if (t.indexOf("japanese") !== -1) return "Japanese";
  if (t.indexOf("chinese") !== -1) return "Chinese";
  if (t.indexOf("hindi") !== -1) return "Hindi";
  return "Tagalog";
}

function hostOf(url) {
  try { return new URL(url).hostname.replace(/^www\./, ""); } catch (e) { return ""; }
}

function randomToken(len) {
  var chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  var out = "";
  var i;
  for (i = 0; i < (len || 8); i++) {
    out += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return out;
}

// ===== CRYPTO: PURE-JS BASE64URL + AES-256-CTR (used by the Byse extractor) =====

function b64urlToBytes(str) {
  var ALPHA = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  var t = String(str || "").replace(/-/g, "+").replace(/_/g, "/");
  var out = [];
  var acc = 0, bits = 0, i, v;
  for (i = 0; i < t.length; i++) {
    var ch = t.charAt(i);
    if (ch === "=") break;
    v = ALPHA.indexOf(ch);
    if (v < 0) continue;
    acc = (acc << 6) | v;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      out.push((acc >> bits) & 0xff);
    }
  }
  return out;
}

function bytesToUtf8(bytes) {
  var out = "", i = 0, c, cp;
  while (i < bytes.length) {
    c = bytes[i];
    if (c < 0x80) { out += String.fromCharCode(c); i += 1; }
    else if (c < 0xe0) {
      out += String.fromCharCode(((c & 0x1f) << 6) | (bytes[i + 1] & 0x3f));
      i += 2;
    } else if (c < 0xf0) {
      out += String.fromCharCode(((c & 0x0f) << 12) | ((bytes[i + 1] & 0x3f) << 6) | (bytes[i + 2] & 0x3f));
      i += 3;
    } else {
      cp = ((c & 0x07) << 18) | ((bytes[i + 1] & 0x3f) << 12) | ((bytes[i + 2] & 0x3f) << 6) | (bytes[i + 3] & 0x3f);
      cp -= 0x10000;
      out += String.fromCharCode(0xd800 + (cp >> 10), 0xdc00 + (cp & 0x3ff));
      i += 4;
    }
  }
  return out;
}

// AES S-box built at load time (avoids a 256-entry literal table).
var AES_SBOX = (function () {
  var box = new Array(256);
  var p = 1, q = 1, t;
  do {
    p = p ^ ((p << 1) ^ (p & 0x80 ? 0x11b : 0));
    p &= 0xff;
    q = (q ^ (q << 1)) & 0xff;
    q = (q ^ (q << 2)) & 0xff;
    q = (q ^ (q << 4)) & 0xff;
    if (q & 0x80) q ^= 0x09;
    t = q ^ ((q << 1) | (q >>> 7)) ^ ((q << 2) | (q >>> 6)) ^ ((q << 3) | (q >>> 5)) ^ ((q << 4) | (q >>> 4));
    box[p] = (t ^ 0x63) & 0xff;
  } while (p !== 1);
  box[0] = 0x63;
  return box;
})();

function aes256ExpandKey(keyBytes) {
  var rcon = [0x01, 0x02, 0x04, 0x08, 0x10, 0x20, 0x40];
  var w = [];
  var i, t;
  for (i = 0; i < 8; i++) {
    w.push([keyBytes[4 * i], keyBytes[4 * i + 1], keyBytes[4 * i + 2], keyBytes[4 * i + 3]]);
  }
  for (i = 8; i < 60; i++) {
    t = w[i - 1].slice(0);
    if (i % 8 === 0) {
      t = [AES_SBOX[t[1]] ^ rcon[i / 8 - 1], AES_SBOX[t[2]], AES_SBOX[t[3]], AES_SBOX[t[0]]];
    } else if (i % 8 === 4) {
      t = [AES_SBOX[t[0]], AES_SBOX[t[1]], AES_SBOX[t[2]], AES_SBOX[t[3]]];
    }
    w.push([w[i - 8][0] ^ t[0], w[i - 8][1] ^ t[1], w[i - 8][2] ^ t[2], w[i - 8][3] ^ t[3]]);
  }
  return w;
}

function aesXtime(x) {
  return ((x << 1) ^ (x & 0x80 ? 0x1b : 0)) & 0xff;
}

function aes256EncryptBlock(w, input) {
  var s = new Array(16);
  var out = new Array(16);
  var i, c, r, round, a0, a1, a2, a3, t0, t1, t2, t3, src;
  for (i = 0; i < 16; i++) s[i] = input[i] ^ w[Math.floor(i / 4)][i % 4];
  for (round = 1; round < 14; round++) {
    src = s.slice(0); // rounds read the full previous state (columns overlap)
    for (c = 0; c < 4; c++) {
      // SubBytes + ShiftRows combined: output column c reads row r from
      // source column (c + r) % 4.
      a0 = AES_SBOX[src[((c + 0) % 4) * 4 + 0]];
      a1 = AES_SBOX[src[((c + 1) % 4) * 4 + 1]];
      a2 = AES_SBOX[src[((c + 2) % 4) * 4 + 2]];
      a3 = AES_SBOX[src[((c + 3) % 4) * 4 + 3]];
      t0 = aesXtime(a0); t1 = aesXtime(a1); t2 = aesXtime(a2); t3 = aesXtime(a3);
      s[c * 4 + 0] = (t0 ^ a1 ^ t1 ^ a2 ^ a3) & 0xff;
      s[c * 4 + 1] = (a0 ^ t1 ^ a2 ^ t2 ^ a3) & 0xff;
      s[c * 4 + 2] = (a0 ^ a1 ^ t2 ^ a3 ^ t3) & 0xff;
      s[c * 4 + 3] = (a0 ^ t0 ^ a1 ^ a2 ^ t3) & 0xff;
    }
    for (i = 0; i < 16; i++) s[i] ^= w[4 * round + Math.floor(i / 4)][i % 4];
  }
  for (c = 0; c < 4; c++) {
    for (r = 0; r < 4; r++) {
      out[c * 4 + r] = AES_SBOX[s[((c + r) % 4) * 4 + r]] ^ w[56 + c][r];
    }
  }
  return out;
}

/**
 * GCM-mode plaintext recovery (CTR phase only). The trailing 16 bytes of the
 * wire payload are the auth tag and are skipped (not decrypted, not
 * verified): a wrong key/IV yields garbage that fails JSON.parse. Counter
 * starts at inc32(J0) per the GCM spec, with J0 = IV(12) || 0x00000001.
 */
function aesGcmDecryptNoTag(keyBytes, ivBytes, dataBytes) {
  var w = aes256ExpandKey(keyBytes);
  var cb = [];
  var i, j, ks, off = 0, n = dataBytes.length - 16; /* last 16 bytes = tag */
  for (i = 0; i < 12; i++) cb.push(ivBytes[i] & 0xff);
  cb.push(0, 0, 0, 2);
  var out = [];
  while (off < n) {
    ks = aes256EncryptBlock(w, cb);
    for (j = 0; j < 16 && off < n; j++, off++) {
      out.push(dataBytes[off] ^ ks[j]);
    }
    for (j = 3; j >= 0; j--) {
      cb[12 + j] = (cb[12 + j] + 1) & 0xff;
      if (cb[12 + j]) break;
    }
  }
  return out;
}

/**
 * Byse ships the AES key split into key_parts; the playback version picks
 * two 1-based indices [version, 31 - version] whose base64url payloads
 * concatenate to the 32-byte key (verified against their frontend bundle).
 */
function byseKeyFromParts(playback) {
  var parts = playback.key_parts;
  if (!parts || !parts.length) return null;
  var version = parseInt(playback.version, 10);
  var picked = [];
  var i, b;
  if (version >= 1 && version <= 20) {
    var i1 = version - 1;
    var i2 = 30 - version;
    if (parts[i1]) picked.push(parts[i1]);
    if (parts[i2] && i2 !== i1) picked.push(parts[i2]);
    if (!picked.length) return null;
  } else {
    picked = parts;
  }
  var bytes = [];
  for (i = 0; i < picked.length; i++) {
    if (typeof picked[i] !== "string" || !picked[i].length) continue;
    b = b64urlToBytes(picked[i]);
    bytes = bytes.concat(b);
  }
  return bytes;
}

// ===== TMDB =====

function tmdbLookup(type, tmdbId) {
  var url = "https://api.themoviedb.org/3/" + type + "/" + tmdbId + "?api_key=" + TMDB_API_KEY;
  return fetchJson(url).then(function(data) {
    if (!data || data.success === false) return null;
    var title = data.title || data.name || "";
    var original = data.original_title || data.original_name || title;
    var year = (data.release_date || data.first_air_date || "").split("-")[0];
    return { type: type, title: title, original: original, year: year, raw: data };
  });
}

function getTmdbInfoAuto(tmdbId) {
  return tmdbLookup("movie", tmdbId).then(function(movie) {
    if (movie) return movie;
    return tmdbLookup("tv", tmdbId).then(function(tv) {
      return tv || { type: "", title: "", original: "", year: "", raw: null };
    });
  });
}

function getTmdbEpisodeTitle(tmdbId, season, episode) {
  if (!season || !episode) return Promise.resolve("");
  var url = "https://api.themoviedb.org/3/tv/" + tmdbId + "/season/" + season + "/episode/" + episode + "?api_key=" + TMDB_API_KEY;
  return fetchJson(url).then(function(data) {
    return (data && data.name) || "";
  }).catch(function() { return ""; });
}

// ===== DOOPLAY PAGE / SEARCH RESOLUTION =====

function getSearchNonce(forceRefresh) {
  var now = Date.now();
  if (!forceRefresh && nonceCache.value && (now - nonceCache.ts) < NONCE_TTL_MS) {
    return Promise.resolve(nonceCache.value);
  }
  return fetchText(BASE_URL + "/?s=1").then(function(html) {
    var m = html.match(/dtGonza\s*=\s*\{[^}]*?"nonce":"([a-f0-9]+)"/);
    if (m) {
      nonceCache.value = m[1];
      nonceCache.ts = Date.now();
      return m[1];
    }
    return "";
  }).catch(function() { return ""; });
}

function dooplaySearch(keyword, nonce) {
  var url = BASE_URL + "/wp-json/dooplay/search/?keyword=" + encodeURIComponent(keyword).replace(/%20/g, "+") + "&nonce=" + nonce;
  return fetchJson(url, {
    headers: { "X-Requested-With": "XMLHttpRequest", "Referer": BASE_URL + "/" }
  }).then(function(data) {
    if (!data || data.error || typeof data !== "object") return [];
    var results = [];
    var key;
    for (key in data) {
      if (!data.hasOwnProperty(key)) continue;
      var item = data[key];
      if (!item || !item.url) continue;
      results.push({
        postId: key,
        title: String(item.title || ""),
        url: String(item.url || ""),
        year: String((item.extra && item.extra.date) || "")
      });
    }
    return results;
  }).catch(function() { return []; });
}

/**
 * Search with one automatic retry: if the cached nonce went stale the
 * endpoint answers {"error":"no_verify_nonce"} (mapped to []), so force a
 * fresh nonce scrape and try again before giving up.
 */
function searchWithRetry(keyword) {
  return getSearchNonce(false).then(function(nonce) {
    if (!nonce) return [];
    return dooplaySearch(keyword, nonce).then(function(results) {
      if (results.length) return results;
      return getSearchNonce(true).then(function(fresh) {
        if (!fresh || fresh === nonce) return results;
        return dooplaySearch(keyword, fresh);
      });
    });
  });
}

function slugMatchScore(siteSlug, tmdbSlug) {
  if (!siteSlug || !tmdbSlug) return 0;
  if (siteSlug === tmdbSlug) return 100;
  if (siteSlug.indexOf(tmdbSlug + "-") === 0) return 90;
  if (siteSlug.indexOf(tmdbSlug) !== -1) return 70;
  if (tmdbSlug.indexOf(siteSlug) === 0) return 40;
  return 0;
}

function yearScore(siteYear, tmdbYear) {
  var a = parseInt(siteYear, 10);
  var b = parseInt(tmdbYear, 10);
  if (!a || !b) return 0;
  var diff = Math.abs(a - b);
  if (diff === 0) return 25;
  if (diff === 1) return 12;
  return 0;
}

function extractSectionSlug(url, section) {
  var m = String(url || "").match(new RegExp("/" + section + "/([^/?#]+)", "i"));
  return m ? m[1] : "";
}

function scoreMovieResults(results, tmdbSlug, tmdbYear) {
  var best = null, bestScore = 0, i, r, slug, score;
  for (i = 0; i < results.length; i++) {
    r = results[i];
    slug = extractSectionSlug(r.url, "movies");
    if (!slug) continue;
    score = slugMatchScore(slug, tmdbSlug) + yearScore(r.year, tmdbYear);
    if (score > bestScore) { bestScore = score; best = r; }
  }
  return bestScore >= 70 ? best : null;
}

function scoreSeriesResults(results, tmdbSlug, tmdbYear) {
  var best = null, bestScore = 0, i, r, slug, score;
  for (i = 0; i < results.length; i++) {
    r = results[i];
    slug = extractSectionSlug(r.url, "series");
    if (!slug) continue;
    score = slugMatchScore(slug, tmdbSlug) + yearScore(r.year, tmdbYear);
    if (score > bestScore) { bestScore = score; best = r; }
  }
  return bestScore >= 70 ? best : null;
}

function scoreEpisodeResults(results, tmdbSlug, season, episode) {
  var i, r, slug;
  var suffix = "-" + season + "x" + episode;
  for (i = 0; i < results.length; i++) {
    r = results[i];
    slug = extractSectionSlug(r.url, "episodes");
    if (!slug) continue;
    if (slug.indexOf(suffix, slug.length - suffix.length) !== -1 && slug.indexOf(tmdbSlug) !== -1) {
      return r;
    }
  }
  return null;
}

/**
 * Dooplay renders every season server-side as:
 *   <div class='numerando'>S - E</div> ... <a href='.../episodes/SLUG-SxE'>Title</a>
 * Walk numerando positions and take the first /episodes/ href before the
 * next numerando marker. Episode slugs frequently differ from the series
 * slug (e.g. series "cobra-kai-tagalog-dubbed" -> episodes "cobra-kai-5x1"),
 * so guessing from the series slug alone is not reliable.
 */
function findEpisodeUrlInSeries(html, season, episode) {
  var re = /numerando['"]>\s*(\d+)\s*-\s*(\d+)\s*</gi;
  var positions = [];
  var m;
  while ((m = re.exec(html)) !== null) {
    positions.push({ s: parseInt(m[1], 10), e: parseInt(m[2], 10), idx: m.index });
  }
  var i, end, seg, href;
  for (i = 0; i < positions.length; i++) {
    if (positions[i].s === season && positions[i].e === episode) {
      end = (i + 1 < positions.length) ? positions[i + 1].idx : Math.min(html.length, positions[i].idx + 6000);
      seg = html.substring(positions[i].idx, end);
      href = seg.match(/href=['"]([^'"]*\/episodes\/[^'"]+)['"]/i);
      if (href) {
        if (href[1].indexOf("http") === 0) return href[1];
        return BASE_URL + (href[1].charAt(0) === "/" ? href[1] : "/" + href[1]);
      }
    }
  }
  return null;
}

function absoluteUrl(url) {
  if (!url) return "";
  if (url.indexOf("http") === 0) return url;
  return BASE_URL + (url.charAt(0) === "/" ? url : "/" + url);
}

/**
 * Resolve the concrete PMH page (movie page or episode page) for a title.
 * Returns Promise<pageUrl:string|null>.
 */
function resolvePageUrl(mediaType, tmdb, season, episode) {
  var tmdbSlug = slugify(tmdb.title);
  var altSlug = slugify(tmdb.original);
  var pageUrl;
  var tryFetchPlayers = function(url) {
    return fetchText(url).then(function(html) {
      return hasPlayerOptions(html) ? html : null;
    }).catch(function() { return null; });
  };

  if (mediaType === "movie") {
    pageUrl = BASE_URL + "/movies/" + tmdbSlug;
    return tryFetchPlayers(pageUrl).then(function(html) {
      if (html) return { url: pageUrl, html: html };
      if (altSlug && altSlug !== tmdbSlug) {
        var altUrl = BASE_URL + "/movies/" + altSlug;
        return tryFetchPlayers(altUrl).then(function(html2) {
          if (html2) return { url: altUrl, html: html2 };
          return { url: "", html: "" }; // fall through to search
        });
      }
      return { url: "", html: "" };
    });
  }

  // TV: guess /episodes/{slug}-{s}x{e} first.
  pageUrl = BASE_URL + "/episodes/" + tmdbSlug + "-" + season + "x" + episode;
  return tryFetchPlayers(pageUrl).then(function(html) {
    if (html) return { url: pageUrl, html: html };
    return getSearchNonce(false).then(function(nonce) {
      if (!nonce) return { url: "", html: "" };
      return searchWithRetry(tmdb.title).then(function(results) {
        // 1) an exact episode page from search
        var ep = scoreEpisodeResults(results, tmdbSlug, season, episode);
        if (ep) {
          return tryFetchPlayers(absoluteUrl(ep.url)).then(function(html3) {
            if (html3) return { url: absoluteUrl(ep.url), html: html3 };
            return { url: "", html: "" };
          });
        }
        // 2) series page from search -> scrape episode map
        var series = scoreSeriesResults(results, tmdbSlug, tmdb.year);
        var seriesUrl = series ? absoluteUrl(series.url) : "";
        var fetchSeries = seriesUrl
          ? fetchText(seriesUrl)
          : Promise.resolve("");
        return fetchSeries.then(function(seriesHtml) {
          if (seriesHtml) {
            var epUrl = findEpisodeUrlInSeries(seriesHtml, season, episode);
            if (epUrl) {
              return tryFetchPlayers(epUrl).then(function(html4) {
                if (html4) return { url: epUrl, html: html4 };
                return { url: "", html: "" };
              });
            }
          }
          // 3) last resort: guess episode URL from the series slug
          if (series) {
            var sSlug = extractSectionSlug(series.url, "series");
            if (sSlug) {
              var guess = BASE_URL + "/episodes/" + sSlug + "-" + season + "x" + episode;
              return tryFetchPlayers(guess).then(function(html5) {
                if (html5) return { url: guess, html: html5 };
                return { url: "", html: "" };
              });
            }
          }
          return { url: "", html: "" };
        });
      });
    });
  });
}

// ===== DOOPLAY PLAYER OPTIONS =====

function hasPlayerOptions(html) {
  return /dooplay_player_option[^>]*data-post=['"]?\d+/i.test(html) ||
         /data-post=['"]\d+['"][^>]*data-type=['"][^'"]+['"]/i.test(html);
}

function extractPlayerOptions(html) {
  var options = [];
  var seen = {};
  var m;
  var liRe = /<li[^>]*class=['"][^'"]*dooplay_player_option[^'"]*['"][^>]*>([\s\S]*?)<\/li>/gi;
  while ((m = liRe.exec(html)) !== null) {
    var tag = m[0];
    var post = attrValue(tag, "data-post") || attrValue(tag, "data-id");
    if (!post) continue;
    var type = attrValue(tag, "data-type") || "movie";
    var nume = attrValue(tag, "data-nume") || attrValue(tag, "data-source") || "1";
    var labelMatch = m[1].match(/<span[^>]*class=['"][^'"]*title[^'"]*['"][^>]*>([^<]*)<\//i);
    var label = labelMatch ? stripTags(labelMatch[1]) : "";
    var key = post + "-" + nume;
    if (seen[key]) continue;
    seen[key] = 1;
    options.push({ post: post, type: type, nume: nume, label: label });
  }
  if (!options.length) {
    var tagRe = /<[^>]*data-post=['"](\d+)['"][^>]*>/gi;
    while ((m = tagRe.exec(html)) !== null) {
      var tag2 = m[0];
      var post2 = m[1];
      var type2 = attrValue(tag2, "data-type") || "movie";
      var nume2 = attrValue(tag2, "data-nume") || attrValue(tag2, "data-source") || "1";
      var key2 = post2 + "-" + nume2;
      if (seen[key2]) continue;
      seen[key2] = 1;
      options.push({ post: post2, type: type2, nume: nume2, label: "" });
    }
  }
  console.log("[PinoyMoviesHub] Found", options.length, "player option(s)");
  return options;
}

function callDooPlayerAPI(player, pageUrl) {
  var apiUrl = BASE_URL + "/wp-json/dooplayer/v2/" + player.post + "/" + player.type + "/" + player.nume;
  return fetchJson(apiUrl, {
    headers: {
      "X-Requested-With": "XMLHttpRequest",
      "Referer": pageUrl || BASE_URL + "/"
    }
  }).then(function(data) {
    if (!data) return "";
    if (Object.prototype.toString.call(data) === "[object Array]") data = data[0];
    if (!data) return "";
    var embedUrl = data.embed_url || data.url || data.source || data.link || data.file || data.src;
    if (!embedUrl && data.data) {
      embedUrl = data.data.embed_url || data.data.url || data.data.source;
    }
    if (!embedUrl && (data.html || data.iframe)) {
      var m = String(data.html || data.iframe).match(/src=['"]([^'"]+)['"]/i);
      if (m) embedUrl = m[1];
    }
    return embedUrl ? String(embedUrl) : "";
  }).catch(function() { return ""; });
}

// ===== EXTRACTOR: MIXDROP (direct mp4 via Dean Edwards unpacker) =====

function jsUnescape(s) {
  return String(s).replace(/\\(u[0-9a-fA-F]{4}|x[0-9a-fA-F]{2}|[0-3][0-7]{0,2}|[\\nrtbfv'"0])/g, function(all, esc) {
    if (esc.charAt(0) === "u" || esc.charAt(0) === "x") {
      return String.fromCharCode(parseInt(esc.slice(1), 16));
    }
    switch (esc) {
      case "n": return "\n";
      case "r": return "\r";
      case "t": return "\t";
      case "b": return "\b";
      case "f": return "\f";
      case "v": return "\v";
      case "0": return "\0";
      case "\\": return "\\";
      case "'": return "'";
      case '"': return '"';
      default: return esc;
    }
  });
}

/**
 * Pure-JS Dean Edwards packer unpacker (p,a,c,k,e,d).
 * Mixdrop embeds the player config in an eval(function(p,a,c,k,e,d){...})
 * payload containing MDCore.wurl (the direct file URL).
 */
function unpackPacker(packed) {
  // Canonical Dean Edwards single-quoted layout:
  // }('payload',base,count,'k0|k1|...'.split('|'),0,{})
  var m = String(packed).match(/\}\s*\(\s*'((?:\\.|[^'\\])*)'\s*,\s*\d+\s*,\s*(\d+)\s*,\s*'([^']*)'\.split\('\|'\)/);
  if (!m) return "";
  var payload = jsUnescape(m[1]);
  var keys = jsUnescape(m[3]).split("|");
  var dict = {};
  var i;
  for (i = 0; i < keys.length; i++) dict[String(i)] = keys[i];
  return payload.replace(/\b\w+\b/g, function(w) {
    return (dict[w] !== undefined && dict[w] !== "") ? dict[w] : w;
  });
}

function extractMixdropDirect(embedUrl) {
  return fetchText(embedUrl, {
    headers: {
      "Referer": BASE_URL + "/",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
    }
  }).then(function(html) {
    var packedMatch = html.match(/eval\(function\(p,a,c,k,e,d\)[\s\S]{0,3000}?\}\)\)/);
    var unpacked = packedMatch ? unpackPacker(packedMatch[0]) : "";
    var wurl = "";
    var m = unpacked.match(/MDCore\.wurl\s*=\s*["']([^"']*)["']/);
    if (m) wurl = m[1];
    if (!wurl) {
      m = html.match(/MDCore\.wurl\s*=\s*["']([^"']*)["']/);
      if (m) wurl = m[1];
    }
    if (!wurl || wurl === " " || wurl.length < 6) return null;
    if (wurl.indexOf("//") === 0) wurl = "https:" + wurl;
    else if (wurl.indexOf("http") !== 0) wurl = "https://" + wurl.replace(/^\/+/, "");
    var host = hostOf(embedUrl);
    return {
      url: wurl,
      headers: { Referer: "https://" + host + "/", "User-Agent": HEADERS["User-Agent"] }
    };
  }).catch(function(e) {
    console.log("[PinoyMoviesHub] mixdrop extract failed:", e.message);
    return null;
  });
}

// ===== EXTRACTOR: BYSE (React SPA -> /api/videos/{code} -> AES-GCM payload) =====

var LANE_TIMEOUT_MS = 20000; // per-player extraction deadline (v5.2.2)

function isByse(host) {
  return /byse/.test(String(host || "").toLowerCase());
}

/**
 * Deterministic stream ordering (v5.2.2). Lower sorts first:
 *   0 Byse    - signed, self-authorizing URLs, play headerless everywhere
 *   1 Mixdrop - CDN enforces Referer (fine on mobile, needs proxy on webOS)
 *   2 Dood    - same Referer-enforcing family
 *   3 unknown
 * The site's own player chip (label) is the stable signal - Byse playback
 * domains are randomized edges - with a host-pattern fallback.
 */
function hostPriority(label, embedHost) {
  var l = String(label || "").toLowerCase();
  var h = String(embedHost || "").toLowerCase();
  if (/byse/.test(l) || /byse/.test(h)) return 0;
  if (/mixdrop|mixdrp|mxdrop|miixdrop|mixdroop/.test(l) || /mixdrop|mixdrp|mxdrop|miixdrop|mixdroop/.test(h)) return 1;
  if (/dood|dsvplay|dooo|playmogo|myvidplay|d000d|ds2play/.test(l) || /dood|dsvplay|dooo|playmogo|myvidplay|d000d|ds2play/.test(h)) return 2;
  return 3;
}

/**
 * Resolves null when the lane exceeds ms; the underlying work keeps running
 * and its late result is discarded. One slow CDN can no longer stall (or
 * via a global timeout, discard) the faster lanes - partial results ship
 * as soon as the deadline fires.
 */
function withLaneDeadline(promise, ms) {
  if (!hasTimers()) return promise.catch(function () { return null; });
  return new Promise(function(resolve) {
    var settled = false;
    var timer = setTimeout(function() {
      if (!settled) { settled = true; resolve(null); }
    }, ms || LANE_TIMEOUT_MS);
    promise.then(function(r) {
      if (!settled) { settled = true; clearTimeout(timer); resolve(r); }
    }, function() {
      if (!settled) { settled = true; clearTimeout(timer); resolve(null); }
    });
  });
}

/**
 * Byse embeds (e.g. https://bysesayeveum.com/e/{code}) are a Vite/React SPA.
 * The video sources are served by the same origin:
 *   GET /api/videos/{code}
 *     -> { playback: { algorithm: "AES-256-GCM", iv, payload, key_parts,
 *                      version, expires_at }, premium_only, ... }
 * The plaintext is { sources: [{ url, label, mime_type, height, ... }] } with
 * signed direct HLS/mp4 URLs (3h validity). Because the whole flow runs at
 * play time on the user's device, the signed URL is minted for that device.
 */
function extractByseDirect(embedUrl) {
  var codeMatch = embedUrl.match(/\/e\/([a-z0-9]+)/i);
  if (!codeMatch) return Promise.resolve(null);
  var code = codeMatch[1];
  var host = hostOf(embedUrl);
  var apiUrl = "https://" + host + "/api/videos/" + code;
  return fetchJson(apiUrl, {
    headers: {
      "Accept": "application/json",
      "Referer": BASE_URL + "/",
      "Origin": BASE_URL
    }
  }).then(function(data) {
    if (!data || data.error || !data.playback) return null;
    if (data.premium_only) return null;
    var pb = data.playback;
    if (!pb || !pb.payload || !pb.iv || pb.algorithm !== "AES-256-GCM") return null;
    var keyBytes = byseKeyFromParts(pb);
    if (!keyBytes || keyBytes.length !== 32) return null;
    var plain = aesGcmDecryptNoTag(keyBytes, b64urlToBytes(pb.iv), b64urlToBytes(pb.payload));
    if (!plain.length) return null;
    var info;
    try { info = JSON.parse(bytesToUtf8(plain)); } catch (e) { return null; }
    var sources = (info && info.sources) || [];
    var best = null, bestH = -1, i, s, h;
    for (i = 0; i < sources.length; i++) {
      s = sources[i];
      if (!s || !s.url || String(s.url).indexOf("http") !== 0) continue;
      h = parseInt(s.height, 10) || 0;
      if (h >= bestH) { bestH = h; best = s; }
    }
    if (!best) return null;
    var isHls = /m3u8/i.test(String(best.mime_type || "") + String(best.url));
    var q = (best.label && best.label !== "x")
      ? parseQuality(String(best.label))
      : (parseInt(best.height, 10) ? parseQuality(String(best.height) + "p") : "Auto");
    // v5.2.2 TV-SAFE: the signed URL is self-authorizing (bearer-style), so
    // NO playback headers are attached. webOS can play it directly with the
    // stock player; ExoPlayer plays it identically. The Referer/Origin used
    // above stay extraction-only.
    return {
      url: String(best.url),
      quality: q,
      isHls: isHls
    };
  }).catch(function(e) {
    console.log("[PinoyMoviesHub] byse extract failed:", e.message);
    return null;
  });
}

// ===== EXTRACTOR: DOODSTREAM FAMILY (pass_md5 flow + gate detection) =====

function isDoodFamily(host) {
  var h = String(host || "").toLowerCase();
  if (h.indexOf("dood") !== -1) return true;
  if (h.indexOf("dsvplay") !== -1 || h.indexOf("dooo") !== -1) return true;
  // known dood-clone custom domains used by PMH
  var known = ["playmogo.com", "myvidplay.com", "dsvplay.com", "d000d.com", "dooood.com", "ds2play.com", "ds2play2.com", "doodcdn.io"];
  var i;
  for (i = 0; i < known.length; i++) {
    if (h === known[i] || h.indexOf(known[i]) !== -1) return true;
  }
  return false;
}

function isMixdrop(host) {
  var h = String(host || "").toLowerCase();
  // mixdrop.top, mixdrop.co, mixdrp.co, mxdrop.to, miixdrop.top, mixdroop.co ...
  return /mixdrop|mixdrp|mxdrop|miixdrop|mixdroop/.test(h);
}

/**
 * Dood clones (playmogo.com, dsvplay.com, dood.yt, ...) reference the
 * pass_md5 path from their player script. Both quoted-path and loose
 * variants exist, and some clones packer-pack the player JS.
 */
function doodFindMd5Path(html) {
  var m = html.match(/['"]\/(pass_md5\/[a-z0-9]+(?:\/[a-z0-9]+)?)['"]/i);
  if (m) return m[1];
  var unpacked = unpackPacker(html);
  if (unpacked) {
    m = unpacked.match(/['"]\/(pass_md5\/[a-z0-9]+(?:\/[a-z0-9]+)?)['"]/i);
    if (m) return m[1];
  }
  m = html.match(/\/pass_md5\/([a-z0-9]+)/i);
  return m ? "pass_md5/" + m[1] : null;
}

function doodIsGated(html) {
  // Cloudflare Turnstile interstitial: solve -> /dood?op=validate -> reload.
  // A pure HTTP client can never pass this, so the player is unextractable.
  return /op=validate|turnstile\.render|challenges\.cloudflare\.com\/turnstile/i.test(html);
}

function doodIsDead(html) {
  return /video you are looking for is not found|class="not_found"/i.test(html);
}

function doodFetchDirect(host, md5Path, refererUrl, qualityHint) {
  var passUrl = "https://" + host + "/" + md5Path;
  return fetchText(passUrl, {
    headers: {
      "Referer": refererUrl,
      "X-Requested-With": "XMLHttpRequest"
    }
  }).then(function(body) {
    var base = String(body).trim();
    if (base.indexOf("http") !== 0) return null;
    var token = md5Path.split("/")[1] || "";
    var expiry = Date.now() + 2 * 60 * 60 * 1000;
    return {
      url: base + randomToken(10) + "?token=" + token + "&expiry=" + expiry,
      quality: parseQuality(qualityHint),
      headers: { Referer: "https://" + host + "/", "User-Agent": HEADERS["User-Agent"] }
    };
  }).catch(function() { return null; });
}

function extractDoodDirect(embedUrl) {
  var embedIdMatch = embedUrl.match(/\/e\/([a-z0-9]+)/i);
  if (!embedIdMatch) return Promise.resolve(null);
  var embedId = embedIdMatch[1];
  var qualityHint = "";

  return fetchTextFollow(embedUrl, {
    headers: { Referer: BASE_URL + "/" }
  }).then(function(page) {
    var html = page.text;
    var host = hostOf(page.url) || hostOf(embedUrl);
    var embedFinalUrl = "https://" + host + "/e/" + embedId;
    var titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
    if (titleMatch) qualityHint = titleMatch[1];

    if (doodIsGated(html)) {
      console.log("[PinoyMoviesHub] dood captcha-gated, skipping (" + host + ")");
      return null;
    }
    if (doodIsDead(html)) {
      console.log("[PinoyMoviesHub] dood video dead, skipping (" + host + ")");
      return null;
    }

    var md5Path = doodFindMd5Path(html);
    if (md5Path) return doodFetchDirect(host, md5Path, embedFinalUrl, qualityHint);

    // Legacy fallback: /d/{id} download page (dref_url cookie set client-side).
    return fetchTextFollow("https://" + host + "/d/" + embedId, {
      headers: { Referer: embedFinalUrl, Cookie: "dref_url=" + encodeURIComponent(embedFinalUrl) }
    }).then(function(dl) {
      if (doodIsGated(dl.text)) return null;
      var t2 = dl.text.match(/<title[^>]*>([^<]*)<\/title>/i);
      if (t2 && !qualityHint) qualityHint = t2[1];
      var dlHost = hostOf(dl.url) || host;
      var md5Path2 = doodFindMd5Path(dl.text);
      if (!md5Path2) return null;
      return doodFetchDirect(dlHost, md5Path2, "https://" + dlHost + "/d/" + embedId, qualityHint);
    });
  }).catch(function(e) {
    console.log("[PinoyMoviesHub] dood extract failed (" + embedUrl + "):", e.message);
    return null;
  });
}

// ===== STREAM BUILDER =====

function shortLabel(player) {
  var label = String((player && player.label) || "");
  label = label.replace(/^watch\s*online\s*[-:]\s*/i, "").trim();
  return label || "Source " + ((player && player.nume) || "?");
}

function buildStream(displayTitle, player, resolved, meta, embedHost) {
  // resolved: { url, headers?, quality? } - direct links only. Byse lanes
  // carry no headers at all (TV-safe); Mixdrop/Dood carry Referer+UA, which
  // NuvioMobile's ExoPlayer sends natively.
  var host = hostOf(resolved.url);
  var lang = inferLang((player && player.label) || "");
  var label = shortLabel(player);
  var q = resolved.quality && resolved.quality !== "Auto" ? resolved.quality : parseQuality(label);

  var line1 = meta.isSeries
    ? "S" + meta.season + "E" + meta.episode + (meta.episodeTitle ? " - " + meta.episodeTitle : "") + " | " + displayTitle
    : displayTitle;
  var line2 = "Direct | " + q + " | " + lang + (host ? " | " + host : "");
  var line3 = label;

  var stream = {
    name: PROVIDER_NAME + " | " + label + " | " + q,
    title: line1 + "\n" + line2 + "\n" + line3,
    url: resolved.url,
    quality: q,
    behaviorHints: {
      bingeGroup: "pinoymovieshub-direct"
    }
  };
  // Headers ONLY when the CDN enforces them. A missing headers field is the
  // TV-safe signal: nothing for a webOS player to choke on.
  if (resolved.headers) stream.headers = resolved.headers;
  // Internal sort key, stripped in getStreams before returning.
  stream._hostPriority = hostPriority(label, embedHost);
  return stream;
}

// ===== MAIN ENTRY =====

function getStreams(tmdbId, mediaType, season, episode) {
  // Legacy signatures:
  //   getStreams(tmdbId, season, episode)               -> mediaType undefined
  //   getStreams(tmdbId, mediaType, season, episode)    -> Nuvio contract (4 args)
  if (mediaType !== "movie" && mediaType !== "tv") {
    // shift: mediaType slot actually held season (or nothing)
    episode = season;
    season = mediaType;
    mediaType = "";
  }

  try { tmdbId = String(tmdbId); } catch (e) { tmdbId = ""; }
  season = (season === undefined || season === null || season === "") ? "" : String(season).replace(/^s/i, "").replace(/[^0-9]/g, "");
  episode = (episode === undefined || episode === null || episode === "") ? "" : String(episode).replace(/^e/i, "").replace(/[^0-9]/g, "");

  console.log("[PinoyMoviesHub] === START tmdbId=" + tmdbId + " type=" + mediaType + " S" + season + "E" + episode + " ===");

  if (!tmdbId) return Promise.resolve([]);

  var forceTv = mediaType === "tv" || (!!(season && episode) && !mediaType);

  var tmdbPromise = mediaType === "movie"
    ? tmdbLookup("movie", tmdbId).then(function(r) { return r || getTmdbInfoAuto(tmdbId); })
    : forceTv
      ? tmdbLookup("tv", tmdbId).then(function(r) { return r || { type: "", title: "", original: "", year: "", raw: null }; })
      : getTmdbInfoAuto(tmdbId);

  return tmdbPromise.then(function(tmdb) {
    if (!tmdb || !tmdb.type || !tmdb.title) {
      console.log("[PinoyMoviesHub] Could not detect media for TMDB ID:", tmdbId);
      return [];
    }
    var type = tmdb.type;
    console.log("[PinoyMoviesHub] type=" + type + " | title=" + tmdb.title + " | year=" + tmdb.year);

    if (type === "tv" && (!season || !episode)) {
      console.log("[PinoyMoviesHub] TV show requires season and episode");
      return [];
    }

    var epPromise = type === "tv"
      ? getTmdbEpisodeTitle(tmdbId, season, episode)
      : Promise.resolve("");

    return epPromise.then(function(episodeTitle) {
      var meta = {
        isSeries: type === "tv",
        season: season,
        episode: episode,
        episodeTitle: episodeTitle
      };
      var displayTitle = meta.isSeries
        ? tmdb.title + " S" + season + "E" + episode
        : tmdb.title;

      return resolvePageUrl(type, tmdb, season, episode).then(function(page) {
        var html = page && page.html;
        if (!html) {
          console.log("[PinoyMoviesHub] No PMH page/players found for \"" + tmdb.title + "\"");
          return [];
        }
        var options = extractPlayerOptions(html);
        if (!options.length) return [];

        // Prefer real sources; only fall back to trailer posts when nothing else exists.
        var realOptions = [];
        var trailerOptions = [];
        var oi;
        for (oi = 0; oi < options.length; oi++) {
          if (/trailer/i.test(options[oi].label || "")) trailerOptions.push(options[oi]);
          else realOptions.push(options[oi]);
        }
        var chosen = realOptions.length ? realOptions : trailerOptions;

        return Promise.all(chosen.slice(0, 8).map(function(player) {
          return withLaneDeadline(callDooPlayerAPI(player, page.url).then(function(embedUrl) {
            if (!embedUrl) return null;
            var host = hostOf(embedUrl);
            var extractor = null;

            if (isMixdrop(host)) {
              extractor = extractMixdropDirect(embedUrl);
            } else if (isByse(host)) {
              extractor = extractByseDirect(embedUrl);
            } else if (isDoodFamily(host)) {
              extractor = extractDoodDirect(embedUrl);
            } else {
              // Unknown host: content-sniff for a mixdrop-style player
              // (auto-covers future mirror domains), then try the Byse API
              // shape (covers rebranded domains), else give up.
              extractor = extractMixdropDirect(embedUrl).then(function(direct) {
                return direct || extractByseDirect(embedUrl);
              });
            }

            return extractor.then(function(direct) {
              if (direct && direct.url) {
                return buildStream(displayTitle, player, {
                  url: direct.url,
                  headers: direct.headers,
                  quality: direct.quality
                }, meta, host);
              }
              // Extraction unavailable (captcha-gated dood, dead video,
              // unknown SPA): skip the player. Nuvio has no webview on any
              // platform, so an embed URL could never play anyway.
              return null;
            });
          }, LANE_TIMEOUT_MS));
        })).then(function(results) {
          var streams = [];
          var i;
          for (i = 0; i < results.length; i++) {
            if (results[i]) streams.push(results[i]);
          }
          // v5.2.2: Byse first (plays everywhere), then Mixdrop, then Dood.
          streams.sort(function(a, b) {
            var pa = a._hostPriority === undefined ? 3 : a._hostPriority;
            var pb = b._hostPriority === undefined ? 3 : b._hostPriority;
            if (pa !== pb) return pa - pb;
            return 0;
          });
          for (i = 0; i < streams.length; i++) delete streams[i]._hostPriority;
          console.log("[PinoyMoviesHub] Returning", streams.length, "stream(s)");
          return streams;
        });
      });
    });
  }).catch(function(err) {
    console.error("[PinoyMoviesHub] error:", (err && err.message) || err);
    return [];
  });
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { getStreams: getStreams };
} else {
  global.getStreams = getStreams;
}
