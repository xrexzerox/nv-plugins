# Asian Catalog — Nuvio Addon (Stremio protocol)

Browse **Pinoy movies, Tagalog-dubbed series and Asian movies & dramas** (Korean / Chinese /
Japanese / Thai / Taiwanese / Hong Kong / Indian / other Asian titles, English subs) directly
inside Nuvio's Home / Discover / Search screens.

> **Why an addon and not a plugin?** Nuvio's QuickJS plugins can only export `getStreams()` —
> catalogs and metadata must come from an HTTP addon following the Stremio protocol. Use this
> addon for **browsing**, and the repo's **PinoyMoviesHub** (`providers/pinoyhub.js`) and
> **AsianHub** (`providers/asianhub.js`) plugins for **playback**. They are designed as a pair:
> this addon resolves every title to a TMDB id, and the plugins receive that same TMDB id when
> you hit play.

```
┌──────────────┐   browse    ┌─────────────────────┐   tmdb:{id}   ┌──────────────────────┐
│ Nuvio Home /  │ ──────────► │ Asian Catalog       │ ────────────► │ Nuvio detail screen  │
│ Search/Discover│  catalog   │ (this addon, HTTP)  │               │ (TMDB artwork/ratings)│
└──────────────┘   JSON      └─────────────────────┘               └──────────┬───────────┘
                                                                       play  │ getStreams(tmdbId)
                                                                             ▼
                                                              ┌──────────────────────────┐
                                                              │ PinoyMoviesHub / AsianHub│
                                                              │ plugins (direct streams) │
                                                              └──────────────────────────┘
```

## Catalogs

| Type | Catalog | Endpoint | Extras | Source |
|------|---------|----------|--------|--------|
| movie | Pinoy Movies | `/catalog/movie/pinoy-movies.json` | `search`, `skip` | pinoymovieshub.win |
| movie | Pinoy Movies by Genre | `/catalog/movie/pinoy-movies-genre/genre={Genre}.json` | `genre` (30 options), `skip` | pinoymovieshub.win |
| series | Pinoy Series | `/catalog/series/pinoy-series.json` | `search`, `skip` | pinoymovieshub.win |
| series | Pinoy Series by Genre | `/catalog/series/pinoy-series-genre/genre={Genre}.json` | `genre` (30 options), `skip` | pinoymovieshub.win |
| series | Asian Dramas | `/catalog/series/asian-dramas.json` | `search`, `skip` | myasiantv.com.lv |
| movie | Asian Movies by Country | `/catalog/movie/asian-movies/genre={Country}.json` | `genre` (8 countries), `skip` | dramacool.uno |
| series | Asian Dramas by Country | `/catalog/series/asian-dramas-country/genre={Country}.json` | `genre` (8 countries), `skip` | dramacool.uno |

Extras arrive Stremio-style in the path: `search=crash landing.json`, `genre=Korean&skip=20.json`.
Country chips: *Korean, Chinese, Japanese, Thai, Taiwanese, Hong Kong, Indian, Other Asia*.
Pinoy genre chips include *Tagalog Dubbed*, *Teleserye*, *BL Series*, *Wattpad*, *Action*, etc.

Every returned meta carries a `tmdb:{id}` id (resolved server-side via TMDB search with
title/year normalization) plus full metadata — TMDB backdrop, description, rating, and the
site's own poster art, enriched per title with **genres**, **country**, **runtime** and top
**cast** (directors for movies) from one cached, fail-soft TMDB details call:

- NuvioMobile opens detail screens via its TMDB fallback — no extra meta addon needed.
- Nuvio TV enriches with cast / recommendations / next episodes.
- The PinoyMoviesHub / AsianHub plugins get a proper TMDB id on play (no slug guessing).

### If catalogs come back empty — open `/health`

`GET /health` (JSON) live-checks every dependency **from the runtime the addon actually runs
on** and returns per-source HTTP status, latency and parsed-item counts plus concrete fix
hints. `status` is `ok`, `degraded` (a source or TMDB failing) or `down` (HTTP 503):

```json
{
  "version": "2.1.0",
  "addonId": "community.asianhub.catalog",
  "status": "ok",
  "healthy": true,
  "sources": [
    { "label": "pinoymovieshub", "ok": true, "items": 30, "ms": 1059, "url": "https://pinoymovieshub.win/movies/", "error": null },
    { "label": "myasiantv",      "ok": true, "items": 22, "ms": 1005, "url": "https://myasiantv.com.lv/most-popular-drama/", "error": null },
    { "label": "dramacool",      "ok": true, "items": 36, "ms": 694,  "url": "https://dramacool.uno/country/korean-drama", "error": null },
    { "label": "tmdb",           "ok": true, "items": 1,   "ms": 512,  "url": "https://api.themoviedb.org", "error": null }
  ],
  "hints": ["All sources and TMDB reachable - ..."]
}
```

Troubleshooting cheat-sheet (each case also appears in `hints`):

| Symptom | Likely cause / fix |
|---|---|
| `/health` shows a source `ok:false` with 403/challenge | The host bot-gates your deployment's IP (common for shared datacenter IPs). Redeploy the worker in another region or set its `*_SITE` env var to a working mirror. |
| All three sources `ok:false` | Your host's IP is blocked/region-locked — try a different worker region, or self-host (Option C) on a residential/VPS box. |
| `tmdb` check `ok:false` (HTTP 401) | TMDB key rejected — set your own v3 key: `npx wrangler secret put TMDB_API_KEY`. |
| `ok:true` but `items:0` on a source | Site reachable but template changed / challenge page served — update the parser or use a mirror. |
| `/health` all green but Nuvio shows nothing | The manifest URL you installed is not this deployment (e.g. a GitHub or local path — Nuvio derives API endpoints from the manifest URL). Re-add `https://<your-worker>/manifest.json`. |

