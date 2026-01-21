import { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from './utils';

interface TextButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

export function TextButton({ children, className, ...props }: TextButtonProps) {
  return (
    <button
      {...props}
      className={cn('text-xs font-semibold text-gray-500 hover:text-gray-800', className)}
    >
      {children}
    </button>
  );
}
