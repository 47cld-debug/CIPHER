import React from 'react';
import { Snackbar, Alert, Box } from '@mui/material';
import { useUI } from '../../contexts/UIContext';

const NotificationContainer: React.FC = () => {
  const { notifications, removeNotification } = useUI();

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 80,
        right: 20,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        maxWidth: '400px',
      }}
    >
      {notifications.map((notification) => (
        <Alert
          key={notification.id}
          severity={notification.type}
          onClose={() => removeNotification(notification.id)}
          sx={{
            borderRadius: 2,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            animation: 'slideIn 0.3s ease-out',
            '@keyframes slideIn': {
              from: {
                transform: 'translateX(100%)',
                opacity: 0,
              },
              to: {
                transform: 'translateX(0)',
                opacity: 1,
              },
            },
            '&.MuiAlert-standardSuccess': {
              backgroundColor: '#4caf50',
              color: 'white',
              '& .MuiAlert-icon': {
                color: 'white',
              },
            },
            '&.MuiAlert-standardError': {
              backgroundColor: '#f44336',
              color: 'white',
              '& .MuiAlert-icon': {
                color: 'white',
              },
            },
            '&.MuiAlert-standardWarning': {
              backgroundColor: '#ff9800',
              color: 'white',
              '& .MuiAlert-icon': {
                color: 'white',
              },
            },
            '&.MuiAlert-standardInfo': {
              backgroundColor: '#2196f3',
              color: 'white',
              '& .MuiAlert-icon': {
                color: 'white',
              },
            },
          }}
        >
          {notification.message}
        </Alert>
      ))}
    </Box>
  );
};

export default NotificationContainer;
