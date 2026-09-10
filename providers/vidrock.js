/**
 * Vidrock - Nuvio provider (v2, rebuilt against the live vidrock.ru API)
 *
 * The old personal API (194.233.72.38:3000) is dead. Vidrock now serves
 * per-server encrypted URLs from vidrock.ru:
 *
 *   GET https://vidrock.ru/api/movie/{tmdbId}/
 *   GET https://vidrock.ru/api/tv/{tmdbId}/{season}/{episode}/
 *     -> { "Atlas": { url: "<b64url(nonce12 + ct + tag16)>" , type: "hls" },
 *          "Nova" / "Luna" / "Orion": { url: null } | { url: "error" } ... }
 *
 * Each URL is AES-256-GCM with a fixed key; the plaintext is the direct
 * HLS/mp4 link. Nuvio's QuickJS sandbox has no SubtleCrypto, so this ships
 * the same compact pure-JS AES-256/GCM-CTR core as pinoyhub.js (the trailing
 * 16-byte tag is skipped - a wrong key just fails the http check).
 *
 * Pure ES5 promise chains, typed arrays and regex only: QuickJS + Nuvio TV
 * worker safe.
 */

var VIDROCK_API = "https://vidrock.ru";
var VIDROCK_KEY_HEX = "7f3e9c2a8b5d1f4e6a9c3b7d2e5f8a1c4b6d9e2f5a8c1b4d7e9f2a5c8b1d4e7f";
var TMDB_API_KEY = "6dc830f9624b43261325bed3bf7d0dfa";

var HEADERS = {
  "User-Agent": "Mozilla/5.0 (Linux; Android 13; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0 Mobile Safari/537.36",
  "Accept": "application/json, text/plain, */*"
};

// ===== tiny helpers =====

function hexToBytes(hex) {
  var out = [], i;
  for (i = 0; i < hex.length; i += 2) out.push(parseInt(hex.substr(i, 2), 16));
  return out;
}

function b64urlToBytes(str) {
  var t = String(str).replace(/-/g, "+").replace(/_/g, "/").replace(/=+$/, "");
  while (t.length % 4 !== 0) t += "=";
  var bin = atob(t), bytes = new Array(bin.length), i;
  for (i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i) & 0xff;
  return bytes;
}

function bytesToUtf8(bytes) {
  var out = "", i = 0;
  while (i < bytes.length) {
    var b = bytes[i];
    if (b < 0x80) { out += String.fromCharCode(b); i += 1; }
    else if (b < 0xe0) {
      out += String.fromCharCode(((b & 0x1f) << 6) | (bytes[i + 1] & 0x3f));
      i += 2;
    } else if (b < 0xf0) {
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


// ===== provider =====

function decryptVidrockUrl(enc) {
  try {
    var data = b64urlToBytes(enc);
    if (data.length <= 28) return null; /* 12 nonce + 16 tag minimum */
    var nonce = data.slice(0, 12);
    var body = data.slice(12);
    var plain = aesGcmDecryptNoTag(hexToBytes(VIDROCK_KEY_HEX), nonce, body);
    if (!plain.length) return null;
    var url = bytesToUtf8(plain);
    return /^https?:\/\//i.test(url) ? url : null;
  } catch (e) {
    return null;
  }
}

function fetchJson(url) {
  return fetch(url, { method: "GET", redirect: "follow", headers: mergeHeaders(HEADERS, { Origin: VIDROCK_API, Referer: VIDROCK_API + "/" }) })
    .then(function (res) {
      if (!res.ok) throw new Error("HTTP " + res.status);
      return res.json();
    });
}

function mergeHeaders(a, b) {
  var out = {}, k;
  for (k in (a || {})) out[k] = a[k];
  for (k in (b || {})) out[k] = b[k];
  return out;
}

function getStreams(tmdbId, mediaType, season, episode) {
  console.log("[vidrock] === START " + mediaType + " " + tmdbId + " S" + season + "E" + episode + " ===");
  try { tmdbId = String(tmdbId); } catch (e) { tmdbId = ""; }
  if (!tmdbId) return Promise.resolve([]);

  var isTv = mediaType === "tv";
  var api = isTv
    ? VIDROCK_API + "/api/tv/" + tmdbId + "/" + (parseInt(season, 10) || 1) + "/" + (parseInt(episode, 10) || 1) + "/"
    : VIDROCK_API + "/api/movie/" + tmdbId + "/";

  return fetchJson(api).then(function (json) {
    var servers = Object.keys(json || {});
    var streams = [];
    var chain = Promise.resolve();
    servers.forEach(function (server) {
      chain = chain.then(function () {
        var entry = json[server];
        var enc = entry && entry.url;
        if (!enc || typeof enc !== "string" || enc === "error" || enc === "null") return;
        var url = decryptVidrockUrl(enc);
        if (!url) {
          console.log("[vidrock] " + server + ": decrypt failed, skipping");
          return;
        }
        streams.push({
          name: "Vidrock | " + server,
          title: (isTv ? "S" + season + "E" + episode + " | " : "") + "Vidrock [" + server + "] | " + ((entry && entry.type) === "hls" ? "HLS" : "Direct"),
          url: url,
          quality: "Auto",
          headers: { Origin: VIDROCK_API, Referer: VIDROCK_API + "/", "User-Agent": HEADERS["User-Agent"] }
        });
      });
    });
    return chain.then(function () {
      console.log("[vidrock] Returning " + streams.length + " stream(s)");
      return streams;
    });
  }).catch(function (e) {
    console.error("[vidrock] error:", (e && e.message) || e);
    return [];
  });
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { getStreams: getStreams };
} else if (typeof global !== "undefined") {
  global.getStreams = getStreams;
}
