import { InputHTMLAttributes } from 'react';
import { cn } from './utils';
import { sizes, radius, typography } from '@/styles/tokens';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      {...props}
      className={cn(
        'bg-[hsl(210_20%_94%/0.5)] border border-transparent focus:border-[rgba(31,41,55,0.2)] outline-none',
        sizes.inputHeight,
        radius.input,
        typography.body,
        'px-3',
        className,
      )}
    />
  );
}
