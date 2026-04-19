import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Paper, Grid, Card, CardContent, Chip, Button,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Dialog, DialogTitle, DialogContent, DialogActions,
  FormControl, InputLabel, Select, MenuItem, IconButton, Tooltip,
  Alert, Divider, Tabs, Tab, LinearProgress,
  CircularProgress, Stack, alpha, useTheme,
  TextField, InputAdornment, Switch, FormControlLabel,
  Collapse, TablePagination,
} from '@mui/material';
import {
  SmartToy, Speed, Warning, CheckCircle, Error,
  Refresh, Settings, PlayArrow, Token,
  CloudQueue, Memory, ArrowForward, Circle,
  ArrowUpward, ArrowDownward, Hub, Schedule,
  Person, AdminPanelSettings, Telegram, Build,
  Search, AttachMoney, TrendingUp, AccessTime, Wifi, WifiOff,
  PauseCircle, PlayCircle, Block, PowerSettingsNew,
  Download, Tune, DeleteOutline, InfoOutlined,
  KeyboardArrowDown, KeyboardArrowUp, FilterList,
} from '@mui/icons-material';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, ResponsiveContainer, Legend,
} from 'recharts';
import websocketService from '../../services/websocketService';
import api from '../../services/api';

// ── Constants ──────────────────────────────────────────────────

const PROVIDER_META = {
  'github-models/gpt-4.1':      { label: 'GPT-4.1',       color: '#10a37f', group: 'GitHub Models', cost: 'Free' },
  'github-models/gpt-4o':       { label: 'GPT-4o',        color: '#10a37f', group: 'GitHub Models', cost: 'Free' },
  'github-models/gpt-4.1-mini': { label: 'GPT-4.1-mini',  color: '#10a37f', group: 'GitHub Models', cost: 'Free' },
  'github-models/gpt-4o-mini':  { label: 'GPT-4o-mini',   color: '#10a37f', group: 'GitHub Models', cost: 'Free' },
  'github-models/o4-mini':      { label: 'o4-mini',        color: '#10a37f', group: 'GitHub Models', cost: 'Free' },
  'claude':  { label: 'Claude Sonnet',  color: '#d97706', group: 'Anthropic', cost: 'Paid' },
  'grok':    { label: 'Grok-3',         color: '#6366f1', group: 'xAI',       cost: 'Paid' },
  'openai':  { label: 'OpenAI Direct',  color: '#10a37f', group: 'OpenAI',    cost: 'Paid' },
};

const MODEL_INFO = {
  'gpt-4.1':       { tier: '🟢 Free', note: 'Best for code — recommended primary' },
  'gpt-4.1-mini':  { tier: '🟢 Free', note: 'Faster, cheaper alternative' },
  'gpt-4.1-nano':  { tier: '🟢 Free', note: 'Ultra-fast, lightweight tasks' },
  'gpt-4o':        { tier: '🟢 Free', note: 'Multimodal, previous gen flagship' },
  'gpt-4o-mini':   { tier: '🟢 Free', note: 'Fast multimodal, low cost' },
  'gpt-5':         { tier: '🟡 Free (Limited)', note: '⚠️ 1 req/min, 8/day' },
  'gpt-5-mini':    { tier: '🟡 Free (Limited)', note: '⚠️ Heavily rate-limited' },
  'o4-mini':       { tier: '🟢 Free', note: 'Reasoning model, uses max_completion_tokens' },
  'o3-mini':       { tier: '🟢 Free', note: 'Reasoning model, previous gen' },
  'Phi-4':         { tier: '🟢 Free', note: 'Microsoft open-source 14B' },
  'Phi-4-mini':    { tier: '🟢 Free', note: 'Lightweight open-source' },
  'Meta-Llama-3.1-405B-Instruct': { tier: '🟢 Free', note: 'Meta flagship 405B' },
  'Meta-Llama-3.1-70B-Instruct':  { tier: '🟢 Free', note: 'Meta mid-tier 70B' },
  'Meta-Llama-3.1-8B-Instruct':   { tier: '🟢 Free', note: 'Meta lightweight 8B' },
  'Mistral-Large-2':       { tier: '🟢 Free', note: 'Mistral flagship' },
  'Mistral-Small':         { tier: '🟢 Free', note: 'Mistral lightweight' },
  'Cohere-command-r-plus': { tier: '🟢 Free', note: 'Cohere RAG-optimized' },
  'Cohere-command-r':      { tier: '🟢 Free', note: 'Cohere lightweight' },
  'DeepSeek-R1':           { tier: '🟢 Free', note: 'DeepSeek reasoning model' },
  'claude-sonnet-4-6':          { tier: '🔴 Paid', note: 'Latest Sonnet, best balance' },
  'claude-sonnet-4-5-20241022': { tier: '🔴 Paid', note: 'Previous Sonnet 4.5' },
  'claude-haiku-4-5':           { tier: '🔴 Paid', note: 'Fast & cheap Anthropic' },
  'claude-opus-4':              { tier: '🔴 Paid', note: 'Most capable, expensive' },
  'claude-3-5-sonnet-20241022': { tier: '🔴 Paid', note: 'Claude 3.5 Sonnet' },
  'claude-3-5-haiku-20241022':  { tier: '🔴 Paid', note: 'Claude 3.5 Haiku' },
  'claude-3-opus-20240229':     { tier: '🔴 Paid', note: 'Claude 3 Opus' },
  'grok-3':      { tier: '🔴 Paid', note: 'xAI flagship' },
  'grok-3-mini': { tier: '🔴 Paid', note: 'xAI lightweight' },
  'grok-2':      { tier: '🔴 Paid', note: 'Previous gen' },
};

const SERVICE_META = {
  'user-chat':      { label: 'Keeper AI Chat',         category: 'User-Facing', icon: <Person />,             trigger: 'User message',          frequency: 'Per message',          maxCalls: 1,   maxTokens: 512   },
  'cortex-chat':    { label: 'Cortex Advisor',          category: 'User-Facing', icon: <Person />,             trigger: 'User message',          frequency: 'Per message',          maxCalls: 1,   maxTokens: 512   },
  'insights-chat':  { label: 'Insights Q&A',            category: 'User-Facing', icon: <Person />,             trigger: 'User question',         frequency: 'Per question',         maxCalls: 1,   maxTokens: 350   },
  'insights-generation': { label: 'AI Insights Gen',   category: 'User-Facing', icon: <SmartToy />,           trigger: 'Page load',             frequency: 'Per load (1hr cache)', maxCalls: 1,   maxTokens: 2048  },
  'telegram':       { label: 'Telegram Bot',            category: 'Admin',       icon: <Telegram />,           trigger: 'Admin message',         frequency: 'Per message',          maxCalls: 5,   maxTokens: 1024  },
  'intent-classifier': { label: 'Intent Classifier',   category: 'Admin',       icon: <AdminPanelSettings />, trigger: 'Admin command',         frequency: 'Per command',          maxCalls: 1,   maxTokens: 200   },
  'ai-admin-agent': { label: 'Admin AI Agent',          category: 'Admin',       icon: <AdminPanelSettings />, trigger: 'Admin /cortex',         frequency: 'Per question',         maxCalls: 1,   maxTokens: 1024  },
  'reply-ticket':   { label: 'Ticket Reply',            category: 'Admin',       icon: <AdminPanelSettings />, trigger: 'Ticket reply',          frequency: 'Per ticket',           maxCalls: 1,   maxTokens: 512   },
  'reply-all-tickets': { label: 'Batch Ticket Reply',  category: 'Admin',       icon: <AdminPanelSettings />, trigger: 'Batch reply',           frequency: 'N per batch',          maxCalls: 'N', maxTokens: 512   },
  'nl-query':       { label: 'NL Query Engine',         category: 'Admin',       icon: <AdminPanelSettings />, trigger: 'Admin DB query',        frequency: 'Per query',            maxCalls: 1,   maxTokens: 1024  },
  'weekly-strategy-briefing': { label: 'Strategy Briefing', category: 'Scheduled', icon: <Schedule />,        trigger: 'Cron job',              frequency: 'Daily/Weekly/Monthly', maxCalls: 1,   maxTokens: 600   },
  'daily-digest':   { label: 'Daily Digest',            category: 'Scheduled',   icon: <Schedule />,           trigger: 'Cron 8AM',              frequency: 'Daily',                maxCalls: 1,   maxTokens: 600   },
  'monthly-digest': { label: 'Monthly Digest',          category: 'Scheduled',   icon: <Schedule />,           trigger: 'Cron 1st',              frequency: 'Monthly',              maxCalls: 1,   maxTokens: 600   },
  'security-analysis':  { label: 'Security Analysis',  category: 'Pipeline',    icon: <Build />,              trigger: 'Security event',        frequency: 'Per event',            maxCalls: 1,   maxTokens: 1024  },
  'financial-pipeline': { label: 'Financial Pipeline', category: 'Pipeline',    icon: <Build />,              trigger: 'Anomaly',               frequency: 'Per anomaly',          maxCalls: 1,   maxTokens: 1024  },
  'agentCodePipeline':  { label: 'Code Generation',    category: 'Pipeline',    icon: <Build />,              trigger: 'Code request',          frequency: 'Per request',          maxCalls: 1,   maxTokens: 16384 },
  'agent-pipeline': { label: 'Agent Pipeline',         category: 'Pipeline',    icon: <Build />,              trigger: 'Agent task',            frequency: 'Per task',             maxCalls: 1,   maxTokens: 1024  },
  'backend':        { label: 'Backend Service',        category: 'Pipeline',    icon: <Build />,              trigger: 'Internal',              frequency: 'Sporadic',             maxCalls: 1,   maxTokens: 1024  },
};

