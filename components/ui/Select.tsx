import { SelectHTMLAttributes } from 'react';
import { cn } from './utils';
import { sizes, radius, typography } from '@/styles/tokens';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {}

export function Select({ className, children, ...props }: SelectProps) {
  return (
    <select
      {...props}
      className={cn(
        'bg-[hsl(210_20%_94%/0.5)] border border-transparent focus:border-[rgba(31,41,55,0.2)] outline-none',
        sizes.inputHeight,
        radius.input,
        typography.body,
        'px-3',
        className,
      )}
    >
      {children}
    </select>
  );
}
