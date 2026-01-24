// /pages/api/test/seed-images.ts
// Dev-only endpoint to seed images for Playwright/UI tests
import type { NextApiRequest, NextApiResponse } from 'next';
import { addImage } from '@/lib/images';

const TEST_CLUB_ID = '12345';
const TEST_IMAGES = [
  {
    key: 'test-image-1.jpg',
    url: 'https://placehold.co/360x640/png?text=Test+Image+1',
    width: 360,
    height: 640,
  },
  {
    key: 'test-image-2.jpg',
    url: 'https://placehold.co/360x640/png?text=Test+Image+2',
    width: 360,
    height: 640,
  },
  {
    key: 'test-image-3.jpg',
    url: 'https://placehold.co/360x640/png?text=Test+Image+3',
    width: 360,
    height: 640,
  },
];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (process.env.NODE_ENV !== 'development') {
    return res.status(403).json({ error: 'Forbidden' });
  }
  for (const img of TEST_IMAGES) {
    addImage({
      key: img.key,
      url: img.url,
      width: img.width,
      height: img.height,
      clubId: TEST_CLUB_ID,
      createdAt: new Date().toISOString(),
    });
  }
  res.status(200).json({ seeded: true, clubId: TEST_CLUB_ID, images: TEST_IMAGES });
}