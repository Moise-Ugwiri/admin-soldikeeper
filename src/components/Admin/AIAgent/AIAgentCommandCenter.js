/* eslint-disable */
/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║  🚀  APOLLO COMMAND CENTER — NASA MISSION CONTROL LAYOUT   ║
 * ╠══════════════════════════════════════════════════════════════╣
 * ║  The nerve-center for all 12 PROJECT OLYMPUS agents.       ║
 * ║                                                            ║
 * ║  ▸ Real-time fleet summary with ambient status glow        ║
 * ║  ▸ Agent grid with live status cards                       ║
 * ║  ▸ Inter-agent communication log                           ║
 * ║  ▸ Quick telemetry panel + task queue                      ║
 * ║  ▸ Escalation hub, reasoning traces, goal tracking         ║
 * ║  ▸ Collaboration viewer & system health monitors           ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

import React, { useState, useEffect, useMemo } from 'react';
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
  Alert
} from '@mui/material';
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
  bg:       'linear-gradient(135deg, #0a0f1a 0%, #111827 50%, #0d1321 100%)',
  surface:  'rgba(15,23,42,0.60)',
  surfaceH: 'linear-gradient(145deg, rgba(15,23,42,0.95) 0%, rgba(30,41,59,0.85) 100%)',
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
 *  ✦  SECTION DIVIDER — glowing rule with a centred label
 * ═══════════════════════════════════════════════════════════════ */
const SectionDivider = ({ label, color = MC.green }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, my: 3, mx: 1 }}>
    <Box sx={{
      flex: 1, height: '1px',
      background: `linear-gradient(90deg, transparent, ${color}80, transparent)`,
      boxShadow: `0 0 8px ${color}30`,
    }} />
    <Typography variant="overline" sx={{
      color, fontWeight: 700, letterSpacing: 3, fontSize: '0.7rem',
      whiteSpace: 'nowrap', textShadow: `0 0 10px ${color}40`,
    }}>
      ✦ {label}
    </Typography>
    <Box sx={{
      flex: 1, height: '1px',
      background: `linear-gradient(90deg, transparent, ${color}80, transparent)`,
      boxShadow: `0 0 8px ${color}30`,
    }} />
  </Box>
);


/* ═══════════════════════════════════════════════════════════════
 *  📊  QUICK STATS PANEL — compact telemetry + embedded TaskQueue
 * ═══════════════════════════════════════════════════════════════ */
const QuickStatsPanel = ({ agents, tasksInProgress, apiAvailable }) => {
  const active  = agents.filter(a => ['busy','active','processing'].includes(a.status)).length;
  const idle    = agents.filter(a => a.status === 'idle').length;
  const errors  = agents.filter(a => a.status === 'error').length;

  const rows = [
    { label: 'Fleet Size',    value: agents.length,  color: MC.violet },
    { label: 'Active Now',    value: active,         color: MC.green  },
    { label: 'Idle',          value: idle,           color: MC.slate  },
    { label: 'Errors',        value: errors,         color: errors > 0 ? MC.red : MC.slate },
    { label: 'Tasks Running', value: tasksInProgress, color: MC.blue  },
    { label: 'Uplink',        value: apiAvailable ? 'LIVE' : 'DOWN',
                               color: apiAvailable ? MC.green : MC.red },
  ];

  return (
    <Paper elevation={0} sx={{
      p: 2.5, height: '100%',
      background: MC.surfaceH,
      border: `1px solid ${alpha(MC.green, 0.12)}`,
      borderRadius: 3,
      backdropFilter: 'blur(12px)',
    }}>
      <Typography variant="subtitle2" sx={{
        color: MC.slateL, fontWeight: 700, letterSpacing: 2,
        fontSize: '0.65rem', textTransform: 'uppercase', mb: 2,
      }}>
        ⚡ Quick Telemetry
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {rows.map((r) => (
          <Box key={r.label} sx={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            py: 1, px: 1.5, borderRadius: 2,
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.04)',
            transition: 'all 0.2s',
            '&:hover': { background: 'rgba(255,255,255,0.05)' },
          }}>
            <Typography variant="caption" sx={{ color: MC.slateL, fontWeight: 500, fontSize: '0.75rem' }}>
              {r.label}
            </Typography>
            <Typography variant="body2" sx={{
              color: r.color, fontWeight: 800, fontFamily: MC.mono,
              fontSize: '0.85rem', textShadow: `0 0 8px ${r.color}30`,
            }}>
              {r.value}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* Embedded task queue */}
      <Box sx={{ mt: 2.5 }}>
        <TaskQueue />
      </Box>
    </Paper>
  );
};


