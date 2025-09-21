// src/components/image/ImagePreview.tsx
import React from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Tooltip,
  Zoom
} from '@mui/material';
import {
  ZoomIn,
  ZoomOut,
  Fullscreen,
  FullscreenExit
} from '@mui/icons-material';
import { ImageInfo } from '../../types/api';

interface ImagePreviewProps {
  image: ImageInfo;
  title?: string;
  showControls?: boolean;
  maxHeight?: number;
  onClick?: () => void;
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({
  image,
  title = 'Image',
  showControls = true,
  maxHeight = 400,
  onClick
}) => {
  const [zoom, setZoom] = React.useState(1);
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev * 1.2, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev / 1.2, 0.5));
  };

  const handleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const imageUrl = `${process.env.REACT_APP_API_URL}${image.url}`;

  return (
    <Paper 
      elevation={1} 
      sx={{ 
        position: 'relative',
        overflow: 'hidden',
        ...(isFullscreen && {
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 9999,
          backgroundColor: 'rgba(0, 0, 0, 0.9)'
        })
      }}
    >
      {showControls && (
        <Box
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            zIndex: 10,
            display: 'flex',
            gap: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            borderRadius: 1,
            p: 0.5
          }}
        >
          <Tooltip title="Zoom in">
            <IconButton size="small" onClick={handleZoomIn} sx={{ color: 'white' }}>
              <ZoomIn />
            </IconButton>
          </Tooltip>
          <Tooltip title="Zoom out">
            <IconButton size="small" onClick={handleZoomOut} sx={{ color: 'white' }}>
              <ZoomOut />
            </IconButton>
          </Tooltip>
          <Tooltip title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}>
            <IconButton size="small" onClick={handleFullscreen} sx={{ color: 'white' }}>
              {isFullscreen ? <FullscreenExit /> : <Fullscreen />}
            </IconButton>
          </Tooltip>
        </Box>
      )}

      {title && !isFullscreen && (
        <Box p={2} pb={0}>
          <Typography variant="subtitle1" fontWeight="medium">
            {title}
          </Typography>
        </Box>
      )}

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          overflow: 'auto',
          maxHeight: isFullscreen ? '100vh' : maxHeight,
          p: isFullscreen ? 4 : 2
        }}
      >
        <Box
          component="img"
          src={imageUrl}
          alt={image.original_filename}
          onClick={onClick}
          sx={{
            maxWidth: '100%',
            height: 'auto',
            transform: `scale(${zoom})`,
            transition: 'transform 0.2s ease',
            cursor: onClick ? 'pointer' : 'default',
            borderRadius: 1
          }}
        />
      </Box>

      {!isFullscreen && (
        <Box p={2} pt={1}>
          <Typography variant="caption" color="text.secondary" display="block">
            {image.dimensions[0]} × {image.dimensions[1]} pixels
          </Typography>
        </Box>
      )}
    </Paper>
  );
};
