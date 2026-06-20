import React, { useCallback, useEffect, useState } from 'react';
import {
  Box, Button, Typography, Stack, TextField,
  IconButton, CircularProgress, Alert,
} from '@mui/material';
import UploadIcon from '@mui/icons-material/Upload';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import ScreenshotMonitorIcon from '@mui/icons-material/ScreenshotMonitor';
import { listBrandAssets, uploadBrandAsset, deleteBrandAsset, getApiUrl, fetchScreenshotCatalog, captureAppScreenshots } from './api';
import BrandAssetThumb from './BrandAssetThumb';

export default function BrandAssetManager({ selectedIds = [], onSelectionChange }) {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [label, setLabel] = useState('');
  const [catalog, setCatalog] = useState([]);
  const [liveCapture, setLiveCapture] = useState(false);
  const [capturing, setCapturing] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setAssets(await listBrandAssets());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    fetchScreenshotCatalog()
      .then((data) => {
        setCatalog(data.screens || []);
        setLiveCapture(Boolean(data.liveCaptureAvailable));
      })
      .catch(() => {});
  }, []);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await uploadBrandAsset(file, { label: label || file.name, usage: 'screenshot' });
      setLabel('');
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const toggleSelect = (id) => {
    if (!onSelectionChange) return;
    const next = selectedIds.includes(id)
      ? selectedIds.filter((x) => x !== id)
      : [...selectedIds, id];
    onSelectionChange(next);
  };

  const handleCapture = async (screenId) => {
    setCapturing(true);
    setError(null);
    try {
      const result = await captureAppScreenshots({ screenIds: [screenId], forceLive: liveCapture });
      const ids = (result.assets || []).map((a) => a.id);
      if (ids.length && onSelectionChange) {
        onSelectionChange([...new Set([...selectedIds, ...ids])]);
      }
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setCapturing(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this brand asset?')) return;
    try {
      await deleteBrandAsset(id);
      onSelectionChange?.(selectedIds.filter((x) => x !== id));
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
        <Typography variant="subtitle2" fontWeight={700}>Brand Assets (screenshots & logos)</Typography>
        <IconButton size="small" onClick={load}><RefreshIcon fontSize="small" /></IconButton>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 1 }} onClose={() => setError(null)}>{error}</Alert>}

      <Stack direction="row" spacing={1} sx={{ mb: 1.5 }}>
        <TextField size="small" label="Label" value={label} onChange={(e) => setLabel(e.target.value)} sx={{ flex: 1 }} />
        <Button component="label" variant="outlined" startIcon={uploading ? <CircularProgress size={16} /> : <UploadIcon />} disabled={uploading}>
          Upload
          <input type="file" accept="image/*" hidden onChange={handleUpload} />
        </Button>
      </Stack>

      {catalog.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.75 }}>
            Capture real SoldiKeeper UI {liveCapture ? '(live app)' : '(catalog fallback — set MEDIA_DEMO_EMAIL on server for live)'}
          </Typography>
          <Stack direction="row" spacing={0.75} sx={{ flexWrap: 'wrap', gap: 0.75 }}>
            {catalog.map((screen) => (
              <Button
                key={screen.id}
                size="small"
                variant="outlined"
                disabled={capturing}
                startIcon={capturing ? <CircularProgress size={14} /> : <ScreenshotMonitorIcon />}
                onClick={() => handleCapture(screen.id)}
                sx={{ textTransform: 'none' }}
              >
                {screen.label}
              </Button>
            ))}
          </Stack>
        </Box>
      )}

      {loading ? (
        <Box sx={{ textAlign: 'center', py: 2 }}><CircularProgress size={22} /></Box>
      ) : (
        <Stack spacing={1}>
          {assets.length === 0 && (
            <Typography variant="body2" color="text.secondary">
              Capture from the app above, or upload screenshots — otherwise Media Studio auto-captures matching screens when you generate.
            </Typography>
          )}
          {assets.map((a) => {
            const selected = selectedIds.includes(a.id);
            const thumbUrl = `${getApiUrl()}/admin/media/assets/${a.id}/file`;
            return (
              <Box
                key={a.id}
                onClick={() => toggleSelect(a.id)}
                sx={{
                  display: 'flex', alignItems: 'center', gap: 1.5, p: 1, borderRadius: 2,
                  border: '2px solid',
                  borderColor: selected ? '#10b981' : 'divider',
                  cursor: onSelectionChange ? 'pointer' : 'default',
                }}
              >
                <BrandAssetThumb url={thumbUrl} alt={a.label} />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="body2" fontWeight={600} noWrap>{a.label}</Typography>
                  <Typography variant="caption" color="text.secondary">{a.width}×{a.height} · {a.usage}</Typography>
                </Box>
                <IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); handleDelete(a.id); }}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            );
          })}
        </Stack>
      )}
    </Box>
  );
}