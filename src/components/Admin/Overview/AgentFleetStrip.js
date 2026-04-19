import React, { memo, useEffect, useState, useCallback } from 'react';
import { Box, Stack, Typography, Tooltip, Chip, IconButton, Skeleton, alpha, useTheme } from '@mui/material';
import { OpenInNewRounded, RefreshRounded, SmartToyRounded } from '@mui/icons-material';
import apiClient from '../../../services/api';
import { AGENTS as STATIC_AGENTS } from '../../../data/agentRegistry';

/**
 * AgentFleetStrip — horizontal scrolling AI agent fleet with live status dots.
 * Pulls /admin/agent-management/fleet-status and merges with static registry metadata.
 * Click an agent → opens AI tab via callback.
 */
const STATUS_COLOR = {
  active:  '#10b981',
  busy:    '#f59e0b',
  working: '#3b82f6',
  idle:    '#94a3b8',
  error:   '#ef4444',
  offline: '#64748b',
};

const AgentFleetStrip = ({ onOpenAI }) => {
  const theme = useTheme();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchFleet = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await apiClient.get('/admin/agent-management/fleet-status');
      const payload = res.data?.data || res.data || {};
      setData(payload);
    } catch {
      // fallback — use registry
      setData({
        agents: STATIC_AGENTS.map(a => ({
          id: a.id, name: a.name, role: a.role, status: 'idle',
          tasksToday: 0, successRate: 100,
        })),
        summary: {
          totalAgents: STATIC_AGENTS.length,
          activeNow: 0,
          tasksToday: 0,
          avgSuccessRate: 100,
        },
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFleet();
    const t = setInterval(() => fetchFleet(true), 30000);
    return () => clearInterval(t);
  }, [fetchFleet]);

  const meta = (id) => STATIC_AGENTS.find(s => s.id === id) || {};

  const agents = data?.agents || [];
  const summary = data?.summary || {};

  return (
    <Box
      sx={{
        p: { xs: 1.5, sm: 2 },
        borderRadius: 2.5,
        bgcolor: 'background.paper',
        border: `1px solid ${theme.palette.divider}`,
        height: '100%',
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.25 }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <SmartToyRounded sx={{ fontSize: 18, color: 'primary.main' }} />
          <Typography sx={{ fontSize: 13, fontWeight: 800, letterSpacing: 0.5 }}>AGENT FLEET</Typography>
          {!loading && (
            <Chip
              size="small"
              label={`${summary.activeNow ?? 0}/${summary.totalAgents ?? agents.length} ONLINE`}
              sx={{
                height: 20,
                fontSize: 10,
                fontWeight: 800,
                letterSpacing: 0.5,
                bgcolor: alpha(theme.palette.success.main, 0.12),
                color: 'success.main',
                border: `1px solid ${alpha(theme.palette.success.main, 0.35)}`,
              }}
            />
          )}
        </Stack>
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="Refresh">
            <IconButton size="small" onClick={() => fetchFleet()}>
              <RefreshRounded sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
          {onOpenAI && (
            <Tooltip title="Open AI Center">
              <IconButton size="small" onClick={onOpenAI}>
                <OpenInNewRounded sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
          )}
        </Stack>
      </Stack>

      {/* Horizontal scrolling fleet */}
      <Box
        sx={{
          display: 'flex',
          gap: 1,
          overflowX: 'auto',
          pb: 0.75,
          scrollbarWidth: 'thin',
          '&::-webkit-scrollbar': { height: 6 },
          '&::-webkit-scrollbar-thumb': { bgcolor: alpha(theme.palette.text.primary, 0.18), borderRadius: 3 },
        }}
      >
        {loading
          ? Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} variant="rounded" width={130} height={88} sx={{ flex: '0 0 auto', borderRadius: 2 }} />
            ))
          : agents.map((a) => {
              const m = meta(a.id);
              const c = m.color || theme.palette.primary.main;
              const statusColor = STATUS_COLOR[a.status] || STATUS_COLOR.idle;
              return (
                <Tooltip
                  key={a.id}
                  arrow
                  title={
                    <Box sx={{ p: 0.5 }}>
                      <Typography sx={{ fontWeight: 700, fontSize: 12 }}>{a.name} · {m.role || a.role}</Typography>
                      <Typography sx={{ fontSize: 11, opacity: 0.85 }}>Status: {a.status} · Tasks today: {a.tasksToday}</Typography>
                      <Typography sx={{ fontSize: 11, opacity: 0.85 }}>Success: {a.successRate}% · Autonomy: {a.autonomyLevel ?? m.autonomy ?? 50}%</Typography>
                      {a.currentTask && (
                        <Typography sx={{ fontSize: 11, opacity: 0.8, mt: 0.25, fontStyle: 'italic' }}>↳ {a.currentTask}</Typography>
                      )}
                    </Box>
                  }
                >
                  <Box
                    onClick={onOpenAI}
                    sx={{
                      flex: '0 0 auto',
                      width: 130,
                      p: 1.25,
                      borderRadius: 2,
                      cursor: onOpenAI ? 'pointer' : 'default',
                      bgcolor: alpha(c, 0.08),
                      border: `1px solid ${alpha(c, 0.3)}`,
                      transition: 'all .2s',
                      '&:hover': onOpenAI ? { transform: 'translateY(-2px)', borderColor: alpha(c, 0.6), boxShadow: `0 4px 14px ${alpha(c, 0.25)}` } : {},
                    }}
                  >
                    <Stack direction="row" alignItems="center" spacing={0.75}>
                      <Box sx={{ fontSize: 18, lineHeight: 1 }}>{m.emoji || '🤖'}</Box>
                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography sx={{ fontWeight: 800, fontSize: 12, lineHeight: 1.1 }} noWrap>{a.name}</Typography>
                        <Typography sx={{ fontSize: 9.5, opacity: 0.7, lineHeight: 1.1 }} noWrap>{(m.role || a.role || '').split('·')[0]}</Typography>
                      </Box>
                      <Box
                        sx={{
                          width: 8, height: 8, borderRadius: '50%',
                          bgcolor: statusColor,
                          boxShadow: `0 0 0 0 ${alpha(statusColor, 0.6)}`,
                          animation: a.status === 'busy' || a.status === 'working' || a.status === 'active'
                            ? 'agPulse 1.6s infinite'
                            : 'none',
                          '@keyframes agPulse': {
                            '0%':   { boxShadow: `0 0 0 0 ${alpha(statusColor, 0.6)}` },
                            '70%':  { boxShadow: `0 0 0 8px ${alpha(statusColor, 0)}` },
                            '100%': { boxShadow: `0 0 0 0 ${alpha(statusColor, 0)}` },
                          },
                        }}
                      />
                    </Stack>
                    <Stack direction="row" justifyContent="space-between" sx={{ mt: 0.75 }}>
                      <Typography sx={{ fontFamily: 'ui-monospace, monospace', fontSize: 10.5, fontWeight: 700, color: c }}>
                        {a.tasksToday}t
                      </Typography>
                      <Typography sx={{ fontFamily: 'ui-monospace, monospace', fontSize: 10.5, fontWeight: 700, opacity: 0.7 }}>
                        {a.successRate}%
                      </Typography>
                    </Stack>
                  </Box>
                </Tooltip>
              );
            })}
      </Box>
    </Box>
  );
};

export default memo(AgentFleetStrip);
