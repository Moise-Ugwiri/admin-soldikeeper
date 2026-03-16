/* eslint-disable */
/**
 * AgentCommunicationLog — Group-chat-style inter-agent communication view
 *
 * Styled like a Slack channel where agents talk to each other.
 * Each message shows: agent avatar (emoji in colored circle), agent name,
 * timestamp, message content, and a message-type badge.
 *
 * Escalation chains (agent → Apollo → human) are highlighted with a
 * glowing left-border gradient.
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import {
  Box,
  Typography,
  TextField,
  MenuItem,
  InputAdornment,
  Chip,
  Tooltip,
  CircularProgress,
  alpha
} from '@mui/material';
import {
  Search as SearchIcon,
  Circle as StatusDot,
  FilterList as FilterIcon
} from '@mui/icons-material';
import { getAgent, AGENTS } from '../../../data/agentRegistry';

/* ─── constants ───────────────────────────────────────────────────────────── */

const MESSAGE_TYPE_CONFIG = {
  task:          { label: 'Task',          bg: '#1e3a5f', color: '#58a6ff', border: '#58a6ff' },
  escalation:    { label: 'Escalation',    bg: '#5c1a1a', color: '#ff6b6b', border: '#ff6b6b' },
  collaboration: { label: 'Collab',        bg: '#3b1f5e', color: '#c084fc', border: '#c084fc' },
  learning:      { label: 'Learning',      bg: '#1a3d2e', color: '#4ade80', border: '#4ade80' },
  alert:         { label: 'Alert',         bg: '#4a3319', color: '#fbbf24', border: '#fbbf24' },
  request:       { label: 'Request',       bg: '#1e3a5f', color: '#58a6ff', border: '#58a6ff' },
  response:      { label: 'Response',      bg: '#1a3d2e', color: '#4ade80', border: '#4ade80' },
  notification:  { label: 'Notice',        bg: '#4a3319', color: '#fbbf24', border: '#fbbf24' },
  error:         { label: 'Error',         bg: '#5c1a1a', color: '#ff6b6b', border: '#ff6b6b' },
};

const FALLBACK_AGENT = { name: 'System', color: '#8b949e', emoji: '⚙️', bgColor: '#21262d' };

const BG_PRIMARY  = '#0d1117';
const BG_SURFACE  = '#161b22';
const BORDER_DIM  = '#30363d';
const TEXT_PRIMARY = '#e6edf3';
const TEXT_MUTED   = '#8b949e';

/* ─── helpers ─────────────────────────────────────────────────────────────── */

const resolveAgent = (agentId) => getAgent(agentId) || FALLBACK_AGENT;

/** Short relative time — "2m ago", "3h ago" etc.  */
const relativeTime = (iso) => {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 60_000) return 'just now';
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

/** Full timestamp for tooltip on hover */
const fullTimestamp = (iso) => {
  if (!iso) return '';
  return new Date(iso).toLocaleString(undefined, {
    weekday: 'short', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
  });
};

/** Map raw messageType to one of our badge types */
const resolveType = (raw) => MESSAGE_TYPE_CONFIG[raw] ? raw : 'task';

/** Detect escalation chain — message involves Apollo */
const isEscalation = (fromId, toId) =>
  fromId === '00-apollo' || toId === '00-apollo';

/* ─── sub-components ──────────────────────────────────────────────────────── */

/** Colored circle avatar with agent emoji */
const AgentAvatar = ({ agent }) => (
  <Box
    sx={{
      width: 36,
      height: 36,
      minWidth: 36,
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '1.1rem',
      background: `linear-gradient(135deg, ${alpha(agent.color || '#8b949e', 0.35)}, ${alpha(agent.color || '#8b949e', 0.15)})`,
      border: `2px solid ${alpha(agent.color || '#8b949e', 0.5)}`,
      boxShadow: `0 0 8px ${alpha(agent.color || '#8b949e', 0.2)}`,
      userSelect: 'none',
    }}
  >
    {agent.emoji || '🤖'}
  </Box>
);

/** Message type badge chip */
const TypeBadge = ({ type }) => {
  const cfg = MESSAGE_TYPE_CONFIG[type] || MESSAGE_TYPE_CONFIG.task;
  return (
    <Chip
      label={cfg.label}
      size="small"
      sx={{
        height: 20,
        fontSize: '0.65rem',
        fontWeight: 700,
        letterSpacing: '0.03em',
        bgcolor: alpha(cfg.color, 0.15),
        color: cfg.color,
        border: `1px solid ${alpha(cfg.color, 0.25)}`,
        borderRadius: '4px',
        '& .MuiChip-label': { px: 0.8 },
      }}
    />
  );
};

