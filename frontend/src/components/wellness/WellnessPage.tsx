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
import FavoriteIcon from '@mui/icons-material/Favorite';
import EventIcon from '@mui/icons-material/Event';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { useNavigate } from 'react-router-dom';

const WellnessPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ width: '100%', maxWidth: '100%' }}>
      <Paper
        elevation={0}
        sx={{
          background: 'linear-gradient(135deg, rgba(220, 20, 60, 0.05) 0%, rgba(255, 107, 53, 0.05) 100%)',
          p: 4,
          mb: 4,
          borderRadius: 3,
          border: '1px solid rgba(220, 20, 60, 0.1)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, flexWrap: { xs: 'wrap', sm: 'nowrap' } }}>
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              background: 'linear-gradient(135deg, #DC143C 0%, #FF6B35 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <FavoriteIcon sx={{ color: 'white', fontSize: { xs: 28, md: 32 } }} />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="h4"
              component="h1"
              sx={{
                color: '#DC143C',
                fontWeight: 700,
                mb: 0.5,
                letterSpacing: '-0.5px',
                fontSize: { xs: '1.75rem', md: '2.125rem' },
              }}
            >
              Wellness & Health
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Explore wellness initiatives and book sessions
            </Typography>
          </Box>
        </Box>
      </Paper>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card
            elevation={0}
            sx={{
              border: '1px solid rgba(220, 20, 60, 0.1)',
              borderRadius: 3,
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: 4,
                borderColor: '#DC143C',
                transform: 'translateY(-2px)',
              },
            }}
          >
            <CardActionArea onClick={() => navigate('/wellness/initiatives')} sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, #DC143C 0%, #FF6B35 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <EventIcon sx={{ color: 'white', fontSize: 28 }} />
                </Box>
                <Typography variant="h5" sx={{ color: '#DC143C', fontWeight: 600 }}>
                  Wellness Initiatives
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                View all wellness programs organized by the organization. Daily exercise, yoga, counseling, and more.
              </Typography>
            </CardActionArea>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card
            elevation={0}
            sx={{
              border: '1px solid rgba(220, 20, 60, 0.1)',
              borderRadius: 3,
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: 4,
                borderColor: '#DC143C',
                transform: 'translateY(-2px)',
              },
            }}
          >
            <CardActionArea onClick={() => navigate('/wellness/sessions')} sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, #DC143C 0%, #FF6B35 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <CalendarTodayIcon sx={{ color: 'white', fontSize: 28 }} />
                </Box>
                <Typography variant="h5" sx={{ color: '#DC143C', fontWeight: 600 }}>
                  My Sessions
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
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
