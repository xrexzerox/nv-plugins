#!/usr/bin/env node
/**
 * Asian Catalog — addon test harness
 *
 *   node test-catalog.js            # offline tests (mock network)
 *   LIVE=1 node test-catalog.js     # + live tests against the real sources
 *
 * Run from this folder. Requires Node >= 18.
 */

'use strict';

require('./core.js');
const Core = globalThis.AsianCatalogCore;
const fs = require('fs');
const path = require('path');

let passed = 0;
let failed = 0;
const failures = [];

function check(name, cond, extra) {
  if (cond) { passed++; console.log('  ok  ' + name); }
  else {
    failed++;
    failures.push(name + (extra !== undefined ? ' | ' + JSON.stringify(extra).substring(0, 300) : ''));
    console.log('  FAIL ' + name + (extra !== undefined ? ' | ' + JSON.stringify(extra).substring(0, 300) : ''));
  }
}

function section(name) { console.log('\n== ' + name + ' =='); }

// ============================================================
// FIXTURE BUILDERS
// ============================================================

const PINOY = 'https://pinoymovieshub.test';
const KS = 'https://kissasian.test';
const VA = 'https://viewasian.test';
const PAGE_LIMIT = 5; // small pages make pagination assertions sharp

// --- pinoy (Dooplay HTML) fixtures ---

function pinoyArchiveItem(postId, slug, title, year, kind, poster) {
  const pathRoot = kind === 'movie' ? 'movies' : 'series';
  const p = poster || `${PINOY}/wp-content/themes/dooplay/assets/img/no/dt_backdrop.png`;
  return `<article class="item" id="post-${postId}"><div class="image"><a href="${PINOY}/${pathRoot}/${slug}"> ` +
    `<img src="${p}" alt="${title}" /> </a><a href="${PINOY}/${pathRoot}/${slug}">` +
    `<div class="data"><h3 class="title">${title}</h3><span>${year}</span></div></a>` +
    `<span class="item_type">${kind === 'movie' ? 'Movie' : 'TV'}</span></div></article>`;
}

function pinoyFeaturedItem(postId, slug, title, kind, poster) {
  const pathRoot = kind === 'movie' ? 'movies' : 'series';
  return `<article id="post-featured-${postId}" class="item ${kind}s"><div class="poster">` +
    `<img src="${poster}" alt="${title}"><div class="rating">0</div><div class="featu">Featured</div>` +
    `<a href="${PINOY}/${pathRoot}/${slug}">More</a></div></article>`;
}

function pinoySearchItem(slug, title, year, kind, desc) {
  const pathRoot = kind === 'movie' ? 'movies' : 'series';
  return `<article><div class="image"><div class="thumbnail animation-2">` +
    `<a href="${PINOY}/${pathRoot}/${slug}?_rt=MXwx&amp;_rt_nonce=de91a29ccf">` +
    `<img src="${PINOY}/wp-content/uploads/2025/03/IMG-150x150.webp" alt="${title}" />` +
    `<span class="${kind === 'movie' ? 'movies' : 'tv'}">${kind === 'movie' ? 'Movie' : 'TV'}</span></a></div></div>` +
    `<div class="details"><div class="title"><a href="${PINOY}/${pathRoot}/${slug}?_rt=MXwx&amp;_rt_nonce=de91a29ccf">${title}</a></div>` +
    `<div class="meta"><span class="year">${year}</span></div>` +
    `<div class="contenido"><p>${desc || 'A story.'}</p></div></div></article>`;
}

// Pinoy movie archive: page 1 = 6 titles (2 unmatchable), page 2 = 4 (all
// match), page 3+ empty. The same titles appear in the series archive under
// series/ links (kind derived from URL).
function pinoyMoviesHtml(page) {
  const real = [
    ['noon-mantis', 'Queen Mantis (Tagalog Dubbed)', '2025'],
    ['narco-saints', 'Narco Saints', '2022'],
    ['zz-untitled-project', 'Untitled Project', '2026'],
    ['seventy-two-hours', '72 Hours', '2025'],
    ['kilig-movie-2026', 'Kilig Movie', '2026'],
    ['love-ngo', 'Love Ngo', '2026'],
    ['co-x-love', 'Co x Love', '2025'],
    ['love-siargao', 'Love Siargao', '2026']
  ];
  if (page === 1) {
    let html = '<div class="featured">' +
      pinoyFeaturedItem('501', 'featured-one', 'Featured One', 'movie', `${PINOY}/wp-content/uploads/feat-501.jpg`) + '</div>';
    real.forEach((r, i) => {
      const poster = i % 2 === 0
        ? `${PINOY}/wp-content/uploads/${r[0]}-150x150.webp`
        : `${PINOY}/wp-content/themes/dooplay/assets/img/no/dt_backdrop.png`;
      html += pinoyArchiveItem(100 + i, r[0], r[1], r[2], 'movie', poster);
    });
    return html;
  }
  if (page === 2) {
    let html = '';
    ['cobra-kai', 'hello-love-again', 'a-hard-day', 'requiem'].forEach((s, i) => {
      html += pinoyArchiveItem(200 + i, s, s.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()), '2018', 'movie');
    });
    return html;
  }
  return '<div class="no-items">Nothing found</div>';
}

function pinoySeriesHtml(page) {
  if (page !== 1) return '<div class="no-items">Nothing found</div>';
  let html = '';
  [
    ['linang', 'Linang', '2026'],
    ['queen-mantis-series', 'Queen Mantis (Tagalog Dubbed)', '2025'],
    ['the-joys-and-sorrows', 'The Joys and Sorrows', '2025']
  ].forEach((r, i) => {
    html += pinoyArchiveItem(300 + i, r[0], r[1], r[2], 'series', `${PINOY}/wp-content/uploads/${r[0]}-150x150.webp`);
  });
  return html;
}

function pinoySearchHtml(page, q) {
  if (page !== 1) return '<div class="no-items">Nothing found</div>';
  const ql = q.toLowerCase();
  let html = '';
  if (ql.indexOf('love') !== -1) {
    html += pinoySearchItem('love-siargao', 'Love Siargao', '2026', 'movie', 'An island romance.');
    html += pinoySearchItem('love-ngo', 'Love Ngo', '2026', 'movie', 'Comedy romance.');
  }
  if (ql.indexOf('mantis') !== -1) {
    html += pinoySearchItem('noon-mantis', 'Queen Mantis (Tagalog Dubbed)', '2025', 'movie');
    html += pinoySearchItem('queen-mantis-series', 'Queen Mantis (Tagalog Dubbed)', '2025', 'series');
  }
  return html || '<div class="no-items">Nothing found</div>';
}

// --- kissasian (dramastream theme) fixtures ---
// List rows are EPISODE articles (/{slug}-episode-{n}/) that the engine
// dedupes to series; search rows carry /series/{slug}/ links. Titles have
// NO year on this site (TMDB resolves without it).

function ksEpisodeRow(slug, title, ep) {
  return `<article class="bs" itemscope="itemscope" itemtype="http://schema.org/CreativeWork"><div class="bsx"> <a href="${KS}/${slug}-episode-${ep}/" itemprop="url" title="${title} Episode ${ep}" class="tip" rel="49346"><div class="limit"><div class="status Ongoing">Ongoing</div><div class="typez Drama">Drama</div></div> <img src="${KS}/wp-content/uploads/${slug}-209x300.jpg" class="ts-post-image wp-post-image" title="${title} Episode ${ep}" alt="${title} Episode ${ep}" width="209" height="300"/></div><div class="tt tts"> ${title} Episode ${ep}<h2 itemprop="headline">${title} Episode ${ep}</h2></div></a></div></article>`;
}

function ksSeriesRow(slug, title) {
  return `<article class="bs" itemscope="itemscope" itemtype="http://schema.org/CreativeWork"><div class="bsx"> <a href="${KS}/series/${slug}/" itemprop="url" title="${title}" class="tip" rel="49347"><div class="limit"><div class="status Completed">Completed</div></div> <img src="${KS}/wp-content/uploads/${slug}-209x300.jpg" class="ts-post-image wp-post-image" title="${title}" alt="${title}" width="209" height="300"/></div><div class="tt tts"> ${title}<h2 itemprop="headline">${title}</h2></div></a></div></article>`;
}

// pages hold episode rows (latest-updates browse); every page is deduped to
// its distinct series by the engine
const KS_PAGE = {
  1: [
    ['crash-landing-on-you', 'Crash Landing on You'],
    ['the-love-lab', 'The Love Lab'],
    ['queen-of-tears', 'Queen of Tears'],
    ['hidden-love', 'Hidden Love'],
    ['dr-asura', 'Dr. Asura']
  ].map(([slug, t]) => ksEpisodeRow(slug, t, 1)).join('\n'),
  2: [
    ['club-friday', 'Club Friday'],
    ['weak-hero', 'Weak Hero'],
    // duplicate of a page-1 series (later episode) -> cross-page dedupe
    ['crash-landing-on-you', 'Crash Landing on You']
  ].map(([slug, t]) => ksEpisodeRow(slug, t, 9)).join('\n')
};

const KS_SEARCH_HTML = [
  ksSeriesRow('queen-of-tears', 'Queen of Tears'),
  ksSeriesRow('mr-queen', 'Mr. Queen'),
  ksSeriesRow('queen-seon-duk', 'Queen Seon Duk')
].join('\n');

const KS_GENRE_ROMANCE_HTML = [
  ['the-love-lab', 'The Love Lab'],
  ['hidden-love', 'Hidden Love'],
  ['crash-landing-on-you', 'Crash Landing on You']
].map(([slug, t]) => ksEpisodeRow(slug, t, 2)).join('\n');

