/**
 * AI Agent Command Center
 * Full dashboard for AI Agent monitoring and control
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Button,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Switch,
  Slider,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  AlertTitle,
  Collapse,
  useTheme,
  alpha
} from '@mui/material';
import {
  SmartToy as AgentIcon,
  Speed as PerformanceIcon,
  Security as SecurityIcon,
  Warning as AlertIcon,
  CheckCircle as SuccessIcon,
  TrendingUp as TrendingIcon,
  People as UsersIcon,
  AccountBalance as TransactionIcon,
  Settings as SettingsIcon,
  Refresh as RefreshIcon,
  PlayArrow as StartIcon,
  Stop as StopIcon,
  Visibility as ViewIcon,
  ExpandMore as ExpandIcon,
  ExpandLess as CollapseIcon,
  Timeline as TimelineIcon,
  Psychology as AIIcon,
  Notifications as NotificationIcon,
  Shield as ShieldIcon,
  Memory as MemoryIcon,
  Storage as StorageIcon,
  BugReport as BugIcon,
  AutoFixHigh as AutoFixIcon,
  History as HistoryIcon,
  ErrorOutline as EscalationIcon
} from '@mui/icons-material';
import { useAIAgent } from '../../../contexts/AIAgentContext';
import { useAdminData } from '../../../contexts/AdminContext';
import AIAgentChatPanel from './AIAgentChatPanel';
import { EscalationInbox } from '../Escalations';
import { MissionControlHeader, AgentGrid } from '../MissionControl';

// Status Badge Component
const StatusBadge = ({ status }) => {
  const getColor = () => {
    switch (status) {
      case 'online': return 'success';
      case 'processing': return 'info';
      case 'warning': return 'warning';
      case 'offline': return 'error';
      default: return 'default';
    }
  };

  return (
    <Chip
      label={status?.toUpperCase() || 'UNKNOWN'}
      color={getColor()}
      size="small"
      sx={{ fontWeight: 'bold' }}
    />
  );
};

// Metric Card Component
const MetricCard = ({ title, value, subtitle, icon: Icon, color, trend, onClick }) => {
  const theme = useTheme();
  
  return (
    <Card
      sx={{
        height: '100%',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': onClick ? {
          transform: 'translateY(-2px)',
          boxShadow: theme.shadows[4]
        } : {}
      }}
      onClick={onClick}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="overline" color="text.secondary">
              {title}
            </Typography>
            <Typography variant="h4" fontWeight="bold" color={color}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary">
                {subtitle}
              </Typography>
            )}
            {trend && (
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                <TrendingIcon 
                  sx={{ 
                    fontSize: 16, 
                    color: trend > 0 ? 'success.main' : 'error.main',
                    transform: trend > 0 ? 'none' : 'rotate(180deg)'
                  }} 
                />
                <Typography 
                  variant="caption" 
                  color={trend > 0 ? 'success.main' : 'error.main'}
                  sx={{ ml: 0.5 }}
                >
                  {Math.abs(trend)}% vs last hour
                </Typography>
              </Box>
            )}
          </Box>
          <Avatar
            sx={{
              bgcolor: alpha(theme.palette[color]?.main || theme.palette.primary.main, 0.1),
              color: theme.palette[color]?.main || theme.palette.primary.main
            }}
          >
            <Icon />
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );
};

// Alert List Component
const AlertsList = ({ alerts = [], onDismiss, onView }) => {
  const theme = useTheme();
  
  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical': return <AlertIcon color="error" />;
      case 'high': return <AlertIcon color="warning" />;
      case 'medium': return <SecurityIcon color="info" />;
      case 'low': return <SuccessIcon color="success" />;
      default: return <AlertIcon />;
    }
  };

  if (!alerts || alerts.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4, opacity: 0.7 }}>
        <SuccessIcon sx={{ fontSize: 48, color: 'success.main', mb: 1 }} />
        <Typography variant="body1" color="text.secondary">
          No active alerts
        </Typography>
        <Typography variant="caption" color="text.secondary">
          The system is running smoothly
        </Typography>
      </Box>
    );
  }

  return (
    <List dense>
      {alerts.slice(0, 10).map((alert) => (
        <ListItem
          key={alert.id}
          sx={{
            mb: 1,
            borderRadius: 1,
            bgcolor: alpha(theme.palette[getSeverityColor(alert.severity)]?.main || theme.palette.grey[500], 0.1),
            borderLeft: `3px solid ${theme.palette[getSeverityColor(alert.severity)]?.main || theme.palette.grey[500]}`
          }}
        >
          <ListItemAvatar>
            {getSeverityIcon(alert.severity)}
          </ListItemAvatar>
          <ListItemText
            primary={alert.title || alert.message}
            secondary={
              <Box>
                <Typography variant="caption" display="block">
                  {alert.description || alert.details}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {new Date(alert.timestamp).toLocaleString()}
                </Typography>
              </Box>
            }
          />
          <ListItemSecondaryAction>
            <Tooltip title="View Details">
              <IconButton size="small" onClick={() => onView?.(alert)}>
                <ViewIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </ListItemSecondaryAction>
        </ListItem>
      ))}
    </List>
  );
};

// Recommendations/Insights List Component
const RecommendationsList = ({ recommendations = [], onExecute }) => {
  const theme = useTheme();
  
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'success';
      default: return 'primary';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'engagement': return <UsersIcon />;
      case 'revenue': return <TrendingIcon />;
      case 'security': return <SecurityIcon />;
      case 'growth': return <TrendingIcon />;
      case 'churn': return <AlertIcon />;
      default: return <AutoFixIcon />;
    }
  };

  if (!recommendations || recommendations.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4, opacity: 0.7 }}>
        <AIIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
        <Typography variant="body1" color="text.secondary">
          No insights at this time
        </Typography>
        <Typography variant="caption" color="text.secondary">
          The AI is analyzing your data...
        </Typography>
      </Box>
    );
  }

  return (
    <List>
      {recommendations.map((rec, idx) => (
        <ListItem
          key={rec.id || idx}
          sx={{
            mb: 1,
            borderRadius: 1,
            bgcolor: alpha(theme.palette[getPriorityColor(rec.priority)]?.main || theme.palette.primary.main, 0.05),
            border: `1px solid ${alpha(theme.palette[getPriorityColor(rec.priority)]?.main || theme.palette.primary.main, 0.2)}`,
            borderLeft: `4px solid ${theme.palette[getPriorityColor(rec.priority)]?.main || theme.palette.primary.main}`
          }}
        >
          <ListItemAvatar>
            <Avatar sx={{ bgcolor: alpha(theme.palette[getPriorityColor(rec.priority)]?.main || theme.palette.primary.main, 0.1) }}>
              {getCategoryIcon(rec.category)}
            </Avatar>
          </ListItemAvatar>
          <ListItemText
            primary={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                <Typography variant="subtitle2" fontWeight="bold">{rec.title}</Typography>
                <Chip
                  label={rec.priority?.toUpperCase() || 'INFO'}
                  size="small"
                  color={getPriorityColor(rec.priority)}
                  sx={{ height: 20, fontSize: '0.65rem' }}
                />
                {rec.category && (
                  <Chip
                    label={rec.category}
                    size="small"
                    variant="outlined"
                    sx={{ height: 20, fontSize: '0.65rem' }}
                  />
                )}
              </Box>
            }
            secondary={
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {rec.description}
                </Typography>
                {rec.action && typeof rec.action === 'object' && rec.action.label && (
                  <Typography variant="caption" color="primary" sx={{ mt: 0.5, display: 'block' }}>
                    💡 Suggested: {rec.action.label}
                  </Typography>
                )}
                {rec.action && typeof rec.action === 'string' && (
                  <Typography variant="caption" color="primary" sx={{ mt: 0.5, display: 'block' }}>
                    💡 Suggested: {rec.action}
                  </Typography>
                )}
                {rec.metric && typeof rec.metric === 'string' && (
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    📊 {rec.metric}
                  </Typography>
                )}
              </Box>
            }
          />
          {rec.actionable && (
            <ListItemSecondaryAction>
              <Button
                size="small"
                variant="contained"
                color={getPriorityColor(rec.priority)}
                onClick={() => onExecute?.(rec)}
              >
                Act
              </Button>
            </ListItemSecondaryAction>
          )}
        </ListItem>
      ))}
    </List>
  );
};

// System Health Panel
const SystemHealthPanel = ({ metrics = {} }) => {
  const theme = useTheme();
  
  const healthItems = [
    { label: 'CPU Usage', value: metrics.cpuUsage || 0, icon: MemoryIcon, threshold: 80 },
    { label: 'Memory Usage', value: metrics.memoryUsage || 0, icon: StorageIcon, threshold: 85 },
    { label: 'API Response Time', value: metrics.avgResponseTime || 0, icon: PerformanceIcon, threshold: 500, unit: 'ms' },
    { label: 'Error Rate', value: metrics.errorRate || 0, icon: BugIcon, threshold: 5, unit: '%' }
  ];

  return (
    <Box>
      {healthItems.map((item, idx) => (
        <Box key={idx} sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <item.icon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
              <Typography variant="body2">{item.label}</Typography>
            </Box>
            <Typography 
              variant="body2" 
              fontWeight="bold"
              color={item.value > item.threshold ? 'error.main' : 'success.main'}
            >
              {item.value}{item.unit || '%'}
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={Math.min(item.value, 100)}
            sx={{
              height: 6,
              borderRadius: 3,
              bgcolor: alpha(theme.palette.grey[500], 0.2),
              '& .MuiLinearProgress-bar': {
                bgcolor: item.value > item.threshold ? 'error.main' : 'success.main',
                borderRadius: 3
              }
            }}
          />
        </Box>
      ))}
    </Box>
  );
};

// Agent Configuration Panel
const AgentConfigPanel = ({ config = {}, onUpdate }) => {
  const [localConfig, setLocalConfig] = useState(config);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setLocalConfig(config);
  }, [config]);

  const handleChange = (key, value) => {
    setLocalConfig(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    onUpdate?.(localConfig);
    setHasChanges(false);
  };

  return (
    <Box>
      <List>
        <ListItem>
          <ListItemText
            primary="Auto-Execute Recommendations"
            secondary="Automatically execute high-confidence recommendations"
          />
          <Switch
            checked={localConfig.autoExecute || false}
            onChange={(e) => handleChange('autoExecute', e.target.checked)}
          />
        </ListItem>
        <ListItem>
          <ListItemText
            primary="Real-time Monitoring"
            secondary="Enable continuous system monitoring"
          />
          <Switch
            checked={localConfig.realTimeMonitoring !== false}
            onChange={(e) => handleChange('realTimeMonitoring', e.target.checked)}
          />
        </ListItem>
        <ListItem>
          <ListItemText
            primary="Alert Notifications"
            secondary="Receive notifications for critical alerts"
          />
          <Switch
            checked={localConfig.alertNotifications !== false}
            onChange={(e) => handleChange('alertNotifications', e.target.checked)}
          />
        </ListItem>
        <ListItem>
          <ListItemText
            primary="Confidence Threshold"
            secondary={`Minimum confidence for auto-execution: ${localConfig.confidenceThreshold || 80}%`}
          />
        </ListItem>
        <ListItem>
          <Slider
            value={localConfig.confidenceThreshold || 80}
            onChange={(e, value) => handleChange('confidenceThreshold', value)}
            min={50}
            max={100}
            step={5}
            marks
            valueLabelDisplay="auto"
          />
        </ListItem>
      </List>
      {hasChanges && (
        <Box sx={{ p: 2 }}>
          <Button
            fullWidth
            variant="contained"
            onClick={handleSave}
          >
            Save Configuration
          </Button>
        </Box>
      )}
    </Box>
  );
};

// Activity Log Component
const ActivityLog = ({ activities = [] }) => {
  const theme = useTheme();

  if (!activities || activities.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4, opacity: 0.7 }}>
        <HistoryIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
        <Typography variant="body1" color="text.secondary">
          No recent activity
        </Typography>
      </Box>
    );
  }

  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Time</TableCell>
            <TableCell>Action</TableCell>
            <TableCell>Target</TableCell>
            <TableCell>Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {activities.slice(0, 10).map((activity, idx) => (
            <TableRow key={idx}>
              <TableCell>
                <Typography variant="caption">
                  {new Date(activity.timestamp).toLocaleTimeString()}
                </Typography>
              </TableCell>
              <TableCell>
                {typeof activity.action === 'string' 
                  ? activity.action 
                  : (activity.action?.label || activity.action?.type || 'Action')}
              </TableCell>
              <TableCell>{activity.target || '-'}</TableCell>
              <TableCell>
                <Chip
                  label={activity.status || 'completed'}
                  size="small"
                  color={activity.status === 'success' ? 'success' : activity.status === 'failed' ? 'error' : 'default'}
                  variant="outlined"
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

// Main Command Center Component
const AIAgentCommandCenter = () => {
  const theme = useTheme();
  const { 
    status: agentStatus,
    alerts = [],
    insights = [],
    config = {},
    fetchStatus, 
    fetchAlerts,
    fetchSmartInsights,
    fetchMetrics,
    executeAction,
    acknowledgeItem,
    updateConfig 
  } = useAIAgent();
  
  // Get escalation data from AdminContext (PROJECT OLYMPUS)
  const {
    escalations,
    escalationStats
  } = useAdminData();
  
  // Derive values from context - handle nested status object
  const status = agentStatus?.status || 'unknown';
  const metrics = agentStatus?.metrics || {};
  
  // Smart insights have priority field - these are the actionable ones
  const recommendations = insights.filter(i => i.priority);
  const criticalInsights = insights.filter(i => i.priority === 'critical' || i.priority === 'high');
  const activities = insights.filter(i => i.type === 'activity');
  
  const [activeTab, setActiveTab] = useState(0);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [configExpanded, setConfigExpanded] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch data on mount
  useEffect(() => {
    handleRefresh();
    // Set up auto-refresh every 60 seconds (reduced from 30s to avoid too many API calls)
    const interval = setInterval(handleRefresh, 60000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        fetchStatus?.(),
        fetchAlerts?.(),
        fetchSmartInsights?.(),
        fetchMetrics?.()
      ]);
    } catch (error) {
      console.error('Failed to refresh data:', error);
    }
    setIsRefreshing(false);
  };

  const handleExecuteRecommendation = async (recommendation) => {
    try {
      await executeAction?.(recommendation.id, recommendation.action || 'execute');
    } catch (error) {
      console.error('Failed to execute recommendation:', error);
    }
  };

  const handleViewAlert = (alert) => {
    setSelectedAlert(alert);
  };

  const handleDismissAlert = async (alertId) => {
    try {
      await acknowledgeItem?.('alert', alertId);
      setSelectedAlert(null);
    } catch (error) {
      console.error('Failed to dismiss alert:', error);
    }
  };

  // Calculate summary metrics
  const summaryMetrics = {
    activeAlerts: alerts?.filter(a => a.status !== 'resolved')?.length || 0,
    totalInsights: recommendations?.length || 0,
    criticalInsights: criticalInsights?.length || 0,
    riskScore: metrics?.riskScore || criticalInsights?.length * 10 || 0,
    uptime: metrics?.uptime || '99.9%',
    pendingEscalations: escalationStats?.pending || escalations?.filter(e => e.status === 'pending').length || 0
  };

  // Handler for agent card clicks
  const [selectedAgent, setSelectedAgent] = useState(null);
  
  const handleAgentClick = (agent) => {
    setSelectedAgent(agent);
    // TODO: Open agent details dialog in Phase 5
    console.log('Agent clicked:', agent.name);
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Mission Control Header */}
      <MissionControlHeader />

      {/* Agent Grid - All 12 PROJECT OLYMPUS Agents */}
      <AgentGrid onAgentClick={handleAgentClick} />

      {/* Main Content */}
      <Grid container spacing={3}>
        {/* Left Column - Tabs */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ mb: 3 }}>
            <Tabs
              value={activeTab}
              onChange={(e, v) => setActiveTab(v)}
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab icon={<TimelineIcon />} label="Overview" />
              <Tab 
                icon={<AlertIcon />} 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    Alerts
                    {summaryMetrics.activeAlerts > 0 && (
                      <Chip label={summaryMetrics.activeAlerts} size="small" color="warning" />
                    )}
                  </Box>
                } 
              />
              <Tab 
                icon={<AutoFixIcon />} 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    Smart Insights
                    {summaryMetrics.criticalInsights > 0 && (
                      <Chip label={summaryMetrics.criticalInsights} size="small" color="error" />
                    )}
                  </Box>
                } 
              />
              <Tab icon={<HistoryIcon />} label="Activity Log" />
              <Tab 
                icon={<EscalationIcon />} 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    Escalations
                    {summaryMetrics.pendingEscalations > 0 && (
                      <Chip label={summaryMetrics.pendingEscalations} size="small" color="error" />
                    )}
                  </Box>
                } 
              />
            </Tabs>

            <Box sx={{ p: 2 }}>
              {/* Overview Tab */}
              {activeTab === 0 && (
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Card>
                      <CardHeader title="System Health" />
                      <CardContent>
                        <SystemHealthPanel metrics={metrics} />
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Card>
                      <CardHeader title="Recent Alerts" />
                      <CardContent>
                        <AlertsList 
                          alerts={alerts?.slice(0, 3)} 
                          onView={handleViewAlert}
                        />
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              )}

              {/* Alerts Tab */}
              {activeTab === 1 && (
                <AlertsList 
                  alerts={alerts} 
                  onView={handleViewAlert}
                  onDismiss={handleDismissAlert}
                />
              )}

              {/* Recommendations Tab */}
              {activeTab === 2 && (
                <RecommendationsList 
                  recommendations={recommendations}
                  onExecute={handleExecuteRecommendation}
                />
              )}

              {/* Activity Log Tab */}
              {activeTab === 3 && (
                <ActivityLog activities={activities} />
              )}

              {/* Escalations Tab (PROJECT OLYMPUS) */}
              {activeTab === 4 && (
                <EscalationInbox />
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Right Column - Chat */}
        <Grid item xs={12} md={4}>
          <AIAgentChatPanel maxHeight={600} />
        </Grid>
      </Grid>

      {/* Alert Detail Dialog */}
      <Dialog
        open={!!selectedAlert}
        onClose={() => setSelectedAlert(null)}
        maxWidth="sm"
        fullWidth
      >
        {selectedAlert && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AlertIcon color={selectedAlert.severity === 'critical' ? 'error' : 'warning'} />
                {selectedAlert.title || 'Alert Details'}
              </Box>
            </DialogTitle>
            <DialogContent>
              <Alert severity={selectedAlert.severity === 'critical' ? 'error' : 'warning'} sx={{ mb: 2 }}>
                <AlertTitle>{selectedAlert.severity?.toUpperCase()} Severity</AlertTitle>
                {selectedAlert.message}
              </Alert>
              <Typography variant="body2" paragraph>
                {selectedAlert.description || selectedAlert.details}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Detected: {new Date(selectedAlert.timestamp).toLocaleString()}
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setSelectedAlert(null)}>Close</Button>
              <Button
                variant="contained"
                color="primary"
                onClick={() => handleDismissAlert(selectedAlert.id)}
              >
                Acknowledge & Dismiss
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default AIAgentCommandCenter;
