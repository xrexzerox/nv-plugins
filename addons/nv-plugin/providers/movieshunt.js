"use strict";
// movieshunt.js - eclipsia kryxalia.js source (codeberg eclipsia/nuvio-plugin v10.0.0), readable netmirror-style build for pack 4.43.0.
// Device fixes applied: atob.
// Subtitles: passed through as upstream emits them (English/Tagalog tracks kept when upstream provides).
/* device guard: Nuvio realm may lack global atob (pack house fix, same as netmirror v17) */
if (typeof globalThis.atob !== "function") {
  globalThis.atob = function (input) {
    var B64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    var str = String(input).replace(/[\t\n\f\r ]/g, "").replace(/=+$/, "");
    var out = "";
    var bits = 0;
    var acc = 0;
    for (var i = 0; i < str.length; i++) {
      var c = B64.indexOf(str.charAt(i));
      if (c < 0 || c === 64) continue;
      acc = (acc << 6) | c;
      bits += 6;
      if (bits >= 8) {
        bits -= 8;
        out += String.fromCharCode((acc >> bits) & 0xff);
      }
    }
    return out;
  };
}
const PROVIDER_NAME = 'MoviesHunt';
const TMDB_API_URL = "https://api.themoviedb.org/3";
const TMDB_API_KEY = '6dc830f9624b43261325bed3bf7d0dfa';
// v1.3 (pack 4.47.0): the site now rotates at least three domains -
// movieshunt.beer (current canonical), .run and .monster (both 301 to .beer).
// All lanes resolve against every domain in order, so a blocked/dead domain
// no longer kills the provider on the device.
const BASE_URLS = ['https://movieshunt.beer', 'https://movieshunt.run', 'https://movieshunt.monster'];
const BASE_A_URL = BASE_URLS[0];
const BASE_B_URL = 'https://abhilinks.site';
// v1.2 addon fix: the search page moved off movieshunt.run and became
// client-side rendered (results load from an internal JSON endpoint), so the
// static <hN class=entry-title> markup parse finds nothing anymore.
// lookup.php is the endpoint that powers the page - use it first, HTML as fallback.
const LOOKUP_API_PATH = '/lookup.php';
const UAS = [
  'Mozilla/5.0 (Linux; Android 14; Pixel 8 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36',
  'Mozilla/5.0 (Linux; Android 13; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36',
  'Mozilla/5.0 (Linux; Android 12; Pixel 6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
];

let currentUA = UAS[0];

function resWeight(quality) {
  const q = (quality || "").toUpperCase();
  if (q === "4K" || q === "2160P") return 5;
  if (q === "1440P") return 4;
  if (q === "1080P") return 3;
  if (q === "720P") return 2;
  if (q === "480P") return 1;
  return 0;
}

function getInvertedSortTag(score, maxScore) {
  maxScore = maxScore || 999999;
  let val = Math.max(0, parseInt(score, 10) || 0);
  let inv = Math.max(0, maxScore - val);
  let bin = inv.toString(2);
  while (bin.length < 20) bin = "0" + bin;
  const chars = [];
  for (let i = 0; i < bin.length; i++) {
    chars.push(bin.charAt(i) === "1" ? "\uFEFF" : "\u200B");
  }
  return chars.join("");
}

function hdrs(extra) {
  return Object.assign({}, {
    'User-Agent': currentUA,
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  }, extra || {});
}

async function fetchText(url, options) {
  try {
    const res = await fetch(url, options || {});
    if (res && res.ok) return await res.text();
  } catch { }
  return null;
}

// v1.3: try the same path on every site domain until one answers
async function fetchTextAny(paths, options) {
  for (const base of BASE_URLS) {
    const text = await fetchText(base + paths[0], options);
    if (text) return { text, base };
  }
  return null;
}

async function fetchJson(url, options) {
  try {
    const res = await fetch(url, options || {});
    if (res && res.ok) return await res.json();
  } catch { }
  return null;
}

async function getTMDBInfo(tmdbId, type) {
  const mediaType = type === 'tv' ? 'tv' : 'movie';
  return fetchJson(`${TMDB_API_URL}/${mediaType}/${tmdbId}?api_key=${TMDB_API_KEY}&language=en-US`, { headers: { 'User-Agent': currentUA } });
}

function firstSuccess(promises, isEmpty) {
  return new Promise((resolve, reject) => {
    let pending = promises.length;
    if (!pending) return reject(null);
    for (const p of promises) {
      Promise.resolve(p).then(val => {
        if (!isEmpty(val)) resolve(val);
        else if (--pending === 0) reject(null);
      }).catch(() => { if (--pending === 0) reject(null); });
    }
  });
}

function parseSearchResults(html) {
  const results = [];
  const headingRegex = /<h\d[^>]*class="[^"]*entry-title[^"]*"[^>]*>([\s\S]*?)<\/h\d>/gi;
  let match;
  while ((match = headingRegex.exec(html)) !== null) {
    const inner = match[1];
    const linkMatch = inner.match(/<a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/i);
    if (linkMatch) {
      let url = linkMatch[1];
      if (!url.startsWith('http')) url = BASE_A_URL + (url.startsWith('/') ? '' : '/') + url;
      const title = linkMatch[2].replace(/<[^>]+>/g, '').trim();
      if (title.length > 5) results.push({ title, url });
    }
  }
  return results;
}

