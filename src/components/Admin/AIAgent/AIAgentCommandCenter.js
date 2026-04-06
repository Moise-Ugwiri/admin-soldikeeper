/* eslint-disable */
/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║  🚀  APOLLO COMMAND CENTER — NASA MISSION CONTROL LAYOUT   ║
 * ╠══════════════════════════════════════════════════════════════╣
 * ║  The nerve-center for all 12 PROJECT OLYMPUS agents.       ║
 * ║                                                            ║
 * ║  ▸ Tabbed layout: Fleet · Operations · Intelligence · Health║
 * ║  ▸ Sticky command bar with live counters                   ║
 * ║  ▸ Real-time fleet data — no hardcoded fixtures            ║
 * ║  ▸ Agent grid with per-agent slide-in detail panel         ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Chip,
  alpha,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Tooltip,
  IconButton,
  Badge,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  GridView as FleetIcon,
  Terminal as OpsIcon,
  Psychology as IntelIcon,
  MonitorHeart as HealthIcon,
  FiberManualRecord as DotIcon,
} from '@mui/icons-material';
import { useAdminData } from '../../../contexts/AdminContext';
import { FleetSummaryHeader, AgentGrid } from '../MissionControl';
import AgentCommunicationLog from './AgentCommunicationLog';
import EscalationHub from './EscalationHub';
import { AGENTS as STATIC_AGENTS } from '../../../data/agentRegistry';
import TaskQueue from './TaskQueue';
import AgentInterface from './AgentInterface';
import SystemHealthPanel from './SystemHealthPanel';
import ReasoningTracePanel from './ReasoningTracePanel';
import GoalDashboard from './GoalDashboard';
import CollaborationViewer from './CollaborationViewer';


/* ═══════════════════════════════════════════════════════════════
 *  DESIGN TOKENS — shared palette for the dark mission-control
 * ═══════════════════════════════════════════════════════════════ */
const MC = {
  bg:       'linear-gradient(135deg, #060c18 0%, #0d1526 50%, #060e1c 100%)',
  surface:  'rgba(13,20,42,0.70)',
  surfaceH: 'linear-gradient(145deg, rgba(10,16,34,0.97) 0%, rgba(22,32,60,0.90) 100%)',
  card:     'rgba(255,255,255,0.025)',
  border:   (color, opacity = 0.12) => `1px solid rgba(${color},${opacity})`,
  glow:     (hex) => `0 0 30px ${hex}50, 0 0 60px ${hex}20`,
  mono:     '"JetBrains Mono", "Fira Code", "Cascadia Code", monospace',
  // Palette
  green:    '#10b981',
  blue:     '#3b82f6',
  violet:   '#8b5cf6',
  amber:    '#f59e0b',
  red:      '#ef4444',
  slate:    '#64748b',
  slateL:   '#94a3b8',
  text:     '#e2e8f0',
};

/** CSS color string → rgb tuple for rgba() usage */
const hexRgb = (hex) => {
  const h = hex.replace('#', '');
  return `${parseInt(h.slice(0,2),16)},${parseInt(h.slice(2,4),16)},${parseInt(h.slice(4,6),16)}`;
};

/* ═══════════════════════════════════════════════════════════════
 *  TAB DEFINITIONS
 * ═══════════════════════════════════════════════════════════════ */
const TABS = [
  { id: 0, label: 'Fleet',         icon: <FleetIcon  sx={{ fontSize: 18 }} />, color: MC.green  },
  { id: 1, label: 'Operations',    icon: <OpsIcon    sx={{ fontSize: 18 }} />, color: MC.blue   },
  { id: 2, label: 'Intelligence',  icon: <IntelIcon  sx={{ fontSize: 18 }} />, color: MC.violet },
  { id: 3, label: 'Health',        icon: <HealthIcon sx={{ fontSize: 18 }} />, color: MC.amber  },
];

/* ═══════════════════════════════════════════════════════════════
 *  🔷  DARK PANEL WRAPPER — consistent dark-glass card
 * ═══════════════════════════════════════════════════════════════ */
