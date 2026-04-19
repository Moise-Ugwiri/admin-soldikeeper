import React, { memo, useEffect, useState } from 'react';
import { Box, Stack, Typography, IconButton, Tooltip, Chip, Badge, Menu, MenuItem, ListItemIcon, ListItemText, Divider, alpha, useTheme } from '@mui/material';
import {
  RefreshRounded, MoreVertRounded, NotificationsActiveRounded,
  PersonAddAlt1Rounded, BackupRounded, CloudDownloadRounded,
  CampaignRounded, AssessmentRounded, SettingsRounded,
} from '@mui/icons-material';

/**
 * MissionStrip — single-line "command bar" inspired by NASA mission control.
 * Replaces the bulky page-header. Shows status pulse + key counters + clock + actions.
 */
const MissionStrip = ({
  systemHealth = 'nominal',  // 'nominal' | 'degraded' | 'critical'
  fleetActive = 0,
  fleetTotal = 0,
  alertsCount = 0,
  escalationsCount = 0,
  uptimePct = 99.9,
  wsLive = false,
  loading = false,
  onRefresh, onAddUser, onBackup, onExport, onNotify, onReport, onSettings,
}) => {
  const theme = useTheme();
  const [now, setNow] = useState(new Date());
  const [menuEl, setMenuEl] = useState(null);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const statusColor = systemHealth === 'critical'
    ? theme.palette.error.main
    : systemHealth === 'degraded'
      ? theme.palette.warning.main
      : theme.palette.success.main;

  const statusLabel = systemHealth === 'critical'
    ? 'CRITICAL'
    : systemHealth === 'degraded'
      ? 'DEGRADED'
      : 'ALL SYSTEMS NOMINAL';

  const utc = now.toISOString().slice(11, 19);
  const local = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  const close = () => setMenuEl(null);
  const quick = [
    { icon: <PersonAddAlt1Rounded fontSize="small" />, label: 'Add User', cb: onAddUser },
    { icon: <BackupRounded fontSize="small" />,        label: 'Backup DB', cb: onBackup },
    { icon: <CloudDownloadRounded fontSize="small" />, label: 'Export Data', cb: onExport },
    { icon: <CampaignRounded fontSize="small" />,      label: 'Broadcast Notification', cb: onNotify },
    { icon: <AssessmentRounded fontSize="small" />,    label: 'Generate Report', cb: onReport },
    { icon: <SettingsRounded fontSize="small" />,      label: 'System Settings', cb: onSettings },
  ];

  return (
    <Box
      sx={{
        position: 'relative',
        mb: { xs: 2, sm: 3 },
        px: { xs: 1.5, sm: 2.5 },
        py: { xs: 1, sm: 1.25 },
        borderRadius: 2,
        bgcolor: theme.palette.mode === 'dark'
          ? alpha(theme.palette.common.black, 0.45)
          : alpha(theme.palette.common.black, 0.92),
        color: 'common.white',
        overflow: 'hidden',
        backgroundImage: `radial-gradient(1200px 200px at 0% 0%, ${alpha(statusColor, 0.18)} 0%, transparent 60%)`,
        border: `1px solid ${alpha(statusColor, 0.35)}`,
      }}
    >
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={{ xs: 1, md: 2 }}
        alignItems={{ xs: 'flex-start', md: 'center' }}
        justifyContent="space-between"
      >
        {/* LEFT — pulse + status */}
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ minWidth: 0 }}>
          <Box
            sx={{
              width: 10, height: 10, borderRadius: '50%',
              bgcolor: statusColor,
              boxShadow: `0 0 0 0 ${alpha(statusColor, 0.7)}`,
              animation: 'msPulse 2s infinite',
              '@keyframes msPulse': {
                '0%':   { boxShadow: `0 0 0 0 ${alpha(statusColor, 0.7)}` },
                '70%':  { boxShadow: `0 0 0 10px ${alpha(statusColor, 0)}` },
                '100%': { boxShadow: `0 0 0 0 ${alpha(statusColor, 0)}` },
              },
            }}
          />
          <Typography
            sx={{
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
              letterSpacing: 1.5,
              fontSize: { xs: 11, sm: 12 },
              fontWeight: 700,
              color: statusColor,
            }}
            noWrap
          >
            {statusLabel}
          </Typography>
          <Chip
            size="small"
            label={wsLive ? 'WS · LIVE' : 'WS · OFFLINE'}
            sx={{
              height: 20,
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: 0.5,
              bgcolor: alpha(wsLive ? theme.palette.success.main : theme.palette.error.main, 0.18),
              color: wsLive ? theme.palette.success.light : theme.palette.error.light,
              border: `1px solid ${alpha(wsLive ? theme.palette.success.main : theme.palette.error.main, 0.4)}`,
            }}
          />
        </Stack>

        {/* CENTER — counters */}
        <Stack direction="row" spacing={{ xs: 1, sm: 2 }} alignItems="center" flexWrap="wrap">
          <Counter label="AGENTS" value={`${fleetActive}/${fleetTotal}`} accent={theme.palette.primary.light} />
          <Counter label="UPTIME" value={`${uptimePct.toFixed(2)}%`} accent={theme.palette.success.light} />
          <Counter label="ESCALATIONS" value={escalationsCount} accent={escalationsCount > 0 ? theme.palette.warning.light : theme.palette.text.disabled} />
          <Counter label="ALERTS" value={alertsCount} accent={alertsCount > 0 ? theme.palette.error.light : theme.palette.text.disabled} />
        </Stack>

        {/* RIGHT — clock + actions */}
        <Stack direction="row" spacing={1} alignItems="center">
          <Box sx={{ textAlign: 'right', display: { xs: 'none', sm: 'block' } }}>
            <Typography sx={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: 13, fontWeight: 700, lineHeight: 1.1 }}>
              {local}
            </Typography>
            <Typography sx={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: 10, opacity: 0.55, letterSpacing: 0.5 }}>
              {utc} UTC
            </Typography>
          </Box>
          <Tooltip title="Refresh">
            <IconButton size="small" onClick={onRefresh} sx={{ color: 'common.white' }}>
              <RefreshRounded fontSize="small" sx={{ animation: loading ? 'msSpin 1s linear infinite' : 'none', '@keyframes msSpin': { from: { transform: 'rotate(0)' }, to: { transform: 'rotate(360deg)' } } }} />
            </IconButton>
          </Tooltip>
          <Tooltip title={`${alertsCount} alert(s)`}>
            <IconButton size="small" sx={{ color: 'common.white' }}>
              <Badge color="error" badgeContent={alertsCount} max={99}>
                <NotificationsActiveRounded fontSize="small" />
              </Badge>
            </IconButton>
          </Tooltip>
          <Tooltip title="Quick actions">
            <IconButton size="small" onClick={(e) => setMenuEl(e.currentTarget)} sx={{ color: 'common.white' }}>
              <MoreVertRounded fontSize="small" />
            </IconButton>
          </Tooltip>
          <Menu
            anchorEl={menuEl}
            open={Boolean(menuEl)}
            onClose={close}
            PaperProps={{ sx: { borderRadius: 2, minWidth: 220 } }}
          >
            {quick.map((q, i) => [
              i === 3 && <Divider key={`d${i}`} sx={{ my: 0.5 }} />,
              <MenuItem key={q.label} onClick={() => { close(); q.cb?.(); }}>
                <ListItemIcon>{q.icon}</ListItemIcon>
                <ListItemText primary={q.label} primaryTypographyProps={{ fontSize: 14 }} />
              </MenuItem>,
            ])}
          </Menu>
        </Stack>
      </Stack>
    </Box>
  );
};

const Counter = memo(({ label, value, accent }) => (
  <Box sx={{ textAlign: 'center', minWidth: 64 }}>
    <Typography sx={{ fontSize: 9.5, opacity: 0.6, letterSpacing: 1.2, fontWeight: 600 }}>{label}</Typography>
    <Typography sx={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: 14, fontWeight: 800, color: accent, lineHeight: 1.2 }}>
      {value}
    </Typography>
  </Box>
));

export default memo(MissionStrip);
