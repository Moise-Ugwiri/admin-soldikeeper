import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Checkbox,
  FormControlLabel,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Paper,
  Tabs,
  Tab,
  Alert,
  IconButton,
  Tooltip,
  Fab,
  Divider,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Download,
  Schedule,
  Send,
  Visibility,
  Settings,
  Analytics,
  Assessment,
  BarChart,
  PieChart,
  Timeline,
  TrendingUp,
  Email,
  Event,
  FilterList,
  Save,
  Close,
  Refresh
} from '@mui/icons-material';
import {
  AreaChart,
  Area,
  Bar,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart
} from 'recharts';
import { useTranslation } from 'react-i18next';
import { useAdminData } from '../../contexts/AdminContext';

const AdvancedAnalytics = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  // State management
  const [activeTab, setActiveTab] = useState(0);
  const [reportBuilderOpen, setReportBuilderOpen] = useState(false);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [selectedMetrics, setSelectedMetrics] = useState([]);
  const [dateRange, setDateRange] = useState('last30days');
  const [chartType, setChartType] = useState('line');
  const [reportName, setReportName] = useState('');
  const [savedReports, setSavedReports] = useState([]);

  // TODO: Fetch reports from /api/admin/reports endpoint
  // For now, reports list is empty until backend implementation is ready

  const availableMetrics = [
    { id: 'user_income', name: 'User Income Tracked', category: 'Financial' },
    { id: 'user_expenses', name: 'User Expenses Tracked', category: 'Financial' },
    { id: 'transactions', name: 'Transaction Count', category: 'Financial' },
    { id: 'new_users', name: 'New Users', category: 'User' },
    { id: 'active_users', name: 'Active Users', category: 'User' },
    { id: 'retention', name: 'User Retention', category: 'User' },
    { id: 'conversion', name: 'Conversion Rate', category: 'Marketing' },
    { id: 'premium_users', name: 'Premium Users', category: 'Marketing' },
    { id: 'support_tickets', name: 'Support Tickets', category: 'Support' },
    { id: 'response_time', name: 'Avg Response Time', category: 'Performance' },
    { id: 'error_rate', name: 'Error Rate', category: 'Performance' }
  ];

  // Sample chart data
  const sampleData = [
    { name: 'Jan', revenue: 4000, users: 240, transactions: 1200 },
    { name: 'Feb', revenue: 3000, users: 139, transactions: 980 },
    { name: 'Mar', revenue: 2000, users: 980, transactions: 1100 },
    { name: 'Apr', revenue: 2780, users: 390, transactions: 1300 },
    { name: 'May', revenue: 1890, users: 480, transactions: 1050 },
    { name: 'Jun', revenue: 2390, users: 380, transactions: 1200 }
  ];

  const pieData = [
    { name: 'Premium', value: 400, color: theme.palette.primary.main },
    { name: 'Basic', value: 300, color: theme.palette.secondary.main },
    { name: 'Free', value: 300, color: theme.palette.info.main }
  ];

  // Event handlers
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleMetricToggle = (metricId) => {
    setSelectedMetrics(prev => 
      prev.includes(metricId) 
        ? prev.filter(id => id !== metricId)
        : [...prev, metricId]
    );
  };

  const handleSaveReport = () => {
    const newReport = {
      id: Date.now(),
      name: reportName,
      type: 'Custom',
      lastRun: new Date(),
      schedule: 'Manual',
      metrics: selectedMetrics
    };
    setSavedReports(prev => [...prev, newReport]);
    setReportBuilderOpen(false);
    setReportName('');
    setSelectedMetrics([]);
  };

  // Tab Panel component
  const TabPanel = ({ children, value, index, ...other }) => (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`analytics-tabpanel-${index}`}
      aria-labelledby={`analytics-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          {t('admin.analytics.advanced.title')}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<Schedule />}
            onClick={() => setScheduleDialogOpen(true)}
          >
            {t('admin.analytics.advanced.schedule')}
          </Button>
          <Button
            variant="outlined"
            startIcon={<Download />}
            onClick={() => console.log('Export all reports')}
          >
            {t('admin.analytics.advanced.exportAll')}
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setReportBuilderOpen(true)}
          >
            {t('admin.analytics.advanced.createReport')}
          </Button>
        </Box>
      </Box>

      {/* Quick Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" fontWeight="bold" color="primary">
                    €45,680
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('admin.analytics.advanced.stats.totalRevenue')}
                  </Typography>
                </Box>
                <TrendingUp sx={{ fontSize: 40, color: theme.palette.success.main }} />
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <Typography variant="body2" color="success.main">
                  +12.5%
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                  vs last month
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" fontWeight="bold" color="primary">
                    2,847
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('admin.analytics.advanced.stats.totalUsers')}
                  </Typography>
                </Box>
                <Analytics sx={{ fontSize: 40, color: theme.palette.info.main }} />
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <Typography variant="body2" color="success.main">
                  +18.2%
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                  vs last month
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" fontWeight="bold" color="primary">
                    73.2%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('admin.analytics.advanced.stats.conversionRate')}
                  </Typography>
                </Box>
                <Assessment sx={{ fontSize: 40, color: theme.palette.warning.main }} />
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <Typography variant="body2" color="error.main">
                  -2.1%
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                  vs last month
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" fontWeight="bold" color="primary">
                    85.7%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('admin.analytics.advanced.stats.satisfaction')}
                  </Typography>
                </Box>
                <Timeline sx={{ fontSize: 40, color: theme.palette.success.main }} />
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <Typography variant="body2" color="success.main">
                  +5.7%
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                  vs last month
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Card elevation={2}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange} aria-label="analytics tabs">
            <Tab icon={<BarChart />} label={t('admin.analytics.advanced.tabs.overview')} />
            <Tab icon={<Assessment />} label={t('admin.analytics.advanced.tabs.customReports')} />
            <Tab icon={<Timeline />} label={t('admin.analytics.advanced.tabs.trends')} />
            <Tab icon={<Settings />} label={t('admin.analytics.advanced.tabs.automation')} />
          </Tabs>
        </Box>

        {/* Overview Tab */}
        <TabPanel value={activeTab} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} lg={8}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h6">
                      {t('admin.analytics.advanced.charts.revenueGrowth')}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <FormControl size="small" sx={{ minWidth: 120 }}>
                        <InputLabel>{t('admin.analytics.advanced.filters.period')}</InputLabel>
                        <Select
                          value={dateRange}
                          label={t('admin.analytics.advanced.filters.period')}
                          onChange={(e) => setDateRange(e.target.value)}
                        >
                          <MenuItem value="last7days">Last 7 Days</MenuItem>
                          <MenuItem value="last30days">Last 30 Days</MenuItem>
                          <MenuItem value="last3months">Last 3 Months</MenuItem>
                          <MenuItem value="lastyear">Last Year</MenuItem>
                        </Select>
                      </FormControl>
                      <IconButton size="small">
                        <Download />
                      </IconButton>
                    </Box>
                  </Box>
                  <Box sx={{ height: 400 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={sampleData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis yAxisId="left" />
                        <YAxis yAxisId="right" orientation="right" />
                        <RechartsTooltip />
                        <Legend />
                        <Area
                          yAxisId="left"
                          type="monotone"
                          dataKey="revenue"
                          fill={theme.palette.primary.main}
                          fillOpacity={0.3}
                          stroke={theme.palette.primary.main}
                          name="Revenue (€)"
                        />
                        <Bar
                          yAxisId="right"
                          dataKey="transactions"
                          fill={theme.palette.secondary.main}
                          name="Transactions"
                        />
                        <Line
                          yAxisId="right"
                          type="monotone"
                          dataKey="users"
                          stroke={theme.palette.success.main}
                          strokeWidth={3}
                          name="New Users"
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} lg={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {t('admin.analytics.advanced.charts.userDistribution')}
                  </Typography>
                  <Box sx={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={120}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <RechartsTooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Custom Reports Tab */}
        <TabPanel value={activeTab} index={1}>
          <Box sx={{ mb: 3 }}>
            <Alert severity="info">
              {t('admin.analytics.advanced.reports.info')}
            </Alert>
          </Box>
          
          <Grid container spacing={3}>
            {savedReports.length === 0 ? (
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Box sx={{ 
                      textAlign: 'center', 
                      py: 8,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 2
                    }}>
                      <Assessment sx={{ fontSize: 80, color: 'text.secondary', opacity: 0.3 }} />
                      <Typography variant="h6" color="text.secondary">
                        {t('admin.analytics.advanced.reports.noReports') || 'No Reports Available'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {t('admin.analytics.advanced.reports.noReportsDesc') || 'Create custom reports to analyze your platform data. Reports feature coming soon.'}
                      </Typography>
                      <Button 
                        variant="contained" 
                        startIcon={<Add />}
                        disabled
                        sx={{ mt: 2 }}
                      >
                        {t('admin.analytics.advanced.reports.createFirst') || 'Create First Report'}
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ) : (
              savedReports.map((report) => (
                <Grid item xs={12} md={6} lg={4} key={report.id}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                        <Typography variant="h6" gutterBottom>
                          {report.name}
                        </Typography>
                        <Chip
                          label={report.type}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Last run: {report.lastRun.toLocaleDateString()}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Schedule: {report.schedule}
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 2 }}>
                        {report.metrics.map((metric) => (
                          <Chip
                            key={metric}
                            label={metric}
                            size="small"
                            variant="outlined"
                          />
                        ))}
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                        <Button size="small" startIcon={<Visibility />}>
                          {t('admin.analytics.advanced.reports.view')}
                        </Button>
                        <Box>
                          <IconButton size="small">
                            <Edit />
                          </IconButton>
                          <IconButton size="small">
                            <Download />
                          </IconButton>
                          <IconButton size="small" color="error">
                            <Delete />
                          </IconButton>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))
            )}
          </Grid>
        </TabPanel>

        {/* Trends Tab */}
        <TabPanel value={activeTab} index={2}>
          <Typography variant="h6" gutterBottom>
            {t('admin.analytics.advanced.trends.title')}
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {t('admin.analytics.advanced.trends.predictive')}
                  </Typography>
                  <Alert severity="warning" sx={{ mb: 2 }}>
                    {t('admin.analytics.advanced.trends.warning')}
                  </Alert>
                  <Box sx={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={sampleData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <RechartsTooltip />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="revenue"
                          stroke={theme.palette.primary.main}
                          strokeWidth={2}
                          strokeDasharray="5 5"
                          name="Predicted Revenue"
                        />
                        <Line
                          type="monotone"
                          dataKey="users"
                          stroke={theme.palette.success.main}
                          strokeWidth={2}
                          name="Predicted Users"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Automation Tab */}
        <TabPanel value={activeTab} index={3}>
          <Typography variant="h6" gutterBottom>
            {t('admin.analytics.advanced.automation.title')}
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {t('admin.analytics.advanced.automation.scheduled')}
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemIcon>
                        <Event />
                      </ListItemIcon>
                      <ListItemText
                        primary="Daily Revenue Report"
                        secondary="Sends every day at 9:00 AM"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <Email />
                      </ListItemIcon>
                      <ListItemText
                        primary="Weekly User Growth"
                        secondary="Sends every Monday at 8:00 AM"
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {t('admin.analytics.advanced.automation.alerts')}
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemIcon>
                        <Analytics />
                      </ListItemIcon>
                      <ListItemText
                        primary="Revenue Drop Alert"
                        secondary="Trigger when revenue drops > 20%"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <Assessment />
                      </ListItemIcon>
                      <ListItemText
                        primary="High Churn Alert"
                        secondary="Trigger when churn rate > 15%"
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
      </Card>

      {/* Report Builder Dialog */}
      <Dialog
        open={reportBuilderOpen}
        onClose={() => setReportBuilderOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {t('admin.analytics.advanced.reportBuilder.title')}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label={t('admin.analytics.advanced.reportBuilder.name')}
            value={reportName}
            onChange={(e) => setReportName(e.target.value)}
            sx={{ mb: 3 }}
          />
          
          <Typography variant="h6" gutterBottom>
            {t('admin.analytics.advanced.reportBuilder.selectMetrics')}
          </Typography>
          
          <Grid container spacing={2}>
            {availableMetrics.map((metric) => (
              <Grid item xs={12} sm={6} key={metric.id}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selectedMetrics.includes(metric.id)}
                      onChange={() => handleMetricToggle(metric.id)}
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body2">{metric.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {metric.category}
                      </Typography>
                    </Box>
                  }
                />
              </Grid>
            ))}
          </Grid>
          
          <Box sx={{ mt: 3 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>{t('admin.analytics.advanced.reportBuilder.chartType')}</InputLabel>
              <Select
                value={chartType}
                label={t('admin.analytics.advanced.reportBuilder.chartType')}
                onChange={(e) => setChartType(e.target.value)}
              >
                <MenuItem value="line">Line Chart</MenuItem>
                <MenuItem value="bar">Bar Chart</MenuItem>
                <MenuItem value="area">Area Chart</MenuItem>
                <MenuItem value="pie">Pie Chart</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReportBuilderOpen(false)}>
            {t('admin.analytics.advanced.reportBuilder.cancel')}
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveReport}
            disabled={!reportName || selectedMetrics.length === 0}
          >
            {t('admin.analytics.advanced.reportBuilder.save')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add report"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16
        }}
        onClick={() => setReportBuilderOpen(true)}
      >
        <Add />
      </Fab>
    </Box>
  );
};

export default AdvancedAnalytics;
