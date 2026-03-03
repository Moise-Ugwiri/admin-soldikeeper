/* eslint-disable */
import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  Paper,
  Button,
  Alert,
  Divider,
  useTheme
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  FilterList as FilterIcon,
  Timeline as TimelineIcon,
  Extension as IntegrationIcon,
  Schedule as ScheduleIcon,
  SelectAll as BulkIcon
} from '@mui/icons-material';

// Import all shared components
import {
  DashboardWidget,
  ErrorBoundary,
  PermissionGate,
  PermissionProvider,
  DataExporter,
  DashboardLayoutManager,
  BulkOperationsManager,
  ReportScheduler,
  AdvancedSearchFilters,
  ActivityTimeline,
  IntegrationHub
} from './shared';

/**
 * Component Showcase - Demo page for testing all shared components
 * 
 * Navigate to /admin/showcase to view this page
 */
const ComponentShowcase = () => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);

  // Sample data for testing
  const sampleUsers = [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'user', status: 'active', createdAt: '2025-01-01' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'admin', status: 'active', createdAt: '2025-01-05' },
    { id: 3, name: 'Bob Wilson', email: 'bob@example.com', role: 'user', status: 'inactive', createdAt: '2025-01-10' },
    { id: 4, name: 'Alice Brown', email: 'alice@example.com', role: 'moderator', status: 'active', createdAt: '2025-01-12' },
    { id: 5, name: 'Charlie Davis', email: 'charlie@example.com', role: 'user', status: 'pending', createdAt: '2025-01-15' },
  ];

  const sampleActivities = [
    {
      id: 1,
      type: 'user_created',
      title: 'New User Registration',
      description: 'A new user has registered for the platform',
      timestamp: new Date().toISOString(),
      user: { name: 'System', email: 'system@soldikeeper.com' },
      details: { userId: 123, email: 'newuser@example.com' }
    },
    {
      id: 2,
      type: 'login',
      title: 'Admin Login',
      description: 'Admin user logged in successfully',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      user: { name: 'Admin User', email: 'admin@soldikeeper.com' }
    },
    {
      id: 3,
      type: 'security_alert',
      title: 'Failed Login Attempt',
      description: 'Multiple failed login attempts detected',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      metadata: { attempts: 5, ip: '192.168.1.100' }
    },
    {
      id: 4,
      type: 'payment_received',
      title: 'Subscription Payment',
      description: 'Premium subscription payment received',
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      user: { name: 'John Doe', email: 'john@example.com' },
      details: { amount: 9.99, plan: 'Premium' }
    },
    {
      id: 5,
      type: 'settings_changed',
      title: 'System Settings Updated',
      description: 'Email notification settings were modified',
      timestamp: new Date(Date.now() - 172800000).toISOString(),
      user: { name: 'Super Admin', email: 'superadmin@soldikeeper.com' }
    }
  ];

  const filterFields = [
    { id: 'name', label: 'Name', type: 'string' },
    { id: 'email', label: 'Email', type: 'string' },
    { id: 'role', label: 'Role', type: 'select', options: [
      { value: 'user', label: 'User' },
      { value: 'admin', label: 'Admin' },
      { value: 'moderator', label: 'Moderator' }
    ]},
    { id: 'status', label: 'Status', type: 'select', options: [
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' },
      { value: 'pending', label: 'Pending' }
    ]},
    { id: 'createdAt', label: 'Created Date', type: 'date' },
    { id: 'loginCount', label: 'Login Count', type: 'number' }
  ];

  const bulkActions = [
    { id: 'activate', label: 'Activate', icon: '✓', color: 'success' },
    { id: 'deactivate', label: 'Deactivate', icon: '✗', color: 'warning' },
    { id: 'delete', label: 'Delete', icon: '🗑', color: 'error', requireConfirmation: true },
    { id: 'export', label: 'Export', icon: '📤', color: 'primary' }
  ];

  const tabs = [
    { label: 'Dashboard Layout', icon: <DashboardIcon /> },
    { label: 'Advanced Filters', icon: <FilterIcon /> },
    { label: 'Activity Timeline', icon: <TimelineIcon /> },
    { label: 'Report Scheduler', icon: <ScheduleIcon /> },
    { label: 'Bulk Operations', icon: <BulkIcon /> },
    { label: 'Integration Hub', icon: <IntegrationIcon /> }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>Dashboard Layout Manager</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Drag and drop widgets to customize your dashboard layout. 
              Click "Add Widget" to add new components.
            </Typography>
            <DashboardLayoutManager
              availableWidgets={[
                { id: 'stats', title: 'Statistics', type: 'stats' },
                { id: 'chart', title: 'Revenue Chart', type: 'chart' },
                { id: 'users', title: 'Recent Users', type: 'table' },
                { id: 'activity', title: 'Activity Feed', type: 'list' }
              ]}
              onLayoutChange={(layout) => console.log('Layout changed:', layout)}
            />
          </Box>
        );

      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>Advanced Search Filters</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Build complex queries with multiple conditions. Save frequently used filters as presets.
            </Typography>
            <AdvancedSearchFilters
              fields={filterFields}
              onApplyFilters={(filters) => {
                console.log('Applied filters:', filters);
                alert('Filters applied! Check console for details.');
              }}
              onClearFilters={() => console.log('Filters cleared')}
              showHistory={true}
            />
            <Paper sx={{ p: 2, mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>Sample Data (will be filtered):</Typography>
              <pre style={{ fontSize: '0.75rem', overflow: 'auto' }}>
                {JSON.stringify(sampleUsers, null, 2)}
              </pre>
            </Paper>
          </Box>
        );

      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>Activity Timeline</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Visual timeline of system activities, grouped by date with filtering options.
            </Typography>
            <ActivityTimeline
              activities={sampleActivities}
              onRefresh={() => console.log('Refreshing activities...')}
              showFilters={true}
            />
          </Box>
        );

      case 3:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>Report Scheduler</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Schedule automated reports to be generated and optionally emailed.
            </Typography>
            <ReportScheduler
              onScheduleReport={(schedule) => {
                console.log('Report scheduled:', schedule);
                alert('Report scheduled successfully!');
              }}
              onRunReport={(schedule) => {
                console.log('Running report:', schedule);
                alert(`Running report: ${schedule.name}`);
              }}
            />
          </Box>
        );

      case 4:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>Bulk Operations Manager</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Select multiple records and perform batch operations.
            </Typography>
            <BulkOperationsManager
              type="users"
              items={sampleUsers}
              onOperation={(operationId, itemId, params) => {
                console.log(`Operation: ${operationId}, Item: ${itemId}, Params:`, params);
                return Promise.resolve({ success: true });
              }}
              getItemId={(item) => item.id}
              getItemLabel={(item) => item.name}
            />
          </Box>
        );

      case 5:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>Integration Hub</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Connect and manage third-party service integrations.
            </Typography>
            <IntegrationHub
              onConnect={(integration) => {
                console.log('Connecting:', integration);
                return Promise.resolve();
              }}
              onDisconnect={(id) => {
                console.log('Disconnecting:', id);
                return Promise.resolve();
              }}
              onSync={(id) => {
                console.log('Syncing:', id);
                return new Promise(resolve => setTimeout(resolve, 2000));
              }}
              onTest={(id) => {
                console.log('Testing:', id);
                return Promise.resolve({ success: true });
              }}
            />
          </Box>
        );

      default:
        return <Typography>Select a tab to view component</Typography>;
    }
  };

  return (
    <PermissionProvider 
      userRole="super_admin" 
      userPermissions={['users', 'transactions', 'analytics', 'security', 'settings', 'content', 'reports']}
    >
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h4" gutterBottom>
            🧪 Component Showcase
          </Typography>
          <Typography variant="body1" color="text.secondary">
            This page demonstrates all the shared components created for the admin dashboard.
            Use the tabs below to explore each component.
          </Typography>
          <Alert severity="info" sx={{ mt: 2 }}>
            <strong>Testing Mode:</strong> All actions will log to the browser console. 
            Open DevTools (F12) to see the output.
          </Alert>
        </Paper>

        <Paper sx={{ mb: 3 }}>
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            {tabs.map((tab, index) => (
              <Tab
                key={index}
                label={tab.label}
                icon={tab.icon}
                iconPosition="start"
              />
            ))}
          </Tabs>
        </Paper>

        <Paper sx={{ p: 3, minHeight: 500 }}>
          <ErrorBoundary>
            {renderTabContent()}
          </ErrorBoundary>
        </Paper>

        <Divider sx={{ my: 4 }} />

        {/* Additional Components Section */}
        <Typography variant="h5" gutterBottom>
          Additional Shared Components
        </Typography>

        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', mt: 3 }}>
          {/* Dashboard Widget Demo */}
          <Box sx={{ flex: '1 1 300px', maxWidth: 400 }}>
            <DashboardWidget
              title="Sample Widget"
              subtitle="DashboardWidget component"
              onRefresh={() => alert('Refreshing...')}
              collapsible
              menuItems={[
                { label: 'Option 1', onClick: () => alert('Option 1') },
                { label: 'Option 2', onClick: () => alert('Option 2') }
              ]}
            >
              <Typography variant="body2" sx={{ p: 2 }}>
                This is a reusable widget wrapper with collapse, fullscreen, 
                refresh, and menu capabilities.
              </Typography>
            </DashboardWidget>
          </Box>

          {/* Data Exporter Demo */}
          <Box sx={{ flex: '1 1 300px', maxWidth: 400 }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Data Exporter</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Export data in multiple formats
              </Typography>
              <DataExporter
                data={sampleUsers}
                filename="users_export"
                columns={[
                  { id: 'name', label: 'Name' },
                  { id: 'email', label: 'Email' },
                  { id: 'role', label: 'Role' },
                  { id: 'status', label: 'Status' }
                ]}
              />
            </Paper>
          </Box>

          {/* Permission Gate Demo */}
          <Box sx={{ flex: '1 1 300px', maxWidth: 400 }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Permission Gate</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Role-based access control
              </Typography>
              <PermissionGate permission="users" fallback={<Alert severity="warning">No access</Alert>}>
                <Alert severity="success">
                  You have access to user management!
                </Alert>
              </PermissionGate>
            </Paper>
          </Box>
        </Box>
      </Container>
    </PermissionProvider>
  );
};

export default ComponentShowcase;
