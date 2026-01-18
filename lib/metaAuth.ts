const TOKEN_SAFETY_WINDOW_MS = 60 * 1000;

let cachedToken: { value: string; expiresAt: number } | null = null;
let cachedPage: { id: string; accessToken: string } | null = null;
let cachedIgUserId: string | null = null;

export async function getLongLivedAccessToken(version: string) {
  const now = Date.now();
  if (cachedToken && cachedToken.expiresAt > now + TOKEN_SAFETY_WINDOW_MS) {
    return cachedToken.value;
  }

  const { FB_CLIENT_ID, FB_CLIENT_SECRET, FB_EXCHANGE_TOKEN } = process.env;
  if (!FB_CLIENT_ID || !FB_CLIENT_SECRET || !FB_EXCHANGE_TOKEN) {
    throw new Error('Instagram OAuth configuration missing');
  }

  const response = await fetch(`https://graph.facebook.com/${version}/oauth/access_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'fb_exchange_token',
      client_id: FB_CLIENT_ID,
      client_secret: FB_CLIENT_SECRET,
      fb_exchange_token: FB_EXCHANGE_TOKEN,
    }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data?.access_token) {
    const err = data?.error;
    const message = err?.message || 'Failed to exchange access token';
    const code = err?.code ? ` (code ${err.code})` : '';
    throw new Error(`${message}${code}`);
  }

  const expiresIn = typeof data.expires_in === 'number' ? data.expires_in : 0;
  cachedToken = {
    value: data.access_token as string,
    expiresAt: now + Math.max(expiresIn, 0) * 1000,
  };

  return cachedToken.value;
}

export async function getPageAccess(version: string, accessToken: string) {
  if (cachedPage) return cachedPage;
  const url = new URL(`https://graph.facebook.com/${version}/me/accounts`);
  url.searchParams.set('access_token', accessToken);
  const res = await fetch(url.toString());

  const data = await res.json().catch(() => ({}));
  if (!res.ok || !Array.isArray(data?.data) || data.data.length === 0) {
    const err = data?.error;
    const message = err?.message || 'Failed to fetch Facebook pages';
    const code = err?.code ? ` (code ${err.code})` : '';
    throw new Error(`${message}${code}`);
  }

  const page = data.data[0];
  if (!page?.id || !page?.access_token) {
    throw new Error('Facebook page access token missing');
  }

  cachedPage = { id: page.id, accessToken: page.access_token };
  return cachedPage;
}

export async function getInstagramBusinessAccountId(version: string, pageId: string, pageAccessToken: string) {
  if (cachedIgUserId) return cachedIgUserId;

  const url = new URL(`https://graph.facebook.com/${version}/${pageId}`);
  url.searchParams.set('fields', 'instagram_business_account');
  url.searchParams.set('access_token', pageAccessToken);

  const res = await fetch(url.toString());
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data?.instagram_business_account?.id) {
    const err = data?.error;
    const message = err?.message || 'Failed to fetch Instagram business account';
    const code = err?.code ? ` (code ${err.code})` : '';
    throw new Error(`${message}${code}`);
  }

  cachedIgUserId = data.instagram_business_account.id;
  return cachedIgUserId;
}
