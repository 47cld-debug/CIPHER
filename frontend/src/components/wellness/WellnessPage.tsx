import React from 'react';
import {
  Box,
  Typography,
  Container,
  Paper,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Chip,
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { useInitiatives, useSessions } from '../../hooks/useApi';

const WellnessPage: React.FC = () => {
  const { data: initiatives = [], isLoading: initiativesLoading, isError: initiativesError, error: initiativesErrorData } = useInitiatives();
  const { data: sessions = [], isLoading: sessionsLoading, isError: sessionsError, error: sessionsErrorData } = useSessions();

  const isLoading = initiativesLoading || sessionsLoading;
  const hasError = initiativesError || sessionsError;

  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('complete') || statusLower.includes('done')) return '#4caf50';
    if (statusLower.includes('scheduled') || statusLower.includes('upcoming')) return '#2196f3';
    if (statusLower.includes('pending') || statusLower.includes('requested')) return '#ff9800';
    return '#9e9e9e';
  };

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <CircularProgress sx={{ color: '#DC143C' }} />
        </Box>
      </Container>
    );
  }

  if (hasError) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper
          elevation={0}
          sx={{
            textAlign: 'center',
            py: 8,
            background: 'linear-gradient(135deg, rgba(220, 20, 60, 0.05) 0%, rgba(255, 107, 53, 0.05) 100%)',
            border: '2px dashed rgba(220, 20, 60, 0.3)',
            borderRadius: 3,
          }}
        >
          <Typography variant="h6" sx={{ color: '#DC143C', mb: 1, fontWeight: 600 }}>
            Error Loading Wellness Data
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {(initiativesErrorData || sessionsErrorData) instanceof Error
              ? (initiativesErrorData || sessionsErrorData)?.message
              : 'Failed to load wellness information. Please try again.'}
          </Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
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
            <FavoriteIcon sx={{ color: 'white', fontSize: 32 }} />
          </Box>
          <Box>
            <Typography
              variant="h4"
              component="h1"
              sx={{
                color: '#DC143C',
                fontWeight: 700,
                mb: 0.5,
                letterSpacing: '-0.5px',
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
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              border: '1px solid rgba(220, 20, 60, 0.1)',
              height: '100%',
            }}
          >
            <Typography variant="h6" sx={{ color: '#DC143C', fontWeight: 600, mb: 3 }}>
              Wellness Initiatives
            </Typography>
            {initiatives.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body2" color="text.secondary">
                  No initiatives available
                </Typography>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {initiatives.map((initiative) => (
                  <Card
                    key={initiative.id}
                    sx={{
                      border: '1px solid rgba(220, 20, 60, 0.1)',
                      borderRadius: 2,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        boxShadow: 4,
                        borderColor: '#DC143C',
                        transform: 'translateY(-2px)',
                      },
                    }}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                        <Typography variant="h6" sx={{ color: '#DC143C', fontWeight: 600, fontSize: '1rem' }}>
                          {initiative.title}
                        </Typography>
                        {initiative.category && (
                          <Chip
                            label={initiative.category}
                            size="small"
                            sx={{ backgroundColor: 'rgba(255, 107, 53, 0.1)', color: '#FF6B35', fontWeight: 600 }}
                          />
                        )}
                      </Box>
                      {initiative.description && (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {initiative.description}
                        </Typography>
                      )}
                      {(initiative.start_date || initiative.end_date) && (
                        <Typography variant="caption" color="text.secondary">
                          {initiative.start_date && `From: ${new Date(initiative.start_date).toLocaleDateString()}`}
                          {initiative.start_date && initiative.end_date && ' • '}
                          {initiative.end_date && `To: ${new Date(initiative.end_date).toLocaleDateString()}`}
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </Box>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              border: '1px solid rgba(220, 20, 60, 0.1)',
              height: '100%',
            }}
          >
            <Typography variant="h6" sx={{ color: '#DC143C', fontWeight: 600, mb: 3 }}>
              My Sessions
            </Typography>
            {sessions.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body2" color="text.secondary">
                  No sessions booked
                </Typography>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {sessions.map((session) => (
                  <Card
                    key={session.id}
                    sx={{
                      border: '1px solid rgba(220, 20, 60, 0.1)',
                      borderRadius: 2,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        boxShadow: 4,
                        borderColor: '#DC143C',
                        transform: 'translateY(-2px)',
                      },
                    }}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                        <Typography variant="h6" sx={{ color: '#DC143C', fontWeight: 600, fontSize: '1rem' }}>
                          {session.initiative.title}
                        </Typography>
                        <Chip
                          label={session.status}
                          size="small"
                          sx={{
                            backgroundColor: `${getStatusColor(session.status)}20`,
                            color: getStatusColor(session.status),
                            fontWeight: 600,
                          }}
                        />
                      </Box>
                      {session.initiative.category && (
                        <Chip
                          label={session.initiative.category}
                          size="small"
                          sx={{ mb: 1, backgroundColor: 'rgba(255, 107, 53, 0.1)', color: '#FF6B35' }}
                        />
                      )}
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                        Requested: {new Date(session.requested_at).toLocaleDateString()}
                      </Typography>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default WellnessPage;
