/**
 * Miruro - Nuvio provider (v1.0.0)
 *
 * Anime (and anime movies) from miruro.tv - the mirror ring also answers on
 * miruro.to / miruro.ru / miruro.bz. User request 2026-09-11: "create scraper
 * for https://www.miruro.tv/".
 *
 * The site addresses everything by AniList id, so TMDB ids (what Nuvio sends)
 * are mapped with a graphql.anilist.co title/year search; multi-season TMDB
 * entries are flattened to AniList absolute episode numbers via TMDB season
 * episode counts (same approach as vidnest-anime).
 *
 * Lane A (primary, no Cloudflare): the anixo.buzz relay.
 *   GET https://anixo.buzz/api/stream/resolve?anilistId=&episode=&track=sub|dub&server=1|2
 *     -> { success, server, streamUrl, subtitles:[{url,label,default}] }
 *   streamUrl is a master m3u8 (/api/stream/m3u8?t=..&h=1) with RESOLUTION
 *   variants - parsed so every variant becomes its own labeled row. Verified
 *   end-to-end from a datacenter IP on 2026-09-11 (sub + dub + movies).
 *
 * Lane B (fail-soft): the site's own /api/secure/pipe endpoint.
 *   GET {origin}/api/secure/pipe?e=base64url({path,method,query,body})
 *   Response header x-obfuscated: "2" = base64url -> XOR(key) -> gunzip -> JSON.
 *   "episodes" gives {providers:{<name>:{episodes:{sub:[...],dub:[...]}}}} and
 *   "sources" gives {streams:[{url,quality,...}],subtitles:[...]} per episode.
 *   Cloudflare blocks datacenter IPs here (sandbox blocked 2026-09-11), so this
 *   lane targets the user's device connection and every failure is silent.
 *   Decompression uses a small embedded inflate (DEFLATE) since Nuvio's JS
 *   runtime has no zlib.
 *
 * Language policy (pack-wide): sub lanes (original audio + en subs) and dub
 * lanes (English dub) are emitted; subtitles are filtered to English +
 * Filipino/Tagalog. The universal post-filter appended below enforces the
 * audio/quality/dedupe rules.
 */

var TMDB_API_KEY = "439c478a771f35c05022f9feabcca01c";
var ANIXO_BASE = "https://anixo.buzz";
var MIRURO_ORIGINS = [
  "https://www.miruro.ru",
  "https://www.miruro.to",
  "https://www.miruro.bz",
  "https://www.miruro.tv"
];
var PIPE_PATH = "/api/secure/pipe";
// 16-byte XOR key used by the pipe's x-obfuscated: "2" responses
var PIPE_OBF_KEY = [0x71, 0x95, 0x10, 0x34, 0xf8, 0xfb, 0xcf, 0x53,
                    0xd8, 0x9d, 0xb5, 0x2c, 0xeb, 0x3d, 0xc2, 0x2c];

var COMMON_UA = "Mozilla/5.0 (Linux; Android 13; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0 Mobile Safari/537.36";
var PIPE_HEADERS = {
  "User-Agent": COMMON_UA,
  "Accept": "*/*",
  "Accept-Language": "en-US,en;q=0.9",
  "sec-ch-ua": '"Chromium";v="137", "Not?A_Brand";v="24"',
  "sec-ch-ua-mobile": "?1",
  "sec-ch-ua-platform": '"Android"',
  "sec-fetch-dest": "empty",
  "sec-fetch-mode": "cors",
  "sec-fetch-site": "same-origin",
  "Referer": "https://www.miruro.to/",
  "Origin": "https://www.miruro.to"
};

function settings() {
  return typeof globalThis !== "undefined" && globalThis.SCRAPER_SETTINGS
    ? globalThis.SCRAPER_SETTINGS
    : (typeof global !== "undefined" && global.SCRAPER_SETTINGS ? global.SCRAPER_SETTINGS : {});
}

// ------------------------------------------------------------- cache / util

var CACHE_TTL = 10 * 60 * 1000;
var _G = typeof globalThis !== "undefined" ? globalThis : typeof global !== "undefined" ? global : this;
var _muState = _G.__MIRURO_STATE__ || (_G.__MIRURO_STATE__ = { cache: {}, inflight: {} });

