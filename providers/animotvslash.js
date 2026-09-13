/*
 * providers/animotvslash.js — AnimeTVSlash (animotvslash.org) Nuvio provider
 * v6.0.0 (2026-09-13) — full rewrite. Request: "animotvslash and anikoto
 * catalog doesnt show streams / review miruro.js and animotvslash.js".
 *
 * WHY v5.x DIED (audited live this cycle): the site finished its player
 * migration. Episode pages now embed a single device-bound iframe:
 *     animotvslash.ru/watch/{anilistId}/{episode}?lang=sub|dub&embed=1
 * Every lane the 5.x extractor relied on is gone or locked:
 *   - tryembed.us.cc: "Forbidden: Invalid Request Signature" (4.28.0 cycle)
 *   - plyr-player / cdn.videas.fr configs: no longer present on pages
 *   - animotvslash.p2pplay.pro: removed (was fingerprint-locked anyway)
 *   - the .ru SPA's own API lanes /api/stream/sources/{senshi|miku|neko} and
 *     /api/stream/watch answer Cloudflare "Just a moment..." 403 even to a
 *     real headless Chromium with a warmed session - not portable to Nuvio's
 *     plain HTTP runtime.
 * WHAT THE SITE ITSELF DOES (captured in a real browser this cycle): when its
 * own servers fail, the .ru watch SPA falls back to MegaPlay's ani route
 *     megaplay.buzz/stream/ani/{anilistId}/{ep}/{sub|dub}
 * -> getSources?id= -> AES "enc" payload -> tokenized master.m3u8 (the capture
 * played Frieren E28 1080p end-to-end). v6.0.0 ports exactly that fallback as
 * the provider's engine:
 *   - TMDB ids: api.ani.zip/mappings?themoviedb_id= -> anilist_id (24h cache)
 *   - asian:an-<slug> / asian:<slug> addon rows: /anime/{slug}/ -> real
 *     -episode-{n}/ link -> episode page -> extract the .ru watch ids
 *     (anilistId + the site's own episode number) -> MegaPlay ani route.
 *     No title matching. Slug 404 falls back to the site's WordPress search.
 *   - MegaPlay lane (mirrored from miruro v2.8.0's reversal of MegaPlay's
 *     e1-player.min.js): enc (base64url) -> AES-256-CBC, key = hex
 *     693f4c4d5441783051362c3a7d353055 + 16 zero bytes, IV = ASCII
 *     "W0;27ToaUpl_P%'c", PKCS7 -> {"file": ".../master.m3u8"}; the master
 *     answers 403 without token = b64url("<unixtime>|<path>") + "." +
 *     b64url(HMAC-SHA256("MpCdnT0k3n!9f2K#xQ7vL5mR8wN1pY4s", msg)). Variants
 *     need no token. Legacy plain sources.file responses still supported.
 *   - v5.4.0 quality whitelist kept: Auto (adaptive master) + 480p/720p/1080p.
 *   - Movies: MegaPlay's ani route serves series episodes only (movie ids
 *     answer "Error - MegaPlay"), so movies fail soft with 0 rows - the pack's
 *     movie coverage comes from the other providers.
 *   - Multi-season titles: ani.zip maps the TMDB show id to ONE anilist id,
 *     so ep numbers pass straight through (same behavior/limitation as
 *     miruro); the addon direct lane uses the site's own episode numbering.
 * crypto-js access mirrors castle.js (bare require works on the device
 * runtime; global __nvRequire tried first). All network calls capped 8s,
 * whole getStreams capped 10.5s, everything fail-soft.
 */

var ANIMOTV_BASE = 'https://animotvslash.org';
var RU_WATCH_RE = /animotvslash\.ru\/watch\/(\d+)\/(\d+)/i;
var ANIZIP_BASE = 'https://api.ani.zip';
var UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36';
var HTML_HEADERS = {
  'User-Agent': UA,
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
};
var MP_HEADERS = {
  'User-Agent': UA,
  'Accept': 'application/json',
  'Referer': 'https://megaplay.buzz/',
  'X-Requested-With': 'XMLHttpRequest',
};
var MP_PAGE_HEADERS = { 'User-Agent': UA, 'Accept': 'text/html,*/*', 'Referer': 'https://megaplay.buzz/' };

