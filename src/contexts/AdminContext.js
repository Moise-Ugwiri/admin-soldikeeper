import React, { createContext, useContext, useReducer, useCallback, useEffect, useRef } from 'react';
import adminService from '../services/adminService';
import websocketService from '../services/websocketService';
import { useAuth } from './AuthContext';

// Initial state
const initialState = {
  // Dashboard stats
  adminStats: {
    totalUsers: 0,
    totalTransactions: 0,
    // User-tracked finances (NOT platform revenue!)
    totalUserIncome: 0,
    totalUserExpenses: 0,
    totalUserNetBalance: 0,
    // Legacy field kept for backward compatibility
    totalRevenue: 0,
    // Subscription breakdown
    premiumUsers: 0,
    freeUsers: 0,
    conversionRate: 0,
    // Growth metrics
    userGrowth: 0,
    transactionGrowth: 0,
    activeUsers: 0,
    newUsers: 0,
    systemHealth: 100
  },
  
  // Real-time data
  realtimeData: {
    activeSessions: 0,
    onlineUsers: 0,
    currentLoad: 0,
    errorRate: 0,
    responseTime: 0
  },
  
  // User management
  users: [],
  usersPagination: {
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  },
  
  // Transaction monitoring
  transactions: [],
  transactionsPagination: {
    page: 1,
    limit: 50,
    total: 0,
    pages: 0
  },
  
  // Analytics data
  analytics: {
    userRegistrations: [],
    transactionVolume: [],
    revenueData: [],
    categoryBreakdown: [],
    geographicData: [],
    deviceStats: []
  },
  
  // Activity logs
  activityLogs: [],
  activityPagination: {
    page: 1,
    limit: 100,
    total: 0,
    pages: 0
  },
  
  // Security data
  securityAlerts: [],
  suspiciousActivity: [],
  failedLogins: [],
  
  // System settings
  systemSettings: {
    maintenanceMode: false,
    registrationEnabled: true,
    maxUsers: 10000,
    backupEnabled: true,
    emailNotifications: true
  },

  // Content & Communication Management
  notifications: [],
  notificationsPagination: {
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  },
  emailCampaigns: [],
  emailCampaignsPagination: {
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  },
  helpContent: [],
  helpContentPagination: {
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  },
  communicationAnalytics: {
    emailMetrics: [],
    contentPerformance: [],
    supportMetrics: []
  },

  // Financial Intelligence Data (NEW)
  financialIntelligence: {
    revenueData: [],
    subscriptionData: [],
    kpiMetrics: [],
    cohortData: [],
    cashFlowData: [],
    summary: null
  },

  // Enhanced Security Data (NEW)
  securityData: {
    alerts: [],
    blockedIPs: [],
    loginAttempts: [],
    settings: {},
    stats: {}
  },

  // Compliance Data (NEW)
  complianceData: {
    auditLogs: [],
    gdprRequests: [],
    gdprStats: {},
    complianceMetrics: [],
    stats: {}
  },

  // Admin Roles (NEW)
  adminRoles: [],
  adminUsers: [],

  // Escalation Management (PROJECT OLYMPUS)
  escalations: [],
  escalationsPagination: {
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  },
  escalationStats: {
    total: 0,
    pending: 0,
    overdue: 0,
    resolved: 0,
    rejected: 0,
    avgResponseTime: 0
  },
  escalationChannels: {
    telegram: { enabled: false, message: '' },
    email: { enabled: false, message: '' }
  },
  
  // Loading and error states
  loading: false,
  error: null,
  
  // Filters and search
  filters: {
    users: {
      status: 'all',
      dateRange: 'all',
      search: ''
    },
    transactions: {
      status: 'all',
      dateRange: 'all',
      search: '',
      amountRange: [0, 10000]
    },
    activity: {
      type: 'all',
      dateRange: 'today',
      search: ''
    }
  }
};

// Action types
const ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_ADMIN_STATS: 'SET_ADMIN_STATS',
  SET_REALTIME_DATA: 'SET_REALTIME_DATA',
  SET_USERS: 'SET_USERS',
  SET_TRANSACTIONS: 'SET_TRANSACTIONS',
  SET_ANALYTICS: 'SET_ANALYTICS',
  SET_ACTIVITY_LOGS: 'SET_ACTIVITY_LOGS',
  SET_SECURITY_ALERTS: 'SET_SECURITY_ALERTS',
  SET_SYSTEM_SETTINGS: 'SET_SYSTEM_SETTINGS',
  UPDATE_USER: 'UPDATE_USER',
  DELETE_USER: 'DELETE_USER',
  UPDATE_TRANSACTION: 'UPDATE_TRANSACTION',
  ADD_ACTIVITY_LOG: 'ADD_ACTIVITY_LOG',
  UPDATE_FILTERS: 'UPDATE_FILTERS',
  CLEAR_ERROR: 'CLEAR_ERROR',
  // Content Management
  SET_NOTIFICATIONS: 'SET_NOTIFICATIONS',
  SET_EMAIL_CAMPAIGNS: 'SET_EMAIL_CAMPAIGNS',
  SET_HELP_CONTENT: 'SET_HELP_CONTENT',
  SET_COMMUNICATION_ANALYTICS: 'SET_COMMUNICATION_ANALYTICS',
  // New Enhanced Features
  SET_FINANCIAL_INTELLIGENCE: 'SET_FINANCIAL_INTELLIGENCE',
  SET_SECURITY_DATA: 'SET_SECURITY_DATA',
  SET_COMPLIANCE_DATA: 'SET_COMPLIANCE_DATA',
  SET_ADMIN_ROLES: 'SET_ADMIN_ROLES',
  SET_ADMIN_USERS: 'SET_ADMIN_USERS',
  // Real-time increments (WebSocket-driven)
  INCREMENT_STAT: 'INCREMENT_STAT',
  // Escalation Management (PROJECT OLYMPUS)
  SET_ESCALATIONS: 'SET_ESCALATIONS',
  SET_ESCALATION_STATS: 'SET_ESCALATION_STATS',
  SET_ESCALATION_CHANNELS: 'SET_ESCALATION_CHANNELS',
  ADD_ESCALATION: 'ADD_ESCALATION',
  UPDATE_ESCALATION: 'UPDATE_ESCALATION',
  DELETE_ESCALATION: 'DELETE_ESCALATION',
};

