'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PromptInputProps {
  onSubmit: (prompt: string) => void;
  disabled?: boolean;
  className?: string;
}

export default function PromptInput({ 
  onSubmit, 
  disabled,
  className 
}: PromptInputProps) {
  const [prompt, setPrompt] = useState('');
  
  const handleSubmit = () => {
    if (prompt.trim() && !disabled) {
      onSubmit(prompt.trim());
      setPrompt(''); // Clear input after sending
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };
  
  return (
    <div className={cn("border-2 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg space-y-2", className)}>
      <Textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Enter the questions you want to ask the AI models..."
        className="resize-none border-0 bg-transparent p-2 focus-visible:ring-0 text-gray-800 dark:text-gray-200"
        disabled={disabled}
        onKeyDown={handleKeyDown}
      />
      <div className="border-t border-gray-300 dark:border-gray-600 pt-2">
        <div className="flex justify-between items-center">
          <div className="text-xs text-gray-600 dark:text-gray-400">
            Press Ctrl/Cmd + Enter to send quickly
          </div>
          <Button 
            onClick={handleSubmit}
            disabled={!prompt.trim() || disabled}
            size="sm"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white dark:text-white"
          >
            {disabled ? (
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            ) : (
              <Send className="w-4 h-4 text-white" />
            )}
            {disabled ? 'Generating...' : 'Send to AI Models'}
          </Button>
        </div>
      </div>
    </div>
  );
}