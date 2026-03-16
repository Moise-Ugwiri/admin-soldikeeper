/**
 * 🚀 Fleet Summary Header — NASA Mission Control Style
 * 
 * A narrative-driven fleet status header that tells a story about what the
 * agent fleet is doing. Animated status orbs, progress rings, mood summaries,
 * collaboration detection, and a live pulse bar — all in a dark mission-control
 * aesthetic with status-aware background tinting.
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Chip,
  Tooltip,
  Skeleton,
  useTheme
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  Speed as SpeedIcon,
  Warning as WarningIcon,
  TaskAlt as TaskIcon,
  Groups as GroupsIcon,
  TrendingUp as TrendUpIcon,
  TrendingDown as TrendDownIcon,
  TrendingFlat as TrendFlatIcon,
  AccessTime as ClockIcon,
  Handshake as HandshakeIcon,
  AutoAwesome as AutoAwesomeIcon
} from '@mui/icons-material';
import { MOOD_STATES } from '../../../data/agentRegistry';

// ═══════════════════════════════════════════════════════════════
// Keyframe Animations (injected once via <style>)
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
    @keyframes fleet-grid-drift {
      0%   { transform: translateY(0); }
      100% { transform: translateY(20px); }
    }
    @keyframes fleet-refresh-spin {
      from { transform: rotate(0deg); }
      to   { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
};

// ═══════════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════════

/** Derive a mood key from an agent's state when personality data isn't present. */
const deriveMood = (agent) => {
  if (agent?.mood?.current) return agent.mood.current;
  if (agent?.status === 'busy' && agent?.load > 75) return 'thinking';
  if (agent?.status === 'busy') return 'focused';
  if (agent?.status === 'idle') return 'idle';
  return 'idle';
};

/** Return human-readable relative time. */
const formatRelativeTime = (iso) => {
  if (!iso) return 'N/A';
  const diffMs = Date.now() - new Date(iso).getTime();
  if (diffMs < 0) return 'Just now';
  if (diffMs < 60_000) return 'Just now';
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

/** Find active collaboration pairs among busy agents. */
const findCollaborations = (agents) => {
  if (!agents?.length) return [];
  const busyIds = new Set(
    agents.filter((a) => a.status === 'busy').map((a) => a.id)
  );
  const pairs = [];
  const seen = new Set();

  agents.forEach((agent) => {
    if (agent.status !== 'busy' || !agent.worksWellWith) return;
    agent.worksWellWith.forEach((partnerId) => {
      if (!busyIds.has(partnerId)) return;
      const key = [agent.id, partnerId].sort().join('|');
      if (seen.has(key)) return;
      seen.add(key);
      const partner = agents.find((a) => a.id === partnerId);
      if (partner) pairs.push({ a: agent, b: partner });
    });
  });
  return pairs;
};

/** Build the narrative status sentence. */
const buildNarrative = (defaults, agents, status, collabs) => {
  const parts = [];
  const agentList = agents || [];
  const busyAgents = agentList.filter((a) => a.status === 'busy');
  const idleAgents = agentList.filter((a) => a.status === 'idle');
  const offlineCount = defaults.totalAgents - busyAgents.length - idleAgents.length;

  // Fleet headcount
  const activeCount = busyAgents.length + idleAgents.length;
  parts.push(
    `${activeCount} of ${defaults.totalAgents} agents active`
  );

  // Collaboration mention (pick first pair)
  if (collabs.length > 0) {
    const c = collabs[0];
    const taskHint = c.a.currentTask
      ? ` on ${c.a.currentTask.toLowerCase()}`
      : '';
    parts.push(
      `${c.a.name} & ${c.b.name} collaborating${taskHint}`
    );
  }

  // Tasks & success
  if (defaults.tasksToday > 0) {
    parts.push(
      `${defaults.tasksToday.toLocaleString()} task${defaults.tasksToday !== 1 ? 's' : ''} processed today at ${defaults.avgSuccessRate}% success`
    );
  }

  // High-load warning
  const overloaded = busyAgents.filter((a) => a.load >= 85);
  if (overloaded.length > 0) {
    const names = overloaded.map((a) => a.name).join(', ');
    parts.push(`${names} under heavy load`);
  } else if (offlineCount === 0 && status.label === 'OPERATIONAL') {
    parts.push('No critical escalations');
  }

  // Offline warning
  if (offlineCount > 0) {
    parts.push(
      `${offlineCount} agent${offlineCount !== 1 ? 's' : ''} offline`
    );
  }

  return parts.join('. ') + '.';
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
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={trackColor}
        strokeWidth={stroke}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        style={{ transition: 'stroke-dashoffset 0.8s ease' }}
      />
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
    <Box
      sx={{
        width: 14,
        height: 14,
        borderRadius: '50%',
        bgcolor: status.color,
        animation: animationMap[status.label] || 'none',
        flexShrink: 0,
      }}
    />
  );
};