/* ---------- fetch helpers (per-call deadline, fail-soft) ---------- */
function cappedFetch(url, opts, ms) {
  var p;
  try { p = fetch(url, opts || {}); } catch (e) { return Promise.reject(e); }
  return Promise.race([
    p,
    new Promise(function (_res, rej) {
      var t = setTimeout(function () { rej(new Error('deadline')); }, ms || 8000);
      if (t && typeof t.unref === 'function') t.unref();
    }),
  ]);
}
function fetchText(url, headers, ms) {
  return cappedFetch(url, { headers: headers || HTML_HEADERS, redirect: 'follow' }, ms)
    .then(function (r) { return (r && r.ok) ? r.text() : ''; })
    .catch(function () { return ''; });
}
function fetchJson(url, headers, ms) {
  return cappedFetch(url, { headers: headers || HTML_HEADERS }, ms)
    .then(function (r) { return (r && r.ok) ? r.json() : null; })
    .catch(function () { return null; });
}

/* ---------- MegaPlay crypto (see header; proven in 4.29.0) ---------- */
function mpCJS() {
  try { if (typeof __nvRequire === 'function') { var c = __nvRequire('crypto-js'); if (c && c.AES && c.HmacSHA256) return c; } } catch (e) {}
  try { if (typeof require === 'function') { var c2 = require('crypto-js'); if (c2 && c2.AES && c2.HmacSHA256) return c2; } } catch (e) {}
  return null;
}
var _MP_AES = null, _MP_HMAC = null, _MP_IV = null;
function mpKeys() {
  var C = mpCJS(); if (!C) return false;
  if (!_MP_AES) {
    try {
      _MP_AES = C.enc.Hex.parse('693f4c4d5441783051362c3a7d35305500000000000000000000000000000000');
      _MP_IV = C.enc.Utf8.parse("W0;27ToaUpl_P%'c");
      _MP_HMAC = C.enc.Utf8.parse('MpCdnT0k3n!9f2K#xQ7vL5mR8wN1pY4s');
    } catch (e) { return false; }
  }
  return true;
}
function mpDecryptFile(enc) {
  try {
    var C = mpCJS(); if (!C || !mpKeys()) return null;
    var ct = C.enc.Base64.parse(String(enc).replace(/-/g, '+').replace(/_/g, '/'));
    var params = C.lib.CipherParams.create({ ciphertext: ct });
    var pt = C.AES.decrypt(params, _MP_AES, { iv: _MP_IV, mode: C.mode.CBC, padding: C.pad.Pkcs7 });
    var txt = pt.toString(C.enc.Utf8); if (!txt) return null;
    var j = JSON.parse(txt); return j && j.file ? String(j.file) : null;
  } catch (e) { return null; }
}
function mpTokenForPath(path) {
  var C = mpCJS(); if (!C || !mpKeys()) return '';
  try {
    var msg = Math.floor(Date.now() / 1000) + '|' + path;
    var b64url = function (wa) {
      return wa.toString(C.enc.Base64).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    };
    return b64url(C.enc.Utf8.parse(msg)) + '.' + b64url(C.HmacSHA256(msg, _MP_HMAC));
  } catch (e) { return ''; }
}
function mpBuildMaster(fileUrl) {
  var f = String(fileUrl || '');
  if (/\/$/.test(f)) f += 'master.m3u8';
  var m = f.match(/^https?:\/\/[^/]+\/(?:anime|movie|series|tv)\/(.+?)(?:\/master\.m3u8)?$/);
  var path = m ? m[1] : '';
  if (!path || !mpKeys()) return { plain: f, tokenized: f };
  var tok = mpTokenForPath(path);
  return { plain: f, tokenized: tok ? (f + '?token=' + tok) : f };
}

/* ---------- ani.zip TMDB -> anilist mapping (24h cache) ---------- */
var AZ_TTL = 24 * 60 * 60 * 1000, AZ_MISS_TTL = 60 * 60 * 1000;
var _azCache = {};
function anilistFromTmdb(tmdbId) {
  var key = String(tmdbId);
  var hit = _azCache[key];
  if (hit && Date.now() - hit.ts < hit.ttl) return Promise.resolve(hit.al);
  return fetchJson(ANIZIP_BASE + '/mappings?themoviedb_id=' + encodeURIComponent(key),
    { 'User-Agent': UA, 'Accept': 'application/json' }, 8000).then(function (data) {
    var al = data && data.mappings && data.mappings.anilist_id != null ? parseInt(data.mappings.anilist_id, 10) : null;
    if (!(al && isFinite(al) && al > 0)) al = null;
    _azCache[key] = { ts: Date.now(), al: al, ttl: al ? AZ_TTL : AZ_MISS_TTL };
    return al;
  }).catch(function () { return null; });
}

