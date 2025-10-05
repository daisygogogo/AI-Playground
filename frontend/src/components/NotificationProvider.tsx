'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Notification } from './Notification';
import { notificationService } from '@/services/notification';
import { ApiError, SuccessNotification, NotificationOptions, ErrorNotificationOptions } from '@/types/notification';

interface NotificationContextType {
  showError: (error: ApiError, options?: ErrorNotificationOptions) => void;
  hideError: () => void;
  showSuccess: (notification: SuccessNotification, options?: NotificationOptions) => void;
  hideSuccess: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: React.ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [currentError, setCurrentError] = useState<ApiError | null>(null);
  const [errorOptions, setErrorOptions] = useState<ErrorNotificationOptions>({});
  const [currentSuccess, setCurrentSuccess] = useState<SuccessNotification | null>(null);
  const [successOptions, setSuccessOptions] = useState<NotificationOptions>({});

  useEffect(() => {
    const handleError = (error: ApiError, options?: ErrorNotificationOptions) => {
      setCurrentError(error);
      setErrorOptions(options || {});
    };

    const handleSuccess = (notification: SuccessNotification, options?: NotificationOptions) => {
      setCurrentSuccess(notification);
      setSuccessOptions(options || {});
    };

    notificationService.addErrorListener(handleError);
    notificationService.addSuccessListener(handleSuccess);

    return () => {
      notificationService.removeErrorListener(handleError);
      notificationService.removeSuccessListener(handleSuccess);
    };
  }, []);

  const showError = (error: ApiError, options?: ErrorNotificationOptions) => {
    setCurrentError(error);
    setErrorOptions(options || {});
  };

  const hideError = () => {
    setCurrentError(null);
  };

  const showSuccess = (notification: SuccessNotification, options?: NotificationOptions) => {
    setCurrentSuccess(notification);
    setSuccessOptions(options || {});
  };

  const hideSuccess = () => {
    setCurrentSuccess(null);
  };

  return (
    <NotificationContext.Provider value={{ showError, hideError, showSuccess, hideSuccess }}>
      {children}
      <Notification
        error={currentError}
        success={currentSuccess}
        options={currentError ? errorOptions : successOptions}
        onClose={currentError ? hideError : hideSuccess}
      />
    </NotificationContext.Provider>
  );
};