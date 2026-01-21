import { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from './utils';

interface TextButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

export function TextButton({ children, className, ...props }: TextButtonProps) {
  return (
    <button
      {...props}
      className={cn('text-xs font-semibold text-[hsl(220_10%_55%)] hover:text-[hsl(220_25%_15%)]', className)}
    >
      {children}
    </button>
  );
}
