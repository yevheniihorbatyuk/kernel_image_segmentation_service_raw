// src/hooks/useImageUpload.ts
import { useCallback } from 'react';
import { useImageStore } from '../stores/imageStore';
import { useUIStore } from '../stores/uiStore';

export const useImageUpload = () => {
  const {
    currentImage,
    uploadProgress,
    isUploading,
    error,
    previewUrl,
    uploadImage,
    clearImage,
    setError
  } = useImageStore();

  const { addToast } = useUIStore();

  const handleUpload = useCallback(async (file: File) => {
    try {
      await uploadImage(file);
      addToast({
        type: 'success',
        message: `Image "${file.name}" uploaded successfully!`
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      addToast({
        type: 'error',
        message: errorMessage
      });
    }
  }, [uploadImage, addToast]);

  const handleClear = useCallback(() => {
    clearImage();
    addToast({
      type: 'info',
      message: 'Image cleared'
    });
  }, [clearImage, addToast]);

  return {
    currentImage,
    uploadProgress,
    isUploading,
    error,
    previewUrl,
    upload: handleUpload,
    clear: handleClear,
    setError
  };
};