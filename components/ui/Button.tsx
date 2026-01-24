import React from 'react';
import { colors, font, radii, transition, spacing } from '@/src/design-system';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, variant = 'primary', fullWidth = false, style, ...props }, ref) => (
    <button
      ref={ref}
      style={{
        background: variant === 'primary' ? colors.primary : colors.secondary,
        color: variant === 'primary' ? colors.card : colors.primary,
        fontFamily: font.body,
        fontWeight: 600,
        fontSize: '1rem',
        border: 'none',
        borderRadius: radii.input,
        padding: spacing.cardPadding,
        cursor: 'pointer',
        width: fullWidth ? '100%' : undefined,
        transition: transition.card,
        outline: 'none',
        ...style,
      }}
      onMouseDown={e => {
        e.currentTarget.style.transform = 'scale(0.98)';
      }}
      onMouseUp={e => {
        e.currentTarget.style.transform = 'scale(1)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'scale(1)';
      }}
      onMouseOver={e => {
        e.currentTarget.style.opacity = '0.9';
      }}
      onFocus={e => {
        e.currentTarget.style.opacity = '0.9';
      }}
      onBlur={e => {
        e.currentTarget.style.opacity = '1';
      }}
      {...props}
    >
      {children}
    </button>
  )
);
Button.displayName = 'Button';
