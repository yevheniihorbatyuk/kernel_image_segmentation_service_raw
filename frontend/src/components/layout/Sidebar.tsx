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
  Chip,
  Card,
  CardContent,
  Button,
  Slider,
  TextField,
  IconButton,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails
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
  WifiOff,
  Add,
  Remove,
  Refresh,
  Settings
} from '@mui/icons-material';
import { ImageUpload } from '../image/ImageUpload';
import { useWebSocket } from '../../hooks/useWebSocket';
import { useSegmentation } from '../../hooks/useSegmentation';
import { useImageStore } from '../../stores/imageStore';
import { useDebounce } from '../../hooks/useDebounce';
import { AlgorithmType } from '../../types/segmentation';
import { ALGORITHM_CONFIGS } from '../../utils/constants';

// Компактний AlgorithmSelector для sidebar
const CompactAlgorithmSelector: React.FC = () => {
  const {
    availableAlgorithms,
    activeAlgorithms,
    toggleAlgorithm,
    canAddMoreAlgorithms
  } = useSegmentation();

  const canAddMore = canAddMoreAlgorithms();

  return (
    <Card variant="outlined" sx={{ mt: 1 }}>
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Typography variant="subtitle2" fontWeight="medium" mb={1}>
          Available Algorithms
        </Typography>
        
        {availableAlgorithms.map((algorithm) => {
          const isActive = activeAlgorithms.some(alg => alg.name === algorithm.name);
          const config = ALGORITHM_CONFIGS[algorithm.name];
          
          return (
            <Box 
              key={algorithm.name}
              display="flex" 
              alignItems="center" 
              justifyContent="space-between"
              py={0.5}
            >
              <Box flex={1}>
                <Typography variant="body2" fontWeight="medium">
                  {algorithm.display_name}
                </Typography>
                {config && (
                  <Chip
                    size="small"
                    sx={{
                      height: 16,
                      fontSize: '0.65rem',
                      backgroundColor: config.color + '20',
                      color: config.color,
                      border: `1px solid ${config.color}40`
                    }}
                    label={config.displayName}
                  />
                )}
              </Box>
              
              <IconButton
                size="small"
                color={isActive ? "error" : "primary"}
                disabled={!isActive && !canAddMore}
                onClick={() => toggleAlgorithm(algorithm.name)}
                sx={{ ml: 1 }}
              >
                {isActive ? <Remove fontSize="small" /> : <Add fontSize="small" />}
              </IconButton>
            </Box>
          );
        })}
        
        {!canAddMore && (
          <Typography variant="caption" color="warning.main" mt={1} display="block">
            Max 4 algorithms. Switch to Grid 2×2 for more.
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

// Компактний ParameterPanel для sidebar
const CompactParameterPanel: React.FC = () => {
  const {
    availableAlgorithms,
    activeAlgorithms,
    updateParameter,
    results
  } = useSegmentation();

  const [expandedAlgorithm, setExpandedAlgorithm] = React.useState<string | null>(null);

  if (activeAlgorithms.length === 0) {
    return (
      <Card variant="outlined" sx={{ mt: 1 }}>
        <CardContent sx={{ p: 2, textAlign: 'center' }}>
          <Tune sx={{ fontSize: 32, color: 'text.secondary', mb: 1 }} />
          <Typography variant="body2" color="text.secondary">
            Select algorithms to adjust parameters
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const resetToDefaults = (algorithmName: AlgorithmType) => {
    const algorithmInfo = availableAlgorithms.find(alg => alg.name === algorithmName);
    if (algorithmInfo) {
      Object.entries(algorithmInfo.default_parameters).forEach(([paramName, schema]) => {
        updateParameter(algorithmName, paramName, schema.value);
      });
    }
  };

  return (
    <Card variant="outlined" sx={{ mt: 1 }}>
      <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
        <Typography variant="subtitle2" fontWeight="medium" mb={1} px={1}>
          Parameters
        </Typography>
        
        {activeAlgorithms.map((algorithm) => {
          const algorithmInfo = availableAlgorithms.find(alg => alg.name === algorithm.name);
          const config = ALGORITHM_CONFIGS[algorithm.name];
          const result = results.find(r => r.algorithm_name === algorithm.name);
          const isExpanded = expandedAlgorithm === algorithm.name;
          
          if (!algorithmInfo) return null;

          return (
            <Accordion 
              key={algorithm.name} 
              expanded={isExpanded}
              onChange={() => setExpandedAlgorithm(isExpanded ? null : algorithm.name)}
              sx={{ boxShadow: 'none', '&:before': { display: 'none' } }}
            >
              <AccordionSummary 
                expandIcon={<ExpandMore />}
                sx={{ minHeight: 'auto', '& .MuiAccordionSummary-content': { margin: '8px 0' } }}
              >
                <Box display="flex" alignItems="center" justifyContent="space-between" width="100%">
                  <Typography variant="body2" fontWeight="medium">
                    {algorithm.display_name}
                  </Typography>
                  
                  <Box display="flex" alignItems="center" gap={0.5} onClick={(e) => e.stopPropagation()}>
                    {result && (
                      <Tooltip title={`${result.segments_count} segments, ${result.processing_time.toFixed(1)}s`}>
                        <Chip
                          size="small"
                          label={result.segments_count}
                          sx={{ height: 20, fontSize: '0.65rem' }}
                        />
                      </Tooltip>
                    )}
                    <Tooltip title="Reset">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          resetToDefaults(algorithm.name);
                        }}
                      >
                        <Refresh fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              </AccordionSummary>

              <AccordionDetails sx={{ pt: 0 }}>
                {Object.entries(algorithmInfo.default_parameters).map(([paramName, paramSchema]) => {
                  const currentValue = algorithm.parameters[paramName] ?? paramSchema.value;
                  
                  return (
                    <CompactParameterControl
                      key={paramName}
                      algorithmName={algorithm.name}
                      paramName={paramName}
                      paramValue={currentValue}
                      paramSchema={paramSchema}
                      onUpdate={(value) => updateParameter(algorithm.name, paramName, value)}
                    />
                  );
                })}
              </AccordionDetails>
            </Accordion>
          );
        })}
      </CardContent>
    </Card>
  );
};

// Компактний контрол параметрів
interface CompactParameterControlProps {
  algorithmName: AlgorithmType;
  paramName: string;
  paramValue: number | string;
  paramSchema: any;
  onUpdate: (value: number | string) => void;
}

const CompactParameterControl: React.FC<CompactParameterControlProps> = ({
  algorithmName,
  paramName,
  paramValue,
  paramSchema,
  onUpdate
}) => {
  const [localValue, setLocalValue] = React.useState(paramValue);
  const debouncedValue = useDebounce(localValue, 300);

  React.useEffect(() => {
    if (debouncedValue !== paramValue) {
      onUpdate(debouncedValue);
    }
  }, [debouncedValue, paramValue, onUpdate]);

  React.useEffect(() => {
    setLocalValue(paramValue);
  }, [paramValue]);

  const { min_value, max_value, step, type } = paramSchema;

  if (type === 'int' || type === 'float') {
    return (
      <Box mb={2}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={0.5}>
          <Typography variant="caption" fontWeight="medium">
            {paramName.replace('_', ' ').toUpperCase()}
          </Typography>
          <TextField
            size="small"
            type="number"
            value={localValue}
            onChange={(e) => {
              const val = type === 'int' 
                ? parseInt(e.target.value) || 0
                : parseFloat(e.target.value) || 0;
              setLocalValue(val);
            }}
            inputProps={{
              min: min_value,
              max: max_value,
              step: step || (type === 'int' ? 1 : 0.1)
            }}
            sx={{ 
              width: 60,
              '& .MuiInputBase-input': { 
                fontSize: '0.75rem',
                textAlign: 'center',
                p: '4px 8px'
              }
            }}
          />
        </Box>
        
        <Slider
          value={typeof localValue === 'number' ? localValue : 0}
          min={min_value}
          max={max_value}
          step={step || (type === 'int' ? 1 : 0.1)}
          onChange={(_, value) => setLocalValue(value as number)}
          size="small"
          sx={{ mt: 0.5 }}
        />
      </Box>
    );
  }

  return (
    <Box mb={2}>
      <TextField
        fullWidth
        size="small"
        label={paramName.replace('_', ' ').toUpperCase()}
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        type={type === 'bool' ? 'checkbox' : 'text'}
        sx={{ '& .MuiInputBase-input': { fontSize: '0.75rem' } }}
      />
    </Box>
  );
};

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
        height: '100vh', 
        display: 'flex', 
        flexDirection: 'column',
        overflow: 'hidden'
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
          px: 1,
          '&::-webkit-scrollbar': {
            width: '4px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#ccc',
            borderRadius: '2px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: '#999',
          },
        }}
      >
        <List component="nav" disablePadding dense>
          {/* Image Upload Section */}
          <ListItem 
            button 
            onClick={() => setUploadOpen(!uploadOpen)}
            dense
          >
            <ListItemIcon sx={{ minWidth: 36 }}>
              <CloudUpload />
            </ListItemIcon>
            <ListItemText 
              primary="Image Upload"
              primaryTypographyProps={{ variant: 'subtitle2', fontWeight: 600 }}
            />
            <Box display="flex" alignItems="center" gap={1}>
              {currentImage && (
                <Chip size="small" label="Ready" color="success" variant="outlined" sx={{ height: 20 }} />
              )}
              {uploadOpen ? <ExpandLess /> : <ExpandMore />}
            </Box>
          </ListItem>
          
          <Collapse in={uploadOpen} timeout="auto" unmountOnExit>
            <Box sx={{ pb: 1 }}>
              <ImageUpload />
            </Box>
          </Collapse>

          <Divider />

          {/* Algorithm Selection Section */}
          <ListItem 
            button 
            onClick={() => setAlgorithmsOpen(!algorithmsOpen)}
            dense
          >
            <ListItemIcon sx={{ minWidth: 36 }}>
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
                  sx={{ height: 20 }}
                />
              )}
              {algorithmsOpen ? <ExpandLess /> : <ExpandMore />}
            </Box>
          </ListItem>
          
          <Collapse in={algorithmsOpen} timeout="auto" unmountOnExit>
            <CompactAlgorithmSelector />
          </Collapse>

          <Divider />

          {/* Parameter Controls Section */}
          <ListItem 
            button 
            onClick={() => setParametersOpen(!parametersOpen)}
            dense
          >
            <ListItemIcon sx={{ minWidth: 36 }}>
              <Tune />
            </ListItemIcon>
            <ListItemText 
              primary="Parameters"
              primaryTypographyProps={{ variant: 'subtitle2', fontWeight: 600 }}
            />
            <Box display="flex" alignItems="center" gap={1}>
              {isProcessing && (
                <Chip size="small" label="Processing" color="warning" variant="outlined" sx={{ height: 20 }} />
              )}
              {parametersOpen ? <ExpandLess /> : <ExpandMore />}
            </Box>
          </ListItem>
          
          <Collapse in={parametersOpen} timeout="auto" unmountOnExit>
            <CompactParameterPanel />
          </Collapse>

          <Divider />

          {/* Results Summary */}
          <ListItem dense>
            <ListItemIcon sx={{ minWidth: 36 }}>
              <PhotoSizeSelectActual />
            </ListItemIcon>
            <ListItemText 
              primary="Results" 
              secondary={`${results.length} completed`}
              primaryTypographyProps={{ variant: 'subtitle2', fontWeight: 600 }}
              secondaryTypographyProps={{ variant: 'caption' }}
            />
            {results.length > 0 && (
              <Chip size="small" label={results.length} color="success" variant="outlined" sx={{ height: 20 }} />
            )}
          </ListItem>

          {/* Processing time summary */}
          {results.length > 0 && (
            <ListItem dense>
              <ListItemIcon sx={{ minWidth: 36 }}>
                <Speed />
              </ListItemIcon>
              <ListItemText 
                primary="Total Time"
                secondary={`${results.reduce((sum: number, r: any) => sum + r.processing_time, 0).toFixed(1)}s`}
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