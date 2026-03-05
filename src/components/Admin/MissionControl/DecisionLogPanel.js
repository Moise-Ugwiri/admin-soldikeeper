/**
 * 📋 Decision Log Panel
 * W4.5 — Shows recent decisions for a selected agent
 * - Table: timestamp, task type, decision, confidence, outcome
 * - Color coded: green success, red failure, yellow escalated
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Skeleton,
  IconButton,
  Tooltip,
  alpha,
  Alert
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Close as CloseIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Warning as EscalatedIcon,
  PlayArrow as StartedIcon,
  HourglassTop as InProgressIcon
} from '@mui/icons-material';
import apiClient from '../../../services/api';

const outcomeConfig = {
  completed: { icon: SuccessIcon, color: '#4CAF50', label: 'Success' },
  failed: { icon: ErrorIcon, color: '#F44336', label: 'Failed' },
  escalated: { icon: EscalatedIcon, color: '#FF9800', label: 'Escalated' },
  started: { icon: StartedIcon, color: '#2196F3', label: 'Started' },
  in_progress: { icon: InProgressIcon, color: '#03A9F4', label: 'In Progress' },
  cancelled: { icon: CloseIcon, color: '#9E9E9E', label: 'Cancelled' }
};

const DecisionLogPanel = ({ agent, onClose }) => {
  const [decisions, setDecisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDecisions = useCallback(async () => {
    if (!agent) return;
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get(`/admin/agent-management/${agent.id}/decisions?limit=30`);
      const data = res.data?.data?.decisions || res.data?.decisions || [];
      setDecisions(data);
    } catch (err) {
      console.error('Failed to fetch decisions:', err);
      setError(err.message || 'Failed to load decisions');
      setDecisions([]);
    } finally {
      setLoading(false);
    }
  }, [agent]);

  useEffect(() => {
    fetchDecisions();
  }, [fetchDecisions]);

  const formatTime = (iso) => {
    if (!iso) return '—';
    const d = new Date(iso);
    const now = new Date();
    const diff = now - d;
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  const getOutcome = (status) => {
    return outcomeConfig[status] || outcomeConfig.started;
  };

  if (!agent) return null;

  return (
    <Paper
      elevation={2}
      sx={{
        mt: 2,
        borderRadius: 2,
        overflow: 'hidden',
        border: `1px solid ${alpha(agent.color || '#667eea', 0.3)}`
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2,
          py: 1.5,
          bgcolor: alpha(agent.color || '#667eea', 0.08),
          borderBottom: `1px solid ${alpha(agent.color || '#667eea', 0.15)}`
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h3" sx={{ fontSize: '1.5rem', lineHeight: 1 }}>
            {agent.emoji || '🤖'}
          </Typography>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
              {agent.name?.toUpperCase() || agent.id} — Decision Log
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Recent agent decisions and outcomes
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title="Refresh">
            <IconButton size="small" onClick={fetchDecisions} disabled={loading}>
              <RefreshIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
          {onClose && (
            <Tooltip title="Close">
              <IconButton size="small" onClick={onClose}>
                <CloseIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Box>

      {/* Content */}
      <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
        {loading ? (
          <Box sx={{ p: 2 }}>
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} variant="rectangular" height={36} sx={{ mb: 1, borderRadius: 1 }} />
            ))}
          </Box>
        ) : error ? (
          <Alert severity="info" sx={{ m: 2 }}>
            {error === 'Failed to load decisions'
              ? 'No decision data available yet. Decisions will appear as the agent executes tasks.'
              : error}
          </Alert>
        ) : decisions.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              No decisions recorded yet for {agent.name || agent.id}.
            </Typography>
            <Typography variant="caption" color="text.disabled">
              Decisions will appear as the agent executes tasks.
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>Time</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>Task Type</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>Decision</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }} align="center">Confidence</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>Outcome</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {decisions.map((d, idx) => {
                  const outcome = getOutcome(d.outcome);
                  const OutcomeIcon = outcome.icon;
                  return (
                    <TableRow
                      key={d.id || idx}
                      sx={{
                        '&:hover': { bgcolor: alpha(agent.color || '#667eea', 0.04) },
                        '&:last-child td': { borderBottom: 0 }
                      }}
                    >
                      <TableCell sx={{ fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                        {formatTime(d.timestamp)}
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.75rem' }}>
                        <Chip
                          label={d.taskType || '—'}
                          size="small"
                          sx={{ height: 22, fontSize: '0.7rem', fontWeight: 600 }}
                        />
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.75rem', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {d.decision || '—'}
                      </TableCell>
                      <TableCell align="center">
                        {d.confidence != null ? (
                          <Chip
                            label={`${d.confidence}%`}
                            size="small"
                            sx={{
                              height: 20,
                              fontSize: '0.65rem',
                              fontWeight: 700,
                              bgcolor: alpha(
                                d.confidence >= 70 ? '#4CAF50' : d.confidence >= 40 ? '#FF9800' : '#F44336',
                                0.15
                              ),
                              color: d.confidence >= 70 ? '#4CAF50' : d.confidence >= 40 ? '#FF9800' : '#F44336'
                            }}
                          />
                        ) : (
                          <Typography variant="caption" color="text.disabled">—</Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={<OutcomeIcon sx={{ fontSize: '14px !important' }} />}
                          label={outcome.label}
                          size="small"
                          sx={{
                            height: 22,
                            fontSize: '0.65rem',
                            fontWeight: 600,
                            bgcolor: alpha(outcome.color, 0.12),
                            color: outcome.color,
                            '& .MuiChip-icon': { color: outcome.color }
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
    </Paper>
  );
};

export default DecisionLogPanel;
