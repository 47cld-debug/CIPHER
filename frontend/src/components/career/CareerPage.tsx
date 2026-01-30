import React from 'react';
import { Box, Typography, Container, Paper, Grid, Card, CardContent, CircularProgress, Chip } from '@mui/material';
import WorkIcon from '@mui/icons-material/Work';
import { useGoals, useAppraisals } from '../../hooks/useApi';

const CareerPage: React.FC = () => {
  const { data: goals = [], isLoading: goalsLoading, isError: goalsError, error: goalsErrorData } = useGoals();
  const { data: appraisals = [], isLoading: appraisalsLoading, isError: appraisalsError, error: appraisalsErrorData } = useAppraisals();

  const isLoading = goalsLoading || appraisalsLoading;
  const hasError = goalsError || appraisalsError;

  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('complete') || statusLower.includes('done')) return '#4caf50';
    if (statusLower.includes('progress') || statusLower.includes('active')) return '#ff9800';
    if (statusLower.includes('pending') || statusLower.includes('draft')) return '#9e9e9e';
    return '#2196f3';
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
            Error Loading Career Data
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {(goalsErrorData || appraisalsErrorData) instanceof Error
              ? (goalsErrorData || appraisalsErrorData)?.message
              : 'Failed to load career information. Please try again.'}
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
            <WorkIcon sx={{ color: 'white', fontSize: 32 }} />
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
              Career Development
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Track your goals and performance reviews
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
              Career Goals
            </Typography>
            {goals.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body2" color="text.secondary">
                  No goals set yet
                </Typography>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {goals.map((goal) => (
                  <Card
                    key={goal.id}
                    sx={{
                      border: '1px solid rgba(220, 20, 60, 0.1)',
                      borderRadius: 2,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        boxShadow: 4,
                        borderColor: '#DC143C',
                      },
                    }}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                        <Typography variant="h6" sx={{ color: '#DC143C', fontWeight: 600, fontSize: '1rem' }}>
                          {goal.title}
                        </Typography>
                        <Chip
                          label={goal.status}
                          size="small"
                          sx={{
                            backgroundColor: `${getStatusColor(goal.status)}20`,
                            color: getStatusColor(goal.status),
                            fontWeight: 600,
                          }}
                        />
                      </Box>
                      {goal.description && (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {goal.description}
                        </Typography>
                      )}
                      {goal.target_date && (
                        <Typography variant="caption" color="text.secondary">
                          Target: {new Date(goal.target_date).toLocaleDateString()}
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
              Performance Appraisals
            </Typography>
            {appraisals.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body2" color="text.secondary">
                  No appraisals available
                </Typography>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {appraisals.map((appraisal) => (
                  <Card
                    key={appraisal.id}
                    sx={{
                      border: '1px solid rgba(220, 20, 60, 0.1)',
                      borderRadius: 2,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        boxShadow: 4,
                        borderColor: '#DC143C',
                      },
                    }}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                        <Typography variant="h6" sx={{ color: '#DC143C', fontWeight: 600, fontSize: '1rem' }}>
                          {appraisal.period}
                        </Typography>
                        <Chip
                          label={appraisal.status}
                          size="small"
                          sx={{
                            backgroundColor: `${getStatusColor(appraisal.status)}20`,
                            color: getStatusColor(appraisal.status),
                            fontWeight: 600,
                          }}
                        />
                      </Box>
                      {appraisal.self_review && (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          <strong>Self Review:</strong> {appraisal.self_review}
                        </Typography>
                      )}
                      {appraisal.manager_feedback && (
                        <Typography variant="body2" color="text.secondary">
                          <strong>Manager Feedback:</strong> {appraisal.manager_feedback}
                        </Typography>
                      )}
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

export default CareerPage;
