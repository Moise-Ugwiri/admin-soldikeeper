import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Box,
  IconButton,
  Tooltip,
  Stack
} from '@mui/material';
import {
  Warning as WarningIcon,
  Info as InfoIcon,
  Error as ErrorIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  AccessTime as AccessTimeIcon
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';

const severityConfig = {
  info: {
    color: '#2196f3',
    bgColor: 'rgba(33, 150, 243, 0.1)',
    icon: InfoIcon,
    label: 'Info'
  },
  warning: {
    color: '#ff9800',
    bgColor: 'rgba(255, 152, 0, 0.1)',
    icon: WarningIcon,
    label: 'Warning'
  },
  critical: {
    color: '#f44336',
    bgColor: 'rgba(244, 67, 54, 0.1)',
    icon: ErrorIcon,
    label: 'Critical'
  },
  emergency: {
    color: '#9c27b0',
    bgColor: 'rgba(156, 39, 176, 0.1)',
    icon: ErrorIcon,
    label: 'Emergency'
  }
};

const statusConfig = {
  pending: { color: '#ff9800', label: 'Pending' },
  approved: { color: '#4caf50', label: 'Approved' },
  rejected: { color: '#f44336', label: 'Rejected' },
  resolved: { color: '#2196f3', label: 'Resolved' }
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

const EscalationCard = ({ escalation, onClick, onApprove, onReject, compact = false }) => {
  const config = severityConfig[escalation.severity] || severityConfig.warning;
  const SeverityIcon = config.icon;
  const statusStyle = statusConfig[escalation.status] || statusConfig.pending;

  const isOverdue = escalation.responseDeadline && new Date(escalation.responseDeadline) < new Date() && escalation.status === 'pending';

  const getDeadlineColor = () => {
    if (!escalation.responseDeadline) return 'text.secondary';
    const deadline = new Date(escalation.responseDeadline);
    const now = new Date();
    const hoursLeft = (deadline - now) / (1000 * 60 * 60);
    
    if (hoursLeft < 0) return '#f44336';
    if (hoursLeft < 1) return '#ff9800';
    if (hoursLeft < 6) return '#ffc107';
    return 'text.secondary';
  };

  return (
    <Card
      sx={{
        cursor: onClick ? 'pointer' : 'default',
        borderLeft: `4px solid ${config.color}`,
        backgroundColor: config.bgColor,
        transition: 'all 0.2s',
        '&:hover': onClick ? {
          boxShadow: 3,
          transform: 'translateY(-2px)'
        } : {},
        opacity: escalation.status !== 'pending' ? 0.8 : 1
      }}
      onClick={onClick}
    >
      <CardContent>
        <Stack spacing={1.5}>
          <Box display="flex" alignItems="flex-start" justifyContent="space-between">
            <Box display="flex" alignItems="center" gap={1} flex={1}>
              <SeverityIcon sx={{ color: config.color, fontSize: 20 }} />
              <Typography variant="h6" component="div" sx={{ fontSize: compact ? '0.95rem' : '1.1rem' }}>
                {escalation.title}
              </Typography>
            </Box>
            
            <Box display="flex" alignItems="center" gap={0.5}>
              <Chip
                label={statusStyle.label}
                size="small"
                sx={{
                  backgroundColor: statusStyle.color,
                  color: 'white',
                  fontWeight: 600,
                  fontSize: '0.75rem'
                }}
              />
              {escalation.status !== 'pending' && (
                <Chip
                  size="small"
                  label={getResumeStatus(escalation).label}
                  color={getResumeStatus(escalation).color}
                  variant="outlined"
                  sx={{ fontSize: '0.7rem', height: 22 }}
                />
              )}
            </Box>
          </Box>

          <Box display="flex" alignItems="center" gap={1}>
            <Chip
              label={escalation.fromAgent || 'Unknown Agent'}
              size="small"
              variant="outlined"
              sx={{ fontSize: '0.7rem', height: 20 }}
            />
            <Chip
              label={escalation.category || 'General'}
              size="small"
              variant="outlined"
              sx={{ fontSize: '0.7rem', height: 20 }}
            />
            {!compact && escalation.confidence && (
              <Chip
                label={`${Math.round(escalation.confidence * 100)}% confident`}
                size="small"
                variant="outlined"
                color="primary"
                sx={{ fontSize: '0.7rem', height: 20 }}
              />
            )}
          </Box>

          {!compact && (
            <Typography variant="body2" color="text.secondary" sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              lineHeight: 1.5
            }}>
              {escalation.description}
            </Typography>
          )}

          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center" gap={0.5}>
              <AccessTimeIcon sx={{ fontSize: 16, color: getDeadlineColor() }} />
              <Typography variant="caption" sx={{ color: getDeadlineColor(), fontWeight: isOverdue ? 600 : 400 }}>
                {isOverdue && '⚠️ OVERDUE: '}
                {escalation.responseDeadline
                  ? formatDistanceToNow(new Date(escalation.responseDeadline), { addSuffix: true })
                  : 'No deadline'
                }
              </Typography>
            </Box>

            {escalation.status === 'pending' && (onApprove || onReject) && (
              <Box display="flex" gap={1}>
                {onApprove && (
                  <Tooltip title="Approve">
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        onApprove(escalation);
                      }}
                      sx={{ color: '#4caf50' }}
                    >
                      <CheckCircleIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
                {onReject && (
                  <Tooltip title="Reject">
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        onReject(escalation);
                      }}
                      sx={{ color: '#f44336' }}
                    >
                      <CancelIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
            )}
          </Box>

          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
            Created {formatDistanceToNow(new Date(escalation.createdAt), { addSuffix: true })}
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default EscalationCard;
