/**
 * 🏛️  AgentGovernanceTab — per-agent constitutional + scorecard + proposals + votes
 *
 * Pulls live data from /api/admin/godmode/* for the selected agent so operators
 * can see *why* an agent is gated (rules), *how* it's performing (scorecard),
 * what it's proposing (proposals), and any council votes it's involved in.
 */
import React, { useEffect, useState, useCallback } from 'react';
import {
  Box, Typography, Chip, Stack, CircularProgress, Alert, Divider,
  List, ListItem, ListItemText, Button, alpha,
} from '@mui/material';
import {
  Shield as RuleIcon,
  Assessment as ScoreIcon,
  Lightbulb as ProposalIcon,
  HowToVote as VoteIcon,
} from '@mui/icons-material';
import apiClient from '../../../../services/api';

const Section = ({ title, icon, children, accent = '#8b5cf6' }) => (
  <Box sx={{ mb: 3 }}>
    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
      <Box sx={{ color: accent, display: 'flex' }}>{icon}</Box>
      <Typography variant="overline" sx={{ color: alpha('#fff', 0.7), letterSpacing: 1, fontWeight: 700 }}>
        {title}
      </Typography>
    </Stack>
    <Box sx={{
      p: 1.5, borderRadius: 2,
      background: alpha(accent, 0.06),
      border: `1px solid ${alpha(accent, 0.18)}`,
    }}>
      {children}
    </Box>
  </Box>
);

const Empty = ({ msg }) => (
  <Typography variant="caption" sx={{ color: alpha('#fff', 0.45), fontStyle: 'italic' }}>{msg}</Typography>
);

