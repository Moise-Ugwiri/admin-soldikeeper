/* eslint-disable */
/**
 * AgentCommunicationLog - Real-time agent communication timeline
 * Terminal-like display showing inter-agent messages with Mission Control aesthetic
 */

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import {
  Box,
  Typography,
  TextField,
  MenuItem,
  InputAdornment,
  Paper,
  alpha,
  useTheme,
  CircularProgress
} from '@mui/material';
import {
  Search as SearchIcon,
  Circle as StatusDot,
  ArrowForward as ArrowIcon
} from '@mui/icons-material';
import { AGENTS } from '../../../data/agentRegistry';
import AdminContext from '../../../contexts/AdminContext';

/**
 * Message format:
 * {
 *   _id: string,
 *   createdAt: Date,
 *   fromAgent: agentId,
 *   toAgent: agentId,
 *   message: string,
 *   messageType: 'request' | 'response' | 'notification' | 'error',
 *   context: object
 * }
 */

const AgentCommunicationLog = ({ maxHeight = 400 }) => {
  const theme = useTheme();
  const logRef = useRef(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [communications, setCommunications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);
  const [fetchAttempted, setFetchAttempted] = useState(false);

  // Fetch initial communications
  React.useEffect(() => {
    if (fetchAttempted) return;
    setFetchAttempted(true);
    
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }
    
    axios.get(
      `${process.env.REACT_APP_API_URL || 'https://soldikeeper-backend-production.up.railway.app/api'}/admin/agents/communications?limit=100`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
    .then(res => {
      if (res.data.success) {
        setCommunications(res.data.communications || []);
      }
      setLoading(false);
    })
    .catch(error => {
      console.error('Failed to fetch agent communications:', error);
      setLoading(false);
    });
  }, [fetchAttempted]);

  // WebSocket real-time updates
  useEffect(() => {
    const token = localStorage.getItem('token');
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
      console.log('✅ Agent communications WebSocket connected');
    });

    // Listen for new communications
    newSocket.on('agent:communication', (data) => {
      console.log('New communication:', data);
      setCommunications(prev => [data, ...prev].slice(0, 100));
    });

    newSocket.on('disconnect', () => {
      console.log('❌ WebSocket disconnected');
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []); // Remove token dependency

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [communications]);

  // Get agent by ID
  const getAgent = (agentId) => AGENTS.find(a => a.id === agentId) || { 
    name: 'System', 
    color: theme.palette.text.secondary,
    emoji: '⚙️' 
  };

  // Format communications for display
  const formattedMessages = communications.map(comm => ({
    id: comm._id,
    timestamp: new Date(comm.createdAt),
    from: comm.fromAgent,
    to: comm.toAgent,
    message: comm.message,
    status: comm.messageType === 'error' ? 'error' : 'completed',
    context: comm.context
  }));

  // Filter messages
  const filteredMessages = formattedMessages.filter(msg => {
    // Agent filter
    if (filter !== 'all' && msg.from !== filter && msg.to !== filter) {
      return false;
    }
    // Search filter
    if (searchTerm && !msg.message.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    return true;
  });

  // Status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return '✅';
      case 'error':
        return '❌';
      case 'delivered':
        return '✓';
      default:
        return '⋯';
    }
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit',
      hour12: false 
    });
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Controls */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        {/* Agent Filter */}
        <TextField
          select
          size="small"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          sx={{ minWidth: 150 }}
          label="Filter Agent"
        >
          <MenuItem value="all">All Agents</MenuItem>
          {AGENTS.map(agent => (
            <MenuItem key={agent.id} value={agent.id}>
              {agent.emoji} {agent.name}
            </MenuItem>
          ))}
        </TextField>

        {/* Search */}
        <TextField
          size="small"
          fullWidth
          placeholder="Search messages..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            )
          }}
        />
      </Box>

      {/* Log Container - Terminal Style */}
      <Paper
        ref={logRef}
        elevation={0}
        sx={{
          flex: 1,
          backgroundColor: '#0a0a0a',
          color: '#00ff00',
          fontFamily: 'Monaco, Consolas, "Courier New", monospace',
          fontSize: '0.85rem',
          p: 2,
          overflowY: 'auto',
          maxHeight: maxHeight,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
          borderRadius: 1,
          '&::-webkit-scrollbar': {
            width: 8
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: 'rgba(0, 0, 0, 0.2)'
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: alpha(theme.palette.primary.main, 0.5),
            borderRadius: 4
          }
        }}
      >
        {loading ? (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            height: '100%' 
          }}>
            <CircularProgress size={30} sx={{ color: '#00ff00' }} />
          </Box>
        ) : filteredMessages.length === 0 ? (
          <Box sx={{ 
            textAlign: 'center', 
            py: 4, 
            opacity: 0.5,
            fontFamily: theme.typography.fontFamily 
          }}>
            <Typography variant="body2" sx={{ color: '#00ff00' }}>
              {communications.length === 0 
                ? 'No agent communications yet. System monitoring...' 
                : 'No messages match your filters.'}
            </Typography>
          </Box>
        ) : (
          filteredMessages.map((msg, index) => {
            const fromAgent = getAgent(msg.from);
            const toAgent = getAgent(msg.to);
            
            return (
              <Box
                key={msg.id || index}
                sx={{
                  mb: 1.5,
                  pb: 1.5,
                  borderBottom: index < filteredMessages.length - 1 
                    ? `1px solid ${alpha('#00ff00', 0.1)}` 
                    : 'none',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    backgroundColor: alpha('#00ff00', 0.05)
                  }
                }}
              >
                {/* Timestamp + Status */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <Typography
                    component="span"
                    sx={{
                      color: alpha('#00ff00', 0.6),
                      fontSize: '0.75rem'
                    }}
                  >
                    [{formatTime(msg.timestamp)}]
                  </Typography>
                  <Typography component="span" sx={{ fontSize: '0.75rem' }}>
                    {getStatusIcon(msg.status)}
                  </Typography>
                </Box>

                {/* Agent Communication */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                  {/* From Agent */}
                  <Box
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 0.5,
                      color: fromAgent.color,
                      fontWeight: 700
                    }}
                  >
                    <Typography component="span" sx={{ fontSize: '1rem' }}>
                      {fromAgent.emoji}
                    </Typography>
                    <Typography component="span" sx={{ fontSize: '0.85rem' }}>
                      {fromAgent.name}
                    </Typography>
                  </Box>

                  {/* Arrow */}
                  <ArrowIcon 
                    sx={{ 
                      fontSize: '1rem', 
                      color: alpha('#00ff00', 0.5),
                      mx: 0.5 
                    }} 
                  />

                  {/* To Agent */}
                  <Box
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 0.5,
                      color: toAgent.color,
                      fontWeight: 700
                    }}
                  >
                    <Typography component="span" sx={{ fontSize: '1rem' }}>
                      {toAgent.emoji}
                    </Typography>
                    <Typography component="span" sx={{ fontSize: '0.85rem' }}>
                      {toAgent.name}
                    </Typography>
                  </Box>
                </Box>

                {/* Message */}
                <Box
                  sx={{
                    mt: 0.5,
                    pl: 3,
                    color: '#00ff00',
                    fontSize: '0.85rem',
                    lineHeight: 1.4
                  }}
                >
                  {msg.message}
                </Box>
              </Box>
            );
          })
        )}

        {/* Cursor blink effect */}
        {!loading && communications.length > 0 && (
          <Box
            sx={{
              display: 'inline-block',
              width: 8,
              height: 14,
              backgroundColor: '#00ff00',
              animation: 'blink 1s infinite',
              '@keyframes blink': {
                '0%, 49%': { opacity: 1 },
                '50%, 100%': { opacity: 0 }
              }
            }}
          />
        )}
      </Paper>

      {/* Stats Footer */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mt: 1,
          pt: 1,
          borderTop: `1px solid ${theme.palette.divider}`
        }}
      >
        <Typography variant="caption" color="text.secondary">
          Showing {filteredMessages.length} of {communications.length} messages
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <StatusDot sx={{ fontSize: 8, color: socket && socket.connected ? 'success.main' : 'error.main' }} />
          <Typography variant="caption" color="text.secondary">
            {socket && socket.connected ? 'Live Feed' : 'Offline'}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default AgentCommunicationLog;
