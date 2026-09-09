// workerd A/B verification for the asian-catalog worker bundle (v3.2.0).
// The shipped worker-bundle.js must boot healthy in REAL workerd and — new in
// v3.2.0 — serve GET /meta + /stream so every catalog row resolves to a
// playable stream (site-coded asian: ids + tmdb: title-search path).
import { Miniflare, Response } from "miniflare";
import { readFileSync, mkdirSync } from "node:fs";
import crypto from "node:crypto";

const BUNDLE = new URL("../addons/asian-catalog/worker-bundle.js", import.meta.url).pathname;

// canned kissasian listing (episode rows dedupe to series)
const KS_PAGE = (() => {
  let out = "";
  const rows = [
    ["crash-landing-on-you", "Crash Landing on You"],
    ["the-love-lab", "The Love Lab"],
    ["queen-of-tears", "Queen of Tears"]
  ];
  for (const [slug, t] of rows) {
    out += `<article class="bs" itemscope="itemscope"><div class="bsx"> <a href="https://kissasian.cam/${slug}-episode-1/" itemprop="url" title="${t} Episode 1" class="tip"><div class="limit"></div> <img src="https://kissasian.cam/wp-content/uploads/${slug}-209x300.jpg" title="${t} Episode 1" alt="${t}"/></div></div></article>\n`;
  }
  return out;
})();
const KS_SEARCH_HTML = `<article class="bs"><div class="bsx"> <a href="https://kissasian.cam/series/queen-of-tears/" itemprop="url" title="Queen of Tears" class="tip"><div class="limit"></div> <img src="https://kissasian.cam/wp-content/uploads/qot-209x300.jpg" title="Queen of Tears" alt="Queen of Tears"/></div></div></article>`;
const KS_SERIES_HTML = `<html><head><title>Queen of Tears</title><meta property="og:image" content="https://kissasian.cam/wp-content/uploads/qot.jpg"><meta property="og:description" content="A couple in crisis."></head><body><h1>Queen of Tears</h1><a href="https://kissasian.cam/queen-of-tears-episode-1/">Ep1</a><a href="https://kissasian.cam/queen-of-tears-episode-2/">Ep2</a></body></html>`;
const ksEpisodePage = (n) => `<html><body><iframe src="https://justplay.cam/e/qot-e${n}"></iframe></body></html>`;

const VA_PAGE = (() => {
  let out = "";
  const rows = [
    ["crash-landing-on-you-2019", "Crash Landing on You (2019)"],
    ["hidden-love-2023", "Hidden Love (2023)"]
  ];
  for (const [slug, t] of rows) {
    out += `<li>
              <a href="https://viewasian.lol/${slug}-episode-2-english-sub/" class="img">
                <img class="lazy" alt="${t} Episode 2 English Sub" title="${t} Episode 2 English Sub" data-original="https://viewasian.lol/wp-content/uploads/${slug}.jpg">
              </a>
            </li>\n`;
  }
  return out;
})();
const VA_DRAMA_HTML = `<html><body><a href="https://viewasian.lol/crash-landing-on-you-2019-episode-3-english-sub/">Ep3</a></body></html>`;
const VA_EP_HTML = `<html><body><iframe src="https://kisskh.space/cloy-ep3"></iframe></body></html>`;
const VA_PLAYER_HTML = `<html><body><iframe src="https://vidmoly.example/embed-qot9x.html"></iframe></body></html>`;
const VA_EMBED_HTML = `<html><body>var file = "https://cdn.vidmoly.example/hls/qot/master.m3u8?tok=1";</body></html>`;
const VA_MASTER = "#EXTM3U\n#EXT-X-STREAM-INF:BANDWIDTH=3000000,RESOLUTION=1920x1080\n1080p.m3u8\n";

