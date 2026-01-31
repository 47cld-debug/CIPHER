import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, IconButton } from '@mui/material';
import { Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useUI } from '../../contexts/UIContext';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { toggleSidebar } = useUI();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        background: '#FFFFFF',
        borderBottom: '1px solid #E5E7EB',
      }}
    >
      <Toolbar sx={{ px: { xs: 2, sm: 3 } }}>
        {user && (
          <IconButton
            edge="start"
            onClick={toggleSidebar}
            sx={{
              mr: 2,
              color: '#111827',
              '&:hover': {
                backgroundColor: '#F9FAFB',
              },
            }}
          >
            <Menu size={20} />
          </IconButton>
        )}
        <Typography
          variant="h6"
          component="div"
          sx={{
            flexGrow: 1,
            fontWeight: 600,
            fontSize: '18px',
            color: '#111827',
          }}
        >
          EmpowerX
        </Typography>
        {user && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 400, color: '#111827' }}>
              {user.full_name}
            </Typography>
            <Button
              onClick={handleLogout}
              variant="contained"
              sx={{
                textTransform: 'none',
                fontWeight: 500,
                borderRadius: 10,
                px: 2,
                height: '36px',
                backgroundColor: '#EF4444',
                '&:hover': {
                  backgroundColor: '#DC2626',
                },
              }}
            >
              Logout
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
