'use client';

import React from 'react';
import { cn } from '@/lib/utils';

// Simple loading spinner component
interface LoadingSpinnerProps {
  color?: 'primary' | 'white' | 'gray';
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  color = 'primary',
  className,
}) => {
  const colorClasses = {
    primary: 'text-primary', // Use theme primary color
    white: 'text-white',
    gray: 'text-muted-foreground', // Use theme muted foreground
  };

  return (
    <div
      className={cn(
        'animate-spin w-6 h-6',
        colorClasses[color],
        className
      )}
    >
      <svg
        className="w-full h-full"
        fill="none"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
  );
};

// Full screen loading overlay component
interface LoadingOverlayProps {
  isLoading: boolean;
  text?: string;
  className?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isLoading,
  text = 'Loading...',
  className,
}) => {
  if (!isLoading) return null;

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm',
        className
      )}
    >
      <div className="flex flex-col items-center space-y-4 bg-card border rounded-lg p-6 shadow-xl">
        <LoadingSpinner color="primary" />
        <p className="text-sm font-medium text-card-foreground">{text}</p>
      </div>
    </div>
  );
};

// Simple loading wrapper (like Vue's v-loading)
interface LoadingWrapperProps {
  isLoading: boolean;
  children: React.ReactNode;
  text?: string;
  className?: string;
}

export const LoadingWrapper: React.FC<LoadingWrapperProps> = ({
  isLoading,
  children,
  text = 'Loading...',
  className,
}) => {
  if (!isLoading) return <>{children}</>;

  return (
    <div className={cn('relative', className)}>
      {children}
      <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        <div className="flex flex-col items-center space-y-2">
          <LoadingSpinner color="primary" />
          <p className="text-sm text-muted-foreground">{text}</p>
        </div>
      </div>
    </div>
  );
};

// Simple inline loading component
interface InlineLoadingProps {
  isLoading: boolean;
  text?: string;
  className?: string;
}

export const InlineLoading: React.FC<InlineLoadingProps> = ({
  isLoading,
  text = 'Loading...',
  className,
}) => {
  if (!isLoading) return null;

  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <LoadingSpinner color="primary" />
      <span className="text-sm text-muted-foreground">{text}</span>
    </div>
  );
};

// Button loading state component
interface ButtonLoadingProps {
  isLoading: boolean;
  children: React.ReactNode;
  loadingText?: string;
  className?: string;
}

export const ButtonLoading: React.FC<ButtonLoadingProps> = ({
  isLoading,
  children,
  loadingText = 'Loading...',
  className,
}) => {
  return (
    <div className={cn('flex items-center space-x-2', className)}>
      {isLoading && <LoadingSpinner color="white" />}
      <span>{isLoading ? loadingText : children}</span>
    </div>
  );
}; 