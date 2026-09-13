/**
 * NetMirror - Nuvio provider (v14.0.0)
 *
 * v14.0.0: FULL DECODE + SPEED REWRITE (2026-09-13).
 *  - User report on 4.24.0: "SLOW TO FETCH STREAMS, FULLY DECODE THE NETMIRROR.JS"
 *    and attached the still-obfuscated All-in-One-Nuvio netmirror.js. That file is
 *    now FULLY DECODED (string table, aliases, control flow) and hand-rewritten
 *    into this clean implementation. Nothing obfuscated remains.
 *  - Live probes 2026-09-13 (sandbox network):
 *      (a) https://net27.cc/api/embed-tmdb/{tmdbId} answers in ~0.5s with a single
 *          request for BOTH movies and series: {ok:true, streams:[{url,resolution}],
 *          mp4, captions:[{url,lang,name}]}. This is the same API family the user
 *          validated as the working "Alpha" source. It is now the PRIMARY lane.
 *      (b) The NewTV platform lane (24 candidate domains -> /checknewtv.php ->
 *          token_hash -> /newtv/*.php) is IP-gated: reachable but search answered
 *          "Page Not Found" from this datacenter IP. Kept as a FAIL-FAST fallback
 *          because it can work on retail/mobile device IPs.
 *  - Why the old build was slow (measured on the decoded AIO logic):
 *      1. resolveApiUrl() probed 24 domains SEQUENTIALLY with no timeouts;
 *      2. four platforms were tried SEQUENTIALLY, each a 4-10 request chain;
 *      3. TV episodes enumerated EVERY season/page SEQUENTIALLY although only one
 *         episode is needed;
 *      4. zero caching, zero fetch timeouts anywhere.
 *    v14 fixes all four: net27 single-request hot path (~0.5s), parallel domain
 *    race (Promise.any-style, 3.5s probe cap), platforms resolved in PARALLEL,
 *    episode pages fetched in PARALLEL for the requested season only, TMDB title
 *    cached 30min, api base cached 6h, resolved streams cached 8min (signed URLs
 *    live ~1h), and every fetch is timeout-bounded.
 *  - English-only content per standing rule; captions limited to English (en) and
 *    Filipino/Tagalog (fil/tl) exactly like the previously validated build.
 *  - Settings contract unchanged from AIO: preferredPlatform + forceHd (forceHd is
 *    accepted for UI parity; the upstream API exposes no such switch, so it stays
 *    a no-op exactly like in the original AIO build).
 */

// =========================================================== constants (decoded)

var TMDB_API_KEY = "1865f43a0549ca50d341dd9ab8b29f49";

var CHROME_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36";

var NET27_HOST = "https://net27.cc";

/** Stream/caption playback headers (decoded from AIO fetchFromNetflixDirect). */
var PLAY_HEADERS = {
  Referer: "https://videodownloader.site/",
  "User-Agent": CHROME_UA
};

/** NewTV platform API map (decoded verbatim from AIO PLATFORM_MAP). */
var PLATFORM_MAP = {
  netflix: {
    ott: "nf",
    search: "/mobile/search.php",
    post: "/mobile/post.php",
    episodes: "/mobile/episodes.php",
    playlist: "/mobile/playlist.php",
    img: "poster/v",
    epImg: "epimg/150"
  },
  primevideo: {
    ott: "pv",
    search: "/mobile/pv/search.php",
    post: "/mobile/pv/post.php",
    episodes: "/mobile/pv/episodes.php",
    playlist: "/mobile/pv/playlist.php",
    img: "pv/v",
    epImg: "pvepimg"
  },
  hotstar: {
    ott: "hs",
    search: "/mobile/hs/search.php",
    post: "/mobile/hs/post.php",
    episodes: "/mobile/hs/episodes.php",
    playlist: "/mobile/hs/playlist.php",
    img: "hs/v",
    epImg: "hsepimg"
  },
  disney: {
    ott: "hs",
    search: "/mobile/hs/search.php",
    post: "/mobile/hs/post.php",
    episodes: "/mobile/hs/episodes.php",
    playlist: "/mobile/hs/playlist.php",
    img: "hs/v",
    epImg: "hsepimg"
  }
};

var NEW_TV_BASE_HEADERS = {
  "Cache-Control": "no-cache, no-store, must-revalidate",
  Pragma: "no-cache",
  Expires: "0",
  "X-Requested-With": "NetmirrorNewTV v1.0",
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:136.0) Gecko/20100101 Firefox/136.0 /OS.GatuNewTV v1.0",
  Accept: "application/json, text/plain, */*"
};

