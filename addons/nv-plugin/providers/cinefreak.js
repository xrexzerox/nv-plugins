"use strict";
// cinefreak.js - eclipsia novus.js source (codeberg eclipsia/nuvio-plugin v10.0.0), readable netmirror-style build for pack 4.43.0.
// Device fixes applied: atob, lite.
// Subtitles: passed through as upstream emits them (English/Tagalog tracks kept when upstream provides).

/* device guard: Nuvio realm may lack global atob (pack house fix, same as netmirror v17) */
if (typeof globalThis.atob !== "function") {
  globalThis.atob = function (input) {
    var B64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    var str = String(input).replace(/[\t\n\f\r ]/g, "").replace(/=+$/, "");
    var out = "";
    var bits = 0;
    var acc = 0;
    for (var i = 0; i < str.length; i++) {
      var c = B64.indexOf(str.charAt(i));
      if (c < 0 || c === 64) continue;
      acc = (acc << 6) | c;
      bits += 6;
      if (bits >= 8) {
        bits -= 8;
        out += String.fromCharCode((acc >> bits) & 0xff);
      }
    }
    return out;
  };
}

/* ===== nv cheerio-lite v2 (pack 4.43.0) =====================================
   Device-safe replacement for require("cheerio") - the Nuvio ES2020 realm
   ships no require() and no node modules. Covers the selector surface the
   Eclipsia sources actually use: tag / #id / .class / tag.class / [attr],
   [attr="v"], [attr*="v"], [attr^="v"], [attr$="v"], descendant chains,
   child combinator (h5 > a) and comma lists; methods: each/attr/text/html/
   find/filter/map/get/first/length plus $.html() for the whole document.
   Parity-tested in the sandbox against real cheerio on live fixtures.
========================================================================== */
var __nvCheerioLite = (function () {
  var VOID = { br:1, img:1, input:1, meta:1, link:1, hr:1, source:1, area:1, base:1, col:1, embed:1, track:1, wbr:1 };

  /* entity decoding (cheerio parity: text/attr values come back decoded) */
  var ENT = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: "\u00a0", copy: "\u00a9", reg: "\u00ae", hellip: "\u2026", mdash: "\u2014", ndash: "\u2013", rsquo: "\u2019", lsquo: "\u2018", ldquo: "\u201c", rdquo: "\u201d" };
  function decodeEntities(s) {
    return String(s).replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z][a-zA-Z0-9]*);/g, function (m, g) {
      if (g.charAt(0) === "#") {
        var num = (g.charAt(1) === "x" || g.charAt(1) === "X") ? parseInt(g.slice(2), 16) : parseInt(g.slice(1), 10);
        if (!isFinite(num) || num < 0 || num > 0x10ffff) return m;
        if (num > 0xffff) { num -= 0x10000; return String.fromCharCode(0xd800 + (num >> 10), 0xdc00 + (num & 0x3ff)); }
        return String.fromCharCode(num);
      }
      return ENT[g] !== undefined ? ENT[g] : m;
    });
  }

  function parseHtml(html) {
    var src = String(html || "")
      .replace(/<!--[\s\S]*?-->/g, "")
      .replace(/<(script|style)\b[\s\S]*?<\/\1>/gi, "");
    var root = { tag: "#root", attrs: {}, children: [], parent: null };
    var stack = [root];
    var re = /<([a-zA-Z][a-zA-Z0-9]*)((?:\s+[^<>]*?)?)(\/?)>|<\/([a-zA-Z][a-zA-Z0-9]*)\s*>|([^<]+)/g;
    var m;
    while ((m = re.exec(src)) !== null) {
      if (m[1]) {
        var tag = m[1].toLowerCase();
        var node = { tag: tag, attrs: {}, children: [], parent: stack[stack.length - 1] };
        var are = /([a-zA-Z_:][a-zA-Z0-9_:.\-]*)\s*(?:=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g, am;
        while ((am = are.exec(m[2] || "")) !== null) {
          node.attrs[am[1].toLowerCase()] = decodeEntities(am[2] !== undefined ? am[2] : (am[3] !== undefined ? am[3] : (am[4] !== undefined ? am[4] : "")));
        }
        node.parent.children.push(node);
        if (!m[3] && !VOID[tag]) stack.push(node);
      } else if (m[4]) {
        var ct = m[4].toLowerCase();
        for (var k = stack.length - 1; k > 0; k--) {
          if (stack[k].tag === ct) { stack.length = k; break; }
        }
      } else if (m[5]) {
        if (/\S/.test(m[5])) {
          var tp = stack[stack.length - 1];
          tp.children.push({ tag: "#text", attrs: {}, children: [], parent: tp, text: decodeEntities(m[5]) });
        }
      }
    }
    return root;
  }

  /* ---------- serialization (for .html()) ---------- */
  function escapeHtml(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
  function serializeEl(el) {
    if (el.tag === "#text") return escapeHtml(el.text);
    var out = "<" + el.tag, k;
    for (k in el.attrs) out += " " + k + '="' + escapeHtml(el.attrs[k]).replace(/"/g, "&quot;") + '"';
    out += ">";
    if (VOID[el.tag]) return out;
    var i;
    for (i = 0; i < el.children.length; i++) out += serializeEl(el.children[i]);
    return out + "</" + el.tag + ">";
  }
  function innerHtml(el) {
    var out = "", i;
    for (i = 0; i < el.children.length; i++) out += serializeEl(el.children[i]);
    return out;
  }

  /* ---------- selectors ---------- */
  function parseCompound(tok) {
    var c = { tag: "*", id: null, classes: [], attrs: [] };
    var re = /([a-zA-Z][a-zA-Z0-9-]*|\*)|#([a-zA-Z0-9_-]+)|\.([a-zA-Z0-9_-]+)|\[([a-zA-Z_:][-a-zA-Z0-9_:.]*)(?:([*^$|]?=)\s*(?:"([^"]*)"|'([^']*)'|([^\]\s]*)))?\]/g;
    var mm;
    while ((mm = re.exec(tok)) !== null) {
      if (mm[1]) c.tag = mm[1].toLowerCase();
      else if (mm[2]) c.id = mm[2];
      else if (mm[3]) c.classes.push(mm[3]);
      else if (mm[4]) c.attrs.push({
        name: mm[4].toLowerCase(),
        op: mm[5] || null,
        val: mm[6] !== undefined ? mm[6] : (mm[7] !== undefined ? mm[7] : (mm[8] !== undefined ? mm[8] : ""))
      });
    }
    return c;
  }
  function matchCompound(el, c) {
    if (c.tag !== "*" && el.tag !== c.tag) return false;
    if (c.id && el.attrs.id !== c.id) return false;
    if (c.classes.length) {
      var cls = (el.attrs.class || "").split(/\s+/), i;
      for (i = 0; i < c.classes.length; i++) if (cls.indexOf(c.classes[i]) === -1) return false;
    }
    var j, a, v;
    for (j = 0; j < c.attrs.length; j++) {
      a = c.attrs[j];
      v = el.attrs[a.name];
      if (v === undefined) return false;
      if (a.op === "=" && v !== a.val) return false;
      if (a.op === "*=" && v.indexOf(a.val) === -1) return false;
      if (a.op === "^=" && v.indexOf(a.val) !== 0) return false;
      if (a.op === "$=" && v.slice(-a.val.length) !== a.val) return false;
    }
    return true;
  }
  function matchesPart(el, part) {
    var raw = String(part || "").trim();
    if (!raw) return false;
    var pieces = raw.replace(/>/g, " > ").split(/\s+/);
    var toks = [], i, pendingChild = false;
    for (i = 0; i < pieces.length; i++) {
      if (pieces[i] === ">") { pendingChild = true; continue; }
      toks.push({ c: parseCompound(pieces[i]), childNext: pendingChild });
      pendingChild = false;
    }
    var idx = toks.length - 1;
    if (!matchCompound(el, toks[idx].c)) return false;
    var node = el.parent;
    idx--;
    while (idx >= 0) {
      if (!node || node.tag === "#root") return false;
      if (matchCompound(node, toks[idx].c)) {
        idx--;
        node = node.parent;
      } else {
        if (toks[idx + 1].childNext) return false;
        node = node.parent;
      }
    }
    return true;
  }
  function selectAll(scope, sel) {
    var parts = String(sel || "").split(","), out = [];
    (function walk(node) {
      for (var i = 0; i < node.children.length; i++) {
        var c = node.children[i];
        if (c.tag === "#text") continue;
        for (var p = 0; p < parts.length; p++) {
          if (matchesPart(c, parts[p])) { out.push(c); break; }
        }
        walk(c);
      }
    })(scope);
    return out;
  }
  function collectText(el) {
    var out = "", i;
    for (i = 0; i < el.children.length; i++) {
      var c = el.children[i];
      out += (c.tag === "#text") ? c.text : collectText(c);
    }
    return out;
  }

  /* ---------- collection / $ ---------- */
  function wrapEl(el) {
    return {
      attr: function (n) {
        var v = el.attrs[String(n || "").toLowerCase()];
        return v === undefined ? undefined : String(v);
      },
      text: function () { return collectText(el); },
      html: function () { return innerHtml(el); },
      find: function (sel) { return makeColl(selectAll(el, sel)); }
    };
  }
  function makeColl(els) {
    var coll = {
      length: els.length,
      each: function (fn) { for (var i = 0; i < els.length; i++) fn(i, els[i]); return coll; },
      attr: function (n) { return els.length ? wrapEl(els[0]).attr(n) : undefined; },
      text: function () { var o = "", i; for (i = 0; i < els.length; i++) o += collectText(els[i]); return o; },
      html: function () { return els.length ? innerHtml(els[0]) : ""; },
      find: function (sel) {
        var all = [], i;
        for (i = 0; i < els.length; i++) all = all.concat(selectAll(els[i], sel));
        return makeColl(all);
      },
      filter: function (fn) {
        var out = [], i;
        for (i = 0; i < els.length; i++) if (fn(i, els[i])) out.push(els[i]);
        return makeColl(out);
      },
      map: function (fn) {
        var out = [], i, r;
        for (i = 0; i < els.length; i++) {
          r = fn(i, els[i]);
          if (r && typeof r.length === "number" && typeof r !== "string") out = out.concat(r); /* cheerio flattens array results */
          else out.push(r);
        }
        return makeColl(out);
      },
      get: function () { return els; },
      first: function () { return makeColl(els.length ? [els[0]] : []); }
    };
    return coll;
  }

  return {
    load: function (html) {
      var root = parseHtml(html);
      var $ = function (selOrEl, ctx) {
        if (selOrEl && selOrEl.tag) return makeColl([selOrEl]);
        var scope = root;
        if (ctx && ctx.tag) scope = ctx;
        else if (ctx && ctx.length && ctx[0] && ctx[0].tag) scope = ctx[0];
        return makeColl(selectAll(scope, selOrEl));
      };
      $.html = function () {
        var out = "", i;
        for (i = 0; i < root.children.length; i++) out += serializeEl(root.children[i]);
        return out;
      };
      $.text = function () { return collectText(root); };
      return $;
    }
  };
})();

var cheerio = __nvCheerioLite;
const PROVIDER_NAME = "CineFreak";
const BASE_URL = "https://cinefreak.net";
const TMDB_API = "https://api.themoviedb.org/3";
const TMDB_KEY = "6dc830f9624b43261325bed3bf7d0dfa";
const HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36",
  "Cookie": "xla=s4t",
};

