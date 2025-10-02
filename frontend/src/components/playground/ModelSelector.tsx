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
  }
};

export default function ModelSelector({ 
  selectedModels, 
  onModelChange, 
  className 
}: ModelSelectorProps) {
  const toggleModel = (model: AIModel) => {
    if (selectedModels.includes(model)) {
      // Keep at least one model
      if (selectedModels.length > 1) {
        onModelChange(selectedModels.filter(m => m !== model));
      }
    } else {
      onModelChange([...selectedModels, model]);
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div>
        <h3 className="text-sm font-medium text-foreground mb-2">Select AI Models</h3>
        <p className="text-xs text-muted-foreground">
          Choose AI models to compare (select at least one)
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(Object.keys(modelInfo) as AIModel[]).map(model => {
          const info = modelInfo[model];
          const isSelected = selectedModels.includes(model);
          
          return (
            <Card 
              key={model}
              className={cn(
                "cursor-pointer transition-all border-2",
                isSelected 
                  ? "border-primary bg-primary/5" 
                  : "border-gray-200 hover:border-primary/50"
              )}
              onClick={() => toggleModel(model)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">{info.name}</CardTitle>
                  {isSelected && (
                    <Badge variant="default" className="text-xs">
                      Selected
                    </Badge>
                  )}
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
        {selectedModels.length} model(s) selected
      </div>
    </div>
  );
}