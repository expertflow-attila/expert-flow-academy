// Cloudflare Stream signed token generálás
// Doc: https://developers.cloudflare.com/stream/viewing-videos/securing-your-stream/
//
// Két lehetőség:
//   (a) Sajat signing key (JWK) — gyorsabb (no roundtrip), itt ezt használjuk.
//   (b) Token endpoint Cloudflare-en — lassabb, opcionális fallback.

import crypto from "node:crypto";

type SignTokenParams = {
  videoUid: string;
  expiresInSeconds?: number;
};

const accountId = process.env.CF_STREAM_ACCOUNT_ID;
const signingKeyId = process.env.CF_STREAM_SIGNING_KEY_ID;
const signingKeyJwkRaw = process.env.CF_STREAM_SIGNING_KEY_JWK;

let signingKey: crypto.KeyObject | null = null;
function getSigningKey(): crypto.KeyObject {
  if (signingKey) return signingKey;
  if (!signingKeyJwkRaw) throw new Error("CF_STREAM_SIGNING_KEY_JWK kötelező");
  const jwk = JSON.parse(signingKeyJwkRaw);
  signingKey = crypto.createPrivateKey({ key: jwk, format: "jwk" });
  return signingKey;
}

function base64url(input: Buffer | string): string {
  return Buffer.from(input)
    .toString("base64")
    .replace(/=+$/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

// Szűkebb default expiry (30 perc) — a Stream player automatikusan
// új tokent kér ha kell, és egy szivárgott token rövidebb ideig használható.
export async function signStreamToken({
  videoUid,
  expiresInSeconds = 30 * 60,
}: SignTokenParams): Promise<string> {
  if (!accountId || !signingKeyId) {
    throw new Error("CF_STREAM_ACCOUNT_ID és CF_STREAM_SIGNING_KEY_ID kötelező");
  }
  const header = { alg: "RS256", kid: signingKeyId };
  const now = Math.floor(Date.now() / 1000);
  // Geo-allow-list — Magyarország + szomszéd országok. Egy lopott token így
  // EU-n kívülről nem használható. Bővítsd ha a target piac nyílik.
  const allowedCountries = (process.env.CF_STREAM_ALLOWED_COUNTRIES ?? "HU,RO,SK,AT,DE,UA,RS,HR,SI")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const payload = {
    sub: videoUid,
    kid: signingKeyId,
    exp: now + expiresInSeconds,
    nbf: now - 60,
    accessRules: [
      { type: "ip.geoip.country", action: "allow", country: allowedCountries },
      { type: "any", action: "block" },
    ],
  };
  const headerB64 = base64url(JSON.stringify(header));
  const payloadB64 = base64url(JSON.stringify(payload));
  const data = `${headerB64}.${payloadB64}`;
  const signer = crypto.createSign("RSA-SHA256");
  signer.update(data);
  signer.end();
  const signature = signer.sign(getSigningKey());
  const sigB64 = base64url(signature);
  return `${data}.${sigB64}`;
}

export function streamManifestUrl(signedToken: string): string {
  return `https://customer-${accountId}.cloudflarestream.com/${signedToken}/manifest/video.m3u8`;
}

export function streamIframeUrl(signedToken: string): string {
  return `https://customer-${accountId}.cloudflarestream.com/${signedToken}/iframe`;
}
