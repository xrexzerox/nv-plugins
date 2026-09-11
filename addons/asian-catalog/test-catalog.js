#!/usr/bin/env node
/**
 * Asian Catalog v4.1.0 — offline regression suite (no network).
 * Run: node test-catalog.js
 * Covers: manifest shape (21 catalogs), all five site parsers (fixtures
 * inline), genre label -> real slug mapping, meta shapes (TMDB-enriched +
 * source-scoped fallbacks), page-URL builders via canned fetch, request
 * routing (search/genre/skip/404), and the v4.1.0 kisskh TMDB rescue
 * (all mirrors CF-blocked -> sections still populate with full metadata).
 */
'use strict';
require('./core.js');
const Core = globalThis.AsianCatalogCore;
const fs = require('fs');

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('  ok  ' + name); }
  else { fail++; console.log('  FAIL ' + name + (extra !== undefined ? ' | ' + JSON.stringify(extra).slice(0, 160) : '')); }
}
function section(t) { console.log('\n== ' + t + ' =='); }

const cfg = Core.makeConfig({ __fetchFn: () => Promise.reject(new Error('offline')) });

(async () => {
// ---------------------------------------------------------------- manifest
section('manifest shape (v4.1.0, 21 catalogs mirroring the site sections)');
{
  const man = Core.manifest(cfg);
  ok('version 4.1.0', man.version === '4.1.0', man.version);
  ok('description mentions TMDB rescue', /auto-rescued from TMDB/.test(man.description), man.description.slice(0, 80));
  ok('id community.asian.catalog', man.id === 'community.asian.catalog');
  ok('types movie+series', man.types.join(',') === 'movie,series');
  ok('idPrefixes tmdb+asian', man.idPrefixes.join(',') === 'tmdb:,asian:');
  const ids = man.catalogs.map(c => c.id);
  const want = [
    'pinoy-new-releases', 'pinoy-new-releases-tv', 'pinoy-movies', 'pinoy-series',
    'pinoy-featured', 'pinoy-featured-tv', 'pinoy-coming-soon',
    'pinoy-movies-genre', 'pinoy-series-genre',
    'asian-series-hot', 'asian-series', 'asian-series-genre',
    'asian-series-viewasian',
    'kisskh-latest', 'kisskh-top-kdrama', 'kisskh-top-cdrama',
    'kisskh-hollywood', 'kisskh-hollywood-movies', 'kisskh-anime', 'kisskh-upcoming',
    'animo-latest'
  ];
  ok('21 catalogs', man.catalogs.length === 21, man.catalogs.length);
  ok('exact id set', ids.length === want.length && want.every(w => ids.indexOf(w) !== -1), ids);
  ok('no duplicate ids', new Set(ids).size === ids.length);
  ok('every catalog declares skip', man.catalogs.every(c => c.extra.some(e => e.name === 'skip')));
  const searchable = man.catalogs.filter(c => c.extra.some(e => e.name === 'search')).map(c => c.id);
  ok('search absent only on finite widgets', ['pinoy-new-releases', 'pinoy-new-releases-tv', 'pinoy-featured', 'pinoy-featured-tv', 'pinoy-coming-soon', 'pinoy-movies-genre', 'pinoy-series-genre', 'asian-series-genre', 'kisskh-upcoming']
    .every(id => searchable.indexOf(id) === -1) &&
    ['pinoy-movies', 'pinoy-series', 'asian-series-hot', 'asian-series', 'asian-series-viewasian', 'animo-latest', 'kisskh-latest']
      .every(id => searchable.indexOf(id) !== -1), searchable);
  const pmg = man.catalogs.find(c => c.id === 'pinoy-movies-genre');
  const pinoyChips = pmg.extra.find(e => e.name === 'genre').options;
  ok('pinoy chips = 17 site sections', pinoyChips.length === 17 &&
    pinoyChips.indexOf('Rated R') !== -1 && pinoyChips.indexOf('Wattpad Presents') !== -1 &&
    pinoyChips.indexOf('Tagalog Dubbed') !== -1 && pinoyChips.indexOf('Digitally Restored') !== -1, pinoyChips);
  const ksg = man.catalogs.find(c => c.id === 'asian-series-genre');
  const ksChips = ksg.extra.find(e => e.name === 'genre').options;
  ok('kissasian chips = recommendation tabs', ksChips.join(',') === 'Fantasy,Friendship,Law,Romance,Sports', ksChips);
}

// ---------------------------------------------------------------- parsers
section('pinoy: Dooplay archive parser');
{
  const html = [
    '<article id="post-101" class="item movies"><div class="poster"><img src="https://pinoymovieshub.win/wp-content/uploads/p101-200x300.jpg" alt="Queen Mantis"></div><div class="details"><div class="title"><a href="https://pinoymovieshub.win/movies/queen-mantis-2025">Queen Mantis</a></div><span>2025</span></div></article>',
    '<article id="post-102" class="item tvshows"><div class="poster"><img src="https://pinoymovieshub.win/wp-content/uploads/p102.jpg" alt="The Red Leash"></div><div class="details"><div class="title"><a href="https://pinoymovieshub.win/series/the-red-leash">The Red Leash</a></div><span>2026</span></div><div class="contenido"><p>Sinopsis here</p></div></article>',
    '<article id="post-featured-55" class="item movies"><div class="poster"><img src="https://pinoymovieshub.win/wp-content/uploads/f55.jpg" alt="Featured"></div></article>' // skipped here
  ].join('\n');
  const items = Core.parseListPage(cfg, html);
  ok('archive: 2 rows (featured skipped)', items.length === 2, items.length);
  ok('archive: movie typed', items[0].type === 'movie' && items[0].source === 'pmh' && items[0].slug === 'queen-mantis-2025');
  ok('archive: series typed + description', items[1].type === 'series' && items[1].description === 'Sinopsis here');
  ok('archive: thumbnail suffix upgraded at meta time', Core.toMeta(cfg, items[0], null).poster.indexOf('-200x300') === -1);
}

section('pinoy: NEW RELEASES carousel parser (rating + year)');
{
  const html = '<div id="featured-titles" class="items featured">' +
    '<article id="post-featured-900" class="item movies"><div class="poster"><img src="https://pinoymovieshub.win/wp-content/uploads/f900-185x278.jpg" alt="Tayo Sa Wakas"><div class="rating">8.7</div><a href="https://pinoymovieshub.win/movies/tayo-sa-wakas"></a></div><div class="data dfeatur"><h3><a href="https://pinoymovieshub.win/movies/tayo-sa-wakas">Tayo Sa Wakas</a></h3><span>2026</span></div></article>' +
    '<article id="post-featured-901" class="item tvshows"><div class="poster"><img src="https://pinoymovieshub.win/wp-content/uploads/f901.jpg" alt="The Red Leash"><div class="rating">7.9</div><a href="https://pinoymovieshub.win/series/the-red-leash"></a></div><div class="data dfeatur"><h3><a href="https://pinoymovieshub.win/series/the-red-leash">The Red Leash</a></h3><span>2026</span></div></article>' +
    '</div><h2>Recently Added Movies</h2>';
  const items = Core.parseFeaturedCarousel(cfg, html);
  ok('carousel: 2 rows', items.length === 2, items.length);
  ok('carousel: movie+series split', items[0].type === 'movie' && items[1].type === 'series');
  ok('carousel: ratings captured', items[0].rating === '8.7' && items[1].rating === '7.9');
  ok('carousel: years captured', items.every(i => i.year === '2026'));
  ok('carousel: pmh slugs', items[0].slug === 'tayo-sa-wakas' && items[1].slug === 'the-red-leash');
}

section('kissasian: order=update archive + hot section');
{
  const row = (slug, t) => `<article class="bs" itemscope="itemscope"><div class="bsx"> <a href="https://kissasian.cam/${slug}-episode-1/" itemprop="url" title="${t} Episode 1" class="tip"><img src="https://kissasian.cam/wp-content/uploads/${slug}.jpg" title="${t} Episode 1" alt="${t}"/></a></div></article>`;
  const html = row('blossom-through-the-cloud', 'Blossom through the Cloud') + row('no-9-hunter', 'No. 9 Hunter');
  const items = Core.ksParseListPage(cfg, html);
  ok('ks archive: episode rows dedupe to series', items.length === 2 && items[0].slug === 'blossom-through-the-cloud' && items[0].source === 'ks');
  ok('ks archive: canonical /series/ urls', items.every(i => i.url === 'https://kissasian.cam/series/' + i.slug + '/'));
  const hotHtml = '<div class="bixbox"><div class="releases hothome"><h2>Hot Series Update</h2></div><div class="listupd flex">' +
    '<article class="stylefor" itemscope="itemscope"><div class="bsx"> <a href="https://kissasian.cam/the-early-spring-episode-24/" title="The Early Spring Episode 24"><img src="https://kissasian.cam/wp-content/uploads/es.jpg" title="The Early Spring Episode 24" alt="ES"/></a></div></article>' +
    '<article class="stylefor" itemscope="itemscope"><div class="bsx"> <a href="https://kissasian.cam/pov-pasilip-on-vmx-2026/" title="POV: Pasilip on VMX (2026)"><img src="https://kissasian.cam/wp-content/uploads/pov.jpg" title="POV" alt="POV"/></a></div></article>' +
    '</div></div><div class="bixbox"><div class="releases latesthome"><h3>Latest Release</h3></div></div>';
  const hot = Core.ksParseHotSection(cfg, hotHtml);
  ok('ks hot: stylefor rows parsed + root rows kept', hot.length === 2 && hot[0].slug === 'the-early-spring' && hot[1].slug === 'pov-pasilip-on-vmx-2026', hot.map(i => i.slug));
}

section('viewasian: home recent list');
{
  const html = '<ul class="switch-block list-episode-item"><li>' +
    '<a href="https://viewasian.lol/in-my-prime-2026-episode-10-english-sub/" class="img"><img class="lazy" alt="In My Prime (2026) Episode 10 English Sub" title="In My Prime (2026) Episode 10 English Sub" data-original="https://viewasian.lol/wp-content/uploads/imp.jpg"></a>' +
    '<h2 class="title">In My Prime (2026)</h2></li></ul>';
  const items = Core.vaParseListPage(cfg, html);
  ok('va: episode row deduped with year', items.length === 1 && items[0].slug === 'in-my-prime-2026' && items[0].year === '2026' && items[0].source === 'va');
}

section('animotvslash: /anime/?order=update listing');
{
  const html = '<article class="bs" itemscope="itemscope"><div class="bsx"> <a href="https://animotvslash.org/anime/tomb-raider-king/" itemprop="url" title="Tomb Raider King" class="tip"><img src="https://animotvslash.org/wp-content/uploads/trk.jpg" title="Tomb Raider King" alt="TRK"/></a></div></article>' +
    '<article class="bs" itemscope="itemscope"><div class="bsx"> <a href="https://animotvslash.org/one-piece-episode-1100/" itemprop="url" title="One Piece Episode 1100" class="tip"><img src="https://animotvslash.org/wp-content/uploads/op.jpg" title="One Piece Episode 1100" alt="OP"/></a></div></article>';
  const items = Core.animoParseListPage(cfg, html);
  ok('animo: 2 rows parsed', items.length === 2, items.length);
  ok('animo: /anime/ row kept as-is', items[0].slug === 'tomb-raider-king' && items[0].url === 'https://animotvslash.org/anime/tomb-raider-king/');
  ok('animo: episode row deduped to /anime/ url', items[1].slug === 'one-piece' && items[1].source === 'an');
}

// ------------------------------------------------------- genre slug mapping
section('pinoy genre labels -> real site slugs');
ok('Rated R -> sexy (site see-all target)', Core.pinoyGenreSlug('Rated R') === 'sexy');
ok('Wattpad Presents -> wattpad', Core.pinoyGenreSlug('Wattpad Presents') === 'wattpad');
ok('Tagalog Dubbed -> tagalog-dubbed', Core.pinoyGenreSlug('Tagalog Dubbed') === 'tagalog-dubbed');
ok('Digitally Restored -> digitally-restored', Core.pinoyGenreSlug('Digitally Restored') === 'digitally-restored');

// ---------------------------------------------------------------- meta
section('meta shapes (TMDB-enriched + source-scoped fallbacks)');
{
  const tm = Core.toMeta(cfg, { source: 'ks', slug: 'queen-of-tears', type: 'series', title: 'Queen of Tears', year: '' },
    { id: 215720, title: 'Queen of Tears', year: '2024', poster: '/q.jpg', backdrop: '/b.jpg', overview: 'A story', rating: 8.4 });
  ok('tmdb: id wins', tm.id === 'tmdb:215720', tm.id);
  ok('full metadata (desc+year+rating+bg)', tm.description === 'A story' && tm.releaseInfo === '2024' && tm.imdbRating === 8.4 && !!tm.background);
  const fb = Core.toMeta(cfg, { source: 'kh', sourceId: '12345', type: 'series', title: 'Stub Drama', year: '2024', poster: 'https://kisskh.co/upload/x.jpg', rating: '8.0' }, null);
  ok('kh- fallback id from sourceId', fb.id === 'asian:kh-12345', fb.id);
  ok('site rating on fallback', fb.imdbRating === 8, fb.imdbRating);
  ok('absolute kisskh poster kept', fb.poster === 'https://kisskh.co/upload/x.jpg');
  const an = Core.toMeta(cfg, { source: 'an', slug: 'tomb-raider-king', type: 'series', title: 'Tomb Raider King', poster: '' }, null);
  ok('an- fallback id', an.id === 'asian:an-tomb-raider-king', an.id);
  const pmh = Core.toMeta(cfg, { source: 'pmh', slug: 'tayo-sa-wakas', type: 'movie', title: 'Tayo Sa Wakas', year: '2026', poster: '', rating: '8.7' }, null);
  ok('pmh- fallback id + rating', pmh.id === 'asian:pmh-tayo-sa-wakas' && pmh.imdbRating === 8.7);
  const ph = Core.toMeta(cfg, { source: 'pmh', slug: 'ph', type: 'movie', title: 'Placeholder', poster: 'https://pinoymovieshub.win/wp-content/themes/dooplay/assets/img/no/poster.png' }, null);
  ok('dooplay placeholder poster rejected', !ph.poster, ph.poster);
  ok('keepUnmatched default on', cfg.keepUnmatched === true);
  const cfgDrop = Core.makeConfig({ ASIAN_KEEP_UNMATCHED: '0' });
  ok('ASIAN_KEEP_UNMATCHED=0 drops fallbacks', Core.toMeta(cfgDrop, { source: 'an', slug: 'x', type: 'series', title: 'X', poster: '' }, null) === null);
}

// ------------------------------------------------- page URL builders (canned)
section('page URL builders via getCatalogMetas (canned fetch)');
{
  const requested = [];
  function canned(htmlFor) {
    return function (url) {
      requested.push(String(url));
      const body = htmlFor(String(url));
      return Promise.resolve(new Response(body, { status: 200, headers: { 'content-type': 'text/html' } }));
    };
  }
  const defs = Core.catalogDefinitions();
  function def(id) { return defs.find(d => d.id === id); }
  function fakePage(marker) {
    return `<article id="post-1" class="item movies"><div class="poster"><img src="https://pinoymovieshub.win/a.jpg" alt="A"></div><div class="details"><div class="title"><a href="https://pinoymovieshub.win/movies/a-2020">A</a></div><span>2020</span></div></article>${marker || ''}`;
  }
  Core.resetCaches();
  const cfg1 = Core.makeConfig({
    __fetchFn: canned(u => {
      if (u === 'https://pinoymovieshub.win/genre/sexy') return fakePage();
      if (/\/genre\/sexy\/page\/2/.test(u)) return '<article id="post-2" class="item movies"><div class="poster"><img src="https://pinoymovieshub.win/b.jpg" alt="B"></div><div class="details"><div class="title"><a href="https://pinoymovieshub.win/movies/b-2021">B</a></div><span>2021</span></div></article>';
      return '';
    }),
    TMDB_API_KEY: 'x', __nowFn: () => Date.now()
  });
  // TMDB calls will fail (offline fetch) -> rows become fallbacks; fine.
  cfg1.fetchFn = canned(u => {
    if (u === 'https://pinoymovieshub.win/genre/sexy') return fakePage();
    if (/\/genre\/sexy\/page\/2/.test(u)) return '<article id="post-2" class="item movies"><div class="poster"><img src="https://pinoymovieshub.win/b.jpg" alt="B"></div><div class="details"><div class="title"><a href="https://pinoymovieshub.win/movies/b-2021">B</a></div><span>2021</span></div></article>';
    return Promise.resolve(new Response('{}', { status: 200 }));
  });
  // simpler: wrap html fetch, pass TMDB through a rejecting fn
  cfg1.fetchFn = function (url) {
    const u = String(url);
    requested.push(u);
    if (u.indexOf('api.themoviedb.org') !== -1) return Promise.reject(new Error('offline'));
    if (u === 'https://pinoymovieshub.win/genre/sexy') return Promise.resolve(new Response(fakePage(), { status: 200 }));
    if (u.indexOf('/genre/sexy/page/2') !== -1) return Promise.resolve(new Response('<article id="post-2" class="item movies"><div class="poster"><img src="https://pinoymovieshub.win/b.jpg" alt="B"></div><div class="details"><div class="title"><a href="https://pinoymovieshub.win/movies/b-2021">B</a></div><span>2021</span></div></article>', { status: 200 }));
    return Promise.reject(new Error('offline'));
  };
  const g1 = await Core.getCatalogMetas(cfg1, def('pinoy-movies-genre'), { genre: 'Rated R' });
  ok('Rated R fetches /genre/sexy', requested.some(u => u === 'https://pinoymovieshub.win/genre/sexy'), requested.slice(0, 3));
  ok('page1 row present', g1.some(m => m.id === 'asian:pmh-a-2020'), g1.map(m => m.id));
  const g2 = await Core.getCatalogMetas(cfg1, def('pinoy-movies-genre'), { genre: 'Rated R', skip: 1 });
  ok('genre pagination page 2', requested.some(u => u.indexOf('/genre/sexy/page/2') !== -1), requested.slice(-2));
  ok('skip window returns page-2 row (stable slice)', g2.some(m => m.id === 'asian:pmh-b-2021'), g2.map(m => m.id));
}

section('kissasian hot continuation + animo pagination (canned fetch)');
{
  const requested = [];
  const cfg2 = Core.makeConfig({});
  cfg2.fetchFn = function (url) {
    const u = String(url);
    requested.push(u);
    if (u.indexOf('api.themoviedb.org') !== -1) return Promise.reject(new Error('offline'));
    const row = (slug, t) => `<article class="bs" itemscope="itemscope"><div class="bsx"> <a href="https://kissasian.cam/${slug}-episode-1/" title="${t} Episode 1"><img src="https://kissasian.cam/${slug}.jpg" title="${t} Episode 1" alt="x"/></a></div></article>`;
    if (u === 'https://kissasian.cam/') {
      return Promise.resolve(new Response('<div class="bixbox"><div class="releases hothome"><h2>Hot Series Update</h2></div><div class="listupd flex">' + row('hot-show', 'Hot Show') + '</div></div><div class="bixbox"><div class="releases latesthome"><h3>Latest Release</h3></div></div>', { status: 200 }));
    }
    if (/\/series\/\?status=&type=&order=update&page=1/.test(u)) {
      return Promise.resolve(new Response(row('update-show', 'Update Show'), { status: 200 }));
    }
    return Promise.reject(new Error('offline'));
  };
  Core.resetCaches();
  const defs = Core.catalogDefinitions();
  const hot = await Core.getCatalogMetas(cfg2, defs.find(d => d.id === 'asian-series-hot'), {});
  ok('hot page1 from home block', hot.some(m => m.id === 'asian:ks-hot-show'), hot.map(m => m.id));
  const hot2 = await Core.getCatalogMetas(cfg2, defs.find(d => d.id === 'asian-series-hot'), { skip: 1 });
  ok('hot page2 continues on order=update&page=1', requested.some(u => u.indexOf('/series/?status=&type=&order=update&page=1') !== -1), requested.slice(-3));
  ok('hot continuation rows arrive (stable slice)', hot2.some(m => m.id === 'asian:ks-update-show'), hot2.map(m => m.id));
}

section('animo order=update pagination');
{
  const requested = [];
  const cfg3 = Core.makeConfig({});
  cfg3.fetchFn = function (url) {
    const u = String(url);
    requested.push(u);
    if (u.indexOf('api.themoviedb.org') !== -1) return Promise.reject(new Error('offline'));
    const row = (slug, t) => `<article class="bs" itemscope="itemscope"><div class="bsx"> <a href="https://animotvslash.org/anime/${slug}/" title="${t}"><img src="https://animotvslash.org/${slug}.jpg" title="${t}" alt="x"/></a></div></article>`;
    if (u === 'https://animotvslash.org/anime/?status=&type=&order=update') return Promise.resolve(new Response(row('animo-a', 'A'), { status: 200 }));
    if (u === 'https://animotvslash.org/anime/?status=&type=&order=update&page=2') return Promise.resolve(new Response(row('animo-b', 'B'), { status: 200 }));
    return Promise.reject(new Error('offline'));
  };
  Core.resetCaches();
  const defs = Core.catalogDefinitions();
  const p1 = await Core.getCatalogMetas(cfg3, defs.find(d => d.id === 'animo-latest'), {});
  const p2 = await Core.getCatalogMetas(cfg3, defs.find(d => d.id === 'animo-latest'), { skip: 1 });
  ok('animo page1 parsed', p1.some(m => m.id === 'asian:an-animo-a'), p1.map(m => m.id));
  ok('animo page2 requested + stable slice returns it', requested.some(u => u.endsWith('page=2')) && p2.some(m => m.id === 'asian:an-animo-b'), p2.map(m => m.id));
}

section('kisskh list + search + type split (canned fetch)');
{
  const KH_ROWS = { datas: [
    { id: 111, title: 'K Drama Show', release_date: '2024-03-09', poster_path: '/upload/qq.jpg', episode_count: 16, type: 'TV', rate: '8.4' },
    { id: 112, title: 'H Movie', release_date: '2023-05-01', poster_path: '/upload/hw.jpg', episode_count: 1, type: 'Movie' }
  ] };
  const cfg4 = Core.makeConfig({});
  cfg4.fetchFn = function (url) {
    const u = String(url);
    if (u.indexOf('api.themoviedb.org') !== -1) return Promise.reject(new Error('offline'));
    if (u.indexOf('kisskh.nl/api/DramaList/List/') !== -1) return Promise.resolve(new Response(JSON.stringify(KH_ROWS), { status: 200 }));
    if (u.indexOf('kisskh.nl/api/DramaList/Search?q=') !== -1) return Promise.resolve(new Response(JSON.stringify([KH_ROWS.datas[0]]), { status: 200 }));
    return Promise.reject(new Error('offline'));
  };
  Core.resetCaches();
  const defs = Core.catalogDefinitions();
  const ser = await Core.getCatalogMetas(cfg4, defs.find(d => d.id === 'kisskh-latest'), {});
  ok('kisskh series catalog keeps TV rows', ser.some(m => m.id === 'asian:kh-111'), ser.map(m => m.id));
  const mov = await Core.getCatalogMetas(cfg4, defs.find(d => d.id === 'kisskh-hollywood-movies'), {});
  ok('kisskh movie catalog keeps Movie rows', mov.some(m => m.id === 'asian:kh-112'), mov.map(m => m.id));
  const srch = await Core.getCatalogMetas(cfg4, defs.find(d => d.id === 'kisskh-latest'), { search: 'k drama' });
  ok('kisskh search returns matched row', srch.some(m => m.id === 'asian:kh-111'), srch.map(m => m.id));
  ok('relative poster resolved against active host', ser[0].poster === 'https://kisskh.nl/upload/qq.jpg', ser[0].poster);
}

// ---------------------------------------------------------------- rescue
section('kisskh TMDB rescue (v4.1.0: every mirror CF-blocked)');
{
  const requested = [];
  const TV_ROWS = { results: [
    { id: 215720, name: 'Queen of Tears', original_name: '눈물의 여왕', first_air_date: '2024-03-09', poster_path: '/qot.jpg', backdrop_path: '/qotb.jpg', overview: 'A queen and her husband.', vote_average: 8.4 },
    { id: 219246, name: 'Lovely Runner', first_air_date: '2024-04-08', poster_path: '/lr.jpg', overview: 'Time travel romance.', vote_average: 8.6 }
  ] };
  const MOVIE_ROWS = { results: [
    { id: 100, title: 'Hollywood Movie', release_date: '2025-07-01', poster_path: '/hw.jpg', overview: 'Boom.', vote_average: 7.1 }
  ] };
  const MULTI_ROWS = { results: [
    { id: 215720, media_type: 'tv', name: 'Queen of Tears', first_air_date: '2024-03-09', poster_path: '/qot.jpg', overview: 'A queen.', vote_average: 8.4 },
    { id: 555, media_type: 'person', name: 'Some Actor', profile_path: '/a.jpg' }
  ] };
  const cfgR = Core.makeConfig({});
  cfgR.fetchFn = function (url) {
    const u = String(url);
    requested.push(u);
    if (u.indexOf('kisskh') !== -1) return Promise.resolve(new Response('<html>Just a moment...</html>', { status: 403 }));
    if (u.indexOf('/trending/tv/week') !== -1) return Promise.resolve(new Response(JSON.stringify(TV_ROWS), { status: 200 }));
    if (u.indexOf('/discover/tv') !== -1) return Promise.resolve(new Response(JSON.stringify(TV_ROWS), { status: 200 }));
    if (u.indexOf('/discover/movie') !== -1) return Promise.resolve(new Response(JSON.stringify(MOVIE_ROWS), { status: 200 }));
    if (u.indexOf('/search/multi') !== -1) return Promise.resolve(new Response(JSON.stringify(MULTI_ROWS), { status: 200 }));
    return Promise.reject(new Error('offline'));
  };
  Core.resetCaches();
  Core.kisskhRescueState.engaged = false;
  const defs = Core.catalogDefinitions();

  const kd = await Core.getCatalogMetas(cfgR, defs.find(d => d.id === 'kisskh-top-kdrama'), {});
  ok('kdrama rescue: populated', kd.length === 2, kd.map(m => m.id));
  ok('kdrama rescue: real tmdb: ids', kd.every(m => /^tmdb:\d+$/.test(m.id)), kd.map(m => m.id));
  ok('kdrama rescue: full metadata', kd[0].description === 'A queen and her husband.' && kd[0].releaseInfo === '2024' && kd[0].imdbRating === 8.4 && kd[0].poster.indexOf('image.tmdb.org') !== -1 && !!kd[0].background, kd[0]);
  ok('rescue state engaged', Core.kisskhRescueState.engaged === true && Core.kisskhRescueState.catalog === 'kisskh-top-kdrama');

  const reqUrl = requested.find(u => u.indexOf('/discover/tv') !== -1) || '';
  ok('kdrama rescue URL: origin KR + popularity', /with_origin_country=KR&sort_by=popularity\.desc&include_null_first_air_dates=false/.test(reqUrl), reqUrl);

  const mv = await Core.getCatalogMetas(cfgR, defs.find(d => d.id === 'kisskh-hollywood-movies'), {});
  ok('hollywood-movies rescue: movie rows', mv.length === 1 && mv[0].type === 'movie' && mv[0].id === 'tmdb:100', mv.map(m => m.id));
  ok('hollywood-movies rescue URL: discover/movie origin US', requested.some(u => u.indexOf('/discover/movie?') !== -1 && u.indexOf('with_origin_country=US') !== -1));

  const up = await Core.getCatalogMetas(cfgR, defs.find(d => d.id === 'kisskh-upcoming'), {});
  const upUrl = requested.find(u => u.indexOf('first_air_date.gte=') !== -1) || '';
  ok('upcoming rescue URL: future first_air_date.gte', /first_air_date\.gte=\d{4}-\d{2}-\d{2}/.test(upUrl) && upUrl.indexOf('with_origin_country=KR%7CCN%7CTW%7CHK') !== -1, upUrl);
  ok('upcoming rescue: rows served', up.length === 2, up.map(m => m.id));

  const srch = await Core.getCatalogMetas(cfgR, defs.find(d => d.id === 'kisskh-latest'), { search: 'queen of tears' });
  ok('search rescue: /search/multi used', requested.some(u => u.indexOf('/search/multi?') !== -1 && u.indexOf('query=queen%20of%20tears') !== -1));
  ok('search rescue: person rows dropped, tv kept', srch.length === 1 && srch[0].id === 'tmdb:215720', srch.map(m => m.id));

  const failCfg = Core.makeConfig({});
  failCfg.fetchFn = function () { return Promise.reject(new Error('down')); };
  const empty = await Core.kisskhPageMetas(failCfg, defs.find(d => d.id === 'kisskh-anime'), 1, {});
  ok('total failure stays fail-soft (empty, not 500)', Array.isArray(empty) && empty.length === 0, empty);
}

// ---------------------------------------------------------------- routing
section('handle(): routing + extras');
{
  const r404 = await Core.handle('/catalog/series/nope.json', {});
  ok('unknown catalog 404', r404.status === 404);
  const rJson = await Core.handle('/manifest.json', {});
  const man = await rJson.json();
  ok('manifest served', man.version === '4.1.0' && man.catalogs.length === 21);
  const health = await (await Core.handle('/health', {})).json();
  ok('health shape', !!health.status && typeof health.sources === 'object');
  ok('health probes 6 sources', Object.keys(health.sources).length === 6, Object.keys(health.sources));
  ok('health kisskh probe reports mode', health.sources.kisskh && (health.sources.kisskh.mode === 'api' || health.sources.kisskh.mode === 'tmdb-rescue'), health.sources.kisskh);
}

console.log(`\n${pass} pass / ${fail} fail`);
process.exit(fail === 0 ? 0 : 1);
})();
