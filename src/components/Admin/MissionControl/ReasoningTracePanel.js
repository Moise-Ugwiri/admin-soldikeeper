/* eslint-disable */
/**
 * ReasoningTracePanel — Animated OODA Loop Visualizer
 *
 * A cinematic real-time visualization of agent reasoning through the
 * OODA loop: Observe 🔍 → Orient 🧭 → Decide 🧠 → Act ▶️
 *
 * Features:
 *  • Animated 4-step OODA pipeline with pulsing glow on active phase
 *  • Last 10 reasoning traces with expandable phase details
 *  • Confidence bars color-coded green / amber / red
 *  • 🔴 LIVE badge + real-time "Currently in {phase}…" indicator
 *  • Dark theme (#0d1117) with neon glow effects
 *  • WebSocket for live data, HTTP fallback for history
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Box, Paper, Typography, Chip, IconButton, Collapse,
  LinearProgress, Stack, Select, MenuItem, FormControl,
  InputLabel, Tooltip, Alert, CircularProgress, keyframes
} from '@mui/material';
import {
  Visibility as ObserveIcon,
  Explore as OrientIcon,
  Psychology as DecideIcon,
  PlayArrow as ActIcon,
  Refresh as RefreshIcon,
  ExpandMore as ExpandIcon,
  ExpandLess as CollapseIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import apiClient from '../../../services/api';
import { getAgent } from '../../../data/agentRegistry';

// ─── Keyframe Animations ────────────────────────────────────────────────

const pulseGlow = keyframes`
  0%   { box-shadow: 0 0 4px currentColor, 0 0 8px currentColor; transform: scale(1); }
  50%  { box-shadow: 0 0 12px currentColor, 0 0 28px currentColor, 0 0 48px currentColor; transform: scale(1.07); }
  100% { box-shadow: 0 0 4px currentColor, 0 0 8px currentColor; transform: scale(1); }
`;

const livePulse = keyframes`
  0%   { opacity: 1; }
  50%  { opacity: 0.35; }
  100% { opacity: 1; }
`;

const slideIn = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const arrowFlow = keyframes`
  0%   { opacity: 0.4; }
  50%  { opacity: 1; }
  100% { opacity: 0.4; }
`;

// ─── Constants ──────────────────────────────────────────────────────────

const MAX_TRACES = 100;
const VISIBLE_TRACES = 10;

const OODA_PHASES = ['observe', 'orient', 'decide', 'act'];

const PHASE_CONFIG = {
  observe: { Icon: ObserveIcon, color: '#58a6ff', label: 'Observe', emoji: '🔍', bg: '#0d2240' },
  orient:  { Icon: OrientIcon,  color: '#f0883e', label: 'Orient',  emoji: '🧭', bg: '#3d2200' },
  decide:  { Icon: DecideIcon,  color: '#bc8cff', label: 'Decide',  emoji: '🧠', bg: '#271052' },
  act:     { Icon: ActIcon,     color: '#3fb950', label: 'Act',     emoji: '▶️', bg: '#0b3d15' },
};

const PHASE_ORDER = { observe: 0, orient: 1, decide: 2, act: 3 };

const formatTime = (ts) => {
  if (!ts) return '—';
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
};

const formatDuration = (ms) => {
  if (ms == null) return null;
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
};

const getConfidenceColor = (c) => {
  if (c == null) return '#8b949e';
  if (c > 80) return '#3fb950';
  if (c > 50) return '#f0883e';
  return '#f85149';
};

const resolveAgent = (agentId) => {
  const reg = getAgent(agentId);
  if (reg) return { name: reg.name, emoji: reg.emoji, color: reg.color };
  const fallback = {
    '00-orchestrator': { name: 'Apollo',     emoji: '🏛️', color: '#FFD700' },
    '00-apollo':       { name: 'Apollo',     emoji: '🏛️', color: '#FFD700' },
    '01-sentinel':     { name: 'Sentinel',   emoji: '🛡️', color: '#f85149' },
    '02-ledger':       { name: 'Ledger',     emoji: '📊', color: '#3fb950' },
    '03-vision':       { name: 'Vision',     emoji: '👁️', color: '#58a6ff' },
    '04-cortex':       { name: 'Cortex',     emoji: '🧠', color: '#bc8cff' },
    '05-vault':        { name: 'Vault',      emoji: '🔐', color: '#f0883e' },
    '06-nexus':        { name: 'Nexus',      emoji: '🔗', color: '#79c0ff' },
    '07-watchtower':   { name: 'Watchtower', emoji: '🗼', color: '#d2a8ff' },
    '08-prism':        { name: 'Prism',      emoji: '🎨', color: '#ff7b72' },
    '09-forge':        { name: 'Forge',      emoji: '🔨', color: '#ffa657' },
    '10-atlas':        { name: 'Atlas',      emoji: '🌍', color: '#7ee787' },
    '11-babel':        { name: 'Babel',      emoji: '🌐', color: '#a5d6ff' },
  };
  return fallback[agentId] || { name: agentId || 'Unknown', emoji: '🤖', color: '#8b949e' };
};

// ─── Sub-Components ─────────────────────────────────────────────────────

/** Single OODA step box in the pipeline */
const OodaStepBox = ({ phase, isActive, isCompleted }) => {
  const cfg = PHASE_CONFIG[phase];
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 0.5,
      }}
    >
      <Box
        sx={{
          width: 56,
          height: 56,
          borderRadius: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: isActive ? cfg.bg : isCompleted ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.02)',
          border: `2px solid ${isActive ? cfg.color : isCompleted ? cfg.color + '66' : '#30363d'}`,
          color: isActive ? cfg.color : isCompleted ? cfg.color + '99' : '#484f58',
          position: 'relative',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          animation: isActive ? `${pulseGlow} 2s ease-in-out infinite` : 'none',
          '&::after': isCompleted && !isActive ? {
            content: '"✓"',
            position: 'absolute',
            top: -6,
            right: -6,
            width: 18,
            height: 18,
            borderRadius: '50%',
            bgcolor: cfg.color,
            color: '#0d1117',
            fontSize: 11,
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          } : {},
        }}
      >
        <cfg.Icon sx={{ fontSize: 26 }} />
      </Box>
      <Typography
        sx={{
          fontSize: 11,
          fontWeight: isActive ? 700 : 500,
          color: isActive ? cfg.color : isCompleted ? '#c9d1d9' : '#484f58',
          letterSpacing: 0.5,
          transition: 'color 0.3s',
        }}
      >
        {cfg.emoji} {cfg.label}
      </Typography>
    </Box>
  );
};

