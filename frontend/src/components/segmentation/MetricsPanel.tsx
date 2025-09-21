// src/components/segmentation/MetricsPanel.tsx
import React from 'react';
import { Paper, Typography, Box, Chip } from '@mui/material';

interface MetricsPanelProps {
  // Add props as needed
}

export const MetricsPanel: React.FC<MetricsPanelProps> = () => {
  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Typography variant="h6" mb={2}>
        Performance Metrics
      </Typography>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 150,
          flexDirection: 'column',
          gap: 2
        }}
      >
        <Typography color="text.secondary">
          Metrics panel coming soon...
        </Typography>
        <Box display="flex" gap={1}>
          <Chip label="Processing Time" variant="outlined" />
          <Chip label="Memory Usage" variant="outlined" />
          <Chip label="Segments Count" variant="outlined" />
        </Box>
      </Box>
    </Paper>
  );
};