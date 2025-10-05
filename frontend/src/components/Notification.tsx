'use client';

import React, { useEffect, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { ApiError, SuccessNotification, NotificationOptions } from '@/types/notification';

interface NotificationProps {
  error?: ApiError | null;
  success?: SuccessNotification | null;
  options?: NotificationOptions;
  onClose: () => void;
}

export const Notification: React.FC<NotificationProps> = ({ 
  error, 
  success, 
  options = {}, 
  onClose 
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (error || success) {
      setIsVisible(true);
      
      if (options.autoHide !== false) {
        const timer = setTimeout(() => {
          setIsVisible(false);
          setTimeout(onClose, 300); 
        }, options.duration || (error ? 4000 : 3000));
        
        return () => clearTimeout(timer);
      }
    }
  }, [error, success, options.autoHide, options.duration, onClose]);

  if ((!error && !success) || !isVisible) return null;

  if (error) {
    return (
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-md w-full mx-4">
        <Alert variant="destructive" className="shadow-lg border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="font-medium">
            <div className="text-sm">
              <div className="font-semibold text-red-800 dark:text-red-200">Error {error.code}</div>
              <div className="text-red-700 dark:text-red-300 mt-1">{error.message}</div>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (success) {
    return (
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-md w-full mx-4">
        <Alert variant="default" className="shadow-lg border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
          <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertDescription className="font-medium">
            <div className="text-sm">
              {success.title && (
                <div className="font-semibold text-green-800 dark:text-green-200">{success.title}</div>
              )}
              <div className="text-green-700 dark:text-green-300 mt-1">{success.message}</div>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return null;
};