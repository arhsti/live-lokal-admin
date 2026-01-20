import type { NextApiRequest, NextApiResponse } from 'next';
import { getImageById, listImages, updateImageMeta, type EventType } from '@/lib/images';
import { requireClub } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const club = requireClub(req, res);
      if (!club) return;
      const { imageId } = req.query;
      if (imageId) {
        const id = Array.isArray(imageId) ? imageId[0] : imageId;
        const image = await getImageById(club, String(id));
        if (!image) {
          return res.status(404).json({ error: 'Image not found' });
        }
        return res.status(200).json(image);
      }

      const images = await listImages(club);
      return res.status(200).json(images);
    } catch (error) {
      console.error('Failed to list images:', error);
      return res.status(500).json({ error: 'Failed to list images' });
    }
  }

  if (req.method === 'POST') {
    try {
      const club = requireClub(req, res);
      if (!club) return;
      const { id, number, eventType, description } = req.body || {};
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

      const meta = await updateImageMeta(
        club,
        String(id),
        String(parsed),
        eventType as EventType,
        typeof description === 'string' ? description : '',
      );
      return res.status(200).json({ id: meta.id, tags: { number: meta.number, eventType: meta.eventType, description: meta.description || '' } });
    } catch (error) {
      console.error('Failed to update image tags:', error);
      return res.status(500).json({ error: 'Failed to update tags' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).json({ error: 'Method not allowed' });
}
