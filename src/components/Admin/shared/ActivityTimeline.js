/* eslint-disable */
import React, { useState, useMemo, memo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Paper,
  Avatar,
  Chip,
  Tooltip,
  IconButton,
  Collapse,
  Button,
  useTheme,
  alpha
} from '@mui/material';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent
} from '@mui/lab';
import {
  PersonAdd as UserAddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Security as SecurityIcon,
  Payment as PaymentIcon,
  Settings as SettingsIcon,
  Login as LoginIcon,
  Logout as LogoutIcon,
  ExpandMore as ExpandIcon,
  ExpandLess as CollapseIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  Description as DocumentIcon,
  Email as EmailIcon,
  Block as BlockIcon,
  CheckCircle as ApproveIcon,
  Warning as WarningIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { format, formatDistanceToNow, isToday, isYesterday, isThisWeek } from 'date-fns';

/**
 * Activity type configurations
 */
const ACTIVITY_TYPES = {
  user_created: {
    icon: UserAddIcon,
    color: 'success',
    label: 'User Created'
  },
  user_updated: {
    icon: EditIcon,
    color: 'info',
    label: 'User Updated'
  },
  user_deleted: {
    icon: DeleteIcon,
    color: 'error',
    label: 'User Deleted'
  },
  login: {
    icon: LoginIcon,
    color: 'primary',
    label: 'Login'
  },
  logout: {
    icon: LogoutIcon,
    color: 'default',
    label: 'Logout'
  },
  security_alert: {
    icon: SecurityIcon,
    color: 'warning',
    label: 'Security Alert'
  },
  payment_received: {
    icon: PaymentIcon,
    color: 'success',
    label: 'Payment Received'
  },
  settings_changed: {
    icon: SettingsIcon,
    color: 'info',
    label: 'Settings Changed'
  },
  document_uploaded: {
    icon: DocumentIcon,
    color: 'primary',
    label: 'Document Uploaded'
  },
  email_sent: {
    icon: EmailIcon,
    color: 'info',
    label: 'Email Sent'
  },
  user_blocked: {
    icon: BlockIcon,
    color: 'error',
    label: 'User Blocked'
  },
  request_approved: {
    icon: ApproveIcon,
    color: 'success',
    label: 'Request Approved'
  },
  warning_issued: {
    icon: WarningIcon,
    color: 'warning',
    label: 'Warning Issued'
  },
  info: {
    icon: InfoIcon,
    color: 'default',
    label: 'Info'
  }
};

/**
 * ActivityTimeline - Visual timeline of admin activities
 * 
 * Features:
 * - Chronological activity display
 * - Grouped by date
 * - Expandable activity details
 * - Activity type filtering
 * - Relative time display
 */
const ActivityTimeline = memo(({
  activities = [],
  loading = false,
  onRefresh,
  onLoadMore,
  hasMore = false,
  showFilters = true,
  maxItems
}) => {
  const { t } = useTranslation();
  const theme = useTheme();

  // State
  const [expandedItems, setExpandedItems] = useState({});
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);

  // Filter activities
  const filteredActivities = useMemo(() => {
    let result = activities;
    
    if (selectedTypes.length > 0) {
      result = result.filter(a => selectedTypes.includes(a.type));
    }
    
    if (maxItems) {
      result = result.slice(0, maxItems);
    }
    
    return result;
  }, [activities, selectedTypes, maxItems]);

  // Group activities by date
  const groupedActivities = useMemo(() => {
    const groups = {};
    
    filteredActivities.forEach(activity => {
      const date = new Date(activity.timestamp);
      let groupKey;
      
      if (isToday(date)) {
        groupKey = 'Today';
      } else if (isYesterday(date)) {
        groupKey = 'Yesterday';
      } else if (isThisWeek(date)) {
        groupKey = format(date, 'EEEE');
      } else {
        groupKey = format(date, 'MMMM d, yyyy');
      }
      
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(activity);
    });
    
    return groups;
  }, [filteredActivities]);

  // Toggle item expansion
  const toggleExpand = (activityId) => {
    setExpandedItems(prev => ({
      ...prev,
      [activityId]: !prev[activityId]
    }));
  };

  // Toggle type filter
  const toggleTypeFilter = (type) => {
    setSelectedTypes(prev => 
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  // Get activity type config
  const getActivityConfig = (type) => {
    return ACTIVITY_TYPES[type] || ACTIVITY_TYPES.info;
  };

  // Render activity item
  const renderActivityItem = (activity, isLast) => {
    const config = getActivityConfig(activity.type);
    const Icon = config.icon;
    const isExpanded = expandedItems[activity.id];

    return (
      <TimelineItem key={activity.id}>
        <TimelineOppositeContent
          sx={{ 
            flex: 0.2, 
            minWidth: 100,
            color: 'text.secondary'
          }}
        >
          <Typography variant="caption">
            {format(new Date(activity.timestamp), 'HH:mm')}
          </Typography>
          <Typography variant="caption" display="block" color="text.disabled">
            {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
          </Typography>
        </TimelineOppositeContent>
        
        <TimelineSeparator>
          <TimelineDot 
            color={config.color}
            sx={{ 
              boxShadow: `0 0 0 4px ${alpha(theme.palette[config.color]?.main || theme.palette.grey[500], 0.2)}`
            }}
          >
            <Icon fontSize="small" />
          </TimelineDot>
          {!isLast && <TimelineConnector />}
        </TimelineSeparator>
        
        <TimelineContent sx={{ py: '12px', px: 2, flex: 1 }}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              bgcolor: alpha(theme.palette.background.default, 0.5),
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 2,
              cursor: activity.details ? 'pointer' : 'default',
              transition: 'all 0.2s',
              '&:hover': activity.details ? {
                bgcolor: alpha(theme.palette.primary.main, 0.04),
                borderColor: theme.palette.primary.light
              } : {}
            }}
            onClick={() => activity.details && toggleExpand(activity.id)}
          >
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="subtitle2" fontWeight="bold">
                  {activity.title || config.label}
                </Typography>
                <Chip
                  label={config.label}
                  size="small"
                  color={config.color}
                  variant="outlined"
                  sx={{ height: 20, fontSize: '0.7rem' }}
                />
              </Box>
              {activity.details && (
                <IconButton size="small">
                  {isExpanded ? <CollapseIcon /> : <ExpandIcon />}
                </IconButton>
              )}
            </Box>

            {/* Description */}
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {activity.description}
            </Typography>

            {/* User info */}
            {activity.user && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                <Avatar 
                  src={activity.user.avatar} 
                  sx={{ width: 20, height: 20, fontSize: '0.75rem' }}
                >
                  {activity.user.name?.[0]}
                </Avatar>
                <Typography variant="caption" color="text.secondary">
                  {activity.user.name || activity.user.email}
                </Typography>
              </Box>
            )}

            {/* Expandable details */}
            <Collapse in={isExpanded}>
              <Box
                sx={{
                  mt: 2,
                  pt: 2,
                  borderTop: `1px solid ${theme.palette.divider}`
                }}
              >
                {typeof activity.details === 'object' ? (
                  <Box component="pre" sx={{ 
                    m: 0, 
                    p: 1, 
                    bgcolor: 'grey.100',
                    borderRadius: 1,
                    fontSize: '0.75rem',
                    overflow: 'auto'
                  }}>
                    {JSON.stringify(activity.details, null, 2)}
                  </Box>
                ) : (
                  <Typography variant="body2">
                    {activity.details}
                  </Typography>
                )}
              </Box>
            </Collapse>

            {/* Metadata */}
            {activity.metadata && (
              <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                {Object.entries(activity.metadata).map(([key, value]) => (
                  <Chip
                    key={key}
                    label={`${key}: ${value}`}
                    size="small"
                    variant="outlined"
                    sx={{ height: 18, fontSize: '0.65rem' }}
                  />
                ))}
              </Box>
            )}
          </Paper>
        </TimelineContent>
      </TimelineItem>
    );
  };

  // Available filter types from activities
  const availableTypes = useMemo(() => {
    const types = new Set(activities.map(a => a.type));
    return Array.from(types);
  }, [activities]);

  return (
    <Card elevation={2}>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 2,
          borderBottom: `1px solid ${theme.palette.divider}`
        }}
      >
        <Typography variant="h6">
          Activity Timeline
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {showFilters && (
            <Tooltip title="Filter">
              <IconButton
                onClick={() => setShowFiltersPanel(!showFiltersPanel)}
                color={selectedTypes.length > 0 ? 'primary' : 'default'}
              >
                <FilterIcon />
              </IconButton>
            </Tooltip>
          )}
          {onRefresh && (
            <Tooltip title="Refresh">
              <IconButton onClick={onRefresh} disabled={loading}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Box>

      {/* Filters */}
      <Collapse in={showFiltersPanel}>
        <Box sx={{ p: 2, bgcolor: 'grey.50', borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
            Filter by activity type:
          </Typography>
          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
            {availableTypes.map(type => {
              const config = getActivityConfig(type);
              return (
                <Chip
                  key={type}
                  label={config.label}
                  size="small"
                  color={selectedTypes.includes(type) ? config.color : 'default'}
                  variant={selectedTypes.includes(type) ? 'filled' : 'outlined'}
                  onClick={() => toggleTypeFilter(type)}
                />
              );
            })}
            {selectedTypes.length > 0 && (
              <Button size="small" onClick={() => setSelectedTypes([])}>
                Clear
              </Button>
            )}
          </Box>
        </Box>
      </Collapse>

      <CardContent sx={{ p: 0 }}>
        {filteredActivities.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
            <InfoIcon sx={{ fontSize: 48, opacity: 0.5, mb: 2 }} />
            <Typography>No activities found</Typography>
          </Box>
        ) : (
          Object.entries(groupedActivities).map(([date, dateActivities]) => (
            <Box key={date}>
              {/* Date header */}
              <Box
                sx={{
                  py: 1,
                  px: 2,
                  bgcolor: alpha(theme.palette.primary.main, 0.05),
                  borderBottom: `1px solid ${theme.palette.divider}`
                }}
              >
                <Typography variant="overline" color="primary" fontWeight="bold">
                  {date}
                </Typography>
              </Box>

              {/* Activities */}
              <Timeline sx={{ p: 0, m: 0 }}>
                {dateActivities.map((activity, index) => 
                  renderActivityItem(activity, index === dateActivities.length - 1)
                )}
              </Timeline>
            </Box>
          ))
        )}

        {/* Load more */}
        {hasMore && (
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <Button
              onClick={onLoadMore}
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Load More'}
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  );
});

ActivityTimeline.displayName = 'ActivityTimeline';

export default ActivityTimeline;
