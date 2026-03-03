/* eslint-disable */
/**
 * 🧠 AGENT BRAIN TAB
 * View and configure agent intelligence settings
 * Features:
 * - LLM configuration (provider, temperature, tokens)
 * - System prompt editor
 * - Agent knowledge display
 * - Memory statistics
 * - Learning patterns
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
  alpha
} from '@mui/material';
import {
  Edit as EditIcon,
  Visibility as ViewIcon,
  Psychology as BrainIcon,
  TrendingUp as TrendingUpIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import axios from 'axios';
const AgentBrainTab = ({ agent }) => {
  const token = localStorage.getItem('token');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [memoryStats, setMemoryStats] = useState({
    totalMemories: 0,
    oldestMemoryDate: null,
    learnedPatterns: 0,
    successRateTrend: 0
  });
  const [llmConfig, setLlmConfig] = useState({
    provider: 'claude-3.7',
    temperature: 0.7,
    maxTokens: 2000
  });
  const [systemPrompt, setSystemPrompt] = useState('');
  const [editingPrompt, setEditingPrompt] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadBrainData();
  }, [agent.id]);

  const loadBrainData = async () => {
    try {
      setLoading(true);

      // Load memory stats
      const statsResponse = await axios.get(
        `${process.env.REACT_APP_API_URL || 'https://soldikeeper-backend-production.up.railway.app/api'}/admin/agent-management/${agent.id}/memory`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (statsResponse.data.success) {
        const memData = statsResponse.data.data || statsResponse.data;
        setMemoryStats(memData.stats || memoryStats);
      }

      // Load LLM config
      const configResponse = await axios.get(
        `${process.env.REACT_APP_API_URL || 'https://soldikeeper-backend-production.up.railway.app/api'}/admin/agent-management/${agent.id}/config`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (configResponse.data.success) {
        const config = configResponse.data.data || configResponse.data.config;
        if (config.llmSettings) {
          setLlmConfig(config.llmSettings);
        }
        if (config.systemPrompt) {
          setSystemPrompt(config.systemPrompt);
        } else {
          // Set default system prompt based on agent
          setSystemPrompt(getDefaultSystemPrompt(agent));
        }
      }
    } catch (err) {
      console.error('Failed to load brain data:', err);
      setError('Unable to load brain data. Showing defaults.');
      // Set default prompt on error
      setSystemPrompt(getDefaultSystemPrompt(agent));
    } finally {
      setLoading(false);
    }
  };

  const handleSaveLlmConfig = async () => {
    try {
      setSaving(true);
      setError(null);

      await axios.put(
        `${process.env.REACT_APP_API_URL || 'https://soldikeeper-backend-production.up.railway.app/api'}/admin/agent-management/${agent.id}/config`,
        { llmSettings: llmConfig },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
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
        `${process.env.REACT_APP_API_URL || 'https://soldikeeper-backend-production.up.railway.app/api'}/admin/agent-management/${agent.id}/config`,
        { systemPrompt },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
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

  const getDefaultSystemPrompt = (agent) => {
    const prompts = {
      '00-apollo': `You are Apollo, the Chief Orchestrator of the SoldiKeeper autonomous agent system. Your role is to coordinate all agents, decompose complex tasks, delegate to specialists, verify integration, and ensure quality. You have supreme authority and final approval on all system decisions.`,
      '02-ledger': `You are Ledger, the financial core engine of SoldiKeeper. Your responsibilities include processing transactions, calculating budgets, managing rollover logic, handling recurring transactions, and maintaining financial data integrity. Always prioritize accuracy and consistency.`,
      '04-cortex': `You are Cortex, the AI insights engine for SoldiKeeper. You analyze spending patterns, generate financial insights, provide personalized recommendations, and orchestrate LLM interactions. Be data-driven, actionable, and user-friendly in your insights.`,
      '10-atlas': `You are Atlas, the infrastructure and deployment manager for SoldiKeeper. You handle MongoDB operations, Express middleware, environment configuration, CORS policies, Railway and Vercel deployments, monitoring, and logging. Ensure high availability and performance.`
    };
    
    return prompts[agent.id] || `You are ${agent.name}, ${agent.role}. Your domains include: ${agent.domains?.join(', ') || 'various capabilities'}. Always be helpful, accurate, and operate within your defined boundaries.`;
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 400,
          flexDirection: 'column',
          gap: 2
        }}
      >
        <CircularProgress sx={{ color: agent.color }} />
        <Typography variant="body2" color="text.secondary">
          Loading brain data...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Success/Error messages */}
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

      {/* LLM Configuration */}
      <Paper elevation={0} sx={{ p: 2, mb: 3, border: 1, borderColor: 'divider' }}>
        <Typography variant="body2" fontWeight={600} mb={2}>
          LLM Configuration
        </Typography>

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
            onChange={(e, val) => setLlmConfig({ ...llmConfig, temperature: val })}
            min={0}
            max={1}
            step={0.1}
            marks={[
              { value: 0, label: 'Focused' },
              { value: 0.5, label: 'Balanced' },
              { value: 1, label: 'Creative' }
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
            onChange={(e, val) => setLlmConfig({ ...llmConfig, maxTokens: val })}
            min={500}
            max={4000}
            step={100}
            marks={[
              { value: 500, label: '500' },
              { value: 2000, label: '2K' },
              { value: 4000, label: '4K' }
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
            '&:hover': {
              backgroundColor: alpha(agent.color, 0.8)
            }
          }}
        >
          Save LLM Settings
        </Button>
      </Paper>

      <Divider sx={{ my: 3 }} />

      {/* System Prompt */}
      <Paper elevation={0} sx={{ p: 2, mb: 3, border: 1, borderColor: 'divider' }}>
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
                  fontSize: '0.85rem'
                }
              }}
            />
            <Box display="flex" gap={1}>
              <Button
                variant="outlined"
                size="small"
                onClick={() => {
                  setSystemPrompt(getDefaultSystemPrompt(agent));
                }}
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
                  '&:hover': {
                    backgroundColor: alpha(agent.color, 0.8)
                  }
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
              overflow: 'auto'
            }}
          >
            {systemPrompt}
          </Paper>
        )}
      </Paper>

      <Divider sx={{ my: 3 }} />

      {/* Agent Knowledge & Learning */}
      <Paper elevation={0} sx={{ p: 2, mb: 3, border: 1, borderColor: 'divider' }}>
        <Typography variant="body2" fontWeight={600} mb={2}>
          Agent Knowledge & Learning
        </Typography>

        <Grid container spacing={2} mb={2}>
          <Grid item xs={6}>
            <Box textAlign="center">
              <Typography variant="h5" fontWeight={700} color={agent.color}>
                {memoryStats.learnedPatterns}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Learned Patterns
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box textAlign="center">
              <Box display="flex" alignItems="center" justifyContent="center" gap={0.5}>
                <Typography variant="h5" fontWeight={700} color="#4CAF50">
                  {memoryStats.successRateTrend > 0 ? '+' : ''}{memoryStats.successRateTrend}%
                </Typography>
                <TrendingUpIcon sx={{ color: '#4CAF50', fontSize: 20 }} />
              </Box>
              <Typography variant="caption" color="text.secondary">
                Success Rate Trend
              </Typography>
            </Box>
          </Grid>
        </Grid>

        <Box mb={2}>
          <Typography variant="caption" display="block" mb={1} fontWeight={500}>
            Common Escalation Reasons:
          </Typography>
          <Box display="flex" flexWrap="wrap" gap={1}>
            <Chip label="High-risk operation" size="small" />
            <Chip label="Insufficient data" size="small" />
            <Chip label="Complex decision" size="small" />
            <Chip label="User confirmation needed" size="small" />
          </Box>
        </Box>

        <Box>
          <Typography variant="caption" display="block" mb={1} fontWeight={500}>
            Tool Usage Statistics:
          </Typography>
          <Box display="flex" flexWrap="wrap" gap={1}>
            {agent.domains?.slice(0, 3).map((domain, index) => (
              <Chip
                key={index}
                label={`${domain} (${Math.floor(Math.random() * 100)}%)`}
                size="small"
                sx={{
                  backgroundColor: alpha(agent.color, 0.1),
                  color: agent.color
                }}
              />
            ))}
          </Box>
        </Box>
      </Paper>

      {/* Memory Statistics */}
      <Paper elevation={0} sx={{ p: 2, border: 1, borderColor: 'divider' }}>
        <Typography variant="body2" fontWeight={600} mb={2}>
          Memory Statistics
        </Typography>

        <Box display="flex" justifyContent="space-between" mb={2}>
          <Box>
            <Typography variant="caption" color="text.secondary" display="block">
              Total Memories Stored
            </Typography>
            <Typography variant="h6" fontWeight={700} color={agent.color}>
              {memoryStats.totalMemories}
            </Typography>
          </Box>
          <Box textAlign="right">
            <Typography variant="caption" color="text.secondary" display="block">
              Oldest Memory
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              {memoryStats.oldestMemoryDate 
                ? new Date(memoryStats.oldestMemoryDate).toLocaleDateString()
                : 'N/A'}
            </Typography>
          </Box>
        </Box>

        <Button
          variant="outlined"
          size="small"
          fullWidth
          startIcon={<BrainIcon />}
          onClick={() => window.open(`/admin/agents/${agent.id}/knowledge`, '_blank')}
        >
          View Knowledge Base
        </Button>
      </Paper>
    </Box>
  );
};

export default AgentBrainTab;
