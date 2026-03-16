import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Card,
  CardContent,
  Box,
  Typography,
  LinearProgress,
  Chip,
  Tooltip,
  Avatar,
  alpha,
  useTheme,
  keyframes,
} from '@mui/material';
import { MOOD_STATES, getAgentThinkingPhrase } from '../../../data/agentRegistry';


// ═══════════════════════════════════════════════════════════════
//  KEYFRAME ANIMATIONS — the heartbeat that makes agents alive
// ═══════════════════════════════════════════════════════════════

/** Busy agents "breathe" — a gentle rhythmic pulse like a living thing */
const breathe = keyframes`
  0%, 100% { transform: scale(1); }
  50%      { transform: scale(1.06); }
`;

/** Idle agents glow softly — present but resting */
const glowPulse = keyframes`
  0%, 100% { opacity: 0.25; }
  50%      { opacity: 0.7; }
`;

/** Thinking agents have a slowly rotating ring */
const spinSlow = keyframes`
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
`;

/** Text crossfades in/out for rotating thinking phrases */
const fadeText = keyframes`
  0%   { opacity: 0; transform: translateY(3px); }
  12%  { opacity: 1; transform: translateY(0); }
  88%  { opacity: 1; transform: translateY(0); }
  100% { opacity: 0; transform: translateY(-3px); }
`;

/** Apollo's special golden aura — the commander stands apart */
const apolloAura = keyframes`
  0%, 100% { box-shadow: 0 0 12px 2px rgba(255, 215, 0, 0.20),
                          0 0 24px 4px rgba(255, 215, 0, 0.08); }
  50%      { box-shadow: 0 0 20px 6px rgba(255, 215, 0, 0.40),
                          0 0 40px 12px rgba(255, 215, 0, 0.15); }
`;

/** Subtle accent bar pulse on the narrative strip */
const accentPulse = keyframes`
  0%, 100% { opacity: 0.4; }
  50%      { opacity: 1; }
`;


// ═══════════════════════════════════════════════════════════════
//  HELPER — derive partner display data from an agent ID string
// ═══════════════════════════════════════════════════════════════

const PARTNER_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#FF9800', '#8BC34A', '#00BCD4', '#E91E63',
  '#9C27B0', '#3F51B5',
];

const partnerDisplayFromId = (partnerId, index) => {
  const parts = partnerId.split('-');
  const num = parts[0] || '?';
  const name = parts.slice(1).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  return { id: partnerId, num, name, color: PARTNER_COLORS[index % PARTNER_COLORS.length] };
};


// ═══════════════════════════════════════════════════════════════
//  AGENT CARD — makes every agent feel like a real team member
// ═══════════════════════════════════════════════════════════════

