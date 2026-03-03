import React from 'react';
import { Box, Paper, Typography, Grid, Chip, LinearProgress } from '@mui/material';
import { 
  CheckCircle as CheckCircleIcon, 
  Speed as SpeedIcon,
  Warning as WarningIcon 
} from '@mui/icons-material';
import { getSystemStatus } from '../../../data/agentRegistry';

/**
 * MissionControlHeader - System status banner showing real-time health metrics
 */
const MissionControlHeader = () => {
  const systemStatus = getSystemStatus();
  
  // Calculate system load color
  const getLoadColor = (load) => {
    if (load < 50) return '#4CAF50'; // Green
    if (load < 80) return '#FF9800'; // Orange
    return '#F44336'; // Red
  };

  const loadColor = getLoadColor(systemStatus.avgLoad);

  return (
    <Paper 
      elevation={0} 
      sx={{ 
        mb: 3, 
        p: 3, 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        borderRadius: 2
      }}
    >
      {/* Title Row */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
            🎯 MISSION CONTROL
          </Typography>
          <Chip 
            icon={<CheckCircleIcon />}
            label="OPERATIONAL" 
            size="small" 
            sx={{ 
              bgcolor: 'rgba(76, 175, 80, 0.2)', 
              color: '#4CAF50',
              fontWeight: 600,
              borderColor: '#4CAF50',
              border: '1px solid'
            }} 
          />
        </Box>
        <Typography variant="body2" sx={{ opacity: 0.9 }}>
          Last Updated: {new Date().toLocaleTimeString()}
        </Typography>
      </Box>

      {/* Stats Row */}
      <Grid container spacing={3}>
        {/* Active Agents */}
        <Grid item xs={12} sm={6} md={3}>
          <Box>
            <Typography variant="body2" sx={{ opacity: 0.8, mb: 0.5 }}>
              Active Agents
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              {systemStatus.activeAgents} / 12
            </Typography>
          </Box>
        </Grid>

        {/* System Load */}
        <Grid item xs={12} sm={6} md={3}>
          <Box>
            <Typography variant="body2" sx={{ opacity: 0.8, mb: 0.5 }}>
              System Load
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SpeedIcon sx={{ fontSize: 32, color: loadColor }} />
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {systemStatus.avgLoad}%
              </Typography>
            </Box>
          </Box>
        </Grid>

        {/* Tasks Today */}
        <Grid item xs={12} sm={6} md={3}>
          <Box>
            <Typography variant="body2" sx={{ opacity: 0.8, mb: 0.5 }}>
              Tasks Completed Today
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              {systemStatus.totalTasks.toLocaleString()}
            </Typography>
          </Box>
        </Grid>

        {/* Avg Response Time */}
        <Grid item xs={12} sm={6} md={3}>
          <Box>
            <Typography variant="body2" sx={{ opacity: 0.8, mb: 0.5 }}>
              Avg Response Time
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              {systemStatus.avgResponseTime}s
            </Typography>
          </Box>
        </Grid>
      </Grid>

      {/* Load Progress Bar */}
      <Box sx={{ mt: 2 }}>
        <LinearProgress 
          variant="determinate" 
          value={systemStatus.avgLoad} 
          sx={{ 
            height: 8, 
            borderRadius: 4,
            bgcolor: 'rgba(255, 255, 255, 0.2)',
            '& .MuiLinearProgress-bar': {
              bgcolor: loadColor,
              borderRadius: 4
            }
          }} 
        />
      </Box>

      {/* Warning Banner (if needed) */}
      {systemStatus.avgLoad > 80 && (
        <Box 
          sx={{ 
            mt: 2, 
            p: 1.5, 
            bgcolor: 'rgba(244, 67, 54, 0.2)', 
            borderRadius: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
        >
          <WarningIcon sx={{ color: '#F44336' }} />
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            High system load detected. Consider scaling or optimizing tasks.
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default MissionControlHeader;
