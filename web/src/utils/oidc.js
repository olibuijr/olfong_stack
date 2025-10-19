function randomString(length = 32) {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const cryptoObj = window.crypto || window.msCrypto;
  if (cryptoObj && cryptoObj.getRandomValues) {
    const values = new Uint32Array(length);
    cryptoObj.getRandomValues(values);
    for (let i = 0; i < length; i++) {
      result += charset[values[i] % charset.length];
    }
    return result;
  }
  for (let i = 0; i < length; i++) {
    result += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return result;
}

export function buildKenniAuthorizeUrl() {
  const issuer = import.meta.env.VITE_KENNI_ISSUER;
  const clientId = import.meta.env.VITE_KENNI_CLIENT_ID;
  const redirectUri = import.meta.env.VITE_KENNI_REDIRECT_URI || `${window.location.origin}/auth/callback`;
  const scope = import.meta.env.VITE_KENNI_SCOPE || 'openid profile phone';
  const responseType = import.meta.env.VITE_KENNI_RESPONSE_TYPE || 'id_token';
  const responseMode = import.meta.env.VITE_KENNI_RESPONSE_MODE || 'fragment';

  if (!issuer || !clientId) {
    throw new Error('Kenni OIDC not configured');
  }

  const state = randomString(24);
  const nonce = randomString(24);
  sessionStorage.setItem('kenni_oidc_state', state);
  sessionStorage.setItem('kenni_oidc_nonce', nonce);

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    scope,
    response_type: responseType,
    response_mode: responseMode,
    state,
    nonce,
  });

  return `${issuer}/authorize?${params.toString()}`;
}

export function parseFragment(hash) {
  const trimmed = hash.startsWith('#') ? hash.substring(1) : hash;
  const params = new URLSearchParams(trimmed);
  const idToken = params.get('id_token');
  const state = params.get('state');
  const error = params.get('error');
  const errorDescription = params.get('error_description');
  return { idToken, state, error, errorDescription };
}