const PINOY_HTML = `<article id="post-101" class="item movies"><div class="poster"><img src="https://pinoymovieshub.win/wp-content/uploads/p101-200x300.jpg" alt="Queen Mantis"></div><div class="details"><div class="title"><a href="https://pinoymovieshub.win/movies/queen-mantis-2025">Queen Mantis</a></div><span>2025</span></div></article>`;

// Byse playback payload (same scheme as the offline suite: AES-256-CTR with
// counter starting at IV||0x00000002, 16-byte tag placeholder appended).
const BYSE_KEY = crypto.randomBytes(32);
const BYSE_IV = crypto.randomBytes(12);
const BYSE_PLAIN = JSON.stringify({
  sources: [{ url: "https://edge.justplay.cam/hls/qot/master.m3u8", height: 1080, label: "1080p", mime_type: "application/vnd.apple.mpegurl" }]
});
const b64url = (buf) => Buffer.from(buf).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const BYSE_PARTS = [];
for (let i = 0; i < 30; i++) BYSE_PARTS.push(b64url(crypto.randomBytes(16)));
BYSE_PARTS[6] = b64url(BYSE_KEY.slice(0, 16));
BYSE_PARTS[23] = b64url(BYSE_KEY.slice(16, 32));
const byseCtr = crypto.createCipheriv("aes-256-ctr", BYSE_KEY, Buffer.concat([BYSE_IV, Buffer.from([0, 0, 0, 2])]));
const BYSE_PAYLOAD = Buffer.concat([byseCtr.update(BYSE_PLAIN, "utf8"), byseCtr.final(), crypto.randomBytes(16)]);

let seenCaptchaToken = null;

function cannedRouter(url, req) {
  const u = String(url);
  if (u.startsWith("https://justplay.cam/")) {
    if (u.includes("/embed/captcha/verify")) {
      let body = {};
      try { body = JSON.parse(String((req && req.text) ? "" : "{}")); } catch (_) {}
      return req.text().then((raw) => {
        try { body = JSON.parse(String(raw || "{}")); } catch (_) { body = {}; }
        // verify the PoW the bundle actually solved (difficulty 12)
        const sol = body && body.solution;
        const words = CoreDigest(bytestrs("nonce-wd-77:" + sol));
        let bits = 0;
        for (const w of words) { if (w === 0) { bits += 32; continue; } bits += Math.clz32(w >>> 0); break; }
        if (bits < 12) return new Response(JSON.stringify({ error: "bad pow", bits }), { status: 403 });
        return new Response(JSON.stringify({ status: "ok", token: "tok-wd" }), { status: 200 });
      });
    }
    if (u.includes("/embed/captcha")) {
      return new Response(JSON.stringify({ status: 200, pow_nonce: "nonce-wd-77", pow_difficulty: 12, pow_token: "ptok-wd" }), { status: 200 });
    }
    if (u.includes("/embed/playback")) {
      const tok = req && req.headers && req.headers.get ? req.headers.get("X-Captcha-Token") : null;
      if (tok !== "tok-wd") return new Response(JSON.stringify({ error: "no token", got: tok }), { status: 403 });
      seenCaptchaToken = "tok-wd";
      return new Response(JSON.stringify({ playback: { algorithm: "AES-256-GCM", version: 7, iv: b64url(BYSE_IV), payload: BYSE_PAYLOAD.toString("base64"), key_parts: BYSE_PARTS } }), { status: 200 });
    }
  }
  if (u.startsWith("https://kissasian.cam/")) {
    if (u === "https://kissasian.cam/series/queen-of-tears/") return new Response(KS_SERIES_HTML, { status: 200 });
    const m = u.match(/https:\/\/kissasian\.cam\/(queen-of-tears-episode-(\d+))\/?$/);
    if (m) return new Response(ksEpisodePage(parseInt(m[2], 10)), { status: 200 });
    if (u.includes("/?s=")) return new Response(KS_SEARCH_HTML, { status: 200 });
    return new Response(KS_PAGE, { status: 200 });
  }
  if (u.startsWith("https://viewasian.lol/")) {
    if (u === "https://viewasian.lol/drama/crash-landing-on-you-2019/") return new Response(VA_DRAMA_HTML, { status: 200 });
    if (u.includes("crash-landing-on-you-2019-episode-3")) return new Response(VA_EP_HTML, { status: 200 });
    if (u.includes("/?s=")) return new Response(`<a href="https://viewasian.lol/drama/crash-landing-on-you-2019/" class="img" title="Crash Landing on You (2019)"></a>`, { status: 200 });
    return new Response(VA_PAGE, { status: 200 });
  }
  if (u.startsWith("https://kisskh.space/")) return new Response(VA_PLAYER_HTML, { status: 200 });
  if (u.startsWith("https://vidmoly.example/")) return new Response(VA_EMBED_HTML, { status: 200 });
  if (u.startsWith("https://cdn.vidmoly.example/")) return new Response(VA_MASTER, { status: 200 });
  if (u.startsWith("https://pinoymovieshub.win/")) return new Response(PINOY_HTML, { status: 200 });
  if (u.startsWith("https://api.themoviedb.org/3/tv/876543")) {
    return new Response(JSON.stringify({ name: "Queen of Tears", original_name: "Queen of Tears", first_air_date: "2024-03-09", original_language: "ko" }), { status: 200 });
  }
  if (u.startsWith("https://api.themoviedb.org/3/search/tv")) {
    return new Response(JSON.stringify({ results: [{ id: 88002, name: "Queen of Tears", original_language: "ko", first_air_date: "2024-03-09", poster_path: "/q.jpg", overview: "x", vote_average: 8 }] }), { status: 200 });
  }
  if (u.startsWith("https://api.themoviedb.org/3/search/movie")) {
    return new Response(JSON.stringify({ results: [{ id: 496243, title: "Parasite", original_language: "ko", release_date: "2019-05-30", poster_path: "/p.jpg", overview: "x", vote_average: 8 }] }), { status: 200 });
  }
  if (u.startsWith("https://api.themoviedb.org/3/discover/")) {
    return new Response(JSON.stringify({ results: [{ id: 700001, title: "Asian Movie", name: "Asian Show", original_language: "ko", release_date: "2026-08-01", first_air_date: "2026-08-01", poster_path: "/a.jpg", overview: "x", vote_average: 7 }] }), { status: 200 });
  }
  return new Response(JSON.stringify({ error: "unexpected " + u }), { status: 404 });
}

