/**
 * NowPlaying — Spotify-style "what agents are doing right now" panel.
 * Replaces the Twitter-feed-style LiveEventFeed.
 *
 * Shows up to 6 active/busy agents with: avatar, current task, accent bar,
 * progress shimmer. Static-feeling, focused. Auto-refresh every 30s.
 */
import React, { useEffect, useState, useMemo } from 'react';
import {
  Box, Paper, Stack, Typography, Avatar, alpha, useTheme, Chip, Skeleton, Button, Tooltip,
} from '@mui/material';
import { GraphicEq, Refresh } from '@mui/icons-material';
import { AGENTS } from '../../../data/agentRegistry';
import apiClient from '../../../services/api';

const STATUS_LABEL = {
  active: 'WORKING', busy: 'BUSY', working: 'WORKING',
  idle: 'IDLE', error: 'ERROR', offline: 'OFFLINE',
};

const STATUS_COLOR = {
  active: '#22c55e', busy: '#f59e0b', working: '#3b82f6',
  idle: '#64748b', error: '#ef4444', offline: '#374151',
};

// Soft fallback messaging when an agent has no current task
const IDLE_LINES = [
  'Standing by for instructions',
  'Monitoring queues',
  'Listening on the bus',
  'Awaiting next dispatch',
  'No active task',
];

const NowPlaying = React.memo(function NowPlaying({ height = 380 }) {
  const theme = useTheme();
  const dark = theme.palette.mode === 'dark';
  const [fleet, setFleet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await apiClient.get('/admin/agent-management/fleet-status');
        if (!cancelled) setFleet(res.data?.agents || []);
      } catch {/* fallback to static */}
      finally { if (!cancelled) setLoading(false); }
    };
    load();
    const id = setInterval(load, 30000);
    return () => { cancelled = true; clearInterval(id); };
  }, [tick]);

  // Merge live + static, prioritise active/busy/working
  const playing = useMemo(() => {
    const byId = new Map((fleet || []).map((a) => [a.id, a]));
    const merged = AGENTS.map((a) => ({ ...a, ...(byId.get(a.id) || {}), _live: byId.has(a.id) }));
    const rank = (s) => ({ active: 0, busy: 1, working: 1, idle: 3, error: 2, offline: 4 }[s] ?? 5);
    return merged
      .sort((a, b) => rank(a.status) - rank(b.status))
      .slice(0, 6);
  }, [fleet]);

  return (
    <Paper
      elevation={0}
      sx={{
        height, display: 'flex', flexDirection: 'column',
        borderRadius: 3,
        border: `1px solid ${theme.palette.divider}`,
        overflow: 'hidden',
        bgcolor: dark ? alpha('#0b1020', 0.7) : 'background.paper',
      }}
    >
      {/* Header — Spotify-style "Now Playing" */}
      <Stack direction="row" alignItems="center" sx={{
        px: 2, py: 1.5,
        borderBottom: `1px solid ${theme.palette.divider}`,
        bgcolor: dark ? alpha('#000', 0.25) : alpha(theme.palette.primary.main, 0.04),
      }}>
        <GraphicEq sx={{ color: theme.palette.primary.main, mr: 1, fontSize: 18 }} />
        <Typography sx={{ fontWeight: 800, fontSize: 13, letterSpacing: 0.5 }}>NOW PLAYING</Typography>
        <Chip size="small" label="LIVE" sx={{
          ml: 1, height: 18, fontSize: 10, fontWeight: 800,
          bgcolor: '#ef4444', color: '#fff',
          animation: 'npLivePulse 2s ease-in-out infinite',
          '@keyframes npLivePulse': { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.6 } },
        }} />
        <Box sx={{ flex: 1 }} />
        <Tooltip title="Refresh">
          <Button size="small" startIcon={<Refresh sx={{ fontSize: 14 }} />}
            onClick={() => setTick((x) => x + 1)}
            sx={{ minWidth: 0, fontSize: 11, fontWeight: 700, color: 'text.secondary' }}>
            sync
          </Button>
        </Tooltip>
      </Stack>

      {/* Track list */}
      <Box sx={{ flex: 1, overflowY: 'auto', p: 1 }}>
        {loading ? (
          <Stack spacing={1.25} sx={{ p: 1 }}>
            {[0, 1, 2, 3].map((i) => <Skeleton key={i} variant="rounded" height={56} />)}
          </Stack>
        ) : (
          <Stack spacing={0.5}>
            {playing.map((a, idx) => (
              <Track key={a.id} agent={a} index={idx + 1} dark={dark} />
            ))}
          </Stack>
        )}
      </Box>

      {/* Footer */}
      <Box sx={{
        px: 2, py: 1, borderTop: `1px solid ${theme.palette.divider}`,
        bgcolor: dark ? alpha('#000', 0.25) : alpha(theme.palette.background.default, 0.5),
        display: 'flex', alignItems: 'center', gap: 1,
      }}>
        <Box sx={{ display: 'flex', gap: 0.4, alignItems: 'flex-end', height: 14 }}>
          {[0, 1, 2, 3].map((i) => (
            <Box key={i} sx={{
              width: 3, bgcolor: theme.palette.primary.main, borderRadius: 0.5,
              animation: `npBar${i} 1s ease-in-out infinite`,
              [`@keyframes npBar${i}`]: { '0%,100%': { height: 4 + i * 2 }, '50%': { height: 14 - i * 2 } },
            }} />
          ))}
        </Box>
        <Typography sx={{ fontSize: 10.5, opacity: 0.65, fontWeight: 600 }}>
          {playing.filter((a) => ['active', 'busy', 'working'].includes(a.status)).length} agents working ·
          updates every 30s
        </Typography>
      </Box>
    </Paper>
  );
});

