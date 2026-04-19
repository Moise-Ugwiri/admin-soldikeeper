import React, { memo } from 'react';
import { Box, Stack, Typography, LinearProgress, alpha, useTheme } from '@mui/material';
import { Speed, Storage, Memory, NetworkCheck } from '@mui/icons-material';

/**
 * SystemVitals — single hospital-monitor-style panel replacing 4 separate cards.
 * Compact rows with icon · label · sparkline value · progress bar.
 */
const SystemVitals = ({ data = [] }) => {
  const theme = useTheme();
  return (
    <Box
      sx={{
        p: { xs: 1.5, sm: 2.25 },
        borderRadius: 2.5,
        bgcolor: 'background.paper',
        border: `1px solid ${theme.palette.divider}`,
        height: '100%',
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'success.main', boxShadow: '0 0 6px rgba(16,185,129,0.6)' }} />
        <Typography sx={{ fontSize: 13, fontWeight: 800, letterSpacing: 0.5 }}>SYSTEM VITALS</Typography>
        <Typography sx={{ fontSize: 10.5, opacity: 0.6, ml: 'auto' }}>real-time</Typography>
      </Stack>

      <Stack spacing={1.5}>
        {data.map((v) => (
          <VitalRow key={v.name} {...v} />
        ))}
      </Stack>
    </Box>
  );
};

const ICONS = {
  performance: <Speed />, storage: <Storage />, memory: <Memory />, network: <NetworkCheck />,
};

const VitalRow = ({ name, value, color, status, kind }) => {
  const theme = useTheme();
  const c = color || theme.palette.primary.main;
  const Ico = ICONS[kind] || ICONS.performance;
  const statusColor = status === 'critical' ? theme.palette.error.main
    : status === 'warning' ? theme.palette.warning.main
    : theme.palette.success.main;

  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={1.25} sx={{ mb: 0.5 }}>
        <Box sx={{ color: alpha(c, 0.85), display: 'flex' }}>
          {React.cloneElement(Ico, { sx: { fontSize: 16 } })}
        </Box>
        <Typography sx={{ fontSize: 12, fontWeight: 600, flex: 1 }} noWrap>{name}</Typography>
        <Typography sx={{ fontFamily: 'ui-monospace, monospace', fontSize: 13, fontWeight: 800, color: statusColor }}>
          {Math.round(value)}%
        </Typography>
      </Stack>
      <LinearProgress
        variant="determinate"
        value={Math.min(100, value)}
        sx={{
          height: 5,
          borderRadius: 3,
          bgcolor: alpha(c, 0.1),
          '& .MuiLinearProgress-bar': { bgcolor: statusColor, borderRadius: 3 },
        }}
      />
    </Box>
  );
};

export default memo(SystemVitals);
