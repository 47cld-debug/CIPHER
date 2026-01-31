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
} from '@mui/material';
import { Send } from 'lucide-react';
import { Bot, User } from 'lucide-react';
import { useComplianceDocuments, useComplianceChat } from '../../hooks/useApi';
import { useUI } from '../../contexts/UIContext';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

interface ComplianceChatProps {
  /** If true, show compact empty state when no docs (inline in panel). */
  embedded?: boolean;
}

const ComplianceChat: React.FC<ComplianceChatProps> = ({ embedded = false }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { data: documents = [], isLoading: docsLoading } = useComplianceDocuments();
  const chatMutation = useComplianceChat();
  const { addNotification } = useUI();

  const hasDocs = documents.length > 0;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || chatMutation.isPending) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input.trim(),
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');

    try {
      const result = await chatMutation.mutateAsync(input.trim());
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: result.response,
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error: any) {
      addNotification({
        id: Date.now().toString(),
        message: error.response?.data?.detail || 'Failed to get response. Please try again.',
        type: 'error',
      });
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm having trouble processing your question right now. Please try again later or contact HR.",
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (docsLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 280, p: 2 }}>
        <CircularProgress sx={{ color: '#EF4444' }} />
      </Box>
    );
  }

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: '12px',
        border: '1px solid #E5E7EB',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        minHeight: embedded ? 320 : 480,
        maxHeight: embedded ? 420 : 560,
        backgroundColor: '#FFFFFF',
      }}
    >
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          bgcolor: '#F9FAFB',
        }}
      >
        {messages.length === 0 && (
          <Fade in>
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body2" color="text.secondary">
                {hasDocs 
                  ? 'Ask about your uploaded documents (HR, IT, leave, compliance).'
                  : 'Ask me anything about company policies, leave, expenses, IT issues, or compliance questions.'}
              </Typography>
            </Box>
          </Fade>
        )}
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
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  backgroundColor: '#F9FAFB',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Bot size={18} color="#6B7280" />
              </Box>
            )}
            <Paper
              elevation={0}
              sx={{
                p: 1.5,
                maxWidth: '85%',
                backgroundColor: message.sender === 'user' ? '#EF4444' : '#FFFFFF',
                borderRadius: '12px',
                border: message.sender === 'ai' ? '1px solid #E5E7EB' : 'none',
              }}
            >
              <Typography 
                variant="body2" 
                sx={{ 
                  whiteSpace: 'pre-wrap',
                  fontSize: '14px',
                  color: message.sender === 'user' ? '#FFFFFF' : '#111827',
                }}
              >
                {message.text}
              </Typography>
            </Paper>
            {message.sender === 'user' && (
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  backgroundColor: '#F9FAFB',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <User size={18} color="#6B7280" />
              </Box>
            )}
          </Box>
        ))}
        {chatMutation.isPending && (
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-start' }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                backgroundColor: '#F9FAFB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Bot size={18} color="#6B7280" />
            </Box>
            <Paper elevation={0} sx={{ p: 1.5, borderRadius: '12px', border: '1px solid #E5E7EB', backgroundColor: '#FFFFFF' }}>
              <CircularProgress size={16} sx={{ color: '#EF4444' }} />
            </Paper>
          </Box>
        )}
        <div ref={messagesEndRef} />
      </Box>
      <Box sx={{ p: 2, borderTop: '1px solid #E5E7EB', display: 'flex', gap: 1, backgroundColor: '#FFFFFF' }}>
        <TextField
          fullWidth
          size="small"
          placeholder={hasDocs ? "Ask about policies, leave, compliance..." : "Ask about company policies, leave, expenses, IT issues..."}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
          disabled={chatMutation.isPending}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '10px',
              backgroundColor: '#FFFFFF',
              '&:hover fieldset': { borderColor: '#E5E7EB' },
              '&.Mui-focused fieldset': { borderColor: '#EF4444' },
            },
          }}
        />
        <IconButton
          onClick={() => handleSend()}
          disabled={!input.trim() || chatMutation.isPending}
          sx={{
            backgroundColor: '#EF4444',
            color: '#FFFFFF',
            borderRadius: '10px',
            '&:hover': { backgroundColor: '#DC2626' },
            '&:disabled': { backgroundColor: '#D1D5DB', color: '#9CA3AF' },
          }}
        >
          <Send size={20} />
        </IconButton>
      </Box>
    </Paper>
  );
};

export default ComplianceChat;
