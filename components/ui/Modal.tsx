import { ReactNode } from 'react';
import { cn } from './utils';
import { radius } from '@/styles/tokens';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
}

export function Modal({ open, onClose, children, className }: ModalProps) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-6"
      onClick={onClose}
    >
      <div
        className={cn('relative w-full max-w-[400px] aspect-[9/16] bg-black shadow-soft overflow-hidden', radius.card, className)}
        onClick={(event) => event.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
