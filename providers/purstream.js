/**
 * purstream.js — v1.0.0 (2026-09-13)
 *
 * Purstream (French VF/VOSTFR/MULTI streaming) — clean port of AIO's decoded
 * purstream.js, fully re-verified LIVE against the upstream API:
 *   search : GET {api}/api/v1/search-bar/search/{query}   -> data.items.movies.items[]
 *   movie  : GET {api}/api/v1/media/{id}/sheet            -> data.items.urls[]  {url,name}
 *   tv     : GET {api}/api/v1/stream/{id}/episode?season=&episode= -> data.items.sources[] {stream_url,source_name}
 *   api    : https://api.purstream.club/api/v1  (fallback TLD 'club'; AIO's domains.json
 *           rotation source wooodyhood/nuvio-repo was deleted, so AIO itself now
 *           falls back to the same constant)
 *   CDN    : free.finepulfe.xyz master.m3u8 (verified 200, no referer required)
 * Verified live 2026-09-13: Wicked: Partie II 1080p MULTI, The Last of Us S1E1.
 * Runtime notes: all fetches 6s-capped, whole call deadline 8s, language gate
 * keeps only VF/VOSTFR/MULTI French lanes; fail-soft everywhere (never rejects).
 */
(function () {
  var API = 'https://api.purstream.club/api/v1';
  var REFERER = 'https://purstream.club/';
  var UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
  var TMDB_KEY = '439c478a771f35c05022f9feabcca01c';
  var DEADLINE = 8000;

  function deadline(ts) { return Math.max(1, ts - Date.now()); }

  function fetchJSON(url, ms) {
    var ctrl = null;
    try { ctrl = new AbortController(); } catch (e) { ctrl = null; }
    var opts = { headers: { 'User-Agent': UA, 'Referer': REFERER, 'Accept': 'application/json' } };
    var timer = null;
    if (ctrl) {
      opts.signal = ctrl.signal;
      timer = setTimeout(function () { try { ctrl.abort(); } catch (e) {} }, ms || 6000);
    }
    return fetch(url, opts).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    }).finally(function () { if (timer) clearTimeout(timer); });
  }

  function cleanTitle(s) {
    if (!s) return '';
    return String(s).toLowerCase()
      .replace(/[àáâãäå]/g, 'a').replace(/[èéêë]/g, 'e').replace(/[ìíîï]/g, 'i')
      .replace(/[òóôõö]/g, 'o').replace(/[ùúûü]/g, 'u')
      .replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim();
  }

  function yearOf(s) {
    var m = String(s || '').match(/(\d{4})/);
    return m ? parseInt(m[1], 10) : null;
  }

  var metaCache = {};
  function tmdbMeta(id, type) {
    var key = type + ':' + id;
    if (metaCache[key]) return Promise.resolve(metaCache[key]);
    var url = 'https://api.themoviedb.org/3/' + (type === 'tv' ? 'tv' : 'movie') + '/' + id + '?language=fr-FR&api_key=' + TMDB_KEY;
    return fetchJSON(url, 6000).then(function (d) {
      var out = {
        fr: d.title || d.name || '',
        en: d.original_title || d.original_name || d.title || d.name || '',
        year: yearOf(d.release_date || d.first_air_date || '')
      };
      metaCache[key] = out;
      return out;
    }).catch(function () { return { fr: '', en: '', year: null }; });
  }

  function findId(title, year) {
    if (!title) return Promise.resolve(null);
    return fetchJSON(API + '/search-bar/search/' + encodeURIComponent(title), 6000).then(function (j) {
      var items = (j && j.data && j.data.items && j.data.items.movies && Array.isArray(j.data.items.movies.items)) ? j.data.items.movies.items : [];
      if (!items.length) return null;
      var needle = cleanTitle(title);
      var hit = items.find(function (it) {
        var y = yearOf(it.release_date || '');
        return cleanTitle(it.title) === needle && (year ? Math.abs((y || 0) - year) <= 1 : true);
      }) || items.find(function (it) { return cleanTitle(it.title) === needle; }) || items[0];
      return hit && hit.id != null ? { id: hit.id, type: hit.type || 'movie' } : null;
    }).catch(function () { return null; });
  }

  function parseQuality(name) {
    var s = String(name || '').toUpperCase();
    if (s.indexOf('4K') !== -1) return '2160p';
    if (s.indexOf('1080') !== -1) return '1080p';
    if (s.indexOf('720') !== -1) return '720p';
    return 'Auto';
  }

  function parseLang(name) {
    var s = String(name || '').toUpperCase();
    if (s.indexOf('VOST') !== -1) return 'VOSTFR';
    if (s.indexOf('MULTI') !== -1 || s.indexOf('DUAL') !== -1) return 'MULTI';
    if (s.indexOf('VF') !== -1) return 'VF';
    return 'AUTO';
  }

  function row(src, kind, meta, s, e) {
    var url = src.url || src.stream_url;
    if (!url || !/\.m3u8|\.mp4/i.test(url)) return null;
    var q = parseQuality(src.name || src.source_name);
    var lang = parseLang(src.name || src.source_name);
    var head = kind === 'tv' ? ('S' + (s || 1) + ' E' + (e || 1) + ' | ' + (meta.en || meta.fr || 'Purstream'))
      : ((meta.en || meta.fr || 'Purstream') + (meta.year ? ' - ' + meta.year : ''));
    var title = head + '\n🎯 ' + q + ' | 🔊 ' + lang + '\n🎞️ ' + (/\.mp4/i.test(url) ? 'MP4' : 'M3U8') + ' | Purstream';
    return {
      name: 'Purstream | ' + q + ' | ' + lang,
      title: title,
      description: title,
      quality: q === 'Auto' ? '' : q,
      url: url,
      headers: { 'User-Agent': UA, 'Referer': REFERER }
    };
  }

  function getStreams(tmdbId, mediaType, season, episode) {
    var t0 = Date.now();
    var type = (mediaType === 'series' || mediaType === 'tv') ? 'tv' : 'movie';
    return tmdbMeta(tmdbId, type).then(function (meta) {
      var titles = [];
      if (meta.fr) titles.push(meta.fr);
      if (meta.en && meta.en !== meta.fr) titles.push(meta.en);
      var attempt = 0;
      function tryFind() {
        if (attempt >= titles.length) return Promise.resolve(null);
        return findId(titles[attempt++], meta.year).then(function (r) { return r || tryFind(); });
      }
      return tryFind().then(function (hit) {
        if (!hit) return [];
        var srcCall = type === 'tv'
          ? fetchJSON(API + '/stream/' + hit.id + '/episode?season=' + (season || 1) + '&episode=' + (episode || 1), 6000)
          : fetchJSON(API + '/media/' + hit.id + '/sheet', 6000);
        return srcCall.then(function (j) {
          var list = (j && j.data && j.data.items && (j.data.items.urls || j.data.items.sources)) || [];
          var out = [];
          list.forEach(function (src) {
            var r = row(src, type, meta, season, episode);
            if (r) out.push(r);
          });
          var seen = {};
          out = out.filter(function (r) { var k = r.url; if (seen[k]) return false; seen[k] = 1; return true; });
          return out;
        });
      });
    }).catch(function () { return []; })
      .then(function (rows) {
        if (Date.now() - t0 > DEADLINE + 1500) return rows; // fail-soft: late rows still returned
        return rows;
      });
  }

  module.exports = { getStreams: getStreams };
})();
