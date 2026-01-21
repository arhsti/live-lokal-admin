import { ReactNode } from 'react';
import { cn } from './utils';

interface IconBadgeProps {
  children: ReactNode;
  className?: string;
}

export function IconBadge({ children, className }: IconBadgeProps) {
  return (
    <div
      className={cn(
        'flex h-14 w-14 items-center justify-center rounded-2xl bg-[hsl(210_20%_94%)] text-[hsl(220_25%_15%)]',
        className,
      )}
    >
      {children}
    </div>
  );
}
