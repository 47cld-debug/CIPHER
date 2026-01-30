import React, { useState } from 'react';
import {
  Box,
  Typography,
  Container,
  Paper,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  TextField,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
} from '@mui/material';
import GavelIcon from '@mui/icons-material/Gavel';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { usePolicies, useFAQs, useReminders } from '../../hooks/useApi';
import AIChatAssistant from './AIChatAssistant';

const CompliancePage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [faqCategory, setFaqCategory] = useState<string>('');

  const { data: policies = [], isLoading: policiesLoading, isError: policiesError, error: policiesErrorData } = usePolicies(search || undefined);
  const { data: faqs = [], isLoading: faqsLoading, isError: faqsError, error: faqsErrorData } = useFAQs(faqCategory || undefined);
  const { data: reminders = [], isLoading: remindersLoading, isError: remindersError, error: remindersErrorData } = useReminders();

  const isLoading = policiesLoading || faqsLoading || remindersLoading;
  const hasError = policiesError || faqsError || remindersError;

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <CircularProgress sx={{ color: '#DC143C' }} />
        </Box>
      </Container>
    );
  }

  if (hasError) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
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
            Error Loading Compliance Data
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {(policiesErrorData || faqsErrorData || remindersErrorData) instanceof Error
              ? (policiesErrorData || faqsErrorData || remindersErrorData)?.message
              : 'Failed to load compliance information. Please try again.'}
          </Typography>
        </Paper>
      </Container>
    );
  }

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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
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
            <GavelIcon sx={{ color: 'white', fontSize: 32 }} />
          </Box>
          <Box>
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
              Compliance & Policies
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Access policies, FAQs, and compliance reminders
            </Typography>
          </Box>
        </Box>
      </Paper>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              border: '1px solid rgba(220, 20, 60, 0.1)',
              mb: 3,
            }}
          >
            <TextField
              fullWidth
              label="Search Policies"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
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
              placeholder="Search by title or content..."
            />
          </Paper>

          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              border: '1px solid rgba(220, 20, 60, 0.1)',
            }}
          >
            <Typography variant="h6" sx={{ color: '#DC143C', fontWeight: 600, mb: 3 }}>
              Policies
            </Typography>
            {policies.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body2" color="text.secondary">
                  No policies found
                </Typography>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {policies.map((policy) => (
                  <Card
                    key={policy.id}
                    sx={{
                      border: '1px solid rgba(220, 20, 60, 0.1)',
                      borderRadius: 2,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        boxShadow: 4,
                        borderColor: '#DC143C',
                      },
                    }}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                        <Typography variant="h6" sx={{ color: '#DC143C', fontWeight: 600, fontSize: '1rem' }}>
                          {policy.title}
                        </Typography>
                        {policy.version && (
                          <Chip label={`v${policy.version}`} size="small" sx={{ backgroundColor: 'rgba(220, 20, 60, 0.1)', color: '#DC143C' }} />
                        )}
                      </Box>
                      {policy.category && (
                        <Chip
                          label={policy.category}
                          size="small"
                          sx={{ mb: 1, backgroundColor: 'rgba(255, 107, 53, 0.1)', color: '#FF6B35' }}
                        />
                      )}
                      {policy.content && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          {policy.content.length > 150 ? `${policy.content.substring(0, 150)}...` : policy.content}
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </Box>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              border: '1px solid rgba(220, 20, 60, 0.1)',
              mb: 3,
            }}
          >
            <Typography variant="h6" sx={{ color: '#DC143C', fontWeight: 600, mb: 2 }}>
              Reminders
            </Typography>
            {reminders.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  No pending reminders
                </Typography>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {reminders.map((reminder) => (
                  <Card
                    key={reminder.id}
                    sx={{
                      border: reminder.completed ? '1px solid rgba(76, 175, 80, 0.3)' : '1px solid rgba(220, 20, 60, 0.3)',
                      borderRadius: 2,
                      backgroundColor: reminder.completed ? 'rgba(76, 175, 80, 0.05)' : 'rgba(220, 20, 60, 0.05)',
                    }}
                  >
                    <CardContent sx={{ py: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                            {reminder.type}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {reminder.message}
                          </Typography>
                          {reminder.due_date && (
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                              Due: {new Date(reminder.due_date).toLocaleDateString()}
                            </Typography>
                          )}
                        </Box>
                        <Chip
                          label={reminder.completed ? 'Completed' : 'Pending'}
                          size="small"
                          sx={{
                            backgroundColor: reminder.completed ? '#4caf50' : '#ff9800',
                            color: 'white',
                            fontWeight: 600,
                          }}
                        />
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            )}
          </Paper>

          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              border: '1px solid rgba(220, 20, 60, 0.1)',
            }}
          >
            <Typography variant="h6" sx={{ color: '#DC143C', fontWeight: 600, mb: 3 }}>
              Frequently Asked Questions
            </Typography>
            {faqs.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body2" color="text.secondary">
                  No FAQs available
                </Typography>
              </Box>
            ) : (
              <Box>
                {faqs.map((faq) => (
                  <Accordion
                    key={faq.id}
                    sx={{
                      mb: 1,
                      borderRadius: 2,
                      '&:before': { display: 'none' },
                      border: '1px solid rgba(220, 20, 60, 0.1)',
                      '&:hover': {
                        borderColor: '#DC143C',
                      },
                    }}
                  >
                    <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#DC143C' }} />}>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#DC143C' }}>
                          {faq.question}
                        </Typography>
                        {faq.category && (
                          <Chip
                            label={faq.category}
                            size="small"
                            sx={{ mt: 1, backgroundColor: 'rgba(255, 107, 53, 0.1)', color: '#FF6B35' }}
                          />
                        )}
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Typography variant="body2" color="text.secondary">
                        {faq.answer}
                      </Typography>
                    </AccordionDetails>
                  </Accordion>
                ))}
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
      <AIChatAssistant />
    </Container>
  );
};

export default CompliancePage;
