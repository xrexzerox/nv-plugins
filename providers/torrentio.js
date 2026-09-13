// ============================================
// DECODED: providers/torrentio.js
// Provider: Torrentio
// Original: String array + base64 obfuscation
// ============================================

const TMDB_API_KEY = '439c478a771f35c05022f9feabcca01c';
const TORRENTIO_API = 'https://torrentio.strem.fun';
const PROVIDER_NAME = 'Torrentio';

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'application/json'
};

const TRACKERS = [
  'udp://tracker.opentrackr.org:1337/announce',
  'udp://open.stealth.si:80/announce',
  'udp://tracker.torrent.eu.org:451/announce',
  'udp://tracker.birkenwald.de:6969/announce'
];

function getDebridSettings() {
  let provider = 'none';
  let key = '';
  try {
    let settings = null;
    if (typeof global !== 'undefined' && global.SCRAPER_SETTINGS)
      settings = global.SCRAPER_SETTINGS;
    else if (typeof window !== 'undefined' && window.SCRAPER_SETTINGS)
      settings = window.SCRAPER_SETTINGS;

    if (settings) {
      if (settings.debridProvider)
        provider = String(settings.debridProvider).toLowerCase().trim();
      if (settings.debridKey)
        key = String(settings.debridKey).trim();
    }
  } catch (e) {
    console.error('[Torrentio] Error reading settings context:', e);
  }
  return { provider, key };
}

function buildMagnet(infoHash) {
  if (!infoHash) return '';
  const trackers = TRACKERS.map(t => '&tr=' + encodeURIComponent(t)).join('');
  return 'magnet:?xt=urn:btih:' + infoHash + trackers;
}

function getDebridPathSegment() {
  const { provider, key } = getDebridSettings();
  if (!provider || provider === 'none' || !key) return '';
  return provider + '=' + key;
}

const MIN_SEEDERS = 5; // user rule 2026-09-13: "dont include 0 seeders minimum is 5 seeders"

function emojiFor(quality) {
  if (quality === '2160p') return '🔥';
  if (quality === '1080p') return '💎';
  if (quality === '720p') return '⚡';
  return '📱';
}

