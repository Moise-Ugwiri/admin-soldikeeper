/* eslint-disable */
import React from 'react';
import {
  Box, TextField, Typography, FormGroup, FormControlLabel, Checkbox,
  ToggleButtonGroup, ToggleButton, Stack, Button, Tooltip
} from '@mui/material';
import { AutoAwesome as AIIcon } from '@mui/icons-material';

const ALL_FEATURES = ['Receipt OCR', 'Smart Budgets', 'SplitSmart', 'AI Insights', 'Multi-currency', 'Analytics'];
const THEMES = ['green', 'blue', 'violet', 'amber'];
const TONES = ['energetic', 'professional', 'friendly', 'urgent'];

const BRAND_COLORS = {
  green: '#10b981',
  blue: '#3b82f6',
  violet: '#8b5cf6',
  amber: '#f59e0b',
};

const ContentEditor = ({ inputProps, onPropsChange, onOpenAI }) => {
  const set = (field, value) => onPropsChange({ ...inputProps, [field]: value });

  const toggleFeature = (feat) => {
    const cur = inputProps.features || [];
    const next = cur.includes(feat) ? cur.filter(f => f !== feat) : [...cur, feat];
    set('features', next);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', fontSize: 11, letterSpacing: 1 }}>
        Content
      </Typography>

      {/* AI Button */}
      <Button
        variant="outlined"
        size="small"
        startIcon={<AIIcon />}
        onClick={onOpenAI}
        sx={{ alignSelf: 'flex-start', borderColor: '#10b981', color: '#10b981', '&:hover': { borderColor: '#059669', bgcolor: 'rgba(16,185,129,0.05)' } }}
      >
        Generate with AI
      </Button>

      <TextField
        label="Hook / Headline"
        value={inputProps.hook || ''}
        onChange={e => set('hook', e.target.value)}
        inputProps={{ maxLength: 60 }}
        helperText={`${(inputProps.hook || '').length}/60`}
        size="small"
        fullWidth
      />

      <TextField
        label="Subtitle"
        value={inputProps.subtitle || ''}
        onChange={e => set('subtitle', e.target.value)}
        inputProps={{ maxLength: 80 }}
        helperText={`${(inputProps.subtitle || '').length}/80`}
        size="small"
        fullWidth
      />

      <TextField
        label="CTA Text"
        value={inputProps.ctaText || ''}
        onChange={e => set('ctaText', e.target.value)}
        size="small"
        fullWidth
      />

      {/* Features */}
      <Box>
        <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5, fontWeight: 600 }}>
          Features to highlight
        </Typography>
        <FormGroup row>
          {ALL_FEATURES.map(f => (
            <FormControlLabel
              key={f}
              control={
                <Checkbox
                  size="small"
                  checked={(inputProps.features || []).includes(f)}
                  onChange={() => toggleFeature(f)}
                  sx={{ '&.Mui-checked': { color: '#10b981' } }}
                />
              }
              label={<Typography variant="caption">{f}</Typography>}
              sx={{ mr: 1 }}
            />
          ))}
        </FormGroup>
      </Box>

      {/* Theme */}
      <Box>
        <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5, fontWeight: 600 }}>
          Color Theme
        </Typography>
        <Stack direction="row" spacing={1}>
          {THEMES.map(t => (
            <Tooltip key={t} title={t}>
              <Box
                onClick={() => { set('theme', t); set('accentColor', BRAND_COLORS[t]); }}
                sx={{
                  width: 28, height: 28, borderRadius: '50%',
                  bgcolor: BRAND_COLORS[t],
                  cursor: 'pointer',
                  border: inputProps.theme === t ? '3px solid white' : '2px solid transparent',
                  boxShadow: inputProps.theme === t ? `0 0 0 2px ${BRAND_COLORS[t]}` : 'none',
                  transition: 'all 0.15s',
                }}
              />
            </Tooltip>
          ))}
        </Stack>
      </Box>

      {/* Tone */}
      <Box>
        <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5, fontWeight: 600 }}>
          Tone
        </Typography>
        <ToggleButtonGroup
          value={inputProps.tone || 'energetic'}
          exclusive
          onChange={(_, val) => val && set('tone', val)}
          size="small"
          sx={{ flexWrap: 'wrap' }}
        >
          {TONES.map(t => (
            <ToggleButton key={t} value={t} sx={{ textTransform: 'capitalize', fontSize: 12 }}>
              {t}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Box>
    </Box>
  );
};

export default ContentEditor;
