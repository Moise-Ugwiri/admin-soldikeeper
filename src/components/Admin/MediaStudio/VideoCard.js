import React, { useState } from 'react';
import {
  Card, CardContent, CardActions, Typography, Chip, Button,
  LinearProgress, Box, Tooltip
} from '@mui/material';
import {
  Download as DownloadIcon,
  Refresh as RenderIcon
} from '@mui/icons-material';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const PLATFORM_COLORS = {
  YouTube: '#FF0000',
  TikTok: '#000000',
  Instagram: '#E1306C',
  LinkedIn: '#0A66C2',
  Feature: '#00897B',
};

const formatBytes = (bytes) => {
  if (!bytes) return '—';
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const formatDate = (iso) => {
  if (!iso) return 'Never';
  return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
};

const VideoCard = ({ video, authHeader, onRenderStart }) => {
  const [downloading, setDownloading] = useState(false);

  const handleRender = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/media/render/${video.id}`, {
        method: 'POST',
        headers: { ...authHeader, 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (data.jobId) onRenderStart(video.id, data.jobId);
    } catch (err) {
      console.error('[MediaStudio] render trigger failed:', err);
    }
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const res = await fetch(`${API_URL}/admin/media/download/${video.id}`, {
        headers: authHeader,
      });
      if (!res.ok) throw new Error('Download failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = video.file;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('[MediaStudio] download failed:', err);
    } finally {
      setDownloading(false);
    }
  };

  const color = PLATFORM_COLORS[video.platform] || '#666';
  const isRendering = video.renderStatus === 'rendering';
  const isDone = video.renderStatus === 'done';
  const isFailed = video.renderStatus === 'failed';

  return (
    <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderTop: `3px solid ${color}` }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, flexWrap: 'wrap' }}>
          <Chip label={video.platform} size="small" sx={{ bgcolor: color, color: '#fff', fontWeight: 700 }} />
          {video.exists ? (
            <Chip label="Ready" color="success" size="small" />
          ) : (
            <Chip label="Not rendered" color="default" size="small" />
          )}
          {isDone && <Chip label="✓ Done" color="success" size="small" />}
          {isFailed && <Chip label="Failed" color="error" size="small" />}
        </Box>

        <Typography variant="subtitle1" fontWeight={700}>{video.id}</Typography>
        <Typography variant="body2" color="text.secondary">{video.resolution} · {video.duration}</Typography>
        <Typography variant="body2" color="text.secondary">Size: {formatBytes(video.sizeBytes)}</Typography>
        <Typography variant="body2" color="text.secondary">Last rendered: {formatDate(video.lastRendered)}</Typography>

        {isRendering && (
          <Box sx={{ mt: 1 }}>
            <Typography variant="caption" color="primary">{`Rendering… ${video.renderProgress || 0}%`}</Typography>
            <LinearProgress variant="determinate" value={video.renderProgress || 0} sx={{ mt: 0.5 }} />
          </Box>
        )}
      </CardContent>

      <CardActions>
        <Button size="small" variant="outlined" startIcon={<RenderIcon />} onClick={handleRender} disabled={isRendering}>
          Re-render
        </Button>
        <Tooltip title={!video.exists ? 'Render first to enable download' : ''}>
          <span>
            <Button
              size="small"
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={handleDownload}
              disabled={!video.exists || downloading || isRendering}
            >
              {downloading ? 'Saving…' : 'Download'}
            </Button>
          </span>
        </Tooltip>
      </CardActions>
    </Card>
  );
};

export default VideoCard;
