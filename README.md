# NV Plugins

Clean Nuvio provider collection migrated from the canonical NVV provider set.

The import workflow keeps only the canonical provider implementations registered in `manifest.json`.

## Addons

Besides QuickJS stream plugins, this repo ships an HTTP **catalog addon** (Stremio protocol) — Nuvio plugins can only provide streams, catalogs must be served over HTTP:

- **[`addons/pinoyhub-catalog/`](addons/pinoyhub-catalog/README.md)** — "PinoyHub Catalog": browse Pinoy movies and Tagalog-dubbed series from pinoymovieshub.win on Nuvio's Home / Discover / Search. Resolves every title to a TMDB id and pairs with the PinoyMoviesHub plugin for playback. Deployable as a Cloudflare Worker (paste `worker-bundle.js` into the dashboard) or a zero-dependency Node server (`node server.js`), then add `https://<host>/manifest.json` under Settings → Addons.

