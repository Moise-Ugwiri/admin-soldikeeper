/**
 * 🤖 Enhanced Agent Status Card
 * W4.5 — Real-time agent card with:
 *   - Name, role, status with color indicator
 *   - Autonomy level percentage badge + inline slider
 *   - Last heartbeat (relative time)
 *   - Tasks completed today / success rate
 *   - Trend indicator (↑ ↓ →)
 */

import React from 'react';
import {
  Card,
  CardContent,
  Box,
  Typography,
  Chip,
  Tooltip,
  alpha,
  Divider
} from '@mui/material';
import {
  Circle as StatusDot,
  TrendingUp as TrendUpIcon,
  TrendingDown as TrendDownIcon,
  TrendingFlat as TrendFlatIcon,
  PlayArrow as TriggerIcon
} from '@mui/icons-material';
import AgentAutonomySlider from './AgentAutonomySlider';

const EnhancedAgentCard = ({ agent, registryAgent, onClick, onAutonomyUpdate, compact = false }) => {
  // Merge live fleet data with static registry data
  const isApollo = (agent.id || '').startsWith('00-');

  // Use registry data for visual properties, live data for metrics
  const displayName = registryAgent?.name || agent.name || agent.id;
  const emoji = registryAgent?.emoji || '🤖';
  const color = registryAgent?.color || '#667eea';
  const role = registryAgent?.role || agent.role || '';
  const number = registryAgent?.number || agent.id?.split('-')[0] || '';

  // Live data
  const status = agent.status || 'idle';
  const currentTask = agent.currentTask || null;
  const autonomyLevel = agent.autonomyLevel ?? registryAgent?.autonomy ?? 50;
  const lastHeartbeat = agent.lastHeartbeat;
  const tasksToday = agent.tasksToday || 0;
  const successRate = agent.successRate ?? 100;
  const trend = agent.trend || 'stable';

  const getStatusColor = () => {
    switch (status) {
      case 'busy':
      case 'working':
        return '#FF9800';
      case 'idle':
      case 'active':
        return '#4CAF50';
      case 'error':
        return '#F44336';
      case 'offline':
      case 'maintenance':
        return '#9E9E9E';
      default:
        return '#9E9E9E';
    }
  };

  const getStatusLabel = () => {
    switch (status) {
      case 'busy':
      case 'working':
        return 'BUSY';
      case 'idle':
        return 'IDLE';
      case 'active':
        return 'ACTIVE';
      case 'error':
        return 'ERROR';
      case 'offline':
        return 'OFFLINE';
      default:
        return status.toUpperCase();
    }
  };

  const formatHeartbeat = (iso) => {
    if (!iso) return 'No data';
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now - d;
    if (diffMs < 60000) return 'Just now';
    if (diffMs < 3600000) return `${Math.floor(diffMs / 60000)} min ago`;
    if (diffMs < 86400000) return `${Math.floor(diffMs / 3600000)}h ago`;
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  const TrendIcon = trend === 'up' ? TrendUpIcon : trend === 'down' ? TrendDownIcon : TrendFlatIcon;
  const trendColor = trend === 'up' ? '#4CAF50' : trend === 'down' ? '#F44336' : '#FF9800';

  return (
    <Card
      sx={{
        height: '100%',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        borderLeft: `4px solid ${color}`,
        backgroundColor: isApollo ? alpha(color, 0.05) : 'background.paper',
        position: 'relative',
        overflow: 'visible',
        '&:hover': onClick ? {
          transform: 'translateY(-4px)',
          boxShadow: `0 12px 24px ${alpha(color, 0.3)}`
        } : {},
        ...(isApollo && {
          boxShadow: `0 4px 20px ${alpha(color, 0.4)}`,
          border: `2px solid ${color}`
        })
      }}
      onClick={onClick}
    >
      {/* Apollo crown */}
      {isApollo && (
        <Box
          sx={{
            position: 'absolute',
            top: -8,
            right: -8,
            width: 24,
            height: 24,
            borderRadius: '50%',
            backgroundColor: color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 2,
            animation: 'pulse 2s infinite'
          }}
        >
          <Typography variant="caption" sx={{ fontSize: '0.65rem', fontWeight: 700 }}>⭐</Typography>
        </Box>
      )}

      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        {/* Header: emoji, name, number, status dot */}
        <Box display="flex" alignItems="flex-start" justifyContent="space-between" mb={1}>
          <Box display="flex" alignItems="center" gap={1} flex={1}>
            <Typography variant="h3" sx={{ fontSize: compact ? '1.5rem' : '2rem', lineHeight: 1, opacity: 0.9 }}>
              {emoji}
            </Typography>
            <Box>
              <Typography variant="caption" sx={{ fontSize: '0.65rem', fontWeight: 700, color, letterSpacing: '0.5px' }}>
                {number}
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  fontSize: compact ? '0.95rem' : '1.05rem',
                  fontWeight: 700,
                  lineHeight: 1.2,
                  color: isApollo ? color : 'text.primary'
                }}
              >
                {displayName.toUpperCase()}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5 }}>
            <Tooltip title={getStatusLabel()}>
              <Chip
                icon={<StatusDot sx={{ fontSize: '10px !important', color: `${getStatusColor()} !important` }} />}
                label={getStatusLabel()}
                size="small"
                sx={{
                  height: 22,
                  fontSize: '0.6rem',
                  fontWeight: 700,
                  bgcolor: alpha(getStatusColor(), 0.1),
                  color: getStatusColor(),
                  animation: status === 'busy' || status === 'working' ? 'pulse 2s infinite' : 'none'
                }}
              />
            </Tooltip>
          </Box>
        </Box>

        {/* Role */}
        <Typography
          variant="caption"
          sx={{
            display: 'block',
            fontSize: '0.7rem',
            color: 'text.secondary',
            mb: 1,
            lineHeight: 1.3,
            minHeight: compact ? 'auto' : '1.3em'
          }}
        >
          {role}
        </Typography>

        {/* Current Task */}
        {currentTask ? (
          <Tooltip title={currentTask}>
            <Box
              sx={{
                backgroundColor: alpha(color, 0.1),
                borderRadius: 1,
                p: 0.75,
                mb: 1.5
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  fontSize: '0.72rem',
                  color: 'text.primary',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  lineHeight: 1.3
                }}
              >
                📌 {currentTask}
              </Typography>
            </Box>
          </Tooltip>
        ) : (
          <Box
            sx={{
              backgroundColor: 'rgba(0,0,0,0.02)',
              borderRadius: 1,
              p: 0.75,
              mb: 1.5
            }}
          >
            <Typography variant="caption" sx={{ fontSize: '0.72rem', color: 'text.disabled', fontStyle: 'italic' }}>
              Standing by...
            </Typography>
          </Box>
        )}

        {/* Autonomy Slider */}
        <Box sx={{ mb: 1 }} onClick={(e) => e.stopPropagation()}>
          <AgentAutonomySlider
            agentId={agent.id}
            agentName={displayName}
            initialValue={autonomyLevel}
            onUpdate={onAutonomyUpdate}
            compact
          />
        </Box>

        <Divider sx={{ my: 1 }} />

        {/* Stats Footer */}
        <Box display="flex" justifyContent="space-between" alignItems="center">
          {/* Last heartbeat */}
          <Tooltip title={`Last heartbeat: ${lastHeartbeat ? new Date(lastHeartbeat).toLocaleString() : 'N/A'}`}>
            <Typography variant="caption" sx={{ fontSize: '0.65rem', color: 'text.secondary' }}>
              💓 {formatHeartbeat(lastHeartbeat)}
            </Typography>
          </Tooltip>

          {/* Tasks today */}
          <Tooltip title={`Tasks today: ${tasksToday}, Success rate: ${successRate}%`}>
            <Box display="flex" alignItems="center" gap={0.5}>
              <Typography variant="caption" sx={{ fontSize: '0.72rem', fontWeight: 600 }}>
                ✅ {tasksToday}
              </Typography>
              <Chip
                label={`${successRate}%`}
                size="small"
                sx={{
                  height: 18,
                  fontSize: '0.6rem',
                  fontWeight: 700,
                  bgcolor: alpha(successRate >= 80 ? '#4CAF50' : successRate >= 50 ? '#FF9800' : '#F44336', 0.15),
                  color: successRate >= 80 ? '#4CAF50' : successRate >= 50 ? '#FF9800' : '#F44336'
                }}
              />
            </Box>
          </Tooltip>

          {/* Trend */}
          <Tooltip title={`Trend: ${trend === 'up' ? 'Improving' : trend === 'down' ? 'Declining' : 'Stable'}`}>
            <TrendIcon sx={{ fontSize: 16, color: trendColor }} />
          </Tooltip>
        </Box>
      </CardContent>

      <style>
        {`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.6; }
          }
        `}
      </style>
    </Card>
  );
};

export default EnhancedAgentCard;