async function fetchHtml(url, extra) {
  try {
    const res = await fetch(url, { headers: Object.assign({}, HEADERS, extra) });
    return res.ok ? await res.text() : null;
  } catch { return null; }
}

async function fetchJson(url, extra) {
  try {
    const res = await fetch(url, { headers: Object.assign({}, HEADERS, extra) });
    return res.ok ? await res.json() : null;
  } catch { return null; }
}

function originOf(url) {
  try { const u = new URL(url); return u.protocol + "//" + u.host; } catch { return ""; }
}

function decodeBase64Url(str) {
  try {
    return atob(str.replace(/-/g, "+").replace(/_/g, "/").replace(/\s/g, ""));
  } catch { return null; }
}

function toQualityLabel(raw) {
  const m = /(\d{3,4})[pP]/.exec(raw || "");
  if (!m) return "Unknown";
  const n = parseInt(m[1], 10);
  if (n >= 2160) return "2160p";
  if (n >= 1080) return "1080p";
  if (n >= 720) return "720p";
  if (n >= 480) return "480p";
  return "Unknown";
}

function isHighQuality(quality) {
  return quality === "1080p" || quality === "2160p";
}

function formatTitle(releaseTitle, size, quality) {
  const t = String(releaseTitle || "");

  const line1Parts = [];
  if (quality) line1Parts.push(quality);
  if (size && size !== "Unknown") line1Parts.push(size);

  const line2Parts = [];

  const src = /bluray|blu\-ray|bdrip/i.test(t) ? "Blu-ray"
    : /hdrip|webrip/i.test(t) ? "WEBRip"
      : /web\-?dl/i.test(t) ? "WEB-DL"
        : "";
  if (src) line2Parts.push(src);

  if (/imax/i.test(t)) line2Parts.push("IMAX");

  let audio = "";
  const am = t.match(/(TrueHD\s*7\.1|DDP\s*7\.1|DDP\s*5\.1|DD\s*5\.1|5\.1|AAC)/i);
  if (am) {
    audio = am[1].toUpperCase().replace(/\s+/g, "");
    if (audio === "5.1") audio = "DDP5.1";
    if (audio.includes("TRUEHD")) audio = "TrueHD 7.1";
  } else if (/dolby\s*digital/i.test(t)) {
    audio = "Dolby Digital";
  }
  if (/atmos/i.test(t)) audio = audio ? `${audio} • Atmos` : "Atmos";
  if (audio) line2Parts.push(audio);

  const range = /dolby\s*vision|dovi/i.test(t) ? "Dolby Vision"
    : /hdr10/i.test(t) ? "HDR10"
      : /hdr/i.test(t) ? "HDR"
        : /10bit|10\-bit/i.test(t) ? "10-Bit"
          : /\bsdr\b/i.test(t) ? "SDR"
            : "";
  if (range) line2Parts.push(range);

  const codec = /hevc|x265|h\.?265/i.test(t) ? "H.265"
    : /x264|h\.?264/i.test(t) ? "H.264"
      : "";
  if (codec) line2Parts.push(codec);

  const line1 = line1Parts.join(" • ");
  const line2 = line2Parts.join(" • ");
  return [line1, line2].filter(Boolean).join("\n");
}

