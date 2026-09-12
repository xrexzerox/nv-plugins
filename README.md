# NV Plugins

Clean Nuvio provider collection migrated from the canonical NVV provider set.

The import workflow keeps only the canonical provider implementations registered in `manifest.json`.

## Addons

Besides QuickJS stream plugins, this repo ships an HTTP **catalog addon** (Stremio protocol) — Nuvio plugins can only provide streams, catalogs must be served over HTTP:

- **[`addons/pinoyhub-catalog/`](addons/pinoyhub-catalog/README.md)** — "PinoyHub Catalog": browse Pinoy movies and Tagalog-dubbed series from pinoymovieshub.win on Nuvio's Home / Discover / Search. Resolves every title to a TMDB id and pairs with the PinoyMoviesHub plugin for playback. Deployable as a Cloudflare Worker (paste `worker-bundle.js` into the dashboard) or a zero-dependency Node server (`node server.js`), then add `https://<host>/manifest.json` under Settings → Addons.
- **[`addons/asian-catalog/`](addons/asian-catalog/README.md)** — "Asian Catalog" (v5.6.0, repo 4.18.0): the site-mirrored directory for pinoymovieshub.win, kissasian.cam, viewasian.lol, kisskh, animotvslash.org, the Anikoto API and pencurimovie.baby — 28 catalogs (Pencuri Movies / Series / Malaysia / Indonesia / Japan / Thailand / Most Viewed / Most Rating / Top IMDb included). Anime rows carry `mal:`/`anikoto:` ids played by the miruro plugin; Pencuri rows are played by pencuri.js v1.4.0, which now attaches **English subtitles** (opensubtitles-v3) to every stream. v5.6.0 adds a `POST /cjg` relay (text-safe binary hop for cinejoy.js v1.5.0 on NuvioMobile). Deploy the CF worker from `addons/asian-catalog/` (`worker-bundle.js`), add `https://<host>/manifest.json` under Settings → Addons; cinejoy users also paste the worker base URL into the provider's "Cinejoy relay base URL" setting.

