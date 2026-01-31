import React from 'react';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { useUI } from '../../contexts/UIContext';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { sidebarOpen } = useUI();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F9FAFB', width: '100%', overflowX: 'hidden' }}>
      <Navbar />
      <Sidebar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: '100%',
          p: 4,
          marginTop: '64px',
          minHeight: 'calc(100vh - 64px)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          marginLeft: 0,
          maxWidth: '100%',
          boxSizing: 'border-box',
          position: 'relative',
          overflowX: 'hidden',
        }}
      >
        <Box
          sx={{
            width: '100%',
            maxWidth: { xs: '100%', sm: '100%', md: '1400px', lg: '1600px' },
            mx: 'auto',
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;
