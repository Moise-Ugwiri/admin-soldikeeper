/* eslint-disable */
import React, { useState, useEffect, useRef } from 'react';
import { Box } from '@mui/material';
import { Image as ImageIcon } from '@mui/icons-material';

/** Fetches an authenticated scene thumbnail and displays it as a blob URL. */
const SceneImage = ({ url, authHeader, height = 120 }) => {
  const [blobUrl, setBlobUrl] = useState(null);
  const [failed, setFailed] = useState(false);
  const blobRef = useRef(null);

  useEffect(() => {
    if (!url) return undefined;
    let cancelled = false;

    fetch(url, { headers: authHeader })
      .then((r) => (r.ok ? r.blob() : Promise.reject()))
      .then((blob) => {
        if (cancelled) return;
        if (blobRef.current) URL.revokeObjectURL(blobRef.current);
        const u = URL.createObjectURL(blob);
        blobRef.current = u;
        setBlobUrl(u);
        setFailed(false);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
      if (blobRef.current) {
        URL.revokeObjectURL(blobRef.current);
        blobRef.current = null;
      }
    };
  }, [url, authHeader]);

  if (blobUrl) {
    return (
      <Box
        component="img"
        src={blobUrl}
        alt=""
        sx={{ width: '100%', height, objectFit: 'cover', display: 'block' }}
      />
    );
  }

  return (
    <Box sx={{
      height,
      bgcolor: 'action.hover',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: failed ? undefined : 'linear-gradient(135deg, #8b5cf620, #3b82f620)',
    }}>
      <ImageIcon sx={{ color: '#8b5cf6', fontSize: 40, opacity: 0.5 }} />
    </Box>
  );
};

export default SceneImage;