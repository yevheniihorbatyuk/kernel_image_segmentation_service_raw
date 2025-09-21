// src/types/api.ts
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface ImageInfo {
  id: string;
  filename: string;
  original_filename: string;
  url: string;
  content_type: string;
  size: number;
  dimensions: [number, number];
  created_at: string;
}

export interface ImageUploadResponse {
  success: boolean;
  image?: ImageInfo;
  message: string;
  upload_url?: string;
}

// src/types/segmentation.ts
export type AlgorithmType = 'felzenszwalb' | 'slic' | 'quickshift' | 'watershed';

export type ViewMode = 'single' | 'split' | 'grid_2x2';

export interface ParameterSchema {
  name: string;
  value: number | string;
  min_value?: number;
  max_value?: number;
  step?: number;
  type: 'int' | 'float' | 'string' | 'bool';
}

export interface AlgorithmConfig {
  name: AlgorithmType;
  display_name: string;
  parameters: Record<string, number | string>;
  is_active: boolean;
}

export interface PerformanceMetrics {
  processing_time: number;
  memory_usage?: number;
  segments_count: number;
  algorithm_name: string;
  image_dimensions: [number, number];
}

export interface SegmentationResult {
  algorithm_name: AlgorithmType;
  result_image_url: string;
  segments_count: number;
  processing_time: number;
  parameters_used: Record<string, any>;
  metrics?: PerformanceMetrics;
  created_at: string;
}

export interface SegmentationResponse {
  request_id: string;
  original_image_url: string;
  results: SegmentationResult[];
  view_mode: ViewMode;
  total_processing_time: number;
  created_at: string;
}

export interface AlgorithmInfo {
  name: AlgorithmType;
  display_name: string;
  description: string;
  default_parameters: Record<string, ParameterSchema>;
  parameter_ranges: Record<string, {
    min: number;
    max: number;
    step: number;
    type: string;
  }>;
}

export interface SegmentationRequest {
  image_id: string;
  algorithms: AlgorithmConfig[];
  view_mode: ViewMode;
  resize_dimensions?: [number, number];
}

// src/types/websocket.ts
export type WSMessageType = 
  | 'parameter_update' 
  | 'segmentation_start' 
  | 'segmentation_progress' 
  | 'segmentation_complete' 
  | 'segmentation_error'
  | 'view_mode_change'
  | 'connection_established'
  | 'ping'
  | 'pong';

export interface WSMessage {
  type: WSMessageType;
  [key: string]: any;
}

export interface WSParameterUpdate {
  type: 'parameter_update';
  algorithm_name: AlgorithmType;
  parameter_name: string;
  parameter_value: number | string;
  image_id: string;
}

export interface WSSegmentationProgress {
  type: 'segmentation_progress';
  algorithm_name: AlgorithmType;
  progress_percent: number;
  estimated_time_remaining?: number;
}

export interface WSSegmentationComplete {
  type: 'segmentation_complete';
  result: SegmentationResult;
}

export interface WSSegmentationError {
  type: 'segmentation_error';
  algorithm_name: AlgorithmType;
  error_message: string;
  error_code?: string;
}

// src/types/ui.ts
export interface LoadingState {
  isLoading: boolean;
  message?: string;
  progress?: number;
}

export interface ErrorState {
  hasError: boolean;
  message?: string;
  details?: string;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

export interface ViewGridConfig {
  rows: number;
  cols: number;
  activeSlots: boolean[];
}

export interface ComparisonViewState {
  viewMode: ViewMode;
  selectedAlgorithms: AlgorithmType[];
  showOriginal: boolean;
  showOverlay: boolean;
  gridConfig: ViewGridConfig;
}

export interface ParameterControlState {
  algorithm: AlgorithmType;
  parameter: string;
  value: number | string;
  isLocked: boolean;
  isDirty: boolean;
}

// src/types/store.ts
export interface ImageStore {
  currentImage?: ImageInfo;
  uploadProgress: number;
  isUploading: boolean;
  error?: string;
  uploadImage: (file: File) => Promise<void>;
  clearImage: () => void;
  setError: (error: string) => void;
}

export interface SegmentationStore {
  availableAlgorithms: AlgorithmInfo[];
  activeAlgorithms: AlgorithmConfig[];
  results: SegmentationResult[];
  isProcessing: boolean;
  progress: Record<AlgorithmType, number>;
  error?: string;
  
  // Actions
  loadAlgorithms: () => Promise<void>;
  addAlgorithm: (algorithm: AlgorithmConfig) => void;
  removeAlgorithm: (algorithmName: AlgorithmType) => void;
  updateParameter: (algorithmName: AlgorithmType, paramName: string, value: number | string) => void;
  processSegmentation: (imageId: string) => Promise<void>;
  clearResults: () => void;
}

export interface UIStore {
  viewMode: ViewMode;
  sidebarOpen: boolean;
  darkMode: boolean;
  toasts: ToastMessage[];
  
  // Actions
  setViewMode: (mode: ViewMode) => void;
  toggleSidebar: () => void;
  toggleDarkMode: () => void;
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
}

// src/types/hooks.ts
export interface UseWebSocketOptions {
  url: string;
  onMessage?: (message: WSMessage) => void;
  onError?: (error: Event) => void;
  onOpen?: (event: Event) => void;
  onClose?: (event: CloseEvent) => void;
  reconnectAttempts?: number;
  reconnectInterval?: number;
}

export interface UseWebSocketReturn {
  ws: WebSocket | null;
  isConnected: boolean;
  send: (message: WSMessage) => void;
  close: () => void;
  reconnect: () => void;
}

export interface UseImageUploadReturn {
  uploadImage: (file: File) => Promise<ImageInfo | null>;
  isUploading: boolean;
  progress: number;
  error: string | null;
}

export interface UseSegmentationReturn {
  segment: (request: SegmentationRequest) => Promise<SegmentationResponse | null>;
  isProcessing: boolean;
  progress: Record<string, number>;
  error: string | null;
}