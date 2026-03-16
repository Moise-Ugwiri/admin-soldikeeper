/* eslint-disable */
/**
 * 💬 AGENT CHAT TAB — Personality-Driven Chat Experience
 * Conversational interface with autonomous agents featuring:
 * - Personality greetings from agent.greetings[]
 * - Contextual thinking indicator with rotating thinkingPhrases
 * - Agent identity header with mood, traits, colored accent
 * - Enhanced message payloads (confidence, toolsUsed, reasoning, collaborators)
 * - Personality-aware quick actions, placeholders, and empty state
 * - Real-time task execution via backend
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Box,
  TextField,
  IconButton,
  Button,
  Paper,
  Typography,
  CircularProgress,
  Chip,
  Avatar,
  alpha,
  useTheme
} from '@mui/material';
import {
  Send as SendIcon,
  AutoFixHigh as AutoIcon,
  Psychology as PsychologyIcon
} from '@mui/icons-material';
import axios from 'axios';
import ChatMessage from './ChatMessage';
import { getAgentThinkingPhrase, getAgentGreeting } from '../../../../data/agentRegistry';

const API_URL = process.env.REACT_APP_API_URL || 'https://soldikeeper-backend-production.up.railway.app/api';

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Build the initial greeting message using personality data with fallback. */
const buildGreeting = (agent) => {
  const personalGreeting = getAgentGreeting(agent);
  // getAgentGreeting already handles fallback, but we add a safety net
  const content = personalGreeting || `Hello! I'm ${agent.name}, your ${agent.role.toLowerCase()}. I'm connected to live data — ask me anything about my domain and I'll run real operations for you.`;
  return {
    id: 1,
    content,
    isUser: false,
    timestamp: new Date(Date.now() - 5000)
  };
};

/** Resolve a personality-aware input placeholder. */
const getPlaceholder = (agent) => {
  const tone = agent.personality?.tone?.toLowerCase() || '';
  const style = agent.personality?.communicationStyle?.toLowerCase() || '';
  const name = agent.name || 'Agent';

  if (tone === 'formal' || tone === 'authoritative' || style === 'commanding') {
    return `Send a message to ${name}...`;
  }
  if (tone === 'casual' || tone === 'friendly' || style === 'empathetic') {
    return `Chat with ${name}...`;
  }
  if (tone === 'alert' || tone === 'vigilant' || style === 'analytical') {
    return `Report to ${name}...`;
  }
  return `Ask ${name} anything...`;
};

/** Determine how many quick-action chips to show based on verbosity. */
const getActionCount = (agent) => {
  const verbosity = agent.personality?.verbosity?.toLowerCase() || 'balanced';
  if (verbosity === 'terse') return 3;
  if (verbosity === 'verbose') return 5;
  return 4; // balanced
};

// ─── Component ──────────────────────────────────────────────────────────────

