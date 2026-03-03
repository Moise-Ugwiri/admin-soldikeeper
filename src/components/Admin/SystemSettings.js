/* eslint-disable */
import React, { useState, useEffect } from 'react';
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
  useTheme
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Email as EmailIcon,
  Notifications as NotificationsIcon,
  Extension as IntegrationIcon,
  Backup as BackupIcon,
  Build as MaintenanceIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAdminData } from '../../contexts/AdminContext';
import { useAuth } from '../../contexts/AuthContext';

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
    restoreBackup
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
        setSaveMessage('Settings saved successfully!');
        setTimeout(() => setSaveMessage(''), 3000);
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
      setSaveMessage('Error saving settings');
      setTimeout(() => setSaveMessage(''), 3000);
    }
  };

  // Handle backup creation
  const handleCreateBackup = async () => {
    try {
      if (createBackup) {
        await createBackup();
        setSaveMessage('Backup created successfully!');
        setTimeout(() => setSaveMessage(''), 3000);
      }
    } catch (error) {
      console.error('Failed to create backup:', error);
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
      {/* Authentication Debug Info */}
      <Alert severity="info" sx={{ mb: 2 }}>
        <Typography variant="body2">
          <strong>Authentication Status:</strong><br/>
          User: {user ? `${user.email} (${user.role})` : 'Not logged in'}<br/>
          Token in localStorage: {localStorage.getItem('token') ? 'Present' : 'Missing'}<br/>
          Error: {error || 'None'}<br/>
          Loading: {loading ? 'true' : 'false'}
        </Typography>
      </Alert>

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
                  <Button variant="outlined">
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
                  <Button variant="outlined">
                    Clear Cache
                  </Button>
                  <Button variant="outlined">
                    Optimize Database
                  </Button>
                  <Button variant="outlined">
                    View System Logs
                  </Button>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>
      </Card>
    </Box>
  );
};

export default SystemSettings;
