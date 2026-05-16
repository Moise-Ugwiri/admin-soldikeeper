/* eslint-disable */
import React from 'react';
import { Box, Typography, Chip } from '@mui/material';

// Static accent colours per template
const TEMPLATE_META = {
  TikTok:        { orientation: 'vertical',    accent: '#fe2c55', label: 'TikTok · 9:16',     icon: '🎵' },
  Instagram:     { orientation: 'square',      accent: '#e1306c', label: 'Instagram · 1:1',   icon: '📸' },
  YouTube:       { orientation: 'horizontal',  accent: '#ff0000', label: 'YouTube · 16:9',    icon: '▶️' },
  LinkedIn:      { orientation: 'horizontal',  accent: '#0a66c2', label: 'LinkedIn · 16:9',   icon: '💼' },
  FeatureReceipt:{ orientation: 'horizontal',  accent: '#10b981', label: 'Receipt Scan · 16:9', icon: '🧾' },
  FeatureBudget: { orientation: 'horizontal',  accent: '#6366f1', label: 'Budget · 16:9',     icon: '💰' },
  FeatureSplit:  { orientation: 'horizontal',  accent: '#f59e0b', label: 'SplitSmart · 16:9', icon: '🤝' },
};

const FRAME_SIZES = {
  vertical:   { width: 160, height: 285, borderRadius: 20 },
  square:     { width: 240, height: 240, borderRadius: 12 },
  horizontal: { width: 320, height: 180, borderRadius: 8  },
};

const PreviewPane = ({ compositionId, inputProps }) => {
  const meta = TEMPLATE_META[compositionId] || TEMPLATE_META.YouTube;
  const frame = FRAME_SIZES[meta.orientation];
  const hook = inputProps?.hook || 'Your headline here';
  const subtitle = inputProps?.subtitle || 'Subtitle text';
  const accentColor = inputProps?.accentColor || meta.accent;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="subtitle2" color="text.secondary"
          sx={{ fontWeight: 600, textTransform: 'uppercase', fontSize: 11, letterSpacing: 1 }}>
          Preview
        </Typography>
        <Chip label={meta.label} size="small" sx={{ fontSize: 10, bgcolor: accentColor, color: '#fff' }} />
      </Box>

      {/* Static mockup frame */}
      <Box sx={{
        ...frame,
        border: '2px solid',
        borderColor: 'divider',
        overflow: 'hidden',
        bgcolor: '#0f172a',
        position: 'relative',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1,
        p: 2,
      }}>
        {/* Accent bar at top */}
        <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, bgcolor: accentColor }} />

        <Typography sx={{ fontSize: 28 }}>{meta.icon}</Typography>

        <Typography variant="caption" sx={{
          color: '#fff',
          fontWeight: 700,
          textAlign: 'center',
          fontSize: meta.orientation === 'vertical' ? 11 : 13,
          lineHeight: 1.3,
          px: 0.5,
        }}>
          {hook.length > 60 ? hook.slice(0, 57) + '…' : hook}
        </Typography>

        {subtitle && (
          <Typography variant="caption" sx={{
            color: 'rgba(255,255,255,0.55)',
            textAlign: 'center',
            fontSize: 10,
            lineHeight: 1.3,
            px: 0.5,
          }}>
            {subtitle.length > 80 ? subtitle.slice(0, 77) + '…' : subtitle}
          </Typography>
        )}

        {/* Accent bar at bottom */}
        <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, bgcolor: accentColor, opacity: 0.5 }} />
      </Box>

      <Typography variant="caption" color="text.disabled" sx={{ fontSize: 10, textAlign: 'center' }}>
        Live preview available after rendering
      </Typography>
    </Box>
  );
};

export default PreviewPane;
