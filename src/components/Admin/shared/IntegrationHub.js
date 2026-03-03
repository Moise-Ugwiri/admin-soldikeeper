/* eslint-disable */
import React, { useState, useCallback, useMemo, memo } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Chip,
  IconButton,
  Grid,
  Paper,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Alert,
  Tooltip,
  LinearProgress,
  useTheme,
  alpha
} from '@mui/material';
import {
  Extension as IntegrationIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as ConnectedIcon,
  Error as ErrorIcon,
  Sync as SyncIcon,
  Settings as ConfigIcon,
  Cloud as CloudIcon,
  Storage as DatabaseIcon,
  Payment as PaymentIcon,
  Email as EmailIcon,
  Analytics as AnalyticsIcon,
  Security as SecurityIcon,
  Api as ApiIcon,
  PowerOff as DisconnectedIcon,
  Refresh as RefreshIcon,
  Link as LinkIcon,
  LinkOff as UnlinkIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

/**
 * Integration categories
 */
const INTEGRATION_CATEGORIES = {
  payment: { label: 'Payment', icon: PaymentIcon, color: '#4CAF50' },
  email: { label: 'Email', icon: EmailIcon, color: '#2196F3' },
  analytics: { label: 'Analytics', icon: AnalyticsIcon, color: '#FF9800' },
  storage: { label: 'Storage', icon: CloudIcon, color: '#9C27B0' },
  database: { label: 'Database', icon: DatabaseIcon, color: '#607D8B' },
  security: { label: 'Security', icon: SecurityIcon, color: '#F44336' },
  api: { label: 'API', icon: ApiIcon, color: '#00BCD4' }
};

/**
 * Available integrations catalog
 */
const INTEGRATION_CATALOG = [
  {
    id: 'stripe',
    name: 'Stripe',
    category: 'payment',
    description: 'Accept payments and manage subscriptions',
    logo: '💳',
    configFields: [
      { id: 'publicKey', label: 'Public Key', type: 'text', required: true },
      { id: 'secretKey', label: 'Secret Key', type: 'password', required: true },
      { id: 'webhookSecret', label: 'Webhook Secret', type: 'password' }
    ]
  },
  {
    id: 'paypal',
    name: 'PayPal',
    category: 'payment',
    description: 'PayPal payment processing',
    logo: '🅿️',
    configFields: [
      { id: 'clientId', label: 'Client ID', type: 'text', required: true },
      { id: 'clientSecret', label: 'Client Secret', type: 'password', required: true },
      { id: 'sandbox', label: 'Sandbox Mode', type: 'boolean' }
    ]
  },
  {
    id: 'sendgrid',
    name: 'SendGrid',
    category: 'email',
    description: 'Email delivery service',
    logo: '📧',
    configFields: [
      { id: 'apiKey', label: 'API Key', type: 'password', required: true },
      { id: 'fromEmail', label: 'From Email', type: 'email', required: true },
      { id: 'fromName', label: 'From Name', type: 'text' }
    ]
  },
  {
    id: 'mailchimp',
    name: 'Mailchimp',
    category: 'email',
    description: 'Email marketing automation',
    logo: '🐵',
    configFields: [
      { id: 'apiKey', label: 'API Key', type: 'password', required: true },
      { id: 'listId', label: 'List ID', type: 'text', required: true }
    ]
  },
  {
    id: 'google_analytics',
    name: 'Google Analytics',
    category: 'analytics',
    description: 'Web analytics and reporting',
    logo: '📊',
    configFields: [
      { id: 'trackingId', label: 'Tracking ID', type: 'text', required: true },
      { id: 'viewId', label: 'View ID', type: 'text' }
    ]
  },
  {
    id: 'aws_s3',
    name: 'AWS S3',
    category: 'storage',
    description: 'Cloud file storage',
    logo: '☁️',
    configFields: [
      { id: 'accessKeyId', label: 'Access Key ID', type: 'text', required: true },
      { id: 'secretAccessKey', label: 'Secret Access Key', type: 'password', required: true },
      { id: 'bucket', label: 'Bucket Name', type: 'text', required: true },
      { id: 'region', label: 'Region', type: 'text', required: true }
    ]
  },
  {
    id: 'cloudinary',
    name: 'Cloudinary',
    category: 'storage',
    description: 'Media management platform',
    logo: '🌤️',
    configFields: [
      { id: 'cloudName', label: 'Cloud Name', type: 'text', required: true },
      { id: 'apiKey', label: 'API Key', type: 'text', required: true },
      { id: 'apiSecret', label: 'API Secret', type: 'password', required: true }
    ]
  },
  {
    id: 'auth0',
    name: 'Auth0',
    category: 'security',
    description: 'Authentication and authorization',
    logo: '🔐',
    configFields: [
      { id: 'domain', label: 'Domain', type: 'text', required: true },
      { id: 'clientId', label: 'Client ID', type: 'text', required: true },
      { id: 'clientSecret', label: 'Client Secret', type: 'password', required: true }
    ]
  },
  {
    id: 'twilio',
    name: 'Twilio',
    category: 'api',
    description: 'SMS and voice communications',
    logo: '📱',
    configFields: [
      { id: 'accountSid', label: 'Account SID', type: 'text', required: true },
      { id: 'authToken', label: 'Auth Token', type: 'password', required: true },
      { id: 'phoneNumber', label: 'Phone Number', type: 'text', required: true }
    ]
  },
  {
    id: 'slack',
    name: 'Slack',
    category: 'api',
    description: 'Team communication and notifications',
    logo: '💬',
    configFields: [
      { id: 'webhookUrl', label: 'Webhook URL', type: 'text', required: true },
      { id: 'channel', label: 'Default Channel', type: 'text' }
    ]
  }
];

const STORAGE_KEY = 'admin_integrations';

/**
 * IntegrationHub - Manage third-party integrations
 * 
 * Features:
 * - Browse available integrations
 * - Connect/disconnect integrations
 * - Configure integration settings
 * - Monitor connection status
 * - Sync data between services
 */
const IntegrationHub = memo(({
  onConnect,
  onDisconnect,
  onSync,
  onTest,
  connectedIntegrations: externalIntegrations
}) => {
  const { t } = useTranslation();
  const theme = useTheme();

  // State
  const [integrations, setIntegrations] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : externalIntegrations || [];
    } catch {
      return externalIntegrations || [];
    }
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState(null);
  const [configValues, setConfigValues] = useState({});
  const [showCatalog, setShowCatalog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [syncing, setSyncing] = useState({});
  const [testing, setTesting] = useState({});
  const [error, setError] = useState(null);

  // Save integrations
  const saveIntegrations = useCallback((newIntegrations) => {
    setIntegrations(newIntegrations);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newIntegrations));
  }, []);

  // Open config dialog
  const handleOpenConfig = useCallback((integration) => {
    setSelectedIntegration(integration);
    
    // Load existing config if connected
    const connected = integrations.find(i => i.id === integration.id);
    if (connected) {
      setConfigValues(connected.config || {});
    } else {
      setConfigValues({});
    }
    
    setError(null);
    setDialogOpen(true);
  }, [integrations]);

  // Handle config field change
  const handleConfigChange = useCallback((fieldId, value) => {
    setConfigValues(prev => ({ ...prev, [fieldId]: value }));
  }, []);

  // Validate config
  const validateConfig = useCallback(() => {
    if (!selectedIntegration) return false;
    
    const requiredFields = selectedIntegration.configFields
      .filter(f => f.required)
      .map(f => f.id);
    
    return requiredFields.every(fieldId => 
      configValues[fieldId] && String(configValues[fieldId]).trim()
    );
  }, [selectedIntegration, configValues]);

  // Connect integration
  const handleConnect = useCallback(async () => {
    if (!validateConfig()) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      const integrationData = {
        id: selectedIntegration.id,
        name: selectedIntegration.name,
        category: selectedIntegration.category,
        config: configValues,
        status: 'connected',
        connectedAt: new Date().toISOString(),
        lastSync: null
      };

      if (onConnect) {
        await onConnect(integrationData);
      }

      saveIntegrations([
        ...integrations.filter(i => i.id !== selectedIntegration.id),
        integrationData
      ]);

      setDialogOpen(false);
      setSelectedIntegration(null);
      setConfigValues({});
    } catch (err) {
      setError(err.message);
    }
  }, [selectedIntegration, configValues, validateConfig, onConnect, integrations, saveIntegrations]);

  // Disconnect integration
  const handleDisconnect = useCallback(async (integrationId) => {
    try {
      if (onDisconnect) {
        await onDisconnect(integrationId);
      }

      saveIntegrations(integrations.filter(i => i.id !== integrationId));
    } catch (err) {
      console.error('Failed to disconnect:', err);
    }
  }, [integrations, onDisconnect, saveIntegrations]);

  // Sync integration
  const handleSync = useCallback(async (integrationId) => {
    setSyncing(prev => ({ ...prev, [integrationId]: true }));
    
    try {
      if (onSync) {
        await onSync(integrationId);
      }

      // Update last sync time
      saveIntegrations(integrations.map(i => 
        i.id === integrationId 
          ? { ...i, lastSync: new Date().toISOString() }
          : i
      ));
    } catch (err) {
      console.error('Sync failed:', err);
    } finally {
      setSyncing(prev => ({ ...prev, [integrationId]: false }));
    }
  }, [integrations, onSync, saveIntegrations]);

  // Test connection
  const handleTest = useCallback(async (integrationId) => {
    setTesting(prev => ({ ...prev, [integrationId]: true }));
    
    try {
      if (onTest) {
        const result = await onTest(integrationId);
        // Update status based on test result
        saveIntegrations(integrations.map(i => 
          i.id === integrationId 
            ? { ...i, status: result.success ? 'connected' : 'error', lastError: result.error }
            : i
        ));
      }
    } catch (err) {
      saveIntegrations(integrations.map(i => 
        i.id === integrationId 
          ? { ...i, status: 'error', lastError: err.message }
          : i
      ));
    } finally {
      setTesting(prev => ({ ...prev, [integrationId]: false }));
    }
  }, [integrations, onTest, saveIntegrations]);

  // Filter catalog by category
  const filteredCatalog = useMemo(() => {
    if (selectedCategory === 'all') {
      return INTEGRATION_CATALOG;
    }
    return INTEGRATION_CATALOG.filter(i => i.category === selectedCategory);
  }, [selectedCategory]);

  // Get integration by id
  const getIntegrationFromCatalog = useCallback((id) => {
    return INTEGRATION_CATALOG.find(i => i.id === id);
  }, []);

  // Connected integration ids
  const connectedIds = useMemo(() => {
    return new Set(integrations.map(i => i.id));
  }, [integrations]);

  return (
    <Box>
      {/* Header */}
      <Card elevation={2} sx={{ mb: 3 }}>
        <CardHeader
          avatar={<IntegrationIcon color="primary" />}
          title="Integration Hub"
          subheader="Connect and manage third-party services"
          action={
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setShowCatalog(!showCatalog)}
            >
              {showCatalog ? 'Hide Catalog' : 'Add Integration'}
            </Button>
          }
        />
      </Card>

      {/* Integration Catalog */}
      {showCatalog && (
        <Card elevation={1} sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Available Integrations
            </Typography>

            {/* Category filter */}
            <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
              <Chip
                label="All"
                onClick={() => setSelectedCategory('all')}
                color={selectedCategory === 'all' ? 'primary' : 'default'}
              />
              {Object.entries(INTEGRATION_CATEGORIES).map(([key, cat]) => (
                <Chip
                  key={key}
                  icon={<cat.icon style={{ color: selectedCategory === key ? 'inherit' : cat.color }} />}
                  label={cat.label}
                  onClick={() => setSelectedCategory(key)}
                  color={selectedCategory === key ? 'primary' : 'default'}
                  variant={selectedCategory === key ? 'filled' : 'outlined'}
                />
              ))}
            </Box>

            {/* Catalog grid */}
            <Grid container spacing={2}>
              {filteredCatalog.map(integration => {
                const isConnected = connectedIds.has(integration.id);
                const category = INTEGRATION_CATEGORIES[integration.category];
                
                return (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={integration.id}>
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 2,
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        position: 'relative',
                        opacity: isConnected ? 0.7 : 1,
                        border: isConnected 
                          ? `2px solid ${theme.palette.success.main}`
                          : undefined
                      }}
                    >
                      {isConnected && (
                        <Chip
                          icon={<ConnectedIcon />}
                          label="Connected"
                          size="small"
                          color="success"
                          sx={{ position: 'absolute', top: 8, right: 8 }}
                        />
                      )}
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                        <Avatar
                          sx={{
                            bgcolor: alpha(category.color, 0.1),
                            width: 48,
                            height: 48,
                            fontSize: '1.5rem'
                          }}
                        >
                          {integration.logo}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle1" fontWeight="bold">
                            {integration.name}
                          </Typography>
                          <Chip
                            label={category.label}
                            size="small"
                            sx={{ 
                              height: 18, 
                              fontSize: '0.65rem',
                              bgcolor: alpha(category.color, 0.1),
                              color: category.color
                            }}
                          />
                        </Box>
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary" sx={{ flex: 1, mb: 2 }}>
                        {integration.description}
                      </Typography>
                      
                      <Button
                        variant={isConnected ? 'outlined' : 'contained'}
                        size="small"
                        startIcon={isConnected ? <ConfigIcon /> : <LinkIcon />}
                        onClick={() => handleOpenConfig(integration)}
                        fullWidth
                      >
                        {isConnected ? 'Configure' : 'Connect'}
                      </Button>
                    </Paper>
                  </Grid>
                );
              })}
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Connected Integrations */}
      <Card elevation={2}>
        <CardHeader
          title="Connected Integrations"
          subheader={`${integrations.length} active integrations`}
        />
        <CardContent>
          {integrations.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
              <DisconnectedIcon sx={{ fontSize: 64, opacity: 0.5, mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                No Integrations Connected
              </Typography>
              <Typography variant="body2" sx={{ mb: 3 }}>
                Connect third-party services to enhance your platform
              </Typography>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => setShowCatalog(true)}
              >
                Browse Integrations
              </Button>
            </Box>
          ) : (
            <List>
              {integrations.map((integration, index) => {
                const catalogItem = getIntegrationFromCatalog(integration.id);
                const category = INTEGRATION_CATEGORIES[integration.category];
                const isSyncing = syncing[integration.id];
                const isTesting = testing[integration.id];

                return (
                  <React.Fragment key={integration.id}>
                    {index > 0 && <Divider />}
                    <ListItem
                      sx={{
                        py: 2,
                        '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.04) }
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar
                          sx={{
                            bgcolor: alpha(category?.color || theme.palette.grey[500], 0.1),
                            fontSize: '1.2rem'
                          }}
                        >
                          {catalogItem?.logo || <IntegrationIcon />}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="subtitle1" fontWeight="bold">
                              {integration.name}
                            </Typography>
                            <Chip
                              icon={integration.status === 'connected' ? <ConnectedIcon /> : <ErrorIcon />}
                              label={integration.status === 'connected' ? 'Connected' : 'Error'}
                              size="small"
                              color={integration.status === 'connected' ? 'success' : 'error'}
                              variant="outlined"
                            />
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              Connected: {new Date(integration.connectedAt).toLocaleDateString()}
                              {integration.lastSync && ` • Last sync: ${new Date(integration.lastSync).toLocaleString()}`}
                            </Typography>
                            {integration.lastError && (
                              <Typography variant="caption" color="error" display="block">
                                Error: {integration.lastError}
                              </Typography>
                            )}
                          </Box>
                        }
                      />
                      {(isSyncing || isTesting) && (
                        <LinearProgress sx={{ position: 'absolute', bottom: 0, left: 0, right: 0 }} />
                      )}
                      <ListItemSecondaryAction>
                        <Tooltip title="Sync">
                          <IconButton
                            onClick={() => handleSync(integration.id)}
                            disabled={isSyncing}
                          >
                            <SyncIcon className={isSyncing ? 'rotating' : ''} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Test Connection">
                          <IconButton
                            onClick={() => handleTest(integration.id)}
                            disabled={isTesting}
                          >
                            <RefreshIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Configure">
                          <IconButton onClick={() => handleOpenConfig(catalogItem)}>
                            <ConfigIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Disconnect">
                          <IconButton
                            onClick={() => handleDisconnect(integration.id)}
                            color="error"
                          >
                            <UnlinkIcon />
                          </IconButton>
                        </Tooltip>
                      </ListItemSecondaryAction>
                    </ListItem>
                  </React.Fragment>
                );
              })}
            </List>
          )}
        </CardContent>
      </Card>

      {/* Configuration Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {selectedIntegration && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'primary.light' }}>
                {selectedIntegration.logo}
              </Avatar>
              <Box>
                <Typography variant="h6">
                  Configure {selectedIntegration.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {selectedIntegration.description}
                </Typography>
              </Box>
            </Box>
          )}
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Grid container spacing={2} sx={{ mt: 1 }}>
            {selectedIntegration?.configFields.map(field => (
              <Grid item xs={12} key={field.id}>
                {field.type === 'boolean' ? (
                  <FormControlLabel
                    control={
                      <Switch
                        checked={configValues[field.id] || false}
                        onChange={(e) => handleConfigChange(field.id, e.target.checked)}
                      />
                    }
                    label={field.label}
                  />
                ) : (
                  <TextField
                    fullWidth
                    label={field.label}
                    type={field.type === 'password' ? 'password' : field.type}
                    value={configValues[field.id] || ''}
                    onChange={(e) => handleConfigChange(field.id, e.target.value)}
                    required={field.required}
                    helperText={field.required ? 'Required' : ''}
                  />
                )}
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions>
          {connectedIds.has(selectedIntegration?.id) && (
            <Button
              color="error"
              onClick={() => {
                handleDisconnect(selectedIntegration.id);
                setDialogOpen(false);
              }}
              sx={{ mr: 'auto' }}
            >
              Disconnect
            </Button>
          )}
          <Button onClick={() => setDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleConnect}
            startIcon={<LinkIcon />}
          >
            {connectedIds.has(selectedIntegration?.id) ? 'Update' : 'Connect'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Rotating animation for sync icon */}
      <style>{`
        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .rotating {
          animation: rotate 1s linear infinite;
        }
      `}</style>
    </Box>
  );
});

IntegrationHub.displayName = 'IntegrationHub';

export default IntegrationHub;