// ═══════════════════════════════════════════════════════════════
// Metric Card
// ═══════════════════════════════════════════════════════════════
const MetricCard = ({ icon, label, children }) => (
  <Box
    sx={{
      bgcolor: 'rgba(255, 255, 255, 0.06)',
      borderRadius: 2,
      p: 1.5,
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      gap: 0.5,
      border: '1px solid rgba(255,255,255,0.06)',
      transition: 'background-color 0.3s',
      '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
    }}
  >
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
// Mood Summary Row
// ═══════════════════════════════════════════════════════════════
const MoodSummaryRow = ({ agents }) => {
  const moodCounts = useMemo(() => {
    if (!agents?.length) return [];
    const map = {};
    agents.forEach((agent) => {
      const moodKey = deriveMood(agent);
      if (!map[moodKey]) {
        const moodDef = MOOD_STATES?.[moodKey] || { emoji: '🤖', label: moodKey, color: '#9E9E9E' };
        map[moodKey] = { ...moodDef, key: moodKey, count: 0, names: [] };
      }
      map[moodKey].count += 1;
      map[moodKey].names.push(`${agent.emoji || '🤖'} ${agent.name}`);
    });
    return Object.values(map).sort((a, b) => b.count - a.count);
  }, [agents]);

  if (moodCounts.length === 0) return null;

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1.5 }}>
      {moodCounts.map((m) => (
        <Tooltip
          key={m.key}
          title={
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                {m.label}
              </Typography>
              {m.names.map((n, i) => (
                <Typography key={i} variant="caption" sx={{ display: 'block', opacity: 0.85 }}>
                  {n}
                </Typography>
              ))}
            </Box>
          }
          arrow
        >
          <Chip
            label={`${m.emoji}×${m.count}`}
            size="small"
            sx={{
              bgcolor: alpha(m.color, 0.15),
              color: '#fff',
              fontWeight: 600,
              fontSize: '0.75rem',
              border: `1px solid ${alpha(m.color, 0.3)}`,
              cursor: 'pointer',
              '&:hover': { bgcolor: alpha(m.color, 0.28) },
            }}
          />
        </Tooltip>
      ))}
    </Box>
  );
};

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
    <Box
      sx={{
        mt: 2,
        height: 4,
        borderRadius: 2,
        overflow: 'hidden',
        bgcolor: 'rgba(255,255,255,0.08)',
      }}
    >
      <Box
        sx={{
          height: '100%',
          borderRadius: 2,
          background: gradientMap[status.label] || gradientMap.OPERATIONAL,
          backgroundSize: '200% 100%',
          animation: 'fleet-gradient-slide 3s linear infinite',
        }}
      />
    </Box>
  );
};

