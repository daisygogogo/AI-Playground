'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { fetchSessions } from '@/services/api';

interface Session {
  id: string;
  prompt: string;
  createdAt: string;
  status: string;
}

interface SessionSidebarProps {
  currentSessionId?: string;
  onSessionSelect: (sessionId: string) => void;
  onNewChat: () => void;
}

export default function SessionSidebar({ currentSessionId, onSessionSelect, onNewChat }: SessionSidebarProps) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingSessions, setLoadingSessions] = useState(false);

  const loadSessions = async (nextPage = 1, force = false) => {
    if ((loadingSessions || !hasMore) && !force) return;
    
    setLoadingSessions(true);
    try {
      const data = await fetchSessions(nextPage, 20);
      setSessions(prev => {
        if (nextPage === 1 || force) {
          return data.items || [];
        }
        const map = new Map<string, Session>();
        [...prev, ...data.items].forEach((s: Session) => map.set(s.id, s));
        return Array.from(map.values());
      });
      setHasMore(nextPage * 20 < (data.total ?? Number.MAX_SAFE_INTEGER));
      setPage(nextPage);
    } finally {
      setLoadingSessions(false);
    }
  };

  useEffect(() => {
    const handleSessionCreated = () => {
      loadSessions(1, true);
    };
    
    window.addEventListener('sessionCreated', handleSessionCreated);
    return () => window.removeEventListener('sessionCreated', handleSessionCreated);
  }, []);

  useEffect(() => {
    if (sessions.length === 0) {
      loadSessions(1);
    }
  }, [sessions.length]);

  const handleLoadMore = () => {
    if (hasMore && !loadingSessions) {
      loadSessions(page + 1);
    }
  };

  return (
    <aside className="w-64 border-r bg-white dark:bg-gray-900 p-4 space-y-4 hidden md:block">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">History</h2>
        <Button 
          size="sm" 
          variant="outline" 
          className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          onClick={onNewChat}
        >
          New Chat
        </Button>
      </div>
      
      <div className="space-y-2 text-sm overflow-y-auto max-h-[calc(100vh-100px)]">
        {sessions.length === 0 ? (
          <div className="text-muted-foreground">No history</div>
        ) : (
          sessions.map((session) => (
            <button
              key={session.id}
              onClick={() => onSessionSelect(session.id)}
              className={`w-full text-left px-2 py-2 rounded hover:bg-muted ${
                currentSessionId === session.id ? 'bg-muted' : ''
              }`}
            >
              <div className="truncate text-xs text-muted-foreground">
                {new Date(session.createdAt).toLocaleString()}
              </div>
              <div className="truncate">{session.prompt || '(empty prompt)'}</div>
            </button>
          ))
        )}
        
        {hasMore && (
          <Button
            onClick={handleLoadMore}
            disabled={loadingSessions}
            variant="ghost"
            className="w-full mt-2 text-xs"
            size="sm"
          >
            {loadingSessions ? 'Loading...' : 'Load More'}
          </Button>
        )}
        
        {loadingSessions && <div className="text-xs text-muted-foreground">Loading...</div>}
      </div>
    </aside>
  );
}