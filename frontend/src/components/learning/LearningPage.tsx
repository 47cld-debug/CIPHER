import React, { useState } from 'react';
import { Box, Typography, Container, Paper, TextField, InputAdornment } from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import SearchIcon from '@mui/icons-material/Search';
import CourseList from './CourseList';
import CompletedCoursesSection from './CompletedCoursesSection';
import AILearningChatbot from './AILearningChatbot';
import { useEnrollments } from '../../hooks/useApi';

const LearningPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { data: enrollments = [] } = useEnrollments();

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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
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
          <Box sx={{ flex: 1 }}>
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
              Learning & Development
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Search courses or use AI chatbot for personalized recommendations
            </Typography>
          </Box>
        </Box>

        {/* Search Bar */}
        <TextField
          fullWidth
          placeholder="Search courses by title, description, or category..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#DC143C' }} />
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              bgcolor: 'white',
              '&:hover fieldset': {
                borderColor: '#DC143C',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#DC143C',
              },
            },
          }}
        />
      </Paper>

      <CourseList searchQuery={searchQuery || undefined} />
      <CompletedCoursesSection enrollments={enrollments} />
      <AILearningChatbot />
    </Container>
  );
};

export default LearningPage;
