/**
 * NetMirror - Nuvio provider (v14.0.0)
 *
 * v14.0.0: FULL DECODE + net27.cc lane (2026-09-13).
 *  - User report on 4.24.0: "SLOW TO FETCH STREAMS / FULLY DECODE THE NETMIRROR.JS".
 *  - The All-in-One-Nuvio netmirror.js (obfuscated string-array + rotation) was
 *    FULLY DECODED this cycle: string table executed in a sandbox, every decoder
 *    call rewritten to its literal (117/117 calls resolved, 0 failures), then
 *    the decoded flow was LIVE-PROBED endpoint by endpoint. Findings:
 *      (a) AIO's primary lane is GET https://net27.cc/api/embed-tmdb/{id} -
 *          LIVE and answering 200 with {ok:true, streams:[{url,resolution}],
 *          mp4, captions:[{url,lang,name}]}. Wednesday S1E1 returned 3 signed
 *          mp4 rows (360/480/720 on bcdnxw.hakunaymatata.com) + multi-language
 *          SRT captions INCLUDING English. The 502 seen on 2026-09-12 was a
 *          burst rate limit (2 rapid calls -> 502), not a dead API.
 *      (b) The signed mp4 CDN serves 206 @ 8MB/s ONLY with
 *          Referer: https://videodownloader.site/ (206) - the net27 referer
 *          and no-referer both get 429. Row headers replicate that exactly.
 *      (c) Captions are relative (/api/proxy/video?url=...) -> prefixed with
 *          https://net27.cc (the AIO decode does the same); English-only per
 *          the standing netmirror rule.
 *      (d) AIO's NewTV lane confirmed: 24 mobiledetect/mobidetect domains ->
 *          /checknewtv.php (X-Requested-With: NetmirrorNewTV v1.0, truncated
 *          Chrome UA) -> {token_hash}=base64 api base (verified live:
 *          mobiledetects.com -> https://tv.imgcdn.kim). The /newtv/* API stays
 *          IP-gated (403 from datacenter, device lane for retail/mobile IPs).
 *  - v14 adds the net27 lane as the second row source (Alpha first - the
 *    user-validated lane - then net27, then NewTV, then VidSpark), URL-deduped.
 *    Every lane stays parallel; the provider run is bounded by the Alpha 9s cap
 *    and the per-fetch 8s caps, so the sheet is no longer hostage to any relay.
 *
 * v13.0.0: speed + coverage pass (2026-09-12).
 *  - User report on 4.23.0: "netmirror still not fix, only alpha works" + the
 *    whole pack loading slower than All-in-One-Nuvio.
 *  - Findings (live probes, 2026-09-12):
 *      (a) the Alpha candidate chain ran its search candidates SEQUENTIALLY -
 *          3 candidates x a stalled watchpvr fetch stacked to 17s with zero
 *          rows. Candidates now resolve IN PARALLEL (first set with rows wins).
 *      (b) the VidSpark (moviesapi.to vidora) API is ALIVE - same key, same
 *          paths - but only carries titles it has encoded: new releases answer
 *          in ~350ms (result:true + proxied HLS master verified to the variant
 *          level), older titles answer 404 {result:false,"Movie not yet
 *          encoded"}. That is not a lane failure - the lane is kept, fails
 *          fast on result:false, and covers exactly the titles the Alpha
 *          relay is slowest for.
 *      (c) the NewTV bootstrap (mobiledetects.com/checknewtv.php -> token_hash
 *          -> tv.imgcdn.kim) verified live; the newtv API stays IP-gated
 *          (403 "Page Not Found" from datacenter IPs) - it remains the AIO
 *          device lane for retail/mobile IPs.
 *  - v13 lane caps (the pack's sheet is bounded by the SLOWEST provider, so
 *    every cap was tightened): Alpha 9s (was 16s), NewTV 6s (was 12s),
 *    VidSpark 6s, overall provider run 10s (was 17s). The full late result is
 *    still late-cached, so a title whose Alpha rows missed the first serve has
 *    them on the next open of the sheet.
 *  - Lanes unchanged: Alpha relay (watchpvr, /^Alpha/ only, English) + NewTV
 *    (AIO device lane) + VidSpark (vidora proxied HLS, English/Tagalog VTT).
 *    English-only + Tagalog caption rules, caches and tolerant ids unchanged.
 *
 * v12.0.0 history: full AIO decode applied - NewTV lane added, net27 lane REMOVED (2026-09-12).
 *  - User report on 4.22.0: "netmirror not providing stream".
 *  - Root cause (full decode of the AIO netmirror + live probes):
 *      (a) v11's net27 embed lane returns rows whose URLs point at
 *          bcdnw/bcdnxw.hakunaymatata.com - the SAME CDN the user's device
 *          gets 429-blocked on (that is WHY v10 removed the watchbox rows;
 *          v11 accidentally re-added them via net27). REMOVED again here.
 *      (b) The decoded AIO build's REAL device path is its "NewTV" lane:
 *          24 base64 mobiledetect and mobidetect domains -> GET /checknewtv.php
 *          (X-Requested-With: NetmirrorNewTV v1.0) -> {token_hash} -> base64
 *          decode = the LIVE API base (verified: mobiledetects.com ->
 *          tv.imgcdn.kim). Then /newtv/search.php?s=title -> /newtv/post.php
 *          -> /newtv/episodes.php -> /newtv/player.php?id= -> {video_link,
 *          referer}. Datacenter IPs get 403 "Page Not Found" on the API
 *          (IP-gated) - which is exactly why this lane looked dead before;
 *          on retail/mobile IPs it is the lane AIO users stream with.
 *          Ported 1:1 here (headers incl. the Ott: <ott> app header, exact
 *          episode matching incl. E/S-number parsing + pagination).
 *      (c) v11 capped the Alpha relay lane at 10s - on mobile the relay
 *          needs 12-15s, so the sheet served BEFORE the only user-proven
 *          lane had rows. Cap raised to 16s (inside Nuvio's ~20s budget;
 *          the fast lanes still serve first when they have rows).
 *  - v12 lanes (parallel): Alpha relay (watchpvr, /^Alpha/ only) + NewTV
 *    (AIO device lane) + VidSpark (net77 stack, proxied CDNs). Combine:
 *    Alpha first, then NewTV, then VidSpark. English-only + Tagalog caption
 *    rules unchanged; caches and tolerant id parsing unchanged.
 *
 * v10.0.0 history: Alpha-only + VidSpark lane (2026-09-12).
 *  - User report: "netmirror only alpha stream works - remove not working
 *    stream just leave alpha" + "review net77.cc for netmirror to get more
 *    streams" + cinejoy still broken.
 *  - Recon (live):
 *      (a) Of the Multi-Lang Server sources ONLY "Alpha - English" plays on
 *          the user's device (Halo/Beta/... lanes and the watchbox mp4 CDN
 *          rows all fail there). Per the user's instruction the watchpvr
 *          lane now emits ONLY Alpha sources and the ENTIRE watchbox
 *          6-host mp4 fan-out is REMOVED (its bcdn*.hakunaymatata.com URLs
 *          were the "not working" rows).
 *      (b) net77.cc (IP-gated to residential ranges; probed via its SEO
 *          funnel netmirror.hair -> ww1.surf -> netmirror-app.pages.dev)
 *          is a Netmirror-branded TMDB catalog app that embeds PUBLIC
 *          providers: vidlink.pro, vidsrc.to, vidsrc-embed.ru,
 *          player.videasy.net, player.vidzee.wtf, player.autoembed.cc,
 *          moviesapi.to, mapple.uk, 111movies.com, 2embed.cc,
 *          primesrc.me, multiembed.mov. Verified reachable + resolvable
 *          end-to-end from a plain HTTP client: MOVIESAPI.TO "VidSpark"
 *          (vidora API - the same stack the app embeds):
 *              GET https://moviesapi.to/api/vidora/v1/movie/{tmdbId}
 *                  /api/vidora/v1/tv/{tmdbId}/{s}/{e}
 *                  x-player-key: 3a67e886...aa6b13 (static, from the
 *                  site's own player bundle), Referer moviesapi.to
 *              -> {result:true, sources:[{url: HLS master, tracks: VTT}]}
 *              master -> variants (1280x640, 1920x960...) -> SEGMENT 200
 *              video/MP2T verified; delivery rotates proxied CDNs
 *              (cdn-proxy.sparkvid.workers.dev, bx.netrocdn.site) - the
 *              429-happy hakunaymatata CDN is never touched. English +
 *              Filipino VTT subtitles included.
 *  - New flow:
 *      1. VidSpark lane (NEW, primary for coverage): TMDB id -> vidora API
 *         -> HLS master parsed into one row per variant (quality from
 *         RESOLUTION), fallback single "Auto" row (the post-filter's m3u8
 *         probe labels it) - works for ANY tmdb id with zero title
 *         mapping, plain text GETs, 100% Mobile-safe.
 *      2. Alpha lane (netmirror.center): search2 -> detail -> signed
 *         watchpvr.php -> sources filtered to /^Alpha/ only (English-only
 *         rule + the user's "leave alpha" instruction).
 *      3. Both lanes run in PARALLEL; rows merged (Alpha first, VidSpark
 *         after); subtitles unioned (Alpha SRTs preferred, VidSpark VTTs
 *         fill in) and filtered to the captionLang setting.
 *  - All requests are plain GETs with text bodies - 100% NuvioMobile-safe
 *    (no binary transport, no relay, no settings needed).
 *  - HMAC-SHA256 is implemented in pure JS (no CryptoJS in the plugin
 *    runtime); unit-tested against openssl vectors.
 *
 * v9.0.0 history: watchpvr multi-lane + watchbox fan-out (2026-09-12).
 *    Live recon findings:
 *      (a) "only 1 stream": v8 resolved ONE watchbox host and stopped - the
 *          watchbox backends are inconsistent (same title served with 360P-
 *          1080P tran-audio files by some backends, only /bt/+resource low
 *          variants by others), so the row count depended on which backend
 *          answered first. All 6 watchbox hosts now resolve IN PARALLEL and
 *          their quality URLs are merged (highest label wins per URL).
 *      (b) the "429": every watchbox mp4 points at bcdnxw/bcdnt.hakunaymatata
 *          .com, an nginx box that rate-limits aggressively (429s whole IP
 *          ranges; the user's carrier IP got throttled at playback). The
 *          site's own "Multi-Lang Server" (p==7) is a SECOND delivery stack:
 *          play.watch21.shop/play/watchpvr.php renders a `const qualities`
 *          JSON array of HLS/DASH/MP4 sources carried through
 *          cinemaos-relay.qjkl1qn.workers.dev - a fully PROXIED path
 *          (verified end-to-end: master 200 -> variant 200 -> segment 200
 *          video/mp2t) that never touches bcdnxw -> no 429 possible.
 *          v9 resolves BOTH lanes and puts the relay-proxied HLS/DASH rows
 *          first, mp4 rows last.
 *      (c) watchpvr carries per-source labels ("Alpha - English - 1080p",
 *          "Hindi 2 (Multi-Audio)", ...): the English-only rule now filters
 *          THE SOURCE LABEL too - only English or unlabeled (default-audio)
 *          sources are emitted, dubbed/subbed variants are never streamed.
 *      (d) the site appends tm_id=<tmdb id> to both player pages; v9 does
 *          the same now (v8 omitted it).
 *  - Watchbox flow (v8, kept, now parallel + tm_id):
 *      search2 (api2.imdb4.shop) -> detail (api2.imdb3.shop) ->
 *      HMAC-SHA256("{nmId}:{ts}","net###@@sss") -> watchbox.php on 6 hosts ->
 *      ArtPlayer quality selector -> mp4 rows + SRT subs.
 *  - All requests are plain GETs with text bodies - 100% NuvioMobile-safe
 *    (no binary transport, no relay, no settings needed).
 *  - HMAC-SHA256 is implemented in pure JS (no CryptoJS in the plugin
 *    runtime); unit-tested against openssl vectors.
 *
 * v8.0.0: the netmirror.center rebuild (2026-09-12).
 *  - User report: "netmirror and cinejoy still no stream showing" (4.18.0).
 *    Live recon: net27.cc is still up as a SITE but its app was REPLACED -
 *    /api/embed-tmdb is gone from the bundle and the endpoint answers 502.
 *    netmirror.center (canonical netmirror.global) hosts a NEW React app on a
 *    completely different API stack. Every net27-era lane in v7 was dead code.
 *  - New flow (reverse-engineered from the netmirror.center bundle, verified
 *    live end-to-end for movies, series episodes and the Animation section):
 *      1. search  GET https://api2.imdb4.shop/api/search2/{title}?page=0
 *                 -> results[{id, title, media_type, release_date}]
 *                 (netmirror ids are NOT tmdb ids - title+year match maps us)
 *      2. detail  GET https://api2.imdb3.shop/api/{movie|tv}/{nmId}
 *                 -> results[0]{id, subjectid, dp, title, release_date, season}
 *      3. sign    sig = HMAC-SHA256("{nmId}:{ts}", "net###@@sss"), ts = unix sec
 *      4. play    GET {wbHost}/play/watchbox.php?id={subjectid}&se&ep&dp={dp}
 *                 &na={b64(utf8(title))}&year&ts&sig&nid={nmId}&exten=&tv=&token=
 *                 (Referer: https://netmirror.center/) -> ArtPlayer page with a
 *                 quality selector (360P..1080P mp4) + SRT subtitle tracks.
 *      5. parse   quality selector entries -> stream rows; SRT entries ->
 *                 subtitles[]; watchbox mirrors tried in order on failure.
 *  - English-only rule intact: search candidates ranked [English] > bare >
 *    nothing; dubbed variants ([Hindi], [Tamil], ...) are never streamed.
 *  - All requests are plain GETs with text bodies - 100% NuvioMobile-safe
 *    (no binary transport, no relay, no settings needed).
 *  - HMAC-SHA256 is implemented in pure JS (no CryptoJS in the plugin
 *    runtime); unit-tested against openssl vectors.
 *
 * v7.0.0: catalog-id tolerance + net77/net52 mirror restore (both moot now -
 * the whole net27 API family died with the site rebuild, but the tolerant
 * id parser stays: decorated asian-catalog ids still reach this provider).
 *
 * v6.0.0: mirror prune + Tagalog dub lane via /api/variants-tmdb (dead API).
 * v5.x: net27 embed-tmdb lane with caption proxy handling (dead API).
 */

