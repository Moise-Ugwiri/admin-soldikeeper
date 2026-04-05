/* eslint-disable */
import React, { useState, useEffect, useMemo, Suspense, useCallback } from 'react';
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
  ListItemText,
  CircularProgress,
  Dialog,
  Drawer,
  List,
  ListItem,
  ListItemButton
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
  FiberManualRecord as DotIcon,
  AttachMoney as CostIcon,
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  Shield as ShieldIcon,
  BarChart as BarChartIcon,
  Chat as ChatIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

// Hooks and contexts
import { useAuth } from '../../contexts/AuthContext';
import { useAdminData } from '../../contexts/AdminContext';
import { useThemeMode } from '../../contexts/ThemeContext';

// Error Boundary
import AdminErrorBoundary from '../ErrorBoundary/AdminErrorBoundary';

// Permission system
import { PermissionProvider, PermissionGate, PERMISSIONS } from './shared/PermissionGate';

// AI Agent Context Provider
import { AIAgentProvider } from '../../contexts/AIAgentContext';

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
const CostManagement = React.lazy(() => import('./CostManagement'));
const LLMManagement = React.lazy(() => import('./LLMManagement'));


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

const SIDEBAR_WIDTH = 240;
const SIDEBAR_COLLAPSED_WIDTH = 64;

