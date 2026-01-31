import React, { useState } from 'react';
import {
  Box,
  Typography,
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
import {
  useGoals,
  useAppraisals,
  useCareerSummary,
  useCareerSkills,
  useCareerAchievements,
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
  const { data: summary, isLoading: summaryLoading } = useCareerSummary();
  const { data: skills = [], isLoading: skillsLoading } = useCareerSkills();
  const { data: achievements = [], isLoading: achievementsLoading } = useCareerAchievements();

  const isLoading = goalsLoading || appraisalsLoading || summaryLoading;
  const hasError = goalsError || appraisalsError;

  const getStatusColor = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes('complete') || s.includes('done')) return '#4caf50';
    if (s.includes('progress') || s.includes('active')) return '#ff9800';
    if (s.includes('pending') || s.includes('draft')) return '#9e9e9e';
    return CRIMSON;
  };

  if (isLoading && !summary) {
    return (
      <Box sx={{ width: '100%', maxWidth: '100%' }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <CircularProgress sx={{ color: CRIMSON }} />
        </Box>
      </Box>
    );
  }

  if (hasError) {
    return (
      <Box sx={{ width: '100%', maxWidth: '100%' }}>
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
      </Box>
    );
  }

  const pathProgress = summary?.progress_pct ?? 0;
  const skillsCount = skills?.length ?? 0;
  const achievementsCount = achievements?.length ?? 0;

  return (
    <Box sx={{ width: '100%', maxWidth: '100%' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: { xs: 2.5, md: 3 }, flexWrap: { xs: 'wrap', sm: 'nowrap' } }}>
        <Box
          sx={{
            p: 2,
            borderRadius: 2,
            background: gradients.redToOrange,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <WorkIcon sx={{ color: 'white', fontSize: { xs: 28, md: 32 } }} />
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="h4" component="h1" sx={{ color: CRIMSON, fontWeight: 700, mb: 0.5, letterSpacing: '-0.5px', fontSize: { xs: '1.75rem', md: '2.125rem' } }}>
            Career Growth
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Track your goals, skills, and achievements
          </Typography>
        </Box>
      </Box>

      {/* Gradient career path banner */}
      <Paper
        elevation={0}
        sx={{
          mb: 3,
          borderRadius: 3,
          overflow: 'hidden',
          border: BORDER,
        }}
      >
        <Box
          sx={{
            background: gradients.redToOrange,
            color: 'white',
            p: 3,
          }}
        >
          <Typography variant="overline" sx={{ opacity: 0.9, letterSpacing: 1 }}>
            Career Path
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 700, mt: 0.5 }}>
            {summary?.path_label ?? 'Individual Contributor'}
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 2, alignItems: 'center' }}>
            {summary?.current_level && (
              <Chip label={summary.current_level} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.25)', color: 'white' }} />
            )}
            {summary?.next_level && (
              <Typography variant="body2" sx={{ opacity: 0.95 }}>
                → Next: {summary.next_level}
              </Typography>
            )}
            {(summary?.years_experience != null || summary?.company_years != null) && (
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {[summary.years_experience != null && `${summary.years_experience} yrs experience`, summary.company_years != null && `${summary.company_years} yrs at company`]
                  .filter(Boolean)
                  .join(' · ')}
              </Typography>
            )}
          </Box>
          <LinearProgress
            variant="determinate"
            value={pathProgress}
            sx={{
              mt: 2,
              height: 8,
              borderRadius: 4,
              bgcolor: 'rgba(255,255,255,0.3)',
              '& .MuiLinearProgress-bar': { bgcolor: 'white' },
            }}
          />
          <Typography variant="caption" sx={{ display: 'block', mt: 1, opacity: 0.9 }}>
            Path progress: {pathProgress}%
          </Typography>
        </Box>
      </Paper>

      {/* Three metric cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: BORDER, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
              <TrendingUpIcon sx={{ color: CRIMSON, fontSize: 28 }} />
              <Typography variant="subtitle2" color="text.secondary">Career progress</Typography>
            </Box>
            <Typography variant="h4" sx={{ color: CRIMSON, fontWeight: 700 }}>{pathProgress}%</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: BORDER, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
              <SchoolIcon sx={{ color: CRIMSON, fontSize: 28 }} />
              <Typography variant="subtitle2" color="text.secondary">Skills</Typography>
            </Box>
            <Typography variant="h4" sx={{ color: CRIMSON, fontWeight: 700 }}>{skillsCount}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: BORDER, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
              <EmojiEventsIcon sx={{ color: CRIMSON, fontSize: 28 }} />
              <Typography variant="subtitle2" color="text.secondary">Achievements</Typography>
            </Box>
            <Typography variant="h4" sx={{ color: CRIMSON, fontWeight: 700 }}>{achievementsCount}</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Tabs: Goals | Skills | Achievements | Appraisals */}
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
          <Tab label="Appraisals" />
        </Tabs>
        <Box sx={{ p: 3 }}>
          {tab === 0 && (
            <Box>
              {goals.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                  No goals set yet
                </Typography>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {goals.map((goal) => (
                    <Card
                      key={goal.id}
                      sx={{
                        border: BORDER,
                        borderRadius: 2,
                        transition: 'all 0.3s ease',
                        '&:hover': { boxShadow: 4, borderColor: BORDER_HOVER },
                      }}
                    >
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                          <Typography variant="h6" sx={{ color: CRIMSON, fontWeight: 600, fontSize: '1rem' }}>
                            {goal.title}
                          </Typography>
                          <Chip
                            label={goal.status}
                            size="small"
                            sx={{
                              backgroundColor: `${getStatusColor(goal.status)}20`,
                              color: getStatusColor(goal.status),
                              fontWeight: 600,
                            }}
                          />
                        </Box>
                        {goal.description && (
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                            {goal.description}
                          </Typography>
                        )}
                        {typeof goal.progress === 'number' && (
                          <Box sx={{ mb: 1 }}>
                            <Typography variant="caption" color="text.secondary">Progress</Typography>
                            <LinearProgress
                              variant="determinate"
                              value={Math.min(100, Math.max(0, goal.progress))}
                              sx={{
                                mt: 0.5,
                                height: 6,
                                borderRadius: 3,
                                bgcolor: 'rgba(220, 20, 60, 0.1)',
                                '& .MuiLinearProgress-bar': { bgcolor: CRIMSON },
                              }}
                            />
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                              {goal.progress}%
                            </Typography>
                          </Box>
                        )}
                        {goal.target_date && (
                          <Typography variant="caption" color="text.secondary">
                            Target: {new Date(goal.target_date).toLocaleDateString()}
                          </Typography>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              )}
            </Box>
          )}

          {tab === 1 && (
            <Box>
              {skillsLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress size={32} sx={{ color: CRIMSON }} />
                </Box>
              ) : skills.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                  No skills recorded yet. Complete courses to build your skills.
                </Typography>
              ) : (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {skills.map((skill) => (
                    <Chip
                      key={skill.id}
                      label={skill.name}
                      size="medium"
                      sx={{
                        borderColor: 'rgba(220, 20, 60, 0.3)',
                        color: CRIMSON,
                        fontWeight: 500,
                        '&:hover': { bgcolor: 'rgba(220, 20, 60, 0.08)' },
                      }}
                      variant="outlined"
                    />
                  ))}
                </Box>
              )}
            </Box>
          )}

          {tab === 2 && (
            <Box>
              {achievementsLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress size={32} sx={{ color: CRIMSON }} />
                </Box>
              ) : achievements.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                  No achievements yet. Complete goals and courses to earn achievements.
                </Typography>
              ) : (
                <List disablePadding>
                  {achievements.map((a, i) => (
                    <ListItem key={i} sx={{ px: 0, py: 1, borderBottom: i < achievements.length - 1 ? BORDER : 'none' }}>
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        <StarIcon sx={{ color: CRIMSON, fontSize: 22 }} />
                      </ListItemIcon>
                      <ListItemText
                        primary={a.title}
                        secondary={a.date ? new Date(a.date).toLocaleDateString() : a.type}
                        primaryTypographyProps={{ fontWeight: 600, color: 'text.primary' }}
                        secondaryTypographyProps={{ variant: 'caption' }}
                      />
                      <Chip label={a.type} size="small" sx={{ bgcolor: 'rgba(220, 20, 60, 0.1)', color: CRIMSON }} />
                    </ListItem>
                  ))}
                </List>
              )}
            </Box>
          )}

          {tab === 3 && (
            <Box>
              {appraisals.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                  No appraisals available
                </Typography>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {appraisals.map((appraisal) => (
                    <Card
                      key={appraisal.id}
                      sx={{
                        border: BORDER,
                        borderRadius: 2,
                        transition: 'all 0.3s ease',
                        '&:hover': { boxShadow: 4, borderColor: BORDER_HOVER },
                      }}
                    >
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                          <Typography variant="h6" sx={{ color: CRIMSON, fontWeight: 600, fontSize: '1rem' }}>
                            {appraisal.period}
                          </Typography>
                          <Chip
                            label={appraisal.status}
                            size="small"
                            sx={{
                              backgroundColor: `${getStatusColor(appraisal.status)}20`,
                              color: getStatusColor(appraisal.status),
                              fontWeight: 600,
                            }}
                          />
                        </Box>
                        {appraisal.self_review && (
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            <strong>Self Review:</strong> {appraisal.self_review}
                          </Typography>
                        )}
                        {appraisal.manager_feedback && (
                          <Typography variant="body2" color="text.secondary">
                            <strong>Manager Feedback:</strong> {appraisal.manager_feedback}
                          </Typography>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              )}
            </Box>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default CareerPage;