function dedupe(streams) {
  const seen = new Set();
  return streams.filter(s => s.url && !seen.has(s.url) && seen.add(s.url));
}

async function tmdbLookup(tmdbId, mediaType) {
  const ep = mediaType === "tv" ? "tv" : "movie";
  const data = await fetchJson(`${TMDB_API}/${ep}/${tmdbId}?api_key=${TMDB_KEY}`);
  if (!data) return null;
  return {
    title: (mediaType === "tv" ? data.name : data.title) || "",
    isTv: mediaType === "tv",
  };
}

async function searchCinefreak(query) {
  const data = await fetchJson(`${BASE_URL}/search-api.php?q=${encodeURIComponent(query)}&pg=1`);
  return (data && Array.isArray(data.results)) ? data.results : [];
}

function selectResult(results, title, mediaType) {
  const norm = title.toLowerCase().trim();

  function looksLikeTv(r) {
    const t = r.t.toLowerCase();
    return t.includes("season") || t.includes("series") || t.includes("episode");
  }

  for (const r of results) {
    if (mediaType === "tv" && !looksLikeTv(r)) continue;
    if (mediaType === "movie" && looksLikeTv(r)) continue;
    const rn = r.t.toLowerCase().replace(/\s*season\s*\d+/gi, "").replace(/\s*\(.*?\)/g, "").trim();
    // v4.50.0 ACCURACY FIX: bidirectional includes() + the results[0]
    // fallback could stream the wrong title. Exact match, or the result
    // contains EVERY wanted token with no fewer tokens (subtitle allowed).
    if (rn === norm) return r;
    var nt = norm.split(/\s+/).filter(Boolean);
    var rt = rn.split(/\s+/).filter(Boolean);
    if (nt.length && rt.length >= nt.length && nt.every(function (w) { return rt.includes(w); })) return r;
  }

  // v4.50.0: no blind first-result fallback - null means "nothing matched"
  // and the caller answers 0 rows.
  return null;
}

