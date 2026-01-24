import React from 'react';
import { colors, spacing, radii, shadow, transition } from '@/src/design-system';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  padding?: keyof typeof spacing;
  hoverable?: boolean;
  as?: React.ElementType;
}

export const Card = ({
  children,
  padding = 'cardPadding',
  hoverable = false,
  as: Component = 'div',
  ...rest
}: CardProps) => (
  <Component
    style={{
      background: colors.card,
      borderRadius: radii.input,
      boxShadow: shadow.card,
      padding: spacing[padding],
      transition: transition.card,
      border: `1px solid ${colors.border}`,
    }}
    {...(hoverable && {
      onMouseEnter: (e: any) => {
        e.currentTarget.style.boxShadow = shadow.cardHover;
        e.currentTarget.style.border = `1px solid ${colors.primary}33`;
      },
      onMouseLeave: (e: any) => {
        e.currentTarget.style.boxShadow = shadow.card;
        e.currentTarget.style.border = `1px solid ${colors.border}`;
      },
    })}
    {...rest}
  >
    {children}
  </Component>
);
