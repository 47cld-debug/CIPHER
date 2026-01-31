import React from 'react';
import { Card, CardContent, Typography, Box, Chip, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import GavelIcon from '@mui/icons-material/Gavel';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import type { ComplianceRemindersData } from '../../../types/dashboard';

interface ComplianceRemindersWidgetProps {
  data: ComplianceRemindersData;
}

const ComplianceRemindersWidget: React.FC<ComplianceRemindersWidgetProps> = ({ data }) => {
  const navigate = useNavigate();

  const getDaysUntilDue = (dueDate?: string) => {
    if (!dueDate) return null;
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getUrgencyColor = (days: number | null) => {
    if (days === null) return '#9e9e9e';
    if (days < 0) return '#f44336';
    if (days <= 7) return '#ff9800';
    return '#4caf50';
  };

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
      onClick={() => navigate('/compliance')}
    >
      <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 }, '&:last-child': { pb: { xs: 2, sm: 2.5, md: 3 } } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <GavelIcon sx={{ color: '#DC143C', fontSize: { xs: 24, md: 28 } }} />
          <Typography variant="h6" sx={{ color: '#DC143C', fontWeight: 600, fontSize: { xs: '1rem', md: '1.25rem' } }}>
            Compliance Reminders
          </Typography>
        </Box>

        {data.pending > 0 && (
          <Alert
            severity="warning"
            icon={<WarningIcon />}
            sx={{
              mb: 2,
              backgroundColor: 'rgba(255, 152, 0, 0.1)',
              border: '1px solid rgba(255, 152, 0, 0.3)',
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {data.pending} pending reminder{data.pending !== 1 ? 's' : ''}
            </Typography>
          </Alert>
        )}

        {data.reminders.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <CheckCircleIcon sx={{ fontSize: 48, color: '#4caf50', mb: 1 }} />
            <Typography variant="body2" color="text.secondary">
              All reminders completed!
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {data.reminders.map((reminder) => {
              const daysUntil = getDaysUntilDue(reminder.due_date);
              const urgencyColor = getUrgencyColor(daysUntil);
              
              return (
                <Box
                  key={reminder.id}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    border: `1px solid ${urgencyColor}40`,
                    backgroundColor: `${urgencyColor}08`,
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                    <Chip
                      label={reminder.type}
                      size="small"
                      sx={{
                        backgroundColor: `${urgencyColor}20`,
                        color: urgencyColor,
                        fontWeight: 600,
                        fontSize: '0.7rem',
                      }}
                    />
                    {daysUntil !== null && (
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: 600,
                          color: urgencyColor,
                          px: 1,
                          py: 0.5,
                          borderRadius: 1,
                          backgroundColor: `${urgencyColor}15`,
                        }}
                      >
                        {daysUntil < 0
                          ? `${Math.abs(daysUntil)} days overdue`
                          : daysUntil === 0
                          ? 'Due today'
                          : `${daysUntil} days left`}
                      </Typography>
                    )}
                  </Box>
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    {reminder.message}
                  </Typography>
                  {reminder.due_date && (
                    <Typography variant="caption" color="text.secondary">
                      Due: {new Date(reminder.due_date).toLocaleDateString()}
                    </Typography>
                  )}
                </Box>
              );
            })}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default ComplianceRemindersWidget;
