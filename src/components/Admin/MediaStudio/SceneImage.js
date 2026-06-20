/* eslint-disable */
import React, { useState, useEffect, useRef } from 'react';
import { Box } from '@mui/material';
import { Image as ImageIcon } from '@mui/icons-material';

/** Fetches an authenticated scene thumbnail and displays it as a blob URL. */
const SceneImage = ({ url, authHeader, height = 120, retryWhileGenerating = false }) => {
  const [blobUrl, setBlobUrl] = useState(null);
  const [failed, setFailed] = useState(false);
  const blobRef = useRef(null);
  const retryRef = useRef(null);

  useEffect(() => {
    if (!url) {
      setBlobUrl(null);
      setFailed(false);
      return undefined;
    }

    let cancelled = false;
    let attempt = 0;

    const load = () => {
      fetch(url, { headers: authHeader })
        .then((r) => (r.ok ? r.blob() : Promise.reject(new Error(String(r.status)))))
        .then((blob) => {
          if (cancelled) return;
          if (blobRef.current) URL.revokeObjectURL(blobRef.current);
          const u = URL.createObjectURL(blob);
          blobRef.current = u;
          setBlobUrl(u);
          setFailed(false);
        })
        .catch(() => {
          if (cancelled) return;
          if (retryWhileGenerating && attempt < 12) {
            attempt += 1;
            retryRef.current = setTimeout(load, 2000);
            return;
          }
          setFailed(true);
          setBlobUrl(null);
        });
    };

    load();

    return () => {
      cancelled = true;
      if (retryRef.current) clearTimeout(retryRef.current);
      if (blobRef.current) {
        URL.revokeObjectURL(blobRef.current);
        blobRef.current = null;
      }
    };
  }, [url, authHeader, retryWhileGenerating]);

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