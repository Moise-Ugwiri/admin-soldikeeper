/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  📐  SK AGENTIC BLUEPRINT                                       ║
 * ║  Deep-dive architecture report rendered inside the command center║
 * ╚══════════════════════════════════════════════════════════════════╝
 *
 * A self-contained, scrollable, dark-themed reference panel that explains
 * every layer of the SoldiKeeper agentic AI architecture — execution model,
 * agent roster, constitutional engine, governance democracy, self-improvement
 * loop, orchestration, and known gaps.
 */

import React, { useState } from 'react';
import {
  Box, Typography, Grid, Paper, Chip, Accordion,
  AccordionSummary, AccordionDetails, Table, TableHead, TableRow,
  TableCell, TableBody, TableContainer, Alert, alpha,
  LinearProgress, Stack,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Hub as HubIcon,
  Shield as ShieldIcon,
  MonitorHeart as WatchIcon,
  Storage as AtlasIcon,
  Gavel as GavelIcon,
  BarChart as BarIcon,
  AutoAwesome as AutoIcon,
  Loop as LoopIcon,
  Timeline as TimelineIcon,
  Warning as WarnIcon,
  CenterFocusStrong as OodaIcon,
} from '@mui/icons-material';

/* ─── design tokens (mirror CommandCenter palette) ─── */
const MC = {
  bg:       '#060c18',
  surface:  'rgba(255,255,255,0.035)',
  panel:    'rgba(255,255,255,0.06)',
  border:   'rgba(255,255,255,0.07)',
  text:     '#e8f4fd',
  slate:    '#7a8fa6',
  green:    '#10b981',
  blue:     '#38bdf8',
  violet:   '#a78bfa',
  amber:    '#fbbf24',
  rose:     '#f43f5e',
  cyan:     '#22d3ee',
  indigo:   '#6366f1',
  orange:   '#fb923c',
  teal:     '#2dd4bf',
};

/* ─── tiny helper ─── */
const Section = ({ title, icon, color = MC.blue, children, defaultExpanded = true }) => (
  <Accordion
    defaultExpanded={defaultExpanded}
    disableGutters
    elevation={0}
    sx={{
      background: MC.surface,
      border: `1px solid ${alpha(color, 0.18)}`,
      borderRadius: '12px !important',
      mb: 2,
      '&::before': { display: 'none' },
      overflow: 'hidden',
    }}
  >
    <AccordionSummary
      expandIcon={<ExpandMoreIcon sx={{ color }} />}
      sx={{
        borderBottom: `1px solid ${alpha(color, 0.12)}`,
        background: `linear-gradient(90deg, ${alpha(color, 0.07)}, transparent)`,
        px: 2.5,
        minHeight: 52,
        '& .MuiAccordionSummary-content': { my: 0 },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box sx={{ color, display: 'flex' }}>{icon}</Box>
        <Typography sx={{ fontWeight: 700, color: MC.text, letterSpacing: 0.3, fontSize: '0.95rem' }}>
          {title}
        </Typography>
      </Box>
    </AccordionSummary>
    <AccordionDetails sx={{ p: 2.5 }}>
      {children}
    </AccordionDetails>
  </Accordion>
);

const Tag = ({ label, color = MC.blue }) => (
  <Chip label={label} size="small" sx={{
    bgcolor: alpha(color, 0.12),
    color,
    border: `1px solid ${alpha(color, 0.3)}`,
    fontWeight: 600,
    fontSize: '0.7rem',
  }} />
);

const Prose = ({ children, sx = {} }) => (
  <Typography variant="body2" sx={{ color: MC.slate, lineHeight: 1.85, ...sx }}>
    {children}
  </Typography>
);

const Highlight = ({ children, color = MC.blue }) => (
  <Box component="span" sx={{ color, fontWeight: 700 }}>{children}</Box>
);

const CodeBlock = ({ children }) => (
  <Box component="pre" sx={{
    background: 'rgba(0,0,0,0.45)',
    border: `1px solid ${alpha(MC.green, 0.18)}`,
    borderRadius: 2,
    p: 2,
    overflowX: 'auto',
    fontFamily: '"JetBrains Mono", "Fira Code", monospace',
    fontSize: '0.72rem',
    color: MC.green,
    lineHeight: 1.7,
    my: 1.5,
    '&::-webkit-scrollbar': { height: 4 },
    '&::-webkit-scrollbar-thumb': { bgcolor: alpha(MC.green, 0.3), borderRadius: 2 },
  }}>
    {children}
  </Box>
);

const FlowStep = ({ n, label, sub, color = MC.blue, arrow = true }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0 }}>
    <Box sx={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      background: alpha(color, 0.12),
      border: `1px solid ${alpha(color, 0.35)}`,
      borderRadius: 2,
      px: 2, py: 1.25,
      minWidth: 100, textAlign: 'center',
    }}>
      <Typography sx={{ color, fontWeight: 800, fontSize: '0.7rem', letterSpacing: 1 }}>{n}</Typography>
      <Typography sx={{ color: MC.text, fontWeight: 700, fontSize: '0.78rem', mt: 0.25 }}>{label}</Typography>
      {sub && <Typography sx={{ color: MC.slate, fontSize: '0.65rem', mt: 0.25 }}>{sub}</Typography>}
    </Box>
    {arrow && (
      <Box sx={{ color: alpha(color, 0.5), mx: 0.5, fontSize: '1.2rem', lineHeight: 1 }}>→</Box>
    )}
  </Box>
);

