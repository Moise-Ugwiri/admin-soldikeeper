import React from 'react';
import {
  Card,
  CardContent,
  Box,
  Typography,
  LinearProgress,
  Chip,
  Tooltip,
  alpha
} from '@mui/material';
import {
  Circle as StatusDot,
  TrendingUp as TrendingIcon
} from '@mui/icons-material';

const AgentCard = ({ agent, onClick, compact = false }) => {
  const isApollo = agent.id === '00-apollo';
  
  const getStatusColor = () => {
    switch (agent.status) {
      case 'busy': return '#FF9800'; // Orange
      case 'idle': return '#4CAF50'; // Green
      case 'offline': return '#F44336'; // Red
      default: return '#9E9E9E'; // Grey
    }
  };

  const getLoadColor = () => {
    if (agent.load >= 80) return '#F44336'; // Red
    if (agent.load >= 50) return '#FF9800'; // Orange
    return '#4CAF50'; // Green
  };

  return (
    <Card
      sx={{
        height: '100%',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        borderLeft: `4px solid ${agent.color}`,
        backgroundColor: isApollo ? alpha(agent.color, 0.05) : 'background.paper',
        position: 'relative',
        overflow: 'visible',
        '&:hover': onClick ? {
          transform: 'translateY(-4px)',
          boxShadow: `0 12px 24px ${alpha(agent.color, 0.3)}`,
          '& .agent-load-bar': {
            transform: 'scaleX(1.02)'
          }
        } : {},
        ...(isApollo && {
          boxShadow: `0 4px 20px ${alpha(agent.color, 0.4)}`,
          border: `2px solid ${agent.color}`
        })
      }}
      onClick={onClick}
    >
      {isApollo && (
        <Box
          sx={{
            position: 'absolute',
            top: -8,
            right: -8,
            width: 24,
            height: 24,
            borderRadius: '50%',
            backgroundColor: agent.color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 2,
            animation: 'pulse 2s infinite'
          }}
        >
          <Typography variant="caption" sx={{ fontSize: '0.65rem', fontWeight: 700 }}>
            ⭐
          </Typography>
        </Box>
      )}

      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        {/* Header */}
        <Box display="flex" alignItems="flex-start" justifyContent="space-between" mb={1.5}>
          <Box display="flex" alignItems="center" gap={1} flex={1}>
            <Typography
              variant="h3"
              sx={{
                fontSize: compact ? '1.5rem' : '2rem',
                lineHeight: 1,
                opacity: 0.9
              }}
            >
              {agent.emoji}
            </Typography>
            <Box>
              <Typography
                variant="caption"
                sx={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  color: agent.color,
                  letterSpacing: '0.5px'
                }}
              >
                {agent.number}
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  fontSize: compact ? '0.95rem' : '1.1rem',
                  fontWeight: 700,
                  lineHeight: 1.2,
                  color: isApollo ? agent.color : 'text.primary'
                }}
              >
                {agent.name.toUpperCase()}
              </Typography>
            </Box>
          </Box>
          
          <Tooltip title={agent.status.toUpperCase()}>
            <StatusDot
              sx={{
                fontSize: 12,
                color: getStatusColor(),
                animation: agent.status === 'busy' ? 'pulse 2s infinite' : 'none'
              }}
            />
          </Tooltip>
        </Box>

        {/* Role */}
        <Typography
          variant="caption"
          sx={{
            display: 'block',
            fontSize: '0.7rem',
            color: 'text.secondary',
            mb: 1.5,
            lineHeight: 1.3,
            minHeight: compact ? 'auto' : '2.6em'
          }}
        >
          {agent.role}
        </Typography>

        {/* Current Task */}
        {agent.currentTask ? (
          <Tooltip title={agent.currentTask}>
            <Box
              sx={{
                backgroundColor: alpha(agent.color, 0.1),
                borderRadius: 1,
                p: 1,
                mb: 1.5,
                minHeight: compact ? 'auto' : '3em'
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  fontSize: '0.75rem',
                  color: 'text.primary',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  lineHeight: 1.3
                }}
              >
                📌 {agent.currentTask}
              </Typography>
            </Box>
          </Tooltip>
        ) : (
          <Box
            sx={{
              backgroundColor: 'rgba(0,0,0,0.02)',
              borderRadius: 1,
              p: 1,
              mb: 1.5,
              minHeight: compact ? 'auto' : '3em',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <Typography
              variant="caption"
              sx={{
                fontSize: '0.75rem',
                color: 'text.disabled',
                fontStyle: 'italic'
              }}
            >
              Standing by...
            </Typography>
          </Box>
        )}

        {/* Load Progress */}
        <Box mb={1}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
            <Typography variant="caption" sx={{ fontSize: '0.7rem', fontWeight: 600 }}>
              Load
            </Typography>
            <Chip
              label={`${agent.load}%`}
              size="small"
              sx={{
                height: 18,
                fontSize: '0.7rem',
                fontWeight: 700,
                backgroundColor: getLoadColor(),
                color: 'white'
              }}
            />
          </Box>
          <LinearProgress
            variant="determinate"
            value={agent.load}
            className="agent-load-bar"
            sx={{
              height: 6,
              borderRadius: 3,
              backgroundColor: alpha(agent.color, 0.1),
              transition: 'transform 0.3s ease',
              '& .MuiLinearProgress-bar': {
                backgroundColor: agent.color,
                borderRadius: 3
              }
            }}
          />
        </Box>

        {/* Stats Footer */}
        {!compact && (
          <Box display="flex" justifyContent="space-between" alignItems="center" mt={1.5} pt={1.5} sx={{ borderTop: 1, borderColor: 'divider' }}>
            <Tooltip title="Tasks Completed">
              <Box display="flex" alignItems="center" gap={0.5}>
                <Typography variant="caption" sx={{ fontSize: '0.65rem', color: 'text.secondary' }}>
                  ✅
                </Typography>
                <Typography variant="caption" sx={{ fontSize: '0.75rem', fontWeight: 600 }}>
                  {agent.tasksCompleted.toLocaleString()}
                </Typography>
              </Box>
            </Tooltip>
            
            <Tooltip title="Avg Response Time">
              <Box display="flex" alignItems="center" gap={0.5}>
                <TrendingIcon sx={{ fontSize: 12, color: 'text.secondary' }} />
                <Typography variant="caption" sx={{ fontSize: '0.75rem', fontWeight: 600 }}>
                  {agent.avgResponseTime}s
                </Typography>
              </Box>
            </Tooltip>
            
            <Tooltip title={`Autonomy Level: ${agent.autonomy}%`}>
              <Chip
                label={`${agent.autonomy}%`}
                size="small"
                variant="outlined"
                sx={{
                  height: 18,
                  fontSize: '0.65rem',
                  borderColor: agent.color,
                  color: agent.color,
                  fontWeight: 700
                }}
              />
            </Tooltip>
          </Box>
        )}
      </CardContent>

      {/* Pulse animation for Apollo and busy agents */}
      <style>
        {`
          @keyframes pulse {
            0%, 100% {
              opacity: 1;
            }
            50% {
              opacity: 0.6;
            }
          }
        `}
      </style>
    </Card>
  );
};

export default AgentCard;
