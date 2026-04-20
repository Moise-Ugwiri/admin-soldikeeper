/* eslint-disable */
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Chip, TextField, FormControl,
  InputLabel, Select, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions,
  Alert, Tabs, Tab, LinearProgress, IconButton, Tooltip, useTheme, Snackbar,
  Pagination, Stack, Divider, Avatar, Skeleton, InputAdornment, Badge
} from '@mui/material';
import {
  Security, Shield, Download, Visibility, Check, Warning, Error as ErrorIcon,
  Info, Search, Refresh, Edit, Public, FiberManualRecord, Close, CheckCircle,
  Cancel, PlayArrow, Description, History, Gavel, FilterList
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useAdminData } from '../../contexts/AdminContext';

// ── Helpers ─────────────────────────────────────────────────────────────────
const SEVERITY_COLORS = {
  CRITICAL: 'error',
  HIGH: 'warning',
  MEDIUM: 'info',
  LOW: 'default'
};

const STATUS_COLORS = {
  compliant: 'success',
  at_risk: 'warning',
  non_compliant: 'error'
};

const STATUS_LABELS = {
  compliant: 'Compliant',
  at_risk: 'At risk',
  non_compliant: 'Non-compliant'
};

const REGION_FLAGS = { EU: '🇪🇺', US: '🇺🇸', AMERICAS: '🌎', AFRICA: '🌍', ASIA: '🌏', OCEANIA: '🇦🇺' };

const formatDate = (d) => {
  if (!d) return '—';
  try { return new Date(d).toLocaleString(); } catch { return String(d); }
};

const downloadBlob = (data, filename, mime = 'text/csv') => {
  const blob = data instanceof Blob ? data : new Blob([data], { type: mime });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};

