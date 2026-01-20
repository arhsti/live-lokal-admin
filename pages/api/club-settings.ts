import type { NextApiRequest, NextApiResponse } from 'next';
import { getClubSettings, saveClubSettings } from '@/lib/club-settings';
import { requireClub } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const club = requireClub(req, res);
  if (!club) return;

  if (req.method === 'GET') {
    const settings = await getClubSettings(club);
    return res.status(200).json(settings);
  }

  if (req.method === 'POST') {
    const { clubName } = req.body || {};
    const settings = await saveClubSettings(club, {
      fiksid_livelokal: club,
      clubName: typeof clubName === 'string' ? clubName.trim() : undefined,
    });
    return res.status(200).json(settings);
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).json({ error: 'Method not allowed' });
}
