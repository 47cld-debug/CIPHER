import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Paper,
  TextField,
  IconButton,
  Typography,
  CircularProgress,
  Avatar,
  Fade,
  Button,
  Link,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import SchoolIcon from '@mui/icons-material/School';
import LaunchIcon from '@mui/icons-material/Launch';
import { aiApi } from '../../api/ai';
import { learningApi } from '../../api/learning';
import { useUI } from '../../contexts/UIContext';
import type { LearningRecommendationResponse } from '../../types/ai';
import ProgressModal from './ProgressModal';
import type { Course } from '../../types/learning';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  recommendations?: LearningRecommendationResponse[];
}

const AILearningChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! I'm your AI learning assistant. Ask me to search for course recommendations based on your project needs or learning goals.",
      sender: 'ai',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [progressModalOpen, setProgressModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedEnrollmentId, setSelectedEnrollmentId] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { addNotification } = useUI();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input.trim(),
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const query = input.trim();
    setInput('');
    setIsLoading(true);

    try {
      // Get RAG-based recommendations
      const recommendations = await aiApi.getLearningRecommendations(query);

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: recommendations.length > 0
          ? `Based on your project needs, I recommend these courses:`
          : "I couldn't find specific courses matching your needs, but here are some general recommendations:",
        sender: 'ai',
        timestamp: new Date(),
        recommendations: recommendations,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error: any) {
      addNotification({
        id: Date.now().toString(),
        message: error.response?.data?.detail || 'Failed to get recommendations. Please try again.',
        type: 'error',
      });
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm having trouble processing your request right now. Please try again later.",
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCourseClick = async (recommendation: LearningRecommendationResponse) => {
    try {
      let courseId = recommendation.id;
      let course = null;

      // Try to get course by ID first
      if (courseId && !isNaN(Number(courseId))) {
        try {
          course = await learningApi.getCourse(courseId);
        } catch (error: any) {
          // If course not found by ID, try searching by title
          if (error.response?.status === 404) {
            console.warn(`Course ID ${courseId} not found, searching by title: ${recommendation.title}`);
            const courses = await learningApi.getCourses({ search: recommendation.title });
            if (courses.length > 0) {
              // Find exact match by title
              const exactMatch = courses.find(c => c.title.toLowerCase() === recommendation.title.toLowerCase());
              if (exactMatch) {
                course = exactMatch;
                courseId = exactMatch.id;
              } else {
                // Use first match if no exact match
                course = courses[0];
                courseId = courses[0].id;
              }
            }
          } else {
            throw error;
          }
        }
      } else {
        // If no valid ID, search by title
        const courses = await learningApi.getCourses({ search: recommendation.title });
        if (courses.length > 0) {
          const exactMatch = courses.find(c => c.title.toLowerCase() === recommendation.title.toLowerCase());
          if (exactMatch) {
            course = exactMatch;
            courseId = exactMatch.id;
          } else {
            course = courses[0];
            courseId = courses[0].id;
          }
        }
      }

      // If still no course found, show error
      if (!course || !courseId) {
        addNotification({
          id: Date.now().toString(),
          message: `Course "${recommendation.title}" not found. Please try browsing courses manually.`,
          type: 'error',
        });
        return;
      }

      // Auto-enroll user in the course (for both INTERNAL and EXTERNAL)
      const enrollment = await learningApi.enrollInCourse(courseId, true);
      
      if (!enrollment) {
        throw new Error('Enrollment returned null');
      }
      
      // Get full course details
      const fullCourse = await learningApi.getCourse(courseId);
      
      // For external courses, open the URL after enrollment
      if (fullCourse.course_type === 'EXTERNAL' && fullCourse.external_url) {
        window.open(fullCourse.external_url, '_blank');
        addNotification({
          id: Date.now().toString(),
          message: `Enrolled in ${fullCourse.title}. Opening course...`,
          type: 'success',
        });
      } else {
        // For internal courses, show progress modal
        setSelectedCourse(fullCourse);
        setSelectedEnrollmentId(enrollment.id);
        setProgressModalOpen(true);
        
        addNotification({
          id: Date.now().toString(),
          message: `Enrolled in ${fullCourse.title}`,
          type: 'success',
        });
      }
    } catch (error: any) {
      console.error('Enrollment error:', error);
      const errorMessage = error.response?.data?.detail || error.message || 'Failed to enroll in course';
      addNotification({
        id: Date.now().toString(),
        message: errorMessage,
        type: 'error',
      });
    }
  };

  if (!isOpen) {
    return (
      <Box
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 1000,
        }}
      >
        <IconButton
          onClick={() => setIsOpen(true)}
          sx={{
            width: 64,
            height: 64,
            background: 'linear-gradient(135deg, #DC143C 0%, #FF6B35 100%)',
            color: 'white',
            boxShadow: 6,
            '&:hover': {
              background: 'linear-gradient(135deg, #B0122A 0%, #E55A25 100%)',
              transform: 'scale(1.1)',
            },
            transition: 'all 0.3s ease',
          }}
        >
          <SmartToyIcon sx={{ fontSize: 32 }} />
        </IconButton>
      </Box>
    );
  }

  return (
    <>
      <Fade in={isOpen}>
        <Paper
          elevation={24}
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            width: { xs: 'calc(100vw - 48px)', sm: 450 },
            height: 650,
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 3,
            border: '1px solid rgba(220, 20, 60, 0.2)',
            zIndex: 1000,
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <Box
            sx={{
              p: 2,
              background: 'linear-gradient(135deg, #DC143C 0%, #FF6B35 100%)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SmartToyIcon />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                AI Learning Assistant
              </Typography>
            </Box>
            <IconButton
              size="small"
              onClick={() => setIsOpen(false)}
              sx={{ color: 'white' }}
            >
              <Typography variant="h6">×</Typography>
            </IconButton>
          </Box>

          {/* Messages */}
          <Box
            sx={{
              flex: 1,
              overflowY: 'auto',
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              bgcolor: 'rgba(0, 0, 0, 0.02)',
            }}
          >
            {messages.map((message) => (
              <Box key={message.id}>
                <Box
                  sx={{
                    display: 'flex',
                    gap: 1,
                    justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
                  }}
                >
                  {message.sender === 'ai' && (
                    <Avatar
                      sx={{
                        bgcolor: '#DC143C',
                        width: 32,
                        height: 32,
                      }}
                    >
                      <SmartToyIcon sx={{ fontSize: 18 }} />
                    </Avatar>
                  )}
                  <Paper
                    elevation={1}
                    sx={{
                      p: 1.5,
                      maxWidth: '75%',
                      bgcolor: message.sender === 'user' ? '#EF4444' : 'white',
                      color: message.sender === 'user' ? '#FFFFFF' : '#111827',
                      borderRadius: 2,
                      border: message.sender === 'ai' ? '1px solid #E5E7EB' : 'none',
                    }}
                  >
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        whiteSpace: 'pre-wrap',
                        color: message.sender === 'user' ? '#FFFFFF' : '#111827',
                        fontWeight: message.sender === 'user' ? 400 : 400,
                      }}
                    >
                      {message.text}
                    </Typography>
                  </Paper>
                  {message.sender === 'user' && (
                    <Avatar
                      sx={{
                        bgcolor: '#FF6B35',
                        width: 32,
                        height: 32,
                      }}
                    >
                      <PersonIcon sx={{ fontSize: 18 }} />
                    </Avatar>
                  )}
                </Box>
                {/* Show recommendations */}
                {message.recommendations && message.recommendations.length > 0 && (
                  <Box sx={{ mt: 2, ml: 5, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    {message.recommendations.map((rec) => (
                      <Paper
                        key={rec.id}
                        elevation={2}
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          border: '1px solid rgba(220, 20, 60, 0.2)',
                          '&:hover': {
                            borderColor: '#DC143C',
                            boxShadow: 4,
                          },
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'start', gap: 1, mb: 1 }}>
                          <SchoolIcon sx={{ color: '#DC143C', mt: 0.5 }} />
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#DC143C', mb: 0.5 }}>
                              {rec.title}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {rec.description}
                            </Typography>
                          </Box>
                        </Box>
                        <Button
                          size="small"
                          variant="outlined"
                          fullWidth
                          onClick={() => handleCourseClick(rec)}
                          endIcon={rec.course_type === 'EXTERNAL' ? <LaunchIcon /> : null}
                          sx={{
                            borderColor: '#EF4444',
                            color: '#EF4444',
                            '&:hover': {
                              borderColor: '#DC2626',
                              bgcolor: '#FEF2F2',
                            },
                          }}
                        >
                          {rec.course_type === 'EXTERNAL' ? 'Open Course' : 'Enroll Course'}
                        </Button>
                      </Paper>
                    ))}
                  </Box>
                )}
              </Box>
            ))}
            {isLoading && (
              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-start' }}>
                <Avatar
                  sx={{
                    bgcolor: '#DC143C',
                    width: 32,
                    height: 32,
                  }}
                >
                  <SmartToyIcon sx={{ fontSize: 18 }} />
                </Avatar>
                <Paper
                  elevation={1}
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    border: '1px solid rgba(220, 20, 60, 0.2)',
                  }}
                >
                  <CircularProgress size={16} sx={{ color: '#DC143C' }} />
                </Paper>
              </Box>
            )}
            <div ref={messagesEndRef} />
          </Box>

          {/* Input */}
          <Box
            sx={{
              p: 2,
              borderTop: '1px solid rgba(220, 20, 60, 0.1)',
              display: 'flex',
              gap: 1,
            }}
          >
            <TextField
              fullWidth
              size="small"
              placeholder="Ask me to search for recommendations..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
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
            <IconButton
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              sx={{
                bgcolor: '#DC143C',
                color: 'white',
                '&:hover': {
                  bgcolor: '#B0122A',
                },
                '&:disabled': {
                  bgcolor: 'rgba(0, 0, 0, 0.12)',
                },
              }}
            >
              <SendIcon />
            </IconButton>
          </Box>
        </Paper>
      </Fade>

      {selectedCourse && selectedEnrollmentId && (
        <ProgressModal
          open={progressModalOpen}
          onClose={() => {
            setProgressModalOpen(false);
            setSelectedCourse(null);
            setSelectedEnrollmentId(null);
          }}
          course={selectedCourse}
          enrollmentId={selectedEnrollmentId}
          currentProgress="NOT_STARTED"
        />
      )}
    </>
  );
};

export default AILearningChatbot;
