import { cn } from './ui/utils';

interface EventTypeDotProps {
  type: string;
}

export default function EventTypeDot({ type }: EventTypeDotProps) {
  const lower = type.toLowerCase();
  let color = 'bg-gray-400';
  if (lower.includes('mål')) color = 'bg-emerald-500';
  if (lower.includes('kort')) color = 'bg-yellow-500';
  if (lower.includes('bytte')) color = 'bg-blue-500';

  return <span className={cn('h-2 w-2 rounded-full', color)} />;
}
