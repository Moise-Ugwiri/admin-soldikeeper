/**
 * 🛡️ God Mode Panel — Bloomberg Terminal × Iron Man JARVIS
 * AI Corporation Control Plane  ·  /api/admin/godmode/*
 *
 * Tabs: Overview · OKRs · Scorecards · Constitution · Council ·
 *       Proposals · Agents · Simulator · Knowledge · Investor
 */
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box, Card, CardContent, Typography, Tabs, Tab, Button, Chip, Stack,
  TextField, Table, TableBody, TableCell, TableHead, TableRow, TableContainer,
  Dialog, DialogTitle, DialogContent, DialogActions, Alert, CircularProgress,
  IconButton, Tooltip, MenuItem, Select, FormControl, InputLabel,
  LinearProgress, Collapse, Fab, Badge, Snackbar, Switch, FormControlLabel,
  Divider, Paper, InputAdornment, GlobalStyles,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  Refresh as RefreshIcon,
  Add as AddIcon,
  PlayArrow as PlayArrowIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  LocalFireDepartment as FireIcon,
  Gavel as GavelIcon,
  Insights as InsightsIcon,
  Search as SearchIcon,
  Close as CloseIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Warning as WarningIcon,
  Dashboard as DashboardIcon,
  Speed as SpeedIcon,
  Groups as GroupsIcon,
  SmartToy as SmartToyIcon,
  Science as ScienceIcon,
  Hub as HubIcon,
  AccountBalance as AccountBalanceIcon,
  Send as SendIcon,
  EmojiEvents as EmojiEventsIcon,
  AutoFixHigh as AutoFixHighIcon,
  FlashOn as FlashOnIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import {
  RadialBarChart, RadialBar, ResponsiveContainer, Legend as RechartLegend,
} from 'recharts';
import apiClient from '../../../services/api';
import { AGENTS } from '../../../data/agentRegistry';

// ─── API helper ───────────────────────────────────────────────────────────────
const api = {
  get:   (url)       => apiClient.get(`/admin/godmode${url}`).then(r => r.data?.data ?? r.data),
  post:  (url, body) => apiClient.post(`/admin/godmode${url}`, body).then(r => r.data?.data ?? r.data),
  patch: (url, body) => apiClient.patch(`/admin/godmode${url}`, body).then(r => r.data?.data ?? r.data),
  del:   (url)       => apiClient.delete(`/admin/godmode${url}`).then(r => r.data?.data ?? r.data),
};

// ─── Style tokens ─────────────────────────────────────────────────────────────
const GLASS = () => ({
  background: alpha('#ffffff', 0.03),
  backdropFilter: 'blur(12px)',
  border: `1px solid ${alpha('#ffffff', 0.07)}`,
  borderRadius: 2,
});

const GRADIENT_HEADER = {
  background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
};

// ─── Agent registry lookup ────────────────────────────────────────────────────
function resolveAgent(agentId) {
  if (!agentId) return null;
  const key = String(agentId).toLowerCase();
  return (
    AGENTS.find(a => a.id === key) ||
    AGENTS.find(a => key.includes(a.name.toLowerCase())) ||
    AGENTS.find(a => a.id.includes((key.split(/[-_]/).pop()) || '')) ||
    null
  );
}

// ─── Agent Avatar ─────────────────────────────────────────────────────────────
function AgentAvatar({ agentId, size = 32 }) {
  const agent = resolveAgent(agentId);
  const color = agent?.color || '#607d8b';
  const label = agent?.emoji || (agentId ? String(agentId)[0].toUpperCase() : '?');
  return (
    <Box
      title={agent?.name || agentId || ''}
      sx={{
        width: size, height: size, flexShrink: 0,
        clipPath: 'polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)',
        background: `radial-gradient(circle, ${alpha(color, 0.35)}, ${alpha(color, 0.1)})`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: size * 0.45, cursor: 'default', userSelect: 'none',
      }}
    >
      {label}
    </Box>
  );
}

// ─── Knowledge-graph type list ────────────────────────────────────────────────
const KG_TYPES = [
  'all','user','feature','incident','vendor','goal',
  'concept','agent','document','event','metric','rule',
];