const DarkPanel = ({ children, accent = MC.violet, sx = {} }) => (
  <Paper elevation={0} sx={{
    background: MC.surface,
    border: `1px solid ${alpha(accent, 0.12)}`,
    borderRadius: 3,
    overflow: 'hidden',
    position: 'relative',
    backdropFilter: 'blur(16px)',
    '&::before': {
      content: '""', position: 'absolute',
      top: 0, left: 0, right: 0, height: '1px',
      background: `linear-gradient(90deg, transparent, ${alpha(accent, 0.28)}, transparent)`,
    },
    ...sx,
  }}>
    {children}
  </Paper>
);

/* ═══════════════════════════════════════════════════════════════
 *  📊  LIVE COUNTER PILL — animated stat chip for command bar
 * ═══════════════════════════════════════════════════════════════ */
const StatPill = ({ label, value, color, pulse = false }) => (
  <Box sx={{
    display: 'flex', alignItems: 'center', gap: 0.75,
    px: 1.5, py: 0.5,
    borderRadius: 10,
    background: `rgba(${hexRgb(color)},0.08)`,
    border: `1px solid rgba(${hexRgb(color)},0.20)`,
    backdropFilter: 'blur(8px)',
    transition: 'all 0.3s',
  }}>
    {pulse && (
      <DotIcon sx={{
        fontSize: 8, color,
        animation: 'cc-pulse 2s ease-in-out infinite',
        '@keyframes cc-pulse': {
          '0%,100%': { opacity: 1 },
          '50%':     { opacity: 0.3 },
        },
      }} />
    )}
    <Typography variant="caption" sx={{
      fontFamily: MC.mono, fontWeight: 700, fontSize: '0.75rem',
      color, textShadow: `0 0 10px ${color}30`,
    }}>
      {value}
    </Typography>
    <Typography variant="caption" sx={{ color: MC.slateL, fontSize: '0.65rem', fontWeight: 500 }}>
      {label}
    </Typography>
  </Box>
);

/* ═══════════════════════════════════════════════════════════════
 *  📊  TELEMETRY PANEL — visual metric cards with rings & bars
 * ═══════════════════════════════════════════════════════════════ */

/* SVG progress ring for a single metric */
const MiniRing = ({ value, max, color, size = 48, stroke = 4 }) => {
  const pct = max > 0 ? Math.min(value / max, 1) : 0;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const off = circ - pct * circ;
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={`rgba(${hexRgb(color)},0.12)`} strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={color} strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={circ} strokeDashoffset={off}
        style={{ transition: 'stroke-dashoffset 0.8s ease' }} />
    </svg>
  );
};

