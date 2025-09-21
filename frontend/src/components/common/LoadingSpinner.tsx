// src/components/common/LoadingSpinner.tsx
import React from 'react';
import {
  Box,
  CircularProgress,
  Typography,
  LinearProgress
} from '@mui/material';

interface LoadingSpinnerProps {
  message?: string;
  progress?: number;
  size?: number | string;
  variant?: 'circular' | 'linear';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = 'Loading...',
  progress,
  size = 40,
  variant = 'circular'
}) => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      gap={2}
      py={4}
    >
      {variant === 'circular' ? (
        <CircularProgress 
          size={size} 
          variant={progress !== undefined ? 'determinate' : 'indeterminate'}
          value={progress}
        />
      ) : (
        <Box width="100%" maxWidth={300}>
          <LinearProgress 
            variant={progress !== undefined ? 'determinate' : 'indeterminate'}
            value={progress}
          />
        </Box>
      )}
      
      <Typography variant="body2" color="text.secondary" textAlign="center">
        {message}
        {progress !== undefined && ` ${Math.round(progress)}%`}
      </Typography>
    </Box>
  );
};