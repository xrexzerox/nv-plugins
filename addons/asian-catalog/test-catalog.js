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
  async function router(url, opts) {
    calls.push(String(url));
    const u = String(url);
    const respond = (body, status) => ({
      ok: (status || 200) >= 200 && (status || 200) < 300,
      status: status || 200,
      text: async () => typeof body === 'string' ? body : JSON.stringify(body),
      json: async () => typeof body === 'string' ? JSON.parse(body) : body
    });

    // pinoy archive/search/genre pages (search has ?s= and must be checked first)
    if (u.indexOf(PINOY) === 0) {
      let page = 1;
      const mp = u.match(/\/page\/(\d+)/);
      if (mp) page = parseInt(mp[1], 10);
      const mq = u.match(/[?&]s=([^&]*)/);
      if (mq) return respond(pinoySearchHtml(page, decodeURIComponent(mq[1])));
      const pathOnly = u.split('?')[0];
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

    // kissasian (dramastream HTML)
    if (u.indexOf(KS) === 0) {
      const pathOnly = u.split('?')[0];
      if (/\/genres\/romance\/?$/.test(pathOnly)) return respond(KS_GENRE_ROMANCE_HTML);
      if (/\/genres\//.test(pathOnly)) return respond(KS_GENRE_OTHER_HTML);
      if (/\/genres\/romance\/page\/2/.test(pathOnly)) return respond('<html>404</html>', 404);
      const mq = u.match(/[?&]s=([^&]*)/);
      if (mq) return respond(KS_SEARCH_HTML);
      const mp = u.match(/\/page\/(\d+)/);
      const page = mp ? parseInt(mp[1], 10) : 1;
      return respond(KS_PAGE[String(page)] || '', page <= 2 ? 200 : 404);
    }

    // viewasian (viewasian theme HTML)
    if (u.indexOf(VA) === 0) {
      const pathOnly = u.split('?')[0];
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

    // TMDB
    if (u.indexOf('https://api.themoviedb.org/3/') === 0) {
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
    check('version 3.0.0', man.version === '3.0.0', man.version);
    check('resources catalog-only', JSON.stringify(man.resources) === '["catalog"]');
    check('idPrefixes tmdb+asian', JSON.stringify(man.idPrefixes) === '["tmdb:","asian:"]', man.idPrefixes);
    check('11 catalogs', man.catalogs.length === 11, man.catalogs.length);
    const ids = man.catalogs.map(c => c.id);
    check('unique ids', new Set(ids).size === ids.length);
    check('pinoy group first', ids.slice(0, 4).join(',') === 'pinoy-movies,pinoy-series,pinoy-movies-genre,pinoy-series-genre', ids.slice(0, 4));
    check('kissasian group middle', ids.slice(4, 6).join(',') === 'asian-series,asian-series-genre', ids.slice(4, 6));
    check('viewasian group next', ids.slice(6, 8).join(',') === 'asian-series-viewasian,asian-series-viewasian-genre', ids.slice(6, 8));
    check('tmdb group last', ids.slice(8).join(',') === 'asian-movies,asian-series-trending,asian-movies-genre', ids.slice(8));
    const animeDef = Core.catalogDefinitions().find(d => d.id === 'anime-latest');
    check('anime-latest REMOVED (user request)', !animeDef, animeDef);
    const matvDef = Core.catalogDefinitions().find(d => d.source === 'myasiantv');
    check('myasiantv source REMOVED', !matvDef);
    const typesOk = man.catalogs.every(c => c.type === 'movie' || c.type === 'series');
    check('all catalogs typed movie/series', typesOk);
    const searchOk = man.catalogs.every(c => {
      const def = Core.catalogDefinitions().find(d => d.id === c.id);
      return def.mode === 'archive'
        ? c.extra.some(e => e.name === 'search')
        : c.extra.some(e => e.name === 'genre');
    });
    check('archive catalogs searchable, genre catalogs chipped', searchOk);
    const skipOk = man.catalogs.every(c => c.extra.some(e => e.name === 'skip'));
    check('every catalog declares skip (pagination)', skipOk);
    const genreCats = man.catalogs.filter(c => c.id.endsWith('-genre'));
    check('5 genre catalogs with options', genreCats.length === 5 && genreCats.every(c => (c.extra.find(e => e.name === 'genre') || {}).options && c.extra.find(e => e.name === 'genre').options.length > 5));
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
    check('unmatched search rows stay visible as asian:', r.body.metas.some(m => m.id === 'asian:queen-seon-duk'), r.body.metas.map(m => m.id));

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
    check('health echoes version', h.body.version === '3.0.0' && h.body.addon === 'community.asian.catalog');

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
    // html index renders catalog table
    const resHtml = await Core.handle('/', env);
    const html = await resHtml.text();
    check('index lists all 11 catalogs', (html.match(/\/catalog\//g) || []).length >= 11);
    check('index links /health', html.indexOf('/health') !== -1);
    check('index mentions viewasian catalog', html.indexOf('asian-series-viewasian') !== -1);
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
