import { ReactNode } from 'react';
import { cn } from './utils';
import { typography, radius } from '@/styles/tokens';

interface InlineFieldProps {
  icon?: ReactNode;
  label: string;
  children: ReactNode;
  className?: string;
}

export function InlineField({ icon, label, children, className }: InlineFieldProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-3 rounded-lg border border-[hsl(220_13%_91%/0.5)] bg-[hsl(210_20%_94%/0.5)] px-3 py-1',
        className,
      )}
    >
      {icon ? <span className="inline-flex">{icon}</span> : null}
      <span className={typography.label}>{label}</span>
      {children}
    </div>
  );
}
