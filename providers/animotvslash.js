// providers/animotvslash.js v6.0.0
// The site migrated twice under us (v5.0.0's plyr-player/videos path is GONE
// from episode pages — that was the "not working" root cause). Current flows:
//
//   LANE A (primary): animotvslash.ru multi-server API
//     animotvslash.ru/watch/{anilistId}/{ep}?lang=sub is a React SPA whose
//     player calls  GET /api/stream/{sources|embeds}/{server}
//                   ?anilistId={id}&episode={ep}&lang={sub|dub}
//     verified servers: mochi, mimi, beep, 2dhive, anibd, animedunya,
//     aniwaves, anizone, kaa (responses are JSON — parsed tolerantly so
//     shape changes don't kill the lane).
//     anilistId resolution: AniList GraphQL search on the TMDB title
//     (in-process cached), else harvested from the WP episode page's own
//     ru watch link (the site embeds it directly).
//
//   LANE B: WP episode pages {slug}-episode-N/ (still live — sitemap15)
//     - animotvslash.p2pplay.pro/#<code> self-hosted player: /api/v1/info
//       and /api/v1/video responses are hex(AES-128-CBC). Key/iv extracted
//       from the player bundle via a WebCrypto hook:
//         key = "kiemtienmua911ca"  iv = "1234567890oiuytr"
//       crypto-js (present in BOTH Nuvio runtimes per the require whitelist)
//       performs the decrypt. NOTE: the p2pplay exchange is best-effort —
//       the live browser flow gates /video behind a fingerprint handshake
//       (capacityToken); the decrypt path here handles the case where the
//       server returns sources anyway.
//     - any animotvslash.ru/watch link found feeds LANE A.
//     - legacy tryembed.us.cc flow kept as the final fallback.
//
// ES5-friendly, fail-soft everywhere.

const TMDB_API_KEY = '6dc830f9624b43261325bed3bf7d0dfa';
const CryptoJS = require('crypto-js');

const SITE = 'https://animotvslash.org';
const RU_BASE = 'https://animotvslash.ru';
const P2P_BASE = 'https://animotvslash.p2pplay.pro';

// Optional asian-catalog worker relay (v3.1.0+): SCRAPER_SETTINGS.workerRelay.
// Device runtimes are text-only and some upstreams challenge them; the relay
// fetches with worker-grade HTTP (and its own egress) and base64-wraps replies.
function relayBase() {
  try {
    var s = globalThis.SCRAPER_SETTINGS || {};
    var raw = String(s.workerRelay || s.animotvslashRelay || '').trim().replace(/\/+$/, '');
    return raw && /^https?:\/\//i.test(raw) ? raw : '';
  } catch (e) { return ''; }
}

function relayGetText(url, headers) {
  var base = relayBase();
  if (!base) return Promise.resolve('');
  return fetch(base + '/relay', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ url: url, method: 'GET', headers: headers || {} })
  }).then(function (r) {
    if (!r || !r.ok) return '';
    return r.json();
  }).then(function (j) {
    if (!j || !j.ok || !j.bodyB64) return '';
    var bin = '';
    try {
      var norm = String(j.bodyB64).replace(/-/g, '+').replace(/_/g, '/').replace(/[^A-Za-z0-9+/=]/g, '');
      while (norm.length % 4) norm += '=';
      bin = typeof atob === 'function' ? atob(norm) : Buffer.length ? '' : '';
    } catch (e) { return ''; }
    return bin;
  }).catch(function () { return ''; });
}

const RU_SERVERS = ['mochi', 'mimi', 'beep', '2dhive', 'anibd', 'animedunya', 'aniwaves', 'anizone', 'kaa'];

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
  'Referer': 'https://animotvslash.org/',
};

const RU_HEADERS = {
  'User-Agent': HEADERS['User-Agent'],
  'Accept': 'application/json',
  'Referer': RU_BASE + '/',
  'Origin': RU_BASE,
};

