#!/usr/bin/env node
/**
 * Asian Catalog — addon test harness
 *
 *   node test-catalog.js            # offline tests (mock network)
 *   LIVE=1 node test-catalog.js     # + live tests against the real site/TMDB
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
// MOCK NETWORK
// ============================================================

const SITE = 'https://test-site.local';
const MATV_SITE = 'https://matv.local';
const DC_SITE = 'https://dc.local';

const MOCK_TMDB = {
  'queen mantis': { id: 99901, title: 'Queen Mantis', year: '2025' },
  'narco saints': { id: 99902, title: 'Narco-Saints', year: '2022' },
  'love ngo': { id: 99903, title: 'Love, Ngo', year: '2026' },
  '72 hours': { id: 99904, title: '72 Hours', year: '2025' },
  'co x love': { id: 99905, title: 'Co x Love (Co-Love)', year: '2025' },
  'love siargao': { id: 99906, title: 'Love, Siargao', year: '2026' },
  'the chambermaids daughter': { id: 99907, title: 'The Chambermaid\u2019s Daughter', year: '2026' },
  'cobra kai': { id: 99908, title: 'Cobra Kai', year: '2018' },
  'crash landing on you': { id: 99910, title: 'Crash Landing on You', year: '2019' },
  'vincenzo': { id: 99911, title: 'Vincenzo', year: '2021' },
  'guardian the lonely and great god': { id: 99912, title: 'Guardian: The Lonely and Great God', year: '2016' },
  'parasite': { id: 99913, title: 'Parasite', year: '2019' },
  'train to busan': { id: 99914, title: 'Train to Busan', year: '2016' },
  'squid game': { id: 99915, title: 'Squid Game', year: '2021' }
};

function archiveItem(postId, slug, title, year, kind, poster) {
  const pathRoot = kind === 'movie' ? 'movies' : 'series';
  const p = poster || `${SITE}/wp-content/themes/dooplay/assets/img/no/dt_backdrop.png`;
  return `<article class="item" id="post-${postId}"><div class="image"><a href="${SITE}/${pathRoot}/${slug}"> ` +
    `<img src="${p}" alt="${title}" /> </a><a href="${SITE}/${pathRoot}/${slug}">` +
    `<div class="data"><h3 class="title">${title}</h3><span>${year}</span></div></a>` +
    `<span class="item_type">${kind === 'movie' ? 'Movie' : 'TV'}</span></div></article>`;
}

function featuredItem(postId, slug, title, kind, poster) {
  const pathRoot = kind === 'movie' ? 'movies' : 'series';
  return `<article id="post-featured-${postId}" class="item ${kind}s"><div class="poster">` +
    `<img src="${poster}" alt="${title}"><div class="rating">0</div><div class="featu">Featured</div>` +
    `<a href="${SITE}/${pathRoot}/${slug}">More</a></div></article>`;
}

function searchItem(slug, title, year, kind, desc) {
  const pathRoot = kind === 'movie' ? 'movies' : 'series';
  return `<article><div class="image"><div class="thumbnail animation-2">` +
    `<a href="${SITE}/${pathRoot}/${slug}?_rt=MXwx&amp;_rt_nonce=de91a29ccf">` +
    `<img src="${SITE}/wp-content/uploads/2025/03/IMG-150x150.webp" alt="${title}" />` +
    `<span class="${kind === 'movie' ? 'movies' : 'tv'}">${kind === 'movie' ? 'Movie' : 'TV'}</span></a></div></div>` +
    `<div class="details"><div class="title"><a href="${SITE}/${pathRoot}/${slug}?_rt=MXwx&amp;_rt_nonce=de91a29ccf">${title}</a></div>` +
    `<div class="meta"><span class="year">${year}</span></div>` +
    `<div class="contenido"><p>${desc || 'A story.'}</p></div></div></article>`;
}

// Archive pages: page 1 = 10 items (4 unmatchable), page 2 = 10 filler
// (all match), page 3 = 6 filler + 2 unmatchable, page 4+ = empty.
// Total resolved stream = 22 items.
function buildArchivePages(kind) {
  const root = kind === 'movie' ? 'movies' : 'series';
  const fillerWord = kind === 'movie' ? 'Movie' : 'Series';
  const mk = (n, title, year) => archiveItem(1000 + n, `t-${n}`, title, year, kind);
  const filler = (n, word) => mk(n, `Filler ${fillerWord} ${word}`, '2021');
  const page1 = [
    mk(1, 'Queen Mantis (Tagalog Dubbed)', '2025'),
    mk(2, 'Narco Saints (Tagalog Dubbed)', '2022'),
    mk(3, 'Totally Fake Local Show', '2024'),        // unmatchable
    mk(4, 'Another Unlisted One', '2023'),           // unmatchable
    mk(5, 'Love, Ngo', '2026'),
    mk(6, '72 Hours (Tagalog Dubbed)', '2025'),
    mk(7, 'Co x Love (Co-Love)', '2025'),            // mock DB has no entry for the parenthesized query
    mk(8, 'Love, Siargao', '2026'),
    mk(9, 'The Chambermaid\u2019s Daughter (Full Series)', '2026'),  // unmatchable in mock
    mk(10, 'Cobra Kai (Tagalog Dubbed)', '2018')
  ];
  const page2 = [
    filler(11, 'Eleven'), filler(12, 'Twelve'), filler(13, 'Thirteen'), filler(14, 'Fourteen'),
    filler(15, 'Fifteen'), filler(16, 'Sixteen'), filler(17, 'Seventeen'), filler(18, 'Eighteen'),
    filler(19, 'Nineteen'), filler(20, 'Twenty')
  ];
  const page3 = [
    filler(21, 'Twenty One'), filler(22, 'Twenty Two'), filler(23, 'Twenty Three'),
    filler(24, 'Twenty Four'), filler(25, 'Twenty Five'), filler(26, 'Twenty Six'),
    mk(27, 'Totally Fake Local Show', '2024'),
    mk(28, 'Another Unlisted One', '2023')
  ];
  return [page1, page2, page3].map((items, idx) => {
    const feat = featuredItem(1001, 't-1', 'Queen Mantis', kind, `${SITE}/wp-content/uploads/2025/01/QUEEN-MANTIS-185x278.jpg`);
    return `<html><body><div class="archive"><div class="pagination"><span>Page ${idx + 1} of 3</span></div>${feat}${items.join('')}</div></body></html>`;
  });
}

const MOCK_PAGES = {
  movie: buildArchivePages('movie'),
  series: buildArchivePages('series')
};

const MOCK_SEARCH_PAGES = {
  series: [
    [
      searchItem('queen-mantis-tagalog-dubbed', 'Queen Mantis (Tagalog Dubbed)', '2025', 'series', 'Mantis story.'),
      searchItem('narco-saints-tagalog-dubbed', 'Narco-Saints (Tagalog Dubbed)', '2022', 'series', 'Korean drama.'),
      searchItem('cobra-kai-tagalog-dubbed', 'Cobra Kai (Tagalog Dubbed)', '2018', 'series', 'Karate kid.')
    ],
    [] // search page 2: empty -> exhausted
  ],
  movie: [
    [
      searchItem('love-ngo', 'Love, Ngo', '2026', 'movie', 'Romance.'),
      searchItem('co-love', 'Co x Love (Co-Love)', '2025', 'movie', 'Content creators.')
    ],
    []
  ]
};

const MOCK_GENRE_PAGES = {
  'tagalog-dubbed': [
    [
      searchItem('queen-mantis-tagalog-dubbed', 'Queen Mantis (Tagalog Dubbed)', '2025', 'series', 'Mantis story.'),
      searchItem('cobra-kai-tagalog-dubbed', 'Cobra Kai (Tagalog Dubbed)', '2018', 'series', 'Karate kid.'),
      searchItem('narco-saints-tagalog-dubbed', 'Narco-Saints (Tagalog Dubbed)', '2022', 'series', 'Korean drama.')
    ],
    []
  ]
};

// MyAsianTV listing item (exact site shape)
function matvItem(slug, title, year) {
  return `<li> <a href="${MATV_SITE}/series/${slug}/" title="${title} (${year})"> ` +
    `<div class="cover" style="background-image: url('${MATV_SITE}/wp-content/uploads/2026/09/${slug}.jpg');"> ` +
    `<span class="rank-num">1</span> </div> <p class="title">${title} (${year})</p> ` +
    `<p class="reaslead"><span>Released: </span></p> </a> </li>`;
}

const MOCK_MATV_LIST = [
  // page 1 = most-popular-drama
  [
    matvItem('crash-landing-on-you-2019', 'Crash Landing on You', '2019'),
    matvItem('vincenzo-2021', 'Vincenzo', '2021'),
    matvItem('guardian-the-lonely-and-great-god-2016', 'Guardian: The Lonely and Great God', '2016')
  ],
  // page 2 = recently-added-movie
  [ matvItem('filler-m1-2021', 'Filler M1', '2021'), matvItem('filler-m2-2021', 'Filler M2', '2021') ],
  // page 3 = recently-added-kshow
  [ matvItem('filler-k1-2022', 'Filler K1', '2022') ],
  // page 4 = drama-start-with-a
  [ matvItem('filler-a1-2020', 'Filler A1', '2020') ],
  [] // page 5+: exhausted
];

const MOCK_MATV_SEARCH = {
  'crash': [
    { title: 'Crash Landing on You (2019) Episode 1', url: MATV_SITE + '/crash-landing-on-you-2019-episode-1/' },
    { title: 'Crash Landing on You (2019) Episode 2', url: MATV_SITE + '/crash-landing-on-you-2019-episode-2/' },
    { title: 'Crash Landing on You (2019) Episode 3', url: MATV_SITE + '/crash-landing-on-you-2019-episode-3/' }
  ],
  'vincenzo': [
    { title: 'Vincenzo (2021) Episode 1', url: MATV_SITE + '/vincenzo-2021-episode-1/' },
    { title: 'Sample Page', url: MATV_SITE + '/sample-page/' }
  ]
};

// Dramacool country page: main grid (class="img") + sidebar widgets (h3 only)
function dcGridItem(kind, slug, title) {
  return `<li> <a href="${DC_SITE}/${kind}/${slug}" class="img" title="${title}"> ` +
    `<img src="${DC_SITE}/public/storage/drama/${slug}.jpg" class="lazy" alt="${title}" ` +
    `data-original="${DC_SITE}/public/storage/drama/${slug}.jpg" style="display: block;"> ` +
    `<span class="type SUB">SUB</span> <h3 class="title">${title}</h3> </a> </li>`;
}
function dcSidebarItem(kind, slug, title) {
  return `<li><h3><a href="${DC_SITE}/${kind}/${slug}">${title}</a></h3></li>`;
}

const MOCK_DC_PAGES = {
  'korean-movie': `<html><body>` +
    dcGridItem('movie-detail', 'parasite', 'Parasite') +
    dcGridItem('movie-detail', 'train-to-busan', 'Train to Busan') +
    dcSidebarItem('drama-info', 'deep-secret', 'Deep Secret') +
    `</body></html>`,
  'korean-drama': `<html><body>` +
    dcGridItem('drama-info', 'squid-game', 'Squid Game') +
    dcGridItem('drama-info', 'vincenzo', 'Vincenzo') +
    dcSidebarItem('movie-detail', 'parasite', 'Parasite') +
    `</body></html>`,
  'japanese-movie': `<html><body></body></html>`
};

function serveHtml(pageNo, body) {
  if (Array.isArray(body)) {
    return pageNo < body.length ? (Array.isArray(body[pageNo]) ? body[pageNo].join('') : body[pageNo]) : '<html><body>No more</body></html>';
  }
  return pageNo === 0 ? body : '<html><body>No more</body></html>';
}

function makeMockFetch() {
  const calls = [];
  const fillerIds = {};
  const normalize = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  const fn = (url) => {
    calls.push(url);
    if (url.indexOf('api.themoviedb.org/3/search/') !== -1) {
      const u = new URL(url);
      const rawQ = u.searchParams.get('query') || '';
      const q = normalize(rawQ);
      const kind = url.indexOf('/search/tv') !== -1 ? 'tv' : 'movie';
      const yearParam = u.searchParams.get(kind === 'tv' ? 'first_air_date_year' : 'year') || '';
      let entry = MOCK_TMDB[q];
      if (!entry && /^filler /.test(q)) {
        // generic matcher so filler pages resolve to distinct tmdb ids
        if (!fillerIds[q]) fillerIds[q] = 7000 + Object.keys(fillerIds).length + 1;
        entry = { id: fillerIds[q], title: rawQ, year: yearParam || '2021' };
      }
      const results = entry ? [{
        id: entry.id,
        [kind === 'tv' ? 'name' : 'title']: entry.title,
        [kind === 'tv' ? 'first_air_date' : 'release_date']: (entry.year || '2021') + '-01-01',
        poster_path: '/' + q.replace(/\s+/g, '-') + '.jpg',
        backdrop_path: '/' + q.replace(/\s+/g, '-') + '-bg.jpg',
        overview: 'Mock overview for ' + entry.title + '.',
        vote_average: 7.3,
        genre_ids: kind === 'tv' ? [18, 10765] : [53, 18],
        original_language: 'ko',
        origin_country: kind === 'tv' ? ['KR'] : undefined
      }] : [];
      return Promise.resolve(new Response(JSON.stringify({ results }), { status: 200 }));
    }
    if (/api\.themoviedb\.org\/3\/(movie|tv)\/\d+\?/.test(url)) {
      // details + credits enrichment (v2.1.0)
      const kind = url.indexOf('/3/tv/') !== -1 ? 'tv' : 'movie';
      const body = kind === 'tv' ? {
        id: 99910,
        genres: [{ id: 18, name: 'Drama' }, { id: 10765, name: 'Sci-Fi & Fantasy' }],
        episode_run_time: [64],
        origin_country: ['KR'],
        credits: {
          cast: [{ name: 'Hyun Bin' }, { name: 'Son Ye-jin' }, { name: null }],
          crew: [{ name: 'Lee Jeong-hyo', job: 'Director' }, { name: 'Park Ji-eun', job: 'Writer' }]
        }
      } : {
        id: 99913,
        genres: [{ id: 53, name: 'Thriller' }, { id: 18, name: 'Drama' }],
        runtime: 132,
        production_countries: [{ iso_3166_1: 'KR', name: 'South Korea' }],
        credits: {
          cast: [{ name: 'Song Kang-ho' }, { name: 'Lee Sun-kyun' }],
          crew: [{ name: 'Bong Joon-ho', job: 'Director' }, { name: 'Han Jin-won', job: 'Writer' }]
        }
      };
      return Promise.resolve(new Response(JSON.stringify(body), { status: 200 }));
    }
    let m = url.match(new RegExp('^' + SITE + '/(?:' + 'movies|series' + ')(?:/page/(\\d+))?/?$'));
    if (m) {
      const kind = url.indexOf('/movies') !== -1 ? 'movie' : 'series';
      return Promise.resolve(new Response(serveHtml(parseInt(m[1] || '1', 10) - 1, MOCK_PAGES[kind]), { status: 200 }));
    }
    m = url.match(new RegExp('^' + SITE + '/genre/([a-z0-9-]+)(?:/page/(\\d+))?/?$'));
    if (m) {
      const pages = MOCK_GENRE_PAGES[m[1]] || [[]];
      return Promise.resolve(new Response(serveHtml(parseInt(m[2] || '1', 10) - 1, pages), { status: 200 }));
    }
    m = url.match(new RegExp('^' + SITE + '/page/(\\d+)/?\\?s=(.*)$'));
    if (m) {
      // decode the query crudely
      const q = decodeURIComponent(m[2].replace(/\+/g, ' ')).toLowerCase();
      const kind = q.indexOf('kai') !== -1 || q.indexOf('mantis') !== -1 || q.indexOf('narco') !== -1 ? 'series' : 'movie';
      const pages = MOCK_SEARCH_PAGES[kind];
      return Promise.resolve(new Response(serveHtml(parseInt(m[1], 10) - 1, pages), { status: 200 }));
    }
    m = url.match(new RegExp('^' + SITE + '/\\?s=(.*)$'));
    if (m) {
      const q = decodeURIComponent(m[1].replace(/\+/g, ' ')).toLowerCase();
      const kind = q.indexOf('kai') !== -1 || q.indexOf('mantis') !== -1 || q.indexOf('narco') !== -1 ? 'series' : 'movie';
      const pages = MOCK_SEARCH_PAGES[kind];
      return Promise.resolve(new Response(serveHtml(0, pages), { status: 200 }));
    }
    // MyAsianTV listing pages
    m = url.match(new RegExp('^' + MATV_SITE + '/(most-popular-drama|recently-added-movie|recently-added-kshow)/$'));
    if (m) {
      const idx = ['most-popular-drama', 'recently-added-movie', 'recently-added-kshow'].indexOf(m[1]);
      return Promise.resolve(new Response(MOCK_MATV_LIST[idx].join(''), { status: 200 }));
    }
    m = url.match(new RegExp('^' + MATV_SITE + '/drama-list/drama-start-with-([a-z])/$'));
    if (m) {
      // letter pages: only 'a' has content in the mock
      return Promise.resolve(new Response(m[1] === 'a' ? MOCK_MATV_LIST[3].join('') : '<html><body>No more</body></html>', { status: 200 }));
    }
    m = url.match(new RegExp('^' + MATV_SITE + '/wp-json/wp/v2/search\\?search=([^&]+)'));
    if (m) {
      const q = decodeURIComponent(m[1].replace(/\+/g, ' ')).toLowerCase();
      const key = Object.keys(MOCK_MATV_SEARCH).find((k) => q.indexOf(k) !== -1);
      const data = key ? MOCK_MATV_SEARCH[key] : [];
      return Promise.resolve(new Response(JSON.stringify(data), { status: 200 }));
    }
    // Dramacool country pages
    m = url.match(new RegExp('^' + DC_SITE + '/country/([a-z-]+)'));
    if (m) {
      const body = MOCK_DC_PAGES[m[1]];
      if (body === undefined) return Promise.reject(new Error('mock 404: ' + url));
      return Promise.resolve(new Response(body, { status: 200 }));
    }
    return Promise.reject(new Error('mock 404: ' + url));
  };
  fn.calls = calls;
  return fn;
}

async function getJSON(mockFetch, pathAndQuery, env) {
  const response = await Core.handle(pathAndQuery, Object.assign({ __fetchFn: mockFetch, PINOYHUB_SITE: SITE, MYASIANTV_SITE: MATV_SITE, DRAMACOOL_SITE: DC_SITE }, env || {}));
  const text = await response.text();
  let body = null;
  try { body = JSON.parse(text); } catch (e) { /* html response */ }
  return { status: response.status, body, text, headers: response.headers };
}

