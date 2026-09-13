#!/usr/bin/env node
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};
// v1.1.0: Nuvio runtimes do not bundle npm modules - the old top-level
// require("axios")/require("cheerio") threw at load time and the whole
// provider silently died. Real modules are used when present (node/tests);
// otherwise compact fetch-based shims keep the extractor alive everywhere.
var axios;
try { axios = require("axios"); } catch (e) {
  axios = {
    get: function (url, cfg) {
      var opts = { headers: (cfg && cfg.headers) || {}, method: "GET" };
      return fetch(url, opts).then(function (res) {
        return res.text().then(function (text) {
          var data = text;
          try {
            var t = String(text).replace(/^\uFEFF/, "").trim();
            if (t && (t.charAt(0) === "{" || t.charAt(0) === "[")) data = JSON.parse(t);
          } catch (e2) { /* keep text */ }
          return { status: res.status, data: data, headers: res.headers };
        });
      });
    }
  };
}
var cheerio;
try { cheerio = require("cheerio"); } catch (e) {
  // Mini cheerio: enough selector/attr/text surface for the FMovies-family
  // pages this provider scrapes (.flw-item grids, a.link-item server lists).
  cheerio = (function () {
    function parseAttrs(s) {
      var attrs = {}, re = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*=\s*("([^"]*)"|'([^']*)'|([^\s"'>]+))/g, m;
      while ((m = re.exec(s)) !== null) attrs[m[1].toLowerCase()] = m[3] != null ? m[3] : (m[4] != null ? m[4] : m[5]);
      return attrs;
    }
    function makeEl(tag, attrs, parent) {
      return { __isEl: true, tag: String(tag || "").toLowerCase(), attrs: attrs || {}, children: [], parent: parent || null, text: "" };
    }
    function parseHtml(html) {
      var root = makeEl("#root", {}, null);
      var stack = [root];
      var re = /<\/([a-zA-Z][a-zA-Z0-9]*)\s*>|<([a-zA-Z][a-zA-Z0-9]*)((?:\s+[^<>]*?)?)\/?>|([^<]+)/g, m;
      while ((m = re.exec(html)) !== null) {
        if (m[1]) { // close tag
          var cur = stack[stack.length - 1];
          if (cur.tag === m[1].toLowerCase() && stack.length > 1) stack.pop();
          continue;
        }
        if (m[2]) { // open/self-close tag
          var el = makeEl(m[2], parseAttrs(m[3] || ""), stack[stack.length - 1]);
          stack[stack.length - 1].children.push(el);
          var selfClose = /\/\s*>\s*$/.test(m[0]);
          if (!selfClose && !/^(area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)$/.test(el.tag)) {
            stack.push(el);
          }
          continue;
        }
        if (m[4]) { // text node
          var top = stack[stack.length - 1];
          if (top.text) top.text += " ";
          top.text += m[4].replace(/\s+/g, " ");
        }
      }
      return root;
    }
    function elText(el) {
      var out = el.text || "";
      for (var i = 0; i < el.children.length; i++) out += elText(el.children[i]);
      return out.replace(/\s+/g, " ").trim();
    }
    function matchesSimple(el, tok) {
      var m = tok.match(/^([a-zA-Z][a-zA-Z0-9-]*)?((?:[.#][a-zA-Z0-9_-]+)*)$/);
      if (!m) return false;
      if (m[1] && el.tag !== m[1].toLowerCase()) return false;
      var classes = m[2] ? m[2].match(/[.#][a-zA-Z0-9_-]+/g) || [] : [];
      var classList = String(el.attrs.class || el.attrs.Class || "").split(/\s+/);
      for (var i = 0; i < classes.length; i++) {
        var t = classes[i];
        if (t.charAt(0) === ".") { if (classList.indexOf(t.slice(1)) === -1) return false; }
        else if (t.charAt(0) === "#") { if (el.attrs.id !== t.slice(1)) return false; }
      }
      return true;
    }
    function matchSelector(el, selector) {
      // supports "tag.class > child" and "tag .descendant" chains
      var parts = selector.split(/\s*>\s*|\s+/).filter(Boolean);
      var seps = selector.match(/\s*>\s*|\s+/g) || [];
      function walk(node, idx) {
        if (idx === parts.length) return [node];
        var out = [];
        var wantChild = seps[idx] && seps[idx].indexOf(">") !== -1;
        for (var i = 0; i < node.children.length; i++) {
          var ch = node.children[i];
          if (matchesSimple(ch, parts[idx])) {
            out = out.concat(walk(ch, idx + 1));
          } else if (!wantChild) {
            out = out.concat(walk(ch, idx)); // descendant: keep looking deeper
          }
        }
        return out;
      }
      // "wantChild" semantics above only skip the matched node itself; deep
      // descendant search is handled by recursing without consuming the part.
      return walk(el, 0);
    }
    function wrap(list) {
      return {
        each: function (fn) { list.forEach(function (el, i) { fn(i, el); }); return this; },
        attr: function (name) { return list.length ? (list[0].attrs[String(name).toLowerCase()] != null ? list[0].attrs[String(name).toLowerCase()] : undefined) : undefined; },
        text: function () { return list.map(elText).join(" ").trim(); },
        find: function (sel) { var out = []; list.forEach(function (el) { out = out.concat(matchSelector(el, sel)); }); return wrap(out); },
        first: function () { return wrap(list.slice(0, 1)); },
        length: list.length
      };
    }
    function query(root, selector) {
      return wrap(matchSelector(root, String(selector).trim()));
    }
    return {
      load: function (html) {
        var root = parseHtml(String(html || ""));
        var $ = function (sel) {
          if (sel && sel.__isEl) return wrap([sel]);
          return query(root, sel);
        };
        return $;
      }
    };
  })();
}
var URL_;
try { URL_ = require("url").URL; } catch (e) { URL_ = (typeof globalThis !== "undefined" && globalThis.URL) || (typeof URL === "function" ? URL : null); }
const URL = URL_;
class MyFlixerExtractor {
  constructor() {
    this.mainUrl = "https://watch32.sx";
    this.videostrUrl = "https://videostr.net";
  }
  search(query) {
    return __async(this, null, function* () {
      try {
        const searchUrl = `${this.mainUrl}/search/${query.replace(/\s+/g, "-")}`;
        console.log(`Searching: ${searchUrl}`);
        const response = yield axios.get(searchUrl);
        const $ = cheerio.load(response.data);
        const results = [];
        $(".flw-item").each((i, element) => {
          const title = $(element).find("h2.film-name > a").attr("title");
          const link = $(element).find("h2.film-name > a").attr("href");
          const poster = $(element).find("img.film-poster-img").attr("data-src");
          if (title && link) {
            results.push({
              title,
              url: link.startsWith("http") ? link : `${this.mainUrl}${link}`,
              poster
            });
          }
        });
        console.log("Search results found:");
        results.forEach((result, index) => {
          console.log(`${index + 1}. ${result.title}`);
        });
        return results;
      } catch (error) {
        console.error("Search error:", error.message);
        return [];
      }
    });
  }
  getContentDetails(url) {
    return __async(this, null, function* () {
      try {
        console.log(`Getting content details: ${url}`);
        const response = yield axios.get(url);
        const $ = cheerio.load(response.data);
        const contentId = $(".detail_page-watch").attr("data-id");
        const name = $(".detail_page-infor h2.heading-name > a").text();
        const isMovie = url.includes("movie");
        if (isMovie) {
          return {
            type: "movie",
            name,
            data: `list/${contentId}`
          };
        } else {
          const episodes = [];
          const seasonsResponse = yield axios.get(`${this.mainUrl}/ajax/season/list/${contentId}`);
          const $seasons = cheerio.load(seasonsResponse.data);
          for (const season of $seasons("a.ss-item").toArray()) {
            const seasonId = $(season).attr("data-id");
            const seasonNum = $(season).text().replace("Season ", "");
            const episodesResponse = yield axios.get(`${this.mainUrl}/ajax/season/episodes/${seasonId}`);
            const $episodes = cheerio.load(episodesResponse.data);
            $episodes("a.eps-item").each((i, episode) => {
              const epId = $(episode).attr("data-id");
              const title = $(episode).attr("title");
              const match = title.match(/Eps (\d+): (.+)/);
              if (match) {
                episodes.push({
                  id: epId,
                  episode: parseInt(match[1]),
                  name: match[2],
                  season: parseInt(seasonNum.replace("Series", "").trim()),
                  data: `servers/${epId}`
                });
              }
            });
          }
          return {
            type: "series",
            name,
            episodes
          };
        }
      } catch (error) {
        console.error("Content details error:", error.message);
        return null;
      }
    });
  }
  getServerLinks(data) {
    return __async(this, null, function* () {
      try {
        console.log(`Getting server links: ${data}`);
        const response = yield axios.get(`${this.mainUrl}/ajax/episode/${data}`);
        const $ = cheerio.load(response.data);
        const servers = [];
        $("a.link-item").each((i, element) => {
          const linkId = $(element).attr("data-linkid") || $(element).attr("data-id");
          if (linkId) {
            servers.push(linkId);
          }
        });
        return servers;
      } catch (error) {
        console.error("Server links error:", error.message);
        return [];
      }
    });
  }
  getSourceUrl(linkId) {
    return __async(this, null, function* () {
      try {
        console.log(`Getting source URL for linkId: ${linkId}`);
        const response = yield axios.get(`${this.mainUrl}/ajax/episode/sources/${linkId}`);
        return response.data.link;
      } catch (error) {
        console.error("Source URL error:", error.message);
        return null;
      }
    });
  }
  extractVideostrM3u8(url) {
    return __async(this, null, function* () {
      try {
        console.log(`Extracting from Videostr: ${url}`);
        const headers = {
          "Accept": "*/*",
          "X-Requested-With": "XMLHttpRequest",
          "Referer": this.videostrUrl,
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        };
        const id = url.split("/").pop().split("?")[0];
        const embedResponse = yield axios.get(url, { headers });
        const embedHtml = embedResponse.data;
        let nonce = embedHtml.match(/\b[a-zA-Z0-9]{48}\b/);
        if (nonce) {
          nonce = nonce[0];
        } else {
          const matches = embedHtml.match(/\b([a-zA-Z0-9]{16})\b.*?\b([a-zA-Z0-9]{16})\b.*?\b([a-zA-Z0-9]{16})\b/);
          if (matches) {
            nonce = matches[1] + matches[2] + matches[3];
          }
        }
        if (!nonce) {
          throw new Error("Could not extract nonce");
        }
        console.log(`Extracted nonce: ${nonce}`);
        const apiUrl = `${this.videostrUrl}/embed-1/v3/e-1/getSources?id=${id}&_k=${nonce}`;
        console.log(`API URL: ${apiUrl}`);
        const sourcesResponse = yield axios.get(apiUrl, { headers });
        const sourcesData = sourcesResponse.data;
        if (!sourcesData.sources) {
          throw new Error("No sources found in response");
        }
        let m3u8Url = sourcesData.sources;
        if (!m3u8Url.includes(".m3u8")) {
          console.log("Sources are encrypted, attempting to decrypt...");
          const keyResponse = yield axios.get("https://raw.githubusercontent.com/yogesh-hacker/MegacloudKeys/refs/heads/main/keys.json");
          const key = keyResponse.data.vidstr;
          if (!key) {
            throw new Error("Could not get decryption key");
          }
          const decodeUrl = "https://script.google.com/macros/s/AKfycbx-yHTwupis_JD0lNzoOnxYcEYeXmJZrg7JeMxYnEZnLBy5V0--UxEvP-y9txHyy1TX9Q/exec";
          const fullUrl = `${decodeUrl}?encrypted_data=${encodeURIComponent(m3u8Url)}&nonce=${encodeURIComponent(nonce)}&secret=${encodeURIComponent(key)}`;
          const decryptResponse = yield axios.get(fullUrl);
          const decryptedData = decryptResponse.data;
          const fileMatch = decryptedData.match(/"file":"(.*?)"/);
          if (fileMatch) {
            m3u8Url = fileMatch[1];
          } else {
            throw new Error("Could not extract video URL from decrypted response");
          }
        }
        console.log(`Final M3U8 URL: ${m3u8Url}`);
        if (!m3u8Url.includes("megacdn.co")) {
          console.log("Skipping non-megacdn link");
          return null;
        }
        const qualities = yield this.parseM3U8Qualities(m3u8Url);
        return {
          m3u8Url,
          qualities,
          headers: {
            "Referer": "https://videostr.net/",
            "Origin": "https://videostr.net/"
          }
        };
      } catch (error) {
        console.error("Videostr extraction error:", error.message);
        return null;
      }
    });
  }
  parseM3U8Qualities(masterUrl) {
    return __async(this, null, function* () {
      var _a;
      try {
        const response = yield axios.get(masterUrl, {
          headers: {
            "Referer": "https://videostr.net/",
            "Origin": "https://videostr.net/"
          }
        });
        const playlist = response.data;
        const qualities = [];
        const lines = playlist.split("\n");
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim();
          if (line.startsWith("#EXT-X-STREAM-INF:")) {
            const nextLine = (_a = lines[i + 1]) == null ? void 0 : _a.trim();
            if (nextLine && !nextLine.startsWith("#")) {
              const resolutionMatch = line.match(/RESOLUTION=(\d+x\d+)/);
              const bandwidthMatch = line.match(/BANDWIDTH=(\d+)/);
              const resolution = resolutionMatch ? resolutionMatch[1] : "Unknown";
              const bandwidth = bandwidthMatch ? parseInt(bandwidthMatch[1]) : 0;
              let quality = "Unknown";
              if (resolution.includes("1920x1080"))
                quality = "1080p";
              else if (resolution.includes("1280x720"))
                quality = "720p";
              else if (resolution.includes("640x360"))
                quality = "360p";
              else if (resolution.includes("854x480"))
                quality = "480p";
              qualities.push({
                quality,
                resolution,
                bandwidth,
                url: nextLine.startsWith("http") ? nextLine : new URL(nextLine, masterUrl).href
              });
            }
          }
        }
        qualities.sort((a, b) => b.bandwidth - a.bandwidth);
        return qualities;
      } catch (error) {
        console.error("Error parsing M3U8 qualities:", error.message);
        return [];
      }
    });
  }
  extractM3u8Links(query, episodeNumber = null, seasonNumber = null) {
    return __async(this, null, function* () {
      try {
        const searchResults = yield this.search(query);
        if (searchResults.length === 0) {
          console.log("No search results found");
          return [];
        }
        console.log(`Found ${searchResults.length} results`);
        let selectedResult = searchResults.find(
          (result) => result.title.toLowerCase() === query.toLowerCase()
        );
        if (!selectedResult) {
          const queryWords = query.toLowerCase().split(" ");
          selectedResult = searchResults.find((result) => {
            const titleLower = result.title.toLowerCase();
            return queryWords.every((word) => titleLower.includes(word));
          });
        }
        if (!selectedResult) {
          selectedResult = searchResults[0];
        }
        console.log(`Selected: ${selectedResult.title}`);
        const contentDetails = yield this.getContentDetails(selectedResult.url);
        if (!contentDetails) {
          console.log("Could not get content details");
          return [];
        }
        let dataToProcess = [];
        if (contentDetails.type === "movie") {
          dataToProcess.push(contentDetails.data);
        } else {
          let episodes = contentDetails.episodes;
          if (seasonNumber) {
            episodes = episodes.filter((ep) => ep.season === seasonNumber);
          }
          if (episodeNumber) {
            episodes = episodes.filter((ep) => ep.episode === episodeNumber);
          }
          if (episodes.length === 0) {
            console.log("No matching episodes found");
            return [];
          }
          const targetEpisode = episodeNumber ? episodes[0] : episodes[0];
          console.log(`Selected episode: S${targetEpisode.season}E${targetEpisode.episode} - ${targetEpisode.name}`);
          dataToProcess.push(targetEpisode.data);
        }
        const allM3u8Links = [];
        const allPromises = [];
        for (const data of dataToProcess) {
          const serverLinksPromise = this.getServerLinks(data).then((serverLinks) => __async(this, null, function* () {
            console.log(`Found ${serverLinks.length} servers`);
            const linkPromises = serverLinks.map((linkId) => __async(this, null, function* () {
              try {
                const sourceUrl = yield this.getSourceUrl(linkId);
                if (!sourceUrl)
                  return null;
                console.log(`Source URL: ${sourceUrl}`);
                if (sourceUrl.includes("videostr.net")) {
                  const result = yield this.extractVideostrM3u8(sourceUrl);
                  if (result) {
                    return {
                      source: "videostr",
                      m3u8Url: result.m3u8Url,
                      qualities: result.qualities,
                      headers: result.headers
                    };
                  }
                }
                return null;
              } catch (error) {
                console.error(`Error processing link ${linkId}:`, error.message);
                return null;
              }
            }));
            return Promise.all(linkPromises);
          }));
          allPromises.push(serverLinksPromise);
        }
        const results = yield Promise.all(allPromises);
        for (const serverResults of results) {
          for (const result of serverResults) {
            if (result) {
              allM3u8Links.push(result);
            }
          }
        }
        return allM3u8Links;
      } catch (error) {
        console.error("Extraction error:", error.message);
        return [];
      }
    });
  }
}
if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.log('Usage: node myflixer-extractor.js "<search query>" [episode] [season]');
    console.log("Examples:");
    console.log('  node myflixer-extractor.js "Avengers Endgame"');
    console.log('  node myflixer-extractor.js "Breaking Bad" 1 1  # Season 1, Episode 1');
    process.exit(1);
  }
  const query = args[0];
  const episode = args[1] ? parseInt(args[1]) : null;
  const season = args[2] ? parseInt(args[2]) : null;
  const extractor = new MyFlixerExtractor();
  extractor.extractM3u8Links(query, episode, season).then((links) => {
    if (links.length === 0) {
      console.log("No M3U8 links found");
    } else {
      console.log("\n=== EXTRACTED M3U8 LINKS ===");
      links.forEach((link, index) => {
        console.log(`
Link ${index + 1}:`);
        console.log(`Source: ${link.source}`);
        console.log(`Master M3U8 URL: ${link.m3u8Url}`);
        console.log(`Headers: ${JSON.stringify(link.headers, null, 2)}`);
        if (link.qualities && link.qualities.length > 0) {
          console.log("Available Qualities:");
          link.qualities.forEach((quality, qIndex) => {
            console.log(`  ${qIndex + 1}. ${quality.quality} (${quality.resolution}) - ${Math.round(quality.bandwidth / 1e3)}kbps`);
            console.log(`     URL: ${quality.url}`);
          });
        }
      });
    }
  }).catch((error) => {
    console.error("Error:", error.message);
    process.exit(1);
  });
}
// v1.1.0 adapter: Nuvio's manifest contract needs a getStreams(tmdbId, ...)
// function - the file previously exported the bare extractor class (and the
// npm requires above crashed load), so the provider never produced rows.
var MYFLIXER_TMDB_KEY = "439c478a771f35c05022f9feabcca01c";
function myflixerTmdbTitle(tmdbId, mediaType) {
  var endpoint = mediaType === "tv" ? "tv" : "movie";
  var url = "https://api.themoviedb.org/3/" + endpoint + "/" + encodeURIComponent(tmdbId) +
    "?api_key=" + MYFLIXER_TMDB_KEY;
  return fetch(url, { headers: { Accept: "application/json" } })
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (data) {
      if (!data) return "";
      return (mediaType === "tv" ? (data.name || data.original_name) : (data.title || data.original_title)) || "";
    })
    .catch(function () { return ""; });
}

if (typeof MyFlixerExtractor !== "undefined") {
  MyFlixerExtractor.prototype.getStreams = function (tmdbId, mediaType, season, episode) {
    var self = this;
    var isTv = mediaType === "tv" || mediaType === "series" || mediaType === "tvshow";
    return myflixerTmdbTitle(tmdbId, isTv ? "tv" : "movie").then(function (title) {
      if (!title) return Promise.resolve([]);
      return self.extractM3u8Links(title, isTv ? (parseInt(episode, 10) || 1) : null, isTv ? (parseInt(season, 10) || 1) : null);
    }).then(function (links) {
      var rows = [];
      (links || []).forEach(function (link) {
        if (!link || !link.m3u8Url) return;
        var src = String(link.source || "MyFlixer").charAt(0).toUpperCase() + String(link.source || "MyFlixer").slice(1);
        var label = title;
        if (isTv && (season || episode)) {
          label += " S" + String(season || 1).padStart(2, "0") + "E" + String(episode || 1).padStart(2, "0");
        }
        var emitted = false;
        (link.qualities || []).forEach(function (q) {
          if (!q || !q.url) return;
          emitted = true;
          rows.push({
            name: "MyFlixer | " + src + " " + (q.quality || "Auto"),
            title: label + " | " + (q.quality || "Auto") + " | MyFlixer " + src,
            url: q.url,
            quality: q.quality || "Auto",
            headers: link.headers || {}
          });
        });
        if (!emitted) {
          rows.push({
            name: "MyFlixer | " + src,
            title: label + " | Auto | MyFlixer " + src,
            url: link.m3u8Url,
            quality: "Auto",
            headers: link.headers || {}
          });
        }
      });
      return rows;
    }).catch(function () { return []; });
  };
  module.exports = { getStreams: function (tmdbId, mediaType, season, episode) {
    try {
      return Promise.resolve(new MyFlixerExtractor().getStreams(tmdbId, mediaType, season, episode));
    } catch (e) { return Promise.resolve([]); }
  }, onSettings: function () { return Promise.resolve([]); } };
} else {
  module.exports = MyFlixerExtractor;
}

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
  var PROVIDER = "myflixer";
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
