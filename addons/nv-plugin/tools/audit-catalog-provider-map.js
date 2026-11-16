/*
 * Static catalog/provider wiring audit.
 *
 * This deliberately does not call upstream sites or print the local TMDB key.
 * It checks the contracts that must be correct before a live stream test is
 * meaningful: catalog source ownership, manifest filenames, media types, and
 * direct-id routing boundaries.
 */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const catalogRoot = path.resolve(root, '..', 'asian-catalog');
const catalogManifest = JSON.parse(fs.readFileSync(path.join(catalogRoot, 'manifest.json'), 'utf8'));
const pluginManifest = JSON.parse(fs.readFileSync(path.join(root, 'manifest.json'), 'utf8'));

const expectedCatalogs = {
  'pinoy-movies': { provider: 'pinoymovieshub', types: ['movie'] },
  'pinoy-series': { provider: 'pinoymovieshub', types: ['series'] },
  'asian-series-hot': { provider: 'asianhub', types: ['series'] },
  'asian-series': { provider: 'asianhub', types: ['series'] },
  'asian-series-genre': { provider: 'asianhub', types: ['series'] },
  'asian-series-viewasian': { provider: 'asianhub', types: ['series'] },
  'kisskh-latest': { provider: 'asianhub', types: ['series'] },
  'kisskh-top-kdrama': { provider: 'asianhub', types: ['series'] },
  'kisskh-top-cdrama': { provider: 'asianhub', types: ['series'] },
  'kisskh-hollywood': { provider: 'asianhub', types: ['series'] },
  'kisskh-hollywood-movies': { provider: 'asianhub', types: ['movie'] },
  'kisskh-anime': { provider: 'asianhub', types: ['series'] },
  'kisskh-upcoming': { provider: 'asianhub', types: ['series'] },
  'animo-latest': { provider: 'animotvslash', types: ['series'] },
  'animo-movies': { provider: 'animotvslash', types: ['movie'] },
  'pencuri-movies': { provider: 'pencuri', types: ['movie'] },
  'pencuri-series': { provider: 'pencuri', types: ['series'] },
  'pencuri-malaysia': { provider: 'pencuri', types: ['movie'] },
  'pencuri-indonesia': { provider: 'pencuri', types: ['movie'] },
  'pencuri-japan': { provider: 'pencuri', types: ['movie'] },
  'pencuri-thailand': { provider: 'pencuri', types: ['movie'] },
  'pencuri-most-viewed': { provider: 'pencuri', types: ['movie'] },
  'pencuri-most-rating': { provider: 'pencuri', types: ['movie'] },
  'pencuri-top-imdb': { provider: 'pencuri', types: ['movie'] },
  'anikoto-latest-episode': { provider: 'miruro', types: ['series'] },
  'anikoto-new-release': { provider: 'miruro', types: ['series'] },
  'anikoto-new-added': { provider: 'miruro', types: ['series'] },
  'anikoto-just-completed': { provider: 'miruro', types: ['series'] }
};

const checks = [];
function pass(name, detail) { checks.push({ ok: true, name, detail }); }
function fail(name, detail) { checks.push({ ok: false, name, detail }); }
function requireCheck(condition, name, detail) {
  if (condition) pass(name, detail); else fail(name, detail);
}

const catalogs = catalogManifest.catalogs || [];
const catalogById = new Map(catalogs.map((c) => [c.id, c]));
requireCheck(catalogs.length === Object.keys(expectedCatalogs).length,
  'catalog count', `${catalogs.length} declared; ${Object.keys(expectedCatalogs).length} expected`);

for (const [id, expected] of Object.entries(expectedCatalogs)) {
  const catalog = catalogById.get(id);
  requireCheck(!!catalog, `catalog exists: ${id}`, 'manifest entry present');
  if (!catalog) continue;
  requireCheck(expected.types.includes(catalog.type), `catalog type: ${id}`, `${catalog.type} -> ${expected.types.join('|')}`);
}
for (const catalog of catalogs) {
  requireCheck(!!expectedCatalogs[catalog.id], `catalog is audited: ${catalog.id}`, 'known source mapping');
}

const scraperById = new Map((pluginManifest.scrapers || []).map((s) => [s.id, s]));
const providerText = new Map();
for (const scraper of pluginManifest.scrapers || []) {
  const filename = path.join(root, scraper.filename);
  const exists = fs.existsSync(filename);
  requireCheck(exists, `provider file: ${scraper.id}`, scraper.filename);
  if (exists) providerText.set(scraper.id, fs.readFileSync(filename, 'utf8'));
}

for (const [id, expected] of Object.entries(expectedCatalogs)) {
  const scraper = scraperById.get(expected.provider);
  requireCheck(!!scraper, `provider manifest: ${expected.provider}`, 'scraper id present');
  if (!scraper) continue;
  const requiredTypes = expected.types.map((t) => t === 'series' ? 'tv' : t);
  requireCheck(requiredTypes.every((type) => (scraper.supportedTypes || []).includes(type)),
    `provider media types: ${id}`, `${expected.provider} supports ${(scraper.supportedTypes || []).join('|')}`);
}

const directOwners = [
  ['asian:pmh-', 'pinoymovieshub'],
  ['asian:pen-', 'pencuri'],
  ['asian:ks-', 'asianhub'],
  ['asian:va-', 'asianhub'],
  ['asian:kh-', 'asianhub'],
  ['asian:an-', 'animotvslash'],
  ['mal:', 'miruro'],
  ['anilist:', 'miruro'],
  ['kitsu:', 'miruro'],
  ['anikoto:', 'miruro']
];
for (const [prefix, provider] of directOwners) {
  const text = providerText.get(provider) || '';
  requireCheck(text.includes(prefix), `direct route marker: ${prefix}`, `${provider} declares ownership`);
}

// Providers that advertise anime must not be accidentally treated as the
// non-anime boundary set. The boundary script itself is the source of truth.
const boundary = fs.readFileSync(path.join(root, 'tools', 'sync-provider-boundary.js'), 'utf8');
for (const scraper of pluginManifest.scrapers || []) {
  const isAnime = (scraper.supportedTypes || []).includes('anime');
  const hasBoundary = providerText.get(scraper.id)?.includes('BEGIN NV_NON_ANIME_PROVIDER_BOUNDARY') || false;
  requireCheck(isAnime ? !hasBoundary : hasBoundary,
    `anime boundary: ${scraper.id}`, isAnime ? 'anime-capable provider excluded' : 'non-anime provider guarded');
}
requireCheck(boundary.includes('asian:pmh-') && boundary.includes('asian:pen-') &&
  boundary.includes('asian:(?:ks|va|kh)-') && boundary.includes('!owner || owner !== PROVIDER_ID'),
  'central direct-id owner table', 'non-anime source prefixes are represented and unknown/anime ids are rejected');

const failures = checks.filter((c) => !c.ok);
for (const check of checks) console.log(`${check.ok ? 'PASS' : 'FAIL'} ${check.name} — ${check.detail}`);
console.log(`\nSummary: ${checks.length - failures.length}/${checks.length} checks passed; ${failures.length} failed.`);
if (failures.length) process.exitCode = 1;