// ============================================================
// OFFLINE TESTS
// ============================================================

async function offlineTests() {
  section('manifest');
  const staticManifest = JSON.parse(fs.readFileSync(path.join(__dirname, 'manifest.json'), 'utf8'));
  const engineManifest = Core.manifest(Core.makeConfig({}));
  check('engine manifest matches committed manifest.json',
    JSON.stringify(engineManifest) === JSON.stringify(staticManifest));
  check('manifest has id/name/version', !!(engineManifest.id && engineManifest.name && engineManifest.version));
  check('manifest resources include catalog', engineManifest.resources.indexOf('catalog') !== -1);
  check('manifest types movie+series', engineManifest.types.indexOf('movie') !== -1 && engineManifest.types.indexOf('series') !== -1);
  check('manifest idPrefixes tmdb:', engineManifest.idPrefixes.indexOf('tmdb:') !== -1);
  check('manifest has 7 catalogs', engineManifest.catalogs.length === 7, engineManifest.catalogs.length);
  const dcCats = engineManifest.catalogs.filter((c) => c.id.indexOf('asian-') === 0 && c.extra.some((e) => e.name === 'genre'));
  check('asian country catalogs expose 8 country options',
    dcCats.length === 2 && dcCats.every((c) => c.extra.find((e) => e.name === 'genre').options.length === 8),
    dcCats.map((c) => c.id));
  const asianDramas = engineManifest.catalogs.find((c) => c.id === 'asian-dramas');
  check('asian-dramas exposes search + skip', !!asianDramas && asianDramas.extra.some((e) => e.name === 'search') && asianDramas.extra.some((e) => e.name === 'skip'));
  const pinoyGenreCats = engineManifest.catalogs.filter((c) => c.id.indexOf('pinoy-') === 0 && c.id.indexOf('genre') !== -1);
  check('pinoy genre catalogs expose >= 20 options', pinoyGenreCats.length === 2 && pinoyGenreCats.every((c) => c.extra.find((e) => e.name === 'genre').options.length >= 20));
  check('search catalogs expose search + skip (full-form extra)',
    engineManifest.catalogs.filter((c) => c.extra.every((e) => e.name !== 'genre'))
      .every((c) => c.extra.some((e) => e.name === 'search') && c.extra.some((e) => e.name === 'skip')));
  check('catalogs declare pageSize for TV skip-step', engineManifest.catalogs.every((c) => c.pageSize === 20));

  section('title cleaning');
  const ct = Core.cleanTitleForSearch;
  check('strips (Tagalog Dubbed)', ct('Queen Mantis (Tagalog Dubbed)') === 'Queen Mantis', ct('Queen Mantis (Tagalog Dubbed)'));
  check('strips ep prefix', ct('ep14 \u2013 Love, Siargao') === 'Love, Siargao', ct('ep14 \u2013 Love, Siargao'));
  check('strips Full Series', ct('The Chambermaid\u2019s Daughter (Full Series)') === 'The Chambermaid\u2019s Daughter', ct('The Chambermaid\u2019s Daughter (Full Series)'));
  check('keeps meaningful parens', ct('Co x Love (Co-Love)') === 'Co x Love (Co-Love)', ct('Co x Love (Co-Love)'));
  check('strips bare dubbed phrase', ct('Narco Saints Tagalog Dubbed') === 'Narco Saints', ct('Narco Saints Tagalog Dubbed'));
  check('keeps numbers', ct('72 Hours (Tagalog Dubbed)') === '72 Hours', ct('72 Hours (Tagalog Dubbed)'));
  check('strips in-title year', ct('Some Movie 2024 HD') === 'Some Movie', ct('Some Movie 2024 HD'));
  const dn = Core.cleanDisplayName;
  check('display strips ep prefix', dn('ep14 \u2013 Love, Siargao') === 'Love, Siargao');
  check('display keeps site naming', dn('Queen Mantis (Tagalog Dubbed)') === 'Queen Mantis (Tagalog Dubbed)');

  section('matching');
  check('normalize hyphens', Core.normalizeForCompare('Narco-Saints') === Core.normalizeForCompare('Narco Saints'));
  check('exact title scores 3', Core.titleScore('cobra kai', 'cobra kai') === 3);
  check('year exact scores 2', Core.yearScore('2025', '2025') === 2);
  const best = Core.pickBestTmdb(
    [{ id: 1, title: 'Cobra Kai', original: 'Cobra Kai', year: '2018' },
     { id: 2, title: 'Cobra', original: 'Cobra', year: '2025' }],
    'Cobra Kai', '2018');
  check('pickBest picks right candidate', !!best && best.id === 1, best);
  const none = Core.pickBestTmdb(
    [{ id: 3, title: 'Unrelated Thing', original: 'Unrelated Thing', year: '2019' }],
    'Totally Fake Local Show', '2024');
  check('pickBest rejects unrelated', none === null);

  section('page parsing');
  const cfg = Core.makeConfig({ PINOYHUB_SITE: SITE });
  const parsed = Core.parseListPage(cfg, MOCK_PAGES.series[0]);
  check('archive page yields 10 items', parsed.length === 10, parsed.length);
  check('featured carousel excluded', parsed.every((i) => i.slug !== ''));
  const first = parsed[0];
  check('item fields extracted', first.slug === 't-1' && first.type === 'series' && first.year === '2025', first);
  check('entities decoded in title', parsed[8].title.indexOf('\u2019') !== -1, parsed[8].title);
  check('placeholder poster enriched from featured',
    parsed[0].poster.indexOf('QUEEN-MANTIS.jpg') !== -1, parsed[0].poster);
  const searchParsed = Core.parseListPage(cfg, MOCK_SEARCH_PAGES.series[0].join(''));
  check('search page yields 3 items', searchParsed.length === 3, searchParsed.length);
  check('search item title via div.title', searchParsed[0].title === 'Queen Mantis (Tagalog Dubbed)', searchParsed[0]);
  check('search item description captured', searchParsed[0].description === 'Mantis story.', searchParsed[0].description);
  check('search strips _rt query from url', searchParsed[0].url.indexOf('?') === -1, searchParsed[0].url);

  section('routing: catalog with TMDB drops + stable skip');
  Core.resetCaches();
  const mock1 = makeMockFetch();
  const r1 = await getJSON(mock1, '/catalog/series/pinoy-series.json');
  check('catalog responds 200', r1.status === 200);
  check('response has metas array', Array.isArray(r1.body && r1.body.metas));
  check('buffer fills to page limit (20) despite drops', r1.body.metas.length === 20, r1.body.metas.length);
  check('all ids tmdb:', r1.body.metas.every((m) => m.id.indexOf('tmdb:') === 0), r1.body.metas.slice(0, 3).map((m) => m.id));
  check('meta name non-empty', r1.body.metas.every((m) => !!m.name));
  check('meta type series', r1.body.metas.every((m) => m.type === 'series'));
  check('tmdb backdrop as background', r1.body.metas.every((m) => (m.background || '').indexOf('image.tmdb.org') !== -1 || (m.background || '').indexOf('test-site.local') !== -1));
  check('description from TMDB', r1.body.metas.every((m) => (m.description || '').indexOf('Mock overview') === 0));
  check('rating present', r1.body.metas.every((m) => m.imdbRating === 7.3));
  check('page 1 content stable', r1.body.metas[0].name === 'Queen Mantis (Tagalog Dubbed)', r1.body.metas[0].name);
  const archiveCallsAfterFirst = mock1.calls.filter((u) => u.indexOf(SITE + '/series') === 0).length;
  check('consumed exactly 3 site pages to fill 20 items', archiveCallsAfterFirst === 3, mock1.calls.filter((u) => u.indexOf(SITE) === 0));

  const r1again = await getJSON(mock1, '/catalog/series/pinoy-series.json');
  check('repeat request served from buffer (no refetch)',
    mock1.calls.filter((u) => u.indexOf(SITE + '/series') === 0).length === archiveCallsAfterFirst);

  const rMid = await getJSON(mock1, '/catalog/series/pinoy-series/skip=20.json');
  check('skip=20 returns the remaining 2 resolved items', rMid.status === 200 && rMid.body.metas.length === 2, rMid.body);
  check('skip=20 items differ from page 1', rMid.body.metas.length && rMid.body.metas[0].id !== r1.body.metas[0].id);
  const rEnd = await getJSON(mock1, '/catalog/series/pinoy-series/skip=22.json');
  check('skip beyond resolved stream returns empty metas', rEnd.status === 200 && rEnd.body.metas.length === 0, rEnd.body);

  section('routing: search');
  Core.resetCaches();
  const s1 = await getJSON(makeMockFetch(), '/catalog/series/pinoy-series/search=queen%20mantis.json');
  check('search responds 200', s1.status === 200);
  check('search returns series matches', s1.body.metas.length === 3, s1.body);
  check('search results are tmdb ids', s1.body.metas.every((m) => m.id.indexOf('tmdb:') === 0));
  const s2 = await getJSON(makeMockFetch(), '/catalog/movie/pinoy-movies.json?search=love%20ngo');
  check('query-string extras also accepted', s2.status === 200 && s2.body.metas.length >= 1, s2.body);

  section('routing: genre');
  Core.resetCaches();
  const g1 = await getJSON(makeMockFetch(), '/catalog/series/pinoy-series-genre/genre=Tagalog%20Dubbed.json');
  check('genre responds 200', g1.status === 200);
  check('genre buffer filled', g1.body.metas.length === 3, g1.body);
  const g2 = await getJSON(makeMockFetch(), '/catalog/movie/pinoy-movies-genre/genre=Tagalog Dubbed&skip=3.json');
  check('genre + skip combo routes (exhausted -> empty)', g2.status === 200 && g2.body.metas.length === 0, g2.body);

  section('page parsing: MyAsianTV');
  Core.resetCaches();
  const matvCfg = Core.makeConfig({ MYASIANTV_SITE: MATV_SITE });
  const matvParsed = Core.parseMatvListPage(matvCfg, MOCK_MATV_LIST[0].join(''));
  check('matv page yields 3 items', matvParsed.length === 3, matvParsed.length);
  check('matv item fields', matvParsed[0].slug === 'crash-landing-on-you-2019' && matvParsed[0].type === 'series' && matvParsed[0].year === '2019', matvParsed[0]);
  check('matv poster captured', matvParsed[0].poster.indexOf('crash-landing-on-you-2019.jpg') !== -1, matvParsed[0].poster);
  const matvJson = Core.parseMatvJson(matvCfg, MOCK_MATV_SEARCH.crash);
  check('matv json yields 3 episode items', matvJson.length === 3, matvJson.length);
  check('matv json item slug from url', matvJson[0].slug === 'crash-landing-on-you-2019-episode-1', matvJson[0]);

  section('page parsing: Dramacool');
  const dcCfg = Core.makeConfig({ DRAMACOOL_SITE: DC_SITE });
  const dcMovies = Core.parseDcListPage(dcCfg, MOCK_DC_PAGES['korean-movie']);
  check('dc movie page yields 2 grid items', dcMovies.length === 2, dcMovies.length);
  check('dc sidebar widgets excluded', dcMovies.every((i) => i.slug !== 'deep-secret'), dcMovies.map((i) => i.slug));
  check('dc movie item type/slug', dcMovies[0].type === 'movie' && dcMovies[0].slug === 'parasite', dcMovies[0]);
  check('dc poster captured', dcMovies[0].poster.indexOf('parasite.jpg') !== -1, dcMovies[0].poster);
  const dcDramas = Core.parseDcListPage(dcCfg, MOCK_DC_PAGES['korean-drama']);
  check('dc drama page yields 2 series items', dcDramas.length === 2 && dcDramas.every((i) => i.type === 'series'), dcDramas.map((i) => i.slug));

  section('routing: asian-dramas listing (buffered across 4 pages)');
  Core.resetCaches();
  const ad = await getJSON(makeMockFetch(), '/catalog/series/asian-dramas.json');
  check('asian-dramas responds 200', ad.status === 200);
  check('asian-dramas fills all 7 resolved items', ad.body.metas.length === 7, ad.body.metas.length);
  check('asian-dramas ids are tmdb:', ad.body.metas.every((m) => m.id.indexOf('tmdb:') === 0));
  check('asian-dramas first meta is Crash Landing on You', ad.body.metas[0].name === 'Crash Landing on You (2019)', ad.body.metas[0].name);
  check('asian-dramas names are show-level (no Episode suffix)',
    ad.body.metas.every((m) => !/Episode \d+/.test(m.name)), ad.body.metas.map((m) => m.name));

  section('routing: asian-dramas search (episode posts collapse to shows)');
  Core.resetCaches();
  const adq = await getJSON(makeMockFetch(), '/catalog/series/asian-dramas/search=crash%20landing.json');
  check('asian-dramas search 200', adq.status === 200);
  check('3 episode posts collapse to 1 show meta', adq.body.metas.length === 1, adq.body.metas);
  check('collapsed show meta resolved to tmdb', adq.body.metas.length === 1 && adq.body.metas[0].id === 'tmdb:99910', adq.body.metas);
  const adv = await getJSON(makeMockFetch(), '/catalog/series/asian-dramas/search=vincenzo.json');
  check('search skips non-title pages (Sample Page)', adv.body.metas.length === 1 && adv.body.metas[0].id === 'tmdb:99911', adv.body.metas);

  section('routing: asian-movies by country');
  Core.resetCaches();
  const am = await getJSON(makeMockFetch(), '/catalog/movie/asian-movies/genre=Korean.json');
  check('asian-movies Korean responds 200', am.status === 200);
  check('asian-movies returns 2 movies', am.body.metas.length === 2, am.body.metas);
  check('asian-movies resolved to tmdb', am.body.metas.every((m) => m.id === 'tmdb:99913' || m.id === 'tmdb:99914'), am.body.metas.map((m) => m.id));
  const am2 = await getJSON(makeMockFetch(), '/catalog/movie/asian-movies/genre=Japanese.json');
  check('asian-movies empty country -> 200 []', am2.status === 200 && am2.body.metas.length === 0, am2.body);

  section('routing: asian-dramas-country');
  Core.resetCaches();
  const adc = await getJSON(makeMockFetch(), '/catalog/series/asian-dramas-country/genre=Korean.json');
  check('asian-dramas-country Korean 200 + 2 metas', adc.status === 200 && adc.body.metas.length === 2, adc.body.metas);
  check('asian-dramas-country sidebar movie excluded', adc.body.metas.every((m) => m.name !== 'Parasite'), adc.body.metas.map((m) => m.name));

  section('routing: errors and edge cases');
  const nf1 = await getJSON(makeMockFetch(), '/catalog/movie/unknown-catalog.json');
  check('unknown catalog -> 404', nf1.status === 404);
  const nf2 = await getJSON(makeMockFetch(), '/catalog/anime/pinoy-movies.json');
  check('unknown type -> 404', nf2.status === 404);
  const nf3 = await getJSON(makeMockFetch(), '/definitely-not-a-route');
  check('unknown route -> 404', nf3.status === 404);
  const nf4 = await getJSON(makeMockFetch(), '/catalog/series/pinoy-movies.json');
  check('type/catalog mismatch -> 404', nf4.status === 404);
  const boom = makeMockFetch();
  const brokenFetch = (url) => { if (url.indexOf('themoviedb') === -1) return Promise.reject(new Error('site down')); return boom(url); };
  brokenFetch.calls = boom.calls;
  const errRes = await getJSON(brokenFetch, '/catalog/movie/pinoy-movies.json');
  check('site failure -> 502 json error', errRes.status === 502 && !!errRes.body.error, errRes.status);

  section('routing: deep-page 404 ends listing gracefully');
  Core.resetCaches();
  const fm = makeMockFetch();
  const fn404 = (url) => {
    if (url === SITE + '/series/page/2') return Promise.resolve(new Response('not found', { status: 404 }));
    return fm(url);
  };
  fn404.calls = fm.calls;
  const p404 = await getJSON(fn404, '/catalog/series/pinoy-series.json');
  check('deep-page 404 -> 200 with page-1 items only',
    p404.status === 200 && p404.body.metas && p404.body.metas.length === 6,
    { status: p404.status, n: p404.body && p404.body.metas && p404.body.metas.length });

  section('keepUnmatched fallback');
  Core.resetCaches();
  const ku = await getJSON(makeMockFetch(), '/catalog/series/pinoy-series.json', { PINOYHUB_KEEP_UNMATCHED: '1' });
  const pinoyIds = ku.body.metas.filter((m) => m.id.indexOf('asian:pinoy:') === 0);
  check('keepUnmatched emits asian:pinoy: ids', pinoyIds.length >= 1, pinoyIds.map((m) => m.id));
  check('pinoyhub ids keep site metadata',
    pinoyIds.length === 0 || pinoyIds.every((m) => (m.description === undefined || typeof m.description === 'string') && !!m.releaseInfo),
    pinoyIds[0]);

  section('metadata enrichment (details + credits)');
  Core.resetCaches();
  const en = await getJSON(makeMockFetch(), '/catalog/series/asian-dramas.json');
  const en0 = en.body.metas[0];
  check('tv meta gains genres array (details beats genre_ids)', Array.isArray(en0.genres) && en0.genres.indexOf('Drama') !== -1, en0.genres);
  check('tv meta gains genre string alias', typeof en0.genre === 'string' && en0.genre.length > 0, en0.genre);
  check('tv meta gains country from origin_country', en0.country === 'South Korea', en0.country);
  check('tv meta gains episode runtime', en0.runtime === '64 min', en0.runtime);
  check('tv meta gains cast (null names skipped)', Array.isArray(en0.cast) && en0.cast.indexOf('Hyun Bin') !== -1 && en0.cast.indexOf(null) === -1, en0.cast);
  check('tv meta has no director field', en0.director === undefined);
  Core.resetCaches();
  const enM = await getJSON(makeMockFetch(), '/catalog/movie/asian-movies/genre=Korean.json');
  const par = enM.body.metas.find((m) => m.id === 'tmdb:99913');
  check('movie meta gains runtime', !!par && par.runtime === '132 min', par);
  check('movie meta gains director from credits', !!par && Array.isArray(par.director) && par.director[0] === 'Bong Joon-ho', par && par.director);
  check('movie meta gains production country', !!par && par.country === 'South Korea', par && par.country);
  check('movie meta genres from details', !!par && Array.isArray(par.genres) && par.genres.indexOf('Thriller') !== -1, par && par.genres);

  section('TMDB outage keeps catalog visible (no more silent empties)');
  Core.resetCaches();
  const outageBase = makeMockFetch();
  const outageFetch = (url) => {
    if (url.indexOf('themoviedb') !== -1) return Promise.resolve(new Response(JSON.stringify({ status_message: 'Internal error' }), { status: 500 }));
    return outageBase(url);
  };
  outageFetch.calls = outageBase.calls;
  const out = await getJSON(outageFetch, '/catalog/series/asian-dramas/search=crash%20landing.json');
  check('outage search responds 200 (not 502)', out.status === 200, out.status);
  check('outage search still returns rows', out.body.metas.length >= 1, out.body);
  check('outage rows use asian: ids', out.body.metas.every((m) => m.id.indexOf('asian:matv:') === 0), out.body.metas.map((m) => m.id));
  check('outage episode posts still collapse (norm-title id)', out.body.metas.length === 1 && out.body.metas[0].id === 'asian:matv:crash-landing-on-you', out.body.metas);
  check('outage rows keep site name + year', out.body.metas.length === 1 && out.body.metas[0].name === 'Crash Landing on You (2019)' && out.body.metas[0].releaseInfo === '2019', out.body.metas[0]);
  check('outage wp-json rows tolerate missing art (search JSON carries none)', out.body.metas.length === 1 && out.body.metas[0].poster === undefined, out.body.metas[0] && out.body.metas[0].poster);
  const outP = await getJSON(outageFetch, '/catalog/movie/pinoy-movies/search=love%20ngo.json');
  check('outage pinoy rows keep site poster art', outP.status === 200 && outP.body.metas.length >= 1 && outP.body.metas.every((m) => (m.poster || '').indexOf('test-site.local') !== -1), outP.body.metas && outP.body.metas.map((m) => m.poster));

  section('/health diagnostics');
  Core.resetCaches();
  const h1 = await getJSON(makeMockFetch(), '/health');
  check('health responds 200', h1.status === 200, h1.status);
  check('health reports version + addonId', h1.body.version === Core.VERSION && h1.body.addonId === 'community.asianhub.catalog', h1.body);
  check('health checks 4 dependencies', Array.isArray(h1.body.sources) && h1.body.sources.length === 4, h1.body.sources && h1.body.sources.map((s) => s.label));
  check('health all-ok offline', h1.body.status === 'ok' && h1.body.healthy === true, h1.body.status);
  check('health items counted', h1.body.sources.every((s) => s.ok && s.items > 0), h1.body.sources);
  Core.resetCaches();
  const h2 = await getJSON(outageFetch, '/health');
  check('health flags degraded on TMDB outage', h2.body.status === 'degraded' && h2.body.healthy === false, h2.body.status);
  check('health tmdb check fails with error', h2.body.sources[3].ok === false && /HTTP 500/.test(h2.body.sources[3].error || ''), h2.body.sources[3]);
  check('health hints mention TMDB key', h2.body.hints.some((t) => /TMDB_API_KEY/.test(t)), h2.body.hints);
}

