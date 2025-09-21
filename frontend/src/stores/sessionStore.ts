// src/stores/sessionStore.ts
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { ImageInfo } from '../types/api';
import { SegmentationResult, AlgorithmConfig } from '../types/segmentation';

interface SessionData {
  id: string;
  timestamp: string;
  image: ImageInfo | null;
  algorithms: AlgorithmConfig[];
  results: SegmentationResult[];
  name?: string;
}

interface SessionStore {
  // State
  currentSession: SessionData | null;
  savedSessions: SessionData[];
  
  // Actions
  saveCurrentSession: (name?: string) => void;
  loadSession: (sessionId: string) => SessionData | null;
  deleteSession: (sessionId: string) => void;
  createNewSession: () => void;
  updateCurrentSession: (updates: Partial<SessionData>) => void;
  getSavedSessions: () => SessionData[];
}

export const useSessionStore = create<SessionStore>()(
  devtools(
    persist(
      (set, get) => ({
        currentSession: null,
        savedSessions: [],

        saveCurrentSession: (name?: string) => {
          const currentSession = get().currentSession;
          if (!currentSession) return;

          const sessionToSave: SessionData = {
            ...currentSession,
            id: currentSession.id || Date.now().toString(),
            timestamp: new Date().toISOString(),
            name: name || `Session ${new Date().toLocaleString()}`
          };

          set(state => ({
            savedSessions: [
              ...state.savedSessions.filter(s => s.id !== sessionToSave.id),
              sessionToSave
            ].slice(-10) // Keep only last 10 sessions
          }));
        },

        loadSession: (sessionId: string) => {
          const sessions = get().savedSessions;
          const session = sessions.find(s => s.id === sessionId);
          if (session) {
            set({ currentSession: { ...session } });
          }
          return session || null;
        },

        deleteSession: (sessionId: string) => {
          set(state => ({
            savedSessions: state.savedSessions.filter(s => s.id !== sessionId)
          }));
        },

        createNewSession: () => {
          const newSession: SessionData = {
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            image: null,
            algorithms: [],
            results: []
          };
          set({ currentSession: newSession });
        },

        updateCurrentSession: (updates: Partial<SessionData>) => {
          set(state => ({
            currentSession: state.currentSession ? {
              ...state.currentSession,
              ...updates,
              timestamp: new Date().toISOString()
            } : null
          }));
        },

        getSavedSessions: () => {
          return get().savedSessions.sort((a, b) => 
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          );
        }
      }),
      {
        name: 'session-store'
      }
    ),
    { name: 'session-store' }
  )
);