import type { NextApiRequest, NextApiResponse } from 'next';
import { listImages, updateImageMeta, type EventType } from '@/lib/images';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const images = await listImages();
      return res.status(200).json(images);
    } catch (error) {
      console.error('Failed to list images:', error);
      return res.status(500).json({ error: 'Failed to list images' });
    }
  }

  if (req.method === 'PUT') {
    try {
      const { id, number, eventType } = req.body || {};
      if (!id) {
        return res.status(400).json({ error: 'Missing image id' });
      }

      const allowed = ['Mål', 'Kort', 'Bytte', 'Alle'];
      if (typeof eventType !== 'string' || !allowed.includes(eventType)) {
        return res.status(400).json({ error: 'valid eventType is required' });
      }

      const parsed = parseInt(String(number ?? ''), 10);
      if (Number.isNaN(parsed) || parsed < 1 || parsed > 99) {
        return res.status(400).json({ error: 'number must be an integer between 1 and 99' });
      }

      const meta = await updateImageMeta(String(id), String(parsed), eventType as EventType);
      return res.status(200).json({ id: meta.id, tags: { number: meta.number, eventType: meta.eventType } });
    } catch (error) {
      console.error('Failed to update image tags:', error);
      return res.status(500).json({ error: 'Failed to update tags' });
    }
  }

  res.setHeader('Allow', ['GET', 'PUT']);
  return res.status(405).json({ error: 'Method not allowed' });
}
