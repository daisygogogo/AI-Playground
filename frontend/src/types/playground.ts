// AI Model Types
export type AIModel = 'gpt-3.5-turbo' | 'gpt-4o-mini' | 'database-agent';

export type ModelStatus = 'typing' | 'streaming' | 'complete' | 'error';

// Response Types
export interface ModelResponse {
  id: string;
  model: AIModel;
  content: string;
  status: ModelStatus;
  tokensUsed: number;
  cost: number;
  responseTime: number;
  timestamp: number;
}

export interface ModelMetrics {
  tokensUsed: number;
  cost: number;
  responseTime: number;
  wordsPerSecond?: number;
}

// SSE Event Types
export interface SSEChunkEvent {
  type: 'chunk';
  model: string;
  content: string;
  timestamp: number;
}

export interface SSEStatusEvent {
  type: 'status';
  model: string;
  status: ModelStatus;
  message?: string;
}

export interface SSEMetricsEvent {
  type: 'metrics';
  model: string;
  tokensUsed: number;
  cost: number;
  responseTime: number;
}

export type SSEEvent = SSEChunkEvent | SSEStatusEvent | SSEMetricsEvent;

// Playground State
export interface PlaygroundState {
  prompt: string;
  selectedModels: AIModel[];
  responses: Record<string, string>;
  statuses: Record<string, ModelStatus>;
  metrics: Record<string, ModelMetrics>;
  isStreaming: boolean;
}

// API Types
export interface StreamRequest {
  prompt: string;
  selectedModels: string[];
  sessionId?: string;
}