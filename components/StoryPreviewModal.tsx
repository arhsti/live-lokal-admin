import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { cn } from './ui/utils';
import { modal, radius } from '@/styles/tokens';

interface StoryPreviewModalProps {
  open: boolean;
  imageUrl: string | null;
  onClose: () => void;
  badgeText?: string;
  title?: string;
  subtitle?: string;
  footerTitle?: string;
}

export default function StoryPreviewModal({
  open,
  imageUrl,
  onClose,
  badgeText,
  title,
  subtitle,
  footerTitle,
}: StoryPreviewModalProps) {
  if (!imageUrl) return null;

  return (
    <Modal open={open} onClose={onClose}>
      <Button
        variant="outline"
        onClick={onClose}
        aria-label="Close preview"
        className={modal.closeButton}
      >
        ✕
      </Button>
      <img
        src={imageUrl}
        alt="Story preview"
        className={cn(modal.imageBase, radius.card)}
      />
      <div className={cn(modal.gradient, 'flex flex-col justify-between p-8')}
      >
        {(badgeText || title || subtitle) ? (
          <div className="text-white pt-12">
            {badgeText ? (
              <div className="inline-block bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-sm font-medium mb-4">
                {badgeText}
              </div>
            ) : null}
            {title ? (
              <h2 className="text-4xl font-heading font-bold leading-tight">{title}</h2>
            ) : null}
            {subtitle ? (
              <p className="text-xl text-white/80 mt-2">{subtitle}</p>
            ) : null}
          </div>
        ) : (
          <div />
        )}
        <div className="text-white pb-12">
          <div className="text-2xl font-bold mb-2">{footerTitle || 'Live Lokal'}</div>
          <div className="h-1 w-24 bg-white/50 rounded-full" />
        </div>
      </div>
    </Modal>
  );
}
