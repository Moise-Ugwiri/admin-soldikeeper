/**
 * AI Agent Context
 * 
 * React context for managing AI Agent state and communication
 */

import React, { createContext, useContext, useReducer, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';

// API base URL - matches other contexts in the project
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://soldikeeper-backend-production.up.railway.app/api';

// Action types
const AGENT_ACTIONS = {
  SET_STATUS: 'SET_STATUS',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_INSIGHTS: 'SET_INSIGHTS',
  ADD_INSIGHT: 'ADD_INSIGHT',
  SET_ALERTS: 'SET_ALERTS',
  ADD_ALERT: 'ADD_ALERT',
  SET_CONVERSATION: 'SET_CONVERSATION',
  ADD_MESSAGE: 'ADD_MESSAGE',
  SET_METRICS: 'SET_METRICS',
  SET_PREDICTIONS: 'SET_PREDICTIONS',
  SET_CONFIG: 'SET_CONFIG',
  SET_CONNECTED: 'SET_CONNECTED',
  CLEAR_ERROR: 'CLEAR_ERROR'
};

// Initial state
const initialState = {
  status: {
    name: 'SoldiKeeper AI Admin',
    version: '1.0.0',
    status: 'unknown',
    isRunning: false,
    lastAnalysis: null,
    metrics: {
      analysisCount: 0,
      alertsGenerated: 0,
      actionsExecuted: 0,
      insightsGenerated: 0
    },
    modules: []
  },
  insights: [],
  alerts: [],
  conversation: [],
  predictions: null,
  config: {
    autoActionEnabled: false,
    monitoringInterval: 60000
  },
  loading: false,
  error: null,
  connected: false
};

// Reducer
const agentReducer = (state, action) => {
  switch (action.type) {
    case AGENT_ACTIONS.SET_STATUS:
      return { ...state, status: action.payload, loading: false };
    
    case AGENT_ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };
    
    case AGENT_ACTIONS.SET_ERROR:
      return { ...state, error: action.payload, loading: false };
    
    case AGENT_ACTIONS.CLEAR_ERROR:
      return { ...state, error: null };
    
    case AGENT_ACTIONS.SET_INSIGHTS:
      return { ...state, insights: action.payload };
    
    case AGENT_ACTIONS.ADD_INSIGHT:
      return { 
        ...state, 
        insights: [action.payload, ...state.insights].slice(0, 100) 
      };
    
    case AGENT_ACTIONS.SET_ALERTS:
      return { ...state, alerts: action.payload };
    
    case AGENT_ACTIONS.ADD_ALERT:
      return { 
        ...state, 
        alerts: [action.payload, ...state.alerts].slice(0, 50) 
      };
    
    case AGENT_ACTIONS.SET_CONVERSATION:
      return { ...state, conversation: action.payload };
    
    case AGENT_ACTIONS.ADD_MESSAGE:
      return { 
        ...state, 
        conversation: [...state.conversation, action.payload] 
      };
    
    case AGENT_ACTIONS.SET_METRICS:
      return { 
        ...state, 
        status: { ...state.status, metrics: action.payload } 
      };
    
    case AGENT_ACTIONS.SET_PREDICTIONS:
      return { ...state, predictions: action.payload };
    
    case AGENT_ACTIONS.SET_CONFIG:
      return { ...state, config: action.payload };
    
    case AGENT_ACTIONS.SET_CONNECTED:
      return { ...state, connected: action.payload };
    
    default:
      return state;
  }
};

// Create context
const AIAgentContext = createContext(null);

/**
 * AI Agent Provider Component
 */
