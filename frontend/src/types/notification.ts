export interface ApiError {
  code: number;
  message: string;
}

export interface SuccessNotification {
  message: string;
  title?: string;
}

export interface NotificationOptions {
  duration?: number;
  autoHide?: boolean;
}

export interface ErrorNotificationOptions extends NotificationOptions {
  showDetails?: boolean;
}