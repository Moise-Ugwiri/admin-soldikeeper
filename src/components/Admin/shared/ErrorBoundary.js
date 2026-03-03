/* eslint-disable */
import React, { Component } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Alert,
  AlertTitle,
  Collapse,
  IconButton
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  BugReport as BugReportIcon,
  Home as HomeIcon
} from '@mui/icons-material';

/**
 * ErrorBoundary - A component that catches JavaScript errors in child components
 * 
 * Features:
 * - Catches errors in child component tree
 * - Displays friendly error UI
 * - Retry functionality
 * - Error reporting
 * - Expandable error details for developers
 * - Fallback to home option
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({ errorInfo });

    // Report error to external service if configured
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log to error reporting service (e.g., Sentry, LogRocket)
    this.reportError(error, errorInfo);
  }

  reportError = (error, errorInfo) => {
    // This would typically send to an error reporting service
    const errorReport = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo?.componentStack,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      component: this.props.componentName || 'Unknown'
    };

    // Log to console for development
    if (process.env.NODE_ENV === 'development') {
      console.group('Error Report');
      console.log('Error:', errorReport);
      console.groupEnd();
    }

    // In production, send to error tracking service
    // Example: Sentry.captureException(error);
  };

  handleRetry = () => {
    const { maxRetries = 3 } = this.props;
    const { retryCount } = this.state;

    if (retryCount < maxRetries) {
      this.setState(prevState => ({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: prevState.retryCount + 1
      }));
    }
  };

  handleGoHome = () => {
    window.location.href = this.props.homePath || '/admin';
  };

  toggleDetails = () => {
    this.setState(prevState => ({
      showDetails: !prevState.showDetails
    }));
  };

  render() {
    const {
      hasError,
      error,
      errorInfo,
      showDetails,
      retryCount
    } = this.state;

    const {
      children,
      fallback,
      maxRetries = 3,
      showRetry = true,
      showHomeButton = true,
      showErrorDetails = process.env.NODE_ENV === 'development',
      title = 'Something went wrong',
      message = 'We apologize for the inconvenience. Please try again or contact support if the problem persists.'
    } = this.props;

    if (hasError) {
      // Custom fallback UI
      if (fallback) {
        return fallback({
          error,
          errorInfo,
          retry: this.handleRetry,
          canRetry: retryCount < maxRetries
        });
      }

      // Default error UI
      return (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 300,
            p: 3
          }}
        >
          <Paper
            elevation={3}
            sx={{
              maxWidth: 600,
              width: '100%',
              p: 4,
              textAlign: 'center'
            }}
          >
            <BugReportIcon
              sx={{
                fontSize: 64,
                color: 'error.main',
                mb: 2
              }}
            />

            <Typography variant="h5" gutterBottom fontWeight="bold">
              {title}
            </Typography>

            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ mb: 3 }}
            >
              {message}
            </Typography>

            {/* Action buttons */}
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mb: 3 }}>
              {showRetry && retryCount < maxRetries && (
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<RefreshIcon />}
                  onClick={this.handleRetry}
                >
                  Try Again ({maxRetries - retryCount} attempts left)
                </Button>
              )}

              {showHomeButton && (
                <Button
                  variant="outlined"
                  startIcon={<HomeIcon />}
                  onClick={this.handleGoHome}
                >
                  Go to Dashboard
                </Button>
              )}
            </Box>

            {/* Error details (for developers) */}
            {showErrorDetails && error && (
              <Box sx={{ mt: 2, textAlign: 'left' }}>
                <Button
                  size="small"
                  onClick={this.toggleDetails}
                  endIcon={showDetails ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  sx={{ mb: 1 }}
                >
                  {showDetails ? 'Hide Details' : 'Show Details'}
                </Button>

                <Collapse in={showDetails}>
                  <Alert severity="error" sx={{ textAlign: 'left' }}>
                    <AlertTitle>Error Details</AlertTitle>
                    <Typography
                      variant="caption"
                      component="pre"
                      sx={{
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                        fontFamily: 'monospace',
                        fontSize: '0.75rem',
                        maxHeight: 200,
                        overflow: 'auto'
                      }}
                    >
                      {error.toString()}
                      {'\n\n'}
                      {errorInfo?.componentStack}
                    </Typography>
                  </Alert>
                </Collapse>
              </Box>
            )}

            {/* Retry exhausted message */}
            {retryCount >= maxRetries && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                <AlertTitle>Maximum retries reached</AlertTitle>
                Please refresh the page or contact support if the issue persists.
              </Alert>
            )}
          </Paper>
        </Box>
      );
    }

    return children;
  }
}

/**
 * withErrorBoundary - HOC to wrap components with ErrorBoundary
 */
export const withErrorBoundary = (WrappedComponent, errorBoundaryProps = {}) => {
  const WithErrorBoundary = (props) => (
    <ErrorBoundary
      componentName={WrappedComponent.displayName || WrappedComponent.name}
      {...errorBoundaryProps}
    >
      <WrappedComponent {...props} />
    </ErrorBoundary>
  );

  WithErrorBoundary.displayName = `WithErrorBoundary(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;
  
  return WithErrorBoundary;
};

/**
 * useErrorHandler - Hook for handling errors in functional components
 */
export const useErrorHandler = () => {
  const [error, setError] = React.useState(null);

  const handleError = React.useCallback((err) => {
    setError(err);
  }, []);

  const clearError = React.useCallback(() => {
    setError(null);
  }, []);

  const throwError = React.useCallback((err) => {
    throw err;
  }, []);

  // If there's an error, throw it to be caught by ErrorBoundary
  if (error) {
    throw error;
  }

  return { handleError, clearError, throwError };
};

export default ErrorBoundary;
