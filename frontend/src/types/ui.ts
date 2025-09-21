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
  viewMode: 'single' | 'split' | 'grid_2x2';
  selectedAlgorithms: string[];
  showOriginal: boolean;
  showOverlay: boolean;
  gridConfig: ViewGridConfig;
}

export interface ParameterControlState {
  algorithm: string;
  parameter: string;
  value: number | string;
  isLocked: boolean;
  isDirty: boolean;
}