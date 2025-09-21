// src/stores/imageStore.ts
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { ImageInfo } from '../types/api';

interface ImageStore {
  // State
  currentImage: ImageInfo | null;
  uploadProgress: number;
  isUploading: boolean;
  error: string | null;
  previewUrl: string | null;
  imageHistory: ImageInfo[]; // Історія завантажених зображень

  // Actions
  setCurrentImage: (image: ImageInfo | null) => void;
  setUploadProgress: (progress: number) => void;
  setIsUploading: (isUploading: boolean) => void;
  setError: (error: string | null) => void;
  setPreviewUrl: (url: string | null) => void;
  clearImage: () => void;
  uploadImage: (file: File) => Promise<void>;
  addToHistory: (image: ImageInfo) => void;
  getImageHistory: () => ImageInfo[];
  loadImageFromHistory: (imageId: string) => void;
}

export const useImageStore = create<ImageStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        currentImage: null,
        uploadProgress: 0,
        isUploading: false,
        error: null,
        previewUrl: null,
        imageHistory: [],

        // Actions
        setCurrentImage: (image) => {
          set({ currentImage: image });
          if (image) {
            get().addToHistory(image);
          }
        },
        
        setUploadProgress: (progress) => set({ uploadProgress: progress }),
        setIsUploading: (isUploading) => set({ isUploading }),
        setError: (error) => set({ error }),
        setPreviewUrl: (url) => set({ previewUrl: url }),
        
        clearImage: () => set({
          currentImage: null,
          uploadProgress: 0,
          isUploading: false,
          error: null,
          previewUrl: null
        }),

        addToHistory: (image: ImageInfo) => {
          set(state => ({
            imageHistory: [
              image,
              ...state.imageHistory.filter(img => img.id !== image.id)
            ].slice(0, 20) // Keep only last 20 images
          }));
        },

        getImageHistory: () => {
          return get().imageHistory;
        },

        loadImageFromHistory: (imageId: string) => {
          const history = get().imageHistory;
          const image = history.find(img => img.id === imageId);
          if (image) {
            set({ currentImage: image });
          }
        },
        
        uploadImage: async (file: File) => {
          const { setError, setIsUploading, setUploadProgress, setPreviewUrl, setCurrentImage } = get();
          
          setIsUploading(true);
          setUploadProgress(0);
          setError(null);
          
          try {
            // Create preview URL
            const previewUrl = URL.createObjectURL(file);
            setPreviewUrl(previewUrl);
            
            // Real API upload
            const formData = new FormData();
            formData.append('file', file);
            
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/v1/images/upload`, {
              method: 'POST',
              body: formData,
            });
            
            setUploadProgress(100);
            
            if (!response.ok) {
              throw new Error(`Upload failed: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.success && data.image) {
              setCurrentImage(data.image);
              setIsUploading(false);
            } else {
              throw new Error(data.message || 'Upload failed');
            }
            
          } catch (error) {
            console.error('Upload failed:', error);
            setError(error instanceof Error ? error.message : 'Upload failed');
            setIsUploading(false);
            setUploadProgress(0);
          }
        }
      }),
      {
        name: 'image-store',
        partialize: (state) => ({
          imageHistory: state.imageHistory,
          currentImage: state.currentImage
        })
      }
    ),
    { name: 'image-store' }
  )
);