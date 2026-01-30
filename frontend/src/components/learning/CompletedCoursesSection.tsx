import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import LaunchIcon from '@mui/icons-material/Launch';
import type { Enrollment } from '../../types/learning';
import CertificateUpload from './CertificateUpload';
import { useState } from 'react';

interface CompletedCoursesSectionProps {
  enrollments: Enrollment[];
}

const CompletedCoursesSection: React.FC<CompletedCoursesSectionProps> = ({ enrollments }) => {
  const [certificateModalOpen, setCertificateModalOpen] = useState(false);
  const [selectedEnrollmentId, setSelectedEnrollmentId] = useState<number | null>(null);

  const completedEnrollments = enrollments.filter(
    (e) => e.progress_state === 'COMPLETED'
  );

  if (completedEnrollments.length === 0) {
    return null;
  }

  const handleUploadCertificate = (enrollmentId: number) => {
    setSelectedEnrollmentId(enrollmentId);
    setCertificateModalOpen(true);
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 3,
          border: '1px solid rgba(220, 20, 60, 0.1)',
          background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.05) 0%, rgba(56, 142, 60, 0.05) 100%)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <CheckCircleIcon sx={{ color: '#4caf50', fontSize: 28 }} />
          <Typography variant="h6" sx={{ color: '#4caf50', fontWeight: 600 }}>
            Completed Courses
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          Courses you have completed. Upload certificates to verify your completion.
        </Typography>
      </Paper>

      <Grid container spacing={3}>
        {completedEnrollments.map((enrollment) => {
          const hasCertificate = enrollment.certificate?.file_url;
          
          return (
            <Grid item xs={12} sm={6} md={4} key={enrollment.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 3,
                  border: '1px solid rgba(76, 175, 80, 0.2)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: 4,
                    borderColor: '#4caf50',
                    transform: 'translateY(-4px)',
                  },
                }}
              >
                <Box
                  sx={{
                    height: 4,
                    background: 'linear-gradient(90deg, #4caf50 0%, #66bb6a 100%)',
                  }}
                />
                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                    <Typography
                      variant="h6"
                      component="h2"
                      sx={{
                        color: '#4caf50',
                        fontWeight: 600,
                        fontSize: '1.1rem',
                        flex: 1,
                        mr: 1,
                      }}
                    >
                      {enrollment.course.title}
                    </Typography>
                    <Chip
                      icon={<CheckCircleIcon />}
                      label="Completed"
                      size="small"
                      sx={{
                        bgcolor: '#4caf50',
                        color: 'white',
                        fontWeight: 600,
                      }}
                    />
                  </Box>
                  {enrollment.course.description && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        mb: 2,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {enrollment.course.description}
                    </Typography>
                  )}
                  {hasCertificate ? (
                    <Box sx={{ mt: 2 }}>
                      <Button
                        size="small"
                        variant="outlined"
                        fullWidth
                        href={hasCertificate}
                        target="_blank"
                        startIcon={<LaunchIcon />}
                        sx={{
                          borderColor: '#4caf50',
                          color: '#4caf50',
                          '&:hover': {
                            borderColor: '#388e3c',
                            bgcolor: 'rgba(76, 175, 80, 0.05)',
                          },
                        }}
                      >
                        View Certificate
                      </Button>
                    </Box>
                  ) : (
                    <Box sx={{ mt: 2 }}>
                      <Button
                        size="small"
                        variant="contained"
                        fullWidth
                        startIcon={<UploadFileIcon />}
                        onClick={() => handleUploadCertificate(enrollment.id)}
                        sx={{
                          bgcolor: '#4caf50',
                          '&:hover': {
                            bgcolor: '#388e3c',
                          },
                        }}
                      >
                        Upload Certificate
                      </Button>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {selectedEnrollmentId && (
        <CertificateUpload
          open={certificateModalOpen}
          onClose={() => {
            setCertificateModalOpen(false);
            setSelectedEnrollmentId(null);
          }}
          enrollmentId={selectedEnrollmentId}
        />
      )}
    </Box>
  );
};

export default CompletedCoursesSection;
