// src/services/websocket.ts
import { WSMessage, WSMessageType } from '../types/websocket';

export class WebSocketService {
  private ws: WebSocket | null = null;
  private url: string;
  private connectionId: string | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 1000;
  private pingInterval: NodeJS.Timeout | null = null;
  
  // Event handlers
  private onMessageHandlers: ((message: WSMessage) => void)[] = [];
  private onOpenHandlers: ((event: Event) => void)[] = [];
  private onCloseHandlers: ((event: CloseEvent) => void)[] = [];
  private onErrorHandlers: ((error: Event) => void)[] = [];

  constructor(baseUrl?: string) {
    const wsUrl = baseUrl || process.env.REACT_APP_WS_URL || 'ws://localhost:8000';
    this.url = `${wsUrl}/api/v1/ws`;
  }

  connect(connectionId?: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const wsUrl = connectionId 
          ? `${this.url}/${connectionId}`
          : this.url;
        
        this.ws = new WebSocket(wsUrl);
        
        this.ws.onopen = (event) => {
          console.log('WebSocket connected');
          this.reconnectAttempts = 0;
          this.startPingInterval();
          this.onOpenHandlers.forEach(handler => handler(event));
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message: WSMessage = JSON.parse(event.data);
            console.log('WebSocket message received:', message);
            
            // Handle connection establishment
            if (message.type === 'connection_established') {
              this.connectionId = message.connection_id || null;
            }
            
            // Handle ping/pong
            if (message.type === 'ping') {
              this.send({ type: 'pong', timestamp: Date.now() });
              return;
            }
            
            this.onMessageHandlers.forEach(handler => handler(message));
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
          }
        };

        this.ws.onclose = (event) => {
          console.log('WebSocket disconnected:', event.code, event.reason);
          this.stopPingInterval();
          this.onCloseHandlers.forEach(handler => handler(event));
          
          // Attempt reconnection if not manually closed
          if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.scheduleReconnect();
          }
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          this.onErrorHandlers.forEach(handler => handler(error));
          reject(error);
        };

      } catch (error) {
        reject(error);
      }
    });
  }

  disconnect(): void {
    this.stopPingInterval();
    if (this.ws) {
      this.ws.close(1000, 'Manual disconnect');
      this.ws = null;
    }
    this.connectionId = null;
  }

  send(message: WSMessage): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
      console.log('WebSocket message sent:', message);
    } else {
      console.warn('WebSocket not connected, message not sent:', message);
    }
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  private scheduleReconnect(): void {
    this.reconnectAttempts++;
    const delay = this.reconnectInterval * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`Scheduling WebSocket reconnect attempt ${this.reconnectAttempts} in ${delay}ms`);
    
    setTimeout(() => {
      if (this.reconnectAttempts <= this.maxReconnectAttempts) {
        this.connect(this.connectionId || undefined);
      }
    }, delay);
  }

  private startPingInterval(): void {
    this.pingInterval = setInterval(() => {
      if (this.isConnected()) {
        this.send({ type: 'ping', timestamp: Date.now() });
      }
    }, 30000); // Ping every 30 seconds
  }

  private stopPingInterval(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  // Event handler management
  onMessage(handler: (message: WSMessage) => void): () => void {
    this.onMessageHandlers.push(handler);
    return () => {
      const index = this.onMessageHandlers.indexOf(handler);
      if (index > -1) {
        this.onMessageHandlers.splice(index, 1);
      }
    };
  }

  onOpen(handler: (event: Event) => void): () => void {
    this.onOpenHandlers.push(handler);
    return () => {
      const index = this.onOpenHandlers.indexOf(handler);
      if (index > -1) {
        this.onOpenHandlers.splice(index, 1);
      }
    };
  }

  onClose(handler: (event: CloseEvent) => void): () => void {
    this.onCloseHandlers.push(handler);
    return () => {
      const index = this.onCloseHandlers.indexOf(handler);
      if (index > -1) {
        this.onCloseHandlers.splice(index, 1);
      }
    };
  }

  onError(handler: (error: Event) => void): () => void {
    this.onErrorHandlers.push(handler);
    return () => {
      const index = this.onErrorHandlers.indexOf(handler);
      if (index > -1) {
        this.onErrorHandlers.splice(index, 1);
      }
    };
  }

  getConnectionId(): string | null {
    return this.connectionId;
  }
}

// Singleton instance
export const webSocketService = new WebSocketService();