/**
 * BriefingHero — Apollo's morning briefing.
 * Conversational AI panel, written like a CEO brief to the operator.
 * Full-width hero with avatar + narrative + 3 inline KPI badges + CTA chips.
 */
import React, { useMemo } from 'react';
import { Box, Stack, Typography, Chip, Avatar, Button, alpha, useTheme } from '@mui/material';
import { AutoAwesome, ArrowForward, TrendingUp, TrendingDown, TrendingFlat } from '@mui/icons-material';

const greet = () => {
  const h = new Date().getHours();
  if (h < 5)  return 'Late night';
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
};

const trendIcon = (d) => {
  if (typeof d !== 'number') return <TrendingFlat fontSize="inherit" />;
  if (d > 0)  return <TrendingUp fontSize="inherit" />;
  if (d < 0)  return <TrendingDown fontSize="inherit" />;
  return <TrendingFlat fontSize="inherit" />;
};

const BriefingHero = React.memo(function BriefingHero({
  operatorName = 'Operator',
  totalUsers = 0, newUsers = 0, userGrowth = null,
  totalTx = 0, txGrowth = null,
  totalIncome = 0, activeNow = 0,
  fleetActive = 0, fleetTotal = 18,
  alertsCount = 0, escalationsCount = 0,
  onOpenAgents, onOpenEscalations,
}) {
  const theme = useTheme();
  const dark = theme.palette.mode === 'dark';

  const narrative = useMemo(() => {
    const parts = [];
    if (newUsers > 0) parts.push(`${newUsers} new ${newUsers === 1 ? 'user' : 'users'} signed up`);
    if (totalTx > 0)  parts.push(`${totalTx.toLocaleString()} transactions tracked`);
    if (activeNow > 0) parts.push(`${activeNow} ${activeNow === 1 ? 'session' : 'sessions'} live right now`);
    if (parts.length === 0) parts.push('platform is quiet — a good time to plan');
    let line = `${parts.join(' · ')}.`;
    if (escalationsCount > 0) line += ` ${escalationsCount} ${escalationsCount === 1 ? 'item needs' : 'items need'} your decision.`;
    if (alertsCount > 0)      line += ` ${alertsCount} security ${alertsCount === 1 ? 'alert' : 'alerts'} flagged.`;
    if (escalationsCount === 0 && alertsCount === 0) line += ` All systems nominal — fleet running autonomously.`;
    return line;
  }, [newUsers, totalTx, activeNow, escalationsCount, alertsCount]);

  const badges = [
    { label: 'Total users',  value: totalUsers.toLocaleString(),                    delta: userGrowth, color: '#a78bfa' },
    { label: 'Transactions', value: totalTx.toLocaleString(),                       delta: txGrowth,   color: '#34d399' },
    { label: 'Income tracked', value: `€${(totalIncome / 1000).toFixed(1)}K`,       delta: null,       color: '#fbbf24' },
    { label: 'Fleet active', value: `${fleetActive}/${fleetTotal}`,                 delta: null,       color: '#60a5fa' },
  ];

  return (
    <Box
      sx={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 3,
        p: { xs: 2.5, sm: 3.5 },
        // Aurora gradient — distinctive, alive
        background: dark
          ? 'radial-gradient(900px 400px at 0% 0%, rgba(124,58,237,0.45), transparent 60%), radial-gradient(700px 350px at 100% 100%, rgba(16,185,129,0.30), transparent 60%), linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)'
          : 'radial-gradient(900px 400px at 0% 0%, rgba(124,58,237,0.20), transparent 60%), radial-gradient(700px 350px at 100% 100%, rgba(16,185,129,0.18), transparent 60%), linear-gradient(135deg, #fafaff 0%, #eef2ff 100%)',
        color: dark ? 'common.white' : 'text.primary',
        border: `1px solid ${dark ? alpha('#fff', 0.08) : alpha('#7c3aed', 0.18)}`,
        '@keyframes bhFloat': {
          '0%,100%': { transform: 'translateY(0)' },
          '50%':     { transform: 'translateY(-6px)' },
        },
      }}
    >
      {/* Floating accent orb */}
      <Box
        sx={{
          position: 'absolute', top: -40, right: -40, width: 220, height: 220, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,215,0,0.35), transparent 70%)',
          animation: 'bhFloat 8s ease-in-out infinite',
          pointerEvents: 'none',
        }}
      />

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems={{ xs: 'flex-start', md: 'center' }}>
        {/* Apollo avatar */}
        <Stack alignItems="center" spacing={0.75} sx={{ flexShrink: 0 }}>
          <Avatar
            sx={{
              width: 72, height: 72, fontSize: 32,
              bgcolor: 'transparent',
              background: 'linear-gradient(135deg, #FFD700 0%, #FF8C00 60%, #FF4500 100%)',
              boxShadow: '0 0 32px rgba(255,165,0,0.55)',
              border: `3px solid ${alpha('#fff', 0.25)}`,
            }}
          >
            🎯
          </Avatar>
          <Stack direction="row" alignItems="center" spacing={0.5} sx={{ opacity: 0.85 }}>
            <Box sx={{
              width: 7, height: 7, borderRadius: '50%', bgcolor: '#22c55e',
              boxShadow: '0 0 8px #22c55e',
            }} />
            <Typography sx={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 0.5 }}>APOLLO · ONLINE</Typography>
          </Stack>
        </Stack>

        {/* Briefing body */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
            <AutoAwesome sx={{ fontSize: 16, opacity: 0.7 }} />
            <Typography sx={{ fontSize: 11.5, fontWeight: 700, letterSpacing: 0.7, opacity: 0.75 }}>
              MORNING BRIEF · {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' }).toUpperCase()}
            </Typography>
          </Stack>
          <Typography sx={{ fontWeight: 800, fontSize: { xs: 22, sm: 26 }, lineHeight: 1.2, mb: 1 }}>
            {greet()}, {operatorName}.
          </Typography>
          <Typography sx={{ fontSize: { xs: 14, sm: 15.5 }, opacity: 0.92, lineHeight: 1.55, mb: 2, maxWidth: 720 }}>
            {narrative}
          </Typography>

          {/* Inline KPI badges */}
          <Stack direction="row" spacing={1.25} sx={{ flexWrap: 'wrap', gap: 1, mb: 2 }}>
            {badges.map((b) => (
              <Box
                key={b.label}
                sx={{
                  px: 1.5, py: 0.75, borderRadius: 2,
                  bgcolor: alpha(b.color, dark ? 0.18 : 0.12),
                  border: `1px solid ${alpha(b.color, 0.35)}`,
                  display: 'flex', alignItems: 'center', gap: 1, minWidth: 0,
                }}
              >
                <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: b.color, boxShadow: `0 0 6px ${b.color}` }} />
                <Typography sx={{ fontSize: 10.5, opacity: 0.75, letterSpacing: 0.3, fontWeight: 600 }}>{b.label}</Typography>
                <Typography sx={{ fontSize: 14, fontWeight: 800, fontFamily: 'ui-monospace, monospace' }}>{b.value}</Typography>
                {typeof b.delta === 'number' && (
                  <Stack direction="row" alignItems="center" sx={{ color: b.delta >= 0 ? '#34d399' : '#f87171', fontSize: 11, fontWeight: 700 }}>
                    {trendIcon(b.delta)}
                    <span>{Math.abs(b.delta).toFixed(1)}%</span>
                  </Stack>
                )}
              </Box>
            ))}
          </Stack>

          {/* CTAs */}
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
            {escalationsCount > 0 && (
              <Button
                size="small"
                variant="contained"
                onClick={onOpenEscalations}
                endIcon={<ArrowForward />}
                sx={{
                  bgcolor: '#f59e0b', color: '#0f172a', fontWeight: 700,
                  '&:hover': { bgcolor: '#fbbf24' },
                }}
              >
                Review {escalationsCount} {escalationsCount === 1 ? 'escalation' : 'escalations'}
              </Button>
            )}
            <Button
              size="small"
              variant="outlined"
              onClick={onOpenAgents}
              endIcon={<ArrowForward />}
              sx={{
                color: dark ? 'common.white' : 'text.primary',
                borderColor: dark ? alpha('#fff', 0.3) : alpha('#000', 0.15),
                '&:hover': { borderColor: dark ? '#fff' : '#000', bgcolor: alpha('#fff', 0.05) },
              }}
            >
              Open Mission Control
            </Button>
            <Chip
              size="small"
              label={`${fleetTotal - fleetActive} agents idle`}
              sx={{
                bgcolor: alpha(dark ? '#fff' : '#000', 0.08),
                color: 'inherit', fontWeight: 600,
              }}
            />
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
});

export default BriefingHero;
