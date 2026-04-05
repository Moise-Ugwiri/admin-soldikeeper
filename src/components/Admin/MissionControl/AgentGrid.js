/* eslint-disable */
import React, { useState, useMemo, useCallback } from 'react';
import { Box, Typography, alpha, keyframes, useTheme } from '@mui/material';
import AgentCard from './AgentCard';

// ═══════════════════════════════════════════════════════════════════
//  KEYFRAMES — subtle life‑giving animations
// ═══════════════════════════════════════════════════════════════════

/** Cards stagger‑fade from invisible to visible */
const fadeSlideIn = keyframes`
  0%   { opacity: 0; transform: translateY(18px) scale(0.97); }
  60%  { opacity: 1; transform: translateY(-2px) scale(1.005); }
  100% { opacity: 1; transform: translateY(0)   scale(1); }
`;

/** Apollo's golden border glow — always gently breathing */
const apolloGlow = keyframes`
  0%, 100% { box-shadow: 0 0 10px 1px rgba(255, 215, 0, 0.15),
                          0 0 22px 4px rgba(255, 215, 0, 0.06); }
  50%      { box-shadow: 0 0 18px 5px rgba(255, 215, 0, 0.35),
                          0 0 36px 10px rgba(255, 215, 0, 0.12); }
`;

/** Soft pulse for the collaboration dot */
const dotPulse = keyframes`
  0%, 100% { transform: scale(1);   opacity: 0.85; }
  50%      { transform: scale(1.3); opacity: 1; }
`;

/** Idle floating for empty‑state robot */
const float = keyframes`
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-8px); }
`;

// ═══════════════════════════════════════════════════════════════════
//  HELPERS
// ═══════════════════════════════════════════════════════════════════

/** Map agent status → left‑border accent color */
const STATUS_BORDER = {
  idle:    '#10b981', // emerald
  busy:    '#f59e0b', // amber
  offline: '#ef4444', // red
};

/** Is this the Apollo / orchestrator agent? */
const isApollo = (agent) =>
  agent?.id === '00-apollo' || agent?.id === 'apollo';

/**
 * Build a lookup: agentId → Set of collaborator IDs.
 * Bi‑directional: if A lists B in worksWellWith, both share the link.
 */
const buildCollabMap = (agents) => {
  const map = {};
  agents.forEach((a) => {
    if (!map[a.id]) map[a.id] = new Set();
    (a.worksWellWith || []).forEach((partnerId) => {
      map[a.id].add(partnerId);
      if (!map[partnerId]) map[partnerId] = new Set();
      map[partnerId].add(a.id);
    });
  });
  return map;
};

/**
 * Deterministic shared‑color for a collaborator pair.
 * Uses a small curated palette so dots are always legible.
 */
const COLLAB_PALETTE = [
  '#38bdf8', '#a78bfa', '#f472b6', '#34d399',
  '#fbbf24', '#fb923c', '#60a5fa', '#c084fc',
];
const pairColor = (idA, idB) => {
  const key = [idA, idB].sort().join(':');
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) | 0;
  return COLLAB_PALETTE[Math.abs(hash) % COLLAB_PALETTE.length];
};


// ═══════════════════════════════════════════════════════════════════
//  EMPTY STATE
// ═══════════════════════════════════════════════════════════════════

const EmptyState = () => {
  const theme = useTheme();
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 10,
        px: 3,
        textAlign: 'center',
      }}
    >
      <Box
        sx={{
          fontSize: '4rem',
          lineHeight: 1,
          mb: 2,
          animation: `${float} 3s ease-in-out infinite`,
        }}
      >
        🤖
      </Box>
      <Typography
        variant="h6"
        sx={{
          color: alpha(theme.palette.text.primary, 0.6),
          fontWeight: 600,
          mb: 0.5,
        }}
      >
        No agents found
      </Typography>
      <Typography
        variant="body2"
        sx={{ color: alpha(theme.palette.text.secondary, 0.5), maxWidth: 320 }}
      >
        The agent roster is empty. Check your data source or filters.
      </Typography>
    </Box>
  );
};


