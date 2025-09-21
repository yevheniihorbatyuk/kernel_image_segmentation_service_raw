// src/components/layout/ToastContainer.tsx
import React from 'react';
import {
  Snackbar,
  Alert,
  AlertTitle,
  Stack,
  Slide,
  SlideProps
} from '@mui/material';
import { useUIStore } from '../../stores/uiStore';

const SlideTransition = (props: SlideProps) => {
  return <Slide {...props} direction="up" />;
};

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useUIStore();

  return (
    <Stack
      spacing={1}
      sx={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 9999,
        maxWidth: 400,
      }}
    >
      {toasts.map((toast) => (
        <Snackbar
          key={toast.id}
          open={true}
          TransitionComponent={SlideTransition}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert
            severity={toast.type}
            onClose={() => removeToast(toast.id)}
            variant="filled"
            sx={{ width: '100%' }}
          >
            {toast.message}
          </Alert>
        </Snackbar>
      ))}
    </Stack>
  );
};
