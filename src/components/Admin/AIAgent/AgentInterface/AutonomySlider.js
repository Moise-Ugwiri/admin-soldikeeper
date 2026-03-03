/**
 * 🎚️ AUTONOMY SLIDER COMPONENT
 * Reusable slider for agent autonomy levels
 * - Color-coded: red (0%) → yellow (50%) → green (100%)
 * - Labels at 0%, 50%, 100%
 * - Visual feedback for autonomy mode
 */

import React from 'react';
import { Box, Slider, Typography, alpha } from '@mui/material';

const AutonomySlider = ({ value, onChange, agent, disabled = false }) => {
  const getAutonomyColor = (val) => {
    if (val === 0) return '#F44336'; // Red - Manual
    if (val <= 30) return '#FF9800'; // Orange - Low
    if (val <= 70) return '#FFB300'; // Amber - Medium
    return '#4CAF50'; // Green - High
  };

  const getAutonomyLabel = (val) => {
    if (val === 0) return 'Manual';
    if (val <= 30) return 'Assisted';
    if (val <= 70) return 'Semi-Autonomous';
    return 'Fully Autonomous';
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="body2" fontWeight={600}>
          Autonomy Level
        </Typography>
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 1,
            px: 1.5,
            py: 0.5,
            borderRadius: 2,
            backgroundColor: alpha(getAutonomyColor(value), 0.1),
            border: `1px solid ${alpha(getAutonomyColor(value), 0.3)}`
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontSize: '1.2rem',
              fontWeight: 700,
              color: getAutonomyColor(value)
            }}
          >
            {value}%
          </Typography>
          <Typography
            variant="caption"
            sx={{
              fontSize: '0.75rem',
              color: 'text.secondary',
              fontWeight: 500
            }}
          >
            {getAutonomyLabel(value)}
          </Typography>
        </Box>
      </Box>

      <Slider
        value={value}
        onChange={onChange}
        disabled={disabled}
        min={0}
        max={100}
        step={10}
        marks={[
          { value: 0, label: '0%' },
          { value: 50, label: '50%' },
          { value: 100, label: '100%' }
        ]}
        sx={{
          color: getAutonomyColor(value),
          height: 8,
          '& .MuiSlider-thumb': {
            width: 20,
            height: 20,
            '&:hover, &.Mui-focusVisible': {
              boxShadow: `0 0 0 8px ${alpha(getAutonomyColor(value), 0.16)}`
            }
          },
          '& .MuiSlider-track': {
            border: 'none',
            background: `linear-gradient(90deg, #F44336 0%, #FFB300 50%, #4CAF50 100%)`,
            opacity: 1
          },
          '& .MuiSlider-rail': {
            opacity: 0.2,
            backgroundColor: 'text.disabled'
          },
          '& .MuiSlider-mark': {
            backgroundColor: 'background.paper',
            height: 12,
            width: 2,
            '&.MuiSlider-markActive': {
              backgroundColor: 'background.paper'
            }
          },
          '& .MuiSlider-markLabel': {
            fontSize: '0.7rem',
            color: 'text.secondary',
            fontWeight: 500
          }
        }}
      />

      {/* Description */}
      <Typography
        variant="caption"
        sx={{
          display: 'block',
          mt: 2,
          fontSize: '0.75rem',
          color: 'text.secondary',
          lineHeight: 1.5
        }}
      >
        {value === 0 && '🔴 Manual mode: Agent suggests actions but waits for your approval.'}
        {value > 0 && value <= 30 && '🟡 Assisted mode: Agent helps but requires confirmation for important actions.'}
        {value > 30 && value <= 70 && '🟠 Semi-autonomous: Agent makes routine decisions, escalates complex ones.'}
        {value > 70 && '🟢 Fully autonomous: Agent operates independently within safety boundaries.'}
      </Typography>
    </Box>
  );
};

export default AutonomySlider;