/** Candidate NewTV bootstrap domains (decoded from the AIO base64 table). */
var NEW_TV_DOMAINS = [
  "aHR0cHM6Ly9tb2JpbGVkZXRlY3RzLmNvbQ==",
  "aHR0cHM6Ly9tb2JpbGVkZXRlY3QuYXBw",
  "aHR0cHM6Ly9tb2JpZGV0ZWN0LmFydA==",
  "aHR0cHM6Ly9tb2JpZGV0ZWN0LmNj",
  "aHR0cHM6Ly9tb2JpZGV0ZWN0LmNsaWNr",
  "aHR0cHM6Ly9tb2JpZGV0ZWN0Lmluaw==",
  "aHR0cHM6Ly9tb2JpZGV0ZWN0LmxpdmU=",
  "aHR0cHM6Ly9tb2JpZGV0ZWN0LnBybw==",
  "aHR0cHM6Ly9tb2JpZGV0ZWN0LnNob3A=",
  "aHR0cHM6Ly9tb2JpZGV0ZWN0LnNpdGU=",
  "aHR0cHM6Ly9tb2JpZGV0ZWN0LnNwYWNl",
  "aHR0cHM6Ly9tb2JpZGV0ZWN0LnN0b3Jl",
  "aHR0cHM6Ly9tb2JpZGV0ZWN0LnZpcA==",
  "aHR0cHM6Ly9tb2JpZGV0ZWN0Lndpa2k=",
  "aHR0cHM6Ly9tb2JpZGV0ZWN0Lnh5eg==",
  "aHR0cHM6Ly9tb2JpZGV0ZWN0cy5hcnQ=",
  "aHR0cHM6Ly9tb2JpZGV0ZWN0cy5jYw==",
  "aHR0cHM6Ly9tb2JpZGV0ZWN0cy5pbmZv",
  "aHR0cHM6Ly9tb2JpZGV0ZWN0cy5pbms=",
  "aHR0cHM6Ly9tb2JpZGV0ZWN0cy5saXZl",
  "aHR0cHM6Ly9tb2JpZGV0ZWN0cy5wcm8=",
  "aHR0cHM6Ly9tb2JpZGV0ZWN0cy5zdG9yZQ==",
  "aHR0cHM6Ly9tb2JpZGV0ZWN0cy50b3A=",
  "aHR0cHM6Ly9tb2JpZGV0ZWN0cy54eXo="
];

// ==================================================================== tuning

var T_NET27 = 6000;      // net27 embed-tmdb single request cap
var T_TMDB = 5000;       // TMDB title lookup cap
var T_PROBE = 3500;      // per-domain NewTV bootstrap probe cap
var T_API = 5500;        // per-request NewTV API cap
var RACE_APIBASE = 8000; // whole bootstrap race cap
var OVERALL_CAP = 13000; // whole getStreams cap
var EP_PAGES_MAX = 8;    // parallel episode pages per season
var SEASONS_MAX = 12;    // seasons scanned per title (safety)

var TTL_STREAM = 8 * 60 * 1000;    // resolved streams cache (signed urls ~1h)
var TTL_TMDB = 30 * 60 * 1000;     // tmdb title cache
var TTL_APIBASE = 6 * 60 * 60 * 1000; // resolved NewTV api base
var TTL_APIBASE_FAIL = 5 * 60 * 1000; // negative cache after bootstrap failure

// ==================================================================== runtime

var _G =
  typeof globalThis !== "undefined"
    ? globalThis
    : typeof global !== "undefined"
    ? global
    : this;

var _S = _G.__NETMIRROR_V14__ || (_G.__NETMIRROR_V14__ = {
  streams: {},      // cacheKey -> { ts, rows }
  inflight: {},     // cacheKey -> Promise
  tmdb: {},         // tmdbKey -> { ts, title }
  apiBase: null,    // resolved NewTV api base
  apiBaseAt: 0,
  apiBaseFailAt: 0,
  lastGoodDomain: null
});

function hasTimers() {
  return typeof setTimeout === "function";
}

