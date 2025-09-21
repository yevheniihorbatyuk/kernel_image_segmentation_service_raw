// src/App.tsx
import React, { useEffect } from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { MainLayout } from './components/layout/MainLayout';
import { Header } from './components/layout/Header';
import { ImageGrid } from './components/image/ImageGrid';
import { ResultViewer } from './components/segmentation/ResultViewer';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { LoadingSpinner } from './components/common/LoadingSpinner';
import { useSegmentation } from './hooks/useSegmentation';
import { useWebSocket } from './hooks/useWebSocket';
import { useUIStore } from './stores/uiStore';
import { createAppTheme } from './styles/themes';

const AppContent: React.FC = () => {
  const { viewMode } = useUIStore();
  const { isLoadingAlgorithms } = useSegmentation();
  const { isConnected } = useWebSocket();

  if (isLoadingAlgorithms) {
    return (
      <LoadingSpinner
        message="Loading segmentation algorithms..."
        variant="circular"
        size={60}
      />
    );
  }

  return (
    <>
      <Header />
      
      {viewMode === 'single' && (
        <>
          <ImageGrid />
          <ResultViewer />
        </>
      )}
      
      {(viewMode === 'split' || viewMode === 'grid_2x2') && (
        <ImageGrid />
      )}
    </>
  );
};

const App: React.FC = () => {
  const { darkMode } = useUIStore();
  const theme = createAppTheme(darkMode);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ErrorBoundary>
        <MainLayout>
          <AppContent />
        </MainLayout>
      </ErrorBoundary>
    </ThemeProvider>
  );
};

export default App;