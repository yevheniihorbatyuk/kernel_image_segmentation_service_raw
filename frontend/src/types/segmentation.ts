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
  }>;
}

export interface SegmentationRequest {
  image_id: string;
  algorithms: AlgorithmConfig[];
  view_mode: ViewMode;
  resize_dimensions?: [number, number];
}