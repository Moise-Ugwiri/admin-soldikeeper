/* eslint-disable */
/**
 * 🎚️ AUTONOMY SLIDER COMPONENT — Personality-Aware with Safety Zones
 * 
 * Reusable slider for agent autonomy levels with:
 * - 🎨 Personality context hints (via agentRegistry)
 * - 🟢🟡🔴 Visual safety zones (supervised / elevated / full autonomous)
 * - 📋 Impact preview showing what the agent CAN do at current level
 * - ⚠️ Red-zone warning icon for high-autonomy settings
 * - 🌙 Dark theme compatible with smooth transitions
 */

import React, { useMemo } from 'react';
import { Box, Slider, Typography, alpha, Fade } from '@mui/material';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import { getAgent } from '../../../../data/agentRegistry';

// ─── Safety Zone Definitions ──────────────────────────────────────────
const ZONE_SUPERVISED = { color: '#4CAF50', label: 'Supervised',  range: [0, 40]  };
const ZONE_ELEVATED   = { color: '#FF9800', label: 'Elevated',    range: [40, 70] };
const ZONE_AUTONOMOUS = { color: '#F44336', label: 'Autonomous',  range: [70, 100] };

// ─── Personality → Hint Mapping ───────────────────────────────────────
const STYLE_HINTS = {
  commanding:   (n) => `${n} leads decisively — high autonomy enables bold orchestration`,
  protective:   (n) => `${n} operates conservatively — raise with caution`,
  analytical:   (n) => `${n} is methodical — moderate autonomy balances precision with speed`,
  creative:     (n) => `${n} thrives with creative freedom — higher autonomy unlocks innovation`,
  supportive:   (n) => `${n} is collaborative — autonomy lets it help proactively`,
  diplomatic:   (n) => `${n} mediates carefully — higher autonomy speeds conflict resolution`,
  meticulous:   (n) => `${n} is detail-driven — autonomy grants faster execution`,
  pragmatic:    (n) => `${n} favors practical solutions — autonomy accelerates delivery`,
  enthusiastic: (n) => `${n} is energetic — higher autonomy amplifies output`,
};

const TONE_FALLBACKS = {
  authoritative: (n) => `${n} commands with authority — match autonomy to trust level`,
  alert:         (n) => `${n} stays vigilant — conservative autonomy recommended`,
  formal:        (n) => `${n} follows strict procedures — autonomy bypasses manual gates`,
  warm:          (n) => `${n} is approachable — autonomy enables faster user assistance`,
  playful:       (n) => `${n} keeps things light — higher autonomy for fluid interaction`,
  confident:     (n) => `${n} is self-assured — autonomy lets it operate at full capacity`,
};

// ─── Impact Levels ────────────────────────────────────────────────────
const IMPACT_LEVELS = [
  { max: 30,  icon: '🔒', level: 'Low',    text: 'Requires approval for all actions',           color: '#4CAF50' },
  { max: 60,  icon: '⚡', level: 'Medium', text: 'Can execute routine tasks independently',     color: '#FF9800' },
  { max: 80,  icon: '🚀', level: 'High',   text: 'Will take proactive actions without approval', color: '#FF5722' },
  { max: 100, icon: '⚠️', level: 'Full',   text: 'Fully autonomous — minimal human oversight',  color: '#F44336' },
];


