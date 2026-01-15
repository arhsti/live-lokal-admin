export interface ImageWithTags {
  id: string;
  image_url: string;
  tags: { number: string; eventType: string };
}

export function selectImageByTags(images: ImageWithTags[], criteria: { number?: string; eventType?: string }): ImageWithTags | null {
  if (!images || images.length === 0) return null;

  const { number, eventType } = criteria as any || {};

  // Selection rules with eventType
  // 1) Match on number & eventType
  if (number && eventType) {
    const nExact = images.find(i => i.tags.number === number && i.tags.eventType === eventType);
    if (nExact) return nExact;
    const nAlle = images.find(i => i.tags.number === number && i.tags.eventType === 'Alle');
    if (nAlle) return nAlle;
  }

  // 2) Match on eventType only
  if (eventType) {
    const eExact = images.find(i => i.tags.eventType === eventType);
    if (eExact) return eExact;
  }

  // 3) Fallback to any image with eventType 'Alle'
  const anyAlle = images.find(i => i.tags.eventType === 'Alle');
  if (anyAlle) return anyAlle;

  // 6) Final fallback to first image (TODO: implement better scoring)
  return images[0] || null;
}
