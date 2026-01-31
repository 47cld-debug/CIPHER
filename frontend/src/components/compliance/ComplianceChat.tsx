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
import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import { useComplianceDocuments, useComplianceChat } from '../../hooks/useApi';
import { useUI } from '../../contexts/UIContext';

const CRIMSON = '#DC143C';
const BORDER = '1px solid rgba(220, 20, 60, 0.2)';

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
        <CircularProgress sx={{ color: CRIMSON }} />
      </Box>
    );
  }

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 3,
        border: BORDER,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        minHeight: embedded ? 320 : 480,
        maxHeight: embedded ? 420 : 560,
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
          bgcolor: 'rgba(0, 0, 0, 0.02)',
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
              <Avatar sx={{ bgcolor: CRIMSON, width: 32, height: 32 }}>
                <SmartToyIcon sx={{ fontSize: 18 }} />
              </Avatar>
            )}
            <Paper
              elevation={1}
              sx={{
                p: 1.5,
                maxWidth: '85%',
                bgcolor: message.sender === 'user' ? CRIMSON : 'white',
                color: message.sender === 'user' ? 'white' : 'text.primary',
                borderRadius: 2,
                border: message.sender === 'ai' ? BORDER : 'none',
              }}
            >
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                {message.text}
              </Typography>
            </Paper>
            {message.sender === 'user' && (
              <Avatar sx={{ bgcolor: '#FF6B35', width: 32, height: 32 }}>
                <PersonIcon sx={{ fontSize: 18 }} />
              </Avatar>
            )}
          </Box>
        ))}
        {chatMutation.isPending && (
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-start' }}>
            <Avatar sx={{ bgcolor: CRIMSON, width: 32, height: 32 }}>
              <SmartToyIcon sx={{ fontSize: 18 }} />
            </Avatar>
            <Paper elevation={1} sx={{ p: 1.5, borderRadius: 2, border: BORDER }}>
              <CircularProgress size={16} sx={{ color: CRIMSON }} />
            </Paper>
          </Box>
        )}
        <div ref={messagesEndRef} />
      </Box>
      <Box sx={{ p: 2, borderTop: BORDER, display: 'flex', gap: 1 }}>
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
              borderRadius: 2,
              '&:hover fieldset': { borderColor: CRIMSON },
              '&.Mui-focused fieldset': { borderColor: CRIMSON },
            },
          }}
        />
        <IconButton
          onClick={() => handleSend()}
          disabled={!input.trim() || chatMutation.isPending}
          sx={{
            bgcolor: CRIMSON,
            color: 'white',
            '&:hover': { bgcolor: '#B0122A' },
            '&:disabled': { bgcolor: 'rgba(0,0,0,0.12)' },
          }}
        >
          <SendIcon />
        </IconButton>
      </Box>
    </Paper>
  );
};

export default ComplianceChat;
