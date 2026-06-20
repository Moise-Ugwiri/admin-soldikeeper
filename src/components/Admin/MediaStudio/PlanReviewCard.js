import React, { useEffect, useState } from 'react';
import {
  Box, Paper, Typography, Chip, Stack, FormControl, InputLabel, Select, MenuItem, TextField, Alert,
} from '@mui/material';
import { fetchMusicTracks } from './api';

const ASSET_LABELS = {
  video_remotion: 'Animated video (Remotion)',
  video_ai: 'AI slideshow video',
  poster: 'Poster (1080×1080)',
  flyer: 'Flyer (1080×1920)',
  banner: 'Banner',
  thumbnail: 'Thumbnail',
};

export default function PlanReviewCard({ plan, onChange, fromFallback }) {
  const [musicTracks, setMusicTracks] = useState([]);

  useEffect(() => {
    if (plan?.pipeline === 'ai_video') {
      fetchMusicTracks().then(setMusicTracks).catch(() => {});
    }
  }, [plan?.pipeline]);

  if (!plan) return null;

  const update = (patch) => onChange({ ...plan, ...patch });
  const updateStatic = (patch) => onChange({
    ...plan,
    staticSpec: { ...plan.staticSpec, ...patch },
  });
  const updateAiVideo = (patch) => onChange({
    ...plan,
    aiVideoSpec: { ...plan.aiVideoSpec, ...patch },
  });

  return (
    <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
      {fromFallback && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          AI planner used a rule-based fallback. Review the plan before generating.
        </Alert>
      )}

      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
        <Chip label={ASSET_LABELS[plan.assetType] || plan.assetType} color="primary" />
        <Chip label={plan.purpose || 'marketing'} variant="outlined" />
        <Chip label={plan.platform || 'general'} variant="outlined" />
        <Chip label={plan.pipeline} size="small" />
      </Stack>

      {plan.rationale && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {plan.rationale}
        </Typography>
      )}

      {plan.pipeline === 'remotion' && (
        <Stack spacing={2}>
          <FormControl size="small" fullWidth>
            <InputLabel>Composition</InputLabel>
            <Select
              value={plan.compositionId || 'TikTok'}
              label="Composition"
              onChange={(e) => update({ compositionId: e.target.value })}
            >
              {['TikTok', 'Instagram', 'YouTube', 'LinkedIn', 'FeatureReceipt', 'FeatureBudget', 'FeatureSplit', 'TutorialWalkthrough', 'FeatureQuickTip'].map((c) => (
                <MenuItem key={c} value={c}>{c}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField size="small" label="Hook" value={plan.inputProps?.hook || ''}
            onChange={(e) => update({ inputProps: { ...plan.inputProps, hook: e.target.value } })} fullWidth />
          <TextField size="small" label="Subtitle" value={plan.inputProps?.subtitle || ''}
            onChange={(e) => update({ inputProps: { ...plan.inputProps, subtitle: e.target.value } })} fullWidth />
        </Stack>
      )}

      {plan.pipeline === 'static_html' && (
        <Stack spacing={2}>
          <FormControl size="small" fullWidth>
            <InputLabel>Template</InputLabel>
            <Select
              value={plan.staticSpec?.templateId || 'poster_hero'}
              label="Template"
              onChange={(e) => updateStatic({ templateId: e.target.value })}
            >
              <MenuItem value="poster_hero">Poster (square)</MenuItem>
              <MenuItem value="flyer_vertical">Flyer (vertical)</MenuItem>
              <MenuItem value="banner_linkedin">LinkedIn banner</MenuItem>
            </Select>
          </FormControl>
          <TextField size="small" label="Headline" value={plan.staticSpec?.headline || ''}
            onChange={(e) => updateStatic({ headline: e.target.value })} fullWidth />
          <TextField size="small" label="Subhead" value={plan.staticSpec?.subhead || ''}
            onChange={(e) => updateStatic({ subhead: e.target.value })} fullWidth multiline rows={2} />
          <TextField size="small" label="CTA" value={plan.staticSpec?.cta || ''}
            onChange={(e) => updateStatic({ cta: e.target.value })} fullWidth />
        </Stack>
      )}

      {plan.pipeline === 'ai_video' && (
        <Stack spacing={2}>
          <Typography variant="body2">
            <strong>Brief:</strong> {plan.aiVideoSpec?.brief || plan.staticSpec?.headline}
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block">
            Dynamic word-by-word captions · crossfade transitions · background music
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Chip size="small" label={`${plan.aiVideoSpec?.sceneCount || 5} scenes`} />
            <Chip size="small" label={`${plan.aiVideoSpec?.totalDuration || 30}s`} />
            <Chip size="small" label={plan.aiVideoSpec?.contentType || 'promotional'} />
          </Stack>
          <FormControl size="small" fullWidth>
            <InputLabel>Background music</InputLabel>
            <Select
              value={plan.aiVideoSpec?.musicTrack || ''}
              label="Background music"
              onChange={(e) => updateAiVideo({ musicTrack: e.target.value })}
            >
              {musicTracks.map((t) => (
                <MenuItem key={t.filename} value={t.filename}>
                  {t.label || t.filename}{t.mood ? ` · ${t.mood}` : ''}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" fullWidth>
            <InputLabel>Content type</InputLabel>
            <Select
              value={plan.aiVideoSpec?.contentType || 'promotional'}
              label="Content type"
              onChange={(e) => updateAiVideo({ contentType: e.target.value })}
            >
              <MenuItem value="promotional">Promotional</MenuItem>
              <MenuItem value="educational">Educational</MenuItem>
              <MenuItem value="feature_tutorial">Feature tutorial</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      )}
    </Paper>
  );
}