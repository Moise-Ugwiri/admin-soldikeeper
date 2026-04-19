import React from 'react';
import {
  Box, Typography, Chip, IconButton, Tooltip, Menu, MenuItem, ListItemIcon, ListItemText, Badge,
} from '@mui/material';
import {
  Refresh, Add, Backup, Download, Email, Analytics, Settings, MoreVert, NotificationImportant, FiberManualRecord,
} from '@mui/icons-material';

/**
 * Compact page header replacing the gradient title block + giant 6-button quick-actions panel.
 * Quick Actions are collapsed into an overflow menu — the dashboard now leads with content.
 */
const PageHeader = React.memo(function PageHeader({
  title,
  subtitle,
  wsLive,
  alertsCount = 0,
  loading = false,
  onRefresh,
  onAddUser,
  onBackup,
  onExport,
  onNotify,
  onReport,
  onSettings,
}) {
  const [anchor, setAnchor] = React.useState(null);
  const open = Boolean(anchor);
  const close = () => setAnchor(null);

  const item = (label, icon, fn) => (
    <MenuItem
      key={label}
      onClick={() => { close(); fn?.(); }}
      sx={{ minWidth: 220 }}
    >
      <ListItemIcon>{icon}</ListItemIcon>
      <ListItemText>{label}</ListItemText>
    </MenuItem>
  );

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: { xs: 'flex-start', sm: 'center' },
        justifyContent: 'space-between',
        flexDirection: { xs: 'column', sm: 'row' },
        gap: 1.5,
        mb: { xs: 2, sm: 3 },
      }}
    >
      <Box sx={{ minWidth: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <Typography variant="h5" sx={{ fontWeight: 700, fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
            {title}
          </Typography>
          {wsLive && (
            <Chip
              size="small"
              icon={<FiberManualRecord sx={{ fontSize: '0.6rem !important', color: 'success.main' }} />}
              label="LIVE"
              sx={{
                height: 22,
                fontSize: '0.65rem',
                fontWeight: 700,
                letterSpacing: 0.5,
                color: 'success.main',
                bgcolor: (t) => t.palette.mode === 'dark' ? 'rgba(46,160,67,0.15)' : 'rgba(46,160,67,0.1)',
                border: '1px solid',
                borderColor: 'success.main',
                animation: 'pulse 2.4s ease-in-out infinite',
                '@keyframes pulse': {
                  '0%, 100%': { opacity: 1 },
                  '50%': { opacity: 0.55 },
                },
              }}
            />
          )}
        </Box>
        {subtitle && (
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
            {subtitle}
          </Typography>
        )}
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <Tooltip title="Refresh data">
          <span>
            <IconButton
              size="small"
              onClick={onRefresh}
              disabled={loading}
              sx={{
                animation: loading ? 'spin 1s linear infinite' : 'none',
                '@keyframes spin': { from: { transform: 'rotate(0)' }, to: { transform: 'rotate(360deg)' } },
              }}
            >
              <Refresh fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>

        <Tooltip title={alertsCount ? `${alertsCount} security alerts` : 'No alerts'}>
          <IconButton size="small">
            <Badge badgeContent={alertsCount} color="error" sx={{ '& .MuiBadge-badge': { fontSize: 10, minWidth: 16, height: 16 } }}>
              <NotificationImportant fontSize="small" />
            </Badge>
          </IconButton>
        </Tooltip>

        <Tooltip title="Quick actions">
          <IconButton size="small" onClick={(e) => setAnchor(e.currentTarget)}>
            <MoreVert fontSize="small" />
          </IconButton>
        </Tooltip>
        <Menu anchorEl={anchor} open={open} onClose={close} transformOrigin={{ horizontal: 'right', vertical: 'top' }} anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}>
          {item('Add User', <Add fontSize="small" />, onAddUser)}
          {item('Create Backup', <Backup fontSize="small" />, onBackup)}
          {item('Export Data', <Download fontSize="small" />, onExport)}
          {item('Notify Users', <Email fontSize="small" />, onNotify)}
          {item('Generate Report', <Analytics fontSize="small" />, onReport)}
          {item('Settings', <Settings fontSize="small" />, onSettings)}
        </Menu>
      </Box>
    </Box>
  );
});

export default PageHeader;