const SLUG_OVERRIDES = {
  "303460": "the-strongest-occupation-is-not-a-hero-or-a-sage-but-an-appraiser-provisional",
};

// ------------------------------------------------------------------
// fetch helpers (fail-soft, text-safe)
// ------------------------------------------------------------------

function fetchText(url, headers, timeoutMs) {
  return fetch(url, { headers: headers || HEADERS })
    .then(function (res) {
      if (!res.ok) return '';
      return res.text();
    })
    .catch(function () { return ''; });
}

function fetchTextDeadline(url, headers, timeoutMs) {
  var p = fetchText(url, headers, timeoutMs);
  return Promise.race([
    p,
    new Promise(function (resolve) { setTimeout(function () { resolve(''); }, timeoutMs || 8000); })
  ]);
}

// direct first (fast, works on residential devices); relay fallback when the
// direct reply is empty/challenge-shaped (or when direct fetch throws).
function fetchUpstreamText(url, headers, timeoutMs) {
  return fetchTextDeadline(url, headers, timeoutMs).then(function (t) {
    if (t && !/Just a moment|challenges\.cloudflare\.com/i.test(t)) return t;
    return relayGetText(url, headers);
  }).catch(function () {
    return relayGetText(url, headers);
  });
}

function fetchJsonText(rawText) {
  try { return JSON.parse(rawText); } catch (e) { return null; }
}

// ------------------------------------------------------------------
// slug / title helpers
// ------------------------------------------------------------------

function slugify(title) {
  return String(title || '').toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function normTitle(s) {
  return String(s || '').toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function titleScore(a, b) {
  var x = normTitle(a), y = normTitle(b);
  if (!x || !y) return 0;
  if (x === y) return 1;
  if (x.indexOf(y) !== -1 || y.indexOf(x) !== -1) return 0.85;
  var xs = x.split(' '), ys = y.split(' '), hit = 0;
  var seen = {};
  for (var i = 0; i < ys.length; i++) seen[ys[i]] = 1;
  for (var j = 0; j < xs.length; j++) if (seen[xs[j]]) hit++;
  return hit / Math.max(xs.length, ys.length);
}

// ------------------------------------------------------------------
// TMDB meta (unchanged behaviour)
// ------------------------------------------------------------------

function tmdbGet(path) {
  var url = 'https://api.themoviedb.org/3' + path + (path.indexOf('?') === -1 ? '?' : '&') + 'api_key=' + TMDB_API_KEY;
  return fetchText(url, { Accept: 'application/json' }, 10000)
    .then(function (t) { return fetchJsonText(t); })
    .catch(function () { return null; });
}

function getTmdbInfoAuto(tmdbId) {
  return tmdbGet('/movie/' + tmdbId).then(function (data) {
    if (data && (data.title || data.original_title)) {
      return {
        type: 'movie',
        title: data.title || '',
        original: data.original_title || data.title || '',
        year: (data.release_date || '').split('-')[0]
      };
    }
    return tmdbGet('/tv/' + tmdbId).then(function (tv) {
      if (tv && (tv.name || tv.original_name)) {
        return {
          type: 'tv',
          title: tv.name || '',
          original: tv.original_name || tv.name || '',
          year: (tv.first_air_date || '').split('-')[0]
        };
      }
      return { type: '', title: '', original: '', year: '' };
    });
  });
}

// ------------------------------------------------------------------
// LANE A — anilistId resolution + ru multi-server API
// ------------------------------------------------------------------

var anilistCache = {};

// GraphQL lives on the public AniList API, not on the ru host.
var RU_GRAPHQL = 'https://graphql.anilist.co';

function anilistSearch(query) {
  var gql = JSON.stringify({
    query: 'query ($search: String) { Page(page: 1, perPage: 8) { media(search: $search, type: ANIME, sort: SEARCH_MATCH) { id title { romaji english native } seasonYear } } }',
    variables: { search: String(query || '') }
  });
  return fetch(RU_GRAPHQL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'User-Agent': HEADERS['User-Agent'] },
    body: gql
  })
    .then(function (r) { return r.ok ? r.text() : ''; })
    .then(function (t) {
      var j = fetchJsonText(t);
      var list = j && j.data && j.data.Page && j.data.Page.media;
      return Array.isArray(list) ? list : [];
    })
    .catch(function () { return []; });
}

