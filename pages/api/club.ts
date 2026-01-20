import type { NextApiRequest, NextApiResponse } from 'next';
import { getCurrentClub } from '@/lib/auth';
import { getClubSettings } from '@/lib/club-settings';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const club = getCurrentClub(req);
  if (!club) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  return getClubSettings(club)
    .then((settings) => res.status(200).json({
      fiksid_livelokal: club,
      clubName: settings.clubName || null,
    }))
    .catch(() => res.status(200).json({ fiksid_livelokal: club, clubName: null }));
}
