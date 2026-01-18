import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { INSTAGRAM_ACCESS_TOKEN, INSTAGRAM_IG_USER_ID, INSTAGRAM_GRAPH_API_VERSION } = process.env;
    if (!INSTAGRAM_ACCESS_TOKEN || !INSTAGRAM_IG_USER_ID || !INSTAGRAM_GRAPH_API_VERSION) {
      return res.status(500).json({ success: false, error: 'Missing Instagram configuration' });
    }

    const { imageUrl } = req.body || {};
    if (!imageUrl || typeof imageUrl !== 'string') {
      return res.status(400).json({ success: false, error: 'imageUrl is required' });
    }

    const version = INSTAGRAM_GRAPH_API_VERSION;
    const baseUrl = `https://graph.facebook.com/${version}`;

    const containerRes = await fetch(`${baseUrl}/${INSTAGRAM_IG_USER_ID}/media`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        image_url: imageUrl,
        media_type: 'STORIES',
        access_token: INSTAGRAM_ACCESS_TOKEN,
      }),
    });

    const containerData = await containerRes.json();
    if (!containerRes.ok || !containerData?.id) {
      const err = containerData?.error;
      const message = err?.message || 'Failed to create media container';
      const code = err?.code ? ` (code ${err.code})` : '';
      console.error('Instagram container error:', containerData);
      return res.status(400).json({ success: false, error: `${message}${code}` });
    }

    const publishRes = await fetch(`${baseUrl}/${INSTAGRAM_IG_USER_ID}/media_publish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        creation_id: containerData.id,
        access_token: INSTAGRAM_ACCESS_TOKEN,
      }),
    });

    const publishData = await publishRes.json();
    if (!publishRes.ok) {
      const err = publishData?.error;
      const message = err?.message || 'Failed to publish story';
      const code = err?.code ? ` (code ${err.code})` : '';
      console.error('Instagram publish error:', publishData);
      return res.status(400).json({ success: false, error: `${message}${code}` });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Instagram story error:', error);
    const message = error instanceof Error ? error.message : 'Instagram story failed';
    return res.status(500).json({ success: false, error: message });
  }
}
