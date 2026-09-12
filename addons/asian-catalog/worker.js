/**
 * Asian Catalog — Cloudflare Worker entry
 *
 * Deploy option A (wrangler):   npx wrangler deploy   (from this folder)
 * Deploy option B (dashboard):  paste worker-bundle.js (single-file build of
 *                               this entry + core.js) into a new Worker.
 *
 * Optional env/secret: TMDB_API_KEY, PINOY_SITE, KISSASIAN_SITE, VIEWASIAN_SITE,
 *                      ASIAN_PAGE_LIMIT, ASIAN_MAX_PAGES, ASIAN_KEEP_UNMATCHED
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
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': '*',
          'Access-Control-Max-Age': '86400'
        }
      });
    }
    // v5.6.0: POST /cjg - cinejoy /g binary relay (cinejoy.js v1.5.0+ on
    // NuvioMobile sends the encrypted token as base64url text; this performs
    // the real octet-stream POST server-side). Everything else stays GET-only.
    if (request.method === 'POST') {
      let path = '';
      try { path = new URL(request.url).pathname.replace(/\/+$/, '') || '/'; } catch (e) { path = '/'; }
      if (path === '/cjg') {
        try {
          const relayResponse = await Core.cinejoyRelay(request);
          const newHeaders = new Headers(relayResponse.headers);
          newHeaders.set('Access-Control-Allow-Origin', '*');
          return new Response(relayResponse.body, { status: relayResponse.status, headers: newHeaders });
        } catch (err) {
          return new Response(JSON.stringify({ ok: false, error: String((err && err.message) || err) }), {
            status: 500,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
          });
        }
      }
      return new Response(JSON.stringify({ error: 'method not allowed' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
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
