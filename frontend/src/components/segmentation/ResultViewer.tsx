
// src/components/segmentation/ResultViewer.tsx
import React from 'react';
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
  Grid
} from '@mui/material';
import {
  Download,
  Visibility,
  Speed,
  Memory,
  PhotoSizeSelectActual
} from '@mui/icons-material';
import { useSegmentation } from '../../hooks/useSegmentation';
import { SegmentationResult } from '../../types/segmentation';
import { ALGORITHM_CONFIGS } from '../../utils/constants';

interface ResultCardProps {
  result: SegmentationResult;
  onDownload?: () => void;
  onView?: () => void;
}

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
          sx={{ objectFit: 'contain', backgroundColor: 'grey.100' }}
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
                onClick={onView}
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
                onClick={onDownload}
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

        {result.metrics && (
          <Grid container spacing={1}>
            {result.metrics.memory_usage && (
              <Grid item xs={12}>
                <Box display="flex" alignItems="center" gap={1}>
                  <Memory sx={{ fontSize: 16, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    {result.metrics.memory_usage.toFixed(1)} MB
                  </Typography>
                </Box>
              </Grid>
            )}
          </Grid>
        )}
      </CardContent>
    </Card>
  );
};

export const ResultViewer: React.FC = () => {
  const { results, isProcessing } = useSegmentation();

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

  const handleDownload = (result: SegmentationResult) => {
    const link = document.createElement('a');
    link.href = `${process.env.REACT_APP_API_URL}${result.result_image_url}`;
    link.download = `${result.algorithm_name}_segmentation.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
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
              onView={() => {
                // TODO: Implement modal viewer
                console.log('View result:', result);
              }}
            />
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
};