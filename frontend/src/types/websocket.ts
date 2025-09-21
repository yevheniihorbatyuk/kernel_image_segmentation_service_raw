// src/types/websocket.ts
import { AlgorithmType } from './segmentation';

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
  timestamp?: number;
  connection_id?: string;
  [key: string]: any;
}

export interface WSParameterUpdate extends WSMessage {
  type: 'parameter_update';
  algorithm_name: AlgorithmType;
  parameter_name: string;
  parameter_value: number | string;
  image_id: string;
}

export interface WSSegmentationProgress extends WSMessage {
  type: 'segmentation_progress';
  algorithm_name: AlgorithmType;
  progress_percent: number;
  estimated_time_remaining?: number;
}

export interface WSSegmentationComplete extends WSMessage {
  type: 'segmentation_complete';
  result: any; // SegmentationResult
}

export interface WSSegmentationError extends WSMessage {
  type: 'segmentation_error';
  algorithm_name: AlgorithmType;
  error_message: string;
  error_code?: string;
}