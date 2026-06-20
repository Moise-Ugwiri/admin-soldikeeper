import React from 'react';
import { Box, Button, Stack, Typography, Alert, LinearProgress, Chip } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import RefreshIcon from '@mui/icons-material/Refresh';
import VideoPreview from './VideoPreview';
import ImagePreview from './ImagePreview';
import { getAuthHeader, jobDownloadUrl } from './api';

export default function AssetResultPanel({ job, error, onCreateAnother }) {
  const authHeader = getAuthHeader();

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!job) return null;

  const isActive = ['queued', 'rendering'].includes(job.status);
  const isDone = job.status === 'done';
  const isFailed = job.status === 'failed';
  const isImage = job.mimeType?.startsWith('image/') || ['poster', 'flyer', 'banner', 'thumbnail'].includes(job.assetType);
  const downloadUrl = isDone ? jobDownloadUrl(job.id) : null;

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

      <Stack direction="row" spacing={1} sx={{ mt: 2 }} flexWrap="wrap" useFlexGap>
        {isDone && (
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            component="a"
            href={downloadUrl}
            onClick={(e) => {
              e.preventDefault();
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
        <Button variant="outlined" startIcon={<RefreshIcon />} onClick={onCreateAnother}>
          Create another
        </Button>
      </Stack>
    </Box>
  );
}