import { r2Get, r2List, r2Put, readBodyAsString } from './r2';

export type EventType = 'Mål' | 'Kort' | 'Bytte' | 'Alle';
export type ImageType = 'processed' | 'rendered';

export interface ImageMeta {
  id: string;
  number: string;
  eventType: EventType;
  description?: string;
  created_at?: string;
  type?: ImageType;
  sourceImageId?: string;
  fiksid_livelokal: string;
}

export interface ImageItem {
  id: string;
  imageUrl: string;
  created_at?: string;
  fiksid_livelokal: string;
  tags: { number: string; eventType: EventType; description?: string; type?: ImageType; sourceImageId?: string; fiksid_livelokal: string };
}

const processedPrefix = (club: string) => `${club}/images/processed/`;
const renderedPrefix = (club: string) => `${club}/rendered/`;
const metaKey = (club: string) => `${club}/images/metadata.json`;

async function loadMeta(club: string): Promise<Record<string, ImageMeta>> {
  try {
    const obj = await r2Get(metaKey(club));
    const raw = await readBodyAsString(obj.Body);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

async function saveMeta(club: string, map: Record<string, ImageMeta>) {
  await r2Put(metaKey(club), JSON.stringify(map, null, 2));
}

export async function listImages(club: string): Promise<ImageItem[]> {
  const [processedList, renderedList] = await Promise.all([
    r2List(processedPrefix(club)),
    r2List(renderedPrefix(club)),
  ]);

  const items = [...(processedList.Contents || []), ...(renderedList.Contents || [])]
    .filter(obj => obj.Key)
    .sort((a, b) => {
      const at = a.LastModified ? a.LastModified.getTime() : 0;
      const bt = b.LastModified ? b.LastModified.getTime() : 0;
      return bt - at;
    });

  const metaMap = await loadMeta(club);
  return items.map(item => {
    const key = item.Key as string;
    const filename = key.replace(processedPrefix(club), '').replace(renderedPrefix(club), '');
    const id = filename.replace(/\.[^/.]+$/, '');
    const imageUrl = `${process.env.R2_PUBLIC_BASE_URL}/${key}`;
    const meta = metaMap[id];
    const inferredType: ImageType = key.startsWith(renderedPrefix(club)) ? 'rendered' : 'processed';
    return {
      id,
      imageUrl,
      fiksid_livelokal: club,
      created_at: meta?.created_at || (item.LastModified ? item.LastModified.toISOString() : undefined),
      tags: {
        number: meta?.number || '',
        eventType: meta?.eventType || 'Alle',
        description: meta?.description || '',
        type: meta?.type || inferredType,
        sourceImageId: meta?.sourceImageId,
        fiksid_livelokal: club,
      },
    };
  });
}

export async function getImageById(club: string, id: string): Promise<ImageItem | null> {
  const [processedList, renderedList] = await Promise.all([
    r2List(`${processedPrefix(club)}${id}`),
    r2List(`${renderedPrefix(club)}${id}`),
  ]);

  const item = [...(processedList.Contents || []), ...(renderedList.Contents || [])]
    .find(obj => obj.Key);

  if (!item || !item.Key) return null;

  const key = item.Key as string;
  const imageUrl = `${process.env.R2_PUBLIC_BASE_URL}/${key}`;
  const metaMap = await loadMeta(club);
  const meta = metaMap[id];
  const inferredType: ImageType = key.startsWith(renderedPrefix(club)) ? 'rendered' : 'processed';
  return {
    id,
    imageUrl,
    fiksid_livelokal: club,
    created_at: meta?.created_at || (item.LastModified ? item.LastModified.toISOString() : undefined),
    tags: {
      number: meta?.number || '',
      eventType: meta?.eventType || 'Alle',
      description: meta?.description || '',
      type: meta?.type || inferredType,
      sourceImageId: meta?.sourceImageId,
      fiksid_livelokal: club,
    },
  };
}

export async function updateImageMeta(club: string, id: string, number: string, eventType: EventType, description = '') {
  const map = await loadMeta(club);
  const existing = map[id];
  map[id] = {
    id,
    number,
    eventType,
    description,
    created_at: existing?.created_at || new Date().toISOString(),
    type: existing?.type,
    sourceImageId: existing?.sourceImageId,
    fiksid_livelokal: club,
  };
  await saveMeta(club, map);
  return map[id];
}

export async function registerRenderedImage(club: string, id: string, sourceImageId: string) {
  const map = await loadMeta(club);
  map[id] = {
    id,
    number: '',
    eventType: 'Alle',
    created_at: new Date().toISOString(),
    type: 'rendered',
    sourceImageId,
    fiksid_livelokal: club,
  };
  await saveMeta(club, map);
  return map[id];
}