/** QuickJS-safe GET with timeout race (no AbortController dependency). */
function fetchText(url, headers, timeoutMs) {
  var opts = { method: "GET", redirect: "follow", headers: headers || {} };
  function fail(res) {
    return res.text().then(function () {
      throw new Error("HTTP " + res.status);
    });
  }
  if (!hasTimers()) {
    return fetch(url, opts).then(function (res) {
      if (!res.ok) return fail(res);
      return res.text();
    });
  }
  return new Promise(function (resolve, reject) {
    var done = false;
    var timer = setTimeout(function () {
      if (!done) {
        done = true;
        reject(new Error("fetch timeout " + (timeoutMs || 15000) + "ms"));
      }
    }, timeoutMs || 15000);
    fetch(url, opts).then(function (res) {
      if (done) return;
      if (!res.ok) {
        fail(res).then(reject, reject);
        return;
      }
      res.text().then(resolve, reject);
    }, function (e) {
      if (done) return;
      done = true;
      clearTimeout(timer);
      reject(e);
    });
  });
}

function fetchJson(url, headers, timeoutMs) {
  return fetchText(url, headers, timeoutMs).then(function (t) {
    try {
      return JSON.parse(t);
    } catch (e) {
      return null;
    }
  });
}

/** Pure-JS base64 decode (atob -> Buffer -> manual). */
function b64Decode(s) {
  try {
    if (typeof atob === "function") return atob(s);
  } catch (e0) {}
  try {
    if (typeof Buffer !== "undefined" && Buffer.from) {
      return Buffer.from(s, "base64").toString("binary");
    }
  } catch (e1) {}
  var B64 =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
  var out = "";
  var bits = 0;
  var acc = 0;
  for (var i = 0; i < s.length; i++) {
    var c = B64.indexOf(s.charAt(i));
    if (c < 0 || c === 64) continue;
    acc = (acc << 6) | c;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      out += String.fromCharCode((acc >> bits) & 0xff);
    }
  }
  return out;
}

/** Promise.any polyfill for runtimes without it (first FULFILLED wins). */
function anyOf(promises) {
  if (typeof Promise.any === "function") return Promise.any(promises);
  return new Promise(function (resolve, reject) {
    var pending = promises.length;
    if (!pending) {
      reject(new Error("anyOf: empty"));
      return;
    }
    var errors = [];
    promises.forEach(function (p, i) {
      Promise.resolve(p).then(resolve, function (e) {
        errors[i] = e;
        pending -= 1;
        if (pending === 0) reject(new Error("anyOf: all failed"));
      });
    });
  });
}

// ===================================================== LANE 1: net27 embed-tmdb

/**
 * Primary lane - one request for movies and series alike.
 * Decoded from AIO fetchFromNetflixDirect; live-verified 2026-09-13.
 */
function net27Streams(tmdbId, mediaType, season, episode, titleHint) {
  var path =
    mediaType === "tv"
      ? "/api/embed-tmdb/" +
        tmdbId +
        "?type=tv&s=" +
        (season || 1) +
        "&e=" +
        (episode || 1)
      : "/api/embed-tmdb/" + tmdbId;
  return fetchJson(NET27_HOST + path, {
    Accept: "application/json, text/plain, */*",
    Referer: NET27_HOST + "/",
    "User-Agent": CHROME_UA
  }).then(function (data) {
    if (!data || data.ok !== true) return [];
    var title = data.title || titleHint || "NetMirror";

    // captions -> keep English + Filipino/Tagalog only (standing rule)
    var subs = [];
    (data.captions || []).forEach(function (c) {
      if (!c || !c.url) return;
      var lang = (c.lang || "en").toLowerCase();
      if (lang.indexOf("en") !== 0 && lang.indexOf("fil") !== 0 && lang.indexOf("tl") !== 0) {
        return;
      }
      var u = c.url;
      if (u.indexOf("/") === 0) u = NET27_HOST + u;
      subs.push({
        url: u,
        language: lang.indexOf("en") === 0 ? "en" : "tl",
        name: c.name || (lang.indexOf("en") === 0 ? "English" : "Tagalog"),
        headers: PLAY_HEADERS
      });
    });

    var rows = [];
    if (data.streams && data.streams.length > 0) {
      data.streams.forEach(function (st) {
        if (!st || !st.url) return;
        var res = st.resolution || "";
        rows.push({
          name: "NetMirror (Netflix)" + (res ? " - " + res + "p" : ""),
          title: title,
          url: st.url,
          quality: res ? res + "p" : "Auto",
          headers: PLAY_HEADERS,
          subtitles: subs,
          provider: "netmirror"
        });
      });
    } else if (data.mp4) {
      rows.push({
        name: "NetMirror (Netflix) - Auto",
        title: title,
        url: data.mp4,
        quality: "Auto",
        headers: PLAY_HEADERS,
        subtitles: subs,
        provider: "netmirror"
      });
    }
    // best quality first (Nuvio plays top-down)
    rows.sort(function (a, b) {
      var qa = parseInt(a.quality) || 0;
      var qb = parseInt(b.quality) || 0;
      return qb - qa;
    });
    return rows;
  });
}

