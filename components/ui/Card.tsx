import { ReactNode } from 'react';
import { cn } from './utils';
import { radius } from '@/styles/tokens';

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return (
    <div
      className={cn(
        'bg-[hsl(0_0%_100%)] border border-[hsl(220_13%_91%)] shadow-soft',
        radius.card,
        className,
      )}
    >
      {children}
    </div>
  );
}

interface CardContentProps {
  children: ReactNode;
  className?: string;
}

export function CardContent({ children, className }: CardContentProps) {
  return <div className={cn('p-6', className)}>{children}</div>;
}