// ── Component ───────────────────────────────────────────────────────────────
const ComplianceAudit = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const {
    complianceData,
    loading,
    fetchComplianceData,
    processGdprRequest,
    exportAuditLogs,
    exportSingleAuditLog,
    fetchCompliancePolicies,
    updateCompliancePolicy
  } = useAdminData();

  // Filters / pagination
  const [activeTab, setActiveTab] = useState(0);
  const [dateRange, setDateRange] = useState('last7days');
  const [actionFilter, setActionFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [jurisdictionFilter, setJurisdictionFilter] = useState('all');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(25);

  // UI state
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [logModalOpen, setLogModalOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [gdprModalOpen, setGdprModalOpen] = useState(false);
  const [selectedGdpr, setSelectedGdpr] = useState(null);
  const [gdprNotes, setGdprNotes] = useState('');
  const [processingGdpr, setProcessingGdpr] = useState(false);

  // Policies
  const [policies, setPolicies] = useState([]);
  const [policiesLoading, setPoliciesLoading] = useState(false);
  const [policyDialogOpen, setPolicyDialogOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState(null);

  // Reports tab state
  const [reportRange, setReportRange] = useState('last30days');
  const [exporting, setExporting] = useState(null); // 'audit-csv' | 'gdpr-csv'

  // Realtime hint badges
  const realtimeTickRef = useRef(complianceData?._realtimeTick || 0);
  const [realtimeBadge, setRealtimeBadge] = useState(0);

  const showSnack = (message, severity = 'info') =>
    setSnackbar({ open: true, message, severity });

  // Debounce search input → search query
  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(1); }, 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  // Reset page when filters change
  useEffect(() => { setPage(1); }, [dateRange, actionFilter, severityFilter, jurisdictionFilter]);

  // Fetch data when filters or page change
  const refetch = useCallback(() => {
    if (!fetchComplianceData) return;
    fetchComplianceData({
      dateRange, search, actionFilter, severityFilter, jurisdictionFilter, page, limit
    }).catch(err => showSnack(err.message || 'Failed to load compliance data', 'error'));
  }, [fetchComplianceData, dateRange, search, actionFilter, severityFilter, jurisdictionFilter, page, limit]);

  useEffect(() => { refetch(); }, [refetch]);

  // Realtime: when reducer ticks _realtimeTick, show "+N new" badge
  useEffect(() => {
    const tick = complianceData?._realtimeTick || 0;
    if (tick && tick !== realtimeTickRef.current) {
      realtimeTickRef.current = tick;
      setRealtimeBadge(b => b + 1);
    }
  }, [complianceData?._realtimeTick]);

  // Load policies once
  useEffect(() => {
    if (!fetchCompliancePolicies) return;
    setPoliciesLoading(true);
    fetchCompliancePolicies()
      .then(data => setPolicies(data?.policies || []))
      .catch(err => showSnack(err.message || 'Failed to load policies', 'error'))
      .finally(() => setPoliciesLoading(false));
  }, [fetchCompliancePolicies]);

  // Realtime: refresh policies on policy update tick
  useEffect(() => {
    if (complianceData?._policyTick && fetchCompliancePolicies) {
      fetchCompliancePolicies().then(data => setPolicies(data?.policies || [])).catch(() => {});
    }
  }, [complianceData?._policyTick, fetchCompliancePolicies]);

  // Derived data
  const auditLogs = complianceData?.auditLogs || [];
  const gdprRequests = complianceData?.gdprRequests || [];
  const gdprStats = complianceData?.gdprStats || {};
  const complianceMetrics = complianceData?.complianceMetrics || [];
  const jurisdictionMatrix = complianceData?.jurisdictionMatrix || [];
  const availableActions = complianceData?.availableActions || [];
  const stats = complianceData?.stats || {};
  const pagination = complianceData?.pagination || { page: 1, totalPages: 1, total: 0 };

  // Group jurisdictions by region for the matrix card
  const jurisdictionsByRegion = useMemo(() => {
    const out = {};
    jurisdictionMatrix.forEach(j => {
      out[j.region] = out[j.region] || [];
      out[j.region].push(j);
    });
    return out;
  }, [jurisdictionMatrix]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleExportAll = async (format = 'csv') => {
    setExporting('audit-' + format);
    try {
      const blob = await exportAuditLogs(format, reportRange);
      // exportAuditLogs in context already triggers download — but it returns the blob too.
      showSnack('Audit log export ready', 'success');
    } catch (err) {
      showSnack(err.message || 'Export failed', 'error');
    } finally {
      setExporting(null);
    }
  };

  const handleExportSingle = async (logId) => {
    try {
      await exportSingleAuditLog(logId);
      showSnack('Audit log exported', 'success');
    } catch (err) {
      showSnack(err.message || 'Export failed', 'error');
    }
  };

  const handleExportGdpr = async () => {
    setExporting('gdpr-csv');
    try {
      const headers = ['ID', 'Email', 'Type', 'Status', 'Requested', 'Due', 'Completed', 'Notes'];
      const rows = gdprRequests.map(r => [
        r.id, r.email, r.type, r.status,
        formatDate(r.requestDate), formatDate(r.dueDate),
        r.completedDate ? formatDate(r.completedDate) : '',
        (r.notes || '').replace(/"/g, "'")
      ]);
      const csv = [headers.join(','), ...rows.map(row => row.map(c => `"${c}"`).join(','))].join('\n');
      downloadBlob(csv, `gdpr_requests_${Date.now()}.csv`);
      showSnack('GDPR requests exported', 'success');
    } catch (err) {
      showSnack(err.message || 'Export failed', 'error');
    } finally {
      setExporting(null);
    }
  };

  const handleProcessGdpr = async (action) => {
    if (!selectedGdpr) return;
    setProcessingGdpr(true);
    try {
      await processGdprRequest(selectedGdpr.id, action, gdprNotes);
      showSnack(`GDPR request ${action === 'complete' ? 'completed' : action === 'reject' ? 'rejected' : 'updated'}`, 'success');
      setGdprModalOpen(false);
      setSelectedGdpr(null);
      setGdprNotes('');
    } catch (err) {
      showSnack(err.message || 'Failed to process GDPR request', 'error');
    } finally {
      setProcessingGdpr(false);
    }
  };

  const openGdprModal = (req) => {
    setSelectedGdpr(req);
    setGdprNotes(req.notes || '');
    setGdprModalOpen(true);
  };

  const handleSavePolicy = async () => {
    if (!editingPolicy) return;
    try {
      const updated = await updateCompliancePolicy(editingPolicy.id, {
        title: editingPolicy.title,
        summary: editingPolicy.summary,
        body: editingPolicy.body,
        version: editingPolicy.version,
        status: editingPolicy.status
      });
      setPolicies(p => p.map(x => x.id === updated.id ? updated : x));
      showSnack(`Policy "${updated.title}" saved (v${updated.version})`, 'success');
      setPolicyDialogOpen(false);
      setEditingPolicy(null);
    } catch (err) {
      showSnack(err.message || 'Failed to save policy', 'error');
    }
  };

  const handleAcknowledgeRefresh = () => {
    setRealtimeBadge(0);
    refetch();
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Stack direction="row" spacing={1} alignItems="center">
            <Shield color="primary" sx={{ fontSize: 32 }} />
            <Typography variant="h4">Compliance & Audit</Typography>
            {realtimeBadge > 0 && (
              <Badge color="error" badgeContent={realtimeBadge}>
                <Tooltip title="New realtime events — click to refresh">
                  <IconButton size="small" onClick={handleAcknowledgeRefresh}>
                    <Refresh />
                  </IconButton>
                </Tooltip>
              </Badge>
            )}
          </Stack>
          <Typography variant="body2" color="text.secondary">
            Multi-jurisdiction compliance monitoring · EU · US · Africa · Asia · LATAM · Oceania
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Date range</InputLabel>
            <Select label="Date range" value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
              <MenuItem value="today">Today</MenuItem>
              <MenuItem value="last7days">Last 7 days</MenuItem>
              <MenuItem value="last30days">Last 30 days</MenuItem>
              <MenuItem value="last90days">Last 90 days</MenuItem>
              <MenuItem value="last365days">Last year</MenuItem>
            </Select>
          </FormControl>
          <Button variant="outlined" startIcon={<Refresh />} onClick={refetch} disabled={loading}>
            Refresh
          </Button>
        </Stack>
      </Stack>

      {loading && <LinearProgress sx={{ mb: 2 }} />}

      {/* Top metric cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {(complianceMetrics.length ? complianceMetrics : Array.from({ length: 4 })).map((m, i) => (
          <Grid item xs={12} sm={6} md={3} key={i}>
            {m ? (
              <Card>
                <CardContent>
                  <Typography variant="overline" color="text.secondary">{m.title}</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>{m.value}</Typography>
                  <Chip
                    size="small"
                    label={m.status.replace('_', ' ')}
                    color={m.status === 'excellent' ? 'success' : m.status === 'good' ? 'info' : 'warning'}
                    sx={{ mt: 1, mb: 0.5 }}
                  />
                  <Typography variant="caption" color="text.secondary" display="block">
                    {m.description}
                  </Typography>
                </CardContent>
              </Card>
            ) : <Skeleton variant="rounded" height={140} />}
          </Grid>
        ))}
      </Grid>

      {/* Tabs */}
      <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tab icon={<Public />} iconPosition="start" label="Jurisdictions" />
        <Tab icon={<History />} iconPosition="start" label={`Audit logs (${pagination.total})`} />
        <Tab icon={<Gavel />} iconPosition="start" label={`GDPR/Rights (${gdprRequests.length})`} />
        <Tab icon={<Description />} iconPosition="start" label={`Policies (${policies.length})`} />
        <Tab icon={<Download />} iconPosition="start" label="Reports" />
      </Tabs>

      {/* Tab 0: Jurisdictions matrix */}
      {activeTab === 0 && (
        <Box>
          {jurisdictionMatrix.length === 0 && !loading && (
            <Alert severity="info">No jurisdiction data available yet.</Alert>
          )}
          {Object.entries(jurisdictionsByRegion).map(([region, items]) => (
            <Box key={region} sx={{ mb: 3 }}>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
                <Typography variant="h6">{REGION_FLAGS[region] || '🌐'} {region}</Typography>
                <Chip size="small" label={`${items.length} framework${items.length > 1 ? 's' : ''}`} />
              </Stack>
              <Grid container spacing={2}>
                {items.map(j => (
                  <Grid item xs={12} sm={6} md={4} key={j.id}>
                    <Card sx={{ borderLeft: `4px solid ${j.color}`, height: '100%' }}>
                      <CardContent>
                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                          <Box>
                            <Typography variant="h6" sx={{ fontSize: '1rem' }}>{j.name}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {j.fullName}
                            </Typography>
                          </Box>
                          <Chip
                            size="small"
                            label={STATUS_LABELS[j.status] || j.status}
                            color={STATUS_COLORS[j.status] || 'default'}
                          />
                        </Stack>
                        <Divider sx={{ my: 1.5 }} />
                        <Grid container spacing={1}>
                          <Grid item xs={6}>
                            <Typography variant="caption" color="text.secondary">Rights honored</Typography>
                            <Typography variant="body1" sx={{ fontWeight: 600 }}>{j.rightsHonoredPct}%</Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="caption" color="text.secondary">SLA</Typography>
                            <Typography variant="body1" sx={{ fontWeight: 600 }}>{j.slaDays} days</Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="caption" color="text.secondary">Overdue</Typography>
                            <Typography variant="body1" sx={{ fontWeight: 600, color: j.overdueRequests ? 'error.main' : 'text.primary' }}>
                              {j.overdueRequests}
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="caption" color="text.secondary">Events (period)</Typography>
                            <Typography variant="body1" sx={{ fontWeight: 600 }}>{j.eventsInPeriod}</Typography>
                          </Grid>
                        </Grid>
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Countries: {j.countries.join(', ')}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Breach SLA: {j.breachNotificationHours}h
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          ))}
        </Box>
      )}

      {/* Tab 1: Audit logs */}
      {activeTab === 1 && (
        <Box>
          {/* Filters */}
          <Paper sx={{ p: 2, mb: 2 }}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
              <TextField
                size="small" placeholder="Search action, IP, resource…" fullWidth
                value={searchInput} onChange={(e) => setSearchInput(e.target.value)}
                InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }}
              />
              <FormControl size="small" sx={{ minWidth: 160 }}>
                <InputLabel>Action</InputLabel>
                <Select label="Action" value={actionFilter} onChange={(e) => setActionFilter(e.target.value)}>
                  <MenuItem value="all">All actions</MenuItem>
                  {availableActions.map(a => <MenuItem key={a} value={a}>{a}</MenuItem>)}
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 140 }}>
                <InputLabel>Severity</InputLabel>
                <Select label="Severity" value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value)}>
                  <MenuItem value="all">All severities</MenuItem>
                  <MenuItem value="CRITICAL">Critical</MenuItem>
                  <MenuItem value="HIGH">High</MenuItem>
                  <MenuItem value="MEDIUM">Medium</MenuItem>
                  <MenuItem value="LOW">Low</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 160 }}>
                <InputLabel>Jurisdiction</InputLabel>
                <Select label="Jurisdiction" value={jurisdictionFilter} onChange={(e) => setJurisdictionFilter(e.target.value)}>
                  <MenuItem value="all">All jurisdictions</MenuItem>
                  {jurisdictionMatrix.map(j => <MenuItem key={j.id} value={j.id}>{j.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Stack>
          </Paper>

          {/* Table */}
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Time</TableCell>
                  <TableCell>User</TableCell>
                  <TableCell>Action</TableCell>
                  <TableCell>Resource</TableCell>
                  <TableCell>IP</TableCell>
                  <TableCell>Severity</TableCell>
                  <TableCell>Jurisdictions</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {auditLogs.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={8}>
                      <Box sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
                        <History sx={{ fontSize: 48, opacity: 0.4 }} />
                        <Typography>No audit logs match the current filters.</Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
                {auditLogs.map(log => (
                  <TableRow key={log.id} hover sx={log._realtime ? { bgcolor: 'action.hover' } : {}}>
                    <TableCell>
                      {log._realtime && (
                        <Tooltip title="Just now (realtime)">
                          <FiberManualRecord color="success" sx={{ fontSize: 10, mr: 0.5 }} />
                        </Tooltip>
                      )}
                      {formatDate(log.timestamp)}
                    </TableCell>
                    <TableCell>{log.user}</TableCell>
                    <TableCell><code>{log.action}</code></TableCell>
                    <TableCell>{log.resource}</TableCell>
                    <TableCell><code>{log.ipAddress || '—'}</code></TableCell>
                    <TableCell>
                      <Chip size="small" label={log.severity} color={SEVERITY_COLORS[log.severity] || 'default'} />
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                        {(log.jurisdictions || []).slice(0, 3).map(j => (
                          <Chip key={j} size="small" label={j.toUpperCase()} variant="outlined" />
                        ))}
                        {(log.jurisdictions || []).length > 3 && (
                          <Chip size="small" label={`+${log.jurisdictions.length - 3}`} variant="outlined" />
                        )}
                      </Stack>
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="View details">
                        <IconButton size="small" onClick={() => { setSelectedLog(log); setLogModalOpen(true); }}>
                          <Visibility fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Export this row as CSV">
                        <IconButton size="small" onClick={() => handleExportSingle(log.id)}>
                          <Download fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <Stack direction="row" justifyContent="center" sx={{ mt: 2 }}>
              <Pagination
                count={pagination.totalPages} page={page}
                onChange={(_, p) => setPage(p)} color="primary"
              />
            </Stack>
          )}
        </Box>
      )}

      {/* Tab 2: GDPR / Rights Requests */}
      {activeTab === 2 && (
        <Box>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            {[
              { label: 'Total', value: gdprStats.totalRequests || 0, color: 'primary' },
              { label: 'Pending', value: gdprStats.pendingRequests || 0, color: 'warning' },
              { label: 'In Progress', value: gdprStats.inProgressRequests || 0, color: 'info' },
              { label: 'Completed', value: gdprStats.completedRequests || 0, color: 'success' },
              { label: 'Overdue', value: gdprStats.overdueRequests || 0, color: 'error' }
            ].map(s => (
              <Grid item xs={6} md={2.4} key={s.label}>
                <Card>
                  <CardContent>
                    <Typography variant="overline" color="text.secondary">{s.label}</Typography>
                    <Typography variant="h4" color={`${s.color}.main`}>{s.value}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Requested</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Due</TableCell>
                  <TableCell>Completed</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {gdprRequests.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={7}>
                      <Box sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
                        <Gavel sx={{ fontSize: 48, opacity: 0.4 }} />
                        <Typography>No data subject rights requests yet.</Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
                {gdprRequests.map(req => {
                  const overdue = req.dueDate && new Date(req.dueDate) < new Date()
                                  && !['COMPLETED', 'REJECTED'].includes(req.status);
                  return (
                    <TableRow key={req.id} hover sx={req._realtime ? { bgcolor: 'action.hover' } : {}}>
                      <TableCell>{formatDate(req.requestDate)}</TableCell>
                      <TableCell>{req.email}</TableCell>
                      <TableCell><Chip size="small" label={req.type} variant="outlined" /></TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={req.status}
                          color={
                            req.status === 'COMPLETED' ? 'success' :
                            req.status === 'REJECTED' ? 'error' :
                            req.status === 'IN_PROGRESS' ? 'info' :
                            overdue ? 'error' : 'warning'
                          }
                        />
                      </TableCell>
                      <TableCell sx={{ color: overdue ? 'error.main' : undefined, fontWeight: overdue ? 700 : undefined }}>
                        {formatDate(req.dueDate)} {overdue && '⚠️'}
                      </TableCell>
                      <TableCell>{formatDate(req.completedDate)}</TableCell>
                      <TableCell align="right">
                        <Button size="small" startIcon={<PlayArrow />} onClick={() => openGdprModal(req)}>
                          Process
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* Tab 3: Policies */}
      {activeTab === 3 && (
        <Box>
          {policiesLoading && <LinearProgress sx={{ mb: 2 }} />}
          <Grid container spacing={2}>
            {policies.length === 0 && !policiesLoading && (
              <Grid item xs={12}>
                <Alert severity="info">No compliance policies defined yet.</Alert>
              </Grid>
            )}
            {policies.map(p => (
              <Grid item xs={12} md={6} key={p.id}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                      <Box>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Chip size="small" label={p.region} />
                          <Chip size="small" label={p.jurisdictionName} variant="outlined" />
                          <Chip size="small" label={`v${p.version}`} color="primary" />
                          <Chip
                            size="small"
                            label={p.status}
                            color={p.status === 'active' ? 'success' : 'default'}
                          />
                        </Stack>
                        <Typography variant="h6" sx={{ mt: 1 }}>{p.title}</Typography>
                      </Box>
                      <IconButton size="small" onClick={() => { setEditingPolicy({ ...p }); setPolicyDialogOpen(true); }}>
                        <Edit fontSize="small" />
                      </IconButton>
                    </Stack>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      {p.summary}
                    </Typography>
                    <Box component="pre" sx={{
                      mt: 1.5, p: 1.5, bgcolor: 'action.hover', borderRadius: 1,
                      fontSize: '0.75rem', whiteSpace: 'pre-wrap', maxHeight: 160, overflow: 'auto', m: 0
                    }}>
                      {p.body}
                    </Box>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      Last updated: {formatDate(p.lastUpdatedAt)} · By: {p.lastUpdatedBy || 'system'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Tab 4: Reports */}
      {activeTab === 4 && (
        <Box>
          <Paper sx={{ p: 3, mb: 2 }}>
            <Typography variant="h6" gutterBottom>Generate compliance reports</Typography>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center" sx={{ mb: 2 }}>
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>Report range</InputLabel>
                <Select label="Report range" value={reportRange} onChange={(e) => setReportRange(e.target.value)}>
                  <MenuItem value="last7days">Last 7 days</MenuItem>
                  <MenuItem value="last30days">Last 30 days</MenuItem>
                  <MenuItem value="last90days">Last 90 days</MenuItem>
                </Select>
              </FormControl>
            </Stack>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Audit log report</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Full export of admin/auth/security activity for the selected period.
                    </Typography>
                    <Stack direction="row" spacing={1}>
                      <Button
                        variant="contained" startIcon={<Download />}
                        disabled={exporting === 'audit-csv'}
                        onClick={() => handleExportAll('csv')}
                      >
                        Export CSV
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Data subject rights report</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      All GDPR / CCPA / LGPD / POPIA / PIPL etc. requests with status & SLA.
                    </Typography>
                    <Stack direction="row" spacing={1}>
                      <Button
                        variant="contained" color="secondary" startIcon={<Download />}
                        disabled={exporting === 'gdpr-csv'}
                        onClick={handleExportGdpr}
                      >
                        Export CSV
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Period summary</Typography>
            <Grid container spacing={2}>
              <Grid item xs={6} md={3}><Typography variant="overline">Total logs</Typography><Typography variant="h5">{stats.totalLogs || 0}</Typography></Grid>
              <Grid item xs={6} md={3}><Typography variant="overline">Admin actions</Typography><Typography variant="h5">{stats.adminActions || 0}</Typography></Grid>
              <Grid item xs={6} md={3}><Typography variant="overline">Security events</Typography><Typography variant="h5">{stats.securityEvents || 0}</Typography></Grid>
              <Grid item xs={6} md={3}><Typography variant="overline">Retention (days)</Typography><Typography variant="h5">{stats.dataRetentionDays || 0}</Typography></Grid>
            </Grid>
          </Paper>
        </Box>
      )}

      {/* Audit log details modal */}
      <Dialog open={logModalOpen} onClose={() => setLogModalOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Audit log details
          <IconButton onClick={() => setLogModalOpen(false)} sx={{ position: 'absolute', right: 8, top: 8 }}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {selectedLog && (
            <Grid container spacing={2}>
              <Grid item xs={6}><Typography variant="caption">Timestamp</Typography><Typography>{formatDate(selectedLog.timestamp)}</Typography></Grid>
              <Grid item xs={6}><Typography variant="caption">User</Typography><Typography>{selectedLog.user}</Typography></Grid>
              <Grid item xs={6}><Typography variant="caption">Action</Typography><Typography><code>{selectedLog.action}</code></Typography></Grid>
              <Grid item xs={6}><Typography variant="caption">Resource</Typography><Typography>{selectedLog.resource} {selectedLog.resourceId && `· ${selectedLog.resourceId}`}</Typography></Grid>
              <Grid item xs={6}><Typography variant="caption">IP address</Typography><Typography>{selectedLog.ipAddress || '—'}</Typography></Grid>
              <Grid item xs={6}><Typography variant="caption">Severity</Typography><Chip size="small" label={selectedLog.severity} color={SEVERITY_COLORS[selectedLog.severity] || 'default'} /></Grid>
              <Grid item xs={12}><Typography variant="caption">User agent</Typography><Typography sx={{ wordBreak: 'break-all', fontSize: '0.85rem' }}>{selectedLog.userAgent || '—'}</Typography></Grid>
              <Grid item xs={12}><Typography variant="caption">Details</Typography><Typography>{selectedLog.details || '—'}</Typography></Grid>
              <Grid item xs={12}>
                <Typography variant="caption">Applies to jurisdictions</Typography>
                <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ mt: 0.5 }}>
                  {(selectedLog.jurisdictions || []).map(j => <Chip key={j} size="small" label={j.toUpperCase()} variant="outlined" />)}
                </Stack>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLogModalOpen(false)}>Close</Button>
          {selectedLog && (
            <Button startIcon={<Download />} variant="contained" onClick={() => handleExportSingle(selectedLog.id)}>
              Export CSV
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* GDPR processing modal */}
      <Dialog open={gdprModalOpen} onClose={() => !processingGdpr && setGdprModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Process data subject request</DialogTitle>
        <DialogContent dividers>
          {selectedGdpr && (
            <>
              <Stack spacing={1} sx={{ mb: 2 }}>
                <Typography><strong>Email:</strong> {selectedGdpr.email}</Typography>
                <Typography><strong>Type:</strong> {selectedGdpr.type}</Typography>
                <Typography><strong>Status:</strong> {selectedGdpr.status}</Typography>
                <Typography><strong>Requested:</strong> {formatDate(selectedGdpr.requestDate)}</Typography>
                <Typography><strong>Due:</strong> {formatDate(selectedGdpr.dueDate)}</Typography>
                {selectedGdpr.description && <Typography><strong>Description:</strong> {selectedGdpr.description}</Typography>}
              </Stack>
              <TextField
                label="Notes" fullWidth multiline rows={3}
                value={gdprNotes} onChange={(e) => setGdprNotes(e.target.value)}
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setGdprModalOpen(false)} disabled={processingGdpr}>Cancel</Button>
          <Button color="info" startIcon={<PlayArrow />} disabled={processingGdpr}
                  onClick={() => handleProcessGdpr('start')}>
            Mark in-progress
          </Button>
          <Button color="error" startIcon={<Cancel />} disabled={processingGdpr}
                  onClick={() => handleProcessGdpr('reject')}>
            Reject
          </Button>
          <Button color="success" variant="contained" startIcon={<CheckCircle />} disabled={processingGdpr}
                  onClick={() => handleProcessGdpr('complete')}>
            Complete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Policy edit dialog */}
      <Dialog open={policyDialogOpen} onClose={() => setPolicyDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Edit compliance policy</DialogTitle>
        <DialogContent dividers>
          {editingPolicy && (
            <Stack spacing={2}>
              <Stack direction="row" spacing={1}>
                <Chip label={editingPolicy.region} />
                <Chip label={editingPolicy.jurisdictionName} variant="outlined" />
              </Stack>
              <TextField label="Title" fullWidth value={editingPolicy.title || ''}
                         onChange={(e) => setEditingPolicy(p => ({ ...p, title: e.target.value }))} />
              <TextField label="Summary" fullWidth multiline rows={2} value={editingPolicy.summary || ''}
                         onChange={(e) => setEditingPolicy(p => ({ ...p, summary: e.target.value }))} />
              <TextField label="Body" fullWidth multiline rows={8} value={editingPolicy.body || ''}
                         onChange={(e) => setEditingPolicy(p => ({ ...p, body: e.target.value }))} />
              <Stack direction="row" spacing={2}>
                <TextField label="Version" value={editingPolicy.version || '1.0.0'}
                           onChange={(e) => setEditingPolicy(p => ({ ...p, version: e.target.value }))} sx={{ width: 160 }} />
                <FormControl sx={{ minWidth: 160 }}>
                  <InputLabel>Status</InputLabel>
                  <Select label="Status" value={editingPolicy.status || 'active'}
                          onChange={(e) => setEditingPolicy(p => ({ ...p, status: e.target.value }))}>
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="draft">Draft</MenuItem>
                    <MenuItem value="archived">Archived</MenuItem>
                  </Select>
                </FormControl>
              </Stack>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPolicyDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" startIcon={<Check />} onClick={handleSavePolicy}>Save policy</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open} autoHideDuration={4000}
        onClose={() => setSnackbar(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity} variant="filled" onClose={() => setSnackbar(s => ({ ...s, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ComplianceAudit;
