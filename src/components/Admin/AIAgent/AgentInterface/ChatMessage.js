/**
 * 💬 CHAT MESSAGE COMPONENT
 * Displays individual chat messages in agent conversations
 * - Different styles for user vs agent messages
 * - Timestamp display
 * - Markdown support for agent responses
 * - Execution result cards for intent-triggered actions
 */

import React from 'react';
import { Box, Typography, Paper, Chip, alpha, Divider } from '@mui/material';
import ReactMarkdown from 'react-markdown';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import FlashOnIcon from '@mui/icons-material/FlashOn';

const ExecutionResultCard = ({ execution, agent }) => {
  if (!execution) return null;
  const hasError = !!execution.error;
  const result = execution.result;

  return (
    <Box
      sx={{
        mt: 1.5,
        p: 1.5,
        borderRadius: 2,
        border: 1,
        borderColor: hasError ? 'error.main' : alpha(agent.color, 0.4),
        backgroundColor: hasError ? alpha('#f44336', 0.05) : alpha(agent.color, 0.04)
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        {hasError
          ? <ErrorIcon sx={{ fontSize: 16, color: 'error.main' }} />
          : <CheckCircleIcon sx={{ fontSize: 16, color: agent.color }} />}
        <Typography variant="caption" sx={{ fontWeight: 700, color: hasError ? 'error.main' : agent.color }}>
          {hasError ? 'Execution Failed' : `Action Executed: ${execution.action}`}
        </Typography>
        <Chip
          icon={<FlashOnIcon sx={{ fontSize: 12 }} />}
          label="Live"
          size="small"
          sx={{
            height: 18, fontSize: '0.65rem',
            backgroundColor: alpha(agent.color, 0.15),
            color: agent.color,
            '& .MuiChip-icon': { color: agent.color }
          }}
        />
      </Box>

      {hasError ? (
        <Typography variant="caption" sx={{ color: 'error.main' }}>{execution.error}</Typography>
      ) : result ? (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {Object.entries(result)
            .filter(([k]) => !['generatedAt', 'executedAt'].includes(k))
            .map(([key, val]) => {
              const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase());
              const display = typeof val === 'object' ? JSON.stringify(val).slice(0, 60) + '…' : String(val);
              return (
                <Box key={key} sx={{ p: 0.75, borderRadius: 1, backgroundColor: alpha(agent.color, 0.08), minWidth: 80 }}>
                  <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', fontSize: '0.65rem' }}>{label}</Typography>
                  <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.75rem' }}>{display}</Typography>
                </Box>
              );
            })}
        </Box>
      ) : null}
    </Box>
  );
};

const ChatMessage = ({ message, agent, isUser }) => {
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString();
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: isUser ? 'flex-end' : 'flex-start',
        mb: 2,
        maxWidth: '85%',
        alignSelf: isUser ? 'flex-end' : 'flex-start'
      }}
    >
      {/* Message sender label */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          mb: 0.5,
          px: 1
        }}
      >
        {!isUser && (
          <Typography
            component="span"
            sx={{
              fontSize: '1.2rem',
              lineHeight: 1
            }}
          >
            {agent.emoji}
          </Typography>
        )}
        <Typography
          variant="caption"
          sx={{
            fontSize: '0.75rem',
            fontWeight: 600,
            color: isUser ? 'text.secondary' : agent.color
          }}
        >
          {isUser ? 'You' : agent.name}
        </Typography>
        {isUser && (
          <Typography
            component="span"
            sx={{
              fontSize: '1rem',
              lineHeight: 1
            }}
          >
            👤
          </Typography>
        )}
        {!isUser && message.model && (
          <Chip
            label={message.model}
            size="small"
            sx={{ height: 16, fontSize: '0.6rem', ml: 0.5, opacity: 0.6 }}
          />
        )}
      </Box>

      {/* Message bubble */}
      <Paper
        elevation={0}
        sx={{
          p: 1.5,
          borderRadius: 2,
          backgroundColor: isUser
            ? alpha(agent.color, 0.1)
            : 'background.paper',
          border: isUser ? 'none' : 1,
          borderColor: message.action === 'intent_executed' ? alpha(agent.color, 0.4) : 'divider',
          wordWrap: 'break-word',
          width: '100%'
        }}
      >
        {isUser ? (
          <Typography
            variant="body2"
            sx={{
              fontSize: '0.875rem',
              lineHeight: 1.5,
              color: 'text.primary'
            }}
          >
            {message.content}
          </Typography>
        ) : (
          <Box
            sx={{
              fontSize: '0.875rem',
              lineHeight: 1.6,
              color: 'text.primary',
              '& p': { margin: 0, mb: 1 },
              '& p:last-child': { mb: 0 },
              '& ul, & ol': { margin: 0, pl: 2 },
              '& code': {
                backgroundColor: alpha(agent.color, 0.1),
                padding: '2px 6px',
                borderRadius: 1,
                fontSize: '0.85em',
                fontFamily: 'monospace'
              },
              '& pre': {
                backgroundColor: alpha(agent.color, 0.05),
                p: 1,
                borderRadius: 1,
                overflow: 'auto'
              }
            }}
          >
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </Box>
        )}

        {/* Execution result card — only for intent_executed actions */}
        {!isUser && message.execution && (
          <>
            <Divider sx={{ my: 1 }} />
            <ExecutionResultCard execution={message.execution} agent={agent} />
          </>
        )}
      </Paper>

      {/* Timestamp */}
      <Typography
        variant="caption"
        sx={{
          fontSize: '0.7rem',
          color: 'text.disabled',
          mt: 0.5,
          px: 1
        }}
      >
        {formatTime(message.timestamp)}
        {!isUser && message.action === 'intent_executed' && (
          <Box component="span" sx={{ ml: 1, color: agent.color, fontWeight: 600 }}>
            ⚡ Action executed
          </Box>
        )}
      </Typography>
    </Box>
  );
};

export default ChatMessage;