async function extractCineCloud(url, qualityHint) {
  const streams = [];
  try {
    const html = await fetchHtml(url);
    if (!html) return streams;
    const $ = cheerio.load(html);
    const quality = toQualityLabel(qualityHint);

    if (!isHighQuality(quality)) return streams;

    let releaseTitle = "";
    const titleCandidates = [
      $("h1").first().text(),
      $("h2").first().text(),
      $("title").text(),
      $(".file-name, .filename, .release-name, .movie-title").first().text(),
    ];
    for (const c of titleCandidates) {
      const clean = c.trim();
      if (clean && /\d{3,4}p|bluray|webrip|web-?dl|x26[45]|hevc|aac|ddp/i.test(clean)) {
        releaseTitle = clean;
        break;
      }
    }

    let fileSize = "";
    $("tr").each((_, row) => {
      if (fileSize) return;
      const first = $(row).find("td").first();
      if (first.text().toLowerCase().includes("file size")) {
        const right = $(row).find("td.text-right");
        if (right.length) fileSize = right.last().text().trim();
      }
    });

    const base = originOf(url);
    const resumeJobs = [];
    const sizeLabel = formatTitle(releaseTitle, fileSize, quality);

    $("a[href]").each((_, el) => {
      const text = $(el).text().trim();
      const href = ($(el).attr("href") || "").trim();
      if (!href) return;
      const fullHref = href.startsWith("http") ? href : base + href;

      if (/fast\s+cloud/i.test(text) || /\[fsl\]/i.test(text)) {
        streams.push({
          url: fullHref,
          title: `${PROVIDER_NAME} • FSL`,
          size: sizeLabel,
          headers: { Referer: url },
        });
      } else if (/cloud\s*\[resumable\]/i.test(text)) {
        resumeJobs.push(fullHref);
      }
    });

    const resumeResults = await Promise.allSettled(
      resumeJobs.map(async resumeUrl => {
        const subHtml = await fetchHtml(resumeUrl, { Referer: url });
        if (!subHtml) return [];
        const $2 = cheerio.load(subHtml);
        const links = [];
        $2("a.download-now[href]").each((_, el) => {
          const link = ($2(el).attr("href") || "").trim();
          if (link) links.push(link);
        });
        return links;
      })
    );

    for (const r of resumeResults) {
      if (r.status !== "fulfilled") continue;
      for (const finalUrl of r.value) {
        streams.push({
          url: finalUrl,
          title: `${PROVIDER_NAME} \u2022 R2`,
          size: sizeLabel,
          headers: { Referer: url },
        });
      }
    }
  } catch { }
  return streams;
}

