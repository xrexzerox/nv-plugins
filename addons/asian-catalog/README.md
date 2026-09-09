# Asian Catalog (community.asian.catalog) — v2.3.0

Stremio-protocol **catalog addon** for Nuvio (NuvioMobile + NuvioTVSmart). Organized
directory, every catalog searchable, TMDB-mapped rows for playback.

## Organized directory (10 catalogs, grouped by source)

| # | Catalog | Type | Source | Extras |
|---|---------|------|--------|--------|
| 1 | Pinoy Movies | movie | pinoymovieshub.win | search, skip |
| 2 | Pinoy Series | series | pinoymovieshub.win | search, skip |
| 3 | Pinoy Movies by Genre | movie | pinoymovieshub.win | genre (30 chips), skip |
| 4 | Pinoy Series by Genre | series | pinoymovieshub.win | genre (30 chips), skip |
| 5 | Asian Series (Dramacool) | series | dramacool.org.es | search, skip |
| 6 | Asian Series by Genre (Dramacool) | series | dramacool.org.es | genre/lang chips (21), skip |
| 7 | Asian Movies | movie | TMDB | search, skip |
| 8 | Asian Series Trending | series | TMDB | search, skip |
| 9 | Asian Movies by Genre | movie | TMDB | genre chips (17), skip |
| 10 | Anime Latest Releases | series | TMDB (airing view) | search, skip |

- **Pinoy** rows resolve to `tmdb:` ids (posters + metadata). Unmatched titles stay
  visible as `asian:<slug>` fallback rows (site poster) unless `ASIAN_KEEP_UNMATCHED=0`.
- **Dramacool** uses the site's WordPress REST API (`/wp-json/wp/v2/anime`) — not the
  JS-rendered pages — so lists, chips and search work server-side. Language chips
  (Korean/Chinese/Japanese/Thai) route to the `anime_language` taxonomy; genre chips
  to `anime_genre` (term ids resolved live, with a verified snapshot fallback map).
- **TMDB** catalogs are official directories filtered to Asian original languages
  (`ko|zh|ja|th|tl`): popular Asian movies, newest Asian series, genre browses.
  Search filters TMDB results to those languages only.
- **Anime Latest Releases** mirrors the animepahe latest-release lineup: newest
  airing Japanese animation first (`with_genres=16&with_original_language=ja&
  sort_by=first_air_date.desc`). animepahe.pw DDoS-Guard-blocks datacenter IPs, so
  the worker reads the lineup from the official TMDB directory instead — every row
  is a `tmdb:` id and plays through the **AnimePahe** Nuvio plugin. Search in this
  catalog keeps only Japanese-original titles tagged Animation.

## What changed in v2.3.0

- **New catalog: Anime Latest Releases** (`anime-latest`, series) — newest airing
  Japanese anime, paired with the AnimePahe playback plugin (see the directory
  notes above). Health now probes 4 sources (`anime` added).
- AsianHub provider (providers/asianhub.js) bumped to **1.1.0**: dramacool.uno
  swapped its embed player to "VidTube" (jwplayer+hls.js). Variant-B embeds only
  carry `https://kisskh.asianc.sr/api/resolve/{cid}` — no inline m3u8 — so the
  Dramacool lane silently returned nothing for series episodes. The provider now
  follows the resolve hop (`{"file":".../index.m3u8"}`) and both lanes are
  live-verified end-to-end (CLOY/Queen of Tears/Parasite/Squid Game, 2026-09-09).

## Why v2.2.0 exists (fetching fixes)

The previous catalog rows went empty because:

- **myasiantv.ac** now serves a JS-only shell (`<title>Loading...`, 484 bytes) to
  non-browsers — every scraped series row came back empty. Replaced by the
  dramacool REST source + TMDB directories.
- The old **dramacool** domains redirect (e.g. dramacool.ru → dramacool.org.es)
  and their grids/search render client-side. The REST API is used instead.
- **kisskh.ovh** is Cloudflare-gated for datacenter IPs, so it cannot be a catalog
  source (the KissKH playback plugin still works fine on devices).
- Carries the **v2.1.1 workerd fix**: `fetch` is bound to the global object
  (`fetch.bind(global)`); an unbound alias throws "Illegal invocation" in Cloudflare
  Workers before any network I/O. `/health` reports the same-error-everywhere
  pattern as a worker-code bug (not IP blocking).

## Endpoints

```
GET /                                   human-readable directory page
GET /manifest.json                      addon manifest (Stremio protocol)
GET /catalog/{type}/{catalogId}.json                       first page
GET /catalog/{type}/{catalogId}/{extras}.json              extras as path segment
GET /catalog/{type}/{catalogId}.json?search=x&skip=20      extras as query params
GET /health                             per-source probes: ok/ms/items + hints
```

Extras: `search` (text), `genre` (chip label), `skip` (offset). Nuvio sends them as
a path segment; the query-string form is equivalent.

Examples:

```
/catalog/movie/pinoy-movies/search=hello love again.json
/catalog/series/asian-series/search=queen of tears.json
/catalog/series/asian-series-genre/genre=Korean.json
/catalog/movie/asian-movies-genre/genre=Action&skip=20.json
/catalog/series/anime-latest/search=frieren.json
```

## Deploy

### Option A — Cloudflare Workers (recommended)

1. Cloudflare dashboard → Workers & Pages → Create worker (or open the existing
   `asian-catalog` worker).
2. Paste the whole `worker-bundle.js` into the editor → Deploy.
3. Add `https://<your-worker>.workers.dev/manifest.json` in Nuvio → Settings → Addons.

Optional vars/secrets: `TMDB_API_KEY`, `PINOY_SITE`, `DRAMACOOL_SITE`,
`ASIAN_PAGE_LIMIT`, `ASIAN_MAX_PAGES`, `ASIAN_KEEP_UNMATCHED`.

For wrangler deploys: `npx wrangler deploy` from this folder.

### Option B — self-host (Node >= 18)

```
node server.js                  # port 8787
PORT=3000 node server.js        # custom port
```

Then add `http://<host>:<port>/manifest.json` in Nuvio.

## Health checks

`GET /health` probes each source (listing parse / REST / TMDB discover / anime
discover) and returns:

```json
{
  "status": "up | degraded | down",
  "sources": { "pinoymovieshub": {"ok": true, "ms": 812, "items": 40}, ... },
  "hints": ["..."]
}
```

All probes failing with the *same* error is reported as a worker-code bug
(redeploy the bundle), not IP blocking. A single source failing gets a
source-specific hint (mirror env vars, TMDB key).

## Replacing the old PinoyHub Catalog

v2.2.0 supersedes `community.pinoyhub.catalog` (v1.0.0): all four Pinoy catalogs
are included here with the same ids. Remove the old PinoyHub Catalog addon in
Nuvio and add this one; both may coexist temporarily (rows would duplicate).

## Development

```
node test-catalog.js          # 106 offline tests (mock network)
LIVE=1 node test-catalog.js   # + 12 live checks against the real sources
```

Rebuild the worker bundle after editing `core.js` / `worker.js`:

```
npx esbuild worker.js --bundle --format=esm --platform=neutral --target=es2020 \
  --legal-comments=none --outfile=worker-bundle.js
```

`manifest.json` is a checked-in snapshot of the engine's manifest — keep it in
sync (the test suite enforces deep equality).
