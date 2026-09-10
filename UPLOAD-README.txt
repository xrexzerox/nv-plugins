NV PLUGINS 3.10.0 — GITHUB UPLOAD PACKAGE (16 commits of fixes)
================================================================
Your phone pulls plugins from raw.githubusercontent.com/main —
until these files are uploaded, the phone runs OLD pinoyhub 5.2.2
(which fails on titles like Queen Mantis S1E1).

HOW TO UPLOAD (github.com web):
1. Repo xrexzerox/nv-plugins -> branch main
2. "Add files" -> "Upload files"
3. Drag in the FOLDERS and FILES from this package (keep structure):
   - manifest.json                      <- REQUIRED (3.10.0)
   - providers/  (all 46 .js files)     <- REQUIRED (pinoyhub 5.5.0, asianhub 2.3.0, ...)
   - addons/asian-catalog/worker-bundle.js  <- ALSO paste into Cloudflare dashboard (catalog side)
   - addons/asian-catalog/  (rest), scripts/, docs, workflows  <- recommended
4. Commit changes (commit message: "v3.10.0 fix-all: URL alignment + device transport")

THEN ON THE PHONE:
- Fully close Nuvio (swipe away) and reopen -> retest Queen Mantis S1E1
- If still empty: Settings -> Addons -> remove "NV Plugins" -> re-add the SAME
  manifest URL (this forces a plugin-code refresh) -> retest

OPTIONAL CLEANUP (not in this package - delete via GitHub web "Delete file"):
- addons/pinoyhub-catalog/  (whole folder, superseded)
- addons/asian-catalog/a    (stray file)