// v1.3: resolve a post URL against the live domain list. The site rotates
// domains (beer/run/monster all serve the same WP install) and a permalink
// grabbed on one domain may 404 on a stale DNS cache.
async function fetchPostHtml(postUrl) {
  if (/^https:\/\/movieshunt\.(beer|run|monster)\//i.test(postUrl)) {
    const path = postUrl.replace(/^https:\/\/movieshunt\.[a-z.]+/i, '');
    const probe = await fetchTextAny([path], { headers: hdrs() });
    if (probe) return probe.text;
    return null;
  }
  return fetchText(postUrl, { headers: hdrs() });
}

// v1.2 addon fix: JSON lookup lane over the same index the site's own search
// UI uses. Returns the same {title, url} shape parseSearchResults produces.
// v1.3: lookup.php is tried on every domain; permalinks are resolved against
// the domain that actually answered.
async function lookupApiSearch(query) {
  const results = [];
  const cleaned = String(query || '').replace(/[^a-zA-Z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
  const qs = cleaned ? [cleaned] : [];
  const noYear = cleaned.replace(/\s*\d{4}\s*/g, ' ').replace(/\s+/g, ' ').trim();
  if (noYear && noYear !== cleaned && !qs.includes(noYear)) qs.push(noYear);
  for (const q of qs.slice(0, 2)) {
    for (const base of BASE_URLS) {
      try {
        const data = await fetchJson(
          base + LOOKUP_API_PATH + '?q=' + encodeURIComponent(q) + '&page=1&per_page=30',
          { headers: hdrs({ 'Referer': base + '/search.html?q=' + encodeURIComponent(q) }) }
        );
        const hits = (data && data.ok !== false && Array.isArray(data.hits)) ? data.hits : [];
        hits.forEach(h => {
          const title = String(h && h.post_title || '').trim();
          let url = String(h && h.permalink || '');
          if (!title || title.length <= 5 || !url) return;
          if (!url.startsWith('http')) url = base + (url.startsWith('/') ? '' : '/') + url;
          results.push({ title, url });
        });
        if (results.length) break;
      } catch (e) { }
    }
    if (results.length) break;
  }
  return results;
}

async function searchSite(query) {
  // v1.2 addon fix: prefer the JSON lookup API (client-rendered search page
  // made the HTML lane blind), keep the original HTML lane as fallback.
  try {
    const apiResults = await lookupApiSearch(query);
    if (apiResults.length) return apiResults;
  } catch (e) { }
  const queries = [query.replace(/'/g, '').trim()];
  const cleaned = query.replace(/[^a-zA-Z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
  if (cleaned !== queries[0]) queries.push(cleaned);
  const noYear = cleaned.replace(/\s*\d{4}\s*/g, ' ').trim();
  if (noYear && !queries.includes(noYear)) queries.push(noYear);
  const words = cleaned.split(' ').filter(w => w.length > 2);
  const wordsCopy = words.slice();
  while (wordsCopy.length > 1) {
    wordsCopy.pop();
    const partial = wordsCopy.join(' ');
    if (partial.length > 3 && !queries.includes(partial)) queries.push(partial);
  }
  if (cleaned) {
    const parts = cleaned.split(' ');
    if (parts.length > 1) {
      const lastTwo = parts.slice(-Math.min(2, parts.length)).join(' ');
      if (lastTwo.length > 3 && !queries.includes(lastTwo)) queries.push(lastTwo);
      const lastWord = parts[parts.length - 1];
      if (lastWord.length > 3 && /[a-zA-Z]/.test(lastWord) && !queries.includes(lastWord))
        queries.push(lastWord);
    }
  }

  const valid = queries.filter(q => q.length >= 3);
  const BATCH = 3;
  for (let i = 0; i < valid.length; i += BATCH) {
    const batch = valid.slice(i, i + BATCH);
    try {
      const results = await firstSuccess(
        batch.map(async q => {
          // v1.3: HTML lane fails over across all site domains
          const probe = await fetchTextAny(['/?s=' + encodeURIComponent(q)], { headers: hdrs() });
          if (!probe) return null;
          return parseSearchResults(probe.text);
        }),
        val => !val || !val.length
      );
      if (results && results.length) return results;
    } catch { }
  }
  return [];
}

function matchHits(results, tmdbInfo, isSeries) {
  const tmdbTitle = (isSeries ? tmdbInfo.name : tmdbInfo.title) || '';
  const tmdbYear = isSeries
    ? (tmdbInfo.first_air_date || '').split('-')[0]
    : (tmdbInfo.release_date || '').split('-')[0];

  const titleLower = tmdbTitle.toLowerCase().replace(/[\u2018\u2019\u201A\u201B\u2032\u2035]/g, "'");
  const stopWords = /\b(and|&|the|a|an)\b/g;
  const titleNoStops = titleLower.replace(stopWords, '').replace(/\s+/g, ' ').trim();
  const titleWords = titleLower.split(/\s+/).filter(w => w.length > 1);

  const scored = [];
  const seen = {};

  for (const result of results) {
    const resultTitle = result.title || '';
    const resultUrl = result.url || '';
    if (seen[resultUrl]) continue;
    seen[resultUrl] = true;

    const resultLower = resultTitle.toLowerCase().replace(/[\u2018\u2019\u201A\u201B\u2032\u2035]/g, "'");
    let score = 0;

    if (resultLower === titleLower) {
      score += 100;
    } else if (resultLower.includes(titleLower) && resultLower.split(/\s+/).length >= titleLower.split(/\s+/).length) {
      // v4.50.0 ACCURACY FIX: the result must be at least as long as the
      // wanted title (subtitle words allowed) - a short result like "Hello"
      // no longer scores 50 against "Hello, Love, Again".
      score += 50;
    } else {
      const resultNoStops = resultLower.replace(stopWords, '').replace(/\s+/g, ' ').trim();
      if (resultNoStops.includes(titleNoStops) && resultNoStops.split(/\s+/).length >= titleNoStops.split(/\s+/).length) {
        score += 50;
      } else if (
        resultNoStops.replace(/[^a-z0-9\s]/g, '').trim() ===
        titleNoStops.replace(/[^a-z0-9\s]/g, '').trim()
      ) {
        score += 60;
      }
    }

    if (score === 0 && titleWords.length > 1) {
      const resultWords = resultLower.split(/\s+/).filter(w => w.length > 1);
      let matches = 0;
      for (const tw of titleWords) {
        for (const rw of resultWords) {
          if (tw === rw || rw.startsWith(tw) || tw.startsWith(rw)) { matches++; break; }
        }
      }
      if (matches >= Math.min(titleWords.length, 3)) score += 50;
    }

    if (score >= 50 && tmdbYear && resultTitle.includes(tmdbYear)) score += 10;
    if (score >= 50) scored.push({ doc: result, score });
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, 5).map(s => s.doc);
}

function extractAbhilinksUrl(html) {
  const btnMatch = html.match(/<a[^>]*href="(https:\/\/abhilinks\.(?:life|site)\/[^"]+)"[^>]*class="btn"[^>]*>/i);
  if (btnMatch) return btnMatch[1];
  const anyMatch = html.match(/<a[^>]*href="(https:\/\/abhilinks\.(?:life|site)\/[^"]+)"[^>]*>/i);
  if (anyMatch) return anyMatch[1];
  return null;
}

function extractQualityOptions(html) {
  const options = [];
  const qualityRegex = /(2160|1080|720|480)[pP](?:\s+\w{1,15})?\s*\[([^\]]+)\]/g;
  let match;
  while ((match = qualityRegex.exec(html)) !== null) {
    const quality = match[1] + 'P';
    const size = match[2];
    if (quality === '480P') continue;
    const context = html.substring(Math.max(0, match.index - 200), match.index + 600);
    // v1.2 addon fix: hubcloud rotates domains (cx -> ist -> ...) - accept any TLD
    const hubcloudMatch = context.match(/href="(https:\/\/hubcloud\.[a-z]{2,4}\/(?:drive|video)\/[^"]+)"/i);
    const vcloudMatch = context.match(/href="(https:\/\/href\.li\/\?https:\/\/vcloud\.zip\/[^"]+)"/i);
    if (hubcloudMatch) options.push({ quality, size, type: 'hubcloud', url: hubcloudMatch[1] });
    else if (vcloudMatch) options.push({ quality, size, type: 'vcloud', url: vcloudMatch[1] });
  }
  return options;
}

function extractVcloudUrl(raw) {
  const match = raw.match(/href\.li\/\?https:\/\/vcloud\.zip\/([^"&?]+)/i);
  if (match) return 'https://vcloud.zip/' + match[1];
  return null;
}

function isCloudflareUrl(url) {
  return (
    /cdn\.fsl-buckets\.life/i.test(url) ||
    /r2\.cloudflarestorage/i.test(url) ||
    /workers\.dev/i.test(url)
  );
}

function extractFSLLinks(html) {
  const links = [];
  const anchorMatches = html.match(/<a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi);
  if (!anchorMatches) return links;
  for (const anchor of anchorMatches) {
    const hrefMatch = anchor.match(/href="([^"]+)"/i);
    const textMatch = anchor.match(/>([\s\S]*?)<\/a>/i);
    if (!hrefMatch) continue;
    const url = hrefMatch[1].replace(/&amp;/g, '&');
    const text = textMatch ? textMatch[1].replace(/<[^>]+>/g, '').trim() : '';
    if (!url || url.startsWith('javascript:')) continue;
    if (/telegram/i.test(text) || /tg\//i.test(url) || /pixeldrain/i.test(url)) continue;
    if (/hubcloud\.cx|gpdl2/i.test(url)) continue;
    if (!isCloudflareUrl(url)) continue;
    let type = '';
    if (/cdn\.fsl-buckets\.life/i.test(url) || /r2\.cloudflarestorage/i.test(url)) type = 'FSLv2';
    else if (/workers\.dev/i.test(url)) type = 'Worker';
    const qualityMatch = text.match(/(2160|1080|720|480)\s*[pP]/i);
    const quality = qualityMatch ? qualityMatch[1] + 'P' : '';
    links.push({ url, type, quality });
  }
  return links;
}

function dedupe(arr) {
  const seen = {};
  return (arr || []).filter(item => {
    if (!item || !item.url) return false;
    if (seen[item.url]) return false;
    seen[item.url] = true;
    return true;
  });
}

function extractEpisodes(html) {
  const episodes = [];
  const markers = [];
  const markerRegex = /-:\s*Episodes?\s*:\s*(\d+)\s*:-/gi;
  let match;
  while ((match = markerRegex.exec(html)) !== null)
    markers.push({ num: parseInt(match[1], 10), idx: match.index });

  if (markers.length === 0) {
    const fallback = />\s*Episode\s*(\d+)\s*</gi;
    while ((match = fallback.exec(html)) !== null)
      markers.push({ num: parseInt(match[1], 10), idx: match.index });
  }

  for (let i = 0; i < markers.length; i++) {
    const start = markers[i].idx;
    const end = i + 1 < markers.length ? markers[i + 1].idx : html.length;
    const segment = html.substring(start, end);
    const links = [];
    const hubcloudRegex = /href="(https:\/\/hubcloud\.cx\/(?:drive|video)\/[^"]+)"/gi;
    while ((match = hubcloudRegex.exec(segment)) !== null)
      links.push({ type: 'hubcloud', url: match[1] });
    const vcloudRegex = /href="(https:\/\/href\.li\/\?https:\/\/vcloud\.zip\/[^"]+)"/gi;
    while ((match = vcloudRegex.exec(segment)) !== null) {
      const vUrl = extractVcloudUrl(match[1]);
      if (vUrl) links.push({ type: 'vcloud', url: vUrl });
    }
    if (links.length) episodes.push({ number: markers[i].num, links });
  }
  return episodes;
}

