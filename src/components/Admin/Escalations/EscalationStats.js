import React from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  CircularProgress,
  Chip,
  Stack
} from '@mui/material';
import {
  Inbox as InboxIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Schedule as ScheduleIcon,
  Speed as SpeedIcon,
  Telegram as TelegramIcon,
  Email as EmailIcon
} from '@mui/icons-material';

const StatCard = ({ title, value, subtitle, icon: Icon, color, loading }) => (
  <Paper sx={{ p: 2.5, height: '100%' }}>
    <Box display="flex" alignItems="flex-start" justifyContent="space-between">
      <Box flex={1}>
        <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
          {title}
        </Typography>
        {loading ? (
          <CircularProgress size={24} />
        ) : (
          <Typography variant="h4" sx={{ fontWeight: 600, color }}>
            {value}
          </Typography>
        )}
        {subtitle && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
            {subtitle}
          </Typography>
        )}
      </Box>
      {Icon && (
        <Icon sx={{ fontSize: 40, color: color + '40', ml: 2 }} />
      )}
    </Box>
  </Paper>
);

const EscalationStats = ({ stats, channels, loading = false }) => {
  const defaultStats = {
    total: 0,
    pending: 0,
    overdue: 0,
    resolved: 0,
    rejected: 0,
    avgResponseTime: null
  };

  const data = stats || defaultStats;

  const formatResponseTime = (minutes) => {
    if (!minutes) return 'N/A';
    if (minutes < 60) return `${Math.round(minutes)} min`;
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours}h ${mins}m`;
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
        Escalation Dashboard
      </Typography>

      <Grid container spacing={2.5}>
        {/* Total Escalations */}
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Total Escalations"
            value={data.total}
            icon={InboxIcon}
            color="#2196f3"
            loading={loading}
          />
        </Grid>

        {/* Pending */}
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Pending Review"
            value={data.pending}
            subtitle={data.overdue > 0 ? `${data.overdue} overdue` : 'All on time'}
            icon={ScheduleIcon}
            color="#ff9800"
            loading={loading}
          />
        </Grid>

        {/* Avg Response Time */}
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Avg Response Time"
            value={formatResponseTime(data.avgResponseTime)}
            icon={SpeedIcon}
            color="#9c27b0"
            loading={loading}
          />
        </Grid>

        {/* Resolved */}
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Resolved"
            value={data.resolved}
            subtitle={data.total > 0 ? `${Math.round((data.resolved / data.total) * 100)}% resolution rate` : ''}
            icon={CheckCircleIcon}
            color="#4caf50"
            loading={loading}
          />
        </Grid>

        {/* Rejected */}
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Rejected"
            value={data.rejected}
            subtitle={data.total > 0 ? `${Math.round((data.rejected / data.total) * 100)}% rejection rate` : ''}
            icon={CancelIcon}
            color="#f44336"
            loading={loading}
          />
        </Grid>

        {/* Channel Status */}
        <Grid item xs={12} sm={6} md={4}>
          <Paper sx={{ p: 2.5, height: '100%' }}>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 1.5, display: 'block' }}>
              Notification Channels
            </Typography>
            <Stack spacing={1.5}>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box display="flex" alignItems="center" gap={1}>
                  <TelegramIcon sx={{ color: '#0088cc', fontSize: 20 }} />
                  <Typography variant="body2">Telegram</Typography>
                </Box>
                {loading ? (
                  <CircularProgress size={16} />
                ) : (
                  <Chip
                    label={channels?.telegram?.enabled ? 'Active' : 'Inactive'}
                    size="small"
                    color={channels?.telegram?.enabled ? 'success' : 'default'}
                    sx={{ height: 20, fontSize: '0.7rem' }}
                  />
                )}
              </Box>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box display="flex" alignItems="center" gap={1}>
                  <EmailIcon sx={{ color: '#ea4335', fontSize: 20 }} />
                  <Typography variant="body2">Email</Typography>
                </Box>
                {loading ? (
                  <CircularProgress size={16} />
                ) : (
                  <Chip
                    label={channels?.email?.enabled ? 'Active' : 'Inactive'}
                    size="small"
                    color={channels?.email?.enabled ? 'success' : 'default'}
                    sx={{ height: 20, fontSize: '0.7rem' }}
                  />
                )}
              </Box>
            </Stack>
            {!loading && channels?.telegram && !channels.telegram.enabled && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                {channels.telegram.message || 'Channel not configured'}
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default EscalationStats;
