# PinoyHub Catalog — Nuvio Addon (Stremio protocol)

Browse **Pinoy movies and Tagalog-dubbed series** from [pinoymovieshub.win](https://pinoymovieshub.win) directly inside Nuvio's Home / Discover / Search screens.

> **Why an addon and not a plugin?** Nuvio's QuickJS plugins can only export `getStreams()` — catalogs and metadata must come from an HTTP addon following the Stremio protocol. Use this addon for **browsing**, and the repo's **PinoyMoviesHub plugin** (`providers/pinoyhub.js`) for **playback**. They are designed as a pair: this addon resolves every title to a TMDB id, and the plugin receives that same TMDB id when you hit play.

```
┌──────────────┐   browse    ┌─────────────────────┐   tmdb:{id}   ┌──────────────────────┐
│ Nuvio Home /  │ ──────────► │ PinoyHub Catalog    │ ────────────► │ Nuvio detail screen  │
│ Search/Discover│  catalog   │ (this addon, HTTP)  │               │ (TMDB artwork/ratings)│
└──────────────┘   JSON      └─────────────────────┘               └──────────┬───────────┘
                                                                       play  │ getStreams(tmdbId)
                                                                             ▼
                                                              ┌──────────────────────────┐
                                                              │ PinoyMoviesHub plugin    │
                                                              │ (QuickJS, direct streams)│
                                                              └──────────────────────────┘
```

## Catalogs

| Type | Catalog | Endpoint | Extras |
|------|---------|----------|--------|
| movie | Pinoy Movies | `/catalog/movie/pinoy-movies.json` | `search`, `skip` |
| movie | Pinoy Movies by Genre | `/catalog/movie/pinoy-movies-genre/genre={Genre}.json` | `genre` (30 options), `skip` |
| series | Pinoy Series | `/catalog/series/pinoy-series.json` | `search`, `skip` |
| series | Pinoy Series by Genre | `/catalog/series/pinoy-series-genre/genre={Genre}.json` | `genre` (30 options), `skip` |

Extras arrive Stremio-style in the path: `search=cobra kai.json`, `genre=Tagalog Dubbed&skip=20.json`. Genre chips include *Tagalog Dubbed*, *Teleserye*, *BL Series*, *Wattpad*, *Action*, *Romance*, etc.

Every returned meta carries a `tmdb:{id}` id (resolved server-side via TMDB search with title/year normalization), TMDB backdrop, description, rating and the site's own poster art. That means:

- NuvioMobile opens detail screens via its TMDB fallback — no extra meta addon needed.
- Nuvio TV enriches with cast / recommendations / next episodes.
- The PinoyMoviesHub plugin gets a proper TMDB id on play (no slug guessing).

## Deployment (pick one)

### Option A — Cloudflare Worker via dashboard (no tools, ~5 min, free)

1. Sign up / log in at [dash.cloudflare.com](https://dash.cloudflare.com) → **Workers & Pages** → **Create** → **Create Worker** → name it e.g. `pinoyhub-catalog` → **Deploy**.
2. Click **Edit code**, delete the placeholder, paste the entire contents of [`worker-bundle.js`](./worker-bundle.js), click **Deploy**.
3. Your addon URL: `https://pinoyhub-catalog.<your-subdomain>.workers.dev/manifest.json`

### Option B — Cloudflare Worker via wrangler

```bash
cd addons/pinoyhub-catalog
npx wrangler login
npx wrangler deploy          # uses wrangler.toml
```

### Option C — Node server (VPS / home server / Termux)

```bash
cd addons/pinoyhub-catalog
PORT=8787 node server.js      # zero dependencies, Node >= 18
```

Put it behind any TLS proxy (Caddy/nginx) or use it on LAN; then add `http://<host>:8787/manifest.json` in Nuvio.

## Install in Nuvio

1. **Mobile**: Settings → Addons → paste the manifest URL → **Install Addon**.
2. **TV**: Settings / onboarding → manage from phone → paste the same URL.
3. Make sure the **PinoyMoviesHub plugin** is installed too (Plugins → Add Repository → this repo's `manifest.json`), so play buttons actually resolve streams.
4. The four catalogs appear on Home. Use Search (it queries this addon), or Discover → pick a genre chip.

## Configuration (optional)

| Env / secret | Default | Purpose |
|---|---|---|
| `TMDB_API_KEY` | embedded ecosystem key | TMDB v3 key used for id resolution — set your own (`npx wrangler secret put TMDB_API_KEY`) |
| `PINOYHUB_SITE` | `https://pinoymovieshub.win` | Alternate domain/mirror of the site |
| `PINOYHUB_PAGE_LIMIT` | `20` | Resolved items per response (5–50) |
| `PINOYHUB_KEEP_UNMATCHED` | off | `=1` keeps titles that fail TMDB matching as `pinoyhub:{slug}` ids. They display fine but have limited detail/stream support |
| `PINOYHUB_MAX_PAGES` | `80` | Safety cap on site pages consumed per listing |

## Behavior notes

- **Stable pagination**: the engine buffers TMDB-resolved items per catalog, so `skip` offsets stay consistent even when site pages contain unmatchable titles. Nuvio's `nextSkip = skip + returnedCount` never stalls or repeats.
- **Caching**: site listing pages 10 min (serve-stale up to 6 h if the site hiccups), TMDB lookups 24 h, buffers 30 min. Cloudflare isolate memory is used automatically; no KV needed.
- **Search** uses the site's WordPress search (`/?s=`), nonce-free; deep-page 404s end listings gracefully.
- **Rate limits**: a page request costs ~1 site fetch per 10 items + up to 6 parallel TMDB searches. All well inside Cloudflare's free tier.

## Files

| File | Purpose |
|---|---|
| `core.js` | Engine: scraping, TMDB resolution, buffering, routing (classic script, no imports) |
| `worker.js` | Cloudflare Worker entry (module format) |
| `worker-bundle.js` | Single-file bundle for dashboard paste (built with esbuild) |
| `server.js` | Zero-dependency Node 18+ server |
| `manifest.json` | Static snapshot of the manifest served by `/manifest.json` |
| `wrangler.toml` | wrangler deployment config |
| `test-catalog.js` | `node test-catalog.js` (offline, mocked) / `LIVE=1 node test-catalog.js` (live) |

## Regenerating the bundle

```bash
npm install
npx esbuild addons/pinoyhub-catalog/worker.js --bundle --format=esm --platform=neutral \
  --target=es2020 --legal-comments=none --outfile=addons/pinoyhub-catalog/worker-bundle.js
```

## License

GPL-3.0-only, same as the rest of this repository.
