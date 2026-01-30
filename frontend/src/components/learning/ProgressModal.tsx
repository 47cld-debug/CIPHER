import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  RadioGroup,
  FormControlLabel,
  Radio,
} from '@mui/material';
import type { ProgressState, Course } from '../../types/learning';
import { useUpdateProgress } from '../../hooks/useApi';
import { useUI } from '../../contexts/UIContext';

interface ProgressModalProps {
  open: boolean;
  onClose: () => void;
  course: Course;
  enrollmentId?: number;
  currentProgress?: ProgressState;
}

const ProgressModal: React.FC<ProgressModalProps> = ({
  open,
  onClose,
  course,
  enrollmentId,
  currentProgress = 'NOT_STARTED',
}) => {
  const [selectedProgress, setSelectedProgress] = useState<ProgressState>(currentProgress);
  const updateProgress = useUpdateProgress();
  const { addNotification } = useUI();

  const handleSubmit = async () => {
    if (!enrollmentId) {
      addNotification({
        id: Date.now().toString(),
        message: 'Please enroll in the course first',
        type: 'error',
      });
      return;
    }

    try {
      await updateProgress.mutateAsync({
        enrollmentId,
        progressState: selectedProgress,
      });

      addNotification({
        id: Date.now().toString(),
        message: 'Progress updated successfully',
        type: 'success',
      });

      // If COMPLETED, close modal (certificate upload handled in CompletedCoursesSection)
      if (selectedProgress === 'COMPLETED') {
        onClose();
        return;
      }

      // If external course and not completed, redirect to external URL
      if (course.course_type === 'EXTERNAL' && course.external_url) {
        window.open(course.external_url, '_blank');
      }

      // If internal course, stay on page
      onClose();
    } catch (error: any) {
      addNotification({
        id: Date.now().toString(),
        message: error.response?.data?.detail || 'Failed to update progress',
        type: 'error',
      });
    }
  };

  const progressOptions = [
    { value: 'NOT_STARTED', label: 'Not Started', color: '#9e9e9e' },
    { value: 'LOW', label: 'Low (10-40%)', color: '#ff9800' },
    { value: 'MEDIUM', label: 'Medium (40-70%)', color: '#ffc107' },
    { value: 'HIGH', label: 'High (70-90%)', color: '#4caf50' },
    { value: 'COMPLETED', label: 'Completed (100%)', color: '#2196f3' },
  ];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        },
      }}
    >
      <DialogTitle
        sx={{
          background: 'linear-gradient(135deg, rgba(220, 20, 60, 0.05) 0%, rgba(255, 107, 53, 0.05) 100%)',
          borderBottom: '1px solid rgba(220, 20, 60, 0.1)',
        }}
      >
        <Typography variant="h6" sx={{ color: '#DC143C', fontWeight: 600 }}>
          Update Course Progress
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {course.title}
        </Typography>
      </DialogTitle>
      <DialogContent sx={{ pt: 3 }}>
        <Typography variant="body1" sx={{ mb: 3, fontWeight: 500 }}>
          How much of this course have you completed?
        </Typography>
        <RadioGroup
          value={selectedProgress}
          onChange={(e) => setSelectedProgress(e.target.value as ProgressState)}
        >
          {progressOptions.map((option) => (
            <FormControlLabel
              key={option.value}
              value={option.value}
              control={
                <Radio
                  sx={{
                    color: option.color,
                    '&.Mui-checked': {
                      color: option.color,
                    },
                  }}
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      backgroundColor: option.color,
                    }}
                  />
                  <Typography variant="body1">{option.label}</Typography>
                </Box>
              }
              sx={{
                mb: 1.5,
                p: 1.5,
                borderRadius: 2,
                border: selectedProgress === option.value ? `2px solid ${option.color}` : '2px solid transparent',
                backgroundColor: selectedProgress === option.value ? `${option.color}10` : 'transparent',
                transition: 'all 0.2s ease',
                '&:hover': {
                  backgroundColor: `${option.color}08`,
                },
              }}
            />
          ))}
        </RadioGroup>
      </DialogContent>
      <DialogActions sx={{ p: 3, pt: 2, borderTop: '1px solid rgba(0, 0, 0, 0.1)' }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            borderColor: '#DC143C',
            color: '#DC143C',
            '&:hover': {
              borderColor: '#8B0000',
              backgroundColor: 'rgba(220, 20, 60, 0.05)',
            },
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={updateProgress.isPending}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
            background: 'linear-gradient(135deg, #DC143C 0%, #FF6B35 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #8B0000 0%, #DC143C 100%)',
            },
            '&:disabled': {
              background: 'rgba(0, 0, 0, 0.12)',
            },
          }}
        >
          {updateProgress.isPending ? 'Updating...' : 'Update Progress'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProgressModal;
