const { createRemoteJWKSet, jwtVerify } = require('jose');

const KENNI_ISSUER = process.env.KENNI_ISSUER; // e.g., https://idp.kenni.is
const KENNI_AUDIENCE = process.env.KENNI_AUDIENCE; // our API audience/client id
const KENNI_JWKS_URL = process.env.KENNI_JWKS_URL || (KENNI_ISSUER ? `${KENNI_ISSUER}/.well-known/jwks.json` : undefined);

let jwks;
if (KENNI_JWKS_URL) {
  jwks = createRemoteJWKSet(new URL(KENNI_JWKS_URL));
}

async function verifyKenniIdToken(idToken) {
  if (!jwks) {
    throw new Error('Kenni JWKS not configured');
  }

  const { payload } = await jwtVerify(idToken, jwks, {
    issuer: KENNI_ISSUER,
    audience: KENNI_AUDIENCE,
  });

  return payload;
}

function deriveDobFromKennitala(kennitala) {
  const cleaned = (kennitala || '').replace(/[^0-9]/g, '');
  if (cleaned.length < 10) return null;
  const dd = cleaned.substring(0, 2);
  const mm = cleaned.substring(2, 4);
  const yy = cleaned.substring(4, 6);
  const year = parseInt(yy, 10);
  const fullYear = year >= 50 ? 1900 + year : 2000 + year;
  const iso = `${fullYear}-${mm}-${dd}`;
  const date = new Date(iso + 'T00:00:00Z');
  return isNaN(date.getTime()) ? null : date;
}

function calculateAgeFromDob(dob) {
  if (!dob) return null;
  const today = new Date();
  let age = today.getUTCFullYear() - dob.getUTCFullYear();
  const m = today.getUTCMonth() - dob.getUTCMonth();
  if (m < 0 || (m === 0 && today.getUTCDate() < dob.getUTCDate())) {
    age--;
  }
  return age;
}

module.exports = {
  verifyKenniIdToken,
  deriveDobFromKennitala,
  calculateAgeFromDob,
};


