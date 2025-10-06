import { useRef, useCallback } from 'react';
import { usePlaygroundStore } from '@/stores/playgroundStore';
import { useAuthStore } from '@/stores/auth';
import { SSEEvent } from '@/types/playground';
import { api } from '@/services/api';

export function useSSEStream() {
  const eventSourceRef = useRef<EventSource | null>(null);
  const {
    selectedModels,
    clearResponses,
    updateResponse,
    setStatus,
    updateMetrics,
    setIsStreaming,
    isStreaming,
  } = usePlaygroundStore();
  const { token } = useAuthStore();

  const streamPrompt = useCallback(async (prompt: string) => {
    if (!prompt.trim()) return;
    
    if (!token) {
      selectedModels.forEach(model => {
        setStatus(model, 'error');
      });
      return;
    }

    clearResponses();
    setIsStreaming(true);

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    try {
      const params = new URLSearchParams({
        prompt: prompt.trim(),
        models: selectedModels.join(','),
      });

      const currentSessionId = (usePlaygroundStore.getState() as any).currentSessionId;
      if (currentSessionId) {
        params.set('sessionId', currentSessionId);
      }

      const url = `${api.defaults.baseURL}/playground/stream?${params.toString()}`;
      const controller = new AbortController();
      
      try {
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'text/event-stream',
            'Cache-Control': 'no-cache',
          },
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error('Response body is not readable');
        }

        const processStream = async () => {
          const decoder = new TextDecoder();
          let buffer = '';

          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              buffer += decoder.decode(value, { stream: true });
              const lines = buffer.split('\n');
              buffer = lines.pop() || '';

              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  const data = line.slice(6);
                  if (data.trim() && data !== '[DONE]') {
                    try {
                      const event = { data } as MessageEvent;
                      if (eventSourceRef.current?.onmessage) {
                        eventSourceRef.current.onmessage(event);
                      }
                    } catch (error) {
                      console.error('Error processing SSE data:', error);
                    }
                  }
                }
              }
            }
          } catch (error) {
            if (eventSourceRef.current?.onerror) {
              eventSourceRef.current.onerror(new Event('error'));
            }
          }
        };

        eventSourceRef.current = {
          readyState: 1,
          close: () => {
            controller.abort();
          },
          onmessage: null,
          onerror: null,
          onopen: null,
        } as EventSource;

        if (eventSourceRef.current.onopen) {
          eventSourceRef.current.onopen(new Event('open'));
        }

        processStream();

      } catch (error) {
        console.error('Failed to create stream connection:', error);
        if (eventSourceRef.current?.onerror) {
          eventSourceRef.current.onerror(new Event('error'));
        }
      }
      
      const errorTimeout = setTimeout(() => {
        if (eventSourceRef.current?.readyState === EventSource.CONNECTING) {
          api.head('/playground/stream')
            .then(response => {
              if (response.status === 429) {
                // Try to get rate limit info from response headers or body
                const retryAfter = response.headers?.['retry-after'];
                const resetTime = retryAfter ? `Please try again in ${Math.ceil(retryAfter / 3600)} hour(s).` : 'Please try again later.';
                
                selectedModels.forEach(model => {
                  setStatus(model, 'error');
                  updateResponse(model, `⚠️ **Rate Limit Exceeded**\n\nYou have reached the request limit. ${resetTime}`, false);
                });
                setIsStreaming(false);
                eventSourceRef.current?.close();
              }
            })
            .catch(() => {});
        }
      }, 3000);

      eventSourceRef.current.onmessage = (event) => {
        try {
          const data: SSEEvent | { type: 'session'; sessionId: string } = JSON.parse(event.data);

          if ((data as any).type === 'session') {
            const sessionId = (data as any).sessionId;
            (usePlaygroundStore.getState() as any).setCurrentSessionId?.(sessionId);
            return;
          }

          switch (data.type) {
            case 'chunk':
              updateResponse(data.model, data.content);
              setStatus(data.model, 'streaming');
              break;

            case 'status':
              setStatus(data.model, data.status);
              break;

            case 'metrics':
              updateMetrics(data.model, {
                tokensUsed: data.tokensUsed,
                cost: data.cost,
                responseTime: data.responseTime,
              });
              break;
          }
        } catch (error) {
          console.error('Error parsing SSE data:', error);
        }
      };

      eventSourceRef.current.onopen = () => {
        clearTimeout(errorTimeout);
      };

      eventSourceRef.current.onerror = (error) => {
        clearTimeout(errorTimeout);
        
        if (eventSourceRef.current?.readyState === EventSource.CLOSED) {
          api.head('/playground/stream')
            .then(response => {
              if (response.status === 429) {
                const retryAfter = response.headers?.['retry-after'];
                const resetTime = retryAfter ? `Please try again in ${Math.ceil(retryAfter / 3600)} hour(s).` : 'Please try again later.';
                
                selectedModels.forEach(model => {
                  setStatus(model, 'error');
                  updateResponse(model, `⚠️ **Rate Limit Exceeded**\n\nYou have reached the request limit. ${resetTime}`, false);
                });
                setIsStreaming(false);
                return;
              } else {
                selectedModels.forEach(model => {
                  setStatus(model, 'error');
                  updateResponse(model, '❌ **Connection Error**\n\nUnable to connect to the AI service. Please try again.', false);
                });
                setIsStreaming(false);
              }
            })
            .catch(() => {
              selectedModels.forEach(model => {
                setStatus(model, 'error');
                updateResponse(model, '❌ **Network Error**\n\nPlease check your connection and try again.', false);
              });
              setIsStreaming(false);
            });
        }
        
        const currentStatuses = usePlaygroundStore.getState().statuses;
        const done = selectedModels.every(m => ['complete','error'].includes(currentStatuses[m]));
        if (done) {
          eventSourceRef.current?.close();
          return;
        }
      };

      const checkAllComplete = () => {
        const currentStatuses = usePlaygroundStore.getState().statuses;
        const allComplete = selectedModels.every(model =>
          ['complete', 'error'].includes(currentStatuses[model])
        );

        if (allComplete) {
          setIsStreaming(false);
          return true;
        }
        return false;
      };

      const checkInterval = setInterval(() => {
        const isComplete = checkAllComplete();
        const currentlyStreaming = usePlaygroundStore.getState().isStreaming;
        
        if (isComplete || !currentlyStreaming) {
          clearInterval(checkInterval);
        }
      }, 1000);

      const currentEventSource = eventSourceRef.current;
      if (currentEventSource) {
        (currentEventSource as any)._checkInterval = checkInterval;
      }

    } catch (error) {
      console.error('Failed to start SSE stream:', error);
      setIsStreaming(false);
      
      selectedModels.forEach(model => {
        setStatus(model, 'error');
        updateResponse(model, '❌ **Service Unavailable**\n\nThe AI service is currently unavailable. Please try again later.', false);
      });
    }
  }, [selectedModels, clearResponses, updateResponse, setStatus, updateMetrics, setIsStreaming]);

  const closeStream = useCallback(() => {
    if (eventSourceRef.current) {
      const interval = (eventSourceRef.current as any)._checkInterval;
      if (interval) {
        clearInterval(interval);
      }
      
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setIsStreaming(false);
  }, [setIsStreaming]);

  return {
    streamPrompt,
    closeStream,
    isStreaming,
  };
}