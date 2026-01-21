import { SelectHTMLAttributes } from 'react';
import { cn } from './utils';
import { sizes, radius, typography } from '@/styles/tokens';

type Variant = 'default' | 'filter';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  uiSize?: 'sm' | 'md' | 'lg';
  variant?: Variant;
}

export function Select({ className, children, uiSize = 'md', variant = 'default', ...props }: SelectProps) {
  const baseClass =
    variant === 'filter'
      ? 'bg-transparent border-none shadow-none focus-visible:ring-0'
      : 'bg-[hsl(210_20%_94%/0.3)] border-transparent focus:border-[hsl(220_25%_15%/0.2)] focus:bg-white transition-all';
  const heightClass =
    uiSize === 'sm' ? sizes.inputHeightSm : uiSize === 'lg' ? sizes.inputHeightLg : sizes.inputHeight;
  return (
    <select
      {...props}
      className={cn(
        baseClass,
        heightClass,
        radius.input,
        typography.body,
        variant === 'filter' ? '' : 'px-3',
        'outline-none',
        className,
      )}
    >
      {children}
    </select>
  );
}
