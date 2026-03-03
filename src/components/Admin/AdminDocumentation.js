/* eslint-disable */
import React, { useState } from 'react';
import {
  Box, Container, Typography, TextField, InputAdornment, Grid, Card, CardContent,
  Paper, List, ListItem, ListItemIcon, ListItemText, Divider, Chip, Button,
  IconButton, Accordion, AccordionSummary, AccordionDetails, Tabs, Tab,
  Alert, Stack, LinearProgress, useTheme, useMediaQuery, Tooltip, Table,
  TableBody, TableCell, TableContainer, TableHead, TableRow
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon, ArrowBack as ArrowBackIcon,
  Search as SearchIcon, Dashboard as DashboardIcon,
  PlayArrow as PlayArrowIcon, People as PeopleIcon,
  Support as SupportIcon, Warning as WarningIcon,
  SmartToy as SmartToyIcon, Chat as ChatIcon,
  BarChart as BarChartIcon, Security as SecurityIcon,
  MonetizationOn as MonetizationOnIcon, Settings as SettingsIcon,
  Code as CodeIcon, Help as HelpIcon, CheckCircle as CheckCircleIcon,
  ContentCopy as ContentCopyIcon, Check as CheckIcon,
  TrendingUp as TrendingUpIcon, Lock as LockIcon,
  Notifications as NotificationsIcon, Receipt as ReceiptIcon,
  Group as GroupIcon, Psychology as PsychologyIcon,
  AutoAwesome as AutoAwesomeIcon, Bolt as BoltIcon,
  Send as SendIcon, Telegram as TelegramIcon,
  Storage as StorageIcon, Api as ApiIcon, Article as ArticleIcon
} from '@mui/icons-material';

