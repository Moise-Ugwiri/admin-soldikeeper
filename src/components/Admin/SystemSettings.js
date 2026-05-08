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
  Switch,
  FormControlLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Divider,
  Alert,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  CircularProgress,
  useTheme,
  Avatar,
  Chip,
  Tooltip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Stack,
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Email as EmailIcon,
  Notifications as NotificationsIcon,
  Extension as IntegrationIcon,
  Backup as BackupIcon,
  Build as MaintenanceIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon,
  PersonAdd as PersonAddIcon,
  Group as GroupIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Shield as ShieldIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Visibility as ViewerIcon,
  ManageAccounts as ManagerIcon,
  AdminPanelSettings as AdminIcon,
  SupervisorAccount as SuperAdminIcon,
  Lock as LockIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAdminData } from '../../contexts/AdminContext';
import { useAuth } from '../../contexts/AuthContext';
import apiClient from '../../services/api';

const SystemSettings = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const {
    systemSettings,
    adminStats,
    loading,
    error,
    fetchSystemSettings,
    fetchAdminStats,
    updateSystemSettings,
    createBackup,
    restoreBackup,
    clearSystemCache,
    optimizeDatabase,
    getSystemLogs,
    getBackups
  } = useAdminData();

  // Local state
  const [activeTab, setActiveTab] = useState(0);
  const [settings, setSettings] = useState({
    general: {
      siteName: 'SoldiKeeper',
      siteDescription: 'Smart Budget Management Platform',
      maintenanceMode: false,
      userRegistration: true,
      emailVerification: true,
      currentUsers: 0,
      maxUsers: 10000
    },
    email: {
      smtpHost: 'smtp.gmail.com',
      smtpPort: 587,
      smtpUser: '',
      smtpPassword: '',
      fromEmail: 'noreply@soldikeeper.com',
      fromName: 'SoldiKeeper'
    },
    notifications: {
      pushNotifications: true,
      emailNotifications: true,
      systemAlerts: true,
      securityAlerts: true,
      marketingEmails: false
    },
    integrations: {
      stripeEnabled: true,
      paypalEnabled: false,
      analyticsEnabled: true,
      crashReporting: true
    },
    backup: {
      autoBackup: true,
      backupFrequency: 'daily',
      retentionDays: 30,
      lastBackup: new Date().toISOString()
    },
    maintenance: {
      autoUpdates: false,
      debugMode: false,
      logLevel: 'info',
      cacheEnabled: true
    }
  });
  const [saveMessage, setSaveMessage] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, severity: 'info', message: '' });
  const [confirmDialog, setConfirmDialog] = useState({ open: false, title: '', message: '', onConfirm: null });
  const [opLoading, setOpLoading] = useState({ cache: false, optimize: false, restore: false, logs: false });
  const [logsDialog, setLogsDialog] = useState({ open: false, logs: [], loading: false });
  const [backupsDialog, setBackupsDialog] = useState({ open: false, backups: [], loading: false });

  // Team & Access state
  const [teamMembers, setTeamMembers] = useState([]);
  const [teamLoading, setTeamLoading] = useState(false);
  const [rolePermissions, setRolePermissions] = useState({});
  const [createAdminOpen, setCreateAdminOpen] = useState(false);
  const [editAdminTarget, setEditAdminTarget] = useState(null);
  const [deleteAdminTarget, setDeleteAdminTarget] = useState(null);
  const [newAdmin, setNewAdmin] = useState({ name: '', email: '', password: '', adminRole: 'manager', adminPermissions: [] });
  const [customPerms, setCustomPerms] = useState(false);

  const showSnack = (message, severity = 'info') => setSnackbar({ open: true, severity, message });
  const closeSnack = () => setSnackbar(s => ({ ...s, open: false }));

  const askConfirm = (title, message, onConfirm) => setConfirmDialog({ open: true, title, message, onConfirm });
  const closeConfirm = () => setConfirmDialog({ open: false, title: '', message: '', onConfirm: null });

  // Team & Access — role config
  const ROLE_CONFIG = {
    superadmin: { label: 'Super Admin', color: 'error',   icon: <SuperAdminIcon fontSize="small" /> },
    admin:      { label: 'Admin',       color: 'warning', icon: <AdminIcon fontSize="small" /> },
    manager:    { label: 'Manager',     color: 'primary', icon: <ManagerIcon fontSize="small" /> },
    viewer:     { label: 'Viewer',      color: 'default', icon: <ViewerIcon fontSize="small" /> },
  };

  const ALL_PERMISSIONS = ['overview','users','transactions','analytics','financial','security','compliance','activity','content','settings','flags','team'];

  const getEffectivePermissions = (member) => {
    if (member.adminPermissions && member.adminPermissions.length > 0) return member.adminPermissions;
    return rolePermissions[member.adminRole] || [];
  };

  // Team data fetching
  const fetchTeam = useCallback(async () => {
    setTeamLoading(true);
    try {
      const [teamRes, rolesRes] = await Promise.all([
        apiClient.get('/admin/team'),
        apiClient.get('/admin/team/roles')
      ]);
      setTeamMembers(teamRes.data.data || []);
      setRolePermissions(rolesRes.data.data || {});
    } catch (err) {
      console.error('Failed to load team:', err);
    } finally {
      setTeamLoading(false);
    }
  }, []);

  // Team action handlers
  const handleCreateAdmin = async () => {
    try {
      await apiClient.post('/admin/team', {
        ...newAdmin,
        adminPermissions: customPerms ? newAdmin.adminPermissions : []
      });
      setCreateAdminOpen(false);
      setNewAdmin({ name: '', email: '', password: '', adminRole: 'manager', adminPermissions: [] });
      setCustomPerms(false);
      fetchTeam();
      showSnack('Admin user created successfully', 'success');
    } catch (err) {
      showSnack(err.response?.data?.message || 'Failed to create admin', 'error');
    }
  };

  const handleUpdateRole = async (userId, adminRole, adminPermissions) => {
    try {
      await apiClient.patch(`/admin/team/${userId}`, { adminRole, adminPermissions });
      fetchTeam();
      setEditAdminTarget(null);
      showSnack('Admin role updated', 'success');
    } catch (err) {
      showSnack(err.response?.data?.message || 'Failed to update role', 'error');
    }
  };

  const handleRevokeAccess = async (userId) => {
    try {
      await apiClient.delete(`/admin/team/${userId}`);
      fetchTeam();
      setDeleteAdminTarget(null);
      showSnack('Admin access revoked', 'success');
    } catch (err) {
      showSnack(err.response?.data?.message || 'Failed to revoke access', 'error');
    }
  };

  // Maintenance handlers
  const handleClearCache = () => {
    askConfirm('Clear System Cache', 'Clear in-memory caches on the server? Active users may notice a brief slowdown.', async () => {
      closeConfirm();
      setOpLoading(o => ({ ...o, cache: true }));
      try {
        const res = await clearSystemCache();
        showSnack(res?.message || 'Cache cleared', 'success');
      } catch (err) {
        showSnack(err.message || 'Failed to clear cache', 'error');
      } finally {
        setOpLoading(o => ({ ...o, cache: false }));
      }
    });
  };

  const handleOptimizeDb = () => {
    askConfirm('Optimize Database', 'Run database optimization scan now? This is a read-only inspection that gathers stats.', async () => {
      closeConfirm();
      setOpLoading(o => ({ ...o, optimize: true }));
      try {
        const res = await optimizeDatabase();
        showSnack(res?.message || 'Database optimized', 'success');
      } catch (err) {
        showSnack(err.message || 'Failed to optimize', 'error');
      } finally {
        setOpLoading(o => ({ ...o, optimize: false }));
      }
    });
  };

  const handleViewLogs = async () => {
    setLogsDialog({ open: true, logs: [], loading: true });
    try {
      const res = await getSystemLogs(1, 100, 'all');
      const logs = res?.data?.logs || res?.logs || res?.data || [];
      setLogsDialog({ open: true, logs: Array.isArray(logs) ? logs : [], loading: false });
    } catch (err) {
      setLogsDialog({ open: true, logs: [], loading: false });
      showSnack(err.message || 'Failed to load logs', 'error');
    }
  };

  const handleOpenRestore = async () => {
    setBackupsDialog({ open: true, backups: [], loading: true });
    try {
      const res = await getBackups();
      const list = res?.data?.backups || res?.data || res?.backups || [];
      setBackupsDialog({ open: true, backups: Array.isArray(list) ? list : [], loading: false });
    } catch (err) {
      setBackupsDialog({ open: true, backups: [], loading: false });
      showSnack(err.message || 'Failed to load backups', 'error');
    }
  };

  const handleRestoreBackup = (backupId) => {
    askConfirm('Restore Backup', `Restore from backup "${backupId}"? This is a destructive operation — the operator must complete the restore from infrastructure tooling.`, async () => {
      closeConfirm();
      setOpLoading(o => ({ ...o, restore: true }));
      try {
        const res = await restoreBackup(backupId);
        showSnack(res?.message || 'Restore initiated', 'success');
        setBackupsDialog(d => ({ ...d, open: false }));
      } catch (err) {
        showSnack(err.message || 'Failed to restore backup', 'error');
      } finally {
        setOpLoading(o => ({ ...o, restore: false }));
      }
    });
  };

  // Load settings and stats on component mount
  useEffect(() => {
    if (fetchSystemSettings) {
      fetchSystemSettings();
    }
    if (fetchAdminStats) {
      fetchAdminStats();
    }
  }, [fetchSystemSettings, fetchAdminStats]);

  // Update local settings when systemSettings from API changes
  useEffect(() => {
    if (systemSettings && Object.keys(systemSettings).length > 0) {
      setSettings(prevSettings => ({
        ...prevSettings,
        ...systemSettings
      }));
    }
  }, [systemSettings]);

  // Update user count from adminStats
  useEffect(() => {
    if (adminStats && adminStats.totalUsers !== undefined) {
      setSettings(prevSettings => ({
        ...prevSettings,
        general: {
          ...prevSettings.general,
          currentUsers: adminStats.totalUsers
        }
      }));
    }
  }, [adminStats]);

  // Fetch team data when Team & Access tab is active
  useEffect(() => {
    if (activeTab === 6) fetchTeam();
  }, [activeTab, fetchTeam]);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Handle setting change
  const handleSettingChange = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  // Handle save settings
  const handleSaveSettings = async () => {
    try {
      if (updateSystemSettings) {
        await updateSystemSettings(settings);
        showSnack('Settings saved successfully', 'success');
      }
    } catch (error) {
      showSnack(error?.message || 'Error saving settings', 'error');
    }
  };

  // Handle backup creation
  const handleCreateBackup = async () => {
    try {
      if (createBackup) {
        const res = await createBackup();
        showSnack(res?.message || 'Backup created successfully', 'success');
      }
    } catch (error) {
      showSnack(error?.message || 'Failed to create backup', 'error');
    }
  };

  // Tab panels
  const TabPanel = ({ children, value, index, ...other }) => (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
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
          System Settings
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {saveMessage && (
            <Alert severity={saveMessage.includes('error') ? 'error' : 'success'} sx={{ mr: 2 }}>
              {saveMessage}
            </Alert>
          )}
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => {
              fetchSystemSettings && fetchSystemSettings();
              fetchAdminStats && fetchAdminStats();
            }}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSaveSettings}
          >
            Save Settings
          </Button>
        </Box>
      </Box>

      <Card elevation={2}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange} aria-label="settings tabs">
            <Tab icon={<SettingsIcon />} label="General" />
            <Tab icon={<EmailIcon />} label="Email" />
            <Tab icon={<NotificationsIcon />} label="Notifications" />
            <Tab icon={<IntegrationIcon />} label="Integrations" />
            <Tab icon={<BackupIcon />} label="Backup" />
            <Tab icon={<MaintenanceIcon />} label="Maintenance" />
            <Tab icon={<GroupIcon />} label="Team & Access" />
          </Tabs>
        </Box>

        {/* General Settings */}
        <TabPanel value={activeTab} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Site Name"
                value={settings.general?.siteName || ''}
                onChange={(e) => handleSettingChange('general', 'siteName', e.target.value)}
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Site Description"
                value={settings.general?.siteDescription || ''}
                onChange={(e) => handleSettingChange('general', 'siteDescription', e.target.value)}
                sx={{ mb: 2 }}
              />
            </Grid>
            
            {/* User Statistics Section */}
            <Grid item xs={12}>
              <Paper sx={{ p: 2, mb: 2 }}>
                <Typography variant="h6" gutterBottom>
                  User Statistics
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <Typography variant="body2" color="text.secondary">
                      Current Users
                    </Typography>
                    <Typography variant="h4" fontWeight="bold" color="primary">
                      {adminStats?.totalUsers || settings.general?.currentUsers || 0}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Maximum Users"
                      type="number"
                      value={settings.general?.maxUsers || 10000}
                      onChange={(e) => handleSettingChange('general', 'maxUsers', parseInt(e.target.value))}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="body2" color="text.secondary">
                      Usage Percentage
                    </Typography>
                    <Typography variant="h6" fontWeight="bold" color={
                      ((settings.general?.currentUsers || 0) / (settings.general?.maxUsers || 10000)) > 0.8 ? 'error' : 'success'
                    }>
                      {(((settings.general?.currentUsers || 0) / (settings.general?.maxUsers || 10000)) * 100).toFixed(1)}%
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  System Settings
                </Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.general?.maintenanceMode || false}
                      onChange={(e) => handleSettingChange('general', 'maintenanceMode', e.target.checked)}
                    />
                  }
                  label="Maintenance Mode"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.general?.userRegistration !== false}
                      onChange={(e) => handleSettingChange('general', 'userRegistration', e.target.checked)}
                    />
                  }
                  label="User Registration Enabled"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.general?.emailVerification !== false}
                      onChange={(e) => handleSettingChange('general', 'emailVerification', e.target.checked)}
                    />
                  }
                  label="Email Verification Required"
                />
              </Paper>
            </Grid>
            
            {/* Cost Management Section */}
            <Grid item xs={12}>
              <Paper sx={{ p: 2, border: `2px solid ${theme.palette.primary.main}` }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Cost Management
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Track platform infrastructure costs for profit margin calculations
                    </Typography>
                  </Box>
                  <Button
                    variant="contained"
                    onClick={() => navigate('/admin/costs')}
                    sx={{ ml: 2 }}
                  >
                    Manage Costs
                  </Button>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Email Settings */}
        <TabPanel value={activeTab} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="SMTP Host"
                value={settings.email?.smtpHost || ''}
                onChange={(e) => handleSettingChange('email', 'smtpHost', e.target.value)}
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="SMTP Port"
                type="number"
                value={settings.email?.smtpPort || 587}
                onChange={(e) => handleSettingChange('email', 'smtpPort', e.target.value)}
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="SMTP User"
                value={settings.email?.smtpUser || ''}
                onChange={(e) => handleSettingChange('email', 'smtpUser', e.target.value)}
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="SMTP Password"
                type="password"
                value={settings.email?.smtpPassword || ''}
                onChange={(e) => handleSettingChange('email', 'smtpPassword', e.target.value)}
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="From Email"
                value={settings.email?.fromEmail || ''}
                onChange={(e) => handleSettingChange('email', 'fromEmail', e.target.value)}
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="From Name"
                value={settings.email?.fromName || ''}
                onChange={(e) => handleSettingChange('email', 'fromName', e.target.value)}
                sx={{ mb: 2 }}
              />
            </Grid>
          </Grid>
        </TabPanel>

        {/* Notification Settings */}
        <TabPanel value={activeTab} index={2}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Notification Settings
            </Typography>
            <List>
              <ListItem>
                <ListItemText 
                  primary="Push Notifications"
                  secondary="Enable push notifications for users"
                />
                <ListItemSecondaryAction>
                  <Switch
                    checked={settings.notifications?.pushNotifications !== false}
                    onChange={(e) => handleSettingChange('notifications', 'pushNotifications', e.target.checked)}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText 
                  primary="Email Notifications"
                  secondary="Send email notifications for important events"
                />
                <ListItemSecondaryAction>
                  <Switch
                    checked={settings.notifications?.emailNotifications !== false}
                    onChange={(e) => handleSettingChange('notifications', 'emailNotifications', e.target.checked)}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText 
                  primary="System Alerts"
                  secondary="Show system maintenance and update alerts"
                />
                <ListItemSecondaryAction>
                  <Switch
                    checked={settings.notifications?.systemAlerts !== false}
                    onChange={(e) => handleSettingChange('notifications', 'systemAlerts', e.target.checked)}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText 
                  primary="Security Alerts"
                  secondary="Enable security and suspicious activity alerts"
                />
                <ListItemSecondaryAction>
                  <Switch
                    checked={settings.notifications?.securityAlerts !== false}
                    onChange={(e) => handleSettingChange('notifications', 'securityAlerts', e.target.checked)}
                  />
                </ListItemSecondaryAction>
              </ListItem>
            </List>
          </Paper>
        </TabPanel>

        {/* Integration Settings */}
        <TabPanel value={activeTab} index={3}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Payment Integrations
                </Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.integrations?.stripeEnabled !== false}
                      onChange={(e) => handleSettingChange('integrations', 'stripeEnabled', e.target.checked)}
                    />
                  }
                  label="Stripe"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.integrations?.paypalEnabled === true}
                      onChange={(e) => handleSettingChange('integrations', 'paypalEnabled', e.target.checked)}
                    />
                  }
                  label="PayPal"
                />
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Analytics & Monitoring
                </Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.integrations?.analyticsEnabled !== false}
                      onChange={(e) => handleSettingChange('integrations', 'analyticsEnabled', e.target.checked)}
                    />
                  }
                  label="Google Analytics"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.integrations?.crashReporting !== false}
                      onChange={(e) => handleSettingChange('integrations', 'crashReporting', e.target.checked)}
                    />
                  }
                  label="Crash Reporting"
                />
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Backup Settings */}
        <TabPanel value={activeTab} index={4}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Backup Configuration
                </Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.backup?.autoBackup !== false}
                      onChange={(e) => handleSettingChange('backup', 'autoBackup', e.target.checked)}
                    />
                  }
                  label="Automatic Backup"
                />
                <FormControl fullWidth sx={{ mt: 2 }}>
                  <InputLabel>Backup Frequency</InputLabel>
                  <Select
                    value={settings.backup?.backupFrequency || 'daily'}
                    label="Backup Frequency"
                    onChange={(e) => handleSettingChange('backup', 'backupFrequency', e.target.value)}
                  >
                    <MenuItem value="hourly">Hourly</MenuItem>
                    <MenuItem value="daily">Daily</MenuItem>
                    <MenuItem value="weekly">Weekly</MenuItem>
                    <MenuItem value="monthly">Monthly</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  fullWidth
                  label="Retention Days"
                  type="number"
                  value={settings.backup?.retentionDays || 30}
                  onChange={(e) => handleSettingChange('backup', 'retentionDays', e.target.value)}
                  sx={{ mt: 2 }}
                />
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Backup Actions
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Last Backup: {new Date(settings.backup?.lastBackup || new Date()).toLocaleString()}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                  <Button variant="contained" onClick={handleCreateBackup}>
                    Create Backup
                  </Button>
                  <Button variant="outlined" onClick={handleOpenRestore}>
                    Restore Backup
                  </Button>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Maintenance Settings */}
        <TabPanel value={activeTab} index={5}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  System Maintenance
                </Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.maintenance?.autoUpdates === true}
                      onChange={(e) => handleSettingChange('maintenance', 'autoUpdates', e.target.checked)}
                    />
                  }
                  label="Automatic Updates"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.maintenance?.debugMode === true}
                      onChange={(e) => handleSettingChange('maintenance', 'debugMode', e.target.checked)}
                    />
                  }
                  label="Debug Mode"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.maintenance?.cacheEnabled !== false}
                      onChange={(e) => handleSettingChange('maintenance', 'cacheEnabled', e.target.checked)}
                    />
                  }
                  label="Cache Enabled"
                />
                <FormControl fullWidth sx={{ mt: 2 }}>
                  <InputLabel>Log Level</InputLabel>
                  <Select
                    value={settings.maintenance?.logLevel || 'info'}
                    label="Log Level"
                    onChange={(e) => handleSettingChange('maintenance', 'logLevel', e.target.value)}
                  >
                    <MenuItem value="error">Error</MenuItem>
                    <MenuItem value="warn">Warning</MenuItem>
                    <MenuItem value="info">Info</MenuItem>
                    <MenuItem value="debug">Debug</MenuItem>
                  </Select>
                </FormControl>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Maintenance Actions
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Button
                    variant="outlined"
                    onClick={handleClearCache}
                    disabled={opLoading.cache}
                    startIcon={opLoading.cache ? <CircularProgress size={16} /> : null}
                  >
                    Clear Cache
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={handleOptimizeDb}
                    disabled={opLoading.optimize}
                    startIcon={opLoading.optimize ? <CircularProgress size={16} /> : null}
                  >
                    Optimize Database
                  </Button>
                  <Button variant="outlined" onClick={handleViewLogs}>
                    View System Logs
                  </Button>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>
      </Card>

      {/* ── Team & Access Tab Panel (index 6) ── */}
      {/* Rendered outside Card to avoid nested card issues */}
      <TabPanel value={activeTab} index={6}>
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h6" gutterBottom>Admin Team</Typography>
            <Typography variant="body2" color="text.secondary">
              Manage admin accounts and their access levels. Only superadmins can create or remove accounts.
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<PersonAddIcon />}
            onClick={() => setCreateAdminOpen(true)}
            size="small"
          >
            Add Admin
          </Button>
        </Box>

        {teamLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Name / Email</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Permissions</TableCell>
                  <TableCell>Since</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {teamMembers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                      No admin users found
                    </TableCell>
                  </TableRow>
                )}
                {teamMembers.map((member) => {
                  const rc = ROLE_CONFIG[member.adminRole] || ROLE_CONFIG.viewer;
                  const perms = getEffectivePermissions(member);
                  const isCustom = member.adminPermissions && member.adminPermissions.length > 0;
                  return (
                    <TableRow key={member._id} hover>
                      <TableCell>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <Avatar sx={{ width: 32, height: 32, fontSize: 14 }}>
                            {(member.name || member.email || '?')[0].toUpperCase()}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight={600}>{member.name || '—'}</Typography>
                            <Typography variant="caption" color="text.secondary">{member.email}</Typography>
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={rc.icon}
                          label={rc.label}
                          color={rc.color}
                          size="small"
                          variant="outlined"
                        />
                        {isCustom && (
                          <Chip label="custom perms" size="small" sx={{ ml: 0.5, fontSize: 10 }} />
                        )}
                      </TableCell>
                      <TableCell>
                        <Tooltip title={perms.join(', ')} arrow>
                          <Typography variant="caption" color="text.secondary">
                            {perms.length} permission{perms.length !== 1 ? 's' : ''}
                          </Typography>
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" color="text.secondary">
                          {member.createdAt ? new Date(member.createdAt).toLocaleDateString() : '—'}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                          <Tooltip title="Edit role & permissions">
                            <IconButton
                              size="small"
                              onClick={() => setEditAdminTarget({ user: { ...member, _editRole: member.adminRole, _editPerms: getEffectivePermissions(member) }, open: true })}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Revoke admin access">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => setDeleteAdminTarget({ user: member, open: true })}
                            >
                              <DeleteIcon fontSize="small" />
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
        )}

        {/* Role legend */}
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle2" gutterBottom>Role Permissions Reference</Typography>
          <Stack spacing={1}>
            {Object.entries(ROLE_CONFIG).map(([roleKey, rc]) => (
              <Stack key={roleKey} direction="row" spacing={1} alignItems="center">
                <Chip icon={rc.icon} label={rc.label} color={rc.color} size="small" variant="outlined" sx={{ minWidth: 110 }} />
                <Typography variant="caption" color="text.secondary">
                  {(rolePermissions[roleKey] || []).join(' · ') || 'No permissions assigned'}
                </Typography>
              </Stack>
            ))}
          </Stack>
        </Box>
      </TabPanel>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog.open} onClose={closeConfirm}>
        <DialogTitle>{confirmDialog.title}</DialogTitle>
        <DialogContent>
          <Typography variant="body2">{confirmDialog.message}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeConfirm}>Cancel</Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => confirmDialog.onConfirm && confirmDialog.onConfirm()}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {/* System Logs Dialog */}
      <Dialog open={logsDialog.open} onClose={() => setLogsDialog(d => ({ ...d, open: false }))} maxWidth="md" fullWidth>
        <DialogTitle>System Logs</DialogTitle>
        <DialogContent dividers>
          {logsDialog.loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}><CircularProgress /></Box>
          ) : logsDialog.logs.length === 0 ? (
            <Typography variant="body2" color="text.secondary">No logs available.</Typography>
          ) : (
            <Box sx={{ maxHeight: 480, overflow: 'auto', fontFamily: 'monospace', fontSize: 12 }}>
              {logsDialog.logs.map((log, idx) => (
                <Box key={idx} sx={{ py: 0.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                  <Typography component="span" variant="caption" color={log.level === 'error' ? 'error' : 'text.secondary'}>
                    [{log.timestamp || log.createdAt || ''}] {(log.level || 'info').toUpperCase()}:
                  </Typography>{' '}
                  <Typography component="span" variant="body2">
                    {log.message || log.action || JSON.stringify(log)}
                  </Typography>
                </Box>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLogsDialog(d => ({ ...d, open: false }))}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Backups Dialog */}
      <Dialog open={backupsDialog.open} onClose={() => setBackupsDialog(d => ({ ...d, open: false }))} maxWidth="sm" fullWidth>
        <DialogTitle>Restore from Backup</DialogTitle>
        <DialogContent dividers>
          {backupsDialog.loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}><CircularProgress /></Box>
          ) : backupsDialog.backups.length === 0 ? (
            <Typography variant="body2" color="text.secondary">No backups available.</Typography>
          ) : (
            <List>
              {backupsDialog.backups.map((b) => (
                <ListItem key={b.id || b._id || b.name} divider>
                  <ListItemText
                    primary={b.name || b.id || b._id}
                    secondary={`${b.createdAt || b.timestamp || ''}${b.size ? ` · ${b.size}` : ''}`}
                  />
                  <ListItemSecondaryAction>
                    <Button
                      size="small"
                      variant="contained"
                      onClick={() => handleRestoreBackup(b.id || b._id || b.name)}
                      disabled={opLoading.restore}
                    >
                      Restore
                    </Button>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBackupsDialog(d => ({ ...d, open: false }))}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* ── Create Admin Dialog ── */}
      <Dialog open={createAdminOpen} onClose={() => setCreateAdminOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Stack direction="row" spacing={1} alignItems="center">
            <PersonAddIcon color="primary" />
            <Typography variant="h6">Add Admin User</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField
              label="Full Name"
              value={newAdmin.name}
              onChange={(e) => setNewAdmin(p => ({ ...p, name: e.target.value }))}
              size="small"
              fullWidth
              required
            />
            <TextField
              label="Email Address"
              type="email"
              value={newAdmin.email}
              onChange={(e) => setNewAdmin(p => ({ ...p, email: e.target.value }))}
              size="small"
              fullWidth
              required
              helperText="If this email already exists in the platform, admin access will be granted to that account."
            />
            <TextField
              label="Password"
              type="password"
              value={newAdmin.password}
              onChange={(e) => setNewAdmin(p => ({ ...p, password: e.target.value }))}
              size="small"
              fullWidth
              required
              helperText="Minimum 8 characters. Only used if creating a new account."
            />
            <FormControl size="small" fullWidth>
              <InputLabel>Admin Role</InputLabel>
              <Select
                value={newAdmin.adminRole}
                label="Admin Role"
                onChange={(e) => setNewAdmin(p => ({ ...p, adminRole: e.target.value }))}
              >
                {Object.entries(ROLE_CONFIG).map(([roleKey, rc]) => (
                  <MenuItem key={roleKey} value={roleKey}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      {rc.icon}
                      <Box>
                        <Typography variant="body2">{rc.label}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {(rolePermissions[roleKey] || []).slice(0, 4).join(', ')}{(rolePermissions[roleKey] || []).length > 4 ? '...' : ''}
                        </Typography>
                      </Box>
                    </Stack>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControlLabel
              control={<Switch checked={customPerms} onChange={(e) => setCustomPerms(e.target.checked)} size="small" />}
              label={<Typography variant="body2">Override permissions (custom)</Typography>}
            />

            {customPerms && (
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                  Select specific permissions (overrides role defaults):
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {ALL_PERMISSIONS.map(perm => {
                    const active = newAdmin.adminPermissions.includes(perm);
                    return (
                      <Chip
                        key={perm}
                        label={perm}
                        size="small"
                        color={active ? 'primary' : 'default'}
                        variant={active ? 'filled' : 'outlined'}
                        onClick={() => setNewAdmin(p => ({
                          ...p,
                          adminPermissions: active
                            ? p.adminPermissions.filter(x => x !== perm)
                            : [...p.adminPermissions, perm]
                        }))}
                        clickable
                      />
                    );
                  })}
                </Box>
              </Box>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateAdminOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleCreateAdmin}
            disabled={!newAdmin.name || !newAdmin.email || !newAdmin.password || !newAdmin.adminRole}
            startIcon={<PersonAddIcon />}
          >
            Create Admin
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Edit Admin Dialog ── */}
      <Dialog open={!!editAdminTarget?.open} onClose={() => setEditAdminTarget(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Admin Permissions</DialogTitle>
        <DialogContent dividers>
          {editAdminTarget?.user && (
            <Stack spacing={2} sx={{ pt: 1 }}>
              <Typography variant="body2">
                Editing: <strong>{editAdminTarget.user.name || editAdminTarget.user.email}</strong>
              </Typography>
              <FormControl size="small" fullWidth>
                <InputLabel>Admin Role</InputLabel>
                <Select
                  value={editAdminTarget.user._editRole || 'manager'}
                  label="Admin Role"
                  onChange={(e) => setEditAdminTarget(p => ({ ...p, user: { ...p.user, _editRole: e.target.value } }))}
                >
                  {Object.entries(ROLE_CONFIG).map(([roleKey, rc]) => (
                    <MenuItem key={roleKey} value={roleKey}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        {rc.icon}
                        <Typography variant="body2">{rc.label}</Typography>
                      </Stack>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                  Custom permissions (leave all unchecked to use role defaults):
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {ALL_PERMISSIONS.map(perm => {
                    const active = (editAdminTarget.user._editPerms || []).includes(perm);
                    return (
                      <Chip
                        key={perm}
                        label={perm}
                        size="small"
                        color={active ? 'primary' : 'default'}
                        variant={active ? 'filled' : 'outlined'}
                        onClick={() => setEditAdminTarget(p => ({
                          ...p,
                          user: {
                            ...p.user,
                            _editPerms: active
                              ? (p.user._editPerms || []).filter(x => x !== perm)
                              : [...(p.user._editPerms || []), perm]
                          }
                        }))}
                        clickable
                      />
                    );
                  })}
                </Box>
              </Box>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditAdminTarget(null)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => {
              const { _id, _editRole, _editPerms } = editAdminTarget.user;
              handleUpdateRole(_id, _editRole, _editPerms);
            }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Revoke Access Confirm Dialog ── */}
      <Dialog open={!!deleteAdminTarget?.open} onClose={() => setDeleteAdminTarget(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Revoke Admin Access</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to revoke admin access for <strong>{deleteAdminTarget?.user?.email}</strong>?
            Their account will remain but they will no longer be able to access the admin panel.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteAdminTarget(null)}>Cancel</Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => handleRevokeAccess(deleteAdminTarget.user._id)}
          >
            Revoke Access
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4500}
        onClose={closeSnack}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={closeSnack} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SystemSettings;
