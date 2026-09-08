#!/usr/bin/env node
/**
 * PinoyHub Catalog — zero-dependency Node server (Node >= 18)
 *
 * Usage:
 *   node server.js                    # listens on 8787
 *   PORT=3000 node server.js          # custom port
 *
 * Optional env:
 *   TMDB_API_KEY          custom TMDB v3 key (a default ecosystem key is embedded)
 *   PINOYHUB_SITE         alternate site base (default https://pinoymovieshub.win)
 *   PINOYHUB_PAGE_LIMIT   resolved items per response (default 20, max 50)
 *   PINOYHUB_KEEP_UNMATCHED  "=1" keeps titles that fail TMDB matching
 *                         (ids become pinoyhub:<slug>; detail/stream support
 *                         is limited for those)
 *
 * Then add  http://<host>:<port>/manifest.json  in Nuvio (Settings -> Addons).
 */

'use strict';

require('./core.js');

const Core = globalThis.PinoyHubCatalogCore;
const http = require('http');

const PORT = parseInt(process.env.PORT, 10) || 8787;
const env = Object.assign({}, process.env);
env.__selfUrl = process.env.SELF_URL || `http://localhost:${PORT}`;

const server = http.createServer((req, res) => {
  let body = '';
  let aborted = false;

  const finish = async () => {
    try {
      if (req.method === 'OPTIONS') {
        res.writeHead(204, {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': '*',
          'Access-Control-Max-Age': '86400'
        });
        res.end();
        return;
      }
      const response = await Core.handle(req.url, env);
      const headers = {};
      response.headers.forEach((v, k) => { headers[k] = v; });
      const text = await response.text();
      if (aborted) return;
      res.writeHead(response.status, headers);
      if (req.method === 'HEAD') res.end();
      else res.end(text);
    } catch (err) {
      if (aborted) return;
      res.writeHead(500, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
      res.end(JSON.stringify({ error: String((err && err.message) || err) }));
    }
  };

  req.on('error', () => { aborted = true; });
  res.on('close', () => { aborted = true; });
  finish();
});

server.listen(PORT, () => {
  console.log(`[pinoyhub-catalog] listening on http://0.0.0.0:${PORT}`);
  console.log(`[pinoyhub-catalog] manifest: ${env.__selfUrl}/manifest.json`);
});
