import type { NextApiRequest, NextApiResponse } from 'next';
import { getCurrentClub } from '@/lib/auth';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const club = getCurrentClub(req);
  if (!club) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  return res.status(200).json({ fiksid_livelokal: club });
}
