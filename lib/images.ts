import { r2Get, r2List, r2Put, readBodyAsString } from './r2';

export type EventType = 'Mål' | 'Kort' | 'Bytte' | 'Alle';

export interface ImageMeta {
  id: string;
  number: string;
  eventType: EventType;
  created_at?: string;
}

export interface ImageItem {
  id: string;
  image_url: string;
  created_at?: string;
  tags: { number: string; eventType: EventType };
}

const UPLOAD_PREFIX = 'uploads/raw/';
const META_KEY = 'images/metadata.json';

async function loadMeta(): Promise<Record<string, ImageMeta>> {
  try {
    const obj = await r2Get(META_KEY);
    const raw = await readBodyAsString(obj.Body);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

async function saveMeta(map: Record<string, ImageMeta>) {
  await r2Put(META_KEY, JSON.stringify(map, null, 2));
}

export async function listImages(): Promise<ImageItem[]> {
  const list = await r2List(UPLOAD_PREFIX);
  const items = (list.Contents || [])
    .filter(obj => obj.Key)
    .sort((a, b) => {
      const at = a.LastModified ? a.LastModified.getTime() : 0;
      const bt = b.LastModified ? b.LastModified.getTime() : 0;
      return bt - at;
    });

  const metaMap = await loadMeta();
  return items.map(item => {
    const key = item.Key as string;
    const filename = key.replace(UPLOAD_PREFIX, '');
    const id = filename.replace(/\.[^/.]+$/, '');
    const image_url = `${process.env.R2_PUBLIC_BASE_URL}/${key}`;
    const meta = metaMap[id];
    return {
      id,
      image_url,
      created_at: meta?.created_at || (item.LastModified ? item.LastModified.toISOString() : undefined),
      tags: {
        number: meta?.number || '',
        eventType: meta?.eventType || 'Alle',
      },
    };
  });
}

export async function updateImageMeta(id: string, number: string, eventType: EventType) {
  const map = await loadMeta();
  const existing = map[id];
  map[id] = {
    id,
    number,
    eventType,
    created_at: existing?.created_at || new Date().toISOString(),
  };
  await saveMeta(map);
  return map[id];
}
