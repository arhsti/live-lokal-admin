import { ReactNode } from 'react';
import { cn } from './utils';
import { grid } from '@/styles/tokens';

interface GridProps {
  children: ReactNode;
  className?: string;
}

export function ImageGrid({ children, className }: GridProps) {
  return <div className={cn(grid.image, className)}>{children}</div>;
}

export function DashboardGrid({ children, className }: GridProps) {
  return <div className={cn(grid.dashboard, className)}>{children}</div>;
}

export function EventGrid({ children, className }: GridProps) {
  return <div className={cn(grid.events, className)}>{children}</div>;
}
