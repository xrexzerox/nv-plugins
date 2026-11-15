'use strict';

/*
 * Inject the manually supplied TMDB v3 key into TMDB-related provider lines.
 * The Nuvio runtime loads each provider as a standalone JavaScript file, so
 * this is a build-time maintenance tool rather than a runtime require().
 */
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const keyFile = path.join(root, 'config', 'tmdb-key.local.txt');
const providersDir = path.join(root, 'providers');
if (!fs.existsSync(keyFile)) {
  console.error('Missing config/tmdb-key.local.txt. Copy config/tmdb-key.example.txt first.');
  process.exit(1);
}

const key = fs.readFileSync(keyFile, 'utf8').trim();
if (!/^[a-f0-9]{32}$/i.test(key)) {
  console.error('TMDB key must be a 32-character hexadecimal v3 API key.');
  process.exit(1);
}

const literal = /(["'])([a-f0-9]{32})\1/gi;
let files = 0;
let replacements = 0;
for (const name of fs.readdirSync(providersDir).filter((n) => n.endsWith('.js')).sort()) {
  const full = path.join(providersDir, name);
  const before = fs.readFileSync(full, 'utf8');
  const lines = before.split(/\r?\n/);
  let changed = 0;
  const after = lines.map((line) => {
    if (!/(TMDB|themoviedb\.org|api_key)/i.test(line)) return line;
    return line.replace(literal, (all, quote, old) => {
      if (old.toLowerCase() === key.toLowerCase()) return all;
      changed++;
      return quote + key + quote;
    });
  }).join('\n');
  if (changed) {
    fs.writeFileSync(full, after);
    files++;
    replacements += changed;
    console.log(`${name}: ${changed} TMDB literal(s) updated`);
  }
}
console.log(`Updated ${replacements} TMDB literal(s) in ${files} provider file(s).`);