function resolveAnilistId(tmdbId, tmdbData) {
  var cached = anilistCache[tmdbId];
  if (cached !== undefined) return Promise.resolve(cached);
  var queries = [tmdbData.title, tmdbData.original].filter(function (t) { return t && t.length > 1; });
  var idx = 0;
  function tryNext() {
    if (idx >= queries.length) { anilistCache[tmdbId] = 0; return Promise.resolve(0); }
    var q = queries[idx++];
    return anilistSearch(q).then(function (media) {
      var best = 0, bestScore = 0;
      for (var i = 0; i < media.length; i++) {
        var m = media[i] || {};
        var titles = [m.title && m.title.romaji, m.title && m.title.english, m.title && m.title.native];
        var score = 0;
        for (var k = 0; k < titles.length; k++) {
          var s = titleScore(tmdbData.title, titles[k]);
          if (titleScore(tmdbData.original, titles[k]) > s) s = titleScore(tmdbData.original, titles[k]);
          if (s > score) score = s;
        }
        if (score > bestScore) { bestScore = score; best = m.id || 0; }
      }
      if (best && bestScore >= 0.6) {
        anilistCache[tmdbId] = best;
        return best;
      }
      return tryNext();
    });
  }
  return tryNext();
}

// Tolerant scan: find every URL-shaped string that looks like a stream,
// wherever the API put it (shape-proof against upstream changes).
function scanStreamUrls(node, out, depth) {
  if (!node || depth > 7 || out.length > 24) return;
  if (typeof node === 'string' || typeof node === 'number') return;
  if (Array.isArray(node)) {
    for (var i = 0; i < node.length; i++) scanStreamUrls(node[i], out, depth + 1);
    return;
  }
  if (typeof node !== 'object') return;
  var keys = Object.keys(node);
  var quality = null;
  for (var k = 0; k < keys.length; k++) {
    var key = keys[k];
    var val = node[key];
    if (/^(quality|label|name|resolution|height)$/i.test(key) && (typeof val === 'string' || typeof val === 'number') && String(val).length <= 16) {
      quality = String(val);
      if (/^\d{3,4}$/.test(quality)) quality = quality + 'p';
    }
  }
  for (var k2 = 0; k2 < keys.length; k2++) {
    var key2 = keys[k2];
    var val2 = node[key2];
    if (typeof val2 === 'string' && /^https?:\/\//i.test(val2) && /\.(m3u8|mp4)(\?|#|$)/i.test(val2)) {
      out.push({ url: val2, quality: quality ? quality : '' });
    } else if (typeof val2 === 'object') {
      scanStreamUrls(val2, out, depth + 1);
    }
  }
}

function ruServerStreamsFor(serverName, anilistId, episodeNum, lang) {
  var url = RU_BASE + '/api/stream/sources/' + serverName +
    '?anilistId=' + encodeURIComponent(anilistId) +
    '&episode=' + encodeURIComponent(episodeNum) +
    '&lang=' + encodeURIComponent(lang);
  return fetchUpstreamText(url, RU_HEADERS, 9000).then(function (t) {
    if (!t || (t.charAt(0) !== '{' && t.charAt(0) !== '[')) return [];
    var j = fetchJsonText(t);
    if (!j) return [];
    var out = [];
    scanStreamUrls(j, out, 0);
    return out;
  });
}

