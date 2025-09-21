// src/components/history/ImageHistory.tsx
import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Box,
  IconButton,
  Tooltip,
  Chip
} from '@mui/material';
import {
  Close,
  Upload,
  History,
  Delete
} from '@mui/icons-material';
import { useImageStore } from '../../stores/imageStore';
import { ImageInfo } from '../../types/api';

interface ImageHistoryProps {
  open: boolean;
  onClose: () => void;
}

export const ImageHistory: React.FC<ImageHistoryProps> = ({ open, onClose }) => {
  const { imageHistory, loadImageFromHistory, currentImage } = useImageStore();

  const handleSelectImage = (image: ImageInfo) => {
    loadImageFromHistory(image.id);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box display="flex" alignItems="center" gap={1}>
          <History />
          <Typography variant="h6">Image History</Typography>
        </Box>
        <IconButton onClick={onClose}>
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        {imageHistory.length === 0 ? (
          <Box textAlign="center" py={4}>
            <Upload sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography color="text.secondary">
              No images in history. Upload some images to see them here.
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={2}>
            {imageHistory.map((image) => (
              <Grid item xs={12} sm={6} md={4} key={image.id}>
                <Card 
                  sx={{ 
                    cursor: 'pointer',
                    border: currentImage?.id === image.id ? '2px solid' : '1px solid',
                    borderColor: currentImage?.id === image.id ? 'primary.main' : 'divider',
                    '&:hover': {
                      borderColor: 'primary.light',
                      boxShadow: 2
                    }
                  }}
                  onClick={() => handleSelectImage(image)}
                >
                  <CardMedia
                    component="img"
                    height="120"
                    image={`${process.env.REACT_APP_API_URL}${image.url}`}
                    alt={image.original_filename}
                    sx={{ objectFit: 'cover' }}
                  />
                  <CardContent sx={{ p: 1 }}>
                    <Typography variant="body2" fontWeight="medium" noWrap>
                      {image.original_filename}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {image.dimensions[0]} × {image.dimensions[1]}
                    </Typography>
                    {currentImage?.id === image.id && (
                      <Chip size="small" label="Current" color="primary" sx={{ mt: 0.5 }} />
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};