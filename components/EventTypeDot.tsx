import { cn } from './ui/utils';
import { color } from '@/styles/tokens';

interface EventTypeDotProps {
  type: string;
}

export default function EventTypeDot({ type }: EventTypeDotProps) {
  const lower = type.toLowerCase();
  let dotClass = color.neutralDot;
  if (lower.includes('mål')) dotClass = 'bg-emerald-500';
  if (lower.includes('kort')) dotClass = 'bg-yellow-500';
  if (lower.includes('bytte')) dotClass = 'bg-blue-500';

  return <span className={cn('h-2 w-2 rounded-full', dotClass)} />;
}