/* ─── agent roster data ─── */
const AGENTS_DATA = [
  { id: '00', name: 'Apollo',     emoji: '⚡', role: 'Chief Orchestrator',           domain: 'Coordination, Fleet Mgmt, Task Decomposition', autonomy: 95, temp: 0.4, color: MC.amber   },
  { id: '01', name: 'Sentinel',   emoji: '🛡️', role: 'Security Guardian',            domain: 'Auth, JWT/OAuth, RBAC, GDPR, Threats',         autonomy: 55, temp: 0.2, color: MC.blue    },
  { id: '02', name: 'Ledger',     emoji: '📒', role: 'Financial Core',               domain: 'Transactions, Budgets, Rollover, Recurring',   autonomy: 50, temp: 0.3, color: MC.green   },
  { id: '03', name: 'Vision',     emoji: '👁️', role: 'Document AI',                  domain: 'Receipt OCR, LLM Extraction, Doc Intelligence', autonomy: 70, temp: 0.3, color: MC.cyan    },
  { id: '04', name: 'Cortex',     emoji: '🧠', role: 'AI Insights Engine',           domain: 'Spending Patterns, NLP Actions, Recs',         autonomy: 75, temp: 0.5, color: MC.violet  },
  { id: '05', name: 'Vault',      emoji: '🔐', role: 'Payments & Subs',              domain: 'Stripe, Subscription Lifecycle, Recovery',     autonomy: 65, temp: 0.3, color: MC.indigo  },
  { id: '06', name: 'Nexus',      emoji: '🕸️', role: 'Social Expense Engine',        domain: 'SplitBill, SplitSmart, Debt, Settlements',     autonomy: 65, temp: 0.4, color: MC.teal    },
  { id: '07', name: 'Watchtower', emoji: '🔭', role: 'Admin Intelligence',           domain: 'Real-time Monitor, WebSocket, RBAC, Audit',    autonomy: 70, temp: 0.3, color: MC.blue    },
  { id: '08', name: 'Prism',      emoji: '🌈', role: 'Frontend Architect',           domain: 'React, MUI Theme, Routing, Design System',     autonomy: 60, temp: 0.5, color: MC.violet  },
  { id: '09', name: 'Forge',      emoji: '🔨', role: 'Mobile Build Engineer',        domain: 'Capacitor, Android, Biometrics, Play Store',   autonomy: 60, temp: 0.4, color: MC.orange  },
  { id: '10', name: 'Atlas',      emoji: '🗺️', role: 'Infrastructure Manager',       domain: 'MongoDB, Express, Railway/Vercel, Logging',    autonomy: 50, temp: 0.3, color: MC.rose    },
  { id: '11', name: 'Babel',      emoji: '🗣️', role: 'Internationalization',         domain: 'Language Dist, Translation Coverage, i18n',    autonomy: 70, temp: 0.4, color: MC.amber   },
];

const CONSTITUTIONAL_RULES = [
  { rule: 'no-spend-over-$50',               outcome: 'require_human_approval', authority: 'hard' },
  { rule: 'GDPR-deletion-requires-human',    outcome: 'require_human_approval', authority: 'hard' },
  { rule: 'auth-code-requires-review',       outcome: 'require_human_approval', authority: 'hard' },
  { rule: 'pricing-change-requires-council', outcome: 'require_council_vote',   authority: 'hard' },
  { rule: 'mass-email-over-500',             outcome: 'require_human_approval', authority: 'hard' },
];

const GAPS = [
  { id: 1, title: 'No Agent-to-Agent Direct Comms', priority: 'HIGH',   color: MC.rose,   desc: 'All inter-agent messages route via Apollo. No real-time peer pub/sub.' },
  { id: 2, title: 'Sequential OODA Loop Only',      priority: 'HIGH',   color: MC.rose,   desc: 'Tasks execute steps in serial. Independent sub-tasks cannot parallelise.' },
  { id: 3, title: 'Rule Cache Not Hot-Reloadable',  priority: 'HIGH',   color: MC.rose,   desc: 'Rule changes take up to 30s to propagate. Emergency blocks are delayed.' },
  { id: 4, title: 'Scorecards Are Retrospective',   priority: 'MEDIUM', color: MC.amber,  desc: 'No 1-hour leading indicator. Degradation detected only after 60% threshold.' },
  { id: 5, title: 'No Ephemeral Promotion Path',    priority: 'MEDIUM', color: MC.amber,  desc: 'Well-performing ephemeral agents expire at TTL with no upgrade mechanism.' },
  { id: 6, title: 'Knowledge Graph Not Agent-Accessible', priority: 'MEDIUM', color: MC.amber, desc: 'KG is admin-only. Agents cannot enrich OODA context with institutional memory.' },
  { id: 7, title: 'No Cross-Agent Learning',        priority: 'MEDIUM', color: MC.amber,  desc: 'Self-improvement loops are isolated. Systemic failures are not correlated.' },
  { id: 8, title: 'LLM Fallback Cliff',             priority: 'LOW',    color: MC.green,  desc: 'Claude unavailable → template strings. No Haiku middle-tier fallback.' },
];

/* ═══════════════════════════════════════════════
 *  MAIN COMPONENT
 * ═══════════════════════════════════════════════ */
