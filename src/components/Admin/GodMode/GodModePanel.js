/**
 * 🛡️ GOD MODE PANEL
 * Full control plane for the AI corporation — surfacing every backend capability
 * that was previously only reachable via Telegram or raw API calls.
 *
 * Sections (tabs):
 *   1. OKRs          — company goals CRUD + key-result check-ins
 *   2. Scorecards     — per-agent performance + fleet snapshot
 *   3. Votes          — open council votes, cast / human-override
 *   4. Proposals      — pending agent proposals, approve / reject
 *   5. Rules          — constitutional rule CRUD + test verdict
 *   6. Agents         — lifecycle: enable / disable / fire
 *   7. Triggers       — manual: board-meeting, self-improve, settings
 *
 * Data live signals pulled from GET /admin/godmode/status every 30 s.
 */

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  Box, Grid, Paper, Typography, Chip, Divider, Alert, CircularProgress,
  Tab, Tabs, Button, IconButton, TextField, Dialog, DialogTitle,
  DialogContent, DialogActions, Select, MenuItem, FormControl, InputLabel,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  LinearProgress, Tooltip, Stack, Switch, FormControlLabel, Badge,
  Card, CardContent, CardActions, Collapse, alpha, useTheme, Snackbar,
  List, ListItem, ListItemText, ListItemSecondaryAction
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Add as AddIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Block as BlockIcon,
  PlayArrow as RunIcon,
  Warning as WarnIcon,
  PowerSettingsNew as PowerIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Send as SendIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Gavel as GavelIcon,
  Assignment as ProposalIcon,
  BarChart as ScoreIcon,
  Flag as GoalIcon,
  Rule as RuleIcon,
  Person as AgentIcon,
  Bolt as TriggerIcon,
  HowToVote as VoteIcon,
  LocalFireDepartment as FireIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';

const API = process.env.REACT_APP_API_URL || 'https://soldikeeper-backend-production.up.railway.app/api';

const useGodModeApi = (token) => {
  const headers = useCallback(() => ({ Authorization: `Bearer ${token}` }), [token]);

  const get = useCallback(async (path) => {
    const r = await axios.get(`${API}/admin/godmode${path}`, { headers: headers() });
    return r.data.data ?? r.data;
  }, [headers]);

  const post = useCallback(async (path, body = {}) => {
    const r = await axios.post(`${API}/admin/godmode${path}`, body, { headers: headers() });
    return r.data.data ?? r.data;
  }, [headers]);

  const patch = useCallback(async (path, body = {}) => {
    const r = await axios.patch(`${API}/admin/godmode${path}`, body, { headers: headers() });
    return r.data.data ?? r.data;
  }, [headers]);

  const del = useCallback(async (path) => {
    const r = await axios.delete(`${API}/admin/godmode${path}`, { headers: headers() });
    return r.data;
  }, [headers]);

  return { get, post, patch, del };
};

// ── Shared status badge  ──────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const map = {
    active: { color: 'success', label: 'Active' },
    enabled: { color: 'success', label: 'Enabled' },
    idle: { color: 'default', label: 'Idle' },
    open: { color: 'warning', label: 'Open' },
    closed: { color: 'default', label: 'Closed' },
    approved: { color: 'success', label: 'Approved' },
    rejected: { color: 'error', label: 'Rejected' },
    pending_review: { color: 'warning', label: 'Pending' },
    in_council: { color: 'info', label: 'In Council' },
    disabled: { color: 'error', label: 'Disabled' },
    on_leave: { color: 'warning', label: 'On Leave' },
    archived: { color: 'default', label: 'Archived' },
  };
  const cfg = map[status] || { color: 'default', label: status };
  return <Chip label={cfg.label} color={cfg.color} size="small" />;
};