const AgentChatTab = ({ agent }) => {
  const theme = useTheme();
  const token = localStorage.getItem('token');

  // ── State ─────────────────────────────────────────────────────────────────
  const [messages, setMessages] = useState([buildGreeting(agent)]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [thinkingPhrase, setThinkingPhrase] = useState('');
  const messagesEndRef = useRef(null);
  const thinkingIntervalRef = useRef(null);

  // ── Auto-scroll on new messages ───────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ── Rotate thinking phrases every 2 s while typing ───────────────────────
  useEffect(() => {
    if (isTyping) {
      // Set initial phrase immediately
      setThinkingPhrase(getAgentThinkingPhrase(agent));
      thinkingIntervalRef.current = setInterval(() => {
        setThinkingPhrase(getAgentThinkingPhrase(agent));
      }, 2000);
    } else {
      setThinkingPhrase('');
      if (thinkingIntervalRef.current) {
        clearInterval(thinkingIntervalRef.current);
        thinkingIntervalRef.current = null;
      }
    }
    return () => {
      if (thinkingIntervalRef.current) {
        clearInterval(thinkingIntervalRef.current);
      }
    };
  }, [isTyping, agent]);

  // ── Send message — API logic preserved exactly ────────────────────────────
  const handleSendMessage = useCallback(async () => {
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
        model: data.model || null,
        // Enhanced payload for ChatMessage
        confidence: data.confidence || null,
        toolsUsed: data.toolsUsed || data.tools_used || null,
        reasoning: data.reasoning || null,
        collaborators: data.collaborators || null
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
  }, [inputValue, isTyping, messages, agent.id, token]);

  // ── Quick-action click fills the input ────────────────────────────────────
  const handleQuickAction = (action) => {
    setInputValue(action);
  };

  // ── Enter sends, Shift+Enter newlines ─────────────────────────────────────
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // ── Quick actions: registry actions first, then hardcoded fallback ────────
  const getQuickActions = () => {
    const maxActions = getActionCount(agent);

    // Prefer agent.actions from the registry when available
    if (agent.actions && agent.actions.length > 0) {
      const registryActions = agent.actions
        .slice(0, maxActions)
        .map(a => a.label || a.description || a.id);
      if (registryActions.length >= 2) return registryActions;
    }

    // Hardcoded domain fallbacks (original logic preserved)
    let fallback;
    switch (agent.id) {
      case '01-sentinel':
        fallback = [
          'Show security status',
          'Scan for brute force attacks',
          'Detect threats',
          'Audit user activity',
          'Revoke expired tokens'
        ];
        break;
      case '02-ledger':
        fallback = [
          'Check data integrity',
          'Detect financial anomalies',
          'Calculate budget rollover',
          'Analyze transactions'
        ];
        break;
      case '04-cortex':
        fallback = [
          'Generate insights',
          'Analyze spending patterns',
          'Optimize budgets',
          'Detect anomalies'
        ];
        break;
      case '07-watchtower':
        fallback = [
          'Check system health',
          'Detect system anomalies',
          'Generate daily report',
          'Show status'
        ];
        break;
      default:
        fallback = [
          'Show status',
          'Run diagnostic',
          'Check health'
        ];
    }
    return fallback.slice(0, maxActions);
  };

  // ── Derived values ────────────────────────────────────────────────────────
  const agentColor = agent.color || theme.palette.primary.main;
  const traits = (agent.personality?.traits || []).slice(0, 3);
  const moodEmoji = agent.mood?.emoji || '';
  const placeholder = getPlaceholder(agent);
  const fallbackThinking = `${agent.name} is typing...`;

  // ═════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═════════════════════════════════════════════════════════════════════════
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 200px)',
        p: 2
      }}
    >
      {/* ── Agent Identity Header ──────────────────────────────────────── */}
      <Box
        sx={{
          mb: 1.5,
          pb: 1.5,
          borderBottom: `2px solid ${agentColor}`
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {/* Avatar with emoji */}
          <Avatar
            sx={{
              width: 38,
              height: 38,
              bgcolor: alpha(agentColor, 0.15),
              fontSize: '1.25rem',
              border: `2px solid ${alpha(agentColor, 0.4)}`
            }}
          >
            {agent.emoji || '🤖'}
          </Avatar>

          {/* Name + role */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 700, lineHeight: 1.2, color: 'text.primary' }}
              >
                {agent.name}
              </Typography>
              {moodEmoji && (
                <Typography component="span" sx={{ fontSize: '1rem', lineHeight: 1 }}>
                  {moodEmoji}
                </Typography>
              )}
            </Box>
            <Typography
              variant="caption"
              sx={{ color: 'text.secondary', lineHeight: 1.2, display: 'block' }}
            >
              {agent.role}
            </Typography>
          </Box>

          {/* Personality trait chips */}
          {traits.length > 0 && (
            <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              {traits.map((trait) => (
                <Chip
                  key={trait}
                  label={trait}
                  size="small"
                  variant="outlined"
                  sx={{
                    height: 22,
                    fontSize: '0.65rem',
                    fontWeight: 600,
                    textTransform: 'capitalize',
                    borderColor: alpha(agentColor, 0.4),
                    color: agentColor,
                    '& .MuiChip-label': { px: 0.75 }
                  }}
                />
              ))}
            </Box>
          )}
        </Box>
      </Box>

      {/* ── Chat messages area ─────────────────────────────────────────── */}
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
            backgroundColor: alpha(agentColor, 0.3),
            borderRadius: '4px',
            '&:hover': {
              backgroundColor: alpha(agentColor, 0.5)
            }
          }
        }}
      >
        {/* Empty state — only shown when messages array is truly empty */}
        {messages.length === 0 && (
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1.5,
              py: 6
            }}
          >
            <Typography sx={{ fontSize: '3rem', lineHeight: 1 }}>
              {agent.emoji || '🤖'}
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
              {agent.name}
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: agentColor, fontWeight: 600 }}
            >
              Ready to assist
            </Typography>
          </Box>
        )}

        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            message={message}
            agent={agent}
            isUser={message.isUser}
          />
        ))}

        {/* ── Contextual typing indicator ──────────────────────────────── */}
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
                backgroundColor: alpha(agentColor, 0.06),
                border: 1,
                borderColor: alpha(agentColor, 0.2),
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                maxWidth: '80%'
              }}
            >
              <CircularProgress
                size={14}
                thickness={5}
                sx={{ color: agentColor, flexShrink: 0 }}
              />
              <Typography
                variant="caption"
                sx={{
                  color: agentColor,
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                {agent.name}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: 'text.secondary',
                  fontStyle: 'italic',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                — {thinkingPhrase || fallbackThinking}
              </Typography>
            </Paper>
          </Box>
        )}

        <div ref={messagesEndRef} />
      </Box>

      {/* ── Quick actions ──────────────────────────────────────────────── */}
      <Box sx={{ mb: 2 }}>
        <Typography
          variant="caption"
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            mb: 1,
            fontSize: '0.75rem',
            fontWeight: 600,
            color: 'text.secondary'
          }}
        >
          <PsychologyIcon sx={{ fontSize: '0.9rem' }} />
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
                borderColor: alpha(agentColor, 0.2),
                '&:hover': {
                  background: `linear-gradient(135deg, ${alpha(agentColor, 0.12)} 0%, ${alpha(agentColor, 0.22)} 100%)`,
                  borderColor: alpha(agentColor, 0.4),
                  transform: 'translateY(-2px)',
                  boxShadow: `0 4px 12px ${alpha(agentColor, 0.25)}`
                }
              }}
            />
          ))}
        </Box>
      </Box>

      {/* ── Input area ─────────────────────────────────────────────────── */}
      <Paper
        elevation={2}
        sx={{
          p: 1.5,
          display: 'flex',
          gap: 1,
          alignItems: 'flex-end',
          borderRadius: 2,
          border: 1,
          borderColor: 'divider',
          transition: 'border-color 0.2s',
          '&:focus-within': {
            borderColor: alpha(agentColor, 0.5)
          }
        }}
      >
        <TextField
          fullWidth
          multiline
          maxRows={4}
          placeholder={placeholder}
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
            backgroundColor: alpha(agentColor, 0.1),
            color: agentColor,
            transition: 'all 0.2s',
            '&:hover': {
              backgroundColor: alpha(agentColor, 0.2),
              transform: 'scale(1.05)'
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
