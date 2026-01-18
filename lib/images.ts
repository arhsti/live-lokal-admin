import { r2Get, r2List, r2Put, readBodyAsString } from './r2';

export type EventType = 'Mål' | 'Kort' | 'Bytte' | 'Alle';
export type ImageType = 'raw' | 'rendered';

export interface ImageMeta {
  id: string;
  number: string;
  eventType: EventType;
  description?: string;
  created_at?: string;
  type?: ImageType;
  sourceImageId?: string;
}

export interface ImageItem {
  id: string;
  imageUrl: string;
  created_at?: string;
  tags: { number: string; eventType: EventType; description?: string; type?: ImageType; sourceImageId?: string };
}

const RAW_PREFIX = 'uploads/raw/';
const RENDERED_PREFIX = 'uploads/rendered/';
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
  const [rawList, renderedList] = await Promise.all([
    r2List(RAW_PREFIX),
    r2List(RENDERED_PREFIX),
  ]);

  const items = [...(rawList.Contents || []), ...(renderedList.Contents || [])]
    .filter(obj => obj.Key)
    .sort((a, b) => {
      const at = a.LastModified ? a.LastModified.getTime() : 0;
      const bt = b.LastModified ? b.LastModified.getTime() : 0;
      return bt - at;
    });

  const metaMap = await loadMeta();
  return items.map(item => {
    const key = item.Key as string;
    const filename = key.replace(RAW_PREFIX, '').replace(RENDERED_PREFIX, '');
    const id = filename.replace(/\.[^/.]+$/, '');
    const imageUrl = `${process.env.R2_PUBLIC_BASE_URL}/${key}`;
    const meta = metaMap[id];
    const inferredType: ImageType = key.startsWith(RENDERED_PREFIX) ? 'rendered' : 'raw';
    return {
      id,
      imageUrl,
      created_at: meta?.created_at || (item.LastModified ? item.LastModified.toISOString() : undefined),
      tags: {
        number: meta?.number || '',
        eventType: meta?.eventType || 'Alle',
        description: meta?.description || '',
        type: meta?.type || inferredType,
        sourceImageId: meta?.sourceImageId,
      },
    };
  });
}

export async function getImageById(id: string): Promise<ImageItem | null> {
  const [rawList, renderedList] = await Promise.all([
    r2List(`${RAW_PREFIX}${id}`),
    r2List(`${RENDERED_PREFIX}${id}`),
  ]);

  const item = [...(rawList.Contents || []), ...(renderedList.Contents || [])]
    .find(obj => obj.Key);

  if (!item || !item.Key) return null;

  const key = item.Key as string;
  const imageUrl = `${process.env.R2_PUBLIC_BASE_URL}/${key}`;
  const metaMap = await loadMeta();
  const meta = metaMap[id];
  const inferredType: ImageType = key.startsWith(RENDERED_PREFIX) ? 'rendered' : 'raw';
  return {
    id,
    imageUrl,
    created_at: meta?.created_at || (item.LastModified ? item.LastModified.toISOString() : undefined),
    tags: {
      number: meta?.number || '',
      eventType: meta?.eventType || 'Alle',
      description: meta?.description || '',
      type: meta?.type || inferredType,
      sourceImageId: meta?.sourceImageId,
    },
  };
}

export async function updateImageMeta(id: string, number: string, eventType: EventType, description = '') {
  const map = await loadMeta();
  const existing = map[id];
  map[id] = {
    id,
    number,
    eventType,
    description,
    created_at: existing?.created_at || new Date().toISOString(),
    type: existing?.type,
    sourceImageId: existing?.sourceImageId,
  };
  await saveMeta(map);
  return map[id];
}

export async function registerRenderedImage(id: string, sourceImageId: string) {
  const map = await loadMeta();
  map[id] = {
    id,
    number: '',
    eventType: 'Alle',
    created_at: new Date().toISOString(),
    type: 'rendered',
    sourceImageId,
  };
  await saveMeta(map);
  return map[id];
}
