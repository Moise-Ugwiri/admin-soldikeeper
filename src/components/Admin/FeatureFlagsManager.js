/**
 * FeatureFlagsManager — Admin UI matrix for the FeatureFlag collection.
 *
 * Wave B (Watchtower). Pairs with the admin CRUD API at
 *   /api/admin/feature-flags
 *
 * Behavior summary:
 *   - Table: rows = features, cols = [Free, Standard, Premium, Family, Business]
 *   - Sticky header + sticky first column
 *   - Filter dropdown (category) + search box (label / key)
 *   - Core flags: lock icon, switches disabled
 *   - Toggling OFF for any paid tier (standard/premium/family/business)
 *     opens a confirm dialog requiring "DISABLE" typed in
 *   - Toggling Free does NOT confirm
 *   - Optimistic UI: switch flips first, rolls back on error w/ snackbar
 *   - Right drawer shows last 5 audit entries with revert buttons
 *
 * MUI 7 syntax. No client-side feature gating — this is an admin-only page.
 */

import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  Box,
  Paper,
  Stack,
  Typography,
  TextField,
  InputAdornment,
  MenuItem,
  Switch,
  Chip,
  Tooltip,
  IconButton,
  CircularProgress,
  Alert,
  Snackbar,
  Drawer,
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Skeleton
} from '@mui/material';
import {
  Search as SearchIcon,
  Lock as LockIcon,
  Info as InfoIcon,
  History as HistoryIcon,
  Refresh as RefreshIcon,
  Restore as RestoreIcon,
  Close as CloseIcon
} from '@mui/icons-material';

import apiClient from '../../services/api';

const TIERS = [
  { key: 'free',     label: 'Free' },
  { key: 'standard', label: 'Standard' },
  { key: 'premium',  label: 'Premium' },
  { key: 'family',   label: 'Family' },
  { key: 'business', label: 'Business' }
];

const PAID_TIERS = new Set(['standard', 'premium', 'family', 'business']);

const CATEGORY_OPTIONS = [
  { value: 'all',      label: 'All categories' },
  { value: 'core',     label: 'Core' },
  { value: 'standard', label: 'Standard' },
  { value: 'premium',  label: 'Premium' },
  { value: 'family',   label: 'Family' },
  { value: 'business', label: 'Business' }
];

const CATEGORY_COLOR = {
  core: 'default',
  standard: 'info',
  premium: 'secondary',
  family: 'success',
  business: 'warning'
};

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function diffPerTier(before = {}, after = {}) {
  const keys = Array.from(new Set([...Object.keys(before), ...Object.keys(after)]));
  return keys
    .filter((k) => before[k] !== after[k])
    .map((k) => ({
      tier: k,
      from: !!before[k],
      to: !!after[k]
    }));
}

function formatDate(d) {
  if (!d) return '—';
  try {
    return new Date(d).toLocaleString();
  } catch {
    return String(d);
  }
}

/* -------------------------------------------------------------------------- */
/*  Component                                                                  */
/* -------------------------------------------------------------------------- */

