import { ReactNode } from 'react';
import { cn } from './utils';

interface DividerRowProps {
  children: ReactNode;
  className?: string;
}

export function DividerRow({ children, className }: DividerRowProps) {
  return (
    <div
      className={cn(
        'mt-6 flex items-center justify-between border-t pt-4 text-sm text-[hsl(220_10%_55%)]',
        'border-[hsl(220_13%_91%)]',
        className,
      )}
    >
      {children}
    </div>
  );
}
