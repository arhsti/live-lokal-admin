import type { NextApiRequest, NextApiResponse } from 'next';
import { v4 as uuidv4 } from 'uuid';
import { addEvent, listEvents } from '@/lib/events';

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
      const events = await listEvents();
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

      const hendelse = typeof properties.Hendelse === 'string' ? properties.Hendelse.trim() : '';
      const tidspunkt = typeof properties.Tidspunkt === 'string' ? properties.Tidspunkt.trim() : '';
      const draktnummer = typeof properties.Draktnummer === 'string' ? properties.Draktnummer.trim() : '';

      if (!hendelse || !tidspunkt || !draktnummer) {
        return res.status(400).json({ error: 'Missing required event properties' });
      }

      const event = await addEvent({
        id: uuidv4(),
        hendelse,
        tidspunkt,
        draktnummer,
        createdAt: new Date().toISOString(),
      });

      return res.status(200).json({ success: true, event });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to store event';
      return res.status(500).json({ error: message });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).json({ error: 'Method not allowed' });
}