async function resolveLink(href, qualityHint) {
  try {
    const m = /[?&]id=([^&]+)/.exec(href);
    if (!m) return [];

    let encoded = m[1];
    try { encoded = decodeURIComponent(encoded); } catch { }

    const decoded = decodeBase64Url(encoded);
    if (!decoded) return [];

    const target = decoded.split("newgo32")[0].trim();
    if (!target || !target.startsWith("http")) return [];

    if (target.includes("cinecloud")) return extractCineCloud(target, qualityHint);

    return [];
  } catch { return []; }
}

function parseMovieLinks(html) {
  const $ = cheerio.load(html);
  const links = [];
  const counts = {};

  $("h4.movie-title").each((_, el) => {
    const qm = /(2160p|1080p|720p|480p)/i.exec($(el).text());
    if (!qm) return;
    const quality = qm[1];

    $(el).next().find("a.dlbtn-download[href]").each((_, a) => {
      const href = ($(a).attr("href") || "").trim();
      if (!href) return;
      counts[quality] = (counts[quality] || 0) + 1;
      const label = counts[quality] === 1 ? quality : `${quality}_${counts[quality]}`;
      links.push({ quality: label, href });
    });
  });

  return links;
}

function collectGenerateLinks(cardHtml) {
  const NEEDLE = "/generate.php?id=";
  const links = [];
  let pos = 0;

  while (true) {
    const hrefStart = cardHtml.indexOf(NEEDLE, pos);
    if (hrefStart === -1) break;

    const aOpen = cardHtml.lastIndexOf("<a ", hrefStart);
    if (aOpen === -1 || aOpen < pos) { pos = hrefStart + 1; continue; }

    const aClose = cardHtml.indexOf("</a>", hrefStart);
    if (aClose === -1) { pos = hrefStart + 1; continue; }

    const gtIdx = cardHtml.indexOf(">", hrefStart);
    if (gtIdx === -1 || gtIdx > aClose) { pos = aClose + 4; continue; }

    const label = cardHtml.substring(gtIdx + 1, aClose).trim();
    const quoteIdx = cardHtml.indexOf('"', hrefStart);
    if (quoteIdx === -1) { pos = aClose + 4; continue; }

    const snippet = cardHtml.substring(hrefStart, quoteIdx);
    const idMatch = snippet.match(/id=([a-zA-Z0-9+/=]+)/);
    if (!idMatch) { pos = aClose + 4; continue; }

    const hrefTagStart = cardHtml.lastIndexOf('href="', hrefStart);
    const fullHref = cardHtml
      .substring(hrefTagStart + 6, cardHtml.indexOf('"', hrefTagStart + 6))
      .replace(/&amp;/g, "&");

    const qm = /(2160p|1080p|720p|480p)/i.exec(label);
    const quality = qm ? qm[1] : (label || "Unknown");

    links.push({ href: fullHref || `${NEEDLE}${idMatch[1]}`, quality });
    pos = aClose + 4;
  }

  return links;
}

