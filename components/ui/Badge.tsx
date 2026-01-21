import { ReactNode } from 'react';
import { cn } from './utils';

type Variant = 'default' | 'outline' | 'success';

interface BadgeProps {
  children: ReactNode;
  className?: string;
  variant?: Variant;
}

const variantClasses: Record<Variant, string> = {
  default: 'bg-gray-100 text-gray-500',
  outline: 'border border-gray-200 bg-transparent text-gray-600',
  success: 'bg-emerald-50 text-emerald-700',
};

export function Badge({ children, className, variant = 'default' }: BadgeProps) {
  return (
    <span
      className={cn('inline-flex items-center rounded-full px-3 py-1 text-sm font-medium', variantClasses[variant], className)}
    >
      {children}
    </span>
  );
}
