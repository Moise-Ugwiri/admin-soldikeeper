/**
 * 💬 CHAT MESSAGE COMPONENT — Personality-Driven Message Bubbles
 *
 * Rich, human-feeling chat messages for agent conversations.
 * Each agent's personality shapes how their messages look and feel:
 *   • Prominent avatar with agent color & emoji
 *   • Confidence badges, tool pills, reasoning panels
 *   • Slide-in animations, personality-driven typography
 *   • Enhanced execution result cards with color theming
 */

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  Avatar,
  Collapse,
  IconButton,
  Tooltip,
  Divider,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import ReactMarkdown from 'react-markdown';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PsychologyIcon from '@mui/icons-material/Psychology';
import GroupsIcon from '@mui/icons-material/Groups';
import BuildIcon from '@mui/icons-material/Build';
import { getAgent } from '../../../../data/agentRegistry';

// ─── Slide-in keyframes injected once ────────────────────────────────────────
const keyframesInjected = { current: false };
const injectKeyframes = () => {
  if (keyframesInjected.current) return;
  keyframesInjected.current = true;
  const style = document.createElement('style');
  style.textContent = `
    @keyframes cmSlideLeft {
      from { opacity: 0; transform: translateX(-20px); }
      to   { opacity: 1; transform: translateX(0); }
    }
    @keyframes cmSlideRight {
      from { opacity: 0; transform: translateX(20px); }
      to   { opacity: 1; transform: translateX(0); }
    }
    @keyframes cmCheckPop {
      0%   { transform: scale(0); opacity: 0; }
      60%  { transform: scale(1.2); opacity: 1; }
      100% { transform: scale(1); opacity: 1; }
    }
  `;
  document.head.appendChild(style);
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Relative-time formatter */
const formatTime = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hr${diffHours > 1 ? 's' : ''} ago`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

/** Derive personality-driven style overrides */
const personalityStyles = (agent) => {
  const p = agent?.personality || {};
  const tone = p.tone || 'neutral';
  const verbosity = p.verbosity || 'balanced';

  // Font weight: terse → bold & punchy, verbose → lighter reading weight
  const fontWeight = verbosity === 'minimal' || verbosity === 'terse' ? 500 : 400;

  // Border-radius: creative → more rounded, formal → sharper
  const bubbleRadius = tone === 'creative' || tone === 'friendly' || tone === 'witty'
    ? '16px 16px 16px 4px'
    : tone === 'formal' || tone === 'analytical'
      ? '8px 8px 8px 2px'
      : '12px 12px 12px 4px';

  // Letter-spacing: formal → slightly tighter
  const letterSpacing = tone === 'formal' ? '-0.01em' : 'normal';

  return { fontWeight, bubbleRadius, letterSpacing };
};

/** Pick a tool emoji based on common tool name keywords */
const toolEmoji = (toolName) => {
  const t = (toolName || '').toLowerCase();
  if (t.includes('query') || t.includes('search') || t.includes('find')) return '🔍';
  if (t.includes('analyz') || t.includes('chart') || t.includes('stat')) return '📊';
  if (t.includes('create') || t.includes('insert') || t.includes('add')) return '✏️';
  if (t.includes('delete') || t.includes('remove')) return '🗑️';
  if (t.includes('update') || t.includes('edit') || t.includes('patch')) return '🔄';
  if (t.includes('send') || t.includes('notify') || t.includes('email')) return '📨';
  if (t.includes('calculate') || t.includes('compute')) return '🧮';
  if (t.includes('validate') || t.includes('check')) return '✅';
  return '⚙️';
};

// ─── Confidence Badge ─────────────────────────────────────────────────────────

const ConfidenceBadge = ({ confidence, agentColor }) => {
  if (confidence == null) return null;
  const pct = Math.round(confidence);
  let color, bg, icon, label;
  if (pct > 80) {
    color = '#2e7d32'; bg = alpha('#4caf50', 0.12); icon = '✓'; label = 'Confident';
  } else if (pct >= 50) {
    color = '#e65100'; bg = alpha('#ff9800', 0.12); icon = '~'; label = 'Likely';
  } else {
    color = '#c62828'; bg = alpha('#f44336', 0.12); icon = '?'; label = 'Uncertain';
  }
  return (
    <Chip
      size="small"
      label={`${icon} ${label} (${pct}%)`}
      sx={{
        height: 22,
        fontSize: '0.7rem',
        fontWeight: 600,
        color,
        backgroundColor: bg,
        border: `1px solid ${alpha(color, 0.3)}`,
        '& .MuiChip-label': { px: 1 },
      }}
    />
  );
};

// ─── Tools Used Pills ─────────────────────────────────────────────────────────

const ToolsPills = ({ tools, agentColor }) => {
  if (!tools || tools.length === 0) return null;
  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
      <BuildIcon sx={{ fontSize: 14, color: 'text.disabled', mr: 0.25, mt: '3px' }} />
      {tools.map((tool, i) => (
        <Chip
          key={`${tool}-${i}`}
          size="small"
          label={`${toolEmoji(tool)} ${tool}`}
          sx={{
            height: 22,
            fontSize: '0.65rem',
            fontWeight: 500,
            backgroundColor: alpha(agentColor, 0.08),
            color: 'text.secondary',
            border: `1px solid ${alpha(agentColor, 0.15)}`,
            '& .MuiChip-label': { px: 0.75 },
          }}
        />
      ))}
    </Box>
  );
};

// ─── Reasoning Collapsible ────────────────────────────────────────────────────

const ReasoningPanel = ({ reasoning, agentColor }) => {
  const [open, setOpen] = useState(false);
  if (!reasoning) return null;

  // Support both string and array reasoning
  const steps = Array.isArray(reasoning) ? reasoning : [reasoning];

  return (
    <Box sx={{ mt: 1 }}>
      <Box
        onClick={() => setOpen((o) => !o)}
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 0.5,
          cursor: 'pointer',
          userSelect: 'none',
          '&:hover': { opacity: 0.8 },
        }}
      >
        <PsychologyIcon sx={{ fontSize: 15, color: agentColor }} />
        <Typography
          variant="caption"
          sx={{ fontSize: '0.72rem', fontWeight: 600, color: agentColor }}
        >
          {open ? 'Hide reasoning' : 'Show reasoning'}
        </Typography>
        <IconButton size="small" sx={{ p: 0, ml: -0.25 }}>
          <ExpandMoreIcon
            sx={{
              fontSize: 16,
              color: agentColor,
              transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 200ms ease',
            }}
          />
        </IconButton>
      </Box>
      <Collapse in={open} timeout={250}>
        <Box
          sx={{
            mt: 0.75,
            pl: 1.5,
            borderLeft: `2px solid ${alpha(agentColor, 0.25)}`,
          }}
        >
          {steps.map((step, idx) => (
            <Typography
              key={idx}
              variant="caption"
              sx={{
                display: 'block',
                fontSize: '0.73rem',
                lineHeight: 1.5,
                color: 'text.secondary',
                mb: 0.5,
                '&:last-child': { mb: 0 },
              }}
            >
              {steps.length > 1 ? `${idx + 1}. ${step}` : step}
            </Typography>
          ))}
        </Box>
      </Collapse>
    </Box>
  );
};

// ─── Collaborators Badge ──────────────────────────────────────────────────────

const CollaboratorsBadge = ({ collaborators }) => {
  if (!collaborators || collaborators.length === 0) return null;

  // Resolve collaborator agent objects
  const resolved = collaborators
    .map((c) => {
      if (typeof c === 'string') return getAgent(c);
      if (c && c.id) return getAgent(c.id) || c;
      return c;
    })
    .filter(Boolean);

  if (resolved.length === 0) return null;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
      <GroupsIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
      <Typography variant="caption" sx={{ fontSize: '0.7rem', color: 'text.secondary', mr: 0.25 }}>
        Consulted with
      </Typography>
      {resolved.map((a) => (
        <Tooltip key={a.id || a.name} title={a.role || a.name || ''} arrow>
          <Chip
            size="small"
            avatar={
              <Avatar sx={{ bgcolor: alpha(a.color || '#666', 0.2), width: 18, height: 18, fontSize: '0.65rem' }}>
                {a.emoji || '🤖'}
              </Avatar>
            }
            label={a.name || a.id}
            sx={{
              height: 22,
              fontSize: '0.65rem',
              fontWeight: 600,
              backgroundColor: alpha(a.color || '#666', 0.08),
              color: a.color || 'text.secondary',
              border: `1px solid ${alpha(a.color || '#666', 0.2)}`,
              '& .MuiChip-label': { px: 0.5 },
            }}
          />
        </Tooltip>
      ))}
    </Box>
  );
};

// ─── Execution Result Card (Enhanced) ─────────────────────────────────────────

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
        borderColor: hasError ? 'error.main' : alpha(agent.color, 0.35),
        backgroundColor: hasError ? alpha('#f44336', 0.05) : alpha(agent.color, 0.04),
        position: 'relative',
        overflow: 'hidden',
        // Subtle left accent matching agent color
        '&::before': {
          content: '""',
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: 3,
          backgroundColor: hasError ? '#f44336' : agent.color,
          borderRadius: '3px 0 0 3px',
        },
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        {hasError ? (
          <ErrorIcon sx={{ fontSize: 18, color: 'error.main' }} />
        ) : (
          <CheckCircleIcon
            sx={{
              fontSize: 18,
              color: agent.color,
              animation: 'cmCheckPop 400ms ease-out',
            }}
          />
        )}
        <Typography
          variant="caption"
          sx={{ fontWeight: 700, fontSize: '0.76rem', color: hasError ? 'error.main' : agent.color }}
        >
          {hasError ? 'Execution Failed' : `Action Executed: ${execution.action}`}
        </Typography>
        <Chip
          icon={<FlashOnIcon sx={{ fontSize: 12 }} />}
          label="Live"
          size="small"
          sx={{
            height: 18,
            fontSize: '0.63rem',
            fontWeight: 600,
            backgroundColor: alpha(agent.color, 0.15),
            color: agent.color,
            '& .MuiChip-icon': { color: agent.color },
          }}
        />
      </Box>

      {/* Error display with recovery hint */}
      {hasError ? (
        <Box>
          <Typography variant="caption" sx={{ color: 'error.main', display: 'block', mb: 0.5 }}>
            {execution.error}
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: 'text.secondary', fontSize: '0.68rem', fontStyle: 'italic' }}
          >
            💡 Try rephrasing your request or check if the required data exists.
          </Typography>
        </Box>
      ) : result ? (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {Object.entries(result)
            .filter(([k]) => !['generatedAt', 'executedAt'].includes(k))
            .map(([key, val]) => {
              const label = key
                .replace(/([A-Z])/g, ' $1')
                .replace(/^./, (s) => s.toUpperCase());
              const display =
                typeof val === 'object'
                  ? JSON.stringify(val).slice(0, 60) + '…'
                  : String(val);
              return (
                <Box
                  key={key}
                  sx={{
                    p: 0.75,
                    borderRadius: 1,
                    backgroundColor: alpha(agent.color, 0.08),
                    minWidth: 80,
                    border: `1px solid ${alpha(agent.color, 0.1)}`,
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      display: 'block',
                      color: 'text.secondary',
                      fontSize: '0.63rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                    }}
                  >
                    {label}
                  </Typography>
                  <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.78rem' }}>
                    {display}
                  </Typography>
                </Box>
              );
            })}
        </Box>
      ) : null}
    </Box>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const ChatMessage = ({ message, agent, isUser }) => {
  const theme = useTheme();

  // Inject animation keyframes on first render
  React.useEffect(() => { injectKeyframes(); }, []);

  // Safely extract optional new fields
  const confidence = message?.confidence;
  const toolsUsed = message?.toolsUsed;
  const reasoning = message?.reasoning;
  const collaborators = message?.collaborators;

  // Agent personality style overrides
  const pStyles = personalityStyles(agent);
  const agentColor = agent?.color || theme.palette.primary.main;

  // ── User Message ──────────────────────────────────────────────────────────
  if (isUser) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          mb: 2.5,
          maxWidth: '80%',
          alignSelf: 'flex-end',
          animation: 'cmSlideRight 300ms ease-out both',
        }}
      >
        {/* User label */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5, pr: 0.5 }}>
          <Typography
            variant="caption"
            sx={{ fontSize: '0.73rem', fontWeight: 600, color: 'text.secondary' }}
          >
            You
          </Typography>
          <Typography component="span" sx={{ fontSize: '0.9rem', lineHeight: 1 }}>
            👤
          </Typography>
        </Box>

        {/* User bubble */}
        <Paper
          elevation={0}
          sx={{
            p: 1.5,
            px: 2,
            borderRadius: '12px 12px 4px 12px',
            backgroundColor: alpha(agentColor, 0.1),
            wordWrap: 'break-word',
            width: '100%',
          }}
        >
          <Typography
            variant="body2"
            sx={{ fontSize: '0.875rem', lineHeight: 1.55, color: 'text.primary' }}
          >
            {message.content}
          </Typography>
        </Paper>

        {/* Timestamp */}
        <Typography
          variant="caption"
          sx={{ fontSize: '0.68rem', color: 'text.disabled', mt: 0.5, pr: 0.5 }}
        >
          {formatTime(message.timestamp)}
        </Typography>
      </Box>
    );
  }

  // ── Agent Message ─────────────────────────────────────────────────────────
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 1.5,
        mb: 2.5,
        maxWidth: '88%',
        alignSelf: 'flex-start',
        animation: 'cmSlideLeft 300ms ease-out both',
      }}
    >
      {/* ── Agent Avatar Column ── */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          flexShrink: 0,
          pt: 0.25,
        }}
      >
        <Avatar
          sx={{
            width: 40,
            height: 40,
            backgroundColor: alpha(agentColor, 0.15),
            border: `2px solid ${alpha(agentColor, 0.35)}`,
            fontSize: '1.25rem',
          }}
        >
          {agent?.emoji || '🤖'}
        </Avatar>
        <Typography
          variant="caption"
          sx={{
            fontSize: '0.62rem',
            fontWeight: 700,
            color: agentColor,
            mt: 0.5,
            textAlign: 'center',
            lineHeight: 1.1,
            maxWidth: 52,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {agent?.name || 'Agent'}
        </Typography>
      </Box>

      {/* ── Message Content Column ── */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        {/* Bubble */}
        <Paper
          elevation={0}
          sx={{
            p: 0,
            borderRadius: pStyles.bubbleRadius,
            backgroundColor: 'background.paper',
            border: 1,
            borderColor:
              message.action === 'intent_executed'
                ? alpha(agentColor, 0.4)
                : 'divider',
            borderLeft: `3px solid ${agentColor}`,
            wordWrap: 'break-word',
            overflow: 'hidden',
          }}
        >
          {/* ── Header: Name chip + Role badge + Model chip ── */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 0.75,
              px: 1.5,
              pt: 1.25,
              pb: 0.5,
            }}
          >
            <Typography
              variant="caption"
              sx={{
                fontWeight: 700,
                fontSize: '0.78rem',
                color: agentColor,
              }}
            >
              {agent?.name || 'Agent'}
            </Typography>

            {agent?.role && (
              <Chip
                size="small"
                label={agent.role.length > 35 ? agent.role.slice(0, 32) + '…' : agent.role}
                sx={{
                  height: 18,
                  fontSize: '0.6rem',
                  fontWeight: 500,
                  backgroundColor: alpha(agentColor, 0.08),
                  color: 'text.secondary',
                  '& .MuiChip-label': { px: 0.75 },
                }}
              />
            )}

            {message.model && (
              <Chip
                size="small"
                label={message.model}
                sx={{
                  height: 18,
                  fontSize: '0.58rem',
                  fontWeight: 500,
                  backgroundColor: alpha('#9e9e9e', 0.1),
                  color: 'text.disabled',
                  '& .MuiChip-label': { px: 0.6 },
                }}
              />
            )}
          </Box>

          {/* ── Body: Markdown content ── */}
          <Box
            sx={{
              px: 1.5,
              pt: 0.5,
              pb: 1.25,
              fontSize: '0.875rem',
              lineHeight: 1.65,
              fontWeight: pStyles.fontWeight,
              letterSpacing: pStyles.letterSpacing,
              color: 'text.primary',
              '& p': { margin: 0, mb: 1 },
              '& p:last-child': { mb: 0 },
              '& ul, & ol': { margin: 0, pl: 2.5, mb: 1 },
              '& li': { mb: 0.25 },
              '& code': {
                backgroundColor: alpha(agentColor, 0.1),
                padding: '2px 6px',
                borderRadius: '4px',
                fontSize: '0.84em',
                fontFamily: '"Fira Code", "Cascadia Code", monospace',
              },
              '& pre': {
                backgroundColor: alpha(agentColor, 0.05),
                p: 1.25,
                borderRadius: '6px',
                overflow: 'auto',
                fontSize: '0.82em',
                border: `1px solid ${alpha(agentColor, 0.1)}`,
              },
              '& blockquote': {
                borderLeft: `3px solid ${alpha(agentColor, 0.3)}`,
                pl: 1.5,
                ml: 0,
                color: 'text.secondary',
                fontStyle: 'italic',
              },
              '& strong': { fontWeight: 600 },
              '& a': { color: agentColor, textDecoration: 'underline' },
            }}
          >
            <ReactMarkdown>{message.content || ''}</ReactMarkdown>
          </Box>

          {/* ── Confidence + Tools + Reasoning + Collaborators ── */}
          {(confidence != null || (toolsUsed && toolsUsed.length > 0) || reasoning || (collaborators && collaborators.length > 0)) && (
            <Box sx={{ px: 1.5, pb: 1.25 }}>
              <Divider sx={{ mb: 1, borderColor: alpha(agentColor, 0.1) }} />

              {/* Confidence badge */}
              {confidence != null && (
                <Box sx={{ mb: toolsUsed || reasoning || collaborators ? 0.75 : 0 }}>
                  <ConfidenceBadge confidence={confidence} agentColor={agentColor} />
                </Box>
              )}

              {/* Tools used */}
              <ToolsPills tools={toolsUsed} agentColor={agentColor} />

              {/* Reasoning panel */}
              <ReasoningPanel reasoning={reasoning} agentColor={agentColor} />

              {/* Collaborators */}
              <CollaboratorsBadge collaborators={collaborators} />
            </Box>
          )}

          {/* ── Execution Result Card ── */}
          {message.execution && (
            <Box sx={{ px: 1.5, pb: 1.5 }}>
              <Divider sx={{ mb: 1, borderColor: alpha(agentColor, 0.12) }} />
              <ExecutionResultCard execution={message.execution} agent={agent} />
            </Box>
          )}
        </Paper>

        {/* ── Timestamp Row ── */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.75,
            mt: 0.5,
            pl: 0.5,
            flexWrap: 'wrap',
          }}
        >
          <Typography variant="caption" sx={{ fontSize: '0.68rem', color: 'text.disabled' }}>
            {formatTime(message.timestamp)}
          </Typography>

          {message.action === 'intent_executed' && (
            <Chip
              icon={<FlashOnIcon sx={{ fontSize: 11 }} />}
              label="Action executed"
              size="small"
              sx={{
                height: 18,
                fontSize: '0.62rem',
                fontWeight: 600,
                backgroundColor: alpha(agentColor, 0.12),
                color: agentColor,
                '& .MuiChip-icon': { color: agentColor },
                '& .MuiChip-label': { px: 0.5 },
              }}
            />
          )}

          {confidence != null && (
            <Typography
              variant="caption"
              sx={{
                fontSize: '0.65rem',
                color: 'text.disabled',
                fontWeight: 500,
              }}
            >
              {Math.round(confidence)}% confidence
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default ChatMessage;
