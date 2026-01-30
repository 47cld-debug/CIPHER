import React from 'react';
import { Grid, Typography, CircularProgress, Paper, Box } from '@mui/material';
import { useCourses, useEnrollments } from '../../hooks/useApi';
import CourseCard from './CourseCard';
import type { Enrollment } from '../../types/learning';

interface CourseListProps {
  searchQuery?: string;
}

const CourseList: React.FC<CourseListProps> = ({ searchQuery }) => {
  // Get all available courses
  const { data: courses = [], isLoading: coursesLoading, isError: coursesError, error: coursesErrorObj } = useCourses({
    search: searchQuery || undefined,
  });
  
  // Get user's enrollments to match with courses
  const { data: enrollments = [] } = useEnrollments();

  // Create a map of course_id -> enrollment for quick lookup
  const enrollmentMap = new Map<number, Enrollment>();
  enrollments.forEach((enrollment) => {
    enrollmentMap.set(enrollment.course_id, enrollment);
  });

  // Filter out completed courses (they're shown in CompletedCoursesSection)
  const activeCourses = courses.filter((course) => {
    const enrollment = enrollmentMap.get(course.id);
    return !enrollment || enrollment.progress_state !== 'COMPLETED';
  });

  if (coursesLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress sx={{ color: '#DC143C' }} />
      </Box>
    );
  }

  if (coursesError) {
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
          {coursesErrorObj instanceof Error ? coursesErrorObj.message : 'Failed to load courses. Please try again.'}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          If this persists, please contact support.
        </Typography>
      </Paper>
    );
  }

  return (
    <Box>
      <Typography variant="h6" sx={{ color: '#DC143C', fontWeight: 600, mb: 3 }}>
        {searchQuery ? 'Search Results' : 'Available Courses'}
      </Typography>

      <Grid container spacing={3}>
        {activeCourses.map((course) => {
          const enrollment = enrollmentMap.get(course.id);
          return (
            <Grid item xs={12} sm={6} md={4} key={course.id}>
              <CourseCard
                course={course}
                enrollment={enrollment}
              />
            </Grid>
          );
        })}
      </Grid>

      {activeCourses.length === 0 && (
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
            {searchQuery ? 'No courses match your search' : 'No courses available'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {searchQuery
              ? 'Try a different search term or use the AI chatbot for recommendations'
              : 'Use the search bar or AI chatbot to find and enroll in courses'}
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default CourseList;
