import React from 'react';
import {
  Box,
  Typography,
  Container,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  CircularProgress,
  Chip,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import { useInitiatives } from '../../hooks/useApi';

const InitiativesListPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: initiatives = [], isLoading, isError, error } = useInitiatives();

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <CircularProgress sx={{ color: '#DC143C' }} />
        </Box>
      </Container>
    );
  }

  if (isError) {
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
            Error Loading Initiatives
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {error instanceof Error ? error.message : 'Failed to load initiatives. Please try again.'}
          </Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Box
          component="button"
          onClick={() => navigate('/wellness')}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 1,
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            borderRadius: 1,
            '&:hover': { backgroundColor: 'rgba(220, 20, 60, 0.08)' },
          }}
        >
          <ArrowBackIcon sx={{ color: '#DC143C' }} />
        </Box>
        <Typography variant="h5" sx={{ color: '#DC143C', fontWeight: 600 }}>
          Wellness Initiatives
        </Typography>
      </Box>

      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 3,
          border: '1px solid rgba(220, 20, 60, 0.1)',
        }}
      >
        {initiatives.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <Typography variant="body2" color="text.secondary">
              No initiatives available
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={2}>
            {initiatives.map((initiative) => (
              <Grid item xs={12} sm={6} md={4} key={initiative.id}>
                <Card
                  elevation={0}
                  sx={{
                    border: '1px solid rgba(220, 20, 60, 0.1)',
                    borderRadius: 2,
                    transition: 'all 0.3s ease',
                    height: '100%',
                    '&:hover': {
                      boxShadow: 4,
                      borderColor: '#DC143C',
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  <CardActionArea onClick={() => navigate(`/wellness/initiatives/${initiative.id}`)} sx={{ height: '100%' }}>
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
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }} noWrap>
                          {initiative.description}
                        </Typography>
                      )}
                      {initiative.total_slots != null && (initiative.available_slots != null || initiative.booked_slots != null) && (
                        <Typography variant="caption" color="text.secondary">
                          Slots: {initiative.available_slots ?? (initiative.total_slots - (initiative.booked_slots ?? 0))} / {initiative.total_slots} available
                        </Typography>
                      )}
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>
    </Container>
  );
};

export default InitiativesListPage;
