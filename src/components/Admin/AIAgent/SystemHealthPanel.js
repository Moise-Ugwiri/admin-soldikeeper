/* eslint-disable */
/**
 * SystemHealthPanel — Dead Letter Queue, Circuit Breakers & LLM Cost Dashboard
 *
 * Combines three operational health views into a single panel:
 *   1. Circuit Breakers – real-time state of every registered breaker
 *   2. LLM Cost Tracker – daily budget utilisation per agent
 *   3. Dead Letter Queue – pending failed tasks with retry / dismiss
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Paper, Typography, Chip, Button, IconButton, Tooltip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  LinearProgress, Alert, Collapse, Divider, Grid, Card, CardContent,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  useTheme, alpha, CircularProgress
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Replay as RetryIcon,
  Delete as DismissIcon,
  CheckCircle as ClosedIcon,
  Error as OpenIcon,
  Warning as HalfOpenIcon,
  AttachMoney as CostIcon,
  Storage as QueueIcon,
  Shield as BreakerIcon,
  ExpandMore as ExpandIcon,
  ExpandLess as CollapseIcon
} from '@mui/icons-material';
import apiClient from '../../../services/api';
import { getAgent } from '../../../data/agentRegistry';

// ─── Dark Theme Palette ────────────────────────────────────────────────
const DK = {
  bg:         '#0d1117',
  surface:    '#161b22',
  surfaceAlt: '#21262d',
  border:     '#30363d',
  text:       '#e6edf3',
  textMuted:  '#8b949e',
  accent:     '#10b981',
};

// ─── Personality-Driven Health Narratives ───────────────────────────────
const getHealthNarrative = (breakerList, budgetPct, pendingCount) => {
  const openBreakers = breakerList.filter(b => b.state === 'open').length;
  const halfOpen     = breakerList.filter(b => b.state === 'half-open').length;

  if (openBreakers > 0 && pendingCount > 3 && budgetPct >= 80) {
    return { emoji: '🔴', text: 'Multiple systems under stress — breakers tripped, queue backing up, budget running hot.', severity: 'error' };
  }
  if (openBreakers > 0) {
    return { emoji: '🟠', text: `${openBreakers} circuit breaker${openBreakers > 1 ? 's' : ''} tripped open. Services may be degraded — investigating.`, severity: 'warning' };
  }
  if (pendingCount > 5) {
    return { emoji: '🟡', text: `Dead letter queue growing (${pendingCount} pending). Some tasks need attention.`, severity: 'warning' };
  }
  if (budgetPct >= 90) {
    return { emoji: '💰', text: 'LLM budget nearly exhausted. Agents may throttle autonomous actions.', severity: 'warning' };
  }
  if (halfOpen > 0) {
    return { emoji: '🔄', text: `${halfOpen} breaker${halfOpen > 1 ? 's' : ''} in half-open recovery. Systems self-healing.`, severity: 'info' };
  }
  if (budgetPct >= 50) {
    return { emoji: '📊', text: 'All systems nominal. Budget usage moderate — agents operating efficiently.', severity: 'success' };
  }
  return { emoji: '✅', text: 'All agents operating nominally. Breakers closed, queue clear, budget healthy.', severity: 'success' };
};

const getAgentColor = (agentId) => {
  const agent = getAgent(agentId);
  return agent?.color || DK.accent;
};

// ─── helpers ───────────────────────────────────────────────────────────
const REFRESH_INTERVAL = 15_000; // 15 s

const stateColor = (state) => {
  switch (state) {
    case 'closed':  return 'success';
    case 'open':    return 'error';
    case 'half-open': return 'warning';
    default: return 'default';
  }
};

const stateIcon = (state) => {
  switch (state) {
    case 'closed':    return <ClosedIcon fontSize="small" color="success" />;
    case 'open':      return <OpenIcon fontSize="small" color="error" />;
    case 'half-open': return <HalfOpenIcon fontSize="small" color="warning" />;
    default:          return null;
  }
};

const timeAgo = (dateStr) => {
  if (!dateStr) return '—';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

// ─── Component ─────────────────────────────────────────────────────────
const SystemHealthPanel = () => {
  const theme = useTheme();

  // Circuit breakers
  const [breakers, setBreakers] = useState({});
  const [breakersLoading, setBreakersLoading] = useState(true);
  const [breakersError, setBreakersError] = useState(null);

  // LLM costs
  const [costs, setCosts] = useState({ totalCost: 0, maxBudget: 10, agents: [] });
  const [costsLoading, setCostsLoading] = useState(true);
  const [costsError, setCostsError] = useState(null);

  // Dead letters
  const [dlq, setDlq] = useState({ items: [], stats: {} });
  const [dlqLoading, setDlqLoading] = useState(true);
  const [dlqError, setDlqError] = useState(null);
  const [expandedDL, setExpandedDL] = useState(null);
  const [retryingId, setRetryingId] = useState(null);

  // Dismiss dialog
  const [dismissDialog, setDismissDialog] = useState({ open: false, id: null });
  const [dismissNotes, setDismissNotes] = useState('');

  // ── data fetching ──────────────────────────────────────────────────
  const fetchBreakers = useCallback(async () => {
    try {
      const res = await apiClient.get('/admin/agent-management/circuit-breakers');
      setBreakers(res.data);
      setBreakersError(null);
    } catch (err) {
      setBreakersError(err.response?.data?.message || 'Failed to fetch circuit breakers');
    } finally {
      setBreakersLoading(false);
    }
  }, []);

  const fetchCosts = useCallback(async () => {
    try {
      const res = await apiClient.get('/admin/agent-management/llm-costs');
      setCosts(res.data);
      setCostsError(null);
    } catch (err) {
      setCostsError(err.response?.data?.message || 'Failed to fetch LLM costs');
    } finally {
      setCostsLoading(false);
    }
  }, []);

  const fetchDlq = useCallback(async () => {
    try {
      const res = await apiClient.get('/admin/agent-management/dead-letters');
      setDlq(res.data);
      setDlqError(null);
    } catch (err) {
      setDlqError(err.response?.data?.message || 'Failed to fetch dead letters');
    } finally {
      setDlqLoading(false);
    }
  }, []);

  const fetchAll = useCallback(() => {
    fetchBreakers();
    fetchCosts();
    fetchDlq();
  }, [fetchBreakers, fetchCosts, fetchDlq]);

  useEffect(() => {
    fetchAll();
    const timer = setInterval(fetchAll, REFRESH_INTERVAL);
    return () => clearInterval(timer);
  }, [fetchAll]);

  // ── actions ────────────────────────────────────────────────────────
  const handleRetry = async (id) => {
    setRetryingId(id);
    try {
      await apiClient.post(`/admin/agent-management/dead-letters/${id}/retry`);
      fetchDlq();
    } catch (err) {
      console.error('Retry failed:', err);
    } finally {
      setRetryingId(null);
    }
  };

  const handleDismiss = async () => {
    const { id } = dismissDialog;
    try {
      await apiClient.post(`/admin/agent-management/dead-letters/${id}/dismiss`, { notes: dismissNotes });
      setDismissDialog({ open: false, id: null });
      setDismissNotes('');
      fetchDlq();
    } catch (err) {
      console.error('Dismiss failed:', err);
    }
  };

  // ── derived ────────────────────────────────────────────────────────
  const breakerList = Object.values(breakers);
  const budgetPct = costs.maxBudget > 0 ? Math.min((costs.totalCost / costs.maxBudget) * 100, 100) : 0;
  const budgetWarning = budgetPct >= 80;
  const pendingCount = dlq.items?.length || 0;

  // Aggregate per-agent costs from usage records
  const agentCostMap = {};
  (costs.agents || []).forEach((record) => {
    const id = record.agentId || 'unknown';
    if (!agentCostMap[id]) agentCostMap[id] = { cost: 0, calls: 0 };
    agentCostMap[id].cost += record.estimatedCostUSD || 0;
    agentCostMap[id].calls += record.callCount || 0;
  });
  const agentCostList = Object.entries(agentCostMap)
    .map(([agentId, data]) => ({ agentId, ...data }))
    .sort((a, b) => b.cost - a.cost);

  // ── section style helper ───────────────────────────────────────────
  const sectionPaper = (accentColor) => ({
    p: { xs: 2, md: 3 },
    borderRadius: 3,
    background: `linear-gradient(135deg, ${DK.surface} 0%, ${DK.bg} 100%)`,
    border: `1px solid ${DK.border}`,
    '& .MuiTableCell-root': { borderColor: DK.border, color: DK.text },
    '& .MuiTableCell-head': { color: DK.textMuted, fontWeight: 700 },
    '& .MuiTypography-root': { color: DK.text },
    '& .MuiAlert-root': { bgcolor: alpha(accentColor, 0.06), borderColor: alpha(accentColor, 0.2) },
  });

  // ─── RENDER ────────────────────────────────────────────────────────
  const narrative = getHealthNarrative(breakerList, budgetPct, pendingCount);

  return (
    <Box>
      {/* ── Health Narrative Banner ─────────────────────────────────── */}
      <Box
        sx={{
          mb: 3,
          p: 2.5,
          borderRadius: 3,
          background: `linear-gradient(135deg, ${DK.bg} 0%, ${DK.surface} 100%)`,
          border: `1px solid ${DK.border}`,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
          <Typography variant="h5" sx={{ fontWeight: 800, color: DK.text, display: 'flex', alignItems: 'center', gap: 1.5 }}>
            🏥 System Health
          </Typography>
          <Button
            variant="outlined"
            size="small"
            startIcon={<RefreshIcon />}
            onClick={fetchAll}
            sx={{
              borderColor: DK.border,
              color: DK.textMuted,
              '&:hover': { borderColor: DK.accent, color: DK.accent },
            }}
          >
            Refresh All
          </Button>
        </Box>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            px: 2,
            py: 1.5,
            borderRadius: 2,
            bgcolor: narrative.severity === 'error'   ? 'rgba(248,81,73,0.08)'
                   : narrative.severity === 'warning' ? 'rgba(210,153,34,0.08)'
                   : narrative.severity === 'info'    ? 'rgba(56,139,253,0.08)'
                   : 'rgba(16,185,129,0.08)',
            border: `1px solid ${
              narrative.severity === 'error'   ? 'rgba(248,81,73,0.25)'
            : narrative.severity === 'warning' ? 'rgba(210,153,34,0.25)'
            : narrative.severity === 'info'    ? 'rgba(56,139,253,0.25)'
            : 'rgba(16,185,129,0.25)'
            }`,
          }}
        >
          <Typography sx={{ fontSize: '1.4rem', lineHeight: 1 }}>{narrative.emoji}</Typography>
          <Typography variant="body1" sx={{ color: DK.text, fontWeight: 500 }}>
            {narrative.text}
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* ═══ 1. CIRCUIT BREAKERS ═══════════════════════════════════════ */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={sectionPaper(theme.palette.info.main)}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <BreakerIcon sx={{ color: '#388bfd' }} />
              <Typography variant="h6" sx={{ fontWeight: 700, color: DK.text }}>
                Circuit Breakers
              </Typography>
              <Chip
                label={breakerList.length ? `${breakerList.length} registered` : 'none'}
                size="small"
                variant="outlined"
                sx={{ borderColor: DK.border, color: DK.textMuted }}
              />
            </Box>

            {breakersLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress size={28} sx={{ color: DK.accent }} />
              </Box>
            ) : breakersError ? (
              <Alert severity="info" variant="outlined" sx={{ borderRadius: 2, bgcolor: alpha('#388bfd', 0.06) }}>
                {breakersError}
              </Alert>
            ) : breakerList.length === 0 ? (
              <Alert severity="info" variant="outlined" icon={false} sx={{ borderRadius: 2, bgcolor: alpha('#388bfd', 0.06) }}>
                <Typography variant="body2" sx={{ color: DK.textMuted }}>
                  🔌 No circuit breakers registered yet. They are created on first use.
                </Typography>
              </Alert>
            ) : (
              <>
                {/* Breaker narrative */}
                {breakerList.every(b => b.state === 'closed') && (
                  <Typography variant="body2" sx={{ mb: 2, fontStyle: 'italic', color: DK.textMuted }}>
                    🟢 All {breakerList.length} breakers holding steady — services flowing smoothly.
                  </Typography>
                )}
                <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Service</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>State</TableCell>
                      <TableCell sx={{ fontWeight: 700 }} align="right">Fires</TableCell>
                      <TableCell sx={{ fontWeight: 700 }} align="right">Failures</TableCell>
                      <TableCell sx={{ fontWeight: 700 }} align="right">Timeouts</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {breakerList.map((b) => (
                      <TableRow key={b.name} hover>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                            {b.name}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={stateIcon(b.state)}
                            label={b.state.toUpperCase()}
                            size="small"
                            color={stateColor(b.state)}
                            variant="outlined"
                            sx={{ fontWeight: 700, minWidth: 100 }}
                          />
                        </TableCell>
                        <TableCell align="right">{b.stats?.fires || 0}</TableCell>
                        <TableCell align="right">
                          <Typography
                            variant="body2"
                            color={b.stats?.failures > 0 ? 'error' : 'text.secondary'}
                            sx={{ fontWeight: b.stats?.failures > 0 ? 700 : 400 }}
                          >
                            {b.stats?.failures || 0}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">{b.stats?.timeouts || 0}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              </>
            )}
          </Paper>
        </Grid>

        {/* ═══ 2. LLM COST TRACKER ══════════════════════════════════════ */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={sectionPaper(theme.palette.warning.main)}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <CostIcon sx={{ color: '#d29922' }} />
              <Typography variant="h6" sx={{ fontWeight: 700, color: DK.text }}>
                💸 LLM Costs (Today)
              </Typography>
            </Box>

            {costsLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress size={28} />
              </Box>
            ) : costsError ? (
              <Alert severity="info" variant="outlined" sx={{ borderRadius: 2 }}>
                {costsError}
              </Alert>
            ) : (
              <>
                {/* Budget bar */}
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2" sx={{ color: DK.textMuted }}>
                      Daily Budget
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: DK.text }}>
                      ${costs.totalCost.toFixed(2)} / ${costs.maxBudget.toFixed(2)}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={budgetPct}
                    sx={{
                      height: 10,
                      borderRadius: 5,
                      backgroundColor: alpha(DK.border, 0.5),
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 5,
                        background: budgetWarning
                          ? 'linear-gradient(90deg, #f85149 0%, #da3633 100%)'
                          : `linear-gradient(90deg, ${DK.accent} 0%, #3fb950 100%)`,
                      },
                    }}
                  />
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 0.5 }}>
                    <Typography variant="caption" sx={{ color: budgetWarning ? '#f85149' : DK.textMuted }}>
                      {budgetPct.toFixed(0)}% used
                    </Typography>
                  </Box>
                </Box>

                {budgetWarning && (
                  <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>
                    Budget usage is above 80%. Consider reviewing agent activity.
                  </Alert>
                )}

                {/* Per-agent breakdown */}
                {agentCostList.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                    No LLM calls recorded today
                  </Typography>
                ) : (
                  <Box>
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>
                      Per-Agent Breakdown
                    </Typography>
                    {agentCostList.map(({ agentId, cost, calls }) => {
                      const pct = costs.maxBudget > 0 ? (cost / costs.maxBudget) * 100 : 0;
                      const agentColor = getAgentColor(agentId);
                      const agentData  = getAgent(agentId);
                      return (
                        <Box key={agentId} sx={{ mb: 1.5 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.25 }}>
                            <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600, color: agentColor }}>
                              {agentData?.emoji || '🤖'} {agentData?.name || agentId}
                            </Typography>
                            <Typography variant="body2" sx={{ color: DK.textMuted }}>
                              ${cost.toFixed(4)} · {calls} call{calls !== 1 ? 's' : ''}
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={Math.min(pct, 100)}
                            sx={{
                              height: 6,
                              borderRadius: 3,
                              backgroundColor: alpha(agentColor, 0.12),
                              '& .MuiLinearProgress-bar': {
                                backgroundColor: agentColor,
                                borderRadius: 3,
                              },
                            }}
                          />
                        </Box>
                      );
                    })}
                  </Box>
                )}
              </>
            )}
          </Paper>
        </Grid>

        {/* ═══ 3. DEAD LETTER QUEUE ═════════════════════════════════════ */}
        <Grid item xs={12}>
          <Paper elevation={2} sx={sectionPaper(theme.palette.error.main)}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <QueueIcon sx={{ color: '#f85149' }} />
              <Typography variant="h6" sx={{ fontWeight: 700, color: DK.text }}>
                📬 Dead Letter Queue
              </Typography>
              <Chip
                label={`${pendingCount} pending`}
                size="small"
                sx={{
                  borderColor: pendingCount > 0 ? '#f85149' : DK.border,
                  color: pendingCount > 0 ? '#f85149' : DK.textMuted,
                }}
                variant="outlined"
              />
              {dlq.stats?.byStatus && (
                <>
                  {dlq.stats.byStatus.resolved > 0 && (
                    <Chip label={`${dlq.stats.byStatus.resolved} resolved`} size="small" color="success" variant="outlined" />
                  )}
                  {dlq.stats.byStatus.dismissed > 0 && (
                    <Chip label={`${dlq.stats.byStatus.dismissed} dismissed`} size="small" variant="outlined" />
                  )}
                </>
              )}
            </Box>

            {dlqLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress size={28} />
              </Box>
            ) : dlqError ? (
              <Alert severity="info" variant="outlined" sx={{ borderRadius: 2 }}>
                {dlqError}
              </Alert>
            ) : pendingCount === 0 ? (
              <Alert severity="success" variant="outlined" icon={false} sx={{ borderRadius: 2, bgcolor: 'rgba(16,185,129,0.06)' }}>
                <Typography variant="body2" sx={{ color: DK.text }}>
                  ✅ No pending dead letters — the queue is crystal clear. All tasks resolved.
                </Typography>
              </Alert>
            ) : (
              <Box>
                    {dlq.items.map((item) => {
                      const isExpanded = expandedDL === item._id;
                      const isRetrying = retryingId === item._id;
                      const dlqAgentColor = getAgent(item.agentId)?.color || theme.palette.error.main;
                      return (
                        <Card
                          key={item._id}
                          variant="outlined"
                          sx={{
                            mb: 1.5,
                            borderColor: alpha(dlqAgentColor, 0.35),
                            borderLeft: `3px solid ${dlqAgentColor}`,
                            borderRadius: 2,
                            bgcolor: DK.surfaceAlt,
                          }}
                        >
                      <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                        {/* Summary row */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                          {(() => {
                            const dlqAgent = getAgent(item.agentId);
                            return (
                              <Chip
                                label={`${dlqAgent?.emoji || '🤖'} ${dlqAgent?.name || item.agentId}`}
                                size="small"
                                variant="outlined"
                                sx={{
                                  fontFamily: 'monospace',
                                  fontWeight: 700,
                                  borderColor: dlqAgent?.color || theme.palette.primary.main,
                                  color: dlqAgent?.color || theme.palette.primary.main,
                                }}
                              />
                            );
                          })()}
                          <Typography variant="body2" sx={{ fontWeight: 600, flex: 1 }}>
                            {item.task?.action || 'unknown action'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {item.attempts || 0} attempt{(item.attempts || 0) !== 1 ? 's' : ''} · {timeAgo(item.lastAttemptAt || item.createdAt)}
                          </Typography>
                          <IconButton size="small" onClick={() => setExpandedDL(isExpanded ? null : item._id)}>
                            {isExpanded ? <CollapseIcon fontSize="small" /> : <ExpandIcon fontSize="small" />}
                          </IconButton>
                        </Box>

                        {/* Error summary */}
                        <Typography variant="body2" color="error" sx={{ mt: 0.5, fontSize: '0.82rem' }}>
                          {item.error?.message || 'Unknown error'}
                        </Typography>

                        {/* Expanded details */}
                        <Collapse in={isExpanded}>
                          <Box
                            sx={{
                              mt: 1,
                              p: 1.5,
                              borderRadius: 1,
                              backgroundColor: DK.bg,
                              border: `1px solid ${DK.border}`,
                              fontFamily: 'monospace',
                              fontSize: '0.75rem',
                              color: DK.textMuted,
                              whiteSpace: 'pre-wrap',
                              wordBreak: 'break-all',
                              maxHeight: 200,
                              overflow: 'auto',
                            }}
                          >
                            <strong>ID:</strong> {item._id}{'\n'}
                            <strong>Agent:</strong> {item.agentId}{'\n'}
                            <strong>Action:</strong> {item.task?.action}{'\n'}
                            <strong>Params:</strong> {JSON.stringify(item.task?.params, null, 2) || '—'}{'\n'}
                            <strong>Error Code:</strong> {item.error?.code || '—'}{'\n'}
                            <strong>Stack:</strong>{'\n'}{item.error?.stack || '—'}{'\n'}
                            <strong>Created:</strong> {new Date(item.createdAt).toLocaleString()}{'\n'}
                            <strong>Attempts:</strong> {item.attempts} / {item.maxAttempts}
                          </Box>
                        </Collapse>

                        {/* Action buttons */}
                        <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                          <Button
                            size="small"
                            variant="outlined"
                            color="primary"
                            startIcon={isRetrying ? <CircularProgress size={14} /> : <RetryIcon />}
                            disabled={isRetrying}
                            onClick={() => handleRetry(item._id)}
                          >
                            Retry
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            startIcon={<DismissIcon />}
                            onClick={() => setDismissDialog({ open: true, id: item._id })}
                          >
                            Dismiss
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  );
                })}
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* ─── Dismiss confirmation dialog ──────────────────────────────── */}
      <Dialog
        open={dismissDialog.open}
        onClose={() => setDismissDialog({ open: false, id: null })}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: DK.surface,
            border: `1px solid ${DK.border}`,
            backgroundImage: 'none',
          },
        }}
      >
        <DialogTitle sx={{ color: DK.text }}>⚠️ Dismiss Dead Letter</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Are you sure you want to dismiss this dead letter? This action cannot be undone.
          </Typography>
          <TextField
            label="Notes (optional)"
            fullWidth
            multiline
            rows={2}
            value={dismissNotes}
            onChange={(e) => setDismissNotes(e.target.value)}
            placeholder="Reason for dismissal…"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDismissDialog({ open: false, id: null })}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDismiss}>
            Dismiss
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SystemHealthPanel;
