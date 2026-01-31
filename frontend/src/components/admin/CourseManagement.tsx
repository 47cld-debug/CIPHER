import React, { useState } from 'react';
import {
  Box,
  Typography,
  Container,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Chip,
  IconButton,
} from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { adminApi } from '../../api/admin';
import { useUI } from '../../contexts/UIContext';
import { Course, CourseType } from '../../types/learning';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const CourseManagement: React.FC = () => {
  const { addNotification } = useUI();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    skill_level: '',
    duration: '',
    course_type: 'EXTERNAL' as CourseType,
    provider_name: '',
    external_url: '',
  });

  const { data: courses = [], isLoading } = useQuery<Course[]>({
    queryKey: ['adminCourses'],
    queryFn: () => adminApi.getAllCourses(),
    retry: 1,
    staleTime: 30000,
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => adminApi.createCourse(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminCourses'] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      addNotification({
        id: Date.now().toString(),
        message: 'Course created successfully',
        type: 'success',
      });
      handleCloseDialog();
    },
    onError: (error: any) => {
      addNotification({
        id: Date.now().toString(),
        message: error.response?.data?.detail || 'Failed to create course',
        type: 'error',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ courseId, data }: { courseId: number; data: any }) =>
      adminApi.updateCourse(courseId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminCourses'] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      addNotification({
        id: Date.now().toString(),
        message: 'Course updated successfully',
        type: 'success',
      });
      handleCloseDialog();
    },
    onError: (error: any) => {
      addNotification({
        id: Date.now().toString(),
        message: error.response?.data?.detail || 'Failed to update course',
        type: 'error',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (courseId: number) => adminApi.deleteCourse(courseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminCourses'] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      addNotification({
        id: Date.now().toString(),
        message: 'Course deleted successfully',
        type: 'success',
      });
    },
    onError: (error: any) => {
      addNotification({
        id: Date.now().toString(),
        message: error.response?.data?.detail || 'Failed to delete course',
        type: 'error',
      });
    },
  });

  const handleOpenDialog = (course?: Course) => {
    if (course) {
      setEditingCourse(course);
      setFormData({
        title: course.title,
        description: course.description || '',
        category: course.category || '',
        skill_level: course.skill_level || '',
        duration: course.duration?.toString() || '',
        course_type: course.course_type,
        provider_name: course.provider_name || '',
        external_url: course.external_url || '',
      });
    } else {
      setEditingCourse(null);
      setFormData({
        title: '',
        description: '',
        category: '',
        skill_level: '',
        duration: '',
        course_type: 'EXTERNAL',
        provider_name: '',
        external_url: '',
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingCourse(null);
    setFormData({
      title: '',
      description: '',
      category: '',
      skill_level: '',
      duration: '',
      course_type: 'EXTERNAL',
      provider_name: '',
      external_url: '',
    });
  };

  const handleSubmit = () => {
    const submitData: any = {
      title: formData.title,
      description: formData.description || undefined,
      category: formData.category || undefined,
      skill_level: formData.skill_level || undefined,
      duration: formData.duration ? parseFloat(formData.duration) : undefined,
      course_type: formData.course_type,
      provider_name: formData.provider_name || undefined,
      external_url: formData.external_url || undefined,
    };

    if (editingCourse) {
      updateMutation.mutate({ courseId: editingCourse.id, data: submitData });
    } else {
      createMutation.mutate(submitData);
    }
  };

  const handleDelete = (courseId: number) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      deleteMutation.mutate(courseId);
    }
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
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
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
                Course Management
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Create, edit, and manage learning courses
              </Typography>
            </Box>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            sx={{
              bgcolor: '#DC143C',
              '&:hover': {
                bgcolor: '#B0122A',
              },
            }}
          >
            Add Course
          </Button>
        </Box>
      </Paper>

      <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 3, border: '1px solid rgba(220, 20, 60, 0.1)' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'rgba(220, 20, 60, 0.05)' }}>
              <TableCell sx={{ fontWeight: 600, color: '#DC143C' }}>Title</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#DC143C' }}>Category</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#DC143C' }}>Type</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#DC143C' }}>Duration</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#DC143C' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {courses.map((course) => (
              <TableRow
                key={course.id}
                sx={{
                  '&:hover': {
                    bgcolor: 'rgba(220, 20, 60, 0.02)',
                  },
                }}
              >
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {course.title}
                  </Typography>
                </TableCell>
                <TableCell>
                  {course.category && (
                    <Chip label={course.category} size="small" sx={{ bgcolor: 'rgba(220, 20, 60, 0.1)', color: '#DC143C' }} />
                  )}
                </TableCell>
                <TableCell>
                  <Chip
                    label={course.course_type}
                    size="small"
                    sx={{
                      bgcolor: course.course_type === 'INTERNAL' ? 'rgba(220, 20, 60, 0.1)' : 'rgba(255, 107, 53, 0.1)',
                      color: course.course_type === 'INTERNAL' ? '#DC143C' : '#FF6B35',
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {course.duration ? `${course.duration} hrs` : '-'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(course)}
                      sx={{ color: '#DC143C' }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(course.id)}
                      sx={{ color: '#f44336' }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle sx={{ color: '#DC143C', fontWeight: 600 }}>
          {editingCourse ? 'Edit Course' : 'Create New Course'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField
              label="Title"
              required
              fullWidth
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': { borderColor: '#DC143C' },
                  '&.Mui-focused fieldset': { borderColor: '#DC143C' },
                },
              }}
            />
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Category"
                fullWidth
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              />
              <TextField
                label="Skill Level"
                fullWidth
                select
                value={formData.skill_level}
                onChange={(e) => setFormData({ ...formData, skill_level: e.target.value })}
              >
                <MenuItem value="Beginner">Beginner</MenuItem>
                <MenuItem value="Intermediate">Intermediate</MenuItem>
                <MenuItem value="Advanced">Advanced</MenuItem>
              </TextField>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Duration (hours)"
                type="number"
                fullWidth
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              />
              <TextField
                label="Course Type"
                fullWidth
                required
                select
                value={formData.course_type}
                onChange={(e) => setFormData({ ...formData, course_type: e.target.value as CourseType })}
              >
                <MenuItem value="INTERNAL">Internal</MenuItem>
                <MenuItem value="EXTERNAL">External</MenuItem>
              </TextField>
            </Box>
            {formData.course_type === 'EXTERNAL' && (
              <>
                <TextField
                  label="Provider Name"
                  fullWidth
                  value={formData.provider_name}
                  onChange={(e) => setFormData({ ...formData, provider_name: e.target.value })}
                  placeholder="e.g., LinkedIn Learning, Coursera"
                />
                <TextField
                  label="External URL"
                  fullWidth
                  value={formData.external_url}
                  onChange={(e) => setFormData({ ...formData, external_url: e.target.value })}
                  placeholder="https://..."
                />
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} sx={{ color: '#666' }}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={!formData.title || createMutation.isPending || updateMutation.isPending}
            sx={{
              bgcolor: '#DC143C',
              '&:hover': { bgcolor: '#B0122A' },
            }}
          >
            {(createMutation.isPending || updateMutation.isPending) ? (
              <CircularProgress size={20} sx={{ color: 'white' }} />
            ) : (
              editingCourse ? 'Update' : 'Create'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CourseManagement;
