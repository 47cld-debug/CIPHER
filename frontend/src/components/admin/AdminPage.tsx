import React, { useState } from 'react';
import { Box, Typography, Container, Paper, Grid, Card, CardContent, Button, Tabs, Tab } from '@mui/material';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import SchoolIcon from '@mui/icons-material/School';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import PeopleIcon from '@mui/icons-material/People';
import CertificateVerification from './CertificateVerification';
import CourseManagement from './CourseManagement';

const AdminPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper
        elevation={0}
        sx={{
          background: 'linear-gradient(135deg, rgba(220, 20, 60, 0.05) 0%, rgba(255, 107, 53, 0.05) 100%)',
          p: 4,
          mb: 4,
          borderRadius: 3,
          border: '1px solid rgba(220, 20, 60, 0.1)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              background: 'linear-gradient(135deg, #DC143C 0%, #FF6B35 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <AdminPanelSettingsIcon sx={{ color: 'white', fontSize: 32 }} />
          </Box>
          <Box>
            <Typography
              variant="h4"
              component="h1"
              sx={{
                color: '#DC143C',
                fontWeight: 700,
                mb: 0.5,
                letterSpacing: '-0.5px',
              }}
            >
              Admin Dashboard
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage portal content and users
            </Typography>
          </Box>
        </Box>
      </Paper>

      <Paper elevation={0} sx={{ mb: 3, borderRadius: 3, border: '1px solid rgba(220, 20, 60, 0.1)' }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          sx={{
            borderBottom: '1px solid rgba(220, 20, 60, 0.1)',
            '& .MuiTab-root': {
              color: '#666',
              fontWeight: 600,
              '&.Mui-selected': {
                color: '#DC143C',
              },
            },
            '& .MuiTabs-indicator': {
              bgcolor: '#DC143C',
            },
          }}
        >
          <Tab icon={<VerifiedUserIcon />} iconPosition="start" label="Certificate Verification" />
          <Tab icon={<SchoolIcon />} iconPosition="start" label="Course Management" />
        </Tabs>
      </Paper>

      {tabValue === 0 && <CertificateVerification />}
      {tabValue === 1 && <CourseManagement />}
    </Container>
  );
};

export default AdminPage;