// ============================================================ id parsing v7

var TMDB_API_KEY = "439c478a771f35c05022f9feabcca01c";

var COMMON_HEADERS = {
  "Accept": "application/json, text/plain, */*",
  "Accept-Language": "en-US,en;q=0.9",
  "User-Agent": "Mozilla/5.0 (Linux; Android 13; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0 Mobile Safari/537.36"
};

function settings() {
  return typeof globalThis !== "undefined" && globalThis.SCRAPER_SETTINGS
    ? globalThis.SCRAPER_SETTINGS
    : (typeof global !== "undefined" && global.SCRAPER_SETTINGS ? global.SCRAPER_SETTINGS : {});
}

function merge(a, b) {
  var out = {}, k;
  for (k in (a || {})) out[k] = a[k];
  for (k in (b || {})) out[k] = b[k];
  return out;
}

function hasTimers() {
  return typeof setTimeout === "function";
}

function fetchText(url, headers, timeoutMs) {
  var opts = {
    method: "GET",
    redirect: "follow",
    headers: merge(COMMON_HEADERS, headers || {})
  };
  function fail(res) {
    return res.text().then(function () { throw new Error("HTTP " + res.status); });
  }
  if (!hasTimers()) return fetch(url, opts).then(function (res) {
    if (!res.ok) return fail(res);
    return res.text();
  });
  return new Promise(function (resolve, reject) {
    var timer = setTimeout(function () { reject(new Error("fetch timeout")); }, timeoutMs || 8000);
    fetch(url, opts).then(function (res) {
      clearTimeout(timer);
      if (!res.ok) fail(res).then(function (e) { reject(e); }, function (e) { reject(e); });
      else res.text().then(function (t) { resolve(t); }, function (e) { reject(e); });
    }).catch(function (e) { clearTimeout(timer); reject(e); });
  });
}

function fetchJson(url, headers, timeoutMs) {
  return fetchText(url, headers, timeoutMs).then(function (t) {
    try { return JSON.parse(t); } catch (e) { return null; }
  });
}

// ------------------------------------------------------------------- state

var CACHE_TTL = 8 * 60 * 1000;   // signed mp4 urls live ~1h; keep a safety margin
var _G = typeof globalThis !== "undefined" ? globalThis : typeof global !== "undefined" ? global : this;
var _nmState = _G.__NETMIRROR_STATE__ || (_G.__NETMIRROR_STATE__ = {
  cache: {},          // key -> { ts, streams }
  inflight: {},       // key -> Promise
  nmIdCache: {}       // tmdbKey -> { ts, cands }  (title->netmirror id mapping)
});

function cacheKey(tmdbId, mediaType, season, episode) {
  return (mediaType === "tv" ? "tv" : "movie") + ":" + tmdbId + ":" + (season || 1) + ":" + (episode || 1);
}

// ------------------------------------------------------------- TMDB helpers

function tmdbMeta(tmdbId, mediaType) {
  var endpoint = mediaType === "tv" ? "tv" : "movie";
  var url = "https://api.themoviedb.org/3/" + endpoint + "/" + tmdbId + "?api_key=" + TMDB_API_KEY;
  return fetchJson(url, null, 10000).then(function (data) {
    if (!data) return { title: "", year: "" };
    return {
      title: (mediaType === "tv" ? (data.name || data.original_name) : (data.title || data.original_title)) || "",
      originalTitle: data.original_title || data.original_name || "",
      year: data.first_air_date ? String(data.first_air_date).split("-")[0] : (data.release_date ? String(data.release_date).split("-")[0] : "")
    };
  }).catch(function () { return { title: "", year: "" }; });
}

function tmdbFindImdb(imdbId, mediaType) {
  var endpoint = mediaType === "tv" ? "tv" : "movie";
  var url = "https://api.themoviedb.org/3/find/" + encodeURIComponent(imdbId) +
    "?api_key=" + TMDB_API_KEY + "&external_source=imdb_id";
  return fetchJson(url, null, 10000).then(function (data) {
    var bucket = data && (data[endpoint + "_results"] || data.movie_results || data.tv_results);
    if (bucket && bucket.length && bucket[0].id) return String(bucket[0].id);
    return "";
  }).catch(function () { return ""; });
}

function tmdbSearchByTitle(title, year, mediaType) {
  var endpoint = mediaType === "tv" ? "tv" : "movie";
  var url = "https://api.themoviedb.org/3/search/" + endpoint + "?api_key=" + TMDB_API_KEY +
    "&query=" + encodeURIComponent(title) + (year ? "&year=" + encodeURIComponent(year) : "");
  if (mediaType === "tv") url = url.replace("&year=", "&first_air_date_year=");
  return fetchJson(url, null, 10000).then(function (data) {
    var rs = (data && data.results) || [];
    if (!rs.length) return "";
    if (year) {
      for (var i = 0; i < rs.length; i++) {
        var d = String(rs[i].release_date || rs[i].first_air_date || "");
        if (d.indexOf(year) === 0) return String(rs[i].id);
      }
    }
    return String(rs[0].id);
  }).catch(function () { return ""; });
}

/**
 * v7 (kept): tolerant catalog-id parser -> { tmdbId, season, episode } or null.
 * Accepts: bare digits, "109445:1:9" integer tails, tmdb:/movie:/series:/show:
 * prefixes (also "tmdb-"), asian-catalog fallback ids ("asian:pen-<slug>",
 * "pen:<slug>", "asian:pmh-/kh-/ks-/va-/ka-/an-...", bare slugs) resolved by
 * TMDB title search, and raw tt ids resolved by TMDB find. All lanes fail-soft
 * to null (caller returns []).
 */
