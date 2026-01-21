import { ReactNode } from 'react';
import { tooltip } from '@/styles/tokens';

interface TooltipProps {
  text: string;
  children: ReactNode;
}

export default function Tooltip({ text, children }: TooltipProps) {
  return (
    <span className={tooltip.wrapper}>
      {children}
      <span className={tooltip.bubble}>
        {text}
      </span>
    </span>
  );
}
