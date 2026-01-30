import React from 'react';
import { Card, CardContent, Typography, Box, Button, Chip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import BookIcon from '@mui/icons-material/Book';
import LaunchIcon from '@mui/icons-material/Launch';
import type { UpcomingCoursesData } from '../../../types/dashboard';
import { learningApi } from '../../../api/learning';
import { useUI } from '../../../contexts/UIContext';

interface UpcomingCoursesWidgetProps {
  data: UpcomingCoursesData;
}

const UpcomingCoursesWidget: React.FC<UpcomingCoursesWidgetProps> = ({ data }) => {
  const navigate = useNavigate();
  const { addNotification } = useUI();

  const handleEnroll = async (courseId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await learningApi.enrollInCourse(courseId);
      addNotification({
        id: Date.now().toString(),
        message: 'Enrolled successfully!',
        type: 'success',
      });
      // Refresh the page to update data
      window.location.reload();
    } catch (error: any) {
      addNotification({
        id: Date.now().toString(),
        message: error.response?.data?.detail || 'Failed to enroll',
        type: 'error',
      });
    }
  };

  return (
    <Card
      sx={{
        height: '100%',
        borderLeft: '4px solid #FF6B35',
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: 6,
          transform: 'translateY(-2px)',
        },
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <BookIcon sx={{ color: '#FF6B35', fontSize: 28 }} />
          <Typography variant="h6" sx={{ color: '#FF6B35', fontWeight: 600 }}>
            Upcoming Courses
          </Typography>
        </Box>

        {data.courses.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <Typography variant="body2" color="text.secondary">
              No new courses available
            </Typography>
            <Button
              size="small"
              variant="outlined"
              sx={{ mt: 2 }}
              onClick={() => navigate('/learning')}
            >
              Browse All Courses
            </Button>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {data.courses.map((course) => (
              <Box
                key={course.id}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: '1px solid rgba(255, 107, 53, 0.2)',
                  backgroundColor: 'rgba(255, 107, 53, 0.05)',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 107, 53, 0.1)',
                    borderColor: '#FF6B35',
                  },
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, flex: 1, color: '#FF6B35' }}>
                    {course.title}
                  </Typography>
                  {course.course_type === 'EXTERNAL' && (
                    <LaunchIcon sx={{ fontSize: 16, color: '#FF6B35', ml: 1 }} />
                  )}
                </Box>
                {course.description && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mb: 1.5,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {course.description}
                  </Typography>
                )}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {course.category && (
                      <Chip
                        label={course.category}
                        size="small"
                        sx={{ backgroundColor: 'rgba(255, 107, 53, 0.1)', color: '#FF6B35', fontSize: '0.7rem' }}
                      />
                    )}
                    {course.provider_name && (
                      <Chip
                        label={course.provider_name}
                        size="small"
                        sx={{ backgroundColor: 'rgba(255, 107, 53, 0.1)', color: '#FF6B35', fontSize: '0.7rem' }}
                      />
                    )}
                  </Box>
                  <Button
                    size="small"
                    variant="contained"
                    onClick={(e) => handleEnroll(course.id, e)}
                    sx={{
                      background: 'linear-gradient(135deg, #FF6B35 0%, #FF8C42 100%)',
                      textTransform: 'none',
                      fontSize: '0.75rem',
                      px: 2,
                      '&:hover': {
                        background: 'linear-gradient(135deg, #DC143C 0%, #FF6B35 100%)',
                      },
                    }}
                  >
                    Enroll
                  </Button>
                </Box>
              </Box>
            ))}
            <Button
              fullWidth
              variant="outlined"
              onClick={() => navigate('/learning')}
              sx={{
                borderColor: '#FF6B35',
                color: '#FF6B35',
                textTransform: 'none',
                '&:hover': {
                  borderColor: '#DC143C',
                  backgroundColor: 'rgba(255, 107, 53, 0.05)',
                },
              }}
            >
              View All Courses
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default UpcomingCoursesWidget;
