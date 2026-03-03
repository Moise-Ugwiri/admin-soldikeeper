/* eslint-disable */
/**
 * ⚙️ AGENT CONFIGURATION TAB
 * Configure agent settings and autonomy levels
 * Features:
 * - Autonomy level slider
 * - Decision boundaries
 * - Escalation policies
 * - Tool permissions
 * - LLM settings
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  FormControlLabel,
  Checkbox,
  RadioGroup,
  Radio,
  Typography,
  Divider,
  Paper,
  Alert,
  CircularProgress,
  Slider,
  alpha
} from '@mui/material';
import {
  Save as SaveIcon,
  Refresh as ResetIcon
} from '@mui/icons-material';
import axios from 'axios';
import AutonomySlider from './AutonomySlider';

const AgentConfigTab = ({ agent }) => {
  const token = localStorage.getItem('token');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  
  // Configuration state
  const [config, setConfig] = useState({
    autonomyLevel: agent.autonomy || 50,
    maxAutoExecuteValue: 100,
    maxActionsPerDay: 100,
    requireApprovalFor: ['high-risk', 'financial'],
    escalationPolicy: {
      escalateOnErrors: true,
      escalateOnHighRisk: true,
      escalateToApollo: true
    },
    llmSettings: {
      provider: 'claude-3.7',
      temperature: 0.7,
      maxTokens: 2000
    },
    enabledTools: []
  });

  // Load configuration on mount
  useEffect(() => {
    loadConfiguration();
  }, [agent.id]);

  const loadConfiguration = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL || 'https://soldikeeper-backend-production.up.railway.app/api'}/admin/agent-management/${agent.id}/config`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success && (response.data.data || response.data.config)) {
        const configData = response.data.data || response.data.config;
        setConfig(prev => ({
          ...prev,
          ...configData
        }));
      }
    } catch (err) {
      console.error('Failed to load agent configuration:', err);
      setError('Unable to load configuration. Using defaults.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccessMessage(null);

      await axios.put(
        `${process.env.REACT_APP_API_URL || 'https://soldikeeper-backend-production.up.railway.app/api'}/admin/agent-management/${agent.id}/config`,
        config,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setSuccessMessage('Configuration saved successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Failed to save configuration:', err);
      setError('Failed to save configuration. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    loadConfiguration();
    setError(null);
    setSuccessMessage(null);
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
          Loading configuration...
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

      {/* Autonomy Level */}
      <Paper elevation={0} sx={{ p: 2, mb: 3, border: 1, borderColor: 'divider' }}>
        <AutonomySlider
          value={config.autonomyLevel}
          onChange={(e, newValue) => setConfig({ ...config, autonomyLevel: newValue })}
          agent={agent}
        />
      </Paper>

      {/* Autonomy Mode Quick Select */}
      <Paper elevation={0} sx={{ p: 2, mb: 3, border: 1, borderColor: 'divider' }}>
        <Typography variant="body2" fontWeight={600} mb={2}>
          Autonomy Mode
        </Typography>
        <RadioGroup
          value={config.autonomyLevel}
          onChange={(e) => setConfig({ ...config, autonomyLevel: parseInt(e.target.value) })}
        >
          <FormControlLabel
            value={0}
            control={<Radio size="small" />}
            label={
              <Box>
                <Typography variant="body2" fontWeight={500}>
                  Manual (0%)
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Agent suggests but never acts without approval
                </Typography>
              </Box>
            }
          />
          <FormControlLabel
            value={50}
            control={<Radio size="small" />}
            label={
              <Box>
                <Typography variant="body2" fontWeight={500}>
                  Assisted (50%)
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Agent handles routine tasks, escalates important decisions
                </Typography>
              </Box>
            }
          />
          <FormControlLabel
            value={100}
            control={<Radio size="small" />}
            label={
              <Box>
                <Typography variant="body2" fontWeight={500}>
                  Fully Autonomous (100%)
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Agent operates independently within boundaries
                </Typography>
              </Box>
            }
          />
        </RadioGroup>
      </Paper>

      <Divider sx={{ my: 3 }} />

      {/* Decision Boundaries */}
      <Paper elevation={0} sx={{ p: 2, mb: 3, border: 1, borderColor: 'divider' }}>
        <Typography variant="body2" fontWeight={600} mb={2}>
          Decision Boundaries
        </Typography>
        
        <TextField
          fullWidth
          label="Max Auto-Execute Value ($)"
          type="number"
          value={config.maxAutoExecuteValue}
          onChange={(e) => setConfig({ ...config, maxAutoExecuteValue: parseInt(e.target.value) })}
          size="small"
          sx={{ mb: 2 }}
          helperText="Maximum transaction/action value the agent can process without approval"
        />

        <TextField
          fullWidth
          label="Max Actions Per Day"
          type="number"
          value={config.maxActionsPerDay}
          onChange={(e) => setConfig({ ...config, maxActionsPerDay: parseInt(e.target.value) })}
          size="small"
          helperText="Daily limit for autonomous actions"
        />
      </Paper>

      {/* Escalation Policy */}
      <Paper elevation={0} sx={{ p: 2, mb: 3, border: 1, borderColor: 'divider' }}>
        <Typography variant="body2" fontWeight={600} mb={2}>
          Escalation Policy
        </Typography>
        
        <FormControlLabel
          control={
            <Checkbox
              checked={config.escalationPolicy.escalateOnErrors}
              onChange={(e) => setConfig({
                ...config,
                escalationPolicy: {
                  ...config.escalationPolicy,
                  escalateOnErrors: e.target.checked
                }
              })}
              size="small"
            />
          }
          label={
            <Typography variant="body2">
              Escalate to Apollo on errors
            </Typography>
          }
        />

        <FormControlLabel
          control={
            <Checkbox
              checked={config.escalationPolicy.escalateOnHighRisk}
              onChange={(e) => setConfig({
                ...config,
                escalationPolicy: {
                  ...config.escalationPolicy,
                  escalateOnHighRisk: e.target.checked
                }
              })}
              size="small"
            />
          }
          label={
            <Typography variant="body2">
              Escalate high-risk decisions to human
            </Typography>
          }
        />

        <FormControlLabel
          control={
            <Checkbox
              checked={config.escalationPolicy.escalateToApollo}
              onChange={(e) => setConfig({
                ...config,
                escalationPolicy: {
                  ...config.escalationPolicy,
                  escalateToApollo: e.target.checked
                }
              })}
              size="small"
            />
          }
          label={
            <Typography variant="body2">
              Report to Apollo on completion
            </Typography>
          }
        />
      </Paper>

      <Divider sx={{ my: 3 }} />

      {/* LLM Settings */}
      <Paper elevation={0} sx={{ p: 2, mb: 3, border: 1, borderColor: 'divider' }}>
        <Typography variant="body2" fontWeight={600} mb={2}>
          LLM Configuration
        </Typography>

        <Typography variant="caption" display="block" mb={1} fontWeight={500}>
          Temperature: {config.llmSettings.temperature}
        </Typography>
        <Slider
          value={config.llmSettings.temperature}
          onChange={(e, val) => setConfig({
            ...config,
            llmSettings: { ...config.llmSettings, temperature: val }
          })}
          min={0}
          max={1}
          step={0.1}
          marks={[
            { value: 0, label: '0' },
            { value: 0.5, label: '0.5' },
            { value: 1, label: '1' }
          ]}
          sx={{ mb: 3 }}
        />

        <Typography variant="caption" display="block" mb={1} fontWeight={500}>
          Max Tokens: {config.llmSettings.maxTokens}
        </Typography>
        <Slider
          value={config.llmSettings.maxTokens}
          onChange={(e, val) => setConfig({
            ...config,
            llmSettings: { ...config.llmSettings, maxTokens: val }
          })}
          min={500}
          max={4000}
          step={100}
          marks={[
            { value: 500, label: '500' },
            { value: 2000, label: '2000' },
            { value: 4000, label: '4000' }
          ]}
        />
      </Paper>

      {/* Action Buttons */}
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          justifyContent: 'flex-end',
          pt: 2,
          borderTop: 1,
          borderColor: 'divider'
        }}
      >
        <Button
          variant="outlined"
          onClick={handleReset}
          disabled={saving}
          startIcon={<ResetIcon />}
        >
          Reset
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={saving}
          startIcon={saving ? <CircularProgress size={16} /> : <SaveIcon />}
          sx={{
            backgroundColor: agent.color,
            '&:hover': {
              backgroundColor: alpha(agent.color, 0.8)
            }
          }}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </Box>
    </Box>
  );
};

export default AgentConfigTab;
