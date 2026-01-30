import React from 'react';
import { Card, CardContent, Typography, Box, Chip, LinearProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import WorkIcon from '@mui/icons-material/Work';
import type { CareerGoalsData } from '../../../types/dashboard';

interface CareerGoalsWidgetProps {
  data: CareerGoalsData;
}

const CareerGoalsWidget: React.FC<CareerGoalsWidgetProps> = ({ data }) => {
  const navigate = useNavigate();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return '#4caf50';
      case 'IN_PROGRESS': return '#2196f3';
      case 'PENDING': return '#ff9800';
      default: return '#9e9e9e';
    }
  };

  const totalGoals = data.active_goals + data.completed_goals;
  const completionRate = totalGoals > 0 ? Math.round((data.completed_goals / totalGoals) * 100) : 0;

  return (
    <Card
      sx={{
        height: '100%',
        borderLeft: '4px solid #DC143C',
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: 6,
          transform: 'translateY(-2px)',
        },
        cursor: 'pointer',
      }}
      onClick={() => navigate('/career')}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <WorkIcon sx={{ color: '#DC143C', fontSize: 28 }} />
          <Typography variant="h6" sx={{ color: '#DC143C', fontWeight: 600 }}>
            Career Goals
          </Typography>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Completion Rate
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, color: '#DC143C' }}>
              {completionRate}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={completionRate}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: 'rgba(220, 20, 60, 0.1)',
              '& .MuiLinearProgress-bar': {
                background: 'linear-gradient(90deg, #DC143C 0%, #FF6B35 100%)',
                borderRadius: 4,
              },
            }}
          />
        </Box>

        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <Box
            sx={{
              flex: 1,
              textAlign: 'center',
              p: 1.5,
              borderRadius: 2,
              backgroundColor: 'rgba(33, 150, 243, 0.1)',
            }}
          >
            <Typography variant="h6" sx={{ color: '#2196f3', fontWeight: 700 }}>
              {data.active_goals}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Active
            </Typography>
          </Box>
          <Box
            sx={{
              flex: 1,
              textAlign: 'center',
              p: 1.5,
              borderRadius: 2,
              backgroundColor: 'rgba(76, 175, 80, 0.1)',
            }}
          >
            <Typography variant="h6" sx={{ color: '#4caf50', fontWeight: 700 }}>
              {data.completed_goals}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Completed
            </Typography>
          </Box>
        </Box>

        {data.goals.length > 0 && (
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: '#DC143C' }}>
              Recent Goals
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {data.goals.map((goal) => (
                <Box
                  key={goal.id}
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    backgroundColor: 'rgba(220, 20, 60, 0.05)',
                    border: '1px solid rgba(220, 20, 60, 0.1)',
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 0.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, flex: 1 }}>
                      {goal.title}
                    </Typography>
                    <Chip
                      label={goal.status.replace('_', ' ')}
                      size="small"
                      sx={{
                        backgroundColor: `${getStatusColor(goal.status)}20`,
                        color: getStatusColor(goal.status),
                        fontWeight: 600,
                        fontSize: '0.7rem',
                        height: 20,
                      }}
                    />
                  </Box>
                  {goal.target_date && (
                    <Typography variant="caption" color="text.secondary">
                      Target: {new Date(goal.target_date).toLocaleDateString()}
                    </Typography>
                  )}
                </Box>
              ))}
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default CareerGoalsWidget;
