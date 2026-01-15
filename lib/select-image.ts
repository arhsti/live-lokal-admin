export interface ImageWithTags {
  id: string;
  image_url: string;
  tags: { player: string; number: string };
}

export function selectImageByTags(images: ImageWithTags[], criteria: { player?: string; number?: string }): ImageWithTags | null {
  if (!images || images.length === 0) return null;

  const { player, number } = criteria || {};

  // 1) Exact match on both
  if (player && number) {
    const exact = images.find(i => i.tags.player === player && i.tags.number === number);
    if (exact) return exact;
  }

  // 2) Match on player
  if (player) {
    const byPlayer = images.find(i => i.tags.player === player);
    if (byPlayer) return byPlayer;
  }

  // 3) Match on number
  if (number) {
    const byNumber = images.find(i => i.tags.number === number);
    if (byNumber) return byNumber;
  }

  // 4) Fallback to first image
  return images[0] || null;
}
