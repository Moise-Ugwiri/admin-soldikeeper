/* eslint-disable */
/**
 * AI Agent Chat Panel
 * Interactive chat interface for admin to communicate with the AI Agent
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  IconButton,
  Avatar,
  Chip,
  CircularProgress,
  Fade,
  Divider,
  Tooltip,
  Badge,
  useTheme,
  alpha
} from '@mui/material';
import {
  Send as SendIcon,
  SmartToy as AgentIcon,
  Person as UserIcon,
  Psychology as ThinkingIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Lightbulb as SuggestionIcon,
  History as HistoryIcon,
  Clear as ClearIcon,
  ContentCopy as CopyIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useAIAgent } from '../../../contexts/AIAgentContext';

// Message bubble component
const MessageBubble = ({ message, isAgent, theme }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getMessageStyle = () => {
    if (isAgent) {
      return {
        bgcolor: alpha(theme.palette.primary.main, 0.1),
        borderLeft: `3px solid ${theme.palette.primary.main}`,
        ml: 0,
        mr: 4
      };
    }
    return {
      bgcolor: alpha(theme.palette.secondary.main, 0.1),
      borderRight: `3px solid ${theme.palette.secondary.main}`,
      ml: 4,
      mr: 0
    };
  };

  const getStatusIcon = () => {
    switch (message.status) {
      case 'success':
        return <SuccessIcon sx={{ fontSize: 14, color: 'success.main' }} />;
      case 'error':
        return <ErrorIcon sx={{ fontSize: 14, color: 'error.main' }} />;
      case 'thinking':
        return <CircularProgress size={14} />;
      default:
        return null;
    }
  };

  return (
    <Fade in timeout={300}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: isAgent ? 'flex-start' : 'flex-end',
          mb: 2
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
          {isAgent && (
            <Avatar
              sx={{
                width: 28,
                height: 28,
                bgcolor: theme.palette.primary.main,
                mr: 1
              }}
            >
              <AgentIcon sx={{ fontSize: 16 }} />
            </Avatar>
          )}
          <Typography variant="caption" color="text.secondary">
            {isAgent ? 'AI Agent' : 'You'} • {new Date(message.timestamp).toLocaleTimeString()}
          </Typography>
          {getStatusIcon()}
          {!isAgent && (
            <Avatar
              sx={{
                width: 28,
                height: 28,
                bgcolor: theme.palette.secondary.main,
                ml: 1
              }}
            >
              <UserIcon sx={{ fontSize: 16 }} />
            </Avatar>
          )}
        </Box>

        <Paper
          elevation={0}
          sx={{
            p: 2,
            borderRadius: 2,
            maxWidth: '85%',
            position: 'relative',
            ...getMessageStyle()
          }}
        >
          <Typography
            variant="body2"
            sx={{
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              lineHeight: 1.6
            }}
          >
            {message.content}
          </Typography>

          {/* Actions for agent messages */}
          {isAgent && message.actions && message.actions.length > 0 && (
            <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {message.actions.map((action, idx) => (
                <Chip
                  key={idx}
                  label={action.label}
                  size="small"
                  color="primary"
                  variant="outlined"
                  onClick={() => action.onClick && action.onClick()}
                  sx={{ cursor: 'pointer' }}
                />
              ))}
            </Box>
          )}

          {/* Suggestions for agent messages */}
          {isAgent && message.suggestions && message.suggestions.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <SuggestionIcon sx={{ fontSize: 14, mr: 0.5 }} />
                Suggestions:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {message.suggestions.map((suggestion, idx) => (
                  <Chip
                    key={idx}
                    label={suggestion}
                    size="small"
                    variant="outlined"
                    sx={{ cursor: 'pointer' }}
                  />
                ))}
              </Box>
            </Box>
          )}

          {/* Copy button */}
          <Tooltip title={copied ? 'Copied!' : 'Copy message'}>
            <IconButton
              size="small"
              onClick={handleCopy}
              sx={{
                position: 'absolute',
                top: 4,
                right: 4,
                opacity: 0.5,
                '&:hover': { opacity: 1 }
              }}
            >
              <CopyIcon sx={{ fontSize: 14 }} />
            </IconButton>
          </Tooltip>
        </Paper>
      </Box>
    </Fade>
  );
};

