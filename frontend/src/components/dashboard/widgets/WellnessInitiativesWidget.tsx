import React from 'react';
import { Typography, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import type { WellnessInitiativesData } from '../../../types/dashboard';

interface WellnessInitiativesWidgetProps {
  data: WellnessInitiativesData;
}

const WellnessInitiativesWidget: React.FC<WellnessInitiativesWidgetProps> = ({ data }) => {
  const navigate = useNavigate();

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
        <Heart size={20} color="#6B7280" />
        <Typography variant="h3" sx={{ fontSize: '16px', fontWeight: 500, color: '#111827' }}>
          Wellness Initiatives
        </Typography>
      </Box>

      {data.initiatives.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 3 }}>
          <Typography variant="body2" sx={{ fontSize: '14px', color: '#6B7280' }}>
            No initiatives available at the moment
          </Typography>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {data.initiatives.slice(0, 2).map((initiative) => (
            <Box
              key={initiative.id}
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
              <Typography variant="subtitle1" sx={{ fontSize: '14px', fontWeight: 500, color: '#111827', mb: 1 }}>
                {initiative.title}
              </Typography>
              {initiative.description && (
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: '14px',
                    color: '#6B7280',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {initiative.description}
                </Typography>
              )}
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default WellnessInitiativesWidget;
