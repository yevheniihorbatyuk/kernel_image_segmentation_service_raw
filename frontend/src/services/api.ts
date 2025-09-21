// src/services/api.ts
import axios, { AxiosResponse } from 'axios';
import { 
  ImageUploadResponse, 
  AlgorithmInfo, 
  SegmentationRequest, 
  SegmentationResponse,
  ImageInfo
} from '../types/api';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export class ApiService {
  // Image endpoints
  static async uploadImage(file: File): Promise<ImageUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response: AxiosResponse<ImageUploadResponse> = await apiClient.post(
      '/images/upload',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    
    return response.data;
  }

  static async getImageInfo(imageId: string): Promise<ImageInfo> {
    const response: AxiosResponse<ImageInfo> = await apiClient.get(
      `/images/info/${imageId}`
    );
    return response.data;
  }

  // Algorithm endpoints
  static async getAvailableAlgorithms(): Promise<AlgorithmInfo[]> {
    const response: AxiosResponse<{ algorithms: AlgorithmInfo[] }> = await apiClient.get(
      '/segmentation/algorithms'
    );
    return response.data.algorithms;
  }

  static async getAlgorithmInfo(algorithmName: string): Promise<AlgorithmInfo> {
    const response: AxiosResponse<AlgorithmInfo> = await apiClient.get(
      `/segmentation/algorithms/${algorithmName}`
    );
    return response.data;
  }

  // Segmentation endpoints
  static async segmentImage(request: SegmentationRequest): Promise<SegmentationResponse> {
    const response: AxiosResponse<SegmentationResponse> = await apiClient.post(
      '/segmentation/segment',
      request
    );
    return response.data;
  }

  static async batchSegmentImages(requests: SegmentationRequest[]): Promise<any> {
    const response = await apiClient.post('/segmentation/batch', requests);
    return response.data;
  }

  // Health check
  static async healthCheck(): Promise<any> {
    const response = await apiClient.get('/health', {
      baseURL: API_BASE_URL, // Use base URL without /api/v1
    });
    return response.data;
  }
}

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
            if (message.type === 'connection_established' && message.connection_id) {
                this.connectionId = message.connection_id;
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

// src/services/imageService.ts
export class ImageService {
  static validateImageFile(file: File): { isValid: boolean; error?: string } {
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/bmp', 'image/tiff'];
    if (!allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`
      };
    }

    // Check file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return {
        isValid: false,
        error: `File too large. Maximum size: ${(maxSize / 1024 / 1024).toFixed(1)}MB`
      };
    }

    return { isValid: true };
  }

  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  static createImagePreview(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          resolve(e.target.result as string);
        } else {
          reject(new Error('Failed to read file'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  }

  static getImageUrl(imageUrl: string): string {
    // Convert relative URL to absolute if needed
    if (imageUrl.startsWith('/')) {
      const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';
      return `${baseUrl}${imageUrl}`;
    }
    return imageUrl;
  }
}

// src/utils/constants.ts
export const ALGORITHM_CONFIGS = {
  felzenszwalb: {
    name: 'felzenszwalb' as const,
    displayName: 'Felzenszwalb',
    description: 'Efficient graph-based segmentation',
    color: '#1976d2',
    defaultParams: {
      scale: 100,
      sigma: 0.5,
      min_size: 50
    }
  },
  slic: {
    name: 'slic' as const,
    displayName: 'SLIC',
    description: 'Simple Linear Iterative Clustering',
    color: '#388e3c',
    defaultParams: {
      n_segments: 250,
      compactness: 10,
      sigma: 1,
      start_label: 1
    }
  },
  quickshift: {
    name: 'quickshift' as const,
    displayName: 'Quickshift',
    description: 'Quick shift image segmentation',
    color: '#f57c00',
    defaultParams: {
      kernel_size: 3,
      max_dist: 6,
      ratio: 0.5
    }
  },
  watershed: {
    name: 'watershed' as const,
    displayName: 'Watershed',
    description: 'Watershed segmentation algorithm',
    color: '#7b1fa2',
    defaultParams: {
      markers: 250,
      compactness: 0
    }
  }
} as const;

export const VIEW_MODES = {
  single: {
    name: 'single' as const,
    displayName: 'Single View',
    description: 'Focus on one algorithm result',
    icon: 'CropFree'
  },
  split: {
    name: 'split' as const,
    displayName: 'Split View',
    description: 'Original vs segmented side-by-side',
    icon: 'ViewColumn'
  },
  grid_2x2: {
    name: 'grid_2x2' as const,
    displayName: '2×2 Grid',
    description: 'Compare up to 4 algorithms',
    icon: 'GridView'
  }
} as const;

export const APP_CONSTANTS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_FILE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/bmp', 'image/tiff'],
  MAX_ALGORITHMS: 4,
  DEFAULT_TOAST_DURATION: 5000,
  WEBSOCKET_RECONNECT_DELAY: 1000,
  PARAMETER_UPDATE_DEBOUNCE: 300
} as const;