const CATEGORY_COLORS = {
  'User-Facing': 'success',
  'Admin':       'warning',
  'Scheduled':   'info',
  'Pipeline':    'secondary',
};

const PROVIDER_MODELS = {
  'github-models': ['gpt-4.1', 'gpt-4.1-mini', 'gpt-4.1-nano', 'gpt-4o', 'gpt-4o-mini', 'o4-mini', 'o3-mini', 'Phi-4', 'Phi-4-mini', 'Meta-Llama-3.1-405B-Instruct', 'Meta-Llama-3.1-70B-Instruct', 'Mistral-Large-2', 'DeepSeek-R1'],
  'claude':  ['claude-sonnet-4-6', 'claude-sonnet-4-5-20241022', 'claude-haiku-4-5', 'claude-opus-4', 'claude-3-5-sonnet-20241022', 'claude-3-5-haiku-20241022'],
  'grok':    ['grok-3', 'grok-3-mini', 'grok-2'],
};

// ── Helpers ────────────────────────────────────────────────────

function formatNumber(n) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000)     return (n / 1_000).toFixed(1) + 'K';
  return String(n ?? 0);
}

function _timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 60000)    return 'just now';
  if (diff < 3600000)  return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
}

// ── Analytics Tab ──────────────────────────────────────────────

function AnalyticsTab({ history, theme }) {
  const chartData = history.map(b => ({
    hour:     b.hour.slice(11) + ':00',
    requests: b.requests,
    free:     b.free,
    paid:     b.paid,
    tokens:   (b.tokens_in || 0) + (b.tokens_out || 0),
    errors:   b.errors,
  }));

  const costData = history.map(b => ({
    hour: b.hour.slice(11) + ':00',
    cost: parseFloat(((b.paid || 0) * 0.000009).toFixed(4)),
  }));

  if (!history.length) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <TrendingUp sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
        <Typography color="text.secondary">
          No hourly data yet — data accumulates as the server handles requests.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>📈 Requests (24h)</Typography>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                <defs>
                  <linearGradient id="colorFree" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#10a37f" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10a37f" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorPaid" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#d97706" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#d97706" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.5)} />
                <XAxis dataKey="hour" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <RechartsTooltip contentStyle={{ fontSize: 12 }} />
                <Legend />
                <Area type="monotone" dataKey="free" name="Free (GH)" stroke="#10a37f" fill="url(#colorFree)" strokeWidth={2} />
                <Area type="monotone" dataKey="paid" name="Paid"      stroke="#d97706" fill="url(#colorPaid)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>🔢 Tokens (24h)</Typography>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                <defs>
                  <linearGradient id="colorTokens" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.5)} />
                <XAxis dataKey="hour" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <RechartsTooltip contentStyle={{ fontSize: 12 }} />
                <Legend />
                <Area type="monotone" dataKey="tokens" name="Tokens" stroke="#6366f1" fill="url(#colorTokens)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>⚠️ Errors (24h)</Typography>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                <defs>
                  <linearGradient id="colorErrors" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.5)} />
                <XAxis dataKey="hour" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <RechartsTooltip contentStyle={{ fontSize: 12 }} />
                <Area type="monotone" dataKey="errors" name="Errors" stroke="#ef4444" fill="url(#colorErrors)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>💰 Est. Cost USD (24h)</Typography>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={costData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                <defs>
                  <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#f59e0b" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.5)} />
                <XAxis dataKey="hour" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `$${v}`} />
                <RechartsTooltip contentStyle={{ fontSize: 12 }} formatter={(v) => [`$${v}`, 'Est. Cost']} />
                <Area type="monotone" dataKey="cost" name="Cost ($)" stroke="#f59e0b" fill="url(#colorCost)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

// ── Service Map Tab ────────────────────────────────────────────

