# Asian Catalog (community.asian.catalog) — v5.5.0

Stremio-protocol **catalog addon** for Nuvio (NuvioMobile + NuvioTVSmart). The
directory now **mirrors each website's real sections** (user enumerated them from
the sites on 2026-09-10/12; every path below was fetched and verified live when
it was served). Every pmh/pen fallback row now opens real details, too.

**v5.5.0 (2026-09-11)**: the catalog layout the user validated on 4.15.0 is
**restored intact** (repo 4.17.0) — the 4.16.0 rebuild had regressed the
directory to 33 catalogs, dropping the **Pencuri Movies `/movies/` + Pencuri
Series `/series/`** sections and re-adding seven Pinoy boards the user had
removed. v5.5.0 ships the user-validated **28-catalog** set unchanged and pairs
with **pencuri.js v1.4.0**, which now attaches **English subtitles** to every
Pencuri stream row (Stremio's keyless opensubtitles-v3 lane; episode-scoped for
series; resolved in parallel so stream latency is unchanged). The worker bundle
(`worker-bundle.js`) was rebuilt from this core — **redeploy the CF worker**
when updating.

**v5.4.0 (2026-09-12)**: the **Pencuri country / feature boards are back**
(user list 2026-09-12, "additional to asian-catalog for pencuri" after the
v5.3.0 trim): **Malaysia `/country/malaysia/`, Indonesia `/country/indonesia/`,
Japan `/country/japan/`, Thailand `/country/thailand/`, Most Viewed
`/most-viewed/`, Most Rating `/most-rating/`, Top IMDb `/top-imdb/`** — all
verified 200 with 40 rows/page (the site's `/top-imdb/page` alone is a 404;
its pagination lives at `/top-imdb/page/N/`). They keep their v5.2.0 shape:
movie-typed sections that **mix movies and series** (only the
`pencuri-movies`/`pencuri-series` defs filter rows). Directory is **28
catalogs**. Paired with **pencuri.js v1.3.0** (4.15.0), which fixes the 4.14.0
"no stream links on movies AND tv" report: Nuvio's QuickJS plugin runtime has
**no setTimeout/clearTimeout** (verified in the app source + quickjs AAR), so
the provider's unguarded timer call threw on device and zeroed every lane;
v1.2.0 uses the repo-standard guarded fetch pattern plus the full
pinoyhub-proven Dood flow and headerless-first CDN rows.

**v5.3.0 (2026-09-12)**: two fixes for the user's reports of 2026-09-12.
(1) **"could not load the details from any addons" (Pinoy Movies Hub)** —
TMDB-unmatched rows carry `asian:pmh-`/`asian:pen-` fallback ids and Nuvio
asks every addon for `/meta` on them; the addon answered 404 on purpose and
Nuvio's TMDB fallback cannot parse `asian:` ids, so every unmatched row errored
on open. The addon now **serves real detail-page meta** for both tails: Dooplay
`.sheader` + `.wp-content` + static `#seasons` episode list (pmh) and MovieMo
og-tags + `/episode/` links (pen) — Stremio-shaped `videos[]` included, cached.
(2) **Catalogs trimmed to the sites' own archives** (user list): Pinoy Movies
Hub drops the carousel/genre widgets for **Movies `/movies` + Series `/series`**
(and in v5.4.0 the Pencuri boards came back — see above) — the live site now
prefixes series rows with `/series/` in their hrefs (the v5.2.0 parser captured
`series` as the slug and dropped every series row; fixed in both addon and
pencuri.js).

**v4.1.0 (2026-09-10)**: the deployed worker confirmed kisskh.co/.ovh/.nl ALL
Cloudflare-403 its datacenter egress (free CORS proxies get the same challenge
page — there is no transport lane to the real API from that runtime). The 7
KissKH catalogs now **auto-rescue**: when every mirror fails they are served
from TMDB-curated lists that mirror each section's intent, with full metadata
and real `tmdb:` ids the paired plugins resolve on-device (kisskh.js strips the
prefix, gets the title from TMDB and searches kisskh over the device's
residential egress — the lane that works). `/health` reports
`sources.kisskh.mode = 'api' | 'tmdb-rescue'` so you can always tell which lane
served the rows.

