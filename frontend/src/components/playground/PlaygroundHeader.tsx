'use client';

import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';

interface PlaygroundHeaderProps {
  userName?: string;
  onLogout: () => void;
}

export default function PlaygroundHeader({ userName, onLogout }: PlaygroundHeaderProps) {
  return (
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
              onClick={onLogout}
            >
              Logout
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}