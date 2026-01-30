import React from 'react';
import { Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Box } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SchoolIcon from '@mui/icons-material/School';
import WorkIcon from '@mui/icons-material/Work';
import GavelIcon from '@mui/icons-material/Gavel';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { useUI } from '../../contexts/UIContext';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { sidebarOpen } = useUI();
  const { user } = useAuth();

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Learning', icon: <SchoolIcon />, path: '/learning' },
    { text: 'Career', icon: <WorkIcon />, path: '/career' },
    { text: 'Compliance', icon: <GavelIcon />, path: '/compliance' },
    { text: 'Wellness', icon: <FavoriteIcon />, path: '/wellness' },
  ];

  if (user?.role === 'ADMIN') {
    menuItems.push({ text: 'Admin', icon: <DashboardIcon />, path: '/admin' });
  }

  return (
    <Drawer
      variant="persistent"
      open={sidebarOpen}
      sx={{
        width: 260,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 260,
          boxSizing: 'border-box',
          marginTop: '64px',
          borderRight: '1px solid rgba(220, 20, 60, 0.1)',
          background: 'linear-gradient(180deg, #ffffff 0%, #fafafa 100%)',
        },
      }}
    >
      <Box sx={{ overflow: 'auto', mt: 2, px: 1 }}>
        <List>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                selected={location.pathname === item.path}
                onClick={() => navigate(item.path)}
                sx={{
                  borderRadius: 2,
                  mx: 1,
                  py: 1.5,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: 'rgba(220, 20, 60, 0.08)',
                    transform: 'translateX(4px)',
                  },
                  '&.Mui-selected': {
                    backgroundColor: 'rgba(220, 20, 60, 0.12)',
                    borderLeft: '4px solid #DC143C',
                    '&:hover': {
                      backgroundColor: 'rgba(220, 20, 60, 0.15)',
                    },
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: location.pathname === item.path ? '#DC143C' : 'rgba(0, 0, 0, 0.6)',
                    minWidth: 40,
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontWeight: location.pathname === item.path ? 600 : 500,
                    fontSize: '0.95rem',
                    color: location.pathname === item.path ? '#DC143C' : 'inherit',
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
