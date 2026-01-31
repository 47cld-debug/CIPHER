import React from 'react';
import { Card, CardContent, Typography, Box, LinearProgress, Chip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import SchoolIcon from '@mui/icons-material/School';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import type { LearningProgressData } from '../../../types/dashboard';

interface LearningProgressWidgetProps {
  data: LearningProgressData;
}

const LearningProgressWidget: React.FC<LearningProgressWidgetProps> = ({ data }) => {
  const navigate = useNavigate();

  const getProgressColor = (progress: string) => {
    switch (progress) {
      case 'COMPLETED': return '#4caf50';
      case 'HIGH': return '#2196f3';
      case 'MEDIUM': return '#ff9800';
      case 'LOW': return '#ffc107';
      default: return '#9e9e9e';
    }
  };

  const totalProgress = data.total > 0 
    ? Math.round(((data.completed + data.in_progress) / data.total) * 100)
    : 0;

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
        cursor: 'pointer',
      }}
      onClick={() => navigate('/learning')}
    >
      <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 }, '&:last-child': { pb: { xs: 2, sm: 2.5, md: 3 } } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <SchoolIcon sx={{ color: '#DC143C', fontSize: { xs: 24, md: 28 } }} />
          <Typography variant="h6" sx={{ color: '#DC143C', fontWeight: 600, fontSize: { xs: '1rem', md: '1.25rem' } }}>
            Learning Progress
          </Typography>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Overall Progress
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, color: '#DC143C' }}>
              {totalProgress}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={totalProgress}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: 'rgba(220, 20, 60, 0.1)',
              '& .MuiLinearProgress-bar': {
                background: 'linear-gradient(90deg, #DC143C 0%, #FF6B35 100%)',
                borderRadius: 4,
              },
            }}
          />
        </Box>

        <Box sx={{ display: 'flex', gap: { xs: 1.5, md: 2 }, mb: 3, flexWrap: 'wrap' }}>
          <Box
            sx={{
              flex: { xs: '1 1 calc(33.333% - 10px)', sm: 1 },
              minWidth: { xs: '80px', sm: '100px' },
              textAlign: 'center',
              p: { xs: 1.25, md: 1.5 },
              borderRadius: 2,
              backgroundColor: 'rgba(76, 175, 80, 0.1)',
            }}
          >
            <CheckCircleIcon sx={{ color: '#4caf50', fontSize: { xs: 20, md: 24 }, mb: 0.5 }} />
            <Typography variant="h6" sx={{ color: '#4caf50', fontWeight: 700, fontSize: { xs: '1rem', md: '1.25rem' } }}>
              {data.completed}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.65rem', md: '0.75rem' } }}>
              Completed
            </Typography>
          </Box>
          <Box
            sx={{
              flex: { xs: '1 1 calc(33.333% - 10px)', sm: 1 },
              minWidth: { xs: '80px', sm: '100px' },
              textAlign: 'center',
              p: { xs: 1.25, md: 1.5 },
              borderRadius: 2,
              backgroundColor: 'rgba(33, 150, 243, 0.1)',
            }}
          >
            <PlayCircleIcon sx={{ color: '#2196f3', fontSize: { xs: 20, md: 24 }, mb: 0.5 }} />
            <Typography variant="h6" sx={{ color: '#2196f3', fontWeight: 700, fontSize: { xs: '1rem', md: '1.25rem' } }}>
              {data.in_progress}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.65rem', md: '0.75rem' } }}>
              In Progress
            </Typography>
          </Box>
          <Box
            sx={{
              flex: { xs: '1 1 calc(33.333% - 10px)', sm: 1 },
              minWidth: { xs: '80px', sm: '100px' },
              textAlign: 'center',
              p: { xs: 1.25, md: 1.5 },
              borderRadius: 2,
              backgroundColor: 'rgba(158, 158, 158, 0.1)',
            }}
          >
            <SchoolIcon sx={{ color: '#9e9e9e', fontSize: { xs: 20, md: 24 }, mb: 0.5 }} />
            <Typography variant="h6" sx={{ color: '#9e9e9e', fontWeight: 700, fontSize: { xs: '1rem', md: '1.25rem' } }}>
              {data.not_started}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.65rem', md: '0.75rem' } }}>
              Not Started
            </Typography>
          </Box>
        </Box>

        {data.recent_courses.length > 0 && (
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: '#DC143C' }}>
              Recent Courses
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {data.recent_courses.map((course) => (
                <Box
                  key={course.id}
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    backgroundColor: 'rgba(220, 20, 60, 0.05)',
                    border: '1px solid rgba(220, 20, 60, 0.1)',
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500, flex: 1 }}>
                      {course.title}
                    </Typography>
                    <Chip
                      label={course.progress.replace('_', ' ')}
                      size="small"
                      sx={{
                        backgroundColor: `${getProgressColor(course.progress)}20`,
                        color: getProgressColor(course.progress),
                        fontWeight: 600,
                        fontSize: '0.7rem',
                        height: 20,
                      }}
                    />
                  </Box>
                  {course.category && (
                    <Typography variant="caption" color="text.secondary">
                      {course.category}
                    </Typography>
                  )}
                </Box>
              ))}
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default LearningProgressWidget;
