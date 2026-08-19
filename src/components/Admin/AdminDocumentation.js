/**
 * AdminDocumentation — Modern, accurate operator handbook for SoldiKeeper.
 * Single source of truth for agent metadata = data/agentRegistry.js (18 agents).
 *
 * Sections are config-driven (DOC_SECTIONS) so updates don't require touching JSX.
 */
import React, { useState, useMemo, useCallback } from 'react';
import {
  Box, Container, Typography, TextField, InputAdornment, Grid, Card, CardContent,
  Paper, List, ListItem, ListItemIcon, ListItemText, Chip, Button, IconButton,
  Accordion, AccordionSummary, AccordionDetails, Alert, Stack, Tooltip, Divider,
  LinearProgress, useTheme, useMediaQuery, alpha, Drawer, AppBar, Toolbar,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon, ArrowBack as ArrowBackIcon,
  Search as SearchIcon, Dashboard as DashboardIcon,
  PlayArrow as PlayArrowIcon, People as PeopleIcon,
  Support as SupportIcon, Warning as WarningIcon,
  SmartToy as SmartToyIcon, Chat as ChatIcon,
  Bolt as BoltIcon, Security as SecurityIcon,
  MonetizationOn as MonetizationOnIcon,
  Code as CodeIcon, Help as HelpIcon, CheckCircle as CheckCircleIcon,
  ContentCopy as ContentCopyIcon, Check as CheckIcon,
  Send as SendIcon, RocketLaunch as RocketIcon, MenuRounded,
  AutoAwesome as AutoAwesomeIcon, Hub as HubIcon, Receipt as ReceiptIcon,
} from '@mui/icons-material';
import { AGENTS } from '../../data/agentRegistry';

const DRAWER_WIDTH = 260;

const DOC_SECTIONS = [
  { id: 'overview',        label: 'Overview',           icon: <DashboardIcon /> },
  { id: 'getting-started', label: 'Getting Started',    icon: <PlayArrowIcon /> },
  { id: 'mission-control', label: 'Mission Control',    icon: <RocketIcon /> },
  { id: 'agents',          label: 'AI Agent Fleet',     icon: <SmartToyIcon /> },
  { id: 'olympus',         label: 'Olympus Cmd Center', icon: <HubIcon /> },
  { id: 'godmode',         label: 'God Mode',           icon: <BoltIcon /> },
  { id: 'telegram',        label: 'Telegram Control',   icon: <SendIcon /> },
  { id: 'llm',             label: 'LLM Cost Tracker',   icon: <MonetizationOnIcon /> },
  { id: 'escalations',     label: 'Escalations',        icon: <WarningIcon /> },
  { id: 'tickets',         label: 'Support Tickets',    icon: <SupportIcon /> },
  { id: 'users',           label: 'User Management',    icon: <PeopleIcon /> },
  { id: 'security',        label: 'Security Center',    icon: <SecurityIcon /> },
  { id: 'api',             label: 'API Reference',      icon: <CodeIcon /> },
  { id: 'faq',             label: 'FAQ',                icon: <HelpIcon /> },
];

const TG_PAD = [
  { left: '🏠 Home', right: 'Mission Control hero + live pulse (health, MRR, tickets, studio spend)' },
  { left: '🎬 Studio', right: 'Marketing desk — presets, queue, spend cap, generate packs' },
  { left: '💰 Revenue', right: 'MRR breakdown (same as /mrr)' },
  { left: '🎫 Support', right: 'Open tickets (same as /tickets)' },
  { left: '🤖 Fleet', right: 'Agent statuses (same as /agents)' },
  { left: '🛡 Control', right: 'God Mode panel (same as /godmode)' },
];

const TG_STUDIO = [
  { left: '/studio', right: 'Open the studio desk: spend, queue, last packs + preset buttons' },
  { left: '/studio make <brief>', right: 'Queue a campaign pack (reel + story + feed + copy)' },
  { left: '/studio week', right: 'Weekly social drop (UGC reel + stills)' },
  { left: '/studio kit <feature>', right: 'Feature launch kit (spot, UGC, store shots, OG, email header)' },
  { left: '/studio store', right: 'Play Store pack (feature graphic + screenshots + short promo)' },
  { left: '/studio spend', right: 'Today’s Grok $ vs daily cap' },
  { left: '/studio cap <n>', right: 'Set daily spend cap in USD (default 15)' },
  { left: '/studio bump <n>', right: 'Add n dollars to today’s cap' },
  { left: '/studio last', right: 'Re-send the last pack album to this chat' },
  { left: '/studio kill <id>', right: 'Cancel / kill a pack by campaignId' },
  { left: '/studio brand', right: 'Show Brand OS (palette, CTA, forbidden looks)' },
];

const TG_SUPPORT = [
  { left: '/tickets', right: 'Open / in-progress tickets' },
  { left: '/scan', right: 'AI auto-respond all open tickets' },
  { left: '/closeticket <num> [reason]', right: 'Close a ticket' },
  { left: '/reopenticket <num>', right: 'Reopen' },
  { left: '/deleteticket <num>', right: 'Delete — Confirm tap required' },
  { left: '/reassign <num> <agent>', right: 'Reassign' },
  { left: '/createticket <subject>', right: 'Create a ticket' },
  { left: '/sla', right: 'SLA report' },
  { left: '/csat', right: 'CSAT report' },
];

const TG_USERS = [
  { left: '/user <email>', right: 'Profile card (role, plan, last login)' },
  { left: '/listusers [--plan=X] [--active=Xd]', right: 'Filtered user list' },
  { left: '/suspend <email> [reason]', right: 'Suspend account' },
  { left: '/restore <email>', right: 'Unsuspend' },
  { left: '/ban <email>', right: 'Deactivate (isActive=false)' },
  { left: '/editrole <email> <role>', right: 'user | admin | super_admin' },
  { left: '/message <email> <text>', right: 'In-app notification' },
  { left: '/trial <email> <days>', right: 'Grant Pro trial' },
  { left: '/gdpr <email>', right: 'GDPR erasure — irreversible step-up' },
  { left: '/deleteuser <email>', right: 'Soft-delete — irreversible step-up' },
];

const TG_MONEY = [
  { left: '/mrr', right: 'MRR, gap to goal, by plan' },
  { left: '/revenue [daily|weekly|monthly]', right: 'Revenue trend' },
  { left: '/churn', right: 'Churn + at-risk paid users' },
  { left: '/arpu', right: 'ARPU by tier' },
  { left: '/forecast [30d|90d]', right: 'MRR projection' },
  { left: '/cohort', right: 'Signup-cohort retention' },
  { left: '/stripe [mrr|disputes|payouts|balance]', right: 'Live Stripe' },
  { left: '/expenses [--user= --category= --from=]', right: 'Expense breakdown' },
  { left: '/txhistory <email>', right: 'User transactions' },
  { left: '/bigtx [--min=N]', right: 'Large transactions' },
  { left: '/flagtx <id> [reason]', right: 'Fraud flag' },
  { left: '/unflagtx <id>', right: 'Clear flag' },
  { left: '/exportcsv transactions|users', right: 'CSV document in chat' },
];

