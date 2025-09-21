// src/components/segmentation/AlgorithmSelector.tsx
import React from 'react';
import {
  Paper,
  Typography,
  Box,
  Chip,
  Button,
  Grid,
  Tooltip,
  LinearProgress
} from '@mui/material';
import {
  Add,
  Remove,
  Settings,
  Speed,
  Memory
} from '@mui/icons-material';
import { useSegmentation } from '../../hooks/useSegmentation';
import { useViewMode } from '../../hooks/useViewMode';
import { ALGORITHM_CONFIGS } from '../../utils/constants';
import { AlgorithmType } from '../../types/segmentation';

export const AlgorithmSelector: React.FC = () => {
  const {
    availableAlgorithms,
    activeAlgorithms,
    isLoadingAlgorithms,
    toggleAlgorithm,
    progress
  } = useSegmentation();

  const { getMaxAllowedAlgorithms } = useViewMode();

  const maxAlgorithms = getMaxAllowedAlgorithms();
  const canAddMore = activeAlgorithms.length < maxAlgorithms;

  if (isLoadingAlgorithms) {
    return (
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" mb={2}>
          Loading Algorithms...
        </Typography>
        <LinearProgress />
      </Paper>
    );
  }

  const isAlgorithmActive = (algorithmName: AlgorithmType) => {
    return activeAlgorithms.some(alg => alg.name === algorithmName);
  };

  const getAlgorithmProgress = (algorithmName: AlgorithmType) => {
    return progress[algorithmName] || 0;
  };

  return (
    <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="h6">
          Segmentation Algorithms
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {activeAlgorithms.length} / {maxAlgorithms} selected
        </Typography>
      </Box>

      <Grid container spacing={2}>
        {availableAlgorithms.map((algorithm) => {
          const isActive = isAlgorithmActive(algorithm.name);
          const progressValue = getAlgorithmProgress(algorithm.name);
          const config = ALGORITHM_CONFIGS[algorithm.name];

          return (
            <Grid item xs={12} sm={6} key={algorithm.name}>
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  border: '2px solid',
                  borderColor: isActive ? 'primary.main' : 'divider',
                  backgroundColor: isActive ? 'action.selected' : 'background.paper',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    borderColor: isActive ? 'primary.dark' : 'primary.light',
                    backgroundColor: isActive ? 'action.selected' : 'action.hover'
                  }
                }}
                onClick={() => {
                  if (isActive || canAddMore) {
                    toggleAlgorithm(algorithm.name);
                  }
                }}
              >
                <Box display="flex" alignItems="flex-start" justifyContent="space-between" mb={1}>
                  <Box>
                    <Typography variant="subtitle1" fontWeight="medium">
                      {algorithm.display_name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {algorithm.description}
                    </Typography>
                  </Box>
                  
                  <Box display="flex" alignItems="center" gap={1}>
                    {progressValue > 0 && progressValue < 100 && (
                      <Tooltip title={`Processing: ${progressValue.toFixed(1)}%`}>
                        <Box sx={{ width: 30, height: 30, position: 'relative' }}>
                          <LinearProgress
                            variant="determinate"
                            value={progressValue}
                            sx={{
                              height: 4,
                              borderRadius: 2,
                              position: 'absolute',
                              top: '50%',
                              left: 0,
                              right: 0,
                              transform: 'translateY(-50%)'
                            }}
                          />
                        </Box>
                      </Tooltip>
                    )}
                    
                    <Button
                      size="small"
                      variant={isActive ? "contained" : "outlined"}
                      color={isActive ? "error" : "primary"}
                      startIcon={isActive ? <Remove /> : <Add />}
                      disabled={!isActive && !canAddMore}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isActive || canAddMore) {
                          toggleAlgorithm(algorithm.name);
                        }
                      }}
                    >
                      {isActive ? 'Remove' : 'Add'}
                    </Button>
                  </Box>
                </Box>

                {/* Algorithm info chips */}
                <Box display="flex" gap={1} flexWrap="wrap" mt={1}>
                  <Chip
                    size="small"
                    icon={<Settings />}
                    label={`${Object.keys(algorithm.default_parameters).length} params`}
                    variant="outlined"
                  />
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

                {/* Progress bar for active processing */}
                {isActive && progressValue > 0 && progressValue < 100 && (
                  <Box mt={2}>
                    <LinearProgress 
                      variant="determinate" 
                      value={progressValue}
                      sx={{ height: 6, borderRadius: 3 }}
                    />
                    <Typography variant="caption" color="text.secondary" mt={0.5} display="block">
                      Processing: {progressValue.toFixed(1)}%
                    </Typography>
                  </Box>
                )}
              </Paper>
            </Grid>
          );
        })}
      </Grid>

      {!canAddMore && (
        <Box mt={2} p={2} bgcolor="warning.light" borderRadius={1}>
          <Typography variant="body2" color="warning.dark">
            Maximum number of algorithms reached for current view mode.
            Switch to Grid 2×2 view to compare more algorithms.
          </Typography>
        </Box>
      )}
    </Paper>
  );
};
