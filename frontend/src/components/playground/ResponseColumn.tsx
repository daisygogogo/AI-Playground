'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ModelStatus, ModelMetrics } from '@/types/playground';
import { cn, formatCost, formatResponseTime } from '@/lib/utils';

interface ResponseColumnProps {
  response: string;
  status: ModelStatus;
  metrics?: ModelMetrics;
  className?: string;
}

export default function ResponseColumn({ 
  response, 
  status, 
  metrics,
  className 
}: ResponseColumnProps) {
  const isStreaming = status === 'streaming';
  
  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Response Content */}
      <div className="flex-1 min-h-[200px] max-h-[400px] overflow-y-auto">
        {response ? (
          <div className={cn(
            "prose prose-sm max-w-none dark:prose-invert",
            "prose-headings:text-foreground",
            "prose-p:text-foreground",
            "prose-strong:text-foreground",
            "prose-code:text-foreground",
            "prose-pre:bg-muted",
            "prose-blockquote:border-l-gray-200",
            "prose-blockquote:text-muted-foreground"
          )}>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code(props) { const { children } = props as any;
                  return (props as any).inline ? (
                    <code 
                      className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono" 
                      {...props}
                    >
                      {children}
                    </code>
                  ) : (
                    <pre className="bg-muted p-4 rounded-md overflow-x-auto">
                      <code className="text-sm font-mono" {...props}>
                        {children}
                      </code>
                    </pre>
                  );
                },
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-gray-200 pl-4 italic text-muted-foreground bg-muted/50 py-2 rounded-r">
                    {children}
                  </blockquote>
                ),
              }}
            >
              {response}
            </ReactMarkdown>
            {isStreaming && (
              <span className="inline-block w-2 h-5 bg-primary animate-pulse ml-1 rounded" />
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            {status === 'typing' ? 'Waiting for response...' : 'No content'}
          </div>
        )}
      </div>
      
      {/* Metrics */}
      {metrics && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Tokens:</span>
              <span className="ml-2 font-mono">{metrics.tokensUsed}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Cost:</span>
              <span className="ml-2 font-mono">{formatCost(metrics.cost)}</span>
            </div>
            {metrics.responseTime > 0 && (
              <div className="col-span-2">
                <span className="text-muted-foreground">Time:</span>
                <span className="ml-2 font-mono">{formatResponseTime(metrics.responseTime)}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}