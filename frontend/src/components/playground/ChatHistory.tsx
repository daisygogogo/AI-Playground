'use client';

import { useRef, useLayoutEffect, memo } from 'react';
import MarkdownRenderer from './MarkdownRenderer';
import StatusIndicator from './StatusIndicator';
import { ModelStatus } from '@/types/playground';

interface ChatTurn {
  time: string;
  prompt: string;
  replies: Record<string, string>;
  metrics: Record<string, { tokensUsed: number; cost: number; responseTime: number }>;
  order?: string[];
}

interface ChatHistoryProps {
  turns: ChatTurn[];
  selectedModels: string[];
  responses: Record<string, string>;
  statuses: Record<string, string>;
  metrics: Record<string, { tokensUsed: number; cost: number; responseTime: number }>;
  isStreaming: boolean;
  currentPrompt: string;
  lastCompletedTurn: ChatTurn | null;
}

function ChatHistory({
  turns,
  selectedModels,
  responses,
  statuses,
  metrics,
  isStreaming,
  currentPrompt,
  lastCompletedTurn
}: ChatHistoryProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    const container = document.getElementById('chat-scroll-container');
    if (container) {
      container.scrollTop = container.scrollHeight;
    } else {
      messagesEndRef.current?.scrollIntoView();
    }
  };

  useLayoutEffect(() => {
    if (!isStreaming) return;
    scrollToBottom();
  }, [currentPrompt, isStreaming]);

  return (
    <div className="h-full flex flex-col">
      {/* Empty state */}
      {turns.length === 0 && !isStreaming && !lastCompletedTurn ? (
        <div className="flex-1 flex items-center justify-center text-center">
          <div className="text-gray-500 dark:text-gray-300">
            <div className="text-xl mb-3">👋 Welcome to AI Playground</div>
            <div className="text-base">Send a message to start comparing AI models</div>
          </div>
        </div>
      ) : (
        <div className="px-6 pt-10 space-y-6 pb-52">
          {/* Historical conversations */}
          {turns.length > 0 && turns.map((turn, idx) => (
            <div key={`${turn.time}-${turn.prompt.slice(0, 50)}`} className="space-y-4">
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
                {((turn.order && turn.order.filter(m => (turn.replies || {})[m] !== undefined)) || Object.keys(turn.replies || {})).map((model, index) => (
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
              {(currentPrompt || lastCompletedTurn || selectedModels.some(model => statuses[model] === 'error')) && (
                <div className="flex justify-end">
                  <div className="max-w-[80%] bg-gray-600 dark:bg-gray-700 text-white p-3 rounded-lg rounded-br-none">
                    <div className="whitespace-pre-wrap">{lastCompletedTurn ? lastCompletedTurn.prompt : currentPrompt}</div>
                    <div className="text-xs text-gray-200 mt-1">
                      {lastCompletedTurn ? new Date(lastCompletedTurn.time).toLocaleString() : new Date().toLocaleString()}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Streaming AI responses - side by side */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {(lastCompletedTurn ? (((lastCompletedTurn as any).order && (lastCompletedTurn as any).order.filter((m: string) => ((lastCompletedTurn as any).replies || {})[m] !== undefined)) || Object.keys((lastCompletedTurn as any).replies || {})) : selectedModels).map((model, index) => (
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
                        status={(statuses[model] === 'error' ? 'error' : (lastCompletedTurn ? 'complete' : (statuses[model] || 'typing'))) as ModelStatus} 
                        modelName="" 
                        responseTime={lastCompletedTurn ? lastCompletedTurn.metrics?.[model]?.responseTime : metrics[model]?.responseTime} 
                      />
                    </div>
                    <div className="min-h-[100px] mb-3">
                      {statuses[model] === 'error' && responses[model] ? (
                        <MarkdownRenderer content={responses[model]} />
                      ) : lastCompletedTurn ? (
                        lastCompletedTurn.replies[model] ? (
                          <MarkdownRenderer content={lastCompletedTurn.replies[model]} />
                        ) : (
                          <div className="text-sm text-gray-500 dark:text-gray-400">No response</div>
                        )
                      ) : (
                        <MarkdownRenderer content={responses[model] || ''} />
                      )}
                    </div>
                    {(lastCompletedTurn?.metrics?.[model] || metrics[model]) && (
                      <div className="text-xs text-gray-600 dark:text-gray-400 border-t border-gray-300 dark:border-gray-600 pt-2 space-y-1">
                        <div>Tokens: {lastCompletedTurn?.metrics?.[model]?.tokensUsed || metrics[model]?.tokensUsed || 0}</div>
                        <div>Cost: ${(lastCompletedTurn?.metrics?.[model]?.cost || metrics[model]?.cost || 0).toFixed(6)}</div>
                        <div>Time: {lastCompletedTurn?.metrics?.[model]?.responseTime || metrics[model]?.responseTime || 0}ms</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      )}
    </div>
  );
}

export default memo(ChatHistory);