## The directory (28 catalogs, grouped by source)

### Pinoy Movies Hub — pinoymovieshub.win (canonical mirror, verified)
Mirror check (user request): **pinoymovieshub.win** is the live canonical host —
`pinoymovieshub.tv` 301-redirects to it, `.org` CF-blocks datacenter IPs, and
`.ph/.net/.com/.es/.site/.cc/.me` are dead.

| Catalog | Type | Site section / URL |
|---------|------|--------------------|
| Pinoy Movies | movie | `/movies` (paginated `/movies/page/N/`) |
| Pinoy Series | series | `/series` (paginated `/series/page/N/`) |

(v5.2.0-era carousel/genre widgets removed 2026-09-12 per user list; the
detail-page meta builder covers any `asian:pmh-` fallback row either way.)

### KissAsian — kissasian.cam

| Catalog | Type | Site section / URL |
|---------|------|--------------------|
| KissAsian Hot Series Update | series | home `.hothome` block; deeper pages continue on `/series/?order=update` |
| KissAsian Latest Release | series | `/series/?status=&type=&order=update` — the section's own View All URL |
| KissAsian by Genre | series | the home "Recommendation" tabs: Fantasy, Friendship, Law, Romance, Sports → `/genres/{slug}/` (friendship/law/sports archives verified 200 even though absent from the nav menu) |

### ViewAsian — viewasian.lol

| Catalog | Type | Site section / URL |
|---------|------|--------------------|
| ViewAsian Recently Drama, Movie and Kshow | series | the home recent list (that exact heading). `/movies-list/` and `/kshows/` were probed and return the SAME rows as home, so they add nothing and were not added. |

### KissKH — JSON API (kisskh.nl → kisskh.ovh → kisskh.co rotation)

| Catalog | Type | API |
|---------|------|-----|
| KissKH Latest Update | series | `/api/DramaList/List/{page}?type=KC&sub=0&sort=latest` |
| KissKH Top K-Drama | series | `type=K&sort=rate` (popular fallback) |
| KissKH Top C-Drama | series | `type=C&sort=rate` (popular fallback) |
| KissKH Hollywood | series | `type=H&sort=latest` (TV rows) |
| KissKH Hollywood Movies | movie | `type=H&sort=latest` (Movie rows) |
| KissKH Anime | series | `type=A&sort=latest` |
| KissKH Upcoming | series | `type=KC&sort=latest&status=Upcoming` (ongoing fallback) |

kisskh Cloudflare-challenges datacenter egresses (verified from the DEPLOYED
worker on 2026-09-10: nl/ovh/co all 403). Every request rotates
nl → ovh → co (first success pinned). **TMDB rescue (v4.1.0)** — when every
mirror fails, the sections fall back to TMDB lists that mirror the section's
intent, never empty:

| Catalog | Live API | TMDB rescue (API blocked) |
|---------|----------|---------------------------|
| KissKH Latest Update | `/api/DramaList/List/{page}?type=KC&sub=0&sort=latest` | `/trending/tv/week` |
| KissKH Top K-Drama | `type=K&sort=rate` (popular fallback) | `/discover/tv?with_origin_country=KR&sort_by=popularity.desc` |
| KissKH Top C-Drama | `type=C&sort=rate` (popular fallback) | `/discover/tv?with_origin_country=CN\|TW\|HK&sort_by=popularity.desc` |
| KissKH Hollywood | `type=H&sort=latest` (TV rows) | `/discover/tv?with_origin_country=US&sort_by=popularity.desc` |
| KissKH Hollywood Movies | `type=H&sort=latest` (Movie rows) | `/discover/movie?with_origin_country=US&sort_by=popularity.desc` |
| KissKH Anime | `type=A&sort=latest` | `/discover/tv?with_genres=16&with_origin_country=JP&sort_by=popularity.desc` |
| KissKH Upcoming | `type=KC&sort=latest&status=Upcoming` (ongoing fallback) | `/discover/tv?with_origin_country=KR\|CN\|TW\|HK&first_air_date.gte=today` |

