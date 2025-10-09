'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AIModel } from '@/types/playground';
import { cn } from '@/lib/utils';

interface ModelSelectorProps {
  selectedModels: AIModel[];
  onModelChange: (models: AIModel[]) => void;
  className?: string;
}

const modelInfo: Record<AIModel, { 
  name: string; 
  description: string; 
  cost: string; 
  speed: string;
}> = {
  'gpt-3.5-turbo': {
    name: 'GPT-3.5 Turbo',
    description: 'Fast response, suitable for daily conversations',
    cost: '$0.002/1K tokens',
    speed: '⚡ Fast'
  },
  'gpt-4o-mini': {
    name: 'GPT-4o Mini',
    description: 'High-quality output, lowest cost',
    cost: '$0.00015/1K tokens',
    speed: '⚡ Ultra Fast'
  },
  'database-agent': {
    name: 'Database Agent',
    description: 'AI agent with database access for queries',
    cost: '$0.00015/1K tokens',
    speed: '🗄️ Database'
  }
};

export default function ModelSelector({ 
  selectedModels, 
  onModelChange, 
  className 
}: ModelSelectorProps) {
  // Only show the default models and make them non-interactive
  const displayModels: AIModel[] = ['gpt-4o-mini', 'database-agent'];

  return (
    <div className={cn("space-y-6", className)}>
      <div>
        <p className="text-sm text-muted-foreground">
          Selected models (fixed)
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {displayModels.map(model => {
          const info = modelInfo[model];
          
          return (
            <Card 
              key={model}
              className="border-2 border-primary bg-primary/5"
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">{info.name}</CardTitle>
                  <Badge variant="default" className="text-xs">
                    Selected
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-xs text-muted-foreground mb-2">
                  {info.description}
                </p>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">{info.cost}</span>
                  <span>{info.speed}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      <div className="text-xs text-muted-foreground">
        {displayModels.length} model(s) selected (fixed)
      </div>
    </div>
  );
}