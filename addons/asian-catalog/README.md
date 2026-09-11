# Asian Catalog (community.asian.catalog) — v4.1.0

Stremio-protocol **catalog addon** for Nuvio (NuvioMobile + NuvioTVSmart). The
directory now **mirrors each website's real sections** (user enumerated them from
the sites on 2026-09-10; every path below was fetched and verified live that day).

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

## The directory (33 catalogs, grouped by source)

### Pinoy Movies Hub — pinoymovieshub.win (canonical mirror, verified)
Mirror check (user request): **pinoymovieshub.win** is the live canonical host —
`pinoymovieshub.tv` 301-redirects to it, `.org` CF-blocks datacenter IPs, and
`.ph/.net/.com/.es/.site/.cc/.me` are dead.

| Catalog | Type | Site section / URL |
|---------|------|--------------------|
| Pinoy New Releases | movie | NEW RELEASES — home featured carousel (`#featured-titles`, posters + ratings + years) |
| Pinoy New Releases • Series | series | same carousel, series rows |
| Pinoy Recently Added Movies | movie | Recently Added Movies → `/movies/` |
| Pinoy Series | series | Series → `/series/` |
| Pinoy Featured (Movies) | movie | Featured → `/genre/featured` |
| Pinoy Featured • Series | series | Featured → `/genre/featured` |
| Pinoy Coming Soon | movie | Coming Soon → `/genre/coming-soon` |
| Pinoy Movies by Genre | movie | 17 chips = the site's own genre sections |
| Pinoy Series by Genre | series | 17 chips = the site's own genre sections |

Genre chips are exactly the site's home sections: Action, Animation, Comedy,
Concert, Digitally Restored, Crime, Documentary, Drama, Fantasy, Horror, Indie,
Romance, **Rated R → `/genre/sexy`**, Sports, Stageplay, Tagalog Dubbed,
**Wattpad Presents → `/genre/wattpad`** (both label mappings verified against the
home sections' own see-all links).

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

### Anikoto API — anikotoapi.site (v5.0.0)

| Catalog | Type | Feed filter |
|---------|------|-------------|
| Anikoto Latest Episode | series | `/recent-anime` feed order (daily episode updates) |
| Anikoto New Release | series | current-year rows that are Currently Airing |
| Anikoto New Added | series | highest anikoto ids = most recently added |
| Anikoto Upcoming Anime | series | status "Not yet aired" |
| Anikoto Just Completed | series | status "Finished Airing" |

Rows carry `mal:` (fallback `anilist:`/`anikoto:`) ids — the paired **miruro**
plugin plays them directly through MegaPlay's mal/ani/s-2 routes with zero
mapping latency. `/meta/series/mal:{id}.json` builds full details (Jikan first,
Anikoto fallback; episodes preferred from Anikoto so airing shows show their
newest episode immediately).

### Pencuri Movie — pencurimovie.baby (v5.2.0)

| Catalog | Type | Site section / URL |
|---------|------|--------------------|
| Pencuri Movie Malaysia | movie | `/country/malaysia/` |
| Pencuri Movie Indonesia | movie | `/country/indonesia/` |
| Pencuri Movie Japan | movie | `/country/japan/` |
| Pencuri Movie Thailand | movie | `/country/thailand/` |
| Pencuri Most Viewed | movie | `/most-viewed/` |
| Pencuri Most Rating | movie | `/most-rating/` |
| Pencuri Top IMDb | movie | `/top-imdb/` |

Rows carry `pencuri:{slug}` ids read straight off the site's `ml-item`
listings (no TMDB matching; posters are the site's TMDB-hosted images).
`/meta/movie/pencuri:{slug}.json` builds details from the page itself
(og:title/og:image/description). The paired **pencuri** plugin resolves the
exact page and EVERY server tab on it to direct links, and attaches
**English subtitles** (OpenSubtitles via Stremio's keyless opensubtitles-v3
addon) to every row. Search extras map to the site-wide WordPress search;
`skip` walks the site's own `/page/N/` pagination.

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
| `pencuri:<slug>` | pencuri.js v1.3.0 | `/{slug}/` → every server tab resolved + English subtitles |

Generic `asian:<slug>` rows (stale CDN cache) stay supported as a search-based
fallback. Plugins that do NOT own a prefix skip it fast (no wasted searches, no
false matches).

## Endpoints

- `GET /manifest.json`
- `GET /catalog/{movie|series}/{catalogId}.json`
- `GET /catalog/{movie|series}/{catalogId}/{search=..&genre=..&skip=..}.json`
- `GET /health` — 6 per-source probes (pinoymovieshub, kissasian, viewasian,
  animotvslash, kisskh, tmdb) with latency + actionable hints
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

- `node test-catalog.js` — 72-check offline regression suite (manifest shape,
  all five parsers with fixtures, genre label mapping, meta shapes, page-URL
  builders via canned fetch, the v4.1.0 kisskh TMDB rescue, routing).
- `node ../scripts/verify-asian-catalog-workerd.mjs` — boots the actual
  `worker-bundle.js` in miniflare/workerd with canned upstreams and asserts
  health (6 sources up), manifest (21 catalogs) and seven catalog endpoints.
