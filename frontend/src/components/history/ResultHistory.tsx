// src/components/history/ResultHistory.tsx
import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Typography,
  Box,
  IconButton,
  Tooltip,
  Chip,
  Divider
} from '@mui/material';
import {
  Close,
  PhotoSizeSelectActual,
  Delete,
  Download,
  Speed
} from '@mui/icons-material';
import { useSegmentationStore } from '../../stores/segmentationStore';
import { ALGORITHM_CONFIGS } from '../../utils/constants';
import { SegmentationResult } from '../../types/segmentation';

interface ResultHistoryProps {
  open: boolean;
  onClose: () => void;
}

export const ResultHistory: React.FC<ResultHistoryProps> = ({ open, onClose }) => {
  const { resultHistory, clearResultHistory } = useSegmentationStore();

  const handleDownload = async (result: SegmentationResult) => {
    try {
      const imageUrl = `${process.env.REACT_APP_API_URL}${result.result_image_url}`;
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${result.algorithm_name}_${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const groupedResults = resultHistory.reduce((groups, result) => {
    const date = new Date(result.created_at).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(result);
    return groups;
  }, {} as Record<string, SegmentationResult[]>);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box display="flex" alignItems="center" gap={1}>
          <PhotoSizeSelectActual />
          <Typography variant="h6">Result History</Typography>
        </Box>
        <Box>
          {resultHistory.length > 0 && (
            <Tooltip title="Clear all history">
              <IconButton onClick={clearResultHistory} color="error">
                <Delete />
              </IconButton>
            </Tooltip>
          )}
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        {resultHistory.length === 0 ? (
          <Box textAlign="center" py={4}>
            <PhotoSizeSelectActual sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography color="text.secondary">
              No results in history. Process some images to see results here.
            </Typography>
          </Box>
        ) : (
          <Box>
            {Object.entries(groupedResults).map(([date, results]) => (
              <Box key={date} mb={2}>
                <Typography variant="subtitle2" color="text.secondary" mb={1}>
                  {date}
                </Typography>
                <List dense>
                  {results.map((result, index) => {
                    const config = ALGORITHM_CONFIGS[result.algorithm_name];
                    return (
                      <React.Fragment key={`${result.algorithm_name}-${result.created_at}-${index}`}>
                        <ListItem
                          sx={{
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 1,
                            mb: 1
                          }}
                        >
                          <ListItemAvatar>
                            <Avatar 
                              sx={{ 
                                bgcolor: config?.color || 'primary.main',
                                width: 32,
                                height: 32
                              }}
                            >
                              <PhotoSizeSelectActual fontSize="small" />
                            </Avatar>
                          </ListItemAvatar>
                          
                          <ListItemText
                            primary={
                              <Box display="flex" alignItems="center" gap={1}>
                                <Typography variant="body2" fontWeight="medium">
                                  {result.algorithm_name}
                                </Typography>
                                {config && (
                                  <Chip
                                    size="small"
                                    label={config.displayName}
                                    sx={{
                                      height: 20,
                                      backgroundColor: config.color + '20',
                                      color: config.color,
                                      border: `1px solid ${config.color}40`
                                    }}
                                  />
                                )}
                              </Box>
                            }
                            secondary={
                              <Box display="flex" alignItems="center" gap={2} mt={0.5}>
                                <Typography variant="caption" color="text.secondary">
                                  {result.segments_count} segments
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {result.processing_time.toFixed(1)}s
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {new Date(result.created_at).toLocaleTimeString()}
                                </Typography>
                              </Box>
                            }
                          />
                          
                          <Tooltip title="Download result">
                            <IconButton 
                              size="small"
                              onClick={() => handleDownload(result)}
                            >
                              <Download />
                            </IconButton>
                          </Tooltip>
                        </ListItem>
                      </React.Fragment>
                    );
                  })}
                </List>
              </Box>
            ))}
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};