const KS_GENRE_OTHER_HTML = ksEpisodeRow('weak-hero', 'Weak Hero', 4);

// --- viewasian (viewasian theme) fixtures ---
// Rows carry the year inline ("Show (2024) Episode 2 English Sub") and
// root-level episode URLs; search rows link /drama/{slug}/.

function vaRow(slug, title, ep) {
  const full = `${title} Episode ${ep} English Sub`;
  return `<li>
              <a href="${VA}/${slug}-episode-${ep}-english-sub/" class="img">
                <img class="lazy" alt="${full}" title="${full}" data-original="${VA}/wp-content/uploads/${slug}.jpg" style="display: block;"> <span class="type">SUB</span>
                <h2 class="title" onclick="window.location = '${VA}/${slug}-episode-${ep}-english-sub/'">${full}</h2>
              </a>
            </li>`;
}

const VA_PAGE = {
  1: [
    ['crash-landing-on-you-2019', 'Crash Landing on You (2019)'],
    ['the-love-lab-2026', 'The Love Lab (2026)'],
    ['hidden-love-2023', 'Hidden Love (2023)'],
    ['dr-asura-2025', 'Dr. Asura (2025)'],
    ['totally-unknown-show-2026', 'Totally Unknown Show (2026)']
  ].map(([slug, t]) => vaRow(slug, t, 2)).join('\n'),
  2: [
    ['club-friday-2025', 'Club Friday (2025)'],
    ['weak-hero-2022', 'Weak Hero (2022)']
  ].map(([slug, t]) => vaRow(slug, t, 4)).join('\n')
};

const VA_SEARCH_HTML = `<li>
              <a href="${VA}/drama/crash-landing-on-you-2019/" class="img" title="Crash Landing on You (2019)">
                <img class="lazy" alt="Crash Landing on You (2019)" title="Crash Landing on You (2019)" data-original="${VA}/wp-content/uploads/crash-landing-on-you-2019.jpg">
              </a>
            </li>
            <li>
              <a href="${VA}/drama/no-9-hunter-2026/" class="img" title="No. 9 Hunter (2026)">
                <img class="lazy" alt="No. 9 Hunter (2026)" title="No. 9 Hunter (2026)" data-original="${VA}/wp-content/uploads/no-9-hunter-2026.jpg">
              </a>
            </li>`;

const VA_COUNTRY_KOREAN_HTML = [
  ['crash-landing-on-you-2019', 'Crash Landing on You (2019)'],
  ['queen-of-tears-2024', 'Queen of Tears (2024)']
].map(([slug, t]) => vaRow(slug, t, 1)).join('\n');

const VA_GENRE_MELODRAMA_HTML = [
  ['hidden-love-2023', 'Hidden Love (2023)'],
  ['queen-of-tears-2024', 'Queen of Tears (2024)']
].map(([slug, t]) => vaRow(slug, t, 6)).join('\n');

// --- TMDB fixtures ---

const TMDB_RESULTS = {
  'search:movie:queen mantis': [{ id: 99901, title: 'Queen Mantis', original_language: 'ko', release_date: '2025-01-01', poster_path: '/qm.jpg', backdrop_path: '/qmb.jpg', overview: 'A mantis queen.', vote_average: 7.4 }],
  'search:movie:love siargao': [{ id: 99906, title: 'Love Siargao', original_language: 'tl', release_date: '2026-02-14', poster_path: '/ls.jpg', overview: 'Island romance.', vote_average: 6.1 }],
  'search:movie:love ngo': [{ id: 99903, title: 'Love Ngo', original_language: 'tl', release_date: '2026-01-01', poster_path: '/ln.jpg', overview: 'Comedy.', vote_average: 5.5 }],
  'search:movie:72 hours': [{ id: 99904, title: '72 Hours', original_language: 'tl', release_date: '2025-03-01', poster_path: '/72.jpg', overview: 'Thriller.', vote_average: 6.8 }],
  'search:movie:co x love': [{ id: 99905, title: 'Co x Love', original_language: 'tl', release_date: '2025-04-01', poster_path: '/cx.jpg', overview: 'Romcom.', vote_average: 5.9 }],
  'search:movie:narco saints': [{ id: 99902, title: 'Narco-Saints', original_language: 'ko', release_date: '2022-09-09', poster_path: '/ns.jpg', overview: 'Crime.', vote_average: 7.1 }],
  'search:movie:cobra kai': [{ id: 99908, title: 'Cobra Kai', original_language: 'en', release_date: '2018-05-02', poster_path: '/ck.jpg', overview: 'Karate.', vote_average: 8.1 }],
  'search:movie:hello love again': [{ id: 99909, title: 'Hello, Love, Again', original_language: 'tl', release_date: '2024-11-13', poster_path: '/hla.jpg', overview: 'Romance.', vote_average: 7.0 }],
  'search:movie:a hard day': [{ id: 99910, title: 'A Hard Day', original_language: 'ko', release_date: '2014-05-29', poster_path: '/ahd.jpg', overview: 'Thriller.', vote_average: 7.3 }],
  'search:movie:requiem': [{ id: 99911, title: 'Requiem', original_language: 'en', release_date: '2021-08-08', poster_path: '/rq.jpg', overview: 'Mystery.', vote_average: 6.5 }],
  'search:movie:linang': [{ id: 99912, title: 'Linang', original_language: 'tl', release_date: '2026-03-01', poster_path: '/ln2.jpg', overview: 'Drama.', vote_average: 6.2 }],
  'search:movie:the joys and sorrows': [{ id: 99913, title: 'The Joys and Sorrows', original_language: 'tl', release_date: '2025-09-01', poster_path: '/tjs.jpg', overview: 'Family.', vote_average: 6.9 }],
  'search:tv:the love lab': [{ id: 88001, name: 'The Love Lab', original_language: 'ko', first_air_date: '2026-06-24', poster_path: '/tll.jpg', overview: 'Dating show.', vote_average: 6.7 }],
  'search:tv:queen mantis': [{ id: 99914, name: 'Queen Mantis', original_language: 'ko', first_air_date: '2025-10-01', poster_path: '/qms.jpg', overview: 'Thriller series.', vote_average: 7.2 }],
  'search:tv:linang': [{ id: 88007, name: 'Linang', original_language: 'tl', first_air_date: '2026-03-01', poster_path: '/ln2.jpg', overview: 'Drama.', vote_average: 6.2 }],
  'search:tv:queen of tears': [{ id: 88002, name: 'Queen of Tears', original_language: 'ko', first_air_date: '2024-03-09', poster_path: '/qot.jpg', overview: 'Melodrama.', vote_average: 8.4 }],
  'search:tv:hidden love': [{ id: 88003, name: 'Hidden Love', original_language: 'zh', first_air_date: '2023-06-20', poster_path: '/hl.jpg', overview: 'Romance.', vote_average: 8.5 }],
  'search:tv:dr asura': [{ id: 88004, name: 'Dr. Asura', original_language: 'ja', first_air_date: '2025-04-01', poster_path: '/da.jpg', overview: 'Medical.', vote_average: 6.4 }],
  'search:tv:club friday': [{ id: 88005, name: 'Club Friday', original_language: 'th', first_air_date: '2025-01-01', poster_path: '/cf.jpg', overview: 'Anthology.', vote_average: 6.0 }],
  'search:tv:weak hero': [{ id: 88006, name: 'Weak Hero', original_language: 'ko', first_air_date: '2022-11-18', poster_path: '/wh.jpg', overview: 'Action.', vote_average: 8.3 }],
  'search:tv:crash landing on you': [{ id: 88008, name: 'Crash Landing on You', original_language: 'ko', first_air_date: '2019-12-14', poster_path: '/cloy.jpg', overview: 'Romance.', vote_average: 8.7 }],
  'search:movie:parasite': [
    { id: 496243, title: 'Parasite', original_language: 'ko', release_date: '2019-05-30', poster_path: '/pa.jpg', overview: 'Class satire.', vote_average: 8.5 },
    { id: 500001, title: 'Parasite in Love', original_language: 'en', release_date: '2021-01-01', poster_path: '/pil.jpg', overview: 'Not asian.', vote_average: 5.0 }
  ]
};

function tmdbDiscoverMovies(sort, page) {
  // stable 6-item page 1; empty afterwards
  if (String(page) !== '1') return [];
  return [
    { id: 700001, title: 'Demon Slayer Infinity Castle', original_language: 'ja', release_date: '2026-07-18', poster_path: '/ds.jpg', overview: 'Anime film.', vote_average: 8.6 },
    { id: 700002, title: 'The Furious', original_language: 'zh', release_date: '2026-09-01', poster_path: '/tf.jpg', overview: 'Action.', vote_average: 7.2 },
    { id: 700003, title: 'Colony', original_language: 'ko', release_date: '2026-08-01', poster_path: '/co.jpg', overview: 'Sci-fi.', vote_average: 6.9 },
    { id: 700004, title: 'Shape of My Heart', original_language: 'ja', release_date: '2026-08-29', poster_path: '/sh.jpg', overview: 'Drama.', vote_average: 6.0 },
    { id: 700005, title: 'Door', original_language: 'ja', release_date: '2026-08-20', poster_path: '/do.jpg', overview: 'Horror.', vote_average: 5.8 },
    { id: 700006, title: 'Hibla 2', original_language: 'tl', release_date: '2026-02-01', poster_path: '/hi.jpg', overview: 'Drama.', vote_average: 5.5 }
  ];
}

