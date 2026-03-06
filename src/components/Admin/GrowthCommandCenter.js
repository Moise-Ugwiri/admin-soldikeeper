/* eslint-disable */
import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  Chip,
  IconButton,
  Tooltip,
  LinearProgress,
  CircularProgress,
  Skeleton,
  Divider,
  useTheme,
  TablePagination,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  People,
  Star,
  Warning,
  Email,
  Refresh,
  TrendingUp,
  Shield,
  FlashOn,
  EmojiEvents,
  FilterList,
  Send,
  ArrowForward,
  SmartToy,
  FiberManualRecord,
} from '@mui/icons-material';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
} from 'recharts';
import {
  getWarRoomDashboard,
  getRevenueForecast,
  getChurnRiskDashboard,
  getUpsellOpportunities,
  getDripSequences,
  getReferralStats,
  getAiRecommendations,
} from '../../services/growthAPI';

const GREEN = '#00C853';
const ORANGE = '#FF6B35';
const RED = '#F44336';
const YELLOW = '#FFC107';
const PURPLE = '#9C27B0';
const GREY = '#757575';

const MRR_GOAL = 10000;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function TabPanel({ children, value, index }) {
  return value === index ? <Box sx={{ pt: 2 }}>{children}</Box> : null;
}

function StatCard({ title, value, sub, icon, color, loading }) {
  const theme = useTheme();
  return (
    <Card sx={{ height: '100%', bgcolor: alpha(color || theme.palette.primary.main, 0.08), border: `1px solid ${alpha(color || theme.palette.primary.main, 0.2)}` }}>
      <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: alpha(color || theme.palette.primary.main, 0.15), display: 'flex' }}>
          {React.cloneElement(icon, { sx: { color: color || theme.palette.primary.main, fontSize: 28 } })}
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="caption" color="text.secondary" noWrap>{title}</Typography>
          {loading ? (
            <Skeleton variant="text" width={80} height={32} />
          ) : (
            <Typography variant="h5" fontWeight={700} sx={{ color: color || 'text.primary' }}>{value}</Typography>
          )}
          {sub && <Typography variant="caption" color="text.secondary">{sub}</Typography>}
        </Box>
      </CardContent>
    </Card>
  );
}

// ─── War Room Tab ─────────────────────────────────────────────────────────────

