import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box, Grid, Typography, Button, Chip, CircularProgress, Alert
} from '@mui/material';
import { VideoLibrary as VideoLibraryIcon, PlayArrow as RenderAllIcon } from '@mui/icons-material';
import VideoCard from './VideoCard';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const MediaStudio = () => {
  const token = localStorage.getItem('token');
  const authHeader = token ? { Authorization: `Bearer ${token}` } : {};

  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [renderJobs, setRenderJobs] = useState({});
  const [renderAllLoading, setRenderAllLoading] = useState(false);

  const pollTimersRef = useRef({});

  const fetchVideos = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/admin/media/videos`, { headers: authHeader });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setVideos(data.videos || []);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchVideos();
    const interval = setInterval(fetchVideos, 30000);
    return () => clearInterval(interval);
  }, [fetchVideos]);

  // Poll active render jobs every 2s
  useEffect(() => {
    Object.entries(renderJobs).forEach(([videoId, job]) => {
      if (job.status !== 'rendering') return;
      if (pollTimersRef.current[videoId]) return;

      const timer = setInterval(async () => {
        try {
          const res = await fetch(`${API_URL}/admin/media/status/${job.jobId}`, { headers: authHeader });
          const data = await res.json();
          setRenderJobs((prev) => ({
            ...prev,
            [videoId]: { ...prev[videoId], status: data.status, progress: data.progress },
          }));
          if (data.status !== 'rendering') {
            clearInterval(pollTimersRef.current[videoId]);
            delete pollTimersRef.current[videoId];
            fetchVideos();
          }
        } catch {
          // ignore transient errors
        }
      }, 2000);

      pollTimersRef.current[videoId] = timer;
    });

    return () => {
      // Capture ref value at cleanup time to satisfy react-hooks/exhaustive-deps
      const timers = pollTimersRef.current;
      Object.entries(timers).forEach(([videoId, timer]) => {
        if (!renderJobs[videoId] || renderJobs[videoId].status !== 'rendering') {
          clearInterval(timer);
          delete timers[videoId];
        }
      });
    };
  }, [renderJobs, token]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleRenderStart = (videoId, jobId) => {
    setRenderJobs((prev) => ({ ...prev, [videoId]: { jobId, status: 'rendering', progress: 0 } }));
  };

  const handleRenderAll = async () => {
    setRenderAllLoading(true);
    for (const video of videos) {
      try {
        const res = await fetch(`${API_URL}/admin/media/render/${video.id}`, {
          method: 'POST',
          headers: { ...authHeader, 'Content-Type': 'application/json' },
        });
        const data = await res.json();
        if (data.jobId) handleRenderStart(video.id, data.jobId);
        await new Promise((r) => setTimeout(r, 500));
      } catch (err) {
        console.error('[MediaStudio] renderAll failed for', video.id, err);
      }
    }
    setRenderAllLoading(false);
  };

  const enrichedVideos = videos.map((v) => ({
    ...v,
    renderStatus: renderJobs[v.id]?.status || null,
    renderProgress: renderJobs[v.id]?.progress || 0,
  }));

  const readyCount = videos.filter((v) => v.exists).length;
  const renderingCount = Object.values(renderJobs).filter((j) => j.status === 'rendering').length;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <VideoLibraryIcon /> Media Studio
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage and render Soldikeeper marketing videos
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
          <Chip label={`${readyCount}/7 ready`} color={readyCount === 7 ? 'success' : 'default'} />
          {renderingCount > 0 && (
            <Chip
              label={`${renderingCount} rendering`}
              color="primary"
              icon={<CircularProgress size={14} color="inherit" />}
            />
          )}
          <Button
            variant="contained"
            startIcon={renderAllLoading ? <CircularProgress size={16} color="inherit" /> : <RenderAllIcon />}
            onClick={handleRenderAll}
            disabled={renderAllLoading || renderingCount > 0}
          >
            Render All
          </Button>
        </Box>
      </Box>

      {error && <Alert severity="warning" sx={{ mb: 2 }}>Could not load video list: {error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {enrichedVideos.map((video) => (
            <Grid item xs={12} sm={6} lg={4} key={video.id}>
              <VideoCard video={video} authHeader={authHeader} onRenderStart={handleRenderStart} />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default MediaStudio;