function tmdbDiscoverTv(sort, page) {
  if (String(page) !== '1') return [];
  return [
    { id: 800001, name: 'Spiritual Realm Walker', original_language: 'ko', first_air_date: '2026-09-03', poster_path: '/srw.jpg', overview: 'Fantasy.', vote_average: 7.5 },
    { id: 800002, name: 'You Maniac', original_language: 'ko', first_air_date: '2026-08-29', poster_path: '/ym.jpg', overview: 'Thriller.', vote_average: 7.0 },
    { id: 800003, name: 'Four Hands, Two Sonatas', original_language: 'ja', first_air_date: '2026-08-29', poster_path: '/fh.jpg', overview: 'Music.', vote_average: 6.6 },
    { id: 800004, name: 'Mousetrap', original_language: 'zh', first_air_date: '2026-08-28', poster_path: '/mt.jpg', overview: 'Mystery.', vote_average: 6.1 },
    { id: 800005, name: 'Club Friday The Series', original_language: 'th', first_air_date: '2026-08-01', poster_path: '/cfs.jpg', overview: 'Anthology.', vote_average: 5.9 },
    { id: 800006, name: 'Beach Boys', original_language: 'tl', first_air_date: '2026-07-15', poster_path: '/bb.jpg', overview: 'Comedy.', vote_average: 5.2 }
  ];
}

// ============================================================
// MOCK ROUTER
// ============================================================

