/* eslint-disable */
import React, { useState, useEffect, useCallback, memo } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Checkbox,
  FormGroup,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Alert,
  Tooltip,
  Grid,
  Divider,
  useTheme,
  alpha
} from '@mui/material';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
  Schedule as ScheduleIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PlayArrow as RunIcon,
  Pause as PauseIcon,
  Email as EmailIcon,
  Download as DownloadIcon,
  CalendarMonth as CalendarIcon,
  AccessTime as TimeIcon,
  Repeat as RepeatIcon,
  CheckCircle as ActiveIcon,
  Cancel as InactiveIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

/**
 * Report types available for scheduling
 */
const REPORT_TYPES = [
  { id: 'users', label: 'User Report', description: 'User statistics and activity' },
  { id: 'transactions', label: 'Transaction Report', description: 'Transaction summaries and trends' },
  { id: 'revenue', label: 'Revenue Report', description: 'Revenue breakdown and forecasts' },
  { id: 'analytics', label: 'Analytics Report', description: 'Comprehensive analytics data' },
  { id: 'security', label: 'Security Report', description: 'Security events and alerts' },
  { id: 'compliance', label: 'Compliance Report', description: 'Audit logs and compliance data' }
];

/**
 * Frequency options
 */
const FREQUENCIES = [
  { id: 'daily', label: 'Daily' },
  { id: 'weekly', label: 'Weekly' },
  { id: 'biweekly', label: 'Bi-Weekly' },
  { id: 'monthly', label: 'Monthly' },
  { id: 'quarterly', label: 'Quarterly' }
];

/**
 * Export format options
 */
const EXPORT_FORMATS = [
  { id: 'pdf', label: 'PDF' },
  { id: 'csv', label: 'CSV' },
  { id: 'excel', label: 'Excel' },
  { id: 'json', label: 'JSON' }
];

const STORAGE_KEY = 'admin_scheduled_reports';

/**
 * ReportScheduler - Component for scheduling automated reports
 * 
 * Features:
 * - Schedule recurring reports
 * - Multiple report types
 * - Email delivery options
 * - Export format selection
 * - Schedule management
 */
