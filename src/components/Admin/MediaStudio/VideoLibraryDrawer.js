/* eslint-disable */
import React, { useState, useEffect, useCallback } from 'react';
import {
  Drawer, Box, Typography, IconButton, List, ListItem, ListItemText,
  Button, Chip, Divider, CircularProgress,
  Alert, Tooltip
} from '@mui/material';
import {
  Close as CloseIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const formatBytes = (b) => b ? `${(b / 1024 / 1024).toFixed(1)} MB` : '—';
const formatDate = (iso) => iso ? new Date(iso).toLocaleString() : '—';

const VideoLibraryDrawer = ({ open, onClose, authHeader }) => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchLibrary = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/admin/media/library`, { headers: authHeader });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setVideos(data.videos || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [authHeader]);

  useEffect(() => {
    if (open) fetchLibrary();
  }, [open, fetchLibrary]);

  const handleDownload = async (v) => {
    try {
      const res = await fetch(`${API_URL}/admin/media/download/${v.compositionId}`, { headers: authHeader });
      if (!res.ok) throw new Error('Failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = v.filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Download failed: ' + err.message);
    }
  };

  const handleDelete = async (v) => {
    if (!window.confirm(`Delete ${v.filename}?`)) return;
    try {
      const res = await fetch(`${API_URL}/admin/media/library/${encodeURIComponent(v.filename)}`, {
        method: 'DELETE',
        headers: authHeader,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setVideos(prev => prev.filter(x => x.filename !== v.filename));
    } catch (err) {
      alert('Delete failed: ' + err.message);
    }
  };

  return (
    <Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ sx: { width: 440 } }}>
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" fontWeight={700}>Video Library</Typography>
        <Box>
          <Tooltip title="Refresh"><IconButton size="small" onClick={fetchLibrary}><RefreshIcon /></IconButton></Tooltip>
          <IconButton size="small" onClick={onClose}><CloseIcon /></IconButton>
        </Box>
      </Box>
      <Divider />

      <Box sx={{ p: 2, overflow: 'auto', flexGrow: 1 }}>
        {loading && <Box sx={{ textAlign: 'center', py: 4 }}><CircularProgress size={24} /></Box>}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {!loading && videos.length === 0 && (
          <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
            No videos generated yet. Use the studio to create one!
          </Typography>
        )}
        <List disablePadding>
          {videos.map((v) => (
            <React.Fragment key={v.filename}>
              <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                      <Typography variant="body2" fontWeight={700}>{v.compositionId}</Typography>
                      <Chip label={formatBytes(v.sizeBytes)} size="small" />
                    </Box>
                  }
                  secondary={
                    <>
                      <Typography variant="caption" color="text.secondary" display="block">{formatDate(v.createdAt)}</Typography>
                      {v.inputProps?.hook && (
                        <Typography variant="caption" color="text.secondary" noWrap display="block" sx={{ maxWidth: 280 }}>
                          "{v.inputProps.hook}"
                        </Typography>
                      )}
                    </>
                  }
                />
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, ml: 1, minWidth: 80 }}>
                  <Button size="small" startIcon={<DownloadIcon />} onClick={() => handleDownload(v)}>
                    Download
                  </Button>
                  <Button size="small" color="error" startIcon={<DeleteIcon />} onClick={() => handleDelete(v)}>
                    Delete
                  </Button>
                </Box>
              </ListItem>
              <Divider />
            </React.Fragment>
          ))}
        </List>
      </Box>
    </Drawer>
  );
};

export default VideoLibraryDrawer;
