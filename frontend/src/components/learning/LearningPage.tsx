import React from 'react';
import { Box, Typography, Container, Paper } from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import CourseList from './CourseList';
import RecommendationsSection from './RecommendationsSection';
import AILearningPrompt from './AILearningPrompt';
import { useRecommendations } from '../../hooks/useApi';

const LearningPage: React.FC = () => {
  const { data: recommendations = [], isLoading: recommendationsLoading, isError: recommendationsError } = useRecommendations();

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
            <SchoolIcon sx={{ color: 'white', fontSize: 32 }} />
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
              Learning & Development
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Explore courses and enhance your skills
            </Typography>
          </Box>
        </Box>
      </Paper>
      <AILearningPrompt />
      <RecommendationsSection
        recommendations={recommendations}
        isLoading={recommendationsLoading}
        isError={recommendationsError}
      />
      <CourseList />
    </Container>
  );
};

export default LearningPage;