const ReportScheduler = memo(({
  onScheduleReport,
  onRunReport,
  onDeleteSchedule,
  onUpdateSchedule
}) => {
  const { t } = useTranslation();
  const theme = useTheme();

  // State
  const [schedules, setSchedules] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    reportType: '',
    frequency: 'weekly',
    time: new Date(),
    dayOfWeek: 1,
    dayOfMonth: 1,
    format: 'pdf',
    emailDelivery: false,
    emailRecipients: '',
    includeCharts: true,
    includeRawData: false,
    active: true
  });
  const [error, setError] = useState(null);

  // Persist schedules
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(schedules));
    } catch (e) {
      console.warn('Failed to save schedules:', e);
    }
  }, [schedules]);

  // Form handlers
  const handleOpenDialog = useCallback((schedule = null) => {
    if (schedule) {
      setEditingSchedule(schedule);
      setFormData({
        ...schedule,
        time: new Date(schedule.time)
      });
    } else {
      setEditingSchedule(null);
      setFormData({
        name: '',
        reportType: '',
        frequency: 'weekly',
        time: new Date(),
        dayOfWeek: 1,
        dayOfMonth: 1,
        format: 'pdf',
        emailDelivery: false,
        emailRecipients: '',
        includeCharts: true,
        includeRawData: false,
        active: true
      });
    }
    setError(null);
    setDialogOpen(true);
  }, []);

  const handleCloseDialog = useCallback(() => {
    setDialogOpen(false);
    setEditingSchedule(null);
    setError(null);
  }, []);

  const handleFormChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleSaveSchedule = useCallback(async () => {
    // Validate
    if (!formData.name || !formData.reportType) {
      setError('Please fill in all required fields');
      return;
    }

    if (formData.emailDelivery && !formData.emailRecipients) {
      setError('Please enter email recipients');
      return;
    }

    const scheduleData = {
      ...formData,
      id: editingSchedule?.id || Date.now(),
      time: formData.time.toISOString(),
      createdAt: editingSchedule?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastRun: editingSchedule?.lastRun || null,
      nextRun: calculateNextRun(formData)
    };

    try {
      if (onScheduleReport) {
        await onScheduleReport(scheduleData);
      }

      if (editingSchedule) {
        setSchedules(prev => prev.map(s => 
          s.id === editingSchedule.id ? scheduleData : s
        ));
      } else {
        setSchedules(prev => [...prev, scheduleData]);
      }

      handleCloseDialog();
    } catch (err) {
      setError(err.message);
    }
  }, [formData, editingSchedule, onScheduleReport, handleCloseDialog]);

  const handleDeleteSchedule = useCallback(async (scheduleId) => {
    try {
      if (onDeleteSchedule) {
        await onDeleteSchedule(scheduleId);
      }
      setSchedules(prev => prev.filter(s => s.id !== scheduleId));
    } catch (err) {
      console.error('Failed to delete schedule:', err);
    }
  }, [onDeleteSchedule]);

  const handleToggleActive = useCallback(async (schedule) => {
    const updated = { ...schedule, active: !schedule.active };
    try {
      if (onUpdateSchedule) {
        await onUpdateSchedule(updated);
      }
      setSchedules(prev => prev.map(s => 
        s.id === schedule.id ? updated : s
      ));
    } catch (err) {
      console.error('Failed to toggle schedule:', err);
    }
  }, [onUpdateSchedule]);

  const handleRunNow = useCallback(async (schedule) => {
    try {
      if (onRunReport) {
        await onRunReport(schedule);
      }
      // Update last run time
      setSchedules(prev => prev.map(s => 
        s.id === schedule.id 
          ? { ...s, lastRun: new Date().toISOString() }
          : s
      ));
    } catch (err) {
      console.error('Failed to run report:', err);
    }
  }, [onRunReport]);

  // Calculate next run time
  const calculateNextRun = (data) => {
    const now = new Date();
    const time = new Date(data.time);
    let nextRun = new Date();
    
    nextRun.setHours(time.getHours(), time.getMinutes(), 0, 0);

    switch (data.frequency) {
      case 'daily':
        if (nextRun <= now) nextRun.setDate(nextRun.getDate() + 1);
        break;
      case 'weekly':
        nextRun.setDate(nextRun.getDate() + (data.dayOfWeek - nextRun.getDay() + 7) % 7);
        if (nextRun <= now) nextRun.setDate(nextRun.getDate() + 7);
        break;
      case 'monthly':
        nextRun.setDate(data.dayOfMonth);
        if (nextRun <= now) nextRun.setMonth(nextRun.getMonth() + 1);
        break;
      default:
        break;
    }

    return nextRun.toISOString();
  };

  const getFrequencyLabel = (schedule) => {
    switch (schedule.frequency) {
      case 'daily':
        return `Daily at ${new Date(schedule.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
      case 'weekly':
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        return `Every ${days[schedule.dayOfWeek]} at ${new Date(schedule.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
      case 'monthly':
        return `Monthly on day ${schedule.dayOfMonth}`;
      default:
        return schedule.frequency;
    }
  };

  return (
    <Card elevation={2}>
      <CardHeader
        avatar={<ScheduleIcon color="primary" />}
        title={t('admin.reports.scheduler.title')}
        subheader={t('admin.reports.scheduler.subtitle')}
        action={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            {t('admin.reports.scheduler.addSchedule')}
          </Button>
        }
      />
      <CardContent>
        {schedules.length === 0 ? (
          <Box
            sx={{
              textAlign: 'center',
              py: 6,
              color: 'text.secondary'
            }}
          >
            <ScheduleIcon sx={{ fontSize: 64, mb: 2, opacity: 0.5 }} />
            <Typography variant="h6" gutterBottom>
              No Scheduled Reports
            </Typography>
            <Typography variant="body2" sx={{ mb: 3 }}>
              Create your first scheduled report to automate reporting
            </Typography>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
            >
              Create Schedule
            </Button>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Report Name</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Frequency</TableCell>
                  <TableCell>Format</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Next Run</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {schedules.map(schedule => (
                  <TableRow key={schedule.id}>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">
                        {schedule.name}
                      </Typography>
                      {schedule.emailDelivery && (
                        <Chip
                          icon={<EmailIcon />}
                          label="Email"
                          size="small"
                          variant="outlined"
                          sx={{ mt: 0.5 }}
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      {REPORT_TYPES.find(r => r.id === schedule.reportType)?.label || schedule.reportType}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <RepeatIcon fontSize="small" color="action" />
                        {getFrequencyLabel(schedule)}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={schedule.format.toUpperCase()}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={schedule.active ? <ActiveIcon /> : <InactiveIcon />}
                        label={schedule.active ? 'Active' : 'Paused'}
                        size="small"
                        color={schedule.active ? 'success' : 'default'}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption">
                        {schedule.nextRun 
                          ? new Date(schedule.nextRun).toLocaleString()
                          : 'Not scheduled'
                        }
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Run Now">
                        <IconButton
                          size="small"
                          onClick={() => handleRunNow(schedule)}
                          color="primary"
                        >
                          <RunIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={schedule.active ? 'Pause' : 'Activate'}>
                        <IconButton
                          size="small"
                          onClick={() => handleToggleActive(schedule)}
                          color={schedule.active ? 'warning' : 'success'}
                        >
                          {schedule.active ? <PauseIcon fontSize="small" /> : <ActiveIcon fontSize="small" />}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDialog(schedule)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteSchedule(schedule.id)}
                          color="error"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </CardContent>

      {/* Schedule dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingSchedule ? 'Edit Schedule' : 'Create New Schedule'}
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Grid container spacing={3} sx={{ mt: 0 }}>
            {/* Basic info */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Schedule Name"
                value={formData.name}
                onChange={(e) => handleFormChange('name', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Report Type</InputLabel>
                <Select
                  value={formData.reportType}
                  onChange={(e) => handleFormChange('reportType', e.target.value)}
                  label="Report Type"
                >
                  {REPORT_TYPES.map(type => (
                    <MenuItem key={type.id} value={type.id}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Schedule */}
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }}>
                <Chip label="Schedule" size="small" />
              </Divider>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Frequency</InputLabel>
                <Select
                  value={formData.frequency}
                  onChange={(e) => handleFormChange('frequency', e.target.value)}
                  label="Frequency"
                >
                  {FREQUENCIES.map(freq => (
                    <MenuItem key={freq.id} value={freq.id}>
                      {freq.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <TimePicker
                  label="Time"
                  value={formData.time}
                  onChange={(newValue) => handleFormChange('time', newValue)}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </LocalizationProvider>
            </Grid>
            {formData.frequency === 'weekly' && (
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Day of Week</InputLabel>
                  <Select
                    value={formData.dayOfWeek}
                    onChange={(e) => handleFormChange('dayOfWeek', e.target.value)}
                    label="Day of Week"
                  >
                    {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day, i) => (
                      <MenuItem key={i} value={i}>{day}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}
            {formData.frequency === 'monthly' && (
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Day of Month</InputLabel>
                  <Select
                    value={formData.dayOfMonth}
                    onChange={(e) => handleFormChange('dayOfMonth', e.target.value)}
                    label="Day of Month"
                  >
                    {[...Array(28)].map((_, i) => (
                      <MenuItem key={i + 1} value={i + 1}>{i + 1}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}

            {/* Format & Delivery */}
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }}>
                <Chip label="Format & Delivery" size="small" />
              </Divider>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Export Format</InputLabel>
                <Select
                  value={formData.format}
                  onChange={(e) => handleFormChange('format', e.target.value)}
                  label="Export Format"
                >
                  {EXPORT_FORMATS.map(format => (
                    <MenuItem key={format.id} value={format.id}>
                      {format.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={8}>
              <FormGroup row>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.includeCharts}
                      onChange={(e) => handleFormChange('includeCharts', e.target.checked)}
                    />
                  }
                  label="Include Charts"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.includeRawData}
                      onChange={(e) => handleFormChange('includeRawData', e.target.checked)}
                    />
                  }
                  label="Include Raw Data"
                />
              </FormGroup>
            </Grid>

            {/* Email delivery */}
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.emailDelivery}
                    onChange={(e) => handleFormChange('emailDelivery', e.target.checked)}
                  />
                }
                label="Email Delivery"
              />
            </Grid>
            {formData.emailDelivery && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email Recipients"
                  placeholder="email1@example.com, email2@example.com"
                  value={formData.emailRecipients}
                  onChange={(e) => handleFormChange('emailRecipients', e.target.value)}
                  helperText="Separate multiple emails with commas"
                />
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveSchedule}
          >
            {editingSchedule ? 'Update Schedule' : 'Create Schedule'}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
});

ReportScheduler.displayName = 'ReportScheduler';

export default ReportScheduler;
