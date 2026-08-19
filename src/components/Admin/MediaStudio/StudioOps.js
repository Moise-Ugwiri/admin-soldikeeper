import React, { useEffect, useState } from 'react';
import {
  Box, Paper, Typography, TextField, Button, Grid, Chip, Stack, Alert,
  CircularProgress, MenuItem, Select, FormControl, InputLabel, ToggleButton, ToggleButtonGroup,
} from '@mui/material';
import {
  createPack, fetchPacks, fetchStudioStatus, decidePack, setStudioSpend, fetchMediaJobs, jobDownloadUrl,
} from './api';

const PACK_TYPES = ['custom', 'weekly', 'feature', 'conversion', 'store', 'press'];

export default function StudioOps() {
  const [status, setStatus] = useState(null);
  const [packs, setPacks] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [brief, setBrief] = useState('');
  const [packType, setPackType] = useState('custom');
  const [aesthetic, setAesthetic] = useState('cinematic');
  const [notifyTelegram, setNotifyTelegram] = useState(true);

  const reload = () => {
    fetchStudioStatus().then(setStatus).catch((e) => setError(e.message));
    fetchPacks().then(setPacks).catch(() => {});
    fetchMediaJobs().then(setJobs).catch(() => {});
  };

  useEffect(() => { reload(); const t = setInterval(reload, 15000); return () => clearInterval(t); }, []);

  const handlePack = async () => {
    if (brief.trim().length < 8) return;
    setLoading(true);
    setError(null);
    try {
      await createPack({ brief: brief.trim(), packType, aesthetic, notifyTelegram });
      setBrief('');
      reload();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const spend = status?.spend || {};

  return (
    <Box>
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="overline">Spend today</Typography>
            <Typography variant="h5" fontWeight={800}>
              ${Number(spend.spentUsd || 0).toFixed(2)} / ${spend.capUsd || 15}
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
              <Button size="small" variant="outlined" onClick={() => setStudioSpend({ bumpUsd: 10 }).then(reload)}>+$10 cap</Button>
              <Button size="small" onClick={reload}>Refresh</Button>
            </Stack>
          </Paper>
        </Grid>
        <Grid item xs={12} md={8}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="overline">Queue</Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 1 }} flexWrap="wrap" useFlexGap>
              <Chip label={`Queued ${status?.queued || 0}`} />
              <Chip label={`Rendering ${status?.rendering || 0}`} color="warning" />
              <Chip label={`Ready ${status?.ready || 0}`} color="success" />
              <Chip label={`Approved ${status?.approved || 0}`} color="primary" />
            </Stack>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
              Telegram is the edit bay. Packs also land here so you can generate from admin if needed.
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" fontWeight={700} gutterBottom>Generate a campaign pack</Typography>
        <TextField
          fullWidth multiline rows={3}
          placeholder="e.g. Instagram reel + story for students scanning receipts, UGC style"
          value={brief}
          onChange={(e) => setBrief(e.target.value)}
          sx={{ mb: 2 }}
        />
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Pack type</InputLabel>
            <Select value={packType} label="Pack type" onChange={(e) => setPackType(e.target.value)}>
              {PACK_TYPES.map((p) => <MenuItem key={p} value={p}>{p}</MenuItem>)}
            </Select>
          </FormControl>
          <ToggleButtonGroup exclusive size="small" value={aesthetic} onChange={(_, v) => v && setAesthetic(v)}>
            <ToggleButton value="cinematic">Cinematic</ToggleButton>
            <ToggleButton value="ugc">UGC</ToggleButton>
          </ToggleButtonGroup>
          <ToggleButtonGroup exclusive size="small" value={notifyTelegram ? 'yes' : 'no'} onChange={(_, v) => v && setNotifyTelegram(v === 'yes')}>
            <ToggleButton value="yes">Also send Telegram</ToggleButton>
            <ToggleButton value="no">Admin only</ToggleButton>
          </ToggleButtonGroup>
        </Stack>
        <Button
          variant="contained"
          disabled={brief.trim().length < 8 || loading}
          onClick={handlePack}
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : null}
          sx={{ bgcolor: '#10b981', '&:hover': { bgcolor: '#059669' } }}
        >
          Generate pack
        </Button>
      </Paper>

      <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>Campaigns</Typography>
      <Stack spacing={1} sx={{ mb: 3 }}>
        {packs.length === 0 && <Typography color="text.secondary">No packs yet.</Typography>}
        {packs.map((p) => (
          <Paper key={p.campaignId} variant="outlined" sx={{ p: 2 }}>
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
              <Chip size="small" label={p.status} color={p.status === 'ready' || p.status === 'approved' ? 'success' : p.status === 'failed' || p.status === 'killed' ? 'error' : 'default'} />
              <Chip size="small" label={p.packType} variant="outlined" />
              <Chip size="small" label={p.aesthetic} variant="outlined" />
              <Typography variant="body2" fontWeight={700}>{p.copy?.hook || p.brief?.slice(0, 80)}</Typography>
            </Stack>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
              {p.campaignId} · {(p.jobs || []).filter((j) => j.status === 'done').length}/{(p.jobs || []).length} assets · {new Date(p.createdAt).toLocaleString()}
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
              <Button size="small" onClick={() => decidePack(p.campaignId, 'keep').then(reload)}>Keep</Button>
              <Button size="small" onClick={() => decidePack(p.campaignId, 'ugc').then(reload)}>More UGC</Button>
              <Button size="small" color="error" onClick={() => decidePack(p.campaignId, 'kill').then(reload)}>Kill</Button>
            </Stack>
          </Paper>
        ))}
      </Stack>

      <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>Brand OS</Typography>
      <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
        <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
          <Box sx={{ width: 24, height: 24, bgcolor: status?.brand?.palette?.emerald || '#10b981', borderRadius: 1 }} />
          <Box sx={{ width: 24, height: 24, bgcolor: status?.brand?.palette?.slate || '#0f172a', borderRadius: 1 }} />
          <Typography variant="body2">{status?.brand?.lock?.tagline}</Typography>
        </Stack>
        <Typography variant="caption" color="text.secondary">
          Forbidden: {(status?.brand?.forbidden || []).slice(0, 4).join(' · ')}
        </Typography>
      </Paper>

      <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>Render jobs</Typography>
      <Stack spacing={0.5}>
        {jobs.slice(0, 15).map((j) => (
          <Stack key={j.id} direction="row" spacing={1} alignItems="center">
            <Chip size="small" label={j.status} />
            <Typography variant="caption">{j.assetType || j.pipeline} · {j.id}</Typography>
            {j.status === 'done' && (
              <Button size="small" href={jobDownloadUrl(j.id)} target="_blank" rel="noreferrer">Download</Button>
            )}
          </Stack>
        ))}
      </Stack>
    </Box>
  );
}
