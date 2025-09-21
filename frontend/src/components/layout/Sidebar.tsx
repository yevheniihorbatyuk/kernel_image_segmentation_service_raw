// src/components/layout/Sidebar.tsx
import React from 'react';
import {
  Box,
  Toolbar,
  Typography,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Collapse,
  Badge,
  Chip
} from '@mui/material';
import {
  CloudUpload,
  Tune,
  ViewModule,
  ExpandLess,
  ExpandMore,
  PhotoSizeSelectActual,
  Speed,
  Wifi,
  WifiOff
} from '@mui/icons-material';
import { ImageUpload } from '../image/ImageUpload';
import { AlgorithmSelector } from '../segmentation/AlgorithmSelector';
import { ParameterPanel } from '../segmentation/ParameterPanel';
import { useWebSocket } from '../../hooks/useWebSocket';
import { useSegmentation } from '../../hooks/useSegmentation';
import { useImageStore } from '../../stores/imageStore';

export const Sidebar: React.FC = () => {
  const [uploadOpen, setUploadOpen] = React.useState(true);
  const [algorithmsOpen, setAlgorithmsOpen] = React.useState(true);
  const [parametersOpen, setParametersOpen] = React.useState(true);

  const { isConnected } = useWebSocket();
  const { activeAlgorithms, results, isProcessing } = useSegmentation();
  const { currentImage } = useImageStore();

  return (
    <Box 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        overflow: 'hidden' // Запобігаємо переповненню
      }}
    >
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          Controls
        </Typography>
        <Box ml="auto">
          <Badge color={isConnected ? 'success' : 'error'} variant="dot">
            {isConnected ? <Wifi fontSize="small" /> : <WifiOff fontSize="small" />}
          </Badge>
        </Box>
      </Toolbar>

      <Divider />

      <Box 
        sx={{ 
          overflow: 'auto', 
          flex: 1,
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-track': {
            background: '#f1f1f1',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#888',
            borderRadius: '3px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: '#555',
          },
        }}
      >
        <List component="nav" disablePadding>
          {/* Image Upload Section */}
          <ListItem 
            button 
            onClick={() => setUploadOpen(!uploadOpen)}
            sx={{ py: 1 }}
          >
            <ListItemIcon>
              <CloudUpload />
            </ListItemIcon>
            <ListItemText 
              primary="Image Upload"
              primaryTypographyProps={{ variant: 'subtitle2', fontWeight: 600 }}
            />
            <Box display="flex" alignItems="center" gap={1}>
              {currentImage && (
                <Chip size="small" label="Ready" color="success" variant="outlined" />
              )}
              {uploadOpen ? <ExpandLess /> : <ExpandMore />}
            </Box>
          </ListItem>
          
          <Collapse in={uploadOpen} timeout="auto" unmountOnExit>
            <Box sx={{ px: 1, pb: 1 }}>
              <ImageUpload />
            </Box>
          </Collapse>

          <Divider />

          {/* Algorithm Selection Section */}
          <ListItem 
            button 
            onClick={() => setAlgorithmsOpen(!algorithmsOpen)}
            sx={{ py: 1 }}
          >
            <ListItemIcon>
              <ViewModule />
            </ListItemIcon>
            <ListItemText 
              primary="Algorithms"
              primaryTypographyProps={{ variant: 'subtitle2', fontWeight: 600 }}
            />
            <Box display="flex" alignItems="center" gap={1}>
              {activeAlgorithms.length > 0 && (
                <Chip 
                  size="small" 
                  label={activeAlgorithms.length} 
                  color="primary" 
                  variant="outlined" 
                />
              )}
              {algorithmsOpen ? <ExpandLess /> : <ExpandMore />}
            </Box>
          </ListItem>
          
          <Collapse in={algorithmsOpen} timeout="auto" unmountOnExit>
            <Box sx={{ px: 1, pb: 1 }}>
              <AlgorithmSelector />
            </Box>
          </Collapse>

          <Divider />

          {/* Parameter Controls Section */}
          <ListItem 
            button 
            onClick={() => setParametersOpen(!parametersOpen)}
            sx={{ py: 1 }}
          >
            <ListItemIcon>
              <Tune />
            </ListItemIcon>
            <ListItemText 
              primary="Parameters"
              primaryTypographyProps={{ variant: 'subtitle2', fontWeight: 600 }}
            />
            <Box display="flex" alignItems="center" gap={1}>
              {isProcessing && (
                <Chip size="small" label="Processing" color="warning" variant="outlined" />
              )}
              {parametersOpen ? <ExpandLess /> : <ExpandMore />}
            </Box>
          </ListItem>
          
          <Collapse in={parametersOpen} timeout="auto" unmountOnExit>
            <Box sx={{ px: 1, pb: 1 }}>
              <ParameterPanel />
            </Box>
          </Collapse>

          <Divider />

          {/* Results Summary */}
          <ListItem sx={{ py: 1 }}>
            <ListItemIcon>
              <PhotoSizeSelectActual />
            </ListItemIcon>
            <ListItemText 
              primary="Results" 
              secondary={`${results.length} segmentation${results.length !== 1 ? 's' : ''} completed`}
              primaryTypographyProps={{ variant: 'subtitle2', fontWeight: 600 }}
              secondaryTypographyProps={{ variant: 'caption' }}
            />
            {results.length > 0 && (
              <Chip size="small" label={results.length} color="success" variant="outlined" />
            )}
          </ListItem>

          {/* Processing time summary */}
          {results.length > 0 && (
            <ListItem sx={{ py: 1 }}>
              <ListItemIcon>
                <Speed />
              </ListItemIcon>
              <ListItemText 
                primary="Total Time"
                secondary={`${results.reduce((sum: number, r: any) => sum + r.processing_time, 0).toFixed(2)}s`}
                primaryTypographyProps={{ variant: 'subtitle2', fontWeight: 600 }}
                secondaryTypographyProps={{ variant: 'caption' }}
              />
            </ListItem>
          )}
        </List>
      </Box>
    </Box>
  );
};