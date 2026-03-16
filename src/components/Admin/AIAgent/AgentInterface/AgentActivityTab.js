/* eslint-disable */
/**
 * 📊 AGENT ACTIVITY TAB — Visual Timeline View
 * 
 * A rich vertical timeline that replaces the old data-table layout.
 * Each execution entry appears as a card on a colour-coded timeline,
 * grouped by relative time ("Just now", "5 minutes ago", …).
 *
 * Features kept from the original:
 *  - API fetching (axios) with time-range filter
 *  - WebSocket real-time updates (socket.io)
 *  - Current-task progress bar
 *  - Performance metric cards
 *
 * Visual enhancements:
 *  - Vertical timeline line + coloured dots
 *  - Outcome icons: ✅ success · ⚠️ escalated · ❌ failed
 *  - Confidence % badge
 *  - Fade-in keyframe animation per entry
 *  - Dark-theme compatible (#0d1117 tones)
 *  - Agent colour accents throughout
 *  - Elegant empty state with agent emoji
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  LinearProgress,
  CircularProgress,
  Grid,
  Button,
  Select,
  MenuItem,
  FormControl,
  alpha,
  keyframes
} from '@mui/material';
import axios from 'axios';
import { io } from 'socket.io-client';
import { getAgent } from '../../../../data/agentRegistry';

// ───────────────────────────────────────────────
// Keyframe: fade-in + slide-up for timeline cards
// ───────────────────────────────────────────────
const fadeSlideIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

// ───────────────────────────────────────────────
// Helpers
// ───────────────────────────────────────────────
const STATUS_META = {
  success:   { icon: '✅', label: 'Success',   color: '#4CAF50' },
  failed:    { icon: '❌', label: 'Failed',    color: '#F44336' },
  escalated: { icon: '⚠️', label: 'Escalated', color: '#FF9800' },
  pending:   { icon: '⏳', label: 'Pending',   color: '#9E9E9E' },
};

const getStatusMeta = (status) => STATUS_META[status] || STATUS_META.pending;

const formatTimeAgo = (timestamp) => {
  if (!timestamp) return '';
  const diffMs = Date.now() - new Date(timestamp).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1)  return 'Just now';
  if (mins < 60) return `${mins} minute${mins === 1 ? '' : 's'} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs === 1 ? '' : 's'} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days === 1 ? '' : 's'} ago`;
};

/** Assign a coarse time-bucket for grouping */
const getTimeBucket = (timestamp) => {
  if (!timestamp) return 'Unknown';
  const diffMs = Date.now() - new Date(timestamp).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 2)    return 'Just now';
  if (mins < 15)   return 'A few minutes ago';
  if (mins < 60)   return 'Less than an hour ago';
  const hrs = Math.floor(mins / 60);
  if (hrs < 6)     return 'Earlier today';
  if (hrs < 24)    return 'Today';
  if (hrs < 48)    return 'Yesterday';
  return 'Older';
};

/** Group an array of executions by time bucket, preserving order */
const groupByTime = (executions) => {
  const groups = [];
  const seen = new Set();
  for (const exec of executions) {
    const bucket = getTimeBucket(exec.timestamp || exec.createdAt);
    if (!seen.has(bucket)) {
      seen.add(bucket);
      groups.push({ label: bucket, items: [] });
    }
    groups[groups.length - 1].items.push(exec);
  }
  return groups;
};

