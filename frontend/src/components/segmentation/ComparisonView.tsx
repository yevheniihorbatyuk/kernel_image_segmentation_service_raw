// src/components/segmentation/ComparisonView.tsx
import React from 'react';
import { Box, Grid, Paper, Typography } from '@mui/material';

interface ComparisonViewProps {
  // Add props as needed
}

export const ComparisonView: React.FC<ComparisonViewProps> = () => {
  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Typography variant="h6" mb={2}>
        Algorithm Comparison
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 200,
              bgcolor: 'grey.100',
              borderRadius: 1
            }}
          >
            <Typography color="text.secondary">
              Comparison view coming soon...
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};