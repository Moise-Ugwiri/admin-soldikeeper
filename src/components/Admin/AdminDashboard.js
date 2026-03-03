/* eslint-disable */
import React, { useState, useEffect, useMemo, Suspense } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
  Tabs,
  Tab,
  IconButton,
  Avatar,
  Chip,
  LinearProgress,
  Alert,
  Button,
  Menu,
  MenuItem,
  Tooltip,
  useTheme,
  useMediaQuery,
  Fade,
  Zoom,
  Skeleton,
  Badge,
  Divider,
  ListItemIcon,
  CircularProgress,
  Dialog
} from '@mui/material';
import checkAdminAuth from '../../debug/checkAdminAuth';
import {
  Dashboard as DashboardIcon,
  People as UsersIcon,
  AccountBalanceWallet as TransactionsIcon,
  Receipt as ReceiptsIcon,
  Group as GroupIcon,
  Analytics as AnalyticsIcon,
  Security as SecurityIcon,
  Settings as SettingsIcon,
  Refresh as RefreshIcon,
  Download as ExportIcon,
  GetApp,
  MoreVert as MoreIcon,
  TrendingUp,
  TrendingDown,
  Warning,
  CheckCircle,
  Error,
  Info,
  Notifications,
  MonetizationOn,
  PeopleOutline,
  ReceiptLong,
  GroupWork,
  Logout as LogoutIcon,
  AdminPanelSettings as AdminIcon,
  Speed as SpeedIcon,
  Assessment,
  Gavel,
  Business,
  SupervisorAccount,
  TrendingUp as FinancialIcon,
  Campaign as ContentIcon,
  Science as ShowcaseIcon,
  SmartToy as AIAgentIcon,
  Help as HelpIcon,
  School as TourIcon,
  MenuBook as DocsIcon,
  Email as EmailIcon,
  FiberManualRecord as DotIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

// Hooks and contexts
import { useAuth } from '../../contexts/AuthContext';
import { useAdminData } from '../../contexts/AdminContext';

// Error Boundary
import AdminErrorBoundary from '../ErrorBoundary/AdminErrorBoundary';

// Permission system
import { PermissionProvider, PermissionGate, PERMISSIONS } from './shared/PermissionGate';

// AI Agent Context Provider
import { AIAgentProvider } from '../../contexts/AIAgentContext';
import { AIAgentWidget } from './AIAgent';

// Admin onboarding and help components
import AdminOnboardingTour from './AdminOnboardingTour';
import WhatsNewNotification, { hasNewFeatures } from './WhatsNewNotification';

// Lazy load heavy admin components for better performance
const AdminOverview = React.lazy(() => import('./AdminOverview'));
const UserManagement = React.lazy(() => import('./UserManagement'));
const EnhancedUserManagement = React.lazy(() => import('./EnhancedUserManagement'));
const TransactionMonitor = React.lazy(() => import('./TransactionMonitor'));
const SystemAnalytics = React.lazy(() => import('./SystemAnalytics'));
const AdvancedAnalytics = React.lazy(() => import('./AdvancedAnalytics'));
const FinancialIntelligence = React.lazy(() => import('./FinancialIntelligence'));
const ActivityLog = React.lazy(() => import('./ActivityLog'));
const SecurityCenter = React.lazy(() => import('./SecurityCenter'));
const SystemSettings = React.lazy(() => import('./SystemSettings'));
const ComplianceAudit = React.lazy(() => import('./ComplianceAudit'));
const ContentCommunicationManagement = React.lazy(() => import('./ContentCommunicationManagement'));
const ComponentShowcase = React.lazy(() => import('./ComponentShowcase'));
const AIAgentCommandCenter = React.lazy(() => import('./AIAgent/AIAgentCommandCenter'));
const AdminDocumentation = React.lazy(() => import('./AdminDocumentation'));

// Loading fallback component
const ComponentLoader = () => (
  <Box sx={{ 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    minHeight: '400px',
    flexDirection: 'column',
    gap: 2
  }}>
    <CircularProgress size={48} />
    <Typography variant="body2" color="text.secondary">
      Loading component...
    </Typography>
  </Box>
);

const AdminDashboard = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  
  // Enhanced breakpoints for tablet optimization
  const isMobile = useMediaQuery(theme.breakpoints.down('sm')); // < 600px (phone)
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md')); // 600-900px (tablet)
  const isDesktop = useMediaQuery(theme.breakpoints.up('md')); // > 900px (desktop)
  const isLandscape = useMediaQuery('(orientation: landscape)');
  
  // Touch device detection
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  
  const { user, logout } = useAuth();
  const { 
    adminStats, 
    realtimeData, 
    loading, 
    error,
    refreshData,
    exportData 
  } = useAdminData();

  // State management
  const [activeTab, setActiveTab] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [exportMenuAnchor, setExportMenuAnchor] = useState(null);
  const [helpMenuAnchor, setHelpMenuAnchor] = useState(null);
  const [tourOpen, setTourOpen] = useState(false);
  const [whatsNewOpen, setWhatsNewOpen] = useState(false);
  const [showDocumentation, setShowDocumentation] = useState(false);
  const [hasNewFeaturesAvailable, setHasNewFeaturesAvailable] = useState(false);

  // Check admin authentication on mount
  useEffect(() => {
    checkAdminAuth();
  }, []);

  // Check for new features and auto-start tour for first-time users
  useEffect(() => {
    setHasNewFeaturesAvailable(hasNewFeatures());
    
    // Auto-start tour for first-time admins
    const tourCompleted = localStorage.getItem('admin_tour_completed');
    if (!tourCompleted) {
      // Delay tour start to let dashboard load
      const timer = setTimeout(() => {
        setTourOpen(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  // Real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      refreshData();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [refreshData]);

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      // Navigation will be handled by the AuthContext and ProtectedAdminRoute
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  };

  // Handle export
  const handleExport = async (format) => {
    try {
      await exportData('dashboard', format);
      setExportMenuAnchor(null);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  // Handle help menu
  const handleHelpMenuOpen = (event) => {
    setHelpMenuAnchor(event.currentTarget);
  };

  const handleHelpMenuClose = () => {
    setHelpMenuAnchor(null);
  };

  const handleStartTour = () => {
    setTourOpen(true);
    handleHelpMenuClose();
  };

  const handleOpenWhatsNew = () => {
    setWhatsNewOpen(true);
    handleHelpMenuClose();
  };

  const handleOpenDocumentation = () => {
    setShowDocumentation(true);
    handleHelpMenuClose();
  };

  // Tab configuration with lazy loading and error boundaries
  const tabs = [
    {
      label: t('admin.tabs.overview'),
      icon: <DashboardIcon />,
      component: (
        <AdminErrorBoundary componentName="Admin Overview" autoRetry maxRetries={3}>
          <Suspense fallback={<ComponentLoader />}>
            <AdminOverview />
          </Suspense>
        </AdminErrorBoundary>
      )
    },
    {
      label: t('admin.tabs.users'),
      icon: <UsersIcon />,
      component: (
        <AdminErrorBoundary componentName="User Management" autoRetry maxRetries={2}>
          <Suspense fallback={<ComponentLoader />}>
            <UserManagement />
          </Suspense>
        </AdminErrorBoundary>
      )
    },
    {
      label: t('admin.tabs.enhancedUsers'),
      icon: <SupervisorAccount />,
      component: (
        <AdminErrorBoundary componentName="Enhanced User Management" autoRetry maxRetries={2}>
          <Suspense fallback={<ComponentLoader />}>
            <EnhancedUserManagement />
          </Suspense>
        </AdminErrorBoundary>
      )
    },
    {
      label: t('admin.tabs.transactions'),
      icon: <TransactionsIcon />,
      component: (
        <AdminErrorBoundary componentName="Transaction Monitor" autoRetry maxRetries={2}>
          <Suspense fallback={<ComponentLoader />}>
            <TransactionMonitor />
          </Suspense>
        </AdminErrorBoundary>
      )
    },
    {
      label: t('admin.tabs.analytics'),
      icon: <AnalyticsIcon />,
      component: (
        <AdminErrorBoundary componentName="System Analytics" autoRetry maxRetries={2}>
          <Suspense fallback={<ComponentLoader />}>
            <SystemAnalytics />
          </Suspense>
        </AdminErrorBoundary>
      )
    },
    {
      label: t('admin.tabs.advancedAnalytics'),
      icon: <Assessment />,
      component: (
        <AdminErrorBoundary componentName="Advanced Analytics" autoRetry maxRetries={2}>
          <Suspense fallback={<ComponentLoader />}>
            <AdvancedAnalytics />
          </Suspense>
        </AdminErrorBoundary>
      )
    },
    {
      label: t('admin.tabs.financial'),
      icon: <FinancialIcon />,
      component: (
        <AdminErrorBoundary componentName="Financial Intelligence" autoRetry maxRetries={2}>
          <Suspense fallback={<ComponentLoader />}>
            <FinancialIntelligence />
          </Suspense>
        </AdminErrorBoundary>
      )
    },
    {
      label: t('admin.tabs.compliance'),
      icon: <Gavel />,
      component: (
        <AdminErrorBoundary componentName="Compliance Audit" autoRetry maxRetries={2}>
          <Suspense fallback={<ComponentLoader />}>
            <ComplianceAudit />
          </Suspense>
        </AdminErrorBoundary>
      )
    },
    {
      label: t('admin.tabs.content'),
      icon: <ContentIcon />,
      component: (
        <AdminErrorBoundary componentName="Content & Communication" autoRetry maxRetries={2}>
          <Suspense fallback={<ComponentLoader />}>
            <ContentCommunicationManagement />
          </Suspense>
        </AdminErrorBoundary>
      )
    },
    {
      label: t('admin.tabs.activity'),
      icon: <Notifications />,
      component: (
        <AdminErrorBoundary componentName="Activity Log" autoRetry maxRetries={2}>
          <Suspense fallback={<ComponentLoader />}>
            <ActivityLog />
          </Suspense>
        </AdminErrorBoundary>
      )
    },
    {
      label: t('admin.tabs.security'),
      icon: <SecurityIcon />,
      component: (
        <AdminErrorBoundary componentName="Security Center" autoRetry maxRetries={2}>
          <Suspense fallback={<ComponentLoader />}>
            <SecurityCenter />
          </Suspense>
        </AdminErrorBoundary>
      )
    },
    {
      label: t('admin.tabs.settings'),
      icon: <SettingsIcon />,
      component: (
        <AdminErrorBoundary componentName="System Settings" autoRetry maxRetries={2}>
          <Suspense fallback={<ComponentLoader />}>
            <SystemSettings />
          </Suspense>
        </AdminErrorBoundary>
      )
    },
    {
      label: '🧪 Showcase',
      icon: <ShowcaseIcon />,
      component: (
        <AdminErrorBoundary componentName="Component Showcase" autoRetry maxRetries={2}>
          <Suspense fallback={<ComponentLoader />}>
            <ComponentShowcase />
          </Suspense>
        </AdminErrorBoundary>
      )
    },
    {
      label: '🤖 AI Agent',
      icon: <AIAgentIcon />,
      component: (
        <AdminErrorBoundary componentName="AI Agent Command Center" autoRetry maxRetries={2}>
          <Suspense fallback={<ComponentLoader />}>
            <AIAgentCommandCenter />
          </Suspense>
        </AdminErrorBoundary>
      )
    }
  ];

  // Quick stats for header
  const quickStats = useMemo(() => [
    {
      title: t('admin.stats.totalUsers'),
      value: adminStats?.totalUsers || 0,
      change: adminStats?.userGrowth || 0,
      icon: <PeopleOutline />,
      color: theme.palette.primary.main
    },
    {
      title: t('admin.stats.totalTransactions'),
      value: adminStats?.totalTransactions || 0,
      change: adminStats?.transactionGrowth || 0,
      icon: <ReceiptLong />,
      color: theme.palette.success.main
    },
    {
      title: t('admin.stats.totalUserIncome'),
      value: `€${(adminStats?.totalUserIncome || adminStats?.totalRevenue || 0).toLocaleString()}`,
      change: 0, // Real growth would need historical comparison
      icon: <MonetizationOn />,
      color: theme.palette.warning.main,
      subtitle: t('admin.stats.notPlatformRevenue')
    },
    {
      title: t('admin.stats.activeSessions'),
      value: realtimeData?.activeSessions || 0,
      change: 0,
      icon: <GroupWork />,
      color: theme.palette.info.main
    }
  ], [adminStats, realtimeData, theme.palette, t]);

  return (
    <Box sx={{ 
      minHeight: '100vh',
      backgroundColor: theme.palette.mode === 'dark' ? '#0a0a0a' : '#f5f7fa',
      background: theme.palette.mode === 'dark' 
        ? 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)'
        : 'linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 50%, #dce3eb 100%)',
      p: isMobile ? 1 : isTablet ? 2 : 3,
      position: 'relative',
      animation: 'fadeInUp 0.6s ease-out',
      '@keyframes fadeInUp': {
        '0%': { 
          opacity: 0, 
          transform: 'translateY(20px)' 
        },
        '100%': { 
          opacity: 1, 
          transform: 'translateY(0)' 
        }
      },
      // Safe area for mobile notch and tablet edges
      paddingTop: isMobile ? 'max(env(safe-area-inset-top), 8px)' : isTablet ? 2 : 3,
      paddingBottom: isMobile ? 'max(env(safe-area-inset-bottom), 8px)' : isTablet ? 2 : 3,
      paddingLeft: isTablet && isLandscape ? 'max(env(safe-area-inset-left), 16px)' : undefined,
      paddingRight: isTablet && isLandscape ? 'max(env(safe-area-inset-right), 16px)' : undefined,
      // Touch-friendly scrolling
      WebkitOverflowScrolling: 'touch',
      touchAction: isTouchDevice ? 'pan-y' : 'auto',
    }}>
      {/* Authentication Status Alert */}
      {error && error.includes('Authentication') && (
        <Alert 
          severity="error" 
          sx={{ mb: 3, zIndex: 10 }}
          action={
            <Button color="inherit" size="small" onClick={() => window.location.href = '/login'}>
              Login as Admin
            </Button>
          }
        >
          <Typography variant="body2">
            <strong>Admin Authentication Required:</strong> {error}
            <br />
            <small>Use: superadmin@soldikeeper.com / SuperAdmin123!</small>
          </Typography>
        </Alert>
      )}

      {error && error.includes('Admin access') && (
        <Alert 
          severity="warning" 
          sx={{ mb: 3, zIndex: 10 }}
        >
          <Typography variant="body2">
            <strong>Admin Privileges Required:</strong> {error}
            <br />
            <small>Your current account does not have admin access. Please contact an administrator.</small>
          </Typography>
        </Alert>
      )}

      {/* Enhanced Header - Mobile Optimized */}
      <Fade in timeout={600}>
        <Paper
          elevation={isMobile ? 4 : 12}
          sx={{
            p: isMobile ? 2 : 3,
            mb: isMobile ? 2 : 3,
            background: theme.palette.mode === 'dark' 
              ? 'linear-gradient(135deg, rgba(30, 30, 46, 0.98) 0%, rgba(45, 45, 61, 0.98) 100%)'
              : 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.98) 100%)',
            backdropFilter: 'blur(20px)',
            borderRadius: isMobile ? 2 : 4,
            border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}`,
            position: 'relative',
            overflow: 'hidden',
            zIndex: 1,
            boxShadow: theme.palette.mode === 'dark'
              ? '0 10px 30px rgba(0,0,0,0.4)'
              : '0 10px 30px rgba(0,0,0,0.08)',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '3px',
              background: 'linear-gradient(90deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
            }
          }}
          className="admin-dashboard-header"
        >
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: isMobile ? 'flex-start' : 'center',
            mb: isMobile ? 2 : 3,
            flexDirection: isMobile ? 'column' : 'row',
            gap: isMobile ? 1.5 : 2
          }}>
            <Box sx={{ width: isMobile ? '100%' : 'auto' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                <AdminIcon sx={{ 
                  fontSize: isMobile ? 28 : 36, 
                  color: theme.palette.primary.main,
                  mr: 1.5
                }} />
                <Typography 
                  variant={isMobile ? 'h5' : 'h4'} 
                  fontWeight="bold" 
                  sx={{
                    background: theme.palette.mode === 'dark' 
                      ? 'linear-gradient(45deg, #fff 30%, #ccc 90%)'
                      : 'linear-gradient(45deg, #2c3e50 30%, #3498db 90%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    color: 'transparent'
                  }}
                >
                  {t('admin.dashboard.title')}
                </Typography>
              </Box>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: 'text.secondary',
                  mb: 1,
                  display: isMobile ? 'none' : 'block'
                }}
              >
                {t('admin.dashboard.subtitle')}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                <Chip 
                  icon={<CheckCircle sx={{ fontSize: isMobile ? 14 : 16 }} />} 
                  label={isMobile ? user?.name?.split(' ')[0] || 'Admin' : `Welcome, ${user?.name || 'Admin'}`}
                  color="success"
                  variant="outlined"
                  size="small"
                  sx={{
                    fontSize: isMobile ? '0.7rem' : '0.8rem',
                    height: isMobile ? 24 : 28
                  }}
                />
                <Tooltip title="Real-time updates active - Dashboard refreshes every 30 seconds" arrow>
                  <Chip 
                    icon={<SpeedIcon sx={{ fontSize: isMobile ? 14 : 16 }} />} 
                    label={isMobile ? 'Live' : 'Live Dashboard'}
                    color="primary"
                    variant="filled"
                    size="small"
                    sx={{
                      fontSize: isMobile ? '0.7rem' : '0.8rem',
                      height: isMobile ? 24 : 28,
                      animation: 'pulse 2s infinite',
                      '@keyframes pulse': {
                        '0%, 100%': { opacity: 1 },
                        '50%': { opacity: 0.7 }
                      }
                    }}
                    data-indicator="websocket"
                  />
                </Tooltip>
              </Box>
            </Box>
            <Box sx={{ 
              display: 'flex', 
              gap: isMobile ? 1 : 2, 
              alignItems: 'center',
              width: isMobile ? '100%' : 'auto',
              justifyContent: isMobile ? 'flex-end' : 'flex-start',
              mt: isMobile ? 1 : 0
            }}>
              <Tooltip title={t('admin.actions.refresh')} arrow>
                <IconButton 
                  onClick={handleRefresh}
                  disabled={refreshing}
                  size={isMobile ? 'small' : 'medium'}
                  sx={{
                    background: `${theme.palette.primary.main}15`,
                    '&:hover': { background: `${theme.palette.primary.main}25` }
                  }}
                >
                  <RefreshIcon sx={{ 
                    fontSize: isMobile ? 20 : 24,
                    color: theme.palette.primary.main,
                    animation: refreshing ? 'spin 1s linear infinite' : 'none',
                    '@keyframes spin': {
                      '0%': { transform: 'rotate(0deg)' },
                      '100%': { transform: 'rotate(360deg)' }
                    }
                  }} />
                </IconButton>
              </Tooltip>
              <Tooltip title={t('admin.actions.export')} arrow>
                <IconButton 
                  onClick={(e) => setExportMenuAnchor(e.currentTarget)}
                  size={isMobile ? 'small' : 'medium'}
                  sx={{
                    background: `${theme.palette.success.main}15`,
                    '&:hover': { background: `${theme.palette.success.main}25` }
                  }}
                  data-action="export"
                >
                  <ExportIcon sx={{ fontSize: isMobile ? 20 : 24, color: theme.palette.success.main }} />
                </IconButton>
              </Tooltip>
              <Tooltip title={t('admin.actions.notifications')} arrow>
                <IconButton 
                  size={isMobile ? 'small' : 'medium'}
                  sx={{
                    background: `${theme.palette.warning.main}15`,
                    '&:hover': { background: `${theme.palette.warning.main}25` }
                  }}
                >
                  <Badge badgeContent={3} color="error" sx={{ '& .MuiBadge-badge': { fontSize: 10 } }}>
                    <Notifications sx={{ fontSize: isMobile ? 20 : 24, color: theme.palette.warning.main }} />
                  </Badge>
                </IconButton>
              </Tooltip>
              <Tooltip title="Help & Support" arrow>
                <IconButton 
                  onClick={handleHelpMenuOpen}
                  size={isMobile ? 'small' : 'medium'}
                  sx={{
                    background: `${theme.palette.info.main}15`,
                    '&:hover': { background: `${theme.palette.info.main}25` }
                  }}
                >
                  <Badge 
                    variant="dot" 
                    invisible={!hasNewFeaturesAvailable}
                    color="success"
                    sx={{ 
                      '& .MuiBadge-badge': { 
                        right: 6, 
                        top: 6,
                        animation: 'pulse 2s infinite'
                      }
                    }}
                  >
                    <HelpIcon sx={{ fontSize: isMobile ? 20 : 24, color: theme.palette.info.main }} />
                  </Badge>
                </IconButton>
              </Tooltip>
              <Tooltip title={t('admin.actions.logout')} arrow>
                <IconButton 
                  onClick={handleLogout}
                  size={isMobile ? 'small' : 'medium'}
                  sx={{
                    background: `${theme.palette.error.main}15`,
                    '&:hover': { background: `${theme.palette.error.main}25` }
                  }}
                >
                  <LogoutIcon sx={{ fontSize: isMobile ? 20 : 24, color: theme.palette.error.main }} />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </Paper>
      </Fade>


      {/* Export Menu */}
      <Menu
        anchorEl={exportMenuAnchor}
        open={Boolean(exportMenuAnchor)}
        onClose={() => setExportMenuAnchor(null)}
        PaperProps={{
          sx: {
            mt: 1,
            borderRadius: 2,
            boxShadow: theme.shadows[8]
          }
        }}
      >
        <MenuItem onClick={() => handleExport('pdf')}>
          <ListItemIcon><GetApp /></ListItemIcon>
          Export as PDF
        </MenuItem>
        <MenuItem onClick={() => handleExport('excel')}>
          <ListItemIcon><GetApp /></ListItemIcon>
          Export as Excel
        </MenuItem>
        <MenuItem onClick={() => handleExport('csv')}>
          <ListItemIcon><GetApp /></ListItemIcon>
          Export as CSV
        </MenuItem>
      </Menu>

      {/* Quick Stats - Mobile Optimized */}
      <Zoom in timeout={800}>
        <Grid container spacing={isMobile ? 1.5 : 3} sx={{ mb: isMobile ? 2 : 3 }} className="admin-quick-stats">
          {quickStats.map((stat, index) => (
            <Grid item xs={6} sm={6} md={3} key={index}>
              <Zoom in timeout={1000 + (index * 150)} style={{ transitionDelay: `${index * 75}ms` }}>
                <Card 
                  elevation={0}
                  sx={{ 
                    background: theme.palette.mode === 'dark' 
                      ? `linear-gradient(135deg, ${stat.color}15 0%, ${stat.color}25 100%)`
                      : `linear-gradient(135deg, ${stat.color}08 0%, ${stat.color}15 100%)`,
                    backdropFilter: 'blur(20px)',
                    border: `1px solid ${stat.color}30`,
                    borderRadius: isMobile ? 2 : 3,
                    transition: 'all 0.2s ease',
                    position: 'relative',
                    overflow: 'hidden',
                    minHeight: isMobile ? 100 : 'auto',
                    '&:active': {
                      transform: 'scale(0.98)',
                    }
                  }}
                >
                  <CardContent sx={{ p: isMobile ? 1.5 : 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: isMobile ? 1 : 2 }}>
                      <Avatar
                        sx={{
                          backgroundColor: `${stat.color}25`,
                          color: stat.color,
                          mr: isMobile ? 1 : 2,
                          width: isMobile ? 36 : 56,
                          height: isMobile ? 36 : 56,
                          boxShadow: `0 4px 12px ${stat.color}20`,
                          border: `1px solid ${stat.color}30`
                        }}
                      >
                        {React.cloneElement(stat.icon, { sx: { fontSize: isMobile ? 18 : 24 } })}
                      </Avatar>
                      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Typography 
                          variant={isMobile ? 'h6' : 'h4'} 
                          fontWeight="bold" 
                          sx={{
                            background: `linear-gradient(45deg, ${stat.color} 30%, ${stat.color}80 90%)`,
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            color: 'transparent',
                            lineHeight: 1.2
                          }}
                        >
                          {adminStats && !loading ? stat.value : (
                            <Skeleton width={isMobile ? 40 : 60} height={isMobile ? 24 : 32} />
                          )}
                        </Typography>
                        <Typography 
                          variant="caption" 
                          color="text.secondary" 
                          sx={{
                            fontWeight: 500,
                            fontSize: isMobile ? '0.65rem' : '0.85rem',
                            display: 'block',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {stat.title}
                        </Typography>
                        {stat.subtitle && (
                          <Typography 
                            variant="caption" 
                            sx={{
                              fontSize: '0.6rem',
                              color: 'warning.main',
                              display: 'block',
                              fontStyle: 'italic'
                            }}
                          >
                            {stat.subtitle}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                    {stat.change !== 0 && !isMobile && (
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        mt: 1,
                        p: 1,
                        borderRadius: 1.5,
                        background: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {stat.change > 0 ? (
                            <TrendingUp sx={{ color: 'success.main', fontSize: 18, mr: 0.5 }} />
                          ) : (
                            <TrendingDown sx={{ color: 'error.main', fontSize: 18, mr: 0.5 }} />
                          )}
                          <Typography 
                            variant="caption" 
                            color={stat.change > 0 ? 'success.main' : 'error.main'}
                            sx={{ fontWeight: 600 }}
                          >
                            {Math.abs(stat.change)}%
                          </Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          {t('admin.stats.thisMonth')}
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Zoom>
            </Grid>
          ))}
        </Grid>
      </Zoom>

      {/* Loading indicator */}
      {loading && (
        <Fade in timeout={300}>
          <Box sx={{ mb: 2 }}>
            <LinearProgress 
              sx={{ 
                borderRadius: 2,
                height: 6,
                background: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 2,
                  background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)'
                }
              }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <SpeedIcon sx={{ fontSize: 16, animation: 'pulse 1.5s infinite' }} />
                Loading dashboard data...
              </Typography>
            </Box>
          </Box>
        </Fade>
      )}

      {/* Error display */}
      {error && (
        <Fade in timeout={300}>
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'error.main',
              '& .MuiAlert-icon': {
                fontSize: 24
              }
            }}
            action={
              <IconButton
                color="inherit"
                size="small"
                onClick={() => window.location.reload()}
              >
                <RefreshIcon />
              </IconButton>
            }
          >
            <Typography variant="body2" fontWeight={500}>
              {error}
            </Typography>
          </Alert>
        </Fade>
      )}

      {/* Main Content - Mobile Optimized */}
      <Fade in timeout={1200}>
        <Paper
          elevation={isMobile ? 2 : 3}
          sx={{
            borderRadius: isMobile ? 2 : 3,
            overflow: 'hidden',
            background: theme.palette.mode === 'dark' 
              ? 'linear-gradient(135deg, #1e1e2e 0%, #2d2d3d 100%)'
              : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}`,
            boxShadow: theme.palette.mode === 'dark' 
              ? '0 10px 30px rgba(0,0,0,0.3)'
              : '0 10px 30px rgba(0,0,0,0.08)'
          }}
        >
          {/* Mobile-Optimized Tabs */}
          <Box sx={{ 
            borderBottom: 1, 
            borderColor: 'divider',
            background: theme.palette.mode === 'dark' 
              ? 'rgba(255,255,255,0.02)' 
              : 'rgba(0,0,0,0.02)',
            position: 'sticky',
            top: 0,
            zIndex: 10
          }}
          data-tour="admin-tabs"
          >
            <Tabs
              value={activeTab}
              onChange={(e, newValue) => setActiveTab(newValue)}
              variant="scrollable"
              scrollButtons={isMobile ? 'auto' : false}
              allowScrollButtonsMobile
              sx={{
                '& .MuiTabs-scrollButtons': {
                  width: isMobile ? 32 : 40,
                  '&.Mui-disabled': {
                    opacity: 0.3,
                  },
                },
                '& .MuiTab-root': {
                  // Enhanced tap targets for touch devices (Material Design guideline: 48x48px minimum)
                  minHeight: isMobile ? 64 : isTablet ? 68 : 72,
                  minWidth: isMobile ? 72 : isTablet ? 100 : 120,
                  textTransform: 'none',
                  fontSize: isMobile ? '0.75rem' : isTablet ? '0.85rem' : '0.9rem',
                  fontWeight: 600,
                  px: isMobile ? 1.5 : isTablet ? 2 : 2.5,
                  transition: 'all 0.2s ease',
                  // Touch feedback
                  '&:active': {
                    transform: isTouchDevice ? 'scale(0.97)' : 'none',
                    transition: 'transform 0.1s ease'
                  },
                  '&.Mui-selected': {
                    background: theme.palette.mode === 'dark' 
                      ? 'linear-gradient(135deg, rgba(103, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%)'
                      : 'linear-gradient(135deg, rgba(103, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.08) 100%)',
                    color: theme.palette.primary.main,
                  }
                },
                '& .MuiTabs-indicator': {
                  height: 3,
                  borderRadius: '3px 3px 0 0',
                  background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)'
                }
              }}
            >
              {tabs.map((tab, index) => (
                <Tab
                  key={index}
                  icon={React.cloneElement(tab.icon, { 
                    sx: { 
                      fontSize: isMobile ? 22 : isTablet ? 24 : 26 
                    } 
                  })}
                  label={isMobile ? undefined : tab.label}
                  iconPosition="start"
                  sx={{
                    '& .MuiSvgIcon-root': {
                      mr: isMobile ? 0 : 1,
                    }
                  }}
                  aria-label={tab.label}
                  data-tab={
                    index === 1 ? 'users' : 
                    index === 3 ? 'transactions' : 
                    index === 4 ? 'analytics' : 
                    index === 8 ? 'security' :
                    index === 9 ? 'settings' : 
                    undefined
                  }
                />
              ))}
            </Tabs>
          </Box>

          {/* Tab Content */}
          <Box sx={{ p: isMobile ? 1.5 : 3 }}>
            <Fade in key={activeTab} timeout={400}>
              <Box>
                {tabs[activeTab]?.component}
              </Box>
            </Fade>
          </Box>
        </Paper>
      </Fade>

      {/* Enhanced Export Menu */}
      <Menu
        anchorEl={exportMenuAnchor}
        open={Boolean(exportMenuAnchor)}
        onClose={() => setExportMenuAnchor(null)}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: `0 25px 50px -12px rgba(0, 0, 0, 0.25)`,
            border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}`,
            background: theme.palette.mode === 'dark' 
              ? 'linear-gradient(135deg, rgba(30, 30, 46, 0.95) 0%, rgba(45, 45, 61, 0.95) 100%)'
              : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)',
            backdropFilter: 'blur(20px)',
            minWidth: 200,
            overflow: 'hidden'
          }
        }}
      >
        <Box sx={{ p: 1 }}>
          <Typography 
            variant="caption" 
            sx={{ 
              px: 2, 
              py: 1, 
              display: 'block',
              color: 'text.secondary',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: 1
            }}
          >
            Export Options
          </Typography>
          <MenuItem 
            onClick={() => handleExport('csv')} 
            sx={{ 
              borderRadius: 2, 
              mx: 1, 
              my: 0.5,
              minHeight: 48,
              transition: 'all 0.2s ease-in-out',
              '&:hover': { 
                background: `linear-gradient(135deg, ${theme.palette.primary.main}15, ${theme.palette.primary.main}25)`,
                transform: 'translateX(4px)',
                boxShadow: `0 4px 12px ${theme.palette.primary.main}20`
              }
            }}
          >
            <ListItemIcon>
              <GetApp sx={{ 
                color: theme.palette.primary.main,
                transition: 'transform 0.2s ease-in-out'
              }} />
            </ListItemIcon>
            <Box>
              <Typography variant="body2" fontWeight={600}>CSV File</Typography>
              <Typography variant="caption" color="text.secondary">Spreadsheet data</Typography>
            </Box>
          </MenuItem>
          <MenuItem 
            onClick={() => handleExport('excel')} 
            sx={{ 
              borderRadius: 2, 
              mx: 1, 
              my: 0.5,
              minHeight: 48,
              transition: 'all 0.2s ease-in-out',
              '&:hover': { 
                background: `linear-gradient(135deg, ${theme.palette.success.main}15, ${theme.palette.success.main}25)`,
                transform: 'translateX(4px)',
                boxShadow: `0 4px 12px ${theme.palette.success.main}20`
              }
            }}
          >
            <ListItemIcon>
              <GetApp sx={{ 
                color: theme.palette.success.main,
                transition: 'transform 0.2s ease-in-out'
              }} />
            </ListItemIcon>
            <Box>
              <Typography variant="body2" fontWeight={600}>Excel File</Typography>
              <Typography variant="caption" color="text.secondary">Advanced formatting</Typography>
            </Box>
          </MenuItem>
          <MenuItem 
            onClick={() => handleExport('pdf')} 
            sx={{ 
              borderRadius: 2, 
              mx: 1, 
              my: 0.5,
              minHeight: 48,
              transition: 'all 0.2s ease-in-out',
              '&:hover': { 
                background: `linear-gradient(135deg, ${theme.palette.error.main}15, ${theme.palette.error.main}25)`,
                transform: 'translateX(4px)',
                boxShadow: `0 4px 12px ${theme.palette.error.main}20`
              }
            }}
          >
            <ListItemIcon>
              <GetApp sx={{ 
                color: theme.palette.error.main,
                transition: 'transform 0.2s ease-in-out'
              }} />
            </ListItemIcon>
            <Box>
              <Typography variant="body2" fontWeight={600}>PDF Report</Typography>
              <Typography variant="caption" color="text.secondary">Print-ready format</Typography>
            </Box>
          </MenuItem>
        </Box>
      </Menu>

      {/* Help Menu */}
      <Menu
        anchorEl={helpMenuAnchor}
        open={Boolean(helpMenuAnchor)}
        onClose={handleHelpMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: `0 25px 50px -12px rgba(0, 0, 0, 0.25)`,
            border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}`,
            background: theme.palette.mode === 'dark' 
              ? 'linear-gradient(135deg, rgba(30, 30, 46, 0.95) 0%, rgba(45, 45, 61, 0.95) 100%)'
              : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)',
            backdropFilter: 'blur(20px)',
            minWidth: 240,
            overflow: 'hidden'
          }
        }}
      >
        <Box sx={{ p: 1 }}>
          <Typography 
            variant="caption" 
            sx={{ 
              px: 2, 
              py: 1, 
              display: 'block',
              color: 'text.secondary',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: 1
            }}
          >
            Help & Support
          </Typography>
          <MenuItem 
            onClick={handleStartTour} 
            sx={{ 
              borderRadius: 2, 
              mx: 1, 
              my: 0.5,
              minHeight: 48,
              transition: 'all 0.2s ease-in-out',
              '&:hover': { 
                background: `linear-gradient(135deg, ${theme.palette.primary.main}15, ${theme.palette.primary.main}25)`,
                transform: 'translateX(4px)',
                boxShadow: `0 4px 12px ${theme.palette.primary.main}20`
              }
            }}
          >
            <ListItemIcon>
              <TourIcon sx={{ color: theme.palette.primary.main }} />
            </ListItemIcon>
            <Box>
              <Typography variant="body2" fontWeight={600}>Start Tour</Typography>
              <Typography variant="caption" color="text.secondary">Interactive walkthrough</Typography>
            </Box>
          </MenuItem>
          <MenuItem 
            onClick={handleOpenWhatsNew} 
            sx={{ 
              borderRadius: 2, 
              mx: 1, 
              my: 0.5,
              minHeight: 48,
              transition: 'all 0.2s ease-in-out',
              '&:hover': { 
                background: `linear-gradient(135deg, ${theme.palette.success.main}15, ${theme.palette.success.main}25)`,
                transform: 'translateX(4px)',
                boxShadow: `0 4px 12px ${theme.palette.success.main}20`
              }
            }}
          >
            <ListItemIcon>
              <Badge 
                variant="dot" 
                invisible={!hasNewFeaturesAvailable}
                color="success"
              >
                <Info sx={{ color: theme.palette.success.main }} />
              </Badge>
            </ListItemIcon>
            <Box>
              <Typography variant="body2" fontWeight={600}>
                What's New
                {hasNewFeaturesAvailable && (
                  <Chip 
                    label="NEW" 
                    size="small" 
                    color="success" 
                    sx={{ ml: 1, height: 18, fontSize: '0.65rem' }}
                  />
                )}
              </Typography>
              <Typography variant="caption" color="text.secondary">Latest features</Typography>
            </Box>
          </MenuItem>
          <MenuItem 
            onClick={handleOpenDocumentation} 
            sx={{ 
              borderRadius: 2, 
              mx: 1, 
              my: 0.5,
              minHeight: 48,
              transition: 'all 0.2s ease-in-out',
              '&:hover': { 
                background: `linear-gradient(135deg, ${theme.palette.info.main}15, ${theme.palette.info.main}25)`,
                transform: 'translateX(4px)',
                boxShadow: `0 4px 12px ${theme.palette.info.main}20`
              }
            }}
          >
            <ListItemIcon>
              <DocsIcon sx={{ color: theme.palette.info.main }} />
            </ListItemIcon>
            <Box>
              <Typography variant="body2" fontWeight={600}>Documentation</Typography>
              <Typography variant="caption" color="text.secondary">Complete guide</Typography>
            </Box>
          </MenuItem>
          <Divider sx={{ my: 1 }} />
          <MenuItem 
            onClick={() => window.location.href = 'mailto:admin-support@soldikeeper.com'}
            sx={{ 
              borderRadius: 2, 
              mx: 1, 
              my: 0.5,
              minHeight: 48,
              transition: 'all 0.2s ease-in-out',
              '&:hover': { 
                background: `linear-gradient(135deg, ${theme.palette.warning.main}15, ${theme.palette.warning.main}25)`,
                transform: 'translateX(4px)',
                boxShadow: `0 4px 12px ${theme.palette.warning.main}20`
              }
            }}
          >
            <ListItemIcon>
              <EmailIcon sx={{ color: theme.palette.warning.main }} />
            </ListItemIcon>
            <Box>
              <Typography variant="body2" fontWeight={600}>Contact Support</Typography>
              <Typography variant="caption" color="text.secondary">admin-support@soldikeeper.com</Typography>
            </Box>
          </MenuItem>
        </Box>
      </Menu>

      {/* Admin Onboarding Tour */}
      <AdminOnboardingTour 
        open={tourOpen} 
        onClose={() => setTourOpen(false)} 
      />

      {/* What's New Notification */}
      <WhatsNewNotification 
        open={whatsNewOpen}
        onClose={() => {
          setWhatsNewOpen(false);
          setHasNewFeaturesAvailable(false);
        }}
      />

      {/* Documentation Dialog */}
      {showDocumentation && (
        <Dialog
          open={showDocumentation}
          onClose={() => setShowDocumentation(false)}
          maxWidth="lg"
          fullWidth
          fullScreen={isMobile}
          PaperProps={{
            sx: {
              borderRadius: isMobile ? 0 : 3,
              minHeight: '80vh',
            }
          }}
        >
          <Suspense fallback={<ComponentLoader />}>
            <AdminDocumentation onBack={() => setShowDocumentation(false)} />
          </Suspense>
        </Dialog>
      )}

      {/* AI Agent Widget - Floating */}
      <AIAgentWidget />
    </Box>
  );
};

// Wrap with PermissionProvider and AIAgentProvider
const AdminDashboardWithPermissions = () => (
  <PermissionProvider>
    <AIAgentProvider>
      <AdminDashboard />
    </AIAgentProvider>
  </PermissionProvider>
);

export default AdminDashboardWithPermissions;
