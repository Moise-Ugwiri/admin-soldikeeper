/* eslint-disable */
import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
  useTheme,
  useMediaQuery,
  Fade,
  CircularProgress
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  AdminPanelSettings,
  Security,
  Login as LoginIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';

const AdminLogin = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const { login, user, isAuthenticated } = useAuth();

  // Local state
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect if already authenticated as admin
  useEffect(() => {
    if (isAuthenticated && user?.isAdmin) {
      const from = location.state?.from?.pathname || '/admin';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, user, navigate, location]);

  // Handle input change
  const handleInputChange = (field) => (event) => {
    setCredentials(prev => ({
      ...prev,
      [field]: event.target.value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  // Handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate inputs
      if (!credentials.email || !credentials.password) {
        throw new Error('Please fill in all fields');
      }

      // Attempt login
      await login(credentials);
      
      // Login successful - let ProtectedAdminRoute handle admin verification
      // The navigation will happen automatically when the user context updates
      
    } catch (error) {
      setError(error.message || 'Invalid credentials. Please try again.');
      setLoading(false);
    }
    // Don't set loading to false here - let the navigation happen first
  };

  // Handle show/hide password
  const handleTogglePassword = () => {
    setShowPassword(prev => !prev);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: theme.palette.mode === 'dark'
          ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)'
          : 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
        p: 2
      }}
    >
      <Fade in timeout={800}>
        <Card
          elevation={24}
          sx={{
            maxWidth: 480,
            width: '100%',
            borderRadius: 3,
            overflow: 'hidden',
            backgroundColor: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`
          }}
        >
          {/* Header */}
          <Box
            sx={{
              background: theme.palette.mode === 'dark'
                ? 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)'
                : 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
              color: 'white',
              p: 3,
              textAlign: 'center'
            }}
          >
            <AdminPanelSettings sx={{ fontSize: 48, mb: 1 }} />
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Admin Portal
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Secure access to SoldiKeeper administration
            </Typography>
          </Box>

          <CardContent sx={{ p: 4 }}>
            {/* Security Notice */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                mb: 3,
                p: 2,
                borderRadius: 1,
                backgroundColor: theme.palette.info.light + '20',
                border: `1px solid ${theme.palette.info.light}`
              }}
            >
              <Security color="info" />
              <Typography variant="body2" color="info.main">
                This is a secure area. Admin credentials required.
              </Typography>
            </Box>

            {/* Error Alert */}
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Admin Email"
                type="email"
                value={credentials.email}
                onChange={handleInputChange('email')}
                disabled={loading}
                autoComplete="username"
                autoFocus
                sx={{ mb: 3 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AdminPanelSettings color="action" />
                    </InputAdornment>
                  )
                }}
              />

              <TextField
                fullWidth
                label="Admin Password"
                type={showPassword ? 'text' : 'password'}
                value={credentials.password}
                onChange={handleInputChange('password')}
                disabled={loading}
                autoComplete="current-password"
                sx={{ mb: 4 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Security color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={handleTogglePassword}
                        disabled={loading}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />

              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                disabled={loading || !credentials.email || !credentials.password}
                startIcon={loading ? <CircularProgress size={20} /> : <LoginIcon />}
                sx={{
                  py: 1.5,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontSize: 16,
                  fontWeight: 600
                }}
              >
                {loading ? 'Authenticating...' : 'Access Admin Dashboard'}
              </Button>
            </form>

            {/* Footer */}
            <Box sx={{ mt: 4, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Need help? Contact your system administrator
              </Typography>
              <Button
                variant="text"
                size="small"
                onClick={() => navigate('/')}
                sx={{ mt: 1 }}
              >
                Back to Main Site
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Fade>
    </Box>
  );
};

export default AdminLogin;
