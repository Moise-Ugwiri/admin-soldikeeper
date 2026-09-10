import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Box, Button, Typography, Stack, Chip, Alert, CircularProgress, Tooltip,
  Select, MenuItem, FormControl, InputLabel, IconButton, Divider,
  ToggleButton, ToggleButtonGroup, Card, CardContent,
} from '@mui/material';
import UploadIcon from '@mui/icons-material/Upload';
import RefreshIcon from '@mui/icons-material/Refresh';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import SyncIcon from '@mui/icons-material/Sync';
import PhoneIphoneIcon from '@mui/icons-material/PhoneIphone';
import LaptopMacIcon from '@mui/icons-material/LaptopMac';
import {
  fetchStockLibrary, seedStockLibrary, uploadStockAssets, updateBrandAsset,
  deleteBrandAsset, previewStockPick, assetFileUrl,
} from './api';
import BrandAssetThumb from './BrandAssetThumb';

const SCREEN_OPTIONS = [
  'dashboard', 'budget', 'receipts', 'split-bills', 'transactions', 'insights',
  'analytics', 'reports', 'landing', 'features', 'pricing', 'social-proof',
  'login', 'splash', 'misc',
];

/**
 * Stock image library.
 *
 * This is the pool the generators and the Telegram bot pull from. Anything
 * marked active here can end up in a poster, a device lineup or a video scene,
 * so screens that shouldn't ship (logged-out states, splash frames) get
 * switched off rather than deleted.
 */
