import { useRef, useCallback } from 'react';
import { usePlaygroundStore } from '@/stores/playgroundStore';
import { useAuthStore } from '@/stores/auth';
import { SSEEvent } from '@/types/playground';

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
    const connectionId = Math.random().toString(36).substr(2, 9);
    console.log(`streamPrompt called with connectionId: ${connectionId}, prompt:`, prompt);
    
    if (!prompt.trim()) return;
    
    // Check if user is authenticated
    if (!token) {
      console.error('No authentication token found');
      selectedModels.forEach(model => {
        setStatus(model, 'error');
      });
      return;
    }

    // Clear previous responses
    console.log(`${connectionId}: Clearing responses and setting streaming`);
    clearResponses();
    setIsStreaming(true);

    // Close previous connection
    if (eventSourceRef.current) {
      console.log(`${connectionId}: Closing previous connection`);
      eventSourceRef.current.close();
    }

    try {
      // Build SSE URL
      const params = new URLSearchParams({
        prompt: prompt.trim(),
        models: selectedModels.join(','),
      });

      const currentSessionId = (usePlaygroundStore.getState() as any).currentSessionId;
      if (currentSessionId) {
        params.set('sessionId', currentSessionId);
      }

      const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const url = `${base}/playground/stream?${params.toString()}`;

      console.log(`${connectionId}: Creating SSE connection to:`, url);
      // Create SSE connection - EventSource doesn't support custom headers
      // So we use fetch with stream handling
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

        // Process the stream
        const processStream = async () => {
          const decoder = new TextDecoder();
          let buffer = '';

          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              buffer += decoder.decode(value, { stream: true });
              const lines = buffer.split('\n');
              
              // Keep the last incomplete line in the buffer
              buffer = lines.pop() || '';

              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  const data = line.slice(6);
                  if (data.trim() && data !== '[DONE]') {
                    try {
                      const event = { data } as MessageEvent;
                      // Simulate EventSource onmessage
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

        // Create a mock EventSource-like object
        eventSourceRef.current = {
          readyState: 1, // EventSource.OPEN
          close: () => {
            controller.abort();
          },
          onmessage: null,
          onerror: null,
          onopen: null,
        } as EventSource;

        // Trigger onopen
        if (eventSourceRef.current.onopen) {
          eventSourceRef.current.onopen(new Event('open'));
        }

        // Start processing
        processStream();

      } catch (error) {
        console.error('Failed to create stream connection:', error);
        if (eventSourceRef.current?.onerror) {
          eventSourceRef.current.onerror(new Event('error'));
        }
      }
      
      // Add a timeout to detect rate limit errors quickly
      const errorTimeout = setTimeout(() => {
        if (eventSourceRef.current?.readyState === EventSource.CONNECTING) {
          // Still connecting after 3 seconds, might be an error
          console.log(`${connectionId}: Connection timeout, checking for rate limit`);
          fetch(url, { method: 'HEAD' })
            .then(response => {
              if (response.status === 429) {
                console.log(`${connectionId}: Rate limit detected via timeout, showing error message`);
                selectedModels.forEach(model => {
                  setStatus(model, 'error');
                  updateResponse(model, '⚠️ **Rate Limit Exceeded**\n\nYou have reached the limit of 5 requests per hour. Please try again later.', false);
                });
                setIsStreaming(false);
                eventSourceRef.current?.close();
              }
            })
            .catch(() => {});
        }
      }, 3000);

      // Handle messages
      eventSourceRef.current.onmessage = (event) => {
        try {
          const data: SSEEvent | { type: 'session'; sessionId: string } = JSON.parse(event.data);
          console.log(`${connectionId}: SSE message received:`, data);

          if ((data as any).type === 'session') {
            const sessionId = (data as any).sessionId;
            (usePlaygroundStore.getState() as any).setCurrentSessionId?.(sessionId);
            
            // Trigger session creation event to refresh sidebar
            setTimeout(() => {
              window.dispatchEvent(new CustomEvent('sessionCreated'));
            }, 500);
            
            return;
          }

          switch (data.type) {
            case 'chunk':
              console.log(`${connectionId}: Chunk received for ${data.model}:`, data.content);
              updateResponse(data.model, data.content);
              setStatus(data.model, 'streaming');
              break;

            case 'status':
              console.log(`${connectionId}: Status update for ${data.model}:`, data.status);
              setStatus(data.model, data.status);
              if (data.status === 'error' && data.message) {
                console.error(`${connectionId}: Model ${data.model} error:`, data.message);
              }
              break;

            case 'metrics':
              console.log(`${connectionId}: Metrics for ${data.model}:`, data);
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

      // Handle connection open
      eventSourceRef.current.onopen = () => {
        console.log(`${connectionId}: SSE connection opened, readyState:`, eventSourceRef.current?.readyState);
        clearTimeout(errorTimeout);
      };

      // Handle errors and auto-reconnection
      eventSourceRef.current.onerror = (error) => {
        console.log(`${connectionId}: SSE connection error:`, error, 'readyState:', eventSourceRef.current?.readyState);
        clearTimeout(errorTimeout);
        
        // Check if this is a rate limit error
        if (eventSourceRef.current?.readyState === EventSource.CLOSED) {
          // Connection was closed, might be rate limit
          fetch(url, { method: 'HEAD' })
            .then(response => {
              if (response.status === 429) {
                console.log(`${connectionId}: Rate limit detected, showing error message`);
                selectedModels.forEach(model => {
                  setStatus(model, 'error');
                  updateResponse(model, '⚠️ **Rate Limit Exceeded**\n\nYou have reached the limit of 5 requests per hour. Please try again later.\n\n*Tip: Check back in an hour for more requests.*', false);
                });
                setIsStreaming(false);
                return;
              } else {
                // Other error, show general error message
                selectedModels.forEach(model => {
                  setStatus(model, 'error');
                  updateResponse(model, '❌ **Connection Error**\n\nUnable to connect to the AI service. Please try again.', false);
                });
                setIsStreaming(false);
              }
            })
            .catch(() => {
              // Network error or other issues
              selectedModels.forEach(model => {
                setStatus(model, 'error');
                updateResponse(model, '❌ **Network Error**\n\nPlease check your connection and try again.', false);
              });
              setIsStreaming(false);
            });
        }
        
        const currentStatuses = usePlaygroundStore.getState().statuses;
        const done = selectedModels.every(m => ['complete','error'].includes(currentStatuses[m]));
        console.log(`${connectionId}: Error check - done:`, done, 'statuses:', currentStatuses);
        if (done) {
          console.log(`${connectionId}: All models complete, closing connection`);
          eventSourceRef.current?.close();
          return;
        }
      };

      // Listen for completion status
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

      // Periodically check if all models are completed with proper cleanup
      const checkInterval = setInterval(() => {
        const isComplete = checkAllComplete();
        const currentlyStreaming = usePlaygroundStore.getState().isStreaming;
        
        if (isComplete || !currentlyStreaming) {
          clearInterval(checkInterval);
        }
      }, 1000);

      // Store interval reference for cleanup
      const currentEventSource = eventSourceRef.current;
      if (currentEventSource) {
        (currentEventSource as any)._checkInterval = checkInterval;
      }

    } catch (error) {
      console.error('Failed to start SSE stream:', error);
      setIsStreaming(false);
      
      // Set all models to error status with friendly message
      selectedModels.forEach(model => {
        setStatus(model, 'error');
        updateResponse(model, '❌ **Service Unavailable**\n\nThe AI service is currently unavailable. Please try again later.', false);
      });
    }
  }, [selectedModels, clearResponses, updateResponse, setStatus, updateMetrics, setIsStreaming]);

  // Cleanup function
  const closeStream = useCallback(() => {
    if (eventSourceRef.current) {
      // Clear any stored interval
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