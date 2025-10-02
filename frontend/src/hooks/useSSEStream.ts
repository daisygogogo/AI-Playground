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

      // Add authentication token to query parameters
      if (token) {
        params.set('token', token);
      }

      const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const url = `${base}/playground/stream?${params.toString()}`;

      console.log(`${connectionId}: Creating SSE connection to:`, url);
      // Create SSE connection
      eventSourceRef.current = new EventSource(url);
      
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
          return;
        }
      };

      // Periodically check if all models are completed
      const checkInterval = setInterval(() => {
        checkAllComplete();
        if (!usePlaygroundStore.getState().isStreaming) {
          clearInterval(checkInterval);
        }
      }, 1000);

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