// Reducer
const adminReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };
      
    case ACTIONS.SET_ERROR:
      return { ...state, error: action.payload, loading: false };
      
    case ACTIONS.CLEAR_ERROR:
      return { ...state, error: null };
      
    case ACTIONS.SET_ADMIN_STATS:
      return { ...state, adminStats: action.payload };
      
    case ACTIONS.SET_REALTIME_DATA:
      return { ...state, realtimeData: action.payload };
      
    case ACTIONS.SET_USERS:
      return { 
        ...state, 
        users: action.payload.users,
        usersPagination: action.payload.pagination
      };
      
    case ACTIONS.SET_TRANSACTIONS:
      return { 
        ...state, 
        transactions: action.payload.transactions,
        transactionsPagination: action.payload.pagination
      };
      
    case ACTIONS.SET_ANALYTICS:
      return { ...state, analytics: action.payload };
      
    case ACTIONS.SET_ACTIVITY_LOGS:
      return { 
        ...state, 
        activityLogs: action.payload.logs,
        activityPagination: action.payload.pagination
      };
      
    case ACTIONS.SET_SECURITY_ALERTS:
      return { ...state, securityAlerts: action.payload };
      
    case ACTIONS.SET_SYSTEM_SETTINGS:
      return { ...state, systemSettings: action.payload };
      
    case ACTIONS.UPDATE_USER:
      return {
        ...state,
        users: state.users.map(user =>
          user._id === action.payload._id ? action.payload : user
        )
      };
      
    case ACTIONS.DELETE_USER:
      return {
        ...state,
        users: state.users.filter(user => user._id !== action.payload)
      };
      
    case ACTIONS.UPDATE_TRANSACTION:
      return {
        ...state,
        transactions: state.transactions.map(transaction =>
          transaction._id === action.payload._id ? action.payload : transaction
        )
      };
      
    case ACTIONS.ADD_ACTIVITY_LOG:
      return {
        ...state,
        activityLogs: [action.payload, ...state.activityLogs.slice(0, 99)]
      };
      
    case ACTIONS.UPDATE_FILTERS:
      return {
        ...state,
        filters: {
          ...state.filters,
          [action.payload.section]: {
            ...state.filters[action.payload.section],
            ...action.payload.filters
          }
        }
      };

    // Content Management
    case ACTIONS.SET_NOTIFICATIONS:
      return { 
        ...state, 
        notifications: action.payload.notifications,
        notificationsPagination: action.payload.pagination
      };

    case ACTIONS.SET_EMAIL_CAMPAIGNS:
      return { 
        ...state, 
        emailCampaigns: action.payload.campaigns,
        emailCampaignsPagination: action.payload.pagination
      };

    case ACTIONS.SET_HELP_CONTENT:
      return { 
        ...state, 
        helpContent: action.payload.content,
        helpContentPagination: action.payload.pagination
      };

    case ACTIONS.SET_COMMUNICATION_ANALYTICS:
      return { ...state, communicationAnalytics: action.payload };

    // Enhanced Features (NEW)
    case ACTIONS.SET_FINANCIAL_INTELLIGENCE:
      return { ...state, financialIntelligence: action.payload };

    case ACTIONS.SET_SECURITY_DATA:
      return { ...state, securityData: action.payload };

    case ACTIONS.SET_COMPLIANCE_DATA:
      return { ...state, complianceData: action.payload };

    case ACTIONS.SET_ADMIN_ROLES:
      return { ...state, adminRoles: action.payload };

    case ACTIONS.SET_ADMIN_USERS:
      return { ...state, adminUsers: action.payload };

    // Real-time increments (WebSocket-driven)
    case ACTIONS.INCREMENT_STAT: {
      const { field, amount = 1 } = action.payload;
      return {
        ...state,
        adminStats: {
          ...state.adminStats,
          [field]: (state.adminStats[field] || 0) + amount
        }
      };
    }

    // Escalation Management (PROJECT OLYMPUS)
    case ACTIONS.SET_ESCALATIONS:
      return { 
        ...state, 
        escalations: action.payload.escalations,
        escalationsPagination: action.payload.pagination
      };

    case ACTIONS.SET_ESCALATION_STATS:
      return { ...state, escalationStats: action.payload };

    case ACTIONS.SET_ESCALATION_CHANNELS:
      return { ...state, escalationChannels: action.payload };

    case ACTIONS.ADD_ESCALATION:
      return {
        ...state,
        escalations: [action.payload, ...state.escalations],
        escalationStats: {
          ...state.escalationStats,
          total: state.escalationStats.total + 1,
          pending: state.escalationStats.pending + 1
        }
      };

    case ACTIONS.UPDATE_ESCALATION:
      return {
        ...state,
        escalations: state.escalations.map(esc =>
          esc._id === action.payload._id ? action.payload : esc
        )
      };

    case ACTIONS.DELETE_ESCALATION:
      return {
        ...state,
        escalations: state.escalations.filter(esc => esc._id !== action.payload)
      };
      
    default:
      return state;
  }
};

// Context
const AdminContext = createContext();

// Hook
export const useAdminData = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdminData must be used within an AdminProvider');
  }
  return context;
};