// independent copy of the site's xxHash-style mixer (from the justplay bundle)
function byRotl(x, n) { return ((x << n) | (x >>> (32 - n))) >>> 0; }
function byMix(s) {
  s[0] = (s[0] + s[1]) >>> 0; s[3] = byRotl(s[3] ^ s[0], 16);
  s[2] = (s[2] + s[3]) >>> 0; s[1] = byRotl(s[1] ^ s[2], 12);
  s[0] = (s[0] + s[1]) >>> 0; s[3] = byRotl(s[3] ^ s[0], 8);
  s[2] = (s[2] + s[3]) >>> 0; s[1] = byRotl(s[1] ^ s[2], 7);
}
function bytestrs(str) { const o = new Uint8Array(str.length); for (let i = 0; i < str.length; i++) o[i] = str.charCodeAt(i) & 255; return o; }
function CoreDigest(bytes) {
  const s = new Uint32Array([1779033703, 3144134277, 1013904242, 2773480762]);
  let i, f, a, rd, k, w, t, d, v;
  for (i = 0; i < bytes.length; i++) { s[0] = (s[0] + bytes[i]) >>> 0; s[0] = byRotl(s[0], 7); byMix(s); }
  for (f = 0; f < 8; f++) byMix(s);
  const r = new Uint32Array(512);
  for (a = 0; a < 512; a++) { byMix(s); r[a] = (s[0] ^ s[2]) >>> 0; }
  for (rd = 0; rd < 2; rd++) {
    for (k = 0; k < 512; k++) {
      let c = (r[k] + r[r[k] & 511]) >>> 0;
      c = byRotl(c, 13);
      c = (c ^ Math.imul(r[(k + 1) & 511], 2654435761)) >>> 0;
      r[k] = c; s[0] = (s[0] ^ c) >>> 0; byMix(s);
    }
  }
  const n = new Uint32Array(8);
  for (w = 0; w < 8; w++) {
    byMix(s); v = s[0];
    for (t = 0; t < 64; t++) { d = r[w * 64 + t]; v = (v + d) >>> 0; v = byRotl(v, 5); v = (v ^ Math.imul(d, 2246822519)) >>> 0; }
    n[w] = (v ^ s[2]) >>> 0;
  }
  return n;
}

