import { ReactNode } from 'react';
import { Card, CardContent } from './ui/Card';
import { cn } from './ui/utils';
import { auth, spacing } from '@/styles/tokens';

interface AuthLayoutProps {
  children: ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className={auth.wrapper}>
      <div className={auth.glowTop} />
      <div className={auth.orbRight} />
      <div className={auth.orbLeft} />
      {children}
    </div>
  );
}

interface AuthCardProps {
  children: ReactNode;
  className?: string;
}

export function AuthCard({ children, className }: AuthCardProps) {
  return (
    <Card className={cn(auth.card, className)}>
      <CardContent className={cn(auth.cardContent, spacing.section)}>{children}</CardContent>
    </Card>
  );
}
