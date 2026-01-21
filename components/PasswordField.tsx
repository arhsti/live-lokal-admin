import { ChangeEvent } from 'react';
import { Input } from './ui/Input';
import { Label } from './ui/Label';
import { TextButton } from './ui/TextButton';
import { passwordField, typography } from '@/styles/tokens';

interface PasswordFieldProps {
  label: string;
  value: string;
  show: boolean;
  onToggle: () => void;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
}

export default function PasswordField({ label, value, show, onToggle, onChange, placeholder }: PasswordFieldProps) {
  return (
    <div>
      <Label className={typography.formLabel}>{label}</Label>
      <div className="relative mt-2">
        <Input
          type={show ? 'text' : 'password'}
          className={passwordField.input}
          uiSize="lg"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required
        />
        <TextButton type="button" className={passwordField.toggle} onClick={onToggle}>
          {show ? 'Skjul' : 'Vis'}
        </TextButton>
      </div>
    </div>
  );
}
