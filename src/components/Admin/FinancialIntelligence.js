/* eslint-disable */
import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Tabs,
  Tab,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  Chip,
  LinearProgress,
  CircularProgress,
  Tooltip,
  ButtonGroup,
  useTheme
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  TrendingFlat,
  Download,
  Refresh,
  ShowChart,
  PeopleAlt,
  CreditCard,
  Insights,
  QueryStats,
  AutoGraph,
  CheckCircle,
  Warning
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart as RechartsBarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { useAdminData } from '../../contexts/AdminContext';

const FinancialIntelligence = () => {
  const theme = useTheme();
  
  // Get real data from context
  const { 
    financialIntelligence, 
    loading, 
    fetchFinancialIntelligence
  } = useAdminData();
  
  // State management
  const [activeTab, setActiveTab] = useState(0);
  const [dateRange, setDateRange] = useState('30');

  // Fetch data on mount and when date range changes
  useEffect(() => {
    if (fetchFinancialIntelligence) {
      fetchFinancialIntelligence(dateRange);
    }
  }, [dateRange]);

  const handleDateRangeChange = (newRange) => {
    setDateRange(newRange);
  };

  const handleExport = async () => {
    try {
      const { downloadReport } = await import('../../utils/pdfReportGenerator');
      downloadReport('financial', {
        summary,
        kpiMetrics,
        revenueData,
        subscriptionData,
        cashFlowData,
        dateRange,
      });
    } catch (err) {
      console.error('Financial PDF export failed:', err);
      // CSV fallback
      try {
        const { exportToCSV } = await import('../../utils/exportUtils');
        const exportRows = [
          ...kpiMetrics.map(m => ({ section: 'KPI', ...m })),
          ...revenueData.map(r => ({ section: 'Revenue', ...r })),
          ...subscriptionData.map(s => ({ section: 'Subscriptions', ...s })),
          ...cashFlowData.map(c => ({ section: 'Cash Flow', ...c })),
        ];
        exportToCSV(exportRows.length > 0 ? exportRows : [{ ...summary, dateRange, exportedAt: new Date().toISOString() }], 'financial_intelligence');
      } catch(csvErr) { console.error('CSV fallback failed:', csvErr); }
    }
  };

  const handleRefresh = () => {
    if (fetchFinancialIntelligence) {
      fetchFinancialIntelligence(dateRange);
    }
  };

  // Extract data safely
  const revenueData = financialIntelligence?.revenueData || [];
  const subscriptionData = financialIntelligence?.subscriptionData || [];
  const kpiMetrics = financialIntelligence?.kpiMetrics || [];
  const cohortData = financialIntelligence?.cohortData || [];
  const cashFlowData = financialIntelligence?.cashFlowData || [];
  const topCategories = financialIntelligence?.topCategories || [];
  const userFunnel = financialIntelligence?.userFunnel || [];
  const summary = financialIntelligence?.summary || {};

  // Loading state
  if (loading?.financialIntelligence) {
    return (
      <Box sx={{ p: 3 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom>Financial Intelligence</Typography>
          <Typography variant="body2" color="text.secondary">
            Investor-grade platform analytics
          </Typography>
        </Box>
        <Grid container spacing={2}>
          {[...Array(8)].map((_, i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Card sx={{ background: '#1e293b', height: 140 }}>
                <CardContent>
                  <LinearProgress sx={{ mb: 2 }} />
                  <Box sx={{ height: 60 }} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  // Chart colors
  const colors = {
    income: '#4ade80',
    expenses: '#f87171',
    net: '#60a5fa',
    neutral: '#8b5cf6',
    purple: '#7c3aed',
    blue: '#3b82f6'
  };

  // Plan colors
  const planColors = {
    'Free': '#6b7280',
    'Standard': '#3b82f6',
    'Premium': '#8b5cf6',
    'Family': '#10b981',
    'Business': '#f59e0b'
  };

  // Render KPI Card
  const renderKPICard = (metric, index) => {
    const getTrendIcon = () => {
      if (metric.trend === 'up') return <TrendingUp sx={{ fontSize: 16, color: colors.income }} />;
      if (metric.trend === 'down') return <TrendingDown sx={{ fontSize: 16, color: colors.expenses }} />;
      return <TrendingFlat sx={{ fontSize: 16, color: '#9ca3af' }} />;
    };

    const getChangeColor = () => {
      if (metric.trend === 'up') return colors.income;
      if (metric.trend === 'down') return colors.expenses;
      return '#9ca3af';
    };

    return (
      <Grid item xs={12} sm={6} md={3} key={index}>
        <Card 
          sx={{ 
            background: '#1e293b',
            borderLeft: `4px solid ${metric.color || colors.purple}`,
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 12px 24px rgba(0,0,0,0.3)'
            }
          }}
        >
          <CardContent>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>
              {metric.title}
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700, my: 1 }}>
              {metric.value}
            </Typography>
            {metric.subtitle && (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                {metric.subtitle}
              </Typography>
            )}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
              {metric.progress !== undefined && (
                <LinearProgress 
                  variant="determinate" 
                  value={metric.progress} 
                  sx={{ 
                    flexGrow: 1, 
                    height: 6, 
                    borderRadius: 1,
                    bgcolor: '#0f172a',
                    '& .MuiLinearProgress-bar': {
                      bgcolor: metric.color || colors.purple
                    }
                  }} 
                />
              )}
              {metric.change && (
                <Chip 
                  icon={getTrendIcon()} 
                  label={metric.change} 
                  size="small" 
                  sx={{ 
                    bgcolor: '#0f172a',
                    color: getChangeColor(),
                    fontSize: '0.7rem',
                    height: 22
                  }} 
                />
              )}
            </Box>
            {metric.target && (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                Target: {metric.target}
              </Typography>
            )}
          </CardContent>
        </Card>
      </Grid>
    );
  };

  // Revenue Tab
  const renderRevenueTab = () => (
    <Box>
      {/* Revenue Overview Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ background: 'linear-gradient(135deg, #7c3aed 0%, #3b82f6 100%)', color: 'white' }}>
            <CardContent>
              <Typography variant="caption" sx={{ opacity: 0.9 }}>Monthly Recurring Revenue</Typography>
              <Typography variant="h3" sx={{ fontWeight: 700, my: 1 }}>
                €{(summary.mrr || 0).toFixed(2)}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                {summary.paidUsers || 0} paying users
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ background: 'linear-gradient(135deg, #3b82f6 0%, #10b981 100%)', color: 'white' }}>
            <CardContent>
              <Typography variant="caption" sx={{ opacity: 0.9 }}>Annual Recurring Revenue</Typography>
              <Typography variant="h3" sx={{ fontWeight: 700, my: 1 }}>
                €{(summary.arr || 0).toFixed(0)}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                Projected annual
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white' }}>
            <CardContent>
              <Typography variant="caption" sx={{ opacity: 0.9 }}>Gross Margin</Typography>
              <Typography variant="h3" sx={{ fontWeight: 700, my: 1 }}>
                {(summary.grossMargin || 0).toFixed(1)}%
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                Platform costs: €{(summary.platformCosts || 0).toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Revenue Trend Chart */}
      <Card sx={{ background: '#1e293b', mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Revenue Trend (User-Tracked Finances)</Typography>
          {revenueData.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={colors.purple} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={colors.purple} stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={colors.expenses} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={colors.expenses} stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <RechartsTooltip 
                  contentStyle={{ background: '#0f172a', border: '1px solid #374151', borderRadius: 8 }}
                  formatter={(value) => `€${value.toFixed(2)}`}
                />
                <Legend />
                <Area type="monotone" dataKey="userIncome" stroke={colors.purple} fillOpacity={1} fill="url(#colorIncome)" name="User Income" />
                <Area type="monotone" dataKey="userExpenses" stroke={colors.expenses} fillOpacity={1} fill="url(#colorExpenses)" name="User Expenses" />
                <Line type="monotone" dataKey="userNetBalance" stroke={colors.net} strokeDasharray="5 5" name="Net Balance" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <ShowChart sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
              <Typography color="text.secondary">No revenue data yet</Typography>
              <Typography variant="caption" color="text.secondary">
                Data will appear as users track finances
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Cash Flow Chart */}
      <Card sx={{ background: '#1e293b' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Cash Flow Analysis (Last 6 Months)</Typography>
          {cashFlowData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <RechartsBarChart data={cashFlowData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <RechartsTooltip 
                  contentStyle={{ background: '#0f172a', border: '1px solid #374151', borderRadius: 8 }}
                  formatter={(value) => `€${value.toFixed(2)}`}
                />
                <Legend />
                <Bar dataKey="inflow" fill={colors.income} name="Inflow" />
                <Bar dataKey="outflow" fill={colors.expenses} name="Outflow" />
                <Line type="monotone" dataKey="net" stroke="#ffffff" strokeDasharray="5 5" name="Net" />
              </RechartsBarChart>
            </ResponsiveContainer>
          ) : (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <AutoGraph sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
              <Typography color="text.secondary">No cash flow data yet</Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );

  // Users & Growth Tab
  const renderUsersTab = () => {
    // Calculate conversion rates for funnel
    const funnelWithRates = userFunnel.map((stage, index) => {
      if (index === 0) return { ...stage, rate: 100 };
      const prevCount = userFunnel[index - 1].count;
      const rate = prevCount > 0 ? ((stage.count / prevCount) * 100).toFixed(1) : 0;
      return { ...stage, rate };
    });

    return (
      <Box>
        {/* User Funnel */}
        <Card sx={{ background: '#1e293b', mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>User Acquisition Funnel</Typography>
            {funnelWithRates.length > 0 ? (
              <Box sx={{ py: 2 }}>
                {funnelWithRates.map((stage, index) => (
                  <Box key={index} sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">{stage.stage}</Typography>
                      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          {stage.count.toLocaleString()}
                        </Typography>
                        <Chip 
                          label={`${stage.rate}%`} 
                          size="small" 
                          sx={{ bgcolor: stage.color || colors.purple, color: 'white' }}
                        />
                      </Box>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={parseFloat(stage.rate)} 
                      sx={{ 
                        height: 24, 
                        borderRadius: 2,
                        bgcolor: '#0f172a',
                        '& .MuiLinearProgress-bar': {
                          bgcolor: stage.color || colors.purple,
                          borderRadius: 2
                        }
                      }} 
                    />
                    {index < funnelWithRates.length - 1 && (
                      <Typography variant="caption" color="text.secondary" sx={{ ml: 1, mt: 0.5, display: 'block' }}>
                        Drop-off: {((1 - funnelWithRates[index + 1].count / stage.count) * 100).toFixed(1)}%
                      </Typography>
                    )}
                  </Box>
                ))}
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <PeopleAlt sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                <Typography color="text.secondary">No funnel data yet</Typography>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Monthly New Users Chart */}
        <Card sx={{ background: '#1e293b', mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>Monthly New User Registrations</Typography>
            {revenueData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="colorNewUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={colors.purple} stopOpacity={0.8}/>
                      <stop offset="95%" stopColor={colors.purple} stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <RechartsTooltip 
                    contentStyle={{ background: '#0f172a', border: '1px solid #374151', borderRadius: 8 }}
                  />
                  <Area type="monotone" dataKey="newUsers" stroke={colors.purple} fillOpacity={1} fill="url(#colorNewUsers)" name="New Users" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <PeopleAlt sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                <Typography color="text.secondary">No user growth data yet</Typography>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* User Stats Cards */}
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: '#1e293b' }}>
              <CardContent>
                <Typography variant="caption" color="text.secondary">Total Users</Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, my: 1 }}>
                  {(summary.totalUsers || 0).toLocaleString()}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  100% of platform
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: '#1e293b' }}>
              <CardContent>
                <Typography variant="caption" color="text.secondary">Verified Users</Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, my: 1 }}>
                  {(summary.verifiedUsers || 0).toLocaleString()}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {summary.totalUsers > 0 ? ((summary.verifiedUsers / summary.totalUsers) * 100).toFixed(1) : 0}% verified
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: '#1e293b' }}>
              <CardContent>
                <Typography variant="caption" color="text.secondary">Active (30d)</Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, my: 1 }}>
                  {(summary.activeUsers || 0).toLocaleString()}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {summary.totalUsers > 0 ? ((summary.activeUsers / summary.totalUsers) * 100).toFixed(1) : 0}% active
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: '#1e293b' }}>
              <CardContent>
                <Typography variant="caption" color="text.secondary">Paid Users</Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, my: 1 }}>
                  {(summary.paidUsers || 0).toLocaleString()}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {summary.totalUsers > 0 ? ((summary.paidUsers / summary.totalUsers) * 100).toFixed(1) : 0}% paying
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    );
  };

  // Subscriptions Tab
  const renderSubscriptionsTab = () => {
    const totalSubscriptionRevenue = subscriptionData.reduce((sum, plan) => sum + (plan.revenue || 0), 0);

    return (
      <Box>
        {/* Plan Distribution */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <Card sx={{ background: '#1e293b', height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Plan Distribution</Typography>
                {subscriptionData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <Pie
                        data={subscriptionData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        fill="#8884d8"
                        paddingAngle={2}
                        dataKey="count"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {subscriptionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={planColors[entry.name] || colors.neutral} />
                        ))}
                      </Pie>
                      <RechartsTooltip 
                        contentStyle={{ background: '#0f172a', border: '1px solid #374151', borderRadius: 8 }}
                      />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 6 }}>
                    <CreditCard sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                    <Typography color="text.secondary">No subscription data yet</Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card sx={{ background: '#1e293b', height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Subscription Breakdown</Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Plan</TableCell>
                        <TableCell align="right">Users</TableCell>
                        <TableCell align="right">% Total</TableCell>
                        <TableCell align="right">MRR</TableCell>
                        <TableCell align="right">Price/User</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {subscriptionData.map((plan, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Chip 
                              label={plan.name} 
                              size="small" 
                              sx={{ bgcolor: planColors[plan.name] || colors.neutral, color: 'white' }}
                            />
                          </TableCell>
                          <TableCell align="right">{plan.count}</TableCell>
                          <TableCell align="right">{plan.value?.toFixed(1)}%</TableCell>
                          <TableCell align="right">€{plan.revenue?.toFixed(2)}</TableCell>
                          <TableCell align="right">€{plan.pricePerUser?.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                      {subscriptionData.length > 0 && (
                        <TableRow sx={{ bgcolor: '#0f172a' }}>
                          <TableCell sx={{ fontWeight: 700 }}>Total MRR</TableCell>
                          <TableCell></TableCell>
                          <TableCell></TableCell>
                          <TableCell align="right" sx={{ fontWeight: 700 }}>
                            €{totalSubscriptionRevenue.toFixed(2)}
                          </TableCell>
                          <TableCell></TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
                {subscriptionData.length === 0 && (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography color="text.secondary">No plans active yet</Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Conversion & Churn */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <Card sx={{ background: '#1e293b' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Conversion Rate</Typography>
                <Typography variant="h2" sx={{ fontWeight: 700, color: colors.income, my: 2 }}>
                  {(summary.conversionRate || 0).toFixed(2)}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Free to paid conversion
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={summary.conversionRate || 0} 
                    sx={{ 
                      height: 8, 
                      borderRadius: 1,
                      bgcolor: '#0f172a',
                      '& .MuiLinearProgress-bar': {
                        bgcolor: colors.income
                      }
                    }} 
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card sx={{ background: '#1e293b' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Churn Rate</Typography>
                <Typography variant="h2" sx={{ fontWeight: 700, color: colors.expenses, my: 2 }}>
                  {(summary.churnRate || 0).toFixed(2)}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Monthly churn • Inactive rate: {(summary.inactiveRate || 0).toFixed(1)}%
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={summary.churnRate || 0} 
                    sx={{ 
                      height: 8, 
                      borderRadius: 1,
                      bgcolor: '#0f172a',
                      '& .MuiLinearProgress-bar': {
                        bgcolor: colors.expenses
                      }
                    }} 
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Plan Pricing Grid */}
        <Card sx={{ background: '#1e293b' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>Plan Pricing Overview</Typography>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              {[
                { name: 'Free', price: '€0', features: ['Basic tracking', '50 transactions/month', 'Email support'] },
                { name: 'Standard', price: '€4.99', features: ['Unlimited transactions', 'Budget tracking', 'Receipt scanning'] },
                { name: 'Premium', price: '€9.99', features: ['AI insights', 'Advanced analytics', 'Priority support'] },
                { name: 'Family', price: '€14.99', features: ['Up to 5 users', 'Shared budgets', 'Family reports'] },
                { name: 'Business', price: '€29.99', features: ['Team management', 'API access', 'Custom integrations'] }
              ].map((plan, index) => (
                <Grid item xs={12} sm={6} md={2.4} key={index}>
                  <Card sx={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', height: '100%' }}>
                    <CardContent>
                      <Chip 
                        label={plan.name} 
                        size="small" 
                        sx={{ bgcolor: planColors[plan.name] || colors.neutral, color: 'white', mb: 1 }}
                      />
                      <Typography variant="h4" sx={{ fontWeight: 700, my: 2 }}>
                        {plan.price}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                        per month
                      </Typography>
                      {plan.features.map((feature, fi) => (
                        <Typography key={fi} variant="caption" sx={{ display: 'block', mb: 0.5 }}>
                          • {feature}
                        </Typography>
                      ))}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      </Box>
    );
  };

  // Platform Insights Tab
  const renderPlatformTab = () => (
    <Box>
      {/* Top Categories */}
      <Card sx={{ background: '#1e293b', mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Top Spending Categories Across Platform</Typography>
          {topCategories.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <RechartsBarChart data={topCategories} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis type="number" stroke="#9ca3af" />
                <YAxis dataKey="category" type="category" stroke="#9ca3af" width={120} />
                <RechartsTooltip 
                  contentStyle={{ background: '#0f172a', border: '1px solid #374151', borderRadius: 8 }}
                  formatter={(value, name) => {
                    if (name === 'total') return [`€${value.toFixed(2)}`, 'Total'];
                    return [value, 'Transactions'];
                  }}
                />
                <Bar dataKey="total" fill={colors.purple} name="Total Spent" />
              </RechartsBarChart>
            </ResponsiveContainer>
          ) : (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <Insights sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
              <Typography color="text.secondary">No category data yet</Typography>
              <Typography variant="caption" color="text.secondary">
                Data will appear as users categorize expenses
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Cohort Analysis */}
      <Card sx={{ background: '#1e293b', mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Cohort Retention Analysis</Typography>
          {cohortData.length > 0 ? (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Cohort</TableCell>
                    <TableCell align="right">New Paid Users</TableCell>
                    <TableCell align="right">Still Active</TableCell>
                    <TableCell align="right">Churned</TableCell>
                    <TableCell align="right">Retention %</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {cohortData.map((cohort, index) => {
                    const retentionColor = cohort.retention >= 70 ? colors.income :
                                          cohort.retention >= 40 ? '#f59e0b' :
                                          colors.expenses;
                    return (
                      <TableRow key={index}>
                        <TableCell>{cohort.period}</TableCell>
                        <TableCell align="right">{cohort.total}</TableCell>
                        <TableCell align="right">{cohort.retained}</TableCell>
                        <TableCell align="right">{cohort.churned}</TableCell>
                        <TableCell align="right">
                          <Chip 
                            label={`${cohort.retention.toFixed(1)}%`}
                            size="small"
                            sx={{ bgcolor: retentionColor, color: 'white' }}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <QueryStats sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
              <Typography color="text.secondary">Not enough cohort data yet</Typography>
              <Typography variant="caption" color="text.secondary">
                Requires 2+ months of paid users
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Platform Health Cards */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card sx={{ background: '#1e293b' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Platform Activity</Typography>
              <Typography variant="h3" sx={{ fontWeight: 700, my: 2 }}>
                {(summary.totalTransactions || 0).toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total transactions tracked
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                Avg {summary.totalUsers > 0 ? (summary.totalTransactions / summary.totalUsers).toFixed(1) : 0} per user
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ background: '#1e293b' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>User Financial Health</Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', my: 2 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">Income</Typography>
                  <Typography variant="h5" sx={{ color: colors.income }}>
                    €{((summary.totalUserIncome || 0) / 1000).toFixed(1)}K
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Expenses</Typography>
                  <Typography variant="h5" sx={{ color: colors.expenses }}>
                    €{((summary.totalUserExpenses || 0) / 1000).toFixed(1)}K
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Net</Typography>
                  <Typography variant="h5" sx={{ color: colors.net }}>
                    €{((summary.userNetBalance || 0) / 1000).toFixed(1)}K
                  </Typography>
                </Box>
              </Box>
              <Typography variant="caption" color="text.secondary">
                Total tracked across all users
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );

  // Forecasting Tab
  const renderForecastingTab = () => {
    // Calculate 6-month projection
    const growthRate = (summary.userGrowthRate || 0) / 100;
    const currentMRR = summary.mrr || 0;
    const currentUsers = summary.totalUsers || 0;
    const newUsersPerMonth = summary.newUsersThisPeriod || 0;

    const projectionMonths = 6;
    const mrrProjection = Array.from({ length: projectionMonths }, (_, i) => {
      const month = new Date();
      month.setMonth(month.getMonth() + i + 1);
      const monthName = month.toLocaleString('default', { month: 'short', year: 'numeric' });
      const projectedMRR = currentMRR * Math.pow(1 + growthRate, i + 1);
      return {
        month: monthName,
        projectedMRR: projectedMRR
      };
    });

    const userProjection = Array.from({ length: projectionMonths }, (_, i) => {
      const month = new Date();
      month.setMonth(month.getMonth() + i + 1);
      const monthName = month.toLocaleString('default', { month: 'short', year: 'numeric' });
      const projectedUsers = currentUsers + (newUsersPerMonth * (i + 1));
      return {
        month: monthName,
        projectedUsers: Math.round(projectedUsers)
      };
    });

    // Calculate milestones
    const calculateMonthsToMilestone = (target) => {
      if (currentMRR >= target) return 'Already achieved';
      if (growthRate <= 0) return 'N/A (no growth)';
      const months = Math.log(target / currentMRR) / Math.log(1 + growthRate);
      return `${Math.ceil(months)} months`;
    };

    return (
      <Box>
        {/* Disclaimer */}
        <Alert severity="info" sx={{ mb: 3 }}>
          Projections are based on current growth rate ({(summary.userGrowthRate || 0).toFixed(1)}%) and subscription trends.
        </Alert>

        {/* MRR Projection */}
        <Card sx={{ background: '#1e293b', mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>6-Month MRR Projection</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={mrrProjection}>
                <defs>
                  <linearGradient id="colorProjectedMRR" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={colors.blue} stopOpacity={0.6}/>
                    <stop offset="95%" stopColor={colors.blue} stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <RechartsTooltip 
                  contentStyle={{ background: '#0f172a', border: '1px solid #374151', borderRadius: 8 }}
                  formatter={(value) => `€${value.toFixed(2)}`}
                />
                <Area 
                  type="monotone" 
                  dataKey="projectedMRR" 
                  stroke={colors.blue} 
                  strokeDasharray="5 5"
                  fillOpacity={1} 
                  fill="url(#colorProjectedMRR)" 
                  name="Projected MRR" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* User Growth Projection */}
        <Card sx={{ background: '#1e293b', mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>6-Month User Growth Projection</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={userProjection}>
                <defs>
                  <linearGradient id="colorProjectedUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={colors.purple} stopOpacity={0.6}/>
                    <stop offset="95%" stopColor={colors.purple} stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <RechartsTooltip 
                  contentStyle={{ background: '#0f172a', border: '1px solid #374151', borderRadius: 8 }}
                />
                <Area 
                  type="monotone" 
                  dataKey="projectedUsers" 
                  stroke={colors.purple} 
                  strokeDasharray="5 5"
                  fillOpacity={1} 
                  fill="url(#colorProjectedUsers)" 
                  name="Projected Users" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Key Milestones */}
        <Card sx={{ background: '#1e293b' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>Key MRR Milestones</Typography>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={4}>
                <Card sx={{ background: '#0f172a' }}>
                  <CardContent>
                    <Typography variant="h4" sx={{ color: colors.income, fontWeight: 700 }}>
                      €1,000
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {calculateMonthsToMilestone(1000)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card sx={{ background: '#0f172a' }}>
                  <CardContent>
                    <Typography variant="h4" sx={{ color: colors.blue, fontWeight: 700 }}>
                      €5,000
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {calculateMonthsToMilestone(5000)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card sx={{ background: '#0f172a' }}>
                  <CardContent>
                    <Typography variant="h4" sx={{ color: colors.purple, fontWeight: 700 }}>
                      €10,000
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {calculateMonthsToMilestone(10000)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
              * Based on current MRR of €{currentMRR.toFixed(2)} and growth rate of {(summary.userGrowthRate || 0).toFixed(1)}%
            </Typography>
          </CardContent>
        </Card>
      </Box>
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
            Financial Intelligence
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Investor-grade platform analytics
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <ButtonGroup variant="outlined" size="small">
            <Button 
              variant={dateRange === '30' ? 'contained' : 'outlined'}
              onClick={() => handleDateRangeChange('30')}
            >
              30D
            </Button>
            <Button 
              variant={dateRange === '90' ? 'contained' : 'outlined'}
              onClick={() => handleDateRangeChange('90')}
            >
              90D
            </Button>
            <Button 
              variant={dateRange === '180' ? 'contained' : 'outlined'}
              onClick={() => handleDateRangeChange('180')}
            >
              180D
            </Button>
            <Button 
              variant={dateRange === '365' ? 'contained' : 'outlined'}
              onClick={() => handleDateRangeChange('365')}
            >
              1Y
            </Button>
          </ButtonGroup>
          <Tooltip title="Export Report">
            <Button 
              variant="outlined" 
              startIcon={<Download />}
              onClick={handleExport}
              size="small"
            >
              Export
            </Button>
          </Tooltip>
          <Tooltip title="Refresh Data">
            <Button 
              variant="outlined" 
              startIcon={<Refresh />}
              onClick={handleRefresh}
              size="small"
            >
              Refresh
            </Button>
          </Tooltip>
        </Box>
      </Box>

      {/* North Star KPI Banner */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {kpiMetrics.length > 0 ? (
          kpiMetrics.map((metric, index) => renderKPICard(metric, index))
        ) : (
          <Grid item xs={12}>
            <Alert severity="info">
              <Typography variant="body2">
                No KPI metrics available yet. Data will appear as users interact with the platform.
              </Typography>
            </Alert>
          </Grid>
        )}
      </Grid>

      {/* Tabs */}
      <Paper sx={{ background: '#1e293b' }}>
        <Tabs 
          value={activeTab} 
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab icon={<ShowChart />} label="Revenue" iconPosition="start" />
          <Tab icon={<PeopleAlt />} label="Users & Growth" iconPosition="start" />
          <Tab icon={<CreditCard />} label="Subscriptions" iconPosition="start" />
          <Tab icon={<Insights />} label="Platform Insights" iconPosition="start" />
          <Tab icon={<AutoGraph />} label="Forecasting" iconPosition="start" />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {activeTab === 0 && renderRevenueTab()}
          {activeTab === 1 && renderUsersTab()}
          {activeTab === 2 && renderSubscriptionsTab()}
          {activeTab === 3 && renderPlatformTab()}
          {activeTab === 4 && renderForecastingTab()}
        </Box>
      </Paper>
    </Box>
  );
};

export default FinancialIntelligence;