function extractSeasonLinks(html) {
  const seasons = {};
  const h4Regex = /<h4[^>]*>([\s\S]*?)<\/h4>/gi;
  const h4s = [];
  let match;
  while ((match = h4Regex.exec(html)) !== null)
    h4s.push({ inner: match[1], start: match.index, end: match.index + match[0].length });

  for (let i = 0; i < h4s.length; i++) {
    const { inner, end: sectionStart } = h4s[i];
    const seasonMatch = inner.match(/Season\s+(\d+)/i);
    const qualityMatch = inner.match(/(\d+p)/i);
    if (!seasonMatch || !qualityMatch) continue;
    const seasonNum = parseInt(seasonMatch[1], 10);
    const quality = qualityMatch[1].toUpperCase();
    const sectionEnd = i + 1 < h4s.length ? h4s[i + 1].start : html.length;
    const segment = html.substring(sectionStart, sectionEnd);
    const abhiMatch = segment.match(/href="(https:\/\/abhilinks\.(?:life|site)\/archives\/\d+)\/?"/i);
    if (abhiMatch) {
      if (!seasons[seasonNum]) seasons[seasonNum] = {};
      if (!seasons[seasonNum][quality]) seasons[seasonNum][quality] = abhiMatch[1];
    }
  }
  return seasons;
}

