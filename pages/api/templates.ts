import type { NextApiRequest, NextApiResponse } from 'next';
import { listTemplates, saveTemplate } from '@/lib/templates';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const templates = await listTemplates();
      return res.status(200).json(templates);
    } catch (error) {
      console.error('Failed to list templates:', error);
      return res.status(500).json({ error: 'Failed to load templates' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { id, name, image_id, image_url, text_boxes } = req.body || {};
      if (!name || !image_id || !image_url || !Array.isArray(text_boxes)) {
        return res.status(400).json({ error: 'Invalid template payload' });
      }

      const templateId = id || `tpl_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      const template = {
        id: templateId,
        name,
        image_id,
        image_url,
        text_boxes,
      };

      await saveTemplate(template);
      return res.status(200).json(template);
    } catch (error) {
      console.error('Failed to save template:', error);
      return res.status(500).json({ error: 'Failed to save template' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).json({ error: 'Method not allowed' });
}
