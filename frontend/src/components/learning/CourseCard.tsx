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
import DeleteIcon from '@mui/icons-material/Delete';
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
      // Auto-enroll and show progress modal
      try {
        const newEnrollment = await learningApi.enrollInCourse(course.id, false);
        addNotification({
          id: Date.now().toString(),
          message: `Enrolled in ${course.title}`,
          type: 'success',
        });
        queryClient.invalidateQueries({ queryKey: ['enrollments'] });
        // Show progress modal after enrollment
        setTimeout(() => {
          setProgressModalOpen(true);
        }, 100);
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

  const getProgressColor = (progress: string) => {
    const colors: Record<string, string> = {
      NOT_STARTED: '#9e9e9e',
      LOW: '#ff9800',
      MEDIUM: '#ffc107',
      HIGH: '#4caf50',
      COMPLETED: '#2196f3',
    };
    return colors[progress] || '#9e9e9e';
  };

  return (
    <>
      <Card
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          cursor: 'pointer',
          borderRadius: 3,
          border: '1px solid rgba(220, 20, 60, 0.1)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-8px)',
            boxShadow: '0 12px 24px rgba(220, 20, 60, 0.15)',
            borderColor: '#DC143C',
          },
        }}
        onClick={handleCardClick}
      >
        <Box
          sx={{
            height: 4,
            background: course.course_type === 'INTERNAL'
              ? 'linear-gradient(90deg, #DC143C 0%, #FF6B35 100%)'
              : 'linear-gradient(90deg, #FF6B35 0%, #FF8C42 100%)',
          }}
        />
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
                color: '#f44336',
                '&:hover': {
                  bgcolor: 'rgba(244, 67, 54, 0.1)',
                },
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          )}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
            <Typography
              variant="h6"
              component="h2"
              sx={{
                color: '#DC143C',
                fontWeight: 600,
                fontSize: '1.1rem',
                lineHeight: 1.3,
                flex: 1,
                mr: 1,
              }}
            >
              {course.title}
            </Typography>
            <Chip
              label={course.course_type}
              size="small"
              sx={{
                backgroundColor: course.course_type === 'INTERNAL' ? 'rgba(220, 20, 60, 0.1)' : 'rgba(255, 107, 53, 0.1)',
                color: course.course_type === 'INTERNAL' ? '#DC143C' : '#FF6B35',
                fontWeight: 600,
                fontSize: '0.75rem',
              }}
            />
          </Box>
          {course.provider_name && (
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                mb: 2,
                px: 1.5,
                py: 0.5,
                borderRadius: 1,
                backgroundColor: 'rgba(220, 20, 60, 0.05)',
              }}
            >
              <Typography variant="caption" sx={{ color: '#DC143C', fontWeight: 500 }}>
                {course.provider_name}
              </Typography>
            </Box>
          )}
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mb: 2,
              lineHeight: 1.6,
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {course.description || 'No description available'}
          </Typography>
          {enrollment && (
            <Box sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                  Progress
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: getProgressColor(enrollment.progress_state),
                    fontWeight: 600,
                    textTransform: 'capitalize',
                  }}
                >
                  {enrollment.progress_state.replace('_', ' ')}
                </Typography>
              </Box>
              <Box
                sx={{
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: 'rgba(0, 0, 0, 0.1)',
                  overflow: 'hidden',
                }}
              >
                <Box
                  sx={{
                    height: '100%',
                    width: `${(enrollment.progress_state === 'COMPLETED' ? 100 : enrollment.progress_state === 'HIGH' ? 85 : enrollment.progress_state === 'MEDIUM' ? 50 : enrollment.progress_state === 'LOW' ? 15 : 0)}%`,
                    background: `linear-gradient(90deg, ${getProgressColor(enrollment.progress_state)} 0%, ${getProgressColor(enrollment.progress_state)}dd 100%)`,
                    transition: 'width 0.5s ease',
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
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                background: 'linear-gradient(135deg, #DC143C 0%, #FF6B35 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #8B0000 0%, #DC143C 100%)',
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
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                borderColor: '#DC143C',
                color: '#DC143C',
                '&:hover': {
                  borderColor: '#8B0000',
                  backgroundColor: 'rgba(220, 20, 60, 0.05)',
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
        <DialogTitle sx={{ color: '#DC143C', fontWeight: 600 }}>
          Remove Course
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Are you sure you want to remove "{course.title}" from your learning profile?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} sx={{ color: '#666' }}>
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            variant="contained"
            sx={{
              bgcolor: '#f44336',
              '&:hover': {
                bgcolor: '#d32f2f',
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
