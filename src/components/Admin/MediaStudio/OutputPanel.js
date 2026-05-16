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

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const OutputPanel = ({ compositionId, inputProps, authHeader, onOpenLibrary }) => {
  const [job, setJob] = useState(null); // { jobId, status, progress, outputFile }
  const [generating, setGenerating] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState(null);
  const pollRef = useRef(null);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  const startPolling = (jobId) => {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`${API_URL}/admin/media/status/${jobId}`, { headers: authHeader });
        const data = await res.json();
        setJob(prev => ({ ...prev, status: data.status, progress: data.progress || 0 }));
        if (data.status !== 'rendering') {
          clearInterval(pollRef.current);
          pollRef.current = null;
          setGenerating(false);
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
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setJob({ jobId: data.jobId, status: 'rendering', progress: 0 });
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
  const isRendering = job?.status === 'rendering';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', fontSize: 11, letterSpacing: 1 }}>
        Output
      </Typography>

      {error && <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>}

      {isRendering && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="caption" color="primary">Rendering via GitHub Actions (~3–5 min)…</Typography>
            <Typography variant="caption" color="primary">{job.progress || 0}%</Typography>
          </Box>
          <LinearProgress variant={job.progress > 0 ? 'determinate' : 'indeterminate'} value={job.progress || 0} sx={{ borderRadius: 4 }} />
        </Box>
      )}

      {isDone && (
        <Chip icon={<DoneIcon />} label="Video ready to download" color="success" variant="outlined" />
      )}
      {isFailed && (
        <Alert severity="info" icon={<InfoIcon />}>
          Cloud rendering is not yet available on this server. To generate the MP4,
          run the Remotion project locally and use <strong>Export Settings</strong> below
          to get a ready-made props file.
        </Alert>
      )}

      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        <Button
          variant="contained"
          startIcon={<RenderIcon />}
          onClick={handleGenerate}
          disabled={generating || isRendering || !compositionId}
          sx={{ bgcolor: '#10b981', '&:hover': { bgcolor: '#059669' } }}
        >
          {isRendering ? 'Rendering…' : 'Generate MP4'}
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

        <Button
          variant="outlined"
          startIcon={<LibraryIcon />}
          onClick={onOpenLibrary}
          size="small"
        >
          Video Library
        </Button>

        <Button
          variant="outlined"
          startIcon={<ExportIcon />}
          onClick={handleExportSettings}
          size="small"
        >
          Export Settings
        </Button>
      </Stack>
    </Box>
  );
};

export default OutputPanel;
