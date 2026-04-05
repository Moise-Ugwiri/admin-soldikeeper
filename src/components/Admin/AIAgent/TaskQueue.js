/* eslint-disable */
/**
 * TaskQueue — Live agent activity feed
 * Dark mission-control aesthetic with priority colours, status animations,
 * agent emoji avatars, search/filter, and auto-refresh.
 */

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  Chip,
  Paper,
  alpha,
  CircularProgress,
  TextField,
  InputAdornment,
  IconButton,
  Tooltip,
  Select,
  MenuItem,
  Badge,
} from '@mui/material';
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  CheckCircle as DoneIcon,
  RadioButtonUnchecked as PendingIcon,
  Autorenew as SpinIcon,
  ErrorOutline as ErrorIcon,
  FiberManualRecord as DotIcon,
} from '@mui/icons-material';
import { AGENTS } from '../../../data/agentRegistry';

/* ── design tokens (mirrors AIAgentCommandCenter) ── */
const MC = {
  bg:      'rgba(6,12,24,0.0)',
  surface: 'rgba(255,255,255,0.025)',
  mono:    '"JetBrains Mono","Fira Code",monospace',
  green:   '#10b981',
  blue:    '#3b82f6',
  violet:  '#8b5cf6',
  amber:   '#f59e0b',
  red:     '#ef4444',
  slate:   '#64748b',
  slateL:  '#94a3b8',
  text:    '#e2e8f0',
};

const PRIORITY_COLOR = {
  critical: '#ef4444',
  high:     '#f59e0b',
  medium:   '#3b82f6',
  low:      '#64748b',
};

const STATUS_META = {
  completed:   { label: 'Done',        color: MC.green,  Icon: DoneIcon    },
  in_progress: { label: 'Running',     color: MC.blue,   Icon: SpinIcon    },
  started:     { label: 'Running',     color: MC.blue,   Icon: SpinIcon    },
  failed:      { label: 'Failed',      color: MC.red,    Icon: ErrorIcon   },
  pending:     { label: 'Queued',      color: MC.slate,  Icon: PendingIcon },
};

const agentEmoji = (name) => {
  const ag = AGENTS.find(a =>
    a.name?.toLowerCase() === name?.toLowerCase() ||
    a.id?.toLowerCase()   === name?.toLowerCase()
  );
  return ag?.emoji || '🤖';
};

const agentColor = (name) => {
  const ag = AGENTS.find(a =>
    a.name?.toLowerCase() === name?.toLowerCase() ||
    a.id?.toLowerCase()   === name?.toLowerCase()
  );
  return ag?.color || MC.slate;
};

const fmt = (action = '') => action.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
const relTime = (ts) => {
  if (!ts) return '';
  const d = Date.now() - new Date(ts).getTime();
  if (d < 60_000)        return `${Math.floor(d / 1_000)}s ago`;
  if (d < 3_600_000)     return `${Math.floor(d / 60_000)}m ago`;
  if (d < 86_400_000)    return `${Math.floor(d / 3_600_000)}h ago`;
  return `${Math.floor(d / 86_400_000)}d ago`;
};

const API_BASE = process.env.REACT_APP_API_URL || 'https://soldikeeper-backend-production.up.railway.app/api';