const AgentGovernanceTab = ({ agent }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [scorecard, setScorecard] = useState(null);
  const [rules, setRules] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [votes, setVotes] = useState([]);

  const fetchAll = useCallback(async () => {
    if (!agent?.id) return;
    setLoading(true);
    setError(null);
    try {
      const [scoreRes, rulesRes, propRes, votesRes] = await Promise.all([
        apiClient.get(`/admin/godmode/scorecards/${agent.id}/latest`).catch(() => ({ data: { data: null } })),
        apiClient.get('/admin/godmode/rules').catch(() => ({ data: { data: [] } })),
        apiClient.get('/admin/godmode/proposals').catch(() => ({ data: { data: [] } })),
        apiClient.get('/admin/godmode/votes').catch(() => ({ data: { data: [] } })),
      ]);

      const scoreData = scoreRes.data?.data || scoreRes.data;
      setScorecard(scoreData || null);

      const allRules = rulesRes.data?.data || rulesRes.data || [];
      // Filter rules that apply to this agent (or "*"/all)
      setRules(allRules.filter(r =>
        !r.appliesTo ||
        r.appliesTo === '*' ||
        (Array.isArray(r.appliesTo) && (r.appliesTo.includes('*') || r.appliesTo.includes(agent.id))) ||
        r.agentId === agent.id
      ));

      const allProposals = propRes.data?.data || propRes.data || [];
      setProposals(allProposals.filter(p => p.proposingAgentId === agent.id));

      const allVotes = votesRes.data?.data || votesRes.data || [];
      setVotes(allVotes.filter(v => v.subjectAgentId === agent.id || v.proposingAgentId === agent.id));
    } catch (e) {
      setError(e.message || 'Failed to load governance data');
    } finally {
      setLoading(false);
    }
  }, [agent?.id]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  if (loading) {
    return (
      <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress size={28} sx={{ color: '#8b5cf6' }} />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="warning" sx={{ m: 2 }}>{error}</Alert>;
  }

  return (
    <Box sx={{ p: 2 }}>
      {/* Scorecard */}
      <Section title="Scorecard" icon={<ScoreIcon fontSize="small" />} accent="#10b981">
        {scorecard ? (
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Chip size="small" label={`Quality ${scorecard.quality ?? '—'}`} sx={{ background: alpha('#10b981', 0.18), color: '#a7f3d0' }} />
            <Chip size="small" label={`Success ${scorecard.successRate ?? '—'}%`} sx={{ background: alpha('#3b82f6', 0.18), color: '#bfdbfe' }} />
            <Chip size="small" label={`Latency ${scorecard.latencyMs ?? '—'}ms`} sx={{ background: alpha('#f59e0b', 0.18), color: '#fde68a' }} />
            <Chip size="small" label={`Cost $${(scorecard.costUsd ?? 0).toFixed(3)}`} sx={{ background: alpha('#ec4899', 0.18), color: '#fbcfe8' }} />
            <Chip size="small" label={`Period: ${scorecard.period || 'week'}`} sx={{ background: alpha('#fff', 0.06), color: alpha('#fff', 0.7) }} />
          </Stack>
        ) : <Empty msg="No scorecard yet — agent may be too new." />}
      </Section>

      {/* Rules governing this agent */}
      <Section title={`Constitutional Rules (${rules.length})`} icon={<RuleIcon fontSize="small" />} accent="#8b5cf6">
        {rules.length === 0 ? <Empty msg="No specific rules apply to this agent." /> : (
          <List dense disablePadding>
            {rules.slice(0, 8).map(r => (
              <ListItem key={r.ruleId || r._id} disableGutters sx={{ alignItems: 'flex-start' }}>
                <ListItemText
                  primary={<Typography variant="body2" sx={{ color: '#e2e8f0', fontWeight: 600 }}>{r.name || r.ruleId}</Typography>}
                  secondary={
                    <Stack direction="row" spacing={1} sx={{ mt: 0.5 }} flexWrap="wrap" useFlexGap>
                      <Chip size="small" label={r.action || '—'} sx={{ height: 18, fontSize: '0.65rem', background: alpha('#8b5cf6', 0.2), color: '#ddd6fe' }} />
                      <Chip size="small" label={r.category || 'general'} sx={{ height: 18, fontSize: '0.65rem', background: alpha('#fff', 0.06), color: alpha('#fff', 0.6) }} />
                      {r.active === false && <Chip size="small" label="inactive" sx={{ height: 18, fontSize: '0.65rem', background: alpha('#ef4444', 0.2), color: '#fecaca' }} />}
                    </Stack>
                  }
                />
              </ListItem>
            ))}
          </List>
        )}
      </Section>

      {/* Proposals from this agent */}
      <Section title={`Proposals (${proposals.length})`} icon={<ProposalIcon fontSize="small" />} accent="#f59e0b">
        {proposals.length === 0 ? <Empty msg="No pending proposals from this agent." /> : (
          <List dense disablePadding>
            {proposals.slice(0, 5).map(p => (
              <ListItem key={p._id} disableGutters>
                <ListItemText
                  primary={<Typography variant="body2" sx={{ color: '#e2e8f0' }}>{p.title || p.summary || p.type}</Typography>}
                  secondary={
                    <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                      <Chip size="small" label={p.status} sx={{ height: 18, fontSize: '0.65rem', background: alpha('#f59e0b', 0.2), color: '#fde68a' }} />
                      <Chip size="small" label={p.riskLevel || 'low'} sx={{ height: 18, fontSize: '0.65rem', background: alpha('#fff', 0.06), color: alpha('#fff', 0.6) }} />
                    </Stack>
                  }
                />
              </ListItem>
            ))}
          </List>
        )}
      </Section>

      {/* Votes */}
      <Section title={`Council Votes (${votes.length})`} icon={<VoteIcon fontSize="small" />} accent="#3b82f6">
        {votes.length === 0 ? <Empty msg="No active or recent council votes about this agent." /> : (
          <List dense disablePadding>
            {votes.slice(0, 5).map(v => (
              <ListItem key={v._id} disableGutters>
                <ListItemText
                  primary={<Typography variant="body2" sx={{ color: '#e2e8f0' }}>{v.subject || v.question || v.proposalId}</Typography>}
                  secondary={
                    <Chip size="small" label={v.status} sx={{ height: 18, fontSize: '0.65rem', mt: 0.5, background: alpha('#3b82f6', 0.2), color: '#bfdbfe' }} />
                  }
                />
              </ListItem>
            ))}
          </List>
        )}
      </Section>

      <Divider sx={{ my: 2, borderColor: alpha('#fff', 0.08) }} />
      <Button size="small" variant="outlined" onClick={fetchAll} sx={{ color: '#94a3b8', borderColor: alpha('#fff', 0.15) }}>
        Refresh governance data
      </Button>
    </Box>
  );
};

export default AgentGovernanceTab;
