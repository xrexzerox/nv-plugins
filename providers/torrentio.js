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

async function getStreams(tmdbId, type = 'movie', season = null, episode = null) {
  const isTV = type === 'tv' || type === 'series';

  const tmdbUrl = 'https://api.themoviedb.org/3/' + (isTV ? 'tv' : 'movie') + '/' + tmdbId +
    '?api_key=' + TMDB_API_KEY + '&append_to_response=external_ids';

  try {
    const tmdbData = await fetch(tmdbUrl).then(r => r.ok ? r.json() : null).catch(() => null);
    const imdbId = tmdbData?.external_ids?.imdb_id || tmdbData?.imdb_id || tmdbId;
    const title = tmdbData?.title || tmdbData?.name || 'Unknown Title';
    const year = tmdbData?.release_date
      ? tmdbData.release_date.split('-')[0]
      : tmdbData?.first_air_date
        ? tmdbData.first_air_date.split('-')[0]
        : 'N/A';

    const debridSegment = getDebridPathSegment();
    const prefix = debridSegment ? debridSegment + '/' : '';
    const streamId = isTV
      ? 'series:' + imdbId + ':' + (season || 1) + ':' + (episode || 1)
      : 'movie:' + imdbId;
    const torrentioUrl = TORRENTIO_API + '/' + prefix + 'stream/' + streamId + '.json';

    const data = await fetch(torrentioUrl, { headers: HEADERS })
      .then(r => r.ok ? r.json() : null).catch(() => null);

    if (!data?.streams || data.streams.length === 0) return [];

    const streams = [];

    data.streams.slice(0, 15).forEach(torrent => {
      if (!torrent) return;

      const description = (torrent.description || '').replace(/\n/g, ' ');
      const upper = description.toUpperCase();
      const seeders = (description.match(/👤\s*(\d+)/)?.[1]) || '0';

      let size = 'Unknown';
      const sizeMatch = description.match(/([0-9.]+ ?[GM]B)/i);
      if (sizeMatch) size = sizeMatch[1].trim();

      let quality = 'Unknown';
      let emoji = '💎';
      if (upper.includes('2160P') || upper.includes('4K')) {
        quality = '2160p'; emoji = '🔥';
      } else if (upper.includes('1080P')) {
        quality = '1080p'; emoji = '💎';
      } else if (upper.includes('720P')) {
        quality = '720p'; emoji = '⚡';
      } else if (upper.includes('480P')) {
        quality = '480p'; emoji = '📱';
      }

      let audio = 'Unknown';
      if (upper.includes('DUAL') || upper.includes('DUAL-AUDIO'))
        audio = 'Dual-Audio';
      else if (upper.includes('HINDI') || upper.includes('TELUGU') || upper.includes('TAMIL'))
        audio = 'Dual-Audio';
      else if (upper.includes('ENGLISH'))
        audio = 'English';

      const tags = [];
      if (upper.includes('DV') || upper.includes('DOLBY VISION')) tags.push('DV');
      if (upper.includes('HDR10+')) tags.push('HDR10+');
      else if (upper.includes('HDR10')) tags.push('HDR10');
      else if (upper.includes('HDR')) tags.push('HDR');
      if (upper.includes('HEVC') || upper.includes('X265') || upper.includes('H265'))
        tags.push('HEVC');
      tags.push(audio);
      const tagLine = tags.join(' • ');

      let source = PROVIDER_NAME;
      const bracketMatch = description.match(/\[(.*?)\]/);
      if (bracketMatch && bracketMatch[1]) {
        const src = bracketMatch[1].trim();
        if (!/\d+P|HEVC|H264|WEB|BLURAY/i.test(src)) source = src;
      }
      if (source === PROVIDER_NAME) {
        if (upper.includes('RARBG')) source = 'RARBG';
        else if (upper.includes('YTS')) source = 'YTS';
        else if (upper.includes('PIRATEBAY') || upper.includes('TPB')) source = 'ThePirateBay';
        else if (upper.includes('1337X')) source = '1337x';
        else if (upper.includes('EZTV')) source = 'EZTV';
        else if (upper.includes('TGX')) source = 'TGX';
      }

      const url = torrent.url || (torrent.infoHash ? buildMagnet(torrent.infoHash) : '');

      const titleLine = isTV
        ? '🎬 ' + title + ' | S' + (season || 1) + ' E' + (episode || 1)
        : '🎬 ' + title + ' - ' + year;
      const qualityLine = emoji + ' ' + quality + ' | ' + tagLine;
      const infoLine = '👤 ' + seeders + ' | 💾 ' + size + ' | 📡 ' + source;
      const fullTitle = titleLine + '\n' + qualityLine + '\n' + infoLine;

      streams.push({
        name: PROVIDER_NAME + ' | 👤 ' + seeders + ' | ' + quality.toUpperCase(),
        title: fullTitle,
        size: fullTitle,
        description: fullTitle,
        url: url
      });
    });

    return streams;
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