/* ---------- MegaPlay ani-route lane ---------- */
function mpFileIdFor(anilistId, ep, lang) {
  var url = 'https://megaplay.buzz/stream/ani/' + encodeURIComponent(anilistId) + '/' + encodeURIComponent(ep) + '/' + lang;
  return fetchText(url, MP_PAGE_HEADERS, 7000).then(function (html) {
    if (!html || html.indexOf('Error - MegaPlay') !== -1) return null;
    var m = html.match(/id="megaplay-player"[^>]*data-id="(\d+)"/) ||
            html.match(/data-id="(\d+)"/) ||
            html.match(/<title>File (\d+) - MegaPlay/);
    return m ? m[1] : null;
  }).catch(function () { return null; });
}
function mpSources(fileId) {
  var url = 'https://megaplay.buzz/stream/getSourcesNew?id=' + encodeURIComponent(fileId);
  return fetchJson(url, MP_HEADERS, 7000).then(function (data) {
    if (!data) return null;
    var tracks = Array.isArray(data.tracks) ? data.tracks : [];
    var file = null;
    if (data.enc) file = mpDecryptFile(data.enc);
    if (!file && data.sources && data.sources.file && /^https?:\/\//i.test(String(data.sources.file))) {
      file = String(data.sources.file); // legacy plain response
    }
    if (!file) return null;
    var built = mpBuildMaster(file);
    return { file: built.tokenized, tracks: tracks };
  }).catch(function () { return null; });
}
function subsFromTracks(tracks) {
  return (tracks || []).filter(function (t) {
    return t && t.file && /^https?:/i.test(String(t.file)) &&
      /(english|filipino|tagalog)/i.test(String(t.label || t.language || ''));
  }).slice(0, 6).map(function (t) {
    var l = String(t.label || t.language || 'English');
    var isTl = /filipino|tagalog/i.test(l);
    return { url: String(t.file), language: isTl ? 'tl' : 'en', name: isTl ? 'Tagalog / Filipino' : l };
  });
}
/** master playlist -> rows. v5.4.0 whitelist: Auto master + 480p/720p/1080p
 *  variants; the post-filter re-probes and drops anything that 403s. */
function rowsFromMaster(masterUrl, label, subs, meta) {
  var hdrs = { 'Referer': 'https://megaplay.buzz/', 'Origin': 'https://megaplay.buzz' };
  var side = /dub/i.test(String(label)) ? 'Dub' : 'Sub';
  var desc = meta.titleLine + '\n' + meta.epLine + '\n✨ MegaPlay ' + side + ' lane\n🔗 AnimeTVSlash';
  return fetchText(masterUrl, hdrs, 7000).then(function (t) {
    var out = [];
    if (t && t.indexOf('#EXTM3U') !== -1) {
      var lines = t.split('\n'), variants = [], i, mm;
      for (i = 0; i < lines.length; i++) {
        mm = lines[i].match(/RESOLUTION=(\d+)x(\d+)/i);
        if (mm) {
          var h = parseInt(mm[2], 10), u = '', j;
          for (j = i + 1; j < lines.length; j++) {
            var s = lines[j].trim();
            if (s && s.charAt(0) !== '#') { u = s; break; }
          }
          if (u) variants.push({ h: h, url: u });
        }
      }
      var q = { 480: '480p', 720: '720p', 1080: '1080p' };
      variants.forEach(function (v) {
        var lab = q[v.h];
        if (!lab) return;
        var vu = /^https?:\/\//i.test(v.url) ? v.url : masterUrl.replace(/[^/]*$/, v.url);
        out.push({
          name: 'AnimeTVSlash | MegaPlay ' + side + ' | ' + lab,
          title: desc, size: desc, description: desc,
          url: vu, quality: lab, subtitles: subs, headers: hdrs, provider: 'animotvslash',
        });
      });
    }
    if (!out.length) {
      out.push({
        name: 'AnimeTVSlash | MegaPlay ' + side + ' | Auto',
        title: desc, size: desc, description: desc,
        url: masterUrl, quality: 'Auto', subtitles: subs, headers: hdrs, provider: 'animotvslash',
      });
    }
    return out;
  }).catch(function () {
    return [{
      name: 'AnimeTVSlash | MegaPlay ' + side + ' | Auto',
      title: desc, size: desc, description: desc,
      url: masterUrl, quality: 'Auto', subtitles: subs, headers: hdrs, provider: 'animotvslash',
    }];
  });
}
function megaPlayAniLanes(anilistId, ep, meta, sink) {
  var langs = ['sub', 'dub'];
  return Promise.all(langs.map(function (lang) {
    return mpFileIdFor(anilistId, ep, lang).then(function (fid) {
      if (!fid) return null;
      return mpSources(fid).then(function (src) {
        if (!src || !src.file) return null;
        var subs = subsFromTracks(src.tracks);
        return rowsFromMaster(src.file, lang, subs, meta).then(function (rows) {
          rows.forEach(sink);
          return rows.length;
        });
      });
    }).catch(function () { return null; });
  }));
}

