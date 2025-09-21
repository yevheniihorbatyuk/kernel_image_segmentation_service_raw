// src/components/segmentation/ResultViewer.tsx
import React, { useState } from 'react';
import {
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  CardMedia,
  Chip,
  IconButton,
  Tooltip,
  Grid,
  Modal,
  Backdrop,
  Fade,
  Button
} from '@mui/material';
import {
  Download,
  Visibility,
  Speed,
  Memory,
  PhotoSizeSelectActual,
  Close,
  ZoomIn,
  ZoomOut
} from '@mui/icons-material';
import { useSegmentation } from '../../hooks/useSegmentation';
import { SegmentationResult } from '../../types/segmentation';
import { ALGORITHM_CONFIGS } from '../../utils/constants';

interface ResultCardProps {
  result: SegmentationResult;
  onDownload?: () => void;
  onView?: () => void;
}

interface ImageModalProps {
  open: boolean;
  onClose: () => void;
  result: SegmentationResult;
}

const ImageModal: React.FC<ImageModalProps> = ({ open, onClose, result }) => {
  const [zoom, setZoom] = useState(1);
  const imageUrl = `${process.env.REACT_APP_API_URL}${result.result_image_url}`;

  const handleZoomIn = () => setZoom(prev => Math.min(prev * 1.5, 5));
  const handleZoomOut = () => setZoom(prev => Math.max(prev / 1.5, 0.5));
  const handleReset = () => setZoom(1);

  return (
    <Modal
      open={open}
      onClose={onClose}
      closeAfterTransition
      BackdropComponent={Backdrop}
      BackdropProps={{
        timeout: 500,
        sx: { backgroundColor: 'rgba(0, 0, 0, 0.9)' }
      }}
    >
      <Fade in={open}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            maxWidth: '90vw',
            maxHeight: '90vh',
            bgcolor: 'background.paper',
            border: '2px solid',
            borderColor: 'divider',
            borderRadius: 2,
            boxShadow: 24,
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
        >
          {/* Header */}
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">
              {result.algorithm_name.charAt(0).toUpperCase() + result.algorithm_name.slice(1)} Result
            </Typography>
            <Box display="flex" gap={1}>
              <Tooltip title="Zoom Out">
                <IconButton size="small" onClick={handleZoomOut}>
                  <ZoomOut />
                </IconButton>
              </Tooltip>
              <Tooltip title="Reset Zoom">
                <Button size="small" onClick={handleReset} variant="outlined">
                  {Math.round(zoom * 100)}%
                </Button>
              </Tooltip>
              <Tooltip title="Zoom In">
                <IconButton size="small" onClick={handleZoomIn}>
                  <ZoomIn />
                </IconButton>
              </Tooltip>
              <Tooltip title="Close">
                <IconButton size="small" onClick={onClose}>
                  <Close />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {/* Image Container */}
          <Box
            sx={{
              flex: 1,
              overflow: 'auto',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: 300
            }}
          >
            <Box
              component="img"
              src={imageUrl}
              alt={`${result.algorithm_name} segmentation result`}
              sx={{
                maxWidth: '100%',
                maxHeight: '100%',
                transform: `scale(${zoom})`,
                transition: 'transform 0.2s ease',
                cursor: zoom > 1 ? 'grab' : 'zoom-in'
              }}
              onClick={() => zoom === 1 && handleZoomIn()}
            />
          </Box>

          {/* Info */}
          <Box mt={2} display="flex" justifyContent="space-between" alignItems="center">
            <Box display="flex" gap={2}>
              <Chip
                size="small"
                icon={<PhotoSizeSelectActual />}
                label={`${result.segments_count} segments`}
                variant="outlined"
              />
              <Chip
                size="small"
                icon={<Speed />}
                label={`${result.processing_time.toFixed(2)}s`}
                variant="outlined"
              />
            </Box>
          </Box>
        </Box>
      </Fade>
    </Modal>
  );
};

