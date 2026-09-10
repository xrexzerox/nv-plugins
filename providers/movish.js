/**
 * Movish - Nuvio provider (v1.0.0)
 *
 * movish.to is a Vidstack-based app with a TMDB-keyed sources API. Chain
 * verified live 2026-09-10:
 *
 *   GET {base}/player-sources/{serverKey}/movie/{tmdbId}
 *   GET {base}/player-sources/{serverKey}/tv/{tmdbId}/{season}/{episode}
 *     Headers: Accept: application/json, Referer: {base}/player/...
 *     -> {"source":"rigel","label":"Rigel","streams":[
 *          {"url":"https://api.dlproxy.com/v1/play/...","label":"Delta",
 *           "type":"mp4","quality":"360p"}, ...]}
 *
 *   Server keys live on the player page ({key,label} array). Only "rigel"
 *   was observed; the key list is parsed from the player page each call so
 *   new servers are picked up automatically.
 *
 *   GET {base}/player-episodes/{tmdbId}/{season} -> {"episodes":[...]}  (info only)
 *
 * No site search needed - the whole API is TMDB-id addressed. The dlproxy
 * streams are direct (mp4) or HLS per the "type" field. Rows are labeled
 * "Movish | {label} ({quality})". Language policy: English catalog.
 * Pure ES5 promise chains - QuickJS + Nuvio TV worker safe.
 */

var SITE_NAME = "Movish";
var BASE_CANDIDATES = [
  "https://movish.to"
];
var UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36";

var ACTIVE_BASE = "";

function settings() {
  try {
    return (typeof globalThis !== "undefined" && globalThis.SCRAPER_SETTINGS) ||
      (typeof global !== "undefined" && global.SCRAPER_SETTINGS) || {};
  } catch (e) { return {}; }
}

function hasTimers() {
  return typeof setTimeout === "function";
}

function fetchText(url, options) {
  options = options || {};
  var opts = {
    method: options.method || "GET",
    headers: options.headers || { "User-Agent": UA },
    redirect: "follow"
  };
  if (options.body) opts.body = options.body;
  if (!hasTimers()) {
    return fetch(url, opts).then(function (res) {
      if (!res.ok) throw new Error("HTTP " + res.status);
      return res.text();
    });
  }
  return new Promise(function (resolve, reject) {
    var timer = setTimeout(function () { reject(new Error("fetch timeout")); }, options.timeout || 15000);
    fetch(url, opts).then(function (res) {
      clearTimeout(timer);
      if (!res.ok) throw new Error("HTTP " + res.status);
      return res.text();
    }).then(function (t) { resolve(t); }, function (e) { clearTimeout(timer); reject(e); });
  });
}

function fetchJson(url, options) {
  return fetchText(url, options).then(function (t) {
    try { return JSON.parse(t); } catch (e) { return null; }
  });
}

function candidateBases() {
  var custom = settings().baseUrl;
  var bases = [];
  if (custom && /^https?:\/\//i.test(String(custom))) {
    bases.push(String(custom).replace(/\/+$/, ""));
  }
  BASE_CANDIDATES.forEach(function (b) { bases.push(b); });
  return bases;
}

function resolveBase() {
  if (ACTIVE_BASE) return Promise.resolve(ACTIVE_BASE);
  var chain = Promise.reject(new Error("no base"));
  candidateBases().forEach(function (b) {
    chain = chain.catch(function () {
      return fetchText(b + "/", { headers: { "User-Agent": UA }, timeout: 9000 })
        .then(function () { ACTIVE_BASE = b; return b; });
    });
  });
  return chain;
}

