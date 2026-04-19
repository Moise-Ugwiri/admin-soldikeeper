import React, { memo, useEffect, useState } from 'react';
import { Box, Stack, Typography, Chip, alpha, useTheme } from '@mui/material';
import { BoltRounded, PauseCircleOutline, PlayCircleOutline } from '@mui/icons-material';
import websocketService from '../../../services/websocketService';

/**
 * LiveEventFeed — Twitter-like real-time event ticker.
 * Subscribes to `admin:realtime`, `admin:stats`, `godmode:state-changed`, and
 * synthesises mini events from those payloads. Caps at MAX_EVENTS.
 */
const MAX_EVENTS = 60;

const KIND_META = {
  signup:      { color: '#3b82f6', label: 'SIGNUP' },
  transaction: { color: '#10b981', label: 'TX' },
  agent:       { color: '#7c3aed', label: 'AGENT' },
  alert:       { color: '#ef4444', label: 'ALERT' },
  system:      { color: '#f59e0b', label: 'SYS' },
};

const LiveEventFeed = ({ seedActivity = [] }) => {
  const theme = useTheme();
  const [paused, setPaused] = useState(false);
  const [events, setEvents] = useState(() =>
    seedActivity.slice(0, 8).map((a, i) => ({
      id: `seed-${i}`,
      kind: 'system',
      message: a.message,
      time: a.time || new Date().toISOString(),
    }))
  );

  useEffect(() => {
    const push = (ev) => {
      setEvents((prev) => {
        const next = [{ ...ev, id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}` }, ...prev];
        return next.slice(0, MAX_EVENTS);
      });
    };

    const u1 = websocketService.on('admin:realtime', (d) => {
      if (paused) return;
      if (d?.activeSessions != null) {
        push({ kind: 'system', message: `Active sessions: ${d.activeSessions}`, time: new Date().toISOString() });
      }
    });
    const u2 = websocketService.on('admin:stats', (d) => {
      if (paused) return;
      if (d?.newUsers != null) {
        push({ kind: 'signup', message: `New user growth update: ${d.newUsers} this period`, time: new Date().toISOString() });
      }
    });
    const u3 = websocketService.on('godmode:state-changed', (d) => {
      if (paused) return;
      push({ kind: 'agent', message: `God Mode: ${d?.message || 'state changed'}`, time: new Date().toISOString() });
    });

    return () => { u1?.(); u2?.(); u3?.(); };
  }, [paused]);

  return (
    <Box
      sx={{
        p: { xs: 1.5, sm: 2 },
        borderRadius: 2.5,
        bgcolor: 'background.paper',
        border: `1px solid ${theme.palette.divider}`,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 320,
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.25 }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <BoltRounded sx={{ fontSize: 18, color: 'warning.main' }} />
          <Typography sx={{ fontSize: 13, fontWeight: 800, letterSpacing: 0.5 }}>LIVE EVENT FEED</Typography>
        </Stack>
        <Chip
          size="small"
          icon={paused ? <PlayCircleOutline sx={{ fontSize: '14px !important' }} /> : <PauseCircleOutline sx={{ fontSize: '14px !important' }} />}
          label={paused ? 'PAUSED' : 'STREAMING'}
          onClick={() => setPaused(p => !p)}
          sx={{
            height: 20,
            fontSize: 10,
            fontWeight: 800,
            cursor: 'pointer',
            bgcolor: alpha(paused ? theme.palette.text.disabled : theme.palette.success.main, 0.15),
            color: paused ? 'text.secondary' : 'success.main',
            border: `1px solid ${alpha(paused ? theme.palette.text.disabled : theme.palette.success.main, 0.35)}`,
          }}
        />
      </Stack>

      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          scrollbarWidth: 'thin',
          '&::-webkit-scrollbar': { width: 6 },
          '&::-webkit-scrollbar-thumb': { bgcolor: alpha(theme.palette.text.primary, 0.18), borderRadius: 3 },
        }}
      >
        {events.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4, opacity: 0.6 }}>
            <Typography sx={{ fontSize: 12 }}>Awaiting live events…</Typography>
          </Box>
        ) : (
          <Stack divider={<Box sx={{ borderBottom: `1px dashed ${theme.palette.divider}` }} />} spacing={0}>
            {events.map((e) => {
              const meta = KIND_META[e.kind] || KIND_META.system;
              const t = formatTime(e.time);
              return (
                <Stack key={e.id} direction="row" alignItems="flex-start" spacing={1} sx={{ py: 0.85 }}>
                  <Typography sx={{ fontFamily: 'ui-monospace, monospace', fontSize: 10, opacity: 0.55, minWidth: 50, mt: 0.25 }}>
                    {t}
                  </Typography>
                  <Chip
                    size="small"
                    label={meta.label}
                    sx={{
                      height: 16, fontSize: 9, fontWeight: 800, letterSpacing: 0.5,
                      bgcolor: alpha(meta.color, 0.15), color: meta.color,
                      border: `1px solid ${alpha(meta.color, 0.35)}`,
                      '& .MuiChip-label': { px: 0.75 },
                    }}
                  />
                  <Typography sx={{ fontSize: 12, lineHeight: 1.35, flex: 1 }}>{e.message}</Typography>
                </Stack>
              );
            })}
          </Stack>
        )}
      </Box>
    </Box>
  );
};

function formatTime(iso) {
  const d = typeof iso === 'string' ? new Date(iso) : iso;
  if (!(d instanceof Date) || isNaN(d.getTime())) return '--:--:--';
  return d.toTimeString().slice(0, 8);
}

export default memo(LiveEventFeed);
