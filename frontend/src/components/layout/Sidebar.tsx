import React from 'react';
import { Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Box, useMediaQuery, useTheme } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, GraduationCap, Briefcase, Scale, Heart } from 'lucide-react';
import { useUI } from '../../contexts/UIContext';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { sidebarOpen, setSidebarOpen } = useUI();
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const menuItems = [
    { text: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { text: 'Learning', icon: GraduationCap, path: '/learning' },
    { text: 'Career', icon: Briefcase, path: '/career' },
    { text: 'Compliance', icon: Scale, path: '/compliance' },
    { text: 'Wellness', icon: Heart, path: '/wellness' },
  ];

  if (user?.role === 'ADMIN') {
    menuItems.push({ text: 'Admin', icon: LayoutDashboard, path: '/admin' });
  }

  const handleItemClick = (path: string) => {
    navigate(path);
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  return (
    <Drawer
      variant={isMobile ? 'temporary' : 'persistent'}
      open={sidebarOpen}
      onClose={() => setSidebarOpen(false)}
      ModalProps={{
        keepMounted: true,
      }}
      sx={{
        width: 260,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 260,
          boxSizing: 'border-box',
          marginTop: '64px',
          borderRight: '1px solid #E5E7EB',
          backgroundColor: '#FFFFFF',
          zIndex: isMobile ? (theme) => theme.zIndex.drawer : (theme) => theme.zIndex.drawer - 1,
          position: 'fixed',
          height: 'calc(100vh - 64px)',
        },
      }}
    >
      <Box sx={{ overflow: 'auto', mt: 2, px: 1, height: 'calc(100vh - 64px)' }}>
        <List>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  selected={isActive}
                  onClick={() => handleItemClick(item.path)}
                  sx={{
                    height: '44px',
                    borderRadius: 2,
                    mx: 1,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      backgroundColor: isActive ? '#FEF2F2' : '#F9FAFB',
                    },
                    '&.Mui-selected': {
                      backgroundColor: '#FEF2F2',
                      borderLeft: '3px solid #EF4444',
                      '&:hover': {
                        backgroundColor: '#FEF2F2',
                      },
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: isActive ? '#EF4444' : '#6B7280',
                      minWidth: 40,
                    }}
                  >
                    {React.createElement(item.icon, { size: 20 })}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    primaryTypographyProps={{
                      fontWeight: 400,
                      fontSize: '14px',
                      color: isActive ? '#EF4444' : '#111827',
                    }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
