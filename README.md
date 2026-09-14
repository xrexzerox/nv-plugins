# NV Plugins

Clean Nuvio provider collection migrated from the canonical NVV provider set.

The import workflow keeps only the canonical provider implementations registered in `manifest.json`.

## v4.34.0 — CINEJOY RE-ADDED as v2.0.0 hybrid (zero-config universal lanes)

User request: bring cinejoy back, using github.com/jamilkj18434-boop/CineJoyScraper as a working reference. That repo (Playwright driving cinejoy.to + m3u8 interception) proves the site is alive. A headless-browser trace plus a from-Node chain replay confirmed the full picture on 2026-09-14: cinejoy.to is up; the player decrypts via api.shegu.st/crush.wasm and POSTs api.shegu.st/g (binary request AND response); the provider's native chain replays perfectly from Node (servers 8x ok -> enc-cinejoy -> binary /g 200 -> dec-cinejoy -> real HLS on info.movieboxnoob.cc); /g REJECTS text bodies (404), so the binary leg is mandatory and NuvioMobile (UTF-8 string-only bridge) can never use it without the user's worker relay.

What changed in cinejoy.js v2.0.0: NEW Lane T1 (universal, zero-config) - the 4.33.0-verified WINGS lane (api.speedracelight.com, mvm1 keystream, partial-result collection), 4 quality rows per title, movie+tv; NEW Lane T2 (movies, zero-config) - stremio-moviebox-1.onrender.com (the MovieBox CDN family cinejoy.to itself streams from); native shegu chain kept byte-identical for NuvioTV/PC and relay-configured Mobile; lanes run in parallel, merged + URL-deduped; postfilter tail cap 12s -> 20s. Live tests: Mutiny 6 rows, Fight Club 9, Breaking Bad S1E1 6.

(Superseded the same day by v4.35.0 below - the device zero-row cause was found and fixed.)

## v4.36.0 — CINEJOY v3.0.0 DEVICE-REALISTIC WATERFALL (fetch-count bounded)

**Device report:** 4.34.0 and 4.35.0 both showed 0 streams on device while resolving 5-9 rows in node. This cycle the plugin runtime itself was audited instead of the lanes:

- `PluginRuntime.kt`: the app kills the whole provider call at `withTimeout(60_000)`.
- `quickjs-kt-android-1.0.5-nuvio.aar`: **no setTimeout anywhere** — every `Promise.race` cap/deadline in v2.x was inert on device (`hasTimers()` false).
- `FetchBridge.kt`: each fetch is one **blocking** `runBlocking` host call — "parallel" lanes run sequentially on device; OkHttp allows 60s per request.
- `NuvioTVSmart pluginWorker.js`: same string-only bridge (`body: String(body)`) — binary `/g` impossible on TV too.
- Net effect for v2.1.0 on device: native shegu sweep (~12 doomed fetches) + Render addon cold wake (30-60s blocking) + WINGS fan-out + subs, all sequential and uncapped → past the 60s kill → **0 rows**. Node sandboxes (timers + real parallelism) could never reproduce it.

**Fix (v3.0.0):** bound the provider by **fetch count**, not timers; early-return on first rows.
- S1 WINGS one server at a time (cdn → m4uhd → lamovie), TMDB meta + /seed cached per title (repeat calls = 1 fetch)
- S2 vidlove moviebox2 (movie+tv, 1 fetch)
- S3 native shegu chain only when it can work: cjRelay configured (device) or node runtime (tests); skipped with 0 fetches otherwise
- Removed the onrender MovieBox addon lane (cold wake = 30-60s blocking fetch)
- Subs: wyzie only when the stremio source returned nothing

Typical device success path: 2-4 blocking fetches (~3-6s). Worst all-fail path ~9 fetches. Live-verified lanes: WINGS 1080p rows for Spider-Man: Brand New Day (TMDB 969681) in 2.6s; WINGS 4K + native HLS for Silo S1E1 (TMDB 125988).

## v4.35.0 — CINEJOY v2.1.0 DEVICE HARDENING (the zero-row cause, fixed)

