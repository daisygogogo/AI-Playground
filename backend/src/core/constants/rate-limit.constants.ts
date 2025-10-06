export const RATE_LIMIT_CONFIG = {
  WINDOW_MS: 60 * 60 * 1000, // 1 hour in milliseconds
  MAX_REQUESTS: 20, // Maximum requests per window
  WINDOW_HOURS: 1, // Window duration in hours
} as const;