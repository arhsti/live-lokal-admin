import type { NextApiRequest, NextApiResponse } from 'next';
import { promises as fs } from 'fs';
import formidable from 'formidable';
import { triggerStoryForEvent } from '@/lib/triggerStoryForEvent';
import { requireClub } from '@/lib/auth';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const club = requireClub(req, res);
    if (!club) return;
    const form = formidable({ multiples: false });
    const { fields, files } = await new Promise<{ fields: any; files: any }>((resolve, reject) => {
      form.parse(req, (err: any, fields: any, files: any) => {
        if (err) return reject(err);
        resolve({ fields, files });
      });
    });

    const eventId = typeof fields.eventId === 'string'
      ? fields.eventId
      : Array.isArray(fields.eventId)
        ? fields.eventId[0]
        : null;

    if (!eventId) {
      return res.status(400).json({ success: false, error: 'eventId is required' });
    }

    const overlayFile = Array.isArray(files.overlayPng) ? files.overlayPng[0] : files.overlayPng;
    if (!overlayFile || typeof overlayFile.filepath !== 'string') {
      return res.status(400).json({ success: false, error: 'overlayPng is required' });
    }

    const overlayBuffer = await fs.readFile(overlayFile.filepath);
    const { imageUrl } = await triggerStoryForEvent(club, eventId, overlayBuffer);
    return res.status(200).json({ success: true, imageUrl });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Render failed';
    return res.status(500).json({ success: false, error: message });
  }
}
