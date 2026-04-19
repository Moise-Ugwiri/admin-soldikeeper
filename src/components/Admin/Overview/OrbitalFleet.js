/**
 * OrbitalFleet — radial constellation of all 18 agents around Apollo (the sun).
 * Replaces the linear "AgentFleetStrip". Visually distinctive: planets orbiting a star.
 *
 * Each agent is positioned on one of two concentric orbits (specialists inner, C-suite outer).
 * Size = task volume, glow = status, click → details drawer.
 */
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  Box, Paper, Typography, Stack, Chip, Drawer, Divider, LinearProgress, Avatar, alpha, useTheme,
  IconButton, Tooltip,
} from '@mui/material';
import { Close, BoltRounded, AutoAwesome } from '@mui/icons-material';
import { AGENTS } from '../../../data/agentRegistry';
import apiClient from '../../../services/api';

const STATUS_COLORS = {
  active: '#22c55e', busy: '#f59e0b', working: '#3b82f6',
  idle: '#64748b', error: '#ef4444', offline: '#374151',
};

// Concentric layout: inner orbit = specialists 01-11, outer = C-suite 12-17.
// Apollo (00) sits at the center.
const layout = (agents, w, h) => {
  const cx = w / 2, cy = h / 2;
  const inner = agents.filter((a) => a.id !== '00-apollo' && parseInt(a.number, 10) <= 11);
  const outer = agents.filter((a) => parseInt(a.number, 10) >= 12);
  const apollo = agents.find((a) => a.id === '00-apollo');

  const placeOnRing = (list, radius, phaseOffset = 0) => {
    const n = list.length || 1;
    return list.map((a, i) => {
      const angle = phaseOffset + (i / n) * Math.PI * 2 - Math.PI / 2;
      return { ...a, x: cx + Math.cos(angle) * radius, y: cy + Math.sin(angle) * radius };
    });
  };

  const innerR = Math.min(w, h) * 0.30;
  const outerR = Math.min(w, h) * 0.45;

  return {
    sun: apollo ? { ...apollo, x: cx, y: cy } : null,
    inner: placeOnRing(inner, innerR),
    outer: placeOnRing(outer, outerR, Math.PI / outer.length),
    cx, cy, innerR, outerR,
  };
};

