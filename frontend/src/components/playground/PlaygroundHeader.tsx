'use client';

import { useState } from 'react';
import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ModelSelector from './ModelSelector';
import { usePlaygroundStore } from '@/stores/playgroundStore';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export default function PlaygroundHeader() {
  const { selectedModels, setSelectedModels } = usePlaygroundStore();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-10 border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm px-4 py-3 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          AI Playground
        </h1>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {selectedModels.length} model{selectedModels.length !== 1 ? 's' : ''} selected
        </div>
      </div>
      
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="flex items-center space-x-2">
            <Settings className="w-4 h-4" />
            <span>Models</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Select AI Models</DialogTitle>
          </DialogHeader>
          <ModelSelector
            selectedModels={selectedModels}
            onModelChange={(models) => {
              setSelectedModels(models);
            }}
          />
        </DialogContent>
      </Dialog>
    </header>
  );
}