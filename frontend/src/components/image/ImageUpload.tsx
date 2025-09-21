// src/components/image/ImageUpload.tsx
import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Box,
  Paper,
  Typography,
  Button,
  LinearProgress,
  IconButton,
  Alert
} from '@mui/material';
import {
  CloudUpload,
  Delete,
  Image as ImageIcon
} from '@mui/icons-material';
import { useImageUpload } from '../../hooks/useImageUpload';
import { ImageService } from '../../services/imageService';

export const ImageUpload: React.FC = () => {
  const {
    currentImage,
    uploadProgress,
    isUploading,
    error,
    previewUrl,
    upload,
    clear,
    setError
  } = useImageUpload();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const validation = ImageService.validateImageFile(file);
      if (!validation.isValid) {
        setError(validation.error || 'Invalid file');
        return;
      }
      upload(file);
    }
  }, [upload, setError]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/bmp': ['.bmp'],
      'image/tiff': ['.tiff']
    },
    multiple: false,
    maxSize: 10 * 1024 * 1024 // 10MB
  });

  if (currentImage || previewUrl) {
    return (
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="h6" display="flex" alignItems="center" gap={1}>
            <ImageIcon />
            Uploaded Image
          </Typography>
          <IconButton color="error" onClick={clear} title="Remove image">
            <Delete />
          </IconButton>
        </Box>

        <Box
          component="img"
          src={previewUrl || (currentImage ? `${process.env.REACT_APP_API_URL}${currentImage.url}` : '')}
          alt="Uploaded image"
          sx={{
            width: '100%',
            maxHeight: 300,
            objectFit: 'contain',
            borderRadius: 1,
            border: '1px solid',
            borderColor: 'divider'
          }}
        />

        {currentImage && (
          <Box mt={2}>
            <Typography variant="body2" color="text.secondary">
              <strong>Filename:</strong> {currentImage.original_filename}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Size:</strong> {ImageService.formatFileSize(currentImage.size)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Dimensions:</strong> {currentImage.dimensions[0]} × {currentImage.dimensions[1]}
            </Typography>
          </Box>
        )}

        {isUploading && (
          <Box mt={2}>
            <LinearProgress variant="determinate" value={uploadProgress} />
            <Typography variant="body2" color="text.secondary" mt={1}>
              Uploading... {uploadProgress}%
            </Typography>
          </Box>
        )}
      </Paper>
    );
  }

  return (
    <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" mb={2} display="flex" alignItems="center" gap={1}>
        <CloudUpload />
        Upload Image
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Box
        {...getRootProps()}
        sx={{
          border: '2px dashed',
          borderColor: isDragActive ? 'primary.main' : 'divider',
          borderRadius: 2,
          p: 4,
          textAlign: 'center',
          cursor: 'pointer',
          backgroundColor: isDragActive ? 'action.hover' : 'background.default',
          transition: 'all 0.2s ease',
          '&:hover': {
            borderColor: 'primary.main',
            backgroundColor: 'action.hover'
          }
        }}
      >
        <input {...getInputProps()} />
        
        <CloudUpload sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
        
        <Typography variant="body1" gutterBottom>
          {isDragActive
            ? 'Drop the image here...'
            : 'Drag & drop an image here, or click to select'
          }
        </Typography>
        
        <Typography variant="body2" color="text.secondary" mb={2}>
          Supported formats: JPEG, PNG, BMP, TIFF (max 10MB)
        </Typography>
        
        <Button variant="outlined" component="span">
          Choose File
        </Button>
      </Box>

      {isUploading && (
        <Box mt={2}>
          <LinearProgress />
          <Typography variant="body2" color="text.secondary" mt={1} textAlign="center">
            Uploading...
          </Typography>
        </Box>
      )}
    </Paper>
  );
};
