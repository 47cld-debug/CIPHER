import React, { useState } from 'react';
import { Grid, TextField, Box, FormControl, InputLabel, Select, MenuItem, Typography, CircularProgress, Paper } from '@mui/material';
import { useCourses, useEnrollments } from '../../hooks/useApi';
import CourseCard from './CourseCard';
import { learningApi } from '../../api/learning';
import { useUI } from '../../contexts/UIContext';

const CourseList: React.FC = () => {
  const [search, setSearch] = useState('');
  const [courseType, setCourseType] = useState<string>('');
  const [category, setCategory] = useState<string>('');

  const { data: courses = [], isLoading, isError, error } = useCourses({
    search: search || undefined,
    course_type: courseType || undefined,
    category: category || undefined,
  });

  const { data: enrollments = [], isError: enrollmentsError } = useEnrollments();
  const { addNotification } = useUI();

  const handleEnroll = async (courseId: number) => {
    try {
      await learningApi.enrollInCourse(courseId);
      addNotification({
        id: Date.now().toString(),
        message: 'Enrolled successfully',
        type: 'success',
      });
    } catch (error: any) {
      addNotification({
        id: Date.now().toString(),
        message: error.response?.data?.detail || 'Failed to enroll',
        type: 'error',
      });
    }
  };

  const getEnrollment = (courseId: number) => {
    return enrollments.find((e) => e.course_id === courseId);
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress sx={{ color: '#DC143C' }} />
      </Box>
    );
  }

  if (isError) {
    return (
      <Paper
        elevation={0}
        sx={{
          textAlign: 'center',
          py: 8,
          background: 'linear-gradient(135deg, rgba(220, 20, 60, 0.05) 0%, rgba(255, 107, 53, 0.05) 100%)',
          border: '2px dashed rgba(220, 20, 60, 0.3)',
          borderRadius: 3,
        }}
      >
        <Typography variant="h6" sx={{ color: '#DC143C', mb: 1, fontWeight: 600 }}>
          Error Loading Courses
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {error instanceof Error ? error.message : 'Failed to load courses. Please try again.'}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          If this persists, please contact support.
        </Typography>
      </Paper>
    );
  }

  return (
    <Box>
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 4,
          borderRadius: 3,
          border: '1px solid rgba(220, 20, 60, 0.1)',
          background: 'white',
        }}
      >
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            label="Search courses"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{
              flexGrow: 1,
              minWidth: '250px',
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                '&:hover fieldset': {
                  borderColor: '#DC143C',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#DC143C',
                },
              },
            }}
            placeholder="Search by title, description..."
          />
          <FormControl sx={{ minWidth: 160 }}>
            <InputLabel>Course Type</InputLabel>
            <Select
              value={courseType}
              label="Course Type"
              onChange={(e) => setCourseType(e.target.value)}
              sx={{
                borderRadius: 2,
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#DC143C',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#DC143C',
                },
              }}
            >
              <MenuItem value="">All Types</MenuItem>
              <MenuItem value="INTERNAL">Internal</MenuItem>
              <MenuItem value="EXTERNAL">External</MenuItem>
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 160 }}>
            <InputLabel>Category</InputLabel>
            <Select
              value={category}
              label="Category"
              onChange={(e) => setCategory(e.target.value)}
              sx={{
                borderRadius: 2,
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#DC143C',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#DC143C',
                },
              }}
            >
              <MenuItem value="">All Categories</MenuItem>
              <MenuItem value="Technical">Technical</MenuItem>
              <MenuItem value="Soft Skills">Soft Skills</MenuItem>
              <MenuItem value="Leadership">Leadership</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

      <Grid container spacing={3}>
        {courses.map((course) => (
          <Grid item xs={12} sm={6} md={4} key={course.id}>
            <CourseCard
              course={course}
              enrollment={getEnrollment(course.id)}
              onEnroll={() => handleEnroll(course.id)}
            />
          </Grid>
        ))}
      </Grid>

      {courses.length === 0 && (
        <Paper
          elevation={0}
          sx={{
            textAlign: 'center',
            py: 8,
            background: 'linear-gradient(135deg, rgba(220, 20, 60, 0.05) 0%, rgba(255, 107, 53, 0.05) 100%)',
            border: '2px dashed rgba(220, 20, 60, 0.3)',
            borderRadius: 3,
          }}
        >
          <Typography variant="h6" sx={{ color: '#DC143C', mb: 1, fontWeight: 600 }}>
            No courses found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Try adjusting your search or filter criteria
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default CourseList;