// ═══════════════════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════════════════
const FleetSummaryHeader = ({ summary, loading = false, agents }) => {
  useTheme(); // ensure theme context is available

  // Inject CSS keyframes once
  useEffect(() => {
    injectKeyframes();
  }, []);

  // Auto-refresh the relative timestamp every 30s
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 30_000);
    return () => clearInterval(id);
  }, []);

  // ── Defaults ──
  const defaults = useMemo(() => ({
    totalAgents: 12,
    activeNow: 0,
    tasksToday: 0,
    avgSuccessRate: 0,
    lastAssessment: null,
    ...(summary || {}),
  }), [summary]);

  // ── Derived status ──
  const status = useMemo(() => {
    const ratio = defaults.activeNow / (defaults.totalAgents || 1);
    if (ratio >= 0.7) return { label: 'OPERATIONAL', color: '#4CAF50' };
    if (ratio >= 0.4) return { label: 'PARTIAL', color: '#FF9800' };
    return { label: 'DEGRADED', color: '#F44336' };
  }, [defaults.activeNow, defaults.totalAgents]);

  // ── Collaborations ──
  const collabs = useMemo(() => findCollaborations(agents), [agents]);

  // ── Narrative ──
  const narrative = useMemo(
    () => buildNarrative(defaults, agents, status, collabs),
    [defaults, agents, status, collabs]
  );

  // ── Success color ──
  const successColor = defaults.avgSuccessRate >= 80
    ? '#4CAF50'
    : defaults.avgSuccessRate >= 50
      ? '#FF9800'
      : '#F44336';

  // ── Tasks trend (simple heuristic) ──
  const tasksTrend = defaults.tasksToday >= 30 ? 'up' : defaults.tasksToday >= 10 ? 'flat' : 'down';

  // ── Status-aware background tint ──
  const bgTint = {
    OPERATIONAL: 'rgba(76, 175, 80, 0.06)',
    PARTIAL: 'rgba(255, 152, 0, 0.06)',
    DEGRADED: 'rgba(244, 67, 54, 0.08)',
  }[status.label] || 'transparent';

  // ── Active ratio for progress ring ──
  const activeRatio = (defaults.activeNow / (defaults.totalAgents || 1)) * 100;

  // ── Status emoji ──
  const statusEmoji = {
    OPERATIONAL: '🟢',
    PARTIAL: '🟡',
    DEGRADED: '🔴',
  }[status.label] || '⚪';

  // ═══════════════════════════════════════════════
  // Loading state
  // ═══════════════════════════════════════════════
  if (loading) {
    return (
      <Paper
        elevation={0}
        sx={{
          mb: 3,
          p: 3,
          borderRadius: 2,
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        }}
      >
        <Skeleton
          variant="text"
          width="60%"
          height={32}
          sx={{ bgcolor: 'rgba(255,255,255,0.08)', mb: 1 }}
        />
        <Skeleton
          variant="text"
          width="90%"
          height={24}
          sx={{ bgcolor: 'rgba(255,255,255,0.06)', mb: 2 }}
        />
        <Grid container spacing={2}>
          {[1, 2, 3, 4, 5].map((i) => (
            <Grid item xs={6} sm={2.4} key={i}>
              <Skeleton
                variant="rectangular"
                height={80}
                sx={{ borderRadius: 2, bgcolor: 'rgba(255,255,255,0.06)' }}
              />
            </Grid>
          ))}
        </Grid>
        <Skeleton
          variant="rectangular"
          height={4}
          sx={{ borderRadius: 2, mt: 2, bgcolor: 'rgba(255,255,255,0.06)' }}
        />
      </Paper>
    );
  }

  // ═══════════════════════════════════════════════
  // Render
  // ═══════════════════════════════════════════════
  return (
    <Paper
      elevation={0}
      sx={{
        mb: 3,
        borderRadius: 2,
        overflow: 'hidden',
        position: 'relative',
        color: '#fff',
      }}
    >
      {/* ── Background layers ── */}
      {/* Base gradient */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(135deg, #0f172a 0%, #1a2332 40%, #1e293b 100%)',
          zIndex: 0,
        }}
      />
      {/* Status-aware tint overlay */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          bgcolor: bgTint,
          transition: 'background-color 1s ease',
          zIndex: 1,
        }}
      />
      {/* Animated grid pattern overlay */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          opacity: 0.03,
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          animation: 'fleet-grid-drift 8s linear infinite',
          zIndex: 2,
          pointerEvents: 'none',
        }}
      />

      {/* ── Content ── */}
      <Box sx={{ position: 'relative', zIndex: 3, p: { xs: 2, sm: 3 } }}>

        {/* ━━━━━━━━━━━━ Title Row ━━━━━━━━━━━━ */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 1,
            mb: 1.5,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                fontSize: { xs: '0.85rem', sm: '1rem' },
              }}
            >
              🤖 AGENT FLEET CONTROL
            </Typography>

            {/* Status Orb + Label */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <StatusOrb status={status} />
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 700,
                  color: status.color,
                  letterSpacing: '0.1em',
                  fontSize: '0.7rem',
                }}
              >
                {status.label}
              </Typography>
            </Box>
          </Box>

          {/* Timestamp with auto-refresh indicator */}
          <Tooltip title="Last fleet assessment — auto-refreshes every 30s">
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                opacity: 0.65,
              }}
            >
              <ClockIcon sx={{ fontSize: 14 }} />
              <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>
                {formatRelativeTime(defaults.lastAssessment)}
              </Typography>
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  border: '1.5px solid rgba(255,255,255,0.4)',
                  borderTopColor: 'transparent',
                  animation: 'fleet-refresh-spin 2s linear infinite',
                  ml: 0.25,
                }}
              />
            </Box>
          </Tooltip>
        </Box>

        {/* ━━━━━━━━━━━━ Narrative Status Line ━━━━━━━━━━━━ */}
        <Typography
          sx={{
            fontSize: { xs: '0.85rem', sm: '0.95rem' },
            fontWeight: 500,
            lineHeight: 1.6,
            mb: 2,
            fontFamily: '"JetBrains Mono", "Fira Code", "SF Mono", "Consolas", monospace',
            color: 'rgba(255, 255, 255, 0.88)',
            letterSpacing: '0.01em',
          }}
        >
          <Box
            component="span"
            sx={{
              color: status.color,
              fontWeight: 700,
              mr: 0.5,
            }}
          >
            {statusEmoji} {status.label}
          </Box>
          {' — '}
          {narrative}
        </Typography>

        {/* ━━━━━━━━━━━━ Metrics Row (5 cards) ━━━━━━━━━━━━ */}
        <Grid container spacing={1.5}>
          {/* Active Now — with progress ring */}
          <Grid item xs={6} sm={2.4}>
            <MetricCard
              icon={<SpeedIcon sx={{ fontSize: 14 }} />}
              label="Active Now"
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                  <ProgressRing
                    value={activeRatio}
                    size={40}
                    stroke={4}
                    color={status.color}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: '0.6rem',
                        fontWeight: 700,
                        fontFamily: 'monospace',
                      }}
                    >
                      {Math.round(activeRatio)}%
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  {defaults.activeNow}
                  <Typography
                    component="span"
                    sx={{ fontSize: '0.8rem', opacity: 0.5, ml: 0.25 }}
                  >
                    /{defaults.totalAgents}
                  </Typography>
                </Typography>
              </Box>
            </MetricCard>
          </Grid>

          {/* Tasks Today — with trend arrow */}
          <Grid item xs={6} sm={2.4}>
            <MetricCard
              icon={<TaskIcon sx={{ fontSize: 14 }} />}
              label="Tasks Today"
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  {defaults.tasksToday.toLocaleString()}
                </Typography>
                {tasksTrend === 'up' && (
                  <TrendUpIcon sx={{ fontSize: 18, color: '#4CAF50' }} />
                )}
                {tasksTrend === 'flat' && (
                  <TrendFlatIcon sx={{ fontSize: 18, color: '#FF9800' }} />
                )}
                {tasksTrend === 'down' && (
                  <TrendDownIcon sx={{ fontSize: 18, color: '#9E9E9E' }} />
                )}
              </Box>
            </MetricCard>
          </Grid>

          {/* Success Rate — color-coded */}
          <Grid item xs={6} sm={2.4}>
            <MetricCard
              icon={<TrendUpIcon sx={{ fontSize: 14 }} />}
              label="Success Rate"
            >
              <Typography variant="h5" sx={{ fontWeight: 700, color: successColor }}>
                {defaults.avgSuccessRate}%
              </Typography>
            </MetricCard>
          </Grid>

          {/* Total Agents */}
          <Grid item xs={6} sm={2.4}>
            <MetricCard
              icon={<GroupsIcon sx={{ fontSize: 14 }} />}
              label="Fleet Size"
            >
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                {defaults.totalAgents}
              </Typography>
            </MetricCard>
          </Grid>

          {/* Collaborations — count of active pairs */}
          <Grid item xs={12} sm={2.4}>
            <MetricCard
              icon={<HandshakeIcon sx={{ fontSize: 14 }} />}
              label="Collaborations"
            >
              <Tooltip
                title={
                  collabs.length > 0 ? (
                    <Box>
                      {collabs.map((c, i) => (
                        <Typography key={i} variant="caption" sx={{ display: 'block' }}>
                          {c.a.emoji} {c.a.name} ↔ {c.b.emoji} {c.b.name}
                        </Typography>
                      ))}
                    </Box>
                  ) : (
                    'No active collaborations detected'
                  )
                }
                arrow
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, cursor: 'pointer' }}>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: collabs.length > 0 ? '#00BCD4' : 'rgba(255,255,255,0.5)' }}>
                    {collabs.length}
                  </Typography>
                  {collabs.length > 0 && (
                    <AutoAwesomeIcon sx={{ fontSize: 16, color: '#00BCD4', opacity: 0.7 }} />
                  )}
                </Box>
              </Tooltip>
            </MetricCard>
          </Grid>
        </Grid>

        {/* ━━━━━━━━━━━━ Mood Summary Row ━━━━━━━━━━━━ */}
        {agents?.length > 0 && <MoodSummaryRow agents={agents} />}

        {/* ━━━━━━━━━━━━ Live Pulse Bar ━━━━━━━━━━━━ */}
        <LivePulseBar status={status} />

        {/* ━━━━━━━━━━━━ Degraded Warning ━━━━━━━━━━━━ */}
        {status.label === 'DEGRADED' && (
          <Box
            sx={{
              mt: 1.5,
              p: 1.5,
              bgcolor: 'rgba(244, 67, 54, 0.12)',
              border: '1px solid rgba(244, 67, 54, 0.25)',
              borderRadius: 1.5,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
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
