// Admin Shared Components
// Reusable components for the admin dashboard

// ============================================
// Month 1 (Short-Term) Components
// ============================================

// Dashboard Widget - Customizable, draggable widget component
export { default as DashboardWidget } from './DashboardWidget';

// Error Boundary - Error handling with retry logic
export { 
  default as ErrorBoundary,
  withErrorBoundary,
  useErrorHandler 
} from './ErrorBoundary';

// Permission Gate - Role-based access control
export {
  default as PermissionGate,
  PermissionProvider,
  usePermissions,
  withPermission,
  RequirePermission,
  PERMISSIONS,
  ROLES
} from './PermissionGate';

// Virtualized Table - For large datasets
export { 
  default as VirtualizedTable,
  VirtualizedList 
} from './VirtualizedTable';

// Data Exporter - Export data in multiple formats
export { default as DataExporter } from './DataExporter';

// ============================================
// Quarter 1 (Medium-Term) Components
// ============================================

// Dashboard Layout Manager - Drag-drop customizable layout
export { default as DashboardLayoutManager } from './DashboardLayoutManager';

// Bulk Operations Manager - Batch operations on multiple records
export { default as BulkOperationsManager } from './BulkOperationsManager';

// Report Scheduler - Schedule automated reports
export { default as ReportScheduler } from './ReportScheduler';

// Advanced Search Filters - Complex filtering with saved presets
export { default as AdvancedSearchFilters } from './AdvancedSearchFilters';

// Activity Timeline - Visual timeline of admin activities
export { default as ActivityTimeline } from './ActivityTimeline';

// Integration Hub - Third-party integrations management
export { default as IntegrationHub } from './IntegrationHub';

// Tab Error Boundary - Lightweight error boundary for individual tabs/sections
export { default as TabErrorBoundary } from './TabErrorBoundary';
