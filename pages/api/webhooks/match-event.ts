import type { NextApiRequest, NextApiResponse } from 'next';
import { addWebhookLog } from '@/lib/webhookLog';

// STEP 1: In-memory lookup table (ObjectId_Match → fiksid_livelokal)
// Example: Only these match IDs are relevant for our clubs
const matchToClub: Record<string, string> = {
  '1234567': '12345', // Example: matchId 1234567 belongs to club 12345
  '7654321': '54321',
  '9999999': '98900',
  // Add more mappings as needed
};

// STEP 2: Thin webhook controller
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let objectIdMatch = '';
  let clubId = '';
  let rawPayload: any = {};
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    rawPayload = body;
    objectIdMatch = body?.ObjectId_Match || body?.objectid_match || '';
    clubId = matchToClub[objectIdMatch] || '';
  } catch {
    // Log ignored event (malformed)
    addWebhookLog({
      id: `${Date.now()}-malformed`,
      receivedAt: new Date().toISOString(),
      isRelevant: false,
      reason: 'Malformed JSON',
      payload: req.body,
    });
    return res.status(200).json({ ignored: true });
  }

  // STEP 3: Early exit if not relevant
  if (!clubId) {
    addWebhookLog({
      id: `${Date.now()}-${objectIdMatch}`,
      receivedAt: new Date().toISOString(),
      matchId: objectIdMatch,
      isRelevant: false,
      reason: 'No matching club',
      payload: rawPayload,
    });
    return res.status(200).json({ ignored: true });
  }

  // STEP 4: Minimal event persistence (simulate DB write)
  const event = {
    eventId: `${Date.now()}-${objectIdMatch}`,
    clubId,
    matchId: objectIdMatch,
    timestamp: new Date().toISOString(),
    status: 'received',
  };
  // Log relevant event
  addWebhookLog({
    id: event.eventId,
    receivedAt: event.timestamp,
    clubId,
    matchId: objectIdMatch,
    isRelevant: true,
    payload: rawPayload,
  });

  // STEP 5: Async pipeline trigger (simulate)
  // TODO: Enqueue for background processing

  // STEP 6: Log relevant event (console for demo)
  console.log('Relevant event received:', event);

  return res.status(200).json({ success: true, event });
}
