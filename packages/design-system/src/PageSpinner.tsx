import * as React from 'react';
import { cn } from './utils/cn';

interface PageSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string;
}

export function PageSpinner({ label = 'Loading...', className, ...props }: PageSpinnerProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center min-h-[200px] gap-3', className)} {...props}>
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      {label && <p className="text-sm text-muted-foreground">{label}</p>}
    </div>
  );
}
