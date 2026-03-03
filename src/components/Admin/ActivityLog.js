/* eslint-disable */
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  Avatar,
  IconButton,
  Button,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  Tabs,
  Tab,
  Alert,
  Tooltip,
  useTheme,
  useMediaQuery,
  Grid,
  LinearProgress,
  Divider,
  Badge,
  Skeleton,
  Fade,
  Zoom,
  CircularProgress,
  Switch,
  FormControlLabel,
  Autocomplete,
  Stack
} from '@mui/material';
import {
  Timeline,
  TimelineItem,
  TimelineOppositeContent,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot
} from '@mui/lab';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  CheckCircle as SuccessIcon,
  Security as SecurityIcon,
  AccountBalanceWallet as TransactionIcon,
  People as UserIcon,
  Settings as SystemIcon,
  Receipt as ReceiptIcon,
  Group as GroupIcon,
  Login as LoginIcon,
  Logout as LogoutIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Visibility as ViewIcon,
  FileDownload as ExportIcon,
  Timeline as TimelineIcon,
  List as ListIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Speed as SpeedIcon,
  Assessment as AssessmentIcon,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
  Schedule as ScheduleIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  FiberManualRecord as LiveIcon,
  LocationOn as LocationIcon,
  DevicesOther as DeviceIcon,
  AccessTime as TimeIcon,
  PersonSearch as PersonSearchIcon,
  Block as BlockIcon,
  Flag as FlagIcon,
  MoreVert as MoreIcon,
  FilterAlt as FilterAltIcon,
  Clear as ClearIcon,
  CalendarMonth as CalendarIcon,
  Insights as InsightsIcon,
  AutoGraph as AutoGraphIcon,
  Lightbulb as LightbulbIcon,
  NotificationsActive as NotificationsIcon
} from '@mui/icons-material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useTranslation } from 'react-i18next';
import { useAdminData } from '../../contexts/AdminContext';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, LineChart, Line, Area, AreaChart, Legend } from 'recharts';

// Activity Heatmap Component
const ActivityHeatmap = ({ data, theme }) => {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  const getIntensity = (day, hour) => {
    const count = data.find(d => d.day === day && d.hour === hour)?.count || 0;
    const maxCount = Math.max(...data.map(d => d.count), 1);
    return count / maxCount;
  };
  
  return (
    <Box sx={{ overflowX: 'auto' }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', minWidth: 600 }}>
        <Box sx={{ display: 'flex', mb: 1, ml: 5 }}>
          {hours.map(hour => (
            <Box key={hour} sx={{ width: 20, textAlign: 'center', fontSize: '0.6rem', color: 'text.secondary' }}>
              {hour}
            </Box>
          ))}
        </Box>
        {days.map(day => (
          <Box key={day} sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
            <Typography sx={{ width: 40, fontSize: '0.7rem', color: 'text.secondary' }}>{day}</Typography>
            {hours.map(hour => {
              const intensity = getIntensity(day, hour);
              return (
                <Tooltip key={hour} title={`${day} ${hour}:00 - ${data.find(d => d.day === day && d.hour === hour)?.count || 0} activities`}>
                  <Box
                    sx={{
                      width: 18,
                      height: 18,
                      borderRadius: 0.5,
                      mx: 0.1,
                      backgroundColor: intensity > 0 
                        ? `rgba(46, 125, 50, ${Math.max(intensity, 0.1)})`
                        : theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': {
                        transform: 'scale(1.2)',
                        boxShadow: 1
                      }
                    }}
                  />
                </Tooltip>
              );
            })}
          </Box>
        ))}
      </Box>
    </Box>
  );
};

// Live Activity Indicator
const LiveIndicator = ({ isLive, lastUpdate }) => {
  const theme = useTheme();
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Badge
        variant="dot"
        sx={{
          '& .MuiBadge-dot': {
            backgroundColor: isLive ? theme.palette.success.main : theme.palette.grey[400],
            animation: isLive ? 'pulse 1.5s infinite' : 'none',
            '@keyframes pulse': {
              '0%': { boxShadow: `0 0 0 0 ${theme.palette.success.main}80` },
              '70%': { boxShadow: `0 0 0 6px ${theme.palette.success.main}00` },
              '100%': { boxShadow: `0 0 0 0 ${theme.palette.success.main}00` }
            }
          }
        }}
      >
        <LiveIcon sx={{ color: isLive ? 'success.main' : 'grey.400', fontSize: 14 }} />
      </Badge>
      <Typography variant="caption" color={isLive ? 'success.main' : 'text.secondary'}>
        {isLive ? 'Live' : 'Paused'}
      </Typography>
      {lastUpdate && (
        <Typography variant="caption" color="text.secondary">
          • Last update: {new Date(lastUpdate).toLocaleTimeString()}
        </Typography>
      )}
    </Box>
  );
};

