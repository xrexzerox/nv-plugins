# Asian Catalog (community.asian.catalog) — v3.1.0

Stremio-protocol **catalog addon** for Nuvio (NuvioMobile + NuvioTVSmart). Organized
directory, every catalog searchable, TMDB-mapped rows for playback.

## Organized directory (14 catalogs, grouped by source)

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
| 12 | Asian Series by Language | series | TMDB | language chips (5), skip |
| 13 | Asian Movies by Language | movie | TMDB | language chips (5), skip |
| 14 | Asian Series On The Air | series | TMDB | skip |

- **Pinoy** rows resolve to `tmdb:` ids (posters + metadata). Unmatched titles stay
  visible as `asian:<slug>` fallback rows (site poster) unless `ASIAN_KEEP_UNMATCHED=0`.
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
- **v3.1.0 language matrix + on-the-air** (patterns proven by Streaming Catalogs
  Plus on stremio-addons.net): *Asian Series/Movies by Language* pin ONE original
  language per chip (Korean `ko`, Japanese `ja`, Chinese `zh`, Thai `th`, Filipino
  `tl`); *Asian Series On The Air* uses TMDB's `on_the_air=true` for dramas with
  episodes airing right now.
- **kisskh.co is intentionally NOT a catalog source** (v3.0.0): it Cloudflare-
  challenges datacenter IPs, so a server-side worker cannot browse it. It stays a
  **playback lane** inside `providers/asianhub.js`, where Nuvio devices are served
  normally. Same split as the standalone kisskh.js provider.

## What changed in v3.1.0

- **3 new TMDB catalogs**: Asian Series by Language, Asian Movies by Language
  (language matrix) and Asian Series On The Air (airing now).
- **Manifest personalization** (Streaming-Catalogs-Plus pattern, proven Nuvio-safe):
  - `/manifest.json?sources=pinoy,kissasian,viewasian,tmdb` keeps only those sources
  - `/manifest.json?langs=ko,ja,th` trims the language rows to those chips
  - Combine freely; without params you get all 14 catalogs.
- **POST /relay — text-safe binary relay for Nuvio plugins.** Device runtimes
  stringify fetch bodies and expose text()/json() only, so plugins cannot POST
  binary or read binary replies (cinejoy's octet-stream exchange broke on-device).
  The relay does the binary fetch server-side (Workers handle octet-stream
  natively) and base64-wraps the reply. **Host-allowlisted**
  (`api.shegu.st`, `animotvslash.ru`, `animotvslash.p2pplay.pro`, `cinemacity.cc`)
  so the deployment can never serve as an open proxy; reply cap 2 MB; 20 s timeout.
  Verified byte-identical round-trip in real workerd.
- Plugins that use it (set **Worker Relay URL** in the plugin's settings to this
  worker's base URL): **cinejoy v1.4.0** (required on device), **animotvslash
  v6.0.0** (fallback when the ru API challenges the client), **cinemacity v4.2.0**
  (fallback when CF challenges the client).

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
GET /manifest.json?sources=..&langs=..  personalized manifest (optional)
GET /catalog/{type}/{catalogId}.json                       first page
GET /catalog/{type}/{catalogId}/{extras}.json              extras as path segment
GET /catalog/{type}/{catalogId}.json?search=x&skip=20      extras as query params
GET /health                             per-source probes: ok/ms/items + hints
POST /relay                             text-safe binary relay (allowlisted hosts)
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
2. Paste the whole `worker-bundle.js` (v3.1.0) into the editor → Deploy.
3. Add `https://<your-worker>.workers.dev/manifest.json` in Nuvio → Settings → Addons.
4. **Plugins (cinejoy / animotvslash / cinemacity):** open the plugin's settings in
   Nuvio and set **Worker Relay URL** to `https://<your-worker>.workers.dev`.
   cinejoy requires it on device; the other two use it as an automatic fallback.

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
node test-catalog.js          # 129 offline tests (mock network)
LIVE=1 node test-catalog.js   # + 15 live checks against the real sources
node debug-catalog.js health  # live per-source errors on your machine
```

Rebuild the worker bundle after editing `core.js` / `worker.js`:

```
npx esbuild worker.js --bundle --format=esm --platform=neutral --target=es2020 \
  --legal-comments=none --outfile=worker-bundle.js
```

`manifest.json` is a checked-in snapshot of the engine's manifest — keep it in
sync (the test suite enforces deep equality).
