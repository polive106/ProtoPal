import * as React from 'react';
import { cn } from './utils/cn';

interface ErrorAlertProps extends React.HTMLAttributes<HTMLDivElement> {
  message: string;
  onDismiss?: () => void;
}

export function ErrorAlert({ message, onDismiss, className, ...props }: ErrorAlertProps) {
  return (
    <div className={cn('rounded-md bg-red-50 border border-red-200 p-4', className)} role="alert" {...props}>
      <div className="flex items-start">
        <div className="flex-1">
          <p className="text-sm text-red-800">{message}</p>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="ml-3 inline-flex rounded-md p-1.5 text-red-500 hover:bg-red-100 focus:outline-none"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
          </button>
        )}
      </div>
    </div>
  );
}
