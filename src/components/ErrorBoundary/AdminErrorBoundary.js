/* eslint-disable */
import React, { Component } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Alert,
  AlertTitle,
  Collapse,
  IconButton,
  Stack,
  Chip
} from '@mui/material';
import {
  ErrorOutline,
  Refresh,
  ExpandMore,
  ExpandLess,
  BugReport,
  Home
} from '@mui/icons-material';

/**
 * Enhanced Error Boundary with retry logic for Admin components
 * Catches JavaScript errors anywhere in the child component tree
 */
class AdminErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
      showDetails: false,
      isRetrying: false
    };
    
    this.maxRetries = props.maxRetries || 3;
    this.retryDelay = props.retryDelay || 1000;
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to console
    console.error('🚨 AdminErrorBoundary caught an error:', error);
    console.error('Error Info:', errorInfo);

    // Update state with error details
    this.setState({
      error,
      errorInfo
    });

    // Log to error reporting service (e.g., Sentry)
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Auto-retry if enabled and retry limit not reached
    if (this.props.autoRetry && this.state.retryCount < this.maxRetries) {
      this.handleAutoRetry();
    }
  }

  handleAutoRetry = () => {
    const retryDelay = this.retryDelay * Math.pow(2, this.state.retryCount);
    
    console.log(`🔄 Auto-retry ${this.state.retryCount + 1}/${this.maxRetries} in ${retryDelay}ms`);
    
    this.setState({ isRetrying: true });

    setTimeout(() => {
      this.setState(prevState => ({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: prevState.retryCount + 1,
        isRetrying: false
      }));
    }, retryDelay);
  };

  handleRetry = () => {
    console.log('🔄 Manual retry triggered');
    
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
      showDetails: false,
      isRetrying: false
    });
  };

  handleGoHome = () => {
    window.location.href = '/admin';
  };

  toggleDetails = () => {
    this.setState(prevState => ({
      showDetails: !prevState.showDetails
    }));
  };

  render() {
    if (this.state.hasError) {
      const { error, errorInfo, retryCount, showDetails, isRetrying } = this.state;
      const { fallback, componentName = 'Component' } = this.props;

      // If custom fallback is provided, use it
      if (fallback) {
        return fallback(error, this.handleRetry);
      }

      // Default error UI
      return (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '400px',
            p: 3
          }}
        >
          <Paper
            elevation={3}
            sx={{
              maxWidth: 600,
              width: '100%',
              p: 4,
              borderRadius: 3,
              background: theme => theme.palette.mode === 'dark'
                ? 'linear-gradient(135deg, rgba(211, 47, 47, 0.1) 0%, rgba(244, 67, 54, 0.05) 100%)'
                : 'linear-gradient(135deg, rgba(211, 47, 47, 0.05) 0%, rgba(244, 67, 54, 0.02) 100%)',
              border: theme => `1px solid ${theme.palette.error.main}30`
            }}
          >
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <ErrorOutline
                sx={{
                  fontSize: 64,
                  color: 'error.main',
                  mb: 2,
                  animation: 'pulse 2s infinite',
                  '@keyframes pulse': {
                    '0%, 100%': { opacity: 1 },
                    '50%': { opacity: 0.5 }
                  }
                }}
              />
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                Oops! Something went wrong
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                {componentName} encountered an error
              </Typography>
              
              {retryCount > 0 && (
                <Chip
                  label={`Retry attempt: ${retryCount}/${this.maxRetries}`}
                  color="warning"
                  size="small"
                  sx={{ mb: 2 }}
                />
              )}
            </Box>

            <Alert severity="error" sx={{ mb: 3 }}>
              <AlertTitle>Error Details</AlertTitle>
              <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                {error?.message || 'An unexpected error occurred'}
              </Typography>
            </Alert>

            <Stack direction="row" spacing={2} justifyContent="center" sx={{ mb: 2 }}>
              <Button
                variant="contained"
                startIcon={isRetrying ? <Refresh className="spinning" /> : <Refresh />}
                onClick={this.handleRetry}
                disabled={isRetrying}
                sx={{
                  '@keyframes spin': {
                    '0%': { transform: 'rotate(0deg)' },
                    '100%': { transform: 'rotate(360deg)' }
                  },
                  '& .spinning': {
                    animation: 'spin 1s linear infinite'
                  }
                }}
              >
                {isRetrying ? 'Retrying...' : 'Try Again'}
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<Home />}
                onClick={this.handleGoHome}
              >
                Go to Dashboard
              </Button>
            </Stack>

            {/* Collapsible technical details */}
            <Box>
              <Button
                fullWidth
                onClick={this.toggleDetails}
                endIcon={showDetails ? <ExpandLess /> : <ExpandMore />}
                startIcon={<BugReport />}
                size="small"
                sx={{ justifyContent: 'space-between' }}
              >
                Technical Details
              </Button>
              
              <Collapse in={showDetails}>
                <Paper
                  variant="outlined"
                  sx={{
                    mt: 2,
                    p: 2,
                    backgroundColor: theme => theme.palette.mode === 'dark'
                      ? 'rgba(0, 0, 0, 0.3)'
                      : 'rgba(0, 0, 0, 0.02)',
                    maxHeight: 300,
                    overflow: 'auto'
                  }}
                >
                  <Typography variant="caption" component="div" sx={{ mb: 1, fontWeight: 'bold' }}>
                    Error Stack:
                  </Typography>
                  <Typography
                    variant="caption"
                    component="pre"
                    sx={{
                      fontFamily: 'monospace',
                      fontSize: '0.7rem',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      color: 'text.secondary'
                    }}
                  >
                    {error?.stack || 'No stack trace available'}
                  </Typography>
                  
                  {errorInfo?.componentStack && (
                    <>
                      <Typography variant="caption" component="div" sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>
                        Component Stack:
                      </Typography>
                      <Typography
                        variant="caption"
                        component="pre"
                        sx={{
                          fontFamily: 'monospace',
                          fontSize: '0.7rem',
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word',
                          color: 'text.secondary'
                        }}
                      >
                        {errorInfo.componentStack}
                      </Typography>
                    </>
                  )}
                </Paper>
              </Collapse>
            </Box>

            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: 'block', textAlign: 'center', mt: 3 }}
            >
              If this error persists, please contact support
            </Typography>
          </Paper>
        </Box>
      );
    }

    // No error, render children normally
    return this.props.children;
  }
}

export default AdminErrorBoundary;