// Provider
export const AdminProvider = ({ children }) => {
  const [state, dispatch] = useReducer(adminReducer, initialState);
  const { isAuthenticated } = useAuth();

  // Actions
  const setLoading = useCallback((loading) => {
    dispatch({ type: ACTIONS.SET_LOADING, payload: loading });
  }, []);

  const setError = useCallback((error) => {
    dispatch({ type: ACTIONS.SET_ERROR, payload: error });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: ACTIONS.CLEAR_ERROR });
  }, []);

  // Fetch dashboard stats
  const fetchAdminStats = useCallback(async () => {
    try {
      // Check if user is authenticated first
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Not authenticated. Please log in as admin.');
        return;
      }
      
      const stats = await adminService.getDashboardStats();
      const adminStatsData = stats.success ? stats.data : stats;
      dispatch({ type: ACTIONS.SET_ADMIN_STATS, payload: adminStatsData });
      
    } catch (error) {
      console.error('AdminContext: fetchAdminStats failed:', error.message);
      
      if (error.message.includes('401') || error.message.includes('No authentication token')) {
        setError('Authentication required. Please log in as admin.');
      } else if (error.message.includes('403') || error.message.includes('Forbidden')) {
        setError('Admin access required. Your account does not have admin privileges.');
      } else {
        setError(error.message);
      }
    }
  }, [setError]);

  // Fetch real-time data
  const fetchRealtimeData = useCallback(async () => {
    try {
      // Check if user is authenticated first
      const token = localStorage.getItem('token');
      if (!token) {
        return;
      }
      
      const data = await adminService.getRealtimeData();
      const realtimeData = data.success ? data.data : data;
      dispatch({ type: ACTIONS.SET_REALTIME_DATA, payload: realtimeData });
      
    } catch (error) {
      // Silent fail for realtime data - not critical
      if (process.env.NODE_ENV === 'development') {
        console.warn('AdminContext: Realtime data fetch failed:', error.message);
      }
    }
  }, []);

  // Fetch users
  const fetchUsers = useCallback(async (page = 1, filters = {}) => {
    try {
      console.log('fetchUsers called with:', { page, filters });
      setLoading(true);
      const limit = state.usersPagination?.limit || 20;
      console.log('Calling adminService.getUsers with:', { page, limit, filters });
      const data = await adminService.getUsers(page, limit, filters);
      console.log('adminService.getUsers returned:', data);
      
      // Extract the actual data from the API response
      const usersData = data.success ? data.data : data;
      console.log('Extracted users data:', usersData);
      
      // Ensure usersData has the right structure
      const finalUsersData = {
        users: Array.isArray(usersData?.users) ? usersData.users : [],
        pagination: usersData?.pagination || {
          page: 1,
          limit: 20,
          total: 0,
          pages: 0
        }
      };
      
      console.log('Final users data to dispatch:', finalUsersData);
      dispatch({ type: ACTIONS.SET_USERS, payload: finalUsersData });
    } catch (error) {
      console.error('fetchUsers error:', error);
      // Provide safe mock data for errors
      const mockData = {
        users: [],
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          pages: 0
        }
      };
      console.log('Using mock user data due to error:', mockData);
      dispatch({ type: ACTIONS.SET_USERS, payload: mockData });
      setError(`Failed to fetch users: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [state.usersPagination?.limit, setLoading, setError]);

  // Fetch transactions
  const fetchTransactions = useCallback(async (page = 1, filters = {}) => {
    try {
      console.log('fetchTransactions called with:', { page, filters });
      setLoading(true);
      const limit = state.transactionsPagination?.limit || 50;
      console.log('Calling adminService.getTransactions with:', { page, limit, filters });
      const data = await adminService.getTransactions(page, limit, filters);
      console.log('adminService.getTransactions returned:', data);
      
      // Extract the actual data from the API response
      const transactionsData = data.success ? data.data : data;
      console.log('Extracted transactions data:', transactionsData);
      
      // Ensure transactionsData has the right structure
      const finalTransactionsData = {
        transactions: Array.isArray(transactionsData?.transactions) ? transactionsData.transactions : [],
        pagination: transactionsData?.pagination || {
          page: 1,
          limit: 50,
          total: 0,
          pages: 0
        }
      };
      
      console.log('Final transactions data to dispatch:', finalTransactionsData);
      dispatch({ type: ACTIONS.SET_TRANSACTIONS, payload: finalTransactionsData });
    } catch (error) {
      console.error('fetchTransactions error:', error);
      // Provide safe mock data for errors
      const mockData = {
        transactions: [],
        pagination: {
          page: 1,
          limit: 50,
          total: 0,
          pages: 0
        }
      };
      console.log('Using mock transaction data due to error:', mockData);
      dispatch({ type: ACTIONS.SET_TRANSACTIONS, payload: mockData });
      setError(`Failed to fetch transactions: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [state.transactionsPagination?.limit, setLoading, setError]);

  // Fetch analytics
  const fetchAnalytics = useCallback(async (dateRange = '30d') => {
    try {
      const response = await adminService.getAnalytics(dateRange);
      // Unwrap { success, data } envelope so components can access analytics.userRegistrations etc.
      const data = response?.success ? response.data : response;
      dispatch({ type: ACTIONS.SET_ANALYTICS, payload: data });
    } catch (error) {
      setError(error.message);
    }
  }, [setError]);

  // Fetch activity logs
  const fetchActivityLogs = useCallback(async (page = 1, filters = {}) => {
    try {
      const limit = state.activityPagination?.limit || 100;
      const data = await adminService.getActivityLogs(page, limit, filters);
      
      // Handle different response structures
      let payload = data;
      if (data && data.success && data.data) {
        payload = data.data;
      } else if (data && !data.logs && !data.pagination) {
        payload = { logs: [], pagination: { page: 1, limit: 100, total: 0, pages: 0 } };
      }
      
      dispatch({ type: ACTIONS.SET_ACTIVITY_LOGS, payload });
    } catch (error) {
      console.error('Error fetching activity logs:', error);
      setError(error.message);
    }
  }, [state.activityPagination?.limit, setError]);

  // Fetch security alerts
  const fetchSecurityAlerts = useCallback(async () => {
    try {
      const alerts = await adminService.getSecurityAlerts();
      dispatch({ type: ACTIONS.SET_SECURITY_ALERTS, payload: alerts });
    } catch (error) {
      setError(error.message);
    }
  }, [setError]);

  // Fetch system settings
  const fetchSystemSettings = useCallback(async () => {
    try {
      console.log('🔍 AdminContext: fetchSystemSettings called');
      
      // Check if user is authenticated first
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('❌ AdminContext: No auth token found for system settings');
        setError('Not authenticated. Please log in as admin.');
        return;
      }
      
      console.log('📡 AdminContext: Calling adminService.getSystemSettings()...');
      const settings = await adminService.getSystemSettings();
      
      console.log('✅ AdminContext: Got settings from API:', settings);
      dispatch({ type: ACTIONS.SET_SYSTEM_SETTINGS, payload: settings });
      console.log('✅ AdminContext: Settings dispatched to state');
      
    } catch (error) {
      console.error('❌ AdminContext: fetchSystemSettings failed:', error);
      
      if (error.message.includes('401') || error.message.includes('No authentication token')) {
        setError('Authentication required. Please log in as admin.');
      } else if (error.message.includes('403') || error.message.includes('Forbidden')) {
        setError('Admin access required. Your account does not have admin privileges.');
      } else {
        setError(error.message);
      }
    }
  }, [setError]);

  // User management actions
  const updateUser = useCallback(async (userId, updates) => {
    try {
      const updatedUser = await adminService.updateUser(userId, updates);
      dispatch({ type: ACTIONS.UPDATE_USER, payload: updatedUser });
      return updatedUser;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  }, [setError]);

  const grantSubscription = useCallback(async (userId, options) => {
    try {
      const result = await adminService.grantSubscription(userId, options);
      return result;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  }, [setError]);

  const resetUserPassword = useCallback(async (userId) => {
    try { return await adminService.resetUserPassword(userId); }
    catch (error) { setError(error.message); throw error; }
  }, [setError]);

  const forceVerifyEmail = useCallback(async (userId) => {
    try { return await adminService.forceVerifyEmail(userId); }
    catch (error) { setError(error.message); throw error; }
  }, [setError]);

  const forceLogout = useCallback(async (userId) => {
    try { return await adminService.forceLogout(userId); }
    catch (error) { setError(error.message); throw error; }
  }, [setError]);

  const sendEmailToUser = useCallback(async (userId, subject, message) => {
    try { return await adminService.sendEmailToUser(userId, subject, message); }
    catch (error) { setError(error.message); throw error; }
  }, [setError]);

  const addAdminNote = useCallback(async (userId, note) => {
    try { return await adminService.addAdminNote(userId, note); }
    catch (error) { setError(error.message); throw error; }
  }, [setError]);

  const getAdminNotes = useCallback(async (userId) => {
    try { return await adminService.getAdminNotes(userId); }
    catch (error) { setError(error.message); throw error; }
  }, [setError]);

  const deleteUserData = useCallback(async (userId) => {
    try { return await adminService.deleteUserData(userId); }
    catch (error) { setError(error.message); throw error; }
  }, [setError]);

  const getUserStats = useCallback(async (userId) => {
    try { return await adminService.getUserStats(userId); }
    catch (error) { setError(error.message); throw error; }
  }, [setError]);

  const deleteUser = useCallback(async (userId) => {
    try {
      await adminService.deleteUser(userId);
      dispatch({ type: ACTIONS.DELETE_USER, payload: userId });
    } catch (error) {
      setError(error.message);
      throw error;
    }
  }, [setError]);

  // Transaction management actions
  const updateTransaction = useCallback(async (transactionId, updates) => {
    try {
      const updatedTransaction = await adminService.updateTransaction(transactionId, updates);
      dispatch({ type: ACTIONS.UPDATE_TRANSACTION, payload: updatedTransaction });
      return updatedTransaction;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  }, [setError]);

  // Update system settings
  const updateSystemSettings = useCallback(async (settings) => {
    try {
      const updatedSettings = await adminService.updateSystemSettings(settings);
      dispatch({ type: ACTIONS.SET_SYSTEM_SETTINGS, payload: updatedSettings });
      return updatedSettings;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  }, [setError]);

  // Content Management functions
  const fetchNotifications = useCallback(async (page = 1, filters = {}) => {
    try {
      console.log('fetchNotifications called with:', { page, filters });
      setLoading(true);
      const limit = state.notificationsPagination?.limit || 20;
      const data = await adminService.getNotifications(page, limit, filters);
      
      const notificationsData = data.success ? data.data : data;
      const finalData = {
        notifications: Array.isArray(notificationsData?.notifications) ? notificationsData.notifications : [],
        pagination: notificationsData?.pagination || {
          page: 1,
          limit: 20,
          total: 0,
          pages: 0
        }
      };
      
      dispatch({ type: ACTIONS.SET_NOTIFICATIONS, payload: finalData });
    } catch (error) {
      console.error('fetchNotifications error:', error);
      setError(`Failed to fetch notifications: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [state.notificationsPagination?.limit, setLoading, setError]);

  const fetchEmailCampaigns = useCallback(async (page = 1, filters = {}) => {
    try {
      console.log('fetchEmailCampaigns called with:', { page, filters });
      setLoading(true);
      const limit = state.emailCampaignsPagination?.limit || 20;
      const data = await adminService.getEmailCampaigns(page, limit, filters);
      
      const campaignsData = data.success ? data.data : data;
      const finalData = {
        campaigns: Array.isArray(campaignsData?.campaigns) ? campaignsData.campaigns : [],
        pagination: campaignsData?.pagination || {
          page: 1,
          limit: 20,
          total: 0,
          pages: 0
        }
      };
      
      dispatch({ type: ACTIONS.SET_EMAIL_CAMPAIGNS, payload: finalData });
    } catch (error) {
      console.error('fetchEmailCampaigns error:', error);
      setError(`Failed to fetch email campaigns: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [state.emailCampaignsPagination?.limit, setLoading, setError]);

  const fetchHelpContent = useCallback(async (page = 1, filters = {}) => {
    try {
      console.log('fetchHelpContent called with:', { page, filters });
      setLoading(true);
      const limit = state.helpContentPagination?.limit || 20;
      const data = await adminService.getHelpContent(page, limit, filters);
      
      const contentData = data.success ? data.data : data;
      const finalData = {
        content: Array.isArray(contentData?.content) ? contentData.content : [],
        pagination: contentData?.pagination || {
          page: 1,
          limit: 20,
          total: 0,
          pages: 0
        }
      };
      
      dispatch({ type: ACTIONS.SET_HELP_CONTENT, payload: finalData });
    } catch (error) {
      console.error('fetchHelpContent error:', error);
      setError(`Failed to fetch help content: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [state.helpContentPagination?.limit, setLoading, setError]);

  const fetchCommunicationAnalytics = useCallback(async (dateRange = '6m') => {
    try {
      console.log('fetchCommunicationAnalytics called with:', { dateRange });
      const data = await adminService.getCommunicationAnalytics(dateRange);
      
      const analyticsData = data.success ? data.data : data;
      dispatch({ type: ACTIONS.SET_COMMUNICATION_ANALYTICS, payload: analyticsData });
    } catch (error) {
      console.error('fetchCommunicationAnalytics error:', error);
      setError(`Failed to fetch communication analytics: ${error.message}`);
    }
  }, [setError]);

  const createNotification = useCallback(async (notification) => {
    try {
      const result = await adminService.createNotification(notification);
      // Refresh notifications list
      fetchNotifications(1);
      // Surface email delivery errors as a non-fatal warning
      if (result?.emailDeliveryError) {
        setError(`Notification saved but email delivery failed: ${result.emailDeliveryError}`);
      }
      return result;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  }, [fetchNotifications, setError]);

  const createEmailCampaign = useCallback(async (campaign) => {
    try {
      const result = await adminService.createEmailCampaign(campaign);
      // Refresh campaigns list
      fetchEmailCampaigns(1);
      return result;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  }, [fetchEmailCampaigns, setError]);

  const createHelpContent = useCallback(async (content) => {
    try {
      const result = await adminService.createHelpContent(content);
      // Refresh help content list
      fetchHelpContent(1);
      return result;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  }, [fetchHelpContent, setError]);

  // ==========================================
  // ENHANCED FEATURES - NEW FUNCTIONS
  // ==========================================

  // Financial Intelligence
  const fetchFinancialIntelligence = useCallback(async (dateRange = '30') => {
    try {
      setLoading(true);
      const data = await adminService.getFinancialIntelligence(dateRange);
      const financialData = data.success ? data.data : data;
      dispatch({ type: ACTIONS.SET_FINANCIAL_INTELLIGENCE, payload: financialData });
    } catch (error) {
      console.error('fetchFinancialIntelligence error:', error);
      // Don't set error - use fallback data in component
    } finally {
      setLoading(false);
    }
  }, [setLoading]);

  // Security Data
  const fetchSecurityData = useCallback(async (timeRange = '24h') => {
    try {
      setLoading(true);
      const data = await adminService.getSecurityData(timeRange);
      const securityData = data.success ? data.data : data;
      dispatch({ type: ACTIONS.SET_SECURITY_DATA, payload: securityData });
    } catch (error) {
      console.error('fetchSecurityData error:', error);
      // Don't set error - use fallback data in component
    } finally {
      setLoading(false);
    }
  }, [setLoading]);

  const blockIP = useCallback(async (ipAddress, reason, duration = null) => {
    try {
      const result = await adminService.blockIPEnhanced(ipAddress, reason, duration);
      // Refresh security data
      fetchSecurityData();
      return result;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  }, [fetchSecurityData, setError]);

  const unblockIP = useCallback(async (ipAddress, reason) => {
    try {
      const result = await adminService.unblockIPEnhanced(ipAddress, reason);
      // Refresh security data
      fetchSecurityData();
      return result;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  }, [fetchSecurityData, setError]);

  const updateSecuritySettingsEnhanced = useCallback(async (settings) => {
    try {
      const result = await adminService.updateSecuritySettingsEnhanced(settings);
      // Refresh security data
      fetchSecurityData();
      return result;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  }, [fetchSecurityData, setError]);

  // Compliance Data
  const fetchComplianceData = useCallback(async (dateRange = 'last7days') => {
    try {
      setLoading(true);
      const data = await adminService.getComplianceData(dateRange);
      const complianceData = data.success ? data.data : data;
      dispatch({ type: ACTIONS.SET_COMPLIANCE_DATA, payload: complianceData });
    } catch (error) {
      console.error('fetchComplianceData error:', error);
      // Don't set error - use fallback data in component
    } finally {
      setLoading(false);
    }
  }, [setLoading]);

  const processGdprRequest = useCallback(async (requestId, action, notes = '') => {
    try {
      const result = await adminService.processGdprRequest(requestId, action, notes);
      // Refresh compliance data
      fetchComplianceData();
      return result;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  }, [fetchComplianceData, setError]);

  const exportAuditLogs = useCallback(async (format = 'csv', dateRange = 'last30days') => {
    try {
      // Try server-side export first
      const blob = await adminService.exportAuditLogs(format, dateRange);
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `audit_logs_${new Date().toISOString().split('T')[0]}.${format === 'csv' ? 'csv' : format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      return blob;
    } catch (error) {
      // Fallback to client-side export using in-memory audit logs
      try {
        const { exportToCSV, exportToExcel, exportToPDF } = await import('../utils/exportUtils');
        const auditLogs = (state.complianceData && state.complianceData.auditLogs) || state.activityLogs || [];

        if (auditLogs.length === 0) {
          setError('No audit log data available to export. Please load compliance data first.');
          return;
        }

        switch (format) {
          case 'pdf':
            exportToPDF(auditLogs, 'Audit Logs Export');
            break;
          case 'excel':
          case 'xlsx':
            exportToExcel(auditLogs, 'audit_logs');
            break;
          default:
            exportToCSV(auditLogs, 'audit_logs');
        }
      } catch (fallbackError) {
        setError('Export failed: ' + (fallbackError.message || 'Unknown error'));
        throw fallbackError;
      }
    }
  }, [state.complianceData, state.activityLogs, setError]);

  // Admin Roles Management
  const fetchAdminRoles = useCallback(async () => {
    try {
      const data = await adminService.getAdminRoles();
      const roles = data.success ? data.data : data;
      dispatch({ type: ACTIONS.SET_ADMIN_ROLES, payload: roles });
    } catch (error) {
      console.error('fetchAdminRoles error:', error);
    }
  }, []);

  const fetchAdminUsers = useCallback(async () => {
    try {
      const data = await adminService.getAdminUsers();
      const users = data.success ? data.data : data;
      dispatch({ type: ACTIONS.SET_ADMIN_USERS, payload: users });
    } catch (error) {
      console.error('fetchAdminUsers error:', error);
    }
  }, []);

  const updateAdminRole = useCallback(async (userId, role, permissions = null) => {
    try {
      const result = await adminService.updateAdminRole(userId, role, permissions);
      fetchAdminUsers();
      return result;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  }, [fetchAdminUsers, setError]);

  const createAdminUser = useCallback(async (userId, role) => {
    try {
      const result = await adminService.createAdminUser(userId, role);
      fetchAdminUsers();
      return result;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  }, [fetchAdminUsers, setError]);

  const removeAdminPrivileges = useCallback(async (userId) => {
    try {
      const result = await adminService.removeAdminPrivileges(userId);
      fetchAdminUsers();
      return result;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  }, [fetchAdminUsers, setError]);

  // Escalation Management (PROJECT OLYMPUS)
  const fetchEscalations = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
      const token = localStorage.getItem('token');
      
      const queryParams = new URLSearchParams(filters).toString();
      const url = `${API_URL}/admin/escalations${queryParams ? `?${queryParams}` : ''}`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch escalations: ${response.statusText}`);
      }
      
      const data = await response.json();
      dispatch({ 
        type: ACTIONS.SET_ESCALATIONS, 
        payload: {
          escalations: data.escalations || [],
          pagination: data.pagination || {}
        }
      });
    } catch (error) {
      console.error('fetchEscalations error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError]);

  const fetchEscalationStats = useCallback(async () => {
    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_URL}/admin/escalations/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch escalation stats');
      }
      
      const data = await response.json();
      dispatch({ type: ACTIONS.SET_ESCALATION_STATS, payload: data.stats || {} });
    } catch (error) {
      console.error('fetchEscalationStats error:', error);
    }
  }, []);

  const checkEscalationChannels = useCallback(async () => {
    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_URL}/admin/escalations/test/channels`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to check channels');
      }
      
      const data = await response.json();
      dispatch({ type: ACTIONS.SET_ESCALATION_CHANNELS, payload: data });
    } catch (error) {
      console.error('checkEscalationChannels error:', error);
    }
  }, []);

  const respondToEscalation = useCallback(async (escalationId, response, decision) => {
    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
      const token = localStorage.getItem('token');
      
      const res = await fetch(`${API_URL}/admin/escalations/${escalationId}/respond`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ response, decision })
      });
      
      if (!response.ok) {
        throw new Error('Failed to respond to escalation');
      }
      
      const data = await res.json();
      dispatch({ type: ACTIONS.UPDATE_ESCALATION, payload: data.escalation });
      
      // Refresh stats
      fetchEscalationStats();
      
      return data;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  }, [fetchEscalationStats, setError]);

  const sendTestEscalation = useCallback(async (severity = 'warning') => {
    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_URL}/admin/escalations/test`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ severity })
      });
      
      if (!response.ok) {
        throw new Error('Failed to send test escalation');
      }
      
      const data = await response.json();
      
      // Add to local state immediately
      if (data.escalation) {
        dispatch({ type: ACTIONS.ADD_ESCALATION, payload: data.escalation });
      }
      
      return data;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  }, [setError]);

  const initializeAdminRoles = useCallback(async () => {
    try {
      const result = await adminService.initializeAdminRoles();
      fetchAdminRoles();
      return result;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  }, [fetchAdminRoles, setError]);

  // Export data
  const exportData = useCallback(async (type, format = 'csv') => {
    // For PDF, always use client-side jsPDF generator (server doesn't produce PDF blobs)
    if (format === 'pdf') {
      try {
        const { downloadReport } = await import('../utils/pdfReportGenerator');
        switch (type) {
          case 'dashboard':
            downloadReport('dashboard', { stats: state.adminStats || {} });
            break;
          case 'users':
            downloadReport('users', { users: state.users || [] });
            break;
          case 'transactions':
            downloadReport('transactions', { transactions: state.transactions || [] });
            break;
          case 'activity-logs':
            downloadReport('activity-logs', { logs: state.activityLogs || [] });
            break;
          case 'compliance':
            downloadReport('compliance', state.complianceData || {});
            break;
          default:
            downloadReport(type, { stats: state.adminStats || {}, tableData: [{ ...(state.adminStats || {}) }], reportType: type });
        }
      } catch (err) {
        setError('PDF generation failed: ' + (err.message || 'Unknown error'));
      }
      return;
    }

    try {
      // Try server-side export for CSV/Excel
      const blob = await adminService.exportData(type, format);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${type}_export_${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      // Fallback to client-side export using in-memory data
      try {
        const { exportToCSV, exportToExcel, flattenUser, flattenTransaction } = await import('../utils/exportUtils');

        let data = [];
        const filename = type;

        switch (type) {
          case 'dashboard':
            data = [{ ...(state.adminStats || {}) }];
            break;
          case 'users':
            data = (state.users || []).map(flattenUser);
            break;
          case 'transactions':
            data = (state.transactions || []).map(flattenTransaction);
            break;
          case 'activity-logs':
            data = state.activityLogs || [];
            break;
          case 'compliance':
            data = (state.complianceData && state.complianceData.auditLogs) || [];
            break;
          default:
            data = [{ ...(state.adminStats || {}) }];
        }

        if (data.length === 0) {
          setError('No data available to export. Please load the data first.');
          return;
        }

        switch (format) {
          case 'excel':
          case 'xlsx':
            exportToExcel(data, filename);
            break;
          default:
            exportToCSV(data, filename);
        }
      } catch (fallbackError) {
        setError('Export failed: ' + (fallbackError.message || 'Unknown error'));
      }
    }
  }, [state.adminStats, state.users, state.transactions, state.activityLogs, state.complianceData, setError]);

  // Refresh all data
  const refreshData = useCallback(async () => {
    await Promise.all([
      fetchAdminStats(),
      fetchRealtimeData(),
      fetchSecurityAlerts()
    ]);
  }, [fetchAdminStats, fetchRealtimeData, fetchSecurityAlerts]);

  // Filter management
  const updateFilters = useCallback((section, filters) => {
    dispatch({ 
      type: ACTIONS.UPDATE_FILTERS, 
      payload: { section, filters } 
    });
  }, []);

  // WebSocket connection for real-time updates — reactive to auth state
  const wsConnected = useRef(false);
  
  useEffect(() => {
    // Only connect when authenticated and token is available
    const token = localStorage.getItem('token');
    if (!isAuthenticated || !token) {
      // If we were connected but auth was lost, disconnect
      if (wsConnected.current) {
        websocketService.disconnect();
        wsConnected.current = false;
      }
      return;
    }

    // Determine WebSocket URL based on environment
    let wsUrl;
    
    if (process.env.REACT_APP_WS_URL) {
      // Use explicit WebSocket URL from env (already includes protocol)
      wsUrl = `${process.env.REACT_APP_WS_URL}/admin/realtime`;
    } else if (process.env.REACT_APP_API_URL) {
      // Derive from API URL - detect if it's HTTPS/Railway or local HTTP
      const apiUrl = process.env.REACT_APP_API_URL;
      const isHttps = apiUrl.startsWith('https://');
      const wsProtocol = isHttps ? 'wss:' : 'ws:';
      const baseUrl = apiUrl
        .replace(/^https?:/, wsProtocol)  // Replace protocol
        .replace(/\/api$/, '');            // Remove /api suffix
      wsUrl = `${baseUrl}/admin/realtime`;
    } else {
      // Fallback to window location
      const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      wsUrl = `${wsProtocol}//${window.location.hostname}:${process.env.REACT_APP_API_PORT || 5000}/admin/realtime`;
    }

    // Connect to WebSocket
    websocketService.connect(wsUrl, token);
    wsConnected.current = true;

    // Subscribe to connection lifecycle events
    const unsubscribeConnected = websocketService.on('connected', () => {
      dispatch({ type: ACTIONS.SET_ERROR, payload: null });
    });

    const unsubscribeDisconnected = websocketService.on('disconnected', () => {
      wsConnected.current = false;
    });

    const unsubscribeError = websocketService.on('error', (data) => {
      console.error('WebSocket error:', data);
    });

    const unsubscribeReconnecting = websocketService.on('reconnecting', () => {});

    // Subscribe to admin-specific events — drives live dashboard updates
    const unsubscribeStats = websocketService.on('admin:stats', (data) => {
      dispatch({ type: ACTIONS.SET_ADMIN_STATS, payload: data });
    });

    const unsubscribeRealtime = websocketService.on('admin:realtime', (data) => {
      dispatch({ type: ACTIONS.SET_REALTIME_DATA, payload: data });
    });

    const unsubscribeUserUpdate = websocketService.on('admin:user:update', (data) => {
      dispatch({ type: ACTIONS.UPDATE_USER, payload: data });
    });

    const unsubscribeTransactionUpdate = websocketService.on('admin:transaction:update', (data) => {
      dispatch({ type: ACTIONS.UPDATE_TRANSACTION, payload: data });
    });

    // Live counter increments — makes the overview feel "live"
    const unsubscribeUserNew = websocketService.on('user:new', () => {
      dispatch({ type: ACTIONS.INCREMENT_STAT, payload: { field: 'totalUsers' } });
      dispatch({ type: ACTIONS.INCREMENT_STAT, payload: { field: 'newUsers' } });
    });

    const unsubscribeTransactionNew = websocketService.on('transaction:new', () => {
      dispatch({ type: ACTIONS.INCREMENT_STAT, payload: { field: 'totalTransactions' } });
    });

    const unsubscribeSecurityAlert = websocketService.on('admin:security:alert', (data) => {
      dispatch({ 
        type: ACTIONS.SET_SECURITY_ALERTS, 
        payload: [data, ...(state.securityAlerts || [])] 
      });
    });

    // Fallback polling if WebSocket is not available after 10 seconds
    const fallbackTimer = setTimeout(() => {
      if (!websocketService.isConnected()) {
        const pollingInterval = setInterval(() => {
          if (!websocketService.isConnected() && fetchRealtimeData) {
            fetchRealtimeData();
          }
        }, 60000); // 1 minute

        return () => clearInterval(pollingInterval);
      }
    }, 10000);

    // Cleanup
    return () => {
      clearTimeout(fallbackTimer);
      unsubscribeConnected();
      unsubscribeDisconnected();
      unsubscribeError();
      unsubscribeReconnecting();
      unsubscribeStats();
      unsubscribeRealtime();
      unsubscribeUserUpdate();
      unsubscribeTransactionUpdate();
      unsubscribeUserNew();
      unsubscribeTransactionNew();
      unsubscribeSecurityAlert();
      
      if (wsConnected.current) {
        websocketService.disconnect();
        wsConnected.current = false;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]); // Re-run when auth state changes (login/logout)

  // Initial data fetch
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const value = {
    // State
    ...state,
    
    // Actions
    setLoading,
    setError,
    clearError,
    fetchAdminStats,
    fetchRealtimeData,
    fetchUsers,
    fetchTransactions,
    fetchAnalytics,
    fetchActivityLogs,
    fetchSecurityAlerts,
    fetchSystemSettings,
    updateUser,
    grantSubscription,
    resetUserPassword,
    forceVerifyEmail,
    forceLogout,
    sendEmailToUser,
    addAdminNote,
    getAdminNotes,
    deleteUserData,
    getUserStats,
    deleteUser,
    updateTransaction,
    updateSystemSettings,
    createBackup: async () => console.log('createBackup not implemented'),
    restoreBackup: async () => console.log('restoreBackup not implemented'),
    exportData,
    refreshData,
    updateFilters,
    
    // Content Management
    fetchNotifications,
    fetchEmailCampaigns,
    fetchHelpContent,
    fetchCommunicationAnalytics,
    createNotification,
    createEmailCampaign,
    createHelpContent,

    // Enhanced Features (NEW)
    // Financial Intelligence
    fetchFinancialIntelligence,
    
    // Security Center
    fetchSecurityData,
    blockIP,
    unblockIP,
    updateSecuritySettings: updateSecuritySettingsEnhanced,
    
    // Compliance & Audit
    fetchComplianceData,
    processGdprRequest,
    exportAuditLogs,
    
    // Admin Roles Management
    fetchAdminRoles,
    fetchAdminUsers,
    updateAdminRole,
    createAdminUser,
    removeAdminPrivileges,
    initializeAdminRoles,

    // Escalation Management (PROJECT OLYMPUS)
    fetchEscalations,
    fetchEscalationStats,
    checkEscalationChannels,
    respondToEscalation,
    sendTestEscalation
  };

  // Ensure all arrays in state are properly initialized
  const safeValue = {
    ...value,
    users: Array.isArray(value.users) ? value.users : [],
    transactions: Array.isArray(value.transactions) ? value.transactions : [],
    activityLogs: Array.isArray(value.activityLogs) ? value.activityLogs : [],
    securityAlerts: Array.isArray(value.securityAlerts) ? value.securityAlerts : [],
    notifications: Array.isArray(value.notifications) ? value.notifications : [],
    emailCampaigns: Array.isArray(value.emailCampaigns) ? value.emailCampaigns : [],
    helpContent: Array.isArray(value.helpContent) ? value.helpContent : [],
    adminRoles: Array.isArray(value.adminRoles) ? value.adminRoles : [],
    adminUsers: Array.isArray(value.adminUsers) ? value.adminUsers : [],
    escalations: Array.isArray(value.escalations) ? value.escalations : [],
    analytics: {
      ...value.analytics,
      userRegistrations: Array.isArray(value.analytics?.userRegistrations) ? value.analytics.userRegistrations : [],
      transactionVolume: Array.isArray(value.analytics?.transactionVolume) ? value.analytics.transactionVolume : [],
      revenueData: Array.isArray(value.analytics?.revenueData) ? value.analytics.revenueData : [],
      categoryBreakdown: Array.isArray(value.analytics?.categoryBreakdown) ? value.analytics.categoryBreakdown : [],
      geographicData: Array.isArray(value.analytics?.geographicData) ? value.analytics.geographicData : [],
      deviceStats: Array.isArray(value.analytics?.deviceStats) ? value.analytics.deviceStats : []
    },
    financialIntelligence: {
      ...value.financialIntelligence,
      revenueData: Array.isArray(value.financialIntelligence?.revenueData) ? value.financialIntelligence.revenueData : [],
      subscriptionData: Array.isArray(value.financialIntelligence?.subscriptionData) ? value.financialIntelligence.subscriptionData : [],
      kpiMetrics: Array.isArray(value.financialIntelligence?.kpiMetrics) ? value.financialIntelligence.kpiMetrics : [],
      cohortData: Array.isArray(value.financialIntelligence?.cohortData) ? value.financialIntelligence.cohortData : [],
      cashFlowData: Array.isArray(value.financialIntelligence?.cashFlowData) ? value.financialIntelligence.cashFlowData : []
    },
    securityData: {
      ...value.securityData,
      alerts: Array.isArray(value.securityData?.alerts) ? value.securityData.alerts : [],
      blockedIPs: Array.isArray(value.securityData?.blockedIPs) ? value.securityData.blockedIPs : [],
      loginAttempts: Array.isArray(value.securityData?.loginAttempts) ? value.securityData.loginAttempts : []
    },
    complianceData: {
      ...value.complianceData,
      auditLogs: Array.isArray(value.complianceData?.auditLogs) ? value.complianceData.auditLogs : [],
      gdprRequests: Array.isArray(value.complianceData?.gdprRequests) ? value.complianceData.gdprRequests : [],
      complianceMetrics: Array.isArray(value.complianceData?.complianceMetrics) ? value.complianceData.complianceMetrics : []
    }
  };

  return (
    <AdminContext.Provider value={safeValue}>
      {children}
    </AdminContext.Provider>
  );
};

export default AdminContext;
