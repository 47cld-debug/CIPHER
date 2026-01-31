import React from 'react';
import { Typography, Box, LinearProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Briefcase } from 'lucide-react';
import type { CareerGoalsData } from '../../../types/dashboard';

interface CareerGoalsWidgetProps {
  data: CareerGoalsData;
}

const CareerGoalsWidget: React.FC<CareerGoalsWidgetProps> = ({ data }) => {
  const navigate = useNavigate();

  const totalGoals = data.active_goals + data.completed_goals;
  const completionRate = totalGoals > 0 ? Math.round((data.completed_goals / totalGoals) * 100) : 0;

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
        <Briefcase size={20} color="#6B7280" />
        <Typography variant="h3" sx={{ fontSize: '16px', fontWeight: 500, color: '#111827' }}>
          Career Goals
        </Typography>
      </Box>

      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2" sx={{ fontSize: '14px', color: '#6B7280' }}>
            Completion Rate
          </Typography>
          <Typography variant="body2" sx={{ fontSize: '14px', fontWeight: 500, color: '#111827' }}>
            {completionRate}%
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={completionRate}
          sx={{
            height: 6,
            borderRadius: '999px',
            backgroundColor: '#E5E7EB',
            '& .MuiLinearProgress-bar': {
              backgroundColor: '#EF4444',
              borderRadius: '999px',
            },
          }}
        />
      </Box>

      <Box sx={{ display: 'flex', gap: 2 }}>
        <Box
          sx={{
            flex: 1,
            textAlign: 'center',
            p: 2,
            borderRadius: '12px',
            backgroundColor: '#F9FAFB',
          }}
        >
          <Typography variant="h6" sx={{ fontSize: '18px', fontWeight: 600, color: '#111827', mb: 0.5 }}>
            {data.active_goals}
          </Typography>
          <Typography variant="caption" sx={{ fontSize: '12px', color: '#6B7280' }}>
            Active
          </Typography>
        </Box>
        <Box
          sx={{
            flex: 1,
            textAlign: 'center',
            p: 2,
            borderRadius: '12px',
            backgroundColor: '#F9FAFB',
          }}
        >
          <Typography variant="h6" sx={{ fontSize: '18px', fontWeight: 600, color: '#111827', mb: 0.5 }}>
            {data.completed_goals}
          </Typography>
          <Typography variant="caption" sx={{ fontSize: '12px', color: '#6B7280' }}>
            Completed
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default CareerGoalsWidget;