function cacheKey(tmdbId, mediaType, season, episode) {
  return (mediaType === "tv" ? "tv" : "movie") + ":" + tmdbId + ":" + (season || 1) + ":" + (episode || 1);
}

function hasTimers() { return typeof setTimeout === "function"; }

function fetchText(url, headers, timeoutMs) {
  var opts = { method: "GET", redirect: "follow", headers: headers || {} };
  function fail(res) {
    return res.text().then(function () { throw new Error("HTTP " + res.status); });
  }
  if (!hasTimers()) return fetch(url, opts).then(function (res) {
    if (!res.ok) return fail(res);
    return res.text();
  });
  return new Promise(function (resolve, reject) {
    var timer = setTimeout(function () { reject(new Error("fetch timeout")); }, timeoutMs || 12000);
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

function b64urlEncode(str) {
  // base64url without Node Buffer (QuickJS-safe): encodeURIComponent trick
  var bytes = [];
  var utf8 = unescape(encodeURIComponent(str));
  for (var i = 0; i < utf8.length; i++) bytes.push(utf8.charCodeAt(i));
  var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
  var out = [], n, i2;
  for (i = 0; i < bytes.length; i += 3) {
    n = (bytes[i] << 16) + ((bytes[i + 1] || 0) << 8) + (bytes[i + 2] || 0);
    out.push(chars.charAt((n >> 18) & 63), chars.charAt((n >> 12) & 63));
    out.push(i + 1 < bytes.length ? chars.charAt((n >> 6) & 63) : "");
    out.push(i + 2 < bytes.length ? chars.charAt(n & 63) : "");
  }
  // unpadded base64url (matches Node's base64url and the site's own encoder)
  return out.join("");
}

function b64urlDecodeBytes(str) {
  var norm = String(str).replace(/-/g, "+").replace(/_/g, "/");
  norm += "=";
  var table = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  var bytes = [], buf = 0, bits = 0, i, c;
  for (i = 0; i < norm.length; i++) {
    c = table.indexOf(norm.charAt(i));
    if (c === -1) continue;
    buf = (buf << 6) | c;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      bytes.push((buf >> bits) & 0xff);
    }
  }
  return bytes;
}

function bytesToUtf8(bytes) {
  var out = "", i = 0;
  while (i < bytes.length) {
    var b = bytes[i];
    if (b < 0x80) { out += String.fromCharCode(b); i += 1; }
    else if (b < 0xe0) { out += String.fromCharCode(((b & 0x1f) << 6) | (bytes[i + 1] & 0x3f)); i += 2; }
    else if (b < 0xf0) {
      out += String.fromCharCode(((b & 0x0f) << 12) | ((bytes[i + 1] & 0x3f) << 6) | (bytes[i + 2] & 0x3f));
      i += 3;
    } else {
      var cp = ((b & 0x07) << 18) | ((bytes[i + 1] & 0x3f) << 12) | ((bytes[i + 2] & 0x3f) << 6) | (bytes[i + 3] & 0x3f);
      cp -= 0x10000;
      out += String.fromCharCode(0xd800 + (cp >> 10), 0xdc00 + (cp & 0x3ff));
      i += 4;
    }
  }
  return out;
}

// ------------------------------------------------------- embedded inflate

// Minimal DEFLATE/gzip decoder (ES5). Validates against Node zlib in
// scripts/test-miruro.js. Only used for pipe responses with x-obfuscated:2.
function inflateGzip(bytes) {
  var pos = 0;
  function u8() { return bytes[pos++]; }
  function u16() { var v = bytes[pos] | (bytes[pos + 1] << 8); pos += 2; return v; }
  function u32() { var v = (bytes[pos] | (bytes[pos + 1] << 8) | (bytes[pos + 2] << 16) | (bytes[pos + 3] << 24)) >>> 0; pos += 4; return v; }
  // gzip header
  if (u8() !== 0x1f || u8() !== 0x8b) throw new Error("not gzip");
  var cm = u8();
  if (cm !== 8) throw new Error("bad method " + cm);
  var flg = u8();
  pos += 6; // mtime(4) + xfl(1) + os(1)
  if (flg & 4) { var xlen = u16(); pos += xlen; }
  if (flg & 8) { while (u8() !== 0) {} }         // fname
  if (flg & 16) { while (u8() !== 0) {} }        // fcomment
  if (flg & 2) { pos += 2; }                     // fhcrc
  // raw DEFLATE blocks
  var out = [];
  var bitbuf = 0, bitcnt = 0;
  function bits(n) {
    while (bitcnt < n) { bitbuf |= bytes[pos++] << bitcnt; bitcnt += 8; }
    var v = bitbuf & ((1 << n) - 1);
    bitbuf >>= n; bitcnt -= n;
    return v;
  }
  function buildTree(lengths) {
    var counts = [], i;
    for (i = 0; i <= 15; i++) counts[i] = 0;
    for (i = 0; i < lengths.length; i++) counts[lengths[i]]++;
    // offs[1] = 0 and zero-length symbols excluded (canonical puff offsets)
    var offs = [];
    offs[1] = 0;
    for (i = 1; i <= 14; i++) offs[i + 1] = offs[i] + counts[i];
    var symbols = [];
    for (i = 0; i < lengths.length; i++) {
      if (lengths[i]) symbols[offs[lengths[i]]++] = i;
    }
    return { counts: counts, symbols: symbols };
  }
  function decodeSym(tree) {
    var code = 0, first = 0, index = 0, len;
    for (len = 1; len <= 15; len++) {
      code |= bits(1);
      var count = tree.counts[len];
      if (code - first < count) return tree.symbols[index + (code - first)];
      index += count;
      first = (first + count) << 1;
      code <<= 1;
    }
    throw new Error("bad code");
  }
  var LEN_BASE = [3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31, 35, 43, 51, 59, 67, 83, 99, 115, 131, 163, 195, 227, 258];
  var LEN_EXTRA = [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0];
  var DIST_BASE = [1, 2, 3, 4, 5, 7, 9, 13, 17, 25, 33, 49, 65, 97, 129, 193, 257, 385, 513, 769, 1025, 1537, 2049, 3073, 4097, 6145, 8193, 12289, 16385, 24577];
  var DIST_EXTRA = [0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13];
  function fixedTrees() {
    var lengths = [], i;
    for (i = 0; i < 144; i++) lengths[i] = 8;
    for (i = 144; i < 256; i++) lengths[i] = 9;
    for (i = 256; i < 280; i++) lengths[i] = 7;
    for (i = 280; i < 288; i++) lengths[i] = 8;
    var lit = buildTree(lengths);
    var distLengths = [];
    for (i = 0; i < 30; i++) distLengths[i] = 5;
    return { lit: lit, dist: buildTree(distLengths) };
  }
  var FIXED = null;
  for (;;) {
    var bfinal = bits(1), btype = bits(2), lit, dist;
    if (btype === 0) {
      bitbuf = 0; bitcnt = 0; // align
      var len = u16(), nlen = u16();
      for (var k = 0; k < len; k++) out.push(bytes[pos++]);
    } else if (btype === 1) {
      if (!FIXED) FIXED = fixedTrees();
      lit = FIXED.lit; dist = FIXED.dist;
      inflateBlock(lit, dist);
    } else if (btype === 2) {
      var hlit = bits(5) + 257, hdist = bits(5) + 1, hclen = bits(4) + 4;
      var order = [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15];
      var cl = [];
      for (var ci = 0; ci < hclen; ci++) cl[order[ci]] = bits(3);
      for (var cj = 0; cj < 19; cj++) if (cl[cj] === undefined) cl[cj] = 0;
      var clTree = buildTree(cl);
      var lens = [];
      while (lens.length < hlit + hdist) {
        var sym = decodeSym(clTree);
        if (sym < 16) lens.push(sym);
        else if (sym === 16) {
          var prev = lens[lens.length - 1], rep = 3 + bits(2);
          while (rep--) lens.push(prev);
        } else if (sym === 17) { var z = 3 + bits(3); while (z--) lens.push(0); }
        else { var z8 = 11 + bits(7); while (z8--) lens.push(0); }
      }
      lit = buildTree(lens.slice(0, hlit));
      dist = buildTree(lens.slice(hlit));
      inflateBlock(lit, dist);
    } else {
      throw new Error("bad block type");
    }
    if (bfinal) break;
  }
  function inflateBlock(lit, dist) {
    for (;;) {
      var sym = decodeSym(lit);
      if (sym < 256) out.push(sym);
      else if (sym === 256) return;
      else {
        var li = sym - 257;
        var length = LEN_BASE[li] + (LEN_EXTRA[li] ? bits(LEN_EXTRA[li]) : 0);
        var di = decodeSym(dist);
        var d = DIST_BASE[di] + (DIST_EXTRA[di] ? bits(DIST_EXTRA[di]) : 0);
        var start = out.length - d;
        for (var q = 0; q < length; q++) out.push(out[start + q]);
      }
    }
  }
  return out;
}

// ------------------------------------------------------------ pipe protocol

function pipeDecode(encodedStr, obfHeader) {
  if (!obfHeader) return JSON.parse(encodedStr);
  var bytes = b64urlDecodeBytes(encodedStr);
  if (String(obfHeader) === "2") {
    for (var i = 0; i < bytes.length; i++) bytes[i] = bytes[i] ^ PIPE_OBF_KEY[i % PIPE_OBF_KEY.length];
  }
  var out = inflateGzip(bytes); // array of bytes
  return JSON.parse(bytesToUtf8(out));
}

function pipeRequest(path, query) {
  var payload = { path: path, method: "GET", query: query, body: null };
  var enc = b64urlEncode(JSON.stringify(payload));
  var idx = 0;
  function attempt() {
    if (idx >= MIRURO_ORIGINS.length) return Promise.reject(new Error("pipe: all mirrors failed"));
    var origin = MIRURO_ORIGINS[idx++];
    return fetchText(origin + PIPE_PATH + "?e=" + enc, PIPE_HEADERS, 12000).then(function (body) {
      // fetchText throws on non-OK, so here status is 200
      return pipeDecode(body, "2");
    }).catch(function (err) {
      console.log("[Miruro] pipe " + origin + " failed: " + (err && err.message ? err.message : err));
      return attempt();
    });
  }
  return attempt();
}

function pipeTranslateId(encodedId) {
  try {
    var decoded = bytesToUtf8(b64urlDecodeBytes(encodedId));
    if (decoded.indexOf(":") !== -1) return decoded;
    return encodedId;
  } catch (e) { return encodedId; }
}

function normalizeEpisodes(provData) {
  var eps = provData && provData.episodes;
  if (!eps) return {};
  if (Array.isArray(eps)) return { sub: eps, dub: [] };
  return {
    sub: Array.isArray(eps.sub) ? eps.sub : [],
    dub: Array.isArray(eps.dub) ? eps.dub : []
  };
}

/** Lane B: pipe episodes+sources for one anilist id. Fails soft. */
function pipeLanes(anilistId, epNumber, makeRow) {
  return pipeRequest("episodes", { anilistId: anilistId }).then(function (data) {
    var providers = (data && data.providers) || {};
    var names = Object.keys(providers);
    if (!names.length) return [];
    var plan = [];
    names.forEach(function (pn) {
      var cats = normalizeEpisodes(providers[pn]);
      ["sub", "dub"].forEach(function (cat) {
        var list = cats[cat] || [];
        for (var i = 0; i < list.length; i++) {
          var ep = list[i];
          if (ep && ep.id && Number(ep.number) === Number(epNumber)) {
            plan.push({ provider: pn, category: cat, ep: ep });
            break;
          }
        }
      });
    });
    if (!plan.length) return [];
    console.log("[Miruro] pipe: " + plan.length + " provider match(es) for ep " + epNumber);
    var out = [];
    var chain = Promise.resolve();
    plan.slice(0, 6).forEach(function (p) {
      chain = chain.then(function () {
        var realId = pipeTranslateId(p.ep.id);
        return pipeRequest("sources", {
          episodeId: b64urlEncode(realId),
          provider: p.provider,
          category: p.category,
          anilistId: anilistId
        }).then(function (src) {
          var streams = (src && src.streams) || [];
          streams.forEach(function (st) {
            if (!st || !st.url || !/^https?:\/\//i.test(String(st.url))) return;
            out.push(makeRow(String(st.url), st.quality || st.label || "", p.provider, p.category));
          });
          // subtitles: English + Filipino/Tagalog only
          var subs = (src && (src.subtitles || src.captions)) || [];
          var picked = subs.filter(function (sb) {
            var l = String((sb && (sb.label || sb.language || sb.lang)) || "");
            return /^https?:/i.test(String(sb && sb.url || sb && sb.file || "")) &&
              /(english|filipino|tagalog)/i.test(l);
          }).slice(0, 8).map(function (sb) {
            var l = String(sb.label || sb.language || sb.lang || "");
            var isTl = /filipino|tagalog/i.test(l);
            return {
              url: String(sb.url || sb.file),
              language: isTl ? "tl" : "en",
              name: isTl ? "Tagalog / Filipino" : l
            };
          });
          if (picked.length) out.forEach(function (r) { if (!r.subtitles) r.subtitles = picked; });
        }).catch(function () {});
      });
    });
    return chain.then(function () { return out; });
  }).catch(function () { return []; });
}

// ------------------------------------------------------------- anixo lane

function anixoFetch(params, epNumber, track, server) {
  var url = ANIXO_BASE + "/api/stream/resolve?" + params +
    "&episode=" + encodeURIComponent(epNumber) + "&track=" + track + "&server=" + server;
  return fetchJson(url, {
    "User-Agent": COMMON_UA,
    "Accept": "application/json",
    "Referer": ANIXO_BASE + "/"
  }, 12000).then(function (data) {
    if (!data || !data.success || !data.streamUrl) return null;
    return {
      streamUrl: String(data.streamUrl),
      serverName: String(data.server || ("Server " + server)),
      subtitles: (data.subtitles || []).filter(function (s) {
        return s && s.url && /^https?:/i.test(String(s.url));
      })
    };
  }).catch(function () { return null; });
}

/** Fetch a master m3u8 and return [{url, quality}] variants (max 4, best first). */
function hlsVariants(masterUrl, referer) {
  return fetchText(masterUrl, { "User-Agent": COMMON_UA, "Referer": referer }, 9000)
    .then(function (master) {
      if (!master || master.indexOf("#EXTM3U") === -1) return [];
      var lines = master.split(/\r?\n/), out = [];
      for (var i = 0; i < lines.length; i++) {
        if (lines[i].indexOf("#EXT-X-STREAM-INF") !== 0) continue;
        var resM = lines[i].match(/RESOLUTION=(\d+)x(\d+)/i);
        var url = "";
        for (var j = i + 1; j < lines.length; j++) {
          var t = lines[j].trim();
          if (t && t.charAt(0) !== "#") { url = t; break; }
        }
        if (!url) continue;
        if (!/^https?:\/\//i.test(url)) {
          url = masterUrl.replace(/[^/]*$/, url);
        }
        var h = resM ? parseInt(resM[2], 10) : 0;
        out.push({ url: url, height: h });
      }
      out.sort(function (a, b) { return b.height - a.height; });
      return out.slice(0, 4);
    }).catch(function () { return []; });
}

function anixoLanes(animeIds, title, epNumber, makeRow) {
  // resolve params: MAL id is the reliable key ("ani" space == MAL); title
  // is the fallback that keeps working through AniList outages.
  var paramSets = [];
  if (animeIds && animeIds.malId) paramSets.push("malId=" + encodeURIComponent(animeIds.malId));
  if (animeIds && animeIds.anilistId) paramSets.push("anilistId=" + encodeURIComponent(animeIds.anilistId));
  if (title) paramSets.push("title=" + encodeURIComponent(title));
  var jobs = [];
  paramSets.forEach(function (params) {
    [["sub", 1], ["sub", 2], ["dub", 1], ["dub", 2]].forEach(function (combo) {
      jobs.push(anixoFetch(params, epNumber, combo[0], combo[1]));
    });
  });
  return Promise.all(jobs).then(function (results) {
    var rows = [];
    var seen = {};
    var chain = Promise.resolve();
    results.forEach(function (res) {
      if (!res) return;
      chain = chain.then(function () {
        return hlsVariants(res.streamUrl, ANIXO_BASE + "/").then(function (variants) {
          if (variants.length) {
            variants.forEach(function (v) {
              if (seen[v.url]) return;
              seen[v.url] = 1;
              rows.push(makeRow(v.url, "", "Anixo " + res.serverName, null, v.height));
            });
          } else if (!seen[res.streamUrl]) {
            seen[res.streamUrl] = 1;
            rows.push(makeRow(res.streamUrl, "", "Anixo " + res.serverName, null, 0));
          }
          var subs = res.subtitles.filter(function (s) {
            return /(english|filipino|tagalog)/i.test(String(s.label || s.language || ""));
          }).slice(0, 4).map(function (s) {
            var isTl = /filipino|tagalog/i.test(String(s.label || s.language || ""));
            return {
              url: String(s.url),
              language: isTl ? "tl" : "en",
              name: isTl ? "Tagalog / Filipino" : String(s.label || "English")
            };
          });
          if (subs.length) {
            rows.forEach(function (r) {
              if (r._anixo && !r.subtitles) r.subtitles = subs;
            });
          }
        });
      }).catch(function () {});
    });
    return chain.then(function () { return rows; });
  });
}

// ---------------------------------------------------- TMDB -> AniList map

function tmdbInfo(tmdbId, mediaType) {
  var endpoint = mediaType === "tv" ? "tv" : "movie";
  var url = "https://api.themoviedb.org/3/" + endpoint + "/" + tmdbId + "?api_key=" + TMDB_API_KEY;
  return fetchJson(url, null, 10000).then(function (data) {
    if (!data) throw new Error("tmdb unreachable");
    var title = mediaType === "tv" ? (data.name || data.original_name) : (data.title || data.original_title);
    var date = mediaType === "tv" ? data.first_air_date : data.release_date;
    if (!title) throw new Error("tmdb: no title");
    return { title: title, year: date ? parseInt(String(date).split("-")[0], 10) : null };
  });
}

function anilistSearchPost(title, year) {
  var query = 'query ($search: String, $year: Int) {' +
    ' Media(search: $search, seasonYear: $year, type: ANIME,' +
    ' format_in: [TV, TV_SHORT, MOVIE, OVA, ONA, SPECIAL]) {' +
    ' id idMal title { romaji english native } seasonYear } }';
  var body = JSON.stringify({ query: query, variables: { search: title, year: year } });
  if (!hasTimers()) {
    return fetch("https://graphql.anilist.co", {
      method: "POST", headers: { "Content-Type": "application/json", "Accept": "application/json" }, body: body
    }).then(function (res) { return res.json(); });
  }
  return new Promise(function (resolve, reject) {
    var timer = setTimeout(function () { reject(new Error("anilist timeout")); }, 10000);
    fetch("https://graphql.anilist.co", {
      method: "POST", headers: { "Content-Type": "application/json", "Accept": "application/json" }, body: body
    }).then(function (res) {
      clearTimeout(timer);
      res.json().then(resolve, reject);
    }, function (e) { clearTimeout(timer); reject(e); });
  });
}

/**
 * Returns {anilistId, malId} or null. Both ids matter: the miruro pipe is
 * AniList-addressed, while the anixo relay's "ani" id space is actually MAL
 * (its own embed page maps ani/20 -> "Naruto", i.e. MAL 20). GraphQL is also
 * AniList's outage surface - when it fails we fall back to anixo's title
 * resolver, which needs no id at all.
 */
function mapTMDBToAnime(title, year) {
  return anilistSearchPost(title, year).then(function (data) {
    if (data && data.data && data.data.Media && data.data.Media.id) {
      return { anilistId: data.data.Media.id, malId: data.data.Media.idMal || null };
    }
    // retry without the year (TMDB/AniList season-year mismatches)
    return anilistSearchPost(title, null).then(function (d2) {
      if (d2 && d2.data && d2.data.Media && d2.data.Media.id) {
        return { anilistId: d2.data.Media.id, malId: d2.data.Media.idMal || null };
      }
      return null;
    });
  }).catch(function () { return null; });
}

/** Multi-season TMDB entries: absolute episode number across seasons. */
function absoluteEpisode(tmdbId, season, episode) {
  season = parseInt(season || 1, 10);
  episode = parseInt(episode || 1, 10);
  if (season <= 1) return Promise.resolve(episode);
  var seasons = [];
  for (var s = 1; s < season; s++) seasons.push(s);
  var jobs = seasons.map(function (s) {
    return fetchJson("https://api.themoviedb.org/3/tv/" + tmdbId + "/season/" + s + "?api_key=" + TMDB_API_KEY, null, 9000)
      .then(function (d) { return (d && d.episodes && d.episodes.length) || 0; })
      .catch(function () { return 0; });
  });
  return Promise.all(jobs).then(function (counts) {
    var total = 0;
    counts.forEach(function (c) { total += c; });
    console.log("[Miruro] absolute episode: " + (total + episode) + " (+" + total + " prior)");
    return total + episode;
  }).catch(function () { return episode; });
}

// ----------------------------------------------------------------- core

function getStreams(tmdbId, mediaType, season, episode) {
  try { tmdbId = String(tmdbId); } catch (e) { tmdbId = ""; }
  if (!tmdbId) return Promise.resolve([]);
  var isTv = mediaType === "tv";
  var key = cacheKey(tmdbId, mediaType, season, episode);
  var hit = _muState.cache[key];
  if (hit && Date.now() - hit.ts < CACHE_TTL) return Promise.resolve(hit.streams);
  if (_muState.inflight[key]) return _muState.inflight[key];

  console.log("[Miruro] start " + mediaType + " " + tmdbId +
    (isTv ? " S" + season + "E" + episode : ""));

  function makeRow(url, qualityLabel, sourceName, category, height) {
    var q = "";
    var s = String(qualityLabel || "").toLowerCase();
    if (/2160|4k/.test(s)) q = "4K";
    else if (/1440/.test(s)) q = "1440p";
    else if (/1080/.test(s)) q = "1080p";
    else if (/720/.test(s)) q = "720p";
    else if (height) {
      if (height >= 2100) q = "4K";
      else if (height >= 1300) q = "1440p";
      else if (height >= 1000) q = "1080p";
      else if (height >= 640) q = "720p";
    }
    var lane = category === "dub" ? "Dub" : (category === "sub" ? "Sub" : "");
    var name = "Miruro | " + sourceName + (lane ? " | " + lane : "") + (q ? " | " + q : "");
    return {
      name: name,
      title: name,
      url: url,
      quality: q,
      headers: { Referer: /^https?:\/\/[^\/]*anixo/i.test(url) ? ANIXO_BASE + "/" : "https://www.miruro.to/" },
      _anixo: sourceName.indexOf("Anixo") === 0
    };
  }

  var run = tmdbInfo(tmdbId, isTv ? "tv" : "movie").then(function (info) {
    // mapTMDBToAnime never rejects (null on outage/no-match) - anixo's title
    // resolver keeps Lane A alive even while AniList is down.
    return mapTMDBToAnime(info.title, info.year).then(function (animeIds) {
      if (animeIds) console.log("[Miruro] anilist " + animeIds.anilistId + " / mal " + animeIds.malId);
      else console.log("[Miruro] no mapping - anixo title fallback");
      var epP = isTv ? absoluteEpisode(tmdbId, season, episode) : Promise.resolve(1);
      return epP.then(function (epNumber) {
        var a = anixoLanes(animeIds, info.title, epNumber, makeRow);
        var b = animeIds && animeIds.anilistId
          ? pipeLanes(animeIds.anilistId, epNumber, makeRow)
          : Promise.resolve([]);
        return Promise.all([a, b]).then(function (parts) {
          var seen = {}, out = [];
          parts[0].concat(parts[1]).forEach(function (r) {
            var nu = String(r.url).replace(/[#?].*$/, "");
            if (seen[nu]) return;
            seen[nu] = 1;
            out.push(r);
          });
          console.log("[Miruro] returning " + out.length + " stream(s)");
          return out;
        });
      });
    });
  }).catch(function (error) {
    console.log("[Miruro] failed: " + (error && error.message ? error.message : error));
    return [];
  }).then(function (streams) {
    delete _muState.inflight[key];
    return streams;
  });
  _muState.inflight[key] = run;
  return run;
}

module.exports = {
  getStreams: getStreams
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
  var PROVIDER = "miruro";
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
          return r.then(function (v) { return finish(v); }, function () { return []; });
        }
        return finish(r);
      } catch (e) { return Promise.resolve([]); }
    };
  }
})();