async function getStreams(tmdbId, type = 'movie', season = null, episode = null) {
  const isTV = type === 'tv' || type === 'series';

  // v1.2.0: the device passes IMDb tt-ids for addon catalog rows - querying
  // /tv/tt... 404s and the display degenerated to "Unknown Title". Route
  // tt-ids through the /find endpoint (documented, works for movies+series).
  const isTT = /^tt\d+/i.test(String(tmdbId));
  const tmdbUrl = isTT
    ? 'https://api.themoviedb.org/3/find/' + tmdbId + '?api_key=' + TMDB_API_KEY + '&external_source=imdb_id'
    : 'https://api.themoviedb.org/3/' + (isTV ? 'tv' : 'movie') + '/' + tmdbId +
      '?api_key=' + TMDB_API_KEY + '&append_to_response=external_ids';

  try {
    const tmdbData = await fetch(tmdbUrl).then(r => r.ok ? r.json() : null).catch(() => null);
    const hit = isTT
      ? (tmdbData?.tv_results?.[0] || tmdbData?.movie_results?.[0] || null)
      : tmdbData;
    const imdbId = isTT ? tmdbId : (tmdbData?.external_ids?.imdb_id || tmdbData?.imdb_id || tmdbId);
    const title = hit?.title || hit?.name || (isTT ? '' : 'Unknown Title');
    const year = (hit?.release_date || hit?.first_air_date || '').split('-')[0] || '';

    const debridSegment = getDebridPathSegment();
    const prefix = debridSegment ? debridSegment + '/' : '';
    // fix (4.29.0): Torrentio's API wants path-style ids (stream/movie/tt...json);
    // the old 'movie:tt...' colon form returned HTTP 404 -> provider was silently empty
    // Stremio stream id convention: movies = movie/tt....json, series = series/tt...:S:E.json
    const streamId = isTV
      ? 'series/' + imdbId + ':' + (season || 1) + ':' + (episode || 1)
      : 'movie/' + imdbId;
    const torrentioUrl = TORRENTIO_API + '/' + prefix + 'stream/' + streamId + '.json';

    const data = await fetch(torrentioUrl, { headers: HEADERS })
      .then(r => r.ok ? r.json() : null).catch(() => null);

    if (!data?.streams || data.streams.length === 0) return [];

    const streams = [];

    // v1.2.0 FIX: the 4.29.0 parser read torrent.description, but Torrentio
    // ships that field as null on every row - seeders/quality/size were ALL
    // parsed from nothing ("👤 0 | UNKNOWN" rows on devices). The real data
    // lives in `title` (filename + "\n👤 N 💾 size ⚙️ tracker") and the
    // quality tag in `name` ("Torrentio\n4k HDR"). Parsed against the live
    // API shape and filtered: seeders < 5 dropped, unparseable dropped.
    data.streams.forEach(torrent => {
      if (!torrent) return;

      const titleBlob = String(torrent.title || torrent.description || '');
      if (!titleBlob) return;
      const nameBlob = String(torrent.name || '');
      const upper = (titleBlob + ' ' + nameBlob).toUpperCase();

      const seedMatch = titleBlob.match(/👤\s*[:\s]*(\d+)/) || titleBlob.match(/(?:^|\s)(\d+)\s*👤/);
      const seeders = seedMatch ? parseInt(seedMatch[1], 10) : 0;
      if (!seeders || seeders < MIN_SEEDERS) return; // no 0/unknown-seeder rows

      let size = '';
      const sizeMatch = titleBlob.match(/💾\s*[:\s]*([\d.,]+\s*[KMG]B)/i) || titleBlob.match(/([\d.,]+\s*[GM]B)/i);
      if (sizeMatch) size = sizeMatch[1].trim().toUpperCase();

      let source = '';
      const srcMatch = titleBlob.match(/⚙[^\r\n\w]*([^\r\n]+)\s*$/m);
      if (srcMatch) source = srcMatch[1].trim();
      if (!source) {
        const bracketMatch = titleBlob.match(/\[([^\]]+)\]/);
        if (bracketMatch) source = bracketMatch[1].trim();
      }
      if (source && /\d+P|HEVC|H264|WEB|BLURAY|X264|X265/i.test(source)) source = '';

      let quality = '';
      const nameLines = nameBlob.split('\n');
      if (nameLines.length > 1 && nameLines[1].trim()) {
        const q2 = nameLines[1].trim().toUpperCase().split(/\s+/)[0];
        if (/^(4K|2160P|1080P|720P|480P|360P)$/.test(q2)) quality = q2 === '4K' ? '2160p' : q2.toLowerCase();
      }
      if (!quality) {
        if (upper.includes('2160P') || upper.includes('4K')) quality = '2160p';
        else if (upper.includes('1080P')) quality = '1080p';
        else if (upper.includes('720P')) quality = '720p';
        else if (upper.includes('480P')) quality = '480p';
        else if (upper.includes('360P')) quality = '360p';
      }
      if (!quality) return; // would display as "Unknown" - user asked these gone

      const tags = [];
      if (upper.includes('DOLBY VISION') || /\bDV\b/.test(upper)) tags.push('DV');
      if (upper.includes('HDR10+')) tags.push('HDR10+');
      else if (upper.includes('HDR10') || upper.includes('HDR')) tags.push('HDR');
      if (upper.includes('HEVC') || upper.includes('X265') || upper.includes('H265')) tags.push('HEVC');
      if (upper.includes('REMUX')) tags.push('REMUX');
      if (upper.includes('BLURAY') || upper.includes('BLU-RAY')) tags.push('BluRay');
      else if (upper.includes('WEB-DL') || upper.includes('WEBRIP') || /\bWEB\b/.test(upper)) tags.push('Web');
      const tagLine = tags.join(' • ');

      const url = torrent.url || (torrent.infoHash ? buildMagnet(torrent.infoHash) : '');
      if (!url) return;

      const titleLine = isTV
        ? (title ? '🎬 ' + title + ' | ' : '🎬 ') + 'S' + (season || 1) + ' E' + (episode || 1)
        : '🎬 ' + title + (year ? ' (' + year + ')' : '');
      const qualityLine = emojiFor(quality) + ' ' + quality.toUpperCase() + (tagLine ? ' | ' + tagLine : '');
      const infoLine = '👤 ' + seeders + (size ? ' | 💾 ' + size : '') + (source ? ' | 📡 ' + source : '');
      const fullTitle = titleLine + '\n' + qualityLine + '\n' + infoLine;

      streams.push({
        name: PROVIDER_NAME + ' | 👤 ' + seeders + ' | ' + quality.toUpperCase(),
        title: fullTitle,
        size: fullTitle,
        description: fullTitle,
        url: url
      });
    });

    return streams.slice(0, 15);
  } catch (e) {
    console.error('[Torrentio] Error:', e);
    return [];
  }
}

async function onSettings() {
  return [
    { type: 'header', label: 'Debrid Provider Configuration' },
    {
      type: 'select', key: 'debridProvider', label: 'Debrid Provider',
      options: [
        { label: 'None', value: 'none' },
        { label: 'Real-Debrid', value: 'realdebrid' },
        { label: 'Premiumize', value: 'premiumize' },
        { label: 'AllDebrid', value: 'alldebrid' },
        { label: 'DebridLink', value: 'debridlink' },
        { label: 'EasyDebrid', value: 'easydebrid' },
        { label: 'Offcloud', value: 'offcloud' },
        { label: 'TorBox', value: 'torbox' },
        { label: 'Put.io', value: 'putio' }
      ],
      default: 'none'
    },
    {
      type: 'input', isPassword: true, key: 'debridKey',
      label: 'API Key / Token',
      placeholder: 'Enter your Debrid API key',
      description: 'API Key or Access Token for your selected Debrid service.'
    }
  ];
}

module.exports = { getStreams, onSettings };
