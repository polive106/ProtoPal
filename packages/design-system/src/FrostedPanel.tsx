import * as React from 'react';
import { cn } from './utils/cn';

interface FrostedPanelProps extends React.HTMLAttributes<HTMLDivElement> {}

const FrostedPanel = React.forwardRef<HTMLDivElement, FrostedPanelProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('bg-background/60 backdrop-blur-md rounded-xl border border-border shadow-lg', className)}
      {...props}
    />
  )
);
FrostedPanel.displayName = 'FrostedPanel';

export { FrostedPanel };
