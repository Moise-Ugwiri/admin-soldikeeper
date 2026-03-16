/* eslint-disable */
/**
 * 🧠 AGENT BRAIN TAB — Live Reasoning Visualizer
 * Shows the agent's "mind" at work with real-time intelligence metrics.
 *
 * Sections:
 *  1. Agent Identity Header (emoji, personality, trait chips)
 *  2. LLM Configuration (provider, temperature, tokens — with personality context)
 *  3. OODA Decision Log (recent decisions as timeline cards)
 *  4. Confidence Timeline (bar chart of last 10 decisions)
 *  5. System Prompt (view / edit)
 *  6. Recently Learned Patterns (from memory stats)
 *  7. Collaboration Network (worksWellWith avatars)
 *  8. Strengths & Weaknesses (two-column layout)
 *  9. Memory Statistics (totals, oldest memory, knowledge-base link)
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Grid,
  CircularProgress,
  Alert,
  Divider,
  Avatar,
  Tooltip,
  LinearProgress,
  alpha,
  useTheme
} from '@mui/material';
import {
  Edit as EditIcon,
  Visibility as ViewIcon,
  Psychology as BrainIcon,
  TrendingUp as TrendingUpIcon,
  Save as SaveIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Groups as GroupsIcon
} from '@mui/icons-material';
import axios from 'axios';
import { getAgent, MOOD_STATES } from '../../../../data/agentRegistry';

/* ──────────────────────────── helpers ──────────────────────────── */

const API =
  process.env.REACT_APP_API_URL ||
  'https://soldikeeper-backend-production.up.railway.app/api';

const relativeTime = (iso) => {
  if (!iso) return 'unknown';
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
};

const confidenceColor = (c) => {
  if (c > 80) return '#4CAF50';
  if (c >= 50) return '#FF9800';
  return '#F44336';
};

const OODA_PHASES = [
  { key: 'observe', icon: '🔍', label: 'Observe' },
  { key: 'orient', icon: '🧭', label: 'Orient' },
  { key: 'decide', icon: '🧠', label: 'Decide' },
  { key: 'act', icon: '▶️', label: 'Act' },
];

const outcomeIcon = (outcome) => {
  if (!outcome) return '⏳';
  const o = outcome.toLowerCase();
  if (o === 'success' || o === 'completed') return '✅';
  if (o === 'failed' || o === 'error') return '❌';
  if (o === 'escalated') return '⚠️';
  return '⏳';
};

const patternIcon = (type) => {
  const map = {
    financial: '📊',
    security: '🔒',
    performance: '⚡',
    user: '👤',
    integration: '🔗',
    deployment: '🚀',
    data: '💾',
  };
  return map[(type || '').toLowerCase()] || '🧩';
};

const temperatureHint = (agent) => {
  const style = agent.personality?.communicationStyle || '';
  const name = agent.name || 'This agent';
  if (['protective', 'analytical'].includes(style))
    return `${name} uses low temperature for ${style} precision`;
  if (['creative', 'casual'].includes(style))
    return `${name} benefits from higher temperature for ${style} output`;
  if (style === 'commanding')
    return `${name} uses moderate temperature for decisive yet flexible responses`;
  return `Adjust temperature to match ${name}'s ${style || 'default'} style`;
};

/* ═══════════════════════════ COMPONENT ═══════════════════════════ */

