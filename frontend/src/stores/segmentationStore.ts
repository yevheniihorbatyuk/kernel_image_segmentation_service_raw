// src/stores/segmentationStore.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { 
  AlgorithmInfo, 
  AlgorithmConfig, 
  SegmentationResult, 
  AlgorithmType 
} from '../types/segmentation';

interface SegmentationStore {
  // State
  availableAlgorithms: AlgorithmInfo[];
  activeAlgorithms: AlgorithmConfig[];
  results: SegmentationResult[];
  isProcessing: boolean;
  progress: Record<AlgorithmType, number>;
  error: string | null;
  isLoadingAlgorithms: boolean;

  // Actions
  setAvailableAlgorithms: (algorithms: AlgorithmInfo[]) => void;
  setActiveAlgorithms: (algorithms: AlgorithmConfig[]) => void;
  addAlgorithm: (algorithm: AlgorithmConfig) => void;
  removeAlgorithm: (algorithmName: AlgorithmType) => void;
  updateParameter: (algorithmName: AlgorithmType, paramName: string, value: number | string) => void;
  setResults: (results: SegmentationResult[]) => void;
  addResult: (result: SegmentationResult) => void;
  setIsProcessing: (isProcessing: boolean) => void;
  updateProgress: (algorithmName: AlgorithmType, progress: number) => void;
  setError: (error: string | null) => void;
  setIsLoadingAlgorithms: (isLoading: boolean) => void;
  clearResults: () => void;
  toggleAlgorithm: (algorithmName: AlgorithmType) => void;
  loadAlgorithms: () => Promise<void>;
  processSegmentation: (imageId: string) => Promise<void>;
  canAddMoreAlgorithms: () => boolean;
}