const AdminDocumentation = ({ onBack }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [activeSection, setActiveSection] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState(false);
  const [aiSubTab, setAiSubTab] = useState(0);
  const [copiedCmd, setCopiedCmd] = useState('');

  // Navigation sections
  const NAV_SECTIONS = [
    { id: 'overview', label: 'Overview', icon: <DashboardIcon /> },
    { id: 'getting-started', label: 'Getting Started', icon: <PlayArrowIcon /> },
    { id: 'users', label: 'User Management', icon: <PeopleIcon /> },
    { id: 'tickets', label: 'Support Tickets', icon: <SupportIcon /> },
    { id: 'escalations', label: 'Escalations', icon: <WarningIcon /> },
    { id: 'agents', label: 'AI Agents', icon: <SmartToyIcon /> },
    { id: 'ai-chat', label: 'Agent Chat', icon: <ChatIcon /> },
    { id: 'telegram', label: 'Telegram Control', icon: <SendIcon /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChartIcon /> },
    { id: 'security', label: 'Security Center', icon: <SecurityIcon /> },
    { id: 'financial', label: 'Financial Intel', icon: <MonetizationOnIcon /> },
    { id: 'settings', label: 'Settings', icon: <SettingsIcon /> },
    { id: 'api', label: 'API Reference', icon: <CodeIcon /> },
    { id: 'faq', label: 'FAQ', icon: <HelpIcon /> },
  ];

  // AI Agents data
  const AGENTS = [
    {
      id: 'apollo', name: 'Apollo', emoji: '🎯', color: '#7c3aed',
      role: 'Chief Orchestrator & System Architect',
      autonomy: 90,
      description: 'The supreme coordinator. Decomposes tasks, delegates to specialists, verifies integration, and ships. Apollo is the single source of truth for system state.',
      capabilities: [
        'Task decomposition and delegation',
        'Architecture governance and conflict resolution', 
        'Quality gates before deployment',
        'Cross-domain coordination',
        'System state tracking'
      ],
      triggers: ['Manual via Agent Chat', 'All escalations pass through Apollo', 'Every 30min summary to Telegram']
    },
    {
      id: 'sentinel', name: 'Sentinel', emoji: '🛡️', color: '#ef4444',
      role: 'Authentication, Authorization & Security',
      autonomy: 75,
      description: 'Guards the platform 24/7. Monitors login patterns, detects suspicious activity, auto-blocks threats, and alerts via Telegram.',
      capabilities: [
        'Failed login monitoring (auto-block at 10 attempts in 5 min)',
        'Suspicious account detection',
        'Security audit scans',
        'Account lockout management',
        'Auth event analysis'
      ],
      triggers: ['Continuous monitoring', 'Auth failure events', '/security Telegram command', 'auth.multiple_failures bus event']
    },
    {
      id: 'ledger', name: 'Ledger', emoji: '💰', color: '#10b981',
      role: 'Transactions, Budgets & Financial Core',
      autonomy: 60,
      description: 'Owns the financial engine. Calculates budget rollovers, detects transaction anomalies, processes recurring transactions, and manages category intelligence.',
      capabilities: [
        'Daily budget rollover calculation (1 AM UTC)',
        'Transaction anomaly detection',
        'Recurring transaction processing (2 AM UTC)',
        'Category spending analysis',
        'Budget threshold monitoring'
      ],
      triggers: ['Daily cron jobs', 'budget.threshold events (90%+)', 'Transaction creation events']
    },
    {
      id: 'vision', name: 'Vision', emoji: '👁️', color: '#3b82f6',
      role: 'Receipt Scanning, OCR & Document Intelligence',
      autonomy: 80,
      description: 'Processes receipt images using Tesseract OCR followed by LLM verification. Extracts merchant, date, amount, and items automatically.',
      capabilities: [
        'Tesseract OCR pipeline',
        'Claude Haiku LLM data extraction',
        'Receipt lifecycle management',
        'Camera capture integration',
        'Auto-link to transactions'
      ],
      triggers: ['User uploads receipt', 'Manual trigger from admin']
    },
    {
      id: 'cortex', name: 'Cortex', emoji: '🧠', color: '#f59e0b',
      role: 'AI Engine, Insights & Natural Language Intelligence',
      autonomy: 70,
      description: 'The intelligence layer. Generates weekly insights, financial forecasts, spending pattern analysis, and powers natural language understanding across the platform.',
      capabilities: [
        'Weekly AI insight generation',
        'Spending pattern analysis',
        'Financial forecasting',
        'NLP for transaction categorization',
        'Smart recommendations'
      ],
      triggers: ['Weekly cron (Sunday midnight)', 'Manual via /insights command', 'Ledger budget threshold events']
    },
    {
      id: 'vault', name: 'Vault', emoji: '💳', color: '#8b5cf6',
      role: 'Subscriptions, Payments & Stripe Integration',
      autonomy: 85,
      description: 'Manages the entire subscription lifecycle via Stripe. Handles webhooks, plan changes, cancellations, trials, and feature gating.',
      capabilities: [
        'Stripe checkout session creation',
        'Webhook processing (payment succeeded, cancelled)',
        'Subscription status management',
        'Trial granting via /trial command',
        'Feature access gating by plan tier'
      ],
      triggers: ['Stripe webhooks', 'User subscription actions', '/trial Telegram command', 'subscription.expired events']
    },
    {
      id: 'nexus', name: 'Nexus', emoji: '🔗', color: '#ec4899',
      role: 'SplitBill, SplitSmart & Group Expense Management',
      autonomy: 65,
      description: 'Handles all multi-party expense management. Uses AI debt simplification to minimize the number of transactions needed for group settlement.',
      capabilities: [
        'Group expense creation and management',
        'AI debt simplification algorithm',
        'Settlement tracking',
        'Email notifications to participants',
        'Export split summaries'
      ],
      triggers: ['User creates split bill', 'Settlement actions']
    },
    {
      id: 'watchtower', name: 'Watchtower', emoji: '🔭', color: '#06b6d4',
      role: 'Admin Dashboard, Analytics & Platform Operations',
      autonomy: 70,
      description: 'Eyes on the entire platform. Provides real-time WebSocket monitoring, user analytics, compliance auditing, and admin operation logs.',
      capabilities: [
        'Real-time WebSocket dashboard',
        'User activity analytics',
        'Admin action audit log',
        'Compliance reporting',
        'System performance monitoring'
      ],
      triggers: ['Continuous real-time monitoring', 'Admin actions', 'Scheduled analytics reports']
    }
  ];

  // FAQ data
  const FAQ_ITEMS = [
    {
      question: 'How do I access the admin dashboard?',
      answer: 'Navigate to /admin and log in with admin credentials (role: \'admin\' in User model). Only users with admin privileges can access this area.'
    },
    {
      question: 'Can agents make financial transactions on behalf of users?',
      answer: 'No. Agents can ANALYZE and ADVISE, but never debit/credit actual bank accounts. They only manage in-app transaction records.'
    },
    {
      question: 'What AI models power the agents?',
      answer: 'Primary: Claude Sonnet 4.6 (claude-sonnet-4-6). Fast tasks: Claude Haiku 4.5. Fallback: Grok-3. The agent system uses Claude\'s native tool_use API.'
    },
    {
      question: 'How does confidence learning work?',
      answer: 'The system tracks every admin approve/reject decision. After 5+ decisions, the auto-reply threshold adjusts between 60%-95%. More approvals → lower threshold → more automation.'
    },
    {
      question: 'What happens when I reject an escalation?',
      answer: 'The draft is discarded. No response is sent to the user. The decision is recorded for confidence learning.'
    },
    {
      question: 'How often do agents run automatically?',
      answer: 'Sentinel: continuous. Ledger: 1 AM & 2 AM UTC daily. Cortex: weekly. Ticket Scanner: every 15 minutes. Apollo Telegram summary: every 30 minutes.'
    },
    {
      question: 'Can I adjust agent autonomy levels?',
      answer: 'Yes, from Admin → AI Agents → Config tab. Adjust the autonomy percentage slider per agent.'
    },
    {
      question: 'What\'s the difference between scan_tickets and reply_ticket?',
      answer: 'scan_tickets processes ALL open tickets at once. reply_ticket targets one specific ticket by number.'
    },
    {
      question: 'How do I grant a user Pro access without payment?',
      answer: 'Use /trial <email> <days> in Telegram, or the User Management → Grant Trial action in the admin UI.'
    },
    {
      question: 'How is conversation memory handled for agents?',
      answer: 'Both admin chat and Telegram conversations are stored in MongoDB (AgentConversation collection). Last 12 turns used as context per session.'
    },
    {
      question: 'What happens after 4 hours of an unanswered escalation?',
      answer: 'System auto-expires it, sends a holding message to the user ("Your query is being reviewed by our team, response within 24 hours"), and marks the escalation as expired.'
    },
    {
      question: 'How do I broadcast a message to all users?',
      answer: 'Use /broadcast <message> in Telegram, or Admin → Users → Bulk Operations → Send Notification.'
    },
    {
      question: 'What is the Telegram webhook secret?',
      answer: 'Set via TELEGRAM_WEBHOOK_SECRET environment variable on Railway. Never expose this key publicly.'
    },
    {
      question: 'Can multiple admins use the system?',
      answer: 'Yes. Any user with role: \'admin\' can access the admin dashboard. Telegram is currently single-channel.'
    },
    {
      question: 'How do I add a new AI agent capability?',
      answer: 'Add the action to ACTION_REGISTRY in server/services/agentActions.js. Add a tool definition to CLAUDE_TOOLS in agentManagement.routes.js. Deploy to Railway.'
    }
  ];

  // Copy to clipboard handler
  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(key);
    setTimeout(() => setCopiedCmd(''), 2000);
  };

  // Search filter
  const matchesSearch = (text) => !searchQuery || text.toLowerCase().includes(searchQuery.toLowerCase());

  // CodeBlock component
  const CodeBlock = ({ children, copyKey }) => (
    <Paper sx={{ bgcolor: '#1e1e2e', p: 2, borderRadius: 2, position: 'relative', my: 1 }}>
      <Typography sx={{ fontFamily: 'monospace', fontSize: 13, color: '#cdd6f4', whiteSpace: 'pre-wrap' }}>
        {children}
      </Typography>
      <IconButton size="small" onClick={() => handleCopy(children, copyKey)}
        sx={{ position: 'absolute', top: 8, right: 8, color: '#cdd6f4' }}>
        {copiedCmd === copyKey ? <CheckIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />}
      </IconButton>
    </Paper>
  );

  // Render section content
  const renderSectionContent = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <Box>
            <Typography variant="h4" fontWeight={800} gutterBottom>
              Platform Overview
            </Typography>
            <Typography color="text.secondary" paragraph>
              SoldiKeeper's admin command center powered by 8 autonomous AI agents working 24/7 to manage support, security, and operations.
            </Typography>

            {/* Stats Grid */}
            <Grid container spacing={2} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ bgcolor: '#7c3aed15', borderLeft: '4px solid #7c3aed' }}>
                  <CardContent>
                    <Typography variant="h3" fontWeight={700} color="#7c3aed">8</Typography>
                    <Typography variant="body2" color="text.secondary">AI Agents</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ bgcolor: '#10b98115', borderLeft: '4px solid #10b981' }}>
                  <CardContent>
                    <Typography variant="h3" fontWeight={700} color="#10b981">12</Typography>
                    <Typography variant="body2" color="text.secondary">Admin Modules</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ bgcolor: '#3b82f615', borderLeft: '4px solid #3b82f6' }}>
                  <CardContent>
                    <AutoAwesomeIcon sx={{ fontSize: 40, color: '#3b82f6' }} />
                    <Typography variant="body2" color="text.secondary">Real-time Monitoring</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ bgcolor: '#f59e0b15', borderLeft: '4px solid #f59e0b' }}>
                  <CardContent>
                    <BoltIcon sx={{ fontSize: 40, color: '#f59e0b' }} />
                    <Typography variant="body2" color="text.secondary">Autonomous Operations</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Architecture Diagram */}
            <Typography variant="h6" fontWeight={700} gutterBottom sx={{ mt: 4 }}>
              System Architecture
            </Typography>
            <Paper sx={{ p: 3, bgcolor: theme.palette.mode === 'dark' ? '#1e293b' : '#f8fafc' }}>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center" justifyContent="center">
                <Paper sx={{ p: 2, minWidth: 100, textAlign: 'center', bgcolor: '#3b82f615', border: '2px solid #3b82f6' }}>
                  <Typography fontWeight={600}>Users</Typography>
                </Paper>
                <Typography variant="h4">→</Typography>
                <Paper sx={{ p: 2, minWidth: 120, textAlign: 'center', bgcolor: '#10b98115', border: '2px solid #10b981' }}>
                  <Typography fontWeight={600}>API Server</Typography>
                </Paper>
                <Typography variant="h4">→</Typography>
                <Paper sx={{ p: 2, minWidth: 140, textAlign: 'center', bgcolor: '#7c3aed15', border: '2px solid #7c3aed' }}>
                  <Typography fontWeight={600}>Apollo Orchestrator</Typography>
                </Paper>
                <Typography variant="h4">→</Typography>
                <Paper sx={{ p: 2, minWidth: 140, textAlign: 'center', bgcolor: '#f59e0b15', border: '2px solid #f59e0b' }}>
                  <Typography fontWeight={600}>Specialist Agents</Typography>
                </Paper>
              </Stack>
              <Stack direction="row" spacing={4} alignItems="center" justifyContent="center" sx={{ mt: 3 }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4">↓</Typography>
                  <Paper sx={{ p: 2, minWidth: 100, bgcolor: '#ec489915', border: '2px solid #ec4899' }}>
                    <Typography fontWeight={600}>MongoDB</Typography>
                  </Paper>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4">↓</Typography>
                  <Paper sx={{ p: 2, minWidth: 180, bgcolor: '#06b6d415', border: '2px solid #06b6d4' }}>
                    <Typography fontWeight={600}>Telegram | Email | WebSocket</Typography>
                  </Paper>
                </Box>
              </Stack>
            </Paper>

            {/* Quick Links */}
            <Typography variant="h6" fontWeight={700} gutterBottom sx={{ mt: 4 }}>
              Quick Navigation
            </Typography>
            <Grid container spacing={2}>
              {NAV_SECTIONS.slice(1, 7).map((section) => (
                <Grid item xs={12} sm={6} md={4} key={section.id}>
                  <Card 
                    sx={{ 
                      cursor: 'pointer', 
                      transition: 'all 0.2s',
                      '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 }
                    }}
                    onClick={() => setActiveSection(section.id)}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        {section.icon}
                        <Typography fontWeight={600}>{section.label}</Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        );

      case 'getting-started':
        return (
          <Box>
            <Typography variant="h4" fontWeight={800} gutterBottom>
              Getting Started
            </Typography>
            <Typography color="text.secondary" paragraph>
              Your comprehensive guide to mastering the SoldiKeeper admin dashboard.
            </Typography>

            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography fontWeight={600} gutterBottom>Key Concept</Typography>
              Agents run autonomously. Your role is oversight, approval of escalations, and strategic direction.
            </Alert>

            <Typography variant="h6" fontWeight={700} gutterBottom sx={{ mt: 3 }}>
              Setup Steps
            </Typography>
            {[
              'Access admin at /admin — login with admin credentials',
              'Apollo Mission Control shows all agent statuses',
              'Review any pending escalations in the Escalation Inbox',
              'Monitor real-time activity via WebSocket dashboard',
              'Use Agent Chat to communicate with Apollo'
            ].map((step, index) => (
              <Paper key={index} sx={{ p: 2, mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ 
                  width: 40, height: 40, borderRadius: '50%', 
                  bgcolor: 'primary.main', color: 'white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: 20
                }}>
                  {index + 1}
                </Box>
                <Typography>{step}</Typography>
              </Paper>
            ))}
          </Box>
        );

      case 'users':
        return (
          <Box>
            <Typography variant="h4" fontWeight={800} gutterBottom>
              User Management
            </Typography>
            <Typography color="text.secondary" paragraph>
              Complete control over user accounts, permissions, and activity.
            </Typography>

            <Typography variant="h6" fontWeight={700} gutterBottom sx={{ mt: 3 }}>
              Key Features
            </Typography>
            <List>
              {[
                'Search, filter, sort users',
                'View user profile: subscription, transaction count, last login',
                'Actions: /ban <email> via Telegram or admin UI',
                'Grant trials: /trial <email> <days>',
                'Bulk operations: export, status change'
              ].map((item, index) => (
                <ListItem key={index}>
                  <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
                  <ListItemText primary={item} />
                </ListItem>
              ))}
            </List>

            <Typography variant="h6" fontWeight={700} gutterBottom sx={{ mt: 3 }}>
              User Roles
            </Typography>
            <Stack spacing={2}>
              {[
                { role: 'user', desc: 'Standard user with basic features' },
                { role: 'admin', desc: 'Full admin access to dashboard and agents' }
              ].map((item, index) => (
                <Paper key={index} sx={{ p: 2, borderLeft: '4px solid', borderColor: 'primary.main' }}>
                  <Typography fontWeight={600}>{item.role}</Typography>
                  <Typography variant="body2" color="text.secondary">{item.desc}</Typography>
                </Paper>
              ))}
            </Stack>
          </Box>
        );

      case 'tickets':
        return (
          <Box>
            <Typography variant="h4" fontWeight={800} gutterBottom>
              Support Tickets
            </Typography>
            <Typography color="text.secondary" paragraph>
              AI-powered ticket management with autonomous response system.
            </Typography>

            <Typography variant="h6" fontWeight={700} gutterBottom sx={{ mt: 3 }}>
              Ticket Lifecycle
            </Typography>
            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3, flexWrap: 'wrap' }}>
              {['open', 'in_progress', 'waiting_user', 'resolved'].map((status, index) => (
                <React.Fragment key={status}>
                  <Chip label={status} color={status === 'resolved' ? 'success' : 'default'} />
                  {index < 3 && <Typography>→</Typography>}
                </React.Fragment>
              ))}
            </Stack>

            <Alert severity="success" sx={{ mb: 3 }}>
              <Typography fontWeight={600}>Auto-Response Active</Typography>
              <Typography variant="body2">
                Keeper AI scans every 15 minutes AND responds instantly on new ticket creation.
              </Typography>
            </Alert>

            <Typography variant="h6" fontWeight={700} gutterBottom>
              Priority Levels
            </Typography>
            <Grid container spacing={2}>
              {[
                { level: 'low', color: '#9ca3af' },
                { level: 'normal', color: '#3b82f6' },
                { level: 'high', color: '#f59e0b' },
                { level: 'urgent', color: '#ef4444' }
              ].map((item) => (
                <Grid item xs={6} sm={3} key={item.level}>
                  <Paper sx={{ p: 2, textAlign: 'center', borderTop: `4px solid ${item.color}` }}>
                    <Typography fontWeight={600} textTransform="uppercase">{item.level}</Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>
        );

      case 'escalations':
        return (
          <Box>
            <Typography variant="h4" fontWeight={800} gutterBottom>
              Escalations
            </Typography>
            <Typography color="text.secondary" paragraph>
              Human-in-the-loop oversight for low-confidence AI decisions.
            </Typography>

            <Alert severity="warning" sx={{ mb: 3 }}>
              <Typography fontWeight={600}>When Escalations Trigger</Typography>
              <Typography variant="body2">
                AI confidence &lt; 80% → Requires admin review
              </Typography>
            </Alert>

            <Typography variant="h6" fontWeight={700} gutterBottom>
              Escalation States
            </Typography>
            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3, flexWrap: 'wrap' }}>
              {['pending', 'resolved', 'rejected', 'expired'].map((status, index) => (
                <Chip 
                  key={status} 
                  label={status} 
                  color={status === 'resolved' ? 'success' : status === 'rejected' ? 'error' : 'default'} 
                />
              ))}
            </Stack>

            <Typography variant="h6" fontWeight={700} gutterBottom>
              Available Actions
            </Typography>
            <Grid container spacing={2}>
              {[
                { action: 'Approve ✅', desc: 'Send AI draft to user' },
                { action: 'Reject ❌', desc: 'Discard draft' },
                { action: 'Modify ✏️', desc: 'Edit before sending' },
                { action: 'Delegate 📋', desc: 'Mark for manual review' }
              ].map((item, index) => (
                <Grid item xs={12} sm={6} key={index}>
                  <Paper sx={{ p: 2 }}>
                    <Typography fontWeight={600}>{item.action}</Typography>
                    <Typography variant="body2" color="text.secondary">{item.desc}</Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>

            <Typography variant="h6" fontWeight={700} gutterBottom sx={{ mt: 3 }}>
              Auto-Expiry Timeline
            </Typography>
            <Stack spacing={2}>
              <Paper sx={{ p: 2, borderLeft: '4px solid #f59e0b' }}>
                <Typography fontWeight={600}>2 hours: Re-ping admin</Typography>
                <Typography variant="body2" color="text.secondary">Telegram notification sent</Typography>
              </Paper>
              <Paper sx={{ p: 2, borderLeft: '4px solid #ef4444' }}>
                <Typography fontWeight={600}>4 hours: Auto-expire</Typography>
                <Typography variant="body2" color="text.secondary">Holding message sent to user</Typography>
              </Paper>
            </Stack>

            <Alert severity="info" sx={{ mt: 3 }}>
              <Typography fontWeight={600}>Confidence Learning</Typography>
              <Typography variant="body2">
                System adjusts thresholds based on your approve/reject history. More approvals → lower threshold (60%-95% range) → more automation.
              </Typography>
            </Alert>
          </Box>
        );

      case 'agents':
        return (
          <Box>
            <Typography variant="h4" fontWeight={800} gutterBottom>
              🤖 The Apollo Agent Network
            </Typography>
            <Typography color="text.secondary" paragraph sx={{ fontSize: 16 }}>
              8 specialist AI agents working autonomously 24/7
            </Typography>

            {/* Agent Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              {AGENTS.map((agent) => (
                <Grid item xs={12} md={6} key={agent.id}>
                  <Card sx={{ 
                    height: '100%', 
                    borderLeft: `6px solid ${agent.color}`,
                    transition: 'all 0.3s',
                    '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 }
                  }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <Typography sx={{ fontSize: 40 }}>{agent.emoji}</Typography>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6" fontWeight={700}>{agent.name}</Typography>
                          <Typography variant="body2" color="text.secondary">{agent.role}</Typography>
                        </Box>
                      </Box>

                      <Box sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="body2" fontWeight={600}>Autonomy</Typography>
                          <Typography variant="body2" fontWeight={600}>{agent.autonomy}%</Typography>
                        </Box>
                        <LinearProgress 
                          variant="determinate" 
                          value={agent.autonomy} 
                          sx={{ 
                            height: 8, 
                            borderRadius: 1,
                            bgcolor: `${agent.color}20`,
                            '& .MuiLinearProgress-bar': { bgcolor: agent.color }
                          }} 
                        />
                      </Box>

                      <Typography variant="body2" paragraph color="text.secondary">
                        {agent.description}
                      </Typography>

                      <Divider sx={{ my: 2 }} />

                      <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                        Capabilities
                      </Typography>
                      <List dense>
                        {agent.capabilities.map((cap, index) => (
                          <ListItem key={index} sx={{ py: 0.5 }}>
                            <ListItemIcon sx={{ minWidth: 32 }}>
                              <CheckCircleIcon sx={{ fontSize: 16, color: agent.color }} />
                            </ListItemIcon>
                            <ListItemText 
                              primary={cap} 
                              primaryTypographyProps={{ variant: 'body2' }}
                            />
                          </ListItem>
                        ))}
                      </List>

                      <Divider sx={{ my: 2 }} />

                      <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                        Triggers
                      </Typography>
                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        {agent.triggers.map((trigger, index) => (
                          <Chip 
                            key={index} 
                            label={trigger} 
                            size="small" 
                            sx={{ bgcolor: `${agent.color}20`, color: agent.color, fontWeight: 600 }}
                          />
                        ))}
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {/* Autonomy Flow Diagram */}
            <Typography variant="h6" fontWeight={700} gutterBottom sx={{ mt: 4 }}>
              Agent Autonomy Flow
            </Typography>
            <Paper sx={{ p: 3, bgcolor: theme.palette.mode === 'dark' ? '#1e293b' : '#f8fafc' }}>
              <Stack spacing={2} alignItems="center">
                <Paper sx={{ p: 2, bgcolor: '#3b82f615', border: '2px solid #3b82f6', minWidth: 200, textAlign: 'center' }}>
                  <Typography fontWeight={600}>New Ticket / Event</Typography>
                </Paper>
                
                <Typography variant="h4">↓</Typography>
                
                <Paper sx={{ p: 2, bgcolor: '#7c3aed15', border: '2px solid #7c3aed', minWidth: 200, textAlign: 'center' }}>
                  <Typography fontWeight={600}>Apollo Evaluates</Typography>
                </Paper>
                
                <Typography variant="h4">↓</Typography>
                
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Paper sx={{ p: 2, bgcolor: '#10b98115', border: '2px solid #10b981', minWidth: 220 }}>
                      <Typography fontWeight={600}>High Confidence (&gt;threshold)</Typography>
                    </Paper>
                    <Typography variant="h4" sx={{ my: 1 }}>↓</Typography>
                    <Paper sx={{ p: 2, bgcolor: '#10b98115', border: '2px solid #10b981' }}>
                      <Typography fontWeight={600}>Auto-Executes</Typography>
                      <Typography variant="body2" color="text.secondary">Reports to Admin</Typography>
                    </Paper>
                  </Box>
                  
                  <Box sx={{ textAlign: 'center' }}>
                    <Paper sx={{ p: 2, bgcolor: '#f59e0b15', border: '2px solid #f59e0b', minWidth: 220 }}>
                      <Typography fontWeight={600}>Low Confidence (&lt;threshold)</Typography>
                    </Paper>
                    <Typography variant="h4" sx={{ my: 1 }}>↓</Typography>
                    <Paper sx={{ p: 2, bgcolor: '#f59e0b15', border: '2px solid #f59e0b' }}>
                      <Typography fontWeight={600}>Telegram Escalation</Typography>
                      <Typography variant="body2" color="text.secondary">Admin: ✅ Approve | ❌ Reject | ✏️ Modify</Typography>
                    </Paper>
                    <Typography variant="h4" sx={{ my: 1 }}>↓</Typography>
                    <Paper sx={{ p: 2, bgcolor: '#7c3aed15', border: '2px solid #7c3aed' }}>
                      <Typography fontWeight={600}>Confidence Learning</Typography>
                      <Typography variant="body2" color="text.secondary">Adjusts threshold</Typography>
                    </Paper>
                  </Box>
                </Stack>
              </Stack>
            </Paper>

            <Alert severity="info" sx={{ mt: 3 }}>
              <Typography fontWeight={600} gutterBottom>Confidence Learning Explanation</Typography>
              <Typography variant="body2" component="div">
                <strong>• Default threshold:</strong> 80% confidence required to auto-reply<br />
                <strong>• System tracks:</strong> Every approve/reject decision<br />
                <strong>• After 5+ decisions:</strong> Threshold auto-adjusts (more approvals → lower threshold → more automation)<br />
                <strong>• Range:</strong> 60% (high trust) to 95% (high caution)
              </Typography>
            </Alert>
          </Box>
        );

      case 'ai-chat':
        return (
          <Box>
            <Typography variant="h4" fontWeight={800} gutterBottom>
              Agent Chat
            </Typography>
            <Typography color="text.secondary" paragraph>
              Communicate directly with Apollo using natural language.
            </Typography>

            <Typography variant="h6" fontWeight={700} gutterBottom sx={{ mt: 3 }}>
              How to Use
            </Typography>
            <List>
              {[
                'Located in Admin Dashboard → AI Agents tab',
                'Type naturally: "Scan all open tickets", "Run a security audit", "Show me user activity"',
                'Apollo uses Claude claude-sonnet-4-6 with tool_use API — it ACTUALLY executes actions',
                'Conversation is persistent (stored in MongoDB, last 12 turns)',
                'Action results shown in Live result cards with stats'
              ].map((item, index) => (
                <ListItem key={index}>
                  <ListItemIcon><CheckCircleIcon color="primary" /></ListItemIcon>
                  <ListItemText primary={item} />
                </ListItem>
              ))}
            </List>

            <Typography variant="h6" fontWeight={700} gutterBottom sx={{ mt: 3 }}>
              Example Conversations
            </Typography>
            
            {/* Chat Bubble 1 */}
            <Stack spacing={2} sx={{ mb: 3 }}>
              <Paper sx={{ p: 2, bgcolor: '#3b82f615', borderRadius: 3, maxWidth: '80%', alignSelf: 'flex-end' }}>
                <Typography variant="body2" fontWeight={600} color="#3b82f6" gutterBottom>You</Typography>
                <Typography variant="body2">Are there any open support tickets?</Typography>
              </Paper>
              <Paper sx={{ p: 2, bgcolor: '#7c3aed15', borderRadius: 3, maxWidth: '80%', alignSelf: 'flex-start' }}>
                <Typography variant="body2" fontWeight={600} color="#7c3aed" gutterBottom>Apollo</Typography>
                <Typography variant="body2">
                  [calls list_tickets tool] → "Yes, 3 open tickets: TKT-00001 (Password reset, normal priority), 
                  TKT-00002 (Pro subscription, high priority), TKT-00004 (Feature request, low priority). 
                  Want me to respond to any of them?"
                </Typography>
              </Paper>
              <Paper sx={{ p: 2, bgcolor: '#3b82f615', borderRadius: 3, maxWidth: '80%', alignSelf: 'flex-end' }}>
                <Typography variant="body2" fontWeight={600} color="#3b82f6" gutterBottom>You</Typography>
                <Typography variant="body2">Respond to the high priority one</Typography>
              </Paper>
              <Paper sx={{ p: 2, bgcolor: '#7c3aed15', borderRadius: 3, maxWidth: '80%', alignSelf: 'flex-start' }}>
                <Typography variant="body2" fontWeight={600} color="#7c3aed" gutterBottom>Apollo</Typography>
                <Typography variant="body2">
                  [calls reply_ticket tool] → "Done! I've sent a personalized response to TKT-00002 about the Pro 
                  subscription issue. The user has been informed about their subscription status and next steps."
                </Typography>
              </Paper>
            </Stack>

            <Typography variant="h6" fontWeight={700} gutterBottom sx={{ mt: 4 }}>
              Available Actions
            </Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Action</strong></TableCell>
                    <TableCell><strong>What it does</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {[
                    ['list_tickets', 'Shows all open/in-progress tickets'],
                    ['scan_tickets', 'AI-responds to ALL open tickets at once'],
                    ['reply_ticket', 'Responds to one specific ticket'],
                    ['security_scan', 'Checks for suspicious logins & threats'],
                    ['health_check', 'System health: DB, memory, uptime'],
                    ['financial_analysis', 'Current month revenue & transactions'],
                    ['user_activity', 'User engagement report (last 7 days)'],
                    ['generate_insights', 'Triggers AI insight generation']
                  ].map(([action, desc]) => (
                    <TableRow key={action}>
                      <TableCell>
                        <Chip label={action} size="small" color="primary" variant="outlined" />
                      </TableCell>
                      <TableCell>{desc}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        );

      case 'telegram':
        return (
          <Box>
            <Typography variant="h4" fontWeight={800} gutterBottom>
              Telegram Control Center
            </Typography>
            <Typography color="text.secondary" paragraph>
              Full admin control via Telegram bot with natural language AI.
            </Typography>

            <Alert severity="success" sx={{ mb: 3 }}>
              <Typography fontWeight={600}>Setup Complete</Typography>
              <Typography variant="body2">
                Bot is connected to admin's Telegram. Any message triggers Apollo's conversational AI.
              </Typography>
            </Alert>

            <Typography variant="h6" fontWeight={700} gutterBottom>
              Command Reference
            </Typography>

            <Stack spacing={2}>
              {[
                ['/status', 'Platform overview (open tickets, pending escalations)'],
                ['/scan', 'Scan ALL open tickets and auto-respond'],
                ['/tickets', 'List open support tickets'],
                ['/health', 'System health: DB, memory, uptime'],
                ['/security', 'Security scan for threats and suspicious activity'],
                ['/finances', 'Current month financial analysis'],
                ['/users', 'User activity report (last 7 days)'],
                ['/insights', 'Trigger AI insights generation'],
                ['/user <email>', 'Lookup user profile, subscription, last login'],
                ['/ban <email>', 'Deactivate user account (cannot login)'],
                ['/trial <email> <days>', 'Grant Pro trial access for N days'],
                ['/broadcast <message>', 'Send in-app notification to all active users']
              ].map(([cmd, desc]) => (
                <CodeBlock key={cmd} copyKey={cmd}>
                  {`${cmd.padEnd(30)} — ${desc}`}
                </CodeBlock>
              ))}
            </Stack>

            <Typography variant="h6" fontWeight={700} gutterBottom sx={{ mt: 4 }}>
              Natural Language (No Commands)
            </Typography>
            <List>
              {[
                '"Are there any urgent tickets?" → Apollo lists them',
                '"What\'s our revenue this month?" → financial_analysis',
                '"Respond to all open tickets" → scan_tickets + reply loop',
                '"Grant 7-day trial to user@example.com" → /trial equivalent'
              ].map((item, index) => (
                <ListItem key={index}>
                  <ListItemIcon><ChatIcon color="primary" /></ListItemIcon>
                  <ListItemText primary={item} />
                </ListItem>
              ))}
            </List>

            <Typography variant="h6" fontWeight={700} gutterBottom sx={{ mt: 4 }}>
              Escalation Buttons in Telegram
            </Typography>
            <Typography color="text.secondary" paragraph>
              When AI is unsure, you get an inline keyboard:
            </Typography>
            <Grid container spacing={2}>
              {[
                ['✅ Approve', 'Send AI draft to user'],
                ['❌ Reject', 'Discard draft'],
                ['✏️ Modify', 'Send your typed response'],
                ['📋 Delegate', 'Mark for manual review']
              ].map(([btn, desc]) => (
                <Grid item xs={12} sm={6} key={btn}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography fontWeight={600}>{btn}</Typography>
                    <Typography variant="body2" color="text.secondary">{desc}</Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>
        );

      case 'analytics':
        return (
          <Box>
            <Typography variant="h4" fontWeight={800} gutterBottom>
              Analytics & Intelligence
            </Typography>
            <Typography color="text.secondary" paragraph>
              Deep insights into platform performance and user behavior.
            </Typography>

            <Typography variant="h6" fontWeight={700} gutterBottom>
              Available Reports
            </Typography>
            <List>
              {[
                'System Analytics: daily active users, transaction volumes, revenue',
                'Agent Execution Log: every autonomous action recorded',
                'Financial Intelligence: platform-wide spending patterns',
                'Compliance Audit: admin action history',
                'Export: CSV/PDF of any report'
              ].map((item, index) => (
                <ListItem key={index}>
                  <ListItemIcon><BarChartIcon color="primary" /></ListItemIcon>
                  <ListItemText primary={item} />
                </ListItem>
              ))}
            </List>
          </Box>
        );

      case 'security':
        return (
          <Box>
            <Typography variant="h4" fontWeight={800} gutterBottom>
              Security Center
            </Typography>
            <Typography color="text.secondary" paragraph>
              24/7 security monitoring powered by Sentinel agent.
            </Typography>

            <Alert severity="error" sx={{ mb: 3 }}>
              <Typography fontWeight={600}>Auto-Block Active</Typography>
              <Typography variant="body2">
                10 failed login attempts in 5 minutes → Account auto-locked
              </Typography>
            </Alert>

            <Typography variant="h6" fontWeight={700} gutterBottom>
              Security Features
            </Typography>
            <List>
              {[
                'Sentinel continuous monitoring',
                'Auto-block at 10 failed attempts in 5 minutes',
                'Locked account email sent to user',
                'Admin Telegram alert for suspicious activity',
                'Security scan via /security or Agent Chat',
                'JWT auth with 7-day expiry',
                'Google OAuth integration'
              ].map((item, index) => (
                <ListItem key={index}>
                  <ListItemIcon><SecurityIcon color="error" /></ListItemIcon>
                  <ListItemText primary={item} />
                </ListItem>
              ))}
            </List>
          </Box>
        );

      case 'financial':
        return (
          <Box>
            <Typography variant="h4" fontWeight={800} gutterBottom>
              Financial Intelligence
            </Typography>
            <Typography color="text.secondary" paragraph>
              Deep financial analytics and revenue monitoring.
            </Typography>

            <Typography variant="h6" fontWeight={700} gutterBottom>
              Key Metrics
            </Typography>
            <List>
              {[
                'Financial Intelligence module: MRR, ARR, churn',
                'Transaction monitoring across all users',
                'Subscription analytics: free vs pro ratio',
                'Revenue by month chart',
                'Stripe dashboard integration'
              ].map((item, index) => (
                <ListItem key={index}>
                  <ListItemIcon><MonetizationOnIcon color="success" /></ListItemIcon>
                  <ListItemText primary={item} />
                </ListItem>
              ))}
            </List>
          </Box>
        );

      case 'settings':
        return (
          <Box>
            <Typography variant="h4" fontWeight={800} gutterBottom>
              System Settings
            </Typography>
            <Typography color="text.secondary" paragraph>
              Configure platform behavior and agent parameters.
            </Typography>

            <Typography variant="h6" fontWeight={700} gutterBottom>
              Configuration Options
            </Typography>
            <List>
              {[
                'System settings: platform name, maintenance mode',
                'Agent configuration: autonomy percentages per agent',
                'Email templates: customization',
                'Webhook configuration for Stripe',
                'Telegram bot configuration'
              ].map((item, index) => (
                <ListItem key={index}>
                  <ListItemIcon><SettingsIcon color="primary" /></ListItemIcon>
                  <ListItemText primary={item} />
                </ListItem>
              ))}
            </List>
          </Box>
        );

      case 'api':
        return (
          <Box>
            <Typography variant="h4" fontWeight={800} gutterBottom>
              API Reference
            </Typography>
            <Typography color="text.secondary" paragraph>
              Internal API endpoints for developers.
            </Typography>

            <Typography variant="h6" fontWeight={700} gutterBottom>
              Admin Endpoints
            </Typography>
            <Stack spacing={1}>
              {[
                'GET    /api/admin/users              — List all users',
                'POST   /api/admin/users/:id/ban      — Ban a user',
                'POST   /api/admin/users/:id/trial    — Grant trial',
                'GET    /api/support/tickets          — List tickets',
                'POST   /api/support/tickets/:id/reply — Reply to ticket',
                'GET    /api/escalations              — List escalations',
                'PUT    /api/escalations/:id          — Update escalation',
                'POST   /api/agent/chat               — Send message to Apollo',
                'GET    /api/admin/analytics          — Platform analytics',
                'POST   /api/user/chat                — User chat with Keeper AI'
              ].map((endpoint) => (
                <CodeBlock key={endpoint} copyKey={endpoint}>
                  {endpoint}
                </CodeBlock>
              ))}
            </Stack>
          </Box>
        );

      case 'faq':
        return (
          <Box>
            <Typography variant="h4" fontWeight={800} gutterBottom>
              Frequently Asked Questions
            </Typography>
            <Typography color="text.secondary" paragraph>
              Common questions and answers about the admin system.
            </Typography>

            <Stack spacing={2} sx={{ mt: 3 }}>
              {FAQ_ITEMS
                .filter(item => matchesSearch(item.question + ' ' + item.answer))
                .map((item, index) => (
                  <Accordion key={index}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography fontWeight={600}>{item.question}</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Typography color="text.secondary">{item.answer}</Typography>
                    </AccordionDetails>
                  </Accordion>
                ))}
            </Stack>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Sidebar / Mobile Tabs */}
      {isMobile ? (
        <Box sx={{ 
          position: 'sticky', 
          top: 0, 
          zIndex: 10, 
          bgcolor: 'background.paper', 
          borderBottom: 1, 
          borderColor: 'divider',
          overflowX: 'auto',
          width: '100%'
        }}>
          <Tabs 
            value={activeSection} 
            onChange={(e, val) => setActiveSection(val)}
            variant="scrollable"
            scrollButtons="auto"
          >
            {NAV_SECTIONS.map((section) => (
              <Tab 
                key={section.id} 
                value={section.id} 
                label={section.label}
                icon={section.icon}
                iconPosition="start"
              />
            ))}
          </Tabs>
        </Box>
      ) : (
        <Box sx={{ 
          width: 240, 
          flexShrink: 0, 
          position: 'sticky', 
          top: 0, 
          height: '100vh', 
          overflowY: 'auto', 
          borderRight: 1, 
          borderColor: 'divider',
          bgcolor: 'background.paper',
          p: 2 
        }}>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
            Navigation
          </Typography>
          <List>
            {NAV_SECTIONS.map((section) => (
              <ListItem 
                button 
                key={section.id}
                selected={activeSection === section.id}
                onClick={() => setActiveSection(section.id)}
                sx={{ 
                  borderRadius: 2, 
                  mb: 0.5,
                  '&.Mui-selected': {
                    bgcolor: 'primary.main',
                    color: 'white',
                    '&:hover': { bgcolor: 'primary.dark' },
                    '& .MuiListItemIcon-root': { color: 'white' }
                  }
                }}
              >
                <ListItemIcon sx={{ minWidth: 36 }}>
                  {section.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={section.label} 
                  primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      )}

      {/* Main Content */}
      <Box sx={{ flex: 1, p: { xs: 2, md: 4 }, overflowY: 'auto' }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Button 
            startIcon={<ArrowBackIcon />} 
            onClick={onBack} 
            sx={{ mb: 2 }}
          >
            Back to Dashboard
          </Button>
          <Typography variant="h4" fontWeight={800}>
            SoldiKeeper Admin Documentation
          </Typography>
          <Typography color="text.secondary">
            Complete reference for the SoldiKeeper Admin Command Center
          </Typography>
          
          {/* Search */}
          <TextField 
            fullWidth 
            placeholder="Search documentation..." 
            value={searchQuery} 
            onChange={e => setSearchQuery(e.target.value)}
            InputProps={{ 
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ) 
            }}
            sx={{ mt: 2, maxWidth: 500 }} 
          />
        </Box>

        {/* Section Content */}
        {renderSectionContent()}
      </Box>
    </Box>
  );
};

export default AdminDocumentation;