const Track = React.memo(function Track({ agent, index, dark }) {
  const status = agent.status || 'idle';
  const accent = STATUS_COLOR[status] || agent.color || '#64748b';
  const isWorking = ['active', 'busy', 'working'].includes(status);
  const task = agent.currentTask
    || (isWorking ? 'Executing task…' : IDLE_LINES[parseInt(agent.number || '0', 10) % IDLE_LINES.length]);

  return (
    <Box
      sx={{
        display: 'flex', alignItems: 'center', gap: 1.25,
        p: 1, borderRadius: 2, position: 'relative',
        transition: 'background-color .15s',
        '&:hover': { bgcolor: 'action.hover' },
        cursor: 'pointer',
      }}
    >
      {/* Index */}
      <Typography sx={{
        width: 18, fontSize: 11, opacity: 0.45, fontWeight: 700, textAlign: 'center',
        fontFamily: 'ui-monospace, monospace',
      }}>
        {String(index).padStart(2, '0')}
      </Typography>

      {/* Avatar with status ring */}
      <Box sx={{ position: 'relative' }}>
        <Avatar sx={{
          width: 38, height: 38, fontSize: 18, bgcolor: alpha(agent.color, 0.18),
          border: `2px solid ${accent}`,
        }}>
          {agent.emoji}
        </Avatar>
        {isWorking && (
          <Box sx={{
            position: 'absolute', bottom: -1, right: -1,
            width: 10, height: 10, borderRadius: '50%', bgcolor: accent,
            border: '2px solid', borderColor: 'background.paper',
            animation: 'trkPulse 1.6s ease-in-out infinite',
            '@keyframes trkPulse': { '0%,100%': { transform: 'scale(1)' }, '50%': { transform: 'scale(1.25)' } },
          }} />
        )}
      </Box>

      {/* Title + task */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Stack direction="row" alignItems="center" spacing={0.75} sx={{ minWidth: 0 }}>
          <Typography sx={{ fontSize: 13, fontWeight: 800 }} noWrap>{agent.name}</Typography>
          <Typography sx={{ fontSize: 10.5, opacity: 0.5, fontWeight: 600, letterSpacing: 0.3 }}>
            · {agent.role.split('·')[0].trim()}
          </Typography>
        </Stack>
        <Typography sx={{ fontSize: 12, opacity: 0.78 }} noWrap>{task}</Typography>
      </Box>

      {/* Status pill */}
      <Box sx={{
        px: 0.75, py: 0.25, borderRadius: 1,
        bgcolor: alpha(accent, 0.15), color: accent,
        fontSize: 9.5, fontWeight: 800, letterSpacing: 0.5,
        fontFamily: 'ui-monospace, monospace',
      }}>
        {STATUS_LABEL[status] || 'IDLE'}
      </Box>
    </Box>
  );
});

export default NowPlaying;