function parseTmdbId(rawId, mediaType, season, episode) {
  var raw = String(rawId == null ? "" : rawId).trim();
  if (!raw) return Promise.resolve(null);
  try { raw = decodeURIComponent(raw); } catch (e0) {}
  raw = raw.split("#")[0].split("?")[0].replace(/\.json$/i, "").trim();

  var s = (season != null && season !== "" ? parseInt(season, 10) || null : null);
  var e = (episode != null && episode !== "" ? parseInt(episode, 10) || null : null);

  // strip source prefixes (loop handles chained shapes like "tmdb:movie:...")
  var prev = null;
  while (prev !== raw) {
    prev = raw;
    raw = raw.replace(/^(tmdb|movie|series|show|asian|pen|pmh|kh|ks|va|ka|an|kisskh|kissasian|viewasian|animotv|anikoto|pencuri)[:/]/i, "");
  }
  raw = raw.replace(/^tmdb-/i, "");

  // strip ":s:e" / "/s/e" tails (pure-integer last two parts). The tail is
  // ALWAYS removed from the core id (it is id syntax, not title text); the
  // numbers only ADOPT season/episode when the caller passed none.
  var parts = raw.split(/[:/]/);
  if (parts.length > 2) {
    var t1 = parts[parts.length - 2], t2 = parts[parts.length - 1];
    var n1 = parseInt(t1, 10), n2 = parseInt(t2, 10);
    if (n1 > 0 && n2 > 0 && String(n1) === t1 && String(n2) === t2) {
      s = s || n1;
      e = e || n2;
      parts = parts.slice(0, -2);
    }
  }
  var core = parts.join(":").trim();
  if (!core) return Promise.resolve(null);

  // lane 1: digits (fast path)
  if (/^\d+$/.test(core)) {
    return Promise.resolve({ tmdbId: core, season: s, episode: e });
  }

  // lane 2: tt imdb id
  if (/^tt\d+$/i.test(core)) {
    return tmdbFindImdb(core, mediaType).then(function (id) {
      return id ? { tmdbId: id, season: s, episode: e } : null;
    });
  }

  // lane 3: slug -> title + year -> TMDB search
  var srcPrefix = core.match(/^(pen|pmh|kh|ks|va|ka|an)-(?=[a-z0-9])/i);
  if (srcPrefix) core = core.slice(srcPrefix[0].length);
  var title = core.replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim();
  if (!title) return Promise.resolve(null);
  var year = "";
  var ym = title.match(/[\s]((?:19|20)\d{2})$/);
  if (ym) {
    year = ym[1];
    title = title.slice(0, ym.index).trim();
  }
  if (!title) return Promise.resolve(null);
  return tmdbSearchByTitle(title, year, mediaType).then(function (id) {
    return id ? { tmdbId: id, season: s, episode: e } : null;
  });
}

// ================================================== pure-JS SHA-256 / HMAC
// The plugin runtime has no CryptoJS; key and message are both pure ASCII
// ("net###@@sss", "<digits>:<digits>"), so byte arrays are charCodeAt-safe.

var K256 = [
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
];

function rotr(x, n) { return (x >>> n) | (x << (32 - n)); }

function sha256Bytes(msg /* number[] */) {
  var H = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];
  var len = msg.length;
  var bitLenHi = Math.floor(len / 536870912);            // len*8 / 2^32 high
  var bitLenLo = (len << 3) >>> 0;                       // low 32 bits (len << 3 overflows only past 2^29 bytes - fine here)
  var padded = msg.slice();
  padded.push(0x80);
  while (padded.length % 64 !== 56) padded.push(0);
  padded.push((bitLenHi >>> 24) & 255, (bitLenHi >>> 16) & 255, (bitLenHi >>> 8) & 255, bitLenHi & 255);
  padded.push((bitLenLo >>> 24) & 255, (bitLenLo >>> 16) & 255, (bitLenLo >>> 8) & 255, bitLenLo & 255);

  var w = new Array(64);
  for (var b = 0; b < padded.length; b += 64) {
    var i, t;
    for (i = 0; i < 16; i++) {
      var o = b + i * 4;
      w[i] = ((padded[o] << 24) | (padded[o + 1] << 16) | (padded[o + 2] << 8) | padded[o + 3]) >>> 0;
    }
    for (i = 16; i < 64; i++) {
      var s0 = rotr(w[i - 15], 7) ^ rotr(w[i - 15], 18) ^ (w[i - 15] >>> 3);
      var s1 = rotr(w[i - 2], 17) ^ rotr(w[i - 2], 19) ^ (w[i - 2] >>> 10);
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) >>> 0;
    }
    var a = H[0], bb = H[1], c = H[2], d = H[3], e = H[4], f = H[5], g = H[6], h = H[7];
    for (i = 0; i < 64; i++) {
      var S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
      var ch = (e & f) ^ (~e & g);
      t = (h + S1 + ch + K256[i] + w[i]) >>> 0;
      var S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
      var maj = (a & bb) ^ (a & c) ^ (bb & c);
      h = g; g = f; f = e;
      e = (d + t) >>> 0;
      d = c; c = bb; bb = a;
      a = (t + S0 + maj) >>> 0;
    }
    H[0] = (H[0] + a) >>> 0; H[1] = (H[1] + bb) >>> 0; H[2] = (H[2] + c) >>> 0; H[3] = (H[3] + d) >>> 0;
    H[4] = (H[4] + e) >>> 0; H[5] = (H[5] + f) >>> 0; H[6] = (H[6] + g) >>> 0; H[7] = (H[7] + h) >>> 0;
  }
  var out = new Array(32);
  for (var j = 0; j < 8; j++) {
    out[j * 4] = (H[j] >>> 24) & 255;
    out[j * 4 + 1] = (H[j] >>> 16) & 255;
    out[j * 4 + 2] = (H[j] >>> 8) & 255;
    out[j * 4 + 3] = H[j] & 255;
  }
  return out;
}

/** HMAC-SHA256 over ASCII strings -> lowercase hex. */
function hmacSha256Hex(keyStr, msgStr) {
  var key = [], msg = [], i;
  for (i = 0; i < keyStr.length; i++) key.push(keyStr.charCodeAt(i) & 255);
  for (i = 0; i < msgStr.length; i++) msg.push(msgStr.charCodeAt(i) & 255);
  if (key.length > 64) key = sha256Bytes(key);
  var ipad = new Array(64), opad = new Array(64);
  for (i = 0; i < 64; i++) {
    var kb = i < key.length ? key[i] : 0;
    ipad[i] = kb ^ 0x36;
    opad[i] = kb ^ 0x5c;
  }
  var inner = sha256Bytes(ipad.concat(msg));
  var outer = sha256Bytes(opad.concat(inner));
  var hex = "";
  for (i = 0; i < 32; i++) hex += (outer[i] < 16 ? "0" : "") + outer[i].toString(16);
  return hex;
}

// pure-JS base64 (Hermes-worst-case safe; no btoa dependency)
var B64_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
function b64Utf8(text) {
  // UTF-8 encode first
  var bytes = [], s = String(text == null ? "" : text);
  for (var i = 0; i < s.length; i++) {
    var c = s.charCodeAt(i);
    if (c < 128) bytes.push(c);
    else if (c < 2048) { bytes.push(192 | (c >> 6), 128 | (c & 63)); }
    else { bytes.push(224 | (c >> 12), 128 | ((c >> 6) & 63), 128 | (c & 63)); }
  }
  var out = "";
  for (var j = 0; j < bytes.length; j += 3) {
    var b1 = bytes[j], b2 = j + 1 < bytes.length ? bytes[j + 1] : -1, b3 = j + 2 < bytes.length ? bytes[j + 2] : -1;
    out += B64_CHARS.charAt(b1 >> 2);
    out += B64_CHARS.charAt(((b1 & 3) << 4) | (b2 >= 0 ? b2 >> 4 : 0));
    out += b2 >= 0 ? B64_CHARS.charAt(((b2 & 15) << 2) | (b3 >= 0 ? b3 >> 6 : 0)) : "=";
    out += b3 >= 0 ? B64_CHARS.charAt(b3 & 63) : "=";
  }
  return out;
}

function formEncode(params) {
  var parts = [];
  for (var k in params) {
    if (!Object.prototype.hasOwnProperty.call(params, k)) continue;
    parts.push(encodeURIComponent(k) + "=" + encodeURIComponent(params[k]));
  }
  return parts.join("&");
}

// =============================================== netmirror.center core v8

var NM_PAGE_BASE = "https://netmirror.center";        // referer origin
var NM_DETAIL_API = "https://api2.imdb3.shop/api";    // detail: /{movie|tv}/{nmId}
var NM_SEARCH_API = "https://api2.imdb4.shop/api/search2";
var NM_SIGN_KEY = "net###@@sss";
// v9: the site's "Multi-Lang Server" (p==7) - a second delivery stack whose
// HLS/DASH sources are fully proxied through cinemaos-relay workers (no
// bcdnxw contact -> immune to the video CDN's 429 rate limiting). v10: the
// ONLY netmirror.center lane kept - and only its Alpha sources (user report:
// every other source row fails to play on the device).
var NM_PVR_URL = "https://play.watch21.shop/play/watchpvr.php";
// watchpvr source labels: v10 emits ONLY "Alpha ..." rows (user instruction:
// "remove not working stream just leave alpha"); PVR_BLOCK_RE stays as a
// second safety net for dubbed/unlabeled Alpha variants.
var PVR_BLOCK_RE = new RegExp(
  "\\b(hindi|arabic|russian|kurdish|french|spanish|portuguese|indonesian|bahasa|" +
  "tamil|telugu|malayalam|kannada|korean|japanese|chinese|mandarin|cantonese|" +
  "german|deutsch|turkish|thai|vietnamese|urdu|bangla|bengali|punjabi|malay|" +
  "multi[\\s\\-]*audio)\\b", "i");

// search-result title labels: [English] preferred; dubbed variants skipped
// (standing rule: netmirror is English-only)
var NM_EN_RE = /\b(english|eng)\b/i;
var NM_DUB_RE = /\b(hindi|tamil|telugu|malayalam|punjabi|bengali|bangla|indonesian|bahasa|malay|chinese|mandarin|cantonese|korean|japanese|spanish|espanol|arabic|french|german|russian|portuguese|thai|vietnamese|urdu|turkish|filipino|tagalog|dubbed)\b/i;

function nmTitleNorm(t) {
  var s = String(t || "").toLowerCase();
  s = s.replace(/\[[^\]]*\]/g, " ");                 // [English] / [Hindi] labels
  s = s.replace(/\([^)]*\)/g, " ");
  s = s.replace(/\bs\d+(?:\s*[-–]\s*s?\d+)?\b/g, " "); // "S1-S5" / "S1" suffixes
  s = s.replace(/\bseason\s*\d+\b/g, " ");
  s = s.replace(/[^a-z0-9]+/g, " ").trim();
  return s;
}

function nmYearOf(text) {
  var m = String(text || "").match(/(19|20)\d{2}/);
  return m ? m[0] : "";
}

/** search2 path built with the site's own query conventions. */
function nmSearchPath(title) {
  var q = encodeURIComponent(String(title).trim()).replace(/%20/g, "+").replace(/%2F/g, "--slash--");
  return NM_SEARCH_API + "/" + q + "?page=0";
}

/**
 * Map a TMDB title to up to 3 netmirror ids, best first.
 * Ranking: [English] label > bare title; year exact > +-1 > other.
 * Dubbed variants are dropped entirely (English-only rule).
 */
