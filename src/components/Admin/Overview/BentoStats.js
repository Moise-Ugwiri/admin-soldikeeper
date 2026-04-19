/**
 * BentoStats — asymmetric bento grid of KPIs.
 * Six tiles, each with a different visual treatment so they don't feel uniform:
 *  - users (large, gradient + waveform)
 *  - transactions (medium, big number + tiny bar chart)
 *  - income (medium, "now playing"-style)
 *  - active sessions (compact, circular gauge)
 *  - conversion (compact, donut)
 *  - signups today (compact, big delta)
 */
import React, { useMemo } from 'react';
import { Box, Paper, Typography, Stack, alpha, useTheme } from '@mui/material';
import { TrendingUp, TrendingDown } from '@mui/icons-material';

const fmt = (n) => (n >= 1000 ? (n / 1000).toFixed(1) + 'k' : String(n));
const seq = (base, seed = 13, n = 16) =>
  Array.from({ length: n }, (_, i) => Math.max(0.05, ((Math.sin(i * 0.7 + seed) + 1) / 2) * 0.85 + 0.15) * Math.max(1, base / n));

// ─── Wave / sparkline svg ───────────────────────────────────────
const WaveFill = ({ data, color }) => {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data, 1);
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * 100},${100 - (v / max) * 100}`).join(' ');
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
      <defs>
        <linearGradient id={`wf-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"  stopColor={color} stopOpacity={0.45} />
          <stop offset="100%" stopColor={color} stopOpacity={0.02} />
        </linearGradient>
      </defs>
      <polygon points={`0,100 ${pts} 100,100`} fill={`url(#wf-${color.replace('#', '')})`} />
      <polyline points={pts} fill="none" stroke={color} strokeWidth={1.6} />
    </svg>
  );
};

// ─── Bars ───────────────────────────────────────────────────────
const Bars = ({ data, color }) => {
  const max = Math.max(...data, 1);
  return (
    <Stack direction="row" alignItems="flex-end" spacing={0.5} sx={{ height: 40 }}>
      {data.map((v, i) => (
        <Box key={i} sx={{
          flex: 1, height: `${(v / max) * 100}%`,
          background: `linear-gradient(180deg, ${color} 0%, ${alpha(color, 0.4)} 100%)`,
          borderRadius: 0.5,
        }} />
      ))}
    </Stack>
  );
};

// ─── Circular gauge ─────────────────────────────────────────────
const Gauge = ({ value, max = 100, color }) => {
  const pct = Math.min(100, (value / max) * 100);
  const C = 2 * Math.PI * 28;
  return (
    <Box sx={{ position: 'relative', width: 80, height: 80 }}>
      <svg viewBox="0 0 70 70" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
        <circle cx="35" cy="35" r="28" fill="none" stroke={alpha(color, 0.18)} strokeWidth="6" />
        <circle cx="35" cy="35" r="28" fill="none" stroke={color} strokeWidth="6"
          strokeLinecap="round" strokeDasharray={`${(pct / 100) * C} ${C}`} />
      </svg>
      <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography sx={{ fontSize: 18, fontWeight: 800, fontFamily: 'ui-monospace, monospace' }}>
          {value}
        </Typography>
      </Box>
    </Box>
  );
};

// ─── Delta arrow ────────────────────────────────────────────────
const Delta = ({ value }) => {
  if (typeof value !== 'number') return null;
  const up = value >= 0;
  const Icon = up ? TrendingUp : TrendingDown;
  return (
    <Stack direction="row" alignItems="center" spacing={0.25}
      sx={{ color: up ? '#22c55e' : '#ef4444', fontSize: 11.5, fontWeight: 700 }}>
      <Icon sx={{ fontSize: 13 }} />
      <span>{Math.abs(value).toFixed(1)}%</span>
    </Stack>
  );
};