// Typing indicator component
const TypingIndicator = ({ theme }) => (
  <Fade in>
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
      <Avatar
        sx={{
          width: 28,
          height: 28,
          bgcolor: theme.palette.primary.main,
          mr: 1
        }}
      >
        <ThinkingIcon sx={{ fontSize: 16 }} />
      </Avatar>
      <Paper
        elevation={0}
        sx={{
          p: 1.5,
          px: 2,
          borderRadius: 2,
          bgcolor: alpha(theme.palette.primary.main, 0.1),
          borderLeft: `3px solid ${theme.palette.primary.main}`
        }}
      >
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          {[0, 1, 2].map((i) => (
            <Box
              key={i}
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: theme.palette.primary.main,
                animation: 'pulse 1.4s ease-in-out infinite',
                animationDelay: `${i * 0.2}s`,
                '@keyframes pulse': {
                  '0%, 100%': { opacity: 0.4, transform: 'scale(0.8)' },
                  '50%': { opacity: 1, transform: 'scale(1)' }
                }
              }}
            />
          ))}
        </Box>
      </Paper>
    </Box>
  </Fade>
);

// Quick action suggestions
const QUICK_ACTIONS = [
  { label: 'System Status', query: 'What is the current system status?' },
  { label: 'Active Alerts', query: 'Show me all active alerts' },
  { label: 'User Analytics', query: 'Give me a summary of user activity today' },
  { label: 'Security Report', query: 'Are there any security concerns?' },
  { label: 'Performance', query: 'How is the system performing?' },
  { label: 'Recommendations', query: 'What actions do you recommend?' }
];