const TG_FLEET = [
  { left: '/agents', right: 'Fleet heartbeat / current task' },
  { left: '/fleet', right: 'Configured agents (spawn service)' },
  { left: '/score [agentId]', right: 'Weekly scorecards / one agent' },
  { left: '/goalsfleet', right: 'OKR snapshot' },
  { left: '/votes', right: 'Open council votes' },
  { left: '/vote <id> approve|reject', right: 'Cast human override' },
  { left: '/proposals', right: 'Pending agent proposals' },
  { left: '/proposal <id> approve|reject', right: 'Decide a proposal' },
  { left: '/rules', right: 'Active constitutional rules' },
  { left: '/board', right: 'Run Monday board meeting now' },
  { left: '/improve', right: 'Run self-improvement now' },
  { left: '/investor', right: 'Generate investor report' },
  { left: '/spawn <role> <domain>', right: 'Recommend ephemeral agent' },
  { left: '/disable <id> · /enable <id>', right: 'Pause / resume an agent' },
  { left: '/fire <id>', right: 'Irreversible — step-up token' },
];

const TG_OPS = [
  { left: '/start · /home · /menu', right: 'Mission Control home + install the pad' },
  { left: '/status', right: 'Same pulse as Home (no pad reinstall)' },
  { left: '/help', right: 'Short how-to + topic buttons' },
  { left: '/health', right: 'DB, memory, uptime' },
  { left: '/dashboard', right: '4-panel charts (users, tx, categories, MRR)' },
  { left: '/chart <type>', right: 'users | transactions | categories | mrr | churn | revenue' },
  { left: '/security', right: 'Sentinel threat scan' },
  { left: '/insights', right: 'Trigger Cortex insights' },
  { left: '/query <question>', right: 'Natural-language DB query (read-only)' },
  { left: '/broadcast [--plan=] <msg>', right: 'In-app blast' },
  { left: '/maintenance on|off', right: 'Maintenance mode' },
  { left: '/autoresolve on|off', right: 'Ticket auto-resolve' },
  { left: '/setthreshold <N>', right: 'Confidence 0–100' },
  { left: '/schedule daily|weekly|monthly on|off', right: 'Briefing crons' },
  { left: '/report [daily|weekly|monthly]', right: 'On-demand briefing' },
  { left: '/auditlog', right: 'Admin audit trail' },
  { left: '/lang <code>', right: 'Bot locale: en fr it de es pt' },
  { left: '/webhook_status', right: 'Telegram webhook health' },
  { left: '/kg <query>', right: 'Knowledge graph search' },
  { left: '/env', right: 'Safe env presence (no secrets)' },
];

const TG_NL_EXAMPLES = [
  { left: 'make an IG reel about receipt scanning for students', right: 'create_media_pack — 9:16 reel + stills + captions' },
  { left: 'how is MRR?', right: 'get_revenue / stripe_mrr' },
  { left: 'any angry tickets?', right: 'list_tickets + scan if you ask to reply' },
  { left: 'approve proposal X', right: 'approve_proposal' },
  { left: 'who is the worst agent this week?', right: 'get_scorecards' },
  { left: 'shorter hook', right: 'If you reply to a pack: revise_media' },
];

const FAQ_ITEMS = [
  { q: 'How do I access the admin dashboard?',
    a: 'Visit /admin and sign in with an account whose role is "admin" or "super_admin". Non-admin accounts are redirected to /login.' },
  { q: 'What AI models power the agents?',
    a: 'Primary: Claude Sonnet 4.6. Fast tasks: Claude Haiku 4.5. Fallback: OpenAI GPT-4 / Grok-3. The system uses Claude\'s native tool_use API via Anthropic.' },
  { q: 'How many agents are in the fleet?',
    a: '18 total — 12 specialists (00–11) + 6 C-suite (12–17). See the Fleet section for the full roster.' },
  { q: 'How does Mission Control differ from the AI tab?',
    a: 'AI tab is the chat & LLM cost panel. Mission Control is the operational pane: real-time fleet status, autonomy sliders, decision logs, agent triggers.' },
  { q: 'What does Project Olympus add on top?',
    a: 'Olympus is the AI command-center: cross-agent goals (OKRs), agent council voting, reasoning-trace inspector, dead-letter queue, circuit-breaker status.' },
  { q: 'How does confidence learning work?',
    a: 'Every approve/reject is recorded. After ≥5 decisions, the auto-reply threshold drifts inside the 60%–95% band. More approvals → lower threshold → more autonomy.' },
  { q: 'What happens after 4 hours of an unanswered escalation?',
    a: 'It auto-expires. A holding message ("Your query is being reviewed, response within 24h") is sent to the user; the escalation is marked expired in the audit log.' },
  { q: 'Can agents move money in real bank accounts?',
    a: 'No. Agents can only read/write in-app records. There is no bank-debit capability anywhere in the system.' },
  { q: 'Why does the LLM cost counter reset after deployments?',
    a: 'It used to be process-memory. Now it is persisted in MongoDB (LLMCostLog collection). Costs accumulate across deploys and are queryable per-agent / per-model.' },
  { q: 'How do I grant Pro access without payment?',
    a: 'Telegram: /trial <email> <days>. Or admin UI → Users → row action → Grant Trial.' },
  { q: 'What is god mode?',
    a: 'Operator override for autonomy, tickets, votes, and agents. Telegram: tap 🛡 Control or /godmode. Force-approve/reject and pause agents. Every action is audited.' },
  { q: 'How do I run the platform from Telegram?',
    a: 'Send /start once. Use the pad at the bottom (Home, Studio, Revenue, Support, Fleet, Control) or type naturally (“make an IG reel about receipts”, “how is MRR?”). Full operator guide: Docs → Telegram Control.' },
  { q: 'How do I generate marketing videos from Telegram?',
    a: 'Tap 🎬 Studio, then Reel / Week / Kit / Store — or /studio make <brief>. Packs arrive as a video + photo album + captions. Background music is mixed automatically on AI reels. Reply to a pack to revise. See Telegram Control → Studio.' },
  { q: 'How do I add a new agent capability?',
    a: '1) add the action to ACTION_REGISTRY in services/agentActions.js. 2) define a tool in CLAUDE_TOOLS (routes/agentManagement.routes.js). 3) deploy.' },
  { q: 'Where is the audit trail?',
    a: 'AdminAction collection — every admin action, every escalation decision, and every god-mode toggle is logged with actor, target, timestamp and IP.' },
];

const TableLikeList = ({ rows }) => (
  <Stack spacing={0.5}>
    {rows.map((r, i) => (
      <Paper key={i} sx={{ p: 1.25, display: 'flex', gap: 2, alignItems: 'center' }}>
        <Typography sx={{ fontFamily: 'ui-monospace, monospace', fontSize: 12.5, fontWeight: 700, minWidth: { xs: 120, sm: 220 }, flex: { xs: '1 1 100%', sm: '0 0 240px' } }}>
          {r.left}
        </Typography>
        <Typography variant="body2" color="text.secondary">{r.right}</Typography>
      </Paper>
    ))}
  </Stack>
);

