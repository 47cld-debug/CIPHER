import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Chip,
} from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import { Recommendation } from '../../types/learning';
import { learningApi } from '../../api/learning';
import { useUI } from '../../contexts/UIContext';
import { useNavigate } from 'react-router-dom';

interface RecommendationsSectionProps {
  recommendations: Recommendation[];
  isLoading: boolean;
  isError: boolean;
}

const RecommendationsSection: React.FC<RecommendationsSectionProps> = ({
  recommendations,
  isLoading,
  isError,
}) => {
  const { addNotification } = useUI();
  const navigate = useNavigate();

  const handleEnrollFromRecommendation = async (title: string) => {
    try {
      // First, get all courses to find the matching one
      const courses = await learningApi.getCourses({ search: title });
      if (courses.length > 0) {
        await learningApi.enrollInCourse(courses[0].id);
        addNotification({
          id: Date.now().toString(),
          message: `Enrolled in ${title}!`,
          type: 'success',
        });
        navigate('/learning');
      } else {
        addNotification({
          id: Date.now().toString(),
          message: 'Course not found. Please browse courses to enroll.',
          type: 'info',
        });
      }
    } catch (error: any) {
      addNotification({
        id: Date.now().toString(),
        message: error.response?.data?.detail || 'Failed to enroll in course',
        type: 'error',
      });
    }
  };

  if (isLoading) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 4,
          borderRadius: 3,
          border: '1px solid rgba(220, 20, 60, 0.1)',
          background: 'linear-gradient(135deg, rgba(220, 20, 60, 0.05) 0%, rgba(255, 107, 53, 0.05) 100%)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <SchoolIcon sx={{ color: '#DC143C', fontSize: 28 }} />
          <Typography variant="h6" sx={{ color: '#DC143C', fontWeight: 600 }}>
            AI Learning Recommendations
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress sx={{ color: '#DC143C' }} />
        </Box>
      </Paper>
    );
  }

  if (isError) {
    return null; // Fail silently, don't show error state
  }

  if (recommendations.length === 0) {
    return null; // Don't show section if no recommendations
  }

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        mb: 4,
        borderRadius: 3,
        border: '1px solid rgba(220, 20, 60, 0.1)',
        background: 'linear-gradient(135deg, rgba(220, 20, 60, 0.05) 0%, rgba(255, 107, 53, 0.05) 100%)',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <SchoolIcon sx={{ color: '#DC143C', fontSize: 28 }} />
        <Typography variant="h6" sx={{ color: '#DC143C', fontWeight: 600 }}>
          AI Learning Recommendations
        </Typography>
        <Chip
          label="Personalized"
          size="small"
          sx={{
            bgcolor: 'rgba(220, 20, 60, 0.1)',
            color: '#DC143C',
            fontWeight: 600,
          }}
        />
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Based on your skills, completed courses, and career goals
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {recommendations.map((rec, index) => (
          <Card
            key={index}
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
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" sx={{ color: '#DC143C', fontWeight: 600, mb: 1, fontSize: '1.1rem' }}>
                    {rec.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {rec.description}
                  </Typography>
                </Box>
              </Box>
              <Button
                variant="outlined"
                size="small"
                onClick={() => handleEnrollFromRecommendation(rec.title)}
                sx={{
                  mt: 2,
                  borderColor: '#DC143C',
                  color: '#DC143C',
                  '&:hover': {
                    borderColor: '#B0122A',
                    bgcolor: 'rgba(220, 20, 60, 0.05)',
                  },
                }}
              >
                Enroll Now
              </Button>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Paper>
  );
};

export default RecommendationsSection;
