/**
 * 🎨 AGENT INTERFACE — Slide-In Detail Panel
 * Personality-driven agent drawer with rich header and tabbed content.
 *
 * Features:
 *  - Personality header: emoji avatar, mood, confidence bar, trait chips, status badge
 *  - 5 tabs: Chat · Brain · Actions · Activity · Governance
 *  - Dark mission-control aesthetic with per-agent colour accents
 *  - 300 ms slide-in / content-fade transitions
 *  - Fully responsive (full-width mobile, 620 px desktop)
 */

import React, { useState, useMemo } from 'react';
import {
  Drawer,
  Box,
  IconButton,
  Typography,
  Tabs,
  Tab,
  Chip,
  LinearProgress,
  useTheme,
  useMediaQuery,
  alpha
} from '@mui/material';
import {
  Close as CloseIcon,
  ChatBubbleOutline as ChatIcon,
  Psychology as BrainIcon,
  PlayArrow as ActionsIcon,
  Timeline as ActivityIcon,
  Shield as GovIcon,
  FiberManualRecord as DotIcon
} from '@mui/icons-material';

import { getAgent, MOOD_STATES } from '../../../../data/agentRegistry';
import AgentChatTab from './AgentChatTab';
import AgentBrainTab from './AgentBrainTab';
import AgentActionsTab from './AgentActionsTab';
import AgentActivityTab from './AgentActivityTab';
import AgentGovernanceTab from './AgentGovernanceTab';

/* ──────────────────────────────────────────────
   Status helpers
   ────────────────────────────────────────────── */
const STATUS_MAP = {
  busy:    { label: 'Busy',    dot: '#f59e0b' },
  idle:    { label: 'Idle',    dot: '#10b981' },
  offline: { label: 'Offline', dot: '#6b7280' },
};

const resolveStatus = (raw) => STATUS_MAP[raw] || STATUS_MAP.idle;

/* ──────────────────────────────────────────────
   Component
   ────────────────────────────────────────────── */
