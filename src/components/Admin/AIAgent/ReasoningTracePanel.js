/* eslint-disable */
/**
 * ReasoningTracePanel — Live OODA Loop Reasoning Trace Viewer
 *
 * Shows real-time reasoning traces as agents think through tasks.
 * Connects via WebSocket for live updates with HTTP fallback.
 *
 * OODA phases: Observe → Orient → Decide → Act
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box, Paper, Typography, Chip, IconButton, Collapse,
  Card, CardContent, Tooltip, Divider, Alert,
  LinearProgress, Stack, Select, MenuItem, FormControl, InputLabel,
  useTheme, alpha, Button, CircularProgress
} from '@mui/material';
import {
  Timeline, TimelineItem, TimelineSeparator, TimelineConnector,
  TimelineContent, TimelineDot, TimelineOppositeContent
} from '@mui/lab';
import {
  Visibility as ObserveIcon,
  Explore as OrientIcon,
  Psychology as DecideIcon,
  PlayArrow as ActIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
  ExpandMore as ExpandIcon,
  ExpandLess as CollapseIcon,
  FiberManualRecord as LiveDot
} from '@mui/icons-material';
import apiClient from '../../../services/api';

// ─── Constants ──────────────────────────────────────────────────────────

const MAX_TRACES = 100;

const PHASE_CONFIG = {
  observe: { icon: ObserveIcon, color: '#2196f3', label: 'Observe', emoji: '🔍' },
  orient:  { icon: OrientIcon,  color: '#ff9800', label: 'Orient',  emoji: '🧭' },
  decide:  { icon: DecideIcon,  color: '#9c27b0', label: 'Decide',  emoji: '🧠' },
  act:     { icon: ActIcon,     color: '#4caf50', label: 'Act',     emoji: '▶️' },
};

const AGENT_NAMES = {
  '00-orchestrator': 'Apollo',
  '01-sentinel': 'Sentinel',
  '02-ledger': 'Ledger',
  '03-vision': 'Vision',
  '04-cortex': 'Cortex',
  '05-vault': 'Vault',
  '06-nexus': 'Nexus',
  '07-watchtower': 'Watchtower',
  '08-prism': 'Prism',
  '09-forge': 'Forge',
  '10-atlas': 'Atlas',
  '11-babel': 'Babel',
};

const formatTime = (ts) => {
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
};

// ─── Component ──────────────────────────────────────────────────────────

const ReasoningTracePanel = ({ socket }) => {
  const theme = useTheme();

  const [traces, setTraces] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [agentFilter, setAgentFilter] = useState('all');
  const [panelOpen, setPanelOpen] = useState(true);
  const [isLive, setIsLive] = useState(false);
  const [loading, setLoading] = useState(false);

  const scrollRef = useRef(null);

  // ── Add a trace to state ──────────────────────────────────────────────
  const addTrace = useCallback((trace) => {
    setTraces((prev) => {
      const next = [...prev, { ...trace, id: `${trace.agentId}-${Date.now()}-${Math.random()}` }];
      return next.length > MAX_TRACES ? next.slice(-MAX_TRACES) : next;
    });
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
  const toggleExpand = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // ── Filtered traces ───────────────────────────────────────────────────
  const filtered = agentFilter === 'all'
    ? traces
    : traces.filter((t) => t.agentId === agentFilter);

  // ── Unique agents seen ────────────────────────────────────────────────
  const seenAgents = [...new Set(traces.map((t) => t.agentId))].filter(Boolean);

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <Paper
      elevation={3}
      sx={{
        p: 0,
        overflow: 'hidden',
        border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          px: 2, py: 1.5,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)}, ${alpha(theme.palette.secondary.main, 0.05)})`,
          borderBottom: `1px solid ${theme.palette.divider}`,
          cursor: 'pointer',
        }}
        onClick={() => setPanelOpen(!panelOpen)}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          <DecideIcon sx={{ color: theme.palette.primary.main }} />
          <Typography variant="h6" fontWeight={700}>Reasoning Traces</Typography>
          {isLive && (
            <Chip
              icon={<LiveDot sx={{ fontSize: 10, color: '#4caf50' }} />}
              label="LIVE"
              size="small"
              sx={{ bgcolor: alpha('#4caf50', 0.12), color: '#4caf50', fontWeight: 700, fontSize: 11 }}
            />
          )}
          <Chip label={filtered.length} size="small" variant="outlined" />
        </Stack>
        <Stack direction="row" alignItems="center" spacing={0.5}>
          <Tooltip title="Fetch from API">
            <IconButton
              size="small"
              onClick={(e) => { e.stopPropagation(); fetchTraces(); }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={18} /> : <RefreshIcon fontSize="small" />}
            </IconButton>
          </Tooltip>
          <IconButton size="small">
            {panelOpen ? <CollapseIcon /> : <ExpandIcon />}
          </IconButton>
        </Stack>
      </Box>

      <Collapse in={panelOpen}>
        {/* Filter bar */}
        <Box sx={{ px: 2, py: 1, display: 'flex', alignItems: 'center', gap: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
          <FilterIcon fontSize="small" color="action" />
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Agent</InputLabel>
            <Select
              value={agentFilter}
              label="Agent"
              onChange={(e) => setAgentFilter(e.target.value)}
            >
              <MenuItem value="all">All Agents</MenuItem>
              {Object.entries(AGENT_NAMES).map(([id, name]) => (
                <MenuItem key={id} value={id}>{name} ({id})</MenuItem>
              ))}
              {/* Also show agents seen in live data not in static list */}
              {seenAgents
                .filter((id) => !AGENT_NAMES[id])
                .map((id) => (
                  <MenuItem key={id} value={id}>{id}</MenuItem>
                ))}
            </Select>
          </FormControl>
          <Button size="small" variant="outlined" onClick={fetchTraces} disabled={loading}>
            Load History
          </Button>
        </Box>

        {loading && <LinearProgress />}

        {/* Timeline */}
        <Box
          ref={scrollRef}
          sx={{
            maxHeight: 480,
            overflowY: 'auto',
            px: 1,
            py: 1,
          }}
        >
          {filtered.length === 0 ? (
            <Alert severity="info" sx={{ m: 2 }}>
              No reasoning traces yet. Traces appear when agents begin thinking.
            </Alert>
          ) : (
            <Timeline position="right" sx={{ p: 0, m: 0 }}>
              {filtered.map((trace) => {
                const cfg = PHASE_CONFIG[trace.phase] || PHASE_CONFIG.observe;
                const PhaseIcon = cfg.icon;
                const isExpanded = expanded[trace.id];
                const detail = typeof trace.data === 'string' ? trace.data : trace.data?.message || JSON.stringify(trace.data, null, 2);

                return (
                  <TimelineItem key={trace.id}>
                    <TimelineOppositeContent
                      sx={{ flex: 0.18, py: 1, px: 0.5, minWidth: 80 }}
                    >
                      <Typography variant="caption" color="text.secondary" noWrap>
                        {formatTime(trace.timestamp)}
                      </Typography>
                    </TimelineOppositeContent>

                    <TimelineSeparator>
                      <TimelineDot sx={{ bgcolor: cfg.color, p: 0.6 }}>
                        <PhaseIcon sx={{ fontSize: 16, color: '#fff' }} />
                      </TimelineDot>
                      <TimelineConnector sx={{ bgcolor: alpha(cfg.color, 0.25) }} />
                    </TimelineSeparator>

                    <TimelineContent sx={{ py: 1, px: 1.5 }}>
                      <Card
                        variant="outlined"
                        sx={{
                          cursor: 'pointer',
                          borderLeft: `3px solid ${cfg.color}`,
                          '&:hover': { bgcolor: alpha(cfg.color, 0.04) },
                        }}
                        onClick={() => toggleExpand(trace.id)}
                      >
                        <CardContent sx={{ py: 1, px: 1.5, '&:last-child': { pb: 1 } }}>
                          <Stack direction="row" alignItems="center" justifyContent="space-between">
                            <Stack direction="row" alignItems="center" spacing={1}>
                              <Chip
                                label={cfg.label}
                                size="small"
                                sx={{
                                  bgcolor: alpha(cfg.color, 0.12),
                                  color: cfg.color,
                                  fontWeight: 700,
                                  fontSize: 11,
                                }}
                              />
                              <Chip
                                label={AGENT_NAMES[trace.agentId] || trace.agentId}
                                size="small"
                                variant="outlined"
                                sx={{ fontSize: 11 }}
                              />
                              {trace.type === 'task_completed' && (
                                <SuccessIcon sx={{ fontSize: 16, color: '#4caf50' }} />
                              )}
                              {trace.type === 'task_started' && (
                                <LiveDot sx={{ fontSize: 10, color: '#2196f3' }} />
                              )}
                            </Stack>
                            <IconButton size="small" sx={{ p: 0 }}>
                              {isExpanded ? <CollapseIcon fontSize="small" /> : <ExpandIcon fontSize="small" />}
                            </IconButton>
                          </Stack>

                          <Typography variant="body2" sx={{ mt: 0.5 }} noWrap={!isExpanded}>
                            {detail}
                          </Typography>

                          <Collapse in={isExpanded}>
                            {trace.data && typeof trace.data === 'object' && (
                              <Box
                                sx={{
                                  mt: 1, p: 1,
                                  bgcolor: alpha(theme.palette.text.primary, 0.03),
                                  borderRadius: 1,
                                  fontFamily: 'monospace',
                                  fontSize: 12,
                                  whiteSpace: 'pre-wrap',
                                  wordBreak: 'break-word',
                                  maxHeight: 200,
                                  overflowY: 'auto',
                                }}
                              >
                                {JSON.stringify(trace.data, null, 2)}
                              </Box>
                            )}
                            {trace.data?.duration != null && (
                              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                                Duration: {trace.data.duration}ms
                              </Typography>
                            )}
                          </Collapse>
                        </CardContent>
                      </Card>
                    </TimelineContent>
                  </TimelineItem>
                );
              })}
            </Timeline>
          )}
        </Box>
      </Collapse>
    </Paper>
  );
};

export default ReasoningTracePanel;