const FeatureFlagsManager = () => {
  const [flags, setFlags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const [snackbar, setSnackbar] = useState(null); // { severity, message }
  const [savingKey, setSavingKey] = useState(null); // flag.key currently in flight

  // Confirm-dialog state for paid-tier disabling
  const [confirmDialog, setConfirmDialog] = useState(null);
  // shape: { flagKey, flagLabel, tier, tierLabel, currentValue, typed }

  // Audit drawer
  const [drawerFlagKey, setDrawerFlagKey] = useState(null);

  /* -------------------------- Data loading ------------------------------- */

  const fetchFlags = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await apiClient.get('/admin/feature-flags');
      if (!data?.success) throw new Error(data?.message || 'Failed to load feature flags');
      setFlags(data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load feature flags');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFlags();
  }, [fetchFlags]);

  /* -------------------------- Derived: filtered list --------------------- */

  const filteredFlags = useMemo(() => {
    const term = search.trim().toLowerCase();
    return flags.filter((f) => {
      if (categoryFilter !== 'all' && f.category !== categoryFilter) return false;
      if (!term) return true;
      const label = (f.label || '').toLowerCase();
      const key = (f.key || '').toLowerCase();
      return label.includes(term) || key.includes(term);
    });
  }, [flags, search, categoryFilter]);

  /* -------------------------- Mutations ---------------------------------- */

  const patchFlag = useCallback(
    async (flagKey, perTierEnabled, note) => {
      // Optimistic UI: update local state immediately, rollback on error.
      const prevFlags = flags;
      setFlags((curr) =>
        curr.map((f) =>
          f.key === flagKey
            ? {
                ...f,
                perTierEnabled: { ...(f.perTierEnabled || {}), ...perTierEnabled }
              }
            : f
        )
      );

      setSavingKey(flagKey);
      try {
        const { data } = await apiClient.patch(`/admin/feature-flags/${flagKey}`, {
          perTierEnabled,
          note
        });
        if (!data?.success) throw new Error(data?.message || 'Patch failed');
        // Replace with server's authoritative copy (includes new audit entry).
        setFlags((curr) => curr.map((f) => (f.key === flagKey ? data.data : f)));
        setSnackbar({ severity: 'success', message: `Updated "${flagKey}"` });
      } catch (err) {
        setFlags(prevFlags); // rollback
        setSnackbar({
          severity: 'error',
          message:
            err.response?.data?.message ||
            err.message ||
            'Failed to update flag — change reverted'
        });
      } finally {
        setSavingKey(null);
      }
    },
    [flags]
  );

  const revertEntry = useCallback(
    async (flagKey, auditEntry) => {
      const id = auditEntry._id || auditEntry.at;
      setSavingKey(flagKey);
      try {
        const { data } = await apiClient.post(`/admin/feature-flags/${flagKey}/revert`, {
          auditEntryId: id
        });
        if (!data?.success) throw new Error(data?.message || 'Revert failed');
        setFlags((curr) => curr.map((f) => (f.key === flagKey ? data.data : f)));
        setSnackbar({
          severity: 'success',
          message: `Reverted "${flagKey}" to ${formatDate(auditEntry.at)}`
        });
      } catch (err) {
        setSnackbar({
          severity: 'error',
          message: err.response?.data?.message || err.message || 'Revert failed'
        });
      } finally {
        setSavingKey(null);
      }
    },
    []
  );

  /* -------------------------- Toggle handler ----------------------------- */

  const handleToggle = useCallback(
    (flag, tier) => (event) => {
      const nextValue = event.target.checked;

      // Disabling a paid tier requires confirmation.
      if (nextValue === false && PAID_TIERS.has(tier)) {
        const tierLabel = TIERS.find((t) => t.key === tier)?.label || tier;
        setConfirmDialog({
          flagKey: flag.key,
          flagLabel: flag.label,
          tier,
          tierLabel,
          currentValue: nextValue,
          typed: ''
        });
        return;
      }

      patchFlag(flag.key, { [tier]: nextValue });
    },
    [patchFlag]
  );

  const confirmDisable = () => {
    if (!confirmDialog) return;
    if (confirmDialog.typed !== 'DISABLE') return;
    const { flagKey, tier, tierLabel } = confirmDialog;
    setConfirmDialog(null);
    patchFlag(flagKey, { [tier]: false }, `Disabled ${tierLabel} via admin matrix`);
  };

  /* -------------------------- Drawer flag -------------------------------- */

  const drawerFlag = useMemo(
    () => flags.find((f) => f.key === drawerFlagKey) || null,
    [flags, drawerFlagKey]
  );

  /* -------------------------- Render ------------------------------------- */

  return (
    <Box>
      {/* Header */}
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
        alignItems={{ xs: 'stretch', md: 'center' }}
        justifyContent="space-between"
        sx={{ mb: 2 }}
      >
        <Box>
          <Typography variant="h5" fontWeight={600}>
            Feature Flags
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Per-tier feature matrix. Changes take effect within ~60s (cache TTL).
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5} alignItems="center">
          <TextField
            size="small"
            placeholder="Search by label or key…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                )
              }
            }}
            sx={{ minWidth: 240 }}
          />
          <TextField
            select
            size="small"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            sx={{ minWidth: 180 }}
          >
            {CATEGORY_OPTIONS.map((c) => (
              <MenuItem key={c.value} value={c.value}>
                {c.label}
              </MenuItem>
            ))}
          </TextField>
          <Tooltip title="Refresh">
            <span>
              <IconButton onClick={fetchFlags} disabled={loading}>
                <RefreshIcon />
              </IconButton>
            </span>
          </Tooltip>
        </Stack>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Matrix table */}
      <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 'calc(100vh - 320px)' }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell
                  sx={{
                    position: 'sticky',
                    left: 0,
                    zIndex: 3,
                    bgcolor: 'background.paper',
                    minWidth: 320,
                    fontWeight: 600
                  }}
                >
                  Feature
                </TableCell>
                <TableCell sx={{ fontWeight: 600, minWidth: 110 }}>Category</TableCell>
                {TIERS.map((t) => (
                  <TableCell key={t.key} align="center" sx={{ fontWeight: 600, minWidth: 110 }}>
                    {t.label}
                  </TableCell>
                ))}
                <TableCell align="center" sx={{ fontWeight: 600, width: 64 }}>
                  Audit
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading && flags.length === 0 && (
                <>
                  {[0, 1, 2, 3, 4].map((i) => (
                    <TableRow key={`skeleton-${i}`}>
                      <TableCell
                        sx={{
                          position: 'sticky',
                          left: 0,
                          bgcolor: 'background.paper',
                          zIndex: 2
                        }}
                      >
                        <Skeleton width={220} />
                      </TableCell>
                      <TableCell><Skeleton width={70} /></TableCell>
                      {TIERS.map((t) => (
                        <TableCell key={t.key} align="center"><Skeleton width={40} /></TableCell>
                      ))}
                      <TableCell><Skeleton width={32} /></TableCell>
                    </TableRow>
                  ))}
                </>
              )}

              {!loading && filteredFlags.length === 0 && (
                <TableRow>
                  <TableCell colSpan={TIERS.length + 3} align="center" sx={{ py: 6 }}>
                    <Typography variant="body2" color="text.secondary">
                      No feature flags match the current filter.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}

              {filteredFlags.map((flag) => {
                const isCore = !!flag.isCore;
                const per = flag.perTierEnabled || {};
                const isSelected = drawerFlagKey === flag.key;

                return (
                  <TableRow
                    key={flag.key}
                    hover
                    selected={isSelected}
                    sx={{
                      cursor: 'pointer',
                      '& > .feature-cell': {
                        position: 'sticky',
                        left: 0,
                        bgcolor: isSelected ? 'action.selected' : 'background.paper',
                        zIndex: 1
                      }
                    }}
                    onClick={() => setDrawerFlagKey(flag.key)}
                  >
                    <TableCell className="feature-cell">
                      <Stack direction="row" alignItems="flex-start" spacing={1}>
                        {isCore && (
                          <Tooltip title="Core flag — always enabled, cannot be disabled">
                            <LockIcon
                              fontSize="small"
                              color="action"
                              sx={{ mt: 0.25 }}
                            />
                          </Tooltip>
                        )}
                        <Box sx={{ minWidth: 0 }}>
                          <Stack direction="row" spacing={0.5} alignItems="center">
                            <Typography variant="body2" fontWeight={600} noWrap>
                              {flag.label || flag.key}
                            </Typography>
                            {flag.description && (
                              <Tooltip title={flag.description} arrow>
                                <InfoIcon
                                  fontSize="inherit"
                                  sx={{ color: 'text.secondary', fontSize: 14 }}
                                />
                              </Tooltip>
                            )}
                          </Stack>
                          <Typography
                            variant="caption"
                            sx={{
                              fontFamily: 'monospace',
                              color: 'text.secondary',
                              display: 'block',
                              wordBreak: 'break-all'
                            }}
                          >
                            {flag.key}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>

                    <TableCell>
                      <Chip
                        size="small"
                        label={flag.category || 'core'}
                        color={CATEGORY_COLOR[flag.category] || 'default'}
                        variant="outlined"
                      />
                    </TableCell>

                    {TIERS.map((t) => {
                      const checked = per[t.key] === true;
                      const disabled = isCore || savingKey === flag.key;
                      return (
                        <TableCell key={t.key} align="center" onClick={(e) => e.stopPropagation()}>
                          <Switch
                            size="small"
                            checked={checked}
                            disabled={disabled}
                            onChange={handleToggle(flag, t.key)}
                            inputProps={{
                              'aria-label': `${flag.key} for ${t.label}`
                            }}
                          />
                        </TableCell>
                      );
                    })}

                    <TableCell align="center" onClick={(e) => e.stopPropagation()}>
                      <Tooltip title="View audit log">
                        <IconButton size="small" onClick={() => setDrawerFlagKey(flag.key)}>
                          <HistoryIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>

        {loading && flags.length > 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <CircularProgress size={20} />
          </Box>
        )}
      </Paper>

      {/* ----------- Confirm dialog: disabling a paid tier ----------- */}
      <Dialog
        open={!!confirmDialog}
        onClose={() => setConfirmDialog(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Disable feature for paying customers?</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            This will immediately revoke access to{' '}
            <strong>{confirmDialog?.flagLabel || confirmDialog?.flagKey}</strong>{' '}
            for all paying customers on the{' '}
            <strong>{confirmDialog?.tierLabel}</strong> plan. They may file refund
            requests.
          </DialogContentText>
          <DialogContentText sx={{ mb: 1 }}>
            Type <strong>DISABLE</strong> to confirm:
          </DialogContentText>
          <TextField
            autoFocus
            fullWidth
            size="small"
            value={confirmDialog?.typed || ''}
            onChange={(e) =>
              setConfirmDialog((d) => (d ? { ...d, typed: e.target.value } : d))
            }
            placeholder="DISABLE"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog(null)}>Cancel</Button>
          <Button
            color="error"
            variant="contained"
            disabled={confirmDialog?.typed !== 'DISABLE'}
            onClick={confirmDisable}
          >
            Disable
          </Button>
        </DialogActions>
      </Dialog>

      {/* ----------- Audit drawer ----------- */}
      <Drawer
        anchor="right"
        open={!!drawerFlagKey}
        onClose={() => setDrawerFlagKey(null)}
        slotProps={{
          paper: { sx: { width: { xs: '100%', sm: 460 } } }
        }}
      >
        {drawerFlag && (
          <Box sx={{ p: 2.5, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{ mb: 1 }}
            >
              <Typography variant="h6" fontWeight={600}>
                Audit log
              </Typography>
              <IconButton onClick={() => setDrawerFlagKey(null)} size="small">
                <CloseIcon />
              </IconButton>
            </Stack>

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" fontWeight={600}>
                {drawerFlag.label}
              </Typography>
              <Typography
                variant="caption"
                sx={{ fontFamily: 'monospace', color: 'text.secondary' }}
              >
                {drawerFlag.key}
              </Typography>
              {drawerFlag.description && (
                <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
                  {drawerFlag.description}
                </Typography>
              )}
            </Box>
            <Divider sx={{ mb: 2 }} />

            <Box sx={{ flex: 1, overflowY: 'auto' }}>
              {(() => {
                const entries = (drawerFlag.auditLog || []).slice().reverse().slice(0, 5);
                if (entries.length === 0) {
                  return (
                    <Typography variant="body2" color="text.secondary">
                      No audit entries yet.
                    </Typography>
                  );
                }
                return (
                  <Stack spacing={2}>
                    {entries.map((entry, idx) => {
                      const diffs = diffPerTier(entry.before, entry.after);
                      return (
                        <Paper
                          key={(entry._id || entry.at || idx).toString()}
                          variant="outlined"
                          sx={{ p: 1.5 }}
                        >
                          <Stack
                            direction="row"
                            justifyContent="space-between"
                            alignItems="flex-start"
                            sx={{ mb: 0.5 }}
                          >
                            <Box>
                              <Typography variant="body2" fontWeight={600}>
                                {formatDate(entry.at)}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ display: 'block' }}
                              >
                                {entry.actorEmail || 'system'}
                              </Typography>
                            </Box>
                            <Tooltip
                              title={
                                drawerFlag.isCore
                                  ? 'Cannot revert a core flag'
                                  : 'Revert to this state'
                              }
                            >
                              <span>
                                <Button
                                  size="small"
                                  startIcon={<RestoreIcon />}
                                  disabled={
                                    drawerFlag.isCore || savingKey === drawerFlag.key
                                  }
                                  onClick={() => revertEntry(drawerFlag.key, entry)}
                                >
                                  Revert
                                </Button>
                              </span>
                            </Tooltip>
                          </Stack>

                          {entry.note && (
                            <Typography
                              variant="caption"
                              sx={{ display: 'block', mb: 1, fontStyle: 'italic' }}
                            >
                              “{entry.note}”
                            </Typography>
                          )}

                          {diffs.length === 0 ? (
                            <Typography variant="caption" color="text.secondary">
                              No tier changes recorded.
                            </Typography>
                          ) : (
                            <Stack spacing={0.5}>
                              {diffs.map((d) => (
                                <Stack
                                  key={d.tier}
                                  direction="row"
                                  spacing={1}
                                  alignItems="center"
                                >
                                  <Chip
                                    size="small"
                                    label={
                                      TIERS.find((t) => t.key === d.tier)?.label || d.tier
                                    }
                                    variant="outlined"
                                  />
                                  <Chip
                                    size="small"
                                    label={d.from ? 'on' : 'off'}
                                    color={d.from ? 'success' : 'default'}
                                  />
                                  <Typography variant="caption">→</Typography>
                                  <Chip
                                    size="small"
                                    label={d.to ? 'on' : 'off'}
                                    color={d.to ? 'success' : 'default'}
                                  />
                                </Stack>
                              ))}
                            </Stack>
                          )}
                        </Paper>
                      );
                    })}
                  </Stack>
                );
              })()}
            </Box>
          </Box>
        )}
      </Drawer>

      <Snackbar
        open={!!snackbar}
        autoHideDuration={5000}
        onClose={() => setSnackbar(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        {snackbar ? (
          <Alert
            onClose={() => setSnackbar(null)}
            severity={snackbar.severity}
            variant="filled"
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        ) : undefined}
      </Snackbar>
    </Box>
  );
};

export default FeatureFlagsManager;