// ─────────────────────────────────────────────────────────────────────────────
// COMMAND BAR — sticky live signal ticker
// ─────────────────────────────────────────────────────────────────────────────
function CommandBar({ onRefresh }) {
  const [status, setStatus]     = useState(null);
  const [countdown, setCountdown] = useState('—');
  const tickRef = useRef(null);

  const loadStatus = useCallback(async () => {
    try { setStatus(await api.get('/status')); } catch (_) {}
  }, []);

  useEffect(() => {
    loadStatus();
    const t = setInterval(loadStatus, 30_000);
    return () => clearInterval(t);
  }, [loadStatus]);

  useEffect(() => {
    const tick = () => {
      const next = status?.signals?.nextBoardMeeting;
      if (!next) { setCountdown('—'); return; }
      const diff = new Date(next) - Date.now();
      if (diff <= 0) { setCountdown('NOW'); return; }
      const h = Math.floor(diff / 3_600_000);
      const m = Math.floor((diff % 3_600_000) / 60_000);
      const s = Math.floor((diff % 60_000) / 1_000);
      setCountdown(h > 0 ? `${h}h ${m}m ${s}s` : `${m}m ${s}s`);
    };
    tick();
    tickRef.current = setInterval(tick, 1_000);
    return () => clearInterval(tickRef.current);
  }, [status]);

  const sig = status?.signals || {};
  const isCritical = (sig.openVotes > 0) || (sig.pendingProposals > 0);

  const SIGNALS = [
    { label: 'VOTES',    val: sig.openVotes       ?? '—', hot: sig.openVotes > 0 },
    { label: 'PROPS',    val: sig.pendingProposals ?? '—', hot: sig.pendingProposals > 0 },
    { label: 'OKRs',     val: sig.activeGoals      ?? '—', hot: false },
    { label: 'BLK/24h',  val: sig.blocks24h        ?? '—', hot: sig.blocks24h > 0 },
    { label: 'RULES',    val: sig.activeRules       ?? '—', hot: false },
    { label: 'INV RPT',  val: sig.lastInvestorReport ? new Date(sig.lastInvestorReport).toLocaleDateString() : '—', hot: false },
  ];

  const pulseKf = {
    '@keyframes barPulse': {
      '0%':   { borderColor: alpha('#ef4444', 0.4) },
      '50%':  { borderColor: alpha('#ef4444', 0.9) },
      '100%': { borderColor: alpha('#ef4444', 0.4) },
    },
  };

  return (
    <Paper
      elevation={0}
      sx={{
        background: 'linear-gradient(135deg, #0d1117 0%, #161b22 100%)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 2, px: 2, py: 1.25, mb: 2,
        position: 'sticky', top: 0, zIndex: 200,
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1.5} flexWrap="wrap" useFlexGap>
        {/* Logo */}
        <Stack direction="row" alignItems="center" spacing={0.75}>
          {isCritical ? (
            <Badge
              variant="dot"
              color="error"
              sx={{
                '& .MuiBadge-dot': {
                  '@keyframes dotPulse': {
                    '0%':   { transform: 'scale(1)',   opacity: 1   },
                    '50%':  { transform: 'scale(1.8)', opacity: 0.7 },
                    '100%': { transform: 'scale(1)',   opacity: 1   },
                  },
                  animation: 'dotPulse 1s ease-in-out infinite',
                },
              }}
            >
              <WarningIcon sx={{ color: '#ef4444', fontSize: 18 }} />
            </Badge>
          ) : (
            <Box sx={{ fontSize: 18, lineHeight: 1 }}>🛡️</Box>
          )}
          <Typography
            variant="caption"
            sx={{
              fontWeight: 800, letterSpacing: '0.18em', color: '#10b981',
              fontSize: '0.7rem', textTransform: 'uppercase',
            }}
          >
            GOD MODE
          </Typography>
        </Stack>

        <Divider orientation="vertical" flexItem sx={{ borderColor: 'rgba(255,255,255,0.08)' }} />

        {/* Signal ticker */}
        {SIGNALS.map(s => (
          <Chip
            key={s.label}
            label={`${s.label} ${s.val}`}
            size="small"
            sx={{
              fontFamily: 'monospace', fontSize: '0.68rem', fontWeight: 700, height: 22,
              bgcolor: s.hot ? alpha('#ef4444', 0.15) : alpha('#ffffff', 0.04),
              color:   s.hot ? '#fca5a5' : '#64748b',
              border:  `1px solid ${s.hot ? alpha('#ef4444', 0.45) : alpha('#ffffff', 0.08)}`,
              ...(s.hot ? pulseKf : {}),
              animation: s.hot ? 'barPulse 1.8s ease-in-out infinite' : 'none',
            }}
          />
        ))}

        <Divider orientation="vertical" flexItem sx={{ borderColor: 'rgba(255,255,255,0.08)' }} />

        {/* Board countdown */}
        <Stack direction="row" alignItems="center" spacing={0.5}>
          <Typography variant="caption" sx={{ color: '#475569', fontSize: '0.6rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            BOARD
          </Typography>
          <Typography variant="caption" sx={{ fontFamily: 'monospace', fontWeight: 700, color: '#10b981', fontSize: '0.75rem' }}>
            {countdown}
          </Typography>
        </Stack>

        <Box sx={{ flex: 1 }} />

        <Tooltip title="Refresh all">
          <IconButton size="small" sx={{ color: '#475569' }} onClick={() => { loadStatus(); onRefresh?.(); }}>
            <RefreshIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Stack>
    </Paper>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// OVERVIEW TAB
// ─────────────────────────────────────────────────────────────────────────────
function OverviewTab() {
  const [data, setData]       = useState(null);
  const [snap, setSnap]       = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr]         = useState('');
  const [busy, setBusy]       = useState('');
  const [snack, setSnack]     = useState('');

  const load = useCallback(async () => {
    setLoading(true); setErr('');
    try {
      const [s, g] = await Promise.all([
        api.get('/status'),
        api.get('/goals/snapshot/fleet').catch(() => null),
      ]);
      setData(s); setSnap(g);
    } catch (e) { setErr(e.response?.data?.message || e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const trigger = useCallback(async (path, label) => {
    setBusy(label);
    try {
      await api.post(path, {});
      setSnack(`✅ ${label} triggered`);
    } catch (e) { setErr(e.response?.data?.message || e.message); }
    finally { setBusy(''); }
  }, []);

  const sig = data?.signals || {};
  const STAT_CARDS = [
    { label: 'Open Votes',        value: sig.openVotes       ?? '—', color: '#f59e0b', icon: <GavelIcon /> },
    { label: 'Pending Proposals', value: sig.pendingProposals ?? '—', color: '#6366f1', icon: <SendIcon /> },
    { label: 'Active OKRs',       value: sig.activeGoals      ?? '—', color: '#10b981', icon: <EmojiEventsIcon /> },
    { label: 'Blocks / 24 h',     value: sig.blocks24h        ?? '—', color: '#ef4444', icon: <BlockIcon /> },
    { label: 'Active Rules',      value: sig.activeRules      ?? '—', color: '#3b82f6', icon: <DashboardIcon /> },
  ];

  return (
    <Box>
      {err && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setErr('')}>{err}</Alert>}
      {loading && <LinearProgress sx={{ mb: 2, borderRadius: 1 }} />}

      {/* Stat cards */}
      <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap sx={{ mb: 3 }}>
        {STAT_CARDS.map(c => (
          <Card key={c.label} elevation={0} sx={{
            ...GLASS(), flex: '1 1 150px',
            border: `1px solid ${alpha(c.color, 0.25)}`,
            borderTop: `3px solid ${c.color}`,
            '&:hover': { boxShadow: `0 0 16px ${alpha('#10b981', 0.15)}`, transition: 'box-shadow 0.3s ease' },
          }}>
            <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" mb={0.5}>
                <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  {c.label}
                </Typography>
                <Box sx={{ color: alpha(c.color, 0.55), '& svg': { fontSize: 16 } }}>{c.icon}</Box>
              </Stack>
              <Typography variant="h4" sx={{ fontWeight: 700, color: c.color, fontFamily: 'monospace' }}>
                {c.value}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Stack>

      {/* Quick actions */}
      <Card elevation={0} sx={{ ...GLASS(), mb: 2 }}>
        <CardContent>
          <Typography variant="overline" sx={{ color: '#64748b', letterSpacing: '0.15em' }}>QUICK ACTIONS</Typography>
          <Stack direction="row" spacing={1.5} mt={1.5} flexWrap="wrap" useFlexGap>
            <Button
              variant="contained"
              startIcon={busy === 'Board Meeting' ? <CircularProgress size={15} color="inherit" /> : <PlayArrowIcon />}
              disabled={!!busy}
              onClick={() => trigger('/triggers/board-meeting', 'Board Meeting')}
              sx={{ background: 'linear-gradient(135deg,#10b981,#059669)', '&:hover': { background: 'linear-gradient(135deg,#059669,#047857)' } }}
            >
              Run Board Meeting
            </Button>
            <Button
              variant="outlined"
              startIcon={busy === 'Self-Improve' ? <CircularProgress size={15} color="inherit" /> : <AutoFixHighIcon />}
              disabled={!!busy}
              onClick={() => trigger('/triggers/self-improvement', 'Self-Improve')}
              sx={{ borderColor: '#6366f1', color: '#818cf8' }}
            >
              Self-Improve
            </Button>
            <Button
              variant="outlined"
              startIcon={busy === 'Scorecards' ? <CircularProgress size={15} color="inherit" /> : <SpeedIcon />}
              disabled={!!busy}
              onClick={() => trigger('/scorecards/refresh', 'Scorecards')}
              sx={{ borderColor: '#3b82f6', color: '#60a5fa' }}
            >
              Refresh Scorecards
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* OKR snapshot */}
      {snap && (
        <Card elevation={0} sx={{ ...GLASS(), mb: 2 }}>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={1} mb={1.5}>
              <InsightsIcon sx={{ color: '#10b981', fontSize: 18 }} />
              <Typography variant="overline" sx={{ color: '#64748b', letterSpacing: '0.15em' }}>OKR FLEET SNAPSHOT</Typography>
            </Stack>
            <Stack direction="row" spacing={3} flexWrap="wrap" useFlexGap>
              {[
                { l: 'Goals',       v: snap.totalGoals,              c: '#10b981' },
                { l: 'Key Results', v: snap.totalKRs,                c: '#3b82f6' },
                { l: 'Avg %',       v: `${snap.avgProgress ?? 0}%`,  c: '#6366f1' },
                { l: '✅ On Track',  v: snap.onTrack,                 c: '#10b981' },
                { l: '⚠️ At Risk',   v: snap.atRisk,                  c: '#f59e0b' },
                { l: '🔴 Off Track', v: snap.offTrack,                c: '#ef4444' },
              ].map(({ l, v, c }) => (
                <Box key={l} sx={{ textAlign: 'center' }}>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: c, fontFamily: 'monospace' }}>{v ?? '—'}</Typography>
                  <Typography variant="caption" sx={{ color: '#64748b' }}>{l}</Typography>
                </Box>
              ))}
            </Stack>
          </CardContent>
        </Card>
      )}

      {/* Module health */}
      {data?.modules && Object.keys(data.modules).length > 0 && (
        <Card elevation={0} sx={{ ...GLASS() }}>
          <CardContent>
            <Typography variant="overline" sx={{ color: '#64748b', letterSpacing: '0.15em' }}>MODULE HEALTH</Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap mt={1}>
              {Object.entries(data.modules).map(([k, v]) => (
                <Chip
                  key={k}
                  label={`${k}: ${v}`}
                  size="small"
                  color={v === 'loaded' ? 'success' : 'error'}
                  sx={{ fontFamily: 'monospace', fontSize: '0.68rem' }}
                />
              ))}
            </Stack>
          </CardContent>
        </Card>
      )}

      <Snackbar
        open={!!snack} autoHideDuration={4000} onClose={() => setSnack('')}
        message={snack}
        action={<IconButton size="small" color="inherit" onClick={() => setSnack('')}><CloseIcon fontSize="small" /></IconButton>}
      />
    </Box>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// OKRs TAB
// ─────────────────────────────────────────────────────────────────────────────
function OKRsTab() {
  const [goals, setGoals]             = useState([]);
  const [snap, setSnap]               = useState(null);
  const [loading, setLoading]         = useState(false);
  const [err, setErr]                 = useState('');
  const [expanded, setExpanded]       = useState({});
  const [createOpen, setCreateOpen]   = useState(false);
  const [checkInGoal, setCheckInGoal] = useState(null);
  const [form, setForm]   = useState({ title: '', description: '', period: 'quarter' });
  const [ciForm, setCiForm] = useState({ comment: '', progress: '' });
  const [snack, setSnack] = useState('');
  const [approveLoading, setApproveLoading] = useState({});
  const [krDialog, setKrDialog] = useState(null);
  const [krForm, setKrForm] = useState({ description: '', targetValue: '', unit: '' });

  const load = useCallback(async () => {
    setLoading(true); setErr('');
    try {
      const [g, s] = await Promise.all([
        api.get('/goals'),
        api.get('/goals/snapshot/fleet').catch(() => null),
      ]);
      setGoals(Array.isArray(g) ? g : []);
      setSnap(s);
    } catch (e) { setErr(e.response?.data?.message || e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const approveGoal = async (goalId) => {
    setApproveLoading(p => ({ ...p, [goalId]: true }));
    try {
      await api.post(`/goals/${goalId}/approve`, {});
      setSnack('Goal approved');
      load();
    } catch (e) {
      setErr(e.response?.data?.message || e.message);
    } finally {
      setApproveLoading(p => ({ ...p, [goalId]: false }));
    }
  };

  const addKeyResult = async () => {
    try {
      await api.post(`/goals/${krDialog._id}/key-result`, krForm);
      setKrDialog(null);
      setKrForm({ description: '', targetValue: '', unit: '' });
      setSnack('Key result added');
      load();
    } catch (e) {
      setErr(e.response?.data?.message || e.message);
    }
  };

  const createGoal = async () => {
    try {
      await api.post('/goals', form);
      setCreateOpen(false);
      setForm({ title: '', description: '', period: 'quarter' });
      setSnack('Goal created'); load();
    } catch (e) { setErr(e.response?.data?.message || e.message); }
  };

  const submitCheckIn = async () => {
    if (!checkInGoal) return;
    try {
      await api.post(`/goals/${checkInGoal._id}/check-in`, {
        comment: ciForm.comment, progress: Number(ciForm.progress),
      });
      setCheckInGoal(null); setCiForm({ comment: '', progress: '' });
      setSnack('Check-in recorded'); load();
    } catch (e) { setErr(e.response?.data?.message || e.message); }
  };

  const progressColor = p =>
    p == null ? '#64748b' : p >= 70 ? '#10b981' : p >= 40 ? '#f59e0b' : '#ef4444';

  return (
    <Box>
      {err && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setErr('')}>{err}</Alert>}

      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <EmojiEventsIcon sx={{ color: '#f59e0b' }} />
          <Typography variant="h6" sx={{ fontWeight: 700 }}>OKRs &amp; Goals</Typography>
          <Chip label={goals.length} size="small" sx={{ bgcolor: alpha('#f59e0b', 0.15), color: '#fbbf24' }} />
        </Stack>
        <Stack direction="row" spacing={1}>
          <Button size="small" variant="outlined" startIcon={<InsightsIcon />} onClick={load}
            sx={{ borderColor: '#10b981', color: '#34d399' }}>
            Fleet Snapshot
          </Button>
          <IconButton size="small" onClick={load}><RefreshIcon /></IconButton>
        </Stack>
      </Stack>

      {snap && (
        <Card elevation={0} sx={{ ...GLASS(), mb: 2 }}>
          <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
            <Stack direction="row" spacing={3} flexWrap="wrap" useFlexGap>
              {[
                { l: 'Goals',       v: snap.totalGoals,             c: '#10b981' },
                { l: 'KRs',         v: snap.totalKRs,               c: '#3b82f6' },
                { l: 'Avg %',       v: `${snap.avgProgress ?? 0}%`, c: '#6366f1' },
                { l: '✅ On Track',  v: snap.onTrack,                c: '#10b981' },
                { l: '⚠️ At Risk',   v: snap.atRisk,                 c: '#f59e0b' },
                { l: '🔴 Off Track', v: snap.offTrack,               c: '#ef4444' },
              ].map(({ l, v, c }) => (
                <Box key={l} sx={{ textAlign: 'center' }}>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: c, fontFamily: 'monospace' }}>{v ?? '—'}</Typography>
                  <Typography variant="caption" color="text.secondary">{l}</Typography>
                </Box>
              ))}
            </Stack>
          </CardContent>
        </Card>
      )}

      {loading && <LinearProgress sx={{ mb: 2 }} />}

      {goals.map(g => {
        const prog   = g.progress ?? 0;
        const pc     = progressColor(prog);
        const isExp  = !!expanded[g._id];
        const krs    = g.keyResults || [];
        return (
          <Card key={g._id} elevation={0} sx={{ ...GLASS(), mb: 1.5, borderLeft: `3px solid ${pc}` }}>
            <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1 } }}>
              <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
                <Box sx={{ flex: 1, mr: 1 }}>
                  <Stack direction="row" alignItems="center" spacing={1} mb={0.75} flexWrap="wrap" useFlexGap>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{g.title}</Typography>
                    <Chip size="small" label={g.period} sx={{ height: 18, fontSize: '0.65rem' }} />
                    <Chip size="small" label={g.status || 'active'} sx={{
                      height: 18, fontSize: '0.65rem',
                      bgcolor: alpha(g.status === 'active' ? '#10b981' : '#64748b', 0.15),
                      color:   g.status === 'active' ? '#34d399' : '#94a3b8',
                    }} />
                  </Stack>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <LinearProgress
                      variant="determinate" value={Math.min(prog, 100)}
                      sx={{
                        flex: 1, height: 6, borderRadius: 3,
                        bgcolor: alpha(pc, 0.12),
                        '& .MuiLinearProgress-bar': { bgcolor: pc, borderRadius: 3 },
                      }}
                    />
                    <Typography variant="caption" sx={{ fontFamily: 'monospace', color: pc, minWidth: 36 }}>
                      {prog}%
                    </Typography>
                  </Stack>
                </Box>
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <Tooltip title="Approve goal">
                    <span>
                      <IconButton size="small" sx={{ color: '#10b981' }} disabled={!!approveLoading[g._id]} onClick={() => approveGoal(g._id)}>
                        {approveLoading[g._id] ? <CircularProgress size={14} /> : <CheckCircleIcon fontSize="small" />}
                      </IconButton>
                    </span>
                  </Tooltip>
                  <Tooltip title="Add key result">
                    <IconButton size="small" sx={{ color: '#3b82f6' }} onClick={() => { setKrDialog(g); setKrForm({ description: '', targetValue: '', unit: '' }); }}>
                      <AddIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Button size="small" onClick={() => setCheckInGoal(g)} sx={{ fontSize: '0.68rem' }}>
                    Check-in
                  </Button>
                  <IconButton size="small" onClick={() => setExpanded(e => ({ ...e, [g._id]: !e[g._id] }))}>
                    {isExp ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                  </IconButton>
                </Stack>
              </Stack>

              <Collapse in={isExp}>
                <Box mt={1.5}>
                  {g.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {g.description}
                    </Typography>
                  )}
                  <Typography variant="overline" sx={{ color: '#475569', fontSize: '0.6rem', letterSpacing: '0.1em' }}>
                    KEY RESULTS ({krs.length})
                  </Typography>
                  {krs.map((kr, i) => {
                    const krProg = kr.progress ??
                      (kr.targetValue ? Math.round((kr.currentValue / kr.targetValue) * 100) : 0);
                    return (
                      <Box key={kr._id || i} sx={{ mt: 0.75 }}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Typography variant="caption" sx={{ flex: 1, color: '#94a3b8' }}>
                            {kr.description || kr.title || `KR ${i + 1}`}
                          </Typography>
                          <Typography variant="caption" sx={{ fontFamily: 'monospace', color: progressColor(krProg) }}>
                            {kr.currentValue ?? 0}/{kr.targetValue ?? 100}
                          </Typography>
                        </Stack>
                        <LinearProgress
                          variant="determinate" value={Math.min(krProg, 100)}
                          sx={{
                            height: 3, borderRadius: 2,
                            bgcolor: alpha('#ffffff', 0.05),
                            '& .MuiLinearProgress-bar': { bgcolor: progressColor(krProg) },
                          }}
                        />
                      </Box>
                    );
                  })}
                  {krs.length === 0 && (
                    <Typography variant="caption" color="text.secondary">No key results yet.</Typography>
                  )}
                </Box>
              </Collapse>
            </CardContent>
          </Card>
        );
      })}

      {goals.length === 0 && !loading && (
        <Box sx={{ textAlign: 'center', py: 6, color: '#475569' }}>
          <EmojiEventsIcon sx={{ fontSize: 42, opacity: 0.25, mb: 1 }} />
          <Typography variant="body2">No goals yet. Hit + to create one.</Typography>
        </Box>
      )}

      <Fab
        size="small"
        onClick={() => setCreateOpen(true)}
        sx={{ position: 'fixed', bottom: 80, right: 24, bgcolor: '#10b981', '&:hover': { bgcolor: '#059669' }, color: '#fff' }}
      >
        <AddIcon />
      </Fab>

      {/* Create Goal Dialog */}
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ ...GRADIENT_HEADER, color: '#e2e8f0' }}>Create OKR Goal</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1.5}>
            <TextField label="Title *" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} fullWidth required />
            <TextField label="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} fullWidth multiline rows={2} />
            <FormControl fullWidth>
              <InputLabel>Period</InputLabel>
              <Select value={form.period} label="Period" onChange={e => setForm(f => ({ ...f, period: e.target.value }))}>
                <MenuItem value="month">Month</MenuItem>
                <MenuItem value="quarter">Quarter</MenuItem>
                <MenuItem value="year">Year</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={createGoal} disabled={!form.title}>Create</Button>
        </DialogActions>
      </Dialog>

      {/* Check-in Dialog */}
      <Dialog open={!!checkInGoal} onClose={() => setCheckInGoal(null)} fullWidth maxWidth="xs">
        <DialogTitle>Check-in · {checkInGoal?.title}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField
              label="Progress (%)" type="number" value={ciForm.progress}
              onChange={e => setCiForm(f => ({ ...f, progress: e.target.value }))}
              inputProps={{ min: 0, max: 100 }} fullWidth
            />
            <TextField
              label="Comment" value={ciForm.comment}
              onChange={e => setCiForm(f => ({ ...f, comment: e.target.value }))}
              fullWidth multiline rows={2}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCheckInGoal(null)}>Cancel</Button>
          <Button variant="contained" onClick={submitCheckIn}>Submit</Button>
        </DialogActions>
      </Dialog>

      {/* Add Key Result Dialog */}
      <Dialog open={!!krDialog} onClose={() => setKrDialog(null)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ ...GRADIENT_HEADER, color: '#e2e8f0' }}>Add Key Result</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1.5 }}>
            <TextField label="Description" fullWidth multiline rows={2}
              value={krForm.description} onChange={e => setKrForm(p => ({ ...p, description: e.target.value }))} />
            <Stack direction="row" spacing={2}>
              <TextField label="Target Value" type="number" fullWidth
                value={krForm.targetValue} onChange={e => setKrForm(p => ({ ...p, targetValue: e.target.value }))} />
              <TextField label="Unit" fullWidth placeholder="e.g. %, users, $"
                value={krForm.unit} onChange={e => setKrForm(p => ({ ...p, unit: e.target.value }))} />
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setKrDialog(null)}>Cancel</Button>
          <Button variant="contained" onClick={addKeyResult}
            disabled={!krForm.description.trim()}>Add Key Result</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={!!snack} autoHideDuration={3000} onClose={() => setSnack('')}
        message={snack}
        action={<IconButton size="small" color="inherit" onClick={() => setSnack('')}><CloseIcon fontSize="small" /></IconButton>}
      />
    </Box>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SCORECARDS TAB