function parseEpisodeLinks(html, targetEpisode) {
  if (!html) return [];

  const cards = html.split('<div class="ep-card"');

  const EP_PATTERNS = [
    /episode-badge[^>]*>\s*(?:Episode\s*)?(\d+)/i,
    /ep-num[^>]*>\s*(\d+)\s*</i,
    /data-episode="(\d+)"/i,
    /\bEpisode\s+(\d+)\b/i,
  ];

  for (let i = 1; i < cards.length; i++) {
    for (const pat of EP_PATTERNS) {
      const m = cards[i].match(pat);
      if (m && parseInt(m[1], 10) === targetEpisode) {
        return collectGenerateLinks(cards[i]);
      }
    }
  }

  return [];
}


/* ==== v5.1.0: dataset + yagaverse stream-api lane (live-verified 2026-09-29) ====
   The detail page now embeds: const dataset = {"type":..,"sources":{"1080p":"id",..}};
   POST-free GET https://subtitle.yagaverse.net/stream-api.php?key=pushpa
     &id=<primary>&r480p=..&r720p=..&r1080p=..
   -> {videoUrl(signed R2 direct), resolutions:[{quality,url}]}.
   The old generate.php / aref] selectors are dead markup - kept as fallback. */
const CF_STREAM_API = "https://subtitle.yagaverse.net/stream-api.php";
const CF_STREAM_KEY = "pushpa";

