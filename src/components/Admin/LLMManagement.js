import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Paper, Grid, Card, CardContent, Chip, Button,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Dialog, DialogTitle, DialogContent, DialogActions,
  FormControl, InputLabel, Select, MenuItem, IconButton, Tooltip,
  Alert, Divider,
  CircularProgress, Stack, alpha, useTheme
} from '@mui/material';
import {
  SmartToy, Speed, Warning, CheckCircle, Error,
  Refresh, Settings, PlayArrow, Token,
  CloudQueue, Memory, ArrowForward, Circle,
  ArrowUpward, ArrowDownward
} from '@mui/icons-material';
import websocketService from '../../services/websocketService';
import api from '../../services/api';

const PROVIDER_META = {
  'github-models/gpt-4.1': { label: 'GPT-4.1', color: '#10a37f', group: 'GitHub Models', cost: 'Free' },
  'github-models/gpt-4o':  { label: 'GPT-4o',  color: '#10a37f', group: 'GitHub Models', cost: 'Free' },
  'github-models/gpt-4.1-mini': { label: 'GPT-4.1-mini', color: '#10a37f', group: 'GitHub Models', cost: 'Free' },
  'github-models/gpt-4o-mini':  { label: 'GPT-4o-mini',  color: '#10a37f', group: 'GitHub Models', cost: 'Free' },
  'github-models/o4-mini': { label: 'o4-mini', color: '#10a37f', group: 'GitHub Models', cost: 'Free' },
  'claude':  { label: 'Claude Sonnet', color: '#d97706', group: 'Anthropic', cost: 'Paid' },
  'grok':    { label: 'Grok-3',       color: '#6366f1', group: 'xAI',       cost: 'Paid' },
  'openai':  { label: 'OpenAI Direct', color: '#10a37f', group: 'OpenAI',   cost: 'Paid' },
};

const MODEL_INFO = {
  // GitHub Models — Free tier
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
  'Mistral-Large-2':  { tier: '🟢 Free', note: 'Mistral flagship' },
  'Mistral-Small':    { tier: '🟢 Free', note: 'Mistral lightweight' },
  'Cohere-command-r-plus': { tier: '🟢 Free', note: 'Cohere RAG-optimized' },
  'Cohere-command-r':      { tier: '🟢 Free', note: 'Cohere lightweight' },
  'DeepSeek-R1':     { tier: '🟢 Free', note: 'DeepSeek reasoning model' },
  // Anthropic — Paid
  'claude-sonnet-4-6':          { tier: '🔴 Paid', note: 'Latest Sonnet, best balance' },
  'claude-sonnet-4-5-20241022': { tier: '🔴 Paid', note: 'Previous Sonnet 4.5' },
  'claude-haiku-4-5':           { tier: '🔴 Paid', note: 'Fast & cheap Anthropic' },
  'claude-opus-4':              { tier: '🔴 Paid', note: 'Most capable, expensive' },
  'claude-3-5-sonnet-20241022': { tier: '🔴 Paid', note: 'Claude 3.5 Sonnet' },
  'claude-3-5-haiku-20241022':  { tier: '🔴 Paid', note: 'Claude 3.5 Haiku' },
  'claude-3-opus-20240229':     { tier: '🔴 Paid', note: 'Claude 3 Opus' },
  // xAI — Paid
  'grok-3':      { tier: '🔴 Paid', note: 'xAI flagship' },
  'grok-3-mini': { tier: '🔴 Paid', note: 'xAI lightweight' },
  'grok-2':      { tier: '🔴 Paid', note: 'Previous gen' },
};

function formatNumber(n) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return String(n);
}

