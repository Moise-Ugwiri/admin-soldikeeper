/* eslint-disable */
import React, { useState, useEffect, useMemo } from 'react';
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
  Paper,
  Tabs,
  Tab,
  Alert,
  IconButton,
  Fab,
  Divider,
  useTheme,
  useMediaQuery,
  LinearProgress,
  alpha,
  Table,
  TableBody,
  TableCell,
  TableRow
} from '@mui/material';
import {
  Add,
  Delete,
  Download,
  Visibility,
  Settings,
  Analytics,
  Assessment,
  BarChart as BarChartIcon,
  Timeline,
  TrendingUp,
  FilterList,
  Close,
  Refresh,
  CheckCircle,
  Warning,
  Error as ErrorIcon,
  PlayArrow,
  VerifiedUser,
  Speed,
  DataUsage,
  ShowChart
} from '@mui/icons-material';
import {
  AreaChart,
  Area,
  BarChart as RechartsBarChart,
  Bar,
  PieChart,
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
import { useAdminData } from '../../contexts/AdminContext';

const AdvancedAnalytics = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  const {
    analytics,
    adminStats,
    loading,
    fetchAnalytics,
    exportData
  } = useAdminData();

  // State management
  const [activeTab, setActiveTab] = useState(0);
  const [reportBuilderOpen, setReportBuilderOpen] = useState(false);
  const [reportViewOpen, setReportViewOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [selectedMetrics, setSelectedMetrics] = useState([]);
  const [dateRange, setDateRange] = useState('last30days');
  const [chartType, setChartType] = useState('line');
  const [reportName, setReportName] = useState('');
  const [savedReports, setSavedReports] = useState([]);

  const availableMetrics = [
    { id: 'totalUsers', name: 'Total Users', category: 'User', getValue: () => adminStats?.totalUsers || 0 },
    { id: 'activeUsers', name: 'Active Users', category: 'User', getValue: () => adminStats?.activeUsers || 0 },
    { id: 'newUsers', name: 'New Users', category: 'User', getValue: () => adminStats?.newUsers || 0 },
    { id: 'premiumUsers', name: 'Premium Users', category: 'Marketing', getValue: () => adminStats?.premiumUsers || 0 },
    { id: 'freeUsers', name: 'Free Users', category: 'User', getValue: () => adminStats?.freeUsers || 0 },
    { id: 'conversionRate', name: 'Conversion Rate (%)', category: 'Marketing', getValue: () => adminStats?.conversionRate || 0 },
    { id: 'userGrowth', name: 'User Growth (%)', category: 'User', getValue: () => adminStats?.userGrowth || 0 },
    { id: 'totalTransactions', name: 'Total Transactions', category: 'Financial', getValue: () => adminStats?.totalTransactions || 0 },
    { id: 'totalUserIncome', name: 'User Income Tracked (€)', category: 'Financial', getValue: () => adminStats?.totalUserIncome || 0 },
    { id: 'totalUserExpenses', name: 'User Expenses Tracked (€)', category: 'Financial', getValue: () => adminStats?.totalUserExpenses || 0 },
    { id: 'systemHealth', name: 'System Health Score', category: 'Performance', getValue: () => adminStats?.systemHealth || 100 }
  ];

  // Prepare real chart data
  const chartData = useMemo(() => {
    // Revenue composition from category distribution
    const revenueComposition = analytics?.categoryDistribution?.slice(0, 6).map((cat, idx) => ({
      category: cat.category,
      amount: cat.amount || 0,
      count: cat.count || 0,
      color: [
        theme.palette.primary.main,
        theme.palette.secondary.main,
        theme.palette.success.main,
        theme.palette.warning.main,
        theme.palette.error.main,
        theme.palette.info.main
      ][idx % 6]
    })) || [];

    // User distribution pie
    const userDistribution = [
      { 
        name: 'Free', 
        value: adminStats?.freeUsers || 0, 
        color: theme.palette.grey[400] 
      },
      { 
        name: 'Premium', 
        value: adminStats?.premiumUsers || 0, 
        color: theme.palette.primary.main 
      }
    ].filter(s => s.value > 0);

    // Transaction trends
    const transactionTrends = analytics?.transactionVolume?.map(t => ({
      date: new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      income: t.income || 0,
      expenses: t.expenses || 0,
      net: (t.income || 0) - (t.expenses || 0)
    })) || [];

    // User growth trends
    const userGrowthTrends = analytics?.userRegistrations?.map(r => ({
      date: new Date(r.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      users: r.count
    })) || [];

    return {
      revenueComposition,
      userDistribution,
      transactionTrends,
      userGrowthTrends
    };
  }, [analytics, adminStats, theme.palette]);

  // Load analytics
  useEffect(() => {
    if (fetchAnalytics) {
      fetchAnalytics(dateRange, 'overview');
    }
  }, [fetchAnalytics, dateRange]);

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
      metrics: selectedMetrics,
      chartType,
      createdAt: new Date()
    };
    setSavedReports(prev => [...prev, newReport]);
    setReportBuilderOpen(false);
    setReportName('');
    setSelectedMetrics([]);
  };

  const handleRunReport = (report) => {
    setSelectedReport(report);
    setReportViewOpen(true);
  };

  const handleDeleteReport = (reportId) => {
    setSavedReports(prev => prev.filter(r => r.id !== reportId));
  };

  const handleExportCSV = () => {
    const csvData = Object.entries(adminStats || {})
      .map(([key, value]) => `${key},${value}`)
      .join('\n');
    
    const blob = new Blob(['Metric,Value\n' + csvData], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics_${new Date().toISOString()}.csv`;
    a.click();
  };

  const handleExportJSON = () => {
    const jsonData = JSON.stringify({ adminStats, analytics }, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics_${new Date().toISOString()}.json`;
    a.click();
  };

  // Tab Panel component
  const TabPanel = ({ children, value, index }) => (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`analytics-tabpanel-${index}`}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Advanced Analytics
          </Typography>
          <Chip 
            label="Real-time Platform Intelligence" 
            color="primary" 
            size="small" 
            icon={<Analytics />}
          />
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<Download />}
            onClick={handleExportCSV}
          >
            Export CSV
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setReportBuilderOpen(true)}
          >
            Create Report
          </Button>
        </Box>
      </Box>

      {loading && <LinearProgress sx={{ mb: 2 }} />}

      {/* Quick Stats - Real data from adminStats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={3} sx={{ borderLeft: 4, borderColor: 'primary.main' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" fontWeight="bold" color="primary">
                    {(adminStats?.totalUsers || 0).toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Users
                  </Typography>
                </Box>
                <TrendingUp sx={{ fontSize: 40, color: theme.palette.primary.main, opacity: 0.3 }} />
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <Typography variant="body2" color={(adminStats?.userGrowth || 0) >= 0 ? 'success.main' : 'error.main'}>
                  {adminStats?.userGrowth >= 0 ? '+' : ''}{adminStats?.userGrowth || 0}%
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                  vs last month
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={3} sx={{ borderLeft: 4, borderColor: 'warning.main' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" fontWeight="bold" color="warning.main">
                    {(adminStats?.premiumUsers || 0).toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Premium Users
                  </Typography>
                </Box>
                <Analytics sx={{ fontSize: 40, color: theme.palette.warning.main, opacity: 0.3 }} />
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  {adminStats?.freeUsers || 0} free users
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={3} sx={{ borderLeft: 4, borderColor: 'success.main' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" fontWeight="bold" color="success.main">
                    {adminStats?.conversionRate || 0}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Conversion Rate
                  </Typography>
                </Box>
                <Assessment sx={{ fontSize: 40, color: theme.palette.success.main, opacity: 0.3 }} />
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Free to premium
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={3} sx={{ borderLeft: 4, borderColor: 'info.main' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" fontWeight="bold" color="info.main">
                    {(adminStats?.activeUsers || 0).toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Active Users
                  </Typography>
                </Box>
                <Timeline sx={{ fontSize: 40, color: theme.palette.info.main, opacity: 0.3 }} />
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Last 30 days
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Card elevation={3}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange} variant={isMobile ? 'scrollable' : 'standard'} scrollButtons="auto">
            <Tab icon={<BarChartIcon />} label="Overview" iconPosition="start" />
            <Tab icon={<Assessment />} label="Custom Reports" iconPosition="start" />
            <Tab icon={<Timeline />} label="Trends" iconPosition="start" />
            <Tab icon={<Settings />} label="Automation" iconPosition="start" />
          </Tabs>
        </Box>

        {/* Overview Tab */}
        <TabPanel value={activeTab} index={0}>
          <Grid container spacing={3}>
            {/* Revenue Composition */}
            <Grid item xs={12} lg={8}>
              <Card elevation={2}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h6" fontWeight="bold">
                      Top Categories by Amount
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <FormControl size="small" sx={{ minWidth: 120 }}>
                        <InputLabel>Period</InputLabel>
                        <Select
                          value={dateRange}
                          label="Period"
                          onChange={(e) => setDateRange(e.target.value)}
                        >
                          <MenuItem value="last7days">Last 7 Days</MenuItem>
                          <MenuItem value="last30days">Last 30 Days</MenuItem>
                          <MenuItem value="last3months">Last 3 Months</MenuItem>
                          <MenuItem value="lastyear">Last Year</MenuItem>
                        </Select>
                      </FormControl>
                      {chartData.revenueComposition.length > 0 && (
                        <Chip label="Live Data" color="success" size="small" icon={<VerifiedUser />} />
                      )}
                    </Box>
                  </Box>
                  {chartData.revenueComposition.length > 0 ? (
                    <Box sx={{ height: 400 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={chartData.revenueComposition}>
                          <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.5)} />
                          <XAxis dataKey="category" tick={{ fontSize: 12 }} />
                          <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
                          <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
                          <RechartsTooltip />
                          <Legend />
                          <Bar yAxisId="left" dataKey="amount" name="Amount (€)" fill={theme.palette.primary.main} />
                          <Line yAxisId="right" type="monotone" dataKey="count" name="Transactions" stroke={theme.palette.secondary.main} strokeWidth={3} />
                        </ComposedChart>
                      </ResponsiveContainer>
                    </Box>
                  ) : (
                    <Box sx={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: alpha(theme.palette.grey[500], 0.05), borderRadius: 2 }}>
                      <Box sx={{ textAlign: 'center' }}>
                        <BarChartIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                        <Typography color="text.secondary">No category data available yet</Typography>
                        <Typography variant="caption" color="text.secondary">Data will appear once users create transactions</Typography>
                      </Box>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
            
            {/* User Distribution */}
            <Grid item xs={12} lg={4}>
              <Card elevation={2}>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    User Distribution
                  </Typography>
                  {chartData.userDistribution.length > 0 ? (
                    <Box sx={{ height: 350 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={chartData.userDistribution}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={5}
                            dataKey="value"
                            label={({ name, value }) => `${name}: ${value}`}
                          >
                            {chartData.userDistribution.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <RechartsTooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </Box>
                  ) : (
                    <Box sx={{ height: 350, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: alpha(theme.palette.grey[500], 0.05), borderRadius: 2 }}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Assessment sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                        <Typography color="text.secondary">No user data</Typography>
                      </Box>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Custom Reports Tab */}
        <TabPanel value={activeTab} index={1}>
          <Box sx={{ mb: 3 }}>
            <Alert severity="info" icon={<Assessment />}>
              Create custom reports by selecting metrics you want to track. Reports are saved locally in your browser.
            </Alert>
          </Box>
          
          <Grid container spacing={3}>
            {savedReports.length === 0 ? (
              <Grid item xs={12}>
                <Card elevation={2}>
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
                        No Custom Reports Yet
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Click "Create Report" to build your first custom analytics report
                      </Typography>
                      <Button 
                        variant="contained" 
                        startIcon={<Add />}
                        onClick={() => setReportBuilderOpen(true)}
                        sx={{ mt: 2 }}
                      >
                        Create First Report
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ) : (
              savedReports.map((report) => (
                <Grid item xs={12} md={6} lg={4} key={report.id}>
                  <Card elevation={2}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                          {report.name}
                        </Typography>
                        <Chip
                          label="Custom"
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Created: {report.createdAt.toLocaleDateString()}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Metrics: {report.metrics.length}
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 2 }}>
                        {report.metrics.slice(0, 3).map((metricId) => {
                          const metric = availableMetrics.find(m => m.id === metricId);
                          return metric ? (
                            <Chip
                              key={metricId}
                              label={metric.name}
                              size="small"
                              variant="outlined"
                            />
                          ) : null;
                        })}
                        {report.metrics.length > 3 && (
                          <Chip
                            label={`+${report.metrics.length - 3} more`}
                            size="small"
                            variant="outlined"
                          />
                        )}
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                        <Button 
                          size="small" 
                          startIcon={<PlayArrow />}
                          variant="contained"
                          onClick={() => handleRunReport(report)}
                        >
                          Run Report
                        </Button>
                        <IconButton 
                          size="small" 
                          color="error"
                          onClick={() => handleDeleteReport(report.id)}
                        >
                          <Delete />
                        </IconButton>
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
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Platform Trends & Insights
          </Typography>
          
          <Grid container spacing={3}>
            {/* Transaction Trends */}
            <Grid item xs={12}>
              <Card elevation={2}>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Transaction Volume Trends
                  </Typography>
                  {chartData.transactionTrends.length > 0 ? (
                    <Box sx={{ height: 300 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={chartData.transactionTrends}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                          <YAxis tick={{ fontSize: 12 }} />
                          <RechartsTooltip />
                          <Legend />
                          <Area
                            type="monotone"
                            dataKey="income"
                            fill={alpha(theme.palette.success.main, 0.3)}
                            stroke={theme.palette.success.main}
                            name="Income (€)"
                          />
                          <Area
                            type="monotone"
                            dataKey="expenses"
                            fill={alpha(theme.palette.error.main, 0.3)}
                            stroke={theme.palette.error.main}
                            name="Expenses (€)"
                          />
                          <Line
                            type="monotone"
                            dataKey="net"
                            stroke={theme.palette.primary.main}
                            strokeWidth={3}
                            name="Net (€)"
                          />
                        </ComposedChart>
                      </ResponsiveContainer>
                    </Box>
                  ) : (
                    <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: alpha(theme.palette.grey[500], 0.05), borderRadius: 2 }}>
                      <Typography color="text.secondary">No transaction trend data available</Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* User Growth Trends */}
            <Grid item xs={12}>
              <Card elevation={2}>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    User Growth Trend
                  </Typography>
                  {chartData.userGrowthTrends.length > 0 ? (
                    <Box sx={{ height: 300 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData.userGrowthTrends}>
                          <defs>
                            <linearGradient id="userGrowthGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.8}/>
                              <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                          <YAxis tick={{ fontSize: 12 }} />
                          <RechartsTooltip />
                          <Legend />
                          <Area
                            type="monotone"
                            dataKey="users"
                            stroke={theme.palette.primary.main}
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#userGrowthGradient)"
                            name="New Users"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </Box>
                  ) : (
                    <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: alpha(theme.palette.grey[500], 0.05), borderRadius: 2 }}>
                      <Typography color="text.secondary">No user growth data available</Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Growth Metrics */}
            <Grid item xs={12} md={6}>
              <Card elevation={2}>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Growth Momentum
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
                    <TrendingUp sx={{ fontSize: 48, color: 'success.main' }} />
                    <Box>
                      <Typography variant="h4" color="success.main" fontWeight="bold">
                        {adminStats?.userGrowth || 0}%
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        User growth this period
                      </Typography>
                    </Box>
                  </Box>
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">New Users</Typography>
                      <Typography variant="h6">{adminStats?.newUsers || 0}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Active Users</Typography>
                      <Typography variant="h6">{adminStats?.activeUsers || 0}</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card elevation={2}>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Transaction Activity
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
                    <ShowChart sx={{ fontSize: 48, color: 'info.main' }} />
                    <Box>
                      <Typography variant="h4" color="info.main" fontWeight="bold">
                        {(adminStats?.totalTransactions || 0).toLocaleString()}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total transactions tracked
                      </Typography>
                    </Box>
                  </Box>
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Income</Typography>
                      <Typography variant="h6" color="success.main">€{((adminStats?.totalUserIncome || 0) / 1000).toFixed(1)}K</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Expenses</Typography>
                      <Typography variant="h6" color="error.main">€{((adminStats?.totalUserExpenses || 0) / 1000).toFixed(1)}K</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Automation Tab */}
        <TabPanel value={activeTab} index={3}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Analytics Automation & Export
          </Typography>
          
          <Grid container spacing={3}>
            {/* Real-time Metrics */}
            <Grid item xs={12} md={6}>
              <Card elevation={2}>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Real-time Platform Metrics
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Total Users</Typography>
                      <Typography variant="body2" fontWeight="bold">{adminStats?.totalUsers || 0}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Active Users</Typography>
                      <Typography variant="body2" fontWeight="bold">{adminStats?.activeUsers || 0}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Premium Users</Typography>
                      <Typography variant="body2" fontWeight="bold">{adminStats?.premiumUsers || 0}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Total Transactions</Typography>
                      <Typography variant="body2" fontWeight="bold">{adminStats?.totalTransactions || 0}</Typography>
                    </Box>
                  </Box>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<Refresh />}
                    sx={{ mt: 2 }}
                    onClick={() => fetchAnalytics && fetchAnalytics(dateRange, 'overview')}
                  >
                    Refresh Metrics
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            {/* Platform Health */}
            <Grid item xs={12} md={6}>
              <Card elevation={2}>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Platform Health Score
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
                    <Speed sx={{ fontSize: 48, color: adminStats?.systemHealth >= 80 ? 'success.main' : 'warning.main' }} />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h4" fontWeight="bold" color={adminStats?.systemHealth >= 80 ? 'success.main' : 'warning.main'}>
                        {adminStats?.systemHealth || 100}%
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={adminStats?.systemHealth || 100} 
                        sx={{ 
                          height: 8, 
                          borderRadius: 4,
                          mt: 1,
                          bgcolor: alpha(theme.palette.grey[500], 0.2),
                          '& .MuiLinearProgress-bar': {
                            bgcolor: adminStats?.systemHealth >= 80 ? 'success.main' : 'warning.main'
                          }
                        }}
                      />
                    </Box>
                  </Box>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                    System performance and reliability indicator
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Data Quality */}
            <Grid item xs={12}>
              <Card elevation={2}>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Data Quality & Availability
                  </Typography>
                  <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={12} sm={6} md={3}>
                      <Paper sx={{ p: 2, textAlign: 'center', bgcolor: analytics?.userRegistrations?.length > 0 ? alpha(theme.palette.success.main, 0.1) : alpha(theme.palette.grey[500], 0.1) }}>
                        {analytics?.userRegistrations?.length > 0 ? <CheckCircle color="success" /> : <Warning color="disabled" />}
                        <Typography variant="body2" sx={{ mt: 1 }}>User Registrations</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {analytics?.userRegistrations?.length || 0} records
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Paper sx={{ p: 2, textAlign: 'center', bgcolor: analytics?.transactionVolume?.length > 0 ? alpha(theme.palette.success.main, 0.1) : alpha(theme.palette.grey[500], 0.1) }}>
                        {analytics?.transactionVolume?.length > 0 ? <CheckCircle color="success" /> : <Warning color="disabled" />}
                        <Typography variant="body2" sx={{ mt: 1 }}>Transaction Volume</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {analytics?.transactionVolume?.length || 0} records
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Paper sx={{ p: 2, textAlign: 'center', bgcolor: analytics?.categoryDistribution?.length > 0 ? alpha(theme.palette.success.main, 0.1) : alpha(theme.palette.grey[500], 0.1) }}>
                        {analytics?.categoryDistribution?.length > 0 ? <CheckCircle color="success" /> : <Warning color="disabled" />}
                        <Typography variant="body2" sx={{ mt: 1 }}>Category Data</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {analytics?.categoryDistribution?.length || 0} categories
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Paper sx={{ p: 2, textAlign: 'center', bgcolor: adminStats?.totalUsers > 0 ? alpha(theme.palette.success.main, 0.1) : alpha(theme.palette.grey[500], 0.1) }}>
                        {adminStats?.totalUsers > 0 ? <CheckCircle color="success" /> : <Warning color="disabled" />}
                        <Typography variant="body2" sx={{ mt: 1 }}>User Stats</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {adminStats?.totalUsers || 0} users
                        </Typography>
                      </Paper>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Export Options */}
            <Grid item xs={12}>
              <Card elevation={2}>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Export Analytics Data
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Download current analytics data in your preferred format
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                    <Button
                      variant="contained"
                      startIcon={<Download />}
                      onClick={handleExportCSV}
                    >
                      Export CSV
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<Download />}
                      onClick={handleExportJSON}
                    >
                      Export JSON
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<Download />}
                      onClick={() => exportData && exportData('analytics', 'pdf')}
                    >
                      Export PDF
                    </Button>
                  </Box>
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
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Create Custom Report</Typography>
            <IconButton onClick={() => setReportBuilderOpen(false)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Report Name"
            value={reportName}
            onChange={(e) => setReportName(e.target.value)}
            sx={{ mb: 3, mt: 1 }}
            placeholder="e.g., Monthly User Growth Report"
          />
          
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            Select Metrics to Include
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
              <InputLabel>Chart Type</InputLabel>
              <Select
                value={chartType}
                label="Chart Type"
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
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveReport}
            disabled={!reportName || selectedMetrics.length === 0}
          >
            Save Report
          </Button>
        </DialogActions>
      </Dialog>

      {/* Report View Dialog */}
      <Dialog
        open={reportViewOpen}
        onClose={() => setReportViewOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">{selectedReport?.name}</Typography>
            <IconButton onClick={() => setReportViewOpen(false)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedReport && (
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Report generated: {new Date().toLocaleString()}
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Table>
                <TableBody>
                  {selectedReport.metrics.map((metricId) => {
                    const metric = availableMetrics.find(m => m.id === metricId);
                    return metric ? (
                      <TableRow key={metricId}>
                        <TableCell>{metric.name}</TableCell>
                        <TableCell align="right">
                          <Typography variant="h6" fontWeight="bold">
                            {typeof metric.getValue() === 'number' 
                              ? metric.getValue().toLocaleString()
                              : metric.getValue()}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : null;
                  })}
                </TableBody>
              </Table>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReportViewOpen(false)}>Close</Button>
          <Button variant="contained" startIcon={<Download />}>
            Export Report
          </Button>
        </DialogActions>
      </Dialog>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="create report"
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
