/**
 * Asian Catalog — Cloudflare Worker entry
 *
 * Deploy option A (wrangler):   npx wrangler deploy   (from this folder)
 * Deploy option B (dashboard):  paste worker-bundle.js (single-file build of
 *                               this entry + core.js) into a new Worker.
 *
 * Optional env/secret: TMDB_API_KEY, PINOYHUB_SITE, PINOYHUB_PAGE_LIMIT,
 *                      PINOYHUB_KEEP_UNMATCHED, PINOYHUB_MAX_PAGES
 */

import './core.js';

const Core = globalThis.AsianCatalogCore;

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': '*',
          'Access-Control-Max-Age': '86400'
        }
      });
    }
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return new Response(JSON.stringify({ error: 'method not allowed' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }
    try {
      const url = new URL(request.url);
      const response = await Core.handle(url.toString(), env);
      if (request.method === 'HEAD') {
        return new Response(null, { status: response.status, headers: response.headers });
      }
      return response;
    } catch (err) {
      return new Response(JSON.stringify({ error: String((err && err.message) || err) }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }
  }
};
