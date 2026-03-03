/* eslint-disable */
/**
 * 💬 AGENT CHAT TAB
 * Conversational interface with autonomous agents
 * Features:
 * - Chat history (user + agent messages)
 * - Real-time task execution via backend
 * - Progress indicators
 * - Quick action buttons (agent-specific)
 * - Message input field
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  TextField,
  IconButton,
  Button,
  Paper,
  Typography,
  CircularProgress,
  Chip,
  alpha
} from '@mui/material';
import {
  Send as SendIcon,
  AutoFixHigh as AutoIcon
} from '@mui/icons-material';
import axios from 'axios';
import ChatMessage from './ChatMessage';

const API_URL = process.env.REACT_APP_API_URL || 'https://soldikeeper-backend-production.up.railway.app/api';

const AgentChatTab = ({ agent }) => {
  const token = localStorage.getItem('token');
  const [messages, setMessages] = useState([
    {
      id: 1,
      content: `Hello! I'm ${agent.name}, your ${agent.role.toLowerCase()}. I'm connected to live data — ask me anything about my domain and I'll run real operations for you.`,
      isUser: false,
      timestamp: new Date(Date.now() - 5000)
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isTyping) return;

    const userMessage = {
      id: Date.now(),
      content: inputValue,
      isUser: true,
      timestamp: new Date()
    };

    const currentInput = inputValue;
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Build conversation history (last 6 turns) for context
    const history = messages.slice(-6).map(m => ({
      role: m.isUser ? 'user' : 'assistant',
      content: m.content
    }));

    try {
      const response = await axios.post(
        `${API_URL}/admin/agent-management/${agent.id}/chat`,
        { message: currentInput, history },
        { headers: { Authorization: `Bearer ${token}` }, timeout: 30000 }
      );

      const data = response.data.data || response.data;
      const agentResponse = {
        id: Date.now() + 1,
        content: data.response || 'Task completed.',
        isUser: false,
        timestamp: new Date(),
        action: data.action,
        execution: data.execution || null,
        intent: data.intent || null,
        model: data.model || null
      };
      setMessages(prev => [...prev, agentResponse]);
    } catch (error) {
      console.error('Agent chat error:', error);
      const errorMsg = {
        id: Date.now() + 1,
        content: `⚠️ I couldn't process that request. ${error.response?.data?.message || error.message}\n\nPlease try again or use one of the quick actions below.`,
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickAction = (action) => {
    setInputValue(action);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getQuickActions = () => {
    switch (agent.id) {
      case '01-sentinel':
        return [
          'Show security status',
          'Scan for brute force attacks',
          'Detect threats',
          'Audit user activity',
          'Revoke expired tokens'
        ];
      case '02-ledger':
        return [
          'Check data integrity',
          'Detect financial anomalies',
          'Calculate budget rollover',
          'Analyze transactions'
        ];
      case '04-cortex':
        return [
          'Generate insights',
          'Analyze spending patterns',
          'Optimize budgets',
          'Detect anomalies'
        ];
      case '07-watchtower':
        return [
          'Check system health',
          'Detect system anomalies',
          'Generate daily report',
          'Show status'
        ];
      default:
        return [
          'Show status',
          'Run diagnostic',
          'Check health'
        ];
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 200px)',
        p: 2
      }}
    >
      {/* Chat messages area */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          mb: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          '&::-webkit-scrollbar': {
            width: '8px'
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: alpha(agent.color, 0.3),
            borderRadius: '4px',
            '&:hover': {
              backgroundColor: alpha(agent.color, 0.5)
            }
          }
        }}
      >
        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            message={message}
            agent={agent}
            isUser={message.isUser}
          />
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              mb: 2
            }}
          >
            <Typography
              component="span"
              sx={{ fontSize: '1.2rem', lineHeight: 1 }}
            >
              {agent.emoji}
            </Typography>
            <Paper
              elevation={0}
              sx={{
                px: 2,
                py: 1,
                borderRadius: 2,
                backgroundColor: 'background.paper',
                border: 1,
                borderColor: 'divider',
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              <CircularProgress size={12} sx={{ color: agent.color }} />
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {agent.name} is typing...
              </Typography>
            </Paper>
          </Box>
        )}

        <div ref={messagesEndRef} />
      </Box>

      {/* Quick actions */}
      <Box sx={{ mb: 2 }}>
        <Typography
          variant="caption"
          sx={{
            display: 'block',
            mb: 1,
            fontSize: '0.75rem',
            fontWeight: 600,
            color: 'text.secondary'
          }}
        >
          Quick Actions
        </Typography>
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 1
          }}
        >
          {getQuickActions().map((action, index) => (
            <Chip
              key={index}
              label={action}
              size="small"
              icon={<AutoIcon fontSize="small" />}
              onClick={() => handleQuickAction(action)}
              sx={{
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': {
                  backgroundColor: alpha(agent.color, 0.15),
                  transform: 'translateY(-2px)',
                  boxShadow: `0 4px 8px ${alpha(agent.color, 0.2)}`
                }
              }}
            />
          ))}
        </Box>
      </Box>

      {/* Input area */}
      <Paper
        elevation={2}
        sx={{
          p: 1.5,
          display: 'flex',
          gap: 1,
          alignItems: 'flex-end',
          borderRadius: 2,
          border: 1,
          borderColor: 'divider'
        }}
      >
        <TextField
          fullWidth
          multiline
          maxRows={4}
          placeholder={`Ask ${agent.name} anything...`}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          variant="standard"
          InputProps={{
            disableUnderline: true,
            sx: {
              fontSize: '0.875rem',
              '& textarea': {
                '&::placeholder': {
                  opacity: 0.6
                }
              }
            }
          }}
        />
        <IconButton
          onClick={handleSendMessage}
          disabled={!inputValue.trim() || isTyping}
          sx={{
            backgroundColor: alpha(agent.color, 0.1),
            color: agent.color,
            '&:hover': {
              backgroundColor: alpha(agent.color, 0.2)
            },
            '&.Mui-disabled': {
              backgroundColor: 'transparent',
              color: 'text.disabled'
            }
          }}
        >
          <SendIcon fontSize="small" />
        </IconButton>
      </Paper>
    </Box>
  );
};

export default AgentChatTab;
