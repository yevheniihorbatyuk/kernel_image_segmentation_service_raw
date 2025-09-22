// src/components/comparison/AdvancedSplitView.tsx
import React, { useState, useRef, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Tooltip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Slider,
  Button,
  Divider,
  Chip,
  ToggleButton,
  ToggleButtonGroup,
  Card,
  CardContent,
  Fade,
  Zoom
} from '@mui/material';
import {
  ZoomIn,
  ZoomOut,
  ZoomOutMap,
  Fullscreen,
  FullscreenExit,
  SwapHoriz,
  Visibility,
  VisibilityOff,
  Compare,
  GridView,
  ViewColumn,
  Sync,
  Download,
  Settings,
  Close
} from '@mui/icons-material';
import { useImageStore } from '../../stores/imageStore';
import { useSegmentationStore } from '../../stores/segmentationStore';
import { useUIStore } from '../../stores/uiStore';

interface AdvancedSplitViewProps {
  open: boolean;
  onClose: () => void;
}

export const AdvancedSplitView: React.FC<AdvancedSplitViewProps> = ({ open, onClose }) => {
  const { currentImage } = useImageStore();
  const { results } = useSegmentationStore();
  const { addToast } = useUIStore();

  // State for split view configuration
  const [leftImage, setLeftImage] = useState<'original' | string>('original');
  const [rightImage, setRightImage] = useState<string>(results[0]?.algorithm_name || '');
  const [zoom, setZoom] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [dividerPosition, setDividerPosition] = useState(50);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [syncZoom, setSyncZoom] = useState(true);
  const [showOverlay, setShowOverlay] = useState(false);
  const [overlayOpacity, setOverlayOpacity] = useState(0.5);
  const [comparisonMode, setComparisonMode] = useState<'split' | 'overlay' | 'swipe'>('split');

  const containerRef = useRef<HTMLDivElement>(null);
  const leftImageRef = useRef<HTMLImageElement>(null);
  const rightImageRef = useRef<HTMLImageElement>(null);

  // Image URLs
  const leftImageUrl = leftImage === 'original' 
    ? (currentImage ? `${process.env.REACT_APP_API_URL}${currentImage.url}` : '')
    : results.find(r => r.algorithm_name === leftImage)?.result_image_url 
      ? `${process.env.REACT_APP_API_URL}${results.find(r => r.algorithm_name === leftImage)?.result_image_url}`
      : '';

  const rightImageUrl = results.find(r => r.algorithm_name === rightImage)?.result_image_url 
    ? `${process.env.REACT_APP_API_URL}${results.find(r => r.algorithm_name === rightImage)?.result_image_url}`
    : '';

  // Zoom controls
  const handleZoomIn = useCallback(() => {
    setZoom(prev => Math.min(prev * 1.2, 5));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom(prev => Math.max(prev / 1.2, 0.1));
  }, []);

  const handleResetZoom = useCallback(() => {
    setZoom(1);
    setPanX(0);
    setPanY(0);
  }, []);

  // Pan controls
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only left mouse button
    
    const startX = e.clientX - panX;
    const startY = e.clientY - panY;

    const handleMouseMove = (e: MouseEvent) => {
      setPanX(e.clientX - startX);
      setPanY(e.clientY - startY);
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [panX, panY]);

  // Swap images
  const handleSwapImages = useCallback(() => {
    const temp = leftImage;
    setLeftImage(rightImage);
    setRightImage(temp);
  }, [leftImage, rightImage]);

  // Download comparison
  const handleDownloadComparison = useCallback(() => {
    // Implementation for downloading the current comparison view
    addToast({
      type: 'info',
      message: 'Comparison download feature coming soon...'
    });
  }, [addToast]);

  // Available images for selection
  const availableImages = [
    { value: 'original', label: 'Original Image' },
    ...results.map(result => ({
      value: result.algorithm_name,
      label: `${result.algorithm_name} (${result.segments_count} segments)`
    }))
  ];

  if (!open) return null;

  return (
    <Fade in={open}>
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          bgcolor: 'rgba(0, 0, 0, 0.9)',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Control Bar */}
        <Paper
          elevation={4}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 2,
            bgcolor: 'background.paper',
            borderRadius: 0
          }}
        >
          {/* Left Controls */}
          <Box display="flex" alignItems="center" gap={2}>
            <Typography variant="h6">Image Comparison</Typography>
            
            <Divider orientation="vertical" flexItem />
            
            {/* Image Selectors */}
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Left Image</InputLabel>
              <Select
                value={leftImage}
                onChange={(e) => setLeftImage(e.target.value)}
                label="Left Image"
              >
                {availableImages.map(img => (
                  <MenuItem key={img.value} value={img.value}>
                    {img.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <IconButton onClick={handleSwapImages} color="primary">
              <SwapHoriz />
            </IconButton>

            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Right Image</InputLabel>
              <Select
                value={rightImage}
                onChange={(e) => setRightImage(e.target.value)}
                label="Right Image"
              >
                {results.map(result => (
                  <MenuItem key={result.algorithm_name} value={result.algorithm_name}>
                    {result.algorithm_name} ({result.segments_count} segments)
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Center Controls */}
          <Box display="flex" alignItems="center" gap={1}>
            <ToggleButtonGroup
              value={comparisonMode}
              exclusive
              onChange={(_, value) => value && setComparisonMode(value)}
              size="small"
            >
              <ToggleButton value="split">
                <ViewColumn />
              </ToggleButton>
              <ToggleButton value="overlay">
                <Compare />
              </ToggleButton>
              <ToggleButton value="swipe">
                <SwapHoriz />
              </ToggleButton>
            </ToggleButtonGroup>

            <Divider orientation="vertical" flexItem />

            {/* Zoom Controls */}
            <Tooltip title="Zoom Out">
              <IconButton onClick={handleZoomOut}>
                <ZoomOut />
              </IconButton>
            </Tooltip>

            <Chip 
              label={`${Math.round(zoom * 100)}%`} 
              variant="outlined" 
              size="small"
              onClick={handleResetZoom}
              sx={{ cursor: 'pointer', minWidth: 60 }}
            />

            <Tooltip title="Zoom In">
              <IconButton onClick={handleZoomIn}>
                <ZoomIn />
              </IconButton>
            </Tooltip>

            <Tooltip title="Reset View">
              <IconButton onClick={handleResetZoom}>
                <ZoomOutMap />
              </IconButton>
            </Tooltip>
          </Box>

          {/* Right Controls */}
          <Box display="flex" alignItems="center" gap={1}>
            <Button
              startIcon={<Download />}
              onClick={handleDownloadComparison}
              variant="outlined"
              size="small"
            >
              Download
            </Button>

            <Tooltip title="Toggle Fullscreen">
              <IconButton onClick={() => setIsFullscreen(!isFullscreen)}>
                {isFullscreen ? <FullscreenExit /> : <Fullscreen />}
              </IconButton>
            </Tooltip>

            <Tooltip title="Close">
              <IconButton onClick={onClose}>
                <Close />
              </IconButton>
            </Tooltip>
          </Box>
        </Paper>

        {/* Main Comparison Area */}
        <Box
          ref={containerRef}
          sx={{
            flex: 1,
            position: 'relative',
            overflow: 'hidden',
            cursor: zoom > 1 ? 'grab' : 'default',
            '&:active': {
              cursor: zoom > 1 ? 'grabbing' : 'default'
            }
          }}
          onMouseDown={handleMouseDown}
        >
          {comparisonMode === 'split' && (
            <Box
              sx={{
                display: 'flex',
                height: '100%',
                position: 'relative'
              }}
            >
              {/* Left Image */}
              <Box
                sx={{
                  width: `${dividerPosition}%`,
                  position: 'relative',
                  overflow: 'hidden',
                  bgcolor: 'grey.900'
                }}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    top: 8,
                    left: 8,
                    zIndex: 10
                  }}
                >
                  <Chip
                    label={leftImage === 'original' ? 'Original' : leftImage}
                    color="primary"
                    size="small"
                  />
                </Box>

                {leftImageUrl && (
                  <img
                    ref={leftImageRef}
                    src={leftImageUrl}
                    alt="Left comparison"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      transform: `scale(${zoom}) translate(${panX / zoom}px, ${panY / zoom}px)`,
                      transition: 'transform 0.1s ease-out'
                    }}
                  />
                )}
              </Box>

              {/* Divider */}
              <Box
                sx={{
                  width: 4,
                  bgcolor: 'primary.main',
                  cursor: 'col-resize',
                  position: 'relative',
                  '&:hover': {
                    bgcolor: 'primary.light'
                  }
                }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  const startX = e.clientX;
                  const startPosition = dividerPosition;

                  const handleMouseMove = (e: MouseEvent) => {
                    const container = containerRef.current;
                    if (!container) return;

                    const rect = container.getBoundingClientRect();
                    const newPosition = ((e.clientX - rect.left) / rect.width) * 100;
                    setDividerPosition(Math.max(10, Math.min(90, newPosition)));
                  };

                  const handleMouseUp = () => {
                    document.removeEventListener('mousemove', handleMouseMove);
                    document.removeEventListener('mouseup', handleMouseUp);
                  };

                  document.addEventListener('mousemove', handleMouseMove);
                  document.addEventListener('mouseup', handleMouseUp);
                }}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    bgcolor: 'primary.main',
                    borderRadius: '50%',
                    width: 24,
                    height: 24,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white'
                  }}
                >
                  <SwapHoriz fontSize="small" />
                </Box>
              </Box>

              {/* Right Image */}
              <Box
                sx={{
                  width: `${100 - dividerPosition}%`,
                  position: 'relative',
                  overflow: 'hidden',
                  bgcolor: 'grey.900'
                }}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    zIndex: 10
                  }}
                >
                  <Chip
                    label={rightImage}
                    color="secondary"
                    size="small"
                  />
                </Box>

                {rightImageUrl && (
                  <img
                    ref={rightImageRef}
                    src={rightImageUrl}
                    alt="Right comparison"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      transform: `scale(${zoom}) translate(${panX / zoom}px, ${panY / zoom}px)`,
                      transition: 'transform 0.1s ease-out'
                    }}
                  />
                )}
              </Box>
            </Box>
          )}

          {comparisonMode === 'overlay' && (
            <Box
              sx={{
                position: 'relative',
                width: '100%',
                height: '100%',
                bgcolor: 'grey.900'
              }}
            >
              {/* Base Image */}
              {leftImageUrl && (
                <img
                  src={leftImageUrl}
                  alt="Base comparison"
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    transform: `scale(${zoom}) translate(${panX / zoom}px, ${panY / zoom}px)`
                  }}
                />
              )}

              {/* Overlay Image */}
              {rightImageUrl && (
                <img
                  src={rightImageUrl}
                  alt="Overlay comparison"
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    opacity: overlayOpacity,
                    transform: `scale(${zoom}) translate(${panX / zoom}px, ${panY / zoom}px)`
                  }}
                />
              )}

              {/* Overlay Controls */}
              <Card
                sx={{
                  position: 'absolute',
                  top: 16,
                  right: 16,
                  p: 2,
                  minWidth: 200
                }}
              >
                <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
                  <Typography variant="body2" gutterBottom>
                    Overlay Opacity
                  </Typography>
                  <Slider
                    value={overlayOpacity}
                    onChange={(_, value) => setOverlayOpacity(value as number)}
                    min={0}
                    max={1}
                    step={0.1}
                    size="small"
                  />
                </CardContent>
              </Card>
            </Box>
          )}
        </Box>

        {/* Status Bar */}
        <Paper
          elevation={4}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 2,
            py: 1,
            bgcolor: 'background.paper',
            borderRadius: 0
          }}
        >
          <Typography variant="caption" color="text.secondary">
            Use mouse wheel to zoom, drag to pan
          </Typography>

          <Box display="flex" alignItems="center" gap={2}>
            <Typography variant="caption" color="text.secondary">
              Position: {Math.round(panX)}, {Math.round(panY)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Zoom: {Math.round(zoom * 100)}%
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Fade>
  );
};