const AIAgentChatPanel = ({ 
  maxHeight = 500, 
  showQuickActions = true,
  showHistory = true 
}) => {
  const theme = useTheme();
  const { 
    conversation = [], 
    status = {},
    connected = false,
    loading = false,
    sendCommand 
  } = useAIAgent() || {};
  
  // Get status string - be more permissive about what's considered "ready"
  const agentStatusString = status?.status || 'unknown';
  const isAgentReady = connected || agentStatusString === 'active' || agentStatusString === 'running' || agentStatusString === 'online';
  const displayStatus = isAgentReady ? 'online' : (loading ? 'connecting' : 'offline');
  
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [localMessages, setLocalMessages] = useState([]);
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Combine context conversations with local messages
  const messages = [...(conversation || []), ...localMessages];

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  // Handle sending message
  const handleSend = async () => {
    const trimmedInput = inputValue.trim();
    if (!trimmedInput || isTyping) return;

    console.log('AIAgentChatPanel: Sending message:', trimmedInput);
    console.log('AIAgentChatPanel: sendCommand available:', !!sendCommand);

    // Add user message to local state for immediate feedback
    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: trimmedInput,
      timestamp: new Date().toISOString(),
      status: 'sent'
    };

    setLocalMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      if (!sendCommand) {
        throw new Error('AI Agent is not connected. Please refresh the page.');
      }
      
      const response = await sendCommand(trimmedInput);
      console.log('AIAgentChatPanel: Response received:', response);
      
      const agentMessage = {
        id: Date.now() + 1,
        role: 'agent',
        content: response?.message || response?.response || 'I have processed your request.',
        timestamp: new Date().toISOString(),
        status: 'success',
        actions: response?.actions || [],
        suggestions: response?.suggestions || []
      };

      setLocalMessages(prev => [...prev, agentMessage]);
    } catch (error) {
      console.error('AIAgentChatPanel: Error:', error);
      const errorMessage = {
        id: Date.now() + 1,
        role: 'agent',
        content: `I encountered an error: ${error?.message || 'Unknown error'}. Please try again.`,
        timestamp: new Date().toISOString(),
        status: 'error'
      };
      setLocalMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  // Handle key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Handle quick action click
  const handleQuickAction = (query) => {
    setInputValue(query);
    inputRef.current?.focus();
  };

  // Clear conversation
  const handleClearConversation = () => {
    setLocalMessages([]);
  };

  return (
    <Paper
      elevation={2}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        maxHeight,
        borderRadius: 2,
        overflow: 'hidden'
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          borderBottom: `1px solid ${theme.palette.divider}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          bgcolor: alpha(theme.palette.primary.main, 0.05)
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Badge
            overlap="circular"
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            badgeContent={
              <Box
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  bgcolor: displayStatus === 'online' ? 'success.main' : displayStatus === 'connecting' ? 'warning.main' : 'error.main',
                  border: `2px solid ${theme.palette.background.paper}`
                }}
              />
            }
          >
            <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
              <AgentIcon />
            </Avatar>
          </Badge>
          <Box sx={{ ml: 1.5 }}>
            <Typography variant="subtitle1" fontWeight="bold">
              AI Admin Agent
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {displayStatus === 'online' ? 'Online and ready' : displayStatus === 'connecting' ? 'Connecting...' : 'Ready to chat'}
            </Typography>
          </Box>
        </Box>
        <Box>
          {showHistory && (
            <Tooltip title="Conversation History">
              <IconButton size="small">
                <HistoryIcon />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title="Clear Conversation">
            <IconButton size="small" onClick={handleClearConversation}>
              <ClearIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Refresh Connection">
            <IconButton size="small">
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Quick Actions */}
      {showQuickActions && messages.length === 0 && (
        <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
            Quick Actions:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {QUICK_ACTIONS.map((action, idx) => (
              <Chip
                key={idx}
                label={action.label}
                size="small"
                variant="outlined"
                onClick={() => handleQuickAction(action.query)}
                sx={{ cursor: 'pointer' }}
              />
            ))}
          </Box>
        </Box>
      )}

      {/* Messages Area */}
      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          p: 2,
          bgcolor: theme.palette.background.default
        }}
      >
        {messages.length === 0 ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              opacity: 0.7
            }}
          >
            <AgentIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="body1" color="text.secondary" textAlign="center">
              Hello! I'm your AI Admin Agent.
            </Typography>
            <Typography variant="body2" color="text.secondary" textAlign="center">
              Ask me anything about users, transactions, security, or system health.
            </Typography>
          </Box>
        ) : (
          messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isAgent={message.role === 'agent' || message.role === 'assistant'}
              theme={theme}
            />
          ))
        )}
        {isTyping && <TypingIndicator theme={theme} />}
        <div ref={messagesEndRef} />
      </Box>

      <Divider />

      {/* Input Area */}
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'flex-end',
          gap: 1,
          bgcolor: theme.palette.background.paper
        }}
      >
        <TextField
          ref={inputRef}
          fullWidth
          multiline
          maxRows={4}
          variant="outlined"
          placeholder="Ask the AI Agent..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={isTyping}
          size="small"
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2
            }
          }}
        />
        <IconButton
          color="primary"
          onClick={handleSend}
          disabled={!inputValue.trim() || isTyping}
          sx={{
            bgcolor: theme.palette.primary.main,
            color: 'white',
            '&:hover': {
              bgcolor: theme.palette.primary.dark
            },
            '&.Mui-disabled': {
              bgcolor: theme.palette.action.disabledBackground
            }
          }}
        >
          {isTyping ? <CircularProgress size={24} color="inherit" /> : <SendIcon />}
        </IconButton>
      </Box>
    </Paper>
  );
};

export default AIAgentChatPanel;
