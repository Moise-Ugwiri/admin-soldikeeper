import React, { memo, useMemo } from 'react';
import { Box, Stack, Typography, Chip, alpha, useTheme } from '@mui/material';
import { TrendingUp, TrendingDown, TrendingFlat } from '@mui/icons-material';

/**
 * PulseHero — bold single-glance "platform pulse" panel.
 * Shows: today's headline number, sparkline trend, delta vs previous,
 * and an animated heartbeat strip representing recent activity.
 */
const PulseHero = ({
  label = 'Live activity',
  value = 0,
  unit = '',
  delta = null,         // % change
  series = [],          // numeric array for sparkline
  caption,
  accent,
}) => {
  const theme = useTheme();
  const color = accent || theme.palette.primary.main;

  const path = useMemo(() => buildSparkPath(series), [series]);

  const dir = delta == null ? 'flat' : delta > 0 ? 'up' : delta < 0 ? 'down' : 'flat';
  const deltaColor = dir === 'up' ? theme.palette.success.main : dir === 'down' ? theme.palette.error.main : theme.palette.text.disabled;
  const DeltaIcon = dir === 'up' ? TrendingUp : dir === 'down' ? TrendingDown : TrendingFlat;

  return (
    <Box
      sx={{
        position: 'relative',
        p: { xs: 2, sm: 3 },
        borderRadius: 3,
        height: '100%',
        overflow: 'hidden',
        background: `linear-gradient(135deg, ${alpha(color, 0.18)} 0%, ${alpha(color, 0.04)} 100%)`,
        border: `1px solid ${alpha(color, 0.35)}`,
      }}
    >
      <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={2}>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography sx={{ fontSize: 11, letterSpacing: 1.5, fontWeight: 700, opacity: 0.7 }} noWrap>
            {label.toUpperCase()}
          </Typography>
          <Stack direction="row" alignItems="baseline" spacing={1} sx={{ mt: 0.5 }}>
            <Typography
              sx={{
                fontSize: { xs: 36, sm: 48 },
                fontWeight: 900,
                lineHeight: 1,
                color,
                letterSpacing: -1,
              }}
            >
              {typeof value === 'number' ? value.toLocaleString() : value}
            </Typography>
            {unit && (
              <Typography sx={{ fontSize: 14, fontWeight: 700, opacity: 0.7 }}>{unit}</Typography>
            )}
          </Stack>
          {caption && (
            <Typography sx={{ fontSize: 12, opacity: 0.7, mt: 0.5 }}>{caption}</Typography>
          )}
          {delta != null && (
            <Chip
              size="small"
              icon={<DeltaIcon sx={{ fontSize: '14px !important', color: `${deltaColor} !important` }} />}
              label={`${delta > 0 ? '+' : ''}${delta.toFixed(1)}% vs prior`}
              sx={{
                mt: 1.25,
                height: 22,
                fontSize: 11,
                fontWeight: 700,
                bgcolor: alpha(deltaColor, 0.12),
                color: deltaColor,
                border: `1px solid ${alpha(deltaColor, 0.35)}`,
              }}
            />
          )}
        </Box>

        {/* Heartbeat strip */}
        <Box sx={{ width: { xs: 110, sm: 180 }, height: 70, position: 'relative' }}>
          <svg viewBox="0 0 100 40" preserveAspectRatio="none" width="100%" height="100%">
            <defs>
              <linearGradient id="phFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"  stopColor={color} stopOpacity="0.55" />
                <stop offset="100%" stopColor={color} stopOpacity="0" />
              </linearGradient>
            </defs>
            {path && (
              <>
                <path d={`${path} L 100 40 L 0 40 Z`} fill="url(#phFill)" />
                <path d={path} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </>
            )}
          </svg>
          {/* Live pulse dot at the right edge */}
          <Box
            sx={{
              position: 'absolute',
              right: -4, top: '50%',
              width: 8, height: 8, borderRadius: '50%',
              bgcolor: color,
              transform: 'translateY(-50%)',
              boxShadow: `0 0 0 0 ${alpha(color, 0.7)}`,
              animation: 'phPulse 1.6s infinite',
              '@keyframes phPulse': {
                '0%':   { boxShadow: `0 0 0 0 ${alpha(color, 0.7)}` },
                '70%':  { boxShadow: `0 0 0 10px ${alpha(color, 0)}` },
                '100%': { boxShadow: `0 0 0 0 ${alpha(color, 0)}` },
              },
            }}
          />
        </Box>
      </Stack>
    </Box>
  );
};

function buildSparkPath(series) {
  if (!series || series.length < 2) return '';
  const max = Math.max(...series);
  const min = Math.min(...series);
  const range = max - min || 1;
  const stepX = 100 / (series.length - 1);
  return series.map((v, i) => {
    const x = i * stepX;
    const y = 40 - ((v - min) / range) * 36 - 2;
    return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(' ');
}

export default memo(PulseHero);
