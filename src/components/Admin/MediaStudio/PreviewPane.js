/* eslint-disable */
import React, { useEffect, useRef, useState } from 'react';
import { Box, Typography, Chip, CircularProgress } from '@mui/material';
import { fetchThumbnail, fetchMediaHealth } from './api';

const TEMPLATE_META = {
  TikTok:        { orientation: 'vertical',    accent: '#fe2c55', label: 'TikTok · 9:16',     icon: '🎵' },
  Instagram:     { orientation: 'square',      accent: '#e1306c', label: 'Instagram · 1:1',   icon: '📸' },
  YouTube:       { orientation: 'horizontal',  accent: '#ff0000', label: 'YouTube · 16:9',    icon: '▶️' },
  LinkedIn:      { orientation: 'horizontal',  accent: '#0a66c2', label: 'LinkedIn · 16:9',   icon: '💼' },
  FeatureReceipt:{ orientation: 'horizontal',  accent: '#10b981', label: 'Receipt Scan · 16:9', icon: '🧾' },
  FeatureBudget: { orientation: 'horizontal',  accent: '#6366f1', label: 'Budget · 16:9',     icon: '💰' },
  FeatureSplit:  { orientation: 'horizontal',  accent: '#f59e0b', label: 'SplitSmart · 16:9', icon: '🤝' },
  TutorialWalkthrough: { orientation: 'horizontal', accent: '#6366f1', label: 'Tutorial · 16:9', icon: '📚' },
  FeatureQuickTip: { orientation: 'vertical', accent: '#f59e0b', label: 'Quick Tip · 9:16', icon: '💡' },
};

const FRAME_SIZES = {
  vertical:   { width: 160, height: 285, borderRadius: 20 },
  square:     { width: 240, height: 240, borderRadius: 12 },
  horizontal: { width: 320, height: 180, borderRadius: 8  },
};

function StaticMockup({ meta, hook, subtitle, accentColor, frame }) {
  return (
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
        {hook.length > 60 ? `${hook.slice(0, 57)}…` : hook}
      </Typography>
      {subtitle && (
        <Typography variant="caption" sx={{
          color: 'rgba(255,255,255,0.55)',
          textAlign: 'center',
          fontSize: 10,
          lineHeight: 1.3,
          px: 0.5,
        }}>
          {subtitle.length > 80 ? `${subtitle.slice(0, 77)}…` : subtitle}
        </Typography>
      )}
      <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, bgcolor: accentColor, opacity: 0.5 }} />
    </Box>
  );
}

const PreviewPane = ({ compositionId, inputProps }) => {
  const meta = TEMPLATE_META[compositionId] || TEMPLATE_META.YouTube;
  const frameSize = FRAME_SIZES[meta.orientation];
  const hook = inputProps?.hook || 'Your headline here';
  const subtitle = inputProps?.subtitle || '';
  const accentColor = inputProps?.accentColor || meta.accent;

  const [livePreviewEnabled, setLivePreviewEnabled] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const blobRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    fetchMediaHealth()
      .then((health) => {
        if (!cancelled) {
          setLivePreviewEnabled(Boolean(health?.checks?.livePreview?.ok));
        }
      })
      .catch(() => {
        if (!cancelled) setLivePreviewEnabled(false);
      });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (livePreviewEnabled !== true) return undefined;
    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const blob = await fetchThumbnail(compositionId, inputProps || {}, 30);
        if (blobRef.current) URL.revokeObjectURL(blobRef.current);
        const url = URL.createObjectURL(blob);
        blobRef.current = url;
        setPreviewUrl(url);
      } catch {
        setPreviewUrl(null);
      } finally {
        setLoading(false);
      }
    }, 600);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [compositionId, JSON.stringify(inputProps), livePreviewEnabled]);

  useEffect(() => () => {
    if (blobRef.current) URL.revokeObjectURL(blobRef.current);
  }, []);

  const showLive = livePreviewEnabled === true;
  const showStatic = livePreviewEnabled === false;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="subtitle2" color="text.secondary"
          sx={{ fontWeight: 600, textTransform: 'uppercase', fontSize: 11, letterSpacing: 1 }}>
          Preview
        </Typography>
        <Chip label={meta.label} size="small" sx={{ fontSize: 10, bgcolor: accentColor, color: '#fff' }} />
      </Box>

      {livePreviewEnabled === null && (
        <Box sx={{ ...frameSize, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CircularProgress size={24} sx={{ color: accentColor }} />
        </Box>
      )}

      {showLive && (
        <Box sx={{
          ...frameSize,
          border: '2px solid',
          borderColor: 'divider',
          overflow: 'hidden',
          bgcolor: '#0f172a',
          position: 'relative',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, bgcolor: accentColor, zIndex: 2 }} />
          {loading && <CircularProgress size={28} sx={{ color: accentColor }} />}
          {!loading && previewUrl && (
            <Box
              component="img"
              src={previewUrl}
              alt="Composition preview"
              sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          )}
          {!loading && !previewUrl && (
            <StaticMockup meta={meta} hook={hook} subtitle={subtitle} accentColor={accentColor} frame={{ width: '100%', height: '100%', borderRadius: 0, border: 'none', boxShadow: 'none', p: 2 }} />
          )}
        </Box>
      )}

      {showStatic && livePreviewEnabled !== null && (
        <StaticMockup meta={meta} hook={hook} subtitle={subtitle} accentColor={accentColor} frame={frameSize} />
      )}

      <Typography variant="caption" color="text.disabled" sx={{ fontSize: 10, textAlign: 'center' }}>
        {showLive && previewUrl
          ? 'Live Remotion frame preview'
          : 'Layout preview — full render available after Generate'}
      </Typography>
    </Box>
  );
};

export default PreviewPane;