export default function StockLibrary() {
  const [data, setData] = useState({ assets: [], stats: null });
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);
  const [filter, setFilter] = useState('all');
  const [screenFilter, setScreenFilter] = useState('');
  const [preview, setPreview] = useState(null);
  const [previewScreen, setPreviewScreen] = useState('receipts');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await fetchStockLibrary());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const run = async (fn, successMsg) => {
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const result = await fn();
      if (successMsg) setNotice(typeof successMsg === 'function' ? successMsg(result) : successMsg);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const handleUpload = async (e) => {
    const files = e.target.files;
    if (!files?.length) return;
    await run(
      () => uploadStockAssets(files, { screenId: screenFilter || undefined }),
      (r) => `Uploaded ${r.assets.length} image${r.assets.length === 1 ? '' : 's'}`
        + (r.failed?.length ? ` · ${r.failed.length} failed` : ''),
    );
    e.target.value = '';
  };

  const handlePreview = async () => {
    setError(null);
    try {
      setPreview(await previewStockPick(previewScreen));
    } catch (err) {
      setError(err.message);
    }
  };

  const visible = useMemo(() => {
    let list = data.assets || [];
    if (filter === 'active') list = list.filter((a) => a.active !== false);
    if (filter === 'disabled') list = list.filter((a) => a.active === false);
    if (filter === 'phone') list = list.filter((a) => a.orientation === 'portrait');
    if (filter === 'web') list = list.filter((a) => a.orientation === 'landscape');
    if (screenFilter) list = list.filter((a) => a.screenId === screenFilter);
    return list;
  }, [data.assets, filter, screenFilter]);

  const stats = data.stats;

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1} mb={1}>
        <Box>
          <Typography variant="h6" fontWeight={700}>Stock image library</Typography>
          <Typography variant="body2" color="text.secondary">
            The pool every generation pulls from — posters, device lineups, video scenes and the Telegram bot.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button size="small" startIcon={<RefreshIcon />} onClick={load} disabled={loading || busy}>
            Refresh
          </Button>
          <Tooltip title="Import assets/soldikeeper_images from disk. Already-imported files are skipped.">
            <span>
              <Button
                size="small"
                startIcon={<SyncIcon />}
                onClick={() => run(
                  () => seedStockLibrary(false),
                  (r) => `Seeded ${r.seeded} new · ${r.skipped} already present`,
                )}
                disabled={busy}
              >
                Import bundled
              </Button>
            </span>
          </Tooltip>
          <Button
            size="small"
            variant="contained"
            component="label"
            startIcon={<UploadIcon />}
            disabled={busy}
          >
            Upload images
            <input hidden multiple type="file" accept="image/*" onChange={handleUpload} />
          </Button>
        </Stack>
      </Stack>

      {stats && (
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap mb={2}>
          <Chip size="small" color="success" label={`${stats.active} usable`} />
          <Chip size="small" variant="outlined" label={`${stats.inactive} disabled`} />
          <Chip size="small" variant="outlined" icon={<PhoneIphoneIcon />} label={`${stats.portrait} phone`} />
          <Chip size="small" variant="outlined" icon={<LaptopMacIcon />} label={`${stats.landscape} web`} />
        </Stack>
      )}

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}
      {notice && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setNotice(null)}>{notice}</Alert>}

      <Card variant="outlined" sx={{ mb: 2, bgcolor: 'action.hover' }}>
        <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
            <Typography variant="body2" fontWeight={600}>What would a generation pick?</Typography>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <Select value={previewScreen} onChange={(e) => setPreviewScreen(e.target.value)}>
                {SCREEN_OPTIONS.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
              </Select>
            </FormControl>
            <Button size="small" variant="outlined" onClick={handlePreview}>Check</Button>
            {preview && (
              <Typography variant="body2" color="text.secondary">
                laptop: <b>{preview.laptop?.label || '—'}</b> · phone A: <b>{preview.phoneA?.label || '—'}</b>
                {' '}· phone B: <b>{preview.phoneB?.label || '—'}</b>
              </Typography>
            )}
          </Stack>
        </CardContent>
      </Card>

      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap mb={2}>
        <ToggleButtonGroup
          size="small"
          exclusive
          value={filter}
          onChange={(_, v) => v && setFilter(v)}
        >
          <ToggleButton value="all">All</ToggleButton>
          <ToggleButton value="active">Usable</ToggleButton>
          <ToggleButton value="disabled">Disabled</ToggleButton>
          <ToggleButton value="phone">Phone</ToggleButton>
          <ToggleButton value="web">Web</ToggleButton>
        </ToggleButtonGroup>

        <FormControl size="small" sx={{ minWidth: 170 }}>
          <InputLabel>Screen</InputLabel>
          <Select label="Screen" value={screenFilter} onChange={(e) => setScreenFilter(e.target.value)}>
            <MenuItem value="">All screens</MenuItem>
            {SCREEN_OPTIONS.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
          </Select>
        </FormControl>

        <Typography variant="body2" color="text.secondary">
          {visible.length} shown
        </Typography>
      </Stack>

      {loading && <Box sx={{ py: 4, textAlign: 'center' }}><CircularProgress size={28} /></Box>}

      {!loading && !visible.length && (
        <Alert severity="info">
          Nothing here yet. Upload images, or hit <b>Import bundled</b> to load
          the images shipped in <code>assets/soldikeeper_images</code>.
        </Alert>
      )}

      <Box sx={{
        display: 'grid',
        gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(5, 1fr)' },
        gap: 1.5,
      }}
      >
        {visible.map((asset) => (
          <Card
            key={asset.id}
            variant="outlined"
            sx={{
              opacity: asset.active === false ? 0.5 : 1,
              borderColor: asset.active === false ? 'divider' : 'success.light',
            }}
          >
            <Box sx={{ height: 150, bgcolor: '#0b1220', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              <BrandAssetThumb url={assetFileUrl(asset.id)} alt={asset.label} />
            </Box>
            <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
              <Typography variant="caption" fontWeight={700} noWrap display="block" title={asset.label}>
                {asset.label}
              </Typography>
              <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ mt: 0.5, mb: 0.5 }}>
                <Chip size="small" variant="outlined" label={asset.orientation === 'landscape' ? 'web' : 'phone'} />
                {asset.screenId && <Chip size="small" label={asset.screenId} />}
              </Stack>
              <Typography variant="caption" color="text.secondary" display="block">
                {asset.width}×{asset.height}
              </Typography>

              <Divider sx={{ my: 0.5 }} />

              <Stack direction="row" spacing={0.5} alignItems="center">
                <FormControl size="small" fullWidth>
                  <Select
                    native
                    value={asset.screenId || ''}
                    onChange={(e) => run(
                      () => updateBrandAsset(asset.id, { screenId: e.target.value || null }),
                      'Screen updated',
                    )}
                    sx={{ fontSize: 12 }}
                  >
                    <option value="">unassigned</option>
                    {SCREEN_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </Select>
                </FormControl>

                <Tooltip title={asset.active === false ? 'Enable for generations' : 'Exclude from generations'}>
                  <IconButton
                    size="small"
                    onClick={() => run(
                      () => updateBrandAsset(asset.id, { active: asset.active === false }),
                      asset.active === false ? 'Enabled' : 'Excluded from generations',
                    )}
                  >
                    {asset.active === false ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" color="success" />}
                  </IconButton>
                </Tooltip>

                <Tooltip title="Delete permanently">
                  <IconButton
                    size="small"
                    onClick={() => {
                      // eslint-disable-next-line no-alert
                      if (window.confirm(`Delete "${asset.label}"? This cannot be undone.`)) {
                        run(() => deleteBrandAsset(asset.id), 'Deleted');
                      }
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Stack>

              {asset.notes && (
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                  {asset.notes}
                </Typography>
              )}
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
}
