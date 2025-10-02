import { create } from 'zustand';
import { AIModel, ModelStatus, ModelMetrics, PlaygroundState } from '@/types/playground';

interface PlaygroundStore extends PlaygroundState {
  setPrompt: (prompt: string) => void;
  setSelectedModels: (models: AIModel[]) => void;
  clearResponses: () => void;
  updateResponse: (model: string, content: string, append?: boolean) => void;
  setStatus: (model: string, status: ModelStatus) => void;
  updateMetrics: (model: string, metrics: Partial<ModelMetrics>) => void;
  setIsStreaming: (streaming: boolean) => void;
  resetPlayground: () => void;
  setCurrentSessionId: (id: string | null) => void;
  setSessions: (sessions: SessionItem[]) => void;
}

const initialState: PlaygroundState = {
  prompt: '',
  selectedModels: ['gpt-3.5-turbo', 'gpt-4o-mini'],
  responses: {},
  statuses: {},
  metrics: {},
  isStreaming: false,
};

interface SessionItem { id: string; prompt: string; createdAt: string; updatedAt: string; models: string[]; totalCost: number; totalTokens: number; status: string }

interface HistoryState {
  sessions: SessionItem[];
  currentSessionId: string | null;
}

export const usePlaygroundStore = create<PlaygroundStore & HistoryState>((set, get) => ({
  ...initialState,
  sessions: [],
  currentSessionId: null,

  setPrompt: (prompt: string) => set({ prompt }),

  setSelectedModels: (models: AIModel[]) => set({ selectedModels: models }),

  clearResponses: () => {
    const { selectedModels } = get();
    const clearedResponses: Record<string, string> = {};
    const clearedStatuses: Record<string, ModelStatus> = {};
    const clearedMetrics: Record<string, ModelMetrics> = {};

    selectedModels.forEach(model => {
      clearedResponses[model] = '';
      clearedStatuses[model] = 'typing';
      clearedMetrics[model] = {
        tokensUsed: 0,
        cost: 0,
        responseTime: 0,
      };
    });

    set({
      responses: clearedResponses,
      statuses: clearedStatuses,
      metrics: clearedMetrics,
    });
  },

  setCurrentSessionId: (id: string | null) => set({ currentSessionId: id }),
  setSessions: (sessions: SessionItem[]) => set({ sessions }),

  updateResponse: (model: string, content: string, append = true) => {
    console.log(`Store updateResponse called for ${model} with content:`, content.substring(0, 100));
    set(state => {
      const newResponse = append ? (state.responses[model] || '') + content : content;
      console.log(`Store setting response for ${model}:`, newResponse.substring(0, 100));
      return {
        responses: {
          ...state.responses,
          [model]: newResponse,
        },
      };
    });
  },

  setStatus: (model: string, status: ModelStatus) => {
    console.log(`Store setStatus called for ${model} with status:`, status);
    set(state => ({
      statuses: {
        ...state.statuses,
        [model]: status,
      },
    }));
  },

  updateMetrics: (model: string, metrics: Partial<ModelMetrics>) => {
    set(state => ({
      metrics: {
        ...state.metrics,
        [model]: {
          ...state.metrics[model],
          ...metrics,
        },
      },
    }));
  },

  setIsStreaming: (streaming: boolean) => set({ isStreaming: streaming }),

  resetPlayground: () => set(initialState),
}));