/* ═══════════════════════════════════════════════════════════════
 *  🔷  DARK PANEL WRAPPER — consistent dark-glass card
 * ═══════════════════════════════════════════════════════════════ */
const DarkPanel = ({ children, accent = MC.violet, sx = {} }) => (
  <Paper elevation={0} sx={{
    background: MC.surface,
    border: `1px solid ${alpha(accent, 0.10)}`,
    borderRadius: 3,
    overflow: 'hidden',
    position: 'relative',
    '&::before': {
      content: '""', position: 'absolute',
      top: 0, left: 0, right: 0, height: '1px',
      background: `linear-gradient(90deg, transparent, ${alpha(accent, 0.25)}, transparent)`,
    },
    ...sx,
  }}>
    {children}
  </Paper>
);


/* ╔══════════════════════════════════════════════════════════════╗
 * ║              🎯  MAIN COMMAND CENTER COMPONENT              ║
 * ╚══════════════════════════════════════════════════════════════╝ */
const AIAgentCommandCenter = () => {
  useAdminData(); // ensure context is available

  /* ── state ── */
  const token = localStorage.getItem('token');
  const [agents, setAgents]             = useState(STATIC_AGENTS);
  const [activities, setActivities]     = useState([]);
  const [loading, setLoading]           = useState(true);
  const [apiAvailable, setApiAvailable] = useState(true);
  const [socket, setSocket]             = useState(null);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [drawerOpen, setDrawerOpen]     = useState(false);

  const [taskQueue] = useState([
    { id: 'task-1',  title: 'Build Mission Control UI',      assignedAgent: 'Prism',      priority: 'High',     status: 'in-progress' },
    { id: 'task-2',  title: 'Process monthly budget rollover',assignedAgent: 'Ledger',     priority: 'High',     status: 'in-progress' },
    { id: 'task-3',  title: 'Generate spending insights',    assignedAgent: 'Cortex',     priority: 'Medium',   status: 'in-progress' },
    { id: 'task-4',  title: 'Optimize debt algorithm',       assignedAgent: 'Nexus',      priority: 'Medium',   status: 'in-progress' },
    { id: 'task-5',  title: 'Monitor admin dashboard',       assignedAgent: 'Watchtower', priority: 'Medium',   status: 'in-progress' },
    { id: 'task-6',  title: 'Security audit',                assignedAgent: 'Sentinel',   priority: 'High',     status: 'pending'     },
    { id: 'task-7',  title: 'Receipt OCR processing',        assignedAgent: 'Vision',     priority: 'Low',      status: 'pending'     },
    { id: 'task-8',  title: 'Process Stripe webhooks',       assignedAgent: 'Vault',      priority: 'Medium',   status: 'pending'     },
    { id: 'task-9',  title: 'Build Android APK',             assignedAgent: 'Forge',      priority: 'Low',      status: 'pending'     },
    { id: 'task-10', title: 'Deploy to production',          assignedAgent: 'Atlas',      priority: 'High',     status: 'pending'     },
    { id: 'task-11', title: 'Translate UI strings',          assignedAgent: 'Babel',      priority: 'Low',      status: 'pending'     },
    { id: 'task-12', title: 'Coordinate deployment',         assignedAgent: 'Apollo',     priority: 'Critical', status: 'pending'     },
  ]);

  /* ────────────────────────────────────────────────
   *  📡  Fetch initial agent data from backend
   * ──────────────────────────────────────────────── */
  useEffect(() => {
    const fetchData = async () => {
      if (!token) { setLoading(false); return; }
      try {
        setLoading(true);
        const base = process.env.REACT_APP_API_URL
          || 'https://soldikeeper-backend-production.up.railway.app/api';
        const headers = { Authorization: `Bearer ${token}` };

        const [statsRes, activityRes] = await Promise.all([
          axios.get(`${base}/admin/agents/stats`,          { headers }),
          axios.get(`${base}/admin/agents/activity?limit=50`, { headers }),
        ]);

        if (statsRes.data.success && statsRes.data.agents) {
          setAgents(prev => prev.map(agent => {
            const real = statsRes.data.agents.find(a => a.agentId === agent.id);
            return real
              ? { ...agent, status: real.status || 'idle',
                  currentTask: real.currentTask || agent.currentTask,
                  load: real.load || 0 }
              : agent;
          }));
        }

        if (activityRes.data.success) {
          setActivities(activityRes.data.activities || []);
        }

        setLoading(false);
        setApiAvailable(true);
      } catch (err) {
        console.error('Failed to fetch agent data:', err);
        setLoading(false);
        setApiAvailable(false);
      }
    };
    fetchData();
  }, [token]);

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

    ws.on('connect',       () => { console.log('✅ WS connected');   setApiAvailable(true);  });
    ws.on('connect_error', (e) => { console.error('❌ WS error:', e); setApiAvailable(false); });
    ws.on('disconnect',    () => { console.log('❌ WS disconnected'); });

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
      setActivities(prev => [data, ...prev].slice(0, 50));
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
  const handleAgentClick = (agent) => {
    setSelectedAgent(agent);
    setDrawerOpen(true);
  };
  const handleDrawerClose = () => {
    setDrawerOpen(false);
    setTimeout(() => setSelectedAgent(null), 300);
  };

  /* ── derived / memoised values ── */
  const tasksInProgress = taskQueue.filter(t => t.status === 'in-progress').length;

  const summary = useMemo(() => ({
    totalAgents:    agents.length,
    activeNow:      agents.filter(a => ['busy','active','processing'].includes(a.status)).length,
    tasksToday:     tasksInProgress,
    avgSuccessRate: 94,                       // TODO: wire to real metric
    lastAssessment: new Date().toISOString(),
  }), [agents, tasksInProgress]);

  const hasWarnings = !apiAvailable || agents.some(a => a.status === 'error');
  const glowColor  = hasWarnings ? MC.amber : MC.green;


  /* ══════════════════════════════════════════════
   *                    RENDER
   * ══════════════════════════════════════════════ */
  return (
    <Box sx={{
      minHeight: '100vh',
      background: MC.bg,
      p: { xs: 1.5, sm: 2, md: 3 },
      position: 'relative',
      overflow: 'hidden',

      /* ── ambient top glow bar ── */
      '&::before': {
        content: '""', position: 'absolute',
        top: 0, left: 0, right: 0, height: '3px',
        background: `linear-gradient(90deg, transparent 0%, ${glowColor} 50%, transparent 100%)`,
        boxShadow: MC.glow(glowColor),
        zIndex: 2,
      },
      /* ── ambient bottom glow ── */
      '&::after': {
        content: '""', position: 'absolute',
        bottom: 0, left: '10%', right: '10%', height: '1px',
        background: `linear-gradient(90deg, transparent, ${glowColor}40, transparent)`,
        boxShadow: `0 0 20px ${glowColor}15`,
      },
    }}>

      {/* ═══════════  API WARNING  ═══════════ */}
      {!apiAvailable && (
        <Alert severity="warning" variant="filled" sx={{
          mb: 2, borderRadius: 2,
          background: `linear-gradient(90deg, rgba(${hexRgb(MC.amber)},0.15), rgba(${hexRgb(MC.amber)},0.06))`,
          border: `1px solid rgba(${hexRgb(MC.amber)},0.30)`,
          color: '#fbbf24',
          '& .MuiAlert-icon': { color: MC.amber },
        }}>
          Telemetry uplink degraded — showing cached fleet data.
        </Alert>
      )}

      {/* ═══════════  LOADING SPINNER  ═══════════ */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2, my: 4 }}>
          <CircularProgress size={28} sx={{ color: glowColor }} />
          <Typography variant="body2" sx={{ color: MC.slate, fontWeight: 500 }}>
            Establishing uplink…
          </Typography>
        </Box>
      )}


      {/* ═══════════════════════════════════════════
       *  TOP — Fleet Summary Header
       * ═══════════════════════════════════════════ */}
      <Box sx={{ mb: 1 }}>
        <FleetSummaryHeader
          summary={summary}
          loading={loading}
          agents={agents}
        />
      </Box>


      {/* ═══════════════════════════════════════════
       *  FLEET OVERVIEW — Agent Grid
       * ═══════════════════════════════════════════ */}
      <SectionDivider label="FLEET OVERVIEW" color={glowColor} />

      <Paper elevation={0} sx={{
        p: { xs: 1.5, md: 2.5 }, mb: 1,
        background: MC.surface,
        border: `1px solid ${alpha(glowColor, 0.10)}`,
        borderRadius: 3,
        backdropFilter: 'blur(12px)',
        position: 'relative', overflow: 'hidden',
        '&::before': {
          content: '""', position: 'absolute',
          top: 0, left: 0, right: 0, height: '1px',
          background: `linear-gradient(90deg, transparent, ${glowColor}30, transparent)`,
        },
      }}>
        {/* Status ribbon */}
        <Box sx={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', mb: 2, px: 1,
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{
              width: 8, height: 8, borderRadius: '50%',
              background: glowColor,
              boxShadow: `0 0 8px ${glowColor}`,
              animation: 'mcPulse 2s ease-in-out infinite',
              '@keyframes mcPulse': {
                '0%,100%': { opacity: 1, transform: 'scale(1)' },
                '50%':     { opacity: 0.5, transform: 'scale(0.85)' },
              },
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
            color: MC.slateL,
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.08)',
          }} />
        </Box>

        <AgentGrid onAgentClick={handleAgentClick} agents={agents} />
      </Paper>


      {/* ═══════════════════════════════════════════
       *  OPERATIONS — Comm Log  ·  Quick Stats
       * ═══════════════════════════════════════════ */}
      <SectionDivider label="OPERATIONS" color={MC.blue} />

      <Grid container spacing={2.5} sx={{ mb: 1 }}>
        {/* LEFT — Communication Log */}
        <Grid item xs={12} lg={7}>
          <Paper elevation={0} sx={{
            p: 2.5, height: { xs: 520, md: 560 },
            display: 'flex', flexDirection: 'column',
            background: MC.surfaceH,
            border: `1px solid ${alpha(MC.blue, 0.12)}`,
            borderRadius: 3,
            backdropFilter: 'blur(12px)',
            position: 'relative', overflow: 'hidden',
            '&::before': {
              content: '""', position: 'absolute',
              top: 0, left: 0, right: 0, height: '1px',
              background: `linear-gradient(90deg, transparent, ${alpha(MC.blue, 0.30)}, transparent)`,
            },
          }}>
            <Box sx={{
              display: 'flex', alignItems: 'center',
              justifyContent: 'space-between', mb: 2,
            }}>
              <Typography variant="subtitle1" sx={{
                fontWeight: 700, color: MC.text,
                display: 'flex', alignItems: 'center', gap: 1,
              }}>
                📡 Communication Log
                <Chip label={apiAvailable ? 'LIVE' : 'OFFLINE'} size="small" sx={{
                  height: 20, fontSize: '0.6rem', fontWeight: 800, letterSpacing: 1,
                  color:  apiAvailable ? MC.green : MC.red,
                  background: apiAvailable
                    ? `rgba(${hexRgb(MC.green)},0.10)`
                    : `rgba(${hexRgb(MC.red)},0.10)`,
                  border: `1px solid ${apiAvailable
                    ? `rgba(${hexRgb(MC.green)},0.30)`
                    : `rgba(${hexRgb(MC.red)},0.30)`}`,
                  animation: apiAvailable ? 'mcPulse 2s infinite' : 'none',
                }} />
              </Typography>
              <Typography variant="caption" sx={{
                color: '#475569', fontWeight: 500, fontSize: '0.7rem',
              }}>
                Inter-agent telemetry
              </Typography>
            </Box>

            <Box sx={{ flex: 1, overflow: 'hidden' }}>
              <AgentCommunicationLog maxHeight={450} />
            </Box>
          </Paper>
        </Grid>

        {/* RIGHT — Quick Stats + Task Queue */}
        <Grid item xs={12} lg={5}>
          <QuickStatsPanel
            agents={agents}
            tasksInProgress={tasksInProgress}
            apiAvailable={apiAvailable}
          />
        </Grid>
      </Grid>


      {/* ═══════════════════════════════════════════
       *  MISSION SYSTEMS — Escalation · Reasoning · Goals
       * ═══════════════════════════════════════════ */}
      <SectionDivider label="MISSION SYSTEMS" color={MC.violet} />

      {/* Escalation Hub */}
      <DarkPanel accent={MC.violet} sx={{ mb: 2.5 }}>
        <EscalationHub />
      </DarkPanel>

      {/* Reasoning Traces + Goal Dashboard */}
      <Grid container spacing={2.5} sx={{ mb: 2.5 }}>
        <Grid item xs={12} lg={6}>
          <DarkPanel accent={MC.violet}>
            <ReasoningTracePanel socket={socket} />
          </DarkPanel>
        </Grid>
        <Grid item xs={12} lg={6}>
          <DarkPanel accent={MC.blue}>
            <GoalDashboard />
          </DarkPanel>
        </Grid>
      </Grid>

      {/* Collaboration Viewer + System Health */}
      <Grid container spacing={2.5}>
        <Grid item xs={12} lg={6}>
          <DarkPanel accent={MC.green}>
            <CollaborationViewer />
          </DarkPanel>
        </Grid>
        <Grid item xs={12} lg={6}>
          <DarkPanel accent={MC.amber}>
            <SystemHealthPanel />
          </DarkPanel>
        </Grid>
      </Grid>


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
