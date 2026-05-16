/* eslint-disable */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Box, Typography, Skeleton, Alert, Chip } from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Orientation metadata for the phone/laptop mockup wrapper
const ORIENTATIONS = {
  TikTok: 'vertical',
  Instagram: 'square',
  YouTube: 'horizontal',
  LinkedIn: 'horizontal',
  FeatureReceipt: 'horizontal',
  FeatureBudget: 'horizontal',
  FeatureSplit: 'horizontal',
};

const PreviewPane = ({ compositionId, inputProps, authHeader }) => {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const [error, setError] = useState(null);
  const debounceRef = useRef(null);
  const abortRef = useRef(null);
  // Ref mirrors unavailable state so the debounced effect sees it synchronously
  // and stops firing requests to the server after the first 503.
  const unavailableRef = useRef(false);

  const fetchPreview = useCallback(async (compId, props) => {
    if (!compId || unavailableRef.current) return;

    // Abort previous in-flight request
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/admin/media/thumbnail`, {
        method: 'POST',
        headers: { ...authHeader, 'Content-Type': 'application/json' },
        body: JSON.stringify({ compositionId: compId, inputProps: props, frame: 90 }),
        signal: abortRef.current.signal,
      });

      if (res.status === 503) {
        unavailableRef.current = true;
        setUnavailable(true);
        return;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      setUnavailable(false);
      unavailableRef.current = false;
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setPreviewUrl(prev => {
        if (prev) URL.revokeObjectURL(prev);
        return url;
      });
    } catch (err) {
      if (err.name !== 'AbortError') setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [authHeader]);

  // Debounce: refresh preview 600ms after inputProps change.
  // Skip entirely once server has confirmed preview is unavailable (503).
  useEffect(() => {
    if (unavailableRef.current) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchPreview(compositionId, inputProps);
    }, 600);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [compositionId, inputProps, fetchPreview]);

  const orientation = ORIENTATIONS[compositionId] || 'horizontal';

  // Wrapper dimensions for mockup frame
  const frameStyle = orientation === 'vertical'
    ? { width: 160, height: 285, borderRadius: 20 }
    : orientation === 'square'
    ? { width: 240, height: 240, borderRadius: 12 }
    : { width: 320, height: 180, borderRadius: 8 };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', fontSize: 11, letterSpacing: 1 }}>
          Preview
        </Typography>
        {loading && <Chip icon={<RefreshIcon sx={{ fontSize: 14 }} />} label="Updating…" size="small" sx={{ fontSize: 10 }} />}
      </Box>

      {/* Mockup frame */}
      <Box sx={{
        ...frameStyle,
        border: '2px solid',
        borderColor: 'divider',
        overflow: 'hidden',
        bgcolor: '#0f172a',
        position: 'relative',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
      }}>
        {loading && !previewUrl && (
          <Skeleton variant="rectangular" width="100%" height="100%" sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />
        )}
        {previewUrl && (
          <img
            src={previewUrl}
            alt="Video preview"
            style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: loading ? 0.6 : 1, transition: 'opacity 0.2s' }}
          />
        )}
        {unavailable && (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', p: 2, textAlign: 'center' }}>
            <Typography variant="caption" color="rgba(255,255,255,0.5)">
              Preview requires local Remotion setup
            </Typography>
          </Box>
        )}
      </Box>

      {error && !unavailable && (
        <Alert severity="warning" sx={{ fontSize: 12 }}>Preview unavailable: {error}</Alert>
      )}
    </Box>
  );
};

export default PreviewPane;
