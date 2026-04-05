import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Paper, Grid, Card, CardContent, Chip, Button,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Dialog, DialogTitle, DialogContent, DialogActions,
  FormControl, InputLabel, Select, MenuItem, IconButton, Tooltip,
  Alert, Divider, Tabs, Tab, LinearProgress,
  CircularProgress, Stack, alpha, useTheme,
  TextField, InputAdornment,
} from '@mui/material';
import {
  SmartToy, Speed, Warning, CheckCircle, Error,
  Refresh, Settings, PlayArrow, Token,
  CloudQueue, Memory, ArrowForward, Circle,
  ArrowUpward, ArrowDownward, Hub, Schedule,
  Person, AdminPanelSettings, Telegram, Build,
  Search, AttachMoney, TrendingUp, AccessTime, Wifi, WifiOff,
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
  'o3-mini':       { tier: '�� Free', note: 'Reasoning model, previous gen' },
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

function ServiceMapTab({ metrics, theme, search, categoryFilter, onSearchChange, onCategoryChange }) {
  const services      = metrics?.services      || {};
  const serviceRoutes = metrics?.serviceRoutes || {};
  const ghQuota       = metrics?.githubModelsQuota || { used: 0, limit: 50, softLimit: 40 };

  const allServiceList = Object.keys({ ...SERVICE_META, ...services }).map(key => {
    const meta  = SERVICE_META[key] || { label: key, category: 'Unknown', icon: <Circle />, trigger: '—', frequency: '—', maxCalls: '?', maxTokens: '?' };
    const stats = services[key]     || { requests: 0, tokens_in: 0, tokens_out: 0, total_tokens: 0, errors: 0, last_used: null, last_provider: null, avg_tokens_per_req: 0 };
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
    if (!categoryStats[s.category]) categoryStats[s.category] = { requests: 0, tokens: 0, errors: 0 };
    categoryStats[s.category].requests += s.requests;
    categoryStats[s.category].tokens   += s.total_tokens;
    categoryStats[s.category].errors   += s.errors;
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
              height: 14,
              borderRadius: 1,
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
          <Box sx={{
            position: 'absolute',
            left: `${(ghQuota.softLimit / ghQuota.limit) * 100}%`,
            top: -2, bottom: -2, width: 2,
            bgcolor: theme.palette.warning.main,
            zIndex: 1,
          }} />
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5, alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
          <Typography variant="caption" color="text.secondary">0</Typography>
          <Typography variant="caption" color="warning.main">
            ← Soft limit ({ghQuota.softLimit}): user-chat only beyond this
          </Typography>
          <Typography variant="caption" color="text.secondary">{ghQuota.limit}</Typography>
        </Box>
      </Paper>

      {/* Category Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {categoryOrder.filter(c => categoryStats[c]).map(cat => {
          const cs       = categoryStats[cat];
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
                    {formatNumber(cs.tokens)} tokens • {cs.errors} errors
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
            Real-time LLM usage per service — sorted by category then volume
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
                <TableCell align="right"><strong>Errors</strong></TableCell>
                <TableCell><strong>Last Provider</strong></TableCell>
                <TableCell><strong>Last Used</strong></TableCell>
                <TableCell align="center"><strong>Trigger</strong></TableCell>
                <TableCell align="center"><strong>Max/Trigger</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {serviceList.map((svc) => {
                const catColor = CATEGORY_COLORS[svc.category] || 'default';
                const pct      = totalServiceRequests > 0 ? Math.round((svc.requests / totalServiceRequests) * 100) : 0;
                return (
                  <TableRow
                    key={svc.key}
                    sx={{
                      bgcolor: svc.requests > 0 ? alpha(theme.palette.primary.main, 0.02) : 'inherit',
                      '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.06) },
                    }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {React.cloneElement(svc.icon, { sx: { fontSize: 18, color: 'text.secondary' } })}
                        <Box>
                          <Typography variant="body2" fontWeight={600}>{svc.label}</Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace', fontSize: 10 }}>
                            {svc.key}
                          </Typography>
                        </Box>
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
                      <Typography variant="caption">{svc.trigger}</Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={`${svc.maxCalls}x${typeof svc.maxTokens === 'number' ? formatNumber(svc.maxTokens) : svc.maxTokens}t`}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: 10, height: 20, fontFamily: 'monospace' }}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
              {serviceList.length === 0 && (
                <TableRow>
                  <TableCell colSpan={11} align="center" sx={{ py: 4 }}>
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

// ── Main Component ─────────────────────────────────────────────

export default function LLMManagement() {
  const theme = useTheme();

  // Core state
  const [metrics,         setMetrics]         = useState(null);
  const [config,          setConfig]          = useState(null);
  const [availableModels, setAvailableModels] = useState(null);
  const [loading,         setLoading]         = useState(true);
  const [configOpen,      setConfigOpen]      = useState(false);
  const [testResult,      setTestResult]      = useState(null);
  const [testing,         setTesting]         = useState(null);
  const [editConfig,      setEditConfig]      = useState({});
  const [activeTab,       setActiveTab]       = useState(0);

  // New state
  const [history,        setHistory]        = useState([]);
  const [topUsers,       setTopUsers]       = useState([]);  // eslint-disable-line no-unused-vars
  const [wsConnected,    setWsConnected]    = useState(false);
  const [search,         setSearch]         = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [quotaCountdown, setQuotaCountdown] = useState('');

  // ── Data fetching ────────────────────────────────────────────

  const fetchMetrics = useCallback(async () => {
    try {
      const [metricsRes, configRes, historyRes, topUsersRes] = await Promise.all([
        api.get('/admin/llm/metrics'),
        api.get('/admin/llm/config'),
        api.get('/admin/llm/history').catch(() => ({ data: { success: false } })),
        api.get('/admin/llm/top-users').catch(() => ({ data: { success: false } })),
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
      if (historyRes.data.success && historyRes.data.history) {
        setHistory(historyRes.data.history);
      }
      if (topUsersRes.data.success && topUsersRes.data.users) {
        setTopUsers(topUsersRes.data.users);
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

  // ── Render ───────────────────────────────────────────────────

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>

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
        <Stack direction="row" spacing={1}>
          <Button startIcon={<Refresh />}  onClick={fetchMetrics}            variant="outlined"  size="small">Refresh</Button>
          <Button startIcon={<Settings />} onClick={() => setConfigOpen(true)} variant="contained" size="small">Configure</Button>
        </Stack>
      </Box>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab icon={<Speed />}      iconPosition="start" label="Overview"    sx={{ textTransform: 'none', fontWeight: 600 }} />
          <Tab icon={<Hub />}        iconPosition="start" label="Service Map"  sx={{ textTransform: 'none', fontWeight: 600 }} />
          <Tab icon={<TrendingUp />} iconPosition="start" label="Analytics"   sx={{ textTransform: 'none', fontWeight: 600 }} />
        </Tabs>
      </Paper>

      {/* ═══════════════════ TAB 0: OVERVIEW ═══════════════════ */}
      {activeTab === 0 && (
        <>
          {/* KPI Cards */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {[
              {
                label: 'Total Requests',
                value: formatNumber(totalRequests),
                icon:  <Speed />,
                color: theme.palette.primary.main,
              },
              {
                label: 'Total Tokens',
                value: formatNumber(totalTokens),
                icon:  <Token />,
                color: theme.palette.info.main,
              },
              {
                label: 'Free (GitHub)',
                value: `${totalRequests ? Math.round(freeRequests / totalRequests * 100) : 0}%`,
                icon:  <CheckCircle />,
                color: theme.palette.success.main,
                sub:   `${formatNumber(freeRequests)} requests`,
              },
              {
                label: 'Paid Fallback',
                value: formatNumber(paidRequests),
                icon:  <Warning />,
                color: paidRequests > 0 ? theme.palette.error.main : theme.palette.success.main,
                sub:   paidRequests === 0 ? 'No credit burn! 🎉' : 'Credits consumed',
              },
              {
                label: 'Errors',
                value: totalErrors,
                icon:  <Error />,
                color: totalErrors > 0 ? theme.palette.error.main : theme.palette.text.secondary,
              },
              {
                label: 'Cost Today',
                value: `$${totalCost.toFixed(4)}`,
                icon:  <AttachMoney />,
                color: totalCost > 1 ? theme.palette.error.main : theme.palette.success.main,
                sub:   totalCost === 0 ? '🟢 $0.00 spent' : undefined,
              },
              {
                label: 'Avg P95 Latency',
                value: avgP95 ? `${avgP95}ms` : '—',
                icon:  <AccessTime />,
                color: avgP95 > 3000 ? theme.palette.error.main
                     : avgP95 > 1500 ? theme.palette.warning.main
                     : theme.palette.success.main,
                sub: p95Values.length ? `across ${p95Values.length} providers` : 'No data yet',
              },
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
                    <TableCell align="center"><strong>Test</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.entries(providers).map(([key, p]) => {
                    const meta     = PROVIDER_META[key] || { label: key, color: '#888', cost: '?' };
                    const isActive = metrics?.activeProvider === key;
                    return (
                      <TableRow key={key} sx={{ bgcolor: isActive ? alpha(theme.palette.success.main, 0.05) : 'inherit' }}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Circle sx={{
                              fontSize: 10,
                              color: isActive
                                ? 'success.main'
                                : p.errors > p.requests * 0.5
                                  ? 'error.main'
                                  : 'text.disabled',
                            }} />
                            <Box>
                              <Typography variant="body2" fontWeight={600} sx={{ color: meta.color }}>{meta.label}</Typography>
                              <Typography variant="caption" color="text.secondary">{meta.group}</Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          {isActive
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
                            ? (
                              <Typography
                                variant="body2"
                                sx={{
                                  color: p.p95_latency_ms > 3000 ? 'error.main'
                                       : p.p95_latency_ms > 1500 ? 'warning.main'
                                       : 'inherit',
                                }}
                              >
                                {p.p95_latency_ms}ms
                              </Typography>
                            )
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
                          <Chip
                            label={meta.cost}
                            size="small"
                            color={meta.cost === 'Free' ? 'success' : 'warning'}
                            variant="outlined"
                          />
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
                              {testing === key
                                ? <CircularProgress size={16} />
                                : <PlayArrow fontSize="small" />
                              }
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
            <Alert
              severity={testResult.success ? 'success' : 'error'}
              sx={{ mb: 3 }}
              onClose={() => setTestResult(null)}
            >
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
                return (
                  <React.Fragment key={provider}>
                    <Chip
                      icon={m.icon}
                      label={m.label}
                      color={m.color}
                      variant={i === 0 ? 'filled' : 'outlined'}
                      sx={{ fontWeight: i === 0 ? 700 : 400 }}
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

          {/* Quota Countdown Chip */}
          {quotaCountdown && (
            <Box sx={{ mb: 3 }}>
              <Chip
                size="small"
                icon={<AccessTime sx={{ fontSize: 14 }} />}
                label={quotaCountdown}
                variant="outlined"
              />
            </Box>
          )}

          {/* Failover Log — enhanced */}
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
                        <TableCell>
                          <Typography variant="caption">{new Date(log.timestamp).toLocaleString()}</Typography>
                        </TableCell>
                        <TableCell>
                          <Chip label={log.from || '—'} size="small" color="error" variant="outlined" />
                        </TableCell>
                        <TableCell>
                          {log.to
                            ? <Chip label={log.to} size="small" color="info" variant="outlined" />
                            : <Typography variant="caption" color="text.disabled">—</Typography>
                          }
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                            {log.service || '—'}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="caption">
                            {log.latencyMs ? `${log.latencyMs}ms` : '—'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption" sx={{ wordBreak: 'break-word' }}>{log.error}</Typography>
                        </TableCell>
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
        />
      )}

      {/* ═══════════════════ TAB 2: ANALYTICS ═══════════════════ */}
      {activeTab === 2 && (
        <AnalyticsTab history={history} theme={theme} />
      )}

      {/* ═══════════════════ CONFIG DIALOG ═══════════════════ */}
      <Dialog open={configOpen} onClose={() => setConfigOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>⚙️ LLM Routing Configuration</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Changes take effect immediately. No restart needed.
          </Typography>

          <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
            🔄 Provider Priority (drag to reorder)
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 1.5, display: 'block' }}>
            First provider is tried first. Use ▲▼ to set a paid model as primary when needed.
          </Typography>
          <Paper variant="outlined" sx={{ mb: 3, overflow: 'hidden' }}>
            {(editConfig.failoverChain || ['github-models', 'claude', 'grok']).map((provider, idx, arr) => {
              const chainProviderMeta = {
                'github-models': { label: '☁️ GitHub Models',  color: 'success',   cost: 'Free' },
                claude:          { label: '🟠 Anthropic Claude', color: 'warning',  cost: 'Paid' },
                grok:            { label: '🟣 xAI Grok',        color: 'secondary', cost: 'Paid' },
              };
              const info = chainProviderMeta[provider] || { label: provider, color: 'default', cost: '?' };
              return (
                <Box
                  key={provider}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    px: 2, py: 1.5,
                    borderBottom: idx < arr.length - 1 ? '1px solid' : 'none',
                    borderColor: 'divider',
                    bgcolor: idx === 0 ? alpha(theme.palette.primary.main, 0.06) : 'transparent',
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: idx === 0 ? 700 : 400, flex: 1 }}>
                    {idx + 1}. {info.label}
                  </Typography>
                  <Chip
                    size="small"
                    label={idx === 0 ? 'PRIMARY' : info.cost}
                    color={idx === 0 ? 'primary' : info.cost === 'Free' ? 'success' : 'error'}
                    variant={idx === 0 ? 'filled' : 'outlined'}
                    sx={{ mr: 1 }}
                  />
                  <IconButton
                    size="small"
                    disabled={idx === 0}
                    onClick={() => {
                      const chain = [...(editConfig.failoverChain || ['github-models', 'claude', 'grok'])];
                      [chain[idx - 1], chain[idx]] = [chain[idx], chain[idx - 1]];
                      setEditConfig({ ...editConfig, failoverChain: chain });
                    }}
                  >
                    <ArrowUpward fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    disabled={idx === arr.length - 1}
                    onClick={() => {
                      const chain = [...(editConfig.failoverChain || ['github-models', 'claude', 'grok'])];
                      [chain[idx], chain[idx + 1]] = [chain[idx + 1], chain[idx]];
                      setEditConfig({ ...editConfig, failoverChain: chain });
                    }}
                  >
                    <ArrowDownward fontSize="small" />
                  </IconButton>
                </Box>
              );
            })}
          </Paper>

          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>
            🎯 Model Selection (per provider)
          </Typography>

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>GitHub Models — Primary</InputLabel>
            <Select
              value={editConfig.primaryModels?.[0] || 'gpt-4.1'}
              label="GitHub Models — Primary"
              onChange={(e) => {
                const current = editConfig.primaryModels || ['gpt-4.1', 'gpt-4o'];
                setEditConfig({
                  ...editConfig,
                  primaryModels: [e.target.value, ...current.filter(m => m !== e.target.value)],
                });
              }}
            >
              {(availableModels?.githubModels || []).map(m => (
                <MenuItem key={m} value={m}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                    <span>{m}</span>
                    <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>
                      {MODEL_INFO[m]?.tier || '🟢 Free'} — {MODEL_INFO[m]?.note || ''}
                    </Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>GitHub Models — Tool-Calling</InputLabel>
            <Select
              value={editConfig.toolModel || 'gpt-4.1'}
              label="GitHub Models — Tool-Calling"
              onChange={(e) => setEditConfig({ ...editConfig, toolModel: e.target.value })}
            >
              {(availableModels?.githubModels || []).map(m => (
                <MenuItem key={m} value={m}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                    <span>{m}</span>
                    <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>
                      {MODEL_INFO[m]?.tier || '🟢 Free'} — {MODEL_INFO[m]?.note || ''}
                    </Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Anthropic — Claude Model</InputLabel>
            <Select
              value={editConfig.claudeModel || 'claude-sonnet-4-6'}
              label="Anthropic — Claude Model"
              onChange={(e) => setEditConfig({ ...editConfig, claudeModel: e.target.value })}
            >
              {(availableModels?.claude || []).map(m => (
                <MenuItem key={m} value={m}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                    <span>{m}</span>
                    <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>
                      {MODEL_INFO[m]?.note || ''}
                    </Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>xAI — Grok Model</InputLabel>
            <Select
              value={editConfig.grokModel || 'grok-3'}
              label="xAI — Grok Model"
              onChange={(e) => setEditConfig({ ...editConfig, grokModel: e.target.value })}
            >
              {(availableModels?.grok || []).map(m => (
                <MenuItem key={m} value={m}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                    <span>{m}</span>
                    <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>
                      {MODEL_INFO[m]?.note || ''}
                    </Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfigOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveConfig} variant="contained" color="primary">Save & Apply</Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
}