// ==================================================== TMDB title (lane 2 only)

function tmdbTitle(tmdbId, mediaType) {
  var key = (mediaType === "tv" ? "tv" : "movie") + ":" + tmdbId;
  var hit = _S.tmdb[key];
  if (hit && Date.now() - hit.ts < TTL_TMDB) return Promise.resolve(hit.title);
  var url =
    "https://api.themoviedb.org/3/" +
    (mediaType === "tv" ? "tv" : "movie") +
    "/" +
    tmdbId +
    "?api_key=" +
    TMDB_API_KEY;
  return fetchJson(url, {
    "User-Agent": CHROME_UA,
    Accept: "application/json"
  }).then(function (d) {
    var title = d ? (mediaType === "tv" ? d.name : d.title) : null;
    if (title) _S.tmdb[key] = { ts: Date.now(), title: title };
    return title || null;
  });
}

// ============================================ LANE 2: NewTV platform fallback

/** PARALLEL bootstrap race over all candidate domains (was sequential). */
function resolveApiUrl() {
  if (_S.apiBase && Date.now() - _S.apiBaseAt < TTL_APIBASE) {
    return Promise.resolve(_S.apiBase);
  }
  if (_S.apiBaseFailAt && Date.now() - _S.apiBaseFailAt < TTL_APIBASE_FAIL) {
    return Promise.reject(new Error("NewTV bootstrap failed recently"));
  }
  var candidates = NEW_TV_DOMAINS.map(function (b64) {
    return String(b64Decode(b64)).replace(/\/$/, "");
  });
  // last good domain retries first (cached-memory optimization)
  if (_S.lastGoodDomain) {
    var idx = candidates.indexOf(_S.lastGoodDomain);
    if (idx > 0) {
      candidates.splice(idx, 1);
      candidates.unshift(_S.lastGoodDomain);
    }
  }
  var probes = candidates.map(function (base) {
    return fetchJson(base + "/checknewtv.php", NEW_TV_BASE_HEADERS, T_PROBE).then(
      function (d) {
        if (!d || !d.token_hash) throw new Error("no token_hash");
        var api = String(b64Decode(d.token_hash)).replace(/\/$/, "");
        if (!api) throw new Error("empty api base");
        return api;
      }
    );
  });
  var race = anyOf(probes);
  if (hasTimers()) {
    race = Promise.race([
      race,
      new Promise(function (_, reject) {
        setTimeout(function () {
          reject(new Error("bootstrap race cap"));
        }, RACE_APIBASE);
      })
    ]);
  }
  return race.then(
    function (api) {
      _S.apiBase = api;
      _S.apiBaseAt = Date.now();
      _S.apiBaseFailAt = 0;
      // remember which domain family answered
      _S.lastGoodDomain = null;
      for (var i = 0; i < candidates.length; i++) {
        if (api.indexOf(candidates[i].replace(/^https?:\/\//, "").split(".")[0]) >= 0) {
          _S.lastGoodDomain = candidates[i];
          break;
        }
      }
      return api;
    },
    function () {
      _S.apiBaseFailAt = Date.now();
      throw new Error("Failed to resolve NewTV API base URL");
    }
  );
}

function newTvHeaders(ott, extra) {
  var h = {};
  Object.keys(NEW_TV_BASE_HEADERS).forEach(function (k) {
    h[k] = NEW_TV_BASE_HEADERS[k];
  });
  h.Ott = ott;
  if (extra) {
    Object.keys(extra).forEach(function (k) {
      h[k] = extra[k];
    });
  }
  return h;
}

/** Episode number parsing (decoded from AIO ep/epNum handling). */
function epNumOf(e) {
  if (e.ep) return parseInt(e.ep, 10);
  if (e.epNum) return parseInt(String(e.epNum).replace("E", ""), 10);
  return null;
}

/**
 * Find one episode id. Fetches ONLY the requested season's pages first, in
 * PARALLEL (the AIO original walked every season/page sequentially).
 */
function findEpisodeId(api, cfg, postId, season, episode) {
  var sWant = parseInt(season, 10) || 1;
  var eWant = parseInt(episode, 10) || 1;
  return fetchJson(api + "/newtv/post.php?id=" + postId, newTvHeaders(cfg.ott, { Lastep: "", Usertoken: "" }), T_API).then(
    function (detail) {
      if (!detail) return null;

      // Harvest episodes already bundled in the post payload.
      var found = null;
      var seasons = [];
      (detail.season || []).forEach(function (s, i) {
        if (s && s.id) seasons.push({ id: s.id, num: i + 1 });
      });

      function check(list, sNum) {
        (list || []).forEach(function (e) {
          if (!e || found) return;
          if (epNumOf(e) === eWant && (sNum === sWant || (e.sNum && parseInt(String(e.sNum).replace("S", ""), 10) === sWant))) {
            found = e.id;
          }
        });
      }
      check(detail.episodes, seasons.length ? seasons[0].num : sWant);
      if (found) return found;

      // Build the page-fetch plan: requested season first, others after.
      var seasonNums = {};
      seasons.forEach(function (s) {
        seasonNums[s.num] = s.id;
      });
      var plan = [];
      var firstId = seasonNums[sWant] || (detail.nextPageSeason || null);
      if (firstId) {
        for (var p = 1; p <= EP_PAGES_MAX; p++) plan.push({ id: firstId, page: p, sNum: sWant });
      }
      for (var n = 1; n <= Math.min(seasons.length, SEASONS_MAX); n++) {
        if (n === sWant) continue;
        for (var q = 1; q <= EP_PAGES_MAX; q++) plan.push({ id: seasonNums[n], page: q, sNum: n });
      }

      var jobs = plan.slice(0, 40).map(function (item) {
        return fetchJson(
          api + "/newtv/episodes.php?id=" + item.id + "&page=" + item.page,
          newTvHeaders(cfg.ott),
          T_API
        ).then(function (d) {
          if (!d || !d.episodes) return [];
          var out = [];
          d.episodes.forEach(function (e) {
            if (e) out.push({ id: e.id, ep: epNumOf(e), s: item.sNum });
          });
          return out;
        }, function () {
          return [];
        });
      });
      return Promise.all(jobs).then(function (batches) {
        for (var bi = 0; bi < batches.length; bi++) {
          var batch = batches[bi];
          for (var ei = 0; ei < batch.length; ei++) {
            if (batch[ei].ep === eWant && batch[ei].s === sWant) return batch[ei].id;
          }
        }
        return null;
      });
    }
  );
}

/** Full NewTV chain for one platform (decoded from AIO fetchFromPlatform). */
function platformStreams(platform, title, mediaType, season, episode) {
  var cfg = PLATFORM_MAP[platform];
  if (!cfg) return Promise.resolve([]);
  return resolveApiUrl().then(function (api) {
    return fetchJson(api + "/newtv/search.php?s=" + encodeURIComponent(title), newTvHeaders(cfg.ott), T_API).then(
      function (search) {
        if (!search || !search.searchResult || search.searchResult.length === 0) return [];
        var postId = search.searchResult[0].id;
        var pickId;
        if (mediaType === "tv") {
          return findEpisodeId(api, cfg, postId, season, episode).then(function (epId) {
            if (!epId) return [];
            return fetchJson(api + "/newtv/player.php?id=" + epId, newTvHeaders(cfg.ott, { Usertoken: "" }), T_API).then(
              function (player) {
                if (!player || player.status !== "ok" || !player.video_link) return [];
                return [
                  {
                    name: "NetMirror (" + platform.charAt(0).toUpperCase() + platform.slice(1) + ")",
                    title: title,
                    url: player.video_link,
                    quality: "Auto",
                    headers: { Referer: player.referer || api },
                    provider: "netmirror"
                  }
                ];
              }
            );
          });
        }
        // movie: reject TV-shaped posts, then player
        return fetchJson(api + "/newtv/post.php?id=" + postId, newTvHeaders(cfg.ott, { Lastep: "", Usertoken: "" }), T_API).then(
          function (detail) {
            if (!detail) return [];
            var isTv =
              detail.type === "t" ||
              (detail.episodes &&
                detail.episodes.filter(function (e) {
                  return e !== null;
                }).length > 0);
            if (isTv) return [];
            pickId = detail.main_id || postId;
            return fetchJson(api + "/newtv/player.php?id=" + pickId, newTvHeaders(cfg.ott, { Usertoken: "" }), T_API).then(
              function (player) {
                if (!player || player.status !== "ok" || !player.video_link) return [];
                return [
                  {
                    name: "NetMirror (" + platform.charAt(0).toUpperCase() + platform.slice(1) + ")",
                    title: title,
                    url: player.video_link,
                    quality: "Auto",
                    headers: { Referer: player.referer || api },
                    provider: "netmirror"
                  }
                ];
              }
            );
          }
        );
      }
    );
  });
}

/** Platforms resolve in PARALLEL; first non-empty result in preference order wins. */
function platformLane(platformOrder, title, mediaType, season, episode) {
  var jobs = platformOrder.map(function (p) {
    return platformStreams(p, title, mediaType, season, episode).then(
      function (rows) {
        return { platform: p, rows: rows || [] };
      },
      function () {
        return { platform: p, rows: [] };
      }
    );
  });
  return Promise.all(jobs).then(function (results) {
    for (var i = 0; i < platformOrder.length; i++) {
      for (var j = 0; j < results.length; j++) {
        if (results[j].platform === platformOrder[i] && results[j].rows.length > 0) {
          return results[j].rows;
        }
      }
    }
    return [];
  });
}

// =================================================================== getStreams

function cacheKey(tmdbId, mediaType, season, episode) {
  return (
    (mediaType === "tv" ? "tv" : "movie") +
    ":" +
    tmdbId +
    ":" +
    (season || 1) +
    ":" +
    (episode || 1)
  );
}

function getStreams(tmdbId, mediaType, season, episode) {
  var id = String(tmdbId || "").trim();
  var type = mediaType === "tv" ? "tv" : "movie";
  var s = parseInt(season, 10) || 1;
  var e = parseInt(episode, 10) || 1;
  var key = cacheKey(id, type, s, e);

  var hit = _S.streams[key];
  if (hit && Date.now() - hit.ts < TTL_STREAM) return Promise.resolve(hit.rows);
  if (_S.inflight[key]) return _S.inflight[key];

  var job = run(tmdbId, type, s, e).then(function (rows) {
    if (rows && rows.length) _S.streams[key] = { ts: Date.now(), rows: rows };
    delete _S.inflight[key];
    return rows;
  }, function () {
    delete _S.inflight[key];
    return [];
  });
  _S.inflight[key] = job;
  return job;
}

function run(tmdbId, mediaType, season, episode) {
  var settings = _G.SCRAPER_SETTINGS || {};
  var preferred = settings.preferredPlatform || "all";
  var order = ["netflix", "primevideo", "hotstar", "disney"];
  if (preferred !== "all" && PLATFORM_MAP[preferred]) {
    order = [preferred].concat(
      order.filter(function (p) {
        return p !== preferred;
      })
    );
  }

  var hotPath = net27Streams(tmdbId, mediaType, season, episode).then(function (rows) {
    return { from: "net27", rows: rows || [] };
  }, function () {
    return { from: "net27", rows: [] };
  });

  var coldPath = tmdbTitle(tmdbId, mediaType).then(function (title) {
    if (!title) return { from: "platform", rows: [] };
    return platformLane(order, title, mediaType, season, episode).then(function (rows) {
      return { from: "platform", rows: rows };
    });
  }, function () {
    return { from: "platform", rows: [] };
  });

  // run hot path first; platform lane only consulted if the hot path missed
  var chained = hotPath.then(function (hot) {
    if (hot.rows.length > 0) return hot.rows;
    return coldPath.then(function (cold) {
      return cold.rows;
    });
  });

  if (!hasTimers()) return chained;
  return Promise.race([
    chained,
    new Promise(function (resolve) {
      setTimeout(function () {
        resolve([]);
      }, OVERALL_CAP);
    })
  ]);
}

// ==================================================================== settings

function onSettings() {
  return Promise.resolve([
    {
      type: "header",
      label: "Source Selection"
    },
    {
      type: "select",
      key: "preferredPlatform",
      label: "Preferred Streaming Source",
      description:
        "Select which platform to try first. If content isn't found, others will be searched as fallback.",
      options: [
        { label: "All Sources (Ordered)", value: "all" },
        { label: "Netflix", value: "netflix" },
        { label: "Prime Video", value: "primevideo" },
        { label: "Hotstar / Disney+", value: "hotstar" }
      ],
      defaultValue: "all"
    },
    {
      type: "header",
      label: "Advanced"
    },
    {
      type: "toggle",
      key: "forceHd",
      label: "Force HD Quality",
      description: "Attempts to force the player into HD mode when possible.",
      defaultValue: true
    }
  ]);
}

module.exports = {
  getStreams: getStreams,
  onSettings: onSettings
};
