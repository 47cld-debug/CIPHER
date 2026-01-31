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
  const { token, user } = useAuth();
  const hasToken = !!token || (typeof window !== 'undefined' && !!localStorage.getItem('access_token'));
  const { data: dashboard, isLoading, isError, error, refetch } = useDashboardData(hasToken);
  const userName = user?.full_name || 'there';

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px', width: '100%' }}>
        <CircularProgress sx={{ color: '#EF4444' }} />
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
            py: 6,
            px: 4,
            backgroundColor: '#FFFFFF',
            border: '1px solid #E5E7EB',
            borderRadius: '12px',
          }}
        >
          <Typography variant="h2" sx={{ fontSize: '18px', fontWeight: 600, color: '#111827', mb: 2 }}>
            Dashboard unavailable
          </Typography>
          <Typography sx={{ fontSize: '14px', color: '#6B7280', mb: 3 }}>
            {message}
          </Typography>
          <Button variant="contained" onClick={() => refetch()} sx={{ backgroundColor: '#EF4444', '&:hover': { backgroundColor: '#DC2626' } }}>
            Retry
          </Button>
        </Card>
      </Box>
    );
  }

  const renderWidget = (widget: UserWidget) => {
    if (!widget.data) {
      return (
        <Card
          sx={{
            height: '100%',
            backgroundColor: '#FFFFFF',
            border: '1px solid #E5E7EB',
            borderRadius: '12px',
            padding: '24px',
          }}
        >
          <Typography variant="h3" sx={{ fontSize: '16px', fontWeight: 500, color: '#111827', mb: 1 }}>
            {widget.widget.name}
          </Typography>
          <Typography variant="body2" sx={{ fontSize: '14px', color: '#6B7280' }}>
            {widget.widget.type}
          </Typography>
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
              backgroundColor: '#FFFFFF',
              border: '1px solid #E5E7EB',
              borderRadius: '12px',
              padding: '24px',
            }}
          >
            <Typography variant="h3" sx={{ fontSize: '16px', fontWeight: 500, color: '#111827' }}>
              {widget.widget.name}
            </Typography>
          </Card>
        );
    }
  };

  // Find the "Continue Learning" widget (learning_progress type)
  const continueLearningWidget = dashboard?.widgets.find(w => w.widget.type === 'learning_progress');
  const otherWidgets = dashboard?.widgets.filter(w => w.widget.type !== 'learning_progress') || [];

  return (
    <Box sx={{ width: '100%', maxWidth: '100%' }}>
      {/* Page Header - NOT A CARD */}
      <Typography
        variant="h1"
        component="h1"
        sx={{
          fontSize: '26px',
          fontWeight: 600,
          color: '#111827',
          mb: 1,
        }}
      >
        Good morning, {userName} 👋
      </Typography>
      <Typography
        variant="body2"
        sx={{
          fontSize: '14px',
          fontWeight: 400,
          color: '#6B7280',
          mb: 4,
        }}
      >
        Here's what matters today
      </Typography>

      {/* Summary Metrics Section - 3 columns */}
      {dashboard && dashboard.widgets.length > 0 && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          {otherWidgets.slice(0, 3).map((widget) => (
            <Grid item xs={12} sm={4} key={widget.id}>
              <Card
                sx={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E5E7EB',
                  borderRadius: '12px',
                  padding: '24px',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.12)',
                    borderColor: '#FCA5A5',
                    backgroundColor: '#FEF2F2',
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                {renderWidget(widget)}
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Hero Section - Continue Learning - Full Width */}
      {continueLearningWidget && (
        <Box
          sx={{
            width: '100%',
            backgroundColor: '#FFFFFF',
            border: '1px solid #E5E7EB',
            padding: '32px',
            borderRadius: '12px',
            mb: 3,
            transition: 'all 0.2s ease',
            '&:hover': {
              boxShadow: '0 4px 12px rgba(239, 68, 68, 0.12)',
              borderColor: '#FCA5A5',
              backgroundColor: '#FEF2F2',
              transform: 'translateY(-2px)',
            },
          }}
        >
          {renderWidget(continueLearningWidget)}
        </Box>
      )}

      {/* Secondary Widgets - 2 columns */}
      {otherWidgets.length > 3 && (
        <Grid container spacing={3}>
          {otherWidgets.slice(3).map((widget) => (
            <Grid item xs={12} md={6} key={widget.id}>
              <Card
                sx={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E5E7EB',
                  borderRadius: '12px',
                  padding: '24px',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.12)',
                    borderColor: '#FCA5A5',
                    backgroundColor: '#FEF2F2',
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                {renderWidget(widget)}
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {(!dashboard || dashboard.widgets.length === 0) && (
        <Card
          sx={{
            textAlign: 'center',
            py: 6,
            px: 4,
            backgroundColor: '#FFFFFF',
            border: '1px solid #E5E7EB',
            borderRadius: '12px',
          }}
        >
          <Typography variant="h2" sx={{ fontSize: '18px', fontWeight: 600, color: '#111827', mb: 2 }}>
            Welcome to Your Dashboard
          </Typography>
          <Typography variant="body1" sx={{ fontSize: '14px', color: '#6B7280', maxWidth: '500px', mx: 'auto' }}>
            No widgets configured yet. Your personalized dashboard widgets will appear here once configured.
          </Typography>
        </Card>
      )}
    </Box>
  );
};

export default Dashboard;