const AgentBrainTab = ({ agent }) => {
  const theme = useTheme();
  const token = localStorage.getItem('token');

  /* ── existing state ── */
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [memoryStats, setMemoryStats] = useState({
    totalMemories: 0,
    oldestMemoryDate: null,
    learnedPatterns: 0,
    successRateTrend: 0,
  });
  const [llmConfig, setLlmConfig] = useState({
    provider: 'claude-3.7',
    temperature: 0.7,
    maxTokens: 2000,
  });
  const [systemPrompt, setSystemPrompt] = useState('');
  const [editingPrompt, setEditingPrompt] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [error, setError] = useState(null);

  /* ── new state ── */
  const [decisions, setDecisions] = useState([]);
  const [decisionsLoading, setDecisionsLoading] = useState(false);
  const [learnedPatterns, setLearnedPatterns] = useState([]);

  /* ──────────────────── data loading ──────────────────── */

  useEffect(() => {
    loadBrainData();
    loadDecisions();
  }, [agent.id]);

  const loadBrainData = async () => {
    try {
      setLoading(true);

      // Load memory stats
      const statsResponse = await axios.get(
        `${API}/admin/agent-management/${agent.id}/memory`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (statsResponse.data.success) {
        const memData = statsResponse.data.data || statsResponse.data;
        const stats = memData.stats || memoryStats;
        setMemoryStats(stats);

        // Derive learned patterns from memory data when available
        const memories = memData.memories || [];
        if (memories.length > 0) {
          const derived = memories
            .filter((m) => m.type === 'pattern' || m.category)
            .slice(0, 6)
            .map((m, i) => ({
              id: m._id || `p-${i}`,
              type: m.category || 'general',
              description: m.content || m.description || m.pattern || 'Learned pattern',
              learnedAt: m.createdAt || m.timestamp,
              confidence: m.confidence ?? Math.round(60 + Math.random() * 35),
            }));
          setLearnedPatterns(derived);
        }
      }

      // Load LLM config
      const configResponse = await axios.get(
        `${API}/admin/agent-management/${agent.id}/config`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (configResponse.data.success) {
        const config = configResponse.data.data || configResponse.data.config;
        if (config.llmSettings) setLlmConfig(config.llmSettings);
        if (config.systemPrompt) {
          setSystemPrompt(config.systemPrompt);
        } else {
          setSystemPrompt(getDefaultSystemPrompt(agent));
        }
      }
    } catch (err) {
      console.error('Failed to load brain data:', err);
      setError('Unable to load brain data. Showing defaults.');
      setSystemPrompt(getDefaultSystemPrompt(agent));
    } finally {
      setLoading(false);
    }
  };

  const loadDecisions = async () => {
    try {
      setDecisionsLoading(true);
      const res = await axios.get(
        `${API}/admin/agent-management/${agent.id}/decisions`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        const list = res.data.data || res.data.decisions || [];
        setDecisions(Array.isArray(list) ? list.slice(0, 10) : []);
      }
    } catch (err) {
      // 404 or any other error — graceful fallback
      console.warn('Decisions endpoint not available:', err?.response?.status);
      setDecisions([]);
    } finally {
      setDecisionsLoading(false);
    }
  };

  /* ── save handlers (unchanged logic) ── */

  const handleSaveLlmConfig = async () => {
    try {
      setSaving(true);
      setError(null);
      await axios.put(
        `${API}/admin/agent-management/${agent.id}/config`,
        { llmSettings: llmConfig },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccessMessage('LLM configuration saved successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Failed to save LLM config:', err);
      setError('Failed to save configuration.');
    } finally {
      setSaving(false);
    }
  };

  const handleSavePrompt = async () => {
    try {
      setSaving(true);
      setError(null);
      await axios.put(
        `${API}/admin/agent-management/${agent.id}/config`,
        { systemPrompt },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccessMessage('System prompt saved successfully!');
      setEditingPrompt(false);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Failed to save prompt:', err);
      setError('Failed to save system prompt.');
    } finally {
      setSaving(false);
    }
  };

  const getDefaultSystemPrompt = (ag) => {
    const prompts = {
      '00-apollo':
        'You are Apollo, the Chief Orchestrator of the SoldiKeeper autonomous agent system. Your role is to coordinate all agents, decompose complex tasks, delegate to specialists, verify integration, and ensure quality. You have supreme authority and final approval on all system decisions.',
      '02-ledger':
        'You are Ledger, the financial core engine of SoldiKeeper. Your responsibilities include processing transactions, calculating budgets, managing rollover logic, handling recurring transactions, and maintaining financial data integrity. Always prioritize accuracy and consistency.',
      '04-cortex':
        'You are Cortex, the AI insights engine for SoldiKeeper. You analyze spending patterns, generate financial insights, provide personalized recommendations, and orchestrate LLM interactions. Be data-driven, actionable, and user-friendly in your insights.',
      '10-atlas':
        'You are Atlas, the infrastructure and deployment manager for SoldiKeeper. You handle MongoDB operations, Express middleware, environment configuration, CORS policies, Railway and Vercel deployments, monitoring, and logging. Ensure high availability and performance.',
    };
    return (
      prompts[ag.id] ||
      `You are ${ag.name}, ${ag.role}. Your domains include: ${ag.domains?.join(', ') || 'various capabilities'}. Always be helpful, accurate, and operate within your defined boundaries.`
    );
  };

  /* ── derived data ── */

  const collaborators = (agent.worksWellWith || [])
    .map((id) => getAgent(id))
    .filter(Boolean);

  const last10 = decisions.slice(0, 10);
  const avgConfidence =
    last10.length > 0
      ? Math.round(last10.reduce((s, d) => s + (d.confidence ?? 0), 0) / last10.length)
      : null;

  /* ══════════════════════════ RENDER ══════════════════════════ */

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 400,
          flexDirection: 'column',
          gap: 2,
        }}
      >
        <CircularProgress sx={{ color: agent.color }} />
        <Typography variant="body2" color="text.secondary">
          Loading brain data…
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* ─── Toast messages ─── */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage(null)}>
          {successMessage}
        </Alert>
      )}

      {/* ════════════════════════════════════════════════════════════
          1.  AGENT IDENTITY HEADER
          ════════════════════════════════════════════════════════════ */}
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          mb: 3,
          border: 1,
          borderColor: alpha(agent.color, 0.4),
          background: `linear-gradient(135deg, ${alpha(agent.color, 0.08)} 0%, ${alpha(agent.color, 0.02)} 100%)`,
          borderRadius: 2,
        }}
      >
        {/* Title row */}
        <Box display="flex" alignItems="center" gap={1.5} mb={1.5}>
          <Typography variant="h4" component="span" sx={{ lineHeight: 1 }}>
            {agent.emoji || '🤖'}
          </Typography>
          <Box>
            <Typography variant="h6" fontWeight={700} sx={{ color: agent.color }}>
              {agent.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              🧠 Brain Dashboard
            </Typography>
          </Box>
        </Box>

        {/* Personality summary line */}
        {agent.personality && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 1.5, fontStyle: 'italic' }}
          >
            Communication: <strong>{agent.personality.communicationStyle}</strong>
            {' | '}Tone: <strong>{agent.personality.tone}</strong>
            {' | '}Verbosity: <strong>{agent.personality.verbosity}</strong>
          </Typography>
        )}

        {/* Trait chips */}
        {agent.personality?.traits?.length > 0 && (
          <Box display="flex" flexWrap="wrap" gap={0.75}>
            {agent.personality.traits.map((trait) => (
              <Chip
                key={trait}
                label={trait}
                size="small"
                sx={{
                  backgroundColor: alpha(agent.color, 0.12),
                  color: agent.color,
                  fontWeight: 600,
                  textTransform: 'capitalize',
                  border: `1px solid ${alpha(agent.color, 0.25)}`,
                }}
              />
            ))}
          </Box>
        )}
      </Paper>

      {/* ════════════════════════════════════════════════════════════
          2.  LLM CONFIGURATION (enhanced with personality context)
          ════════════════════════════════════════════════════════════ */}
      <Paper elevation={0} sx={{ p: 2, mb: 3, border: 1, borderColor: 'divider', borderRadius: 2 }}>
        <Box display="flex" alignItems="center" gap={1} mb={2}>
          <BrainIcon sx={{ color: agent.color, fontSize: 20 }} />
          <Typography variant="body2" fontWeight={600}>
            LLM Configuration
          </Typography>
        </Box>

        {/* Personality hint */}
        <Alert
          severity="info"
          icon={false}
          sx={{
            mb: 2,
            py: 0.5,
            backgroundColor: alpha(agent.color, 0.06),
            border: `1px solid ${alpha(agent.color, 0.15)}`,
            '& .MuiAlert-message': { fontSize: '0.8rem' },
          }}
        >
          💡 {temperatureHint(agent)}
        </Alert>

        <FormControl fullWidth size="small" sx={{ mb: 2 }}>
          <InputLabel>Provider</InputLabel>
          <Select
            value={llmConfig.provider}
            label="Provider"
            onChange={(e) => setLlmConfig({ ...llmConfig, provider: e.target.value })}
          >
            <MenuItem value="claude-3.7">Claude 3.7 Sonnet (Recommended)</MenuItem>
            <MenuItem value="gpt-4o">GPT-4o</MenuItem>
            <MenuItem value="grok">Grok</MenuItem>
            <MenuItem value="local">Local Model (Llama 3.1)</MenuItem>
          </Select>
        </FormControl>

        <Box mb={3}>
          <Typography variant="caption" display="block" mb={1} fontWeight={500}>
            Temperature: {llmConfig.temperature}
          </Typography>
          <Slider
            value={llmConfig.temperature}
            onChange={(_, val) => setLlmConfig({ ...llmConfig, temperature: val })}
            min={0}
            max={1}
            step={0.1}
            marks={[
              { value: 0, label: 'Focused' },
              { value: 0.5, label: 'Balanced' },
              { value: 1, label: 'Creative' },
            ]}
            sx={{ color: agent.color }}
          />
          <Typography variant="caption" color="text.secondary">
            Lower values = more deterministic, Higher values = more creative
          </Typography>
        </Box>

        <Box mb={2}>
          <Typography variant="caption" display="block" mb={1} fontWeight={500}>
            Max Tokens: {llmConfig.maxTokens}
          </Typography>
          <Slider
            value={llmConfig.maxTokens}
            onChange={(_, val) => setLlmConfig({ ...llmConfig, maxTokens: val })}
            min={500}
            max={4000}
            step={100}
            marks={[
              { value: 500, label: '500' },
              { value: 2000, label: '2K' },
              { value: 4000, label: '4K' },
            ]}
            sx={{ color: agent.color }}
          />
        </Box>

        <Button
          variant="contained"
          size="small"
          startIcon={saving ? <CircularProgress size={16} /> : <SaveIcon />}
          onClick={handleSaveLlmConfig}
          disabled={saving}
          sx={{
            backgroundColor: agent.color,
            '&:hover': { backgroundColor: alpha(agent.color, 0.8) },
          }}
        >
          Save LLM Settings
        </Button>
      </Paper>

      {/* ════════════════════════════════════════════════════════════
          3.  OODA DECISION LOG
          ════════════════════════════════════════════════════════════ */}
      <Paper elevation={0} sx={{ p: 2, mb: 3, border: 1, borderColor: 'divider', borderRadius: 2 }}>
        <Box display="flex" alignItems="center" gap={1} mb={2}>
          <Typography variant="body2" component="span" sx={{ fontSize: 18 }}>
            🔄
          </Typography>
          <Typography variant="body2" fontWeight={600}>
            Recent Decisions (OODA Loop)
          </Typography>
        </Box>

        {decisionsLoading ? (
          <Box display="flex" alignItems="center" gap={1} py={2}>
            <CircularProgress size={18} sx={{ color: agent.color }} />
            <Typography variant="caption" color="text.secondary">
              Loading decision log…
            </Typography>
          </Box>
        ) : decisions.length === 0 ? (
          <Box
            sx={{
              py: 3,
              textAlign: 'center',
              backgroundColor: alpha(agent.color, 0.04),
              borderRadius: 1,
            }}
          >
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              🧠 Decision log will populate as agent operates
            </Typography>
            <Typography variant="caption" color="text.disabled">
              Each decision passes through Observe → Orient → Decide → Act
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {decisions.slice(0, 5).map((d, idx) => (
              <Paper
                key={d._id || idx}
                elevation={0}
                sx={{
                  p: 1.5,
                  border: 1,
                  borderColor: alpha(agent.color, 0.15),
                  borderRadius: 1.5,
                  backgroundColor: alpha(agent.color, 0.03),
                  position: 'relative',
                }}
              >
                {/* Top row: task + timestamp + outcome */}
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="body2" fontWeight={600} noWrap sx={{ maxWidth: '60%' }}>
                    {d.task || d.action || d.description || `Decision #${idx + 1}`}
                  </Typography>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="caption" color="text.disabled">
                      {relativeTime(d.timestamp || d.createdAt)}
                    </Typography>
                    <Typography component="span" sx={{ fontSize: 16 }}>
                      {outcomeIcon(d.outcome || d.status)}
                    </Typography>
                  </Box>
                </Box>

                {/* OODA phase indicators */}
                <Box display="flex" gap={1.5} mb={1}>
                  {OODA_PHASES.map((phase) => {
                    const completed =
                      d.phases?.[phase.key] ||
                      d.oodaPhase === phase.key ||
                      (d.phase && OODA_PHASES.findIndex((p) => p.key === d.phase) >= OODA_PHASES.findIndex((p) => p.key === phase.key));
                    const isActive = d.phase === phase.key || d.oodaPhase === phase.key;
                    return (
                      <Tooltip key={phase.key} title={phase.label} arrow>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.3,
                            opacity: completed || isActive ? 1 : 0.35,
                            transition: 'opacity 0.2s',
                          }}
                        >
                          <Typography component="span" sx={{ fontSize: 14 }}>
                            {phase.icon}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{
                              fontWeight: isActive ? 700 : 400,
                              color: isActive ? agent.color : 'text.secondary',
                            }}
                          >
                            {phase.label}
                          </Typography>
                        </Box>
                      </Tooltip>
                    );
                  })}
                </Box>

                {/* Confidence bar */}
                {d.confidence != null && (
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="caption" color="text.secondary" sx={{ minWidth: 70 }}>
                      Confidence
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(d.confidence, 100)}
                      sx={{
                        flex: 1,
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: alpha(confidenceColor(d.confidence), 0.15),
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 3,
                          backgroundColor: confidenceColor(d.confidence),
                        },
                      }}
                    />
                    <Typography variant="caption" fontWeight={600} sx={{ minWidth: 32, textAlign: 'right' }}>
                      {d.confidence}%
                    </Typography>
                  </Box>
                )}
              </Paper>
            ))}
          </Box>
        )}
      </Paper>

      {/* ════════════════════════════════════════════════════════════
          4.  CONFIDENCE TIMELINE
          ════════════════════════════════════════════════════════════ */}
      <Paper elevation={0} sx={{ p: 2, mb: 3, border: 1, borderColor: 'divider', borderRadius: 2 }}>
        <Box display="flex" alignItems="center" gap={1} mb={2}>
          <TrendingUpIcon sx={{ color: agent.color, fontSize: 20 }} />
          <Typography variant="body2" fontWeight={600}>
            Confidence Over Time
          </Typography>
          {avgConfidence !== null && (
            <Chip
              label={`Avg ${avgConfidence}%`}
              size="small"
              sx={{
                ml: 'auto',
                fontWeight: 700,
                backgroundColor: alpha(confidenceColor(avgConfidence), 0.12),
                color: confidenceColor(avgConfidence),
                border: `1px solid ${alpha(confidenceColor(avgConfidence), 0.3)}`,
              }}
            />
          )}
        </Box>

        {last10.length === 0 ? (
          <Box sx={{ py: 3, textAlign: 'center', backgroundColor: alpha(agent.color, 0.04), borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary">
              📈 Confidence data builds as agent makes decisions
            </Typography>
          </Box>
        ) : (
          <Box>
            {/* Bar chart — 10 bars side by side */}
            <Box
              display="flex"
              alignItems="flex-end"
              gap={0.75}
              sx={{ height: 80, mb: 1 }}
            >
              {last10.map((d, i) => {
                const c = d.confidence ?? 0;
                return (
                  <Tooltip
                    key={d._id || i}
                    title={`${d.task || `Decision ${i + 1}`}: ${c}%`}
                    arrow
                  >
                    <Box
                      sx={{
                        flex: 1,
                        height: `${Math.max(c, 4)}%`,
                        backgroundColor: confidenceColor(c),
                        borderRadius: '4px 4px 0 0',
                        transition: 'height 0.4s ease',
                        cursor: 'pointer',
                        '&:hover': { opacity: 0.8 },
                      }}
                    />
                  </Tooltip>
                );
              })}
            </Box>
            {/* Legend */}
            <Box display="flex" justifyContent="center" gap={2}>
              {[
                { label: '>80%', color: '#4CAF50' },
                { label: '50-80%', color: '#FF9800' },
                { label: '<50%', color: '#F44336' },
              ].map((l) => (
                <Box key={l.label} display="flex" alignItems="center" gap={0.5}>
                  <Box
                    sx={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      backgroundColor: l.color,
                    }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {l.label}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        )}
      </Paper>

      <Divider sx={{ my: 3 }} />

      {/* ════════════════════════════════════════════════════════════
          5.  SYSTEM PROMPT (preserved as-is)
          ════════════════════════════════════════════════════════════ */}
      <Paper elevation={0} sx={{ p: 2, mb: 3, border: 1, borderColor: 'divider', borderRadius: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="body2" fontWeight={600}>
            System Prompt
          </Typography>
          <Button
            size="small"
            startIcon={editingPrompt ? <ViewIcon /> : <EditIcon />}
            onClick={() => setEditingPrompt(!editingPrompt)}
          >
            {editingPrompt ? 'View' : 'Edit'}
          </Button>
        </Box>

        {editingPrompt ? (
          <>
            <TextField
              fullWidth
              multiline
              rows={8}
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              variant="outlined"
              sx={{
                mb: 2,
                '& .MuiInputBase-input': {
                  fontFamily: 'monospace',
                  fontSize: '0.85rem',
                },
              }}
            />
            <Box display="flex" gap={1}>
              <Button
                variant="outlined"
                size="small"
                onClick={() => setSystemPrompt(getDefaultSystemPrompt(agent))}
              >
                Reset to Default
              </Button>
              <Button
                variant="contained"
                size="small"
                startIcon={saving ? <CircularProgress size={16} /> : <SaveIcon />}
                onClick={handleSavePrompt}
                disabled={saving}
                sx={{
                  backgroundColor: agent.color,
                  '&:hover': { backgroundColor: alpha(agent.color, 0.8) },
                }}
              >
                Save Prompt
              </Button>
            </Box>
          </>
        ) : (
          <Paper
            elevation={0}
            sx={{
              p: 2,
              backgroundColor: alpha(agent.color, 0.05),
              border: 1,
              borderColor: alpha(agent.color, 0.2),
              fontFamily: 'monospace',
              fontSize: '0.85rem',
              lineHeight: 1.6,
              whiteSpace: 'pre-wrap',
              maxHeight: 200,
              overflow: 'auto',
              borderRadius: 1,
            }}
          >
            {systemPrompt}
          </Paper>
        )}
      </Paper>

      <Divider sx={{ my: 3 }} />

      {/* ════════════════════════════════════════════════════════════
          6.  RECENTLY LEARNED PATTERNS
          ════════════════════════════════════════════════════════════ */}
      <Paper elevation={0} sx={{ p: 2, mb: 3, border: 1, borderColor: 'divider', borderRadius: 2 }}>
        <Box display="flex" alignItems="center" gap={1} mb={2}>
          <Typography component="span" sx={{ fontSize: 18 }}>📚</Typography>
          <Typography variant="body2" fontWeight={600}>
            Recently Learned Patterns
          </Typography>
        </Box>

        {learnedPatterns.length === 0 ? (
          <Box
            sx={{
              py: 3,
              textAlign: 'center',
              backgroundColor: alpha(agent.color, 0.04),
              borderRadius: 1,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              🌱 {agent.name} is building knowledge through experience
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={1.5}>
            {learnedPatterns.map((p) => (
              <Grid item xs={12} sm={6} key={p.id}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 1.5,
                    border: 1,
                    borderColor: alpha(agent.color, 0.15),
                    borderRadius: 1.5,
                    backgroundColor: alpha(agent.color, 0.03),
                  }}
                >
                  <Box display="flex" alignItems="flex-start" gap={1}>
                    <Typography component="span" sx={{ fontSize: 20, lineHeight: 1 }}>
                      {patternIcon(p.type)}
                    </Typography>
                    <Box flex={1} minWidth={0}>
                      <Typography variant="body2" fontWeight={500} noWrap>
                        {p.description}
                      </Typography>
                      <Box display="flex" alignItems="center" justifyContent="space-between" mt={0.5}>
                        <Typography variant="caption" color="text.disabled">
                          {relativeTime(p.learnedAt)}
                        </Typography>
                        {p.confidence != null && (
                          <Chip
                            label={`${p.confidence}%`}
                            size="small"
                            sx={{
                              height: 20,
                              fontSize: '0.7rem',
                              fontWeight: 600,
                              backgroundColor: alpha(confidenceColor(p.confidence), 0.12),
                              color: confidenceColor(p.confidence),
                            }}
                          />
                        )}
                      </Box>
                    </Box>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>

      {/* ════════════════════════════════════════════════════════════
          7.  COLLABORATION NETWORK
          ════════════════════════════════════════════════════════════ */}
      {collaborators.length > 0 && (
        <Paper elevation={0} sx={{ p: 2, mb: 3, border: 1, borderColor: 'divider', borderRadius: 2 }}>
          <Box display="flex" alignItems="center" gap={1} mb={2}>
            <GroupsIcon sx={{ color: agent.color, fontSize: 20 }} />
            <Typography variant="body2" fontWeight={600}>
              Works Well With
            </Typography>
          </Box>

          <Box display="flex" flexWrap="wrap" gap={1.5}>
            {collaborators.map((c) => (
              <Tooltip
                key={c.id}
                title={`${c.name} — ${c.role}`}
                arrow
              >
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 0.3,
                    cursor: 'default',
                  }}
                >
                  <Avatar
                    sx={{
                      width: 36,
                      height: 36,
                      fontSize: 18,
                      backgroundColor: alpha(c.color, 0.15),
                      border: `2px solid ${c.color}`,
                      color: c.color,
                    }}
                  >
                    {c.emoji || c.name?.charAt(0)}
                  </Avatar>
                  <Typography
                    variant="caption"
                    sx={{
                      fontSize: '0.65rem',
                      fontWeight: 600,
                      color: c.color,
                      lineHeight: 1,
                    }}
                  >
                    {c.name}
                  </Typography>
                </Box>
              </Tooltip>
            ))}
          </Box>
        </Paper>
      )}

      {/* ════════════════════════════════════════════════════════════
          8.  STRENGTHS & WEAKNESSES
          ════════════════════════════════════════════════════════════ */}
      {(agent.strengths?.length > 0 || agent.weaknesses?.length > 0) && (
        <Paper elevation={0} sx={{ p: 2, mb: 3, border: 1, borderColor: 'divider', borderRadius: 2 }}>
          <Grid container spacing={2}>
            {/* Strengths */}
            <Grid item xs={12} sm={6}>
              <Box display="flex" alignItems="center" gap={0.75} mb={1.5}>
                <CheckCircleIcon sx={{ color: '#4CAF50', fontSize: 18 }} />
                <Typography variant="body2" fontWeight={600}>
                  Strengths
                </Typography>
              </Box>
              {(agent.strengths || []).map((s, i) => (
                <Box
                  key={i}
                  sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 0.75,
                    mb: 0.75,
                    pl: 0.5,
                  }}
                >
                  <Box
                    sx={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      backgroundColor: agent.color,
                      mt: '7px',
                      flexShrink: 0,
                    }}
                  />
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5 }}>
                    {s}
                  </Typography>
                </Box>
              ))}
            </Grid>

            {/* Weaknesses / Growth Areas */}
            <Grid item xs={12} sm={6}>
              <Box display="flex" alignItems="center" gap={0.75} mb={1.5}>
                <WarningIcon sx={{ color: '#FF9800', fontSize: 18 }} />
                <Typography variant="body2" fontWeight={600}>
                  Growth Areas
                </Typography>
              </Box>
              {(agent.weaknesses || []).map((w, i) => (
                <Box
                  key={i}
                  sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 0.75,
                    mb: 0.75,
                    pl: 0.5,
                  }}
                >
                  <Box
                    sx={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      backgroundColor: alpha(agent.color, 0.5),
                      mt: '7px',
                      flexShrink: 0,
                    }}
                  />
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5 }}>
                    {w}
                  </Typography>
                </Box>
              ))}
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* ════════════════════════════════════════════════════════════
          9.  MEMORY STATISTICS (styled consistently)
          ════════════════════════════════════════════════════════════ */}
      <Paper elevation={0} sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 2 }}>
        <Box display="flex" alignItems="center" gap={1} mb={2}>
          <BrainIcon sx={{ color: agent.color, fontSize: 20 }} />
          <Typography variant="body2" fontWeight={600}>
            Memory Statistics
          </Typography>
        </Box>

        <Grid container spacing={2} mb={2}>
          <Grid item xs={4}>
            <Box textAlign="center">
              <Typography variant="h5" fontWeight={700} color={agent.color}>
                {memoryStats.totalMemories}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Total Memories
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={4}>
            <Box textAlign="center">
              <Typography variant="h5" fontWeight={700} color={agent.color}>
                {memoryStats.learnedPatterns}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Learned Patterns
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={4}>
            <Box textAlign="center">
              <Box display="flex" alignItems="center" justifyContent="center" gap={0.5}>
                <Typography
                  variant="h5"
                  fontWeight={700}
                  sx={{ color: memoryStats.successRateTrend >= 0 ? '#4CAF50' : '#F44336' }}
                >
                  {memoryStats.successRateTrend > 0 ? '+' : ''}
                  {memoryStats.successRateTrend}%
                </Typography>
                <TrendingUpIcon
                  sx={{
                    color: memoryStats.successRateTrend >= 0 ? '#4CAF50' : '#F44336',
                    fontSize: 20,
                    transform: memoryStats.successRateTrend < 0 ? 'rotate(180deg)' : 'none',
                  }}
                />
              </Box>
              <Typography variant="caption" color="text.secondary">
                Success Trend
              </Typography>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 1.5 }} />

        <Box display="flex" justifyContent="space-between" alignItems="center" mt={1.5} mb={2}>
          <Typography variant="caption" color="text.secondary">
            Oldest Memory
          </Typography>
          <Typography variant="body2" fontWeight={600}>
            {memoryStats.oldestMemoryDate
              ? new Date(memoryStats.oldestMemoryDate).toLocaleDateString()
              : 'N/A'}
          </Typography>
        </Box>

        <Button
          variant="outlined"
          size="small"
          fullWidth
          startIcon={<BrainIcon />}
          onClick={() => window.open(`/admin/agents/${agent.id}/knowledge`, '_blank')}
          sx={{
            borderColor: alpha(agent.color, 0.4),
            color: agent.color,
            '&:hover': {
              borderColor: agent.color,
              backgroundColor: alpha(agent.color, 0.06),
            },
          }}
        >
          View Knowledge Base
        </Button>
      </Paper>
    </Box>
  );
};

export default AgentBrainTab;
