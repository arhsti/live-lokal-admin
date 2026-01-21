import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { cn } from './ui/utils';
import { modal, radius } from '@/styles/tokens';

interface StoryPreviewModalProps {
  open: boolean;
  imageUrl: string | null;
  onClose: () => void;
}

export default function StoryPreviewModal({ open, imageUrl, onClose }: StoryPreviewModalProps) {
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
      <div className={modal.gradient} />
      <div className={modal.labelWrap}>
        <div className={modal.labelText}>Live Lokal</div>
      </div>
    </Modal>
  );
}