export const AIAgentProvider = ({ children }) => {
  const [state, dispatch] = useReducer(agentReducer, initialState);
  const pollingInterval = useRef(null);

  // Get auth token
  const getAuthHeader = useCallback(() => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  // API helper - API_BASE_URL already includes /api
  const apiCall = useCallback(async (method, endpoint, data = null) => {
    try {
      const config = {
        method,
        url: `${API_BASE_URL}/ai-agent${endpoint}`,
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        }
      };

      if (data) {
        config.data = data;
      }

      const response = await axios(config);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.error || error.message;
      throw new Error(message);
    }
  }, [getAuthHeader]);

  // Fetch agent status
  const fetchStatus = useCallback(async () => {
    try {
      const result = await apiCall('get', '/status');
      if (result.success) {
        dispatch({ type: AGENT_ACTIONS.SET_STATUS, payload: result.data });
        dispatch({ type: AGENT_ACTIONS.SET_CONNECTED, payload: true });
      }
      return result.data;
    } catch (error) {
      dispatch({ type: AGENT_ACTIONS.SET_CONNECTED, payload: false });
      console.error('Failed to fetch agent status:', error);
      return null;
    }
  }, [apiCall]);

  // Start agent
  const startAgent = useCallback(async () => {
    dispatch({ type: AGENT_ACTIONS.SET_LOADING, payload: true });
    try {
      const result = await apiCall('post', '/start');
      if (result.success) {
        dispatch({ type: AGENT_ACTIONS.SET_STATUS, payload: result.data });
      }
      return result;
    } catch (error) {
      dispatch({ type: AGENT_ACTIONS.SET_ERROR, payload: error.message });
      throw error;
    }
  }, [apiCall]);

  // Stop agent
  const stopAgent = useCallback(async () => {
    dispatch({ type: AGENT_ACTIONS.SET_LOADING, payload: true });
    try {
      const result = await apiCall('post', '/stop');
      if (result.success) {
        dispatch({ type: AGENT_ACTIONS.SET_STATUS, payload: result.data });
      }
      return result;
    } catch (error) {
      dispatch({ type: AGENT_ACTIONS.SET_ERROR, payload: error.message });
      throw error;
    }
  }, [apiCall]);

  // Send command
  const sendCommand = useCallback(async (command) => {
    // Add user message to conversation
    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: command,
      timestamp: new Date().toISOString()
    };
    dispatch({ type: AGENT_ACTIONS.ADD_MESSAGE, payload: userMessage });

    try {
      const result = await apiCall('post', '/command', { command });
      
      // Add agent response to conversation
      const agentMessage = {
        id: Date.now() + 1,
        type: 'agent',
        content: result.data.message,
        responseType: result.data.type,
        data: result.data.data,
        suggestions: result.data.suggestions,
        timestamp: new Date().toISOString()
      };
      dispatch({ type: AGENT_ACTIONS.ADD_MESSAGE, payload: agentMessage });

      return result.data;
    } catch (error) {
      // Add error message to conversation
      const errorMessage = {
        id: Date.now() + 1,
        type: 'agent',
        content: `Sorry, I encountered an error: ${error.message}`,
        responseType: 'error',
        timestamp: new Date().toISOString()
      };
      dispatch({ type: AGENT_ACTIONS.ADD_MESSAGE, payload: errorMessage });
      throw error;
    }
  }, [apiCall]);

  // Fetch insights
  const fetchInsights = useCallback(async (options = {}) => {
    try {
      const queryParams = new URLSearchParams(options).toString();
      const result = await apiCall('get', `/insights${queryParams ? `?${queryParams}` : ''}`);
      if (result.success) {
        dispatch({ type: AGENT_ACTIONS.SET_INSIGHTS, payload: result.data });
      }
      return result.data;
    } catch (error) {
      console.error('Failed to fetch insights:', error);
      return [];
    }
  }, [apiCall]);

  // Fetch alerts
  const fetchAlerts = useCallback(async (options = {}) => {
    try {
      const queryParams = new URLSearchParams(options).toString();
      const result = await apiCall('get', `/alerts${queryParams ? `?${queryParams}` : ''}`);
      if (result.success) {
        dispatch({ type: AGENT_ACTIONS.SET_ALERTS, payload: result.data });
      }
      return result.data;
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
      return [];
    }
  }, [apiCall]);

  // Acknowledge item
  const acknowledgeItem = useCallback(async (type, id) => {
    try {
      const result = await apiCall('post', `/acknowledge/${type}/${id}`);
      if (result.success) {
        // Refresh the appropriate list
        if (type === 'insight') {
          await fetchInsights();
        } else {
          await fetchAlerts();
        }
      }
      return result;
    } catch (error) {
      dispatch({ type: AGENT_ACTIONS.SET_ERROR, payload: error.message });
      throw error;
    }
  }, [apiCall, fetchInsights, fetchAlerts]);

  // Execute action
  const executeAction = useCallback(async (action) => {
    dispatch({ type: AGENT_ACTIONS.SET_LOADING, payload: true });
    try {
      const result = await apiCall('post', '/execute', { action });
      dispatch({ type: AGENT_ACTIONS.SET_LOADING, payload: false });
      return result;
    } catch (error) {
      dispatch({ type: AGENT_ACTIONS.SET_ERROR, payload: error.message });
      throw error;
    }
  }, [apiCall]);

  // Run analysis
  const runAnalysis = useCallback(async () => {
    dispatch({ type: AGENT_ACTIONS.SET_LOADING, payload: true });
    try {
      const result = await apiCall('post', '/analyze');
      dispatch({ type: AGENT_ACTIONS.SET_LOADING, payload: false });
      // Refresh insights and alerts after analysis
      await Promise.all([fetchInsights(), fetchAlerts()]);
      return result;
    } catch (error) {
      dispatch({ type: AGENT_ACTIONS.SET_ERROR, payload: error.message });
      throw error;
    }
  }, [apiCall, fetchAlerts, fetchInsights]);

  // Update config
  const updateConfig = useCallback(async (config) => {
    try {
      const result = await apiCall('put', '/config', { config });
      if (result.success) {
        dispatch({ type: AGENT_ACTIONS.SET_CONFIG, payload: result.data });
      }
      return result;
    } catch (error) {
      dispatch({ type: AGENT_ACTIONS.SET_ERROR, payload: error.message });
      throw error;
    }
  }, [apiCall]);

  // Fetch predictions
  const fetchPredictions = useCallback(async (type, days = 30) => {
    try {
      const result = await apiCall('get', `/predictions?type=${type || ''}&days=${days}`);
      if (result.success) {
        dispatch({ type: AGENT_ACTIONS.SET_PREDICTIONS, payload: result.data });
      }
      return result.data;
    } catch (error) {
      console.error('Failed to fetch predictions:', error);
      return null;
    }
  }, [apiCall]);

  // Fetch metrics
  const fetchMetrics = useCallback(async () => {
    try {
      const result = await apiCall('get', '/metrics');
      if (result.success) {
        dispatch({ type: AGENT_ACTIONS.SET_METRICS, payload: result.data.metrics });
      }
      return result.data;
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
      return null;
    }
  }, [apiCall]);

  // Fetch smart insights - data-driven actionable insights
  const fetchSmartInsights = useCallback(async () => {
    try {
      const result = await apiCall('get', '/smart-insights');
      if (result.success) {
        dispatch({ type: AGENT_ACTIONS.SET_INSIGHTS, payload: result.data });
      }
      return result.data;
    } catch (error) {
      console.error('Failed to fetch smart insights:', error);
      return [];
    }
  }, [apiCall]);

  // Fetch business metrics - KPIs and platform health
  const fetchBusinessMetrics = useCallback(async () => {
    try {
      const result = await apiCall('get', '/business-metrics');
      return result.data;
    } catch (error) {
      console.error('Failed to fetch business metrics:', error);
      return null;
    }
  }, [apiCall]);

  // Fetch available actions
  const fetchAvailableActions = useCallback(async () => {
    try {
      const result = await apiCall('get', '/available-actions');
      return result.data;
    } catch (error) {
      console.error('Failed to fetch available actions:', error);
      return [];
    }
  }, [apiCall]);

  // Clear error
  const clearError = useCallback(() => {
    dispatch({ type: AGENT_ACTIONS.CLEAR_ERROR });
  }, []);

  // Start polling for status updates
  const startPolling = useCallback((interval = 30000) => {
    if (pollingInterval.current) {
      clearInterval(pollingInterval.current);
    }

    pollingInterval.current = setInterval(() => {
      fetchStatus();
      fetchAlerts({ limit: 10 });
    }, interval);
  }, [fetchStatus, fetchAlerts]);

  // Stop polling
  const stopPolling = useCallback(() => {
    if (pollingInterval.current) {
      clearInterval(pollingInterval.current);
      pollingInterval.current = null;
    }
  }, []);

  // Initialize on mount - only run once
  useEffect(() => {
    // Initial fetch
    fetchStatus();
    fetchSmartInsights();
    fetchAlerts({ limit: 20 });
    
    // Set up polling with longer interval (2 minutes) - WebSocket handles real-time updates
    const pollInterval = setInterval(() => {
      fetchStatus();
    }, 120000); // 2 minutes

    return () => {
      clearInterval(pollInterval);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty deps - run only on mount

  const value = {
    // State
    ...state,
    
    // Actions
    fetchStatus,
    startAgent,
    stopAgent,
    runAnalysis,
    sendCommand,
    fetchInsights,
    fetchAlerts,
    acknowledgeItem,
    executeAction,
    updateConfig,
    fetchPredictions,
    fetchMetrics,
    fetchSmartInsights,
    fetchBusinessMetrics,
    fetchAvailableActions,
    clearError,
    startPolling,
    stopPolling
  };

  return (
    <AIAgentContext.Provider value={value}>
      {children}
    </AIAgentContext.Provider>
  );
};

/**
 * Hook to use AI Agent context
 */
export const useAIAgent = () => {
  const context = useContext(AIAgentContext);
  if (!context) {
    throw new Error('useAIAgent must be used within an AIAgentProvider');
  }
  return context;
};

export default AIAgentContext;