Device report on 4.34.0: cinejoy registered but the sheet stayed empty, while the same build resolved 6-9 rows from the sandbox. A new Mobile-fidelity sandbox (vm context whose fetch mimics NuvioMobile's AddonPlatform bridge: string-only bodies, UTF-8-mangled binary, string responses, injectable per-call latency) reproduced the device exactly and exposed the cause:

### Root cause: subtitles were eating the stream budget
- getStreams ran scrape() (WINGS flush needs up to 14s on mobile networks) and then withSharedSubs with TWO SEQUENTIAL 12s subtitle fetches - all inside the postfilter's 20s tail race. 14s + 24s = guaranteed tail kill -> [] on device. Fast datacenter tests masked it (subs 403 in <1s there).

### Fixes (cinejoy v2.1.0)
- Subtitles are now race-capped at 2.5s - subs are garnish, streams are the product; on slow networks attachment simply skips
- NEW 14.5s merge deadline: the lane merge resolves with whatever lanes have settled by then, so the 20s tail cap can mathematically never be reached
- NEW Lane T3: api.vidlove.cc moviebox2 (MovieBox backend in the vidlove ring, 4.32.0-proven shape, tmdb id, 6.5s cap, junk-relay guard) - movie+tv backup lane; currently zero upstream coverage but mechanically verified, so it adds rows the moment the upstream recovers
- Sandbox-verified under the Mobile bridge at 0ms AND 800ms per-call latency: rows>0 for movie and tv, native binary lanes die exactly like on device (6/6 mangled), and every call finishes <=8.3s wall clock - was 19.4s before the fix
- Full Node test (native binary lanes live): Mutiny 6 rows / Fight Club 8 rows / Breaking Bad S1E1 3 rows - the three lanes cover each other (when WINGS went slow, the native shegu chain delivered; when native lacks a title, WINGS does)

## v4.35.0 pack facts
- 32 provider files, manifest 1:1 (4.35.0), validate-manifest 0 warnings 0 errors
- Only providers/cinejoy.js + manifest.json + README.md differ from 4.34.0
- asian-catalog addon/worker UNCHANGED - no CF Worker redeploy needed
- Untouched per standing rule: kisskh, asianhub, pinoyhub, tagalogtorrents, miruro, pencuri, netmirror (English-only), cinemacity (Tagalog)

## v4.33.0 — The 12-provider recovery release (verified-lane merge)

User device report on 4.32.0: vidlink showed 1 dead stream; vidlove, videasy, vidfast, moviebox, moviesdrive, peachify, movieshunt, cinefreak, cinemacity, cineby showed no streams at all; anikototv rows would not play. Every lane in this cycle was live-verified from the build sandbox on 2026-09-13 before shipping (Fight Club 550 movie + Breaking Bad 1396 S1E1).

### The verified WINGS lane (new shared fallback)
- One self-contained, dependency-free lane (plain JS, QuickJS/Hermes-safe: no URLSearchParams, no AbortController, no node APIs) targeting the speedracelight backend that VidEasy/Cineby already use - seed -> sources-with-title -> custom keystream decrypt (ported byte-for-byte from cineby.js) -> direct m3u8 rows with vidking.net referers.
- Collects PARTIAL results: a hanging server can no longer zero the whole lane (the old Promise.all gate was the flake mechanism).
- Merged into 9 providers via an auto-injected wrapper that never rejects, caps both lanes (native 20s / wings 20s), dedupes by URL, and drops the junk VidAPI relay rows (tungtungtungsahur.cfd YT-rips at 640x266).

### Root causes found per provider
- vidlink v1.5.0 - the media CDN (bcdnxw.hakunaymatata.com) 429s "vidlink.pro" referers; the API ships each quality with its own filmboom.top referer, now applied. Verified: 206 video/mp4 with the fixed header vs 429 before. WINGS lane appended.
- cineby v2.5.0 - estimateHlsSize (1 master fetch + 5 segment HEADs per stream) pushed every call past the native 8s tail cap on device networks -> empty sheet on device while fast networks looked fine. Size estimation removed (1.5s full call now).
- videasy v2.2.0 - server race 6.8s -> 9s, hard tail cap 12s -> 20s (mobile TMDB+seed+servers exceeded 12s -> tail returned []).
- vidfast v6.3.0 / moviebox v1.3.0 / peachify v2.3.0 / vidlove v2.1.0 - native lanes only emitted the junk VidAPI relay row; WINGS rows now come FIRST, relay rows dropped.
- moviesdrive v5.2.0 - site migrated to a JS-rendered search (search.html + Typesense search.php) and hubcloud search-recover pages the old parsers cannot read; its new catalog no longer even carries tt0137523. WINGS first, native kept for old-format pages.
- movieshunt v2.5.0 - movieshunt.run 301s to movieshunt.monster whose search is JS-rendered (lookup.php JSON); old entry-title parser found 1 unusable row. WINGS first.
- cinefreak v1.1.0 - upstream search route dead (re-confirmed live); WINGS first. Re-enabled in the manifest.
- cinemacity v5.1.0 - cinemacity.cc sits behind a Cloudflare managed challenge (403 from datacenter IPs across all 3 identity ladders; device IPs normally pass). Native (Tagalog/Filipino) lanes stay FIRST, WINGS appended so titles still resolve when CF blocks.
- anikototv v1.3.0 - MegaPlay CDN (ncdn.imgnex.top / fetch.nexabloom.top) rejects datacenter traffic and the device report says rows do not play; the decoded 4.26.0 AllAnime provider is embedded IIFE-scoped as an independent anime lane (search POST verified live; the sources endpoint is captcha-gated from datacenter IPs but normally open to residential IPs). AllAnime rows first, MegaPlay lanes kept.

### Notes
- The WINGS backend occasionally throttles bursts of requests; on-device (one title at a time) this is rarely hit, and every provider still carries its native lane as a second source.
- untouched per standing instruction: kisskh, asianhub, pinoyhub, tagalogtorrents, miruro, pencuri, asian-catalog addon (no CF worker redeploy needed this cycle).

## v4.26.0 — Root-cause dead-provider purge + AIO-exact rebuilds + Purstream + Torrentio debrid

User supplied `all.zip` (61 "decoded" AIO ports) as a decode aid. Verdict after full verification: the `*api.xyz` endpoint family inside it (netmirrorapi.xyz, cinemacityapi.xyz, ...) is FABRICATED - every domain is DNS NXDOMAIN, so those ports cannot run. The genuine gains this cycle came from re-decoding AIO's real obfuscated sources and a full live audit of all 63 providers.

### Full pack live audit (the "many bugs" root cause)
- 36-40 of 63 providers returned ZERO rows for hit movies/series from live calls - the stream sheet has been waiting on dead lanes every tap (the remaining "slow" complaint). Traced each: upstream WASM-sealed (1shows - makimaDL wasm, same class as cinejoy), upstream DNS-dead (peachify mirrors, vidsrc decoder, goated origin 522, zinkmovies HTTP 451, cinefreak wp-json route removed, streamflix unreachable, anidb 503), or logic loss in old ports.
- AIO ground truth: decoded AIO's own providers for the same lanes - AIO behaves identically on the dead ones (their upstreams are gone for everyone).

### Fixed (AIO-exact decodes, all live-verified in an app-faithful sandbox)
- animekai v2.0.0 - 10 rows on Frieren S1E1 (embed extraction restored)
- castle v2.0.0 - 3 rows on Wicked (security-key AES-CBC local decryption restored)
- kurage v2.0.0 - 2 rows on Frieren S1E1 (tRPC source resolution restored)
- videasy v2.0.0 - 5+ rows on Wicked (seed -> 9-server fan-out restored)
- Each carries a light 9-12s deadline wrapper so the sheet is never stalled.

### Added
- purstream v1.0.0 - NEW provider (AIO's French VF/VOSTFR/MULTI source), rebuilt from AIO's decode and verified END-TO-END live: api.purstream.club search -> movie sheet / tv episode endpoints -> 1080p MULTI m3u8 (Wicked Part II + The Last of Us S1E1 verified).
- torrents v1.6.0 - debrid settings: provider gear icon now offers Debrid Provider (Real-Debrid/Premiumize/AllDebrid/TorBox/...) + API key; the key is injected into the Torrentio URL so torrents resolve to INSTANT cached http links instead of magnets.

### Re-pointed
- vixsrc v3.1.0 - komiknostalgia.id (AIO's wrapper) is DNS-dead; vixsrc.js now targets the live origin https://vixsrc.to (Cloudflare may still gate datacenter IPs; device IPs normally pass).

### Disabled (enabled:false, reason in manifest description - re-enable by flip)
1shows (WASM-sealed, impossible in Nuvio runtime), peachify (all mirrors DNS-dead), vidsrc (decoder upstream dead), goated (origin 522), zinkmovies (HTTP 451 legal block), cinefreak (wp-json search route removed upstream), streamflix (unreachable), anidb (upstream 503). cinejoy stays disabled since 4.25.0.

Untouched per standing instruction: kisskh, asianhub, pinoyhub, tagalogtorrents, miruro. asian-catalog addon unchanged (no CF Worker redeploy needed).

## v4.25.0 — Full All-in-One-Nuvio merge: every remaining provider, fully decoded

User report on 4.23.0: "many bugs, cinejoy not working, AIO loads all stream links faster, netmirror still only-alpha, some AIO files not fully decoded after merge". This release is the complete AIO merge + a speed pass, all live-probed:

- **All remaining AIO providers merged (34 new, 63 total)**: 1Shows, AllMovieLand, AllWish, CineFreak, CTGMovies, DooFlix, FibWatch, Goated, GramCinema, HDGharTV, HDHub4u, HiAnime, Kurage, MoonFlix, MovieBox, Movies4u, MoviesDrive, Nakios, OnlyKDrama, Peachify (full decode of the 600KB build), ShowBox, VidEasy, VidLove, VidSrc, VixSrc (full decode of the 1MB build), XPass, ZinkMovies + the anime lanes AllAnime, AniDB, AnikotoTV, AnimeKai, AnimePahe, Animetsu, AnimeWorld. Every file: string tables resolved, obfuscator machinery stripped, node-core requires fail-soft (`__nvRequire`), embedded-polyfill globals (`window/self/document/navigator`) aliased so they cannot throw in Nuvio's QuickJS, 8s per-call + 8s overall deadlines, nvio post-filter (en/tl audio gate, >=720p, cross-provider dedupe). Excluded per standing instructions: Hindi providers (DesiFlix, HindMoviez, Einthusan, AnimeSalt), duplicate backends (Purstream == Movix, DahmerMovies-4K == DahmerMovies, AIO's Torrentio == this pack's torrents), the undecodable French Anime-Sama, and PersianStremio (Persian-only rows would never pass the en/tl gate). ShowBox/GramCinema need a user token setting (AIO parity) and fail fast without it.
- **"Some files not fully decoded" — closed**: the whole pack now passes a machine scan for active string-table decoders; zero obfuscated code remains (63/63 files).
- **netmirror v13**: the Alpha candidate chain now resolves IN PARALLEL (v12 chained candidates sequentially — 3 x a stalled watchpvr fetch stacked to 17s with zero rows; that was both the "no stream" and the "slow" complaint). The VidSpark (moviesapi.to vidora) lane is verified ALIVE with the same key — new releases answer in ~350ms with proxied HLS (verified to the variant level); titles vidora has not encoded answer 404 "Movie not yet encoded" and the lane fails fast. Lane caps: Alpha 9s, NewTV 6s, VidSpark 6s, overall 10s; the full late result is late-cached for the next open of the sheet. Live: Mutiny 3 rows in 3.6s (Alpha 1080p first + 2 VidSpark), GoT Alpha row at 7s, tt-ids OK.
- **torrents 1.4.0**: per-lane timeout 20s -> 6s, overall 20s -> 8s. AIO's torrentio only "felt faster" — this pack used the same torrentio.strem.fun instance, but a stalled TorrentsDB lane could hold the sheet for 20s.
- **Speed pass on every provider**: the overall provider cap drops 12s -> 8s on all ports (netmirror 10s, cinejoy 12s by its 8s-completing chain + margin). The stream sheet is bounded by its slowest provider, so the worst case falls from ~17s to ~10s, with typical answers in 1–4s. AIO's speed parity comes from these caps + the parallel lane structure, not from removing providers (on-device IP gating is why most datacenter probes show 0 rows for lanes that answer fine on retail/mobile IPs — the same lanes make AIO "fast" there).
- **cinejoy 1.8.0**: the chain is re-verified live (3 rows). The Mobile transport limit is now verified at app-source level: NuvioMobile's fetch bridge encodes request bodies to UTF-8 and decodes responses as UTF-8 strings only (AddonPlatform.android.kt), so the binary shegu /g legs can never succeed there — on Mobile the asian-catalog worker relay (v5.7.0+ /cjg + /cjs) is REQUIRED: paste your worker base URL into the "Cinejoy relay base URL" setting. NuvioTV/PC resolve without configuration.
- kisskh / asianhub / pinoyhub / tagalogtorrents / miruro / pencuri / cinemacity untouched per standing instructions. All-in-One-Nuvio used as a read-only source; nothing pushed to it.

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

## v4.29.0 — MIRURO FIXED (MegaPlay enc decrypt) + torrentio.js registered + pack audit

### miruro v2.8.0 — the anime zero-rows root cause, fixed
MegaPlay (miruro's stream chain) replaced its `getSourcesNew` response: the plain `{sources:{file}}` body is gone upstream and the stream URL now ships **AES-encrypted in an `enc` field** — that is why miruro (and the anime lanes) stopped giving streams. The fix reverses MegaPlay's own player (`e1-player.min.js`, self-defending eval loader) by running it in a sandboxed browser and hooking `crypto.subtle`, then ports the full chain into miruro.js:
1. `enc` (base64url → 128 bytes) → **AES-256-CBC** decrypt (key hex `693f4c4d5441783051362c3a7d353055` + 16 zero bytes, IV `W0;27ToaUpl_P%'c`, PKCS7) → `{"file":"…/master.m3u8"}`
2. **signed token**: `b64url("unixtime|md5a/md5b") + "." + b64url(HMAC-SHA256(key "MpCdnT0k3n!9f2K#xQ7vL5mR8wN1pY4s", "unixtime|md5a/md5b"))` — without it the CDN answers 403
3. Verified end-to-end on 5 live episodes (Frieren E1/E2, JJK, One Piece, Spy×Family): Sub 1080p + Dub 1080p rows with English/Tagalog subtitle tracks.
Note: miruro is an **anime-only** provider — non-anime titles correctly return no rows from it.

### torrentio.js — registered (user request) and its stream path fixed
The old file built `stream/movie:tt….json` (colon form) which torrentio answers with **404** — silent zero rows. Fixed to the Stremio convention: `movie/tt….json` + `series/tt…:S:E.json`. Now 15 magnet rows on both lanes.

### asian-catalog addon — audited healthy
Local run of the addon core: **27/28 catalogs return 20 items each** (only `anikoto-upcoming` is empty — upstream's list state). If catalogs are empty on device, redeploy `addons/asian-catalog/worker-bundle.js` via the CF dashboard, then remove+re-add the addon.

### Provider audit verdicts (datacenter + upstream probes)
- ALIVE: 4khdhub, castle, cineby, netmirror, pinoyhub, playimdb, purstream, topcartoons, torrents, **torrentio (fixed)**, videasy, vidfast (flaky), **miruro (fixed)**
- IP-gated from datacenter, expected to work on device (upstreams answer 200): pencuri, miruro-pipe, asianhub, cinemacity, kisskh, tagalogtorrents, movieblast, vidlove, moviebox
- Upstream changed / content-limited (fail-soft, stay enabled): fibwatch, moviesdrive, movieshunt, nakios, xpass (new jwplayer + anti-bot data lane), anikototv, hdhub4u (site lacks many EN titles)
- animotvslash (NOT in the pack): upstream replaced tryembed with a signed p2pplay.pro player — not portable; miruro covers the same content.

## v4.28.0 — USER-DEFINED PACK: exactly the providers from the user's zip, nothing re-added

Per user directive, the pack now contains **only the provider files present in the user's own nv-plugin.zip** — 31 files, of which **30 are registered** in the manifest. The 34 entries whose files were not in the zip are removed from the manifest (hexa, vidzee, vidrock, vaplayer, movish, movix, hianime, kurage, animekai, animepahe, animetsu, animeworld, allanime, animezey, vixsrc, cinejoy, streamflix, vaplayer-class others — all gone by design, NOT re-added).

- 21 files damaged by the corrupted 4.26.0 upload were **repaired byte-exact** from the verified build (same provider, same version): netmirror v14, 4khdhub, castle, cineby, cinefreak(spare/disabled), cinemacity, hdhub4u, movieblast, moviebox, moviesdrive, movieshunt, nakios, peachify(spare/disabled), playimdb, purstream, topcartoons, videasy, vidfast, vidlink, vidlove, xpass
- 10 files were already intact and are untouched: anikototv, asianhub, fibwatch, kisskh, miruro, pencuri, pinoyhub, tagalogtorrents, torrents + torrentio
- **torrentio.js ships unregistered on purpose**: torrents.js already covers torrentio.strem.fun plus torrentsdb with debrid settings — registering both would double the same rows. Flip it on by adding a manifest entry if ever wanted
- peachify + cinefreak remain registered-but-disabled (upstream dead evidence unchanged)
- Verify after upload: `providers/` on GitHub must contain **at least these 31 `.js` files** (netmirror.js must be 74,735 bytes). If older leftover files remain on GitHub from previous uploads, they are harmless - the manifest only loads the 30 registered providers - but deleting them keeps the repo clean.

## v4.31.0 — DEVICE-RUNTIME FIXES: miruro crypto bug, animotvslash restored, torrentio de-Unknowned + 5-seeder floor

Root cause of the 4.30.0 device failures: the Nuvio app runtime (QuickJS) provides CryptoJS ONLY through `require("crypto-js")` (a bundled AES-CBC + HMAC-capable polyfill) - it has NO `__nvRequire` global (that shim exists only in the repo audit harness). miruro v2.8.0 probed `__nvRequire` first and gave up, so every MegaPlay decrypt failed silently on devices while datacenter audits passed. Fixed by building a device-faithful harness (real Kotlin crypto polyfill + real requirePolyfill from the app source) and re-testing everything through it.

### Fixed
- miruro v2.9.0 - RESTORED the device-proven 85KB v2.7.0 base (fail-open post-filter, CDN hint rotation, ani.zip mal+ani dual-route, pipe circuit breaker, overall deadline) and grafted the 2026-09 MegaPlay API fix: getSourcesNew AES "enc" decrypt + signed master.m3u8 token; crypto via require("crypto-js") (device path) first. Device-harness verified: Frieren tmdb 209867 = Sub+Dub 1080p; **anikoto:8952 = 4 rows** (the Anikoto catalog lane is back); mal:52991 = 2 rows.
- animotvslash v7.0.0 - RESTORED the device-proven v5.4.0 implementation (site crawl, asian-catalog direct lane, WordPress search fallback, Auto+480/720/1080 whitelist) and grafted the site's own MegaPlay fallback (ru-watch ids -> ani.zip -> MegaPlay ani/mal routes, same enc+token scheme). Device-harness verified: tmdb 209867 E1 = Sub+Dub 1080p; asian:an-frieren-beyond-journeys-end:1:5 = Sub+Dub. Also tolerates the site's new "-N" suffixed episode slugs ("-episode-5-2/", observed live) and decorated catalog ids ("asian:an-<slug>:1:5").
- torrentio v1.2.0 - FIXED the "Unknown" streams: the parser read torrent.description, which Torrentio ships as NULL - seeders/quality/size all parsed from nothing ("👤 0 | UNKNOWN" on every row). Parsing now targets the real fields (title: 👤 seeders / 💾 size / ⚙️ tracker; name line 2: quality tag), verified against the live API. **USER RULE: rows under 5 seeders (or unparseable seeders) are dropped** - no 0-seeder rows. tt-ids (addon catalog rows) now resolve titles via TMDB /find (the old /tv/tt path 404'd -> "Unknown Title"). Verified: 15 rows/lanes, zero UNKNOWN labels.
- anikototv v1.1.0 - verified against the device crypto polyfill (works; unchanged).
- audit harness (repo-side): added device-harness.js (emulates PluginRuntime.kt + JsBindings.kt: device requirePolyfill, Kotlin crypto polyfill over node:crypto, IIFE wrap, 4-arg contract) - the class of bug above can no longer escape to devices unnoticed.

### Pack
- 32 provider files = 32 registered scrapers, manifest 4.31.0. Upload the zip contents to GitHub, then in Nuvio REMOVE + RE-ADD the plugins. netmirror.js must be 74,735 bytes on GitHub. No CF Worker redeploy (asian-catalog addon unchanged).

## v4.30.0 — ANIMOTVSLASH REBUILT (registered) + ANIKOTOTV FIXED (MegaPlay enc)

Report: "animotvslash and anikoto catalog doesnt show streams - review miruro.js and animotvslash.js".

### Why animotvslash.js had zero streams (audited live this cycle)
The site finished its player migration. Every episode page now embeds a single device-bound iframe `animotvslash.ru/watch/{anilistId}/{episode}?lang=sub|dub&embed=1`:
- tryembed.us.cc lane: "Forbidden: Invalid Request Signature" (already dead in the 4.28.0 cycle)
- plyr-player / cdn.videas.fr configs: no longer present on episode pages
- animotvslash.p2pplay.pro: removed from pages (was fingerprint-locked anyway)
- the .ru SPA's own API lanes (`/api/stream/sources/{senshi|miku|neko}`, `/api/stream/watch`) answer Cloudflare "Just a moment..." 403 even to a real headless Chromium with a warmed session — not portable to Nuvio's plain HTTP runtime.

### What the site itself does (captured in a real browser)
When its own servers fail, the .ru watch SPA falls back to MegaPlay's ani route `megaplay.buzz/stream/ani/{anilistId}/{ep}/{sub|dub}` → getSources → AES "enc" payload → tokenized master.m3u8 — the capture played Frieren E28 1080p end-to-end.

### animotvslash.js v6.0.0 (NEW registration, per user request)
Ports exactly that fallback as the provider's engine:
- TMDB ids map via api.ani.zip (`mappings?themoviedb_id=`) to the AniList id (24h cache)
- addon `asian:an-<slug>` / `asian:<slug>` rows navigate the site's own pages: /anime/{slug}/ → real -episode-{n}/ link → extract the .ru watch ids from the episode page → MegaPlay ani route (zero title matching; slug 404 falls back to the site's WordPress search)
- MegaPlay lane: enc decrypt (AES-256-CBC, keys reversed from e1-player.min.js) + signed master token (HMAC-SHA256) — the same proven 4.29.0 scheme; legacy plain responses still supported
- v5.4.0 quality whitelist kept (Auto master + 480p/720p/1080p); English/Tagalog subtitle tracks attached
- Movies fail soft (MegaPlay's ani route serves no movie ids). Live-verified: Frieren S1E1/E28 = Sub 1080p + Dub 1080p; addon direct lane E5/E28 = 2 rows.

### anikototv.js v1.1.0 — FIXED
Two stacked causes for "anikoto catalog doesnt show streams" on 4.28.0 and older:
1. MegaPlay's getSources AND getSourcesNew now ship the stream URL AES-encrypted in the "enc" field (plain sources.file retired) — the old code read only the plain body, so extractHLS returned null on every anime. extractHLS now decrypts enc and signs the CDN master token.
2. Even with a working URL, the SUB row label "Japanese (SUB)" tripped the nvio post-filter language gate (blocks \\bjapanese\\b) and the row was silently dropped — relabeled "SUB (JP)" (miruro-style labels pass the gate).
Live-verified: Frieren S1E1 (720p) / S1E5 (1080p) via mal/52991.

### miruro.js — already fixed in 4.29.0
miruro v2.8.0 decrypts MegaPlay's enc and covers the anikoto catalog ids too (`anikoto:{id}` → Anikoto API → MegaPlay s-2 lanes): anikoto:8952 E1 = 4 rows (Sub+Dub 1080p/720p), E9 = 2 rows. If the device still shows no anime streams after this upload, the installed pack predates 4.29.0 — remove + re-add.

### Pack facts
- 32 provider files, manifest 1:1 (32 scrapers; peachify/cinefreak remain disabled spares; torrentio stays registered from 4.29.0)
- validate-manifest.js: 0 errors; every provider syntax-checked; all fixes live-verified from the datacenter (device IPs may answer even better — most MegaPlay lanes are retail/mobile-friendly)
- asian-catalog addon unchanged — no CF Worker redeploy needed this cycle

---

## v4.32.0 — torrent merge + stream-source repair round

### torrents.js v2.0.0 — THE one torrent provider (torrentio.js removed)
User request: "combine torrentio and torrents, seems it redundant already, filter 5 minimum seeder, 720/1080p only, make torrents same pattern with torrentio".
- torrents.js now covers BOTH Stremio backends the two providers split before: torrentio.strem.fun AND torrentsdb.com (fan-out in parallel, rows merged and seeders-sorted, cap 15)
- parser = the device-proven torrentio v1.2.0 real-field pattern (Torrentio ships description=null; seeders/size/tracker live in the title blob, quality in name line 2)
- seeders < 5 dropped, unparseable-seeder rows dropped, rows without a parseable quality dropped — and the NEW whitelist keeps 720p/1080p ONLY (4K/1440p/480p/360p dropped)
- debrid gear-icon settings kept (debrid provider+key inject into the Torrentio path prefix; magnets otherwise resolved by Nuvio)
- torrentio.js deleted from the pack; manifest 31 scrapers = 31 files 1:1. Leftover torrentio.js files on GitHub from older uploads are harmless (unregistered = never loaded)

### anikototv.js v1.2.0 — playback fix for "rows show but stream won't play"
The row URL (tokened MegaPlay master on fetch.nexabloom.top) is proven correct (downloads the playlist with just a Referer, token reusable) — but some device networks cannot reach that one host, and anikototv emitted a single-host row while miruro (which plays) gets multi-host rows from its lanes. v1.2.0 emits the primary row PLUS an ALT row with the identical tokenized path on ncdn.imgnex.top — the token was live-verified host-agnostic (200 + M3U8 on both hosts). If one host is unreachable on the device network, the ALT row plays.

### videasy.js v2.1.0 — the "found streams but zero rows" bug
The provider queried its 10 speedracelight servers with no per-call deadline; the sweep finished ~11.6s, past the 8s provider cap, and every found stream was raced away to [] (verified in harness: "Found 4 stream(s) from Hydrogen" then rows:0). v2.1.0 collects results progressively with a 6.8s deadline — rows now return (The Boys 5 rows, Dune 5, Wicked 4).

### vidlove.js v2.0.0 — re-pointed to the live player API
player.vidlove.cc IS the 111movies.com app (same page bytes) and its bundle points at api.vidlove.cc with a 7-server ring: moviebox2 / warden / cinefreak / vidapi / ipcloud / tcloud / megaknight. Routes recovered: {api}/movie?id={tmdb}&mode=json&sources={server} (+season/episode for tv); source.url = the final HLS master (served directly). vidlove now queries vidapi/cinefreak/warden/tcloud/megaknight with a progressive 6.2s deadline. Live: The Boys S1E1 = VidAPI 1080p row; Dune = VidAPI row.

### xpass.js v2.0.0 — the site's own v3 data lane, ported
The old lane read `var backups=[...]` from the embed page — that array is now EMPTY; the page instead ships a signed dataUrl `/data/{kind}/{id}?...&token=...`. The /data response is an AES-GCM blob: key = SHA256("spv3-data-response|spv3-build-1787821613-50e5fc97c9dce367|{pathname}|{token}"), iv = first 12 bytes. Algorithm recovered from the site's own obfuscated player script and verified: decrypts to a backups[] list of playlist endpoints → playlist.json → sources[].file rows labeled per server (TIK/VIP/FIL...). Device crypto uses crypto.subtle AES-GCM (the Nuvio polyfill implements it); the decrypt was unit-verified against the live blob. Note: play.xpass.top TLS-fingerprints node/curl from datacenter IPs (curl passes, node 403s) — on a residential device the fetch normally passes; if CF blocks it, the provider returns [] in <100 ms (fail-soft, never stalls the sheet).

### moviebox / vidfast / peachify — api.vidlove.cc fallback lanes
- moviebox: the pengu.uk gateway was repurposed upstream (it now serves a vidlove-titled page). The onrender CINESCRAPE lane stays primary; the api.vidlove.cc moviebox2 lane (literally the MovieBox backend in the vidlove ring) answers when pengu is empty
- vidfast: vidfast.pro/vc pages are click-gated ("Click to reveal") so server-side scrape yields nothing; ipcloud+megaknight lane added
- peachify: old mirrors (eat-peach.sbs) are NXDOMAIN; peachify is RE-ENABLED with the warden+tcloud lane
- lane design: fallback runs in parallel with the provider's own lane, rows merged, each capped (2.6s own-lane wait, 6.5s API deadline) so the 8s provider cap is never hit

### moviesdrive.js v5.1.0 — why EVERYTHING was "no match"
new1.moviesdrive.christmas 302s to the current generation host (new4) and the redirect DROPS the query string — every search.php call returned the site's latest uploads instead of the searched title, so the matcher saw only unrelated candidates. v5.1.0 resolves the effective origin once per call and re-points the search; archive + hubcloud resolution parallelized to fit the 8s budget. Note: hubcloud link pages block datacenter IPs — final rows are device-dependent.

### Verified healthy, left as-is
- vidlink: healthy (The Boys 2 rows, Arcane 2 rows, Wicked 1 row). Titles where the upstream only has sub-720 renditions (e.g. Dune Part Two) correctly return 0 rows — the pack's quality gate
- cineby: healthy (3 rows on movie + tv lanes)
- cinefreak: cinefreak.nl removed its wp-json search route (rest_no_route) and the front-end is ad-walled — search impossible upstream; the same backend remains reachable through vidlove's cinefreak server
- cinemacity: Cloudflare-gated from datacenter IPs (device-validated historically); no code change this cycle
- movieshunt: upstream search returns ~1 unrelated hit for popular titles (content gap, not a matcher bug)
- standing rules respected: kisskh/asianhub/pinoyhub/tagalogtorrents untouched; netmirror English-only; cinemacity Tagalog; asian-catalog addon unchanged — no CF Worker redeploy needed

### Pack facts
- 31 provider files, manifest 1:1 (31 scrapers; peachify re-enabled)
- validate-manifest.js: 0 errors; every provider syntax-checked; in-zip md5 + export-shape + netmirror.js 74,735-byte sentinel verified
- Upload instructions: upload the zip contents to GitHub (manifest.json + providers/ + addons/ + scripts/ + README.md), then in Nuvio REMOVE + RE-ADD the plugins to evict cached JS. Verify providers/ shows 31 .js files and netmirror.js = 74,735 bytes.
