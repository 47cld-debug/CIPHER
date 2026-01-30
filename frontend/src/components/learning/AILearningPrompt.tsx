import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  CircularProgress,
  Card,
  CardContent,
  Chip,
} from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import SendIcon from '@mui/icons-material/Send';
import SchoolIcon from '@mui/icons-material/School';
import { useAIChat } from '../../hooks/useApi';
import { useUI } from '../../contexts/UIContext';
import { learningApi } from '../../api/learning';
import { useNavigate } from 'react-router-dom';

const AILearningPrompt: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<Array<{ title: string; description: string }>>([]);
  const chatMutation = useAIChat();
  const { addNotification } = useUI();
  const navigate = useNavigate();

  const examplePrompts = [
    "I'm a 1-year experienced person, want to learn soft skills",
    "I need to improve my communication skills",
    "What courses help with leadership?",
    "I want to learn Python for data science",
  ];

  const handleSubmit = async () => {
    if (!prompt.trim() || isLoading) return;

    setIsLoading(true);
    setRecommendations([]);

    try {
      // Use AI chat to get recommendations
      const response = await chatMutation.mutateAsync({
        message: `I want to learn: ${prompt.trim()}. Recommend 3-5 specific courses with titles and brief descriptions. Format as a list.`,
        context: 'learning',
      });

      // Parse the AI response (simple parsing - in production would be more robust)
      const responseText = response.response;
      const lines = responseText.split('\n').filter(line => line.trim());
      
      // Try to extract course recommendations
      const extracted: Array<{ title: string; description: string }> = [];
      let currentTitle = '';
      let currentDesc = '';

      for (const line of lines) {
        const trimmed = line.trim();
        // Look for numbered items or bullet points
        if (/^(\d+\.|[-*])\s*(.+)/.test(trimmed)) {
          if (currentTitle) {
            extracted.push({ title: currentTitle, description: currentDesc || 'Recommended course' });
          }
          const match = trimmed.match(/^(\d+\.|[-*])\s*(.+)/);
          if (match) {
            currentTitle = match[2];
            currentDesc = '';
          }
        } else if (trimmed && currentTitle) {
          currentDesc += (currentDesc ? ' ' : '') + trimmed;
        }
      }
      if (currentTitle) {
        extracted.push({ title: currentTitle, description: currentDesc || 'Recommended course' });
      }

      // If parsing failed, create a mock recommendation
      if (extracted.length === 0) {
        extracted.push({
          title: 'Recommended Course',
          description: responseText.substring(0, 150) + '...',
        });
      }

      setRecommendations(extracted.slice(0, 5));
    } catch (error: any) {
      addNotification({
        id: Date.now().toString(),
        message: error.response?.data?.detail || 'Failed to get recommendations. Please try again.',
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnrollFromRecommendation = async (title: string) => {
    try {
      const courses = await learningApi.getCourses({ search: title });
      if (courses.length > 0) {
        await learningApi.enrollInCourse(courses[0].id);
        addNotification({
          id: Date.now().toString(),
          message: `Enrolled in ${title}!`,
          type: 'success',
        });
        navigate('/learning');
      } else {
        addNotification({
          id: Date.now().toString(),
          message: 'Course not found. Please browse courses to enroll.',
          type: 'info',
        });
      }
    } catch (error: any) {
      addNotification({
        id: Date.now().toString(),
        message: error.response?.data?.detail || 'Failed to enroll in course',
        type: 'error',
      });
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        mb: 4,
        borderRadius: 3,
        border: '1px solid rgba(220, 20, 60, 0.1)',
        background: 'linear-gradient(135deg, rgba(220, 20, 60, 0.05) 0%, rgba(255, 107, 53, 0.05) 100%)',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <AutoAwesomeIcon sx={{ color: '#DC143C', fontSize: 28 }} />
        <Typography variant="h6" sx={{ color: '#DC143C', fontWeight: 600 }}>
          Ask AI for Learning Recommendations
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <TextField
          fullWidth
          placeholder="I want to learn... or I need to improve..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
          disabled={isLoading}
          sx={{
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
        />
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!prompt.trim() || isLoading}
          sx={{
            bgcolor: '#DC143C',
            '&:hover': {
              bgcolor: '#B0122A',
            },
            minWidth: 120,
          }}
        >
          {isLoading ? <CircularProgress size={20} sx={{ color: 'white' }} /> : <><SendIcon sx={{ mr: 1 }} /> Get Recommendations</>}
        </Button>
      </Box>

      <Box sx={{ mb: 2 }}>
        <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
          Example prompts:
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {examplePrompts.map((example, index) => (
            <Chip
              key={index}
              label={example}
              size="small"
              onClick={() => setPrompt(example)}
              sx={{
                cursor: 'pointer',
                bgcolor: 'rgba(220, 20, 60, 0.1)',
                color: '#DC143C',
                '&:hover': {
                  bgcolor: 'rgba(220, 20, 60, 0.2)',
                },
              }}
            />
          ))}
        </Box>
      </Box>

      {recommendations.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle2" sx={{ color: '#DC143C', fontWeight: 600, mb: 2 }}>
            Recommended Courses:
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {recommendations.map((rec, index) => (
              <Card
                key={index}
                sx={{
                  border: '1px solid rgba(220, 20, 60, 0.1)',
                  borderRadius: 2,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: 4,
                    borderColor: '#DC143C',
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'start', gap: 2 }}>
                    <SchoolIcon sx={{ color: '#DC143C', mt: 0.5 }} />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" sx={{ color: '#DC143C', fontWeight: 600, mb: 0.5, fontSize: '1rem' }}>
                        {rec.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {rec.description}
                      </Typography>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleEnrollFromRecommendation(rec.title)}
                        sx={{
                          borderColor: '#DC143C',
                          color: '#DC143C',
                          '&:hover': {
                            borderColor: '#B0122A',
                            bgcolor: 'rgba(220, 20, 60, 0.05)',
                          },
                        }}
                      >
                        Enroll Now
                      </Button>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Box>
      )}
    </Paper>
  );
};

export default AILearningPrompt;