function WarRoomTab() {
  const theme = useTheme();
  const [warRoom, setWarRoom] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [aiRecs, setAiRecs] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [wrRes, fcRes] = await Promise.all([
        getWarRoomDashboard(),
        getRevenueForecast(),
      ]);
      setWarRoom(wrRes.data);
      setForecast(fcRes.data);
    } catch (e) {
      setError('Failed to load War Room data. The backend endpoints may not be deployed yet.');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadAi = useCallback(async () => {
    setAiLoading(true);
    try {
      const res = await getAiRecommendations();
      setAiRecs(res.data);
    } catch {
      setAiRecs({ recommendations: ['Unable to load AI recommendations at this time.'] });
    } finally {
      setAiLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    loadAi();
    const interval = setInterval(loadData, 60000);
    return () => clearInterval(interval);
  }, [loadData, loadAi]);

  const mrr = warRoom?.currentMRR || 0;
  const progress = Math.min((mrr / MRR_GOAL) * 100, 100);
  const gap = Math.max(MRR_GOAL - mrr, 0);

  // Build chart data from forecast
  const chartData = (() => {
    if (!forecast) return [];
    const hist = (forecast.historical || []).map((d) => ({ month: d.month, historical: d.mrr, projected: null }));
    const proj = (forecast.projected || []).map((d) => ({ month: d.month, historical: null, projected: d.mrr }));
    return [...hist, ...proj];
  })();

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h4" fontWeight={800} sx={{ color: GREEN, letterSpacing: 2 }}>
            WARROOM 🎯
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Growth Command Center | Target: €10K MRR
          </Typography>
        </Box>
        <Tooltip title="Refresh data">
          <IconButton onClick={loadData} disabled={loading}>
            <Refresh sx={{ color: loading ? 'text.disabled' : GREEN }} />
          </IconButton>
        </Tooltip>
      </Box>

      {error && <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert>}

      {/* MRR Progress Card */}
      <Card sx={{ mb: 3, border: `1px solid ${alpha(GREEN, 0.3)}`, bgcolor: alpha(GREEN, 0.04) }}>
        <CardContent>
          <Typography variant="overline" color="text.secondary">Monthly Recurring Revenue</Typography>
          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 2, my: 1 }}>
            {loading ? (
              <Skeleton variant="text" width={160} height={56} />
            ) : (
              <>
                <Typography variant="h2" fontWeight={900} sx={{ color: GREEN }}>
                  €{mrr.toLocaleString()}
                </Typography>
                <Typography variant="h5" color="text.secondary">/ €{MRR_GOAL.toLocaleString()} goal</Typography>
              </>
            )}
          </Box>
          <LinearProgress
            variant={loading ? 'indeterminate' : 'determinate'}
            value={progress}
            sx={{
              height: 14,
              borderRadius: 7,
              mb: 1,
              bgcolor: alpha(GREEN, 0.15),
              '& .MuiLinearProgress-bar': { bgcolor: GREEN, borderRadius: 7 },
            }}
          />
          <Box sx={{ display: 'flex', gap: 4 }}>
            <Typography variant="caption" color="text.secondary">
              Gap to goal: <strong style={{ color: ORANGE }}>€{gap.toLocaleString()}</strong>
            </Typography>
            {warRoom?.dailyGrowthRequired && (
              <Typography variant="caption" color="text.secondary">
                Daily growth needed: <strong style={{ color: ORANGE }}>€{warRoom.dailyGrowthRequired}</strong>
              </Typography>
            )}
            <Typography variant="caption" color="text.secondary">
              Progress: <strong style={{ color: GREEN }}>{progress.toFixed(1)}%</strong>
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* KPI Row */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Users"
            value={loading ? '—' : (warRoom?.totalUsers || 0).toLocaleString()}
            icon={<People />}
            color={theme.palette.info.main}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Paid Users"
            value={loading ? '—' : (warRoom?.paidUsers || 0).toLocaleString()}
            sub={warRoom?.conversionRate ? `${warRoom.conversionRate}% conversion` : undefined}
            icon={<Star />}
            color={GREEN}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="At-Risk Users"
            value={loading ? '—' : (warRoom?.atRiskUsers || 0).toLocaleString()}
            icon={<Warning />}
            color={RED}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Campaigns"
            value={loading ? '—' : (warRoom?.activeCampaigns || 0).toLocaleString()}
            icon={<Email />}
            color={PURPLE}
            loading={loading}
          />
        </Grid>
      </Grid>

      {/* Revenue Forecast Chart */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={700} gutterBottom>
            📈 Revenue Forecast
          </Typography>
          {loading ? (
            <Skeleton variant="rectangular" height={280} />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <ComposedChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.5)} />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={(v) => `€${v.toLocaleString()}`} tick={{ fontSize: 11 }} />
                <RechartsTooltip formatter={(val, name) => [`€${(val || 0).toLocaleString()}`, name === 'historical' ? 'Historical MRR' : 'Projected MRR']} />
                <Legend />
                <ReferenceLine y={MRR_GOAL} stroke={RED} strokeDasharray="6 3" label={{ value: '€10K Target', fill: RED, fontSize: 11 }} />
                <Bar dataKey="historical" name="Historical MRR" fill={GREEN} radius={[4, 4, 0, 0]} />
                <Line dataKey="projected" name="Projected MRR" stroke={ORANGE} strokeWidth={2} strokeDasharray="6 3" dot={{ r: 4, fill: ORANGE }} connectNulls />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* AI Strategy Advisor */}
      <Card sx={{ mb: 3, border: `1px solid ${alpha(PURPLE, 0.3)}`, bgcolor: alpha(PURPLE, 0.04) }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SmartToy sx={{ color: PURPLE }} />
              <Typography variant="h6" fontWeight={700}>🤖 AI Growth Advisor</Typography>
            </Box>
            <Button
              size="small"
              startIcon={<Refresh />}
              onClick={loadAi}
              disabled={aiLoading}
              sx={{ color: PURPLE }}
            >
              Refresh
            </Button>
          </Box>
          {aiLoading ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} variant="text" height={24} />)}
            </Box>
          ) : aiRecs?.recommendations?.length ? (
            <Box component="ul" sx={{ pl: 2, m: 0 }}>
              {(aiRecs.recommendations || []).map((rec, i) => (
                <Box component="li" key={i} sx={{ mb: 1 }}>
                  <Typography variant="body2">{rec}</Typography>
                </Box>
              ))}
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary">No AI recommendations available. Click Refresh to load.</Typography>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats Row */}
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="overline" color="text.secondary">Referral Program</Typography>
              <Typography variant="h4" fontWeight={700} sx={{ color: GREEN }}>
                {loading ? '—' : (warRoom?.referralConversions || 0)}
              </Typography>
              <Typography variant="caption" color="text.secondary">conversions this month</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="overline" color="text.secondary">Upsell Opportunities</Typography>
              <Typography variant="h4" fontWeight={700} sx={{ color: ORANGE }}>
                {loading ? '—' : (warRoom?.upsellOpportunities || 0)}
              </Typography>
              <Typography variant="caption" color="text.secondary">users ready to upgrade</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="overline" color="text.secondary">Win-Back Campaigns</Typography>
              <Typography variant="h4" fontWeight={700} sx={{ color: PURPLE }}>
                {loading ? '—' : (warRoom?.winbackActive || 0)}
              </Typography>
              <Typography variant="caption" color="text.secondary">active sequences</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

// ─── Conversion (Drip Sequences) Tab ─────────────────────────────────────────

function ConversionTab() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [seqFilter, setSeqFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const rowsPerPage = 20;

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getDripSequences({ sequenceId: seqFilter || undefined, status: statusFilter || undefined, page: page + 1, limit: rowsPerPage });
      const d = res.data;
      setRows(Array.isArray(d?.sequences) ? d.sequences : Array.isArray(d) ? d : []);
      setTotal(d?.total || 0);
    } catch {
      setError('Failed to load drip sequences.');
    } finally {
      setLoading(false);
    }
  }, [seqFilter, statusFilter, page]);

  useEffect(() => { load(); }, [load]);

  const statusColor = { active: GREEN, paused: YELLOW, completed: GREY, converted: PURPLE };

  return (
    <Box>
      <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>🔄 Drip Sequences</Typography>
      {error && <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert>}
      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Sequence</InputLabel>
          <Select value={seqFilter} label="Sequence" onChange={(e) => { setSeqFilter(e.target.value); setPage(0); }}>
            <MenuItem value="">All</MenuItem>
            <MenuItem value="welcome">Welcome</MenuItem>
            <MenuItem value="trial_ending">Trial Ending</MenuItem>
            <MenuItem value="winback">Win-back</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Status</InputLabel>
          <Select value={statusFilter} label="Status" onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}>
            <MenuItem value="">All</MenuItem>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="paused">Paused</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
            <MenuItem value="converted">Converted</MenuItem>
          </Select>
        </FormControl>
        <IconButton onClick={load} disabled={loading}><Refresh /></IconButton>
      </Box>
      {loading ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {[...Array(6)].map((_, i) => <Skeleton key={i} variant="rectangular" height={48} />)}
        </Box>
      ) : (
        <>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>User Email</TableCell>
                  <TableCell>Sequence</TableCell>
                  <TableCell>Step</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Next Fire At</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.length === 0 ? (
                  <TableRow><TableCell colSpan={5} align="center"><Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>No drip sequences found</Typography></TableCell></TableRow>
                ) : rows.map((r, i) => (
                  <TableRow key={r._id || i} hover>
                    <TableCell>{r.userId?.email || r.email || '—'}</TableCell>
                    <TableCell><Typography variant="caption" sx={{ fontWeight: 600 }}>{r.sequenceId || '—'}</Typography></TableCell>
                    <TableCell>{r.currentStep || 0}/{r.totalSteps || 0}</TableCell>
                    <TableCell>
                      <Chip label={r.status || 'unknown'} size="small" sx={{ bgcolor: alpha(statusColor[r.status] || GREY, 0.15), color: statusColor[r.status] || GREY, fontWeight: 600, fontSize: 11 }} />
                    </TableCell>
                    <TableCell><Typography variant="caption">{r.nextFireAt ? new Date(r.nextFireAt).toLocaleString() : '—'}</Typography></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={total}
            page={page}
            onPageChange={(_, p) => setPage(p)}
            rowsPerPage={rowsPerPage}
            rowsPerPageOptions={[rowsPerPage]}
          />
        </>
      )}
    </Box>
  );
}

