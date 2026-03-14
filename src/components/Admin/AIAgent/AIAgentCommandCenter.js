/* eslint-disable */
/**
 * 🎯 APOLLO COMMAND CENTER
 * Mission Control for all 12 PROJECT OLYMPUS agents
 * 
 * Redesigned with NASA Mission Control / Jarvis aesthetic
 * - Real-time agent status cards
 * - Live inter-agent communication log
 * - Task queue monitoring
 * - Escalation hub integration
 */

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import {
  Box,
  Grid,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  useTheme,
  alpha,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  PlayArrow as PlayIcon,
  Schedule as ScheduleIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { useAdminData } from '../../../contexts/AdminContext';
import { MissionControlHeader, AgentGrid } from '../MissionControl';
import AgentCommunicationLog from './AgentCommunicationLog';
import EscalationHub from './EscalationHub';
import { AGENTS as STATIC_AGENTS, getSystemStatus } from '../../../data/agentRegistry';
import TaskQueue from './TaskQueue';
import AgentInterface from './AgentInterface';
import SystemHealthPanel from './SystemHealthPanel';
import ReasoningTracePanel from './ReasoningTracePanel';
import GoalDashboard from './GoalDashboard';
import CollaborationViewer from './CollaborationViewer';

// Main Command Center Component
/**
 * 🎯 APOLLO COMMAND CENTER - Main Component
 */
const AIAgentCommandCenter = () => {
  const theme = useTheme();
  const { token } = useAdminData();
  
  // Agent state management - now with real data
  const [agents, setAgents] = useState(STATIC_AGENTS);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiAvailable, setApiAvailable] = useState(true);
  // eslint-disable-next-line no-unused-vars
  const [socket, setSocket] = useState(null);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Mock task queue for demonstration
  const [taskQueue] = useState([
    {
      id: 'task-1',
      title: 'Build Mission Control UI',
      assignedAgent: 'Prism',
      priority: 'High',
      status: 'in-progress'
    },
    {
      id: 'task-2',
      title: 'Process monthly budget rollover',
      assignedAgent: 'Ledger',
      priority: 'High',
      status: 'in-progress'
    },
    {
      id: 'task-3',
      title: 'Generate spending insights',
      assignedAgent: 'Cortex',
      priority: 'Medium',
      status: 'in-progress'
    },
    {
      id: 'task-4',
      title: 'Optimize debt algorithm',
      assignedAgent: 'Nexus',
      priority: 'Medium',
      status: 'in-progress'
    },
    {
      id: 'task-5',
      title: 'Monitor admin dashboard',
      assignedAgent: 'Watchtower',
      priority: 'Medium',
      status: 'in-progress'
    },
    {
      id: 'task-6',
      title: 'Security audit',
      assignedAgent: 'Sentinel',
      priority: 'High',
      status: 'pending'
    },
    {
      id: 'task-7',
      title: 'Receipt OCR processing',
      assignedAgent: 'Vision',
      priority: 'Low',
      status: 'pending'
    },
    {
      id: 'task-8',
      title: 'Process Stripe webhooks',
      assignedAgent: 'Vault',
      priority: 'Medium',
      status: 'pending'
    },
    {
      id: 'task-9',
      title: 'Build Android APK',
      assignedAgent: 'Forge',
      priority: 'Low',
      status: 'pending'
    },
    {
      id: 'task-10',
      title: 'Deploy to production',
      assignedAgent: 'Atlas',
      priority: 'High',
      status: 'pending'
    },
    {
      id: 'task-11',
      title: 'Translate UI strings',
      assignedAgent: 'Babel',
      priority: 'Low',
      status: 'pending'
    },
    {
      id: 'task-12',
      title: 'Coordinate deployment',
      assignedAgent: 'Apollo',
      priority: 'Critical',
      status: 'pending'
    }
  ]);

  // Fetch initial data from backend
  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;
      
      try {
        setLoading(true);

        // Fetch agent statuses
        const statsRes = await axios.get(
          `${process.env.REACT_APP_API_URL || 'https://soldikeeper-backend-production.up.railway.app/api'}/admin/agents/stats`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        // Fetch recent activities
        const activityRes = await axios.get(
          `${process.env.REACT_APP_API_URL || 'https://soldikeeper-backend-production.up.railway.app/api'}/admin/agents/activity?limit=50`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        // Update agents with real data
        if (statsRes.data.success && statsRes.data.agents) {
          setAgents(prev => prev.map(agent => {
            const realData = statsRes.data.agents.find(a => a.agentId === agent.id);
            if (realData) {
              return {
                ...agent,
                status: realData.status || 'idle',
                currentTask: realData.currentTask || agent.currentTask,
                load: realData.load || 0
              };
            }
            return agent;
          }));
        }

        // Update activities
        if (activityRes.data.success) {
          setActivities(activityRes.data.activities || []);
        }

        setLoading(false);
        setApiAvailable(true);
      } catch (error) {
        console.error('Failed to fetch agent data:', error);
        setLoading(false);
        setApiAvailable(false);
        // Keep static data as fallback
      }
    };

    fetchData();
  }, [token]);

  // WebSocket real-time updates
  useEffect(() => {
    if (!token) return;

    // Connect to WebSocket
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
      console.log('✅ WebSocket connected for agent updates');
      setApiAvailable(true);
    });

    newSocket.on('connect_error', (error) => {
      console.error('❌ WebSocket connection error:', error);
      setApiAvailable(false);
    });

    // Listen for agent activity updates
    newSocket.on('agent:activity:start', (data) => {
      console.log('Agent started:', data);
      setAgents(prev => prev.map(agent => 
        agent.id === data.agentId 
          ? { ...agent, status: 'busy', currentTask: data.task || 'Working...' }
          : agent
      ));
    });

    newSocket.on('agent:activity:complete', (data) => {
      console.log('Agent completed:', data);
      setAgents(prev => prev.map(agent => 
        agent.id === data.agentId 
          ? { ...agent, status: 'idle', currentTask: null }
          : agent
      ));
      
      // Add to activities list
      setActivities(prev => [data, ...prev].slice(0, 50));
    });

    // Listen for status updates (every 5 seconds from backend)
    newSocket.on('agents:status:update', (statuses) => {
      setAgents(prev => prev.map(agent => {
        const status = statuses.find(s => s.agentId === agent.id);
        if (status) {
          return {
            ...agent,
            status: status.status || agent.status,
            currentTask: status.currentTask || agent.currentTask,
            load: status.load !== undefined ? status.load : agent.load
          };
        }
        return agent;
      }));
    });

    newSocket.on('disconnect', () => {
      console.log('❌ WebSocket disconnected');
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [token]);

  // Handler for agent card clicks
  const handleAgentClick = (agent) => {
    setSelectedAgent(agent);
    setDrawerOpen(true);
    console.log('Agent clicked:', agent.name);
  };

  // Handler for closing agent drawer
  const handleDrawerClose = () => {
    setDrawerOpen(false);
    // Keep selectedAgent for smooth closing animation
    setTimeout(() => setSelectedAgent(null), 300);
  };

  // Calculate system stats (used in header component)
  // eslint-disable-next-line no-unused-vars
  const systemStatus = getSystemStatus();
  const tasksInProgress = taskQueue.filter(t => t.status === 'in-progress').length;

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* API Status Warning */}
      {!apiAvailable && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Real-time agent data unavailable. Showing static information.
        </Alert>
      )}

      {/* Loading State */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Mission Control Header */}
      <MissionControlHeader />

      {/* Agent Grid - All 12 PROJECT OLYMPUS Agents */}
      <AgentGrid onAgentClick={handleAgentClick} agents={agents} />

      {/* Communication Log + Task Queue Row */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Left: Communication Log */}
        <Grid item xs={12} lg={7}>
          <Paper 
            elevation={3}
            sx={{ 
              p: 3,
              height: { xs: 500, md: 550 },
              display: 'flex',
              flexDirection: 'column',
              background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.02)} 0%, ${alpha(theme.palette.background.paper, 1)} 100%)`
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                📡 Communication Log
                <Chip 
                  label={apiAvailable ? "LIVE" : "OFFLINE"} 
                  size="small" 
                  color={apiAvailable ? "success" : "default"}
                  sx={{ 
                    fontSize: '0.7rem',
                    height: 20,
                    fontWeight: 700,
                    animation: apiAvailable ? 'pulse 2s infinite' : 'none',
                    '@keyframes pulse': {
                      '0%, 100%': { opacity: 1 },
                      '50%': { opacity: 0.6 }
                    }
                  }} 
                />
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Real-time inter-agent communications
              </Typography>
            </Box>
            
            <Box sx={{ flex: 1, overflow: 'hidden' }}>
              <AgentCommunicationLog maxHeight={450} />
            </Box>
          </Paper>
        </Grid>

        {/* Right: Task Queue */}
        <Grid item xs={12} lg={5}>
          <TaskQueue />
        </Grid>
      </Grid>

      {/* Escalation Hub - Enhanced Manual Escalation UI */}
      <EscalationHub />

      {/* Reasoning Traces — Live OODA Loop Viewer */}
      <Box sx={{ mt: 3 }}>
        <ReasoningTracePanel socket={socket} />
      </Box>

      {/* Goal Dashboard — Agent Goal Tracking & Management */}
      <Box sx={{ mt: 3 }}>
        <GoalDashboard />
      </Box>

      {/* Collaboration Sessions — Multi-Agent Collaboration Viewer */}
      <Box sx={{ mt: 3 }}>
        <CollaborationViewer />
      </Box>

      {/* System Health — Circuit Breakers, LLM Costs, Dead Letter Queue */}
      <Box sx={{ mt: 3 }}>
        <SystemHealthPanel />
      </Box>

      {/* Agent Interface Drawer */}
      <AgentInterface
        open={drawerOpen}
        onClose={handleDrawerClose}
        agent={selectedAgent}
      />
    </Box>
  );
};

export default AIAgentCommandCenter;
