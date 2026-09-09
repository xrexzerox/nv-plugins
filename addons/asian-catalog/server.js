#!/usr/bin/env node
/**
 * Asian Catalog — zero-dependency Node server (Node >= 18)
 *
 * Usage:
 *   node server.js                    # listens on 8787
 *   PORT=3000 node server.js          # custom port
 *
 * Optional env:
 *   TMDB_API_KEY            custom TMDB v3 key (a default ecosystem key is embedded)
 *   PINOY_SITE              alternate pinoymovieshub base (default https://pinoymovieshub.win)
 *   KISSASIAN_SITE          alternate kissasian base (default https://kissasian.cam)
 *   VIEWASIAN_SITE          alternate viewasian base (default https://viewasian.lol)
 *   ASIAN_PAGE_LIMIT        resolved items per response (default 20, max 50)
 *   ASIAN_MAX_PAGES         max source pages consumed per catalog buffer
 *   ASIAN_KEEP_UNMATCHED    "=0" drops titles that fail TMDB matching instead
 *                           of showing them as asian:<slug> fallback rows
 *
 * v3.1.0: POST /relay supported here too (host-allowlisted binary relay used
 * by the cinejoy plugin when its "Worker Relay" setting points at this URL).
 *
 * Then add  http://<host>:<port>/manifest.json  in Nuvio (Settings -> Addons).
 */

'use strict';

require('./core.js');

const Core = globalThis.AsianCatalogCore;
const http = require('http');

const PORT = parseInt(process.env.PORT, 10) || 8787;
const env = Object.assign({}, process.env);
env.__selfUrl = process.env.SELF_URL || `http://localhost:${PORT}`;

const server = http.createServer((req, res) => {
  let aborted = false;

  const finish = async () => {
    try {
      if (req.method === 'OPTIONS') {
        res.writeHead(204, {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': '*',
          'Access-Control-Max-Age': '86400'
        });
        res.end();
        return;
      }
      let response;
      if (req.method === 'POST' && req.url.replace(/\/+$/, '').split('?')[0] === '/relay') {
        const chunks = [];
        for await (const ch of req) chunks.push(ch);
        const bodyText = Buffer.concat(chunks).toString('utf8');
        const fakeReq = {
          method: 'POST',
          text: async () => bodyText
        };
        response = await Core.relayHandler(fakeReq, env);
      } else {
        response = await Core.handle(req.url, env);
      }
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
  console.log(`[asian-catalog] listening on http://0.0.0.0:${PORT}`);
  console.log(`[asian-catalog] manifest: ${env.__selfUrl}/manifest.json`);
  console.log(`[asian-catalog] health:   ${env.__selfUrl}/health`);
});
