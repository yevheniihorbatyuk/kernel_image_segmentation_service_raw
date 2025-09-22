// src/components/layout/ViewModeToggle.tsx - ENHANCED VERSION
import React, { useState } from 'react';
import {
  ToggleButtonGroup,
  ToggleButton,
  Tooltip,
  Box,
  Button,
  Divider
} from '@mui/material';
import {
  CropFree,
  ViewColumn,
  GridView,
  Compare
} from '@mui/icons-material';
import { useViewMode } from '../../hooks/useViewMode';
import { useSegmentationStore } from '../../stores/segmentationStore';
import { useUIStore } from '../../stores/uiStore';
import { ViewMode } from '../../types/segmentation';
import { VIEW_MODES } from '../../utils/constants';
import { AdvancedSplitView } from '../comparison/AdvancedSplitView';

export const ViewModeToggle: React.FC = () => {
  const { viewMode, setViewMode } = useViewMode();
  const { results } = useSegmentationStore();
  const { addToast } = useUIStore();
  const [splitViewOpen, setSplitViewOpen] = useState(false);

  const handleViewModeChange = (
    event: React.MouseEvent<HTMLElement>,
    newViewMode: ViewMode | null,
  ) => {
    if (newViewMode !== null) {
      setViewMode(newViewMode);
    }
  };

  const handleOpenAdvancedSplit = () => {
    if (results.length === 0) {
      addToast({
        type: 'warning',
        message: 'Process some images first to enable advanced comparison'
      });
      return;
    }
    setSplitViewOpen(true);
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
    <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', gap: 1 }}>
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

      <Divider 
        orientation="vertical" 
        flexItem 
        sx={{ 
          borderColor: 'rgba(255, 255, 255, 0.3)',
          mx: 0.5 
        }} 
      />

      <Tooltip title="Advanced Image Comparison">
        <Button
          variant="outlined"
          size="small"
          startIcon={<Compare />}
          onClick={handleOpenAdvancedSplit}
          disabled={results.length === 0}
          sx={{
            color: 'inherit',
            borderColor: 'rgba(255, 255, 255, 0.3)',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderColor: 'rgba(255, 255, 255, 0.5)',
            },
            '&.Mui-disabled': {
              color: 'rgba(255, 255, 255, 0.3)',
              borderColor: 'rgba(255, 255, 255, 0.1)',
            }
          }}
        >
          Compare
        </Button>
      </Tooltip>

      <AdvancedSplitView
        open={splitViewOpen}
        onClose={() => setSplitViewOpen(false)}
      />
    </Box>
  );
};