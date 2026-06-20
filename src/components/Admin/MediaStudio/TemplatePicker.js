/* eslint-disable */
import React from 'react';
import { Box, Card, CardActionArea, Typography, Chip, Stack } from '@mui/material';

const TEMPLATES = [
  { id: 'TikTok',         platform: 'TikTok',     duration: '30s', resolution: '1080×1920', color: '#000000', emoji: '🎵', orientation: 'vertical' },
  { id: 'Instagram',      platform: 'Instagram',  duration: '15s', resolution: '1080×1080', color: '#E1306C', emoji: '📸', orientation: 'square' },
  { id: 'YouTube',        platform: 'YouTube',    duration: '60s', resolution: '1920×1080', color: '#FF0000', emoji: '▶️', orientation: 'horizontal' },
  { id: 'LinkedIn',       platform: 'LinkedIn',   duration: '45s', resolution: '1920×1080', color: '#0A66C2', emoji: '💼', orientation: 'horizontal' },
  { id: 'FeatureReceipt', platform: 'Receipts',   duration: '25s', resolution: '1920×1080', color: '#00897B', emoji: '📸', orientation: 'horizontal' },
  { id: 'FeatureBudget',  platform: 'Budgets',    duration: '25s', resolution: '1920×1080', color: '#00897B', emoji: '🎯', orientation: 'horizontal' },
  { id: 'FeatureSplit',   platform: 'Split Bills',duration: '25s', resolution: '1920×1080', color: '#00897B', emoji: '🤝', orientation: 'horizontal' },
  { id: 'TutorialWalkthrough', platform: 'Tutorial', duration: '45s', resolution: '1920×1080', color: '#6366F1', emoji: '📚', orientation: 'horizontal' },
  { id: 'FeatureQuickTip', platform: 'Quick Tip', duration: '20s', resolution: '1080×1920', color: '#F59E0B', emoji: '💡', orientation: 'vertical' },
];

const TemplatePicker = ({ selected, onSelect }) => {
  return (
    <Box>
      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, fontWeight: 600, textTransform: 'uppercase', fontSize: 11, letterSpacing: 1 }}>
        Choose Template
      </Typography>
      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
        {TEMPLATES.map((t) => (
          <Card
            key={t.id}
            variant="outlined"
            sx={{
              width: 100,
              cursor: 'pointer',
              border: selected === t.id ? `2px solid #10b981` : `1px solid`,
              borderColor: selected === t.id ? '#10b981' : 'divider',
              borderTop: `3px solid ${t.color}`,
              boxShadow: selected === t.id ? '0 0 0 1px #10b981' : 'none',
              transition: 'all 0.2s',
            }}
          >
            <CardActionArea onClick={() => onSelect(t.id)} sx={{ p: 1.5, textAlign: 'center' }}>
              <Typography sx={{ fontSize: 24, mb: 0.5 }}>{t.emoji}</Typography>
              <Typography variant="caption" fontWeight={700} display="block" noWrap>{t.platform}</Typography>
              <Typography variant="caption" color="text.secondary" display="block">{t.duration}</Typography>
            </CardActionArea>
          </Card>
        ))}
      </Stack>
    </Box>
  );
};

export { TEMPLATES };
export default TemplatePicker;
