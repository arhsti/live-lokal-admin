import { ReactNode } from 'react';
import { cn } from './utils';

interface IconBadgeProps {
  children: ReactNode;
  className?: string;
}

export function IconBadge({ children, className }: IconBadgeProps) {
  return (
    <div className={cn('flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 text-gray-900', className)}>
      {children}
    </div>
  );
}
