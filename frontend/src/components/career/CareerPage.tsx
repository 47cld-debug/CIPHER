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
  Chip,
  Tabs,
  Tab,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import WorkIcon from '@mui/icons-material/Work';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SchoolIcon from '@mui/icons-material/School';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import StarIcon from '@mui/icons-material/Star';
import PsychologyIcon from '@mui/icons-material/Psychology';
import { Link } from 'react-router-dom';
import {
  useGoals,
  useAppraisals,
  useCareerGrowthSummary,
  useCareerMentorSuggestions,
} from '../../hooks/useApi';
import { gradients } from '../../theme/palette';

const CRIMSON = '#DC143C';
const ORANGE = '#FF6B35';
const BORDER = '1px solid rgba(220, 20, 60, 0.1)';
const BORDER_HOVER = 'rgba(220, 20, 60, 0.25)';

const CareerPage: React.FC = () => {
  const [tab, setTab] = useState(0);

  const { data: goals = [], isLoading: goalsLoading, isError: goalsError, error: goalsErrorData } = useGoals();
  const { data: appraisals = [], isLoading: appraisalsLoading, isError: appraisalsError, error: appraisalsErrorData } = useAppraisals();
  const { data: growthSummary, isLoading: growthLoading } = useCareerGrowthSummary();
  const { data: mentorSuggestions, isLoading: mentorLoading } = useCareerMentorSuggestions();

  const isLoading = goalsLoading || appraisalsLoading || growthLoading;
  const hasError = goalsError || appraisalsError;

  const getStatusColor = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes('complete') || s.includes('done')) return '#4caf50';
    if (s.includes('progress') || s.includes('active') || s.includes('high') || s.includes('medium') || s.includes('low')) return '#ff9800';
    if (s.includes('pending') || s.includes('draft') || s.includes('not_started')) return '#9e9e9e';
    return CRIMSON;
  };

  if (isLoading && !growthSummary) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <CircularProgress sx={{ color: CRIMSON }} />
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
            background: `linear-gradient(135deg, rgba(220, 20, 60, 0.05) 0%, rgba(255, 107, 53, 0.05) 100%)`,
            border: `2px dashed rgba(220, 20, 60, 0.3)`,
            borderRadius: 3,
          }}
        >
          <Typography variant="h6" sx={{ color: CRIMSON, mb: 1, fontWeight: 600 }}>
            Error Loading Career Data
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {(goalsErrorData || appraisalsErrorData) instanceof Error
              ? (goalsErrorData || appraisalsErrorData)?.message
              : 'Failed to load career information. Please try again.'}
          </Typography>
        </Paper>
      </Container>
    );
  }

  const progressPct = growthSummary?.progress_pct ?? 0;
  const nextTargetRole = growthSummary?.next_target_role ?? null;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Box
          sx={{
            p: 2,
            borderRadius: 2,
            background: gradients.redToOrange,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <WorkIcon sx={{ color: 'white', fontSize: 32 }} />
        </Box>
        <Box>
          <Typography variant="h4" component="h1" sx={{ color: CRIMSON, fontWeight: 700, mb: 0.5, letterSpacing: '-0.5px' }}>
            Career Growth
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Track progress, skills, and AI career suggestions
          </Typography>
        </Box>
      </Box>

      {/* Career Progress % */}
      <Paper
        elevation={0}
        sx={{
          mb: 3,
          borderRadius: 3,
          overflow: 'hidden',
          border: BORDER,
        }}
      >
        <Box sx={{ p: 3, background: 'linear-gradient(135deg, rgba(220, 20, 60, 0.06) 0%, rgba(255, 107, 53, 0.06) 100%)' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Box sx={{ position: 'relative', display: 'inline-flex' }}>
              <CircularProgress
                variant="determinate"
                value={Math.min(100, progressPct)}
                size={72}
                thickness={4}
                sx={{ color: CRIMSON }}
              />
              <Box
                sx={{
                  top: 0,
                  left: 0,
                  bottom: 0,
                  right: 0,
                  position: 'absolute',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Typography variant="body1" component="span" sx={{ fontWeight: 700, color: CRIMSON }}>
                  {Math.round(progressPct)}%
                </Typography>
              </Box>
            </Box>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.primary' }}>
                Career Progress
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {nextTargetRole ? `Next target: ${nextTargetRole}` : 'Skill match + certifications + ongoing courses'}
              </Typography>
            </Box>
          </Box>
          <LinearProgress
            variant="determinate"
            value={Math.min(100, progressPct)}
            sx={{
              mt: 2,
              height: 8,
              borderRadius: 4,
              bgcolor: 'rgba(220, 20, 60, 0.15)',
              '& .MuiLinearProgress-bar': { bgcolor: CRIMSON },
            }}
          />
        </Box>
      </Paper>

      {/* AI Career Mentor block */}
      <Paper elevation={0} sx={{ mb: 3, borderRadius: 3, border: BORDER, overflow: 'hidden' }}>
        <Box sx={{ p: 2, background: gradients.redToOrange, color: 'white', display: 'flex', alignItems: 'center', gap: 1 }}>
          <PsychologyIcon sx={{ fontSize: 24 }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>AI Career Mentor</Typography>
        </Box>
        <Box sx={{ p: 3 }}>
          {mentorLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
              <CircularProgress size={28} sx={{ color: CRIMSON }} />
            </Box>
          ) : mentorSuggestions ? (
            <>
              <Typography variant="subtitle2" sx={{ color: CRIMSON, fontWeight: 600, mb: 1 }}>Career path suggestions</Typography>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', mb: 2 }}>
                {mentorSuggestions.suggestions || 'No suggestions yet.'}
              </Typography>
              <Typography variant="subtitle2" sx={{ color: CRIMSON, fontWeight: 600, mb: 1 }}>Skill gaps</Typography>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                {mentorSuggestions.skill_gaps || 'Complete courses and certifications to see skill gaps.'}
              </Typography>
            </>
          ) : (
            <Typography variant="body2" color="text.secondary">Load AI suggestions to see personalized career paths and skill gaps.</Typography>
          )}
        </Box>
      </Paper>

      {/* Tabs: Goals (in-progress courses) | Skills | Achievements | Career Goals & Appraisals */}
      <Paper elevation={0} sx={{ borderRadius: 3, border: BORDER, overflow: 'hidden' }}>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={{
            borderBottom: BORDER,
            '& .MuiTab-root': { fontWeight: 600 },
            '& .Mui-selected': { color: CRIMSON },
            '& .MuiTabs-indicator': { backgroundColor: CRIMSON },
          }}
        >
          <Tab label="Goals" />
          <Tab label="Skills" />
          <Tab label="Achievements" />
          <Tab label="Career Goals & Appraisals" />
        </Tabs>
        <Box sx={{ p: 3 }}>
          {/* Goals tab: courses started but not completed */}
          {tab === 0 && (
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Courses you have started but not yet completed.
              </Typography>
              {(growthSummary?.goals_tab?.length ?? 0) === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                  No in-progress courses. Enroll in courses from Learning to see them here.
                </Typography>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {growthSummary!.goals_tab.map((item) => (
                    <Card
                      key={item.enrollment_id}
                      component={Link}
                      to={`/learning`}
                      sx={{
                        border: BORDER,
                        borderRadius: 2,
                        textDecoration: 'none',
                        color: 'inherit',
                        transition: 'all 0.3s ease',
                        '&:hover': { boxShadow: 4, borderColor: BORDER_HOVER },
                      }}
                    >
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                          <Typography variant="h6" sx={{ color: CRIMSON, fontWeight: 600, fontSize: '1rem' }}>
                            {item.course_title}
                          </Typography>
                          <Chip
                            label={item.progress_state.replace('_', ' ')}
                            size="small"
                            sx={{
                              backgroundColor: `${getStatusColor(item.progress_state)}20`,
                              color: getStatusColor(item.progress_state),
                              fontWeight: 600,
                            }}
                          />
                        </Box>
                        <Typography variant="caption" color="text.secondary">Continue in Learning →</Typography>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              )}
            </Box>
          )}

          {/* Skills tab: existing, from courses, from certs */}
          {tab === 1 && (
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Skills you have (existing), from completed courses, and from completed certifications.
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle2" sx={{ color: CRIMSON, fontWeight: 600, mb: 1 }}>Skills you have</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {(growthSummary?.skills_tab?.existing?.length ?? 0) === 0 ? (
                      <Typography variant="caption" color="text.secondary">None recorded</Typography>
                    ) : (
                      growthSummary!.skills_tab.existing.map((s) => (
                        <Chip key={s.id} label={s.name} size="small" sx={{ borderColor: 'rgba(220, 20, 60, 0.3)', color: CRIMSON }} variant="outlined" />
                      ))
                    )}
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle2" sx={{ color: CRIMSON, fontWeight: 600, mb: 1 }}>From completed courses</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {(growthSummary?.skills_tab?.from_courses?.length ?? 0) === 0 ? (
                      <Typography variant="caption" color="text.secondary">None yet</Typography>
                    ) : (
                      growthSummary!.skills_tab.from_courses.map((s) => (
                        <Chip key={s.id} label={s.name} size="small" sx={{ borderColor: 'rgba(220, 20, 60, 0.3)', color: CRIMSON }} variant="outlined" />
                      ))
                    )}
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle2" sx={{ color: CRIMSON, fontWeight: 600, mb: 1 }}>From certifications</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {(growthSummary?.skills_tab?.from_certs?.length ?? 0) === 0 ? (
                      <Typography variant="caption" color="text.secondary">None yet</Typography>
                    ) : (
                      growthSummary!.skills_tab.from_certs.map((s) => (
                        <Chip key={s.id} label={s.name} size="small" sx={{ borderColor: 'rgba(220, 20, 60, 0.3)', color: CRIMSON }} variant="outlined" />
                      ))
                    )}
                  </Box>
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Achievements tab: completed certifications only */}
          {tab === 2 && (
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Completed certifications (uploaded and verified).
              </Typography>
              {(growthSummary?.achievements_tab?.length ?? 0) === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                  No completed certifications yet. Complete courses and upload certificates in Learning.
                </Typography>
              ) : (
                <Grid container spacing={2}>
                  {growthSummary!.achievements_tab.map((a, i) => (
                    <Grid item xs={12} sm={6} md={4} key={i}>
                      <Card sx={{ border: BORDER, borderRadius: 2, height: '100%', '&:hover': { boxShadow: 4, borderColor: BORDER_HOVER } }}>
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1 }}>
                            <EmojiEventsIcon sx={{ color: CRIMSON, fontSize: 28 }} />
                            <Box>
                              <Typography variant="subtitle1" sx={{ fontWeight: 600, color: CRIMSON }}>
                                {a.certification_name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">{a.issuing_organization}</Typography>
                            </Box>
                          </Box>
                          <Typography variant="caption" color="text.secondary">
                            {a.date_completed ? new Date(a.date_completed).toLocaleDateString() : '—'}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>
          )}

          {/* Career Goals & Appraisals tab */}
          {tab === 3 && (
            <Box>
              <Typography variant="subtitle2" sx={{ color: CRIMSON, fontWeight: 600, mb: 2 }}>Career Goals</Typography>
              {goals.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>No goals set yet.</Typography>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
                  {goals.map((goal) => (
                    <Card key={goal.id} sx={{ border: BORDER, borderRadius: 2, '&:hover': { boxShadow: 4, borderColor: BORDER_HOVER } }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                          <Typography variant="h6" sx={{ color: CRIMSON, fontWeight: 600, fontSize: '1rem' }}>{goal.title}</Typography>
                          <Chip label={goal.status} size="small" sx={{ backgroundColor: `${getStatusColor(goal.status)}20`, color: getStatusColor(goal.status), fontWeight: 600 }} />
                        </Box>
                        {goal.description && <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{goal.description}</Typography>}
                        {typeof goal.progress === 'number' && (
                          <LinearProgress variant="determinate" value={Math.min(100, goal.progress)} sx={{ mt: 1, height: 6, borderRadius: 3, bgcolor: 'rgba(220, 20, 60, 0.1)', '& .MuiLinearProgress-bar': { bgcolor: CRIMSON } }} />
                        )}
                        {goal.target_date && <Typography variant="caption" color="text.secondary">Target: {new Date(goal.target_date).toLocaleDateString()}</Typography>}
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              )}
              <Typography variant="subtitle2" sx={{ color: CRIMSON, fontWeight: 600, mb: 2 }}>Performance Appraisals</Typography>
              {appraisals.length === 0 ? (
                <Typography variant="body2" color="text.secondary">No appraisals available.</Typography>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {appraisals.map((appraisal) => (
                    <Card key={appraisal.id} sx={{ border: BORDER, borderRadius: 2, '&:hover': { boxShadow: 4, borderColor: BORDER_HOVER } }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                          <Typography variant="h6" sx={{ color: CRIMSON, fontWeight: 600, fontSize: '1rem' }}>{appraisal.period}</Typography>
                          <Chip label={appraisal.status} size="small" sx={{ backgroundColor: `${getStatusColor(appraisal.status)}20`, color: getStatusColor(appraisal.status), fontWeight: 600 }} />
                        </Box>
                        {appraisal.performance_rating && <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}><strong>Rating:</strong> {appraisal.performance_rating}</Typography>}
                        {appraisal.self_review && <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}><strong>Self Review:</strong> {appraisal.self_review}</Typography>}
                        {appraisal.manager_feedback && <Typography variant="body2" color="text.secondary"><strong>Manager Feedback:</strong> {appraisal.manager_feedback}</Typography>}
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              )}
            </Box>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default CareerPage;
