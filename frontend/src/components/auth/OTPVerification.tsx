import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, TextField, Button, Typography, Container, Paper } from '@mui/material';
import { Shield } from 'lucide-react';
import { authApi } from '../../api/auth';
import { useUI } from '../../contexts/UIContext';
import { useAuth } from '../../contexts/AuthContext';

const OTPVerification: React.FC = () => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [imageError, setImageError] = useState(false);
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
        backgroundColor: '#F9FAFB',
      }}
    >
      {/* Left Section - Illustration/Brand */}
      <Box
        sx={{
          width: '50%',
          backgroundColor: '#FFFFFF',
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          p: 6,
        }}
      >
        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Shield size={32} color="#EF4444" />
          <Typography
            variant="h4"
            sx={{
              fontSize: '32px',
              fontWeight: 600,
              color: '#111827',
            }}
          >
            EmpowerX
          </Typography>
        </Box>
        <Typography
          variant="h5"
          sx={{
            fontSize: '32px',
            fontWeight: 600,
            color: '#111827',
            mb: 1,
          }}
        >
          Verify Your Identity
        </Typography>
        <Typography
          sx={{
            fontSize: '15px',
            color: '#6B7280',
            mb: 6,
          }}
        >
          Enter the code sent to your email
        </Typography>
        {/* Office Meeting Illustration - GIF */}
        <Box
          sx={{
            width: '100%',
            maxWidth: '500px',
            height: '400px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            borderRadius: '12px',
            backgroundColor: '#F9FAFB',
          }}
        >
          {!imageError ? (
            <img
              src="/office-meeting.gif"
              alt="Office meeting illustration"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
              }}
              onError={() => setImageError(true)}
            />
          ) : (
            <Box
              sx={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#F9FAFB',
                border: '1px dashed #E5E7EB',
                borderRadius: '12px',
              }}
            >
              <Typography variant="body2" sx={{ color: '#6B7280', textAlign: 'center', px: 2 }}>
                Place office-meeting.gif in the frontend/public folder
              </Typography>
            </Box>
          )}
        </Box>
      </Box>

      {/* Right Section - OTP Form */}
      <Box
        sx={{
          width: { xs: '100%', md: '50%' },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 4,
        }}
      >
        <Paper
          elevation={0}
          sx={{
            width: '100%',
            maxWidth: '400px',
            borderRadius: '16px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
            p: 4,
            backgroundColor: '#FFFFFF',
          }}
        >
          <Typography
            variant="h5"
            sx={{
              fontSize: '26px',
              fontWeight: 600,
              color: '#111827',
              mb: 1,
            }}
          >
            Verify OTP
          </Typography>
          <Typography
            sx={{
              fontSize: '15px',
              color: '#6B7280',
              mb: 4,
            }}
          >
            Check your email for the code
          </Typography>
          <Typography
            variant="body2"
            sx={{
              fontSize: '14px',
              color: '#6B7280',
              mb: 4,
              textAlign: 'center',
            }}
          >
            We sent a 6-digit code to <strong>{email}</strong>
          </Typography>
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              required
              autoFocus
              sx={{
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  height: '44px',
                  borderRadius: '10px',
                  '& fieldset': {
                    borderColor: '#E5E7EB',
                  },
                  '&:hover fieldset': {
                    borderColor: '#E5E7EB',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#EF4444',
                    borderWidth: '1px',
                  },
                },
                '& .MuiInputLabel-root': {
                  fontSize: '14px',
                },
              }}
              inputProps={{
                maxLength: 6,
                style: {
                  textAlign: 'center',
                  fontSize: '32px',
                  letterSpacing: '12px',
                  fontWeight: 600,
                  color: '#111827',
                },
              }}
              placeholder="000000"
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading || otp.length !== 6}
              sx={{
                height: '44px',
                borderRadius: '10px',
                backgroundColor: '#EF4444',
                color: '#FFFFFF',
                fontSize: '14px',
                fontWeight: 500,
                textTransform: 'none',
                mb: 2,
                '&:hover': {
                  backgroundColor: '#DC2626',
                },
                '&:disabled': {
                  backgroundColor: '#D1D5DB',
                },
              }}
            >
              {loading ? 'Verifying...' : 'Verify & Continue'}
            </Button>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => navigate('/login')}
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
              }}
            >
              Back to Login
            </Button>
          </form>
        </Paper>
      </Box>
    </Box>
  );
};

export default OTPVerification;
