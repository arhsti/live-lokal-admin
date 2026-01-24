// /pages/api/test/seed-events.ts
// Dev-only endpoint to seed events for Playwright/UI tests
import type { NextApiRequest, NextApiResponse } from 'next';
import { addWebhookLog } from '@/lib/webhookLog';

const TEST_CLUB_ID = '12345';
const TEST_MATCH_IDS = ['1234567', '1234568', '1234569'];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (process.env.NODE_ENV !== 'development') {
    return res.status(403).json({ error: 'Forbidden' });
  }
  for (const matchId of TEST_MATCH_IDS) {
    const event = {
      eventId: `${Date.now()}-${matchId}`,
      clubId: TEST_CLUB_ID,
      matchId,
      timestamp: new Date().toISOString(),
      status: 'received',
    };
    addWebhookLog({
      id: event.eventId,
      receivedAt: event.timestamp,
      clubId: TEST_CLUB_ID,
      matchId,
      isRelevant: true,
      payload: { seeded: true },
    });
  }
  res.status(200).json({ seeded: true, clubId: TEST_CLUB_ID, matchIds: TEST_MATCH_IDS });
}