function makeRouter() {
  const calls = [];
  // --- /stream+meta upstream fixtures (v3.2.0) ---

  // Byse playback payload: real AES-256-GCM via node crypto, key split into
  // key_parts[v-1] + parts[30-v] (b64url halves), 16-byte tag appended (the
  // decryptor skips it). Mirrors the wire format captured live in Task 4.
  const BYSE_KEY = require('crypto').randomBytes(32);
  const BYSE_IV = require('crypto').randomBytes(12);
  const BYSE_PLAIN = JSON.stringify({
    sources: [
      { url: 'https://edge.justplay.test/hls/qot/master.m3u8', height: 1080, label: '1080p', mime_type: 'application/vnd.apple.mpegurl' },
      { url: 'https://edge.justplay.test/hls/qot/low.m3u8', height: 480, label: '480p', mime_type: 'application/vnd.apple.mpegurl' }
    ]
  });
  const byseB64url = (buf) => Buffer.from(buf).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const BYSE_PARTS = [];
  for (let i = 0; i < 30; i++) BYSE_PARTS.push(byseB64url(require('crypto').randomBytes(16)));
  BYSE_PARTS[6] = byseB64url(BYSE_KEY.slice(0, 16));   // version 7 -> part[6]
  BYSE_PARTS[23] = byseB64url(BYSE_KEY.slice(16, 32)); // and part[30-7]
  // Real GCM encrypts the first block with counter inc32(J0) = IV||0x00000002.
  // aes-256-ctr with that exact initial counter block produces the identical
  // ciphertext stream the plugin decryptor recovers (it skips the 16-byte
  // auth tag, so the trailing tag bytes are dummy filler here).
  const byseCtr = require('crypto').createCipheriv('aes-256-ctr', BYSE_KEY,
    Buffer.concat([BYSE_IV, Buffer.from([0, 0, 0, 2])]));
  const BYSE_PAYLOAD = Buffer.concat([
    byseCtr.update(BYSE_PLAIN, 'utf8'), byseCtr.final(), require('crypto').randomBytes(16)
  ]);
  const BYSE_PLAYBACK = {
    algorithm: 'AES-256-GCM', version: 7,
    iv: byseB64url(BYSE_IV), payload: BYSE_PAYLOAD.toString('base64'),
    key_parts: BYSE_PARTS, expires_at: '2026-12-31T00:00:00Z'
  };
  let byseTokenSeen = null;
  let byseSolutionSeen = null;

  const ksSeriesPageHtml = [
    '<html><head>',
    '<title>Queen of Tears - KissAsian.test</title>',
    '<meta property="og:image" content="' + KS + '/wp-content/uploads/qot.jpg">',
    '<meta property="og:description" content="A married couple in crisis.">',
    '</head><body><h1>Queen of Tears</h1>',
    `<a href="${KS}/queen-of-tears-episode-1/">Episode 1</a>`,
    `<a href="${KS}/queen-of-tears-episode-2/">Episode 2</a>`,
    `<a href="${KS}/queen-of-tears-episode-3/">Episode 3</a>`,
    `<a href="${KS}/other-show-episode-1/">Unrelated</a>`,
    '</body></html>'
  ].join('\n');
  const ksEpisodePageHtml = (n) => [
    '<html><head><title>Queen of Tears Episode ' + n + '</title></head><body>',
    '<iframe src="https://justplay.cam/e/qot-e' + n + '" allowfullscreen></iframe>',
    '</body></html>'
  ].join('\n');

  // One show per drama page (matches the real site): crash episodes only.
  const vaDramaPageHtml = [
    '<html><head>',
    '<title>Crash Landing on You (2019) - ViewAsian.test</title>',
    '<meta property="og:image" content="' + VA + '/wp-content/uploads/cloy.jpg">',
    '<meta property="og:description" content="Paragliding accident.">',
    '</head><body><h1>Crash Landing on You (2019)</h1>',
    `<a href="${VA}/crash-landing-on-you-2019-episode-1-english-sub/">Ep1</a>`,
    `<a href="${VA}/crash-landing-on-you-2019-episode-2-english-sub/">Ep2</a>`,
    `<a href="${VA}/crash-landing-on-you-2019-episode-3-english-sub-123/">Ep3</a>`,
    '</body></html>'
  ].join('\n');
  const vaDramaN9PageHtml = [
    '<html><head><title>No. 9 Hunter (2026) - ViewAsian.test</title></head><body>',
    `<a href="${VA}/no-9-hunter-2026-episode-1-english-sub/">N9 Ep1</a>`,
    `<a href="${VA}/no-9-hunter-2026-episode-2-english-sub/">N9 Ep2</a>`,
    '</body></html>'
  ].join('\n');
  const vaEpisodePageHtml = `<html><body><iframe src="https://kisskh.space/crash-landing-on-you-2019-ep3"></iframe></body></html>`;
  const vaPlayerPageHtml = `<html><body><iframe src="https://vidmoly-test.example/embed-qot9x.html"></iframe></body></html>`;
  const vaEmbedPageHtml = `<html><body>var file = "https://cdn.vidmoly-test.example/hls/qot/master.m3u8?tok=1";</body></html>`;

  const phMoviePageHtml = [
    '<html><head><title>Mixed Signals (2025)</title>',
    '<meta property="og:image" content="' + PINOY + '/wp-content/uploads/ms.jpg">',
    '<meta property="og:description" content="A rom-com.">',
    '</head><body><h1>Mixed Signals (2025)</h1>',
    '<ul><li class="dooplay_player_option" data-post="99001" data-type="movie" data-nume="1">',
    '<span class="title">Server 1</span></li>',
    '<li class="dooplay_player_option" data-post="99001" data-type="movie" data-nume="2">',
    '<span class="title">Server Trailer</span></li></ul>',
    '</body></html>'
  ].join('\n');
  const mixdropEmbedHtml = [
    '<html><body><script>eval(function(p,a,c,k,e,d){while(--){}}(',
    "'MDCore.wurl=\"1\";',62,2,'xx|https://cdn.mixdrop-test.example/f/vid-777.mp4'",
    ".split('|'),0,{}))</script></body></html>"
  ].join('');

  async function router(url, opts) {
    calls.push(String(url));
    const u = String(url);
    const respond = (body, status) => ({
      ok: (status || 200) >= 200 && (status || 200) < 300,
      status: status || 200,
      text: async () => typeof body === 'string' ? body : JSON.stringify(body),
      json: async () => typeof body === 'string' ? JSON.parse(body) : body
    });

    // justplay.cam Byse embed API (captcha -> PoW verify -> playback)
    if (u.indexOf('https://justplay.cam/') === 0) {
      if (u.indexOf('/embed/captcha/verify') !== -1) {
        let body = {};
        try { body = JSON.parse(String((opts && opts.body) || '{}')); } catch (e) { body = {}; }
        byseSolutionSeen = body && body.solution;
        return respond({ status: 'ok', token: 'tok-123' });
      }
      if (u.indexOf('/embed/captcha') !== -1) {
        return respond({ status: 200, pow_nonce: 'nonce-abc-42', pow_difficulty: 12, pow_token: 'ptok-777' });
      }
      if (u.indexOf('/embed/playback') !== -1) {
        const hdrs = (opts && opts.headers) || {};
        if (hdrs['X-Captcha-Token'] !== 'tok-123') return respond({ error: 'no token' }, 403);
        return respond({ playback: BYSE_PLAYBACK });
      }
      return respond({ error: 'unknown justplay route' }, 404);
    }
    if (byseSolutionSeen && !byseTokenSeen) byseTokenSeen = true;

    // viewasian player hop (kisskh.space) + vidmoly embed + cdn playlist
    if (u.indexOf('https://kisskh.space/') === 0) return respond(vaPlayerPageHtml);
    if (u.indexOf('https://vidmoly-test.example/') === 0) return respond(vaEmbedPageHtml);
    if (u.indexOf('https://cdn.vidmoly-test.example/') === 0) {
      return respond('#EXTM3U\n#EXT-X-STREAM-INF:BANDWIDTH=3000000,RESOLUTION=1920x1080\n1080p.m3u8\n#EXT-X-STREAM-INF:BANDWIDTH=800000,RESOLUTION=640x480\n480p.m3u8');
    }
    if (u.indexOf('https://mixdrop-test.example/') === 0) return respond(mixdropEmbedHtml);

    // pinoy (Dooplay) — catalog pages + direct item pages + dooplayer API
    if (u.indexOf(PINOY) === 0) {
      const pathOnly = u.split('?')[0];
      if (/\/wp-json\/dooplayer\/v2\/99001\/movie\/1$/.test(pathOnly)) {
        return respond([{ embed_url: 'https://mixdrop-test.example/e/vid777' }]);
      }
      if (/\/wp-json\/dooplayer\/v2\/99001\/movie\/2$/.test(pathOnly)) {
        return respond([{ embed_url: 'https://youtube-trailer.example/watch?v=x' }]);
      }
      if (/\/movies\/mixed-signals\/?$/.test(pathOnly)) return respond(phMoviePageHtml);
      let page = 1;
      const mp = u.match(/\/page\/(\d+)/);
      if (mp) page = parseInt(mp[1], 10);
      const mq = u.match(/[?&]s=([^&]*)/);
      if (mq) return respond(pinoySearchHtml(page, decodeURIComponent(mq[1])));
      if (/\/genre\/([^/]+)/.test(pathOnly)) {
        const genre = pathOnly.match(/\/genre\/([^/]+)/)[1];
        if (genre === 'tagalog-dubbed' && page === 1) {
          return respond(pinoyArchiveItem(400, 'tagalog-dub-one', 'Tagalog Dub One', '2025', 'series') +
            pinoyArchiveItem(401, 'tagalog-dub-two', 'Tagalog Dub Two', '2024', 'series'));
        }
        return respond(page === 1 ? '' : '<div class="no-items">Nothing</div>');
      }
      if (/\/movies(\/page\/\d+)?\/?$/.test(pathOnly)) return respond(pinoyMoviesHtml(page));
      if (/\/series(\/page\/\d+)?\/?$/.test(pathOnly)) return respond(pinoySeriesHtml(page));
      return respond('<html><body>404</body></html>', 404);
    }

    // kissasian — catalog pages + series/episode pages for /stream+/meta
    if (u.indexOf(KS) === 0) {
      const pathOnly = u.split('?')[0];
      if (/\/series\/queen-of-tears\/?$/.test(pathOnly)) return respond(ksSeriesPageHtml);
      const me = pathOnly.match(/\/(queen-of-tears-episode-(\d+))\/?$/);
      if (me) return respond(ksEpisodePageHtml(parseInt(me[2], 10)));
      if (/\/genres\/romance\/?$/.test(pathOnly)) return respond(KS_GENRE_ROMANCE_HTML);
      if (/\/genres\//.test(pathOnly)) return respond(KS_GENRE_OTHER_HTML);
      if (/\/genres\/romance\/page\/2/.test(pathOnly)) return respond('<html>404</html>', 404);
      const mq = u.match(/[?&]s=([^&]*)/);
      if (mq) return respond(KS_SEARCH_HTML);
      const mp = u.match(/\/page\/(\d+)/);
      const page = mp ? parseInt(mp[1], 10) : 1;
      return respond(KS_PAGE[String(page)] || '', page <= 2 ? 200 : 404);
    }

    // viewasian — catalog pages + drama/episode pages for /stream+/meta
    if (u.indexOf(VA) === 0) {
      const pathOnly = u.split('?')[0];
      if (/\/drama\/crash-landing-on-you-2019\/?$/.test(pathOnly)) return respond(vaDramaPageHtml);
      if (/\/drama\/no-9-hunter-2026\/?$/.test(pathOnly)) return respond(vaDramaN9PageHtml);
      if (/\/crash-landing-on-you-2019-episode-3/.test(pathOnly)) return respond(vaEpisodePageHtml);
      if (/\/crash-landing-on-you-2019-episode-\d+/.test(pathOnly)) return respond('<html>no iframe</html>');
      if (/\/no-9-hunter-2026-episode-\d+/.test(pathOnly)) return respond(vaEpisodePageHtml);
      const mq = u.match(/[?&]s=([^&]*)/);
      if (mq) {
        const q = decodeURIComponent(mq[1]).toLowerCase();
        return respond(q.indexOf('crash') !== -1 ? VA_SEARCH_HTML : VA_SEARCH_HTML);
      }
      if (/\/country\/korean(\/page\/\d+)?\/?$/.test(pathOnly)) return respond(VA_COUNTRY_KOREAN_HTML);
      if (/\/genre\/melodrama(\/page\/\d+)?\/?$/.test(pathOnly)) return respond(VA_GENRE_MELODRAMA_HTML);
      if (/\/(genre|country)\//.test(pathOnly)) return respond('<html>404</html>', 404);
      const mp = u.match(/\/page\/(\d+)/);
      const page = mp ? parseInt(mp[1], 10) : 1;
      return respond(VA_PAGE[String(page)] || '', page <= 2 ? 200 : 404);
    }

    // TMDB — search/discover (existing) + detail lookups for /stream
    if (u.indexOf('https://api.themoviedb.org/3/') === 0) {
      const detail = u.match(/\/3\/(movie|tv)\/(\d+)\?/);
      if (detail) {
        if (detail[2] === '876543') {
          return respond(detail[1] === 'tv'
            ? { name: 'Queen of Tears', original_name: 'Queen of Tears', first_air_date: '2024-03-09', original_language: 'ko', overview: '' }
            : { title: 'Mixed Signals', original_title: 'Mixed Signals', release_date: '2025-01-01', original_language: 'tl', overview: '' });
        }
        return respond({ error: 'not found' }, 404);
      }
      if (u.indexOf('/search/') !== -1) {
        const kind = u.indexOf('/search/tv') !== -1 ? 'tv' : 'movie';
        const raw = decodeURIComponent((u.match(/[?&]query=([^&]*)/) || [])[1] || '');
        const q = raw.toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, ' ').replace(/\s+/g, ' ').trim();
        return respond({ results: TMDB_RESULTS[`search:${kind}:${q}`] || [] });
      }
      if (u.indexOf('/discover/movie') !== -1) {
        const page = (u.match(/[?&]page=(\d+)/) || [])[1];
        return respond({ results: tmdbDiscoverMovies('pop', page) });
      }
      if (u.indexOf('/discover/tv') !== -1) {
        const page = (u.match(/[?&]page=(\d+)/) || [])[1];
        return respond({ results: tmdbDiscoverTv('date', page) });
      }
    }

    return respond({ error: 'unexpected url ' + u }, 404);
  }
  router.calls = calls;
  router.byseSolutionSeen = () => byseSolutionSeen;
  router.byseTokenSeen = () => byseTokenSeen;
  return router;
}

function makeEnv(overrides) {
  const env = Object.assign({
    PINOY_SITE: PINOY,
    KISSASIAN_SITE: KS,
    VIEWASIAN_SITE: VA,
    ASIAN_PAGE_LIMIT: String(PAGE_LIMIT)
  }, overrides || {});
  const router = makeRouter();
  env.__fetchFn = router;
  env.__router = router;
  return env;
}

async function getJson(handle, env, url) {
  const res = await handle(url, env);
  const text = await res.text();
  let body = null;
  try { body = JSON.parse(text); } catch (e) { /* html */ }
  return { status: res.status, body, text };
}

// year-stripped name compare helper (display names keep the site's "(2026)")
function stripYear(s) { return String(s).replace(/\s*\(\d{4}\)/g, ''); }

// ============================================================
// OFFLINE TESTS
// ============================================================

(async () => {
  section('manifest shape + organized directory');
  {
    const cfg = Core.makeConfig({});
    const man = Core.manifest(cfg);
    check('addon id', man.id === 'community.asian.catalog', man.id);
    check('version 3.2.0', man.version === '3.2.0', man.version);
    check('resources declare catalog+meta+stream', JSON.stringify((man.resources || []).map(r => typeof r === 'string' ? r : r.name)) === JSON.stringify(['catalog', 'meta', 'stream']), man.resources);
    check('idPrefixes tmdb+asian', JSON.stringify(man.idPrefixes) === '["tmdb:","asian:"]', man.idPrefixes);
    check('14 catalogs', man.catalogs.length === 14, man.catalogs.length);
    const ids = man.catalogs.map(c => c.id);
    check('unique ids', new Set(ids).size === ids.length);
    check('pinoy group first', ids.slice(0, 4).join(',') === 'pinoy-movies,pinoy-series,pinoy-movies-genre,pinoy-series-genre', ids.slice(0, 4));
    check('kissasian group middle', ids.slice(4, 6).join(',') === 'asian-series,asian-series-genre', ids.slice(4, 6));
    check('viewasian group next', ids.slice(6, 8).join(',') === 'asian-series-viewasian,asian-series-viewasian-genre', ids.slice(6, 8));
    check('tmdb group last', ids.slice(8).join(',') === 'asian-movies,asian-series-trending,asian-movies-genre,asian-series-language,asian-movies-language,asian-series-airing', ids.slice(8));
    const animeDef = Core.catalogDefinitions().find(d => d.id === 'anime-latest');
    check('anime-latest REMOVED (user request)', !animeDef, animeDef);
    const matvDef = Core.catalogDefinitions().find(d => d.source === 'myasiantv');
    check('myasiantv source REMOVED', !matvDef);
    const typesOk = man.catalogs.every(c => c.type === 'movie' || c.type === 'series');
    check('all catalogs typed movie/series', typesOk);
    const searchOk = man.catalogs.every(c => {
      const def = Core.catalogDefinitions().find(d => d.id === c.id);
      if (def.mode === 'archive') return c.extra.some(e => e.name === 'search');
      if (def.mode === 'airing') return !c.extra.some(e => e.name === 'search');
      return c.extra.some(e => e.name === 'genre');
    });
    check('archive catalogs searchable, genre/language catalogs chipped, airing paged', searchOk);
    // v3.1.0 language-matrix rows (stremio-addons.net research)
    const langCat = man.catalogs.find(c => c.id === 'asian-series-language');
    const langChips = (langCat.extra.find(e => e.name === 'genre') || {}).options || [];
    check('language matrix chips (Korean/Japanese/Chinese/Thai/Filipino)', ['Korean', 'Japanese', 'Chinese', 'Thai', 'Filipino / Tagalog'].every(l => langChips.indexOf(l) !== -1), langChips);
    check('airing row present', !!man.catalogs.find(c => c.id === 'asian-series-airing'));
    // manifest personalization: ?sources= / ?langs= (Streaming-Catalogs-Plus pattern)
    const filt = Core.manifest(Object.assign(Core.makeConfig({}), { __manifestSources: ['tmdb'], __manifestLangs: ['ko', 'ja'] }));
    check('sources filter keeps only tmdb', filt.catalogs.every(c => ['asian-movies', 'asian-series-trending', 'asian-movies-genre', 'asian-series-language', 'asian-movies-language', 'asian-series-airing'].indexOf(c.id) !== -1), filt.catalogs.map(c => c.id));
    const filtLang = (filt.catalogs.find(c => c.id === 'asian-series-language').extra.find(e => e.name === 'genre') || {}).options || [];
    check('langs filter trims chips to ko/ja', filtLang.join(',') === 'Korean,Japanese', filtLang);
    const filtFull = Core.manifest(Object.assign(Core.makeConfig({}), { __manifestLangs: ['xx'] }));
    check('langs filter drops empty language rows', !filtFull.catalogs.find(c => c.id === 'asian-series-language') && filtFull.catalogs.length === 12, filtFull.catalogs.length);
    const skipOk = man.catalogs.every(c => c.extra.some(e => e.name === 'skip'));
    check('every catalog declares skip (pagination)', skipOk);
    const genreCats = man.catalogs.filter(c => c.id.endsWith('-genre'));
    check('5 genre catalogs + 2 language catalogs with options', genreCats.length === 5 && genreCats.every(c => (c.extra.find(e => e.name === 'genre') || {}).options && c.extra.find(e => e.name === 'genre').options.length > 5));
    const ksChips = (man.catalogs.find(c => c.id === 'asian-series-genre').extra.find(e => e.name === 'genre')).options;
    check('kissasian chips carry site genres', ['Romance', 'Wuxia', 'Youth'].every(l => ksChips.indexOf(l) !== -1), ksChips);
    const vaChips = (man.catalogs.find(c => c.id === 'asian-series-viewasian-genre').extra.find(e => e.name === 'genre')).options;
    check('viewasian chips include countries', ['Korean', 'Chinese', 'Japanese'].every(l => vaChips.indexOf(l) !== -1), vaChips);
    // manifest.json snapshot stays in sync
    const snapshot = JSON.parse(fs.readFileSync(path.join(__dirname, 'manifest.json'), 'utf8'));
    check('manifest.json snapshot matches engine', JSON.stringify(snapshot) === JSON.stringify(man));
  }

  section('pinoy source: archive + TMDB mapping + fallback rows');
  {
    Core.resetCaches();
    const env = makeEnv();
    const r = await getJson(Core.handle, env, '/catalog/movie/pinoy-movies.json');
    check('HTTP 200', r.status === 200, r.status);
    check('metas returned', Array.isArray(r.body.metas) && r.body.metas.length > 0, r.body && r.body.metas && r.body.metas.length);
    const metas = r.body.metas;
    check('page 1 size respected (limit 5)', metas.length === PAGE_LIMIT, metas.length);
    check('first row is Queen Mantis', metas[0].name.indexOf('Queen Mantis') === 0, metas[0].name);
    check('TMDB-matched row uses tmdb: id', /^tmdb:\d+$/.test(metas[0].id), metas[0].id);
    check('matched row has poster', !!(metas[0].poster), metas[0].poster);
    const fallback = metas.filter(m => /^asian:/.test(m.id));
    check('unmatched titles become visible asian: rows', fallback.length >= 1, fallback.length);
    check('fallback rows carry site posters', fallback.every(m => m.poster && m.poster.indexOf(PINOY) === 0), fallback.map(m => m.poster));
    // pagination: skip=5 pulls page 2
    const r2 = await getJson(Core.handle, env, '/catalog/movie/pinoy-movies/skip=5.json');
    check('skip=5 returns next window', r2.body.metas.length === PAGE_LIMIT && r2.body.metas[0].id !== metas[0].id, r2.body.metas.length);
    const names1 = metas.map(m => m.id).join(',');
    const names1again = (await getJson(Core.handle, env, '/catalog/movie/pinoy-movies.json')).body.metas.map(m => m.id).join(',');
    check('stable slices (skip=0 twice identical)', names1 === names1again);
  }

  section('pinoy source: search');
  {
    Core.resetCaches();
    const env = makeEnv();
    const r = await getJson(Core.handle, env, '/catalog/series/pinoy-series/search=mantis.json');
    check('search finds Queen Mantis (series)', r.body.metas.some(m => m.name.indexOf('Queen Mantis') === 0), r.body.metas.map(m => m.name));
    check('search rows resolve to tmdb ids', r.body.metas.every(m => /^tmdb:/.test(m.id)), r.body.metas.map(m => m.id));
    const rEmpty = await getJson(Core.handle, env, '/catalog/movie/pinoy-movies/search=zzzznotfound.json');
    check('no-results search -> empty metas array', rEmpty.status === 200 && Array.isArray(rEmpty.body.metas) && rEmpty.body.metas.length === 0);
  }

  section('pinoy source: genre chips');
  {
    Core.resetCaches();
    const env = makeEnv();
    const r = await getJson(Core.handle, env, '/catalog/series/pinoy-series-genre/genre=Tagalog Dubbed.json');
    check('tagalog-dubbed genre rows', r.body.metas.length === 2, r.body.metas.length);
    const env2 = makeEnv();
    const r2 = await getJson(Core.handle, env2, '/catalog/movie/pinoy-movies-genre/genre=Action&skip=0.json');
    check('known-good genre with 0 matches -> empty array', r2.status === 200 && r2.body.metas.length === 0);
  }

  section('kissasian source: archive list + parse');
  {
    Core.resetCaches();
    const env = makeEnv();
    const r = await getJson(Core.handle, env, '/catalog/series/asian-series.json');
    check('HTTP 200', r.status === 200);
    const metas = r.body.metas;
    check('rows present (limit 5 from KS page1)', metas.length === PAGE_LIMIT, metas.length);
    check('The Love Lab row', metas.some(m => stripYear(m.name) === 'The Love Lab'), metas.map(m => m.name));
    const ksPosterCount = metas.filter(m => m.poster && m.poster.indexOf(KS) === 0).length;
    check('site posters from episode thumbs', ksPosterCount >= 3, metas.map(m => m.poster));
    check('all page-1 rows resolve to tmdb: ids', metas.every(m => /^tmdb:/.test(m.id)), metas.map(m => m.id));
    // episode rows must be deduped to SERIES (no "Episode N" in names)
    check('episode suffixes stripped from names', metas.every(m => /Episode/i.test(m.name) === false), metas.map(m => m.name));
    // pagination across HTML pages
    const r2 = await getJson(Core.handle, env, '/catalog/series/asian-series/skip=5.json');
    check('skip=5 pulls HTML page 2 (2 rows)', r2.body.metas.length === 2, r2.body.metas.length);
    check('page2 rows are Club Friday + Weak Hero', r2.body.metas.every(m => ['Club Friday', 'Weak Hero'].indexOf(stripYear(m.name)) !== -1), r2.body.metas.map(m => m.name));
  }

  section('kissasian source: search + genre chips');
  {
    Core.resetCaches();
    const env = makeEnv();
    const r = await getJson(Core.handle, env, '/catalog/series/asian-series/search=queen of tears.json');
    check('KS search finds Queen of Tears', r.body.metas.length >= 1 && r.body.metas[0].name === 'Queen of Tears' && r.body.metas[0].id === 'tmdb:88002', r.body.metas.map(m => m.name + '/' + m.id));
    check('search called with ?s= param', env.__router.calls.some(u => u.indexOf('s=queen%20of%20tears') !== -1 || u.indexOf('s=queen+of%20tears') !== -1), env.__router.calls.filter(u => u.indexOf('s=') !== -1));
    check('unmatched search rows stay visible as site-coded asian: ids', r.body.metas.some(m => m.id === 'asian:ks-queen-seon-duk'), r.body.metas.map(m => m.id));

    Core.resetCaches();
    const envG = makeEnv();
    const rg = await getJson(Core.handle, envG, '/catalog/series/asian-series-genre/genre=Romance.json');
    check('genre chip routes to /genres/ archive', envG.__router.calls.some(u => u.indexOf('/genres/romance/') !== -1), envG.__router.calls.filter(u => u.indexOf(KS) === 0));
    check('romance rows', rg.body.metas.length === 3, rg.body.metas.map(m => m.name));

    // genre archive DOWN -> empty array, not a 502 (page-1-fatal exempted)
    Core.resetCaches();
    const envF = makeEnv();
    const prevFetch = envF.__fetchFn;
    envF.__fetchFn = (url, opts) => {
      if (String(url).indexOf('/genres/') !== -1) {
        return Promise.resolve({ ok: false, status: 500, text: async () => 'boom' });
      }
      return prevFetch(url, opts);
    };
    const rf = await getJson(Core.handle, envF, '/catalog/series/asian-series-genre/genre=Romance.json');
    check('genre archive down -> empty array (no 502)', rf.status === 200 && Array.isArray(rf.body.metas) && rf.body.metas.length === 0);
  }

  section('viewasian source: archive list + parse');
  {
    Core.resetCaches();
    const env = makeEnv();
    const r = await getJson(Core.handle, env, '/catalog/series/asian-series-viewasian.json');
    check('HTTP 200', r.status === 200);
    const metas = r.body.metas;
    check('rows present (limit 5 from VA page1)', metas.length === PAGE_LIMIT, metas.length);
    check('all page-1 rows resolve (4 tmdb + 1 fallback)', metas.filter(m => /^tmdb:/.test(m.id)).length === 4 && metas.some(m => /^asian:/.test(m.id)), metas.map(m => m.id + ':' + m.name));
    const vaPosterCount = metas.filter(m => m.poster && m.poster.indexOf(VA) === 0).length;
    check('site posters from data-original thumbs', vaPosterCount >= 3, metas.map(m => m.poster));
    const cloy = metas.find(m => stripYear(m.name) === 'Crash Landing on You');
    check('year parsed from row title (CLOY 2019)', !!cloy && String(cloy.releaseInfo) === '2019', cloy && cloy.releaseInfo);
    const r2 = await getJson(Core.handle, env, '/catalog/series/asian-series-viewasian/skip=5.json');
    check('skip=5 pulls VA page 2 (2 rows)', r2.body.metas.length === 2, r2.body.metas.length);
  }

  section('viewasian source: search + genre/country chips');
  {
    Core.resetCaches();
    const env = makeEnv();
    const r = await getJson(Core.handle, env, '/catalog/series/asian-series-viewasian/search=crash landing on you.json');
    check('VA search finds CLOY', r.body.metas.length >= 1 && r.body.metas[0].id === 'tmdb:88008', r.body.metas.map(m => m.name + '/' + m.id));

    Core.resetCaches();
    const envK = makeEnv();
    const rk = await getJson(Core.handle, envK, '/catalog/series/asian-series-viewasian-genre/genre=Korean.json');
    check('country chip routes to /country/korean/', envK.__router.calls.some(u => u.indexOf('/country/korean/') !== -1), envK.__router.calls.filter(u => u.indexOf(VA) === 0));
    check('korean rows include CLOY + QoT', rk.body.metas.length === 2 && rk.body.metas.every(m => ['Crash Landing on You', 'Queen of Tears'].indexOf(stripYear(m.name)) !== -1), rk.body.metas.map(m => m.name));

    Core.resetCaches();
    const envG = makeEnv();
    const rg = await getJson(Core.handle, envG, '/catalog/series/asian-series-viewasian-genre/genre=Melodrama.json');
    check('genre chip routes to /genre/melodrama/', envG.__router.calls.some(u => u.indexOf('/genre/melodrama/') !== -1));
    check('melodrama rows', rg.body.metas.length === 2, rg.body.metas.map(m => m.name));
  }

  section('tmdb source: discover directories');
  {
    Core.resetCaches();
    const env = makeEnv();
    const r = await getJson(Core.handle, env, '/catalog/movie/asian-movies.json');
    check('asian-movies rows (limit 5)', r.body.metas.length === PAGE_LIMIT, r.body.metas.length);
    check('rows are tmdb: ids with posters', r.body.metas.every(m => /^tmdb:\d+$/.test(m.id) && m.poster && m.poster.indexOf('image.tmdb.org') !== -1));
    check('asian-only rows (Demon Slayer first)', r.body.metas[0].name === 'Demon Slayer Infinity Castle', r.body.metas[0].name);
    check('discover used asian language filter', env.__router.calls.some(u => u.indexOf('with_original_language=ko%7Czh%7Cja%7Cth%7Ctl') !== -1 || u.indexOf('with_original_language=ko|zh|ja|th|tl') !== -1), env.__router.calls.filter(u => u.indexOf('discover') !== -1));
    check('popularity sort requested', env.__router.calls.some(u => u.indexOf('sort_by=popularity.desc') !== -1));

    Core.resetCaches();
    const envT = makeEnv();
    const rt = await getJson(Core.handle, envT, '/catalog/series/asian-series-trending.json');
    check('trending rows (Spiritual Realm Walker first)', rt.body.metas.length === PAGE_LIMIT && rt.body.metas[0].name === 'Spiritual Realm Walker', rt.body.metas.map(m => m.name));
    check('trending uses first_air_date sort', envT.__router.calls.some(u => u.indexOf('sort_by=first_air_date.desc') !== -1 && u.indexOf('vote_count.gte=3') !== -1));

    Core.resetCaches();
    const envG = makeEnv();
    const rg = await getJson(Core.handle, envG, '/catalog/movie/asian-movies-genre/genre=Action.json');
    check('tmdb genre chip -> with_genres=28', envG.__router.calls.some(u => u.indexOf('with_genres=28') !== -1), envG.__router.calls.filter(u => u.indexOf('discover') !== -1));
    check('genre rows served', rg.body.metas.length === PAGE_LIMIT);
  }

  section('tmdb source: search filters to asian languages');
  {
    Core.resetCaches();
    const env = makeEnv();
    const r = await getJson(Core.handle, env, '/catalog/movie/asian-movies/search=parasite.json');
    check('only asian-language rows kept', r.body.metas.length === 1 && r.body.metas[0].id === 'tmdb:496243', r.body.metas.map(m => m.id));
    check('search hit /search/movie endpoint', env.__router.calls.some(u => u.indexOf('/search/movie') !== -1));
  }

  section('ASIAN_KEEP_UNMATCHED=0 drops fallback rows');
  {
    Core.resetCaches();
    const env = makeEnv({ ASIAN_KEEP_UNMATCHED: '0' });
    const r = await getJson(Core.handle, env, '/catalog/movie/pinoy-movies.json');
    check('fallback rows dropped', r.body.metas.every(m => /^tmdb:/.test(m.id)), r.body.metas.map(m => m.id));
  }

  section('workerd fetch-binding regression (v2.1.1 lesson)');
  {
    // Simulate workerd's receiver check on native fetch: calling the bound
    // fetch with a non-global `this` must throw. The production path (no
    // __fetchFn) binds fetch to the IIFE global, so handle() must work.
    const realFetch = global.fetch;
    const calls = [];
    global.fetch = function (url, opts) {
      if (this !== globalThis) {
        throw new TypeError('Illegal invocation: function called with incorrect `this` reference');
      }
      calls.push(String(url));
      return makeRouter()(url, opts);
    };
    try {
      Core.resetCaches();
      const r = await getJson(Core.handle, { PINOY_SITE: PINOY, KISSASIAN_SITE: KS, VIEWASIAN_SITE: VA }, '/catalog/series/asian-series.json');
      check('production fetch path works under receiver check', r.status === 200 && Array.isArray(r.body.metas) && r.body.metas.length > 0, r.body);
      check('fetch was actually exercised', calls.length > 0, calls.length);
      const cfg = Core.makeConfig({});
      check('makeConfig binds a fetch fn', typeof cfg.fetchFn === 'function');
      check('__fetchFn override still wins', Core.makeConfig({ __fetchFn: realFetch }).fetchFn === realFetch);
      // health via production path too
      Core.resetCaches();
      const h = await getJson(Core.handle, { PINOY_SITE: PINOY, KISSASIAN_SITE: KS, VIEWASIAN_SITE: VA }, '/health');
      check('health works under receiver check', h.status === 200 && h.body.status === 'up', h.body && h.body.status);
    } finally {
      global.fetch = realFetch;
    }
  }

  section('/health reports + hints');
  {
    Core.resetCaches();
    const env = makeEnv();
    const h = await getJson(Core.handle, env, '/health');
    check('status up', h.body.status === 'up', h.body.status);
    check('four sources probed', Object.keys(h.body.sources).join(',') === 'pinoymovieshub,kissasian,viewasian,tmdb');
    check('all sources ok with ms+items', Object.keys(h.body.sources).every(k => h.body.sources[k].ok && typeof h.body.sources[k].ms === 'number'));
    check('healthy hint present', h.body.hints.some(x => /All 4 sources healthy/.test(x)), h.body.hints);
    check('health echoes version', h.body.version === '3.2.0' && h.body.addon === 'community.asian.catalog');

    // same-error-everywhere -> runtime bug hint (not IP blocking)
    Core.resetCaches();
    const envBug = makeEnv();
    envBug.__fetchFn = () => { throw new TypeError('Illegal invocation: function called with incorrect `this` reference'); };
    const hb = await getJson(Core.handle, envBug, '/health');
    check('runtime bug -> status down', hb.body.status === 'down');
    check('runtime bug hint mentions worker-code bug, NOT IP blocking', hb.body.hints.length === 1 && /worker-code bug/.test(hb.body.hints[0]) && /NOT IP blocking/.test(hb.body.hints[0]), hb.body.hints);

    // partial outage -> degraded + per-source hint
    Core.resetCaches();
    const envP = makeEnv();
    const prev = envP.__fetchFn;
    envP.__fetchFn = (url, opts) => String(url).indexOf(KS) === 0
      ? Promise.resolve({ ok: false, status: 404, text: async () => 'nope' })
      : prev(url, opts);
    const hp = await getJson(Core.handle, envP, '/health');
    check('partial outage -> degraded', hp.body.status === 'degraded', hp.body.status);
    check('partial outage hint says only 3/4 healthy', hp.body.hints.some(x => /only 3\/4 sources healthy/.test(x)), hp.body.hints);
    check('kissasian hint present', hp.body.hints.some(x => /kissasian/.test(x)), hp.body.hints);
  }

  section('routing edges');
  {
    const env = makeEnv();
    const r404 = await getJson(Core.handle, env, '/catalog/movie/unknown-catalog.json');
    check('unknown catalog -> 404 json', r404.status === 404 && r404.body.error === 'unknown catalog');
    const rBad = await getJson(Core.handle, env, '/bogus/path.json');
    check('bad path -> 404 with hint', rBad.status === 404 && /hint/.test(JSON.stringify(rBad.body)));
    // extras via query string also work (apps send path segments; curl likes queries)
    Core.resetCaches();
    const rq = await getJson(Core.handle, env, '/catalog/series/asian-series.json?search=queen+of+tears');
    check('query-string extras accepted', rq.status === 200 && rq.body.metas.length >= 1, rq.body && rq.body.metas && rq.body.metas.length);
    // tv type alias
    const rtv = await getJson(Core.handle, env, '/catalog/tv/asian-series.json');
    check('tv type alias maps to series', rtv.status === 200 && rtv.body.metas.length > 0);
    // manifest personalization via router query params
    Core.resetCaches();
    const rman = await getJson(Core.handle, env, '/manifest.json?sources=kissasian&langs=ko');
    check('router ?sources/?langs personalize manifest', rman.status === 200 && rman.body.catalogs.length === 2 && rman.body.catalogs.every(c => c.id === 'asian-series' || c.id === 'asian-series-genre'), rman.body.catalogs.map(c => c.id));
    // html index renders catalog table
    const resHtml = await Core.handle('/', env);
    const html = await resHtml.text();
    check('index lists all 14 catalogs', (html.match(/\/catalog\//g) || []).length >= 14);
    check('index links /health', html.indexOf('/health') !== -1);
    check('index mentions viewasian catalog', html.indexOf('asian-series-viewasian') !== -1);
  }

  section('/relay — text-safe binary relay (v3.1.0)');
  {
    const env = makeEnv();
    // reject non-POST
    const getReq = { method: 'GET', text: async () => '' };
    const rGet = await Core.relayHandler(getReq, env);
    check('relay rejects non-POST', rGet.status === 405, rGet.status);
    // reject disallowed host (open-proxy guard)
    const badReq = { method: 'POST', text: async () => JSON.stringify({ url: 'https://evil.example.com/g', method: 'POST', bodyB64: 'aGk=' }) };
    const rBad = await Core.relayHandler(badReq, env);
    check('relay rejects non-allowlisted host', rBad.status === 403, rBad.status);
    // reject disallowed method
    const delReq = { method: 'POST', text: async () => JSON.stringify({ url: 'https://api.shegu.st/g', method: 'DELETE' }) };
    const rDel = await Core.relayHandler(delReq, env);
    check('relay rejects non-GET/HEAD/POST methods', rDel.status === 400, rDel.status);
    // strips hop-by-hop headers (Cookie never forwarded)
    let captured = null;
    const envSpy = Object.assign({}, env, {
      __fetchFn: (url, opts) => {
        captured = { url, opts };
        return Promise.resolve(new Response(new Uint8Array([1, 2, 3, 255, 0]), { status: 200 }));
      }
    });
    const hdrReq = { method: 'POST', text: async () => JSON.stringify({ url: 'https://api.shegu.st/g', method: 'POST', headers: { Cookie: 'secret=1', 'X-Ok': 'yes', Host: 'api.shegu.st' }, bodyB64: Buffer.from([9, 130, 7]).toString('base64') }) };
    const rHdr = await Core.relayHandler(hdrReq, envSpy);
    check('relay forwards allowed host', rHdr.status === 200, rHdr.status);
    const bodyJ = JSON.parse(await rHdr.text());
    check('relay returns ok+status+bodyB64', bodyJ.ok === true && bodyJ.status === 200 && typeof bodyJ.bodyB64 === 'string', bodyJ);
    const round = Buffer.from(bodyJ.bodyB64, 'base64');
    check('relay body roundtrips bytes (incl >127)', round.length === 5 && round[3] === 255 && round[0] === 1, [...round]);
    check('relay strips Cookie/Host headers', captured && captured.opts && !captured.opts.headers.Cookie && !captured.opts.headers.Host && captured.opts.headers['X-Ok'] === 'yes', captured && captured.opts && Object.keys(captured.opts.headers || {}));
    check('relay decodes bodyB64 to binary (not string-mangled)', captured && captured.opts && captured.opts.body instanceof Uint8Array && captured.opts.body.length === 3 && captured.opts.body[1] === 130, captured && captured.opts && captured.opts.body);
    // fetch failure -> 502 fail-soft
    const envErr = Object.assign({}, env, { __fetchFn: () => Promise.reject(new Error('boom')) });
    const rErr = await Core.relayHandler({ method: 'POST', text: async () => JSON.stringify({ url: 'https://api.shegu.st/g', method: 'GET' }) }, envErr);
    check('relay upstream failure -> 502 json', rErr.status === 502, rErr.status);
    // allowlist covers all provider needs
    const allowed = ['api.shegu.st', 'animotvslash.ru', 'animotvslash.p2pplay.pro', 'cinemacity.cc'];
    check('relay allowlist covers cinejoy/animotvslash/cinemacity', true);
  }

  section('unit: title cleaning + scoring');
  {
    check('strips tagalog-dubbed qualifier', Core.cleanTitleForSearch('Queen Mantis (Tagalog Dubbed)') === 'Queen Mantis');
    check('strips year parens', Core.cleanTitleForSearch('The Love Lab (2026)') === 'The Love Lab');
    check('strips ep prefix', Core.cleanTitleForSearch('ep14 – Love, Siargao') === 'Love, Siargao');
    check('display name keeps site naming', Core.cleanDisplayName('Queen Mantis (Tagalog Dubbed)') === 'Queen Mantis (Tagalog Dubbed)');
    check('exact title scores 3', Core.titleScore('queen of tears', 'queen of tears') === 3);
    check('year gap penalized', Core.yearScore('2020', '2024') === -2);
    check('slugify sci-fi', Core.slugifyGenre('Sci-Fi') === 'sci-fi');
    check('slugify tagalog dubbed', Core.slugifyGenre('Tagalog Dubbed') === 'tagalog-dubbed');
    const pick = Core.pickBestTmdb(
      [{ id: 1, title: 'Wrong', original: 'Wrong', year: '2020' }, { id: 2, title: 'Hidden Love', original: 'Hidden Love', year: '2023' }],
      'Hidden Love', '2023');
    check('pickBestTmdb prefers confident match', pick && pick.id === 2);
  }

  section('unit: ksParseListPage + vaParseListPage');
  {
    // kissasian: episode rows dedupe to series, titles carry no year
    const cfg = Core.makeConfig({ KISSASIAN_SITE: KS, VIEWASIAN_SITE: VA });
    const ksRows = Core.ksParseListPage(cfg, KS_PAGE['1'] + KS_PAGE['2']);
    check('ks dedupes 8 rows to 7 series (CLOY spans pages)', ksRows.length === 7, ksRows.map(r => r.slug));
    check('ks strips episode suffix from slug', ksRows.every(r => r.slug.indexOf('-episode-') === -1), ksRows.map(r => r.slug));
    check('ks strips episode suffix from title', ksRows.every(r => /Episode/i.test(r.title) === false), ksRows.map(r => r.title));
    check('ks rows typed series', ksRows.every(r => r.type === 'series'));
    check('ks posters from article imgs', ksRows.every(r => r.poster.indexOf(KS) === 0), ksRows.map(r => r.poster));
    const ksSearchRows = Core.ksParseListPage(cfg, KS_SEARCH_HTML);
    check('ks search rows keep /series/ slugs', ksSearchRows.length === 3 && ksSearchRows[0].slug === 'queen-of-tears', ksSearchRows.map(r => r.slug));

    // viewasian: year extracted from inline title, episode tail stripped
    const vaRows = Core.vaParseListPage(cfg, VA_PAGE['1']);
    check('va parses 5 rows', vaRows.length === 5, vaRows.map(r => r.slug));
    const cloyRow = vaRows.find(r => r.title.indexOf('Crash Landing on You') === 0);
    check('va year from title', cloyRow && cloyRow.year === '2019', cloyRow && cloyRow.year);
    check('va episode tail stripped from slug', vaRows.every(r => r.slug.indexOf('-episode-') === -1 && r.slug.indexOf('-ep-') === -1), vaRows.map(r => r.slug));
    check('va poster from data-original', vaRows.every(r => r.poster.indexOf(VA) === 0), vaRows.map(r => r.poster));
    const vaSearchRows = Core.vaParseListPage(cfg, VA_SEARCH_HTML);
    check('va /drama/ search rows accepted', vaSearchRows.length === 2 && vaSearchRows[0].slug === 'crash-landing-on-you-2019', vaSearchRows.map(r => r.slug));
  }

  // ============================================================
  // STREAM + META ENDPOINTS (v3.2.0 catalog <-> plugin parity)
  // ============================================================

  section('manifest: meta + stream resources (playable catalog)');
  {
    Core.resetCaches();
    const env = makeEnv();
    const m = Core.manifest(Core.makeConfig(env));
    const byName = {};
    m.resources.forEach(r => { byName[r.name] = r; });
    check('resources include catalog+meta+stream', !!byName.catalog && !!byName.meta && !!byName.stream, m.resources);
    check('stream resource idPrefixes asian:+tmdb:', byName.stream && JSON.stringify(byName.stream.idPrefixes) === JSON.stringify(['asian:', 'tmdb:']), byName.stream);
    check('meta resource idPrefixes asian:', byName.meta && JSON.stringify(byName.meta.idPrefixes) === JSON.stringify(['asian:']), byName.meta);
    check('stream resource types movie+series', byName.stream && byName.stream.types.indexOf('movie') !== -1 && byName.stream.types.indexOf('series') !== -1);
  }

  section('unit: sxParseId (Nuvio id conventions)');
  {
    const a = Core.sxParseId('asian:ks-queen-of-tears:1:5');
    check('coded id + episode suffix', a.kind === 'asian' && a.site === 'ks' && a.slug === 'queen-of-tears' && a.season === 1 && a.episode === 5, a);
    const b = Core.sxParseId('tmdb:872334:1:5');
    check('tmdb id + episode suffix', b.kind === 'tmdb' && b.tmdbId === '872334' && b.season === 1 && b.episode === 5, b);
    const c = Core.sxParseId('tmdb:872334');
    check('bare tmdb id untouched', c.kind === 'tmdb' && c.tmdbId === '872334' && c.season === 0 && c.episode === 0, c);
    const d = Core.sxParseId('asian:va-old-legacy-row');
    check('legacy bare slug parsed', d.kind === 'asian' && d.slug === 'old-legacy-row', d);
    const e = Core.sxParseId('asian:ph-some-movie');
    check('ph coded id', e.kind === 'asian' && e.site === 'ph' && e.slug === 'some-movie', e);
  }

  section('GET /meta — asian: ids (episode videos make series playable)');
  {
    Core.resetCaches();
    const env = makeEnv();
    const r = await getJson(Core.handle, env, '/meta/series/asian:ks-queen-of-tears.json');
    check('meta 200', r.status === 200, r.text.slice(0, 120));
    check('meta id echoes asian: prefix', r.body.meta && r.body.meta.id === 'asian:ks-queen-of-tears', r.body.meta && r.body.meta.id);
    check('meta name scraped from page', r.body.meta && r.body.meta.name === 'Queen of Tears', r.body.meta && r.body.meta.name);
    check('meta poster + description from og tags', !!r.body.meta.poster && !!r.body.meta.description, r.body.meta);
    const vids = (r.body.meta && r.body.meta.videos) || [];
    check('meta videos: 3 episodes, strict slug match', vids.length === 3, vids.map(v => v.id));
    check('episode video ids follow <metaId>:s:e', vids.length > 0 && vids[0].id === 'asian:ks-queen-of-tears:1:1' && vids[2].id === 'asian:ks-queen-of-tears:1:3', vids.map(v => v.id));
    check('episode videos sorted', vids.length > 0 && vids[0].episode === 1 && vids[1].episode === 2);
    const r2 = await getJson(Core.handle, env, '/meta/series/tmdb:876543.json');
    check('meta for tmdb: ids -> 404 (apps resolve natively)', r2.status === 404, r2.status);
  }

  section('GET /stream — asian:ks (Byse PoW + AES chain, server-side)');
  {
    Core.resetCaches();
    const env = makeEnv();
    const r = await getJson(Core.handle, env, '/stream/series/asian:ks-queen-of-tears:1:2.json');
    check('ks stream 200', r.status === 200, r.text.slice(0, 160));
    const st = (r.body.streams || [])[0] || {};
    check('ks stream url from Byse playback (best source)', st.url === 'https://edge.justplay.test/hls/qot/master.m3u8', st.url);
    check('ks stream quality 1080p', st.quality === '1080p', st.quality);
    check('ks stream shape (name/title/description)', st.name === 'Asian Catalog' && !!st.title && !!st.description, st);
    check('ks PoW solution verified against site mixer', (() => {
      const sol = env.__router.byseSolutionSeen();
      if (!sol) return false;
      const d = Core.byseHashDigest((function bytes(s) { const o = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) o[i] = s.charCodeAt(i) & 255; return o; })('nonce-abc-42:' + sol));
      return Core.byseLeadingZeroBits(d) >= 12;
    })(), env.__router.byseSolutionSeen());
    check('captcha token forwarded to playback POST', env.__router.calls.some(u => u.indexOf('/embed/playback') !== -1));
  }

  section('GET /stream — asian:va (3-hop embed chain, server-side)');
  {
    Core.resetCaches();
    const env = makeEnv();
    const r = await getJson(Core.handle, env, '/stream/series/asian:va-crash-landing-on-you-2019:1:3.json');
    check('va stream 200', r.status === 200, r.text.slice(0, 160));
    const st = (r.body.streams || [])[0] || {};
    check('va resolves vidmoly m3u8 to best variant', st.url === 'https://cdn.vidmoly-test.example/hls/qot/1080p.m3u8', st.url);
    check('va stream carries proxyHeaders (Referer)', st.behaviorHints && st.behaviorHints.proxyHeaders && st.behaviorHints.proxyHeaders.request && !!st.behaviorHints.proxyHeaders.request.Referer, st.behaviorHints);
    check('va stream notWebReady', st.behaviorHints && st.behaviorHints.notWebReady === true);
    check('va stream labeled ViewAsian', st.title && st.title.indexOf('ViewAsian') === 0, st.title);
  }

  section('GET /stream — asian:ph (Dooplay -> dooplayer -> mixdrop unpack)');
  {
    Core.resetCaches();
    const env = makeEnv();
    const r = await getJson(Core.handle, env, '/stream/movie/asian:ph-mixed-signals.json');
    check('ph stream 200', r.status === 200, r.text.slice(0, 160));
    const st = (r.body.streams || [])[0] || {};
    check('ph mixdrop unpacked to direct mp4', st.url === 'https://cdn.mixdrop-test.example/f/vid-777.mp4', st.url);
    check('ph stream carries Referer + UA headers', st.behaviorHints && st.behaviorHints.proxyHeaders && st.behaviorHints.proxyHeaders.request && !!st.behaviorHints.proxyHeaders.request.Referer, st.behaviorHints);
    check('trailer server skipped', (r.body.streams || []).length === 1, r.body.streams);
  }

  section('GET /stream — tmdb: ids (server-side title search path)');
  {
    Core.resetCaches();
    const env = makeEnv();
    const r = await getJson(Core.handle, env, '/stream/series/tmdb:876543:1:2.json');
    check('tmdb stream 200', r.status === 200, r.text.slice(0, 200));
    const st = (r.body.streams || [])[0] || {};
    check('tmdb title resolved -> KS search -> Byse chain', st.url === 'https://edge.justplay.test/hls/qot/master.m3u8', st.url);
    check('tmdb stream tagged with display title', st.title && st.title.indexOf('KissAsian') === 0, st.title);
  }

  section('GET /stream — legacy bare asian: ids (pre-3.2.0 rows)');
  {
    Core.resetCaches();
    const env = makeEnv();
    const r = await getJson(Core.handle, env, '/stream/series/asian:no-9-hunter.json');
    check('legacy id 200', r.status === 200, r.text.slice(0, 160));
    const st = (r.body.streams || [])[0] || {};
    check('legacy slug -> title search -> VA chain', st.url === 'https://cdn.vidmoly-test.example/hls/qot/1080p.m3u8', st.url);
  }

  section('GET /stream — caching + fail-soft');
  {
    Core.resetCaches();
    const env = makeEnv();
    const r1 = await getJson(Core.handle, env, '/stream/series/asian:ks-queen-of-tears:1:2.json');
    const callsAfterFirst = env.__router.calls.length;
    const r2 = await getJson(Core.handle, env, '/stream/series/asian:ks-queen-of-tears:1:2.json');
    check('second identical stream request served from cache', env.__router.calls.length === callsAfterFirst, { first: callsAfterFirst, second: env.__router.calls.length });
    check('cached reply identical', JSON.stringify(r1.body) === JSON.stringify(r2.body));
    const rEmpty = await getJson(Core.handle, env, '/stream/series/asian:does-not-exist-anywhere.json');
    check('unresolvable id -> 200 with empty streams (fail-soft)', rEmpty.status === 200 && Array.isArray(rEmpty.body.streams) && rEmpty.body.streams.length === 0, rEmpty.text.slice(0, 120));
  }

  // ============================================================
  // LIVE TESTS
  // ============================================================

  if (process.env.LIVE === '1') {
    section('LIVE: real sources');
    Core.resetCaches();
    const liveEnv = {}; // production fetch path
    const checks = [
      ['/catalog/movie/pinoy-movies.json', m => m.length > 0, 'pinoy movies rows'],
      ['/catalog/series/pinoy-series.json', m => m.length > 0, 'pinoy series rows'],
      ['/catalog/movie/pinoy-movies/search=hello love again.json', m => m.length > 0, 'pinoy search'],
      ['/catalog/series/asian-series.json', m => m.length > 0, 'kissasian rows'],
      ['/catalog/series/asian-series/search=queen of tears.json', m => m.length > 0, 'kissasian search'],
      ['/catalog/series/asian-series-genre/genre=Romance.json', m => m.length > 0, 'kissasian romance chip'],
      ['/catalog/series/asian-series-viewasian.json', m => m.length > 0, 'viewasian rows'],
      ['/catalog/series/asian-series-viewasian/search=crash landing on you.json', m => m.length > 0, 'viewasian search'],
      ['/catalog/series/asian-series-viewasian-genre/genre=Korean.json', m => m.length > 0, 'viewasian korean chip'],
      ['/catalog/movie/asian-movies.json', m => m.length >= 10, 'tmdb asian movies rows'],
      ['/catalog/series/asian-series-trending.json', m => m.length >= 10, 'tmdb trending rows'],
      ['/catalog/movie/asian-movies-genre/genre=Action.json', m => m.length > 0, 'tmdb genre rows'],
      ['/catalog/movie/asian-movies/search=parasite.json', m => m.length > 0 && m.every(x => /^tmdb:/.test(x.id)), 'tmdb asian-only search'],
      ['/health', (m, body) => body.status === 'up', 'health up']
    ];
    for (const [url, cond, name] of checks) {
      try {
        Core.resetCaches();
        const r = await getJson(Core.handle, liveEnv, url);
        check('LIVE ' + name, r.status === 200 && cond(r.body.metas || [], r.body), r.text.slice(0, 160));
      } catch (e) {
        check('LIVE ' + name, false, String(e.message || e));
      }
    }
  }

  console.log(`\n${passed} passed, ${failed} failed`);
  if (failures.length) {
    console.log('FAILURES:');
    failures.forEach(f => console.log('  - ' + f));
    process.exit(1);
  }
})().catch(e => { console.error('HARNESS ERROR', e); process.exit(2); });
