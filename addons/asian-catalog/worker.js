/**
 * Asian Catalog — Cloudflare Worker entry
 *
 * Deploy option A (wrangler):   npx wrangler deploy   (from this folder)
 * Deploy option B (dashboard):  paste worker-bundle.js (single-file build of
 *                               this entry + core.js) into a new Worker.
 *
 * Optional env/secret: TMDB_API_KEY, PINOY_SITE, KISSASIAN_SITE, VIEWASIAN_SITE,
 *                      ASIAN_PAGE_LIMIT, ASIAN_MAX_PAGES, ASIAN_KEEP_UNMATCHED
 *
 * v3.1.0: POST /relay — host-allowlisted binary relay used by Nuvio plugins
 * (cinejoy) whose device runtimes cannot POST binary / read binary replies.
 */

import './core.js';

const Core = globalThis.AsianCatalogCore;

export default {
  async fetch(request, env) {
    const cors = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': '*',
      'Access-Control-Max-Age': '86400'
    };
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors });
    }
    try {
      const url = new URL(request.url);
      if (request.method === 'POST' && url.pathname.replace(/\/+$/, '') === '/relay') {
        const response = await Core.relayHandler(request, env || {});
        const headers = new Headers(response.headers);
        Object.keys(cors).forEach(k => headers.set(k, cors[k]));
        return new Response(response.body, { status: response.status, headers });
      }
      if (request.method !== 'GET' && request.method !== 'HEAD') {
        return new Response(JSON.stringify({ error: 'method not allowed' }), {
          status: 405,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
      }
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
