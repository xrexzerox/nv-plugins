NV-PLUGINS UPLOAD — v3.13.0 (81 providers)
============================================
This round: providers/pinoyhub.js 5.5.0 -> 5.6.0 (series-args hardening).
The Nuvio app can pass IMDb tt-ids, missing/zero-padded season/episode and
type aliases to plugins; v5.6.0 handles all of them (14/14 app shapes
tested green for Queen Mantis S1E1, movie path regression-clean).

Upload ALL files to xrexzerox/nv-plugins main branch, same paths:
- manifest.json                 3.12.0 -> 3.13.0
- providers/pinoyhub.js         5.5.0 -> 5.6.0  (THE series fix)
- providers/kisskh.js           4.2.0 (kept)
- providers/asianhub.js         2.4.0 (kept)
- everything else unchanged
- addons/asian-catalog/*        unchanged (still needs CF dashboard paste of worker-bundle.js)

AFTER UPLOAD: in the app remove + re-add the plugin (manifest URL:
https://raw.githubusercontent.com/xrexzerox/nv-plugins/main/manifest.json)
or wait for the 6-hour auto refresh. Then retest Queen Mantis S1E1.
