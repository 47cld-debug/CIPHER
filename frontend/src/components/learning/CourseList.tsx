import React from 'react';
import { Grid, Typography, CircularProgress, Paper, Box } from '@mui/material';
import { useCourses, useEnrollments } from '../../hooks/useApi';
import CourseCard from './CourseCard';
import type { Enrollment } from '../../types/learning';

interface CourseListProps {
  searchQuery?: string;
}

const CourseList: React.FC<CourseListProps> = ({ searchQuery }) => {
  const { data: courses = [], isLoading: coursesLoading, isError: coursesError, error: coursesErrorObj } = useCourses({
    search: searchQuery || undefined,
  });
  
  const { data: enrollments = [] } = useEnrollments();

  const enrollmentMap = new Map<number, Enrollment>();
  enrollments.forEach((enrollment) => {
    enrollmentMap.set(enrollment.course_id, enrollment);
  });

  const activeCourses = courses.filter((course) => {
    const enrollment = enrollmentMap.get(course.id);
    return !enrollment || enrollment.progress_state !== 'COMPLETED';
  });

  if (coursesLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress sx={{ color: '#EF4444' }} />
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
          backgroundColor: '#FFFFFF',
          border: '1px solid #E5E7EB',
          borderRadius: '12px',
        }}
      >
        <Typography variant="h2" sx={{ fontSize: '18px', fontWeight: 600, color: '#111827', mb: 1 }}>
          Error Loading Courses
        </Typography>
        <Typography variant="body2" sx={{ fontSize: '14px', color: '#6B7280', mb: 2 }}>
          {coursesErrorObj instanceof Error ? coursesErrorObj.message : 'Failed to load courses. Please try again.'}
        </Typography>
      </Paper>
    );
  }

  return (
    <Box>
      <Typography variant="h2" sx={{ fontSize: '18px', fontWeight: 600, color: '#111827', mb: 3 }}>
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
            backgroundColor: '#FFFFFF',
            border: '1px solid #E5E7EB',
            borderRadius: '12px',
          }}
        >
          <Typography variant="h2" sx={{ fontSize: '18px', fontWeight: 600, color: '#111827', mb: 1 }}>
            {searchQuery ? 'No courses match your search' : 'No courses available'}
          </Typography>
          <Typography variant="body2" sx={{ fontSize: '14px', color: '#6B7280' }}>
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
