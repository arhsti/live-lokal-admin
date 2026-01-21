import { ReactNode } from 'react';
import { cn } from './utils';

type Variant = 'default' | 'outline' | 'success' | 'secondary';

interface BadgeProps {
  children: ReactNode;
  className?: string;
  variant?: Variant;
}

const variantClasses: Record<Variant, string> = {
  default: 'bg-[hsl(210_20%_94%)] text-[hsl(220_10%_55%)]',
  outline: 'border border-[hsl(220_13%_91%)] bg-transparent text-[hsl(220_10%_55%)]',
  success: 'bg-emerald-50 text-emerald-700',
  secondary: 'bg-[hsl(210_20%_94%)] text-[hsl(220_25%_15%)]',
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
