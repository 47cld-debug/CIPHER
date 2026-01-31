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
  Chip,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import { useComplianceChat } from '../../hooks/useApi';
import { useUI } from '../../contexts/UIContext';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  agent?: 'hr' | 'it' | 'both';
  compliant?: boolean | null;
  policy_references?: string[];
}

const AIChatAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! I'm your AI compliance assistant. I can help you with HR and IT policies. Ask me anything about company policies, leave, expenses, security, or compliance questions.",
      sender: 'ai',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatMutation = useComplianceChat();
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
    setInput('');
    setIsLoading(true);

    try {
      const response = await chatMutation.mutateAsync(input.trim());

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.response,
        sender: 'ai',
        timestamp: new Date(),
        agent: response.agent,
        compliant: response.compliant,
        policy_references: response.policy_references || [],
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error: any) {
      addNotification({
        id: Date.now().toString(),
        message: error.response?.data?.detail || 'Failed to get AI response. Please try again.',
        type: 'error',
      });
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm having trouble processing your question right now. Please try again later or contact HR directly.",
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
    <Fade in={isOpen}>
      <Paper
        elevation={24}
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          width: { xs: 'calc(100vw - 48px)', sm: 400 },
          height: 600,
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
              AI Assistant
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
            <Box
              key={message.id}
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
                  bgcolor: message.sender === 'user' ? '#DC143C' : 'white',
                  color: message.sender === 'user' ? 'white' : 'text.primary',
                  borderRadius: 2,
                  border: message.sender === 'ai' ? '1px solid rgba(220, 20, 60, 0.2)' : 'none',
                }}
              >
                {message.sender === 'ai' && message.agent && (
                  <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                    <Chip
                      label={message.agent.toUpperCase()}
                      size="small"
                      sx={{
                        bgcolor: message.agent === 'hr' ? '#4caf50' : message.agent === 'it' ? '#2196f3' : '#ff9800',
                        color: 'white',
                        fontWeight: 600,
                        fontSize: '0.7rem',
                      }}
                    />
                    {message.compliant !== null && message.compliant !== undefined && (
                      <Chip
                        icon={message.compliant ? <CheckCircleOutlineIcon /> : <CancelOutlinedIcon />}
                        label={message.compliant ? 'Compliant' : 'Not Compliant'}
                        size="small"
                        sx={{
                          bgcolor: message.compliant ? '#4caf50' : '#f44336',
                          color: 'white',
                          fontWeight: 600,
                          fontSize: '0.7rem',
                        }}
                      />
                    )}
                  </Box>
                )}
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                  {message.text}
                </Typography>
                {message.sender === 'ai' && message.policy_references && message.policy_references.length > 0 && (
                  <Box sx={{ mt: 1.5, pt: 1, borderTop: '1px solid rgba(0, 0, 0, 0.1)' }}>
                    <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
                      Referenced Policies:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {message.policy_references.map((ref, idx) => (
                        <Chip
                          key={idx}
                          label={ref}
                          size="small"
                          sx={{
                            bgcolor: 'rgba(220, 20, 60, 0.1)',
                            color: '#DC143C',
                            fontSize: '0.65rem',
                            height: '20px',
                          }}
                        />
                      ))}
                    </Box>
                  </Box>
                )}
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
            placeholder="Ask about policies, leave, expenses..."
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
  );
};

export default AIChatAssistant;
