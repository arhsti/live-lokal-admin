import { preview } from '@/styles/tokens';

interface StoryPreviewFrameProps {
  imageUrl: string;
  overlayUrl?: string | null;
}

export default function StoryPreviewFrame({ imageUrl, overlayUrl }: StoryPreviewFrameProps) {
  return (
    <div className={preview.frame}>
      <img
        src={imageUrl}
        alt="Preview"
        className={preview.image}
      />
      {overlayUrl ? (
        <img
          src={overlayUrl}
          alt="Text overlay"
          className={preview.overlay}
        />
      ) : null}
    </div>
  );
}
