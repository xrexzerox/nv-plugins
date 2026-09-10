// providers/animotvslash.js
// v5.1.0: slug-guess 404s fixed with a real search fallback. Anime titles
// romanize inconsistently (TMDB "Naruto Shippūden" -> slug "naruto-shippden"
// but the site uses "naruto-shippuuden"); no static map can guess every
// romanization, so when the direct slug candidates 404 we now run the
// site's own WordPress search (?s=), match rows by title, fetch the
// /anime/{slug}/ page and pick the real -episode-{n}/ link from it. Also
// transliterates Latin macrons in slugify so fewer titles need the fallback.
// KNOWN LIMITATION (site-side migration, audited live 2026-09-10): the site
// is moving its players from the extractable plyr/jw configs to device-bound
// SPA players (animotvslash.ru/watch SPA + animotvslash.p2pplay.pro). The
// p2pplay player requires an encrypted /api/v1/info payload plus a
// session token signed from browser fingerprints (sessionId/userId/playerId)
// - a plain HTTP client cannot mint one, so episode pages whose iframe is
// p2pplay/.ru fail soft with zero streams. Pages still on the plyr/jw
// configs (and tryembed, when it returns) extract as before.
// v5.0.0: the site dropped tryembed.us.cc for most episode pages and now
// embeds a self-hosted player: animotvslash.org/plyr-player/{base64}
// where base64 is a JSON config whose .url is a DIRECT, HEADERLESS
// cdn.videas.fr HLS master playlist (verified 200 with zero custom
// headers, variants 360p/480p/720p/1080p). tryembed + admin-ajax paths
// are kept as fallbacks for pages the site has not migrated yet.

const TMDB_API_KEY = '6dc830f9624b43261325bed3bf7d0dfa';

const ONE_PIECE_SEASON_OFFSET = {
  1: 1, 2: 62, 3: 93, 4: 131, 5: 159, 6: 196, 7: 207, 8: 230,
  9: 264, 10: 279, 11: 293, 12: 303, 13: 317, 14: 337, 15: 354,
  16: 382, 17: 391, 18: 409, 19: 419, 20: 430, 21: 446, 22: 460, 23: 1156,
};

const SLUG_OVERRIDES = {
  "303460": "the-strongest-occupation-is-not-a-hero-or-a-sage-but-an-appraiser-provisional",
};

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
  'Referer': 'https://animotvslash.org/',
};

const EMBED_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',
  'Accept': '*/*',
  'Accept-Language': 'en-US,en;q=0.9',
  'Origin': 'https://tryembed.us.cc',
  'Referer': 'https://tryembed.us.cc/',
  'Sec-Fetch-Dest': 'empty',
  'Sec-Fetch-Mode': 'cors',
  'Sec-Fetch-Site': 'same-origin',
};

// Token cache to avoid repeated API calls
const tokenCache = {};

let cookieJar = {};

function extractCookies(response) {
  const cookies = {};
  const setCookie = response.headers.get('set-cookie');
  if (setCookie) {
    setCookie.split(',').forEach(cookie => {
      const match = cookie.match(/^([^=]+)=([^;]+)/);
      if (match) cookies[match[1].trim()] = match[2].trim();
    });
  }
  return cookies;
}

function buildCookieHeader() {
  return Object.entries(cookieJar).map(([k, v]) => `${k}=${v}`).join('; ');
}

function mergeCookies(newCookies) {
  cookieJar = { ...cookieJar, ...newCookies };
}

async function fetchWithCookies(url, options = {}) {
  const cookieHeader = buildCookieHeader();
  const headers = {
    ...(options.headers || HEADERS),
    ...(cookieHeader ? { 'Cookie': cookieHeader } : {}),
  };

  const res = await fetch(url, {
    ...options,
    headers,
    redirect: 'follow',
  });

  const newCookies = extractCookies(res);
  if (Object.keys(newCookies).length > 0) {
    mergeCookies(newCookies);
  }

  return res;
}

async function fetchHTMLWithCookies(url) {
  try {
    const res = await fetchWithCookies(url, { headers: HEADERS });
    const finalUrl = res.url;
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();
    return { html, finalUrl };
  } catch (err) {
    console.error(`[animotvslash] fetch error ${url}:`, err.message);
    return { html: null, finalUrl: url };
  }
}

