'use strict';

/* Live smoke test for non-anime providers. It reports rows/errors/timeouts but
 * never prints the TMDB key or stream URLs. A zero-row result is not treated
 * as a provider failure: a source may simply not carry the requested title.
 */
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'manifest.json'), 'utf8'));
const providersDir = path.join(root, 'providers');
const targets = [
  { label: 'Spider-Man: Brand New Day', id: '969681', type: 'movie' },
  { label: 'Wednesday S1E1', id: '119051', type: 'tv', season: 1, episode: 1 }
];
const maxMs = 25000;
const concurrency = 6;

function timeout(ms) {
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve({ timeout: true }), ms);
    if (timer && typeof timer.unref === 'function') timer.unref();
  });
}

async function probe(scraper, target) {
  const started = Date.now();
  let provider;
  try {
    provider = require(path.join(root, scraper.filename));
    if (!provider || typeof provider.getStreams !== 'function') {
      return { provider: scraper.id, target: target.label, status: 'no-export', ms: Date.now() - started };
    }
    const args = [target.id, target.type];
    if (target.type === 'tv') args.push(target.season, target.episode);
    const result = await Promise.race([
      Promise.resolve().then(() => provider.getStreams(...args)),
      timeout(maxMs)
    ]);
    if (result && result.timeout) return { provider: scraper.id, target: target.label, status: 'timeout', ms: Date.now() - started };
    const rows = Array.isArray(result) ? result : [];
    const playable = rows.filter((row) => row && /^https?:\/\//i.test(String(row.url || row.playlist || '')));
    return {
      provider: scraper.id,
      target: target.label,
      status: playable.length ? 'rows' : 'empty',
      rows: playable.length,
      ms: Date.now() - started
    };
  } catch (error) {
    return { provider: scraper.id, target: target.label, status: 'error', error: String(error && error.message || error).slice(0, 160), ms: Date.now() - started };
  }
}

async function main() {
  const scrapers = (manifest.scrapers || []).filter((s) =>
    s.enabled !== false && !(s.supportedTypes || []).includes('anime'));
  const jobs = [];
  for (const scraper of scrapers) for (const target of targets) jobs.push({ scraper, target });
  const out = [];
  let next = 0;
  async function worker() {
    while (next < jobs.length) {
      const job = jobs[next++];
      out.push(await probe(job.scraper, job.target));
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, jobs.length) }, worker));
  out.sort((a, b) => a.provider.localeCompare(b.provider) || a.target.localeCompare(b.target));
  for (const row of out) console.log(JSON.stringify(row));
  const counts = out.reduce((m, row) => { m[row.status] = (m[row.status] || 0) + 1; return m; }, {});
  console.log('summary ' + JSON.stringify({ providers: scrapers.length, probes: out.length, statuses: counts }));
}

main().catch((error) => { console.error(String(error)); process.exitCode = 1; });