/* ---------- catalog id parsing (tolerant; miruro 2.7.0 class) ---------- */
function parseCatalogId(raw) {
  var s = String(raw == null ? '' : raw);
  try { s = decodeURIComponent(s); } catch (e) {}
  s = s.replace(/[?#].*$/, '').replace(/\.json$/i, '').trim();
  var parts = s.split(/[:\/]/).filter(Boolean);
  if (!parts.length) return null;
  var nums = parts.filter(function (x) { return /^\d+$/.test(x); });
  var i, p;
  for (i = 0; i < parts.length; i++) {
    p = parts[i].toLowerCase();
    if (p === 'asian') {
      // asian:an-<slug> / asian:kh-<id>: the next token carries the sub-prefix
      var nxt = parts[i + 1] ? String(parts[i + 1]).toLowerCase() : '';
      var m2 = nxt.match(/^(an|kh|pen|pmh|ks|va)-(.+)$/);
      if (m2) return m2[1] === 'an' ? { kind: 'slug', slug: m2[2] } : { kind: 'other' };
      return nxt ? { kind: 'slug', slug: parts[i + 1] } : null;
    }
    if (p === 'an') return { kind: 'slug', slug: parts[i + 1] || '' };
    if (p === 'kh' || p === 'pen' || p === 'pmh' || p === 'ks' || p === 'va') return { kind: 'other' };
    if (p === 'mal' || p === 'anilist' || p === 'kitsu' || p === 'anikoto') return { kind: 'other' };
    if (p === 'tmdb') {
      var se = 0, ep = 0;
      if (nums.length >= 3) { se = parseInt(nums[nums.length - 2], 10); ep = parseInt(nums[nums.length - 1], 10); }
      else if (nums.length === 2) { ep = parseInt(nums[1], 10); }
      return { kind: 'tmdb', id: nums[0], season: se, episode: ep };
    }
  }
  if (nums.length && /^\d+$/.test(parts[0])) {
    var se2 = 0, ep2 = parseInt(episodeOf(nums), 10) || 0;
    return { kind: 'tmdb', id: nums[0], season: se2, episode: ep2 };
  }
  return { kind: 'slug', slug: parts.join('-') };
}
function episodeOf(nums) {
  return nums.length >= 2 ? nums[nums.length - 1] : 0;
}

/* ---------- direct lane: animotvslash.org slug -> .ru watch ids ---------- */
function animePageFromSlug(slug) {
  var clean = encodeURIComponent(String(slug).replace(/[^a-z0-9-]/gi, ''));
  return fetchText(ANIMOTV_BASE + '/anime/' + clean + '/', HTML_HEADERS, 8000).then(function (t) {
    if (t && t.length > 2000) return t;
    // slug 404 -> WordPress search fallback (v5.1.0 idea, compact form)
    var q = String(slug).replace(/-/g, ' ');
    return fetchText(ANIMOTV_BASE + '/?s=' + encodeURIComponent(q), HTML_HEADERS, 8000).then(function (ts) {
      if (!ts) return '';
      var links = [], re = /href="(https:\/\/animotvslash\.org\/anime\/[^"]+?)"/gi, mm;
      while ((mm = re.exec(ts)) !== null) links.push(mm[1]);
      if (!links.length) return '';
      var qtok = q.split(/\s+/).filter(Boolean), best = null, bestScore = -1;
      links.forEach(function (u) {
        var sl = (u.match(/\/anime\/([^/]+)\/?$/) || [])[1] || '';
        var st = sl.split('-'), score = 0;
        qtok.forEach(function (t2) { if (st.indexOf(t2) !== -1) score++; });
        if (score > bestScore) { bestScore = score; best = u; }
      });
      return best ? fetchText(best, HTML_HEADERS, 8000) : '';
    });
  }).catch(function () { return ''; });
}
function episodePageFromAnimePage(animeHtml, ep) {
  if (!animeHtml) return Promise.resolve('');
  var want = parseInt(ep, 10) || 1;
  var re = /href="(https:\/\/animotvslash\.org\/[^"]*?-episode-(\d+)(?:-\d+)?\/?)"/gi;
  var candidates = [], mm;
  while ((mm = re.exec(animeHtml)) !== null) candidates.push({ url: mm[1], n: parseInt(mm[2], 10) });
  var pick = null, i;
  for (i = 0; i < candidates.length; i++) if (candidates[i].n === want) { pick = candidates[i]; break; }
  if (!pick) return Promise.resolve('');
  for (i = 0; i < candidates.length; i++) {
    if (candidates[i].n === want && candidates[i].url.length < pick.url.length) pick = candidates[i];
  }
  return fetchText(pick.url, HTML_HEADERS, 8000);
}
/** legacy extractor: plyr-player base64 config -> direct HLS (kept for pages
 *  the site may revert; currently rare/absent). atob guarded (QuickJS). */
