import { ApiError, SuccessNotification, NotificationOptions, ErrorNotificationOptions } from '@/types/notification';

type ErrorListener = (error: ApiError, options?: ErrorNotificationOptions) => void;
type SuccessListener = (notification: SuccessNotification, options?: NotificationOptions) => void;

class NotificationService {
  private errorListeners: ErrorListener[] = [];
  private successListeners: SuccessListener[] = [];

  addErrorListener(listener: ErrorListener) {
    this.errorListeners.push(listener);
  }

  removeErrorListener(listener: ErrorListener) {
    this.errorListeners = this.errorListeners.filter(l => l !== listener);
  }

  addSuccessListener(listener: SuccessListener) {
    this.successListeners.push(listener);
  }

  removeSuccessListener(listener: SuccessListener) {
    this.successListeners = this.successListeners.filter(l => l !== listener);
  }

  showError(error: ApiError, options?: ErrorNotificationOptions) {
    this.errorListeners.forEach(listener => listener(error, options));
  }

  showSuccess(notification: SuccessNotification, options?: NotificationOptions) {
    this.successListeners.forEach(listener => listener(notification, options));
  }
}

export const notificationService = new NotificationService();