// ─── Retention (Churn Risk) Tab ───────────────────────────────────────────────

const TIER_CONFIG = {
  safe: { color: GREEN, label: 'Safe' },
  watch: { color: YELLOW, label: 'Watch' },
  at_risk: { color: ORANGE, label: 'At Risk' },
  critical: { color: RED, label: 'Critical' },
};

function RetentionTab() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tierFilter, setTierFilter] = useState('');
  const [page, setPage] = useState(0);
  const rowsPerPage = 20;

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getChurnRiskDashboard({ tier: tierFilter || undefined, page: page + 1, limit: rowsPerPage });
      setData(res.data);
    } catch {
      setError('Failed to load churn risk data.');
    } finally {
      setLoading(false);
    }
  }, [tierFilter, page]);

  useEffect(() => { load(); }, [load]);

  const users = Array.isArray(data?.users) ? data.users : [];
  const summary = data?.summary || {};

  return (
    <Box>
      <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>🛡️ Churn Risk Dashboard</Typography>
      {error && <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Tier Summary */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {Object.entries(TIER_CONFIG).map(([tier, cfg]) => (
          <Grid item xs={6} md={3} key={tier}>
            <Card sx={{ bgcolor: alpha(cfg.color, 0.08), border: `1px solid ${alpha(cfg.color, 0.25)}`, cursor: 'pointer', outline: tierFilter === tier ? `2px solid ${cfg.color}` : 'none' }}
              onClick={() => { setTierFilter(tierFilter === tier ? '' : tier); setPage(0); }}>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h4" fontWeight={800} sx={{ color: cfg.color }}>
                  {loading ? '—' : (summary[tier] || 0)}
                </Typography>
                <Typography variant="body2" color="text.secondary">{cfg.label}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Tier</InputLabel>
          <Select value={tierFilter} label="Tier" onChange={(e) => { setTierFilter(e.target.value); setPage(0); }}>
            <MenuItem value="">All</MenuItem>
            {Object.entries(TIER_CONFIG).map(([k, v]) => <MenuItem key={k} value={k}>{v.label}</MenuItem>)}
          </Select>
        </FormControl>
        <IconButton onClick={load} disabled={loading}><Refresh /></IconButton>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {[...Array(6)].map((_, i) => <Skeleton key={i} variant="rectangular" height={52} />)}
        </Box>
      ) : (
        <>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Email</TableCell>
                  <TableCell>Plan</TableCell>
                  <TableCell>Risk Score</TableCell>
                  <TableCell>Tier</TableCell>
                  <TableCell>Top Risk Factors</TableCell>
                  <TableCell>Last Login</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow><TableCell colSpan={7} align="center"><Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>No at-risk users found</Typography></TableCell></TableRow>
                ) : users.map((u, i) => {
                  const score = u.churnScore || 0;
                  const tier = u.tier || 'safe';
                  const tierCfg = TIER_CONFIG[tier] || TIER_CONFIG.safe;
                  return (
                    <TableRow key={u._id || i} hover>
                      <TableCell>{u.email || '—'}</TableCell>
                      <TableCell><Typography variant="caption" fontWeight={600}>{u.plan || '—'}</Typography></TableCell>
                      <TableCell sx={{ minWidth: 120 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LinearProgress variant="determinate" value={score} sx={{ flex: 1, height: 8, borderRadius: 4, bgcolor: alpha(RED, 0.15), '& .MuiLinearProgress-bar': { bgcolor: score > 70 ? RED : score > 40 ? ORANGE : GREEN } }} />
                          <Typography variant="caption" fontWeight={700}>{score}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip label={tierCfg.label} size="small" sx={{ bgcolor: alpha(tierCfg.color, 0.15), color: tierCfg.color, fontWeight: 600, fontSize: 11 }} />
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" color="text.secondary">{(u.riskFactors || []).slice(0, 2).join(', ') || '—'}</Typography>
                      </TableCell>
                      <TableCell><Typography variant="caption">{u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : '—'}</Typography></TableCell>
                      <TableCell>
                        <Tooltip title="Send email">
                          <IconButton size="small"><Send fontSize="small" /></IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={data?.total || 0}
            page={page}
            onPageChange={(_, p) => setPage(p)}
            rowsPerPage={rowsPerPage}
            rowsPerPageOptions={[rowsPerPage]}
          />
        </>
      )}
    </Box>
  );
}

// ─── Upsell Tab ───────────────────────────────────────────────────────────────

function UpsellTab() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const rowsPerPage = 20;

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getUpsellOpportunities({ status: statusFilter || undefined, page: page + 1, limit: rowsPerPage, sort: '-confidence' });
      const d = res.data;
      setRows(Array.isArray(d?.opportunities) ? d.opportunities : Array.isArray(d) ? d : []);
      setTotal(d?.total || 0);
    } catch {
      setError('Failed to load upsell opportunities.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, page]);

  useEffect(() => { load(); }, [load]);

  return (
    <Box>
      <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>📈 Upsell Opportunities</Typography>
      {error && <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert>}
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Status</InputLabel>
          <Select value={statusFilter} label="Status" onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}>
            <MenuItem value="">All</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="contacted">Contacted</MenuItem>
            <MenuItem value="converted">Converted</MenuItem>
            <MenuItem value="dismissed">Dismissed</MenuItem>
          </Select>
        </FormControl>
        <IconButton onClick={load} disabled={loading}><Refresh /></IconButton>
      </Box>
      {loading ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {[...Array(6)].map((_, i) => <Skeleton key={i} variant="rectangular" height={52} />)}
        </Box>
      ) : (
        <>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Email</TableCell>
                  <TableCell>Plan Upgrade</TableCell>
                  <TableCell>Trigger</TableCell>
                  <TableCell>Confidence</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Pitch Preview</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.length === 0 ? (
                  <TableRow><TableCell colSpan={7} align="center"><Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>No upsell opportunities found</Typography></TableCell></TableRow>
                ) : rows.map((r, i) => {
                  const conf = r.confidence || 0;
                  return (
                    <TableRow key={r._id || i} hover>
                      <TableCell>{r.email || r.userId?.email || '—'}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Typography variant="caption" fontWeight={600}>{r.currentPlan || '—'}</Typography>
                          <ArrowForward fontSize="small" sx={{ color: GREEN, fontSize: 14 }} />
                          <Typography variant="caption" fontWeight={700} sx={{ color: GREEN }}>{r.recommendedPlan || '—'}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell><Typography variant="caption">{r.trigger || '—'}</Typography></TableCell>
                      <TableCell sx={{ minWidth: 120 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LinearProgress variant="determinate" value={conf} sx={{ flex: 1, height: 8, borderRadius: 4, bgcolor: alpha(GREEN, 0.15), '& .MuiLinearProgress-bar': { bgcolor: conf > 70 ? GREEN : conf > 40 ? ORANGE : RED } }} />
                          <Typography variant="caption" fontWeight={700}>{conf}%</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip label={r.status || 'pending'} size="small" sx={{ fontWeight: 600, fontSize: 11 }} />
                      </TableCell>
                      <TableCell>
                        <Tooltip title={r.pitch || ''}>
                          <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: 180, display: 'block' }}>{r.pitch || '—'}</Typography>
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        <Tooltip title="Send upsell email">
                          <IconButton size="small"><Send fontSize="small" /></IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={total}
            page={page}
            onPageChange={(_, p) => setPage(p)}
            rowsPerPage={rowsPerPage}
            rowsPerPageOptions={[rowsPerPage]}
          />
        </>
      )}
    </Box>
  );
}

// ─── Acquisition (Referrals) Tab ──────────────────────────────────────────────

function AcquisitionTab() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getReferralStats();
      setData(res.data);
    } catch {
      setError('Failed to load referral stats.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const referrers = Array.isArray(data?.topReferrers) ? data.topReferrers : [];
  const overall = data?.overall || {};

  return (
    <Box>
      <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>🧲 Acquisition — Referral Program</Typography>
      {error && <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Overall Stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Codes Issued', value: overall.codesIssued || 0, color: GREEN },
          { label: 'Total Uses', value: overall.totalUses || 0, color: ORANGE },
          { label: 'Conversions', value: overall.totalConversions || 0, color: PURPLE },
          { label: 'Conversion Rate', value: `${overall.conversionRate || 0}%`, color: GREEN },
        ].map((stat) => (
          <Grid item xs={6} md={3} key={stat.label}>
            <Card sx={{ bgcolor: alpha(stat.color, 0.07), border: `1px solid ${alpha(stat.color, 0.2)}` }}>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                {loading ? <Skeleton variant="text" height={40} /> : (
                  <Typography variant="h4" fontWeight={800} sx={{ color: stat.color }}>{stat.value}</Typography>
                )}
                <Typography variant="caption" color="text.secondary">{stat.label}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Top Referrers Table */}
      <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>Top Referrers</Typography>
      {loading ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {[...Array(5)].map((_, i) => <Skeleton key={i} variant="rectangular" height={48} />)}
        </Box>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Email</TableCell>
                <TableCell>Referral Code</TableCell>
                <TableCell align="center">Uses</TableCell>
                <TableCell align="center">Conversions</TableCell>
                <TableCell align="center">Conv. Rate</TableCell>
                <TableCell>Reward Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {referrers.length === 0 ? (
                <TableRow><TableCell colSpan={6} align="center"><Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>No referral data available</Typography></TableCell></TableRow>
              ) : referrers.map((r, i) => {
                const rate = r.uses > 0 ? ((r.conversions / r.uses) * 100).toFixed(1) : '0.0';
                return (
                  <TableRow key={r._id || i} hover>
                    <TableCell>{r.email || '—'}</TableCell>
                    <TableCell><Typography variant="caption" fontWeight={700} sx={{ color: GREEN, fontFamily: 'monospace' }}>{r.code || '—'}</Typography></TableCell>
                    <TableCell align="center">{r.uses || 0}</TableCell>
                    <TableCell align="center">{r.conversions || 0}</TableCell>
                    <TableCell align="center">
                      <Typography variant="caption" fontWeight={700} sx={{ color: parseFloat(rate) > 20 ? GREEN : ORANGE }}>{rate}%</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={r.rewardStatus || 'pending'} size="small" sx={{ fontWeight: 600, fontSize: 11 }} />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}

// ─── Main GrowthCommandCenter Component ──────────────────────────────────────

export default function GrowthCommandCenter() {
  const [tab, setTab] = useState(0);
  const theme = useTheme();

  return (
    <Box sx={{ p: { xs: 1, md: 2 } }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 1 }}>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ '& .MuiTab-root': { fontWeight: 600, minWidth: 120 } }}
        >
          <Tab label="War Room" icon={<FlashOn />} iconPosition="start" />
          <Tab label="Conversion" icon={<TrendingUp />} iconPosition="start" />
          <Tab label="Retention" icon={<Shield />} iconPosition="start" />
          <Tab label="Upsell" icon={<EmojiEvents />} iconPosition="start" />
          <Tab label="Acquisition" icon={<People />} iconPosition="start" />
        </Tabs>
      </Box>
      <TabPanel value={tab} index={0}><WarRoomTab /></TabPanel>
      <TabPanel value={tab} index={1}><ConversionTab /></TabPanel>
      <TabPanel value={tab} index={2}><RetentionTab /></TabPanel>
      <TabPanel value={tab} index={3}><UpsellTab /></TabPanel>
      <TabPanel value={tab} index={4}><AcquisitionTab /></TabPanel>
    </Box>
  );
}