function ServiceMapTab({ metrics, theme, search, categoryFilter, onSearchChange, onCategoryChange, stoppedServices, onStopService, onStartService, serviceOverrides, onOpenOverride }) {
  const services      = metrics?.services      || {};
  const serviceRoutes = metrics?.serviceRoutes || {};
  const ghQuota       = metrics?.githubModelsQuota || { used: 0, limit: 50, softLimit: 40 };

  const allServiceList = Object.keys({ ...SERVICE_META, ...services }).map(key => {
    const meta  = SERVICE_META[key] || { label: key, category: 'Unknown', icon: <Circle />, trigger: '—', frequency: '—', maxCalls: '?', maxTokens: '?' };
    const stats = services[key]     || { requests: 0, tokens_in: 0, tokens_out: 0, total_tokens: 0, errors: 0, cost_usd: 0, last_used: null, last_provider: null, avg_tokens_per_req: 0 };
    const route = serviceRoutes[key] || stats.route || ['github-models', 'claude', 'grok'];
    return { key, ...meta, ...stats, route };
  });

  const categoryOrder = ['User-Facing', 'Admin', 'Scheduled', 'Pipeline', 'Unknown'];
  allServiceList.sort((a, b) => {
    const catDiff = categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category);
    return catDiff !== 0 ? catDiff : b.requests - a.requests;
  });

  const serviceList = allServiceList.filter(svc => {
    const matchesSearch = !search ||
      svc.label.toLowerCase().includes(search.toLowerCase()) ||
      svc.key.toLowerCase().includes(search.toLowerCase());
    const matchesCat = categoryFilter === 'All' || svc.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const categoryStats = {};
  allServiceList.forEach(s => {
    if (!categoryStats[s.category]) categoryStats[s.category] = { requests: 0, tokens: 0, errors: 0, cost: 0 };
    categoryStats[s.category].requests += s.requests;
    categoryStats[s.category].tokens   += s.total_tokens;
    categoryStats[s.category].errors   += s.errors;
    categoryStats[s.category].cost     += s.cost_usd || 0;
  });

  const totalServiceRequests = allServiceList.reduce((sum, s) => sum + s.requests, 0);

  const providerChipColor = (p) => {
    if (p?.startsWith('github-models')) return 'success';
    if (p === 'claude')                 return 'warning';
    if (p === 'grok')                   return 'secondary';
    return 'default';
  };

  return (
    <Box>
      {/* Search + Filter Bar */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
        <TextField
          size="small"
          placeholder="Search services..."
          value={search}
          onChange={e => onSearchChange(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search fontSize="small" />
              </InputAdornment>
            ),
          }}
          sx={{ minWidth: 200 }}
        />
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Category</InputLabel>
          <Select
            value={categoryFilter}
            label="Category"
            onChange={e => onCategoryChange(e.target.value)}
          >
            <MenuItem value="All">All</MenuItem>
            {['User-Facing', 'Admin', 'Scheduled', 'Pipeline'].map(c => (
              <MenuItem key={c} value={c}>{c}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* GitHub Models Quota Bar */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="subtitle1" fontWeight={700}>
            <CloudQueue sx={{ fontSize: 18, mr: 0.5, verticalAlign: 'text-bottom' }} />
            GitHub Models Daily Quota
          </Typography>
          <Typography variant="body2" fontWeight={600}>
            {ghQuota.used} / {ghQuota.limit} used
            {ghQuota.used >= ghQuota.limit && (
              <Chip label="EXHAUSTED" size="small" color="error" sx={{ ml: 1 }} />
            )}
            {ghQuota.used >= ghQuota.softLimit && ghQuota.used < ghQuota.limit && (
              <Chip label="SOFT LIMIT" size="small" color="warning" sx={{ ml: 1 }} />
            )}
          </Typography>
        </Box>
        <Box sx={{ position: 'relative' }}>
          <LinearProgress
            variant="determinate"
            value={Math.min((ghQuota.used / ghQuota.limit) * 100, 100)}
            sx={{
              height: 14, borderRadius: 1,
              bgcolor: alpha(theme.palette.grey[300], 0.3),
              '& .MuiLinearProgress-bar': {
                bgcolor: ghQuota.used >= ghQuota.limit
                  ? theme.palette.error.main
                  : ghQuota.used >= ghQuota.softLimit
                    ? theme.palette.warning.main
                    : theme.palette.success.main,
                borderRadius: 1,
              },
            }}
          />
          <Box sx={{ position: 'absolute', left: `${(ghQuota.softLimit / ghQuota.limit) * 100}%`, top: -2, bottom: -2, width: 2, bgcolor: theme.palette.warning.main, zIndex: 1 }} />
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5, alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
          <Typography variant="caption" color="text.secondary">0</Typography>
          <Typography variant="caption" color="warning.main">← Soft limit ({ghQuota.softLimit}): user-chat only beyond this</Typography>
          <Typography variant="caption" color="text.secondary">{ghQuota.limit}</Typography>
        </Box>
      </Paper>

      {/* Category Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {categoryOrder.filter(c => categoryStats[c]).map(cat => {
          const cs = categoryStats[cat];
          const catColor = CATEGORY_COLORS[cat] || 'default';
          return (
            <Grid size={{ xs: 6, sm: 3 }} key={cat}>
              <Card sx={{ borderLeft: '4px solid', borderColor: `${catColor}.main` }}>
                <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
                  <Typography variant="caption" color="text.secondary">{cat}</Typography>
                  <Typography variant="h6" fontWeight={700}>
                    {formatNumber(cs.requests)}{' '}
                    <Typography component="span" variant="caption">calls</Typography>
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatNumber(cs.tokens)} tok • {cs.errors} err • ${(cs.cost || 0).toFixed(4)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Service Map Table */}
      <Paper sx={{ overflow: 'hidden' }}>
        <Box sx={{ p: 2, bgcolor: alpha(theme.palette.primary.main, 0.04) }}>
          <Typography variant="h6" fontWeight={600}>
            <Hub sx={{ fontSize: 20, mr: 0.5, verticalAlign: 'text-bottom' }} />
            Service Map ({serviceList.length} / {allServiceList.length} services)
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Real-time LLM usage per service — use ⏸ to pause a service, ⚙ to pin a model
          </Typography>
        </Box>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: alpha(theme.palette.grey[500], 0.06) }}>
                <TableCell><strong>Service</strong></TableCell>
                <TableCell><strong>Category</strong></TableCell>
                <TableCell align="center"><strong>Route</strong></TableCell>
                <TableCell align="right"><strong>Calls</strong></TableCell>
                <TableCell align="right"><strong>Tokens</strong></TableCell>
                <TableCell align="right"><strong>Avg Tok/Req</strong></TableCell>
                <TableCell align="right"><strong>Est. Cost</strong></TableCell>
                <TableCell align="right"><strong>Errors</strong></TableCell>
                <TableCell><strong>Last Provider</strong></TableCell>
                <TableCell><strong>Last Used</strong></TableCell>
                <TableCell align="center"><strong>Override</strong></TableCell>
                <TableCell align="center"><strong>Control</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {serviceList.map((svc) => {
                const isStopped  = stoppedServices.includes(svc.key);
                const override   = serviceOverrides[svc.key];
                const catColor   = CATEGORY_COLORS[svc.category] || 'default';
                const pct        = totalServiceRequests > 0 ? Math.round((svc.requests / totalServiceRequests) * 100) : 0;
                return (
                  <TableRow
                    key={svc.key}
                    sx={{
                      opacity:   isStopped ? 0.55 : 1,
                      bgcolor:   isStopped
                        ? alpha(theme.palette.error.main, 0.04)
                        : svc.requests > 0
                          ? alpha(theme.palette.primary.main, 0.02)
                          : 'inherit',
                      '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.06) },
                    }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {React.cloneElement(svc.icon, { sx: { fontSize: 18, color: isStopped ? 'error.main' : 'text.secondary' } })}
                        <Box>
                          <Typography variant="body2" fontWeight={600}>{svc.label}</Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace', fontSize: 10 }}>
                            {svc.key}
                          </Typography>
                        </Box>
                        {isStopped && <Chip label="PAUSED" size="small" color="error" sx={{ ml: 0.5, height: 18, fontSize: 10 }} />}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip label={svc.category} size="small" color={catColor} variant="outlined" sx={{ fontSize: 11 }} />
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3, justifyContent: 'center', flexWrap: 'wrap' }}>
                        {(svc.route || []).map((p, i, arr) => (
                          <React.Fragment key={p}>
                            <Chip
                              label={p === 'github-models' ? 'GH' : p === 'claude' ? 'CL' : 'GK'}
                              size="small"
                              color={providerChipColor(p)}
                              variant={i === 0 ? 'filled' : 'outlined'}
                              sx={{ fontSize: 10, height: 20, '& .MuiChip-label': { px: 0.5 } }}
                            />
                            {i < arr.length - 1 && <ArrowForward sx={{ fontSize: 10, color: 'text.disabled' }} />}
                          </React.Fragment>
                        ))}
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                        <strong>{formatNumber(svc.requests)}</strong>
                        {pct > 0 && <Typography variant="caption" color="text.secondary">({pct}%)</Typography>}
                      </Box>
                    </TableCell>
                    <TableCell align="right">{formatNumber(svc.total_tokens)}</TableCell>
                    <TableCell align="right">
                      {svc.avg_tokens_per_req > 0 ? formatNumber(svc.avg_tokens_per_req) : '—'}
                    </TableCell>
                    <TableCell align="right">
                      {svc.cost_usd > 0
                        ? <Typography variant="body2" color="warning.main">${(svc.cost_usd || 0).toFixed(4)}</Typography>
                        : <Typography variant="body2" color="success.main">$0.00</Typography>
                      }
                    </TableCell>
                    <TableCell align="right" sx={{ color: svc.errors > 0 ? 'error.main' : 'inherit' }}>
                      {svc.errors || '—'}
                    </TableCell>
                    <TableCell>
                      {svc.last_provider
                        ? <Chip label={svc.last_provider} size="small" color={providerChipColor(svc.last_provider)} variant="outlined" sx={{ fontSize: 11 }} />
                        : <Typography variant="caption" color="text.disabled">—</Typography>
                      }
                    </TableCell>
                    <TableCell>
                      {svc.last_used
                        ? (
                          <Tooltip title={new Date(svc.last_used).toLocaleString()}>
                            <Typography variant="caption">{_timeAgo(svc.last_used)}</Typography>
                          </Tooltip>
                        )
                        : <Typography variant="caption" color="text.disabled">Never</Typography>
                      }
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title={override ? `Pinned: ${override.provider}/${override.model}` : 'Set model override'}>
                        <IconButton size="small" onClick={() => onOpenOverride(svc.key, override)}>
                          <Tune fontSize="small" sx={{ color: override ? 'primary.main' : 'text.disabled' }} />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title={isStopped ? 'Resume service' : 'Pause service'}>
                        <IconButton
                          size="small"
                          onClick={() => isStopped ? onStartService(svc.key) : onStopService(svc.key)}
                          sx={{ color: isStopped ? 'success.main' : 'error.main' }}
                        >
                          {isStopped ? <PlayCircle fontSize="small" /> : <PauseCircle fontSize="small" />}
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })}
              {serviceList.length === 0 && (
                <TableRow>
                  <TableCell colSpan={12} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">No services match the current filter.</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}

// ── Top Users Tab ──────────────────────────────────────────────

function TopUsersTab({ topUsers, theme }) {
  if (!topUsers.length) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Person sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
        <Typography color="text.secondary">No per-user data yet — data accumulates as users interact with the AI.</Typography>
      </Box>
    );
  }

  const maxTokens = topUsers[0]?.total_tokens || 1;

  return (
    <Paper sx={{ overflow: 'hidden' }}>
      <Box sx={{ p: 2, bgcolor: alpha(theme.palette.primary.main, 0.04) }}>
        <Typography variant="h6" fontWeight={600}>👤 Top Token Consumers</Typography>
        <Typography variant="caption" color="text.secondary">Ranked by total tokens used · resets on server restart</Typography>
      </Box>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: alpha(theme.palette.grey[500], 0.06) }}>
              <TableCell><strong>#</strong></TableCell>
              <TableCell><strong>User ID</strong></TableCell>
              <TableCell align="right"><strong>Requests</strong></TableCell>
              <TableCell align="right"><strong>Total Tokens</strong></TableCell>
              <TableCell align="right"><strong>Tokens In</strong></TableCell>
              <TableCell align="right"><strong>Tokens Out</strong></TableCell>
              <TableCell align="right"><strong>Est. Cost</strong></TableCell>
              <TableCell><strong>Usage</strong></TableCell>
              <TableCell><strong>Last Seen</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {topUsers.map((u, i) => {
              const estimatedCost = ((u.tokens_in || 0) * 0 + (u.tokens_out || 0) * 0); // GH = free
              const pct = Math.round(((u.total_tokens || 0) / maxTokens) * 100);
              return (
                <TableRow key={u.userId} sx={{ '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.04) } }}>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary" fontWeight={i < 3 ? 700 : 400}>
                      {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Tooltip title={u.userId}>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: 12 }}>
                        …{u.userId?.slice(-10)}
                      </Typography>
                    </Tooltip>
                  </TableCell>
                  <TableCell align="right">{formatNumber(u.requests)}</TableCell>
                  <TableCell align="right"><strong>{formatNumber(u.total_tokens)}</strong></TableCell>
                  <TableCell align="right">{formatNumber(u.tokens_in || 0)}</TableCell>
                  <TableCell align="right">{formatNumber(u.tokens_out || 0)}</TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" color={estimatedCost > 0 ? 'warning.main' : 'success.main'}>
                      {estimatedCost > 0 ? `$${estimatedCost.toFixed(4)}` : '🟢 Free'}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ minWidth: 120 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LinearProgress
                        variant="determinate"
                        value={pct}
                        sx={{ flex: 1, height: 6, borderRadius: 1, bgcolor: alpha(theme.palette.primary.main, 0.15) }}
                      />
                      <Typography variant="caption" color="text.secondary">{pct}%</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    {u.lastSeen
                      ? <Tooltip title={new Date(u.lastSeen).toLocaleString()}><Typography variant="caption">{_timeAgo(u.lastSeen)}</Typography></Tooltip>
                      : <Typography variant="caption" color="text.disabled">—</Typography>
                    }
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}

// ── Request Log Tab ────────────────────────────────────────────

function RequestLogTab({ theme }) {
  const [log,           setLog]           = useState([]);
  const [loading,       setLoading]       = useState(false);
  const [filterService, setFilterService] = useState('');
  const [errorsOnly,    setErrorsOnly]    = useState(false);

  const fetchLog = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/llm/request-log', {
        params: { limit: 200, service: filterService || undefined, errorsOnly: errorsOnly || undefined }
      });
      if (res.data.success) setLog(res.data.log);
    } catch (_) {}
    finally { setLoading(false); }
  }, [filterService, errorsOnly]);

  useEffect(() => { fetchLog(); }, [fetchLog]);

  const serviceKeys = [...new Set([...Object.keys(SERVICE_META)])];

  return (
    <Box>
      {/* Filter bar */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel>Filter by service</InputLabel>
          <Select value={filterService} label="Filter by service" onChange={e => setFilterService(e.target.value)}>
            <MenuItem value="">All Services</MenuItem>
            {serviceKeys.map(k => (
              <MenuItem key={k} value={k}>{SERVICE_META[k]?.label || k}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControlLabel
          control={<Switch size="small" checked={errorsOnly} onChange={e => setErrorsOnly(e.target.checked)} />}
          label={<Typography variant="body2">Errors only</Typography>}
        />
        <Button size="small" startIcon={<Refresh />} onClick={fetchLog} disabled={loading}>Refresh</Button>
        <Typography variant="caption" color="text.secondary">
          Last {log.length} calls (newest first) · resets on server restart
        </Typography>
      </Box>

      <Paper sx={{ overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 600 }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell><strong>Time</strong></TableCell>
                <TableCell><strong>Service</strong></TableCell>
                <TableCell><strong>Provider / Model</strong></TableCell>
                <TableCell align="right"><strong>Tok In</strong></TableCell>
                <TableCell align="right"><strong>Tok Out</strong></TableCell>
                <TableCell align="right"><strong>Latency</strong></TableCell>
                <TableCell><strong>Error</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                    <CircularProgress size={24} />
                  </TableCell>
                </TableRow>
              )}
              {!loading && log.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">No log entries yet.</Typography>
                  </TableCell>
                </TableRow>
              )}
              {!loading && log.map((entry, i) => (
                <TableRow
                  key={i}
                  sx={{
                    bgcolor: entry.error
                      ? alpha(theme.palette.error.main, 0.04)
                      : 'inherit',
                    '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.04) },
                  }}
                >
                  <TableCell>
                    <Tooltip title={entry.ts ? new Date(entry.ts).toLocaleString() : ''}>
                      <Typography variant="caption" sx={{ fontFamily: 'monospace', fontSize: 11 }}>
                        {entry.ts ? _timeAgo(entry.ts) : '—'}
                      </Typography>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" sx={{ fontFamily: 'monospace', fontSize: 11 }}>
                      {SERVICE_META[entry.service]?.label || entry.service || '—'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {entry.provider
                      ? (
                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                          <Typography variant="caption" fontWeight={600}>{entry.provider}</Typography>
                          {entry.model && entry.model !== entry.provider && (
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10 }}>{entry.model}</Typography>
                          )}
                        </Box>
                      )
                      : <Typography variant="caption" color="text.disabled">—</Typography>
                    }
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="caption">{entry.tokensIn > 0 ? formatNumber(entry.tokensIn) : '—'}</Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="caption">{entry.tokensOut > 0 ? formatNumber(entry.tokensOut) : '—'}</Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography
                      variant="caption"
                      sx={{
                        color: entry.latencyMs > 3000 ? 'error.main'
                             : entry.latencyMs > 1500 ? 'warning.main'
                             : 'inherit',
                      }}
                    >
                      {entry.latencyMs > 0 ? `${entry.latencyMs}ms` : '—'}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ maxWidth: 260 }}>
                    {entry.error
                      ? (
                        <Tooltip title={entry.error}>
                          <Chip
                            label={entry.error.length > 40 ? entry.error.slice(0, 40) + '…' : entry.error}
                            size="small"
                            color="error"
                            variant="outlined"
                            sx={{ fontSize: 10, maxWidth: 240 }}
                          />
                        </Tooltip>
                      )
                      : <Typography variant="caption" color="success.main">OK</Typography>
                    }
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}

// ── Drill Tab (persistent per-call log with filters) ──────────

function DrillExpandableRow({ row, theme }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <TableRow
        sx={{
          bgcolor: row.error ? alpha(theme.palette.error.main, 0.04) : 'inherit',
          '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.04) },
        }}
      >
        <TableCell sx={{ p: 0.5 }}>
          <IconButton size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUp fontSize="small" /> : <KeyboardArrowDown fontSize="small" />}
          </IconButton>
        </TableCell>
        <TableCell>
          <Tooltip title={row.createdAt ? new Date(row.createdAt).toLocaleString() : ''}>
            <Typography variant="caption" sx={{ fontFamily: 'monospace', fontSize: 11 }}>
              {row.createdAt ? _timeAgo(row.createdAt) : '—'}
            </Typography>
          </Tooltip>
        </TableCell>
        <TableCell>
          <Typography variant="caption" sx={{ fontFamily: 'monospace', fontSize: 11 }}>
            {SERVICE_META[row.service]?.label || row.service || '—'}
          </Typography>
        </TableCell>
        <TableCell>
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Chip
              label={row.provider || '—'}
              size="small"
              sx={{
                fontSize: 10, height: 20,
                bgcolor: row.provider?.includes('claude') ? alpha('#d97706', 0.15) :
                         row.provider?.includes('grok') ? alpha('#6366f1', 0.15) :
                         alpha('#10a37f', 0.15),
                color: row.provider?.includes('claude') ? '#d97706' :
                       row.provider?.includes('grok') ? '#6366f1' : '#10a37f',
              }}
            />
            {row.model && <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10, mt: 0.3 }}>{row.model}</Typography>}
          </Box>
        </TableCell>
        <TableCell align="right"><Typography variant="caption">{row.tokensIn > 0 ? formatNumber(row.tokensIn) : '—'}</Typography></TableCell>
        <TableCell align="right"><Typography variant="caption">{row.tokensOut > 0 ? formatNumber(row.tokensOut) : '—'}</Typography></TableCell>
        <TableCell align="right">
          <Typography variant="caption" fontWeight={600} sx={{ color: row.estimatedCostUSD > 0.01 ? 'warning.main' : row.estimatedCostUSD > 0 ? 'text.primary' : 'text.disabled' }}>
            {row.estimatedCostUSD > 0 ? `$${row.estimatedCostUSD.toFixed(4)}` : 'Free'}
          </Typography>
        </TableCell>
        <TableCell align="right">
          <Typography variant="caption" sx={{ color: row.latencyMs > 3000 ? 'error.main' : row.latencyMs > 1500 ? 'warning.main' : 'inherit' }}>
            {row.latencyMs > 0 ? `${row.latencyMs}ms` : '—'}
          </Typography>
        </TableCell>
        <TableCell>
          {row.error
            ? <Tooltip title={row.error}><Chip label={row.error.length > 30 ? row.error.slice(0, 30) + '…' : row.error} size="small" color="error" variant="outlined" sx={{ fontSize: 10, maxWidth: 180 }} /></Tooltip>
            : <Typography variant="caption" color="success.main">OK</Typography>
          }
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell colSpan={9} sx={{ py: 0, borderBottom: open ? undefined : 'none' }}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ py: 1.5, px: 2, bgcolor: alpha(theme.palette.background.default, 0.5) }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary" fontWeight={700}>User ID</Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: 12 }}>{row.userId || '—'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary" fontWeight={700}>Timestamp</Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: 12 }}>{row.createdAt ? new Date(row.createdAt).toLocaleString() : '—'}</Typography>
                </Grid>
                {row.systemSnippet && (
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary" fontWeight={700}>System Prompt (snippet)</Typography>
                    <Paper variant="outlined" sx={{ p: 1, mt: 0.5, bgcolor: alpha(theme.palette.info.main, 0.04) }}>
                      <Typography variant="caption" sx={{ fontFamily: 'monospace', fontSize: 11, whiteSpace: 'pre-wrap' }}>{row.systemSnippet}</Typography>
                    </Paper>
                  </Grid>
                )}
                {row.userSnippet && (
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary" fontWeight={700}>User Message (snippet)</Typography>
                    <Paper variant="outlined" sx={{ p: 1, mt: 0.5, bgcolor: alpha(theme.palette.warning.main, 0.04) }}>
                      <Typography variant="caption" sx={{ fontFamily: 'monospace', fontSize: 11, whiteSpace: 'pre-wrap' }}>{row.userSnippet}</Typography>
                    </Paper>
                  </Grid>
                )}
                {row.error && (
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary" fontWeight={700}>Full Error</Typography>
                    <Paper variant="outlined" sx={{ p: 1, mt: 0.5, bgcolor: alpha(theme.palette.error.main, 0.04) }}>
                      <Typography variant="caption" color="error" sx={{ fontFamily: 'monospace', fontSize: 11 }}>{row.error}</Typography>
                    </Paper>
                  </Grid>
                )}
              </Grid>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

function DrillTab({ theme }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState({ totalCost: 0, totalTokensIn: 0, totalTokensOut: 0, totalCalls: 0, avgLatency: 0, errorCount: 0 });
  const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0, pages: 0 });

  // Filters
  const [provider, setProvider] = useState('');
  const [service, setService] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [hasError, setHasError] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [order, setOrder] = useState('desc');

  // Filter options from backend
  const [filterOptions, setFilterOptions] = useState({ providers: [], services: [], models: [] });

  const fetchFilterOptions = useCallback(async () => {
    try {
      const res = await api.get('/admin/llm/drill/providers');
      if (res.data.success) setFilterOptions(res.data);
    } catch (_) {}
  }, []);

  const fetchData = useCallback(async (pg = pagination.page) => {
    setLoading(true);
    try {
      const params = { page: pg, limit: pagination.limit, sortBy, order };
      if (provider) params.provider = provider;
      if (service) params.service = service;
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;
      if (hasError) params.hasError = hasError;

      const res = await api.get('/admin/llm/drill', { params });
      if (res.data.success) {
        setData(res.data.data);
        setSummary(res.data.summary);
        setPagination(res.data.pagination);
      }
    } catch (_) {}
    finally { setLoading(false); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provider, service, dateFrom, dateTo, hasError, sortBy, order, pagination.limit]);

  useEffect(() => { fetchFilterOptions(); }, [fetchFilterOptions]);
  useEffect(() => { fetchData(1); }, [fetchData]);

  const handlePageChange = (_, newPage) => fetchData(newPage + 1);
  const handleRowsPerPageChange = (e) => {
    setPagination(prev => ({ ...prev, limit: parseInt(e.target.value) }));
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setOrder(order === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(field);
      setOrder('desc');
    }
  };

  const SortableHeader = ({ field, children }) => (
    <TableCell
      align={['tokensIn', 'tokensOut', 'estimatedCostUSD', 'latencyMs'].includes(field) ? 'right' : 'left'}
      sx={{ cursor: 'pointer', userSelect: 'none', '&:hover': { color: 'primary.main' } }}
      onClick={() => handleSort(field)}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: ['tokensIn', 'tokensOut', 'estimatedCostUSD', 'latencyMs'].includes(field) ? 'flex-end' : 'flex-start', gap: 0.5 }}>
        <strong>{children}</strong>
        {sortBy === field && (order === 'desc' ? <ArrowDownward sx={{ fontSize: 14 }} /> : <ArrowUpward sx={{ fontSize: 14 }} />)}
      </Box>
    </TableCell>
  );

  return (
    <Box>
      {/* Summary cards */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        {[
          { label: 'Total Calls', value: formatNumber(summary.totalCalls), icon: <Token />, color: 'primary' },
          { label: 'Total Cost', value: `$${summary.totalCost.toFixed(4)}`, icon: <AttachMoney />, color: 'warning' },
          { label: 'Tokens In', value: formatNumber(summary.totalTokensIn), icon: <ArrowDownward />, color: 'info' },
          { label: 'Tokens Out', value: formatNumber(summary.totalTokensOut), icon: <ArrowUpward />, color: 'success' },
          { label: 'Avg Latency', value: `${summary.avgLatency}ms`, icon: <Speed />, color: 'secondary' },
          { label: 'Errors', value: String(summary.errorCount), icon: <Error />, color: 'error' },
        ].map(({ label, value, icon, color }) => (
          <Grid item xs={6} sm={4} md={2} key={label}>
            <Card variant="outlined" sx={{ borderLeft: 3, borderColor: `${color}.main` }}>
              <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ color: `${color}.main`, display: 'flex' }}>{icon}</Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">{label}</Typography>
                    <Typography variant="subtitle2" fontWeight={700}>{value}</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Filters */}
      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
          <FilterList fontSize="small" color="action" />
          <Typography variant="subtitle2" fontWeight={700}>Filters</Typography>
          <Typography variant="caption" color="text.secondary">(persisted data — survives server restarts)</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'center' }}>
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Provider</InputLabel>
            <Select value={provider} label="Provider" onChange={e => setProvider(e.target.value)}>
              <MenuItem value="">All Providers</MenuItem>
              {filterOptions.providers.map(p => (
                <MenuItem key={p} value={p}>{PROVIDER_META[p]?.label || p}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Service</InputLabel>
            <Select value={service} label="Service" onChange={e => setService(e.target.value)}>
              <MenuItem value="">All Services</MenuItem>
              {filterOptions.services.map(s => (
                <MenuItem key={s} value={s}>{SERVICE_META[s]?.label || s}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Status</InputLabel>
            <Select value={hasError} label="Status" onChange={e => setHasError(e.target.value)}>
              <MenuItem value="">All</MenuItem>
              <MenuItem value="true">Errors Only</MenuItem>
              <MenuItem value="false">Success Only</MenuItem>
            </Select>
          </FormControl>

          <TextField
            size="small" type="date" label="From"
            InputLabelProps={{ shrink: true }}
            value={dateFrom} onChange={e => setDateFrom(e.target.value)}
            sx={{ width: 150 }}
          />
          <TextField
            size="small" type="date" label="To"
            InputLabelProps={{ shrink: true }}
            value={dateTo} onChange={e => setDateTo(e.target.value)}
            sx={{ width: 150 }}
          />

          <Button size="small" startIcon={<Refresh />} onClick={() => fetchData(1)} disabled={loading}>
            Refresh
          </Button>
          <Button
            size="small" variant="text" color="secondary"
            onClick={() => { setProvider(''); setService(''); setDateFrom(''); setDateTo(''); setHasError(''); }}
          >
            Clear
          </Button>
        </Box>
      </Paper>

      {/* Data table */}
      <Paper sx={{ overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 600 }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: 40 }} />
                <SortableHeader field="createdAt">Time</SortableHeader>
                <TableCell><strong>Service</strong></TableCell>
                <TableCell><strong>Provider / Model</strong></TableCell>
                <SortableHeader field="tokensIn">Tok In</SortableHeader>
                <SortableHeader field="tokensOut">Tok Out</SortableHeader>
                <SortableHeader field="estimatedCostUSD">Cost</SortableHeader>
                <SortableHeader field="latencyMs">Latency</SortableHeader>
                <TableCell><strong>Status</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 3 }}>
                    <CircularProgress size={24} />
                  </TableCell>
                </TableRow>
              )}
              {!loading && data.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">No call logs yet. Data will appear after LLM calls are made.</Typography>
                  </TableCell>
                </TableRow>
              )}
              {!loading && data.map((row) => (
                <DrillExpandableRow key={row._id} row={row} theme={theme} />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        {pagination.total > 0 && (
          <TablePagination
            component="div"
            count={pagination.total}
            page={(pagination.page || 1) - 1}
            onPageChange={handlePageChange}
            rowsPerPage={pagination.limit}
            onRowsPerPageChange={handleRowsPerPageChange}
            rowsPerPageOptions={[25, 50, 100]}
          />
        )}
      </Paper>
    </Box>
  );
}

// ── Main Component ─────────────────────────────────────────────

export default function LLMManagement() {
  const theme = useTheme();

  // Core state
  const [metrics,          setMetrics]          = useState(null);
  const [config,           setConfig]           = useState(null);
  const [availableModels,  setAvailableModels]  = useState(null);
  const [loading,          setLoading]          = useState(true);
  const [configOpen,       setConfigOpen]       = useState(false);
  const [testResult,       setTestResult]       = useState(null);
  const [testing,          setTesting]          = useState(null);
  const [editConfig,       setEditConfig]       = useState({});
  const [activeTab,        setActiveTab]        = useState(0);

  // Extended state
  const [history,          setHistory]          = useState([]);
  const [topUsers,         setTopUsers]         = useState([]);
  const [wsConnected,      setWsConnected]      = useState(false);
  const [search,           setSearch]           = useState('');
  const [categoryFilter,   setCategoryFilter]   = useState('All');
  const [quotaCountdown,   setQuotaCountdown]   = useState('');

  // Admin controls state
  const [stoppedServices,  setStoppedServices]  = useState([]);
  const [disabledProviders,setDisabledProviders]= useState([]);
  const [serviceOverrides, setServiceOverrides] = useState({});
  const [budget,           setBudget]           = useState({ dailyLimitUsd: 0, monthlyLimitUsd: 0, alertThresholdPct: 80, quotaAlertPct: 80 });
  const [editBudget,       setEditBudget]       = useState({});

  // Override dialog
  const [overrideOpen,     setOverrideOpen]     = useState(false);
  const [overrideService,  setOverrideService]  = useState('');
  const [overrideProvider, setOverrideProvider] = useState('');
  const [overrideModel,    setOverrideModel]    = useState('');

  // ── Data fetching ────────────────────────────────────────────

  const fetchMetrics = useCallback(async () => {
    try {
      const [metricsRes, configRes, historyRes, topUsersRes, stoppedRes, disabledRes, overridesRes, budgetRes] = await Promise.all([
        api.get('/admin/llm/metrics'),
        api.get('/admin/llm/config'),
        api.get('/admin/llm/history').catch(() => ({ data: { success: false } })),
        api.get('/admin/llm/top-users').catch(() => ({ data: { success: false } })),
        api.get('/admin/llm/stopped-services').catch(() => ({ data: { success: false } })),
        api.get('/admin/llm/disabled-providers').catch(() => ({ data: { success: false } })),
        api.get('/admin/llm/service-overrides').catch(() => ({ data: { success: false } })),
        api.get('/admin/llm/budget').catch(() => ({ data: { success: false } })),
      ]);

      if (metricsRes.data.success) {
        setMetrics(metricsRes.data);
        if (metricsRes.data.hourlySummary) setHistory(metricsRes.data.hourlySummary);
      }
      if (configRes.data.success) {
        setConfig(configRes.data.config);
        setAvailableModels(configRes.data.availableModels);
        setEditConfig(configRes.data.config);
      }
      if (historyRes.data.success && historyRes.data.history)       setHistory(historyRes.data.history);
      if (topUsersRes.data.success && topUsersRes.data.users)       setTopUsers(topUsersRes.data.users);
      if (stoppedRes.data.success)   setStoppedServices(stoppedRes.data.stoppedServices || []);
      if (disabledRes.data.success)  setDisabledProviders(disabledRes.data.disabledProviders || []);
      if (overridesRes.data.success) setServiceOverrides(overridesRes.data.overrides || {});
      if (budgetRes.data.success) {
        setBudget(budgetRes.data.budget);
        setEditBudget(budgetRes.data.budget);
      }
    } catch (err) {
      console.error('Failed to fetch LLM metrics:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMetrics(); }, [fetchMetrics]);

  // ── WebSocket real-time updates ──────────────────────────────

  useEffect(() => {
    const handler = (data) => {
      setMetrics(data);
      if (data.hourlySummary) setHistory(data.hourlySummary);
    };
    websocketService.on('llm:metrics:update', handler);
    websocketService.on('connect',    () => setWsConnected(true));
    websocketService.on('disconnect', () => setWsConnected(false));
    return () => {
      websocketService.off('llm:metrics:update', handler);
      websocketService.off('connect');
      websocketService.off('disconnect');
    };
  }, []);

  // ── Quota reset countdown ────────────────────────────────────

  useEffect(() => {
    if (!metrics?.githubModelsQuota?.nextResetMs) return;
    const tick = () => {
      const ms = metrics.githubModelsQuota.nextResetMs - Date.now();
      if (ms <= 0) { setQuotaCountdown('Resets now'); return; }
      const h = Math.floor(ms / 3600000);
      const m = Math.floor((ms % 3600000) / 60000);
      setQuotaCountdown(`Resets in ${h}h ${m}m`);
    };
    tick();
    const id = setInterval(tick, 60000);
    return () => clearInterval(id);
  }, [metrics?.githubModelsQuota?.nextResetMs]);

  // ── Actions ──────────────────────────────────────────────────

  const handleTest = async (provider, model) => {
    setTesting(provider);
    setTestResult(null);
    try {
      const res = await api.post('/admin/llm/test', { provider, model });
      setTestResult(res.data);
    } catch (err) {
      setTestResult({ success: false, error: err.message });
    } finally {
      setTesting(null);
    }
  };

  const handleSaveConfig = async () => {
    try {
      const res = await api.put('/admin/llm/config', editConfig);
      if (res.data.success) {
        setConfig(res.data.config);
        setConfigOpen(false);
        fetchMetrics();
      }
    } catch (err) {
      console.error('Config save failed:', err);
    }
  };

  const handleProviderToggle = async (providerKey) => {
    try {
      const res = await api.post(`/admin/llm/provider/${providerKey}/toggle`);
      if (res.data.success) setDisabledProviders(res.data.disabledProviders || []);
    } catch (err) {
      console.error('Provider toggle failed:', err);
    }
  };

  const handleStopService = async (service) => {
    try {
      await api.post(`/admin/llm/service/${service}/stop`);
      setStoppedServices(prev => [...prev, service]);
    } catch (err) {
      console.error('Stop service failed:', err);
    }
  };

  const handleStartService = async (service) => {
    try {
      await api.post(`/admin/llm/service/${service}/start`);
      setStoppedServices(prev => prev.filter(s => s !== service));
    } catch (err) {
      console.error('Start service failed:', err);
    }
  };

  const handleOpenOverride = (service, existing) => {
    setOverrideService(service);
    setOverrideProvider(existing?.provider || '');
    setOverrideModel(existing?.model || '');
    setOverrideOpen(true);
  };

  const handleSaveOverride = async () => {
    try {
      if (!overrideProvider) {
        await api.delete(`/admin/llm/service/${overrideService}/override`);
        setServiceOverrides(prev => { const n = { ...prev }; delete n[overrideService]; return n; });
      } else {
        const res = await api.put(`/admin/llm/service/${overrideService}/override`, { provider: overrideProvider, model: overrideModel });
        if (res.data.success) {
          setServiceOverrides(prev => ({ ...prev, [overrideService]: res.data.override }));
        }
      }
      setOverrideOpen(false);
    } catch (err) {
      console.error('Override save failed:', err);
    }
  };

  const handleSaveBudget = async () => {
    try {
      const res = await api.put('/admin/llm/budget', editBudget);
      if (res.data.success) {
        setBudget(res.data.budget);
        setConfigOpen(false);
      }
    } catch (err) {
      console.error('Budget save failed:', err);
    }
  };

  const handleExport = (format) => {
    const url = `/api/admin/llm/export?format=${format}`;
    const a = document.createElement('a');
    a.href = url;
    a.download = `llm-export.${format}`;
    // Pass auth via fetch then trigger download
    api.get(`/admin/llm/export?format=${format}`, { responseType: 'blob' })
      .then(res => {
        const blob = new Blob([res.data], { type: format === 'csv' ? 'text/csv' : 'application/json' });
        a.href = URL.createObjectURL(blob);
        a.click();
      })
      .catch(() => console.error('Export failed'));
  };

  // ── Derived metrics ──────────────────────────────────────────

  if (loading) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Loading LLM metrics...</Typography>
      </Box>
    );
  }

  const providers     = metrics?.providers || {};
  const totalRequests = Object.values(providers).reduce((s, p) => s + p.requests, 0);
  const totalTokens   = Object.values(providers).reduce((s, p) => s + p.total_tokens, 0);
  const totalErrors   = Object.values(providers).reduce((s, p) => s + p.errors, 0);
  const freeRequests  = Object.entries(providers)
    .filter(([k]) => k.startsWith('github-models'))
    .reduce((s, [, p]) => s + p.requests, 0);
  const paidRequests  = totalRequests - freeRequests;

  const p95Values = Object.values(providers).filter(p => p.p95_latency_ms > 0).map(p => p.p95_latency_ms);
  const avgP95    = p95Values.length
    ? Math.round(p95Values.reduce((a, b) => a + b, 0) / p95Values.length)
    : 0;

  const totalCost = metrics?.totalCost_usd ?? 0;

  // Budget alert thresholds
  const dailyBudgetPct   = budget.dailyLimitUsd   > 0 ? (totalCost / budget.dailyLimitUsd) * 100   : 0;
  const ghQuotaPct       = metrics?.githubModelsQuota ? (metrics.githubModelsQuota.used / metrics.githubModelsQuota.limit) * 100 : 0;
  const showCostAlert    = budget.dailyLimitUsd > 0 && dailyBudgetPct >= budget.alertThresholdPct;
  const showQuotaAlert   = ghQuotaPct >= (budget.quotaAlertPct || 80);

  // ── Render ───────────────────────────────────────────────────

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>

      {/* ⚠️ In-memory Warning Banner */}
      <Alert severity="info" icon={<InfoOutlined />} sx={{ mb: 2 }} onClose={() => {}}>
        <strong>In-memory data:</strong> All metrics, logs, and service controls reset on server restart or deploy. They are not persisted to the database.
      </Alert>

      {/* Budget / Quota Alerts */}
      {showCostAlert && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          💸 Daily cost <strong>${totalCost.toFixed(4)}</strong> has reached {Math.round(dailyBudgetPct)}% of your ${budget.dailyLimitUsd} limit.
        </Alert>
      )}
      {showQuotaAlert && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          ⚠️ GitHub Models quota at {Math.round(ghQuotaPct)}% ({metrics?.githubModelsQuota?.used}/{metrics?.githubModelsQuota?.limit}) — paid fallback will activate soon.
        </Alert>
      )}

      {/* Stopped services banner */}
      {stoppedServices.length > 0 && (
        <Alert severity="error" sx={{ mb: 2 }}>
          <strong>⏸ {stoppedServices.length} service{stoppedServices.length > 1 ? 's' : ''} paused:</strong>{' '}
          {stoppedServices.join(', ')} — requests are blocked until resumed.
        </Alert>
      )}

      {/* Disabled providers banner */}
      {disabledProviders.length > 0 && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          <strong>🚫 {disabledProviders.length} provider{disabledProviders.length > 1 ? 's' : ''} disabled:</strong>{' '}
          {disabledProviders.join(', ')} — skipped in all failover chains.
        </Alert>
      )}

      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 1 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>🧠 LLM Control Center</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
            <Typography variant="body2" color="text.secondary">Active:</Typography>
            <Chip size="small" label={metrics?.activeProvider || 'Unknown'} color="success" sx={{ ml: 0.5 }} />
            {metrics?.claudeDown && <Chip size="small" label="Claude DOWN" color="error" sx={{ ml: 1 }} />}
            {wsConnected
              ? <Chip icon={<Wifi sx={{ fontSize: 14 }} />}    size="small" label="Live"    color="success" variant="outlined" sx={{ ml: 1 }} />
              : <Chip icon={<WifiOff sx={{ fontSize: 14 }} />} size="small" label="Polling" color="default" variant="outlined" sx={{ ml: 1 }} />
            }
          </Box>
        </Box>
        <Stack direction="row" spacing={1} flexWrap="wrap">
          <Button startIcon={<Download />}  onClick={() => handleExport('json')} variant="outlined"  size="small">Export JSON</Button>
          <Button startIcon={<Download />}  onClick={() => handleExport('csv')}  variant="outlined"  size="small">Export CSV</Button>
          <Button startIcon={<Refresh />}   onClick={fetchMetrics}               variant="outlined"  size="small">Refresh</Button>
          <Button startIcon={<Settings />}  onClick={() => setConfigOpen(true)}  variant="contained" size="small">Configure</Button>
        </Stack>
      </Box>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab icon={<Speed />}      iconPosition="start" label="Overview"     sx={{ textTransform: 'none', fontWeight: 600 }} />
          <Tab icon={<Hub />}        iconPosition="start" label="Service Map"   sx={{ textTransform: 'none', fontWeight: 600 }} />
          <Tab icon={<TrendingUp />} iconPosition="start" label="Analytics"    sx={{ textTransform: 'none', fontWeight: 600 }} />
          <Tab icon={<Person />}     iconPosition="start" label="Top Users"    sx={{ textTransform: 'none', fontWeight: 600 }} />
          <Tab icon={<AccessTime />} iconPosition="start" label="Request Log"  sx={{ textTransform: 'none', fontWeight: 600 }} />
          <Tab icon={<Search />}     iconPosition="start" label="Drill"        sx={{ textTransform: 'none', fontWeight: 600 }} />
        </Tabs>
      </Paper>

      {/* ═══════════════════ TAB 0: OVERVIEW ═══════════════════ */}
      {activeTab === 0 && (
        <>
          {/* KPI Cards */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {[
              { label: 'Total Requests', value: formatNumber(totalRequests), icon: <Speed />, color: theme.palette.primary.main },
              { label: 'Total Tokens',   value: formatNumber(totalTokens),   icon: <Token />, color: theme.palette.info.main },
              { label: 'Free (GitHub)',  value: `${totalRequests ? Math.round(freeRequests / totalRequests * 100) : 0}%`, icon: <CheckCircle />, color: theme.palette.success.main, sub: `${formatNumber(freeRequests)} requests` },
              { label: 'Paid Fallback',  value: formatNumber(paidRequests),  icon: <Warning />, color: paidRequests > 0 ? theme.palette.error.main : theme.palette.success.main, sub: paidRequests === 0 ? 'No credit burn! 🎉' : 'Credits consumed' },
              { label: 'Errors',         value: totalErrors,                  icon: <Error />,   color: totalErrors > 0 ? theme.palette.error.main : theme.palette.text.secondary },
              { label: 'Cost Today',     value: `$${totalCost.toFixed(4)}`,   icon: <AttachMoney />, color: totalCost > 1 ? theme.palette.error.main : theme.palette.success.main, sub: totalCost === 0 ? '🟢 $0.00 spent' : undefined },
              { label: 'Avg P95 Latency',value: avgP95 ? `${avgP95}ms` : '—', icon: <AccessTime />, color: avgP95 > 3000 ? theme.palette.error.main : avgP95 > 1500 ? theme.palette.warning.main : theme.palette.success.main, sub: p95Values.length ? `across ${p95Values.length} providers` : 'No data yet' },
            ].map((kpi, i) => (
              <Grid size={{ xs: 6, sm: 4, md: 12 / 7 }} key={i}>
                <Card sx={{ borderLeft: `4px solid ${kpi.color}`, height: '100%' }}>
                  <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      {React.cloneElement(kpi.icon, { sx: { color: kpi.color, fontSize: 20 } })}
                      <Typography variant="caption" color="text.secondary">{kpi.label}</Typography>
                    </Box>
                    <Typography variant="h5" fontWeight={700}>{kpi.value}</Typography>
                    {kpi.sub && <Typography variant="caption" color="text.secondary">{kpi.sub}</Typography>}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Provider Table */}
          <Paper sx={{ mb: 3, overflow: 'hidden' }}>
            <Box sx={{ p: 2, bgcolor: alpha(theme.palette.primary.main, 0.04) }}>
              <Typography variant="h6" fontWeight={600}>📊 Provider Breakdown</Typography>
              <Typography variant="caption" color="text.secondary">Use the toggle to enable / disable a provider across all failover chains</Typography>
            </Box>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Provider</strong></TableCell>
                    <TableCell align="center"><strong>Status</strong></TableCell>
                    <TableCell align="right"><strong>Requests</strong></TableCell>
                    <TableCell align="right"><strong>Tokens In</strong></TableCell>
                    <TableCell align="right"><strong>Tokens Out</strong></TableCell>
                    <TableCell align="right"><strong>Avg Latency</strong></TableCell>
                    <TableCell align="right"><strong>P95 Latency</strong></TableCell>
                    <TableCell align="right"><strong>Est. Cost</strong></TableCell>
                    <TableCell align="right"><strong>Errors</strong></TableCell>
                    <TableCell align="center"><strong>Tier</strong></TableCell>
                    <TableCell align="center"><strong>Enable</strong></TableCell>
                    <TableCell align="center"><strong>Test</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.entries(providers).map(([key, p]) => {
                    const meta       = PROVIDER_META[key] || { label: key, color: '#888', cost: '?' };
                    const isActive   = metrics?.activeProvider === key;
                    const baseKey    = key.startsWith('github-models') ? 'github-models' : key;
                    const isDisabled = disabledProviders.includes(baseKey);
                    return (
                      <TableRow key={key} sx={{ bgcolor: isDisabled ? alpha(theme.palette.error.main, 0.04) : isActive ? alpha(theme.palette.success.main, 0.05) : 'inherit' }}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Circle sx={{ fontSize: 10, color: isDisabled ? 'error.main' : isActive ? 'success.main' : p.errors > p.requests * 0.5 ? 'error.main' : 'text.disabled' }} />
                            <Box>
                              <Typography variant="body2" fontWeight={600} sx={{ color: isDisabled ? 'text.disabled' : meta.color }}>{meta.label}</Typography>
                              <Typography variant="caption" color="text.secondary">{meta.group}</Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          {isDisabled
                            ? <Chip label="DISABLED" size="small" color="error" />
                            : isActive
                              ? <Chip label="Active"  size="small" color="success" />
                              : p.last_used
                                ? <Chip label="Standby" size="small" variant="outlined" />
                                : <Chip label="Idle"    size="small" />
                          }
                        </TableCell>
                        <TableCell align="right"><strong>{formatNumber(p.requests)}</strong></TableCell>
                        <TableCell align="right">{formatNumber(p.tokens_in)}</TableCell>
                        <TableCell align="right">{formatNumber(p.tokens_out)}</TableCell>
                        <TableCell align="right">{p.avg_latency_ms ? `${p.avg_latency_ms}ms` : '—'}</TableCell>
                        <TableCell align="right">
                          {p.p95_latency_ms
                            ? <Typography variant="body2" sx={{ color: p.p95_latency_ms > 3000 ? 'error.main' : p.p95_latency_ms > 1500 ? 'warning.main' : 'inherit' }}>{p.p95_latency_ms}ms</Typography>
                            : '—'
                          }
                        </TableCell>
                        <TableCell align="right">
                          {p.cost_usd > 0
                            ? <Typography variant="body2" color="warning.main">${p.cost_usd.toFixed(4)}</Typography>
                            : <Typography variant="body2" color="success.main">🟢 Free</Typography>
                          }
                        </TableCell>
                        <TableCell align="right" sx={{ color: p.errors > 0 ? 'error.main' : 'inherit' }}>{p.errors}</TableCell>
                        <TableCell align="center">
                          <Chip label={meta.cost} size="small" color={meta.cost === 'Free' ? 'success' : 'warning'} variant="outlined" />
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip title={isDisabled ? `Enable ${meta.label}` : `Disable ${meta.label}`}>
                            <IconButton
                              size="small"
                              onClick={() => handleProviderToggle(baseKey)}
                              sx={{ color: isDisabled ? 'success.main' : 'error.main' }}
                            >
                              {isDisabled ? <PowerSettingsNew fontSize="small" /> : <Block fontSize="small" />}
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip title={`Test ${meta.label}`}>
                            <IconButton
                              size="small"
                              onClick={() => handleTest(
                                key.startsWith('github') ? 'github-models' : key,
                                key.includes('/') ? key.split('/')[1] : undefined,
                              )}
                              disabled={testing !== null}
                            >
                              {testing === key ? <CircularProgress size={16} /> : <PlayArrow fontSize="small" />}
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          {/* Test Result */}
          {testResult && (
            <Alert severity={testResult.success ? 'success' : 'error'} sx={{ mb: 3 }} onClose={() => setTestResult(null)}>
              {testResult.success
                ? `✅ ${testResult.provider}/${testResult.model || ''} responded "${testResult.text}" in ${testResult.latencyMs}ms`
                : `❌ ${testResult.provider} failed: ${testResult.error}`
              }
            </Alert>
          )}

          {/* Failover Chain Visual */}
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>🔄 Failover Chain</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', py: 1 }}>
              {(config?.failoverChain || ['github-models', 'claude', 'grok']).map((provider, i, arr) => {
                const chainMeta = {
                  'github-models': { icon: <CloudQueue />, color: 'success',   label: `GitHub: ${(config?.primaryModels || ['gpt-4.1'])[0]}` },
                  claude:          { icon: <Memory />,     color: 'warning',   label: config?.claudeModel || 'claude-sonnet-4-6' },
                  grok:            { icon: <SmartToy />,   color: 'secondary', label: config?.grokModel || 'grok-3' },
                };
                const m = chainMeta[provider] || { icon: <Circle />, color: 'default', label: provider };
                const isDisabled = disabledProviders.includes(provider);
                return (
                  <React.Fragment key={provider}>
                    <Chip
                      icon={m.icon}
                      label={`${m.label}${isDisabled ? ' (disabled)' : ''}`}
                      color={isDisabled ? 'default' : m.color}
                      variant={i === 0 && !isDisabled ? 'filled' : 'outlined'}
                      sx={{ fontWeight: i === 0 ? 700 : 400, opacity: isDisabled ? 0.5 : 1 }}
                    />
                    {i < arr.length - 1 && <ArrowForward sx={{ color: 'text.disabled', fontSize: 18 }} />}
                  </React.Fragment>
                );
              })}
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              First = Primary • Green = Free (GitHub Models) • Orange = Anthropic • Purple = xAI
            </Typography>
          </Paper>

          {/* Quota Countdown */}
          {quotaCountdown && (
            <Box sx={{ mb: 3 }}>
              <Chip size="small" icon={<AccessTime sx={{ fontSize: 14 }} />} label={quotaCountdown} variant="outlined" />
            </Box>
          )}

          {/* Failover Log */}
          {metrics?.failoverLog?.length > 0 && (
            <Paper sx={{ mb: 3, overflow: 'hidden' }}>
              <Box sx={{ p: 2, bgcolor: alpha(theme.palette.warning.main, 0.06) }}>
                <Typography variant="h6" fontWeight={600}>⚠️ Recent Failovers</Typography>
              </Box>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Time</strong></TableCell>
                      <TableCell><strong>Failed Provider</strong></TableCell>
                      <TableCell><strong>To Provider</strong></TableCell>
                      <TableCell><strong>Service</strong></TableCell>
                      <TableCell align="right"><strong>Latency</strong></TableCell>
                      <TableCell><strong>Error</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {[...metrics.failoverLog].reverse().slice(0, 10).map((log, i) => (
                      <TableRow key={i}>
                        <TableCell><Typography variant="caption">{new Date(log.timestamp).toLocaleString()}</Typography></TableCell>
                        <TableCell><Chip label={log.from || '—'} size="small" color="error" variant="outlined" /></TableCell>
                        <TableCell>
                          {log.to
                            ? <Chip label={log.to} size="small" color="info" variant="outlined" />
                            : <Typography variant="caption" color="text.disabled">—</Typography>
                          }
                        </TableCell>
                        <TableCell><Typography variant="caption" sx={{ fontFamily: 'monospace' }}>{log.service || '—'}</Typography></TableCell>
                        <TableCell align="right"><Typography variant="caption">{log.latencyMs ? `${log.latencyMs}ms` : '—'}</Typography></TableCell>
                        <TableCell><Typography variant="caption" sx={{ wordBreak: 'break-word' }}>{log.error}</Typography></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          )}
        </>
      )}

      {/* ═══════════════════ TAB 1: SERVICE MAP ═══════════════════ */}
      {activeTab === 1 && (
        <ServiceMapTab
          metrics={metrics}
          theme={theme}
          search={search}
          categoryFilter={categoryFilter}
          onSearchChange={setSearch}
          onCategoryChange={setCategoryFilter}
          stoppedServices={stoppedServices}
          onStopService={handleStopService}
          onStartService={handleStartService}
          serviceOverrides={serviceOverrides}
          onOpenOverride={handleOpenOverride}
        />
      )}

      {/* ═══════════════════ TAB 2: ANALYTICS ═══════════════════ */}
      {activeTab === 2 && <AnalyticsTab history={history} theme={theme} />}

      {/* ═══════════════════ TAB 3: TOP USERS ═══════════════════ */}
      {activeTab === 3 && <TopUsersTab topUsers={topUsers} theme={theme} />}

      {/* ═══════════════════ TAB 4: REQUEST LOG ═══════════════════ */}
      {activeTab === 4 && <RequestLogTab theme={theme} />}

      {/* ═══════════════════ TAB 5: DRILL ═══════════════════════ */}
      {activeTab === 5 && <DrillTab theme={theme} />}

      {/* ═══════════════════ CONFIG DIALOG ═══════════════════════ */}
      <Dialog open={configOpen} onClose={() => setConfigOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>⚙️ LLM Routing Configuration</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Changes take effect immediately. No restart needed.
          </Typography>

          {/* Provider Priority */}
          <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
            🔄 Provider Priority (drag to reorder)
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 1.5, display: 'block' }}>
            First provider is tried first. Use ▲▼ to set a paid model as primary when needed.
          </Typography>
          <Paper variant="outlined" sx={{ mb: 3, overflow: 'hidden' }}>
            {(editConfig.failoverChain || ['github-models', 'claude', 'grok']).map((provider, idx, arr) => {
              const chainProviderMeta = {
                'github-models': { label: '☁️ GitHub Models',   color: 'success',   cost: 'Free' },
                claude:          { label: '🟠 Anthropic Claude', color: 'warning',   cost: 'Paid' },
                grok:            { label: '🟣 xAI Grok',         color: 'secondary', cost: 'Paid' },
              };
              const info = chainProviderMeta[provider] || { label: provider, color: 'default', cost: '?' };
              return (
                <Box key={provider} sx={{ display: 'flex', alignItems: 'center', px: 2, py: 1.5, borderBottom: idx < arr.length - 1 ? '1px solid' : 'none', borderColor: 'divider', bgcolor: idx === 0 ? alpha(theme.palette.primary.main, 0.06) : 'transparent' }}>
                  <Typography variant="body2" sx={{ fontWeight: idx === 0 ? 700 : 400, flex: 1 }}>{idx + 1}. {info.label}</Typography>
                  <Chip size="small" label={idx === 0 ? 'PRIMARY' : info.cost} color={idx === 0 ? 'primary' : info.cost === 'Free' ? 'success' : 'error'} variant={idx === 0 ? 'filled' : 'outlined'} sx={{ mr: 1 }} />
                  <IconButton size="small" disabled={idx === 0} onClick={() => { const chain = [...(editConfig.failoverChain || ['github-models', 'claude', 'grok'])]; [chain[idx - 1], chain[idx]] = [chain[idx], chain[idx - 1]]; setEditConfig({ ...editConfig, failoverChain: chain }); }}>
                    <ArrowUpward fontSize="small" />
                  </IconButton>
                  <IconButton size="small" disabled={idx === arr.length - 1} onClick={() => { const chain = [...(editConfig.failoverChain || ['github-models', 'claude', 'grok'])]; [chain[idx], chain[idx + 1]] = [chain[idx + 1], chain[idx]]; setEditConfig({ ...editConfig, failoverChain: chain }); }}>
                    <ArrowDownward fontSize="small" />
                  </IconButton>
                </Box>
              );
            })}
          </Paper>

          <Divider sx={{ my: 2 }} />

          {/* Model Selection */}
          <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>🎯 Model Selection (per provider)</Typography>

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>GitHub Models — Primary</InputLabel>
            <Select value={editConfig.primaryModels?.[0] || 'gpt-4.1'} label="GitHub Models — Primary" onChange={(e) => { const current = editConfig.primaryModels || ['gpt-4.1', 'gpt-4o']; setEditConfig({ ...editConfig, primaryModels: [e.target.value, ...current.filter(m => m !== e.target.value)] }); }}>
              {(availableModels?.githubModels || []).map(m => (
                <MenuItem key={m} value={m}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                    <span>{m}</span>
                    <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>{MODEL_INFO[m]?.tier || '🟢 Free'} — {MODEL_INFO[m]?.note || ''}</Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>GitHub Models — Tool-Calling</InputLabel>
            <Select value={editConfig.toolModel || 'gpt-4.1'} label="GitHub Models — Tool-Calling" onChange={(e) => setEditConfig({ ...editConfig, toolModel: e.target.value })}>
              {(availableModels?.githubModels || []).map(m => (
                <MenuItem key={m} value={m}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                    <span>{m}</span>
                    <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>{MODEL_INFO[m]?.tier || '🟢 Free'} — {MODEL_INFO[m]?.note || ''}</Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Anthropic — Claude Model</InputLabel>
            <Select value={editConfig.claudeModel || 'claude-sonnet-4-6'} label="Anthropic — Claude Model" onChange={(e) => setEditConfig({ ...editConfig, claudeModel: e.target.value })}>
              {(availableModels?.claude || []).map(m => (
                <MenuItem key={m} value={m}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                    <span>{m}</span>
                    <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>{MODEL_INFO[m]?.note || ''}</Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>xAI — Grok Model</InputLabel>
            <Select value={editConfig.grokModel || 'grok-3'} label="xAI — Grok Model" onChange={(e) => setEditConfig({ ...editConfig, grokModel: e.target.value })}>
              {(availableModels?.grok || []).map(m => (
                <MenuItem key={m} value={m}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                    <span>{m}</span>
                    <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>{MODEL_INFO[m]?.note || ''}</Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Divider sx={{ my: 2 }} />

          {/* Budget Controls */}
          <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.5 }}>💰 Spend Budget Controls</Typography>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 1.5, display: 'block' }}>
            Set 0 to disable a limit. Alerts show when threshold % is reached.
          </Typography>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                size="small"
                label="Daily Limit (USD)"
                type="number"
                value={editBudget.dailyLimitUsd ?? 0}
                onChange={e => setEditBudget({ ...editBudget, dailyLimitUsd: parseFloat(e.target.value) || 0 })}
                InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                size="small"
                label="Monthly Limit (USD)"
                type="number"
                value={editBudget.monthlyLimitUsd ?? 0}
                onChange={e => setEditBudget({ ...editBudget, monthlyLimitUsd: parseFloat(e.target.value) || 0 })}
                InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                size="small"
                label="Cost Alert Threshold (%)"
                type="number"
                value={editBudget.alertThresholdPct ?? 80}
                onChange={e => setEditBudget({ ...editBudget, alertThresholdPct: parseInt(e.target.value) || 80 })}
                InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                size="small"
                label="GH Quota Alert Threshold (%)"
                type="number"
                value={editBudget.quotaAlertPct ?? 80}
                onChange={e => setEditBudget({ ...editBudget, quotaAlertPct: parseInt(e.target.value) || 80 })}
                InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfigOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveBudget} variant="outlined" color="secondary">Save Budget</Button>
          <Button onClick={handleSaveConfig} variant="contained" color="primary">Save Routing</Button>
        </DialogActions>
      </Dialog>

      {/* ═══════════════════ OVERRIDE DIALOG ═════════════════════ */}
      <Dialog open={overrideOpen} onClose={() => setOverrideOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>⚙️ Model Override — <em>{overrideService}</em></DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Pin a specific provider + model for this service. Overrides the default failover chain.
            Leave provider blank to clear the override.
          </Typography>

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Provider</InputLabel>
            <Select value={overrideProvider} label="Provider" onChange={e => { setOverrideProvider(e.target.value); setOverrideModel(''); }}>
              <MenuItem value=""><em>— Clear override —</em></MenuItem>
              {['github-models', 'claude', 'grok'].map(p => (
                <MenuItem key={p} value={p}>{p}</MenuItem>
              ))}
            </Select>
          </FormControl>

          {overrideProvider && (
            <FormControl fullWidth>
              <InputLabel>Model</InputLabel>
              <Select value={overrideModel} label="Model" onChange={e => setOverrideModel(e.target.value)}>
                <MenuItem value=""><em>— Use default model —</em></MenuItem>
                {(PROVIDER_MODELS[overrideProvider] || []).map(m => (
                  <MenuItem key={m} value={m}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                      <span>{m}</span>
                      <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>{MODEL_INFO[m]?.tier || ''}</Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </DialogContent>
        <DialogActions>
          {serviceOverrides[overrideService] && (
            <Button
              color="error"
              startIcon={<DeleteOutline />}
              onClick={async () => {
                await api.delete(`/admin/llm/service/${overrideService}/override`);
                setServiceOverrides(prev => { const n = { ...prev }; delete n[overrideService]; return n; });
                setOverrideOpen(false);
              }}
            >
              Clear Override
            </Button>
          )}
          <Box sx={{ flex: 1 }} />
          <Button onClick={() => setOverrideOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveOverride} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
}
