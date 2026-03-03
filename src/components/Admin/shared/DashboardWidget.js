/* eslint-disable */
import React, { useState, useCallback, memo } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Menu,
  MenuItem,
  Box,
  Typography,
  Skeleton,
  Collapse,
  Tooltip,
  Divider,
  useTheme,
  alpha
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Refresh as RefreshIcon,
  Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  DragIndicator as DragIndicatorIcon,
  Settings as SettingsIcon,
  Download as DownloadIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

/**
 * DashboardWidget - A customizable, draggable widget component for admin dashboards
 * 
 * Features:
 * - Collapsible content
 * - Fullscreen mode
 * - Refresh functionality
 * - Menu actions
 * - Loading state
 * - Error state with retry
 * - Drag handle for reordering
 */
const DashboardWidget = memo(({
  id,
  title,
  subtitle,
  icon,
  children,
  loading = false,
  error = null,
  onRefresh,
  onExport,
  onSettings,
  onRemove,
  onFullscreen,
  draggable = false,
  collapsible = true,
  defaultCollapsed = false,
  headerActions,
  menuItems = [],
  minHeight = 200,
  maxHeight,
  elevation = 2,
  variant = 'elevation', // 'elevation' | 'outlined'
  sx = {}
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  
  // State
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const [fullscreen, setFullscreen] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Handlers
  const handleMenuOpen = useCallback((event) => {
    setMenuAnchor(event.currentTarget);
  }, []);

  const handleMenuClose = useCallback(() => {
    setMenuAnchor(null);
  }, []);

  const handleToggleCollapse = useCallback(() => {
    setCollapsed(prev => !prev);
  }, []);

  const handleToggleFullscreen = useCallback(() => {
    setFullscreen(prev => !prev);
    if (onFullscreen) {
      onFullscreen(!fullscreen);
    }
  }, [fullscreen, onFullscreen]);

  const handleRefresh = useCallback(async () => {
    if (onRefresh && !refreshing) {
      setRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setRefreshing(false);
      }
    }
  }, [onRefresh, refreshing]);

  const handleExport = useCallback(() => {
    handleMenuClose();
    if (onExport) {
      onExport();
    }
  }, [onExport]);

  const handleSettings = useCallback(() => {
    handleMenuClose();
    if (onSettings) {
      onSettings();
    }
  }, [onSettings]);

  const handleRemove = useCallback(() => {
    handleMenuClose();
    if (onRemove) {
      onRemove(id);
    }
  }, [id, onRemove]);

  // Build menu items
  const allMenuItems = [
    ...(onRefresh ? [{
      label: t('common.refresh'),
      icon: <RefreshIcon fontSize="small" />,
      onClick: handleRefresh,
      disabled: refreshing
    }] : []),
    ...(onExport ? [{
      label: t('common.export'),
      icon: <DownloadIcon fontSize="small" />,
      onClick: handleExport
    }] : []),
    ...(onSettings ? [{
      label: t('common.settings'),
      icon: <SettingsIcon fontSize="small" />,
      onClick: handleSettings
    }] : []),
    ...menuItems,
    ...(onRemove ? [{
      label: t('common.remove'),
      icon: <CloseIcon fontSize="small" />,
      onClick: handleRemove,
      divider: true,
      color: 'error'
    }] : [])
  ];

  // Fullscreen styles
  const fullscreenStyles = fullscreen ? {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: theme.zIndex.modal,
    borderRadius: 0,
    margin: 0,
    maxHeight: '100vh',
    overflow: 'auto'
  } : {};

  return (
    <>
      {/* Fullscreen overlay */}
      {fullscreen && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: 'rgba(0,0,0,0.5)',
            zIndex: theme.zIndex.modal - 1
          }}
          onClick={handleToggleFullscreen}
        />
      )}

      <Card
        elevation={variant === 'elevation' ? elevation : 0}
        variant={variant}
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          transition: 'all 0.3s ease',
          ...fullscreenStyles,
          '&:hover': {
            boxShadow: variant === 'elevation' ? theme.shadows[elevation + 2] : undefined
          },
          ...sx
        }}
      >
        {/* Header */}
        <CardHeader
          sx={{
            pb: collapsed ? 2 : 1,
            '& .MuiCardHeader-content': { overflow: 'hidden' },
            '& .MuiCardHeader-action': { alignSelf: 'center', mt: 0 },
            bgcolor: alpha(theme.palette.primary.main, 0.02),
            borderBottom: collapsed ? 'none' : `1px solid ${theme.palette.divider}`
          }}
          avatar={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {draggable && (
                <Tooltip title={t('common.dragToReorder')}>
                  <DragIndicatorIcon
                    sx={{
                      cursor: 'grab',
                      color: 'text.secondary',
                      '&:active': { cursor: 'grabbing' }
                    }}
                  />
                </Tooltip>
              )}
              {icon && (
                <Box
                  sx={{
                    p: 1,
                    borderRadius: 1,
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    color: theme.palette.primary.main,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {icon}
                </Box>
              )}
            </Box>
          }
          title={
            <Typography variant="subtitle1" fontWeight="bold" noWrap>
              {title}
            </Typography>
          }
          subheader={subtitle && (
            <Typography variant="caption" color="text.secondary" noWrap>
              {subtitle}
            </Typography>
          )}
          action={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              {/* Custom header actions */}
              {headerActions}

              {/* Refresh button */}
              {onRefresh && (
                <Tooltip title={t('common.refresh')}>
                  <IconButton
                    size="small"
                    onClick={handleRefresh}
                    disabled={refreshing || loading}
                  >
                    <RefreshIcon
                      fontSize="small"
                      sx={{
                        animation: refreshing ? 'spin 1s linear infinite' : 'none',
                        '@keyframes spin': {
                          '0%': { transform: 'rotate(0deg)' },
                          '100%': { transform: 'rotate(360deg)' }
                        }
                      }}
                    />
                  </IconButton>
                </Tooltip>
              )}

              {/* Fullscreen toggle */}
              <Tooltip title={fullscreen ? t('common.exitFullscreen') : t('common.fullscreen')}>
                <IconButton size="small" onClick={handleToggleFullscreen}>
                  {fullscreen ? (
                    <FullscreenExitIcon fontSize="small" />
                  ) : (
                    <FullscreenIcon fontSize="small" />
                  )}
                </IconButton>
              </Tooltip>

              {/* Collapse toggle */}
              {collapsible && (
                <Tooltip title={collapsed ? t('common.expand') : t('common.collapse')}>
                  <IconButton size="small" onClick={handleToggleCollapse}>
                    {collapsed ? (
                      <ExpandMoreIcon fontSize="small" />
                    ) : (
                      <ExpandLessIcon fontSize="small" />
                    )}
                  </IconButton>
                </Tooltip>
              )}

              {/* Menu */}
              {allMenuItems.length > 0 && (
                <>
                  <IconButton size="small" onClick={handleMenuOpen}>
                    <MoreVertIcon fontSize="small" />
                  </IconButton>
                  <Menu
                    anchorEl={menuAnchor}
                    open={Boolean(menuAnchor)}
                    onClose={handleMenuClose}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                  >
                    {allMenuItems.map((item, index) => (
                      <React.Fragment key={index}>
                        {item.divider && <Divider />}
                        <MenuItem
                          onClick={item.onClick}
                          disabled={item.disabled}
                          sx={item.color ? { color: `${item.color}.main` } : {}}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {item.icon}
                            <Typography variant="body2">{item.label}</Typography>
                          </Box>
                        </MenuItem>
                      </React.Fragment>
                    ))}
                  </Menu>
                </>
              )}
            </Box>
          }
        />

        {/* Content */}
        <Collapse in={!collapsed} timeout="auto">
          <CardContent
            sx={{
              flex: 1,
              minHeight: minHeight,
              maxHeight: fullscreen ? 'calc(100vh - 80px)' : maxHeight,
              overflow: 'auto',
              p: 2,
              '&:last-child': { pb: 2 }
            }}
          >
            {loading ? (
              <Box>
                <Skeleton variant="rectangular" height={60} sx={{ mb: 2, borderRadius: 1 }} />
                <Skeleton variant="rectangular" height={100} sx={{ mb: 2, borderRadius: 1 }} />
                <Skeleton variant="rectangular" height={40} sx={{ borderRadius: 1 }} />
              </Box>
            ) : error ? (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: minHeight,
                  color: 'error.main',
                  textAlign: 'center',
                  p: 3
                }}
              >
                <Typography variant="h6" color="error" gutterBottom>
                  {t('common.error')}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {error}
                </Typography>
                {onRefresh && (
                  <IconButton
                    color="primary"
                    onClick={handleRefresh}
                    disabled={refreshing}
                  >
                    <RefreshIcon />
                  </IconButton>
                )}
              </Box>
            ) : (
              children
            )}
          </CardContent>
        </Collapse>
      </Card>
    </>
  );
});

DashboardWidget.displayName = 'DashboardWidget';

export default DashboardWidget;
