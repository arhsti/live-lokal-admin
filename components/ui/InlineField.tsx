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
        'inline-flex items-center gap-2 rounded-xl border border-[#e2e8f0] bg-white px-3 py-2',
        radius.card,
        className,
      )}
    >
      {icon ? <span className="text-gray-400">{icon}</span> : null}
      <span className={typography.label}>{label}</span>
      {children}
    </div>
  );
}
