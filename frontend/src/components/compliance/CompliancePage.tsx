import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CircularProgress,
  TextField,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Tabs,
  Tab,
  Button,
} from '@mui/material';
import { Scale, ChevronDown, Bot, Search } from 'lucide-react';
import { usePolicies, useFAQs, useReminders } from '../../hooks/useApi';
import { useAuth } from '../../contexts/AuthContext';
import ComplianceUploadPanel from './ComplianceUploadPanel';
import ComplianceChat from './ComplianceChat';

const CompliancePage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [tab, setTab] = useState(0);
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const { data: policies = [], isLoading: policiesLoading, isError: policiesError } = usePolicies(debouncedSearch || undefined);
  const { data: faqs = [], isLoading: faqsLoading, isError: faqsError } = useFAQs();
  const { isLoading: remindersLoading } = useReminders();

  const isLoading = policiesLoading || faqsLoading || remindersLoading;
  const hasError = policiesError || faqsError;

  if (isLoading) {
    return (
      <Box sx={{ width: '100%', maxWidth: '100%' }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <CircularProgress sx={{ color: '#EF4444' }} />
        </Box>
      </Box>
    );
  }

  if (hasError) {
    return (
      <Box sx={{ width: '100%', maxWidth: '100%' }}>
        <Card
          sx={{
            textAlign: 'center',
            py: 8,
            backgroundColor: '#FFFFFF',
            border: '1px solid #E5E7EB',
            borderRadius: '12px',
          }}
        >
          <Typography variant="h2" sx={{ fontSize: '18px', fontWeight: 600, color: '#111827', mb: 1 }}>
            Error Loading Compliance Data
          </Typography>
          <Typography variant="body2" sx={{ fontSize: '14px', color: '#6B7280', mb: 2 }}>
            Failed to load compliance information. Please try again.
          </Typography>
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', maxWidth: '100%' }}>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Scale size={24} color="#EF4444" />
          <Typography
            variant="h1"
            component="h1"
            sx={{
              fontSize: '26px',
              fontWeight: 600,
              color: '#111827',
            }}
          >
            Compliance & Policies
          </Typography>
        </Box>
        <Typography
          variant="body2"
          sx={{
            fontSize: '14px',
            color: '#6B7280',
          }}
        >
          Access company policies and FAQs
        </Typography>
      </Box>

      {/* Tabs */}
      <Box sx={{ mb: 3 }}>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={{
            borderBottom: '1px solid #E5E7EB',
            '& .MuiTab-root': { fontWeight: 500, fontSize: '14px', color: '#6B7280', textTransform: 'none' },
            '& .Mui-selected': { color: '#EF4444' },
            '& .MuiTabs-indicator': { backgroundColor: '#EF4444', height: '2px' },
          }}
        >
          <Tab icon={<Bot size={20} />} iconPosition="start" label="AI Assistant" />
          <Tab label="Policies & FAQs" />
        </Tabs>
      </Box>

      {/* Tab Content */}
      {tab === 0 && (
        isAdmin ? (
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <ComplianceUploadPanel />
            </Grid>
            <Grid item xs={12} md={8}>
              <ComplianceChat embedded />
            </Grid>
          </Grid>
        ) : (
          <ComplianceChat embedded={false} />
        )
      )}

      {tab === 1 && (
        <Grid container spacing={3}>
          {/* Left Column - Policies */}
          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                placeholder="Search policies..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <Box sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
                      <Search size={20} color="#6B7280" />
                    </Box>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    height: '44px',
                    borderRadius: '999px',
                    border: '1px solid #E5E7EB',
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

            <Box>
              <Typography variant="h2" sx={{ fontSize: '18px', fontWeight: 600, color: '#111827', mb: 3 }}>
                Policies
              </Typography>
              {policies.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body2" sx={{ fontSize: '14px', color: '#6B7280' }}>
                    No policies found
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {policies.map((policy) => (
                    <Card
                      key={policy.id}
                      sx={{
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #E5E7EB',
                        borderRadius: '12px',
                        padding: '24px',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          boxShadow: '0 4px 12px rgba(239, 68, 68, 0.12)',
                          borderColor: '#FCA5A5',
                          backgroundColor: '#FEF2F2',
                          transform: 'translateY(-2px)',
                        },
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                        <Typography variant="h3" sx={{ fontSize: '16px', fontWeight: 500, color: '#111827' }}>
                          {policy.title}
                        </Typography>
                        {policy.version && (
                          <Chip
                            label={`v${policy.version}`}
                            size="small"
                            sx={{
                              backgroundColor: '#F3F4F6',
                              color: '#111827',
                              fontSize: '11px',
                              borderRadius: '999px',
                              height: 'auto',
                              padding: '4px 8px',
                            }}
                          />
                        )}
                      </Box>
                      {policy.content && (
                        <Typography
                          variant="body2"
                          sx={{
                            fontSize: '14px',
                            color: '#6B7280',
                            mb: 2,
                            display: '-webkit-box',
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          {policy.content}
                        </Typography>
                      )}
                      <Button
                        variant="outlined"
                        sx={{
                          borderColor: '#E5E7EB',
                          color: '#111827',
                          fontSize: '14px',
                          fontWeight: 500,
                          textTransform: 'none',
                          '&:hover': {
                            borderColor: '#EF4444',
                            backgroundColor: '#FEF2F2',
                          },
                        }}
                      >
                        View
                      </Button>
                    </Card>
                  ))}
                </Box>
              )}
            </Box>
          </Grid>

          {/* Right Column - FAQs */}
          <Grid item xs={12} md={6}>
            <Box>
              <Typography variant="h2" sx={{ fontSize: '18px', fontWeight: 600, color: '#111827', mb: 3 }}>
                Frequently Asked Questions
              </Typography>
              {faqs.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body2" sx={{ fontSize: '14px', color: '#6B7280' }}>
                    No FAQs available
                  </Typography>
                </Box>
              ) : (
                <Box>
                  {faqs.map((faq) => (
                    <Accordion
                      key={faq.id}
                      defaultExpanded={false}
                      sx={{
                        mb: 2,
                        borderRadius: '12px',
                        border: '1px solid #E5E7EB',
                        backgroundColor: '#FFFFFF',
                        transition: 'all 0.2s ease',
                        '&:before': { display: 'none' },
                        '&.Mui-expanded': {
                          margin: '0 0 16px 0',
                        },
                        '&:hover': {
                          boxShadow: '0 4px 12px rgba(239, 68, 68, 0.12)',
                          borderColor: '#FCA5A5',
                          backgroundColor: '#FEF2F2',
                        },
                      }}
                    >
                      <AccordionSummary
                        expandIcon={<ChevronDown size={16} color="#6B7280" />}
                        sx={{
                          '& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': {
                            transform: 'rotate(180deg)',
                          },
                        }}
                      >
                        <Box>
                          <Typography variant="subtitle1" sx={{ fontSize: '14px', fontWeight: 500, color: '#111827', mb: 1 }}>
                            {faq.question}
                          </Typography>
                          {faq.category && (
                            <Chip
                              label={faq.category}
                              size="small"
                              sx={{
                                backgroundColor: '#F3F4F6',
                                color: '#111827',
                                fontSize: '11px',
                                borderRadius: '999px',
                                height: 'auto',
                                padding: '4px 8px',
                              }}
                            />
                          )}
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Typography variant="body2" sx={{ fontSize: '14px', color: '#6B7280' }}>
                          {faq.answer}
                        </Typography>
                      </AccordionDetails>
                    </Accordion>
                  ))}
                </Box>
              )}
            </Box>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default CompliancePage;
