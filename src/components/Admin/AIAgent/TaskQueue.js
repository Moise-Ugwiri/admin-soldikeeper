/* eslint-disable */
/**
 * TaskQueue - Real-time agent task queue
 * Displays ongoing and pending operations
 */

import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Chip,
  Paper,
  alpha,
  useTheme,
  CircularProgress
} from '@mui/material';
import {
  CheckCircle as CompletedIcon,
  RadioButtonUnchecked as PendingIcon,
  PlayCircleFilled as InProgressIcon
} from '@mui/icons-material';
import AdminContext from '../../../contexts/AdminContext';

const TaskQueue = () => {
  const theme = useTheme();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // DEBUG: Log token availability
  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log('TaskQueue mounted, token:', token ? 'EXISTS' : 'MISSING');
  }, []);

  // Fetch recent activities (these are our "tasks")
  useEffect(() => {
    const fetchTasks = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('TaskQueue: No token, skipping fetch');
        setLoading(false);
        return;
      }
      
      try {
        console.log('TaskQueue: Fetching activities...');
        setLoading(true);
        const res = await axios.get(
          `${process.env.REACT_APP_API_URL || 'https://soldikeeper-backend-production.up.railway.app/api'}/admin/agents/activity?limit=20`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        console.log('TaskQueue: Response received:', res.data);
        if (res.data.success) {
          setTasks(res.data.activities || []);
          console.log('TaskQueue: Tasks set:', res.data.activities?.length || 0);
        }
        setLoading(false);
      } catch (error) {
        console.error('TaskQueue: Failed to fetch tasks:', error);
        setLoading(false);
      }
    };

    fetchTasks();
    
    // Refresh every 5 seconds
    const interval = setInterval(() => {
      const token = localStorage.getItem('token');
      if (token) fetchTasks();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CompletedIcon sx={{ fontSize: 20, color: 'success.main' }} />;
      case 'in_progress':
      case 'started':
        return <InProgressIcon sx={{ fontSize: 20, color: 'info.main' }} />;
      case 'failed':
        return <CompletedIcon sx={{ fontSize: 20, color: 'error.main' }} />;
      default:
        return <PendingIcon sx={{ fontSize: 20, color: 'text.disabled' }} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'in_progress':
      case 'started':
        return 'info';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatAction = (action) => {
    const formats = {
      process_transaction: 'Process Transaction',
      scan_receipt: 'Scan Receipt',
      generate_insights: 'Generate Insights',
      authenticate_user: 'Authenticate User',
      create_escalation: 'Create Escalation'
    };
    return formats[action] || action.replace(/_/g, ' ');
  };

  const tasksInProgress = tasks.filter(t => t.status === 'started' || t.status === 'in_progress').length;
  const tasksPending = tasks.filter(t => t.status === 'pending').length;
  const tasksCompleted = tasks.filter(t => t.status === 'completed').length;

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper 
      elevation={3}
      sx={{ 
        p: 3,
        height: { xs: 500, md: 550 },
        display: 'flex',
        flexDirection: 'column',
        background: `linear-gradient(135deg, ${alpha(theme.palette.secondary.main, 0.02)} 0%, ${alpha(theme.palette.background.paper, 1)} 100%)`
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
          📋 Task Queue
          <Chip 
            label={`${tasksInProgress} Active`} 
            size="small" 
            color="info"
            sx={{ fontSize: '0.7rem', height: 20, fontWeight: 700 }} 
          />
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {tasks.length} Recent Tasks
        </Typography>
      </Box>

      <Box sx={{ flex: 1, overflowY: 'auto', pr: 1 }}>
        {tasks.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body2" color="text.secondary">
              No recent tasks
            </Typography>
          </Box>
        ) : (
          <List sx={{ py: 0 }}>
            {tasks.map(task => (
              <ListItem
                key={task._id}
                sx={{
                  mb: 1,
                  p: 1.5,
                  borderRadius: 1,
                  border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                  background: alpha(theme.palette.background.paper, 0.5),
                  '&:hover': {
                    background: alpha(theme.palette.primary.main, 0.05)
                  }
                }}
              >
                <Box sx={{ mr: 2 }}>
                  {getStatusIcon(task.status)}
                </Box>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" fontWeight={600}>
                        {formatAction(task.action)}
                      </Typography>
                      <Chip 
                        label={task.agentName} 
                        size="small" 
                        sx={{ height: 18, fontSize: '0.65rem' }}
                      />
                    </Box>
                  }
                  secondary={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}>
                      <Typography variant="caption" color="text.secondary">
                        {task.duration ? `${task.duration}ms` : 'In progress...'}
                      </Typography>
                      <Chip 
                        label={task.status} 
                        size="small" 
                        color={getStatusColor(task.status)}
                        sx={{ height: 18, fontSize: '0.65rem' }}
                      />
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        )}
      </Box>

      {/* Queue Stats Footer */}
      <Box 
        sx={{ 
          mt: 2, 
          pt: 2, 
          borderTop: `1px solid ${theme.palette.divider}`,
          display: 'flex',
          justifyContent: 'space-around',
          gap: 2
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h5" fontWeight="bold" color="info.main">
            {tasksInProgress}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            In Progress
          </Typography>
        </Box>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h5" fontWeight="bold" color="warning.main">
            {tasksPending}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Pending
          </Typography>
        </Box>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h5" fontWeight="bold" color="success.main">
            {tasksCompleted}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Completed
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};

export default TaskQueue;