async function processHubcloud(url) {
  const html = await fetchText(url, { headers: hdrs({ 'Referer': `${BASE_B_URL}/` }) });
  if (!html) return null;
  const phpMatch = html.match(/href="(https:\/\/[^"]*hubcloud\.php[^"]*)"/i);
  if (!phpMatch) return null;
  const phpUrl = phpMatch[1].replace(/&amp;/g, '&');
  const ffUA = 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:152.0) Gecko/20100101 Firefox/152.0';
  const phpHtml = await fetchText(phpUrl, {
    headers: {
      'User-Agent': ffUA,
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Referer': url,
      'DNT': '1',
      'Cookie': 'xla=s4t',
    },
  });
  if (!phpHtml || phpHtml.length < 500) return null;
  return extractFSLLinks(phpHtml);
}

async function processVcloud(url) {
  const html = await fetchText(url, { headers: hdrs({ 'Referer': `${BASE_B_URL}/` }) });
  if (!html) return null;
  const atobMatch = html.match(/atob\s*\(\s*atob\s*\(\s*['"]([^'"]+)['"]\s*\)\s*\)/);
  if (!atobMatch) return null;
  let decoded;
  try { decoded = atob(atob(atobMatch[1])); } catch { return null; }
  const innerHtml = await fetchText(decoded, {
    headers: hdrs({ 'Referer': `${BASE_A_URL}/`, 'Cookie': 'xla=s4t' }),
  });
  if (!innerHtml) return null;
  return extractFSLLinks(innerHtml);
}

