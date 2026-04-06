/* eslint-disable */
/**
 * TaskQueue — Live agent activity feed with expandable drilldown
 *
 * Click any task to expand and see full details: duration, result,
 * execution context, error information, and agent metadata.
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  Chip,
  CircularProgress,
  IconButton,
  Tooltip,
  Collapse,
  Divider,
} from '@mui/material';
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  CheckCircle as DoneIcon,
  RadioButtonUnchecked as PendingIcon,
  Autorenew as SpinIcon,
  ErrorOutline as ErrorIcon,
  ExpandMore as ExpandIcon,
  Timer as TimerIcon,
  Memory as ContextIcon,
  BugReport as BugIcon,
  ArrowForward as ArrowIcon,
} from '@mui/icons-material';
import { AGENTS } from '../../../data/agentRegistry';

/* ── design tokens ── */
const MC = {
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

const STATUS_META = {
  completed:   { label: 'Completed', color: MC.green,  Icon: DoneIcon    },
  in_progress: { label: 'Running',   color: MC.blue,   Icon: SpinIcon    },
  started:     { label: 'Running',   color: MC.blue,   Icon: SpinIcon    },
  failed:      { label: 'Failed',    color: MC.red,    Icon: ErrorIcon   },
  pending:     { label: 'Queued',    color: MC.slate,  Icon: PendingIcon },
};

const hexRgb = (hex = '#64748b') => {
  const h = hex.replace('#', '');
  return `${parseInt(h.slice(0,2),16)},${parseInt(h.slice(2,4),16)},${parseInt(h.slice(4,6),16)}`;
};

const agentLookup = (name) => {
  const ag = AGENTS.find(a =>
    a.name?.toLowerCase() === name?.toLowerCase() ||
    a.id?.toLowerCase() === name?.toLowerCase()
  );
  return { emoji: ag?.emoji || '🤖', color: ag?.color || MC.slate, role: ag?.role || 'Agent' };
};

const fmt = (action = '') => action.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

const relTime = (ts) => {
  if (!ts) return '';
  const d = Date.now() - new Date(ts).getTime();
  if (d < 60_000) return `${Math.floor(d / 1_000)}s ago`;
  if (d < 3_600_000) return `${Math.floor(d / 60_000)}m ago`;
  if (d < 86_400_000) return `${Math.floor(d / 3_600_000)}h ago`;
  return `${Math.floor(d / 86_400_000)}d ago`;
};

const fullTime = (ts) => ts ? new Date(ts).toLocaleString() : '—';
const durationFmt = (ms) => {
  if (!ms && ms !== 0) return '—';
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${Math.floor(ms / 60000)}m ${Math.round((ms % 60000) / 1000)}s`;
};

const API_BASE = process.env.REACT_APP_API_URL || 'https://soldikeeper-backend-production.up.railway.app/api';

/* ═══════════════════════════════════════════════════
 *  EXPANDED DETAIL PANEL — shown when a task is clicked
 * ═══════════════════════════════════════════════════ */
const TaskDetail = ({ task }) => {
  const meta = STATUS_META[task.status] || STATUS_META.pending;
  const agent = agentLookup(task.agentName);

  const details = [
    { icon: <TimerIcon sx={{ fontSize: 14 }} />, label: 'Duration', value: durationFmt(task.duration) },
    { icon: <ContextIcon sx={{ fontSize: 14 }} />, label: 'Agent', value: `${agent.emoji} ${task.agentName || 'Unknown'} — ${agent.role}` },
    { icon: <ArrowIcon sx={{ fontSize: 14 }} />, label: 'Action', value: fmt(task.action) },
    ...(task.trigger ? [{ icon: <ArrowIcon sx={{ fontSize: 14 }} />, label: 'Trigger', value: task.trigger }] : []),
    ...(task.executionId ? [{ icon: <ContextIcon sx={{ fontSize: 14 }} />, label: 'Execution ID', value: task.executionId }] : []),
  ];

  return (
    <Box sx={{
      mt: 1, p: 1.5, borderRadius: 2,
      background: `rgba(${hexRgb(meta.color)},0.04)`,
      border: `1px solid rgba(${hexRgb(meta.color)},0.10)`,
    }}>
      {/* Detail rows */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
        {details.map((d, i) => (
          <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ color: MC.slate, display: 'flex', alignItems: 'center' }}>{d.icon}</Box>
            <Typography variant="caption" sx={{ color: MC.slate, fontSize: '0.65rem', fontWeight: 600, minWidth: 80 }}>
              {d.label}
            </Typography>
            <Typography variant="caption" sx={{
              color: MC.text, fontSize: '0.68rem', fontFamily: MC.mono,
              wordBreak: 'break-all',
            }}>
              {d.value}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* Timestamps */}
      <Divider sx={{ my: 1, borderColor: 'rgba(255,255,255,0.06)' }} />
      <Box sx={{ display: 'flex', gap: 3 }}>
        <Box>
          <Typography variant="caption" sx={{ color: MC.slate, fontSize: '0.6rem', display: 'block' }}>Started</Typography>
          <Typography variant="caption" sx={{ color: MC.slateL, fontSize: '0.65rem', fontFamily: MC.mono }}>
            {fullTime(task.createdAt || task.startedAt)}
          </Typography>
        </Box>
        {task.completedAt && (
          <Box>
            <Typography variant="caption" sx={{ color: MC.slate, fontSize: '0.6rem', display: 'block' }}>Completed</Typography>
            <Typography variant="caption" sx={{ color: MC.slateL, fontSize: '0.65rem', fontFamily: MC.mono }}>
              {fullTime(task.completedAt)}
            </Typography>
          </Box>
        )}
      </Box>

      {/* Error details */}
      {task.status === 'failed' && (task.error || task.errorMessage) && (
        <Box sx={{
          mt: 1, p: 1, borderRadius: 1.5,
          background: `rgba(${hexRgb(MC.red)},0.08)`,
          border: `1px solid rgba(${hexRgb(MC.red)},0.15)`,
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
            <BugIcon sx={{ fontSize: 13, color: MC.red }} />
            <Typography variant="caption" sx={{ color: MC.red, fontWeight: 700, fontSize: '0.65rem' }}>
              Error Details
            </Typography>
          </Box>
          <Typography variant="caption" sx={{
            color: '#fca5a5', fontSize: '0.68rem', fontFamily: MC.mono,
            display: 'block', lineHeight: 1.4, wordBreak: 'break-word',
          }}>
            {task.error || task.errorMessage}
          </Typography>
        </Box>
      )}

      {/* Result context */}
      {task.result && typeof task.result === 'object' && Object.keys(task.result).length > 0 && (
        <Box sx={{
          mt: 1, p: 1, borderRadius: 1.5,
          background: `rgba(${hexRgb(MC.green)},0.06)`,
          border: `1px solid rgba(${hexRgb(MC.green)},0.10)`,
        }}>
          <Typography variant="caption" sx={{ color: MC.green, fontWeight: 700, fontSize: '0.65rem', mb: 0.5, display: 'block' }}>
            Result
          </Typography>
          <Typography variant="caption" sx={{
            color: MC.slateL, fontSize: '0.65rem', fontFamily: MC.mono,
            display: 'block', lineHeight: 1.4, whiteSpace: 'pre-wrap', wordBreak: 'break-word',
            maxHeight: 120, overflow: 'auto',
          }}>
            {JSON.stringify(task.result, null, 2)}
          </Typography>
        </Box>
      )}
    </Box>
  );
};


/* ═══════════════════════════════════════════════════
 *  MAIN TASK QUEUE COMPONENT
 * ═══════════════════════════════════════════════════ */
const TaskQueue = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [expandedId, setExpandedId] = useState(null);
  const intervalRef = useRef(null);

  const fetchTasks = async (silent = false) => {
    const token = localStorage.getItem('token');
    if (!token) { setLoading(false); return; }
    try {
      if (!silent) setRefreshing(true);
      const res = await axios.get(`${API_BASE}/admin/agents/activity?limit=50`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setTasks(res.data.activities || []);
        setLastUpdate(new Date());
      }
    } catch {
      /* silent fail */
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTasks();
    intervalRef.current = setInterval(() => fetchTasks(true), 10_000);
    return () => clearInterval(intervalRef.current);
  }, []);

  const visible = useMemo(() => tasks.filter(t => {
    const matchStatus = filter === 'all' || t.status === filter
      || (filter === 'running' && (t.status === 'started' || t.status === 'in_progress'));
    const q = search.toLowerCase();
    const matchSearch = !q
      || t.agentName?.toLowerCase().includes(q)
      || t.action?.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  }), [tasks, filter, search]);

  const running = tasks.filter(t => t.status === 'started' || t.status === 'in_progress').length;
  const completed = tasks.filter(t => t.status === 'completed').length;
  const failed = tasks.filter(t => t.status === 'failed').length;

  const toggleExpand = (id) => setExpandedId(prev => prev === id ? null : id);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 6 }}>
        <CircularProgress size={22} sx={{ color: MC.blue }} />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 300 }}>

      {/* ── HEADER ── */}
      <Box sx={{ px: 2, pt: 2, pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
          <Typography variant="caption" sx={{
            color: MC.slateL, fontWeight: 700, letterSpacing: 2,
            fontSize: '0.62rem', textTransform: 'uppercase',
          }}>
            ⚙️ Activity Feed
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {lastUpdate && (
              <Typography variant="caption" sx={{ color: MC.slate, fontSize: '0.58rem', fontFamily: MC.mono }}>
                {relTime(lastUpdate)}
              </Typography>
            )}
            <Tooltip title="Refresh">
              <IconButton size="small" onClick={() => fetchTasks()} disabled={refreshing}
                sx={{ color: MC.slateL, p: 0.5 }}>
                <RefreshIcon sx={{
                  fontSize: 14,
                  animation: refreshing ? 'tq-spin 0.7s linear infinite' : 'none',
                  '@keyframes tq-spin': { from: { transform: 'rotate(0)' }, to: { transform: 'rotate(360deg)' } },
                }} />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* ── FILTER CHIPS ── */}
        <Box sx={{ display: 'flex', gap: 0.5, mb: 1.5, flexWrap: 'wrap' }}>
          {[
            { key: 'all', label: `All ${tasks.length}`, color: MC.slateL },
            { key: 'running', label: `${running} Live`, color: MC.blue },
            { key: 'completed', label: `${completed} Done`, color: MC.green },
            { key: 'failed', label: `${failed} Fail`, color: failed > 0 ? MC.red : MC.slate },
          ].map(c => (
            <Chip
              key={c.key}
              label={c.label}
              size="small"
              onClick={() => setFilter(f => f === c.key ? 'all' : c.key)}
              sx={{
                height: 22, fontSize: '0.63rem', fontWeight: 700, cursor: 'pointer',
                color: filter === c.key ? '#fff' : c.color,
                background: filter === c.key
                  ? `rgba(${hexRgb(c.color)},0.25)`
                  : `rgba(${hexRgb(c.color)},0.06)`,
                border: `1px solid rgba(${hexRgb(c.color)},${filter === c.key ? 0.5 : 0.12})`,
                transition: 'all 0.2s',
                '&:hover': { background: `rgba(${hexRgb(c.color)},0.18)` },
              }}
            />
          ))}
        </Box>

        {/* ── SEARCH ── */}
        <Box sx={{
          display: 'flex', alignItems: 'center', gap: 1,
          px: 1.25, py: 0.75, borderRadius: 2,
          background: MC.surface,
          border: '1px solid rgba(255,255,255,0.06)',
          transition: 'border-color 0.2s',
          '&:focus-within': { borderColor: `rgba(${hexRgb(MC.blue)},0.3)` },
        }}>
          <SearchIcon sx={{ fontSize: 15, color: MC.slate }} />
          <input
            type="text"
            placeholder="Search agent or action…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              flex: 1, background: 'transparent', border: 'none', outline: 'none',
              color: MC.slateL, fontSize: '0.75rem', fontFamily: MC.mono,
            }}
          />
        </Box>
      </Box>

      {/* ── TASK LIST ── */}
      <Box sx={{
        flex: 1, overflowY: 'auto', px: 1.5, pb: 1.5, pt: 0.5,
        '&::-webkit-scrollbar': { width: 3 },
        '&::-webkit-scrollbar-track': { background: 'transparent' },
        '&::-webkit-scrollbar-thumb': { background: 'rgba(255,255,255,0.06)', borderRadius: 2 },
      }}>
        {visible.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 5 }}>
            <Typography sx={{ fontSize: '1.5rem', mb: 1 }}>
              {search ? '🔍' : '📭'}
            </Typography>
            <Typography variant="caption" sx={{ color: MC.slate, fontSize: '0.75rem' }}>
              {search ? 'No matching tasks' : 'No recent activity'}
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            {visible.map((task) => {
              const meta = STATUS_META[task.status] || STATUS_META.pending;
              const agent = agentLookup(task.agentName);
              const isExpanded = expandedId === (task._id || task.executionId);
              const isRunning = task.status === 'started' || task.status === 'in_progress';
              const taskKey = task._id || task.executionId || Math.random();

              return (
                <Box key={taskKey}>
                  {/* ── TASK ROW ── */}
                  <Box
                    onClick={() => toggleExpand(task._id || task.executionId)}
                    sx={{
                      display: 'flex', alignItems: 'center', gap: 1,
                      p: 1, borderRadius: 2, cursor: 'pointer',
                      background: isExpanded
                        ? `rgba(${hexRgb(meta.color)},0.06)`
                        : MC.surface,
                      border: `1px solid ${isExpanded
                        ? `rgba(${hexRgb(meta.color)},0.18)`
                        : 'rgba(255,255,255,0.04)'}`,
                      transition: 'all 0.2s',
                      '&:hover': {
                        background: `rgba(${hexRgb(agent.color)},0.06)`,
                        border: `1px solid rgba(${hexRgb(agent.color)},0.12)`,
                      },
                    }}
                  >
                    {/* Agent emoji */}
                    <Box sx={{
                      width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: `rgba(${hexRgb(agent.color)},0.12)`,
                      border: `1.5px solid rgba(${hexRgb(agent.color)},0.25)`,
                      fontSize: '0.85rem',
                    }}>
                      {agent.emoji}
                    </Box>

                    {/* Content */}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="caption" sx={{
                        fontWeight: 700, color: MC.text, fontSize: '0.73rem',
                        display: 'block', lineHeight: 1.2,
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                      }}>
                        {fmt(task.action)}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.25 }}>
                        <Typography variant="caption" sx={{
                          color: agent.color, fontWeight: 600, fontSize: '0.62rem',
                        }}>
                          {task.agentName || 'Unknown'}
                        </Typography>
                        {task.duration != null && (
                          <Typography variant="caption" sx={{ color: MC.slate, fontSize: '0.58rem', fontFamily: MC.mono }}>
                            {durationFmt(task.duration)}
                          </Typography>
                        )}
                      </Box>
                    </Box>

                    {/* Right side: time + status + expand */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexShrink: 0 }}>
                      <Typography variant="caption" sx={{ color: MC.slate, fontSize: '0.58rem', fontFamily: MC.mono }}>
                        {relTime(task.createdAt)}
                      </Typography>
                      <Tooltip title={meta.label}>
                        <meta.Icon sx={{
                          fontSize: 15, color: meta.color,
                          animation: isRunning ? 'tq-spin 1.2s linear infinite' : 'none',
                          '@keyframes tq-spin': { from: { transform: 'rotate(0)' }, to: { transform: 'rotate(360deg)' } },
                        }} />
                      </Tooltip>
                      <ExpandIcon sx={{
                        fontSize: 16, color: MC.slate,
                        transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)',
                        transition: 'transform 0.2s',
                      }} />
                    </Box>
                  </Box>

                  {/* ── EXPANDED DETAIL ── */}
                  <Collapse in={isExpanded} timeout={200}>
                    <Box sx={{ pl: 5.5, pr: 0.5 }}>
                      <TaskDetail task={task} />
                    </Box>
                  </Collapse>
                </Box>
              );
            })}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default TaskQueue;
