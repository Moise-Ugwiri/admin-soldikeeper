import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Chip,
  Divider,
  TextField,
  Alert,
  Stack,
  Paper,
  IconButton,
  Grid
} from '@mui/material';
import {
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Speed as SpeedIcon,
  Psychology as PsychologyIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import { format, formatDistanceToNow } from 'date-fns';

const severityConfig = {
  info: { color: '#2196f3', icon: InfoIcon, label: 'Info' },
  warning: { color: '#ff9800', icon: WarningIcon, label: 'Warning' },
  critical: { color: '#f44336', icon: ErrorIcon, label: 'Critical' },
  emergency: { color: '#9c27b0', icon: ErrorIcon, label: 'Emergency' }
};

const getResumeStatus = (escalation) => {
  switch (escalation.status) {
    case 'resolved':
      return { label: '✓ Agent Resumed', color: 'success' };
    case 'rejected':
      return { label: '✗ Task Cancelled', color: 'error' };
    case 'auto_resolved':
      return { label: '↻ Auto-resolved', color: 'info' };
    case 'acknowledged':
    case 'investigating':
      return { label: '⏳ Under Review', color: 'warning' };
    default:
      return { label: '⏸ Paused', color: 'default' };
  }
};

const EscalationDetailsDialog = ({ open, escalation, onClose, onRespond }) => {
  const [responseText, setResponseText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!escalation) return null;

  const config = severityConfig[escalation.severity] || severityConfig.warning;
  const SeverityIcon = config.icon;

  const handleApprove = async () => {
    if (!responseText.trim()) {
      setError('Please provide a response before approving');
      return;
    }
    
    setSubmitting(true);
    setError(null);
    
    try {
      await onRespond(escalation._id, responseText, 'approved');
      setResponseText('');
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to approve escalation');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!responseText.trim()) {
      setError('Please provide a reason for rejection');
      return;
    }
    
    setSubmitting(true);
    setError(null);
    
    try {
      await onRespond(escalation._id, responseText, 'rejected');
      setResponseText('');
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to reject escalation');
    } finally {
      setSubmitting(false);
    }
  };

  const isOverdue = escalation.responseDeadline && 
    new Date(escalation.responseDeadline) < new Date() && 
    escalation.status === 'pending';

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderTop: `4px solid ${config.color}`
        }
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={1.5}>
            <SeverityIcon sx={{ color: config.color, fontSize: 28 }} />
            <Typography variant="h5" component="div">
              {escalation.title}
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={3}>
          {/* Status & Metadata */}
          <Box display="flex" flexWrap="wrap" gap={1}>
            <Chip
              label={escalation.status.toUpperCase()}
              size="small"
              sx={{
                backgroundColor: escalation.status === 'pending' ? '#ff9800' : 
                               escalation.status === 'approved' ? '#4caf50' : '#f44336',
                color: 'white',
                fontWeight: 600
              }}
            />
            <Chip
              label={`Severity: ${config.label}`}
              size="small"
              sx={{ backgroundColor: config.color, color: 'white' }}
            />
            <Chip
              label={`Agent: ${escalation.fromAgent || 'Unknown'}`}
              size="small"
              variant="outlined"
            />
            <Chip
              label={`Category: ${escalation.category || 'General'}`}
              size="small"
              variant="outlined"
            />
            {escalation.status !== 'pending' && (
              <Chip
                size="small"
                label={getResumeStatus(escalation).label}
                color={getResumeStatus(escalation).color}
                variant="outlined"
              />
            )}
          </Box>

          {/* Deadline Alert */}
          {isOverdue && (
            <Alert severity="error" icon={<WarningIcon />}>
              <strong>OVERDUE:</strong> Response was due {formatDistanceToNow(new Date(escalation.responseDeadline), { addSuffix: true })}
            </Alert>
          )}

          {escalation.responseDeadline && !isOverdue && escalation.status === 'pending' && (
            <Alert severity="warning" icon={<InfoIcon />}>
              Response deadline: {formatDistanceToNow(new Date(escalation.responseDeadline), { addSuffix: true })}
            </Alert>
          )}

          {/* Description */}
          <Paper sx={{ p: 2, backgroundColor: 'rgba(0,0,0,0.02)' }}>
            <Typography variant="subtitle2" gutterBottom color="text.secondary">
              Description
            </Typography>
            <Typography variant="body1">
              {escalation.description}
            </Typography>
          </Paper>

          {/* Recommended Action */}
          {escalation.recommendedAction && (
            <Paper sx={{ p: 2, backgroundColor: 'rgba(33, 150, 243, 0.05)', borderLeft: '3px solid #2196f3' }}>
              <Typography variant="subtitle2" gutterBottom color="primary">
                💡 Recommended Action
              </Typography>
              <Typography variant="body2">
                {escalation.recommendedAction}
              </Typography>
            </Paper>
          )}

          {/* Metrics Grid */}
          <Grid container spacing={2}>
            <Grid item xs={4}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Box display="flex" alignItems="center" justifyContent="center" gap={0.5} mb={1}>
                  <PsychologyIcon fontSize="small" color="primary" />
                  <Typography variant="caption" color="text.secondary">
                    Confidence
                  </Typography>
                </Box>
                <Typography variant="h5" color="primary">
                  {Math.round((escalation.confidence || 0) * 100)}%
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={4}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Box display="flex" alignItems="center" justifyContent="center" gap={0.5} mb={1}>
                  <TrendingUpIcon fontSize="small" color="warning" />
                  <Typography variant="caption" color="text.secondary">
                    Impact
                  </Typography>
                </Box>
                <Typography variant="h6" color="warning">
                  {escalation.estimatedImpact?.level || 'Unknown'}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={4}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Box display="flex" alignItems="center" justifyContent="center" gap={0.5} mb={1}>
                  <SpeedIcon fontSize="small" color="error" />
                  <Typography variant="caption" color="text.secondary">
                    Urgency
                  </Typography>
                </Box>
                <Typography variant="h6" color="error">
                  {escalation.severity === 'emergency' ? 'IMMEDIATE' :
                   escalation.severity === 'critical' ? 'HIGH' :
                   escalation.severity === 'warning' ? 'MEDIUM' : 'LOW'}
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          {/* Evidence */}
          {escalation.evidence && escalation.evidence.length > 0 && (
            <Box>
              <Typography variant="subtitle2" gutterBottom color="text.secondary">
                Evidence ({escalation.evidence.length})
              </Typography>
              <Stack spacing={1}>
                {escalation.evidence.map((ev, idx) => (
                  <Paper key={idx} sx={{ p: 1.5, backgroundColor: 'rgba(0,0,0,0.02)' }}>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                      <Box flex={1}>
                        <Typography variant="body2" fontWeight={600}>
                          {ev.type && `[${ev.type.toUpperCase()}]`} {ev.description}
                        </Typography>
                        {ev.data && (
                          <Typography variant="caption" color="text.secondary" component="pre" sx={{ mt: 0.5, whiteSpace: 'pre-wrap' }}>
                            {typeof ev.data === 'string' ? ev.data : JSON.stringify(ev.data, null, 2)}
                          </Typography>
                        )}
                      </Box>
                      <Typography variant="caption" color="text.secondary" sx={{ ml: 2, flexShrink: 0 }}>
                        {format(new Date(ev.timestamp), 'MMM d, HH:mm')}
                      </Typography>
                    </Box>
                  </Paper>
                ))}
              </Stack>
            </Box>
          )}

          {/* Notifications Sent */}
          {escalation.notificationsSent && escalation.notificationsSent.length > 0 && (
            <Box>
              <Typography variant="subtitle2" gutterBottom color="text.secondary">
                Notifications Sent
              </Typography>
              <Stack direction="row" spacing={1}>
                {escalation.notificationsSent.map((notif, idx) => (
                  <Chip
                    key={idx}
                    label={`${notif.channel}: ${notif.status}`}
                    size="small"
                    color={notif.status === 'sent' ? 'success' : 'error'}
                    variant="outlined"
                  />
                ))}
              </Stack>
            </Box>
          )}

          <Divider />

          {/* Response Section (only if pending) */}
          {escalation.status === 'pending' && (
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Your Response
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={4}
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                placeholder="Provide your decision and reasoning..."
                disabled={submitting}
              />
              {error && (
                <Alert severity="error" sx={{ mt: 1 }}>
                  {error}
                </Alert>
              )}
            </Box>
          )}

          {/* Existing Response (if resolved) */}
          {escalation.status !== 'pending' && escalation.humanResponse && (
            <Paper sx={{ p: 2, backgroundColor: 'rgba(76, 175, 80, 0.05)' }}>
              <Typography variant="subtitle2" gutterBottom color="success">
                Human Response
              </Typography>
              <Typography variant="body2">
                {escalation.humanResponse}
              </Typography>
              {escalation.respondedAt && (
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                  Responded {formatDistanceToNow(new Date(escalation.respondedAt), { addSuffix: true })}
                </Typography>
              )}
            </Paper>
          )}

          {/* Metadata */}
          <Box sx={{ pt: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Created: {format(new Date(escalation.createdAt), 'PPpp')}
            </Typography>
            {escalation.updatedAt && (
              <Typography variant="caption" color="text.secondary" display="block">
                Last updated: {format(new Date(escalation.updatedAt), 'PPpp')}
              </Typography>
            )}
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={submitting}>
          Close
        </Button>
        {escalation.status === 'pending' && (
          <>
            <Button
              onClick={handleReject}
              disabled={submitting || !responseText.trim()}
              startIcon={<CancelIcon />}
              color="error"
              variant="outlined"
            >
              Reject
            </Button>
            <Button
              onClick={handleApprove}
              disabled={submitting || !responseText.trim()}
              startIcon={<CheckCircleIcon />}
              color="success"
              variant="contained"
            >
              Approve
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default EscalationDetailsDialog;
