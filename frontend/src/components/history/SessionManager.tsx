// src/components/history/SessionManager.tsx
import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  Typography,
  Box,
  IconButton,
  Tooltip,
  TextField,
  Chip,
  Alert
} from '@mui/material';
import {
  Close,
  Save,
  Delete,
  Restore,
  Add
} from '@mui/icons-material';
import { useSessionStore } from '../../stores/sessionStore';
import { useImageStore } from '../../stores/imageStore';
import { useSegmentationStore } from '../../stores/segmentationStore';

interface SessionManagerProps {
  open: boolean;
  onClose: () => void;
}

export const SessionManager: React.FC<SessionManagerProps> = ({ open, onClose }) => {
  const [sessionName, setSessionName] = React.useState('');
  const [showSaveDialog, setShowSaveDialog] = React.useState(false);

  const { 
    savedSessions, 
    saveCurrentSession, 
    loadSession, 
    deleteSession,
    createNewSession
  } = useSessionStore();

  const { currentImage } = useImageStore();
  const { activeAlgorithms, results } = useSegmentationStore();

  const handleSaveSession = () => {
    if (sessionName.trim()) {
      saveCurrentSession(sessionName.trim());
      setSessionName('');
      setShowSaveDialog(false);
    }
  };

  const handleLoadSession = (sessionId: string) => {
    const session = loadSession(sessionId);
    if (session) {
      // Restore image and algorithms to their stores
      // This would need additional integration with the stores
      onClose();
    }
  };

  const canSaveSession = currentImage || activeAlgorithms.length > 0 || results.length > 0;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h6">Session Manager</Typography>
        <IconButton onClick={onClose}>
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        {/* Current Session Info */}
        <Box mb={3}>
          <Typography variant="subtitle2" mb={1}>Current Session</Typography>
          <Box display="flex" flexWrap="wrap" gap={1}>
            {currentImage && (
              <Chip 
                size="small" 
                label={`Image: ${currentImage.original_filename}`} 
                color="success" 
              />
            )}
            {activeAlgorithms.length > 0 && (
              <Chip 
                size="small" 
                label={`${activeAlgorithms.length} algorithms`} 
                color="primary" 
              />
            )}
            {results.length > 0 && (
              <Chip 
                size="small" 
                label={`${results.length} results`} 
                color="secondary" 
              />
            )}
          </Box>
          
          <Box mt={1}>
            <Button
              startIcon={<Save />}
              disabled={!canSaveSession}
              onClick={() => setShowSaveDialog(true)}
              size="small"
            >
              Save Current Session
            </Button>
            <Button
              startIcon={<Add />}
              onClick={createNewSession}
              size="small"
              sx={{ ml: 1 }}
            >
              New Session
            </Button>
          </Box>
        </Box>

        {/* Save Dialog */}
        {showSaveDialog && (
          <Box mb={3} p={2} border="1px solid" borderColor="divider" borderRadius={1}>
            <Typography variant="subtitle2" mb={1}>Save Session</Typography>
            <TextField
              fullWidth
              size="small"
              label="Session Name"
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
              placeholder="Enter session name..."
              sx={{ mb: 1 }}
            />
            <Box>
              <Button onClick={handleSaveSession} disabled={!sessionName.trim()}>
                Save
              </Button>
              <Button onClick={() => setShowSaveDialog(false)} sx={{ ml: 1 }}>
                Cancel
              </Button>
            </Box>
          </Box>
        )}

        {/* Saved Sessions */}
        <Typography variant="subtitle2" mb={1}>Saved Sessions</Typography>
        {savedSessions.length === 0 ? (
          <Alert severity="info">
            No saved sessions. Save your current work to access it later.
          </Alert>
        ) : (
          <List>
            {savedSessions.map((session) => (
              <ListItem
                key={session.id}
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  mb: 1
                }}
              >
                <ListItemText
                  primary={session.name || `Session ${session.id.slice(-4)}`}
                  secondary={
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(session.timestamp).toLocaleString()}
                      </Typography>
                      <Box display="flex" gap={1} mt={0.5}>
                        {session.image && (
                          <Chip size="small" label="Image" />
                        )}
                        {session.algorithms.length > 0 && (
                          <Chip size="small" label={`${session.algorithms.length} alg`} />
                        )}
                        {session.results.length > 0 && (
                          <Chip size="small" label={`${session.results.length} res`} />
                        )}
                      </Box>
                    </Box>
                  }
                />
                <Box>
                  <Tooltip title="Load session">
                    <IconButton
                      size="small"
                      onClick={() => handleLoadSession(session.id)}
                    >
                      <Restore />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete session">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => deleteSession(session.id)}
                    >
                      <Delete />
                    </IconButton>
                  </Tooltip>
                </Box>
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};