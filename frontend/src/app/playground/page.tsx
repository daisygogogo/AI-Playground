'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import PromptInput from '@/components/playground/PromptInput';
import SessionSidebar from '@/components/playground/SessionSidebar';
import ChatHistory from '@/components/playground/ChatHistory';
import PlaygroundHeader from '@/components/playground/PlaygroundHeader';
import { usePlaygroundStore } from '@/stores/playgroundStore';
import { useAuthStore } from '@/stores/auth';
import { useSSEStream } from '@/hooks/useSSEStream';
import { fetchSessionDetail } from '@/services/api';

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
  
  const [turns, setTurns] = useState<any[]>([]);
  
  // Get currentSessionId from store state
  const currentSessionId = (usePlaygroundStore() as any).currentSessionId;

  // Cleanup SSE connection on component unmount
  useEffect(() => {
    return () => {
      closeStream();
    };
  }, [closeStream]);

  // Check authentication status
  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  // Load session detail when switching to an existing session
  useEffect(() => {
    const loadDetail = async () => {
      if (!currentSessionId) { 
        return; 
      }
      
      // Load existing session data
      const session = await fetchSessionDetail(currentSessionId);
      const sessionOrder = Array.isArray(session?.models) ? session.models as string[] : undefined;
      const grouped: Record<string, any> = {};
      
      (session?.conversations || []).forEach((c: any) => {
        const key = c.userPrompt || session.prompt || 'unknown';
        if (!grouped[key]) {
          grouped[key] = { 
            time: c.createdAt, 
            prompt: c.userPrompt || session.prompt, 
            replies: {},
            metrics: {},
            order: sessionOrder || []
          };
        }
        grouped[key].replies[c.modelName] = c.response;
        grouped[key].metrics[c.modelName] = {
          tokensUsed: (c.inputTokens || 0) + (c.outputTokens || 0),
          cost: c.cost || 0,
          responseTime: c.responseTime || 0
        };
        
        if (new Date(c.createdAt) < new Date(grouped[key].time)) {
          grouped[key].time = c.createdAt;
        }
      });
      
      const arr = Object.values(grouped).sort((a: any, b: any) => 
        new Date(a.time).getTime() - new Date(b.time).getTime()
      );
      setTurns(arr as any[]);
    };
    
    loadDetail();
  }, [currentSessionId]);


  const handlePromptSubmit = useCallback(async (newPrompt: string) => {
    // If there's a current completed conversation, add it to history first
    if (prompt && !isStreaming && Object.keys(responses).some(key => responses[key])) {
      const completedTurn = {
        time: new Date().toISOString(),
        prompt: prompt,
        replies: { ...responses },
        metrics: { ...metrics },
        order: [...selectedModels]
      };
      setTurns(prev => [...prev, completedTurn]);
    }
    
    // Clear previous responses and start new conversation
    setPrompt(newPrompt);
    streamPrompt(newPrompt);
    
    // Scroll to bottom when starting new prompt
    setTimeout(() => {
      const container = document.getElementById('chat-scroll-container');
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }, 100);
  }, [streamPrompt, setPrompt, prompt, isStreaming, responses, metrics, selectedModels]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleSessionSelect = useCallback((sessionId: string) => {
    setPrompt(''); // Clear current prompt when switching sessions
    (usePlaygroundStore.getState() as any).setCurrentSessionId?.(sessionId);
  }, [setPrompt]);

  const handleNewChat = useCallback(() => {
    setTurns([]);
    setPrompt(''); // Clear current prompt
    (usePlaygroundStore.getState() as any).setCurrentSessionId?.(null);
  }, [setPrompt]);

  // Show loading state if not authenticated
  if (!isAuthenticated()) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Checking authentication status...</div>
      </div>
    );
  }

  return (
    <div className="h-screen flex">
      <SessionSidebar 
        currentSessionId={currentSessionId}
        onSessionSelect={handleSessionSelect}
        onNewChat={handleNewChat}
        onLogout={handleLogout}
        userName={user?.firstName}
      />
      
      <div className="flex-1 h-screen overflow-hidden min-h-0 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <PlaygroundHeader />
        
        <main className="flex-1 flex flex-col h-full min-h-0">
          <div className="flex-1 min-h-0 overflow-y-auto mb-56 pt-2" id="chat-scroll-container">
            <ChatHistory 
              turns={turns}
              selectedModels={selectedModels}
              responses={responses}
              statuses={statuses}
              metrics={metrics}
              isStreaming={isStreaming}
              currentPrompt={prompt}
            />
          </div>
          
          <div className="fixed bottom-0 left-64 right-0 border-t bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm p-2">
            <PromptInput 
              onSubmit={handlePromptSubmit} 
              disabled={isStreaming}
            />
          </div>
        </main>
      </div>
    </div>
  );
}