function vidiasFromEpisodePage(html, sink, meta) {
  if (!html) return Promise.resolve(0);
  var m = html.match(/plyr-player\/([A-Za-z0-9+/=_-]+)/);
  if (!m) return Promise.resolve(0);
  try {
    var b64 = m[1].replace(/-/g, '+').replace(/_/g, '/');
    var bin;
    if (typeof atob === 'function') bin = atob(b64);
    else if (typeof Buffer === 'function' && Buffer.from) bin = Buffer.from(b64, 'base64').toString('binary');
    else return Promise.resolve(0);
    var j = JSON.parse(decodeURIComponent(escape(bin)));
    var u = j && j.url;
    if (u && /videas\.fr|\.m3u8/i.test(u)) {
      sink({
        name: 'AnimeTVSlash | Site Player | Auto', url: u, quality: 'Auto',
        title: meta.titleLine, size: meta.titleLine, description: meta.titleLine,
        headers: { 'Referer': ANIMOTV_BASE + '/' }, provider: 'animotvslash',
      });
      return Promise.resolve(1);
    }
  } catch (e) {}
  return Promise.resolve(0);
}

/* ---------- getStreams ---------- */
function dedupeRows(rows) {
  var seen = {}, out = [];
  rows.forEach(function (r) {
    if (!r || !r.url) return;
    var k = String(r.url).replace(/[#?].*$/, '');
    if (seen[k]) return;
    seen[k] = 1; out.push(r);
  });
  return out;
}
function getStreams(videoId, mediaType, season, episode) {
  return new Promise(function (resolve) {
    var done = false, rows = [];
    var isTv = mediaType !== 'movie';
    var se = parseInt(season, 10) || 1;
    var ep = parseInt(episode, 10) || 1;
    var meta = {
      titleLine: '📺 ' + 'AnimeTVSlash',
      epLine: isTv ? ('🎬 S' + se + 'E' + ep) : '🎬 Movie Presentation',
    };
    var sink = function (r) { if (!done && r && r.url) rows.push(r); };
    var finish = function () {
      if (done) return;
      done = true;
      resolve(dedupeRows(rows));
    };
    var t = setTimeout(finish, 10500);
    if (t && typeof t.unref === 'function') t.unref();

    Promise.resolve().then(function () {
      if (!isTv) return null; // MegaPlay ani route is series-only (see header)
      var parsed = parseCatalogId(videoId);
      if (!parsed) return null;
      if (parsed.kind === 'slug') {
        if (!parsed.slug) return null;
        return animePageFromSlug(parsed.slug).then(function (animeHtml) {
          return episodePageFromAnimePage(animeHtml, ep).then(function (epHtml) {
            var m = epHtml && epHtml.match(RU_WATCH_RE);
            if (m) {
              var alId = m[1], epNum = parseInt(m[2], 10) || ep;
              return megaPlayAniLanes(alId, epNum, meta, sink);
            }
            return vidiasFromEpisodePage(epHtml, sink, meta);
          });
        });
      }
      if (parsed.kind === 'tmdb') {
        return anilistFromTmdb(parsed.id).then(function (al) {
          if (!al) return null;
          return megaPlayAniLanes(al, ep, meta, sink);
        });
      }
      return null; // anikoto/mal/anilist/kh/pen ids belong to other providers
    }).then(finish).catch(finish);
  });
}

if (typeof module !== 'undefined' && module.exports) module.exports = { getStreams: getStreams };
else if (typeof global !== 'undefined') global.getStreams = getStreams;