/* Single stat card */
const StatCard = ({ icon, label, value, sub, color, ring, max, onClick }) => (
  <Box onClick={onClick} sx={{
    display: 'flex', alignItems: 'center', gap: 1.5,
    p: 1.5, borderRadius: 2.5,
    background: `rgba(${hexRgb(color)},0.04)`,
    border: `1px solid rgba(${hexRgb(color)},0.12)`,
    cursor: onClick ? 'pointer' : 'default',
    transition: 'all 0.25s',
    '&:hover': onClick ? {
      background: `rgba(${hexRgb(color)},0.10)`,
      border: `1px solid rgba(${hexRgb(color)},0.28)`,
      transform: 'translateY(-1px)',
      boxShadow: `0 4px 12px rgba(${hexRgb(color)},0.12)`,
    } : {},
  }}>
    {ring != null ? (
      <Box sx={{ position: 'relative', flexShrink: 0 }}>
        <MiniRing value={ring} max={max || 1} color={color} size={44} />
        <Box sx={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Typography sx={{ fontSize: '0.6rem', fontWeight: 800, color, fontFamily: MC.mono }}>
            {max > 0 ? Math.round((ring / max) * 100) : 0}%
          </Typography>
        </Box>
      </Box>
    ) : (
      <Box sx={{
        width: 36, height: 36, borderRadius: 2, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: `rgba(${hexRgb(color)},0.12)`,
        fontSize: '1rem',
      }}>
        {icon}
      </Box>
    )}
    <Box sx={{ flex: 1, minWidth: 0 }}>
      <Typography sx={{
        fontWeight: 800, fontSize: '1.1rem', color,
        fontFamily: MC.mono, lineHeight: 1.2,
        textShadow: `0 0 12px rgba(${hexRgb(color)},0.3)`,
      }}>
        {value}
      </Typography>
      <Typography variant="caption" sx={{
        color: MC.slateL, fontSize: '0.62rem', fontWeight: 600,
        letterSpacing: '0.5px', textTransform: 'uppercase',
      }}>
        {label}
      </Typography>
      {sub && (
        <Typography variant="caption" sx={{
          display: 'block', color: MC.slate, fontSize: '0.58rem', mt: 0.25,
        }}>
          {sub}
        </Typography>
      )}
    </Box>
  </Box>
);

const QuickStatsPanel = ({ agents, tasksInProgress, apiAvailable, avgSuccessRate }) => {
  const active  = agents.filter(a => ['busy','active','processing'].includes(a.status)).length;
  const idle    = agents.filter(a => a.status === 'idle').length;
  const errors  = agents.filter(a => a.status === 'error').length;
  const withData = agents.filter(a => a.tasksCompleted > 0).length;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, height: '100%' }}>

      {/* ─── METRIC CARDS (2-col grid) ─── */}
      <Paper elevation={0} sx={{
        p: 2, background: MC.surfaceH, borderRadius: 3,
        border: `1px solid rgba(255,255,255,0.06)`,
        backdropFilter: 'blur(12px)',
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
          <Typography variant="caption" sx={{
            color: MC.slateL, fontWeight: 700, letterSpacing: 2,
            fontSize: '0.62rem', textTransform: 'uppercase',
          }}>
            ⚡ Fleet Telemetry
          </Typography>
          <Box sx={{
            display: 'flex', alignItems: 'center', gap: 0.5,
            px: 1, py: 0.25, borderRadius: 10,
            background: apiAvailable ? `rgba(${hexRgb(MC.green)},0.10)` : `rgba(${hexRgb(MC.red)},0.10)`,
            border: `1px solid ${apiAvailable ? MC.green : MC.red}30`,
          }}>
            <Box sx={{
              width: 5, height: 5, borderRadius: '50%',
              background: apiAvailable ? MC.green : MC.red,
              boxShadow: `0 0 6px ${apiAvailable ? MC.green : MC.red}`,
              animation: apiAvailable ? 'cc-pulse 2s ease-in-out infinite' : 'none',
            }} />
            <Typography variant="caption" sx={{
              fontSize: '0.58rem', fontWeight: 700,
              color: apiAvailable ? MC.green : MC.red,
              letterSpacing: '0.5px',
            }}>
              {apiAvailable ? 'LIVE' : 'OFFLINE'}
            </Typography>
          </Box>
        </Box>

        <Box sx={{
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1,
        }}>
          <StatCard
            label="Active Agents"
            value={active}
            sub={`${idle} idle · ${agents.length} total`}
            color={active > 0 ? MC.green : MC.slate}
            ring={active}
            max={agents.length}
          />
          <StatCard
            label="Success Rate"
            value={avgSuccessRate !== null ? `${avgSuccessRate}%` : '—'}
            sub={avgSuccessRate !== null ? (avgSuccessRate >= 90 ? 'Excellent' : avgSuccessRate >= 70 ? 'Moderate' : 'Needs attention') : 'No data yet'}
            color={avgSuccessRate === null ? MC.slate : avgSuccessRate >= 90 ? MC.green : avgSuccessRate >= 70 ? MC.amber : MC.red}
            icon="📊"
          />
          <StatCard
            label="Tasks Running"
            value={tasksInProgress}
            sub={`${withData} agents have history`}
            color={tasksInProgress > 0 ? MC.blue : MC.slate}
            icon="🔄"
          />
          <StatCard
            label={errors > 0 ? 'Errors Detected' : 'Fleet Health'}
            value={errors > 0 ? errors : '✓'}
            sub={errors > 0 ? 'Investigate immediately' : 'No errors'}
            color={errors > 0 ? MC.red : MC.green}
            icon={errors > 0 ? '🚨' : '💚'}
          />
        </Box>
      </Paper>

      {/* ─── TASK QUEUE ─── */}
      <Paper elevation={0} sx={{
        flex: 1, minHeight: 0, overflow: 'hidden',
        background: MC.surfaceH, borderRadius: 3,
        border: `1px solid rgba(255,255,255,0.06)`,
        backdropFilter: 'blur(12px)',
        display: 'flex', flexDirection: 'column',
      }}>
        <TaskQueue />
      </Paper>
    </Box>
  );
};