async function resolveMatch(postUrl, isSeries, seasonNum, episodeNum) {
  const postHtml = await fetchPostHtml(postUrl);
  if (!postHtml) return [];

  const WANTED = new Set(['1080P', '2160P']);
  let streams = [];

  if (isSeries) {
    const qualityEntries = [];

    if (seasonNum) {
      const seasonLinks = extractSeasonLinks(postHtml);
      if (seasonLinks[seasonNum]) {
        const qualities = Object.keys(seasonLinks[seasonNum]).sort((a, b) => parseInt(b, 10) - parseInt(a, 10));
        qualities.forEach(q => qualityEntries.push({ quality: q, url: seasonLinks[seasonNum][q] }));
      }
    }

    if (!qualityEntries.length) {
      const abhiUrl = extractAbhilinksUrl(postHtml);
      if (abhiUrl) qualityEntries.push({ quality: '', url: abhiUrl });
    }
    if (!qualityEntries.length) return [];

    const abhiHtmls = await Promise.all(
      qualityEntries.map(e => fetchText(e.url, { headers: hdrs() }))
    );

    const tasks = [];
    for (let ei = 0; ei < qualityEntries.length; ei++) {
      const abhiHtml = abhiHtmls[ei];
      if (!abhiHtml) continue;
      const entry = qualityEntries[ei];
      const allEpisodes = extractEpisodes(abhiHtml);
      if (!allEpisodes.length) continue;
      const filtered = episodeNum ? allEpisodes.filter(ep => ep.number === episodeNum) : allEpisodes;
      if (episodeNum && !filtered.length) continue;

      for (const ep of filtered) {
        for (const link of ep.links) {
          const epNum = ep.number;
          tasks.push(async () => {
            let fslLinks = null;
            if (link.type === 'hubcloud') fslLinks = await processHubcloud(link.url);
            else if (link.type === 'vcloud') fslLinks = await processVcloud(link.url);
            if (fslLinks) fslLinks.forEach(l => {
              l.episode = epNum;
              l.quality = l.quality || entry.quality;
            });
            return fslLinks;
          });
        }
      }
    }

    if (!tasks.length) return [];
    const results = await Promise.all(tasks.map(t => t()));
    for (const group of results) {
      if (!group) continue;
      for (const item of group) {
        if (!WANTED.has(item.quality)) continue;
        const name = `${PROVIDER_NAME} • ${item.quality.toLowerCase()} • S${seasonNum || 1}E${item.episode || '?'}`;
        streams.push({
          name, title: name, url: item.url,
          quality: item.quality || '',
          headers: { 'Referer': `${BASE_A_URL}/`, 'User-Agent': currentUA },
        });
      }
    }

  } else {
    const abhiUrl = extractAbhilinksUrl(postHtml);
    if (!abhiUrl) return [];

    const abhiHtml = await fetchText(abhiUrl, { headers: hdrs() });
    if (!abhiHtml) return [];

    const qualityOptions = extractQualityOptions(abhiHtml);
    if (!qualityOptions.length) return [];

    const results = await Promise.all(qualityOptions.map(opt => {
      if (opt.type === 'hubcloud') return processHubcloud(opt.url);
      if (opt.type === 'vcloud') {
        const vUrl = extractVcloudUrl(opt.url);
        return vUrl ? processVcloud(vUrl) : Promise.resolve(null);
      }
      return Promise.resolve(null);
    }));

    for (let i = 0; i < results.length; i++) {
      if (!results[i]) continue;
      const opt = qualityOptions[i];
      for (const item of results[i]) {
        const quality = item.quality || opt.quality;
        if (!WANTED.has(quality)) continue;
        const sizePart = opt.size ? ` • ${opt.size}` : '';
        const name = `${PROVIDER_NAME} • ${quality.toLowerCase()}${sizePart}`;
        streams.push({
          name, title: name, url: item.url,
          quality, size: opt.size || '',
          headers: { 'Referer': `${BASE_A_URL}/`, 'User-Agent': currentUA },
        });
      }
    }
  }

  streams = dedupe(streams);
  streams.sort((a, b) => resWeight(b.quality) - resWeight(a.quality));

  const total = streams.length;
  streams = streams.map((s, i) => {
    const tag = getInvertedSortTag(total - i, total + 1);
    return Object.assign({}, s, { name: tag + s.name, title: tag + s.title });
  });

  return streams;
}

async function getStreams(tmdbId, type, season, episode) {
  try {
    currentUA = UAS[Math.floor(Math.random() * UAS.length)];

    const isSeries = type === 'tv';

    if (isSeries && (season == null || episode == null)) return [];

    const seasonNum = isSeries && season != null ? parseInt(season, 10) : null;
    const episodeNum = isSeries && episode != null ? parseInt(episode, 10) : null;

    const tmdbInfo = await getTMDBInfo(tmdbId, type);
    if (!tmdbInfo) return [];

    const title = isSeries ? tmdbInfo.name : tmdbInfo.title;
    if (!title) return [];

    const searchResults = await searchSite(title);
    if (!searchResults || !searchResults.length) return [];

    const matches = matchHits(searchResults, tmdbInfo, isSeries);
    if (!matches.length) return [];

    try {
      return await firstSuccess(
        matches.map(m => resolveMatch(m.url, isSeries, seasonNum, episodeNum)),
        val => !val || !val.length
      );
    } catch { return []; }
  } catch (e) {
    return [];
  }
}

module.exports = { getStreams };