**Resilience (v2.1.0):** if TMDB ever hard-fails (network/key outage), catalogs no longer come
back silently empty — rows fall back to site-supplied metadata with `asian:*` ids so you can
still browse until TMDB is reachable again. Bot-gated source responses (403/429/503 or a JS
challenge wall) get one automatic clean-client retry before hitting serve-stale caches.

## Sources

| Source | What it provides | Notes |
|---|---|---|
| [pinoymovieshub.win](https://pinoymovieshub.win) | Pinoy movies + Tagalog-dubbed series | WordPress/Dooplay, `/?s=` search + genre archives |
| [myasiantv.com.lv](https://myasiantv.com.lv) | KR/CN/JP/TH dramas, k-shows (English subs) | WordPress wp-json REST search; popular/recent listings + full A-Z drama index |
| [dramacool.uno](https://dramacool.uno) | Asian movies & dramas by country (English subs) | static country grids (popular block, server-rendered) |

The **Asian Dramas** catalog is the deep one (popular + recently added + full A–Z drama index,
letter pages a→z). The **by Country** catalogs mirror dramacool.uno's server-rendered popular
grids and are intentionally shallow (a handful of items per country).

## Deployment (pick one)

### Option A — Cloudflare Worker via dashboard (no tools, ~5 min, free)

1. Sign up / log in at [dash.cloudflare.com](https://dash.cloudflare.com) → **Workers & Pages** → **Create** → **Create Worker** → name it e.g. `asian-catalog` → **Deploy**.
2. Click **Edit code**, delete the placeholder, paste the entire contents of [`worker-bundle.js`](./worker-bundle.js), click **Deploy**.
3. Your addon URL: `https://asian-catalog.<your-subdomain>.workers.dev/manifest.json`

### Option B — Cloudflare Worker via wrangler

```bash
cd addons/asian-catalog
npx wrangler login
npx wrangler deploy          # uses wrangler.toml
```

### Option C — Node server (VPS / home server / Termux)

```bash
cd addons/asian-catalog
PORT=8787 node server.js      # zero dependencies, Node >= 18
```

Put it behind any TLS proxy (Caddy/nginx) or use it on LAN; then add `http://<host>:8787/manifest.json` in Nuvio.

## Install in Nuvio

1. **Mobile**: Settings → Addons → paste the manifest URL → **Install Addon**.
2. **TV**: Settings / onboarding → manage from phone → paste the same URL.
3. Make sure the **PinoyMoviesHub** and **AsianHub** plugins are installed too (Plugins → Add Repository → this repo's `manifest.json`), so play buttons actually resolve streams.
4. The seven catalogs appear on Home. Use Search (it queries the addon), or Discover → pick a genre / country chip.

## Configuration (optional)

| Env / secret | Default | Purpose |
|---|---|---|
| `TMDB_API_KEY` | embedded ecosystem key | TMDB v3 key used for id resolution — set your own (`npx wrangler secret put TMDB_API_KEY`) |
| `PINOYHUB_SITE` | `https://pinoymovieshub.win` | Alternate domain/mirror of the Pinoy site |
| `MYASIANTV_SITE` | `https://myasiantv.com.lv` | Alternate domain/mirror of MyAsianTV |
| `DRAMACOOL_SITE` | `https://dramacool.uno` | Alternate domain/mirror of Dramacool |
| `PINOYHUB_PAGE_LIMIT` | `20` | Resolved items per response (5–50) |
| `PINOYHUB_KEEP_UNMATCHED` | off | `=1` keeps titles that fail TMDB matching as `asian:{source}:{slug}` ids. They display fine but have limited detail/stream support |
| `PINOYHUB_MAX_PAGES` | `80` | Safety cap on site pages consumed per listing |

## Behavior notes

- **Stable pagination**: the engine buffers TMDB-resolved items per catalog, so `skip` offsets
  stay consistent even when site pages contain unmatchable titles. Nuvio's
  `nextSkip = skip + returnedCount` never stalls or repeats.
- **Episode-post collapse**: MyAsianTV search returns per-episode posts; every episode of a
  show resolves to the same TMDB id, so the resolved buffer collapses them to one meta per show
  automatically.
- **Caching**: site listing pages 10 min (serve-stale up to 6 h if a site hiccups), TMDB lookups
  24 h, buffers 30 min. Cloudflare isolate memory is used automatically; no KV needed.
- **Search**: Pinoy catalogs use the WordPress `/?s=` search; Asian Dramas uses MyAsianTV's
  wp-json REST search. Dramacool's search is client-side-rendered, so by-country catalogs are
  browse-only.
- **Multi-source caches are keyed per site**, so a mirror switch never serves cross-site data.

## Files

| File | Purpose |
|---|---|
| `core.js` | Engine: multi-site scraping, TMDB resolution + details enrichment, buffering, routing (classic script, no imports) |
| `worker.js` | Cloudflare Worker entry (module format) |
| `worker-bundle.js` | Single-file bundle for dashboard paste (built with esbuild) |
| `server.js` | Zero-dependency Node 18+ server |
| `manifest.json` | Static snapshot of the manifest served by `/manifest.json` |
| `wrangler.toml` | wrangler deployment config |
| `test-catalog.js` | `node test-catalog.js` (offline, mocked) / `LIVE=1 node test-catalog.js` (live) |

## Regenerating the bundle

```bash
npm install
npx esbuild addons/asian-catalog/worker.js --bundle --format=esm --platform=neutral \
  --target=es2020 --legal-comments=none --outfile=addons/asian-catalog/worker-bundle.js
```

## License

GPL-3.0-only, same as the rest of this repository.
