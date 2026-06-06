/* eslint-disable */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box, Paper, Typography, TextField, Button, Grid, Chip,
  LinearProgress, Alert, Select, MenuItem, FormControl,
  InputLabel, CircularProgress
} from '@mui/material';
import {
  AutoAwesome as AutoAwesomeIcon,
  Download as DownloadIcon,
  MovieFilter as MovieFilterIcon,
  MusicNote as MusicNoteIcon,
} from '@mui/icons-material';
import { getApiUrl, getAuthHeader } from './api';
import SceneImage from './SceneImage';
import VideoPreview from './VideoPreview';

const API_URL = getApiUrl();
const PLATFORMS = ['TikTok', 'Instagram', 'YouTube', 'LinkedIn'];
const SCENE_COUNTS = [3, 4, 5, 6, 7, 8];
const DURATIONS = [
  { value: 15, label: '15s' },
  { value: 30, label: '30s' },
  { value: 60, label: '60s' },
];
const CONTENT_TYPES = [
  { value: 'promotional', label: 'Promotional' },
  { value: 'educational', label: 'Educational' },
  { value: 'feature_tutorial', label: 'Feature Tutorial' },
];

export default function AIVideoTab() {
  const authHeader = getAuthHeader();

  const [brief, setBrief] = useState('');
  const [platform, setPlatform] = useState('TikTok');
  const [sceneCount, setSceneCount] = useState(5);
  const [totalDuration, setTotalDuration] = useState(30);
  const [contentType, setContentType] = useState('promotional');
  const [musicTrack, setMusicTrack] = useState('');
  const [musicTracks, setMusicTracks] = useState([]);

  const [generating, setGenerating] = useState(false);
  const [jobId, setJobId] = useState(null);
  const [jobStatus, setJobStatus] = useState(null);
  const [error, setError] = useState(null);
  const pollRef = useRef(null);

  useEffect(() => {
    fetch(`${API_URL}/admin/ai-video/music`, { headers: authHeader })
      .then((r) => {
        if (!r.ok) throw new Error(`Music list failed (HTTP ${r.status})`);
        return r.json();
      })
      .then((data) => {
        setMusicTracks(data.tracks || []);
        if (data.tracks?.length > 0) setMusicTrack(data.tracks[0]);
      })
      .catch((err) => setError(err.message));
  }, []);

  const pollStatus = useCallback(async (id) => {
    try {
      const r = await fetch(`${API_URL}/admin/ai-video/status/${id}`, { headers: authHeader });
      if (!r.ok) {
        if (r.status === 404) {
          setError('Job expired or not found. Please generate again.');
          setGenerating(false);
          clearInterval(pollRef.current);
        }
        return;
      }
      const data = await r.json();
      setJobStatus(data);
      if (data.status === 'done' || data.status === 'failed') {
        clearInterval(pollRef.current);
        setGenerating(false);
        if (data.status === 'failed') {
          setError(data.error || data.stage || 'Video generation failed');
        }
      }
    } catch (err) {
      setError(err.message);
    }
  }, [authHeader]);

  useEffect(() => {
    if (jobId) {
      pollStatus(jobId);
      pollRef.current = setInterval(() => pollStatus(jobId), 3000);
      return () => clearInterval(pollRef.current);
    }
    return undefined;
  }, [jobId, pollStatus]);

  const handleGenerate = async () => {
    if (brief.trim().length < 10 || generating) return;
    setGenerating(true);
    setError(null);
    setJobId(null);
    setJobStatus(null);
    try {
      const r = await fetch(`${API_URL}/admin/ai-video/generate`, {
        method: 'POST',
        headers: { ...authHeader, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brief, platform, sceneCount, totalDuration, musicTrack, contentType,
        }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || `HTTP ${r.status}`);
      if (data.jobId) {
        setJobId(data.jobId);
        setJobStatus({ status: 'queued', progress: 0, stage: 'Queued…', storyboard: null });
      } else {
        throw new Error('No job ID returned from server');
      }
    } catch (err) {
      setError(err.message);
      setGenerating(false);
    }
  };

  const handleDownload = async () => {
    try {
      const url = `${API_URL}/admin/ai-video/download/${jobId}`;
      const r = await fetch(url, { headers: authHeader });
      if (!r.ok) throw new Error(`Download failed (HTTP ${r.status})`);
      const blob = await r.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `soldikeeper-ai-video-${jobId}.mp4`;
      a.click();
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      setError(err.message);
    }
  };

  const isGenerating = generating && jobStatus && ['queued', 'rendering'].includes(jobStatus.status);
  const isDone = jobStatus?.status === 'done';
  const isFailed = jobStatus?.status === 'failed';
  const storyboard = jobStatus?.storyboard;
  const previewUrl = isDone && jobId ? `${API_URL}/admin/ai-video/download/${jobId}` : null;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>

      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <AutoAwesomeIcon sx={{ color: '#8b5cf6' }} />
          <Typography variant="subtitle1" fontWeight={700}>Video Brief</Typography>
        </Box>
        <TextField
          fullWidth multiline rows={4}
          label="Describe your video"
          placeholder="e.g. SoldiKeeper helps freelancers track expenses automatically with AI receipt scanning and smart budgets…"
          value={brief}
          onChange={(e) => setBrief(e.target.value)}
          disabled={isGenerating}
          sx={{ mb: 2 }}
        />
        <Grid container spacing={2}>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Platform</InputLabel>
              <Select value={platform} label="Platform" onChange={(e) => setPlatform(e.target.value)} disabled={isGenerating}>
                {PLATFORMS.map((p) => <MenuItem key={p} value={p}>{p}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Content Type</InputLabel>
              <Select value={contentType} label="Content Type" onChange={(e) => setContentType(e.target.value)} disabled={isGenerating}>
                {CONTENT_TYPES.map((t) => <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} sm={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Scenes</InputLabel>
              <Select value={sceneCount} label="Scenes" onChange={(e) => setSceneCount(e.target.value)} disabled={isGenerating}>
                {SCENE_COUNTS.map((n) => <MenuItem key={n} value={n}>{n}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} sm={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Duration</InputLabel>
              <Select value={totalDuration} label="Duration" onChange={(e) => setTotalDuration(e.target.value)} disabled={isGenerating}>
                {DURATIONS.map((d) => <MenuItem key={d.value} value={d.value}>{d.label}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Music</InputLabel>
              <Select value={musicTrack} label="Music" onChange={(e) => setMusicTrack(e.target.value)} disabled={isGenerating}>
                <MenuItem value="">None</MenuItem>
                {musicTracks.map((t) => (
                  <MenuItem key={t} value={t}>{t.replace('.mp3', '').replace(/-/g, ' ')}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
        <Button
          variant="contained"
          size="large"
          startIcon={isGenerating ? <CircularProgress size={18} color="inherit" /> : <AutoAwesomeIcon />}
          onClick={handleGenerate}
          disabled={brief.trim().length < 10 || isGenerating}
          sx={{ mt: 2, bgcolor: '#8b5cf6', '&:hover': { bgcolor: '#7c3aed' }, fontWeight: 700 }}
          fullWidth
        >
          {isGenerating ? 'Generating…' : '✨ Generate AI Video'}
        </Button>
      </Paper>

      {isGenerating && jobStatus && (
        <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
          <Typography variant="subtitle2" fontWeight={700} gutterBottom>
            {jobStatus.stage || 'Processing…'}
          </Typography>
          <LinearProgress
            variant={jobStatus.progress > 5 ? 'determinate' : 'indeterminate'}
            value={jobStatus.progress}
            sx={{ mb: 1, '& .MuiLinearProgress-bar': { bgcolor: '#8b5cf6' } }}
          />
          <Typography variant="caption" color="text.secondary">
            Generating images with Grok Imagine, stitching with FFmpeg… This takes ~20–60 seconds.
          </Typography>
        </Paper>
      )}

      {isFailed && !error && (
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          {jobStatus?.stage || 'Video generation failed. Please try again.'}
        </Alert>
      )}

      {storyboard && (
        <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <MovieFilterIcon sx={{ color: '#8b5cf6' }} />
            <Typography variant="subtitle1" fontWeight={700}>{storyboard.title}</Typography>
          </Box>
          <Grid container spacing={2}>
            {storyboard.scenes.map((scene, i) => (
              <Grid item xs={12} sm={6} md={4} key={i}>
                <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
                  <SceneImage
                    url={jobId ? `${API_URL}/admin/ai-video/scene/${jobId}/${i}` : null}
                    authHeader={authHeader}
                    height={120}
                  />
                  <Box sx={{ p: 1.5 }}>
                    <Box sx={{ display: 'flex', gap: 0.5, mb: 0.5 }}>
                      <Chip label={`Scene ${scene.index}`} size="small" sx={{ bgcolor: '#8b5cf620', color: '#8b5cf6' }} />
                      <Chip label={`${scene.duration}s`} size="small" variant="outlined" />
                    </Box>
                    <Typography variant="body2" fontWeight={600} gutterBottom>{scene.overlayText}</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                      {(scene.imagePrompt || '').slice(0, 60)}{scene.imagePrompt?.length > 60 ? '…' : ''}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}

      {isDone && (
        <>
          <Alert
            severity="success"
            sx={{ borderRadius: 2 }}
            action={
              <Button color="inherit" size="small" startIcon={<DownloadIcon />} onClick={handleDownload} variant="outlined">
                Download MP4
              </Button>
            }
          >
            Your AI video is ready! It has also been saved to the Video Library.
          </Alert>
          {previewUrl && (
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
              <VideoPreview url={previewUrl} authHeader={authHeader} label="Generated Video" />
            </Paper>
          )}
        </>
      )}
    </Box>
  );
}