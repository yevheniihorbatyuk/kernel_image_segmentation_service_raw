// src/components/layout/Header.tsx
import React from 'react';
import {
  Box,
  Typography,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  Menu,
  MenuItem,
  Divider
} from '@mui/material';
import {
  PlayArrow,
  Refresh,
  GetApp,
  History,
  PhotoSizeSelectActual,
  Save,
  MoreVert
} from '@mui/icons-material';
import { useSegmentation } from '../../hooks/useSegmentation';
import { useImageStore } from '../../stores/imageStore';
import { useUIStore } from '../../stores/uiStore';
import { ImageHistory } from '../history/ImageHistory';
import { ResultHistory } from '../history/ResultHistory';
import { SessionManager } from '../history/SessionManager';

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

  // Dialog states
  const [imageHistoryOpen, setImageHistoryOpen] = React.useState(false);
  const [resultHistoryOpen, setResultHistoryOpen] = React.useState(false);
  const [sessionManagerOpen, setSessionManagerOpen] = React.useState(false);
  
  // Menu state
  const [menuAnchor, setMenuAnchor] = React.useState<null | HTMLElement>(null);

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

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  return (
    <>
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
          {/* Main action buttons */}
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

          {/* Quick access buttons */}
          <Button
            variant="outlined"
            startIcon={<History />}
            onClick={() => setImageHistoryOpen(true)}
            sx={{ display: { xs: 'none', md: 'flex' } }}
          >
            Images
          </Button>

          <Button
            variant="outlined"
            startIcon={<PhotoSizeSelectActual />}
            onClick={() => setResultHistoryOpen(true)}
            sx={{ display: { xs: 'none', md: 'flex' } }}
          >
            Results
          </Button>

          <Button
            variant="outlined"
            startIcon={<Save />}
            onClick={() => setSessionManagerOpen(true)}
            sx={{ display: { xs: 'none', lg: 'flex' } }}
          >
            Sessions
          </Button>

          <Button
            variant="outlined"
            startIcon={<GetApp />}
            onClick={handleExportResults}
            disabled={results.length === 0}
            sx={{ display: { xs: 'none', lg: 'flex' } }}
          >
            Export
          </Button>

          {/* More menu for mobile/smaller screens */}
          <IconButton
            onClick={(e) => setMenuAnchor(e.currentTarget)}
            sx={{ display: { lg: 'none' } }}
          >
            <MoreVert />
          </IconButton>

          <Menu
            anchorEl={menuAnchor}
            open={Boolean(menuAnchor)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={() => { setImageHistoryOpen(true); handleMenuClose(); }}>
              <History sx={{ mr: 1 }} />
              Image History
            </MenuItem>
            <MenuItem onClick={() => { setResultHistoryOpen(true); handleMenuClose(); }}>
              <PhotoSizeSelectActual sx={{ mr: 1 }} />
              Result History
            </MenuItem>
            <MenuItem onClick={() => { setSessionManagerOpen(true); handleMenuClose(); }}>
              <Save sx={{ mr: 1 }} />
              Session Manager
            </MenuItem>
            <Divider />
            <MenuItem 
              onClick={() => { handleExportResults(); handleMenuClose(); }}
              disabled={results.length === 0}
            >
              <GetApp sx={{ mr: 1 }} />
              Export Results
            </MenuItem>
          </Menu>
        </Box>
      </Box>

      {/* History Dialogs */}
      <ImageHistory 
        open={imageHistoryOpen} 
        onClose={() => setImageHistoryOpen(false)} 
      />
      
      <ResultHistory 
        open={resultHistoryOpen} 
        onClose={() => setResultHistoryOpen(false)} 
      />
      
      <SessionManager 
        open={sessionManagerOpen} 
        onClose={() => setSessionManagerOpen(false)} 
      />
    </>
  );
};