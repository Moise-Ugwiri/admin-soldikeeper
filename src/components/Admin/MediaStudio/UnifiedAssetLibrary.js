import React, { useCallback, useEffect, useState } from 'react';
import {
  Drawer, Box, Typography, IconButton, List, ListItem, ListItemText, Button,
  Divider, CircularProgress, Alert, Chip, Tooltip, Stack,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import RefreshIcon from '@mui/icons-material/Refresh';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteIcon from '@mui/icons-material/Delete';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import { fetchLibrary, clearStudioBuffer, getApiUrl, getAuthHeader } from './api';

const formatBytes = (b) => (b ? `${(b / 1024 / 1024).toFixed(1)} MB` : '—');

export default function UnifiedAssetLibrary({ open, onClose }) {
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);
  const authHeader = getAuthHeader();

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchLibrary({ raw: true });
      setItems(data.files || data.videos || []);
      setMeta(data.assetLibrary || null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) load();
  }, [open, load]);

  const handleDownload = async (filename) => {
    try {
      const res = await fetch(
        `${getApiUrl()}/admin/media/library/download/${encodeURIComponent(filename)}`,
        { headers: authHeader }
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (item) => {
    if (item.canonical || item.zone === 'studio-library' || item.durable) {
      setError('Marketing / durable studio-library assets cannot be deleted here.');
      return;
    }
    if (!window.confirm(`Delete ${item.filename}?`)) return;
    try {
      const res = await fetch(
        `${getApiUrl()}/admin/media/library/${encodeURIComponent(item.filename)}`,
        { method: 'DELETE', headers: authHeader }
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setItems((prev) => prev.filter((x) => x.filename !== item.filename));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleClearBuffer = async () => {
    if (!window.confirm('Clear Studio buffer (source=studio-pack working copies only)? Marketing crops stay.')) return;
    setError(null);
    setNotice(null);
    try {
      const result = await clearStudioBuffer();
      setNotice(`Cleared ${result.removedCount || 0} studio buffer asset(s).`);
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  const stats = meta?.stats;

  return (
    <Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ sx: { width: 520 } }}>
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" fontWeight={700}>Asset Library</Typography>
        <Box>
          <Tooltip title="Refresh"><IconButton size="small" onClick={load}><RefreshIcon /></IconButton></Tooltip>
          <IconButton size="small" onClick={onClose}><CloseIcon /></IconButton>
        </Box>
      </Box>
      <Divider />
      <Box sx={{ px: 2, pt: 2 }}>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 1 }}>
          {stats && (
            <>
              <Chip size="small" label={`Buffer ${stats.count}/${stats.maxCount}`} color={stats.full ? 'warning' : 'default'} />
              <Chip size="small" variant="outlined" label={`${formatBytes(stats.totalBytes)} / ${formatBytes(stats.maxBytes)}`} />
              <Chip size="small" variant="outlined" label={`Age ≤${stats.maxAgeDays}d`} />
            </>
          )}
        </Stack>
        <Button
          size="small"
          color="warning"
          variant="outlined"
          startIcon={<DeleteSweepIcon />}
          onClick={handleClearBuffer}
          sx={{ mb: 1 }}
        >
          Clear Studio buffer
        </Button>
        <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
          Clears only studio-pack buffer copies. Never Marketing canonical crops or Keep-promoted durable paths.
        </Typography>
      </Box>
      <Divider />
      <Box sx={{ p: 2, overflow: 'auto' }}>
        {loading && <Box sx={{ textAlign: 'center', py: 4 }}><CircularProgress size={24} /></Box>}
        {notice && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setNotice(null)}>{notice}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {!loading && items.length === 0 && (
          <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
            No generated assets yet.
          </Typography>
        )}
        <List disablePadding>
          {items.map((v) => (
            <React.Fragment key={`${v.zone || 'gen'}-${v.filename}`}>
              <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                <ListItemText
                  primary={(
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                      <Typography variant="body2" fontWeight={700}>{v.title || v.compositionId}</Typography>
                      <Chip label={v.assetType || 'video'} size="small" />
                      <Chip label={formatBytes(v.sizeBytes)} size="small" variant="outlined" />
                      {v.zone && <Chip label={v.zone} size="small" color={v.zone === 'buffer' ? 'warning' : 'success'} variant="outlined" />}
                      {v.canonical && <Chip label="Marketing" size="small" color="info" />}
                      {(v.beat || v.tags?.beat) && <Chip label={v.beat || v.tags.beat} size="small" />}
                      {v.tags?.source && <Chip label={v.tags.source} size="small" variant="outlined" />}
                    </Box>
                  )}
                  secondary={(
                    <Typography variant="caption" color="text.secondary" display="block">
                      {new Date(v.createdAt).toLocaleString()} · {v.filename}
                      {v.campaignId ? ` · ${v.campaignId}` : ''}
                    </Typography>
                  )}
                />
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, ml: 1 }}>
                  <Button size="small" startIcon={<DownloadIcon />} onClick={() => handleDownload(v.filename)}>Save</Button>
                  {!v.canonical && v.zone !== 'studio-library' && (
                    <Button size="small" color="error" startIcon={<DeleteIcon />} onClick={() => handleDelete(v)}>Delete</Button>
                  )}
                </Box>
              </ListItem>
              <Divider />
            </React.Fragment>
          ))}
        </List>
      </Box>
    </Drawer>
  );
}
