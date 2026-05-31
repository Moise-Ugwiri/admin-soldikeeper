/**
 * 🛡️ God Mode Panel — full AI corporation control plane.
 *
 * Talks to /api/admin/godmode/* routes.
 * Sub-tabs: Overview · OKRs · Scorecards · Constitution · Council · Proposals · Agents · Investor · KG
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Card, CardContent, Typography, Tabs, Tab, Button, Chip, Stack,
  TextField, Table, TableBody, TableCell, TableHead, TableRow, Dialog,
  DialogTitle, DialogContent, DialogActions, Alert, CircularProgress,
  IconButton, Tooltip, MenuItem, Select, FormControl, InputLabel
} from '@mui/material';
import {
  Refresh as RefreshIcon, Add as AddIcon, PlayArrow as PlayIcon,
  Block as BlockIcon, CheckCircle as CheckIcon, LocalFireDepartment as FireIcon,
  Gavel as GavelIcon, Insights as InsightsIcon
} from '@mui/icons-material';
import apiClient from '../../../services/api';

const SUBTABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'goals', label: 'OKRs' },
  { id: 'scorecards', label: 'Scorecards' },
  { id: 'rules', label: 'Constitution' },
  { id: 'votes', label: 'Council' },
  { id: 'proposals', label: 'Proposals' },
  { id: 'agents', label: 'Agents' },
  { id: 'investor', label: 'Investor' },
  { id: 'kg', label: 'Knowledge' }
];

const api = {
  get: (url) => apiClient.get(`/admin/godmode${url}`).then(r => r.data?.data ?? r.data),
  post: (url, body) => apiClient.post(`/admin/godmode${url}`, body).then(r => r.data?.data ?? r.data),
  patch: (url, body) => apiClient.patch(`/admin/godmode${url}`, body).then(r => r.data?.data ?? r.data),
  del: (url) => apiClient.delete(`/admin/godmode${url}`).then(r => r.data?.data ?? r.data)
};

// ─── Reusable section card ───
function Section({ title, action, children }) {
  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">{title}</Typography>
          {action}
        </Stack>
        {children}
      </CardContent>
    </Card>
  );
}

// ───────────── OVERVIEW ─────────────
function OverviewPanel() {
  const [data, setData] = useState(null);
  const [snap, setSnap] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const load = useCallback(async () => {
    setLoading(true); setErr('');
    try {
      const [s, g, sc] = await Promise.all([
        api.get('/status'),
        api.get('/goals/snapshot/fleet').catch(() => null),
        api.get('/scorecards').catch(() => [])
      ]);
      setData(s); setSnap({ goals: g, scorecards: sc });
    } catch (e) { setErr(e.response?.data?.message || e.message); }
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  const trigger = async (path, label) => {
    if (!window.confirm(`Run ${label}?`)) return;
    try { await api.post(path, {}); alert(`✅ ${label} triggered`); }
    catch (e) { alert(`❌ ${e.response?.data?.message || e.message}`); }
  };

  return (
    <Box>
      <Section
        title="Manual Triggers"
        action={<IconButton onClick={load}><RefreshIcon /></IconButton>}
      >
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Button variant="contained" startIcon={<PlayIcon />} onClick={() => trigger('/triggers/board-meeting', 'Board Meeting')}>Board Meeting</Button>
          <Button variant="outlined" startIcon={<InsightsIcon />} onClick={() => trigger('/triggers/self-improvement', 'Self-Improvement Scan')}>Self-Improve</Button>
          <Button variant="outlined" onClick={() => trigger('/scorecards/refresh', 'Scorecard Refresh')}>Refresh Scorecards</Button>
          <Button variant="outlined" onClick={() => trigger('/agents/cleanup-ephemeral', 'Cleanup Ephemeral')}>Cleanup Ephemeral</Button>
          <Button variant="outlined" onClick={() => trigger('/rules/seed', 'Seed Bedrock Rules')}>Seed Rules</Button>
        </Stack>
      </Section>

      {err && <Alert severity="error">{err}</Alert>}
      {loading && <CircularProgress />}

      {snap?.goals && (
        <Section title="OKR Snapshot">
          <Stack direction="row" spacing={3} flexWrap="wrap">
            <Chip label={`Goals: ${snap.goals.totalGoals}`} />
            <Chip label={`KRs: ${snap.goals.totalKRs}`} />
            <Chip color="primary" label={`Avg: ${snap.goals.avgProgress}%`} />
            <Chip color="success" label={`On track: ${snap.goals.onTrack}`} />
            <Chip color="warning" label={`At risk: ${snap.goals.atRisk}`} />
            <Chip color="error" label={`Off track: ${snap.goals.offTrack}`} />
          </Stack>
        </Section>
      )}

      {snap?.scorecards?.length > 0 && (
        <Section title={`Fleet Scorecards (${snap.scorecards.length})`}>
          <Table size="small">
            <TableHead>
              <TableRow><TableCell>Agent</TableCell><TableCell>Grade</TableCell><TableCell>Tasks</TableCell><TableCell>Success</TableCell><TableCell>Esc%</TableCell><TableCell>Cost ($)</TableCell></TableRow>
            </TableHead>
            <TableBody>
              {snap.scorecards.map(c => (
                <TableRow key={c.agentId}>
                  <TableCell>{c.agentId}</TableCell>
                  <TableCell><Chip size="small" label={c.grade} color={c.grade === 'A' || c.grade === 'B' ? 'success' : c.grade === 'C' ? 'warning' : 'error'} /></TableCell>
                  <TableCell>{c.taskCount}</TableCell>
                  <TableCell>{((c.successRate || 0) * 100).toFixed(0)}%</TableCell>
                  <TableCell>{((c.escalationRate || 0) * 100).toFixed(0)}%</TableCell>
                  <TableCell>{(c.llmCostUsd || 0).toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Section>
      )}

      {data && (
        <Section title="Module Status">
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {Object.entries(data.modules || {}).map(([k, v]) => (
              <Chip key={k} label={`${k}: ${v}`} color={v === 'loaded' ? 'success' : 'error'} size="small" />
            ))}
          </Stack>
        </Section>
      )}
    </Box>
  );
}

// ───────────── OKRs ─────────────
function GoalsPanel() {
  const [goals, setGoals] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', period: 'quarter', keyResults: [] });
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => { setLoading(true); try { setGoals(await api.get('/goals')); } catch (_) {} setLoading(false); }, []);
  useEffect(() => { load(); }, [load]);

  const create = async () => {
    try { await api.post('/goals', form); setOpen(false); setForm({ title:'', description:'', period:'quarter', keyResults:[] }); load(); }
    catch (e) { alert(e.response?.data?.message || e.message); }
  };

  return (
    <Section title={`OKRs (${goals.length})`} action={<Button startIcon={<AddIcon />} onClick={() => setOpen(true)}>New Goal</Button>}>
      {loading && <CircularProgress />}
      <Table size="small">
        <TableHead><TableRow><TableCell>Title</TableCell><TableCell>Period</TableCell><TableCell>Owner</TableCell><TableCell>Progress</TableCell><TableCell>Status</TableCell></TableRow></TableHead>
        <TableBody>
          {goals.map(g => (
            <TableRow key={g._id}>
              <TableCell>{g.title}</TableCell>
              <TableCell>{g.period}</TableCell>
              <TableCell>{g.ownerType}/{(g.ownerId || '').toString().slice(-6)}</TableCell>
              <TableCell>{g.progress != null ? `${g.progress}%` : '—'}</TableCell>
              <TableCell><Chip size="small" label={g.status} /></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>New Company Goal</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField label="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} fullWidth />
            <TextField label="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} fullWidth multiline rows={2} />
            <FormControl><InputLabel>Period</InputLabel><Select value={form.period} label="Period" onChange={e => setForm({ ...form, period: e.target.value })}>
              <MenuItem value="quarter">Quarter</MenuItem><MenuItem value="month">Month</MenuItem><MenuItem value="year">Year</MenuItem>
            </Select></FormControl>
            <Typography variant="caption">Key Results can be added after creation.</Typography>
          </Stack>
        </DialogContent>
        <DialogActions><Button onClick={() => setOpen(false)}>Cancel</Button><Button variant="contained" onClick={create}>Create</Button></DialogActions>
      </Dialog>
    </Section>
  );
}

// ───────────── SCORECARDS ─────────────
function ScorecardsPanel() {
  const [cards, setCards] = useState([]);
  const [period, setPeriod] = useState('week');
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => { setLoading(true); try { setCards(await api.get(`/scorecards?period=${period}`)); } catch (_) {} setLoading(false); }, [period]);
  useEffect(() => { load(); }, [load]);

  return (
    <Section title="Agent Scorecards" action={
      <Stack direction="row" spacing={1}>
        <FormControl size="small"><Select value={period} onChange={e => setPeriod(e.target.value)}>
          <MenuItem value="day">Day</MenuItem><MenuItem value="week">Week</MenuItem><MenuItem value="month">Month</MenuItem>
        </Select></FormControl>
        <IconButton onClick={load}><RefreshIcon /></IconButton>
      </Stack>
    }>
      {loading && <CircularProgress />}
      <Table size="small">
        <TableHead><TableRow><TableCell>Agent</TableCell><TableCell>Grade</TableCell><TableCell>Score</TableCell><TableCell>Tasks</TableCell><TableCell>Success</TableCell><TableCell>Escalations</TableCell><TableCell>Cost ($)</TableCell></TableRow></TableHead>
        <TableBody>
          {cards.map(c => (
            <TableRow key={c.agentId}>
              <TableCell>{c.agentId}</TableCell>
              <TableCell><Chip size="small" label={c.grade} color={['A','B'].includes(c.grade) ? 'success' : c.grade === 'C' ? 'warning' : 'error'} /></TableCell>
              <TableCell>{c.score?.toFixed(1)}</TableCell>
              <TableCell>{c.taskCount}</TableCell>
              <TableCell>{((c.successRate || 0) * 100).toFixed(0)}%</TableCell>
              <TableCell>{c.escalationCount} ({((c.escalationRate||0)*100).toFixed(0)}%)</TableCell>
              <TableCell>{(c.llmCostUsd || 0).toFixed(2)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Section>
  );
}

// ───────────── CONSTITUTION ─────────────
function RulesPanel() {
  const [rules, setRules] = useState([]);
  const load = useCallback(async () => { try { setRules(await api.get('/rules')); } catch (_) {} }, []);
  useEffect(() => { load(); }, [load]);
  const seed = async () => { try { await api.post('/rules/seed', {}); load(); } catch (e) { alert(e.message); } };
  return (
    <Section title={`Constitutional Rules (${rules.length})`} action={<Button onClick={seed}>Seed Bedrock</Button>}>
      <Table size="small">
        <TableHead><TableRow><TableCell>Code</TableCell><TableCell>Title</TableCell><TableCell>Authority</TableCell><TableCell>Action</TableCell><TableCell>Active</TableCell></TableRow></TableHead>
        <TableBody>
          {rules.map(r => (
            <TableRow key={r._id}>
              <TableCell>{r.code || r._id.slice(-6)}</TableCell>
              <TableCell>{r.title || r.description}</TableCell>
              <TableCell><Chip size="small" label={r.authority} color={r.authority === 'hard' ? 'error' : r.authority === 'soft' ? 'warning' : 'default'} /></TableCell>
              <TableCell>{r.action}</TableCell>
              <TableCell>{r.active === false ? '—' : '✓'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Section>
  );
}

// ───────────── COUNCIL ─────────────
function VotesPanel() {
  const [votes, setVotes] = useState([]);
  const load = useCallback(async () => { try { setVotes(await api.get('/votes?status=open')); } catch (_) {} }, []);
  useEffect(() => { load(); }, [load]);

  const override = async (id, decision) => {
    const reason = prompt(`Reason for ${decision}?`) || 'Admin override';
    try { await api.post(`/votes/${id}/override`, { decision, rationale: reason }); load(); }
    catch (e) { alert(e.response?.data?.message || e.message); }
  };

  return (
    <Section title={`Open Council Votes (${votes.length})`} action={<IconButton onClick={load}><RefreshIcon /></IconButton>}>
      {votes.length === 0 && <Typography color="text.secondary">No open votes.</Typography>}
      {votes.map(v => (
        <Card key={v.voteId || v._id} sx={{ mb: 1, p: 2 }}>
          <Typography variant="subtitle2">{v.subject || v.proposalType}</Typography>
          <Typography variant="caption" color="text.secondary">ID: {v.voteId || v._id} · cast {v.castVotes?.length || 0}/{v.quorum || '?'}</Typography>
          <Stack direction="row" spacing={1} mt={1}>
            <Button size="small" startIcon={<CheckIcon />} color="success" onClick={() => override(v.voteId || v._id, 'approved')}>Approve</Button>
            <Button size="small" startIcon={<BlockIcon />} color="error" onClick={() => override(v.voteId || v._id, 'rejected')}>Reject</Button>
            <Button size="small" startIcon={<GavelIcon />} onClick={() => api.post(`/votes/${v.voteId || v._id}/tally`, {}).then(load)}>Tally</Button>
          </Stack>
        </Card>
      ))}
    </Section>
  );
}

// ───────────── PROPOSALS ─────────────
function ProposalsPanel() {
  const [list, setList] = useState([]);
  const load = useCallback(async () => { try { setList(await api.get('/proposals?status=pending_review')); } catch (_) {} }, []);
  useEffect(() => { load(); }, [load]);

  const decide = async (id, action) => {
    const reason = prompt(`Reason for ${action}?`) || 'Admin decision';
    try { await api.post(`/proposals/${id}/${action}`, { rationale: reason }); load(); }
    catch (e) { alert(e.response?.data?.message || e.message); }
  };

  return (
    <Section title={`Pending Proposals (${list.length})`} action={<IconButton onClick={load}><RefreshIcon /></IconButton>}>
      {list.map(p => (
        <Card key={p.proposalId} sx={{ mb: 1, p: 2 }}>
          <Stack direction="row" spacing={1} alignItems="center" mb={1}>
            <Chip size="small" label={p.type} />
            <Chip size="small" label={`risk:${p.riskLevel}`} color={p.riskLevel === 'high' ? 'error' : p.riskLevel === 'medium' ? 'warning' : 'default'} />
            <Typography variant="caption">by {p.proposingAgentId}</Typography>
          </Stack>
          <Typography variant="subtitle2">{p.title}</Typography>
          <Typography variant="body2" color="text.secondary">{p.summary}</Typography>
          <Stack direction="row" spacing={1} mt={1}>
            <Button size="small" startIcon={<CheckIcon />} color="success" onClick={() => decide(p.proposalId, 'approve')}>Approve</Button>
            <Button size="small" startIcon={<BlockIcon />} color="error" onClick={() => decide(p.proposalId, 'reject')}>Reject</Button>
          </Stack>
        </Card>
      ))}
      {list.length === 0 && <Typography color="text.secondary">No pending proposals.</Typography>}
    </Section>
  );
}

// ───────────── AGENTS ─────────────
function AgentsPanel() {
  const [agents, setAgents] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ role: '', domain: '', agentName: '', prompt: '', ephemeral: true });

  const load = useCallback(async () => { try { setAgents(await api.get('/agents')); } catch (_) {} }, []);
  useEffect(() => { load(); }, [load]);

  const action = async (agentId, verb) => {
    if (verb === 'fire' && !window.confirm(`FIRE ${agentId}? This is permanent.`)) return;
    const reason = verb === 'fire' ? prompt('Fire reason?') : (verb === 'disable' ? prompt('Disable reason?') : '');
    try { await api.post(`/agents/${agentId}/${verb}`, { reason }); load(); }
    catch (e) { alert(e.response?.data?.message || e.message); }
  };

  const spawn = async () => {
    try {
      await api.post('/agents/spawn', { ...form, agentName: form.agentName || `${form.role}-${form.domain}` });
      setOpen(false); load();
    } catch (e) { alert(e.response?.data?.message || e.message); }
  };

  return (
    <Section title={`Agent Roster (${agents.length})`} action={
      <Stack direction="row" spacing={1}>
        <Button startIcon={<AddIcon />} onClick={() => setOpen(true)}>Spawn</Button>
        <IconButton onClick={load}><RefreshIcon /></IconButton>
      </Stack>
    }>
      <Table size="small">
        <TableHead><TableRow><TableCell>ID</TableCell><TableCell>Name</TableCell><TableCell>Role/Domain</TableCell><TableCell>Status</TableCell><TableCell>Actions</TableCell></TableRow></TableHead>
        <TableBody>
          {agents.map(a => (
            <TableRow key={a.agentId}>
              <TableCell>{a.agentId} {a.ephemeral ? '✨' : ''}</TableCell>
              <TableCell>{a.agentName}</TableCell>
              <TableCell>{a.role}/{a.domain}</TableCell>
              <TableCell><Chip size="small" label={a.enabled === false ? 'disabled' : (a.status || 'active')} color={a.enabled === false ? 'default' : 'success'} /></TableCell>
              <TableCell>
                <Tooltip title="Disable"><IconButton size="small" onClick={() => action(a.agentId, 'disable')}><BlockIcon fontSize="small" /></IconButton></Tooltip>
                <Tooltip title="Enable"><IconButton size="small" onClick={() => action(a.agentId, 'enable')}><CheckIcon fontSize="small" /></IconButton></Tooltip>
                <Tooltip title="Fire"><IconButton size="small" onClick={() => action(a.agentId, 'fire')}><FireIcon fontSize="small" color="error" /></IconButton></Tooltip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Spawn Ephemeral Agent</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField label="Role" value={form.role} onChange={e => setForm({...form, role: e.target.value})} placeholder="analyst, optimizer..." />
            <TextField label="Domain" value={form.domain} onChange={e => setForm({...form, domain: e.target.value})} placeholder="onboarding, churn..." />
            <TextField label="Agent Name (optional)" value={form.agentName} onChange={e => setForm({...form, agentName: e.target.value})} />
            <TextField label="Prompt" value={form.prompt} onChange={e => setForm({...form, prompt: e.target.value})} multiline rows={3} />
          </Stack>
        </DialogContent>
        <DialogActions><Button onClick={() => setOpen(false)}>Cancel</Button><Button variant="contained" onClick={spawn}>Spawn</Button></DialogActions>
      </Dialog>
    </Section>
  );
}

// ───────────── INVESTOR ─────────────
function InvestorPanel() {
  const [reports, setReports] = useState([]);
  const load = useCallback(async () => { try { setReports(await api.get('/investor-reports')); } catch (_) {} }, []);
  useEffect(() => { load(); }, [load]);
  const generate = async () => { try { await api.post('/investor-reports/generate', { period: 'month' }); load(); } catch (e) { alert(e.message); } };
  const distribute = async (id) => { if (!window.confirm('Send to investor list?')) return; try { const r = await api.post(`/investor-reports/${id}/distribute`, {}); alert(`Sent: ${r.sent}/${r.total}`); load(); } catch (e) { alert(e.message); } };
  return (
    <Section title={`Investor Reports (${reports.length})`} action={<Button onClick={generate}>Generate Now</Button>}>
      <Table size="small">
        <TableHead><TableRow><TableCell>Title</TableCell><TableCell>Period</TableCell><TableCell>Status</TableCell><TableCell>Actions</TableCell></TableRow></TableHead>
        <TableBody>
          {reports.map(r => (
            <TableRow key={r._id}>
              <TableCell>{r.title}</TableCell>
              <TableCell>{r.period}</TableCell>
              <TableCell><Chip size="small" label={r.status} /></TableCell>
              <TableCell>
                <Button size="small" onClick={() => distribute(r._id)}>Distribute</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Section>
  );
}

// ───────────── KG ─────────────
function KGPanel() {
  const [q, setQ] = useState('');
  const [results, setResults] = useState([]);
  const search = async () => { try { setResults(await api.get(`/kg/search?q=${encodeURIComponent(q)}`)); } catch (e) { alert(e.message); } };
  return (
    <Section title="Knowledge Graph">
      <Stack direction="row" spacing={1} mb={2}>
        <TextField fullWidth value={q} onChange={e => setQ(e.target.value)} placeholder="Search facts..." onKeyDown={e => e.key === 'Enter' && search()} />
        <Button variant="contained" onClick={search}>Search</Button>
      </Stack>
      {results.map((n, i) => (
        <Card key={n._id || i} sx={{ mb: 1, p: 2 }}>
          <Typography variant="subtitle2">{n.subject || n.title || `node-${i}`}</Typography>
          <Typography variant="body2" color="text.secondary">{n.summary || n.content || ''}</Typography>
        </Card>
      ))}
    </Section>
  );
}

// ───────────── ROOT ─────────────
export default function GodModePanel() {
  const [tab, setTab] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);
  const [lastEvent, setLastEvent] = useState(null);
  const subId = SUBTABS[tab].id;

  // ── Cross-surface bridge: refresh + show banner when state changes via Telegram or another admin ──
  useEffect(() => {
    let unsubscribe = null;
    let active = true;
    (async () => {
      try {
        const ws = (await import('../../../services/websocketService')).default;
        unsubscribe = ws.on('godmode:state-changed', (data) => {
          if (!active) return;
          setLastEvent(data);
          setRefreshKey(k => k + 1);
          // Auto-clear banner after 8s
          setTimeout(() => { if (active) setLastEvent(null); }, 8000);
        });
      } catch (e) { /* ws optional */ }
    })();
    return () => { active = false; if (unsubscribe) unsubscribe(); };
  }, []);

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom>🛡️ God Mode — AI Corp Control</Typography>
      {lastEvent && (
        <Alert severity="info" sx={{ mb: 2 }} onClose={() => setLastEvent(null)}>
          🔔 <b>{lastEvent.event}</b> — by <code>{lastEvent.payload?.adminName || 'admin'}</code> via {lastEvent.source} · {new Date(lastEvent.at).toLocaleTimeString()}
        </Alert>
      )}
      <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" sx={{ mb: 2 }}>
        {SUBTABS.map(t => <Tab key={t.id} label={t.label} />)}
      </Tabs>
      {subId === 'overview' && <OverviewPanel key={`ov-${refreshKey}`} />}
      {subId === 'goals' && <GoalsPanel key={`g-${refreshKey}`} />}
      {subId === 'scorecards' && <ScorecardsPanel key={`s-${refreshKey}`} />}
      {subId === 'rules' && <RulesPanel key={`r-${refreshKey}`} />}
      {subId === 'votes' && <VotesPanel key={`v-${refreshKey}`} />}
      {subId === 'proposals' && <ProposalsPanel key={`p-${refreshKey}`} />}
      {subId === 'agents' && <AgentsPanel key={`a-${refreshKey}`} />}
      {subId === 'investor' && <InvestorPanel key={`i-${refreshKey}`} />}
      {subId === 'kg' && <KGPanel key={`k-${refreshKey}`} />}
    </Box>
  );
}
