// src/components/layout/MainLayout.tsx
import React from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  useTheme,
  useMediaQuery,
  Container
} from '@mui/material';
import {
  Menu,
  MenuOpen,
  DarkMode,
  LightMode,
  Settings,
  Info
} from '@mui/icons-material';
import { useUIStore } from '../../stores/uiStore';
import { Sidebar } from './Sidebar';
import { ViewModeToggle } from './ViewModeToggle';
import { ToastContainer } from './ToastContainer';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const {
    sidebarOpen,
    darkMode,
    toggleSidebar,
    setSidebarOpen,
    toggleDarkMode
  } = useUIStore();

  const sidebarWidth = 320;

  const handleDrawerToggle = () => {
    if (isMobile) {
      setSidebarOpen(!sidebarOpen);
    } else {
      toggleSidebar();
    }
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          width: { md: sidebarOpen ? `calc(100% - ${sidebarWidth}px)` : '100%' },
          ml: { md: sidebarOpen ? `${sidebarWidth}px` : 0 },
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
        elevation={1}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="toggle sidebar"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2 }}
          >
            {sidebarOpen ? <MenuOpen /> : <Menu />}
          </IconButton>

          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Image Segmentation Service
          </Typography>

          <ViewModeToggle />

          <IconButton
            color="inherit"
            onClick={toggleDarkMode}
            title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            sx={{ ml: 1 }}
          >
            {darkMode ? <LightMode /> : <DarkMode />}
          </IconButton>

          <IconButton color="inherit" sx={{ ml: 1 }}>
            <Settings />
          </IconButton>

          <IconButton color="inherit" sx={{ ml: 1 }}>
            <Info />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Drawer
        variant={isMobile ? 'temporary' : 'persistent'}
        anchor="left"
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        sx={{
          width: sidebarWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: sidebarWidth,
            boxSizing: 'border-box',
          },
        }}
        ModalProps={{
          keepMounted: true, // Better mobile performance
        }}
      >
        <Sidebar />
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: sidebarOpen ? `calc(100% - ${sidebarWidth}px)` : '100%' },
          ml: { md: sidebarOpen ? `${sidebarWidth}px` : 0 },
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Toolbar /> {/* Spacer for AppBar */}
        
        <Container maxWidth="xl" sx={{ py: 3 }}>
          {children}
        </Container>
      </Box>

      {/* Toast notifications */}
      <ToastContainer />
    </Box>
  );
};