function extractDataset(html) {
  try {
    const m = /const\s+dataset\s*=\s*(\{[\s\S]*?\});/.exec(html);
    if (!m) return null;
    return JSON.parse(m[1]);
  } catch { return null; }
}

async function fetchCinefreakStreamApi(sources, pageUrl) {
  try {
    if (!sources) return [];
    const params = [];
    params.push("key=" + encodeURIComponent(CF_STREAM_KEY));
    const order = ["480p", "720p", "1080p", "2160p"];
    let primary = null;
    for (const q of order) {
      if (sources[q]) { if (!primary) primary = sources[q]; params.push("r" + q + "=" + encodeURIComponent(sources[q])); }
    }
    if (!primary) primary = sources["720p"] || sources["1080p"] || sources["480p"] || Object.values(sources)[0];
    params.push("id=" + encodeURIComponent(primary));
    const url = CF_STREAM_API + "?" + params.join("&");
    const res = await fetchHtml(url, { Accept: "application/json", Referer: pageUrl });
    if (!res) return [];
    const data = JSON.parse(res);
    const rows = [];
    const seen = new Set();
    const pushRow = (u, q) => {
      if (!u || !/^https?:\/\//i.test(u) || seen.has(u)) return;
      seen.add(u);
      rows.push({
        name: PROVIDER_NAME + " \u2022 " + (q || "Direct"),
        title: PROVIDER_NAME + " \u2022 " + (q || "Direct") + " \u2022 instant play",
        quality: toQualityLabel(q || "720p"),
        url: u,
        headers: { Referer: BASE_URL + "/" }
      });
    };
    if (Array.isArray(data.resolutions)) {
      for (const r of data.resolutions) if (r && r.url) pushRow(r.url, r.quality || "720p");
    }
    if (data.videoUrl) pushRow(data.videoUrl, "Direct");
    return rows;
  } catch { return []; }
}

async function getStreams(tmdbId, mediaType, season, episode) {
  try {
    if (mediaType === "tv" && (season == null || episode == null)) return [];

    const tmdb = await tmdbLookup(tmdbId, mediaType);
    if (!tmdb || !tmdb.title) return [];

    const { title } = tmdb;

    const primaryQuery = (mediaType === "tv" && season != null)
      ? `${title} Season ${season}`
      : title;

    let results = await searchCinefreak(primaryQuery);
    let match = selectResult(results, title, mediaType);

    if (!match && mediaType === "tv") {
      results = await searchCinefreak(title);
      match = selectResult(results, title, mediaType);
    }

    if (!match) return [];

    const pageUrl = match.l.startsWith("http")
      ? match.l
      : `${BASE_URL}/${match.l.replace(/^\//, "")}/`;

    const html = await fetchHtml(pageUrl);
    if (!html) return [];

    /* v5.1.0 primary lane: dataset sources -> yagaverse stream-api (direct R2) */
    const dataset = extractDataset(html);
    if (dataset && dataset.sources) {
      const dsRows = await fetchCinefreakStreamApi(dataset.sources, pageUrl);
      if (dsRows.length) {
        const label = (mediaType === "tv" && season != null)
          ? " S" + season + (episode != null ? " (S" + season + " full-season file)" : "")
          : "";
        if (mediaType === "movie" || season === 1) {
          return dedupe(dsRows.map(r => ({
            ...r,
            title: r.title + label
          })));
        }
      }
    }

    const rawLinks = mediaType === "movie"
      ? parseMovieLinks(html)
      : parseEpisodeLinks(html, parseInt(episode, 10));

    if (!rawLinks.length) return [];

    const batches = await Promise.allSettled(
      rawLinks.map(({ quality, href }) => resolveLink(href, quality))
    );

    return dedupe(
      batches
        .filter(r => r.status === "fulfilled")
        .flatMap(r => r.value)
    );
  } catch { return []; }
}

module.exports = { getStreams };

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
    return Promise.all([rowsP.catch(function () { return []; }), subsP]).then(function (arr) {
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

