import React from 'react';
import { Card, CardContent, Typography, Box, Chip, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import FavoriteIcon from '@mui/icons-material/Favorite';
import type { WellnessInitiativesData } from '../../../types/dashboard';

interface WellnessInitiativesWidgetProps {
  data: WellnessInitiativesData;
}

const WellnessInitiativesWidget: React.FC<WellnessInitiativesWidgetProps> = ({ data }) => {
  const navigate = useNavigate();

  const getCategoryColor = (category?: string) => {
    switch (category) {
      case 'Physical Wellness': return '#4caf50';
      case 'Mental Wellness': return '#2196f3';
      case 'Financial Wellness': return '#ff9800';
      default: return '#9e9e9e';
    }
  };

  return (
    <Card
      sx={{
        height: '100%',
        borderLeft: '4px solid #FF6B35',
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: 6,
          transform: 'translateY(-2px)',
        },
      }}
    >
      <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 }, '&:last-child': { pb: { xs: 2, sm: 2.5, md: 3 } } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <FavoriteIcon sx={{ color: '#FF6B35', fontSize: { xs: 24, md: 28 } }} />
          <Typography variant="h6" sx={{ color: '#FF6B35', fontWeight: 600, fontSize: { xs: '1rem', md: '1.25rem' } }}>
            Wellness Initiatives
          </Typography>
        </Box>

        {data.available > 0 && (
          <Box
            sx={{
              mb: 2,
              p: 1.5,
              borderRadius: 2,
              background: 'linear-gradient(135deg, rgba(255, 107, 53, 0.1) 0%, rgba(220, 20, 60, 0.1) 100%)',
              textAlign: 'center',
            }}
          >
            <Typography variant="h6" sx={{ color: '#FF6B35', fontWeight: 700 }}>
              {data.available}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Available Initiative{data.available !== 1 ? 's' : ''}
            </Typography>
          </Box>
        )}

        {data.initiatives.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <Typography variant="body2" color="text.secondary">
              No initiatives available at the moment
            </Typography>
            <Button
              size="small"
              variant="outlined"
              sx={{ mt: 2 }}
              onClick={() => navigate('/wellness')}
            >
              View Wellness Page
            </Button>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {data.initiatives.map((initiative) => {
              const categoryColor = getCategoryColor(initiative.category);
              
              return (
                <Box
                  key={initiative.id}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    border: `1px solid ${categoryColor}40`,
                    backgroundColor: `${categoryColor}08`,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      backgroundColor: `${categoryColor}15`,
                      borderColor: categoryColor,
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, flex: 1, color: categoryColor }}>
                      {initiative.title}
                    </Typography>
                    {initiative.category && (
                      <Chip
                        label={initiative.category}
                        size="small"
                        sx={{
                          backgroundColor: `${categoryColor}20`,
                          color: categoryColor,
                          fontWeight: 600,
                          fontSize: '0.7rem',
                        }}
                      />
                    )}
                  </Box>
                  {initiative.description && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        mb: 1,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {initiative.description}
                    </Typography>
                  )}
                  {(initiative.start_date || initiative.end_date) && (
                    <Typography variant="caption" color="text.secondary">
                      {initiative.start_date && `From: ${new Date(initiative.start_date).toLocaleDateString()}`}
                      {initiative.start_date && initiative.end_date && ' • '}
                      {initiative.end_date && `To: ${new Date(initiative.end_date).toLocaleDateString()}`}
                    </Typography>
                  )}
                </Box>
              );
            })}
            <Button
              fullWidth
              variant="outlined"
              onClick={() => navigate('/wellness')}
              sx={{
                borderColor: '#FF6B35',
                color: '#FF6B35',
                textTransform: 'none',
                '&:hover': {
                  borderColor: '#DC143C',
                  backgroundColor: 'rgba(255, 107, 53, 0.05)',
                },
              }}
            >
              View All Initiatives
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default WellnessInitiativesWidget;
