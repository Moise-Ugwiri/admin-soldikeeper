/**
 * 🚀 Fleet Summary Header — Clean Mission Control Status Bar
 *
 * Shows real fleet metrics at a glance: active agents, tasks today,
 * success rate, fleet size. All data comes from the API — no fiction.
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Tooltip,
  Skeleton,
} from '@mui/material';
// alpha removed — not used in simplified header
import {
  Speed as SpeedIcon,
  Warning as WarningIcon,
  TaskAlt as TaskIcon,
  Groups as GroupsIcon,
  TrendingUp as TrendUpIcon,
  TrendingDown as TrendDownIcon,
  TrendingFlat as TrendFlatIcon,
  AccessTime as ClockIcon,
} from '@mui/icons-material';

// ═══════════════════════════════════════════════════════════════
// Keyframe Animations
// ═══════════════════════════════════════════════════════════════
const ANIMATION_ID = 'fleet-header-keyframes';

const injectKeyframes = () => {
  if (document.getElementById(ANIMATION_ID)) return;
  const style = document.createElement('style');
  style.id = ANIMATION_ID;
  style.textContent = `
    @keyframes fleet-pulse-green {
      0%, 100% { box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.55); }
      50%      { box-shadow: 0 0 0 10px rgba(76, 175, 80, 0); }
    }
    @keyframes fleet-breathe-amber {
      0%, 100% { opacity: 1; transform: scale(1); }
      50%      { opacity: 0.55; transform: scale(0.88); }
    }
    @keyframes fleet-flash-red {
      0%, 100% { opacity: 1; }
      50%      { opacity: 0.3; }
    }
    @keyframes fleet-gradient-slide {
      0%   { background-position: 0% 50%; }
      100% { background-position: 200% 50%; }
    }
  `;
  document.head.appendChild(style);
};

// ═══════════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════════

const formatRelativeTime = (iso) => {
  if (!iso) return 'N/A';
  const diffMs = Date.now() - new Date(iso).getTime();
  if (diffMs < 0 || diffMs < 60_000) return 'Just now';
  if (diffMs < 3_600_000) {
    const mins = Math.floor(diffMs / 60_000);
    return `${mins} min${mins !== 1 ? 's' : ''} ago`;
  }
  if (diffMs < 86_400_000) {
    const hrs = Math.floor(diffMs / 3_600_000);
    return `${hrs} hr${hrs !== 1 ? 's' : ''} ago`;
  }
  return new Date(iso).toLocaleString();
};

// ═══════════════════════════════════════════════════════════════
// Mini Progress Ring (SVG)
// ═══════════════════════════════════════════════════════════════
const ProgressRing = ({ value, size = 44, stroke = 4, color = '#4CAF50', trackColor = 'rgba(255,255,255,0.15)' }) => {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(value, 100) / 100) * circumference;
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={trackColor} strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={stroke}
        strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset}
        style={{ transition: 'stroke-dashoffset 0.8s ease' }} />
    </svg>
  );
};

// ═══════════════════════════════════════════════════════════════
// Status Orb
// ═══════════════════════════════════════════════════════════════
const StatusOrb = ({ status }) => {
  const animationMap = {
    OPERATIONAL: 'fleet-pulse-green 2s ease-in-out infinite',
    PARTIAL: 'fleet-breathe-amber 2.5s ease-in-out infinite',
    DEGRADED: 'fleet-flash-red 0.8s ease-in-out infinite',
  };
  return (
    <Box sx={{
      width: 14, height: 14, borderRadius: '50%',
      bgcolor: status.color,
      animation: animationMap[status.label] || 'none',
      flexShrink: 0,
    }} />
  );
};

// ═══════════════════════════════════════════════════════════════
// Metric Card
// ═══════════════════════════════════════════════════════════════
const MetricCard = ({ icon, label, children }) => (
  <Box sx={{
    bgcolor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 2, p: 1.5, height: '100%',
    display: 'flex', flexDirection: 'column', gap: 0.5,
    border: '1px solid rgba(255,255,255,0.06)',
    transition: 'background-color 0.3s',
    '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
  }}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, opacity: 0.7 }}>
      {icon}
      <Typography variant="caption" sx={{ letterSpacing: '0.04em', textTransform: 'uppercase', fontSize: '0.65rem' }}>
        {label}
      </Typography>
    </Box>
    {children}
  </Box>
);

// ═══════════════════════════════════════════════════════════════
// Live Pulse Bar
// ═══════════════════════════════════════════════════════════════
const LivePulseBar = ({ status }) => {
  const gradientMap = {
    OPERATIONAL: 'linear-gradient(90deg, #4CAF50, #00BCD4, #2196F3, #4CAF50, #00BCD4, #2196F3)',
    PARTIAL: 'linear-gradient(90deg, #FF9800, #FFC107, #FF9800, #FFC107, #FF9800, #FFC107)',
    DEGRADED: 'linear-gradient(90deg, #F44336, #FF5722, #F44336, #FF5722, #F44336, #FF5722)',
  };
  return (
    <Box sx={{ mt: 2, height: 3, borderRadius: 2, overflow: 'hidden', bgcolor: 'rgba(255,255,255,0.08)' }}>
      <Box sx={{
        height: '100%', borderRadius: 2,
        background: gradientMap[status.label] || gradientMap.OPERATIONAL,
        backgroundSize: '200% 100%',
        animation: 'fleet-gradient-slide 3s linear infinite',
      }} />
    </Box>
  );
};

// ═══════════════════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════════════════
const FleetSummaryHeader = ({ summary, loading = false, agents }) => {
  useEffect(() => { injectKeyframes(); }, []);

  // Auto-refresh relative timestamp every 30s
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 30_000);
    return () => clearInterval(id);
  }, []);

  const defaults = useMemo(() => ({
    totalAgents: 12, activeNow: 0, tasksToday: 0,
    avgSuccessRate: 0, lastAssessment: null,
    ...(summary || {}),
  }), [summary]);

  const status = useMemo(() => {
    const ratio = defaults.activeNow / (defaults.totalAgents || 1);
    if (ratio >= 0.7) return { label: 'OPERATIONAL', color: '#4CAF50' };
    if (ratio >= 0.4) return { label: 'PARTIAL', color: '#FF9800' };
    return { label: 'DEGRADED', color: '#F44336' };
  }, [defaults.activeNow, defaults.totalAgents]);

  const successColor = defaults.avgSuccessRate >= 80 ? '#4CAF50'
    : defaults.avgSuccessRate >= 50 ? '#FF9800' : '#F44336';
  const tasksTrend = defaults.tasksToday >= 30 ? 'up' : defaults.tasksToday >= 10 ? 'flat' : 'down';
  const activeRatio = (defaults.activeNow / (defaults.totalAgents || 1)) * 100;

  // Count agents with real execution data
  const agentsWithData = (agents || []).filter(a => a.tasksCompleted > 0 || a.lastActive).length;

  // ─── Loading ──────────────────────────────────────────────
  if (loading) {
    return (
      <Paper elevation={0} sx={{ mb: 3, p: 3, borderRadius: 2, background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}>
        <Skeleton variant="text" width="60%" height={32} sx={{ bgcolor: 'rgba(255,255,255,0.08)', mb: 1 }} />
        <Grid container spacing={2}>
          {[1, 2, 3, 4, 5].map(i => (
            <Grid item xs={6} sm={2.4} key={i}>
              <Skeleton variant="rectangular" height={80} sx={{ borderRadius: 2, bgcolor: 'rgba(255,255,255,0.06)' }} />
            </Grid>
          ))}
        </Grid>
      </Paper>
    );
  }

  // ─── Render ───────────────────────────────────────────────
  return (
    <Paper elevation={0} sx={{ mb: 3, borderRadius: 2, overflow: 'hidden', position: 'relative', color: '#fff' }}>
      {/* Background */}
      <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #0f172a 0%, #1a2332 40%, #1e293b 100%)', zIndex: 0 }} />

      {/* Content */}
      <Box sx={{ position: 'relative', zIndex: 1, p: { xs: 2, sm: 3 } }}>

        {/* Title Row */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Typography variant="h6" sx={{
              fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
              fontSize: { xs: '0.85rem', sm: '1rem' },
            }}>
              🤖 AGENT FLEET STATUS
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <StatusOrb status={status} />
              <Typography variant="caption" sx={{ fontWeight: 700, color: status.color, letterSpacing: '0.1em', fontSize: '0.7rem' }}>
                {status.label}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {/* Data coverage indicator */}
            <Tooltip title={`${agentsWithData} of ${defaults.totalAgents} agents have execution history`} arrow>
              <Typography variant="caption" sx={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.5)' }}>
                📊 {agentsWithData}/{defaults.totalAgents} reporting
              </Typography>
            </Tooltip>
            {/* Timestamp */}
            <Tooltip title="Last fleet assessment">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, opacity: 0.65 }}>
                <ClockIcon sx={{ fontSize: 14 }} />
                <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>
                  {formatRelativeTime(defaults.lastAssessment)}
                </Typography>
              </Box>
            </Tooltip>
          </Box>
        </Box>

        {/* Metrics Row */}
        <Grid container spacing={1.5}>
          {/* Active Now */}
          <Grid item xs={6} sm={2.4}>
            <MetricCard icon={<SpeedIcon sx={{ fontSize: 14 }} />} label="Active Now">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                  <ProgressRing value={activeRatio} size={40} stroke={4} color={status.color} />
                  <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography sx={{ fontSize: '0.6rem', fontWeight: 700, fontFamily: 'monospace' }}>
                      {Math.round(activeRatio)}%
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  {defaults.activeNow}
                  <Typography component="span" sx={{ fontSize: '0.8rem', opacity: 0.5, ml: 0.25 }}>
                    /{defaults.totalAgents}
                  </Typography>
                </Typography>
              </Box>
            </MetricCard>
          </Grid>

          {/* Tasks Today */}
          <Grid item xs={6} sm={2.4}>
            <MetricCard icon={<TaskIcon sx={{ fontSize: 14 }} />} label="Tasks Today">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  {defaults.tasksToday.toLocaleString()}
                </Typography>
                {tasksTrend === 'up' && <TrendUpIcon sx={{ fontSize: 18, color: '#4CAF50' }} />}
                {tasksTrend === 'flat' && <TrendFlatIcon sx={{ fontSize: 18, color: '#FF9800' }} />}
                {tasksTrend === 'down' && <TrendDownIcon sx={{ fontSize: 18, color: '#9E9E9E' }} />}
              </Box>
            </MetricCard>
          </Grid>

          {/* Success Rate */}
          <Grid item xs={6} sm={2.4}>
            <MetricCard icon={<TrendUpIcon sx={{ fontSize: 14 }} />} label="Success Rate">
              <Typography variant="h5" sx={{ fontWeight: 700, color: successColor }}>
                {defaults.avgSuccessRate}%
              </Typography>
            </MetricCard>
          </Grid>

          {/* Fleet Size */}
          <Grid item xs={6} sm={2.4}>
            <MetricCard icon={<GroupsIcon sx={{ fontSize: 14 }} />} label="Fleet Size">
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                {defaults.totalAgents}
              </Typography>
            </MetricCard>
          </Grid>

          {/* Data Coverage */}
          <Grid item xs={12} sm={2.4}>
            <MetricCard icon={<TaskIcon sx={{ fontSize: 14 }} />} label="Data Coverage">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Typography variant="h5" sx={{
                  fontWeight: 700,
                  color: agentsWithData > 0 ? '#00BCD4' : 'rgba(255,255,255,0.5)',
                }}>
                  {agentsWithData}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.5, fontSize: '0.7rem' }}>
                  agents with history
                </Typography>
              </Box>
            </MetricCard>
          </Grid>
        </Grid>

        {/* Live Pulse Bar */}
        <LivePulseBar status={status} />

        {/* Degraded Warning */}
        {status.label === 'DEGRADED' && (
          <Box sx={{
            mt: 1.5, p: 1.5,
            bgcolor: 'rgba(244, 67, 54, 0.12)',
            border: '1px solid rgba(244, 67, 54, 0.25)',
            borderRadius: 1.5,
            display: 'flex', alignItems: 'center', gap: 1,
          }}>
            <WarningIcon sx={{ color: '#F44336', fontSize: 20 }} />
            <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8rem' }}>
              Low agent activity detected. {defaults.totalAgents - defaults.activeNow} agent
              {defaults.totalAgents - defaults.activeNow !== 1 ? 's' : ''} offline — investigate immediately.
            </Typography>
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default FleetSummaryHeader;
