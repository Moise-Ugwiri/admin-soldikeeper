import React, { memo, useMemo } from 'react';
import { Box, Stack, Typography, alpha, useTheme } from '@mui/material';
import { ArrowUpward, ArrowDownward } from '@mui/icons-material';

/**
 * StatTileSpark — info-dense KPI tile with mini sparkline + delta chip.
 * Compact, monospace numbers, hover lift, no gradients.
 */
const StatTileSpark = ({
  label,
  value,
  series = [],
  delta = null,
  hint,
  icon,
  color,
}) => {
  const theme = useTheme();
  const accent = color || theme.palette.primary.main;
  const path = useMemo(() => buildPath(series), [series]);

  const dir = delta == null ? 0 : delta > 0 ? 1 : -1;
  const deltaColor = dir > 0 ? theme.palette.success.main : dir < 0 ? theme.palette.error.main : theme.palette.text.disabled;

  return (
    <Box
      sx={{
        position: 'relative',
        p: { xs: 1.5, sm: 2 },
        borderRadius: 2.5,
        bgcolor: 'background.paper',
        border: `1px solid ${theme.palette.divider}`,
        height: '100%',
        transition: 'all .25s',
        overflow: 'hidden',
        '&:hover': {
          transform: 'translateY(-2px)',
          borderColor: alpha(accent, 0.5),
          boxShadow: `0 6px 20px ${alpha(accent, 0.15)}`,
        },
        '&::before': {
          content: '""',
          position: 'absolute', top: 0, left: 0, bottom: 0,
          width: 3,
          bgcolor: accent,
        },
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 0.5 }}>
        <Typography sx={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 1, opacity: 0.6 }} noWrap>
          {label.toUpperCase()}
        </Typography>
        {icon && (
          <Box sx={{ color: alpha(accent, 0.85), display: 'flex' }}>
            {React.cloneElement(icon, { sx: { fontSize: 16 } })}
          </Box>
        )}
      </Stack>

      <Typography
        sx={{
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
          fontSize: { xs: 22, sm: 26 },
          fontWeight: 800,
          lineHeight: 1.1,
          color: 'text.primary',
        }}
      >
        {value}
      </Typography>

      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 1 }}>
        <Box sx={{ minHeight: 18 }}>
          {delta != null ? (
            <Stack direction="row" alignItems="center" spacing={0.25}>
              {dir > 0 ? <ArrowUpward sx={{ fontSize: 12, color: deltaColor }} /> : dir < 0 ? <ArrowDownward sx={{ fontSize: 12, color: deltaColor }} /> : null}
              <Typography sx={{ fontSize: 11, fontWeight: 700, color: deltaColor }}>
                {delta > 0 ? '+' : ''}{delta.toFixed(1)}%
              </Typography>
            </Stack>
          ) : hint ? (
            <Typography sx={{ fontSize: 10.5, opacity: 0.6 }}>{hint}</Typography>
          ) : null}
        </Box>

        {/* Inline sparkline */}
        <Box sx={{ width: 70, height: 22 }}>
          {path && (
            <svg viewBox="0 0 70 22" preserveAspectRatio="none" width="100%" height="100%">
              <path d={path} fill="none" stroke={accent} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </Box>
      </Stack>
    </Box>
  );
};

function buildPath(series) {
  if (!series || series.length < 2) return '';
  const max = Math.max(...series);
  const min = Math.min(...series);
  const range = max - min || 1;
  const stepX = 70 / (series.length - 1);
  return series.map((v, i) => {
    const x = i * stepX;
    const y = 22 - ((v - min) / range) * 18 - 2;
    return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(' ');
}

export default memo(StatTileSpark);
