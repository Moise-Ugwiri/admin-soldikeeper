/**
 * 🎚️ Agent Autonomy Slider (Enhanced)
 * W4.5 — Per-agent autonomy slider with color coding and API integration
 * - Green >70, Yellow 40-70, Red <40
 * - Disabled for Apollo (always 95%)
 * - Calls PATCH /api/admin/agent-management/:id/autonomy
 */

import React, { useState, useCallback } from 'react';
import {
  Box,
  Slider,
  Typography,
  alpha,
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material';
import {
  Lock as LockIcon
} from '@mui/icons-material';
import apiClient from '../../../services/api';

const AgentAutonomySlider = ({
  agentId,
  agentName,
  initialValue = 50,
  onUpdate,
  compact = false
}) => {
  const [value, setValue] = useState(initialValue);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const isApollo = agentId === '00-apollo' || agentId === '00-orchestrator';

  const getColor = (val) => {
    if (val >= 70) return '#4CAF50'; // Green
    if (val >= 40) return '#FF9800'; // Yellow/Orange
    return '#F44336'; // Red
  };

  const getLabel = (val) => {
    if (val >= 70) return 'Autonomous';
    if (val >= 40) return 'Semi-Auto';
    return 'Manual';
  };

  const color = getColor(value);

  const handleChange = useCallback((_, newValue) => {
    if (isApollo) return;
    setValue(newValue);
  }, [isApollo]);

  const handleCommit = useCallback(async (_, newValue) => {
    if (isApollo) return;
    setSaving(true);
    try {
      await apiClient.patch(`/admin/agent-management/${agentId}/autonomy`, {
        level: newValue
      });
      setFeedback({ severity: 'success', message: `${agentName || agentId} autonomy set to ${newValue}%` });
      if (onUpdate) onUpdate(agentId, newValue);
    } catch (err) {
      setFeedback({ severity: 'error', message: `Failed to update: ${err.message}` });
      setValue(initialValue); // revert
    } finally {
      setSaving(false);
    }
  }, [agentId, agentName, initialValue, isApollo, onUpdate]);

  if (compact) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
        <Slider
          value={isApollo ? 95 : value}
          onChange={handleChange}
          onChangeCommitted={handleCommit}
          disabled={isApollo || saving}
          min={0}
          max={100}
          size="small"
          sx={{
            flex: 1,
            color: isApollo ? '#FFD700' : color,
            '& .MuiSlider-thumb': {
              width: 14,
              height: 14
            }
          }}
        />
        <Box
          sx={{
            minWidth: 42,
            px: 0.75,
            py: 0.25,
            borderRadius: 1,
            bgcolor: alpha(isApollo ? '#FFD700' : color, 0.15),
            border: `1px solid ${alpha(isApollo ? '#FFD700' : color, 0.3)}`,
            textAlign: 'center'
          }}
        >
          <Typography variant="caption" sx={{ fontWeight: 700, color: isApollo ? '#FFD700' : color, fontSize: '0.7rem' }}>
            {isApollo ? '95%' : `${value}%`}
          </Typography>
        </Box>
        {isApollo && <LockIcon sx={{ fontSize: 14, color: '#FFD700', opacity: 0.7 }} />}
        {saving && <CircularProgress size={14} />}
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
        <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.85rem' }}>
          Autonomy Level
        </Typography>
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.75,
            px: 1.5,
            py: 0.5,
            borderRadius: 2,
            backgroundColor: alpha(isApollo ? '#FFD700' : color, 0.1),
            border: `1px solid ${alpha(isApollo ? '#FFD700' : color, 0.3)}`
          }}
        >
          <Typography
            variant="h6"
            sx={{ fontSize: '1.1rem', fontWeight: 700, color: isApollo ? '#FFD700' : color }}
          >
            {isApollo ? '95%' : `${value}%`}
          </Typography>
          <Typography variant="caption" sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>
            {isApollo ? 'Locked' : getLabel(value)}
          </Typography>
          {isApollo && <LockIcon sx={{ fontSize: 14, color: '#FFD700' }} />}
          {saving && <CircularProgress size={14} sx={{ ml: 0.5 }} />}
        </Box>
      </Box>

      <Slider
        value={isApollo ? 95 : value}
        onChange={handleChange}
        onChangeCommitted={handleCommit}
        disabled={isApollo || saving}
        min={0}
        max={100}
        step={5}
        marks={[
          { value: 0, label: '0%' },
          { value: 50, label: '50%' },
          { value: 100, label: '100%' }
        ]}
        sx={{
          color: isApollo ? '#FFD700' : color,
          '& .MuiSlider-track': {
            background: isApollo
              ? 'linear-gradient(90deg, #FFD700, #FFA000)'
              : undefined
          },
          '& .MuiSlider-markLabel': {
            fontSize: '0.7rem'
          }
        }}
      />

      {/* Feedback snackbar */}
      <Snackbar
        open={!!feedback}
        autoHideDuration={3000}
        onClose={() => setFeedback(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        {feedback && (
          <Alert severity={feedback.severity} onClose={() => setFeedback(null)} sx={{ width: '100%' }}>
            {feedback.message}
          </Alert>
        )}
      </Snackbar>
    </Box>
  );
};

export default AgentAutonomySlider;
