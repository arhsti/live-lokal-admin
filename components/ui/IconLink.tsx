import Link, { LinkProps } from 'next/link';
import { ReactNode } from 'react';
import { cn } from './utils';
import { radius } from '@/styles/tokens';

interface IconLinkProps extends LinkProps {
  children: ReactNode;
  className?: string;
}

export function IconLink({ children, className, ...props }: IconLinkProps) {
  return (
    <Link
      {...props}
      className={cn(
        'inline-flex items-center justify-center h-10 w-10 border border-[hsl(220_13%_91%)] bg-white shadow-sm',
        radius.button,
        className,
      )}
    >
      {children}
    </Link>
  );
}
