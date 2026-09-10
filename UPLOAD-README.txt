NV-PLUGINS UPLOAD — v3.14.0 (40 providers, All-in-One REMOVED)
===============================================================
WHAT CHANGED
============
1) All-in-One-Nuvio removal (user request). The repo is back to the ORIGINAL
   40 providers: pinoyhub, asianhub, tagalogtorrents, animotvslash, kisskh,
   animepahe, cinemacity, 4khdhub, okru, hexa, vidzee, vidrock, vidfast, ...
   All 61 merged All-in-One scrapers (torrentio, hianime, vidsrc, vixsrc,
   allanime, cineby, onlykdrama, ...) were DELETED, and the three files the
   merge had overwritten (vixsrc.js, animekai.js, dahmermovies.js) were
   restored to their originals.

2) Deep review + fixes (same bug family as the pinoyhub series fix):
   - kisskh.js 4.3.0: IMDb tt-id resolve, series/show/tvshow aliases,
     null S/E -> S1E1 default, padding-safe S/E, mirror-rotated detail fetch.
   - asianhub.js 2.5.0: IMDb tt-id resolve, null S/E -> S1E1 default,
     'tvshow' alias (was mis-detecting TV as movie), kisskh lane kkey now
     generated LOCALLY first (16/16 byte-verified vs reference) with
     site-keygen + Google Script as fallbacks.
   - tagalogtorrents.js 1.2.0: IMDb tt-id input used to return ZERO torrents
     from all 4 lanes; now resolves via TMDB find and keeps the tt-id as the
     Stremio/apibay IMDb key even if TMDB fails. "series"/"tvshow" types were
     treated as movies -> normalized. E2E: tt10156112 -> 6 torrents.
   - animotvslash.js 5.2.0: tt-id resolve, aliases, null S/E -> S1E1,
     padding-safe episode numbers. E2E: tt13293588 S3E11 -> 5 streams.

FILES
=====
manifest.json (3.14.0, 40 scrapers) + providers/ (50 files: 40 listed +
10 legacy unlisted) + addons/asian-catalog/ + build.js + README.md.

AFTER UPLOAD: also upload nvv-fix-1.3.0.zip to github.com/xrexzerox/nvv
(the phone manifest), then remove + re-add the plugin on the device.