/** Escalation chain indicator */
const EscalationChain = ({ fromAgent, toAgent }) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      gap: 0.5,
      mt: 0.5,
      ml: '52px',
      fontSize: '0.7rem',
      color: '#ff6b6b',
    }}
  >
    <Box sx={{
      width: 14, height: 14, borderRadius: '50%', fontSize: '0.55rem',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      bgcolor: alpha('#ff6b6b', 0.15), border: `1px solid ${alpha('#ff6b6b', 0.3)}`,
    }}>
      {fromAgent.emoji}
    </Box>
    <Box sx={{ color: TEXT_MUTED }}>→</Box>
    <Box sx={{
      width: 14, height: 14, borderRadius: '50%', fontSize: '0.55rem',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      bgcolor: alpha('#fbbf24', 0.15), border: `1px solid ${alpha('#fbbf24', 0.3)}`,
    }}>
      🎯
    </Box>
    <Box sx={{ color: TEXT_MUTED }}>→</Box>
    <Box sx={{
      width: 14, height: 14, borderRadius: '50%', fontSize: '0.55rem',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      bgcolor: alpha('#58a6ff', 0.15), border: `1px solid ${alpha('#58a6ff', 0.3)}`,
    }}>
      👤
    </Box>
    <Typography sx={{ fontSize: '0.65rem', color: alpha('#ff6b6b', 0.8), ml: 0.5, fontWeight: 600 }}>
      Escalation Chain
    </Typography>
  </Box>
);

/* ─── main component ──────────────────────────────────────────────────────── */

