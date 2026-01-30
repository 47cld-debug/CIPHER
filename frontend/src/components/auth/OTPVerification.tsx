import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, TextField, Button, Typography, Container, Paper } from '@mui/material';
import { authApi } from '../../api/auth';
import { useUI } from '../../contexts/UIContext';
import { useAuth } from '../../contexts/AuthContext';

const OTPVerification: React.FC = () => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { addNotification } = useUI();
  const { login } = useAuth();
  const email = location.state?.email || '';
  const employeeNumber = localStorage.getItem('pending_employee_number') || '';

  useEffect(() => {
    if (!employeeNumber) {
      navigate('/login');
    }
  }, [employeeNumber, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      addNotification({
        id: Date.now().toString(),
        message: 'Please enter a valid 6-digit OTP',
        type: 'error',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await authApi.verifyOTP({
        employee_number: employeeNumber,
        otp,
      });

      if (response.has_admin_access) {
        navigate('/select-role', { state: { employeeNumber } });
      } else {
        // Auto-select USER role
        const loginResponse = await authApi.selectRole({
          employee_number: employeeNumber,
          role: 'USER',
        });
        // Use login function from AuthContext to update state
        login(loginResponse.access_token, loginResponse.user);
        localStorage.removeItem('pending_employee_number');
        navigate('/dashboard');
      }
    } catch (error: any) {
      addNotification({
        id: Date.now().toString(),
        message: error.response?.data?.detail || 'Invalid OTP',
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
          background: 'radial-gradient(circle at 80% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 50%)',
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
              variant="h4"
              component="h1"
              sx={{
                color: 'white',
                fontWeight: 700,
                mb: 1,
              }}
            >
              Verify OTP
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
              Check your email for the code
            </Typography>
          </Box>
          <Box sx={{ p: 5 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4, textAlign: 'center' }}>
              We sent a 6-digit code to <strong>{email}</strong>
            </Typography>
            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
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
                inputProps={{
                  maxLength: 6,
                  style: {
                    textAlign: 'center',
                    fontSize: '32px',
                    letterSpacing: '12px',
                    fontWeight: 600,
                    color: '#DC143C',
                  },
                }}
                placeholder="000000"
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
                disabled={loading || otp.length !== 6}
              >
                {loading ? 'Verifying...' : 'Verify & Continue'}
              </Button>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => navigate('/login')}
                sx={{
                  mt: 1,
                  py: 1.5,
                  borderRadius: 2,
                  textTransform: 'none',
                  borderColor: '#DC143C',
                  color: '#DC143C',
                  '&:hover': {
                    borderColor: '#8B0000',
                    backgroundColor: 'rgba(220, 20, 60, 0.05)',
                  },
                }}
              >
                Back to Login
              </Button>
            </form>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default OTPVerification;
