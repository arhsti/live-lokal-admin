import { LabelHTMLAttributes } from 'react';
import { cn } from './utils';
import { typography } from '@/styles/tokens';

interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {}

export function Label({ className, ...props }: LabelProps) {
  return <label {...props} className={cn(typography.label, className)} />;
}
