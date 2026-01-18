import type { NextApiRequest, NextApiResponse } from 'next';
import { getInstagramBusinessAccountId, getLongLivedAccessToken, getPageAccess } from '@/lib/metaAuth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { FB_CLIENT_ID, FB_CLIENT_SECRET, FB_EXCHANGE_TOKEN, INSTAGRAM_GRAPH_API_VERSION } = process.env;
    if (!FB_CLIENT_ID || !FB_CLIENT_SECRET || !FB_EXCHANGE_TOKEN) {
      return res.status(500).json({ success: false, error: 'Instagram OAuth configuration missing' });
    }

    const { imageUrl } = req.body || {};
    if (!imageUrl || typeof imageUrl !== 'string') {
      return res.status(400).json({ success: false, error: 'imageUrl is required' });
    }

    const version = INSTAGRAM_GRAPH_API_VERSION || 'v19.0';
    const baseUrl = `https://graph.facebook.com/${version}`;

    const longLivedToken = await getLongLivedAccessToken(version);
    const page = await getPageAccess(version, longLivedToken);
    const igUserId = await getInstagramBusinessAccountId(version, page.id, page.accessToken);

    const containerRes = await fetch(`${baseUrl}/${igUserId}/media`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        image_url: imageUrl,
        media_type: 'STORIES',
        access_token: longLivedToken,
      }),
    });

    const containerData = await containerRes.json().catch(() => ({}));
    if (!containerRes.ok || !containerData?.id) {
      const err = containerData?.error;
      const message = err?.message || 'Failed to create media container';
      const code = err?.code ? ` (code ${err.code})` : '';
      console.error('Instagram container error:', containerData);
      return res.status(400).json({ success: false, error: `${message}${code}` });
    }

    const publishRes = await fetch(`${baseUrl}/${igUserId}/media_publish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        creation_id: containerData.id,
        access_token: longLivedToken,
      }),
    });

    const publishData = await publishRes.json().catch(() => ({}));
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
