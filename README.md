# NV Plugins

Clean Nuvio provider collection migrated from the canonical NVV provider set.

The import workflow keeps only the canonical provider implementations registered in `manifest.json`.

## v4.23.0 — Full AIO decode + best settings on every provider

User report on 4.22.0: "still slow, netmirror not providing stream, some providers not decoded". Fixes, all live-probed:

- **"Some providers not decoded" — fixed literally**: the 11 providers adopted from All-in-One-Nuvio in 4.22.0 were byte-identical OBFUSCATED copies. All of them are now re-built from fully decoded sources (string tables resolved, obfuscator machinery stripped, readable code): castle, cineby, movieblast, movieshunt, movix, playimdb, vegamovies, dahmermovies, animezey (+ topcartoons rewritten clean).
- **Best settings applied to every provider**: each decoded port carries the exact AIO endpoints/keys/headers, a hard 8s per-network-call deadline, a 12s overall provider deadline (netmirror: 17s, see below), and the nvio post-filter (en/tl audio gate, >=720p quality gate, cross-provider dedupe) that the raw AIO files lacked.
- **netmirror v12**: the AIO build's real device lane ("NewTV": /checknewtv.php domain resolution -> newtv search/post/episodes/player API with the Ott app header) is ported 1:1 — it is IP-gated (datacenter 403s it, retail/mobile IPs work). The v11 net27 embed lane is REMOVED: every row it produced pointed at bcdn*.hakunaymatata.com, the exact CDN the device 429-blocks. The Alpha relay lane's serve cap is raised 10s -> 16s so its rows are never cut off on mobile. Lanes: Alpha + NewTV + VidSpark, parallel, alpha-first.
- **topcartoons revived**: decoded and repaired against the live site (episode links that are "#" anchors are skipped; og:video:url direct-mp4 extraction) — verified returning playable rows.
- **Speed fixes**: uhdmovies REMOVED (its new download gateway is JS+cookie protected — zero rows headless, AIO fails there too) and dvdplay REMOVED (dead domain, 43s hangs). hexa/movish/vidfast/vidrock stall fixes (8s call deadlines; vidrock's API got a hard 6s cap — it could stall 28s). 4khdhub's 50s series hangs are capped at 12s by the new overall deadline.
- Sheet worst case is now ~12s (netmirror ~17s when the Alpha lane needs its full window); typical answer time is 1–6s per provider.
- 29 providers, zero obfuscated files. kisskh / asianhub / pinoyhub / tagalogtorrents / miruro / pencuri / cinemacity untouched per standing instructions. All-in-One-Nuvio used as read-only source.

## v4.22.0 — All-in-One-Nuvio merge + dead-provider cleanup

Every enabled scraper was live-probed (2 movies x 2 series targets, plus anime titles) against the live upstreams. Results drove this release:

**Why All-in-One-Nuvio "loaded faster"**: this pack still carried 25+ providers whose upstream APIs/DNS are gone — several hung 9–28s per title before failing (primesrc ~13s, moviesjoy ~15s, dahmermovies ~28s, videasy 9s+), and the surviving lanes were slow too (netmirror ~15s, hexa ~15s). Nuvio's stream sheet waits for every enabled scraper, so dead weight = slow sheet. All-in-One-Nuvio's surviving scrapers all answer in <3s.

- **Removed (dead, upstream gone)**: videasy, vidcore, primesrc, showbox, moviebox, allmovieland, moviesmod, moviesdrive, rogmovies, bollyflix, anizone, anidb, animotvslash, animepahe, okru, dooflix, hdhub4u, mallumv, mycima, myflixer, zoechip, himovies, moviesjoy, hdtoday, vixsrc (+ dead orphan files hdhub, xprime, yflix, vidnest, vidnest-anime, cinevibe, animekai).
- **Adopted from All-in-One-Nuvio (verified live, Hindi-only providers NOT taken)**: castle (multi-server HLS), cineby (up to 4K), movieshunt, movix, playimdb, topcartoons, vegamovies (English-labeled rows; old extractor dead), movieblast (faster lane), dahmermovies (re-registered; 4K rows), uhdmovies (old mirror dead), animezey (anime).
- **Revived**: streamflix (file was on disk but unregistered; verified 1080p/720p live).
- **netmirror v11**: triple-lane resolver — the proven Alpha relay lane, a NEW net27.cc embed lane (reverse-engineered from the All-in-One-Nuvio build, verified live), and the VidSpark (net77 stack) lane, all in parallel. The slow Alpha lane serves after 10s with whatever arrived and its full result is late-cached, so titles resolve in ~2–3s instead of ~15s with more rows. English-only rule and subtitle language filter unchanged.
- **Kept as-is per standing instruction** (even though their upstreams currently fail from datacenter IPs / may be CF-gated): kisskh, asianhub, tagalogtorrents, cinemacity. miruro and pencuri verified alive and untouched.
- All-in-One-Nuvio itself was used as a read-only source; nothing was pushed to it.

## Addons

Besides QuickJS stream plugins, this repo ships an HTTP **catalog addon** (Stremio protocol) — Nuvio plugins can only provide streams, catalogs must be served over HTTP:

- **[`addons/pinoyhub-catalog/`](addons/pinoyhub-catalog/README.md)** — "PinoyHub Catalog": browse Pinoy movies and Tagalog-dubbed series from pinoymovieshub.win on Nuvio's Home / Discover / Search. Resolves every title to a TMDB id and pairs with the PinoyMoviesHub plugin for playback. Deployable as a Cloudflare Worker (paste `worker-bundle.js` into the dashboard) or a zero-dependency Node server (`node server.js`), then add `https://<host>/manifest.json` under Settings → Addons.
- **[`addons/asian-catalog/`](addons/asian-catalog/README.md)** — "Asian Catalog" (v5.7.0, repo 4.19.0): the site-mirrored directory for pinoymovieshub.win, kissasian.cam, viewasian.lol, kisskh, animotvslash.org, the Anikoto API and pencurimovie.baby — 28 catalogs (Pencuri Movies / Series / Malaysia / Indonesia / Japan / Thailand / Most Viewed / Most Rating / Top IMDb included). Anime rows carry `mal:`/`anikoto:` ids played by the miruro plugin; Pencuri rows are played by pencuri.js v1.4.0, which now attaches **English subtitles** (opensubtitles-v3) to every stream. v5.6.0's `POST /cjg` relay hops the cinejoy binary request; v5.7.0 adds `POST /cjs` — the ENTIRE cinejoy chain (enc -> /g -> dec) runs server-side for cinejoy.js v1.6.0's one-request full lane on NuvioMobile. Deploy the CF worker from `addons/asian-catalog/` (`worker-bundle.js`), add `https://<host>/manifest.json` under Settings → Addons; cinejoy users also paste the worker base URL into the provider's "Cinejoy relay base URL" setting (required for cinejoy on NuvioMobile; TV/PC need no config).
