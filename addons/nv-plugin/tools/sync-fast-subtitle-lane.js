'use strict';

/* Keep the universal subtitle lane best-effort. Stream extraction must not
 * wait on a subtitle service that is slow or blocked on the device network. */
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'manifest.json'), 'utf8'));
const providersDir = path.join(root, 'providers');
const old = `    var subsP = lane.get(tmdbId, mediaType, season, episode).catch(function () { return []; });
    return Promise.all([rowsP.catch(function () { return []; }), subsP]).then(function (arr) {`;
const next = `    var subsP = lane.get(tmdbId, mediaType, season, episode).catch(function () { return []; });
    // Captions are optional. Give OSV3 a short head start, then return the
    // provider's playable rows even if the subtitle service is unavailable.
    var subsFastP;
    if (typeof setTimeout === "function" && typeof Promise !== "undefined" && Promise.race) {
      var subsTimer = null;
      var subsFallback = new Promise(function (resolve) {
        subsTimer = setTimeout(function () { resolve([]); }, 1200);
        if (subsTimer && typeof subsTimer.unref === "function") subsTimer.unref();
      });
      subsFastP = Promise.race([subsP, subsFallback]).then(function (value) {
        if (subsTimer != null && typeof clearTimeout === "function") clearTimeout(subsTimer);
        return value;
      }, function () {
        if (subsTimer != null && typeof clearTimeout === "function") clearTimeout(subsTimer);
        return [];
      });
    } else {
      subsFastP = Promise.resolve([]);
    }
    return Promise.all([rowsP.catch(function () { return []; }), subsFastP]).then(function (arr) {`;

let changed = 0;
for (const scraper of manifest.scrapers || []) {
  if ((scraper.supportedTypes || []).includes('anime')) continue;
  const filename = path.join(root, scraper.filename);
  if (!fs.existsSync(filename)) continue;
  const source = fs.readFileSync(filename, 'utf8');
  if (!source.includes(old)) continue;
  fs.writeFileSync(filename, source.split(old).join(next));
  changed++;
  console.log(`${scraper.id}: fast subtitle lane synced`);
}
console.log(`Synced ${changed} non-anime provider file(s).`);
