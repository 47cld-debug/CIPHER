import React from 'react';
import { Typography, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Shield } from 'lucide-react';
import type { ComplianceRemindersData } from '../../../types/dashboard';

interface ComplianceRemindersWidgetProps {
  data: ComplianceRemindersData;
}

const ComplianceRemindersWidget: React.FC<ComplianceRemindersWidgetProps> = ({ data }) => {
  const navigate = useNavigate();

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
        <Shield size={20} color="#6B7280" />
        <Typography variant="h3" sx={{ fontSize: '16px', fontWeight: 500, color: '#111827' }}>
          Compliance Reminders
        </Typography>
      </Box>

      {data.reminders.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 3 }}>
          <Typography variant="body2" sx={{ fontSize: '14px', color: '#6B7280' }}>
            All reminders completed!
          </Typography>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {data.reminders.slice(0, 3).map((reminder) => (
            <Box
              key={reminder.id}
              sx={{
                p: 2,
                borderRadius: '12px',
                border: '1px solid #E5E7EB',
                backgroundColor: '#FFFFFF',
                transition: 'all 0.2s ease',
                '&:hover': {
                  boxShadow: '0 2px 8px rgba(239, 68, 68, 0.1)',
                  borderColor: '#FCA5A5',
                  backgroundColor: '#FEF2F2',
                },
              }}
            >
              <Typography variant="body2" sx={{ fontSize: '14px', fontWeight: 500, color: '#111827', mb: 0.5 }}>
                {reminder.type}
              </Typography>
              <Typography variant="body2" sx={{ fontSize: '14px', color: '#6B7280' }}>
                {reminder.message}
              </Typography>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default ComplianceRemindersWidget;
