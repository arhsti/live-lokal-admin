import type { NextApiRequest, NextApiResponse } from 'next';
import { v4 as uuidv4 } from 'uuid';
import { addEvent, listEvents } from '@/lib/events';
import { requireClub } from '@/lib/auth';

const BASIC_USERNAME = 'admin';
const BASIC_PASSWORD = 'admin';

function hasValidAuth(req: NextApiRequest) {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Basic ')) return false;
  const encoded = header.replace('Basic ', '').trim();
  const decoded = Buffer.from(encoded, 'base64').toString('utf-8');
  return decoded === `${BASIC_USERNAME}:${BASIC_PASSWORD}`;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const club = requireClub(req, res);
      if (!club) return;
      const events = await listEvents(club);
      return res.status(200).json(events);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load events';
      return res.status(500).json({ error: message });
    }
  }

  if (req.method === 'POST') {
    if (!hasValidAuth(req)) {
      res.setHeader('WWW-Authenticate', 'Basic realm="events"');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      const payload = req.body || {};
      const properties = payload.Properties || {};
      const club = typeof payload.fiksid_livelokal === 'string' ? payload.fiksid_livelokal.trim() : '';
      if (!/^[0-9]{5}$/.test(club)) {
        return res.status(400).json({ error: 'fiksid_livelokal is required' });
      }

      const hendelse = typeof properties.Hendelse === 'string' ? properties.Hendelse.trim() : '';
      const tidspunkt = typeof properties.Tidspunkt === 'string' ? properties.Tidspunkt.trim() : '';
      const draktnummer = typeof properties.Draktnummer === 'string' ? properties.Draktnummer.trim() : '';
      const objectIdMatch = typeof properties.ObjectId_Match === 'string'
        ? properties.ObjectId_Match.trim()
        : typeof properties.ObjectIdMatch === 'string'
          ? properties.ObjectIdMatch.trim()
          : typeof properties.ObjectId === 'string'
            ? properties.ObjectId.trim()
            : typeof properties.objectid_match === 'string'
              ? properties.objectid_match.trim()
              : '';

      if (!hendelse || !tidspunkt || !draktnummer || !objectIdMatch) {
        return res.status(400).json({ error: 'Missing required event properties' });
      }
      if (!/^[0-9]{7}$/.test(objectIdMatch)) {
        return res.status(400).json({ error: 'objectId_match must be 7 digits' });
      }

      const event = await addEvent(club, {
        id: uuidv4(),
        hendelse,
        tidspunkt,
        draktnummer,
        objectId_match: objectIdMatch,
        createdAt: new Date().toISOString(),
        status: 'pending',
        fiksid_livelokal: club,
      });

      // Optional auto-trigger: uncomment to auto-post on receive
      // await triggerStoryForEvent(event.id);

      return res.status(200).json({ success: true, eventId: event.id });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to store event';
      return res.status(500).json({ error: message });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).json({ error: 'Method not allowed' });
}
