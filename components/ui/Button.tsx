import { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from './utils';
import { sizes, radius } from '@/styles/tokens';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost';
type UiSize = 'sm' | 'md' | 'lg' | 'icon';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  uiSize?: UiSize;
  children: ReactNode;
}

const variantClasses: Record<Variant, string> = {
  primary: 'bg-[hsl(220_25%_15%)] text-white shadow-md',
  secondary: 'bg-[hsl(210_20%_94%)] text-[hsl(220_25%_15%)] border border-[hsl(220_13%_91%)]',
  outline: 'bg-white text-[hsl(220_25%_15%)] border border-[hsl(220_25%_15%/0.2)]',
  ghost: 'bg-transparent text-[hsl(220_25%_15%)] hover:bg-[hsl(210_20%_94%)]/50',
};

const sizeClasses: Record<UiSize, string> = {
  sm: sizes.buttonHeightSm,
  md: sizes.buttonHeight,
  lg: sizes.buttonHeightLg,
  icon: sizes.buttonIcon,
};

export function Button({ variant = 'primary', uiSize = 'md', className, children, ...props }: ButtonProps) {
  return (
    <button
      {...props}
      className={cn(
        'inline-flex items-center justify-center gap-2 text-sm font-medium transition-opacity active:scale-[0.98] hover:opacity-90',
        sizeClasses[uiSize],
        radius.button,
        variantClasses[variant],
        className,
      )}
    >
      {children}
    </button>
  );
}
