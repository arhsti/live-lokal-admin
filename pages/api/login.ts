import type { NextApiRequest, NextApiResponse } from 'next';
import { buildAuthCookie } from '@/lib/auth';

const DEFAULT_PASSWORD = 'admin';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { fiksid_livelokal, password } = req.body || {};
  const club = typeof fiksid_livelokal === 'string' ? fiksid_livelokal.trim() : '';
  if (!/^[0-9]{5}$/.test(club)) {
    return res.status(400).json({ error: 'Invalid fiksid_livelokal' });
  }

  const expected = process.env.LIVELOKAL_PASSWORD || DEFAULT_PASSWORD;
  if (typeof password !== 'string' || password !== expected) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  res.setHeader('Set-Cookie', buildAuthCookie(club));
  return res.status(200).json({ success: true });
}
