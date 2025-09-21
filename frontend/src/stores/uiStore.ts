// src/stores/uiStore.ts
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { ViewMode } from '../types/segmentation';
import { ToastMessage } from '../types/ui';

interface UIStore {
  // State
  viewMode: ViewMode;
  sidebarOpen: boolean;
  darkMode: boolean;
  toasts: ToastMessage[];
  isFullscreen: boolean;
  gridConfig: {
    rows: number;
    cols: number;
    activeSlots: boolean[];
  };

  // Actions
  setViewMode: (mode: ViewMode) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleDarkMode: () => void;
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
  toggleFullscreen: () => void;
  updateGridConfig: (config: Partial<UIStore['gridConfig']>) => void;
}

export const useUIStore = create<UIStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        viewMode: 'single',
        sidebarOpen: true,
        darkMode: false,
        toasts: [],
        isFullscreen: false,
        gridConfig: {
          rows: 2,
          cols: 2,
          activeSlots: [true, false, false, false]
        },

        // Actions
        setViewMode: (mode: ViewMode) => {
          set({ viewMode: mode });
          
          // Update grid config based on view mode
          let newGridConfig;
          if (mode === 'grid_2x2') {
            newGridConfig = {
              rows: 2,
              cols: 2,
              activeSlots: [true, true, true, true]
            };
          } else if (mode === 'split') {
            newGridConfig = {
              rows: 1,
              cols: 2,
              activeSlots: [true, true, false, false]
            };
          } else {
            newGridConfig = {
              rows: 1,
              cols: 1,
              activeSlots: [true, false, false, false]
            };
          }
          
          set({ gridConfig: newGridConfig });
        },

        toggleSidebar: () => {
          set(state => ({ sidebarOpen: !state.sidebarOpen }));
        },

        setSidebarOpen: (open: boolean) => {
          set({ sidebarOpen: open });
        },

        toggleDarkMode: () => {
          set(state => ({ darkMode: !state.darkMode }));
        },

        addToast: (toast: Omit<ToastMessage, 'id'>) => {
          const id = Date.now().toString();
          const newToast: ToastMessage = {
            ...toast,
            id,
            duration: toast.duration || 5000
          };
          
          set(state => ({
            toasts: [...state.toasts, newToast]
          }));

          // Auto remove toast
          if (newToast.duration && newToast.duration > 0) {
            setTimeout(() => {
              get().removeToast(id);
            }, newToast.duration);
          }
        },

        removeToast: (id: string) => {
          set(state => ({
            toasts: state.toasts.filter(toast => toast.id !== id)
          }));
        },

        clearToasts: () => {
          set({ toasts: [] });
        },

        toggleFullscreen: () => {
          set(state => ({ isFullscreen: !state.isFullscreen }));
        },

        updateGridConfig: (config: Partial<UIStore['gridConfig']>) => {
          set(state => ({
            gridConfig: {
              ...state.gridConfig,
              ...config
            }
          }));
        }
      }),
      {
        name: 'ui-store',
        partialize: (state) => ({
          darkMode: state.darkMode,
          sidebarOpen: state.sidebarOpen,
          viewMode: state.viewMode
        })
      }
    ),
    { name: 'ui-store' }
  )
);