const OrbitalFleet = React.memo(function OrbitalFleet({ height = 460 }) {
  const theme = useTheme();
  const dark = theme.palette.mode === 'dark';
  const [fleet, setFleet] = useState(null);
  const [selected, setSelected] = useState(null);

  // Merge live fleet data into the static registry
  const merged = useMemo(() => {
    if (!fleet) return AGENTS.map((a) => ({ ...a, _live: false }));
    const byId = new Map(fleet.map((a) => [a.id, a]));
    return AGENTS.map((a) => {
      const live = byId.get(a.id);
      return live
        ? { ...a, ...live, status: live.status || a.status, _live: true }
        : { ...a, _live: false };
    });
  }, [fleet]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await apiClient.get('/admin/agent-management/fleet-status');
        const payload = res.data?.data || res.data || {};
        if (!cancelled) setFleet(payload.agents || []);
      } catch {/* keep static fallback */}
    };
    load();
    const id = setInterval(load, 30000);
    return () => { cancelled = true; clearInterval(id); };
  }, []);

  // Responsive width via ResizeObserver-free approach: fixed viewBox, scales with container.
  const VBW = 760, VBH = height;
  const { sun, inner, outer, cx, cy, innerR, outerR } = useMemo(() => layout(merged, VBW, VBH), [merged, VBH]);

  const handleSelect = useCallback((a) => setSelected(a), []);
  const handleClose  = useCallback(() => setSelected(null), []);

  const radiusFor = (a) => {
    const base = a.id === '00-apollo' ? 32 : 16;
    const tasks = a.tasksToday ?? a.tasksCompleted ?? 0;
    return base + Math.min(8, tasks / 25);
  };

  return (
    <>
      <Paper
        elevation={0}
        sx={{
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 3,
          height,
          border: `1px solid ${theme.palette.divider}`,
          background: dark
            ? 'radial-gradient(circle at center, #0b1020 0%, #060814 70%, #02030a 100%)'
            : 'radial-gradient(circle at center, #f8fafc 0%, #eef2f7 70%, #e2e8f0 100%)',
        }}
      >
        {/* Header */}
        <Stack direction="row" alignItems="center" sx={{
          position: 'absolute', top: 0, left: 0, right: 0, p: 1.5, zIndex: 2,
        }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <AutoAwesome sx={{ fontSize: 16, color: '#FFD700' }} />
            <Typography sx={{ fontSize: 12.5, fontWeight: 800, letterSpacing: 0.7, color: dark ? 'common.white' : 'text.primary' }}>
              AGENT CONSTELLATION
            </Typography>
            <Chip
              size="small"
              label={`${merged.filter(a => a._live && (a.status === 'active' || a.status === 'busy' || a.status === 'working')).length} active · ${merged.length} total`}
              sx={{ height: 20, fontSize: 10.5, fontWeight: 700,
                bgcolor: alpha('#22c55e', 0.18), color: '#22c55e',
                border: '1px solid', borderColor: alpha('#22c55e', 0.4) }}
            />
          </Stack>
          <Box sx={{ flex: 1 }} />
          <Tooltip title="Specialists orbit Apollo. Outer ring = C-suite.">
            <Typography sx={{ fontSize: 10, opacity: 0.55, color: dark ? 'common.white' : 'text.primary' }}>
              {merged.length} agents · {fleet ? 'live' : 'static'}
            </Typography>
          </Tooltip>
        </Stack>

        {/* SVG constellation */}
        <Box
          component="svg"
          viewBox={`0 0 ${VBW} ${VBH}`}
          preserveAspectRatio="xMidYMid meet"
          sx={{
            width: '100%', height: '100%', display: 'block',
            '@keyframes ofRotateSlow': { from: { transform: `rotate(0deg)` }, to: { transform: `rotate(360deg)` } },
            '@keyframes ofRotateRev':  { from: { transform: `rotate(0deg)` }, to: { transform: `rotate(-360deg)` } },
            '@keyframes ofPulse':      { '0%,100%': { opacity: 0.85 }, '50%': { opacity: 1 } },
            '@keyframes ofGlow':       { '0%,100%': { filter: 'drop-shadow(0 0 6px currentColor)' }, '50%': { filter: 'drop-shadow(0 0 14px currentColor)' } },
          }}
        >
          {/* Twinkling background stars */}
          {Array.from({ length: 40 }, (_, i) => {
            const x = (i * 71) % VBW;
            const y = (i * 47) % VBH;
            const r = 0.7 + ((i * 13) % 10) / 10;
            return <circle key={`s${i}`} cx={x} cy={y} r={r} fill={dark ? '#cbd5e1' : '#94a3b8'} opacity={0.25} />;
          })}

          {/* Orbit rings */}
          <circle cx={cx} cy={cy} r={innerR} fill="none" stroke={alpha(theme.palette.primary.main, 0.25)} strokeDasharray="3 5" />
          <circle cx={cx} cy={cy} r={outerR} fill="none" stroke={alpha(theme.palette.secondary.main, 0.20)} strokeDasharray="2 6" />

          {/* Sun (Apollo) — glow halo + core */}
          {sun && (
            <g style={{ transformOrigin: `${cx}px ${cy}px`, animation: 'ofPulse 3s ease-in-out infinite' }}>
              <circle cx={cx} cy={cy} r={radiusFor(sun) + 22} fill={alpha('#FFD700', 0.10)} />
              <circle cx={cx} cy={cy} r={radiusFor(sun) + 12} fill={alpha('#FFD700', 0.18)} />
              <circle
                cx={cx} cy={cy} r={radiusFor(sun)}
                fill="url(#sunGrad)"
                style={{ cursor: 'pointer', color: '#FFD700', animation: 'ofGlow 2.5s ease-in-out infinite' }}
                onClick={() => handleSelect(sun)}
              />
              <text x={cx} y={cy + 6} fontSize="22" textAnchor="middle" style={{ pointerEvents: 'none' }}>{sun.emoji}</text>
              <text x={cx} y={cy + radiusFor(sun) + 18} fontSize="11" fontWeight="700" textAnchor="middle"
                fill={dark ? '#fff' : '#1e293b'} style={{ pointerEvents: 'none' }}>{sun.name}</text>
            </g>
          )}

          {/* Inner ring planets */}
          {inner.map((a) => {
            const r = radiusFor(a);
            const c = STATUS_COLORS[a.status] || a.color || '#64748b';
            return (
              <g key={a.id} style={{ cursor: 'pointer' }} onClick={() => handleSelect(a)}>
                <circle cx={a.x} cy={a.y} r={r + 4} fill={alpha(c, 0.18)} />
                <circle cx={a.x} cy={a.y} r={r} fill={a.color || '#64748b'} stroke={c} strokeWidth={2}
                  style={{ color: c, animation: 'ofGlow 4s ease-in-out infinite' }} />
                <text x={a.x} y={a.y + 5} fontSize="14" textAnchor="middle" style={{ pointerEvents: 'none' }}>{a.emoji}</text>
                <text x={a.x} y={a.y + r + 12} fontSize="9.5" fontWeight="700" textAnchor="middle"
                  fill={dark ? alpha('#fff', 0.85) : alpha('#1e293b', 0.85)} style={{ pointerEvents: 'none' }}>
                  {a.name}
                </text>
              </g>
            );
          })}

          {/* Outer ring (C-suite) */}
          {outer.map((a) => {
            const r = radiusFor(a) + 2;
            const c = STATUS_COLORS[a.status] || a.color || '#64748b';
            return (
              <g key={a.id} style={{ cursor: 'pointer' }} onClick={() => handleSelect(a)}>
                <circle cx={a.x} cy={a.y} r={r + 5} fill={alpha(c, 0.14)} />
                <circle cx={a.x} cy={a.y} r={r} fill={a.color || '#64748b'} stroke={c} strokeWidth={2.5}
                  strokeDasharray="3 2"
                  style={{ color: c, animation: 'ofGlow 5s ease-in-out infinite' }} />
                <text x={a.x} y={a.y + 5} fontSize="14" textAnchor="middle" style={{ pointerEvents: 'none' }}>{a.emoji}</text>
                <text x={a.x} y={a.y + r + 12} fontSize="9.5" fontWeight="700" textAnchor="middle"
                  fill={dark ? alpha('#fff', 0.85) : alpha('#1e293b', 0.85)} style={{ pointerEvents: 'none' }}>
                  {a.name}
                </text>
              </g>
            );
          })}

          {/* Sun gradient def */}
          <defs>
            <radialGradient id="sunGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%"  stopColor="#FFE066" />
              <stop offset="60%" stopColor="#FFD700" />
              <stop offset="100%" stopColor="#FF8C00" />
            </radialGradient>
          </defs>
        </Box>

        {/* Footer legend */}
        <Stack
          direction="row" spacing={2} alignItems="center"
          sx={{
            position: 'absolute', bottom: 8, left: 12, right: 12, zIndex: 2,
            flexWrap: 'wrap', rowGap: 0.5,
          }}
        >
          {[
            { l: 'Active', c: STATUS_COLORS.active },
            { l: 'Busy',   c: STATUS_COLORS.busy },
            { l: 'Idle',   c: STATUS_COLORS.idle },
            { l: 'Error',  c: STATUS_COLORS.error },
          ].map((x) => (
            <Stack key={x.l} direction="row" alignItems="center" spacing={0.5}>
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: x.c }} />
              <Typography sx={{ fontSize: 10, color: dark ? alpha('#fff', 0.7) : 'text.secondary', fontWeight: 600 }}>
                {x.l}
              </Typography>
            </Stack>
          ))}
          <Box sx={{ flex: 1 }} />
          <Typography sx={{ fontSize: 9.5, opacity: 0.55, color: dark ? 'common.white' : 'text.primary', letterSpacing: 0.5 }}>
            CLICK ANY AGENT FOR DETAILS
          </Typography>
        </Stack>
      </Paper>

      {/* Agent details drawer */}
      <Drawer anchor="right" open={!!selected} onClose={handleClose}
        PaperProps={{ sx: { width: { xs: '100%', sm: 380 }, p: 0 } }}
      >
        {selected && (
          <Box sx={{ p: 0 }}>
            <Box
              sx={{
                p: 2.5,
                background: `linear-gradient(135deg, ${selected.color} 0%, ${alpha(selected.color, 0.6)} 100%)`,
                color: '#fff',
              }}
            >
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <Avatar sx={{ width: 56, height: 56, fontSize: 28, bgcolor: alpha('#000', 0.18) }}>{selected.emoji}</Avatar>
                  <Box>
                    <Typography sx={{ fontWeight: 800, fontSize: 18 }}>{selected.name}</Typography>
                    <Typography sx={{ fontSize: 12, opacity: 0.95 }}>{selected.role}</Typography>
                  </Box>
                </Stack>
                <IconButton onClick={handleClose} sx={{ color: '#fff' }}><Close /></IconButton>
              </Stack>
              <Stack direction="row" spacing={1} sx={{ mt: 2, flexWrap: 'wrap', gap: 0.75 }}>
                <Chip size="small" label={`#${selected.number}`} sx={{ bgcolor: alpha('#fff', 0.22), color: '#fff', fontWeight: 700 }} />
                <Chip size="small" icon={<BoltRounded sx={{ color: '#fff !important', fontSize: 14 }} />}
                  label={`${selected.autonomy ?? 0}% autonomy`}
                  sx={{ bgcolor: alpha('#fff', 0.22), color: '#fff', fontWeight: 700 }} />
                <Chip size="small"
                  label={(selected.status || 'idle').toUpperCase()}
                  sx={{ bgcolor: STATUS_COLORS[selected.status] || '#64748b', color: '#fff', fontWeight: 700 }} />
              </Stack>
            </Box>

            <Box sx={{ p: 2.5 }}>
              <Typography variant="body2" sx={{ mb: 2 }}>{selected.description}</Typography>

              <Typography sx={{ fontSize: 10.5, fontWeight: 800, opacity: 0.6, letterSpacing: 0.7, mb: 0.5 }}>AUTONOMY</Typography>
              <LinearProgress
                variant="determinate" value={selected.autonomy ?? 0}
                sx={{ height: 6, borderRadius: 3, mb: 2,
                  bgcolor: alpha(selected.color, 0.15),
                  '& .MuiLinearProgress-bar': { bgcolor: selected.color } }}
              />

              {selected.currentTask && (
                <>
                  <Typography sx={{ fontSize: 10.5, fontWeight: 800, opacity: 0.6, letterSpacing: 0.7, mb: 0.5 }}>CURRENT TASK</Typography>
                  <Paper variant="outlined" sx={{ p: 1.25, mb: 2, fontSize: 13 }}>{selected.currentTask}</Paper>
                </>
              )}

              <Stack direction="row" spacing={1.5} sx={{ mb: 2 }}>
                <KPICell label="Tasks today"    value={selected.tasksToday ?? selected.tasksCompleted ?? 0} />
                <KPICell label="Success rate"  value={selected.successRate != null ? `${selected.successRate}%` : '—'} />
                <KPICell label="Load"          value={selected.load != null ? `${selected.load}%` : '—'} />
              </Stack>

              <Divider sx={{ my: 2 }} />

              <Typography sx={{ fontSize: 10.5, fontWeight: 800, opacity: 0.6, letterSpacing: 0.7, mb: 0.5 }}>DOMAINS</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 2 }}>
                {(selected.domains || []).map((d, i) => (
                  <Chip key={i} size="small" label={d} variant="outlined" />
                ))}
              </Box>

              {Array.isArray(selected.strengths) && selected.strengths.length > 0 && (
                <>
                  <Typography sx={{ fontSize: 10.5, fontWeight: 800, opacity: 0.6, letterSpacing: 0.7, mb: 0.5 }}>STRENGTHS</Typography>
                  <Stack spacing={0.5} sx={{ mb: 1 }}>
                    {selected.strengths.slice(0, 4).map((s, i) => (
                      <Typography key={i} variant="caption">• {s}</Typography>
                    ))}
                  </Stack>
                </>
              )}
            </Box>
          </Box>
        )}
      </Drawer>
    </>
  );
});

const KPICell = ({ label, value }) => (
  <Box sx={{ flex: 1, textAlign: 'center', p: 1, borderRadius: 1.5, bgcolor: 'action.hover' }}>
    <Typography sx={{ fontSize: 16, fontWeight: 800, fontFamily: 'ui-monospace, monospace' }}>{value}</Typography>
    <Typography sx={{ fontSize: 9.5, opacity: 0.65, letterSpacing: 0.4 }}>{label.toUpperCase()}</Typography>
  </Box>
);

export default OrbitalFleet;
