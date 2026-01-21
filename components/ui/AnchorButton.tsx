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
  primary: 'bg-[#1f2937] text-white shadow-md',
  secondary: 'bg-[#f3f4f6] text-gray-900 border border-[#e2e8f0]',
  outline: 'bg-white text-gray-900 border border-[rgba(31,41,55,0.2)]',
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
