// src/hooks/useWebSocket.ts
import { useEffect, useRef, useCallback } from 'react';
import { WSMessage } from '../types/websocket';
import { useWebSocketStore } from '../stores/websocketStore';

export const useWebSocket = () => {
  const {
    isConnected,
    connectionId,
    error,
    lastMessage,
    connect,
    disconnect,
    sendMessage,
    clearError
  } = useWebSocketStore();

  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

  // Auto-connect on mount
  useEffect(() => {
    if (!isConnected && !error) {
      connect();
    }

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  // Auto-reconnect on error
  useEffect(() => {
    if (error && !isConnected) {
      reconnectTimeoutRef.current = setTimeout(() => {
        clearError();
        connect();
      }, 3000);
    }
  }, [error, isConnected]);

  const send = useCallback((message: WSMessage) => {
    if (isConnected) {
      sendMessage(message);
    } else {
      console.warn('WebSocket not connected, message not sent:', message);
    }
  }, [isConnected, sendMessage]);

  return {
    isConnected,
    connectionId,
    error,
    lastMessage,
    send,
    connect,
    disconnect
  };
};