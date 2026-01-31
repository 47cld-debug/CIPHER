import React, { useState } from 'react';
import { Box, Typography, Paper, TextField, InputAdornment } from '@mui/material';
import { GraduationCap, Search } from 'lucide-react';
import CourseList from './CourseList';
import CompletedCoursesSection from './CompletedCoursesSection';
import AILearningChatbot from './AILearningChatbot';
import { useEnrollments } from '../../hooks/useApi';

const LearningPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { data: enrollments = [] } = useEnrollments();

  return (
    <Box sx={{ width: '100%', maxWidth: '100%' }}>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <GraduationCap size={24} color="#EF4444" />
          <Typography
            variant="h1"
            component="h1"
            sx={{
              fontSize: '26px',
              fontWeight: 600,
              color: '#111827',
            }}
          >
            Learning & Development
          </Typography>
        </Box>
        <Typography
          variant="body2"
          sx={{
            fontSize: '14px',
            color: '#6B7280',
            mb: 3,
          }}
        >
          Browse courses to develop your skills
        </Typography>

        {/* Search Bar */}
        <TextField
          fullWidth
          placeholder="Search courses..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search size={20} color="#6B7280" />
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              height: '44px',
              borderRadius: '999px',
              border: '1px solid #E5E7EB',
              bgcolor: '#FFFFFF',
              '&:hover fieldset': {
                borderColor: '#E5E7EB',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#EF4444',
              },
            },
          }}
        />
      </Box>

      <CourseList searchQuery={searchQuery || undefined} />
      <CompletedCoursesSection enrollments={enrollments} />
      <AILearningChatbot />
    </Box>
  );
};

export default LearningPage;
