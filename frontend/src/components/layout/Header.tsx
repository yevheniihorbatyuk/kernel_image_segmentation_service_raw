import React from 'react';
import {
    Box,
    Typography,
    Button,
    Chip,
    CircularProgress,
    useTheme,
    useMediaQuery
} from '@mui/material';
import {
    PlayArrow,
    Refresh,
    GetApp,
    History,
    PhotoSizeSelectActual,
    Save
} from '@mui/icons-material';
import { useSegmentation } from '../../hooks/useSegmentation';
import { useImageStore } from '../../stores/imageStore';
import { useUIStore } from '../../stores/uiStore';

import { ImageHistory } from '../history/ImageHistory';
import { ResultHistory } from '../history/ResultHistory';
import { SessionManager } from '../history/SessionManager';

export const Header: React.FC = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    
    const {
        activeAlgorithms,
        results,
        isProcessing,
        processSegmentation,
        clearResults
    } = useSegmentation();

    const { currentImage } = useImageStore();
    const { addToast } = useUIStore();

    const [imageHistoryOpen, setImageHistoryOpen] = React.useState(false);
    const [resultHistoryOpen, setResultHistoryOpen] = React.useState(false);
    const [sessionManagerOpen, setSessionManagerOpen] = React.useState(false);

    const canProcess = currentImage && activeAlgorithms.length > 0 && !isProcessing;

    const handleStartProcessing = async () => {
        if (!canProcess) return;
        
        try {
            await processSegmentation();
        } catch (error) {
            addToast({
                type: 'error',
                message: 'Failed to start segmentation'
            });
        }
    };

    const handleClearResults = () => {
        clearResults();
        addToast({
            type: 'info',
            message: 'Results cleared'
        });
    };

    const handleExportResults = () => {
        if (results.length === 0) {
            addToast({
                type: 'warning',
                message: 'No results to export'
            });
            return;
        }

        const exportData = {
            timestamp: new Date().toISOString(),
            image: {
                id: currentImage?.id,
                filename: currentImage?.original_filename,
                dimensions: currentImage?.dimensions
            },
            algorithms: activeAlgorithms.map(alg => ({
                name: alg.name,
                parameters: alg.parameters
            })),
            results: results.map(result => ({
                algorithm: result.algorithm_name,
                segments_count: result.segments_count,
                processing_time: result.processing_time,
                result_url: result.result_image_url
            }))
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], {
            type: 'application/json'
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `segmentation_results_${Date.now()}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        addToast({
            type: 'success',
            message: 'Results exported successfully'
        });
    };

    return (
        <>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: isMobile ? 'column' : 'row',
                    alignItems: isMobile ? 'stretch' : 'center',
                    justifyContent: 'space-between',
                    gap: isMobile ? 3 : 0,
                    mb: 3,
                    p: 3,
                    bgcolor: 'background.paper',
                    borderRadius: 2,
                    boxShadow: 1
                }}
            >
                {/* Left side - Title and status chips */}
                <Box sx={{ flex: isMobile ? 'none' : 1 }}>
                    <Typography 
                        variant={isMobile ? "h5" : "h4"} 
                        component="h1" 
                        gutterBottom
                        sx={{ 
                            fontWeight: 600,
                            color: 'primary.main',
                            mb: 2
                        }}
                    >
                        Image Segmentation
                    </Typography>
                    
                    <Box 
                        display="flex" 
                        alignItems="center" 
                        gap={1.5} 
                        flexWrap="wrap"
                    >
                        {currentImage && (
                            <Chip 
                                label={`Image: ${currentImage.original_filename}`} 
                                color="success" 
                                variant="outlined"
                                size="small"
                                sx={{ 
                                    fontSize: '0.75rem',
                                    height: 28
                                }}
                            />
                        )}
                        {activeAlgorithms.length > 0 && (
                            <Chip 
                                label={`${activeAlgorithms.length} algorithm${activeAlgorithms.length !== 1 ? 's' : ''} selected`}
                                color="primary" 
                                variant="outlined"
                                size="small"
                                sx={{ 
                                    fontSize: '0.75rem',
                                    height: 28
                                }}
                            />
                        )}
                        {results.length > 0 && (
                            <Chip 
                                label={`${results.length} result${results.length !== 1 ? 's' : ''}`}
                                color="secondary" 
                                variant="outlined"
                                size="small"
                                sx={{ 
                                    fontSize: '0.75rem',
                                    height: 28
                                }}
                            />
                        )}
                    </Box>
                </Box>

                {/* Right side - Action buttons */}
                <Box 
                    display="flex" 
                    alignItems="center" 
                    gap={1.5}
                    flexWrap={isMobile ? "wrap" : "nowrap"}
                    sx={{ 
                        width: isMobile ? '100%' : 'auto',
                        justifyContent: isMobile ? 'center' : 'flex-end'
                    }}
                >
                    {/* Primary action button */}
                    <Button
                        variant="contained"
                        size="medium"
                        startIcon={isProcessing ? (
                            <CircularProgress size={18} color="inherit" />
                        ) : (
                            <PlayArrow />
                        )}
                        onClick={handleStartProcessing}
                        disabled={!canProcess}
                        color="primary"
                        sx={{
                            minWidth: 160,
                            height: 40,
                            fontWeight: 600,
                            fontSize: '0.875rem',
                            textTransform: 'none',
                            borderRadius: 2,
                            boxShadow: theme.shadows[2],
                            '&:hover': {
                                boxShadow: theme.shadows[4],
                            }
                        }}
                    >
                        {isProcessing ? 'Processing...' : 'Start Segmentation'}
                    </Button>

                    {/* Secondary action buttons */}
                    <Button
                        variant="outlined"
                        startIcon={<Refresh />}
                        onClick={handleClearResults}
                        disabled={results.length === 0 || isProcessing}
                        sx={{
                            minWidth: 120,
                            height: 40,
                            fontSize: '0.875rem',
                            textTransform: 'none',
                            borderRadius: 2
                        }}
                    >
                        Clear Results
                    </Button>

                    <Button
                        variant="outlined"
                        startIcon={<GetApp />}
                        onClick={handleExportResults}
                        disabled={results.length === 0}
                        sx={{
                            minWidth: 120,
                            height: 40,
                            fontSize: '0.875rem',
                            textTransform: 'none',
                            borderRadius: 2
                        }}
                    >
                        Export Results
                    </Button>

                    {/* History and session buttons - compact on mobile */}
                    {!isMobile && (
                        <>
                            <Button
                                variant="outlined"
                                startIcon={<History />}
                                onClick={() => setImageHistoryOpen(true)}
                                sx={{
                                    minWidth: 100,
                                    height: 40,
                                    fontSize: '0.875rem',
                                    textTransform: 'none',
                                    borderRadius: 2
                                }}
                            >
                                Images
                            </Button>

                            <Button
                                variant="outlined"
                                startIcon={<PhotoSizeSelectActual />}
                                onClick={() => setResultHistoryOpen(true)}
                                sx={{
                                    minWidth: 100,
                                    height: 40,
                                    fontSize: '0.875rem',
                                    textTransform: 'none',
                                    borderRadius: 2
                                }}
                            >
                                Results
                            </Button>

                            <Button
                                variant="outlined"
                                startIcon={<Save />}
                                onClick={() => setSessionManagerOpen(true)}
                                sx={{
                                    minWidth: 100,
                                    height: 40,
                                    fontSize: '0.875rem',
                                    textTransform: 'none',
                                    borderRadius: 2
                                }}
                            >
                                Sessions
                            </Button>
                        </>
                    )}

                    {/* Mobile-only compact buttons */}
                    {isMobile && (
                        <Box display="flex" gap={1}>
                            <Button
                                variant="outlined"
                                size="small"
                                onClick={() => setImageHistoryOpen(true)}
                                sx={{
                                    minWidth: 80,
                                    height: 36,
                                    fontSize: '0.75rem',
                                    textTransform: 'none'
                                }}
                            >
                                <History sx={{ fontSize: 16 }} />
                            </Button>

                            <Button
                                variant="outlined"
                                size="small"
                                onClick={() => setResultHistoryOpen(true)}
                                sx={{
                                    minWidth: 80,
                                    height: 36,
                                    fontSize: '0.75rem',
                                    textTransform: 'none'
                                }}
                            >
                                <PhotoSizeSelectActual sx={{ fontSize: 16 }} />
                            </Button>

                            <Button
                                variant="outlined"
                                size="small"
                                onClick={() => setSessionManagerOpen(true)}
                                sx={{
                                    minWidth: 80,
                                    height: 36,
                                    fontSize: '0.75rem',
                                    textTransform: 'none'
                                }}
                            >
                                <Save sx={{ fontSize: 16 }} />
                            </Button>
                        </Box>
                    )}
                </Box>
            </Box>

            {/* Modal dialogs */}
            <ImageHistory 
                open={imageHistoryOpen} 
                onClose={() => setImageHistoryOpen(false)} 
            />
            
            <ResultHistory 
                open={resultHistoryOpen} 
                onClose={() => setResultHistoryOpen(false)} 
            />
            
            <SessionManager 
                open={sessionManagerOpen} 
                onClose={() => setSessionManagerOpen(false)} 
            />
        </>
    );
};
