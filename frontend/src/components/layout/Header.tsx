// src/components/layout/Header.tsx
import React from 'react';
import {
  Box,
  Typography,
  Button,
  Chip,
  CircularProgress,
  LinearProgress
} from '@mui/material';
import {
  PlayArrow,
  Stop,
  Refresh,
  GetApp
} from '@mui/icons-material';
import { useSegmentation } from '../../hooks/useSegmentation';
import { useImageStore } from '../../stores/imageStore';
import { useUIStore } from '../../stores/uiStore';

export const Header: React.FC = () => {
  const {
    activeAlgorithms,
    results,
    isProcessing,
    processSegmentation,
    clearResults
  } = useSegmentation();

  const { currentImage } = useImageStore();
  const { addToast } = useUIStore();

  const canProcess = currentImage && activeAlgorithms.length > 0 && !isProcessing;

  const handleStartProcessing = async () => {
    if (!canProcess) return;
    
    try {
      await processSegmentation();
    } catch (error) {
      addToast({
        type: 'error',
        message: 'Failed to start segmentation'
      });
    }
  };

  const handleClearResults = () => {
    clearResults();
    addToast({
      type: 'info',
      message: 'Results cleared'
    });
  };

  const handleExportResults = () => {
    if (results.length === 0) {
      addToast({
        type: 'warning',
        message: 'No results to export'
      });
      return;
    }

    // Create export data
    const exportData = {
      timestamp: new Date().toISOString(),
      image: {
        id: currentImage?.id,
        filename: currentImage?.original_filename,
        dimensions: currentImage?.dimensions
      },
      algorithms: activeAlgorithms.map(alg => ({
        name: alg.name,
        parameters: alg.parameters
      })),
      results: results.map(result => ({
        algorithm: result.algorithm_name,
        segments_count: result.segments_count,
        processing_time: result.processing_time,
        result_url: result.result_image_url
      }))
    };

    // Download as JSON
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `segmentation_results_${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    addToast({
      type: 'success',
      message: 'Results exported successfully'
    });
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        mb: 3,
        p: 3,
        bgcolor: 'background.paper',
        borderRadius: 2,
        boxShadow: 1
      }}
    >
      <Box>
        <Typography variant="h4" component="h1" gutterBottom>
          Image Segmentation
        </Typography>
        <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
          {currentImage && (
            <Chip 
              label={`Image: ${currentImage.original_filename}`} 
              color="success" 
              variant="outlined" 
            />
          )}
          {activeAlgorithms.length > 0 && (
            <Chip 
              label={`${activeAlgorithms.length} algorithm${activeAlgorithms.length !== 1 ? 's' : ''} selected`}
              color="primary" 
              variant="outlined" 
            />
          )}
          {results.length > 0 && (
            <Chip 
              label={`${results.length} result${results.length !== 1 ? 's' : ''}`}
              color="secondary" 
              variant="outlined" 
            />
          )}
        </Box>
      </Box>

      <Box display="flex" alignItems="center" gap={2}>
        <Button
          variant="contained"
          size="large"
          startIcon={isProcessing ? <CircularProgress size={20} color="inherit" /> : <PlayArrow />}
          onClick={handleStartProcessing}
          disabled={!canProcess}
          color="primary"
        >
          {isProcessing ? 'Processing...' : 'Start Segmentation'}
        </Button>

        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={handleClearResults}
          disabled={results.length === 0 || isProcessing}
        >
          Clear Results
        </Button>

        <Button
          variant="outlined"
          startIcon={<GetApp />}
          onClick={handleExportResults}
          disabled={results.length === 0}
        >
          Export Results
        </Button>
      </Box>
    </Box>
  );
};