export const useSegmentationStore = create<SegmentationStore>()(
  devtools(
    (set, get) => ({
      // Initial state
      availableAlgorithms: [],
      activeAlgorithms: [],
      results: [],
      isProcessing: false,
      progress: {
        felzenszwalb: 0,
        slic: 0,
        quickshift: 0,
        watershed: 0
      },
      error: null,
      isLoadingAlgorithms: false,

      // Actions
      setAvailableAlgorithms: (algorithms) => set({ availableAlgorithms: algorithms }),
      setActiveAlgorithms: (algorithms) => set({ activeAlgorithms: algorithms }),
      
      addAlgorithm: (algorithm) => set(state => ({
        activeAlgorithms: [...state.activeAlgorithms, algorithm]
      })),
      
      removeAlgorithm: (algorithmName) => set(state => ({
        activeAlgorithms: state.activeAlgorithms.filter(alg => alg.name !== algorithmName)
      })),
      
      updateParameter: (algorithmName, paramName, value) => set(state => ({
        activeAlgorithms: state.activeAlgorithms.map(alg => 
          alg.name === algorithmName 
            ? { ...alg, parameters: { ...alg.parameters, [paramName]: value } }
            : alg
        )
      })),
      
      setResults: (results) => set({ results }),
      addResult: (result) => set(state => ({ results: [...state.results, result] })),
      setIsProcessing: (isProcessing) => set({ isProcessing }),
      
      updateProgress: (algorithmName, progress) => set(state => ({
        progress: { ...state.progress, [algorithmName]: progress }
      })),
      
      setError: (error) => set({ error }),
      setIsLoadingAlgorithms: (isLoading) => set({ isLoadingAlgorithms: isLoading }),
      clearResults: () => set({ 
        results: [], 
        progress: {
          felzenszwalb: 0,
          slic: 0,
          quickshift: 0,
          watershed: 0
        }
      }),
      
      toggleAlgorithm: (algorithmName) => {
        const { activeAlgorithms, availableAlgorithms, removeAlgorithm } = get();
        const isActive = activeAlgorithms.some(alg => alg.name === algorithmName);
        
        if (isActive) {
          removeAlgorithm(algorithmName);
        } else {
          // Find algorithm info to create proper config
          const algorithmInfo = availableAlgorithms.find(alg => alg.name === algorithmName);
          if (algorithmInfo) {
            const defaultParams: Record<string, number | string> = {};
            Object.entries(algorithmInfo.default_parameters).forEach(([key, schema]) => {
              defaultParams[key] = schema.value;
            });

            const newAlgorithm: AlgorithmConfig = {
              name: algorithmName,
              display_name: algorithmInfo.display_name,
              parameters: defaultParams,
              is_active: true
            };
            
            set(state => ({
              activeAlgorithms: [...state.activeAlgorithms, newAlgorithm]
            }));
          }
        }
      },

      loadAlgorithms: async () => {
        const { setIsLoadingAlgorithms, setAvailableAlgorithms, setError } = get();
        
        setIsLoadingAlgorithms(true);
        try {
          // Mock algorithm loading - replace with actual API call
          const mockAlgorithms: AlgorithmInfo[] = [
            {
              name: 'felzenszwalb',
              display_name: 'Felzenszwalb',
              description: 'Efficient graph-based segmentation',
              default_parameters: {
                scale: { name: 'scale', value: 100, min_value: 1, max_value: 1000, step: 1, type: 'int' },
                sigma: { name: 'sigma', value: 0.5, min_value: 0.1, max_value: 2.0, step: 0.1, type: 'float' },
                min_size: { name: 'min_size', value: 50, min_value: 1, max_value: 500, step: 1, type: 'int' }
              },
              parameter_ranges: {
                scale: { min: 1, max: 1000, step: 1 },
                sigma: { min: 0.1, max: 2.0, step: 0.1 },
                min_size: { min: 1, max: 500, step: 1 }
              }
            },
            {
              name: 'slic',
              display_name: 'SLIC',
              description: 'Simple Linear Iterative Clustering',
              default_parameters: {
                n_segments: { name: 'n_segments', value: 250, min_value: 10, max_value: 1000, step: 1, type: 'int' },
                compactness: { name: 'compactness', value: 10, min_value: 1, max_value: 50, step: 1, type: 'int' },
                sigma: { name: 'sigma', value: 1, min_value: 0.1, max_value: 5.0, step: 0.1, type: 'float' }
              },
              parameter_ranges: {
                n_segments: { min: 10, max: 1000, step: 1 },
                compactness: { min: 1, max: 50, step: 1 },
                sigma: { min: 0.1, max: 5.0, step: 0.1 }
              }
            },
            {
              name: 'quickshift',
              display_name: 'Quickshift',
              description: 'Quick shift image segmentation',
              default_parameters: {
                kernel_size: { name: 'kernel_size', value: 3, min_value: 1, max_value: 10, step: 1, type: 'int' },
                max_dist: { name: 'max_dist', value: 6, min_value: 1, max_value: 20, step: 1, type: 'int' },
                ratio: { name: 'ratio', value: 0.5, min_value: 0.1, max_value: 1.0, step: 0.1, type: 'float' }
              },
              parameter_ranges: {
                kernel_size: { min: 1, max: 10, step: 1 },
                max_dist: { min: 1, max: 20, step: 1 },
                ratio: { min: 0.1, max: 1.0, step: 0.1 }
              }
            },
            {
              name: 'watershed',
              display_name: 'Watershed',
              description: 'Watershed segmentation algorithm',
              default_parameters: {
                markers: { name: 'markers', value: 250, min_value: 10, max_value: 1000, step: 1, type: 'int' },
                compactness: { name: 'compactness', value: 0, min_value: 0, max_value: 1, step: 0.1, type: 'float' }
              },
              parameter_ranges: {
                markers: { min: 10, max: 1000, step: 1 },
                compactness: { min: 0, max: 1, step: 0.1 }
              }
            }
          ];
          
          setAvailableAlgorithms(mockAlgorithms);
        } catch (error) {
          setError('Failed to load algorithms');
        } finally {
          setIsLoadingAlgorithms(false);
        }
      },

      processSegmentation: async (imageId: string) => {
        const { setIsProcessing, setError, activeAlgorithms, setResults } = get();
        
        setIsProcessing(true);
        setError(null);
        
        try {
          // Prepare request for real API - include display_name
          const requestBody = {
            image_id: imageId,
            algorithms: activeAlgorithms.map(alg => ({
              name: alg.name,
              display_name: alg.display_name, // Додаємо це поле
              parameters: alg.parameters,
              is_active: alg.is_active
            })),
            view_mode: 'single' // Default view mode
          };

          console.log('Sending segmentation request:', requestBody);

          const response = await fetch(`${process.env.REACT_APP_API_URL}/api/v1/segmentation/segment`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
          });

          console.log('Response status:', response.status);

          if (!response.ok) {
            const errorData = await response.json();
            console.error('API Error:', errorData);
            throw new Error(`Segmentation failed: ${response.status} - ${JSON.stringify(errorData)}`);
          }

          const data = await response.json();
          console.log('Segmentation response:', data);
          
          // Set results from API response
          setResults(data.results || []);
          setIsProcessing(false);
          
        } catch (error) {
          console.error('Segmentation failed:', error);
          setError(error instanceof Error ? error.message : 'Segmentation processing failed');
          setIsProcessing(false);
        }
      },

      canAddMoreAlgorithms: () => {
        const { activeAlgorithms } = get();
        return activeAlgorithms.length < 4; // Завжди максимум 4
      }
    }),
    { name: 'segmentation-store' }
  )
);