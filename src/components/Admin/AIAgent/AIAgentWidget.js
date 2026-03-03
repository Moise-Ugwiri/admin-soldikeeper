/* eslint-disable */
/**
 * AI Agent Widget
 * 
 * A compact dashboard widget showing AI Agent status, alerts, and quick actions
 */

import React, { useState, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Button,
  IconButton,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  LinearProgress,
  Tooltip,
  Badge,
  Collapse,
  Divider,
  CircularProgress,
  useTheme,
  alpha
} from '@mui/material';
import {
  SmartToy as AgentIcon,
  PlayArrow as StartIcon,
  Stop as StopIcon,
  Refresh as RefreshIcon,
  Insights as InsightIcon,
  Warning as AlertIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  TrendingUp as TrendingIcon,
  Security as SecurityIcon,
  People as UsersIcon,
  AttachMoney as RevenueIcon,
  ExpandMore as ExpandIcon,
  ExpandLess as CollapseIcon,
  OpenInNew as OpenIcon,
  AutoAwesome as AIIcon,
  Circle as StatusDot
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useAIAgent } from '../../../contexts/AIAgentContext';
import { useAuth } from '../../../contexts/AuthContext';

/**
 * Status indicator colors
 */
const STATUS_COLORS = {
  active: 'success',
  running: 'success',
  stopped: 'default',
  error: 'error',
  initializing: 'warning',
  unknown: 'default'
};

/**
 * Severity colors
 */
const SEVERITY_COLORS = {
  critical: 'error',
  high: 'error',
  medium: 'warning',
  low: 'info'
};

/**
 * Category icons
 */
const CATEGORY_ICONS = {
  security: SecurityIcon,
  users: UsersIcon,
  analytics: TrendingIcon,
  transactions: RevenueIcon,
  system: AgentIcon
};

