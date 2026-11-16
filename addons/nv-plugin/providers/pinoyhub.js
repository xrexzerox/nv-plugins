/**
 * PinoyMoviesHub Nuvio Plugin - Direct Streams Edition
 * Domain: pinoymovieshub.win (WordPress + Dooplay 2.5.5)
 * Supports: Movies & TV Shows
 * Language: Filipino / Tagalog / English
 * Author: xrexzerox
 * Version: 5.9.16
 *
 * v5.9.16 changelog (pack 4.54.21):
 *  - FIX: allow an 8-second grace window after Mixdrop becomes available so
 *    the slower Byse attestation/PoW lane can return its valid source too.
 *    The old collector returned immediately at the first Mixdrop result and
 *    discarded Byse even when Byse finished a few seconds later.
 *
 * v5.9.15 changelog (pack 4.54.20):
 *  - FIX: retain a freshly extracted Mixdrop row when device preflight returns
 *    a transient/host-specific failure. The old 4.46.0 package exposed the
 *    row and allowed the player to make the final attempt; dropping it here
 *    left only the already-expiring Byse row on affected networks.
 *  - FIX: restore the 20-second Mixdrop lane deadline used by the known-good
 *    4.46.0 provider. Mixdrop extraction and its activation probe can exceed
 *    15 seconds on TV networks.
 *
 * v5.9.14 changelog (pack 4.54.19):
 *  - FIX: do not stop the lane collector just because Byse returned two
 *    quality rows. The old row-count cutoff could finish before Mixdrop's
 *    lane completed, hiding the working Mixdrop source.
 *  - PERF: Mixdrop gets a bounded 15-second lane deadline; Byse remains a
 *    fallback but can no longer block Mixdrop visibility indefinitely.

 * v5.9.13 changelog (pack 4.54.18):
 *  - FIX: normalize literal backslash-escaped query separators (`\\&`) in
 *    Byse signed URLs. The CDN returns HTTP 404 when `\\&s=...` reaches the
 *    player instead of a real `&s=...` separator.

 * v5.9.12 changelog (pack 4.54.17):
 *  - FIX: cache-bust the Byse playback POST and send no-cache headers so an
 *    upstream cache cannot replay an old JSON response with an already-dead
 *    signed CDN URL.
 *  - FIX: validate Byse's current `s=<start>&e=<duration>` URL window, while
 *    retaining support for older absolute expiry query formats.

 * v5.9.11 changelog (pack 4.54.16):
 *  - FIX: reject stale signed Byse CDN URLs before native playback.

 * v5.9.10 changelog (pack 4.54.15):
 *  - FIX: Byse now performs the current server-issued P-256 attestation and
 *    proof-of-work player check before requesting playback, then sends the
 *    returned CAPTCHA token with the playback POST.
 *  - FIX: Byse AES-GCM envelopes use WebCrypto first, with the pure-JS
 *    fallback retained for older Nuvio workers.
 *  - FIX: normalize literal \\u0026 query separators from decrypted Byse URLs.
 *  - FIX: rewrite the confirmed dead Moscow Byse edge to the working Vienna
 *    edge before the native player receives the signed HLS URL.

 * v5.9.9 changelog (pack 4.54.14):
 *  - FIX: Dood pass_md5 extraction now normalizes escaped slashes and keeps
 *    the current two-segment token path used by Playmogo/Dood mirrors.

 * v5.9.8 changelog (pack 4.54.13):
 *  - FIX: narrow the dead-Byse blacklist to the confirmed
 *    edge1-moscow-sprintcdn.owphbf24.com host. Other Byse CDN edges are
 *    eligible again, preventing the provider from returning zero Byse rows.

 * v5.9.7 changelog (pack 4.54.12):
 *  - FIX: Byse now follows the current details -> fingerprinted playback POST
 *    flow and accepts its direct signed sources, instead of relying only on the
 *    retired one-request endpoint that returned stale/404 playback URLs.
 *  - FIX: current Byse AES-GCM key_parts are concatenated directly; the old
 *    version-indexed key selection remains available for legacy mirrors.
 *  - FALLBACK: the legacy /api/videos/{code} endpoint is still attempted when
 *    the current flow is unavailable.

 * v5.9.6 changelog (pack 4.54.11):
 *  - FIX: Byse signed rows are rejected when playback.expires_at or the
 *    source URL's exp/expires/expiry value is expired or within 15 seconds of
 *    expiry. This prevents the native player from receiving a stale URL that
 *    returns HTTP 404.
 *  - FIX: an expired/invalid Byse lane now fails closed so the page's Dood or
 *    Mixdrop lane remains the selectable fallback.
 *
 * v5.9.5 changelog (pack 4.54.10):
 *  - FIX: Byse edge1-moscow-sprintcdn.owphbf24.com is unreachable from the
 *    affected TV network. Known-dead Byse edges are rejected before they
 *    become playback rows, while other signed edges remain eligible.
 *  - FIX: HLS connection failures (status 0) are hard-dead during the
 *    lightweight probe and are removed whenever another source survives.
 *  - PERF: Mixdrop/Dood headerless probes are reused by preflight, avoiding a
 *    second ranged request before playback.
 *
 * v5.9.4 changelog (pack 4.54.9):
 *  - FIX: Dood pass_md5 links used an expiry timestamp two hours in the
 *    future. Dood expects the current millisecond timestamp, so those links
 *    were rejected by otherwise-valid players.
 *  - FIX: Byse extraction now keeps up to three signed candidates instead of
 *    only the highest quality URL. A dead CDN edge no longer makes the whole
 *    player unusable when another signed source is available.
 *  - PERF: Smart-TV preflight is now a single bounded ranged probe (with a
 *    403-only retry), not a full HLS master/variant/segment walk. Player
 *    discovery is capped to four lanes and each lane has a 12s deadline.
 *
 * v5.9.3 changelog (pack 4.54.8): DEVICE SCREENSHOT ROUND 14 (BYSE playback error):
 * java.net.SocketTimeoutException: failed to connect to edge1-moscow-sprintcdn.owphbf24.com
 * /185.248.171.94:443 from 192.168.1.25 after 15000ms - the Byse edge never even opens a
 * TCP connection from the user network (DNS resolves, TCP dead). No token/header work can
 * ever fix an unroutable host; ExoPlayer burns 15s proving it each tap.
 * (a) deepProbeHls master-stage: CONNECT failure (status 0) and 404/410 are now HARD-dead
 *     (variant/segment timeouts stay soft).
 * (b) v5.9.3 LOGIC FIX: the v5.9.1/5.9.2 drop rule was DEAD CODE - it gated on !_probe,
 *     but failed rows carry _probe===1, so the condition never matched and NOTHING was
 *     ever dropped (why the device kept reporting "same"). Correct polarity now: failed
 *     rows (truthy _probe) with hard markers are REMOVED from the returned list while
 *     at least one row survives; only when EVERY row is hard-dead do we return the full
 *     list (never empty).
 * (c) NEW deterministic harness (scripts/test-preflight-593.js, stubbed fetch, evals the
 *     shipped source): 7 branch assertions - master-connect-drop, variant-404-drop,
 *     healthy-chain-kept, mp4-404-drop, never-empty, soft-variant-kept, ordering. ALL PASS.
 * v5.9.2 changelog (pack 4.54.7): DEVICE REPORTS ROUND 13 (same symptoms on 4.54.6):
 * Byse 404 persisted because the preflight probed ONLY the master. Evidence: the
 * player walks master->variant->segment; sandbox runs caught the chain dying at the
 * VARIANT (timeout one run, full 200/206 chain minutes later) while the master always
 * 200s. New deepProbeHls walks the real playback path (master 2 attempts, variant
 * +segment ranged GETs, 5s caps) and a hard 404/410 at variant/segment DROPS the row
 * (timeouts/403 stay soft; never-empty guard kept). Where the chain is healthy the
 * row survives; where it dies past the master the user never sees the dead row again.
 * Mixdrop: embed page carries NO dl/download variant (only MDCore.ref/sublangs) - the
 * activation gate latency is CDN-side; notProvisional fresh-token-per-play + preflight
 * warm remains the ceiling. Upstream rexhub 5.8.0 re-verified: same mixdrop unpack,
 * Byse = AES-encrypted signed bearer URLs, no dl variant.
 * v5.9.1 changelog (pack 4.54.6): DEVICE REPORTS ROUND 12 (sisa rows work on 5.7.10; Byse 404s at
 * play with "stream link has expired"; Mixdrop takes 5-10min to start):
 * (a) notProvisional:true on every row — Byse/mxcontent tokens are short-TTL and a
 * cached row replayed minutes later 404s at the player while fresh extraction probes
 * 200 at t0/t0+20s/t0+60s; the client now re-extracts at every play and the preflight
 * warms the fresh token right before the player hits it (also the best lever against
 * the mxcontent first-hit 403 activation gate).
 * (b) preflight now distinguishes HARD-dead rows (HTTP 404/410 on the device own
 * network = expired/removed file) and DROPS them instead of serving an error toast;
 * 403s and timeouts stay (gates can clear, networks hiccup); never returns empty.
 * v5.9.0 changelog (pack 4.54.5): DEVICE-SIDE PLAYABILITY PREFLIGHT — every extracted
 * row gets one ranged GET (row headers included, 4s cap) since extraction runs on the
 * user device; playable rows sort first, dead/unreachable rows are kept but sorted
 * last. Fixes the two device symptoms: Byse rows (owphbf24.com unreachable from PH
 * on both vienna/moscow edges) no longer sit first, and the Mixdrop first-hit 403
 * activation gate is warmed by the probe (the reported ~1min playback start).
 * Baseline order flipped: Mixdrop first, Byse second.
 * v5.8.5 changelog (pack 4.54.4): REBASED on the author-published rexhub 5.8.0
 * (device-tested baseline) after 4.54.1-4.54.3 still produced on-device empty
 * results; the only kept deltas are the user TMDB key. My added deadline
 * machinery (12s fetch caps, 7s lanes, 20s overall, first-paint race) is the
 * only functional difference from the working upstream and returns [] early
 * on slow device networks - reverted wholesale. Previous: v5.8.0 changelog (asian-catalog v5.3.0 pairing):
 *  - parseAsianCatalogId now tolerates the TAPPED-EPISODE id shapes
 *    ("asian:pmh-<slug>:<s>:<e>", urlencoded %3A, "/" separators, .json)
 *    that Nuvio passes once the addon serves real detail metas with
 *    Stremio videos[] for pmh series (previously the colons made the
 *    parser return null -> the row fell through to a title search).
 *  - The trailing :s:e digits fill in the season/episode when the app
 *    passes no explicit args (show-level play still defaults S1E1).
 *  - Catalog note (user list 2026-09-12): the addon now lists ONLY the
 *    site's own /movies and /series archives for this source.
 *
 * v5.7.0 changelog (asian-catalog v4.0.0 pairing):
 *  - parseAsianCatalogId recognises the new source prefixes kh- (KissKH,
 *    owned by the AsianHub plugin) and an- (AnimeTVSlash, owned by the
 *    animotvslash plugin). Both are skipped FAST here (empty result) so
 *    catalog rows never trigger a pointless/false pinoymovieshub search.
 *  - nvv copy stays at 5.6.0 (frozen by owner request); the only effect
 *    there is a few wasted seconds on kh-/an- ids, never a wrong stream.
 *
 * v5.6.0 changelog (series-args hardening — the app-side ground truth):
 *  - ROOT CAUSE (NuvioMobile cmp-rewrite PluginRuntime.kt): the app calls
 *    getStreams(<tmdbId:String>, <"movie"|"tv">, <season:Int?>, <episode:Int?>)
 *    and EVERY season/episode field is nullable with default null. Confirmed
 *    0-stream shapes for series: (a) IMDb tt-id reaching the plugin when the
 *    app cannot resolve it (TmdbService.ensureTmdbId returns null without an
 *    app TMDB key), (b) season/episode undefined (show-level play, local-id
 *    catalog path), (c) zero-padded strings "01"/"S01" breaking the 1x1 URL
 *    guess and the numerando equality check, (d) type aliases like "tvshow"
 *    corrupting the legacy-shift branch. Movies pass none of these — exactly
 *    the reported "movies show streams, series don't" symptom.
 *  - FIX (a): tt-ids are resolved via TMDB find API (external_source=imdb_id)
 *    using the plugin's own key — no app settings involved. Both movie and
 *    tv results accepted; resolved type pins the lookup branch.
 *  - FIX (b): a TV request without season/episode now defaults to S1E1
 *    (same convention as the app's own scraper test runner) instead of
 *    returning an empty row. Logged loudly in console for traceability.
 *  - FIX (c): season/episode are parseInt-normalized ("01"->"1", "S01"->"1")
 *    so the /episodes/<slug>-1x1 guess and numerando matching always use
 *    canonical unpadded numbers.
 *  - FIX (d): "tvshow"/"tv_show" join series/show as TV aliases, and the
 *    legacy 3-arg shift only fires when the mediaType slot is truly numeric
 *    (a string alias no longer gets swallowed into the season slot).
 *
 * v5.5.0 changelog (NuvioTVSmart webOS adaptation - Mixdrop/Dood TV-safe):
 *  - NEW: headerless-playability probe. Mixdrop direct mp4s and Dood
 *    token URLs are emitted with Referer+UA headers "because the CDN
 *    enforces them" - but webOS/Tizen players can NEVER send custom
 *    headers, so those rows were dead on TV even when extraction worked
 *    (Byse already sorted first for exactly this reason). Now, after
 *    extracting the direct URL, a cheap ranged GET with NO custom headers
 *    (Range: bytes=0-1023) checks whether the CDN actually serves the
 *    bytes without a Referer. When it does (tokens ARE the authorization
 *    on most nodes), the stream is emitted HEADERLESS = plays on webOS,
 *    Tizen and ExoPlayer alike. When the CDN still 403s, the previous
 *    headers-carrying row is kept (mobile-only, unchanged).
 *  - Same probe applied to the Dood-family token URLs (playmogo.com et al).
 *  - Probe costs one small ranged GET per lane, runs inside the existing
 *    20s per-lane deadline, and fail-closes: any probe error keeps the
 *    historical headers-carrying behavior. Mobile output only ever loses
 *    the headers field (which mobile players ignore when unnecessary).
 *
 * v5.4.0 changelog (source-scoped catalog ids — direct page resolution):
 *  - NEW: asian-catalog 3.2.0 emits pinoymovieshub rows as asian:pmh-<slug>
 *    (source-scoped fallback ids; user report: "the reason why plugin not
 *    fetches because the url is different to the website"). The tail slug
 *    IS pinoymovieshub's own movie/series slug, so resolution now goes
 *    STRAIGHT to the real page — no title search that can diverge from the
 *    site's URL structure:
 *        movies  -> /movies/{slug}            (verified: /movies/tayo-sa-wakas)
 *        series  -> /series/{slug} -> scrape the server-rendered episode
 *                  map (numerando + single-quoted hrefs, verified live) ->
 *                  the REAL /episodes/{show}-{s}x{e} page. Episode slugs
 *                  differ from series slugs (series "mousetrap-tagalog-
 *                  dubbed" -> episode "mousetrap-1x10") — the scrape picks
 *                  the exact page, the old slug-guess could never.
 *    The search-based flow stays as fail-soft backup after the direct
 *    attempt (and for legacy asian:<slug> rows without the pmh- prefix).
 *  - NEW: ks-/va- scoped ids belong to the AsianHub plugin -> skipped here
 *    fast (a pinoymovieshub search for a kissasian/viewasian title could
 *    false-match an unrelated pinoy show and return a WRONG stream).
 *
 * v5.3.0 changelog (asian-catalog fallback-id alignment):
 *  - NEW: `asian:<slug>` catalog ids are now playable. The asian-catalog
 *    addon emits TMDB-unmatched rows as `asian:<slug>` fallback metas using
 *    the site's own movie/series slug. Previously the raw string went
 *    through the TMDB lookup, failed, and getStreams returned [] — those
 *    rows had no stream link. Now the prefix is parsed, the slug
 *    de-slugified into the title, and resolution runs exactly as for a
 *    TMDB-matched title (direct slug guess -> live search -> episode map).
 *    Because the slug IS pinoymovieshub's own slug, the direct /movies/
 *    /episodes/ guess hits exactly.
 *  - FIX: mediaType "series"/"show" (NuvioTVSmart local-id path passes the
 *    catalog type verbatim) is normalized to "tv" before the legacy
 *    3-arg remap, so season/episode can no longer be shifted into the
 *    wrong slots.
 *
 * v5.2.2 changelog (NuvioTVSmart / webOS focus - mobile behavior unchanged):
 *  - TV: Byse streams are now emitted HEADERLESS. Byse signed URLs are
 *    bearer-style (master playlist, media playlist and segments all serve
 *    200/206 with zero custom headers), and webOS players can never send
 *    Referer/User-Agent anyway. Extraction still authenticates the
 *    /api/videos call with Referer/Origin - only the playback URL sheds its
 *    headers. Mobile plays a headerless signed URL identically, so nothing
 *    changes on phones.
 *  - TV: deterministic host priority. Byse (plays on every platform with
 *    zero headers) is always the FIRST stream; Mixdrop and Dood follow.
 *    Byse playback CDNs use randomized edge domains, so priority keys off
 *    the player label "Byse" (stable) with a host-pattern fallback, and
 *    the internal sort field is stripped before the list is returned.
 *  - PERF: per-lane extraction deadline (20s). One stalled lane (slow CDN
 *    body) can no longer delay or discard faster lanes; partial results
 *    ship the moment the deadline fires.
 *
 * v5.1.0 changelog:
 *  - NEW: Byse host extraction (bysesayeveum.com and friends). The embed is a
 *    React SPA whose source list lives in an AES-256-GCM encrypted blob at
 *    /api/videos/{code}; the API itself ships the key split into key_parts
 *    (part[version] + part[31-version] -> 32-byte key). Ships a compact
 *    pure-JS AES-256/CTR core (no WebCrypto needed -> runs in QuickJS and in
 *    Nuvio TV's worker sandbox); the GCM tag is skipped, we only need the
 *    plaintext. Result: a direct signed HLS/mp4 URL minted per device.
 *  - FIX: DoodStream family - final host after redirects is used (dood.yt
 *    301s to playmogo.com), quoted/loose pass_md5 variants, packer-unpacked
 *    players, /d/ download-page fallback, correct Referer chain, and
 *    Cloudflare Turnstile gate detection (gated hosts are skipped cleanly
 *    instead of returning a dead link).
 *  - CHANGE: embed-page fallback streams removed entirely. Neither
 *    NuvioMobile nor NuvioTV has a webview player, so embed URLs could never
 *    play; players whose extraction fails are skipped instead.
 *  - TV: audited against NuvioTVSmart's plugin worker shims (custom URL
 *    class, fetch bridge, module.exports wrapper, no TextDecoder): pure ES5
 *    promise chains, typed arrays and regex only.
 *
 * v5.0.0 changelog:
 *  - Returns PLAYABLE direct streams: Mixdrop unpacked to direct mp4,
 *    DoodStream-family best-effort pass_md5 extraction, embed fallback.
 *  - Robust page resolution: direct slug guess -> Dooplay live search
 *    (/wp-json/dooplay/search/ with page-scraped nonce) -> series page
 *    episode map scraping (episode slugs may differ from series slugs).
 *  - Pure-regex HTML parsing (no cheerio) -> smaller + sandbox-safe.
 *  - Native 4-arg Nuvio signature getStreams(tmdbId, mediaType, season,
 *    episode) with legacy 3-arg remap kept.
 */