export default function LLMManagement() {
  const theme = useTheme();
  const [metrics, setMetrics] = useState(null);
  const [config, setConfig] = useState(null);
  const [availableModels, setAvailableModels] = useState(null);
  const [loading, setLoading] = useState(true);
  const [configOpen, setConfigOpen] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [testing, setTesting] = useState(null);
  const [editConfig, setEditConfig] = useState({});
  // WebSocket is managed by websocketService singleton

  const fetchMetrics = useCallback(async () => {
    try {
      const [metricsRes, configRes] = await Promise.all([
        api.get('/admin/llm/metrics'),
        api.get('/admin/llm/config')
      ]);
      if (metricsRes.data.success) setMetrics(metricsRes.data);
      if (configRes.data.success) {
        setConfig(configRes.data.config);
        setAvailableModels(configRes.data.availableModels);
        setEditConfig(configRes.data.config);
      }
    } catch (err) {
      console.error('Failed to fetch LLM metrics:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMetrics(); }, [fetchMetrics]);

  // Real-time WebSocket updates
  useEffect(() => {
    const handler = (data) => setMetrics(data);
    websocketService.on('llm:metrics:update', handler);
    return () => websocketService.off('llm:metrics:update', handler);
  }, []);

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

  if (loading) return <Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress /><Typography sx={{ mt: 2 }}>Loading LLM metrics...</Typography></Box>;

  const providers = metrics?.providers || {};
  const totalRequests = Object.values(providers).reduce((s, p) => s + p.requests, 0);
  const totalTokens = Object.values(providers).reduce((s, p) => s + p.total_tokens, 0);
  const totalErrors = Object.values(providers).reduce((s, p) => s + p.errors, 0);
  const freeRequests = Object.entries(providers).filter(([k]) => k.startsWith('github-models')).reduce((s, [, p]) => s + p.requests, 0);
  const paidRequests = totalRequests - freeRequests;

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 1 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>🧠 LLM Control Center</Typography>
          <Typography variant="body2" color="text.secondary">
            Active: <Chip size="small" label={metrics?.activeProvider || 'Unknown'} color="success" sx={{ ml: 0.5 }} />
            {metrics?.claudeDown && <Chip size="small" label="Claude DOWN" color="error" sx={{ ml: 1 }} />}
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button startIcon={<Refresh />} onClick={fetchMetrics} variant="outlined" size="small">Refresh</Button>
          <Button startIcon={<Settings />} onClick={() => setConfigOpen(true)} variant="contained" size="small">Configure</Button>
        </Stack>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Total Requests', value: formatNumber(totalRequests), icon: <Speed />, color: theme.palette.primary.main },
          { label: 'Total Tokens', value: formatNumber(totalTokens), icon: <Token />, color: theme.palette.info.main },
          { label: 'Free (GitHub)', value: `${totalRequests ? Math.round(freeRequests / totalRequests * 100) : 0}%`, icon: <CheckCircle />, color: theme.palette.success.main, sub: `${formatNumber(freeRequests)} requests` },
          { label: 'Paid Fallback', value: formatNumber(paidRequests), icon: <Warning />, color: paidRequests > 0 ? theme.palette.error.main : theme.palette.success.main, sub: paidRequests === 0 ? 'No credit burn! 🎉' : 'Credits consumed' },
          { label: 'Errors', value: totalErrors, icon: <Error />, color: totalErrors > 0 ? theme.palette.error.main : theme.palette.text.secondary },
        ].map((kpi, i) => (
          <Grid size={{ xs: 6, sm: 4, md: 2.4 }} key={i}>
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
                <TableCell align="right"><strong>Errors</strong></TableCell>
                <TableCell align="center"><strong>Cost</strong></TableCell>
                <TableCell align="center"><strong>Test</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Object.entries(providers).map(([key, p]) => {
                const meta = PROVIDER_META[key] || { label: key, color: '#888', cost: '?' };
                const isActive = metrics?.activeProvider === key;
                return (
                  <TableRow key={key} sx={{ bgcolor: isActive ? alpha(theme.palette.success.main, 0.05) : 'inherit' }}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Circle sx={{ fontSize: 10, color: isActive ? 'success.main' : p.errors > p.requests * 0.5 ? 'error.main' : 'text.disabled' }} />
                        <Box>
                          <Typography variant="body2" fontWeight={600} sx={{ color: meta.color }}>{meta.label}</Typography>
                          <Typography variant="caption" color="text.secondary">{meta.group}</Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      {isActive ? <Chip label="Active" size="small" color="success" /> : p.last_used ? <Chip label="Standby" size="small" variant="outlined" /> : <Chip label="Idle" size="small" />}
                    </TableCell>
                    <TableCell align="right"><strong>{formatNumber(p.requests)}</strong></TableCell>
                    <TableCell align="right">{formatNumber(p.tokens_in)}</TableCell>
                    <TableCell align="right">{formatNumber(p.tokens_out)}</TableCell>
                    <TableCell align="right">{p.avg_latency_ms ? `${p.avg_latency_ms}ms` : '—'}</TableCell>
                    <TableCell align="right" sx={{ color: p.errors > 0 ? 'error.main' : 'inherit' }}>{p.errors}</TableCell>
                    <TableCell align="center">
                      <Chip label={meta.cost} size="small" color={meta.cost === 'Free' ? 'success' : 'warning'} variant="outlined" />
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title={`Test ${meta.label}`}>
                        <IconButton size="small" onClick={() => handleTest(key.startsWith('github') ? 'github-models' : key, key.includes('/') ? key.split('/')[1] : undefined)} disabled={testing !== null}>
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
            const chainMeta = { 'github-models': { icon: <CloudQueue />, color: 'success', label: `GitHub: ${(config?.primaryModels || ['gpt-4.1'])[0]}` }, claude: { icon: <Memory />, color: 'warning', label: config?.claudeModel || 'claude-sonnet-4-6' }, grok: { icon: <SmartToy />, color: 'secondary', label: config?.grokModel || 'grok-3' } };
            const m = chainMeta[provider] || { icon: <Circle />, color: 'default', label: provider };
            return (
              <React.Fragment key={provider}>
                <Chip icon={m.icon} label={m.label} color={m.color} variant={i === 0 ? 'filled' : 'outlined'} sx={{ fontWeight: i === 0 ? 700 : 400 }} />
                {i < arr.length - 1 && <ArrowForward sx={{ color: 'text.disabled', fontSize: 18 }} />}
              </React.Fragment>
            );
          })}
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          First = Primary • Green = Free (GitHub Models) • Orange = Anthropic • Purple = xAI
        </Typography>
      </Paper>

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
                  <TableCell><strong>Error</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {[...metrics.failoverLog].reverse().slice(0, 10).map((log, i) => (
                  <TableRow key={i}>
                    <TableCell><Typography variant="caption">{new Date(log.timestamp).toLocaleString()}</Typography></TableCell>
                    <TableCell><Chip label={log.from} size="small" color="error" variant="outlined" /></TableCell>
                    <TableCell><Typography variant="caption" sx={{ wordBreak: 'break-word' }}>{log.error}</Typography></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Config Dialog */}
      <Dialog open={configOpen} onClose={() => setConfigOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>⚙️ LLM Routing Configuration</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Changes take effect immediately. No restart needed.
          </Typography>

          {/* Failover Chain Order */}
          <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
            🔄 Provider Priority (drag to reorder)
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 1.5, display: 'block' }}>
            First provider is tried first. Use ▲▼ to set a paid model as primary when needed.
          </Typography>
          <Paper variant="outlined" sx={{ mb: 3, overflow: 'hidden' }}>
            {(editConfig.failoverChain || ['github-models', 'claude', 'grok']).map((provider, idx, arr) => {
              const meta = { 'github-models': { label: '☁️ GitHub Models', color: 'success', cost: 'Free' }, claude: { label: '🟠 Anthropic Claude', color: 'warning', cost: 'Paid' }, grok: { label: '🟣 xAI Grok', color: 'secondary', cost: 'Paid' } };
              const info = meta[provider] || { label: provider, color: 'default', cost: '?' };
              return (
                <Box key={provider} sx={{ display: 'flex', alignItems: 'center', px: 2, py: 1.5, borderBottom: idx < arr.length - 1 ? '1px solid' : 'none', borderColor: 'divider', bgcolor: idx === 0 ? alpha(theme.palette.primary.main, 0.06) : 'transparent' }}>
                  <Typography variant="body2" sx={{ fontWeight: idx === 0 ? 700 : 400, flex: 1 }}>
                    {idx + 1}. {info.label}
                  </Typography>
                  <Chip size="small" label={idx === 0 ? 'PRIMARY' : info.cost} color={idx === 0 ? 'primary' : info.cost === 'Free' ? 'success' : 'error'} variant={idx === 0 ? 'filled' : 'outlined'} sx={{ mr: 1 }} />
                  <IconButton size="small" disabled={idx === 0} onClick={() => {
                    const chain = [...(editConfig.failoverChain || ['github-models', 'claude', 'grok'])];
                    [chain[idx - 1], chain[idx]] = [chain[idx], chain[idx - 1]];
                    setEditConfig({ ...editConfig, failoverChain: chain });
                  }}><ArrowUpward fontSize="small" /></IconButton>
                  <IconButton size="small" disabled={idx === arr.length - 1} onClick={() => {
                    const chain = [...(editConfig.failoverChain || ['github-models', 'claude', 'grok'])];
                    [chain[idx], chain[idx + 1]] = [chain[idx + 1], chain[idx]];
                    setEditConfig({ ...editConfig, failoverChain: chain });
                  }}><ArrowDownward fontSize="small" /></IconButton>
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
                setEditConfig({ ...editConfig, primaryModels: [e.target.value, ...current.filter(m => m !== e.target.value)] });
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
