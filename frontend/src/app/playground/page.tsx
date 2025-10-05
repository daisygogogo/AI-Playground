'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
// import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import PromptInput from '@/components/playground/PromptInput';
// import ModelSelector from '@/components/playground/ModelSelector';
import StatusIndicator from '@/components/playground/StatusIndicator';
// import ResponseColumn from '@/components/playground/ResponseColumn';
import MarkdownRenderer from '@/components/playground/MarkdownRenderer';
import { usePlaygroundStore } from '@/stores/playgroundStore';
import { useAuthStore } from '@/stores/auth';
import { useSSEStream } from '@/hooks/useSSEStream';
import { fetchSessions, fetchSessionDetail } from '@/services/api';

export default function PlaygroundPage() {
  const {
    prompt,
    selectedModels,
    responses,
    statuses,
    metrics,
    setPrompt,
  } = usePlaygroundStore();

  const { user, isAuthenticated, logout } = useAuthStore();
  const router = useRouter();
  const { streamPrompt, isStreaming, closeStream } = useSSEStream();
  
  // Listen for new session creation to refresh sidebar
  useEffect(() => {
    const handleSessionCreated = () => {
      loadSessions(1, true); // Force refresh
    };
    
    // We can use a simple event listener approach
    window.addEventListener('sessionCreated', handleSessionCreated);
    return () => window.removeEventListener('sessionCreated', handleSessionCreated);
  }, []);

  // Cleanup SSE connection on component unmount
  useEffect(() => {
    return () => {
      closeStream();
    };
  }, [closeStream]);
  const [hasAsked, setHasAsked] = useState(false);
  const [sessions, setSessions] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [turns, setTurns] = useState<any[]>([]);
  const [lastCompletedTurn, setLastCompletedTurn] = useState<any>(null);
  const currentSessionId = (usePlaygroundStore.getState() as any).currentSessionId;
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Auto scroll when new messages arrive or responses update (debounced)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      scrollToBottom();
    }, 300); // Increase delay to reduce flicker
    return () => clearTimeout(timeoutId);
  }, [turns.length, isStreaming]); // Reduce dependencies to avoid excessive scrolling

  const loadSessions = async (nextPage = 1, force = false) => {
    if ((loadingSessions || !hasMore) && !force) return;
    
    setLoadingSessions(true);
    try {
      const data = await fetchSessions(nextPage, 20);
      setSessions(prev => {
        // If it's page 1 or forced refresh, replace all sessions
        if (nextPage === 1 || force) {
          return data.items || [];
        }
        // Otherwise append to existing sessions
        const map = new Map<string, any>();
        [...prev, ...data.items].forEach((s:any)=> map.set(s.id, s));
        return Array.from(map.values());
      });
      setHasMore(nextPage * 20 < (data.total ?? Number.MAX_SAFE_INTEGER));
      setPage(nextPage);
    } finally {
      setLoadingSessions(false);
    }
  };

  // Check authentication status
  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    // Only load sessions if we don't have any yet
    if (sessions.length === 0) {
      loadSessions(1);
    }
  }, [sessions.length]);

  // Load session detail only when switching to an existing session
  useEffect(() => {
    const loadDetail = async () => {
      if (!currentSessionId) { 
        setTurns([]);
        setLastCompletedTurn(null);
        return; 
      }
      // Only skip if currently streaming or have a completed turn for current session
      if (isStreaming) {
        return;
      }
      const session = await fetchSessionDetail(currentSessionId);
      const grouped: Record<string, any> = {};
      (session?.conversations || []).forEach((c: any) => {
        // Use userPrompt as the grouping key instead of createdAt to avoid duplicates
        const key = c.userPrompt || session.prompt || 'unknown';
        if (!grouped[key]) {
          grouped[key] = { 
            time: c.createdAt, 
            prompt: c.userPrompt || session.prompt, 
            replies: {},
            metrics: {}
          };
        }
        grouped[key].replies[c.modelName] = c.response;
        grouped[key].metrics[c.modelName] = {
          tokensUsed: (c.inputTokens || 0) + (c.outputTokens || 0),
          cost: c.cost || 0,
          responseTime: c.responseTime || 0
        };
        // Update time to the earliest conversation time for this prompt
        if (new Date(c.createdAt) < new Date(grouped[key].time)) {
          grouped[key].time = c.createdAt;
        }
      });
      const arr = Object.values(grouped).sort((a: any,b: any)=> new Date(a.time).getTime()-new Date(b.time).getTime());
      setTurns(arr as any[]);
    };
    loadDetail();
  }, [currentSessionId]);

  // Handle streaming completion - preserve current state
  useEffect(() => {
    if (!isStreaming && currentSessionId && hasAsked && prompt && !lastCompletedTurn) {
      // Check if any model has error status - don't create completed turn if there are errors
      const hasErrors = selectedModels.some(model => statuses[model] === 'error');
      if (!hasErrors) {
        const completedTurn = {
          time: new Date().toISOString(),
          prompt: prompt,
          replies: { ...responses },
          metrics: { ...metrics }
        };
        setLastCompletedTurn(completedTurn);
        
        // Refresh sessions list to include the current session
        setTimeout(() => loadSessions(1), 1000);
      }
    }
  }, [isStreaming, statuses, selectedModels]);

  // Move completed turn to history when new streaming starts
  useEffect(() => {
    if (isStreaming && lastCompletedTurn) {
      setTurns(prev => [...prev, lastCompletedTurn]);
      setLastCompletedTurn(null);
    }
  }, [isStreaming]);

  const handlePromptSubmit = (newPrompt: string) => {
    setPrompt(newPrompt);
    streamPrompt(newPrompt);
    setHasAsked(true);
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  // Show loading state if not authenticated
  if (!isAuthenticated()) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Checking authentication status...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 border-r bg-white dark:bg-gray-900 p-4 space-y-4 hidden md:block">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">History</h2>
          <Button 
            size="sm" 
            variant="outline" 
            className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={() => {
              (usePlaygroundStore.getState() as any).setCurrentSessionId?.(null);
              setTurns([]);
              setLastCompletedTurn(null);
              setHasAsked(false);
            }}
          >
            New Chat
          </Button>
        </div>
        <div className="space-y-2 text-sm overflow-y-auto max-h-[calc(100vh-100px)]" onScroll={(e)=>{
          const el = e.currentTarget;
          if (hasMore && !loadingSessions && el.scrollTop + el.clientHeight >= el.scrollHeight - 50) {
            loadSessions(page + 1);
          }
        }}>
          {sessions.length === 0 ? (
            <div className="text-muted-foreground">No history</div>
          ) : (
            sessions.map(s => (
              <button 
                key={s.id} 
                className={`w-full text-left px-2 py-2 rounded hover:bg-muted ${currentSessionId===s.id?'bg-muted':''}`} 
                onClick={() => {
                  // Clear current state before loading new session
                  setLastCompletedTurn(null);
                  setHasAsked(false);
                  // Set the new session ID
                  (usePlaygroundStore.getState() as any).setCurrentSessionId?.(s.id);
                }}
              >
                <div className="truncate text-xs text-muted-foreground">{new Date(s.createdAt).toLocaleString()}</div>
                <div className="truncate">{s.title || s.prompt || '(empty prompt)'}</div>
              </button>
            ))
          )}
          {loadingSessions && <div className="text-xs text-muted-foreground">Loading...</div>}
        </div>
      </aside>
      <div className="flex-1 min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <header className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="px-4 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">AI Model Playground</h1>
              <div className="flex items-center gap-4">
                <ThemeToggle />
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 flex flex-col" style={{height: 'calc(100vh - 72px)'}}>
          {/* Chat Messages Area */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
            {/* Historical conversation */}
            {turns.length > 0 && turns.map((turn, idx) => (
              <div key={idx} className="space-y-4">
                {/* User message */}
                <div className="flex justify-end">
                  <div className="max-w-[80%] bg-gray-600 dark:bg-gray-700 text-white p-3 rounded-lg rounded-br-none">
                    <div className="whitespace-pre-wrap">{turn.prompt}</div>
                    <div className="text-xs text-gray-200 mt-1">
                      {new Date(turn.time).toLocaleString()}
                    </div>
                  </div>
                </div>
                
                {/* AI responses - side by side */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {selectedModels.map((model, index) => (
                    <div 
                      key={model} 
                      className={`border-2 p-4 rounded-lg ${
                        index === 0 
                          ? 'bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800' 
                          : 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <div className={`text-sm font-semibold ${
                          index === 0 
                            ? 'text-blue-700 dark:text-blue-300' 
                            : 'text-green-700 dark:text-green-300'
                        }`}>
                          {model}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(turn.time).toLocaleString()}
                        </div>
                      </div>
                      <div className="mb-3">
                        {turn.replies?.[model] ? (
                          <MarkdownRenderer content={turn.replies[model]} />
                        ) : (
                          <div className="text-sm text-gray-500 dark:text-gray-400">No response saved</div>
                        )}
                      </div>
                      {/* Historical metrics if available */}
                      {turn.metrics?.[model] && (
                        <div className="text-xs text-gray-600 dark:text-gray-400 border-t border-gray-300 dark:border-gray-600 pt-2 space-y-1">
                          <div>Tokens: {turn.metrics[model].tokensUsed}</div>
                          <div>Cost: ${turn.metrics[model].cost?.toFixed(6)}</div>
                          <div>Time: {turn.metrics[model].responseTime}ms</div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Current streaming, completed, or error responses */}
            {(isStreaming || lastCompletedTurn || selectedModels.some(model => statuses[model] === 'error')) && (
              <div className="space-y-4">
                {/* Current user message */}
                {(prompt || lastCompletedTurn || selectedModels.some(model => statuses[model] === 'error')) && (
                  <div className="flex justify-end">
                    <div className="max-w-[80%] bg-gray-600 dark:bg-gray-700 text-white p-3 rounded-lg rounded-br-none">
                      <div className="whitespace-pre-wrap">{lastCompletedTurn ? lastCompletedTurn.prompt : prompt}</div>
                      <div className="text-xs text-gray-200 mt-1">
                        {lastCompletedTurn ? new Date(lastCompletedTurn.time).toLocaleString() : new Date().toLocaleString()}
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Streaming AI responses - side by side */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {selectedModels.map((model, index) => (
                    <div 
                      key={model} 
                      className={`border-2 p-4 rounded-lg ${
                        index === 0 
                          ? 'bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800' 
                          : 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <div className={`text-sm font-semibold ${
                          index === 0 
                            ? 'text-blue-700 dark:text-blue-300' 
                            : 'text-green-700 dark:text-green-300'
                        }`}>
                          {model}
                        </div>
                        <StatusIndicator 
                          status={statuses[model] === 'error' ? 'error' : (lastCompletedTurn ? 'complete' : (statuses[model] || 'typing'))} 
                          modelName="" 
                          responseTime={lastCompletedTurn ? lastCompletedTurn.metrics[model]?.responseTime : metrics[model]?.responseTime} 
                        />
                      </div>
                      <div className="min-h-[100px] mb-3">
                        {statuses[model] === 'error' && responses[model] ? (
                          // Show error message first if status is error
                          <MarkdownRenderer content={responses[model]} />
                        ) : lastCompletedTurn ? (
                          lastCompletedTurn.replies[model] ? (
                            <MarkdownRenderer content={lastCompletedTurn.replies[model]} />
                          ) : (
                            <div className="text-sm text-gray-500 dark:text-gray-400">No response</div>
                          )
                        ) : (
                          responses[model] ? (
                            <MarkdownRenderer content={responses[model]} />
                          ) : (
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {statuses[model] === 'streaming' ? 'Thinking...' : 'Waiting...'}
                            </div>
                          )
                        )}
                      </div>
                      {/* Metrics */}
                      <div className="text-xs text-gray-600 dark:text-gray-400 border-t border-gray-300 dark:border-gray-600 pt-2 space-y-1">
                        {lastCompletedTurn && lastCompletedTurn.metrics[model] ? (
                          // Show completed metrics
                          <>
                            <div className="flex">
                              <span >Tokens: </span>
                              <span className='ml-1'>{lastCompletedTurn.metrics[model].tokensUsed || 0}</span>
                            </div>
                            <div className="flex">
                              <span>Cost: </span>
                              <span className='ml-1'>${lastCompletedTurn.metrics[model].cost?.toFixed(6) || '0.000000'}</span>
                            </div>
                            <div className="flex">
                              <span>Time: </span>
                              <span className='ml-1'>{lastCompletedTurn.metrics[model].responseTime || 0}ms</span>
                            </div>
                          </>
                        ) : (
                          // Show live streaming metrics
                          <>
                            {metrics[model] && (
                              <>
                                <div className="flex justify-between">
                                  <span>Tokens:</span>
                                  <span>{metrics[model].tokensUsed || 0}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Cost:</span>
                                  <span>${metrics[model].cost?.toFixed(6) || '0.000000'}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Time:</span>
                                  <span>{metrics[model].responseTime || 0}ms</span>
                                </div>
                              </>
                            )}
                            {!metrics[model] && statuses[model] === 'streaming' && (
                              <div className="text-center text-gray-400">Calculating metrics...</div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty state */}
            {turns.length === 0 && !isStreaming && !lastCompletedTurn && (
              <div className="flex-1 flex items-center justify-center text-center">
                <div className="text-gray-500 dark:text-gray-300">
                  <div className="text-lg mb-2">👋 Welcome to AI Playground</div>
                  <div>Send a message to start comparing AI models</div>
                </div>
              </div>
            )}

            {/* Scroll anchor */}
            <div ref={messagesEndRef} />
          </div>

          {/* Fixed input at bottom */}
          <div className="border-t bg-white dark:bg-gray-900 p-6">
            <div className="max-w-4xl mx-auto">
              <PromptInput onSubmit={handlePromptSubmit} disabled={isStreaming} />
            </div>
          </div>

          {/* Models info */}
          <div className="border-t bg-gray-50 dark:bg-gray-800 p-2">
            <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
              <span>Models: {selectedModels.join(', ')}</span>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}