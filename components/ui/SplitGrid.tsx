import { ReactNode } from 'react';
import { cn } from './utils';

interface SplitGridProps {
  children: ReactNode;
  className?: string;
}

export function SplitGrid({ children, className }: SplitGridProps) {
  return <div className={cn('grid gap-6 lg:grid-cols-[2fr_1fr]', className)}>{children}</div>;
}
