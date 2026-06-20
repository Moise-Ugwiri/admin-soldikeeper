import React, { useState } from 'react';
import {
  Box, Button, Stack, Typography, Alert, LinearProgress, Chip, IconButton, Tooltip,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import RefreshIcon from '@mui/icons-material/Refresh';
import ReplayIcon from '@mui/icons-material/Replay';
import SubtitlesIcon from '@mui/icons-material/Subtitles';
import VideoPreview from './VideoPreview';
import ImagePreview from './ImagePreview';
import {
  getAuthHeader, jobDownloadUrl, regenerateScene, sceneImageUrl, captionsDownloadUrl,
} from './api';

export default function AssetResultPanel({ job, error, onCreateAnother, onJobUpdate }) {
  const authHeader = getAuthHeader();
  const [regenIndex, setRegenIndex] = useState(null);
  const [regenError, setRegenError] = useState(null);

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!job) return null;

  const isActive = ['queued', 'rendering'].includes(job.status);
  const isDone = job.status === 'done';
  const isFailed = job.status === 'failed';
  const isImage = job.mimeType?.startsWith('image/') || ['poster', 'flyer', 'banner', 'thumbnail'].includes(job.assetType);
  const isAIVideo = job.pipeline === 'ai_video';
  const downloadUrl = isDone ? jobDownloadUrl(job.id) : null;
  const scenes = job.storyboard?.scenes || [];

  const handleRegenerate = async (index) => {
    setRegenIndex(index);
    setRegenError(null);
    try {
      await regenerateScene(job.id, index);
      onJobUpdate?.();
    } catch (err) {
      setRegenError(err.message);
    } finally {
      setRegenIndex(null);
    }
  };

  const downloadCaptions = async () => {
    const url = captionsDownloadUrl(job.id);
    const res = await fetch(url, { headers: authHeader });
    if (!res.ok) throw new Error('Captions not available');
    const blob = await res.blob();
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = job.srtFilename || `${job.id}.srt`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <Box>
      {isActive && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="primary" gutterBottom>{job.stage || 'Generating…'}</Typography>
          <LinearProgress variant={job.progress > 5 ? 'determinate' : 'indeterminate'} value={job.progress || 0} />
        </Box>
      )}

      {isFailed && (
        <Alert severity="error" sx={{ mb: 2 }}>{job.error || 'Generation failed'}</Alert>
      )}

      {regenError && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setRegenError(null)}>{regenError}</Alert>
      )}

      {isDone && (
        <>
          <Chip label="Ready" color="success" size="small" sx={{ mb: 2 }} />
          {isImage ? (
            <ImagePreview url={downloadUrl} authHeader={authHeader} label="Generated asset" />
          ) : (
            <VideoPreview url={downloadUrl} authHeader={authHeader} label="Generated video" />
          )}
        </>
      )}

      {isAIVideo && scenes.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>Storyboard scenes</Typography>
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
            {scenes.map((scene, i) => (
              <Box key={i} sx={{ width: 140, border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
                {(isDone || (job.scenesReady || 0) > i) ? (
                  <ImagePreview
                    url={sceneImageUrl(job.id, i)}
                    authHeader={authHeader}
                    label={`Scene ${i + 1}`}
                    maxHeight={120}
                  />
                ) : (
                  <Box sx={{ height: 120, bgcolor: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography variant="caption" color="text.secondary">Rendering…</Typography>
                  </Box>
                )}
                <Box sx={{ p: 1 }}>
                  <Typography variant="caption" display="block" noWrap>
                    {scene.overlayText || scene.instruction || `Scene ${i + 1}`}
                  </Typography>
                  {isDone && (
                    <Tooltip title="Regenerate this scene">
                      <IconButton
                        size="small"
                        onClick={() => handleRegenerate(i)}
                        disabled={regenIndex === i || isActive}
                      >
                        <ReplayIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
              </Box>
            ))}
          </Stack>
        </Box>
      )}

      <Stack direction="row" spacing={1} sx={{ mt: 2 }} flexWrap="wrap" useFlexGap>
        {isDone && (
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={() => {
              fetch(downloadUrl, { headers: authHeader })
                .then((r) => r.blob())
                .then((blob) => {
                  const a = document.createElement('a');
                  a.href = URL.createObjectURL(blob);
                  a.download = job.outputFilename || 'soldikeeper-media';
                  a.click();
                  URL.revokeObjectURL(a.href);
                });
            }}
          >
            Download
          </Button>
        )}
        {isDone && isAIVideo && (
          <Button variant="outlined" startIcon={<SubtitlesIcon />} onClick={downloadCaptions}>
            Download SRT
          </Button>
        )}
        <Button variant="outlined" startIcon={<RefreshIcon />} onClick={onCreateAnother}>
          Create another
        </Button>
      </Stack>
    </Box>
  );
}