const AgentCommunicationLog = ({ maxHeight = 500 }) => {
  const scrollRef = useRef(null);
  const bottomRef = useRef(null);

  const [filter, setFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [communications, setCommunications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [socketRef, setSocketRef] = useState(null);
  const [fetchAttempted, setFetchAttempted] = useState(false);

  /* ── Fetch initial data ───────────────────────────────────────────────── */
  useEffect(() => {
    if (fetchAttempted) return;
    setFetchAttempted(true);

    const token = localStorage.getItem('token');
    if (!token) { setLoading(false); return; }

    axios
      .get(
        `${process.env.REACT_APP_API_URL || 'https://soldikeeper-backend-production.up.railway.app/api'}/admin/agents/communications?limit=100`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then((res) => {
        if (res.data.success) {
          setCommunications(res.data.communications || []);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch agent communications:', err);
        setLoading(false);
      });
  }, [fetchAttempted]);

  /* ── WebSocket real-time updates ──────────────────────────────────────── */
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const wsUrl =
      process.env.REACT_APP_WS_URL ||
      (window.location.protocol === 'https:'
        ? 'wss://soldikeeper-backend-production.up.railway.app'
        : 'ws://localhost:3001');

    const sock = io(wsUrl, {
      path: '/admin/realtime',
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    sock.on('agent:communication', (data) => {
      setCommunications((prev) => [...prev, data].slice(-100));
    });

    setSocketRef(sock);
    return () => { sock.close(); };
  }, []);

  /* ── Auto-scroll on new messages ──────────────────────────────────────── */
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [communications]);

  /* ── Memoised filtered list ───────────────────────────────────────────── */
  const messages = useMemo(() => {
    return communications
      .map((c) => ({
        id: c._id,
        ts: c.createdAt,
        from: c.fromAgent,
        to: c.toAgent,
        text: c.message,
        type: resolveType(c.messageType),
        context: c.context,
      }))
      .filter((m) => {
        if (filter !== 'all' && m.from !== filter && m.to !== filter) return false;
        if (typeFilter !== 'all' && m.type !== typeFilter) return false;
        if (searchTerm && !m.text?.toLowerCase().includes(searchTerm.toLowerCase())) return false;
        return true;
      });
  }, [communications, filter, typeFilter, searchTerm]);

  /* ── Date separators ──────────────────────────────────────────────────── */
  const getDateLabel = useCallback((iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) return 'Today';
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return d.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
  }, []);

  const isConnected = socketRef && socketRef.connected;

  /* ──────────────────────────────────────────────────────────────────────── */
  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: BG_PRIMARY, borderRadius: 2 }}>

      {/* ── Channel header ─────────────────────────────────────────────── */}
      <Box sx={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        px: 2, py: 1.25,
        borderBottom: `1px solid ${BORDER_DIM}`,
        bgcolor: BG_SURFACE,
        borderRadius: '8px 8px 0 0',
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography sx={{ fontSize: '1.15rem' }}>📡</Typography>
          <Box>
            <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: TEXT_PRIMARY, lineHeight: 1.2 }}>
              #agent-comms
            </Typography>
            <Typography sx={{ fontSize: '0.65rem', color: TEXT_MUTED }}>
              Real-time inter-agent communications
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <StatusDot sx={{ fontSize: 8, color: isConnected ? '#4ade80' : '#ff6b6b' }} />
          <Typography sx={{ fontSize: '0.7rem', color: isConnected ? '#4ade80' : '#ff6b6b', fontWeight: 600 }}>
            {isConnected ? 'Live' : 'Offline'}
          </Typography>
          <Typography sx={{ fontSize: '0.7rem', color: TEXT_MUTED, ml: 1 }}>
            {messages.length}/{communications.length}
          </Typography>
        </Box>
      </Box>

      {/* ── Filter bar ─────────────────────────────────────────────────── */}
      <Box sx={{
        display: 'flex', gap: 1, px: 1.5, py: 1,
        borderBottom: `1px solid ${BORDER_DIM}`,
        bgcolor: alpha(BG_SURFACE, 0.6),
      }}>
        <TextField
          select size="small" value={filter}
          onChange={(e) => setFilter(e.target.value)}
          sx={{
            minWidth: 140,
            '& .MuiOutlinedInput-root': {
              bgcolor: BG_PRIMARY, color: TEXT_PRIMARY, fontSize: '0.8rem',
              '& fieldset': { borderColor: BORDER_DIM },
              '&:hover fieldset': { borderColor: TEXT_MUTED },
            },
            '& .MuiInputLabel-root': { color: TEXT_MUTED, fontSize: '0.75rem' },
            '& .MuiSelect-icon': { color: TEXT_MUTED },
          }}
          label="Agent"
        >
          <MenuItem value="all">All Agents</MenuItem>
          {AGENTS.map((a) => (
            <MenuItem key={a.id} value={a.id}>{a.emoji} {a.name}</MenuItem>
          ))}
        </TextField>

        <TextField
          select size="small" value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          sx={{
            minWidth: 120,
            '& .MuiOutlinedInput-root': {
              bgcolor: BG_PRIMARY, color: TEXT_PRIMARY, fontSize: '0.8rem',
              '& fieldset': { borderColor: BORDER_DIM },
              '&:hover fieldset': { borderColor: TEXT_MUTED },
            },
            '& .MuiInputLabel-root': { color: TEXT_MUTED, fontSize: '0.75rem' },
            '& .MuiSelect-icon': { color: TEXT_MUTED },
          }}
          label="Type"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <FilterIcon sx={{ fontSize: 16, color: TEXT_MUTED }} />
              </InputAdornment>
            ),
          }}
        >
          <MenuItem value="all">All Types</MenuItem>
          {Object.entries(MESSAGE_TYPE_CONFIG).map(([key, cfg]) => (
            <MenuItem key={key} value={key}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: cfg.color }} />
                {cfg.label}
              </Box>
            </MenuItem>
          ))}
        </TextField>

        <TextField
          size="small" fullWidth placeholder="Search messages…"
          value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
          sx={{
            '& .MuiOutlinedInput-root': {
              bgcolor: BG_PRIMARY, color: TEXT_PRIMARY, fontSize: '0.8rem',
              '& fieldset': { borderColor: BORDER_DIM },
              '&:hover fieldset': { borderColor: TEXT_MUTED },
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ fontSize: 16, color: TEXT_MUTED }} />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* ── Message stream ─────────────────────────────────────────────── */}
      <Box
        ref={scrollRef}
        sx={{
          flex: 1,
          overflowY: 'auto',
          maxHeight,
          px: 1.5,
          py: 1,
          '&::-webkit-scrollbar': { width: 6 },
          '&::-webkit-scrollbar-track': { bgcolor: 'transparent' },
          '&::-webkit-scrollbar-thumb': { bgcolor: BORDER_DIM, borderRadius: 3, '&:hover': { bgcolor: TEXT_MUTED } },
        }}
      >
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
            <CircularProgress size={28} sx={{ color: '#58a6ff' }} />
          </Box>
        ) : messages.length === 0 ? (
          /* ── Empty state ─────────────────────────────────────────────── */
          <Box sx={{ textAlign: 'center', py: 8, px: 3 }}>
            <Box sx={{ fontSize: '2.5rem', mb: 1.5, opacity: 0.6 }}>💬</Box>
            <Typography sx={{ fontSize: '0.9rem', color: TEXT_MUTED, fontWeight: 500, mb: 0.5 }}>
              {communications.length === 0
                ? 'No inter-agent communications yet'
                : 'No messages match your filters'}
            </Typography>
            <Typography sx={{ fontSize: '0.75rem', color: alpha(TEXT_MUTED, 0.6), maxWidth: 320, mx: 'auto' }}>
              {communications.length === 0
                ? 'Agents will appear here when they collaborate — task assignments, escalations, and insights flow through this channel.'
                : 'Try adjusting the agent or type filter above.'}
            </Typography>
          </Box>
        ) : (
          /* ── Rendered messages ────────────────────────────────────────── */
          messages.map((msg, idx) => {
            const from = resolveAgent(msg.from);
            const to = resolveAgent(msg.to);
            const escalation = isEscalation(msg.from, msg.to);

            /* date separator */
            const prevDate = idx > 0 ? getDateLabel(messages[idx - 1].ts) : null;
            const curDate = getDateLabel(msg.ts);
            const showDateSep = idx === 0 || curDate !== prevDate;

            return (
              <React.Fragment key={msg.id || idx}>
                {/* ── date divider ────────────────────────────────────── */}
                {showDateSep && (
                  <Box sx={{
                    display: 'flex', alignItems: 'center', gap: 1.5,
                    my: 1.5,
                  }}>
                    <Box sx={{ flex: 1, height: '1px', bgcolor: BORDER_DIM }} />
                    <Typography sx={{
                      fontSize: '0.65rem', fontWeight: 700, color: TEXT_MUTED,
                      textTransform: 'uppercase', letterSpacing: '0.05em',
                      whiteSpace: 'nowrap',
                    }}>
                      {curDate}
                    </Typography>
                    <Box sx={{ flex: 1, height: '1px', bgcolor: BORDER_DIM }} />
                  </Box>
                )}

                {/* ── message bubble ──────────────────────────────────── */}
                <Box
                  sx={{
                    display: 'flex',
                    gap: 1.25,
                    py: 0.75,
                    px: 1,
                    borderRadius: 1.5,
                    borderLeft: `3px solid ${escalation ? '#ff6b6b' : alpha(from.color || '#8b949e', 0.5)}`,
                    transition: 'background-color 0.15s ease',
                    '&:hover': {
                      bgcolor: alpha('#ffffff', 0.03),
                      '& .msg-full-ts': { opacity: 1 },
                    },
                    ...(escalation && {
                      background: `linear-gradient(90deg, ${alpha('#ff6b6b', 0.06)} 0%, transparent 40%)`,
                    }),
                  }}
                >
                  {/* avatar */}
                  <AgentAvatar agent={from} />

                  {/* content */}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    {/* name row */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap' }}>
                      <Typography sx={{
                        fontSize: '0.82rem', fontWeight: 700,
                        color: from.color || TEXT_PRIMARY,
                        lineHeight: 1.2,
                      }}>
                        {from.name}
                      </Typography>

                      {/* → target agent */}
                      <Typography sx={{ fontSize: '0.7rem', color: TEXT_MUTED }}>→</Typography>
                      <Typography sx={{
                        fontSize: '0.75rem', fontWeight: 600,
                        color: alpha(to.color || TEXT_MUTED, 0.8),
                        lineHeight: 1.2,
                      }}>
                        {to.emoji} {to.name}
                      </Typography>

                      {/* type badge */}
                      <TypeBadge type={msg.type} />

                      {/* timestamp — short always, full on hover */}
                      <Tooltip title={fullTimestamp(msg.ts)} placement="top" arrow>
                        <Typography
                          className="msg-full-ts"
                          sx={{
                            fontSize: '0.68rem',
                            color: TEXT_MUTED,
                            ml: 'auto',
                            whiteSpace: 'nowrap',
                            cursor: 'default',
                            opacity: 0.6,
                            transition: 'opacity 0.15s ease',
                          }}
                        >
                          {relativeTime(msg.ts)}
                        </Typography>
                      </Tooltip>
                    </Box>

                    {/* message body */}
                    <Typography sx={{
                      fontSize: '0.8rem',
                      color: alpha(TEXT_PRIMARY, 0.88),
                      lineHeight: 1.55,
                      mt: 0.25,
                      wordBreak: 'break-word',
                    }}>
                      {msg.text}
                    </Typography>

                    {/* escalation chain graphic */}
                    {escalation && <EscalationChain fromAgent={from} toAgent={to} />}
                  </Box>
                </Box>
              </React.Fragment>
            );
          })
        )}

        {/* invisible anchor for auto-scroll */}
        <Box ref={bottomRef} />
      </Box>
    </Box>
  );
};

export default AgentCommunicationLog;
