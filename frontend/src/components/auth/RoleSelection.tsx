import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Button, Typography, Container, Paper } from '@mui/material';
import { authApi } from '../../api/auth';
import { useUI } from '../../contexts/UIContext';
import { useAuth } from '../../contexts/AuthContext';

const RoleSelection: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { addNotification } = useUI();
  const { login } = useAuth();
  const employeeNumber = location.state?.employeeNumber || localStorage.getItem('pending_employee_number') || '';

  const handleRoleSelect = async (role: 'ADMIN' | 'USER') => {
    setLoading(true);
    try {
      const response = await authApi.selectRole({
        employee_number: employeeNumber,
        role,
      });
      // Use login function from AuthContext to update state
      login(response.access_token, response.user);
      localStorage.removeItem('pending_employee_number');
      
      if (role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (error: any) {
      addNotification({
        id: Date.now().toString(),
        message: error.response?.data?.detail || 'Failed to login',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #8B0000 0%, #DC143C 50%, #FF6B35 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
        <Paper
          elevation={24}
          sx={{
            p: 0,
            width: '100%',
            borderRadius: 4,
            overflow: 'hidden',
            background: 'white',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          }}
        >
          <Box
            sx={{
              background: 'linear-gradient(135deg, #DC143C 0%, #FF6B35 100%)',
              p: 4,
              textAlign: 'center',
            }}
          >
            <Typography
              variant="h4"
              component="h1"
              sx={{
                color: 'white',
                fontWeight: 700,
                mb: 1,
              }}
            >
              Select Your Role
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
              Choose how you want to access the portal
            </Typography>
          </Box>
          <Box sx={{ p: 5, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              You have admin privileges. Select your preferred access level:
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Button
                variant="contained"
                size="large"
                onClick={() => handleRoleSelect('ADMIN')}
                disabled={loading}
                sx={{
                  py: 2.5,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontSize: '1rem',
                  fontWeight: 600,
                  background: 'linear-gradient(135deg, #DC143C 0%, #FF6B35 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #8B0000 0%, #DC143C 100%)',
                    transform: 'translateY(-2px)',
                    boxShadow: 4,
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                Continue as Admin
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => handleRoleSelect('USER')}
                disabled={loading}
                sx={{
                  py: 2.5,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontSize: '1rem',
                  fontWeight: 600,
                  borderColor: '#DC143C',
                  borderWidth: 2,
                  color: '#DC143C',
                  '&:hover': {
                    borderColor: '#8B0000',
                    borderWidth: 2,
                    backgroundColor: 'rgba(220, 20, 60, 0.05)',
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                Continue as Employee
              </Button>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default RoleSelection;
