// src/utils/constants.ts
import { AlgorithmType, ViewMode } from '../types/segmentation';

export const ALGORITHM_CONFIGS = {
  felzenszwalb: {
    name: 'felzenszwalb' as AlgorithmType,
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
    name: 'slic' as AlgorithmType,
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
    name: 'quickshift' as AlgorithmType,
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
    name: 'watershed' as AlgorithmType,
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
    name: 'single' as ViewMode,
    displayName: 'Single View',
    description: 'Focus on one algorithm result',
    icon: 'CropFree'
  },
  split: {
    name: 'split' as ViewMode,
    displayName: 'Split View',
    description: 'Original vs segmented side-by-side',
    icon: 'ViewColumn'
  },
  grid_2x2: {
    name: 'grid_2x2' as ViewMode,
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