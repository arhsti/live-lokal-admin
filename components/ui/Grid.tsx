import React from 'react';
import { spacing } from '@/src/design-system';

export interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  gap?: keyof typeof spacing;
  columns?: number | string;
  as?: React.ElementType;
}

export const Grid = ({
  children,
  gap = 'gridGap',
  columns = 3,
  as: Component = 'div',
  ...rest
}: GridProps) => (
  <Component
    style={{
      display: 'grid',
      gap: spacing[gap],
      gridTemplateColumns: typeof columns === 'number' ? `repeat(${columns}, 1fr)` : columns,
    }}
    {...rest}
  >
    {children}
  </Component>
);
