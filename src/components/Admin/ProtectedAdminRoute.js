import React, { useEffect } from 'react';
import { Box, CircularProgress, Alert, Typography } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import AdminLogin from './AdminLogin';

const ProtectedAdminRoute = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  // If not authenticated, show admin login
  if (!isAuthenticated) {
    return <AdminLogin />;
  }

  // If authenticated but not admin, show error
  if (isAuthenticated && user && !user.isAdmin) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 3
        }}
      >
        <Alert severity="error" sx={{ maxWidth: 400 }}>
          <Typography variant="h6" gutterBottom>
            Access Denied
          </Typography>
          <Typography variant="body2">
            Admin privileges required. Your account ({user.email}) does not have administrator access.
          </Typography>
        </Alert>
      </Box>
    );
  }

  // User is authenticated and is admin, show the admin dashboard
  return children;
};

export default ProtectedAdminRoute;
