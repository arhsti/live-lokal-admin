import type { NextApiRequest, NextApiResponse } from 'next';
import { requireClub } from '@/lib/auth';

const WEBHOOK_URL = 'https://livelokal.app.n8n.cloud/webhook/livelokalKlubb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const club = requireClub(req, res);
    if (!club) return;
    const { imageUrl, description, draktnummer, hendelse } = req.body || {};
    if (!imageUrl || typeof imageUrl !== 'string') {
      return res.status(400).json({ success: false, error: 'imageUrl is required' });
    }

    const payload = {
      imageUrl,
      description: typeof description === 'string' ? description : '',
      draktnummer: typeof draktnummer === 'string' ? draktnummer : '',
      hendelse: typeof hendelse === 'string' ? hendelse : '',
      source: 'live-lokal-app',
      timestamp: new Date().toISOString(),
      fiksid_livelokal: club,
    };

    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      return res.status(400).json({
        success: false,
        error: text || 'Webhook request failed',
      });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Webhook request failed';
    return res.status(500).json({ success: false, error: message });
  }
}
