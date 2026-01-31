import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActionArea,
} from '@mui/material';
import { Heart, Calendar, CalendarDays } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const WellnessPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ width: '100%', maxWidth: '100%' }}>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Heart size={24} color="#EF4444" />
          <Typography
            variant="h1"
            component="h1"
            sx={{
              fontSize: '26px',
              fontWeight: 600,
              color: '#111827',
            }}
          >
            Wellness & Health
          </Typography>
        </Box>
        <Typography
          variant="body2"
          sx={{
            fontSize: '14px',
            color: '#6B7280',
          }}
        >
          Explore wellness initiatives and book sessions
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card
            elevation={0}
            sx={{
              border: '1px solid #E5E7EB',
              borderRadius: '12px',
              backgroundColor: '#FFFFFF',
              transition: 'all 0.2s ease',
              '&:hover': {
                boxShadow: '0 4px 12px rgba(239, 68, 68, 0.12)',
                borderColor: '#FCA5A5',
                backgroundColor: '#FEF2F2',
                transform: 'translateY(-2px)',
              },
            }}
          >
            <CardActionArea onClick={() => navigate('/wellness/initiatives')} sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: '12px',
                    backgroundColor: '#F9FAFB',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Calendar size={20} color="#6B7280" />
                </Box>
                <Typography variant="h3" sx={{ fontSize: '16px', fontWeight: 500, color: '#111827' }}>
                  Wellness Initiatives
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ fontSize: '14px', color: '#6B7280' }}>
                View all wellness programs organized by the organization. Daily exercise, yoga, counseling, and more.
              </Typography>
            </CardActionArea>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card
            elevation={0}
            sx={{
              border: '1px solid #E5E7EB',
              borderRadius: '12px',
              backgroundColor: '#FFFFFF',
              transition: 'all 0.2s ease',
              '&:hover': {
                boxShadow: '0 4px 12px rgba(239, 68, 68, 0.12)',
                borderColor: '#FCA5A5',
                backgroundColor: '#FEF2F2',
                transform: 'translateY(-2px)',
              },
            }}
          >
            <CardActionArea onClick={() => navigate('/wellness/sessions')} sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: '12px',
                    backgroundColor: '#F9FAFB',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <CalendarDays size={20} color="#6B7280" />
                </Box>
                <Typography variant="h3" sx={{ fontSize: '16px', fontWeight: 500, color: '#111827' }}>
                  My Sessions
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ fontSize: '14px', color: '#6B7280' }}>
                View and manage all sessions you have booked. Cancel bookings if needed.
              </Typography>
            </CardActionArea>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default WellnessPage;