const AgenticBlueprintTab = () => {
  const [expandedGap, setExpandedGap] = useState(null);

  return (
    <Box sx={{ color: MC.text, pb: 6 }}>

      {/* ── HERO HEADER ── */}
      <Box sx={{
        background: `linear-gradient(135deg, ${alpha(MC.violet, 0.12)}, ${alpha(MC.blue, 0.06)}, transparent)`,
        border: `1px solid ${alpha(MC.violet, 0.15)}`,
        borderRadius: 3,
        p: { xs: 2.5, md: 4 },
        mb: 3,
        position: 'relative',
        overflow: 'hidden',
      }}>
        <Box sx={{
          position: 'absolute', top: -40, right: -40,
          width: 180, height: 180,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha(MC.violet, 0.12)}, transparent 70%)`,
          pointerEvents: 'none',
        }} />
        <Stack direction="row" spacing={1.5} sx={{ mb: 1.5, flexWrap: 'wrap', gap: 0.75 }}>
          <Tag label="PROJECT OLYMPUS" color={MC.violet} />
          <Tag label="18 AGENTS" color={MC.blue} />
          <Tag label="CLAUDE SONNET 4.6" color={MC.cyan} />
          <Tag label="OODA LOOP" color={MC.green} />
          <Tag label="CONSTITUTIONAL AI" color={MC.amber} />
        </Stack>
        <Typography variant="h4" sx={{ fontWeight: 900, color: MC.text, mb: 1, lineHeight: 1.2 }}>
          SK Agentic Architecture
        </Typography>
        <Typography variant="h6" sx={{ fontWeight: 400, color: MC.violet, mb: 2 }}>
          A Self-Governing AI Corporation Inside a Personal Finance Product
        </Typography>
        <Prose>
          SoldiKeeper is not a fintech app with a chatbot bolted on. It is a{' '}
          <Highlight color={MC.violet}>self-governing AI corporation</Highlight> — twelve autonomous specialist
          agents, coordinated by a chief orchestrator, run the platform's engineering, security, financial logic,
          infrastructure, and product intelligence with minimal human intervention. The human operator governs
          through <Highlight color={MC.amber}>constitutional rules</Highlight>,{' '}
          <Highlight color={MC.green}>council votes</Highlight>, and this God Mode control plane.
          Every agent runs the OODA loop, every action is pre-cleared by the constitutional engine, and the
          system can <Highlight color={MC.cyan}>propose, vote on, and apply improvements to itself</Highlight>.
        </Prose>
      </Box>

      {/* ── 1. AGENT ROSTER ── */}
      <Section title="1 · The Agent Corporation — Full Roster" icon={<HubIcon />} color={MC.blue}>
        <Prose sx={{ mb: 2 }}>
          All 12 core specialists (IDs 00–11) extend the <code>AutonomousAgent</code> base class.
          Six C-suite agents (CFO, CMO, CS, Support, Legal, HR) extend the same base, bringing the
          total fleet to <Highlight color={MC.blue}>18 agents</Highlight>. Each agent has a dedicated
          LLM temperature tuned to its risk profile — Sentinel runs at 0.2 for maximum precision,
          Cortex at 0.5 for creative insight generation.
        </Prose>
        <TableContainer component={Paper} elevation={0} sx={{ background: 'transparent', border: `1px solid ${MC.border}`, borderRadius: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ background: alpha(MC.blue, 0.06) }}>
                {['#', 'Agent', 'Role', 'Domain', 'Autonomy', 'LLM Temp'].map(h => (
                  <TableCell key={h} sx={{ color: MC.slate, fontWeight: 700, fontSize: '0.72rem', borderColor: MC.border, py: 1 }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {AGENTS_DATA.map(a => (
                <TableRow key={a.id} sx={{ '&:hover': { background: alpha(a.color, 0.04) }, transition: 'background 0.2s' }}>
                  <TableCell sx={{ color: MC.slate, borderColor: MC.border, fontSize: '0.72rem', py: 0.75 }}>{a.id}</TableCell>
                  <TableCell sx={{ borderColor: MC.border, py: 0.75 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                      <span style={{ fontSize: '1rem' }}>{a.emoji}</span>
                      <Typography sx={{ color: a.color, fontWeight: 700, fontSize: '0.8rem' }}>{a.name}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ color: MC.text, borderColor: MC.border, fontSize: '0.75rem', py: 0.75 }}>{a.role}</TableCell>
                  <TableCell sx={{ color: MC.slate, borderColor: MC.border, fontSize: '0.7rem', py: 0.75, maxWidth: 200 }}>{a.domain}</TableCell>
                  <TableCell sx={{ borderColor: MC.border, py: 0.75 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LinearProgress
                        variant="determinate"
                        value={a.autonomy}
                        sx={{
                          width: 56, height: 5, borderRadius: 3,
                          bgcolor: alpha(a.color, 0.15),
                          '& .MuiLinearProgress-bar': { bgcolor: a.color, borderRadius: 3 },
                        }}
                      />
                      <Typography sx={{ color: a.color, fontWeight: 700, fontSize: '0.72rem' }}>{a.autonomy}%</Typography>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ borderColor: MC.border, py: 0.75 }}>
                    <Chip label={a.temp} size="small" sx={{ bgcolor: alpha(MC.violet, 0.12), color: MC.violet, fontWeight: 700, fontSize: '0.68rem', height: 20 }} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ mt: 2.5, p: 2, background: alpha(MC.amber, 0.06), border: `1px solid ${alpha(MC.amber, 0.18)}`, borderRadius: 2 }}>
          <Typography sx={{ color: MC.amber, fontWeight: 700, fontSize: '0.8rem', mb: 0.5 }}>Autonomy Policy</Typography>
          <Prose>
            Ledger (02) and Atlas (10) are <Highlight color={MC.rose}>gated</Highlight> — financial writes and
            infrastructure changes always require human approval regardless of confidence.
            All other agents are enabled for autonomous execution within their <code>safeActions</code> whitelist.
            Actions outside the whitelist route through the Constitutional Rules Engine.
          </Prose>
        </Box>
      </Section>

      {/* ── 2. OODA LOOP ── */}
      <Section title="2 · The OODA Loop — Execution Engine" icon={<OodaIcon />} color={MC.green}>
        <Prose sx={{ mb: 2.5 }}>
          Every agent task — from scanning a receipt to decomposing a multi-domain feature request —
          runs through the same four-phase cognitive loop, implemented in{' '}
          <code>AutonomousAgent.executeTask()</code>. The LLM lives in the <Highlight color={MC.green}>Orient</Highlight>{' '}
          phase and decides the direction of travel. Everything else is deterministic infrastructure.
        </Prose>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3, alignItems: 'center' }}>
          <FlowStep n="OBSERVE" label="Pull Context" sub="DB · metrics · queue" color={MC.blue} />
          <FlowStep n="ORIENT" label="LLM Analysis" sub="Claude decides path" color={MC.green} />
          <FlowStep n="DECIDE" label="Route Decision" sub="continue/replan/escalate/done" color={MC.violet} />
          <FlowStep n="ACT" label="Execute Tool" sub="DB · API · notify" color={MC.amber} arrow={false} />
        </Box>

        <Grid container spacing={2}>
          {[
            { phase: 'OBSERVE', color: MC.blue, points: [
              'Agent loads the current task record and all prior step results from AgentExecution',
              'Fetches domain-specific context: live metrics, relevant DB records, system state',
              'Builds a structured "situation report" object for the LLM',
            ]},
            { phase: 'ORIENT', color: MC.green, points: [
              'Calls Claude Sonnet 4.6 with agent identity prompt + situation report + available tools',
              'LLM returns structured JSON: { decision, reasoning, nextStep, toolsToUse }',
              'Decision can be: continue · replan · escalate · done',
              'Rule-based fallback activates if LLM is unavailable — no silent degradation',
            ]},
            { phase: 'DECIDE', color: MC.violet, points: [
              '"replan" triggers full task step-chain reconstruction from scratch',
              '"escalate" pauses the task and creates an Escalation record for Apollo/human',
              '"done" runs _synthesizeResults() and writes completion to AgentExecution',
              'Constitutional Rules Engine pre-validates the chosen action before ACT',
            ]},
            { phase: 'ACT', color: MC.amber, points: [
              'Tool is called (DB query, Stripe API, OCR, send notification, etc.)',
              'Result is appended to AgentExecution step log',
              '_evaluateGoals() runs post-action — can spawn corrective tasks proactively',
              'Heartbeat emitted to Apollo registry; event bus notified',
            ]},
          ].map(item => (
            <Grid item xs={12} sm={6} key={item.phase}>
              <Box sx={{ p: 2, background: alpha(item.color, 0.06), border: `1px solid ${alpha(item.color, 0.2)}`, borderRadius: 2, height: '100%' }}>
                <Typography sx={{ color: item.color, fontWeight: 800, fontSize: '0.78rem', mb: 1, letterSpacing: 1 }}>{item.phase}</Typography>
                {item.points.map((pt, i) => (
                  <Box key={i} sx={{ display: 'flex', gap: 1, mb: 0.75 }}>
                    <Box sx={{ color: alpha(item.color, 0.7), mt: 0.15, fontSize: '0.6rem', flexShrink: 0 }}>▸</Box>
                    <Typography sx={{ color: MC.slate, fontSize: '0.75rem', lineHeight: 1.65 }}>{pt}</Typography>
                  </Box>
                ))}
              </Box>
            </Grid>
          ))}
        </Grid>

        <CodeBlock>{`// _orient() — LLM-powered orientation phase
const orientResult = await this.llm.chat([
  { role: 'system', content: this._buildSystemPrompt() },
  { role: 'user',   content: this._buildOrientPrompt(task, context) }
]);
// LLM response
// { decision: "continue|replan|escalate|done", reasoning: "...", nextStep: {...} }

// Constitutional guard runs BEFORE the tool executes
const verdict = await constitutionalRulesEngine.guard(agentId, toolName, payload);
// verdict: allow | log_and_allow | rate_limit | require_human_approval
//          | require_council_vote | deny`}
        </CodeBlock>
      </Section>

      {/* ── 3. APOLLO ORCHESTRATION ── */}
      <Section title="3 · Apollo — The Orchestration Layer" icon={<TimelineIcon />} color={MC.amber}>
        <Prose sx={{ mb: 2 }}>
          Apollo (autonomy 95%) is the only agent with <Highlight color={MC.amber}>cross-domain authority</Highlight>.
          It does not own business logic — it routes, decomposes, coordinates, and synthesises.
          When a request spans multiple domains (e.g., "fix the GDPR deletion flow and update the audit log"),
          Apollo decomposes it into a <Highlight color={MC.amber}>DAG of domain-specific steps</Highlight> and
          fans them out to the relevant specialists.
        </Prose>

        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} md={6}>
            <Box sx={{ p: 2, background: alpha(MC.amber, 0.06), border: `1px solid ${alpha(MC.amber, 0.2)}`, borderRadius: 2 }}>
              <Typography sx={{ color: MC.amber, fontWeight: 700, fontSize: '0.8rem', mb: 1.5 }}>coordinateFromQuery() Flow</Typography>
              {[
                ['1', 'Match workflow template?', 'Execute template steps directly'],
                ['2', 'No match → decomposeTask()', 'LLM maps domains to agent IDs'],
                ['3', 'Build sequential step chain', 'Respect domain dependencies'],
                ['4', 'Fan out to specialists', 'Parallel where dependency graph allows'],
                ['5', '_synthesizeCollaboration()', 'LLM merges multi-agent outputs'],
              ].map(([n, a, b]) => (
                <Box key={n} sx={{ display: 'flex', gap: 1.5, mb: 1, alignItems: 'flex-start' }}>
                  <Box sx={{ bgcolor: alpha(MC.amber, 0.2), color: MC.amber, fontWeight: 800, fontSize: '0.65rem', px: 0.75, py: 0.25, borderRadius: 0.75, flexShrink: 0, mt: 0.15 }}>{n}</Box>
                  <Box>
                    <Typography sx={{ color: MC.text, fontSize: '0.75rem', fontWeight: 600 }}>{a}</Typography>
                    <Typography sx={{ color: MC.slate, fontSize: '0.7rem' }}>{b}</Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ p: 2, background: alpha(MC.blue, 0.06), border: `1px solid ${alpha(MC.blue, 0.2)}`, borderRadius: 2 }}>
              <Typography sx={{ color: MC.blue, fontWeight: 700, fontSize: '0.8rem', mb: 1.5 }}>DOMAIN_ROUTING Map</Typography>
              {[
                ['auth / security',        '01-sentinel',   MC.blue],
                ['finance / transactions / budgets', '02-ledger', MC.green],
                ['receipts / ocr',         '03-vision',     MC.cyan],
                ['ai / insights',          '04-cortex',     MC.violet],
                ['payments / subscriptions','05-vault',     MC.indigo],
                ['splitting / groups',     '06-nexus',      MC.teal],
                ['admin / monitoring',     '07-watchtower', MC.blue],
                ['ui / frontend',          '08-prism',      MC.violet],
                ['mobile / capacitor',     '09-forge',      MC.orange],
                ['infra / database',       '10-atlas',      MC.rose],
                ['i18n / translations',    '11-babel',      MC.amber],
              ].map(([domain, agent, c]) => (
                <Box key={domain} sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5, alignItems: 'center' }}>
                  <Typography sx={{ color: MC.slate, fontSize: '0.68rem', fontFamily: 'monospace' }}>{domain}</Typography>
                  <Chip label={agent} size="small" sx={{ bgcolor: alpha(c, 0.12), color: c, fontSize: '0.62rem', height: 18, fontWeight: 700, border: `1px solid ${alpha(c, 0.25)}` }} />
                </Box>
              ))}
            </Box>
          </Grid>
        </Grid>

        <Box sx={{ p: 2, background: alpha(MC.amber, 0.04), border: `1px solid ${alpha(MC.amber, 0.12)}`, borderRadius: 2 }}>
          <Typography sx={{ color: MC.amber, fontWeight: 700, fontSize: '0.8rem', mb: 1 }}>Apollo Registry — Live Agent Map</Typography>
          <Prose>
            Apollo maintains a <code>Map&lt;agentId, registry&gt;</code> tracking each specialist's instance reference,
            current status (<code>idle / active / error</code>), last heartbeat timestamp, current task ID,
            and success/failure counters. It holds a <code>taskQueue</code> and <code>escalationQueue</code> for
            work in-flight. Dead heartbeats trigger automatic health alerts surfaced in the Fleet tab.
          </Prose>
        </Box>
      </Section>

      {/* ── 4. CONSTITUTIONAL ENGINE ── */}
      <Section title="4 · Constitutional Rules Engine — The Safety Layer" icon={<ShieldIcon />} color={MC.rose}>
        <Prose sx={{ mb: 2 }}>
          <Highlight color={MC.rose}>Every agent action</Highlight> passes through{' '}
          <code>ConstitutionalRulesEngine.guard()</code> before execution. This is non-negotiable —
          it runs synchronously before any tool call, cached for 30 seconds to reduce DB pressure
          under high-frequency agent activity. The engine maintains a{' '}
          <Highlight color={MC.rose}>rolling 24-hour block counter</Highlight> visible in the God Mode signal bar.
        </Prose>

        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} md={7}>
            <Typography sx={{ color: MC.rose, fontWeight: 700, fontSize: '0.78rem', mb: 1.25 }}>Decision Outcomes</Typography>
            {[
              { verdict: 'allow',                      effect: 'Action proceeds immediately',                                        color: MC.green  },
              { verdict: 'log_and_allow',               effect: 'Proceeds + audit record written',                                   color: MC.blue   },
              { verdict: 'rate_limit',                  effect: 'Allowed within quota, blocked when threshold exceeded',             color: MC.amber  },
              { verdict: 'require_human_approval',      effect: 'Task paused — Escalation record created for human',                 color: MC.orange },
              { verdict: 'require_council_vote',        effect: 'Routes to AgentCouncilService for quorum vote (min 3, 60% yes)',    color: MC.violet },
              { verdict: 'deny',                        effect: 'Hard block — task fails with constitutional violation reason',      color: MC.rose   },
            ].map(item => (
              <Box key={item.verdict} sx={{ display: 'flex', gap: 1.5, mb: 1, alignItems: 'flex-start' }}>
                <Chip label={item.verdict} size="small" sx={{ bgcolor: alpha(item.color, 0.12), color: item.color, fontWeight: 700, fontSize: '0.65rem', height: 20, border: `1px solid ${alpha(item.color, 0.3)}`, flexShrink: 0, fontFamily: 'monospace' }} />
                <Typography sx={{ color: MC.slate, fontSize: '0.73rem', lineHeight: 1.65 }}>{item.effect}</Typography>
              </Box>
            ))}
          </Grid>
          <Grid item xs={12} md={5}>
            <Typography sx={{ color: MC.rose, fontWeight: 700, fontSize: '0.78rem', mb: 1.25 }}>Bedrock Rules (Immutable)</Typography>
            <TableContainer component={Paper} elevation={0} sx={{ background: 'transparent', border: `1px solid ${MC.border}`, borderRadius: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ background: alpha(MC.rose, 0.06) }}>
                    {['Rule', 'Outcome', 'Authority'].map(h => (
                      <TableCell key={h} sx={{ color: MC.slate, fontWeight: 700, fontSize: '0.65rem', borderColor: MC.border, py: 0.75 }}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {CONSTITUTIONAL_RULES.map(r => (
                    <TableRow key={r.rule}>
                      <TableCell sx={{ color: MC.text, borderColor: MC.border, fontSize: '0.67rem', py: 0.75, fontFamily: 'monospace' }}>{r.rule}</TableCell>
                      <TableCell sx={{ borderColor: MC.border, py: 0.75 }}>
                        <Chip label={r.outcome.replace('require_', '')} size="small" sx={{ bgcolor: alpha(MC.orange, 0.12), color: MC.orange, fontSize: '0.6rem', height: 16, fontWeight: 700 }} />
                      </TableCell>
                      <TableCell sx={{ borderColor: MC.border, py: 0.75 }}>
                        <Chip label={r.authority} size="small" sx={{ bgcolor: alpha(MC.rose, 0.12), color: MC.rose, fontSize: '0.6rem', height: 16, fontWeight: 700 }} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <Prose sx={{ mt: 1.5, fontSize: '0.68rem' }}>
              <strong style={{ color: MC.amber }}>hard</strong> = enforced always ·{' '}
              <strong style={{ color: MC.blue }}>soft</strong> = logged, execution continues ·{' '}
              <strong style={{ color: MC.slate }}>advisory</strong> = informational only
            </Prose>
          </Grid>
        </Grid>
      </Section>

      {/* ── 5. GOVERNANCE DEMOCRACY ── */}
      <Section title="5 · Governance — Agent Democracy Layer" icon={<GavelIcon />} color={MC.violet}>
        <Prose sx={{ mb: 2.5 }}>
          When the constitutional engine returns <code>require_council_vote</code>, or when an agent
          proactively submits a proposal, the governance layer activates. This is a{' '}
          <Highlight color={MC.violet}>real democratic system</Highlight> — agents vote, quorum is enforced,
          and the human admin can override any vote with a rationale. Every decision is permanently persisted.
        </Prose>

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Box sx={{ p: 2, background: alpha(MC.violet, 0.06), border: `1px solid ${alpha(MC.violet, 0.2)}`, borderRadius: 2, height: '100%' }}>
              <Typography sx={{ color: MC.violet, fontWeight: 700, fontSize: '0.8rem', mb: 1.5 }}>AgentCouncilVote Schema</Typography>
              <CodeBlock>{`{
  topic:              String,
  proposedBy:         agentId,
  eligibleVoters:     [agentId],
  votes: [{
    agentId,
    vote:     "yes | no | abstain",
    rationale: String,
    timestamp: Date
  }],
  quorum:             3,      // min votes required
  majorityThreshold:  0.60,   // 60% yes to pass
  status: "open | passed | failed | expired",
  humanOverride: {
    by, rationale, timestamp
  }
}`}
              </CodeBlock>
              <Alert severity="info" sx={{ mt: 1, py: 0.5, '& .MuiAlert-message': { fontSize: '0.72rem' } }}>
                Human override bypasses quorum entirely. Available in the Governance tab → Council Votes.
              </Alert>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ p: 2, background: alpha(MC.indigo, 0.06), border: `1px solid ${alpha(MC.indigo, 0.2)}`, borderRadius: 2, height: '100%' }}>
              <Typography sx={{ color: MC.indigo, fontWeight: 700, fontSize: '0.8rem', mb: 1.5 }}>AgentProposal — Structured Change Requests</Typography>
              {[
                ['type', 'rule_proposal · autonomy_adjustment · workflow_change · spawn_agent · fire_agent · pricing_change · feature_request'],
                ['riskLevel', 'low · medium · high · critical'],
                ['reversible', 'boolean — gates approval path'],
                ['estimatedCostUsd', 'dollar impact estimate for CFO review'],
                ['evidence[]', 'structured refs to metrics, incidents, goals, logs'],
                ['simulationId', 'linked dry-run outcome from simulationService'],
                ['decisionPath', 'constitutional routing that triggered this proposal'],
              ].map(([field, desc]) => (
                <Box key={field} sx={{ mb: 1 }}>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'baseline' }}>
                    <Typography sx={{ color: MC.cyan, fontFamily: 'monospace', fontSize: '0.72rem', fontWeight: 700, flexShrink: 0 }}>{field}</Typography>
                    <Typography sx={{ color: MC.slate, fontSize: '0.7rem', lineHeight: 1.5 }}>{desc}</Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Grid>
        </Grid>
      </Section>

      {/* ── 6. SELF-IMPROVEMENT ── */}
      <Section title="6 · Self-Improvement — The Feedback Loop" icon={<LoopIcon />} color={MC.teal}>
        <Prose sx={{ mb: 2 }}>
          <code>agentSelfImprovement</code> runs on a scheduled cron. It creates a{' '}
          <Highlight color={MC.teal}>closed feedback loop</Highlight> where agents that consistently
          underperform surface proposals that — once approved — modify their own operating parameters.
          The system improves itself without a human having to diagnose individual agent failures.
        </Prose>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2.5, alignItems: 'center' }}>
          {[
            ['Read AgentExecution records', MC.blue],
            ['→', MC.slate],
            ['Compute success rate / agent', MC.blue],
            ['→', MC.slate],
            ['Rate < 60%?', MC.rose],
            ['→', MC.slate],
            ['Generate rule_proposal / autonomy_adjustment', MC.teal],
            ['→', MC.slate],
            ['Council vote or human approval', MC.violet],
            ['→', MC.slate],
            ['Patch AgentConfiguration', MC.green],
          ].map(([label, color], i) => (
            <Typography key={i} sx={{ color, fontWeight: label === '→' ? 400 : 600, fontSize: label === '→' ? '1rem' : '0.75rem' }}>
              {label}
            </Typography>
          ))}
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <Box sx={{ p: 1.75, background: alpha(MC.teal, 0.07), border: `1px solid ${alpha(MC.teal, 0.2)}`, borderRadius: 2, textAlign: 'center' }}>
              <Typography sx={{ color: MC.teal, fontWeight: 800, fontSize: '1.6rem' }}>60%</Typography>
              <Typography sx={{ color: MC.slate, fontSize: '0.72rem', mt: 0.25 }}>Success rate threshold<br/>that triggers proposals</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Box sx={{ p: 1.75, background: alpha(MC.violet, 0.07), border: `1px solid ${alpha(MC.violet, 0.2)}`, borderRadius: 2, textAlign: 'center' }}>
              <Typography sx={{ color: MC.violet, fontWeight: 800, fontSize: '1.6rem' }}>2</Typography>
              <Typography sx={{ color: MC.slate, fontSize: '0.72rem', mt: 0.25 }}>Proposal types generated<br/>rule_proposal · autonomy_adjustment</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Box sx={{ p: 1.75, background: alpha(MC.green, 0.07), border: `1px solid ${alpha(MC.green, 0.2)}`, borderRadius: 2, textAlign: 'center' }}>
              <Typography sx={{ color: MC.green, fontWeight: 800, fontSize: '1.6rem' }}>∞</Typography>
              <Typography sx={{ color: MC.slate, fontSize: '0.72rem', mt: 0.25 }}>Self-improvement cycles<br/>Board meeting triggers one each Monday</Typography>
            </Box>
          </Grid>
        </Grid>
      </Section>

      {/* ── 7. BOARD MEETING & INVESTOR ── */}
      <Section title="7 · Board Meeting & Investor Narrator" icon={<BarIcon />} color={MC.amber} defaultExpanded={false}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Box sx={{ p: 2, background: alpha(MC.amber, 0.06), border: `1px solid ${alpha(MC.amber, 0.2)}`, borderRadius: 2 }}>
              <Typography sx={{ color: MC.amber, fontWeight: 700, fontSize: '0.8rem', mb: 1.5 }}>Board Meeting Cadence</Typography>
              <Prose>
                <code>apolloBoardMeetingScheduler</code> fires every <Highlight color={MC.amber}>Monday at 09:00 UTC</Highlight>.
              </Prose>
              {[
                'Apollo queries all agent scorecards',
                'Computes fleet-level OKR progress',
                'Identifies underperformers (scorecard below threshold)',
                'Generates a board meeting AgentExecution record with structured minutes',
                'Triggers investorNarrator for monthly summary (on period boundary)',
                'Broadcasts signal via WebSocket to all connected admin clients',
              ].map((step, i) => (
                <Box key={i} sx={{ display: 'flex', gap: 1, mt: 1, alignItems: 'flex-start' }}>
                  <Box sx={{ color: MC.amber, fontWeight: 800, fontSize: '0.65rem', flexShrink: 0, mt: 0.2 }}>{i + 1}.</Box>
                  <Typography sx={{ color: MC.slate, fontSize: '0.73rem', lineHeight: 1.6 }}>{step}</Typography>
                </Box>
              ))}
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ p: 2, background: alpha(MC.blue, 0.06), border: `1px solid ${alpha(MC.blue, 0.2)}`, borderRadius: 2 }}>
              <Typography sx={{ color: MC.blue, fontWeight: 700, fontSize: '0.8rem', mb: 1.5 }}>Investor Narrator</Typography>
              <Prose sx={{ mb: 1.5 }}>
                <code>investorNarrator.generate({'{ period }'})</code> produces a structured{' '}
                <code>InvestorReport</code> containing:
              </Prose>
              {[
                'Platform KPIs — users, MRR, transaction volume',
                'Agent fleet performance summary with scorecard data',
                'OKR progress vs targets with percentage completion',
                'Risk flags — constitutional blocks, escalation trends',
                'Forward-looking narratives generated via LLM',
                'Distributable via email or Telegram push',
              ].map((item, i) => (
                <Box key={i} sx={{ display: 'flex', gap: 1, mt: 0.75 }}>
                  <Box sx={{ color: MC.blue, flexShrink: 0 }}>▸</Box>
                  <Typography sx={{ color: MC.slate, fontSize: '0.73rem', lineHeight: 1.6 }}>{item}</Typography>
                </Box>
              ))}
            </Box>
          </Grid>
        </Grid>
      </Section>

      {/* ── 8. DYNAMIC AGENTS ── */}
      <Section title="8 · Dynamic Agent Spawn & Simulation" icon={<AutoIcon />} color={MC.cyan} defaultExpanded={false}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Box sx={{ p: 2, background: alpha(MC.cyan, 0.06), border: `1px solid ${alpha(MC.cyan, 0.2)}`, borderRadius: 2 }}>
              <Typography sx={{ color: MC.cyan, fontWeight: 700, fontSize: '0.8rem', mb: 1 }}>agentSpawnService</Typography>
              <Prose sx={{ mb: 1.5 }}>
                When HRAgent or Apollo detects a recurring domain gap, it spawns an{' '}
                <Highlight color={MC.cyan}>ephemeral specialist agent</Highlight> without a code deployment.
              </Prose>
              <CodeBlock>{`agentSpawnService.buildRecommendation({
  gapDomain: 'fraud_detection',
  escalationCount: 12,
  exampleSubjects: [...]
})
// Creates AgentConfiguration with:
// autonomyLevel: 30  (conservative for new agents)
// ttlHours: 168      (7-day TTL)
// ephemeral: true`}
              </CodeBlock>
              <Prose sx={{ mt: 1 }}>
                Daily cron at 03:30 UTC cleans up expired ephemeral agents.
                The scheduler picks up new specs on next reconcile without restart.
              </Prose>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ p: 2, background: alpha(MC.violet, 0.06), border: `1px solid ${alpha(MC.violet, 0.2)}`, borderRadius: 2 }}>
              <Typography sx={{ color: MC.violet, fontWeight: 700, fontSize: '0.8rem', mb: 1 }}>simulationService — Dry-Run Before Risk</Typography>
              <Prose sx={{ mb: 1.5 }}>
                Before executing high-risk tools, agents invoke simulationService for a{' '}
                <Highlight color={MC.violet}>shadow execution</Highlight> with no real side effects.
              </Prose>
              <Typography sx={{ color: MC.slate, fontSize: '0.7rem', mb: 0.75 }}>Tools that require simulation:</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1.5 }}>
                {['send_email', 'pay_vendor_invoice', 'apply_pricing', 'launch_campaign', 'execute_code_change', 'create_pr', 'fire_agent', 'process_gdpr_request'].map(t => (
                  <Chip key={t} label={t} size="small" sx={{ bgcolor: alpha(MC.violet, 0.1), color: MC.violet, fontSize: '0.6rem', height: 18, fontFamily: 'monospace', border: `1px solid ${alpha(MC.violet, 0.25)}` }} />
                ))}
              </Box>
              <Typography sx={{ color: MC.slate, fontSize: '0.7rem', mb: 0.75 }}>Simulation verdicts:</Typography>
              {['proceed', 'modify', 'abort', 'human_review'].map(v => (
                <Chip key={v} label={v} size="small" sx={{ mr: 0.5, mb: 0.5, bgcolor: alpha(MC.green, 0.1), color: MC.green, fontSize: '0.65rem', height: 20, fontWeight: 700 }} />
              ))}
            </Box>
          </Grid>
        </Grid>
      </Section>

      {/* ── 9. DATA MODELS ── */}
      <Section title="9 · Core Data Models" icon={<AtlasIcon />} color={MC.blue} defaultExpanded={false}>
        <Grid container spacing={1.5}>
          {[
            { model: 'AgentConfiguration',  color: MC.green,  desc: 'Persistent agent spec — autonomy level, LLM config, tool permissions, enabled state, ephemeral TTL' },
            { model: 'AgentExecution',       color: MC.blue,   desc: 'Per-task execution record — OODA loop steps, tool call results, duration, success/failure outcome' },
            { model: 'AgentScorecard',       color: MC.amber,  desc: 'Per-agent performance metrics per period — task count, success rate, avg latency, cost' },
            { model: 'AgentProposal',        color: MC.violet, desc: 'Structured change request with evidence, risk level, reversibility, simulation link, decision path' },
            { model: 'AgentCouncilVote',     color: MC.indigo, desc: 'Multi-agent vote record with quorum (3), majority threshold (60%), human override, expiry' },
            { model: 'ConstitutionalRule',   color: MC.rose,   desc: 'Rule definition — condition expression, action/verdict, authority (hard/soft/advisory), scope, TTL' },
            { model: 'CompanyGoal',          color: MC.teal,   desc: 'OKR record — objective, key results with check-ins, owner agent, target date, status lifecycle' },
            { model: 'InvestorReport',       color: MC.amber,  desc: 'Periodic business intelligence report — KPIs, fleet summary, OKR progress, risk flags, LLM narrative' },
            { model: 'AgentMessage',         color: MC.cyan,   desc: 'Inter-agent communication log — from/to routing, type, payload, delivery status, conversation thread' },
            { model: 'Escalation',           color: MC.orange, desc: 'Human-approval-required task — blocking reason, paused agent/task, resolution record, SLA countdown' },
            { model: 'KnowledgeNode',        color: MC.blue,   desc: 'Knowledge graph entity with typed edges, confidence score, decay timestamps, source provenance' },
          ].map(item => (
            <Grid item xs={12} sm={6} lg={4} key={item.model}>
              <Box sx={{ p: 1.75, background: alpha(item.color, 0.05), border: `1px solid ${alpha(item.color, 0.18)}`, borderRadius: 2, height: '100%' }}>
                <Typography sx={{ color: item.color, fontWeight: 700, fontSize: '0.75rem', fontFamily: 'monospace', mb: 0.5 }}>{item.model}</Typography>
                <Typography sx={{ color: MC.slate, fontSize: '0.7rem', lineHeight: 1.6 }}>{item.desc}</Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Section>

      {/* ── 10. GAP ANALYSIS ── */}
      <Section title="10 · Gap Analysis & Improvement Roadmap" icon={<WarnIcon />} color={MC.rose} defaultExpanded={false}>
        <Prose sx={{ mb: 2.5 }}>
          These are the <Highlight color={MC.rose}>honest gaps</Highlight>. Ranked by operational impact.
          The three highest-leverage improvements are marked HIGH — fix those and the system operates
          at a qualitatively different level of autonomy and resilience.
        </Prose>

        <Stack spacing={1.25}>
          {GAPS.map(gap => (
            <Box
              key={gap.id}
              onClick={() => setExpandedGap(expandedGap === gap.id ? null : gap.id)}
              sx={{
                p: 2,
                background: expandedGap === gap.id ? alpha(gap.color, 0.08) : alpha(gap.color, 0.04),
                border: `1px solid ${alpha(gap.color, expandedGap === gap.id ? 0.3 : 0.15)}`,
                borderRadius: 2,
                cursor: 'pointer',
                transition: 'all 0.25s',
                '&:hover': { background: alpha(gap.color, 0.07), borderColor: alpha(gap.color, 0.25) },
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', gap: 1.25, alignItems: 'center' }}>
                  <Typography sx={{ color: MC.slate, fontSize: '0.7rem', fontWeight: 700 }}>#{gap.id}</Typography>
                  <Typography sx={{ color: MC.text, fontWeight: 700, fontSize: '0.8rem' }}>{gap.title}</Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  <Chip
                    label={gap.priority}
                    size="small"
                    sx={{ bgcolor: alpha(gap.color, 0.15), color: gap.color, fontWeight: 800, fontSize: '0.65rem', height: 20, border: `1px solid ${alpha(gap.color, 0.3)}` }}
                  />
                  <Typography sx={{ color: MC.slate, fontSize: '0.7rem' }}>{expandedGap === gap.id ? '▲' : '▼'}</Typography>
                </Box>
              </Box>
              {expandedGap === gap.id && (
                <Typography sx={{ color: MC.slate, fontSize: '0.75rem', lineHeight: 1.7, mt: 1.25 }}>
                  {gap.desc}
                </Typography>
              )}
            </Box>
          ))}
        </Stack>
      </Section>

      {/* ── 11. SYSTEM CRON SCHEDULE ── */}
      <Section title="11 · Background Cron Schedule" icon={<WatchIcon />} color={MC.slate} defaultExpanded={false}>
        <TableContainer component={Paper} elevation={0} sx={{ background: 'transparent', border: `1px solid ${MC.border}`, borderRadius: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ background: alpha(MC.blue, 0.04) }}>
                {['Cron', 'Service', 'Action'].map(h => (
                  <TableCell key={h} sx={{ color: MC.slate, fontWeight: 700, fontSize: '0.72rem', borderColor: MC.border, py: 1 }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {[
                ['Mon 09:00 UTC', 'apolloBoardMeetingScheduler', 'Fleet scorecard review, OKR assessment, investor narrator trigger'],
                ['Every 30 min', 'agentCouncilService', 'Tally stale votes, resolve expired council decisions'],
                ['Daily 03:30 UTC', 'agentSpawnService.cleanupEphemeral', 'Remove agents past TTL expiry'],
                ['Sunday 03:00 UTC', 'knowledgeGraphService.decayStale', 'Prune low-confidence KG edges'],
                ['Scheduled cron', 'agentSelfImprovement', 'Success rate scan → generate improvement proposals'],
                ['Scheduled cron', 'investorNarrator', 'Monthly period boundary → generate + queue report'],
              ].map(([cron, svc, action]) => (
                <TableRow key={svc}>
                  <TableCell sx={{ color: MC.amber, borderColor: MC.border, fontSize: '0.7rem', fontFamily: 'monospace', py: 0.75, whiteSpace: 'nowrap' }}>{cron}</TableCell>
                  <TableCell sx={{ color: MC.cyan, borderColor: MC.border, fontSize: '0.7rem', fontFamily: 'monospace', py: 0.75 }}>{svc}</TableCell>
                  <TableCell sx={{ color: MC.slate, borderColor: MC.border, fontSize: '0.7rem', py: 0.75 }}>{action}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Section>

      {/* ── FOOTER ── */}
      <Box sx={{ mt: 3, p: 2, background: alpha(MC.violet, 0.04), border: `1px solid ${alpha(MC.violet, 0.12)}`, borderRadius: 2, textAlign: 'center' }}>
        <Typography sx={{ color: MC.violet, fontWeight: 700, fontSize: '0.8rem', mb: 0.5 }}>PROJECT OLYMPUS</Typography>
        <Typography sx={{ color: MC.slate, fontSize: '0.72rem' }}>
          Architecture derived from live codebase: <code>server/agents/</code> · <code>server/services/</code> · <code>server/routes/godmode.routes.js</code>
        </Typography>
      </Box>

    </Box>
  );
};

export default AgenticBlueprintTab;
