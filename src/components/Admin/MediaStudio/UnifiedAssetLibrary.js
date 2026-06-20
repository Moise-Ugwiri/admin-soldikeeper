import React, { useCallback, useEffect, useState } from 'react';
import {
  Drawer, Box, Typography, IconButton, List, ListItem, ListItemText, Button,
  Divider, CircularProgress, Alert, Chip, Tooltip,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import RefreshIcon from '@mui/icons-material/Refresh';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteIcon from '@mui/icons-material/Delete';
import { fetchLibrary, getApiUrl, getAuthHeader } from './api';

const formatBytes = (b) => (b ? `${(b / 1024 / 1024).toFixed(1)} MB` : '—');

export default function UnifiedAssetLibrary({ open, onClose }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const authHeader = getAuthHeader();

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setItems(await fetchLibrary());
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

  const handleDelete = async (filename) => {
    if (!window.confirm(`Delete ${filename}?`)) return;
    try {
      const res = await fetch(
        `${getApiUrl()}/admin/media/library/${encodeURIComponent(filename)}`,
        { method: 'DELETE', headers: authHeader }
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setItems((prev) => prev.filter((x) => x.filename !== filename));
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ sx: { width: 480 } }}>
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" fontWeight={700}>Asset Library</Typography>
        <Box>
          <Tooltip title="Refresh"><IconButton size="small" onClick={load}><RefreshIcon /></IconButton></Tooltip>
          <IconButton size="small" onClick={onClose}><CloseIcon /></IconButton>
        </Box>
      </Box>
      <Divider />
      <Box sx={{ p: 2, overflow: 'auto' }}>
        {loading && <Box sx={{ textAlign: 'center', py: 4 }}><CircularProgress size={24} /></Box>}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {!loading && items.length === 0 && (
          <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
            No generated assets yet.
          </Typography>
        )}
        <List disablePadding>
          {items.map((v) => (
            <React.Fragment key={v.filename}>
              <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                <ListItemText
                  primary={(
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                      <Typography variant="body2" fontWeight={700}>{v.title || v.compositionId}</Typography>
                      <Chip label={v.assetType || 'video'} size="small" />
                      <Chip label={formatBytes(v.sizeBytes)} size="small" variant="outlined" />
                    </Box>
                  )}
                  secondary={(
                    <Typography variant="caption" color="text.secondary" display="block">
                      {new Date(v.createdAt).toLocaleString()} · {v.filename}
                    </Typography>
                  )}
                />
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, ml: 1 }}>
                  <Button size="small" startIcon={<DownloadIcon />} onClick={() => handleDownload(v.filename)}>Save</Button>
                  <Button size="small" color="error" startIcon={<DeleteIcon />} onClick={() => handleDelete(v.filename)}>Delete</Button>
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