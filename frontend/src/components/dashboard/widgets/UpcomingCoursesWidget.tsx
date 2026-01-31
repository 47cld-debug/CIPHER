import React from 'react';
import { Typography, Box, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
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
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
        <BookOpen size={20} color="#6B7280" />
        <Typography variant="h3" sx={{ fontSize: '16px', fontWeight: 500, color: '#111827' }}>
          Upcoming Courses
        </Typography>
      </Box>

      {data.courses.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 3 }}>
          <Typography variant="body2" sx={{ fontSize: '14px', color: '#6B7280' }}>
            No new courses available
          </Typography>
          <Button
            size="small"
            variant="outlined"
            sx={{ mt: 2, fontSize: '14px', borderColor: '#E5E7EB', color: '#111827' }}
            onClick={() => navigate('/learning')}
          >
            Browse All Courses
          </Button>
        </Box>
      ) : (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            maxHeight: '400px',
            overflowY: 'auto',
            pr: 1,
            '&::-webkit-scrollbar': {
              width: '6px',
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: '#F9FAFB',
              borderRadius: '3px',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: '#D1D5DB',
              borderRadius: '3px',
              '&:hover': {
                backgroundColor: '#9CA3AF',
              },
            },
          }}
        >
          {data.courses.map((course) => (
            <Box
              key={course.id}
              sx={{
                p: 2,
                borderRadius: '12px',
                border: '1px solid #E5E7EB',
                backgroundColor: '#FFFFFF',
                flexShrink: 0,
                transition: 'all 0.2s ease',
                '&:hover': {
                  boxShadow: '0 4px 12px rgba(239, 68, 68, 0.12)',
                  borderColor: '#FCA5A5',
                  backgroundColor: '#FEF2F2',
                  transform: 'translateY(-2px)',
                },
              }}
            >
              <Typography variant="subtitle1" sx={{ fontSize: '14px', fontWeight: 500, color: '#111827', mb: 1 }}>
                {course.title}
              </Typography>
              {course.description && (
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: '14px',
                    color: '#6B7280',
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
              <Button
                size="small"
                variant="contained"
                onClick={(e) => handleEnroll(course.id, e)}
                sx={{
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
                Enroll
              </Button>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default UpcomingCoursesWidget;