function nmCandidates(meta, mediaType) {
  var type = mediaType === "tv" ? "tv" : "movie";
  var titles = [];
  var t1 = String(meta.title || "").trim();
  if (t1) titles.push(t1);
  var t2 = String(meta.originalTitle || "").trim();
  if (t2 && nmTitleNorm(t2) !== nmTitleNorm(t1)) titles.push(t2);
  if (!titles.length) return Promise.resolve([]);

  var ckey = type + ":" + nmTitleNorm(t1) + ":" + (meta.year || "");
  var hit = _nmState.nmIdCache[ckey];
  if (hit && Date.now() - hit.ts < 30 * 60 * 1000) return Promise.resolve(hit.cands);

  function searchOne(title) {
    return fetchJson(nmSearchPath(title), { Referer: NM_PAGE_BASE + "/" }, 12000).then(function (j) {
      var rs = (j && j.results) || [];
      var scored = [];
      rs.forEach(function (r) {
        if (!r || r.id == null) return;
        var mt = String(r.media_type || "").toLowerCase();
        if (mt !== type) return;                       // strict type match
        var label = String(r.title || "").trim();
        var bracket = (label.match(/\[([^\]]*)\]/) || [])[1] || "";
        var rank;
        if (NM_EN_RE.test(bracket)) rank = 0;
        else if (NM_DUB_RE.test(bracket)) return;      // dubbed audio - skip
        else rank = 1;                                 // bare / unknown label
        var yr = nmYearOf(r.release_date);
        var my = parseInt(meta.year || "0", 10) || 0;
        var ny = parseInt(yr || "0", 10) || 0;
        var yrank = (!my || !ny) ? 1 : (ny === my ? 0 : (Math.abs(ny - my) <= 1 ? 1 : 2));
        scored.push({ id: String(r.id), rank: rank * 10 + yrank });
      });
      scored.sort(function (a, b) { return a.rank - b.rank; });
      var cands = [];
      scored.forEach(function (x) {
        if (cands.indexOf(x.id) === -1 && cands.length < 3) cands.push(x.id);
      });
      return cands;
    }).catch(function () { return []; });
  }

  return searchOne(titles[0]).then(function (cands) {
    if (cands.length || titles.length < 2) return cands;
    return searchOne(titles[1]);
  }).then(function (cands) {
    if (cands.length) _nmState.nmIdCache[ckey] = { ts: Date.now(), cands: cands };
    return cands;
  });
}

function nmDetail(nmId, type) {
  var url = NM_DETAIL_API + "/" + type + "/" + encodeURIComponent(nmId);
  return fetchJson(url, { Referer: NM_PAGE_BASE + "/", "Content-Type": "application/json" }, 12000)
    .then(function (j) {
      var r = j && j.results && j.results[0];
      if (!r || !r.subjectid || !r.dp) return null;
      return {
        id: String(r.id || nmId),
        subjectid: String(r.subjectid),
        dp: String(r.dp),
        title: String(r.title || "").trim(),
        release: String(r.release_date || "")
      };
    }).catch(function () { return null; });
}

function nmSign(nmId) {
  var ts = Math.floor(Date.now() / 1000);
  return { ts: ts, sig: hmacSha256Hex(NM_SIGN_KEY, nmId + ":" + ts) };
}

function qRank(txt) {
  var q = qualityLabel(txt);
  if (q === "4K") return 5;
  if (q === "1440p") return 4;
  if (q === "1080p") return 3;
  if (q === "720p") return 2;
  if (q === "Auto") return 1;
  return 0;
}

function qualityLabel(txt) {
  var m = String(txt || "").toLowerCase().match(/(\d{3,4})\s*p/);
  if (!m) return "Auto";
  var n = parseInt(m[1], 10);
  if (n >= 2100) return "4K";
  if (n >= 1300) return "1440p";
  if (n >= 1000) return "1080p";
  if (n >= 640) return "720p";
  return n + "p";
}

// =============================================== VidSpark lane (v10)
// moviesapi.to "VidSpark" - one of the public providers the net77.cc /
// netmirror-app.pages.dev family embeds. TMDB-id direct (NO title mapping),
// static x-player-key from the site's own player bundle, text-only GETs,
// HLS delivery on rotating PROXIED CDNs (cdn-proxy.sparkvid.workers.dev /
// *.netrocdn.site) + VTT subtitle tracks. Verified end-to-end: master 200 ->
// variant 200 -> segment 200 video/MP2T.
var VS_API = "https://moviesapi.to";
var VS_KEY = "3a67e8866ae1d2bb9e81fe7f73315a56eb3bdf5e3e755c7554c8be6910aa6b13";

function vsHeaders() {
  return {
    "x-player-key": VS_KEY,
    "Accept": "application/json",
    "Referer": VS_API + "/",
    "Origin": VS_API
  };
}

function vsQuality(h) {
  if (h >= 2100) return "4K";
  if (h >= 1300) return "1440p";
  if (h >= 1000) return "1080p";
  if (h >= 640) return "720p";
  return h + "p";
}

/** relative playlist URI -> absolute (no URL dependency - QuickJS-safe). */
function vsAbs(base, uri) {
  var u = String(uri || "").trim();
  if (!u) return "";
  if (/^https?:\/\//i.test(u)) return u;
  if (u.charAt(0) === "/") {
    var m = String(base).match(/^(https?:\/\/[^\/]+)/i);
    return m ? m[1] + u : u;
  }
  return String(base).replace(/[^\/]*$/, "") + u;
}

/**
 * Resolve the VidSpark master playlist into per-variant rows.
 * Returns { rows, master } - rows carry explicit quality labels parsed from
 * RESOLUTION so the post-filter never needs to probe them; when the master
 * cannot be fetched, one "Auto" row is emitted and the post-filter's m3u8
 * probe labels it instead.
 */
function vsRowsFromMaster(masterUrl, referer) {
  return fetchText(masterUrl, { Referer: referer }, 10000).then(function (txt) {
    if (!txt || txt.indexOf("#EXTM3U") === -1) return { rows: [{ url: masterUrl, quality: "Auto" }], master: masterUrl };
    var rows = [], seen = {};
    var re = /#EXT-X-STREAM-INF:([^\n]*)\n([^\n#][^\n]*)/g, m;
    while ((m = re.exec(txt)) !== null) {
      var attrs = m[1] || "", uri = vsAbs(masterUrl, m[2]);
      if (!uri || seen[uri]) continue;
      seen[uri] = 1;
      var res = attrs.match(/RESOLUTION=(\d+)x(\d+)/i);
      if (res) {
        var h = parseInt(res[2], 10) || 0;
        if (h < 640) continue;                         // post-filter drops <720p anyway
        rows.push({ url: uri, quality: vsQuality(h) });
      } else {
        var bw = attrs.match(/BANDWIDTH=(\d+)/i);
        if (bw && parseInt(bw[1], 10) >= 2000000) rows.push({ url: uri, quality: "720p" });
      }
    }
    if (!rows.length) rows.push({ url: masterUrl, quality: "Auto" });
    rows.sort(function (a, b) { return qRank(b.quality) - qRank(a.quality); });
    return { rows: rows, master: masterUrl };
  }).catch(function () {
    return { rows: [{ url: masterUrl, quality: "Auto" }], master: masterUrl };
  });
}

/**
 * VidSpark lane: vidora API -> sources[0] (HLS master + VTT tracks) -> rows.
 * Returns { rows, subs } - subs are raw { label, url } VTT entries fed
 * through the same subsFor() filter as every other lane. Short TTL memo
 * (the signed URLs live 12h upstream; refresh well before that).
 */
function vsResolve(type, tmdbId, se, ep) {
  var path = type === "tv"
    ? "/api/vidora/v1/tv/" + encodeURIComponent(tmdbId) + "/" + parseInt(se, 10) + "/" + parseInt(ep, 10)
    : "/api/vidora/v1/movie/" + encodeURIComponent(tmdbId);
  var ckey = "vs:" + path;
  var hit = _nmState.cache[ckey];
  if (hit && Date.now() - hit.ts < 10 * 60 * 1000) return Promise.resolve(hit.data);
  var referer = VS_API + "/";
  return fetchJson(VS_API + path, vsHeaders(), 12000).then(function (j) {
    if (!j || j.result !== true || !j.sources || !j.sources.length) throw new Error("no vidora sources");
    var src = j.sources[0] || {};
    if (!src.url) throw new Error("empty vidora source");
    var subs = [];
    (src.tracks || []).forEach(function (t) {
      if (t && t.file) subs.push({ label: String(t.label || "").trim(), url: t.file });
    });
    return vsRowsFromMaster(src.url, referer).then(function (parsed) {
      var rows = [];
      parsed.rows.forEach(function (r) {
        var quality = r.quality === "Auto" ? "Auto" : r.quality;
        rows.push({
          name: "NetMirror | VidSpark " + quality,
          title: (j.title || "VidSpark") + " | " + quality + " | VidSpark HLS",
          url: r.url,
          quality: quality,
          headers: { Referer: referer }
        });
      });
      var out = { rows: rows, subs: subs };
      _nmState.cache[ckey] = { ts: Date.now(), data: out };
      return out;
    });
  }).catch(function (e) {
    console.log("[NetMirror] vidspark lane: " + (e && e.message ? e.message : e));
    return { rows: [], subs: [] };
  });
}

// ================================================== net27.cc embed lane (v14)
// FULLY DECODED from the All-in-One-Nuvio provider (string tables resolved,
// decoder machinery stripped) and LIVE-VERIFIED on 2026-09-13:
//   * GET https://net27.cc/api/embed-tmdb/{tmdbId} (movie) or
//         https://net27.cc/api/embed-tmdb/{tmdbId}?type=tv&s={se}&e={ep}
//     with {Accept: application/json..., Referer: https://net27.cc/, UA Chrome/147}
//     answers {ok:true, streams:[{url,resolution}], mp4, captions:[{url,lang,name}]}
//   * The signed mp4 CDNs (bcdnxw.hakunaymatata.com family) serve
//     HTTP 206 @ 8MB/s with Referer https://videodownloader.site/ but answer
//     429 with the net27 referer or no referer - the videodownloader referer
//     is REQUIRED on the stream rows (this is the exact AIO device behaviour).
//   * Captions come RELATIVE (/api/proxy/video?url=...) and must be prefixed
//     with https://net27.cc - the proxy 302s to the signed CloudFront SRT.
//   * The endpoint burst-limits (2 rapid calls then 502 "error code: 502"):
//     ONE call per getStreams run, 502 -> empty lane (other lanes cover), 8min
//     response cache via the module cache. No probing, no verification.
var N27_API = "https://net27.cc/api/embed-tmdb/";
var N27_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36";
var N27_STREAM_HEADERS = { Referer: "https://videodownloader.site/", "User-Agent": N27_UA };

function nmN27Quality(res) {
  var n = parseInt(res, 10);
  if (!n || n <= 0) return "Auto";
  return n + "p";
}

var qRankN27 = { "2160p": 0, "1440p": 1, "1080p": 2, "720p": 3, "480p": 4, "360p": 5, "Auto": 6 };

function nmN27Rows(d, mediaTitle) {
  var rows = [];
  var seen = {};
  var subs = [];
  (d.captions || []).forEach(function (c) {
    if (!c || !c.url) return;
    // standing rule: netmirror is English-only (cinemacity covers Tagalog)
    var lang = String(c.lang || "en").toLowerCase();
    if (lang !== "en" && lang !== "english") return;
    var url = String(c.url);
    if (url.charAt(0) === "/") url = "https://net27.cc" + url;
    subs.push({ url: url, language: "en", name: String(c.name || "English") });
  });
  var push = function (url, quality) {
    if (!url) return;
    var prev = seen[url];
    if (prev) {
      // same file advertised at several resolutions (480p/720p share one URL):
      // keep the HIGHEST label so the post-filter's >=720p floor keeps the row
      var pr = qRankN27[prev], nr = qRankN27[quality];
      if (nr != null && (pr == null || nr < pr)) seen[url] = quality;
      return;
    }
    seen[url] = quality;
  };
  (d.streams || []).forEach(function (s) {
    if (s && s.url) push(String(s.url), nmN27Quality(s.resolution));
  });
  if (!Object.keys(seen).length && d.mp4) push(String(d.mp4), "Auto");
  // rebuild rows keeping the best quality per url, highest first
  var qRank = qRankN27;
  var best = {};
  Object.keys(seen).forEach(function (u) {
    var q = seen[u];
    var cur = best[u];
    if (!cur || (qRank[q] != null && qRank[cur] != null && qRank[q] < qRank[cur])) best[u] = q;
  });
  var list = Object.keys(best).map(function (u) {
    var q = best[u];
    return {
      name: "NetMirror (Netflix) - " + q,
      title: (mediaTitle ? mediaTitle : "NetMirror") + " | " + q + " | NetMirror",
      url: u,
      quality: q,
      headers: N27_STREAM_HEADERS,
      behaviorHints: { notWebReady: false },
      subtitles: subs.length ? subs : undefined
    };
  });
  list.sort(function (a, b) {
    var ra = qRank[a.quality] != null ? qRank[a.quality] : 99;
    var rb = qRank[b.quality] != null ? qRank[b.quality] : 99;
    return ra - rb;
  });
  return { rows: list, subs: subs };
}

function nmNet27(type, tmdbId, se, ep, mediaTitle) {
  var ckey = "n27:" + tmdbId + ":" + type + ":" + se + ":" + ep;
  var hit = _nmState.cache[ckey];
  if (hit && Date.now() - hit.ts < CACHE_TTL) return Promise.resolve(hit.data);
  var url = N27_API + encodeURIComponent(tmdbId);
  if (type === "tv") url += "?type=tv&s=" + parseInt(se, 10) + "&e=" + parseInt(ep, 10);
  return fetchJson(url, {
    "Accept": "application/json, text/plain, */*",
    "Referer": "https://net27.cc/",
    "User-Agent": N27_UA
  }, 8000).then(function (d) {
    if (!d || d.ok !== true) throw new Error(d && d.error ? "net27: " + d.error : "net27: not ok");
    var out = nmN27Rows(d, mediaTitle);
    if (!out.rows.length) throw new Error("net27: no sources (mode " + (d.mode || "?") + ")");
    console.log("[NetMirror] net27 lane: " + out.rows.length + " row(s) + " + out.subs.length + " en caption(s)");
    _nmState.cache[ckey] = { ts: Date.now(), data: out };
    return out;
  }).catch(function (e) {
    console.log("[NetMirror] net27 lane: " + (e && e.message ? e.message : e));
    return { rows: [], subs: [] };
  });
}

// ================================================== watchpvr (Multi-Lang) lane

/** Parse the `const qualities = [...]` JSON array out of a watchpvr page. */
function parsePvr(html) {
  var m = String(html || "").match(/(const|let|var)\s+qualities\s*=\s*(\[[\s\S]*?\])\s*;/);
  if (!m) return [];
  try {
    var arr = JSON.parse(m[2].replace(/,\s*([}\]])/g, "$1"));
    return Array.isArray(arr) ? arr : [];
  } catch (e0) { return []; }
}

