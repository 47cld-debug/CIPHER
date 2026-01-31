import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Chip,
  Box,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Trash2 } from 'lucide-react';
import type { Course, Enrollment } from '../../types/learning';
import ProgressModal from './ProgressModal';
import { learningApi } from '../../api/learning';
import { useUI } from '../../contexts/UIContext';
import { useQueryClient } from '@tanstack/react-query';

interface CourseCardProps {
  course: Course;
  enrollment?: Enrollment;
  onEnroll?: () => void;
  onDelete?: () => void;
}

const CourseCard: React.FC<CourseCardProps> = ({ course, enrollment, onEnroll, onDelete }) => {
  const [progressModalOpen, setProgressModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { addNotification } = useUI();
  const queryClient = useQueryClient();

  const handleCardClick = async () => {
    if (enrollment) {
      setProgressModalOpen(true);
    } else {
      try {
        const newEnrollment = await learningApi.enrollInCourse(course.id, false);
        addNotification({
          id: Date.now().toString(),
          message: `Enrolled in ${course.title}`,
          type: 'success',
        });
        queryClient.invalidateQueries({ queryKey: ['enrollments'] });
      } catch (error: any) {
        addNotification({
          id: Date.now().toString(),
          message: error.response?.data?.detail || 'Failed to enroll',
          type: 'error',
        });
      }
    }
  };

  const handleDelete = async () => {
    if (!enrollment) return;
    
    try {
      await learningApi.deleteEnrollment(enrollment.id);
      addNotification({
        id: Date.now().toString(),
        message: 'Course removed from your learning profile',
        type: 'success',
      });
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
      setDeleteDialogOpen(false);
      if (onDelete) {
        onDelete();
      }
    } catch (error: any) {
      addNotification({
        id: Date.now().toString(),
        message: error.response?.data?.detail || 'Failed to delete enrollment',
        type: 'error',
      });
    }
  };

  const showDeleteButton = enrollment?.auto_enrolled && enrollment.progress_state === 'NOT_STARTED';

  return (
    <>
      <Card
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          cursor: 'pointer',
          borderRadius: '12px',
          border: '1px solid #E5E7EB',
          backgroundColor: '#FFFFFF',
          transition: 'all 0.2s ease',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(239, 68, 68, 0.12)',
            borderColor: '#FCA5A5',
            backgroundColor: '#FEF2F2',
            transform: 'translateY(-2px)',
          },
        }}
        onClick={handleCardClick}
      >
        <CardContent sx={{ flexGrow: 1, p: 3, position: 'relative' }}>
          {showDeleteButton && (
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                setDeleteDialogOpen(true);
              }}
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                color: '#6B7280',
                '&:hover': {
                  backgroundColor: '#F9FAFB',
                },
              }}
            >
              <Trash2 size={16} />
            </IconButton>
          )}
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
            <Typography
              variant="h3"
              component="h2"
              sx={{
                fontSize: '16px',
                fontWeight: 500,
                color: '#111827',
                flex: 1,
                mr: 1,
              }}
            >
              {course.title}
            </Typography>
            {course.course_type === 'EXTERNAL' && (
              <Chip
                label="EXTERNAL"
                size="small"
                sx={{
                  backgroundColor: '#FEF2F2',
                  color: '#EF4444',
                  fontWeight: 500,
                  fontSize: '11px',
                  padding: '4px 8px',
                  borderRadius: '999px',
                  height: 'auto',
                }}
              />
            )}
          </Box>

          {course.provider_name && (
            <Typography variant="caption" sx={{ fontSize: '12px', color: '#6B7280', display: 'block', mb: 2 }}>
              {course.provider_name}
            </Typography>
          )}

          <Typography
            variant="body2"
            sx={{
              fontSize: '14px',
              color: '#6B7280',
              mb: 2,
              lineHeight: 1.6,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {course.description || 'No description available'}
          </Typography>

          {enrollment && (
            <Box sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="caption" sx={{ fontSize: '12px', color: '#6B7280', fontWeight: 400 }}>
                  Progress
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    fontSize: '12px',
                    color: '#111827',
                    fontWeight: 400,
                    textTransform: 'capitalize',
                  }}
                >
                  {enrollment.progress_state.replace('_', ' ')}
                </Typography>
              </Box>
              <Box
                sx={{
                  height: 6,
                  borderRadius: '999px',
                  backgroundColor: '#E5E7EB',
                  overflow: 'hidden',
                }}
              >
                <Box
                  sx={{
                    height: '100%',
                    width: `${(enrollment.progress_state === 'COMPLETED' ? 100 : enrollment.progress_state === 'HIGH' ? 85 : enrollment.progress_state === 'MEDIUM' ? 50 : enrollment.progress_state === 'LOW' ? 15 : 0)}%`,
                    backgroundColor: '#EF4444',
                    transition: 'width 0.3s ease',
                  }}
                />
              </Box>
            </Box>
          )}
        </CardContent>
        <CardActions sx={{ p: 2, pt: 0 }}>
          {enrollment ? (
            <Button
              size="medium"
              variant="contained"
              fullWidth
              sx={{
                borderRadius: '10px',
                textTransform: 'none',
                fontWeight: 500,
                fontSize: '14px',
                height: '44px',
                backgroundColor: '#EF4444',
                '&:hover': {
                  backgroundColor: '#DC2626',
                },
              }}
            >
              Update Progress
            </Button>
          ) : (
            <Button
              size="medium"
              variant="outlined"
              fullWidth
              sx={{
                borderRadius: '10px',
                textTransform: 'none',
                fontWeight: 500,
                fontSize: '14px',
                height: '44px',
                borderColor: '#E5E7EB',
                color: '#111827',
                '&:hover': {
                  borderColor: '#EF4444',
                  backgroundColor: '#FEF2F2',
                },
              }}
            >
              Enroll Now
            </Button>
          )}
        </CardActions>
      </Card>

      {enrollment && (
        <ProgressModal
          open={progressModalOpen}
          onClose={() => {
            setProgressModalOpen(false);
            queryClient.invalidateQueries({ queryKey: ['enrollments'] });
          }}
          course={course}
          enrollmentId={enrollment.id}
          currentProgress={enrollment.progress_state}
        />
      )}

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle sx={{ fontSize: '18px', fontWeight: 600, color: '#111827' }}>
          Remove Course
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ fontSize: '14px', color: '#111827' }}>
            Are you sure you want to remove "{course.title}" from your learning profile?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} sx={{ fontSize: '14px', color: '#6B7280' }}>
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            variant="contained"
            sx={{
              backgroundColor: '#EF4444',
              '&:hover': {
                backgroundColor: '#DC2626',
              },
            }}
          >
            Remove
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CourseCard;