var PROVIDER_NAME = "PinoyMoviesHub";
var TMDB_API_KEY = "6dc830f9624b43261325bed3bf7d0dfa"; /* user-provided key (2026-11-15) */
var BASE_URL = "https://pinoymovieshub.win";

/**
 * v5.6.0: resolve an IMDb tt-id to a TMDB id via the find API. The app can
 * hand us tt-ids when it has no TMDB key configured (PluginRepository
 * resolvePluginTmdbId falls back to the raw id); every tmdb-based lookup
 * would 404 on "tv/tt...". The plugin owns its key, so it self-serves.
 */
function resolveImdbToTmdb(imdbId) {
  var url = "https://api.themoviedb.org/3/find/" + encodeURIComponent(imdbId) +
    "?api_key=" + TMDB_API_KEY + "&external_source=imdb_id";
  return fetchJson(url, { timeoutMs: 15000 }).then(function(data) {
    if (!data || typeof data !== "object") return null;
    var tv = (data.tv_results || [])[0];
    var mv = (data.movie_results || [])[0];
    if (tv && tv.id) {
      return { tmdbId: String(tv.id), type: "tv", title: tv.name || tv.original_name || "" };
    }
    if (mv && mv.id) {
      return { tmdbId: String(mv.id), type: "movie", title: mv.title || mv.original_title || "" };
    }
    return null;
  });
}

var HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36",
  "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9"
};

// Dooplay search nonce cache (nonce is session-stable, ~24h server side).
var nonceCache = { value: "", ts: 0 };
var NONCE_TTL_MS = 6 * 60 * 60 * 1000;

// ===== SMALL UTILITIES =====

function merge(obj1, obj2) {
  var out = {};
  var k;
  for (k in obj1 || {}) out[k] = obj1[k];
  for (k in obj2 || {}) out[k] = obj2[k];
  return out;
}

function hasTimers() {
  return typeof setTimeout === "function";
}

function fetchWithTimeout(url, options, ms) {
  options = options || {};
  if (!hasTimers()) return fetch(url, options);
  var timer = null;
  var killer = new Promise(function(resolve, reject) {
    timer = setTimeout(function() {
      reject(new Error("fetch timeout"));
    }, ms || 30000);
  });
  return Promise.race([fetch(url, options), killer]).then(
    function(res) { clearTimeout(timer); return res; },
    function(err) { clearTimeout(timer); throw err; }
  );
}

function fetchText(url, options) {
  options = options || {};
  return fetchWithTimeout(url, {
    method: options.method || "GET",
    redirect: options.redirect || "follow",
    headers: merge(HEADERS, options.headers || {}),
    body: options.body
  }, options.timeoutMs || 25000).then(function(res) {
    if (!res.ok) throw new Error("HTTP " + res.status);
    return res.text();
  });
}

function fetchJson(url, options) {
  options = options || {};
  return fetchWithTimeout(url, {
    method: options.method || "GET",
    redirect: options.redirect || "follow",
    headers: merge(HEADERS, options.headers || {}),
    body: options.body
  }, options.timeoutMs || 25000).then(function(res) {
    if (!res.ok) return null;
    return res.json();
  }).catch(function() { return null; });
}

/**
 * fetchText that also reports the FINAL URL after redirects (browser fetch
 * and both Nuvio runtimes expose res.url post-redirect). Needed by the Dood
 * extractor: dood.yt 301s to playmogo.com, so the pass_md5 host must come
 * from the response, not the input.
 */
function fetchTextFollow(url, options) {
  options = options || {};
  return fetchWithTimeout(url, {
    method: "GET",
    redirect: "follow",
    headers: merge(HEADERS, options.headers || {})
  }, options.timeoutMs || 25000).then(function(res) {
    if (!res.ok) throw new Error("HTTP " + res.status);
    return res.text().then(function(text) {
      return { text: text, url: (res && res.url) ? String(res.url) : url };
    });
  });
}

/**
 * v5.5.0 webOS adaptation: can this direct URL be fetched with NO custom
 * headers at all? webOS/Tizen players cannot send Referer/User-Agent, so a
 * stream is only TV-safe when the CDN serves it headerless. One ranged GET
 * (0-1023 bytes) is enough: 2xx/206 with a non-HTML content-type means the
 * token IS the authorization -> emit the stream WITHOUT headers. Any 40x,
 * challenge page or probe error fail-closes to the historical behavior
 * (headers-carrying row; mobile-only when the CDN enforces Referer).
 * No Referer is sent: the whole point is to test the player's condition.
 */
function probeHeaderless(url) {
  return fetchWithTimeout(url, {
    method: "GET",
    redirect: "follow",
    headers: { "Range": "bytes=0-1023" }
  }, DIRECT_PROBE_TIMEOUT_MS).then(function(res) {
    if (!res || res.status < 200 || res.status >= 300) return false;
    var ct = "";
    try {
      if (res.headers && typeof res.headers.get === "function") {
        ct = String(res.headers.get("content-type") || "");
      } else if (res.headers && typeof res.headers === "object") {
        var keys = Object.keys(res.headers), k;
        for (k = 0; k < keys.length; k++) {
          if (String(keys[k]).toLowerCase() === "content-type") {
            ct = String(res.headers[keys[k]] || "");
            break;
          }
        }
      }
    } catch (e) { ct = ""; }
    if (/text\/html/i.test(ct)) return false; // challenge/soft-404 page
    return true;
  }).catch(function() { return false; });
}

/**
 * v5.9.0 device-side playability preflight. Extraction runs ON the user's
 * device, so one ranged GET per row (with the row's OWN headers — the
 * Mixdrop rows need their Referer, Byse rows are headerless) answers
 * "can THIS network actually reach this URL?" — something datacenter
 * probes can never know. Used to sort playable rows first; failing rows
 * are kept but sorted last. The probe also warms first-hit-gated CDNs
 * (mxcontent nodes answer 403 once, then activate) which was the reported
 * ~1min playback start delay on Mixdrop rows.
 */
var PROBE_TIMEOUT_MS = 1800;
var DIRECT_PROBE_TIMEOUT_MS = 1800;

function probePlayable(url, headers) {
  var opts = {
    method: "GET",
    redirect: "follow",
    headers: merge(headers || {}, { "Range": "bytes=0-1023" })
  };
  // Two attempts: several CDN nodes gate the FIRST hit after token issue
  // (mxcontent answers 403 once, then activates). A single probe would
  // wrongly demote rows that play fine; the retry lands post-activation
  // and doubles as the warmer for the device player's own request.
  // Returns {ok, status} — the status lets preflightSort distinguish a
  // hard CDN 404 (file gone / token dead) from a soft failure.
  function attempt() {
    return fetchWithTimeout(url, opts, PROBE_TIMEOUT_MS).then(function(res) {
      var status = res ? res.status : 0;
      if (!res || status < 200 || status >= 300) return { ok: false, status: status };
      var ct = "";
      try {
        if (res.headers && typeof res.headers.get === "function") {
          ct = String(res.headers.get("content-type") || "");
        }
      } catch (e) { ct = ""; }
      if (/text\/html/i.test(ct)) return { ok: false, status: status }; // challenge/soft-404
      return { ok: true, status: status };
    }).catch(function() { return { ok: false, status: 0 }; });
  }
  return attempt().then(function(r) {
    // A second request is useful for the known one-shot 403 activation gate,
    // but retrying timeouts makes a slow TV wait twice for the same dead CDN.
    if (r.ok || r.status !== 403) return r;
    return attempt();
  });
}

var HLS_STAGE_TIMEOUT_MS = 5000;

/**
 * v5.9.2 DEEP HLS PROBE: the shallow master-only probe passed rows whose
 * playback chain is dead past the master. Device evidence (3 straight
 * rounds): Byse master 200s at extraction (row kept), the player then
 * follows the master to the variant playlist and dies with HTTP 404
 * ("stream link has expired or been removed"). Sandbox probes reproduced
 * variant-level death independently (one run: variant GET timed out; a
 * second run minutes later: the full chain 200/206) — the chain's health
 * is per-network, so the probe must walk the player's REAL path:
 *   master  -> up to 2 ranged GETs (403-gate semantics, body captured)
 *   variant -> 1 ranged GET, one extra retry only on 403
 *   segment -> 1 small ranged GET
 * A hard 404/410 at variant/segment = the row WILL fail in the player ->
 * preflightSort drops it (kept only if every row is hard-dead). Timeouts
 * and 403s stay soft (transient networks, gates that can still clear).
 */
function deepProbeHls(url, headers) {
  function stageGet(u, rangeEnd, cap, retries403) {
    function one(left) {
      return fetchWithTimeout(u, {
        method: "GET",
        redirect: "follow",
        headers: merge(headers || {}, { Range: "bytes=0-" + rangeEnd })
      }, cap).then(function(res) {
        if (res && res.status === 403 && left > 0) return one(left - 1);
        if (!res || res.status < 200 || res.status >= 300) {
          return { ok: false, status: res ? res.status : 0, body: "" };
        }
        var ct = "";
        try {
          if (res.headers && typeof res.headers.get === "function") {
            ct = String(res.headers.get("content-type") || "");
          }
        } catch (e) { ct = ""; }
        if (/text\/html/i.test(ct)) return { ok: false, status: res.status, body: "" };
        return res.text().then(function(body) {
          return { ok: true, status: res.status, body: body };
        }).catch(function() { return { ok: false, status: res.status, body: "" }; });
      }).catch(function() { return { ok: false, status: 0, body: "" }; });
    }
    return one(retries403);
  }

  function firstPlaylistEntry(body) {
    var lines = String(body || "").split(/\r?\n/);
    for (var i = 0; i < lines.length; i++) {
      var l = lines[i].trim();
      if (l && l.charAt(0) !== "#") return l;
    }
    return "";
  }

  return stageGet(url, 65535, PROBE_TIMEOUT_MS, 1).then(function(master) {
    if (!master.ok) {
      // v5.9.3: a master-stage CONNECT failure (status 0: TCP timeout /
      // DNS / refused — device screenshot: the Byse edge 185.248.171.94
      // never opens a socket from the user's PH home network after 15s)
      // is exactly as dead as a 404: no header/token work can make an
      // unroutable host play, and ExoPlayer only burns 15s proving it.
      // Mark hard so the row is dropped. 403 and other HTTP statuses
      // stay soft (activation gates can still clear).
      var hard = master.status === 404 || master.status === 410 || master.status === 0;
      return { ok: false, status: master.status, hard: hard, stage: "master" };
    }
    var entry = firstPlaylistEntry(master.body);
    if (!entry) return { ok: false, status: master.status, hard: false, stage: "master-empty" };
    var vUrl;
    try { vUrl = new URL(entry, url).toString(); }
    catch (e) { return { ok: false, status: 0, hard: false, stage: "variant-resolve" }; }
    return stageGet(vUrl, 65535, HLS_STAGE_TIMEOUT_MS, 1).then(function(v) {
      if (!v.ok) {
        return { ok: false, status: v.status, hard: v.status === 404 || v.status === 410, stage: "variant" };
      }
      var seg = firstPlaylistEntry(v.body);
      if (!seg) return { ok: true, status: v.status, hard: false, stage: "variant" };
      var sUrl = "";
      try { sUrl = new URL(seg, vUrl).toString(); } catch (e) { sUrl = ""; }
      if (!sUrl) return { ok: true, status: v.status, hard: false, stage: "variant" };
      return stageGet(sUrl, 1023, HLS_STAGE_TIMEOUT_MS, 0).then(function(s) {
        if (!s.ok) {
          return { ok: false, status: s.status, hard: s.status === 404 || s.status === 410, stage: "segment" };
        }
        return { ok: true, status: s.status, hard: false, stage: "segment" };
      });
    });
  });
}

function preflightSort(streams) {
  return Promise.all(streams.map(function(s) {
    // Do not walk HLS master -> variant -> segment here. That path is useful
    // for diagnostics, but it adds several sequential network waits before
    // Nuvio can show any source and some CDNs reject ranged playlist probes
    // even though the native player can play the URL.
    var p = s._preflight ? Promise.resolve(s._preflight) : probePlayable(s.url, s.headers);
    return Promise.resolve(p).then(function(r) {
      s._probe = r.ok ? 0 : 1;
      s._probeStatus = r.status;
      var isHls = /\.m3u8(\?|$)/i.test(s.url);
      s._probeHard = !r.ok && (!!r.hard || (isHls && (r.status === 0 || r.status === 404 || r.status === 410)));
      s._probeStage = r.stage || "";
    });
  })).then(function() {
    var i;
    // v5.9.3 FIX: the v5.9.1/5.9.2 drop rule was DEAD CODE — it gated on
    // `!_probe`, but failed rows carry _probe === 1 (playable === 0), so
    // the condition was false for every dead row and nothing ever dropped
    // (the device kept saying "same"). Correct polarity: failed rows are
    // truthy. Kept rules:
    // (a) an mp4 that hard-404s on the device's own network,
    // (b) any HLS row that hard-fails the lightweight probe — master 404 or
    //     master CONNECT failure (status 0: the TCP timeout the device
    //     screenshot proved for the Byse edge).
    // 403s and variant/segment timeouts STAY (gates clear, networks hiccup;
    // a master that connects but stalls is worth one player attempt).
    // Never return empty: if every row is hard-dead, keep them all, sorted
    // last.
    var alive = [], dead = [];
    for (i = 0; i < streams.length; i++) {
      var st = streams[i]._probeStatus;
      var mixdrop = isMixdrop(hostOf(streams[i].url)) ||
        /mixdrop|mixdrp|mxdrop|miixdrop|mixdroop/i.test(String(streams[i].name || "")) ||
        /mixdrop|mixdrp|mxdrop|miixdrop|mixdroop/i.test(String(streams[i].headers && streams[i].headers.Referer || ""));
      // Mixdrop links are freshly unpacked per request and some MXContent
      // edges answer a probe with 403/404 before accepting the player request.
      // Keep that row visible as a fallback; otherwise an inconclusive probe
      // leaves only the short-lived Byse row for the user to select.
      if (streams[i]._probe && (streams[i]._probeHard || st === 404 || st === 410) && !mixdrop) {
        dead.push(streams[i]);
      } else {
        alive.push(streams[i]);
      }
    }
    // v5.9.3: drop = REMOVED from the returned list when at least one row
    // survives; only when EVERY row is hard-dead do we fall back to the
    // full list (never empty).
    var keep = alive.length ? alive : streams;
    keep.sort(function(a, b) {
      if (a._probe !== b._probe) return a._probe - b._probe; // playable first
      var pa = a._hostPriority === undefined ? 3 : a._hostPriority;
      var pb = b._hostPriority === undefined ? 3 : b._hostPriority;
      return pa - pb;
    });
    var playable = 0;
    for (i = 0; i < keep.length; i++) {
      if (!keep[i]._probe) playable++;
      delete keep[i]._probe;
      delete keep[i]._probeStatus;
      delete keep[i]._probeHard;
      delete keep[i]._probeStage;
      delete keep[i]._preflight;
      delete keep[i]._hostPriority;
    }
    console.log("[PinoyMoviesHub] preflight: " + playable + "/" + keep.length +
      " row(s) playable on this network" +
      (dead.length && alive.length ? ", dropped " + dead.length + " hard-dead row(s)" : "") +
      "; playable first");
    return keep;
  });
}