// ═══════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════
const AgentActivityTab = ({ agent }) => {
  const token = localStorage.getItem('token');

  // Resolve registry data so we always have emoji / colour
  const registryAgent = useMemo(() => getAgent(agent.id) || {}, [agent.id]);
  const agentEmoji    = agent.emoji  || registryAgent.emoji  || '🤖';
  const agentColor    = agent.color  || registryAgent.color  || '#64B5F6';
  const agentName     = agent.name   || registryAgent.name   || 'Agent';

  // ── State ────────────────────────────────────
  const [loading, setLoading]         = useState(true);
  const [executions, setExecutions]   = useState([]);
  const [metrics, setMetrics]         = useState({
    totalTasks: 0,
    successRate: 0,
    avgResponseTime: 0,
    escalationRate: 0
  });
  const [currentTask, setCurrentTask] = useState(null);
  const [timeFilter, setTimeFilter]   = useState('24h');

  // ── Fetch execution history ──────────────────
  const loadExecutions = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL || 'https://soldikeeper-backend-production.up.railway.app/api'}/admin/agent-management/${agent.id}/executions`,
        {
          params: { timeRange: timeFilter },
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        const execData = response.data.data || response.data.executions || [];
        const execList = Array.isArray(execData) ? execData : (execData.executions || []);
        setExecutions(execList);

        const successful = execList.filter(e => e.status === 'success').length;
        const escalated  = execList.filter(e => e.escalated).length;
        const totalTime  = execList.reduce((sum, e) => sum + (e.duration || 0), 0);

        setMetrics({
          totalTasks:      execList.length,
          successRate:     execList.length > 0 ? (successful / execList.length * 100).toFixed(1) : 0,
          avgResponseTime: execList.length > 0 ? (totalTime / execList.length / 1000).toFixed(1) : 0,
          escalationRate:  execList.length > 0 ? (escalated / execList.length * 100).toFixed(1) : 0
        });
      }
    } catch (error) {
      console.error('Failed to load executions:', error);
    } finally {
      setLoading(false);
    }
  }, [agent.id, timeFilter, token]);

  useEffect(() => { loadExecutions(); }, [loadExecutions]);

  // ── WebSocket for real-time updates ──────────
  useEffect(() => {
    if (!token) return;

    const wsUrl = process.env.REACT_APP_WS_URL ||
      (window.location.protocol === 'https:'
        ? 'wss://soldikeeper-backend-production.up.railway.app'
        : 'ws://localhost:3001');

    const newSocket = io(wsUrl, {
      path: '/admin/realtime',
      auth: { token },
      transports: ['websocket', 'polling']
    });

    newSocket.on('agent:execution:start', (data) => {
      if (data.agentId === agent.id) setCurrentTask(data);
    });

    newSocket.on('agent:execution:complete', (data) => {
      if (data.agentId === agent.id) {
        setCurrentTask(null);
        setExecutions(prev => [data, ...prev].slice(0, 50));
        loadExecutions();
      }
    });

    return () => { newSocket.close(); };
  }, [token, agent.id, loadExecutions]);

  // ── Grouped timeline data ────────────────────
  const groups = useMemo(() => groupByTime(executions.slice(0, 20)), [executions]);

  // ─────────────────────────────────────────────
  // RENDER: Loading
  // ─────────────────────────────────────────────
  if (loading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400, flexDirection: 'column', gap: 2 }}>
        <CircularProgress sx={{ color: agentColor }} />
        <Typography variant="body2" color="text.secondary">Loading activity data…</Typography>
      </Box>
    );
  }

  // ─────────────────────────────────────────────
  // RENDER: Main
  // ─────────────────────────────────────────────
  return (
    <Box sx={{ p: 3 }}>

      {/* ── Current Status + Task ──────────────── */}
      <Paper
        elevation={0}
        sx={{
          p: 2, mb: 3,
          border: '1px solid',
          borderColor: alpha(agentColor, 0.25),
          borderRadius: 2,
          background: `linear-gradient(135deg, ${alpha(agentColor, 0.04)} 0%, transparent 60%)`
        }}
      >
        <Box display="flex" alignItems="center" gap={1.5} mb={1}>
          <Typography fontSize={22}>{agentEmoji}</Typography>
          <Typography variant="body2" fontWeight={700}>{agentName}</Typography>
          <Chip
            label={agent.status?.toUpperCase() || 'IDLE'}
            size="small"
            sx={{
              ml: 'auto',
              backgroundColor: alpha(agent.status === 'busy' ? '#FF9800' : '#4CAF50', 0.12),
              color: agent.status === 'busy' ? '#FF9800' : '#4CAF50',
              fontWeight: 700, fontSize: '0.7rem'
            }}
          />
        </Box>

        {(currentTask || agent.currentTask) && (
          <Paper
            elevation={0}
            sx={{
              p: 1.5, mt: 1,
              backgroundColor: alpha(agentColor, 0.06),
              border: '1px solid',
              borderColor: alpha(agentColor, 0.18),
              borderRadius: 1.5
            }}
          >
            <Typography variant="body2" fontWeight={500} mb={0.5}>
              {currentTask?.description || agent.currentTask || 'Processing…'}
            </Typography>
            {currentTask && (
              <>
                <LinearProgress
                  variant={currentTask.progress ? 'determinate' : 'indeterminate'}
                  value={currentTask.progress || 0}
                  sx={{
                    height: 5, borderRadius: 3,
                    backgroundColor: alpha(agentColor, 0.1),
                    '& .MuiLinearProgress-bar': { backgroundColor: agentColor }
                  }}
                />
                <Box display="flex" justifyContent="space-between" mt={0.5}>
                  <Typography variant="caption" color="text.secondary">
                    Started {formatTimeAgo(currentTask.startTime)}
                  </Typography>
                  {currentTask.toolsUsed && (
                    <Typography variant="caption" color="text.secondary">
                      Tools: {currentTask.toolsUsed.join(', ')}
                    </Typography>
                  )}
                </Box>
              </>
            )}
          </Paper>
        )}
      </Paper>

      {/* ── Performance Metrics ────────────────── */}
      <Paper
        elevation={0}
        sx={{ p: 2, mb: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="body2" fontWeight={700}>Performance</Typography>
          <FormControl size="small" sx={{ minWidth: 110 }}>
            <Select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              sx={{ fontSize: '0.8rem', '& .MuiSelect-select': { py: 0.6 } }}
            >
              <MenuItem value="24h">Last 24 h</MenuItem>
              <MenuItem value="7d">Last 7 days</MenuItem>
              <MenuItem value="30d">Last 30 days</MenuItem>
            </Select>
          </FormControl>
        </Box>
        <Grid container spacing={1.5}>
          {[
            { value: metrics.totalTasks,      label: 'Tasks',       color: agentColor },
            { value: `${metrics.successRate}%`, label: 'Success',    color: '#4CAF50'  },
            { value: `${metrics.avgResponseTime}s`, label: 'Avg Time', color: agentColor },
            { value: `${metrics.escalationRate}%`, label: 'Escalated', color: '#FF9800'  },
          ].map((m) => (
            <Grid item xs={3} key={m.label}>
              <Box
                textAlign="center"
                sx={{
                  py: 1, borderRadius: 1.5,
                  backgroundColor: alpha(m.color, 0.06)
                }}
              >
                <Typography variant="h6" fontWeight={800} sx={{ color: m.color, lineHeight: 1.2 }}>
                  {m.value}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                  {m.label}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* ── Timeline ──────────────────────────── */}
      <Paper
        elevation={0}
        sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}
      >
        <Typography variant="body2" fontWeight={700} mb={2}>
          Activity Timeline
        </Typography>

        {/* Empty state */}
        {executions.length === 0 ? (
          <Box
            sx={{
              textAlign: 'center', py: 6,
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5
            }}
          >
            <Typography fontSize={48} sx={{ opacity: 0.7, lineHeight: 1 }}>
              {agentEmoji}
            </Typography>
            <Typography variant="body1" fontWeight={600} color="text.secondary">
              No activity yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 280 }}>
              Activity will appear as <strong>{agentName}</strong> processes tasks
            </Typography>
          </Box>
        ) : (
          /* Timeline list */
          <Box sx={{ position: 'relative', pl: 4 }}>
            {/* Vertical line */}
            <Box
              sx={{
                position: 'absolute',
                left: 11,
                top: 0,
                bottom: 0,
                width: 2,
                background: `linear-gradient(to bottom, ${alpha(agentColor, 0.5)}, ${alpha(agentColor, 0.08)})`,
                borderRadius: 1
              }}
            />

            {groups.map((group) => (
              <Box key={group.label} sx={{ mb: 2 }}>
                {/* Time-bucket label */}
                <Typography
                  variant="caption"
                  sx={{
                    display: 'inline-block',
                    fontWeight: 700,
                    color: 'text.secondary',
                    mb: 1,
                    fontSize: '0.7rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em'
                  }}
                >
                  {group.label}
                </Typography>

                {group.items.map((exec, idx) => {
                  const meta     = getStatusMeta(exec.status);
                  const ts       = exec.timestamp || exec.createdAt;
                  const duration = exec.duration ? (exec.duration / 1000).toFixed(1) : null;
                  const confidence = exec.confidence != null
                    ? Math.round(exec.confidence * (exec.confidence <= 1 ? 100 : 1))
                    : null;

                  return (
                    <Box
                      key={exec.id || `${group.label}-${idx}`}
                      sx={{
                        position: 'relative',
                        mb: 1.5,
                        animation: `${fadeSlideIn} 0.35s ease-out both`,
                        animationDelay: `${idx * 60}ms`
                      }}
                    >
                      {/* Dot on the timeline */}
                      <Box
                        sx={{
                          position: 'absolute',
                          left: -27,
                          top: 14,
                          width: 10,
                          height: 10,
                          borderRadius: '50%',
                          backgroundColor: meta.color,
                          boxShadow: `0 0 0 3px ${alpha(meta.color, 0.2)}`,
                          zIndex: 1
                        }}
                      />

                      {/* Card */}
                      <Paper
                        elevation={0}
                        sx={{
                          p: 1.5,
                          borderRadius: 1.5,
                          border: '1px solid',
                          borderColor: alpha(meta.color, 0.18),
                          borderLeft: `3px solid ${meta.color}`,
                          backgroundColor: alpha(meta.color, 0.03),
                          transition: 'background-color 0.2s, border-color 0.2s',
                          '&:hover': {
                            backgroundColor: alpha(meta.color, 0.07),
                            borderColor: alpha(meta.color, 0.35)
                          }
                        }}
                      >
                        {/* Row 1: icon + description + badges */}
                        <Box display="flex" alignItems="flex-start" gap={1}>
                          <Typography fontSize={16} sx={{ mt: '1px', flexShrink: 0 }}>
                            {meta.icon}
                          </Typography>
                          <Typography variant="body2" fontWeight={600} sx={{ flex: 1, lineHeight: 1.4 }}>
                            {exec.description || exec.action || 'Task executed'}
                          </Typography>

                          {/* Confidence badge */}
                          {confidence !== null && (
                            <Chip
                              label={`${confidence}%`}
                              size="small"
                              sx={{
                                height: 20, minWidth: 42,
                                fontSize: '0.68rem', fontWeight: 700,
                                backgroundColor: alpha(agentColor, 0.12),
                                color: agentColor,
                                '& .MuiChip-label': { px: 0.8 }
                              }}
                            />
                          )}
                        </Box>

                        {/* Row 2: meta chips */}
                        <Box display="flex" alignItems="center" gap={1} mt={0.8} flexWrap="wrap">
                          {/* Time */}
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                            {formatTimeAgo(ts)}
                          </Typography>

                          {/* Duration */}
                          {duration && (
                            <Chip
                              label={`${duration}s`}
                              size="small"
                              variant="outlined"
                              sx={{
                                height: 18, fontSize: '0.65rem',
                                borderColor: alpha(agentColor, 0.25),
                                color: 'text.secondary',
                                '& .MuiChip-label': { px: 0.6 }
                              }}
                            />
                          )}

                          {/* Risk */}
                          {exec.risk && exec.risk !== 'low' && (
                            <Chip
                              label={exec.risk}
                              size="small"
                              sx={{
                                height: 18, fontSize: '0.65rem', fontWeight: 700,
                                backgroundColor: alpha(
                                  exec.risk === 'high' ? '#F44336' : '#FF9800', 0.12
                                ),
                                color: exec.risk === 'high' ? '#F44336' : '#FF9800',
                                '& .MuiChip-label': { px: 0.6 }
                              }}
                            />
                          )}

                          {/* Tools */}
                          {exec.toolsUsed && exec.toolsUsed.length > 0 && (
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', ml: 'auto' }}>
                              🛠 {exec.toolsUsed.join(', ')}
                            </Typography>
                          )}
                        </Box>

                        {/* Row 3 (optional): result preview */}
                        {exec.result && (
                          <Typography
                            variant="caption"
                            sx={{
                              display: 'block', mt: 0.8,
                              p: 0.8, borderRadius: 1,
                              backgroundColor: 'rgba(0,0,0,0.15)',
                              fontFamily: 'monospace',
                              fontSize: '0.7rem',
                              color: 'text.secondary',
                              whiteSpace: 'pre-wrap',
                              wordBreak: 'break-word',
                              maxHeight: 60,
                              overflow: 'hidden'
                            }}
                          >
                            {typeof exec.result === 'string'
                              ? exec.result.slice(0, 120)
                              : JSON.stringify(exec.result).slice(0, 120)}
                          </Typography>
                        )}
                      </Paper>
                    </Box>
                  );
                })}
              </Box>
            ))}
          </Box>
        )}

        {/* View-all button */}
        {executions.length > 20 && (
          <Box textAlign="center" mt={2}>
            <Button
              variant="outlined"
              size="small"
              sx={{
                borderColor: alpha(agentColor, 0.4),
                color: agentColor,
                textTransform: 'none',
                fontWeight: 600,
                '&:hover': { borderColor: agentColor, backgroundColor: alpha(agentColor, 0.08) }
              }}
              onClick={() => window.open(`/admin/agents/${agent.id}/activity`, '_blank')}
            >
              View all activity →
            </Button>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default AgentActivityTab;