// ─────────────────────────────────────────────────────────────────────────────
function ScorecardsTab() {
  const [cards, setCards]     = useState([]);
  const [period, setPeriod]   = useState('week');
  const [loading, setLoading] = useState(false);
  const [err, setErr]         = useState('');
  const [snack, setSnack]     = useState('');

  const load = useCallback(async () => {
    setLoading(true); setErr('');
    try {
      const data = await api.get(`/scorecards?period=${period}`);
      setCards(Array.isArray(data) ? data : []);
    } catch (e) { setErr(e.response?.data?.message || e.message); }
    finally { setLoading(false); }
  }, [period]);

  useEffect(() => { load(); }, [load]);

  const doRefresh = async () => {
    try {
      await api.post('/scorecards/refresh', {});
      setSnack('Scorecards refreshed'); load();
    } catch (e) { setErr(e.response?.data?.message || e.message); }
  };

  const gradeColor = g =>
    ({ A: '#10b981', B: '#3b82f6', C: '#f59e0b', D: '#f97316', F: '#ef4444' }[g] || '#64748b');

  const cellSx = (val, good, ok) => ({
    fontFamily: 'monospace',
    color: val == null ? '#475569' : val >= good ? '#10b981' : val >= ok ? '#f59e0b' : '#ef4444',
  });

  const top5 = [...cards]
    .sort((a, b) => (b.score || 0) - (a.score || 0))
    .slice(0, 5)
    .map(c => {
      const ag = resolveAgent(c.agentId);
      return { name: ag?.name || c.agentId, score: Math.round((c.score || 0) * 10) / 10, fill: ag?.color || '#3b82f6' };
    });

  return (
    <Box>
      {err && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setErr('')}>{err}</Alert>}

      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <SpeedIcon sx={{ color: '#3b82f6' }} />
          <Typography variant="h6" sx={{ fontWeight: 700 }}>Agent Scorecards</Typography>
        </Stack>
        <Stack direction="row" spacing={1} alignItems="center">
          <FormControl size="small" sx={{ minWidth: 100 }}>
            <Select value={period} onChange={e => setPeriod(e.target.value)}>
              <MenuItem value="week">Week</MenuItem>
              <MenuItem value="month">Month</MenuItem>
              <MenuItem value="quarter">Quarter</MenuItem>
            </Select>
          </FormControl>
          <Button size="small" variant="outlined" startIcon={<RefreshIcon />} onClick={doRefresh}>Refresh</Button>
          <IconButton size="small" onClick={load}><RefreshIcon /></IconButton>
        </Stack>
      </Stack>

      {loading && <LinearProgress sx={{ mb: 2 }} />}

      {top5.length > 0 && (
        <Card elevation={0} sx={{ ...GLASS(), mb: 2 }}>
          <CardContent>
            <Typography variant="overline" sx={{ color: '#64748b', letterSpacing: '0.15em' }}>TOP PERFORMERS</Typography>
            <ResponsiveContainer width="100%" height={180}>
              <RadialBarChart cx="50%" cy="100%" innerRadius="25%" outerRadius="95%"
                startAngle={180} endAngle={0} data={top5}>
                <RadialBar dataKey="score" background label={{ position: 'insideStart', fill: '#94a3b8', fontSize: 10 }} />
                <RechartLegend iconSize={8} formatter={v => <span style={{ color: '#94a3b8', fontSize: 11 }}>{v}</span>} />
              </RadialBarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      <TableContainer component={Paper} elevation={0} sx={{ ...GLASS() }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ '& th': { color: '#475569', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid rgba(255,255,255,0.07)' } }}>
              <TableCell>Agent</TableCell>
              <TableCell>Grade</TableCell>
              <TableCell>Score</TableCell>
              <TableCell>Tasks</TableCell>
              <TableCell>Success %</TableCell>
              <TableCell>Avg Response</TableCell>
              <TableCell>Load</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {cards.map(c => {
              const ag = resolveAgent(c.agentId);
              const sr = (c.successRate || 0) * 100;
              return (
                <TableRow key={c.agentId} sx={{ '&:hover': { bgcolor: alpha('#ffffff', 0.025) } }}>
                  <TableCell>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <AgentAvatar agentId={c.agentId} size={24} />
                      <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>{ag?.name || c.agentId}</Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Chip size="small" label={c.grade || '—'}
                      sx={{ bgcolor: alpha(gradeColor(c.grade), 0.15), color: gradeColor(c.grade), fontSize: '0.68rem', height: 20 }} />
                  </TableCell>
                  <TableCell sx={cellSx(c.score, 7, 5)}>{c.score?.toFixed(1) ?? '—'}</TableCell>
                  <TableCell sx={{ fontFamily: 'monospace' }}>{c.taskCount ?? 0}</TableCell>
                  <TableCell sx={cellSx(sr, 80, 60)}>{sr.toFixed(0)}%</TableCell>
                  <TableCell sx={{ fontFamily: 'monospace', color: '#64748b' }}>
                    {c.avgResponseTime ? `${(c.avgResponseTime / 1000).toFixed(1)}s` : '—'}
                  </TableCell>
                  <TableCell sx={cellSx(100 - (c.load || 0), 70, 40)}>
                    {c.load != null ? `${c.load}%` : '—'}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <Snackbar open={!!snack} autoHideDuration={3000} onClose={() => setSnack('')}
        message={snack}
        action={<IconButton size="small" color="inherit" onClick={() => setSnack('')}><CloseIcon fontSize="small" /></IconButton>}
      />
    </Box>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CONSTITUTION TAB
// ─────────────────────────────────────────────────────────────────────────────
function ConstitutionTab() {
  const [rules, setRules]             = useState([]);
  const [loading, setLoading]         = useState(false);
  const [err, setErr]                 = useState('');
  const [createOpen, setCreateOpen]   = useState(false);
  const [sandboxOpen, setSandboxOpen] = useState(false);
  const [sbForm, setSbForm]           = useState({ agentId: '', toolName: '', params: '{}' });
  const [verdict, setVerdict]         = useState(null);
  const [sbLoading, setSbLoading]     = useState(false);
  const [form, setForm]               = useState({
    code: '', title: '', description: '', authority: 'soft', category: '', action: 'BLOCK', active: true,
  });
  const [snack, setSnack] = useState('');
  const [editDialog, setEditDialog] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', description: '', authority: 'soft', category: '', action: 'BLOCK' });

  const load = useCallback(async () => {
    setLoading(true); setErr('');
    try {
      const data = await api.get('/rules');
      setRules(Array.isArray(data) ? data : []);
    } catch (e) { setErr(e.response?.data?.message || e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const seed = async () => {
    try { await api.post('/rules/seed', {}); setSnack('Bedrock rules seeded'); load(); }
    catch (e) { setErr(e.response?.data?.message || e.message); }
  };

  const editRule = async () => {
    try {
      await api.patch(`/rules/${editDialog._id}`, editForm);
      setEditDialog(null);
      setSnack('Rule updated');
      load();
    } catch (e) { setErr(e.response?.data?.message || e.message); }
  };

  const createRule = async () => {
    try {
      await api.post('/rules', form);
      setCreateOpen(false);
      setForm({ code: '', title: '', description: '', authority: 'soft', category: '', action: 'BLOCK', active: true });
      setSnack('Rule created'); load();
    } catch (e) { setErr(e.response?.data?.message || e.message); }
  };

  const toggleActive = async rule => {
    try { await api.patch(`/rules/${rule._id}`, { active: !rule.active }); load(); }
    catch (e) { setErr(e.response?.data?.message || e.message); }
  };

  const runVerdict = async () => {
    setSbLoading(true); setVerdict(null);
    try {
      let params = {};
      try { params = JSON.parse(sbForm.params); } catch (_) {}
      const r = await api.post('/rules/test', { agentId: sbForm.agentId, toolName: sbForm.toolName, params });
      setVerdict(r);
    } catch (e) { setErr(e.response?.data?.message || e.message); }
    finally { setSbLoading(false); }
  };

  const authColor = a => ({ hard: 'error', soft: 'warning', advisory: 'info' }[a] || 'default');

  return (
    <Box>
      {err && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setErr('')}>{err}</Alert>}

      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <GavelIcon sx={{ color: '#ef4444' }} />
          <Typography variant="h6" sx={{ fontWeight: 700 }}>Constitutional Rules</Typography>
          <Chip label={rules.length} size="small" sx={{ bgcolor: alpha('#ef4444', 0.15), color: '#f87171' }} />
        </Stack>
        <Stack direction="row" spacing={1}>
          <Button size="small" variant="outlined" onClick={() => setSandboxOpen(true)}>Verdict Sandbox</Button>
          <Button size="small" variant="outlined" onClick={seed}>Seed Bedrock</Button>
          <Button size="small" variant="contained" startIcon={<AddIcon />} onClick={() => setCreateOpen(true)}>New Rule</Button>
          <IconButton size="small" onClick={load}><RefreshIcon /></IconButton>
        </Stack>
      </Stack>

      {loading && <LinearProgress sx={{ mb: 2 }} />}

      <TableContainer component={Paper} elevation={0} sx={{ ...GLASS() }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ '& th': { color: '#475569', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.08em' } }}>
              <TableCell>Code</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Authority</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Action</TableCell>
              <TableCell>Active</TableCell>
              <TableCell>Edit</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rules.map(r => (
              <TableRow key={r._id} sx={{ '&:hover': { bgcolor: alpha('#ffffff', 0.02) } }}>
                <TableCell>
                  <Typography variant="caption" sx={{ fontFamily: 'monospace', color: '#818cf8' }}>
                    {r.code || r._id?.slice(-6)}
                  </Typography>
                </TableCell>
                <TableCell><Typography variant="body2">{r.title || r.description}</Typography></TableCell>
                <TableCell>
                  <Chip size="small" label={r.authority} color={authColor(r.authority)} sx={{ height: 20, fontSize: '0.65rem' }} />
                </TableCell>
                <TableCell>
                  <Chip size="small" label={r.category || '—'} variant="outlined" sx={{ height: 20, fontSize: '0.65rem' }} />
                </TableCell>
                <TableCell>
                  <Typography variant="caption" sx={{ fontFamily: 'monospace', color: r.action === 'BLOCK' ? '#f87171' : '#34d399' }}>
                    {r.action}
                  </Typography>
                </TableCell>
                <TableCell>
                  <FormControlLabel
                    control={<Switch checked={r.active !== false} size="small" color="success" onChange={() => toggleActive(r)} />}
                    label="" sx={{ m: 0 }}
                  />
                </TableCell>
                <TableCell>
                  <Tooltip title="Edit rule">
                    <IconButton size="small" sx={{ color: '#818cf8' }} onClick={() => {
                      setEditDialog(r);
                      setEditForm({ title: r.title || '', description: r.description || '', authority: r.authority || 'soft', category: r.category || '', action: r.action || 'BLOCK' });
                    }}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Verdict Sandbox Dialog */}
      <Dialog open={sandboxOpen} onClose={() => { setSandboxOpen(false); setVerdict(null); }} fullWidth maxWidth="sm">
        <DialogTitle sx={{ ...GRADIENT_HEADER, color: '#e2e8f0' }}>⚖️ Verdict Sandbox</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1.5}>
            <FormControl fullWidth size="small">
              <InputLabel>Agent</InputLabel>
              <Select value={sbForm.agentId} label="Agent" onChange={e => setSbForm(f => ({ ...f, agentId: e.target.value }))}>
                {AGENTS.map(a => <MenuItem key={a.id} value={a.id}>{a.emoji} {a.name}</MenuItem>)}
              </Select>
            </FormControl>
            <TextField size="small" label="Tool Name" value={sbForm.toolName}
              onChange={e => setSbForm(f => ({ ...f, toolName: e.target.value }))} fullWidth />
            <TextField size="small" label="Params (JSON)" value={sbForm.params}
              onChange={e => setSbForm(f => ({ ...f, params: e.target.value }))}
              fullWidth multiline rows={3} sx={{ '& textarea': { fontFamily: 'monospace', fontSize: '0.8rem' } }} />
            {verdict && (
              <Alert severity={verdict.verdict === 'PASS' ? 'success' : 'error'}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{verdict.verdict}</Typography>
                <Typography variant="body2">{verdict.reason}</Typography>
              </Alert>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setSandboxOpen(false); setVerdict(null); }}>Close</Button>
          <Button variant="contained" onClick={runVerdict} disabled={sbLoading}>
            {sbLoading ? <CircularProgress size={16} /> : 'Run Test'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Rule Dialog */}
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ ...GRADIENT_HEADER, color: '#e2e8f0' }}>Create Constitutional Rule</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1.5}>
            <TextField size="small" label="Code" value={form.code}
              onChange={e => setForm(f => ({ ...f, code: e.target.value }))} fullWidth placeholder="SKL-001" />
            <TextField size="small" label="Title *" value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))} fullWidth required />
            <TextField size="small" label="Description" value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))} fullWidth multiline rows={2} />
            <FormControl fullWidth size="small">
              <InputLabel>Authority</InputLabel>
              <Select value={form.authority} label="Authority" onChange={e => setForm(f => ({ ...f, authority: e.target.value }))}>
                <MenuItem value="hard">Hard — always enforced</MenuItem>
                <MenuItem value="soft">Soft — override allowed</MenuItem>
                <MenuItem value="advisory">Advisory — warn only</MenuItem>
              </Select>
            </FormControl>
            <TextField size="small" label="Category" value={form.category}
              onChange={e => setForm(f => ({ ...f, category: e.target.value }))} fullWidth
              placeholder="data-access, financial, security…" />
            <FormControl fullWidth size="small">
              <InputLabel>Action on Violation</InputLabel>
              <Select value={form.action} label="Action on Violation" onChange={e => setForm(f => ({ ...f, action: e.target.value }))}>
                <MenuItem value="BLOCK">BLOCK</MenuItem>
                <MenuItem value="WARN">WARN</MenuItem>
                <MenuItem value="LOG">LOG</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={createRule} disabled={!form.title}>Create</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Rule Dialog */}
      <Dialog open={!!editDialog} onClose={() => setEditDialog(null)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ ...GRADIENT_HEADER, color: '#e2e8f0' }}>Edit Rule</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1.5 }}>
            <TextField label="Title" fullWidth value={editForm.title}
              onChange={e => setEditForm(p => ({ ...p, title: e.target.value }))} />
            <TextField label="Description" fullWidth multiline rows={3} value={editForm.description}
              onChange={e => setEditForm(p => ({ ...p, description: e.target.value }))} />
            <Stack direction="row" spacing={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Authority</InputLabel>
                <Select value={editForm.authority} label="Authority"
                  onChange={e => setEditForm(p => ({ ...p, authority: e.target.value }))}>
                  <MenuItem value="hard">Hard</MenuItem>
                  <MenuItem value="soft">Soft</MenuItem>
                  <MenuItem value="advisory">Advisory</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth size="small">
                <InputLabel>Action</InputLabel>
                <Select value={editForm.action} label="Action"
                  onChange={e => setEditForm(p => ({ ...p, action: e.target.value }))}>
                  <MenuItem value="BLOCK">BLOCK</MenuItem>
                  <MenuItem value="WARN">WARN</MenuItem>
                  <MenuItem value="LOG">LOG</MenuItem>
                </Select>
              </FormControl>
            </Stack>
            <TextField label="Category" fullWidth size="small" value={editForm.category}
              onChange={e => setEditForm(p => ({ ...p, category: e.target.value }))} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog(null)}>Cancel</Button>
          <Button variant="contained" onClick={editRule}
            disabled={!editForm.title.trim()}>Save Changes</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={!!snack} autoHideDuration={3000} onClose={() => setSnack('')}
        message={snack}
        action={<IconButton size="small" color="inherit" onClick={() => setSnack('')}><CloseIcon fontSize="small" /></IconButton>}
      />
    </Box>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// COUNCIL TAB
// ─────────────────────────────────────────────────────────────────────────────
function CouncilTab() {
  const [votes, setVotes]           = useState([]);
  const [pastVotes, setPastVotes]   = useState([]);
  const [pastOpen, setPastOpen]     = useState(false);
  const [loading, setLoading]       = useState(false);
  const [err, setErr]               = useState('');
  const [castDialog, setCastDialog] = useState(null);
  const [overDialog, setOverDialog] = useState(null);
  const [castForm, setCastForm]     = useState({ voter: '', vote: 'yes', rationale: '' });
  const [overForm, setOverForm]     = useState({ decision: 'approved', rationale: '' });
  const [snack, setSnack]           = useState('');
  const [createVoteOpen, setCreateVoteOpen] = useState(false);
  const [createVoteForm, setCreateVoteForm] = useState({ subject: '', proposingAgentId: '', quorum: 3, expiresAt: '' });

  const load = useCallback(async () => {
    setLoading(true); setErr('');
    try {
      const [open, past] = await Promise.all([
        api.get('/votes?status=open'),
        api.get('/votes?status=closed').catch(() => []),
      ]);
      setVotes(Array.isArray(open) ? open : []);
      setPastVotes(Array.isArray(past) ? past : []);
    } catch (e) { setErr(e.response?.data?.message || e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const createVote = async () => {
    try {
      await api.post('/votes', createVoteForm);
      setCreateVoteOpen(false);
      setCreateVoteForm({ subject: '', proposingAgentId: '', quorum: 3, expiresAt: '' });
      setSnack('Vote created');
      load();
    } catch (e) { setErr(e.response?.data?.message || e.message); }
  };

  const castVote = async () => {
    const id = castDialog?.voteId || castDialog?._id;
    try {
      await api.post(`/votes/${id}/cast`, castForm);
      setCastDialog(null); setCastForm({ voter: '', vote: 'yes', rationale: '' });
      setSnack('Vote cast'); load();
    } catch (e) { setErr(e.response?.data?.message || e.message); }
  };

  const doOverride = async () => {
    const id = overDialog?.voteId || overDialog?._id;
    try {
      await api.post(`/votes/${id}/override`, overForm);
      setOverDialog(null); setOverForm({ decision: 'approved', rationale: '' });
      setSnack('Override applied'); load();
    } catch (e) { setErr(e.response?.data?.message || e.message); }
  };

  const tally = async id => {
    try { await api.post(`/votes/${id}/tally`, {}); setSnack('Vote tallied'); load(); }
    catch (e) { setErr(e.response?.data?.message || e.message); }
  };

  function VoteCard({ v, isOpen }) {
    const id       = v.voteId || v._id;
    const proposer = resolveAgent(v.proposingAgentId);
    const yes      = (v.castVotes || []).filter(cv => cv.vote === 'yes').length;
    const no       = (v.castVotes || []).filter(cv => cv.vote === 'no').length;
    return (
      <Card elevation={0} sx={{ ...GLASS(), mb: 1.5, borderLeft: `3px solid ${isOpen ? '#f59e0b' : '#334155'}` }}>
        <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
          <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
            <Stack direction="row" alignItems="center" spacing={1.25} sx={{ flex: 1 }}>
              <AgentAvatar agentId={v.proposingAgentId} size={28} />
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, lineHeight: 1.3 }}>
                  {v.subject || v.proposalType || 'Council Vote'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {proposer?.name || v.proposingAgentId} · {v.castVotes?.length || 0}/{v.quorum || '?'} cast
                </Typography>
              </Box>
            </Stack>
            <Chip size="small" label={isOpen ? 'OPEN' : (v.outcome || 'closed')}
              sx={{ bgcolor: alpha(isOpen ? '#f59e0b' : '#334155', 0.2), color: isOpen ? '#fbbf24' : '#94a3b8', height: 20, fontSize: '0.65rem' }} />
          </Stack>
          <Stack direction="row" spacing={1} mt={1} flexWrap="wrap" useFlexGap alignItems="center">
            <Chip size="small" label={`✅ ${yes}`} sx={{ bgcolor: alpha('#10b981', 0.1), color: '#34d399', height: 20, fontSize: '0.65rem' }} />
            <Chip size="small" label={`❌ ${no}`}  sx={{ bgcolor: alpha('#ef4444', 0.1), color: '#f87171', height: 20, fontSize: '0.65rem' }} />
            {isOpen && (
              <Stack direction="row" spacing={0.5} sx={{ ml: 'auto' }}>
                <Button size="small" startIcon={<SendIcon />} onClick={() => setCastDialog(v)}>Cast</Button>
                <Button size="small" startIcon={<GavelIcon />} onClick={() => tally(id)}>Tally</Button>
                <Button size="small" color="warning" onClick={() => setOverDialog(v)}>Override</Button>
              </Stack>
            )}
          </Stack>
        </CardContent>
      </Card>
    );
  }

  return (
    <Box>
      {err && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setErr('')}>{err}</Alert>}

      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <GroupsIcon sx={{ color: '#f59e0b' }} />
          <Typography variant="h6" sx={{ fontWeight: 700 }}>Council</Typography>
          <Chip label={`${votes.length} open`} size="small" color={votes.length > 0 ? 'warning' : 'default'} />
        </Stack>
        <Stack direction="row" spacing={1}>
          <Button size="small" variant="contained" startIcon={<AddIcon />}
            onClick={() => setCreateVoteOpen(true)}
            sx={{ bgcolor: '#f59e0b', '&:hover': { bgcolor: '#d97706' } }}>
            New Vote
          </Button>
          <IconButton size="small" onClick={load}><RefreshIcon /></IconButton>
        </Stack>
      </Stack>

      {loading && <LinearProgress sx={{ mb: 2 }} />}

      {votes.length === 0 && !loading && (
        <Box sx={{ textAlign: 'center', py: 4, color: '#475569' }}>
          <GroupsIcon sx={{ fontSize: 36, opacity: 0.25 }} />
          <Typography variant="body2" sx={{ mt: 1 }}>No open votes</Typography>
        </Box>
      )}

      {votes.map(v => <VoteCard key={v.voteId || v._id} v={v} isOpen />)}

      <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.07)' }} />

      <Button
        size="small"
        startIcon={pastOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        onClick={() => setPastOpen(o => !o)}
        sx={{ color: '#64748b' }}
      >
        Past Votes ({pastVotes.length})
      </Button>
      <Collapse in={pastOpen}>
        <Box mt={1}>
          {pastVotes.slice(0, 10).map(v => <VoteCard key={v.voteId || v._id} v={v} isOpen={false} />)}
          {pastVotes.length === 0 && <Typography variant="caption" color="text.secondary">None found.</Typography>}
        </Box>
      </Collapse>

      {/* Cast Vote Dialog */}
      <Dialog open={!!castDialog} onClose={() => setCastDialog(null)} fullWidth maxWidth="xs">
        <DialogTitle>Cast Vote · {castDialog?.subject}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField size="small" label="Your Agent ID" value={castForm.voter}
              onChange={e => setCastForm(f => ({ ...f, voter: e.target.value }))} fullWidth />
            <FormControl fullWidth size="small">
              <InputLabel>Vote</InputLabel>
              <Select value={castForm.vote} label="Vote" onChange={e => setCastForm(f => ({ ...f, vote: e.target.value }))}>
                <MenuItem value="yes">✅ Yes</MenuItem>
                <MenuItem value="no">❌ No</MenuItem>
                <MenuItem value="abstain">⬜ Abstain</MenuItem>
              </Select>
            </FormControl>
            <TextField size="small" label="Rationale" value={castForm.rationale}
              onChange={e => setCastForm(f => ({ ...f, rationale: e.target.value }))} fullWidth multiline rows={2} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCastDialog(null)}>Cancel</Button>
          <Button variant="contained" onClick={castVote}>Cast</Button>
        </DialogActions>
      </Dialog>

      {/* Override Dialog */}
      <Dialog open={!!overDialog} onClose={() => setOverDialog(null)} fullWidth maxWidth="xs">
        <DialogTitle>⚠️ Human Override</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>Human override supersedes all agent votes.</Alert>
          <Stack spacing={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Decision</InputLabel>
              <Select value={overForm.decision} label="Decision" onChange={e => setOverForm(f => ({ ...f, decision: e.target.value }))}>
                <MenuItem value="approved">Approved</MenuItem>
                <MenuItem value="rejected">Rejected</MenuItem>
              </Select>
            </FormControl>
            <TextField size="small" label="Rationale *" value={overForm.rationale}
              onChange={e => setOverForm(f => ({ ...f, rationale: e.target.value }))} fullWidth multiline rows={2} required />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOverDialog(null)}>Cancel</Button>
          <Button variant="contained" color="warning" onClick={doOverride} disabled={!overForm.rationale}>Override</Button>
        </DialogActions>
      </Dialog>

      {/* Create Vote Dialog */}
      <Dialog open={createVoteOpen} onClose={() => setCreateVoteOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ ...GRADIENT_HEADER, color: '#e2e8f0' }}>Create New Vote</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1.5 }}>
            <TextField label="Subject" fullWidth multiline rows={2}
              value={createVoteForm.subject}
              onChange={e => setCreateVoteForm(p => ({ ...p, subject: e.target.value }))} />
            <FormControl fullWidth size="small">
              <InputLabel>Proposing Agent</InputLabel>
              <Select value={createVoteForm.proposingAgentId} label="Proposing Agent"
                onChange={e => setCreateVoteForm(p => ({ ...p, proposingAgentId: e.target.value }))}>
                {AGENTS.map(a => (
                  <MenuItem key={a.id} value={a.id}>{a.emoji} {a.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField label="Quorum" type="number" fullWidth size="small"
              inputProps={{ min: 1, max: 18 }}
              value={createVoteForm.quorum}
              onChange={e => setCreateVoteForm(p => ({ ...p, quorum: Number(e.target.value) }))} />
            <TextField label="Expires At" type="date" fullWidth size="small"
              InputLabelProps={{ shrink: true }}
              value={createVoteForm.expiresAt}
              onChange={e => setCreateVoteForm(p => ({ ...p, expiresAt: e.target.value }))} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateVoteOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={createVote}
            disabled={!createVoteForm.subject.trim()}>Create Vote</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={!!snack} autoHideDuration={3000} onClose={() => setSnack('')}
        message={snack}
        action={<IconButton size="small" color="inherit" onClick={() => setSnack('')}><CloseIcon fontSize="small" /></IconButton>}
      />
    </Box>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PROPOSALS TAB
// ─────────────────────────────────────────────────────────────────────────────
function ProposalsTab() {
  const [list, setList]               = useState([]);
  const [status, setStatus]           = useState('pending_review');
  const [loading, setLoading]         = useState(false);
  const [err, setErr]                 = useState('');
  const [decideDialog, setDecideDialog] = useState(null);
  const [rationale, setRationale]     = useState('');
  const [snack, setSnack]             = useState('');

  const load = useCallback(async () => {
    setLoading(true); setErr('');
    try {
      const data = await api.get(`/proposals?status=${status}`);
      setList(Array.isArray(data) ? data : []);
    } catch (e) { setErr(e.response?.data?.message || e.message); }
    finally { setLoading(false); }
  }, [status]);

  useEffect(() => { load(); }, [load]);

  const decide = async () => {
    const { proposal, action } = decideDialog;
    const id = proposal.proposalId || proposal._id;
    try {
      await api.post(`/proposals/${id}/${action}`, { rationale });
      setDecideDialog(null); setRationale('');
      setSnack(`Proposal ${action}d`); load();
    } catch (e) { setErr(e.response?.data?.message || e.message); }
  };

  const riskColor = r => ({ high: '#ef4444', medium: '#f59e0b', low: '#10b981' }[r] || '#64748b');
  const typeColor = t => ({
    feature_proposal: '#6366f1', rule_change: '#f59e0b',
    agent_spawn: '#10b981', config_change: '#3b82f6',
  }[t] || '#64748b');

  return (
    <Box>
      {err && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setErr('')}>{err}</Alert>}

      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <CheckCircleIcon sx={{ color: '#6366f1' }} />
          <Typography variant="h6" sx={{ fontWeight: 700 }}>Proposals</Typography>
          <Chip label={list.length} size="small" sx={{ bgcolor: alpha('#6366f1', 0.15), color: '#a5b4fc' }} />
        </Stack>
        <Stack direction="row" spacing={1} alignItems="center">
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <Select value={status} onChange={e => setStatus(e.target.value)}>
              <MenuItem value="pending_review">Pending Review</MenuItem>
              <MenuItem value="in_council">In Council</MenuItem>
              <MenuItem value="approved">Approved</MenuItem>
              <MenuItem value="rejected">Rejected</MenuItem>
            </Select>
          </FormControl>
          <IconButton size="small" onClick={load}><RefreshIcon /></IconButton>
        </Stack>
      </Stack>

      {loading && <LinearProgress sx={{ mb: 2 }} />}

      {list.map(p => {
        const ag   = resolveAgent(p.proposingAgentId);
        const conf = p.confidenceScore || p.confidence || 0;
        return (
          <Card key={p.proposalId || p._id} elevation={0}
            sx={{ ...GLASS(), mb: 1.5, borderLeft: `3px solid ${typeColor(p.type)}` }}>
            <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
              <Stack direction="row" alignItems="flex-start" spacing={1.5}>
                <AgentAvatar agentId={p.proposingAgentId} size={32} />
                <Box sx={{ flex: 1 }}>
                  <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap" useFlexGap mb={0.5}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      {p.title || (p.summary || '').slice(0, 60)}
                    </Typography>
                    <Chip size="small" label={(p.type || '').replace(/_/g, ' ')}
                      sx={{ bgcolor: alpha(typeColor(p.type), 0.15), color: typeColor(p.type), height: 18, fontSize: '0.65rem' }} />
                    <Chip size="small" label={`risk: ${p.riskLevel || '?'}`}
                      sx={{ bgcolor: alpha(riskColor(p.riskLevel), 0.15), color: riskColor(p.riskLevel), height: 18, fontSize: '0.65rem' }} />
                  </Stack>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontSize: '0.8rem' }}>{p.summary}</Typography>
                  <Stack direction="row" alignItems="center" spacing={1} mb={0.5}>
                    <Typography variant="caption" color="text.secondary">Confidence:</Typography>
                    <LinearProgress
                      variant="determinate" value={Math.round(conf * 100)}
                      sx={{
                        flex: 1, maxWidth: 100, height: 4, borderRadius: 2,
                        bgcolor: alpha('#ffffff', 0.07),
                        '& .MuiLinearProgress-bar': {
                          bgcolor: conf > 0.7 ? '#10b981' : conf > 0.4 ? '#f59e0b' : '#ef4444',
                        },
                      }}
                    />
                    <Typography variant="caption" sx={{ fontFamily: 'monospace', color: '#94a3b8' }}>
                      {(conf * 100).toFixed(0)}%
                    </Typography>
                  </Stack>
                  <Typography variant="caption" color="text.secondary">
                    by {ag?.name || p.proposingAgentId}
                  </Typography>
                </Box>
              </Stack>
              {status === 'pending_review' && (
                <Stack direction="row" spacing={1} mt={1.5} justifyContent="flex-end">
                  <Button size="small" color="success" startIcon={<CheckCircleIcon />}
                    onClick={() => { setDecideDialog({ proposal: p, action: 'approve' }); setRationale(''); }}>
                    Approve
                  </Button>
                  <Button size="small" color="error" startIcon={<BlockIcon />}
                    onClick={() => { setDecideDialog({ proposal: p, action: 'reject' }); setRationale(''); }}>
                    Reject
                  </Button>
                </Stack>
              )}
            </CardContent>
          </Card>
        );
      })}

      {list.length === 0 && !loading && (
        <Box sx={{ textAlign: 'center', py: 4, color: '#475569' }}>
          <CheckCircleIcon sx={{ fontSize: 36, opacity: 0.25 }} />
          <Typography variant="body2" sx={{ mt: 1 }}>No proposals with status: {status}</Typography>
        </Box>
      )}

      <Dialog open={!!decideDialog} onClose={() => setDecideDialog(null)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ color: decideDialog?.action === 'approve' ? '#34d399' : '#f87171' }}>
          {decideDialog?.action === 'approve' ? '✅ Approve' : '❌ Reject'} Proposal
        </DialogTitle>
        <DialogContent>
          <TextField autoFocus label="Rationale *" value={rationale}
            onChange={e => setRationale(e.target.value)}
            fullWidth multiline rows={3} sx={{ mt: 1 }} required />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDecideDialog(null)}>Cancel</Button>
          <Button variant="contained" color={decideDialog?.action === 'approve' ? 'success' : 'error'}
            onClick={decide} disabled={!rationale}>
            Confirm {decideDialog?.action}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={!!snack} autoHideDuration={3000} onClose={() => setSnack('')}
        message={snack}
        action={<IconButton size="small" color="inherit" onClick={() => setSnack('')}><CloseIcon fontSize="small" /></IconButton>}
      />
    </Box>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// AGENTS TAB
// ─────────────────────────────────────────────────────────────────────────────
function AgentsTab() {
  const [agents, setAgents]         = useState([]);
  const [loading, setLoading]       = useState(false);
  const [err, setErr]               = useState('');
  const [spawnOpen, setSpawnOpen]   = useState(false);
  const [fireTarget, setFireTarget] = useState(null);
  const [fireReason, setFireReason] = useState('');
  const [spawnForm, setSpawnForm]   = useState({ role: '', agentName: '', capabilities: '' });
  const [snack, setSnack]           = useState('');

  const load = useCallback(async () => {
    setLoading(true); setErr('');
    try {
      const data = await api.get('/agents');
      setAgents(Array.isArray(data) ? data : []);
    } catch (e) { setErr(e.response?.data?.message || e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const agentAction = useCallback(async (agentId, verb, payload = {}) => {
    try {
      await api.post(`/agents/${agentId}/${verb}`, payload);
      setSnack(`${agentId}: ${verb}`); load();
    } catch (e) { setErr(e.response?.data?.message || e.message); }
  }, [load]);

  const doFire = async () => {
    await agentAction(fireTarget, 'fire', { reason: fireReason });
    setFireTarget(null); setFireReason('');
  };

  const spawn = async () => {
    try {
      const caps = spawnForm.capabilities.split(',').map(s => s.trim()).filter(Boolean);
      await api.post('/agents/spawn', { ...spawnForm, capabilities: caps });
      setSpawnOpen(false);
      setSpawnForm({ role: '', agentName: '', capabilities: '' });
      setSnack('Agent spawned'); load();
    } catch (e) { setErr(e.response?.data?.message || e.message); }
  };

  const cleanup = async () => {
    try {
      await api.post('/agents/cleanup-ephemeral', {});
      setSnack('Ephemeral agents cleaned'); load();
    } catch (e) { setErr(e.response?.data?.message || e.message); }
  };

  const scColor = s =>
    ({ active: '#10b981', idle: '#3b82f6', busy: '#f59e0b', error: '#ef4444', disabled: '#64748b' }[s] || '#64748b');

  return (
    <Box>
      {err && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setErr('')}>{err}</Alert>}

      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <SmartToyIcon sx={{ color: '#10b981' }} />
          <Typography variant="h6" sx={{ fontWeight: 700 }}>Agent Roster</Typography>
          <Chip label={agents.length} size="small" sx={{ bgcolor: alpha('#10b981', 0.15), color: '#34d399' }} />
        </Stack>
        <Stack direction="row" spacing={1}>
          <Button size="small" variant="outlined" onClick={cleanup} sx={{ borderColor: '#f59e0b', color: '#fbbf24' }}>
            Cleanup Ephemeral
          </Button>
          <Button size="small" variant="contained" startIcon={<AddIcon />} onClick={() => setSpawnOpen(true)}
            sx={{ bgcolor: '#10b981', '&:hover': { bgcolor: '#059669' } }}>
            Spawn
          </Button>
          <IconButton size="small" onClick={load}><RefreshIcon /></IconButton>
        </Stack>
      </Stack>

      {loading && <LinearProgress sx={{ mb: 2 }} />}

      <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
        {agents.map(a => {
          const reg = resolveAgent(a.agentId);
          const sc  = scColor(a.enabled === false ? 'disabled' : (a.status || 'idle'));
          const borderColor = reg?.color || sc;
          return (
            <Card key={a.agentId} elevation={0} sx={{
              ...GLASS(), flex: '1 1 200px',
              border: `1px solid ${alpha(borderColor, 0.2)}`,
              borderTop: `3px solid ${borderColor}`,
              '&:hover': { boxShadow: `0 0 16px ${alpha(borderColor, 0.2)}`, transition: 'box-shadow 0.3s ease' },
            }}>
              <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.25 } }}>
                <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                  <AgentAvatar agentId={a.agentId} size={36} />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, lineHeight: 1.2 }} noWrap>
                      {reg?.name || a.agentName || a.agentId}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.2 }} noWrap>
                      {reg?.role || a.role || a.domain || '—'}
                    </Typography>
                  </Box>
                </Stack>
                <Stack direction="row" spacing={0.5} mb={1} flexWrap="wrap" useFlexGap>
                  <Chip size="small"
                    label={a.enabled === false ? 'disabled' : (a.status || 'active')}
                    sx={{ bgcolor: alpha(sc, 0.15), color: sc, height: 18, fontSize: '0.65rem' }}
                  />
                  {a.ephemeral && (
                    <Chip size="small" label="ephemeral" variant="outlined" sx={{ height: 18, fontSize: '0.65rem' }} />
                  )}
                </Stack>
                <Divider sx={{ mb: 0.75, borderColor: 'rgba(255,255,255,0.06)' }} />
                <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                  <Tooltip title="Enable">
                    <IconButton size="small" onClick={() => agentAction(a.agentId, 'enable')} sx={{ color: '#34d399' }}>
                      <CheckCircleIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Disable">
                    <IconButton size="small" onClick={() => agentAction(a.agentId, 'disable')} sx={{ color: '#fbbf24' }}>
                      <BlockIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Fire agent">
                    <IconButton size="small"
                      onClick={() => { setFireTarget(a.agentId); setFireReason(''); }}
                      sx={{ color: '#f87171' }}>
                      <FireIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </CardContent>
            </Card>
          );
        })}
      </Stack>

      {agents.length === 0 && !loading && (
        <Box sx={{ textAlign: 'center', py: 4, color: '#475569' }}>
          <SmartToyIcon sx={{ fontSize: 36, opacity: 0.25 }} />
          <Typography variant="body2" sx={{ mt: 1 }}>No agents registered</Typography>
        </Box>
      )}

      {/* Fire Dialog */}
      <Dialog open={!!fireTarget} onClose={() => setFireTarget(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ color: '#ef4444' }}>🔥 Fire Agent: {fireTarget}</DialogTitle>
        <DialogContent>
          <Alert severity="error" sx={{ mb: 2 }}>This permanently terminates the agent and cannot be undone.</Alert>
          <TextField autoFocus label="Reason (required)" value={fireReason}
            onChange={e => setFireReason(e.target.value)} fullWidth multiline rows={2} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFireTarget(null)}>Cancel</Button>
          <Button variant="contained" color="error" startIcon={<FireIcon />} onClick={doFire} disabled={!fireReason}>
            Confirm Fire
          </Button>
        </DialogActions>
      </Dialog>

      {/* Spawn Dialog */}
      <Dialog open={spawnOpen} onClose={() => setSpawnOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ ...GRADIENT_HEADER, color: '#e2e8f0' }}>Spawn New Agent</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1.5}>
            <TextField label="Role *" value={spawnForm.role}
              onChange={e => setSpawnForm(f => ({ ...f, role: e.target.value }))}
              fullWidth placeholder="analyst, optimizer, monitor…" required />
            <TextField label="Agent Name" value={spawnForm.agentName}
              onChange={e => setSpawnForm(f => ({ ...f, agentName: e.target.value }))} fullWidth />
            <TextField label="Capabilities (comma-separated)" value={spawnForm.capabilities}
              onChange={e => setSpawnForm(f => ({ ...f, capabilities: e.target.value }))}
              fullWidth placeholder="analyze, report, alert…" />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSpawnOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={spawn} disabled={!spawnForm.role}>Spawn</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={!!snack} autoHideDuration={3000} onClose={() => setSnack('')}
        message={snack}
        action={<IconButton size="small" color="inherit" onClick={() => setSnack('')}><CloseIcon fontSize="small" /></IconButton>}
      />
    </Box>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SIMULATOR TAB
