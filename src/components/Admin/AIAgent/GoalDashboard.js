/* eslint-disable */
/**
 * GoalDashboard — Agent Goal Management Panel
 *
 * Displays agent goals with progress tracking and CRUD operations.
 * Uses the same apiClient pattern as SystemHealthPanel / ReasoningTracePanel.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Paper, Typography, Chip, LinearProgress, Grid,
  Card, CardContent, CardActions, IconButton, Button,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Select, MenuItem, FormControl, InputLabel,
  Alert, Tooltip, Stack, Divider, CircularProgress,
  useTheme, alpha, Collapse
} from '@mui/material';
import {
  TrendingUp, TrendingDown, TrendingFlat,
  Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon,
  Flag as FlagIcon, CheckCircle, Warning, Error as ErrorIcon,
  ExpandMore as ExpandIcon, ExpandLess as CollapseIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import apiClient from '../../../services/api';

// ─── Constants ──────────────────────────────────────────────────────────

const AGENT_OPTIONS = [
  { id: '00-apollo', label: 'Apollo (Orchestrator)' },
  { id: '01-sentinel', label: 'Sentinel (Security)' },
  { id: '02-ledger', label: 'Ledger (Finance)' },
  { id: '03-vision', label: 'Vision (OCR)' },
  { id: '04-cortex', label: 'Cortex (AI)' },
  { id: '05-vault', label: 'Vault (Payments)' },
  { id: '06-nexus', label: 'Nexus (SplitBill)' },
  { id: '07-watchtower', label: 'Watchtower (Admin)' },
  { id: '08-prism', label: 'Prism (UI/UX)' },
  { id: '09-forge', label: 'Forge (Mobile)' },
  { id: '10-atlas', label: 'Atlas (Infra)' },
  { id: '11-babel', label: 'Babel (i18n)' },
];

const PRIORITY_COLORS = {
  critical: 'error',
  high: 'warning',
  medium: 'info',
  low: 'default',
};

const STATUS_COLORS = {
  active: 'primary',
  achieved: 'success',
  failed: 'error',
  paused: 'default',
};

const DIRECTION_ICONS = {
  increase: TrendingUp,
  decrease: TrendingDown,
  maintain: TrendingFlat,
};

const EMPTY_FORM = {
  agentId: '',
  title: '',
  description: '',
  metric: '',
  targetValue: '',
  currentValue: 0,
  unit: '%',
  direction: 'increase',
  priority: 'medium',
  deadline: '',
};

// ─── Component ──────────────────────────────────────────────────────────

const GoalDashboard = () => {
  const theme = useTheme();

  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedAgent, setSelectedAgent] = useState('all');
  const [panelOpen, setPanelOpen] = useState(true);

  // Dialog state
  const [formOpen, setFormOpen] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  // Delete confirmation
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null, title: '' });

  // ── Fetch goals ─────────────────────────────────────────────────────
  const fetchGoals = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const agentId = selectedAgent === 'all' ? 'all' : selectedAgent;
      const res = await apiClient.get(`/admin/agent-management/goals/${agentId}`);
      setGoals(res.data?.goals || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch goals');
      setGoals([]);
    } finally {
      setLoading(false);
    }
  }, [selectedAgent]);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  // ── CRUD handlers ───────────────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        ...formData,
        targetValue: Number(formData.targetValue),
        currentValue: Number(formData.currentValue || 0),
      };
      if (editingId) {
        await apiClient.put(`/admin/agent-management/goals/${editingId}`, payload);
      } else {
        await apiClient.post('/admin/agent-management/goals', payload);
      }
      setFormOpen(false);
      setFormData(EMPTY_FORM);
      setEditingId(null);
      fetchGoals();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save goal');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (goal) => {
    setFormData({
      agentId: goal.agentId || '',
      title: goal.title || '',
      description: goal.description || '',
      metric: goal.metric || '',
      targetValue: goal.targetValue ?? '',
      currentValue: goal.currentValue ?? 0,
      unit: goal.unit || '%',
      direction: goal.direction || 'increase',
      priority: goal.priority || 'medium',
      deadline: goal.deadline ? goal.deadline.slice(0, 10) : '',
    });
    setEditingId(goal._id);
    setFormOpen(true);
  };

  const handleDelete = async () => {
    try {
      await apiClient.delete(`/admin/agent-management/goals/${deleteDialog.id}`);
      setDeleteDialog({ open: false, id: null, title: '' });
      fetchGoals();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete goal');
    }
  };

  const openCreate = () => {
    setFormData({ ...EMPTY_FORM, agentId: selectedAgent === 'all' ? '' : selectedAgent });
    setEditingId(null);
    setFormOpen(true);
  };

  // ── Computed stats ──────────────────────────────────────────────────
  const stats = {
    total: goals.length,
    achieved: goals.filter(g => g.status === 'achieved').length,
    offTrack: goals.filter(g => {
      if (!g.targetValue || g.status !== 'active') return false;
      const pct = (g.currentValue / g.targetValue) * 100;
      return pct < 50;
    }).length,
    avgProgress: goals.length
      ? Math.round(goals.reduce((sum, g) => {
          const pct = g.targetValue ? (g.currentValue / g.targetValue) * 100 : 0;
          return sum + Math.min(pct, 100);
        }, 0) / goals.length)
      : 0,
  };

  // ── Render helpers ──────────────────────────────────────────────────
  const getProgress = (goal) => {
    if (!goal.targetValue) return 0;
    return Math.min(Math.round((goal.currentValue / goal.targetValue) * 100), 100);
  };

  const getProgressColor = (pct) => {
    if (pct >= 80) return 'success';
    if (pct >= 50) return 'primary';
    if (pct >= 25) return 'warning';
    return 'error';
  };

  const DirectionIcon = ({ direction }) => {
    const Icon = DIRECTION_ICONS[direction] || TrendingFlat;
    const label = direction === 'increase' ? '↑' : direction === 'decrease' ? '↓' : '↔';
    return (
      <Tooltip title={`Direction: ${direction || 'maintain'}`}>
        <Icon fontSize="small" color="action" />
      </Tooltip>
    );
  };

  // ── Render ──────────────────────────────────────────────────────────
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
          <FlagIcon sx={{ color: theme.palette.primary.main }} />
          <Typography variant="h6" fontWeight={700}>Goal Dashboard</Typography>
          <Chip label={goals.length} size="small" variant="outlined" />
        </Stack>
        <Stack direction="row" alignItems="center" spacing={0.5}>
          <Tooltip title="Refresh">
            <IconButton size="small" onClick={(e) => { e.stopPropagation(); fetchGoals(); }} disabled={loading}>
              {loading ? <CircularProgress size={18} /> : <RefreshIcon fontSize="small" />}
            </IconButton>
          </Tooltip>
          <IconButton size="small">
            {panelOpen ? <CollapseIcon /> : <ExpandIcon />}
          </IconButton>
        </Stack>
      </Box>

      <Collapse in={panelOpen}>
        {/* Toolbar: Agent selector + Create button */}
        <Box sx={{ px: 2, py: 1.5, display: 'flex', alignItems: 'center', gap: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Agent</InputLabel>
            <Select value={selectedAgent} label="Agent" onChange={(e) => setSelectedAgent(e.target.value)}>
              <MenuItem value="all">All Agents</MenuItem>
              {AGENT_OPTIONS.map((a) => (
                <MenuItem key={a.id} value={a.id}>{a.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={openCreate}>
            New Goal
          </Button>
        </Box>

        {/* Summary stats */}
        <Box sx={{ px: 2, py: 1.5, borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Stack direction="row" spacing={3} flexWrap="wrap">
            <Stack alignItems="center">
              <Typography variant="h5" fontWeight={700}>{stats.total}</Typography>
              <Typography variant="caption" color="text.secondary">Total</Typography>
            </Stack>
            <Stack alignItems="center">
              <Typography variant="h5" fontWeight={700} color="success.main">{stats.achieved}</Typography>
              <Typography variant="caption" color="text.secondary">Achieved</Typography>
            </Stack>
            <Stack alignItems="center">
              <Typography variant="h5" fontWeight={700} color="error.main">{stats.offTrack}</Typography>
              <Typography variant="caption" color="text.secondary">Off Track</Typography>
            </Stack>
            <Stack alignItems="center">
              <Typography variant="h5" fontWeight={700} color="primary.main">{stats.avgProgress}%</Typography>
              <Typography variant="caption" color="text.secondary">Avg Progress</Typography>
            </Stack>
          </Stack>
        </Box>

        {error && <Alert severity="error" sx={{ m: 2 }} onClose={() => setError(null)}>{error}</Alert>}

        {loading && <LinearProgress />}

        {/* Goal cards */}
        <Box sx={{ p: 2, maxHeight: 520, overflowY: 'auto' }}>
          {!loading && goals.length === 0 && (
            <Alert severity="info">No goals found. Create one to get started.</Alert>
          )}

          <Grid container spacing={2}>
            {goals.map((goal) => {
              const pct = getProgress(goal);
              const agentLabel = AGENT_OPTIONS.find(a => a.id === goal.agentId)?.label || goal.agentId;

              return (
                <Grid item xs={12} sm={6} md={4} key={goal._id}>
                  <Card
                    variant="outlined"
                    sx={{
                      height: '100%',
                      borderLeft: `4px solid ${theme.palette[PRIORITY_COLORS[goal.priority] || 'primary'].main}`,
                      transition: 'box-shadow 0.2s',
                      '&:hover': { boxShadow: 4 },
                    }}
                  >
                    <CardContent sx={{ pb: 1 }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
                        <Typography variant="subtitle1" fontWeight={700} noWrap sx={{ flex: 1 }}>
                          {goal.title}
                        </Typography>
                        <DirectionIcon direction={goal.direction} />
                      </Stack>

                      {goal.description && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {goal.description}
                        </Typography>
                      )}

                      <Stack direction="row" spacing={0.5} flexWrap="wrap" sx={{ mb: 1 }}>
                        <Chip label={goal.priority} size="small" color={PRIORITY_COLORS[goal.priority] || 'default'} />
                        <Chip label={goal.status || 'active'} size="small" color={STATUS_COLORS[goal.status] || 'primary'} variant="outlined" />
                        <Chip label={agentLabel} size="small" variant="outlined" sx={{ fontSize: 11 }} />
                      </Stack>

                      {/* Progress */}
                      <Box sx={{ mt: 1 }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Typography variant="caption" fontWeight={600}>
                            {goal.currentValue ?? 0}{goal.unit || ''} / {goal.targetValue ?? '?'}{goal.unit || ''} target
                          </Typography>
                          <Typography variant="caption" color="text.secondary">{pct}%</Typography>
                        </Stack>
                        <LinearProgress
                          variant="determinate"
                          value={pct}
                          color={getProgressColor(pct)}
                          sx={{ height: 8, borderRadius: 4, mt: 0.5 }}
                        />
                      </Box>

                      {/* Checkpoint */}
                      {goal.lastCheckpoint && (
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                          Last checkpoint: {new Date(goal.lastCheckpoint).toLocaleDateString()}
                        </Typography>
                      )}
                      {goal.deadline && (
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                          Deadline: {new Date(goal.deadline).toLocaleDateString()}
                        </Typography>
                      )}
                    </CardContent>

                    <Divider />

                    <CardActions sx={{ justifyContent: 'flex-end', px: 1, py: 0.5 }}>
                      <Tooltip title="Edit">
                        <IconButton size="small" onClick={() => handleEdit(goal)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton size="small" color="error" onClick={() => setDeleteDialog({ open: true, id: goal._id, title: goal.title })}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </CardActions>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      </Collapse>

      {/* ── Create / Edit Dialog ─────────────────────────────────────── */}
      <Dialog open={formOpen} onClose={() => setFormOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? 'Edit Goal' : 'Create Goal'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Agent</InputLabel>
              <Select
                value={formData.agentId}
                label="Agent"
                onChange={(e) => setFormData(prev => ({ ...prev, agentId: e.target.value }))}
              >
                {AGENT_OPTIONS.map((a) => (
                  <MenuItem key={a.id} value={a.id}>{a.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField label="Title" fullWidth size="small" value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))} />
            <TextField label="Description" fullWidth size="small" multiline rows={2} value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))} />
            <TextField label="Metric" fullWidth size="small" placeholder="e.g. response_time, accuracy" value={formData.metric}
              onChange={(e) => setFormData(prev => ({ ...prev, metric: e.target.value }))} />
            <Stack direction="row" spacing={2}>
              <TextField label="Target Value" type="number" size="small" value={formData.targetValue}
                onChange={(e) => setFormData(prev => ({ ...prev, targetValue: e.target.value }))} sx={{ flex: 1 }} />
              <TextField label="Unit" size="small" value={formData.unit} placeholder="%, ms, count"
                onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))} sx={{ width: 100 }} />
            </Stack>
            <Stack direction="row" spacing={2}>
              <FormControl size="small" sx={{ flex: 1 }}>
                <InputLabel>Direction</InputLabel>
                <Select value={formData.direction} label="Direction"
                  onChange={(e) => setFormData(prev => ({ ...prev, direction: e.target.value }))}>
                  <MenuItem value="increase">↑ Increase</MenuItem>
                  <MenuItem value="decrease">↓ Decrease</MenuItem>
                  <MenuItem value="maintain">↔ Maintain</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ flex: 1 }}>
                <InputLabel>Priority</InputLabel>
                <Select value={formData.priority} label="Priority"
                  onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}>
                  <MenuItem value="critical">Critical</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="low">Low</MenuItem>
                </Select>
              </FormControl>
            </Stack>
            <TextField label="Deadline" type="date" fullWidth size="small" InputLabelProps={{ shrink: true }}
              value={formData.deadline} onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setFormOpen(false); setEditingId(null); }}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving || !formData.agentId || !formData.title}>
            {saving ? <CircularProgress size={20} /> : editingId ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Delete Confirmation Dialog ───────────────────────────────── */}
      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, id: null, title: '' })} maxWidth="xs">
        <DialogTitle>Delete Goal</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete &quot;{deleteDialog.title}&quot;?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, id: null, title: '' })}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDelete}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default GoalDashboard;
