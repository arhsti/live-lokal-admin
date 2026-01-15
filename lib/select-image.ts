export interface ImageWithTags {
  id: string;
  image_url: string;
  tags: { player: string; number: string; eventType: string };
}

export function selectImageByTags(images: ImageWithTags[], criteria: { player?: string; number?: string }): ImageWithTags | null {
  if (!images || images.length === 0) return null;

  const { player, number, eventType } = criteria as any || {};

  // Selection rules with eventType
  // 1) Exact match on player, number and eventType
  if (player && number && eventType) {
    const exact = images.find(i => i.tags.player === player && i.tags.number === number && i.tags.eventType === eventType);
    if (exact) return exact;
    // 2) fallback to eventType === 'Alle' for same player/number
    const fallbackAlle = images.find(i => i.tags.player === player && i.tags.number === number && i.tags.eventType === 'Alle');
    if (fallbackAlle) return fallbackAlle;
  }

  // 3) Partial matches: prefer matching player & eventType
  if (player && eventType) {
    const pExact = images.find(i => i.tags.player === player && i.tags.eventType === eventType);
    if (pExact) return pExact;
    const pAlle = images.find(i => i.tags.player === player && i.tags.eventType === 'Alle');
    if (pAlle) return pAlle;
  }

  // 4) Match on number & eventType
  if (number && eventType) {
    const nExact = images.find(i => i.tags.number === number && i.tags.eventType === eventType);
    if (nExact) return nExact;
    const nAlle = images.find(i => i.tags.number === number && i.tags.eventType === 'Alle');
    if (nAlle) return nAlle;
  }

  // 5) Fallback to any image with eventType 'Alle'
  const anyAlle = images.find(i => i.tags.eventType === 'Alle');
  if (anyAlle) return anyAlle;

  // 6) Final fallback to first image (TODO: implement better scoring)
  return images[0] || null;
}