/** Parse the watchpvr page's subtitle array (Alpha-row caption fallback). */
function parsePvrSubs(html) {
  var m = String(html || "").match(/(const|let|var)\s+subtitles\s*=\s*(\[[\s\S]*?\])\s*;/);
  if (!m) return [];
  try {
    var arr = JSON.parse(m[2].replace(/,\s*([}\]])/g, "$1"));
    if (!Array.isArray(arr)) return [];
    var out = [];
    arr.forEach(function (s) {
      if (s && s.url) out.push({ label: s.name || s.html || s.lang || "", url: s.url });
    });
    return out;
  } catch (e0) { return []; }
}

/** watchpvr source entries carry explicit quality fields ("720p"/"FHD"). */
function pvrEntryQuality(entry) {
  var q = qualityLabel(entry && entry.quality);
  if (q === "Auto") {
    var f = String((entry && entry.quality) || "").toLowerCase();
    if (f === "fhd") return "1080p";
    if (f === "hd") return "720p";
    q = qualityLabel(entry && entry.html);
    if (q === "Auto") {
      var h = String((entry && entry.html) || "").toLowerCase();
      if (/\bfhd\b/.test(h)) q = "1080p";
      else if (/\bhd\b/.test(h)) q = "720p";
    }
  }
  return q;
}

function pvrKind(entry) {
  var t = String((entry && entry.type) || "").toLowerCase();
  var u = String((entry && entry.url) || "");
  if (/\.mpd(\?|$)/i.test(u)) return "DASH";
  if (t === "dash" || /\.mpd/i.test(u)) return "DASH";
  if (t === "m3u8" || /\.m3u8/i.test(u)) return "HLS";
  if (t === "mp4" || /\.mp4/i.test(u)) return "MP4";
  return "HLS";
}

/** watchpvr player URL (same signing scheme as watchbox, + tm_id). */
function nmPvrUrl(d, se, ep, tmdbId) {
  var s = nmSign(d.id);
  var year = nmYearOf(d.release.split(",")[1] ? d.release : "");
  var commaYear = "";
  if (d.release.indexOf(",") !== -1) commaYear = d.release.split(",")[1] || "";
  year = commaYear || year;
  return NM_PVR_URL + "?" + formEncode({
    id: d.subjectid,
    se: se || 0,
    ep: ep || 0,
    dp: d.dp,
    na: b64Utf8(d.title),
    year: year,
    tm_id: tmdbId == null ? "" : String(tmdbId),
    ts: s.ts,
    sig: s.sig,
    nid: d.id,
    exten: "",
    tv: "",
    token: ""
  });
}

/**
 * v9: the "Multi-Lang Server" lane. watchpvr.php renders a `const qualities`
 * JSON array of sources carried through cinemaos-relay workers (fully proxied
 * - the video CDN's 429 rate limiting never applies). The page is served by
 * load-balanced backends and SOMETIMES lacks the array, so retry up to 3x
 * with a fresh signature. Rows are ordered HLS -> DASH -> MP4 and labeled
 * with the site's own source name ("Eos - 1080p", ...).
 * Returns { rows, subs } - subs = raw SRT entries (also fed to watchbox rows).
 */
function nmPvrResolve(d, se, ep, tmdbId, attempts) {
  var n = attempts || 3;
  function attempt(i) {
    return fetchText(nmPvrUrl(d, se, ep, tmdbId), { Referer: NM_PAGE_BASE + "/" }, 12000)
      .then(function (html) {
        var entries = parsePvr(html);
        if (!entries.length) throw new Error("no qualities array");
        return { html: html, entries: entries };
      }).catch(function () {
        if (i + 1 < n) {
          return (hasTimers() ? new Promise(function (res) { setTimeout(res, 300); }) : Promise.resolve())
            .then(function () { return attempt(i + 1); });
        }
        return { html: "", entries: [] };
      });
  }
  return attempt(0).then(function (r) {
    var rows = [], seen = {};
    var order = { HLS: 0, DASH: 1, MP4: 2 };
    var kept = [];
    (r.entries || []).forEach(function (entry) {
      if (!entry || !entry.url) return;
      var label = String(entry.html || entry.label || "").trim();
      if (!label) return;
      // v10: ONLY "Alpha" sources (user: "remove not working stream just
      // leave alpha" - every other Multi-Lang source fails on the device)
      if (!/^alpha\b/i.test(label)) return;
      if (PVR_BLOCK_RE.test(label)) return;          // dubbed/subbed safety net
      var kind = pvrKind(entry);
      var q = pvrEntryQuality(entry);
      if (!q || q === "Auto") return;                // unlabelable -> skip
      if (seen[entry.url]) return;
      seen[entry.url] = 1;
      kept.push({ entry: entry, label: label, kind: kind, q: q });
    });
    kept.sort(function (a, b) {
      var d1 = (order[a.kind] || 9) - (order[b.kind] || 9);
      if (d1 !== 0) return d1;
      return qRank(b.q) - qRank(a.q);
    });
    kept.forEach(function (k) {
      var quality = qualityLabel(k.q);
      if (quality === "Auto") quality = k.q;
      rows.push({
        name: "NetMirror | " + k.label,
        title: k.label + " | " + quality + " | NetMirror " + k.kind + " relay",
        url: k.entry.url,
        quality: quality,
        headers: { Referer: NM_PAGE_BASE + "/" }
      });
    });
    return { rows: rows, subs: parsePvrSubs(r.html) };
  });
}

