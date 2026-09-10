# Asian Catalog (community.asian.catalog) — v3.0.0

Stremio-protocol **catalog addon** for Nuvio (NuvioMobile + NuvioTVSmart). Organized
directory, every catalog searchable, TMDB-mapped rows for playback.

## Organized directory (11 catalogs, grouped by source)

| # | Catalog | Type | Source | Extras |
|---|---------|------|--------|--------|
| 1 | Pinoy Movies | movie | pinoymovieshub.win | search, skip |
| 2 | Pinoy Series | series | pinoymovieshub.win | search, skip |
| 3 | Pinoy Movies by Genre | movie | pinoymovieshub.win | genre (30 chips), skip |
| 4 | Pinoy Series by Genre | series | pinoymovieshub.win | genre (30 chips), skip |
| 5 | Asian Series (KissAsian) | series | kissasian.cam | search, skip |
| 6 | Asian Series by Genre (KissAsian) | series | kissasian.cam | genre chips (19), skip |
| 7 | Asian Series (ViewAsian) | series | viewasian.lol | search, skip |
| 8 | Asian Series by Genre (ViewAsian) | series | viewasian.lol | genre/country chips (26), skip |
| 9 | Asian Movies | movie | TMDB | search, skip |
| 10 | Asian Series Trending | series | TMDB | search, skip |
| 11 | Asian Movies by Genre | movie | TMDB | genre chips (17), skip |

