/* eslint-disable */
/**
 * 📊 AGENT ACTIVITY TAB
 * Monitor agent executions and performance
 * Features:
 * - Current status indicator
 * - Current task display
 * - Recent autonomous actions list
 * - Performance metrics
 * - Real-time updates via WebSocket
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  LinearProgress,
  CircularProgress,
  Grid,
  List,
  ListItem,
  ListItemText,
  Button,
  Select,
  MenuItem,
  FormControl,
  alpha,
  Divider
} from '@mui/material';
import {
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Schedule as PendingIcon,
  TrendingUp as TrendingUpIcon,
  AccessTime as TimeIcon,
  Flag as FlagIcon
} from '@mui/icons-material';
import axios from 'axios';
import { io } from 'socket.io-client';
const AgentActivityTab = ({ agent }) => {
  const token = localStorage.getItem('token');
  const [loading, setLoading] = useState(true);
  const [executions, setExecutions] = useState([]);
  const [metrics, setMetrics] = useState({
    totalTasks: 0,
    successRate: 0,
    avgResponseTime: 0,
    escalationRate: 0
  });
  const [currentTask, setCurrentTask] = useState(null);
  const [timeFilter, setTimeFilter] = useState('24h');
  const [socket, setSocket] = useState(null);

  // Load execution history
  useEffect(() => {
    loadExecutions();
  }, [agent.id, timeFilter]);

  // WebSocket for real-time updates
  useEffect(() => {
    if (!token) return;

    const wsUrl = process.env.REACT_APP_WS_URL || 
                  (window.location.protocol === 'https:' 
                    ? 'wss://soldikeeper-backend-production.up.railway.app' 
                    : 'ws://localhost:3001');
    
    const newSocket = io(wsUrl, {
      path: '/admin/realtime',
      auth: { token },
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      console.log('✅ WebSocket connected for agent activity');
    });

    // Listen for execution events
    newSocket.on(`agent:execution:start`, (data) => {
      if (data.agentId === agent.id) {
        setCurrentTask(data);
      }
    });

    newSocket.on(`agent:execution:complete`, (data) => {
      if (data.agentId === agent.id) {
        setCurrentTask(null);
        setExecutions(prev => [data, ...prev].slice(0, 50));
        // Refresh metrics
        loadExecutions();
      }
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [token, agent.id]);

  const loadExecutions = async () => {
    try {
      setLoading(true);
      
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL || 'https://soldikeeper-backend-production.up.railway.app/api'}/admin/agent-management/${agent.id}/executions`,
        {
          params: { timeRange: timeFilter },
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        const execData = response.data.data || response.data.executions || [];
        const execList = Array.isArray(execData) ? execData : (execData.executions || []);
        setExecutions(execList);
        
        // Calculate metrics
        const execs = execList;
        const successful = execs.filter(e => e.status === 'success').length;
        const escalated = execs.filter(e => e.escalated).length;
        const totalTime = execs.reduce((sum, e) => sum + (e.duration || 0), 0);

        setMetrics({
          totalTasks: execs.length,
          successRate: execs.length > 0 ? (successful / execs.length * 100).toFixed(1) : 0,
          avgResponseTime: execs.length > 0 ? (totalTime / execs.length / 1000).toFixed(1) : 0,
          escalationRate: execs.length > 0 ? (escalated / execs.length * 100).toFixed(1) : 0
        });
      }
    } catch (error) {
      console.error('Failed to load executions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <SuccessIcon fontSize="small" sx={{ color: '#4CAF50' }} />;
      case 'failed':
        return <ErrorIcon fontSize="small" sx={{ color: '#F44336' }} />;
      case 'escalated':
        return <FlagIcon fontSize="small" sx={{ color: '#FF9800' }} />;
      default:
        return <PendingIcon fontSize="small" sx={{ color: '#9E9E9E' }} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return '#4CAF50';
      case 'failed': return '#F44336';
      case 'escalated': return '#FF9800';
      default: return '#9E9E9E';
    }
  };

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'high': return '#F44336';
      case 'medium': return '#FF9800';
      case 'low': return '#4CAF50';
      default: return '#9E9E9E';
    }
  };

  const formatTimeAgo = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 400,
          flexDirection: 'column',
          gap: 2
        }}
      >
        <CircularProgress sx={{ color: agent.color }} />
        <Typography variant="body2" color="text.secondary">
          Loading activity data...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Current Status */}
      <Paper elevation={0} sx={{ p: 2, mb: 3, border: 1, borderColor: 'divider' }}>
        <Typography variant="body2" fontWeight={600} mb={2}>
          Current Status
        </Typography>
        <Box display="flex" alignItems="center" gap={2}>
          <Chip
            label={agent.status.toUpperCase()}
            size="small"
            sx={{
              backgroundColor: alpha(
                agent.status === 'busy' ? '#FF9800' : '#4CAF50',
                0.1
              ),
              color: agent.status === 'busy' ? '#FF9800' : '#4CAF50',
              fontWeight: 600
            }}
          />
          <Typography variant="body2" color="text.secondary">
            Load: {agent.load}%
          </Typography>
        </Box>

        {/* Current Task */}
        {(currentTask || agent.currentTask) && (
          <Box mt={2}>
            <Typography variant="caption" display="block" mb={1} fontWeight={600}>
              Current Task:
            </Typography>
            <Paper
              elevation={0}
              sx={{
                p: 1.5,
                backgroundColor: alpha(agent.color, 0.05),
                border: 1,
                borderColor: alpha(agent.color, 0.2)
              }}
            >
              <Typography variant="body2" mb={1}>
                {currentTask?.description || agent.currentTask || 'Processing...'}
              </Typography>
              {currentTask && (
                <>
                  <LinearProgress
                    variant={currentTask.progress ? 'determinate' : 'indeterminate'}
                    value={currentTask.progress || 0}
                    sx={{
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: alpha(agent.color, 0.1),
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: agent.color
                      }
                    }}
                  />
                  <Box display="flex" justifyContent="space-between" mt={1}>
                    <Typography variant="caption" color="text.secondary">
                      Started {formatTimeAgo(currentTask.startTime)}
                    </Typography>
                    {currentTask.toolsUsed && (
                      <Typography variant="caption" color="text.secondary">
                        Tools: {currentTask.toolsUsed.join(', ')}
                      </Typography>
                    )}
                  </Box>
                </>
              )}
            </Paper>
          </Box>
        )}
      </Paper>

      {/* Performance Metrics */}
      <Paper elevation={0} sx={{ p: 2, mb: 3, border: 1, borderColor: 'divider' }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="body2" fontWeight={600}>
            Performance Metrics
          </Typography>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <Select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              sx={{ fontSize: '0.875rem' }}
            >
              <MenuItem value="24h">Last 24h</MenuItem>
              <MenuItem value="7d">Last 7 days</MenuItem>
              <MenuItem value="30d">Last 30 days</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Box textAlign="center">
              <Typography variant="h5" fontWeight={700} color={agent.color}>
                {metrics.totalTasks}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Total Tasks
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box textAlign="center">
              <Typography variant="h5" fontWeight={700} color="#4CAF50">
                {metrics.successRate}%
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Success Rate
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box textAlign="center">
              <Typography variant="h5" fontWeight={700} color={agent.color}>
                {metrics.avgResponseTime}s
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Avg Response
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box textAlign="center">
              <Typography variant="h5" fontWeight={700} color="#FF9800">
                {metrics.escalationRate}%
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Escalation Rate
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Recent Activity */}
      <Paper elevation={0} sx={{ p: 2, border: 1, borderColor: 'divider' }}>
        <Typography variant="body2" fontWeight={600} mb={2}>
          Recent Autonomous Actions
        </Typography>

        {executions.length === 0 ? (
          <Box textAlign="center" py={4}>
            <Typography variant="body2" color="text.secondary">
              No recent activity
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {executions.slice(0, 10).map((execution, index) => (
              <React.Fragment key={execution.id || index}>
                <ListItem
                  sx={{
                    px: 0,
                    py: 1.5,
                    flexDirection: 'column',
                    alignItems: 'flex-start'
                  }}
                >
                  <Box display="flex" alignItems="center" gap={1} mb={0.5} width="100%">
                    {getStatusIcon(execution.status)}
                    <Typography
                      variant="body2"
                      sx={{
                        flex: 1,
                        fontWeight: 500
                      }}
                    >
                      {execution.description || execution.action || 'Task executed'}
                    </Typography>
                    <Chip
                      label={execution.risk || 'low'}
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: '0.7rem',
                        backgroundColor: alpha(getRiskColor(execution.risk), 0.1),
                        color: getRiskColor(execution.risk),
                        fontWeight: 600
                      }}
                    />
                  </Box>
                  <Box display="flex" gap={2} flexWrap="wrap" width="100%">
                    <Typography variant="caption" color="text.secondary">
                      <TimeIcon sx={{ fontSize: 12, verticalAlign: 'middle', mr: 0.5 }} />
                      {formatTimeAgo(execution.timestamp || execution.createdAt)}
                    </Typography>
                    {execution.duration && (
                      <Typography variant="caption" color="text.secondary">
                        {(execution.duration / 1000).toFixed(1)}s
                      </Typography>
                    )}
                    {execution.toolsUsed && execution.toolsUsed.length > 0 && (
                      <Typography variant="caption" color="text.secondary">
                        Tools: {execution.toolsUsed.join(', ')}
                      </Typography>
                    )}
                  </Box>
                  {execution.result && (
                    <Typography
                      variant="caption"
                      sx={{
                        display: 'block',
                        mt: 0.5,
                        p: 1,
                        backgroundColor: 'background.default',
                        borderRadius: 1,
                        width: '100%',
                        fontFamily: 'monospace',
                        fontSize: '0.75rem'
                      }}
                    >
                      {typeof execution.result === 'string' 
                        ? execution.result 
                        : JSON.stringify(execution.result).slice(0, 100)}
                    </Typography>
                  )}
                </ListItem>
                {index < executions.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}

        {executions.length > 10 && (
          <Box textAlign="center" mt={2}>
            <Button
              variant="outlined"
              size="small"
              onClick={() => window.open(`/admin/agents/${agent.id}/activity`, '_blank')}
            >
              View All Activity
            </Button>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default AgentActivityTab;