async function boot() {
  mkdirSync(new URL("./mf-scratch", import.meta.url).pathname, { recursive: true });
  const mf = new Miniflare({
    modules: true,
    script: readFileSync(BUNDLE, "utf8"),
    compatibilityDate: "2024-09-01",
    bindings: {},
    outboundService: (req) => cannedRouter(req.url, req),
  });
  return mf;
}

const mf = await boot();
const j = async (url) => (await mf.dispatchFetch(url)).json();

const res = await mf.dispatchFetch("https://worker.test/health");
const health = await res.json();
console.log("HEALTH:", health.status, "| sources:", Object.keys(health.sources).join(","));

const man = await j("https://worker.test/manifest.json");
const resNames = (man.resources || []).map((r) => (typeof r === "string" ? r : r.name));
console.log("MANIFEST:", man.version, "|", man.catalogs.length, "catalogs | resources:", resNames.join(","));

const cat = await j("https://worker.test/catalog/series/asian-series.json");
console.log("CATALOG asian-series:", (cat.metas || []).length, "metas");

const meta = await j("https://worker.test/meta/series/" + encodeURIComponent("asian:ks-queen-of-tears") + ".json");
console.log("META asian:ks-queen-of-tears:", meta.meta && meta.meta.name, "| videos:", meta.meta && meta.meta.videos ? meta.meta.videos.length : 0);

const st1 = await j("https://worker.test/stream/series/" + encodeURIComponent("asian:ks-queen-of-tears:1:1") + ".json");
console.log("STREAM coded id:", (st1.streams || []).length, "stream(s)", st1.streams[0] ? st1.streams[0].title + " -> " + st1.streams[0].url : "");

const st2 = await j("https://worker.test/stream/series/" + encodeURIComponent("tmdb:876543:1:1") + ".json");
console.log("STREAM tmdb id:", (st2.streams || []).length, "stream(s)", st2.streams[0] ? st2.streams[0].title : "");

const st3 = await j("https://worker.test/stream/series/" + encodeURIComponent("asian:va-crash-landing-on-you-2019:1:3") + ".json");
const s3 = (st3.streams || [])[0] || {};
console.log("STREAM va id:", (st3.streams || []).length, "stream(s)", s3.title, "->", s3.url, "| proxyHeaders:", !!(s3.behaviorHints && s3.behaviorHints.proxyHeaders));

const ok =
  health.status === "up" &&
  man.version === "3.2.0" &&
  man.catalogs.length === 14 &&
  resNames.join(",") === "catalog,meta,stream" &&
  (cat.metas || []).length > 0 &&
  meta.meta && meta.meta.videos && meta.meta.videos.length === 2 &&
  (st1.streams || []).length === 1 && /justplay\.cam\/hls/.test(st1.streams[0].url) &&
  (st2.streams || []).length === 1 &&
  (st3.streams || []).length === 1 && s3.behaviorHints && s3.behaviorHints.proxyHeaders &&
  seenCaptchaToken === "tok-wd";

await mf.dispose();
console.log(ok ? "WORKERD VERIFY: HEALTHY" : "WORKERD VERIFY: FAILED");
process.exit(ok ? 0 : 2);
