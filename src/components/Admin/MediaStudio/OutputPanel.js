/* eslint-disable */
import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Button, Typography, LinearProgress, Alert, Chip, Stack
} from '@mui/material';
import {
  Videocam as RenderIcon,
  Download as DownloadIcon,
  VideoLibrary as LibraryIcon,
  CheckCircle as DoneIcon,
  FileDownload as ExportIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { getApiUrl, getAuthHeader } from './api';
import VideoPreview from './VideoPreview';

const API_URL = getApiUrl();

const OutputPanel = ({ compositionId, inputProps, onOpenLibrary }) => {
  const authHeader = getAuthHeader();
  const [job, setJob] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState(null);
  const pollRef = useRef(null);

  useEffect(() => () => {
    if (pollRef.current) clearInterval(pollRef.current);
  }, []);

  const startPolling = (jobId) => {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`${API_URL}/admin/media/status/${jobId}`, { headers: authHeader });
        const data = await res.json();
        setJob((prev) => ({
          ...prev,
          status: data.status,
          progress: data.progress || 0,
          error: data.error || null,
        }));
        if (['done', 'failed'].includes(data.status)) {
          clearInterval(pollRef.current);
          pollRef.current = null;
          setGenerating(false);
          if (data.status === 'failed' && data.error) {
            setError(data.error);
          }
        }
      } catch {
        // ignore transient errors
      }
    }, 2000);
  };

  const handleGenerate = async () => {
    if (!compositionId) return;
    setGenerating(true);
    setError(null);
    setJob(null);
    try {
      const res = await fetch(`${API_URL}/admin/media/generate`, {
        method: 'POST',
        headers: { ...authHeader, 'Content-Type': 'application/json' },
        body: JSON.stringify({ compositionId, inputProps }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      setJob({ jobId: data.jobId, status: 'queued', progress: 0 });
      startPolling(data.jobId);
    } catch (err) {
      setError(err.message);
      setGenerating(false);
    }
  };

  const handleDownload = async () => {
    if (!job?.jobId) return;
    setDownloading(true);
    try {
      const res = await fetch(`${API_URL}/admin/media/download-generated/${job.jobId}`, { headers: authHeader });
      if (!res.ok) throw new Error('Download failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${compositionId}-custom.mp4`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message);
    } finally {
      setDownloading(false);
    }
  };

  const handleExportSettings = () => {
    const payload = { compositionId, inputProps, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${compositionId}-props.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const isDone = job?.status === 'done';
  const isFailed = job?.status === 'failed';
  const isActive = job && ['queued', 'rendering'].includes(job.status);
  const previewUrl = isDone && job?.jobId
    ? `${API_URL}/admin/media/download-generated/${job.jobId}`
    : null;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', fontSize: 11, letterSpacing: 1 }}>
        Output
      </Typography>

      {error && <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>}

      {isActive && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="caption" color="primary">
              {job.status === 'queued' ? 'Queued for cloud render…' : 'Rendering via GitHub Actions (~3–5 min)…'}
            </Typography>
            <Typography variant="caption" color="primary">{job.progress || 0}%</Typography>
          </Box>
          <LinearProgress variant={job.progress > 0 ? 'determinate' : 'indeterminate'} value={job.progress || 0} sx={{ borderRadius: 4 }} />
        </Box>
      )}

      {isDone && (
        <Chip icon={<DoneIcon />} label="Video ready — also saved to Video Library" color="success" variant="outlined" />
      )}
      {isFailed && !error && (
        <Alert severity="info" icon={<InfoIcon />}>
          Cloud rendering is not yet available on this server. To generate the MP4 locally,
          run the Remotion project and use <strong>Export Settings</strong> below for a ready-made props file.
          {job?.error && <> Server message: <strong>{job.error}</strong></>}
        </Alert>
      )}

      {previewUrl && (
        <VideoPreview url={previewUrl} authHeader={authHeader} label="Rendered Video" />
      )}

      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        <Button
          variant="contained"
          startIcon={<RenderIcon />}
          onClick={handleGenerate}
          disabled={generating || isActive || !compositionId}
          sx={{ bgcolor: '#10b981', '&:hover': { bgcolor: '#059669' } }}
        >
          {isActive ? 'Rendering…' : 'Generate MP4'}
        </Button>

        {isDone && (
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleDownload}
            disabled={downloading}
          >
            {downloading ? 'Saving…' : 'Download'}
          </Button>
        )}

        <Button variant="outlined" startIcon={<LibraryIcon />} onClick={onOpenLibrary} size="small">
          Video Library
        </Button>

        <Button variant="outlined" startIcon={<ExportIcon />} onClick={handleExportSettings} size="small">
          Export Settings
        </Button>
      </Stack>
    </Box>
  );
};

export default OutputPanel;