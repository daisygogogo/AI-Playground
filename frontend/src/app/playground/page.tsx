'use client';

import { useEffect, useState } from 'react';
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
  
  const [hasAsked, setHasAsked] = useState(false);
  const [turns, setTurns] = useState<any[]>([]);
  const [lastCompletedTurn, setLastCompletedTurn] = useState<any>(null);
  const currentSessionId = (usePlaygroundStore.getState() as any).currentSessionId;

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
        setTurns([]);
        setLastCompletedTurn(null);
        return; 
      }
      
      if (isStreaming) {
        return;
      }
      
      const session = await fetchSessionDetail(currentSessionId);
      const grouped: Record<string, any> = {};
      
      (session?.conversations || []).forEach((c: any) => {
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


  // Handle streaming completion
  useEffect(() => {
    if (!isStreaming && currentSessionId && hasAsked && prompt && !lastCompletedTurn) {
      const hasErrors = selectedModels.some(model => statuses[model] === 'error');
      if (!hasErrors) {
        const completedTurn = {
          time: new Date().toISOString(),
          prompt: prompt,
          replies: { ...responses },
          metrics: { ...metrics }
        };
        setLastCompletedTurn(completedTurn);
      }
    }
  }, [isStreaming, statuses, selectedModels, currentSessionId, hasAsked, prompt, lastCompletedTurn, responses, metrics]);

  // Clear completed turn when new streaming starts (database will handle the history)
  useEffect(() => {
    if (isStreaming && lastCompletedTurn) {
      setLastCompletedTurn(null);
    }
  }, [isStreaming, lastCompletedTurn]);

  const handlePromptSubmit = async (newPrompt: string) => {
    // If there's a lastCompletedTurn, reload session detail to move it to history
    if (lastCompletedTurn && currentSessionId) {
      const session = await fetchSessionDetail(currentSessionId);
      const grouped: Record<string, any> = {};
      
      (session?.conversations || []).forEach((c: any) => {
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
        
        if (new Date(c.createdAt) < new Date(grouped[key].time)) {
          grouped[key].time = c.createdAt;
        }
      });
      
      const arr = Object.values(grouped).sort((a: any, b: any) => 
        new Date(a.time).getTime() - new Date(b.time).getTime()
      );
      setTurns(arr as any[]);
      
      // Notify SessionSidebar to refresh
      window.dispatchEvent(new CustomEvent('sessionCreated'));
    }
    
    setPrompt(newPrompt);
    streamPrompt(newPrompt);
    setHasAsked(true);
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleSessionSelect = (sessionId: string) => {
    setLastCompletedTurn(null);
    setHasAsked(false);
    (usePlaygroundStore.getState() as any).setCurrentSessionId?.(sessionId);
  };

  const handleNewChat = () => {
    (usePlaygroundStore.getState() as any).setCurrentSessionId?.(null);
    setTurns([]);
    setLastCompletedTurn(null);
    setHasAsked(false);
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
      <SessionSidebar 
        currentSessionId={currentSessionId}
        onSessionSelect={handleSessionSelect}
        onNewChat={handleNewChat}
      />
      
      <div className="flex-1 min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <PlaygroundHeader 
          userName={user?.firstName}
          onLogout={handleLogout}
        />
        
        <main className="flex-1 flex flex-col" style={{height: 'calc(100vh - 72px)'}}>
          <div className="flex-1 overflow-y-auto">
            <ChatHistory 
              turns={turns}
              selectedModels={selectedModels}
              responses={responses}
              statuses={statuses}
              metrics={metrics}
              isStreaming={isStreaming}
              currentPrompt={prompt}
              lastCompletedTurn={lastCompletedTurn}
            />
          </div>
          
          <div className="border-t bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm p-4">
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