Rescue rows are emitted in the SAME shape as normally TMDB-matched rows
(`tmdb:<id>`, overview, year, rating, backdrop) — the paired plugins already
resolve those on-device. The direct lane (`asian:kh-<dramaId>`) is untouched
and the rescue is never consulted while any mirror works. Every catalog stays
**fail-soft** (rescue failure = empty rows + `/health` hint, never a 500).
Param candidates are tried in order at runtime, so untestable params self-heal.
Probed and rejected for rescue duty (2026-09-10): free CORS proxies
(allorigins, codetabs, r.jina.ai, cors.lol, whateverorigin — all receive the
same CF challenge or error) and the kisskh.org/.asia/.cc WordPress clones
(different engine, incompatible ids).

### AnimeTVSlash — animotvslash.org

| Catalog | Type | Site section / URL |
|---------|------|--------------------|
| AnimeTVSlash Latest Release | series | `/anime/?status=&type=&order=update` — the home section's own View All URL |

### Pencuri — pencurimovie.baby (ww44.)

| Catalog | Type | Site section / URL |
|---------|------|--------------------|
| Pencuri Movies | movie | `/movies/` (paginated `/movies/page/N/`) |
| Pencuri Series | series | `/series/` (paginated `/series/page/N/`) |
| Pencuri Malaysia | movie (mixed) | `/country/malaysia/` (paginated `/page/N/`) |
| Pencuri Indonesia | movie (mixed) | `/country/indonesia/` |
| Pencuri Japan | movie (mixed) | `/country/japan/` |
| Pencuri Thailand | movie (mixed) | `/country/thailand/` |
| Pencuri Most Viewed | movie (mixed) | `/most-viewed/` |
| Pencuri Most Rating | movie (mixed) | `/most-rating/` |
| Pencuri Top IMDb | movie (mixed) | `/top-imdb/` (the site's `/top-imdb/page` alone is a 404; pagination is `/top-imdb/page/N/`) |

Series rows carry `/series/` prefixed hrefs on the live site; rows are typed
from that prefix or the site's `mli-eps` badge. `pencuri-movies` /
`pencuri-series` keep only their own type (the `/movies/` page's sticky series
block drops out); the country/feature boards mix movies and series exactly like
the original v5.2.0 sections. Search is WordPress-standard `/?s=query`
(verified live: returns `ml-item` rows).

## Metadata

Every row carries as much metadata as the source + TMDB can provide:
- **TMDB-matched rows**: `id: tmdb:<id>`, name, site poster (TMDB fallback),
  backdrop, overview, release year, rating.
- **Fallback rows** (TMDB-unmatched, visible unless `ASIAN_KEEP_UNMATCHED=0`):
  site poster (placeholder-filtered), site description, year, site-side rating,
  and a **source-scoped id the paired plugins resolve DIRECTLY** — the tail is
  the source site's own address, zero title searching:

| Id | Played by | Navigation |
|----|-----------|------------|
| `asian:pmh-<slug>` | pinoyhub.js | `/movies|series/{slug}` → real `/episodes/{slug}-SxE` |
| `asian:ks-<slug>` | asianhub.js | kissasian `/series/{slug}/` → episode → extractors |
| `asian:va-<slug>` | asianhub.js | viewasian `/drama/{slug}/` → episode → extractors |
| `asian:kh-<dramaId>` | asianhub.js v2.6.0 | kisskh API detail → episode → local kkey → HLS |
| `asian:an-<slug>` | animotvslash.js v5.3.0 | `/anime/{slug}/` → real `-episode-{n}` link → extract |
| `asian:pen-<slug>` | pencuri.js v1.1.0 | `/series/{slug}/` or `/{slug}/` (movie) or its real `/episode/{base}-season-N-episode-M` page → tab embeds → extract |

Since v5.3.0 the addon itself serves `/meta` for the `pmh-` and `pen-` tails
(real detail-page meta + Stremio `videos[]` for series), so Nuvio opens full
details for every fallback row instead of erroring. `asian:pen-<slug>:<s>:<e>`
episode ids (emitted by the meta videos) are resolved per-episode by
pencuri.js; `asian:pmh-<slug>:<s>:<e>` ones by pinoyhub.js v5.8.0+.

## Endpoints

- `GET /manifest.json`
- `GET /catalog/{movie|series}/{catalogId}.json`
- `GET /catalog/{movie|series}/{catalogId}/{search=..&genre=..&skip=..}.json`
- `GET /meta/{movie|series}/{id}.json` — mal:/anikoto: (Jikan/Anikoto) and,
  since v5.3.0, `asian:pmh-`/`asian:pen-` detail-page meta
- `GET /health` — 8 per-source probes (pinoymovieshub, kissasian, viewasian,
  animotvslash, pencuri, kisskh, anikoto, tmdb) with latency + actionable hints
- `GET /` — human index of all catalogs

Verified against both Nuvio apps: NuvioMobile (Kotlin) and NuvioTVSmart (JS)
consume path-segment extras, `{ metas: [...] }`, per-catalog `pageSize` and
declare-`skip`-to-paginate. The per-catalog resolved-item buffer maps source
pages onto `skip` without stalls or repeats.

## Deploy

- **Wrangler**: `npx wrangler deploy` from this folder (`wrangler.toml` included).
- **Dashboard paste**: paste `worker-bundle.js` (single-file esbuild bundle of
  `worker.js` + `core.js`) into a new Worker. Re-paste to update.

Optional env/vars: `TMDB_API_KEY`, `PINOY_SITE`, `KISSASIAN_SITE`,
`VIEWASIAN_SITE`, `ANIMO_SITE`, `KISSKH_HOSTS` (comma-separated),
`ASIAN_PAGE_LIMIT`, `ASIAN_MAX_PAGES`, `ASIAN_KEEP_UNMATCHED`.

## Tests

- `node test-catalog.js` — 95-check offline regression suite (manifest shape,
  all five parsers with fixtures, genre label mapping, meta shapes, v5.3.0
  pmh/pen detail-page meta, page-URL builders via canned fetch, the v4.1.0
  kisskh TMDB rescue, routing).
- `node ../scripts/verify-asian-catalog-workerd.mjs` — boots the actual
  `worker-bundle.js` in miniflare/workerd with canned upstreams and asserts
  health (8 sources up), manifest (21 catalogs) and catalog endpoints.

## v5.7.0 — cinejoy full-chain lane (repo 4.19.0)

New `POST /cjs` route next to `/cjg`. The provider (cinejoy.js v1.6.0+) sends ONE text request `{title,type,year,imdb,tmdb,server,season,episode}`; the worker runs the ENTIRE cinejoy chain server-side (target build -> enc-dec.app enc-cinejoy -> binary POST api.shegu.st/g -> dec-cinejoy) and returns final stream JSON `{ok, streams:[{id,playlist,qualities,captions}]}`. Nothing binary crosses the NuvioMobile bridge and the device no longer needs to reach enc-dec.app. Guards: POST-only, JSON body required, title required, fixed upstreams only (no open proxy), 502 fail-soft.

## v5.6.0 — cinejoy /g relay (repo 4.18.0)

New route: **`POST /cjg`**. cinejoy's API (`api.shegu.st/g`) speaks raw
octet-stream on both legs, which NuvioMobile's string-only plugin bridge
cannot send or decode (bodies go through `toString()`/UTF-8, responses are
UTF-8-decoded text). The route closes that gap:

1. cinejoy.js v1.5.0 sends the encrypted request token as **base64url text**
   (produced locally from the `enc-cinejoy` payload).
2. The worker decodes it, performs the real binary `POST https://api.shegu.st/g`
   (fixed upstream — no open proxy), and returns the response bytes as
   base64url text inside `{ ok, status, b64 }`.
3. The provider decodes the bytes and continues into `dec-cinejoy` exactly as
   on runtimes with native binary fetch (Node / Cloudflare / NuvioTVSmart).

Only `api.shegu.st/g` is ever called, bodies are capped at 16 KB, garbage
bodies get 400. The addon catalog layout (28 catalogs) is unchanged from the
user-validated 5.5.0 set. **User action**: redeploy `worker-bundle.js`
(dashboard paste or `wrangler deploy`), then in the Nuvio plugins screen open
Cinejoy → settings and paste your worker base URL
(`https://<your-worker>.workers.dev`) as the "Cinejoy relay base URL".
