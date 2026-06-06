/* eslint-disable */
import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';

/**
 * Authenticated inline MP4 preview — fetches with Bearer token and plays via blob URL.
 */
const VideoPreview = ({ url, authHeader, label = 'Preview' }) => {
  const [blobUrl, setBlobUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const blobRef = useRef(null);

  useEffect(() => {
    if (!url) return undefined;
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch(url, { headers: authHeader })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.blob();
      })
      .then((blob) => {
        if (cancelled) return;
        if (blobRef.current) URL.revokeObjectURL(blobRef.current);
        const u = URL.createObjectURL(blob);
        blobRef.current = u;
        setBlobUrl(u);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
      if (blobRef.current) {
        URL.revokeObjectURL(blobRef.current);
        blobRef.current = null;
      }
    };
  }, [url, authHeader]);

  if (!url) return null;

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, mb: 1, display: 'block' }}>
        {label}
      </Typography>
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
          <CircularProgress size={24} />
        </Box>
      )}
      {error && (
        <Typography variant="caption" color="error">Preview unavailable: {error}</Typography>
      )}
      {blobUrl && !loading && (
        <Box
          component="video"
          src={blobUrl}
          controls
          sx={{ width: '100%', maxHeight: 360, borderRadius: 2, bgcolor: '#000' }}
        />
      )}
    </Box>
  );
};

export default VideoPreview;