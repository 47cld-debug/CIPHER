import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, TextField, Button, Typography, Container, Paper } from '@mui/material';
import { authApi } from '../../api/auth';
import { useUI } from '../../contexts/UIContext';

const LoginForm: React.FC = () => {
  const [employeeNumber, setEmployeeNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { addNotification } = useUI();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeNumber.trim()) {
      addNotification({
        id: Date.now().toString(),
        message: 'Please enter your employee number',
        type: 'error',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await authApi.requestOTP({ employee_number: employeeNumber });
      localStorage.setItem('pending_employee_number', employeeNumber);
      navigate('/verify-otp', { state: { email: response.email } });
    } catch (error: any) {
      addNotification({
        id: Date.now().toString(),
        message: error.response?.data?.detail || 'Failed to send OTP',
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
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 50%)',
        },
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
              variant="h3"
              component="h1"
              sx={{
                color: 'white',
                fontWeight: 700,
                mb: 1,
                letterSpacing: '-0.5px',
              }}
            >
              Employee Portal
            </Typography>
            <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
              Welcome back
            </Typography>
          </Box>
          <Box sx={{ p: 5 }}>
            <Typography variant="h6" sx={{ color: '#DC143C', fontWeight: 600, mb: 1 }}>
              Sign In
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
              Enter your employee number to receive a one-time password
            </Typography>
            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Employee Number"
                value={employeeNumber}
                onChange={(e) => setEmployeeNumber(e.target.value.toUpperCase())}
                margin="normal"
                required
                autoFocus
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover fieldset': {
                      borderColor: '#DC143C',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#DC143C',
                    },
                  },
                }}
                placeholder="e.g., EMP001"
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                sx={{
                  mt: 4,
                  mb: 2,
                  py: 1.5,
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
                disabled={loading}
              >
                {loading ? 'Sending OTP...' : 'Continue'}
              </Button>
            </form>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default LoginForm;