// ============================================================
// LIVE TESTS
// ============================================================

async function liveTests() {
  section('LIVE manifest');
  const lm = await Core.handle('https://self.local/manifest.json', {});
  check('live manifest 200', lm.status === 200);

  section('LIVE movie catalog');
  const mv = await Core.handle('https://self.local/catalog/movie/pinoy-movies.json', {});
  const mvBody = await mv.json();
  check('movies 200', mv.status === 200);
  check('movies >= 5 metas', mvBody.metas && mvBody.metas.length >= 5, mvBody.metas && mvBody.metas.length);
  const tmdbShare = mvBody.metas.filter((m) => m.id.indexOf('tmdb:') === 0).length;
  check('movies TMDB match rate >= 60%', mvBody.metas.length && tmdbShare / mvBody.metas.length >= 0.6, tmdbShare + '/' + mvBody.metas.length);
  check('movies posters present', mvBody.metas.every((m) => !!m.poster && !/\/no\//.test(m.poster)), mvBody.metas.map((m) => m.poster).slice(0, 3));

  section('LIVE series catalog');
  const sv = await Core.handle('https://self.local/catalog/series/pinoy-series.json', {});
  const svBody = await sv.json();
  check('series 200 + >= 5 metas', sv.status === 200 && svBody.metas.length >= 5, svBody.metas && svBody.metas.length);

  section('LIVE genre catalog');
  const gv = await Core.handle('https://self.local/catalog/series/pinoy-series-genre/genre=Tagalog Dubbed.json', {});
  const gvBody = await gv.json();
  check('genre 200 + >= 1 metas', gv.status === 200 && gvBody.metas.length >= 1, gvBody.metas && gvBody.metas.length);

  section('LIVE search');
  const q = await Core.handle('https://self.local/catalog/series/pinoy-series/search=cobra.json', {});
  const qBody = await q.json();
  check('search 200 + >= 1 metas', q.status === 200 && qBody.metas.length >= 1, qBody.metas && qBody.metas.length);

  section('LIVE pagination');
  const p1 = await Core.handle('https://self.local/catalog/movie/pinoy-movies.json', {});
  const p1Body = await p1.json();
  const p2 = await Core.handle('https://self.local/catalog/movie/pinoy-movies/skip=' + p1Body.metas.length + '.json', {});
  const p2Body = await p2.json();
  check('page 2 returns items', p2.status === 200 && p2Body.metas.length >= 1, p2Body.metas && p2Body.metas.length);
  check('page 2 differs from page 1', p1Body.metas.length && p2Body.metas.length && p1Body.metas[0].id !== p2Body.metas[0].id);

  section('LIVE asian-dramas');
  const lad = await Core.handle('https://self.local/catalog/series/asian-dramas.json', {});
  const ladBody = await lad.json();
  check('asian-dramas 200 + >= 5 metas', lad.status === 200 && ladBody.metas && ladBody.metas.length >= 5, ladBody.metas && ladBody.metas.length);
  const ladTmdb = ladBody.metas.filter((m) => m.id.indexOf('tmdb:') === 0).length;
  check('asian-dramas TMDB match rate >= 60%', ladBody.metas.length && ladTmdb / ladBody.metas.length >= 0.6, ladTmdb + '/' + ladBody.metas.length);

  section('LIVE asian-dramas search');
  const laq = await Core.handle('https://self.local/catalog/series/asian-dramas/search=crash landing.json', {});
  const laqBody = await laq.json();
  check('asian search 200 + >= 1 metas', laq.status === 200 && laqBody.metas && laqBody.metas.length >= 1, laqBody.metas && laqBody.metas.length);

  section('LIVE asian-movies by country');
  const lam = await Core.handle('https://self.local/catalog/movie/asian-movies/genre=Korean.json', {});
  const lamBody = await lam.json();
  // the dramacool country grid only server-renders its popular block
  // (2-12 items); the deep asian catalog is the MyAsianTV-based one
  check('asian-movies Korean 200 + >= 2 metas', lam.status === 200 && lamBody.metas && lamBody.metas.length >= 2, lamBody.metas && lamBody.metas.length);
  const lamTmdb = (lamBody.metas || []).filter((m) => m.id.indexOf('tmdb:') === 0).length;
  check('asian-movies TMDB match rate >= 50%', lamBody.metas.length && lamTmdb / lamBody.metas.length >= 0.5, lamTmdb + '/' + lamBody.metas.length);

  section('LIVE asian-dramas-country');
  const ladc = await Core.handle('https://self.local/catalog/series/asian-dramas-country/genre=Thai.json', {});
  const ladcBody = await ladc.json();
  check('asian-dramas-country Thai 200', ladc.status === 200, ladc.status);

  section('LIVE metadata enrichment');
  const len = await Core.handle('https://self.local/catalog/series/asian-dramas.json', {});
  const lenBody = await len.json();
  const lenMetas = (lenBody.metas || []).filter((m) => m.id.indexOf('tmdb:') === 0);
  const withGenres = lenMetas.filter((m) => Array.isArray(m.genres) && m.genres.length > 0);
  check('live metas carry genres (>= 70%)', lenMetas.length && withGenres.length / lenMetas.length >= 0.7, withGenres.length + '/' + lenMetas.length);
  const withCountry = lenMetas.filter((m) => typeof m.country === 'string' && m.country.length > 0);
  check('live metas carry country (>= 70%)', lenMetas.length && withCountry.length / lenMetas.length >= 0.7, withCountry.length + '/' + lenMetas.length);
  check('live genre values look real (Drama/Comedy/Romance...)',
    withGenres.every((m) => m.genres.every((g) => /^[A-Za-z& '-]+$/.test(g))), withGenres[0] && withGenres[0].genres);

  section('LIVE /health');
  const lh = await Core.handle('https://self.local/health', {});
  const lhBody = await lh.json();
  check('live health 200/503 + payload', (lh.status === 200 || lh.status === 503) && !!lhBody.status && Array.isArray(lhBody.sources) && lhBody.sources.length === 4, lh.status);
  check('live health status ok or degraded', lhBody.status === 'ok' || lhBody.status === 'degraded', lhBody.status);
  check('live health sources report items', lhBody.sources.filter((s) => s.ok).length >= 2, lhBody.sources.map((s) => s.label + ':' + s.ok + ':' + s.items).join(' | '));
  if (lhBody.status !== 'ok') {
    console.log('  (health hints: ' + JSON.stringify(lhBody.hints).substring(0, 240) + ')');
  }
}

// ============================================================

(async () => {
  console.log('Asian Catalog addon tests');
  await offlineTests();
  if (process.env.LIVE === '1') {
    await liveTests();
  } else {
    console.log('\n(live tests skipped — run with LIVE=1)');
  }
  console.log(`\nRESULT: ${passed} passed, ${failed} failed`);
  if (failures.length) {
    console.log('Failures:');
    failures.forEach((f) => console.log('  - ' + f));
    process.exit(1);
  }
})().catch((err) => {
  console.error('Harness crashed:', err);
  process.exit(1);
});
