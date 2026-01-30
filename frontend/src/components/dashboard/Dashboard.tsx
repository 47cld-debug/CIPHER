import React from 'react';
import { Box, Typography, Container, Grid, CircularProgress, Card, Button } from '@mui/material';
import { useDashboard as useDashboardData } from '../../hooks/useApi';
import { useAuth } from '../../contexts/AuthContext';
import LearningProgressWidget from './widgets/LearningProgressWidget';
import UpcomingCoursesWidget from './widgets/UpcomingCoursesWidget';
import CareerGoalsWidget from './widgets/CareerGoalsWidget';
import ComplianceRemindersWidget from './widgets/ComplianceRemindersWidget';
import WellnessInitiativesWidget from './widgets/WellnessInitiativesWidget';
import type { UserWidget } from '../../types/dashboard';

const Dashboard: React.FC = () => {
  const { token } = useAuth();
  const hasToken = !!token || (typeof window !== 'undefined' && !!localStorage.getItem('access_token'));
  const { data: dashboard, isLoading, isError, error, refetch } = useDashboardData(hasToken);

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
    const message = (error as any)?.response?.data?.detail ?? 'Failed to load dashboard';
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Card
          sx={{
            textAlign: 'center',
            py: 6,
            px: 3,
            borderLeft: '4px solid #DC143C',
            borderRadius: 3,
          }}
        >
          <Typography variant="h6" sx={{ color: '#DC143C', mb: 2, fontWeight: 600 }}>
            Dashboard unavailable
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            {message}
          </Typography>
          <Button variant="contained" onClick={() => refetch()} sx={{ bgcolor: '#DC143C', '&:hover': { bgcolor: '#8B0000' } }}>
            Retry
          </Button>
        </Card>
      </Container>
    );
  }

  const renderWidget = (widget: UserWidget) => {
    if (!widget.data) {
      // Fallback for widgets without data
      return (
        <Card
          sx={{
            height: '100%',
            borderLeft: '4px solid #DC143C',
            transition: 'all 0.3s ease',
            '&:hover': {
              boxShadow: 6,
              transform: 'translateY(-2px)',
            },
          }}
        >
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ color: '#DC143C', fontWeight: 600, mb: 1 }}>
              {widget.widget.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {widget.widget.type}
            </Typography>
          </Box>
        </Card>
      );
    }

    switch (widget.widget.type) {
      case 'learning_progress':
        return <LearningProgressWidget data={widget.data as any} />;
      case 'upcoming_courses':
        return <UpcomingCoursesWidget data={widget.data as any} />;
      case 'career_goals':
        return <CareerGoalsWidget data={widget.data as any} />;
      case 'compliance_reminders':
        return <ComplianceRemindersWidget data={widget.data as any} />;
      case 'wellness_initiatives':
        return <WellnessInitiativesWidget data={widget.data as any} />;
      default:
        return (
          <Card
            sx={{
              height: '100%',
              borderLeft: '4px solid #DC143C',
            }}
          >
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ color: '#DC143C', fontWeight: 600 }}>
                {widget.widget.name}
              </Typography>
            </Box>
          </Card>
        );
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        sx={{
          color: '#DC143C',
          fontWeight: 700,
          mb: 4,
          letterSpacing: '-0.5px',
        }}
      >
        Dashboard
      </Typography>
      <Grid container spacing={3}>
        {dashboard?.widgets.map((widget) => (
          <Grid item xs={12} md={6} lg={4} key={widget.id}>
            {renderWidget(widget)}
          </Grid>
        ))}
        {(!dashboard || dashboard.widgets.length === 0) && (
          <Grid item xs={12}>
            <Card
              sx={{
                textAlign: 'center',
                py: 8,
                background: 'linear-gradient(135deg, rgba(220, 20, 60, 0.05) 0%, rgba(255, 107, 53, 0.05) 100%)',
                border: '2px dashed rgba(220, 20, 60, 0.3)',
                borderRadius: 3,
              }}
            >
              <Typography variant="h6" sx={{ color: '#DC143C', mb: 2, fontWeight: 600 }}>
                Welcome to Your Dashboard
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ maxWidth: '500px', mx: 'auto' }}>
                No widgets configured yet. Your personalized dashboard widgets will appear here once configured.
              </Typography>
            </Card>
          </Grid>
        )}
      </Grid>
    </Container>
  );
};

export default Dashboard;
