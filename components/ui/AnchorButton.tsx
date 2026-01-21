import { AnchorHTMLAttributes, ReactNode } from 'react';
import { cn } from './utils';
import { sizes, radius } from '@/styles/tokens';

type Variant = 'primary' | 'secondary' | 'outline';

interface AnchorButtonProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  children: ReactNode;
  className?: string;
  variant?: Variant;
}

const variantClasses: Record<Variant, string> = {
  primary: 'bg-[hsl(220_25%_15%)] text-white shadow-md',
  secondary: 'bg-[hsl(210_20%_94%)] text-[hsl(220_25%_15%)] border border-[hsl(220_13%_91%)]',
  outline: 'bg-white text-[hsl(220_25%_15%)] border border-[hsl(220_25%_15%/0.2)]',
};

export function AnchorButton({ children, className, variant = 'secondary', ...props }: AnchorButtonProps) {
  return (
    <a
      {...props}
      className={cn(
        'inline-flex items-center justify-center gap-2 text-sm font-medium transition-opacity active:scale-[0.98] hover:opacity-90',
        sizes.buttonHeight,
        radius.button,
        variantClasses[variant],
        className,
      )}
    >
      {children}
    </a>
  );
}