const AdminDocumentation = ({ onBack }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [activeSection, setActiveSection] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [copied, setCopied] = useState('');

  const handleCopy = useCallback((text, key) => {
    navigator.clipboard?.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(''), 1600);
  }, []);

  const filteredSections = useMemo(() => {
    if (!searchQuery) return DOC_SECTIONS;
    const q = searchQuery.toLowerCase();
    const extra = {
      telegram: 'bot studio reel pad mission control webhook botfather',
      godmode: 'control panel autonomy override',
    };
    return DOC_SECTIONS.filter(s =>
      s.label.toLowerCase().includes(q) || (extra[s.id] || '').includes(q)
    );
  }, [searchQuery]);

  const filteredAgents = useMemo(() => {
    if (!searchQuery) return AGENTS;
    const q = searchQuery.toLowerCase();
    return AGENTS.filter(a =>
      a.name.toLowerCase().includes(q) ||
      a.role.toLowerCase().includes(q) ||
      (a.description || '').toLowerCase().includes(q) ||
      (a.domains || []).some(d => d.toLowerCase().includes(q))
    );
  }, [searchQuery]);

  const goto = (id) => {
    setActiveSection(id);
    if (isMobile) setDrawerOpen(false);
  };

  const sidebar = (
    <Box sx={{ width: DRAWER_WIDTH, p: 2, height: '100%', overflowY: 'auto' }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
        <AutoAwesomeIcon sx={{ color: 'primary.main' }} />
        <Box>
          <Typography sx={{ fontWeight: 800, fontSize: 14 }}>SoldiKeeper</Typography>
          <Typography sx={{ fontSize: 10.5, opacity: 0.65, letterSpacing: 0.5 }}>OPERATOR HANDBOOK · v2.1</Typography>
        </Box>
      </Stack>

      <TextField
        size="small"
        fullWidth
        placeholder="Search docs…"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        InputProps={{
          startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>,
        }}
        sx={{ mb: 2 }}
      />

      <List dense disablePadding>
        {filteredSections.map((s) => {
          const active = activeSection === s.id;
          return (
            <ListItem
              key={s.id}
              button
              onClick={() => goto(s.id)}
              sx={{
                borderRadius: 1.5, mb: 0.25, py: 0.75,
                bgcolor: active ? alpha(theme.palette.primary.main, 0.12) : 'transparent',
                color: active ? 'primary.main' : 'text.primary',
                fontWeight: active ? 700 : 500,
                '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.08) },
              }}
            >
              <ListItemIcon sx={{ minWidth: 32, color: 'inherit' }}>
                {React.cloneElement(s.icon, { fontSize: 'small' })}
              </ListItemIcon>
              <ListItemText
                primary={s.label}
                primaryTypographyProps={{ fontSize: 13, fontWeight: active ? 700 : 500 }}
              />
            </ListItem>
          );
        })}
      </List>

      <Divider sx={{ my: 2 }} />

      <Box sx={{ px: 1 }}>
        <Typography sx={{ fontSize: 10, opacity: 0.6, letterSpacing: 0.7, fontWeight: 700, mb: 0.5 }}>
          STATUS
        </Typography>
        <Chip size="small" label="✓ All systems nominal" color="success" variant="outlined" sx={{ width: '100%', justifyContent: 'flex-start' }} />
      </Box>
    </Box>
  );

  const CodeBlock = ({ children, copyKey }) => (
    <Paper sx={{ bgcolor: '#1e1e2e', p: 2, borderRadius: 2, position: 'relative', my: 1 }}>
      <Typography sx={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: 12.5, color: '#cdd6f4', whiteSpace: 'pre-wrap' }}>
        {children}
      </Typography>
      <IconButton size="small" onClick={() => handleCopy(children, copyKey)} sx={{ position: 'absolute', top: 6, right: 6, color: '#cdd6f4' }}>
        {copied === copyKey ? <CheckIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />}
      </IconButton>
    </Paper>
  );

  const SectionTitle = ({ title, subtitle }) => (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h4" fontWeight={800}>{title}</Typography>
      {subtitle && <Typography color="text.secondary" sx={{ mt: 0.5 }}>{subtitle}</Typography>}
    </Box>
  );

  const renderOverview = () => (
    <Box>
      <SectionTitle
        title="Operator Handbook"
        subtitle="The comprehensive guide to running SoldiKeeper's autonomous platform — 18 AI agents, 14 admin modules, fully observable."
      />
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { v: '18', l: 'AI Agents (12 + 6 C-suite)', c: '#7c3aed' },
          { v: '14', l: 'Admin Modules', c: '#10b981' },
          { v: '24/7', l: 'Autonomous Operation', c: '#f59e0b' },
          { v: '∞', l: 'Continuous Learning', c: '#3b82f6' },
        ].map((s) => (
          <Grid item xs={6} md={3} key={s.l}>
            <Card sx={{ bgcolor: alpha(s.c, 0.08), borderLeft: `4px solid ${s.c}`, height: '100%' }}>
              <CardContent>
                <Typography variant="h3" fontWeight={800} sx={{ color: s.c }}>{s.v}</Typography>
                <Typography variant="body2" color="text.secondary">{s.l}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Typography variant="h6" fontWeight={700} sx={{ mt: 3, mb: 1.5 }}>System Architecture</Typography>
      <Paper sx={{ p: 2.5, bgcolor: theme.palette.mode === 'dark' ? '#1e293b' : '#f8fafc' }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} alignItems="center" justifyContent="center">
          {[
            { l: 'Users', c: '#3b82f6' },
            { l: 'API Server', c: '#10b981' },
            { l: 'Apollo Orchestrator', c: '#7c3aed' },
            { l: '17 Specialist Agents', c: '#f59e0b' },
          ].map((b, i) => (
            <React.Fragment key={b.l}>
              <Paper sx={{ px: 1.75, py: 1.25, textAlign: 'center', bgcolor: alpha(b.c, 0.12), border: `2px solid ${b.c}`, minWidth: 140 }}>
                <Typography fontWeight={700} fontSize={13}>{b.l}</Typography>
              </Paper>
              {i < 3 && <Typography variant="h5" sx={{ opacity: 0.5 }}>→</Typography>}
            </React.Fragment>
          ))}
        </Stack>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems="center" justifyContent="center" sx={{ mt: 2 }}>
          {[
            { l: 'MongoDB', c: '#ec4899' },
            { l: 'Telegram · Email · WS · Stripe', c: '#06b6d4' },
            { l: 'Cron · Bus · Dead-Letter Queue', c: '#84cc16' },
          ].map((b) => (
            <Paper key={b.l} sx={{ p: 1, bgcolor: alpha(b.c, 0.12), border: `2px solid ${b.c}` }}>
              <Typography fontWeight={600} fontSize={12}>{b.l}</Typography>
            </Paper>
          ))}
        </Stack>
      </Paper>

      <Typography variant="h6" fontWeight={700} sx={{ mt: 4, mb: 1.5 }}>Quick Navigation</Typography>
      <Grid container spacing={1.5}>
        {DOC_SECTIONS.slice(1, 9).map((s) => (
          <Grid item xs={12} sm={6} md={3} key={s.id}>
            <Card
              onClick={() => goto(s.id)}
              sx={{ cursor: 'pointer', transition: 'all .2s', '&:hover': { transform: 'translateY(-3px)', boxShadow: 4 } }}
            >
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  {React.cloneElement(s.icon, { color: 'primary' })}
                  <Typography fontWeight={600} fontSize={14}>{s.label}</Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  const renderGettingStarted = () => (
    <Box>
      <SectionTitle title="Getting Started" subtitle="From zero to operating an autonomous AI platform in five steps." />
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography fontWeight={700}>Operator mindset</Typography>
        Agents run autonomously. Your job is oversight, escalation review, strategic direction — not micro-execution.
      </Alert>
      {[
        { n: 1, t: 'Sign in at /admin',              d: 'Use an account with role admin or super_admin. WS dashboard initialises automatically.' },
        { n: 2, t: 'Open the Overview cockpit',       d: 'Mission Strip = at-a-glance status. Agent Fleet strip = live per-agent health. Live Event Feed streams as things happen.' },
        { n: 3, t: 'Connect Telegram Mission Control', d: 'Set TELEGRAM_BOT_TOKEN + allowlist on Railway. Open the bot, send /start. The pad (Home · Studio · Revenue · Support · Fleet · Control) is how you drive the company from your phone. Full guide: Docs → Telegram Control.' },
        { n: 4, t: 'Visit AI tab → Mission Control', d: 'Adjust agent autonomy, watch decision logs, trigger any agent on-demand.' },
        { n: 5, t: 'Review the Escalation Inbox',    d: 'Anything below the auto-reply threshold lands here. Approve, reject or modify drafts before they ship.' },
      ].map(s => (
        <Paper key={s.n} sx={{ p: 2, mb: 1.5, display: 'flex', gap: 2, alignItems: 'flex-start' }}>
          <Box sx={{
            width: 36, height: 36, borderRadius: '50%',
            bgcolor: 'primary.main', color: 'common.white',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, flexShrink: 0,
          }}>
            {s.n}
          </Box>
          <Box>
            <Typography fontWeight={700}>{s.t}</Typography>
            <Typography variant="body2" color="text.secondary">{s.d}</Typography>
          </Box>
        </Paper>
      ))}
    </Box>
  );

  const renderMissionControl = () => (
    <Box>
      <SectionTitle title="Mission Control" subtitle="The operational pane for the whole agent fleet." />
      <Alert severity="success" sx={{ mb: 2 }}>
        Found at: <strong>Admin → AI Agents → Mission Control tab</strong>. Auto-refreshes every 30s.
      </Alert>
      <Typography variant="h6" fontWeight={700} sx={{ mt: 2, mb: 1 }}>What you can do here</Typography>
      <List dense>
        {[
          'See per-agent: status, current task, autonomy level, tasks today, success rate, last heartbeat.',
          'Drag the autonomy slider per agent — applies via PATCH /api/admin/agent-management/:id/autonomy.',
          'Click any agent card → opens decision-log panel (last 50 decisions with rationale).',
          'Trigger an agent manually via the action menu (executes one of the agent\'s registered actions).',
          'Real-time fleet summary: total agents, active now, tasks today, average success rate.',
        ].map((line, i) => (
          <ListItem key={i}><ListItemIcon><CheckCircleIcon color="success" fontSize="small" /></ListItemIcon><ListItemText primary={line} primaryTypographyProps={{ fontSize: 14 }} /></ListItem>
        ))}
      </List>
      <Typography variant="h6" fontWeight={700} sx={{ mt: 3, mb: 1 }}>Endpoint reference</Typography>
      <CodeBlock copyKey="mc1">{`GET  /api/admin/agent-management/fleet-status
GET  /api/admin/agent-management/:agentId/decisions
PATCH /api/admin/agent-management/:agentId/autonomy
POST  /api/admin/agent-management/:agentId/trigger
POST  /api/admin/agent-management/:agentId/chat`}</CodeBlock>
    </Box>
  );

  const renderAgents = () => (
    <Box>
      <SectionTitle
        title="AI Agent Fleet"
        subtitle={`${AGENTS.length} autonomous agents (12 specialists + 6 C-suite). Use the search box (sidebar) to filter by role or domain.`}
      />
      <Grid container spacing={2}>
        {filteredAgents.map((a) => (
          <Grid item xs={12} md={6} key={a.id}>
            <Card sx={{
              height: '100%',
              borderLeft: `5px solid ${a.color}`,
              transition: 'all .25s',
              '&:hover': { transform: 'translateY(-3px)', boxShadow: 6 },
            }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1.25} sx={{ mb: 1 }}>
                  <Typography sx={{ fontSize: 24 }}>{a.emoji}</Typography>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Typography fontWeight={800} fontSize={16}>{a.name}</Typography>
                      <Chip size="small" label={`#${a.number}`} sx={{ height: 18, fontSize: 10, fontWeight: 700 }} />
                    </Stack>
                    <Typography variant="caption" color="text.secondary" noWrap>{a.role}</Typography>
                  </Box>
                  <Tooltip title={`Autonomy ${a.autonomy ?? 0}%`}>
                    <Box sx={{ width: 48, textAlign: 'right' }}>
                      <Typography fontFamily="ui-monospace, monospace" fontWeight={800} fontSize={12} sx={{ color: a.color }}>
                        {a.autonomy ?? 0}%
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={a.autonomy ?? 0}
                        sx={{ height: 3, borderRadius: 2, bgcolor: alpha(a.color, 0.15),
                          '& .MuiLinearProgress-bar': { bgcolor: a.color } }}
                      />
                    </Box>
                  </Tooltip>
                </Stack>
                <Typography variant="body2" sx={{ mb: 1.5 }}>{a.description}</Typography>
                <Typography variant="caption" sx={{ fontWeight: 700, opacity: 0.7, letterSpacing: 0.5 }}>DOMAINS</Typography>
                <Box sx={{ mt: 0.5, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {(a.domains || []).slice(0, 5).map((d, i) => (
                    <Chip key={i} size="small" label={d} variant="outlined" sx={{ height: 20, fontSize: 10.5 }} />
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  const renderOlympus = () => (
    <Box>
      <SectionTitle title="Project Olympus — AI Command Center" subtitle="The high-cognition layer that turns the fleet into a self-directed organisation." />
      <Alert severity="info" sx={{ mb: 2 }}>
        Olympus is composed of: <strong>Goal Dashboard</strong>, <strong>Agent Council Voting</strong>,
        <strong> Reasoning Trace Inspector</strong>, <strong>Dead-Letter Queue</strong>, and <strong>Circuit-Breaker monitors</strong>.
      </Alert>
      <Grid container spacing={2}>
        {[
          { t: 'Goal Dashboard',         d: 'Cross-agent OKRs. Apollo decomposes objectives, assigns to specialists, tracks completion. Endpoint: /api/admin/agent-management/goals.' },
          { t: 'Agent Council Voting',   d: 'Multi-agent quorum decisions for major actions. Default fleet of 18 voters, 60% majority, 6h expiry.' },
          { t: 'Reasoning Trace',        d: 'Inspect any agent\'s thought process: prompt, tool calls, tool outputs, final answer. Stored per execution.' },
          { t: 'Dead-Letter Queue',      d: 'Failed jobs are not lost — they queue here. Retry single jobs or dismiss them. /api/admin/agent-management/dead-letters.' },
          { t: 'Circuit Breakers',       d: 'Protects upstream APIs (Anthropic, OpenAI, Stripe). Auto-trips on repeated failures, half-open retry probes.' },
          { t: 'Collaborations Graph',   d: 'Visualises which agents are passing tasks to which. Helpful for spotting bottlenecks.' },
        ].map((m) => (
          <Grid item xs={12} md={6} key={m.t}>
            <Paper sx={{ p: 2, height: '100%', borderTop: '3px solid', borderColor: 'primary.main' }}>
              <Typography fontWeight={700}>{m.t}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{m.d}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  const renderGodMode = () => (
    <Box>
      <SectionTitle title="God Mode" subtitle="Operator override for any agent — from dashboard or Telegram." />
      <Alert severity="warning" sx={{ mb: 2 }}>
        <Typography fontWeight={700}>Use sparingly.</Typography>
        Bypasses agent autonomy & confidence learning. Every god-mode action is logged in AdminAction with actor + IP.
      </Alert>
      <Grid container spacing={2}>
        {[
          { t: 'Force-approve', d: 'Send a draft to a user even if confidence is below threshold.' },
          { t: 'Force-reject',  d: 'Discard a draft regardless of agent confidence.' },
          { t: 'Pause agent',   d: 'Stop the agent from accepting new work until resumed.' },
          { t: 'Override autonomy', d: 'Temporarily set autonomy to 0% (manual only) or 100% (full auto).' },
        ].map(x => (
          <Grid item xs={12} sm={6} key={x.t}>
            <Paper sx={{ p: 2 }}>
              <Typography fontWeight={700}>{x.t}</Typography>
              <Typography variant="body2" color="text.secondary">{x.d}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
      <Typography variant="h6" fontWeight={700} sx={{ mt: 3, mb: 1 }}>From Telegram</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        Tap 🛡 Control or send <code>/godmode</code>. Full command list: Docs → Telegram Control.
      </Typography>
      <CodeBlock copyKey="god1">{`/godmode
/agents
/disable 04-cortex too noisy
/enable 04-cortex
/fire 13-cmo          # irreversible — CONFIRM-XXXX`}</CodeBlock>
    </Box>
  );

  const renderTelegram = () => (
    <Box>
      <SectionTitle
        title="Telegram Control — Mission Control"
        subtitle="This is the only channel you use to talk to SoldiKeeper. Admin is the kitchen; Telegram is the cockpit."
      />

      <Alert severity="success" sx={{ mb: 2 }}>
        <Typography fontWeight={700}>Operator rule</Typography>
        Type like a person. Tap the pad. Slash commands are power-user. Never open admin for something Apollo can do in chat.
      </Alert>

      <Grid container spacing={1.5} sx={{ mb: 3 }}>
        {[
          { t: '/start once', d: 'Installs the pad + branded home' },
          { t: 'Tap a desk', d: 'Home · Studio · Revenue · Support · Fleet · Control' },
          { t: 'Or speak', d: '“make an IG reel about receipts”' },
          { t: 'Approve in-place', d: 'Packs, tickets, votes — buttons, not dashboards' },
        ].map((x) => (
          <Grid item xs={12} sm={6} md={3} key={x.t}>
            <Paper sx={{ p: 1.5, height: '100%', borderTop: '3px solid', borderColor: 'primary.main' }}>
              <Typography fontWeight={800} fontSize={13}>{x.t}</Typography>
              <Typography variant="caption" color="text.secondary">{x.d}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Typography variant="h6" fontWeight={800} sx={{ mb: 1 }}>1. Connect the bot</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        Railway (backend) environment. Without the allowlist, anyone who finds the bot can run admin tools — do not skip it.
      </Typography>
      <CodeBlock copyKey="tg-env">{`TELEGRAM_BOT_TOKEN=          # from @BotFather
TELEGRAM_WEBHOOK_SECRET=     # random string; set the same secret on the webhook
TELEGRAM_CHAT_ID=            # your private chat id (legacy single-admin)
TELEGRAM_ADMIN_CHAT_ID=      # where autonomous studio albums are delivered (cron/events)
TELEGRAM_ADMIN_CHAT_IDS=     # comma-separated allowlist of chat ids (required in prod)
TELEGRAM_ADMIN_USER_IDS=     # optional: restrict to your user id inside the chat

# Studio / media (reels with sound)
XAI_API_KEY=
MEDIA_DEMO_EMAIL=
MEDIA_DEMO_PASSWORD=
MEDIA_DAILY_SPEND_CAP=15`}</CodeBlock>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        Webhook URL (set in BotFather or via API):
      </Typography>
      <CodeBlock copyKey="tg-hook">{`https://<backend-host>/api/telegram/webhook
Header: X-Telegram-Bot-Api-Secret-Token = TELEGRAM_WEBHOOK_SECRET`}</CodeBlock>
      <Alert severity="warning" sx={{ mb: 3 }}>
        Find your chat id: message the bot, then open <code>https://api.telegram.org/bot&lt;TOKEN&gt;/getUpdates</code> and read <code>message.chat.id</code>.
        Put that id in <code>TELEGRAM_ADMIN_CHAT_IDS</code> and <code>TELEGRAM_ADMIN_CHAT_ID</code>.
      </Alert>

      <Typography variant="h6" fontWeight={800} sx={{ mb: 1 }}>2. First session</Typography>
      <List dense>
        {[
          'Open your SoldiKeeper bot → send /start (aliases: /home, /menu).',
          'You get a branded Mission Control card: health, MRR, tickets, escalations, studio spend.',
          'A persistent pad appears at the bottom of the keyboard. Leave it there. That is the product.',
          'Inline buttons on the card: Make a reel · Weekly drop · Tickets · MRR · Health · Charts · Refresh.',
          'Menu (☰) in Telegram lists the same desks: start, studio, status, tickets, mrr, agents, godmode, dashboard, health, help.',
        ].map((line, i) => (
          <ListItem key={i}><ListItemIcon><CheckCircleIcon color="success" fontSize="small" /></ListItemIcon><ListItemText primary={line} primaryTypographyProps={{ fontSize: 14 }} /></ListItem>
        ))}
      </List>

      <Typography variant="h6" fontWeight={800} sx={{ mt: 3, mb: 1 }}>3. The pad (primary UI)</Typography>
      <TableLikeList rows={TG_PAD} />
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 3 }}>
        The pad does not replace slash commands. It routes to them. If the pad vanishes after a client reset, send <code>/start</code> again.
      </Typography>

      <Typography variant="h6" fontWeight={800} sx={{ mb: 1 }}>4. Speak naturally (Apollo + tools)</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        Anything that is not a slash command or pad tap goes to Apollo with a tool list (tickets, Stripe, PRs, studio, God Mode…). He must call tools — not send you to admin.soldikeeper.
      </Typography>
      <TableLikeList rows={TG_NL_EXAMPLES} />
      <Alert severity="info" sx={{ mt: 1.5, mb: 3 }}>
        Conversations keep ~12 turns of history. Media generation is async: he queues a pack and the album arrives when renders finish (minutes, not the 45s chat timeout).
      </Alert>

      <Typography variant="h6" fontWeight={800} sx={{ mb: 1 }}>5. Studio — generate video, images, copy</Typography>
      <Alert severity="info" sx={{ mb: 1.5 }}>
        Instagram Reels and Stories are <strong>9:16</strong> (1080×1920). Square Instagram is feed-only. AI reels mix background music automatically
        (<code>energetic-pop</code> / <code>upbeat-tech</code> / <code>calm-corporate</code> in <code>assets/music/</code>) if FFmpeg is on the box.
      </Alert>
      <TableLikeList rows={TG_STUDIO} />
      <Typography fontWeight={700} sx={{ mt: 2, mb: 1 }}>Studio presets (buttons on the desk)</Typography>
      <Grid container spacing={1} sx={{ mb: 1 }}>
        {[
          ['🎞 Reel', '20s UGC Instagram reel — receipts'],
          ['📱 Story', '9:16 story still — SplitSmart'],
          ['🖼 Feed', '4:5 poster — AI insights'],
          ['📅 Week', 'Weekly drop pack'],
          ['🚀 Kit', 'Feature launch kit'],
          ['🏪 Store', 'Play Store pack'],
        ].map(([t, d]) => (
          <Grid item xs={12} sm={6} md={4} key={t}>
            <Paper sx={{ p: 1.25 }}>
              <Typography fontWeight={700} fontSize={13}>{t}</Typography>
              <Typography variant="caption" color="text.secondary">{d}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>When a pack is ready you receive:</Typography>
      <List dense>
        {[
          'Header card with pack type, aesthetic, campaignId, hook.',
          'Video(s) then a photo album of stills.',
          'Copy block: IG caption, TikTok caption, hashtags, first comment.',
          'Buttons: Keep all · Kill · More UGC · All 9:16 · Localize.',
          'Reply to that message with a tweak (“shorter hook”, “show the receipt screen”) to revise.',
        ].map((line, i) => (
          <ListItem key={i}><ListItemIcon><CheckCircleIcon color="success" fontSize="small" /></ListItemIcon><ListItemText primary={line} primaryTypographyProps={{ fontSize: 14 }} /></ListItem>
        ))}
      </List>
      <Typography fontWeight={700} sx={{ mt: 1, mb: 1 }}>Other inputs</Typography>
      <List dense sx={{ mb: 2 }}>
        <ListItem><ListItemIcon><SendIcon color="primary" fontSize="small" /></ListItemIcon><ListItemText primary="Photo of a competitor ad → counter-pack using that image as a Brand OS reference." /></ListItem>
        <ListItem><ListItemIcon><SendIcon color="primary" fontSize="small" /></ListItemIcon><ListItemText primary="Voice note → transcribed (OpenAI Whisper if OPENAI_API_KEY is set) then treated as a brief." /></ListItem>
      </List>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Files live on the backend disk, not GitHub:</Typography>
      <CodeBlock copyKey="tg-paths">{`uploads/ai-videos/       AI reels (Grok + FFmpeg + music)
uploads/videos/          Remotion / GitHub Actions MP4s
uploads/media-images/    Posters, stories, OG, store graphics
uploads/brand-assets/    Logos, live screenshots, Telegram photo refs
uploads/media-jobs/      Job JSON + spend.json
Mongo CreativeCampaign   Pack metadata, copy, decisions`}</CodeBlock>

      <Typography variant="h6" fontWeight={800} sx={{ mt: 3, mb: 1 }}>6. Support, users, money, fleet</Typography>
      {[
        ['Support tickets', TG_SUPPORT],
        ['Users', TG_USERS],
        ['Revenue & finance', TG_MONEY],
        ['Fleet, votes, constitution', TG_FLEET],
        ['Ops, charts, settings', TG_OPS],
      ].map(([title, rows]) => (
        <Accordion key={title} elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, mb: 1, '&::before': { display: 'none' } }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography fontWeight={700}>{title}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <TableLikeList rows={rows} />
          </AccordionDetails>
        </Accordion>
      ))}

      <Typography variant="h6" fontWeight={800} sx={{ mt: 3, mb: 1 }}>7. Approvals & danger</Typography>
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography fontWeight={800}>Confirm (tap)</Typography>
            <Typography variant="body2" color="text.secondary">
              Destructive-but-reversible actions (delete ticket, maintenance, bulk mail). Message shows <strong>Confirm / Cancel</strong>. Expires in 60s. You can still type YES.
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%', border: '1px solid', borderColor: 'error.main' }}>
            <Typography fontWeight={800} color="error.main">Step-up (irreversible)</Typography>
            <Typography variant="body2" color="text.secondary">
              GDPR erase, user delete, fire agent, deploy rollback, auto-merge PR. Tap the green button <em>or</em> type <code>CONFIRM-XXXX</code> within ~30s. Single-use.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Escalation messages still carry Approve · Reject · Modify. Council votes and proposals have tap-to-decide buttons. Studio Keep marks a pack <code>approved_for_posting</code> — it does <strong>not</strong> auto-post to Instagram.
      </Typography>

      <Typography variant="h6" fontWeight={800} sx={{ mb: 1 }}>8. Safety</Typography>
      <List dense sx={{ mb: 2 }}>
        {[
          'Only chats in TELEGRAM_ADMIN_CHAT_IDS are answered. Everyone else is dropped silently.',
          'Optional TELEGRAM_ADMIN_USER_IDS locks the bot to your user inside a group.',
          'Webhook secret stops random POSTs to /api/telegram/webhook.',
          'Studio Grok spend is capped (default $15/day). /studio bump 10 raises it.',
          'Euro savings claims in creatives must be sourced; otherwise copy is qualitative.',
          'There is no Instagram/WhatsApp command surface. Telegram only.',
        ].map((line, i) => (
          <ListItem key={i}><ListItemIcon><SecurityIcon color="warning" fontSize="small" /></ListItemIcon><ListItemText primary={line} primaryTypographyProps={{ fontSize: 14 }} /></ListItem>
        ))}
      </List>

      <Typography variant="h6" fontWeight={800} sx={{ mb: 1 }}>9. If something is wrong</Typography>
      <Accordion elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, mb: 1, '&::before': { display: 'none' } }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}><Typography fontWeight={700}>Bot ignores me</Typography></AccordionSummary>
        <AccordionDetails>
          <Typography variant="body2" color="text.secondary">
            Your chat id is not in TELEGRAM_ADMIN_CHAT_IDS, or the webhook secret does not match. Send /webhook_status from an allowlisted chat, or check Railway logs for “Unauthorized”.
          </Typography>
        </AccordionDetails>
      </Accordion>
      <Accordion elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, mb: 1, '&::before': { display: 'none' } }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}><Typography fontWeight={700}>Pad disappeared</Typography></AccordionSummary>
        <AccordionDetails>
          <Typography variant="body2" color="text.secondary">Send /start again. The pad is a ReplyKeyboard; Telegram drops it if you chose “Hide keyboard” or switched devices.</Typography>
        </AccordionDetails>
      </Accordion>
      <Accordion elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, mb: 1, '&::before': { display: 'none' } }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}><Typography fontWeight={700}>Pack queued, no album</Typography></AccordionSummary>
        <AccordionDetails>
          <Typography variant="body2" color="text.secondary">
            Renders take 1–5 minutes. /studio shows queue. Need XAI_API_KEY. Remotion videos also need TOKEN_GITHUB + GITHUB_RENDER_REPO.
            Cron packs need TELEGRAM_ADMIN_CHAT_ID. Silent MP4s: FFmpeg or assets/music/*.mp3 missing on Railway.
          </Typography>
        </AccordionDetails>
      </Accordion>
      <Accordion elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, mb: 1, '&::before': { display: 'none' } }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}><Typography fontWeight={700}>“AI unavailable”</Typography></AccordionSummary>
        <AccordionDetails>
          <Typography variant="body2" color="text.secondary">
            Natural language needs ANTHROPIC_API_KEY and/or XAI_API_KEY. Slash commands still work without an LLM.
          </Typography>
        </AccordionDetails>
      </Accordion>
      <Accordion elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, mb: 3, '&::before': { display: 'none' } }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}><Typography fontWeight={700}>Voice notes not transcribed</Typography></AccordionSummary>
        <AccordionDetails>
          <Typography variant="body2" color="text.secondary">Set OPENAI_API_KEY (Whisper). Otherwise type the brief or use /studio make.</Typography>
        </AccordionDetails>
      </Accordion>

      <Typography variant="h6" fontWeight={800} sx={{ mb: 1 }}>Cheat sheet</Typography>
      <CodeBlock copyKey="tg-cheat">{`/start
# pad: Home | Studio | Revenue | Support | Fleet | Control

/studio make Instagram reel, UGC, receipt scanning
/studio week
/studio store
/studio spend

make an IG reel about SplitSmart          # natural language
[send photo of competitor ad]             # counter-pack
[reply on album] shorter hook             # revise

/tickets
/mrr
/agents
/godmode

# irreversible — wait for CONFIRM-XXXX
/gdpr user@email
/deleteuser user@email
/fire 13-cmo`}</CodeBlock>
    </Box>
  );

  const renderLLM = () => (
    <Box>
      <SectionTitle title="LLM Cost Tracker" subtitle="Every token you spend, attributed and queryable." />
      <Alert severity="success" sx={{ mb: 2 }}>
        Costs are persisted in the <strong>LLMCostLog</strong> collection — they survive deploys.
      </Alert>
      <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>Available drilldowns (Admin → AI → LLM Control)</Typography>
      <List dense>
        {[
          'Per-model breakdown (Sonnet 4.6, Haiku 4.5, GPT-4, Grok-3).',
          'Per-agent breakdown — see exactly which agent burns the most tokens.',
          'Per-feature breakdown (chat, escalations, insights, OCR-LLM, broadcast drafts).',
          'Per-user breakdown — top 50 users by token spend.',
          'Date-range picker (24h / 7d / 30d / custom).',
          'Cost projection: estimated monthly spend at current burn rate.',
        ].map((line, i) => (
          <ListItem key={i}><ListItemIcon><CheckCircleIcon color="success" fontSize="small" /></ListItemIcon><ListItemText primary={line} primaryTypographyProps={{ fontSize: 14 }} /></ListItem>
        ))}
      </List>
      <Typography variant="h6" fontWeight={700} sx={{ mt: 3, mb: 1 }}>Endpoint</Typography>
      <CodeBlock copyKey="llm1">{`GET /api/admin/agent-management/llm-costs
    ?period=7d&groupBy=agent|model|feature|user`}</CodeBlock>
    </Box>
  );

  const renderEscalations = () => (
    <Box>
      <SectionTitle title="Escalations" subtitle="Human-in-the-loop oversight for low-confidence AI decisions." />
      <Alert severity="warning" sx={{ mb: 2 }}>
        Triggered when AI confidence falls below the per-agent threshold (default 80%, learned over time).
      </Alert>
      <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>States</Typography>
      <Stack direction="row" spacing={1} sx={{ mb: 3, flexWrap: 'wrap' }}>
        {['pending', 'approved', 'rejected', 'modified', 'expired'].map(s => (
          <Chip key={s} label={s} color={s === 'approved' ? 'success' : s === 'rejected' || s === 'expired' ? 'error' : 'default'} />
        ))}
      </Stack>
      <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>Auto-expiry timeline</Typography>
      <Stack spacing={1.5}>
        <Paper sx={{ p: 2, borderLeft: '4px solid #f59e0b' }}>
          <Typography fontWeight={700}>2 hours: re-ping admin</Typography>
          <Typography variant="body2" color="text.secondary">Telegram nudge sent.</Typography>
        </Paper>
        <Paper sx={{ p: 2, borderLeft: '4px solid #ef4444' }}>
          <Typography fontWeight={700}>4 hours: auto-expire</Typography>
          <Typography variant="body2" color="text.secondary">User receives a holding message; escalation marked expired.</Typography>
        </Paper>
      </Stack>
    </Box>
  );

  const renderTickets = () => (
    <Box>
      <SectionTitle title="Support Tickets" subtitle="AI-powered ticket triage. SupportL1 (#15) responds instantly, escalates the rest." />
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 3, flexWrap: 'wrap' }}>
        {['open', 'in_progress', 'waiting_user', 'resolved', 'closed'].map((s, i, a) => (
          <React.Fragment key={s}>
            <Chip label={s} color={s === 'resolved' || s === 'closed' ? 'success' : 'default'} />
            {i < a.length - 1 && <Typography>→</Typography>}
          </React.Fragment>
        ))}
      </Stack>
      <Alert severity="success" sx={{ mb: 2 }}>
        <Typography fontWeight={700}>Auto-response active</Typography>
        SupportL1 scans every 15 min and replies on new ticket creation. Ticket auto-closes 7 days after resolution if no reply.
      </Alert>
      <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>Priority colours</Typography>
      <Grid container spacing={1.5}>
        {[{ p: 'low', c: '#9ca3af' }, { p: 'normal', c: '#3b82f6' }, { p: 'high', c: '#f59e0b' }, { p: 'urgent', c: '#ef4444' }].map(x => (
          <Grid item xs={6} sm={3} key={x.p}>
            <Paper sx={{ p: 1.5, textAlign: 'center', borderTop: `4px solid ${x.c}` }}>
              <Typography fontWeight={700} textTransform="uppercase" fontSize={13}>{x.p}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  const renderUsers = () => (
    <Box>
      <SectionTitle title="User Management" subtitle="Search, filter, modify, ban, and trial-grant." />
      <List>
        {[
          'Search by email, name, subscription tier, last login.',
          'Row actions: View profile · Grant trial · Reset password · Ban · Force-logout.',
          'Bulk actions: export CSV/XLSX · send broadcast notification · change tier.',
          'Profile pane: subscription, transaction count, last login, IP history, attached devices.',
          'Roles: user · admin · super_admin (all role gating done in middleware).',
        ].map((line, i) => (
          <ListItem key={i}><ListItemIcon><CheckCircleIcon color="success" fontSize="small" /></ListItemIcon><ListItemText primary={line} /></ListItem>
        ))}
      </List>
    </Box>
  );

  const renderSecurity = () => (
    <Box>
      <SectionTitle title="Security Center" subtitle="Sentinel (#01) guards the platform 24/7." />
      <List>
        {[
          'Failed-login monitor — auto-blocks IP after 10 failures in 5 min.',
          'Suspicious account heuristics (anomalous login geo, rapid signup bursts).',
          'Manual security scan via /security on Telegram.',
          'Audit log: every admin action, every escalation decision, every god-mode toggle.',
          'GDPR: full account deletion endpoint (DELETE /api/auth/account).',
        ].map((line, i) => (
          <ListItem key={i}><ListItemIcon><CheckCircleIcon color="success" fontSize="small" /></ListItemIcon><ListItemText primary={line} /></ListItem>
        ))}
      </List>
    </Box>
  );

  const renderAPI = () => (
    <Box>
      <SectionTitle title="API Reference (admin endpoints)" subtitle="All endpoints require Bearer token + role: admin or super_admin." />
      <Stack spacing={1}>
        {[
          { m: 'GET',   p: '/api/admin/stats',                                d: 'Aggregate platform stats' },
          { m: 'GET',   p: '/api/admin/realtime',                             d: 'Real-time WS-backed metrics' },
          { m: 'GET',   p: '/api/admin/users',                                d: 'Paginated users list' },
          { m: 'GET',   p: '/api/admin/transactions',                         d: 'Cross-user transactions' },
          { m: 'GET',   p: '/api/admin/agent-management/fleet-status',        d: 'All-agent live status' },
          { m: 'PATCH', p: '/api/admin/agent-management/:agentId/autonomy',   d: 'Set autonomy %' },
          { m: 'POST',  p: '/api/admin/agent-management/:agentId/trigger',    d: 'Manually run an agent action' },
          { m: 'POST',  p: '/api/admin/agent-management/:agentId/chat',       d: 'Talk to an agent' },
          { m: 'GET',   p: '/api/admin/agent-management/llm-costs',           d: 'LLM cost drilldown' },
          { m: 'GET',   p: '/api/admin/agent-management/dead-letters',        d: 'Failed-job queue' },
          { m: 'GET',   p: '/api/admin/agent-management/reasoning-traces',    d: 'Per-execution reasoning' },
          { m: 'POST',  p: '/api/admin/godmode/escalations/:id/approve',      d: 'God-mode override approve' },
          { m: 'POST',  p: '/api/admin/godmode/escalations/:id/reject',       d: 'God-mode override reject' },
          { m: 'GET',   p: '/api/admin/godmode/goals/snapshot/fleet',         d: 'Fleet goal snapshot' },
        ].map((e) => (
          <Paper key={e.p + e.m} sx={{ p: 1.25, display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Chip
              size="small"
              label={e.m}
              sx={{
                fontFamily: 'ui-monospace, monospace', fontWeight: 800, minWidth: 60,
                bgcolor: e.m === 'GET' ? alpha(theme.palette.success.main, 0.15) : alpha(theme.palette.primary.main, 0.15),
                color: e.m === 'GET' ? 'success.main' : 'primary.main',
              }}
            />
            <Typography sx={{ fontFamily: 'ui-monospace, monospace', fontSize: 12.5, flex: 1 }}>{e.p}</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>{e.d}</Typography>
          </Paper>
        ))}
      </Stack>
    </Box>
  );

  const renderFAQ = () => (
    <Box>
      <SectionTitle title="Frequently Asked Questions" />
      {FAQ_ITEMS.map((f, i) => (
        <Accordion key={i} elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, mb: 1, '&::before': { display: 'none' } }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography fontWeight={700} fontSize={14}>{f.q}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2" color="text.secondary">{f.a}</Typography>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );

  const renderSection = () => {
    switch (activeSection) {
      case 'overview':        return renderOverview();
      case 'getting-started': return renderGettingStarted();
      case 'mission-control': return renderMissionControl();
      case 'agents':          return renderAgents();
      case 'olympus':         return renderOlympus();
      case 'godmode':         return renderGodMode();
      case 'telegram':        return renderTelegram();
      case 'llm':             return renderLLM();
      case 'escalations':     return renderEscalations();
      case 'tickets':         return renderTickets();
      case 'users':           return renderUsers();
      case 'security':        return renderSecurity();
      case 'api':             return renderAPI();
      case 'faq':             return renderFAQ();
      default:                return renderOverview();
    }
  };

  return (
    <Box sx={{ display: 'flex', height: '100%', minHeight: 600, bgcolor: 'background.default' }}>
      {!isMobile ? (
        <Box
          sx={{
            width: DRAWER_WIDTH,
            borderRight: `1px solid ${theme.palette.divider}`,
            bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.common.black, 0.25) : alpha(theme.palette.grey[100], 0.7),
            flexShrink: 0,
          }}
        >
          {sidebar}
        </Box>
      ) : (
        <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} ModalProps={{ keepMounted: true }}>
          {sidebar}
        </Drawer>
      )}

      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <AppBar position="static" elevation={0} color="transparent" sx={{ borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Toolbar variant="dense" sx={{ gap: 1 }}>
            {isMobile && (
              <IconButton size="small" onClick={() => setDrawerOpen(true)}><MenuRounded /></IconButton>
            )}
            {onBack && (
              <IconButton size="small" onClick={onBack}><ArrowBackIcon fontSize="small" /></IconButton>
            )}
            <Typography sx={{ fontWeight: 700, fontSize: 14, opacity: 0.7 }}>Operator Handbook</Typography>
            <Chip size="small" label={DOC_SECTIONS.find(s => s.id === activeSection)?.label || ''} sx={{ ml: 0.5 }} />
            <Box sx={{ flex: 1 }} />
            <Button size="small" startIcon={<ReceiptIcon />} onClick={() => goto('api')}>API</Button>
            <Button size="small" startIcon={<ChatIcon />} onClick={() => goto('telegram')}>Telegram</Button>
          </Toolbar>
        </AppBar>
        <Box sx={{ flex: 1, overflowY: 'auto', p: { xs: 2, md: 4 } }}>
          <Container maxWidth="lg" disableGutters>
            {renderSection()}
          </Container>
        </Box>
      </Box>
    </Box>
  );
};

export default AdminDocumentation;
