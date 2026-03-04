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
  Avatar,
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
  useMediaQuery,
  Drawer,
  Divider,
  CircularProgress,
  LinearProgress,
  Stack,
  Skeleton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  MoreVert as MoreIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
  TrendingUp,
  TrendingDown,
  PersonAdd,
  PeopleOutline,
  FileDownload,
  Refresh,
  WorkspacePremium as GrantPlanIcon,
  LockReset as LockResetIcon,
  VerifiedUser as VerifiedUserIcon,
  Logout as ForceLogoutIcon,
  Send as SendIcon,
  NoteAdd as NoteAddIcon,
  DeleteForever as DeleteDataIcon,
  Info as InfoIcon,
  Close as CloseIcon,
  Notes as NotesIcon,
  BarChart as StatsIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useTranslation } from 'react-i18next';
import { useAdminData } from '../../contexts/AdminContext';
import { exportToCSV, exportToExcel, flattenUser } from '../../utils/exportUtils';

const UserManagement = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const {
    users,
    usersPagination,
    filters,
    loading,
    fetchUsers,
    updateUser,
    grantSubscription,
    resetUserPassword,
    forceVerifyEmail,
    forceLogout,
    sendEmailToUser,
    addAdminNote,
    getUserStats,
    deleteUserData,
    deleteUser,
    updateFilters,
    exportData
  } = useAdminData();

  // Local state
  const [selectedUser, setSelectedUser] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [grantPlanOpen, setGrantPlanOpen] = useState(false);
  const [grantPlanData, setGrantPlanData] = useState({ plan: 'free', billingCycle: 'monthly', note: '' });
  const [grantPlanLoading, setGrantPlanLoading] = useState(false);
  const [grantPlanError, setGrantPlanError] = useState(null);
  const [grantPlanSuccess, setGrantPlanSuccess] = useState(null);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState(filters.users.search || '');
  const [statusFilter, setStatusFilter] = useState(filters.users.status || 'all');
  const [dateRange, setDateRange] = useState(filters.users.dateRange || 'all');

  // User detail drawer
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerData, setDrawerData] = useState(null);
  const [drawerLoading, setDrawerLoading] = useState(false);

  // Send email dialog
  const [sendEmailOpen, setSendEmailOpen] = useState(false);
  const [sendEmailData, setSendEmailData] = useState({ subject: '', message: '' });
  const [sendEmailLoading, setSendEmailLoading] = useState(false);
  const [sendEmailMsg, setSendEmailMsg] = useState(null);

  // Add note dialog
  const [addNoteOpen, setAddNoteOpen] = useState(false);
  const [addNoteText, setAddNoteText] = useState('');
  const [addNoteLoading, setAddNoteLoading] = useState(false);
  const [addNoteMsg, setAddNoteMsg] = useState(null);

  // Delete data dialog
  const [deleteDataOpen, setDeleteDataOpen] = useState(false);
  const [deleteDataLoading, setDeleteDataLoading] = useState(false);

  // Quick action feedback (for reset pwd, verify, force logout)
  const [quickMsg, setQuickMsg] = useState(null);

  // Quick stats for header
  const userStats = useMemo(() => [
    {
      title: t('admin.users.stats.totalUsers'),
      value: usersPagination?.total || 0,
      icon: PeopleOutline,
      color: theme.palette.primary.main,
      trend: '+12%'
    },
    {
      title: t('admin.users.stats.activeUsers'),
      value: users?.filter(user => user.status === 'active').length || 0,
      icon: CheckCircleIcon,
      color: theme.palette.success.main,
      trend: '+8%'
    },
    {
      title: t('admin.users.stats.newUsers'),
      value: users?.filter(user => {
        const createdAt = new Date(user.createdAt);
        const now = new Date();
        const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));
        return createdAt > thirtyDaysAgo;
      }).length || 0,
      icon: PersonAdd,
      color: theme.palette.info.main,
      trend: '+15%'
    },
    {
      title: t('admin.users.stats.blockedUsers'),
      value: users?.filter(user => user.status === 'blocked').length || 0,
      icon: BlockIcon,
      color: theme.palette.error.main,
      trend: '-2%'
    }
  ], [users, usersPagination?.total, theme.palette, t]);

  // Load users on component mount and when filters change
  useEffect(() => {
    if (fetchUsers) {
      fetchUsers(1, {
        search: searchTerm,
        status: statusFilter,
        dateRange: dateRange
      });
    }
  }, [fetchUsers, searchTerm, statusFilter, dateRange]);

  // Handle search
  const handleSearch = (value) => {
    setSearchTerm(value);
    updateFilters('users', { search: value });
  };

  // Handle status filter
  const handleStatusFilter = (status) => {
    setStatusFilter(status);
    updateFilters('users', { status });
  };

  // Handle date range filter
  const handleDateRangeFilter = (range) => {
    setDateRange(range);
    updateFilters('users', { dateRange: range });
  };

  // Handle page change
  const handlePageChange = (event, newPage) => {
    fetchUsers(newPage + 1, filters.users);
  };

  // Handle user actions
  const handleEditUser = (user) => {
    setSelectedUser(user);
    setEditDialogOpen(true);
    setMenuAnchor(null);
  };

  const handleDeleteUser = (user) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
    setMenuAnchor(null);
  };

  const handleToggleUserStatus = async (user) => {
    try {
      const newStatus = user.status === 'active' ? 'suspended' : 'active';
      await updateUser(user._id, { status: newStatus });
      setMenuAnchor(null);
    } catch (error) {
      console.error('Failed to update user status:', error);
    }
  };

  const handleOpenGrantPlan = (user) => {
    setSelectedUser(user);
    setGrantPlanData({ plan: user.subscription?.plan || 'free', billingCycle: 'monthly', note: '' });
    setGrantPlanError(null);
    setGrantPlanOpen(true);
    setMenuAnchor(null);
  };

  const handleGrantPlanSubmit = async () => {
    try {
      setGrantPlanLoading(true);
      setGrantPlanError(null);
      setGrantPlanSuccess(null);
      const result = await grantSubscription(selectedUser._id, grantPlanData);
      setGrantPlanSuccess(result?.message || `Plan updated to ${grantPlanData.plan} successfully`);
      // Refresh the user list so the subscription badge updates
      fetchUsers(1, { search: searchTerm, status: statusFilter, dateRange });
      setTimeout(() => {
        setGrantPlanOpen(false);
        setSelectedUser(null);
        setGrantPlanSuccess(null);
      }, 1500);
    } catch (error) {
      setGrantPlanError(error.message || 'Failed to update subscription');
    } finally {
      setGrantPlanLoading(false);
    }
  };

  // Handle bulk actions — try server-side first, fall back to client-side CSV
  const handleBulkExport = async () => {
    try {
      await exportData('users', 'csv');
    } catch {
      // Server export unavailable — export locally from loaded data
      const rows = (users || []).map(flattenUser);
      exportToCSV(rows, 'users_export');
    }
  };

  // Handle edit form submission
  const handleEditSubmit = async (formData) => {
    try {
      await updateUser(selectedUser._id, formData);
      setEditDialogOpen(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Failed to update user:', error);
    }
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    try {
      await deleteUser(selectedUser._id);
      setDeleteDialogOpen(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Failed to delete user:', error);
    }
  };

  // Open user detail drawer
  const handleOpenDrawer = async (user) => {
    setMenuAnchor(null);
    setSelectedUser(user);
    setDrawerOpen(true);
    setDrawerData(null);
    setDrawerLoading(true);
    try {
      const result = await getUserStats(user._id);
      setDrawerData(result?.data || null);
    } catch (e) {
      console.error('Failed to load user stats:', e);
    } finally {
      setDrawerLoading(false);
    }
  };

  // Quick actions with feedback
  const handleQuickAction = async (action, label) => {
    setMenuAnchor(null);
    setQuickMsg(null);
    try {
      const result = await action();
      setQuickMsg({ type: 'success', text: result?.message || `${label} successful` });
    } catch (e) {
      setQuickMsg({ type: 'error', text: e.message || `${label} failed` });
    }
    setTimeout(() => setQuickMsg(null), 4000);
  };

  // Send email
  const handleSendEmail = async () => {
    setSendEmailLoading(true);
    setSendEmailMsg(null);
    try {
      const result = await sendEmailToUser(selectedUser._id, sendEmailData.subject, sendEmailData.message);
      setSendEmailMsg({ type: 'success', text: result?.message || 'Email sent' });
      setTimeout(() => { setSendEmailOpen(false); setSendEmailData({ subject: '', message: '' }); setSendEmailMsg(null); }, 1500);
    } catch (e) {
      setSendEmailMsg({ type: 'error', text: e.message });
    } finally {
      setSendEmailLoading(false);
    }
  };

  // Add note
  const handleAddNote = async () => {
    setAddNoteLoading(true);
    setAddNoteMsg(null);
    try {
      await addAdminNote(selectedUser._id, addNoteText);
      setAddNoteMsg({ type: 'success', text: 'Note added' });
      setAddNoteText('');
      if (drawerOpen && drawerData) {
        // refresh drawer
        const result = await getUserStats(selectedUser._id);
        setDrawerData(result?.data || drawerData);
      }
      setTimeout(() => { setAddNoteOpen(false); setAddNoteMsg(null); }, 1200);
    } catch (e) {
      setAddNoteMsg({ type: 'error', text: e.message });
    } finally {
      setAddNoteLoading(false);
    }
  };

  // Delete user data
  const handleDeleteData = async () => {
    setDeleteDataLoading(true);
    try {
      const result = await deleteUserData(selectedUser._id);
      setDeleteDataOpen(false);
      setQuickMsg({ type: 'success', text: result?.message || 'User data deleted' });
      setTimeout(() => setQuickMsg(null), 4000);
    } catch (e) {
      setQuickMsg({ type: 'error', text: e.message });
    } finally {
      setDeleteDataLoading(false);
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'suspended': return 'error';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };

  // Get subscription color
  const getSubscriptionStyle = (plan) => {
    const styles = {
      free:     { background: '#6b728022', color: '#6b7280', border: '1px solid #6b728044' },
      standard: { background: '#3b82f622', color: '#3b82f6', border: '1px solid #3b82f666' },
      premium:  { background: 'linear-gradient(135deg,#7c3aed33,#6366f133)', color: '#7c3aed', border: '1px solid #7c3aed66', fontWeight: 700 },
      family:   { background: '#10b98122', color: '#10b981', border: '1px solid #10b98166' },
      business: { background: 'linear-gradient(135deg,#f59e0b33,#ef444433)', color: '#f59e0b', border: '1px solid #f59e0b66', fontWeight: 700 },
    };
    return styles[plan] || styles.free;
  };

  return (
    <Box>
      {/* Statistics Cards */}
      <Grid container spacing={isMobile ? 1.5 : 3} sx={{ mb: isMobile ? 2 : 3 }}>
        {userStats.map((stat, index) => (
          <Grid item xs={6} sm={6} md={3} key={index}>
            <Card elevation={2}>
              <CardContent sx={{ p: isMobile ? 1.5 : 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography variant={isMobile ? 'h5' : 'h4'} fontWeight="bold" color={stat.color}>
                      {loading ? <Skeleton width={40} /> : stat.value}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" noWrap>
                      {stat.title}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {stat.change > 0 ? (
                      <TrendingUp sx={{ color: 'success.main', mr: 0.5 }} />
                    ) : (
                      <TrendingDown sx={{ color: 'error.main', mr: 0.5 }} />
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
                placeholder={t('admin.users.search.placeholder')}
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{ minWidth: isMobile ? 0 : 300, width: isMobile ? '100%' : 'auto' }}
              />
              
              <FormControl sx={{ minWidth: isMobile ? 0 : 150, width: isMobile ? '100%' : 'auto' }}>
                <InputLabel>{t('admin.users.filters.status')}</InputLabel>
                <Select
                  value={statusFilter}
                  label={t('admin.users.filters.status')}
                  onChange={(e) => handleStatusFilter(e.target.value)}
                >
                  <MenuItem value="all">{t('admin.users.filters.allStatus')}</MenuItem>
                  <MenuItem value="active">{t('admin.users.filters.active')}</MenuItem>
                  <MenuItem value="suspended">{t('admin.users.filters.suspended')}</MenuItem>
                  <MenuItem value="pending">{t('admin.users.filters.pending')}</MenuItem>
                </Select>
              </FormControl>

              <FormControl sx={{ minWidth: isMobile ? 0 : 150, width: isMobile ? '100%' : 'auto' }}>
                <InputLabel>{t('admin.users.filters.dateRange')}</InputLabel>
                <Select
                  value={dateRange}
                  label={t('admin.users.filters.dateRange')}
                  onChange={(e) => handleDateRangeFilter(e.target.value)}
                >
                  <MenuItem value="all">{t('admin.users.filters.allTime')}</MenuItem>
                  <MenuItem value="today">{t('admin.users.filters.today')}</MenuItem>
                  <MenuItem value="week">{t('admin.users.filters.thisWeek')}</MenuItem>
                  <MenuItem value="month">{t('admin.users.filters.thisMonth')}</MenuItem>
                  <MenuItem value="year">{t('admin.users.filters.thisYear')}</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={<FileDownload />}
                onClick={handleBulkExport}
              >
                {t('admin.users.actions.export')}
              </Button>
              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={() => fetchUsers(1, filters.users)}
              >
                {t('admin.users.actions.refresh')}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card elevation={2} sx={{ overflow: 'hidden' }}>
        <TableContainer sx={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <Table sx={{ minWidth: isMobile ? 700 : 'auto' }}>
            <TableHead>
              <TableRow>
                <TableCell>{t('admin.users.table.user')}</TableCell>
                <TableCell>{t('admin.users.table.email')}</TableCell>
                <TableCell>{t('admin.users.table.status')}</TableCell>
                <TableCell>{t('admin.users.table.subscription')}</TableCell>
                <TableCell>{t('admin.users.table.joinDate')}</TableCell>
                <TableCell>{t('admin.users.table.lastActive')}</TableCell>
                <TableCell align="right">{t('admin.users.table.actions')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                // Skeleton loading rows
                [...Array(5)].map((_, i) => (
                  <TableRow key={`skel-${i}`}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
                        <Box>
                          <Skeleton variant="text" width={120} height={18} />
                          <Skeleton variant="text" width={80} height={14} />
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell><Skeleton variant="text" width={160} /></TableCell>
                    <TableCell><Skeleton variant="rounded" width={70} height={24} /></TableCell>
                    <TableCell><Skeleton variant="rounded" width={60} height={24} /></TableCell>
                    <TableCell><Skeleton variant="text" width={90} /></TableCell>
                    <TableCell><Skeleton variant="text" width={90} /></TableCell>
                    <TableCell align="right"><Skeleton variant="circular" width={28} height={28} /></TableCell>
                  </TableRow>
                ))
              ) : (users || []).length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      {loading ? 'Loading users...' : t('admin.users.search.noResults', 'No users found')}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                (users || []).map((user) => (
                  <TableRow key={user._id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar
                        src={user.avatar}
                        sx={{ mr: 2, width: 40, height: 40 }}
                      >
                        {user.name?.charAt(0).toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {user.name || t('admin.users.table.unnamed')}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ID: {user._id.slice(-8)}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <EmailIcon sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body2">
                        {user.email}
                      </Typography>
                    </Box>
                  </TableCell>
                  
                  <TableCell>
                    <Chip
                      label={t(`admin.users.status.${user.status}`)}
                      color={getStatusColor(user.status)}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  
                  <TableCell>
                    <Chip
                      label={t(`admin.users.subscription.${user.subscription?.plan || 'free'}`)}
                      size="small"
                      sx={{ ...getSubscriptionStyle(user.subscription?.plan), fontWeight: 600, fontSize: '0.72rem' }}
                    />
                  </TableCell>
                  
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CalendarIcon sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body2">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </TableCell>
                  
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {user.lastActive ? new Date(user.lastActive).toLocaleDateString() : t('admin.users.table.never')}
                    </Typography>
                  </TableCell>
                  
                  <TableCell align="right">
                    <IconButton
                      onClick={(e) => {
                        setMenuAnchor(e.currentTarget);
                        setSelectedUser(user);
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
          count={usersPagination?.total || 0}
          page={(usersPagination?.page || 1) - 1}
          onPageChange={handlePageChange}
          rowsPerPage={usersPagination?.limit || 20}
          rowsPerPageOptions={[20, 50, 100]}
          labelRowsPerPage={t('admin.users.pagination.rowsPerPage')}
        />
      </Card>

      {/* Action Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
      >
        <MenuItem onClick={() => handleOpenDrawer(selectedUser)}>
          <InfoIcon sx={{ mr: 1, color: 'primary.main' }} />
          View Details &amp; Stats
        </MenuItem>
        <MenuItem onClick={() => handleEditUser(selectedUser)}>
          <EditIcon sx={{ mr: 1 }} />
          {t('admin.users.actions.edit')}
        </MenuItem>
        <MenuItem onClick={() => handleOpenGrantPlan(selectedUser)}>
          <GrantPlanIcon sx={{ mr: 1, color: '#7c3aed' }} />
          Change Plan
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => { setMenuAnchor(null); handleQuickAction(() => resetUserPassword(selectedUser._id), 'Password reset email sent'); }}>
          <LockResetIcon sx={{ mr: 1, color: 'warning.main' }} />
          Send Password Reset
        </MenuItem>
        <MenuItem onClick={() => { setMenuAnchor(null); handleQuickAction(() => forceVerifyEmail(selectedUser._id), 'Email verified'); }}>
          <VerifiedUserIcon sx={{ mr: 1, color: 'success.main' }} />
          Force Verify Email
        </MenuItem>
        <MenuItem onClick={() => { setMenuAnchor(null); handleQuickAction(() => forceLogout(selectedUser._id), 'All sessions invalidated'); }}>
          <ForceLogoutIcon sx={{ mr: 1, color: 'warning.dark' }} />
          Force Logout (All Sessions)
        </MenuItem>
        <MenuItem onClick={() => { setMenuAnchor(null); setSendEmailData({ subject: '', message: '' }); setSendEmailOpen(true); }}>
          <SendIcon sx={{ mr: 1, color: 'info.main' }} />
          Send Direct Email
        </MenuItem>
        <MenuItem onClick={() => { setMenuAnchor(null); setAddNoteText(''); setAddNoteOpen(true); }}>
          <NoteAddIcon sx={{ mr: 1 }} />
          Add Admin Note
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => handleToggleUserStatus(selectedUser)}>
          {selectedUser?.status === 'active' ? (
            <>
              <BlockIcon sx={{ mr: 1 }} />
              {t('admin.users.actions.suspend')}
            </>
          ) : (
            <>
              <CheckCircleIcon sx={{ mr: 1 }} />
              {t('admin.users.actions.activate')}
            </>
          )}
        </MenuItem>
        <MenuItem onClick={() => { setMenuAnchor(null); setDeleteDataOpen(true); }} sx={{ color: 'warning.main' }}>
          <DeleteDataIcon sx={{ mr: 1 }} />
          Wipe User Data (GDPR)
        </MenuItem>
        <MenuItem onClick={() => handleDeleteUser(selectedUser)} sx={{ color: 'error.main' }}>
          <DeleteIcon sx={{ mr: 1 }} />
          {t('admin.users.actions.delete')}
        </MenuItem>
      </Menu>

      {/* Quick action feedback snackbar-style alert */}
      {quickMsg && (
        <Alert severity={quickMsg.type} sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: 2000, boxShadow: 6 }} onClose={() => setQuickMsg(null)}>
          {quickMsg.text}
        </Alert>
      )}

      {/* Edit User Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{t('admin.users.edit.title')}</DialogTitle>
        <DialogContent>
          {selectedUser && (
            <UserEditForm
              user={selectedUser}
              onSubmit={handleEditSubmit}
              onCancel={() => setEditDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Grant / Change Plan Dialog */}
      <Dialog open={grantPlanOpen} onClose={() => setGrantPlanOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          Change Subscription Plan
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Manually grant a subscription tier to <strong>{selectedUser?.email}</strong>. This bypasses Stripe billing.
          </Typography>
          {grantPlanError && <Alert severity="error" sx={{ mb: 2 }}>{grantPlanError}</Alert>}
          {grantPlanSuccess && <Alert severity="success" sx={{ mb: 2 }}>{grantPlanSuccess}</Alert>}
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Plan</InputLabel>
            <Select
              value={grantPlanData.plan}
              label="Plan"
              onChange={(e) => setGrantPlanData(d => ({ ...d, plan: e.target.value }))}
            >
              {['free', 'standard', 'premium', 'family', 'business'].map(p => (
                <MenuItem key={p} value={p} sx={{ textTransform: 'capitalize' }}>{p.charAt(0).toUpperCase() + p.slice(1)}</MenuItem>
              ))}
            </Select>
          </FormControl>
          {grantPlanData.plan !== 'free' && (
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Billing Cycle</InputLabel>
              <Select
                value={grantPlanData.billingCycle}
                label="Billing Cycle"
                onChange={(e) => setGrantPlanData(d => ({ ...d, billingCycle: e.target.value }))}
              >
                <MenuItem value="monthly">Monthly</MenuItem>
                <MenuItem value="yearly">Yearly</MenuItem>
              </Select>
            </FormControl>
          )}
          <TextField
            fullWidth
            label="Internal Note (optional)"
            placeholder="e.g. Comp'd for beta testing"
            value={grantPlanData.note}
            onChange={(e) => setGrantPlanData(d => ({ ...d, note: e.target.value }))}
            multiline
            rows={2}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setGrantPlanOpen(false)} disabled={grantPlanLoading}>Cancel</Button>
          <Button
            onClick={handleGrantPlanSubmit}
            variant="contained"
            disabled={grantPlanLoading}
            sx={{ background: 'linear-gradient(135deg,#7c3aed,#3b82f6)', fontWeight: 700 }}
          >
            {grantPlanLoading ? 'Saving…' : 'Apply Plan'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>{t('admin.users.delete.title')}</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            {t('admin.users.delete.warning')}
          </Alert>
          <Typography>
            {t('admin.users.delete.confirmation', { name: selectedUser?.name || selectedUser?.email })}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            {t('admin.users.delete.cancel')}
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            {t('admin.users.delete.confirm')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* User Detail Drawer */}
      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}
        PaperProps={{ sx: { width: { xs: '100%', sm: 420 }, p: 3 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" fontWeight={700}>User Details</Typography>
          <IconButton onClick={() => setDrawerOpen(false)}><CloseIcon /></IconButton>
        </Box>
        {drawerLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}><CircularProgress /></Box>
        ) : drawerData ? (
          <Box>
            {/* Profile */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Avatar sx={{ width: 56, height: 56, fontSize: 24, bgcolor: 'primary.main' }}>
                {(drawerData.user?.name || drawerData.user?.email || '?')[0].toUpperCase()}
              </Avatar>
              <Box>
                <Typography fontWeight={700}>{drawerData.user?.name || '—'}</Typography>
                <Typography variant="body2" color="text.secondary">{drawerData.user?.email}</Typography>
                <Box sx={{ mt: 0.5, display: 'flex', gap: 1 }}>
                  <Chip size="small" label={drawerData.user?.status || 'active'} color={getStatusColor(drawerData.user?.status)} />
                  <Chip size="small" label={drawerData.user?.emailVerified ? 'Verified' : 'Unverified'}
                    color={drawerData.user?.emailVerified ? 'success' : 'warning'} variant="outlined" />
                </Box>
              </Box>
            </Box>
            <Divider sx={{ mb: 2 }} />

            {/* Subscription */}
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>Subscription</Typography>
            <Stack spacing={0.5} sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">Plan</Typography>
                <Chip size="small" label={(drawerData.subscription?.plan || drawerData.user?.subscription?.plan || 'free').toUpperCase()}
                sx={{ ...getSubscriptionStyle(drawerData.subscription?.plan || drawerData.user?.subscription?.plan), fontWeight: 700, fontSize: '0.7rem' }} />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">Status</Typography>
                <Typography variant="body2">{drawerData.subscription?.status || 'N/A'}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">Billing Cycle</Typography>
                <Typography variant="body2">{drawerData.subscription?.billingCycle || 'N/A'}</Typography>
              </Box>
              {drawerData.subscription?.currentPeriodEnd && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Renews</Typography>
                  <Typography variant="body2">{new Date(drawerData.subscription.currentPeriodEnd).toLocaleDateString()}</Typography>
                </Box>
              )}
            </Stack>
            <Divider sx={{ mb: 2 }} />

            {/* Usage Stats */}
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>Usage Stats</Typography>
            <Stack spacing={1} sx={{ mb: 3 }}>
              {[
                { label: 'Transactions', value: drawerData.usage?.transactions },
                { label: 'Budgets', value: drawerData.usage?.budgets },
                { label: 'Categories', value: drawerData.usage?.categories },
              ].map(({ label, value }) => (
                <Box key={label} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">{label}</Typography>
                  <Typography variant="body2" fontWeight={600}>{value ?? 0}</Typography>
                </Box>
              ))}
            </Stack>
            <Divider sx={{ mb: 2 }} />

            {/* Quick Actions */}
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>Quick Actions</Typography>
            <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mb: 3 }}>
              <Button size="small" startIcon={<LockResetIcon />} variant="outlined" color="warning"
                onClick={() => handleQuickAction(() => resetUserPassword(drawerData.user._id), 'Password reset email sent')}>
                Reset Password
              </Button>
              <Button size="small" startIcon={<VerifiedUserIcon />} variant="outlined" color="success"
                onClick={() => handleQuickAction(() => forceVerifyEmail(drawerData.user._id), 'Email verified')}>
                Verify Email
              </Button>
              <Button size="small" startIcon={<ForceLogoutIcon />} variant="outlined" color="warning"
                onClick={() => handleQuickAction(() => forceLogout(drawerData.user._id), 'Sessions invalidated')}>
                Force Logout
              </Button>
              <Button size="small" startIcon={<SendIcon />} variant="outlined" color="info"
                onClick={() => { setSelectedUser(drawerData.user); setSendEmailOpen(true); }}>
                Send Email
              </Button>
              <Button size="small" startIcon={<NoteAddIcon />} variant="outlined"
                onClick={() => { setSelectedUser(drawerData.user); setAddNoteText(''); setAddNoteOpen(true); }}>
                Add Note
              </Button>
              <Button size="small" startIcon={<GrantPlanIcon />} variant="outlined" sx={{ color: '#7c3aed', borderColor: '#7c3aed' }}
                onClick={() => { handleOpenGrantPlan(drawerData.user); setDrawerOpen(false); }}>
                Change Plan
              </Button>
            </Stack>
            <Divider sx={{ mb: 2 }} />

            {/* Admin Notes */}
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>Admin Notes ({drawerData.user?.adminNotes?.length || 0})</Typography>
            {drawerData.user?.adminNotes?.length > 0 ? (
              <List dense sx={{ mb: 2 }}>
                {drawerData.user.adminNotes.slice(-5).reverse().map((n, i) => (
                  <ListItem key={i} alignItems="flex-start" sx={{ px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 32, mt: 0.5 }}><NotesIcon fontSize="small" /></ListItemIcon>
                    <ListItemText
                      primary={n.note}
                      secondary={`${n.addedBy?.name || n.addedBy?.email || 'Admin'} — ${new Date(n.addedAt).toLocaleDateString()}`}
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>No admin notes yet.</Typography>
            )}

            {/* Joined date */}
            <Typography variant="caption" color="text.secondary">
              Joined: {drawerData.user?.createdAt ? new Date(drawerData.user.createdAt).toLocaleString() : '—'}
            </Typography>
          </Box>
        ) : (
          <Typography color="text.secondary">No data available.</Typography>
        )}
      </Drawer>

      {/* Send Direct Email Dialog */}
      <Dialog open={sendEmailOpen} onClose={() => setSendEmailOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Send Email to {selectedUser?.email}</DialogTitle>
        <DialogContent>
          {sendEmailMsg && <Alert severity={sendEmailMsg.type} sx={{ mb: 2 }}>{sendEmailMsg.text}</Alert>}
          <TextField fullWidth label="Subject" value={sendEmailData.subject}
            onChange={(e) => setSendEmailData(d => ({ ...d, subject: e.target.value }))}
            sx={{ mb: 2, mt: 1 }} />
          <TextField fullWidth label="Message" value={sendEmailData.message} multiline rows={5}
            onChange={(e) => setSendEmailData(d => ({ ...d, message: e.target.value }))} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSendEmailOpen(false)} disabled={sendEmailLoading}>Cancel</Button>
          <Button onClick={handleSendEmail} variant="contained" startIcon={<SendIcon />}
            disabled={sendEmailLoading || !sendEmailData.subject || !sendEmailData.message}>
            {sendEmailLoading ? 'Sending…' : 'Send'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Admin Note Dialog */}
      <Dialog open={addNoteOpen} onClose={() => setAddNoteOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Add Admin Note</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            For <strong>{selectedUser?.email}</strong> — internal only, not visible to user.
          </Typography>
          {addNoteMsg && <Alert severity={addNoteMsg.type} sx={{ mb: 2 }}>{addNoteMsg.text}</Alert>}
          <TextField fullWidth label="Note" value={addNoteText} multiline rows={3}
            onChange={(e) => setAddNoteText(e.target.value)} autoFocus />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddNoteOpen(false)} disabled={addNoteLoading}>Cancel</Button>
          <Button onClick={handleAddNote} variant="contained" disabled={addNoteLoading || !addNoteText.trim()}>
            {addNoteLoading ? 'Saving…' : 'Save Note'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete User Data (GDPR) Dialog */}
      <Dialog open={deleteDataOpen} onClose={() => setDeleteDataOpen(false)}>
        <DialogTitle sx={{ color: 'error.main' }}>⚠ Wipe User Data</DialogTitle>
        <DialogContent>
          <Alert severity="error" sx={{ mb: 2 }}>
            This permanently deletes ALL transactions, budgets, and categories for <strong>{selectedUser?.email}</strong>. The account is kept. This cannot be undone.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDataOpen(false)} disabled={deleteDataLoading}>Cancel</Button>
          <Button onClick={handleDeleteData} color="error" variant="contained" disabled={deleteDataLoading}>
            {deleteDataLoading ? 'Deleting…' : 'Wipe Data'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// User Edit Form Component
const UserEditForm = ({ user, onSubmit, onCancel }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: user.name || '',
    email: user.email || '',
    status: user.status || 'active',
    subscription: user.subscription?.plan || 'free'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <TextField
        fullWidth
        label={t('admin.users.edit.name')}
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        sx={{ mb: 2 }}
      />
      
      <TextField
        fullWidth
        label={t('admin.users.edit.email')}
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        sx={{ mb: 2 }}
      />
      
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>{t('admin.users.edit.status')}</InputLabel>
        <Select
          value={formData.status}
          label={t('admin.users.edit.status')}
          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
        >
          <MenuItem value="active">{t('admin.users.status.active')}</MenuItem>
          <MenuItem value="suspended">{t('admin.users.status.suspended')}</MenuItem>
          <MenuItem value="pending">{t('admin.users.status.pending')}</MenuItem>
        </Select>
      </FormControl>
      
      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel>{t('admin.users.edit.subscription')}</InputLabel>
        <Select
          value={formData.subscription}
          label={t('admin.users.edit.subscription')}
          onChange={(e) => setFormData({ ...formData, subscription: e.target.value })}
        >
          <MenuItem value="free">{t('admin.users.subscription.free')}</MenuItem>
          <MenuItem value="premium">{t('admin.users.subscription.premium')}</MenuItem>
          <MenuItem value="family">{t('admin.users.subscription.family')}</MenuItem>
        </Select>
      </FormControl>
      
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button onClick={onCancel}>
          {t('admin.users.edit.cancel')}
        </Button>
        <Button type="submit" variant="contained">
          {t('admin.users.edit.save')}
        </Button>
      </Box>
    </Box>
  );
};

export default UserManagement;
