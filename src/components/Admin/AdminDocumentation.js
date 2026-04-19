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

const TELEGRAM_CMDS = [
  { cmd: '/start',       desc: 'Bind your admin account' },
  { cmd: '/status',      desc: 'Live system status snapshot' },
  { cmd: '/fleet',       desc: 'List all 18 agents with statuses' },
  { cmd: '/scorecards',  desc: 'Per-agent performance scorecards' },
  { cmd: '/goalsfleet',  desc: 'Active OKRs across the fleet' },
  { cmd: '/insights',    desc: 'Trigger Cortex weekly insights now' },
  { cmd: '/security',    desc: 'Run Sentinel security scan' },
  { cmd: '/escalations', desc: 'List pending escalations' },
  { cmd: '/approve <id>',desc: 'Approve an escalation draft' },
  { cmd: '/reject <id>', desc: 'Reject an escalation draft' },
  { cmd: '/trial <email> <days>', desc: 'Grant a trial to a user' },
  { cmd: '/ban <email>', desc: 'Suspend a user account' },
  { cmd: '/broadcast <msg>', desc: 'Send notification to all users' },
  { cmd: '/godmode on|off',  desc: 'Toggle god-mode (autonomy override)' },
  { cmd: '/help',        desc: 'Show all commands' },
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
    a: 'A platform-wide override letting an admin force-approve, force-reject, or pause any agent in real time, both from the admin dashboard and from Telegram inline buttons.' },
  { q: 'How do I add a new agent capability?',
    a: '1) add the action to ACTION_REGISTRY in services/agentActions.js. 2) define a tool in CLAUDE_TOOLS (routes/agentManagement.routes.js). 3) deploy.' },
  { q: 'Where is the audit trail?',
    a: 'AdminAction collection — every admin action, every escalation decision, and every god-mode toggle is logged with actor, target, timestamp and IP.' },
];

const TableLikeList = ({ rows }) => (
  <Stack spacing={0.5}>
    {rows.map((r, i) => (
      <Paper key={i} sx={{ p: 1.25, display: 'flex', gap: 2, alignItems: 'center' }}>
        <Typography sx={{ fontFamily: 'ui-monospace, monospace', fontSize: 12.5, fontWeight: 700, minWidth: 180 }}>
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
    return DOC_SECTIONS.filter(s => s.label.toLowerCase().includes(q));
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
          <Typography sx={{ fontSize: 10.5, opacity: 0.65, letterSpacing: 0.5 }}>OPERATOR HANDBOOK · v2.0</Typography>
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
        { n: 3, t: 'Connect Telegram (optional)',    d: 'In Settings → Telegram, paste your chat ID. Send /start to bind. Inline buttons let you approve/reject from your phone.' },
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
      <Typography variant="h6" fontWeight={700} sx={{ mt: 3, mb: 1 }}>Enable from Telegram</Typography>
      <CodeBlock copyKey="god1">{`/godmode on             # enable globally
/godmode off            # disable
/godmode pause apollo   # pause one agent
/godmode resume apollo  # resume`}</CodeBlock>
    </Box>
  );

  const renderTelegram = () => (
    <Box>
      <SectionTitle title="Telegram Control" subtitle="Run the entire platform from your phone — chat, approve, broadcast, monitor." />
      <Alert severity="info" sx={{ mb: 2 }}>
        Set <code>TELEGRAM_BOT_TOKEN</code> + <code>TELEGRAM_WEBHOOK_SECRET</code> on Railway. Then send <code>/start</code> to your bot.
      </Alert>
      <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>Commands</Typography>
      <TableLikeList rows={TELEGRAM_CMDS.map(c => ({ left: c.cmd, right: c.desc }))} />
      <Typography variant="h6" fontWeight={700} sx={{ mt: 3, mb: 1 }}>Inline buttons</Typography>
      <Typography variant="body2" color="text.secondary">
        Every escalation message includes <strong>Approve · Reject · Modify · Snooze</strong> buttons. Status messages include <strong>Refresh · Drill</strong> buttons.
        Agent chats include a <strong>Hand off</strong> button to transfer the conversation to another agent.
      </Typography>
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
