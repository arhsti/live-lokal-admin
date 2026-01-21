import { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from './utils';
import { radius } from '@/styles/tokens';

interface SelectableCardProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  children: ReactNode;
}

export function SelectableCard({ active = false, className, children, ...props }: SelectableCardProps) {
  return (
    <button
      {...props}
      className={cn(
        'w-full text-left bg-white border-2 shadow-soft transition-all',
        radius.card,
        active ? 'border-gray-900' : 'border-transparent hover:border-gray-200',
        className,
      )}
    >
      {children}
    </button>
  );
}