// ═══════════════════════════════════════════════════════════════════
//  COLLABORATION DOT — tiny badge showing a shared link
// ═══════════════════════════════════════════════════════════════════

const CollabDot = ({ color, active }) => (
  <Box
    sx={{
      width: 8,
      height: 8,
      borderRadius: '50%',
      backgroundColor: color,
      transition: 'all 0.3s ease',
      animation: active ? `${dotPulse} 1.4s ease-in-out infinite` : 'none',
      opacity: active ? 1 : 0.45,
      flexShrink: 0,
    }}
  />
);


// ═══════════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════

/**
 * AgentGrid — a living, animated, responsive grid of PROJECT OLYMPUS agents.
 *
 * • 4 cols (xl) → 3 (lg) → 2 (md) → 1 (sm)
 * • Apollo gets a golden‑glow, wider card centered in the first row
 * • Hovering one card dims siblings and highlights collaboration partners
 * • Cards stagger‑fade in on mount
 * • Status‑aware left‑border accent
 * • Collaboration "dots" link agents that share worksWellWith
 */
const AgentGrid = ({
  agents = [],
  onSelectAgent,
  selectedAgent,
}) => {
  const theme = useTheme();
  const [hoveredId, setHoveredId] = useState(null);

  // ── derived data ──────────────────────────────────────────────
  const collabMap = useMemo(() => buildCollabMap(agents), [agents]);

  /** IDs that collaborate with the currently hovered card */
  const highlightedIds = useMemo(() => {
    if (!hoveredId) return new Set();
    return collabMap[hoveredId] || new Set();
  }, [hoveredId, collabMap]);

  /** Separate Apollo (for special row) from the rest */
  const { apollo, others } = useMemo(() => {
    const a = agents.find(isApollo) || null;
    const o = agents.filter((ag) => !isApollo(ag));
    return { apollo: a, others: o };
  }, [agents]);

  // ── event handlers ────────────────────────────────────────────
  const handleMouseEnter = useCallback((id) => setHoveredId(id), []);
  const handleMouseLeave = useCallback(() => setHoveredId(null), []);
  const handleClick = useCallback(
    (agent) => {
      if (onSelectAgent) onSelectAgent(agent);
    },
    [onSelectAgent],
  );

  // ── empty ─────────────────────────────────────────────────────
  if (!agents.length) return <EmptyState />;

  // ── render ────────────────────────────────────────────────────
  return (
    <Box sx={{ width: '100%', mb: 4 }}>
      {/* ─── Apollo hero row ─────────────────────────────────── */}
      {apollo && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            mb: 2.5,
          }}
        >
          <AgentCardWrapper
            agent={apollo}
            index={0}
            isApolloCard
            hoveredId={hoveredId}
            highlightedIds={highlightedIds}
            selectedAgent={selectedAgent}
            collabMap={collabMap}
            agents={agents}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={handleClick}
            theme={theme}
          />
        </Box>
      )}

      {/* ─── Main responsive grid ────────────────────────────── */}
      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: {
            xs: '1fr',
            sm: '1fr',
            md: 'repeat(2, 1fr)',
            lg: 'repeat(3, 1fr)',
            xl: 'repeat(4, 1fr)',
          },
        }}
      >
        {others.map((agent, idx) => (
          <AgentCardWrapper
            key={agent.id}
            agent={agent}
            index={apollo ? idx + 1 : idx}        // offset for stagger
            isApolloCard={false}
            hoveredId={hoveredId}
            highlightedIds={highlightedIds}
            selectedAgent={selectedAgent}
            collabMap={collabMap}
            agents={agents}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={handleClick}
            theme={theme}
          />
        ))}
      </Box>
    </Box>
  );
};


// ═══════════════════════════════════════════════════════════════════
//  CARD WRAPPER — handles hover, glow, stagger, collab dots
// ═══════════════════════════════════════════════════════════════════