// subtitle track labels seen in watchbox pages -> Nuvio language fields
// (labels arrive in native scripts - Arabic/Cyrillic/Devanagari/... - so the
// map matches script ranges too; anything unmatched stays "unk" and never
// masquerades as English)
var SUB_LANG_MAP = [
  [/english|eng/i, "en", "English"],
  [/filipino|tagalog|pilipino|\bfil\b/i, "fil", "Tagalog / Filipino"],
  [/espanol|spanish/i, "es", "Spanish"],
  [/fran/i, "fr", "French"],
  [/kiswahili|swahili/i, "sw", "Swahili"],
  [/[\u0400-\u04FF]/, "ru", "Russian"],
  [/[\u0600-\u06FF]/, "ar", "Arabic"],
  [/[\u0900-\u097F]/, "hi", "Hindi"],
  [/[\u0980-\u09FF]/, "bn", "Bengali"],
  [/[\u0A00-\u0A7F]/, "pa", "Punjabi"],
  [/[\u4E00-\u9FFF]/, "zh", "Chinese"],
  [/indon|bahasa/i, "id", "Indonesian"],
  [/malay/i, "ms", "Malay"],
  [/portug|brasileiro/i, "pt", "Portuguese"],
  [/arab/i, "ar", "Arabic"],
  [/bangla|bengali/i, "bn", "Bengali"],
  [/punjabi/i, "pa", "Punjabi"],
  [/urdu/i, "ur", "Urdu"],
  [/chinese|mandarin|cantonese/i, "zh", "Chinese"]
];

function subsFor(subEntries) {
  var mode = settings().captionLang || "en+fil";
  var prio = [];
  subEntries.forEach(function (s) {
    if (!s || !s.url) return;
    // v10: unmatched labels stay "unk" (VidSpark carries 30+ tracks; an
    // unmatched "May"/"Baq" must never masquerade as English)
    var lang = "unk", name = s.label || "Subtitles";
    for (var i = 0; i < SUB_LANG_MAP.length; i++) {
      if (SUB_LANG_MAP[i][0].test(s.label || "")) {
        lang = SUB_LANG_MAP[i][1];
        name = SUB_LANG_MAP[i][2];
        break;
      }
    }
    if (mode === "en" && lang !== "en") return;
    if (mode === "en+fil" && !(lang === "en" || lang === "fil")) return;
    var p = lang === "en" ? 0 : (lang === "fil" ? 1 : 2);
    prio.push({ url: s.url, language: lang, name: name, p: p });
  });
  prio.sort(function (a, b) { return a.p - b.p; });
  return prio.slice(0, 8).map(function (x) {
    return { url: x.url, language: x.language, name: x.name };
  });
}

/**
 * One netmirror candidate (v10): detail -> watchpvr lane (ALPHA SOURCES ONLY)
 * -> stream rows. The watchbox mp4 fan-out is GONE (its bcdn*.hakunaymatata
 * rows were the "not working" streams the user asked to remove); extra
 * coverage now comes from the VidSpark lane in getStreams.
 */
function nmResolveCandidate(nmId, type, se, ep, meta, tmdbId) {
  return nmDetail(nmId, type).then(function (d) {
    if (!d) return [];
    return nmPvrResolve(d, se, ep, tmdbId, 3).then(function (pvr) {
      var subs = subsFor((pvr && pvr.subs) || []);
      var rows = [];
      ((pvr && pvr.rows) || []).forEach(function (r) {
        r.headers = { Referer: NM_PAGE_BASE + "/" };
        if (subs.length) r.subtitles = subs;
        rows.push(r);
      });
      return rows;
    });
  }).catch(function () { return []; });
}

/**
 * v12: NewTV lane - the decoded AIO netmirror's REAL device path (1:1 port).
 * 1. resolveNtvApi(): GET {base}/checknewtv.php across the 24 mobiledetect/
 *    mobidetect domains (X-Requested-With: NetmirrorNewTV v1.0, GatuNewTV user agent)
 *    -> {token_hash: base64} -> decode = live API base (memoized module-wide;
 *    verified 2026-09: mobiledetects.com -> tv.imgcdn.kim; the API itself is
 *    IP-gated - 403 "Page Not Found" from datacenter, works on retail IPs).
 * 2. GET {api}/newtv/search.php?s={title} -> searchResult[0].id
 * 3. GET {api}/newtv/post.php?id= (Lastep/Usertoken headers) -> type,
 *    episodes[{id,ep|epNum,sNum}], main_id, season[], nextPageShow
 * 4. tv: match season/episode (incl. pagination via /newtv/episodes.php?id=
 *    &page=N while nextPageShow==1); movie: main_id (skip when type==="t")
 * 5. GET {api}/newtv/player.php?id={id} -> {status:"ok",video_link,referer}
 *    -> one Auto row, Referer = resp.referer || api base.
 * Fail-soft everywhere; resolution memoized across calls; platforms tried in
 * AIO order (netflix -> primevideo -> hotstar) until one yields a stream.
 */
var NM_NTV_DOMAINS = [
  "aHR0cHM6Ly9tb2JpbGVkZXRlY3RzLmNvbQ==", "aHR0cHM6Ly9tb2JpbGVkZXRlY3QuYXBw", "aHR0cHM6Ly9tb2JpZGV0ZWN0LmFydA==",
  "aHR0cHM6Ly9tb2JpZGV0ZWN0LmNj", "aHR0cHM6Ly9tb2JpZGV0ZWN0LmNsaWNr", "aHR0cHM6Ly9tb2JpZGV0ZWN0Lmluaw==",
  "aHR0cHM6Ly9tb2JpZGV0ZWN0LmxpdmU=", "aHR0cHM6Ly9tb2JpZGV0ZWN0LnBybw==", "aHR0cHM6Ly9tb2JpZGV0ZWN0LnNob3A=",
  "aHR0cHM6Ly9tb2JpZGV0ZWN0LnNpdGU=", "aHR0cHM6Ly9tb2JpZGV0ZWN0LnNwYWNl", "aHR0cHM6Ly9tb2JpZGV0ZWN0LnN0b3Jl",
  "aHR0cHM6Ly9tb2JpZGV0ZWN0LnZpcA==", "aHR0cHM6Ly9tb2JpZGV0ZWN0Lndpa2k=", "aHR0cHM6Ly9tb2JpZGV0ZWN0Lnh5eg==",
  "aHR0cHM6Ly9tb2JpZGV0ZWN0cy5hcnQ=", "aHR0cHM6Ly9tb2JpZGV0ZWN0cy5jYw==", "aHR0cHM6Ly9tb2JpZGV0ZWN0cy5pbmZv",
  "aHR0cHM6Ly9tb2JpZGV0ZWN0cy5pbms=", "aHR0cHM6Ly9tb2JpZGV0ZWN0cy5saXZl", "aHR0cHM6Ly9tb2JpZGV0ZWN0cy5wcm8=",
  "aHR0cHM6Ly9tb2JpZGV0ZWN0cy5zdG9yZQ==", "aHR0cHM6Ly9tb2JpZGV0ZWN0cy50b3A=", "aHR0cHM6Ly9tb2JpZGV0ZWN0cy54eXo="
];
var NM_NTV_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:136.0) Gecko/20100101 Firefox/136.0 /OS.GatuNewTV v1.0";

function nmNtvHeaders(ott, extra) {
  var h = {
    "Cache-Control": "no-cache, no-store, must-revalidate",
    "Pragma": "no-cache",
    "Expires": "0",
    "X-Requested-With": "NetmirrorNewTV v1.0",
    "User-Agent": NM_NTV_UA,
    "Accept": "application/json, text/plain, */*",
    "Ott": ott || "nf"
  };
  return merge(h, extra || {});
}

function nmB64Decode(s) {
  try {
    if (typeof atob === "function") return atob(s);
  } catch (e0) { }
  try {
    if (typeof Buffer !== "undefined" && Buffer.from) return Buffer.from(s, "base64").toString("binary");
  } catch (e1) { }
  var B64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=", out = "", bits = 0, acc = 0;
  for (var i = 0; i < s.length; i++) {
    var c = B64.indexOf(s.charAt(i));
    if (c < 0 || c === 64) continue;
    acc = (acc << 6) | c; bits += 6;
    if (bits >= 8) { bits -= 8; out += String.fromCharCode((acc >> bits) & 0xff); }
  }
  return out;
}

function nmNtvResolve() {
  if (_nmState.ntvApi) return Promise.resolve(_nmState.ntvApi);
  if (_nmState.ntvResolving) return _nmState.ntvResolving;
  var resolved = null;
  var tryOne = function (i) {
    if (resolved || i >= NM_NTV_DOMAINS.length) return Promise.resolve();
    var base = nmB64Decode(NM_NTV_DOMAINS[i]).replace(/\/$/, "");
    return fetchJson(base + "/checknewtv.php", null, 3000).then(function (j) {
      if (j && j.token_hash) {
        var api = nmB64Decode(j.token_hash).replace(/\/$/, "");
        if (api) {
          resolved = api;
          _nmState.ntvApi = api;
          console.log("[NetMirror] NewTV api resolved: " + api);
          return;
        }
      }
      return tryOne(i + 1);
    }).catch(function () { return tryOne(i + 1); });
  };
  _nmState.ntvResolving = tryOne(0).then(function () {
    _nmState.ntvResolving = null;
    return resolved;
  }).catch(function () {
    _nmState.ntvResolving = null;
    return null;
  });
  return _nmState.ntvResolving;
}

function nmNtvEpFromEntry(e) {
  if (!e) return null;
  var ep = null;
  if (e.ep != null && e.ep !== "") ep = parseInt(e.ep, 10);
  else if (e.epNum) ep = parseInt(String(e.epNum).replace("E", ""), 10);
  var s = null;
  if (e.sNum) s = parseInt(String(e.sNum).replace("S", ""), 10);
  return { id: e.id, s: s, ep: ep };
}

function nmNtvRows(title, type, se, ep) {
  return nmNtvResolve().then(function (api) {
    if (!api || !title) return { rows: [] };
    // platform order mirrors AIO: netflix -> primevideo -> hotstar
    var platforms = ["nf", "pv", "hs"];
    var names = { nf: "Netflix", pv: "Prime Video", hs: "Hotstar" };
    var chain = Promise.resolve({ rows: [] });
    platforms.forEach(function (ott) {
      chain = chain.then(function (acc) {
        if (acc && acc.rows && acc.rows.length) return acc;
        return nmNtvPlatform(api, ott, names[ott] || ott, title, type, se, ep).catch(function () { return { rows: [] }; });
      });
    });
    return chain;
  }).catch(function () { return { rows: [] }; });
}