const ResultCard: React.FC<ResultCardProps> = ({ result, onDownload, onView }) => {
  const config = ALGORITHM_CONFIGS[result.algorithm_name];
  const imageUrl = `${process.env.REACT_APP_API_URL}${result.result_image_url}`;

  return (
    <Card elevation={1}>
      <Box position="relative">
        <CardMedia
          component="img"
          height="200"
          image={imageUrl}
          alt={`${result.algorithm_name} segmentation result`}
          sx={{ 
            objectFit: 'contain', 
            backgroundColor: 'grey.100',
            cursor: 'pointer'
          }}
          onClick={onView}
        />
        
        <Box
          position="absolute"
          top={8}
          right={8}
          display="flex"
          gap={1}
        >
          {onView && (
            <Tooltip title="View larger">
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onView();
                }}
                sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.9)' }
                }}
              >
                <Visibility />
              </IconButton>
            </Tooltip>
          )}
          {onDownload && (
            <Tooltip title="Download result">
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onDownload();
                }}
                sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.9)' }
                }}
              >
                <Download />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Box>

      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="h6" component="div">
            {result.algorithm_name.charAt(0).toUpperCase() + result.algorithm_name.slice(1)}
          </Typography>
          {config && (
            <Chip
              size="small"
              sx={{
                backgroundColor: config.color + '20',
                color: config.color,
                border: `1px solid ${config.color}40`
              }}
              label={config.displayName}
            />
          )}
        </Box>

        <Grid container spacing={1} mb={2}>
          <Grid item xs={6}>
            <Box display="flex" alignItems="center" gap={1}>
              <PhotoSizeSelectActual sx={{ fontSize: 16, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                {result.segments_count} segments
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box display="flex" alignItems="center" gap={1}>
              <Speed sx={{ fontSize: 16, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                {result.processing_time.toFixed(2)}s
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {result.metrics && result.metrics.memory_usage && (
          <Grid container spacing={1}>
            <Grid item xs={12}>
              <Box display="flex" alignItems="center" gap={1}>
                <Memory sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  {result.metrics.memory_usage.toFixed(1)} MB
                </Typography>
              </Box>
            </Grid>
          </Grid>
        )}
      </CardContent>
    </Card>
  );
};

export const ResultViewer: React.FC = () => {
  const { results, isProcessing } = useSegmentation();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedResult, setSelectedResult] = useState<SegmentationResult | null>(null);

  if (isProcessing && results.length === 0) {
    return (
      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="h6" mb={2}>
          Processing...
        </Typography>
        <Box textAlign="center" py={4}>
          <Typography color="text.secondary">
            Segmentation in progress. Results will appear here.
          </Typography>
        </Box>
      </Paper>
    );
  }

  if (results.length === 0) {
    return (
      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="h6" mb={2}>
          Segmentation Results
        </Typography>
        <Box textAlign="center" py={4}>
          <PhotoSizeSelectActual sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
          <Typography color="text.secondary">
            No results yet. Upload an image and select algorithms to get started.
          </Typography>
        </Box>
      </Paper>
    );
  }

  const handleDownload = async (result: SegmentationResult) => {
    try {
      const imageUrl = `${process.env.REACT_APP_API_URL}${result.result_image_url}`;
      
      // Fetch the image
      const response = await fetch(imageUrl);
      if (!response.ok) throw new Error('Failed to fetch image');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      // Create download link
      const link = document.createElement('a');
      link.style.display = 'none';
      link.href = url;
      link.download = `${result.algorithm_name}_segmentation_${Date.now()}.png`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Download failed:', error);
      // Fallback: open in new tab
      const imageUrl = `${process.env.REACT_APP_API_URL}${result.result_image_url}`;
      window.open(imageUrl, '_blank');
    }
  };

  const handleView = (result: SegmentationResult) => {
    setSelectedResult(result);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedResult(null);
  };

  return (
    <>
      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="h6" mb={3}>
          Segmentation Results ({results.length})
        </Typography>

        <Grid container spacing={3}>
          {results.map((result, index) => (
            <Grid item xs={12} sm={6} lg={4} key={`${result.algorithm_name}-${index}`}>
              <ResultCard
                result={result}
                onDownload={() => handleDownload(result)}
                onView={() => handleView(result)}
              />
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Modal for viewing images */}
      {selectedResult && (
        <ImageModal
          open={modalOpen}
          onClose={handleCloseModal}
          result={selectedResult}
        />
      )}
    </>
  );
};