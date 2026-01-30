import React, { useState } from 'react';
import {
  Box,
  Typography,
  Container,
  Paper,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Chip,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import { useSessions, useCancelBooking } from '../../hooks/useApi';
import { useUI } from '../../contexts/UIContext';

const MySessionsPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: sessions = [], isLoading, isError, error } = useSessions();
  const cancelBooking = useCancelBooking();
  const { addNotification } = useUI();
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  const handleCancel = async (sessionId: number) => {
    setCancellingId(sessionId);
    try {
      await cancelBooking.mutateAsync(sessionId);
      addNotification({ id: `cancel-${Date.now()}`, message: 'Booking cancelled successfully.', type: 'success' });
    } catch (e) {
      addNotification({ id: `cancel-err-${Date.now()}`, message: e instanceof Error ? e.message : 'Failed to cancel booking', type: 'error' });
    } finally {
      setCancellingId(null);
    }
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
            Error Loading Sessions
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {error instanceof Error ? error.message : 'Failed to load your sessions. Please try again.'}
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
          My Sessions
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
        {sessions.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              No sessions booked
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate('/wellness/initiatives')}
              sx={{ bgcolor: '#DC143C', '&:hover': { bgcolor: '#B71C1C' } }}
            >
              Browse Initiatives
            </Button>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {sessions.map((session) => (
              <Card
                key={session.id}
                elevation={0}
                sx={{
                  border: '1px solid rgba(220, 20, 60, 0.1)',
                  borderRadius: 2,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: 2,
                    borderColor: 'rgba(220, 20, 60, 0.2)',
                  },
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap', gap: 2 }}>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="h6" sx={{ color: '#DC143C', fontWeight: 600, fontSize: '1rem', mb: 1 }}>
                        {session.initiative.title}
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mb: 1 }}>
                        {(session.initiative.session_date || session.requested_at) && (
                          <Typography variant="body2" color="text.secondary">
                            Date: {session.initiative.session_date
                              ? new Date(session.initiative.session_date).toLocaleDateString()
                              : new Date(session.requested_at).toLocaleDateString()}
                            {session.initiative.session_time && ` • ${session.initiative.session_time}`}
                          </Typography>
                        )}
                        {session.initiative.location && (
                          <Typography variant="body2" color="text.secondary">
                            Location: {session.initiative.location}
                          </Typography>
                        )}
                        {session.initiative.trainer_name && (
                          <Typography variant="body2" color="text.secondary">
                            Trainer: {session.initiative.trainer_name}
                          </Typography>
                        )}
                      </Box>
                      {session.initiative.category && (
                        <Chip
                          label={session.initiative.category}
                          size="small"
                          sx={{ backgroundColor: 'rgba(255, 107, 53, 0.1)', color: '#FF6B35', fontWeight: 600 }}
                        />
                      )}
                    </Box>
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      onClick={() => handleCancel(session.id)}
                      disabled={cancellingId !== null}
                      sx={{ borderColor: '#DC143C', color: '#DC143C', flexShrink: 0 }}
                    >
                      {cancellingId === session.id ? <CircularProgress size={20} color="inherit" /> : 'Cancel Booking'}
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default MySessionsPage;