const AgentCardWrapper = React.memo(function AgentCardWrapper({
  agent,
  index,
  isApolloCard,
  hoveredId,
  highlightedIds,
  selectedAgent,
  collabMap,
  agents,
  onMouseEnter,
  onMouseLeave,
  onClick,
  theme,
}) {
  const isHovered       = hoveredId === agent.id;
  const isPartner       = highlightedIds.has(agent.id);
  const someoneHovered  = hoveredId !== null;
  const isSelected      = selectedAgent?.id === agent.id;
  const borderColor     = STATUS_BORDER[agent.status] || STATUS_BORDER.offline;

  // Determine wrapper opacity during hover interaction
  let wrapperOpacity = 1;
  if (someoneHovered && !isHovered && !isPartner) {
    wrapperOpacity = 0.55;
  }

  // Collaboration dots: show dots for each visible partner
  const visiblePartners = useMemo(() => {
    const partnerIds = collabMap[agent.id] || new Set();
    const agentIdSet = new Set(agents.map((a) => a.id));
    return [...partnerIds].filter((pid) => agentIdSet.has(pid));
  }, [collabMap, agent.id, agents]);

  return (
    <Box
      onMouseEnter={() => onMouseEnter(agent.id)}
      onMouseLeave={onMouseLeave}
      onClick={() => onClick(agent)}
      sx={{
        // ─ sizing ─
        width: isApolloCard ? { xs: '100%', sm: '70%', md: '55%', lg: '42%' } : '100%',
        minWidth: 0,
        cursor: 'pointer',
        position: 'relative',

        // ─ stagger animation ─
        animation: `${fadeSlideIn} 0.5s cubic-bezier(0.22, 1, 0.36, 1) both`,
        animationDelay: `${index * 55}ms`,

        // ─ status left border ─
        borderLeft: `3px solid ${borderColor}`,
        borderRadius: '12px',

        // ─ apollo glow ─
        ...(isApolloCard && {
          animation: `${fadeSlideIn} 0.5s cubic-bezier(0.22, 1, 0.36, 1) both, ${apolloGlow} 3s ease-in-out infinite`,
          animationDelay: '0ms, 0.5s',
          border: `1.5px solid ${alpha('#FFD700', 0.35)}`,
          borderLeft: `3px solid #FFD700`,
        }),

        // ─ selected ring ─
        ...(isSelected && {
          outline: `2px solid ${theme.palette.primary.main}`,
          outlineOffset: 2,
        }),

        // ─ hover / dim transitions ─
        opacity: wrapperOpacity,
        transition: 'opacity 0.3s ease, transform 0.25s ease, box-shadow 0.3s ease',
        transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: isHovered
          ? `0 8px 24px ${alpha(theme.palette.common.black, 0.25)}`
          : 'none',

        // ─ collab partner highlight ring ─
        ...(someoneHovered && isPartner && !isHovered && {
          outline: `1.5px dashed ${alpha(theme.palette.info.main, 0.55)}`,
          outlineOffset: 2,
          opacity: 1,
        }),

        // ─ prevent inner card's own border-radius from clipping ─
        overflow: 'hidden',
        '& > *': { borderRadius: 0 },
      }}
    >
      {/* ── Collaboration dots ribbon ──────────────────────── */}
      {visiblePartners.length > 0 && (
        <Box
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            display: 'flex',
            gap: '3px',
            zIndex: 2,
            flexWrap: 'wrap',
            maxWidth: 60,
            justifyContent: 'flex-end',
          }}
        >
          {visiblePartners.slice(0, 5).map((pid) => (
            <CollabDot
              key={pid}
              color={pairColor(agent.id, pid)}
              active={
                (hoveredId === agent.id) ||
                (hoveredId === pid)
              }
            />
          ))}
        </Box>
      )}

      {/* ── The actual AgentCard ───────────────────────────── */}
      <AgentCard
        agent={agent}
        onClick={() => onClick(agent)}
        compact={false}
      />
    </Box>
  );
});


export default AgentGrid;