const AIAgentWidget = ({ onOpenCommandCenter, compact = false }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { user } = useAuth();
  const {
    status = {},
    insights = [],
    alerts = [],
    loading = false,
    error = null,
    connected = false,
    startAgent,
    stopAgent,
    runAnalysis,
    acknowledgeItem,
    clearError
  } = useAIAgent() || {};

  const [expanded, setExpanded] = useState(!compact);
  const [showAllAlerts, setShowAllAlerts] = useState(false);
  const [showAllInsights, setShowAllInsights] = useState(false);

  // Check if user is superadmin - check multiple possible patterns
  const isSuperAdmin = user?.role === 'superadmin' || user?.isSuperAdmin === true;

  // Computed values
  const unacknowledgedAlerts = useMemo(() => 
    alerts.filter(a => !a.acknowledged), [alerts]
  );

  const unacknowledgedInsights = useMemo(() => 
    insights.filter(i => !i.acknowledged), [insights]
  );

  const criticalAlerts = useMemo(() => 
    unacknowledgedAlerts.filter(a => a.severity === 'critical'), [unacknowledgedAlerts]
  );

  const displayedAlerts = showAllAlerts 
    ? unacknowledgedAlerts.slice(0, 10) 
    : unacknowledgedAlerts.slice(0, 3);

  const displayedInsights = showAllInsights 
    ? unacknowledgedInsights.slice(0, 10) 
    : unacknowledgedInsights.slice(0, 3);

  // Handlers
  const handleToggleAgent = async () => {
    if (!isSuperAdmin) {
      console.warn('Only superadmins can start/stop the AI Agent');
      return;
    }
    try {
      if (status.isRunning) {
        await stopAgent();
      } else {
        await startAgent();
      }
    } catch (err) {
      console.error('Failed to toggle agent:', err);
    }
  };

  const handleRunAnalysis = async () => {
    try {
      await runAnalysis();
    } catch (err) {
      console.error('Failed to run analysis:', err);
    }
  };

  const handleAcknowledgeAlert = async (alertId) => {
    try {
      await acknowledgeItem('alert', alertId);
    } catch (err) {
      console.error('Failed to acknowledge alert:', err);
    }
  };

  const renderStatusIndicator = () => {
    const statusColor = STATUS_COLORS[status.status] || 'default';
    
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Badge
          overlap="circular"
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          badgeContent={
            <StatusDot 
              sx={{ 
                fontSize: 12, 
                color: theme.palette[statusColor]?.main || theme.palette.grey[500],
                animation: status.isRunning ? 'pulse 2s infinite' : 'none'
              }} 
            />
          }
        >
          <Avatar
            sx={{
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              color: theme.palette.primary.main,
              width: 40,
              height: 40
            }}
          >
            <AIIcon />
          </Avatar>
        </Badge>
        <Box>
          <Typography variant="subtitle2" fontWeight="bold">
            AI Admin Agent
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {connected ? (
              status.isRunning ? 'Active & Monitoring' : 'Stopped'
            ) : (
              'Disconnected'
            )}
          </Typography>
        </Box>
      </Box>
    );
  };

  const renderQuickStats = () => (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 1,
        mt: 2,
        mb: 2
      }}
    >
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h6" color="primary">
          {status.metrics?.analysisCount || 0}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Analyses
        </Typography>
      </Box>
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h6" color="info.main">
          {status.metrics?.insightsGenerated || 0}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Insights
        </Typography>
      </Box>
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h6" color="warning.main">
          {unacknowledgedAlerts.length}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Alerts
        </Typography>
      </Box>
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h6" color="success.main">
          {status.metrics?.actionsExecuted || 0}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Actions
        </Typography>
      </Box>
    </Box>
  );

  const renderAlertItem = (alert) => {
    const CategoryIcon = CATEGORY_ICONS[alert.category] || AlertIcon;
    
    return (
      <ListItem
        key={alert.id}
        sx={{
          borderRadius: 1,
          mb: 0.5,
          bgcolor: alpha(
            theme.palette[SEVERITY_COLORS[alert.severity]]?.main || theme.palette.grey[500],
            0.08
          )
        }}
      >
        <ListItemIcon sx={{ minWidth: 36 }}>
          <CategoryIcon 
            fontSize="small" 
            color={SEVERITY_COLORS[alert.severity]}
          />
        </ListItemIcon>
        <ListItemText
          primary={
            <Typography variant="body2" fontWeight="medium">
              {alert.title}
            </Typography>
          }
          secondary={
            <Typography variant="caption" color="text.secondary" noWrap>
              {alert.message}
            </Typography>
          }
        />
        <ListItemSecondaryAction>
          <Tooltip title="Acknowledge">
            <IconButton
              size="small"
              onClick={() => handleAcknowledgeAlert(alert.id)}
            >
              <SuccessIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </ListItemSecondaryAction>
      </ListItem>
    );
  };

  const renderInsightItem = (insight) => {
    const CategoryIcon = CATEGORY_ICONS[insight.category] || InsightIcon;
    
    return (
      <ListItem
        key={insight.id}
        sx={{
          borderRadius: 1,
          mb: 0.5,
          bgcolor: alpha(theme.palette.info.main, 0.05)
        }}
      >
        <ListItemIcon sx={{ minWidth: 36 }}>
          <CategoryIcon fontSize="small" color="info" />
        </ListItemIcon>
        <ListItemText
          primary={
            <Typography variant="body2" fontWeight="medium">
              {insight.title}
            </Typography>
          }
          secondary={
            <Typography variant="caption" color="text.secondary" noWrap>
              {insight.description}
            </Typography>
          }
        />
      </ListItem>
    );
  };

  return (
    <Card 
      elevation={2}
      sx={{
        position: 'relative',
        overflow: 'visible',
        border: criticalAlerts.length > 0 
          ? `2px solid ${theme.palette.error.main}`
          : undefined
      }}
    >
      {/* Critical alert badge */}
      {criticalAlerts.length > 0 && (
        <Chip
          icon={<AlertIcon />}
          label={`${criticalAlerts.length} Critical`}
          color="error"
          size="small"
          sx={{
            position: 'absolute',
            top: -12,
            right: 16,
            fontWeight: 'bold'
          }}
        />
      )}

      {loading && <LinearProgress sx={{ position: 'absolute', top: 0, left: 0, right: 0 }} />}

      <CardHeader
        title={renderStatusIndicator()}
        action={
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Tooltip title="Run Analysis">
              <IconButton 
                size="small" 
                onClick={handleRunAnalysis}
                disabled={loading || !status.isRunning}
              >
                <RefreshIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title={
              !isSuperAdmin 
                ? 'Superadmin privileges required' 
                : (status.isRunning ? 'Stop Agent' : 'Start Agent')
            }>
              <span>
                <IconButton
                  size="small"
                  onClick={handleToggleAgent}
                  disabled={loading || !isSuperAdmin}
                  color={status.isRunning ? 'error' : 'success'}
                >
                  {status.isRunning ? <StopIcon fontSize="small" /> : <StartIcon fontSize="small" />}
                </IconButton>
              </span>
            </Tooltip>
            {onOpenCommandCenter && (
              <Tooltip title="Open Command Center">
                <IconButton size="small" onClick={onOpenCommandCenter}>
                  <OpenIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            <IconButton size="small" onClick={() => setExpanded(!expanded)}>
              {expanded ? <CollapseIcon /> : <ExpandIcon />}
            </IconButton>
          </Box>
        }
        sx={{ pb: 0 }}
      />

      <Collapse in={expanded}>
        <CardContent sx={{ pt: 1 }}>
          {/* Error display */}
          {error && (
            <Box
              sx={{
                p: 1,
                mb: 2,
                bgcolor: alpha(theme.palette.error.main, 0.1),
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <Typography variant="caption" color="error">
                {error}
              </Typography>
              <IconButton size="small" onClick={clearError}>
                <ErrorIcon fontSize="small" color="error" />
              </IconButton>
            </Box>
          )}

          {/* Quick stats */}
          {renderQuickStats()}

          <Divider sx={{ my: 1 }} />

          {/* Alerts section */}
          {unacknowledgedAlerts.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <AlertIcon fontSize="small" color="warning" />
                  Active Alerts ({unacknowledgedAlerts.length})
                </Typography>
                {unacknowledgedAlerts.length > 3 && (
                  <Button
                    size="small"
                    onClick={() => setShowAllAlerts(!showAllAlerts)}
                  >
                    {showAllAlerts ? 'Show Less' : 'Show All'}
                  </Button>
                )}
              </Box>
              <List dense sx={{ py: 0 }}>
                {displayedAlerts.map(renderAlertItem)}
              </List>
            </Box>
          )}

          {/* Insights section */}
          {unacknowledgedInsights.length > 0 && (
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <InsightIcon fontSize="small" color="info" />
                  Recent Insights ({unacknowledgedInsights.length})
                </Typography>
                {unacknowledgedInsights.length > 3 && (
                  <Button
                    size="small"
                    onClick={() => setShowAllInsights(!showAllInsights)}
                  >
                    {showAllInsights ? 'Show Less' : 'Show All'}
                  </Button>
                )}
              </Box>
              <List dense sx={{ py: 0 }}>
                {displayedInsights.map(renderInsightItem)}
              </List>
            </Box>
          )}

          {/* Empty state */}
          {unacknowledgedAlerts.length === 0 && unacknowledgedInsights.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 3, color: 'text.secondary' }}>
              <SuccessIcon sx={{ fontSize: 40, opacity: 0.5, mb: 1 }} />
              <Typography variant="body2">
                All clear! No alerts or new insights.
              </Typography>
              {!status.isRunning && (
                <Button
                  size="small"
                  startIcon={<StartIcon />}
                  onClick={handleToggleAgent}
                  sx={{ mt: 1 }}
                >
                  Start Agent
                </Button>
              )}
            </Box>
          )}

          {/* Last analysis info */}
          {status.lastAnalysis && (
            <Typography 
              variant="caption" 
              color="text.secondary" 
              sx={{ display: 'block', mt: 2, textAlign: 'center' }}
            >
              Last analysis: {new Date(status.lastAnalysis.timestamp).toLocaleString()}
            </Typography>
          )}
        </CardContent>
      </Collapse>

      {/* Pulse animation */}
      <style>{`
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
      `}</style>
    </Card>
  );
};

export default AIAgentWidget;