const TaskQueue = () => {
  const [tasks,      setTasks]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [search,     setSearch]     = useState('');
  const [filter,     setFilter]     = useState('all');
  const intervalRef = useRef(null);

  const fetchTasks = async (silent = false) => {
    const token = localStorage.getItem('token');
    if (!token) { setLoading(false); return; }
    try {
      if (!silent) silent ? null : setRefreshing(true);
      const res = await axios.get(`${API_BASE}/admin/agents/activity?limit=40`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setTasks(res.data.activities || []);
        setLastUpdate(new Date());
      }
    } catch (e) {
      /* silent fail — stale data is fine */
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTasks();
    intervalRef.current = setInterval(() => fetchTasks(true), 8_000);
    return () => clearInterval(intervalRef.current);
  }, []);

  /* filtered + searched tasks */
  const visible = tasks.filter(t => {
    const matchStatus = filter === 'all' || t.status === filter
      || (filter === 'running' && (t.status === 'started' || t.status === 'in_progress'));
    const q = search.toLowerCase();
    const matchSearch = !q
      || t.agentName?.toLowerCase().includes(q)
      || t.action?.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const running   = tasks.filter(t => t.status === 'started' || t.status === 'in_progress').length;
  const completed = tasks.filter(t => t.status === 'completed').length;
  const failed    = tasks.filter(t => t.status === 'failed').length;

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 6 }}>
        <CircularProgress size={24} sx={{ color: MC.blue }} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', height: '100%', minHeight: 440 }}>

      {/* ── header ── */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: MC.text }}>
            ⚙️ Activity Queue
          </Typography>
          {running > 0 && (
            <Badge
              badgeContent={running}
              sx={{
                '& .MuiBadge-badge': {
                  background: MC.blue, color: '#fff',
                  fontSize: '0.6rem', minWidth: 18, height: 18,
                  animation: 'tq-pulse 2s infinite',
                  '@keyframes tq-pulse': {
                    '0%,100%': { boxShadow: `0 0 0 0 ${MC.blue}60` },
                    '50%':     { boxShadow: `0 0 0 4px ${MC.blue}00` },
                  },
                },
              }}
            >
              <DotIcon sx={{ fontSize: 0 }} />
            </Badge>
          )}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {lastUpdate && (
            <Typography variant="caption" sx={{ color: MC.slate, fontSize: '0.63rem', fontFamily: MC.mono }}>
              {relTime(lastUpdate)}
            </Typography>
          )}
          <Tooltip title="Refresh">
            <IconButton size="small" onClick={() => fetchTasks()} disabled={refreshing} sx={{ color: MC.slateL }}>
              <RefreshIcon sx={{
                fontSize: 16,
                animation: refreshing ? 'tq-spin 0.7s linear infinite' : 'none',
                '@keyframes tq-spin': { from: { transform: 'rotate(0)' }, to: { transform: 'rotate(360deg)' } },
              }} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* ── summary chips ── */}
      <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
        {[
          { label: `${running} Running`,   color: MC.blue,  active: filter === 'running'   },
          { label: `${completed} Done`,    color: MC.green, active: filter === 'completed' },
          { label: `${failed} Failed`,     color: failed > 0 ? MC.red : MC.slate, active: filter === 'failed' },
        ].map(c => (
          <Chip
            key={c.label}
            label={c.label}
            size="small"
            onClick={() => setFilter(f => f === (c.label.split(' ')[1].toLowerCase()) ? 'all' : c.label.split(' ')[1].toLowerCase())}
            sx={{
              height: 22, fontSize: '0.68rem', fontWeight: 700, cursor: 'pointer',
              color: c.color,
              background: c.active ? `rgba(${hexRgbInline(c.color)},0.15)` : `rgba(${hexRgbInline(c.color)},0.06)`,
              border: `1px solid rgba(${hexRgbInline(c.color)},${c.active ? 0.4 : 0.15})`,
              transition: 'all 0.2s',
              '&:hover': { background: `rgba(${hexRgbInline(c.color)},0.15)` },
            }}
          />
        ))}
        {filter !== 'all' && (
          <Chip
            label="All"
            size="small"
            onClick={() => setFilter('all')}
            sx={{ height: 22, fontSize: '0.68rem', color: MC.slateL, background: MC.surface,
                  border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer' }}
          />
        )}
      </Box>

      {/* ── search ── */}
      <TextField
        size="small"
        placeholder="Search by agent or action…"
        value={search}
        onChange={e => setSearch(e.target.value)}
        InputProps={{
          startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 16, color: MC.slate }} /></InputAdornment>,
        }}
        sx={{
          mb: 1.5,
          '& .MuiOutlinedInput-root': {
            borderRadius: 2, fontSize: '0.8rem', color: MC.slateL,
            background: MC.surface,
            '& fieldset': { borderColor: 'rgba(255,255,255,0.08)' },
            '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.16)' },
            '&.Mui-focused fieldset': { borderColor: MC.blue },
          },
          '& input::placeholder': { color: MC.slate, fontSize: '0.78rem' },
        }}
      />

      {/* ── task list ── */}
      <Box sx={{ flex: 1, overflowY: 'auto', pr: 0.5,
        '&::-webkit-scrollbar': { width: 4 },
        '&::-webkit-scrollbar-track': { background: 'transparent' },
        '&::-webkit-scrollbar-thumb': { background: 'rgba(255,255,255,0.08)', borderRadius: 2 },
      }}>
        {visible.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 5 }}>
            <Typography variant="body2" sx={{ color: MC.slate }}>
              {search ? 'No matching tasks' : 'No recent activity'}
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
            {visible.map((task) => {
              const meta  = STATUS_META[task.status] || STATUS_META.pending;
              const color = agentColor(task.agentName);
              const emoji = agentEmoji(task.agentName);

              return (
                <Box
                  key={task._id || Math.random()}
                  sx={{
                    display: 'flex', alignItems: 'flex-start', gap: 1.25,
                    p: 1.25, borderRadius: 2,
                    background: MC.surface,
                    border: `1px solid rgba(255,255,255,0.04)`,
                    transition: 'all 0.2s',
                    '&:hover': {
                      background: 'rgba(255,255,255,0.045)',
                      border: `1px solid rgba(${hexRgbInline(color)},0.15)`,
                      transform: 'translateX(2px)',
                    },
                  }}
                >
                  {/* Agent avatar */}
                  <Box sx={{
                    width: 32, height: 32, borderRadius: 2, flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: `rgba(${hexRgbInline(color)},0.10)`,
                    border: `1px solid rgba(${hexRgbInline(color)},0.25)`,
                    fontSize: '1rem', lineHeight: 1,
                  }}>
                    {emoji}
                  </Box>

                  {/* Content */}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.3 }}>
                      <Typography variant="caption" sx={{
                        fontWeight: 700, color: MC.text, fontSize: '0.78rem',
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                      }}>
                        {fmt(task.action)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap' }}>
                      <Typography variant="caption" sx={{ color, fontWeight: 600, fontSize: '0.67rem', fontFamily: MC.mono }}>
                        {task.agentName || 'Unknown'}
                      </Typography>
                      {task.duration && (
                        <Typography variant="caption" sx={{ color: MC.slate, fontSize: '0.63rem', fontFamily: MC.mono }}>
                          {task.duration}ms
                        </Typography>
                      )}
                      <Typography variant="caption" sx={{ color: MC.slate, fontSize: '0.63rem', ml: 'auto' }}>
                        {relTime(task.createdAt)}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Status indicator */}
                  <Box sx={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                    <meta.Icon sx={{
                      fontSize: 16, color: meta.color,
                      animation: (task.status === 'started' || task.status === 'in_progress')
                        ? 'tq-spin 1.2s linear infinite' : 'none',
                    }} />
                  </Box>
                </Box>
              );
            })}
          </Box>
        )}
      </Box>
    </Box>
  );
};

/* tiny inline hex→rgb helper (avoids importing the full one) */
function hexRgbInline(hex = '#64748b') {
  const h = hex.replace('#', '');
  return `${parseInt(h.slice(0,2),16)},${parseInt(h.slice(2,4),16)},${parseInt(h.slice(4,6),16)}`;
}

export default TaskQueue;
