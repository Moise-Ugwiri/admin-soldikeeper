/* eslint-disable */
import React, { useState, useEffect, useLayoutEffect, useCallback } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
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
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Divider,
  Avatar,
  Badge,
  Switch,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Fab,
  SpeedDial,
  SpeedDialIcon,
  SpeedDialAction,
  CircularProgress,
  InputAdornment,
  LinearProgress,
  ButtonGroup,
  useTheme
} from '@mui/material';
import {
  Email,
  Notifications,
  Campaign,
  Article,
  Help,
  Forum,
  Send,
  Schedule,
  Draft,
  Publish,
  Edit,
  Delete,
  Visibility,
  ExpandMore,
  Add,
  Settings,
  Analytics,
  FileCopy as Template,
  PersonAdd,
  Group,
  Star,
  Comment,
  Share,
  Bookmark,
  ThumbUp,
  Reply,
  AttachFile,
  Image,
  VideoLibrary,
  Link,
  FormatBold,
  FormatItalic,
  FormatListBulleted,
  Code,
  Preview,
  CloudUpload,
  Download,
  Refresh,
  FilterList,
  Search,
  DateRange,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  Warning,
  Info,
  Error,
  Feedback,
  Chat,
  QuestionAnswer,
  LiveHelp,
  ContactSupport,
  Announcement,
  NewReleases,
  Update,
  BugReport,
  School,
  MenuBook,
  Quiz,
  VideoCall,
  Slideshow,
  PictureAsPdf,
  Language,
  Translate,
  Public,
  VerifiedUser,
  Security,
  Privacy,
  Close,
  RemoveRedEye
} from '@mui/icons-material';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useTranslation } from 'react-i18next';
import { useAdminData } from '../../contexts/AdminContext';
import adminService from '../../services/adminService';
import { adminGetTickets, adminGetTicket, adminUpdateTicket, adminReply, adminGetStats } from '../../services/supportAPI';
import GrowthCommandCenter from './GrowthCommandCenter';
import { AINotificationDrafter, AICampaignDrafter, AIContentDrafter, AITemplateDrafter, AISupportAnalyzer } from './AICommsAssistant';

// ─── Admin Support Panel ────────────────────────────────────────────────────
const PRIORITY_COLORS = { low: '#6b7280', medium: '#3b82f6', high: '#f59e0b', urgent: '#ef4444' };
const STATUS_COLORS = { open: '#ef4444', in_progress: '#f59e0b', waiting_user: '#8b5cf6', resolved: '#10b981', closed: '#6b7280' };
const STATUS_LABELS = { open: 'Open', in_progress: 'In Progress', waiting_user: 'Waiting User', resolved: 'Resolved', closed: 'Closed' };
const CATEGORY_LABELS = { bug: '🐛 Bug', billing: '💳 Billing', account: '👤 Account', feature: '✨ Feature', general: '💬 General' };