/* ===== nv universal subtitle lane v1.0.0 (pack 4.48.0) =====================
   Every scraper's stream rows now carry multi-language sidecar subtitles:
   English, Tagalog/Filipino, Korean, Japanese, Indonesian, Malay, Chinese,
   Thai + all other tracks the source offers.

   Source: Stremio's official keyless OpenSubtitles-v3 addon
     GET https://opensubtitles-v3.strem.io/subtitles/{movie|series}/{imdbId}[:s:e].json
     -> { subtitles: [{ url, lang(ISO-639-3), ... }] }
   The subs5.strem.io URLs serve UTF-8 SRT; NuvioTV's player converts SRT to
   WebVTT transparently (playerScreenMethods-42.createSubtitleObjectUrl), and
   the player merges stream.sidecar `subtitles` rows (lang/url/headers) into
   the subtitle rail - the same path the Pencuri English lane uses.

   Design: ES2020-safe, zero-dependency, fail-soft. The IMDb id is resolved
   once per title via TMDB external_ids (cached), the subtitle JSON once per
   (imdb, s, e) (cached 6h). The wrapper runs in PARALLEL with the provider's
   own lane and only fills rows that have no subtitles of their own, so
   provider-specific tracks (vidlove/anikoto/megaplay vtt, pencuri en) always
   win. Never throws; never delays the stream lane by more than the host's
   own 8s deadline.
=========================================================================== */
(function () {
  var G = typeof globalThis !== "undefined" ? globalThis : this;
  if (G.__nvOsv3Subs) return;

  var OSV3_BASE = "https://opensubtitles-v3.strem.io/subtitles/";
  var TMDB_KEY = (typeof TMDB_API_KEY === "string" && TMDB_API_KEY) || "6dc830f9624b43261325bed3bf7d0dfa";
  var TTL_MS = 6 * 60 * 60 * 1000;
  var DEADLINE_MS = 8000;

  /* ISO-639-3 -> ISO-639-1 (+ display names) for the pack's languages */
  var CODE_MAP = {
    eng: "en", tgl: "tl", fil: "fil", ko: "ko", kor: "ko", jpn: "ja",
    ind: "id", may: "ms", zho: "zh", zhe: "zh", zht: "zh-TW", tha: "th",
    hin: "hi", ben: "bn", tam: "ta", tel: "te", spa: "es", por: "pt",
    pob: "pt-BR", fre: "fr", ger: "de", ita: "it", rus: "ru", ara: "ar",
    tur: "tr", vie: "vi", pol: "pl", nld: "nl", ukr: "uk", pes: "fa",
    per: "fa", swe: "sv", nor: "no", dan: "da", fin: "fi", ell: "el",
    heb: "he", hun: "hu", ces: "cs", cze: "cs", ron: "ro", rum: "ro",
    hrv: "hr", srp: "sr", bul: "bg", slo: "sk", slv: "sl", bos: "bs",
    mac: "mk", mkd: "mk", est: "et", lav: "lv", lit: "lt", ind2: "id"
  };
  var NAME_MAP = {
    en: "English", tl: "Tagalog", fil: "Filipino", ko: "Korean", ja: "Japanese",
    id: "Indonesian", ms: "Malay", zh: "Chinese", "zh-TW": "Chinese (Traditional)",
    th: "Thai", hi: "Hindi", bn: "Bengali", ta: "Tamil", te: "Telugu",
    es: "Spanish", pt: "Portuguese", "pt-BR": "Portuguese (BR)", fr: "French",
    de: "German", it: "Italian", ru: "Russian", ar: "Arabic", tr: "Turkish",
    vi: "Vietnamese", pl: "Polish", nl: "Dutch", uk: "Ukrainian", fa: "Persian",
    sv: "Swedish", no: "Norwegian", da: "Danish", fi: "Finnish", el: "Greek",
    he: "Hebrew", hu: "Hungarian", cs: "Czech", sk: "Slovak", ro: "Romanian",
    hr: "Croatian", sr: "Serbian", bg: "Bulgarian", sl: "Slovenian",
    bs: "Bosnian", mk: "Macedonian", et: "Estonian", lv: "Latvian", lt: "Lithuanian"
  };

  var _cache = {};   /* key -> { t: ms, rows: [...] } */
  var _imdbCache = {}; /* tmdbKey -> { t: ms, imdb } */
  var _inflight = {};  /* key -> Promise */

  function _hasTimers() {
    return typeof setTimeout === "function" && typeof Promise !== "undefined" && Promise.race;
  }
  function _withDeadline(p) {
    if (!_hasTimers()) return p;
    return Promise.race([p, new Promise(function (res) {
      var t = setTimeout(function () { res(null); }, DEADLINE_MS);
      if (t && typeof t.unref === "function") t.unref();
    })]);
  }
  function _normType(mediaType) {
    var t = String(mediaType || "").toLowerCase();
    return (t === "series" || t === "show" || t === "tvshow" || t === "tv") ? "series" : "movie";
  }
  function _fetchJson(url) {
    return _withDeadline(
      (typeof fetch === "function" ? fetch(url) : Promise.reject(new Error("no fetch")))
        .then(function (res) {
          if (!res || !res.ok) return null;
          return res.json().catch(function () { return null; });
        })
        .catch(function () { return null; })
    );
  }
  function _resolveImdb(tmdbId, mediaType) {
    var key = _normType(mediaType) + ":" + String(tmdbId);
    var now = Date.now();
    if (_imdbCache[key] && now - _imdbCache[key].t < TTL_MS) {
      return Promise.resolve(_imdbCache[key].imdb);
    }
    if (_inflight["imdb:" + key]) return _inflight["imdb:" + key];
    var kind = _normType(mediaType) === "series" ? "tv" : "movie";
    var url = "https://api.themoviedb.org/3/" + kind + "/" + encodeURIComponent(String(tmdbId)) +
      "/external_ids?api_key=" + TMDB_KEY;
    _inflight["imdb:" + key] = _fetchJson(url).then(function (data) {
      var imdb = data && data.imdb_id && /^tt\d+$/.test(String(data.imdb_id)) ? String(data.imdb_id) : null;
      _imdbCache[key] = { t: now, imdb: imdb };
      delete _inflight["imdb:" + key];
      return imdb;
    });
    return _inflight["imdb:" + key];
  }
  function _osv3Rows(imdbId, mediaType, season, episode) {
    var isSeries = _normType(mediaType) === "series";
    var path = isSeries
      ? "series/" + encodeURIComponent(imdbId) + ":" + (parseInt(season, 10) || 1) + ":" + (parseInt(episode, 10) || 1) + ".json"
      : "movie/" + encodeURIComponent(imdbId) + ".json";
    var key = path;
    var now = Date.now();
    if (_cache[key] && now - _cache[key].t < TTL_MS) return Promise.resolve(_cache[key].rows);
    if (_inflight[key]) return _inflight[key];
    _inflight[key] = _fetchJson(OSV3_BASE + path).then(function (data) {
      var list = (data && Array.isArray(data.subtitles)) ? data.subtitles : [];
      var seen = {};
      var rows = [];
      for (var i = 0; i < list.length; i++) {
        var t = list[i];
        if (!t || !t.url) continue;
        var code = CODE_MAP[String(t.lang || "").toLowerCase()] || String(t.lang || "").toLowerCase();
        if (!code) continue;
        var dedupeKey = code + "|" + (t.id || t.url);
        if (seen[dedupeKey]) continue;
        seen[dedupeKey] = 1;
        rows.push({
          url: String(t.url),
          lang: code,
          language: code,
          name: NAME_MAP[code] || (String(t.lang || "subtitle").charAt(0).toUpperCase() + String(t.lang || "subtitle").slice(1))
        });
        if (rows.length >= 60) break;
      }
      _cache[key] = { t: now, rows: rows };
      delete _inflight[key];
      return rows;
    });
    return _inflight[key];
  }

  G.__nvOsv3Subs = {
    get: function (tmdbId, mediaType, season, episode) {
      try {
        return _resolveImdb(tmdbId, mediaType).then(function (imdb) {
          if (!imdb) return [];
          return _osv3Rows(imdb, mediaType, season, episode);
        }).catch(function () { return []; });
      } catch (e) { return Promise.resolve([]); }
    }
  };
})();

