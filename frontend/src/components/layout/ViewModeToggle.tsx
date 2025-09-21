// src/components/layout/ViewModeToggle.tsx
import React from 'react';
import {
  ToggleButtonGroup,
  ToggleButton,
  Tooltip,
  Box
} from '@mui/material';
import {
  CropFree,
  ViewColumn,
  GridView
} from '@mui/icons-material';
import { useViewMode } from '../../hooks/useViewMode';
import { ViewMode } from '../../types/segmentation';
import { VIEW_MODES } from '../../utils/constants';

export const ViewModeToggle: React.FC = () => {
  const { viewMode, setViewMode } = useViewMode();

  const handleViewModeChange = (
    event: React.MouseEvent<HTMLElement>,
    newViewMode: ViewMode | null,
  ) => {
    if (newViewMode !== null) {
      setViewMode(newViewMode);
    }
  };

  const getIcon = (mode: ViewMode) => {
    switch (mode) {
      case 'single':
        return <CropFree />;
      case 'split':
        return <ViewColumn />;
      case 'grid_2x2':
        return <GridView />;
      default:
        return <CropFree />;
    }
  };

  return (
    <Box sx={{ display: { xs: 'none', sm: 'flex' } }}>
      <ToggleButtonGroup
        value={viewMode}
        exclusive
        onChange={handleViewModeChange}
        aria-label="view mode"
        size="small"
        sx={{
          '& .MuiToggleButton-root': {
            color: 'inherit',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            '&.Mui-selected': {
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              color: 'inherit',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.3)',
              },
            },
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
            },
          },
        }}
      >
        {Object.entries(VIEW_MODES).map(([key, config]) => (
          <ToggleButton key={key} value={config.name}>
            <Tooltip title={config.description}>
              {getIcon(config.name as ViewMode)}
            </Tooltip>
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </Box>
  );
};