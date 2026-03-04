import React, { useState, useEffect, useCallback, memo, createContext, useContext } from 'react';
import {
  Box,
  Badge,
  IconButton,
  Popover,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Typography,
  Button,
  Divider,
  Chip,
  Avatar,
  Tabs,
  Tab,
  Tooltip,
  CircularProgress,
  useTheme,
  alpha,
  Slide,
  Alert
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  NotificationsActive as NotificationsActiveIcon,
  NotificationsOff as NotificationsOffIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Delete as DeleteIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  CheckCircle as SuccessIcon,
  Settings as SettingsIcon,
  Refresh as RefreshIcon,
  MarkEmailRead as MarkReadIcon,
  Security as SecurityIcon,
  Person as PersonIcon,
  Payment as PaymentIcon,
  Analytics as AnalyticsIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import adminService from '../../../services/adminService';

// Notification types and their configurations
const NOTIFICATION_TYPES = {
  info: { icon: InfoIcon, color: 'info' },
  success: { icon: SuccessIcon, color: 'success' },
  warning: { icon: WarningIcon, color: 'warning' },
  error: { icon: ErrorIcon, color: 'error' },
  security: { icon: SecurityIcon, color: 'error' },
  user: { icon: PersonIcon, color: 'primary' },
  payment: { icon: PaymentIcon, color: 'success' },
  analytics: { icon: AnalyticsIcon, color: 'info' }
};

// Notification Context
const NotificationContext = createContext(null);

/**
 * NotificationProvider - Context provider for admin notifications
 */
export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Add a new notification
  const addNotification = useCallback((notification) => {
    const newNotification = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      read: false,
      ...notification
    };
    setNotifications(prev => [newNotification, ...prev]);
    setUnreadCount(prev => prev + 1);
    return newNotification;
  }, []);

  // Mark notification as read
  const markAsRead = useCallback((notificationId) => {
    setNotifications(prev => prev.map(n => {
      if (n.id === notificationId && !n.read) {
        setUnreadCount(count => Math.max(0, count - 1));
        return { ...n, read: true };
      }
      return n;
    }));
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  }, []);

  // Delete notification
  const deleteNotification = useCallback((notificationId) => {
    setNotifications(prev => {
      const notification = prev.find(n => n.id === notificationId);
      if (notification && !notification.read) {
        setUnreadCount(count => Math.max(0, count - 1));
      }
      return prev.filter(n => n.id !== notificationId);
    });
  }, []);

  // Clear all notifications
  const clearAll = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  // Map activity-log action types to notification types
  const mapActionToType = (action) => {
    if (!action) return 'info';
    const a = action.toLowerCase();
    if (a.includes('login') || a.includes('security') || a.includes('block') || a.includes('suspicious')) return 'security';
    if (a.includes('user') || a.includes('register') || a.includes('signup')) return 'user';
    if (a.includes('payment') || a.includes('transaction') || a.includes('subscription')) return 'payment';
    if (a.includes('error') || a.includes('fail')) return 'error';
    if (a.includes('success') || a.includes('complet')) return 'success';
    if (a.includes('warn')) return 'warning';
    return 'info';
  };

  // Fetch notifications from real API (activity logs)
  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminService.getActivityLogs(1, 30, {});
      const logs = Array.isArray(data?.logs) ? data.logs : (Array.isArray(data) ? data : []);

      const mapped = logs.map((log, idx) => ({
        id: log._id || log.id || Date.now() + idx,
        type: mapActionToType(log.action || log.type),
        title: log.action || log.type || 'Activity',
        message: log.details || log.description || log.message || '',
        timestamp: log.createdAt || log.timestamp || new Date().toISOString(),
        read: false,
        priority: (log.severity === 'high' || log.severity === 'critical') ? 'high' : 'normal'
      }));

      setNotifications(mapped);
      setUnreadCount(mapped.length);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
      setError(err.message || 'Failed to load notifications');
      // Keep existing notifications on error
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const value = {
    notifications,
    unreadCount,
    loading,
    error,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    fetchNotifications
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

/**
 * useNotifications - Hook to access notification context
 */
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

/**
 * AdminNotificationCenter - Admin notification center component
 */
const AdminNotificationCenter = memo(({ maxNotifications = 50 }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    fetchNotifications
  } = useNotifications();

  const [anchorEl, setAnchorEl] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    // Handle notification action
    if (notification.action) {
      notification.action();
    }
  };

  const getRelativeTime = (timestamp) => {
    const now = new Date();
    const date = new Date(timestamp);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return t('common.justNow');
    if (diffMins < 60) return t('common.minutesAgo', { count: diffMins });
    if (diffHours < 24) return t('common.hoursAgo', { count: diffHours });
    return t('common.daysAgo', { count: diffDays });
  };

  // Filter notifications based on tab
  const filteredNotifications = activeTab === 0
    ? notifications
    : notifications.filter(n => !n.read);

  const NotificationIcon = ({ type }) => {
    const config = NOTIFICATION_TYPES[type] || NOTIFICATION_TYPES.info;
    const Icon = config.icon;
    return (
      <Avatar
        sx={{
          width: 40,
          height: 40,
          bgcolor: alpha(theme.palette[config.color].main, 0.1),
          color: theme.palette[config.color].main
        }}
      >
        <Icon fontSize="small" />
      </Avatar>
    );
  };

  return (
    <>
      {/* Notification bell button */}
      <Tooltip title={t('admin.notifications.title')}>
        <IconButton
          onClick={handleOpen}
          sx={{
            position: 'relative',
            animation: unreadCount > 0 ? 'pulse 2s infinite' : 'none',
            '@keyframes pulse': {
              '0%': { transform: 'scale(1)' },
              '50%': { transform: 'scale(1.05)' },
              '100%': { transform: 'scale(1)' }
            }
          }}
        >
          <Badge
            badgeContent={unreadCount}
            color="error"
            max={99}
          >
            {unreadCount > 0 ? (
              <NotificationsActiveIcon />
            ) : (
              <NotificationsIcon />
            )}
          </Badge>
        </IconButton>
      </Tooltip>

      {/* Notification popover */}
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: {
            width: 400,
            maxHeight: 500,
            overflow: 'hidden'
          }
        }}
      >
        {/* Header */}
        <Box
          sx={{
            p: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: `1px solid ${theme.palette.divider}`
          }}
        >
          <Typography variant="h6">
            {t('admin.notifications.title')}
          </Typography>
          <Box>
            <Tooltip title={t('common.refresh')}>
              <IconButton size="small" onClick={fetchNotifications} disabled={loading}>
                <RefreshIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            {unreadCount > 0 && (
              <Tooltip title={t('admin.notifications.markAllRead')}>
                <IconButton size="small" onClick={markAllAsRead}>
                  <MarkReadIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Box>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onChange={(e, v) => setActiveTab(v)}
          sx={{ borderBottom: `1px solid ${theme.palette.divider}` }}
        >
          <Tab label={t('admin.notifications.all')} />
          <Tab
            label={
              <Badge badgeContent={unreadCount} color="error" max={99}>
                {t('admin.notifications.unread')}
              </Badge>
            }
          />
        </Tabs>

        {/* Notifications list */}
        <Box sx={{ maxHeight: 350, overflow: 'auto' }}>
          {error && (
            <Alert severity="warning" sx={{ m: 1 }} onClose={() => {}}>
              {error}
            </Alert>
          )}
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress size={32} />
            </Box>
          ) : filteredNotifications.length === 0 ? (
            <Box sx={{ textAlign: 'center', p: 4 }}>
              <NotificationsOffIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
              <Typography variant="body2" color="text.secondary">
                {t('admin.notifications.empty')}
              </Typography>
            </Box>
          ) : (
            <List disablePadding>
              {filteredNotifications.slice(0, maxNotifications).map((notification, index) => (
                <Slide key={notification.id} direction="left" in={true} timeout={200 + index * 50}>
                  <ListItem
                    button
                    onClick={() => handleNotificationClick(notification)}
                    sx={{
                      bgcolor: notification.read ? 'transparent' : alpha(theme.palette.primary.main, 0.05),
                      '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.1) }
                    }}
                  >
                    <ListItemIcon>
                      <NotificationIcon type={notification.type} />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography
                            variant="body2"
                            fontWeight={notification.read ? 'normal' : 'bold'}
                          >
                            {notification.title}
                          </Typography>
                          {notification.priority === 'high' && (
                            <Chip label="High" size="small" color="error" />
                          )}
                        </Box>
                      }
                      secondary={
                        <>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{
                              display: 'block',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {notification.message}
                          </Typography>
                          <Typography variant="caption" color="primary">
                            {getRelativeTime(notification.timestamp)}
                          </Typography>
                        </>
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notification.id);
                        }}
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                </Slide>
              ))}
            </List>
          )}
        </Box>

        {/* Footer */}
        {notifications.length > 0 && (
          <Box
            sx={{
              p: 1,
              borderTop: `1px solid ${theme.palette.divider}`,
              display: 'flex',
              justifyContent: 'space-between'
            }}
          >
            <Button size="small" onClick={clearAll} color="error">
              {t('admin.notifications.clearAll')}
            </Button>
            <Button size="small">
              {t('admin.notifications.viewAll')}
            </Button>
          </Box>
        )}
      </Popover>
    </>
  );
});

AdminNotificationCenter.displayName = 'AdminNotificationCenter';

export default AdminNotificationCenter;