// Pull [{key,label}] out of the player page JS (pattern: [{"key":"rigel","label":"Rigel"}])
function serverKeys(base, isTv, tmdbId, season, episode) {
  var playerPath = isTv
    ? "/player/tv/" + tmdbId + "/" + season + "/" + episode
    : "/player/movie/" + tmdbId;
  return fetchText(base + playerPath, {
    headers: { "User-Agent": UA, "Accept": "text/html,*/*", "Referer": base + "/" },
    timeout: 14000
  }).then(function (html) {
    var keys = [];
    var m = html.match(/\[\s*\{\s*["']key["']\s*:\s*["']([a-z0-9_-]+)["']/i);
    if (m) {
      var arrRe = /\{\s*["']key["']\s*:\s*["']([a-z0-9_-]+)["']\s*,\s*["']label["']\s*:\s*["']([^"']+)["']\s*\}/gi;
      var am;
      while ((am = arrRe.exec(html)) !== null) {
        keys.push({ key: am[1], label: am[2] });
      }
    }
    if (!keys.length) keys.push({ key: "rigel", label: "Rigel" }); // observed default
    return keys;
  }).catch(function () {
    return [{ key: "rigel", label: "Rigel" }];
  });
}

function qualityOf(q) {
  var s = String(q || "").toLowerCase();
  if (s.indexOf("2160") !== -1 || s === "4k") return "4K";
  if (s.indexOf("1440") !== -1) return "1440p";
  if (s.indexOf("1080") !== -1) return "1080p";
  if (s.indexOf("720") !== -1) return "720p";
  if (s.indexOf("480") !== -1) return "480p";
  if (s.indexOf("360") !== -1) return "360p";
  return "Auto";
}

function getStreams(tmdbId, mediaType, season, episode) {
  var isTv = mediaType === "tv";
  var s = season || 1;
  var e = episode || 1;
  console.log("[" + SITE_NAME + "] start " + mediaType + " " + tmdbId + (isTv ? " S" + s + "E" + e : ""));
  try { tmdbId = String(tmdbId); } catch (err) { tmdbId = ""; }
  if (!tmdbId) return Promise.resolve([]);

  return resolveBase().then(function (base) {
    return serverKeys(base, isTv, tmdbId, s, e).then(function (keys) {
      var chain = Promise.resolve([]);
      keys.forEach(function (k) {
        chain = chain.then(function (rows) {
          var srcPath = isTv
            ? "/player-sources/" + k.key + "/tv/" + tmdbId + "/" + s + "/" + e
            : "/player-sources/" + k.key + "/movie/" + tmdbId;
          return fetchJson(base + srcPath, {
            headers: { "User-Agent": UA, "Accept": "application/json", "Referer": base + "/" },
            timeout: 14000
          }).then(function (payload) {
            var streams = (payload && payload.streams) || [];
            streams.forEach(function (st) {
              if (!st || !st.url || !/^https?:\/\//i.test(st.url)) return;
              if (rows.some(function (r) { return r.url === st.url; })) return;
              var q = qualityOf(st.quality);
              var kind = String(st.type || "mp4").toLowerCase() === "hls" ? "HLS" : "Direct";
              rows.push({
                name: SITE_NAME + " | " + (k.label || k.key),
                title: SITE_NAME + (isTv ? " S" + s + "E" + e : "") + " | " + (st.label || kind) + " - " + q,
                url: st.url,
                quality: q,
                headers: { "User-Agent": UA, "Referer": base + "/" }
              });
            });
            return rows;
          }).catch(function () { return rows; });
        });
      });
      return chain.then(function (rows) {
        console.log("[" + SITE_NAME + "] returning " + rows.length + " stream(s)");
        return rows;
      });
    });
  }).catch(function (error) {
    console.log("[" + SITE_NAME + "] failed: " + (error && error.message ? error.message : error));
    return [];
  });
}

function onSettings() {
  return Promise.resolve([
    {
      key: "baseUrl",
      title: "Movish base URL (optional)",
      label: "Movish base URL (optional)",
      type: "text",
      default: "",
      description: "Leave blank to use built-in mirrors. Use when the site rotates domains."
    }
  ]);
}

module.exports = { getStreams: getStreams, onSettings: onSettings };
