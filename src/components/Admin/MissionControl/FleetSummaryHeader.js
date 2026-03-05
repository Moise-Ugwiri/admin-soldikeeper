/**
 * 🚀 Fleet Summary Header
 * W4.5 — Shows fleet-wide metrics: total agents, active now, tasks today,
 * avg success rate, last assessment timestamp
 */

import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Chip,
  LinearProgress,
  Skeleton,
  Tooltip
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Speed as SpeedIcon,
  Warning as WarningIcon,
  TaskAlt as TaskIcon,
  Groups as GroupsIcon,
  TrendingUp as TrendUpIcon,
  AccessTime as ClockIcon
} from '@mui/icons-material';

const FleetSummaryHeader = ({ summary, loading = false }) => {
  const defaults = {
    totalAgents: 12,
    activeNow: 0,
    tasksToday: 0,
    avgSuccessRate: 0,
    lastAssessment: null,
    ...(summary || {})
  };

  const getSuccessColor = (rate) => {
    if (rate >= 80) return '#4CAF50';
    if (rate >= 50) return '#FF9800';
    return '#F44336';
  };

  const getStatusChip = () => {
    const ratio = defaults.activeNow / (defaults.totalAgents || 1);
    if (ratio >= 0.7) return { label: 'OPERATIONAL', color: '#4CAF50' };
    if (ratio >= 0.4) return { label: 'PARTIAL', color: '#FF9800' };
    return { label: 'DEGRADED', color: '#F44336' };
  };

  const status = getStatusChip();
  const successColor = getSuccessColor(defaults.avgSuccessRate);

  const formatTime = (iso) => {
    if (!iso) return 'N/A';
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now - d;
    if (diffMs < 60000) return 'Just now';
    if (diffMs < 3600000) return `${Math.floor(diffMs / 60000)} min ago`;
    return d.toLocaleTimeString();
  };

  if (loading) {
    return (
      <Paper elevation={0} sx={{ mb: 3, p: 3, borderRadius: 2 }}>
        <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 2 }} />
      </Paper>
    );
  }

  return (
    <Paper
      elevation={0}
      sx={{
        mb: 3,
        p: 3,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        borderRadius: 2
      }}
    >
      {/* Title Row */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
            🤖 AGENT FLEET CONTROL
          </Typography>
          <Chip
            icon={<CheckCircleIcon sx={{ color: `${status.color} !important` }} />}
            label={status.label}
            size="small"
            sx={{
              bgcolor: `rgba(${status.color === '#4CAF50' ? '76,175,80' : status.color === '#FF9800' ? '255,152,0' : '244,67,54'}, 0.2)`,
              color: status.color,
              fontWeight: 600,
              borderColor: status.color,
              border: '1px solid'
            }}
          />
        </Box>
        <Tooltip title="Last fleet assessment">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, opacity: 0.9 }}>
            <ClockIcon sx={{ fontSize: 16 }} />
            <Typography variant="body2">
              {formatTime(defaults.lastAssessment)}
            </Typography>
          </Box>
        </Tooltip>
      </Box>

      {/* Stats Row */}
      <Grid container spacing={3}>
        {/* Total Agents */}
        <Grid item xs={6} sm={3}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, opacity: 0.8, mb: 0.5 }}>
              <GroupsIcon sx={{ fontSize: 16 }} />
              <Typography variant="body2">Total Agents</Typography>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              {defaults.totalAgents}
            </Typography>
          </Box>
        </Grid>

        {/* Active Now */}
        <Grid item xs={6} sm={3}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, opacity: 0.8, mb: 0.5 }}>
              <SpeedIcon sx={{ fontSize: 16 }} />
              <Typography variant="body2">Active Now</Typography>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              {defaults.activeNow}
              <Typography component="span" variant="body2" sx={{ ml: 0.5, opacity: 0.7 }}>
                / {defaults.totalAgents}
              </Typography>
            </Typography>
          </Box>
        </Grid>

        {/* Tasks Today */}
        <Grid item xs={6} sm={3}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, opacity: 0.8, mb: 0.5 }}>
              <TaskIcon sx={{ fontSize: 16 }} />
              <Typography variant="body2">Tasks Today</Typography>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              {defaults.tasksToday.toLocaleString()}
            </Typography>
          </Box>
        </Grid>

        {/* Success Rate */}
        <Grid item xs={6} sm={3}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, opacity: 0.8, mb: 0.5 }}>
              <TrendUpIcon sx={{ fontSize: 16 }} />
              <Typography variant="body2">Avg Success Rate</Typography>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: successColor }}>
              {defaults.avgSuccessRate}%
            </Typography>
          </Box>
        </Grid>
      </Grid>

      {/* Active agents progress bar */}
      <Box sx={{ mt: 2 }}>
        <LinearProgress
          variant="determinate"
          value={(defaults.activeNow / (defaults.totalAgents || 1)) * 100}
          sx={{
            height: 8,
            borderRadius: 4,
            bgcolor: 'rgba(255, 255, 255, 0.2)',
            '& .MuiLinearProgress-bar': {
              bgcolor: status.color,
              borderRadius: 4
            }
          }}
        />
      </Box>

      {/* Warning if low activity */}
      {defaults.activeNow < defaults.totalAgents * 0.4 && (
        <Box
          sx={{
            mt: 2,
            p: 1.5,
            bgcolor: 'rgba(244, 67, 54, 0.2)',
            borderRadius: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
        >
          <WarningIcon sx={{ color: '#F44336' }} />
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            Low agent activity detected. {defaults.totalAgents - defaults.activeNow} agents offline.
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default FleetSummaryHeader;