const AgentInterface = ({ open, onClose, agent }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [activeTab, setActiveTab] = useState(0);

  // Merge prop data with registry personality data
  const enriched = useMemo(() => {
    if (!agent) return null;
    const registry = getAgent(agent.id);
    return registry ? { ...agent, ...registry } : agent;
  }, [agent]);

  if (!enriched) return null;

  /* ── Derived values ──────────────────────── */
  const agentColor  = enriched.color || '#3b82f6';
  const moodKey     = enriched.mood?.current || 'idle';
  const moodData    = MOOD_STATES[moodKey] || MOOD_STATES.idle || { emoji: '😴', label: 'Resting', color: '#9E9E9E' };
  const confidence  = enriched.mood?.energy ?? enriched.load ?? 50;
  const traits      = (enriched.personality?.traits || []).slice(0, 3);
  const statusInfo  = resolveStatus(enriched.status);
  const drawerWidth = isMobile ? '100vw' : 620;

  const TABS = [
    { icon: <ChatIcon sx={{ fontSize: 18 }} />,     label: 'Chat' },
    { icon: <BrainIcon sx={{ fontSize: 18 }} />,    label: 'Brain' },
    { icon: <ActionsIcon sx={{ fontSize: 18 }} />,  label: 'Actions' },
    { icon: <ActivityIcon sx={{ fontSize: 18 }} />,  label: 'Activity' },
    { icon: <GovIcon sx={{ fontSize: 18 }} />,      label: 'Governance' },
  ];

  /* ── Render ──────────────────────────────── */
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      transitionDuration={300}
      PaperProps={{
        sx: {
          width: drawerWidth,
          maxWidth: '100vw',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#0b1121',
          backgroundImage: 'none',
          borderLeft: `1px solid ${alpha(agentColor, 0.20)}`,
        },
      }}
    >
      {/* ─── HEADER ─────────────────────────── */}
      <Box
        sx={{
          position: 'relative',
          px: { xs: 2, sm: 2.5 },
          pt: { xs: 2, sm: 2.5 },
          pb: 2,
          background: `linear-gradient(160deg, ${alpha(agentColor, 0.18)} 0%, ${alpha(agentColor, 0.04)} 60%, transparent 100%)`,
          borderBottom: `2px solid ${alpha(agentColor, 0.35)}`,
        }}
      >
        {/* Close button — top right */}
        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            position: 'absolute',
            top: 10,
            right: 10,
            color: alpha('#fff', 0.45),
            '&:hover': { backgroundColor: alpha(agentColor, 0.15), color: '#fff' },
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>

        {/* Row 1 — Avatar + Identity */}
        <Box display="flex" alignItems="center" gap={2} mb={1.5}>
          {/* Emoji circle */}
          <Box
            sx={{
              width: 56,
              height: 56,
              minWidth: 56,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.75rem',
              background: `linear-gradient(135deg, ${alpha(agentColor, 0.45)}, ${alpha(agentColor, 0.20)})`,
              boxShadow: `0 0 20px ${alpha(agentColor, 0.30)}, inset 0 0 12px ${alpha(agentColor, 0.15)}`,
              border: `2px solid ${alpha(agentColor, 0.50)}`,
            }}
          >
            {enriched.emoji}
          </Box>

          {/* Name + Role */}
          <Box sx={{ flex: 1, minWidth: 0, pr: 3 }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 800,
                fontSize: { xs: '1.15rem', sm: '1.35rem' },
                color: '#fff',
                lineHeight: 1.2,
                letterSpacing: '0.02em',
              }}
            >
              {enriched.name}
              <Typography
                component="span"
                sx={{
                  ml: 1,
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  color: alpha(agentColor, 0.85),
                  letterSpacing: '0.08em',
                  verticalAlign: 'middle',
                }}
              >
                {enriched.number}
              </Typography>
            </Typography>

            <Typography
              variant="body2"
              sx={{
                color: alpha('#fff', 0.55),
                fontSize: '0.78rem',
                mt: 0.25,
                lineHeight: 1.3,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {enriched.role}
            </Typography>
          </Box>
        </Box>

        {/* Row 2 — Mood + Confidence + Status */}
        <Box
          display="flex"
          alignItems="center"
          gap={1.5}
          flexWrap="wrap"
          mb={1.25}
        >
          {/* Mood pill */}
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.5,
              px: 1.25,
              py: 0.35,
              borderRadius: '10px',
              fontSize: '0.72rem',
              fontWeight: 600,
              color: moodData.color,
              backgroundColor: alpha(moodData.color, 0.12),
              border: `1px solid ${alpha(moodData.color, 0.25)}`,
            }}
          >
            <span style={{ fontSize: '0.85rem' }}>{moodData.emoji}</span>
            {moodData.label}
          </Box>

          {/* Confidence bar */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flex: 1, minWidth: 100, maxWidth: 180 }}>
            <Typography sx={{ fontSize: '0.65rem', color: alpha('#fff', 0.40), fontWeight: 600, whiteSpace: 'nowrap' }}>
              CONF
            </Typography>
            <LinearProgress
              variant="determinate"
              value={confidence}
              sx={{
                flex: 1,
                height: 5,
                borderRadius: 3,
                backgroundColor: alpha('#fff', 0.08),
                '& .MuiLinearProgress-bar': {
                  borderRadius: 3,
                  background: `linear-gradient(90deg, ${agentColor}, ${alpha(agentColor, 0.60)})`,
                },
              }}
            />
            <Typography sx={{ fontSize: '0.65rem', color: alpha('#fff', 0.45), fontWeight: 600, minWidth: 26, textAlign: 'right' }}>
              {confidence}%
            </Typography>
          </Box>

          {/* Status badge */}
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.5,
              px: 1,
              py: 0.3,
              borderRadius: '8px',
              fontSize: '0.68rem',
              fontWeight: 700,
              color: statusInfo.dot,
              backgroundColor: alpha(statusInfo.dot, 0.12),
              border: `1px solid ${alpha(statusInfo.dot, 0.25)}`,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            <DotIcon sx={{ fontSize: 8, color: statusInfo.dot }} />
            {statusInfo.label}
          </Box>
        </Box>

        {/* Row 3 — Trait chips */}
        {traits.length > 0 && (
          <Box display="flex" gap={0.75} flexWrap="wrap">
            {traits.map((trait) => (
              <Chip
                key={trait}
                label={trait}
                size="small"
                sx={{
                  height: 22,
                  fontSize: '0.66rem',
                  fontWeight: 600,
                  color: alpha('#fff', 0.70),
                  backgroundColor: alpha(agentColor, 0.10),
                  border: `1px solid ${alpha(agentColor, 0.22)}`,
                  '& .MuiChip-label': { px: 1 },
                }}
              />
            ))}
          </Box>
        )}
      </Box>

      {/* ─── TABS ───────────────────────────── */}
      <Box
        sx={{
          backgroundColor: alpha('#0b1121', 0.95),
          borderBottom: `1px solid ${alpha('#fff', 0.06)}`,
        }}
      >
        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          variant={isMobile ? 'fullWidth' : 'standard'}
          centered={!isMobile}
          sx={{
            minHeight: 44,
            '& .MuiTab-root': {
              minHeight: 44,
              fontSize: '0.80rem',
              fontWeight: 600,
              textTransform: 'none',
              color: alpha('#fff', 0.40),
              gap: 0.75,
              transition: 'color 200ms',
              '&:hover': { color: alpha('#fff', 0.65) },
              '&.Mui-selected': { color: agentColor },
            },
            '& .MuiTabs-indicator': {
              height: 2.5,
              borderRadius: '2px 2px 0 0',
              backgroundColor: agentColor,
              boxShadow: `0 0 8px ${alpha(agentColor, 0.50)}`,
            },
          }}
        >
          {TABS.map((t) => (
            <Tab
              key={t.label}
              icon={t.icon}
              iconPosition="start"
              label={isMobile ? undefined : t.label}
            />
          ))}
        </Tabs>
      </Box>

      {/* ─── TAB CONTENT ────────────────────── */}
      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          backgroundColor: '#0e1525',
          /* Smooth fade for tab switches */
          '& > *': {
            animation: 'agentPanelFadeIn 250ms ease-out',
          },
          '@keyframes agentPanelFadeIn': {
            '0%':   { opacity: 0, transform: 'translateY(6px)' },
            '100%': { opacity: 1, transform: 'translateY(0)' },
          },
        }}
      >
        {activeTab === 0 && <AgentChatTab agent={enriched} />}
        {activeTab === 1 && <AgentBrainTab agent={enriched} />}
        {activeTab === 2 && <AgentActionsTab agent={enriched} />}
        {activeTab === 3 && <AgentActivityTab agent={enriched} />}
        {activeTab === 4 && <AgentGovernanceTab agent={enriched} />}
      </Box>
    </Drawer>
  );
};

export default AgentInterface;