async function fetchJSONWithCookies(url, customHeaders) {
  try {
    const res = await fetchWithCookies(url, { headers: customHeaders || HEADERS });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

function slugify(title) {
  return stripAccents(String(title || '').toLowerCase())
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

var ACCENT_LATIN = {
  'Ā': 'A', 'ā': 'a', 'Ă': 'A', 'ă': 'a', 'Ą': 'A', 'ą': 'a',
  'Ć': 'C', 'ć': 'c', 'Č': 'C', 'č': 'c',
  'Ď': 'D', 'ď': 'd', 'Đ': 'D', 'đ': 'd',
  'Ē': 'E', 'ē': 'e', 'Ė': 'E', 'ė': 'e', 'Ę': 'E', 'ę': 'e', 'Ě': 'E', 'ě': 'e',
  'Ğ': 'G', 'ğ': 'g', 'Ģ': 'G', 'ģ': 'g',
  'Ī': 'I', 'ī': 'i', 'Į': 'I', 'į': 'i', 'İ': 'I', 'ı': 'i',
  'Ķ': 'K', 'ķ': 'k',
  'Ĺ': 'L', 'ĺ': 'l', 'Ļ': 'L', 'ļ': 'l', 'Ł': 'L', 'ł': 'l',
  'Ń': 'N', 'ń': 'n', 'Ņ': 'N', 'ņ': 'n', 'Ň': 'N', 'ň': 'n',
  'Ō': 'O', 'ō': 'o', 'Ő': 'O', 'ő': 'o', 'Œ': 'Oe', 'œ': 'oe',
  'Ŕ': 'R', 'ŕ': 'r', 'Ř': 'R', 'ř': 'r',
  'Ś': 'S', 'ś': 's', 'Š': 'S', 'š': 's', 'Ş': 'S', 'ş': 's',
  'Ť': 'T', 'ť': 't', 'Ŧ': 'T', 'ŧ': 't',
  'Ū': 'U', 'ū': 'u', 'Ů': 'U', 'ů': 'u', 'Ű': 'U', 'ű': 'u', 'Ų': 'U', 'ų': 'u',
  'Ŵ': 'W', 'ŵ': 'w', 'Ÿ': 'Y', 'Ź': 'Z', 'ź': 'z', 'Ż': 'Z', 'ż': 'z', 'Ž': 'Z', 'ž': 'z'
};

function stripAccents(s) {
  return String(s || '').replace(/[\u0100-\u017f]/g, function (ch) {
    return ACCENT_LATIN[ch] !== undefined ? ACCENT_LATIN[ch] : ch;
  });
}

/** Loose title key for search-row matching: accents out, alnum only. */
function titleKey(s) {
  return stripAccents(String(s || '').toLowerCase()).replace(/[^a-z0-9]/g, '');
}

function getTmdbInfoAuto(tmdbId) {
    var movieUrl = `https://api.themoviedb.org/3/movie/${tmdbId}?api_key=${TMDB_API_KEY}`;
    return fetchJSONWithCookies(movieUrl).then(function(data) {
        var title = data.title || "";
        var original = data.original_title || title;
        var year = (data.release_date || "").split("-")[0];
        return { type: "movie", title: title, original: original, year: year, raw: data };
    }).catch(function() {
        var tvUrl = `https://api.themoviedb.org/3/tv/${tmdbId}?api_key=${TMDB_API_KEY}`;
        return fetchJSONWithCookies(tvUrl).then(function(data) {
            var title = data.name || "";
            var original = data.original_name || title;
            var year = (data.first_air_date || "").split("-")[0];
            return { type: "tv", title: title, original: original, year: year, raw: data };
        });
    }).catch(function() {
        return { type: "", title: "", original: "", year: "", raw: null };
    });
}

async function getPostId(pageHtml, slug) {
  let match = pageHtml.match(/<link rel="shortlink" href="[^"]*\?p=(\d+)"/);
  if (match) return match[1];
  match = pageHtml.match(/"post_id":"(\d+)"/);
  if (match) return match[1];
  match = pageHtml.match(/\/wp-json\/wp\/v2\/posts\/(\d+)/);
  if (match) return match[1];
  match = pageHtml.match(/data-post-id="(\d+)"/);
  if (match) return match[1];
  match = pageHtml.match(/\?p=(\d+)/);
  if (match) return match[1];

  const apiUrl = `https://animotvslash.org/wp-json/wp/v2/posts?slug=${slug}`;
  const data = await fetchJSONWithCookies(apiUrl);
  if (data && data.length > 0) return data[0].id;

  return null;
}

function extractAnimeId(html, postId) {
  const embedMatch = html.match(/tryembed\.us\.cc\/embed\/anime\/(\d+)/);
  if (embedMatch) return embedMatch[1];

  const dataMatch = html.match(/data-anime-id=["'](\d+)["']/i);
  if (dataMatch) return dataMatch[1];

  const jsMatch = html.match(/anime[_-]?id\s*[:=]\s*["']?(\d+)["']?/i);
  if (jsMatch) return jsMatch[1];

  const jsonMatch = html.match(/"animeId"\s*:\s*(\d+)/);
  if (jsonMatch) return jsonMatch[1];

  const anyEmbed = html.match(/tryembed[^\d]*(\d{3,})/i);
  if (anyEmbed) return anyEmbed[1];

  if (postId) {
    console.log(`[animotvslash] Fallback: post_id=${postId} as anime_id`);
    return postId;
  }

  return null;
}

// ------------------------------------------------------------------
// SELF-HOSTED PLYR PLAYER (v5.0.0 primary path)
// ------------------------------------------------------------------

function b64Decode(str) {
  try {
    var s = String(str).replace(/-/g, '+').replace(/_/g, '/').replace(/[^A-Za-z0-9+/=]/g, '');
    while (s.length % 4) s += '=';
    var bin;
    if (typeof atob === 'function') {
      bin = atob(s);
    } else {
      var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
      var out = '';
      var bc = 0, bs = 0, buffer, i = 0;
      // eslint-disable-next-line no-cond-assign
      while (buffer = s.charAt(i++)) {
        buffer = chars.indexOf(buffer);
        if (~buffer) {
          bs = bc % 4 ? bs * 64 + buffer : buffer;
          // eslint-disable-next-line no-unused-expressions
          bc++ % 4 ? out += String.fromCharCode(255 & bs >> ((-2 * bc) & 6)) : 0;
        }
      }
      bin = out;
    }
    try { return decodeURIComponent(escape(bin)); } catch (e2) { return bin; }
  } catch (e) {
    return '';
  }
}

function decodePlayerConfigs(html) {
  if (!html) return [];
  // The site self-hosts player wrappers that embed a base64 JSON config:
  //   animotvslash.org/plyr-player/{b64}  -> cdn.videas.fr HLS
  //   animotvslash.org/jw-player/{b64}    -> rumble.com HLS
  // Same JSON shape ({url, poster, download_url...}) for both.
  var out = [], seen = {};
  var re = /animotvslash\.org\/[a-z-]*player\/([A-Za-z0-9+/=_-]{20,})/g;
  var m;
  while ((m = re.exec(html)) !== null) {
    if (seen[m[1]]) continue;
    seen[m[1]] = 1;
    var raw = b64Decode(m[1]);
    if (!raw || raw.indexOf('{') === -1) continue;
    try {
      var cfg = JSON.parse(raw);
      if (cfg && cfg.url && /^https?:\/\//i.test(cfg.url)) out.push(cfg);
    } catch (e) {}
  }
  return out;
}

function absolutizeUrl(base, rel) {
  if (/^https?:\/\//i.test(rel)) return rel;
  if (rel.indexOf('//') === 0) return 'https:' + rel;
  if (rel.charAt(0) === '/') {
    var m = base.match(/^(https?:\/\/[^/]+)/);
    return m ? m[1] + rel : rel;
  }
  return base.substring(0, base.lastIndexOf('/') + 1) + rel;
}

// The plyr master playlist is public (headerless) — parse its variants so
// Nuvio gets concrete quality rows instead of a single blind Auto row.
function parseHlsVariants(masterUrl) {
  return fetch(masterUrl).then(function (res) {
    if (!res.ok) return [];
    return res.text().then(function (txt) {
      if (txt.indexOf('#EXT-X-STREAM-INF') === -1) return [];
      var out = [];
      var lines = txt.split(/\r?\n/);
      for (var i = 0; i < lines.length; i++) {
        var line = lines[i];
        if (line.indexOf('#EXT-X-STREAM-INF') === 0) {
          var nm = line.match(/NAME="([^"]+)"/i);
          var label = nm ? nm[1] : (line.match(/RESOLUTION=\d+x(\d+)/i) || [])[1];
          if (label && /^\d+$/.test(String(label))) label = label + 'p';
          var j = i + 1;
          while (j < lines.length && !lines[j].trim()) j++;
          if (j < lines.length) {
            var u = lines[j].trim();
            if (u && u.charAt(0) !== '#') {
              out.push({ name: label || 'Auto', url: absolutizeUrl(masterUrl, u) });
              i = j;
            }
          }
        }
      }
      return out;
    });
  }).catch(function () { return []; });
}

function variantRank(name) {
  var m = String(name || '').match(/(\d{3,4})/);
  return m ? parseInt(m[1], 10) : 0;
}

async function getEmbedUrl(postId, pageHtml, episodeNum) {
  const htmlEmbed = scrapeEmbedFromHtml(pageHtml);
  if (htmlEmbed) {
    console.log(`[animotvslash] HTML scrape: ${htmlEmbed}`);
    return htmlEmbed;
  }

  const animeId = extractAnimeId(pageHtml, postId);
  if (animeId) {
    const constructed = `https://tryembed.us.cc/embed/anime/${animeId}/${episodeNum}/sub`;
    console.log(`[animotvslash] Constructed: ${constructed}`);
    return constructed;
  }

  const ajaxActions = ['dynamic_view_ajax', 'dooplay_player', 'get_player', 'load_embed', 'doo_player'];
  for (const action of ajaxActions) {
    const result = await tryAdminAjax(postId, action, episodeNum);
    if (result) return result;
  }

  return null;
}

function scrapeEmbedFromHtml(html) {
  const iframeMatch = html.match(/<iframe[^>]*src=["']([^"']*tryembed[^"']*)["']/i);
  if (iframeMatch) return iframeMatch[1];

  const matches = html.match(/https:\/\/tryembed\.us\.cc\/[^"'\s<>]+/gi);
  if (matches) {
    const embed = matches.find(u => u.includes('/embed/'));
    if (embed) return embed;
  }

  const dataMatch = html.match(/data-embed=["']([^"']+)["']/i);
  if (dataMatch) return dataMatch[1];

  return null;
}

async function tryAdminAjax(postId, action, episodeNum) {
  const formData = new URLSearchParams();
  formData.append('action', action);
  formData.append('post_id', postId);
  formData.append('nume', episodeNum);
  formData.append('type', 'tv');

  try {
    const res = await fetchWithCookies('https://animotvslash.org/wp-admin/admin-ajax.php', {
      method: 'POST',
      headers: {
        ...HEADERS,
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-Requested-With': 'XMLHttpRequest',
        'Origin': 'https://animotvslash.org',
        'Referer': `https://animotvslash.org/`,
      },
      body: formData.toString(),
    });

    if (!res.ok) return null;

    const text = await res.text();

    if (text.includes('"views"') && !text.includes('iframe') && !text.includes('embed') && !text.includes('tryembed')) {
      console.log(`[animotvslash] action=${action} returned views only`);
      return null;
    }

    console.log(`[animotvslash] action=${action} raw: ${text.substring(0, 300)}`);

    const iframeMatch = text.match(/<iframe[^>]*src=["']([^"']+)["']/i);
    if (iframeMatch) return iframeMatch[1];

    try {
      const json = JSON.parse(text);
      if (json.data) {
        const html = json.data.replace(/\\"/g, '"').replace(/\\\//g, '/');
        const match = html.match(/<iframe[^>]*src=["']([^"']+)["']/i);
        if (match) return match[1];
      }
      if (json.embed_url) return json.embed_url;
      if (json.url) return json.url;
      if (json.iframe) return json.iframe;
    } catch (e) {}

    return null;
  } catch (err) {
    return null;
  }
}

// ------------------------------------------------------------------
// TOKEN TO STREAM URL — With rate limit handling
// ------------------------------------------------------------------

/**
 * Converts a provider token to a signed m3u8 URL
 * Handles 429 rate limits with retry
 */
async function resolveToken(token, embedUrl, retryCount = 0) {
  const cacheKey = `${token}`;
  if (tokenCache[cacheKey]) {
    console.log(`[animotvslash] [token] Cache hit`);
    return tokenCache[cacheKey];
  }

  const signedUrl = `https://tryembed.us.cc/s/${token}.m3u8`;
  console.log(`[animotvslash] [token] Resolving: ${signedUrl.substring(0, 80)}...`);

  try {
    const getRes = await fetchWithCookies(signedUrl, {
      method: 'GET',
      headers: {
        ...EMBED_HEADERS,
        'Referer': embedUrl,
      },
      redirect: 'follow',
    });

    console.log(`[animotvslash] [token] GET status: ${getRes.status}`);

    if (getRes.status === 429 && retryCount < 3) {
      // Rate limited — wait and retry
      const delay = Math.pow(2, retryCount) * 1000;
      console.log(`[animotvslash] [token] 429, retrying in ${delay}ms...`);
      await new Promise(r => setTimeout(r, delay));
      return resolveToken(token, embedUrl, retryCount + 1);
    }

    if (getRes.ok) {
      const finalUrl = getRes.url;
      console.log(`[animotvslash] [token] Final URL: ${finalUrl.substring(0, 100)}...`);

      // Cache the result
      tokenCache[cacheKey] = finalUrl;

      return finalUrl;
    }

    console.log(`[animotvslash] [token] GET failed: ${getRes.status}`);
    return null;

  } catch (err) {
    console.error(`[animotvslash] [token] Error: ${err.message}`);
    return null;
  }
}

// ------------------------------------------------------------------
// STREAM DATA API
// ------------------------------------------------------------------
async function extractTryEmbed(embedUrl) {
  console.log(`[animotvslash] [tryembed] Extracting: ${embedUrl}`);

  const match = embedUrl.match(/\/embed\/anime\/(\d+)\/(\d+)\/(sub|dub)/);
  if (!match) {
    console.log(`[animotvslash] [tryembed] URL format mismatch`);
    return [];
  }

  const [, animeId, episode, audio] = match;
  console.log(`[animotvslash] [tryembed] animeId=${animeId}, ep=${episode}, audio=${audio}`);

  const apiUrl = `https://tryembed.us.cc/api/stream_data?id=${animeId}&episode=${episode}&audio=${audio}`;
  console.log(`[animotvslash] [tryembed] API: ${apiUrl}`);

  const streamData = await fetchJSONWithCookies(apiUrl, {
    ...EMBED_HEADERS,
    'Referer': embedUrl,
  });

  if (!streamData) {
    console.log(`[animotvslash] [tryembed] API no response`);
    return [];
  }

  console.log(`[animotvslash] [tryembed] API keys: ${Object.keys(streamData).join(', ')}`);

  const providers = streamData.providers || streamData.sources || streamData.streams;

  if (providers && Array.isArray(providers) && providers.length > 0) {
    console.log(`[animotvslash] [tryembed] Found ${providers.length} provider(s)`);

    const results = [];

    for (let i = 0; i < providers.length; i++) {
      const provider = providers[i];
      const providerName = provider.name || provider.server || provider.id || `Server ${i + 1}`;
      const providerType = provider.type || 'hls';

      console.log(`[animotvslash] [tryembed] Provider ${i}: ${providerName} (type=${providerType})`);

      const qualities = provider.qualities || provider.sources || [{ name: 'Auto', token: provider.token || provider.url }];

      if (!qualities || !Array.isArray(qualities)) {
        console.log(`[animotvslash] [tryembed] Provider ${i} has no qualities`);
        continue;
      }

      for (let j = 0; j < qualities.length; j++) {
        const quality = qualities[j];
        const qualityName = quality.name || quality.label || `Quality ${j + 1}`;
        const token = quality.token || quality.url || quality.file || quality.src;
        const fallbackToken = quality.fallbackToken;

        if (!token) {
          console.log(`[animotvslash] [tryembed] Quality ${j} has no token`);
          continue;
        }

        console.log(`[animotvslash] [tryembed] Quality ${j}: ${qualityName}`);

        // Resolve token to stream URL
        let streamUrl = await resolveToken(token, embedUrl);

        // If primary fails, try fallback
        if (!streamUrl && fallbackToken) {
          console.log(`[animotvslash] [tryembed] Trying fallback token`);
          streamUrl = await resolveToken(fallbackToken, embedUrl);
        }

        if (streamUrl) {
          results.push({
            url: streamUrl,
            name: `${providerName} - ${qualityName}`,
            type: providerType,
          });
        }
      }
    }

    return results;
  }

  // Fallback: single url field
  const signedUrl = streamData.url || streamData.source || streamData.stream || streamData.m3u8;
  if (signedUrl) {
    console.log(`[animotvslash] [tryembed] Single URL: ${signedUrl.substring(0, 80)}...`);

    try {
      const getRes = await fetchWithCookies(signedUrl, {
        method: 'GET',
        headers: {
          ...EMBED_HEADERS,
          'Referer': embedUrl,
        },
        redirect: 'follow',
      });

      if (getRes.ok) {
        return [{ url: getRes.url, name: 'Auto', type: 'hls' }];
      }
      return [];
    } catch (err) {
      console.error(`[animotvslash] [tryembed] redirect error: ${err.message}`);
      return [];
    }
  }

  console.log(`[animotvslash] [tryembed] No stream URL found`);
  return [];
}

// ------------------------------------------------------------------
// URL fallback resolver
// ------------------------------------------------------------------
async function resolvePageWithFallbacks(candidateUrls) {
    for (let i = 0; i < candidateUrls.length; i++) {
        const url = candidateUrls[i];
        console.log(`[animotvslash] Trying URL (${i + 1}/${candidateUrls.length}): ${url}`);
        const result = await fetchHTMLWithCookies(url);
        if (result.html) {
            const hasPostId = result.html.match(/<link rel="shortlink" href="[^"]*\?p=(\d+)"/) ||
                              result.html.match(/"post_id":"(\d+)"/) ||
                              result.html.match(/\/wp-json\/wp\/v2\/posts\/(\d+)/);
            if (hasPostId) {
                console.log(`[animotvslash] Valid page: ${url}`);
                return { html: result.html, finalUrl: result.finalUrl, pageUrl: url };
            }
        }
    }
    return { html: null, finalUrl: null, pageUrl: null };
}

// ------------------------------------------------------------------
// SEARCH FALLBACK (v5.1.0): romanization-mismatch slugs
// ------------------------------------------------------------------
// TMDB "Naruto Shippūden" slugifies to "naruto-shippden" but the site uses
// "naruto-shippuuden" — no static translit map can guess every romanization.
// When the direct slug candidates 404, run the site's WordPress search and
// match rows by title, then take the real episode link off the show page.

function searchRows(html) {
    const rows = [];
    const re = /<a[^>]+href="(https?:\/\/animotvslash\.org\/[^"]+)"[^>]*>/gi;
    let m;
    while ((m = re.exec(html)) !== null) {
        const tag = m[0];
        const href = m[1].replace(/\/$/, '');
        const tm = tag.match(/title="([^"]+)"/i);
        if (!tm) continue;
        if (href.indexOf('/anime/') !== -1 || /-episode-\d+$/.test(href)) {
            rows.push({ href: href + '/', title: tm[1] });
        }
    }
    return rows;
}

/**
 * Finds the episode/watch page through the site's search when slug guesses
 * fail. Returns the same shape as resolvePageWithFallbacks (or nulls).
 */
async function resolvePageBySearch(title, original, episodeNum) {
    const queries = [];
    if (title) queries.push(title);
    if (original && original !== title) queries.push(original);
    const wantKey = titleKey(title || original || '');
    for (const q of queries) {
        const result = await fetchHTMLWithCookies('https://animotvslash.org/?s=' + encodeURIComponent(q));
        if (!result.html) continue;
        const rows = searchRows(result.html);
        // exact (or prefix) title match; prefer the shortest path per title
        let best = null;
        const want = wantKey;
        for (const row of rows) {
            const rowKey = titleKey(row.title);
            if (!rowKey || !want) continue;
            if (rowKey !== want && !rowKey.startsWith(want) && !want.startsWith(rowKey)) continue;
            if (!best || row.href.length < best.href.length) best = row;
        }
        if (!best) continue;
        console.log(`[animotvslash] search match: "${best.title}" -> ${best.href}`);

        if (/-episode-\d+\/$/.test(best.href)) {
            // direct episode/watch row
            const hit = await resolvePageWithFallbacks([best.href]);
            if (hit.html) return hit;
        }
        // show page (/anime/{slug}/): pick the real episode link off it
        const showPage = await fetchHTMLWithCookies(best.href);
        if (!showPage.html) continue;
        const epRe = /href="https?:\/\/animotvslash\.org\/([a-z0-9-]+-episode-(\d+))\//gi;
        let em, epPath = '';
        while ((em = epRe.exec(showPage.html)) !== null) {
            if (parseInt(em[2], 10) === parseInt(episodeNum, 10) || 1) {
                if (parseInt(em[2], 10) === parseInt(episodeNum, 10)) { epPath = em[1]; break; }
                if (!epPath) epPath = em[1]; // movies: any watch page (episode 1)
            }
        }
        if (epPath) {
            const hit = await resolvePageWithFallbacks(['https://animotvslash.org/' + epPath + '/']);
            if (hit.html) return hit;
        }
    }
    return { html: null, finalUrl: null, pageUrl: null };
}

// ------------------------------------------------------------------
// Main exported function
// ------------------------------------------------------------------
async function getStreams(tmdbId, season, episode) {
    cookieJar = {};

    var mediaType = null;
    if (season === "movie" || season === "tv") {
        mediaType = season;
        season = episode;
        episode = arguments[3];
    }

    var seasonStr = season || "";
    var episodeStr = episode || "";
    var seasonNum = parseInt(season, 10) || 1;
    var episodeNum = parseInt(episode, 10) || 1;
    console.log(`[animotvslash] === START TMDB:${tmdbId} S${seasonStr}E${episodeStr} ===`);

    var forceTv = !!(season && episode);
    var tmdbPromise = forceTv
        ? fetchJSONWithCookies(`https://api.themoviedb.org/3/tv/${tmdbId}?api_key=${TMDB_API_KEY}`).then(function(data) {
            if (!data) throw new Error("TV not found");
            return { type: "tv", title: data.name || "", original: data.original_name || "", year: (data.first_air_date || "").split("-")[0], raw: data };
        }).catch(function() { return { type: "", title: "", original: "", year: "", raw: null }; })
        : getTmdbInfoAuto(tmdbId);

    var tmdbData = await tmdbPromise;
    if (!tmdbData.type) {
        console.log(`[animotvslash] Could not detect type for TMDB:${tmdbId}`);
        return [];
    }
    mediaType = tmdbData.type;
    console.log(`[animotvslash] Type: ${mediaType} | Title: "${tmdbData.title}"`);

    if (mediaType === "tv" && (!season || !episode)) {
        console.log("[animotvslash] TV requires season+episode");
        return [];
    }

    try {
        const title = tmdbData.title;
        if (!title) {
            console.log('[animotvslash] No TMDB title');
            return [];
        }

        let baseSlug = slugify(title);
        if (SLUG_OVERRIDES[tmdbId]) {
            baseSlug = SLUG_OVERRIDES[tmdbId];
            console.log(`[animotvslash] Override slug: ${baseSlug}`);
        }

        let candidateUrls = [];
        if (mediaType === 'tv') {
            if (seasonNum > 1) {
                candidateUrls.push(`https://animotvslash.org/${baseSlug}-season-${seasonNum}-episode-${episodeNum}/`);
            }
            candidateUrls.push(`https://animotvslash.org/${baseSlug}-episode-${episodeNum}/`);
        } else {
            candidateUrls.push(`https://animotvslash.org/${baseSlug}/`);
            candidateUrls.push(`https://animotvslash.org/${baseSlug}-episode-1/`);
        }

        const pageResult = await resolvePageWithFallbacks(candidateUrls);
        if (!pageResult.html) {
            // v5.1.0: slug candidates 404 -> search the site by title. Fixes
            // romanization mismatches (Shippūden -> shippuuden etc.) instead
            // of returning zero streams.
            console.log('[animotvslash] All URLs failed, trying site search...');
            const searchResult = await resolvePageBySearch(title, tmdbData.original, episodeNum);
            if (!searchResult.html) {
                console.log('[animotvslash] Search fallback found nothing either');
                return [];
            }
            return finishStreams(searchResult, tmdbData, mediaType, seasonNum, episodeNum);
        }

        return finishStreams(pageResult, tmdbData, mediaType, seasonNum, episodeNum);

    } catch (err) {
        console.error('[animotvslash] error:', err.message);
        return [];
    }
}

/**
 * Shared tail (v5.1.0): given a resolved episode/watch page, extract player
 * configs and build streams. Split out of getStreams so the search fallback
 * reuses the exact same extraction path.
 */
async function finishStreams(pageResult, tmdbData, mediaType, seasonNum, episodeNum) {
    const { html, pageUrl } = pageResult;

    const postId = await getPostId(html, slugify(tmdbData.title));
    if (!postId) {
        console.log('[animotvslash] No post_id found');
        return [];
    }
    console.log(`[animotvslash] post_id: ${postId}`);

    const streams = [];
    const label = mediaType === 'tv' ? `S${seasonNum}E${episodeNum}` : 'Movie';

        // PRIMARY (v5.0.0): self-hosted player configs -> direct headerless HLS
        // (plyr-player/videas and jw-player/rumble verified 200 with zero headers)
        const configs = decodePlayerConfigs(html);
        for (let ci = 0; ci < configs.length; ci++) {
            const cfg = configs[ci];
            const serverTag = ci === 0 ? '' : ` ${ci + 1}`;
            console.log(`[animotvslash] player config ${ci + 1}: ${cfg.url.substring(0, 90)}...`);

            const variants = await parseHlsVariants(cfg.url);
            if (variants.length > 0) {
                // adaptive master first (player auto-picks), then concrete variants best-first
                streams.push({
                    name: `ANIMOTVSLASH${serverTag} - Auto`,
                    title: label,
                    url: cfg.url,
                    quality: 'Auto',
                    provider: 'animotvslash',
                });
                variants.sort(function (a, b) { return variantRank(b.name) - variantRank(a.name); });
                for (let vi = 0; vi < variants.length; vi++) {
                    streams.push({
                        name: `ANIMOTVSLASH${serverTag} - ${variants[vi].name}`,
                        title: label,
                        url: variants[vi].url,
                        quality: variants[vi].name,
                        provider: 'animotvslash',
                    });
                }
            } else {
                streams.push({
                    name: `ANIMOTVSLASH${serverTag} - Auto`,
                    title: label,
                    url: cfg.url,
                    quality: 'Auto',
                    provider: 'animotvslash',
                });
            }
        }

        if (streams.length === 0) {
            // FALLBACK: legacy tryembed flow (older pages; its API is now
            // signature-gated so this only fires if tryembed comes back)
            const embedUrl = await getEmbedUrl(postId, html, episodeNum);
            if (embedUrl) {
                console.log(`[animotvslash] tryembed embed URL: ${embedUrl}`);
                const providerResults = await extractTryEmbed(embedUrl);
                for (let i = 0; i < providerResults.length; i++) {
                    const result = providerResults[i];
                    console.log(`[animotvslash] Stream ${i + 1}: ${result.url.substring(0, 100)}...`);
                    streams.push({
                        name: `ANIMOTVSLASH - ${result.name}`,
                        title: label,
                        url: result.url,
                        quality: 'Auto',
                        headers: EMBED_HEADERS,
                        provider: 'animotvslash',
                    });
                }
            }
        }

        // NOTE (v5.0.0): the old guaranteed "WebView"/"Page" embed rows were
        // removed — embed URLs are unplayable in Nuvio native players and only
        // cluttered the stream list (same cleanup as pinoyhub v5.1.0).

        console.log(`[animotvslash] Returning ${streams.length} stream(s)`);
        return streams;
}

module.exports = { getStreams };