// ── 1. OKRs Panel ─────────────────────────────────────────────────────────────
const OKRsPanel = ({ api, token }) => {
  const theme = useTheme();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});
  const [createOpen, setCreateOpen] = useState(false);
  const [checkInOpen, setCheckInOpen] = useState(null); // goal id
  const [form, setForm] = useState({ title: '', description: '', ownerId: 'apollo', ownerType: 'agent' });
  const [checkInForm, setCheckInForm] = useState({ keyResultIndex: 0, currentValue: 0, note: '' });
  const [snack, setSnack] = useState('');

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.get('/goals');
      setGoals(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [api]);

  useEffect(() => { load(); }, [load]);

  const create = async () => {
    try {
      await api.post('/goals', form);
      setCreateOpen(false);
      setForm({ title: '', description: '', ownerId: 'apollo', ownerType: 'agent' });
      setSnack('Goal created');
      load();
    } catch (e) { setSnack('Error: ' + e.message); }
  };

  const approve = async (id) => {
    try { await api.post(`/goals/${id}/approve`); setSnack('Goal approved'); load(); }
    catch (e) { setSnack('Error: ' + e.message); }
  };

  const abandon = async (id) => {
    try { await api.del(`/goals/${id}`); setSnack('Goal abandoned'); load(); }
    catch (e) { setSnack('Error: ' + e.message); }
  };

  const checkIn = async () => {
    try {
      await api.post(`/goals/${checkInOpen}/check-in`, checkInForm);
      setCheckInOpen(null);
      setSnack('Check-in saved');
      load();
    } catch (e) { setSnack('Error: ' + e.message); }
  };

  const progressOf = (goal) => {
    if (!goal.keyResults?.length) return 0;
    const avg = goal.keyResults.reduce((s, kr) => {
      const pct = kr.targetValue > 0 ? Math.min(100, (kr.currentValue / kr.targetValue) * 100) : 0;
      return s + pct;
    }, 0) / goal.keyResults.length;
    return Math.round(avg);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="subtitle1" fontWeight={700}>Company OKRs ({goals.length})</Typography>
        <Stack direction="row" spacing={1}>
          <IconButton size="small" onClick={load}><RefreshIcon fontSize="small" /></IconButton>
          <Button startIcon={<AddIcon />} size="small" variant="contained" onClick={() => setCreateOpen(true)}>
            New Goal
          </Button>
        </Stack>
      </Box>

      {loading && <LinearProgress sx={{ mb: 2 }} />}

      {goals.length === 0 && !loading && (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <GoalIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
          <Typography color="text.secondary">No active goals. Create one to get started.</Typography>
        </Box>
      )}

      {goals.map(goal => {
        const progress = progressOf(goal);
        const isExpanded = expanded[goal._id];
        return (
          <Paper key={goal._id} variant="outlined" sx={{ mb: 2, overflow: 'hidden' }}>
            <Box sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <Typography variant="body1" fontWeight={700}>{goal.title}</Typography>
                    <StatusBadge status={goal.status} />
                    <Chip label={goal.ownerId || goal.ownerType} size="small" variant="outlined" />
                  </Box>
                  {goal.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{goal.description}</Typography>
                  )}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LinearProgress
                      variant="determinate"
                      value={progress}
                      sx={{ flex: 1, height: 6, borderRadius: 3,
                        '& .MuiLinearProgress-bar': {
                          background: progress >= 80 ? '#4caf50' : progress >= 50 ? '#ff9800' : '#2196f3'
                        }
                      }}
                    />
                    <Typography variant="caption" fontWeight={700}>{progress}%</Typography>
                  </Box>
                </Box>
                <Stack direction="row" spacing={0.5}>
                  {goal.status === 'draft' && (
                    <Tooltip title="Approve"><IconButton size="small" color="success" onClick={() => approve(goal._id)}><CheckIcon fontSize="small" /></IconButton></Tooltip>
                  )}
                  <Tooltip title="Check-in">
                    <IconButton size="small" color="primary" onClick={() => { setCheckInOpen(goal._id); setCheckInForm({ keyResultIndex: 0, currentValue: 0, note: '' }); }}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Abandon"><IconButton size="small" color="error" onClick={() => abandon(goal._id)}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
                  <IconButton size="small" onClick={() => setExpanded(e => ({ ...e, [goal._id]: !e[goal._id] }))}>
                    {isExpanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                  </IconButton>
                </Stack>
              </Box>
            </Box>
            <Collapse in={isExpanded}>
              <Divider />
              <Box sx={{ p: 2, bgcolor: alpha(theme.palette.primary.main, 0.03) }}>
                <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                  KEY RESULTS
                </Typography>
                {goal.keyResults?.length ? goal.keyResults.map((kr, i) => (
                  <Box key={i} sx={{ mb: 1.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2">{kr.title}</Typography>
                      <Typography variant="body2" fontWeight={700} color="primary">
                        {kr.currentValue} / {kr.targetValue} {kr.unit}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={kr.targetValue > 0 ? Math.min(100, (kr.currentValue / kr.targetValue) * 100) : 0}
                      sx={{ height: 4, borderRadius: 2 }}
                    />
                  </Box>
                )) : (
                  <Typography variant="body2" color="text.secondary">No key results defined.</Typography>
                )}
              </Box>
            </Collapse>
          </Paper>
        );
      })}

      {/* Create Goal Dialog */}
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>New OKR / Goal</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Title" fullWidth value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            <TextField label="Description" fullWidth multiline rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            <TextField label="Owner ID (agent id or user id)" fullWidth value={form.ownerId} onChange={e => setForm(f => ({ ...f, ownerId: e.target.value }))} />
            <FormControl fullWidth>
              <InputLabel>Owner Type</InputLabel>
              <Select label="Owner Type" value={form.ownerType} onChange={e => setForm(f => ({ ...f, ownerType: e.target.value }))}>
                {['agent', 'human', 'company'].map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={create} disabled={!form.title}>Create</Button>
        </DialogActions>
      </Dialog>

      {/* Check-in Dialog */}
      <Dialog open={!!checkInOpen} onClose={() => setCheckInOpen(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Key Result Check-in</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField type="number" label="Key Result Index (0-based)" fullWidth value={checkInForm.keyResultIndex}
              onChange={e => setCheckInForm(f => ({ ...f, keyResultIndex: parseInt(e.target.value) || 0 }))} />
            <TextField type="number" label="Current Value" fullWidth value={checkInForm.currentValue}
              onChange={e => setCheckInForm(f => ({ ...f, currentValue: parseFloat(e.target.value) || 0 }))} />
            <TextField label="Note" fullWidth multiline rows={2} value={checkInForm.note}
              onChange={e => setCheckInForm(f => ({ ...f, note: e.target.value }))} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCheckInOpen(null)}>Cancel</Button>
          <Button variant="contained" onClick={checkIn}>Save Check-in</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={!!snack} autoHideDuration={3000} onClose={() => setSnack('')}
        message={snack} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} />
    </Box>
  );
};

// ── 2. Scorecards Panel ───────────────────────────────────────────────────────
const ScorecardsPanel = ({ api }) => {
  const theme = useTheme();
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [period, setPeriod] = useState('week');
  const [snack, setSnack] = useState('');

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.get(`/scorecards?period=${period}`);
      setCards(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [api, period]);

  useEffect(() => { load(); }, [load]);

  const refreshAll = async () => {
    try {
      setRefreshing(true);
      await api.post('/scorecards/refresh', { period });
      setSnack('Scorecard refresh triggered');
      await load();
    } catch (e) { setSnack('Error: ' + e.message); }
    finally { setRefreshing(false); }
  };

  const scoreColor = (score) => {
    if (score >= 80) return theme.palette.success.main;
    if (score >= 60) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="subtitle1" fontWeight={700}>Agent Scorecards ({cards.length})</Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          <FormControl size="small" sx={{ minWidth: 110 }}>
            <Select value={period} onChange={e => setPeriod(e.target.value)} size="small">
              {['day', 'week', 'month'].map(p => <MenuItem key={p} value={p}>{p}</MenuItem>)}
            </Select>
          </FormControl>
          <Button startIcon={refreshing ? <CircularProgress size={14} /> : <RefreshIcon />}
            size="small" variant="outlined" onClick={refreshAll} disabled={refreshing}>
            Refresh All
          </Button>
        </Stack>
      </Box>

      {loading && <LinearProgress sx={{ mb: 2 }} />}

      {cards.length === 0 && !loading && (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <ScoreIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
          <Typography color="text.secondary">No scorecard data. Try refreshing.</Typography>
        </Box>
      )}

      <Grid container spacing={2}>
        {cards.map(card => (
          <Grid item xs={12} sm={6} md={4} key={card.agentId || card._id}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent sx={{ pb: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="subtitle2" fontWeight={700}>{card.agentId}</Typography>
                  <Typography variant="h6" fontWeight={800} sx={{ color: scoreColor(card.overallScore ?? 0) }}>
                    {Math.round(card.overallScore ?? 0)}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={Math.min(100, card.overallScore ?? 0)}
                  sx={{
                    height: 6, borderRadius: 3, mb: 1.5,
                    '& .MuiLinearProgress-bar': { bgcolor: scoreColor(card.overallScore ?? 0) }
                  }}
                />
                {card.metrics && Object.entries(card.metrics).slice(0, 4).map(([k, v]) => (
                  <Box key={k} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="caption" color="text.secondary">{k.replace(/_/g, ' ')}</Typography>
                    <Typography variant="caption" fontWeight={600}>{typeof v === 'number' ? Math.round(v) : String(v)}</Typography>
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Snackbar open={!!snack} autoHideDuration={3000} onClose={() => setSnack('')}
        message={snack} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} />
    </Box>
  );
};

// ── 3. Council Votes Panel ─────────────────────────────────────────────────────
const VotesPanel = ({ api }) => {
  const [votes, setVotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [overrideOpen, setOverrideOpen] = useState(null);
  const [overrideForm, setOverrideForm] = useState({ decision: 'approved', rationale: '' });
  const [snack, setSnack] = useState('');
  const [statusFilter, setStatusFilter] = useState('open');

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.get(`/votes?status=${statusFilter}`);
      setVotes(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [api, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const override = async () => {
    try {
      await api.post(`/votes/${overrideOpen}/override`, overrideForm);
      setSnack('Override applied');
      setOverrideOpen(null);
      load();
    } catch (e) { setSnack('Error: ' + e.message); }
  };

  const castVote = async (id, choice) => {
    try {
      await api.post(`/votes/${id}/cast`, { voterAgentId: 'human-admin', choice, rationale: 'Manual override via God Mode UI' });
      setSnack(`Vote cast: ${choice}`);
      load();
    } catch (e) { setSnack('Error: ' + e.message); }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="subtitle1" fontWeight={700}>Council Votes ({votes.length})</Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          <FormControl size="small" sx={{ minWidth: 110 }}>
            <Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} size="small">
              {['open', 'closed', 'overridden'].map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
            </Select>
          </FormControl>
          <IconButton size="small" onClick={load}><RefreshIcon fontSize="small" /></IconButton>
        </Stack>
      </Box>

      {loading && <LinearProgress sx={{ mb: 2 }} />}

      {votes.length === 0 && !loading && (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <VoteIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
          <Typography color="text.secondary">No {statusFilter} votes.</Typography>
        </Box>
      )}

      {votes.map(vote => (
        <Paper key={vote._id} variant="outlined" sx={{ p: 2, mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1, mb: 1.5 }}>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <Typography variant="body1" fontWeight={700}>{vote.topic || vote.title || vote._id}</Typography>
                <StatusBadge status={vote.status} />
              </Box>
              <Typography variant="body2" color="text.secondary">{vote.description || vote.question}</Typography>
              {vote.proposingAgentId && (
                <Typography variant="caption" color="text.secondary">Proposed by: {vote.proposingAgentId}</Typography>
              )}
            </Box>
            {vote.status === 'open' && (
              <Stack direction="row" spacing={0.5}>
                <Tooltip title="Vote Yes">
                  <Button size="small" variant="outlined" color="success" startIcon={<CheckIcon />}
                    onClick={() => castVote(vote._id, 'approve')}>Yes</Button>
                </Tooltip>
                <Tooltip title="Vote No">
                  <Button size="small" variant="outlined" color="error" startIcon={<CancelIcon />}
                    onClick={() => castVote(vote._id, 'reject')}>No</Button>
                </Tooltip>
                <Tooltip title="Human Override">
                  <Button size="small" variant="contained" color="warning" startIcon={<GavelIcon />}
                    onClick={() => { setOverrideOpen(vote._id); setOverrideForm({ decision: 'approved', rationale: '' }); }}>
                    Override
                  </Button>
                </Tooltip>
              </Stack>
            )}
          </Box>
          {vote.votes?.length > 0 && (
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {vote.votes.map((v, i) => (
                <Chip key={i} label={`${v.voterAgentId}: ${v.choice}`} size="small"
                  color={v.choice === 'approve' ? 'success' : 'error'} variant="outlined" />
              ))}
            </Box>
          )}
        </Paper>
      ))}

      {/* Override Dialog */}
      <Dialog open={!!overrideOpen} onClose={() => setOverrideOpen(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Human Override</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Decision</InputLabel>
              <Select label="Decision" value={overrideForm.decision} onChange={e => setOverrideForm(f => ({ ...f, decision: e.target.value }))}>
                <MenuItem value="approved">Approve</MenuItem>
                <MenuItem value="rejected">Reject</MenuItem>
                <MenuItem value="abstain">Abstain</MenuItem>
              </Select>
            </FormControl>
            <TextField label="Rationale" fullWidth multiline rows={3} value={overrideForm.rationale}
              onChange={e => setOverrideForm(f => ({ ...f, rationale: e.target.value }))} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOverrideOpen(null)}>Cancel</Button>
          <Button variant="contained" color="warning" onClick={override}>Apply Override</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={!!snack} autoHideDuration={3000} onClose={() => setSnack('')}
        message={snack} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} />
    </Box>
  );
};

// ── 4. Proposals Panel ────────────────────────────────────────────────────────
const ProposalsPanel = ({ api }) => {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [decideOpen, setDecideOpen] = useState(null); // { id, action: 'approve'|'reject' }
  const [rationale, setRationale] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending_review');
  const [snack, setSnack] = useState('');

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.get(`/proposals?status=${statusFilter}`);
      setProposals(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [api, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const decide = async () => {
    try {
      await api.post(`/proposals/${decideOpen.id}/${decideOpen.action}`, { rationale });
      setSnack(`Proposal ${decideOpen.action}d`);
      setDecideOpen(null);
      setRationale('');
      load();
    } catch (e) { setSnack('Error: ' + e.message); }
  };

  const severityColor = (sev) => ({
    critical: 'error', high: 'warning', medium: 'info', low: 'default'
  }[sev] || 'default');

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="subtitle1" fontWeight={700}>Agent Proposals ({proposals.length})</Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} size="small">
              {['pending_review', 'in_council', 'approved', 'rejected'].map(s => <MenuItem key={s} value={s}>{s.replace('_', ' ')}</MenuItem>)}
            </Select>
          </FormControl>
          <IconButton size="small" onClick={load}><RefreshIcon fontSize="small" /></IconButton>
        </Stack>
      </Box>

      {loading && <LinearProgress sx={{ mb: 2 }} />}

      {proposals.length === 0 && !loading && (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <ProposalIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
          <Typography color="text.secondary">No {statusFilter.replace('_', ' ')} proposals.</Typography>
        </Box>
      )}

      {proposals.map(p => (
        <Paper key={p._id || p.proposalId} variant="outlined" sx={{ p: 2, mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1 }}>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <Typography variant="body1" fontWeight={700}>{p.title || p.proposalId}</Typography>
                <StatusBadge status={p.status} />
                {p.severity && <Chip label={p.severity} size="small" color={severityColor(p.severity)} />}
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>{p.description}</Typography>
              {p.proposingAgentId && (
                <Typography variant="caption" color="text.secondary">Proposed by: {p.proposingAgentId}</Typography>
              )}
            </Box>
            {(p.status === 'pending_review' || p.status === 'in_council') && (
              <Stack direction="row" spacing={0.5}>
                <Button size="small" variant="contained" color="success" startIcon={<CheckIcon />}
                  onClick={() => { setDecideOpen({ id: p.proposalId || p._id, action: 'approve' }); setRationale(''); }}>
                  Approve
                </Button>
                <Button size="small" variant="outlined" color="error" startIcon={<CancelIcon />}
                  onClick={() => { setDecideOpen({ id: p.proposalId || p._id, action: 'reject' }); setRationale(''); }}>
                  Reject
                </Button>
              </Stack>
            )}
          </Box>
          {p.humanRationale && (
            <Box sx={{ mt: 1, p: 1, bgcolor: 'action.hover', borderRadius: 1 }}>
              <Typography variant="caption" color="text.secondary">Rationale: {p.humanRationale}</Typography>
            </Box>
          )}
        </Paper>
      ))}

      <Dialog open={!!decideOpen} onClose={() => setDecideOpen(null)} maxWidth="xs" fullWidth>
        <DialogTitle>{decideOpen?.action === 'approve' ? '✅ Approve' : '❌ Reject'} Proposal</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField label="Rationale (optional)" fullWidth multiline rows={3} value={rationale}
            onChange={e => setRationale(e.target.value)} sx={{ mt: 1 }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDecideOpen(null)}>Cancel</Button>
          <Button variant="contained" color={decideOpen?.action === 'approve' ? 'success' : 'error'} onClick={decide}>
            Confirm {decideOpen?.action}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={!!snack} autoHideDuration={3000} onClose={() => setSnack('')}
        message={snack} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} />
    </Box>
  );
};

// ── 5. Constitutional Rules Panel ─────────────────────────────────────────────
const RulesPanel = ({ api }) => {
  const theme = useTheme();
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [testOpen, setTestOpen] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', category: 'safety', priority: 50 });
  const [testForm, setTestForm] = useState({ agentId: 'apollo', tool: '', params: '{}', category: 'safety' });
  const [testResult, setTestResult] = useState(null);
  const [snack, setSnack] = useState('');

  const load = useCallback(async () => {
    try { setLoading(true); const d = await api.get('/rules'); setRules(Array.isArray(d) ? d : []); }
    catch (e) { console.error(e); } finally { setLoading(false); }
  }, [api]);

  useEffect(() => { load(); }, [load]);

  const create = async () => {
    try {
      await api.post('/rules', form);
      setCreateOpen(false);
      setSnack('Rule created');
      load();
    } catch (e) { setSnack('Error: ' + e.message); }
  };

  const deleteRule = async (id) => {
    if (!window.confirm('Delete this rule?')) return;
    try { await api.del(`/rules/${id}`); setSnack('Rule deleted'); load(); }
    catch (e) { setSnack('Error: ' + e.message); }
  };

  const seedRules = async () => {
    try { await api.post('/rules/seed', {}); setSnack('Bedrock rules seeded'); load(); }
    catch (e) { setSnack('Error: ' + e.message); }
  };

  const testRule = async () => {
    try {
      let params;
      try { params = JSON.parse(testForm.params); } catch { params = {}; }
      const r = await api.post('/rules/test', { ...testForm, params });
      setTestResult(r);
    } catch (e) { setSnack('Error: ' + e.message); }
  };

  const categoryColor = (cat) => ({
    safety: 'error', ethics: 'warning', finance: 'success', communication: 'info'
  }[cat] || 'default');

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="subtitle1" fontWeight={700}>Constitutional Rules ({rules.length})</Typography>
        <Stack direction="row" spacing={1}>
          <Button size="small" variant="outlined" onClick={seedRules}>Seed Bedrock</Button>
          <Button size="small" variant="outlined" startIcon={<RunIcon />} onClick={() => setTestOpen(true)}>Test Verdict</Button>
          <IconButton size="small" onClick={load}><RefreshIcon fontSize="small" /></IconButton>
          <Button size="small" variant="contained" startIcon={<AddIcon />} onClick={() => setCreateOpen(true)}>New Rule</Button>
        </Stack>
      </Box>

      {loading && <LinearProgress sx={{ mb: 2 }} />}

      {rules.length === 0 && !loading && (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <RuleIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
          <Typography color="text.secondary">No rules. Click "Seed Bedrock" to add defaults.</Typography>
        </Box>
      )}

      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.04) }}>
              <TableCell fontWeight="bold">Rule</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Priority</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rules.map(rule => (
              <TableRow key={rule._id} hover>
                <TableCell>
                  <Typography variant="body2" fontWeight={600}>{rule.title}</Typography>
                  {rule.content && (
                    <Typography variant="caption" color="text.secondary"
                      sx={{ display: 'block', maxWidth: 350, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {rule.content}
                    </Typography>
                  )}
                </TableCell>
                <TableCell><Chip label={rule.category || 'general'} size="small" color={categoryColor(rule.category)} /></TableCell>
                <TableCell><Typography variant="body2">{rule.priority ?? 50}</Typography></TableCell>
                <TableCell><StatusBadge status={rule.isActive === false ? 'disabled' : 'active'} /></TableCell>
                <TableCell align="right">
                  <Tooltip title="Delete">
                    <IconButton size="small" color="error" onClick={() => deleteRule(rule._id)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Create Rule Dialog */}
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>New Constitutional Rule</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Title" fullWidth value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            <TextField label="Content / Constraint" fullWidth multiline rows={3} value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} />
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select label="Category" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                {['safety', 'ethics', 'finance', 'communication', 'general'].map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
              </Select>
            </FormControl>
            <TextField type="number" label="Priority (0-100)" fullWidth value={form.priority} onChange={e => setForm(f => ({ ...f, priority: parseInt(e.target.value) || 50 }))} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={create} disabled={!form.title}>Create</Button>
        </DialogActions>
      </Dialog>

      {/* Test Verdict Dialog */}
      <Dialog open={testOpen} onClose={() => { setTestOpen(false); setTestResult(null); }} maxWidth="sm" fullWidth>
        <DialogTitle>Test Constitutional Verdict</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Agent ID" fullWidth value={testForm.agentId} onChange={e => setTestForm(f => ({ ...f, agentId: e.target.value }))} />
            <TextField label="Tool name" fullWidth value={testForm.tool} onChange={e => setTestForm(f => ({ ...f, tool: e.target.value }))} />
            <TextField label="Params (JSON)" fullWidth multiline rows={2} value={testForm.params} onChange={e => setTestForm(f => ({ ...f, params: e.target.value }))} />
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select label="Category" value={testForm.category} onChange={e => setTestForm(f => ({ ...f, category: e.target.value }))}>
                {['safety', 'ethics', 'finance', 'communication', 'general'].map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
              </Select>
            </FormControl>
            {testResult && (
              <Alert severity={testResult.blocked ? 'error' : 'success'}>
                <Typography variant="body2" fontWeight={700}>{testResult.blocked ? '🚫 BLOCKED' : '✅ ALLOWED'}</Typography>
                {testResult.reason && <Typography variant="caption">{testResult.reason}</Typography>}
              </Alert>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setTestOpen(false); setTestResult(null); }}>Close</Button>
          <Button variant="contained" onClick={testRule}>Run Verdict</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={!!snack} autoHideDuration={3000} onClose={() => setSnack('')}
        message={snack} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} />
    </Box>
  );
};

// ── 6. Agent Lifecycle Panel ──────────────────────────────────────────────────
const AgentLifecyclePanel = ({ api }) => {
  const theme = useTheme();
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmOpen, setConfirmOpen] = useState(null); // { agentId, action }
  const [reason, setReason] = useState('');
  const [snack, setSnack] = useState('');

  const load = useCallback(async () => {
    try { setLoading(true); const d = await api.get('/agents'); setAgents(Array.isArray(d) ? d : []); }
    catch (e) { console.error(e); } finally { setLoading(false); }
  }, [api]);

  useEffect(() => { load(); }, [load]);

  const execute = async () => {
    const { agentId, action } = confirmOpen;
    try {
      if (action === 'disable') await api.post(`/agents/${agentId}/disable`, { reason });
      else if (action === 'enable') await api.post(`/agents/${agentId}/enable`);
      else if (action === 'fire') await api.post(`/agents/${agentId}/fire`, { reason });
      setSnack(`Agent ${agentId} ${action}d`);
      setConfirmOpen(null);
      setReason('');
      load();
    } catch (e) { setSnack('Error: ' + e.message); }
  };

  const statusColors = { enabled: 'success.main', active: 'success.main', disabled: 'error.main', on_leave: 'warning.main' };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="subtitle1" fontWeight={700}>Agent Lifecycle ({agents.length})</Typography>
        <IconButton size="small" onClick={load}><RefreshIcon fontSize="small" /></IconButton>
      </Box>

      {loading && <LinearProgress sx={{ mb: 2 }} />}

      {agents.length === 0 && !loading && (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <AgentIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
          <Typography color="text.secondary">No agent configurations found.</Typography>
        </Box>
      )}

      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.04) }}>
              <TableCell>Agent</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Model</TableCell>
              <TableCell align="right">Controls</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {agents.map(agent => {
              const isDisabled = agent.status === 'disabled';
              return (
                <TableRow key={agent._id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight={700}>{agent.agentId}</Typography>
                    {agent.name && <Typography variant="caption" color="text.secondary">{agent.name}</Typography>}
                  </TableCell>
                  <TableCell><Typography variant="caption">{agent.role}</Typography></TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: statusColors[agent.status] || 'grey.400' }} />
                      <Typography variant="caption">{agent.status}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell><Chip label={agent.model || 'default'} size="small" variant="outlined" /></TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                      {isDisabled ? (
                        <Tooltip title="Enable Agent">
                          <IconButton size="small" color="success"
                            onClick={() => setConfirmOpen({ agentId: agent.agentId, action: 'enable' })}>
                            <PowerIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      ) : (
                        <Tooltip title="Disable Agent">
                          <IconButton size="small" color="warning"
                            onClick={() => { setConfirmOpen({ agentId: agent.agentId, action: 'disable' }); setReason(''); }}>
                            <BlockIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      <Tooltip title="Fire Agent (permanent)">
                        <IconButton size="small" color="error"
                          onClick={() => { setConfirmOpen({ agentId: agent.agentId, action: 'fire' }); setReason(''); }}>
                          <FireIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={!!confirmOpen} onClose={() => setConfirmOpen(null)} maxWidth="xs" fullWidth>
        <DialogTitle>
          {confirmOpen?.action === 'fire' ? '🔥 Fire Agent?' :
           confirmOpen?.action === 'disable' ? '⚠️ Disable Agent?' : '✅ Enable Agent?'}
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {confirmOpen?.action === 'fire'
              ? `This will permanently archive agent "${confirmOpen?.agentId}". This action is irreversible.`
              : confirmOpen?.action === 'disable'
              ? `Agent "${confirmOpen?.agentId}" will stop processing tasks until re-enabled.`
              : `Agent "${confirmOpen?.agentId}" will resume processing tasks.`}
          </Typography>
          {(confirmOpen?.action === 'disable' || confirmOpen?.action === 'fire') && (
            <TextField label="Reason" fullWidth value={reason} onChange={e => setReason(e.target.value)} />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(null)}>Cancel</Button>
          <Button variant="contained"
            color={confirmOpen?.action === 'fire' ? 'error' : confirmOpen?.action === 'disable' ? 'warning' : 'success'}
            onClick={execute}>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={!!snack} autoHideDuration={3000} onClose={() => setSnack('')}
        message={snack} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} />
    </Box>
  );
};

// ── 7. Triggers & Settings Panel ──────────────────────────────────────────────
const TriggersPanel = ({ api, token }) => {
  const theme = useTheme();
  const [running, setRunning] = useState({});
  const [results, setResults] = useState({});
  const [snack, setSnack] = useState('');
  const [settings, setSettings] = useState({ autoResolve: false, confidenceThreshold: 85, maintenance: false });
  const [settingsLoading, setSettingsLoading] = useState(true);

  // Load platform settings via admin/settings endpoint
  useEffect(() => {
    const load = async () => {
      try {
        const r = await axios.get(`${API}/admin/settings`, { headers: { Authorization: `Bearer ${token}` } });
        if (r.data) {
          setSettings(s => ({
            autoResolve: r.data.autoResolve ?? s.autoResolve,
            confidenceThreshold: r.data.confidenceThreshold ?? s.confidenceThreshold,
            maintenance: r.data.maintenance ?? s.maintenance,
          }));
        }
      } catch (e) { /* fall back to defaults */ }
      finally { setSettingsLoading(false); }
    };
    load();
  }, [token]);

  const saveSetting = async (key, value) => {
    try {
      await axios.patch(`${API}/admin/settings`, { [key]: value }, { headers: { Authorization: `Bearer ${token}` } });
      setSettings(s => ({ ...s, [key]: value }));
      setSnack(`${key} updated`);
    } catch (e) {
      // Fallback: try godmode/settings if admin/settings doesn't exist
      setSettings(s => ({ ...s, [key]: value }));
      setSnack(`${key} updated (local)`);
    }
  };

  const trigger = async (key, path, body = {}) => {
    setRunning(r => ({ ...r, [key]: true }));
    setResults(r => ({ ...r, [key]: null }));
    try {
      const res = await api.post(path, body);
      setResults(r => ({ ...r, [key]: { ok: true, data: res } }));
      setSnack(`${key} completed`);
    } catch (e) {
      setResults(r => ({ ...r, [key]: { ok: false, error: e.message } }));
      setSnack('Error: ' + e.message);
    } finally {
      setRunning(r => ({ ...r, [key]: false }));
    }
  };

  const TRIGGERS = [
    {
      key: 'board', icon: '🏛️', label: 'Board Meeting', desc: 'Run the weekly board meeting cycle — strategy review, agent proposals, budget allocation.',
      action: () => trigger('board', '/triggers/board-meeting'),
      color: 'primary'
    },
    {
      key: 'self', icon: '🧠', label: 'Self-Improvement', desc: 'Trigger agent self-improvement scan — detect underperformance patterns and propose upgrades.',
      action: () => trigger('self', '/triggers/self-improvement'),
      color: 'secondary'
    },
    {
      key: 'scorecards', icon: '📊', label: 'Refresh Scorecards', desc: 'Recompute performance scorecards for all agents in the fleet.',
      action: () => trigger('scorecards', '/scorecards/refresh', { period: 'week' }),
      color: 'info'
    },
    {
      key: 'investor', icon: '📈', label: 'Generate Investor Report', desc: 'Generate a new investor narrative report for the current period.',
      action: () => trigger('investor', '/investor-reports/generate', { period: 'month' }),
      color: 'success'
    },
    {
      key: 'cleanup', icon: '🧹', label: 'Cleanup Ephemeral Agents', desc: 'Remove expired short-lived agent configurations.',
      action: () => trigger('cleanup', '/agents/cleanup-ephemeral'),
      color: 'warning'
    },
  ];

  return (
    <Box>
      <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>Manual Triggers</Typography>

      <Grid container spacing={2} sx={{ mb: 4 }}>
        {TRIGGERS.map(t => (
          <Grid item xs={12} sm={6} md={4} key={t.key}>
            <Paper variant="outlined" sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Typography variant="h5">{t.icon}</Typography>
                <Typography variant="subtitle2" fontWeight={700}>{t.label}</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ flex: 1, mb: 2 }}>{t.desc}</Typography>
              {results[t.key] && (
                <Alert severity={results[t.key].ok ? 'success' : 'error'} sx={{ mb: 1, py: 0 }}>
                  <Typography variant="caption">{results[t.key].ok ? 'Completed successfully' : results[t.key].error}</Typography>
                </Alert>
              )}
              <Button
                variant="contained"
                color={t.color}
                size="small"
                startIcon={running[t.key] ? <CircularProgress size={14} color="inherit" /> : <RunIcon />}
                disabled={running[t.key]}
                onClick={t.action}
                fullWidth
              >
                {running[t.key] ? 'Running…' : 'Run Now'}
              </Button>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Divider sx={{ mb: 3 }} />
      <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>Platform Settings</Typography>

      {settingsLoading ? <LinearProgress /> : (
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={4}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <FormControlLabel
                control={
                  <Switch checked={settings.maintenance}
                    onChange={e => saveSetting('maintenance', e.target.checked)} color="warning" />
                }
                label={
                  <Box>
                    <Typography variant="body2" fontWeight={700}>Maintenance Mode</Typography>
                    <Typography variant="caption" color="text.secondary">Block new user sessions</Typography>
                  </Box>
                }
              />
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <FormControlLabel
                control={
                  <Switch checked={settings.autoResolve}
                    onChange={e => saveSetting('autoResolve', e.target.checked)} color="success" />
                }
                label={
                  <Box>
                    <Typography variant="body2" fontWeight={700}>Auto-Resolve Escalations</Typography>
                    <Typography variant="caption" color="text.secondary">Let Apollo auto-close low-priority issues</Typography>
                  </Box>
                }
              />
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="body2" fontWeight={700} sx={{ mb: 1 }}>Confidence Threshold</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                Minimum AI confidence before autonomous action ({settings.confidenceThreshold}%)
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <TextField
                  type="number"
                  size="small"
                  value={settings.confidenceThreshold}
                  onChange={e => setSettings(s => ({ ...s, confidenceThreshold: parseInt(e.target.value) || 85 }))}
                  inputProps={{ min: 50, max: 99 }}
                  sx={{ width: 80 }}
                />
                <Button size="small" variant="outlined"
                  onClick={() => saveSetting('confidenceThreshold', settings.confidenceThreshold)}>
                  Save
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}

      <Snackbar open={!!snack} autoHideDuration={3000} onClose={() => setSnack('')}
        message={snack} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} />
    </Box>
  );
};

// ── Signals Status Bar ────────────────────────────────────────────────────────
const GodModeSignalBar = ({ signals, loading }) => {
  const theme = useTheme();
  if (loading) return <LinearProgress sx={{ mb: 2 }} />;
  if (!signals) return null;

  const items = [
    { label: 'Open Votes', value: signals.openVotes ?? 0, color: signals.openVotes > 0 ? 'warning' : 'default' },
    { label: 'Pending Proposals', value: signals.pendingProposals ?? 0, color: signals.pendingProposals > 0 ? 'error' : 'default' },
    { label: 'Active Goals', value: signals.activeGoals ?? 0, color: 'primary' },
    { label: 'Active Rules', value: signals.activeRules ?? 0, color: 'info' },
    { label: 'Blocks (24h)', value: signals.blocks24h ?? 0, color: signals.blocks24h > 0 ? 'error' : 'default' },
  ];

  return (
    <Paper
      elevation={0}
      sx={{
        px: 2, py: 1.5, mb: 3,
        background: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.08)} 0%, ${alpha(theme.palette.background.paper, 1)} 100%)`,
        border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
        borderRadius: 2
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
        <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ mr: 1 }}>
          🛡️ GOD MODE SIGNALS
        </Typography>
        {items.map(item => (
          <Box key={item.label} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Badge badgeContent={item.value > 0 ? item.value : null} color={item.color === 'default' ? 'default' : item.color}>
              <Chip
                label={item.label}
                size="small"
                color={item.color}
                variant={item.value > 0 ? 'filled' : 'outlined'}
                sx={{ fontWeight: item.value > 0 ? 700 : 400 }}
              />
            </Badge>
          </Box>
        ))}
        {signals.nextBoardMeeting && (
          <Chip
            label={`Next Board: ${new Date(signals.nextBoardMeeting).toLocaleDateString()}`}
            size="small"
            variant="outlined"
            color="primary"
          />
        )}
      </Box>
    </Paper>
  );
};

// ── Root GodModePanel ─────────────────────────────────────────────────────────
const GodModePanel = ({ token }) => {
  const [tab, setTab] = useState(0);
  const [signals, setSignals] = useState(null);
  const [signalsLoading, setSignalsLoading] = useState(true);
  const api = useGodModeApi(token);

  const loadSignals = useCallback(async () => {
    try {
      setSignalsLoading(true);
      const data = await api.get('/status');
      setSignals(data?.signals ?? data);
    } catch (e) { console.error(e); }
    finally { setSignalsLoading(false); }
  }, [api]);

  useEffect(() => {
    loadSignals();
    const interval = setInterval(loadSignals, 30000);
    return () => clearInterval(interval);
  }, [loadSignals]);

  const TABS = [
    { label: 'OKRs', icon: <GoalIcon fontSize="small" /> },
    { label: 'Scorecards', icon: <ScoreIcon fontSize="small" /> },
    { label: 'Votes', icon: <VoteIcon fontSize="small" />, badge: signals?.openVotes },
    { label: 'Proposals', icon: <ProposalIcon fontSize="small" />, badge: signals?.pendingProposals },
    { label: 'Rules', icon: <RuleIcon fontSize="small" /> },
    { label: 'Agents', icon: <AgentIcon fontSize="small" /> },
    { label: 'Triggers', icon: <TriggerIcon fontSize="small" /> },
  ];

  return (
    <Box>
      <GodModeSignalBar signals={signals} loading={signalsLoading} />

      <Paper elevation={0} variant="outlined" sx={{ borderRadius: 2 }}>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            px: 1,
            '& .MuiTab-root': { minHeight: 48, fontSize: '0.8rem', fontWeight: 600 }
          }}
        >
          {TABS.map((t, i) => (
            <Tab
              key={t.label}
              icon={
                t.badge > 0
                  ? <Badge badgeContent={t.badge} color="error">{t.icon}</Badge>
                  : t.icon
              }
              iconPosition="start"
              label={t.label}
            />
          ))}
        </Tabs>

        <Box sx={{ p: 3 }}>
          {tab === 0 && <OKRsPanel api={api} token={token} />}
          {tab === 1 && <ScorecardsPanel api={api} />}
          {tab === 2 && <VotesPanel api={api} />}
          {tab === 3 && <ProposalsPanel api={api} />}
          {tab === 4 && <RulesPanel api={api} />}
          {tab === 5 && <AgentLifecyclePanel api={api} />}
          {tab === 6 && <TriggersPanel api={api} token={token} />}
        </Box>
      </Paper>
    </Box>
  );
};

export default GodModePanel;
