import { ReactNode } from 'react';
import { cn } from './utils';

interface TableProps {
  children: ReactNode;
  className?: string;
}

export function Table({ children, className }: TableProps) {
  return <table className={cn('min-w-full text-sm', className)}>{children}</table>;
}

export function TableHead({ children, className }: TableProps) {
  return <thead className={className}>{children}</thead>;
}

export function TableBody({ children, className }: TableProps) {
  return <tbody className={className}>{children}</tbody>;
}

interface TableRowProps {
  children: ReactNode;
  className?: string;
}

export function TableHeaderRow({ children, className }: TableRowProps) {
  return (
    <tr className={cn('text-left text-[hsl(220_10%_55%)] bg-[hsl(210_20%_94%/0.5)]', className)}>
      {children}
    </tr>
  );
}

export function TableRow({ children, className }: TableRowProps) {
  return <tr className={cn('border-t border-[hsl(220_13%_91%)]', className)}>{children}</tr>;
}

interface TableCellProps {
  children: ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right';
  padded?: boolean;
}

const alignClasses = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
};

export function TableHeaderCell({ children, className, align = 'left', padded = true }: TableCellProps) {
  return (
    <th className={cn(padded ? 'py-3 pr-6' : '', alignClasses[align], className)}>
      {children}
    </th>
  );
}

export function TableCell({ children, className, align = 'left', padded = true }: TableCellProps) {
  return (
    <td className={cn(padded ? 'py-4 pr-6' : '', alignClasses[align], className)}>
      {children}
    </td>
  );
}