const AdminSupportPanel = () => {
  const theme = useTheme();
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [replying, setReplying] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusUpdating, setStatusUpdating] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [ticketsRes, statsRes] = await Promise.all([
        adminGetTickets({ status: filterStatus || undefined, category: filterCategory || undefined, priority: filterPriority || undefined, search: search || undefined, page, limit: 20 }),
        adminGetStats()
      ]);
      const tData = ticketsRes?.data || ticketsRes;
      setTickets(Array.isArray(tData?.tickets) ? tData.tickets : Array.isArray(tData) ? tData : []);
      setTotalPages(tData?.pages || 1);
      setStats(statsRes?.data || statsRes);
    } catch (e) {
      console.error('Support load error:', e);
    } finally {
      setLoading(false);
    }
  }, [filterStatus, filterCategory, filterPriority, search, page]);

  useEffect(() => { load(); }, [load]);

  const openTicket = async (ticket) => {
    try {
      const res = await adminGetTicket(ticket._id);
      setSelected(res?.data || res);
      setDetailOpen(true);
    } catch {
      setSelected(ticket);
      setDetailOpen(true);
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (!selected) return;
    setStatusUpdating(true);
    try {
      const res = await adminUpdateTicket(selected._id, { status: newStatus });
      const updated = res?.data || res;
      setSelected(updated);
      load();
    } catch (e) {
      console.error(e);
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleReply = async () => {
    if (!replyText.trim() || !selected) return;
    setReplying(true);
    try {
      const res = await adminReply(selected._id, replyText);
      const updated = res?.data || res;
      setSelected(updated);
      setReplyText('');
      load();
    } catch (e) {
      console.error(e);
    } finally {
      setReplying(false);
    }
  };

  return (
    <Box>
      {/* Stats Row */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Total Open', value: stats?.open ?? '—', color: '#ef4444' },
          { label: 'In Progress', value: stats?.in_progress ?? '—', color: '#f59e0b' },
          { label: 'Resolved', value: stats?.resolved ?? '—', color: '#10b981' },
          { label: 'Closed', value: stats?.closed ?? '—', color: '#6b7280' },
        ].map(s => (
          <Grid item xs={6} sm={3} key={s.label}>
            <Card sx={{ textAlign: 'center', border: `1px solid ${s.color}30`, background: `linear-gradient(135deg, ${s.color}10, transparent)` }}>
              <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Typography variant="h4" fontWeight={900} sx={{ color: s.color }}>{s.value}</Typography>
                <Typography variant="caption" color="text.secondary">{s.label}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Filters */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField size="small" placeholder="Search tickets..." value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          InputProps={{ startAdornment: <InputAdornment position="start">🔍</InputAdornment> }}
          sx={{ minWidth: 200 }} />
        <FormControl size="small" sx={{ minWidth: 130 }}>
          <InputLabel>Status</InputLabel>
          <Select value={filterStatus} label="Status" onChange={e => { setFilterStatus(e.target.value); setPage(1); }}>
            <MenuItem value="">All</MenuItem>
            {Object.entries(STATUS_LABELS).map(([v, l]) => <MenuItem key={v} value={v}>{l}</MenuItem>)}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 130 }}>
          <InputLabel>Category</InputLabel>
          <Select value={filterCategory} label="Category" onChange={e => { setFilterCategory(e.target.value); setPage(1); }}>
            <MenuItem value="">All</MenuItem>
            {Object.entries(CATEGORY_LABELS).map(([v, l]) => <MenuItem key={v} value={v}>{l}</MenuItem>)}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Priority</InputLabel>
          <Select value={filterPriority} label="Priority" onChange={e => { setFilterPriority(e.target.value); setPage(1); }}>
            <MenuItem value="">All</MenuItem>
            {['low','medium','high','urgent'].map(p => <MenuItem key={p} value={p} sx={{ textTransform: 'capitalize' }}>{p}</MenuItem>)}
          </Select>
        </FormControl>
        <Button variant="outlined" size="small" onClick={load}>Refresh</Button>
      </Box>

      {/* Ticket Table */}
      {loading ? (
        <Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress /></Box>
      ) : tickets.length === 0 ? (
        <Card sx={{ p: 6, textAlign: 'center' }}>
          <Typography color="text.secondary">No support tickets found.</Typography>
        </Card>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 2, mb: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: theme.palette.mode === 'dark' ? 'grey.900' : 'grey.100' }}>
                <TableCell><strong>#</strong></TableCell>
                <TableCell><strong>User</strong></TableCell>
                <TableCell><strong>Subject</strong></TableCell>
                <TableCell><strong>Category</strong></TableCell>
                <TableCell><strong>Priority</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell><strong>Created</strong></TableCell>
                <TableCell><strong>Replies</strong></TableCell>
                <TableCell align="center"><strong>Action</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tickets.map(t => (
                <TableRow key={t._id} hover sx={{ cursor: 'pointer', '&:hover': { bgcolor: theme.palette.action.hover } }}
                  onClick={() => openTicket(t)}>
                  <TableCell><Typography variant="caption" fontWeight={700} sx={{ color: '#6366f1' }}>{t.ticketNumber}</Typography></TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight={600}>{t.userName || 'Unknown'}</Typography>
                      <Typography variant="caption" color="text.secondary">{t.userEmail}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell><Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>{t.subject}</Typography></TableCell>
                  <TableCell><Typography variant="caption">{CATEGORY_LABELS[t.category] || t.category}</Typography></TableCell>
                  <TableCell>
                    <Chip label={t.priority} size="small"
                      sx={{ bgcolor: `${PRIORITY_COLORS[t.priority]}20`, color: PRIORITY_COLORS[t.priority], fontWeight: 700, textTransform: 'capitalize', fontSize: '0.7rem' }} />
                  </TableCell>
                  <TableCell>
                    <Chip label={STATUS_LABELS[t.status] || t.status} size="small"
                      sx={{ bgcolor: `${STATUS_COLORS[t.status]}20`, color: STATUS_COLORS[t.status], fontWeight: 700, fontSize: '0.7rem' }} />
                  </TableCell>
                  <TableCell><Typography variant="caption">{new Date(t.createdAt).toLocaleDateString()}</Typography></TableCell>
                  <TableCell align="center">
                    <Badge badgeContent={t.replies?.length || 0} color="primary" max={99}>
                      <Reply sx={{ color: 'text.secondary', fontSize: 18 }} />
                    </Badge>
                  </TableCell>
                  <TableCell align="center">
                    <IconButton size="small" onClick={e => { e.stopPropagation(); openTicket(t); }}>
                      <Visibility sx={{ fontSize: 16 }} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mt: 1 }}>
          <Button size="small" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
          <Typography variant="body2" sx={{ alignSelf: 'center' }}>Page {page} of {totalPages}</Typography>
          <Button size="small" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next</Button>
        </Box>
      )}

      {/* Ticket Detail Dialog */}
      <Dialog open={detailOpen} onClose={() => { setDetailOpen(false); setSelected(null); setReplyText(''); }}
        maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3, maxHeight: '90vh' } }}>
        {selected && (
          <>
            <DialogTitle sx={{ pb: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography fontWeight={700} sx={{ color: '#6366f1' }}>{selected.ticketNumber}</Typography>
                  <Typography variant="h6" fontWeight={700}>{selected.subject}</Typography>
                  <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                    <Typography variant="caption" color="text.secondary">{selected.userEmail}</Typography>
                    <Typography variant="caption" color="text.secondary">·</Typography>
                    <Typography variant="caption" color="text.secondary">{new Date(selected.createdAt).toLocaleString()}</Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Chip label={CATEGORY_LABELS[selected.category] || selected.category} size="small" variant="outlined" />
                  <Chip label={selected.priority} size="small"
                    sx={{ bgcolor: `${PRIORITY_COLORS[selected.priority]}20`, color: PRIORITY_COLORS[selected.priority], textTransform: 'capitalize' }} />
                </Box>
              </Box>
            </DialogTitle>
            <DialogContent dividers>
              {/* Status Control */}
              <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                <Typography variant="caption" fontWeight={700} color="text.secondary">STATUS:</Typography>
                {Object.entries(STATUS_LABELS).map(([val, lbl]) => (
                  <Chip key={val} label={lbl} size="small" onClick={() => handleStatusChange(val)} disabled={statusUpdating}
                    sx={{
                      cursor: 'pointer',
                      bgcolor: selected.status === val ? STATUS_COLORS[val] : `${STATUS_COLORS[val]}20`,
                      color: selected.status === val ? '#fff' : STATUS_COLORS[val],
                      fontWeight: 700, fontSize: '0.7rem',
                      '&:hover': { opacity: 0.85 }
                    }} />
                ))}
              </Box>
              <Divider sx={{ mb: 2 }} />

              {/* Original message */}
              <Box sx={{ mb: 2, p: 2, borderRadius: 2, bgcolor: theme.palette.mode === 'dark' ? 'grey.900' : 'grey.50', border: `1px solid ${theme.palette.divider}` }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Avatar sx={{ width: 28, height: 28, bgcolor: '#6366f120', color: '#6366f1', fontSize: '0.7rem' }}>
                    {(selected.userName || selected.userEmail || 'U')[0].toUpperCase()}
                  </Avatar>
                  <Typography variant="caption" fontWeight={700}>{selected.userName || selected.userEmail}</Typography>
                  <Typography variant="caption" color="text.secondary">· {new Date(selected.createdAt).toLocaleString()}</Typography>
                </Box>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>{selected.message}</Typography>
              </Box>

              {/* Replies */}
              {(selected.replies || []).map((reply, i) => (
                <Box key={i} sx={{
                  mb: 1.5, p: 2, borderRadius: 2,
                  ml: reply.authorRole === 'admin' ? 4 : 0,
                  bgcolor: reply.authorRole === 'admin' ? `${'#6366f1'}10` : theme.palette.action.hover,
                  border: `1px solid ${reply.authorRole === 'admin' ? '#6366f130' : theme.palette.divider}`
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <Avatar sx={{ width: 24, height: 24, bgcolor: reply.authorRole === 'admin' ? '#6366f1' : '#10b981', fontSize: '0.65rem' }}>
                      {reply.authorRole === 'admin' ? 'S' : (reply.authorName || 'U')[0].toUpperCase()}
                    </Avatar>
                    <Typography variant="caption" fontWeight={700}>
                      {reply.authorRole === 'admin' ? 'Support Team' : reply.authorName}
                    </Typography>
                    <Chip label={reply.authorRole === 'admin' ? 'Staff' : 'User'} size="small"
                      sx={{ fontSize: '0.6rem', height: 16, bgcolor: reply.authorRole === 'admin' ? '#6366f120' : '#10b98120', color: reply.authorRole === 'admin' ? '#6366f1' : '#10b981' }} />
                    <Typography variant="caption" color="text.secondary">{new Date(reply.createdAt).toLocaleString()}</Typography>
                  </Box>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{reply.message}</Typography>
                </Box>
              ))}

              {/* Reply Input */}
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>Reply as Support Team</Typography>
                <TextField multiline rows={3} fullWidth value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  placeholder="Type your reply to the user..." />
              </Box>
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2 }}>
              <Button onClick={() => { setDetailOpen(false); setSelected(null); setReplyText(''); }}>Close</Button>
              <Button variant="contained" disabled={!replyText.trim() || replying} onClick={handleReply}
                sx={{ bgcolor: '#6366f1', '&:hover': { bgcolor: '#4f46e5' } }}>
                {replying ? 'Sending...' : 'Send Reply'}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

// TabPanel must be defined at module scope to avoid remount on parent re-render
const TabPanel = ({ children, value, index, ...other }) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    id={`content-tabpanel-${index}`}
    aria-labelledby={`content-tab-${index}`}
    {...other}
  >
    {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
  </div>
);

const ContentCommunicationManagement = () => {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  
  // Get data from AdminContext
  const {
    // State
    notifications,
    notificationsPagination,
    emailCampaigns,
    emailCampaignsPagination,
    helpContent,
    helpContentPagination,
    communicationAnalytics,
    loading,
    error,
    
    // Actions
    fetchNotifications,
    fetchEmailCampaigns,
    fetchHelpContent,
    fetchCommunicationAnalytics,
    createNotification,
    createEmailCampaign,
    createHelpContent
  } = useAdminData();
  
  // Local state management
  const [activeTab, setActiveTab] = useState(0);
  const [notificationDialogOpen, setNotificationDialogOpen] = useState(false);
  const [emailCampaignDialogOpen, setEmailCampaignDialogOpen] = useState(false);
  const [contentDialogOpen, setContentDialogOpen] = useState(false);
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [selectedContent, setSelectedContent] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [supportStats, setSupportStats] = useState(null);
  
  // Analytics state
  const [analyticsRange, setAnalyticsRange] = useState('6m');
  
  // Template filter state
  const [templateFilter, setTemplateFilter] = useState('all');
  const [previewTemplate, setPreviewTemplate] = useState(null);
  
  // Form states for creating content
  const [newNotification, setNewNotification] = useState({
    title: '',
    message: '',
    type: 'system',
    targetAudience: 'all_users',
    sendImmediately: true,
    scheduledTime: null,
    actionLabel: 'Open My Dashboard',
    actionUrl: 'https://www.soldikeeper.com/dashboard'
  });

  const [newEmailCampaign, setNewEmailCampaign] = useState({
    name: '',
    subject: '',
    content: '',
    type: 'newsletter',
    audience: 'all_users',
    sendImmediately: true,
    scheduledTime: null
  });

  const [newHelpContent, setNewHelpContent] = useState({
    title: '',
    content: '',
    type: 'article',
    category: 'general',
    tags: [],
    published: false
  });

  // Built-in templates
  const BUILT_IN_TEMPLATES = [
    {
      id: 't1', type: 'notification', category: 'Welcome',
      title: '🎉 Welcome to SoldiKeeper!',
      preview: 'Welcome aboard! Start by adding your first transaction and let SoldiKeeper help you take control of your finances.',
      message: 'Welcome aboard! Start by adding your first transaction and let SoldiKeeper help you take control of your finances. Your financial clarity journey starts now.',
      targetAudience: 'all_users',
      icon: '🎉'
    },
    {
      id: 't2', type: 'notification', category: 'Feature Update',
      title: '🚀 New Feature: AI Financial Insights',
      preview: 'We\'ve just launched Keeper AI — your personal financial advisor powered by artificial intelligence.',
      message: 'We\'ve just launched Keeper AI — your personal financial advisor powered by artificial intelligence. Get personalized spending analysis, budget recommendations, and smart savings tips. Available now in your dashboard.',
      targetAudience: 'all_users',
      icon: '🚀'
    },
    {
      id: 't3', type: 'notification', category: 'Reminder',
      title: '📊 Monthly Budget Review Reminder',
      preview: 'It\'s time to review your monthly budget. Take 5 minutes to check your spending trends.',
      message: 'It\'s time to review your monthly budget! Log into SoldiKeeper to see your spending trends, check if you\'re on track with your goals, and adjust your budget for the upcoming month.',
      targetAudience: 'all_users',
      icon: '📊'
    },
    {
      id: 't4', type: 'campaign', category: 'Upgrade',
      subject: '⭐ Upgrade to Premium — Unlock the Full Power of SoldiKeeper',
      preview: 'Discover what Premium members get: unlimited transactions, AI insights, receipt scanning, and more.',
      body: `Hi {{name}},

You've been making great progress with SoldiKeeper — and we want to help you go even further.

With SoldiKeeper Premium, you get:
✅ Unlimited transaction tracking
✅ Keeper AI — personal financial advisor
✅ Receipt scanning & OCR
✅ Advanced budget analytics
✅ Priority support

Upgrade today and get your first month at a special rate.

👉 Upgrade Now → https://soldikeeper.com/pricing

The SoldiKeeper Team`,
      targetAudience: 'free_users',
      icon: '⭐'
    },
    {
      id: 't5', type: 'campaign', category: 'Newsletter',
      subject: '📈 Your Monthly Financial Digest — {{month}} {{year}}',
      preview: 'Here are this month\'s top financial tips and product updates from SoldiKeeper.',
      body: `Hi {{name}},

Here's your monthly SoldiKeeper digest for {{month}} {{year}}.

🔔 Platform Updates
- [Feature 1]
- [Feature 2]

💡 Financial Tip of the Month
[Insert tip here]

📊 Community Stats
This month, SoldiKeeper users collectively saved an estimated $[X] by tracking their spending.

Until next month,
The SoldiKeeper Team`,
      targetAudience: 'all_users',
      icon: '📈'
    },
    {
      id: 't6', type: 'campaign', category: 'Win-back',
      subject: '👋 We miss you — here\'s what\'s new at SoldiKeeper',
      preview: 'It\'s been a while! Check out what\'s new and get back on track with your finances.',
      body: `Hi {{name}},

We noticed you haven't logged in for a while, and we just wanted to say — we miss you!

Since your last visit, we've added:
🤖 Keeper AI — ask anything about your finances
📷 Receipt Scanning — snap & track expenses instantly
🔄 Recurring Transactions — automate your regular expenses

Your data is safe and ready whenever you come back.

👉 Log back in → https://soldikeeper.com

We're rooting for you,
The SoldiKeeper Team`,
      targetAudience: 'inactive_users',
      icon: '👋'
    },
    {
      id: 't7', type: 'help', category: 'onboarding',
      title: 'How to Add Your First Transaction',
      content: `# Getting Started: Adding Your First Transaction

Welcome to SoldiKeeper! Adding transactions is the foundation of tracking your finances effectively.

## Steps

1. **Open the Transactions page** — Click "Transactions" in the left sidebar
2. **Click "Add Transaction"** — The blue button in the top-right corner
3. **Fill in the details**:
   - Amount (positive for income, negative for expense)
   - Category (choose from our preset list or create your own)
   - Date
   - Optional: description, receipt photo
4. **Click Save** — Your transaction is now tracked!

## Tips
- Use the **recurring transactions** feature for bills that repeat monthly
- Take a photo of your receipt using the camera icon for automatic data extraction
- Categories help you see spending patterns in the Analytics dashboard

## Need more help?
Contact our support team — we're here to help!`,
      estimatedReadTime: 3,
      articleType: 'guide',
      icon: '📝'
    },
    {
      id: 't9', type: 'notification', category: 'Product Launch',
      title: '📱 SoldiKeeper is now on Google Play!',
      preview: 'SoldiKeeper is now on the Google Play Store — track your money effortlessly, not exhaustingly.',
      targetAudience: 'all_users',
      icon: '📱',
      actionLabel: '▶ Download on Play Store',
      actionUrl: 'https://shorturl.at/fVV3J',
      message: `<p style="font-size:15px;color:#616161;line-height:1.5;margin:0 0 20px;">SoldiKeeper is now on the Google Play Store — a personal finance app that makes tracking your money effortless, not exhausting.</p>

<p style="margin:0 0 20px;">
  <span style="font-size:13px;font-weight:500;color:#1565c0;background:#e3f2fd;border:1px solid #90caf9;border-radius:100px;padding:5px 14px;display:inline-block;margin:0 6px 6px 0;">Expense tracking</span>
  <span style="font-size:13px;font-weight:500;color:#1565c0;background:#e3f2fd;border:1px solid #90caf9;border-radius:100px;padding:5px 14px;display:inline-block;margin:0 6px 6px 0;">Smart budgets</span>
  <span style="font-size:13px;font-weight:500;color:#1565c0;background:#e3f2fd;border:1px solid #90caf9;border-radius:100px;padding:5px 14px;display:inline-block;margin:0 0 6px 0;">Clear insights</span>
</p>

<table cellpadding="0" cellspacing="0" style="margin:0 0 28px;width:100%;max-width:280px;">
  <tr><td style="padding:0 0 10px;"><a href="https://shorturl.at/fVV3J" style="display:block;background:#1976d2;color:#fff;text-decoration:none;font-weight:600;font-size:14px;padding:13px 22px;border-radius:10px;text-align:center;">&#9654; Play Store</a></td></tr>
  <tr><td><a href="https://www.soldikeeper.com" style="display:block;color:#212121;text-decoration:none;font-weight:600;font-size:14px;padding:12px 22px;border-radius:10px;border:1px solid #bdbdbd;text-align:center;">&#127760; soldikeeper.com</a></td></tr>
</table>

<table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;"><tr><td style="height:1px;background:#e0e0e0;font-size:0;line-height:0;">&nbsp;</td></tr></table>

<p style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:#9e9e9e;margin:0 0 10px;">&#127470;&#127481; Versione Italiana</p>
<h2 style="font-size:20px;font-weight:700;line-height:1.2;letter-spacing:-0.3px;margin:0 0 6px;color:#212121;">I tuoi soldi, finalmente sotto controllo.</h2>
<p style="font-size:14px;color:#616161;line-height:1.5;margin:0 0 16px;">SoldiKeeper è ora sul Google Play Store — un'app di finanza personale che rende il controllo dei tuoi soldi semplice, non stressante.</p>

<p style="margin:0 0 20px;">
  <span style="display:block;padding:0 0 7px;font-size:14px;color:#424242;"><span style="color:#1976d2;font-weight:700;">&#10003;</span>&nbsp; Tracciamento spese in pochi secondi</span>
  <span style="display:block;padding:0 0 7px;font-size:14px;color:#424242;"><span style="color:#1976d2;font-weight:700;">&#10003;</span>&nbsp; Budget che funzionano davvero</span>
  <span style="display:block;font-size:14px;color:#424242;"><span style="color:#1976d2;font-weight:700;">&#10003;</span>&nbsp; Un quadro chiaro di dove va ogni euro</span>
</p>

<table cellpadding="0" cellspacing="0" style="margin:0;width:100%;max-width:280px;">
  <tr><td style="padding:0 0 10px;"><a href="https://shorturl.at/fVV3J" style="display:block;background:#1976d2;color:#fff;text-decoration:none;font-weight:600;font-size:14px;padding:13px 22px;border-radius:10px;text-align:center;">&#9654; Play Store</a></td></tr>
  <tr><td><a href="https://www.soldikeeper.com" style="display:block;color:#212121;text-decoration:none;font-weight:600;font-size:14px;padding:12px 22px;border-radius:10px;border:1px solid #bdbdbd;text-align:center;">&#127760; soldikeeper.com</a></td></tr>
</table>`
    },
    {
      id: 't8', type: 'help', category: 'billing',
      title: 'Frequently Asked Questions about SoldiKeeper Premium',
      content: `# SoldiKeeper Premium — FAQ

## What's included in Premium?

Premium includes unlimited transactions, Keeper AI, receipt scanning, advanced analytics, split bill, and priority support.

## How much does Premium cost?

Visit our pricing page at soldikeeper.com/pricing for the most current pricing.

## Can I cancel anytime?

Yes! You can cancel your subscription at any time from your account settings. You'll retain access until the end of your billing period.

## Is my financial data secure?

Absolutely. We use bank-level 256-bit encryption for all data storage and transmission. We never sell your data to third parties.

## How does the AI Financial Advisor work?

Keeper AI analyzes your transaction history, spending patterns, and budget to provide personalized, actionable financial advice in plain English.

## Do you offer a family plan?

Yes! Our Family Plan covers up to 5 accounts and includes all Premium features.`,
      estimatedReadTime: 4,
      articleType: 'faq',
      icon: '❓'
    }
  ];

  // Handlers for template actions
  const handleUseTemplate = (template) => {
    if (template.type === 'notification') {
      setNewNotification({
        title: template.title,
        message: template.message,
        targetAudience: template.targetAudience,
        type: 'system',
        priority: 'medium',
        sendImmediately: true,
        scheduledTime: null,
        actionLabel: template.actionLabel || 'Open My Dashboard',
        actionUrl: template.actionUrl || ''
      });
      setNotificationDialogOpen(true);
    } else if (template.type === 'campaign') {
      setNewEmailCampaign({
        name: template.category + ' Campaign',
        subject: template.subject,
        content: template.body,
        type: 'newsletter',
        audience: template.targetAudience,
        sendImmediately: true,
        scheduledTime: null
      });
      setEmailCampaignDialogOpen(true);
    } else if (template.type === 'help') {
      setNewHelpContent({
        title: template.title,
        content: template.content,
        type: template.articleType,
        category: template.category,
        estimatedReadTime: template.estimatedReadTime,
        published: false,
        tags: []
      });
      setContentDialogOpen(true);
    }
  };

  // Load support stats and analytics on component mount
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const stats = await adminGetStats();
        setSupportStats(stats?.data || stats);
      } catch (e) {
        console.error('Failed to load support stats:', e);
      }
    };
    loadInitialData();
    
    // Load analytics data on mount
    if (fetchCommunicationAnalytics) {
      fetchCommunicationAnalytics('6m');
    }
  }, [fetchCommunicationAnalytics]);

  // Load data when component mounts or tab changes
  useLayoutEffect(() => {
    switch (activeTab) {
      case 0: // War Room - handled by GrowthCommandCenter
        break;
      case 1: // Notifications
        if (fetchNotifications) {
          fetchNotifications(1);
        }
        break;
      case 2: // Email Campaigns
        if (fetchEmailCampaigns) {
          fetchEmailCampaigns(1);
        }
        break;
      case 3: // Help Center
        if (fetchHelpContent) {
          fetchHelpContent(1);
        }
        break;
      case 5: // Analytics
        if (fetchCommunicationAnalytics) {
          fetchCommunicationAnalytics('6m');
        }
        break;
      default:
        break;
    }
  }, [activeTab, fetchNotifications, fetchEmailCampaigns, fetchHelpContent, fetchCommunicationAnalytics]);

  // Dialog handlers
  const handleCreateNotification = () => {
    setNotificationDialogOpen(true);
  };

  const handleCreateCampaign = () => {
    setEmailCampaignDialogOpen(true);
  };

  const handleCreateContent = () => {
    setContentDialogOpen(true);
  };

  // Submit handlers
  const handleSubmitNotification = async () => {
    try {
      if (newNotification.id) {
        // Update existing notification
        await adminService.updateNotification(newNotification.id, newNotification);
      } else {
        // Create new notification
        await createNotification(newNotification);
      }
      setNotificationDialogOpen(false);
      setNewNotification({
        title: '',
        message: '',
        type: 'system',
        targetAudience: 'all_users',
        sendImmediately: true,
        scheduledTime: null,
        actionLabel: 'Open My Dashboard',
        actionUrl: 'https://www.soldikeeper.com/dashboard'
      });
      fetchNotifications(1); // Refresh the list
    } catch (error) {
      console.error('Failed to save notification:', error);
    }
  };

  // Handle creating new email campaign
  const handleSubmitEmailCampaign = async () => {
    try {
      if (newEmailCampaign.id) {
        // Update existing campaign
        await adminService.updateEmailCampaign(newEmailCampaign.id, newEmailCampaign);
      } else {
        // Create new campaign
        await createEmailCampaign(newEmailCampaign);
      }
      setEmailCampaignDialogOpen(false);
      setNewEmailCampaign({
        name: '',
        subject: '',
        content: '',
        type: 'newsletter',
        audience: 'all_users',
        sendImmediately: true,
        scheduledTime: null
      });
      fetchEmailCampaigns(1); // Refresh the list
    } catch (error) {
      console.error('Failed to save email campaign:', error);
    }
  };

  // Handle creating new help content
  const handleSubmitHelpContent = async () => {
    try {
      if (newHelpContent.id) {
        // Update existing content
        await adminService.updateHelpContent(newHelpContent.id, newHelpContent);
      } else {
        // Create new content
        await createHelpContent(newHelpContent);
      }
      setContentDialogOpen(false);
      setNewHelpContent({
        title: '',
        content: '',
        type: 'article',
        category: 'general',
        tags: [],
        published: false
      });
      fetchHelpContent(1); // Refresh the list
    } catch (error) {
      console.error('Failed to save help content:', error);
    }
  };

  // Edit and Delete handlers
  const handleEditNotification = (notification) => {
    setNewNotification({
      id: notification.id,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      targetAudience: notification.recipients,
      sendImmediately: notification.status === 'sent',
      scheduledTime: notification.scheduled
    });
    setNotificationDialogOpen(true);
  };

  const handleDeleteNotification = async (notificationId) => {
    if (window.confirm('Are you sure you want to delete this notification?')) {
      try {
        await adminService.deleteNotification(notificationId);
        fetchNotifications(1); // Refresh list
      } catch (error) {
        console.error('Failed to delete notification:', error);
      }
    }
  };

  const handleEditCampaign = (campaign) => {
    setNewEmailCampaign({
      id: campaign.id,
      name: campaign.name,
      subject: campaign.subject,
      content: campaign.content || '',
      type: campaign.type,
      audience: campaign.audience,
      sendImmediately: campaign.status === 'sent',
      scheduledTime: campaign.scheduledDate
    });
    setEmailCampaignDialogOpen(true);
  };

  const handleDeleteCampaign = async (campaignId) => {
    if (window.confirm('Are you sure you want to delete this campaign?')) {
      try {
        await adminService.deleteEmailCampaign(campaignId);
        fetchEmailCampaigns(1); // Refresh list
      } catch (error) {
        console.error('Failed to delete campaign:', error);
      }
    }
  };

  const handleEditContent = (content) => {
    setNewHelpContent({
      id: content.id,
      title: content.title,
      content: content.content || '',
      type: content.type,
      category: content.category,
      tags: content.tags || [],
      published: content.status === 'published'
    });
    setContentDialogOpen(true);
  };

  const handleDeleteContent = async (contentId) => {
    if (window.confirm('Are you sure you want to delete this content?')) {
      try {
        await adminService.deleteHelpContent(contentId);
        fetchHelpContent(1); // Refresh list
      } catch (error) {
        console.error('Failed to delete content:', error);
      }
    }
  };

  // Get safe arrays with default empty arrays
  const safeNotifications = Array.isArray(notifications) ? notifications : [];
  const safeEmailCampaigns = Array.isArray(emailCampaigns) ? emailCampaigns : [];
  const safeHelpContent = Array.isArray(helpContent) ? helpContent : [];
  
  // Compute real Quick Stats from backend data
  const totalContent = (communicationAnalytics?.notifications?.total || 0) + 
                       (communicationAnalytics?.campaigns?.total || 0) + 
                       (communicationAnalytics?.help?.total || 0);
  const userSatisfaction = communicationAnalytics?.help?.satisfactionRate 
    ? Math.round(communicationAnalytics.help.satisfactionRate) + '%' 
    : '—';
  const avgResponseTime = supportStats?.avgResponseTime || '—';
  const monthlyViews = communicationAnalytics?.help?.totalViews 
    ? communicationAnalytics.help.totalViews.toLocaleString() 
    : '—';

  // Utility functions
  const getTypeIcon = (type) => {
    switch (type) {
      case 'welcome':
        return <PersonAdd color="primary" />;
      case 'system':
        return <Settings color="info" />;
      case 'promotional':
        return <Campaign color="secondary" />;
      case 'announcement':
        return <Announcement color="warning" />;
      default:
        return <Notifications />;
    }
  };

  const getCampaignStatusColor = (status) => {
    return getStatusColor(status);
  };

  const getContentStatusColor = (status) => {
    return getStatusColor(status);
  };
  // Filter functions for local filtering (if needed)
  const getFilteredNotifications = () => {
    let filtered = safeNotifications;
    
    if (searchTerm) {
      filtered = filtered.filter(notification =>
        notification.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notification.message?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(notification => notification.status === statusFilter);
    }
    
    return filtered;
  };

  const getFilteredEmailCampaigns = () => {
    let filtered = safeEmailCampaigns;
    
    if (searchTerm) {
      filtered = filtered.filter(campaign =>
        campaign.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        campaign.subject?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(campaign => campaign.status === statusFilter);
    }
    
    return filtered;
  };

  const getFilteredHelpContent = () => {
    let filtered = safeHelpContent;
    
    if (searchTerm) {
      filtered = filtered.filter(content =>
        content.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        content.category?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(content => content.status === statusFilter);
    }
    
    return filtered;
  };

  // Event handlers
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'published':
      case 'sent':
      case 'active':
        return theme.palette.success.main;
      case 'draft':
        return theme.palette.warning.main;
      case 'scheduled':
        return theme.palette.info.main;
      case 'paused':
        return theme.palette.error.main;
      default:
        return theme.palette.text.secondary;
    }
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up': return <TrendingUp color="success" />;
      case 'down': return <TrendingDown color="error" />;
      default: return <TrendingDown color="warning" />;
    }
  };

  // Tab Panel component
  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" gutterBottom>
          {t('admin.tabs.content')}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<Analytics />}
            onClick={() => console.log('View analytics')}
          >
            Analytics
          </Button>
          <Button
            variant="outlined"
            startIcon={<Template />}
            onClick={() => setTemplateDialogOpen(true)}
          >
            Templates
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleCreateContent}
          >
            Create Content
          </Button>
        </Box>
      </Box>

      {/* Quick Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #6366f111, transparent)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" fontWeight="bold" color="primary">
                    {totalContent || '—'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Content
                  </Typography>
                </Box>
                <Article sx={{ fontSize: 32, color: theme.palette.primary.main, opacity: 0.7 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #10b98111, transparent)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" fontWeight="bold" color="success.main">
                    {userSatisfaction}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    User Satisfaction
                  </Typography>
                </Box>
                <ThumbUp sx={{ fontSize: 32, color: theme.palette.success.main, opacity: 0.7 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #3b82f611, transparent)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" fontWeight="bold" color="info.main">
                    {avgResponseTime}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Avg Response Time
                  </Typography>
                </Box>
                <Schedule sx={{ fontSize: 32, color: theme.palette.info.main, opacity: 0.7 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #f59e0b11, transparent)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" fontWeight="bold" color="warning.main">
                    {monthlyViews}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Monthly Views
                  </Typography>
                </Box>
                <Visibility sx={{ fontSize: 32, color: theme.palette.warning.main, opacity: 0.7 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Card elevation={2}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange} 
            aria-label="content management tabs"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab icon={<Notifications />} label="War Room 🎯" />
            <Tab icon={<Notifications />} label="Notifications" />
            <Tab icon={<Email />} label="Email Campaigns" />
            <Tab icon={<Help />} label="Help Center" />
            <Tab icon={<ContactSupport />} label="Support" />
            <Tab icon={<Analytics />} label="Analytics" />
            <Tab icon={<Template />} label="Templates" />
          </Tabs>
        </Box>

        {/* War Room Tab */}
        <TabPanel value={activeTab} index={0}>
          <GrowthCommandCenter />
        </TabPanel>

        {/* Notifications Tab */}
        <TabPanel value={activeTab} index={1}>
          <Box sx={{ px: 3, py: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6">
                System Notifications
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  size="small"
                  placeholder="Search notifications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                />
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={statusFilter}
                    label="Status"
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <MenuItem value="all">All</MenuItem>
                    <MenuItem value="sent">Sent</MenuItem>
                    <MenuItem value="draft">Draft</MenuItem>
                    <MenuItem value="scheduled">Scheduled</MenuItem>
                  </Select>
                </FormControl>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={handleCreateNotification}
                >
                  Create Notification
                </Button>
              </Box>
            </Box>

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress />
              </Box>
            ) : getFilteredNotifications().length === 0 ? (
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center',
                py: 8,
                textAlign: 'center'
              }}>
                <Notifications sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" gutterBottom>No notifications yet</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Create your first notification to engage with your users
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={handleCreateNotification}
                >
                  Create Notification
                </Button>
              </Box>
            ) : (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Title</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Recipients</TableCell>
                      <TableCell align="right">Sent</TableCell>
                      <TableCell align="right">Opened</TableCell>
                      <TableCell align="right">Clicked</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {getFilteredNotifications().map((notification) => (
                      <TableRow key={notification.id || notification._id} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {getTypeIcon(notification.type)}
                            <Typography variant="subtitle2" sx={{ ml: 1 }}>
                              {notification.title}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={notification.type}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={notification.status}
                            size="small"
                            sx={{
                              backgroundColor: `${getStatusColor(notification.status)}20`,
                              color: getStatusColor(notification.status)
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {(notification.recipients || notification.targetAudience || 'all_users').replace('_', ' ')}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="subtitle2" fontWeight="bold">
                            {(notification.sent || 0).toLocaleString()}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2">
                            {(notification.opened || 0).toLocaleString()}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {notification.sent > 0 ? `${((notification.opened || 0) / notification.sent * 100).toFixed(1)}%` : '0%'}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2">
                            {(notification.clicked || 0).toLocaleString()}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {notification.opened > 0 ? `${((notification.clicked || 0) / notification.opened * 100).toFixed(1)}%` : '0%'}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="Edit">
                            <IconButton 
                              size="small"
                              onClick={() => handleEditNotification(notification)}
                            >
                              <Edit />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="View Metrics">
                            <IconButton size="small">
                              <Analytics />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton 
                              size="small" 
                              color="error"
                              onClick={() => handleDeleteNotification(notification.id || notification._id)}
                            >
                              <Delete />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        </TabPanel>

        {/* Email Campaigns Tab */}
        <TabPanel value={activeTab} index={2}>
          <Box sx={{ px: 3, py: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6">
                Email Campaigns
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  size="small"
                  placeholder="Search campaigns..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                />
                <Button
                  variant="contained"
                  startIcon={<Campaign />}
                  onClick={handleCreateCampaign}
                >
                  Create Campaign
                </Button>
              </Box>
            </Box>

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress />
              </Box>
            ) : getFilteredEmailCampaigns().length === 0 ? (
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center',
                py: 8,
                textAlign: 'center'
              }}>
                <Campaign sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" gutterBottom>No email campaigns yet</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Create your first email campaign to reach your users
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<Campaign />}
                  onClick={handleCreateCampaign}
                >
                  Create Campaign
                </Button>
              </Box>
            ) : (
              <Grid container spacing={3}>
                {getFilteredEmailCampaigns().map((campaign) => (
                  <Grid item xs={12} md={6} key={campaign.id || campaign._id}>
                    <Card>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                          <Typography variant="h6">
                            {campaign.name}
                          </Typography>
                          <Chip
                            label={campaign.status}
                            size="small"
                            sx={{
                              backgroundColor: `${getStatusColor(campaign.status)}20`,
                              color: getStatusColor(campaign.status)
                            }}
                          />
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {campaign.subject}
                        </Typography>
                        
                        <Grid container spacing={2} sx={{ mb: 2 }}>
                          <Grid item xs={6}>
                            <Typography variant="caption" color="text.secondary">
                              Sent
                            </Typography>
                            <Typography variant="h6">
                              {campaign.sent.toLocaleString()}
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="caption" color="text.secondary">
                              Open Rate
                            </Typography>
                            <Typography variant="h6">
                              {campaign.sent > 0 ? Math.round((campaign.opened / campaign.sent) * 100) : 0}%
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="caption" color="text.secondary">
                              Click Rate
                            </Typography>
                            <Typography variant="h6">
                              {campaign.opened > 0 ? Math.round((campaign.clicked / campaign.opened) * 100) : 0}%
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="caption" color="text.secondary">
                              Revenue
                            </Typography>
                            <Typography variant="h6" color="success.main">
                              €{campaign.revenue.toLocaleString()}
                            </Typography>
                          </Grid>
                        </Grid>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body2" color="text.secondary">
                            {new Date(campaign.sentDate).toLocaleDateString()}
                          </Typography>
                          <Box>
                            <IconButton 
                              size="small"
                              onClick={() => handleEditCampaign(campaign)}
                            >
                              <Edit />
                            </IconButton>
                            <IconButton size="small">
                              <Analytics />
                            </IconButton>
                            <IconButton size="small">
                              <Preview />
                            </IconButton>
                            <IconButton 
                              size="small" 
                              color="error"
                              onClick={() => handleDeleteCampaign(campaign.id || campaign._id)}
                            >
                              <Delete />
                            </IconButton>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        </TabPanel>

        {/* Help Center Tab */}
        <TabPanel value={activeTab} index={3}>
          <Box sx={{ px: 3, py: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6">
                Help Center Content
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  size="small"
                  placeholder="Search content..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                />
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={statusFilter}
                    label="Status"
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <MenuItem value="all">All</MenuItem>
                    <MenuItem value="published">Published</MenuItem>
                    <MenuItem value="draft">Draft</MenuItem>
                  </Select>
                </FormControl>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={handleCreateContent}
                >
                  Create Content
                </Button>
              </Box>
            </Box>

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress />
              </Box>
            ) : getFilteredHelpContent().length === 0 ? (
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center',
                py: 8,
                textAlign: 'center'
              }}>
                <Article sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" gutterBottom>No help articles yet</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Create your first help article to assist your users
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={handleCreateContent}
                >
                  Create Content
                </Button>
              </Box>
            ) : (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Title</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Category</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="right">Views</TableCell>
                      <TableCell align="right">Helpful</TableCell>
                      <TableCell>Last Updated</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {getFilteredHelpContent().map((content) => (
                      <TableRow key={content.id || content._id} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {getTypeIcon(content.type)}
                            <Typography variant="subtitle2" sx={{ ml: 1 }}>
                              {content.title}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={content.type}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {content.category}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={content.status}
                            size="small"
                            sx={{
                              backgroundColor: `${getStatusColor(content.status)}20`,
                              color: getStatusColor(content.status)
                            }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="subtitle2">
                            {content.views.toLocaleString()}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                            <Typography variant="body2" color="success.main" sx={{ mr: 1 }}>
                              {content.helpful}
                            </Typography>
                            <Typography variant="body2" color="error.main">
                              {content.notHelpful}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {new Date(content.lastUpdated).toLocaleDateString()}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            by {content.author}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="Edit">
                            <IconButton 
                              size="small"
                              onClick={() => handleEditContent(content)}
                            >
                              <Edit />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Preview">
                            <IconButton size="small">
                              <Preview />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="View Metrics">
                            <IconButton size="small">
                              <Analytics />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton 
                              size="small" 
                              color="error"
                              onClick={() => handleDeleteContent(content.id || content._id)}
                            >
                              <Delete />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        </TabPanel>

        {/* Support Tab */}
        <TabPanel value={activeTab} index={4}>
          <Box sx={{ px: 3, py: 2 }}>
            <Typography variant="h6" gutterBottom fontWeight={700}>Support Tickets</Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}><AdminSupportPanel /></Grid>
              <Grid item xs={12} md={4}><AISupportAnalyzer /></Grid>
            </Grid>
          </Box>
        </TabPanel>

        {/* Analytics Tab */}
        <TabPanel value={activeTab} index={5}>
          <Box sx={{ px: 3, py: 2 }}>
            {/* Date Range Selector */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6">Communication Analytics</Typography>
              <ButtonGroup variant="outlined" size="small">
                <Button 
                  variant={analyticsRange === '1m' ? 'contained' : 'outlined'}
                  onClick={() => {
                    setAnalyticsRange('1m');
                    if (fetchCommunicationAnalytics) fetchCommunicationAnalytics('1m');
                  }}
                >
                  1M
                </Button>
                <Button 
                  variant={analyticsRange === '3m' ? 'contained' : 'outlined'}
                  onClick={() => {
                    setAnalyticsRange('3m');
                    if (fetchCommunicationAnalytics) fetchCommunicationAnalytics('3m');
                  }}
                >
                  3M
                </Button>
                <Button 
                  variant={analyticsRange === '6m' ? 'contained' : 'outlined'}
                  onClick={() => {
                    setAnalyticsRange('6m');
                    if (fetchCommunicationAnalytics) fetchCommunicationAnalytics('6m');
                  }}
                >
                  6M
                </Button>
                <Button 
                  variant={analyticsRange === '1y' ? 'contained' : 'outlined'}
                  onClick={() => {
                    setAnalyticsRange('1y');
                    if (fetchCommunicationAnalytics) fetchCommunicationAnalytics('1y');
                  }}
                >
                  1Y
                </Button>
              </ButtonGroup>
            </Box>

            {!communicationAnalytics || Object.keys(communicationAnalytics).length === 0 ? (
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center',
                py: 8,
                textAlign: 'center'
              }}>
                <Analytics sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" gutterBottom>No analytics data yet</Typography>
                <Typography variant="body2" color="text.secondary">
                  Data will appear once notifications and campaigns are sent.
                </Typography>
              </Box>
            ) : (
              <>
                {/* Row 1: KPI Metric Cards */}
                <Grid container spacing={3} sx={{ mb: 3 }}>
                  {/* Total Sent */}
                  <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ 
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: '#fff',
                      position: 'relative',
                      overflow: 'hidden'
                    }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                          <Box>
                            <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>Total Sent</Typography>
                            <Typography variant="h4" fontWeight={700}>
                              {((communicationAnalytics?.notifications?.metrics?.totalSent || 0) + 
                                (communicationAnalytics?.campaigns?.metrics?.totalSent || 0)).toLocaleString()}
                            </Typography>
                          </Box>
                          <Email sx={{ fontSize: 40, opacity: 0.3 }} />
                        </Box>
                        <Typography variant="caption" sx={{ opacity: 0.8 }}>
                          {(communicationAnalytics?.notifications?.sent || 0) + (communicationAnalytics?.campaigns?.sent || 0)} campaigns sent
                        </Typography>
                        <LinearProgress 
                          variant="determinate" 
                          value={100} 
                          sx={{ 
                            mt: 1, 
                            bgcolor: 'rgba(255,255,255,0.2)', 
                            '& .MuiLinearProgress-bar': { bgcolor: '#fff' } 
                          }} 
                        />
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Avg Open Rate */}
                  <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ 
                      background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                      color: '#fff',
                      position: 'relative',
                      overflow: 'hidden'
                    }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                          <Box>
                            <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>Avg Open Rate</Typography>
                            <Typography variant="h4" fontWeight={700}>
                              {Math.round(((communicationAnalytics?.notifications?.openRate || 0) + 
                                (communicationAnalytics?.campaigns?.openRate || 0)) / 2)}%
                            </Typography>
                          </Box>
                          <RemoveRedEye sx={{ fontSize: 40, opacity: 0.3 }} />
                        </Box>
                        <Typography variant="caption" sx={{ opacity: 0.8 }}>
                          Notifications + Campaigns
                        </Typography>
                        <LinearProgress 
                          variant="determinate" 
                          value={Math.round(((communicationAnalytics?.notifications?.openRate || 0) + 
                            (communicationAnalytics?.campaigns?.openRate || 0)) / 2)} 
                          sx={{ 
                            mt: 1, 
                            bgcolor: 'rgba(255,255,255,0.2)', 
                            '& .MuiLinearProgress-bar': { bgcolor: '#fff' } 
                          }} 
                        />
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Avg Click Rate */}
                  <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ 
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      color: '#fff',
                      position: 'relative',
                      overflow: 'hidden'
                    }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                          <Box>
                            <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>Avg Click Rate</Typography>
                            <Typography variant="h4" fontWeight={700}>
                              {Math.round(((communicationAnalytics?.notifications?.clickRate || 0) + 
                                (communicationAnalytics?.campaigns?.clickRate || 0)) / 2)}%
                            </Typography>
                          </Box>
                          <TrendingUp sx={{ fontSize: 40, opacity: 0.3 }} />
                        </Box>
                        <Typography variant="caption" sx={{ opacity: 0.8 }}>
                          Combined engagement
                        </Typography>
                        <LinearProgress 
                          variant="determinate" 
                          value={Math.round(((communicationAnalytics?.notifications?.clickRate || 0) + 
                            (communicationAnalytics?.campaigns?.clickRate || 0)) / 2)} 
                          sx={{ 
                            mt: 1, 
                            bgcolor: 'rgba(255,255,255,0.2)', 
                            '& .MuiLinearProgress-bar': { bgcolor: '#fff' } 
                          }} 
                        />
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Help Article Views */}
                  <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ 
                      background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                      color: '#fff',
                      position: 'relative',
                      overflow: 'hidden'
                    }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                          <Box>
                            <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>Help Article Views</Typography>
                            <Typography variant="h4" fontWeight={700}>
                              {(communicationAnalytics?.helpContent?.metrics?.totalViews || 0).toLocaleString()}
                            </Typography>
                          </Box>
                          <Article sx={{ fontSize: 40, opacity: 0.3 }} />
                        </Box>
                        <Typography variant="caption" sx={{ opacity: 0.8 }}>
                          {communicationAnalytics?.helpContent?.helpfulRate || 0}% satisfaction
                        </Typography>
                        <LinearProgress 
                          variant="determinate" 
                          value={communicationAnalytics?.helpContent?.helpfulRate || 0} 
                          sx={{ 
                            mt: 1, 
                            bgcolor: 'rgba(255,255,255,0.2)', 
                            '& .MuiLinearProgress-bar': { bgcolor: '#fff' } 
                          }} 
                        />
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>

                {/* Row 2: Charts */}
                <Grid container spacing={3} sx={{ mb: 3 }}>
                  {/* Left: Engagement Over Time */}
                  <Grid item xs={12} lg={8}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Engagement Over Time
                        </Typography>
                        <Box sx={{ height: 400 }}>
                          {!communicationAnalytics?.emailMetrics || communicationAnalytics.emailMetrics.length === 0 ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                              <Typography variant="body2" color="text.secondary">No data yet</Typography>
                            </Box>
                          ) : (
                            <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={communicationAnalytics.emailMetrics}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <RechartsTooltip />
                                <Area
                                  type="monotone"
                                  dataKey="totalSent"
                                  stackId="1"
                                  stroke="#667eea"
                                  fill="#667eea"
                                  fillOpacity={0.6}
                                  name="Total Sent"
                                />
                                <Area
                                  type="monotone"
                                  dataKey="opened"
                                  stackId="1"
                                  stroke="#3b82f6"
                                  fill="#3b82f6"
                                  fillOpacity={0.6}
                                  name="Opened"
                                />
                                <Area
                                  type="monotone"
                                  dataKey="clicked"
                                  stackId="1"
                                  stroke="#10b981"
                                  fill="#10b981"
                                  fillOpacity={0.6}
                                  name="Clicked"
                                />
                              </AreaChart>
                            </ResponsiveContainer>
                          )}
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Right: Content Performance */}
                  <Grid item xs={12} lg={4}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Content Performance
                        </Typography>
                        <Box sx={{ height: 400 }}>
                          {!communicationAnalytics?.contentPerformance || communicationAnalytics.contentPerformance.length === 0 ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                              <Typography variant="body2" color="text.secondary">No data yet</Typography>
                            </Box>
                          ) : (
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={communicationAnalytics.contentPerformance} layout="horizontal">
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" />
                                <YAxis dataKey="name" type="category" width={80} />
                                <RechartsTooltip 
                                  formatter={(value, name, props) => {
                                    if (name === 'views') return [value, 'Views'];
                                    return [value, name];
                                  }}
                                  labelFormatter={(label) => `Type: ${label}`}
                                />
                                <Bar dataKey="views" fill="#3b82f6" />
                              </BarChart>
                            </ResponsiveContainer>
                          )}
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>

                {/* Row 3: Three Panels */}
                <Grid container spacing={3} sx={{ mb: 3 }}>
                  {/* Panel 1: Top Articles */}
                  <Grid item xs={12} md={4}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Star sx={{ color: '#f59e0b' }} />
                          Top Articles
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        {!communicationAnalytics?.topArticles || communicationAnalytics.topArticles.length === 0 ? (
                          <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>
                            No articles yet
                          </Typography>
                        ) : (
                          <List dense>
                            {communicationAnalytics.topArticles.slice(0, 5).map((article, idx) => (
                              <ListItem key={idx} sx={{ px: 0 }}>
                                <Box sx={{ width: '100%' }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                    <Chip 
                                      label={article.type} 
                                      size="small" 
                                      sx={{ 
                                        bgcolor: article.type === 'article' ? '#3b82f6' : 
                                                 article.type === 'guide' ? '#10b981' : 
                                                 article.type === 'faq' ? '#f59e0b' : '#667eea',
                                        color: '#fff',
                                        fontWeight: 600,
                                        fontSize: 10
                                      }} 
                                    />
                                    <Typography variant="body2" fontWeight={600} sx={{ flex: 1 }}>
                                      {article.title}
                                    </Typography>
                                  </Box>
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography variant="caption" color="text.secondary">
                                      {article.views} views
                                    </Typography>
                                    <LinearProgress 
                                      variant="determinate" 
                                      value={(article.helpful / (article.helpful + article.notHelpful)) * 100 || 0} 
                                      sx={{ width: 60, height: 4, borderRadius: 2 }}
                                    />
                                  </Box>
                                </Box>
                              </ListItem>
                            ))}
                          </List>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Panel 2: Recent Notifications */}
                  <Grid item xs={12} md={4}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Notifications sx={{ color: '#667eea' }} />
                          Recent Notifications
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        {!communicationAnalytics?.recentNotifications || communicationAnalytics.recentNotifications.length === 0 ? (
                          <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>
                            No notifications yet
                          </Typography>
                        ) : (
                          <List dense>
                            {communicationAnalytics.recentNotifications.slice(0, 5).map((notif, idx) => (
                              <ListItem key={idx} sx={{ px: 0, flexDirection: 'column', alignItems: 'flex-start', mb: 1 }}>
                                <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5 }}>
                                  {notif.title}
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                                  <Typography variant="caption" color="text.secondary">
                                    {notif.sent} sent / {notif.opened} opened
                                  </Typography>
                                  <Chip 
                                    label={new Date(notif.createdAt).toLocaleDateString()} 
                                    size="small" 
                                    variant="outlined"
                                    sx={{ height: 18, fontSize: 10 }}
                                  />
                                </Box>
                              </ListItem>
                            ))}
                          </List>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Panel 3: Recent Campaigns */}
                  <Grid item xs={12} md={4}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Campaign sx={{ color: '#10b981' }} />
                          Recent Campaigns
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        {!communicationAnalytics?.recentCampaigns || communicationAnalytics.recentCampaigns.length === 0 ? (
                          <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>
                            No campaigns yet
                          </Typography>
                        ) : (
                          <List dense>
                            {communicationAnalytics.recentCampaigns.slice(0, 5).map((campaign, idx) => (
                              <ListItem key={idx} sx={{ px: 0, flexDirection: 'column', alignItems: 'flex-start', mb: 1 }}>
                                <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5 }}>
                                  {campaign.subject}
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                                  <Typography variant="caption" color="text.secondary">
                                    {campaign.sent} sent / {campaign.opened} opened
                                  </Typography>
                                  <Chip 
                                    label={new Date(campaign.createdAt).toLocaleDateString()} 
                                    size="small" 
                                    variant="outlined"
                                    sx={{ height: 18, fontSize: 10 }}
                                  />
                                </Box>
                              </ListItem>
                            ))}
                          </List>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>

                {/* Row 4: Channel Comparison Funnel */}
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Channel Comparison — Engagement Funnel
                    </Typography>
                    <Divider sx={{ mb: 3 }} />
                    <Grid container spacing={4}>
                      {/* Notifications Funnel */}
                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" fontWeight={600} gutterBottom sx={{ color: '#667eea' }}>
                          Notifications Funnel
                        </Typography>
                        <Box sx={{ mt: 2 }}>
                          {/* Sent */}
                          <Box sx={{ mb: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                              <Typography variant="body2">Sent</Typography>
                              <Typography variant="body2" fontWeight={600}>
                                {communicationAnalytics?.notifications?.metrics?.totalSent || 0}
                              </Typography>
                            </Box>
                            <LinearProgress variant="determinate" value={100} sx={{ height: 8, borderRadius: 4 }} />
                          </Box>
                          {/* Opened */}
                          <Box sx={{ mb: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                              <Typography variant="body2">Opened</Typography>
                              <Typography variant="body2" fontWeight={600}>
                                {communicationAnalytics?.notifications?.metrics?.totalOpened || 0} 
                                <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                                  ({communicationAnalytics?.notifications?.openRate || 0}%)
                                </Typography>
                              </Typography>
                            </Box>
                            <LinearProgress 
                              variant="determinate" 
                              value={communicationAnalytics?.notifications?.openRate || 0} 
                              sx={{ height: 8, borderRadius: 4 }} 
                            />
                          </Box>
                          {/* Clicked */}
                          <Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                              <Typography variant="body2">Clicked</Typography>
                              <Typography variant="body2" fontWeight={600}>
                                {communicationAnalytics?.notifications?.metrics?.totalClicked || 0}
                                <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                                  ({communicationAnalytics?.notifications?.clickRate || 0}%)
                                </Typography>
                              </Typography>
                            </Box>
                            <LinearProgress 
                              variant="determinate" 
                              value={communicationAnalytics?.notifications?.clickRate || 0} 
                              sx={{ height: 8, borderRadius: 4 }} 
                            />
                          </Box>
                        </Box>
                      </Grid>

                      {/* Campaigns Funnel */}
                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" fontWeight={600} gutterBottom sx={{ color: '#10b981' }}>
                          Campaigns Funnel
                        </Typography>
                        <Box sx={{ mt: 2 }}>
                          {/* Sent */}
                          <Box sx={{ mb: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                              <Typography variant="body2">Sent</Typography>
                              <Typography variant="body2" fontWeight={600}>
                                {communicationAnalytics?.campaigns?.metrics?.totalSent || 0}
                              </Typography>
                            </Box>
                            <LinearProgress variant="determinate" value={100} sx={{ height: 8, borderRadius: 4, '& .MuiLinearProgress-bar': { bgcolor: '#10b981' } }} />
                          </Box>
                          {/* Opened */}
                          <Box sx={{ mb: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                              <Typography variant="body2">Opened</Typography>
                              <Typography variant="body2" fontWeight={600}>
                                {communicationAnalytics?.campaigns?.metrics?.totalOpened || 0}
                                <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                                  ({communicationAnalytics?.campaigns?.openRate || 0}%)
                                </Typography>
                              </Typography>
                            </Box>
                            <LinearProgress 
                              variant="determinate" 
                              value={communicationAnalytics?.campaigns?.openRate || 0} 
                              sx={{ height: 8, borderRadius: 4, '& .MuiLinearProgress-bar': { bgcolor: '#10b981' } }} 
                            />
                          </Box>
                          {/* Clicked */}
                          <Box sx={{ mb: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                              <Typography variant="body2">Clicked</Typography>
                              <Typography variant="body2" fontWeight={600}>
                                {communicationAnalytics?.campaigns?.metrics?.totalClicked || 0}
                                <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                                  ({communicationAnalytics?.campaigns?.clickRate || 0}%)
                                </Typography>
                              </Typography>
                            </Box>
                            <LinearProgress 
                              variant="determinate" 
                              value={communicationAnalytics?.campaigns?.clickRate || 0} 
                              sx={{ height: 8, borderRadius: 4, '& .MuiLinearProgress-bar': { bgcolor: '#10b981' } }} 
                            />
                          </Box>
                          {/* Converted */}
                          <Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                              <Typography variant="body2">Converted</Typography>
                              <Typography variant="body2" fontWeight={600}>
                                {communicationAnalytics?.campaigns?.metrics?.totalConverted || 0}
                                <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                                  ({communicationAnalytics?.campaigns?.conversionRate || 0}%)
                                </Typography>
                              </Typography>
                            </Box>
                            <LinearProgress 
                              variant="determinate" 
                              value={communicationAnalytics?.campaigns?.conversionRate || 0} 
                              sx={{ height: 8, borderRadius: 4, '& .MuiLinearProgress-bar': { bgcolor: '#10b981' } }} 
                            />
                          </Box>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </>
            )}
          </Box>
        </TabPanel>

        {/* Templates Tab */}
        <TabPanel value={activeTab} index={6}>
          <Box sx={{ px: 3, py: 2 }}>
            <AITemplateDrafter onResult={(template) => {/* could open template preview */}} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6">
                Content Templates Library
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Chip 
                  label="All" 
                  onClick={() => setTemplateFilter('all')}
                  color={templateFilter === 'all' ? 'primary' : 'default'}
                  sx={{ cursor: 'pointer' }}
                />
                <Chip 
                  label="Notification" 
                  onClick={() => setTemplateFilter('notification')}
                  color={templateFilter === 'notification' ? 'primary' : 'default'}
                  sx={{ cursor: 'pointer' }}
                />
                <Chip 
                  label="Email Campaign" 
                  onClick={() => setTemplateFilter('campaign')}
                  color={templateFilter === 'campaign' ? 'primary' : 'default'}
                  sx={{ cursor: 'pointer' }}
                />
                <Chip 
                  label="Help Article" 
                  onClick={() => setTemplateFilter('help')}
                  color={templateFilter === 'help' ? 'primary' : 'default'}
                  sx={{ cursor: 'pointer' }}
                />
              </Box>
            </Box>

            <Grid container spacing={3}>
              {BUILT_IN_TEMPLATES
                .filter(t => templateFilter === 'all' || t.type === templateFilter)
                .map((template) => (
                  <Grid item xs={12} md={6} lg={4} key={template.id}>
                    <Card sx={{ 
                      height: '100%', 
                      display: 'flex', 
                      flexDirection: 'column',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 6
                      }
                    }}>
                      {/* Gradient header */}
                      <Box sx={{ 
                        height: 8,
                        background: template.type === 'notification' ? 
                          'linear-gradient(90deg, #667eea 0%, #764ba2 100%)' :
                          template.type === 'campaign' ? 
                          'linear-gradient(90deg, #3b82f6 0%, #2563eb 100%)' :
                          'linear-gradient(90deg, #10b981 0%, #059669 100%)'
                      }} />
                      
                      <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        {/* Icon + Title */}
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
                          <Typography variant="h3">{template.icon}</Typography>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="h6" fontWeight={600} gutterBottom>
                              {template.title}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 0.5, mb: 1 }}>
                              <Chip 
                                label={template.category} 
                                size="small" 
                                sx={{ fontSize: 10, height: 20 }}
                              />
                              <Chip 
                                label={template.type === 'notification' ? 'Notification' : 
                                       template.type === 'campaign' ? 'Email Campaign' : 'Help Article'} 
                                size="small" 
                                variant="outlined"
                                sx={{ fontSize: 10, height: 20 }}
                              />
                            </Box>
                          </Box>
                        </Box>

                        {/* Preview text */}
                        <Typography 
                          variant="body2" 
                          color="text.secondary" 
                          sx={{ 
                            mb: 2, 
                            flex: 1,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                          }}
                        >
                          {template.preview || template.message || template.body}
                        </Typography>

                        {/* Action buttons */}
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button 
                            variant="contained" 
                            size="small" 
                            fullWidth
                            startIcon={<Add />}
                            onClick={() => handleUseTemplate(template)}
                          >
                            Use Template
                          </Button>
                          <Button 
                            variant="outlined" 
                            size="small"
                            onClick={() => setPreviewTemplate(template)}
                          >
                            <Preview />
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
            </Grid>
          </Box>
        </TabPanel>

        {/* Template Preview Dialog */}
        <Dialog
          open={!!previewTemplate}
          onClose={() => setPreviewTemplate(null)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="h4">{previewTemplate?.icon}</Typography>
              <Box>
                <Typography variant="h6">{previewTemplate?.title}</Typography>
                <Chip label={previewTemplate?.category} size="small" sx={{ mt: 0.5 }} />
              </Box>
            </Box>
          </DialogTitle>
          <DialogContent dividers>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
              {previewTemplate?.message || previewTemplate?.body || previewTemplate?.content}
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setPreviewTemplate(null)}>Close</Button>
            <Button 
              variant="contained" 
              onClick={() => {
                handleUseTemplate(previewTemplate);
                setPreviewTemplate(null);
              }}
            >
              Use This Template
            </Button>
          </DialogActions>
        </Dialog>
      </Card>

      {/* Create Notification Dialog */}
      <Dialog
        open={notificationDialogOpen}
        onClose={() => setNotificationDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #7c3aed 0%, #3b82f6 100%)',
          color: '#fff', 
          borderRadius: '12px 12px 0 0', 
          p: 3
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Notifications sx={{ fontSize: 28 }} />
              <Box>
                <Typography variant="h6" fontWeight={700}>
                  {newNotification.id ? 'Edit Notification' : 'Create Notification'}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  Broadcast a message to your users
                </Typography>
              </Box>
            </Box>
            <IconButton onClick={() => setNotificationDialogOpen(false)} sx={{ color: '#fff' }}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 3, pt: 2 }}>
          <AINotificationDrafter onResult={(draft) => setNewNotification(prev => ({
            ...prev,
            title: draft.title || prev.title,
            message: draft.message || prev.message,
            type: draft.type || prev.type,
            targetAudience: draft.targetAudience || prev.targetAudience,
          }))} />
          <Divider sx={{ my: 2 }}><Chip label="or edit manually" size="small" /></Divider>
          <Grid container spacing={3} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Title"
                variant="outlined"
                value={newNotification.title}
                onChange={(e) => setNewNotification({ ...newNotification, title: e.target.value })}
                required
                helperText="Keep it short and action-oriented"
              />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block', textAlign: 'right' }}>
                {newNotification.title.length}/100
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Message / HTML Body"
                variant="outlined"
                multiline
                rows={8}
                value={newNotification.message}
                onChange={(e) => setNewNotification({ ...newNotification, message: e.target.value })}
                required
                inputProps={{ style: { fontFamily: 'monospace', fontSize: 13 } }}
                helperText="Plain text or raw HTML/CSS — rendered as-is in the email body"
              />
              <Typography variant="caption" color={newNotification.message.length > 9800 ? 'error' : 'text.secondary'} sx={{ mt: 0.5, display: 'block', textAlign: 'right' }}>
                {newNotification.message.length}/10000
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
                Call-to-Action Button
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={5}>
                  <TextField
                    fullWidth
                    label="Button Label"
                    variant="outlined"
                    value={newNotification.actionLabel}
                    onChange={(e) => setNewNotification({ ...newNotification, actionLabel: e.target.value })}
                    placeholder="Open My Dashboard"
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={7}>
                  <TextField
                    fullWidth
                    label="Button URL"
                    variant="outlined"
                    value={newNotification.actionUrl}
                    onChange={(e) => setNewNotification({ ...newNotification, actionUrl: e.target.value })}
                    placeholder="https://www.soldikeeper.com/dashboard"
                    size="small"
                  />
                </Grid>
              </Grid>
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
                Notification Type
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {['system', 'promotional', 'alert', 'update', 'welcome'].map((type) => (
                  <Chip
                    key={type}
                    label={type.charAt(0).toUpperCase() + type.slice(1)}
                    variant={newNotification.type === type ? 'filled' : 'outlined'}
                    onClick={() => setNewNotification({ ...newNotification, type })}
                    sx={{
                      ...(newNotification.type === type && {
                        background: 'linear-gradient(135deg, #7c3aed, #3b82f6)',
                        color: '#fff',
                        fontWeight: 600
                      })
                    }}
                  />
                ))}
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
                Target Audience
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {[
                  { value: 'all_users', label: '👥 All Users' },
                  { value: 'free_users', label: '🎁 Free Users' },
                  { value: 'premium_users', label: '⭐ Premium Users' },
                  { value: 'new_users', label: '🆕 New Users' },
                  { value: 'active_users', label: '✅ Active Users' },
                  { value: 'inactive_users', label: '💤 Inactive Users' }
                ].map((audience) => (
                  <Chip
                    key={audience.value}
                    label={audience.label}
                    variant={newNotification.targetAudience === audience.value ? 'filled' : 'outlined'}
                    onClick={() => setNewNotification({ ...newNotification, targetAudience: audience.value })}
                    sx={{
                      ...(newNotification.targetAudience === audience.value && {
                        background: 'linear-gradient(135deg, #7c3aed, #3b82f6)',
                        color: '#fff',
                        fontWeight: 600
                      })
                    }}
                  />
                ))}
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Card sx={{ bgcolor: 'action.hover', borderRadius: 2, p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="subtitle2" fontWeight={600}>
                      {newNotification.sendImmediately ? 'Send now' : 'Save as draft'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {newNotification.sendImmediately 
                        ? 'Notification will be sent to users immediately' 
                        : 'Save for later and send when ready'}
                    </Typography>
                  </Box>
                  <Switch
                    checked={newNotification.sendImmediately}
                    onChange={(e) => setNewNotification({ ...newNotification, sendImmediately: e.target.checked })}
                  />
                </Box>
              </Card>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button onClick={() => setNotificationDialogOpen(false)} size="large">
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleSubmitNotification}
            size="large"
            sx={{ 
              background: 'linear-gradient(135deg, #7c3aed, #3b82f6)', 
              color: '#fff',
              fontWeight: 600
            }}
          >
            {newNotification.sendImmediately ? '🚀 Send Now' : '💾 Save as Draft'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Email Campaign Dialog */}
      <Dialog
        open={emailCampaignDialogOpen}
        onClose={() => setEmailCampaignDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #7c3aed 0%, #3b82f6 100%)',
          color: '#fff', 
          borderRadius: '12px 12px 0 0', 
          p: 3
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Email sx={{ fontSize: 28 }} />
              <Box>
                <Typography variant="h6" fontWeight={700}>
                  {newEmailCampaign.id ? 'Edit Campaign' : 'Create Email Campaign'}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  Design and send targeted email campaigns
                </Typography>
              </Box>
            </Box>
            <IconButton onClick={() => setEmailCampaignDialogOpen(false)} sx={{ color: '#fff' }}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 3, pt: 2 }}>
          <AICampaignDrafter onResult={(draft) => setNewEmailCampaign(prev => ({
            ...prev,
            name: draft.subject || prev.name,
            subject: draft.subject || prev.subject,
            content: draft.body || prev.content,
          }))} />
          <Divider sx={{ my: 2 }}><Chip label="or edit manually" size="small" /></Divider>
          <Grid container spacing={3} sx={{ mt: 0.5 }}>
            <Grid item xs={12} md={7}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Campaign Name"
                    variant="outlined"
                    value={newEmailCampaign.name}
                    onChange={(e) => setNewEmailCampaign({ ...newEmailCampaign, name: e.target.value })}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Subject Line"
                    variant="outlined"
                    value={newEmailCampaign.subject}
                    onChange={(e) => setNewEmailCampaign({ ...newEmailCampaign, subject: e.target.value })}
                    required
                    InputProps={{
                      startAdornment: <Email sx={{ mr: 1, color: 'text.secondary' }} />
                    }}
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block', textAlign: 'right' }}>
                    {newEmailCampaign.subject.length}/200
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email Content"
                    variant="outlined"
                    multiline
                    rows={10}
                    value={newEmailCampaign.content}
                    onChange={(e) => setNewEmailCampaign({ ...newEmailCampaign, content: e.target.value })}
                    required
                    placeholder="Write your email content here..."
                    helperText="Use plain text. Your content will be beautifully formatted in the email."
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
                    Campaign Type
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {[
                      { value: 'newsletter', label: 'Newsletter' },
                      { value: 'promotional', label: 'Promotional' },
                      { value: 'feature_announcement', label: 'Announcement' },
                      { value: 'transactional', label: 'Transactional' }
                    ].map(({ value, label }) => (
                      <Chip
                        key={value}
                        label={label}
                        variant={newEmailCampaign.type === value ? 'filled' : 'outlined'}
                        onClick={() => setNewEmailCampaign({ ...newEmailCampaign, type: value })}
                        sx={{
                          ...(newEmailCampaign.type === value && {
                            background: 'linear-gradient(135deg, #7c3aed, #3b82f6)',
                            color: '#fff',
                            fontWeight: 600
                          })
                        }}
                      />
                    ))}
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
                    Target Audience
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {[
                      { value: 'all_users', label: '👥 All Users' },
                      { value: 'free_users', label: '🎁 Free Users' },
                      { value: 'premium_users', label: '⭐ Premium Users' },
                      { value: 'new_users', label: '🆕 New Users' }
                    ].map((audience) => (
                      <Chip
                        key={audience.value}
                        label={audience.label}
                        variant={newEmailCampaign.audience === audience.value ? 'filled' : 'outlined'}
                        onClick={() => setNewEmailCampaign({ ...newEmailCampaign, audience: audience.value })}
                        sx={{
                          ...(newEmailCampaign.audience === audience.value && {
                            background: 'linear-gradient(135deg, #7c3aed, #3b82f6)',
                            color: '#fff',
                            fontWeight: 600
                          })
                        }}
                      />
                    ))}
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Card sx={{ bgcolor: 'action.hover', borderRadius: 2, p: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box>
                        <Typography variant="subtitle2" fontWeight={600}>
                          {newEmailCampaign.sendImmediately ? 'Send now' : 'Save as draft'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {newEmailCampaign.sendImmediately 
                            ? 'Campaign will be sent to users immediately' 
                            : 'Save for later and send when ready'}
                        </Typography>
                      </Box>
                      <Switch
                        checked={newEmailCampaign.sendImmediately}
                        onChange={(e) => setNewEmailCampaign({ ...newEmailCampaign, sendImmediately: e.target.checked })}
                      />
                    </Box>
                  </Card>
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={12} md={5}>
              <Card sx={{ 
                bgcolor: 'background.paper', 
                borderRadius: 2, 
                p: 2, 
                border: '1px solid',
                borderColor: 'divider',
                height: '100%'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <RemoveRedEye sx={{ fontSize: 20, color: 'primary.main' }} />
                  <Typography variant="subtitle2" fontWeight={600}>
                    Email Preview
                  </Typography>
                </Box>
                <Box sx={{ 
                  background: 'linear-gradient(135deg, #7c3aed 0%, #3b82f6 100%)',
                  borderRadius: 1.5,
                  p: 2,
                  mb: 2
                }}>
                  <Typography variant="subtitle2" sx={{ color: '#fff', fontWeight: 600, mb: 0.5 }}>
                    {newEmailCampaign.subject || 'Your subject line will appear here'}
                  </Typography>
                </Box>
                <Box sx={{ 
                  bgcolor: 'action.hover',
                  borderRadius: 1.5,
                  p: 2,
                  minHeight: 200,
                  maxHeight: 400,
                  overflow: 'auto'
                }}>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', color: 'text.secondary' }}>
                    {newEmailCampaign.content 
                      ? newEmailCampaign.content.slice(0, 200) + (newEmailCampaign.content.length > 200 ? '...' : '')
                      : 'Your email content preview will appear here...'}
                  </Typography>
                </Box>
              </Card>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button onClick={() => setEmailCampaignDialogOpen(false)} size="large">
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleSubmitEmailCampaign}
            size="large"
            sx={{ 
              background: 'linear-gradient(135deg, #7c3aed, #3b82f6)', 
              color: '#fff',
              fontWeight: 600
            }}
          >
            {newEmailCampaign.sendImmediately ? '📧 Send Campaign' : '💾 Save Draft'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Content Dialog */}
      <Dialog
        open={contentDialogOpen}
        onClose={() => setContentDialogOpen(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #7c3aed 0%, #3b82f6 100%)',
          color: '#fff', 
          borderRadius: '12px 12px 0 0', 
          p: 3
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Article sx={{ fontSize: 28 }} />
              <Box>
                <Typography variant="h6" fontWeight={700}>
                  {newHelpContent.id ? 'Edit Content' : 'Create Help Content'}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  Create guides, articles, and resources for your users
                </Typography>
              </Box>
            </Box>
            <IconButton onClick={() => setContentDialogOpen(false)} sx={{ color: '#fff' }}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 3, pt: 2 }}>
          <AIContentDrafter onResult={(draft) => setNewHelpContent(prev => ({
            ...prev,
            title: draft.title || prev.title,
            content: draft.content || prev.content,
            category: draft.category || prev.category,
            tags: draft.tags || prev.tags,
          }))} />
          <Divider sx={{ my: 2 }}><Chip label="or edit manually" size="small" /></Divider>
          <Grid container spacing={3} sx={{ mt: 0.5 }}>
            <Grid item xs={12} md={7}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Title"
                    variant="outlined"
                    value={newHelpContent.title}
                    onChange={(e) => setNewHelpContent({ ...newHelpContent, title: e.target.value })}
                    required
                  />
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
                    Category
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', overflowX: 'auto', pb: 1 }}>
                    {['onboarding', 'features', 'budgeting', 'troubleshooting', 'security', 'billing', 'general'].map((cat) => (
                      <Chip
                        key={cat}
                        label={cat.charAt(0).toUpperCase() + cat.slice(1)}
                        variant={newHelpContent.category === cat ? 'filled' : 'outlined'}
                        onClick={() => setNewHelpContent({ ...newHelpContent, category: cat })}
                        sx={{
                          ...(newHelpContent.category === cat && {
                            background: 'linear-gradient(135deg, #7c3aed, #3b82f6)',
                            color: '#fff',
                            fontWeight: 600
                          })
                        }}
                      />
                    ))}
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
                    Content Type
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {['article', 'guide', 'faq', 'video'].map((type) => (
                      <Chip
                        key={type}
                        label={type.charAt(0).toUpperCase() + type.slice(1)}
                        variant={newHelpContent.type === type ? 'filled' : 'outlined'}
                        onClick={() => setNewHelpContent({ ...newHelpContent, type })}
                        sx={{
                          ...(newHelpContent.type === type && {
                            background: 'linear-gradient(135deg, #7c3aed, #3b82f6)',
                            color: '#fff',
                            fontWeight: 600
                          })
                        }}
                      />
                    ))}
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Content"
                    multiline
                    rows={12}
                    variant="outlined"
                    value={newHelpContent.content}
                    onChange={(e) => setNewHelpContent({ ...newHelpContent, content: e.target.value })}
                    placeholder="Write your help content here..."
                    required
                    helperText="You can use markdown-style formatting: **bold**, _italic_, ## headings"
                  />
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={12} md={5}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Card sx={{ 
                    bgcolor: 'background.paper', 
                    borderRadius: 2, 
                    p: 2,
                    border: '1px solid',
                    borderColor: 'divider'
                  }}>
                    <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                      📖 Reading Time
                    </Typography>
                    <Typography variant="h4" color="primary" fontWeight={700}>
                      ~{Math.ceil((newHelpContent.content.split(' ').length || 1) / 200)} min read
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Based on {newHelpContent.content.split(' ').length} words
                    </Typography>
                  </Card>
                </Grid>

                <Grid item xs={12}>
                  <Card sx={{ 
                    bgcolor: 'background.paper', 
                    borderRadius: 2, 
                    p: 2,
                    border: '1px solid',
                    borderColor: 'divider'
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                      <RemoveRedEye sx={{ fontSize: 20, color: 'primary.main' }} />
                      <Typography variant="subtitle2" fontWeight={600}>
                        Content Preview
                      </Typography>
                    </Box>
                    <Box sx={{ 
                      bgcolor: 'action.hover',
                      borderRadius: 1.5,
                      p: 2,
                      minHeight: 100,
                      maxHeight: 200,
                      overflow: 'auto'
                    }}>
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', color: 'text.secondary' }}>
                        {newHelpContent.content 
                          ? newHelpContent.content.slice(0, 300) + (newHelpContent.content.length > 300 ? '...' : '')
                          : 'Your content preview will appear here...'}
                      </Typography>
                    </Box>
                  </Card>
                </Grid>

                <Grid item xs={12}>
                  <Card sx={{ bgcolor: 'action.hover', borderRadius: 2, p: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                      <Box>
                        <Typography variant="subtitle2" fontWeight={600}>
                          {newHelpContent.published ? 'Publish now' : 'Save as draft'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {newHelpContent.published 
                            ? 'Content will be visible to users immediately' 
                            : 'Save for later and publish when ready'}
                        </Typography>
                      </Box>
                      <Switch
                        checked={newHelpContent.published}
                        onChange={(e) => setNewHelpContent({ ...newHelpContent, published: e.target.checked })}
                      />
                    </Box>
                  </Card>
                </Grid>

                <Grid item xs={12}>
                  <Card sx={{ 
                    bgcolor: 'background.paper', 
                    borderRadius: 2, 
                    p: 2,
                    border: '1px solid',
                    borderColor: 'divider'
                  }}>
                    <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5 }}>
                      💡 SEO Tips
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                        <CheckCircle sx={{ fontSize: 16, color: 'success.main', mt: 0.2 }} />
                        <Typography variant="caption" color="text.secondary">
                          Use clear headings
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                        <CheckCircle sx={{ fontSize: 16, color: 'success.main', mt: 0.2 }} />
                        <Typography variant="caption" color="text.secondary">
                          Keep titles under 60 chars
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                        <CheckCircle sx={{ fontSize: 16, color: 'success.main', mt: 0.2 }} />
                        <Typography variant="caption" color="text.secondary">
                          Include keywords users search for
                        </Typography>
                      </Box>
                    </Box>
                  </Card>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button onClick={() => setContentDialogOpen(false)} size="large">
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleSubmitHelpContent}
            size="large"
            sx={{ 
              background: 'linear-gradient(135deg, #7c3aed, #3b82f6)', 
              color: '#fff',
              fontWeight: 600
            }}
          >
            {newHelpContent.published ? '🌐 Publish Now' : '💾 Save as Draft'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Speed Dial for Quick Actions */}
      <SpeedDial
        ariaLabel="content actions"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        icon={<SpeedDialIcon />}
      >
        <SpeedDialAction
          icon={<Notifications />}
          tooltipTitle={t('content.tooltips.createNotification')}
          onClick={handleCreateNotification}
        />
        <SpeedDialAction
          icon={<Email />}
          tooltipTitle={t('content.tooltips.createCampaign')}
          onClick={handleCreateCampaign}
        />
        <SpeedDialAction
          icon={<Article />}
          tooltipTitle={t('content.tooltips.createContent')}
          onClick={handleCreateContent}
        />
        <SpeedDialAction
          icon={<Template />}
          tooltipTitle={t('content.tooltips.manageTemplates')}
          onClick={() => setTemplateDialogOpen(true)}
        />
      </SpeedDial>
    </Box>
  );
};

export default ContentCommunicationManagement;
