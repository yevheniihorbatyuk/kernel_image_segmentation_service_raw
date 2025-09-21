// src/components/segmentation/ParameterPanel.tsx
import React from 'react';
import {
  Paper,
  Typography,
  Box,
  Slider,
  TextField,
  FormControl,
  InputLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  ExpandMore,
  Refresh,
  Tune,
  Speed,
  Memory
} from '@mui/icons-material';
import { useSegmentation } from '../../hooks/useSegmentation';
import { useDebounce } from '../../hooks/useDebounce';
import { AlgorithmType } from '../../types/segmentation';
import { ALGORITHM_CONFIGS } from '../../utils/constants';

interface ParameterControlProps {
  algorithmName: AlgorithmType;
  paramName: string;
  paramValue: number | string;
  paramSchema: any;
  onUpdate: (value: number | string) => void;
}

const ParameterControl: React.FC<ParameterControlProps> = ({
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
      <Box mb={3}>
        <Typography variant="body2" fontWeight="medium" mb={1}>
          {paramName.replace('_', ' ').toUpperCase()}
        </Typography>
        
        <Box display="flex" alignItems="center" gap={2}>
          <Box flex={1}>
            <Slider
              value={typeof localValue === 'number' ? localValue : 0}
              min={min_value}
              max={max_value}
              step={step || (type === 'int' ? 1 : 0.1)}
              onChange={(_, value) => setLocalValue(value as number)}
              valueLabelDisplay="auto"
              size="small"
            />
          </Box>
          
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
            sx={{ width: 80 }}
          />
        </Box>
        
        <Box display="flex" justifyContent="space-between" mt={0.5}>
          <Typography variant="caption" color="text.secondary">
            {min_value}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {max_value}
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box mb={3}>
      <TextField
        fullWidth
        size="small"
        label={paramName.replace('_', ' ').toUpperCase()}
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        type={type === 'bool' ? 'checkbox' : 'text'}
      />
    </Box>
  );
};

export const ParameterPanel: React.FC = () => {
  const {
    availableAlgorithms,
    activeAlgorithms,
    updateParameter,
    results
  } = useSegmentation();

  if (activeAlgorithms.length === 0) {
    return (
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" mb={2} display="flex" alignItems="center" gap={1}>
          <Tune />
          Parameter Controls
        </Typography>
        <Box textAlign="center" py={4}>
          <Tune sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
          <Typography color="text.secondary">
            Select algorithms to adjust their parameters
          </Typography>
        </Box>
      </Paper>
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

  const getAlgorithmResult = (algorithmName: AlgorithmType) => {
    return results.find(result => result.algorithm_name === algorithmName);
  };

  return (
    <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" mb={2} display="flex" alignItems="center" gap={1}>
        <Tune />
        Parameter Controls
      </Typography>

      {activeAlgorithms.map((algorithm) => {
        const algorithmInfo = availableAlgorithms.find(alg => alg.name === algorithm.name);
        const config = ALGORITHM_CONFIGS[algorithm.name];
        const result = getAlgorithmResult(algorithm.name);

        if (!algorithmInfo) return null;

        return (
          <Accordion key={algorithm.name} defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Box display="flex" alignItems="center" justifyContent="space-between" width="100%">
                <Box display="flex" alignItems="center" gap={2}>
                  <Typography variant="subtitle1" fontWeight="medium">
                    {algorithm.display_name}
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
                
                <Box display="flex" alignItems="center" gap={1} onClick={(e) => e.stopPropagation()}>
                  {result && (
                    <>
                      <Tooltip title={`${result.segments_count} segments`}>
                        <Chip
                          size="small"
                          icon={<Memory />}
                          label={result.segments_count}
                          variant="outlined"
                        />
                      </Tooltip>
                      <Tooltip title={`Processing time: ${result.processing_time.toFixed(2)}s`}>
                        <Chip
                          size="small"
                          icon={<Speed />}
                          label={`${result.processing_time.toFixed(2)}s`}
                          variant="outlined"
                        />
                      </Tooltip>
                    </>
                  )}
                  <Tooltip title="Reset to defaults">
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        resetToDefaults(algorithm.name);
                      }}
                    >
                      <Refresh />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            </AccordionSummary>

            <AccordionDetails>
              <Box>
                {Object.entries(algorithmInfo.default_parameters).map(([paramName, paramSchema]) => {
                  const currentValue = algorithm.parameters[paramName] ?? paramSchema.value;
                  
                  return (
                    <ParameterControl
                      key={paramName}
                      algorithmName={algorithm.name}
                      paramName={paramName}
                      paramValue={currentValue}
                      paramSchema={paramSchema}
                      onUpdate={(value) => updateParameter(algorithm.name, paramName, value)}
                    />
                  );
                })}
              </Box>
            </AccordionDetails>
          </Accordion>
        );
      })}
    </Paper>
  );
};
