# Updating the TMDB API key

The key is used by several providers for TMDB metadata, IMDb mapping, and
subtitle lookup. Do not search-and-replace provider files manually.

1. Copy `config/tmdb-key.example.txt` to `config/tmdb-key.local.txt`.
2. Open `config/tmdb-key.local.txt` and replace the placeholder with the new
   TMDB v3 API key.
3. From the `nv-plugin` folder, run:

   ```text
   node tools/update-tmdb-key.js
   ```

4. Run the provider syntax checks and package the updated provider files.
5. Do not upload `config/tmdb-key.local.txt` or commit it to GitHub.

The updater changes only 32-character hexadecimal literals on TMDB-related
lines. It does not change unrelated AES, HMAC, or provider signing constants.
After updating, verify that the key is present in the generated provider files
and that no placeholder remains.

TMDB key location in this package:

```text
work/nv-plugin/config/tmdb-key.local.txt
```

The Nuvio JavaScript runtime executes providers as standalone files, so the
key must be injected into those provider files before uploading the plugin.
The local key file is only the maintenance source; it is not loaded by Nuvio
at runtime.
