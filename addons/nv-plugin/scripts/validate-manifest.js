#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const root = path.resolve(__dirname, '..');
const manifestPath = path.join(root, 'manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

if (!Array.isArray(manifest.scrapers)) {
  throw new Error('manifest.json: scrapers must be an array');
}

const seen = new Set();
const errors = [];
const warnings = [];

for (const scraper of manifest.scrapers) {
  const id = String(scraper.id || '').trim();
  const key = id.toLowerCase();
  const filename = String(scraper.filename || '').trim();

  if (!id) {
    errors.push('Entry missing id');
    continue;
  }
  if (seen.has(key)) {
    errors.push(`Duplicate scraper id: ${id}`);
  }
  seen.add(key);

  if (!filename) {
    errors.push(`${id}: missing filename`);
    continue;
  }

  const absolute = path.resolve(root, filename);
  if (!absolute.startsWith(root + path.sep) || !fs.existsSync(absolute)) {
    errors.push(`${id}: missing or unsafe filename ${filename}`);
    continue;
  }

  if (!filename.toLowerCase().endsWith('.js')) {
    errors.push(`${id}: filename is not JavaScript: ${filename}`);
    continue;
  }

  const source = fs.readFileSync(absolute, 'utf8');
  if (!/getStreams\s*=|function\s+getStreams\s*\(|getStreams\s*:\s*getStreams/.test(source)) {
    warnings.push(`${id}: getStreams export/function not detected by static scan`);
  }

  try {
    execFileSync(process.execPath, ['--check', absolute], { stdio: 'pipe' });
  } catch (err) {
    errors.push(`${id}: JavaScript syntax check failed`);
  }
}

if (!manifest.name || manifest.name !== 'NV Plugins') {
  warnings.push('manifest name is not "NV Plugins"');
}

console.log(`Manifest: ${manifestPath}`);
console.log(`Providers: ${manifest.scrapers.length}`);
console.log(`Unique IDs: ${seen.size}`);
console.log(`Warnings: ${warnings.length}`);
console.log(`Errors: ${errors.length}`);
for (const warning of warnings) console.log(`WARN  ${warning}`);
for (const error of errors) console.log(`ERROR ${error}`);

if (errors.length) process.exit(1);
