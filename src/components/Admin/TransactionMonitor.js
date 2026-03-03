/* eslint-disable */
import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  Button,
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  Alert,
  Tooltip,
  Paper,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  MoreVert as MoreIcon,
  Visibility as ViewIcon,
  Flag as FlagIcon,
  CheckCircle as ApproveIcon,
  Block as RejectIcon,
  TrendingUp,
  TrendingDown,
  AccountBalanceWallet,
  Warning,
  Security,
  FileDownload,
  Refresh
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useAdminData } from '../../contexts/AdminContext';
import { formatCurrency } from '../../utils/helpers';

const TransactionMonitor = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const {
    transactions,
    transactionsPagination,
    filters,
    loading,
    error,
    fetchTransactions,
    updateTransaction,
    updateFilters,
    exportData
  } = useAdminData();

  // Ensure transactions are loaded on component mount
  React.useLayoutEffect(() => {
    if (fetchTransactions && Array.isArray(transactions) && transactions.length === 0 && (!transactionsPagination || !transactionsPagination.total || transactionsPagination.total === 0)) {
      fetchTransactions(1, {});
    }
  }, [fetchTransactions, transactions, transactionsPagination]);

  // Local state
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [searchTerm, setSearchTerm] = useState(filters.transactions.search || '');
  const [statusFilter, setStatusFilter] = useState(filters.transactions.status || 'all');
  const [typeFilter, setTypeFilter] = useState(filters.transactions.type || 'all');
  const [dateRange, setDateRange] = useState(filters.transactions.dateRange || 'all');

  // Transaction statistics
  const transactionStats = useMemo(() => [
    {
      title: t('admin.transactions.stats.totalTransactions'),
      value: transactionsPagination?.total || 0,
      change: 15.3,
      color: theme.palette.primary.main,
      icon: <AccountBalanceWallet />
    },
    {
      title: t('admin.transactions.stats.totalVolume'),
      value: formatCurrency((transactions || []).reduce((sum, t) => sum + Math.abs(t.amount || 0), 0)),
      change: 8.7,
      color: theme.palette.success.main,
      icon: <TrendingUp />
    },
    {
      title: t('admin.transactions.stats.flaggedTransactions'),
      value: (transactions || []).filter(t => t.flagged).length,
      change: -5.2,
      color: theme.palette.warning.main,
      icon: <Warning />
    },
    {
      title: t('admin.transactions.stats.suspiciousActivity'),
      value: (transactions || []).filter(t => t.suspicious).length,
      change: -12.1,
      color: theme.palette.error.main,
      icon: <Security />
    }
  ], [transactions, transactionsPagination?.total, theme.palette, t]);

  // Load transactions on component mount and when filters change
  useEffect(() => {
    if (fetchTransactions) {
      fetchTransactions(1, {
        search: searchTerm,
        status: statusFilter,
        type: typeFilter,
        dateRange: dateRange
      });
    }
  }, [fetchTransactions, searchTerm, statusFilter, typeFilter, dateRange]);

  // Handle search
  const handleSearch = (value) => {
    setSearchTerm(value);
    updateFilters('transactions', { search: value });
  };

  // Handle filters
  const handleStatusFilter = (status) => {
    setStatusFilter(status);
    updateFilters('transactions', { status });
  };

  const handleTypeFilter = (type) => {
    setTypeFilter(type);
    updateFilters('transactions', { type });
  };

  const handleDateRangeFilter = (range) => {
    setDateRange(range);
    updateFilters('transactions', { dateRange: range });
  };

  // Handle page change
  const handlePageChange = (event, newPage) => {
    fetchTransactions(newPage + 1, filters.transactions);
  };

  // Handle transaction actions
  const handleViewTransaction = (transaction) => {
    setSelectedTransaction(transaction);
    setDetailsDialogOpen(true);
    setMenuAnchor(null);
  };

  const handleFlagTransaction = async (transaction) => {
    try {
      await updateTransaction(transaction._id, { flagged: !transaction.flagged });
      setMenuAnchor(null);
    } catch (error) {
      console.error('Failed to flag transaction:', error);
    }
  };

  const handleApproveTransaction = async (transaction) => {
    try {
      await updateTransaction(transaction._id, { status: 'approved' });
      setMenuAnchor(null);
    } catch (error) {
      console.error('Failed to approve transaction:', error);
    }
  };

  const handleRejectTransaction = async (transaction) => {
    try {
      await updateTransaction(transaction._id, { status: 'rejected' });
      setMenuAnchor(null);
    } catch (error) {
      console.error('Failed to reject transaction:', error);
    }
  };

  // Handle bulk export
  const handleBulkExport = () => {
    exportData('transactions', 'csv');
  };

  // Get status color (transactions don't have status field, so we'll use a default)
  const getStatusColor = (status) => {
    // Since transactions don't have status field in our model, return success by default
    return 'success';
  };

  // Get transaction type color
  const getTypeColor = (type) => {
    switch (type) {
      case 'income': return 'success';
      case 'expense': return 'error';
      case 'transfer': return 'info';
      default: return 'default';
    }
  };

  // Get transaction type display text
  const getTypeDisplayText = (type) => {
    switch (type) {
      case 'income': return 'Income';
      case 'expense': return 'Expense';
      case 'transfer': return 'Transfer';
      default: return 'Unknown';
    }
  };

  // Get transaction status display text (since we don't have status field, we'll use 'Completed')
  const getStatusDisplayText = (transaction) => {
    // All saved transactions are considered completed
    return 'Completed';
  };

  return (
    <Box>
      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {transactionStats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card elevation={2}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h4" fontWeight="bold" color={stat.color}>
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {stat.title}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
                    <Box sx={{ color: stat.color, mb: 1 }}>
                      {stat.icon}
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {stat.change > 0 ? (
                        <TrendingUp sx={{ color: 'success.main', mr: 0.5, fontSize: 16 }} />
                      ) : (
                        <TrendingDown sx={{ color: 'error.main', mr: 0.5, fontSize: 16 }} />
                      )}
                      <Typography
                        variant="caption"
                        color={stat.change > 0 ? 'success.main' : 'error.main'}
                        fontWeight="bold"
                      >
                        {Math.abs(stat.change)}%
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Filters and Actions */}
      <Card elevation={2} sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: isMobile ? 'column' : 'row',
            gap: 2,
            alignItems: isMobile ? 'stretch' : 'center',
            justifyContent: 'space-between'
          }}>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: isMobile ? 'column' : 'row',
              gap: 2,
              flexGrow: 1
            }}>
              <TextField
                placeholder={t('admin.transactions.search.placeholder')}
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{ minWidth: 300 }}
              />
              
              <FormControl sx={{ minWidth: 150 }}>
                <InputLabel>{t('admin.transactions.filters.status')}</InputLabel>
                <Select
                  value={statusFilter}
                  label={t('admin.transactions.filters.status')}
                  onChange={(e) => handleStatusFilter(e.target.value)}
                >
                  <MenuItem value="all">All Statuses</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                </Select>
              </FormControl>

              <FormControl sx={{ minWidth: 150 }}>
                <InputLabel>{t('admin.transactions.filters.type')}</InputLabel>
                <Select
                  value={typeFilter}
                  label={t('admin.transactions.filters.type')}
                  onChange={(e) => handleTypeFilter(e.target.value)}
                >
                  <MenuItem value="all">All Types</MenuItem>
                  <MenuItem value="income">Income</MenuItem>
                  <MenuItem value="expense">Expense</MenuItem>
                </Select>
              </FormControl>

              <FormControl sx={{ minWidth: 150 }}>
                <InputLabel>{t('admin.transactions.filters.dateRange')}</InputLabel>
                <Select
                  value={dateRange}
                  label={t('admin.transactions.filters.dateRange')}
                  onChange={(e) => handleDateRangeFilter(e.target.value)}
                >
                  <MenuItem value="all">All Time</MenuItem>
                  <MenuItem value="today">Today</MenuItem>
                  <MenuItem value="week">This Week</MenuItem>
                  <MenuItem value="month">This Month</MenuItem>
                  <MenuItem value="year">This Year</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={<FileDownload />}
                onClick={handleBulkExport}
              >
                {t('admin.transactions.actions.export')}
              </Button>
              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={() => fetchTransactions(1, filters.transactions)}
              >
                {t('admin.transactions.actions.refresh')}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card elevation={2}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t('admin.transactions.table.transaction')}</TableCell>
                <TableCell>{t('admin.transactions.table.amount')}</TableCell>
                <TableCell>{t('admin.transactions.table.type')}</TableCell>
                <TableCell>{t('admin.transactions.table.status')}</TableCell>
                <TableCell>{t('admin.transactions.table.user')}</TableCell>
                <TableCell>{t('admin.transactions.table.date')}</TableCell>
                <TableCell align="right">{t('admin.transactions.table.actions')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(transactions || []).length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      {loading ? 'Loading transactions...' : 'No transactions found'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                (transactions || []).map((transaction) => (
                  <TableRow 
                    key={transaction._id} 
                    hover
                    sx={{
                      backgroundColor: transaction.flagged ? theme.palette.warning.light + '20' : 'inherit'
                    }}
                  >
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {transaction.description || t('admin.transactions.table.noDescription')}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ID: {transaction._id.slice(-8)}
                        </Typography>
                        {transaction.flagged && (
                          <Chip 
                            size="small" 
                            label={t('admin.transactions.labels.flagged')} 
                            color="warning" 
                            sx={{ ml: 1 }}
                          />
                        )}
                      </Box>
                    </Box>
                  </TableCell>
                  
                  <TableCell>
                    <Typography 
                      variant="body2" 
                      fontWeight="bold"
                      color={transaction.type === 'income' ? 'success.main' : 'error.main'}
                    >
                      {transaction.type === 'income' ? '+' : '-'}{formatCurrency(Math.abs(transaction.amount || 0))}
                    </Typography>
                  </TableCell>
                  
                  <TableCell>
                    <Chip
                      label={getTypeDisplayText(transaction.type)}
                      color={getTypeColor(transaction.type)}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  
                  <TableCell>
                    <Chip
                      label={getStatusDisplayText(transaction)}
                      color={getStatusColor()}
                      size="small"
                    />
                  </TableCell>
                  
                  <TableCell>
                    <Typography variant="body2">
                      {transaction.user?.name || transaction.user?.email || t('admin.transactions.table.unknownUser')}
                    </Typography>
                  </TableCell>
                  
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(transaction.createdAt).toLocaleDateString()}
                    </Typography>
                  </TableCell>
                  
                  <TableCell align="right">
                    <IconButton
                      onClick={(e) => {
                        setMenuAnchor(e.currentTarget);
                        setSelectedTransaction(transaction);
                      }}
                    >
                      <MoreIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              )))}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          component="div"
          count={transactionsPagination?.total || 0}
          page={(transactionsPagination?.page || 1) - 1}
          onPageChange={handlePageChange}
          rowsPerPage={transactionsPagination?.limit || 20}
          rowsPerPageOptions={[20, 50, 100]}
          labelRowsPerPage={t('admin.transactions.pagination.rowsPerPage')}
        />
      </Card>

      {/* Action Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
      >
        <MenuItem onClick={() => handleViewTransaction(selectedTransaction)}>
          <ViewIcon sx={{ mr: 1 }} />
          {t('admin.transactions.actions.viewDetails')}
        </MenuItem>
        <MenuItem onClick={() => handleFlagTransaction(selectedTransaction)}>
          <FlagIcon sx={{ mr: 1 }} />
          {selectedTransaction?.flagged ? 
            t('admin.transactions.actions.unflag') : 
            t('admin.transactions.actions.flag')
          }
        </MenuItem>
        {selectedTransaction?.status === 'pending' && (
          <>
            <MenuItem onClick={() => handleApproveTransaction(selectedTransaction)}>
              <ApproveIcon sx={{ mr: 1 }} />
              {t('admin.transactions.actions.approve')}
            </MenuItem>
            <MenuItem onClick={() => handleRejectTransaction(selectedTransaction)}>
              <RejectIcon sx={{ mr: 1 }} />
              {t('admin.transactions.actions.reject')}
            </MenuItem>
          </>
        )}
      </Menu>

      {/* Transaction Details Dialog */}
      <Dialog
        open={detailsDialogOpen}
        onClose={() => setDetailsDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>{t('admin.transactions.details.title')}</DialogTitle>
        <DialogContent>
          {selectedTransaction && (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    {t('admin.transactions.details.amount')}
                  </Typography>
                  <Typography variant="h6" gutterBottom>
                    {formatCurrency(selectedTransaction.amount || 0)}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    {t('admin.transactions.details.type')}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {getTypeDisplayText(selectedTransaction.type)}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    {t('admin.transactions.details.status')}
                  </Typography>
                  <Chip
                    label={getStatusDisplayText(selectedTransaction)}
                    color={getStatusColor()}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    {t('admin.transactions.details.date')}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {new Date(selectedTransaction.createdAt).toLocaleString()}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    {t('admin.transactions.details.description')}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {selectedTransaction.description || t('admin.transactions.details.noDescription')}
                  </Typography>
                </Grid>
                {selectedTransaction.category && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      {t('admin.transactions.details.category')}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {selectedTransaction.category}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialogOpen(false)}>
            {t('admin.transactions.details.close')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TransactionMonitor;