- **Pinoy** rows resolve to `tmdb:` ids (posters + metadata). Unmatched titles stay
  visible as source-scoped `asian:ks-/va-/pmh-<slug>` fallback rows (site poster; the paired plugins navigate the sites' real episode/movie pages DIRECTLY from the slug) unless `ASIAN_KEEP_UNMATCHED=0`.
- **KissAsian** (kissasian.cam, WordPress "dramastream" theme): the home archive
  (`/page/N/`) is scraped and deduped to series — a fresh "latest updates" browse.
  Search uses the site's own `/?s=` endpoint. Genre chips route to the site's
  `/genres/{slug}/` archives (all 19 slugs verified live). Titles carry no year,
  TMDB matching runs yearless with confident-title scoring.
- **ViewAsian** (viewasian.lol, WordPress "viewasian" theme): same archive/search
  pattern; row titles carry the year inline (`Show (2026) Episode 2 English Sub`)
  which is kept for TMDB matching. Genre chips route to `/genre/{slug}/` (22 slugs
  verified live) and Korean/Chinese/Japanese chips to `/country/{slug}/` archives.
- **TMDB** catalogs are official directories filtered to Asian original languages
  (`ko|zh|ja|th|tl`): popular Asian movies, newest Asian series, genre browses.
  Search filters TMDB results to those languages only.
- **kisskh.co is intentionally NOT a catalog source** (v3.0.0): it Cloudflare-
  challenges datacenter IPs, so a server-side worker cannot browse it. It stays a
  **playback lane** inside `providers/asianhub.js`, where Nuvio devices are served
  normally. Same split as the standalone kisskh.js provider.

## What changed in v3.0.0 (source swap, user request)

- **REMOVED**: myasiantv.com.lv, dramacool and the AnimePahe "Anime Latest
  Releases" catalog (with the anime-only search filter and its 4th health probe).
- **ADDED**: kissasian.cam + viewasian.lol as the asian-series sources (both
  server-side reachable, live-verified with real rows, search, chips and TMDB
  resolution: Queen of Tears → `tmdb:215720`, CLOY → `tmdb:94796`).
- AsianHub provider bumped to **2.0.0** with three lanes matching the new sites
  (see `providers/asianhub.js` header for the full chains):
  1. **KissAsian → justplay.cam (Byse)**: search → series page → episode page →
     captcha-gated Byse API (PoW challenge "sha256-leading-zero-bits" — actually a
     custom hash, ported; difficulty 16 solves in ~1-2s of pure JS) →
     AES-256-CTR payload decrypt (key_parts scheme) → signed headerless HLS.
  2. **ViewAsian → kisskh.space → vidmoly**: search → drama page → episode page →
     player iframe chain → plaintext m3u8 extraction.
  3. **KissKH (kisskh.co, kisskh.ovh fallback)**: JSON API + Google-Script keygen
     (device-side; datacenter IPs are challenged).
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
/catalog/series/asian-series-viewasian/search=crash landing on you.json
/catalog/series/asian-series-genre/genre=Romance.json
/catalog/series/asian-series-viewasian-genre/genre=Korean.json
/catalog/movie/asian-movies-genre/genre=Action&skip=20.json
```

## Deploy

### Option A — Cloudflare Workers (recommended)

1. Cloudflare dashboard → Workers & Pages → Create worker (or open the existing
   `asian-catalog` worker).
2. Paste the whole `worker-bundle.js` (v3.2.0) into the editor → Deploy.
3. Add `https://<your-worker>.workers.dev/manifest.json` in Nuvio → Settings → Addons.

Optional vars/secrets: `TMDB_API_KEY`, `PINOY_SITE`, `KISSASIAN_SITE`,
`VIEWASIAN_SITE`, `ASIAN_PAGE_LIMIT`, `ASIAN_MAX_PAGES`, `ASIAN_KEEP_UNMATCHED`.

For wrangler deploys: `npx wrangler deploy` from this folder.

### Option B — self-host (Node >= 18)

```
node server.js                  # port 8787
PORT=3000 node server.js        # custom port
```

Then add `http://<host>:<port>/manifest.json` in Nuvio.

## Health checks

`GET /health` probes each source (listing parse for pinoymovieshub / kissasian /
viewasian, TMDB discover) and returns:

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
node test-catalog.js          # 113 offline tests (mock network)
LIVE=1 node test-catalog.js   # + 14 live checks against the real sources
node debug-asian.js help      # unified debugger: catalog + plugins
```

### Unified debugger — `debug-asian.js`

Tests the WHOLE asian pipeline on your own machine (Node >= 18, zero deps):
the catalog engine AND the plugins (`asianhub.js` + `pinoyhub.js`), with the
exact `getStreams` calls Nuvio makes. Supersedes `debug-catalog.js`
(catalog-side only). Plain ASCII output, cmd.exe-safe; exit 0/1/2.

```
node debug-asian.js all                       # FLAGSHIP end-to-end audit:
                                              #  health -> every catalog -> sampled
                                              #  rows -> paired plugin -> stream link
                                              #  + miss diagnosis (bot-gate, 500s, ...)
node debug-asian.js all --full                # every row of every catalog (slow)
node debug-asian.js all --catalog asian-series --sample 5
node debug-asian.js health                    # 4 source probes, real errors
node debug-asian.js catalog series asian-series search=queen of tears
node debug-asian.js stream series asian:queen-of-tears 1 1 --verify
                                              # one id -> plugin lanes -> stream,
                                              # --verify probes the m3u8 live
node debug-asian.js plugins                   # plugin audit: version, exports,
                                              #   sandbox lint, lane hosts
node debug-asian.js sites                     # reachability matrix (catalog + lanes)
node debug-asian.js remote https://<worker>.workers.dev
                                              # stale-deploy detector: compares the
                                              #   deployed version vs local core.js
node debug-asian.js verify "<m3u8-url>"       # probe any stream URL
```

Common flags: `--trace` (log every outbound HTTP call), `--json`, `--verify`,
`--sample N`, `--full`, `--catalog <id>`, `--type movie|series`,
`--plugin auto|asianhub|pinoyhub|both`, `--timeout <ms>`, `--repo <path>`.
Env overrides match the worker: `TMDB_API_KEY`, `PINOY_SITE`, `KISSASIAN_SITE`,
`VIEWASIAN_SITE`.

Rebuild the worker bundle after editing `core.js` / `worker.js`:

```
npx esbuild worker.js --bundle --format=esm --platform=neutral --target=es2020 \
  --legal-comments=none --outfile=worker-bundle.js
```

`manifest.json` is a checked-in snapshot of the engine's manifest — keep it in
sync (the test suite enforces deep equality).
