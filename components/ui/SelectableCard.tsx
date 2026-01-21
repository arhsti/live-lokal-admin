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
        'w-full text-left bg-white border-2 transition-all',
        radius.card,
        active
          ? 'border-[hsl(220_25%_15%)] ring-2 ring-[hsl(220_25%_15%/0.05)] shadow-md'
          : 'border-transparent hover:border-[hsl(220_25%_15%/0.2)]',
        className,
      )}
    >
      {children}
    </button>
  );
}
