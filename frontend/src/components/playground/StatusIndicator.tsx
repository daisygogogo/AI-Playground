'use client';

import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { ModelStatus } from '@/types/playground';
import { cn } from '@/lib/utils';

interface StatusIndicatorProps {
  status: ModelStatus;
  modelName: string;
  responseTime?: number;
  className?: string;
}

export default function StatusIndicator({ 
  status, 
  modelName, 
  responseTime,
  className 
}: StatusIndicatorProps) {
  const statusConfig = {
    typing: {
      icon: '⌨️',
      text: 'Preparing...',
      variant: 'secondary' as const
    },
    streaming: {
      icon: <Loader2 className="w-4 h-4 animate-spin" />,
      text: 'Generating...',
      variant: 'default' as const,
      animate: false
    },
    complete: {
      icon: '✅',
      text: `Complete ${responseTime ? `(${responseTime}ms)` : ''}`,
      variant: 'success' as const
    },
    error: {
      icon: '❌',
      text: 'Error',
      variant: 'destructive' as const
    }
  };

  const config = statusConfig[status];
  
  return (
    <div className={cn("flex items-center justify-between", className)}>
      <h3 className="font-semibold text-foreground">{modelName}</h3>
      <Badge 
        variant={config.variant}
        className="flex items-center gap-2"
      >
        {config.icon}
        <span>{config.text}</span>
      </Badge>
    </div>
  );
}