/* ╔══════════════════════════════════════════════════════════════╗
 * ║              🎯  MAIN COMMAND CENTER COMPONENT              ║
 * ╚══════════════════════════════════════════════════════════════╝ */
const AIAgentCommandCenter = () => {
  useAdminData(); // ensure context is available

  /* ── state ── */
  const token = localStorage.getItem('token');
  const [agents, setAgents]               = useState(STATIC_AGENTS);
  const [activities, setActivities]       = useState([]);
  const [loading, setLoading]             = useState(true);
  const [refreshing, setRefreshing]       = useState(false);
  const [apiAvailable, setApiAvailable]   = useState(true);
  const [socket, setSocket]               = useState(null);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [drawerOpen, setDrawerOpen]       = useState(false);
  const [activeTab, setActiveTab]         = useState(0);
  const [lastRefresh, setLastRefresh]     = useState(null);

  /* ────────────────────────────────────────────────
   *  📡  Fetch agent + activity data from backend
   * ──────────────────────────────────────────────── */
  const fetchData = useCallback(async (showRefreshing = false) => {
    if (!token) { setLoading(false); return; }
    try {
      if (showRefreshing) setRefreshing(true);
      else setLoading(true);

      const base = process.env.REACT_APP_API_URL
        || 'https://soldikeeper-backend-production.up.railway.app/api';
      const headers = { Authorization: `Bearer ${token}` };

      const [statsRes, activityRes, fleetRes] = await Promise.all([
        axios.get(`${base}/admin/agents/stats`,            { headers }),
        axios.get(`${base}/admin/agents/activity?limit=100`, { headers }),
        axios.get(`${base}/admin/agent-management/fleet-status`, { headers }).catch(() => null),
      ]);

      // Build a lookup of real fleet data (totalExecutions, avgResponseTime, lastExecution, etc.)
      const fleetMap = {};
      if (fleetRes?.data?.success && fleetRes.data.data?.agents) {
        fleetRes.data.data.agents.forEach(a => { fleetMap[a.id] = a; });
      }

      setAgents(prev => prev.map(agent => {
        const stats = statsRes.data?.success && statsRes.data.agents
          ? statsRes.data.agents.find(a => a.agentId === agent.id)
          : null;
        const fleet = fleetMap[agent.id] || null;

        return {
          ...agent,
          // Real-time status from stats endpoint
          status: stats?.status || fleet?.status || agent.status,
          currentTask: stats?.currentTask || fleet?.currentTask || agent.currentTask,
          load: stats?.load ?? fleet?.load ?? agent.load,
          // All-time metrics from fleet-status endpoint
          tasksCompleted: fleet?.totalExecutions ?? agent.tasksCompleted,
          avgResponseTime: fleet?.avgResponseTime ?? agent.avgResponseTime,
          lastActive: fleet?.lastExecution || fleet?.lastHeartbeat || agent.lastActive,
          // Today's stats
          tasksToday: fleet?.tasksToday ?? 0,
          successRate: fleet?.successRate ?? null,
          autonomyLevel: fleet?.autonomyLevel ?? agent.autonomy,
        };
      }));

      if (activityRes.data.success) {
        setActivities(activityRes.data.activities || []);
      }

      setApiAvailable(true);
      setLastRefresh(new Date());
    } catch (err) {
      console.error('Failed to fetch agent data:', err);
      setApiAvailable(false);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => { fetchData(); }, [fetchData]);

  /* ────────────────────────────────────────────────
   *  🔌  WebSocket — real-time agent updates
   * ──────────────────────────────────────────────── */
  useEffect(() => {
    if (!token) return;

    const wsUrl = process.env.REACT_APP_WS_URL
      || (window.location.protocol === 'https:'
          ? 'wss://soldikeeper-backend-production.up.railway.app'
          : 'ws://localhost:3001');

    const ws = io(wsUrl, {
      path: '/admin/realtime',
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    ws.on('connect',       () => { setApiAvailable(true);  });
    ws.on('connect_error', () => { setApiAvailable(false); });

    ws.on('agent:activity:start', (data) => {
      setAgents(prev => prev.map(a =>
        a.id === data.agentId
          ? { ...a, status: 'busy', currentTask: data.task || 'Working…' }
          : a
      ));
    });

    ws.on('agent:activity:complete', (data) => {
      setAgents(prev => prev.map(a =>
        a.id === data.agentId ? { ...a, status: 'idle', currentTask: null } : a
      ));
      setActivities(prev => [data, ...prev].slice(0, 100));
    });

    ws.on('agents:status:update', (statuses) => {
      setAgents(prev => prev.map(agent => {
        const s = statuses.find(x => x.agentId === agent.id);
        return s
          ? { ...agent,
              status:      s.status      || agent.status,
              currentTask: s.currentTask || agent.currentTask,
              load:        s.load !== undefined ? s.load : agent.load }
          : agent;
      }));
    });

    setSocket(ws);
    return () => ws.close();
  }, [token]);

  /* ── handlers ── */
  const handleAgentClick = (agent) => { setSelectedAgent(agent); setDrawerOpen(true); };
  const handleDrawerClose = () => { setDrawerOpen(false); setTimeout(() => setSelectedAgent(null), 300); };
  const handleRefresh = () => fetchData(true);

  /* ── derived / memoised values ── */
  const tasksInProgress = useMemo(
    () => activities.filter(a => a.status === 'started' || a.status === 'in_progress').length,
    [activities]
  );

  const avgSuccessRate = useMemo(() => {
    if (!activities.length) return null;
    const done = activities.filter(a => a.status === 'completed').length;
    return Math.round((done / activities.length) * 100);
  }, [activities]);

  const summary = useMemo(() => ({
    totalAgents:    agents.length,
    activeNow:      agents.filter(a => ['busy','active','processing'].includes(a.status)).length,
    tasksToday:     tasksInProgress,
    avgSuccessRate: avgSuccessRate ?? 0,
    lastAssessment: new Date().toISOString(),
  }), [agents, tasksInProgress, avgSuccessRate]);

  const hasWarnings = !apiAvailable || agents.some(a => a.status === 'error');
  const glowColor   = hasWarnings ? MC.amber : MC.green;
  const activeTabDef = TABS[activeTab];

  const activeCount = agents.filter(a => ['busy','active','processing'].includes(a.status)).length;
  const errorCount  = agents.filter(a => a.status === 'error').length;


  /* ══════════════════════════════════════════════
   *                    RENDER
   * ══════════════════════════════════════════════ */
  return (
    <Box sx={{
      minHeight: '100vh',
      background: MC.bg,
      position: 'relative',
      overflow: 'hidden',
    }}>

      {/* ═══════════  AMBIENT TOP GLOW BAR  ═══════════ */}
      <Box sx={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
        background: `linear-gradient(90deg, transparent 0%, ${glowColor} 50%, transparent 100%)`,
        boxShadow: MC.glow(glowColor),
        zIndex: 10,
        transition: 'background 0.6s, box-shadow 0.6s',
      }} />

      {/* ═══════════════════════════════════════════
       *  STICKY COMMAND BAR
       * ═══════════════════════════════════════════ */}
      <Box sx={{
        position: 'sticky', top: 0, zIndex: 9,
        px: { xs: 1.5, sm: 2, md: 3 }, py: 1.25,
        background: `rgba(6,12,24,0.92)`,
        backdropFilter: 'blur(20px)',
        borderBottom: `1px solid rgba(${hexRgb(glowColor)},0.15)`,
        display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap',
      }}>
        {/* Title */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{
            width: 8, height: 8, borderRadius: '50%',
            background: glowColor,
            boxShadow: `0 0 8px ${glowColor}`,
            animation: 'cc-pulse 2s ease-in-out infinite',
            '@keyframes cc-pulse': {
              '0%,100%': { opacity: 1, transform: 'scale(1)' },
              '50%':     { opacity: 0.4, transform: 'scale(0.7)' },
            },
          }} />
          <Typography variant="caption" sx={{
            color: MC.slateL, fontWeight: 700, letterSpacing: 2,
            textTransform: 'uppercase', fontSize: '0.65rem', fontFamily: MC.mono,
          }}>
            Apollo Command Center
          </Typography>
        </Box>

        <Box sx={{ flex: 1 }} />

        {/* Live stat pills */}
        <StatPill label="agents" value={agents.length}    color={MC.violet} />
        <StatPill label="active" value={activeCount}      color={MC.green}  pulse={activeCount > 0} />
        {errorCount > 0 && (
          <StatPill label="errors" value={errorCount} color={MC.red} pulse />
        )}
        <StatPill label="tasks"  value={tasksInProgress}  color={MC.blue}   pulse={tasksInProgress > 0} />
        {avgSuccessRate !== null && (
          <StatPill
            label="success"
            value={`${avgSuccessRate}%`}
            color={avgSuccessRate >= 90 ? MC.green : avgSuccessRate >= 70 ? MC.amber : MC.red}
          />
        )}
        <StatPill
          label={apiAvailable ? 'LIVE' : 'OFFLINE'}
          value={apiAvailable ? '●' : '○'}
          color={apiAvailable ? MC.green : MC.red}
          pulse={apiAvailable}
        />

        {/* Refresh button */}
        <Tooltip title={lastRefresh ? `Last refresh: ${lastRefresh.toLocaleTimeString()}` : 'Refresh'}>
          <IconButton
            size="small"
            onClick={handleRefresh}
            disabled={refreshing || loading}
            sx={{
              color: MC.slateL,
              '&:hover': { color: MC.text, background: 'rgba(255,255,255,0.06)' },
            }}
          >
            <RefreshIcon sx={{
              fontSize: 18,
              animation: refreshing ? 'cc-spin 0.8s linear infinite' : 'none',
              '@keyframes cc-spin': { from: { transform: 'rotate(0)' }, to: { transform: 'rotate(360deg)' } },
            }} />
          </IconButton>
        </Tooltip>
      </Box>

      {/* ═══════════  API WARNING  ═══════════ */}
      {!apiAvailable && (
        <Alert severity="warning" variant="filled" sx={{
          mx: { xs: 1.5, md: 3 }, mt: 1.5, borderRadius: 2,
          background: `rgba(${hexRgb(MC.amber)},0.12)`,
          border: `1px solid rgba(${hexRgb(MC.amber)},0.30)`,
          color: '#fbbf24',
          '& .MuiAlert-icon': { color: MC.amber },
        }}>
          Telemetry uplink degraded — showing last known fleet state.
        </Alert>
      )}

      {/* ═══════════  FLEET SUMMARY (always visible)  ═══════════ */}
      <Box sx={{ px: { xs: 1.5, sm: 2, md: 3 }, pt: 2, pb: 0 }}>
        <FleetSummaryHeader summary={summary} loading={loading} agents={agents} />
      </Box>

      {/* ═══════════════════════════════════════════
       *  SECTION TABS
       * ═══════════════════════════════════════════ */}
      <Box sx={{
        px: { xs: 1.5, sm: 2, md: 3 }, pt: 2,
        position: 'sticky', top: 48, zIndex: 8,
        background: `rgba(6,12,24,0.85)`,
        backdropFilter: 'blur(16px)',
        borderBottom: `1px solid rgba(255,255,255,0.06)`,
      }}>
        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            minHeight: 44,
            '& .MuiTabs-indicator': {
              background: `linear-gradient(90deg, ${activeTabDef.color}, ${activeTabDef.color}80)`,
              height: 2,
              borderRadius: 1,
              boxShadow: `0 0 12px ${activeTabDef.color}60`,
            },
            '& .MuiTab-root': {
              minHeight: 44,
              color: MC.slate,
              fontWeight: 600,
              fontSize: '0.78rem',
              letterSpacing: 0.5,
              textTransform: 'uppercase',
              gap: 0.75,
              transition: 'color 0.2s',
              '&.Mui-selected': { color: MC.text },
            },
          }}
        >
          {TABS.map(t => (
            <Tab
              key={t.id}
              icon={t.icon}
              iconPosition="start"
              label={t.label}
              sx={{
                '&.Mui-selected': { color: t.color },
                '& .MuiSvgIcon-root': {
                  color: activeTab === t.id ? t.color : MC.slate,
                  transition: 'color 0.2s',
                },
              }}
            />
          ))}
        </Tabs>
      </Box>

      {/* ═══════════════════════════════════════════
       *  TAB CONTENT
       * ═══════════════════════════════════════════ */}
      <Box sx={{ px: { xs: 1.5, sm: 2, md: 3 }, py: 3 }}>

        {/* ─── LOADING STATE ─── */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2, my: 6 }}>
            <CircularProgress size={28} sx={{ color: glowColor }} />
            <Typography variant="body2" sx={{ color: MC.slate, fontWeight: 500 }}>
              Establishing uplink…
            </Typography>
          </Box>
        )}

        {/* ════════════════════
         *  TAB 0 — FLEET
         * ════════════════════ */}
        {!loading && activeTab === 0 && (
          <Box>
            {/* Status ribbon */}
            <Box sx={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              mb: 2, px: 0.5,
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{
                  width: 7, height: 7, borderRadius: '50%',
                  background: glowColor, boxShadow: `0 0 8px ${glowColor}`,
                  animation: 'cc-pulse 2s ease-in-out infinite',
                }} />
                <Typography variant="caption" sx={{
                  color: MC.slate, fontWeight: 600, letterSpacing: 1,
                  textTransform: 'uppercase', fontSize: '0.65rem',
                }}>
                  {hasWarnings ? 'Degraded — attention required' : 'All systems nominal'}
                </Typography>
              </Box>
              <Chip label={`${agents.length} AGENTS`} size="small" sx={{
                height: 22, fontSize: '0.65rem', fontWeight: 700, letterSpacing: 1,
                color: MC.slateL, background: MC.card, border: '1px solid rgba(255,255,255,0.08)',
              }} />
            </Box>

            <Grid container spacing={2.5}>
              {/* Agent grid — takes most width */}
              <Grid item xs={12} xl={8}>
                <Paper elevation={0} sx={{
                  p: { xs: 1.5, md: 2.5 },
                  background: MC.surface,
                  border: `1px solid ${alpha(glowColor, 0.10)}`,
                  borderRadius: 3, backdropFilter: 'blur(12px)',
                  position: 'relative', overflow: 'hidden',
                  '&::before': {
                    content: '""', position: 'absolute',
                    top: 0, left: 0, right: 0, height: '1px',
                    background: `linear-gradient(90deg, transparent, ${glowColor}30, transparent)`,
                  },
                }}>
                  <AgentGrid onSelectAgent={handleAgentClick} agents={agents} selectedAgent={selectedAgent} />
                </Paper>
              </Grid>

              {/* Live telemetry + task queue */}
              <Grid item xs={12} xl={4}>
                <QuickStatsPanel
                  agents={agents}
                  tasksInProgress={tasksInProgress}
                  apiAvailable={apiAvailable}
                  avgSuccessRate={avgSuccessRate}
                />
              </Grid>
            </Grid>
          </Box>
        )}

        {/* ════════════════════
         *  TAB 1 — OPERATIONS
         * ════════════════════ */}
        {!loading && activeTab === 1 && (
          <Grid container spacing={2.5}>
            {/* Communication Log */}
            <Grid item xs={12} lg={7}>
              <Paper elevation={0} sx={{
                p: 2.5, minHeight: 560,
                display: 'flex', flexDirection: 'column',
                background: MC.surfaceH,
                border: `1px solid ${alpha(MC.blue, 0.12)}`,
                borderRadius: 3, backdropFilter: 'blur(12px)',
                position: 'relative', overflow: 'hidden',
                '&::before': {
                  content: '""', position: 'absolute',
                  top: 0, left: 0, right: 0, height: '1px',
                  background: `linear-gradient(90deg, transparent, ${alpha(MC.blue, 0.30)}, transparent)`,
                },
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="subtitle1" sx={{
                    fontWeight: 700, color: MC.text, display: 'flex', alignItems: 'center', gap: 1,
                  }}>
                    📡 Communication Log
                    <Chip label={apiAvailable ? 'LIVE' : 'OFFLINE'} size="small" sx={{
                      height: 20, fontSize: '0.6rem', fontWeight: 800, letterSpacing: 1,
                      color:  apiAvailable ? MC.green : MC.red,
                      background: `rgba(${hexRgb(apiAvailable ? MC.green : MC.red)},0.10)`,
                      border:  `1px solid rgba(${hexRgb(apiAvailable ? MC.green : MC.red)},0.30)`,
                      animation: apiAvailable ? 'cc-pulse 2s infinite' : 'none',
                    }} />
                  </Typography>
                  <Typography variant="caption" sx={{ color: MC.slate, fontSize: '0.7rem' }}>
                    Inter-agent telemetry
                  </Typography>
                </Box>
                <Box sx={{ flex: 1, overflow: 'hidden' }}>
                  <AgentCommunicationLog maxHeight={490} />
                </Box>
              </Paper>
            </Grid>

            {/* Task Queue (standalone, real data) */}
            <Grid item xs={12} lg={5}>
              <DarkPanel accent={MC.blue} sx={{ height: '100%' }}>
                <TaskQueue />
              </DarkPanel>
            </Grid>
          </Grid>
        )}

        {/* ════════════════════
         *  TAB 2 — INTELLIGENCE
         * ════════════════════ */}
        {!loading && activeTab === 2 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {/* Escalation Hub — full width */}
            <DarkPanel accent={MC.violet}>
              <EscalationHub />
            </DarkPanel>

            {/* Reasoning Traces + Goal Dashboard side by side */}
            <Grid container spacing={2.5}>
              <Grid item xs={12} lg={6}>
                <DarkPanel accent={MC.violet} sx={{ height: '100%' }}>
                  <ReasoningTracePanel socket={socket} />
                </DarkPanel>
              </Grid>
              <Grid item xs={12} lg={6}>
                <DarkPanel accent={MC.blue} sx={{ height: '100%' }}>
                  <GoalDashboard />
                </DarkPanel>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* ════════════════════
         *  TAB 3 — HEALTH
         * ════════════════════ */}
        {!loading && activeTab === 3 && (
          <Grid container spacing={2.5}>
            <Grid item xs={12} lg={6}>
              <DarkPanel accent={MC.amber} sx={{ height: '100%' }}>
                <SystemHealthPanel />
              </DarkPanel>
            </Grid>
            <Grid item xs={12} lg={6}>
              <DarkPanel accent={MC.green} sx={{ height: '100%' }}>
                <CollaborationViewer />
              </DarkPanel>
            </Grid>
          </Grid>
        )}
      </Box>

      {/* ═══════════  Agent Interface Drawer (right slide-in)  ═══════════ */}
      <AgentInterface
        open={drawerOpen}
        onClose={handleDrawerClose}
        agent={selectedAgent}
      />
    </Box>
  );
};

export default AIAgentCommandCenter;
