/* eslint-disable */
/**
 * CollaborationViewer — Multi-Agent Collaboration Sessions Viewer
 *
 * Shows active and recent collaboration sessions between agents,
 * including participant lists, contribution timelines, and synthesis results.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Paper, Typography, Chip, IconButton, Collapse, Stack,
  Card, CardContent, Tooltip, Alert, LinearProgress, Divider,
  CircularProgress, useTheme, alpha
} from '@mui/material';
import {
  Groups as GroupsIcon,
  Refresh as RefreshIcon,
  ExpandMore as ExpandIcon,
  ExpandLess as CollapseIcon,
  FiberManualRecord as StatusDot,
  Schedule as ScheduleIcon,
  CheckCircle, Error as ErrorIcon, HourglassBottom
} from '@mui/icons-material';
import apiClient from '../../../services/api';

// ─── Constants ──────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  pending:      { color: '#9e9e9e', label: 'Pending',      icon: HourglassBottom },
  active:       { color: '#2196f3', label: 'Active',        icon: StatusDot },
  synthesizing: { color: '#ff9800', label: 'Synthesizing',  icon: HourglassBottom },
  completed:    { color: '#4caf50', label: 'Completed',     icon: CheckCircle },
  failed:       { color: '#f44336', label: 'Failed',        icon: ErrorIcon },
  timeout:      { color: '#9e9e9e', label: 'Timeout',       icon: ScheduleIcon },
};

const AGENT_NAMES = {
  '00-orchestrator': 'Apollo', '00-apollo': 'Apollo',
  '01-sentinel': 'Sentinel', '02-ledger': 'Ledger',
  '03-vision': 'Vision', '04-cortex': 'Cortex',
  '05-vault': 'Vault', '06-nexus': 'Nexus',
  '07-watchtower': 'Watchtower', '08-prism': 'Prism',
  '09-forge': 'Forge', '10-atlas': 'Atlas', '11-babel': 'Babel',
};

const formatTime = (ts) => {
  if (!ts) return '—';
  const d = new Date(ts);
  return d.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

// ─── Component ──────────────────────────────────────────────────────────

const CollaborationViewer = () => {
  const theme = useTheme();

  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [panelOpen, setPanelOpen] = useState(true);
  const [expanded, setExpanded] = useState({});

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get('/admin/agent-management/collaborations', { params: { limit: 20 } });
      setSessions(res.data?.sessions || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch collaboration sessions');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const toggleExpand = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const activeSessions = sessions.filter(s => ['active', 'synthesizing', 'pending'].includes(s.status));

  return (
    <Paper
      elevation={3}
      sx={{
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
          <GroupsIcon sx={{ color: theme.palette.primary.main }} />
          <Typography variant="h6" fontWeight={700}>Collaboration Sessions</Typography>
          {activeSessions.length > 0 && (
            <Chip
              label={`${activeSessions.length} active`}
              size="small"
              sx={{ bgcolor: alpha('#2196f3', 0.12), color: '#2196f3', fontWeight: 700, fontSize: 11 }}
            />
          )}
          <Chip label={sessions.length} size="small" variant="outlined" />
        </Stack>
        <Stack direction="row" alignItems="center" spacing={0.5}>
          <Tooltip title="Refresh">
            <IconButton size="small" onClick={(e) => { e.stopPropagation(); fetchSessions(); }} disabled={loading}>
              {loading ? <CircularProgress size={18} /> : <RefreshIcon fontSize="small" />}
            </IconButton>
          </Tooltip>
          <IconButton size="small">
            {panelOpen ? <CollapseIcon /> : <ExpandIcon />}
          </IconButton>
        </Stack>
      </Box>

      <Collapse in={panelOpen}>
        {error && <Alert severity="error" sx={{ m: 2 }} onClose={() => setError(null)}>{error}</Alert>}
        {loading && <LinearProgress />}

        <Box sx={{ p: 2, maxHeight: 500, overflowY: 'auto' }}>
          {!loading && sessions.length === 0 && (
            <Alert severity="info">No collaboration sessions found.</Alert>
          )}

          <Stack spacing={2}>
            {sessions.map((session) => {
              const cfg = STATUS_CONFIG[session.status] || STATUS_CONFIG.pending;
              const StatusIcon = cfg.icon;
              const isOpen = expanded[session._id];
              const taskDesc = typeof session.task === 'string'
                ? session.task
                : session.task?.description || session.task?.action || JSON.stringify(session.task);

              return (
                <Card
                  key={session._id}
                  variant="outlined"
                  sx={{
                    borderLeft: `4px solid ${cfg.color}`,
                    cursor: 'pointer',
                    '&:hover': { bgcolor: alpha(cfg.color, 0.03) },
                  }}
                  onClick={() => toggleExpand(session._id)}
                >
                  <CardContent sx={{ pb: 1, '&:last-child': { pb: 1.5 } }}>
                    {/* Top row */}
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <StatusIcon sx={{ fontSize: 18, color: cfg.color }} />
                        <Chip label={cfg.label} size="small" sx={{ bgcolor: alpha(cfg.color, 0.12), color: cfg.color, fontWeight: 700, fontSize: 11 }} />
                        <Typography variant="caption" color="text.secondary">
                          Initiated by {AGENT_NAMES[session.initiator] || session.initiator}
                        </Typography>
                      </Stack>
                      <Stack direction="row" alignItems="center" spacing={0.5}>
                        <Typography variant="caption" color="text.secondary">{formatTime(session.createdAt)}</Typography>
                        <IconButton size="small" sx={{ p: 0 }}>
                          {isOpen ? <CollapseIcon fontSize="small" /> : <ExpandIcon fontSize="small" />}
                        </IconButton>
                      </Stack>
                    </Stack>

                    {/* Task summary */}
                    <Typography variant="body2" sx={{ mt: 0.5 }} noWrap={!isOpen}>{taskDesc}</Typography>

                    {/* Participants */}
                    <Stack direction="row" spacing={0.5} sx={{ mt: 1 }} flexWrap="wrap">
                      {(session.participants || []).map((p, i) => (
                        <Chip
                          key={i}
                          label={AGENT_NAMES[p.agentId] || p.agentId}
                          size="small"
                          variant={p.status === 'completed' ? 'filled' : 'outlined'}
                          color={p.status === 'completed' ? 'success' : p.status === 'active' ? 'primary' : 'default'}
                          sx={{ fontSize: 11 }}
                        />
                      ))}
                    </Stack>

                    {/* Collapsible detail */}
                    <Collapse in={isOpen}>
                      <Divider sx={{ my: 1.5 }} />

                      {/* Contributions timeline */}
                      {session.contributions && session.contributions.length > 0 && (
                        <Box sx={{ mb: 1.5 }}>
                          <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.5 }}>Contributions</Typography>
                          <Stack spacing={1}>
                            {session.contributions.map((c, i) => (
                              <Box
                                key={i}
                                sx={{
                                  pl: 2, py: 0.5,
                                  borderLeft: `2px solid ${theme.palette.divider}`,
                                  fontSize: 13,
                                }}
                              >
                                <Stack direction="row" spacing={1} alignItems="center">
                                  <Chip label={AGENT_NAMES[c.agentId] || c.agentId} size="small" variant="outlined" sx={{ fontSize: 11 }} />
                                  {c.type && <Chip label={c.type} size="small" sx={{ fontSize: 10 }} />}
                                  <Typography variant="caption" color="text.secondary">{formatTime(c.createdAt)}</Typography>
                                </Stack>
                                {c.data && (
                                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, whiteSpace: 'pre-wrap', maxHeight: 80, overflow: 'hidden' }}>
                                    {typeof c.data === 'string' ? c.data : JSON.stringify(c.data, null, 2)}
                                  </Typography>
                                )}
                              </Box>
                            ))}
                          </Stack>
                        </Box>
                      )}

                      {/* Synthesis result */}
                      {session.synthesis && (
                        <Box sx={{ p: 1.5, bgcolor: alpha('#4caf50', 0.05), borderRadius: 1, border: `1px solid ${alpha('#4caf50', 0.2)}` }}>
                          <Typography variant="subtitle2" fontWeight={700} color="success.main" sx={{ mb: 0.5 }}>
                            Synthesis Result
                          </Typography>
                          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', fontSize: 13 }}>
                            {typeof session.synthesis === 'string' ? session.synthesis : JSON.stringify(session.synthesis, null, 2)}
                          </Typography>
                        </Box>
                      )}
                    </Collapse>
                  </CardContent>
                </Card>
              );
            })}
          </Stack>
        </Box>
      </Collapse>
    </Paper>
  );
};

export default CollaborationViewer;
