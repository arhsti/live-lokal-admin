import { ReactNode } from 'react';
import { cn } from './utils';

interface DividerRowProps {
  children: ReactNode;
  className?: string;
}

export function DividerRow({ children, className }: DividerRowProps) {
  return (
    <div className={cn('mt-6 flex items-center justify-between border-t border-gray-200 pt-4 text-sm text-gray-600', className)}>
      {children}
    </div>
  );
}
