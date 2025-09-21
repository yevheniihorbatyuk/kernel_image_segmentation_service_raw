// src/hooks/useSegmentation.ts
import { useCallback, useEffect } from 'react';
import { useSegmentationStore } from '../stores/segmentationStore';
import { useImageStore } from '../stores/imageStore';
import { useUIStore } from '../stores/uiStore';
import { useWebSocket } from './useWebSocket';
import { AlgorithmType } from '../types/segmentation';

export const useSegmentation = () => {
  const {
    availableAlgorithms,
    activeAlgorithms,
    results,
    isProcessing,
    progress,
    error,
    isLoadingAlgorithms,
    loadAlgorithms,
    removeAlgorithm,
    updateParameter,
    processSegmentation,
    clearResults,
    updateProgress,
    toggleAlgorithm,
    canAddMoreAlgorithms
  } = useSegmentationStore();

  const { currentImage } = useImageStore();
  const { addToast, viewMode } = useUIStore();
  const { send, lastMessage, isConnected } = useWebSocket();

  // Load algorithms on mount
  useEffect(() => {
    if (availableAlgorithms.length === 0 && !isLoadingAlgorithms) {
      loadAlgorithms();
    }
  }, []);

  // Handle WebSocket messages for real-time updates
  useEffect(() => {
    if (lastMessage) {
      switch (lastMessage.type) {
        case 'segmentation_progress':
          updateProgress(
            lastMessage.algorithm_name,
            lastMessage.progress_percent
          );
          break;
        
        case 'segmentation_complete':
          addToast({
            type: 'success',
            message: `${lastMessage.result.algorithm_name} segmentation completed!`
          });
          break;
        
        case 'segmentation_error':
          addToast({
            type: 'error',
            message: `${lastMessage.algorithm_name} failed: ${lastMessage.error_message}`
          });
          break;
      }
    }
  }, [lastMessage]);

  const handleProcessSegmentation = useCallback(async () => {
    if (!currentImage) {
      addToast({
        type: 'warning',
        message: 'Please upload an image first'
      });
      return;
    }

    if (activeAlgorithms.length === 0) {
      addToast({
        type: 'warning',
        message: 'Please select at least one algorithm'
      });
      return;
    }

    try {
      await processSegmentation(currentImage.id);
      addToast({
        type: 'success',
        message: 'Segmentation completed successfully!'
      });
    } catch (error) {
      addToast({
        type: 'error',
        message: 'Segmentation failed'
      });
    }
  }, [currentImage, activeAlgorithms, processSegmentation, addToast]);

  const handleParameterUpdate = useCallback((
    algorithmName: AlgorithmType,
    paramName: string,
    value: number | string
  ) => {
    updateParameter(algorithmName, paramName, value);

    // Send real-time update via WebSocket
    if (isConnected && currentImage) {
      send({
        type: 'parameter_update',
        algorithm_name: algorithmName,
        parameter_name: paramName,
        parameter_value: value,
        image_id: currentImage.id
      });
    }
  }, [updateParameter, send, isConnected, currentImage]);

  return {
    availableAlgorithms,
    activeAlgorithms,
    results,
    isProcessing,
    progress,
    error,
    isLoadingAlgorithms,
    removeAlgorithm,
    updateParameter: handleParameterUpdate,
    processSegmentation: handleProcessSegmentation,
    clearResults,
    toggleAlgorithm,
    canAddMoreAlgorithms
  };
};