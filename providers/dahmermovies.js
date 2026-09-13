/*
 * nv-plugins dahmermovies.js — FULLY DECODED port of the All-in-One-Nuvio provider (4.23.0 best-settings pass).
 * Decoded from the obfuscated AIO build: string tables resolved, decoder machinery stripped,
 * every network call capped by an 8s deadline, nvio post-filter attached (en/tl audio gate,
 * >=720p quality gate, cross-provider dedupe). Behavior/endpoints identical to the AIO original.
 */
/* nv-plugins best-settings pass 4.23.0: hard 8s deadline on every network call */
var __nvFetch = function () {
  var _f = null;
  try {
    _f = typeof fetch === "function" ? fetch : null;
  } catch (e) {
    _f = null;
  }
  if (!_f) {
    return function () {
      return Promise.reject(new Error("no fetch"));
    };
  }
  var hasT = typeof setTimeout === "function";
  return function (input, init) {
    var p;
    try {
      p = _f.apply(this, arguments);
    } catch (e) {
      return Promise.reject(e);
    }
    if (!hasT || !p || typeof p.then !== "function") {
      return p;
    }
    return Promise.race([p, new Promise(function (_res, rej) {
      var t = setTimeout(function () {
        rej(new Error("nv deadline 8s"));
      }, 8000);
      if (t && typeof t.unref === "function") {
        t.unref();
      }
    })]);
  };
}();
function v1() {
  return "";
}
const v2 = v1; /*string-table removed*/ /*rotation removed*/
;
var __async = (v3, v4, v5) => {
  return new Promise((v6, v7) => {
    const v8 = v1;
    var v9 = v10 => {
      const v11 = v1;
      try {
        v12(v5.next(v10));
      } catch (v13) {
        v7(v13);
      }
    };
    var v14 = v15 => {
      try {
        v12(v5.throw(v15));
      } catch (v16) {
        v7(v16);
      }
    };
    var v12 = v17 => v17.done ? v6(v17.value) : Promise.resolve(v17.value).then(v9, v14);
    v12((v5 = v5.apply(v3, v4)).next());
  });
};
console.log("[DahmerMovies] Initializing Scraper");
var TMDB_API_KEY = "439c478a771f35c05022f9feabcca01c";
var DAHMER_MOVIES_API = "https://a.111477.xyz";
var DAHMER_WORKER_API = "https://p.111477.xyz/bulk?u=";
/*decoder removed*/
function makeRequest(v18) {
  return __async(this, null, function* () {
    const v19 = v1;
    try {
      return yield __nvFetch(v18, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
          Referer: DAHMER_MOVIES_API + "/"
        }
      });
    } catch (v20) {
      return {
        ok: false
      };
    }
  });
}
function parseLinks(v21) {
  const v22 = v2;
  const v23 = [];
  const v24 = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  let v25;
  while ((v25 = v24.exec(v21)) !== null) {
    const v26 = v25[1];
    const v27 = v26.match(/<a[^>]*href=["']([^"']*)["'][^>]*>([^<]*)<\/a>/i);
    const v28 = v26.match(/<td[^>]*>(\d+(?:\.\d+)?\s?[KMGT]B)<\/td>/i);
    if (v27) {
      const v29 = v27[1];
      const v30 = v27[2].trim();
      const v31 = v28 ? v28[1].trim() : "N/A";
      if (v30 && v29 !== "../" && /\.(mkv|mp4|avi|webm|m3u8)$/i.test(v30)) {
        v23.push({
          text: v30,
          href: v29,
          size: v31
        });
      }
    }
  }
  return v23;
}
function invokeDahmerMovies(v32, v33, v34 = null, v35 = null) {
  return __async(this, null, function* () {
    const v36 = v1;
    var v37;
    const v38 = v32.replace(/:/g, "");
    const v39 = v34 !== null ? ["/tvs/" + encodeURIComponent(v38) + "/Season%20" + (v34 < 10 ? "0" + v34 : v34) + "/", "/tvs/" + encodeURIComponent(v38) + "/Season%20" + v34 + "/"] : ["/movies/" + encodeURIComponent(v38 + " (" + v33 + ")") + "/"];
    let v40 = "";
    let v41 = "";
    for (const v42 of v39) {
      const v43 = DAHMER_MOVIES_API + v42;
      const v44 = yield makeRequest(v43);
      if (v44.ok) {
        v40 = yield v44.text();
        v41 = v43;
        break;
      }
    }
    if (!v40) {
      return [];
    }
    const v45 = parseLinks(v40);
    const v46 = v45.sort((v47, v48) => {
      const v49 = v36;
      const v50 = /2160p|4k/i.test(v47.text);
      const v51 = /2160p|4k/i.test(v48.text);
      return v51 - v50;
    });
    const v52 = [];
    for (const v53 of v46.slice(0, 5)) {
      let v54;
      if (v53.href.startsWith("http")) {
        v54 = v53.href;
      } else if (v53.href.includes("/movies/") || v53.href.includes("/tvs/")) {
        v54 = DAHMER_MOVIES_API + (v53.href.startsWith("/") ? "" : "/") + v53.href;
      } else {
        v54 = v41 + v53.href;
      }
      v54 = v54.replace(/([^:]\/)\/+/g, "$1");
      v54 = decodeURI(v54);
      let v55 = DAHMER_WORKER_API + encodeURI(v54);
      const v56 = v53.text;
      let v57 = "Original";
      const v58 = /\b(HIN|TAM|TEL|Multi|Dual|DUB|Multi-Audio|MULTI)\b/i.test(v56);
      const v59 = /\b(Eng|English)\b/i.test(v56);
      const v60 = /^[a-zA-Z0-9\s?!\-:]+$/.test(v32);
      if (v58) {
        v57 = "Multi Audio";
      } else if (v60 && v59) {
        v57 = "English";
      }
      const v61 = v56.match(/\.(mkv|mp4|m3u8|avi|webm)$/i);
      const v62 = v61 ? v61[1].toUpperCase() : "LINK";
      const v63 = ((v37 = v56.match(/\b(2160p|1080p|720p|4k)\b/i)) == null ? undefined : v37[0]) || "1080p";
      const v64 = v53.size !== "N/A" ? v53.size : "N/A";
      let v65 = v56.replace(/\.(mkv|mp4|avi|webm|m3u8)$/i, "").replace(/[\[\]()._-]/g, " ").replace(/\s+/g, " ").trim();
      v52.push({
        name: "DahmerMovies",
        title: "📺 " + v63 + "  |  🌐 " + v57 + "  |  💾 " + v64 + "  |  🎞️ " + v62 + "  |  ℹ️ " + v65,
        url: v55,
        quality: v63.toLowerCase(),
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
          Referer: DAHMER_MOVIES_API + "/",
          Connection: "keep-alive",
          Accept: "*/*",
          Range: "bytes=0-"
        },
        provider: "dahmermovies"
      });
    }
    return v52;
  });
}
function getStreams(v66, v67 = "movie", v68 = null, v69 = null) {
  return __async(this, null, function* () {
    const v70 = v1;
    var v71;
    try {
      const v72 = v67 === "tv" ? "tv" : "movie";
      const v73 = "https://api.themoviedb.org/3/" + v72 + "/" + v66 + "?api_key=" + TMDB_API_KEY;
      const v74 = yield makeRequest(v73);
      const v75 = yield v74.json();
      const v76 = v67 === "tv" ? v75.name : v75.title;
      const v77 = (v71 = v67 === "tv" ? v75.first_air_date : v75.release_date) == null ? undefined : v71.substring(0, 4);
      if (!v76) {
        return [];
      }
      return yield invokeDahmerMovies(v76, v77, v68, v69);
    } catch (v78) {
      return [];
    }
  });
}
if (typeof module !== "undefined") {
  module.exports = {
    getStreams: getStreams
  };
} else {
  global.getStreams = getStreams;
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
  var PROVIDER = "dahmermovies";
  var G = typeof globalThis !== "undefined" ? globalThis : typeof global !== "undefined" ? global : this;
  function settings() {
    try {
      return G && G.SCRAPER_SETTINGS || {};
    } catch (e) {
      return {};
    }
  }
  function hasTimers() {
    return typeof setTimeout === "function" && typeof clearTimeout === "function";
  }

  /* ---------- quality ---------- */
  function normQ(q) {
    var s = String(q == null ? "" : q).toLowerCase();
    if (!s) {
      return "";
    }
    if (/8k/.test(s)) {
      return "4K";
    }
    if (/2160|4k|uhd/.test(s)) {
      return "4K";
    }
    if (/1440/.test(s)) {
      return "1440p";
    }
    if (/1080|fhd/.test(s)) {
      return "1080p";
    }
    if (/720/.test(s)) {
      return "720p";
    }
    if (/480|360|240|\bsd\b/.test(s)) {
      return "CAM";
    }
    if (/cam|telesync|telecine|\bts\b|\btc\b|screener|dvdscr/.test(s)) {
      return "CAM";
    }
    return "";
  }
  function qFromText(text) {
    var s = String(text || "");
    var m = s.match(/(\d{3,4})\s*p/i);
    if (m) {
      var n = parseInt(m[1], 10);
      if (n >= 2100) {
        return "4K";
      }
      if (n >= 1300) {
        return "1440p";
      }
      if (n >= 1000) {
        return "1080p";
      }
      if (n >= 640) {
        return "720p";
      }
      return "CAM";
    }
    if (/\b8k\b/i.test(s) || /2160|4k|uhd/i.test(s)) {
      return "4K";
    }
    if (/1440p/i.test(s)) {
      return "1440p";
    }
    if (/cam|telesync|telecine|\bts\b|\btc\b|screener|dvdscr/i.test(s)) {
      return "CAM";
    }
    if (/480p|360p|240p|\bsd\b|\bdvdrip\b/i.test(s)) {
      return "CAM";
    }
    if (/\bhd\b/i.test(s)) {
      return "720p";
    }
    return "";
  }
  var qualCache = G.__NV_QUAL_CACHE__ ||= {};
  function probeM3u8(url, headers) {
    var now = Date.now();
    var c = qualCache[url];
    if (c && now - c.t < (c.q ? 900000 : 180000)) {
      return Promise.resolve(c.q);
    }
    var opts = {
      headers: Object.assign({}, headers || {})
    };
    var p = fetch(url, opts).then(function (r) {
      if (r.ok) {
        return r.text();
      } else {
        return "";
      }
    }).then(function (t) {
      var q = "";
      if (t && t.indexOf("#EXTM3U") !== -1) {
        var best = 0;
        var re = /RESOLUTION=(\d+)x(\d+)/gi;
        var m;
        while ((m = re.exec(t)) !== null) {
          var h = parseInt(m[2], 10);
          if (h > best) {
            best = h;
          }
        }
        if (best >= 2100) {
          q = "4K";
        } else if (best >= 1300) {
          q = "1440p";
        } else if (best >= 1000) {
          q = "1080p";
        } else if (best >= 640) {
          q = "720p";
        } else if (best > 0) {
          q = "CAM";
        }
      }
      qualCache[url] = {
        t: now,
        q: q
      };
      return q;
    }).catch(function () {
      qualCache[url] = {
        t: now,
        q: ""
      };
      return "";
    });
    if (hasTimers()) {
      p = Promise.race([p, new Promise(function (res) {
        var timer = setTimeout(function () {
          res("");
        }, 6000);
        if (typeof timer === "object" && typeof timer.unref === "function") {
          timer.unref();
        }
      })]);
    }
    return p;
  }

  /* ---------- language gate ---------- */
  var BLOCK_RE = new RegExp("\\b(hindi|hin|tamil|telugu|malayalam|mallu|kannada|bengali|bangla|punjabi|marathi|bhojpuri|gujarati|odia|assamese|nepali|urdu|sinhala|arabic|ara|farsi|persian|turkish|turkce|espanol|spanish|latino|castellano|french|vostfr|german|deutsch|russian|korean|kor|japanese|jpn|chinese|mandarin|cantonese|thai|vietnamese|indonesian|bahasa|portuguese|brasileiro|italian|polish|ukrainian|hebrew|hungarian|romanian|dutch|flemish|greek|czech|swedish|danish|norwegian|finnish|org)\\b", "i");
  var ALLOW_RE = /\b(english|eng|tagalog|filipino)\b/i;
  var SUB_RE = /\b[a-z0-9]{0,12}subs?\b/gi;
  // NOTE: gate runs on the stream TITLE only (release names / labels).
  // Provider names (e.g. "MallumV") must not trigger the language gate.
  function langAllowed(titleText) {
    var t = String(titleText || "").replace(SUB_RE, " ");
    if (BLOCK_RE.test(t)) {
      return ALLOW_RE.test(t);
    }
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
  var SEEN = G.__NV_SEEN_URLS__ ||= {};
  // SEEN[nu] = { exp: <ts>, owner: <provider> }
  // - same URL from a DIFFERENT provider within TTL -> dropped (cross-provider dup)
  // - same provider re-querying its own URL -> allowed (repeat opens must still
  //   return rows) and its claim is refreshed
  function claim(nu, now, owner) {
    if (!nu) {
      return true;
    }
    var e = SEEN[nu];
    if (e && e.exp > now && e.owner !== owner) {
      return false;
    }
    SEEN[nu] = {
      exp: now + 120000,
      owner: owner
    };
    return true;
  }

  /* ---------- main ---------- */
  function rank(q) {
    if (q === "4K") {
      return 4;
    }
    if (q === "1440p") {
      return 3.5;
    }
    if (q === "1080p") {
      return 3;
    }
    if (q === "720p") {
      return 2;
    }
    return 0;
  }
  function postProcess(list) {
    var now = Date.now();
    var kept = [];
    var probes = [];
    var rows = [];
    (list || []).forEach(function (s, i) {
      if (!s || !s.url) {
        return;
      }
      if (!langAllowed(s.title)) {
        return;
      }
      var text = (s.name || "") + " " + (s.title || "");
      var isMagnet = /^magnet:/i.test(String(s.url));
      var q = normQ(s.quality) || normQ(String(s.title || "").split("\n")[0]) || qFromText(text);
      var isHlsLike = /m3u8/i.test(String(s.url)) || !/\.(mp4|mkv|avi|mov|webm|ts|flv|m4v|mp3|aac)(\?|$)/i.test(String(s.url.split("?")[0])) && /^https?:/i.test(String(s.url));
      if (!q && !isMagnet && isHlsLike) {
        rows.push({
          s: s,
          i: i
        });
        probes.push(probeM3u8(String(s.url), s.headers));
      } else {
        rows.push({
          s: s,
          i: i
        });
        probes.push(Promise.resolve(q));
      }
    });
    return Promise.all(probes).then(function (qs) {
      var ranked = [];
      rows.forEach(function (row, k) {
        var q = qs[k];
        if (!q) {
          return;
        } // unknown resolution -> removed
        if (q === "CAM") {
          return;
        } // cam / sd / sub-720 -> removed
        row.s.quality = q;
        ranked.push({
          s: row.s,
          i: row.i,
          q: q
        });
      });
      // best first so dedupe keeps the strongest duplicate (stable)
      ranked.sort(function (a, b) {
        var r = rank(b.q) - rank(a.q);
        if (r !== 0) {
          return r;
        }
        return a.i - b.i;
      });
      var seenLocal = {};
      var out = [];
      ranked.forEach(function (row) {
        var s = row.s;
        var nu = normUrl(s.url);
        if (seenLocal[nu]) {
          return;
        }
        if (!claim(nu, now, PROVIDER)) {
          return;
        } // already reported by a different provider
        seenLocal[nu] = 1;
        out.push(s);
      });
      return out.slice(0, 40);
    }).catch(function () {
      return (list || []).slice(0, 40);
    });
  }
  var __orig = null;
  try {
    __orig = module.exports && module.exports.getStreams;
  } catch (e) {
    __orig = null;
  }
  if (typeof __orig === "function") {
    module.exports.getStreams = function () {
      var args = Array.prototype.slice.call(arguments);
      var self = this;
      function finish(v) {
        if (settings().postFilter === false) {
          return v;
        }
        try {
          return postProcess(Array.isArray(v) ? v : []);
        } catch (e) {
          if (Array.isArray(v)) {
            return v;
          } else {
            return [];
          }
        }
      }
      try {
        var r = __orig.apply(self, args);
        if (r && typeof r.then === "function") {
          if (typeof setTimeout === "function") {
            // nv best-settings 4.23.0: hard 8s cap on the whole provider run
            r = Promise.race([r, new Promise(function (res) {
              var dl = setTimeout(function () {
                res([]);
              }, 8000);
              if (dl && typeof dl.unref === "function") {
                dl.unref();
              }
            })]);
          }
          return r.then(function (v) {
            return finish(v);
          }, function () {
            return [];
          });
        }
        return finish(r);
      } catch (e) {
        return Promise.resolve([]);
      }
    };
  }
})();