import React, { useEffect, useState } from 'react';
import { Alert, Box, Typography, Chip, Stack } from '@mui/material';
import { fetchMediaHealth } from './api';

export default function PipelineHealthBanner() {
  const [health, setHealth] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMediaHealth()
      .then(setHealth)
      .catch((err) => setError(err.message));
  }, []);

  if (error) {
    return <Alert severity="warning" sx={{ mb: 2 }}>Could not check pipeline health: {error}</Alert>;
  }
  if (!health) return null;

  if (health.ready) {
    return (
      <Alert severity="success" sx={{ mb: 2 }}>
        Media pipelines are ready. Enter a prompt below to generate videos, posters, or flyers.
      </Alert>
    );
  }

  const failed = Object.entries(health.checks || {}).filter(([, v]) => v.critical && !v.ok);

  return (
    <Alert severity="warning" sx={{ mb: 2 }}>
      <Typography variant="subtitle2" fontWeight={700} gutterBottom>
        Some media pipelines need configuration
      </Typography>
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 1 }}>
        {failed.map(([key, check]) => (
          <Chip key={key} label={check.message} size="small" color="warning" variant="outlined" />
        ))}
      </Stack>
      <Box component="ul" sx={{ mt: 1, mb: 0, pl: 2.5 }}>
        {Object.values(health.checks || {}).filter((c) => !c.ok).map((c) => (
          <Typography key={c.message} component="li" variant="caption" display="block">
            {c.message}
          </Typography>
        ))}
      </Box>
    </Alert>
  );
}