const AgentCard = ({ agent, onClick, compact = false }) => {
  const theme = useTheme();
  const isApollo = agent.id === '00-apollo';

  // ── Hover state — expands personality on hover ──────────────
  const [isHovered, setIsHovered] = useState(false);

  // ── Rotating thinking phrases for busy agents ──────────────
  const [currentPhrase, setCurrentPhrase] = useState('');
  const [phraseKey, setPhraseKey] = useState(0);

  // ── Graceful fallbacks for all personality fields ──────────
  const personality = agent.personality || {};
  const traits = useMemo(() => personality.traits || [], [personality.traits]);
  const mood = agent.mood || {};
  const moodCurrent = mood.current || null;
  const moodEmoji = mood.emoji || MOOD_STATES[moodCurrent]?.emoji || '🤖';
  const moodLabel = MOOD_STATES[moodCurrent]?.label || moodCurrent || agent.status;
  const moodColor = MOOD_STATES[moodCurrent]?.color || '#9E9E9E';
  const energy = typeof mood.energy === 'number' ? mood.energy : 50;
  // ── Memoized partner data for collaboration dots ───────────
  const partners = useMemo(
    () => (agent.worksWellWith || []).slice(0, 3).map((id, i) => partnerDisplayFromId(id, i)),
    [agent.worksWellWith]
  );

  // ── Phrase rotator: fires every 4 s while the agent is busy ─
  const rotatePhraseNow = useCallback(() => {
    setCurrentPhrase(getAgentThinkingPhrase(agent));
    setPhraseKey(k => k + 1);
  }, [agent]);

  useEffect(() => {
    if (agent.status !== 'busy') { setCurrentPhrase(''); return; }
    rotatePhraseNow();                       // show one immediately
    const id = setInterval(rotatePhraseNow, 4000);
    return () => clearInterval(id);
  }, [agent.status, agent.id, rotatePhraseNow]);

  // ── Derived narrative text ─────────────────────────────────
  const narrativeText = useMemo(() => {
    const sn = agent.statusNarratives || {};
    switch (agent.status) {
      case 'busy':
        return currentPhrase || sn.busy || agent.currentTask || 'Working…';
      case 'idle':
        return sn.idle || 'Standing by — awaiting orders.';
      case 'offline':
        return 'Offline — awaiting activation.';
      default:
        return sn.idle || 'Standing by…';
    }
  }, [agent.status, agent.currentTask, currentPhrase, agent.statusNarratives]);

  // ── Color helpers ──────────────────────────────────────────

  const loadColor = useMemo(() => {
    if (agent.load >= 80) return '#F44336';
    if (agent.load >= 50) return '#FF9800';
    return '#4CAF50';
  }, [agent.load]);

  const energyColor = useMemo(() => {
    if (energy >= 70) return '#4CAF50';
    if (energy >= 40) return '#FF9800';
    return '#F44336';
  }, [energy]);

  // ── Avatar ring animation based on agent status ────────────
  const ringAnimation = useMemo(() => {
    if (agent.status === 'busy')  return `${breathe} 3s ease-in-out infinite`;
    if (moodCurrent === 'thinking') return `${spinSlow} 8s linear infinite`;
    return 'none';  // idle glow handled by a separate overlay
  }, [agent.status, moodCurrent]);

  // ── How many trait chips to show ───────────────────────────
  const visibleTraits = isHovered ? traits : traits.slice(0, 2);
  const hiddenCount = traits.length - 2;


  // ═════════════════════════════════════════════════════════════
  //  R E N D E R
  // ═════════════════════════════════════════════════════════════

  return (
    <Card
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      sx={{
        height: '100%',
        cursor: onClick ? 'pointer' : 'default',
        position: 'relative',
        overflow: 'visible',
        borderRadius: 3,
        border: `1px solid ${alpha(agent.color, isApollo ? 0.45 : 0.15)}`,
        borderLeft: `4px solid ${agent.color}`,
        background: isApollo
          ? `linear-gradient(145deg, ${alpha(agent.color, 0.07)} 0%, ${alpha(agent.color, 0.02)} 100%)`
          : theme.palette.background.paper,
        transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',

        // Apollo golden aura
        ...(isApollo && {
          animation: `${apolloAura} 3s ease-in-out infinite`,
        }),

        // Hover lift + colored shadow
        '&:hover': onClick ? {
          transform: 'translateY(-6px)',
          boxShadow: `0 18px 36px ${alpha(agent.color, 0.30)},
                      0 0 0 1px ${alpha(agent.color, 0.25)}`,
          borderColor: alpha(agent.color, 0.5),
          borderLeftColor: agent.color,
        } : {},
      }}
    >

      {/* ── Apollo commander star badge ── */}
      {isApollo && (
        <Box sx={{
          position: 'absolute', top: -10, right: -10, zIndex: 2,
          width: 28, height: 28, borderRadius: '50%',
          background: `linear-gradient(135deg, ${agent.color}, #FFA000)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 2px 8px ${alpha(agent.color, 0.5)}`,
        }}>
          <Typography sx={{ fontSize: '0.75rem', lineHeight: 1 }}>⭐</Typography>
        </Box>
      )}


      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>

        {/* ═══════════════════════════════════════════════════════
            1 · HEADER — Animated Avatar + Name + Mood Status
            ═══════════════════════════════════════════════════════ */}
        <Box display="flex" alignItems="flex-start" gap={1.5} mb={1.5}>

          {/* ── Animated avatar ring ── */}
          <Box sx={{ position: 'relative', flexShrink: 0 }}>
            {/* The ring itself */}
            <Box sx={{
              width: compact ? 48 : 56,
              height: compact ? 48 : 56,
              borderRadius: '50%',
              background: `conic-gradient(from 0deg, ${agent.color}, ${alpha(agent.color, 0.3)}, ${agent.color})`,
              p: '3px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              animation: ringAnimation,
            }}>
              <Box sx={{
                width: '100%', height: '100%', borderRadius: '50%',
                backgroundColor: agent.bgColor || alpha(agent.color, 0.1),
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Typography sx={{ fontSize: compact ? '1.4rem' : '1.7rem', lineHeight: 1, userSelect: 'none' }}>
                  {agent.emoji}
                </Typography>
              </Box>
            </Box>

            {/* Glow overlay (idle only) — separate Box so it doesn't affect content */}
            {agent.status === 'idle' && (
              <Box sx={{
                position: 'absolute', inset: -2, borderRadius: '50%',
                boxShadow: `0 0 14px 4px ${alpha(agent.color, 0.45)}`,
                animation: `${glowPulse} 2s ease-in-out infinite`,
                pointerEvents: 'none',
              }} />
            )}

            {/* Mood badge — bottom‑right like a Discord status indicator */}
            <Tooltip title={moodLabel} arrow placement="right">
              <Box sx={{
                position: 'absolute', bottom: -2, right: -2, zIndex: 1,
                width: 22, height: 22, borderRadius: '50%',
                backgroundColor: theme.palette.background.paper,
                border: `2px solid ${moodColor}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.7rem', lineHeight: 1,
              }}>
                {moodEmoji}
              </Box>
            </Tooltip>
          </Box>

          {/* ── Agent identity block ── */}
          <Box flex={1} minWidth={0}>
            <Typography variant="caption" sx={{
              fontSize: '0.65rem', fontWeight: 700, color: agent.color,
              letterSpacing: '0.8px', textTransform: 'uppercase',
            }}>
              {agent.number}
            </Typography>

            <Typography variant="h6" noWrap sx={{
              fontSize: compact ? '0.95rem' : '1.05rem',
              fontWeight: 800, lineHeight: 1.2,
              color: isApollo ? agent.color : 'text.primary',
              letterSpacing: '0.3px',
            }}>
              {agent.name.toUpperCase()}
            </Typography>

            <Typography variant="caption" sx={{
              display: 'block', fontSize: '0.68rem',
              color: 'text.secondary', lineHeight: 1.3, mt: 0.25,
            }}>
              {agent.role}
            </Typography>
          </Box>
        </Box>


        {/* ═══════════════════════════════════════════════════════
            2 · PERSONALITY TRAITS — small colored chips
            ═══════════════════════════════════════════════════════ */}
        {traits.length > 0 && (
          <Box sx={{
            display: 'flex', flexWrap: 'wrap', gap: 0.5,
            mb: 1.25, minHeight: 22,
            transition: 'all 0.3s ease',
          }}>
            {visibleTraits.map((trait) => (
              <Chip
                key={trait}
                label={trait}
                size="small"
                sx={{
                  height: 20, fontSize: '0.6rem', fontWeight: 600,
                  backgroundColor: alpha(agent.color, 0.10),
                  color: agent.color,
                  border: `1px solid ${alpha(agent.color, 0.20)}`,
                  borderRadius: '10px',
                  '& .MuiChip-label': { px: 0.75 },
                }}
              />
            ))}
            {!isHovered && hiddenCount > 0 && (
              <Typography variant="caption" sx={{
                fontSize: '0.6rem', fontWeight: 600,
                color: alpha(agent.color, 0.55),
                alignSelf: 'center', ml: 0.25,
              }}>
                +{hiddenCount}
              </Typography>
            )}
          </Box>
        )}


        {/* ═══════════════════════════════════════════════════════
            3 · ENERGY BAR — thin colored strip
            ═══════════════════════════════════════════════════════ */}
        <Box sx={{ mb: 1.25 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.25}>
            <Box display="flex" alignItems="center" gap={0.5}>
              <Typography sx={{ fontSize: '0.6rem', lineHeight: 1 }}>{moodEmoji}</Typography>
              <Typography variant="caption" sx={{
                fontSize: '0.6rem', color: 'text.secondary', fontWeight: 600,
              }}>
                Energy
              </Typography>
            </Box>
            <Typography variant="caption" sx={{
              fontSize: '0.6rem', fontWeight: 700, color: energyColor,
            }}>
              {energy}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={energy}
            sx={{
              height: 3, borderRadius: 2,
              backgroundColor: alpha(energyColor, 0.10),
              '& .MuiLinearProgress-bar': {
                backgroundColor: energyColor, borderRadius: 2,
                transition: 'width 1s ease-out',
              },
            }}
          />
        </Box>


        {/* ═══════════════════════════════════════════════════════
            4 · LIVE NARRATIVE — rotating thinking phrases
            ═══════════════════════════════════════════════════════ */}
        <Box sx={{
          position: 'relative', overflow: 'hidden',
          backgroundColor: alpha(agent.color, 0.05),
          border: `1px solid ${alpha(agent.color, 0.08)}`,
          borderRadius: 2, p: 1.25, mb: 1.25,
          minHeight: compact ? 'auto' : '3em',
          display: 'flex', alignItems: 'center',
        }}>
          {/* Accent side‑bar when busy */}
          {agent.status === 'busy' && (
            <Box sx={{
              position: 'absolute', left: 0, top: 0, bottom: 0, width: 3,
              backgroundColor: agent.color, borderRadius: '2px 0 0 2px',
              animation: `${accentPulse} 2s ease-in-out infinite`,
            }} />
          )}

          <Typography
            key={agent.status === 'busy' ? phraseKey : 'static'}
            variant="caption"
            sx={{
              fontSize: '0.73rem', fontStyle: 'italic', lineHeight: 1.4,
              color: agent.status === 'busy' ? 'text.primary' : 'text.secondary',
              pl: agent.status === 'busy' ? 1 : 0,
              display: '-webkit-box',
              WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              ...(agent.status === 'busy' && {
                animation: `${fadeText} 4s ease-in-out`,
              }),
            }}
          >
            {agent.status === 'busy'    && `💭 ${narrativeText}`}
            {agent.status === 'idle'    && `😴 ${narrativeText}`}
            {agent.status === 'offline' && `⛔ ${narrativeText}`}
            {!['busy', 'idle', 'offline'].includes(agent.status) && narrativeText}
          </Typography>
        </Box>


        {/* ═══════════════════════════════════════════════════════
            5 · CONFIDENCE METER — Load bar + Autonomy badge
            ═══════════════════════════════════════════════════════ */}
        <Box sx={{ mb: compact ? 0.5 : 1 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
            {/* Left — Load label + chip */}
            <Box display="flex" alignItems="center" gap={0.5}>
              <Typography variant="caption" sx={{
                fontSize: '0.65rem', fontWeight: 600, color: 'text.secondary',
              }}>
                Load
              </Typography>
              <Chip
                label={`${agent.load}%`}
                size="small"
                sx={{
                  height: 18, fontSize: '0.65rem', fontWeight: 700,
                  backgroundColor: loadColor, color: '#fff',
                  '& .MuiChip-label': { px: 0.75 },
                }}
              />
            </Box>

            {/* Right — Autonomy badge */}
            <Tooltip title={`Autonomy Level: ${agent.autonomy}%`} arrow>
              <Chip
                label={`⚡ ${agent.autonomy}%`}
                size="small"
                sx={{
                  height: 18, fontSize: '0.65rem', fontWeight: 700,
                  backgroundColor: alpha(agent.color, 0.12),
                  color: agent.color,
                  border: `1px solid ${alpha(agent.color, 0.25)}`,
                  '& .MuiChip-label': { px: 0.75 },
                }}
              />
            </Tooltip>
          </Box>

          <LinearProgress
            variant="determinate"
            value={agent.load}
            sx={{
              height: 5, borderRadius: 3,
              backgroundColor: alpha(agent.color, 0.08),
              '& .MuiLinearProgress-bar': {
                backgroundColor: agent.color, borderRadius: 3,
                transition: 'width 0.8s ease-out',
              },
            }}
          />
        </Box>


        {/* ═══════════════════════════════════════════════════════
            6 · COLLABORATION INDICATORS — tiny overlapping circles
            ═══════════════════════════════════════════════════════ */}
        {partners.length > 0 && !compact && (
          <Box display="flex" alignItems="center" mb={1}>
            <Typography variant="caption" sx={{
              fontSize: '0.6rem', color: 'text.secondary', mr: 0.75,
            }}>
              Works with
            </Typography>

            <Box display="flex">
              {partners.map((p, i) => (
                <Tooltip key={p.id} title={p.name} arrow>
                  <Avatar sx={{
                    width: 20, height: 20,
                    fontSize: '0.55rem', fontWeight: 800,
                    ml: i > 0 ? '-6px' : 0,
                    border: `2px solid ${theme.palette.background.paper}`,
                    backgroundColor: p.color, color: '#fff',
                    zIndex: partners.length - i,
                    transition: 'transform 0.2s ease',
                    '&:hover': { transform: 'scale(1.25)', zIndex: 10 },
                  }}>
                    {p.num}
                  </Avatar>
                </Tooltip>
              ))}
              {(agent.worksWellWith || []).length > 3 && (
                <Typography variant="caption" sx={{
                  fontSize: '0.55rem', color: 'text.disabled',
                  ml: 0.5, alignSelf: 'center', fontWeight: 600,
                }}>
                  +{(agent.worksWellWith || []).length - 3}
                </Typography>
              )}
            </Box>
          </Box>
        )}


        {/* ═══════════════════════════════════════════════════════
            7 · STATS FOOTER
            ═══════════════════════════════════════════════════════ */}
        {!compact && (
          <Box
            display="flex" justifyContent="space-between" alignItems="center"
            pt={1.25}
            sx={{ borderTop: 1, borderColor: alpha(agent.color, 0.10) }}
          >
            <Tooltip title="Tasks Completed" arrow>
              <Box display="flex" alignItems="center" gap={0.5}>
                <Typography sx={{ fontSize: '0.65rem' }}>✅</Typography>
                <Typography variant="caption" sx={{
                  fontSize: '0.73rem', fontWeight: 700, color: 'text.primary',
                }}>
                  {(agent.tasksCompleted ?? 0).toLocaleString()}
                </Typography>
              </Box>
            </Tooltip>

            <Tooltip title="Avg Response Time" arrow>
              <Box display="flex" alignItems="center" gap={0.5}>
                <Typography sx={{ fontSize: '0.65rem' }}>⚡</Typography>
                <Typography variant="caption" sx={{
                  fontSize: '0.73rem', fontWeight: 600, color: 'text.secondary',
                }}>
                  {agent.avgResponseTime ?? '—'}s
                </Typography>
              </Box>
            </Tooltip>

            <Tooltip title={`Last active: ${agent.lastActive || 'unknown'}`} arrow>
              <Box display="flex" alignItems="center" gap={0.5}>
                <Typography sx={{ fontSize: '0.65rem' }}>🕐</Typography>
                <Typography variant="caption" sx={{
                  fontSize: '0.65rem', color: 'text.disabled',
                }}>
                  {agent.lastActive
                    ? new Date(agent.lastActive).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : '—'}
                </Typography>
              </Box>
            </Tooltip>
          </Box>
        )}

      </CardContent>
    </Card>
  );
};

export default AgentCard;