function nmNtvPlatform(api, ott, label, title, type, se, ep) {
  var H = nmNtvHeaders(ott);
  return fetchJson(api + "/newtv/search.php?s=" + encodeURIComponent(title), H, 5000).then(function (sr) {
    var list = sr && sr.searchResult;
    if (!list || !list.length) return { rows: [] };
    var showId = list[0].id;
    return fetchJson(api + "/newtv/post.php?id=" + showId, merge(H, { Lastep: "", Usertoken: "" }), 5000).then(function (post) {
      if (!post) return { rows: [] };
      var pid = showId;
      if (type === "tv") {
        var eps = (post.episodes || []).filter(function (x) { return !!x; }).map(nmNtvEpFromEntry);
        var found = null;
        for (var i = 0; i < eps.length; i++) {
          if (eps[i] && eps[i].s === (parseInt(se, 10) || 1) && eps[i].ep === (parseInt(ep, 10) || 1)) { found = eps[i]; break; }
        }
        if (!found) {
          var seasonId = null;
          if (post.season && post.season.length) {
            for (var k = 0; k < post.season.length; k++) {
              if (post.season[k] && post.season[k].id) { seasonId = post.season[k].id; break; }
            }
          } else if (post.nextPageSeason) seasonId = post.nextPageSeason;
          if (seasonId && post.nextPageShow === 1) {
            return nmNtvEpisodesPage(api, H, seasonId, 2, parseInt(se, 10) || 1, parseInt(ep, 10) || 1);
          }
          return { rows: [] };
        }
        pid = found.id;
      } else {
        if (post.type === "t") return { rows: [] }; // it is a tv show, not a movie
        pid = post.main_id || showId;
      }
      return fetchJson(api + "/newtv/player.php?id=" + pid, merge(H, { Usertoken: "" }), 5000).then(function (pl) {
        if (!pl || pl.status !== "ok" || !pl.video_link) return { rows: [] };
        return {
          rows: [{
            name: "NetMirror | " + label,
            title: label + " | NetMirror NewTV",
            url: pl.video_link,
            quality: "Auto",
            headers: { Referer: pl.referer || api }
          }]
        };
      });
    });
  });
}

function nmNtvEpisodesPage(api, H, seasonId, page, se, ep) {
  return fetchJson(api + "/newtv/episodes.php?id=" + seasonId + "&page=" + page, H, 5000).then(function (p) {
    var eps = (p && p.episodes ? p.episodes : []).filter(function (x) { return !!x; }).map(nmNtvEpFromEntry);
    for (var i = 0; i < eps.length; i++) {
      if (eps[i] && (eps[i].s == null || eps[i].s === se) && eps[i].ep === ep) {
        return fetchJson(api + "/newtv/player.php?id=" + eps[i].id, merge(H, { Usertoken: "" }), 5000).then(function (pl) {
          if (!pl || pl.status !== "ok" || !pl.video_link) return { rows: [] };
          return { rows: [{ name: "NetMirror | NewTV", title: "NetMirror NewTV", url: pl.video_link, quality: "Auto", headers: { Referer: pl.referer || api } }] };
        });
      }
    }
    if (p && p.nextPageShow === 1 && page < 6) return nmNtvEpisodesPage(api, H, seasonId, page + 1, se, ep);
    return { rows: [] };
  });
}

function getStreams(tmdbId, mediaType, season, episode) {
  var rawId = "";
  try { rawId = String(tmdbId == null ? "" : tmdbId); } catch (e0) { rawId = ""; }
  if (!rawId) return Promise.resolve([]);

  var key = cacheKey(rawId, mediaType, season, episode);
  var hit = _nmState.cache[key];
  if (hit && Date.now() - hit.ts < CACHE_TTL) {
    return Promise.resolve(hit.streams);
  }
  if (_nmState.inflight[key]) return _nmState.inflight[key];

  console.log("[NetMirror] v14 start " + mediaType + " " + rawId + " S" + season + "E" + episode);
  var type = (mediaType === "tv" || mediaType === "series") ? "tv" : "movie";

  var run = parseTmdbId(rawId, mediaType, season, episode).then(function (p) {
    // v7 tolerant parser: unresolvable ids (garbage prefixes) -> fail-soft
    if (!p) {
      console.log("[NetMirror] id unresolvable: " + rawId);
      return [];
    }
    var se, ep;
    if (type === "tv") {
      se = (season != null && season !== "") ? parseInt(season, 10) || 1 : (p.season || 1);
      ep = (episode != null && episode !== "") ? parseInt(episode, 10) || 1 : (p.episode || 1);
    } else {
      // v8: the watchpvr endpoint treats a movie like an episode-less show
      // and serves an empty player page for se=1&ep=1 - keep 0/0 there.
      se = 0;
      ep = 0;
    }
    // v10: VidSpark lane (net77 stack) runs FIRST and INDEPENDENT of the
    // netmirror.center title mapping - TMDB id direct, so even a failed
    // search2 mapping still yields rows.
    var vsP = vsResolve(type, p.tmdbId, se, ep);
    // v12: ONE shared TMDB meta fetch feeds both the Alpha lane and the NewTV lane
    var metaP = tmdbMeta(p.tmdbId, type).catch(function () { return null; });
    // v14: net27.cc embed lane (the FULLY DECODED AIO primary) - TMDB id direct,
    // one fetch, real signed mp4s + English captions. Runs INDEPENDENT of meta
    // (the meta title is optional row dressing).
    var n27P = metaP.then(function (meta) {
      return nmNet27(type, p.tmdbId, se, ep, meta && (meta.title || meta.name));
    }).catch(function () { return { rows: [], subs: [] }; });
    var alphaP = metaP.then(function (meta) {
      if (!meta || !meta.title) {
        console.log("[NetMirror] no TMDB meta for " + p.tmdbId + " - VidSpark only");
        return [];
      }
      return nmCandidates(meta, type).then(function (cands) {
        if (!cands.length) {
          console.log("[NetMirror] no netmirror id for " + JSON.stringify(meta) + " - VidSpark only");
          return [];
        }
        // v13: resolve candidates IN PARALLEL (v12 chained them sequentially -
        // 3 candidates x a stalled watchpvr fetch stacked multi-second waits
        // before the first row). First lane with rows wins; ties keep order.
        return Promise.all(cands.slice(0, 3).map(function (nmId) {
          return nmResolveCandidate(nmId, type, se, ep, meta, p.tmdbId)
            .catch(function () { return []; });
        })).then(function (sets) {
          for (var i = 0; i < sets.length; i++) {
            if (sets[i] && sets[i].length) return sets[i];
          }
          return [];
        });
      });
    }).catch(function () { return []; });
    // v13: NewTV lane (decoded AIO device path) - 6s lane cap (bootstrap + API
    // answer in <1s when they answer at all; a longer wait never produced rows)
    var ntP = metaP.then(function (meta) {
      var run = nmNtvRows(meta && meta.title, type, se, ep);
      return hasTimers()
        ? Promise.race([run, new Promise(function (res) { setTimeout(function () { res({ rows: [] }); }, 6000); })])
        : run;
    }).catch(function () { return { rows: [] }; });

    function nmCombine(alphaRows, nt, vs, n27) {
      var rows = [];
      var seenUrl = {};
      function add(r) {
        if (!r || !r.url) return;
        var k = String(r.url).split("#")[0];
        if (seenUrl[k]) return;
        seenUrl[k] = 1;
        rows.push(r);
      }
      // Alpha rows first (the user's proven lane), then the decoded net27
      // embed lane (multi-res mp4s + English captions), then the AIO NewTV
      // lane, then VidSpark fills in after
      (alphaRows || []).forEach(add);
      ((n27 && n27.rows) || []).forEach(add);
      ((nt && nt.rows) || []).forEach(add);
      (vs.rows || []).forEach(function (r) {
        if (vsSubsOf(vs)) r.subtitles = vsSubsOf(vs);
        add(r);
      });
      return rows;
    }
    function vsSubsOf(vs) { return subsFor(vs.subs || []); }

    // v13: the Alpha relay lane gets a 9s cap (down from 16s). The relay chain
    // (search2 -> detail -> watchpvr via cinemaos-relay) answers in ~2-4s on
    // device; when it needs longer, the VidSpark/NewTV rows fill the sheet and
    // the FULL Alpha result is late-cached below so the next play of the same
    // title serves it instantly (v11-style cut-off risk is gone - the pack no
    // longer depends on Alpha alone for coverage).
    var alphaCapP = hasTimers()
      ? Promise.race([alphaP, new Promise(function (res) { setTimeout(function () { res([]); }, 9000); })])
      : alphaP;
    var servedP = Promise.all([alphaCapP, ntP.catch(function () { return { rows: [] }; }), vsP.catch(function () { return { rows: [], subs: [] }; }), n27P.catch(function () { return { rows: [], subs: [] }; })]).then(function (res) {
      var rows = nmCombine(res[0], res[1], res[2], res[3]);
      console.log("[NetMirror] serving " + rows.length + " stream(s) (alpha " + (res[0] || []).length + ", net27 " + ((res[3] && res[3].rows) || []).length + ", newtv " + ((res[1] && res[1].rows) || []).length + ", vidspark " + ((res[2] && res[2].rows) || []).length + ")");
      return rows;
    });
    return servedP.then(function (rows) {
      if (rows.length) _nmState.cache[key] = { ts: Date.now(), streams: rows };
      return rows;
    }).then(function (rows) {
      // late-cache: wait for the full Alpha result; if it added rows that the
      // early serve missed, store the combined set for the next play.
      return Promise.all([alphaP.catch(function () { return []; }), ntP.catch(function () { return { rows: [] }; }), vsP.catch(function () { return { rows: [], subs: [] }; }), n27P.catch(function () { return { rows: [], subs: [] }; })]).then(function (res) {
        var full = nmCombine(res[0], res[1], res[2], res[3]);
        var cur = _nmState.cache[key];
        if (full.length && (!cur || ((cur.streams || []).length < full.length))) {
          console.log("[NetMirror] late alpha result cached (" + full.length + " rows)");
          _nmState.cache[key] = { ts: Date.now(), streams: full };
        }
        return rows;
      });
    });
  }).catch(function (error) {
    console.log("[NetMirror] failed: " + (error && error.message ? error.message : error));
    return [];
  }).then(function (streams) {
    delete _nmState.inflight[key];
    // v11: never clobber a cache entry that already holds MORE rows (the
    // late-cache branch may have stored the full Alpha result already)
    var cur = _nmState.cache[key];
    if (streams && streams.length && (!cur || ((cur.streams || []).length <= streams.length))) {
      _nmState.cache[key] = { ts: Date.now(), streams: streams };
    }
    return streams || [];
  });
  _nmState.inflight[key] = run;
  return run;
}

