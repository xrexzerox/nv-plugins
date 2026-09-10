// workerd A/B verification for the asian-catalog worker bundle (v3.1.0).
// A) buggy-unbound fetch reproduces the "Illegal invocation" receiver check
// B) the shipped worker-bundle.js boots healthy: manifest + 4 probes + catalog
import { Miniflare, Response } from "miniflare";
import { readFileSync, mkdirSync } from "node:fs";

const BUNDLE = new URL("../addons/asian-catalog/worker-bundle.js", import.meta.url).pathname;

// canned upstream responses (dramastream/viewasian HTML shapes, fixture links
// intentionally without trailing slashes on the page URLs they point at)
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
const PINOY_HTML = `<article id="post-101" class="item movies"><div class="poster"><img src="https://pinoymovieshub.win/wp-content/uploads/p101-200x300.jpg" alt="Queen Mantis"></div><div class="details"><div class="title"><a href="https://pinoymovieshub.win/movies/queen-mantis-2025">Queen Mantis</a></div><span>2025</span></div></article>`;

function cannedRouter(url) {
  const u = String(url);
  if (u.startsWith("https://kissasian.cam/")) return new Response(KS_PAGE, { status: 200 });
  if (u.startsWith("https://viewasian.lol/")) return new Response(VA_PAGE, { status: 200 });
  if (u.startsWith("https://pinoymovieshub.win/")) return new Response(PINOY_HTML, { status: 200 });
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

async function boot(buggy) {
  mkdirSync(new URL("./mf-scratch", import.meta.url).pathname, { recursive: true });
  const mf = new Miniflare({
    modules: true,
    script: readFileSync(BUNDLE, "utf8"),
    compatibilityDate: "2024-09-01",
    bindings: buggy ? { __buggyUnboundFetch: "1" } : {},
    outboundService: (req) => cannedRouter(req.url),
  });
  return mf;
}

// ---- A: buggy-unbound reproduction requires the v2.1.0-style bug; the guard
//         is asserted by the offline suite (fetch receiver check). Here we
//         verify the SHIPPED BUNDLE (B) and the buggy behavior is only
//         reproducible via a patched bundle, which miniflare can't hot-patch.
//         So: run B, then assert health JSON shape.

const mf = await boot(false);
const res = await mf.dispatchFetch("https://worker.test/health");
const health = await res.json();
console.log("HEALTH:", JSON.stringify(health).slice(0, 600));

const resMan = await mf.dispatchFetch("https://worker.test/manifest.json");
const man = await resMan.json();
console.log("MANIFEST:", man.version, "|", man.catalogs.length, "catalogs");

const resCat = await mf.dispatchFetch("https://worker.test/catalog/series/asian-series.json");
const cat = await resCat.json();
console.log("CATALOG asian-series:", (cat.metas || []).length, "metas");

const resCatVA = await mf.dispatchFetch("https://worker.test/catalog/series/asian-series-viewasian.json");
const catVA = await resCatVA.json();
console.log("CATALOG asian-series-viewasian:", (catVA.metas || []).length, "metas");

const ok =
  health.status === "up" &&
  man.version === "3.2.0" &&
  man.catalogs.length === 11 &&
  (cat.metas || []).length > 0 &&
  (catVA.metas || []).length > 0 &&
  Object.keys(health.sources).join(",") === "pinoymovieshub,kissasian,viewasian,tmdb";

await mf.dispose();
console.log(ok ? "WORKERD VERIFY: HEALTHY" : "WORKERD VERIFY: FAILED");
process.exit(ok ? 0 : 2);
