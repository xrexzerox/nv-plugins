'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const providers = path.join(__dirname, 'providers');
const begin = '/* BEGIN NV_NON_ANIME_PROVIDER_BOUNDARY */';
const end = '/* END NV_NON_ANIME_PROVIDER_BOUNDARY */';
const source = fs.readFileSync(path.join(providers, 'pinoyhub.js'), 'utf8');
const start = source.indexOf(begin);
const finish = source.indexOf(end) + end.length;
assert(start >= 0 && finish > start, 'boundary marker missing');
const boundary = source.slice(start, finish);

function load(original, immediateTimers) {
  const context = vm.createContext({
    module: { exports: { getStreams: original } },
    Promise,
    console: { log() {}, warn() {}, error() {} },
    fetch: async () => ({ ok: false, json: async () => ({}) }),
    setTimeout: immediateTimers
      ? (fn, delay) => { if (delay >= 22000) fn(); return 1; }
      : setTimeout,
    clearTimeout: () => {}
  });
  new vm.Script(boundary).runInContext(context);
  return context.module.exports.getStreams;
}

(async () => {
  let calls = [];
  const getStreams = load(function () {
    calls.push(Array.from(arguments));
    return [
      { url: 'https://media.fixture.test/master.m3u8', title: 'one' },
      { url: 'https://media.fixture.test/master.m3u8', title: 'duplicate' },
      { url: 'javascript:alert(1)', title: 'invalid' }
    ];
  });
  const rows = await getStreams('tmdb:123', 'movie');
  assert.equal(rows.length, 1);
  assert.deepEqual(calls[0], ['123', 'movie', null, null]);

  calls = [];
  const routed = await getStreams('asian:pen-wrong-owner', 'movie');
  assert.equal(JSON.stringify(routed), '[]');
  assert.equal(calls.length, 0);

  const timed = load(() => new Promise(() => {}), true);
  assert.equal(JSON.stringify(await timed('123', 'movie')), '[]');
  console.log('[non-anime-boundary] 3 checks passed');
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