/* ===== nv universal subtitle wrapper v1.0.0 (pack 4.48.0) ==================
   Re-wraps module.exports.getStreams: runs the provider lane and the OSv3
   subtitle lane concurrently, then attaches the language tracks to every
   row that has no subtitles of its own. Provider-specific tracks always
   win; rows keep their originals untouched. Fail-soft end to end.
=========================================================================== */
(function () {
  var G = typeof globalThis !== "undefined" ? globalThis : this;
  var lane = G.__nvOsv3Subs;
  var orig = null;
  try { orig = module.exports && module.exports.getStreams; } catch (e) { orig = null; }
  if (!lane || typeof orig !== "function") return;
  module.exports.getStreams = function (tmdbId, mediaType, season, episode) {
    var rowsP;
    try {
      rowsP = Promise.resolve(orig.apply(this, arguments));
    } catch (e) {
      rowsP = Promise.resolve([]);
    }
    var subsP = lane.get(tmdbId, mediaType, season, episode).catch(function () { return []; });
    return Promise.all([rowsP.catch(function () { return []; }), subsP]).then(function (arr) {
      var rows = Array.isArray(arr[0]) ? arr[0] : [];
      var subs = Array.isArray(arr[1]) ? arr[1] : [];
      if (!rows.length || !subs.length) return rows;
      for (var i = 0; i < rows.length; i++) {
        var r = rows[i];
        if (r && (!r.subtitles || !r.subtitles.length)) r.subtitles = subs;
      }
      return rows;
    });
  };
})();

