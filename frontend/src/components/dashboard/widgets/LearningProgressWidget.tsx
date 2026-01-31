import React from 'react';
import { Typography, Box, LinearProgress, Chip, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, CheckCircle, PlayCircle } from 'lucide-react';
import type { LearningProgressData } from '../../../types/dashboard';

interface LearningProgressWidgetProps {
  data: LearningProgressData;
}

const LearningProgressWidget: React.FC<LearningProgressWidgetProps> = ({ data }) => {
  const navigate = useNavigate();

  const getProgressColor = (progress: string) => {
    switch (progress) {
      case 'COMPLETED': return '#16A34A';
      case 'HIGH': return '#16A34A';
      case 'MEDIUM': return '#F59E0B';
      case 'LOW': return '#F59E0B';
      default: return '#6B7280';
    }
  };

  const totalProgress = data.total > 0 
    ? Math.round(((data.completed + data.in_progress) / data.total) * 100)
    : 0;

  const currentCourse = data.recent_courses?.[0];

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
        <GraduationCap size={20} color="#6B7280" />
        <Typography variant="h3" sx={{ fontSize: '16px', fontWeight: 500, color: '#111827' }}>
          Continue Learning
        </Typography>
      </Box>

      {currentCourse ? (
        <>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h3" sx={{ fontSize: '16px', fontWeight: 500, color: '#111827', mb: 1 }}>
              {currentCourse.title}
            </Typography>
            {currentCourse.category && (
              <Typography variant="body2" sx={{ fontSize: '14px', color: '#6B7280', mb: 2 }}>
                {currentCourse.category}
              </Typography>
            )}
            <Box sx={{ mb: 2 }}>
              <LinearProgress
                variant="determinate"
                value={totalProgress}
                sx={{
                  height: 6,
                  borderRadius: '999px',
                  backgroundColor: '#E5E7EB',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: '#EF4444',
                    borderRadius: '999px',
                  },
                }}
              />
            </Box>
          </Box>
          <Button
            variant="contained"
            onClick={() => navigate('/learning')}
            sx={{
              height: '44px',
              borderRadius: '10px',
              backgroundColor: '#EF4444',
              color: '#FFFFFF',
              fontSize: '14px',
              fontWeight: 500,
              textTransform: 'none',
              '&:hover': {
                backgroundColor: '#DC2626',
              },
            }}
          >
            Continue Learning
          </Button>
        </>
      ) : (
        <Box>
          <Typography variant="body2" sx={{ fontSize: '14px', color: '#6B7280', mb: 2 }}>
            No active courses. Start learning today!
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/learning')}
            sx={{
              height: '44px',
              borderRadius: '10px',
              backgroundColor: '#EF4444',
              color: '#FFFFFF',
              fontSize: '14px',
              fontWeight: 500,
              textTransform: 'none',
              '&:hover': {
                backgroundColor: '#DC2626',
              },
            }}
          >
            Browse Courses
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default LearningProgressWidget;