// Sequential over servers x langs: polite request pacing, stable ordering.
function ruLane(anilistId, episodeNum) {
  var langs = ['sub', 'dub'];
  var collected = [];
  var p = Promise.resolve();
  RU_SERVERS.forEach(function (srv) {
    langs.forEach(function (lang) {
      p = p.then(function () {
        return ruServerStreamsFor(srv, anilistId, episodeNum, lang).then(function (rows) {
          rows.forEach(function (r) {
            var label = srv.toUpperCase() + (r.quality ? ' - ' + r.quality : '') + (lang === 'dub' ? ' [DUB]' : '');
            collected.push({ url: r.url, label: label });
          });
        });
      });
    });
  });
  return p.then(function () { return collected; });
}

// ------------------------------------------------------------------
// LANE B helpers — WP episode pages
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
      while (buffer = s.charAt(i++)) {
        buffer = chars.indexOf(buffer);
        if (~buffer) {
          bs = bc % 4 ? bs * 64 + buffer : buffer;
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

function absolutizeUrl(base, rel) {
  if (/^https?:\/\//i.test(rel)) return rel;
  if (rel.indexOf('//') === 0) return 'https:' + rel;
  if (rel.charAt(0) === '/') {
    var m = base.match(/^(https?:\/\/[^/]+)/);
    return m ? m[1] + rel : rel;
  }
  return base.substring(0, base.lastIndexOf('/') + 1) + rel;
}

function parseHlsVariants(masterUrl) {
  return fetchTextDeadline(masterUrl, {}, 8000).then(function (txt) {
    if (!txt || txt.indexOf('#EXT-X-STREAM-INF') === -1) return [];
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
}

function variantRank(name) {
  var m = String(name || '').match(/(\d{3,4})/);
  return m ? parseInt(m[1], 10) : 0;
}

// p2pplay /api/v1/* payloads: hex(AES-128-CBC). Constants recovered from the
// player bundle (Playwright WebCrypto hook; derivation is static per host).
var P2P_KEY = 'kiemtienmua911ca';
var P2P_IV = '1234567890oiuytr';

function p2pDecryptHex(hex) {
  try {
    var ct = CryptoJS.enc.Hex.parse(String(hex || '').trim());
    var key = CryptoJS.enc.Utf8.parse(P2P_KEY);
    var iv = CryptoJS.enc.Utf8.parse(P2P_IV);
    var plain = CryptoJS.AES.decrypt(
      { ciphertext: ct },
      key,
      { iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 }
    );
    var txt = plain.toString(CryptoJS.enc.Utf8);
    return txt && txt.charAt(0) === '{' ? txt : '';
  } catch (e) {
    return '';
  }
}

function p2pVideoStreams(code) {
  var url = P2P_BASE + '/api/v1/video?id=' + encodeURIComponent(code) +
    '&w=1280&h=720&r=animotvslash.org';
  return fetchUpstreamText(url, {
    'User-Agent': HEADERS['User-Agent'],
    'Accept': '*/*',
    'Referer': P2P_BASE + '/'
  }, 9000).then(function (t) {
    if (!t) return [];
    // response is either hex ciphertext or plain JSON (shape may evolve)
    var plain = /^[0-9a-f]{64,}$/i.test(t.trim()) ? p2pDecryptHex(t) : t;
    var j = fetchJsonText(plain || t);
    if (!j) return [];
    var out = [];
    scanStreamUrls(j, out, 0);
    return out;
  });
}

// legacy tryembed flow (pages the site has not migrated)
const EMBED_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',
  'Accept': '*/*',
  'Accept-Language': 'en-US,en;q=0.9',
  'Origin': 'https://tryembed.us.cc',
  'Referer': 'https://tryembed.us.cc/',
};

function resolveTryEmbed(embedUrl) {
  var match = String(embedUrl || '').match(/\/embed\/anime\/(\d+)\/(\d+)\/(sub|dub)/);
  if (!match) return Promise.resolve([]);
  var apiUrl = 'https://tryembed.us.cc/api/stream_data?id=' + match[1] + '&episode=' + match[2] + '&audio=' + match[3];
  return fetchTextDeadline(apiUrl, Object.assign({}, EMBED_HEADERS, { Referer: embedUrl }), 8000)
    .then(function (t) {
      var j = fetchJsonText(t);
      if (!j) return [];
      var out = [];
      scanStreamUrls(j, out, 0);
      return out;
    });
}

// ------------------------------------------------------------------
// page harvesting
// ------------------------------------------------------------------

function harvestEpisodePage(pageUrl) {
  return fetchTextDeadline(pageUrl, HEADERS, 10000).then(function (html) {
    if (!html) return { html: '', p2pCodes: [], ruIds: [], tryEmbed: null };
    var p2pCodes = [];
    var re = /p2pplay\.pro\/#([a-z0-9]+)/gi;
    var m;
    while ((m = re.exec(html)) !== null) {
      if (p2pCodes.indexOf(m[1]) === -1) p2pCodes.push(m[1]);
    }
    var ruIds = [];
    var reRu = /animotvslash\.ru\/watch\/(\d+)\/(\d+)/gi;
    while ((m = reRu.exec(html)) !== null) {
      var id = parseInt(m[1], 10);
      if (ruIds.indexOf(id) === -1) ruIds.push(id);
    }
    var tryEmbed = (html.match(/https:\/\/tryembed\.us\.cc\/embed\/anime\/\d+\/\d+\/(?:sub|dub)/i) || [null])[0];
    return { html: html, p2pCodes: p2pCodes, ruIds: ruIds, tryEmbed: tryEmbed };
  });
}

function resolvePageWithFallbacks(candidateUrls) {
  var idx = 0;
  function tryNext() {
    if (idx >= candidateUrls.length) return Promise.resolve(null);
    var url = candidateUrls[idx++];
    return harvestEpisodePage(url).then(function (res) {
      if (res.html && /post_id|wp-json|shortlink|<article|episode/i.test(res.html)) {
        return { pageUrl: url, res: res };
      }
      return tryNext();
    });
  }
  return tryNext();
}

// ------------------------------------------------------------------
// main
// ------------------------------------------------------------------

async function getStreams(tmdbId, season, episode) {
  var mediaType = null;
  if (season === 'movie' || season === 'tv') {
    mediaType = season;
    season = episode;
    episode = arguments[3];
  }

  var seasonNum = parseInt(season, 10) || 1;
  var episodeNum = parseInt(episode, 10) || 1;

  var tmdbData = await getTmdbInfoAuto(tmdbId);
  if (!tmdbData.type || !tmdbData.title) {
    console.log('[animotvslash] no TMDB meta for', tmdbId);
    return [];
  }
  mediaType = tmdbData.type;
  console.log('[animotvslash] TMDB', tmdbId, tmdbData.type, '"' + tmdbData.title + '" S' + seasonNum + 'E' + episodeNum);

  var out = [];
  var seen = {};
  function addRow(url, label, quality, headers) {
    if (!url || !/^https?:\/\//i.test(url) || seen[url]) return;
    seen[url] = 1;
    var row = {
      name: 'ANIMOTVSLASH - ' + label,
      title: mediaType === 'tv' ? 'S' + seasonNum + 'E' + episodeNum : 'Movie',
      url: url,
      quality: quality || 'Auto',
      provider: 'animotvslash'
    };
    if (headers && Object.keys(headers).length) row.headers = headers;
    out.push(row);
  }

  // 1. anilistId: GraphQL search first, page harvest as backup (below)
  var anilistId = 0;
  try { anilistId = await resolveAnilistId(tmdbId, tmdbData); } catch (e) { anilistId = 0; }

  // 2. WP episode page (also feeds ru ids + p2p codes)
  var baseSlug = SLUG_OVERRIDES[String(tmdbId)] || slugify(tmdbData.title);
  var candidates = [];
  if (mediaType === 'tv') {
    if (seasonNum > 1) candidates.push(SITE + '/' + baseSlug + '-season-' + seasonNum + '-episode-' + episodeNum + '/');
    candidates.push(SITE + '/' + baseSlug + '-episode-' + episodeNum + '/');
    candidates.push(SITE + '/' + baseSlug + '-episode-' + seasonNum + '-' + episodeNum + '/');
  } else {
    candidates.push(SITE + '/' + baseSlug + '/');
    candidates.push(SITE + '/' + baseSlug + '-episode-1/');
  }
  var pageHit = await resolvePageWithFallbacks(candidates);
  if (pageHit) {
    console.log('[animotvslash] episode page:', pageHit.pageUrl);
    if (!anilistId && pageHit.res.ruIds.length) {
      anilistId = pageHit.res.ruIds[0];
      console.log('[animotvslash] harvested anilistId from page:', anilistId);
    }
  }

  // LANE A — ru multi-server API
  if (anilistId) {
    console.log('[animotvslash] ru lane anilistId=' + anilistId);
    var ruRows = await ruLane(anilistId, episodeNum);
    ruRows.forEach(function (r) { addRow(r.url, r.label, '', RU_HEADERS); });
    console.log('[animotvslash] ru lane rows:', ruRows.length);
  }

  // LANE B — p2pplay codes from the page
  if (pageHit && pageHit.res.p2pCodes.length) {
    for (var ci = 0; ci < pageHit.res.p2pCodes.length && out.length < 12; ci++) {
      var code = pageHit.res.p2pCodes[ci];
      var rows = await p2pVideoStreams(code);
      for (var ri = 0; ri < rows.length; ri++) {
        var q = rows[ri].quality && String(rows[ri].quality).match(/\d{3,4}/) ? rows[ri].quality + 'p' : 'Auto';
        addRow(rows[ri].url, 'P2P ' + (ci + 1), q, {});
      }
      // master playlists without concrete variants: add Auto row
      if (!rows.length) {
        // /api/v1/video may also return master urls; nothing more to do here
      }
    }
  }

  // LANE C — legacy tryembed
  if (pageHit && pageHit.res.tryEmbed && out.length === 0) {
    var teRows = await resolveTryEmbed(pageHit.res.tryEmbed);
    teRows.forEach(function (r) {
      var q = r.quality && String(r.quality).match(/\d{3,4}/) ? r.quality + 'p' : 'Auto';
      addRow(r.url, 'TryEmbed', q, EMBED_HEADERS);
    });
  }

  // direct plyr/videas configs (some pages still carry them)
  if (pageHit && pageHit.res.html) {
    var cfgRe = /animotvslash\.org\/[a-z-]*player\/([A-Za-z0-9+/=_-]{20,})/g;
    var cm;
    var seenCfg = {};
    while ((cm = cfgRe.exec(pageHit.res.html)) !== null && out.length < 20) {
      if (seenCfg[cm[1]]) continue;
      seenCfg[cm[1]] = 1;
      var raw = b64Decode(cm[1]);
      if (!raw || raw.indexOf('{') === -1) continue;
      var cfg = null;
      try { cfg = JSON.parse(raw); } catch (e) { cfg = null; }
      if (cfg && cfg.url && /^https?:\/\//i.test(cfg.url)) {
        var variants = await parseHlsVariants(cfg.url);
        if (variants.length) {
          addRow(cfg.url, 'VidJoy Auto', 'Auto', {});
          variants.sort(function (a, b) { return variantRank(b.name) - variantRank(a.name); });
          for (var vi = 0; vi < variants.length; vi++) {
            addRow(variants[vi].url, 'VidJoy ' + variants[vi].name, variants[vi].name, {});
          }
        } else {
          addRow(cfg.url, 'VidJoy Auto', 'Auto', {});
        }
      }
    }
  }

  console.log('[animotvslash] returning', out.length, 'stream(s)');
  return out;
}

module.exports = {
  getStreams,
  // test hooks (offline regression suite)
  _test: {
    p2pDecryptHex: p2pDecryptHex,
    scanStreamUrls: scanStreamUrls,
    titleScore: titleScore,
    slugify: slugify,
    resolveAnilistId: resolveAnilistId,
    relayBase: relayBase
  }
};
