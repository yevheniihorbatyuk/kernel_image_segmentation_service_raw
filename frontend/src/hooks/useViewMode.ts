// src/hooks/useViewMode.ts
import { useCallback } from 'react';
import { useUIStore } from '../stores/uiStore';
import { ViewMode } from '../types/segmentation';

export const useViewMode = () => {
  const {
    viewMode,
    gridConfig,
    isFullscreen,
    setViewMode,
    updateGridConfig,
    toggleFullscreen
  } = useUIStore();

  const handleViewModeChange = useCallback((mode: ViewMode) => {
    setViewMode(mode);
  }, [setViewMode]);

  const handleGridSlotToggle = useCallback((slotIndex: number) => {
    const newActiveSlots = [...gridConfig.activeSlots];
    newActiveSlots[slotIndex] = !newActiveSlots[slotIndex];
    
    updateGridConfig({
      activeSlots: newActiveSlots
    });
  }, [gridConfig.activeSlots, updateGridConfig]);

  const getActiveSlotCount = useCallback(() => {
    return gridConfig.activeSlots.filter(Boolean).length;
  }, [gridConfig.activeSlots]);

  const getMaxAllowedAlgorithms = useCallback(() => {
    // Завжди дозволяємо максимум 4 алгоритми незалежно від view mode
    return 4;
  }, []);

  return {
    viewMode,
    gridConfig,
    isFullscreen,
    setViewMode: handleViewModeChange,
    toggleGridSlot: handleGridSlotToggle,
    getActiveSlotCount,
    getMaxAllowedAlgorithms,
    toggleFullscreen
  };
};