/** Arrow connector between OODA steps */
const OodaArrow = ({ isActive }) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      px: 0.5,
      pt: 0,
      mt: -1.5,
    }}
  >
    <Typography
      sx={{
        fontSize: 20,
        color: isActive ? '#58a6ff' : '#30363d',
        fontWeight: 700,
        animation: isActive ? `${arrowFlow} 1.5s ease-in-out infinite` : 'none',
        transition: 'color 0.3s',
        lineHeight: 1,
        userSelect: 'none',
      }}
    >
      →
    </Typography>
  </Box>
);

/** Full OODA Pipeline display */
const OodaPipeline = ({ activePhase, completedPhases }) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'center',
      gap: 0,
      py: 2,
      px: 2,
    }}
  >
    {OODA_PHASES.map((phase, i) => {
      const isActive = phase === activePhase;
      const isCompleted = completedPhases.includes(phase);
      return (
        <React.Fragment key={phase}>
          <OodaStepBox phase={phase} isActive={isActive} isCompleted={isCompleted} />
          {i < 3 && (
            <OodaArrow isActive={isActive || (isCompleted && OODA_PHASES[i + 1] === activePhase)} />
          )}
        </React.Fragment>
      );
    })}
  </Box>
);

/** OODA phase indicator dots for a trace row */
const PhaseIndicators = ({ currentPhase }) => {
  const idx = PHASE_ORDER[currentPhase] ?? -1;
  return (
    <Stack direction="row" spacing={0.4} alignItems="center">
      {OODA_PHASES.map((p, i) => {
        const cfg = PHASE_CONFIG[p];
        const done = i <= idx;
        const active = i === idx;
        return (
          <Tooltip key={p} title={`${cfg.emoji} ${cfg.label}${active ? ' (current)' : done ? ' ✓' : ''}`} arrow>
            <Box
              sx={{
                width: active ? 12 : 8,
                height: active ? 12 : 8,
                borderRadius: '50%',
                bgcolor: done ? cfg.color : '#21262d',
                border: `1.5px solid ${done ? cfg.color : '#30363d'}`,
                transition: 'all 0.3s',
                animation: active ? `${livePulse} 1.2s ease-in-out infinite` : 'none',
              }}
            />
          </Tooltip>
        );
      })}
    </Stack>
  );
};

