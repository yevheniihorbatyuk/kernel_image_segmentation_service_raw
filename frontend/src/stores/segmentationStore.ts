// src/stores/segmentationStore.ts
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
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
  resultHistory: SegmentationResult[]; // Історія всіх результатів

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
  getResultHistory: () => SegmentationResult[];
  clearResultHistory: () => void;
}

export const useSegmentationStore = create<SegmentationStore>()(
  devtools(
    persist(
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
        resultHistory: [],

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
        
        setResults: (results) => {
          set({ results });
          // Додаємо до історії
          // results.forEach(result => {
          //   get().addResult(result);
          // });
        },
        
        addResult: (result) => {
          set(state => ({ 
            // НЕ додаємо до results тут, тільки до історії
            resultHistory: [
              result,
              ...state.resultHistory.filter(r => 
                !(r.algorithm_name === result.algorithm_name && r.created_at === result.created_at)
              )
            ].slice(0, 100) // Keep only last 100 results
          }));
        },
        
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

        getResultHistory: () => {
          return get().resultHistory.sort((a, b) => 
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
        },

        clearResultHistory: () => {
          set({ resultHistory: [] });
        },
        
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
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/v1/segmentation/algorithms`);
            if (response.ok) {
              const data = await response.json();
              setAvailableAlgorithms(data.algorithms || []);
            } else {
              // Fallback to mock data
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
            }
          } catch (error) {
            setError('Failed to load algorithms');
          } finally {
            setIsLoadingAlgorithms(false);
          }
        },

        processSegmentation: async (imageId: string) => {
          const { setIsProcessing, setError, activeAlgorithms } = get(); // Видали setResults
          
          setIsProcessing(true);
          setError(null);
          
          try {
            const requestBody = {
              image_id: imageId,
              algorithms: activeAlgorithms.map(alg => ({
                name: alg.name,
                display_name: alg.display_name,
                parameters: alg.parameters,
                is_active: alg.is_active
              })),
              view_mode: 'single'
            };

            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/v1/segmentation/segment`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(`Segmentation failed: ${response.status} - ${JSON.stringify(errorData)}`);
            }

            const data = await response.json(); // Додали відсутній рядок
            
            // Просто встановлюємо результати один раз
            set({ results: data.results || [] });
            setIsProcessing(false);
            
          } catch (error) {
            setError(error instanceof Error ? error.message : 'Segmentation processing failed');
            setIsProcessing(false);
          }
        },

        canAddMoreAlgorithms: () => {
          const { activeAlgorithms } = get();
          return activeAlgorithms.length < 4;
        }
      }),
      {
        name: 'segmentation-store',
        partialize: (state) => ({
          activeAlgorithms: state.activeAlgorithms,
          resultHistory: state.resultHistory
        })
      }
    ),
    { name: 'segmentation-store' }
  )
);