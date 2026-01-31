import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, TextField, Button, Typography, Container, Paper } from '@mui/material';
import { Briefcase } from 'lucide-react';
import { authApi } from '../../api/auth';
import { useUI } from '../../contexts/UIContext';

const LoginForm: React.FC = () => {
  const [employeeNumber, setEmployeeNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [imageError, setImageError] = useState(false);
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
          <Briefcase size={32} color="#EF4444" />
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
          Welcome Back
        </Typography>
        <Typography
          sx={{
            fontSize: '15px',
            color: '#6B7280',
            mb: 6,
          }}
        >
          Sign in to access your account
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

      {/* Right Section - Login Form */}
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
            Sign In
          </Typography>
          <Typography
            sx={{
              fontSize: '15px',
              color: '#6B7280',
              mb: 4,
            }}
          >
            Enter your employee number to sign in
          </Typography>
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Employee Number"
              value={employeeNumber}
              onChange={(e) => setEmployeeNumber(e.target.value.toUpperCase())}
              required
              autoFocus
              placeholder="e.g., EMP001"
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
                '& .MuiOutlinedInput-input': {
                  fontSize: '14px',
                  padding: '0 14px',
                },
              }}
              InputProps={{
                startAdornment: (
                  <Box sx={{ mr: 1, color: '#6B7280' }}>
                    #
                  </Box>
                ),
              }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{
                height: '44px',
                borderRadius: '10px',
                backgroundColor: '#EF4444',
                color: '#FFFFFF',
                fontSize: '14px',
                fontWeight: 500,
                textTransform: 'none',
                '&:hover': {
                  backgroundColor: '#DC2626',
                },
                '&:disabled': {
                  backgroundColor: '#D1D5DB',
                },
              }}
            >
              {loading ? 'Sending OTP...' : 'Continue'}
            </Button>
          </form>
        </Paper>
      </Box>
    </Box>
  );
};

export default LoginForm;