/** Confidence bar */
const ConfidenceBar = ({ value }) => {
  const barColor = getConfidenceColor(value);
  const displayVal = value != null ? Math.round(value) : null;
  if (displayVal == null) return null;
  return (
    <Tooltip title={`Confidence: ${displayVal}%`} arrow>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, minWidth: 80 }}>
        <Box sx={{ flex: 1, height: 6, borderRadius: 3, bgcolor: '#21262d', overflow: 'hidden' }}>
          <Box
            sx={{
              width: `${displayVal}%`,
              height: '100%',
              borderRadius: 3,
              bgcolor: barColor,
              transition: 'width 0.5s ease',
              boxShadow: `0 0 6px ${barColor}66`,
            }}
          />
        </Box>
        <Typography sx={{ fontSize: 10, color: barColor, fontWeight: 700, minWidth: 28, textAlign: 'right' }}>
          {displayVal}%
        </Typography>
      </Box>
    </Tooltip>
  );
};

/** Live reasoning indicator */
const LiveReasoningBanner = ({ trace }) => {
  if (!trace) return null;
  const agent = resolveAgent(trace.agentId);
  const cfg = PHASE_CONFIG[trace.phase] || PHASE_CONFIG.observe;
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        px: 2,
        py: 1,
        bgcolor: '#0d111766',
        borderBottom: '1px solid #21262d',
        animation: `${slideIn} 0.3s ease-out`,
      }}
    >
      <Box
        sx={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          bgcolor: agent.color + '22',
          border: `2px solid ${agent.color}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 16,
          animation: `${livePulse} 1.5s ease-in-out infinite`,
        }}
      >
        {agent.emoji}
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontSize: 12, fontWeight: 700, color: '#e6edf3' }}>
          {agent.name}
        </Typography>
        <Typography sx={{ fontSize: 11, color: cfg.color, fontWeight: 500 }}>
          Currently in {cfg.emoji} {cfg.label} phase…
        </Typography>
      </Box>
      <Box
        sx={{
          px: 1,
          py: 0.3,
          borderRadius: 1,
          bgcolor: '#f8514922',
          border: '1px solid #f8514944',
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
        }}
      >
        <Box
          sx={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            bgcolor: '#f85149',
            animation: `${livePulse} 1s ease-in-out infinite`,
          }}
        />
        <Typography sx={{ fontSize: 10, fontWeight: 800, color: '#f85149', letterSpacing: 1 }}>
          LIVE
        </Typography>
      </Box>
    </Box>
  );
};

/** Single trace row */
const TraceRow = ({ trace, isExpanded, onToggle }) => {
  const agent = resolveAgent(trace.agentId);
  const cfg = PHASE_CONFIG[trace.phase] || PHASE_CONFIG.observe;
  const confidence = trace.data?.confidence ?? trace.data?.reasoning?.confidence ?? null;
  const duration = trace.data?.duration;
  const message = typeof trace.data === 'string'
    ? trace.data
    : trace.data?.message || trace.data?.action || 'Processing…';

  const phaseDetails = trace.data?.reasoning || null;

  return (
    <Box
      sx={{
        borderBottom: '1px solid #21262d',
        transition: 'background-color 0.2s',
        animation: `${slideIn} 0.35s ease-out`,
        '&:hover': { bgcolor: '#161b2266' },
      }}
    >
      {/* Main row */}
      <Box
        onClick={onToggle}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.2,
          px: 2,
          py: 1.2,
          cursor: 'pointer',
          userSelect: 'none',
        }}
      >
        {/* Agent avatar */}
        <Tooltip title={agent.name} arrow>
          <Box
            sx={{
              width: 30,
              height: 30,
              borderRadius: '50%',
              bgcolor: agent.color + '1a',
              border: `1.5px solid ${agent.color}55`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 14,
              flexShrink: 0,
            }}
          >
            {agent.emoji}
          </Box>
        </Tooltip>

        {/* Agent name + message */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack direction="row" alignItems="center" spacing={0.8}>
            <Typography sx={{ fontSize: 12, fontWeight: 700, color: agent.color }}>
              {agent.name}
            </Typography>
            <PhaseIndicators currentPhase={trace.phase} />
          </Stack>
          <Typography
            noWrap
            sx={{ fontSize: 11, color: '#8b949e', mt: 0.2, maxWidth: '100%' }}
          >
            {message}
          </Typography>
        </Box>

        {/* Confidence bar */}
        <Box sx={{ width: 90, flexShrink: 0 }}>
          <ConfidenceBar value={confidence} />
        </Box>

        {/* Duration */}
        <Typography
          sx={{
            fontSize: 10,
            color: '#8b949e',
            fontFamily: 'monospace',
            minWidth: 48,
            textAlign: 'right',
            flexShrink: 0,
          }}
        >
          {formatDuration(duration) || '—'}
        </Typography>

        {/* Timestamp */}
        <Typography
          sx={{
            fontSize: 10,
            color: '#484f58',
            fontFamily: 'monospace',
            minWidth: 64,
            textAlign: 'right',
            flexShrink: 0,
          }}
        >
          {formatTime(trace.timestamp)}
        </Typography>

        {/* Expand toggle */}
        <IconButton size="small" sx={{ p: 0.3, color: '#484f58' }}>
          {isExpanded ? <CollapseIcon sx={{ fontSize: 16 }} /> : <ExpandIcon sx={{ fontSize: 16 }} />}
        </IconButton>
      </Box>

      {/* Expanded detail */}
      <Collapse in={isExpanded}>
        <Box
          sx={{
            px: 2,
            pb: 1.5,
            pl: 6.5,
          }}
        >
          {/* Phase breakdown */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 1,
              mb: 1.2,
            }}
          >
            {OODA_PHASES.map((p) => {
              const pCfg = PHASE_CONFIG[p];
              const idx = PHASE_ORDER[p];
              const currentIdx = PHASE_ORDER[trace.phase] ?? -1;
              const reached = idx <= currentIdx;
              const phaseText = phaseDetails?.[p] || (reached ? 'Completed' : 'Pending');
              return (
                <Box
                  key={p}
                  sx={{
                    p: 1,
                    borderRadius: 1,
                    bgcolor: reached ? pCfg.color + '0d' : '#0d111700',
                    border: `1px solid ${reached ? pCfg.color + '33' : '#21262d'}`,
                    transition: 'all 0.3s',
                  }}
                >
                  <Typography sx={{ fontSize: 10, fontWeight: 700, color: reached ? pCfg.color : '#484f58', mb: 0.3 }}>
                    {pCfg.emoji} {pCfg.label}
                  </Typography>
                  <Typography sx={{ fontSize: 10, color: reached ? '#c9d1d9' : '#30363d', lineHeight: 1.4 }}>
                    {typeof phaseText === 'string' ? phaseText : JSON.stringify(phaseText)}
                  </Typography>
                </Box>
              );
            })}
          </Box>

          {/* Raw data (if object) */}
          {trace.data && typeof trace.data === 'object' && (
            <Box
              sx={{
                p: 1.2,
                borderRadius: 1,
                bgcolor: '#010409',
                border: '1px solid #21262d',
                fontFamily: '"JetBrains Mono", "Fira Code", monospace',
                fontSize: 10.5,
                color: '#7ee787',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                maxHeight: 180,
                overflowY: 'auto',
                lineHeight: 1.6,
                '&::-webkit-scrollbar': { width: 4 },
                '&::-webkit-scrollbar-thumb': { bgcolor: '#30363d', borderRadius: 2 },
              }}
            >
              {JSON.stringify(trace.data, null, 2)}
            </Box>
          )}
        </Box>
      </Collapse>
    </Box>
  );
};

// ─── Main Component ─────────────────────────────────────────────────────

const ReasoningTracePanel = ({ socket }) => {
  const [traces, setTraces] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [agentFilter, setAgentFilter] = useState('all');
  const [panelOpen, setPanelOpen] = useState(true);
  const [isLive, setIsLive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTrace, setActiveTrace] = useState(null);

  const scrollRef = useRef(null);

  // ── Add a trace to state ──────────────────────────────────────────────
  const addTrace = useCallback((trace) => {
    const enriched = { ...trace, id: `${trace.agentId}-${Date.now()}-${Math.random()}` };
    setTraces((prev) => {
      const next = [...prev, enriched];
      return next.length > MAX_TRACES ? next.slice(-MAX_TRACES) : next;
    });
    if (trace.type === 'thinking' || trace.type === 'task_started' || trace.type === 'step_complete') {
      setActiveTrace(enriched);
    }
    if (trace.type === 'task_completed') {
      setActiveTrace(null);
    }
  }, []);

  // ── WebSocket listeners ───────────────────────────────────────────────
  useEffect(() => {
    if (!socket) return;

    const onThinking = (data) => {
      addTrace({
        type: 'thinking',
        agentId: data.agentId,
        phase: data.phase || 'observe',
        data: data.data || data,
        timestamp: data.timestamp || new Date().toISOString(),
      });
    };

    const onTaskStarted = (data) => {
      addTrace({
        type: 'task_started',
        agentId: data.agentId,
        phase: 'observe',
        data: { message: `Task started: ${data.action || data.task || 'unknown'}`, ...data },
        timestamp: data.timestamp || new Date().toISOString(),
      });
    };

    const onTaskCompleted = (data) => {
      addTrace({
        type: 'task_completed',
        agentId: data.agentId,
        phase: 'act',
        data: { message: `Task completed (${data.status || 'done'})`, ...data },
        timestamp: data.timestamp || new Date().toISOString(),
      });
    };

    const onStepComplete = (data) => {
      addTrace({
        type: 'step_complete',
        agentId: data.agentId,
        phase: data.phase || 'act',
        data: data.data || data,
        timestamp: data.timestamp || new Date().toISOString(),
      });
    };

    socket.on('agent:thinking', onThinking);
    socket.on('agent:task:started', onTaskStarted);
    socket.on('agent:task:completed', onTaskCompleted);
    socket.on('agent:step:complete', onStepComplete);
    setIsLive(true);

    return () => {
      socket.off('agent:thinking', onThinking);
      socket.off('agent:task:started', onTaskStarted);
      socket.off('agent:task:completed', onTaskCompleted);
      socket.off('agent:step:complete', onStepComplete);
      setIsLive(false);
    };
  }, [socket, addTrace]);

  // ── Auto-scroll ───────────────────────────────────────────────────────
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [traces]);

  // ── HTTP fallback ─────────────────────────────────────────────────────
  const fetchTraces = useCallback(async () => {
    setLoading(true);
    try {
      const params = { limit: 20 };
      if (agentFilter !== 'all') params.agentId = agentFilter;
      const res = await apiClient.get('/admin/agent-management/reasoning-traces', { params });
      const fetched = (res.data?.traces || []).map((t) => ({
        id: t._id || `http-${Date.now()}-${Math.random()}`,
        type: 'historical',
        agentId: t.agentId,
        phase: t.reasoning?.phase || 'observe',
        data: {
          message: `${t.action} — ${t.status}`,
          reasoning: t.reasoning,
          duration: t.duration,
          confidence: t.reasoning?.confidence,
        },
        timestamp: t.createdAt,
      }));
      setTraces(fetched);
    } catch (err) {
      console.error('Failed to fetch reasoning traces:', err);
    } finally {
      setLoading(false);
    }
  }, [agentFilter]);

  // ── Toggle expansion ──────────────────────────────────────────────────
  const toggleExpand = useCallback((id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  // ── Derived data ──────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const base = agentFilter === 'all' ? traces : traces.filter((t) => t.agentId === agentFilter);
    return base.slice(-VISIBLE_TRACES);
  }, [traces, agentFilter]);

  const seenAgents = useMemo(
    () => [...new Set(traces.map((t) => t.agentId))].filter(Boolean),
    [traces]
  );

  const activePhase = activeTrace?.phase || null;
  const completedPhases = useMemo(() => {
    if (!activePhase) return [];
    const idx = PHASE_ORDER[activePhase] ?? -1;
    return OODA_PHASES.filter((_, i) => i < idx);
  }, [activePhase]);

  // ─── Render ───────────────────────────────────────────────────────────
  return (
    <Paper
      elevation={0}
      sx={{
        overflow: 'hidden',
        bgcolor: '#0d1117',
        border: '1px solid #21262d',
        borderRadius: 2,
      }}
    >
      {/* ──── Header ──── */}
      <Box
        onClick={() => setPanelOpen((v) => !v)}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2,
          py: 1.4,
          background: 'linear-gradient(135deg, #0d111788, #161b2288)',
          borderBottom: '1px solid #21262d',
          cursor: 'pointer',
          userSelect: 'none',
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1.2}>
          <Box
            sx={{
              width: 28,
              height: 28,
              borderRadius: 1,
              bgcolor: '#bc8cff18',
              border: '1px solid #bc8cff33',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <DecideIcon sx={{ fontSize: 16, color: '#bc8cff' }} />
          </Box>
          <Typography sx={{ fontSize: 14, fontWeight: 700, color: '#e6edf3', letterSpacing: 0.3 }}>
            OODA Reasoning Traces
          </Typography>

          {/* LIVE badge */}
          {isLive && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                px: 0.8,
                py: 0.2,
                borderRadius: 1,
                bgcolor: '#f8514922',
                border: '1px solid #f8514944',
              }}
            >
              <Box
                sx={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  bgcolor: '#f85149',
                  animation: `${livePulse} 1s ease-in-out infinite`,
                }}
              />
              <Typography sx={{ fontSize: 10, fontWeight: 800, color: '#f85149', letterSpacing: 1 }}>
                LIVE
              </Typography>
            </Box>
          )}

          {/* Trace count badge */}
          <Chip
            label={filtered.length}
            size="small"
            sx={{
              height: 20,
              fontSize: 10,
              fontWeight: 700,
              bgcolor: '#21262d',
              color: '#8b949e',
              border: '1px solid #30363d',
              '& .MuiChip-label': { px: 0.8 },
            }}
          />
        </Stack>

        <Stack direction="row" alignItems="center" spacing={0.5}>
          <Tooltip title="Fetch history from API">
            <IconButton
              size="small"
              onClick={(e) => { e.stopPropagation(); fetchTraces(); }}
              disabled={loading}
              sx={{ color: '#8b949e', '&:hover': { color: '#e6edf3' } }}
            >
              {loading ? <CircularProgress size={16} sx={{ color: '#58a6ff' }} /> : <RefreshIcon sx={{ fontSize: 18 }} />}
            </IconButton>
          </Tooltip>
          <IconButton size="small" sx={{ color: '#484f58' }}>
            {panelOpen ? <CollapseIcon sx={{ fontSize: 18 }} /> : <ExpandIcon sx={{ fontSize: 18 }} />}
          </IconButton>
        </Stack>
      </Box>

      <Collapse in={panelOpen}>
        {/* ──── OODA Pipeline Visualization ──── */}
        <Box
          sx={{
            background: 'linear-gradient(180deg, #010409 0%, #0d111766 100%)',
            borderBottom: '1px solid #21262d',
          }}
        >
          <OodaPipeline activePhase={activePhase} completedPhases={completedPhases} />
        </Box>

        {/* ──── Live Reasoning Banner ──── */}
        {activeTrace && <LiveReasoningBanner trace={activeTrace} />}

        {/* ──── Filter Bar ──── */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            px: 2,
            py: 1,
            borderBottom: '1px solid #21262d',
            bgcolor: '#0d111744',
          }}
        >
          <FilterIcon sx={{ fontSize: 16, color: '#484f58' }} />
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel
              sx={{
                fontSize: 12,
                color: '#8b949e',
                '&.Mui-focused': { color: '#58a6ff' },
              }}
            >
              Agent
            </InputLabel>
            <Select
              value={agentFilter}
              label="Agent"
              onChange={(e) => setAgentFilter(e.target.value)}
              sx={{
                fontSize: 12,
                color: '#c9d1d9',
                '.MuiOutlinedInput-notchedOutline': { borderColor: '#30363d' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#484f58' },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#58a6ff' },
                '.MuiSvgIcon-root': { color: '#484f58' },
              }}
              MenuProps={{
                PaperProps: {
                  sx: {
                    bgcolor: '#161b22',
                    border: '1px solid #30363d',
                    '& .MuiMenuItem-root': {
                      fontSize: 12,
                      color: '#c9d1d9',
                      '&:hover': { bgcolor: '#21262d' },
                      '&.Mui-selected': { bgcolor: '#1f6feb33' },
                    },
                  },
                },
              }}
            >
              <MenuItem value="all">All Agents</MenuItem>
              {seenAgents.map((id) => {
                const a = resolveAgent(id);
                return (
                  <MenuItem key={id} value={id}>
                    {a.emoji} {a.name}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>

          <Box
            component="button"
            onClick={fetchTraces}
            disabled={loading}
            sx={{
              px: 1.5,
              py: 0.5,
              borderRadius: 1,
              border: '1px solid #30363d',
              bgcolor: 'transparent',
              color: '#8b949e',
              fontSize: 11,
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              '&:hover:not(:disabled)': { bgcolor: '#21262d', color: '#e6edf3', borderColor: '#484f58' },
            }}
          >
            Load History
          </Box>
        </Box>

        {loading && (
          <LinearProgress
            sx={{
              height: 2,
              bgcolor: '#21262d',
              '& .MuiLinearProgress-bar': { bgcolor: '#58a6ff' },
            }}
          />
        )}

        {/* ──── Trace List ──── */}
        <Box
          ref={scrollRef}
          sx={{
            maxHeight: 460,
            overflowY: 'auto',
            '&::-webkit-scrollbar': { width: 6 },
            '&::-webkit-scrollbar-track': { bgcolor: '#0d1117' },
            '&::-webkit-scrollbar-thumb': { bgcolor: '#30363d', borderRadius: 3, '&:hover': { bgcolor: '#484f58' } },
          }}
        >
          {filtered.length === 0 ? (
            <Box sx={{ py: 5, textAlign: 'center' }}>
              <Typography sx={{ fontSize: 28, mb: 1 }}>🔍</Typography>
              <Typography sx={{ fontSize: 13, color: '#484f58', fontWeight: 500 }}>
                No reasoning traces yet
              </Typography>
              <Typography sx={{ fontSize: 11, color: '#30363d', mt: 0.5 }}>
                Traces appear when agents begin their OODA reasoning loop
              </Typography>
            </Box>
          ) : (
            filtered.map((trace) => (
              <TraceRow
                key={trace.id}
                trace={trace}
                isExpanded={!!expanded[trace.id]}
                onToggle={() => toggleExpand(trace.id)}
              />
            ))
          )}
        </Box>

        {/* ──── Footer ──── */}
        {traces.length > VISIBLE_TRACES && (
          <Box
            sx={{
              px: 2,
              py: 0.8,
              borderTop: '1px solid #21262d',
              bgcolor: '#0d111744',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography sx={{ fontSize: 10, color: '#484f58' }}>
              Showing last {VISIBLE_TRACES} of {traces.length} traces
            </Typography>
          </Box>
        )}
      </Collapse>
    </Paper>
  );
};

export default ReasoningTracePanel;
