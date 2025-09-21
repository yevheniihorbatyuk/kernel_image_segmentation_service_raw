
// src/components/image/ImageGrid.tsx
import React from 'react';
import { Grid, Paper, Box, Typography, IconButton } from '@mui/material';
import { Close, Add } from '@mui/icons-material';
import { ImagePreview } from './ImagePreview';
import { useViewMode } from '../../hooks/useViewMode';
import { useSegmentation } from '../../hooks/useSegmentation';
import { useImageStore } from '../../stores/imageStore';

export const ImageGrid: React.FC = () => {
  const { viewMode, gridConfig, toggleGridSlot } = useViewMode();
  const { results } = useSegmentation();
  const { currentImage } = useImageStore();

  if (!currentImage) {
    return (
      <Paper elevation={1} sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="text.secondary">
          Upload an image to see results here
        </Typography>
      </Paper>
    );
  }

  const renderGridSlot = (slotIndex: number) => {
    const isActive = gridConfig.activeSlots[slotIndex];
    const result = results[slotIndex - 1]; // -1 because slot 0 is original

    if (slotIndex === 0) {
      // Always show original image in first slot
      return (
        <ImagePreview
          image={currentImage}
          title="Original"
          showControls={false}
          maxHeight={300}
        />
      );
    }

    if (!isActive) {
      return (
        <Paper
          elevation={1}
          sx={{
            height: 300,
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
      const resultImageUrl = `${process.env.REACT_APP_API_URL}${result.result_image_url}`;
      return (
        <Paper elevation={1} sx={{ position: 'relative' }}>
          <IconButton
            size="small"
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              zIndex: 10,
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.9)'
              }
            }}
            onClick={() => toggleGridSlot(slotIndex)}
          >
            <Close />
          </IconButton>
          
          <Box p={2} pb={1}>
            <Typography variant="subtitle2" fontWeight="medium">
              {result.algorithm_name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {result.segments_count} segments • {result.processing_time.toFixed(2)}s
            </Typography>
          </Box>
          
          <Box
            component="img"
            src={resultImageUrl}
            alt={`${result.algorithm_name} result`}
            sx={{
              width: '100%',
              height: 250,
              objectFit: 'contain',
              borderRadius: 1
            }}
          />
        </Paper>
      );
    }

    return (
      <Paper
        elevation={1}
        sx={{
          height: 300,
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
    <Grid container spacing={2}>
      {visibleSlots.map((slotIndex) => (
        <Grid item {...gridLayout} key={slotIndex}>
          {renderGridSlot(slotIndex)}
        </Grid>
      ))}
    </Grid>
  );
};