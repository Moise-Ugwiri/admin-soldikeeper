import React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography, TextField,
  FormControl, InputLabel, Select, MenuItem, Alert, List, ListItem, ListItemIcon, ListItemText,
} from '@mui/material';
import { CheckCircle, Settings, Email, Security, Backup } from '@mui/icons-material';

/**
 * All quick-action dialogs in one lazy-loaded module.
 * Lifted out of AdminOverview to prevent re-render of charts when dialog state changes.
 */
export default function OverviewDialogs({
  state, setState,
  newUser, setNewUser,
  notification, setNotification,
  exportFormat, setExportFormat,
  reportType, setReportType,
  backupInProgress, exportInProgress,
  onAddUser, onBackup, onExport, onNotify, onReport, onSettings,
}) {
  const close = (key) => () => setState((s) => ({ ...s, [key]: false }));
  return (
    <>
      {/* Add User */}
      <Dialog open={!!state.addUser} onClose={close('addUser')} maxWidth="sm" fullWidth>
        <DialogTitle>Add New User</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField label="Full Name" fullWidth value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} />
            <TextField label="Email" type="email" fullWidth value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} />
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select value={newUser.role} label="Role"
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}>
                <MenuItem value="user">User</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="moderator">Moderator</MenuItem>
              </Select>
            </FormControl>
            <Alert severity="info">For full user management, please use the <strong>Users</strong> tab.</Alert>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={close('addUser')}>Cancel</Button>
          <Button onClick={onAddUser} variant="contained" disabled={!newUser.name || !newUser.email}>Add User</Button>
        </DialogActions>
      </Dialog>

      {/* Backup */}
      <Dialog open={!!state.backup} onClose={close('backup')} maxWidth="sm" fullWidth>
        <DialogTitle>Create Database Backup</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Typography variant="body2" paragraph>This will create a full backup including:</Typography>
            <List dense>
              {['All user data', 'Transaction records', 'System settings', 'Activity logs'].map((t) => (
                <ListItem key={t}>
                  <ListItemIcon><CheckCircle fontSize="small" color="success" /></ListItemIcon>
                  <ListItemText primary={t} />
                </ListItem>
              ))}
            </List>
            <Alert severity="warning" sx={{ mt: 2 }}>Backup may take a few minutes depending on database size.</Alert>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={close('backup')}>Cancel</Button>
          <Button onClick={onBackup} variant="contained" disabled={backupInProgress}>
            {backupInProgress ? 'Creating Backup...' : 'Create Backup'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Export */}
      <Dialog open={!!state.export} onClose={close('export')} maxWidth="sm" fullWidth>
        <DialogTitle>Export Dashboard Data</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="body2" color="text.secondary">Select the export format:</Typography>
            <FormControl fullWidth>
              <InputLabel>Export Format</InputLabel>
              <Select value={exportFormat} label="Export Format"
                onChange={(e) => setExportFormat(e.target.value)}>
                <MenuItem value="csv">CSV (Comma-Separated Values)</MenuItem>
                <MenuItem value="xlsx">Excel (XLSX)</MenuItem>
                <MenuItem value="json">JSON</MenuItem>
                <MenuItem value="pdf">PDF Report</MenuItem>
              </Select>
            </FormControl>
            <Alert severity="info">Includes statistics, user data, and transaction summaries.</Alert>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={close('export')}>Cancel</Button>
          <Button onClick={onExport} variant="contained" disabled={exportInProgress}>
            {exportInProgress ? 'Exporting...' : 'Export'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notify */}
      <Dialog open={!!state.notify} onClose={close('notify')} maxWidth="sm" fullWidth>
        <DialogTitle>Send Notification to Users</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField label="Notification Title" fullWidth value={notification.title}
              onChange={(e) => setNotification({ ...notification, title: e.target.value })} />
            <TextField label="Message" fullWidth multiline rows={4} value={notification.message}
              onChange={(e) => setNotification({ ...notification, message: e.target.value })} />
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select value={notification.type} label="Type"
                onChange={(e) => setNotification({ ...notification, type: e.target.value })}>
                <MenuItem value="info">Information</MenuItem>
                <MenuItem value="success">Success</MenuItem>
                <MenuItem value="warning">Warning</MenuItem>
                <MenuItem value="error">Alert</MenuItem>
              </Select>
            </FormControl>
            <Alert severity="warning">This notification will be sent to all active users.</Alert>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={close('notify')}>Cancel</Button>
          <Button onClick={onNotify} variant="contained" disabled={!notification.title || !notification.message}>
            Send Notification
          </Button>
        </DialogActions>
      </Dialog>

      {/* Report */}
      <Dialog open={!!state.report} onClose={close('report')} maxWidth="sm" fullWidth>
        <DialogTitle>Generate Report</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="body2" color="text.secondary">Select the type of report:</Typography>
            <FormControl fullWidth>
              <InputLabel>Report Type</InputLabel>
              <Select value={reportType} label="Report Type"
                onChange={(e) => setReportType(e.target.value)}>
                <MenuItem value="users">Users Report</MenuItem>
                <MenuItem value="transactions">Transactions Report</MenuItem>
                <MenuItem value="revenue">Revenue Report</MenuItem>
                <MenuItem value="analytics">Analytics Report</MenuItem>
                <MenuItem value="security">Security Report</MenuItem>
                <MenuItem value="dashboard">Complete Dashboard Report</MenuItem>
              </Select>
            </FormControl>
            <Alert severity="info">Report generated as PDF with detailed statistics and charts.</Alert>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={close('report')}>Cancel</Button>
          <Button onClick={onReport} variant="contained">Generate Report</Button>
        </DialogActions>
      </Dialog>

      {/* Settings */}
      <Dialog open={!!state.settings} onClose={close('settings')} maxWidth="sm" fullWidth>
        <DialogTitle>Quick Settings</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Alert severity="info" sx={{ mb: 2 }}>
              For complete system settings, please use the <strong>Settings</strong> tab.
            </Alert>
            <Typography variant="body2" color="text.secondary" paragraph>Quick access to common settings:</Typography>
            <List>
              {[
                { i: <Settings />, p: 'System Configuration', s: 'Maintenance mode, registration settings' },
                { i: <Email />, p: 'Email Settings', s: 'SMTP configuration, templates' },
                { i: <Security />, p: 'Security Settings', s: 'Authentication, rate limiting' },
                { i: <Backup />, p: 'Backup Settings', s: 'Automated backups, retention policy' },
              ].map((it) => (
                <ListItem key={it.p} button>
                  <ListItemIcon>{it.i}</ListItemIcon>
                  <ListItemText primary={it.p} secondary={it.s} />
                </ListItem>
              ))}
            </List>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={close('settings')}>Close</Button>
          <Button onClick={onSettings} variant="contained">Go to Settings</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