const AutonomySlider = ({ value, onChange, agent, disabled = false }) => {
  // ─── Resolve agent personality from registry ──────────────────────
  const agentData = useMemo(() => {
    if (!agent) return null;
    if (typeof agent === 'string') return getAgent(agent);
    if (agent.id) return getAgent(agent.id) || agent;
    return agent;
  }, [agent]);

  const agentColor = agentData?.color || '#FFB300';
  const agentName  = agentData?.name  || 'Agent';

  // ─── Existing color/label logic (preserved) ──────────────────────
  const getAutonomyColor = (val) => {
    if (val === 0) return '#F44336';
    if (val <= 30) return '#FF9800';
    if (val <= 70) return '#FFB300';
    return '#4CAF50';
  };

  const getAutonomyLabel = (val) => {
    if (val === 0) return 'Manual';
    if (val <= 30) return 'Assisted';
    if (val <= 70) return 'Semi-Autonomous';
    return 'Fully Autonomous';
  };

  // ─── Safety zone for current value ────────────────────────────────
  const currentZone = useMemo(() => {
    if (value <= 40) return ZONE_SUPERVISED;
    if (value <= 70) return ZONE_ELEVATED;
    return ZONE_AUTONOMOUS;
  }, [value]);

  const isRedZone = value > 70;

  // ─── Personality hint ─────────────────────────────────────────────
  const personalityHint = useMemo(() => {
    if (!agentData?.personality) return null;
    const { communicationStyle, tone } = agentData.personality;
    const styleFn = STYLE_HINTS[communicationStyle];
    if (styleFn) return styleFn(agentName);
    const toneFn = TONE_FALLBACKS[tone];
    if (toneFn) return toneFn(agentName);
    return `${agentName} (${communicationStyle || tone || 'standard'}) — adjust autonomy to match operational needs`;
  }, [agentData, agentName]);

  // ─── Impact preview ───────────────────────────────────────────────
  const impact = useMemo(() => {
    return IMPACT_LEVELS.find((lvl) => value <= lvl.max) || IMPACT_LEVELS[IMPACT_LEVELS.length - 1];
  }, [value]);

  return (
    <Box>
      {/* ─── Header Row ──────────────────────────────────────────── */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Box display="flex" alignItems="center" gap={1}>
          <Typography variant="body2" fontWeight={600}>
            Autonomy Level
          </Typography>
          {/* Red-zone warning icon */}
          <Fade in={isRedZone} timeout={400}>
            <WarningAmberRoundedIcon
              sx={{
                fontSize: '1.1rem',
                color: ZONE_AUTONOMOUS.color,
                animation: isRedZone ? 'pulse-warn 1.5s ease-in-out infinite' : 'none',
                '@keyframes pulse-warn': {
                  '0%, 100%': { opacity: 1 },
                  '50%': { opacity: 0.5 },
                },
              }}
            />
          </Fade>
        </Box>
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 1,
            px: 1.5,
            py: 0.5,
            borderRadius: 2,
            backgroundColor: alpha(getAutonomyColor(value), 0.1),
            border: `1px solid ${alpha(getAutonomyColor(value), 0.3)}`,
            transition: 'all 0.3s ease',
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontSize: '1.2rem',
              fontWeight: 700,
              color: getAutonomyColor(value),
              transition: 'color 0.3s ease',
            }}
          >
            {value}%
          </Typography>
          <Typography
            variant="caption"
            sx={{
              fontSize: '0.75rem',
              color: 'text.secondary',
              fontWeight: 500,
            }}
          >
            {getAutonomyLabel(value)}
          </Typography>
        </Box>
      </Box>

      {/* ─── Slider with Safety-Zone Track ───────────────────────── */}
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
          { value: 100, label: '100%' },
        ]}
        sx={{
          color: currentZone.color,
          height: 8,
          transition: 'color 0.3s ease',
          '& .MuiSlider-thumb': {
            width: 22,
            height: 22,
            backgroundColor: currentZone.color,
            border: '2px solid #fff',
            boxShadow: `0 0 0 3px ${alpha(currentZone.color, 0.25)}`,
            transition: 'background-color 0.3s ease, box-shadow 0.3s ease',
            '&:hover, &.Mui-focusVisible': {
              boxShadow: `0 0 0 8px ${alpha(currentZone.color, 0.16)}`,
            },
          },
          '& .MuiSlider-track': {
            border: 'none',
            opacity: 1,
            background: `linear-gradient(90deg, 
              ${ZONE_SUPERVISED.color} 0%, 
              ${ZONE_SUPERVISED.color} 38%, 
              ${ZONE_ELEVATED.color} 42%, 
              ${ZONE_ELEVATED.color} 68%, 
              ${ZONE_AUTONOMOUS.color} 72%, 
              ${ZONE_AUTONOMOUS.color} 100%
            )`,
          },
          '& .MuiSlider-rail': {
            opacity: 1,
            background: `linear-gradient(90deg, 
              ${alpha(ZONE_SUPERVISED.color, 0.18)} 0%, 
              ${alpha(ZONE_SUPERVISED.color, 0.18)} 40%, 
              ${alpha(ZONE_ELEVATED.color, 0.18)} 40%, 
              ${alpha(ZONE_ELEVATED.color, 0.18)} 70%, 
              ${alpha(ZONE_AUTONOMOUS.color, 0.18)} 70%, 
              ${alpha(ZONE_AUTONOMOUS.color, 0.18)} 100%
            )`,
          },
          '& .MuiSlider-mark': {
            backgroundColor: 'background.paper',
            height: 12,
            width: 2,
            '&.MuiSlider-markActive': {
              backgroundColor: 'background.paper',
            },
          },
          '& .MuiSlider-markLabel': {
            fontSize: '0.7rem',
            color: 'text.secondary',
            fontWeight: 500,
          },
        }}
      />

      {/* ─── Safety Zone Labels ──────────────────────────────────── */}
      <Box
        display="flex"
        justifyContent="space-between"
        sx={{ mt: 0.5, mb: 1.5, px: 0.5 }}
      >
        {[ZONE_SUPERVISED, ZONE_ELEVATED, ZONE_AUTONOMOUS].map((zone) => (
          <Box
            key={zone.label}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              opacity: currentZone.label === zone.label ? 1 : 0.45,
              transition: 'opacity 0.3s ease',
            }}
          >
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: zone.color,
                boxShadow: currentZone.label === zone.label
                  ? `0 0 6px ${alpha(zone.color, 0.6)}`
                  : 'none',
                transition: 'box-shadow 0.3s ease',
              }}
            />
            <Typography
              variant="caption"
              sx={{
                fontSize: '0.65rem',
                fontWeight: currentZone.label === zone.label ? 700 : 500,
                color: currentZone.label === zone.label ? zone.color : 'text.disabled',
                letterSpacing: '0.02em',
                transition: 'color 0.3s ease, font-weight 0.3s ease',
              }}
            >
              {zone.label}
              <Typography
                component="span"
                variant="caption"
                sx={{ fontSize: '0.6rem', color: 'text.disabled', ml: 0.5 }}
              >
                {zone.range[0]}–{zone.range[1]}%
              </Typography>
            </Typography>
          </Box>
        ))}
      </Box>

      {/* ─── Impact Preview Card ─────────────────────────────────── */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          p: 1.5,
          borderRadius: 2,
          backgroundColor: (theme) =>
            theme.palette.mode === 'dark'
              ? alpha(impact.color, 0.08)
              : alpha(impact.color, 0.06),
          border: `1px solid ${alpha(impact.color, 0.2)}`,
          transition: 'all 0.35s ease',
        }}
      >
        <Typography sx={{ fontSize: '1.3rem', lineHeight: 1 }}>
          {impact.icon}
        </Typography>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant="caption"
            sx={{
              display: 'block',
              fontWeight: 700,
              fontSize: '0.7rem',
              color: impact.color,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              mb: 0.2,
              transition: 'color 0.3s ease',
            }}
          >
            {impact.level} Autonomy
          </Typography>
          <Typography
            variant="caption"
            sx={{
              display: 'block',
              fontSize: '0.75rem',
              color: 'text.secondary',
              lineHeight: 1.4,
            }}
          >
            {impact.text}
          </Typography>
        </Box>
        {isRedZone && (
          <Fade in timeout={400}>
            <WarningAmberRoundedIcon
              sx={{
                fontSize: '1.2rem',
                color: ZONE_AUTONOMOUS.color,
                flexShrink: 0,
              }}
            />
          </Fade>
        )}
      </Box>

      {/* ─── Existing Description (preserved) ────────────────────── */}
      <Typography
        variant="caption"
        sx={{
          display: 'block',
          mt: 1.5,
          fontSize: '0.75rem',
          color: 'text.secondary',
          lineHeight: 1.5,
        }}
      >
        {value === 0 && '🔴 Manual mode: Agent suggests actions but waits for your approval.'}
        {value > 0 && value <= 30 && '🟡 Assisted mode: Agent helps but requires confirmation for important actions.'}
        {value > 30 && value <= 70 && '🟠 Semi-autonomous: Agent makes routine decisions, escalates complex ones.'}
        {value > 70 && '🟢 Fully autonomous: Agent operates independently within safety boundaries.'}
      </Typography>

      {/* ─── Personality Context Hint ─────────────────────────────── */}
      {personalityHint && (
        <Fade in timeout={500}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              mt: 1.5,
              p: 1.25,
              borderRadius: 2,
              backgroundColor: (theme) =>
                theme.palette.mode === 'dark'
                  ? alpha(agentColor, 0.08)
                  : alpha(agentColor, 0.05),
              borderLeft: `3px solid ${agentColor}`,
              transition: 'all 0.3s ease',
            }}
          >
            {agentData?.emoji && (
              <Typography sx={{ fontSize: '1rem', lineHeight: 1, flexShrink: 0 }}>
                {agentData.emoji}
              </Typography>
            )}
            <Box sx={{ minWidth: 0 }}>
              <Typography
                variant="caption"
                sx={{
                  display: 'block',
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  color: agentColor,
                  mb: 0.2,
                  transition: 'color 0.3s ease',
                }}
              >
                Personality Insight
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  display: 'block',
                  fontSize: '0.72rem',
                  color: 'text.secondary',
                  lineHeight: 1.45,
                  fontStyle: 'italic',
                }}
              >
                {personalityHint}
              </Typography>
            </Box>
          </Box>
        </Fade>
      )}
    </Box>
  );
};

export default AutonomySlider;
