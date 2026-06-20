/* eslint-disable */
import React, { useEffect, useRef, useState } from 'react';
import { Box, Typography, Chip, CircularProgress } from '@mui/material';
import { fetchThumbnail } from './api';

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
  const accentColor = inputProps?.accentColor || meta.accent;

  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const blobRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const blob = await fetchThumbnail(compositionId, inputProps || {}, 30);
        if (blobRef.current) URL.revokeObjectURL(blobRef.current);
        const url = URL.createObjectURL(blob);
        blobRef.current = url;
        setPreviewUrl(url);
      } catch (err) {
        setPreviewUrl(null);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }, 600);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [compositionId, JSON.stringify(inputProps)]);

  useEffect(() => () => {
    if (blobRef.current) URL.revokeObjectURL(blobRef.current);
  }, []);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="subtitle2" color="text.secondary"
          sx={{ fontWeight: 600, textTransform: 'uppercase', fontSize: 11, letterSpacing: 1 }}>
          Preview
        </Typography>
        <Chip label={meta.label} size="small" sx={{ fontSize: 10, bgcolor: accentColor, color: '#fff' }} />
      </Box>

      <Box sx={{
        ...frame,
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

        {!loading && !previewUrl && !error && (
          <Box sx={{ textAlign: 'center', p: 2 }}>
            <Typography sx={{ fontSize: 28 }}>{meta.icon}</Typography>
            <Typography variant="caption" sx={{ color: '#fff', fontWeight: 700, fontSize: 11, display: 'block', mt: 1 }}>
              {hook.length > 60 ? `${hook.slice(0, 57)}…` : hook}
            </Typography>
          </Box>
        )}
      </Box>

      {error && (
        <Typography variant="caption" color="text.disabled" sx={{ fontSize: 10, textAlign: 'center' }}>
          Live preview unavailable — {error}
        </Typography>
      )}
      {!error && !loading && previewUrl && (
        <Typography variant="caption" color="text.disabled" sx={{ fontSize: 10, textAlign: 'center' }}>
          Live Remotion frame preview
        </Typography>
      )}
    </Box>
  );
};

export default PreviewPane;