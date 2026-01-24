import React from 'react';
import { font, colors, radii, sizes, spacing } from '@/src/design-system';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, style, ...props }, ref) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
      {label && (
        <label
          htmlFor={props.id}
          style={{
            fontSize: font.label.size,
            fontWeight: font.label.weight,
            textTransform: font.label.transform as any,
            letterSpacing: font.label.tracking,
            color: colors.primary,
          }}
        >
          {label}
        </label>
      )}
      <input
        ref={ref}
        style={{
          height: sizes.inputHeight,
          borderRadius: radii.input,
          border: `1px solid ${colors.border}`,
          background: colors.card,
          fontSize: font.input.size,
          padding: spacing.cardPadding,
          outline: 'none',
          transition: 'background 0.2s, border 0.2s',
          ...style,
        }}
        onFocus={e => {
          e.currentTarget.style.background = colors.card;
          e.currentTarget.style.border = `1px solid ${colors.primary}33`;
        }}
        onBlur={e => {
          e.currentTarget.style.background = colors.card;
          e.currentTarget.style.border = `1px solid ${colors.border}`;
        }}
        {...props}
      />
      {error && (
        <span style={{ color: 'red', fontSize: '12px' }}>{error}</span>
      )}
    </div>
  )
);
Input.displayName = 'Input';