// Activity Insight Card
const InsightCard = ({ icon, title, value, trend, trendDirection, color, subtitle }) => {
  const theme = useTheme();
  return (
    <Card 
      sx={{ 
        height: '100%', 
        background: `linear-gradient(135deg, ${color}08 0%, ${color}15 100%)`,
        border: `1px solid ${color}20`,
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: `0 4px 12px ${color}20`
        }
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
              {title}
            </Typography>
            <Typography variant="h4" fontWeight="bold" sx={{ color, my: 0.5 }}>
              {typeof value === 'number' ? value.toLocaleString() : value}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          <Avatar sx={{ backgroundColor: `${color}20`, color }}>
            {icon}
          </Avatar>
        </Box>
        {trend !== undefined && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
            {trendDirection === 'up' ? (
              <TrendingUpIcon sx={{ fontSize: 16, color: 'success.main' }} />
            ) : trendDirection === 'down' ? (
              <TrendingDownIcon sx={{ fontSize: 16, color: 'error.main' }} />
            ) : null}
            <Typography 
              variant="caption" 
              color={trendDirection === 'up' ? 'success.main' : trendDirection === 'down' ? 'error.main' : 'text.secondary'}
            >
              {trend}% vs last period
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

const ActivityLog = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const refreshIntervalRef = useRef(null);
  
  const {
    activityLogs,
    activityPagination,
    filters,
    loading,
    fetchActivityLogs,
    updateFilters,
    exportData,
    users
  } = useAdminData();

  // Local state
  const [viewMode, setViewMode] = useState('dashboard'); // 'dashboard', 'table', 'timeline', 'analytics'
  const [detailsDialog, setDetailsDialog] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [searchTerm, setSearchTerm] = useState(filters.activity?.search || '');
  const [typeFilter, setTypeFilter] = useState(filters.activity?.type || 'all');
  const [dateRange, setDateRange] = useState(filters.activity?.dateRange || 'week');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [severityFilter, setSeverityFilter] = useState('all');
  const [actionFilter, setActionFilter] = useState('all');
  const [userFilter, setUserFilter] = useState(null);
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [selectedActivities, setSelectedActivities] = useState([]);

  // Activity type configuration with enhanced colors
  const activityTypes = {
    user: {
      icon: <UserIcon fontSize="small" />,
      color: theme.palette.primary.main,
      label: t('admin.activity.types.user', 'User')
    },
    transaction: {
      icon: <TransactionIcon fontSize="small" />,
      color: '#4caf50',
      label: t('admin.activity.types.transaction', 'Transaction')
    },
    receipt: {
      icon: <ReceiptIcon fontSize="small" />,
      color: '#2196f3',
      label: t('admin.activity.types.receipt', 'Receipt')
    },
    splitbill: {
      icon: <GroupIcon fontSize="small" />,
      color: '#9c27b0',
      label: t('admin.activity.types.splitbill', 'Split Bill')
    },
    security: {
      icon: <SecurityIcon fontSize="small" />,
      color: '#f44336',
      label: t('admin.activity.types.security', 'Security')
    },
    system: {
      icon: <SystemIcon fontSize="small" />,
      color: '#ff9800',
      label: t('admin.activity.types.system', 'System')
    },
    auth: {
      icon: <LoginIcon fontSize="small" />,
      color: '#607d8b',
      label: t('admin.activity.types.auth', 'Auth')
    },
    budget: {
      icon: <AssessmentIcon fontSize="small" />,
      color: '#00bcd4',
      label: t('admin.activity.types.budget', 'Budget')
    },
    category: {
      icon: <PieChartIcon fontSize="small" />,
      color: '#795548',
      label: t('admin.activity.types.category', 'Category')
    },
    admin: {
      icon: <SecurityIcon fontSize="small" />,
      color: '#e91e63',
      label: t('admin.activity.types.admin', 'Admin')
    }
  };

  // Action icons and colors
  const actionConfig = {
    create: { icon: <AddIcon fontSize="small" />, color: '#4caf50', label: 'Create' },
    read: { icon: <ViewIcon fontSize="small" />, color: '#2196f3', label: 'View' },
    update: { icon: <EditIcon fontSize="small" />, color: '#ff9800', label: 'Update' },
    delete: { icon: <DeleteIcon fontSize="small" />, color: '#f44336', label: 'Delete' },
    login: { icon: <LoginIcon fontSize="small" />, color: '#4caf50', label: 'Login' },
    logout: { icon: <LogoutIcon fontSize="small" />, color: '#607d8b', label: 'Logout' },
    register: { icon: <UserIcon fontSize="small" />, color: '#2196f3', label: 'Register' },
    view: { icon: <ViewIcon fontSize="small" />, color: '#9c27b0', label: 'View' },
    suspend: { icon: <BlockIcon fontSize="small" />, color: '#f44336', label: 'Suspend' },
    activate: { icon: <SuccessIcon fontSize="small" />, color: '#4caf50', label: 'Activate' },
    flag: { icon: <FlagIcon fontSize="small" />, color: '#ff9800', label: 'Flag' },
    export: { icon: <ExportIcon fontSize="small" />, color: '#00bcd4', label: 'Export' },
    import: { icon: <AddIcon fontSize="small" />, color: '#9c27b0', label: 'Import' }
  };

  // Severity configuration
  const severityConfig = {
    info: { color: '#2196f3', icon: <InfoIcon fontSize="small" /> },
    warning: { color: '#ff9800', icon: <WarningIcon fontSize="small" /> },
    error: { color: '#f44336', icon: <ErrorIcon fontSize="small" /> },
    success: { color: '#4caf50', icon: <SuccessIcon fontSize="small" /> }
  };

  // Load activity logs with filters
  useEffect(() => {
    const loadActivities = () => {
      fetchActivityLogs(1, {
        search: searchTerm,
        type: typeFilter,
        dateRange: dateRange,
        startDate,
        endDate,
        severity: severityFilter !== 'all' ? severityFilter : undefined,
        action: actionFilter !== 'all' ? actionFilter : undefined,
        userId: userFilter?._id
      });
      setLastUpdate(new Date());
    };

    loadActivities();

    // Live mode auto-refresh
    if (isLiveMode) {
      refreshIntervalRef.current = setInterval(loadActivities, 10000); // Refresh every 10 seconds
    }

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [fetchActivityLogs, searchTerm, typeFilter, dateRange, startDate, endDate, severityFilter, actionFilter, userFilter, isLiveMode]);

  // Handle search
  const handleSearch = useCallback((value) => {
    setSearchTerm(value);
    updateFilters('activity', { search: value });
  }, [updateFilters]);

  // Handle type filter
  const handleTypeFilter = useCallback((type) => {
    setTypeFilter(type);
    updateFilters('activity', { type });
  }, [updateFilters]);

  // Handle date range filter
  const handleDateRangeFilter = useCallback((range) => {
    setDateRange(range);
    updateFilters('activity', { dateRange: range });
  }, [updateFilters]);

  // Handle page change
  const handlePageChange = useCallback((event, newPage) => {
    fetchActivityLogs(newPage + 1, filters.activity);
  }, [fetchActivityLogs, filters.activity]);

  // Handle activity details
  const handleShowDetails = useCallback((activity) => {
    setSelectedActivity(activity);
    setDetailsDialog(true);
  }, []);

  // Handle export
  const handleExport = useCallback((format = 'csv') => {
    exportData('activity-logs', format);
  }, [exportData]);

  // Clear all filters
  const clearAllFilters = useCallback(() => {
    setSearchTerm('');
    setTypeFilter('all');
    setDateRange('week');
    setSeverityFilter('all');
    setActionFilter('all');
    setUserFilter(null);
    setStartDate(null);
    setEndDate(null);
  }, []);

  // Get activity icon
  const getActivityIcon = useCallback((activity) => {
    const typeConfig = activityTypes[activity?.type] || activityTypes.system;
    return typeConfig.icon;
  }, [activityTypes]);

  // Get activity color
  const getActivityColor = useCallback((activity) => {
    const typeConfig = activityTypes[activity?.type] || activityTypes.system;
    return typeConfig.color;
  }, [activityTypes]);

  // Format activity message
  const formatActivityMessage = useCallback((activity) => {
    if (activity?.translatedMessage) {
      return activity.translatedMessage;
    }
    
    if (activity?.message) {
      return activity.message;
    }
    
    // Fallback to constructing message
    const actionText = t(`admin.activity.actions.${activity?.action}`, { defaultValue: activity?.action || 'Unknown' });
    const resourceText = t(`admin.activity.resources.${activity?.resourceType}`, { defaultValue: activity?.resourceType || '' });
    
    return `${actionText} ${resourceText}`.trim();
  }, [t]);

  // Format relative time
  const formatRelativeTime = useCallback((timestamp) => {
    const now = new Date();
    const date = new Date(timestamp);
    const diff = now - date;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  }, []);

  // Calculate comprehensive activity analytics
  const activityAnalytics = useMemo(() => {
    if (!activityLogs || activityLogs.length === 0) {
      return {
        stats: [],
        typeBreakdown: [],
        hourlyActivity: [],
        heatmapData: [],
        actionBreakdown: [],
        severityBreakdown: [],
        topUsers: [],
        trends: {},
        insights: []
      };
    }

    const logs = Array.isArray(activityLogs) ? activityLogs : [];
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Basic stats
    const todayLogs = logs.filter(log => new Date(log.timestamp) >= today);
    const yesterdayLogs = logs.filter(log => {
      const d = new Date(log.timestamp);
      return d >= yesterday && d < today;
    });
    const errorLogs = logs.filter(log => log.severity === 'error');
    const warningLogs = logs.filter(log => log.severity === 'warning');
    const securityLogs = logs.filter(log => log.type === 'security');
    const authLogs = logs.filter(log => log.type === 'auth');

    // Calculate trends
    const todayChange = yesterdayLogs.length > 0 
      ? Math.round(((todayLogs.length - yesterdayLogs.length) / yesterdayLogs.length) * 100)
      : 0;

    // Type breakdown for pie chart
    const typeCounts = {};
    logs.forEach(log => {
      typeCounts[log.type] = (typeCounts[log.type] || 0) + 1;
    });
    const typeBreakdown = Object.entries(typeCounts).map(([type, count]) => ({
      name: activityTypes[type]?.label || type,
      value: count,
      color: activityTypes[type]?.color || '#999'
    })).sort((a, b) => b.value - a.value);

    // Action breakdown
    const actionCounts = {};
    logs.forEach(log => {
      actionCounts[log.action] = (actionCounts[log.action] || 0) + 1;
    });
    const actionBreakdown = Object.entries(actionCounts).map(([action, count]) => ({
      name: actionConfig[action]?.label || action,
      value: count,
      color: actionConfig[action]?.color || '#999'
    })).sort((a, b) => b.value - a.value);

    // Severity breakdown
    const severityCounts = { info: 0, warning: 0, error: 0, success: 0 };
    logs.forEach(log => {
      if (severityCounts.hasOwnProperty(log.severity)) {
        severityCounts[log.severity]++;
      }
    });
    const severityBreakdown = Object.entries(severityCounts).map(([severity, count]) => ({
      name: severity.charAt(0).toUpperCase() + severity.slice(1),
      value: count,
      color: severityConfig[severity]?.color || '#999'
    }));

    // Hourly activity for line chart
    const hourlyData = Array.from({ length: 24 }, (_, i) => ({ hour: i, count: 0 }));
    todayLogs.forEach(log => {
      const hour = new Date(log.timestamp).getHours();
      hourlyData[hour].count++;
    });
    const hourlyActivity = hourlyData.map(d => ({
      ...d,
      name: `${d.hour.toString().padStart(2, '0')}:00`
    }));

    // Heatmap data (day x hour)
    const heatmapData = [];
    logs.forEach(log => {
      const d = new Date(log.timestamp);
      const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()];
      const hour = d.getHours();
      const existing = heatmapData.find(h => h.day === day && h.hour === hour);
      if (existing) {
        existing.count++;
      } else {
        heatmapData.push({ day, hour, count: 1 });
      }
    });

    // Top active users
    const userCounts = {};
    logs.forEach(log => {
      const userId = log.userId?._id || log.userId || 'system';
      const userName = log.userId?.name || log.userId?.email || 'System';
      if (!userCounts[userId]) {
        userCounts[userId] = { id: userId, name: userName, count: 0 };
      }
      userCounts[userId].count++;
    });
    const topUsers = Object.values(userCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Generate insights
    const insights = [];
    
    if (errorLogs.length > 5) {
      insights.push({
        type: 'warning',
        icon: <ErrorIcon />,
        message: `${errorLogs.length} errors detected in the current period. Consider investigating.`,
        action: 'View Errors'
      });
    }

    const peakHour = hourlyActivity.reduce((max, h) => h.count > max.count ? h : max, hourlyActivity[0]);
    if (peakHour.count > 0) {
      insights.push({
        type: 'info',
        icon: <ScheduleIcon />,
        message: `Peak activity hour: ${peakHour.name} with ${peakHour.count} activities`,
        action: null
      });
    }

    const securityRatio = logs.length > 0 ? (securityLogs.length / logs.length) * 100 : 0;
    if (securityRatio > 20) {
      insights.push({
        type: 'error',
        icon: <SecurityIcon />,
        message: `High security activity: ${securityRatio.toFixed(1)}% of all activities are security-related`,
        action: 'Review Security'
      });
    }

    if (todayChange > 50) {
      insights.push({
        type: 'success',
        icon: <TrendingUpIcon />,
        message: `Activity up ${todayChange}% compared to yesterday. Platform engagement is growing!`,
        action: null
      });
    }

    // Stats cards data - use pagination total for accurate count
    const totalActivities = activityPagination?.total || logs.length;
    
    const stats = [
      {
        title: 'Total Activities',
        value: totalActivities,
        trend: todayChange,
        trendDirection: todayChange > 0 ? 'up' : todayChange < 0 ? 'down' : 'neutral',
        icon: <AssessmentIcon />,
        color: theme.palette.primary.main,
        subtitle: dateRange === 'today' ? 'Today' : `In selected period`
      },
      {
        title: 'Security Events',
        value: securityLogs.length,
        trend: null,
        icon: <SecurityIcon />,
        color: '#f44336',
        subtitle: `${authLogs.length} auth events`
      },
      {
        title: 'Errors',
        value: errorLogs.length,
        trend: null,
        icon: <ErrorIcon />,
        color: '#ff9800',
        subtitle: `${warningLogs.length} warnings`
      },
      {
        title: 'Unique Users',
        value: Object.keys(userCounts).length,
        trend: null,
        icon: <UserIcon />,
        color: '#4caf50',
        subtitle: 'Active in period'
      }
    ];

    return {
      stats,
      typeBreakdown,
      hourlyActivity,
      heatmapData,
      actionBreakdown,
      severityBreakdown,
      topUsers,
      trends: { todayChange },
      insights
    };
  }, [activityLogs, activityPagination, dateRange, theme.palette, activityTypes, actionConfig, severityConfig]);

  // Check if there are any active filters
  const hasActiveFilters = searchTerm || typeFilter !== 'all' || dateRange !== 'week' || 
    severityFilter !== 'all' || actionFilter !== 'all' || userFilter;

  // Render Dashboard View
  const renderDashboard = () => (
    <Box>
      {/* Insights Bar */}
      {activityAnalytics.insights.length > 0 && (
        <Box sx={{ mb: 3 }}>
          {activityAnalytics.insights.slice(0, 2).map((insight, idx) => (
            <Alert 
              key={idx}
              severity={insight.type}
              icon={insight.icon}
              sx={{ mb: 1 }}
              action={insight.action && (
                <Button color="inherit" size="small" onClick={() => {
                  if (insight.action === 'View Errors') {
                    setSeverityFilter('error');
                  } else if (insight.action === 'Review Security') {
                    setTypeFilter('security');
                  }
                  setViewMode('table');
                }}>
                  {insight.action}
                </Button>
              )}
            >
              {insight.message}
            </Alert>
          ))}
        </Box>
      )}

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {activityAnalytics.stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <InsightCard
              icon={stat.icon}
              title={stat.title}
              value={stat.value}
              trend={stat.trend}
              trendDirection={stat.trendDirection}
              color={stat.color}
              subtitle={stat.subtitle}
            />
          </Grid>
        ))}
      </Grid>

      {/* Charts Row */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Activity Type Breakdown */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: 350 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PieChartIcon color="primary" />
                Activity Types
              </Typography>
              {activityAnalytics.typeBreakdown.length > 0 ? (
                <ResponsiveContainer width="100%" height={isMobile ? 280 : 300}>
                  <PieChart margin={{ top: 20, right: 20, left: 20, bottom: 5 }}>
                    <Pie
                      data={activityAnalytics.typeBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={isMobile ? 40 : 50}
                      outerRadius={isMobile ? 70 : 80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {activityAnalytics.typeBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                    <Legend wrapperStyle={{ paddingTop: '15px' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: isMobile ? 280 : 300 }}>
                  <Typography color="text.secondary">No data available</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Hourly Activity */}
        <Grid item xs={12} md={8}>
          <Card sx={{ height: 350 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TimeIcon color="primary" />
                Today's Activity by Hour
              </Typography>
              <ResponsiveContainer width="100%" height={isMobile ? 280 : 300}>
                <AreaChart data={activityAnalytics.hourlyActivity} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="name" tick={{ fontSize: isMobile ? 9 : 10 }} />
                  <YAxis tick={{ fontSize: isMobile ? 9 : 10 }} />
                  <RechartsTooltip />
                  <Legend wrapperStyle={{ paddingTop: '15px' }} />
                  <Area 
                    type="monotone" 
                    dataKey="count" 
                    stroke={theme.palette.primary.main} 
                    fill={`${theme.palette.primary.main}40`}
                    name="Activities"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Second Row */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Activity Heatmap */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AutoGraphIcon color="primary" />
                Activity Heatmap (Day × Hour)
              </Typography>
              <ActivityHeatmap data={activityAnalytics.heatmapData} theme={theme} />
            </CardContent>
          </Card>
        </Grid>

        {/* Top Active Users */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <UserIcon color="primary" />
                Top Active Users
              </Typography>
              {activityAnalytics.topUsers.length > 0 ? (
                <Stack spacing={1.5}>
                  {activityAnalytics.topUsers.map((user, index) => (
                    <Box 
                      key={user.id} 
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 1.5,
                        p: 1,
                        borderRadius: 1,
                        backgroundColor: index === 0 ? 'action.hover' : 'transparent'
                      }}
                    >
                      <Avatar 
                        sx={{ 
                          width: 32, 
                          height: 32, 
                          bgcolor: index === 0 ? 'primary.main' : 'grey.400',
                          fontSize: 14
                        }}
                      >
                        {user.name?.charAt(0) || '#'}
                      </Avatar>
                      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Typography variant="body2" noWrap fontWeight={index === 0 ? 600 : 400}>
                          {user.name}
                        </Typography>
                      </Box>
                      <Chip 
                        label={user.count} 
                        size="small" 
                        color={index === 0 ? 'primary' : 'default'}
                        variant={index === 0 ? 'filled' : 'outlined'}
                      />
                    </Box>
                  ))}
                </Stack>
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200 }}>
                  <Typography color="text.secondary">No user data</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Third Row - Action & Severity Breakdown */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <BarChartIcon color="primary" />
                Actions Breakdown
              </Typography>
              <ResponsiveContainer width="100%" height={isMobile ? 280 : 320}>
                <BarChart data={activityAnalytics.actionBreakdown.slice(0, 8)} layout="vertical" margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis type="number" tick={{ fontSize: isMobile ? 9 : 10 }} />
                  <YAxis type="category" dataKey="name" width={isMobile ? 70 : 80} tick={{ fontSize: isMobile ? 9 : 10 }} />
                  <RechartsTooltip />
                  <Legend wrapperStyle={{ paddingTop: '15px' }} />
                  <Bar dataKey="value" name="Count">
                    {activityAnalytics.actionBreakdown.slice(0, 8).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <NotificationsIcon color="primary" />
                Severity Distribution
              </Typography>
              <ResponsiveContainer width="100%" height={isMobile ? 280 : 320}>
                <BarChart data={activityAnalytics.severityBreakdown} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="name" tick={{ fontSize: isMobile ? 10 : 11 }} />
                  <YAxis tick={{ fontSize: isMobile ? 9 : 10 }} />
                  <RechartsTooltip />
                  <Legend wrapperStyle={{ paddingTop: '15px' }} />
                  <Bar dataKey="value" name="Count" radius={[4, 4, 0, 0]}>
                    {activityAnalytics.severityBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );

  // Render Table View
  const renderTable = () => (
    <Card>
      {loading && <LinearProgress />}
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Time</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>User</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Action</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Resource</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Severity</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Details</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {activityLogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">
                    {loading ? 'Loading activities...' : 'No activities found'}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              activityLogs.map((activity) => (
                <TableRow 
                  key={activity._id} 
                  hover
                  sx={{ 
                    '&:hover': { backgroundColor: 'action.hover' },
                    cursor: 'pointer'
                  }}
                  onClick={() => handleShowDetails(activity)}
                >
                  <TableCell>
                    <Tooltip title={new Date(activity.timestamp).toLocaleString()}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <TimeIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                        <Typography variant="body2">
                          {formatRelativeTime(activity.timestamp)}
                        </Typography>
                      </Box>
                    </Tooltip>
                  </TableCell>
                  
                  <TableCell>
                    <Chip
                      icon={getActivityIcon(activity)}
                      label={activityTypes[activity.type]?.label || activity.type}
                      size="small"
                      sx={{
                        backgroundColor: `${getActivityColor(activity)}15`,
                        color: getActivityColor(activity),
                        fontWeight: 500,
                        '& .MuiChip-icon': { color: getActivityColor(activity) }
                      }}
                    />
                  </TableCell>
                  
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ width: 24, height: 24, fontSize: 12 }}>
                        {activity.userId?.name?.charAt(0) || 'S'}
                      </Avatar>
                      <Typography variant="body2" noWrap sx={{ maxWidth: 120 }}>
                        {activity.userId?.name || activity.userId?.email || 'System'}
                      </Typography>
                    </Box>
                  </TableCell>
                  
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      {actionConfig[activity.action]?.icon || <InfoIcon fontSize="small" />}
                      <Typography variant="body2">
                        {actionConfig[activity.action]?.label || activity.action}
                      </Typography>
                    </Box>
                  </TableCell>
                  
                  <TableCell>
                    <Typography variant="body2" color="text.secondary" noWrap sx={{ maxWidth: 150 }}>
                      {activity.resourceType}
                      {activity.resourceId && (
                        <Typography component="span" variant="caption" color="text.disabled">
                          {' '}({activity.resourceId.slice(-6)})
                        </Typography>
                      )}
                    </Typography>
                  </TableCell>
                  
                  <TableCell>
                    <Chip
                      icon={severityConfig[activity.severity]?.icon}
                      label={activity.severity}
                      size="small"
                      sx={{
                        backgroundColor: `${severityConfig[activity.severity]?.color}15`,
                        color: severityConfig[activity.severity]?.color,
                        textTransform: 'capitalize',
                        fontWeight: 500
                      }}
                    />
                  </TableCell>
                  
                  <TableCell>
                    <Typography variant="body2" color="text.secondary" noWrap sx={{ maxWidth: 200 }}>
                      {activity.message || activity.details || '-'}
                    </Typography>
                  </TableCell>
                  
                  <TableCell align="right">
                    <IconButton 
                      size="small" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleShowDetails(activity);
                      }}
                    >
                      <InfoIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      <TablePagination
        component="div"
        count={activityPagination?.total || 0}
        page={(activityPagination?.page || 1) - 1}
        onPageChange={handlePageChange}
        rowsPerPage={activityPagination?.limit || 100}
        rowsPerPageOptions={[50, 100, 200]}
        labelRowsPerPage="Per page:"
      />
    </Card>
  );

  // Render Timeline View
  const renderTimeline = () => (
    <Card>
      <CardContent>
        {activityLogs.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography color="text.secondary">
              {loading ? 'Loading activities...' : 'No activities found'}
            </Typography>
          </Box>
        ) : (
          <Timeline position="alternate">
            {activityLogs.slice(0, 50).map((activity, index) => (
              <TimelineItem key={activity._id}>
                <TimelineOppositeContent sx={{ m: 'auto 0' }} color="text.secondary">
                  <Typography variant="caption">
                    {formatRelativeTime(activity.timestamp)}
                  </Typography>
                  <Typography variant="caption" display="block" color="text.disabled">
                    {new Date(activity.timestamp).toLocaleTimeString()}
                  </Typography>
                </TimelineOppositeContent>
                <TimelineSeparator>
                  <TimelineDot
                    sx={{
                      backgroundColor: getActivityColor(activity),
                      color: 'white',
                      boxShadow: `0 0 0 4px ${getActivityColor(activity)}30`
                    }}
                  >
                    {getActivityIcon(activity)}
                  </TimelineDot>
                  {index < Math.min(activityLogs.length, 50) - 1 && (
                    <TimelineConnector sx={{ backgroundColor: 'divider' }} />
                  )}
                </TimelineSeparator>
                <TimelineContent sx={{ py: '12px', px: 2 }}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      cursor: 'pointer',
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 2,
                      transition: 'all 0.2s',
                      '&:hover': { 
                        boxShadow: 2,
                        borderColor: getActivityColor(activity)
                      }
                    }}
                    onClick={() => handleShowDetails(activity)}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Chip
                        label={activityTypes[activity.type]?.label || activity.type}
                        size="small"
                        sx={{
                          backgroundColor: `${getActivityColor(activity)}15`,
                          color: getActivityColor(activity),
                          fontWeight: 500
                        }}
                      />
                      <Chip
                        label={activity.severity}
                        size="small"
                        variant="outlined"
                        sx={{
                          color: severityConfig[activity.severity]?.color,
                          borderColor: severityConfig[activity.severity]?.color,
                          textTransform: 'capitalize'
                        }}
                      />
                    </Box>
                    <Typography variant="body1" fontWeight={500}>
                      {formatActivityMessage(activity)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {activity.userId?.name || 'System'} • {activity.resourceType}
                    </Typography>
                    {activity.details && (
                      <Typography variant="caption" color="text.disabled" sx={{ mt: 0.5, display: 'block' }}>
                        {activity.details.slice(0, 100)}{activity.details.length > 100 ? '...' : ''}
                      </Typography>
                    )}
                  </Paper>
                </TimelineContent>
              </TimelineItem>
            ))}
          </Timeline>
        )}
      </CardContent>
    </Card>
  );

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box>
        {/* Header with Live Status and View Mode */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h5" fontWeight="bold">
              Activity Log
            </Typography>
            <LiveIndicator isLive={isLiveMode} lastUpdate={lastUpdate} />
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FormControlLabel
              control={
                <Switch 
                  checked={isLiveMode} 
                  onChange={(e) => setIsLiveMode(e.target.checked)}
                  size="small"
                  color="success"
                />
              }
              label={<Typography variant="caption">Auto-refresh</Typography>}
            />
            
            <Tabs
              value={viewMode}
              onChange={(e, newValue) => setViewMode(newValue)}
              sx={{ 
                minHeight: 36,
                '& .MuiTab-root': { minHeight: 36, py: 0.5, px: 1.5 }
              }}
            >
              <Tab icon={<AssessmentIcon fontSize="small" />} value="dashboard" label="Dashboard" iconPosition="start" />
              <Tab icon={<ListIcon fontSize="small" />} value="table" label="Table" iconPosition="start" />
              <Tab icon={<TimelineIcon fontSize="small" />} value="timeline" label="Timeline" iconPosition="start" />
            </Tabs>
          </Box>
        </Box>

        {/* Filters */}
        <Card sx={{ mb: 3 }}>
          <CardContent sx={{ pb: 2 }}>
            <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 2, alignItems: 'flex-start' }}>
              {/* Primary Filters */}
              <TextField
                placeholder="Search activities..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                  endAdornment: searchTerm && (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => handleSearch('')}>
                        <ClearIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
                sx={{ minWidth: 250 }}
              />
              
              <FormControl size="small" sx={{ minWidth: 130 }}>
                <InputLabel>Type</InputLabel>
                <Select
                  value={typeFilter}
                  label="Type"
                  onChange={(e) => handleTypeFilter(e.target.value)}
                >
                  <MenuItem value="all">All Types</MenuItem>
                  {Object.entries(activityTypes).map(([key, config]) => (
                    <MenuItem key={key} value={key}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {config.icon}
                        {config.label}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 130 }}>
                <InputLabel>Date Range</InputLabel>
                <Select
                  value={dateRange}
                  label="Date Range"
                  onChange={(e) => handleDateRangeFilter(e.target.value)}
                >
                  <MenuItem value="today">Today</MenuItem>
                  <MenuItem value="week">This Week</MenuItem>
                  <MenuItem value="month">This Month</MenuItem>
                  <MenuItem value="all">All Time</MenuItem>
                  <MenuItem value="custom">Custom Range</MenuItem>
                </Select>
              </FormControl>

              <Box sx={{ flexGrow: 1 }} />

              {/* Action Buttons */}
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<FilterAltIcon />}
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  color={hasActiveFilters ? 'primary' : 'inherit'}
                >
                  {showAdvancedFilters ? 'Hide Filters' : 'More Filters'}
                  {hasActiveFilters && <Badge badgeContent="!" color="primary" sx={{ ml: 1 }} />}
                </Button>
                
                {hasActiveFilters && (
                  <Button
                    variant="text"
                    size="small"
                    startIcon={<ClearIcon />}
                    onClick={clearAllFilters}
                    color="error"
                  >
                    Clear All
                  </Button>
                )}
                
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<ExportIcon />}
                  onClick={() => handleExport('csv')}
                >
                  Export
                </Button>
                
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<RefreshIcon />}
                  onClick={() => fetchActivityLogs(1, filters.activity)}
                  disabled={loading}
                >
                  Refresh
                </Button>
              </Box>
            </Box>

            {/* Advanced Filters */}
            <Fade in={showAdvancedFilters}>
              <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider', display: showAdvancedFilters ? 'flex' : 'none', gap: 2, flexWrap: 'wrap' }}>
                <FormControl size="small" sx={{ minWidth: 130 }}>
                  <InputLabel>Severity</InputLabel>
                  <Select
                    value={severityFilter}
                    label="Severity"
                    onChange={(e) => setSeverityFilter(e.target.value)}
                  >
                    <MenuItem value="all">All Severities</MenuItem>
                    {Object.entries(severityConfig).map(([key, config]) => (
                      <MenuItem key={key} value={key}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {config.icon}
                          <span style={{ textTransform: 'capitalize' }}>{key}</span>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl size="small" sx={{ minWidth: 130 }}>
                  <InputLabel>Action</InputLabel>
                  <Select
                    value={actionFilter}
                    label="Action"
                    onChange={(e) => setActionFilter(e.target.value)}
                  >
                    <MenuItem value="all">All Actions</MenuItem>
                    {Object.entries(actionConfig).map(([key, config]) => (
                      <MenuItem key={key} value={key}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {config.icon}
                          {config.label}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {dateRange === 'custom' && (
                  <>
                    <DateTimePicker
                      label="Start Date"
                      value={startDate}
                      onChange={setStartDate}
                      slotProps={{
                        textField: { size: 'small', sx: { width: 200 } }
                      }}
                    />
                    <DateTimePicker
                      label="End Date"
                      value={endDate}
                      onChange={setEndDate}
                      slotProps={{
                        textField: { size: 'small', sx: { width: 200 } }
                      }}
                    />
                  </>
                )}
              </Box>
            </Fade>
          </CardContent>
        </Card>

        {/* Main Content Based on View Mode */}
        {viewMode === 'dashboard' && renderDashboard()}
        {viewMode === 'table' && renderTable()}
        {viewMode === 'timeline' && renderTimeline()}

        {/* Activity Details Dialog */}
        <Dialog
          open={detailsDialog}
          onClose={() => setDetailsDialog(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {selectedActivity && getActivityIcon(selectedActivity)}
            Activity Details
          </DialogTitle>
          <DialogContent dividers>
            {selectedActivity && (
              <Box>
                {/* Activity Header */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <Avatar
                    sx={{
                      width: 48,
                      height: 48,
                      bgcolor: `${getActivityColor(selectedActivity)}20`,
                      color: getActivityColor(selectedActivity)
                    }}
                  >
                    {getActivityIcon(selectedActivity)}
                  </Avatar>
                  <Box>
                    <Typography variant="h6">
                      {formatActivityMessage(selectedActivity)}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                      <Chip
                        label={activityTypes[selectedActivity.type]?.label || selectedActivity.type}
                        size="small"
                        sx={{
                          backgroundColor: `${getActivityColor(selectedActivity)}15`,
                          color: getActivityColor(selectedActivity)
                        }}
                      />
                      <Chip
                        label={selectedActivity.severity}
                        size="small"
                        sx={{
                          backgroundColor: `${severityConfig[selectedActivity.severity]?.color}15`,
                          color: severityConfig[selectedActivity.severity]?.color,
                          textTransform: 'capitalize'
                        }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        {new Date(selectedActivity.timestamp).toLocaleString()}
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                <Divider sx={{ my: 2 }} />
                
                {/* Details Grid */}
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      User
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                      <Avatar sx={{ width: 24, height: 24, fontSize: 12 }}>
                        {selectedActivity.userId?.name?.charAt(0) || 'S'}
                      </Avatar>
                      <Typography variant="body1">
                        {selectedActivity.userId?.name || selectedActivity.userId?.email || 'System'}
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Action
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                      {actionConfig[selectedActivity.action]?.icon}
                      <Typography variant="body1">
                        {actionConfig[selectedActivity.action]?.label || selectedActivity.action}
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Resource Type
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 0.5 }}>
                      {selectedActivity.resourceType || '-'}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Resource ID
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 0.5, fontFamily: 'monospace', fontSize: 13 }}>
                      {selectedActivity.resourceId || '-'}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <LocationIcon fontSize="inherit" /> IP Address
                      </Box>
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 0.5, fontFamily: 'monospace' }}>
                      {selectedActivity.ipAddress || 'Not recorded'}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Location
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 0.5 }}>
                      {selectedActivity.location?.city && selectedActivity.location?.country
                        ? `${selectedActivity.location.city}, ${selectedActivity.location.country}`
                        : 'Unknown'}
                    </Typography>
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <DeviceIcon fontSize="inherit" /> User Agent
                      </Box>
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 0.5, fontFamily: 'monospace', fontSize: 11, wordBreak: 'break-all' }}>
                      {selectedActivity.userAgent || 'Not recorded'}
                    </Typography>
                  </Grid>

                  {selectedActivity.message && (
                    <Grid item xs={12}>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Message
                      </Typography>
                      <Typography variant="body1" sx={{ mt: 0.5 }}>
                        {selectedActivity.message}
                      </Typography>
                    </Grid>
                  )}

                  {selectedActivity.details && (
                    <Grid item xs={12}>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Details
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 0.5 }}>
                        {selectedActivity.details}
                      </Typography>
                    </Grid>
                  )}
                  
                  {selectedActivity.metadata && Object.keys(selectedActivity.metadata).length > 0 && (
                    <Grid item xs={12}>
                      <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                        Metadata
                      </Typography>
                      <Paper 
                        variant="outlined" 
                        sx={{ 
                          p: 2, 
                          backgroundColor: theme.palette.mode === 'dark' ? 'grey.900' : 'grey.50',
                          borderRadius: 1
                        }}
                      >
                        <pre style={{ 
                          margin: 0, 
                          fontSize: '0.75rem', 
                          whiteSpace: 'pre-wrap',
                          fontFamily: 'monospace',
                          color: theme.palette.text.primary
                        }}>
                          {JSON.stringify(selectedActivity.metadata, null, 2)}
                        </pre>
                      </Paper>
                    </Grid>
                  )}
                </Grid>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDetailsDialog(false)}>
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
};

export default ActivityLog;
