import React, { useState } from 'react';
import {
  Box,
  Typography,
  Container,
  Paper,
  Button,
  CircularProgress,
  Chip,
  Alert,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useParams, useNavigate } from 'react-router-dom';
import { useInitiativeDetail, useBookSession, useSessions } from '../../hooks/useApi';
import { useUI } from '../../contexts/UIContext';

const InitiativeDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const initiativeId = id ? parseInt(id, 10) : null;
  const { data: detail, isLoading, isError, error, refetch } = useInitiativeDetail(initiativeId);
  const bookSession = useBookSession();
  const { data: sessions = [] } = useSessions();
  const { addNotification } = useUI();
  const [bookSuccess, setBookSuccess] = useState(false);

  const alreadyBooked = initiativeId != null && sessions.some((s) => s.initiative_id === initiativeId);

  const handleBook = async () => {
    if (initiativeId == null) return;
    try {
      await bookSession.mutateAsync(initiativeId);
      setBookSuccess(true);
      refetch();
      addNotification({ id: `book-${Date.now()}`, message: 'Session booked successfully. View it in My Sessions.', type: 'success' });
    } catch (e) {
      addNotification({ id: `book-err-${Date.now()}`, message: e instanceof Error ? e.message : 'Failed to book session', type: 'error' });
    }
  };

  if (initiativeId == null || isNaN(initiativeId)) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography color="error">Invalid initiative ID</Typography>
        <Button onClick={() => navigate('/wellness/initiatives')} sx={{ mt: 2 }}>
          Back to Initiatives
        </Button>
      </Container>
    );
  }

  if (isLoading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
          <CircularProgress sx={{ color: '#DC143C' }} />
        </Box>
      </Container>
    );
  }

  if (isError || !detail) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
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
            Error Loading Initiative
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {error instanceof Error ? error.message : 'Initiative not found.'}
          </Typography>
          <Button variant="contained" onClick={() => navigate('/wellness/initiatives')} sx={{ bgcolor: '#DC143C', '&:hover': { bgcolor: '#B71C1C' } }}>
            Back to Initiatives
          </Button>
        </Paper>
      </Container>
    );
  }

  const canBook = detail.available_slots > 0 && !alreadyBooked && !bookSuccess;

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Box
          component="button"
          onClick={() => navigate('/wellness/initiatives')}
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
          {detail.title}
        </Typography>
        {detail.category && (
          <Chip
            label={detail.category}
            size="small"
            sx={{ backgroundColor: 'rgba(255, 107, 53, 0.1)', color: '#FF6B35', fontWeight: 600 }}
          />
        )}
      </Box>

      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 3,
          border: '1px solid rgba(220, 20, 60, 0.1)',
        }}
      >
        {detail.description && (
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            {detail.description}
          </Typography>
        )}

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
          {detail.session_date && (
            <Typography variant="body2">
              <strong>Date:</strong> {new Date(detail.session_date).toLocaleDateString()}
            </Typography>
          )}
          {detail.session_time && (
            <Typography variant="body2">
              <strong>Time:</strong> {detail.session_time}
            </Typography>
          )}
          {detail.trainer_name && (
            <Typography variant="body2">
              <strong>Trainer:</strong> {detail.trainer_name}
            </Typography>
          )}
          {detail.location && (
            <Typography variant="body2">
              <strong>Location:</strong> {detail.location}
            </Typography>
          )}
        </Box>

        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
          <Typography variant="body2">
            <strong>Total slots:</strong> {detail.total_slots ?? 0}
          </Typography>
          <Typography variant="body2">
            <strong>Booked:</strong> {detail.booked_slots}
          </Typography>
          <Typography variant="body2" sx={{ color: '#DC143C', fontWeight: 600 }}>
            <strong>Available:</strong> {detail.available_slots}
          </Typography>
        </Box>

        {(bookSuccess || alreadyBooked) && (
          <Alert severity="info" sx={{ mb: 2 }}>
            You have already booked this session. View it in My Sessions.
          </Alert>
        )}

        {canBook && (
          <Box sx={{ mt: 2 }}>
            <Button
              variant="contained"
              onClick={handleBook}
              disabled={bookSession.isPending}
              sx={{ bgcolor: '#DC143C', '&:hover': { bgcolor: '#B71C1C' } }}
            >
              {bookSession.isPending ? <CircularProgress size={24} color="inherit" /> : 'Book Session'}
            </Button>
          </Box>
        )}

        {!canBook && detail.available_slots <= 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            No slots available for this session.
          </Typography>
        )}
      </Paper>

      <Button
        variant="outlined"
        onClick={() => navigate('/wellness/sessions')}
        sx={{ mt: 2, borderColor: '#DC143C', color: '#DC143C', '&:hover': { borderColor: '#B71C1C', backgroundColor: 'rgba(220, 20, 60, 0.08)' } }}
      >
        View My Sessions
      </Button>
    </Container>
  );
};

export default InitiativeDetailPage;
