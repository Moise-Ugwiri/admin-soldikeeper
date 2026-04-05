/* eslint-disable */
/**
 * 🚀 AGENT CONTROL PANEL (MissionControl)
 * W4.5 — Enhanced admin Agents tab with real-time data and interactive controls
 *
 * Features:
 *   1. Fleet summary header — total agents, active, tasks today, avg success rate
 *   2. Real-time agent status cards — per-agent metrics from /fleet-status API
 *   3. Autonomy slider per agent — calls PATCH /api/admin/agent-management/:id/autonomy
 *   4. Decision log panel — click agent to see recent decisions
 *   5. Auto-refresh every 30s with manual refresh button
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  Grid,
  Typography,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  Chip,
  Fade
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  AutorenewRounded as AutoRefreshIcon
} from '@mui/icons-material';
import apiClient from '../../../services/api';
import { AGENTS as STATIC_AGENTS } from '../../../data/agentRegistry';

// Sub-components
import FleetSummaryHeader from './FleetSummaryHeader';
import EnhancedAgentCard from './EnhancedAgentCard';
import DecisionLogPanel from './DecisionLogPanel';

const REFRESH_INTERVAL = 30000; // 30 seconds

/**
 * Main Mission Control / Agent Control Panel component
 * This is the default export used by AdminDashboard lazy loading
 */
const AgentControlPanel = () => {
  // ── State ──────────────────────────────────────────────────────────
  const [fleetData, setFleetData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(null);
  const intervalRef = useRef(null);

  // ── Data fetching ──────────────────────────────────────────────────
  const fetchFleetStatus = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    setError(null);

    try {
      const res = await apiClient.get('/admin/agent-management/fleet-status');
      const data = res.data?.data || res.data || {};
      setFleetData(data);
      setLastRefresh(new Date());
    } catch (err) {
      console.error('Fleet status fetch error:', err);
      // Graceful fallback — use static data if API isn't available
      if (!fleetData) {
        setFleetData({
          agents: STATIC_AGENTS.map(a => ({
            id: a.id,
            name: a.name,
            role: a.role,
            status: a.status || 'idle',
            currentTask: a.currentTask || null,
            autonomyLevel: a.autonomy || 50,
            lastHeartbeat: a.lastActive || null,
            load: a.load || 0,
            tasksToday: 0,
            successRate: 100,
            trend: 'stable',
            stats: {}
          })),
          summary: {
            totalAgents: 12,
            activeNow: STATIC_AGENTS.filter(a => a.status === 'busy' || a.status === 'idle').length,
            tasksToday: 0,
            avgSuccessRate: 0,
            lastAssessment: new Date().toISOString()
          }
        });
      }
      if (!silent) setError('Using cached data — live fleet API unavailable');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [fleetData]);

  // ── Auto-refresh ──────────────────────────────────────────────────
  useEffect(() => {
    fetchFleetStatus();

    intervalRef.current = setInterval(() => {
      fetchFleetStatus(true); // silent refresh
    }, REFRESH_INTERVAL);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Handlers ──────────────────────────────────────────────────────
  const handleManualRefresh = () => {
    fetchFleetStatus(true);
  };

  const handleAgentClick = (agent) => {
    // Find matching registry agent for visual data
    const regAgent = STATIC_AGENTS.find(a => a.id === agent.id);
    setSelectedAgent(selectedAgent?.id === agent.id ? null : {
      ...agent,
      ...(regAgent ? { emoji: regAgent.emoji, color: regAgent.color, name: regAgent.name } : {})
    });
  };

  const handleAutonomyUpdate = (agentId, newLevel) => {
    // Optimistically update local state
    if (fleetData?.agents) {
      setFleetData(prev => ({
        ...prev,
        agents: prev.agents.map(a =>
          a.id === agentId ? { ...a, autonomyLevel: newLevel } : a
        )
      }));
    }
  };

  // ── Merge fleet data with static registry ─────────────────────────
  const mergedAgents = (fleetData?.agents || []).map(liveAgent => {
    const regAgent = STATIC_AGENTS.find(a => a.id === liveAgent.id);
    return {
      // Pull all display fields from registry first so color/emoji/etc are always defined
      ...(regAgent || {}),
      // Then overlay live data (status, load, currentTask, etc.)
      ...liveAgent,
      _registry: regAgent
    };
  });

  // If we have fewer live agents than registry, add missing ones from static data
  const liveIds = new Set(mergedAgents.map(a => a.id));
  const missingAgents = STATIC_AGENTS
    .filter(a => !liveIds.has(a.id))
    .map(a => ({
      // Spread the full registry agent so color, emoji, personality, mood, etc. are all present
      ...a,
      status: a.status || 'idle',
      currentTask: a.currentTask || null,
      autonomyLevel: a.autonomy || 50,
      lastHeartbeat: a.lastActive || null,
      load: a.load || 0,
      tasksToday: 0,
      successRate: 100,
      trend: 'stable',
      stats: {},
      _registry: a
    }));

  const allAgents = [...mergedAgents, ...missingAgents];

  // ── Render ─────────────────────────────────────────────────────────
  return (
    <Box sx={{ width: '100%' }}>
      {/* Fleet Summary Header */}
      <FleetSummaryHeader
        summary={fleetData?.summary}
        loading={loading && !fleetData}
      />

      {/* Toolbar */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, px: 0.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.1rem' }}>
            Agent Fleet
          </Typography>
          <Chip
            label={`${allAgents.length} agents`}
            size="small"
            sx={{ height: 22, fontSize: '0.7rem', fontWeight: 600 }}
          />
          {lastRefresh && (
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
              Updated {new Date(lastRefresh).toLocaleTimeString()}
            </Typography>
          )}
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {refreshing && <CircularProgress size={16} />}
          <Tooltip title="Refresh fleet status">
            <IconButton size="small" onClick={handleManualRefresh} disabled={refreshing}>
              <RefreshIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Auto-refreshes every 30s">
            <AutoRefreshIcon sx={{ fontSize: 16, color: 'text.disabled' }} />
          </Tooltip>
        </Box>
      </Box>

      {/* Error banner (non-blocking) */}
      {error && (
        <Fade in>
          <Alert severity="info" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        </Fade>
      )}

      {/* Loading skeleton */}
      {loading && !fleetData && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress size={48} />
        </Box>
      )}

      {/* Agent Grid */}
      {allAgents.length > 0 && (
        <Grid container spacing={2}>
          {allAgents.map((agent) => (
            <Grid
              item
              xs={12}
              sm={6}
              md={4}
              lg={3}
              key={agent.id}
            >
              <EnhancedAgentCard
                agent={agent}
                registryAgent={agent._registry}
                onClick={() => handleAgentClick(agent)}
                onAutonomyUpdate={handleAutonomyUpdate}
                compact={false}
              />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Decision Log Panel (shown when agent is selected) */}
      {selectedAgent && (
        <Fade in>
          <Box>
            <DecisionLogPanel
              agent={selectedAgent}
              onClose={() => setSelectedAgent(null)}
            />
          </Box>
        </Fade>
      )}
    </Box>
  );
};

// Also export sub-components for external use
export { default as AgentCard } from './AgentCard';
export { default as AgentGrid } from './AgentGrid';
export { default as MissionControlHeader } from './MissionControlHeader';
export { default as FleetSummaryHeader } from './FleetSummaryHeader';
export { default as EnhancedAgentCard } from './EnhancedAgentCard';
export { default as AgentAutonomySlider } from './AgentAutonomySlider';
export { default as DecisionLogPanel } from './DecisionLogPanel';

export default AgentControlPanel;
