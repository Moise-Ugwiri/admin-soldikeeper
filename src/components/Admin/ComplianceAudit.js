/* eslint-disable */
import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Alert,
  Tabs,
  Tab,
  LinearProgress,
  IconButton,
  Tooltip,
  useTheme
} from '@mui/material';
import {
  Security,
  Shield,
  Assignment,
  Download,
  Visibility,
  Delete,
  Check,
  Warning,
  Error,
  Info,
  AccountCircle,
  Event,
  Description,
  Policy,
  Gavel,
  VerifiedUser,
  DataUsage,
  VpnKey,
  History,
  Search,
  FilterList,
  Refresh
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useAdminData } from '../../contexts/AdminContext';

const ComplianceAudit = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  
  const {
    complianceData,
    auditLogs,
    complianceStats,
    gdprRequests,
    loading,
    fetchAuditLogs,
    fetchComplianceData,
    exportAuditLog,
    processGdprRequest,
    exportData
  } = useAdminData();

  // Local state
  const [activeTab, setActiveTab] = useState(0);
  const [selectedLog, setSelectedLog] = useState(null);
  const [dateRange, setDateRange] = useState('last7days');
  const [actionFilter, setActionFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [gdprModalOpen, setGdprModalOpen] = useState(false);
  const [selectedGdprRequest, setSelectedGdprRequest] = useState(null);

  // Fetch compliance data on mount
  useEffect(() => {
    if (fetchComplianceData) {
      fetchComplianceData();
    }
  }, [fetchComplianceData]);

  // Use real data or fallback to mock data
  const currentAuditLogs = (complianceData?.auditLogs?.length > 0 ? complianceData.auditLogs : auditLogs?.length > 0 ? auditLogs : [
    {
      id: 1,
      timestamp: new Date('2024-08-19T10:30:00'),
      user: 'admin@soldikeeper.com',
      action: 'USER_DELETED',
      resource: 'User ID: 12345',
      ipAddress: '192.168.1.100',
      userAgent: 'Chrome/118.0.0.0',
      severity: 'HIGH',
      details: 'User account permanently deleted'
    },
    {
      id: 2,
      timestamp: new Date('2024-08-19T09:15:00'),
      user: 'admin@soldikeeper.com',
      action: 'DATA_EXPORT',
      resource: 'User Data Export',
      ipAddress: '192.168.1.100',
      userAgent: 'Chrome/118.0.0.0',
      severity: 'MEDIUM',
      details: 'User data exported for GDPR compliance'
    },
    {
      id: 3,
      timestamp: new Date('2024-08-19T08:45:00'),
      user: 'system',
      action: 'BACKUP_CREATED',
      resource: 'Database Backup',
      ipAddress: 'localhost',
      userAgent: 'System Process',
      severity: 'LOW',
      details: 'Automated daily backup completed'
    }
  ]);

  const currentGdprRequests = (complianceData?.gdprRequests?.length > 0 ? complianceData.gdprRequests : gdprRequests?.length > 0 ? gdprRequests : [
    {
      id: 1,
      userId: 'user_12345',
      email: 'user@example.com',
      type: 'DATA_EXPORT',
      status: 'PENDING',
      requestDate: new Date('2024-08-18T14:30:00'),
      dueDate: new Date('2024-09-17T14:30:00'),
      description: 'User requested complete data export'
    },
    {
      id: 2,
      userId: 'user_67890',
      email: 'another@example.com',
      type: 'DATA_DELETION',
      status: 'COMPLETED',
      requestDate: new Date('2024-08-15T10:20:00'),
      completedDate: new Date('2024-08-20T16:45:00'),
      description: 'User requested account deletion'
    }
  ]);

  const currentComplianceMetrics = (complianceData?.metrics?.length > 0 ? complianceData.metrics.map(m => ({
    ...m,
    icon: m.title.includes('GDPR') ? <Shield /> :
          m.title.includes('Retention') ? <DataUsage /> :
          m.title.includes('Audit') ? <History /> :
          <Security />
  })) : [
    {
      title: t('admin.compliance.metrics.gdprCompliance'),
      value: '98%',
      status: 'excellent',
      icon: <Shield />,
      description: 'GDPR requests processed within 30 days'
    },
    {
      title: t('admin.compliance.metrics.dataRetention'),
      value: '95%',
      status: 'good',
      icon: <DataUsage />,
      description: 'Data retention policies compliance'
    },
    {
      title: t('admin.compliance.metrics.auditTrail'),
      value: '100%',
      status: 'excellent',
      icon: <History />,
      description: 'Complete audit trail coverage'
    },
    {
      title: t('admin.compliance.metrics.security'),
      value: '92%',
      status: 'good',
      icon: <Security />,
      description: 'Security compliance score'
    }
  ]);

  // Handle refresh
  const handleRefresh = () => {
    if (fetchComplianceData) {
      fetchComplianceData();
    }
  };

  // Handle export — PDF report with compliance data
  const handleExport = async () => {
    try {
      const { downloadReport } = await import('../../utils/pdfReportGenerator');
      downloadReport('compliance', {
        auditLogs: complianceData?.auditLogs || [],
        complianceScore: complianceData?.complianceScore || 0,
        gdprStatus: complianceData?.gdprStatus || {},
        securitySummary: complianceData?.securitySummary || {},
      });
    } catch (err) {
      console.error('Compliance PDF export failed:', err);
      if (exportData) await exportData('compliance', 'csv');
    }
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Handle log view
  const handleViewLog = (log) => {
    setSelectedLog(log);
  };

  // Handle GDPR request view
  const handleViewGdprRequest = (request) => {
    setSelectedGdprRequest(request);
    setGdprModalOpen(true);
  };

  // Get severity color
  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'HIGH': return theme.palette.error.main;
      case 'MEDIUM': return theme.palette.warning.main;
      case 'LOW': return theme.palette.info.main;
      default: return theme.palette.text.secondary;
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED': return theme.palette.success.main;
      case 'PENDING': return theme.palette.warning.main;
      case 'OVERDUE': return theme.palette.error.main;
      default: return theme.palette.text.secondary;
    }
  };

  // Tab Panel component
  const TabPanel = ({ children, value, index, ...other }) => (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`compliance-tabpanel-${index}`}
      aria-labelledby={`compliance-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          {t('admin.compliance.title')}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<Download />}
            onClick={handleExport}
            disabled={loading?.complianceData}
          >
            {t('admin.compliance.actions.exportReport')}
          </Button>
          <Button
            variant="contained"
            startIcon={<Refresh />}
            onClick={handleRefresh}
            disabled={loading?.complianceData}
          >
            {loading?.complianceData ? t('common.loading') : t('admin.compliance.actions.refresh')}
          </Button>
        </Box>
      </Box>

      {/* Compliance Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {currentComplianceMetrics.map((metric, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card elevation={2}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      backgroundColor: `${theme.palette.primary.main}20`,
                      color: theme.palette.primary.main,
                      mr: 2
                    }}
                  >
                    {metric.icon}
                  </Box>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h4" fontWeight="bold">
                      {metric.value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {metric.title}
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {metric.description}
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={parseInt(metric.value)}
                  sx={{
                    mt: 2,
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: theme.palette.grey[200]
                  }}
                />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Tabs */}
      <Card elevation={2}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange} aria-label="compliance tabs">
            <Tab icon={<History />} label={t('admin.compliance.tabs.auditLog')} />
            <Tab icon={<Policy />} label={t('admin.compliance.tabs.gdpr')} />
            <Tab icon={<Assignment />} label={t('admin.compliance.tabs.reports')} />
            <Tab icon={<Gavel />} label={t('admin.compliance.tabs.policies')} />
          </Tabs>
        </Box>

        {/* Audit Log Tab */}
        <TabPanel value={activeTab} index={0}>
          <Box sx={{ mb: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  placeholder={t('admin.compliance.search.placeholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: <Search sx={{ color: 'text.secondary', mr: 1 }} />
                  }}
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <FormControl fullWidth>
                  <InputLabel>{t('admin.compliance.filters.dateRange')}</InputLabel>
                  <Select
                    value={dateRange}
                    label={t('admin.compliance.filters.dateRange')}
                    onChange={(e) => setDateRange(e.target.value)}
                  >
                    <MenuItem value="today">{t('admin.compliance.filters.today')}</MenuItem>
                    <MenuItem value="last7days">{t('admin.compliance.filters.last7Days')}</MenuItem>
                    <MenuItem value="last30days">{t('admin.compliance.filters.last30Days')}</MenuItem>
                    <MenuItem value="custom">{t('admin.compliance.filters.custom')}</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
                <FormControl fullWidth>
                  <InputLabel>{t('admin.compliance.filters.action')}</InputLabel>
                  <Select
                    value={actionFilter}
                    label={t('admin.compliance.filters.action')}
                    onChange={(e) => setActionFilter(e.target.value)}
                  >
                    <MenuItem value="all">{t('admin.compliance.filters.allActions')}</MenuItem>
                    <MenuItem value="USER_DELETED">User Deleted</MenuItem>
                    <MenuItem value="DATA_EXPORT">Data Export</MenuItem>
                    <MenuItem value="SETTINGS_CHANGED">Settings Changed</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>{t('admin.compliance.table.timestamp')}</TableCell>
                  <TableCell>{t('admin.compliance.table.user')}</TableCell>
                  <TableCell>{t('admin.compliance.table.action')}</TableCell>
                  <TableCell>{t('admin.compliance.table.resource')}</TableCell>
                  <TableCell>{t('admin.compliance.table.severity')}</TableCell>
                  <TableCell align="right">{t('admin.compliance.table.actions')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {currentAuditLogs.map((log) => (
                  <TableRow key={log.id} hover>
                    <TableCell>
                      {new Date(log.timestamp).toLocaleDateString()} {new Date(log.timestamp).toLocaleTimeString()}
                    </TableCell>
                    <TableCell>{log.user}</TableCell>
                    <TableCell>
                      <Chip
                        label={log.action}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>{log.resource}</TableCell>
                    <TableCell>
                      <Chip
                        label={log.severity}
                        size="small"
                        sx={{
                          backgroundColor: `${getSeverityColor(log.severity)}20`,
                          color: getSeverityColor(log.severity)
                        }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title={t('admin.compliance.actions.view')}>
                        <IconButton
                          size="small"
                          onClick={() => handleViewLog(log)}
                        >
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={t('admin.compliance.actions.export')}>
                        <IconButton size="small">
                          <Download />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* GDPR Tab */}
        <TabPanel value={activeTab} index={1}>
          <Alert severity="info" sx={{ mb: 3 }}>
            {t('admin.compliance.gdpr.info')}
          </Alert>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>{t('admin.compliance.gdpr.table.email')}</TableCell>
                  <TableCell>{t('admin.compliance.gdpr.table.type')}</TableCell>
                  <TableCell>{t('admin.compliance.gdpr.table.status')}</TableCell>
                  <TableCell>{t('admin.compliance.gdpr.table.requestDate')}</TableCell>
                  <TableCell>{t('admin.compliance.gdpr.table.dueDate')}</TableCell>
                  <TableCell align="right">{t('admin.compliance.gdpr.table.actions')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {currentGdprRequests.map((request) => (
                  <TableRow key={request.id} hover>
                    <TableCell>{request.email}</TableCell>
                    <TableCell>
                      <Chip
                        label={request.type}
                        size="small"
                        variant="outlined"
                        color={request.type === 'DATA_DELETION' ? 'error' : 'primary'}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={request.status}
                        size="small"
                        sx={{
                          backgroundColor: `${getStatusColor(request.status)}20`,
                          color: getStatusColor(request.status)
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(request.requestDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {request.dueDate ? new Date(request.dueDate).toLocaleDateString() : '-'}
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        size="small"
                        onClick={() => handleViewGdprRequest(request)}
                      >
                        {t('admin.compliance.gdpr.actions.view')}
                      </Button>
                      {request.status === 'PENDING' && (
                        <Button
                          size="small"
                          color="primary"
                          sx={{ ml: 1 }}
                        >
                          {t('admin.compliance.gdpr.actions.process')}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Reports Tab */}
        <TabPanel value={activeTab} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {t('admin.compliance.reports.auditReport')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {t('admin.compliance.reports.auditDescription')}
                  </Typography>
                  <Button variant="contained" startIcon={<Download />} onClick={handleExport}>
                    {t('admin.compliance.reports.downloadAudit')}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {t('admin.compliance.reports.gdprReport')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {t('admin.compliance.reports.gdprDescription')}
                  </Typography>
                  <Button variant="contained" startIcon={<Download />} onClick={handleExport}>
                    {t('admin.compliance.reports.downloadGdpr')}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Policies Tab */}
        <TabPanel value={activeTab} index={3}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Alert severity="info" sx={{ mb: 3 }}>
                {t('admin.compliance.policies.info')}
              </Alert>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <DataUsage sx={{ mr: 2, color: theme.palette.primary.main }} />
                    <Typography variant="h6">
                      {t('admin.compliance.policies.dataRetention')}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {t('admin.compliance.policies.dataRetentionDesc')}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <VpnKey sx={{ mr: 2, color: theme.palette.primary.main }} />
                    <Typography variant="h6">
                      {t('admin.compliance.policies.dataAccess')}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {t('admin.compliance.policies.dataAccessDesc')}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <VerifiedUser sx={{ mr: 2, color: theme.palette.primary.main }} />
                    <Typography variant="h6">
                      {t('admin.compliance.policies.userConsent')}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {t('admin.compliance.policies.userConsentDesc')}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
      </Card>

      {/* Log Details Modal */}
      <Dialog
        open={Boolean(selectedLog)}
        onClose={() => setSelectedLog(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>{t('admin.compliance.logDetails.title')}</DialogTitle>
        <DialogContent>
          {selectedLog && (
            <List>
              <ListItem>
                <ListItemIcon><Event /></ListItemIcon>
                <ListItemText
                  primary={t('admin.compliance.logDetails.timestamp')}
                  secondary={`${new Date(selectedLog.timestamp).toLocaleDateString()} ${new Date(selectedLog.timestamp).toLocaleTimeString()}`}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><AccountCircle /></ListItemIcon>
                <ListItemText
                  primary={t('admin.compliance.logDetails.user')}
                  secondary={selectedLog.user}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><Assignment /></ListItemIcon>
                <ListItemText
                  primary={t('admin.compliance.logDetails.action')}
                  secondary={selectedLog.action}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><Description /></ListItemIcon>
                <ListItemText
                  primary={t('admin.compliance.logDetails.details')}
                  secondary={selectedLog.details}
                />
              </ListItem>
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedLog(null)}>
            {t('admin.compliance.actions.close')}
          </Button>
          <Button variant="contained" startIcon={<Download />}>
            {t('admin.compliance.actions.exportLog')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* GDPR Request Details Modal */}
      <Dialog
        open={gdprModalOpen}
        onClose={() => setGdprModalOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>{t('admin.compliance.gdpr.details.title')}</DialogTitle>
        <DialogContent>
          {selectedGdprRequest && (
            <List>
              <ListItem>
                <ListItemText
                  primary={t('admin.compliance.gdpr.details.email')}
                  secondary={selectedGdprRequest.email}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary={t('admin.compliance.gdpr.details.type')}
                  secondary={selectedGdprRequest.type}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary={t('admin.compliance.gdpr.details.description')}
                  secondary={selectedGdprRequest.description}
                />
              </ListItem>
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setGdprModalOpen(false)}>
            {t('admin.compliance.actions.close')}
          </Button>
          {selectedGdprRequest?.status === 'PENDING' && (
            <>
              <Button color="error">
                {t('admin.compliance.gdpr.actions.reject')}
              </Button>
              <Button variant="contained">
                {t('admin.compliance.gdpr.actions.approve')}
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ComplianceAudit;
