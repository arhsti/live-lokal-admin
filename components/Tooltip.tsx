import { ReactNode } from 'react';

interface TooltipProps {
  text: string;
  children: ReactNode;
}

export default function Tooltip({ text, children }: TooltipProps) {
  return (
    <span className="relative group inline-flex items-center">
      {children}
      <span className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 w-max max-w-[280px] -translate-x-1/2 rounded-md bg-gray-800 px-3 py-2 text-xs leading-snug text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 whitespace-normal break-words">
        {text}
      </span>
    </span>
  );
}
