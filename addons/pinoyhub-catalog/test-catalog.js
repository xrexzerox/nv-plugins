#!/usr/bin/env node
/**
 * PinoyHub Catalog — addon test harness
 *
 *   node test-catalog.js            # offline tests (mock network)
 *   LIVE=1 node test-catalog.js     # + live tests against the real site/TMDB
 *
 * Run from this folder. Requires Node >= 18.
 */

'use strict';

require('./core.js');
const Core = globalThis.PinoyHubCatalogCore;
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

const MOCK_TMDB = {
  'queen mantis': { id: 99901, title: 'Queen Mantis', year: '2025' },
  'narco saints': { id: 99902, title: 'Narco-Saints', year: '2022' },
  'love ngo': { id: 99903, title: 'Love, Ngo', year: '2026' },
  '72 hours': { id: 99904, title: '72 Hours', year: '2025' },
  'co x love': { id: 99905, title: 'Co x Love (Co-Love)', year: '2025' },
  'love siargao': { id: 99906, title: 'Love, Siargao', year: '2026' },
  'the chambermaids daughter': { id: 99907, title: 'The Chambermaid\u2019s Daughter', year: '2026' },
  'cobra kai': { id: 99908, title: 'Cobra Kai', year: '2018' }
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
        vote_average: 7.3
      }] : [];
      return Promise.resolve(new Response(JSON.stringify({ results }), { status: 200 }));
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
    return Promise.reject(new Error('mock 404: ' + url));
  };
  fn.calls = calls;
  return fn;
}

async function getJSON(mockFetch, pathAndQuery, env) {
  const response = await Core.handle(pathAndQuery, Object.assign({ __fetchFn: mockFetch, PINOYHUB_SITE: SITE }, env || {}));
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
  check('manifest has 4 catalogs', engineManifest.catalogs.length === 4);
  const genreCats = engineManifest.catalogs.filter((c) => c.extra.some((e) => e.name === 'genre'));
  check('genre catalogs expose >= 20 options', genreCats.length === 2 && genreCats.every((c) => c.extra.find((e) => e.name === 'genre').options.length >= 20));
  check('main catalogs expose search + skip (full-form extra)',
    engineManifest.catalogs.filter((c) => c.id.indexOf('genre') === -1)
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
  const pinoyIds = ku.body.metas.filter((m) => m.id.indexOf('pinoyhub:') === 0);
  check('keepUnmatched emits pinoyhub ids', pinoyIds.length >= 1, pinoyIds.map((m) => m.id));
  check('pinoyhub ids keep site metadata',
    pinoyIds.length === 0 || pinoyIds.every((m) => (m.description === undefined || typeof m.description === 'string') && !!m.releaseInfo),
    pinoyIds[0]);
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
}

// ============================================================

(async () => {
  console.log('PinoyHub Catalog addon tests');
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
