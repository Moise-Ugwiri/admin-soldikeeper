import React, { createContext, useContext, useMemo, useCallback } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useAdminData } from '../../../contexts/AdminContext';
import { Alert, Box, Typography, Button } from '@mui/material';
import { Lock as LockIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

/**
 * Permission definitions for admin features
 */
export const PERMISSIONS = {
  // User management
  USERS_VIEW: 'users.view',
  USERS_CREATE: 'users.create',
  USERS_EDIT: 'users.edit',
  USERS_DELETE: 'users.delete',
  USERS_EXPORT: 'users.export',
  
  // Transaction management
  TRANSACTIONS_VIEW: 'transactions.view',
  TRANSACTIONS_EDIT: 'transactions.edit',
  TRANSACTIONS_DELETE: 'transactions.delete',
  TRANSACTIONS_EXPORT: 'transactions.export',
  TRANSACTIONS_REFUND: 'transactions.refund',
  
  // Analytics
  ANALYTICS_VIEW: 'analytics.view',
  ANALYTICS_EXPORT: 'analytics.export',
  ANALYTICS_ADVANCED: 'analytics.advanced',
  
  // Financial
  FINANCIAL_VIEW: 'financial.view',
  FINANCIAL_REPORTS: 'financial.reports',
  FINANCIAL_EXPORT: 'financial.export',
  
  // Security
  SECURITY_VIEW: 'security.view',
  SECURITY_MANAGE: 'security.manage',
  SECURITY_AUDIT: 'security.audit',
  
  // Settings
  SETTINGS_VIEW: 'settings.view',
  SETTINGS_EDIT: 'settings.edit',
  SETTINGS_SYSTEM: 'settings.system',
  
  // Content
  CONTENT_VIEW: 'content.view',
  CONTENT_CREATE: 'content.create',
  CONTENT_EDIT: 'content.edit',
  CONTENT_DELETE: 'content.delete',
  CONTENT_PUBLISH: 'content.publish',
  
  // Reports
  REPORTS_VIEW: 'reports.view',
  REPORTS_CREATE: 'reports.create',
  REPORTS_EXPORT: 'reports.export',
  
  // Admin management
  ADMIN_VIEW: 'admin.view',
  ADMIN_CREATE: 'admin.create',
  ADMIN_EDIT: 'admin.edit',
  ADMIN_DELETE: 'admin.delete',
  ADMIN_ROLES: 'admin.roles'
};

/**
 * Role definitions with their permissions
 */
export const ROLES = {
  super_admin: {
    name: 'Super Admin',
    permissions: Object.values(PERMISSIONS) // All permissions
  },
  admin: {
    name: 'Admin',
    permissions: [
      PERMISSIONS.USERS_VIEW, PERMISSIONS.USERS_CREATE, PERMISSIONS.USERS_EDIT, PERMISSIONS.USERS_EXPORT,
      PERMISSIONS.TRANSACTIONS_VIEW, PERMISSIONS.TRANSACTIONS_EDIT, PERMISSIONS.TRANSACTIONS_EXPORT,
      PERMISSIONS.ANALYTICS_VIEW, PERMISSIONS.ANALYTICS_EXPORT, PERMISSIONS.ANALYTICS_ADVANCED,
      PERMISSIONS.FINANCIAL_VIEW, PERMISSIONS.FINANCIAL_REPORTS,
      PERMISSIONS.SECURITY_VIEW, PERMISSIONS.SECURITY_AUDIT,
      PERMISSIONS.SETTINGS_VIEW, PERMISSIONS.SETTINGS_EDIT,
      PERMISSIONS.CONTENT_VIEW, PERMISSIONS.CONTENT_CREATE, PERMISSIONS.CONTENT_EDIT, PERMISSIONS.CONTENT_PUBLISH,
      PERMISSIONS.REPORTS_VIEW, PERMISSIONS.REPORTS_CREATE, PERMISSIONS.REPORTS_EXPORT,
      PERMISSIONS.ADMIN_VIEW
    ]
  },
  moderator: {
    name: 'Moderator',
    permissions: [
      PERMISSIONS.USERS_VIEW, PERMISSIONS.USERS_EDIT,
      PERMISSIONS.TRANSACTIONS_VIEW,
      PERMISSIONS.CONTENT_VIEW, PERMISSIONS.CONTENT_EDIT,
      PERMISSIONS.REPORTS_VIEW
    ]
  },
  analyst: {
    name: 'Analyst',
    permissions: [
      PERMISSIONS.USERS_VIEW,
      PERMISSIONS.TRANSACTIONS_VIEW,
      PERMISSIONS.ANALYTICS_VIEW, PERMISSIONS.ANALYTICS_EXPORT, PERMISSIONS.ANALYTICS_ADVANCED,
      PERMISSIONS.FINANCIAL_VIEW, PERMISSIONS.FINANCIAL_REPORTS, PERMISSIONS.FINANCIAL_EXPORT,
      PERMISSIONS.REPORTS_VIEW, PERMISSIONS.REPORTS_CREATE, PERMISSIONS.REPORTS_EXPORT
    ]
  },
  support: {
    name: 'Support',
    permissions: [
      PERMISSIONS.USERS_VIEW, PERMISSIONS.USERS_EDIT,
      PERMISSIONS.TRANSACTIONS_VIEW, PERMISSIONS.TRANSACTIONS_REFUND,
      PERMISSIONS.CONTENT_VIEW
    ]
  }
};

// Permission Context
const PermissionContext = createContext(null);

/**
 * PermissionProvider - Provides permission checking functionality
 */
export const PermissionProvider = ({ children }) => {
  const { user } = useAuth();
  const { adminRoles } = useAdminData();

  // Get user's role and permissions
  const userPermissions = useMemo(() => {
    if (!user) return [];
    
    // Super admin has all permissions
    if (user.isSuperAdmin) {
      return Object.values(PERMISSIONS);
    }

    // Check for custom role from adminRoles
    if (user.adminRole && adminRoles?.length > 0) {
      const customRole = adminRoles.find(r => r._id === user.adminRole || r.name === user.adminRole);
      if (customRole?.permissions) {
        return customRole.permissions;
      }
    }

    // Fallback to predefined roles
    const role = user.role || (user.isAdmin ? 'admin' : null);
    if (role && ROLES[role]) {
      return ROLES[role].permissions;
    }

    // Default admin permissions
    if (user.isAdmin) {
      return ROLES.admin.permissions;
    }

    return [];
  }, [user, adminRoles]);

  // Check if user has a specific permission
  const hasPermission = useCallback((permission) => {
    if (!user) return false;
    if (user.isSuperAdmin) return true;
    return userPermissions.includes(permission);
  }, [user, userPermissions]);

  // Check if user has any of the specified permissions
  const hasAnyPermission = useCallback((permissions) => {
    if (!user) return false;
    if (user.isSuperAdmin) return true;
    return permissions.some(p => userPermissions.includes(p));
  }, [user, userPermissions]);

  // Check if user has all of the specified permissions
  const hasAllPermissions = useCallback((permissions) => {
    if (!user) return false;
    if (user.isSuperAdmin) return true;
    return permissions.every(p => userPermissions.includes(p));
  }, [user, userPermissions]);

  // Get user's role name
  const getRoleName = useCallback(() => {
    if (!user) return null;
    if (user.isSuperAdmin) return 'Super Admin';
    if (user.role && ROLES[user.role]) return ROLES[user.role].name;
    if (user.isAdmin) return 'Admin';
    return 'User';
  }, [user]);

  const value = useMemo(() => ({
    permissions: userPermissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    getRoleName,
    PERMISSIONS,
    ROLES
  }), [userPermissions, hasPermission, hasAnyPermission, hasAllPermissions, getRoleName]);

  return (
    <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>
  );
};

/**
 * usePermissions - Hook to access permission checking functions
 */
export const usePermissions = () => {
  const context = useContext(PermissionContext);
  if (!context) {
    throw new Error('usePermissions must be used within a PermissionProvider');
  }
  return context;
};

/**
 * PermissionGate - Component that renders children only if user has required permissions
 */
export const PermissionGate = ({
  children,
  permission,
  permissions,
  requireAll = false,
  fallback = null,
  showAccessDenied = false
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();

  // Check permissions
  let hasAccess = false;
  
  if (permission) {
    hasAccess = hasPermission(permission);
  } else if (permissions && permissions.length > 0) {
    hasAccess = requireAll 
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions);
  } else {
    // No permission specified, allow access
    hasAccess = true;
  }

  if (hasAccess) {
    return children;
  }

  // Show access denied message
  if (showAccessDenied) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Alert 
          severity="error"
          icon={<LockIcon />}
          sx={{ maxWidth: 500, mx: 'auto' }}
        >
          <Typography variant="h6" gutterBottom>
            {t('common.accessDenied')}
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            {t('common.noPermission')}
          </Typography>
          <Button
            variant="outlined"
            size="small"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(-1)}
          >
            {t('common.goBack')}
          </Button>
        </Alert>
      </Box>
    );
  }

  // Return fallback or null
  return fallback;
};

/**
 * withPermission - HOC to wrap components with permission checking
 */
export const withPermission = (WrappedComponent, requiredPermission, options = {}) => {
  const WithPermission = (props) => (
    <PermissionGate
      permission={requiredPermission}
      showAccessDenied={options.showAccessDenied}
      fallback={options.fallback}
    >
      <WrappedComponent {...props} />
    </PermissionGate>
  );

  WithPermission.displayName = `WithPermission(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;
  
  return WithPermission;
};

/**
 * RequirePermission - Component version of permission gate for JSX usage
 */
export const RequirePermission = PermissionGate;

export default PermissionGate;