// ─────────────────────────────────────────────────────────────────────────────
function SimulatorTab() {
  const [form, setForm]               = useState({ agentId: '', toolName: '', params: '{\n\n}' });
  const [result, setResult]           = useState(null);
  const [loading, setLoading]         = useState(false);
  const [err, setErr]                 = useState('');
  const [history, setHistory]         = useState([]);
  const [histLoading, setHistLoading] = useState(false);

  const loadHistory = useCallback(async () => {
    setHistLoading(true);
    try {
      const data = await api.get('/simulations');
      setHistory(Array.isArray(data) ? data : []);
    } catch (_) {}
    finally { setHistLoading(false); }
  }, []);

  useEffect(() => { loadHistory(); }, [loadHistory]);

  const runSim = async () => {
    setLoading(true); setErr(''); setResult(null);
    try {
      let params = {};
      try { params = JSON.parse(form.params); } catch (_) { throw new Error('Invalid JSON in params field'); }
      const res = await api.post('/simulate', { agentId: form.agentId, toolName: form.toolName, params });
      setResult(res); loadHistory();
    } catch (e) { setErr(e.response?.data?.message || e.message); }
    finally { setLoading(false); }
  };

  const riskColor  = r => ({ low: '#10b981', medium: '#f59e0b', high: '#ef4444', critical: '#9f1239' }[(r || '').toLowerCase()] || '#64748b');
  const riskLevel  = r => r?.riskAssessment?.level || r?.risk || 'unknown';

  return (
    <Box>
      {err && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setErr('')}>{err}</Alert>}

      <Stack direction="row" alignItems="center" spacing={1} mb={2}>
        <ScienceIcon sx={{ color: '#818cf8' }} />
        <Typography variant="h6" sx={{ fontWeight: 700 }}>Agent Simulator</Typography>
      </Stack>

      <Card elevation={0} sx={{ ...GLASS(), mb: 2 }}>
        <CardContent>
          <Typography variant="overline" sx={{ color: '#64748b', letterSpacing: '0.15em' }}>RUN SIMULATION</Typography>
          <Stack spacing={2} mt={1.5}>
            <FormControl fullWidth size="small">
              <InputLabel>Agent</InputLabel>
              <Select value={form.agentId} label="Agent" onChange={e => setForm(f => ({ ...f, agentId: e.target.value }))}>
                {AGENTS.map(a => <MenuItem key={a.id} value={a.id}>{a.emoji} {a.name}</MenuItem>)}
              </Select>
            </FormControl>
            <TextField size="small" label="Tool Name" value={form.toolName}
              onChange={e => setForm(f => ({ ...f, toolName: e.target.value }))} fullWidth
              placeholder="analyzeTransactions, generateReport…" />
            <TextField size="small" label="Parameters (JSON)" value={form.params}
              onChange={e => setForm(f => ({ ...f, params: e.target.value }))}
              fullWidth multiline rows={5}
              sx={{ '& textarea': { fontFamily: 'monospace', fontSize: '0.82rem' } }} />
            <Button
              variant="contained"
              startIcon={loading ? <CircularProgress size={15} color="inherit" /> : <FlashOnIcon />}
              onClick={runSim}
              disabled={loading || !form.agentId || !form.toolName}
              sx={{ alignSelf: 'flex-start', bgcolor: '#6366f1', '&:hover': { bgcolor: '#4f46e5' } }}
            >
              Run Simulation
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {result && (
        <Card elevation={0} sx={{ ...GLASS(), mb: 2, borderLeft: `3px solid ${riskColor(riskLevel(result))}` }}>
          <CardContent>
            <Typography variant="overline" sx={{ color: '#64748b', letterSpacing: '0.15em' }}>RESULT</Typography>
            <Stack direction="row" spacing={1} mt={1} mb={1.5} alignItems="center" flexWrap="wrap" useFlexGap>
              <Chip size="small" label={`Risk: ${riskLevel(result)}`}
                sx={{ bgcolor: alpha(riskColor(riskLevel(result)), 0.15), color: riskColor(riskLevel(result)) }} />
              {result.verdict && (
                <Chip size="small" label={result.verdict} color={result.verdict === 'PASS' ? 'success' : 'error'} />
              )}
            </Stack>
            {result.plan?.steps?.length > 0 && (
              <Box mb={1}>
                <Typography variant="caption" sx={{ color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Plan Steps
                </Typography>
                {result.plan.steps.map((step, i) => (
                  <Stack key={i} direction="row" spacing={1} alignItems="flex-start" sx={{ mt: 0.5 }}>
                    <Chip size="small" label={i + 1}
                      sx={{ width: 22, height: 20, fontSize: '0.65rem', bgcolor: alpha('#6366f1', 0.2), color: '#a5b4fc' }} />
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                      {step.action || step.description || JSON.stringify(step)}
                    </Typography>
                  </Stack>
                ))}
              </Box>
            )}
            {result.riskAssessment?.reason && (
              <Alert severity="warning" sx={{ fontSize: '0.8rem' }}>{result.riskAssessment.reason}</Alert>
            )}
          </CardContent>
        </Card>
      )}

      <Typography variant="overline" sx={{ color: '#64748b', letterSpacing: '0.12em' }}>PAST SIMULATIONS</Typography>
      {histLoading && <LinearProgress sx={{ mt: 1, mb: 1 }} />}
      <Stack spacing={1} mt={1}>
        {history.slice(0, 10).map((sim, i) => (
          <Card key={sim._id || i} elevation={0} sx={{ ...GLASS() }}>
            <CardContent sx={{ py: 1, '&:last-child': { pb: 1 } }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <AgentAvatar agentId={sim.agentId} size={22} />
                <Typography variant="caption" sx={{ fontFamily: 'monospace', flex: 1 }}>
                  {sim.agentId} → {sim.toolName}
                </Typography>
                <Chip size="small" label={riskLevel(sim)} sx={{ height: 18, fontSize: '0.65rem' }} />
                <Typography variant="caption" color="text.secondary">
                  {sim.createdAt ? new Date(sim.createdAt).toLocaleTimeString() : ''}
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        ))}
        {history.length === 0 && !histLoading && (
          <Typography variant="caption" color="text.secondary">No simulations yet.</Typography>
        )}
      </Stack>
    </Box>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// KNOWLEDGE TAB
// ─────────────────────────────────────────────────────────────────────────────
function KnowledgeTab({ onCountChange }) {
  const [q, setQ]                     = useState('');
  const [typeFilter, setTypeFilter]   = useState('all');
  const [results, setResults]         = useState([]);
  const [loading, setLoading]         = useState(false);
  const [err, setErr]                 = useState('');
  const [briefAgent, setBriefAgent]   = useState('');
  const [briefTopic, setBriefTopic]   = useState('');
  const [briefing, setBriefing]       = useState(null);
  const [upsertOpen, setUpsertOpen]   = useState(false);
  const [upsertForm, setUpsertForm]   = useState({ label: '', type: 'concept', summary: '', tags: '', confidence: '1.0' });
  const [snack, setSnack]             = useState('');

  const search = useCallback(async () => {
    setLoading(true); setErr('');
    try {
      const params = new URLSearchParams({ q, limit: '25' });
      if (typeFilter !== 'all') params.set('type', typeFilter);
      const data = await api.get(`/kg/search?${params.toString()}`);
      const arr = Array.isArray(data) ? data : [];
      setResults(arr);
      onCountChange?.(arr.length);
    } catch (e) { setErr(e.response?.data?.message || e.message); }
    finally { setLoading(false); }
  }, [q, typeFilter, onCountChange]);

  useEffect(() => { search(); }, [search]);

  const getBriefing = async () => {
    if (!briefAgent) return;
    setLoading(true);
    try {
      const suffix = briefTopic ? `?topic=${encodeURIComponent(briefTopic)}` : '';
      const data = await api.get(`/kg/briefing/${encodeURIComponent(briefAgent)}${suffix}`);
      setBriefing(data);
    } catch (e) { setErr(e.response?.data?.message || e.message); }
    finally { setLoading(false); }
  };

  const upsert = async () => {
    try {
      const tags = upsertForm.tags.split(',').map(s => s.trim()).filter(Boolean);
      await api.post('/kg/upsert', { ...upsertForm, tags, confidence: parseFloat(upsertForm.confidence) });
      setUpsertOpen(false);
      setUpsertForm({ label: '', type: 'concept', summary: '', tags: '', confidence: '1.0' });
      setSnack('Knowledge node upserted'); search();
    } catch (e) { setErr(e.response?.data?.message || e.message); }
  };

  const nodeTypeColor = t => ({
    user: '#3b82f6', feature: '#10b981', incident: '#ef4444', vendor: '#f59e0b',
    goal: '#6366f1', concept: '#8b5cf6', agent: '#ec4899', document: '#0ea5e9',
    event: '#14b8a6', metric: '#f97316', rule: '#d97706',
  }[t] || '#64748b');

  return (
    <Box>
      {err && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setErr('')}>{err}</Alert>}

      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <HubIcon sx={{ color: '#8b5cf6' }} />
          <Typography variant="h6" sx={{ fontWeight: 700 }}>Knowledge Graph</Typography>
          <Chip label={`${results.length} nodes`} size="small" sx={{ bgcolor: alpha('#8b5cf6', 0.15), color: '#c4b5fd' }} />
        </Stack>
        <Button size="small" variant="outlined" startIcon={<AddIcon />} onClick={() => setUpsertOpen(true)}>
          Upsert Node
        </Button>
      </Stack>

      {/* Search bar */}
      <Card elevation={0} sx={{ ...GLASS(), mb: 2 }}>
        <CardContent>
          <Stack direction="row" spacing={1} alignItems="center">
            <TextField
              size="small" placeholder="Search knowledge graph…" value={q}
              onChange={e => setQ(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && search()}
              sx={{ flex: 1 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#64748b', fontSize: 18 }} />
                  </InputAdornment>
                ),
              }}
            />
            <FormControl size="small" sx={{ minWidth: 110 }}>
              <Select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
                {KG_TYPES.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
              </Select>
            </FormControl>
            <IconButton size="small" onClick={search}><SearchIcon /></IconButton>
          </Stack>
        </CardContent>
      </Card>

      {/* Briefing */}
      <Card elevation={0} sx={{ ...GLASS(), mb: 2 }}>
        <CardContent>
          <Typography variant="overline" sx={{ color: '#64748b', letterSpacing: '0.15em' }}>AGENT BRIEFING</Typography>
          <Stack direction="row" spacing={1} mt={1.5} alignItems="center" flexWrap="wrap" useFlexGap>
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel>Agent</InputLabel>
              <Select value={briefAgent} label="Agent" onChange={e => setBriefAgent(e.target.value)}>
                {AGENTS.map(a => <MenuItem key={a.id} value={a.id}>{a.emoji} {a.name}</MenuItem>)}
              </Select>
            </FormControl>
            <TextField size="small" label="Topic (optional)" value={briefTopic}
              onChange={e => setBriefTopic(e.target.value)} sx={{ flex: 1, minWidth: 120 }} />
            <Button size="small" variant="outlined" onClick={getBriefing} disabled={!briefAgent || loading}>
              Get Briefing
            </Button>
          </Stack>
          {briefing && (
            <Box mt={2} sx={{ p: 1.5, bgcolor: alpha('#0d1117', 0.6), borderRadius: 1, border: '1px solid rgba(255,255,255,0.06)' }}>
              <Typography variant="caption" sx={{ fontFamily: 'monospace', color: '#94a3b8', whiteSpace: 'pre-wrap', fontSize: '0.75rem' }}>
                {typeof briefing === 'string' ? briefing : JSON.stringify(briefing, null, 2)}
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {loading && <LinearProgress sx={{ mb: 2 }} />}

      <Stack spacing={1}>
        {results.map((n, i) => (
          <Card key={n._id || i} elevation={0} sx={{ ...GLASS(), borderLeft: `2px solid ${nodeTypeColor(n.type)}` }}>
            <CardContent sx={{ py: 1, '&:last-child': { pb: 1 } }}>
              <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap" useFlexGap>
                <Chip size="small" label={n.type || 'unknown'}
                  sx={{ bgcolor: alpha(nodeTypeColor(n.type), 0.15), color: nodeTypeColor(n.type), height: 18, fontSize: '0.65rem' }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 600, flex: 1 }}>
                  {n.label || n.subject || n.title || `node-${i}`}
                </Typography>
                {n.confidence != null && (
                  <Chip size="small" label={`${Math.round(n.confidence * 100)}%`}
                    sx={{ height: 18, fontSize: '0.65rem', color: '#94a3b8' }} />
                )}
              </Stack>
              {n.summary && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontSize: '0.78rem' }}>{n.summary}</Typography>
              )}
              {n.tags?.length > 0 && (
                <Stack direction="row" spacing={0.5} mt={0.5} flexWrap="wrap" useFlexGap>
                  {n.tags.map(t => (
                    <Chip key={t} size="small" label={`#${t}`} variant="outlined" sx={{ height: 16, fontSize: '0.6rem' }} />
                  ))}
                </Stack>
              )}
              {n.lastObservedAt && (
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25 }}>
                  Last seen: {new Date(n.lastObservedAt).toLocaleDateString()}
                </Typography>
              )}
            </CardContent>
          </Card>
        ))}
        {results.length === 0 && !loading && (
          <Box sx={{ textAlign: 'center', py: 3, color: '#475569' }}>
            <HubIcon sx={{ fontSize: 32, opacity: 0.25 }} />
            <Typography variant="body2" sx={{ mt: 1 }}>No nodes found. Try a different query.</Typography>
          </Box>
        )}
      </Stack>

      {/* Upsert Dialog */}
      <Dialog open={upsertOpen} onClose={() => setUpsertOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ ...GRADIENT_HEADER, color: '#e2e8f0' }}>Upsert Knowledge Node</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1.5}>
            <TextField size="small" label="Label *" value={upsertForm.label}
              onChange={e => setUpsertForm(f => ({ ...f, label: e.target.value }))} fullWidth required />
            <FormControl fullWidth size="small">
              <InputLabel>Type</InputLabel>
              <Select value={upsertForm.type} label="Type" onChange={e => setUpsertForm(f => ({ ...f, type: e.target.value }))}>
                {KG_TYPES.filter(t => t !== 'all').map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
              </Select>
            </FormControl>
            <TextField size="small" label="Summary" value={upsertForm.summary}
              onChange={e => setUpsertForm(f => ({ ...f, summary: e.target.value }))} fullWidth multiline rows={2} />
            <TextField size="small" label="Tags (comma-separated)" value={upsertForm.tags}
              onChange={e => setUpsertForm(f => ({ ...f, tags: e.target.value }))} fullWidth />
            <TextField size="small" label="Confidence (0–1)" type="number" value={upsertForm.confidence}
              onChange={e => setUpsertForm(f => ({ ...f, confidence: e.target.value }))}
              inputProps={{ min: 0, max: 1, step: 0.1 }} fullWidth />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUpsertOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={upsert} disabled={!upsertForm.label}>Upsert</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={!!snack} autoHideDuration={3000} onClose={() => setSnack('')}
        message={snack}
        action={<IconButton size="small" color="inherit" onClick={() => setSnack('')}><CloseIcon fontSize="small" /></IconButton>}
      />
    </Box>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// INVESTOR TAB
// ─────────────────────────────────────────────────────────────────────────────
function InvestorTab() {
  const [reports, setReports]     = useState([]);
  const [loading, setLoading]     = useState(false);
  const [err, setErr]             = useState('');
  const [genPeriod, setGenPeriod] = useState('month');
  const [output, setOutput]       = useState('');
  const [snack, setSnack]         = useState('');

  const load = useCallback(async () => {
    setLoading(true); setErr('');
    try {
      const data = await api.get('/investor-reports');
      setReports(Array.isArray(data) ? data : []);
    } catch (e) { setErr(e.response?.data?.message || e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const generate = async () => {
    try {
      await api.post('/investor-reports/generate', { period: genPeriod });
      setSnack(`Report (${genPeriod}) generation started`); load();
    } catch (e) { setErr(e.response?.data?.message || e.message); }
  };

  const distribute = async id => {
    try {
      const r = await api.post(`/investor-reports/${id}/distribute`, {});
      setSnack(`Distributed: ${r?.sent ?? '?'}/${r?.total ?? '?'}`); load();
    } catch (e) { setErr(e.response?.data?.message || e.message); }
  };

  const runTrigger = async (path, label) => {
    setOutput(`⏳ Running ${label}…`);
    try {
      const r = await api.post(path, {});
      setOutput(`✅ ${label} complete\n${JSON.stringify(r, null, 2)}`);
      setSnack(`${label} triggered`);
    } catch (e) {
      setOutput(`❌ ${label} failed: ${e.response?.data?.message || e.message}`);
    }
  };

  return (
    <Box>
      {err && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setErr('')}>{err}</Alert>}

      <Stack direction="row" alignItems="center" spacing={1} mb={2}>
        <AccountBalanceIcon sx={{ color: '#10b981' }} />
        <Typography variant="h6" sx={{ fontWeight: 700 }}>Investor Relations</Typography>
      </Stack>

      {/* Generate report */}
      <Card elevation={0} sx={{ ...GLASS(), mb: 2 }}>
        <CardContent>
          <Typography variant="overline" sx={{ color: '#64748b', letterSpacing: '0.15em' }}>GENERATE REPORT</Typography>
          <Stack direction="row" spacing={1.5} mt={1.5} alignItems="center">
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Period</InputLabel>
              <Select value={genPeriod} label="Period" onChange={e => setGenPeriod(e.target.value)}>
                <MenuItem value="month">Month</MenuItem>
                <MenuItem value="quarter">Quarter</MenuItem>
                <MenuItem value="year">Year</MenuItem>
              </Select>
            </FormControl>
            <Button variant="contained" onClick={generate}
              sx={{ bgcolor: '#10b981', '&:hover': { bgcolor: '#059669' } }}>
              Generate Report
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* Triggers */}
      <Card elevation={0} sx={{ ...GLASS(), mb: 2 }}>
        <CardContent>
          <Typography variant="overline" sx={{ color: '#64748b', letterSpacing: '0.15em' }}>SYSTEM TRIGGERS</Typography>
          <Stack direction="row" spacing={1.5} mt={1.5} flexWrap="wrap" useFlexGap>
            <Button variant="outlined" startIcon={<PlayArrowIcon />}
              onClick={() => runTrigger('/triggers/board-meeting', 'Board Meeting')}
              sx={{ borderColor: '#10b981', color: '#34d399' }}>
              Run Board Meeting
            </Button>
            <Button variant="outlined" startIcon={<AutoFixHighIcon />}
              onClick={() => runTrigger('/triggers/self-improvement', 'Self-Improvement Scan')}
              sx={{ borderColor: '#6366f1', color: '#a5b4fc' }}>
              Self-Improvement Scan
            </Button>
          </Stack>
          {output && (
            <Box mt={2} sx={{ p: 1.5, bgcolor: alpha('#0d1117', 0.7), borderRadius: 1, border: '1px solid rgba(255,255,255,0.06)' }}>
              <Typography variant="caption" sx={{ fontFamily: 'monospace', color: '#94a3b8', whiteSpace: 'pre-wrap', fontSize: '0.75rem' }}>
                {output}
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Reports list */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1.5}>
        <Typography variant="overline" sx={{ color: '#64748b', letterSpacing: '0.15em' }}>
          REPORTS ({reports.length})
        </Typography>
        <IconButton size="small" onClick={load}><RefreshIcon /></IconButton>
      </Stack>
      {loading && <LinearProgress sx={{ mb: 1 }} />}

      <TableContainer component={Paper} elevation={0} sx={{ ...GLASS() }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ '& th': { color: '#475569', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.08em' } }}>
              <TableCell>Title</TableCell>
              <TableCell>Period</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Created</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reports.map(r => (
              <TableRow key={r._id} sx={{ '&:hover': { bgcolor: alpha('#ffffff', 0.02) } }}>
                <TableCell><Typography variant="body2">{r.title || r._id}</Typography></TableCell>
                <TableCell>
                  <Chip size="small" label={r.period} sx={{ height: 20, fontSize: '0.65rem' }} />
                </TableCell>
                <TableCell>
                  <Chip size="small" label={r.status || '—'}
                    color={r.status === 'published' ? 'success' : r.status === 'draft' ? 'warning' : 'default'}
                    sx={{ height: 20, fontSize: '0.65rem' }} />
                </TableCell>
                <TableCell>
                  <Typography variant="caption" color="text.secondary">
                    {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '—'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Button size="small" startIcon={<SendIcon />} onClick={() => distribute(r._id)}>
                    Distribute
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {reports.length === 0 && !loading && (
        <Box sx={{ textAlign: 'center', py: 3, color: '#475569' }}>
          <AccountBalanceIcon sx={{ fontSize: 32, opacity: 0.25 }} />
          <Typography variant="body2" sx={{ mt: 1 }}>No investor reports yet.</Typography>
        </Box>
      )}

      <Snackbar open={!!snack} autoHideDuration={4000} onClose={() => setSnack('')}
        message={snack}
        action={<IconButton size="small" color="inherit" onClick={() => setSnack('')}><CloseIcon fontSize="small" /></IconButton>}
      />
    </Box>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TAB DEFINITIONS
// ─────────────────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'overview',     label: 'Overview'      },
  { id: 'okrs',         label: 'OKRs'          },
  { id: 'scorecards',   label: 'Scorecards'    },
  { id: 'constitution', label: 'Constitution'  },
  { id: 'council',      label: 'Council'       },
  { id: 'proposals',    label: 'Proposals'     },
  { id: 'agents',       label: 'Agents'        },
  { id: 'simulator',    label: 'Simulator'     },
  { id: 'knowledge',    label: 'Knowledge'     },
  { id: 'investor',     label: 'Investor'      },
];

// ─────────────────────────────────────────────────────────────────────────────
// ROOT — GodModePanel
// ─────────────────────────────────────────────────────────────────────────────
export default function GodModePanel() {
  const [tab, setTab]             = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);
  const [kgCount, setKgCount]     = useState(null);
  const [lastEvent, setLastEvent] = useState(null);

  useEffect(() => {
    let active = true;
    let unsub  = null;
    (async () => {
      try {
        const ws = (await import('../../../services/websocketService')).default;
        unsub = ws.on('godmode:state-changed', data => {
          if (!active) return;
          setLastEvent(data);
          setRefreshKey(k => k + 1);
          setTimeout(() => { if (active) setLastEvent(null); }, 8000);
        });
      } catch (_) {}
    })();
    return () => { active = false; if (unsub) unsub(); };
  }, []);

  const id = TABS[tab].id;

  return (
    <Box sx={{
      p: { xs: 1.5, md: 2.5 },
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #0d1117 0%, #0f172a 100%)',
    }}>
      <GlobalStyles styles={{
        '@keyframes scanLine': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        '@keyframes glowPulse': {
          '0%, 100%': { opacity: 0.6 },
          '50%': { opacity: 1 },
        },
        '@keyframes pulseRing': {
          '0%': { transform: 'scale(0.8)', opacity: 1 },
          '100%': { transform: 'scale(2)', opacity: 0 },
        },
      }} />
      <CommandBar onRefresh={() => setRefreshKey(k => k + 1)} />

      {lastEvent && (
        <Alert severity="info" sx={{ mb: 2 }} onClose={() => setLastEvent(null)}>
          🔔 <strong>{lastEvent.event}</strong> — by{' '}
          <code>{lastEvent.payload?.adminName || 'admin'}</code> via {lastEvent.source}
          {lastEvent.at ? ` · ${new Date(lastEvent.at).toLocaleTimeString()}` : ''}
        </Alert>
      )}

      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          mb: 2.5,
          '& .MuiTab-root': {
            fontSize: '0.72rem', minWidth: 80, textTransform: 'uppercase',
            letterSpacing: '0.06em', color: '#64748b', fontWeight: 600,
          },
          '& .Mui-selected': { color: '#10b981 !important' },
          '& .MuiTabs-indicator': { bgcolor: '#10b981' },
          borderBottom: '1px solid rgba(255,255,255,0.07)',
        }}
      >
        {TABS.map((t, i) => {
          const isBadged = t.id === 'knowledge' && kgCount != null && kgCount > 0;
          return (
            <Tab
              key={t.id}
              id={`godmode-tab-${i}`}
              label={
                isBadged ? (
                  <Badge
                    badgeContent={kgCount}
                    color="primary"
                    sx={{ '& .MuiBadge-badge': { fontSize: '0.6rem', height: 16, minWidth: 16 } }}
                  >
                    {t.label}
                  </Badge>
                ) : t.label
              }
            />
          );
        })}
      </Tabs>

      <Box>
        {id === 'overview'     && <OverviewTab     key={`ov-${refreshKey}`} />}
        {id === 'okrs'         && <OKRsTab         key={`ok-${refreshKey}`} />}
        {id === 'scorecards'   && <ScorecardsTab   key={`sc-${refreshKey}`} />}
        {id === 'constitution' && <ConstitutionTab key={`co-${refreshKey}`} />}
        {id === 'council'      && <CouncilTab      key={`cv-${refreshKey}`} />}
        {id === 'proposals'    && <ProposalsTab    key={`pr-${refreshKey}`} />}
        {id === 'agents'       && <AgentsTab       key={`ag-${refreshKey}`} />}
        {id === 'simulator'    && <SimulatorTab    key={`si-${refreshKey}`} />}
        {id === 'knowledge'    && <KnowledgeTab    key={`kg-${refreshKey}`} onCountChange={setKgCount} />}
        {id === 'investor'     && <InvestorTab     key={`iv-${refreshKey}`} />}
      </Box>
    </Box>
  );
}
