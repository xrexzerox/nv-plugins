NV-PLUGINS — v3.15.0 (Asian Catalog 4.0.0)
==========================================

WHAT THIS UPLOAD DOES
---------------------
1) addons/asian-catalog is now v4.0.0 — the catalog directory mirrors each
   website's REAL sections (user list, all paths live-verified 2026-09-10):

   - pinoymovieshub.win (MIRROR CHECKED: .win is canonical; .tv just redirects
     to it) -> NEW RELEASES (home featured carousel, with ratings),
     Recently Added Movies (/movies), Series (/series), Featured
     (/genre/featured), Coming Soon (/genre/coming-soon), and 17 genre chips
     that are the site's own sections - including "Rated R" -> /genre/sexy and
     "Wattpad Presents" -> /genre/wattpad (the site's own see-all targets).

   - kissasian.cam -> Hot Series Update (home hot block, continues on the
     site's own latest-updates ordering), Latest Release (/series/?order=update
     - the section's own View All URL), and the Recommendation genre tabs
     Fantasy / Friendship / Law / Romance / Sports (/genres/... verified 200).

   - viewasian.lol -> "Recently Drama , Movie and Kshow" (the home list; the
     nav's /movies-list/ and /kshows/ pages return the SAME rows, so no extra
     catalogs were added for them).

   - kisskh (JSON API, kisskh.nl -> ovh -> co rotation) -> Latest Update,
     Top K-Drama, Top C-Drama, Hollywood (+ Hollywood Movies), Anime,
     Upcoming. Datacenter egresses are commonly CF-challenged by kisskh: every
     catalog is fail-soft (empty rows + /health hint, never a 500) and may
     come alive on CF-worker egress; device playback is unaffected.

   - animotvslash.org -> Latest Release (/anime/?order=update, the View All URL).

   Rows carry FULL TMDB metadata (poster, backdrop, overview, year, rating);
   TMDB-unmatched rows stay visible with source-scoped ids the plugins resolve
   DIRECTLY to the sites' real pages: asian:pmh-/ks-/va-/kh-/an-...

2) Provider pairing (nv-plugins only; nvv intentionally untouched):
   - asianhub.js 2.5.0 -> 2.6.0: NEW kisskh direct lane for asian:kh-<dramaId>
     rows (API id -> detail -> episode -> local kkey -> HLS, mirror rotation
     inherited); recognizes + skips asian:an- rows.
   - animotvslash.js 5.2.0 -> 5.3.0: NEW direct lane for asian:an-<slug> rows
     (/anime/{slug}/ -> real episode link -> extract, zero searching); skips
     asian:kh- rows.
   - pinoyhub.js 5.6.0 -> 5.7.0: recognizes kh-/an- rows and skips them fast
     (no false pinoy searches on drama/anime ids).

DEPLOY (2 parts)
----------------
A) GitHub repo (xrexzerox/nv-plugins): upload EVERYTHING in this zip keeping
   the folder layout (manifest.json at root, providers/, addons/).
B) Cloudflare Worker (asian-catalog): open the CF dashboard -> Workers ->
   asian-catalog -> Edit code -> paste the ENTIRE contents of
   addons/asian-catalog/worker-bundle.js -> Deploy. Then open
   https://<your-worker>/health — it should report the per-source status
   (expect kisskh to challenge datacenter IPs; everything else up).

C) In Nuvio: remove + re-add the catalog addon URL (or wait for the 6h cache),
   then remove + re-add the plugins so 3.15.0 loads (manifest versions bumped:
   pinoyhub 5.7.0, asianhub 2.6.0, animotvslash 5.3.0).

VERIFY
------
- /manifest.json must show version 4.0.0 with 21 catalogs.
- /health shows 6 probes: pinoymovieshub, kissasian, viewasian, animotvslash,
  kisskh, tmdb.
- Offline suite: addons/asian-catalog/test-catalog.js -> 58/58 checks.
