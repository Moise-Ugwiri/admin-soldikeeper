import React, { useEffect, useRef, useState } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { getAuthHeader } from './api';

export default function BrandAssetThumb({ url, alt }) {
  const [blobUrl, setBlobUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const blobRef = useRef(null);

  useEffect(() => {
    if (!url) return undefined;
    let cancelled = false;
    setLoading(true);

    fetch(url, { headers: getAuthHeader() })
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
      .catch(() => {
        if (!cancelled) setBlobUrl(null);
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
  }, [url]);

  if (loading) {
    return (
      <Box sx={{ width: 56, height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#111', borderRadius: 1 }}>
        <CircularProgress size={18} />
      </Box>
    );
  }

  if (!blobUrl) {
    return <Box sx={{ width: 56, height: 56, bgcolor: '#111', borderRadius: 1 }} />;
  }

  return (
    <Box
      component="img"
      src={blobUrl}
      alt={alt}
      sx={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 1, bgcolor: '#111' }}
    />
  );
}