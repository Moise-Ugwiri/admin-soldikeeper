/**
 * 🚨 ESCALATION HUB
 * Enhanced Manual Escalation UI for Mission Control
 * 
 * Features:
 * - Quick send templates (4 severity levels)
 * - Custom message composer with full control
 * - Recent escalations timeline
 * - Real-time status feedback
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Snackbar,
  Alert,
  CircularProgress,
  Paper,
  Stack,
  Tooltip,
  IconButton,
  useTheme,
  alpha
} from '@mui/material';
import {
  Send as SendIcon,
  Refresh as RefreshIcon,
  Emergency as EmergencyIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import { AGENTS } from '../../../data/agentRegistry';
import axios from 'axios';

// Severity configurations with emojis and colors
const SEVERITIES = {
  emergency: {
    label: 'Emergency',
    emoji: '🚨',
    color: '#f44336',
    icon: <EmergencyIcon />,
    description: 'Critical system failure requiring immediate action'
  },
  critical: {
    label: 'Critical',
    emoji: '🔴',
    color: '#ff9800',
    icon: <ErrorIcon />,
    description: 'Major issue affecting core functionality'
  },
  warning: {
    label: 'Warning',
    emoji: '⚠️',
    color: '#ffc107',
    icon: <WarningIcon />,
    description: 'Issue requiring attention but not urgent'
  },
  info: {
    label: 'Info',
    emoji: 'ℹ️',
    color: '#2196f3',
    icon: <InfoIcon />,
    description: 'Informational message or status update'
  }
};

// Quick send templates
const QUICK_TEMPLATES = {
  emergency: {
    title: 'CRITICAL SYSTEM ALERT',
    context: 'Emergency situation detected. Immediate administrator intervention required.',
    severity: 'emergency'
  },
  critical: {
    title: 'Critical Issue Detected',
    context: 'A critical issue has been identified that requires urgent attention.',
    severity: 'critical'
  },
  warning: {
    title: 'Warning: Action Required',
    context: 'A warning has been triggered that may require investigation.',
    severity: 'warning'
  },
  info: {
    title: 'System Status Update',
    context: 'Informational update from the system.',
    severity: 'info'
  }
};

const EscalationHub = () => {
  const theme = useTheme();
  
  // Form state
  const [issueTitle, setIssueTitle] = useState('');
  const [context, setContext] = useState('');
  const [severity, setSeverity] = useState('warning');
  const [fromAgent, setFromAgent] = useState('00-apollo');
  
  // UI state
  const [sending, setSending] = useState(false);
  const [recentEscalations, setRecentEscalations] = useState([]);
  const [loadingRecent, setLoadingRecent] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Load recent escalations on mount
  useEffect(() => {
    fetchRecentEscalations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch recent escalations from API
  const fetchRecentEscalations = async () => {
    setLoadingRecent(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL || 'https://soldikeeper-backend-production.up.railway.app/api'}/admin/escalations?limit=10`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setRecentEscalations(response.data.escalations || []);
    } catch (error) {
      console.error('Failed to fetch recent escalations:', error);
      showSnackbar('Failed to load recent escalations', 'error');
    } finally {
      setLoadingRecent(false);
    }
  };

  // Send escalation to backend
  const sendEscalation = async (escalationData) => {
    setSending(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL || 'https://soldikeeper-backend-production.up.railway.app/api'}/admin/escalations`,
        {
          fromAgent: escalationData.fromAgent,
          issue: escalationData.issue,
          severity: escalationData.severity,
          context: { description: escalationData.context },
          requiresResponse: true
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      showSnackbar('✅ Escalation sent to Telegram successfully!', 'success');
      
      // Refresh recent escalations
      setTimeout(() => fetchRecentEscalations(), 1000);
      
      return response.data;
    } catch (error) {
      console.error('Failed to send escalation:', error);
      showSnackbar(`❌ Failed to send escalation: ${error.response?.data?.message || error.message}`, 'error');
      throw error;
    } finally {
      setSending(false);
    }
  };

  // Quick send handler
  const handleQuickSend = async (templateKey) => {
    const template = QUICK_TEMPLATES[templateKey];
    const selectedAgent = AGENTS.find(a => a.id === fromAgent);
    
    await sendEscalation({
      fromAgent: fromAgent,
      issue: template.title,
      severity: template.severity,
      context: template.context + ` | From: ${selectedAgent?.emoji} ${selectedAgent?.name}`
    });
  };

  // Custom send handler
  const handleCustomSend = async () => {
    if (!issueTitle.trim() || !context.trim()) {
      showSnackbar('⚠️ Please fill in both title and description', 'warning');
      return;
    }

    await sendEscalation({
      fromAgent,
      issue: issueTitle,
      severity,
      context
    });

    // Clear form on success
    setIssueTitle('');
    setContext('');
    setSeverity('warning');
  };

  // Snackbar helper
  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    // Less than 1 minute
    if (diff < 60000) return 'Just now';
    // Less than 1 hour
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    // Less than 24 hours
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    // Otherwise show date
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  return (
    <Box>
      {/* Quick Send Templates */}
      <Card 
        elevation={3}
        sx={{ 
          mb: 3,
          background: `linear-gradient(135deg, ${alpha(theme.palette.error.main, 0.05)} 0%, ${alpha(theme.palette.background.paper, 1)} 100%)`
        }}
      >
        <CardContent>
          <Typography 
            variant="h6" 
            gutterBottom
            sx={{ 
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              mb: 2
            }}
          >
            ⚡ Quick Send
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Send pre-configured escalations instantly
          </Typography>
          
          <Grid container spacing={2}>
            {Object.entries(QUICK_TEMPLATES).map(([key, template]) => {
              const config = SEVERITIES[template.severity];
              return (
                <Grid item xs={12} sm={6} md={3} key={key}>
                  <Tooltip title={config.description} arrow>
                    <Button
                      fullWidth
                      variant={key === 'emergency' || key === 'critical' ? 'contained' : key === 'warning' ? 'outlined' : 'text'}
                      size="large"
                      disabled={sending}
                      onClick={() => handleQuickSend(key)}
                      startIcon={sending ? <CircularProgress size={20} /> : config.icon}
                      sx={{
                        py: 1.5,
                        bgcolor: key === 'emergency' || key === 'critical' ? config.color : 'transparent',
                        borderColor: key === 'warning' ? config.color : undefined,
                        color: key === 'emergency' || key === 'critical' ? 'white' : config.color,
                        '&:hover': {
                          bgcolor: key === 'emergency' || key === 'critical' 
                            ? alpha(config.color, 0.8) 
                            : alpha(config.color, 0.1),
                          borderColor: config.color
                        },
                        fontWeight: 600,
                        fontSize: '0.9rem'
                      }}
                    >
                      {config.emoji} {config.label}
                    </Button>
                  </Tooltip>
                </Grid>
              );
            })}
          </Grid>
        </CardContent>
      </Card>

      {/* Custom Message Composer */}
      <Card 
        elevation={3}
        sx={{ 
          mb: 3,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.background.paper, 1)} 100%)`
        }}
      >
        <CardContent>
          <Typography 
            variant="h6" 
            gutterBottom
            sx={{ 
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              mb: 2
            }}
          >
            📤 Custom Message
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Compose a custom escalation with full control
          </Typography>

          <Stack spacing={2.5}>
            {/* Issue Title */}
            <TextField
              fullWidth
              label="Issue Title"
              variant="outlined"
              value={issueTitle}
              onChange={(e) => setIssueTitle(e.target.value)}
              placeholder="Enter issue title..."
              inputProps={{ maxLength: 100 }}
              helperText={`${issueTitle.length}/100 characters`}
            />

            {/* Context/Description */}
            <TextField
              fullWidth
              label="Context / Description"
              variant="outlined"
              multiline
              rows={4}
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="Describe the issue or provide context..."
              inputProps={{ maxLength: 500 }}
              helperText={`${context.length}/500 characters`}
            />

            {/* Row: Severity + Agent */}
            <Grid container spacing={2}>
              {/* Severity Selector */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Severity Level</InputLabel>
                  <Select
                    value={severity}
                    label="Severity Level"
                    onChange={(e) => setSeverity(e.target.value)}
                  >
                    {Object.entries(SEVERITIES).map(([key, config]) => (
                      <MenuItem key={key} value={key}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <span>{config.emoji}</span>
                          <span>{config.label}</span>
                          <Chip 
                            label={key} 
                            size="small" 
                            sx={{ 
                              bgcolor: alpha(config.color, 0.2),
                              color: config.color,
                              fontWeight: 600,
                              fontSize: '0.7rem'
                            }} 
                          />
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Agent Selector */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>From Agent</InputLabel>
                  <Select
                    value={fromAgent}
                    label="From Agent"
                    onChange={(e) => setFromAgent(e.target.value)}
                  >
                    {AGENTS.map((agent) => (
                      <MenuItem key={agent.id} value={agent.id}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <span>{agent.emoji}</span>
                          <span style={{ fontWeight: 600 }}>{agent.number}</span>
                          <span>-</span>
                          <span>{agent.name}</span>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            {/* Send Button */}
            <Button
              fullWidth
              variant="contained"
              size="large"
              color="primary"
              disabled={sending || !issueTitle.trim() || !context.trim()}
              onClick={handleCustomSend}
              startIcon={sending ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
              sx={{ 
                py: 1.5,
                fontWeight: 700,
                fontSize: '1rem'
              }}
            >
              {sending ? 'Sending to Telegram...' : 'Send to Telegram'}
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* Recent Escalations */}
      <Card 
        elevation={3}
        sx={{ 
          background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.05)} 0%, ${alpha(theme.palette.background.paper, 1)} 100%)`
        }}
      >
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography 
              variant="h6"
              sx={{ 
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              📋 Recent Escalations
              <Chip 
                label={recentEscalations.length} 
                size="small" 
                color="info"
                sx={{ fontSize: '0.7rem', height: 20, fontWeight: 700 }} 
              />
            </Typography>
            <Tooltip title="Refresh list">
              <IconButton 
                onClick={fetchRecentEscalations} 
                disabled={loadingRecent}
                size="small"
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>

          {loadingRecent ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : recentEscalations.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body2" color="text.secondary">
                No escalations yet. Send your first one above!
              </Typography>
            </Box>
          ) : (
            <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 400 }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Time</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Severity</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Issue</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Agent</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentEscalations.map((escalation) => {
                    const agent = AGENTS.find(a => a.id === escalation.fromAgent);
                    const severityConfig = SEVERITIES[escalation.severity] || SEVERITIES.info;
                    
                    return (
                      <TableRow 
                        key={escalation._id}
                        hover
                        sx={{ 
                          '&:hover': { 
                            bgcolor: alpha(severityConfig.color, 0.05) 
                          }
                        }}
                      >
                        <TableCell sx={{ fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                          {formatTimestamp(escalation.createdAt)}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={severityConfig.emoji + ' ' + severityConfig.label}
                            size="small"
                            sx={{
                              bgcolor: alpha(severityConfig.color, 0.15),
                              color: severityConfig.color,
                              fontWeight: 600,
                              fontSize: '0.7rem',
                              borderLeft: `3px solid ${severityConfig.color}`
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ maxWidth: 300 }}>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              fontWeight: 500,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {escalation.issue}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {agent ? (
                            <Tooltip title={agent.name}>
                              <Chip
                                label={`${agent.emoji} ${agent.number}`}
                                size="small"
                                sx={{
                                  bgcolor: alpha(agent.color, 0.15),
                                  color: agent.color,
                                  fontWeight: 600,
                                  fontSize: '0.7rem'
                                }}
                              />
                            </Tooltip>
                          ) : (
                            <Typography variant="caption" color="text.secondary">
                              Unknown
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={escalation.status || 'pending'}
                            size="small"
                            color={
                              escalation.status === 'resolved' ? 'success' :
                              escalation.status === 'rejected' ? 'error' :
                              'warning'
                            }
                            sx={{ 
                              fontSize: '0.7rem',
                              textTransform: 'capitalize'
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Snackbar for feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default EscalationHub;
