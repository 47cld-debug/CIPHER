import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Button, Typography, Container, Paper } from '@mui/material';
import { Shield, User } from 'lucide-react';
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
        backgroundColor: '#F9FAFB',
        alignItems: 'center',
        justifyContent: 'center',
        p: 4,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={0}
          sx={{
            width: '100%',
            borderRadius: '16px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
            overflow: 'hidden',
            backgroundColor: '#FFFFFF',
          }}
        >
          <Box
            sx={{
              p: 4,
              textAlign: 'center',
              backgroundColor: '#FFFFFF',
              borderBottom: '1px solid #E5E7EB',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 2 }}>
              <Shield size={32} color="#EF4444" />
              <Typography
                variant="h4"
                component="h1"
                sx={{
                  fontSize: '26px',
                  fontWeight: 600,
                  color: '#111827',
                }}
              >
                Select Your Role
              </Typography>
            </Box>
            <Typography
              variant="body2"
              sx={{
                fontSize: '14px',
                color: '#6B7280',
              }}
            >
              You have admin privileges. Choose how you want to access EmpowerX
            </Typography>
          </Box>
          <Box sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Button
                variant="contained"
                size="large"
                onClick={() => handleRoleSelect('ADMIN')}
                disabled={loading}
                startIcon={<Shield size={20} />}
                sx={{
                  height: '44px',
                  borderRadius: '10px',
                  textTransform: 'none',
                  fontSize: '14px',
                  fontWeight: 500,
                  backgroundColor: '#EF4444',
                  color: '#FFFFFF',
                  '&:hover': {
                    backgroundColor: '#DC2626',
                  },
                  '&:disabled': {
                    backgroundColor: '#D1D5DB',
                    color: '#9CA3AF',
                  },
                }}
              >
                Continue as Admin
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => handleRoleSelect('USER')}
                disabled={loading}
                startIcon={<User size={20} />}
                sx={{
                  height: '44px',
                  borderRadius: '10px',
                  textTransform: 'none',
                  fontSize: '14px',
                  fontWeight: 500,
                  borderColor: '#E5E7EB',
                  color: '#111827',
                  '&:hover': {
                    borderColor: '#EF4444',
                    backgroundColor: '#FEF2F2',
                  },
                  '&:disabled': {
                    borderColor: '#D1D5DB',
                    color: '#9CA3AF',
                  },
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
