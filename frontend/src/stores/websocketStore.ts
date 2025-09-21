// src/stores/websocketStore.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { WSMessage } from '../types/websocket';
import { webSocketService } from '../services/websocket';

interface WebSocketStore {
  // State
  isConnected: boolean;
  connectionId: string | null;
  error: string | null;
  lastMessage: WSMessage | null;
  messageHistory: WSMessage[];

  // Actions
  connect: () => Promise<void>;
  disconnect: () => void;
  sendMessage: (message: WSMessage) => void;
  clearError: () => void;
  clearHistory: () => void;
}

export const useWebSocketStore = create<WebSocketStore>()(
  devtools(
    (set, get) => ({
      // Initial state
      isConnected: false,
      connectionId: null,
      error: null,
      lastMessage: null,
      messageHistory: [],

      // Actions
      connect: async () => {
        try {
          await webSocketService.connect();
          
          // Set up event handlers
          webSocketService.onOpen(() => {
            set({ 
              isConnected: true, 
              error: null,
              connectionId: webSocketService.getConnectionId()
            });
          });

          webSocketService.onClose(() => {
            set({ isConnected: false });
          });

          webSocketService.onError(() => {
            set({ 
              error: 'WebSocket connection error',
              isConnected: false
            });
          });

          webSocketService.onMessage((message) => {
            set(state => ({
              lastMessage: message,
              messageHistory: [...state.messageHistory.slice(-99), message] // Keep last 100 messages
            }));
          });

        } catch (error) {
          set({ 
            error: 'Failed to connect to WebSocket',
            isConnected: false
          });
        }
      },

      disconnect: () => {
        webSocketService.disconnect();
        set({ 
          isConnected: false, 
          connectionId: null,
          error: null
        });
      },

      sendMessage: (message: WSMessage) => {
        if (get().isConnected) {
          webSocketService.send(message);
        } else {
          set({ error: 'WebSocket not connected' });
        }
      },

      clearError: () => {
        set({ error: null });
      },

      clearHistory: () => {
        set({ messageHistory: [], lastMessage: null });
      }
    }),
    { name: 'websocket-store' }
  )
);