// WordPress transliterates accented Latin letters in slugs (Filipino titles
// are full of them: "Filipiñana" -> filipinana, "Pepé" -> pepe). Without
// this map slugify() turned ñ into a HYPHEN ("filipi-ana") and the direct
// /movies/{slug}/ guess could never hit. Explicit map: QuickJS-safe.
var ACCENT_MAP = {
  'á': 'a', 'à': 'a', 'â': 'a', 'ä': 'a', 'ã': 'a', 'å': 'a',
  'é': 'e', 'è': 'e', 'ê': 'e', 'ë': 'e',
  'í': 'i', 'ì': 'i', 'î': 'i', 'ï': 'i',
  'ó': 'o', 'ò': 'o', 'ô': 'o', 'ö': 'o', 'õ': 'o',
  'ú': 'u', 'ù': 'u', 'û': 'u', 'ü': 'u',
  'ñ': 'n', 'ç': 'c',
  'ý': 'y', 'ÿ': 'y', 'š': 's', 'ž': 'z', 'œ': 'oe', 'æ': 'ae',
  'ł': 'l', 'đ': 'd', 'ß': 'ss'
};

function slugify(title) {
  var s = String(title || "").toLowerCase();
  s = s.replace(/[\u00c0-\u017f]/g, function (ch) {
    return ACCENT_MAP[ch] !== undefined ? ACCENT_MAP[ch] : ch;
  });
  return s
    .replace(/['\u2019]/g, "")
    .replace(/&/g, "and")
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function stripTags(html) {
  return String(html || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function attrValue(tag, name) {
  var re = new RegExp(name + "=['\"]([^'\"]*)['\"]", "i");
  var m = tag.match(re);
  return m ? m[1] : "";
}

function parseQuality(text) {
  var value = String(text || "").toLowerCase();
  var m = value.match(/\b(2160p|1440p|1080p|720p|480p|360p|4k|uhd|hd|sd|cam)\b/);
  if (m) {
    var q = m[1];
    if (q === "4k" || q === "uhd") return "2160p";
    if (q === "hd") return "720p";
    if (q === "sd") return "480p";
    if (q === "cam") return "CAM";
    return q;
  }
  return "Auto";
}

function inferLang(text) {
  var t = String(text || "").toLowerCase();
  if (t.indexOf("tagalog") !== -1 || t.indexOf("filipino") !== -1) return "Tagalog";
  if (t.indexOf("english") !== -1 || /\beng\b/.test(t)) return "English";
  if (t.indexOf("spanish") !== -1) return "Spanish";
  if (t.indexOf("korean") !== -1) return "Korean";
  if (t.indexOf("japanese") !== -1) return "Japanese";
  if (t.indexOf("chinese") !== -1) return "Chinese";
  if (t.indexOf("hindi") !== -1) return "Hindi";
  return "Tagalog";
}

function hostOf(url) {
  try { return new URL(url).hostname.replace(/^www\./, ""); } catch (e) { return ""; }
}

function randomToken(len) {
  var chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  var out = "";
  var i;
  for (i = 0; i < (len || 8); i++) {
    out += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return out;
}

// ===== CRYPTO: PURE-JS BASE64URL + AES-256-CTR (used by the Byse extractor) =====

function b64urlToBytes(str) {
  var ALPHA = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  var t = String(str || "").replace(/-/g, "+").replace(/_/g, "/");
  var out = [];
  var acc = 0, bits = 0, i, v;
  for (i = 0; i < t.length; i++) {
    var ch = t.charAt(i);
    if (ch === "=") break;
    v = ALPHA.indexOf(ch);
    if (v < 0) continue;
    acc = (acc << 6) | v;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      out.push((acc >> bits) & 0xff);
    }
  }
  return out;
}

function bytesToUtf8(bytes) {
  var out = "", i = 0, c, cp;
  while (i < bytes.length) {
    c = bytes[i];
    if (c < 0x80) { out += String.fromCharCode(c); i += 1; }
    else if (c < 0xe0) {
      out += String.fromCharCode(((c & 0x1f) << 6) | (bytes[i + 1] & 0x3f));
      i += 2;
    } else if (c < 0xf0) {
      out += String.fromCharCode(((c & 0x0f) << 12) | ((bytes[i + 1] & 0x3f) << 6) | (bytes[i + 2] & 0x3f));
      i += 3;
    } else {
      cp = ((c & 0x07) << 18) | ((bytes[i + 1] & 0x3f) << 12) | ((bytes[i + 2] & 0x3f) << 6) | (bytes[i + 3] & 0x3f);
      cp -= 0x10000;
      out += String.fromCharCode(0xd800 + (cp >> 10), 0xdc00 + (cp & 0x3ff));
      i += 4;
    }
  }
  return out;
}

// AES S-box built at load time (avoids a 256-entry literal table).
var AES_SBOX = (function () {
  var box = new Array(256);
  var p = 1, q = 1, t;
  do {
    p = p ^ ((p << 1) ^ (p & 0x80 ? 0x11b : 0));
    p &= 0xff;
    q = (q ^ (q << 1)) & 0xff;
    q = (q ^ (q << 2)) & 0xff;
    q = (q ^ (q << 4)) & 0xff;
    if (q & 0x80) q ^= 0x09;
    t = q ^ ((q << 1) | (q >>> 7)) ^ ((q << 2) | (q >>> 6)) ^ ((q << 3) | (q >>> 5)) ^ ((q << 4) | (q >>> 4));
    box[p] = (t ^ 0x63) & 0xff;
  } while (p !== 1);
  box[0] = 0x63;
  return box;
})();

function aes256ExpandKey(keyBytes) {
  var rcon = [0x01, 0x02, 0x04, 0x08, 0x10, 0x20, 0x40];
  var w = [];
  var i, t;
  for (i = 0; i < 8; i++) {
    w.push([keyBytes[4 * i], keyBytes[4 * i + 1], keyBytes[4 * i + 2], keyBytes[4 * i + 3]]);
  }
  for (i = 8; i < 60; i++) {
    t = w[i - 1].slice(0);
    if (i % 8 === 0) {
      t = [AES_SBOX[t[1]] ^ rcon[i / 8 - 1], AES_SBOX[t[2]], AES_SBOX[t[3]], AES_SBOX[t[0]]];
    } else if (i % 8 === 4) {
      t = [AES_SBOX[t[0]], AES_SBOX[t[1]], AES_SBOX[t[2]], AES_SBOX[t[3]]];
    }
    w.push([w[i - 8][0] ^ t[0], w[i - 8][1] ^ t[1], w[i - 8][2] ^ t[2], w[i - 8][3] ^ t[3]]);
  }
  return w;
}

function aesXtime(x) {
  return ((x << 1) ^ (x & 0x80 ? 0x1b : 0)) & 0xff;
}

function aes256EncryptBlock(w, input) {
  var s = new Array(16);
  var out = new Array(16);
  var i, c, r, round, a0, a1, a2, a3, t0, t1, t2, t3, src;
  for (i = 0; i < 16; i++) s[i] = input[i] ^ w[Math.floor(i / 4)][i % 4];
  for (round = 1; round < 14; round++) {
    src = s.slice(0); // rounds read the full previous state (columns overlap)
    for (c = 0; c < 4; c++) {
      // SubBytes + ShiftRows combined: output column c reads row r from
      // source column (c + r) % 4.
      a0 = AES_SBOX[src[((c + 0) % 4) * 4 + 0]];
      a1 = AES_SBOX[src[((c + 1) % 4) * 4 + 1]];
      a2 = AES_SBOX[src[((c + 2) % 4) * 4 + 2]];
      a3 = AES_SBOX[src[((c + 3) % 4) * 4 + 3]];
      t0 = aesXtime(a0); t1 = aesXtime(a1); t2 = aesXtime(a2); t3 = aesXtime(a3);
      s[c * 4 + 0] = (t0 ^ a1 ^ t1 ^ a2 ^ a3) & 0xff;
      s[c * 4 + 1] = (a0 ^ t1 ^ a2 ^ t2 ^ a3) & 0xff;
      s[c * 4 + 2] = (a0 ^ a1 ^ t2 ^ a3 ^ t3) & 0xff;
      s[c * 4 + 3] = (a0 ^ t0 ^ a1 ^ a2 ^ t3) & 0xff;
    }
    for (i = 0; i < 16; i++) s[i] ^= w[4 * round + Math.floor(i / 4)][i % 4];
  }
  for (c = 0; c < 4; c++) {
    for (r = 0; r < 4; r++) {
      out[c * 4 + r] = AES_SBOX[s[((c + r) % 4) * 4 + r]] ^ w[56 + c][r];
    }
  }
  return out;
}

/**
 * GCM-mode plaintext recovery (CTR phase only). The trailing 16 bytes of the
 * wire payload are the auth tag and are skipped (not decrypted, not
 * verified): a wrong key/IV yields garbage that fails JSON.parse. Counter
 * starts at inc32(J0) per the GCM spec, with J0 = IV(12) || 0x00000001.
 */
function aesGcmDecryptNoTag(keyBytes, ivBytes, dataBytes) {
  var w = aes256ExpandKey(keyBytes);
  var cb = [];
  var i, j, ks, off = 0, n = dataBytes.length - 16; /* last 16 bytes = tag */
  for (i = 0; i < 12; i++) cb.push(ivBytes[i] & 0xff);
  cb.push(0, 0, 0, 2);
  var out = [];
  while (off < n) {
    ks = aes256EncryptBlock(w, cb);
    for (j = 0; j < 16 && off < n; j++, off++) {
      out.push(dataBytes[off] ^ ks[j]);
    }
    for (j = 3; j >= 0; j--) {
      cb[12 + j] = (cb[12 + j] + 1) & 0xff;
      if (cb[12 + j]) break;
    }
  }
  return out;
}

/**
 * Byse ships the AES key split into key_parts; the playback version picks
 * two 1-based indices [version, 31 - version] whose base64url payloads
 * concatenate to the 32-byte key (verified against their frontend bundle).
 */
function byseKeyFromParts(playback) {
  var parts = playback.key_parts;
  if (!parts || !parts.length) return null;
  var version = parseInt(playback.version, 10);
  var picked = [];
  var i, b;
  // Current Byse /embed/playback responses use exactly two key parts and
  // concatenate them directly. Older /api/videos responses used the version
  // index pair; keep that path for old mirrors only.
  if (parts.length === 2) {
    picked = parts;
  } else if (version >= 1 && version <= 20) {
    var i1 = version - 1;
    var i2 = 30 - version;
    if (parts[i1]) picked.push(parts[i1]);
    if (parts[i2] && i2 !== i1) picked.push(parts[i2]);
    if (!picked.length) return null;
  } else {
    picked = parts;
  }
  var bytes = [];
  for (i = 0; i < picked.length; i++) {
    if (typeof picked[i] !== "string" || !picked[i].length) continue;
    b = b64urlToBytes(picked[i]);
    bytes = bytes.concat(b);
  }
  return bytes;
}

function utf8ToB64Url(text) {
  var bytes = [], i, c;
  var s = String(text || "");
  for (i = 0; i < s.length; i++) {
    c = s.charCodeAt(i);
    if (c < 0x80) bytes.push(c);
    else if (c < 0x800) bytes.push(0xc0 | (c >> 6), 0x80 | (c & 0x3f));
    else if (c >= 0xd800 && c <= 0xdbff && i + 1 < s.length) {
      var lo = s.charCodeAt(++i);
      var cp = 0x10000 + ((c - 0xd800) << 10) + (lo - 0xdc00);
      bytes.push(0xf0 | (cp >> 18), 0x80 | ((cp >> 12) & 0x3f), 0x80 | ((cp >> 6) & 0x3f), 0x80 | (cp & 0x3f));
    } else {
      bytes.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 0x3f), 0x80 | (c & 0x3f));
    }
  }
  var alpha = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  var out = "", acc = 0, bits = 0;
  for (i = 0; i < bytes.length; i++) {
    acc = (acc << 8) | bytes[i];
    bits += 8;
    while (bits >= 6) {
      bits -= 6;
      out += alpha.charAt((acc >> bits) & 63);
    }
  }
  if (bits) out += alpha.charAt((acc << (6 - bits)) & 63);
  return out.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

// Byse's current player performs a public P-256 device attestation before it
// asks for playback. Keep this optional: older Nuvio workers do not expose
// WebCrypto, so those runtimes continue using the legacy mirror path.
function byseUtf8Bytes(text) {
  var bytes = [], i, c, lo, cp;
  var s = String(text || "");
  for (i = 0; i < s.length; i++) {
    c = s.charCodeAt(i);
    if (c < 0x80) bytes.push(c);
    else if (c < 0x800) bytes.push(0xc0 | (c >> 6), 0x80 | (c & 0x3f));
    else if (c >= 0xd800 && c <= 0xdbff && i + 1 < s.length) {
      lo = s.charCodeAt(++i);
      cp = 0x10000 + ((c - 0xd800) << 10) + (lo - 0xdc00);
      bytes.push(0xf0 | (cp >> 18), 0x80 | ((cp >> 12) & 0x3f), 0x80 | ((cp >> 6) & 0x3f), 0x80 | (cp & 0x3f));
    } else {
      bytes.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 0x3f), 0x80 | (c & 0x3f));
    }
  }
  return bytes;
}

function byseBytesToB64Url(bytes) {
  var alpha = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  var out = "", acc = 0, bits = 0, i;
  for (i = 0; i < (bytes || []).length; i++) {
    acc = (acc << 8) | (bytes[i] & 0xff);
    bits += 8;
    while (bits >= 6) {
      bits -= 6;
      out += alpha.charAt((acc >> bits) & 63);
    }
  }
  if (bits) out += alpha.charAt((acc << (6 - bits)) & 63);
  return out.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function byseCryptoObject() {
  try {
    if (typeof globalThis !== "undefined" && globalThis.crypto && globalThis.crypto.subtle) return globalThis.crypto;
    if (typeof crypto !== "undefined" && crypto.subtle) return crypto;
  } catch (e) {}
  return null;
}

function byseAttest(host, frame) {
  var c = byseCryptoObject();
  if (!c || !c.subtle || typeof c.subtle.generateKey !== "function") return Promise.resolve(null);
  var origin = "https://" + host;
  var headers = {
    "Accept": "application/json",
    "Referer": frame,
    "Origin": origin
  };
  return c.subtle.generateKey({ name: "ECDSA", namedCurve: "P-256" }, true, ["sign", "verify"]).then(function(keys) {
    return Promise.all([
      c.subtle.exportKey("jwk", keys.publicKey),
      fetchJson(origin + "/api/videos/access/challenge", {
        method: "POST", headers: headers, timeoutMs: 8000
      })
    ]).then(function(pair) {
      var publicJwk = pair[0], challenge = pair[1];
      if (!challenge || !challenge.challenge_id || !challenge.nonce) return null;
      return c.subtle.sign({ name: "ECDSA", hash: { name: "SHA-256" } }, keys.privateKey, new Uint8Array(byseUtf8Bytes(challenge.nonce))).then(function(signature) {
        var body = {
          viewer_id: "",
          device_id: "",
          challenge_id: challenge.challenge_id,
          nonce: challenge.nonce,
          signature: byseBytesToB64Url(new Uint8Array(signature)),
          public_key: publicJwk,
          client: {
            user_agent: HEADERS["User-Agent"],
            platform: "",
            pixel_ratio: 1,
            screen_width: 0,
            screen_height: 0,
            color_depth: 0,
            languages: ["en-US", "en"],
            timezone: "UTC",
            hardware_concurrency: 4,
            touch_points: 0,
            codecs_hash: "nuvio"
          },
          storage: {},
          attributes: { entropy: "low" }
        };
        return fetchJson(origin + "/api/videos/access/attest", {
          method: "POST",
          headers: merge(headers, { "Content-Type": "application/json" }),
          body: JSON.stringify(body),
          timeoutMs: 8000
        });
      });
    });
  }).then(function(result) {
    if (!result || !result.token || !result.viewer_id || !result.device_id) return null;
    return {
      token: result.token,
      viewer_id: result.viewer_id,
      device_id: result.device_id,
      confidence: typeof result.confidence === "number" ? result.confidence : 0
    };
  }).catch(function() { return null; });
}

// This is the bounded proof-of-work used by the public Byse player. It is
// deliberately kept separate from CAPTCHA solving: if proof-of-work fails or
// times out, the provider returns no fabricated playback URL.
function bysePowHash(text) {
  var size = 512, mask = 511, rounds = 2, mulA = 2654435761, mulB = 2246822519;
  var rotl = function(v, n) { return ((v << n) | (v >>> (32 - n))) >>> 0; };
  var mul = function(v, n) { return Math.imul ? Math.imul(v, n) >>> 0 : (v * n) >>> 0; };
  var mix = function(s) {
    s[0] = (s[0] + s[1]) >>> 0;
    s[3] = rotl(s[3] ^ s[0], 16);
    s[2] = (s[2] + s[3]) >>> 0;
    s[1] = rotl(s[1] ^ s[2], 12);
    s[0] = (s[0] + s[1]) >>> 0;
    s[3] = rotl(s[3] ^ s[0], 8);
    s[2] = (s[2] + s[3]) >>> 0;
    s[1] = rotl(s[1] ^ s[2], 7);
  };
  var s = new Uint32Array([1779033703, 3144134277, 1013904242, 2773480762]);
  var bytes = byseUtf8Bytes(text), i, j;
  for (i = 0; i < bytes.length; i++) {
    s[0] = (s[0] + bytes[i]) >>> 0;
    s[0] = rotl(s[0], 7);
    mix(s);
  }
  for (i = 0; i < 8; i++) mix(s);
  var table = new Uint32Array(size);
  for (i = 0; i < size; i++) { mix(s); table[i] = (s[0] ^ s[2]) >>> 0; }
  for (i = 0; i < rounds; i++) {
    for (j = 0; j < size; j++) {
      var a = table[j] & mask;
      var c = (table[j] + table[a]) >>> 0;
      c = rotl(c, 13);
      c = (c ^ mul(table[(j + 1) & mask], mulA)) >>> 0;
      table[j] = c;
      s[0] = (s[0] ^ c) >>> 0;
      mix(s);
    }
  }
  var out = new Uint32Array(8), word, k, offset;
  for (i = 0; i < 8; i++) {
    mix(s);
    word = s[0];
    offset = i * (size / 8);
    for (k = 0; k < size / 8; k++) {
      j = table[offset + k];
      word = (word + j) >>> 0;
      word = rotl(word, 5);
      word = (word ^ mul(j, mulB)) >>> 0;
    }
    out[i] = (word ^ s[2]) >>> 0;
  }
  return out;
}

function bysePowLeadingZeroBits(words) {
  var bits = 0, i, word, j;
  for (i = 0; i < words.length; i++) {
    word = words[i] >>> 0;
    if (!word) { bits += 32; continue; }
    for (j = 31; j >= 0; j--) {
      if ((word & (1 << j)) !== 0) return bits;
      bits++;
    }
  }
  return bits;
}

function byseSolvePow(nonce, difficulty, timeoutMs) {
  var prefix = String(nonce || "") + ":";
  var end = Date.now() + (timeoutMs || 20000);
  var solution = 0;
  return new Promise(function(resolve) {
    function batch() {
      var i;
      for (i = 0; i < 1024; i++, solution++) {
        if (bysePowLeadingZeroBits(bysePowHash(prefix + solution)) >= difficulty) {
          resolve(String(solution));
          return;
        }
      }
      if (Date.now() >= end) { resolve(null); return; }
      setTimeout(batch, 0);
    }
    batch();
  });
}

function bysePlaybackToken(host, code, frame, requestHeaders, fingerprint) {
  var captchaUrl = "https://" + host + "/api/videos/" + code + "/embed/captcha";
  var verifyUrl = captchaUrl + "/verify";
  var headers = merge(requestHeaders, { "Content-Type": "application/json" });
  return fetchJson(captchaUrl, {
    method: "POST", headers: headers,
    body: JSON.stringify({ fingerprint: fingerprint }), timeoutMs: 8000
  }).then(function(challenge) {
    if (!challenge || !challenge.pow_token || !challenge.pow_nonce) return null;
    return byseSolvePow(challenge.pow_nonce, parseInt(challenge.pow_difficulty, 10) || 0, 90000).then(function(solution) {
      if (solution === null) return null;
      return fetchJson(verifyUrl, {
        method: "POST", headers: headers,
        body: JSON.stringify({ pow_token: challenge.pow_token, solution: solution, fingerprint: fingerprint }),
        timeoutMs: 8000
      });
    });
  }).then(function(verified) {
    return verified && verified.status === "ok" && verified.token ? verified.token : null;
  });
}

// ===== TMDB =====

function tmdbLookup(type, tmdbId) {
  var url = "https://api.themoviedb.org/3/" + type + "/" + tmdbId + "?api_key=" + TMDB_API_KEY;
  return fetchJson(url).then(function(data) {
    if (!data || data.success === false) return null;
    var title = data.title || data.name || "";
    var original = data.original_title || data.original_name || title;
    var year = (data.release_date || data.first_air_date || "").split("-")[0];
    return { type: type, title: title, original: original, year: year, raw: data };
  });
}

function getTmdbInfoAuto(tmdbId) {
  return tmdbLookup("movie", tmdbId).then(function(movie) {
    if (movie) return movie;
    return tmdbLookup("tv", tmdbId).then(function(tv) {
      return tv || { type: "", title: "", original: "", year: "", raw: null };
    });
  });
}

function getTmdbEpisodeTitle(tmdbId, season, episode) {
  if (!season || !episode) return Promise.resolve("");
  var url = "https://api.themoviedb.org/3/tv/" + tmdbId + "/season/" + season + "/episode/" + episode + "?api_key=" + TMDB_API_KEY;
  return fetchJson(url).then(function(data) {
    return (data && data.name) || "";
  }).catch(function() { return ""; });
}

// ===== DOOPLAY PAGE / SEARCH RESOLUTION =====

function getSearchNonce(forceRefresh) {
  var now = Date.now();
  if (!forceRefresh && nonceCache.value && (now - nonceCache.ts) < NONCE_TTL_MS) {
    return Promise.resolve(nonceCache.value);
  }
  return fetchText(BASE_URL + "/?s=1").then(function(html) {
    var m = html.match(/dtGonza\s*=\s*\{[^}]*?"nonce":"([a-f0-9]+)"/);
    if (m) {
      nonceCache.value = m[1];
      nonceCache.ts = Date.now();
      return m[1];
    }
    return "";
  }).catch(function() { return ""; });
}

function dooplaySearch(keyword, nonce) {
  var url = BASE_URL + "/wp-json/dooplay/search/?keyword=" + encodeURIComponent(keyword).replace(/%20/g, "+") + "&nonce=" + nonce;
  return fetchJson(url, {
    headers: { "X-Requested-With": "XMLHttpRequest", "Referer": BASE_URL + "/" }
  }).then(function(data) {
    if (!data || data.error || typeof data !== "object") return [];
    var results = [];
    var key;
    for (key in data) {
      if (!data.hasOwnProperty(key)) continue;
      var item = data[key];
      if (!item || !item.url) continue;
      results.push({
        postId: key,
        title: String(item.title || ""),
        url: String(item.url || ""),
        year: String((item.extra && item.extra.date) || "")
      });
    }
    return results;
  }).catch(function() { return []; });
}

/**
 * Search with one automatic retry: if the cached nonce went stale the
 * endpoint answers {"error":"no_verify_nonce"} (mapped to []), so force a
 * fresh nonce scrape and try again before giving up.
 */
function searchWithRetry(keyword) {
  return getSearchNonce(false).then(function(nonce) {
    if (!nonce) return [];
    return dooplaySearch(keyword, nonce).then(function(results) {
      if (results.length) return results;
      return getSearchNonce(true).then(function(fresh) {
        if (!fresh || fresh === nonce) return results;
        return dooplaySearch(keyword, fresh);
      });
    });
  });
}

function slugMatchScore(siteSlug, tmdbSlug) {
  if (!siteSlug || !tmdbSlug) return 0;
  if (siteSlug === tmdbSlug) return 100;
  if (siteSlug.indexOf(tmdbSlug + "-") === 0) return 90;
  if (siteSlug.indexOf(tmdbSlug) !== -1) return 70;
  if (tmdbSlug.indexOf(siteSlug) === 0) return 40;
  return 0;
}

function yearScore(siteYear, tmdbYear) {
  var a = parseInt(siteYear, 10);
  var b = parseInt(tmdbYear, 10);
  if (!a || !b) return 0;
  var diff = Math.abs(a - b);
  if (diff === 0) return 25;
  if (diff === 1) return 12;
  return 0;
}

function extractSectionSlug(url, section) {
  var m = String(url || "").match(new RegExp("/" + section + "/([^/?#]+)", "i"));
  return m ? m[1] : "";
}

function scoreMovieResults(results, tmdbSlug, tmdbYear) {
  var best = null, bestScore = 0, i, r, slug, score;
  for (i = 0; i < results.length; i++) {
    r = results[i];
    slug = extractSectionSlug(r.url, "movies");
    if (!slug) continue;
    score = slugMatchScore(slug, tmdbSlug) + yearScore(r.year, tmdbYear);
    if (score > bestScore) { bestScore = score; best = r; }
  }
  return bestScore >= 70 ? best : null;
}

function scoreSeriesResults(results, tmdbSlug, tmdbYear) {
  var best = null, bestScore = 0, i, r, slug, score;
  for (i = 0; i < results.length; i++) {
    r = results[i];
    slug = extractSectionSlug(r.url, "series");
    if (!slug) continue;
    score = slugMatchScore(slug, tmdbSlug) + yearScore(r.year, tmdbYear);
    if (score > bestScore) { bestScore = score; best = r; }
  }
  return bestScore >= 70 ? best : null;
}

function scoreEpisodeResults(results, tmdbSlug, season, episode) {
  var i, r, slug;
  var suffix = "-" + season + "x" + episode;
  for (i = 0; i < results.length; i++) {
    r = results[i];
    slug = extractSectionSlug(r.url, "episodes");
    if (!slug) continue;
    if (slug.indexOf(suffix, slug.length - suffix.length) !== -1 && slug.indexOf(tmdbSlug) !== -1) {
      return r;
    }
  }
  return null;
}

/**
 * Dooplay renders every season server-side as:
 *   <div class='numerando'>S - E</div> ... <a href='.../episodes/SLUG-SxE'>Title</a>
 * Walk numerando positions and take the first /episodes/ href before the
 * next numerando marker. Episode slugs frequently differ from the series
 * slug (e.g. series "cobra-kai-tagalog-dubbed" -> episodes "cobra-kai-5x1"),
 * so guessing from the series slug alone is not reliable.
 */
function findEpisodeUrlInSeries(html, season, episode) {
  var re = /numerando['"]>\s*(\d+)\s*-\s*(\d+)\s*</gi;
  var positions = [];
  var m;
  while ((m = re.exec(html)) !== null) {
    positions.push({ s: parseInt(m[1], 10), e: parseInt(m[2], 10), idx: m.index });
  }
  var i, end, seg, href;
  for (i = 0; i < positions.length; i++) {
    if (positions[i].s === season && positions[i].e === episode) {
      end = (i + 1 < positions.length) ? positions[i + 1].idx : Math.min(html.length, positions[i].idx + 6000);
      seg = html.substring(positions[i].idx, end);
      href = seg.match(/href=['"]([^'"]*\/episodes\/[^'"]+)['"]/i);
      if (href) {
        if (href[1].indexOf("http") === 0) return href[1];
        return BASE_URL + (href[1].charAt(0) === "/" ? href[1] : "/" + href[1]);
      }
    }
  }
  return null;
}

function absoluteUrl(url) {
  if (!url) return "";
  if (url.indexOf("http") === 0) return url;
  return BASE_URL + (url.charAt(0) === "/" ? url : "/" + url);
}

/**
 * Resolve the concrete PMH page (movie page or episode page) for a title.
 * Returns Promise<pageUrl:string|null>.
 */
function resolvePageUrl(mediaType, tmdb, season, episode) {
  var tmdbSlug = slugify(tmdb.title);
  var altSlug = slugify(tmdb.original);
  var pageUrl;
  var tryFetchPlayers = function(url) {
    return fetchText(url).then(function(html) {
      return hasPlayerOptions(html) ? html : null;
    }).catch(function() { return null; });
  };

  if (mediaType === "movie") {
    var trySearchFallback = function() {
      // v5.3.0: the movie branch previously returned empty here (the
      // "fall through to search" comment lied). Movies whose slug guess
      // fails (diacritics, year suffixes, apostrophes) now run the same
      // live-search fallback the TV branch always had.
      return getSearchNonce(false).then(function(nonce) {
        if (!nonce) return { url: "", html: "" };
        return searchWithRetry(tmdb.title).then(function(results) {
          var movie = scoreMovieResults(results, tmdbSlug, tmdb.year);
          if (!movie) return { url: "", html: "" };
          var mu = absoluteUrl(movie.url);
          return tryFetchPlayers(mu).then(function(htmlM) {
            if (htmlM) return { url: mu, html: htmlM };
            return { url: "", html: "" };
          });
        });
      });
    };
    pageUrl = BASE_URL + "/movies/" + tmdbSlug;
    return tryFetchPlayers(pageUrl).then(function(html) {
      if (html) return { url: pageUrl, html: html };
      if (altSlug && altSlug !== tmdbSlug) {
        var altUrl = BASE_URL + "/movies/" + altSlug;
        return tryFetchPlayers(altUrl).then(function(html2) {
          if (html2) return { url: altUrl, html: html2 };
          return trySearchFallback();
        });
      }
      return trySearchFallback();
    });
  }

  // TV: guess /episodes/{slug}-{s}x{e} first.
  pageUrl = BASE_URL + "/episodes/" + tmdbSlug + "-" + season + "x" + episode;
  return tryFetchPlayers(pageUrl).then(function(html) {
    if (html) return { url: pageUrl, html: html };
    return getSearchNonce(false).then(function(nonce) {
      if (!nonce) return { url: "", html: "" };
      return searchWithRetry(tmdb.title).then(function(results) {
        // 1) an exact episode page from search
        var ep = scoreEpisodeResults(results, tmdbSlug, season, episode);
        if (ep) {
          return tryFetchPlayers(absoluteUrl(ep.url)).then(function(html3) {
            if (html3) return { url: absoluteUrl(ep.url), html: html3 };
            return { url: "", html: "" };
          });
        }
        // 2) series page from search -> scrape episode map
        var series = scoreSeriesResults(results, tmdbSlug, tmdb.year);
        var seriesUrl = series ? absoluteUrl(series.url) : "";
        var fetchSeries = seriesUrl
          ? fetchText(seriesUrl)
          : Promise.resolve("");
        return fetchSeries.then(function(seriesHtml) {
          if (seriesHtml) {
            var epUrl = findEpisodeUrlInSeries(seriesHtml, season, episode);
            if (epUrl) {
              return tryFetchPlayers(epUrl).then(function(html4) {
                if (html4) return { url: epUrl, html: html4 };
                return { url: "", html: "" };
              });
            }
          }
          // 3) last resort: guess episode URL from the series slug
          if (series) {
            var sSlug = extractSectionSlug(series.url, "series");
            if (sSlug) {
              var guess = BASE_URL + "/episodes/" + sSlug + "-" + season + "x" + episode;
              return tryFetchPlayers(guess).then(function(html5) {
                if (html5) return { url: guess, html: html5 };
                return { url: "", html: "" };
              });
            }
          }
          return { url: "", html: "" };
        });
      });
    });
  });
}

// ===== DOOPLAY PLAYER OPTIONS =====

function hasPlayerOptions(html) {
  return /dooplay_player_option[^>]*data-post=['"]?\d+/i.test(html) ||
         /data-post=['"]\d+['"][^>]*data-type=['"][^'"]+['"]/i.test(html);
}

function extractPlayerOptions(html) {
  var options = [];
  var seen = {};
  var m;
  var liRe = /<li[^>]*class=['"][^'"]*dooplay_player_option[^'"]*['"][^>]*>([\s\S]*?)<\/li>/gi;
  while ((m = liRe.exec(html)) !== null) {
    var tag = m[0];
    var post = attrValue(tag, "data-post") || attrValue(tag, "data-id");
    if (!post) continue;
    var type = attrValue(tag, "data-type") || "movie";
    var nume = attrValue(tag, "data-nume") || attrValue(tag, "data-source") || "1";
    var labelMatch = m[1].match(/<span[^>]*class=['"][^'"]*title[^'"]*['"][^>]*>([^<]*)<\//i);
    var label = labelMatch ? stripTags(labelMatch[1]) : "";
    var key = post + "-" + nume;
    if (seen[key]) continue;
    seen[key] = 1;
    options.push({ post: post, type: type, nume: nume, label: label });
  }
  if (!options.length) {
    var tagRe = /<[^>]*data-post=['"](\d+)['"][^>]*>/gi;
    while ((m = tagRe.exec(html)) !== null) {
      var tag2 = m[0];
      var post2 = m[1];
      var type2 = attrValue(tag2, "data-type") || "movie";
      var nume2 = attrValue(tag2, "data-nume") || attrValue(tag2, "data-source") || "1";
      var key2 = post2 + "-" + nume2;
      if (seen[key2]) continue;
      seen[key2] = 1;
      options.push({ post: post2, type: type2, nume: nume2, label: "" });
    }
  }
  console.log("[PinoyMoviesHub] Found", options.length, "player option(s)");
  return options;
}

function callDooPlayerAPI(player, pageUrl) {
  var apiUrl = BASE_URL + "/wp-json/dooplayer/v2/" + player.post + "/" + player.type + "/" + player.nume;
  return fetchJson(apiUrl, {
    headers: {
      "X-Requested-With": "XMLHttpRequest",
      "Referer": pageUrl || BASE_URL + "/"
    }
  }).then(function(data) {
    if (!data) return "";
    if (Object.prototype.toString.call(data) === "[object Array]") data = data[0];
    if (!data) return "";
    var embedUrl = data.embed_url || data.url || data.source || data.link || data.file || data.src;
    if (!embedUrl && data.data) {
      embedUrl = data.data.embed_url || data.data.url || data.data.source;
    }
    if (!embedUrl && (data.html || data.iframe)) {
      var m = String(data.html || data.iframe).match(/src=['"]([^'"]+)['"]/i);
      if (m) embedUrl = m[1];
    }
    return embedUrl ? String(embedUrl) : "";
  }).catch(function() { return ""; });
}

// ===== EXTRACTOR: MIXDROP (direct mp4 via Dean Edwards unpacker) =====

function jsUnescape(s) {
  return String(s).replace(/\\(u[0-9a-fA-F]{4}|x[0-9a-fA-F]{2}|[0-3][0-7]{0,2}|[\\nrtbfv'"0])/g, function(all, esc) {
    if (esc.charAt(0) === "u" || esc.charAt(0) === "x") {
      return String.fromCharCode(parseInt(esc.slice(1), 16));
    }
    switch (esc) {
      case "n": return "\n";
      case "r": return "\r";
      case "t": return "\t";
      case "b": return "\b";
      case "f": return "\f";
      case "v": return "\v";
      case "0": return "\0";
      case "\\": return "\\";
      case "'": return "'";
      case '"': return '"';
      default: return esc;
    }
  });
}

/**
 * Pure-JS Dean Edwards packer unpacker (p,a,c,k,e,d).
 * Mixdrop embeds the player config in an eval(function(p,a,c,k,e,d){...})
 * payload containing MDCore.wurl (the direct file URL).
 */
function unpackPacker(packed) {
  // Canonical Dean Edwards single-quoted layout:
  // }('payload',base,count,'k0|k1|...'.split('|'),0,{})
  var m = String(packed).match(/\}\s*\(\s*'((?:\\.|[^'\\])*)'\s*,\s*\d+\s*,\s*(\d+)\s*,\s*'([^']*)'\.split\('\|'\)/);
  if (!m) return "";
  var payload = jsUnescape(m[1]);
  var keys = jsUnescape(m[3]).split("|");
  var dict = {};
  var i;
  for (i = 0; i < keys.length; i++) dict[String(i)] = keys[i];
  return payload.replace(/\b\w+\b/g, function(w) {
    return (dict[w] !== undefined && dict[w] !== "") ? dict[w] : w;
  });
}

function extractMixdropDirect(embedUrl) {
  return fetchText(embedUrl, {
    headers: {
      "Referer": BASE_URL + "/",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
    }
  }).then(function(html) {
    var packedMatch = html.match(/eval\(function\(p,a,c,k,e,d\)[\s\S]{0,3000}?\}\)\)/);
    var unpacked = packedMatch ? unpackPacker(packedMatch[0]) : "";
    var wurl = "";
    var m = unpacked.match(/MDCore\.wurl\s*=\s*["']([^"']*)["']/);
    if (m) wurl = m[1];
    if (!wurl) {
      m = html.match(/MDCore\.wurl\s*=\s*["']([^"']*)["']/);
      if (m) wurl = m[1];
    }
    if (!wurl || wurl === " " || wurl.length < 6) return null;
    if (wurl.indexOf("//") === 0) wurl = "https:" + wurl;
    else if (wurl.indexOf("http") !== 0) wurl = "https://" + wurl.replace(/^\/+/, "");
    var host = hostOf(embedUrl);
    var referered = { Referer: "https://" + host + "/", "User-Agent": HEADERS["User-Agent"] };
    // v5.5.0 webOS adaptation: emit HEADERLESS when the CDN serves the bytes
    // without a Referer (webOS players cannot send headers). Fail-closed to
    // the historical headers-carrying row otherwise (mobile unchanged).
    return probeHeaderless(wurl).then(function(headerlessOk) {
      return {
        url: wurl,
        headers: headerlessOk ? null : referered,
        headerless: headerlessOk,
        preflight: headerlessOk ? { ok: true, status: 206 } : null
      };
    });
  }).catch(function(e) {
    console.log("[PinoyMoviesHub] mixdrop extract failed:", e.message);
    return null;
  });
}

// ===== EXTRACTOR: BYSE (React SPA -> /api/videos/{code} -> AES-GCM payload) =====

var LANE_TIMEOUT_MS = 120000; // attestation + proof-of-work can take ~90s
var MIXDROP_LANE_TIMEOUT_MS = 20000;
var MAX_PLAYER_OPTIONS = 4;
var MAX_STREAM_ROWS = 6;
var MAX_BYSE_CANDIDATES = 3;

function isByse(host) {
  return /byse/.test(String(host || "").toLowerCase());
}

// Device evidence shows ONE sprintcdn Byse edge used by the affected network
// never completes a TCP handshake. Do not blacklist the whole owphbf24.com
// CDN: Byse rotates across that domain and the other edges may be playable.
function isKnownDeadByseHost(host) {
  var h = String(host || "").toLowerCase();
  return h === "edge1-moscow-sprintcdn.owphbf24.com";
}

function byseFailoverUrl(url) {
  var h = hostOf(url);
  if (h !== "edge1-moscow-sprintcdn.owphbf24.com") return "";
  // The signed path/query is accepted by the Vienna edge and the Moscow edge
  // is the one that times out on the affected network. Keep this narrowly
  // scoped to the confirmed PMH Byse edge pair; do not rewrite arbitrary CDN
  // hosts or alter unrelated signed URLs.
  return String(url).replace(h, "edge1-vienna-sprintcdn.owphbf24.com");
}

function byseTimestampMs(value) {
  if (value === undefined || value === null || value === "") return 0;
  if (typeof value === "string" && /[a-z]/i.test(value)) {
    var parsed = Date.parse(value);
    return isNaN(parsed) ? 0 : parsed;
  }
  var n = Number(value);
  if (!isFinite(n) || n < 1000000000) return 0;
  return n < 1000000000000 ? n * 1000 : n;
}

function byseSignedUrlExpired(url, playback) {
  var now = Date.now() + 15000;
  var values = [playback && playback.expires_at];
  var text = String(url || "");
  var q = text.match(/[?&](?:exp|expires|expires_at|expiry)=([^&#]+)/ig) || [];
  for (var i = 0; i < q.length; i++) values.push(q[i].replace(/^[?&][^=]+=\s*/i, ""));
  for (i = 0; i < values.length; i++) {
    var expires = byseTimestampMs(values[i]);
    if (expires && expires <= now) return true;
  }
  // Current Byse CDN URLs use `s` as the Unix start time and `e` as the
  // lifetime in seconds (for example `s=1794767190&e=10800`). Do not treat
  // the small duration value as an absolute Unix timestamp.
  var sm = text.match(/[?&]s=([^&#]+)/i);
  var em = text.match(/[?&]e=([^&#]+)/i);
  var startSec = sm ? Number(sm[1]) : 0;
  var durationSec = em ? Number(em[1]) : 0;
  if (isFinite(startSec) && startSec >= 1000000000 &&
      isFinite(durationSec) && durationSec > 0 && durationSec < 1000000000 &&
      (startSec + durationSec) * 1000 <= now) return true;
  // A few older mirrors used `e` as an absolute Unix expiry without `s`.
  if (!sm && em) {
    var absoluteE = byseTimestampMs(em[1]);
    if (absoluteE && absoluteE <= now) return true;
  }
  return false;
}

/**
 * Deterministic stream ordering (v5.2.2). Lower sorts first:
 *   0 Byse    - signed, self-authorizing URLs, play headerless everywhere
 *   1 Mixdrop - CDN enforces Referer (fine on mobile, needs proxy on webOS)
 *   2 Dood    - same Referer-enforcing family
 *   3 unknown
 * The site's own player chip (label) is the stable signal - Byse playback
 * domains are randomized edges - with a host-pattern fallback.
 */
function hostPriority(label, embedHost) {
  // v5.9.0: Mixdrop outranks Byse. Device reports: Byse rows never played on
  // the user's network (both the vienna and the moscow owphbf24.com edges
  // unreachable from PH) while Mixdrop rows play — Byse-first made every
  // tap start on a dead row.
  var l = String(label || "").toLowerCase();
  var h = String(embedHost || "").toLowerCase();
  if (/mixdrop|mixdrp|mxdrop|miixdrop|mixdroop/.test(l) || /mixdrop|mixdrp|mxdrop|miixdrop|mixdroop/.test(h)) return 0;
  if (/byse/.test(l) || /byse/.test(h)) return 1;
  if (/dood|dsvplay|dooo|playmogo|myvidplay|d000d|ds2play/.test(l) || /dood|dsvplay|dooo|playmogo|myvidplay|d000d|ds2play/.test(h)) return 2;
  return 3;
}

/**
 * Resolves null when the lane exceeds ms; the underlying work keeps running
 * and its late result is discarded. One slow CDN can no longer stall (or
 * via a global timeout, discard) the faster lanes - partial results ship
 * as soon as the deadline fires.
 */
function withLaneDeadline(promise, ms) {
  if (!hasTimers()) return promise.catch(function () { return null; });
  return new Promise(function(resolve) {
    var settled = false;
    var timer = setTimeout(function() {
      if (!settled) { settled = true; resolve(null); }
    }, ms || LANE_TIMEOUT_MS);
    promise.then(function(r) {
      if (!settled) { settled = true; clearTimeout(timer); resolve(r); }
    }, function() {
      if (!settled) { settled = true; clearTimeout(timer); resolve(null); }
    });
  });
}

/**
 * Byse embeds (e.g. https://bysesayeveum.com/e/{code}) are a Vite/React SPA.
 * Current playback is a two-step flow: GET /api/videos/{code}/embed/details,
 * then a fingerprinted POST to /api/videos/{code}/embed/playback. The POST
 * returns direct sources or an AES-GCM playback envelope. The old one-request
 * /api/videos/{code} response is retained as a mirror fallback.
 */
function byseRowsFromSources(sources, playback) {
  var valid = [], i, s, u;
  for (i = 0; i < (sources || []).length; i++) {
    s = sources[i];
    u = s && (s.url || s.file || s.src);
    if (!u || String(u).indexOf("http") !== 0) continue;
    // Some Byse AES payloads JSON-decode ampersands as the literal text
    // "\\u0026". Normalize that representation before URL parsing; otherwise
    // the CDN sees one malformed query parameter and returns a hard failure.
    var originalUrl = String(u).replace(/\\u0026/gi, "&").replace(/\\&/g, "&").replace(/\\\//g, "/").replace(/&amp;/gi, "&");
    var candidateUrl = originalUrl;
    if (isKnownDeadByseHost(hostOf(originalUrl))) candidateUrl = byseFailoverUrl(originalUrl);
    if (!candidateUrl || byseSignedUrlExpired(candidateUrl, playback || null)) continue;
    valid.push({ source: s, url: candidateUrl });
  }
  if (!valid.length) return null;
  valid.sort(function(a, b) {
    return (parseInt(b.source.height, 10) || 0) - (parseInt(a.source.height, 10) || 0);
  });
  var picked = [], seenHosts = {};
  function addCandidate(row) {
    var h = hostOf(row.url);
    if (seenHosts[h + "|" + row.url]) return;
    if (!seenHosts[h]) seenHosts[h] = 1;
    seenHosts[h + "|" + row.url] = 1;
    picked.push(row);
  }
  for (i = 0; i < valid.length && picked.length < MAX_BYSE_CANDIDATES; i++) {
    if (!seenHosts[hostOf(valid[i].url)]) addCandidate(valid[i]);
  }
  for (i = 0; i < valid.length && picked.length < MAX_BYSE_CANDIDATES; i++) addCandidate(valid[i]);
  return picked.map(function(row) {
    var src = row.source;
    var isHls = /m3u8/i.test(String(src.mime_type || src.mime || "") + row.url);
    var q = (src.label && src.label !== "x")
      ? parseQuality(String(src.label))
      : (parseInt(src.height, 10) ? parseQuality(String(src.height) + "p") : "Auto");
    return { url: row.url, quality: q, isHls: isHls };
  });
}

function byseHexToken(len) {
  var chars = "0123456789abcdef";
  var out = "", i;
  for (i = 0; i < (len || 32); i++) out += chars.charAt(Math.floor(Math.random() * chars.length));
  return out;
}

function byseDecryptSources(playback) {
  if (!playback || !playback.payload || !playback.iv) return null;
  var keyBytes = byseKeyFromParts(playback);
  if (!keyBytes || keyBytes.length !== 32) return null;
  var plain = aesGcmDecryptNoTag(keyBytes, b64urlToBytes(playback.iv), b64urlToBytes(playback.payload));
  if (!plain.length) return null;
  try {
    var info = JSON.parse(bytesToUtf8(plain));
    return byseRowsFromSources((info && info.sources) || [], playback);
  } catch (e) { return null; }
}

function byseDecryptSourcesAsync(playback) {
  var c = byseCryptoObject();
  if (!c || !c.subtle || !playback || !playback.payload || !playback.iv) {
    return Promise.resolve(byseDecryptSources(playback));
  }
  var keyBytes = byseKeyFromParts(playback);
  var ivBytes = b64urlToBytes(playback.iv);
  var payloadBytes = b64urlToBytes(playback.payload);
  if (!keyBytes || keyBytes.length !== 32 || !ivBytes.length || !payloadBytes.length) {
    return Promise.resolve(byseDecryptSources(playback));
  }
  return c.subtle.importKey("raw", new Uint8Array(keyBytes), { name: "AES-GCM" }, false, ["decrypt"]).then(function(key) {
    return c.subtle.decrypt({ name: "AES-GCM", iv: new Uint8Array(ivBytes) }, key, new Uint8Array(payloadBytes));
  }).then(function(plain) {
    var info = JSON.parse(bytesToUtf8(new Uint8Array(plain)));
    return byseRowsFromSources((info && info.sources) || [], playback);
  }).catch(function() {
    return byseDecryptSources(playback);
  });
}

function extractByseLegacy(host, code) {
  return fetchJson("https://" + host + "/api/videos/" + code, {
    headers: {
      "Accept": "application/json",
      "Referer": BASE_URL + "/",
      "Origin": BASE_URL
    }
  }).then(function(data) {
    if (!data || data.error || data.premium_only) return null;
    if (data.sources) return byseRowsFromSources(data.sources, data.playback || null);
    return byseDecryptSources(data.playback);
  });
}

/**
 * Current Byse flow: details GET -> device attestation -> proof-of-work
 * player check -> fingerprinted playback POST -> direct signed source. The
 * old one-request endpoint remains as a mirror fallback for older mirrors.
 */
function extractByseDirect(embedUrl) {
  var codeMatch = embedUrl.match(/\/e\/([a-z0-9]+)/i);
  if (!codeMatch) return Promise.resolve(null);
  var code = codeMatch[1];
  var host = hostOf(embedUrl);
  var detailsUrl = "https://" + host + "/api/videos/" + code + "/embed/details";
  var detailsHeaders = {
    "Accept": "application/json",
    "Referer": BASE_URL + "/",
    "Origin": BASE_URL
  };
  return fetchJson(detailsUrl, { headers: detailsHeaders, timeoutMs: 12000 }).then(function(details) {
    if (!details) return extractByseLegacy(host, code);
    var frame = details.embed_frame_url || details.embedFrameUrl || details.embed_url || details.frame_url || embedUrl;
    if (String(frame).indexOf("http") !== 0) frame = "https://" + host + (String(frame).charAt(0) === "/" ? frame : "/" + frame);
    var embedHost = hostOf(frame) || host;
    // The playback response is signed with a short-lived CDN URL. Some
    // upstream/cache layers replay the previous JSON response unless the
    // request is explicitly cache-busted, which leaves `e=` already expired
    // by the time the native player receives it.
    var playbackUrl = "https://" + embedHost + "/api/videos/" + code + "/embed/playback?nv_cache=" + Date.now();
    var requestHeaders = {
      "Accept": "application/json",
      "Content-Type": "application/json",
      "Referer": frame,
      "Origin": "https://" + embedHost,
      "X-Embed-Origin": BASE_URL.replace(/^https?:\/\//, ""),
      "X-Embed-Parent": "https://" + host + "/e/" + code,
      "X-Embed-Referer": BASE_URL + "/"
    };
    return byseAttest(embedHost, frame).then(function(attested) {
      var viewerId, deviceId, nowSec, fakeToken, fp, tokenPromise;
      if (attested) {
        fp = attested;
        tokenPromise = bysePlaybackToken(embedHost, code, frame, requestHeaders, fp);
      } else {
        // Older Nuvio workers may not expose WebCrypto. Keep the pre-attestation
        // request as a compatibility fallback; current Byse will reject it with
        // captcha_required and then fall back cleanly to the legacy mirror.
        viewerId = byseHexToken(32);
        deviceId = byseHexToken(32);
        nowSec = Math.floor(Date.now() / 1000);
        fakeToken = utf8ToB64Url(JSON.stringify({ viewer_id: viewerId, device_id: deviceId, confidence: 0.93, iat: nowSec, exp: nowSec + 600 })) + ".AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";
        fp = { token: fakeToken, viewer_id: viewerId, device_id: deviceId, confidence: 0.93 };
        tokenPromise = Promise.resolve(null);
      }
      return tokenPromise.then(function(captchaToken) {
        var playbackHeaders = merge(requestHeaders, captchaToken ? { "X-Captcha-Token": captchaToken } : {});
        playbackHeaders["Cache-Control"] = "no-cache, no-store";
        playbackHeaders["Pragma"] = "no-cache";
        return fetchJson(playbackUrl, {
          method: "POST",
          body: JSON.stringify({ fingerprint: fp }),
          timeoutMs: 12000,
          headers: playbackHeaders
        });
      });
    }).then(function(response) {
      if (!response) return extractByseLegacy(host, code);
      var rows = byseRowsFromSources(response.sources || [], response.playback || null);
      if (rows && rows.length) return rows;
      return byseDecryptSourcesAsync(response.playback).then(function(decryptedRows) {
        return decryptedRows && decryptedRows.length ? decryptedRows : extractByseLegacy(host, code);
      });
    });
  }).catch(function(e) {
    console.log("[PinoyMoviesHub] modern Byse extract failed:", e.message);
    return extractByseLegacy(host, code).catch(function() { return null; });
  });
}

// ===== EXTRACTOR: DOODSTREAM FAMILY (pass_md5 flow + gate detection) =====

function isDoodFamily(host) {
  var h = String(host || "").toLowerCase();
  if (h.indexOf("dood") !== -1) return true;
  if (h.indexOf("dsvplay") !== -1 || h.indexOf("dooo") !== -1) return true;
  // known dood-clone custom domains used by PMH
  var known = ["playmogo.com", "myvidplay.com", "dsvplay.com", "d000d.com", "dooood.com", "ds2play.com", "ds2play2.com", "doodcdn.io"];
  var i;
  for (i = 0; i < known.length; i++) {
    if (h === known[i] || h.indexOf(known[i]) !== -1) return true;
  }
  return false;
}

function isMixdrop(host) {
  var h = String(host || "").toLowerCase();
  // mixdrop.top, mixdrop.co, mixdrp.co, mxdrop.to, miixdrop.top, mixdroop.co ...
  return /mixdrop|mixdrp|mxdrop|miixdrop|mixdroop/.test(h);
}

/**
 * Dood clones (playmogo.com, dsvplay.com, dood.yt, ...) reference the
 * pass_md5 path from their player script. Both quoted-path and loose
 * variants exist, and some clones packer-pack the player JS.
 */
function doodFindMd5Path(html) {
  // Current Dood/Playmogo scripts sometimes escape the slash as \\/ or
  // \\u002f, and some mirrors build the path as two segments. Normalize before
  // matching so a valid pass_md5 token is not truncated or missed.
  var source = String(html || "")
    .replace(/\\u002f/gi, "/")
    .replace(/\\\//g, "/");
  // v4.50.0 accuracy round (port of pencuri.js v1.4.1): the first path
  // segment now carries DASHES (device-verified 2026-10-18:
  // '/pass_md5/284165262-47-57-<expiry>-<sig>/<seg>' — the old [a-z0-9]+
  // matched only the numeric prefix and every /pass_md5 call 404'd).
  var m = source.match(/['"]\/(pass_md5\/[a-z0-9_-]+(?:\/[a-z0-9_-]+)?)['"]/i);
  if (m) return m[1];
  var unpacked = unpackPacker(source);
  if (unpacked) {
    m = unpacked.match(/['"]\/(pass_md5\/[a-z0-9_-]+(?:\/[a-z0-9_-]+)?)['"]/i);
    if (m) return m[1];
  }
  m = source.match(/\/pass_md5\/([a-z0-9_-]+)(?:\/([a-z0-9_-]+))?/i);
  return m ? "pass_md5/" + m[1] + (m[2] ? "/" + m[2] : "") : null;
}

function doodIsGated(html) {
  // Cloudflare Turnstile interstitial: solve -> /dood?op=validate -> reload.
  // A pure HTTP client can never pass this, so the player is unextractable.
  return /op=validate|turnstile\.render|challenges\.cloudflare\.com\/turnstile/i.test(html);
}

function doodIsDead(html) {
  return /video you are looking for is not found|class="not_found"/i.test(html);
}

function doodFetchDirect(host, md5Path, refererUrl, qualityHint) {
  var passUrl = "https://" + host + "/" + md5Path;
  return fetchText(passUrl, {
    headers: {
      "Referer": refererUrl,
      "X-Requested-With": "XMLHttpRequest"
    }
  }).then(function(body) {
    var base = String(body).trim();
    if (base.indexOf("http") !== 0) return null;
    var token = md5Path.split("/")[1] || "";
    // Dood treats expiry as the timestamp of this signed URL request, not as
    // a future expiration deadline. Passing a future value produces a URL
    // that looks valid but is rejected by the CDN.
    var expiry = Date.now();
    var directUrl = base + randomToken(10) + "?token=" + token + "&expiry=" + expiry;
    // v5.5.0 webOS adaptation: the token IS the authorization on most Dood
    // nodes -> headerless rows play on webOS/Tizen too. Fail-closed to the
    // Referer-carrying row when the CDN still demands it (mobile unchanged).
    return probeHeaderless(directUrl).then(function(headerlessOk) {
      return {
        url: directUrl,
        quality: parseQuality(qualityHint),
        headers: headerlessOk ? null : { Referer: "https://" + host + "/", "User-Agent": HEADERS["User-Agent"] },
        headerless: headerlessOk,
        preflight: headerlessOk ? { ok: true, status: 206 } : null
      };
    });
  }).catch(function() { return null; });
}

function extractDoodDirect(embedUrl) {
  var embedIdMatch = embedUrl.match(/\/e\/([a-z0-9]+)/i);
  if (!embedIdMatch) return Promise.resolve(null);
  var embedId = embedIdMatch[1];
  var qualityHint = "";

  // v4.50.0 accuracy round (port of pencuri.js v1.4.1): the Dood nodes
  // dsvplay.com / d000g.com / dsvtbs.com are NXDOMAIN-dead since 2026-10
  // (TV + probe logs: getaddrinfo ENOTFOUND / fetch failed on every tap).
  // The family serves the SAME /e/<id> embed on every sibling and
  // playmogo.com + d000d.com are live, so rewrite dead hosts onto live
  // siblings before fetching (live hosts pass through untouched).
  var DOOD_DEAD_TO_LIVE = {
    "dsvplay.com": "playmogo.com",
    "d000g.com": "d000d.com",
    "dsvtbs.com": "playmogo.com",
    "dsvplayz.com": "playmogo.com"
  };
  embedUrl = String(embedUrl).replace(/^(https?:\/\/)([^\/]+)/i, function(all, proto, host) {
    var bare = String(host).toLowerCase().replace(/^www\./, "");
    var live = DOOD_DEAD_TO_LIVE[bare];
    return live ? proto + live : all;
  });

  return fetchTextFollow(embedUrl, {
    headers: { Referer: BASE_URL + "/" }
  }).then(function(page) {
    var html = page.text;
    var host = hostOf(page.url) || hostOf(embedUrl);
    var embedFinalUrl = "https://" + host + "/e/" + embedId;
    var titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
    if (titleMatch) qualityHint = titleMatch[1];

    if (doodIsGated(html)) {
      console.log("[PinoyMoviesHub] dood captcha-gated, skipping (" + host + ")");
      return null;
    }
    if (doodIsDead(html)) {
      console.log("[PinoyMoviesHub] dood video dead, skipping (" + host + ")");
      return null;
    }

    // v4.50.0 accuracy round (port of pencuri.js v1.4.1): a spent signed
    // path answers non-URL ("RELOAD"), so doodFetchDirect returns null and
    // we refetch the embed page ONCE for a fresh path before giving up.
    var md5Path = doodFindMd5Path(html);
    if (md5Path) {
      return doodFetchDirect(host, md5Path, embedFinalUrl, qualityHint).then(function(row) {
        if (row) return row;
        return fetchTextFollow(embedUrl, { headers: { Referer: BASE_URL + "/" } }).then(function(page2) {
          if (!page2 || !page2.text) return null;
          var md5Path2 = doodFindMd5Path(page2.text);
          if (!md5Path2 || md5Path2 === md5Path) return null;
          var host2 = hostOf(page2.url) || host;
          return doodFetchDirect(host2, md5Path2, "https://" + host2 + "/e/" + embedId, qualityHint);
        });
      });
    }

    // Legacy fallback: /d/{id} download page (dref_url cookie set client-side).
    return fetchTextFollow("https://" + host + "/d/" + embedId, {
      headers: { Referer: embedFinalUrl, Cookie: "dref_url=" + encodeURIComponent(embedFinalUrl) }
    }).then(function(dl) {
      if (doodIsGated(dl.text)) return null;
      var t2 = dl.text.match(/<title[^>]*>([^<]*)<\/title>/i);
      if (t2 && !qualityHint) qualityHint = t2[1];
      var dlHost = hostOf(dl.url) || host;
      var md5Path2 = doodFindMd5Path(dl.text);
      if (!md5Path2) return null;
      return doodFetchDirect(dlHost, md5Path2, "https://" + dlHost + "/d/" + embedId, qualityHint);
    });
  }).catch(function(e) {
    console.log("[PinoyMoviesHub] dood extract failed (" + embedUrl + "):", e.message);
    return null;
  });
}

// ===== STREAM BUILDER =====

function shortLabel(player) {
  var label = String((player && player.label) || "");
  label = label.replace(/^watch\s*online\s*[-:]\s*/i, "").trim();
  return label || "Source " + ((player && player.nume) || "?");
}

function buildStream(displayTitle, player, resolved, meta, embedHost) {
  // resolved: { url, headers?, quality? } - direct links only. Byse lanes
  // carry no headers at all (TV-safe); Mixdrop/Dood carry Referer+UA, which
  // NuvioMobile's ExoPlayer sends natively.
  var host = hostOf(resolved.url);
  var lang = inferLang((player && player.label) || "");
  var label = shortLabel(player);
  var q = resolved.quality && resolved.quality !== "Auto" ? resolved.quality : parseQuality(label);

  var line1 = meta.isSeries
    ? "S" + meta.season + "E" + meta.episode + (meta.episodeTitle ? " - " + meta.episodeTitle : "") + " | " + displayTitle
    : displayTitle;
  var line2 = "Direct | " + q + " | " + lang + (host ? " | " + host : "");
  var line3 = label;

  var stream = {
    name: PROVIDER_NAME + " | " + label + " | " + q,
    title: line1 + "\n" + line2 + "\n" + line3,
    url: resolved.url,
    quality: q,
    behaviorHints: {
      bingeGroup: "pinoymovieshub-direct",
      // v5.9.1: Byse/mxcontent tokens are short-TTL. Device report: a cached
      // row replayed minutes later died at the player with HTTP 404
      // ("stream link has expired") while a fresh extraction still probes
      // 200 at t0/t0+20s/t0+60s. notProvisional makes the client re-extract
      // at every play, so the token is always fresh — and the preflight
      // warms it right before the player's own request.
      notProvisional: true
    }
  };
  // Headers ONLY when the CDN enforces them. A missing headers field is the
  // TV-safe signal: nothing for a webOS player to choke on.
  if (resolved.headers) stream.headers = resolved.headers;
  if (resolved.preflight) stream._preflight = resolved.preflight;
  // Internal sort key, stripped in getStreams before returning.
  stream._hostPriority = hostPriority(label, embedHost);
  return stream;
}

// ===== MAIN ENTRY =====

/**
 * asian-catalog addon fallback ids (v5.4.0 source-scoped aware):
 *   "asian:pmh-<slug>" -> { source: "pmh", slug, title }  (this plugin's
 *       rows: the slug IS pinoymovieshub's own movie/series page slug)
 *   "asian:ks-<slug>" / "asian:va-<slug>" -> { source, ... } rows owned by
 *       the AsianHub plugin; getStreams skips them fast.
 *   "asian:<slug>" (no prefix) -> { source: "", slug, title } legacy rows
 *       (stale CDN cache): de-slug + full resolution flow.
 *   Tolerates "asian/<slug>" and a trailing ".json". Returns null when the
 *   id is not an asian-catalog id.
 */
function parseAsianCatalogId(rawId) {
  var s = String(rawId || "").trim();
  var m = s.match(/^asian[:\/](.+)$/i);
  if (!m) return null;
  // v5.8.0: Nuvio passes the TAPPED EPISODE id for series built from the
  // addon's new detail metas — "asian:pmh-<slug>:<s>:<e>" (and urlencoded
  // %3A or "/" separators). Strip those decorations (and .json) BEFORE the
  // shape check, and capture the trailing digits as a season/episode
  // fallback for callers that receive no explicit s/e args.
  var body = m[1].replace(/\.json([^.].*)?$/i, "").replace(/\.json$/i, "");
  if (body.indexOf("%") >= 0) {
    try { var dec = decodeURIComponent(body); if (dec) body = dec; } catch (e) {}
  }
  // tokenise on BOTH separators so "/1/3" decorations survive (v5.8.0)
  var toks = body.split(/[:\/]/);
  var tail = toks[0].trim().toLowerCase();
  // season/episode ONLY from a pure :s:e / /s/e pair (never single trailing
  // path numbers — "slug/2026" must not read as E2026)
  var decS = /^\d+$/.test(toks[1] || "") && /^\d+$/.test(toks[2] || "") ? parseInt(toks[1], 10) : 0;
  var decE = decS > 0 ? parseInt(toks[2], 10) : 0;
  if (!tail || !/^[a-z0-9][a-z0-9-]*$/i.test(tail)) return null;
  var pm = tail.match(/^(ks|va|pmh|kh|an)-([a-z0-9][a-z0-9-]*)$/);
  if (pm) {
    if (!pm[2]) return null;
    var stitle = pm[2].replace(/-+/g, " ").replace(/\s+/g, " ").trim();
    if (!stitle) return null;
    return {
      source: pm[1], slug: pm[2], title: stitle,
      season: decS,
      episode: decE
    };
  }
  var title = tail.replace(/-+/g, " ").replace(/\s+/g, " ").trim();
  if (!title) return null;
  return {
    source: "", slug: tail, title: title,
    season: decS,
    episode: decE
  };
}

/**
 * v5.4.0 DIRECT page resolution for pmh- rows: navigate the site's own URL
 * structure (paths verified live 2026-09-10) instead of searching a title.
 * Returns { url, html } when a page with player options is found, else null
 * (caller falls back to the search-based resolvePageUrl).
 */
function resolvePageUrlDirect(slug, mediaType, season, episode) {
  var tryFetchPlayers = function(url) {
    return fetchText(url).then(function(html) {
      return hasPlayerOptions(html) ? { url: url, html: html } : null;
    }).catch(function() { return null; });
  };

  if (mediaType !== "tv") {
    return tryFetchPlayers(BASE_URL + "/movies/" + slug);
  }

  // TV: the series page server-renders the episode map for EVERY season
  // as <div class='numerando'>S - E</div><a href='.../episodes/SLUG-SxE'>.
  // hrefs use single quotes on this site — the findEpisodeUrlInSeries
  // regex already accepts both quote styles.
  return fetchText(BASE_URL + "/series/" + slug).then(function(seriesHtml) {
    var epUrl = findEpisodeUrlInSeries(seriesHtml, parseInt(season, 10) || 1, parseInt(episode, 10) || 1);
    if (!epUrl) return null;
    return tryFetchPlayers(epUrl);
  }).catch(function() { return null; });
}

// Return as soon as two direct rows are ready. The remaining lane promises
// are intentionally allowed to finish in the background; the old all-at-once
// join made one dead provider hold every usable provider until its deadline.
var FAST_LANE_GRACE_MS = 8000;

function collectFastLaneResults(lanes) {
  var pending = lanes.slice();
  var output = [];
  var hasMixdrop = pending.some(function(lane) { return lane.kind === "mixdrop"; });
  var mixdropSettled = !hasMixdrop;
  var graceStartedAt = 0;

  function consume(hit) {
    if (!hit || hit.timeout) return output;
    pending.splice(hit.index, 1);
    if (hit.lane.kind === "mixdrop") mixdropSettled = true;
    if (Array.isArray(hit.value)) {
      for (var i = 0; i < hit.value.length; i++) {
        if (hit.value[i]) output.push(hit.value[i]);
      }
    } else if (hit.value) {
      output.push(hit.value);
    }
    return step();
  }

  function racePending() {
    return Promise.race(pending.map(function(lane, index) {
      return Promise.resolve(lane.promise).then(function(value) {
        return { index: index, lane: lane, value: value };
      }, function() {
        return { index: index, lane: lane, value: null };
      });
    }));
  }

  function step() {
    if (!pending.length) return Promise.resolve(output);
    // Once Mixdrop is ready, give the slower Byse attestation/PoW lane a
    // bounded grace period. This keeps normal results fast while preserving
    // both sources when Byse finishes a few seconds after Mixdrop.
    if (mixdropSettled && output.length) {
      if (!graceStartedAt) graceStartedAt = Date.now();
      var remaining = FAST_LANE_GRACE_MS - (Date.now() - graceStartedAt);
      if (remaining <= 0) return Promise.resolve(output);
      var timeout = new Promise(function(resolve) {
        setTimeout(function() { resolve({ timeout: true }); }, remaining);
      });
      return Promise.race([racePending(), timeout]).then(consume);
    }
    return racePending().then(consume);
  }

  return step();
}

/**
 * Shared tail of getStreams: takes a resolved PMH page and extracts direct
 * streams from its Dooplay player options. Used by BOTH the TMDB-id path
 * and the asian-catalog fallback-id path.
 */
function extractStreamsFromPage(page, displayTitle, meta) {
  var html = page && page.html;
  if (!html) {
    console.log("[PinoyMoviesHub] No PMH page/players found for \"" + displayTitle + "\"");
    return [];
  }
  var options = extractPlayerOptions(html);
  if (!options.length) return [];

  // Prefer real sources; only fall back to trailer posts when nothing else exists.
  var realOptions = [];
  var trailerOptions = [];
  var oi;
  for (oi = 0; oi < options.length; oi++) {
    if (/trailer/i.test(options[oi].label || "")) trailerOptions.push(options[oi]);
    else realOptions.push(options[oi]);
  }
  var chosen = realOptions.length ? realOptions : trailerOptions;

  var lanes = chosen.slice(0, MAX_PLAYER_OPTIONS).map(function(player) {
    var label = String(player.label || "").toLowerCase();
    var kind = /mixdrop|mixdrp|mxdrop|miixdrop|mixdroop/.test(label)
      ? "mixdrop"
      : (/byse/.test(label) ? "byse" : "other");
    var laneTimeout = kind === "mixdrop" ? MIXDROP_LANE_TIMEOUT_MS : LANE_TIMEOUT_MS;
    return { kind: kind, promise: withLaneDeadline(callDooPlayerAPI(player, page.url).then(function(embedUrl) {
      if (!embedUrl) return null;
      var host = hostOf(embedUrl);
      var extractor = null;

      if (isMixdrop(host)) {
        extractor = extractMixdropDirect(embedUrl);
      } else if (isByse(host)) {
        extractor = extractByseDirect(embedUrl);
      } else if (isDoodFamily(host)) {
        extractor = extractDoodDirect(embedUrl);
      } else {
        // Unknown host: content-sniff for a mixdrop-style player
        // (auto-covers future mirror domains), then try the Byse API
        // shape (covers rebranded domains), else give up.
        extractor = extractMixdropDirect(embedUrl).then(function(direct) {
          return direct || extractByseDirect(embedUrl);
        });
      }

      return extractor.then(function(direct) {
        var rows = Array.isArray(direct) ? direct : (direct ? [direct] : []);
        if (rows.length) {
          return rows.map(function(row) {
            return row && row.url ? buildStream(displayTitle, player, {
              url: row.url,
              headers: row.headers,
              quality: row.quality,
              preflight: row.preflight
            }, meta, host) : null;
          }).filter(function(row) { return !!row; });
        }
        // Extraction unavailable (captcha-gated dood, dead video,
        // unknown SPA): skip the player. Nuvio has no webview on any
        // platform, so an embed URL could never play anyway.
        return null;
      });
    }), laneTimeout) };
  });

  return collectFastLaneResults(lanes).then(function(results) {
    var streams = [];
    var i;
    for (i = 0; i < results.length; i++) {
      if (Array.isArray(results[i])) {
        for (var ri = 0; ri < results[i].length; ri++) {
          if (results[i][ri]) streams.push(results[i][ri]);
        }
      } else if (results[i]) {
        streams.push(results[i]);
      }
    }
    if (streams.length > MAX_STREAM_ROWS) streams = streams.slice(0, MAX_STREAM_ROWS);
    // v5.9.0: device-side preflight decides the order — playable rows first
    // (hostPriority as tie-break), unreachable/dead rows kept but last.
    return preflightSort(streams);
  });
}

function getStreams(tmdbId, mediaType, season, episode) {
  // Legacy signatures:
  //   getStreams(tmdbId, season, episode)               -> mediaType undefined
  //   getStreams(tmdbId, mediaType, season, episode)    -> Nuvio contract (4 args)
  // NuvioTVSmart's local-id plugin path passes the catalog type verbatim
  // ("series"), and the app normalizes series/show/other->tv itself
  // (PluginModels.normalizePluginType) — but older builds may leak other
  // aliases, so normalize every known TV name before the legacy-shift check.
  var mt = String(mediaType === undefined || mediaType === null ? "" : mediaType).toLowerCase();
  if (mt === "series" || mt === "show" || mt === "tvshow" || mt === "tv_show") mt = "tv";
  if (mt !== "movie" && mt !== "tv") {
    // Legacy 3-arg shift ONLY when the mediaType slot held a number
    // (v5.6.0: a string alias like "tvshow" must not be swallowed into the
    // season slot — that produced season="" and a silent empty row).
    var slotRaw = String(mediaType === undefined || mediaType === null ? "" : mediaType);
    if (/^[0-9]+$/.test(slotRaw)) {
      episode = season;
      season = mediaType;
    }
    mt = "";
  }

  try { tmdbId = String(tmdbId); } catch (e) { tmdbId = ""; }
  // Tolerate prefixed ids ("tmdb:243248") — NuvioMobile passes the raw
  // catalog meta id when no TMDB API key is configured; a prefixed id would
  // 404 every TMDB request -> a dead row. Strip it defensively.
  tmdbId = tmdbId.replace(/^tmdb:/i, "").trim();
  season = (season === undefined || season === null || season === "") ? "" : String(season).replace(/^s/i, "").replace(/[^0-9]/g, "");
  episode = (episode === undefined || episode === null || episode === "") ? "" : String(episode).replace(/^e/i, "").replace(/[^0-9]/g, "");
  // v5.6.0: canonical unpadded numbers ("01"->"1"). Zero-padded values
  // broke BOTH the /episodes/<slug>-01x01 direct guess (404) and the
  // numerando equality (parseInt(m[1],10) === "01" is false) -> 0 streams.
  if (season !== "") season = String(parseInt(season, 10));
  if (episode !== "") episode = String(parseInt(episode, 10));

  console.log("[PinoyMoviesHub] === START tmdbId=" + tmdbId + " type=" + mt + " S" + season + "E" + episode + " ===");

  if (!tmdbId) return Promise.resolve([]);

  // v5.6.0: IMDb tt-id tolerance. The app hands raw tt-ids when it cannot
  // resolve them (no TMDB key -> ensureTmdbId returns null). Resolve with
  // the plugin's own TMDB key and continue with the numeric id; the found
  // type pins the movie/tv branch deterministically.
  if (/^tt[0-9]+/i.test(tmdbId)) {
    console.log("[PinoyMoviesHub] IMDb id " + tmdbId + " -> resolving via TMDB find");
    return resolveImdbToTmdb(tmdbId).then(function(hit) {
      if (!hit) {
        console.log("[PinoyMoviesHub] IMDb id not found on TMDB -> no streams");
        return [];
      }
      console.log("[PinoyMoviesHub] resolved " + tmdbId + " -> tmdb " + hit.tmdbId + " (" + hit.type + ") " + hit.title);
      return getStreamsCore(hit.tmdbId, hit.type, season, episode);
    }).catch(function(err) {
      console.error("[PinoyMoviesHub] imdb resolve error:", (err && err.message) || err);
      return [];
    });
  }

  return getStreamsCore(tmdbId, mt, season, episode);
}

/**
 * v5.6.0: the id/type-normalized core. `mt` is "movie", "tv", "" (auto)
 * or ""-with-numeric season (legacy 3-arg). All shapes pre-verified by
 * getStreams before entering here.
 */
function getStreamsCore(tmdbId, mt, season, episode) {
  // asian-catalog fallback rows (asian:<slug>): skip TMDB entirely.
  //   v5.4.0: pmh- rows resolve DIRECTLY against pinoymovieshub's own URL
  //   structure (the tail slug IS the site's page slug); search flow only
  //   as fallback. ks-/va- rows belong to AsianHub -> skipped fast.
  var catalogId = parseAsianCatalogId(tmdbId);
  if (catalogId) {
    if (catalogId.source === "ks" || catalogId.source === "va") {
      console.log("[PinoyMoviesHub] asian:" + catalogId.source + "- id -> handled by AsianHub plugin, skipping");
      return Promise.resolve([]);
    }
    // v5.7.0: kh- (KissKH lane of AsianHub) and an- (AnimeTVSlash plugin)
    // rows are not this plugin's content - skipping avoids false-matching
    // an unrelated pinoy title for drama/anime ids.
    if (catalogId.source === "kh" || catalogId.source === "an") {
      console.log("[PinoyMoviesHub] asian:" + catalogId.source + "- id -> handled by another plugin, skipping");
      return Promise.resolve([]);
    }
    var catIsSeries = mt === "tv" || !!(season && episode) ||
      !!(catalogId.season && catalogId.episode);
    var catType = catIsSeries ? "tv" : "movie";
    var catPseudo = { type: catType, title: catalogId.title, original: catalogId.title, year: "", raw: null };
    var catMeta = { isSeries: catIsSeries, season: season, episode: episode, episodeTitle: "" };
    // v5.8.0: the id suffix digits fill in when the app passes no s/e args
    // (episode taps surface the tapped id but not always the numbers)
    if ((!season || !episode) && catalogId.season && catalogId.episode) {
      season = season || String(catalogId.season);
      episode = episode || String(catalogId.episode);
      catMeta.season = season;
      catMeta.episode = episode;
    }
    var catDisplay = catIsSeries
      ? catalogId.title + " S" + season + "E" + episode
      : catalogId.title;
    console.log("[PinoyMoviesHub] catalog fallback id -> title=\"" + catalogId.title + "\" type=" + catType + " source=" + (catalogId.source || "generic"));
    if (catIsSeries && (!season || !episode)) {
      // v5.6.0: the app CAN pass undefined season/episode for shows
      // (show-level play, local-id catalog paths — all nullable Int? with
      // default null in NuvioMobile). Default to S1E1 like the app's own
      // scraper test runner does, instead of returning an empty row.
      season = season || "1";
      episode = episode || "1";
      console.log("[PinoyMoviesHub] no season/episode from app -> defaulting S1E1");
      catMeta.season = season;
      catMeta.episode = episode;
      catDisplay = catalogId.title + " S" + season + "E" + episode;
    }
    var directPageP = resolvePageUrlDirect(catalogId.slug, catType, season, episode);
    return directPageP.then(function(page) {
      if (page && page.html) {
        console.log("[PinoyMoviesHub] direct pmh- hit -> " + page.url);
        return extractStreamsFromPage(page, catDisplay, catMeta);
      }
      console.log("[PinoyMoviesHub] direct pmh- miss -> search-based resolution");
      return resolvePageUrl(catType, catPseudo, season, episode).then(function(page2) {
        return extractStreamsFromPage(page2, catDisplay, catMeta);
      });
    }).catch(function(err) {
      console.error("[PinoyMoviesHub] catalog fallback error:", (err && err.message) || err);
      return [];
    });
  }

  var forceTv = mt === "tv" || (!!(season && episode) && !mt);

  var tmdbPromise = mt === "movie"
    ? tmdbLookup("movie", tmdbId).then(function(r) { return r || getTmdbInfoAuto(tmdbId); })
    : forceTv
      ? tmdbLookup("tv", tmdbId).then(function(r) { return r || { type: "", title: "", original: "", year: "", raw: null }; })
      : getTmdbInfoAuto(tmdbId);

  return tmdbPromise.then(function(tmdb) {
    if (!tmdb || !tmdb.type || !tmdb.title) {
      console.log("[PinoyMoviesHub] Could not detect media for TMDB ID:", tmdbId);
      return [];
    }
    var type = tmdb.type;
    console.log("[PinoyMoviesHub] type=" + type + " | title=" + tmdb.title + " | year=" + tmdb.year);

    if (type === "tv" && (!season || !episode)) {
      // v5.6.0: default missing S/E to S1E1 (nullable Int? app contract) —
      // an empty row helped nobody; S1E1 is what the app itself probes.
      season = season || "1";
      episode = episode || "1";
      console.log("[PinoyMoviesHub] no season/episode from app -> defaulting S1E1");
    }

    var epPromise = type === "tv"
      ? getTmdbEpisodeTitle(tmdbId, season, episode)
      : Promise.resolve("");

    return epPromise.then(function(episodeTitle) {
      var meta = {
        isSeries: type === "tv",
        season: season,
        episode: episode,
        episodeTitle: episodeTitle
      };
      var displayTitle = meta.isSeries
        ? tmdb.title + " S" + season + "E" + episode
        : tmdb.title;

      return resolvePageUrl(type, tmdb, season, episode).then(function(page) {
        return extractStreamsFromPage(page, displayTitle, meta);
      });
    });
  }).catch(function(err) {
    console.error("[PinoyMoviesHub] error:", (err && err.message) || err);
    return [];
  });
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { getStreams: getStreams };
} else {
  global.getStreams = getStreams;
}


/* ===== nv universal subtitle lane v1.0.0 (pack 4.48.0) =====================
   Every scraper's stream rows now carry multi-language sidecar subtitles:
   English, Tagalog/Filipino, Korean, Japanese, Indonesian, Malay, Chinese,
   Thai + all other tracks the source offers.

   Source: Stremio's official keyless OpenSubtitles-v3 addon
     GET https://opensubtitles-v3.strem.io/subtitles/{movie|series}/{imdbId}[:s:e].json
     -> { subtitles: [{ url, lang(ISO-639-3), ... }] }
   The subs5.strem.io URLs serve UTF-8 SRT; NuvioTV's player converts SRT to
   WebVTT transparently (playerScreenMethods-42.createSubtitleObjectUrl), and
   the player merges stream.sidecar `subtitles` rows (lang/url/headers) into
   the subtitle rail - the same path the Pencuri English lane uses.

   Design: ES2020-safe, zero-dependency, fail-soft. The IMDb id is resolved
   once per title via TMDB external_ids (cached), the subtitle JSON once per
   (imdb, s, e) (cached 6h). The wrapper runs in PARALLEL with the provider's
   own lane and only fills rows that have no subtitles of their own, so
   provider-specific tracks (vidlove/anikoto/megaplay vtt, pencuri en) always
   win. Never throws; never delays the stream lane by more than the host's
   own 8s deadline.
=========================================================================== */
(function () {
  var G = typeof globalThis !== "undefined" ? globalThis : this;
  if (G.__nvOsv3Subs) return;

  var OSV3_BASE = "https://opensubtitles-v3.strem.io/subtitles/";
  var TMDB_KEY = (typeof TMDB_API_KEY === "string" && TMDB_API_KEY) || "6dc830f9624b43261325bed3bf7d0dfa";
  var TTL_MS = 6 * 60 * 60 * 1000;
  var DEADLINE_MS = 8000;

  /* ISO-639-3 -> ISO-639-1 (+ display names) for the pack's languages */
  var CODE_MAP = {
    eng: "en", tgl: "tl", fil: "fil", ko: "ko", kor: "ko", jpn: "ja",
    ind: "id", may: "ms", zho: "zh", zhe: "zh", zht: "zh-TW", tha: "th",
    hin: "hi", ben: "bn", tam: "ta", tel: "te", spa: "es", por: "pt",
    pob: "pt-BR", fre: "fr", ger: "de", ita: "it", rus: "ru", ara: "ar",
    tur: "tr", vie: "vi", pol: "pl", nld: "nl", ukr: "uk", pes: "fa",
    per: "fa", swe: "sv", nor: "no", dan: "da", fin: "fi", ell: "el",
    heb: "he", hun: "hu", ces: "cs", cze: "cs", ron: "ro", rum: "ro",
    hrv: "hr", srp: "sr", bul: "bg", slo: "sk", slv: "sl", bos: "bs",
    mac: "mk", mkd: "mk", est: "et", lav: "lv", lit: "lt", ind2: "id"
  };
  var NAME_MAP = {
    en: "English", tl: "Tagalog", fil: "Filipino", ko: "Korean", ja: "Japanese",
    id: "Indonesian", ms: "Malay", zh: "Chinese", "zh-TW": "Chinese (Traditional)",
    th: "Thai", hi: "Hindi", bn: "Bengali", ta: "Tamil", te: "Telugu",
    es: "Spanish", pt: "Portuguese", "pt-BR": "Portuguese (BR)", fr: "French",
    de: "German", it: "Italian", ru: "Russian", ar: "Arabic", tr: "Turkish",
    vi: "Vietnamese", pl: "Polish", nl: "Dutch", uk: "Ukrainian", fa: "Persian",
    sv: "Swedish", no: "Norwegian", da: "Danish", fi: "Finnish", el: "Greek",
    he: "Hebrew", hu: "Hungarian", cs: "Czech", sk: "Slovak", ro: "Romanian",
    hr: "Croatian", sr: "Serbian", bg: "Bulgarian", sl: "Slovenian",
    bs: "Bosnian", mk: "Macedonian", et: "Estonian", lv: "Latvian", lt: "Lithuanian"
  };

  var _cache = {};   /* key -> { t: ms, rows: [...] } */
  var _imdbCache = {}; /* tmdbKey -> { t: ms, imdb } */
  var _inflight = {};  /* key -> Promise */

  function _hasTimers() {
    return typeof setTimeout === "function" && typeof Promise !== "undefined" && Promise.race;
  }
  function _withDeadline(p) {
    if (!_hasTimers()) return p;
    return Promise.race([p, new Promise(function (res) {
      var t = setTimeout(function () { res(null); }, DEADLINE_MS);
      if (t && typeof t.unref === "function") t.unref();
    })]);
  }
  function _normType(mediaType) {
    var t = String(mediaType || "").toLowerCase();
    return (t === "series" || t === "show" || t === "tvshow" || t === "tv") ? "series" : "movie";
  }
  function _fetchJson(url) {
    return _withDeadline(
      (typeof fetch === "function" ? fetch(url) : Promise.reject(new Error("no fetch")))
        .then(function (res) {
          if (!res || !res.ok) return null;
          return res.json().catch(function () { return null; });
        })
        .catch(function () { return null; })
    );
  }
  function _resolveImdb(tmdbId, mediaType) {
    var key = _normType(mediaType) + ":" + String(tmdbId);
    var now = Date.now();
    if (_imdbCache[key] && now - _imdbCache[key].t < TTL_MS) {
      return Promise.resolve(_imdbCache[key].imdb);
    }
    if (_inflight["imdb:" + key]) return _inflight["imdb:" + key];
    var kind = _normType(mediaType) === "series" ? "tv" : "movie";
    var url = "https://api.themoviedb.org/3/" + kind + "/" + encodeURIComponent(String(tmdbId)) +
      "/external_ids?api_key=" + TMDB_KEY;
    _inflight["imdb:" + key] = _fetchJson(url).then(function (data) {
      var imdb = data && data.imdb_id && /^tt\d+$/.test(String(data.imdb_id)) ? String(data.imdb_id) : null;
      _imdbCache[key] = { t: now, imdb: imdb };
      delete _inflight["imdb:" + key];
      return imdb;
    });
    return _inflight["imdb:" + key];
  }
  function _osv3Rows(imdbId, mediaType, season, episode) {
    var isSeries = _normType(mediaType) === "series";
    var path = isSeries
      ? "series/" + encodeURIComponent(imdbId) + ":" + (parseInt(season, 10) || 1) + ":" + (parseInt(episode, 10) || 1) + ".json"
      : "movie/" + encodeURIComponent(imdbId) + ".json";
    var key = path;
    var now = Date.now();
    if (_cache[key] && now - _cache[key].t < TTL_MS) return Promise.resolve(_cache[key].rows);
    if (_inflight[key]) return _inflight[key];
    _inflight[key] = _fetchJson(OSV3_BASE + path).then(function (data) {
      var list = (data && Array.isArray(data.subtitles)) ? data.subtitles : [];
      var seen = {};
      var rows = [];
      for (var i = 0; i < list.length; i++) {
        var t = list[i];
        if (!t || !t.url) continue;
        var code = CODE_MAP[String(t.lang || "").toLowerCase()] || String(t.lang || "").toLowerCase();
        if (!code) continue;
        var dedupeKey = code + "|" + (t.id || t.url);
        if (seen[dedupeKey]) continue;
        seen[dedupeKey] = 1;
        rows.push({
          url: String(t.url),
          lang: code,
          language: code,
          name: NAME_MAP[code] || (String(t.lang || "subtitle").charAt(0).toUpperCase() + String(t.lang || "subtitle").slice(1))
        });
        if (rows.length >= 60) break;
      }
      _cache[key] = { t: now, rows: rows };
      delete _inflight[key];
      return rows;
    });
    return _inflight[key];
  }

  G.__nvOsv3Subs = {
    get: function (tmdbId, mediaType, season, episode) {
      try {
        return _resolveImdb(tmdbId, mediaType).then(function (imdb) {
          if (!imdb) return [];
          return _osv3Rows(imdb, mediaType, season, episode);
        }).catch(function () { return []; });
      } catch (e) { return Promise.resolve([]); }
    }
  };
})();

/* ===== nv universal subtitle wrapper v1.0.0 (pack 4.48.0) ==================
   Re-wraps module.exports.getStreams: runs the provider lane and the OSv3
   subtitle lane concurrently, then attaches the language tracks to every
   row that has no subtitles of its own. Provider-specific tracks always
   win; rows keep their originals untouched. Fail-soft end to end.
=========================================================================== */
(function () {
  var G = typeof globalThis !== "undefined" ? globalThis : this;
  var lane = G.__nvOsv3Subs;
  var orig = null;
  try { orig = module.exports && module.exports.getStreams; } catch (e) { orig = null; }
  if (!lane || typeof orig !== "function") return;
  module.exports.getStreams = function (tmdbId, mediaType, season, episode) {
    var rowsP;
    try {
      rowsP = Promise.resolve(orig.apply(this, arguments));
    } catch (e) {
      rowsP = Promise.resolve([]);
    }
    var subsP = lane.get(tmdbId, mediaType, season, episode).catch(function () { return []; });
    // Captions are optional. Give OSV3 a short head start, then return the
    // provider's playable rows even if the subtitle service is unavailable.
    var subsFastP;
    if (typeof setTimeout === "function" && typeof Promise !== "undefined" && Promise.race) {
      var subsTimer = null;
      var subsFallback = new Promise(function (resolve) {
        subsTimer = setTimeout(function () { resolve([]); }, 1200);
        if (subsTimer && typeof subsTimer.unref === "function") subsTimer.unref();
      });
      subsFastP = Promise.race([subsP, subsFallback]).then(function (value) {
        if (subsTimer != null && typeof clearTimeout === "function") clearTimeout(subsTimer);
        return value;
      }, function () {
        if (subsTimer != null && typeof clearTimeout === "function") clearTimeout(subsTimer);
        return [];
      });
    } else {
      subsFastP = Promise.resolve([]);
    }
    return Promise.all([rowsP.catch(function () { return []; }), subsFastP]).then(function (arr) {
      var rows = Array.isArray(arr[0]) ? arr[0] : [];
      var subs = Array.isArray(arr[1]) ? arr[1] : [];
      if (!rows.length || !subs.length) return rows;
      for (var i = 0; i < rows.length; i++) {
        var r = rows[i];
        if (r && (!r.subtitles || !r.subtitles.length)) r.subtitles = subs;
      }
      return rows;
    });
  };
})();

/* BEGIN NV_NON_ANIME_PROVIDER_BOUNDARY */
(function () {
  var G = typeof globalThis !== 'undefined' ? globalThis : this;
  var original = null;
  try { original = module.exports && module.exports.getStreams; } catch (e) { original = null; }
  if (typeof original !== 'function') return;
  var PROVIDER_ID = "pinoymovieshub";
  var MAX_MS = 12000;

  function number(raw) {
    return raw != null && /^\d+$/.test(String(raw).trim()) ? Number(raw) : null;
  }
  function clean(raw) {
    var id = String(raw == null ? '' : raw).trim();
    try { id = decodeURIComponent(id); } catch (e) {}
    id = id.replace(/[?#].*$/, '').replace(/\.json$/i, '').replace(/\/+$/, '');
    return id;
  }
  function normalize(input, mediaType, season, episode, argCount) {
    var id = clean(input);
    var mt = String(mediaType == null ? '' : mediaType).trim().toLowerCase();
    if (number(mediaType) != null && argCount === 3) {
      episode = season; season = mediaType; mt = 'tv';
    }
    var match = id.match(/^tmdb:(\d+)(?::(\d+)(?::(\d+))?)?$/i);
    if (match) {
      id = match[1];
      if (season == null && match[2] != null) season = Number(match[2]);
      if (episode == null && match[3] != null) episode = Number(match[3]);
    } else {
      match = id.match(/^(asian:[a-z0-9-]+|(?:mal|anilist|kitsu|anikoto):\d+)(?::(\d+)(?::(\d+))?)?$/i);
      if (match) {
        id = match[1];
        if (season == null && match[3] != null) season = Number(match[2]);
        if (episode == null && match[3] != null) episode = Number(match[3]);
        if (episode == null && match[2] != null && match[3] == null) episode = Number(match[2]);
        var owner = /^asian:pmh-/i.test(id) ? 'pinoymovieshub' :
          /^asian:pen-/i.test(id) ? 'pencuri' :
          /^asian:(?:ks|va|kh)-/i.test(id) ? 'asianhub' :
          /^asian:hd4u-/i.test(id) ? 'hdhub4u' :
          /^(mal|anilist|kitsu|anikoto):/i.test(id) ? 'miruro' : '';
        if (!owner || owner !== PROVIDER_ID) return null;
      } else if (!/^\d+$/.test(id) && !/^tt\d+$/i.test(id)) {
        return null;
      }
    }
    if (/^(series|show|tvshow|tv_show|tv|other)$/.test(mt)) mt = 'tv';
    else if (mt !== 'movie') mt = number(episode) != null ? 'tv' : 'movie';
    season = number(season); episode = number(episode);
    if (mt === 'tv' && (season == null || episode == null || episode < 1)) return null;
    return { id: id, mediaType: mt, season: season, episode: episode };
  }
  function cleanRows(raw) {
    if (!Array.isArray(raw)) return [];
    var out = [], seen = {};
    for (var i = 0; i < raw.length && out.length < 40; i++) {
      var row = raw[i];
      if (!row || typeof row !== 'object') continue;
      var url = String(row.url || row.playlist || '').trim();
      if (!/^https?:\/\//i.test(url) || /^https?:\/\/[^/]+\/$/i.test(url)) continue;
      if (/^(?:javascript|data):/i.test(url) || /(?:^|[?&])(?:error|message)=/i.test(url)) continue;
      if (seen[url]) continue;
      seen[url] = 1;
      var copy = {};
      for (var k in row) if (Object.prototype.hasOwnProperty.call(row, k)) copy[k] = row[k];
      copy.url = url;
      out.push(copy);
    }
    return out;
  }
  function tmdbKey() {
    var key = '';
    try {
      if (typeof G.__NV_TMDB_API_KEY === 'string') key = G.__NV_TMDB_API_KEY;
      if (!key && typeof TMDB_API_KEY === 'string') key = TMDB_API_KEY;
      if (!key && typeof TMDB_KEY === 'string') key = TMDB_KEY;
    } catch (e) {}
    return key;
  }
  function resolveImdb(id, mediaType) {
    if (!/^tt\d+$/i.test(id) || PROVIDER_ID === 'torrents' || PROVIDER_ID === 'tagalogtorrents') {
      return Promise.resolve(id);
    }
    var key = tmdbKey();
    if (!key || typeof fetch !== 'function') return Promise.resolve(null);
    var kind = mediaType === 'tv' ? 'tv_results' : 'movie_results';
    var request = Promise.resolve().then(function () {
      return fetch('https://api.themoviedb.org/3/find/' + encodeURIComponent(id) +
        '?external_source=imdb_id&api_key=' + encodeURIComponent(key));
    }).then(function (res) {
      if (!res || !res.ok) return null;
      return res.json();
    }).then(function (data) {
      var list = data && Array.isArray(data[kind]) ? data[kind] : [];
      return list.length && /^\d+$/.test(String(list[0].id)) ? String(list[0].id) : null;
    }).catch(function () { return null; });
    if (typeof setTimeout !== 'function' || typeof clearTimeout !== 'function') return request;
    var timer = null;
    var timeout = new Promise(function (resolve) {
      timer = setTimeout(function () { resolve(null); }, 6000);
      if (timer && typeof timer.unref === 'function') timer.unref();
    });
    return Promise.race([request, timeout]).then(function (result) {
      if (timer != null) clearTimeout(timer);
      return result;
    }).catch(function () {
      if (timer != null) clearTimeout(timer);
      return null;
    });
  }
  function invoke(args, normalized) {
    args[0] = normalized.id;
    args[1] = normalized.mediaType;
    args[2] = normalized.season;
    args[3] = normalized.episode;
    var pending;
    try { pending = Promise.resolve(original.apply(this, args)); }
    catch (e) { return Promise.resolve([]); }
    if (typeof setTimeout !== 'function' || typeof clearTimeout !== 'function') {
      return pending.then(cleanRows).catch(function () { return []; });
    }
    var timer = null;
    var timeout = new Promise(function (resolve) {
      timer = setTimeout(function () { resolve([]); }, MAX_MS);
      if (timer && typeof timer.unref === 'function') timer.unref();
    });
    return Promise.race([pending, timeout]).then(function (rows) {
      if (timer != null) clearTimeout(timer);
      return cleanRows(rows);
    }).catch(function () {
      if (timer != null) clearTimeout(timer);
      return [];
    });
  }
  module.exports.getStreams = function () {
    var args = Array.prototype.slice.call(arguments);
    var normalized = normalize(args[0], args[1], args[2], args[3], args.length);
    if (!normalized) return Promise.resolve([]);
    var self = this;
    return resolveImdb(normalized.id, normalized.mediaType).then(function (resolvedId) {
      if (!resolvedId) return [];
      normalized.id = resolvedId;
      return invoke.call(self, args, normalized);
    }).catch(function () { return []; });
  };
})();
/* END NV_NON_ANIME_PROVIDER_BOUNDARY */