const BentoStats = React.memo(function BentoStats({
  totalUsers = 0, userGrowth = null,
  totalTx = 0, txGrowth = null,
  totalIncome = 0,
  activeNow = 0,
  signupsToday = 0,
  conversion = 0,
}) {
  const theme = useTheme();
  const dark = theme.palette.mode === 'dark';
  const COL = {
    users: '#7c3aed', tx: '#10b981', income: '#f59e0b',
    active: '#3b82f6', convert: '#ec4899', signup: '#06b6d4',
  };

  const userWave = useMemo(() => seq(totalUsers, 13), [totalUsers]);
  const txBars   = useMemo(() => seq(totalTx, 31, 14), [totalTx]);
  const incomeWave = useMemo(() => seq(totalIncome, 47), [totalIncome]);

  const card = {
    p: { xs: 1.75, sm: 2 },
    borderRadius: 3,
    border: `1px solid ${theme.palette.divider}`,
    height: '100%',
    bgcolor: 'background.paper',
    transition: 'transform .25s cubic-bezier(.2,.7,.2,1), box-shadow .25s',
    '&:hover': { transform: 'translateY(-2px)', boxShadow: 4 },
    overflow: 'hidden',
    position: 'relative',
  };

  // CSS Grid — bento layout (asymmetric)
  return (
    <Box
      sx={{
        display: 'grid',
        gap: { xs: 1.5, sm: 2 },
        gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(6, 1fr)' },
        gridAutoRows: { xs: 110, md: 130 },
      }}
    >
      {/* Users (BIG — 3x2) */}
      <Paper elevation={0} sx={{
        ...card,
        gridColumn: { xs: 'span 2', md: 'span 3' },
        gridRow:    { md: 'span 2' },
        background: dark
          ? `linear-gradient(135deg, ${alpha(COL.users, 0.45)} 0%, #1e1b4b 100%)`
          : `linear-gradient(135deg, ${alpha(COL.users, 0.18)} 0%, ${alpha(COL.users, 0.04)} 100%)`,
        color: dark ? '#fff' : 'inherit',
      }}>
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
          <Box>
            <Typography sx={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.6, opacity: 0.75 }}>TOTAL USERS</Typography>
            <Typography sx={{ fontSize: { xs: 36, sm: 44 }, fontWeight: 900, lineHeight: 1, fontFamily: 'ui-monospace, monospace' }}>
              {totalUsers.toLocaleString()}
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
              <Delta value={userGrowth} />
              <Typography sx={{ fontSize: 11.5, opacity: 0.7 }}>vs last period</Typography>
            </Stack>
          </Box>
          <Box sx={{ width: 56, height: 56, borderRadius: 2,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            bgcolor: alpha(COL.users, 0.25), fontSize: 26 }}>👥</Box>
        </Stack>
        <Box sx={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: { xs: 56, md: 100 } }}>
          <WaveFill data={userWave} color={dark ? '#c4b5fd' : COL.users} />
        </Box>
      </Paper>

      {/* Transactions (medium 2x1) */}
      <Paper elevation={0} sx={{
        ...card,
        gridColumn: { xs: 'span 1', md: 'span 2' },
        borderLeft: `4px solid ${COL.tx}`,
      }}>
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
          <Box>
            <Typography sx={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 0.6, opacity: 0.7 }}>TRANSACTIONS</Typography>
            <Typography sx={{ fontSize: 24, fontWeight: 800, fontFamily: 'ui-monospace, monospace' }}>
              {totalTx.toLocaleString()}
            </Typography>
            <Delta value={txGrowth} />
          </Box>
          <Box sx={{ width: 90 }}>
            <Bars data={txBars} color={COL.tx} />
          </Box>
        </Stack>
      </Paper>

      {/* Active sessions (gauge) */}
      <Paper elevation={0} sx={{
        ...card,
        gridColumn: { xs: 'span 1', md: 'span 1' },
        textAlign: 'center',
      }}>
        <Stack alignItems="center" spacing={0.5}>
          <Typography sx={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.6, opacity: 0.7 }}>LIVE NOW</Typography>
          <Gauge value={activeNow} max={Math.max(50, activeNow * 1.5)} color={COL.active} />
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <Box sx={{
              width: 6, height: 6, borderRadius: '50%', bgcolor: '#22c55e',
              animation: 'bsBlink 1.5s ease-in-out infinite',
              '@keyframes bsBlink': { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.3 } },
            }} />
            <Typography sx={{ fontSize: 9, opacity: 0.6, fontWeight: 600, letterSpacing: 0.4 }}>REAL-TIME</Typography>
          </Stack>
        </Stack>
      </Paper>

      {/* Income (medium row 2) */}
      <Paper elevation={0} sx={{
        ...card,
        gridColumn: { xs: 'span 2', md: 'span 2' },
        background: `linear-gradient(135deg, ${alpha(COL.income, 0.10)} 0%, transparent 100%)`,
      }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
          <Typography sx={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 0.6, opacity: 0.7 }}>USER INCOME TRACKED</Typography>
          <Typography sx={{ fontSize: 9.5, fontWeight: 700, color: COL.income, opacity: 0.8 }}>YTD</Typography>
        </Stack>
        <Typography sx={{ fontSize: 26, fontWeight: 800, fontFamily: 'ui-monospace, monospace', color: COL.income }}>
          €{(totalIncome / 1000).toFixed(1)}K
        </Typography>
        <Box sx={{ height: 28, mt: 0.5 }}>
          <WaveFill data={incomeWave} color={COL.income} />
        </Box>
      </Paper>

      {/* Conversion (donut) */}
      <Paper elevation={0} sx={{
        ...card,
        gridColumn: { xs: 'span 1', md: 'span 1' },
        textAlign: 'center',
      }}>
        <Stack alignItems="center" spacing={0.5}>
          <Typography sx={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.6, opacity: 0.7 }}>CONVERSION</Typography>
          <Gauge value={Math.round(conversion)} max={100} color={COL.convert} />
          <Typography sx={{ fontSize: 9.5, opacity: 0.6 }}>free → pro</Typography>
        </Stack>
      </Paper>

      {/* Signups today (delta hero) */}
      <Paper elevation={0} sx={{
        ...card,
        gridColumn: { xs: 'span 1', md: 'span 1' },
      }}>
        <Typography sx={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.6, opacity: 0.7 }}>SIGNUPS · TODAY</Typography>
        <Typography sx={{ fontSize: 30, fontWeight: 900, fontFamily: 'ui-monospace, monospace', color: COL.signup, mt: 0.5 }}>
          {fmt(signupsToday)}
        </Typography>
        <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 0.25 }}>
          <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: COL.signup }} />
          <Typography sx={{ fontSize: 10, opacity: 0.65 }}>since midnight</Typography>
        </Stack>
      </Paper>
    </Box>
  );
});

export default BentoStats;
