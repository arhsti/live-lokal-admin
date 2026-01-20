import type { NextApiRequest, NextApiResponse } from 'next';

const COOKIE_NAME = 'll_club';

export function parseCookies(cookieHeader?: string) {
  if (!cookieHeader) return {} as Record<string, string>;
  return cookieHeader.split(';').reduce((acc, part) => {
    const [rawKey, ...rawValue] = part.trim().split('=');
    if (!rawKey) return acc;
    acc[rawKey] = decodeURIComponent(rawValue.join('='));
    return acc;
  }, {} as Record<string, string>);
}

export function getCurrentClub(req: NextApiRequest) {
  const cookies = parseCookies(req.headers.cookie);
  const club = cookies[COOKIE_NAME];
  if (!club || !/^[0-9]{5}$/.test(club)) return null;
  return club;
}

export function requireClub(req: NextApiRequest, res: NextApiResponse) {
  const club = getCurrentClub(req);
  if (!club) {
    res.status(401).json({ error: 'Unauthorized' });
    return null;
  }
  return club;
}

export function buildAuthCookie(club: string) {
  const secure = process.env.NODE_ENV === 'production' ? 'Secure; ' : '';
  return `${COOKIE_NAME}=${encodeURIComponent(club)}; ${secure}HttpOnly; Path=/; SameSite=Lax`;
}

export function clearAuthCookie() {
  const secure = process.env.NODE_ENV === 'production' ? 'Secure; ' : '';
  return `${COOKIE_NAME}=; ${secure}HttpOnly; Path=/; SameSite=Lax; Max-Age=0`;
}