function onSettings() {
  return Promise.resolve([
    {
      key: "captionLang",
      title: "Subtitle language",
      label: "Subtitle language",
      type: "select",
      default: "en+fil",
      options: [
        { value: "all", label: "All languages" },
        { value: "en+fil", label: "English + Tagalog / Filipino" },
        { value: "en", label: "English only" }
      ],
      description: "English and Tagalog (fil) tracks are always listed first. This filter hides the rest."
    }
  ]);
}

module.exports = {
  getStreams: getStreams,
  onSettings: onSettings
};
/* ===== nvio post-filter v1.0 (auto-injected) ============================
   Rules (per user request 2026-09):
   1. Language gate: only English / Tagalog (Filipino) audio lanes are kept.
      Streams explicitly tagged with another audio language (hindi, tamil,
      spanish, arabic, korean, ...) are dropped unless an allowed language
      is also present (dual/multi audio) or no language is tagged at all.
      Subtitle-only tokens (ESub, HindiSub, ...) are ignored by the gate.
   2. Quality gate: unknown/"Auto" resolutions are probed from the HLS
      master playlist; everything below 720p, CAM/telesync, and still-
      unknown rows are dropped. Survivors are labeled 720p/1080p/1440p/4K.
   3. Dedupe: exact URL, then normalized URL (query stripped, torrent
      info-hash), then identical name+quality rows. A short-TTL global
      registry also removes the same URL reported by two different
      providers (cross-provider duplicates).
   Opt-out: set SCRAPER_SETTINGS.postFilter = false.
======================================================================== */
(function () {
  var PROVIDER = "netmirror";
  var G = typeof globalThis !== "undefined" ? globalThis : typeof global !== "undefined" ? global : this;
  function settings() {
    try { return (G && G.SCRAPER_SETTINGS) || {}; } catch (e) { return {}; }
  }
  function hasTimers() { return typeof setTimeout === "function" && typeof clearTimeout === "function"; }

  /* ---------- quality ---------- */
  function normQ(q) {
    var s = String(q == null ? "" : q).toLowerCase();
    if (!s) return "";
    if (/8k/.test(s)) return "4K";
    if (/2160|4k|uhd/.test(s)) return "4K";
    if (/1440/.test(s)) return "1440p";
    if (/1080|fhd/.test(s)) return "1080p";
    if (/720/.test(s)) return "720p";
    if (/480|360|240|\bsd\b/.test(s)) return "CAM";
    if (/cam|telesync|telecine|\bts\b|\btc\b|screener|dvdscr/.test(s)) return "CAM";
    return "";
  }
  function qFromText(text) {
    var s = String(text || "");
    var m = s.match(/(\d{3,4})\s*p/i);
    if (m) {
      var n = parseInt(m[1], 10);
      if (n >= 2100) return "4K";
      if (n >= 1300) return "1440p";
      if (n >= 1000) return "1080p";
      if (n >= 640) return "720p";
      return "CAM";
    }
    if (/\b8k\b/i.test(s) || /2160|4k|uhd/i.test(s)) return "4K";
    if (/1440p/i.test(s)) return "1440p";
    if (/cam|telesync|telecine|\bts\b|\btc\b|screener|dvdscr/i.test(s)) return "CAM";
    if (/480p|360p|240p|\bsd\b|\bdvdrip\b/i.test(s)) return "CAM";
    if (/\bhd\b/i.test(s)) return "720p";
    return "";
  }
  var qualCache = G.__NV_QUAL_CACHE__ || (G.__NV_QUAL_CACHE__ = {});
  function probeM3u8(url, headers) {
    var now = Date.now();
    var c = qualCache[url];
    if (c && now - c.t < (c.q ? 15 * 60 * 1000 : 3 * 60 * 1000)) {
      return Promise.resolve(c.q);
    }
    var opts = { headers: Object.assign({}, headers || {}) };
    var p = fetch(url, opts).then(function (r) {
      return r.ok ? r.text() : "";
    }).then(function (t) {
      var q = "";
      if (t && t.indexOf("#EXTM3U") !== -1) {
        var best = 0, re = /RESOLUTION=(\d+)x(\d+)/gi, m;
        while ((m = re.exec(t)) !== null) {
          var h = parseInt(m[2], 10);
          if (h > best) best = h;
        }
        if (best >= 2100) q = "4K";
        else if (best >= 1300) q = "1440p";
        else if (best >= 1000) q = "1080p";
        else if (best >= 640) q = "720p";
        else if (best > 0) q = "CAM";
      }
      qualCache[url] = { t: now, q: q };
      return q;
    }).catch(function () { qualCache[url] = { t: now, q: "" }; return ""; });
    if (hasTimers()) {
      p = Promise.race([p, new Promise(function (res) {
        var timer = setTimeout(function () { res(""); }, 6000);
        if (typeof timer === "object" && typeof timer.unref === "function") timer.unref();
      })]);
    }
    return p;
  }

  /* ---------- language gate ---------- */
  var BLOCK_RE = new RegExp(
    "\\b(hindi|hin|tamil|telugu|malayalam|mallu|kannada|bengali|bangla|punjabi|marathi|bhojpuri|gujarati|" +
    "odia|assamese|nepali|urdu|sinhala|arabic|ara|farsi|persian|turkish|turkce|espanol|spanish|latino|" +
    "castellano|french|vostfr|german|deutsch|russian|korean|kor|japanese|jpn|chinese|mandarin|cantonese|" +
    "thai|vietnamese|indonesian|bahasa|portuguese|brasileiro|italian|polish|ukrainian|hebrew|" +
    "hungarian|romanian|dutch|flemish|greek|czech|swedish|danish|norwegian|finnish|org)\\b", "i");
  var ALLOW_RE = /\b(english|eng|tagalog|filipino)\b/i;
  var SUB_RE = /\b[a-z0-9]{0,12}subs?\b/gi;
  // NOTE: gate runs on the stream TITLE only (release names / labels).
  // Provider names (e.g. "MallumV") must not trigger the language gate.
  function langAllowed(titleText) {
    var t = String(titleText || "").replace(SUB_RE, " ");
    if (BLOCK_RE.test(t)) return ALLOW_RE.test(t);
    return true;
  }

  /* ---------- dedupe ---------- */
  function normUrl(u) {
    var s = String(u || "");
    if (/^magnet:/i.test(s)) {
      var m = s.match(/btih:([a-z0-9]+)/i);
      return "m:" + (m ? m[1].toLowerCase() : s.slice(0, 80));
    }
    return s.replace(/[#?].*$/, "").replace(/\/+$/, "");
  }
  var SEEN = G.__NV_SEEN_URLS__ || (G.__NV_SEEN_URLS__ = {});
  // SEEN[nu] = { exp: <ts>, owner: <provider> }
  // - same URL from a DIFFERENT provider within TTL -> dropped (cross-provider dup)
  // - same provider re-querying its own URL -> allowed (repeat opens must still
  //   return rows) and its claim is refreshed
  function claim(nu, now, owner) {
    if (!nu) return true;
    var e = SEEN[nu];
    if (e && e.exp > now && e.owner !== owner) return false;
    SEEN[nu] = { exp: now + 120000, owner: owner };
    return true;
  }

  /* ---------- main ---------- */
  function rank(q) {
    if (q === "4K") return 4;
    if (q === "1440p") return 3.5;
    if (q === "1080p") return 3;
    if (q === "720p") return 2;
    return 0;
  }
  function postProcess(list) {
    var now = Date.now();
    var kept = [];
    var probes = [];
    var rows = [];
    (list || []).forEach(function (s, i) {
      if (!s || !s.url) return;
      if (!langAllowed(s.title)) return;
      var text = (s.name || "") + " " + (s.title || "");
      var isMagnet = /^magnet:/i.test(String(s.url));
      var q = normQ(s.quality) || normQ(String(s.title || "").split("\n")[0]) || qFromText(text);
      var isHlsLike = /m3u8/i.test(String(s.url)) ||
        (!/\.(mp4|mkv|avi|mov|webm|ts|flv|m4v|mp3|aac)(\?|$)/i.test(String(s.url.split("?")[0])) && /^https?:/i.test(String(s.url)));
      if (!q && !isMagnet && isHlsLike) {
        rows.push({ s: s, i: i });
        probes.push(probeM3u8(String(s.url), s.headers));
      } else {
        rows.push({ s: s, i: i });
        probes.push(Promise.resolve(q));
      }
    });
    return Promise.all(probes).then(function (qs) {
      var ranked = [];
      rows.forEach(function (row, k) {
        var q = qs[k];
        if (!q) return; // unknown resolution -> removed
        if (q === "CAM") return; // cam / sd / sub-720 -> removed
        row.s.quality = q;
        ranked.push({ s: row.s, i: row.i, q: q });
      });
      // best first so dedupe keeps the strongest duplicate (stable)
      ranked.sort(function (a, b) {
        var r = rank(b.q) - rank(a.q);
        if (r !== 0) return r;
        return a.i - b.i;
      });
      var seenLocal = {}, out = [];
      ranked.forEach(function (row) {
        var s = row.s;
        var nu = normUrl(s.url);
        if (seenLocal[nu]) return;
        if (!claim(nu, now, PROVIDER)) return; // already reported by a different provider
        seenLocal[nu] = 1;
        out.push(s);
      });
      return out.slice(0, 40);
    }).catch(function () { return (list || []).slice(0, 40); });
  }

  var __orig = null;
  try { __orig = module.exports && module.exports.getStreams; } catch (e) { __orig = null; }
  if (typeof __orig === "function") {
    module.exports.getStreams = function () {
      var args = Array.prototype.slice.call(arguments), self = this;
      function finish(v) {
        if (settings().postFilter === false) return v;
        try { return postProcess(Array.isArray(v) ? v : []); }
        catch (e) { return Array.isArray(v) ? v : []; }
      }
      try {
        var r = __orig.apply(self, args);
        if (r && typeof r.then === "function") {
          if (typeof setTimeout === "function") {
            // nv best-settings 4.24.0 (netmirror v13): 10s overall cap - the
            // Alpha lane serves at 9s, NewTV/VidSpark at 6s, and the full late
            // result is late-cached for the next open of the sheet.
            r = Promise.race([r, new Promise(function (res) {
              var dl = setTimeout(function () { res([]); }, 10000);
              if (dl && typeof dl.unref === "function") dl.unref();
            })]);
          }
          return r.then(function (v) { return finish(v); }, function () { return []; });
        }
        return finish(r);
      } catch (e) { return Promise.resolve([]); }
    };
  }
})();