/* BEGIN NV_NON_ANIME_PROVIDER_BOUNDARY */
(function () {
  var G = typeof globalThis !== 'undefined' ? globalThis : this;
  var original = null;
  try { original = module.exports && module.exports.getStreams; } catch (e) { original = null; }
  if (typeof original !== 'function') return;
  var PROVIDER_ID = "movieshunt";
  var MAX_MS = 22000;

  function number(raw) {
    return raw != null && /^\d+$/.test(String(raw).trim()) ? Number(raw) : null;
  }
  function clean(raw) {
    var id = String(raw == null ? '' : raw).trim();
    try { id = decodeURIComponent(id); } catch (e) {}
    id = id.replace(/[?#].*$/, '').replace(/\.json$/i, '').replace(/\/+$/, '');
    return id;
  }
  function normalize(input, mediaType, season, episode, argCount) {
    var id = clean(input);
    var mt = String(mediaType == null ? '' : mediaType).trim().toLowerCase();
    if (number(mediaType) != null && argCount === 3) {
      episode = season; season = mediaType; mt = 'tv';
    }
    var match = id.match(/^tmdb:(\d+)(?::(\d+)(?::(\d+))?)?$/i);
    if (match) {
      id = match[1];
      if (season == null && match[2] != null) season = Number(match[2]);
      if (episode == null && match[3] != null) episode = Number(match[3]);
    } else {
      match = id.match(/^(asian:[a-z0-9-]+|(?:mal|anilist|kitsu|anikoto):\d+)(?::(\d+)(?::(\d+))?)?$/i);
      if (match) {
        id = match[1];
        if (season == null && match[3] != null) season = Number(match[2]);
        if (episode == null && match[3] != null) episode = Number(match[3]);
        if (episode == null && match[2] != null && match[3] == null) episode = Number(match[2]);
        var owner = /^asian:pmh-/i.test(id) ? 'pinoymovieshub' :
          /^asian:pen-/i.test(id) ? 'pencuri' :
          /^asian:(?:ks|va|kh)-/i.test(id) ? 'asianhub' :
          /^asian:hd4u-/i.test(id) ? 'hdhub4u' :
          /^(mal|anilist|kitsu|anikoto):/i.test(id) ? 'miruro' : '';
        if (!owner || owner !== PROVIDER_ID) return null;
      } else if (!/^\d+$/.test(id) && !/^tt\d+$/i.test(id)) {
        return null;
      }
    }
    if (/^(series|show|tvshow|tv_show|tv|other)$/.test(mt)) mt = 'tv';
    else if (mt !== 'movie') mt = number(episode) != null ? 'tv' : 'movie';
    season = number(season); episode = number(episode);
    if (mt === 'tv' && (season == null || episode == null || episode < 1)) return null;
    return { id: id, mediaType: mt, season: season, episode: episode };
  }
  function cleanRows(raw) {
    if (!Array.isArray(raw)) return [];
    var out = [], seen = {};
    for (var i = 0; i < raw.length && out.length < 40; i++) {
      var row = raw[i];
      if (!row || typeof row !== 'object') continue;
      var url = String(row.url || row.playlist || '').trim();
      if (!/^https?:\/\//i.test(url) || /^https?:\/\/[^/]+\/$/i.test(url)) continue;
      if (/^(?:javascript|data):/i.test(url) || /(?:^|[?&])(?:error|message)=/i.test(url)) continue;
      if (seen[url]) continue;
      seen[url] = 1;
      var copy = {};
      for (var k in row) if (Object.prototype.hasOwnProperty.call(row, k)) copy[k] = row[k];
      copy.url = url;
      out.push(copy);
    }
    return out;
  }
  function tmdbKey() {
    var key = '';
    try {
      if (typeof G.__NV_TMDB_API_KEY === 'string') key = G.__NV_TMDB_API_KEY;
      if (!key && typeof TMDB_API_KEY === 'string') key = TMDB_API_KEY;
      if (!key && typeof TMDB_KEY === 'string') key = TMDB_KEY;
    } catch (e) {}
    return key;
  }
  function resolveImdb(id, mediaType) {
    if (!/^tt\d+$/i.test(id) || PROVIDER_ID === 'torrents' || PROVIDER_ID === 'tagalogtorrents') {
      return Promise.resolve(id);
    }
    var key = tmdbKey();
    if (!key || typeof fetch !== 'function') return Promise.resolve(null);
    var kind = mediaType === 'tv' ? 'tv_results' : 'movie_results';
    var request = Promise.resolve().then(function () {
      return fetch('https://api.themoviedb.org/3/find/' + encodeURIComponent(id) +
        '?external_source=imdb_id&api_key=' + encodeURIComponent(key));
    }).then(function (res) {
      if (!res || !res.ok) return null;
      return res.json();
    }).then(function (data) {
      var list = data && Array.isArray(data[kind]) ? data[kind] : [];
      return list.length && /^\d+$/.test(String(list[0].id)) ? String(list[0].id) : null;
    }).catch(function () { return null; });
    if (typeof setTimeout !== 'function' || typeof clearTimeout !== 'function') return request;
    var timer = null;
    var timeout = new Promise(function (resolve) {
      timer = setTimeout(function () { resolve(null); }, 6000);
      if (timer && typeof timer.unref === 'function') timer.unref();
    });
    return Promise.race([request, timeout]).then(function (result) {
      if (timer != null) clearTimeout(timer);
      return result;
    }).catch(function () {
      if (timer != null) clearTimeout(timer);
      return null;
    });
  }
  function invoke(args, normalized) {
    args[0] = normalized.id;
    args[1] = normalized.mediaType;
    args[2] = normalized.season;
    args[3] = normalized.episode;
    var pending;
    try { pending = Promise.resolve(original.apply(this, args)); }
    catch (e) { return Promise.resolve([]); }
    if (typeof setTimeout !== 'function' || typeof clearTimeout !== 'function') {
      return pending.then(cleanRows).catch(function () { return []; });
    }
    var timer = null;
    var timeout = new Promise(function (resolve) {
      timer = setTimeout(function () { resolve([]); }, MAX_MS);
      if (timer && typeof timer.unref === 'function') timer.unref();
    });
    return Promise.race([pending, timeout]).then(function (rows) {
      if (timer != null) clearTimeout(timer);
      return cleanRows(rows);
    }).catch(function () {
      if (timer != null) clearTimeout(timer);
      return [];
    });
  }
  module.exports.getStreams = function () {
    var args = Array.prototype.slice.call(arguments);
    var normalized = normalize(args[0], args[1], args[2], args[3], args.length);
    if (!normalized) return Promise.resolve([]);
    var self = this;
    return resolveImdb(normalized.id, normalized.mediaType).then(function (resolvedId) {
      if (!resolvedId) return [];
      normalized.id = resolvedId;
      return invoke.call(self, args, normalized);
    }).catch(function () { return []; });
  };
})();
/* END NV_NON_ANIME_PROVIDER_BOUNDARY */
