// src/components/image/ImageGrid.tsx - ENHANCED VERSION
import React, { useState } from 'react';
import { 
  Grid, 
  Paper, 
  Box, 
  Typography, 
  IconButton, 
  Button,
  Card,
  CardContent,
  CardMedia,
  Chip
} from '@mui/material';
import { 
  Close, 
  Add, 
  Compare,
  Fullscreen,
  ZoomIn,
  Download,
  Visibility
} from '@mui/icons-material';
import { ImagePreview } from './ImagePreview';
import { AdvancedSplitView } from '../comparison/AdvancedSplitView';
import { useViewMode } from '../../hooks/useViewMode';
import { useSegmentation } from '../../hooks/useSegmentation';
import { useImageStore } from '../../stores/imageStore';
import { useUIStore } from '../../stores/uiStore';

export const ImageGrid: React.FC = () => {
  const { viewMode, gridConfig, toggleGridSlot } = useViewMode();
  const { results } = useSegmentation();
  const { currentImage } = useImageStore();
  const { addToast } = useUIStore();
  
  const [splitViewOpen, setSplitViewOpen] = useState(false);

  if (!currentImage) {
    return (
      <Paper elevation={1} sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="text.secondary">
          Upload an image to see results here
        </Typography>
      </Paper>
    );
  }

  const handleOpenSplitView = () => {
    if (results.length === 0) {
      addToast({
        type: 'warning',
        message: 'Process some images first to enable comparison view'
      });
      return;
    }
    setSplitViewOpen(true);
  };

  const renderResultCard = (result: any, index: number) => {
    const resultImageUrl = `${process.env.REACT_APP_API_URL}${result.result_image_url}`;
    
    return (
      <Card 
        key={`${result.algorithm_name}-${index}`}
        elevation={2}
        sx={{ 
          position: 'relative',
          height: '100%',
          '&:hover': {
            elevation: 4,
            transform: 'translateY(-2px)',
            transition: 'all 0.2s ease'
          }
        }}
      >
        {/* Algorithm Label */}
        <Box
          sx={{
            position: 'absolute',
            top: 8,
            left: 8,
            zIndex: 10
          }}
        >
          <Chip
            label={result.algorithm_name}
            color="primary"
            size="small"
            sx={{ 
              fontWeight: 600,
              textTransform: 'capitalize'
            }}
          />
        </Box>

        {/* Action Buttons */}
        <Box
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            zIndex: 10,
            display: 'flex',
            gap: 0.5
          }}
        >
          <IconButton
            size="small"
            onClick={() => {
              // Open result in full view
              window.open(resultImageUrl, '_blank');
            }}
            sx={{
              bgcolor: 'rgba(255, 255, 255, 0.9)',
              '&:hover': { bgcolor: 'rgba(255, 255, 255, 1)' }
            }}
          >
            <Fullscreen fontSize="small" />
          </IconButton>
          
          <IconButton
            size="small"
            onClick={() => {
              const link = document.createElement('a');
              link.href = resultImageUrl;
              link.download = `${result.algorithm_name}_result.png`;
              link.click();
            }}
            sx={{
              bgcolor: 'rgba(255, 255, 255, 0.9)',
              '&:hover': { bgcolor: 'rgba(255, 255, 255, 1)' }
            }}
          >
            <Download fontSize="small" />
          </IconButton>
        </Box>

        {/* Image */}
        <CardMedia
          component="img"
          height="300"
          image={resultImageUrl}
          alt={`${result.algorithm_name} result`}
          sx={{ 
            objectFit: 'contain',
            bgcolor: 'grey.100',
            cursor: 'pointer'
          }}
          onClick={() => {
            // Could open in modal or split view with this specific result
            setSplitViewOpen(true);
          }}
        />

        {/* Result Info */}
        <CardContent sx={{ p: 2 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="h6" fontWeight="bold">
              {result.algorithm_name.charAt(0).toUpperCase() + result.algorithm_name.slice(1)}
            </Typography>
            <Chip
              size="small"
              label={`${result.processing_time.toFixed(2)}s`}
              color="info"
              variant="outlined"
            />
          </Box>

          <Typography variant="body2" color="text.secondary" gutterBottom>
            {result.segments_count} segments detected
          </Typography>

          {result.metrics && (
            <Box display="flex" gap={1} mt={1}>
              {result.metrics.memory_usage && (
                <Chip
                  size="small"
                  label={`${result.metrics.memory_usage.toFixed(1)} MB`}
                  variant="outlined"
                />
              )}
            </Box>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderGridSlot = (slotIndex: number) => {
    const isActive = gridConfig.activeSlots[slotIndex];
    const result = results[slotIndex - 1]; // -1 because slot 0 is original

    if (slotIndex === 0) {
      // Original image slot
      return (
        <Card elevation={2} sx={{ height: '100%' }}>
          <Box
            sx={{
              position: 'absolute',
              top: 8,
              left: 8,
              zIndex: 10
            }}
          >
            <Chip
              label="Original"
              color="success"
              size="small"
              sx={{ fontWeight: 600 }}
            />
          </Box>

          <Box
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              zIndex: 10,
              display: 'flex',
              gap: 0.5
            }}
          >
            <IconButton
              size="small"
              onClick={handleOpenSplitView}
              disabled={results.length === 0}
              sx={{
                bgcolor: 'rgba(255, 255, 255, 0.9)',
                '&:hover': { bgcolor: 'rgba(255, 255, 255, 1)' }
              }}
            >
              <Compare fontSize="small" />
            </IconButton>
          </Box>

          <CardMedia
            component="img"
            height="300"
            image={`${process.env.REACT_APP_API_URL}${currentImage.url}`}
            alt="Original image"
            sx={{ 
              objectFit: 'contain',
              bgcolor: 'grey.100'
            }}
          />

          <CardContent sx={{ p: 2 }}>
            <Typography variant="h6" fontWeight="bold">
              Original Image
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {currentImage.dimensions[0]} × {currentImage.dimensions[1]} pixels
            </Typography>
          </CardContent>
        </Card>
      );
    }

    if (!isActive) {
      return (
        <Paper
          elevation={1}
          sx={{
            height: 350,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px dashed',
            borderColor: 'divider',
            cursor: 'pointer',
            '&:hover': {
              borderColor: 'primary.main',
              backgroundColor: 'action.hover'
            }
          }}
          onClick={() => toggleGridSlot(slotIndex)}
        >
          <Add sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
          <Typography color="text.secondary">
            Click to add slot
          </Typography>
        </Paper>
      );
    }

    if (result) {
      return renderResultCard(result, slotIndex);
    }

    return (
      <Paper
        elevation={1}
        sx={{
          height: 350,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative'
        }}
      >
        <IconButton
          size="small"
          sx={{
            position: 'absolute',
            top: 8,
            right: 8
          }}
          onClick={() => toggleGridSlot(slotIndex)}
        >
          <Close />
        </IconButton>
        
        <Typography color="text.secondary">
          Waiting for result...
        </Typography>
      </Paper>
    );
  };

  const getGridLayout = () => {
    switch (viewMode) {
      case 'single':
        return { xs: 12 };
      case 'split':
        return { xs: 12, md: 6 };
      case 'grid_2x2':
        return { xs: 12, sm: 6 };
      default:
        return { xs: 12 };
    }
  };

  const getVisibleSlots = () => {
    switch (viewMode) {
      case 'single':
        return [0];
      case 'split':
        return [0, 1];
      case 'grid_2x2':
        return [0, 1, 2, 3];
      default:
        return [0];
    }
  };

  const gridLayout = getGridLayout();
  const visibleSlots = getVisibleSlots();

  return (
    <>
      {/* Quick Actions Bar */}
      <Box 
        display="flex" 
        justifyContent="space-between" 
        alignItems="center" 
        mb={2}
        sx={{ 
          p: 2, 
          bgcolor: 'background.paper', 
          borderRadius: 1,
          boxShadow: 1
        }}
      >
        <Typography variant="h6">
          Results ({results.length})
        </Typography>
        
        <Box display="flex" gap={1}>
          <Button
            variant="outlined"
            startIcon={<Compare />}
            onClick={handleOpenSplitView}
            disabled={results.length === 0}
            size="small"
          >
            Compare View
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<Visibility />}
            onClick={() => {
              addToast({
                type: 'info',
                message: 'Slideshow view coming soon...'
              });
            }}
            disabled={results.length === 0}
            size="small"
          >
            Slideshow
          </Button>
        </Box>
      </Box>

      {/* Grid */}
      <Grid container spacing={2}>
        {visibleSlots.map((slotIndex) => (
          <Grid item {...gridLayout} key={slotIndex}>
            {renderGridSlot(slotIndex)}
          </Grid>
        ))}
      </Grid>

      {/* Advanced Split View Modal */}
      <AdvancedSplitView
        open={splitViewOpen}
        onClose={() => setSplitViewOpen(false)}
      />
    </>
  );
};