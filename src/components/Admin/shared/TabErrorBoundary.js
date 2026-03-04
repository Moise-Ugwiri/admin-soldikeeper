import React from 'react';
import { Typography, Button, Paper } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

class TabErrorBoundary extends React.Component {
  state = { hasError: false, error: null };
  
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error, errorInfo) {
    console.error('Tab Error:', error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <Paper sx={{ p: 4, textAlign: 'center', m: 2 }}>
          <ErrorOutlineIcon sx={{ fontSize: 48, color: 'error.main', mb: 2 }} />
          <Typography variant="h6" gutterBottom>Something went wrong in this section</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {this.state.error?.message || 'An unexpected error occurred'}
          </Typography>
          <Button variant="contained" onClick={() => this.setState({ hasError: false, error: null })}>
            Try Again
          </Button>
        </Paper>
      );
    }
    return this.props.children;
  }
}

export default TabErrorBoundary;
