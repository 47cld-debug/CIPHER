import React from 'react';
import { Box, Typography, Grid, CircularProgress, Card, Button } from '@mui/material';
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
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px', width: '100%' }}>
        <CircularProgress sx={{ color: '#DC143C' }} />
      </Box>
    );
  }

  if (isError) {
    const message = (error as any)?.response?.data?.detail ?? 'Failed to load dashboard';
    return (
      <Box sx={{ width: '100%' }}>
        <Card
          sx={{
            textAlign: 'center',
            py: { xs: 4, md: 6 },
            px: { xs: 2, md: 3 },
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
      </Box>
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
    <Box sx={{ width: '100%', maxWidth: '100%' }}>
      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        sx={{
          color: '#DC143C',
          fontWeight: 700,
          mb: { xs: 3, md: 4 },
          letterSpacing: '-0.5px',
        }}
      >
        Dashboard
      </Typography>
      <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }}>
        {dashboard?.widgets.map((widget) => (
          <Grid item xs={12} sm={12} md={6} lg={4} key={widget.id}>
            {renderWidget(widget)}
          </Grid>
        ))}
        {(!dashboard || dashboard.widgets.length === 0) && (
          <Grid item xs={12}>
            <Card
              sx={{
                textAlign: 'center',
                py: { xs: 6, md: 8 },
                px: { xs: 2, md: 4 },
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
    </Box>
  );
};

export default Dashboard;
