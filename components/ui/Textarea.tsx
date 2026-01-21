import { TextareaHTMLAttributes } from 'react';
import { cn } from './utils';
import { radius, typography, sizes } from '@/styles/tokens';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {}

export function Textarea({ className, ...props }: TextareaProps) {
  return (
    <textarea
      {...props}
      className={cn(
        'bg-[hsl(210_20%_94%/0.5)] border border-transparent focus:border-[hsl(220_25%_15%/0.2)] focus:bg-white outline-none',
        radius.input,
        typography.body,
        sizes.textareaMinHeight,
        'px-3 py-2',
        className,
      )}
    />
  );
}
