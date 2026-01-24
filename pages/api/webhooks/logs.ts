import type { NextApiRequest, NextApiResponse } from 'next';
import { getWebhookLogs, getWebhookStats } from '@/lib/webhookLog';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.query.stats) {
    return res.status(200).json(getWebhookStats());
  }
  const filter = req.query.filter as string | undefined;
  const matchId = req.query.matchId as string | undefined;
  return res.status(200).json(getWebhookLogs({ filter: filter as any, matchId }));
}
