import { InputHTMLAttributes } from 'react';
import { cn } from './utils';
import { sizes, radius, typography } from '@/styles/tokens';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  uiSize?: 'md' | 'sm';
}

export function Input({ className, uiSize = 'md', ...props }: InputProps) {
  return (
    <input
      {...props}
      className={cn(
        'bg-[hsl(210_20%_94%/0.5)] border border-transparent focus:border-[hsl(220_25%_15%/0.2)] focus:bg-white outline-none',
        uiSize === 'sm' ? sizes.inputHeightSm : sizes.inputHeight,
        radius.input,
        typography.body,
        'px-3',
        className,
      )}
    />
  );
}
