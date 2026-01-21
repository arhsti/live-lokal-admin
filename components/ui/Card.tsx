import { ReactNode } from 'react';
import { cn } from './utils';
import { radius } from '@/styles/tokens';

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return (
    <div className={cn('bg-white border border-[#e2e8f0] shadow-soft', radius.card, className)}>
      {children}
    </div>
  );
}

interface CardContentProps {
  children: ReactNode;
  className?: string;
}

export function CardContent({ children, className }: CardContentProps) {
  return <div className={cn('p-5', className)}>{children}</div>;
}
