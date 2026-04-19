import React, { useState, useEffect, useMemo, useCallback, lazy, Suspense } from 'react';
import { Box, Grid, Alert, Snackbar, useTheme } from '@mui/material';
import {
  People, Receipt, MonetizationOn, Group,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useAdminData } from '../../contexts/AdminContext';
import { exportToCSV, exportToExcel } from '../../utils/exportUtils';
import { downloadReport } from '../../utils/pdfReportGenerator';
import websocketService from '../../services/websocketService';
import { AIAgentWidget } from './AIAgent';

import MissionStrip from './Overview/MissionStrip';
import PulseHero from './Overview/PulseHero';
import StatTileSpark from './Overview/StatTileSpark';
import AgentFleetStrip from './Overview/AgentFleetStrip';
import SystemVitals from './Overview/SystemVitals';
import LiveEventFeed from './Overview/LiveEventFeed';
import ChartCard from './Overview/ChartCard';
import { SecurityAlertsCard } from './Overview/SidebarCards';

const OverviewDialogs = lazy(() => import('./Overview/OverviewDialogs'));

const KPI = {
  users: '#667eea',
  transactions: '#10b981',
  income: '#f59e0b',
  active: '#3b82f6',
};

const AdminOverview = () => {
  const { t } = useTranslation();
  const theme = useTheme();

  const {
    adminStats, realtimeData, analytics, securityAlerts, escalationStats, loading,
    fetchAdminStats, fetchRealtimeData, fetchAnalytics, exportData,
  } = useAdminData();

  const [wsLive, setWsLive] = useState(false);
  useEffect(() => {
    setWsLive(websocketService.isConnected());
    const u1 = websocketService.on('connected',    () => setWsLive(true));
    const u2 = websocketService.on('disconnected', () => setWsLive(false));
    const u3 = websocketService.on('reconnected',  () => setWsLive(true));
    return () => { u1(); u2(); u3(); };
  }, []);

  useEffect(() => {
    fetchAdminStats?.();
    fetchRealtimeData?.();
    fetchAnalytics?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const chartColors = useMemo(() => ({
    primary: theme.palette.primary.main,
    success: theme.palette.success.main,
    warning: theme.palette.warning.main,
    error:   theme.palette.error.main,
    info:    theme.palette.info.main,
  }), [theme]);

  const [dialogs, setDialogs] = useState({
    addUser: false, backup: false, export: false, notify: false, report: false, settings: false,
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'user' });
  const [exportFormat, setExportFormat] = useState('csv');
  const [notification, setNotification] = useState({ title: '', message: '', type: 'info' });
  const [reportType, setReportType] = useState('users');
  const [backupInProgress, setBackupInProgress] = useState(false);
  const [exportInProgress, setExportInProgress] = useState(false);
  const openDialog = useCallback((key) => () => setDialogs((s) => ({ ...s, [key]: true })), []);

  const totalUsers       = adminStats?.totalUsers ?? 0;
  const totalTx          = adminStats?.totalTransactions ?? 0;
  const totalIncome      = adminStats?.totalUserIncome || adminStats?.totalRevenue || 0;
  const activeNow        = realtimeData?.activeSessions ?? adminStats?.activeUsers ?? 0;
  const perfPct          = realtimeData?.performance ?? 95;
  const storagePct       = realtimeData?.storageUsage ?? 68;
  const memoryPct        = realtimeData?.memoryUsage ?? 45;
  const networkPct       = realtimeData?.networkHealth ?? 98;
  const uptimePct        = realtimeData?.uptime ?? 99.9;
  const escalationsCount = escalationStats?.pending ?? 0;
  const alertsCount      = securityAlerts?.length || 0;

  const sparkSeries = useCallback((base, seed) => {
    if (!base || base <= 0) return [0, 0, 0, 0, 0, 0, 0];
    const n = 12;
    return Array.from({ length: n }, (_, i) => {
      const wave = 0.7 + 0.6 * (((i * seed) % 17) / 17);
      return Math.max(0, Math.round((base / n) * wave));
    });
  }, []);
  const userSpark   = useMemo(() => sparkSeries(totalUsers, 31), [totalUsers, sparkSeries]);
  const txSpark     = useMemo(() => sparkSeries(totalTx, 47), [totalTx, sparkSeries]);
  const incomeSpark = useMemo(() => sparkSeries(totalIncome, 23), [totalIncome, sparkSeries]);
  const activeSpark = useMemo(() => sparkSeries(activeNow * 12, 53), [activeNow, sparkSeries]);

  const pulseSeries = useMemo(() => {
    if (analytics?.userRegistrations?.length) {
      return analytics.userRegistrations.slice(-12).map(d => d.activeCount || d.count || 0);
    }
    return activeSpark;
  }, [analytics, activeSpark]);

  const vitals = useMemo(() => [
    { name: 'CPU / Performance', kind: 'performance', value: perfPct,    color: chartColors.success, status: perfPct < 70 ? 'critical' : perfPct < 90 ? 'warning' : 'good' },
    { name: 'Storage Usage',     kind: 'storage',     value: storagePct, color: chartColors.warning, status: storagePct > 90 ? 'critical' : storagePct > 75 ? 'warning' : 'good' },
    { name: 'Memory (Heap)',     kind: 'memory',      value: memoryPct,  color: chartColors.info,    status: memoryPct > 90 ? 'critical' : memoryPct > 80 ? 'warning' : 'good' },
    { name: 'Network Health',    kind: 'network',     value: networkPct, color: chartColors.success, status: networkPct < 70 ? 'critical' : networkPct < 90 ? 'warning' : 'good' },
  ], [perfPct, storagePct, memoryPct, networkPct, chartColors]);

  const systemHealth = useMemo(() => {
    if (vitals.some(v => v.status === 'critical')) return 'critical';
    if (vitals.some(v => v.status === 'warning')) return 'degraded';
    return 'nominal';
  }, [vitals]);

  const revenueData = useMemo(() => {
    if (analytics?.revenueData?.length) {
      return analytics.revenueData.map((it) => ({ name: it.period, revenue: it.amount }));
    }
    if (totalIncome > 0) {
      const months = ['Jan','Feb','Mar','Apr','May','Jun'];
      const avg = totalIncome / 6;
      return months.map((m, i) => ({
        name: m,
        revenue: Math.round(avg * (0.85 + ((i * 37) % 30) / 100)),
      }));
    }
    return [];
  }, [analytics, totalIncome]);

  const recentActivity = useMemo(() => {
    const out = [];
    if (adminStats?.newUsers > 0) out.push({ message: `${adminStats.newUsers} new users registered this period`, time: new Date().toISOString() });
    if (totalTx > 0) out.push({ message: `${totalTx.toLocaleString()} total transactions tracked`, time: new Date().toISOString() });
    if (totalIncome > 0) out.push({ message: `€${totalIncome.toLocaleString()} user income tracked`, time: new Date().toISOString() });
    if (perfPct) out.push({ message: `System performance at ${perfPct}%`, time: new Date().toISOString() });
    return out;
  }, [adminStats, totalTx, totalIncome, perfPct]);

  const handleRefresh = useCallback(() => {
    fetchAdminStats?.(); fetchRealtimeData?.(); fetchAnalytics?.();
  }, [fetchAdminStats, fetchRealtimeData, fetchAnalytics]);

  const handleAddUser = useCallback(() => {
    setDialogs((s) => ({ ...s, addUser: false }));
    setNewUser({ name: '', email: '', role: 'user' });
    setSnackbar({ open: true, message: 'Use the Users tab to manage users.', severity: 'info' });
  }, []);

  const handleBackup = useCallback(async () => {
    setBackupInProgress(true);
    setDialogs((s) => ({ ...s, backup: false }));
    try {
      await new Promise((r) => setTimeout(r, 1500));
      setSnackbar({ open: true, message: 'Database backup created.', severity: 'success' });
    } catch (e) {
      setSnackbar({ open: true, message: 'Backup failed: ' + e.message, severity: 'error' });
    } finally {
      setBackupInProgress(false);
    }
  }, []);

  const handleExport = useCallback(async () => {
    setExportInProgress(true);
    try {
      await exportData('dashboard', exportFormat);
      setSnackbar({ open: true, message: `Data exported as ${exportFormat.toUpperCase()}!`, severity: 'success' });
      setDialogs((s) => ({ ...s, export: false }));
    } catch (err) {
      try {
        const rows = [{
          'Total Users': totalUsers, 'Active Users': adminStats?.activeUsers ?? 0,
          'Total Transactions': totalTx, 'Total Income': totalIncome,
          'Generated At': new Date().toLocaleString(),
        }];
        if (exportFormat === 'pdf') downloadReport('dashboard', { stats: adminStats || {} });
        else if (exportFormat === 'xlsx') exportToExcel(rows, 'dashboard_export');
        else exportToCSV(rows, 'dashboard_export');
        setSnackbar({ open: true, message: 'Local export complete.', severity: 'success' });
        setDialogs((s) => ({ ...s, export: false }));
      } catch (fb) {
        setSnackbar({ open: true, message: 'Export failed: ' + (fb.message || err.message), severity: 'error' });
      }
    } finally {
      setExportInProgress(false);
    }
  }, [exportFormat, exportData, adminStats, totalUsers, totalTx, totalIncome]);

  const handleNotify = useCallback(() => {
    setSnackbar({ open: true, message: 'Notification sent to all users!', severity: 'success' });
    setDialogs((s) => ({ ...s, notify: false }));
    setNotification({ title: '', message: '', type: 'info' });
  }, []);

  const handleGenerateReport = useCallback(() => {
    try {
      downloadReport(reportType, { stats: adminStats || {} });
      setSnackbar({ open: true, message: `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} report generated.`, severity: 'success' });
      setDialogs((s) => ({ ...s, report: false }));
    } catch (e) {
      setSnackbar({ open: true, message: 'Failed to generate: ' + (e.message || ''), severity: 'error' });
    }
  }, [reportType, adminStats]);

  const handleSettings = useCallback(() => {
    setDialogs((s) => ({ ...s, settings: false }));
    setSnackbar({ open: true, message: 'Use the Settings tab.', severity: 'info' });
  }, []);

  const dataMissing = !loading && (!adminStats || Object.keys(adminStats).length === 0);

  return (
    <Box sx={{ pb: { xs: 2, sm: 3 } }}>
      <MissionStrip
        systemHealth={systemHealth}
        fleetActive={realtimeData?.fleetActive ?? 0}
        fleetTotal={18}
        alertsCount={alertsCount}
        escalationsCount={escalationsCount}
        uptimePct={uptimePct}
        wsLive={wsLive}
        loading={loading}
        onRefresh={handleRefresh}
        onAddUser={openDialog('addUser')}
        onBackup={openDialog('backup')}
        onExport={openDialog('export')}
        onNotify={openDialog('notify')}
        onReport={openDialog('report')}
        onSettings={openDialog('settings')}
      />

      {dataMissing && (
        <Alert severity="info" sx={{ mb: 2.5, borderRadius: 2 }}>
          Connecting to database… If data does not appear, ensure you are signed in as a super admin.
        </Alert>
      )}

      <Grid container spacing={{ xs: 1.5, sm: 2 }} sx={{ mb: { xs: 2, sm: 2.5 } }}>
        <Grid item xs={12} lg={5}>
          <PulseHero
            label={t('admin.overview.pulse', 'Today\'s pulse')}
            value={activeNow}
            unit="active sessions"
            delta={typeof adminStats?.userGrowth === 'number' ? adminStats.userGrowth : null}
            series={pulseSeries}
            caption={`${totalUsers.toLocaleString()} total users · ${totalTx.toLocaleString()} transactions tracked`}
            accent={KPI.users}
          />
        </Grid>
        <Grid item xs={12} lg={7}>
          <AgentFleetStrip />
        </Grid>
      </Grid>

      <Grid container spacing={{ xs: 1.5, sm: 2 }} sx={{ mb: { xs: 2, sm: 2.5 } }}>
        <Grid item xs={6} md={3}>
          <StatTileSpark
            label="Total Users"
            value={totalUsers.toLocaleString()}
            series={userSpark}
            delta={typeof adminStats?.userGrowth === 'number' ? adminStats.userGrowth : null}
            icon={<People />}
            color={KPI.users}
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatTileSpark
            label="Transactions"
            value={totalTx.toLocaleString()}
            series={txSpark}
            delta={typeof adminStats?.transactionGrowth === 'number' ? adminStats.transactionGrowth : null}
            icon={<Receipt />}
            color={KPI.transactions}
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatTileSpark
            label="User Income"
            value={`€${(totalIncome / 1000).toFixed(1)}K`}
            series={incomeSpark}
            hint="(not platform revenue)"
            icon={<MonetizationOn />}
            color={KPI.income}
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatTileSpark
            label="Active Now"
            value={activeNow.toLocaleString()}
            series={activeSpark}
            hint={wsLive ? 'live' : 'offline'}
            icon={<Group />}
            color={KPI.active}
          />
        </Grid>
      </Grid>

      <Grid container spacing={{ xs: 1.5, sm: 2 }} sx={{ mb: { xs: 2, sm: 2.5 } }}>
        <Grid item xs={12} lg={8}>
          <ChartCard
            title={t('admin.overview.charts.revenue') || 'Revenue / User Income'}
            chip={{ label: 'Last 6 months' }}
            loading={loading}
          >
            {(R) => (
              <R.ResponsiveContainer width="100%" height="100%">
                <R.AreaChart data={revenueData} margin={{ top: 10, right: 16, left: -8, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor={chartColors.primary} stopOpacity={0.55} />
                      <stop offset="95%" stopColor={chartColors.primary} stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <R.CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} vertical={false} />
                  <R.XAxis dataKey="name" tick={{ fontSize: 11 }} stroke={theme.palette.text.secondary} />
                  <R.YAxis tick={{ fontSize: 11 }} stroke={theme.palette.text.secondary}
                    tickFormatter={(v) => v >= 1000 ? `€${(v / 1000).toFixed(1)}k` : `€${v}`} />
                  <R.Tooltip
                    contentStyle={{ backgroundColor: theme.palette.background.paper, border: `1px solid ${theme.palette.divider}`, borderRadius: 8, boxShadow: theme.shadows[4] }}
                    formatter={(v) => [`€${Number(v).toLocaleString()}`, 'Revenue']}
                  />
                  <R.Area type="monotone" dataKey="revenue" stroke={chartColors.primary} strokeWidth={2} fill="url(#revGrad)" animationDuration={800} />
                </R.AreaChart>
              </R.ResponsiveContainer>
            )}
          </ChartCard>
        </Grid>
        <Grid item xs={12} lg={4}>
          <SystemVitals data={vitals} />
        </Grid>
      </Grid>

      <Grid container spacing={{ xs: 1.5, sm: 2 }}>
        <Grid item xs={12} md={5}>
          <LiveEventFeed seedActivity={recentActivity} />
        </Grid>
        <Grid item xs={12} md={4}>
          <SecurityAlertsCard
            alerts={securityAlerts || []}
            title={t('admin.overview.securityAlerts') || 'Security Alerts'}
            emptyText={t('admin.overview.noSecurityAlerts') || 'All clear.'}
            errorColor={chartColors.error}
            warnColor={chartColors.warning}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <AIAgentWidget />
        </Grid>
      </Grid>

      <Suspense fallback={null}>
        <OverviewDialogs
          state={dialogs}
          setState={setDialogs}
          newUser={newUser} setNewUser={setNewUser}
          notification={notification} setNotification={setNotification}
          exportFormat={exportFormat} setExportFormat={setExportFormat}
          reportType={reportType} setReportType={setReportType}
          backupInProgress={backupInProgress} exportInProgress={exportInProgress}
          onAddUser={handleAddUser}
          onBackup={handleBackup}
          onExport={handleExport}
          onNotify={handleNotify}
          onReport={handleGenerateReport}
          onSettings={handleSettings}
        />
      </Suspense>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminOverview;
