NV-PLUGINS UPLOAD — v3.12.0 (81 providers)
============================================
Upload ALL files to xrexzerox/nv-plugins main branch, same paths:
- manifest.json                 3.11.0 -> 3.12.0
- providers/kisskh.js           4.1.0 -> 4.2.0  multi-mirror failover (kisskh.nl -> ovh -> co) + local kkey
- providers/asianhub.js         2.3.0 -> 2.4.0  kisskh.nl mirror priority + mirror error failover
- providers/*.js                39 others unchanged
- addons/asian-catalog/*        unchanged (still needs CF dashboard paste of worker-bundle.js)

AFTER UPLOAD: in the app remove + re-add the plugin (manifest URL:
https://raw.githubusercontent.com/xrexzerox/nv-plugins/main/manifest.json)
or wait for the 6-hour auto refresh. Then retest Queen Mantis S1E1.