const AdminDashboard = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { mode, toggleTheme } = useThemeMode();
  
  // Enhanced breakpoints for tablet optimization
  const isMobile = useMediaQuery(theme.breakpoints.down('sm')); // < 600px (phone)
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md')); // 600-900px (tablet)
  const isDesktop = useMediaQuery(theme.breakpoints.up('md')); // > 900px (desktop)
  const isLargeDesktop = useMediaQuery(theme.breakpoints.up('lg')); // > 1200px (wide desktop)
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
    exportData,
    securityAlerts
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
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Security alert count for badge
  const securityAlertCount = useMemo(() => {
    if (Array.isArray(securityAlerts)) return securityAlerts.length;
    return 0;
  }, [securityAlerts]);

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

  // Tab configuration with lazy loading, error boundaries, and group sections
  // Groups: Core, Intelligence, Operations, Management
  const tabSections = useMemo(() => [
    {
      group: 'Core',
      tabs: [
        {
          label: t('admin.tabs.overview'),
          shortLabel: 'Overview',
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
          shortLabel: 'Users',
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
          shortLabel: 'Users+',
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
          shortLabel: 'Transactions',
          icon: <ReceiptsIcon />,
          component: (
            <AdminErrorBoundary componentName="Transaction Monitor" autoRetry maxRetries={2}>
              <Suspense fallback={<ComponentLoader />}>
                <TransactionMonitor />
              </Suspense>
            </AdminErrorBoundary>
          )
        },
      ]
    },
    {
      group: 'Intelligence',
      tabs: [
        {
          label: t('admin.tabs.analytics'),
          shortLabel: 'Analytics',
          icon: <BarChartIcon />,
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
          shortLabel: 'Advanced',
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
          shortLabel: 'Financial',
          icon: <TransactionsIcon />,
          component: (
            <AdminErrorBoundary componentName="Financial Intelligence" autoRetry maxRetries={2}>
              <Suspense fallback={<ComponentLoader />}>
                <FinancialIntelligence />
              </Suspense>
            </AdminErrorBoundary>
          )
        },
        {
          label: 'AI Agent',
          shortLabel: 'AI',
          icon: <AIAgentIcon />,
          component: (
            <AdminErrorBoundary componentName="AI Agent Command Center" autoRetry maxRetries={2}>
              <Suspense fallback={<ComponentLoader />}>
                <AIAgentCommandCenter />
              </Suspense>
            </AdminErrorBoundary>
          )
        },
        {
          label: 'LLM Control',
          shortLabel: 'LLM',
          icon: <AIAgentIcon />,
          component: (
            <AdminErrorBoundary componentName="LLM Management" autoRetry maxRetries={2}>
              <Suspense fallback={<ComponentLoader />}>
                <LLMManagement />
              </Suspense>
            </AdminErrorBoundary>
          )
        },
      ]
    },
    {
      group: 'Operations',
      tabs: [
        {
          label: t('admin.tabs.security'),
          shortLabel: 'Security',
          icon: <ShieldIcon />,
          badgeCount: securityAlertCount,
          component: (
            <AdminErrorBoundary componentName="Security Center" autoRetry maxRetries={2}>
              <Suspense fallback={<ComponentLoader />}>
                <SecurityCenter />
              </Suspense>
            </AdminErrorBoundary>
          )
        },
        {
          label: t('admin.tabs.compliance'),
          shortLabel: 'Compliance',
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
          label: t('admin.tabs.activity'),
          shortLabel: 'Activity',
          icon: <Notifications />,
          component: (
            <AdminErrorBoundary componentName="Activity Log" autoRetry maxRetries={2}>
              <Suspense fallback={<ComponentLoader />}>
                <ActivityLog />
              </Suspense>
            </AdminErrorBoundary>
          )
        },
      ]
    },
    {
      group: 'Management',
      tabs: [
        {
          label: t('admin.tabs.content'),
          shortLabel: 'Comms',
          icon: <ChatIcon />,
          component: (
            <AdminErrorBoundary componentName="Content & Communication" autoRetry maxRetries={2}>
              <Suspense fallback={<ComponentLoader />}>
                <ContentCommunicationManagement />
              </Suspense>
            </AdminErrorBoundary>
          )
        },
        {
          label: t('admin.tabs.settings'),
          shortLabel: 'Settings',
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
          label: 'Cost Mgmt',
          shortLabel: 'Cost',
          icon: <CostIcon />,
          component: (
            <AdminErrorBoundary componentName="Cost Management" autoRetry maxRetries={2}>
              <Suspense fallback={<ComponentLoader />}>
                <CostManagement />
              </Suspense>
            </AdminErrorBoundary>
          )
        },
        {
          label: 'Showcase',
          shortLabel: 'Showcase',
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
          label: 'Documentation',
          shortLabel: 'Docs',
          icon: <DocsIcon />,
          component: (
            <AdminErrorBoundary componentName="Documentation" autoRetry maxRetries={2}>
              <Suspense fallback={<ComponentLoader />}>
                <AdminDocumentation />
              </Suspense>
            </AdminErrorBoundary>
          )
        },
      ]
    }
  ], [t, securityAlertCount]);

  // Flat list of all tabs for index-based access
  const tabs = useMemo(() => tabSections.flatMap(s => s.tabs), [tabSections]);

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

  // Sidebar content renderer (used in both permanent and mobile drawer)
  const renderSidebarContent = useCallback(() => {
    let flatIndex = 0;
    return (
      <Box sx={{ 
        width: SIDEBAR_WIDTH, 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        background: theme.palette.mode === 'dark'
          ? 'linear-gradient(180deg, #1e1e2e 0%, #12121e 100%)'
          : 'linear-gradient(180deg, #ffffff 0%, #f1f5f9 100%)',
      }}>
        {/* Sidebar header */}
        <Box sx={{ 
          p: 2, 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1.5,
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}>
          <AdminIcon sx={{ color: theme.palette.primary.main, fontSize: 28 }} />
          <Typography variant="subtitle1" fontWeight={700} noWrap>
            Admin Panel
          </Typography>
          {isMobile && (
            <IconButton 
              onClick={() => setMobileDrawerOpen(false)} 
              sx={{ ml: 'auto' }}
              size="small"
            >
              <ChevronLeftIcon />
            </IconButton>
          )}
        </Box>

        {/* Nav sections */}
        <Box sx={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', py: 1 }}>
          {tabSections.map((section) => {
            return (
              <Box key={section.group} sx={{ mb: 0.5 }}>
                <Typography
                  variant="overline"
                  sx={{
                    px: 2,
                    pt: 1.5,
                    pb: 0.5,
                    display: 'block',
                    color: 'text.secondary',
                    fontWeight: 700,
                    fontSize: '0.65rem',
                    letterSpacing: 1.2,
                  }}
                >
                  {section.group}
                </Typography>
                <List dense disablePadding>
                  {section.tabs.map((tab) => {
                    const thisIndex = flatIndex++;
                    const isActive = activeTab === thisIndex;
                    return (
                      <ListItem key={thisIndex} disablePadding sx={{ px: 1 }}>
                        <ListItemButton
                          selected={isActive}
                          onClick={() => {
                            setActiveTab(thisIndex);
                            if (isMobile) setMobileDrawerOpen(false);
                          }}
                          sx={{
                            borderRadius: 1.5,
                            mb: 0.25,
                            minHeight: 40,
                            pl: 1.5,
                            transition: 'all 0.15s ease',
                            borderLeft: isActive 
                              ? `3px solid ${theme.palette.primary.main}` 
                              : '3px solid transparent',
                            '&.Mui-selected': {
                              backgroundColor: theme.palette.mode === 'dark'
                                ? 'rgba(103, 126, 234, 0.12)'
                                : 'rgba(25, 118, 210, 0.08)',
                              '&:hover': {
                                backgroundColor: theme.palette.mode === 'dark'
                                  ? 'rgba(103, 126, 234, 0.18)'
                                  : 'rgba(25, 118, 210, 0.12)',
                              }
                            },
                          }}
                        >
                          <ListItemIcon sx={{ 
                            minWidth: 36, 
                            color: isActive ? theme.palette.primary.main : 'text.secondary' 
                          }}>
                            {tab.badgeCount ? (
                              <Badge badgeContent={tab.badgeCount} color="error" max={99}>
                                {React.cloneElement(tab.icon, { sx: { fontSize: 20 } })}
                              </Badge>
                            ) : (
                              React.cloneElement(tab.icon, { sx: { fontSize: 20 } })
                            )}
                          </ListItemIcon>
                          <ListItemText
                            primary={isMobile ? tab.label : tab.shortLabel}
                            primaryTypographyProps={{
                              variant: 'body2',
                              fontWeight: isActive ? 600 : 400,
                              noWrap: true,
                              color: isActive ? 'primary.main' : 'text.primary',
                              fontSize: '0.82rem',
                            }}
                          />
                        </ListItemButton>
                      </ListItem>
                    );
                  })}
                </List>
                <Divider sx={{ mx: 2, my: 0.5, opacity: 0.5 }} />
              </Box>
            );
          })}
        </Box>

        {/* Sidebar footer — theme toggle + logout */}
        <Box sx={{ 
          p: 1.5, 
          borderTop: `1px solid ${theme.palette.divider}`,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}>
          <Tooltip title={mode === 'dark' ? 'Switch to Light' : 'Switch to Dark'} arrow>
            <IconButton onClick={toggleTheme} size="small">
              {mode === 'dark' ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
            </IconButton>
          </Tooltip>
          <Tooltip title="Logout" arrow>
            <IconButton onClick={handleLogout} size="small" sx={{ color: 'error.main' }}>
              <LogoutIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Typography variant="caption" color="text.secondary" noWrap sx={{ ml: 'auto' }}>
            {user?.name?.split(' ')[0] || 'Admin'}
          </Typography>
        </Box>
      </Box>
    );
  }, [tabSections, activeTab, theme, isMobile, mode, toggleTheme, handleLogout, user]);

  // Horizontal tabs for mobile/tablet (non-sidebar mode)
  const renderHorizontalTabs = () => {
    let flatIndex = 0;
    return (
      <Box sx={{ 
        borderBottom: 1, 
        borderColor: 'divider',
        background: theme.palette.mode === 'dark' 
          ? 'rgba(255,255,255,0.02)' 
          : 'rgba(0,0,0,0.02)',
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}
      data-tour="admin-tabs"
      >
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          sx={{
            '& .MuiTabs-scrollButtons': {
              width: 32,
              '&.Mui-disabled': { opacity: 0.3 },
            },
            '& .MuiTab-root': {
              minHeight: isMobile ? 56 : 64,
              minWidth: isMobile ? 56 : 90,
              textTransform: 'none',
              fontSize: isMobile ? '0.7rem' : '0.8rem',
              fontWeight: 600,
              px: isMobile ? 1 : 1.5,
              transition: 'all 0.2s ease',
              '&:active': {
                transform: isTouchDevice ? 'scale(0.97)' : 'none',
              },
              '&.Mui-selected': {
                background: theme.palette.mode === 'dark' 
                  ? 'rgba(103, 126, 234, 0.12)'
                  : 'rgba(25, 118, 210, 0.08)',
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
              icon={tab.badgeCount ? (
                <Badge badgeContent={tab.badgeCount} color="error" max={99}>
                  {React.cloneElement(tab.icon, { sx: { fontSize: isMobile ? 20 : 22 } })}
                </Badge>
              ) : (
                React.cloneElement(tab.icon, { sx: { fontSize: isMobile ? 20 : 22 } })
              )}
              label={isMobile ? undefined : tab.shortLabel}
              iconPosition="start"
              sx={{
                '& .MuiSvgIcon-root': { mr: isMobile ? 0 : 0.75 }
              }}
              aria-label={tab.label}
            />
          ))}
        </Tabs>
      </Box>
    );
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      display: 'flex',
      backgroundColor: theme.palette.mode === 'dark' ? '#0a0a0a' : '#f5f7fa',
      background: theme.palette.mode === 'dark' 
        ? 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)'
        : 'linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 50%, #dce3eb 100%)',
    }}>
      {/* Desktop Sidebar — permanent above lg (1200px) */}
      {isLargeDesktop && (
        <Paper
          elevation={0}
          sx={{
            width: SIDEBAR_WIDTH,
            flexShrink: 0,
            borderRight: `1px solid ${theme.palette.divider}`,
            position: 'fixed',
            top: 0,
            left: 0,
            bottom: 0,
            zIndex: 20,
            overflow: 'hidden',
          }}
        >
          {renderSidebarContent()}
        </Paper>
      )}

      {/* Mobile/Tablet Drawer */}
      {!isLargeDesktop && (
        <Drawer
          open={mobileDrawerOpen}
          onClose={() => setMobileDrawerOpen(false)}
          variant="temporary"
          ModalProps={{ keepMounted: true }}
          PaperProps={{
            sx: {
              width: SIDEBAR_WIDTH,
              border: 'none',
              background: theme.palette.mode === 'dark'
                ? 'linear-gradient(180deg, #1e1e2e 0%, #12121e 100%)'
                : 'linear-gradient(180deg, #ffffff 0%, #f1f5f9 100%)',
            }
          }}
        >
          {renderSidebarContent()}
        </Drawer>
      )}

      {/* Main Content Area */}
      <Box
        sx={{
          flex: 1,
          ml: isLargeDesktop ? `${SIDEBAR_WIDTH}px` : 0,
          p: isMobile ? 1 : isTablet ? 2 : 3,
          position: 'relative',
          animation: 'fadeInUp 0.6s ease-out',
          '@keyframes fadeInUp': {
            '0%': { opacity: 0, transform: 'translateY(20px)' },
            '100%': { opacity: 1, transform: 'translateY(0)' }
          },
          paddingTop: isMobile ? 'max(env(safe-area-inset-top), 8px)' : isTablet ? 2 : 3,
          paddingBottom: isMobile ? 'max(env(safe-area-inset-bottom), 8px)' : isTablet ? 2 : 3,
          WebkitOverflowScrolling: 'touch',
          touchAction: isTouchDevice ? 'pan-y' : 'auto',
          minWidth: 0,
        }}
      >
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
          <Alert severity="warning" sx={{ mb: 3, zIndex: 10 }}>
            <Typography variant="body2">
              <strong>Admin Privileges Required:</strong> {error}
              <br />
              <small>Your current account does not have admin access. Please contact an administrator.</small>
            </Typography>
          </Alert>
        )}

        {/* Enhanced Header */}
        <Fade in timeout={600}>
          <Paper
            elevation={isMobile ? 4 : 12}
            sx={{
              p: isMobile ? 1.5 : isTablet ? 2 : 3,
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
              mb: isMobile ? 1.5 : 2,
              flexDirection: isMobile ? 'column' : 'row',
              gap: isMobile ? 1 : 2
            }}>
              <Box sx={{ width: isMobile ? '100%' : 'auto', display: 'flex', alignItems: 'center', gap: 1 }}>
                {/* Hamburger for non-large-desktop */}
                {!isLargeDesktop && (
                  <IconButton 
                    onClick={() => setMobileDrawerOpen(true)} 
                    size={isMobile ? 'small' : 'medium'}
                    sx={{ mr: 0.5 }}
                  >
                    <MenuIcon />
                  </IconButton>
                )}
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                    <AdminIcon sx={{ 
                      fontSize: isMobile ? 24 : 36, 
                      color: theme.palette.primary.main,
                      mr: 1
                    }} />
                    <Typography 
                      variant={isMobile ? 'h6' : 'h4'} 
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
                  {!isMobile && (
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {t('admin.dashboard.subtitle')}
                    </Typography>
                  )}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mt: 0.5 }}>
                    <Chip 
                      icon={<CheckCircle sx={{ fontSize: isMobile ? 14 : 16 }} />} 
                      label={isMobile ? user?.name?.split(' ')[0] || 'Admin' : `Welcome, ${user?.name || 'Admin'}`}
                      color="success"
                      variant="outlined"
                      size="small"
                      sx={{ fontSize: isMobile ? '0.7rem' : '0.8rem', height: isMobile ? 24 : 28 }}
                    />
                    <Tooltip title="Real-time updates active" arrow>
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
              </Box>
              <Box sx={{ 
                display: 'flex', 
                gap: isMobile ? 0.5 : 1, 
                alignItems: 'center',
                width: isMobile ? '100%' : 'auto',
                justifyContent: isMobile ? 'flex-end' : 'flex-start',
              }}>
                {/* Theme toggle in header (visible on non-sidebar views too) */}
                {!isLargeDesktop && (
                  <Tooltip title={mode === 'dark' ? 'Light Mode' : 'Dark Mode'} arrow>
                    <IconButton
                      onClick={toggleTheme}
                      size={isMobile ? 'small' : 'medium'}
                      sx={{
                        background: `${theme.palette.info.main}15`,
                        '&:hover': { background: `${theme.palette.info.main}25` }
                      }}
                    >
                      {mode === 'dark' ? (
                        <LightModeIcon sx={{ fontSize: isMobile ? 18 : 22, color: theme.palette.warning.main }} />
                      ) : (
                        <DarkModeIcon sx={{ fontSize: isMobile ? 18 : 22, color: theme.palette.info.main }} />
                      )}
                    </IconButton>
                  </Tooltip>
                )}
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
                      fontSize: isMobile ? 18 : 22,
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
                    <ExportIcon sx={{ fontSize: isMobile ? 18 : 22, color: theme.palette.success.main }} />
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
                      <Notifications sx={{ fontSize: isMobile ? 18 : 22, color: theme.palette.warning.main }} />
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
                      sx={{ '& .MuiBadge-badge': { right: 6, top: 6, animation: 'pulse 2s infinite' } }}
                    >
                      <HelpIcon sx={{ fontSize: isMobile ? 18 : 22, color: theme.palette.info.main }} />
                    </Badge>
                  </IconButton>
                </Tooltip>
                {/* Logout only in header when sidebar is NOT showing */}
                {!isLargeDesktop && (
                  <Tooltip title={t('admin.actions.logout')} arrow>
                    <IconButton 
                      onClick={handleLogout}
                      size={isMobile ? 'small' : 'medium'}
                      sx={{
                        background: `${theme.palette.error.main}15`,
                        '&:hover': { background: `${theme.palette.error.main}25` }
                      }}
                    >
                      <LogoutIcon sx={{ fontSize: isMobile ? 18 : 22, color: theme.palette.error.main }} />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
            </Box>
          </Paper>
        </Fade>

        {/* Export Menu */}
        <Menu
          anchorEl={exportMenuAnchor}
          open={Boolean(exportMenuAnchor)}
          onClose={() => setExportMenuAnchor(null)}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          PaperProps={{
            sx: {
              borderRadius: 3,
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}`,
              backdropFilter: 'blur(20px)',
              minWidth: 200,
            }
          }}
        >
          <Box sx={{ p: 1 }}>
            <Typography variant="caption" sx={{ px: 2, py: 1, display: 'block', color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
              Export Options
            </Typography>
            {[
              { fmt: 'csv', label: 'CSV File', sub: 'Spreadsheet data', color: theme.palette.primary.main },
              { fmt: 'excel', label: 'Excel File', sub: 'Advanced formatting', color: theme.palette.success.main },
              { fmt: 'pdf', label: 'PDF Report', sub: 'Print-ready format', color: theme.palette.error.main },
            ].map(opt => (
              <MenuItem
                key={opt.fmt}
                onClick={() => handleExport(opt.fmt)}
                sx={{
                  borderRadius: 2, mx: 1, my: 0.5, minHeight: 44,
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    background: `linear-gradient(135deg, ${opt.color}15, ${opt.color}25)`,
                    transform: 'translateX(4px)',
                  }
                }}
              >
                <ListItemIcon><GetApp sx={{ color: opt.color }} /></ListItemIcon>
                <Box>
                  <Typography variant="body2" fontWeight={600}>{opt.label}</Typography>
                  <Typography variant="caption" color="text.secondary">{opt.sub}</Typography>
                </Box>
              </MenuItem>
            ))}
          </Box>
        </Menu>

        {/* Quick Stats */}
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
                      minHeight: isMobile ? 90 : 'auto',
                      '&:active': { transform: 'scale(0.98)' }
                    }}
                  >
                    <CardContent sx={{ p: isMobile ? 1.5 : 2.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: isMobile ? 0.5 : 1.5 }}>
                        <Avatar
                          sx={{
                            backgroundColor: `${stat.color}25`,
                            color: stat.color,
                            mr: isMobile ? 1 : 2,
                            width: isMobile ? 32 : 48,
                            height: isMobile ? 32 : 48,
                            boxShadow: `0 4px 12px ${stat.color}20`,
                          }}
                        >
                          {React.cloneElement(stat.icon, { sx: { fontSize: isMobile ? 16 : 22 } })}
                        </Avatar>
                        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                          <Typography 
                            variant={isMobile ? 'h6' : 'h5'} 
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
                              fontSize: isMobile ? '0.6rem' : '0.78rem',
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
                              sx={{ fontSize: '0.6rem', color: 'warning.main', display: 'block', fontStyle: 'italic' }}
                            >
                              {stat.subtitle}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                      {stat.change !== 0 && !isMobile && (
                        <Box sx={{ 
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          mt: 1, p: 0.75, borderRadius: 1.5,
                          background: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'
                        }}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {stat.change > 0 ? (
                              <TrendingUp sx={{ color: 'success.main', fontSize: 16, mr: 0.5 }} />
                            ) : (
                              <TrendingDown sx={{ color: 'error.main', fontSize: 16, mr: 0.5 }} />
                            )}
                            <Typography variant="caption" color={stat.change > 0 ? 'success.main' : 'error.main'} sx={{ fontWeight: 600 }}>
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
                  borderRadius: 2, height: 6,
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
              sx={{ mb: 3, borderRadius: 2, border: '1px solid', borderColor: 'error.main' }}
              action={
                <IconButton color="inherit" size="small" onClick={() => window.location.reload()}>
                  <RefreshIcon />
                </IconButton>
              }
            >
              <Typography variant="body2" fontWeight={500}>{error}</Typography>
            </Alert>
          </Fade>
        )}

        {/* Main Content Panel */}
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
            {/* Show horizontal tabs only when sidebar is NOT visible */}
            {!isLargeDesktop && renderHorizontalTabs()}

            {/* Tab Content */}
            <Box sx={{ p: isMobile ? 1 : isTablet ? 2 : 3 }}>
              <Fade in key={activeTab} timeout={400}>
                <Box>
                  {tabs[activeTab]?.component}
                </Box>
              </Fade>
            </Box>
          </Paper>
        </Fade>

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
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}`,
              backdropFilter: 'blur(20px)',
              minWidth: 240,
            }
          }}
        >
          <Box sx={{ p: 1 }}>
            <Typography variant="caption" sx={{ px: 2, py: 1, display: 'block', color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
              Help & Support
            </Typography>
            <MenuItem onClick={handleStartTour} sx={{ borderRadius: 2, mx: 1, my: 0.5, minHeight: 44 }}>
              <ListItemIcon><TourIcon sx={{ color: theme.palette.primary.main }} /></ListItemIcon>
              <Box>
                <Typography variant="body2" fontWeight={600}>Start Tour</Typography>
                <Typography variant="caption" color="text.secondary">Interactive walkthrough</Typography>
              </Box>
            </MenuItem>
            <MenuItem onClick={handleOpenWhatsNew} sx={{ borderRadius: 2, mx: 1, my: 0.5, minHeight: 44 }}>
              <ListItemIcon>
                <Badge variant="dot" invisible={!hasNewFeaturesAvailable} color="success">
                  <Info sx={{ color: theme.palette.success.main }} />
                </Badge>
              </ListItemIcon>
              <Box>
                <Typography variant="body2" fontWeight={600}>
                  What's New
                  {hasNewFeaturesAvailable && (
                    <Chip label="NEW" size="small" color="success" sx={{ ml: 1, height: 18, fontSize: '0.65rem' }} />
                  )}
                </Typography>
                <Typography variant="caption" color="text.secondary">Latest features</Typography>
              </Box>
            </MenuItem>
            <MenuItem onClick={handleOpenDocumentation} sx={{ borderRadius: 2, mx: 1, my: 0.5, minHeight: 44 }}>
              <ListItemIcon><DocsIcon sx={{ color: theme.palette.info.main }} /></ListItemIcon>
              <Box>
                <Typography variant="body2" fontWeight={600}>Documentation</Typography>
                <Typography variant="caption" color="text.secondary">Complete guide</Typography>
              </Box>
            </MenuItem>
            <Divider sx={{ my: 1 }} />
            <MenuItem
              onClick={() => window.location.href = 'mailto:admin-support@soldikeeper.com'}
              sx={{ borderRadius: 2, mx: 1, my: 0.5, minHeight: 44 }}
            >
              <ListItemIcon><EmailIcon sx={{ color: theme.palette.warning.main }} /></ListItemIcon>
              <Box>
                <Typography variant="body2" fontWeight={600}>Contact Support</Typography>
                <Typography variant="caption" color="text.secondary">admin-support@soldikeeper.com</Typography>
              </Box>
            </MenuItem>
          </Box>
        </Menu>

        {/* Admin Onboarding Tour */}
        <AdminOnboardingTour open={tourOpen} onClose={() => setTourOpen(false)} />

        {/* What's New Notification */}
        <WhatsNewNotification 
          open={whatsNewOpen}
          onClose={() => { setWhatsNewOpen(false); setHasNewFeaturesAvailable(false); }}
        />

        {/* Documentation Dialog */}
        {showDocumentation && (
          <Dialog
            open={showDocumentation}
            onClose={() => setShowDocumentation(false)}
            maxWidth="lg"
            fullWidth
            fullScreen={isMobile}
            PaperProps={{ sx: { borderRadius: isMobile ? 0 : 3, minHeight: '80vh' } }}
          >
            <Suspense fallback={<ComponentLoader />}>
              <AdminDocumentation onBack={() => setShowDocumentation(false)} />
            </Suspense>
          </Dialog>
        )}

      </Box>
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
